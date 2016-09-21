define([
  'vendor/dimensions',
  'materials/UU00UUE3'
], function (
  Dimensions,
  PastelsMaterialsKit
) {
  var ParticleObject = Dimensions.Object.extend({
    _properties: {
      velocity: null,
      initial_velocity: null,
      b: 0.97, // damping constant
      ra: Math.PI / 32, // random angle applied each frame
      size: 12,
      is_dead: true
    },

    initialize: function (properties, options) {
      this.set('velocity', new THREE.Vector3());
      this.set('initial_velocity', new THREE.Vector3(0, 100, 0));
      this.get('initial_velocity').applyAxisAngle(new THREE.Vector3(0, 0, 1), (Math.random() - 0.5) * Math.PI * 0.75);
      this.set('size', properties.size);
      Dimensions.Object.prototype.initialize.apply(this, arguments);
    },

    addObjects: function () {
      this.addObject('star', new Dimensions.PlaneObject({
        geometry: [this.get('size'), this.get('size')],
        material: new Dimensions.Material('alphamap', {
          alphamap: PastelsMaterialsKit.star.getAlphaMap(),
          bg: PastelsMaterialsKit.star.getColor(),
          opacity: 0
        })
      }));
    },

    start: function (position) {
      position = position === undefined ? new THREE.Vector3(0, 0, 0) : position;
      this.set('is_dead', false);
      this._object.visible = true;
      this._object.position.copy(position);
      this.get('velocity').copy(this.get('initial_velocity'));
    },

    update: function (delta) {
      if (this.get('is_dead')) return;
      this.get('velocity').multiplyScalar(this.get('b'));
      var a = (Math.random() * 2 - 1) * this.get('ra') * this.get('velocity').length() / 70;
      this.get('velocity').applyAxisAngle(new THREE.Vector3(0, 0, 1), a);

      var velocity_length = this.get('velocity').length();
      this._object.position.add(this.get('velocity').clone().multiplyScalar(delta/1000));
      this.set('scale', (-velocity_length / 100) * 0.7 + 1.3);
      var opacity = (velocity_length / 100) * 2;
      opacity = opacity > 1 ? 1 : opacity;
      this.getObject('star')._material.opacity = opacity;

      //
      if (velocity_length < 0.1) {
        this.set('is_dead', true);
        this._object.visible = false;
      }
    },

    updateColor: function () {
      this.getObject('star').setMaterialColor(PastelsMaterialsKit.star.getColor());
    }
  });

  var ParticlesObject = Dimensions.Object.extend({
    _properties: {
      time: 0,
      count: 100,
      frequency: 10000000
    },

    initialize: function (properties, options) {
      this._last_created_at = 0;
      this._last_physics_update = 0;
      this.set('origin', new THREE.Vector3());
      Dimensions.Object.prototype.initialize.apply(this, arguments);
    },

    addObjects: function () {
      _.times(this.get('count'), function (i) {
        this.addObject('particle_' + i, this.createParticle(i));
      }, this);
    },

    // Overwrite if points starting somewhere else different to 0, 0, 0
    createParticle: function (i) {
      var particle = new ParticleObject({
        size: i%2 === 0 ? 2 : 6
      });
      return particle;
    },

    _setTime: function (time) {
      var delta = time - this._last_physics_update;

      // if delta is really high (usually after switching tabs, or excution cached in ff)
      if (delta > 300) {
        delta = 1;
      }

      // start dead particles
      if (this.get('frequency') < time - this._last_created_at) {
        var first_dead =_.find(this._objects, function (particle) {
          return particle.get('is_dead');
        });
        if (first_dead) first_dead.start(this.get('origin'));
        this._last_created_at = time;
      }

      _.each(this._objects, function(particle, i) {
        particle.update(delta);
      }, this);

      this._last_physics_update = time;
    },

    updateColor: function () {
      _.each(this._objects, function (o) {
        o.updateColor.call(o);
      }, this);
    }
  });

  return ParticlesObject;
});
