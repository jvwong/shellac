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

    utils = util.utils,
    PubSub = util.PubSub,

    initModule, initUI, initDom,
    registerPubSub,
    setPreferences,

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
        container           : undefined,
        user                : undefined,
        target_username     : undefined,
        status              : undefined,
        latest_clips_db     : TAFFY(),
        selected            : undefined,
        DEBUG               : undefined,
        csrftoken           : undefined,
        authtoken           : undefined
    },

    preferences = {
        playlist: [],
        selected: {
            selectedIndex: undefined,
            position: 0
        }
    },

    jqueryMap = {}, setJqueryMap,
    dom = {}, setDomMap,

    actions,
    render_clips, getClip,
    handleUrlFetch, handleClick,
    handlePlayerStateChange, handlePlaylistChange, handlePlayerPause;

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
     * setPreferences initialize the preferences objects in stateMap for the
     * initialization of the sm2 player
     * @param
     */
    setPreferences = function(){
//        console.log("setPreferences called");
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
         * Action Add any clips database that are enqueued. These could be search results
         * that were not added to the database on init
         * @param target ElementNode for the clip to enqueue
         */
        enqueue : function(target) {

            var clip;

            if(!target.dataset.id)
            {
                return;
            }

            getClip(target.dataset.id, stateMap.latest_clips_db, function(clip){
                stateMap.selected = target;
                bar.playerEnqueue([clip], 0);
            });
        }
    };

    /**
     * initializes the shell UI
     * @param relationship to return clips
     * @param username the name of the user to load
     */
    initUI = function(status, username, container ){
        //load data into in-browser database
        var clipsUrl = ['/api/clips', status, username, ""].join('/');
        util.PubSub.on("fetchUrlComplete", function(tag, result){
            if(tag === 'api_clips_status_person')
            {
                var formatted = util.parseClipData(result);
                stateMap.latest_clips_db.insert(formatted);
                render_clips(stateMap.latest_clips_db().order("id desc").get(), dom.clip_content_container );

                //initialize the sidebar module

                sidebar.initModule( dom.sidebar_container, stateMap.latest_clips_db );
                bar.initModule( dom.player_container );
            }
        });
        util.fetchUrl(clipsUrl, 'api_clips_status_person');
    };

    /**
     * populates the shell UI with HTML
     */
    initDom = function( container ){
        utils.dom.append(container, configMap.main_html);
        utils.dom.append(container, configMap.modal_html);
        utils.dom.append(container, configMap.modal_button_html);
        setDomMap();
        setJqueryMap();
        setPreferences();
    };

    /**
     * retrieveClip use the primary key to retrieve the Clip object
     * Action fetch the clip from the latest clips db or makes an ajax request
     * for it otherwise. Add to the db in the latter case?
     * @param id a Number representing the Clip primary key
     * @param db the TAFFY db to look in or cache the result
     * @param callback the callback function upon request
     */
    getClip = function(id, db, callback){

        var clip,
            database = db || stateMap.latest_clips_db;

        //Try to retrieve the clip from the TAFFY database
        clip = database({id: parseInt(id)}).first();

        if(clip && callback)
        {
            callback(clip);
        }
        else if(callback)
        {
            util.PubSub.on('fetchUrlComplete', function (tag, result) {
                if (tag === 'getClip_fetch') {
                    //NB: This data comes back as a single object
                    database.insert(result);
                    callback(result);
                }
            });

            util.fetchUrl('/api/clips/' + id + '/', 'getClip_fetch');
        }
        else
        {
            console.warn('getClip error -- No callback');
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
                    .toString() : "&nbsp;",
                rating = '<span class="glyphicon glyphicon-star-empty"></span><span class="glyphicon glyphicon-star-empty"></span>';

            clipString +=
                '<div class="col-xs-6 col-sm-4 col-md-4 col-lg-3 shellac-grid-element">' +
                    '<div class ="shellac-grid-element-panel">' +
                        '<span class="glyphicon enqueue-icon glyphicon-ok-circle"></span>' +
                        '<div class ="shellac-img-panel">' +
                            '<a href="#enqueue" data-url="' + object.audio_file_url + '" data-id="' + object.id + '" data-title="' + object.title + '" data-owner="' + object.owner + '">' +
                                '<img class="shellac-grid-img" src="' + object.brand_thumb_url  + '" alt="' + util.truncate(object.title, configMap.truncatemax) + '" />' +
                            '</a>' +
                        '</div>' +
                        '<div class ="shellac-caption-panel">' +
                            '<a href="#modal" data-url="' + object.permalink + '">' +
                                '<div class ="shellac-description-container">' +
                                    '<div class="shellac-description-content title">' + util.truncate(object.title, configMap.truncatemax) + '</div>' +
                                    '<div class="shellac-description-content owner">' + object.owner + '</div>' +
                                    '<div class="shellac-description-content description-short">' + util.truncate(object.description , configMap.truncatemax) + '</div>' +
                                        '<div class="meta-data">' +
                                        '<div class="shellac-description-content plays">' + object.plays + ' plays</div>' +
//                                        '<div class="shellac-description-content meta rating">' + rating + '</div>' +
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

    /**
     * handlePlayerStateChange Handler for change in player state
     * @param state string identifier indicating the type of state change
     * @param sm2Object the relevant soundManager sound object
     */
    handlePlayerStateChange = function(state, sm2Object){
        switch (state) {
            case 'onplay':

                var id_components, id,
                    clip, plays,
                    payload = {
                        plays: undefined
                    };

                //retrieve the id; bail if this doesn't exist
                id_components = sm2Object.id.split("_");
                if (id_components.length !== 2) {
                    console.warn('onplay error: No Clip id attribute');
                    return;
                }

                id = parseInt(id_components[1]);
                getClip(id, stateMap.latest_clips_db, function(clip){
                    var plays;

                    plays = clip.plays;
                    payload.plays = plays + 1;

                    util.PubSub.on("updateUrlComplete", utils.noop);
                    util.updateUrl('/api/clips/' + id + '/', 'onplay_plays_increment',
                        'PATCH', JSON.stringify(payload),
                        stateMap.csrftoken);
                });
                break;
            default:
        }
    };

    handlePlayerPause = function(positionsMap){
        console.log('handlePlayerPause');
        console.log(positionsMap);
        //ToDo
        //PATCH or POST to API as Person attribute.
    };


    /**
     * registerPubSub Registration function for the various PubSub events
     * @param container the DOM HTMLElement app container
     */
    registerPubSub = function( container ) {
        //register events
        util.PubSub.on('playlist-change', handlePlaylistChange);
        util.PubSub.on('player-change', handlePlayerStateChange);
        util.PubSub.on('shellac-app-clip-change', function(clips){
            render_clips(clips, utils.dom.get(container, '.shellac-app-container .shellac-app-clip-container'));
        });
        util.PubSub.on('player-pause', handlePlayerPause);
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
    initModule = function( container, user, target_username, status, DEBUG){

        // load HTML and map jQuery collections
        stateMap.csrftoken = util.getCookie('csrftoken');
        stateMap.container = container;
        stateMap.target_username = target_username;
        stateMap.user = user;
        stateMap.status = status;
        stateMap.DEBUG = DEBUG;

        if(stateMap.csrftoken) {
            initDom( container );
            registerPubSub( container );
            initUI(stateMap.status, target_username, container);
        }
        else
        {
            console.warn('initModule failed - credentials missing');
        }
    };

    return { initModule: initModule };
}());

module.exports = shell;

