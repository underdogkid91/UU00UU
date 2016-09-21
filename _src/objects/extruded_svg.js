define([
  'vendor/dimensions'
], function (
  Dimensions
) {
  var ExtrudedSvgObject = Dimensions.Object.extend({
    _setSvg: function (svg) {
      var wrapper = this.getObject('wrapper');

      var extrusion_shape = new Dimensions.Shape();
      extrusion_shape.importSvg(svg.main);
      _.each(svg.holes, function (hole_svg) {
        extrusion_shape.addHoleSvg(hole_svg);
      });

      wrapper.addObject('extrusion', new Dimensions.ExtrudeObject({
        geometry: [extrusion_shape, {
          amount: 20,
          bevelEnabled: false,
          UVGenerator: Dimensions.Helpers.ExtrudeGeometryUVGenerator(1, 1, 0, 0)
        }],
        materials: this._extrusion_materials,
        rotation_x: Math.PI,
        position_x: -100,
        position_y: 100,
        position_z: 10
      }));

      // this.addObject('anchor', new Dimensions.SphereObject({ geometry: [5] }));
    },

    setExtrusionMaterials: function (materials) {
      this._extrusion_materials = materials;
    }
  });

  return ExtrudedSvgObject;
});
