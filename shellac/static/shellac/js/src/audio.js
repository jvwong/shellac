/*
 * audio.js
 * Web Audio API methods
*/
/* global $, window, AudioContext, XMLHttpRequest, Audio*/
'use strict';

var audio = (function () {

    //---------------- BEGIN MODULE DEPENDENCIES --------------
    var util = require('./util.js');
    var soundManager = require('../lib/soundmanager2/script/soundmanager2.js').soundManager;
    console.log(soundManager);

    //---------------- END MODULE DEPENDENCIES --------------

    //---------------- BEGIN MODULE SCOPE VARIABLES --------------
    var context,

    configMap = {
        progress_html : String() +
            '<div class="progress">' +
                '<div class="progress-bar" role="progressbar" aria-valuenow="100" aria-valuemin="0" aria-valuemax="100" style="width: 0%;">' +
                    '<span class="sr-only">60% Complete</span>' +
                '</div>' +
            '</div>'
    },

    stateMap = {
        source: undefined,
        context: undefined,
        audio: undefined,
        isPlaying: false,

        url: undefined,
        startOffset: 0,
        startTime: 0
    },

    jqueryMap = {},
    setJqueryMap,

    initModule,
    onClickPlayer,
    togglePlayer,
    createAudioPlayer;

    //---------------- END MODULE SCOPE VARIABLES --------------

   //--------------------- BEGIN MODULE SCOPE METHODS --------------------

    setJqueryMap = function($player){
        jqueryMap.$player  = $player;
        jqueryMap.$progress = $player.find('.media-progress');
    };

    togglePlayer = function(isPlaying){
        if(!isPlaying){
            console.log("start playing: %s", stateMap.url);
            stateMap.audio.play();
            return !isPlaying;
        }

        console.log("pausing: %s", stateMap.url);
        stateMap.audio.pause();
        return !isPlaying;
    };

    // Begin private method /initModule/
    // Example   : audio.initModule();
    // Purpose   :
    //   Sets up the Audio API context or reports errors
    // Arguments : none
    // Action    : searches and adds the correct AudioContext object to the global window
    // Returns   : none
    // Throws    : none
    initModule = function($player){
//        var contextClass;
//        // Fix up for prefixing
//        contextClass= (
//            window.AudioContext ||
//            window.webkitAudioContext ||
//            window.mozAudioContext ||
//            window.oAudioContext ||
//            window.msAudioContext);
//
//        if(contextClass){
//            stateMap.context = new contextClass();
//        } else {
//            console.log("WebAudio API is not available");
//        }

        soundManager.setup({
            url: 'http://www.hiding-my-file/Soundmanager2Files/soundmanager2_flash9.swf/',
            onready: function() {
                var mySound = soundManager.createSound({
                    id: 'aSound',
                    url: stateMap.url
                });
                mySound.play();
            },
            ontimeout: function() {
                // Hrmm, SM2 could not start. Missing SWF? Flash blocked? Show an error, etc.?
            }
        });


    };

    createAudioPlayer = function(){
        console.log("createAudioPlayer");
        /*create an audio tag*/
        var audio = new Audio();
        stateMap.source = stateMap.context.createMediaElementSource(audio);
        stateMap.source.connect(stateMap.context.destination);
        audio.src = stateMap.url;
        return audio;
    };

    //--------------------- END MODULE SCOPE METHODS --------------------

    //------------------- BEGIN PUBLIC METHODS -------------------
    onClickPlayer = function($player){
        var enteringUrl = $player.attr('data-clip-url');

        console.log("enteringUrl: %s", enteringUrl);
        console.log("stateMap.url: %s", stateMap.url);
        //If we click the same clip, continue state
        if(enteringUrl !== stateMap.url){
            setJqueryMap($player);
            //assign the new url and reset playing state
            stateMap.url = enteringUrl;
//            stateMap.isPlaying = false;
//            stateMap.startTime = 0;
//            stateMap.startOffset = 0;
//            stateMap.audio = null;
//            if(stateMap.source){
//                stateMap.source.disconnect();
//            }

            //HTML5 audio tag method
//            stateMap.audio = createAudioPlayer();
//            stateMap.audio.play();
//            stateMap.isPlaying = true;

        } else {
//            console.log(stateMap.audio.currentSrc);
//            stateMap.isPlaying = togglePlayer(stateMap.isPlaying);
        }





    };
    //------------------- END PUBLIC METHODS -------------------

    window.addEventListener('load', initModule, false);

    return {
        onClickPlayer: onClickPlayer
    };
}());

module.exports = audio;

