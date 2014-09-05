/*
 * main.js
 * Entry point for shellac app
*/
/* global $, document, STATIC_URL, MEDIA_URL */
'use strict';
$( document ).ready(function() {
    var shellac = require('./shellac.js');
    shellac.initModule($("#shellac-app"), STATIC_URL, MEDIA_URL);
});

