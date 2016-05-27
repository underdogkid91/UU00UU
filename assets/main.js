$(function () {
if(! /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ) {
  var $pointer = $('.exp-pointer').first().clone();
  var mouse_position = { x:0, y:0 };

  var animate_pointer = function ($pointer) {
    // setup
    var final_text = $pointer.text();
    var current_text = final_text.replace(/./ig, '-');
    $pointer.text(current_text);
    var i = 0;
    var animate = function () {
      current_text = current_text.substr(0, i) + final_text [i] + current_text.substr(i + 1);
      $pointer.text(current_text);
      i++;
      if (current_text !== final_text) setTimeout(animate, 50);
    };
    setTimeout(animate, 150);
  };

  $(document).on('mousemove', function(e) {
    mouse_position.x = e.pageX;
    mouse_position.y = e.pageY;
  });

  $('.grid .exp-link').on('mouseover', function (e) {
    $pointer.remove();
    $pointer = $(this).parent().find('.exp-pointer').clone();
    $pointer.appendTo('body');
    $pointer.show();
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
    $pointer.remove();
  });
}
});
