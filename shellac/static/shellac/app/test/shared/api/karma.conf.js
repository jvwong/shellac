// Karma configuration for home component

module.exports = function(config) {
    config.set({
        basePath: '../../../',
        frameworks: ['jasmine'],
        files: [
            'node_modules/angular/angular.min.js',
            'node_modules/angular-mocks/angular-mocks.js',
            'components/home/**/*.js',
            'shared/api/**/*.js',
            'test/shared/api/**/*.js'
        ],
        exclude: [],
        port: 8080,
        logLevel: config.LOG_INFO,
        autoWatch: true,
        browsers: ['Chrome'],
        singleRun: false
    });
};
