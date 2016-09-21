define([
  'vendor/dimensions',
  'materials/UU00UUE3'
], function (
  Dimensions,
  PastelsMaterialsKit
) {
  var VictoryHandObject = Dimensions.Object.extend({
    // TODO: init this in init, otherwise vectors are shared
    // between instances...
    _properties: {
      time:                             0,
      k:                               -6, // spring stiffness
      b:                            -0.97, // damping constant
      mass:                          0.12,
      velocity:       new THREE.Vector3(),
      acceleration:   new THREE.Vector3(),
      target:         new THREE.Vector3(),
      r_velocity:     new THREE.Vector3(),
      r_acceleration: new THREE.Vector3(),
      r_target:       new THREE.Vector3(),
      s_velocity:     new THREE.Vector3(),
      s_acceleration: new THREE.Vector3(),
      s_target:       new THREE.Vector3(1, 1, 1)
    },

    addObjects: function (properties) {
      var victory_hand_shape = new Dimensions.Shape();
      victory_hand_shape.importSvg("M15.9172677,-12.2539467 C16.4738352,-16.9244241 17.0831606,-21.5943048 17.7252351,-25.9488605 C17.9526022,-27.4908665 18.2413855,-28.9801021 18.7409133,-31.3046049 C20.1577494,-37.8977101 20.4288989,-39.5846825 20.1502891,-42.1349195 C19.726257,-46.0162704 17.3591996,-48.4004259 12.9826649,-48.9483689 C7.71557384,-49.6078096 3.80210214,-43.9093117 0.828744917,-34.2100301 C-0.538274873,-29.750724 -1.61851283,-24.5572016 -2.26079551,-19.7859797 C-2.68370486,-16.6443812 -2.61387384,-16.7733496 -2.61387384,-16.7733496 C-5.66426277,-36.2406092 -14.2478802,-48.3628052 -24.7300583,-45.1529566 C-27.8350692,-44.2021414 -28.4754208,-41.2115341 -27.7006623,-36.6485282 C-27.2263725,-33.855158 -27.2173364,-33.8232608 -24.2955794,-24.0433016 C-23.7924785,-22.3592782 -23.4014903,-21.0112653 -23.0429565,-19.7095302 C-21.1043103,-12.670852 -20.1642618,-7.74060822 -19.1682796,-1.74060822 C-20.9046371,0.247779088 -22.3198719,2.2621634 -23.2973248,4.48031583 C-26.7356084,10.7624252 -26.3691859,17.9925031 -23.1641339,25.2720208 C-21.5276424,28.9889245 -19.1682796,32.7593918 -16.1642618,35.7593918 C-19.6642618,38.2593918 -19.351257,42.618467 -15.6013478,45.3974303 C-12.0439541,48.0337251 -5.59925691,49.6011149 1.78728477,49.6011149 C9.1227097,49.6011149 16.1928287,47.4788299 20.1079617,44.2412901 C24.8640692,40.3083235 23.3783188,35.7593918 20.3921415,33.9360296 C21.1040814,33.1845478 21.8024506,32.3211033 22.4641271,31.3408672 C24.3683311,28.5198971 25.7268326,25.0960557 26.3103612,21.044497 C27.0192286,16.1226848 26.31036,11.7593918 25.2424126,9.75939178 C26.8357391,5.75939178 27.6503464,1.60764662 27.3077884,-1.52033772 C26.8468889,-5.72892807 24.6174183,-8.60277804 20.5932751,-9.21766229 C18.8301971,-9.4870585 16.978294,-9.21352019 15.3357391,-8.24060822 C15.487049,-9.60269675 15.7224139,-10.6188173 15.9172677,-12.2539467 Z");
      this.addObject('base', new Dimensions.ExtrudeObject({
        geometry: [victory_hand_shape, {
          amount: 10,
          bevelEnabled: false,
          UVGenerator: Dimensions.Helpers.ExtrudeGeometryUVGenerator(1, 1, 0, 0)
        }],
        materials: {
          main: properties.material_main || PastelsMaterialsKit.accent,
          front: properties.material_front || PastelsMaterialsKit.victory_front,
          back: properties.material_back || PastelsMaterialsKit.victory_back
        },
        rotation_y: Math.PI,
        rotation_z: Math.PI,
        position_y: 40,
        position_z: 10/2
      }));
    },

    _setTime: function (time) {
      this.updatePhysics(time);
    },

    updatePhysics: function (time) {
      if (!this._last_physics_update) {
        this._last_physics_update = 0;
      }
      var delta = time - this._last_physics_update;

      // if delta is really high (usually after switching tabs, or excution cached in ff)
      if (delta > 300) {
        delta = 1;
      }

      // TODO: set active or inactive, and only update if active
      var spring = this._object.position.clone().sub(this.get('target')).multiplyScalar(this.get('k'));
      var damper = this.get('velocity').clone().multiplyScalar(this.get('b'));
      this.set('acceleration', spring.clone().add(damper).divideScalar(this.get('mass')));
      this.set('velocity', this.get('velocity').clone().add(this.get('acceleration').clone().multiplyScalar(delta/1000)));
      this._object.position.add(this.get('velocity').clone().multiplyScalar(delta/1000));

      var rotation = this._object.rotation.toVector3();
      var r_spring = rotation.clone().sub(this.get('r_target')).multiplyScalar(this.get('k'));
      var r_damper = this.get('r_velocity').clone().multiplyScalar(this.get('b'));
      this.set('r_acceleration', r_spring.clone().add(r_damper).divideScalar(this.get('mass')));
      this.set('r_velocity', this.get('r_velocity').clone().add(this.get('r_acceleration').clone().multiplyScalar(delta/1000)));
      rotation.add(this.get('r_velocity').clone().multiplyScalar(delta/1000));
      this._object.rotation.setFromVector3(rotation);

      var s_spring = this._object.scale.clone().sub(this.get('s_target')).multiplyScalar(this.get('k'));
      var s_damper = this.get('s_velocity').clone().multiplyScalar(this.get('b'));
      this.set('s_acceleration', s_spring.clone().add(s_damper).divideScalar(this.get('mass')));
      this.set('s_velocity', this.get('s_velocity').clone().add(this.get('s_acceleration').clone().multiplyScalar(delta/1000)));
      this._object.scale.add(this.get('s_velocity').clone().multiplyScalar(delta/1000));

      this._last_physics_update = time;
    }

  });

  return VictoryHandObject;
});

