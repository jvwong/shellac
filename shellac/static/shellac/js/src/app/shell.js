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
        util = require('../util.js');

    //---------------- END MODULE DEPENDENCIES --------------

    //---------------- BEGIN MODULE SCOPE VARIABLES --------------
    var
    initModule,

    configMap = {
        main_html: String() +
            '<div class="shellac-app-container">' +

                '<div class="shellac-app-statusbar">Playlist: <span class="shellac-app-statusbar-playing"></span></div>' +

                '<div class="col-sm-3 col-md-2 shellac-app sidebar">' +
                    '<div class="panel-group noSwipe" id="accordion">' +

                        '<div class="panel panel-default">' +
                            '<div class="panel-heading">' +
                                '<a data-toggle="collapse" data-parent="#accordion" href="#collapseCategories">' +
                                    'Categories' +
                                '</a>' +
                            '</div>' +
                            '<div id="collapseCategories" class="panel-collapse collapse">' +
                                '<div class="panel-body">' +
                                    '<div class="shellac-app nav nav-sidebar list-group"></div>' +
                                '</div>' +
                            '</div>' +
                        '</div>' +

                        '<div class="panel panel-default">' +
                            '<div class="panel-heading">' +
                                '<a data-toggle="collapse" data-parent="#accordion" href="#collapsePeople">' +
                                    'People' +
                                '</a>' +
                            '</div>' +
                            '<div id="collapsePeople" class="panel-collapse collapse">' +
                                '<div class="panel-body">' +
                                    '//Person List TODO' +
                                '</div>' +
                            '</div>' +
                        '</div>' +

                    '</div>' +
                '</div>' +

                '<div class="shellac-app clip content"></div>' +
            '</div>',
        truncatemax: 25
    },

    stateMap = {
        $container: undefined,
        target_username: undefined,

        STATIC_URL: undefined,
        MEDIA_URL: undefined,

        categories: undefined,
        category_db: TAFFY(),

        clips: undefined,
        clip_db: TAFFY(),

        isPlaying: false,
        DEBUG: undefined
    },

    jqueryMap = {},
    setJqueryMap,

    urlParse,

    parseCategoryData, loadCategories, display_categories,
    parseClipData, loadClips, display_clips,

    onClickCategory, onTapClose, onSwipeClose,

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
            $outerDiv                       : $outerDiv,
            $app_container                  : $outerDiv.find('.shellac-app-container'),
            $statusbar                      : $outerDiv.find('.shellac-app-statusbar'),
            $statusbar_playing              : $outerDiv.find('.shellac-app-statusbar .shellac-app-statusbar-playing'),
            $nav_sidebar                    : $outerDiv.find('.shellac-app.sidebar'),
            $nav_sidebar_categories         : $outerDiv.find('.shellac-app.sidebar #collapseCategories .shellac-app.nav.nav-sidebar.list-group'),
            $nav_sidebar_people             : $outerDiv.find('.shellac-app.sidebar #collapsePeople .shellac-app.nav.nav-sidebar.list-group'),
            $clip_content                   : $outerDiv.find('.shellac-app.clip.content')
        };
    };


    /**
     * loadCategories make an api call to gather the Categories in database
     * @return jsonArray list of valid JSON objects representing serialized Category objects
     */
    loadCategories = function(){

        var url = '/api/categories/';
        $.ajax({
            url: url
        })
        .done(function(categories){
            stateMap.category_db.insert(parseCategoryData(categories.results));
            stateMap.categories = stateMap.category_db().get();
            PubSub.emit("categoryLoadComplete");
        })
        .fail(function(){
            console.error("Could not load Clip archive");
        })
        .always(function(){

        });
    };


    /**
     * loadClips make an api call to gather the Clips in database
     * @param status type of Relationship
     * @param target_username username of the intended target Person
     * @return jsonArray list of valid JSON objects representing serialized Clip objects
     */
    loadClips = function(status, target_username){

        var url = ['/api/clips', status, target_username, ""].join('/');

        $.ajax({
            url: url
        })
            .done(function(clips){
                stateMap.clip_db.insert(parseClipData(clips.results));
                stateMap.clips = stateMap.clip_db().order("id desc").get();
                PubSub.emit("clipLoadComplete");
            })
            .fail(function(){
                console.error("Could not load Clip archive");
            })
            .always(function(){

            });
    };

    /**
     * method parseCategoryData: transform any Category fields to javascript-compatible
     * @param a string describing an array of valid JSON
     * @return jsonArray a list of valid JSON objects
     */
    parseCategoryData = function(raw){
        var jsonArray;

        jsonArray = raw.map(function(jsonObj){

            try{
                return jsonObj;
            }catch(err){
                console.error(err);
            }
        });
        return jsonArray;
    };

    /**
    * parseClipData: transform any Clip fields to javascript-compatible
    * @param raw a string describing an array of valid JSON
    * @return jsonArray - a list of valid JSON objects
    */
    parseClipData = function(raw){
        var jsonArray;
        jsonArray = raw.map(function(jsonObj){

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
     * display_categories append the html for the category sidebar accordion section
     */
    display_categories = function(){

        var all_anchor = String(),
            items = String();
        jqueryMap.$nav_sidebar_categories.append(all_anchor);
        stateMap.categories.forEach(function(category){
            var clip_array = stateMap.clip_db({categories: {has: category.url}});
            items +=
                '<a class="list-group-item nav-sidebar-category" href="#">' + '<span class="badge">' + clip_array.count() + '</span>' +
                    '<h5 class="list-group-item-heading" id="' + category.slug + '">' + category.title + '</h5>' +
                '</a>';
        });
        all_anchor +=
            '<a class="list-group-item nav-sidebar-category active" href="#">' +
                '<span class="badge">' + stateMap.clip_db().count() + '</span>' +
                '<h5 class="list-group-item-heading" id="all">ALL</h5>' +
            '</a>';
        jqueryMap.$nav_sidebar_categories.append(all_anchor, items);

        //register listeners on <h5> element
        $('.list-group-item.nav-sidebar-category').on('click', onClickCategory);
    };


    /**
     * display_clips append the html for the clips to the main body of the page
     */
    display_clips = function(){
        jqueryMap.$clip_content.html("");

        if(stateMap.clips.length === 0)
        {
            var message = String() +
                '<div class="col-xs-12 clip no-content">' +
                    '<h3>Nothing to hear here...</h3>' +
                '</div>';
            jqueryMap.$clip_content.html(message);
            return;
        }
        stateMap.clips.forEach(function(object){

            var clip = String() +
                '<div class="col-xs-4 col-sm-3 col-md-3 col-lg-3 media clip">' +
                    '<div class="media-panel">' +
                        '<div class="ui360">' +
                            '<span class="media-url" data-clip-url="' + object.audio_file_url + '">' +
                                '<img class="media-img" src="' + object.brand_thumb_url  + '" alt="' + object.title + '" />' +
                                '<div class="media-description">' +
                                    '<span class="media-description-content lead">' + util.truncate(object.title, configMap.truncate_max) + '</span><br/>' +
                                    '<span class="media-description-content"><em>' + util.truncate(object.description, configMap.truncate_max) + '</em></span><br/>' +
                                    '<span class="media-description-content"><small>' + object.owner + " " + object.created.startOf('minute').fromNow() + '</small></span><br/>' +
                                '</div>' +
                                '<div class="media-progress"></div>' +
                            '</span>'  +
                        '</div>' +
                    '</div>' +
                '</div>';

            jqueryMap.$clip_content.append(clip);
        });
        $('.media.clip .media-url').on('click', function(e){
            var url = $(this).attr('data-clip-url'),
                $progress = $(this).find('.media-progress'),
                $description = $(this).find('.media-description');

            audio.onClickPlayer(url, $progress, $description);
        });
    };

    //--------------------- END DOM METHODS ----------------------

    //------------------- BEGIN EVENT HANDLERS -------------------
    /**
     * onClickCategory callback for changes in the category UI.
     * Extracts the audio file url for each clip for the category
     * and emits a shellac-categorychange event
     * @param event jQuery event object for the clicked elements
     */
    onClickCategory = function(event){

        var category, $a, id;

        //remove the active class from all <a>
        jqueryMap.$nav_sidebar_categories.find('.list-group-item.nav-sidebar-category').removeClass( "active");

        //add the active class to current -- check if we clicked inner h5 and span elements within a
        $a = $(event.target).closest('a');
        $a.addClass("active");
        id = $a.find('.list-group-item-heading').attr('id');

        //empty the clip array
        stateMap.clips = [];

        //refill the empty the clip array
        if(id === "all"){
            stateMap.clips = stateMap.clip_db().get();

        } else {
            category = stateMap.category_db({slug: id}).first();
            stateMap.clips = stateMap.clip_db({categories: {has: category.url}}).get();
        }
        display_clips();
        util.PubSub.emit("shellac-categorychange",
            stateMap.clips.map(function(clip){return clip.audio_file_url;})
        );
    };

    onTapClose = function(event, direction, distance, duration, fingerCount){
        event.preventDefault();
        jqueryMap.$app_container.toggleClass('nav-expanded');
    };

    onSwipeClose = function(event, direction, distance, duration, fingerCount){
        event.preventDefault();
        jqueryMap.$app_container.toggleClass('nav-expanded');
    };
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
        stateMap.$nav_sidebar = $container.parent;
        stateMap.STATIC_URL = STATIC_URL;
        stateMap.MEDIA_URL = MEDIA_URL;
        stateMap.DEBUG = DEBUG;

        $container.append( configMap.main_html );
        setJqueryMap();

        //register pub-sub methods
        PubSub.on("clipLoadComplete", display_clips);
        PubSub.on("clipLoadComplete", loadCategories);
        PubSub.on("categoryLoadComplete", display_categories);

        //load data into in-browser database
        loadClips("following", target_username);

        //Navigation Menu Slider
        $( '.shellac-app-statusbar' ).swipe({
            tap: onTapClose
        });
        jqueryMap.$statusbar_playing.html(target_username);

        $( '.shellac-app.sidebar' ).swipe({
            tap: onTapClose,
            swipeLeft: onSwipeClose,
            threshold: 75
        });
    };

    return { initModule: initModule };
}());

module.exports = shell;

