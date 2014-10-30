describe("siren.js", function() {
  var data;

  beforeEach(function() {
    data = {
        "first": "jeff",
        "last": "wong"
    };
  });

  describe("initModule", function(){
    var Siren;

    beforeEach(function() {
      Siren = siren.initModule();
    });

    it("initModule should return a Siren", function() {
      expect(typeof Siren).toEqual("object");
    });
  });
  //END "initModule"

  describe("Siren object", function(){
    var Siren;

    beforeEach(function() {
      Siren = siren.initModule();
    });

    it("should be able to set data", function() {
        Siren.data(data);
        expect(Siren.data()).toEqual(data);
    });

    it("should have a dothis method", function() {
        expect(typeof Siren.dothis).toEqual("function");
    });

    it("should have a dothat method", function() {
        expect(typeof Siren.dothis).toEqual("function");
    });
  });
  //END "Siren object"

});
//END "siren.js"
