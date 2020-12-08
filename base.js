$(function() {
	try {
		toastr.options.timeOut = 60000;
		toastr.options.closeDuration = 300;
		toastr.options.positionClass = "toast-bottom-left";
	} catch (e) {
		hasToastr = false;
	}
	
	close_popups();
	
	$(".keypad td button").click(function(e) {
		var target = $(this).closest(".keypad").data("target");
		var limit = $(target).attr("maxlength");
		
		if(hasHowl)
			ui_tap.play();
		
		if($(this).text() == "C" && !$(this).hasClass("letter")) {
			$(target).val("");
		}else{
			if($(target).val().length >= 23) {
				$(target).fadeTo(50, 0.3, function() { $(this).fadeTo(400, 1.0); });
			}else{
				$(target).val($(target).val()+$(this).text());
			}
			
		}
		e.stopImmediatePropagation();
	});
	
	$( ".keypad input" ).keydown(function( event ) {
		event.preventDefault();
		if(event.keyCode == 8) {
			$(this).val("");
			return;
		}
		var target = $(this).closest(".keypad");
		var button = target.find('button:contains("'+event.key+'")');
		button.addClass("active");
		if(hasHowl)
			ui_tap.play();
	});
	
	$( ".keypad input" ).keyup(function( event ) {
		if(event.keyCode == 8) {
			$(this).val("");
			return;
		}
		
		var target = $(this).closest(".keypad");
		var button = target.find('button:contains("'+event.key+'")');
		if(button.length) {
			$(this).val($(this).val()+event.key);
			button.removeClass("active");
		}
		
	});
	
	$(".tab-buttons button").click(function() {
		$(".tab-buttons button").removeClass("active");
		$(this).addClass("active");
		$(".tabcontent").hide();
		$(".tabcontent"+$(this).data("target")).show();
		$(".tabcontent"+$(this).data("target")).find(typeSelector).each(startType);
	});
	
	$(".tab-buttons button[active]").click();
	
	$("[data-toggle=popup]").click(function() {
		open_popup($(this).data("target"));
	});

	$("button, input[type=checkbox], input[type=radio]").click(function() {
		if(hasHowl)
			ui_select.play();
	});
	
	$("body").on("click", ".cover", function() {
		close_popups();
	});
	
	$(".close").click(function() {
		var popup = $(this).closest(".popup");
		close_popups();
	});
	
	randomAnimation();
	
	$(typeSelector).each(startType);
	
	try {
		$('.circle[data-value]').each(function(i, e) {
			var color = $(this).find(".value").css("color");
			$(this).circleProgress({
				size: 82,
				thickness: 3,
				fill: color
			});
		});
		
	} catch (e) {
		hasCircleProgress = false;
	}
	
	$(window).on("beforeunload", function() {
		$("body").addClass("leaving");
	});
	
	$(".uploader input").on("change", function() {
		$(".file[for="+$(this).attr("id")+"]").text(this.files[0].name);
	});
	
	if( !$(".cover").length )
		$("body").append('<div class="cover"></div>');
	
});

var typeDelay = 50;
var typeSelector = "[type=''], .type, .heading:not(.notype), .title:not(.notype)";

var hasHowl = true;
var hasCircleProgress = true;
var hasToastr = true;

var ui_select, ui_tap;

try {
  ui_select = new Howl({
		src: ['audio/ui_select.wav'],
		volume: 0//.5
	});
	ui_tap = new Howl({
		src: ['audio/ui_tap.wav']
	});
} catch(e) {
  hasHowl = false;
}

function startType(i, e) {
	e = $(e);
	if(e.data("cont") === undefined) {
		e.data("cont", e.text());
		e.data("conthtml", e.html());
	}
	e.text("\xa0");
	
	setTimeout(addCharacter, typeDelay, e);
}

function addCharacter(e) {
	e = $(e);
	current = e.text().replace("\xa0","");
	final = e.data("cont");
	left = final.replace(current, "");
	addon = left.charAt(0);
	
	if(addon.length > 0) {
		e.text(current+addon);
		if(e.hasClass("fast")) {
			setTimeout(addCharacter, typeDelay/2, e);
		}else{
			if(e.hasClass("slow")) {
				setTimeout(addCharacter, typeDelay*2, e);
			}else{
				setTimeout(addCharacter, typeDelay, e);
			}
		}
	}else{
		e.html(e.data("conthtml"));
	}
}

function randomAnimation() {
	$(".panel").removeClass("shown");
	var them = $(".panel");
	
  for (var i = 0; i < them.length; i++) {
  	time = randomNumber(0, 500);
    setTimeout(showHim, time, them[i]);
    
  }
}

function showHim(them) {
	$(them).addClass("shown");
}

function randomNumber(min, max, floor = true) {
	if(floor) {
		return Math.floor(Math.random() * (max - min) + min);
	}else{
		return Math.random() * (max - min) + min;
	}
}

function open_popup(target) {
	$(target).show();
	$(target).find(typeSelector).each(startType);
	$(".cover").addClass("show");
}

function close_popups() {
	$(".popup").hide();
	$(".cover").removeClass("show");
}
