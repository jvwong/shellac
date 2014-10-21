'use strict';


module.exports = function casperjs(grunt) {
	// Load task
	grunt.loadNpmTasks('grunt-casperjs');

	// Options
	return {
        files: ['test/casperjs/**/*.js'],
        options:
        {
            async:
            {
                parallel: false
            }
        }
	}
}
