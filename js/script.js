// Scroll.js

$(document).ready(function(){
	$('a[href^="#"]').on('click',function (e) {
	    e.preventDefault();

	    var target = this.hash,
	    $target = $(target);

	    $('html, body').stop().animate({
	        'scrollTop': $target.offset().top
	    }, 1000, 'swing', function () {
	        window.location.hash = target;
	    });
	});
});

$(window).resize(function(){
	// resize youtube video
	if($('#resize_youtube_video').size()>0){
		resize_youtube_video("resize_youtube_video");
	}
	// set sec with tabs minimal height
	AutoMinHeight();
	// move blocks on different screen sizes
	init_device_move();
});

// resize youtube video

function resize_youtube_video(parent_block_id){
	var width = $('#'+parent_block_id).width();
	var height = width*0.5625; //   720/1280 = 0.5625
	$('#'+parent_block_id).find('iframe').width(width).height(height);
}

if($('#resize_youtube_video').size()>0){
		resize_youtube_video("resize_youtube_video");
	}
	
// Open menu in desktop version

$('#OpenDesktopMenu, .desktop_menu_close').click(function(){
	var navigation_to_open = $('.desktop_menu').attr('data-open');
	if($('.desktop_menu').hasClass('opened')){
		$('.desktop_menu').removeClass('opened');
	}else{
		$('.desktop_menu').addClass('opened');
	}
	
});

// Close menu in desktop version{

$(document).click(function (e) {
    var menu = $(".desktop_menu");
	if (menu.has(e.target).length === 0 && e.target.id!='desktop_menu' && e.target.id!='OpenDesktopMenu'){
		$(menu).removeClass('opened');
    }
});

// Open menu in mobile version

$('.mobile_menu, .mobile_menu_close').click(function(){
	var navigation_to_open = $('.mobile_menu').attr('data-open');
	if($('.'+navigation_to_open).hasClass('opened')){
		$('.'+navigation_to_open).removeClass('opened');
		$('.mobile_menu').removeClass('opened');
	}else{
		$('.'+navigation_to_open).addClass('opened');
		$('.mobile_menu').addClass('opened');
	}
	
});

// Close menu in mobile version{

$(document).click(function (e) {
    var menu = $("nav");
	if (menu.has(e.target).length === 0 && e.target.id!='nav' && e.target.id!='mobile_menu'){
		$(menu).removeClass('opened');
		$('.mobile_menu').removeClass('opened');
    }
});

// function for moving blocks into different places of DOM on different screen sizes

	function device_move(device){
		$('.device-move').each(function(){
			var move_to = $(this).attr('data-'+device+'MoveTo');
			console.log(move_to);
			if($('.'+move_to).length>0){
				$(this).remove();
				$('.'+move_to).html($(this));
			}
		});
	}
	
	function init_device_move(){
		var screenWidth=$(window).width();
		
		if(screenWidth<1170){
			device_move('mobile');
		}
		if(screenWidth>=1170){
			device_move('desktop');
		}
	}

	init_device_move();


// sec5_1 slider

if($('.sec5_1').size()>0){
	$('.sec5_1_slider ul').bxSlider({pagerCustom: '#sec5_1_pager', startSlide:1,});
}

// Play video

$('.sec6_2_video_play').click(function(){
	$(this).fadeOut(200);
	var video=$(this).parent().find('video').get(0);
	video.play();
	video.controls = true;
	video.onended = function() {
		$('.sec6_2_video_play').fadeIn(200);
	};
});

// sec6_2 slider

if($('.sec6_2').size()>0){
	var slider = $('.sec6_2_slider ul').bxSlider({pager:false,controls:false});
}

function goToSlide(slide){
	slider.goToSlide(slide);
}

function darken_block(eq){
	$('.sec6_2_block').removeClass('dark');
	$('.sec6_2_block:eq('+eq+')').addClass('dark');
};

// sec5_3 slider

if($('.sec5_3').size()>0){
	$('.sec5_3_slider ul').bxSlider({pager: false});
}

