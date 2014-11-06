describe("siren.js", function() {
    var data;

    beforeEach(function() {
        data = {
        "first": "jeff",
        "last": "wong"
        };
    });

    describe("initModule", function(){
        var Siren,
            spec = {}
            ;


        it("initModule should return a Siren", function() {
            Siren = siren.initModule(spec);
            expect(typeof Siren).toEqual("object");
        });
    });
    //END "initModule"

    describe("Siren object", function(){
        var Siren,
            spec = {}
            ;

        beforeEach(function() {
            Siren = siren.initModule(spec);
        });

        describe('setup', function(){
            var setup_options;

            beforeEach(function() {
                setup_options = Siren.setup();
            });

            it("should be a valid callable", function() {
                spyOn(Siren, 'setup');
                Siren.setup();
                expect(Siren.setup).toHaveBeenCalled();
            });

            it("should have default debugMode", function() {
                //console.log(setup_options);
                var setup_options = Siren.setup();
                expect(setup_options.debugMode).toBeDefined();
                expect(setup_options.debugMode).toBe(true);
            });

            it("should have default idPrefix", function() {
                expect(setup_options.idPrefix).toBeDefined();
                expect(setup_options.idPrefix).toBe('id');
            });

            it("should have default url", function() {
                expect(setup_options.url).toBeDefined();
                expect(setup_options.url).toBe('');
            });
        });
        //END config options



        it("should have a reference to audio context", function() {
            expect(typeof Siren.context).toEqual('object');
            expect(Siren.context instanceof window.AudioContext).toBe(true);
        });
    });
    //END "Siren object"

});
//END "siren.js"
