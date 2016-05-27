/*global module:false*/
module.exports = function(grunt) {
  grunt.loadNpmTasks("grunt-requirejs");
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-surge');

  var exp_main_files = grunt.file.expand('_src/experiments/*.js');
  var requirejsOptions = {};
  var watchOptions = {};

  exp_main_files.forEach(function(file) {
    var filename = file.split('/').pop().replace('.js', '');
    requirejsOptions[filename] = {
      options: {
        almond: true,
        baseUrl: '_src',
        include: ['experiments/UU00UUE1.js'],
        out: '_site/js/e/UU00UUE1.js',
        shim: {
          'three': { exports: 'THREE' },
          'tuna': { exports: 'Tuna' },
          'underscore': {exports: '_'}
        },
        paths: {
          vendor: 'vendor/',
          three: 'vendor/three.min',
          tuna: 'vendor/tuna',
          LL00: 'vendor/LL00',
          underscore: 'vendor/underscore'
        },
        optimize: 'uglify2',
        generateSourceMaps: true,
        preserveLicenseComments: false,
        useSourceUrl: true
      }
    };
    watchOptions[filename] = {
      files: ['_src/**/*.js'],
      tasks: ['requirejs:'+filename],
      options: {
        spawn: false
      }
    };
  });

  grunt.initConfig({
    requirejs: requirejsOptions,
    watch: watchOptions,
    surge: {
      uu00uu: {
        options: {
          project: '_site/',
          domain: 'uu00uu.surge.sh'
        }
      }
    }
  });

  grunt.registerTask('build', ['requirejs']);
  exp_main_files.forEach(function(file) {
    var filename = file.split('/').pop().replace('.js', '');
    grunt.registerTask(
      'dev:'+filename,
      ['requirejs:' + filename, 'watch:' + filename]
    );
  });
  grunt.registerTask('deploy', ['requirejs', 'surge']);

};
