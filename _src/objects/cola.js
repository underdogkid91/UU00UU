define([
  'vendor/dimensions',
  'materials/pastels'
], function (
  Dimensions,
  PastelsMaterialsKit
) {
  var ColaObject = Dimensions.Object.extend({
    _properties: {
      noise: 0,
      wave: 1
    },

    addObjects: function () {
      this.addObject('base', new Dimensions.CylinderObject({
        geometry: [60, 45, 140, 16, 16, 16],
        material: PastelsMaterialsKit.base
      }));
      var vertices = this.getObject('base').getGeometry().vertices;
      this.base_original_vertices = new Array(vertices.length);
      _.each(vertices, function (v, i) {
        this.base_original_vertices[i] = v.clone();
      }, this);
      this.addObject('bottom', new Dimensions.CylinderObject({
        geometry: [45, 45, 6, 32],
        materials: {
          main: PastelsMaterialsKit.paper_light,
          bottom: PastelsMaterialsKit.paper_shadow
        },
        position_y: -73
      }));
      this.addObject('lid_bottom', new Dimensions.CylinderObject({
        geometry: [68, 66, 14, 32],
        materials: {
          main: PastelsMaterialsKit.paper,
          top: PastelsMaterialsKit.paper_light,
          bottom: PastelsMaterialsKit.paper_shadow
        },
        position_y: 77
      }));
      this.addObject('lid_bottom', new Dimensions.CylinderObject({
        geometry: [46, 55, 26, 32],
        materials: {
          main: PastelsMaterialsKit.paper,
          top: PastelsMaterialsKit.paper_light
        },
        position_y: 90
      }));
      this.addObject('straw', new Dimensions.CylinderObject({
        geometry: [6, 6, 50, 32],
        material: PastelsMaterialsKit.base,
        position_y: 90 + 25
      }));
    },

    _setNoise: function (value) {
      var g = this.getObject('base').getGeometry();
      _.each(g.vertices, function (v, i) {
        var origin = this.base_original_vertices[i];
        //var a	= (value + v.y + origin.x) * 2;
        //---
        //var a	= value + v.y / this.get('xxx');
        //v.x = origin.x * (0.75 + Math.cos(a) / 4);
        //v.z = origin.z * (0.75 + Math.cos(a) / 4);
        //---
        var a	= value * Math.PI * 2 + v.y / ( 0.5 * this.get('wave'));
        v.x = origin.x + Math.cos((v.y / 140) * Math.PI) * (this.get('wave') * Math.cos(a));
        v.z = origin.z + Math.cos((v.y / 140) * Math.PI) * (this.get('wave') * Math.sin(a));
      }, this);
      g.verticesNeedUpdate = true;
    }
  });

  return ColaObject;
});
