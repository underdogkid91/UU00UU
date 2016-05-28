//
// xxInput
// -------
// Easy futuristic non intrusive range inputs for touch screens
//
// Example:
// var i = new xxInput('bottom');
//
// i.setValue(20);
//
// i.onChange(function (value) {
//   console.log(value);
// });
//
// TODO:
// - suport position
// - suport setValue
// - suport multitouch

define(function () {

  var xxInput = function (position) {
    this._position = position;
    this._generateDOMElement();
    this._initEvents();
    this.setAngle(0);
    this._events = [];
    this._onMove = function () {
      xxInput.prototype._onMove.apply(this, arguments);
    };
  };

  xxInput.prototype = {
    _generateDOMElement: function () {
      this.el = document.createElement('div');
      this.el.classList.add('xx-input');
      this.el.classList.add('xx-input--inactive');
      this.el.classList.add('xx-input--' + this._position);

      var trigger = document.createElement('div');
      trigger.classList.add('xx-trigger');
      this.el.appendChild(trigger);

      var guide = document.createElement('div');
      guide.classList.add('xx-guide');
      this.el.appendChild(guide);

      this.marker_el = document.createElement('div');
      this.marker_el.classList.add('xx-marker');
      guide.appendChild(this.marker_el);

      document.body.appendChild(this.el);
    },

    _initEvents: function () {
      var self = this;
      this.el.addEventListener('mousedown', function (e) {
        e.preventDefault();
        self.setActive.call(self, e);
      });
      this.el.addEventListener('touchstart', function (e) {
        e.preventDefault();
        self.setActive.call(self, e);
      });
      this.el.addEventListener('mouseup', function (e) {
        e.preventDefault();
        self.setInactive.call(self, e);
      });
      this.el.addEventListener('touchend', function (e) {
        e.preventDefault();
        self.setInactive.call(self, e);
      });
      this.el.addEventListener('touchmove', function (e) {
        var t = e.touches[0];
        var x = t.clientX - self.el.offsetLeft;
        var y = t.clientY - self.el.offsetTop;
        self._onMove(x, y);
      });
    },

    setAngle: function (a) {
      this.marker_el.style.top = 150 + 150 * -Math.sin(a) + 'px';
      this.marker_el.style.left = 150 + 150 * -Math.cos(a) + 'px';
    },

    setActive: function () {
      this.el.classList.remove('xx-input--inactive');
      this.el.classList.add('xx-input--active');
    },

    setInactive: function () {
      this.el.classList.remove('xx-input--active');
      this.el.classList.add('xx-input--inactive');
    },

    // x and y relative to el center
    _onMove: function (x, y) {
      var a = Math.atan(y/x) - (x >= 0 ? - Math.PI : 0);
      this._value = (a + Math.PI / 2) / Math.PI;
      switch (this._position) {
        case 'bottom':
          this._value -= 0.5;
          break;
        case 'left':
          this._value -= 1;
          break;
        case 'left':
          if (this._value < 1.5) this._value += 2;
          this._value -= 1.5;
          this._value = 1 - this._value;
          break;
      }
      console.log(this._value);
      var self = this;
      this._events.forEach(function (cb) {
        cb(self._value);
      });
      this.setAngle(a);
    },

    onChange: function (cb) {
      this._events.push(cb);
    }
  };

  return xxInput;
});

