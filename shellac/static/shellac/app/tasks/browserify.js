'use strict';


module.exports = function browserify(grunt) {
	// Load task
	grunt.loadNpmTasks('grunt-browserify');

	// Options
	return {
		app: {
			src: 'app.js',
            dest: './.build/js/app.js'
		}
	};
};
