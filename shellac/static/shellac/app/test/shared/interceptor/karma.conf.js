// Karma configuration for home component
'use strict';
module.exports = function(config) {
    config.set({
        basePath: '../../../',
        frameworks: ['jasmine'],
        files: [
            'node_modules/angular/angular.min.js',
            'node_modules/angular-mocks/angular-mocks.js',
            'shared/interceptor/**/*.js',
            'test/shared/interceptor/**/*.js'
        ],
        exclude: [],
        port: 8080,
        logLevel: config.LOG_INFO,
        autoWatch: true,
        browsers: ['Chrome'],
        singleRun: false
    });
};
