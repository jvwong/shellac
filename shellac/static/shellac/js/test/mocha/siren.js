/* global describe:false, it:false, beforeEach:false, afterEach:false, window, XMLHttpRequest*/

'use strict';
var supertest = require('supertest'),
    should = require('should');

describe('siren.js', function () {

    var jsdom = require('jsdom').jsdom,
        document = jsdom("<html><head></head><body><div></div></body></html>"),
        siren = require("../jasmine/siren/src/siren.js")
        ;

    global.document = document;
    global.window = document.parentWindow;


    describe('test', function () {

        beforeEach(function () {
        });

        afterEach(function () {
        });

        describe('existence', function(){
            it('should be true', function () {
                console.log(siren);
            });
        });

    });

});
