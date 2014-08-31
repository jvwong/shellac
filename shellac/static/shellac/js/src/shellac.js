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
        clip_db: TAFFY()
    },

    jqueryMap = {},
    setJqueryMap, display_clips,
    parseData,
    parseDate;

    //---------------- END MODULE SCOPE VARIABLES --------------

    //--------------------- BEGIN MODULE SCOPE MEDTHODS --------------------
    /*
    * method parseData: parse and incoming serialized string object
    * parameters
    *   * raw - a string describing an array of valid JSON
    * return
    *   * jsonArray - a list of valid JSON objects
    **/
    parseData = function(raw){
        var jsonArray;

        jsonArray = raw.map(function(o){
            var jsonObj;
            try{
                jsonObj = JSON.parse(o);

                //model is a period concatentation of 'app.model'
                jsonObj.model = jsonObj.model.split('.')[1];
                jsonObj.fields.created = moment(jsonObj.fields.created);

                //author is list of [username, pk]
                jsonObj.fields.author_name = jsonObj.fields.author[0];
                jsonObj.fields.author_pk = jsonObj.fields.author[1];

                return jsonObj;

            }catch(err){
                console.error(err);
            }
        });
        return jsonArray;
    };


    //--------------------- END MODULE SCOPE MEDTHODS --------------------


    //--------------------- BEGIN DOM METHODS --------------------

    setJqueryMap = function(){
        var $outerDiv = stateMap.$container;

        jqueryMap = {
            $outerDiv                   : $outerDiv,
            $shellac_container          : $outerDiv.find('.shellac-container')
        };
    };

    display_clips = function(clipArray, $container){

        clipArray.forEach(function(object){

            var fields = object.fields;

            var anchor = String() +
            '<div class="row shellac-clip-list">' +
                '<div class="media">' +
                    '<a class="pull-left" href="/media/' + fields.audio_file + '">' +
                        '<img class="media-object clip" src="/static/shellac/assets/seventyEight.png" alt="fields.slug">' +
                    '</a>' +
                    '<a href="/media/' + fields.audio_file + '">' +
                        '<div class="media-body">' +
                            '<h4 class="media-title"><strong>' + fields.title + '</strong></h4>' +
                            '<span class="media-description"><small >' + fields.author_name + '</small></span><br/>' +
                            '<span class="media-created"><small>' + fields.created._d.toDateString() + '</small></span>' +
                        '</div>' +
                    '</a>' +
                '</div>' +
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
    // Action    :
    //   Populates $container with the shell of the UI
    //   and then configures and initializes feature modules.
    //   The Shell is also responsible for browser-wide issues
    // Returns   : none
    // Throws    : none
    initModule = function( $container ){
        // load HTML and map jQuery collections
        stateMap.$container = $container;
        $container.html( configMap.main_html );
        setJqueryMap();

        //load data into in-browser database
        //stateMap.clip_db.insert(parseData(data));
        //stateMap.clips = stateMap.clip_db().get();
        //display_clips(stateMap.clips, jqueryMap.$shellac_container);
    };

    return { initModule: initModule };
}());

module.exports = shellac;

