define([
  'vendor/dimensions.js'
], function (
  Dimensions
) {

  var PastelsMaterialsKit = {
    base: new Dimensions.Material('image', {
      src: '/textures/base.png'
    }),
    base_pink: new Dimensions.Material('color', {
      bg: '#D4ABBE'
    }),
    base_pink_dark: new Dimensions.Material('color', {
      bg: '#DC94AA'
    }),
    base_cyan: new Dimensions.Material('color', {
      bg: '#A1B6BF'
    }),
    paper: new Dimensions.Material('image', {
      src: '/textures/paper.png'
    }),
    paper_light: new Dimensions.Material('color', {
      bg: '#F8F5FA'
    }),
    paper_shadow: new Dimensions.Material('color', {
      bg: '#C2C1C6'
    }),
    candy_light: new Dimensions.Material('color', {
      bg: '#fff',
      opacity: 0.7
    }),
    sky_simple: new Dimensions.Material('image', {
      src: '/textures/sky_simple.png'
    })
  };

  return PastelsMaterialsKit;
});
