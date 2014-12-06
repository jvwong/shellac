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
                "assets/styling/css/app.css": "assets/styling/less/app.less"
            }
        }
	};
};
