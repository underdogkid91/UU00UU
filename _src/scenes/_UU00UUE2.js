define([
  'vendor/dimensions.js',
  'objects/victory_hand.js',
  'objects/particles.js',
  'materials/hands.js'
], function (
  Dimensions,
  VictoryHandObject,
  ParticlesObject,
  HandsMaterialsKit
) {
  var UU00UUE2Scene = Dimensions.Scene.extend({
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
      this._current_state = -1;
      this.nextState();
    },

    addObjects: function () {
      this.addObject('hand', new VictoryHandObject());
      this.addObject('particles', new ParticlesObject({
        position_z: -10,
        position_y: -50,
        scale: 2
        }, {
        _srcs: ['/textures/star_yellow.png', '/textures/star_blue.png', '/textures/star_pink.png']
      }));
      this.addObject('bg', new Dimensions.SpriteObject({
        src: '/textures/UU00UUE2_bg.png',
        scale_x: 800 * 1.58,
        scale_y: 600 * 1.58,
        position_z: -1000
      }));
    },

    states: [
      // hand scale 0
      function () {
        this.getObject('hand').set({
          position_y: -100,
          target: new THREE.Vector3(0, -80, 0),
          scale: 0.001,
          s_target: 0.001
        });
        this.getObject('particles').set({
          position_y: -200
        });
      },
      // hand centered scale 1
      function () {
        this.getObject('hand').set({
          target: new THREE.Vector3(0, -60, 0),
          s_target: new THREE.Vector3(1, 1, 1),
          mass: 0.01
        });
      },
      // hand waves
      function () {
        var self = this;
        this.getObject('hand').set({
          rotation: 0,
          r_target: new THREE.Vector3(0, -Math.PI/8, Math.PI/8),
          mass: 0.12
        });
        _.delay(function () {
          self.getObject('hand').set({
            r_target: new THREE.Vector3(0, Math.PI/8, -Math.PI/8)
          });
        }, 500);
        _.delay(function () {
          self.getObject('hand').set({
            r_target: new THREE.Vector3(0, -Math.PI/8, Math.PI/16)
          });
        }, 1000);
        _.delay(function () {
          self.getObject('hand').set({
            r_target: new THREE.Vector3(0, 0, 0)
          });
        }, 1500);
        this.getObject('particles').set({
          position_y: -50
        });
      },
      // spinning slow
      function () {
        this.getObject('hand').set({
          r_target: new THREE.Vector3(0, Math.PI * 2, 0)
        });
      },
      // spinning fast
      function () {
        this.getObject('hand').set({
          r_target: new THREE.Vector3(0, Math.PI * 8, 0)
        });
      }
    ],

    nextState: function () {
      var next_state = (this._current_state + 1) % this.states.length;
      this.states[next_state].call(this);
      this._current_state = next_state;
    },

    _setTime: function (t) {
      this.getObject('hand').set('time', t);
      var r_velocity_l = this.getObject('hand').get('r_velocity').length();
      var frequency = r_velocity_l > 15 ? 20
                    : r_velocity_l > 5 ? 100
                    : r_velocity_l < 5 ? 100000 : null;
      this.getObject('particles').set('frequency', frequency);
      this.getObject('particles').set('time', t);
    }
  });

  return UU00UUE2Scene;
});

