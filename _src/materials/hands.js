define([
  'vendor/dimensions.js'
], function (
  Dimensions
) {

  var HandsMaterialsKit = {
    victory_front: new Dimensions.Material('image', {
      src: '/textures/victory_hand_front.png'
    }),
    victory_back: new Dimensions.Material('image', {
      src: '/textures/victory_hand_back.png'
    }),
    side: new Dimensions.Material('color', {
      bg: '#111'
    }),
    star_yellow: new Dimensions.Material('sprite', {
      src: '/textures/star_yellow.png'
    })
  };

  return HandsMaterialsKit;
});

