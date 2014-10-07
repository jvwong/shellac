/*
 * main.js
 * Entry point for audio app
*/
/* global $, document, target_username, status, DEBUG */
'use strict';
$( document ).ready(function() {
    var shell = require('./shell.js');
    shell.initModule($("#shellac-app"), target_username, status, DEBUG);
});

