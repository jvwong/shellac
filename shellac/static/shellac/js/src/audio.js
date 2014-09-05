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
    togglePlayer;

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
    // Example   : initModule();
    // Purpose   :
    //   Sets up the Audio API context or reports errors
    // Arguments : none
    // Action    : searches and adds the correct AudioContext object to the global window
    // Returns   : none
    // Throws    : none
    initModule = function(){
        soundManager.setup({
            url: 'http://www.hiding-my-file/Soundmanager2Files/soundmanager2_flash9.swf/',
            onready: function() {
                console.log("SoundManager ready");
            },
            ontimeout: function() {
                console.log("SoundManager failed to load");
            }
        });
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

            if(stateMap.audio){
                stateMap.audio.stop();
                soundManager.destroySound(stateMap.url);
                stateMap.audio = null;
            }

            //assign the new url and reset playing state
            stateMap.url = enteringUrl;
            stateMap.startTime = 0;
            stateMap.startOffset = 0;

            //SoundManager2 method
            stateMap.audio = soundManager.createSound({
                    id: stateMap.url,
                    url: stateMap.url
                });
            stateMap.audio.play();
            stateMap.isPlaying = true;

        } else {
            console.log("Same URL %s", stateMap.url);
            console.log("stateMap.isPlaying %s", stateMap.isPlaying);
            stateMap.isPlaying = togglePlayer(stateMap.isPlaying);
        }
    };
    //------------------- END PUBLIC METHODS -------------------

    window.addEventListener('load', initModule, false);

    return {
        onClickPlayer: onClickPlayer
    };
}());

module.exports = audio;

