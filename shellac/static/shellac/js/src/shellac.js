/*
 * shellac.js
 * Root namespace module
*/
'use strict';

var shellac = (function () {
    var moment = require('moment'),
        TAFFY = require('taffydb').taffy;

    //---------------- BEGIN MODULE DEPENDENCIES --------------

    //---------------- END MODULE DEPENDENCIES --------------

    //---------------- BEGIN MODULE SCOPE VARIABLES --------------
    var
    initModule,

    configMap = {
        main_html: String() +
            '<div class="col-sm-3 col-md-2 shellac-app sidebar">' +
                '<div class="shellac-app nav nav-sidebar list-group"></div>' +
            '</div>' +
            '<div class="col-sm-9 col-sm-offset-3 col-md-10 col-md-offset-2 shellac-app clip content"></div>'
    },

    stateMap = {
        $container: undefined,

        STATIC_URL: undefined,

        categories: undefined,
        category_db: TAFFY(),

        clips: undefined,
        clip_db: TAFFY()
    },

    jqueryMap = {},
    setJqueryMap,

    parseCategoryData, renderCategories, display_categories,
    parseClipData, renderClips, display_clips,

    onClickCategory,
    PubSub;

    //---------------- END MODULE SCOPE VARIABLES --------------

    //--------------------- BEGIN MODULE SCOPE METHODS --------------------
    PubSub = {
        handlers: {},

        on : function(eventType, handler) {
            if (!(eventType in this.handlers)) {
                this.handlers[eventType] = [];
            }
            //push handler into array -- "eventType": [handler]
            this.handlers[eventType].push(handler);
            return this;
        },

        emit : function(eventType) {
            var handlerArgs = Array.prototype.slice.call(arguments, 1);
            for (var i = 0; i < this.handlers[eventType].length; i++) {
                this.handlers[eventType][i].apply(this, handlerArgs);
            }
            return this;
        }

    };



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
                PubSub.emit("onCategoryLoadComplete", stateMap.categories, jqueryMap.$nav_sidebar);
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
                PubSub.emit("onClipLoadComplete", stateMap.clips, jqueryMap.$clip_content);
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


    display_categories = function(categoryArray, $container){

        categoryArray.forEach(function(object){

            var anchor = String() +
                '<a class="list-group-item nav-sidebar-category" href="#">' +
                    '<h5 class="list-group-item-heading" id="' + object.slug + '">' + object.title + '</h5>' +
                '</a>';

            $container.append(anchor);

        });

        //register listeners
        $('.list-group-item-heading').on('click', onClickCategory);
    };


    display_clips = function(clipArray, $container){

        console.log(clipArray[0]);

        clipArray.forEach(function(object){

            var anchor = String() +
                '<div class="col-xs-6 col-sm-6 col-md-6 col-lg-4 media clip">' +

                '<a class="media-url" href="' + object.audio_file + '">' +
                    '<img class="media-img img-responsive" src="' + stateMap.STATIC_URL + 'shellac/assets/seventyEight.png" alt="' + object.title + '" />' +
                    '<div class="media-description">' +
                        '<span class="media-description-content lead">' + object.title + '</span><br/>' +
                        '<span class="media-description-content"><em>' + object.description + '</em></span><br/>' +
                        '<span class="media-description-content"><small>' + object.author + "  -- " + object.created._d.toDateString() + '</small></span><br/>' +
                    '</div>' +
                '</a>' +
            '</div>';

            $container.append(anchor);

        });

    };


    //--------------------- END DOM METHODS ----------------------

    //------------------- BEGIN EVENT HANDLERS -------------------
    // Begin Event handler /onClickCategory/
    // Purpose    : Handles the event for sidebar category selection
    // Arguments  :
    // Settings   : none
    // Returns    :
    // Actions    :
    //   * binds to category DOM elements and reloads corresponding clips into
    //     stateMap.clips
    onClickCategory = function(e){
        console.log(e.target.id);
//        stateMap.clips = stateMap.clip_db({});
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
    initModule = function( $container, STATIC_URL){
        // load HTML and map jQuery collections
        stateMap.$container = $container;
        stateMap.$nav_sidebar = $container.parent;
        stateMap.STATIC_URL = STATIC_URL;


        $container.html( configMap.main_html );
        setJqueryMap();

        //register pub-sub methods
        PubSub.on("onClipLoadComplete", display_clips);
        PubSub.on("onCategoryLoadComplete", display_categories);

        //load data into in-browser database
        renderClips();
        renderCategories();

        console.log($container);
    };

    return { initModule: initModule };
}());

module.exports = shellac;

