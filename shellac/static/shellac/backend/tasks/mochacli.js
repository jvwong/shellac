'use strict';


module.exports = function mochacli(grunt) {
	// Load task
	grunt.loadNpmTasks('grunt-mocha-cli');

	// Options
	return {
    siren:{
      src: ['test/mocha/siren.js'],
      options: {
        timeout: 6000,
        'check-leaks': false,
        globals: ['jQuery', 'window', 'XMLHttpRequest'],
        ui: 'bdd',
        reporter: 'spec'
      }
    }
	};
};
