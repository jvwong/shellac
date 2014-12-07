/**
 * apiApp Services
 * @author jvwong
 * @created 06/12/14
 */
angular.module('apiApp', [])
    .factory('UserService', ['$http', function($http){
        return {
            query: function(){
                return $http.get('/api/person/');
            }
        }
    }])
;
