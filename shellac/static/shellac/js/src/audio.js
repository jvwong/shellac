/*
 * audio.js
 * Web Audio API methods
*/
/* global $, window, AudioContext, XMLHttpRequest */
'use strict';

var audio = (function () {

    //---------------- BEGIN MODULE DEPENDENCIES --------------

    //---------------- END MODULE DEPENDENCIES --------------

    //---------------- BEGIN MODULE SCOPE VARIABLES --------------
    var context,

    configMap = {
    },

    stateMap = {
        context: undefined
    },

    initModule,
    retrieve,
    enable;

    //---------------- END MODULE SCOPE VARIABLES --------------

   //--------------------- BEGIN MODULE SCOPE METHODS --------------------
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
    retrieve = function(context, url, sucessCallback, onError){

        var request = new XMLHttpRequest();
        request.open('GET', url, true);
        request.responseType = 'arraybuffer';

        request.onprogress = function(pe) {
            if(pe.lengthComputable) {
//                progressBar.max = pe.total;
//                progressBar.value = pe.loaded;
                console.log(pe.loaded);
                console.log(pe.total);
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
                sucessCallback(buffer);
            }, onError);
        };
        request.send();
    };
    //--------------------- END MODULE SCOPE METHODS --------------------


    //------------------- BEGIN PUBLIC METHODS -------------------
    // Begin Public method /enable/
    // Example   :  enable(event)
    // Purpose   : Add control methods for Web Audio API to the passed jQuery event objects
    // Arguments :
    //  * event: a jquery event object passed from click event
    // Action    : Extracts the data from the given element and enables audio playback capability
    // Returns   : none
    // Throws    : error if audio content is not decoded or available
    enable = function(event){

        var url = $(event.target).parent().attr('data-clip-url');

        function onError(error){
            console.log("Error decoding file data %s", error);
        }

        function onSuccess(buffer){
            //create a sound source
            var source = stateMap.context.createBufferSource();

            //tell the source which sound to play
            source.buffer = buffer;

            //connect the source to the context's destination (the speakers)
            source.connect(stateMap.context.destination);

            source.loop = true;

//            source.start(0);
        }

        retrieve(stateMap.context, url, onSuccess, onError);
    };

    // Begin Public method /initModule/
    // Example   : audio.initModule();
    // Purpose   :
    //   Sets up the Audio API context or reports errors
    // Arguments : none
    // Action    : searches and adds the correct AudioContext object to the global window
    // Returns   : none
    // Throws    : none
    initModule = function(){
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

    window.addEventListener('load', initModule, false);

    return {
        enable: enable
    };
}());

module.exports = audio;

