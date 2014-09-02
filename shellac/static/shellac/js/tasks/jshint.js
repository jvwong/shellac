'use strict';


module.exports = function jshint(grunt) {
	// Load task
	grunt.loadNpmTasks('grunt-contrib-jshint');

	// Options
	return {
		files: [
            'src/**/*.js',
            '!src/**/main.js'
        ],
		options: {
		    jshintrc: '.jshintrc'
		}
	};
};
