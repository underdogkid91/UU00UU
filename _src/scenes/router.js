define([
  'src/vendor/dimensions.js',
  'src/objects/cola.js',
  'src/objects/waves_emitter.js'
], function (
  Dimensions,
  ColaObject,
  WavesEmitterObject
) {
  var RouterScene = Dimensions.Scene.extend({
    init: function (options) {
      this.generateCamera({
        type: 'perspective',
        fov: 40,
        aspect: 1.778,
        near: 100,
        far: 1500
      });
      this.setCameraPosition({ x: 0, y: 100, z: 300 });
      this.set({
        scale: 0.5,
        velocity: 500,
        time: 0
      });
    },

    addObjects: function () {
      this.addObject('waves', new WavesEmitterObject({
        PATTERN: [0, 1, 2, 3],
        l: 200
      }));
      this.addObject('waves2', new WavesEmitterObject({
        PATTERN: [0],
        l: 0,
        scale: 2
      }));
    },

    _setTime: function (value) {
      this.getObject('waves').set('beat', value);
      this.getObject('waves2').set('beat', value);
    }
  });

  return RouterScene;
});
