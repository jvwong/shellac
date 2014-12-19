/**
 * apiApp Services
 * @author jvwong
 * @created 06/12/14
 */

require('../interceptor/loggingInterceptor');
var app = angular.module('apiService', ['LoggingInterceptor']);

app.factory('UserService', ['$http', function($http){
    return {
        query: function(){
            return $http.get('/api/person/');
        }
    }
}])
;
