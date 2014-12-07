/**
 * LoggingInterceptorApp that defines Interceptor
 * @author jvwong
 * @created 06/12/14
 */
'use strict';

var app = angular.module('LoggingInterceptor', []);

app.factory('LoggingInterceptor', ['$q', function($q){
    return {
        request: function(config){
            //console.log("Request made with ", config);
            return config;
        },

        requestError: function(rejection){
            console.log("Request error due to", rejection);
            return $q.reject(rejection);
        },

        response: function(response){
            //console.log("Return a server response ", response);
            return response || $q.when(response);
        },

        responseError: function(rejection){
            console.log("Response error ", rejection);
            if(reject.status === 403){
                
            }
            return $q.reject(rejection);
        }
    }
}])
.config(['$httpProvider', function($httpProvider){
    $httpProvider.interceptors.push('LoggingInterceptor');
}]);
