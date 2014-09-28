/*
 * main.js
 * Entry point for audio app
*/
/* global $, document, STATIC_URL, MEDIA_URL, username */
'use strict';
$( document ).ready(function() {
    var shell = require('./shell.js');
    shell.initModule($("#shellac-app"), STATIC_URL, MEDIA_URL, username);
});

