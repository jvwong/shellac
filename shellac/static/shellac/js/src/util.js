/*
 * util.js
 * Utilities for the Audio app
*/
/* global document, window, $*/
'use strict';

var util = (function () {
    var moment = require('moment');

    var fetchUrl, updateUrl,
        PubSub,
        truncate,
        getCookie, sameOrigin, urlParse,
        swipeData, csrfSafeMethod, parseClipData, utils;

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
        //console.log(jsonArray);
        return jsonArray;
    };

    /**
     * fetchUrl make a call to the given url and emit a Pubsub on complete
     * @param url
     * @param callback the callable to execute given Ajax data returned
     */
    fetchUrl = function(url, callback){
        $.ajax({
            url: url,
            type: 'GET',
            contentType: 'application/json'
        })
        .done(function(results){
            callback(results);
        })
        .fail(function(){
            console.error("Failed to load data");
        })
        .always(function(){
        });
    };

    /**
     * updateUrl make a PATCH call to the given url and emit a Pubsub on complete
     * @param url
     * @param tag string tag to identify results
     * @param data the object data to update
     * @return Pubsub event updateUrlComplete that notifies the url and resulting json
     */
    updateUrl = function(url, callback, method, data, csrftoken) {

        $.ajax({
            url: url,
            data: data,
            type: method,
            contentType: 'application/json',
            beforeSend: function(xhr, settings) {
                if (!csrfSafeMethod(settings.type) && sameOrigin(settings.url)) {
                    // Send the token to same-origin, relative URLs only.
                    // Send the token only if the method warrants CSRF protection
                    // Using the CSRFToken value acquired earlier
                    xhr.setRequestHeader("X-CSRFToken", csrftoken);
                    //xhr.setRequestHeader("HTTP_AUTHORIZATION", authtoken);
                }
            }
        })
        .done(function(results){
            callback( results );
        })
        .fail(function(){
            console.error("Failed to load data");
        })
        .always(function(){});
    };

    /**
     * method urlParse: extract the various aspects of the url from a HyperlinkedRelatedField
     * precondition: requires a HyperlinkedRelatedField of the form protocol:host/api/object/pk/
     * @param url url of the resource
     * @return URLobj - an object literal with fields protocol, host, api, object, and pk
     */
    urlParse = function(url){
        var URL = {},
            u = url || '',
            parts;

        try{
            var parser = document.createElement('a');
            parser.href = url;
            URL.protocol = parser.protocol;
            URL.hostname = parser.hostname;
            URL.port = parser.port;
            URL.pathname = parser.pathname;
            URL.search = parser.search;
            URL.hash = parser.hash;
            URL.host = parser.host;

        } catch (e) {
            throw "Improper url format entered";
        }
        return URL;
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

    /**
     * utils collection of DOM utilities to free you from jquery
     */
    utils = {

        noop: function(){},

        array: (function() {

            function compare(property) {

                var result;

                return function(a, b) {

                    if (a[property] < b[property]) {
                        result = -1;
                    } else if (a[property] > b[property]) {
                        result = 1;
                    } else {
                        result = 0;
                    }
                    return result;
                };

            }

            function shuffle(array) {

                // Fisher-Yates shuffle algo

                var i, j, temp;

                for (i = array.length - 1; i > 0; i--) {
                    j = Math.floor(Math.random() * (i+1));
                    temp = array[i];
                    array[i] = array[j];
                    array[j] = temp;
                }

                return array;

            }

            return {
                compare: compare,
                shuffle: shuffle
            };

        }()),

        css: (function() {
            //css methods manipulate the result of className --> string representation of class attribute
            //alternative is elm.classList {0="cString1", ...}

            function hasClass(o, cStr) {

                // regex allows 1) whitespace or start; 2) whitespace or end
                // test() method tests for a match in a string.
                return (o.className !== undefined ? new RegExp('(^|\\s)' + cStr + '(\\s|$)').test(o.className) : false);

            }

            function addClass(o, cStr) {

                if (!o || !cStr || hasClass(o, cStr)) {
                    return false; // safety net
                }

                //append to list with space (o.className + ' ') OR start a new string
                o.className = (o.className ? o.className + ' ' : '') + cStr;

            }

            function removeClass(o, cStr) {

                if (!o || !cStr || !hasClass(o, cStr)) {
                    return false;
                }
                //check for list ['( ' + cStr + ')] OR single class then erplace with ''
                o.className = o.className.replace(new RegExp('( ' + cStr + ')|(' + cStr + ')', 'g'), '');

            }

            function swapClass(o, cStr1, cStr2) {

                var tmpClass = {
                    className: o.className
                };

                removeClass(tmpClass, cStr1);
                addClass(tmpClass, cStr2);

                o.className = tmpClass.className;

            }

            function toggleClass(o, cStr) {

                var found, method;

                found = hasClass(o, cStr);

                method = (found ? removeClass : addClass);

                method(o, cStr);

                // indicate the new state...
                return !found;

            }

            return {
                has: hasClass,
                add: addClass,
                remove: removeClass,
                swap: swapClass,
                toggle: toggleClass
            };

        }()),

        dom: (function() {

            /**
             * append to the parent, append the given HTML (string, HTMLElement node)
             * @param parentNode (optional) Node object to append to; document otherwise
             * @param valid HTML string or HTMLElement node
             */
            function append(/* parentNode, html */) {

                var node,
                    html,
                    tmp, children, i, j;


                //case 1: simply append the html child to the node
                if (arguments.length === 2 &&
                    arguments[0] === utils.nodeTypes.ELEMENT_NODE &&
                    arguments[1] === utils.nodeTypes.ELEMENT_NODE)
                {
                    node = arguments[0];
                    html = arguments[1];
                    node.appendChild(html);
                    return node;
                }

                //case 2: The child is a string representation of html, no parent declared
                if (arguments.length === 1 && typeof (arguments[0]) === "string") {

                    // html only
                    node = document.documentElement; //<HTML> element
                    html = arguments[0];

                }

                //case 3: The child is a string representation of html
                else if (arguments.length === 2 &&
                    arguments[0].nodeType === utils.nodeTypes.ELEMENT_NODE &&
                    typeof (arguments[1]) === "string")
                {

                    // node, html
                    node = arguments[0];
                    html = arguments[1];

                }

                //assume we got some string html
                tmp = document.createElement('div');
                tmp.innerHTML = html;
                children = tmp.childNodes;

                for( i = 0, j = children.length; i < j; i ++ )
                {
                    if(children[i].nodeType === utils.nodeTypes.ELEMENT_NODE )
                    {
                        node.appendChild(children[i]);
                    }
                }

                //type NodeList (not Array)
                return node;
            }

            /**
             * getAll find and return the NodeList for the the given node, selector pair
             * @param node Node object to search from
             * @param selector (optional) string to select on
             * @return NodeList of results from node.querySelectorAll(selector)
             */
            function getAll(/* parentNode, selector */) {

                var node,
                    selector,
                    results;

                if (arguments.length === 1) {

                    // .selector case
                    node = document.documentElement; //<HTML> element
                    selector = arguments[0];

                } else {

                    // node, .selector
                    node = arguments[0];
                    selector = arguments[1];

                }

                // sorry, IE 7 users; IE 8+ required.
                if (node && node.querySelectorAll) {

                    results = node.querySelectorAll(selector);

                }

                //type NodeList (not Array)
                return results;

            }

            /**
             * get find and return the last element of the call to getAll
             * @param arguments consisting of node Node object to search from and
             * an optional string selector
             */
            function get(/* parentNode, selector */) {

                var results = getAll.apply({}, arguments);

                // hackish: if more than one match and no third argument, return the last.
                if (results && results.length) {
                    results = results[results.length-1];
                }

                return results;

            }

            /**
             * remove the given HTMLElement node
             * @param target the node to remove
             * @return true if the node was removed
             */
            function remove(target) {

                var parent;

                if( target.parentNode )
                {
                    parent = target.parentNode;
                    parent.removeChild(target);

                    if(!parent.contains(target))
                    {
                        return true;
                    }
                }
                return false;
            }

            /**
             * getParentAnchor return the first anchor HTMLelement in the
             * ancestor tree
             * @param  item the root node to search
             * @return the anchor HTMLElement; null otherwise
             */
            function getParentAnchor(item)
            {
                var target, targetNodeName;

                target = item;
                //go up tree to find the anchor
                do {
                    target = target.parentNode;
                    targetNodeName = target.nodeName.toLowerCase();
                } while (targetNodeName !== 'a' && target.parentNode);

                if(targetNodeName === 'a' && target.getAttribute('href'))
                {
                    return target;
                }

                return null;
            }

            return {
                get                     : get,
                getAll                  : getAll,
                remove                  : remove,
                getParentAnchor         : getParentAnchor,
                append                  : append
            };

        }()),

        position: (function() {

            //HTMLElement.offsetParent read-only property returns a reference to the object which
            // is the closest (nearest in the containment hierarchy) positioned containing element.

            // HTMLElement.offsetLeft read-only method returns the number of pixels that the upper
            // left corner of the current element is offset to the left within the HTMLElement.offsetParent node.

            //HTMLElement.offsetTop read-only property returns the distance of the current element
            // relative to the top of the offsetParent node.


            /**
             * getOffX crawl up the hierarchy and get the left offset from the page left
             */
            function getOffX(o) {

                // http://www.xs4all.nl/~ppk/js/findpos.html
                var curleft = 0;

                if (o.offsetParent) {

                    while (o.offsetParent) {

                        curleft += o.offsetLeft;

                        o = o.offsetParent;

                    }

                } else if (o.x) {

                    curleft += o.x;

                }

                return curleft;

            }

            /**
             * getOffY crawl up the hierarchy and get the top offset from the page top
             */
            function getOffY(o) {

                // http://www.xs4all.nl/~ppk/js/findpos.html
                var curtop = 0;

                if (o.offsetParent) {

                    while (o.offsetParent) {

                        curtop += o.offsetTop;

                        o = o.offsetParent;

                    }

                } else if (o.y) {

                    curtop += o.y;

                }

                return curtop;

            }

            return {
                getOffX: getOffX,
                getOffY: getOffY
            };

        }()),

        style: (function() {

            function get(node, styleProp) {

                // http://www.quirksmode.org/dom/getstyles.html
                var value;

                if (node.currentStyle) {

                    value = node.currentStyle[styleProp];

                } else if (window.getComputedStyle) {

                    value = document.defaultView.getComputedStyle(node, null).getPropertyValue(styleProp);

                }

                return value;

            }

            return {
                get: get
            };

        }()),

        events: (function() {

            var add, remove, preventDefault;

            add = function(o, evtName, evtHandler) {
                // return an object with a convenient detach method.
                var eventObject = {
                    detach: function() {
                        return remove(o, evtName, evtHandler);
                    }
                };
                if (window.addEventListener)
                {
                    o.addEventListener(evtName, evtHandler, false);
                }
                else
                {
                    //explorer -- <11 deprecated
                    o.attachEvent('on' + evtName, evtHandler);
                }
                return eventObject;
            };

            remove = (window.removeEventListener !== undefined ? function(o, evtName, evtHandler) {

                //If a listener was registered twice, one with capture and one without, each must be removed
                // separately. Removal of a capturing listener does not affect a non-capturing version of
                // the same listener, and vice versa.
                return o.removeEventListener(evtName, evtHandler, false);
            } : function(o, evtName, evtHandler) {
                return o.detachEvent('on' + evtName, evtHandler);
            });

            preventDefault = function(e) {
                if (e.preventDefault)
                {
                    e.preventDefault();
                }
                else
                {
                    e.returnValue = false;
                    e.cancelBubble = true;
                }
                return false;
            };

            return {
                add: add,
                preventDefault: preventDefault,
                remove: remove
            };

        }()),

        features: (function() {

            var getAnimationFrame,
                localAnimationFrame,
                localFeatures,
                prop,
                styles,
                testDiv,
                transform;

            testDiv = document.createElement('div');

            /**
             * hat tip: paul irish
             * http://paulirish.com/2011/requestanimationframe-for-smart-animating/
             * https://gist.github.com/838785
             */

            localAnimationFrame = (window.requestAnimationFrame ||
                window.webkitRequestAnimationFrame ||
                window.mozRequestAnimationFrame ||
                window.oRequestAnimationFrame ||
                window.msRequestAnimationFrame || null);

            // apply to window, avoid "illegal invocation" errors in Chrome
            getAnimationFrame = localAnimationFrame ? function() {
                return localAnimationFrame.apply(window, arguments);
            } : null;

            function has(prop) {

                // test for feature support
                var result = testDiv.style[prop];

                return (result !== undefined ? prop : null);

            }

            // note local scope.
            localFeatures = {

                transform: {
                    ie: has('-ms-transform'),
                    moz: has('MozTransform'),
                    opera: has('OTransform'),
                    webkit: has('webkitTransform'),
                    w3: has('transform'),
                    prop: null // the normalized property value
                },

                rotate: {
                    has3D: false,
                    prop: null
                },

                getAnimationFrame: getAnimationFrame

            };

            localFeatures.transform.prop = (
                localFeatures.transform.w3 ||
                localFeatures.transform.moz ||
                localFeatures.transform.webkit ||
                localFeatures.transform.ie ||
                localFeatures.transform.opera
                );

            function attempt(style) {

                try
                {
                    testDiv.style[transform] = style;
                }
                catch(e)
                {
                    // that *definitely* didn't work.
                    return false;
                }
                // if we can read back the style, it should be cool.
                return !!testDiv.style[transform];

            }

            if (localFeatures.transform.prop) {

                // try to derive the rotate/3D support.
                transform = localFeatures.transform.prop;
                styles = {
                    css_2d: 'rotate(0deg)',
                    css_3d: 'rotate3d(0,0,0,0deg)'
                };

                if (attempt(styles.css_3d))
                {
                    localFeatures.rotate.has3D = true;
                    prop = 'rotate3d';
                }
                else if (attempt(styles.css_2d))
                {
                    prop = 'rotate';
                }

                localFeatures.rotate.prop = prop;
            }

            testDiv = null;

            return localFeatures;

        }()),

        nodeTypes: {
            ELEMENT_NODE                                : 1,
            ATTRIBUTE_NODE                              : 2,
            TEXT_NODE                                   : 3,
            CDATA_SECTION_NODE                          : 4,
            ENTITY_REFERENCE_NODE                       : 5,
            ENTITY_NODE                                 : 6,
            PROCESSING_INSTRUCTION_NODE                 : 7,
            COMMENT_NODE                                : 8,
            DOCUMENT_NODE                               : 9,
            DOCUMENT_TYPE_NODE                          : 10,
            DOCUMENT_FRAGMENT_NODE                      : 11,
            NOTATION_NODE                               : 12,
            DOCUMENT_POSITION_DISCONNECTED              : 1,
            DOCUMENT_POSITION_PRECEDING                 : 2,
            DOCUMENT_POSITION_FOLLOWING                 : 4,
            DOCUMENT_POSITION_CONTAINS                  : 8,
            DOCUMENT_POSITION_CONTAINED_BY              : 16,
            DOCUMENT_POSITION_IMPLEMENTATION_SPECIFIC   : 32
        }

    };

    swipeData = function(event, direction, distance, duration, fingerCount, fingerData) {
        console.log($(this));
        console.log("event: %s", event);
        console.log("direction: %s", direction);
        console.log("distance: %s", distance);
        console.log("duration: %s", duration);
        console.log("fingerCount: %s", fingerCount);
        console.log("fingerData: %s", fingerData);
    };

    return {
        fetchUrl        : fetchUrl,
        updateUrl       : updateUrl,
        PubSub          : PubSub,
        truncate        : truncate,
        getCookie       : getCookie,
        csrfSafeMethod  : csrfSafeMethod,
        sameOrigin      : sameOrigin,
        parseClipData   : parseClipData,
        swipeData       : swipeData,
        utils           : utils,
        urlParse        : urlParse
    };
}());

module.exports = util;

