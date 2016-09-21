define([
  'vendor/dimensions.js',
  'materials/pastelsv2',
  'objects/constellation'
], function (
  Dimensions,
  PastelsMaterialsKitV2,
  ConstellationObject
) {
  // original objects to be cloned in constellations
  var box = new Dimensions.BoxObject({
    geometry: [10, 20, 5],
    materials: {
      main: PastelsMaterialsKitV2.desert.normal,
      front: PastelsMaterialsKitV2.desert.dark_gradient,
      back: PastelsMaterialsKitV2.desert.dark_gradient
    },
    rotation_y: -Math.PI / 8
  });
  var sphere_small = new Dimensions.SphereObject({
    geometry: [2],
    material: PastelsMaterialsKitV2.white
  });

  // scene class
  var UU00UUE2MainScene = Dimensions.Scene.extend({
    _properties: {
      dt: 0,
      radius_offset: 0
    },

    init: function (options) {
      this.generateCamera({
        type: 'perspective',
        fov: 60,
        aspect: 1.778,
        near: 100,
        far: 2000
      });
      this.setCameraPosition({ x: 0, y: 0, z: -300 });
    },

    addObjects: function () {
      var window_ratio = window.outerWidth / window.outerHeight;
      this.addObject('sky', new Dimensions.PlaneObject({
        geometry: [2800 * window_ratio, 2800, 32],
        material: PastelsMaterialsKitV2.desert.light_gradient,
        rotation_y: Math.PI,
        position_z: 1700
      }));
      this.addConstellations();
    },

    addConstellations: function () {
      _.times(4, function (i) {
        var direction = i % 2 === 0 ? 1 : -1;
        this.addObject('constellation_1_' + i, new ConstellationObject({
          radius: 30 + i * 30,
          points: 3 * _.reduce(new Array(i), function (memo) { return memo * 2; }, 1),
          velocity: direction * 0.0005 - 0.0001 * (i - 1.5),
          point_size: 1 + i / 4,
          position_z: -i * 20,
          original_object: box
        }));
      }, this);

      _.times(3, function (i) {
        var direction = i % 2 === 0 ? -1 : 1;
        this.addObject('constellation_2_' + i, new ConstellationObject({
          radius: 15 + i * i * 25,
          points: 5 * _.reduce(new Array(i), function (memo) { return memo * 2; }, 1),
          velocity: direction * 0.0008 - 0.0002 * (i - 1.5),
          position_z: -50 - i * 20,
          original_object: sphere_small
        }));
      }, this);
    },

    _setRadiusOffset: function (f) {
      this.eachObject(function (o) {
        o.set('radius_offset', f);
      });
    },

    _setDt: function (dt) {
      //this.getObject('constellation_1').set('radius', 50 + 20 * Math.sin(t / 100));
      this.eachObject(function (o, name) {
        if (name === 'sky') return;
        o.set('dt', dt);
        // o.set('rotation_x', o.get('rotation_x') + 0.01);
      });
    }
  });

  return UU00UUE2MainScene;
});
