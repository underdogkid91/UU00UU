define([
  'three',
  'underscore'
], function (
  THREE,
  _
) {

  // ♪♫•*¨*•.¸¸.♪♫•*¨*•.¸¸.♪♫•*¨*•.¸¸.♪♫•*¨*•.¸¸.♪♫•*¨*•.¸¸.♪♫•*¨*•.¸¸.
  //
  //     Dimensions.js 0.0.2
  //     (c) 2016 xxx
  //     Dimensions may be freely distributed under the MIT license,
  //     but professional teachers are forbidden to use it during
  //     working hours (sorry dad).
  //
  // ♪♫•*¨*•.¸¸.♪♫•*¨*•.¸¸.♪♫•*¨*•.¸¸.♪♫•*¨*•.¸¸.♪♫•*¨*•.¸¸.♪♫•*¨*•.¸¸.

  var Dimensions = {};


  // Class
  // -----
  // Via Backbone.js
  var Class = Dimensions.Class = function () {
    if (this.initialize) {
      this.initialize.apply(this, arguments);
    }
    if (this.init) {
      this.init.apply(this, arguments);
    }
  };

  Class.extend = function (protoProps, staticProps) {
    var parent = this;
    var child;
    // The constructor function for the new subclass is either defined by you
    // (the "constructor" property in your `extend` definition), or defaulted
    // by us to simply call the parent constructor.
    if (protoProps && _.has(protoProps, 'constructor')) {
      child = protoProps.constructor;
    } else {
      child = function(){ return parent.apply(this, arguments); };
    }
    // Add static properties to the constructor function, if supplied.
    _.extend(child, parent, staticProps);
    // Set the prototype chain to inherit from `parent`, without calling
    // `parent` constructor function.
    var Surrogate = function(){ this.constructor = child; };
    Surrogate.prototype = parent.prototype;
    child.prototype = new Surrogate();

    // Add prototype properties (instance properties) to the subclass,
    // if supplied.
    if (protoProps) _.extend(child.prototype, protoProps);

    // Set a convenience property in case the parent's prototype is needed
    // later.
    child.__super__ = parent.prototype;

    return child;
  };


  // Dimensions.Renderer
  // -------------------
  var Renderer = Dimensions.Renderer = Class.extend({
    initialize: function (options) {
      this.width = options.width;
      this.height = options.height;
      this._renderer = new THREE.WebGLRenderer({
        antialias: true,
        alpha: true
      });
      this._renderer.setPixelRatio(window.devicePixelRatio);
      this._renderer.setSize(options.width, options.height);
      if (options.clear_color) {
        this._renderer.setClearColor(options.clear_color, 1);
      }
      this._el = this._renderer.domElement;
      this._el.style.position = 'absolute';
      this._el.style.top = 0;
      this._el.style.left = 0;
      this._el.style['z-index'] = 200;

      Dimensions.Renderer._renderers.push(this);
    },

    getDOMElement: function () {
      return this._el;
    },

    setFullScreen: function () {
      this.width = window.innerWidth;
      this.height = window.innerHeight;
      this._renderer.setSize(this.width, this.height);
      if (this._scene) this.setScene(this._scene);
    },

    setParentSize: function () {
      this.width = this._el.parentNode.offsetWidth;
      this.height = this._el.parentNode.offsetHeight;
      this._renderer.setSize(this.width, this.height);
      if (this._scene) this.setScene(this._scene);
    },

    forceFullScreen: function (zindex) {
      this.setFullScreen();
      if (zindex) this._el.style.zIndex = zindex;
      window.addEventListener("resize", _.bind(this.setFullScreen, this));
    },

    forceParentSize: function () {
      this.setParentSize();
      window.addEventListener("resize", _.bind(this.setParentSize, this));
    },

    render: function () {
      this._renderer.render(this._scene._scene, this._scene._camera);
    },

    renderAlive: function (ms) {
      this._render_alive = true;
      this.render();
    },

    setScene: function (scene, options) {
      if (scene._camera instanceof THREE.OrthographicCamera) {
        scene._camera.left = this.width / -2;
        scene._camera.right = this.width / 2;
        scene._camera.top = this.height / 2;
        scene._camera.bottom = this.height / -2;
      } else if (scene._camera instanceof THREE.PerspectiveCamera) {
        scene._camera.aspect = this.width / this.height;
      }
      scene._camera.updateProjectionMatrix();
      this._scene = scene;
    }
  });

  Dimensions.Renderer._renderers = [];
  Dimensions.Renderer._renderAlive = function (ms) {
    _.each(Dimensions.Renderer._renderers, function (renderer) {
      if (renderer._render_alive) {
        renderer.render.call(renderer, ms);
      }
      if (renderer._scene._listening_to_mouse_events) {
        renderer._scene._intersectObjects.call(renderer._scene);
      }
    });
  };

  // Render loop
  // -----------
  Dimensions.startFrame = function () {
    Dimensions._frame();
  };

  Dimensions._frame = function (ms) {
    Dimensions.Renderer._renderAlive(ms);
    if (_.isFunction(Dimensions.frame)) {
      Dimensions.frame(ms || 0);
    }
    requestAnimationFrame(Dimensions._frame);
  };


  // Dimensions.Scene
  // ----------------
  // Extend this class to create your own scenes. Add the addObjects
  // methods to add objects to the scene and the init method to set it up.
  // init runs first, then addobjects
  // use the method addObject in addObjects
  //
  // TODO: should extend from Dimensions.Object, _object = _scene
  var Scene = Dimensions.Scene = Class.extend({
    _defaults: {
      camera: {
        type: 'perspective',
        fov: 40,
        aspect: 1.6,
        near: 0.1,
        far: 1000
      }
    },

    initialize: function (options) {
      options = options || {};
      if (this._properties) {
        this._properties = _.extend({}, this._properties);
      } else {
        this._properties = {};
      }
      this._objects = {};
      this._scene = new THREE.Scene();
      // TODO camera is not set via options anymore
      options.camera = options.camera || {};
      options.camera = _.extend({}, this._defaults.camera, options.camera);
      this.generateCamera(options.camera);
      this.setCameraPosition(options.camera.position);
      if (_.isFunction(this.addObjects)) {
        this.addObjects(options);
      }
      // TODO: prepopulate position, rotation and scale with 0s?
      // clean properties
      // BROKEN
      //this.set(_.chain({}).extend(this._defaults, this._properties).omit('camera'));
    },

    set: function (properties, value) {
      // Save
      if (!_.isObject(properties)) {
        var p = properties;
        properties = {};
        properties[p] = value;
      }
      _.extend(this._properties, properties);
      // Update
      _.each(properties, function (val, p) {
        var split = p.split('_');
        if (_.contains(['position', 'rotation', 'scale'], split[0])) {
          // Update in Object3D
          if (split.length === 1) {
            _.each(['x', 'y', 'z'], function (axis) {
              this._scene[split[0]][axis] = val;
            }, this);
          } else {
            this._scene[split[0]][split[1]] = val;
          }
        } else {
          // Update custom properties
          var method = '_' + p;
          method = method.replace(/\_./g, function(c, i) { return c[1].toUpperCase(); });
          method = '_set' + method;
          if (_.isFunction(this[method])) {
            this[method].call(this, val);
          }
        }
      }, this);
    },

    get: function (property) {
      return this._properties[property];
    },

    generateCamera: function (options) {
      if (options.type === 'orthographic') {
        this._camera = new THREE.OrthographicCamera(
          0, 0, 0, 0, options.near, options.far
        );
      } else if (options.type === 'perspective') {
        this._camera = new THREE.PerspectiveCamera(
          options.fov,
          options.aspect,
          options.near,
          options.far
        );
      } else {
        throw "Must specify camera type";
      }
    },

    setCameraPosition: function (position) {
      if (_.isString(position)) {
        if (position === 'front') {
          this._camera.position.x = 0;
          this._camera.position.y = 0;
          this._camera.position.z = 100;
        }
      } else if (_.isObject(position)) {
          this._camera.position.x = position.x;
          this._camera.position.y = position.y;
          this._camera.position.z = position.z;
      } else {
        this._camera.position.x = 0;
        this._camera.position.z = 100;
        this._camera.position.y = 50;
      }
      this._camera.lookAt(this._scene.position);
    },

    addObject: function (name, object) {
      if (!object) {
        // No reference
        object = name;
      } else {
        this._objects[name] = object;
      }
      this._scene.add(object._object);
    },

    getObject: function (name) {
      return this._objects[name];
    },

    removeObject: function (name) {
      this._scene.remove(this._objects[name]._object);
      delete this._objects[name];
    },

    removeAllObjects: function () {
      _.each(this._objects, function (o, name) {
        this._object.remove(o._object);
        delete this._objects[name];
      }, this);
    },

    eachObject: function (fn) {
      _.each(this._objects, fn, this);
    },


    getPosition: function () {
      return this._object.position;
    },

    listenToMouseEvents: _.once(function () {
      this._listening_to_mouse_events = true;
      var self = this;
      this._mouse = { x: 0, y: 0 };
      this._intersected = null;
      this._raycaster = new THREE.Raycaster();

      window.addEventListener('mousemove', function (event) {
        self._mouse = {
          x: (event.clientX / window.innerWidth) * 2 - 1,
          y: -(event.clientY / window.innerHeight) * 2 + 1
        };
      });
      window.addEventListener('click', function (event) {
        self._just_clicked = true;
      });
    }),

    _intersectObjects: function () {
      this._raycaster.setFromCamera(this._mouse, this._camera);
      var intersects = this._raycaster.intersectObjects(this._scene.children, true);

      var new_intersects = _.without(intersects, this._intersected);
      _.each(new_intersects, function (intersect) {
        intersect.object._dimensions_object.onMouseEnter && intersect.object._dimensions_object.onMouseEnter();
      });

      var old_intersects = _.without(this._intersected, intersects);
      _.each(old_intersects, function (intersect) {
        intersect.object._dimensions_object.onMouseLeave && intersect.object._dimensions_object.onMouseLeave();
      });

      if (this._just_clicked) {
        this._just_clicked = false;
        _.each(intersects, function (intersect) {
          intersect.object._dimensions_object.onClick && intersect.object._dimensions_object.onClick(intersect.point);
        });
      }

      this._intersected = intersects;
    }

  });


  // Dimensions.Object
  // -----------------
  var Obj = Dimensions.Object = Class.extend({
    initialize: function (properties, options) {
      if (this._properties) {
        this._properties = _.extend({}, this._properties);
      } else {
        this._properties = {};
      }
      properties = _.extend({}, this._properties, properties);
      this._objects = {};
      this._object = new THREE.Object3D();
      this._object._dimensions_object = this;
      // TODO: prepopulate position, rotation and scale with 0s?
      // clean properties: 'geometry' and 'material'
      if (_.isFunction(this.addObjects)) {
        this.addObjects(properties);
      }
      this.set(properties);
    },

    set: function (properties, value) {
      // Save
      if (!_.isObject(properties)) {
        var p = properties;
        properties = {};
        properties[p] = value;
      }
      // Update
      var old_properties = _.clone(this._properties);
      _.extend(this._properties, properties);
      _.each(properties, function (val, p) {
        var split = p.split('_');
        if (_.contains(['position', 'rotation', 'scale'], split[0])) {
          // Update in Object3D
          if (split.length === 1) {
            _.each(['x', 'y', 'z'], function (axis) {
              this._object[split[0]][axis] = val;
            }, this);
          } else {
            this._object[split[0]][split[1]] = val;
          }
        } else {
          // Update custom properties
          var method = '_' + p;
          method = method.replace(/\_./g, function(c, i) { return c[1].toUpperCase(); });
          method = '_set' + method;
          if (_.isFunction(this[method])) {
            this[method].call(this, val);
          }
        }
      }, this);
    },

    get: function (property) {
      var split = property.split('_');
      // Object3D property
      if (_.contains(['position', 'rotation', 'scale'], split[0])) {
        if (split.length === 1) {
          return this._object[split[0]];
        } else {
          return this._object[split[0]][split[1]];
        }
      } else {
        return this._properties[property];
      }
    },

    addObject: function (name, object) {
      if (this._hasMesh) {
        throw "Cannot add objects to an object with mesh and materials";
      }
      if (!object) {
        // No reference
        object = name;
      } else {
        this._objects[name] = object;
      }
      this._object.add(object._object);
    },

    getObject: function (name) {
      return this._objects[name];
    },

    removeObject: function (name) {
      this._object.remove(this._objects[name]._object);
      delete this._objects[name];
    },

    removeAllObjects: function () {
      _.each(this._objects, function (o, name) {
        this._object.remove(o._object);
        delete this._objects[name];
      }, this);
    },

    eachObject: function (fn) {
      _.each(this._objects, fn, this);
    },

    getPosition: function () {
      return this._object.position;
    }

  });

  _.each([
    'Box',
    'Circle',
    'Cylinder',
    'Dodecahedron',
    'Extrude',
    'Icosahedron',
    'Lathe',
    'Octahedron',
    'Parametric',
    'Plane',
    'Polyhedron',
    'Ring',
    'Shape',
    'Sphere',
    'Tetrahedron',
    'Text',
    'Torus',
    'TorusKnot',
    'Tube'
  ], function (geometry) {
    Dimensions[geometry + 'Object'] = Dimensions.Object.extend({
      initialize: function (options) {
        Dimensions.Object.prototype.initialize.apply(this, arguments);
        this._hasMesh = true;
        this._geometry = new THREE[geometry + 'Geometry'](options.geometry[0], options.geometry[1], options.geometry[2], options.geometry[3], options.geometry[4], options.geometry[5]);

        this._anchor = new THREE.Vector3();
        if (options.anchor) this.setAnchor(options.anchor);

        // Materials
        if (options.material) {
          this._material = options.material._material;
        } else if (options.materials) {
          this._geometry.materials = [options.materials.main._material];
          _.each(options.materials, function (m, side) {
            if (side === 'main') return;
            this._geometry.materials.push(m._material);
          }, this);
          this._material = new THREE.MeshFaceMaterial(this._geometry.materials);
          this.assignMaterialsToSides(options.materials);
        } else {
          this._material = (new Dimensions.Material())._material;
        }
        // end of Materials
        this._mesh = new THREE.Mesh(this._geometry, this._material);
        this._mesh._dimensions_object = this;
        this._object.add(this._mesh);
      },

      setAnchor: function (anchor) {
        this._geometry.applyMatrix(new THREE.Matrix4().makeTranslation(-this._anchor.x, -this._anchor.y, -this._anchor.z));
        this._anchor = anchor;
        this._geometry.applyMatrix(new THREE.Matrix4().makeTranslation(this._anchor.x, this._anchor.y, this._anchor.z));
      },

      // TODO: support x and z
      assignMaterialsToSides: function (materials) {
        var indexes = {}, i = 0;
        _.each(materials, function (m, side) {
          indexes[side] = i;
          i++;
        });
        _.each(this._geometry.faces, function (face) {
          if (indexes.top && face.normal.y > 0.99) {
            face.materialIndex = indexes.top;
          } else if (indexes.bottom && face.normal.y < -0.99) {
            face.materialIndex = indexes.bottom;
          } else if (indexes.front && face.normal.z < -0.99) {
            face.materialIndex = indexes.front;
          } else if (indexes.back && face.normal.z > 0.99) {
            face.materialIndex = indexes.back;
          } else if (indexes.left && face.normal.x < -0.99) {
            face.materialIndex = indexes.left;
          } else if (indexes.right && face.normal.x > 0.99) {
            face.materialIndex = indexes.right;
          } else {
            face.materialIndex = 0;
          }
        }, this);
      },

      getGeometry: function () {
        return this._geometry;
      },

      clone: function () {
        // TODO: this misses methods of objects with mesh
        var c = new Dimensions.Object();
        c._hasMesh = true;
        c._geometry = this._geometry;
        c._material = this._material;
        c._materials = this._material;
        c._mesh = this._mesh.clone();
        c._object.add(c._mesh);
        return c;
      },

      // Doesnt work if more than one material
      setMaterial: function (material) {
        this._material = material._material;
        this._mesh.material = material._material;
      },

      // Doesnt work if more than one material
      setMaterialColor: function (color) {
        this._material.color.set(color);
      }

    });
  });


  // Dimensions.SpriteObject
  // -----------------------
  var SpriteObject = Dimensions.SpriteObject = Dimensions.Object.extend({
    initialize: function (properties) {
      Dimensions.Object.prototype.initialize.apply(this, arguments);
      var map = new THREE.TextureLoader().load(properties.src);
      this._material = new THREE.SpriteMaterial({ map: map });
      this._object = new THREE.Sprite(this._material);
      this._object._dimensions_object = this;
      this.set(_.extend({}, this._properties, properties));
    }
  });

  // Simple physics
  Dimensions.initObjectPhysics = function (options) {
    options = options || {};
    _.extend(this._properties, {
      k:                  options.k || -6, // spring stiffness
      b:               options.b || -0.97, // damping constant
      mass:          options.mass || 0.12,
      velocity:       new THREE.Vector3(),
      acceleration:   new THREE.Vector3(),
      target:         new THREE.Vector3(),
      r_velocity:     new THREE.Vector3(),
      r_acceleration: new THREE.Vector3(),
      r_target:       new THREE.Vector3(),
      s_velocity:     new THREE.Vector3(),
      s_acceleration: new THREE.Vector3(),
      s_target:       new THREE.Vector3(1, 1, 1)
    });

    this.updatePhysics = function (dt) {
      // if delta is really high (usually after switching tabs, or excution cached in ff)
      if (dt > 300) {
        dt = 1;
      }

      // TODO: set active or inactive, and only update if active
      var spring = this._object.position.clone().sub(this.get('target')).multiplyScalar(this.get('k'));
      var damper = this.get('velocity').clone().multiplyScalar(this.get('b'));
      this.set('acceleration', spring.clone().add(damper).divideScalar(this.get('mass')));
      this.set('velocity', this.get('velocity').clone().add(this.get('acceleration').clone().multiplyScalar(dt/1000)));
      this._object.position.add(this.get('velocity').clone().multiplyScalar(dt/1000));

      var rotation = this._object.rotation.toVector3();
      var r_spring = rotation.clone().sub(this.get('r_target')).multiplyScalar(this.get('k'));
      var r_damper = this.get('r_velocity').clone().multiplyScalar(this.get('b'));
      this.set('r_acceleration', r_spring.clone().add(r_damper).divideScalar(this.get('mass')));
      this.set('r_velocity', this.get('r_velocity').clone().add(this.get('r_acceleration').clone().multiplyScalar(dt/1000)));
      rotation.add(this.get('r_velocity').clone().multiplyScalar(dt/1000));
      this._object.rotation.setFromVector3(rotation);

      var s_spring = this._object.scale.clone().sub(this.get('s_target')).multiplyScalar(this.get('k'));
      var s_damper = this.get('s_velocity').clone().multiplyScalar(this.get('b'));
      this.set('s_acceleration', s_spring.clone().add(s_damper).divideScalar(this.get('mass')));
      this.set('s_velocity', this.get('s_velocity').clone().add(this.get('s_acceleration').clone().multiplyScalar(dt/1000)));
      this._object.scale.add(this.get('s_velocity').clone().multiplyScalar(dt/1000));

      this._last_physics_update = time;
    };
  };


  // Dimensions.Material
  // -------------------
  var Material = Dimensions.Material = Class.extend({
    initialize: function (type, options) {
      options = options || {};
      var self = this;
      var o = {};
      if (options.bg) o.color = options.bg;
      switch (type) {
      case 'image':
        this._material = new THREE.MeshBasicMaterial(o);
        this._material.needsUpdate = true;
        if (options.src) {
          Dimensions.Loader.loadTexture(options.src, function (texture) {
            self._material.map = texture;
          });
        } else if (options.map) {
          this._material.map = options.map;
        }
        break;
      case 'alphamap':
        this._material = new THREE.MeshBasicMaterial(o);
        this._material.needsUpdate = true;
        if (options.src) {
          Dimensions.Loader.loadTexture(options.src, function (texture) {
            self._material.alphaMap = texture;
          });
        } else if (options.alphamap) {
          this._material.alphaMap = options.alphamap;
        }
        break;
      case 'color':
        this._material = new THREE.MeshBasicMaterial(o);
        break;
      case 'gradient':
        this._material = new THREE.MeshBasicMaterial(o);
        this._material.needsUpdate = true;
        var texture = new THREE.Texture(this.generateGradientImage(options.colors), THREE.CubeReflectionMapping);
        texture.needsUpdate = true;
        this._material.map = texture;
        break;
      case 'wireframe':
        this._material = new THREE.MeshBasicMaterial({
          wireframe: true,
          wireframeLinewidth: options.linewidth || 1
        });
        break;
      default:
        this._material = new THREE.MeshBasicMaterial({
          color: 0xffffff
        });
      }

      if (_.isNumber(options.opacity)) {
        this._material.transparent = true;
        this._material.opacity = options.opacity;
      }

      if (options.blending) {
        this._material.blending = options.blending;
      }

      if (options.sides) {
        this._material.side = THREE[options.sides];
      }
    },

    generateGradientImage: function (colors) {
      var canvas = document.createElement('canvas');
      canvas.width = 216;
      canvas.height = 216;
      var context = canvas.getContext('2d');
      if (colors.length === 1) colors.push(gradient_stops[0]); // make it work with only one stop
      context.beginPath();
      context.rect(0, 0, canvas.width, canvas.height);
      var gradient = context.createLinearGradient(0, 0, canvas.width, canvas.height);
      _.each(colors, function (stop, i) {
        gradient.addColorStop(i / (colors.length - 1), stop);
      });
      context.fillStyle = gradient;
      context.fill();
      return canvas;
    },

    getColor: function () {
      return this._material.color;
    },

    setColor: function (color) {
      this._material.color.set(color);
    },

    getMap: function () {
      return this._material.map;
    },

    setMap: function (map) {
      this._material.map = map;
    },

    getAlphaMap: function () {
      return this._material.alphaMap;
    },

    setAlphaMap: function (alphamap) {
      this._material.alphaMap = alphamap;
    }
  });

  Dimensions.Material.transparent = new Dimensions.Material('color', {
    bg: 0xffffff,
    opacity: 0
  });

  // Always use normalized t and * amplitude and + start value
  // start time, end time, time
  // TODO: am i gonna keep using this?
  var crop = function (st, et, t, fn) {
    if (t < st) return 0;
    if (t > et) return 1;
    return fn(t / (et - st) + st);
  };
  Dimensions.Easing = {
    linear: function (st, et, t) {
      return crop(st, et, t, function(tt) {
        return tt;
      });
    },
    exponential: {
      out: function (st, et, t) {
        return crop(st, et, t, function(tt) {
          return -Math.pow( 2, -10 * tt ) + 1;
        });
      }
    }
  };

  // Shape
  // Just a proxy to THREE.Shape
  Dimensions.Shape = THREE.Shape;

  Dimensions.Shape.prototype.addHoleSvg = function (pathStr) {
    this.holes.push(this.importSvg(pathStr, new THREE.Path()));
  };

  // importSvg
  // Imports an svg string. src: https://gist.github.com/gabrielflorit/3758456
  Dimensions.Shape.prototype.importSvg = function (pathStr, path) {
    var DIGIT_0 = 48, DIGIT_9 = 57, COMMA = 44, SPACE = 32, PERIOD = 46,
      MINUS = 45;

    path = path === undefined ? this : path;

    var idx = 1, len = pathStr.length, activeCmd,
        x = 0, y = 0, nx = 0, ny = 0, firstX = null, firstY = null,
        x1 = 0, x2 = 0, y1 = 0, y2 = 0,
        rx = 0, ry = 0, xar = 0, laf = 0, sf = 0, cx, cy;
    function eatNum() {
      var sidx, c, isFloat = false, s;
      // eat delims
      while (idx < len) {
        c = pathStr.charCodeAt(idx);
        if (c !== COMMA && c !== SPACE)
          break;
        idx++;
      }
      if (c === MINUS)
        sidx = idx++;
      else
        sidx = idx;
      // eat number
      while (idx < len) {
        c = pathStr.charCodeAt(idx);
        if (DIGIT_0 <= c && c <= DIGIT_9) {
          idx++;
          continue;
        }
        else if (c === PERIOD) {
          idx++;
          isFloat = true;
          continue;
        }
        s = pathStr.substring(sidx, idx);
        return isFloat ? parseFloat(s) : parseInt(s);
      }
      s = pathStr.substring(sidx);
      return isFloat ? parseFloat(s) : parseInt(s);
    }
    function nextIsNum() {
      var c;
      // do permanently eat any delims...
      while (idx < len) {
        c = pathStr.charCodeAt(idx);
        if (c !== COMMA && c !== SPACE)
          break;
        idx++;
      }
      c = pathStr.charCodeAt(idx);
      return (c === MINUS || (DIGIT_0 <= c && c <= DIGIT_9));
    }
    var canRepeat;
    activeCmd = pathStr[0];
    while (idx <= len) {
      canRepeat = true;
      switch (activeCmd) {
          // moveto commands, become lineto's if repeated
        case 'M':
          x = eatNum();
          y = eatNum();
          path.moveTo(x, y);
          activeCmd = 'L';
          break;
        case 'm':
          x += eatNum();
          y += eatNum();
          path.moveTo(x, y);
          activeCmd = 'l';
          break;
        case 'Z':
        case 'z':
          canRepeat = false;
          if (x !== firstX || y !== firstY)
            path.lineTo(firstX, firstY);
          break;
          // - lines!
        case 'L':
        case 'H':
        case 'V':
          nx = (activeCmd === 'V') ? x : eatNum();
          ny = (activeCmd === 'H') ? y : eatNum();
          path.lineTo(nx, ny);
          x = nx;
          y = ny;
          break;
        case 'l':
        case 'h':
        case 'v':
          nx = (activeCmd === 'v') ? x : (x + eatNum());
          ny = (activeCmd === 'h') ? y : (y + eatNum());
          path.lineTo(nx, ny);
          x = nx;
          y = ny;
          break;
          // - cubic bezier
        case 'C':
          x1 = eatNum(); y1 = eatNum();
        case 'S':
          if (activeCmd === 'S') {
            x1 = 2 * x - x2; y1 = 2 * y - y2;
          }
          x2 = eatNum();
          y2 = eatNum();
          nx = eatNum();
          ny = eatNum();
          path.bezierCurveTo(x1, y1, x2, y2, nx, ny);
          x = nx; y = ny;
          break;
        case 'c':
          x1 = x + eatNum();
          y1 = y + eatNum();
        case 's':
          if (activeCmd === 's') {
            x1 = 2 * x - x2;
            y1 = 2 * y - y2;
          }
          x2 = x + eatNum();
          y2 = y + eatNum();
          nx = x + eatNum();
          ny = y + eatNum();
          path.bezierCurveTo(x1, y1, x2, y2, nx, ny);
          x = nx; y = ny;
          break;
          // - quadratic bezier
        case 'Q':
          x1 = eatNum(); y1 = eatNum();
        case 'T':
          if (activeCmd === 'T') {
            x1 = 2 * x - x1;
            y1 = 2 * y - y1;
          }
          nx = eatNum();
          ny = eatNum();
          path.quadraticCurveTo(x1, y1, nx, ny);
          x = nx;
          y = ny;
          break;
        case 'q':
          x1 = x + eatNum();
          y1 = y + eatNum();
        case 't':
          if (activeCmd === 't') {
            x1 = 2 * x - x1;
            y1 = 2 * y - y1;
          }
          nx = x + eatNum();
          ny = y + eatNum();
          path.quadraticCurveTo(x1, y1, nx, ny);
          x = nx; y = ny;
          break;
          // - elliptical arc
        case 'A':
          rx = eatNum();
          ry = eatNum();
          xar = eatNum() * DEGS_TO_RADS;
          laf = eatNum();
          sf = eatNum();
          nx = eatNum();
          ny = eatNum();
          if (rx !== ry) {
            console.warn("Forcing elliptical arc to be a circular one :(",
                         rx, ry);
          }
          // SVG implementation notes does all the math for us! woo!
          // http://www.w3.org/TR/SVG/implnote.html#ArcImplementationNotes
          // step1, using x1 as x1'
          x1 = Math.cos(xar) * (x - nx) / 2 + Math.sin(xar) * (y - ny) / 2;
          y1 = -Math.sin(xar) * (x - nx) / 2 + Math.cos(xar) * (y - ny) / 2;
          // step 2, using x2 as cx'
          var norm = Math.sqrt(
            (rx*rx * ry*ry - rx*rx * y1*y1 - ry*ry * x1*x1) /
            (rx*rx * y1*y1 + ry*ry * x1*x1));
          if (laf === sf)
            norm = -norm;
          x2 = norm * rx * y1 / ry;
          y2 = norm * -ry * x1 / rx;
          // step 3
          cx = Math.cos(xar) * x2 - Math.sin(xar) * y2 + (x + nx) / 2;
          cy = Math.sin(xar) * x2 + Math.cos(xar) * y2 + (y + ny) / 2;
          var u = new THREE.Vector2(1, 0),
              v = new THREE.Vector2((x1 - x2) / rx,
                                    (y1 - y2) / ry);
          var startAng = Math.acos(u.dot(v) / u.length() / v.length());
          if (u.x * v.y - u.y * v.x < 0)
            startAng = -startAng;
          // we can reuse 'v' from start angle as our 'u' for delta angle
          u.x = (-x1 - x2) / rx;
          u.y = (-y1 - y2) / ry;
          var deltaAng = Math.acos(v.dot(u) / v.length() / u.length());
          // This normalization ends up making our curves fail to triangulate...
          if (v.x * u.y - v.y * u.x < 0)
            deltaAng = -deltaAng;
          if (!sf && deltaAng > 0)
            deltaAng -= Math.PI * 2;
          if (sf && deltaAng < 0)
            deltaAng += Math.PI * 2;
          path.absarc(cx, cy, rx, startAng, startAng + deltaAng, sf);
          x = nx;
          y = ny;
          break;
        default:
          throw new Error("weird path command: " + activeCmd);
      }
      if (firstX === null) {
        firstX = x;
        firstY = y;
      }
      // just reissue the command
      if (canRepeat && nextIsNum())
        continue;
      activeCmd = pathStr[idx++];
    }

    if (path !== this) return path;
  };

  // Loader
  Dimensions.Loader = {
    _onLoad: function () {},
    _textures: [],

    onLoad: function (cb) {
      Dimensions.Loader._onLoad = cb;
      if (!Dimensions.Loader._textures.length) {
        this._loaded = true;
        Dimensions.Loader._onLoad();
      }
    },

    loadTexture: function (src, cb) {
      Dimensions.Loader._textures.push(src);
      var loader = new THREE.TextureLoader();
      loader.load(
        src,
        function (texture) {
          Dimensions.Loader._textures = _.without(Dimensions.Loader._textures, src);
          if (_.isFunction(cb)) {
            cb(texture);
          }
          Dimensions.Loader._afterEachLoad();
        },
        function (xhr) {
          // console.log( (xhr.loaded / xhr.total * 100) + '% loaded' );
        },
        function (xhr) { console.warn('Couldn\'t load texture:', src); }
      );
    },
    _afterEachLoad: function () {
      if (Dimensions.Loader._textures.length === 0 && !this._loaded) {
        this._loaded = true;
        Dimensions.Loader._onLoad();
      }
    }
  };

  Dimensions.Helpers = {
    // scale -> 1 is original size; offset -> relative to 1
    ExtrudeGeometryUVGenerator: function(scalex, scaley, offsetx, offsety) {
      var offset = new THREE.Vector2(offsetx, offsety);
      return {
        generateTopUV: function (geometry, indexA, indexB, indexC) {
          var vertices = geometry.vertices;
          geometry.computeBoundingBox();

          var a = vertices[indexA];
          var b = vertices[indexB];
          var c = vertices[indexC];

          var bb = geometry.boundingBox;
          var bbx = bb.max.x - bb.min.x;
          var bby = bb.max.y - bb.min.y;

          var transform = function(point) {
            var v = new THREE.Vector2((point.x - bb.min.x) / bbx, 1 - (point.y - bb.min.y) / bby);
            v.add(offset);
            return v.set(v.x/scalex, v.y/scaley);
          };

          return [transform(a), transform(b), transform(c)];
        },

        // TODO: use scale and offsets
        generateSideWallUV: function(geometry, indexA, indexB, indexC, indexD) {
          var vertices = geometry.vertices;
          geometry.computeBoundingBox();

          var ax = vertices[indexA].x,
              ay = vertices[indexA].y,
              az = vertices[indexA].z,

              bx = vertices[indexB].x,
              by = vertices[indexB].y,
              bz = vertices[indexB].z,

              cx = vertices[indexC].x,
              cy = vertices[indexC].y,
              cz = vertices[indexC].z,

              dx = vertices[indexD].x,
              dy = vertices[indexD].y,
              dz = vertices[indexD].z;

          var bb = geometry.boundingBox,
              amt = bb.max.z - bb.min.z,
              bbx = bb.max.x - bb.min.x,
              bby = bb.max.y - bb.min.y;

          if ( Math.abs( ay - by ) < 0.01 ) {
            return [
              new THREE.Vector2( ax / bbx, az / amt),
              new THREE.Vector2( bx / bbx, bz / amt),
              new THREE.Vector2( cx / bbx, cz / amt),
              new THREE.Vector2( dx / bbx, dz / amt)
            ];
          } else {
            return [
              new THREE.Vector2( ay / bby, az / amt ),
              new THREE.Vector2( by / bby, bz / amt ),
              new THREE.Vector2( cy / bby, cz / amt ),
              new THREE.Vector2( dy / bby, dz / amt )
            ];
          }
        }
      };
    }
  };

  return Dimensions;
});
