// test for main.js
describe('mainModule Track Listing Directive Rendering', function() {

    //Load module
    beforeEach(module('main'));

    var compile, mockBackend, rootScope;

    //load injection dependencies
    beforeEach(inject(function($compile, $httpBackend, $rootScope){
        compile = $compile;
        mockBackend = $httpBackend;
        rootScope = $rootScope;
    }));

    it('should render HTML based on scope correctly', function() {
        //set up scope
        var scope = rootScope.$new();
    });

    it('should be true', function() {
        expect(true).toEqual(true);
    });

});
