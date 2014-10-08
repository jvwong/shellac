/*
 * util.js
 * Utilities for the Audio app
*/
/* global document, $*/
'use strict';

var util = (function () {
    var moment = require('moment');

    var fetchUrl, PubSub, truncate, getCookie, sameOrigin, csrfSafeMethod, parseClipData;

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


    //------------------- BEGIN PUBLIC METHODS -------------------
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

                //sub-in dummy image
                if(jsonObj.brand === "")
                {
                    jsonObj.brand_url = 'static/shellac/assets/seventyEight.png';
                }
                return jsonObj;
            }catch(err){
                console.log(err);
            }
        });
        console.log(jsonArray);
        return jsonArray;
    };

    /**
     * fetchUrl make a call to the given url and emit a Pubsub on complete
     * @param url
     * @param tag string tag to identify results
     * @return Pubsub event that notifies the url and resulting json
     */
    fetchUrl = function(url, tag){
        $.ajax({
            url: url
        })
            .done(function(results){
                PubSub.emit("fetchUrlComplete", tag, results);
            })
            .fail(function(){
                console.error("Failed to load data");
            })
            .always(function(){});
    };


    // Begin Public method /PubSub/
    // Example   : PubSub.on('bark', getDog ); PubSub.emit('bark');
    // Purpose   :
    //   Subscribe and publish events
    // Arguments :
    // Action    : The user can subscribe to events with on('<event name>', callback)
    // and listen to events published with emit('<event name>')
    // Returns   : none
    // Throws    : none
    PubSub = {
        handlers: {},

        on : function(eventType, handler) {
            if (!(eventType in this.handlers)) {
                this.handlers[eventType] = [];
            }
            //push handler into array -- "eventType": [handler]
            this.handlers[eventType].push(handler);
            return this;
        },

        emit : function(eventType) {
            var handlerArgs = Array.prototype.slice.call(arguments, 1);
            for (var i = 0; i < this.handlers[eventType].length; i++) {
                this.handlers[eventType][i].apply(this, handlerArgs);
            }
            return this;
        }

    };

    // Begin Public method /truncate/
    // Example   : truncate(string, maxchar)
    // Purpose   :
    //   Truncate a string and append "..." to the remaining
    // Arguments :
    //  * string - the original string
    //  * maxchar - the max number of chars to show
    // Returns   : the truncated string
    // Throws    : none
    truncate = function(string, maxchar){
        var str = string || '';
        var truncated = str.slice(0, maxchar);
        if(str.length > maxchar){
            truncated += "...";
        }
        return truncated;
    };


    // using jQuery
    getCookie = function(name) {
        var cookieValue = null;
        if (document.cookie && document.cookie !== '') {
            var cookies = document.cookie.split(';');
            for (var i = 0; i < cookies.length; i++) {
                var cookie = $.trim(cookies[i]);
                // Does this cookie string begin with the name we want?
                if (cookie.substring(0, name.length + 1) === (name + '=')) {
                    cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                    break;
                }
            }
        }
        return cookieValue;
    };

    csrfSafeMethod = function(method) {
        // these HTTP methods do not require CSRF protection
        return (/^(GET|HEAD|OPTIONS|TRACE)$/.test(method));
    };

    sameOrigin = function(url) {
        // test that a given url is a same-origin URL
        // url could be relative or scheme relative or absolute
        var host = document.location.host; // host + port
        var protocol = document.location.protocol;
        var sr_origin = '//' + host;
        var origin = protocol + sr_origin;
        // Allow absolute or scheme relative URLs to same origin
        return (url === origin || url.slice(0, origin.length + 1) === origin + '/') ||
            (url === sr_origin || url.slice(0, sr_origin.length + 1) === sr_origin + '/') ||
            // or any other URL that isn't scheme relative or absolute i.e relative.
            !(/^(\/\/|http:|https:).*/.test(url));
    };

    return {
        fetchUrl        : fetchUrl,
        PubSub          : PubSub,
        truncate        : truncate,
        getCookie       : getCookie,
        csrfSafeMethod  : csrfSafeMethod,
        sameOrigin      : sameOrigin,
        parseClipData   : parseClipData
    };
}());

module.exports = util;

