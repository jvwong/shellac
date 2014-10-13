/*
 * shell.js
 * Root namespace module
*/
/* global $, window, AudioContext, XMLHttpRequest, target_username, DEBUG */
'use strict';

var shell = (function () {

    //---------------- BEGIN MODULE DEPENDENCIES --------------
    var TAFFY   = require('taffydb').taffy,
        util    = require('../util.js'),
        sidebar = require('./sidebar.js'),
        bar     = require('../players/bar-ui.js');

    //---------------- END MODULE DEPENDENCIES --------------

    //---------------- BEGIN MODULE SCOPE VARIABLES --------------
    var
    initModule,

    configMap = {
        main_html: String() +
            '<div class="shellac-app-container">' +
                '<div class="shellac-app-player-container"></div>' +
                '<div class="shellac-app-sidebar-container col-sm-3 col-md-2"></div>' +
                '<div class="shellac-app-clip-container content"></div>' +
            '</div>',

        modal_html: String() +
            '<div class="modal fade" id="get_absolute_urlModal" tabindex="-1" role="dialog" aria-labelledby="get_absolute_urlModal" aria-hidden="true">' +
                '<div class="modal-dialog">' +
                    '<div class="modal-content">' +
                        '<div class="modal-header">' +
                            '<button type="button" class="close" data-dismiss="modal"><span aria-hidden="true">&times;</span><span class="sr-only">Close</span></button>' +
                        '</div>' +
                        '<div class="modal-body"></div>' +
                        '<div class="modal-footer">' +
                            '<button type="button" class="btn btn-default" data-dismiss="modal">Close</button>' +
                        '</div>' +
                    '</div>' +
                '</div>' +
            '</div>',

        truncatemax: 30
    },

    stateMap = {
        container          : undefined,
        target_username     : undefined,
        status              : undefined,

        latest_clips_db     : TAFFY(),

        selected            : undefined,
        DEBUG               : undefined
    },

    jqueryMap = {}, setJqueryMap,
    dom = {}, setDomMap,

    actions,
    render_clips,
    handlePlaylistChange, handleUrlFetch, handleClick,

    utils = util.utils,
    PubSub = util.PubSub;

    //---------------- END MODULE SCOPE VARIABLES --------------

    //--------------------- BEGIN MODULE SCOPE METHODS --------------------

    /**
     * setJqueryMap record the jQuery elements of the page
     */
    setJqueryMap = function(){
        var $outerDiv = $(stateMap.container);
        jqueryMap = {
            $modal_container            : $outerDiv.find('#get_absolute_urlModal'),
            $modal_header               : $outerDiv.find('#get_absolute_urlModal .modal-dialog .modal-content .modal-header'),
            $modal_body                 : $outerDiv.find('#get_absolute_urlModal .modal-dialog .modal-content .modal-body'),
            $modal_footer               : $outerDiv.find('#get_absolute_urlModal .modal-dialog .modal-content .modal-footer'),
        };
    };


    /**
     * setDomMap record the DOM elements of the page
     */
    setDomMap = function(){
        var outerDiv = stateMap.container;
        dom = {
            outerDiv                : outerDiv,
            app_container           : utils.dom.get(outerDiv, '.shellac-app-container'),
            sidebar_container       : utils.dom.get(outerDiv, '.shellac-app-container .shellac-app-sidebar-container'),
            player_container        : utils.dom.get(outerDiv, '.shellac-app-container .shellac-app-player-container'),
            clip_content_container  : utils.dom.get(outerDiv, '.shellac-app-container .shellac-app-clip-container'),

            modal_container         : utils.dom.get(outerDiv, '#get_absolute_urlModal'),
            modal_header            : utils.dom.get(outerDiv, '#get_absolute_urlModal .modal-dialog .modal-content .modal-header'),
            modal_body              : utils.dom.get(outerDiv, '#get_absolute_urlModal .modal-dialog .modal-content .modal-body'),
            modal_footer            : utils.dom.get(outerDiv, '#get_absolute_urlModal .modal-dialog .modal-content .modal-footer'),
        };
    };

    /**
     * actions ui action-related event handlers
     */
    actions = {

        modal: function(target) {

            var url;

            //guard against IE9
            url = target.dataset.url || target.hasAttibute('data-url') ? target.getAttribute('data-url') : '';

            if (url)
            {
                util.fetchUrl(url, 'permalink');

                //register listener for result -- using jquery here to save headaches -- bootstrap too
                util.PubSub.on("fetchUrlComplete", function(tag, result){
                    if( tag === 'permalink')
                    {
                        jqueryMap.$modal_body.html($(result).find('.permalink'));
                        jqueryMap.$modal_container.modal('show');
                    }
                });

            }

        },

        /**
         * enqueue pass the corresponding to a clip to the player playlist
         * NB: we should save out some state here...
         * @param target ElementNode for the clip to enqueue
         */
        enqueue : function(target) {

            var url, title, owner,
                clip = {
                    url: target.dataset.url || target.hasAttribute('data-url') ? target.getAttribute('data-url') : '',
                    title: target.dataset.title || target.hasAttribute('data-title') ? target.getAttribute('data-title') : '',
                    owner: target.dataset.owner || target.hasAttribute('data-owner') ? target.getAttribute('data-owner') : '',
                    label: target.dataset.label || target.hasAttribute('data-label') ? target.getAttribute('data-label') : ''
                };

            if (clip.url && clip.title && clip.owner)
            {
                stateMap.selected = target;
                bar.playerEnqueue(clip, 0);
            }
        }
    };

    //--------------------- END MODULE SCOPE METHODS --------------------


    //--------------------- BEGIN DOM METHODS --------------------
    /**
     * render_clips append the html for the clips to the main body of the page
     * @param clipList the list of clip objects
     * @param container DOM object that will contain the clips html
     */
    render_clips = function(clipList, container){

        var clipString = String();
        //clear out any existing html nodes and listeners
        container.innerHTML = "";
        utils.events.remove(container, 'click', handleClick);

        if(stateMap.latest_clips_db().count() === 0)
        {
            var message = String() +
                '<div class="col-xs-12 shellac-grid-element no-content">' +
                    '<h3>Nothing to hear here...</h3>' +
                '</div>';
            container.innerHTML  = message;
            return;
        }


        clipList.forEach(function(object){

            var clip,
                created = object.created.startOf('minute').fromNow(true),
                categories = object.categories.length > 0 ? object.categories.map(function(c){ return c.split('/')[5].toUpperCase(); })
                    .slice(0,3)
                    .join(" | ")
                    .toString() : "&nbsp;";

            clipString +=
                '<div class="col-xs-6 col-sm-4 col-md-4 col-lg-3 shellac-grid-element">' +
                    '<div class ="shellac-grid-element-panel">' +
                        '<span class="glyphicon enqueue-icon glyphicon-ok-circle"></span>' +
                        '<div class ="shellac-img-panel">' +
                            '<a href="#enqueue" data-url="' + object.audio_file_url + '" data-title="' + object.title + '" data-owner="' + object.owner + '">' +
                                '<img class="shellac-grid-img" src="' + object.brand_thumb_url  + '" alt="' + util.truncate(object.title, configMap.truncatemax) + '" />' +
                            '</a>' +
                        '</div>' +
                        '<div class ="shellac-caption-panel">' +
                            '<a href="#modal" data-url="' + object.permalink + '">' +
                                '<div class ="shellac-description-container">' +
                                    '<div class="shellac-description-content title" data-content="' + object.title + '">' + util.truncate(object.title, configMap.truncatemax) + '</div>' +
                                    '<div class="shellac-description-content owner" data-content="' + object.owner + '">' + object.owner + '</div>' +
                                    '<div class="shellac-description-content description-short">' + util.truncate(object.description , configMap.truncatemax) + '</div>' +
                                        '<div class="meta-data">' +
                                        '<div class="shellac-description-content plays" data-content="' + object.plays + '">' + object.plays + ' plays</div>' +
                                        '<div class="shellac-description-content meta rating" data-content="' + object.rating + '">' + object.rating + ' stars</div>' +
                                        '<div class="shellac-description-content meta created">' + created + '</div>' +
                                    '</div>' +
                                '</div>' +
                            '</a>' +
                        '</div>' +
                    '</div>' +
                '</div>';
        });

        container.innerHTML = clipString;

        // (re-)register click events on <a> of the entire ui
        utils.events.add(container, 'click', handleClick);
    };
    //--------------------- END DOM METHODS ----------------------

    //------------------- BEGIN EVENT HANDLERS -------------------

    /**
     * handleUrlFetch Callback for a ajax call
     * Actions: processes the returning data based on the tag
     * @param tag unique string for the fetch call
     * @param reult data returned by Ajax call
     */
    handleUrlFetch = function(tag, result){
        switch (tag)
        {
            case 'api_clips_status_person':
                var formatted = util.parseClipData(result);
                stateMap.latest_clips_db.insert(formatted);
                render_clips(stateMap.latest_clips_db().order("id desc").get(), dom.clip_content_container );

                //initialize the sidebar module
                sidebar.initModule( dom.sidebar_container, stateMap.latest_clips_db );
                break;
            default:
        }
    };
    // --- END handleUrlFetch ---

    /**
     * handleClick Callback for a click event on the entire UI
     * Actions: processes the clicking an anchor element.
     * @param e event object
     */
    handleClick = function(e) {

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

                // old IE (IE 8) might return nested elements inside the <a>, eg.,
                // <b> etc. Try to find the parent <a>.

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

                //excluded
                if (utils.css.has(target, 'shellac-exclude')) {

                    //do nothing

                } else {

                    // is this one of permalink, toggleq, ...
                    offset = target.href.lastIndexOf('#');

                    if (offset !== -1) {
                        methodName = target.href.substr(offset + 1);
                        if (methodName && actions[methodName]) {
                            handled = true;
                            actions[methodName](target);
                        }
                    }

                    // fall-through case
                    if (handled) {
                        // prevent browser fall-through
                        return utils.events.preventDefault(evt);
                    }

                }

            }// end if (targetNodeName === 'a')

        }//end if (target && target.nodeName)
    };
    // --- END handleClick ---

    /**
     * handlePlaylistChange Handler for change in Player playlist
     * Toggles the display value of check mark
     * @param item HTMLElement added / removed from playlist
     * @param isAdded true if element was added
     */
    handlePlaylistChange = function( item, isAdded ){
        var anchor, pathname,
            parent, enqueue,
            i, j;

        anchor = utils.dom.get(item, 'a');

        console.log(anchor);

        if(anchor)
        {
            pathname = util.urlParse(anchor.href).pathname;

            //make sure the stateMap last clicked is this one
            if(stateMap.selected && stateMap.selected.dataset.url === pathname)
            {
                parent = stateMap.selected;

                //should crawl up the dom to find this
                do {
                    parent = parent.parentNode;
                    enqueue = utils.dom.get(parent, '.enqueue-icon');
                } while( enqueue.length === 0 && parent.parentNode);


                if(isAdded)
                {
                    utils.css.add(enqueue, 'enqueued');
                }
                else
                {
                    utils.css.remove(enqueue, 'enqueued');
                }
            }
            else
            {
                //need to crawl around the dom search for this
            }
        }
    };
     //-------------------- END EVENT HANDLERS --------------------

    //------------------- BEGIN PUBLIC METHODS -------------------
    /**
     * initModule Populates container with the shell of the UI
     * and then configures and initializes feature modules.
     * The Shell is also responsible for browser-wide issues
     * Directs this app to offer its capability to the user
     * @param container A DOM HTMLElement that should represent a single DOM container
     * @param target_username account holder username for retrieving clips
     * @param DEBUG for debug purposes (root url)
     */
    initModule = function( container, target_username, status, DEBUG){
        // load HTML and map jQuery collections
        stateMap.container = container;
        stateMap.target_username = target_username;
        stateMap.status = status;
        stateMap.DEBUG = DEBUG;

        utils.dom.append(container, configMap.main_html);
        utils.dom.append(container, configMap.modal_html);
        utils.dom.append(container, configMap.modal_button_html);
        setDomMap();
        setJqueryMap();

        //register pub-sub methods
        util.PubSub.on("fetchUrlComplete", handleUrlFetch);
        util.PubSub.on('playlist-change', handlePlaylistChange);
        util.PubSub.on("shellac-app-clip-change", function(clips){
            render_clips(clips, dom.clip_content_container);
        });
        util.PubSub.on('on-play', function(p){
            console.log("'on-play' called");
            console.log(p);
        });
        util.PubSub.on('on-pause', function(p){
            console.log("'on-pause' called");
            console.log(p.position);
        });

        //load data into in-browser database
        var clipsUrl = ['/api/clips', stateMap.status, target_username, ""].join('/');
        util.fetchUrl(clipsUrl, 'api_clips_status_person');

        bar.initModule( dom.player_container );
    };

    return { initModule: initModule };
}());

module.exports = shell;

