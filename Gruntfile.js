'use strict';

module.exports = function(grunt) {

  require('load-grunt-tasks')(grunt);

  var config = grunt.file.readJSON('config.json');
  var revistion = Math.random().toString(36).substr(2);

  grunt.initConfig({
    config: config,
    revistion: revistion,

    suitcss: {
      build: {
        files: {
          'static/build/posties.css': 'static/css/setup.css'
        }
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
          'bower_components/blueimp-load-image/js/load-image.all.min.js',
          'bower_components/blueimp-canvas-to-blob/js/canvas-to-blob.js',
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
        accessKeyId: '<%= config.s3.key %>',
        secretAccessKey: '<%= config.s3.secret %>',
        bucket: '<%= config.s3.bucket %>',
        region: '<%= config.s3.region %>',
        headers: {
          CacheControl: 'public, max-age=31377926' // one year
        }
      },
      build: {
        cwd: "static/build/",
        src: "**",
        dest: "assets/"
      }
    },

    replace: {
      css: {
        src: ['static/build/*.css'],
        overwrite: true,
        replacements: [{
          from: /..\/img\//ig,
          to: ''
        }, {
          from: /..\/font\//ig,
          to: ''
        }]
      },
      setProd: {
        src: ['config.json'],
        overwrite: true,
        replacements: [{
          from: '"environment": "dev"',
          to: '"environment": "prod"'
        }, {
          from: '"revision": ""',
          to: '"revision": "<%= revistion %>"'
        }]
      },
      setDev: {
        src: ['config.json'],
        overwrite: true,
        replacements: [{
          from: '"environment": "prod"',
          to: '"environment": "dev"'
        }, {
          from: '"revision": "<%= config.revision %>"',
          to: '"revision": ""'
        }]
      }
    },

    rename: {
      jsProd: {
        src: 'static/build/posties.js',
        dest: 'static/build/posties.<%= revistion %>.js'
      },
      cssProd: {
        src: 'static/build/posties.css',
        dest: 'static/build/posties.<%= revistion %>.css'
      },
      jsDev: {
        src: 'static/build/posties.<%= config.revision %>.js',
        dest: 'static/build/posties.js'
      },
      cssDev: {
        src: 'static/build/posties.<%= config.revision %>.css',
        dest: 'static/build/posties.css'
      }
    },

    /**
     * Bind Grunt tasks
     */

    watch: {
      css: {
        files: ['static/css/**/*'],
        tasks: ['suitcss', 'replace:css'],
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
    'replace:css',
    'copy',
    'concat'
  ]);


  grunt.registerTask('deploy', [
    'build',
    'cssmin',
    'ngAnnotate',
    'uglify',
    'setProd',
    's3',
  ]);

  grunt.registerTask('setProd', [
    'replace:setProd',
    'rename:jsProd',
    'rename:cssProd'
  ]);

  grunt.registerTask('setDev', [
    'replace:setDev',
    'rename:jsDev',
    'rename:cssDev'
  ]);
};
