'use strict';

module.exports = function(grunt) {
  require('load-grunt-tasks')(grunt);

  grunt.initConfig({

    cssnext: {
      build: {
        options: {
          sourcemap: false,
          url: false,
          compress: false
        },
        files: {
          'dist/posties.css': 'src/css/index.css'
        }
      },
      buildcompress: {
        options: {
          sourcemap: false,
          url: false,
          compress: true
        },
        files: {
          'dist/posties.css': 'src/css/index.css'
        }
      }
    },

    concat: {
      options: {
        separator: ';',
        stripBanners: true
      },
      build: {
        src: [
          'bower_components/svg4everybody/svg4everybody.js',
          'bower_components/jquery/dist/jquery.js',
          'bower_components/angular/angular.js',
          'bower_components/angular-sanitize/angular-sanitize.js',
          'bower_components/angular-route/angular-route.js',
          'bower_components/angulartics/src/angulartics.js',
          'bower_components/angulartics/src/angulartics-ga.js',
          'bower_components/jquery-minicolors/jquery.minicolors.js',
          'bower_components/Autolinker.js/dist/Autolinker.js',
          'bower_components/medium-editor/dist/js/medium-editor.js',
          'bower_components/imagesloaded/imagesloaded.pkgd.js',
          'src/js/util.js',
          'src/js/services.js',
          'src/js/directives.js',
          'src/js/filters.js',
          'src/js/controllers.js'
        ],
        dest: 'dist/posties.js',
      }
    },

    ngAnnotate: {
      dist: {
        files: {
          'dist/posties.js': 'dist/posties.js'
        }
      }
    },

    uglify: {
      build: {
        preserveComments: false,
        files: {
          'dist/posties.js': 'dist/posties.js'
        }
      }
    },

    copy: {
      build: {
        files: [{
          expand: true,
          flatten: true,
          src: ['src/img/*', 'src/font/*'],
          dest: 'dist/'
        }]
      }
    }
  });

  grunt.registerTask('build', [
    'cssnext:build',
    'copy',
    'concat'
  ]);

  grunt.registerTask('buildcompress', [
    'cssnext:buildcompress',
    'copy',
    'concat',
    'ngAnnotate',
    'uglify'
  ]);

  grunt.registerTask('default', ['build']);

};