// play video in header 5 background


	var header5_start_height = 0;
	var video_container = '';

	$('.header5_play').click(function(){
		video_container = $(this).attr('data-container-id');
		header5_start_height = $('#'+video_container).outerHeight();
		var windowHeight=$(window).height();
		var windowWidth=$(window).width();
		$('#'+video_container).animate({height:windowHeight},300);
		$('#'+video_container+' .container, .nav5').fadeOut(300);
		$('#'+video_container+' .video').height(windowHeight).width(windowWidth).fadeIn(300);
		$('#'+video_container+' video').height(windowHeight).width(windowWidth).get(0).play();
		// check if device is mobile in portrait orientetion
		if(windowWidth<=windowHeight){
			var koeff = $('#'+video_container+' video').get(0).videoWidth/windowWidth;
			var height = $('#'+video_container+' video').get(0).videoHeight/koeff;
			$('#'+video_container).animate({height:height},300);
			$('#'+video_container+' .video').height(height).width(windowWidth).fadeIn(300);
			$('#'+video_container+' video').height(height).width(windowWidth).get(0).play();
		}
	});
	$('.header5_pause').click(function(){
		$('#'+video_container).animate({height:header5_start_height},300);
		$('#'+video_container+' .container, .nav5').fadeIn(300);
		$('#'+video_container+' .video').fadeOut(300);
		$('#'+video_container+' video').get(0).pause();
	});



// sec2_5 slider

if($('.sec2_5').size()>0){
	$('.sec2_5_slider ul').bxSlider();
}

// sec3_5 tabs

$('.opening_tabs .title').click(function(){
	var height=$(this).next().find('div').outerHeight(true);
	$('.opening_tabs .text').animate({height:0},300,'linear');
	if($(this).next().height()>0){
		$(this).next().animate({height:0},300,'linear');
		$(this).removeClass('opened');
	}else{
		$(this).next().animate({height:height},300,'linear');
		$('.opening_tabs .title').removeClass('opened');
		$(this).addClass('opened');
	}
	
});

// set sec with tabs minimal height

function AutoMinHeight(){
	if($('.AutoMinHeight').size()>0){
		var height = $('.AutoMinHeight').outerHeight();
		$('.AutoMinHeight').css('min-height',height);
	}
}

AutoMinHeight();

// sec3_6 - open video popup

$('.sec3_6_block a').click(function(){
	var video_source = $(this).attr('data-video');
	if(video_source!=''){
		$('.sec3_6_popup video').get(0).src = video_source;
		$('.sec3_6_popup video').get(0).play();
		$('.sec3_6_popup').css('width','100%').animate({opacity:1},300);
	}
});

$('.sec3_6_popup .close').click(function(){
	$('.sec3_6_popup video').get(0).pause();
	$('.sec3_6_popup').animate({opacity:1},300).animate({width:0},300);
});

// sec4_6 slider

$('.switch a').click(function(){
	$('.switch a').removeClass('active');
	$(this).addClass('active');
});

if($('.sec4_6').size()>0){
	var slider = $('.sec4_6_slider ul').bxSlider({pager:false,controls:false,mode:'fade'});
}

// sec7_7 slider

if($('.sec7_7').size()>0){
	$('.sec7_7_slider ul').bxSlider({controls:false});
}

// sec6_8 slider

if($('.sec6_8').size()>0){
	var slider = $('.sec6_8_slider ul').bxSlider({pager:false,controls:false,mode:'fade'});
}

// sec2_9 slider

if($('.sec2_9').size()>0){
	var slider = $('.sec2_9_slider ul').bxSlider({pager:false,controls:false,mode:'fade'});
}

// Change video by click on link in section 5 landing 10

$('.sec5_10_menu a').click(function(){
	var video = $(this).attr('data-video-url');
	var poster = $(this).attr('data-poster');
	$('.sec5_10 video').attr('poster',poster);
	$('.sec5_10 video source').attr('src',video);
	$('.sec5_10 video').get(0).load();
	$('.sec5_10 .sec6_2_video_play').fadeIn(200);
	$('.sec5_10_menu a').removeClass('active');
	$(this).addClass('active');
});

// NanoScroller initialization

if($('.nano').size()>0){
	$(".nano").nanoScroller({ alwaysVisible: true });
}

// header11 slider

if($('.header11_slider').size()>0){
	$('.header11_slider ul').bxSlider({controls:false, mode:'fade'});
}

// Function to add shadow to form, when user clicks to input inside it

function focusForm(formID,focused){
	if(focused){
		$('#'+formID).addClass('focused');
	}else{
		$('#'+formID).removeClass('focused');
	}
}

// sec2_12 slider

if($('.sec2_12').size()>0){
	var slider = $('.sec2_12_slider ul').bxSlider({pager:false});
}

// sec5_12 slider

if($('.sec5_12').size()>0){
	var slider = $('.sec5_12_slider ul').bxSlider({pager:true,controls:false});
	$('.sec5_12_slider .bx-pager a').click(function(){
		var index=parseInt($(this).attr('data-slide-index'));
		$('.sec5_12 .sec6_2_blocks_holder .sec6_2_block').removeClass('dark');
		$('.sec5_12 .sec6_2_blocks_holder .sec6_2_block:eq('+index+')').addClass('dark');
	});
}

