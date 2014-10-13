/*
 * main.js
 * Entry point for audio app
*/
/* global $, document, target_username, status, DEBUG */
'use strict';
$( document ).ready(function() {
    var shell = require('./shell.js'),
        util = require('../util.js'),
        utils = util.utils;

    shell.initModule( utils.dom.get("#shellac-app"), target_username, status, DEBUG );
});

