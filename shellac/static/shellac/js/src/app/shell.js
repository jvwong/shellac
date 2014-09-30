/*
 * shell.js
 * Root namespace module
*/
/* global $, window, AudioContext, XMLHttpRequest, target_username */
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

//                '<div class="shellac-app-statusbar">Playlist: <span class="shellac-app-statusbar-playing"></span></div>' +
//
//                '<div class="col-sm-3 col-md-2 shellac-app sidebar">' +
//                    '<div class="panel-group" id="accordion">' +
//                        '<div class="panel panel-default">' +
//                            '<div class="panel-heading">' +
//                                '<a data-toggle="collapse" data-parent="#accordion" href="#collapseCategories">' +
//                                    'Categories' +
//                                '</a>' +
//                            '</div>' +
//                            '<div id="collapseCategories" class="panel-collapse collapse">' +
//                                '<div class="panel-body">' +
//                                    '<div class="shellac-app nav nav-sidebar list-group"></div>' +
//                                '</div>' +
//                            '</div>' +
//                        '</div>' +
//                        '<div class="panel panel-default">' +
//                            '<div class="panel-heading">' +
//                                '<a data-toggle="collapse" data-parent="#accordion" href="#collapsePeople">' +
//                                    'People' +
//                                '</a>' +
//                            '</div>' +
//                            '<div id="collapsePeople" class="panel-collapse collapse">' +
//                                '<div class="panel-body">' +
//                                    '//Person List TODO' +
//                                '</div>' +
//                            '</div>' +
//                        '</div>' +
//                    '</div>' +
//                '</div>' +

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

        isPlaying: false
    },

    jqueryMap = {},
    setJqueryMap,

    urlParse,

    parseCategoryData, renderCategories, display_categories,
    parseClipData, loadClips, display_clips,

    onClickCategory, onTapStatusBar, onSwipeSideBar,

    PubSub = util.PubSub;

    //---------------- END MODULE SCOPE VARIABLES --------------

    //--------------------- BEGIN MODULE SCOPE METHODS --------------------

    setJqueryMap = function(){
        var $outerDiv = stateMap.$container;

        jqueryMap = {
            $outerDiv               : $outerDiv,
            $app_container          : $outerDiv.find('.shellac-app-container'),
            $statusbar              : $outerDiv.find('.shellac-app-statusbar'),
            $statusbar_playing      : $outerDiv.find('.shellac-app-statusbar .shellac-app-statusbar-playing'),
            $nav_sidebar            : $outerDiv.find('.shellac-app.sidebar'),
            $nav_sidebar_categories : $outerDiv.find('.shellac-app.sidebar #collapseCategories .shellac-app.nav.nav-sidebar.list-group'),
            $nav_sidebar_people     : $outerDiv.find('.shellac-app.sidebar #collapsePeople .shellac-app.nav.nav-sidebar.list-group'),
            $clip_content           : $outerDiv.find('.shellac-app.clip.content')
        };
    };


    /*
     * method renderCategories: make an api call to gather the Categories in database
     * parameters
     * return
     *   * jsonArray - a list of valid JSON objects representing
     *   serialized Category objects
     **/
    renderCategories = function(){

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


    /*
     * method loadClips: make an api call to gather the Clips in database
     * @param status type of Relationship
     * @param target_username username of the intended target Person
     * @return jsonArray list of valid JSON objects representing serialized Clip objects
     **/
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
     * parameters
     *   * raw - a string describing an array of valid JSON
     * return
     *   * jsonArray - a list of valid JSON objects
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
                return jsonObj;
            }catch(err){
                console.log(err);
            }
        });
        return jsonArray;
    };

    /*
     * method urlParse: extract the various aspects of the url from a HyperlinkedRelatedField
     * precondition: requires a HyperlinkedRelatedField of the form protocol:host/api/object/pk/
     * parameters
     *   * url - the url of the resource
     * return
     *   * URLobj - an object literal with fields protocol, host, api, object, and pk
     **/
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


    //--------------------- END MODULE SCOPE METHODS --------------------


    //--------------------- BEGIN DOM METHODS --------------------



    display_categories = function(){

        var all_anchor = String(),
            items = String(),
            clip_list = [];
        jqueryMap.$nav_sidebar_categories.append(all_anchor);

        stateMap.categories.forEach(function(object){
            items +=
                '<a class="list-group-item nav-sidebar-category" href="#">' + '<span class="badge">' + object.clips.length + '</span>' +
                    '<h5 class="list-group-item-heading" id="' + object.slug + '">' + object.title + '</h5>' +
                '</a>';

            var filtered = object.clips.filter(function(id){
                return clip_list.indexOf(id) === -1;
            });
            clip_list = clip_list.concat(filtered);
        });

        all_anchor +=
            '<a class="list-group-item nav-sidebar-category active" href="#">' + '<span class="badge">' + clip_list.length + '</span>' +
                '<h5 class="list-group-item-heading" id="all">ALL</h5>' +
            '</a>';

        jqueryMap.$nav_sidebar_categories.append(all_anchor, items);

        //register listeners
        $('.list-group-item-heading').on('click', onClickCategory);
    };


    display_clips = function(){

        jqueryMap.$clip_content.html("");
        stateMap.clips.forEach(function(object){

            var clip = String() +
                '<div class="col-xs-3 col-sm-3 col-md-3 col-lg-3 media clip">' +
                    '<div class="ui360">' +

                        //BEGIN $player
                        '<span class="media-url" data-clip-url="' + stateMap.MEDIA_URL + object.audio_file + '">' +
                            '<img class="media-img img-responsive" src="' + stateMap.MEDIA_URL + object.brand + '" alt="' + object.title + '" />' +
                            '<div class="media-description">' +
                                '<span class="media-description-content lead">' + util.truncate(object.title, configMap.truncate_max) + '</span><br/>' +
                                '<span class="media-description-content"><em>' + util.truncate(object.description, configMap.truncate_max) + '</em></span><br/>' +
                                '<span class="media-description-content"><small>' + object.owner + "  -- " + object.created._d.toDateString() + '</small></span><br/>' +
                            '</div>' +
                            '<div class="media-progress"></div>' +
                        '</span>'  +
                        //END $player

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
    // Begin Event handler /onClickCategory/
    // Purpose    : Handles the event for sidebar category selection
    // Arguments  :
    // Settings   : none
    // Returns    :
    // Actions    : Should signal to audio module to update progress bar state for each clip
    //   * binds to category DOM elements and reloads corresponding clips into
    //     stateMap.clips
    onClickCategory = function(event){

        var category_object;

        //empty the clip array
        stateMap.clips = [];

        //refill the empty the clip array
        if(event.target.id === "all"){
            stateMap.clips = stateMap.clip_db().get();

        } else {
            category_object = stateMap.category_db({slug: event.target.id}).first();

            //push in any matching clip id from the url
            stateMap.clips = category_object.clips.map(function(clip_url){
                var URL = urlParse(clip_url);
                return stateMap.clip_db({id: parseInt(URL.pk)}).first();
            });
        }
        display_clips();
        util.PubSub.emit("shellac-categorychange",
            stateMap.clips.map(function(clip){return clip.audio_file;})
        );
    };

    onTapStatusBar = function(evt){
//        console.log("tap deteceted");
//        console.log(evt);
        evt.preventDefault();
        jqueryMap.$app_container.toggleClass('nav-expanded');
    };

//    onSwipeSideBar = function(evt){
////        console.log("swipe deteceted");
////        console.log(evt);
//        evt.preventDefault();
//        jqueryMap.$app_container.toggleClass('nav-expanded');
//    };



    //-------------------- END EVENT HANDLERS --------------------

    //------------------- BEGIN PUBLIC METHODS -------------------
    // initModule //   Populates $container with the shell of the UI
    //   and then configures and initializes feature modules.
    //   The Shell is also responsible for browser-wide issues
    //   Directs this app to offer its capability to the user
    // @param $container A jQuery collection that should represent
    // a single DOM container
    // @param MEDIA_URL Django media url prefix (settings.MEDIA_URL)
    // @param STATIC_URL Django static url prefix (settings.STATIC_URL)
    // @param target_username account holder username for retrieving clips

    initModule = function( $container, STATIC_URL, MEDIA_URL, target_username){
        // load HTML and map jQuery collections
        stateMap.$container = $container;
        stateMap.target_username = target_username;
        stateMap.$nav_sidebar = $container.parent;
        stateMap.STATIC_URL = STATIC_URL;
        stateMap.MEDIA_URL = MEDIA_URL;

        $container.append( configMap.main_html );
        setJqueryMap();

        //register pub-sub methods
        PubSub.on("clipLoadComplete", display_clips);
        PubSub.on("categoryLoadComplete", display_categories);

        //load data into in-browser database
        loadClips("following", target_username);
        renderCategories();

        //Navigation Menu Slider
//        $( '.shellac-app-statusbar' )
//            .on( 'utap.utap',   onTapStatusBar   );
//        $( '.shellac-app.sidebar')
//            .on( 'udragstart.udrag', onSwipeSideBar );
//        jqueryMap.$statusbar_playing.html(target_username);
    };

    return { initModule: initModule };
}());

module.exports = shell;

