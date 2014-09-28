/*
 * shell.js
 * Root module
*/
/* global $, window, XMLHttpRequest */
'use strict';

var shell = (function () {

    //---------------- BEGIN MODULE DEPENDENCIES --------------
    var moment = require('moment'),
        TAFFY = require('taffydb').taffy,
        util = require('../util.js');

    //---------------- END MODULE DEPENDENCIES --------------

    //---------------- BEGIN MODULE SCOPE VARIABLES --------------
    var
    initModule,

    configMap = {
        follow_button_html: String() + '<button type="button" class="btn btn-primary unfollow">Follow</button>',
        unfollow_button_html: String() + '<button type="button" class="btn btn-warning unfollow">Unfollow</button>',
        block_button_html: String() + '<button type="button" class="btn btn-danger unfollow">Block</button>',
        unblock_button_html: String() + '<button type="button" class="btn btn-success unblock">Unblock</button>'
    },

    stateMap = {
        $container: undefined
    },

    jqueryMap = {},
    setJqueryMap,
    setActionButtons,
    PubSub = util.PubSub;

    //---------------- END MODULE SCOPE VARIABLES --------------

    //--------------------- BEGIN MODULE SCOPE METHODS --------------------

    setJqueryMap = function(){
        var $outerDiv = stateMap.$container;

        jqueryMap = {
            $outerDiv               : $outerDiv,
            $person_list            : $outerDiv.find('.partial-relationships.person')
        };
    };
    //--------------------- END MODULE SCOPE METHODS --------------------


    //--------------------- BEGIN DOM METHODS --------------------
    /** setActions sets the correct action button for each Person object displayed
     * @param $person_list a jquery list of selection of Person templates
     */
    setActionButtons = function($person_list){
        console.log($person_list);
        $person_list.each(function(index){
            var $button_container, status;
            $button_container = $( this ).find('.partial-relationships-action');
            status = $button_container.attr('data-status').trim();

            switch(status){
                case 'friend':
                    $button_container.html(configMap.unfollow_button_html);
                    break;
                case 'follower':
                    $button_container.html(configMap.block_button_html);
                    break;
                case 'following':
                    $button_container.html(configMap.unfollow_button_html);
                    break;
                case 'blocked':
                    $button_container.html(configMap.unblock_button_html);
                    break;
                default:
                    //none of the above
                    $button_container.html(configMap.follow_button_html);
            }
        });
    };

    //--------------------- END DOM METHODS ----------------------

    //------------------- BEGIN EVENT HANDLERS -------------------
    /** Event handler
     */

    //-------------------- END EVENT HANDLERS --------------------

    //------------------- BEGIN PUBLIC METHODS -------------------
    // initModule //   Accepts the $container with the shell of the UI
    //   and then configures and initializes feature modules.
    // @param $container A jQuery collection that should represent
    // a single DOM container with modules containing the generic
    // Relationship attributes
    initModule = function( $container ){
        // load HTML and map jQuery collections
        stateMap.$container = $container;
        setJqueryMap();

        //Set the correct action buttons on each Person template
        setActionButtons(jqueryMap.$person_list);
    };

    return { initModule: initModule };
}());

module.exports = shell;

