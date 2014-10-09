/**
 * SoundManager 2: "Bar UI" player
 * http://www.schillmania.com/projects/soundmanager2/
 */
/* global soundManager, document, console, window, navigator */
'use strict';

var bar_ui = (function() {

    var initModule,

        Player,
        players = [],
        playerSelector = '.sm2-bar-ui',
        utils,
        soundManager = require('../../lib/soundmanager2/script/soundmanager2.js').soundManager;


    soundManager.setup({
        // trade-off: higher UI responsiveness (play/progress bar), but may use more CPU.
        html5PollingInterval: 50,
        flashVersion: 9
    });

    soundManager.onready(function() {

        var nodes,
            i, j;

        nodes = utils.dom.getAll(playerSelector);

        if (nodes && nodes.length) {
            for (i=0, j=nodes.length; i<j; i++) {
                players.push(new Player(nodes[i]));
            }
        }

    });

    utils = {

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

    /**
     * Player bits
     */
        // --- BEGIN Player ---
    Player = function(playerNode) {

        var css, dom, extras,
            playlistController, soundObject, actions, actionData, defaultItem;

        css = {
            disabled: 'disabled',
            selected: 'selected',
            active: 'active',
            legacy: 'legacy',
            noVolume: 'no-volume'
        };

        dom = {
            o: null,
            playlist: null,
            playlistTarget: null,
            playlistContainer: null,
            time: null,
            player: null,
            progress: null,
            progressTrack: null,
            progressBar: null,
            duration: null,
            volume: null
        };

        // prepended to tracks when a sound fails to load/play
        extras = {
            loadFailedCharacter: '<span title="Failed to load/play." class="load-error">✖</span>'
        };

        function PlaylistController() {

            var data;

            data = {

                // HTMLCollection [li,...,li]
                playlist: [],

                // shuffledIndex: [],

                // the single HTML element with class 'selection' appended
                selectedIndex: 0,

                // shuffleMode: false,

                loopMode: false,

                timer: null

            };

            function getPlaylist() {

                return data.playlist;

            }

            /**
             * getItem the current selection (or an offset), return the current item.
             * Checks for out-of-bounds
             * @param offset the integer index to retrieve in the playList
             * @return item HTMLCollection element aka playlist item (li)
             */
            function getItem(offset) {

                var list, item;

                // if currently null, may be end of list case. bail.
                if (data.selectedIndex === null) {
                    return offset;
                }

                list = getPlaylist();

                // use offset if provided, otherwise take default selected.
                offset = (offset !== undefined ? offset : data.selectedIndex);

                // safety check - limit to between 0 and list length
                offset = Math.max(0, Math.min(offset, list.length));

                item = list[offset];

                return item;

            }

            /**
             * findOffsetFromItem given an <li> item, find it in the playlist array and return the index.
             * @param item HTMLCollection element
             * @return offset index of item in playlist HTMLCollection
             */
            function findOffsetFromItem(item) {

                var list,
                    i,
                    j,
                    offset;

                offset = -1;

                list = getPlaylist();

                if (list) {

                    for (i=0, j=list.length; i<j; i++) {
                        if (list[i] === item) {
                            offset = i;
                            break;
                        }
                    }

                }

                return offset;

            }

            function getNext() {

                // don't increment if null.
                if (data.selectedIndex !== null) {
                    data.selectedIndex++;
                }

                if (data.playlist.length > 1) {

                    if (data.selectedIndex >= data.playlist.length) {

                        if (data.loopMode) {

                            // loop to beginning
                            data.selectedIndex = 0;

                        } else {

                            // no change
                            data.selectedIndex--;

                            // end playback
                            // data.selectedIndex = null;

                        }

                    }

                } else {

                    data.selectedIndex = null;

                }

                return getItem();

            }

            function getPrevious() {

                data.selectedIndex--;

                if (data.selectedIndex < 0) {
                    // wrapping around beginning of list? loop or exit.
                    if (data.loopMode) {
                        data.selectedIndex = data.playlist.length - 1;
                    } else {
                        // undo
                        data.selectedIndex++;
                    }
                }

                return getItem();

            }

            /**
             * resetLastSelected get all the playlist elements and
             * clear out 'selected' from their className string
             */
            function resetLastSelected() {

                // remove UI highlight(s) on selected items.
                var items,
                    i, j;

                items = utils.dom.getAll(dom.playlist, '.' + css.selected);

                for (i=0, j=items.length; i<j; i++) {
                    utils.css.remove(items[i], css.selected);
                }

            }

            /**
             * select set the item as the only with class
             * attribute 'selected'
             * Action: sets data.selectedIndex as item offset
             * @param item a HTML element aka playlist item
             */
            function select(item) {

                var offset;

                // remove last selected, if any
                resetLastSelected();

                if (item) {
                    utils.css.add(item, css.selected);
                }

                // update selected offset, too.
                offset = findOffsetFromItem(item);
                data.selectedIndex = offset;
            }

            function getURL() {

                // return URL of currently-selected item
                var item, url;

                item = getItem();


                if (item) {
                    url = item.getElementsByTagName('a')[0].href;
                }

                return url;

            }

            function refreshDOM() {

                // get / update playlist from DOM

                if (!dom.playlist) {
                    if (window.console && console.warn) {
                        console.warn('refreshDOM(): playlist node not found?');
                    }
                    return false;
                }

                data.playlist = dom.playlist.getElementsByTagName('li');

            }

            function initDOM() {

                dom.playlistTarget = utils.dom.get(dom.o, '.sm2-playlist-target');
                dom.playlistContainer = utils.dom.get(dom.o, '.sm2-playlist-drawer');
                dom.playlist = utils.dom.get(dom.o, '.sm2-playlist-bd');

            }

            function init() {

                initDOM();

                refreshDOM();

            }

            init();

            return {
                data: data,
                refresh: refreshDOM,
                getNext: getNext,
                getPrevious: getPrevious,
                getItem: getItem,
                getURL: getURL,
                select: select
            };

        }
        // --- END PlaylistController ---


        function getTime(msec, useString) {

            // convert milliseconds to hh:mm:ss, return as object literal or string

            var nSec = Math.floor(msec/1000),
                hh = Math.floor(nSec/3600),
                min = Math.floor(nSec/60) - Math.floor(hh * 60),
                sec = Math.floor(nSec -(hh*3600) -(min*60));

            // if (min === 0 && sec === 0) return null; // return 0:00 as null

            return (useString ? ((hh ? hh + ':' : '') + (hh && min < 10 ? '0' + min : min) + ':' + ( sec < 10 ? '0' + sec : sec ) ) : { 'min': min, 'sec': sec });

        }
        // --- END getTime ---


        /**
         * setTitle Given a link, update the "now playing" UI.
         * Actions: processes the first item if item has multiple A elements
         * @param item the HTML element aka playlist element
         */
        function setTitle(item) {

            // if this is an <li> with an inner link, grab and use the text from that.
            var links = item.getElementsByTagName('a');

            if (links.length) {
                item = links[0];
            }

            // replace .sm2-playlist-target inner HTML
            // remove any failed character sequence, also
            dom.playlistTarget.innerHTML = '<ul class="sm2-playlist-bd"><li>' + item.innerHTML.replace(extras.loadFailedCharacter, '') + '</li></ul>';

            //do some cleaning if the title is longer than the width
            if (dom.playlistTarget.getElementsByTagName('li')[0].scrollWidth > dom.playlistTarget.offsetWidth) {
                // this item can use <marquee>, in fact.
                dom.playlistTarget.innerHTML = '<ul class="sm2-playlist-bd"><li><marquee>' + item.innerHTML + '</marquee></li></ul>';
            }

        }
        // --- END setTitle ---

        function makeSound(url) {

            var sound = soundManager.createSound({

                url: url,

                whileplaying: function() {
                    var progressMaxLeft = 100,
                        left,
                        width;

                    left = Math.min(progressMaxLeft, Math.max(0, (progressMaxLeft * (this.position / this.durationEstimate)))) + '%';
                    width = Math.min(100, Math.max(0, (100 * this.position / this.durationEstimate))) + '%';

                    if (this.duration) {

                        dom.progress.style.left = left;
                        dom.progressBar.style.width = width;

                        // TODO: only write changes
                        dom.time.innerHTML = getTime(this.position, true);

                    }

                },

                onbufferchange: function(isBuffering) {
                    if (isBuffering) {
                        utils.css.add(dom.o, 'buffering');
                    } else {
                        utils.css.remove(dom.o, 'buffering');
                    }
                },

                onplay: function() {
                    utils.css.swap(dom.o, 'paused', 'playing');
                },

                onpause: function() {
                    utils.css.swap(dom.o, 'playing', 'paused');
                },

                onresume: function() {
                    utils.css.swap(dom.o, 'paused', 'playing');
                },

                whileloading: function() {

                    if (!this.isHTML5) {
                        dom.duration.innerHTML = getTime(this.durationEstimate, true);
                    }

                },

                onload: function(ok) {

                    if (ok) {

                        dom.duration.innerHTML = getTime(this.duration, true);

                    } else if (this._iO && this._iO.onerror) {

                        this._iO.onerror();

                    }

                },

                onerror: function() {

                    // sound failed to load.
                    var item, element, html;

                    item = playlistController.getItem();

                    if (item) {

                        // note error, delay 2 seconds and advance?
                        // playlistTarget.innerHTML = '<ul class="sm2-playlist-bd"><li>' + item.innerHTML + '</li></ul>';

                        if (extras.loadFailedCharacter) {
                            dom.playlistTarget.innerHTML = dom.playlistTarget.innerHTML.replace('<li>' ,'<li>' + extras.loadFailedCharacter + ' ');
                            if (playlistController.data.playlist && playlistController.data.playlist[playlistController.data.selectedIndex]) {
                                element = playlistController.data.playlist[playlistController.data.selectedIndex].getElementsByTagName('a')[0];
                                html = element.innerHTML;
                                if (html.indexOf(extras.loadFailedCharacter) === -1) {
                                    element.innerHTML = extras.loadFailedCharacter + ' ' + html;
                                }
                            }
                        }

                    }

                    // load next, possibly with delay.

                    if (navigator.userAgent.match(/mobile/i)) {
                        // mobile will likely block the next play() call if there is a setTimeout() - so don't use one here.
                        actions.next();
                    } else {
                        if (playlistController.data.timer) {
                            window.clearTimeout(playlistController.data.timer);
                        }
                        playlistController.data.timer = window.setTimeout(actions.next, 1000);
                    }

                },

                onstop: function() {

                    utils.css.remove(dom.o, 'playing');

                },

                onfinish: function() {

                    var lastIndex, item;

                    utils.css.remove(dom.o, 'playing');

                    dom.progress.style.left = '0%';

                    lastIndex = playlistController.data.selectedIndex;

                    // next track?
                    item = playlistController.getNext();

                    // don't play the same item over and over again, if at end of playlist etc.
                    if (item && playlistController.data.selectedIndex !== lastIndex) {

                        playlistController.select(item);

                        setTitle(item);

                        // play next
                        this.play({
                            url: playlistController.getURL()
                        });

                    }/* else {

                     // explicitly stop?
                     // this.stop();

                     }*/

                }

            });

            return sound;

        }
        // --- END makeSound ---

        function isRightClick(e) {
            // only pay attention to left clicks. old IE differs where there's no e.which, but e.button is 1 on left click.
            if (e && ((e.which && e.which === 2) || (e.which === undefined && e.button !== 1))) {
                // http://www.quirksmode.org/js/events_properties.html#button
                return true;
            }
        }
        // --- END isRightClick ---


        /**
         * handleMouseDown Callback for a mousedown event
         * Actions: processes the mousedown on anchor for volume control
         * @param e event object
         */
        function handleMouseDown(e) {
            // https://developer.mozilla.org/en-US/docs/Web/API/HTMLElement.offsetWidth
            // HTMLElement.offsetWidth read-only property returns the layout width of an element.
            // Typically, an element's offsetWidth is a measurement which includes the element borders,
            // the element horizontal padding, the element vertical scrollbar (if present, if rendered)
            // and the element CSS width.

            var links,
                target;

            target = e.target || e.srcElement;

            if (isRightClick(e)) {
                return true;
            }

            // normalize to <a>, if applicable.
            if (target.nodeName.toLowerCase() !== 'a') {
                links = target.getElementsByTagName('a');
                if (links && links.length) {
                    target = target.getElementsByTagName('a')[0];
                }
            }

            if (utils.css.has(target, 'sm2-volume-control')) {

                // browser window x, y
                actionData.volume.x = utils.position.getOffX(target);
                actionData.volume.y = utils.position.getOffY(target);

                // containing element width, height
                actionData.volume.width = target.offsetWidth;
                actionData.volume.height = target.offsetHeight;

                // background-size CSS property specifies the size of the background images.
                // potentially dangerous: this should, but may not be a percentage-based value.
                actionData.volume.backgroundSize = parseInt(utils.style.get(target, 'background-size'), 10);

                // IE gives pixels even if background-size specified as % in CSS. Boourns.
                if (window.navigator.userAgent.match(/msie|trident/i)) {
                    actionData.volume.backgroundSize = (actionData.volume.backgroundSize / actionData.volume.width) * 100;
                }

                utils.events.add(document, 'mousemove', actions.adjustVolume);
                utils.events.add(document, 'mouseup', actions.releaseVolume);

                // and apply right away - that is, on 'mousedown'
                return actions.adjustVolume(e);

            }

        }
        // --- END handleMouseDown ---

        function playLink(link) {

            // if a link is OK, play it.

            if (soundManager.canPlayURL(link.href)) {

                if (!soundObject) {
                    soundObject = makeSound(link.href);
                }

                // required to reset pause/play state on iOS so whileplaying() works? odd.
                soundObject.stop();

                playlistController.select(link.parentNode);

                // TODO: ancestor('li')
                setTitle(link.parentNode);

                soundObject.play({
                    url: link.href,
                    position: 0
                });

            }

        }
        // --- END playLink ---


        /**
         * handleClick Callback for a click event on the entire UI
         * Actions: processes the mousedown on clicking an anchor element. Could
         * represent a drawer playlist element or an action button. So handle all these.
         * @param e event object
         */
        function handleClick(e) {

            var evt,
                target,
                offset,
                targetNodeName,
                methodName,
                href,
                handled;

            evt = (e || window.event);

            target = evt.target || evt.srcElement;

            if (target && target.nodeName) {

                targetNodeName = target.nodeName.toLowerCase();

                if (targetNodeName !== 'a') {

                    // old IE (IE 8) might return nested elements inside the <a>, eg., <b> etc. Try to find the parent <a>.

                    if (target.parentNode) {

                        do {
                            target = target.parentNode;
                            targetNodeName = target.nodeName.toLowerCase();
                        } while (targetNodeName !== 'a' && target.parentNode);

                        if (!target) {
                            // something went wrong. bail.
                            return false;
                        }

                    }

                }

                if (targetNodeName === 'a') {

                    // yep, it's a link.

                    href = target.href;

                    //the a might refer to a drawer element, so handle that directly
                    if (soundManager.canPlayURL(href)) {

                        // not excluded
                        if (!utils.css.has(target, 'sm2-exclude')) {

                            // find this in the playlist

                            playLink(target);

                            handled = true;

                        }

                    } else {

                        // is this one of the action buttons, eg., play/pause, volume, etc.?
                        offset = target.href.lastIndexOf('#');

                        if (offset !== -1) {
                            methodName = target.href.substr(offset+1);
                            if (methodName && actions[methodName]) {
                                handled = true;
                                actions[methodName](e);
                            }
                        }

                    }

                    // fall-through case

                    if (handled) {
                        // prevent browser fall-through
                        return utils.events.preventDefault(evt);
                    }

                }

            }

        }
        // --- END handleClick ---

        function handleMouse(e) {

            var target, barX, barWidth, x, newPosition, sound;

            target = dom.progressTrack;

            barX = utils.position.getOffX(target);
            barWidth = target.offsetWidth;

            x = (e.clientX - barX);

            newPosition = (x / barWidth);

            sound = soundObject;

            if (sound && sound.duration) {

                sound.setPosition(sound.duration * newPosition);

                // a little hackish: ensure UI updates immediately with current position, even if audio is buffering and hasn't moved there yet.
                sound._iO.whileplaying.apply(sound);

            }

            if (e.preventDefault) {
                e.preventDefault();
            }

            return false;

        }
        // --- END handleMouse ---

        function releaseMouse(e) {

            utils.events.remove(document, 'mousemove', handleMouse);

            utils.css.remove(dom.o, 'grabbing');

            if (e.preventDefault) {
                e.preventDefault();
            }

            utils.events.remove(document, 'mouseup', releaseMouse);

            return false;

        }
        // --- END releaseMouse ---

        // --- BEGIN init ---
        function init() {

            // init DOM?

            if (!playerNode) {
                console.warn('init(): No playerNode element?');
            }

            dom.o = playerNode;

            // are we dealing with a crap browser? apply legacy CSS if so.
            if (window.navigator.userAgent.match(/msie [678]/i)) {
                utils.css.add(dom.o, css.legacy);
            }

            if (window.navigator.userAgent.match(/mobile/i)) {
                // majority of mobile devices don't let HTML5 audio set volume.
                utils.css.add(dom.o, css.noVolume);
            }

            dom.progress = utils.dom.get(dom.o, '.sm2-progress-ball');

            dom.progressTrack = utils.dom.get(dom.o, '.sm2-progress-track');

            dom.progressBar = utils.dom.get(dom.o, '.sm2-progress-bar');

            dom.volume = utils.dom.get(dom.o, 'a.sm2-volume-control');

            dom.duration = utils.dom.get(dom.o, '.sm2-inline-duration');

            dom.time = utils.dom.get(dom.o, '.sm2-inline-time');

            playlistController = new PlaylistController();
            //init() within PlaylistController populates playlist from DOM
            //using 'sm2-playlist-bd' ul

            //get li in the data.playList[0] HTMLCollection
            defaultItem = playlistController.getItem(0);
            playlistController.select(defaultItem);
            setTitle(defaultItem);


            // Handling mousedown events on <a> of the
            // entire bar-ui (currently .sm2-volume-control)
            utils.events.add(dom.o, 'mousedown', handleMouseDown);

            // Handling click events on <a> of the
            // entire bar-ui (currently drawer, play-pause)
            utils.events.add(dom.o, 'click', handleClick);

            utils.events.add(dom.progressTrack, 'mousedown', function(e) {

                if (isRightClick(e)) {
                    return true;
                }

                utils.css.add(dom.o, 'grabbing');
                utils.events.add(document, 'mousemove', handleMouse);
                utils.events.add(document, 'mouseup', releaseMouse);

                return handleMouse(e);

            });

        }
        // --- END init ---

        // --- BEGIN actionData ---
        actionData = {

            volume: {
                x: 0,
                y: 0,
                width: 0,
                height: 0,
                backgroundSize: 0
            }

        };
        // --- END actionData ---

        actions = {

            play: function(e) {

                var target,
                    href;

                target = e.target || e.srcElement;

                href = target.href;

                // haaaack - if '#' due to play/pause link, get first link from playlist
                if (href.indexOf('#') !== -1) {
                    href = dom.playlist.getElementsByTagName('a')[0].href;
                }

                if (!soundObject) {
                    soundObject = makeSound(href);
                }

                soundObject.togglePause();

            },

            next: function(/* e */) {

                var item, lastIndex;

                // special case: clear "play next" timeout, if one exists.
                if (playlistController.data.timer) {
                    window.clearTimeout(playlistController.data.timer);
                    playlistController.data.timer = null;
                }

                lastIndex = playlistController.data.selectedIndex;

                item = playlistController.getNext(true);

                // don't play the same item again
                if (item && playlistController.data.selectedIndex !== lastIndex) {
                    playLink(item.getElementsByTagName('a')[0]);
                }

            },

            prev: function(/* e */) {

                var item, lastIndex;

                lastIndex = playlistController.data.selectedIndex;

                item = playlistController.getPrevious();

                // don't play the same item again
                if (item && playlistController.data.selectedIndex !== lastIndex) {
                    playLink(item.getElementsByTagName('a')[0]);
                }

            },

            shuffle: function(e) {
                var target = e.target || e.srcElement;
                if (!utils.css.has(target.parentNode, css.disabled)) {
                    // toggle
                    utils.css.toggle(target.parentNode, css.active);
                    playlistController.data.shuffleMode = !playlistController.data.shuffleMode;
                }
            },

            repeat: function(e) {
                var target = e.target || e.srcElement;
                if (!utils.css.has(target, css.disabled)) {
                    utils.css.toggle(target.parentNode, css.active);
                    playlistController.data.loopMode = !playlistController.data.loopMode;
                }
            },

            menu: function(/* e */) {

                var isOpen;

                isOpen = utils.css.toggle(dom.o, 'playlist-open');

                // playlist
                dom.playlistContainer.style.height = (isOpen ? dom.playlistContainer.scrollHeight : 0) + 'px';

            },

            adjustVolume: function(e) {

                var backgroundSize,
                    backgroundMargin,
                    pixelMargin,
                    target,
                    value,
                    volume;

                value = 0;

                target = dom.volume; //'a.sm2-volume-control'

                // based on getStyle() result
                backgroundSize = actionData.volume.backgroundSize;

                // figure out spacing around background image based on background size, eg. 60% background size.
                backgroundSize = 100 - backgroundSize;

                // 60% wide means 20% margin on each side.
                backgroundMargin = backgroundSize / 2;

                // relative position of mouse over element
                value = Math.max(0, Math.min(1, (e.clientX - actionData.volume.x) / actionData.volume.width));

                target.style.clip = 'rect(0px, ' + (actionData.volume.width * value) + 'px, ' + actionData.volume.height + 'px, ' + (actionData.volume.width * (backgroundMargin/100)) + 'px)';

                // determine logical volume, including background margin
                pixelMargin = ((backgroundMargin/100) * actionData.volume.width);

                volume = Math.max(0, Math.min(1, ((e.clientX - actionData.volume.x) - pixelMargin) / (actionData.volume.width - (pixelMargin*2))));

                // set volume
                // object:SMSound setVolume(id:string, volume:integer)
                // Sets the volume of the sound specified by ID and returns the related sound object.
                // Accepted values: 0-100. Affects volume property.
                if (soundObject) {
                    soundObject.setVolume(volume * 100);
                }

                //i.e. don't follow the <a href="url"> where we stored the playlist
                return utils.events.preventDefault(e);

            },

            releaseVolume: function(/* e */) {

                utils.events.remove(document, 'mousemove', actions.adjustVolume);
                utils.events.remove(document, 'mouseup', actions.releaseVolume);

            }/*,

             volume: function(e) {

             if (e.type === 'mousedown') {

             utils.events.add(document, 'mousemove', actions.adjustVolume);

             return utils.events.preventDefault(e);

             } else if (e.type === 'mouseup') {

             utils.events.remove(document, 'mousemove', actions.adjustVolume);

             }

             }*/

        };

        init();

    };
    // --- END Player ---

    // expose to global
    //window.sm2BarPlayers = players;
    //window.SM2BarPlayer = Player;

    /**
     * initModule Configures and initializes feature modules.
     * @param window
     * @param
     */
    initModule = function(){
        console.log(window);
    };

    return { initModule: initModule };

}());

module.exports = bar_ui;