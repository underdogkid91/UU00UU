require.config({
  baseUrl: '/src',
  shim: {
    three: { exports: 'THREE' },
    underscore: { exports: '_' }
  },
  paths: {
    three: '/src/vendor/three',
    underscore: '/src/vendor/underscore'
  }
});
