/*
 * shellac.js
 * Root namespace module
*/
/* global $, window, AudioContext, XMLHttpRequest */
'use strict';

var shellac = (function () {

    //---------------- BEGIN MODULE DEPENDENCIES --------------
    var $ = require('jquery'),
        moment = require('moment'),
        TAFFY = require('taffydb').taffy,
        audio = require('./audio.js'),
        util = require('./util.js');

    //---------------- END MODULE DEPENDENCIES --------------

    //---------------- BEGIN MODULE SCOPE VARIABLES --------------
    var
    initModule,

    configMap = {
        main_html: String() +
            '<div class="col-sm-3 col-md-2 shellac-app sidebar">' +
                '<div class="shellac-app nav nav-sidebar list-group"></div>' +
            '</div>' +
            '<div class="col-sm-9 col-sm-offset-3 col-md-10 col-md-offset-2 shellac-app clip content"></div>',

        truncate_max: 25
    },

    stateMap = {
        $container: undefined,

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

    parseCategoryData, renderCategories, display_categories,
    parseClipData, renderClips, display_clips,

    onClickCategory,
    PubSub = util.PubSub;

    //---------------- END MODULE SCOPE VARIABLES --------------

    /*
     * method :
     * parameters
     * return
     *   *
     **/

    //--------------------- BEGIN MODULE SCOPE METHODS --------------------





    /*
     * method renderCategories: make an api call to gather the Categories in database
     * parameters
     * return
     *   * jsonArray - a list of valid JSON objects representing
     *   serialized Category objects
     **/
    renderCategories = function(){

        var url = '/api/category/';
        $.ajax({
            url: url
        })
            .done(function(categories){
                stateMap.category_db.insert(parseCategoryData(categories));
                stateMap.categories = stateMap.category_db().get();
                PubSub.emit("onCategoryLoadComplete");
            })
            .fail(function(){
                console.error("Could not load Clip archive");
            })
            .always(function(){

            });
    };


    /*
     * method renderClips: make an api call to gather the Clips in database
     * precondition: the category passed in is a valid Category object in database
     * parameters
     *  * category - a valid Category object to filter on
     * return
     *   * jsonArray - a list of valid JSON objects representing
     *   serialized Clip objects
     **/
    renderClips = function(category){

        var url = '/api/clip/';
        $.ajax({
            url: url
        })
            .done(function(clips){
                stateMap.clip_db.insert(parseClipData(clips));
                stateMap.clips = stateMap.clip_db().get();
                PubSub.emit("onClipLoadComplete");
            })
            .fail(function(){
                console.error("Could not load Clip archive");
            })
            .always(function(){

            });
    };



    /*
     * method parseCategoryData: transform any Category fields to javascript-compatible
     * parameters
     *   * raw - a string describing an array of valid JSON
     * return
     *   * jsonArray - a list of valid JSON objects
     **/
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

    /*
    * method parseClipData: transform any Clip fields to javascript-compatible
    * parameters
    *   * raw - a string describing an array of valid JSON
    * return
    *   * jsonArray - a list of valid JSON objects
    **/
    parseClipData = function(raw){
        var jsonArray;

        jsonArray = raw.map(function(jsonObj){

            try{
                jsonObj.created = moment(jsonObj.created);
                return jsonObj;
            }catch(err){
                console.error(err);
            }
        });
        return jsonArray;
    };


    //--------------------- END MODULE SCOPE METHODS --------------------


    //--------------------- BEGIN DOM METHODS --------------------

    setJqueryMap = function(){
        var $outerDiv = stateMap.$container;

        jqueryMap = {
            $outerDiv       : $outerDiv,
            $nav_sidebar    : $outerDiv.find('.shellac-app.sidebar .shellac-app.nav.nav-sidebar.list-group'),
            $clip_content        : $outerDiv.find('.shellac-app.clip.content')
        };
    };


    display_categories = function(){

        var all_anchor = String(),
            items = String(),
            clip_list = [];
        jqueryMap.$nav_sidebar.append(all_anchor);

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

        jqueryMap.$nav_sidebar.append(all_anchor, items);

        //register listeners
        $('.list-group-item-heading').on('click', onClickCategory);
    };


    display_clips = function(){

        jqueryMap.$clip_content.html("");
        stateMap.clips.forEach(function(object){

            var clip = String() +
                '<div class="col-xs-6 col-sm-6 col-md-6 col-lg-4 media clip">' +

                    '<span class="media-url" data-clip-url="' + stateMap.MEDIA_URL + object.audio_file + '">' +
                        '<img class="media-img img-responsive" src="' + stateMap.STATIC_URL + 'shellac/assets/seventyEight.png" alt="' + object.title + '" />' +
                        '<div class="media-description">' +
                            '<span class="media-description-content lead">' + util.truncate(object.title, configMap.truncate_max) + '</span><br/>' +
                            '<span class="media-description-content"><em>' + util.truncate(object.description, configMap.truncate_max) + '</em></span><br/>' +
                            '<span class="media-description-content"><small>' + object.author + "  -- " + object.created._d.toDateString() + '</small></span><br/>' +
                        '</div>' +
                        '<div class="media-progress"></div>' +
                    '</span>' +
                '</div>';

            jqueryMap.$clip_content.append(clip);


        });
        $('.media.clip .media-url').on('click', function(e){
            audio.onClickPlayer($(this));
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

//        console.log($(event.target));

        //empty the clip array
        stateMap.clips = [];

        //refill the empty the clip array
        if(event.target.id === "all"){
            stateMap.clips = stateMap.clip_db().get();

        } else {
            category_object = stateMap.category_db({slug: event.target.id}).first();

            //push in any matching clip id
            stateMap.clips = category_object.clips.map(function(id){
                return stateMap.clip_db({id: id}).first();
            });
        }
        display_clips();
        util.PubSub.emit("shellac-categorychange", stateMap.clips.map(function(clip){return clip.audio_file;}));
    };

    //-------------------- END EVENT HANDLERS --------------------

    //------------------- BEGIN PUBLIC METHODS -------------------
    // Begin Public method /initModule/
    // Example   : spa.shell.initModule( $('#div') );
    // Purpose   :
    //   Directs this app to offer its capability to the user
    // Arguments :
    //   * $container (example: $('#div')).
    //     A jQuery collection that should represent
    //     a single DOM container
    //   * MEDIA_URL - the Django media url prefix (settings.MEDIA_URL)
    //   * STATIC_URL - the django static url prefix (settings.STATIC_URL)
    // Action    :
    //   Populates $container with the shell of the UI
    //   and then configures and initializes feature modules.
    //   The Shell is also responsible for browser-wide issues
    // Returns   : none
    // Throws    : none
    initModule = function( $container, STATIC_URL, MEDIA_URL){
        // load HTML and map jQuery collections
        stateMap.$container = $container;
        stateMap.$nav_sidebar = $container.parent;
        stateMap.STATIC_URL = STATIC_URL;
        stateMap.MEDIA_URL = MEDIA_URL;

        $container.html( configMap.main_html );
        setJqueryMap();

        //register pub-sub methods
        PubSub.on("onClipLoadComplete", display_clips);
        PubSub.on("onCategoryLoadComplete", display_categories);

        //load data into in-browser database
        renderClips();
        renderCategories();

//        console.log($container);
    };

    return { initModule: initModule };
}());

module.exports = shellac;

