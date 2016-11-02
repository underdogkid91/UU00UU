define([
  'vendor/dimensions',
  'objects/display_letters',
  'objects/extruded_shapes',
  'objects/particles_v2',
  'materials/UU00UUE3'
], function (
  Dimensions,
  Letters,
  Shapes,
  ParticlesObject,
  PastelsMaterialsKit
) {
  var IntroScene = Dimensions.Scene.extend({
    _properties: {
      time: 0
    },

    init: function (options) {
      this.generateCamera({
        type: 'perspective',
        fov: 40,
        aspect: 1.778,
        near: 100,
        far: 1500
      });
      this.setCameraPosition({ x: 0, y: 0, z: 300 });

      this.listenToMouseEvents();

      // mouse events
      var self = this;
      window.addEventListener('click', function () {
        PastelsMaterialsKit.next();
        self.getObject('particles').updateColor();
      });
      window.addEventListener('mousemove', function (event) {
        self.setCameraPosition({
          x: self._mouse.x * 15,
          y: self._mouse.y * 15,
          z: 300
        });
      });
    },

    addObjects: function () {
      this.addObject('bg', new Dimensions.PlaneObject({
        geometry: [1380, 740],
        material: PastelsMaterialsKit.bg,
        position_z: -200
      }));

      this.addObject('grid', new Dimensions.PlaneObject({
        geometry: [330, 330],
        material: PastelsMaterialsKit.grid,
        position_z: -100
      }));

      // vertical setps = 12
      // horizontal setps = 20
      this.letters_positions = [
        { letter: 'U', x:  -80, y:   60 },
        { letter: 'N', x:  -40, y:   37 },
        { letter: 'D', x:    0, y:   60 },
        { letter: 'E', x:   40, y:   37 },
        { letter: 'R', x:   80, y:   60 },

        { letter: 'D', x: -120, y:   -8 },
        { letter: 'O', x:  -80, y:    4 },
        { letter: 'G', x:  -40, y:  -20 },

        { letter: 'K', x:   40, y:   -8 },
        { letter: 'I', x:   80, y:  -20 },
        { letter: 'D', x:  120, y:   -8 }
      ];

      _.each(this.letters_positions, function (l, i) {
         this.addObject('letter_' + i, Letters[l.letter]({
           position_x: l.x,
           position_y: l.y,
           time_offset: _.sample([1,2,3,4], 1)[0] * Math.PI / 4
         }));
      }, this);

      this.addObject('particles', new ParticlesObject({
        frequency: 50,
        position_z: 50,
        scale: 0.8
      }));

      this.shapes = [];
      this.current_shape = 0;
      _.each(Shapes, function (Shape, shape_name) {
        _.times(2, function (i) {
          var shape = Shape({
            position_x: 10000,
            position_y: 10000
          });
          this.addObject(shape_name + '_' + i, shape);
          this.shapes.push(shape);
        }, this);
      }, this);
      this.shapes = _.shuffle(this.shapes);

      var clickable_plane = new Dimensions.PlaneObject({
        geometry: [1000, 1000],
        material: Dimensions.Material.transparent,
        position_z: -50
      });
      clickable_plane.onClick = _.bind(this.addShape, this);
      this.addObject('clickable_plane', clickable_plane);
    },

    addShape: function (point) {
      this.shapes[this.current_shape].getPosition().copy(point);
      this.current_shape = (this.current_shape + 1) % this.shapes.length;
    },

    _setTime: function (time) {
      var any_hovered = false;
      _.each(this._objects, function(o, name) {
        o.set('time', time);
        if (o.get('hover')) {
          this.getObject('particles').get('origin').copy(o.getPosition());
          any_hovered = true;
        }
      }, this);
      this.getObject('particles').set('frequency', any_hovered ? 50: 100000000);
    }
  });

  return IntroScene;
});

