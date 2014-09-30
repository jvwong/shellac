/*
 * shell.js
 * Root module
*/
/* global $, window, XMLHttpRequest, DEBUG */
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
        username: undefined,
        endpoint: undefined,
        debug: undefined,
        relationships_db: TAFFY()
    },

    jqueryMap = {},
    setJqueryMap,
    load_relationships,
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

    load_relationships = function()
    {
        $.ajax({
            withCredentials: true,
            type: 'GET',
            url: stateMap.endpoint + "relationships/",
            dataType: 'json',
            beforeSend: function(xhr, settings) {
                if (!util.csrfSafeMethod(settings.type) && !this.crossDomain) {
                    xhr.setRequestHeader("X-CSRFToken", stateMap.csrf_token);
                }
            }
        })
        .done(function(relationships) {
            stateMap.relationships_db.insert(relationships.results);
            PubSub.emit("relationshipsLoadComplete");
        })
        .fail(function(error) {
            console.log( error );
        });
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
                    //$button_container.append(configMap.block_button_html);
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

        var $parent, $button, $div_btn_group, $div_status, username,
            from_person = String(), to_person = String(),
            http_method = '',
            payload = {},
            url = String(),
            status = String(), status_update = String(),
            button_update = String();

        $button = $(this);
        $parent = ($button.parent()).parent();
        $div_status = $parent.find('.partial-relationships-description-content.status');
        $div_btn_group = $button.parent();

        username = $parent.find('.username').html();
        from_person = stateMap.endpoint + "people/" + stateMap.username + "/";
        to_person = stateMap.endpoint + "people/" + username + "/";

        if($button.html() === 'Follow' & $div_btn_group.attr('data-status') === '')
        {
            //No Relationship exists --- POST
            http_method = 'POST';
            url = stateMap.endpoint + "relationships/";
            status_update = status = 'following';
            button_update = 'Unfollow';
        }
        else if($button.html() === 'Follow' & $div_btn_group.attr('data-status') === 'follower')
        {
            //There is a Person with a following Relationship --- POST
            //No Relationship exists --- POST
            http_method = 'POST';
            url = stateMap.endpoint + "relationships/";
            status = 'following';
            status_update = 'friend';
            button_update = 'Unfollow';
        }
        else
        {
            var relationship = stateMap.relationships_db({from_person: from_person, to_person: to_person}).first() || {};

            if($button.html() === 'Unfollow' & $div_btn_group.attr('data-status') === 'following')
            {
                //Relationship exists --- DELETE
                http_method = 'DELETE';
                url = stateMap.endpoint + "relationships/" + relationship.id.toString() + "/";
                status_update = status = '';
                button_update = 'Follow';
            }
            else if($button.html() === 'Unfollow' & $div_btn_group.attr('data-status') === 'friend')
            {
                //Relationship exists --- DELETE
                http_method = 'DELETE';
                url = stateMap.endpoint + "relationships/" + relationship.id.toString() + "/";
                status_update = status = 'follower';
                button_update = 'Block';
            }

        }

        payload = {
            "from_person": from_person,
            "status": status,
            "to_person": to_person,
            "private": false
        };

        //make some url call
        $.ajax({
            withCredentials: true,
            type: http_method,
            url: url,
            data: payload,
            dataType: 'json',
            beforeSend: function(xhr, settings) {
                if (!util.csrfSafeMethod(settings.type) && !this.crossDomain) {
                    xhr.setRequestHeader("X-CSRFToken", stateMap.csrf_token);
                }
            }
        })
        .done(function(data, textStatus, jqXHR) {

            ///we'll need to update the TAFFY database
            if(http_method === 'POST' & jqXHR.status === 201) //201 CREATED
            {
                stateMap.relationships_db.insert(data);
            }
            else if(http_method === 'DELETE' & jqXHR.status === 204 & relationship.hasOwnProperty('id')) //204 NO_CONTENT
            {
                stateMap.relationships_db({id: relationship.id}).remove();
            }

            //Update the button-related status and UI status

            ///update ALL similarly named buttons --  by username key in this case
            console.log(jqueryMap.$person_list);
            var matching = jqueryMap.$person_list.filter(function(index){
                return $(this).attr('data-person') === username;
            });
            console.log(matching);

            matching.each(function(index, element){
                console.log($(this));
                //update button text
                $(this).find('button').html(button_update);
                //update btn group data-status
                $(this).find('.btn-group.partial-relationships-action').attr('data-status', status_update);
                //update div_status
                $(this).find('.partial-relationships-description-content.status').html(status_update);
            });
            setActionButtons(jqueryMap.$person_list);
        })
        .fail(function(error) {
            console.log( error );
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
    initModule = function( $container, username, DEBUG){
        // load HTML and map jQuery collections
        stateMap.$container = $container;
        stateMap.csrf_token = util.getCookie('csrftoken');
        stateMap.username = username;

        stateMap.debug = DEBUG === 'True';
        stateMap.endpoint = stateMap.debug === true ? 'http://localhost:8000/api/': 'http://shellac.no-ip.ca/api/';
        setJqueryMap();

        //register pub-sub methods
        PubSub.on("relationshipsLoadComplete", function(){
            //console.log("loaded relationships");
            //console.log(stateMap.relationships_db().get());

        });
        load_relationships();

        //Set the correct action buttons on each Person template
        setActionButtons(jqueryMap.$person_list);

    };

    return { initModule: initModule };
}());

module.exports = shell;

