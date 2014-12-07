describe('Interceptor: logging', function() {
    var
          ctrl
        , loggingInterceptor
        , mockBackend
        , testData;

    //fake module and controller
    angular.module('testApp', ['LoggingInterceptor'])
        .controller('TestCtrl', ['$http', function($http){
            var self = this;

            //set the username
            self.data = {};
            self.errorMessage = '';

            $http.get('/').then(function(response){
                self.data = response.data;
            }, function(errResponse){
                self.errorMessage = errResponse.data.msg;
            });

        }]);

    //mocked data
    testData = {
        "response": "ok"
    };

    beforeEach(function(){
        module('testApp');

        inject(function($controller, $httpBackend, LoggingInterceptor){
            loggingInterceptor = LoggingInterceptor;

            //stub out the actual response
            spyOn(loggingInterceptor, 'request').and.callFake(function(config){
                return config;
            });
            spyOn(loggingInterceptor, 'response').and.callFake(function(response){
                return response;
            });
            mockBackend = $httpBackend;
            mockBackend.expectGET('/').respond(testData);
            ctrl = $controller('TestCtrl');
        });
    });

    it('should have LoggingInterceptor defined', function () {
        expect(loggingInterceptor).toBeDefined();
        mockBackend.flush();
    });

    it('should have called LoggingInterceptor methods', function () {
        mockBackend.flush();
        expect(loggingInterceptor.request).toHaveBeenCalled();
        expect(loggingInterceptor.request.calls.count()).toEqual(1);
        expect(loggingInterceptor.response).toHaveBeenCalled();
        expect(loggingInterceptor.response.calls.count()).toEqual(1);
    });

    afterEach(function(){
        //ensure all expects on teh $httpBackend called (expectGET)
        mockBackend.verifyNoOutstandingExpectation();
        //ensure all requests to server have responded (flush())
        mockBackend.verifyNoOutstandingRequest();
    });
});
