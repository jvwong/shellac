/*
 * shell.js
 * Root namespace module
*/
/* global $, window, document, AudioContext, XMLHttpRequest, target_username, DEBUG */
'use strict';

var shell = (function () {

    //---------------- BEGIN MODULE DEPENDENCIES --------------
    var TAFFY   = require('taffydb').taffy,
        util    = require('../util.js'),
        sidebar = require('./sidebar.js'),
        bar     = require('../players/bar-ui.js'),
        async   = require('async');

    //---------------- END MODULE DEPENDENCIES --------------

    //---------------- BEGIN MODULE SCOPE VARIABLES --------------
    var

    utils = util.utils,
    PubSub = util.PubSub,

    initModule,
    initDom, initLatest, initPlaylist, initUIModules,
    registerPubSub,

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

        truncatemax: 30,

        playlist_endpoint: String() + '/api/playlists/',

        clip_endpoint: String() + '/api/clips/',

        track_endpoint: String() + '/api/tracks/'
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

    preferencesMap = {
        playlist_id         : undefined,
        playlist            : undefined,
        positionsMap        : {},
        clips               : undefined
    },

    jqueryMap = {}, setJqueryMap,
    dom = {}, setDomMap,

    actions,
    render_clips, getClip,
    handleUrlFetch, handleClick,
    handlePlayerStateChange, handlePlaylistChange,
    handlePlayerSave;

    //---------------- END MODULE SCOPE VARIABLES --------------

    //--------------------- BEGIN MODULE SCOPE METHODS --------------------



    /**
     * setJqueryMap record the jQuery elements of the page
     * Required to support the bootstrap modal activities
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
                util.fetchUrl(url, function(results){
                    jqueryMap.$modal_body.html($(results).find('.permalink'));
                    jqueryMap.$modal_container.modal('show');
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
     * initLatest fetches the latest clips which defaults to recent, following
     * @param done async callback
     */
    initLatest = function( status, username, done ){
        var clipsUrl = ['/api/clips', status, username, ""].join('/');
        util.fetchUrl(clipsUrl, function( results ){
            var formatted = util.parseClipData( results );
            stateMap.latest_clips_db.insert( formatted );
            render_clips( stateMap.latest_clips_db().order("id desc").get() );
            done(null);
        });
    };


    /**
     * initPlaylist fetches the (default) playlist for this user and inflates
     * @param done async callback
     */
    initPlaylist = function( user, done ){

        var pMap, tracks;

        //Do 3 things.
        async.waterfall([
            function(callback){
                // 1. Fetch the default playlist
                util.fetchUrl('/api/playlists/' + preferencesMap.playlist_id + '/', function( results ){
                    if(results.id.toString() === preferencesMap.playlist_id.toString())
                    {
                        preferencesMap.playlist = results;

                        if( results.hasOwnProperty('tracks') )
                        {
                            tracks = results.tracks;
                            callback(null, tracks);
                        }
                        else
                        {
                            callback("error initPlaylist: Failed to load Track list");
                        }
                    }
                    else
                    {
                        callback("error initPlaylist");
                    }
                });
            },
            function(tracks, callback)
            {
                var clipURLs = [];

                // 2. Now fetch the Tracks and populate the positionsMap with the
                // *** CLIP *** pk and NOT the Track pk
                // Precondition tracks are fetched
                async.each(tracks, function(track, finish) {
                    var track_pk;

                    track_pk = util.getURLpk( track );
                    if(!track_pk){ finish("error initPlaylist: Invalid Track pk"); }

                    util.fetchUrl('/api/tracks/' + track_pk + '/', function( results ){
                        var clip_pk;
                        if( results.hasOwnProperty('id') &&
                            results.hasOwnProperty('position') &&
                            results.hasOwnProperty('clip'))
                        {
                            clip_pk = util.getURLpk( results.clip );
                            if(!clip_pk){ finish("error initPlaylist: Invalid Track.clip pk"); }

                            preferencesMap.positionsMap[clip_pk] = results.position;
                            clipURLs.push( results.clip );
                            return finish(null);
                        }
                        finish("error initPlaylist: Track missing property");
                    });
                }, function(err) {
                    if(err)
                    {
                        callback(err);
                    }
                    else
                    {
                        callback(null, clipURLs);
                    }
                });
            },
            function(clipURLs, callback)
            {
                var clips = [];
                // 3. Now fetch the Clips and enqueue them with some position info
                async.each(clipURLs, function(clipURL, finish) {
                    var pk;

                    pk = util.getURLpk( clipURL );
                    if(!pk){ finish("error initPlaylist: Invalid Clip pk"); }

                    util.fetchUrl('/api/clips/' + pk + '/', function( results ){
                        clips.push(results);
                        finish(null);
                    });
                }, function(err) {
                    if(err)
                    {
                        callback(err);
                    }
                    else
                    {
                        //store out the clips for the UI init
                        preferencesMap.clips = clips;
                        callback(null);
                    }
                });
            }
        ],
        function(err){
            if(err) {
                done(err);
            }
            else
            {
                done(null);
            }
        });
    };

    /**
     * initUIModules installs other modules
     * @param done async callback
     */
    initUIModules = function( done ){
        var sidebar_toggle;

        //initialize the sidebar module
        sidebar.initModule( dom.sidebar_container, stateMap.latest_clips_db );
        sidebar_toggle = utils.dom.get('.sidebar-toggle');
        utils.events.add(sidebar_toggle, 'click', function(e){ utils.css.toggle(dom.sidebar_container, 'nav-expanded'); });

        //initialize the bar-ui module
        bar.initModule( dom.player_container, preferencesMap.clips, preferencesMap.positionsMap );

        done(null);
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
            util.fetchUrl('/api/clips/' + id + '/', function( results ){
                database.insert(results);
                callback(results);
            });
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
     * Actions This should check for the presence of an 'enqueue' class on each
     * 'span.enqueue-icon' element every time clips are inserted
     * @param clipList the list of clip objects
     */
    render_clips = function( clipList ){

        var container = dom.clip_content_container,
            clipString = String();

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
                enqueued = Object.keys(preferencesMap.positionsMap).indexOf(object.id.toString()) === -1 ? '' : 'enqueued',
                rating = '<span class="glyphicon glyphicon-star-empty"></span><span class="glyphicon glyphicon-star-empty"></span>';

            clipString +=
                '<div class="col-xs-6 col-sm-4 shellac-grid-element">' +
                    '<div class ="shellac-grid-element-panel">' +

                        '<span class="glyphicon enqueue-icon glyphicon-ok-circle ' + enqueued + '"></span>' +

                        '<div class ="shellac-img-panel">' +
                            '<a href="#enqueue" data-url="' + object.audio_file_url + '" data-id="' + object.id + '" data-title="' + object.title + '" data-owner="' + object.owner + '">' +
                                '<img class="img-thumbnail shellac-grid-img " src="' + object.brand_thumb_url  + '" alt="' + util.truncate(object.title, configMap.truncatemax) + '" />' +
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
                                        '<div class="shellac-description-content created">' + created + '</div>' +
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
     * @param the updated map of clip id's in the playlist
     */
    handlePlaylistChange = function( item, isAdded, pMap ){
        var anchor, pathname,
            parent, enqueue,
            i, j;

        //update the positionMap
        preferencesMap.positionsMap = JSON.parse(JSON.stringify(pMap));

        //update the particular Clip in the UI
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

                    util.updateUrl('/api/clips/' + id + '/', utils.noop,
                        'PATCH', JSON.stringify(payload), stateMap.csrftoken);
                });
                break;
            default:
        }
    };


    /**
     * handlePlayerSave Handler for the sm2 player 'save' action
     * Action Clears out Track objects from the default playlist; Post
     * Track objects to default playlist that exist in pMap
     * @param pMap the positions map PlaylistController (exportPositionsMap())
     * consisting of pattern {Clip_pk: position_pk, ..., clip_pk: position_pk} for
     * each Clip in playlist
     */
    handlePlayerSave = function( pMap ){

        var playlistPersonURL = preferencesMap.playlist.person;

        //update the positionMap
        preferencesMap.positionsMap = JSON.parse(JSON.stringify(pMap));

        async.waterfall([
            function(callback){
                // 1. Haaack - clear out the playlist
                util.alert(dom.app_container, "success", "Saving playlist...", 2000);

                async.series([
                    function(done)
                    {
                        var playlistURL = configMap.playlist_endpoint + preferencesMap.playlist_id + '/';

                        //Delete default playlist for existing preferencesMap.playlist_id
                        util.updateUrl(playlistURL, function( results ){
                            done(null);
                        }, 'DELETE', JSON.stringify('{}'), stateMap.csrftoken);
                    },

                    function(done)
                    {
                        //Create a new playlist
                        var payload =
                        {
                            "title": "default",
                            "description": "default",
                            "person": playlistPersonURL
                        };

                        util.updateUrl(configMap.playlist_endpoint, function( results ){

                            //reinstall the new playlist
                            preferencesMap.playlist = results;
                            preferencesMap.playlist_id = results.id;

                            console.log("new playlist");
                            console.log(results);

                            done(null);
                        }, 'POST', JSON.stringify( payload ), stateMap.csrftoken);
                    }
                ],
                // optional callback
                function(err)
                {
                    if(err)
                    {
                        callback(err);
                    }
                    else
                    {
                        callback(null);
                    }
                });

            },
            function(callback){
                // 2. Create the Track map
                // Verify that each item is a valid clip:
                // for each key fetch /api/clips/<key>/ and
                // store a map of clip urls and positions in trackMap

                var keys,
                    trackMap = {};

                keys = Object.keys(preferencesMap.positionsMap);
                async.each(keys, function(key, done) {
                    util.fetchUrl(configMap.clip_endpoint + key + '/', function( results ){
                        //store {Clip_url_1: position_1, ..., Clip_url_n: position_n}
                        trackMap[results.url] = preferencesMap.positionsMap[key];
                        done(null);
                    });
                }, function(err) {

                    console.log(trackMap);
                    callback(null, trackMap);
                });
            },
            function(trackMap, callback){
                //3. Post a new Track for each clip in the positions map (pMap)
                var clipURLs = Object.keys(trackMap);

                async.each(clipURLs, function(clipURL, done) {

                    var payload = {
                        "clip": clipURL,
                        "position": trackMap[clipURL],
                        "playlist": '/api/playlists/' + preferencesMap.playlist_id + '/'
                    };

                    util.updateUrl('/api/tracks/', function( results ){
                        done(null);
                    }, 'POST', JSON.stringify(payload), stateMap.csrftoken);

                }, function(err) {
                    callback(null);
                });
            }
        ],
        // optional callback
        function(err){
            if(err)
            {
                console.warn(err);
                util.alert(dom.app_container, "success", "Error: Not saved", 2000);
            }
            else
            {
                util.alert(dom.app_container, "success", "Playlist saved", 2000);
            }

        });
    };


    /**
     * registerPubSub Registration function for the various PubSub events
     * @param container the DOM HTMLElement app container
     */
    registerPubSub = function() {
        //register events
        util.PubSub.on('playlist-change', handlePlaylistChange);
        util.PubSub.on('player-change', handlePlayerStateChange);
        util.PubSub.on('shellac-app-clip-change', render_clips);
        util.PubSub.on('player-save', handlePlayerSave);
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
    initModule = function( container, user, target_username, status, playlist_id, DEBUG)
    {

        // load HTML and map jQuery collections
        stateMap.csrftoken = util.getCookie('csrftoken');
        stateMap.container = container;
        stateMap.target_username = target_username;
        stateMap.user = user;
        stateMap.status = status;
        stateMap.DEBUG = DEBUG;

        preferencesMap.playlist_id = playlist_id;

        if(stateMap.csrftoken)
        {
            initDom( container );
            registerPubSub();
            async.series([
                function(done)
                {
                    //Initialize default playlist
                    initPlaylist(user, done);
                },

                function(done)
                {
                    //Initialize latest clips (status)
                    //console.log(stateMap.playlist);
                    initLatest( status, target_username, done);
                },

                function(done)
                {
                    //Initialize other UI modules
                    //console.log(stateMap.latest_clips_db().get());
                    initUIModules(done);
                }
            ],
            // optional callback
            function(err)
            {
                if(err)
                { console.warn(err); }
            });
        }
        else
        { console.warn('initModule failed - credentials missing'); }
    };

    return { initModule: initModule };
}());

module.exports = shell;

