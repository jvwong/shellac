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
        bar     = require('../players/bar.js'),
        bar_api;

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

        truncatemax: 28
    },

    stateMap = {
        $container          : undefined,
        target_username     : undefined,
        status              : undefined,

        clips               : undefined,
        clip_db             : TAFFY(),

        DEBUG               : undefined
    },

    jqueryMap = {},
    setJqueryMap,

    urlParse,
    loadClips, display_clips,
    onTapSidebar, onSwipeSidebar,
    swipeData,
    PubSub = util.PubSub;

    //---------------- END MODULE SCOPE VARIABLES --------------

    //--------------------- BEGIN MODULE SCOPE METHODS --------------------

    /**
     * setJqueryMap record the jQuery elements of the page
     */
    setJqueryMap = function(){
        var $outerDiv = stateMap.$container;
        jqueryMap = {
            $outerDiv                   : $outerDiv,
            $app_container              : $outerDiv.find('.shellac-app-container'),
            $player_container           : $outerDiv.find('.shellac-app-container .shellac-app-player-container'),
            $sidebar_container          : $outerDiv.find('.shellac-app-container .shellac-app-sidebar-container'),
            $clip_content_container     : $outerDiv.find('.shellac-app-container .shellac-app-clip-container'),
            $modal_container            : $outerDiv.find('#get_absolute_urlModal'),
            $modal_header               : $outerDiv.find('#get_absolute_urlModal .modal-dialog .modal-content .modal-header'),
            $modal_body                 : $outerDiv.find('#get_absolute_urlModal .modal-dialog .modal-content .modal-body'),
            $modal_footer               : $outerDiv.find('#get_absolute_urlModal .modal-dialog .modal-content .modal-footer'),
        };
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

        parts = u.split('/');

        try{
            URL.protocol = parts[0];
            URL.host = parts[2].split(':')[0];
            URL.object = parts[4];
            URL.pk = parts[5];

        } catch (e) {
            throw "Improper url format entered";
        }
        return URL;
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

    //--------------------- END MODULE SCOPE METHODS --------------------


    //--------------------- BEGIN DOM METHODS --------------------
    /**
     * display_clips append the html for the clips to the main body of the page
     * @param clipList the list of clip objects
     * @param $container jquery object that will contain the clips html
     */
    display_clips = function(clipList, $container){
        $container.html("");

        if(stateMap.clips.length === 0)
        {
            var message = String() +
                '<div class="col-xs-12 clip no-content">' +
                    '<h3>Nothing to hear here...</h3>' +
                '</div>';
            $container.html(message);
            return;
        }
        clipList.forEach(function(object){

            var cats = object.categories.length > 0 ? object.categories
                .map(function(c){
                    return c.split('/')[5].toUpperCase();
                })
                .slice(0,3)
                .join(" | ")
                .toString() : "&nbsp;";

            var clip = String()  +
                '<div class="col-xs-6 col-sm-4 col-md-3 col-lg-3 media clip">' +

                    '<div class="media-panel">' +
                        '<span class="media-url" data-clip-url="' + object.audio_file_url + '">' +
                            '<span class="shellac-media-check glyphicon glyphicon-ok"></span>' +
                            '<img class="media-img" src="' + object.brand_thumb_url  + '" alt="' + object.title + '" />' +
                            '<dl class="media-description dl-horizontal" data-permalink="' + object.permalink + '">' +
                                '<span class="media-description-content posted" data-content="' + object.created.startOf('minute').fromNow(true) + '">' + object.created.startOf('minute').fromNow(true) + '</span>' +
                                '<dd class="media-description-content title" data-content="' + object.title + '">' + util.truncate(object.title, configMap.truncatemax) + '</dd>' +
                                '<dd class="media-description-content description" data-content="' + object.description + '">' + util.truncate(object.description, configMap.truncatemax) + '</dd>' +
                                '<dd class="media-description-content owner" data-content="' + object.owner + '">' + util.truncate(object.owner, configMap.truncatemax) + '</dd>' +
                                '<dd class="media-description-content categories" data-content="' + cats + '">' + util.truncate(cats, configMap.truncatemax) + '</dd>' +
                            '</dl>' +

                        '</span>'  +
                    '</div>' +
                '</div>';

            $container.append(clip);
        });

        //Listener should notify bar that it wishes to add a clip to its 'queue'
        $('.media.clip .media-img').on('click', function(event){
            //toggle as 'queued' somewhere
            console.log($(this));
            $(this).siblings().toggleClass('queued');
            bar_api.handleClipSelect(event);
        });

        $('.media.clip .media-description').on('click', function(e){
            var permalink = $(this).attr('data-permalink');
            util.fetchUrl(permalink, 'get_absolute_url');
        });
    };

    onTapSidebar = function(event, direction, distance, duration, fingerCount){
        event.preventDefault();
        jqueryMap.$app_container.toggleClass('nav-expanded');
    };

    onSwipeSidebar = function(event, direction, distance, duration, fingerCount){
        event.preventDefault();
        jqueryMap.$app_container.toggleClass('nav-expanded');
    };

    //--------------------- END DOM METHODS ----------------------

    //------------------- BEGIN EVENT HANDLERS -------------------
    //-------------------- END EVENT HANDLERS --------------------

    //------------------- BEGIN PUBLIC METHODS -------------------
    /**
     * initModule Populates $container with the shell of the UI
     * and then configures and initializes feature modules.
     * The Shell is also responsible for browser-wide issues
     * Directs this app to offer its capability to the user
     * @param $container A jQuery collection that should represent a single DOM container
     * @param target_username account holder username for retrieving clips
     * @param DEBUG for debug purposes (root url)
     */
    initModule = function( $container, target_username, status, DEBUG){
        // load HTML and map jQuery collections
        stateMap.$container = $container;
        stateMap.target_username = target_username;
        stateMap.status = status;
        stateMap.DEBUG = DEBUG;

        $container.append( configMap.main_html );
        $container.append( configMap.modal_html );
        $container.append( configMap.modal_button_html );
        setJqueryMap();

        //register pub-sub methods
        util.PubSub.on("fetchUrlComplete", function(tag, result){
            switch (tag)
            {
                case 'api_clips_status_person':
                    var formatted = util.parseClipData(result);
                    stateMap.clip_db.insert(formatted);
                    stateMap.clips = stateMap.clip_db().order("id desc").get();
                    display_clips(stateMap.clips, jqueryMap.$clip_content_container);

                    //initialize the sidebar module
                    sidebar.initModule( jqueryMap.$sidebar_container, stateMap.clip_db );
                    break;
                case 'get_absolute_url':
                    jqueryMap.$modal_body.html($(result).find('.permalink'));
                    jqueryMap.$modal_container.modal('show');
                    break;
                default:
            }
        });

        //register pub-sub methods
        util.PubSub.on("shellac-app-clip-change", function(clips){
            display_clips(clips, jqueryMap.$clip_content_container);
        });

        //load data into in-browser database
        var clipsUrl = ['/api/clips', stateMap.status, target_username, ""].join('/');
        util.fetchUrl(clipsUrl, 'api_clips_status_person');

        //Navigation Menu Slider
        jqueryMap.$sidebar_container.swipe({
            tap: onTapSidebar,
            swipeLeft: onSwipeSidebar,
            threshold: 75
        });

        bar_api = bar.initModule( jqueryMap.$player_container );
        //jqueryMap.$app_container.toggleClass('nav-expanded');
    };

    return { initModule: initModule };
}());

module.exports = shell;

