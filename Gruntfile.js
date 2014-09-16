'use strict';

module.exports = function(grunt) {

  require('load-grunt-tasks')(grunt);

  var pkg = grunt.file.readJSON('package.json');

  grunt.initConfig({
    pkg: pkg,

    // CSS
    // Concat, validate, preprocess and minify

    suitcss: {
      'build': {
        files: {
          'static/build/posties.css': ['static/css/setup.css']
        }
      }
    },

    cssmin: {
      combine: {
        files: {
          'static/build/posties.css': ['static/build/posties.css']
        }
      }
    },

    // JS
    // Concat and uglify

    uglify: {
      'build': {
        preserveComments: false,
        files: {
          'static/build/posties.js': ['static/build/posties.js']
        }
      }
    },

    // Project configuration.
    concat: {
      options: {
        separator: ';',
        stripBanners: true
      },
      dist: {
        src: [
          'bower_components/jquery/dist/jquery.js',
          'bower_components/angular/angular.js',
          'bower_components/angular-sanitize/angular-sanitize.js',
          'bower_components/angular-route/angular-route.js',
          'bower_components/angular-bootstrap-colorpicker/js/bootstrap-colorpicker-module.js',
          'bower_components/ng-file-upload/angular-file-upload.js',
          'bower_components/Autolinker.js/dist/Autolinker.js',
          'static/js/s3upload.js',
          'static/js/util.js',
          'static/js/services.js',
          'static/js/filters.js',
          'static/js/directives.js',
          'static/js/controllers.js'
        ],
        dest: 'static/build/posties.js',
      },
    },

    // Copy assets

    copy: {
      'to build folder': {
        files: [{
          expand: true,
          flatten: true,
          src: ['static/img/*', 'static/font/*'],
          dest: 'static/build/'
        }]
      }
    },

    // Watch task

    watch: {
      css: {
        files: ['static/css/**/*'],
        tasks: ['suitcss'],
        options: {
          spawn: false
        }
      },
      js: {
        files: ['static/js/**/*'],
        tasks: ['concat'],
        options: {
          spawn: false
        }
      },
      assets: {
        files: ['static/img/**/*', 'static/font/**/*'],
        tasks: ['copy'],
        options: {
          spawn: false
        }
      }
    }
  });

  grunt.registerTask('default', ['build']);
  grunt.registerTask('build', [
    'suitcss',
    'cssmin',
    'concat',
    //'uglify',
    'copy'
  ]);
};
