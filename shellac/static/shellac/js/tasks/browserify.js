'use strict';


module.exports = function browserify(grunt) {
	// Load task
	grunt.loadNpmTasks('grunt-browserify');

	// Options
	return {
		app: {
			files: {
				'dist/app_bundle.js': ['src/app/main.js']
			},
			options: {
			    debug: true,
			    watch: true
			}
		},
        people: {
            files: {
                'dist/relationships_bundle.js': ['src/relationships/main.js']
            },
            options: {
                debug: true,
                watch: true
            }
        },
        siren: {
            files: {
                'dist/siren_bundle.js': ['src/siren/main.js']
            },
            options: {
                debug: true,
                watch: true
            }
        }
	};
};
