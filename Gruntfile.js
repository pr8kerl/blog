/*
 * Generated on 2014-05-24
 * generator-assemble v0.4.11
 * https://github.com/assemble/generator-assemble
 *
 * Copyright (c) 2014 Hariadi Hinta
 * Licensed under the MIT license.
 */

'use strict';

// # Globbing
// for performance reasons we're only matching one level down:
// '<%= site.src %>/templates/pages/{,*/}*.hbs'
// use this if you want to match all subfolders:
// '<%= site.src %>/templates/pages/**/*.hbs'

module.exports = function(grunt) {

  require('time-grunt')(grunt);
  var pretty = require('pretty');

  // Project configuration.
  grunt.initConfig({

    // Project metadata
    pkg: grunt.file.readJSON('package.json'),
    site: grunt.file.readYAML('site.yml'),
    aws: grunt.file.readJSON("../aws-grunt.json"),

    watch: {
      assemble: {
        files: ['src/{content,data,templates,style}/{,*/,**/}*.{md,hbs,yml,less}'],
        tasks: ['less','assemble']
      },
      livereload: {
        options: {
          livereload: '<%= connect.options.livereload %>'
        },
        files: [
          '_site/{,*/}*.html',
          '_site/{,*/}*.css',
          '_site/{,*/}*.js',
          '_site/{,*/}*.{png,jpg,jpeg,gif,webp,svg}'
        ]
      }
    },

    connect: {
      options: {
        port: 9000,
        livereload: 35729,
        // change this to '0.0.0.0' to access the server from outside
        hostname: 'localhost'
      },
      livereload: {
        options: {
          open: true,
          base: [
            '_site'
          ]
        }
      }
    },

    // Compile Less to CSS
    less: {
      options: {
        paths: ['<%= site.styles %>', '<%= site.styles %>/bootstrap' ]
      },  
      pages: {
        src: ['<%= site.styles %>/style.less'],
        dest: '<%= site.assets %>/css/style.css'
      }   
    },  

    assemble: {
      options: {
        flatten: true,
        today: '<%= grunt.template.today() %>',
        pkg: '<%= pkg %>',
        site: '<%= site %>',
        data: '<%= site.data %>/*.{json,yml}',
        // Extensions
        plugins: '<%= site.plugins %>',
        layoutdir: '<%= site.layouts %>',
        layout: 'default.hbs',
        partials: '<%= site.partials %>/*.hbs',
        marked: {
          process: true,
        },  
        postprocess: pretty
      },
      pages: {
        files: {
          '<%= site.dest %>/': ['<%= site.src %>/templates/pages/*.hbs']
        }
      },
      blog: {
        options: {
          layout: 'blog.hbs',
        },
        files: {
          '<%= site.dest %>/blog/': ['<%= site.src %>/templates/pages/blog/*.hbs','<%= site.content %>/posts/*.md']
        }
      }
    },

    // publish to github pages
    git_deploy: {
      github: {
        options: {
          url: '<%= site.ghpages %>',
          branch: 'master'
        },
        src: '<%= site.dest %>'
      },
    },

    s3: {
      options: {
        accessKeyId: "<%= aws.accessKeyId %>",
        secretAccessKey: "<%= aws.secretAccessKey %>",
        access: "public-read",
        region: "ap-southeast-2",
        bucket: "blick.io"
      },
      build: {
        cwd: "_site/",
        src: "**"
      }
    },


    // Before generating any new files,
    // remove any previously-created files.
    clean: ['<%= site.dest %>/**/*.{html,xml}']

  });

  grunt.loadNpmTasks('assemble');
  grunt.loadNpmTasks('assemble-less');
  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-contrib-connect');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-git-deploy');
  grunt.loadNpmTasks('grunt-aws');

  grunt.registerTask('server', [
    'clean',
    'less',
    'assemble',
    'connect:livereload',
    'watch'
  ]);

  grunt.registerTask('build', [
    'clean',
    'less',
    'assemble'
  ]);

  grunt.registerTask('default', [
    'build'
  ]);

};
