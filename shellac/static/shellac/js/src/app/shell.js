/*
 * shell.js
 * Root namespace module
*/
/* global $, window, AudioContext, XMLHttpRequest, target_username, DEBUG */
'use strict';

var shell = (function () {

    //---------------- BEGIN MODULE DEPENDENCIES --------------
    var moment = require('moment'),
        TAFFY = require('taffydb').taffy,
        audio = require('./audio.js'),
        util = require('../util.js'),
        sidebar = require('./sidebar.js');

    //---------------- END MODULE DEPENDENCIES --------------

    //---------------- BEGIN MODULE SCOPE VARIABLES --------------
    var
    initModule,

    configMap = {
        main_html: String() +
            '<div class="shellac-app-container">' +
                '<div class="shellac-app-statusbar">Playlist: <span class="shellac-app-statusbar-playing"></span></div>' +
                '<div class="shellac-app-sidebar-container col-sm-3 col-md-2"></div>' +
                '<div class="shellac-app-clip-container content"></div>' +
            '</div>',
        truncatemax: 25
    },

    stateMap = {
        $container: undefined,
        target_username: undefined,

        STATIC_URL: undefined,
        MEDIA_URL: undefined,

        clips: undefined,
        clip_db: TAFFY(),

        isPlaying: false,
        DEBUG: undefined
    },

    jqueryMap = {},
    setJqueryMap,

    urlParse,
    parseClipData, loadClips, display_clips,
    onTapClose, onSwipeClose,
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
            $statusbar                  : $outerDiv.find('.shellac-app-container .shellac-app-statusbar'),
            $statusbar_playing          : $outerDiv.find('.shellac-app-container .shellac-app-statusbar .shellac-app-statusbar-playing'),
            $sidebar_container          : $outerDiv.find('.shellac-app-container .shellac-app-sidebar-container'),
            $clip_content_container               : $outerDiv.find('.shellac-app-container .shellac-app-clip-container')
        };
    };

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

            var clip = String() +
                '<div class="col-xs-6 col-sm-3 col-md-3 col-lg-3 media clip">' +
                    '<div class="media-panel">' +
                        '<div class="ui360">' +
                            '<span class="media-url" data-clip-url="' + object.audio_file_url + '">' +
                                '<img class="media-img" src="' + object.brand_thumb_url  + '" alt="' + object.title + '" />' +

                                '<dl class="media-description dl-horizontal">' +
                                    '<span class="media-description-content posted">' + object.created.startOf('minute').fromNow(true) + '</span>' +
                                    '<a href="' + object.permalink + '"></a><span class="media-description-content permalink glyphicon glyphicon-share"></span>' +
                                    '<dd class="media-description-content title">' + util.truncate(object.title, configMap.truncatemax) + '</dd>' +
                                    '<dd class="media-description-content description">' + util.truncate(object.description, configMap.truncatemax + 30) + '</dd>' +
                                    '<dd class="media-description-content owner">' + util.truncate(object.owner, configMap.truncatemax) + '</dd>' +
                                    '<dd class="media-description-content categories">' + util.truncate(cats, configMap.truncatemax) + '</dd>' +
                                '</dl>' +
                                '<div class="media-progress"></div>' +
                            '</span>'  +
                        '</div>' +
                    '</div>' +
                '</div>';

            $container.append(clip);
        });
        $('.media.clip .media-url').on('click', function(e){
            var url = $(this).attr('data-clip-url'),
                $progress = $(this).find('.media-progress'),
                $description = $(this).find('.media-description');

            audio.onClickPlayer(url, $progress, $description);
        });
    };

    onTapClose = function(event, direction, distance, duration, fingerCount){
        event.preventDefault();
        jqueryMap.$app_container.toggleClass('nav-expanded');
    };

    onSwipeClose = function(event, direction, distance, duration, fingerCount){
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
     * @param MEDIA_URL Django media url prefix (settings.MEDIA_URL)
     * @param STATIC_URL Django static url prefix (settings.STATIC_URL)
     * @param target_username account holder username for retrieving clips
     */
    initModule = function( $container, STATIC_URL, MEDIA_URL, target_username, DEBUG){
        // load HTML and map jQuery collections
        stateMap.$container = $container;
        stateMap.target_username = target_username;
        stateMap.STATIC_URL = STATIC_URL;
        stateMap.MEDIA_URL = MEDIA_URL;
        stateMap.DEBUG = DEBUG;

        $container.append( configMap.main_html );
        setJqueryMap();

        //register pub-sub methods
        util.PubSub.on("fetchUrlComplete", function(tag, result){
            switch (tag)
            {
                case 'api_clips_status_person':
                    var formatted = parseClipData(result);
                    //console.log(formatted);
                    stateMap.clip_db.insert(formatted);
                    stateMap.clips = stateMap.clip_db().order("id desc").get();
                    display_clips(stateMap.clips, jqueryMap.$clip_content_container);

                    //initialize the sidebar module
                    sidebar.initModule( jqueryMap.$sidebar_container, stateMap.clip_db );
                    break;
                default:
            }
        });

        //register pub-sub methods
        util.PubSub.on("shellac-app-sidebar-categorychange", function(clips){
            display_clips(clips, jqueryMap.$clip_content_container);
        });

        //load data into in-browser database
        var clipsUrl = ['/api/clips', "following", target_username, ""].join('/');
        util.fetchUrl(clipsUrl, 'api_clips_status_person');

        //Navigation Menu Slider
        $( '.shellac-app-statusbar' ).swipe({
            tap: onTapClose
        });
        jqueryMap.$statusbar_playing.html(target_username);

        //Navigation Menu Slider
        jqueryMap.$sidebar_container.swipe({
            tap: onTapClose,
            swipeLeft: onSwipeClose,
            threshold: 75
        });

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
    };

    return { initModule: initModule };
}());

module.exports = shell;

