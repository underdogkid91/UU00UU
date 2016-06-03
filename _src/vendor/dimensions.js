define([
  'three',
  'underscore'
], function (
  THREE,
  _
) {

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
      this._renderer = new THREE.WebGLRenderer({ antialias: true });
      this._renderer.setPixelRatio(window.devicePixelRatio);
      this._renderer.setSize(options.width, options.height);
      this._renderer.setClearColor(options.clear_color, 1);
      this._el = this._renderer.domElement;
      this._el.style.position = 'fixed';
      this._el.style.top = 0;
      this._el.style.left = 0;
      this._el.style['z-index'] = 2000;

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

    forceFullScreen: function () {
      this.setFullScreen();
      window.addEventListener("resize", _.bind(this.setFullScreen, this));
    },

    render: function () {
      this._renderer.render(this._scene._scene, this._scene._camera);
    },

    renderAlive: function (ms) {
      this.render();
      requestAnimationFrame(_.bind(this.renderAlive, this));
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


  // Dimensions.Scene
  // ----------------
  // Extend this class to create your own scenes. Add the addObjects
  // methods to add objects to the scene and the init method to set it up.
  // init runs first, then addobjects
  // use the method addObject in addObjects
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
      options.camera = options.camera || {};
      options.camera = _.extend({}, this._defaults.camera, options.camera);
      this.generateCamera(options.camera);
      this.setCameraPosition(options.camera.position);
      if (_.isFunction(this.addObjects)) {
        this.addObjects();
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
          var method = "_set" + split[0].replace(/./g, function(c, i) { return i === 0 ? c.toUpperCase() : c.toLowerCase(); });
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
      this._objects = {};
      this._object = new THREE.Object3D();
      // TODO: prepopulate position, rotation and scale with 0s?
      // clean properties: 'geometry' and 'material'
      if (_.isFunction(this.addObjects)) {
        this.addObjects();
      }
      this.set(_.extend({}, this._properties, properties));
    },

    set: function (properties, value) {
      // Save
      if (!_.isObject(properties)) {
        var p = properties;
        properties = {};
        properties[p] = value;
      }
      // Update
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
          var method = "_set" + split[0].replace(/./g, function(c, i) { return i === 0 ? c.toUpperCase() : c.toLowerCase(); });
          if (_.isFunction(this[method])) {
            this[method].call(this, val);
          }
        }
      }, this);
      _.extend(this._properties, properties);
    },

    get: function (property) {
      return this._properties[property];
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

    // Doesnt work if more than one material
    setMaterialColor: function (color) {
      this._material.color.set(color);
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
        this._object.add(this._mesh);
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
          } else {
            face.materialIndex = 0;
          }
        }, this);
      },

      getGeometry: function () {
        return this._geometry;
      },

      clone: function () {
        var c = new Dimensions.Object();
        c._hasMesh = true;
        c._geometry = this._geometry;
        c._material = this._material;
        c._materials = this._material;
        c._mesh = this._mesh.clone();
        c._object.add(c._mesh);
        return c;
      }
    });
  });


  // Dimensions.Material
  // -------------------

  // Gradient Shader
  var gradient_vertex_shader =
    "uniform float width;" +
    "uniform float height;" +
    "varying float x;" +
    "varying float y;" +
    "void main() {" +
    "    vec4 v = projectionMatrix * modelViewMatrix * vec4(position, 1.0);" +
    "    x = v.x;" +
    "    y = v.y;" +
    "    gl_Position = v;" +
    "}";
  var gradient_fragment_shader =
    "varying float x;" +
    "varying float y;" +
    "void main() {" +
    "    vec4 top = vec4(1.0, 0.0, 1.0, 1.0);" +
    "    vec4 bottom = vec4(1.0, 1.0, 0.0, 1.0);" +
    "    gl_FragColor = vec4(mix(bottom, mix(bottom, top, (y / 5.0)), (x/ 5.0)));" +
    "}";

  var Material = Dimensions.Material = Class.extend({
    initialize: function (type, options) {
      options = options || {};
      switch (type) {
      case 'image':
        this._material = new THREE.MeshBasicMaterial();
        this._material.needsUpdate = true;
        var self = this;
        Dimensions.Loader.loadTexture(options.src, function (texture) {
          self._material.map = texture;
        });
        break;
      case 'gradient':
        // TODO
        this._material = new THREE.ShaderMaterial({
          uniforms: {
            start: { type: "f", value: window.innerWidth },
            end: { type: "f", value: window.innerHeight }
          },
          vertexShader: gradient_vertex_shader,
          fragmentShader: gradient_fragment_shader
        });
        break;
      case 'color':
        this._material = new THREE.MeshBasicMaterial({
          color: options.bg
        });
        break;
      case 'wireframe':
        this._material = new THREE.MeshBasicMaterial({
          wireframe: true
        });
        break;
      default:
        this._material = new THREE.MeshBasicMaterial({
          color: 0xffffff
        });
      }

      if (options.opacity) {
        this._material.transparent = true;
        this._material.opacity = options.opacity;
      }
    },

    setColor: function (color) {
      this._material.color.set(color);
    }
  });

  // Always use normalized t and * amplitude and + start value
  // start time, end time, time
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

  // Loader
  Dimensions.Loader = {
    _onLoad: function () {},
    _textures: [],

    onLoad: function (cb) {
      Dimensions.Loader._onLoad = cb;
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
      if (Dimensions.Loader._textures.length === 0) {
        Dimensions.Loader._onLoad();
      }
    }
  };

  return Dimensions;
});
