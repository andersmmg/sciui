jQuery.fn.extend({
    silenced: function () {
        if ($(this).hasClass('silent'))
            return true
        if ($(this).parents().hasClass('silent'))
            return true
        return false
    }
});

$(function () {
    try {
        toastr.options.timeOut = 10000; // 10 seconds
        toastr.options.closeDuration = 300;
        toastr.options.positionClass = "toast-bottom-left";
    } catch (e) {
        hasToastr = false;
    }

    close_popups();

    $(".keypad td button").click(function (e) {
        var target = $(this).closest(".keypad").data("target");
        var limit = $(target).attr("maxlength");

        if (options.audio && options.play_keypad && !$(this).silenced())
            sfx_keypad_tap.play();

        if ($(this).text() == "C" && !$(this).hasClass("letter")) {
            $(target).val("");
        } else {
            if ($(target).val().length >= 23) {
                $(target).fadeTo(50, 0.3, function () {
                    $(this).fadeTo(400, 1.0);
                });
            } else {
                $(target).val($(target).val() + $(this).text());
            }

        }
        e.stopImmediatePropagation();
    });

    $(".input input, .input textarea").on("input", function (event) {
        if (options.audio && options.play_form_type && !$(this).silenced())
            sfx_form_type.play();
    });

    $(".keypad input").keydown(function (event) {
        event.preventDefault();
        if (event.keyCode == 8) {
            $(this).val("");
            return;
        }
        var target = $(this).closest(".keypad");
        var button = target.find('button:contains("' + event.key + '")');
        button.addClass("active");
        if (options.audio && options.play_keypad)
            sfx_keypad_tap.play();
    });

    $(".keypad input").keyup(function (event) {
        if (event.keyCode == 8) {
            $(this).val("");
            return;
        }

        var target = $(this).closest(".keypad");
        var button = target.find('button:contains("' + event.key + '")');
        if (button.length) {
            $(this).val($(this).val() + event.key);
            button.removeClass("active");
        }

    });

    $(".tab-buttons button").click(function () {
        $(".tab-buttons button").removeClass("active");
        $(this).addClass("active");
        $(".tabcontent").hide();
        $(".tabcontent" + $(this).data("target")).show();
        $(".tabcontent" + $(this).data("target")).find(typeSelector).each(startType);
    });

    $(".tab-buttons button[active]").click();

    $("[data-toggle=popup]").click(function () {
        open_popup($(this).data("target"));
    });

    $(".button, input[type=checkbox], input[type=radio]").click(function () {
        if (options.audio && options.play_button && !$(this).silenced())
            sfx_button_tap.play();
    });

    $("body").on("click", ".cover", function () {
        close_popups();
    });

    $(".close").click(function () {
        var popup = $(this).closest(".popup");
        close_popups();
    });

    randomAnimation();

    $(typeSelector).each(startType);

    try {
        $('.metric[data-value]').each(function (i, e) {
            var color = $(this).find(".value").css("color");
            $(this).circleProgress({
                size: 82,
                thickness: 3,
                fill: color,
                animation: { duration: 500, easing: "circleProgressEasing" }
            });
        });
    } catch (e) {
        hasCircleProgress = false;
    }

    $(window).on("beforeunload", function () {
        $("body").addClass("leaving");
    });

    $(".uploader input").on("change", function () {
        $(".file[for=" + $(this).attr("id") + "]").text(this.files[0].name);
    });

    if (!$(".cover").length)
        $("body").append('<div class="cover"></div>');

});

var options = {
    audio: true,
    play_keypad: true,
    play_popup: true,
    play_button: true,
    play_toast: true,
    play_form_type: true,
};

var typeDelay = 50;
var typeSelector = "[type=''], .type, .heading:not(.notype), .title:not(.notype)";

var hasHowl = true;
var hasCircleProgress = true;
var hasToastr = true;

try {
    toastr.subscribe((...args) => {
        if (args[0].state == "visible") {
            if (options.audio && options.play_toast)
                switch (args[0].map.type) {
                    case "error":
                        sfx_toast_error.play()
                        break;
                    case "warning":
                        sfx_toast_warn.play()
                        break;
                    default:
                        sfx_toast_show.play()
                        break;
                }
        }
    });
} catch (e) {
    console.log("Toastr not found");
}

try {
    sfx_button_tap = new Howl({
        src: ['audio/ui_select.wav'],
        volume: 0.5
    });
    sfx_keypad_tap = new Howl({
        src: ['audio/ui_tap.wav']
    });
    sfx_form_type = new Howl({
        src: ['audio/ui_tap.wav']
    });
    sfx_popup_show = new Howl({
        src: ['audio/ui_chirp.wav']
    });
    sfx_toast_show = new Howl({
        src: ['audio/ui_notice.wav']
    });
    sfx_toast_error = new Howl({
        src: ['audio/ui_error.wav']
    });
    sfx_toast_warn = new Howl({
        src: ['audio/ui_warn.wav']
    });
} catch (e) {
    hasHowl = false;
    options.audio = false;
}

function startType(i, e) {
    e = $(e);
    if (e.data("cont") === undefined) {
        e.data("cont", e.text());
        e.data("conthtml", e.html());
    }
    e.text("\xa0");

    setTimeout(addCharacter, typeDelay, e);
}

function addCharacter(e) {
    e = $(e);
    current = e.text().replace("\xa0", "");
    final = e.data("cont");
    left = final.replace(current, "");
    addon = left.charAt(0);

    if (addon.length > 0) {
        e.text(current + addon);
        if (e.hasClass("fast")) {
            setTimeout(addCharacter, typeDelay / 2, e);
        } else {
            if (e.hasClass("slow")) {
                setTimeout(addCharacter, typeDelay * 2, e);
            } else {
                setTimeout(addCharacter, typeDelay, e);
            }
        }
    } else {
        e.html(e.data("conthtml"));
    }
}

function randomAnimation() {
    $(".panel").removeClass("shown");
    var them = $(".panel");

    for (var i = 0; i < them.length; i++) {
        time = randomNumber(0, 500);
        if ($(them[i]).hasClass("immediate")) {
            time = 0;
        }
        setTimeout(showHim, time, them[i]);
    }
}

function showHim(them) {
    $(them).addClass("shown");
}

function randomNumber(min, max, floor = true) {
    if (floor) {
        return Math.floor(Math.random() * (max - min) + min);
    } else {
        return Math.random() * (max - min) + min;
    }
}

function open_popup(target) {
    $(target).show();
    $(target).find(typeSelector).each(startType);
    $(".cover").addClass("show");
    if (options.audio && options.play_popup && !$(target).silenced()) {
        sfx_popup_show.play();
    }
}

function close_popups() {
    $(".popup").hide();
    $(".cover").removeClass("show");
}