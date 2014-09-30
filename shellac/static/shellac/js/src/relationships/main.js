/*
 * main.js
 * Entry point for people app
*/
/* global $, document, username, DEBUG */
'use strict';
$( document ).ready(function() {
    var shell = require('./shell.js');
    shell.initModule($(".content-relationships"), username, DEBUG);
});

