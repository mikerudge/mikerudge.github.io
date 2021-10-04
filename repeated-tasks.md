# How we handle repeated tasks using event bridge and AWS Lambda

It is a classic getting started challenge to build a simple todo app, however, modern todo apps have some more advanced functionality that can be tricky to implement correctly. One example of that extra feature is repeated tasks. Repeated tasks allow users to set an interval (daily, weekly, monthly etc) and have the task automatically repeat itself on that interval.

This blog post shows a simple(ish) way of handling repeated tasks using AWS EventBridge and AWS Lambda.

## The user story

“I want to setup a task once and have it repeat on a schedule”

Let’s begin with the actual problem we are trying to solve. Users create a task and enter all the details, including a title, description, assignee, attachments etc. They want to do this task once a week, starting next Monday. They don’t want to re create this task each week with all the same details, instead they should be able to set it up once, and for our app to do the boring stuff.

Users should be able to see a history of who completed each task each week and also be able to update the task at any point.

## The overly complicated solution

So when I first started thinking about this problem I jumped to figuring out how I was going to manage a schedule of tasks. CRON job every few minutes? Seems like a waste of resource most of the time having a lambda call a database every few minutes.

Managing some kind of queue that holds onto what tasks need to be created and when. How would I query this queue and let users change it.. sounds like a lot..

As the title says I was over complicating it!

## The simpler solution

Let's start at the end, the actual solution we came up with is pretty simple really (which always feels good).

All we need to do is, when a user completes a task, we simply duplicate that task and set the due date to the correct date in the future. Nothing crazy going on.

The simplicity of this solution actually solves a few edge cases as well.

### What if the users changes the schedule?

No problem, we only care each time the task is complete, no updating a scheduler or CRON job or anything like it.

### What if the user doesn't complete the task?

The next task that is created will always be created based on the due date and the schedule. So for example, if they had a daily task, and missed a few days, once they complete Mondays task, Tuesdays would be created, then Wednesday etc. However, if they have missed a whole bunch of days and want to start the schedule again from today, they can simply change the due date to today's date, and the schedule will start again. Easy!

### What if the task needs updating?

Maybe the task has links in it and they need to changed for future tasks, again no problem, whatever is changed on the task will be honoured because we are just duplicating the task that has been complete.

## The Schema

Let’s start with roughly what a task looks like.

```typescript
type TASK = {
    id: string
    title: string
    description: string
    completedAt: Date
    createdAt: Date
    updatedAt: Date
    ...
}
```

Pretty standard stuff so far.

To be able to handle the repeated tasks we need to know the schedule the user would like the repeat to happen so lets add in an enum to the todo.

```typescript
enum SCHEDULE {
    DAILY
    WEEKLY
    MONTHLY
    YEARLY
}

type TASK = {
...
repeat?: SCHEDULE
repeatEnd?: Date
}
```

We also added in `repeatEnd` so that the user can specify a date in which the task should stop repeating.

## [AWS Eventbridge](https://aws.amazon.com/eventbridge)

### So I need to manage an eventbus? isn't this overkill?

So why don't we just create a new task and the same time as completing the previous task? Well that is a totally valid way of doing things, and if setting up eventbuses isn't right for you, don't go down this route. However, there are so many advantages of having a loosely coupled system, for example lets say later on we want to send a notification when a task is complete. Or how about tell another part of your app that the task is complete? The task complete handler doesn't need to know or handle any of this, it can simply let the eventbus know which task was just complete.

### Show me the ways!

To be able to duplicate the task, we need to listen out for anytime a task is completed and also have a `repeat` on it. To do this we can create a rule with an event pattern that looks something like...

```typescript
const taskCompletedRule = new event.Rule(this, "task.completed", {
	ruleName: "task.completed.repeated",
	eventBus: taskBus,
	description: "A repeated task completed status was changed",
	eventPattern: {
		detail: {
			operationType: ["update"],
			fullDocument: {
				completedAt: [{ exists: true }],
				repeat: [{ exists: true }],
			},
		},
	},
})
```

