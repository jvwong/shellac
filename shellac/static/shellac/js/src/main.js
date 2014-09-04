/*
 * main.js
 * Entry point for shellac app
*/
'use strict';
var  $ = require('jquery');
$( document ).ready(function() {
    var shellac = require('./shellac.js');
    shellac.initModule($("#shellac-app"), STATIC_URL, MEDIA_URL);
});

