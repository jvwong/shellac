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
                "../css/base.css": "../less/base.less",
                "../css/app.css": "../less/app/base.less"
            }
        },
        production: {
            options: {
                paths: ["assets/css"],
                cleancss: true,
                modifyVars: {
                    imgPath: '"http://mycdn.com/path/to/images"',
                    bgColor: 'red'
                }
            },
            files: {
                "path/to/result.css": "path/to/source.less"
            }
        }
	};
};
