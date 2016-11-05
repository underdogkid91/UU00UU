define([
  'vendor/dimensions',
  'materials/pastels',
  'objects/cola'
], function (
  Dimensions,
  PastelsMaterialsKit,
  ColaObject
) {
  var UU00UUE1PatternScene = Dimensions.Scene.extend({
    _properties: {
      wave: 0.5,
      time: 0
    },

    init: function (options) {
      this.generateCamera({
        type: 'orthographic',
        near: 1,
        far: 5000
      });
      //this.setCameraPosition({ x: 300, y: 300, z: 200 });
    },

    addObjects: function () {
      var window_ratio = window.outerWidth / window.outerHeight;
      this.addObject('sky', new Dimensions.PlaneObject({
        geometry: [2000 * window_ratio, 2000, 32],
        material: PastelsMaterialsKit.sky_simple,
        position_z: -4000,
        position_y: 600
      }));
      this._original_cola = new ColaObject();
      this.rows = 12;
      this.columns = 10;
      this.size = 1200;
      var colas_array = new Dimensions.Object({
        scale: 2,
        rotation_x: Math.PI / 8,
        rotation_y: Math.PI / 8,
        position_z: -1500
      });
      _.times(this.rows, function (_i) {
        _.times(this.columns, function (_j) {
          var ii = _i / this.rows;
          var jj = _j / this.columns;
          var cola = new ColaObject({
            scale: 0.3,
            position_x: (ii - 0.5) * this.size,
            position_z: (jj - 0.5) * this.size
          });
          colas_array.addObject('cola_' + _i + '_' + _j, cola);
        }, this);
      }, this);
      this.addObject('colas_array', colas_array);
    },

    _setWave: function (value) {
      this._original_cola.set('wave', value);
    },

    _setTime: function (value) {
      this.getObject('colas_array').set('position_x', 50 - value * (this.size - 100) / this.rows);
      this.getObject('colas_array').set('position_y', 50 - value * (this.size - 50) / this.columns);
      this._original_cola.set('noise', value * 2);
      var o_g = this._original_cola.getObject('base').getGeometry().vertices;
      var base = this._original_cola.getObject('base');
      _.each(this.getObject('colas_array')._objects, function (cola_copy) {
        var g = cola_copy.getObject('base').getGeometry();
        _.each(g.vertices, function(v, i) { v.copy(o_g[i]); });
        g.verticesNeedUpdate = true;
      }, this);
    }
  });

  return UU00UUE1PatternScene;
});
