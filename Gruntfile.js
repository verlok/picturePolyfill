/*global module:false*/
module.exports = function(grunt) {

	// Project configuration.
	grunt.initConfig({
		// Metadata.
		meta: {
			version: '4.1.2'
		},
		banner: '/*! picturePolyfill - v<%= meta.version %> - ' +
			'<%= grunt.template.today("yyyy-mm-dd") %>\n' +
			'* https://github.com/verlok/picturePolyfill/\n' +
			'* Copyright (c) <%= grunt.template.today("yyyy") %> ' +
			'Andrea "verlok" Verlicchi; Licensed MIT */\n',
		// Task configuration.
		uglify: {
			options: {
				banner: '<%= banner %>'
			},
			dist: {
				src: 'src/picturePolyfill.js',
				dest: 'dist/picturePolyfill.min.js'
			}
		},
		jshint: {
			options: {
				es3: true,
				devel: false,
				node: false,
				smarttabs: true,
				multistr: true,
				nonew: true,
				bitwise: true,
				passfail: true,
				evil: true,
				forin: true,
				onevar: false,
				curly: true,
				eqeqeq: true,
				immed: true,
				latedef: true,
				newcap: true,
				noarg: true,
				sub: true,
				undef: true,
				unused: true,
				boss: true,
				eqnull: true,
				browser: true,
				laxbreak: false,
				noempty: true,
				nonstandard: true,
				trailing: false,
				globals: {
					jQuery: true
				}
			},
			gruntfile: {
				src: 'Gruntfile.js'
			},
			lib: {
				src: ['<%= uglify.dist.src %>']
			}
		},
		watch: {
			gruntfile: {
				files: '<%= jshint.gruntfile.src %>',
				tasks: ['jshint:gruntfile']
			},
			lib: {
				files: '<%= jshint.lib.src %>',
				tasks: ['jshint:lib', 'uglify']
			}
		}
	});

	// These plugins provide necessary tasks.
	grunt.loadNpmTasks('grunt-contrib-uglify');
	grunt.loadNpmTasks('grunt-contrib-jshint');
	grunt.loadNpmTasks('grunt-contrib-watch');

	// Default task.
	grunt.registerTask('default', ['jshint', 'uglify', 'watch']);

};
