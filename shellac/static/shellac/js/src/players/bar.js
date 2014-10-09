/*
 * bar.js
 * Root module for the sm2 player bar UI
 */
/* global $, window, DEBUG */
'use strict';

var bar = (function () {

    //---------------- BEGIN MODULE DEPENDENCIES --------------
    var
        util = require('../util.js'),
        soundManager = require('../../lib/soundmanager2/script/soundmanager2.js').soundManager,
        bar_ui = require('./bar-ui.js');

    //---------------- END MODULE DEPENDENCIES --------------

    //---------------- BEGIN MODULE SCOPE VARIABLES --------------
    var
        initModule,

        configMap = {
            bar_extra_contols: String() +
                '<div class="sm2-bar-ui">' +

                    '<div class="bd sm2-main-controls">' +

                        '<div class="sm2-inline-texture"></div>' +
                        '<div class="sm2-inline-gradient"></div>' +

                        '<div class="sm2-inline-element sm2-button-element">' +
                            '<div class="sm2-button-bd">' +
                                '<a href="#play" class="sm2-inline-button play-pause">Play / pause</a>' +
                            '</div>' +
                        '</div>' +

                        '<div class="sm2-inline-element sm2-inline-status">' +

                            '<div class="sm2-playlist">' +
                                '<div class="sm2-playlist-target">' +
                                    '<!-- playlist <ul> + <li> markup will be injected here -->' +
                                    '<!-- if you want default / non-JS content, you can put that here. -->' +
                                    '<noscript><p>JavaScript is required.</p></noscript>' +
                                '</div>' +
                            '</div>' +

                            '<div class="sm2-progress">' +
                                '<div class="sm2-row">' +
                                    '<div class="sm2-inline-time">0:00</div>' +
                                    '<div class="sm2-progress-bd">' +
                                        '<div class="sm2-progress-track">' +
                                            '<div class="sm2-progress-bar"></div>' +
                                            '<div class="sm2-progress-ball"><div class="icon-overlay"></div></div>' +
                                        '</div>' +
                                    '</div>' +
                                    '<div class="sm2-inline-duration">0:00</div>' +
                                '</div>' +
                            '</div>' +

                        '</div>' +

                        '<div class="sm2-inline-element sm2-button-element sm2-volume">' +
                            '<div class="sm2-button-bd">' +
                                '<span class="sm2-inline-button sm2-volume-control volume-shade"></span>' +
                                '<a href="#volume" class="sm2-inline-button sm2-volume-control">volume</a>' +
                            '</div>' +
                        '</div>' +

                        '<div class="sm2-inline-element sm2-button-element">' +
                            '<div class="sm2-button-bd">' +
                                '<a href="#prev" title="Previous" class="sm2-inline-button previous">&lt; previous</a>' +
                            '</div>' +
                        '</div>' +

                        '<div class="sm2-inline-element sm2-button-element">' +
                            '<div class="sm2-button-bd">' +
                                '<a href="#next" title="Next" class="sm2-inline-button next">&gt; next</a>' +
                            '</div>' +
                        '</div>' +

                        '<div class="sm2-inline-element sm2-button-element sm2-menu">' +
                            '<div class="sm2-button-bd">' +
                                '<a href="#menu" class="sm2-inline-button menu">menu</a>' +
                            '</div>' +
                        '</div>' +

                    '</div>' +

                    '<div class="bd sm2-playlist-drawer sm2-element">' +

                        '<div class="sm2-inline-texture">' +
                            '<div class="sm2-box-shadow"></div>' +
                        '</div>' +

                        '<!-- playlist content is mirrored here -->' +

                        '<div class="sm2-playlist-wrapper">' +
                            '<ul class="sm2-playlist-bd">' +
                                '<li><a href="http://freshly-ground.com/data/audio/sm2/SonReal%20-%20LA%20%28Prod%20Chin%20Injetti%29.mp3"><b>SonReal</b> - LA<span class="label">Explicit</span></a></li>' +
                                '<li><a href="http://freshly-ground.com/data/audio/sm2/SonReal%20-%20People%20Asking.mp3"><b>SonReal</b> - People Asking <span class="label">Explicit</span></a></li>' +
                            '</ul>' +
                        '</div>' +

                        '<div class="sm2-extra-controls">' +

                            '<div class="bd">' +

                                '<div class="sm2-inline-element sm2-button-element">' +
                                    '<a href="#prev" title="Previous" class="sm2-inline-button previous">&lt; previous</a>' +
                                '</div>' +

                                '<div class="sm2-inline-element sm2-button-element">' +
                                    '<a href="#next" title="Next" class="sm2-inline-button next">&gt; next</a>' +
                                '</div>' +

                                '<!-- unimplemented -->' +
                                '<!--' +
                                '<div class="sm2-inline-element sm2-button-element disabled">' +
                                 '<a href="#repeat" title="Repeat playlist" class="sm2-inline-button repeat">&infin; repeat</a>' +
                                '</div>' +

                                '<div class="sm2-inline-element sm2-button-element disabled">' +
                                 '<a href="#shuffle" title="Shuffle" class="sm2-inline-button shuffle">shuffle</a>' +
                                '</div>' +
                                '-->' +

                            '</div>' +

                        '</div>' +

                    '</div>' +

                '</div>'


        },

        stateMap = {
            $container          : undefined,
            DEBUG               : undefined
        },

        jqueryMap = {}, setJqueryMap,

        PubSub = util.PubSub;

    //---------------- END MODULE SCOPE VARIABLES --------------

    //--------------------- BEGIN MODULE SCOPE METHODS --------------------

    /**
     * setJqueryMap record the jQuery elements of the page
     */
    setJqueryMap = function(){
        var $outerDiv = stateMap.$container;
        jqueryMap = {
            $outerDiv                   : $outerDiv
        };
    };
    //--------------------- END MODULE SCOPE METHODS --------------------


    //--------------------- BEGIN DOM METHODS --------------------
    //--------------------- END DOM METHODS ----------------------

    //------------------- BEGIN EVENT HANDLERS -------------------
    //-------------------- END EVENT HANDLERS --------------------

    //------------------- BEGIN PUBLIC METHODS -------------------
    /**
     * initModule Populates $container with the shell of the UI
     * and then configures and initializes feature modules.
     * The Shell is also responsible for browser-wide issues
     * Directs this app to offer its capability to the user
     * @param $container A jQuery collection that should represent a single DOM container
     * @param DEBUG for debug purposes (root url)
     */
    initModule = function( $container, DEBUG){
        // load HTML and map jQuery collections
        stateMap.$container = $container;
        stateMap.DEBUG = DEBUG;

        $container.append( configMap.bar_extra_contols );
        setJqueryMap();

        console.log($container);
    };

    return { initModule: initModule };
}());

module.exports = bar;





