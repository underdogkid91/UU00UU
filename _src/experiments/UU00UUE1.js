require([
  'vendor/dimensions.js',
  'vendor/is-mobile.js',
  'scenes/main',
  'LL00',
  'vendor/xx-input.js'
], function (
  Dimensions,
  isMobile,
  MainScene,
  LL00,
  xxInput
) {
  if (!isMobile) return;

  var l = new LL00({ bps: 120, bars: 4 });
  var base = l.addChannel('base', '/audio/UU00UUE1_base.wav');
  var bubbles = l.addChannel('bubbles', '/audio/UU00UUE1_bubbles.wav');

  var t = base.addEffect('Tremolo', {
    intensity: 0.75,    //0 to 1
    rate: 4,            //0.001 to 8
    stereoPhase: 90     //0 to 180
  });


  // connect the kit, and play
  window.addEventListener('mousedown', _.once(function () {
    l.play();
  }));
  window.addEventListener('touchstart', _.once(function () {
    l.play();
  }));
  window.addEventListener('touchmove', _.once(function (e) {
    event.preventDefault();
  }));

  var scene = new MainScene();
  scene.set('scale', 0.6);

  var renderer = new Dimensions.Renderer({
    width: window.innerWidth,
    height: window.innerHeight,
    clear_color: 0x9EBDFF
  });
  renderer.forceFullScreen();
  renderer.setScene(scene);
  renderer.renderAlive();

  frame = function (ms) {
    scene.set('time', ms);
    requestAnimationFrame(frame);
  };
  frame(0);

  document.body.appendChild(renderer.getDOMElement());

  // UI
  i = new xxInput('bottom');
  i.onChange(function (v) {
    scene.set('wave', v);
    t.intensity = 2 * (v / 50);
    t.rate = 8 * (-v / 100);
  });
});

