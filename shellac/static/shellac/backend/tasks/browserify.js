'use strict';


module.exports = function browserify(grunt) {
	// Load task
	grunt.loadNpmTasks('grunt-browserify');

	// Options
	return {
		app: {
			files: {
			},
			options: {
			    debug: true,
			    watch: true
			}
		}
	};
};
