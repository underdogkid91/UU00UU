require([
  'vendor/dimensions',
  'scenes/UU00UUE3'
], function (
  Dimensions,
  UU00UUE3MainScene
) {

  // RENDERER
  // --------
  var renderer = new Dimensions.Renderer({
    width: window.innerWidth,
    height: window.innerHeight
  });

  // SCENE
  // -----
  var main_scene = null;

  // LOOP
  // ----
  Dimensions.frame = function (t) {
    main_scene.set('time', t);
  };

  // ON LOAD
  // -------
  Dimensions.Loader.onLoad(function () {
    document.body.appendChild(renderer.getDOMElement());
    main_scene = new UU00UUE3MainScene();
    renderer.forceFullScreen(2000);
    renderer.setScene(main_scene);
    renderer.renderAlive();
    Dimensions.startFrame();
  });
});

