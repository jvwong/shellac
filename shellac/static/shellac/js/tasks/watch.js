'use strict';


module.exports = function watch(grunt) {
	// Load task
	grunt.loadNpmTasks('grunt-contrib-watch');

	// Options
	return {
        js: {
            files: [
                'src/**/*.js',
                'test/jasmine/siren/src/*.js'
            ],
            tasks: [
                'jshint'
//                'browserify'
            ]
        },
        styles: {
            files: [
                '../less/**/*.less'
            ],
            tasks: [
                'less:development'
            ]
        }
	};
};
