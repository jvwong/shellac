/*
 * main.js
 * Entry point for people app
*/
/* global $, document */
'use strict';
$( document ).ready(function() {
    var shell = require('./shell.js');
    shell.initModule($("#shellac-people-relationships"));
});

