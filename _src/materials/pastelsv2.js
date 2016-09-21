define([
  'vendor/dimensions.js'
], function (
  Dimensions
) {

  var colors = {
    desert: {
      darker:        '#B55959',
      dark:          '#F67877',
      normal:        '#F8B7A8',
      light:         '#F4E4BD',
      lighter:       '#E8F1FA'
    }
  };

  var PastelsMaterialsKitV2 = {
    white: new Dimensions.Material('color', { bg: 'white' }),
    desert: {
      light_gradient: new Dimensions.Material('gradient', {
        colors: [colors.desert.light, colors.desert.lighter]
      }),
      normal: new Dimensions.Material('color', {
        bg: colors.desert.normal
      }),
      dark_gradient: new Dimensions.Material('gradient', {
        colors: [colors.desert.dark, colors.desert.darker]
      })
    }
  };

  return PastelsMaterialsKitV2;
});

