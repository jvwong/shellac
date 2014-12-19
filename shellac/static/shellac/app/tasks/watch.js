'use strict';


module.exports = function watch(grunt) {
	// Load task
	grunt.loadNpmTasks('grunt-contrib-watch');

	// Options
	return {
        js: {
            files: [
                'app.js',
                'components/**/*.js',
                'shared/**/*.js'
            ],
            tasks: [
                'jshint',
                'browserify'
            ]
        },
        styles: {
            files: [
                'css/**/*.less'
            ],
            tasks: [
                'less:development'
            ]
        }
	};
};
