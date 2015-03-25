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
      libs: {
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
        ],
        dest: 'dist/libs.js',
      },
      custom: {
        src: [
          'src/js/init.js',
          'src/js/util.js',
          'src/js/services.js',
          'src/js/directives.js',
          'src/js/filters.js',
          'src/js/controllers.js'
        ],
        dest: 'dist/index.js',
      },
      combined: {
        src: [
          'dist/libs.js',
          'dist/index.js'
        ],
        dest: 'dist/posties.js',
      },
    },

    jshint: {
      options: {
        jshintrc: true
      },
      all: {
        src: ['src/js/**/*.js'],
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
    },

    watch: {
      css: {
        files: ['src/css/**/*.css'],
        tasks: ['cssnext:build'],
        options: {
          spawn: false,
        }
      },
      js: {
        files: ['src/js/**/*.js'],
        tasks: ['jshint', 'concat:libs', 'concat:custom'],
        options: {
          spawn: false
        }
      }
    }
  });

  grunt.registerTask('build', [
    'cssnext:build',
    'copy',
    'jshint',
    'concat:libs',
    'concat:custom'
  ]);

  grunt.registerTask('buildcompress', [
    'cssnext:buildcompress',
    'copy',
    'concat:libs',
    'concat:custom',
    'concat:combined',
    'ngAnnotate',
    'uglify'
  ]);

  grunt.registerTask('default', ['build']);

};
