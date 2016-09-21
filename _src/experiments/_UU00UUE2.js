require([
  'vendor/dimensions.js',
  'scenes/UU00UUE2.js'
], function (
  Dimensions,
  UU00UUE2Scene
) {

  // RENDERER
  // --------
  var renderer = new Dimensions.Renderer({
    width: 800,
    height: 600
  });

  // SCENES
  // -----
  var scene = new UU00UUE2Scene();

  // LOOP
  // ----
  frame = function (ms) {
    scene.set('time', ms);
    requestAnimationFrame(frame);
  };

  // CLICKS
  var px_ratio = 180 / window.innerHeight;
  window.addEventListener('click', function(e, v) {
    /////////
    //var x = (e.clientX - window.innerWidth / 2) * px_ratio;
    //var y = (-e.clientY + window.innerHeight / 2) * px_ratio;
    //scene.getObject('hand').set({
    //  target: new THREE.Vector3(x, y, 0),
    //  r_target: new THREE.Vector3(0, Math.random() * Math.PI * 2 - Math.PI, 0)
    //});
    /////////
    //var angle = Math.round(3 * ((e.clientX/window.innerWidth) * 2 - 1));
    //angle *= Math.PI;
    //scene.getObject('hand').get('r_target').add(new THREE.Vector3(0, angle, 0));
    /////////
    scene.nextState();
  });

  // ON LOAD
  // -------
  Dimensions.Loader.onLoad(function () {
    document.body.appendChild(renderer.getDOMElement());
    renderer.setScene(scene);
    renderer.renderAlive();

    // start loop
    frame();
  });

});
