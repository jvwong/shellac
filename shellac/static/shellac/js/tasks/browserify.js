'use strict';


module.exports = function browserify(grunt) {
	// Load task
	grunt.loadNpmTasks('grunt-browserify');

	// Options
	return {
		build: {
			files: {
				'dist/bundle.js': ['src/**/main.js']
			},
			options: {
			    debug: true,
			    watch: true
			}
		}
	};
};
