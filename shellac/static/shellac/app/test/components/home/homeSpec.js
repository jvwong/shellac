describe('Controller: PersonCtrl with mock success', function() {

    //Load module + mock
    beforeEach(module('homeApp'));

    var ctrl, mockBackend, personData;

    //mocked return
    personData = {
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

    beforeEach(inject(function($controller, $httpBackend){
        mockBackend = $httpBackend;
        mockBackend.expectGET('/api/person/').respond(personData);
        ctrl = $controller('PersonCtrl');
    }));

    it('should load a Person from the api', function() {
        expect(ctrl.person).toEqual({});
        mockBackend.flush();
        expect(ctrl.person).toEqual(personData);
    });

    afterEach(function(){
        //ensure all expects on teh $httpBackend called (expectGET)
        mockBackend.verifyNoOutstandingExpectation();
        //ensure all requests to server have responded (flush())
        mockBackend.verifyNoOutstandingRequest();
    });

});


describe('Controller: PersonCtrl with mock failure', function() {

    //Load module + mock
    beforeEach(module('homeApp'));

    var ctrl, mockBackend, errorData;

    //mocked return
    errorData = {
        msg: "Not Found"
    };

    beforeEach(inject(function($controller, $httpBackend){
        mockBackend = $httpBackend;
        mockBackend.expectGET('/api/person/').respond(404, errorData);
        ctrl = $controller('PersonCtrl');
    }));

    it('should load a Person from the api', function() {
        expect(ctrl.person).toEqual({});
        mockBackend.flush();
        expect(ctrl.errorMessage).toEqual(errorData.msg);
    });

    afterEach(function(){
        //ensure all expects on teh $httpBackend called (expectGET)
        mockBackend.verifyNoOutstandingExpectation();
        //ensure all requests to server have responded (flush())
        mockBackend.verifyNoOutstandingRequest();
    });

});

