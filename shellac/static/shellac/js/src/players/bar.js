/*
 * bar.js
 * Root module for the sm2 player bar UI
 */
/* global $, window, DEBUG, document */
'use strict';

var bar = (function () {

    //---------------- BEGIN MODULE DEPENDENCIES --------------
    var
        util = require('../util.js'),
        bar_ui,
        api = {};

    //---------------- END MODULE DEPENDENCIES --------------

    //---------------- BEGIN MODULE SCOPE VARIABLES --------------
    var
        initModule,

        configMap = {
            bar_html: String() +
                '<div class="sm2-bar-ui full-width fixed">' +

                    '<div class="bd sm2-main-controls">' +

                        '<div class="sm2-inline-texture"></div>' +
                        '<div class="sm2-inline-gradient"></div>' +

                        '<div class="sm2-inline-element sm2-button-element">' +
                            '<div class="sm2-button-bd">' +
                                '<a href="#play" class="sm2-inline-button play-pause">Play / pause</a>' +
                            '</div>' +
                        '</div>' +

                        '<div class="sm2-inline-element sm2-inline-status">' +

                            '<div class="sm2-playlist">' +
                                '<div class="sm2-playlist-target">' +
                                    '<!-- playlist <ul> + <li> markup will be injected here -->' +
                                    '<!-- if you want default / non-JS content, you can put that here. -->' +
                                    '<noscript><p>JavaScript is required.</p></noscript>' +
                                '</div>' +
                            '</div>' +

                            '<div class="sm2-progress">' +
                                '<div class="sm2-row">' +
                                    '<div class="sm2-inline-time">0:00</div>' +
                                    '<div class="sm2-progress-bd">' +
                                        '<div class="sm2-progress-track">' +
                                            '<div class="sm2-progress-bar"></div>' +
                                            '<div class="sm2-progress-ball"><div class="icon-overlay"></div></div>' +
                                        '</div>' +
                                    '</div>' +
                                    '<div class="sm2-inline-duration">0:00</div>' +
                                '</div>' +
                            '</div>' +

                        '</div>' +

                        '<div class="sm2-inline-element sm2-button-element sm2-volume">' +
                            '<div class="sm2-button-bd">' +
                                '<span class="sm2-inline-button sm2-volume-control volume-shade"></span>' +
                                '<a href="#volume" class="sm2-inline-button sm2-volume-control">volume</a>' +
                            '</div>' +
                        '</div>' +

                        '<div class="sm2-inline-element sm2-button-element">' +
                            '<div class="sm2-button-bd">' +
                                '<a href="#prev" title="Previous" class="sm2-inline-button previous">&lt; previous</a>' +
                            '</div>' +
                        '</div>' +

                        '<div class="sm2-inline-element sm2-button-element">' +
                            '<div class="sm2-button-bd">' +
                                '<a href="#next" title="Next" class="sm2-inline-button next">&gt; next</a>' +
                            '</div>' +
                        '</div>' +

                        '<div class="sm2-inline-element sm2-button-element sm2-menu">' +
                            '<div class="sm2-button-bd">' +
                                '<a href="#menu" class="sm2-inline-button menu">menu</a>' +
                            '</div>' +
                        '</div>' +

                    '</div>' +

                    '<div class="bd sm2-playlist-drawer sm2-element">' +

                        '<div class="sm2-inline-texture">' +
                            '<div class="sm2-box-shadow"></div>' +
                        '</div>' +

                        '<!-- playlist content is mirrored here -->' +

                        '<div class="sm2-playlist-wrapper">' +
                            '<ul class="sm2-playlist-bd">' +
                                '<li data-url=""><a href="http://freshly-ground.com/data/audio/sm2/SonReal%20-%20Let%20Me%20%28Prod%202oolman%29.mp3"><b>SonReal</b>- Let Me<span class="label">Explicit</span></a></li>' +
                            '</ul>' +
                        '</div>' +

                        '<div class="sm2-extra-controls">' +

                            '<div class="bd">' +

                                '<div class="sm2-inline-element sm2-button-element">' +
                                    '<a href="#prev" title="Previous" class="sm2-inline-button previous">&lt; previous</a>' +
                                '</div>' +

                                '<div class="sm2-inline-element sm2-button-element">' +
                                    '<a href="#next" title="Next" class="sm2-inline-button next">&gt; next</a>' +
                                '</div>' +

                                '<!-- unimplemented -->' +
                                '<!--' +
                                '<div class="sm2-inline-element sm2-button-element disabled">' +
                                 '<a href="#repeat" title="Repeat playlist" class="sm2-inline-button repeat">&infin; repeat</a>' +
                                '</div>' +

                                '<div class="sm2-inline-element sm2-button-element disabled">' +
                                 '<a href="#shuffle" title="Shuffle" class="sm2-inline-button shuffle">shuffle</a>' +
                                '</div>' +
                                '-->' +

                            '</div>' +

                        '</div>' +

                    '</div>' +

                '</div>'


        },

        stateMap = {
            $container          : undefined,
            DEBUG               : undefined
        },

        dom, setDomMap,

        handleClipSelect,

        adjustDrawer,

        PubSub = util.PubSub,

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

            return {
                get: get,
                getAll: getAll
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

        }())

    };

    //---------------- END MODULE SCOPE VARIABLES --------------

    //--------------------- BEGIN MODULE SCOPE METHODS --------------------

    /**
     *  setDomMap
     * @return true for a valid dom map initialization
     */
    setDomMap = function(){
        var outerDiv = stateMap.$container.get(0);
        dom = {
            outerDiv: outerDiv,
            o: utils.dom.get(outerDiv, '.sm2-bar-ui'),
            playlist: utils.dom.get(outerDiv, '.sm2-playlist-bd'),
            playlistContainer: utils.dom.get(outerDiv, '.sm2-playlist-drawer')
        };

        if (dom.playlist.length === 0) {
            console.warn('init(): No playlist element?');
            return false;
        }

        return true;
    };
    //--------------------- END MODULE SCOPE METHODS --------------------


    //--------------------- BEGIN DOM METHODS --------------------
    function isRightClick(e) {
        // only pay attention to left clicks. old IE differs where there's no e.which, but e.button is 1 on left click.
        if (e && ((e.which && e.which === 2) || (e.which === undefined && e.button !== 1))) {
            // http://www.quirksmode.org/js/events_properties.html#button
            return true;
        }
    }
    // --- END isRightClick ---


    adjustDrawer = function(){
        var isOpen;

        isOpen = utils.css.has(dom.o, 'playlist-open');
        console.log(dom.playlistContainer.offsetHeight);
        dom.playlistContainer.style.height = (isOpen ? dom.playlistContainer.scrollHeight : 0) + 'px';
    };

    //--------------------- END DOM METHODS ----------------------

    //------------------- BEGIN EVENT HANDLERS -------------------
    //-------------------- END EVENT HANDLERS --------------------

    //------------------- BEGIN PUBLIC METHODS -------------------
    /**
     * handleClipSelect Listener for the click event
     * Will remove audio clip if present and add otherwise
     * @param event jQuery event object
     */
    handleClipSelect = function(event){
        var imgs,
            target;

        target = event.target || event.srcElement;

        if (isRightClick(event)) {
            return true;
        }

        if (target.nodeName.toLowerCase() !== 'img')
        {
            imgs = target.getElementsByTagName('img');
            if (imgs && imgs.length) {
                target = target.getElementsByTagName('img')[0];
            }
        }

        //make sure this is our media-img image
        if (utils.css.has(target, 'media-img')) {

            //retrieve the url from the parent element (span)
            var parent, parents, url, title, owner, items, i, j, owner_elt, title_elt, newClip;

            parent = target.parentNode;
            if (parent.nodeName.toLowerCase() !== 'span')
            {
                parents = target.getElementsByTagName('span');
                if (parents && parents.length) {
                    parent = parent.getElementsByTagName('span')[0];
                }
            }

            url = parent.getAttribute('data-clip-url');
            if (url === undefined || url === ''){ return; }

            title = utils.dom.get(parent, '.media-description-content.title').textContent || 'Untitled';
            owner = utils.dom.get(parent, '.media-description-content.owner').textContent || 'Orphan';

            //test for the presence of the clip (toggle)
            items = utils.dom.getAll(dom.playlist, 'li');

            if (items && items.length > 0){
                for (i=0, j=items.length; i<j; i++) {
                    if(items[i].dataset.url === url)
                    {
                        items[i].remove();
                        adjustDrawer();
                        return;
                    }
                }
            }

            newClip = document.createElement("li");
            newClip.dataset.url = url;
            newClip.innerHTML = ['<a href="', url, '"><b>', owner,'</b>- ', title, '</a>'].join('');

            dom.playlist.appendChild(newClip);
            adjustDrawer();
        }

    };



    /**
     * initModule Populates $container with the shell of the UI
     * and then configures and initializes feature modules.
     * The Shell is also responsible for browser-wide issues
     * Directs this app to offer its capability to the user
     * @param $container A jQuery collection that should represent a single DOM container
     * @param DEBUG for debug purposes (root url)
     */
    initModule = function( $container, DEBUG){
        var valid;

        // load HTML and map jQuery collections
        stateMap.$container = $container;
        stateMap.DEBUG = DEBUG;

        $container.append( configMap.bar_html );
        valid = setDomMap();

        if(!valid)
        {
            console.warn('failed to initialize');
            return api = {
                handleClipSelect: utils.noop
            };
        }

        bar_ui = require('./bar-ui.js');
        return api = {
            handleClipSelect: handleClipSelect
        };


    };


    return {
        initModule: initModule
    };
}());

module.exports = bar;





