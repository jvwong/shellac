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
        follow_button_html: String() + '<button type="button" class="btn btn-primary relationships unfollow">Follow</button>',
        unfollow_button_html: String() + '<button type="button" class="btn btn-warning relationships unfollow">Unfollow</button>',
        block_button_html: String() + '<button type="button" class="btn btn-danger relationships unfollow">Block</button>',
        unblock_button_html: String() + '<button type="button" class="btn btn-success relationships unblock">Unblock</button>'
    },

    stateMap = {
        $container: undefined,
        csrf_token: undefined,
        username: undefined
    },

    jqueryMap = {},
    setJqueryMap,
    setActionButtons,
    onClickRelationshipsButton,
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
        //console.log($person_list);
        $person_list.each(function(index){
            var $button_container, status;
            $button_container = $( this ).find('.partial-relationships-action');
            status = $button_container.attr('data-status').trim();

            switch(status){
                case 'friend':
                    $button_container.html(configMap.unfollow_button_html);
                    break;
                case 'follower':
                    $button_container.html(configMap.follow_button_html);
                    $button_container.append(configMap.block_button_html);
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

        //rebind listeners
        jqueryMap.$person_list.find('button.btn.relationships').on('click', onClickRelationshipsButton);
    };


    //--------------------- END DOM METHODS ----------------------

    //------------------- BEGIN EVENT HANDLERS -------------------
    /** onClickRelationshipsButton callback for clicking on relationships
     * buttons
     * @param event jquery event object
     */
    onClickRelationshipsButton = function(event) {

        var $parent, $button, $div_btn_group, username,
            payload, url,
            current_status = String(), status = String();

        $button = $(this);
        $parent = ($button.parent()).parent();
        username = $parent.find('.username').html();
        $div_btn_group = $button.parent();

        current_status = $div_btn_group.attr('data-status');

        console.log("current_status: %s", current_status);
        console.log("button: %s", $button.html());

        //Only concerned with the action dictated by the button and the data-status
        switch(current_status){
            case 'Follow':
                break;
            case 'Unfollow':
                break;
            case 'Block':
                break;
            case 'Unblock':
                break;
            default:
                //none
                status = "";
        }

        url = '/api/relationships/';
        payload = {
            "from_person": "http://localhost/api/people/" + stateMap.username + "/",
            "status": "following",
            "to_person": "http://localhost/api/people/" + username + "/",
            "private": false
        };

        //make some url call
        $.ajax({
            type: "POST",
            url: url,
            data: payload,
            dataType: 'json',
            beforeSend: function(xhr, settings) {
                if (!util.csrfSafeMethod(settings.type) && !this.crossDomain) {
                    xhr.setRequestHeader("X-CSRFToken", stateMap.csrf_token);
                }
            }
        }).done(function(response) {
            console.log( response );
            //Update buttons and status based on Relationships (auto)
            setActionButtons(jqueryMap.$person_list);
        })
        .fail(function(error) {
            console.log( "error" );
            console.log( error );
        })
        .always(function() {
            console.log( "finished" );
        });


    };
    //-------------------- END EVENT HANDLERS --------------------

    //------------------- BEGIN PUBLIC METHODS -------------------
    // initModule //   Accepts the $container with the shell of the UI
    //   and then configures and initializes feature modules.
    // @param $container A jQuery collection that should represent
    // @param username the username of the logged in user
    // a single DOM container with modules containing the generic
    // Relationship attributes
    initModule = function( $container, username){
        // load HTML and map jQuery collections
        stateMap.$container = $container;
        stateMap.csrf_token = util.getCookie('csrftoken');
        stateMap.username = username;
        setJqueryMap();

        //Set the correct action buttons on each Person template
        setActionButtons(jqueryMap.$person_list);

        console.log(username);
    };

    return { initModule: initModule };
}());

module.exports = shell;

