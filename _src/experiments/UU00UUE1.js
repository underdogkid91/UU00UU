require([
  'vendor/dimensions.js',
  'vendor/is-mobile.js',
  'scenes/UU00UUE1_central',
  'scenes/UU00UUE1_pattern',
  'LL00',
  'vendor/xx-input.js'
], function (
  Dimensions,
  isMobile,
  UU00UUE1CentralScene,
  UU00UUE1PatternScene,
  LL00,
  xxInput
) {
  if (!isMobile) return;

  // AUDIO
  // -----
  var l = new LL00({ bps: 120, bars: 4 });
  var base = l.addChannel('base', '/audio/UU00UUE1_base.wav');
  // var bubbles = l.addChannel('bubbles', '/audio/UU00UUE1_bubbles.wav');

  var t = base.addEffect('Tremolo', {
    intensity: 0.75,    //0 to 1
    rate: 3,          //0.001 to 8
    stereoPhase: 90     //0 to 180
  });


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
  frame = function (ms) {
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
    requestAnimationFrame(frame);

    current_bar = bar;
  };


  // connect the kit, and play
  renderer.getDOMElement().addEventListener('mousedown', _.once(function (e) {
    e.preventDefault();
    l.play();
  }));
  renderer.getDOMElement().addEventListener('touchstart', _.once(function (e) {
    e.preventDefault();
    l.play();
  }));


  // ON LOAD
  // -------
  Dimensions.Loader.onLoad(function () {
    document.body.appendChild(renderer.getDOMElement());
    renderer.forceFullScreen();
    renderer.setScene(current_scene);
    renderer.renderAlive();

    // start loop
    frame(0);

    // UI
    i = new xxInput('bottom');
    i.onChange(function (v) {
      central_scene.set('wave', v * 50);
      pattern_scene.set('wave', v * 50);
      t.intensity = v;
      // 7.5 -> 1.5
    });
  });

});
