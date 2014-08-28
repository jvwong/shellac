/*
 * main.js
 * Entry point for shellac app
*/
'use strict';

$( document ).ready(function() {
    var shellac = require('./app/shellac.js');
    shellac.initModule($("#shellac-app"), data);
});