// sec4_13 slider

if($('.sec4_13_slider').size()>0){
	$('.sec4_13_slider ul').bxSlider({pager:false, minSlides:1, maxSlides:5, slideWidth:220});
}

// sec7_13 slider

if($('.sec7_13').size()>0){
	var slider = $('.sec7_13_slider ul').bxSlider({pager:false,controls:false,mode:'fade'});
}

// Open/close popups on sec1_15

$('.sec1_15_holder .plus').click(function(){
	var popup_to_open = $(this).attr('data-open');
	$('.sec1_15_popup').fadeOut(300);
	$('.'+popup_to_open).fadeIn(300);
});

$('.sec1_15_popup .close').click(function(){
	$('.sec1_15_popup').fadeOut(300);
});

// open videos in popups on sec5_15

$('.sec5_15_block .video').click(function(){
	var video_src = $(this).attr('data-video');
	var video=$('.sec5_15_popup').find('video').get(0);
	video.src = video_src;
	video.load();
	video.play();
	video.controls = true;
	$('.sec5_15_popup').fadeIn(300);
});

$('.sec5_15_popup .close').click(function(){
	close_sec5_15_popup();
});

if($('.sec5_15').size()>0){
	$(document).keyup(function(e) {
	  if (e.keyCode === 27) {close_sec5_15_popup();}   // esc
	});
}

function close_sec5_15_popup(){
	var video=$('.sec5_15_popup').find('video').get(0);
	video.pause();
	$('.sec5_15_popup').fadeOut(300);
}

// sec7_15 slider

if($('.sec7_15').size()>0){
	var slider = $('.sec7_15_slider ul').bxSlider({pager:false,controls:false,mode:'fade'});
}

// Input type number arrows up and down

$('.input_number .up,.input_number .down').click(function(){
	var input=$(this).parent().find('input');
	var min=parseInt(input.attr('min'));
	var max=parseInt(input.attr('max'));
	var now=parseInt(input.attr('value'));
	if($(this).hasClass('up') && now<max){
		input.attr('value',now+1);
	}
	if($(this).hasClass('down') && now>min){
		input.attr('value',now-1);
	}
});

// sec6_16_popup

$('.sec6_16_row a').click(function(){
	var url = $(this).attr('data-url');
	$('.sec6_16_popup .frame img').attr('src',url);
	$('.sec6_16_popup').fadeIn(300);
});

$('.sec6_16_popup .close, .sec6_16_popup_closing_layer').click(function(){
	$('.sec6_16_popup').fadeOut(300);
});

// sec3_17 slider

if($('.sec3_17_slider').size()>0){
	$('.sec3_17_slider ul').bxSlider({pager:true, controls:true, mode:'fade'});
}

// sec7_17 FAQ

$('.faq .question').click(function(){
	var height=$(this).next().find('.text_inner').outerHeight(true);
	$('.faq .text').animate({height:0},300,'linear');
	if($(this).next().height()>0){
		$(this).next().animate({height:0},300,'linear');
		$(this).parent().removeClass('opened');
	}else{
		$(this).next().animate({height:height},300,'linear');
		$('.faq').removeClass('opened');
		$(this).parent().addClass('opened');
	}
	
});

if($('.faq.opened .text').size()>0){
	var padding=parseInt($('.faq .text_inner').css('padding-top').slice(0,-2));
	var height=$('.faq.opened').find('.text_inner').outerHeight(true)+padding;	
	$('.faq.opened .text').height(height);
	AutoMinHeight();
}

// sec3_18_slider

if($('.sec3_18').size()>0){
	var slider = $('.sec3_18_slider ul').bxSlider({pager:false,controls:false, mode:'fade'});
}

// sec8_18 slider

if($('.sec8_18_slider').size()>0){
	if($(window).width()>1170){
		$('.sec8_18_slider ul').bxSlider({controls:true,pager:false, minSlides:1, maxSlides:2, slideWidth:470, slideMargin:30});
	}
	if($(window).width()<=1170){
		$('.sec8_18_slider ul').bxSlider({controls:true,pager:false});
	}
}

// Open|close popups in footer 20

$('.footer20_map .point').click(function(){
	var popup_to_open = $(this).attr('data-open');
	popup_to_open = $('.'+popup_to_open);
	if(popup_to_open.hasClass('opened')===false){
		popup_to_open.addClass('opened');
	}else{
		popup_to_open.removeClass('opened');
	}
});