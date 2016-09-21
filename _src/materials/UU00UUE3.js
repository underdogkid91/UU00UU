define([
  'vendor/dimensions'
], function (
  Dimensions
) {

  var colors = [{
    name: 'turquoise',
    accent: '#10AC98',
    dark: '#0D8D7D',
    light: '#28CBCC',
    broken_white: '#D5FFF8'
  }, {
    name: 'gum',
    accent: '#E576D9',
    dark: '#C263B8',
    light: '#DE9FF9',
    broken_white: '#FFEBFD'
  }, {
    name: 'sand',
    accent: '#F57977',
    dark: '#CA5E5C',
    light: '#FAB494',
    broken_white: '#FAFADA'
  }];

  var PastelsMaterialsKit = {
    white: new Dimensions.Material('color', {
      bg: 'white'
    }),
    accent: new Dimensions.Material('color', {
      bg: colors[0].accent
    }),
    dark: new Dimensions.Material('color', {
      bg: colors[0].dark
    }),
    light: new Dimensions.Material('color', {
      bg: colors[0].light
    }),
    broken_white: new Dimensions.Material('color', {
      bg: colors[0].broken_white
    }),

    // grid
    grid: new Dimensions.Material('alphamap', {
      src: '/textures/grid_alpha_map.png',
      bg: colors[0].broken_white,
      opacity: 1
    }),

    // star
    star: new Dimensions.Material('alphamap', {
      src: '/textures/star_alpha_map.png',
      bg: 'white',
      opacity: 1
    }),

    bg: new Dimensions.Material('image', {
      src: '/textures/intro_bg_turquoise.jpg'
    })
  };

  var letters = 'UNDEROGKI'.split('');
  // letters
  _.each(letters, function (letter) {
    PastelsMaterialsKit[letter] = new Dimensions.Material('image', {
      src: '/textures/' + letter + '_turquoise.png'
    });
  });

  // preload textures
  _.each(colors, function (color) {
    PastelsMaterialsKit['bg_' + color.name] =
      new Dimensions.Material('image', {
        src: '/textures/intro_bg_' + color.name + '.jpg'
      });
    _.each(letters, function (letter) {
      PastelsMaterialsKit[letter + '_' + color.name] =
        new Dimensions.Material('image', {
          src: '/textures/' + letter + '_' + color.name + '.png'
      });
    });
  });

  PastelsMaterialsKit._current = 0;
  PastelsMaterialsKit.next = function () {
    PastelsMaterialsKit._current = (PastelsMaterialsKit._current + 1) % colors.length;
    var color = colors[PastelsMaterialsKit._current];

    //document.body.setAttribute('data-color', color.name);
    PastelsMaterialsKit.accent.setColor(color.accent);
    PastelsMaterialsKit.broken_white.setColor(color.broken_white);
    PastelsMaterialsKit.dark.setColor(color.dark);
    PastelsMaterialsKit.light.setColor(color.light);
    PastelsMaterialsKit.grid.setColor(color.broken_white);
    PastelsMaterialsKit.star.setColor(color.dark);
    var bg_map = PastelsMaterialsKit['bg_' + color.name].getMap();
    PastelsMaterialsKit.bg.setMap(bg_map);
    _.each(letters, function (letter) {
      var letter_map = PastelsMaterialsKit[letter + '_' + color.name].getMap();
      PastelsMaterialsKit[letter].setMap(letter_map);
    });
  };

  return PastelsMaterialsKit;
});
