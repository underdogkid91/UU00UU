define([
  'vendor/dimensions'
], function (
  Dimensions
) {
  var defaultObject = new Dimensions.BoxObject({
    geometry: [10, 20, 5],
    materials: {
      main: new Dimensions.Material(),
      front: new Dimensions.Material('color', { bg: 'red' })
    },
    rotation_y: -Math.PI / 8
  });

  var ConstellationObject = Dimensions.Object.extend({
    _properties: {
      dt: 0,
      points: 3,
      point_size: 1,
      radius: 50,
      radius_offset: 0,
      original_object: defaultObject,
      velocity: 0.001
    },

    addObjects: function () {
      _.times(this.get('points'), function (i) {
        var point = this.get('original_object').clone();
        point.set({
          position_x: this.get('radius'),
          scale: this.get('point_size')
        });
        var wrapper = new Dimensions.Object({
          rotation_z: i * (Math.PI * 2) / this.get('points')
        });
        wrapper.addObject('point', point);
        this.addObject('object_' + i, wrapper);
      }, this);
    },

    _setPoints: function (n) {
      this.removeAllObjects();
      this.addObjects();
    },

    _pointSize: function (s) {
      this.eachObject(function (o) {
        o.set('size', s);
      });
    },

    _setDt: function (dt) {
      // rotate the whole constellation
      this.get('rotation').z += this.get('velocity') * dt;
      // change radius
      var target_radius = -this.get('radius') - (0.02 * this.get('radius_offset') * this.get('radius'));
      if (!_.keys(this._objects).length) return;
      var current_radius = this.getObject('object_1').getObject('point').get('position_x');
      var distance = Math.abs(target_radius - current_radius);
      if (distance > 0.2) {
        var direction = -1;
        if (target_radius > current_radius) direction = 1;
        this.eachObject(function (o) {
          o.getObject('point').set('position_x', current_radius + direction * distance * 0.2);
        });
      }
    }
  });

  return ConstellationObject;
});
