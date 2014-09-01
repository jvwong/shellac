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
            '<div class="shellac-container"></div>',

        clip_template_html: String() +
            '<a class="shellac-clip-anchor"></a>'
    },

    stateMap = {
        $container: undefined,
        MEDIA_URL: undefined,
        STATIC_URL: undefined,
        clip_db: TAFFY()
    },

    jqueryMap = {},
    setJqueryMap, display_clips,
    parseData,
    render,
    onDataload,
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
     * method loadData: make an api call to gather the Clips in database
     * parameters
     * return
     *   * jsonArray - a list of valid JSON objects representing
     *   serialized Clip objects
     **/
    render = function(){
        $.ajax({
            url: '/api/clip/'
        })
            .done(function(data){
                onDataload(data);
            })
            .fail(function(){
                console.error("Could not load Clip archive");
            })
            .always(function(){

            });
    };

    /*
     * method onDataload: handler following data load from Ajax call that sets the data
     * variables on the Taffy DB and statemap
     * parameters
     *  - data: raw json data
     * return
     **/
    onDataload = function(data){
        stateMap.clip_db.insert(parseData(data));
        stateMap.clips = stateMap.clip_db().get();
        PubSub.emit("onDataLoadComplete", stateMap.clips, jqueryMap.$shellac_container );
    };

    /*
    * method parseData: transform any fields to javascript-compatible
    * parameters
    *   * raw - a string describing an array of valid JSON
    * return
    *   * jsonArray - a list of valid JSON objects
    **/
    parseData = function(raw){
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
            $outerDiv                   : $outerDiv,
            $shellac_container          : $outerDiv.find('.shellac-container')
        };
    };

    display_clips = function(clipArray, $container){
        console.log(clipArray);

        clipArray.forEach(function(object){

            var anchor = String() +
                '<div class="col-xs-6 col-sm-6 col-md-6 col-lg-4 media clip">' +

                '<a class="media-url" href="' + stateMap.MEDIA_URL + object.audio_file + '">' +
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
    // Begin Event handler //
    // Purpose    : Handles the event
    // Arguments  :
    //   * event - jQuery event object.
    // Settings   : none
    // Returns    : false
    // Actions    :
    //   * Parses the URI anchor component
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
    initModule = function( $container, MEDIA_URL, STATIC_URL ){
        // load HTML and map jQuery collections
        stateMap.$container = $container;
        stateMap.MEDIA_URL = MEDIA_URL;
        stateMap.STATIC_URL = STATIC_URL;

        $container.html( configMap.main_html );
        setJqueryMap();

        console.log($container);
        PubSub.on("onDataLoadComplete", display_clips);

        //load data into in-browser database
        render();
    };

    return { initModule: initModule };
}());

module.exports = shellac;

