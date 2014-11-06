/* global describe:false, it:false, beforeEach:false, afterEach:false, window, XMLHttpRequest*/

'use strict';
var supertest = require('supertest'),
    should = require('should');

describe('siren.js', function () {

    var jsdom = require('jsdom').jsdom,
        document = jsdom(
            "<html>" +
              "<head>" +
              "</head>" +
              "<body>" +
                "<div></div>" +
              "</body>" +
            "</html>"
        ),
        siren = require('./siren/siren.js')("test")
        ;

    global.document = document;
    global.window = document.parentWindow;

    describe('initModule', function () {
        var spec, Siren;

        spec = {};

        beforeEach(function (){
            Siren = siren.initModule({});
        });

        afterEach(function (){
        });

        it('should return a Siren object', function () {
//            Siren.should.be.an.Object;
            console.log(Siren);
            console.log();
        });

    });

});
