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
          'bower_components/jquery/dist/jquery.js',
          'bower_components/svg4everybody/svg4everybody.js',
          'bower_components/jquery-minicolors/jquery.minicolors.js',
          'node_modules/underscore/underscore.js',
          'node_modules/handlebars/dist/handlebars.runtime.js'
        ],
        dest: 'dist/libs.js',
      },
      custom: {
        src: [
          'src/js/index.js'
        ],
        dest: 'dist/index.js',
      },
      combined: {
        src: [
          'dist/libs.js',
          'dist/templates.js',
          'dist/index.js'
        ],
        dest: 'dist/posties.js',
      },
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
    'concat:libs',
    'concat:custom'
  ]);

  grunt.registerTask('buildcompress', [
    'cssnext:buildcompress',
    'copy',
    'concat:libs',
    'concat:custom',
    'concat:combined',
    'uglify'
  ]);

  grunt.registerTask('default', ['build']);

};
