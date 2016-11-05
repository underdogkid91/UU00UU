/*global module:false*/
module.exports = function(grunt) {
  grunt.loadNpmTasks('grunt-contrib-copy');
  grunt.loadNpmTasks("grunt-requirejs");
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-env');
  grunt.loadNpmTasks('grunt-jekyll');
  grunt.loadNpmTasks('grunt-surge');

  var exp_main_files = grunt.file.expand('_src/experiments/*.js');
  var requirejsOptions = {};
  var requirejsTasks = [];

  exp_main_files.forEach(function(file) {
    var filename = file.split('/').pop().replace('.js', '');
    requirejsTasks.push('requirejs:' + filename);
    requirejsOptions[filename] = {
      options: {
        mainConfigFile: '_src/config.js',
        baseUrl: '_src',
        paths: {
          three: 'vendor/three',
          underscore: 'vendor/underscore'
        },
        include: ['experiments/' + filename + '.js'],
        out: '_staging/js/e/' + filename + '.js',
        almond: true,
        optimize: 'uglify2',
        generateSourceMaps: false,
        preserveLicenseComments: false
      }
    };
  });

  grunt.initConfig({
    copy: {
      js_dev: {
        expand: true,
        cwd: '_src/',
        src: ['**'],
        dest: '_site/src/',
        filter: 'isFile'
      }
    },
    watch: {
      js_dev: {
        files: ['_src/**/*.js'],
        tasks: ['copy:js_dev'],
        options: {
          spawn: false
        }
      }
    },
    requirejs: requirejsOptions,
    surge: {
      deploy: {
        options: {
          project: '_staging/',
          domain: 'uu00uu.surge.sh'
        }
      }
    },
    env: {
      development: {
        JEKYLL_ENV: 'development'
      },
      production: {
        JEKYLL_ENV: 'production'
      }
    },
    jekyll: {
      dev: {
        options: {
          dest: './_site',
          serve: true,
          port: 4000,
          watch: true
        }
      },
      staging: {
        options: {
          dest: './_staging',
          serve: true,
          port: 4001
        }
      },
      production: {
        options: {
          dest: './_staging'
        }
      }
    }
  });

  grunt.registerTask('dev', [
    'env:development',
    'copy:js_dev',
    'jekyll:dev',
    'watch:js_dev'
  ]);
  grunt.registerTask('requirejs_prod', requirejsTasks);
  grunt.registerTask('staging', [
    'env:production',
    'requirejs_prod',
    'jekyll:staging',
    'env:development'
  ]);
  grunt.registerTask('deploy', [
    'env:production',
    'requirejs_prod',
    'jekyll:production',
    'surge:deploy',
    'env:development'
  ]);

};
