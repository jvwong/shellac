/*
* sidebar.js
* Sidebar module
*/
/* global $, window, AudioContext, XMLHttpRequest */
'use strict';

var sidebar = (function () {

    //---------------- BEGIN MODULE DEPENDENCIES --------------
    var TAFFY = require('taffydb').taffy,
        util = require('../util.js');

    //---------------- END MODULE DEPENDENCIES --------------

    //---------------- BEGIN MODULE SCOPE VARIABLES --------------
    var

    configMap = {
        main_html: String() +
        '<div class="shellac-app-sidebar-panel panel-group noSwipe" id="accordion">' +

            '<div class="category panel panel-default">' +
                '<div class="panel-heading">' +
                    '<a data-toggle="collapse" data-parent="#accordion" href="#collapseCategories">' +
                        'Categories' +
                    '</a>' +
                '</div>' +
                '<div id="collapseCategories" class="panel-collapse collapse">' +
                    '<div class="panel-body">' +
                        '<div class="list-group"></div>' +
                    '</div>' +
                '</div>' +
            '</div>' +

            '<div class="people panel panel-default">' +
                '<div class="panel-heading">' +
                    '<a data-toggle="collapse" data-parent="#accordion" href="#collapsePeople">' +
                        'People' +
                    '</a>' +
                '</div>' +
                '<div id="collapsePeople" class="panel-collapse collapse">' +
                    '<div class="panel-body">' +
                        '<div class="list-group">//ToDo</div>' +
                    '</div>' +
                '</div>' +
            '</div>' +

        '</div>',
        truncatemax: 10
    },

    stateMap = {
        $container: undefined,
        categories: undefined,
        category_db: TAFFY(),
        clip_db: undefined,
    },

    initModule, setJqueryMap,

    init_sidebar, fetchUrl,
    parseCategoryData,
    onTapClose, onSwipeClose, onClickCategory, display_categories,

    jqueryMap = {};

    //---------------- END MODULE SCOPE VARIABLES --------------

    //--------------------- BEGIN MODULE SCOPE METHODS --------------------

    /**
     * setJqueryMap record the jQuery elements of the page
     */
    setJqueryMap = function(){
        var $outerDiv = stateMap.$container;

        jqueryMap = {
            $outerDiv                       : $outerDiv,
            $sidebar_panel                  : $outerDiv.find('.shellac-app-sidebar-panel'),
            $sidebar_category_panel         : $outerDiv.find('.shellac-app-sidebar-panel .category.panel'),
            $sidebar_category_listGroup     : $outerDiv.find('.shellac-app-sidebar-panel .category.panel #collapseCategories .panel-body .list-group'),
            $sidebar_people_panel           : $outerDiv.find('.shellac-app-sidebar-panel .people.panel'),
            $sidebar_people_listGroup       : $outerDiv.find('.shellac-app-sidebar-panel .people.panel #collapsePeople .panel-body .list-group')
        };
    };


    /**
     * method parseCategoryData: transform any Category fields to javascript-compatible
     * @param a string describing an array of valid JSON
     * @return jsonArray a list of valid JSON objects
     */
    parseCategoryData = function(raw){
        var jsonArray;
        jsonArray = raw.results.map(function(jsonObj){
            try{
                return jsonObj;
            }catch(err){
                console.error(err);
            }
        });
        return jsonArray;
    };

    //--------------------- END MODULE SCOPE METHODS --------------------

    //--------------------- BEGIN DOM METHODS --------------------
    /**
     * display_categories append the html for the category sidebar accordion section
     * Can we make this more generic?
     * @param category_list list containing formatted category objects
     * @param $container jquery container
     * @param clip_db the TAFFY db containing relevant clip objects
     */
    display_categories = function($container, category_db, clip_db){
        var all_anchor = String(),
            items = String(),
            count = clip_db().count();

        (category_db().get()).forEach(function(category){
            var clip_array = clip_db({categories: {has: category.url}});
            items +=
                '<a class="list-group-item nav-sidebar-category" href="#">' + '<span class="badge">' + clip_array.count() + '</span>' +
                    '<h5 class="list-group-item-heading" id="' + category.slug + '">' + category.title + '</h5>' +
                '</a>';
        });

        all_anchor +=
            '<a class="list-group-item nav-sidebar-category active" href="#">' +
                '<span class="badge">' + count + '</span>' +
                '<h5 class="list-group-item-heading" id="all">ALL</h5>' +
            '</a>';
        $container.append(all_anchor, items);

        //register listeners on <h5> element
        $('.list-group-item.nav-sidebar-category').on('click',
            {
                category_db: category_db,
                clip_db: clip_db
            },
            onClickCategory
        );
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

        var clip_db = event.data.clip_db,
            category_db = event.data.category_db,
            clips = [],
            category, $a, id;

        //remove the active class from all <a>
        jqueryMap.$sidebar_category_listGroup.find('.list-group-item.nav-sidebar-category').removeClass( "active");

        //add the active class to current -- check if we clicked inner h5 and span elements within a
        $a = $(event.target).closest('a');
        $a.addClass("active");
        id = $a.find('.list-group-item-heading').attr('id');

        //refill the empty the clip array
        if(id === "all"){
            clips = clip_db().get();

        } else {
            category = category_db({slug: id}).first();
            clips = clip_db({categories: {has: category.url}}).get();
        }

        util.PubSub.emit( "shellac-app-sidebar-categorychange", clips);
    };




    //-------------------- END EVENT HANDLERS --------------------

    //------------------- BEGIN PUBLIC METHODS -------------------
    /**
     * initModule Populates the $container with the sidebar of the UI
     * and then configures and initializes feature modules.
     * @param $container A jQuery collection that should represent a single DOM container
     * @param clip_db the TAFFY db of clip objects
     */
    initModule = function( $container, clip_db ){

        // load HTML and map jQuery collections
        stateMap.$container = $container;
        stateMap.clip_db = clip_db;

        $container.append( configMap.main_html );
        setJqueryMap();

        //register pub-sub methods
        util.PubSub.on("fetchUrlComplete", function(url, result){
            switch (url)
            {
                case 'api_categories':
                    var formatted_categories = parseCategoryData(result);
                    stateMap.category_db.insert(formatted_categories);
                    display_categories(
                        jqueryMap.$sidebar_category_listGroup,
                        stateMap.category_db,
                        stateMap.clip_db
                    );
                    break;
                default:
            }
        });

        //load Category data from url
        util.fetchUrl('api/categories/', 'api_categories');

    };
    return { initModule: initModule };
}());

module.exports = sidebar;

