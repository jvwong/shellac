/*
 * shellac.js
 * Root namespace module
*/
'use strict';

var shellac = (function () {
    var TAFFY = require('../lib/taffydb/taffy.js').taffy;


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
        $container  : undefined
        , clip_db     : TAFFY()
    },

    jqueryMap = {},

    //---------------- END MODULE SCOPE VARIABLES --------------


    //--------------------- BEGIN DOM METHODS --------------------

    setJqueryMap = function(){
        var $outerDiv = stateMap.$container;

        jqueryMap = {
            $outerDiv                   : $outerDiv,
            $shellac_container          : $outerDiv.find('.shellac-container')
        };
    },

    display_clips = function(clipArray, $container){

        clipArray.forEach(function(url){

            var anchor = String() +
            '<div class="row shellac-clip-list">' +
                '<div class="media">' +
                    '<a class="pull-left" href="' + url + '">' +
                        '<img class="media-object clip" src="/static/shellac/assets/seventyEight.png" alt="">' +
                    '</a>' +
                    '<div class="media-body">' +
                        '<h4 class="media-heading">Media title</h4>' +
                        '<p class="media-meta">Metadata</p>' +
                        '<p class="media-description">brief description</p>' +
                    '</div>' +
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
    initModule = function( $container, data, TAFFY ){
        // load HTML and map jQuery collections
        stateMap.$container = $container;
        $container.html( configMap.main_html );
        setJqueryMap();

        //load data into in-browser database
        stateMap.clip_db.insert(data);
        stateMap.clips = stateMap.clip_db().get();

        display_clips(stateMap.clips, jqueryMap.$shellac_container);
        console.log($(".media-object.clip"));
    };

    return { initModule: initModule }
}());

module.exports = shellac;

