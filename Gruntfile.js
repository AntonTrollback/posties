'use strict';

module.exports = function(grunt) {

  require('load-grunt-tasks')(grunt);

  var pkg = grunt.file.readJSON('package.json');
  var secret = grunt.file.readJSON('secret.json');

  grunt.initConfig({
    pkg: pkg,
    secret: secret,

    /**
     * CSS related
     */

    suitcss: {
      build: {
        files: {
          'static/build/posties.css': 'static/css/setup.css'
        }
      }
    },

    replace: {
      build: {
        src: ['static/build/*.css'],
        overwrite: true,
        replacements: [{
          from: /..\/img\//ig,
          to: ''
        }, {
          from: /..\/font\//ig,
          to: ''
        }]
      }
    },

    cssmin: {
      build: {
        files: {
          'static/build/posties.css': 'static/build/posties.css'
        }
      }
    },

    /**
     * JS related
     */

    concat: {
      options: {
        separator: ';',
        stripBanners: true
      },
      build: {
        src: [
          'bower_components/jquery/dist/jquery.js',
          'bower_components/angular/angular.js',
          'bower_components/angular-sanitize/angular-sanitize.js',
          'bower_components/angular-route/angular-route.js',
          'bower_components/jquery-minicolors/jquery.minicolors.js',
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

    ngAnnotate: {
      dist: {
        files: {
          'static/build/posties.js': 'static/build/posties.js'
        }
      }
    },

    uglify: {
      build: {
        preserveComments: false,
        files: {
          'static/build/posties.js': 'static/build/posties.js'
        }
      }
    },

    /**
     * Copy assets
     */

    copy: {
      build: {
        files: [{
          expand: true,
          flatten: true,
          src: ['static/img/*', 'static/font/*'],
          dest: 'static/build/'
        }]
      }
    },

    /**
     * Deploy
     */

    s3: {
      options: {
        accessKeyId: '<%= secret.s3Key %>',
        secretAccessKey: '<%= secret.s3Secret %>',
        bucket: '<%= secret.s3Bucket %>',
        region: '<%= secret.s3Region %>'
      },
      build: {
        cwd: "static/build/",
        src: "**",
        dest: "assets/"
      }
    },

    /**
     * Bind Grunt tasks
     */

    watch: {
      css: {
        files: ['static/css/**/*'],
        tasks: ['suitcss', 'replace'],
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
    'replace',
    'cssmin',
    'copy',
    'concat'
  ]);


  grunt.registerTask('deploy', [
    'build',
    'ngAnnotate',
    'uglify',
    's3'
  ]);
};
