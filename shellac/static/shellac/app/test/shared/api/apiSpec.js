describe('Service: UserService', function() {

    //Load module + mock
    beforeEach(module('homeApp'));
    beforeEach(module('apiApp'));

    var ctrl, userService;

    //mocked return
    var personData = {
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

    //load the controller hijacked by the mock
    beforeEach(inject(function($controller, UserService){
        ctrl = $controller('HomeCtrl');
        userService = UserService;
    }));

    it('should load mocked out items', function() {

    });

});
