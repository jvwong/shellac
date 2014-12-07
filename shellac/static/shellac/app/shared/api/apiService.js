/**
 * apiApp Services
 * @author jvwong
 * @created 06/12/14
 */
var app = angular.module('apiApp', ['LoggingInterceptor']);

app.factory('UserService', ['$http', function($http){
    return {
        query: function(){
            return $http.get('/api/person/');
        }
    }
}])
;
