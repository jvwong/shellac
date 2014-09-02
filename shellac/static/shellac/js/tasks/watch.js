'use strict';


module.exports = function watch(grunt) {
	// Load task
	grunt.loadNpmTasks('grunt-contrib-watch');

	// Options
	return {
        js: {
            files: [
                'src/**/*.js',
                '!src/**/main.js'
            ],
            tasks: [
                'jshint',
                'browserify'
            ]
        }
	};
};
