define([
  'vendor/dimensions.js'
], function (
  Dimensions
) {
  var KaleidoscopeObject = Dimensions.Object.extend({
    _properties: {
      time: 0
    },

    addObjects: function () {
    }

  });


  return KaleidoscopeObject;
});
