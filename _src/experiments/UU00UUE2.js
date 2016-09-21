require([
  'vendor/dimensions.js',
  'scenes/UU00UUE2'
], function (
  Dimensions,
  UU00UUE2MainScene
) {

  // RENDERER
  // --------
  var renderer = new Dimensions.Renderer({
    width: window.innerWidth,
    height: window.innerHeight,
    clear_color: 0xfff
  });

  // SCENE
  // -----
  var main_scene = new UU00UUE2MainScene();

  // LOOP
  // ----
  var t = 0;
  Dimensions.frame = function (_t) {
    main_scene.set('dt', _t - t);
    t = _t;
  };

  // ON LOAD
  // -------
  Dimensions.Loader.onLoad(function () {
    document.body.appendChild(renderer.getDOMElement());
    renderer.forceFullScreen(2000);
    renderer.setScene(main_scene);
    renderer.renderAlive();
    Dimensions.startFrame();

    document.addEventListener('mousemove', function (e) {
      var v = e.clientX / document.body.offsetWidth;
      var pointer = new THREE.Vector2(
          e.clientX / document.body.offsetWidth,
          e.clientY / document.body.offsetHeight
      );
      pointer.multiplyScalar(2).sub(new THREE.Vector2(1, 1));
      main_scene.set('radius_offset', 50 + 50 * ((1 - pointer.length()) - 0.5));
    });
  });

});
