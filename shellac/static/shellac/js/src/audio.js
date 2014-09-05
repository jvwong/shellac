/*
 * audio.js
 * Web Audio API methods
*/
/* global $, window, AudioContext, XMLHttpRequest, Audio*/
'use strict';

var audio = (function () {

    //---------------- BEGIN MODULE DEPENDENCIES --------------
    var util = require('./util.js'),
        soundManager = require('../lib/soundmanager2/script/soundmanager2.js').soundManager;

    //---------------- END MODULE DEPENDENCIES --------------

    //---------------- BEGIN MODULE SCOPE VARIABLES --------------
    var

    configMap = {
        progress_html : String() +
            '<div class="progress">' +
                '<div class="progress-bar" role="progressbar" aria-valuenow="100" aria-valuemin="0" aria-valuemax="100" style="width: 0%;">' +
                    '<span class="sr-only">60% Complete</span>' +
                '</div>' +
            '</div>',

        isSupported: undefined
    },

    stateMap = {
        source: undefined,
        context: undefined,
        audio: undefined,
        isPlaying: false,

        url: undefined,
        percentPlayed: undefined
    },

    jqueryMap = {},
    setJqueryMap,

    initModule,
    onClickPlayer,
    togglePlayer;

    //---------------- END MODULE SCOPE VARIABLES --------------

   //--------------------- BEGIN MODULE SCOPE METHODS --------------------

    setJqueryMap = function($player){
        jqueryMap.$player  = $player;
        jqueryMap.$progress = $player.find('.media-progress');
        jqueryMap.$progress_bar = jqueryMap.$progress.find('.progress-bar');
    };

    togglePlayer = function(){
        if(stateMap.audio.paused){
            console.log("Paused; Resume play: %s", stateMap.url);
            stateMap.audio.resume();

        }else if(stateMap.audio.playState === 0){ //stopped or uninitialized
            console.log("Stopped; Start play: %s", stateMap.url);
            stateMap.audio.play();
        }else if(stateMap.audio.playState === 1){ //playing or buffering
            console.log("Playing; Pause : %s", stateMap.url);
            stateMap.audio.pause();
        }
    };

    // Begin private method /initModule/
    // Example   : initModule();
    // Purpose   :
    //   Sets up the Audio API context or reports errors
    // Arguments : none
    // Action    : searches and adds the correct AudioContext object to the global window
    // Returns   : none
    // Throws    : none
    initModule = function(){
        soundManager.setup({
            debugMode: true,
            consoleOnly: true,
            url: 'http://www.hiding-my-file/Soundmanager2Files/soundmanager2_flash9.swf/',
            onready: function() {
                configMap.isSupported = soundManager.ok();
                console.log("SoundManager supported: %s", configMap.isSupported);
            },
            ontimeout: function() {
                console.log("SoundManager failed to load");
            }
        });
    };

    //--------------------- END MODULE SCOPE METHODS --------------------

    //------------------- BEGIN PUBLIC METHODS -------------------
    onClickPlayer = function($player){

        //Get the url of the clicked element
        stateMap.url = $player.attr('data-clip-url');

        //Set the current element to the stateMap; may not be able to find progress bar if uninitialized sound
        setJqueryMap($player);

        //Case I: New sound to be created
        if(!soundManager.getSoundById(stateMap.url)){

            //Safely pause a previously playing sound
            if(stateMap.audio && stateMap.audio.playState === 1 ){
                stateMap.audio.pause();
            }

            //Create the sound, assign it to stateMap, and autoplay
            stateMap.audio = soundManager.createSound({
                    id: stateMap.url,
                    url: stateMap.url,
                    autoPlay: true,
                    whileloading: function() {
                        //soundManager._writeDebug('LOAD PROGRESS ' + this.bytesLoaded + ' / ' + this.bytesTotal);
                    },
                    whileplaying: function() {
                        var percentPlayed = (this.position / this.durationEstimate * 100).toFixed(1);

                        if(percentPlayed !== stateMap.percentPlayed){
                            stateMap.percentPlayed = percentPlayed;
                            //soundManager._writeDebug('PLAYed : ' + percentPlayed + '%');
                            jqueryMap.$progress_bar.width(percentPlayed + '%');
                        }
                    },
                    onload: function() {
                        //inject the play progress bar and set jqueryMap attribute
                        jqueryMap.$progress.html(configMap.progress_html);
                        jqueryMap.$progress_bar = jqueryMap.$progress.find('.progress-bar');

                        //initialize the percentPlayed
                        stateMap.percentPlayed = (this.position / this.durationEstimate * 100).toFixed(1);
                    },
                    onstop: function() {
                        soundManager._writeDebug('The sound ' + this.id +' stopped.');
                        //jqueryMap.$progress.html('');
                    },
                    onfinish: function() {
                        soundManager._writeDebug('The sound ' + this.id + ' finished playing.');
                        //jqueryMap.$progress.html('');
                    }
                });


        } else {
            //Assign the current sound to the stateMap and toggle it appropriately
            stateMap.audio = soundManager.getSoundById(stateMap.url);
            togglePlayer();
        }

    };
    //------------------- END PUBLIC METHODS -------------------

    window.addEventListener('load', initModule, false);

    return {
        onClickPlayer: onClickPlayer
    };
}());

module.exports = audio;

