/**
 * siren.js
 * Root namespace module for siren audio
 **/
/* global window, AudioContext, siren  */

'use strict';

var siren = (function() {

    var configMap = {},
        stateMap = {
            context: undefined
        },

        context, getAudioContext,

        Siren,

        initModule,

        loadSounds,
        handleBufferList
        ;

    /**
    * getAudioContext
    * @return AudioContext object
    **/
    getAudioContext = function () {
        var contextClass, context;

        try {
            contextClass = (
                window.AudioContext ||
                window.webkitAudioContext ||
                window.mozAudioContext ||
                window.oAudioContext ||
                window.msAudioContext
            );
            context = new contextClass();

        } catch (err) {
            console.warn('getAudioContext: %s, %s', err.name, err.message);

        } finally {}

        return context;
    };

//    handleBufferList = function(bufferList) {
//        console.log(bufferList);
//        // Create two sources and play them both together.
//        var source1 = context.createBufferSource();
//        var source2 = context.createBufferSource();
//        source1.buffer = bufferList[0];
//        source2.buffer = bufferList[1];
//
//        source1.connect(context.destination);
//        source2.connect(context.destination);
//    };

    /**
     * loadSounds
     * @param urls
     * @oparam context
     * @param callback
     **/
//    loadSounds = function (urls) {
//
//        var spec = {
//            context: stateMap.context,
//            urlList: urls,
//            callback: handleBufferList
//        };
//
//        var isInitialized = siren.loader.initModule(spec);
//        siren.loader.load();
//    };

    Siren = function( spec ) {

        /* START variable declarations  */
        if (!Siren.id){ Siren.id = 0; }
        var
            id = Siren.id++,
            that = {
                context: undefined
            },

            _data = {},
            _setup = {
                debugMode   : true,
                idPrefix    : 'id',
                url         : String()
            },

            init
            ;
        /* END variable declarations  */

        /* START helper functions */
        init = function(){
            that.context = spec.context;
        };
        /* END helper function */

        //Initialize the Siren object
        init();

        /**
         * dothis
         **/
        that.dothis = function () {
            return true;
        };
        /* END dothis */

        /* START GETTERS & SETTERS */
        that.data = function(_){
            if(!arguments.length) return _data;
            _data = _;
            return that;
        };

        that.setup = function(_){
            if(!arguments.length) return _setup;
            _setup = _;
            return that;
        };
        /* END GETTERS & SETTERS */

        return that;
    };



    /**
     * initModule
     * @param spec an object
     * @return true if initialisation successful
     **/
    initModule = function(spec){
        var context = getAudioContext();

        if(context){
            console.info("siren:initModule OK");
            //creation of a siren object that houses audio capability
            spec.context = context;
            return Siren(spec);
        }

        console.warn("siren:initModule failed");
        return null;
    };

    return {
        initModule: initModule
    };
}());
