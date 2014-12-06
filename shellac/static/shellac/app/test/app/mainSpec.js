// test for main.js
describe('main.js', function() {

    //Load module
    beforeEach(module('mainApp'));

    it('should be true', function() {
        expect(true).toEqual(true);
    });

});
