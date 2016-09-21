//  LL00
//  Example
//  -------
//  ```
//  var l = new LL00({
//    bps: 120,
//    bars: 4
//  });
//  var base = l.addChannel('base', '/textures/base.wav');
//
//  var bubbles = l.addChannel('bubbles', '/textures/bubbles.wav');
//
//  var t = bubbles.addEffect('Tremolo', {
//    intensity: 0.75,    //0 to 1
//    rate: 4,            //0.001 to 8
//    stereoPhase: 0,     //0 to 180
//    bypass: 0
//  });
//
//  l.play();
//  ```
//
// TODO
// ----
// - once stopped, LL00 can not be started again
//

define(['tuna'], function (Tuna) {
  // audio context
  var AudioContext = window.AudioContext||window.webkitAudioContext;
  var context = new AudioContext();
  var tuna = new Tuna(context);

  // Channel factory
  var Channel = function (url, _options) {
    this.buffer = context.createBufferSource();
    this.loaded = false;
    this._effects = {};
    this._effects_chain = [];
    this._loadFromUrl(url);
  };

  Channel.prototype = {
    // play channel starting at t
    start: function (t) {
      if (this.loaded) {
        this._connectChain();
        this.buffer.start(t);
      } else {
        console.warn('Channel is still not loaded');
      }
    },

    // stop channel
    stop: function () {
      this.buffer.stop();
    },

    // adds an effect to the channel
    addEffect: function (name, _options) {
      if (this._effects[name]) {
        console.warn('This channel already has a ' + name);
        return;
      }
      var effect = new tuna[name](_options);
      this._effects[name] = effect;
      this._effects_chain.push(effect);
      return effect;
    },

    // connects buffer to effects to destination
    _connectChain: function () {
      if (!this._effects_chain.length) {
        this.buffer.connect(context.destination);
      } else {
        this.buffer.connect(this._effects_chain[0]);
        for (var i = 1; i < this._effects_chain.length; i++) {
          this._effects_chain[i - 1].connect(this._effects_chain[i]);
        }
        this._effects_chain[this._effects_chain.length - 1].connect(context.destination);
      }
    },

    // loads buffor from a given url
    _loadFromUrl: function (url) {
      var request = new XMLHttpRequest();
      request.open('GET', url, true);
      request.responseType = 'arraybuffer';
      var self = this;
      request.onload = function() {
        var audio_data = request.response;
        context.decodeAudioData(audio_data, function(_buffer) {
          self.buffer.buffer = _buffer;
          //buffer.playbackRate.value = playbackControl.value;
          self.buffer.loop = true;
          self.loaded = true;
        },
        function(e){
          console.warn('Error with decoding audio data' + e.err);
          self.loaded = false;
        });
      };
      request.send();
    }
  };

  // LL00 factory
  var LL00 = function (_options) {
    this.options = {
      bps: _options.bps || 120,
      bars: _options.bars || 4
    };

    // save references to all channels
    this._channels = {};
  };

  LL00.prototype = {
    // play LL00
    play: function () {
      var ids = Object.keys(this._channels);
      for (var i = 0; i < ids.length; i++) {
        this._channels[ids[i]].start(0);
      }
    },

    // pause LL00
    pause: function () {
      var ids = Object.keys(this._channels);
      for (var i = 0; i < ids.length; i++) {
        this._channels[ids[i]].stop();
      }
    },

    // add a channel with an id
    addChannel: function (id, url, _options) {
      this._channels[id] = new Channel(url, _options);
      return this._channels[id];
    },

    // remove a channel using an id
    removeChannel: function (id) {
      delete this._channels[id];
    },

    // callback when all channels are loaded
    onLoad: function (cb) {}
  }

  // export
  window.LL00 = LL00;
  return LL00;
});
