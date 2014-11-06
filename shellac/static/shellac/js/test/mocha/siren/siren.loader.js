/*
 * siren.loader.js
 */
/* global document, window, siren */

'use strict';
siren.loader = (function () {

    //BEGIN module scope variable declaration
    var loadBuffer,
        load,
        initModule,

    configMap = {
        context     : undefined,
        urlList     : undefined,
        onload      : undefined,
        bufferList  : [],
        loadCount   : 0
    };
    //END module scope objects
    loadBuffer = function (url, index) {

        var type, success, haha;

        type = "arraybuffer";
        success = function (xhr) {
            configMap.context.decodeAudioData(
                xhr.response, //'this' will refer to xhr
                function (buffer) {
                    if (!buffer) {
                        console.warn('loadBuffer: Error decoding file data: ' + url);
                        return;
                    }
                    configMap.bufferList[index] = buffer;
                    if ( ++configMap.loadCount === configMap.urlList.length ) {
                        configMap.onload(configMap.bufferList);
                    }

                },
                function (error) {
                    console.error('loadBuffer: decodeAudioData error', error);
                }
            );
        };

        util.fetchUrlXHR(url, type, success);
    };


    load = function () {
        for (var i = 0; i < configMap.urlList.length; ++i) {
            loadBuffer(configMap.urlList[i], i);
        }
    };

    /**
    * initModule
    * @param spec object with properties
    *  context AudioContext object
    *  urlList Array of urls
    *  callback function callback
    **/
    initModule = function(spec) {
        if( !spec.hasOwnProperty('context') || !spec.hasOwnProperty('urlList') ||
            !spec.hasOwnProperty('callback') || !util.isArray(spec.urlList)){
            return false;
        }
        configMap.context = spec.context ;
        configMap.urlList = spec.urlList;
        configMap.onload = spec.callback;
        return true;
    };

    return {
        initModule  : initModule,
        load        : load
    };
}());
