describe('apiApp: UserService', function() {

    var
          ctrl
        , mockBackend
        , userService
        , testData
        , errorObject
        ;

    //fake module and controller
    angular.module('testApp', ['apiService'])
        .controller('TestCtrl', ['UserService', function(UserService){
            var self = this;

            //set the username
            self.data = {};
            self.errorMessage = '';

            UserService.query().then(function(response){
                self.data = response.data;
            }, function(errResponse){
                self.errorMessage = errResponse.data.msg;
            });
        }]);

    //mocked data
    testData = {
        "url": "http://127.0.0.1:8000/api/people/jvwong/",
        "username": "jvwong",
        "first_name": "",
        "last_name": "",
        "joined": "2014-11-07T14:08:56",
        "clips": [],
        "relationships": [
        ],
        "playlists": [
            "http://127.0.0.1:8000/api/playlists/6/"
        ]
    };

    errorObject = {
        msg: "Forbidden"
    };

    describe('UserService: query method', function() {

        beforeEach(function () {
            module('testApp');

            inject(function ($controller, $httpBackend, UserService) {
                userService = UserService;

                //allow actual response
                spyOn(userService, 'query').and.callThrough();

                mockBackend = $httpBackend;
                mockBackend.expectGET('/api/person/').respond(testData);
                ctrl = $controller('TestCtrl');
            });
        });

        it('should have UserService defined', function () {
            expect(userService).toBeDefined();
            mockBackend.flush();
        });

        it('should have called UserService methods', function () {
            mockBackend.flush();
            expect(userService.query).toHaveBeenCalled();
            expect(userService.query.calls.count()).toEqual(1);
        });

        afterEach(function () {
            //ensure all expects on teh $httpBackend called (expectGET)
            mockBackend.verifyNoOutstandingExpectation();
            //ensure all requests to server have responded (flush())
            mockBackend.verifyNoOutstandingRequest();
        });
    });//END 'Interceptor: success'
});
