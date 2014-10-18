/*
 * main.js
 * Entry point for audio app
*/
/* global $, document, user, target_username, status, playlist_id, DEBUG */
'use strict';
$( document ).ready(function() {
    var shell = require('./shell.js'),
        util = require('../util.js'),
        utils = util.utils;

    shell.initModule( utils.dom.get("#shellac-app"), user, target_username, status, playlist_id, DEBUG );
});

