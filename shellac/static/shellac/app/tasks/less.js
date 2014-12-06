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
                "./styling/css/app.css": "./styling/less/app.less"
            }
        }
	};
};