Your `detail` will vary based on how you are sending the event to Evenbridge. In this example we are taking advantage of [MongoDB triggers](https://www.mongodb.com/features/database-triggers) to put the event onto Eventbridge, however the important part is using the `exists` keyword to find if both `repeat` and `completedAt` exist when a task has been updated.

### Bring on the code!

Ok ok ok we are almost there, one more bit of setup, lets create a lambda function and attach it to the rule we just created. Using the CDK this is fairly straight forward.

```typescript
const taskCreatedFn = new lambda.NodejsFunction(
	this,
	"tasks-completed-listener",
	{
		entry: `taskCompleted/taskCompleted.ts`,
		handler: "taskCompletedHandler",
		environment: {
			API_URL: api.graphqlUrl,
		},
	}
)

taskCompletedRule.addTarget(new targets.LambdaFunction(taskCreatedFn))
```

And just like that we have a lambda function attached to our rule.

_PRO TIP: if you are using typescript, check out the [aws-lambda](https://github.com/DefinitelyTyped/DefinitelyTyped/tree/master/types/aws-lambda) package that offers types for all sorts of events you get from aws._

```typescript
// taskCompleted.ts
import { EventBridgeHandler } from "aws-lambda"

export const taskCompletedHandler: EventBridgeHandler<
	"task.completed",
	MongoEvent<Task>,
	Result
> = async (event) => {
	// Code to handle th event and duplicate the task
}
```

So we are going to do three major things in this function.

1. Calculate the interval for the new task
2. Make sure we honour the `repeatEnd`
3. Create a new task that has most of the properties of the old one.

Lets start at the top. Calculate the interval to next task.

```typescript
import dayjs, { Dayjs } from "dayjs"

export const calculateInterval = (
	repeat: TaskRepeatOption,
	date?: Date | null | undefined
): Date => {
	let dueDate: Dayjs

	switch (repeat) {
		case "DAILY":
			dueDate = dayjs(date).add(1, "day")
			break
		case "WEEKLY":
			dueDate = dayjs(date).add(1, "week")
			break

		case "MONTHLY":
			dueDate = dayjs(date).add(1, "month")
			break

		case "YEARLY":
			dueDate = dayjs(date).add(1, "year")
			break

		default:
			dueDate = dayjs(date)
			break
	}
	// Convert it back to standard javascript date
	return dueDate.startOf("day").toDate()
}
```

Sweet! that's it, nice and easy thanks to [dayjs](https://day.js.org). However, we are going to do a quick aside here. I have been practising using objects instead of if statements and switch statements like this. So lets see what that looks like if we refactor it.

```typescript
// Refactored to use an object instead of a switch

type TaskObject = {
	[K in TaskRepeatOption]: "day" | "week" | "month" | "year"
}

export const calculateInterval = (
	repeat: TaskRepeatOption,
	date?: Date | null | undefined
): Date => {
	const dateMap: TaskObject = {
		[TaskRepeatOption.Daily]: "day",
		[TaskRepeatOption.Weekly]: "week",
		[TaskRepeatOption.Monthly]: "month",
		[TaskRepeatOption.Yearly]: "year",
	}

	return dayjs(date).add(1, dateMap[repeat]).startOf("day").toDate()
}
```

I still start with writing switch and if statements but I do really like refactoring to objects like this. What do you think?

**ANNNWAYYY**.. lets continue.

The next part is make sure we are honouring the `endDate` of the repeat if there is one.

```typescript
export const adjustRepeatEnd = (
	repeatEnd: Date | null | undefined,
	repeat: TaskRepeatOption
): TaskRepeatOption | null => {
	if (repeatEnd) {
		const tomorrow = dayjs().add(1, "day").startOf("day")
		const isBeforeTomorrow = dayjs(repeatEnd).isBefore(tomorrow, "day")

		if (isBeforeTomorrow) {
			// set the repeat to null so no more tasks are created
			return null
		} else {
			// Continue duplicating tasks on this schedule
			return repeat
		}
	}
	// Continue duplicating tasks on this schedule
	return repeat
}
```

I am going to leave the create task mostly up to you as that all depends on what database / API you are using. However, I will say that you don't actually want to duplicate the whole previous task as it would contain a `completedAt` field and probably a lot of other metadata you don't want in the new task. A clean way to remove a bunch of fields is to use `lodash/omit` like this

```typescript
import omit from "lodash/omit"

export const removeProperties = (task: Task) =>
	omit(task, [
		"_id",
		"id",
		"createdAt",
		"updatedAt",
		"completedAt",
		"completedBy",
		"deletedAt",
		"ref",
	])
```

PRO TIP: if you are only going to use the omit function from lodash you can install it like this `yarn add lodash.omit`

How cool is that!

Lets put it together...

```typescript
// Get the correct nextDueDate
const nextDueDate = calculateInterval(repeat, doc.dueDate)

// Check if we need to nullify the repeated because of the `repeatEnd`
const adjustedRepeat = adjustRepeatEnd(doc.repeatEnd, repeat)

const newTask: Task = {
	...doc,
	dueDate: nextDueDate,
	repeat: adjustedRepeat,
}
try {
	// Create the task in the database
	const finalTask = await createTask(newTask)
} catch (error) {
	// Handle errors
}
```

## PHEW! Coffee?

Let me tell you about our sponsors ... kidding, kidding... this blog is mining for bitcoin so don't even worry about it!

Would love to hear your feedback on this. Was it obvious to you that this was the solution? Or did you start by over complicating the whole thing like I did. Either way be good to hear if you implemented something like this, and what your experience was!
