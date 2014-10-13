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

            '<div class="search-container">' +
                '<div class="form-group has-success has-feedback">' +
                    '<label class="control-label" for="inputSuccess"></label>' +
                    '<input type="text" class="form-control search-query" id="inputSuccess">' +
                    '<span class="glyphicon glyphicon-search form-control-feedback"></span>' +
                '</div>' +
            '</div>' +

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

            '<div class="authors panel panel-default">' +
                '<div class="panel-heading">' +
                    '<a data-toggle="collapse" data-parent="#accordion" href="#collapseAuthors">' +
                        'Authors' +
                    '</a>' +
                '</div>' +
                '<div id="collapseAuthors" class="panel-collapse collapse">' +
                    '<div class="panel-body">' +
                        '<div class="list-group"></div>' +
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
        latest_clips_db: undefined,
    },

    initModule, setJqueryMap,

    onSubmitSearch,

    init_sidebar, fetchUrl,
    parseCategoryData,
    onTapClose, onSwipeClose,

    onClickCategory, display_categories,
    onClickAuthor, display_authors,

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

            $sidebar_search_container       : $outerDiv.find('.shellac-app-sidebar-panel .search-container'),
            $sidebar_search_input           : $outerDiv.find('.shellac-app-sidebar-panel .search-container .search-query'),
            $sidebar_search_submit          : $outerDiv.find('.shellac-app-sidebar-panel .search-container .glyphicon.glyphicon-search'),

            $sidebar_category_panel         : $outerDiv.find('.shellac-app-sidebar-panel .category.panel'),
            $sidebar_category_listGroup     : $outerDiv.find('.shellac-app-sidebar-panel .category.panel #collapseCategories .panel-body .list-group'),

            $sidebar_authors_panel          : $outerDiv.find('.shellac-app-sidebar-panel .authors.panel'),
            $sidebar_authors_listGroup      : $outerDiv.find('.shellac-app-sidebar-panel .authors.panel #collapseAuthors .panel-body .list-group')
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
     * @param category_list list containing formatted category objects
     * @param $container jquery container
     * @param latest_clips_db the TAFFY db containing relevant clip objects
     */
    display_categories = function($container, category_db, latest_clips_db){
        var all_anchor = String(),
            items = String(),
            count = latest_clips_db().count();

        (category_db().get()).forEach(function(category){
            var clip_array = latest_clips_db({categories: {has: category.url}});
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
                latest_clips_db: latest_clips_db
            },
            onClickCategory
        );
    };

    /**
     * display_authors append the html for the currently displayed clips
     * @param category_list list containing formatted category objects
     * @param $container jquery container
     * @param latest_clips_db the TAFFY db containing relevant clip objects
     */
    display_authors = function($container, latest_clips_db){

        var all_anchor = String(),
            items = String(),
            owner_list = latest_clips_db().distinct("owner");



        owner_list.forEach(function(owner){
            var clip_array = latest_clips_db({owner: {has: owner}});

            items +=
                '<a class="list-group-item nav-sidebar-authors" href="#">' + '<span class="badge">' + clip_array.count() + '</span>' +
                '<h5 class="list-group-item-heading" id="' + owner + '">' + owner + '</h5>' +
                '</a>';
        });

        all_anchor +=
            '<a class="list-group-item nav-sidebar-authors active" href="#">' +
            '<span class="badge">' + latest_clips_db().count() + '</span>' +
            '<h5 class="list-group-item-heading" id="all">ALL</h5>' +
            '</a>';
        $container.append(all_anchor, items);

        //register listeners on <h5> element
        $('.list-group-item.nav-sidebar-authors').on('click',
            {
                latest_clips_db: latest_clips_db
            },
            onClickAuthor
        );
    };
    //--------------------- END DOM METHODS ----------------------

    //------------------- BEGIN EVENT HANDLERS -------------------
    /**
     * onClickCategory callback for changes in the category UI.
     * Extracts the audio file url for each clip for the category
     * and emits a sidebar change event
     * @param event jQuery event object for the clicked elements
     */
    onClickCategory = function(event){

        var latest_clips_db = event.data.latest_clips_db,
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
            clips = latest_clips_db().get();

        } else {
            category = category_db({slug: id}).first();
            clips = latest_clips_db({categories: {has: category.url}}).get();
        }

        util.PubSub.emit( "shellac-app-clip-change", clips);
    };


    /**
     * onClickAuthor callback for changes in the author UI.
     * Extracts the audio file url for each clip for the category
     * and emits a sidebar change event
     * @param event jQuery event object for the clicked elements
     */
    onClickAuthor = function(event){

        var latest_clips_db = event.data.latest_clips_db,
            clips = [],
            owner, $a, id;

        //remove the active class from all <a>
        jqueryMap.$sidebar_authors_listGroup.find('.list-group-item.nav-sidebar-authors').removeClass( "active");

        //add the active class to current -- check if we clicked inner h5 and span elements within a
        $a = $(event.target).closest('a');
        $a.addClass("active");
        id = $a.find('.list-group-item-heading').attr('id'); //owner

        //refill the empty the clip array
        if(id === "all"){
            clips = latest_clips_db().get();

        } else {
            clips = latest_clips_db({owner: {has: id}}).get();
        }

        util.PubSub.emit( "shellac-app-clip-change", clips);
    };

    /**
     * onSubmitSearch callback for search box enter action
     * Calls the search api and responds with a sidebar change event emit
     * @param event jQuery event object for the clicked elements
     */
    onSubmitSearch = function(event){
        var q = jqueryMap.$sidebar_search_input.val(),
            endpoint = ['/api/clips/?q=', q].join('');
//        console.log(encodeURI(endpoint));
        util.fetchUrl(endpoint, 'api_clips_search');
    };


    //-------------------- END EVENT HANDLERS --------------------

    //------------------- BEGIN PUBLIC METHODS -------------------
    /**
     * initModule Populates the $container with the sidebar of the UI
     * and then configures and initializes feature modules.
     * @param $container A jQuery collection that should represent a single DOM container
     * @param latest_clips_db the TAFFY db of clip objects
     */
    initModule = function( $container, latest_clips_db ){

        // load HTML and map jQuery collections
        stateMap.$container = $container;
        stateMap.latest_clips_db = latest_clips_db;

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
                        stateMap.latest_clips_db
                    );
                    break;
                case 'api_clips_search':
                    util.PubSub.emit( "shellac-app-clip-change", util.parseClipData(result));
                    break;
                default:
            }
        });

        //register search listener
        jqueryMap.$sidebar_search_submit.on('click', onSubmitSearch);
        jqueryMap.$sidebar_search_input.keypress(function(e){

                if (e.keyCode === 13){onSubmitSearch();}
            });

        //Inject Category, People data
        display_authors(jqueryMap.$sidebar_authors_listGroup, stateMap.latest_clips_db);
        util.fetchUrl('/api/categories/', 'api_categories');

    };
    return { initModule: initModule };
}());

module.exports = sidebar;

