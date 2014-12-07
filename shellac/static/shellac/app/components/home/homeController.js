angular.module('homeApp', ['apiApp'])
    .controller('PersonCtrl', ['UserService', function(UserService){
        var self = this;
        //set the username
        self.person = {};
        self.errorMessage = '';

        UserService.query().then(function(response){
            self.person = response.data;
        }, function(errResponse){
            self.errorMessage = errResponse.data.msg;
        });
    }])
;