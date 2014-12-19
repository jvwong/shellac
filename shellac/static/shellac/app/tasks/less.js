'use strict';

module.exports = function less(grunt) {
	// Load task
	grunt.loadNpmTasks('grunt-contrib-less');

	// Options
	return {
        development: {
            options: {
                compress: false
            },
            files:{
                "./.build/css/app.css": "./css/app.less"
            }
        }
	};
};
