'use strict';


module.exports = function mochacli(grunt) {
	// Load task
	grunt.loadNpmTasks('grunt-mocha-cli');

	// Options
	return {
        src: ['test/mocha/**/*.js'],
        options: {
            timeout: 6000,
            'check-leaks': false,
            globals: ['jQuery', 'window'],
            ui: 'bdd',
            reporter: 'spec'
        }
	};
};
