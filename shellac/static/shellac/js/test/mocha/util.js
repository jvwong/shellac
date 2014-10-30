/* global describe:false, it:false, beforeEach:false, afterEach:false, window */

'use strict';
var supertest = require('supertest'),
    should = require('should');

describe('util.js', function () {

    var jsdom = require('jsdom').jsdom,
        document = jsdom("<html><head></head><body><div></div></body></html>");

    global.document = document;
    global.window = document.parentWindow;
    global.jQuery = require('jquery');
    global.$      = global.jQuery;

    var util = require("../../src/util.js");


    describe('urlParse', function () {
        var url = 'http://shellac.no-ip.ca/api/clips/?q="test"#test',
            parsed;
        beforeEach(function () {
            parsed = util.urlParse(url);
        });

        afterEach(function () {
        });

        it('should return an object', function () {
            parsed.should.be.an.Object;
        });

        it('should parse protocol correctly', function () {
            parsed.protocol.should.equal('http:');
        });

        it('should parse hostname correctly', function () {
            parsed.host.should.equal('shellac.no-ip.ca');
        });

        it('should parse port correctly', function () {
            parsed.port.should.equal('');
        });

        it('should parse pathname correctly', function () {
            parsed.pathname.should.equal('/api/clips/');
        });

        it('should parse hash correctly', function () {
            parsed.hash.should.equal('#test');
        });

        it('should parse search correctly', function () {
            parsed.search.should.equal('?q=%22test%22');
        });
    });


    describe('PubSub', function () {
        var tag = 'loadDataComplete',
            json_data = {"one": 1, "two": 2, "three": 3},
            returned;

        beforeEach(function () {

            var handler = function( data ){
                returned = data;
            };
            util.PubSub.on(tag, handler);
            util.PubSub.emit(tag, json_data);
        });

        afterEach(function () {
        });

        it('should emit correct data type', function () {
            returned.should.be.an.Object;
        });

        it('should emit correct data', function () {
            returned.should.eql(json_data);
        });
    });

    describe('truncate', function () {
        var string = 'The rain in Spain falls mainly in the plain';

        beforeEach(function () {
        });

        afterEach(function () {
        });

        it('should reduce the length of a string', function () {
            var maxchar = 8,
                truncated = util.truncate(string, maxchar);
            console.log(truncated.length);
            (truncated.length).should.be.lessThan(string.length);
        });

        it('should truncate a string to the desired characters', function () {
            var maxchar = 8,
                truncated = util.truncate(string, maxchar);
            (truncated).should.equal('The rain...');
        });

    });

});
