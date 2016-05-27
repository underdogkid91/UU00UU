define([
  'src/vendor/dimensions.js',
  'src/materials/pastels.js',
  'src/objects/cola.js',
  'src/objects/constellation.js'
], function (
  Dimensions,
  PastelsMaterialsKit,
  ColaObject,
  ConstellationObject
) {
  var MainScene = Dimensions.Scene.extend({
    _properties: {
      wave: 0.5,
      constellation: 500,
      time: 0
    },

    init: function (options) {
      this.generateCamera({
        type: 'perspective',
        fov: 40,
        aspect: 1.778,
        near: 100,
        far: 1500
      });
      this.setCameraPosition({ x: 0, y: 100, z: 300 });
    },

    addObjects: function () {
      this.addObject('sky', new Dimensions.PlaneObject({
        geometry: [800, 600, 32],
        material: PastelsMaterialsKit.sky,
        scale: 1.85,
        position_z: -800,
        position_y: -200,
        rotation_x: -Math.PI * 0.1
      }));
      this.addObject('cola', new ColaObject());
      this.addObject('constellation', new ConstellationObject({
        scale: 3,
        position_y: 200,
        rotation_x: -Math.PI * 0.1,
        rotation_z: -Math.PI / 4
      }));
    },

    _setWave: function (value) {
      this.getObject('cola').set('wave', value);
    },

    _setConstellation: function (value) {
      this.getObject('constellation').set('size', 1 / value);
    },

    _setTime: function (value) {
      this.getObject('cola').set('rotation_y', value / 1000);
      this.getObject('cola').set('rotation_z', Math.PI / 8);
      this.getObject('cola').set('noise', value / 100);
      this.getObject('cola').set('beat', value);
      this.getObject('constellation').set('rotation_y', -value / 10000);
      this.getObject('constellation').set('orotation', value);
    }
  });

  return MainScene;
});
