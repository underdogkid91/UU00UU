require([
  'vendor/dimensions',
  'vendor/is-mobile',
  'scenes/UU00UUE1_central',
  'scenes/UU00UUE1_pattern',
  'vendor/xx-input'
], function (
  Dimensions,
  isMobile,
  UU00UUE1CentralScene,
  UU00UUE1PatternScene,
  xxInput
) {

  // RENDERER
  // --------
  var renderer = new Dimensions.Renderer({
    width: window.innerWidth,
    height: window.innerHeight,
    clear_color: 0x9EBDFF
  });


  // SCENES
  // -----
  var central_scene = new UU00UUE1CentralScene();
  central_scene.set('scale', 0.6);
  var pattern_scene = new UU00UUE1PatternScene();
  var current_scene = central_scene;


  // LOOP
  // ----
  var current_bar = 0;
  Dimensions.frame = function (ms) {
    var tick = (ms/(1000*60)) * 120; // 120bpm
    var beat = tick % 4;
    var beat_normalized = beat / 4;
    var bar = Math.round(tick / 4);

    if (current_bar !== bar) {
      if (bar % 2 === 0) {
        current_scene = (current_scene === pattern_scene) ? central_scene : pattern_scene;
        renderer.setScene(current_scene);
      }
    }

    current_scene.set('bar', bar);
    current_scene.set('time', beat_normalized);

    current_bar = bar;
  };


  // ON LOAD
  // -------
  Dimensions.Loader.onLoad(function () {
    document.body.appendChild(renderer.getDOMElement());
    renderer.forceFullScreen(2000);
    renderer.setScene(current_scene);
    renderer.renderAlive();
    Dimensions.startFrame();

    // UI
    if (isMobile) {
      i = new xxInput('bottom');
      i.onChange(function (v) {
        central_scene.set('wave', v * 50);
        pattern_scene.set('wave', v * 50);
        //t.intensity = v;
        // 7.5 -> 1.5
      });
    } else {
      document.addEventListener('mousemove', function (e) {
        var v = e.clientX / document.body.offsetWidth;
        v = Math.abs(v * 2 - 1);
        central_scene.set('wave', v * 50);
        pattern_scene.set('wave', v * 50);
      });
    }
  });

});
