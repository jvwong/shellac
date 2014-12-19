describe('Interceptor: logging', function() {
    var
          ctrl
        , loggingInterceptor
        , mockBackend
        , testData
        , errorObject
        ;

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

    errorObject = {
        msg: "Forbidden"
    };


    describe('Interceptor: request and response logging', function() {

        beforeEach(function () {
            module('testApp');

            inject(function ($controller, $httpBackend, LoggingInterceptor) {
                loggingInterceptor = LoggingInterceptor;

                //allow actual response
                spyOn(loggingInterceptor, 'request').and.callThrough();
                spyOn(loggingInterceptor, 'requestError').and.callThrough();
                spyOn(loggingInterceptor, 'response').and.callThrough();
                spyOn(loggingInterceptor, 'responseError').and.callThrough();

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

            expect(loggingInterceptor.requestError.calls.count()).toEqual(0);

            expect(loggingInterceptor.response).toHaveBeenCalled();
            expect(loggingInterceptor.response.calls.count()).toEqual(1);

            expect(loggingInterceptor.responseError.calls.count()).toEqual(0);
        });

        it('should have no ctrl.data initially', function(){
            expect(ctrl.data).toEqual({});
            mockBackend.flush();
        });

        it('should set the ctrl.data', function(){
            mockBackend.flush();
            expect(ctrl.data).toEqual(testData);
        });

        afterEach(function () {
            //ensure all expects on teh $httpBackend called (expectGET)
            mockBackend.verifyNoOutstandingExpectation();
            //ensure all requests to server have responded (flush())
            mockBackend.verifyNoOutstandingRequest();
        });
    });//END 'Interceptor: success'


    describe('Interceptor: responseError', function() {

        beforeEach(function () {
            module('testApp');

            inject(function ($controller, $httpBackend, LoggingInterceptor) {
                loggingInterceptor = LoggingInterceptor;

                //allow actual response
                spyOn(loggingInterceptor, 'request').and.callThrough();
                spyOn(loggingInterceptor, 'requestError').and.callThrough();
                spyOn(loggingInterceptor, 'response').and.callThrough();
                spyOn(loggingInterceptor, 'responseError').and.callThrough();

                mockBackend = $httpBackend;
                mockBackend.expectGET('/').respond(403, errorObject);
                ctrl = $controller('TestCtrl');
            });
        });

        it('should have LoggingInterceptor defined', function () {
            mockBackend.flush();
            expect(loggingInterceptor).toBeDefined();
        });


        it('should set ctrl data error msg', function () {
            mockBackend.flush();
            expect(ctrl.errorMessage).toEqual(errorObject.msg);
        });

        it('should have called LoggingInterceptor methods', function () {
            mockBackend.flush();
            expect(loggingInterceptor.request).toHaveBeenCalled();
            expect(loggingInterceptor.request.calls.count()).toEqual(1);

            expect(loggingInterceptor.requestError).not.toHaveBeenCalled();
            expect(loggingInterceptor.requestError.calls.count()).toEqual(0);

            expect(loggingInterceptor.response).not.toHaveBeenCalled();
            expect(loggingInterceptor.response.calls.count()).toEqual(0);

            expect(loggingInterceptor.responseError).toHaveBeenCalled();
            expect(loggingInterceptor.responseError.calls.count()).toEqual(1);
        });

        afterEach(function () {
            //ensure all expects on teh $httpBackend called (expectGET)
            mockBackend.verifyNoOutstandingExpectation();
            //ensure all requests to server have responded (flush())
            mockBackend.verifyNoOutstandingRequest();
        });
    });//END 'Interceptor: responseError'

});
