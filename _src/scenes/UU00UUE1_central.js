define([
  'vendor/dimensions',
  'materials/pastels',
  'objects/cola'
], function (
  Dimensions,
  PastelsMaterialsKit,
  ColaObject
) {
  var UU00UUE1CentralScene = Dimensions.Scene.extend({
    _properties: {
      wave: 0.5,
      time: 0,
      bar: 0
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
      var window_ratio = window.outerWidth / window.outerHeight;
      this.addObject('sky', new Dimensions.PlaneObject({
        geometry: [2000 * window_ratio, 2000, 32],
        material: PastelsMaterialsKit.sky_simple,
        position_z: -800,
        position_y: -1600,
        rotation_x: -Math.PI * 0.1,
        scale: 2
      }));
      this.addObject('cola', new ColaObject({
        scale: 0.7
      }));
    },

    _setWave: function (value) {
      this.getObject('cola').set('wave', value);
    },

    _setTime: function (value) {
      this.getObject('cola').set('rotation_y', value * Math.PI * 2);
      this.getObject('cola').set('rotation_z', Math.PI / 8);
      this.getObject('cola').set('noise', value * 4);
    }
  });

  return UU00UUE1CentralScene;
});
