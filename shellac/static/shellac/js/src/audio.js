/*
 * audio.js
 * Web Audio API methods
*/
/* global $, window, AudioContext, XMLHttpRequest */
'use strict';

var audio = (function () {

    //---------------- BEGIN MODULE DEPENDENCIES --------------
    var util = require('./util.js');

    //---------------- END MODULE DEPENDENCIES --------------

    //---------------- BEGIN MODULE SCOPE VARIABLES --------------
    var context,

    configMap = {
    },

    stateMap = {
        source: undefined,
        context: undefined,
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
    onRetrieveError, makeSource,
    play, pause,
    retrieve;

    //---------------- END MODULE SCOPE VARIABLES --------------

   //--------------------- BEGIN MODULE SCOPE METHODS --------------------

    setJqueryMap = function($player){
        jqueryMap.$player  = $player;
    };


    // Begin Private method /retrieve/
    // Example   :  retrieve('/path/to/sound', onLoadAudioData)
    // Purpose   : Retrieve the given audio data from the url and fire the callback upon completion
    // Arguments :
    //  * context - the valid browser AudioContext object
    //  * url - a valid url to an audio resource
    //  * sucessCallback - callback function in the event of successful data transfer; takes arraybuffer
    //  * errorCallback - callback function in the event of unsuccessful data transfer; takes error object
    // Action    : Ajax request from the url and passes to callback which take an arraybuffer object
    // Returns   : none
    // Throws    : error if audio content is not decoded or available
    retrieve = function(context, url, onError){

        var request = new XMLHttpRequest();
        request.open('GET', url, true);
        request.responseType = 'arraybuffer';

        request.onprogress = function(pe) {
            if(pe.lengthComputable) {
//                progressBar.max = pe.total;
//                progressBar.value = pe.loaded;
//                console.log(pe.loaded);
//                console.log(pe.total);
            }
        };

        request.onload = function(pe){
            // method: decodeAudioData
            // positional arguments: binary data, callback on success, error callback
            context.decodeAudioData(request.response, function(buffer){
                if(!buffer){
                    console.log('Error decoding file data');
                    return;
                }
                stateMap.source = stateMap.context.createBufferSource();
                stateMap.source.buffer = buffer;
                stateMap.source.connect(stateMap.context.destination);
                stateMap.source.start(0);
                stateMap.isPlaying = true;
            }, function (error){
                console.log("Error decoding file data %s", error);
            });
        };
        request.send();
    };

    makeSource = function (buffer){
        //create a sound source
        stateMap.source = stateMap.context.createBufferSource();
        //tell the stateMap.source which sound to play
        stateMap.source.buffer = buffer;
        //connect the source to the context's destination (the speakers)
        stateMap.source.connect(stateMap.context.destination);
        console.log('finished makesource');
    };

    togglePlayer = function(isPlaying){
        if(!isPlaying){
            console.log("start playing: %s", stateMap.url);
            play();
            return !isPlaying;
        }

        console.log("stopping: %s", stateMap.url);
        pause();
        return !isPlaying;
    };


    // Begin private method /play/
    // Example   : play();
    // Purpose   :
    //   Resumes / plays the audio clip from the last paused state or the start
    // Arguments : none
    // Action    : activates the audio player
    // Returns   : none
    // Throws    : none
    play = function(){
        console.log('play');

        stateMap.startTime = stateMap.context.currentTime;
        makeSource(stateMap.source.buffer);
        stateMap.source.start(0, stateMap.startOffset % stateMap.source.buffer.duration);
    };

    // Begin private method /pause/
    // Example   : pause();
    // Purpose   :
    //   Stops the audio clip at the given state
    // Arguments : none
    // Action    : deactivates the audio player
    // Returns   : none
    // Throws    : none
    pause = function(){
        stateMap.source.stop();
        //measure how much time has passed since the last pause
        stateMap.startOffset += stateMap.context.currentTime - stateMap.startTime;
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
        var contextClass;
        // Fix up for prefixing
        contextClass= (
            window.AudioContext ||
            window.webkitAudioContext ||
            window.mozAudioContext ||
            window.oAudioContext ||
            window.msAudioContext);

        if(contextClass){
            stateMap.context = new contextClass();
        } else {
            console.log("WebAudio API is not available");
        }
    };
    //--------------------- END MODULE SCOPE METHODS --------------------

    //------------------- BEGIN PUBLIC METHODS -------------------
    onClickPlayer = function($player){
        var enteringUrl = $player.attr('data-clip-url');

        console.log("enteringUrl: %s", enteringUrl);
        console.log("stateMap.url: %s", stateMap.url);

        //If we click the same clip, continue state
        if(enteringUrl !== stateMap.url){
            //assign the new url and reset playing state
            stateMap.url = enteringUrl;
            stateMap.isPlaying = false;
            stateMap.startTime = 0;
            stateMap.startOffset = 0;
            if(stateMap.source){
                stateMap.source.disconnect();
                stateMap.source = null;
            }
            //this is async
            retrieve(stateMap.context, stateMap.url, onRetrieveError);
        } else {
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

