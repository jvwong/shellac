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

    initModule, onCategoryChange,
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

    // Begin private method /onCategoryChange/
    // Example   : onCategoryChange;
    // Purpose   :
    //   PubSub callback for changes in the category UI
    // Arguments :
    //  * urls - array of urls for Clip objects currently displayed
    // Action    : for each url, update the given progress bar. Find the "current" sound object
    //  and reassign the jqueryMap to reflect the updated / new DOM element
    // Returns   : none
    // Throws    : none
    onCategoryChange = function(urls){

        urls.forEach(function(url){
            var murl,
                $player,
                pplayed,
                $progress_bar,
                sound;

            //tack on the media tag
            murl = '/media/' + url;

            //get the span.media-url
            $player = $('.media.clip').find("[data-clip-url='" + murl + "']");
            console.log($player);

            //get the sound and check if it was created
            sound = soundManager.getSoundById(murl);
            if(sound){

                //inject the progress bar and update the state
                $player.find('.media-progress').html(configMap.progress_html);
                $progress_bar = $player.find('.media-progress .progress-bar');

                //if it was stopped then set it to 100%
                if(sound.playState === 0){
                    pplayed = '100';
                }else{
                    pplayed = (sound.position / sound.durationEstimate * 100).toFixed(1);
                }
                $progress_bar.width(pplayed + '%');


                // if the sound === stateMap.audio then reassign the jQuery map
                if(stateMap.audio.id === murl){
                    setJqueryMap($player);
                }
            }
        });
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
        util.PubSub.on("shellac-categorychange", onCategoryChange );
    };

    //--------------------- END MODULE SCOPE METHODS --------------------

    //------------------- BEGIN PUBLIC METHODS -------------------
    onClickPlayer = function($player){

        // *** CASE 0
        // State: Clip selected does was not created yet
        // Action: Create the clip
        if(!soundManager.getSoundById($player.attr('data-clip-url'))) {

            // Case 0.a: No clip is currently playing
                // do nothing
            // Case 0.b: Another Clip exists and is still playing / buffering
            if (stateMap.audio && stateMap.audio.playState === 1){
                //pause the previous clip
                stateMap.audio.pause();
            }

            stateMap.url = $player.attr('data-clip-url');
            setJqueryMap($player);

            //Create the sound, assign it to stateMap, and autoplay
            stateMap.audio = soundManager.createSound({
                id: stateMap.url,
                url: stateMap.url,
                autoPlay: true,
                whileloading: function () {
                    //soundManager._writeDebug('LOAD PROGRESS ' + this.bytesLoaded + ' / ' + this.bytesTotal);
                },
                whileplaying: function () {
                    var percentPlayed = (this.position / this.durationEstimate * 100).toFixed(1);

                    if (percentPlayed !== stateMap.percentPlayed) {
                        stateMap.percentPlayed = percentPlayed;
                        jqueryMap.$progress_bar.width(percentPlayed + '%');
                    }
                },
                onload: function () {
                    //inject the play progress bar and set jqueryMap attribute
                    jqueryMap.$progress.html(configMap.progress_html);
                    jqueryMap.$progress_bar = jqueryMap.$progress.find('.progress-bar');

                    //initialize the percentPlayed
                    stateMap.percentPlayed = (this.position / this.durationEstimate * 100).toFixed(1);
                },
                onstop: function () {
                    soundManager._writeDebug('The sound ' + this.id + ' stopped.');
                },
                onfinish: function () {
                    soundManager._writeDebug('The sound ' + this.id + ' finished playing.');
                }
            });
        } else {

            // *** Case 1
            // State: Clip selected indeed exists; stateMap.audio then must exist
            // Action: Check if it is the same clip from before
            var sound = soundManager.getSoundById($player.attr('data-clip-url'));

            // Case 1a: this is the same clip
            // In this case audio, url, and $player are identical so simply toggle the playing state
            if(stateMap.audio.id !== sound.id){
                // Case 1b: this is a different clip
                // Pause previously playing clip
                stateMap.audio.pause();

                //update the stateMap to reflect the new object
                stateMap.audio = sound;
                stateMap.url = sound.id;
                setJqueryMap($player);
            }

            togglePlayer();
        }

        console.log(stateMap.url);


    };
    //------------------- END PUBLIC METHODS -------------------

    window.addEventListener('load', initModule, false);

    return {
        onClickPlayer: onClickPlayer
    };
}());

module.exports = audio;

