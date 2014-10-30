/*
 * app_util.js
 * Utilities for app
 */
/* global document, window, $ */
'use strict';

var app_util = (function () {
    var moment = require('moment');
    var parseClipData;

    //---------------- BEGIN MODULE DEPENDENCIES --------------
    moment.locale('en', {
        relativeTime : {
            future: "in %s",
            past:   "%s ago",
            s:  "s",
            m:  "1min",
            mm: "%dmin",
            h:  "1h",
            hh: "%dh",
            d:  "1d",
            dd: "%dd",
            M:  "1mon",
            MM: "%dmon",
            y:  "1yr",
            yy: "%dyrs"
        }
    });
    //---------------- END MODULE DEPENDENCIES --------------

    /**
     * parseClipData: transform any Clip fields to javascript-compatible
     * @param raw a string describing an array of valid JSON
     * @return jsonArray - a list of valid JSON objects
     */
    parseClipData = function(raw){
        var jsonArray;
        jsonArray = raw.results.map(function(jsonObj){

            try{
                jsonObj.created = moment(jsonObj.created);
                jsonObj.created_i = new Date( moment(jsonObj.created)._i );
                return jsonObj;
            }catch(err){
                console.log(err);
            }
        });
        //console.log(jsonArray);
        return jsonArray;
    };

    return {
        parseClipData: parseClipData
    };
}());

module.exports = app_util;

