// This will include ./node_modules/angular/angular.js
// and give us access to the `angular` global object.
require('angular');
require('./shared/api/apiService');


// Create your app
angular.module('shellacApp', ['apiService'])
    .controller('NavCtrl', ['UserService', function(UserService){
        var self = this;
        //set the username
        self.person = {};
        self.errorMessage = '';

        UserService.query().then(function(response){
            self.person = response.data;
        }, function(errResponse){
            self.errorMessage = errResponse.data.msg;
        });

    }]);
