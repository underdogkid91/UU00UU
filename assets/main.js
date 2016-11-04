$(function () {
if(! /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ) {
  var $pointer = $('.exp-pointer').first().clone();
  var video_el;
  var mouse_position = { x:0, y:0 };

  var weird_chars_string = function (j) {
    var weird_chars = "µ¾Øϭλж";
    var string = [];
    while (j > 0) {
      string.push(weird_chars.charAt(Math.floor(Math.random() * weird_chars.length)));
      j--;
    }
    return string.join('');
  };
  var animate_pointer = function ($pointer) {
    // setup
    var final_text = $pointer.text();
    var current_text = weird_chars_string(final_text.length);
    $pointer.text(current_text);
    var i = 0;
    var animate = function () {
      current_text = current_text.substr(0, i) + final_text [i] + weird_chars_string(final_text.length - i - 1);
      $pointer.text(current_text);
      i++;
      if (current_text !== final_text) setTimeout(animate, 50);
    };
    setTimeout(animate, 300);
  };

  $(document).on('mousemove', function(e) {
    mouse_position.x = e.pageX;
    mouse_position.y = e.pageY;
  });

  $('.grid .exp-link').on('mouseover', function (e) {
    $pointer.remove();
    $pointer = $(this).parent().find('.exp-pointer').clone();
    video_el = $(this).parent().find('video')[0];
    video_el.currentTime = 0;
    video_el.play();
    $pointer.appendTo('body');
    $pointer.show();
    setTimeout(function () {
      $pointer.addClass('visible');
    }, 0);
    $pointer.css({
      position: 'absolute',
      left: mouse_position.x + 10,
      top: mouse_position.y + 10
    });
    animate_pointer($pointer);
  });
  $('.grid .exp-link').on('mousemove', function (e) {
    $pointer.css({
      left: mouse_position.x + 10,
      top: mouse_position.y + 10
    });
  });
  $('.grid .exp-link').on('mouseleave', function () {
    video_el.currentTime = 0;
    video_el.pause();
    $pointer.remove();
  });
}
});
