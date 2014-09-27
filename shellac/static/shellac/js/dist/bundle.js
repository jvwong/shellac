(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({"/home/jvwong/Projects/shellac/shellac.no-ip.ca/source/shellac/static/shellac/js/lib/soundmanager2/script/soundmanager2.js":[function(require,module,exports){
/** @license
 *
 * SoundManager 2: JavaScript Sound for the Web
 * ----------------------------------------------
 * http://schillmania.com/projects/soundmanager2/
 *
 * Copyright (c) 2007, Scott Schiller. All rights reserved.
 * Code provided under the BSD License:
 * http://schillmania.com/projects/soundmanager2/license.txt
 *
 * V2.97a.20140901
 */

/*global window, SM2_DEFER, sm2Debugger, console, document, navigator, setTimeout, setInterval, clearInterval, Audio, opera, module, define */
/*jslint regexp: true, sloppy: true, white: true, nomen: true, plusplus: true, todo: true */

/**
 * About this file
 * -------------------------------------------------------------------------------------
 * This is the fully-commented source version of the SoundManager 2 API,
 * recommended for use during development and testing.
 *
 * See soundmanager2-nodebug-jsmin.js for an optimized build (~11KB with gzip.)
 * http://schillmania.com/projects/soundmanager2/doc/getstarted/#basic-inclusion
 * Alternately, serve this file with gzip for 75% compression savings (~30KB over HTTP.)
 *
 * You may notice <d> and </d> comments in this source; these are delimiters for
 * debug blocks which are removed in the -nodebug builds, further optimizing code size.
 *
 * Also, as you may note: Whoa, reliable cross-platform/device audio support is hard! ;)
 */

(function(window, _undefined) {

"use strict";

if (!window || !window.document) {

  // Don't cross the [environment] streams. SM2 expects to be running in a browser, not under node.js etc.
  // Additionally, if a browser somehow manages to fail this test, as Egon said: "It would be bad."

  throw new Error('SoundManager requires a browser with window and document objects.');

}

var soundManager = null;

/**
 * The SoundManager constructor.
 *
 * @constructor
 * @param {string} smURL Optional: Path to SWF files
 * @param {string} smID Optional: The ID to use for the SWF container element
 * @this {SoundManager}
 * @return {SoundManager} The new SoundManager instance
 */

function SoundManager(smURL, smID) {

  /**
   * soundManager configuration options list
   * defines top-level configuration properties to be applied to the soundManager instance (eg. soundManager.flashVersion)
   * to set these properties, use the setup() method - eg., soundManager.setup({url: '/swf/', flashVersion: 9})
   */

  this.setupOptions = {

    'url': (smURL || null),             // path (directory) where SoundManager 2 SWFs exist, eg., /path/to/swfs/
    'flashVersion': 8,                  // flash build to use (8 or 9.) Some API features require 9.
    'debugMode': true,                  // enable debugging output (console.log() with HTML fallback)
    'debugFlash': false,                // enable debugging output inside SWF, troubleshoot Flash/browser issues
    'useConsole': true,                 // use console.log() if available (otherwise, writes to #soundmanager-debug element)
    'consoleOnly': true,                // if console is being used, do not create/write to #soundmanager-debug
    'waitForWindowLoad': false,         // force SM2 to wait for window.onload() before trying to call soundManager.onload()
    'bgColor': '#ffffff',               // SWF background color. N/A when wmode = 'transparent'
    'useHighPerformance': false,        // position:fixed flash movie can help increase js/flash speed, minimize lag
    'flashPollingInterval': null,       // msec affecting whileplaying/loading callback frequency. If null, default of 50 msec is used.
    'html5PollingInterval': null,       // msec affecting whileplaying() for HTML5 audio, excluding mobile devices. If null, native HTML5 update events are used.
    'flashLoadTimeout': 1000,           // msec to wait for flash movie to load before failing (0 = infinity)
    'wmode': null,                      // flash rendering mode - null, 'transparent', or 'opaque' (last two allow z-index to work)
    'allowScriptAccess': 'always',      // for scripting the SWF (object/embed property), 'always' or 'sameDomain'
    'useFlashBlock': false,             // *requires flashblock.css, see demos* - allow recovery from flash blockers. Wait indefinitely and apply timeout CSS to SWF, if applicable.
    'useHTML5Audio': true,              // use HTML5 Audio() where API is supported (most Safari, Chrome versions), Firefox (no MP3/MP4.) Ideally, transparent vs. Flash API where possible.
    'html5Test': /^(probably|maybe)$/i, // HTML5 Audio() format support test. Use /^probably$/i; if you want to be more conservative.
    'preferFlash': false,               // overrides useHTML5audio, will use Flash for MP3/MP4/AAC if present. Potential option if HTML5 playback with these formats is quirky.
    'noSWFCache': false,                // if true, appends ?ts={date} to break aggressive SWF caching.
    'idPrefix': 'sound'                 // if an id is not provided to createSound(), this prefix is used for generated IDs - 'sound0', 'sound1' etc.

  };

  this.defaultOptions = {

    /**
     * the default configuration for sound objects made with createSound() and related methods
     * eg., volume, auto-load behaviour and so forth
     */

    'autoLoad': false,        // enable automatic loading (otherwise .load() will be called on demand with .play(), the latter being nicer on bandwidth - if you want to .load yourself, you also can)
    'autoPlay': false,        // enable playing of file as soon as possible (much faster if "stream" is true)
    'from': null,             // position to start playback within a sound (msec), default = beginning
    'loops': 1,               // how many times to repeat the sound (position will wrap around to 0, setPosition() will break out of loop when >0)
    'onid3': null,            // callback function for "ID3 data is added/available"
    'onload': null,           // callback function for "load finished"
    'whileloading': null,     // callback function for "download progress update" (X of Y bytes received)
    'onplay': null,           // callback for "play" start
    'onpause': null,          // callback for "pause"
    'onresume': null,         // callback for "resume" (pause toggle)
    'whileplaying': null,     // callback during play (position update)
    'onposition': null,       // object containing times and function callbacks for positions of interest
    'onstop': null,           // callback for "user stop"
    'onfailure': null,        // callback function for when playing fails
    'onfinish': null,         // callback function for "sound finished playing"
    'multiShot': true,        // let sounds "restart" or layer on top of each other when played multiple times, rather than one-shot/one at a time
    'multiShotEvents': false, // fire multiple sound events (currently onfinish() only) when multiShot is enabled
    'position': null,         // offset (milliseconds) to seek to within loaded sound data.
    'pan': 0,                 // "pan" settings, left-to-right, -100 to 100
    'stream': true,           // allows playing before entire file has loaded (recommended)
    'to': null,               // position to end playback within a sound (msec), default = end
    'type': null,             // MIME-like hint for file pattern / canPlay() tests, eg. audio/mp3
    'usePolicyFile': false,   // enable crossdomain.xml request for audio on remote domains (for ID3/waveform access)
    'volume': 100             // self-explanatory. 0-100, the latter being the max.

  };

  this.flash9Options = {

    /**
     * flash 9-only options,
     * merged into defaultOptions if flash 9 is being used
     */

    'isMovieStar': null,      // "MovieStar" MPEG4 audio mode. Null (default) = auto detect MP4, AAC etc. based on URL. true = force on, ignore URL
    'usePeakData': false,     // enable left/right channel peak (level) data
    'useWaveformData': false, // enable sound spectrum (raw waveform data) - NOTE: May increase CPU load.
    'useEQData': false,       // enable sound EQ (frequency spectrum data) - NOTE: May increase CPU load.
    'onbufferchange': null,   // callback for "isBuffering" property change
    'ondataerror': null       // callback for waveform/eq data access error (flash playing audio in other tabs/domains)

  };

  this.movieStarOptions = {

    /**
     * flash 9.0r115+ MPEG4 audio options,
     * merged into defaultOptions if flash 9+movieStar mode is enabled
     */

    'bufferTime': 3,          // seconds of data to buffer before playback begins (null = flash default of 0.1 seconds - if AAC playback is gappy, try increasing.)
    'serverURL': null,        // rtmp: FMS or FMIS server to connect to, required when requesting media via RTMP or one of its variants
    'onconnect': null,        // rtmp: callback for connection to flash media server
    'duration': null          // rtmp: song duration (msec)

  };

  this.audioFormats = {

    /**
     * determines HTML5 support + flash requirements.
     * if no support (via flash and/or HTML5) for a "required" format, SM2 will fail to start.
     * flash fallback is used for MP3 or MP4 if HTML5 can't play it (or if preferFlash = true)
     */

    'mp3': {
      'type': ['audio/mpeg; codecs="mp3"', 'audio/mpeg', 'audio/mp3', 'audio/MPA', 'audio/mpa-robust'],
      'required': true
    },

    'mp4': {
      'related': ['aac','m4a','m4b'], // additional formats under the MP4 container
      'type': ['audio/mp4; codecs="mp4a.40.2"', 'audio/aac', 'audio/x-m4a', 'audio/MP4A-LATM', 'audio/mpeg4-generic'],
      'required': false
    },

    'ogg': {
      'type': ['audio/ogg; codecs=vorbis'],
      'required': false
    },

    'opus': {
      'type': ['audio/ogg; codecs=opus', 'audio/opus'],
      'required': false
    },

    'wav': {
      'type': ['audio/wav; codecs="1"', 'audio/wav', 'audio/wave', 'audio/x-wav'],
      'required': false
    }

  };

  // HTML attributes (id + class names) for the SWF container

  this.movieID = 'sm2-container';
  this.id = (smID || 'sm2movie');

  this.debugID = 'soundmanager-debug';
  this.debugURLParam = /([#?&])debug=1/i;

  // dynamic attributes

  this.versionNumber = 'V2.97a.20140901';
  this.version = null;
  this.movieURL = null;
  this.altURL = null;
  this.swfLoaded = false;
  this.enabled = false;
  this.oMC = null;
  this.sounds = {};
  this.soundIDs = [];
  this.muted = false;
  this.didFlashBlock = false;
  this.filePattern = null;

  this.filePatterns = {

    'flash8': /\.mp3(\?.*)?$/i,
    'flash9': /\.mp3(\?.*)?$/i

  };

  // support indicators, set at init

  this.features = {

    'buffering': false,
    'peakData': false,
    'waveformData': false,
    'eqData': false,
    'movieStar': false

  };

  // flash sandbox info, used primarily in troubleshooting

  this.sandbox = {

    // <d>
    'type': null,
    'types': {
      'remote': 'remote (domain-based) rules',
      'localWithFile': 'local with file access (no internet access)',
      'localWithNetwork': 'local with network (internet access only, no local access)',
      'localTrusted': 'local, trusted (local+internet access)'
    },
    'description': null,
    'noRemote': null,
    'noLocal': null
    // </d>

  };

  /**
   * format support (html5/flash)
   * stores canPlayType() results based on audioFormats.
   * eg. { mp3: boolean, mp4: boolean }
   * treat as read-only.
   */

  this.html5 = {
    'usingFlash': null // set if/when flash fallback is needed
  };

  // file type support hash
  this.flash = {};

  // determined at init time
  this.html5Only = false;

  // used for special cases (eg. iPad/iPhone/palm OS?)
  this.ignoreFlash = false;

  /**
   * a few private internals (OK, a lot. :D)
   */

  var SMSound,
  sm2 = this, globalHTML5Audio = null, flash = null, sm = 'soundManager', smc = sm + ': ', h5 = 'HTML5::', id, ua = navigator.userAgent, wl = window.location.href.toString(), doc = document, doNothing, setProperties, init, fV, on_queue = [], debugOpen = true, debugTS, didAppend = false, appendSuccess = false, didInit = false, disabled = false, windowLoaded = false, _wDS, wdCount = 0, initComplete, mixin, assign, extraOptions, addOnEvent, processOnEvents, initUserOnload, delayWaitForEI, waitForEI, rebootIntoHTML5, setVersionInfo, handleFocus, strings, initMovie, preInit, domContentLoaded, winOnLoad, didDCLoaded, getDocument, createMovie, catchError, setPolling, initDebug, debugLevels = ['log', 'info', 'warn', 'error'], defaultFlashVersion = 8, disableObject, failSafely, normalizeMovieURL, oRemoved = null, oRemovedHTML = null, str, flashBlockHandler, getSWFCSS, swfCSS, toggleDebug, loopFix, policyFix, complain, idCheck, waitingForEI = false, initPending = false, startTimer, stopTimer, timerExecute, h5TimerCount = 0, h5IntervalTimer = null, parseURL, messages = [],
  canIgnoreFlash, needsFlash = null, featureCheck, html5OK, html5CanPlay, html5Ext, html5Unload, domContentLoadedIE, testHTML5, event, slice = Array.prototype.slice, useGlobalHTML5Audio = false, lastGlobalHTML5URL, hasFlash, detectFlash, badSafariFix, html5_events, showSupport, flushMessages, wrapCallback, idCounter = 0,
  is_iDevice = ua.match(/(ipad|iphone|ipod)/i), isAndroid = ua.match(/android/i), isIE = ua.match(/msie/i), isWebkit = ua.match(/webkit/i), isSafari = (ua.match(/safari/i) && !ua.match(/chrome/i)), isOpera = (ua.match(/opera/i)),
  mobileHTML5 = (ua.match(/(mobile|pre\/|xoom)/i) || is_iDevice || isAndroid),
  isBadSafari = (!wl.match(/usehtml5audio/i) && !wl.match(/sm2\-ignorebadua/i) && isSafari && !ua.match(/silk/i) && ua.match(/OS X 10_6_([3-7])/i)), // Safari 4 and 5 (excluding Kindle Fire, "Silk") occasionally fail to load/play HTML5 audio on Snow Leopard 10.6.3 through 10.6.7 due to bug(s) in QuickTime X and/or other underlying frameworks. :/ Confirmed bug. https://bugs.webkit.org/show_bug.cgi?id=32159
  hasConsole = (window.console !== _undefined && console.log !== _undefined), isFocused = (doc.hasFocus !== _undefined?doc.hasFocus():null), tryInitOnFocus = (isSafari && (doc.hasFocus === _undefined || !doc.hasFocus())), okToDisable = !tryInitOnFocus, flashMIME = /(mp3|mp4|mpa|m4a|m4b)/i, msecScale = 1000,
  emptyURL = 'about:blank', // safe URL to unload, or load nothing from (flash 8 + most HTML5 UAs)
  emptyWAV = 'data:audio/wave;base64,/UklGRiYAAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YQIAAAD//w==', // tiny WAV for HTML5 unloading
  overHTTP = (doc.location?doc.location.protocol.match(/http/i):null),
  http = (!overHTTP ? 'http:/'+'/' : ''),
  // mp3, mp4, aac etc.
  netStreamMimeTypes = /^\s*audio\/(?:x-)?(?:mpeg4|aac|flv|mov|mp4||m4v|m4a|m4b|mp4v|3gp|3g2)\s*(?:$|;)/i,
  // Flash v9.0r115+ "moviestar" formats
  netStreamTypes = ['mpeg4', 'aac', 'flv', 'mov', 'mp4', 'm4v', 'f4v', 'm4a', 'm4b', 'mp4v', '3gp', '3g2'],
  netStreamPattern = new RegExp('\\.(' + netStreamTypes.join('|') + ')(\\?.*)?$', 'i');

  this.mimePattern = /^\s*audio\/(?:x-)?(?:mp(?:eg|3))\s*(?:$|;)/i; // default mp3 set

  // use altURL if not "online"
  this.useAltURL = !overHTTP;

  swfCSS = {

    'swfBox': 'sm2-object-box',
    'swfDefault': 'movieContainer',
    'swfError': 'swf_error', // SWF loaded, but SM2 couldn't start (other error)
    'swfTimedout': 'swf_timedout',
    'swfLoaded': 'swf_loaded',
    'swfUnblocked': 'swf_unblocked', // or loaded OK
    'sm2Debug': 'sm2_debug',
    'highPerf': 'high_performance',
    'flashDebug': 'flash_debug'

  };

  /**
   * basic HTML5 Audio() support test
   * try...catch because of IE 9 "not implemented" nonsense
   * https://github.com/Modernizr/Modernizr/issues/224
   */

  this.hasHTML5 = (function() {
    try {
      // new Audio(null) for stupid Opera 9.64 case, which throws not_enough_arguments exception otherwise.
      return (Audio !== _undefined && (isOpera && opera !== _undefined && opera.version() < 10 ? new Audio(null) : new Audio()).canPlayType !== _undefined);
    } catch(e) {
      return false;
    }
  }());

  /**
   * Public SoundManager API
   * -----------------------
   */

  /**
   * Configures top-level soundManager properties.
   *
   * @param {object} options Option parameters, eg. { flashVersion: 9, url: '/path/to/swfs/' }
   * onready and ontimeout are also accepted parameters. call soundManager.setup() to see the full list.
   */

  this.setup = function(options) {

    var noURL = (!sm2.url);

    // warn if flash options have already been applied

    if (options !== _undefined && didInit && needsFlash && sm2.ok() && (options.flashVersion !== _undefined || options.url !== _undefined || options.html5Test !== _undefined)) {
      complain(str('setupLate'));
    }

    // TODO: defer: true?

    assign(options);

    // special case 1: "Late setup". SM2 loaded normally, but user didn't assign flash URL eg., setup({url:...}) before SM2 init. Treat as delayed init.

    if (options) {

      if (noURL && didDCLoaded && options.url !== _undefined) {
        sm2.beginDelayedInit();
      }

      // special case 2: If lazy-loading SM2 (DOMContentLoaded has already happened) and user calls setup() with url: parameter, try to init ASAP.

      if (!didDCLoaded && options.url !== _undefined && doc.readyState === 'complete') {
        setTimeout(domContentLoaded, 1);
      }

    }

    return sm2;

  };

  this.ok = function() {

    return (needsFlash ? (didInit && !disabled) : (sm2.useHTML5Audio && sm2.hasHTML5));

  };

  this.supported = this.ok; // legacy

  this.getMovie = function(smID) {

    // safety net: some old browsers differ on SWF references, possibly related to ExternalInterface / flash version
    return id(smID) || doc[smID] || window[smID];

  };

  /**
   * Creates a SMSound sound object instance.
   *
   * @param {object} oOptions Sound options (at minimum, id and url parameters are required.)
   * @return {object} SMSound The new SMSound object.
   */

  this.createSound = function(oOptions, _url) {

    var cs, cs_string, options, oSound = null;

    // <d>
    cs = sm + '.createSound(): ';
    cs_string = cs + str(!didInit?'notReady':'notOK');
    // </d>

    if (!didInit || !sm2.ok()) {
      complain(cs_string);
      return false;
    }

    if (_url !== _undefined) {
      // function overloading in JS! :) ..assume simple createSound(id, url) use case
      oOptions = {
        'id': oOptions,
        'url': _url
      };
    }

    // inherit from defaultOptions
    options = mixin(oOptions);

    options.url = parseURL(options.url);

    // generate an id, if needed.
    if (options.id === undefined) {
      options.id = sm2.setupOptions.idPrefix + (idCounter++);
    }

    // <d>
    if (options.id.toString().charAt(0).match(/^[0-9]$/)) {
      sm2._wD(cs + str('badID', options.id), 2);
    }

    sm2._wD(cs + options.id + (options.url ? ' (' + options.url + ')' : ''), 1);
    // </d>

    if (idCheck(options.id, true)) {
      sm2._wD(cs + options.id + ' exists', 1);
      return sm2.sounds[options.id];
    }

    function make() {

      options = loopFix(options);
      sm2.sounds[options.id] = new SMSound(options);
      sm2.soundIDs.push(options.id);
      return sm2.sounds[options.id];

    }

    if (html5OK(options)) {

      oSound = make();
      sm2._wD(options.id + ': Using HTML5');
      oSound._setup_html5(options);

    } else {

      if (sm2.html5Only) {
        sm2._wD(options.id + ': No HTML5 support for this sound, and no Flash. Exiting.');
        return make();
      }

      // TODO: Move HTML5/flash checks into generic URL parsing/handling function.

      if (sm2.html5.usingFlash && options.url && options.url.match(/data\:/i)) {
        // data: URIs not supported by Flash, either.
        sm2._wD(options.id + ': data: URIs not supported via Flash. Exiting.');
        return make();
      }

      if (fV > 8) {
        if (options.isMovieStar === null) {
          // attempt to detect MPEG-4 formats
          options.isMovieStar = !!(options.serverURL || (options.type ? options.type.match(netStreamMimeTypes) : false) || (options.url && options.url.match(netStreamPattern)));
        }
        // <d>
        if (options.isMovieStar) {
          sm2._wD(cs + 'using MovieStar handling');
          if (options.loops > 1) {
            _wDS('noNSLoop');
          }
        }
        // </d>
      }

      options = policyFix(options, cs);
      oSound = make();

      if (fV === 8) {
        flash._createSound(options.id, options.loops||1, options.usePolicyFile);
      } else {
        flash._createSound(options.id, options.url, options.usePeakData, options.useWaveformData, options.useEQData, options.isMovieStar, (options.isMovieStar?options.bufferTime:false), options.loops||1, options.serverURL, options.duration||null, options.autoPlay, true, options.autoLoad, options.usePolicyFile);
        if (!options.serverURL) {
          // We are connected immediately
          oSound.connected = true;
          if (options.onconnect) {
            options.onconnect.apply(oSound);
          }
        }
      }

      if (!options.serverURL && (options.autoLoad || options.autoPlay)) {
        // call load for non-rtmp streams
        oSound.load(options);
      }

    }

    // rtmp will play in onconnect
    if (!options.serverURL && options.autoPlay) {
      oSound.play();
    }

    return oSound;

  };

  /**
   * Destroys a SMSound sound object instance.
   *
   * @param {string} sID The ID of the sound to destroy
   */

  this.destroySound = function(sID, _bFromSound) {

    // explicitly destroy a sound before normal page unload, etc.

    if (!idCheck(sID)) {
      return false;
    }

    var oS = sm2.sounds[sID], i;

    // Disable all callbacks while the sound is being destroyed
    oS._iO = {};

    oS.stop();
    oS.unload();

    for (i = 0; i < sm2.soundIDs.length; i++) {
      if (sm2.soundIDs[i] === sID) {
        sm2.soundIDs.splice(i, 1);
        break;
      }
    }

    if (!_bFromSound) {
      // ignore if being called from SMSound instance
      oS.destruct(true);
    }

    oS = null;
    delete sm2.sounds[sID];

    return true;

  };

  /**
   * Calls the load() method of a SMSound object by ID.
   *
   * @param {string} sID The ID of the sound
   * @param {object} oOptions Optional: Sound options
   */

  this.load = function(sID, oOptions) {

    if (!idCheck(sID)) {
      return false;
    }
    return sm2.sounds[sID].load(oOptions);

  };

  /**
   * Calls the unload() method of a SMSound object by ID.
   *
   * @param {string} sID The ID of the sound
   */

  this.unload = function(sID) {

    if (!idCheck(sID)) {
      return false;
    }
    return sm2.sounds[sID].unload();

  };

  /**
   * Calls the onPosition() method of a SMSound object by ID.
   *
   * @param {string} sID The ID of the sound
   * @param {number} nPosition The position to watch for
   * @param {function} oMethod The relevant callback to fire
   * @param {object} oScope Optional: The scope to apply the callback to
   * @return {SMSound} The SMSound object
   */

  this.onPosition = function(sID, nPosition, oMethod, oScope) {

    if (!idCheck(sID)) {
      return false;
    }
    return sm2.sounds[sID].onposition(nPosition, oMethod, oScope);

  };

  // legacy/backwards-compability: lower-case method name
  this.onposition = this.onPosition;

  /**
   * Calls the clearOnPosition() method of a SMSound object by ID.
   *
   * @param {string} sID The ID of the sound
   * @param {number} nPosition The position to watch for
   * @param {function} oMethod Optional: The relevant callback to fire
   * @return {SMSound} The SMSound object
   */

  this.clearOnPosition = function(sID, nPosition, oMethod) {

    if (!idCheck(sID)) {
      return false;
    }
    return sm2.sounds[sID].clearOnPosition(nPosition, oMethod);

  };

  /**
   * Calls the play() method of a SMSound object by ID.
   *
   * @param {string} sID The ID of the sound
   * @param {object} oOptions Optional: Sound options
   * @return {SMSound} The SMSound object
   */

  this.play = function(sID, oOptions) {

    var result = null,
        // legacy function-overloading use case: play('mySound', '/path/to/some.mp3');
        overloaded = (oOptions && !(oOptions instanceof Object));

    if (!didInit || !sm2.ok()) {
      complain(sm + '.play(): ' + str(!didInit?'notReady':'notOK'));
      return false;
    }

    if (!idCheck(sID, overloaded)) {

      if (!overloaded) {
        // no sound found for the given ID. Bail.
        return false;
      }

      if (overloaded) {
        oOptions = {
          url: oOptions
        };
      }

      if (oOptions && oOptions.url) {
        // overloading use case, create+play: .play('someID', {url:'/path/to.mp3'});
        sm2._wD(sm + '.play(): Attempting to create "' + sID + '"', 1);
        oOptions.id = sID;
        result = sm2.createSound(oOptions).play();
      }

    } else if (overloaded) {

      // existing sound object case
      oOptions = {
        url: oOptions
      };

    }

    if (result === null) {
      // default case
      result = sm2.sounds[sID].play(oOptions);
    }

    return result;

  };

  this.start = this.play; // just for convenience

  /**
   * Calls the setPosition() method of a SMSound object by ID.
   *
   * @param {string} sID The ID of the sound
   * @param {number} nMsecOffset Position (milliseconds)
   * @return {SMSound} The SMSound object
   */

  this.setPosition = function(sID, nMsecOffset) {

    if (!idCheck(sID)) {
      return false;
    }
    return sm2.sounds[sID].setPosition(nMsecOffset);

  };

  /**
   * Calls the stop() method of a SMSound object by ID.
   *
   * @param {string} sID The ID of the sound
   * @return {SMSound} The SMSound object
   */

  this.stop = function(sID) {

    if (!idCheck(sID)) {
      return false;
    }

    sm2._wD(sm + '.stop(' + sID + ')', 1);
    return sm2.sounds[sID].stop();

  };

  /**
   * Stops all currently-playing sounds.
   */

  this.stopAll = function() {

    var oSound;
    sm2._wD(sm + '.stopAll()', 1);

    for (oSound in sm2.sounds) {
      if (sm2.sounds.hasOwnProperty(oSound)) {
        // apply only to sound objects
        sm2.sounds[oSound].stop();
      }
    }

  };

  /**
   * Calls the pause() method of a SMSound object by ID.
   *
   * @param {string} sID The ID of the sound
   * @return {SMSound} The SMSound object
   */

  this.pause = function(sID) {

    if (!idCheck(sID)) {
      return false;
    }
    return sm2.sounds[sID].pause();

  };

  /**
   * Pauses all currently-playing sounds.
   */

  this.pauseAll = function() {

    var i;
    for (i = sm2.soundIDs.length-1; i >= 0; i--) {
      sm2.sounds[sm2.soundIDs[i]].pause();
    }

  };

  /**
   * Calls the resume() method of a SMSound object by ID.
   *
   * @param {string} sID The ID of the sound
   * @return {SMSound} The SMSound object
   */

  this.resume = function(sID) {

    if (!idCheck(sID)) {
      return false;
    }
    return sm2.sounds[sID].resume();

  };

  /**
   * Resumes all currently-paused sounds.
   */

  this.resumeAll = function() {

    var i;
    for (i = sm2.soundIDs.length-1; i >= 0; i--) {
      sm2.sounds[sm2.soundIDs[i]].resume();
    }

  };

  /**
   * Calls the togglePause() method of a SMSound object by ID.
   *
   * @param {string} sID The ID of the sound
   * @return {SMSound} The SMSound object
   */

  this.togglePause = function(sID) {

    if (!idCheck(sID)) {
      return false;
    }
    return sm2.sounds[sID].togglePause();

  };

  /**
   * Calls the setPan() method of a SMSound object by ID.
   *
   * @param {string} sID The ID of the sound
   * @param {number} nPan The pan value (-100 to 100)
   * @return {SMSound} The SMSound object
   */

  this.setPan = function(sID, nPan) {

    if (!idCheck(sID)) {
      return false;
    }
    return sm2.sounds[sID].setPan(nPan);

  };

  /**
   * Calls the setVolume() method of a SMSound object by ID.
   *
   * @param {string} sID The ID of the sound
   * @param {number} nVol The volume value (0 to 100)
   * @return {SMSound} The SMSound object
   */

  this.setVolume = function(sID, nVol) {

    if (!idCheck(sID)) {
      return false;
    }
    return sm2.sounds[sID].setVolume(nVol);

  };

  /**
   * Calls the mute() method of either a single SMSound object by ID, or all sound objects.
   *
   * @param {string} sID Optional: The ID of the sound (if omitted, all sounds will be used.)
   */

  this.mute = function(sID) {

    var i = 0;

    if (sID instanceof String) {
      sID = null;
    }

    if (!sID) {

      sm2._wD(sm + '.mute(): Muting all sounds');
      for (i = sm2.soundIDs.length-1; i >= 0; i--) {
        sm2.sounds[sm2.soundIDs[i]].mute();
      }
      sm2.muted = true;

    } else {

      if (!idCheck(sID)) {
        return false;
      }
      sm2._wD(sm + '.mute(): Muting "' + sID + '"');
      return sm2.sounds[sID].mute();

    }

    return true;

  };

  /**
   * Mutes all sounds.
   */

  this.muteAll = function() {

    sm2.mute();

  };

  /**
   * Calls the unmute() method of either a single SMSound object by ID, or all sound objects.
   *
   * @param {string} sID Optional: The ID of the sound (if omitted, all sounds will be used.)
   */

  this.unmute = function(sID) {

    var i;

    if (sID instanceof String) {
      sID = null;
    }

    if (!sID) {

      sm2._wD(sm + '.unmute(): Unmuting all sounds');
      for (i = sm2.soundIDs.length-1; i >= 0; i--) {
        sm2.sounds[sm2.soundIDs[i]].unmute();
      }
      sm2.muted = false;

    } else {

      if (!idCheck(sID)) {
        return false;
      }
      sm2._wD(sm + '.unmute(): Unmuting "' + sID + '"');
      return sm2.sounds[sID].unmute();

    }

    return true;

  };

  /**
   * Unmutes all sounds.
   */

  this.unmuteAll = function() {

    sm2.unmute();

  };

  /**
   * Calls the toggleMute() method of a SMSound object by ID.
   *
   * @param {string} sID The ID of the sound
   * @return {SMSound} The SMSound object
   */

  this.toggleMute = function(sID) {

    if (!idCheck(sID)) {
      return false;
    }
    return sm2.sounds[sID].toggleMute();

  };

  /**
   * Retrieves the memory used by the flash plugin.
   *
   * @return {number} The amount of memory in use
   */

  this.getMemoryUse = function() {

    // flash-only
    var ram = 0;

    if (flash && fV !== 8) {
      ram = parseInt(flash._getMemoryUse(), 10);
    }

    return ram;

  };

  /**
   * Undocumented: NOPs soundManager and all SMSound objects.
   */

  this.disable = function(bNoDisable) {

    // destroy all functions
    var i;

    if (bNoDisable === _undefined) {
      bNoDisable = false;
    }

    if (disabled) {
      return false;
    }

    disabled = true;
    _wDS('shutdown', 1);

    for (i = sm2.soundIDs.length-1; i >= 0; i--) {
      disableObject(sm2.sounds[sm2.soundIDs[i]]);
    }

    // fire "complete", despite fail
    initComplete(bNoDisable);
    event.remove(window, 'load', initUserOnload);

    return true;

  };

  /**
   * Determines playability of a MIME type, eg. 'audio/mp3'.
   */

  this.canPlayMIME = function(sMIME) {

    var result;

    if (sm2.hasHTML5) {
      result = html5CanPlay({type:sMIME});
    }

    if (!result && needsFlash) {
      // if flash 9, test netStream (movieStar) types as well.
      result = (sMIME && sm2.ok() ? !!((fV > 8 ? sMIME.match(netStreamMimeTypes) : null) || sMIME.match(sm2.mimePattern)) : null); // TODO: make less "weird" (per JSLint)
    }

    return result;

  };

  /**
   * Determines playability of a URL based on audio support.
   *
   * @param {string} sURL The URL to test
   * @return {boolean} URL playability
   */

  this.canPlayURL = function(sURL) {

    var result;

    if (sm2.hasHTML5) {
      result = html5CanPlay({url: sURL});
    }

    if (!result && needsFlash) {
      result = (sURL && sm2.ok() ? !!(sURL.match(sm2.filePattern)) : null);
    }

    return result;

  };

  /**
   * Determines playability of an HTML DOM &lt;a&gt; object (or similar object literal) based on audio support.
   *
   * @param {object} oLink an HTML DOM &lt;a&gt; object or object literal including href and/or type attributes
   * @return {boolean} URL playability
   */

  this.canPlayLink = function(oLink) {

    if (oLink.type !== _undefined && oLink.type) {
      if (sm2.canPlayMIME(oLink.type)) {
        return true;
      }
    }

    return sm2.canPlayURL(oLink.href);

  };

  /**
   * Retrieves a SMSound object by ID.
   *
   * @param {string} sID The ID of the sound
   * @return {SMSound} The SMSound object
   */

  this.getSoundById = function(sID, _suppressDebug) {

    if (!sID) {
      return null;
    }

    var result = sm2.sounds[sID];

    // <d>
    if (!result && !_suppressDebug) {
      sm2._wD(sm + '.getSoundById(): Sound "' + sID + '" not found.', 2);
    }
    // </d>

    return result;

  };

  /**
   * Queues a callback for execution when SoundManager has successfully initialized.
   *
   * @param {function} oMethod The callback method to fire
   * @param {object} oScope Optional: The scope to apply to the callback
   */

  this.onready = function(oMethod, oScope) {

    var sType = 'onready',
        result = false;

    if (typeof oMethod === 'function') {

      // <d>
      if (didInit) {
        sm2._wD(str('queue', sType));
      }
      // </d>

      if (!oScope) {
        oScope = window;
      }

      addOnEvent(sType, oMethod, oScope);
      processOnEvents();

      result = true;

    } else {

      throw str('needFunction', sType);

    }

    return result;

  };

  /**
   * Queues a callback for execution when SoundManager has failed to initialize.
   *
   * @param {function} oMethod The callback method to fire
   * @param {object} oScope Optional: The scope to apply to the callback
   */

  this.ontimeout = function(oMethod, oScope) {

    var sType = 'ontimeout',
        result = false;

    if (typeof oMethod === 'function') {

      // <d>
      if (didInit) {
        sm2._wD(str('queue', sType));
      }
      // </d>

      if (!oScope) {
        oScope = window;
      }

      addOnEvent(sType, oMethod, oScope);
      processOnEvents({type:sType});

      result = true;

    } else {

      throw str('needFunction', sType);

    }

    return result;

  };

  /**
   * Writes console.log()-style debug output to a console or in-browser element.
   * Applies when debugMode = true
   *
   * @param {string} sText The console message
   * @param {object} nType Optional log level (number), or object. Number case: Log type/style where 0 = 'info', 1 = 'warn', 2 = 'error'. Object case: Object to be dumped.
   */

  this._writeDebug = function(sText, sTypeOrObject) {

    // pseudo-private console.log()-style output
    // <d>

    var sDID = 'soundmanager-debug', o, oItem;

    if (!sm2.debugMode) {
      return false;
    }

    if (hasConsole && sm2.useConsole) {
      if (sTypeOrObject && typeof sTypeOrObject === 'object') {
        // object passed; dump to console.
        console.log(sText, sTypeOrObject);
      } else if (debugLevels[sTypeOrObject] !== _undefined) {
        console[debugLevels[sTypeOrObject]](sText);
      } else {
        console.log(sText);
      }
      if (sm2.consoleOnly) {
        return true;
      }
    }

    o = id(sDID);

    if (!o) {
      return false;
    }

    oItem = doc.createElement('div');

    if (++wdCount % 2 === 0) {
      oItem.className = 'sm2-alt';
    }

    if (sTypeOrObject === _undefined) {
      sTypeOrObject = 0;
    } else {
      sTypeOrObject = parseInt(sTypeOrObject, 10);
    }

    oItem.appendChild(doc.createTextNode(sText));

    if (sTypeOrObject) {
      if (sTypeOrObject >= 2) {
        oItem.style.fontWeight = 'bold';
      }
      if (sTypeOrObject === 3) {
        oItem.style.color = '#ff3333';
      }
    }

    // top-to-bottom
    // o.appendChild(oItem);

    // bottom-to-top
    o.insertBefore(oItem, o.firstChild);

    o = null;
    // </d>

    return true;

  };

  // <d>
  // last-resort debugging option
  if (wl.indexOf('sm2-debug=alert') !== -1) {
    this._writeDebug = function(sText) {
      window.alert(sText);
    };
  }
  // </d>

  // alias
  this._wD = this._writeDebug;

  /**
   * Provides debug / state information on all SMSound objects.
   */

  this._debug = function() {

    // <d>
    var i, j;
    _wDS('currentObj', 1);

    for (i = 0, j = sm2.soundIDs.length; i < j; i++) {
      sm2.sounds[sm2.soundIDs[i]]._debug();
    }
    // </d>

  };

  /**
   * Restarts and re-initializes the SoundManager instance.
   *
   * @param {boolean} resetEvents Optional: When true, removes all registered onready and ontimeout event callbacks.
   * @param {boolean} excludeInit Options: When true, does not call beginDelayedInit() (which would restart SM2).
   * @return {object} soundManager The soundManager instance.
   */

  this.reboot = function(resetEvents, excludeInit) {

    // reset some (or all) state, and re-init unless otherwise specified.

    // <d>
    if (sm2.soundIDs.length) {
      sm2._wD('Destroying ' + sm2.soundIDs.length + ' SMSound object' + (sm2.soundIDs.length !== 1 ? 's' : '') + '...');
    }
    // </d>

    var i, j, k;

    for (i = sm2.soundIDs.length-1; i >= 0; i--) {
      sm2.sounds[sm2.soundIDs[i]].destruct();
    }

    // trash ze flash (remove from the DOM)

    if (flash) {

      try {

        if (isIE) {
          oRemovedHTML = flash.innerHTML;
        }

        oRemoved = flash.parentNode.removeChild(flash);

      } catch(e) {

        // Remove failed? May be due to flash blockers silently removing the SWF object/embed node from the DOM. Warn and continue.

        _wDS('badRemove', 2);

      }

    }

    // actually, force recreate of movie.

    oRemovedHTML = oRemoved = needsFlash = flash = null;

    sm2.enabled = didDCLoaded = didInit = waitingForEI = initPending = didAppend = appendSuccess = disabled = useGlobalHTML5Audio = sm2.swfLoaded = false;

    sm2.soundIDs = [];
    sm2.sounds = {};

    idCounter = 0;

    if (!resetEvents) {
      // reset callbacks for onready, ontimeout etc. so that they will fire again on re-init
      for (i in on_queue) {
        if (on_queue.hasOwnProperty(i)) {
          for (j = 0, k = on_queue[i].length; j < k; j++) {
            on_queue[i][j].fired = false;
          }
        }
      }
    } else {
      // remove all callbacks entirely
      on_queue = [];
    }

    // <d>
    if (!excludeInit) {
      sm2._wD(sm + ': Rebooting...');
    }
    // </d>

    // reset HTML5 and flash canPlay test results

    sm2.html5 = {
      'usingFlash': null
    };

    sm2.flash = {};

    // reset device-specific HTML/flash mode switches

    sm2.html5Only = false;
    sm2.ignoreFlash = false;

    window.setTimeout(function() {

      preInit();

      // by default, re-init

      if (!excludeInit) {
        sm2.beginDelayedInit();
      }

    }, 20);

    return sm2;

  };

  this.reset = function() {

    /**
     * Shuts down and restores the SoundManager instance to its original loaded state, without an explicit reboot. All onready/ontimeout handlers are removed.
     * After this call, SM2 may be re-initialized via soundManager.beginDelayedInit().
     * @return {object} soundManager The soundManager instance.
     */

    _wDS('reset');
    return sm2.reboot(true, true);

  };

  /**
   * Undocumented: Determines the SM2 flash movie's load progress.
   *
   * @return {number or null} Percent loaded, or if invalid/unsupported, null.
   */

  this.getMoviePercent = function() {

    /**
     * Interesting syntax notes...
     * Flash/ExternalInterface (ActiveX/NPAPI) bridge methods are not typeof "function" nor instanceof Function, but are still valid.
     * Additionally, JSLint dislikes ('PercentLoaded' in flash)-style syntax and recommends hasOwnProperty(), which does not work in this case.
     * Furthermore, using (flash && flash.PercentLoaded) causes IE to throw "object doesn't support this property or method".
     * Thus, 'in' syntax must be used.
     */

    return (flash && 'PercentLoaded' in flash ? flash.PercentLoaded() : null); // Yes, JSLint. See nearby comment in source for explanation.

  };

  /**
   * Additional helper for manually invoking SM2's init process after DOM Ready / window.onload().
   */

  this.beginDelayedInit = function() {

    windowLoaded = true;
    domContentLoaded();

    setTimeout(function() {

      if (initPending) {
        return false;
      }

      createMovie();
      initMovie();
      initPending = true;

      return true;

    }, 20);

    delayWaitForEI();

  };

  /**
   * Destroys the SoundManager instance and all SMSound instances.
   */

  this.destruct = function() {

    sm2._wD(sm + '.destruct()');
    sm2.disable(true);

  };

  /**
   * SMSound() (sound object) constructor
   * ------------------------------------
   *
   * @param {object} oOptions Sound options (id and url are required attributes)
   * @return {SMSound} The new SMSound object
   */

  SMSound = function(oOptions) {

    var s = this, resetProperties, add_html5_events, remove_html5_events, stop_html5_timer, start_html5_timer, attachOnPosition, onplay_called = false, onPositionItems = [], onPositionFired = 0, detachOnPosition, applyFromTo, lastURL = null, lastHTML5State, urlOmitted;

    lastHTML5State = {
      // tracks duration + position (time)
      duration: null,
      time: null
    };

    this.id = oOptions.id;

    // legacy
    this.sID = this.id;

    this.url = oOptions.url;
    this.options = mixin(oOptions);

    // per-play-instance-specific options
    this.instanceOptions = this.options;

    // short alias
    this._iO = this.instanceOptions;

    // assign property defaults
    this.pan = this.options.pan;
    this.volume = this.options.volume;

    // whether or not this object is using HTML5
    this.isHTML5 = false;

    // internal HTML5 Audio() object reference
    this._a = null;

    // for flash 8 special-case createSound() without url, followed by load/play with url case
    urlOmitted = (this.url ? false : true);

    /**
     * SMSound() public methods
     * ------------------------
     */

    this.id3 = {};

    /**
     * Writes SMSound object parameters to debug console
     */

    this._debug = function() {

      // <d>
      sm2._wD(s.id + ': Merged options:', s.options);
      // </d>

    };

    /**
     * Begins loading a sound per its *url*.
     *
     * @param {object} oOptions Optional: Sound options
     * @return {SMSound} The SMSound object
     */

    this.load = function(oOptions) {

      var oSound = null, instanceOptions;

      if (oOptions !== _undefined) {
        s._iO = mixin(oOptions, s.options);
      } else {
        oOptions = s.options;
        s._iO = oOptions;
        if (lastURL && lastURL !== s.url) {
          _wDS('manURL');
          s._iO.url = s.url;
          s.url = null;
        }
      }

      if (!s._iO.url) {
        s._iO.url = s.url;
      }

      s._iO.url = parseURL(s._iO.url);

      // ensure we're in sync
      s.instanceOptions = s._iO;

      // local shortcut
      instanceOptions = s._iO;

      sm2._wD(s.id + ': load (' + instanceOptions.url + ')');

      if (!instanceOptions.url && !s.url) {
        sm2._wD(s.id + ': load(): url is unassigned. Exiting.', 2);
        return s;
      }

      // <d>
      if (!s.isHTML5 && fV === 8 && !s.url && !instanceOptions.autoPlay) {
        // flash 8 load() -> play() won't work before onload has fired.
        sm2._wD(s.id + ': Flash 8 load() limitation: Wait for onload() before calling play().', 1);
      }
      // </d>

      if (instanceOptions.url === s.url && s.readyState !== 0 && s.readyState !== 2) {
        _wDS('onURL', 1);
        // if loaded and an onload() exists, fire immediately.
        if (s.readyState === 3 && instanceOptions.onload) {
          // assume success based on truthy duration.
          wrapCallback(s, function() {
            instanceOptions.onload.apply(s, [(!!s.duration)]);
          });
        }
        return s;
      }

      // reset a few state properties

      s.loaded = false;
      s.readyState = 1;
      s.playState = 0;
      s.id3 = {};

      // TODO: If switching from HTML5 -> flash (or vice versa), stop currently-playing audio.

      if (html5OK(instanceOptions)) {

        oSound = s._setup_html5(instanceOptions);

        if (!oSound._called_load) {

          s._html5_canplay = false;

          // TODO: review called_load / html5_canplay logic

          // if url provided directly to load(), assign it here.

          if (s.url !== instanceOptions.url) {

            sm2._wD(_wDS('manURL') + ': ' + instanceOptions.url);

            s._a.src = instanceOptions.url;

            // TODO: review / re-apply all relevant options (volume, loop, onposition etc.)

            // reset position for new URL
            s.setPosition(0);

          }

          // given explicit load call, try to preload.

          // early HTML5 implementation (non-standard)
          s._a.autobuffer = 'auto';

          // standard property, values: none / metadata / auto
          // reference: http://msdn.microsoft.com/en-us/library/ie/ff974759%28v=vs.85%29.aspx
          s._a.preload = 'auto';

          s._a._called_load = true;

        } else {

          sm2._wD(s.id + ': Ignoring request to load again');

        }

      } else {

        if (sm2.html5Only) {
          sm2._wD(s.id + ': No flash support. Exiting.');
          return s;
        }

        if (s._iO.url && s._iO.url.match(/data\:/i)) {
          // data: URIs not supported by Flash, either.
          sm2._wD(s.id + ': data: URIs not supported via Flash. Exiting.');
          return s;
        }

        try {
          s.isHTML5 = false;
          s._iO = policyFix(loopFix(instanceOptions));
          // if we have "position", disable auto-play as we'll be seeking to that position at onload().
          if (s._iO.autoPlay && (s._iO.position || s._iO.from)) {
            sm2._wD(s.id + ': Disabling autoPlay because of non-zero offset case');
            s._iO.autoPlay = false;
          }
          // re-assign local shortcut
          instanceOptions = s._iO;
          if (fV === 8) {
            flash._load(s.id, instanceOptions.url, instanceOptions.stream, instanceOptions.autoPlay, instanceOptions.usePolicyFile);
          } else {
            flash._load(s.id, instanceOptions.url, !!(instanceOptions.stream), !!(instanceOptions.autoPlay), instanceOptions.loops||1, !!(instanceOptions.autoLoad), instanceOptions.usePolicyFile);
          }
        } catch(e) {
          _wDS('smError', 2);
          debugTS('onload', false);
          catchError({type:'SMSOUND_LOAD_JS_EXCEPTION', fatal:true});
        }

      }

      // after all of this, ensure sound url is up to date.
      s.url = instanceOptions.url;

      return s;

    };

    /**
     * Unloads a sound, canceling any open HTTP requests.
     *
     * @return {SMSound} The SMSound object
     */

    this.unload = function() {

      // Flash 8/AS2 can't "close" a stream - fake it by loading an empty URL
      // Flash 9/AS3: Close stream, preventing further load
      // HTML5: Most UAs will use empty URL

      if (s.readyState !== 0) {

        sm2._wD(s.id + ': unload()');

        if (!s.isHTML5) {

          if (fV === 8) {
            flash._unload(s.id, emptyURL);
          } else {
            flash._unload(s.id);
          }

        } else {

          stop_html5_timer();

          if (s._a) {

            s._a.pause();

            // update empty URL, too
            lastURL = html5Unload(s._a);

          }

        }

        // reset load/status flags
        resetProperties();

      }

      return s;

    };

    /**
     * Unloads and destroys a sound.
     */

    this.destruct = function(_bFromSM) {

      sm2._wD(s.id + ': Destruct');

      if (!s.isHTML5) {

        // kill sound within Flash
        // Disable the onfailure handler
        s._iO.onfailure = null;
        flash._destroySound(s.id);

      } else {

        stop_html5_timer();

        if (s._a) {
          s._a.pause();
          html5Unload(s._a);
          if (!useGlobalHTML5Audio) {
            remove_html5_events();
          }
          // break obvious circular reference
          s._a._s = null;
          s._a = null;
        }

      }

      if (!_bFromSM) {
        // ensure deletion from controller
        sm2.destroySound(s.id, true);
      }

    };

    /**
     * Begins playing a sound.
     *
     * @param {object} oOptions Optional: Sound options
     * @return {SMSound} The SMSound object
     */

    this.play = function(oOptions, _updatePlayState) {

      var fN, allowMulti, a, onready,
          audioClone, onended, oncanplay,
          startOK = true,
          exit = null;

      // <d>
      fN = s.id + ': play(): ';
      // </d>

      // default to true
      _updatePlayState = (_updatePlayState === _undefined ? true : _updatePlayState);

      if (!oOptions) {
        oOptions = {};
      }

      // first, use local URL (if specified)
      if (s.url) {
        s._iO.url = s.url;
      }

      // mix in any options defined at createSound()
      s._iO = mixin(s._iO, s.options);

      // mix in any options specific to this method
      s._iO = mixin(oOptions, s._iO);

      s._iO.url = parseURL(s._iO.url);

      s.instanceOptions = s._iO;

      // RTMP-only
      if (!s.isHTML5 && s._iO.serverURL && !s.connected) {
        if (!s.getAutoPlay()) {
          sm2._wD(fN +' Netstream not connected yet - setting autoPlay');
          s.setAutoPlay(true);
        }
        // play will be called in onconnect()
        return s;
      }

      if (html5OK(s._iO)) {
        s._setup_html5(s._iO);
        start_html5_timer();
      }

      if (s.playState === 1 && !s.paused) {
        allowMulti = s._iO.multiShot;
        if (!allowMulti) {
          sm2._wD(fN + 'Already playing (one-shot)', 1);
          if (s.isHTML5) {
            // go back to original position.
            s.setPosition(s._iO.position);
          }
          exit = s;
        } else {
          sm2._wD(fN + 'Already playing (multi-shot)', 1);
        }
      }

      if (exit !== null) {
        return exit;
      }

      // edge case: play() with explicit URL parameter
      if (oOptions.url && oOptions.url !== s.url) {

        // special case for createSound() followed by load() / play() with url; avoid double-load case.
        if (!s.readyState && !s.isHTML5 && fV === 8 && urlOmitted) {

          urlOmitted = false;

        } else {

          // load using merged options
          s.load(s._iO);

        }

      }

      if (!s.loaded) {

        if (s.readyState === 0) {

          sm2._wD(fN + 'Attempting to load');

          // try to get this sound playing ASAP
          if (!s.isHTML5 && !sm2.html5Only) {

            // flash: assign directly because setAutoPlay() increments the instanceCount
            s._iO.autoPlay = true;
            s.load(s._iO);

          } else if (s.isHTML5) {

            // iOS needs this when recycling sounds, loading a new URL on an existing object.
            s.load(s._iO);

          } else {

            sm2._wD(fN + 'Unsupported type. Exiting.');
            exit = s;

          }

          // HTML5 hack - re-set instanceOptions?
          s.instanceOptions = s._iO;

        } else if (s.readyState === 2) {

          sm2._wD(fN + 'Could not load - exiting', 2);
          exit = s;

        } else {

          sm2._wD(fN + 'Loading - attempting to play...');

        }

      } else {

        // "play()"
        sm2._wD(fN.substr(0, fN.lastIndexOf(':')));

      }

      if (exit !== null) {
        return exit;
      }

      if (!s.isHTML5 && fV === 9 && s.position > 0 && s.position === s.duration) {
        // flash 9 needs a position reset if play() is called while at the end of a sound.
        sm2._wD(fN + 'Sound at end, resetting to position:0');
        oOptions.position = 0;
      }

      /**
       * Streams will pause when their buffer is full if they are being loaded.
       * In this case paused is true, but the song hasn't started playing yet.
       * If we just call resume() the onplay() callback will never be called.
       * So only call resume() if the position is > 0.
       * Another reason is because options like volume won't have been applied yet.
       * For normal sounds, just resume.
       */

      if (s.paused && s.position >= 0 && (!s._iO.serverURL || s.position > 0)) {

        // https://gist.github.com/37b17df75cc4d7a90bf6
        sm2._wD(fN + 'Resuming from paused state', 1);
        s.resume();

      } else {

        s._iO = mixin(oOptions, s._iO);

        /**
         * Preload in the event of play() with position under Flash,
         * or from/to parameters and non-RTMP case
         */
        if (((!s.isHTML5 && s._iO.position !== null && s._iO.position > 0) || (s._iO.from !== null && s._iO.from > 0) || s._iO.to !== null) && s.instanceCount === 0 && s.playState === 0 && !s._iO.serverURL) {

          onready = function() {
            // sound "canplay" or onload()
            // re-apply position/from/to to instance options, and start playback
            s._iO = mixin(oOptions, s._iO);
            s.play(s._iO);
          };

          // HTML5 needs to at least have "canplay" fired before seeking.
          if (s.isHTML5 && !s._html5_canplay) {

            // this hasn't been loaded yet. load it first, and then do this again.
            sm2._wD(fN + 'Beginning load for non-zero offset case');

            s.load({
              // note: custom HTML5-only event added for from/to implementation.
              _oncanplay: onready
            });

            exit = false;

          } else if (!s.isHTML5 && !s.loaded && (!s.readyState || s.readyState !== 2)) {

            // to be safe, preload the whole thing in Flash.

            sm2._wD(fN + 'Preloading for non-zero offset case');

            s.load({
              onload: onready
            });

            exit = false;

          }

          if (exit !== null) {
            return exit;
          }

          // otherwise, we're ready to go. re-apply local options, and continue

          s._iO = applyFromTo();

        }

        // sm2._wD(fN + 'Starting to play');

        // increment instance counter, where enabled + supported
        if (!s.instanceCount || s._iO.multiShotEvents || (s.isHTML5 && s._iO.multiShot && !useGlobalHTML5Audio) || (!s.isHTML5 && fV > 8 && !s.getAutoPlay())) {
          s.instanceCount++;
        }

        // if first play and onposition parameters exist, apply them now
        if (s._iO.onposition && s.playState === 0) {
          attachOnPosition(s);
        }

        s.playState = 1;
        s.paused = false;

        s.position = (s._iO.position !== _undefined && !isNaN(s._iO.position) ? s._iO.position : 0);

        if (!s.isHTML5) {
          s._iO = policyFix(loopFix(s._iO));
        }

        if (s._iO.onplay && _updatePlayState) {
          s._iO.onplay.apply(s);
          onplay_called = true;
        }

        s.setVolume(s._iO.volume, true);
        s.setPan(s._iO.pan, true);

        if (!s.isHTML5) {

          startOK = flash._start(s.id, s._iO.loops || 1, (fV === 9 ? s.position : s.position / msecScale), s._iO.multiShot || false);

          if (fV === 9 && !startOK) {
            // edge case: no sound hardware, or 32-channel flash ceiling hit.
            // applies only to Flash 9, non-NetStream/MovieStar sounds.
            // http://help.adobe.com/en_US/FlashPlatform/reference/actionscript/3/flash/media/Sound.html#play%28%29
            sm2._wD(fN + 'No sound hardware, or 32-sound ceiling hit', 2);
            if (s._iO.onplayerror) {
              s._iO.onplayerror.apply(s);
            }

          }

        } else {

          if (s.instanceCount < 2) {

            // HTML5 single-instance case

            start_html5_timer();

            a = s._setup_html5();

            s.setPosition(s._iO.position);

            a.play();

          } else {

            // HTML5 multi-shot case

            sm2._wD(s.id + ': Cloning Audio() for instance #' + s.instanceCount + '...');

            audioClone = new Audio(s._iO.url);

            onended = function() {
              event.remove(audioClone, 'ended', onended);
              s._onfinish(s);
              // cleanup
              html5Unload(audioClone);
              audioClone = null;
            };

            oncanplay = function() {
              event.remove(audioClone, 'canplay', oncanplay);
              try {
                audioClone.currentTime = s._iO.position/msecScale;
              } catch(err) {
                complain(s.id + ': multiShot play() failed to apply position of ' + (s._iO.position/msecScale));
              }
              audioClone.play();
            };

            event.add(audioClone, 'ended', onended);

            // apply volume to clones, too
            if (s._iO.volume !== undefined) {
              audioClone.volume = Math.max(0, Math.min(1, s._iO.volume/100));
            }

            // playing multiple muted sounds? if you do this, you're weird ;) - but let's cover it.
            if (s.muted) {
              audioClone.muted = true;
            }

            if (s._iO.position) {
              // HTML5 audio can't seek before onplay() event has fired.
              // wait for canplay, then seek to position and start playback.
              event.add(audioClone, 'canplay', oncanplay);
            } else {
              // begin playback at currentTime: 0
              audioClone.play();
            }

          }

        }

      }

      return s;

    };

    // just for convenience
    this.start = this.play;

    /**
     * Stops playing a sound (and optionally, all sounds)
     *
     * @param {boolean} bAll Optional: Whether to stop all sounds
     * @return {SMSound} The SMSound object
     */

    this.stop = function(bAll) {

      var instanceOptions = s._iO,
          originalPosition;

      if (s.playState === 1) {

        sm2._wD(s.id + ': stop()');

        s._onbufferchange(0);
        s._resetOnPosition(0);
        s.paused = false;

        if (!s.isHTML5) {
          s.playState = 0;
        }

        // remove onPosition listeners, if any
        detachOnPosition();

        // and "to" position, if set
        if (instanceOptions.to) {
          s.clearOnPosition(instanceOptions.to);
        }

        if (!s.isHTML5) {

          flash._stop(s.id, bAll);

          // hack for netStream: just unload
          if (instanceOptions.serverURL) {
            s.unload();
          }

        } else {

          if (s._a) {

            originalPosition = s.position;

            // act like Flash, though
            s.setPosition(0);

            // hack: reflect old position for onstop() (also like Flash)
            s.position = originalPosition;

            // html5 has no stop()
            // NOTE: pausing means iOS requires interaction to resume.
            s._a.pause();

            s.playState = 0;

            // and update UI
            s._onTimer();

            stop_html5_timer();

          }

        }

        s.instanceCount = 0;
        s._iO = {};

        if (instanceOptions.onstop) {
          instanceOptions.onstop.apply(s);
        }

      }

      return s;

    };

    /**
     * Undocumented/internal: Sets autoPlay for RTMP.
     *
     * @param {boolean} autoPlay state
     */

    this.setAutoPlay = function(autoPlay) {

      sm2._wD(s.id + ': Autoplay turned ' + (autoPlay ? 'on' : 'off'));
      s._iO.autoPlay = autoPlay;

      if (!s.isHTML5) {
        flash._setAutoPlay(s.id, autoPlay);
        if (autoPlay) {
          // only increment the instanceCount if the sound isn't loaded (TODO: verify RTMP)
          if (!s.instanceCount && s.readyState === 1) {
            s.instanceCount++;
            sm2._wD(s.id + ': Incremented instance count to '+s.instanceCount);
          }
        }
      }

    };

    /**
     * Undocumented/internal: Returns the autoPlay boolean.
     *
     * @return {boolean} The current autoPlay value
     */

    this.getAutoPlay = function() {

      return s._iO.autoPlay;

    };

    /**
     * Sets the position of a sound.
     *
     * @param {number} nMsecOffset Position (milliseconds)
     * @return {SMSound} The SMSound object
     */

    this.setPosition = function(nMsecOffset) {

      if (nMsecOffset === _undefined) {
        nMsecOffset = 0;
      }

      var position, position1K,
          // Use the duration from the instance options, if we don't have a track duration yet.
          // position >= 0 and <= current available (loaded) duration
          offset = (s.isHTML5 ? Math.max(nMsecOffset, 0) : Math.min(s.duration || s._iO.duration, Math.max(nMsecOffset, 0)));

      s.position = offset;
      position1K = s.position/msecScale;
      s._resetOnPosition(s.position);
      s._iO.position = offset;

      if (!s.isHTML5) {

        position = (fV === 9 ? s.position : position1K);

        if (s.readyState && s.readyState !== 2) {
          // if paused or not playing, will not resume (by playing)
          flash._setPosition(s.id, position, (s.paused || !s.playState), s._iO.multiShot);
        }

      } else if (s._a) {

        // Set the position in the canplay handler if the sound is not ready yet
        if (s._html5_canplay) {

          if (s._a.currentTime !== position1K) {

            /**
             * DOM/JS errors/exceptions to watch out for:
             * if seek is beyond (loaded?) position, "DOM exception 11"
             * "INDEX_SIZE_ERR": DOM exception 1
             */
            sm2._wD(s.id + ': setPosition('+position1K+')');

            try {
              s._a.currentTime = position1K;
              if (s.playState === 0 || s.paused) {
                // allow seek without auto-play/resume
                s._a.pause();
              }
            } catch(e) {
              sm2._wD(s.id + ': setPosition(' + position1K + ') failed: ' + e.message, 2);
            }

          }

        } else if (position1K) {

          // warn on non-zero seek attempts
          sm2._wD(s.id + ': setPosition(' + position1K + '): Cannot seek yet, sound not ready', 2);
          return s;

        }

        if (s.paused) {

          // if paused, refresh UI right away
          // force update
          s._onTimer(true);

        }

      }

      return s;

    };

    /**
     * Pauses sound playback.
     *
     * @return {SMSound} The SMSound object
     */

    this.pause = function(_bCallFlash) {

      if (s.paused || (s.playState === 0 && s.readyState !== 1)) {
        return s;
      }

      sm2._wD(s.id + ': pause()');
      s.paused = true;

      if (!s.isHTML5) {
        if (_bCallFlash || _bCallFlash === _undefined) {
          flash._pause(s.id, s._iO.multiShot);
        }
      } else {
        s._setup_html5().pause();
        stop_html5_timer();
      }

      if (s._iO.onpause) {
        s._iO.onpause.apply(s);
      }

      return s;

    };

    /**
     * Resumes sound playback.
     *
     * @return {SMSound} The SMSound object
     */

    /**
     * When auto-loaded streams pause on buffer full they have a playState of 0.
     * We need to make sure that the playState is set to 1 when these streams "resume".
     * When a paused stream is resumed, we need to trigger the onplay() callback if it
     * hasn't been called already. In this case since the sound is being played for the
     * first time, I think it's more appropriate to call onplay() rather than onresume().
     */

    this.resume = function() {

      var instanceOptions = s._iO;

      if (!s.paused) {
        return s;
      }

      sm2._wD(s.id + ': resume()');
      s.paused = false;
      s.playState = 1;

      if (!s.isHTML5) {
        if (instanceOptions.isMovieStar && !instanceOptions.serverURL) {
          // Bizarre Webkit bug (Chrome reported via 8tracks.com dudes): AAC content paused for 30+ seconds(?) will not resume without a reposition.
          s.setPosition(s.position);
        }
        // flash method is toggle-based (pause/resume)
        flash._pause(s.id, instanceOptions.multiShot);
      } else {
        s._setup_html5().play();
        start_html5_timer();
      }

      if (!onplay_called && instanceOptions.onplay) {
        instanceOptions.onplay.apply(s);
        onplay_called = true;
      } else if (instanceOptions.onresume) {
        instanceOptions.onresume.apply(s);
      }

      return s;

    };

    /**
     * Toggles sound playback.
     *
     * @return {SMSound} The SMSound object
     */

    this.togglePause = function() {

      sm2._wD(s.id + ': togglePause()');

      if (s.playState === 0) {
        s.play({
          position: (fV === 9 && !s.isHTML5 ? s.position : s.position / msecScale)
        });
        return s;
      }

      if (s.paused) {
        s.resume();
      } else {
        s.pause();
      }

      return s;

    };

    /**
     * Sets the panning (L-R) effect.
     *
     * @param {number} nPan The pan value (-100 to 100)
     * @return {SMSound} The SMSound object
     */

    this.setPan = function(nPan, bInstanceOnly) {

      if (nPan === _undefined) {
        nPan = 0;
      }

      if (bInstanceOnly === _undefined) {
        bInstanceOnly = false;
      }

      if (!s.isHTML5) {
        flash._setPan(s.id, nPan);
      } // else { no HTML5 pan? }

      s._iO.pan = nPan;

      if (!bInstanceOnly) {
        s.pan = nPan;
        s.options.pan = nPan;
      }

      return s;

    };

    /**
     * Sets the volume.
     *
     * @param {number} nVol The volume value (0 to 100)
     * @return {SMSound} The SMSound object
     */

    this.setVolume = function(nVol, _bInstanceOnly) {

      /**
       * Note: Setting volume has no effect on iOS "special snowflake" devices.
       * Hardware volume control overrides software, and volume
       * will always return 1 per Apple docs. (iOS 4 + 5.)
       * http://developer.apple.com/library/safari/documentation/AudioVideo/Conceptual/HTML-canvas-guide/AddingSoundtoCanvasAnimations/AddingSoundtoCanvasAnimations.html
       */

      if (nVol === _undefined) {
        nVol = 100;
      }

      if (_bInstanceOnly === _undefined) {
        _bInstanceOnly = false;
      }

      if (!s.isHTML5) {
        flash._setVolume(s.id, (sm2.muted && !s.muted) || s.muted?0:nVol);
      } else if (s._a) {
        if (sm2.muted && !s.muted) {
          s.muted = true;
          s._a.muted = true;
        }
        // valid range: 0-1
        s._a.volume = Math.max(0, Math.min(1, nVol/100));
      }

      s._iO.volume = nVol;

      if (!_bInstanceOnly) {
        s.volume = nVol;
        s.options.volume = nVol;
      }

      return s;

    };

    /**
     * Mutes the sound.
     *
     * @return {SMSound} The SMSound object
     */

    this.mute = function() {

      s.muted = true;

      if (!s.isHTML5) {
        flash._setVolume(s.id, 0);
      } else if (s._a) {
        s._a.muted = true;
      }

      return s;

    };

    /**
     * Unmutes the sound.
     *
     * @return {SMSound} The SMSound object
     */

    this.unmute = function() {

      s.muted = false;
      var hasIO = (s._iO.volume !== _undefined);

      if (!s.isHTML5) {
        flash._setVolume(s.id, hasIO?s._iO.volume:s.options.volume);
      } else if (s._a) {
        s._a.muted = false;
      }

      return s;

    };

    /**
     * Toggles the muted state of a sound.
     *
     * @return {SMSound} The SMSound object
     */

    this.toggleMute = function() {

      return (s.muted?s.unmute():s.mute());

    };

    /**
     * Registers a callback to be fired when a sound reaches a given position during playback.
     *
     * @param {number} nPosition The position to watch for
     * @param {function} oMethod The relevant callback to fire
     * @param {object} oScope Optional: The scope to apply the callback to
     * @return {SMSound} The SMSound object
     */

    this.onPosition = function(nPosition, oMethod, oScope) {

      // TODO: basic dupe checking?

      onPositionItems.push({
        position: parseInt(nPosition, 10),
        method: oMethod,
        scope: (oScope !== _undefined ? oScope : s),
        fired: false
      });

      return s;

    };

    // legacy/backwards-compability: lower-case method name
    this.onposition = this.onPosition;

    /**
     * Removes registered callback(s) from a sound, by position and/or callback.
     *
     * @param {number} nPosition The position to clear callback(s) for
     * @param {function} oMethod Optional: Identify one callback to be removed when multiple listeners exist for one position
     * @return {SMSound} The SMSound object
     */

    this.clearOnPosition = function(nPosition, oMethod) {

      var i;

      nPosition = parseInt(nPosition, 10);

      if (isNaN(nPosition)) {
        // safety check
        return false;
      }

      for (i=0; i < onPositionItems.length; i++) {

        if (nPosition === onPositionItems[i].position) {
          // remove this item if no method was specified, or, if the method matches
          if (!oMethod || (oMethod === onPositionItems[i].method)) {
            if (onPositionItems[i].fired) {
              // decrement "fired" counter, too
              onPositionFired--;
            }
            onPositionItems.splice(i, 1);
          }
        }

      }

    };

    this._processOnPosition = function() {

      var i, item, j = onPositionItems.length;
		
      if (!j || !s.playState || onPositionFired >= j) {
        return false;
      }

      for (i=j-1; i >= 0; i--) {
        item = onPositionItems[i];
        if (!item.fired && s.position >= item.position) {
          item.fired = true;
          onPositionFired++;
          item.method.apply(item.scope, [item.position]);
		  j = onPositionItems.length; //  reset j -- onPositionItems.length can be changed in the item callback above... occasionally breaking the loop.
        }
      }
	
      return true;

    };

    this._resetOnPosition = function(nPosition) {

      // reset "fired" for items interested in this position
      var i, item, j = onPositionItems.length;

      if (!j) {
        return false;
      }

      for (i=j-1; i >= 0; i--) {
        item = onPositionItems[i];
        if (item.fired && nPosition <= item.position) {
          item.fired = false;
          onPositionFired--;
        }
      }

      return true;

    };

    /**
     * SMSound() private internals
     * --------------------------------
     */

    applyFromTo = function() {

      var instanceOptions = s._iO,
          f = instanceOptions.from,
          t = instanceOptions.to,
          start, end;

      end = function() {

        // end has been reached.
        sm2._wD(s.id + ': "To" time of ' + t + ' reached.');

        // detach listener
        s.clearOnPosition(t, end);

        // stop should clear this, too
        s.stop();

      };

      start = function() {

        sm2._wD(s.id + ': Playing "from" ' + f);

        // add listener for end
        if (t !== null && !isNaN(t)) {
          s.onPosition(t, end);
        }

      };

      if (f !== null && !isNaN(f)) {

        // apply to instance options, guaranteeing correct start position.
        instanceOptions.position = f;

        // multiShot timing can't be tracked, so prevent that.
        instanceOptions.multiShot = false;

        start();

      }

      // return updated instanceOptions including starting position
      return instanceOptions;

    };

    attachOnPosition = function() {

      var item,
          op = s._iO.onposition;

      // attach onposition things, if any, now.

      if (op) {

        for (item in op) {
          if (op.hasOwnProperty(item)) {
            s.onPosition(parseInt(item, 10), op[item]);
          }
        }

      }

    };

    detachOnPosition = function() {

      var item,
          op = s._iO.onposition;

      // detach any onposition()-style listeners.

      if (op) {

        for (item in op) {
          if (op.hasOwnProperty(item)) {
            s.clearOnPosition(parseInt(item, 10));
          }
        }

      }

    };

    start_html5_timer = function() {

      if (s.isHTML5) {
        startTimer(s);
      }

    };

    stop_html5_timer = function() {

      if (s.isHTML5) {
        stopTimer(s);
      }

    };

    resetProperties = function(retainPosition) {

      if (!retainPosition) {
        onPositionItems = [];
        onPositionFired = 0;
      }

      onplay_called = false;

      s._hasTimer = null;
      s._a = null;
      s._html5_canplay = false;
      s.bytesLoaded = null;
      s.bytesTotal = null;
      s.duration = (s._iO && s._iO.duration ? s._iO.duration : null);
      s.durationEstimate = null;
      s.buffered = [];

      // legacy: 1D array
      s.eqData = [];

      s.eqData.left = [];
      s.eqData.right = [];

      s.failures = 0;
      s.isBuffering = false;
      s.instanceOptions = {};
      s.instanceCount = 0;
      s.loaded = false;
      s.metadata = {};

      // 0 = uninitialised, 1 = loading, 2 = failed/error, 3 = loaded/success
      s.readyState = 0;

      s.muted = false;
      s.paused = false;

      s.peakData = {
        left: 0,
        right: 0
      };

      s.waveformData = {
        left: [],
        right: []
      };

      s.playState = 0;
      s.position = null;

      s.id3 = {};

    };

    resetProperties();

    /**
     * Pseudo-private SMSound internals
     * --------------------------------
     */

    this._onTimer = function(bForce) {

      /**
       * HTML5-only _whileplaying() etc.
       * called from both HTML5 native events, and polling/interval-based timers
       * mimics flash and fires only when time/duration change, so as to be polling-friendly
       */

      var duration, isNew = false, time, x = {};

      if (s._hasTimer || bForce) {

        // TODO: May not need to track readyState (1 = loading)

        if (s._a && (bForce || ((s.playState > 0 || s.readyState === 1) && !s.paused))) {

          duration = s._get_html5_duration();

          if (duration !== lastHTML5State.duration) {

            lastHTML5State.duration = duration;
            s.duration = duration;
            isNew = true;

          }

          // TODO: investigate why this goes wack if not set/re-set each time.
          s.durationEstimate = s.duration;

          time = (s._a.currentTime * msecScale || 0);

          if (time !== lastHTML5State.time) {

            lastHTML5State.time = time;
            isNew = true;

          }

          if (isNew || bForce) {

            s._whileplaying(time,x,x,x,x);

          }

        }/* else {

          // sm2._wD('_onTimer: Warn for "'+s.id+'": '+(!s._a?'Could not find element. ':'')+(s.playState === 0?'playState bad, 0?':'playState = '+s.playState+', OK'));

          return false;

        }*/

        return isNew;

      }

    };

    this._get_html5_duration = function() {

      var instanceOptions = s._iO,
          // if audio object exists, use its duration - else, instance option duration (if provided - it's a hack, really, and should be retired) OR null
          d = (s._a && s._a.duration ? s._a.duration*msecScale : (instanceOptions && instanceOptions.duration ? instanceOptions.duration : null)),
          result = (d && !isNaN(d) && d !== Infinity ? d : null);

      return result;

    };

    this._apply_loop = function(a, nLoops) {

      /**
       * boolean instead of "loop", for webkit? - spec says string. http://www.w3.org/TR/html-markup/audio.html#audio.attrs.loop
       * note that loop is either off or infinite under HTML5, unlike Flash which allows arbitrary loop counts to be specified.
       */

      // <d>
      if (!a.loop && nLoops > 1) {
        sm2._wD('Note: Native HTML5 looping is infinite.', 1);
      }
      // </d>

      a.loop = (nLoops > 1 ? 'loop' : '');

    };

    this._setup_html5 = function(oOptions) {

      var instanceOptions = mixin(s._iO, oOptions),
          a = useGlobalHTML5Audio ? globalHTML5Audio : s._a,
          dURL = decodeURI(instanceOptions.url),
          sameURL;

      /**
       * "First things first, I, Poppa..." (reset the previous state of the old sound, if playing)
       * Fixes case with devices that can only play one sound at a time
       * Otherwise, other sounds in mid-play will be terminated without warning and in a stuck state
       */

      if (useGlobalHTML5Audio) {

        if (dURL === decodeURI(lastGlobalHTML5URL)) {
          // global HTML5 audio: re-use of URL
          sameURL = true;
        }

      } else if (dURL === decodeURI(lastURL)) {

        // options URL is the same as the "last" URL, and we used (loaded) it
        sameURL = true;

      }

      if (a) {

        if (a._s) {

          if (useGlobalHTML5Audio) {

            if (a._s && a._s.playState && !sameURL) {

              // global HTML5 audio case, and loading a new URL. stop the currently-playing one.
              a._s.stop();

            }

          } else if (!useGlobalHTML5Audio && dURL === decodeURI(lastURL)) {

            // non-global HTML5 reuse case: same url, ignore request
            s._apply_loop(a, instanceOptions.loops);

            return a;

          }

        }

        if (!sameURL) {

          // don't retain onPosition() stuff with new URLs.

          if (lastURL) {
            resetProperties(false);
          }

          // assign new HTML5 URL

          a.src = instanceOptions.url;

          s.url = instanceOptions.url;

          lastURL = instanceOptions.url;

          lastGlobalHTML5URL = instanceOptions.url;

          a._called_load = false;

        }

      } else {

        if (instanceOptions.autoLoad || instanceOptions.autoPlay) {

          s._a = new Audio(instanceOptions.url);
          s._a.load();

        } else {

          // null for stupid Opera 9.64 case
          s._a = (isOpera && opera.version() < 10 ? new Audio(null) : new Audio());

        }

        // assign local reference
        a = s._a;

        a._called_load = false;

        if (useGlobalHTML5Audio) {

          globalHTML5Audio = a;

        }

      }

      s.isHTML5 = true;

      // store a ref on the track
      s._a = a;

      // store a ref on the audio
      a._s = s;

      add_html5_events();

      s._apply_loop(a, instanceOptions.loops);

      if (instanceOptions.autoLoad || instanceOptions.autoPlay) {

        s.load();

      } else {

        // early HTML5 implementation (non-standard)
        a.autobuffer = false;

        // standard ('none' is also an option.)
        a.preload = 'auto';

      }

      return a;

    };

    add_html5_events = function() {

      if (s._a._added_events) {
        return false;
      }

      var f;

      function add(oEvt, oFn, bCapture) {
        return s._a ? s._a.addEventListener(oEvt, oFn, bCapture||false) : null;
      }

      s._a._added_events = true;

      for (f in html5_events) {
        if (html5_events.hasOwnProperty(f)) {
          add(f, html5_events[f]);
        }
      }

      return true;

    };

    remove_html5_events = function() {

      // Remove event listeners

      var f;

      function remove(oEvt, oFn, bCapture) {
        return (s._a ? s._a.removeEventListener(oEvt, oFn, bCapture||false) : null);
      }

      sm2._wD(s.id + ': Removing event listeners');
      s._a._added_events = false;

      for (f in html5_events) {
        if (html5_events.hasOwnProperty(f)) {
          remove(f, html5_events[f]);
        }
      }

    };

    /**
     * Pseudo-private event internals
     * ------------------------------
     */

    this._onload = function(nSuccess) {

      var fN,
          // check for duration to prevent false positives from flash 8 when loading from cache.
          loadOK = !!nSuccess || (!s.isHTML5 && fV === 8 && s.duration);

      // <d>
      fN = s.id + ': ';
      sm2._wD(fN + (loadOK ? 'onload()' : 'Failed to load / invalid sound?' + (!s.duration ? ' Zero-length duration reported.' : ' -') + ' (' + s.url + ')'), (loadOK ? 1 : 2));
      if (!loadOK && !s.isHTML5) {
        if (sm2.sandbox.noRemote === true) {
          sm2._wD(fN + str('noNet'), 1);
        }
        if (sm2.sandbox.noLocal === true) {
          sm2._wD(fN + str('noLocal'), 1);
        }
      }
      // </d>

      s.loaded = loadOK;
      s.readyState = loadOK?3:2;
      s._onbufferchange(0);

      if (s._iO.onload) {
        wrapCallback(s, function() {
          s._iO.onload.apply(s, [loadOK]);
        });
      }

      return true;

    };

    this._onbufferchange = function(nIsBuffering) {

      if (s.playState === 0) {
        // ignore if not playing
        return false;
      }

      if ((nIsBuffering && s.isBuffering) || (!nIsBuffering && !s.isBuffering)) {
        return false;
      }

      s.isBuffering = (nIsBuffering === 1);
      if (s._iO.onbufferchange) {
        sm2._wD(s.id + ': Buffer state change: ' + nIsBuffering);
        s._iO.onbufferchange.apply(s, [nIsBuffering]);
      }

      return true;

    };

    /**
     * Playback may have stopped due to buffering, or related reason.
     * This state can be encountered on iOS < 6 when auto-play is blocked.
     */

    this._onsuspend = function() {

      if (s._iO.onsuspend) {
        sm2._wD(s.id + ': Playback suspended');
        s._iO.onsuspend.apply(s);
      }

      return true;

    };

    /**
     * flash 9/movieStar + RTMP-only method, should fire only once at most
     * at this point we just recreate failed sounds rather than trying to reconnect
     */

    this._onfailure = function(msg, level, code) {

      s.failures++;
      sm2._wD(s.id + ': Failure (' + s.failures + '): ' + msg);

      if (s._iO.onfailure && s.failures === 1) {
        s._iO.onfailure(msg, level, code);
      } else {
        sm2._wD(s.id + ': Ignoring failure');
      }

    };

    /**
     * flash 9/movieStar + RTMP-only method for unhandled warnings/exceptions from Flash
     * e.g., RTMP "method missing" warning (non-fatal) for getStreamLength on server
     */

    this._onwarning = function(msg, level, code) {

      if (s._iO.onwarning) {
        s._iO.onwarning(msg, level, code);
      }

    };

    this._onfinish = function() {

      // store local copy before it gets trashed...
      var io_onfinish = s._iO.onfinish;

      s._onbufferchange(0);
      s._resetOnPosition(0);

      // reset some state items
      if (s.instanceCount) {

        s.instanceCount--;

        if (!s.instanceCount) {

          // remove onPosition listeners, if any
          detachOnPosition();

          // reset instance options
          s.playState = 0;
          s.paused = false;
          s.instanceCount = 0;
          s.instanceOptions = {};
          s._iO = {};
          stop_html5_timer();

          // reset position, too
          if (s.isHTML5) {
            s.position = 0;
          }

        }

        if (!s.instanceCount || s._iO.multiShotEvents) {
          // fire onfinish for last, or every instance
          if (io_onfinish) {
            sm2._wD(s.id + ': onfinish()');
            wrapCallback(s, function() {
              io_onfinish.apply(s);
            });
          }
        }

      }

    };

    this._whileloading = function(nBytesLoaded, nBytesTotal, nDuration, nBufferLength) {

      var instanceOptions = s._iO;

      s.bytesLoaded = nBytesLoaded;
      s.bytesTotal = nBytesTotal;
      s.duration = Math.floor(nDuration);
      s.bufferLength = nBufferLength;

      if (!s.isHTML5 && !instanceOptions.isMovieStar) {

        if (instanceOptions.duration) {
          // use duration from options, if specified and larger. nobody should be specifying duration in options, actually, and it should be retired.
          s.durationEstimate = (s.duration > instanceOptions.duration) ? s.duration : instanceOptions.duration;
        } else {
          s.durationEstimate = parseInt((s.bytesTotal / s.bytesLoaded) * s.duration, 10);
        }

      } else {

        s.durationEstimate = s.duration;

      }

      // for flash, reflect sequential-load-style buffering
      if (!s.isHTML5) {
        s.buffered = [{
          'start': 0,
          'end': s.duration
        }];
      }

      // allow whileloading to fire even if "load" fired under HTML5, due to HTTP range/partials
      if ((s.readyState !== 3 || s.isHTML5) && instanceOptions.whileloading) {
        instanceOptions.whileloading.apply(s);
      }

    };

    this._whileplaying = function(nPosition, oPeakData, oWaveformDataLeft, oWaveformDataRight, oEQData) {

      var instanceOptions = s._iO,
          eqLeft;

      if (isNaN(nPosition) || nPosition === null) {
        // flash safety net
        return false;
      }

      // Safari HTML5 play() may return small -ve values when starting from position: 0, eg. -50.120396875. Unexpected/invalid per W3, I think. Normalize to 0.
      s.position = Math.max(0, nPosition);

      s._processOnPosition();

      if (!s.isHTML5 && fV > 8) {

        if (instanceOptions.usePeakData && oPeakData !== _undefined && oPeakData) {
          s.peakData = {
            left: oPeakData.leftPeak,
            right: oPeakData.rightPeak
          };
        }

        if (instanceOptions.useWaveformData && oWaveformDataLeft !== _undefined && oWaveformDataLeft) {
          s.waveformData = {
            left: oWaveformDataLeft.split(','),
            right: oWaveformDataRight.split(',')
          };
        }

        if (instanceOptions.useEQData) {
          if (oEQData !== _undefined && oEQData && oEQData.leftEQ) {
            eqLeft = oEQData.leftEQ.split(',');
            s.eqData = eqLeft;
            s.eqData.left = eqLeft;
            if (oEQData.rightEQ !== _undefined && oEQData.rightEQ) {
              s.eqData.right = oEQData.rightEQ.split(',');
            }
          }
        }

      }

      if (s.playState === 1) {

        // special case/hack: ensure buffering is false if loading from cache (and not yet started)
        if (!s.isHTML5 && fV === 8 && !s.position && s.isBuffering) {
          s._onbufferchange(0);
        }

        if (instanceOptions.whileplaying) {
          // flash may call after actual finish
          instanceOptions.whileplaying.apply(s);
        }

      }

      return true;

    };

    this._oncaptiondata = function(oData) {

      /**
       * internal: flash 9 + NetStream (MovieStar/RTMP-only) feature
       *
       * @param {object} oData
       */

      sm2._wD(s.id + ': Caption data received.');

      s.captiondata = oData;

      if (s._iO.oncaptiondata) {
        s._iO.oncaptiondata.apply(s, [oData]);
      }

    };

    this._onmetadata = function(oMDProps, oMDData) {

      /**
       * internal: flash 9 + NetStream (MovieStar/RTMP-only) feature
       * RTMP may include song title, MovieStar content may include encoding info
       *
       * @param {array} oMDProps (names)
       * @param {array} oMDData (values)
       */

      sm2._wD(s.id + ': Metadata received.');

      var oData = {}, i, j;

      for (i = 0, j = oMDProps.length; i < j; i++) {
        oData[oMDProps[i]] = oMDData[i];
      }
      s.metadata = oData;

console.log('updated metadata', s.metadata);

      if (s._iO.onmetadata) {
        s._iO.onmetadata.call(s, s.metadata);
      }

    };

    this._onid3 = function(oID3Props, oID3Data) {

      /**
       * internal: flash 8 + flash 9 ID3 feature
       * may include artist, song title etc.
       *
       * @param {array} oID3Props (names)
       * @param {array} oID3Data (values)
       */

      sm2._wD(s.id + ': ID3 data received.');

      var oData = [], i, j;

      for (i = 0, j = oID3Props.length; i < j; i++) {
        oData[oID3Props[i]] = oID3Data[i];
      }
      s.id3 = mixin(s.id3, oData);

      if (s._iO.onid3) {
        s._iO.onid3.apply(s);
      }

    };

    // flash/RTMP-only

    this._onconnect = function(bSuccess) {

      bSuccess = (bSuccess === 1);
      sm2._wD(s.id + ': ' + (bSuccess ? 'Connected.' : 'Failed to connect? - ' + s.url), (bSuccess ? 1 : 2));
      s.connected = bSuccess;

      if (bSuccess) {

        s.failures = 0;

        if (idCheck(s.id)) {
          if (s.getAutoPlay()) {
            // only update the play state if auto playing
            s.play(_undefined, s.getAutoPlay());
          } else if (s._iO.autoLoad) {
            s.load();
          }
        }

        if (s._iO.onconnect) {
          s._iO.onconnect.apply(s, [bSuccess]);
        }

      }

    };

    this._ondataerror = function(sError) {

      // flash 9 wave/eq data handler
      // hack: called at start, and end from flash at/after onfinish()
      if (s.playState > 0) {
        sm2._wD(s.id + ': Data error: ' + sError);
        if (s._iO.ondataerror) {
          s._iO.ondataerror.apply(s);
        }
      }

    };

    // <d>
    this._debug();
    // </d>

  }; // SMSound()

  /**
   * Private SoundManager internals
   * ------------------------------
   */

  getDocument = function() {

    return (doc.body || doc.getElementsByTagName('div')[0]);

  };

  id = function(sID) {

    return doc.getElementById(sID);

  };

  mixin = function(oMain, oAdd) {

    // non-destructive merge
    var o1 = (oMain || {}), o2, o;

    // if unspecified, o2 is the default options object
    o2 = (oAdd === _undefined ? sm2.defaultOptions : oAdd);

    for (o in o2) {

      if (o2.hasOwnProperty(o) && o1[o] === _undefined) {

        if (typeof o2[o] !== 'object' || o2[o] === null) {

          // assign directly
          o1[o] = o2[o];

        } else {

          // recurse through o2
          o1[o] = mixin(o1[o], o2[o]);

        }

      }

    }

    return o1;

  };

  wrapCallback = function(oSound, callback) {

    /**
     * 03/03/2013: Fix for Flash Player 11.6.602.171 + Flash 8 (flashVersion = 8) SWF issue
     * setTimeout() fix for certain SMSound callbacks like onload() and onfinish(), where subsequent calls like play() and load() fail when Flash Player 11.6.602.171 is installed, and using soundManager with flashVersion = 8 (which is the default).
     * Not sure of exact cause. Suspect race condition and/or invalid (NaN-style) position argument trickling down to the next JS -> Flash _start() call, in the play() case.
     * Fix: setTimeout() to yield, plus safer null / NaN checking on position argument provided to Flash.
     * https://getsatisfaction.com/schillmania/topics/recent_chrome_update_seems_to_have_broken_my_sm2_audio_player
     */
    if (!oSound.isHTML5 && fV === 8) {
      window.setTimeout(callback, 0);
    } else {
      callback();
    }

  };

  // additional soundManager properties that soundManager.setup() will accept

  extraOptions = {
    'onready': 1,
    'ontimeout': 1,
    'defaultOptions': 1,
    'flash9Options': 1,
    'movieStarOptions': 1
  };

  assign = function(o, oParent) {

    /**
     * recursive assignment of properties, soundManager.setup() helper
     * allows property assignment based on whitelist
     */

    var i,
        result = true,
        hasParent = (oParent !== _undefined),
        setupOptions = sm2.setupOptions,
        bonusOptions = extraOptions;

    // <d>

    // if soundManager.setup() called, show accepted parameters.

    if (o === _undefined) {

      result = [];

      for (i in setupOptions) {

        if (setupOptions.hasOwnProperty(i)) {
          result.push(i);
        }

      }

      for (i in bonusOptions) {

        if (bonusOptions.hasOwnProperty(i)) {

          if (typeof sm2[i] === 'object') {

            result.push(i+': {...}');

          } else if (sm2[i] instanceof Function) {

            result.push(i+': function() {...}');

          } else {

            result.push(i);

          }

        }

      }

      sm2._wD(str('setup', result.join(', ')));

      return false;

    }

    // </d>

    for (i in o) {

      if (o.hasOwnProperty(i)) {

        // if not an {object} we want to recurse through...

        if (typeof o[i] !== 'object' || o[i] === null || o[i] instanceof Array || o[i] instanceof RegExp) {

          // check "allowed" options

          if (hasParent && bonusOptions[oParent] !== _undefined) {

            // valid recursive / nested object option, eg., { defaultOptions: { volume: 50 } }
            sm2[oParent][i] = o[i];

          } else if (setupOptions[i] !== _undefined) {

            // special case: assign to setupOptions object, which soundManager property references
            sm2.setupOptions[i] = o[i];

            // assign directly to soundManager, too
            sm2[i] = o[i];

          } else if (bonusOptions[i] === _undefined) {

            // invalid or disallowed parameter. complain.
            complain(str((sm2[i] === _undefined ? 'setupUndef' : 'setupError'), i), 2);

            result = false;

          } else {

            /**
             * valid extraOptions (bonusOptions) parameter.
             * is it a method, like onready/ontimeout? call it.
             * multiple parameters should be in an array, eg. soundManager.setup({onready: [myHandler, myScope]});
             */

            if (sm2[i] instanceof Function) {

              sm2[i].apply(sm2, (o[i] instanceof Array? o[i] : [o[i]]));

            } else {

              // good old-fashioned direct assignment
              sm2[i] = o[i];

            }

          }

        } else {

          // recursion case, eg., { defaultOptions: { ... } }

          if (bonusOptions[i] === _undefined) {

            // invalid or disallowed parameter. complain.
            complain(str((sm2[i] === _undefined ? 'setupUndef' : 'setupError'), i), 2);

            result = false;

          } else {

            // recurse through object
            return assign(o[i], i);

          }

        }

      }

    }

    return result;

  };

  function preferFlashCheck(kind) {

    // whether flash should play a given type
    return (sm2.preferFlash && hasFlash && !sm2.ignoreFlash && (sm2.flash[kind] !== _undefined && sm2.flash[kind]));

  }

  /**
   * Internal DOM2-level event helpers
   * ---------------------------------
   */

  event = (function() {

    // normalize event methods
    var old = (window.attachEvent),
    evt = {
      add: (old?'attachEvent':'addEventListener'),
      remove: (old?'detachEvent':'removeEventListener')
    };

    // normalize "on" event prefix, optional capture argument
    function getArgs(oArgs) {

      var args = slice.call(oArgs),
          len = args.length;

      if (old) {
        // prefix
        args[1] = 'on' + args[1];
        if (len > 3) {
          // no capture
          args.pop();
        }
      } else if (len === 3) {
        args.push(false);
      }

      return args;

    }

    function apply(args, sType) {

      // normalize and call the event method, with the proper arguments
      var element = args.shift(),
          method = [evt[sType]];

      if (old) {
        // old IE can't do apply().
        element[method](args[0], args[1]);
      } else {
        element[method].apply(element, args);
      }

    }

    function add() {

      apply(getArgs(arguments), 'add');

    }

    function remove() {

      apply(getArgs(arguments), 'remove');

    }

    return {
      'add': add,
      'remove': remove
    };

  }());

  /**
   * Internal HTML5 event handling
   * -----------------------------
   */

  function html5_event(oFn) {

    // wrap html5 event handlers so we don't call them on destroyed and/or unloaded sounds

    return function(e) {

      var s = this._s,
          result;

      if (!s || !s._a) {
        // <d>
        if (s && s.id) {
          sm2._wD(s.id + ': Ignoring ' + e.type);
        } else {
          sm2._wD(h5 + 'Ignoring ' + e.type);
        }
        // </d>
        result = null;
      } else {
        result = oFn.call(this, e);
      }

      return result;

    };

  }

  html5_events = {

    // HTML5 event-name-to-handler map

    abort: html5_event(function() {

      sm2._wD(this._s.id + ': abort');

    }),

    // enough has loaded to play

    canplay: html5_event(function() {

      var s = this._s,
          position1K;

      if (s._html5_canplay) {
        // this event has already fired. ignore.
        return true;
      }

      s._html5_canplay = true;
      sm2._wD(s.id + ': canplay');
      s._onbufferchange(0);

      // position according to instance options
      position1K = (s._iO.position !== _undefined && !isNaN(s._iO.position) ? s._iO.position/msecScale : null);

      // set the position if position was provided before the sound loaded
      if (this.currentTime !== position1K) {
        sm2._wD(s.id + ': canplay: Setting position to ' + position1K);
        try {
          this.currentTime = position1K;
        } catch(ee) {
          sm2._wD(s.id + ': canplay: Setting position of ' + position1K + ' failed: ' + ee.message, 2);
        }
      }

      // hack for HTML5 from/to case
      if (s._iO._oncanplay) {
        s._iO._oncanplay();
      }

    }),

    canplaythrough: html5_event(function() {

      var s = this._s;

      if (!s.loaded) {
        s._onbufferchange(0);
        s._whileloading(s.bytesLoaded, s.bytesTotal, s._get_html5_duration());
        s._onload(true);
      }

    }),

    durationchange: html5_event(function() {

      // durationchange may fire at various times, probably the safest way to capture accurate/final duration.

      var s = this._s,
          duration;

      duration = s._get_html5_duration();

      if (!isNaN(duration) && duration !== s.duration) {

        sm2._wD(this._s.id + ': durationchange (' + duration + ')' + (s.duration ? ', previously ' + s.duration : ''));

        s.durationEstimate = s.duration = duration;

      }

    }),

    // TODO: Reserved for potential use
    /*
    emptied: html5_event(function() {

      sm2._wD(this._s.id + ': emptied');

    }),
    */

    ended: html5_event(function() {

      var s = this._s;

      sm2._wD(s.id + ': ended');

      s._onfinish();

    }),

    error: html5_event(function() {

      sm2._wD(this._s.id + ': HTML5 error, code ' + this.error.code);
      /**
       * HTML5 error codes, per W3C
       * Error 1: Client aborted download at user's request.
       * Error 2: Network error after load started.
       * Error 3: Decoding issue.
       * Error 4: Media (audio file) not supported.
       * Reference: http://www.whatwg.org/specs/web-apps/current-work/multipage/the-video-element.html#error-codes
       */
      // call load with error state?
      this._s._onload(false);

    }),

    loadeddata: html5_event(function() {

      var s = this._s;

      sm2._wD(s.id + ': loadeddata');

      // safari seems to nicely report progress events, eventually totalling 100%
      if (!s._loaded && !isSafari) {
        s.duration = s._get_html5_duration();
      }

    }),

    loadedmetadata: html5_event(function() {

      sm2._wD(this._s.id + ': loadedmetadata');

    }),

    loadstart: html5_event(function() {

      sm2._wD(this._s.id + ': loadstart');
      // assume buffering at first
      this._s._onbufferchange(1);

    }),

    play: html5_event(function() {

      // sm2._wD(this._s.id + ': play()');
      // once play starts, no buffering
      this._s._onbufferchange(0);

    }),

    playing: html5_event(function() {

      sm2._wD(this._s.id + ': playing ' + String.fromCharCode(9835));
      // once play starts, no buffering
      this._s._onbufferchange(0);

    }),

    progress: html5_event(function(e) {

      // note: can fire repeatedly after "loaded" event, due to use of HTTP range/partials

      var s = this._s,
          i, j, progStr, buffered = 0,
          isProgress = (e.type === 'progress'),
          ranges = e.target.buffered,
          // firefox 3.6 implements e.loaded/total (bytes)
          loaded = (e.loaded||0),
          total = (e.total||1);

      // reset the "buffered" (loaded byte ranges) array
      s.buffered = [];

      if (ranges && ranges.length) {

        // if loaded is 0, try TimeRanges implementation as % of load
        // https://developer.mozilla.org/en/DOM/TimeRanges

        // re-build "buffered" array
        // HTML5 returns seconds. SM2 API uses msec for setPosition() etc., whether Flash or HTML5.
        for (i=0, j=ranges.length; i<j; i++) {
          s.buffered.push({
            'start': ranges.start(i) * msecScale,
            'end': ranges.end(i) * msecScale
          });
        }

        // use the last value locally
        buffered = (ranges.end(0) - ranges.start(0)) * msecScale;

        // linear case, buffer sum; does not account for seeking and HTTP partials / byte ranges
        loaded = Math.min(1, buffered/(e.target.duration*msecScale));

        // <d>
        if (isProgress && ranges.length > 1) {
          progStr = [];
          j = ranges.length;
          for (i=0; i<j; i++) {
            progStr.push(e.target.buffered.start(i)*msecScale +'-'+ e.target.buffered.end(i)*msecScale);
          }
          sm2._wD(this._s.id + ': progress, timeRanges: ' + progStr.join(', '));
        }

        if (isProgress && !isNaN(loaded)) {
          sm2._wD(this._s.id + ': progress, ' + Math.floor(loaded*100) + '% loaded');
        }
        // </d>

      }

      if (!isNaN(loaded)) {

        // TODO: prevent calls with duplicate values.
        s._whileloading(loaded, total, s._get_html5_duration());
        if (loaded && total && loaded === total) {
          // in case "onload" doesn't fire (eg. gecko 1.9.2)
          html5_events.canplaythrough.call(this, e);
        }

      }

    }),

    ratechange: html5_event(function() {

      sm2._wD(this._s.id + ': ratechange');

    }),

    suspend: html5_event(function(e) {

      // download paused/stopped, may have finished (eg. onload)
      var s = this._s;

      sm2._wD(this._s.id + ': suspend');
      html5_events.progress.call(this, e);
      s._onsuspend();

    }),

    stalled: html5_event(function() {

      sm2._wD(this._s.id + ': stalled');

    }),

    timeupdate: html5_event(function() {

      this._s._onTimer();

    }),

    waiting: html5_event(function() {

      var s = this._s;

      // see also: seeking
      sm2._wD(this._s.id + ': waiting');

      // playback faster than download rate, etc.
      s._onbufferchange(1);

    })

  };

  html5OK = function(iO) {

    // playability test based on URL or MIME type

    var result;

    if (!iO || (!iO.type && !iO.url && !iO.serverURL)) {

      // nothing to check
      result = false;

    } else if (iO.serverURL || (iO.type && preferFlashCheck(iO.type))) {

      // RTMP, or preferring flash
      result = false;

    } else {

      // Use type, if specified. Pass data: URIs to HTML5. If HTML5-only mode, no other options, so just give 'er
      result = ((iO.type ? html5CanPlay({type:iO.type}) : html5CanPlay({url:iO.url}) || sm2.html5Only || iO.url.match(/data\:/i)));

    }

    return result;

  };

  html5Unload = function(oAudio) {

    /**
     * Internal method: Unload media, and cancel any current/pending network requests.
     * Firefox can load an empty URL, which allegedly destroys the decoder and stops the download.
     * https://developer.mozilla.org/En/Using_audio_and_video_in_Firefox#Stopping_the_download_of_media
     * However, Firefox has been seen loading a relative URL from '' and thus requesting the hosting page on unload.
     * Other UA behaviour is unclear, so everyone else gets an about:blank-style URL.
     */

    var url;

    if (oAudio) {

      // Firefox and Chrome accept short WAVe data: URIs. Chome dislikes audio/wav, but accepts audio/wav for data: MIME.
      // Desktop Safari complains / fails on data: URI, so it gets about:blank.
      url = (isSafari ? emptyURL : (sm2.html5.canPlayType('audio/wav') ? emptyWAV : emptyURL));

      oAudio.src = url;

      // reset some state, too
      if (oAudio._called_unload !== undefined) {
        oAudio._called_load = false;
      }

    }

    if (useGlobalHTML5Audio) {

      // ensure URL state is trashed, also
      lastGlobalHTML5URL = null;

    }

    return url;

  };

  html5CanPlay = function(o) {

    /**
     * Try to find MIME, test and return truthiness
     * o = {
     *  url: '/path/to/an.mp3',
     *  type: 'audio/mp3'
     * }
     */

    if (!sm2.useHTML5Audio || !sm2.hasHTML5) {
      return false;
    }

    var url = (o.url || null),
        mime = (o.type || null),
        aF = sm2.audioFormats,
        result,
        offset,
        fileExt,
        item;

    // account for known cases like audio/mp3

    if (mime && sm2.html5[mime] !== _undefined) {
      return (sm2.html5[mime] && !preferFlashCheck(mime));
    }

    if (!html5Ext) {
      html5Ext = [];
      for (item in aF) {
        if (aF.hasOwnProperty(item)) {
          html5Ext.push(item);
          if (aF[item].related) {
            html5Ext = html5Ext.concat(aF[item].related);
          }
        }
      }
      html5Ext = new RegExp('\\.('+html5Ext.join('|')+')(\\?.*)?$','i');
    }

    // TODO: Strip URL queries, etc.
    fileExt = (url ? url.toLowerCase().match(html5Ext) : null);

    if (!fileExt || !fileExt.length) {
      if (!mime) {
        result = false;
      } else {
        // audio/mp3 -> mp3, result should be known
        offset = mime.indexOf(';');
        // strip "audio/X; codecs..."
        fileExt = (offset !== -1?mime.substr(0,offset):mime).substr(6);
      }
    } else {
      // match the raw extension name - "mp3", for example
      fileExt = fileExt[1];
    }

    if (fileExt && sm2.html5[fileExt] !== _undefined) {
      // result known
      result = (sm2.html5[fileExt] && !preferFlashCheck(fileExt));
    } else {
      mime = 'audio/'+fileExt;
      result = sm2.html5.canPlayType({type:mime});
      sm2.html5[fileExt] = result;
      // sm2._wD('canPlayType, found result: ' + result);
      result = (result && sm2.html5[mime] && !preferFlashCheck(mime));
    }

    return result;

  };

  testHTML5 = function() {

    /**
     * Internal: Iterates over audioFormats, determining support eg. audio/mp3, audio/mpeg and so on
     * assigns results to html5[] and flash[].
     */

    if (!sm2.useHTML5Audio || !sm2.hasHTML5) {
      // without HTML5, we need Flash.
      sm2.html5.usingFlash = true;
      needsFlash = true;
      return false;
    }

    // double-whammy: Opera 9.64 throws WRONG_ARGUMENTS_ERR if no parameter passed to Audio(), and Webkit + iOS happily tries to load "null" as a URL. :/
    var a = (Audio !== _undefined ? (isOpera && opera.version() < 10 ? new Audio(null) : new Audio()) : null),
        item, lookup, support = {}, aF, i;

    function cp(m) {

      var canPlay, j,
          result = false,
          isOK = false;

      if (!a || typeof a.canPlayType !== 'function') {
        return result;
      }

      if (m instanceof Array) {
        // iterate through all mime types, return any successes
        for (i=0, j=m.length; i<j; i++) {
          if (sm2.html5[m[i]] || a.canPlayType(m[i]).match(sm2.html5Test)) {
            isOK = true;
            sm2.html5[m[i]] = true;
            // note flash support, too
            sm2.flash[m[i]] = !!(m[i].match(flashMIME));
          }
        }
        result = isOK;
      } else {
        canPlay = (a && typeof a.canPlayType === 'function' ? a.canPlayType(m) : false);
        result = !!(canPlay && (canPlay.match(sm2.html5Test)));
      }

      return result;

    }

    // test all registered formats + codecs

    aF = sm2.audioFormats;

    for (item in aF) {

      if (aF.hasOwnProperty(item)) {

        lookup = 'audio/' + item;

        support[item] = cp(aF[item].type);

        // write back generic type too, eg. audio/mp3
        support[lookup] = support[item];

        // assign flash
        if (item.match(flashMIME)) {

          sm2.flash[item] = true;
          sm2.flash[lookup] = true;

        } else {

          sm2.flash[item] = false;
          sm2.flash[lookup] = false;

        }

        // assign result to related formats, too

        if (aF[item] && aF[item].related) {

          for (i=aF[item].related.length-1; i >= 0; i--) {

            // eg. audio/m4a
            support['audio/'+aF[item].related[i]] = support[item];
            sm2.html5[aF[item].related[i]] = support[item];
            sm2.flash[aF[item].related[i]] = support[item];

          }

        }

      }

    }

    support.canPlayType = (a?cp:null);
    sm2.html5 = mixin(sm2.html5, support);

    sm2.html5.usingFlash = featureCheck();
    needsFlash = sm2.html5.usingFlash;

    return true;

  };

  strings = {

    // <d>
    notReady: 'Unavailable - wait until onready() has fired.',
    notOK: 'Audio support is not available.',
    domError: sm + 'exception caught while appending SWF to DOM.',
    spcWmode: 'Removing wmode, preventing known SWF loading issue(s)',
    swf404: smc + 'Verify that %s is a valid path.',
    tryDebug: 'Try ' + sm + '.debugFlash = true for more security details (output goes to SWF.)',
    checkSWF: 'See SWF output for more debug info.',
    localFail: smc + 'Non-HTTP page (' + doc.location.protocol + ' URL?) Review Flash player security settings for this special case:\nhttp://www.macromedia.com/support/documentation/en/flashplayer/help/settings_manager04.html\nMay need to add/allow path, eg. c:/sm2/ or /users/me/sm2/',
    waitFocus: smc + 'Special case: Waiting for SWF to load with window focus...',
    waitForever: smc + 'Waiting indefinitely for Flash (will recover if unblocked)...',
    waitSWF: smc + 'Waiting for 100% SWF load...',
    needFunction: smc + 'Function object expected for %s',
    badID: 'Sound ID "%s" should be a string, starting with a non-numeric character',
    currentObj: smc + '_debug(): Current sound objects',
    waitOnload: smc + 'Waiting for window.onload()',
    docLoaded: smc + 'Document already loaded',
    onload: smc + 'initComplete(): calling soundManager.onload()',
    onloadOK: sm + '.onload() complete',
    didInit: smc + 'init(): Already called?',
    secNote: 'Flash security note: Network/internet URLs will not load due to security restrictions. Access can be configured via Flash Player Global Security Settings Page: http://www.macromedia.com/support/documentation/en/flashplayer/help/settings_manager04.html',
    badRemove: smc + 'Failed to remove Flash node.',
    shutdown: sm + '.disable(): Shutting down',
    queue: smc + 'Queueing %s handler',
    smError: 'SMSound.load(): Exception: JS-Flash communication failed, or JS error.',
    fbTimeout: 'No flash response, applying .'+swfCSS.swfTimedout+' CSS...',
    fbLoaded: 'Flash loaded',
    fbHandler: smc + 'flashBlockHandler()',
    manURL: 'SMSound.load(): Using manually-assigned URL',
    onURL: sm + '.load(): current URL already assigned.',
    badFV: sm + '.flashVersion must be 8 or 9. "%s" is invalid. Reverting to %s.',
    as2loop: 'Note: Setting stream:false so looping can work (flash 8 limitation)',
    noNSLoop: 'Note: Looping not implemented for MovieStar formats',
    needfl9: 'Note: Switching to flash 9, required for MP4 formats.',
    mfTimeout: 'Setting flashLoadTimeout = 0 (infinite) for off-screen, mobile flash case',
    needFlash: smc + 'Fatal error: Flash is needed to play some required formats, but is not available.',
    gotFocus: smc + 'Got window focus.',
    policy: 'Enabling usePolicyFile for data access',
    setup: sm + '.setup(): allowed parameters: %s',
    setupError: sm + '.setup(): "%s" cannot be assigned with this method.',
    setupUndef: sm + '.setup(): Could not find option "%s"',
    setupLate: sm + '.setup(): url, flashVersion and html5Test property changes will not take effect until reboot().',
    noURL: smc + 'Flash URL required. Call soundManager.setup({url:...}) to get started.',
    sm2Loaded: 'SoundManager 2: Ready. ' + String.fromCharCode(10003),
    reset: sm + '.reset(): Removing event callbacks',
    mobileUA: 'Mobile UA detected, preferring HTML5 by default.',
    globalHTML5: 'Using singleton HTML5 Audio() pattern for this device.'
    // </d>

  };

  str = function() {

    // internal string replace helper.
    // arguments: o [,items to replace]
    // <d>

    var args,
        i, j, o,
        sstr;

    // real array, please
    args = slice.call(arguments);

    // first argument
    o = args.shift();

    sstr = (strings && strings[o] ? strings[o] : '');

    if (sstr && args && args.length) {
      for (i = 0, j = args.length; i < j; i++) {
        sstr = sstr.replace('%s', args[i]);
      }
    }

    return sstr;
    // </d>

  };

  loopFix = function(sOpt) {

    // flash 8 requires stream = false for looping to work
    if (fV === 8 && sOpt.loops > 1 && sOpt.stream) {
      _wDS('as2loop');
      sOpt.stream = false;
    }

    return sOpt;

  };

  policyFix = function(sOpt, sPre) {

    if (sOpt && !sOpt.usePolicyFile && (sOpt.onid3 || sOpt.usePeakData || sOpt.useWaveformData || sOpt.useEQData)) {
      sm2._wD((sPre || '') + str('policy'));
      sOpt.usePolicyFile = true;
    }

    return sOpt;

  };

  complain = function(sMsg) {

    // <d>
    if (hasConsole && console.warn !== _undefined) {
      console.warn(sMsg);
    } else {
      sm2._wD(sMsg);
    }
    // </d>

  };

  doNothing = function() {

    return false;

  };

  disableObject = function(o) {

    var oProp;

    for (oProp in o) {
      if (o.hasOwnProperty(oProp) && typeof o[oProp] === 'function') {
        o[oProp] = doNothing;
      }
    }

    oProp = null;

  };

  failSafely = function(bNoDisable) {

    // general failure exception handler

    if (bNoDisable === _undefined) {
      bNoDisable = false;
    }

    if (disabled || bNoDisable) {
      sm2.disable(bNoDisable);
    }

  };

  normalizeMovieURL = function(smURL) {

    var urlParams = null, url;

    if (smURL) {
      if (smURL.match(/\.swf(\?.*)?$/i)) {
        urlParams = smURL.substr(smURL.toLowerCase().lastIndexOf('.swf?') + 4);
        if (urlParams) {
          // assume user knows what they're doing
          return smURL;
        }
      } else if (smURL.lastIndexOf('/') !== smURL.length - 1) {
        // append trailing slash, if needed
        smURL += '/';
      }
    }

    url = (smURL && smURL.lastIndexOf('/') !== - 1 ? smURL.substr(0, smURL.lastIndexOf('/') + 1) : './') + sm2.movieURL;

    if (sm2.noSWFCache) {
      url += ('?ts=' + new Date().getTime());
    }

    return url;

  };

  setVersionInfo = function() {

    // short-hand for internal use

    fV = parseInt(sm2.flashVersion, 10);

    if (fV !== 8 && fV !== 9) {
      sm2._wD(str('badFV', fV, defaultFlashVersion));
      sm2.flashVersion = fV = defaultFlashVersion;
    }

    // debug flash movie, if applicable

    var isDebug = (sm2.debugMode || sm2.debugFlash?'_debug.swf':'.swf');

    if (sm2.useHTML5Audio && !sm2.html5Only && sm2.audioFormats.mp4.required && fV < 9) {
      sm2._wD(str('needfl9'));
      sm2.flashVersion = fV = 9;
    }

    sm2.version = sm2.versionNumber + (sm2.html5Only?' (HTML5-only mode)':(fV === 9?' (AS3/Flash 9)':' (AS2/Flash 8)'));

    // set up default options
    if (fV > 8) {
      // +flash 9 base options
      sm2.defaultOptions = mixin(sm2.defaultOptions, sm2.flash9Options);
      sm2.features.buffering = true;
      // +moviestar support
      sm2.defaultOptions = mixin(sm2.defaultOptions, sm2.movieStarOptions);
      sm2.filePatterns.flash9 = new RegExp('\\.(mp3|' + netStreamTypes.join('|') + ')(\\?.*)?$', 'i');
      sm2.features.movieStar = true;
    } else {
      sm2.features.movieStar = false;
    }

    // regExp for flash canPlay(), etc.
    sm2.filePattern = sm2.filePatterns[(fV !== 8?'flash9':'flash8')];

    // if applicable, use _debug versions of SWFs
    sm2.movieURL = (fV === 8?'soundmanager2.swf':'soundmanager2_flash9.swf').replace('.swf', isDebug);

    sm2.features.peakData = sm2.features.waveformData = sm2.features.eqData = (fV > 8);

  };

  setPolling = function(bPolling, bHighPerformance) {

    if (!flash) {
      return false;
    }

    flash._setPolling(bPolling, bHighPerformance);

  };

  initDebug = function() {

    // starts debug mode, creating output <div> for UAs without console object

    // allow force of debug mode via URL
    // <d>
    if (sm2.debugURLParam.test(wl)) {
      sm2.debugMode = true;
    }

    if (id(sm2.debugID)) {
      return false;
    }

    var oD, oDebug, oTarget, oToggle, tmp;

    if (sm2.debugMode && !id(sm2.debugID) && (!hasConsole || !sm2.useConsole || !sm2.consoleOnly)) {

      oD = doc.createElement('div');
      oD.id = sm2.debugID + '-toggle';

      oToggle = {
        'position': 'fixed',
        'bottom': '0px',
        'right': '0px',
        'width': '1.2em',
        'height': '1.2em',
        'lineHeight': '1.2em',
        'margin': '2px',
        'textAlign': 'center',
        'border': '1px solid #999',
        'cursor': 'pointer',
        'background': '#fff',
        'color': '#333',
        'zIndex': 10001
      };

      oD.appendChild(doc.createTextNode('-'));
      oD.onclick = toggleDebug;
      oD.title = 'Toggle SM2 debug console';

      if (ua.match(/msie 6/i)) {
        oD.style.position = 'absolute';
        oD.style.cursor = 'hand';
      }

      for (tmp in oToggle) {
        if (oToggle.hasOwnProperty(tmp)) {
          oD.style[tmp] = oToggle[tmp];
        }
      }

      oDebug = doc.createElement('div');
      oDebug.id = sm2.debugID;
      oDebug.style.display = (sm2.debugMode?'block':'none');

      if (sm2.debugMode && !id(oD.id)) {
        try {
          oTarget = getDocument();
          oTarget.appendChild(oD);
        } catch(e2) {
          throw new Error(str('domError')+' \n'+e2.toString());
        }
        oTarget.appendChild(oDebug);
      }

    }

    oTarget = null;
    // </d>

  };

  idCheck = this.getSoundById;

  // <d>
  _wDS = function(o, errorLevel) {

    return (!o ? '' : sm2._wD(str(o), errorLevel));

  };

  toggleDebug = function() {

    var o = id(sm2.debugID),
    oT = id(sm2.debugID + '-toggle');

    if (!o) {
      return false;
    }

    if (debugOpen) {
      // minimize
      oT.innerHTML = '+';
      o.style.display = 'none';
    } else {
      oT.innerHTML = '-';
      o.style.display = 'block';
    }

    debugOpen = !debugOpen;

  };

  debugTS = function(sEventType, bSuccess, sMessage) {

    // troubleshooter debug hooks

    if (window.sm2Debugger !== _undefined) {
      try {
        sm2Debugger.handleEvent(sEventType, bSuccess, sMessage);
      } catch(e) {
        // oh well
        return false;
      }
    }

    return true;

  };
  // </d>

  getSWFCSS = function() {

    var css = [];

    if (sm2.debugMode) {
      css.push(swfCSS.sm2Debug);
    }

    if (sm2.debugFlash) {
      css.push(swfCSS.flashDebug);
    }

    if (sm2.useHighPerformance) {
      css.push(swfCSS.highPerf);
    }

    return css.join(' ');

  };

  flashBlockHandler = function() {

    // *possible* flash block situation.

    var name = str('fbHandler'),
        p = sm2.getMoviePercent(),
        css = swfCSS,
        error = {type:'FLASHBLOCK'};

    if (sm2.html5Only) {
      // no flash, or unused
      return false;
    }

    if (!sm2.ok()) {

      if (needsFlash) {
        // make the movie more visible, so user can fix
        sm2.oMC.className = getSWFCSS() + ' ' + css.swfDefault + ' ' + (p === null?css.swfTimedout:css.swfError);
        sm2._wD(name + ': ' + str('fbTimeout') + (p ? ' (' + str('fbLoaded') + ')' : ''));
      }

      sm2.didFlashBlock = true;

      // fire onready(), complain lightly
      processOnEvents({type:'ontimeout', ignoreInit:true, error:error});
      catchError(error);

    } else {

      // SM2 loaded OK (or recovered)

      // <d>
      if (sm2.didFlashBlock) {
        sm2._wD(name + ': Unblocked');
      }
      // </d>

      if (sm2.oMC) {
        sm2.oMC.className = [getSWFCSS(), css.swfDefault, css.swfLoaded + (sm2.didFlashBlock?' '+css.swfUnblocked:'')].join(' ');
      }

    }

  };

  addOnEvent = function(sType, oMethod, oScope) {

    if (on_queue[sType] === _undefined) {
      on_queue[sType] = [];
    }

    on_queue[sType].push({
      'method': oMethod,
      'scope': (oScope || null),
      'fired': false
    });

  };

  processOnEvents = function(oOptions) {

    // if unspecified, assume OK/error

    if (!oOptions) {
      oOptions = {
        type: (sm2.ok() ? 'onready' : 'ontimeout')
      };
    }

    if (!didInit && oOptions && !oOptions.ignoreInit) {
      // not ready yet.
      return false;
    }

    if (oOptions.type === 'ontimeout' && (sm2.ok() || (disabled && !oOptions.ignoreInit))) {
      // invalid case
      return false;
    }

    var status = {
          success: (oOptions && oOptions.ignoreInit?sm2.ok():!disabled)
        },

        // queue specified by type, or none
        srcQueue = (oOptions && oOptions.type?on_queue[oOptions.type]||[]:[]),

        queue = [], i, j,
        args = [status],
        canRetry = (needsFlash && !sm2.ok());

    if (oOptions.error) {
      args[0].error = oOptions.error;
    }

    for (i = 0, j = srcQueue.length; i < j; i++) {
      if (srcQueue[i].fired !== true) {
        queue.push(srcQueue[i]);
      }
    }

    if (queue.length) {
      // sm2._wD(sm + ': Firing ' + queue.length + ' ' + oOptions.type + '() item' + (queue.length === 1 ? '' : 's'));
      for (i = 0, j = queue.length; i < j; i++) {
        if (queue[i].scope) {
          queue[i].method.apply(queue[i].scope, args);
        } else {
          queue[i].method.apply(this, args);
        }
        if (!canRetry) {
          // useFlashBlock and SWF timeout case doesn't count here.
          queue[i].fired = true;
        }
      }
    }

    return true;

  };

  initUserOnload = function() {

    window.setTimeout(function() {

      if (sm2.useFlashBlock) {
        flashBlockHandler();
      }

      processOnEvents();

      // call user-defined "onload", scoped to window

      if (typeof sm2.onload === 'function') {
        _wDS('onload', 1);
        sm2.onload.apply(window);
        _wDS('onloadOK', 1);
      }

      if (sm2.waitForWindowLoad) {
        event.add(window, 'load', initUserOnload);
      }

    },1);

  };

  detectFlash = function() {

    // hat tip: Flash Detect library (BSD, (C) 2007) by Carl "DocYes" S. Yestrau - http://featureblend.com/javascript-flash-detection-library.html / http://featureblend.com/license.txt

    if (hasFlash !== _undefined) {
      // this work has already been done.
      return hasFlash;
    }

    var hasPlugin = false, n = navigator, nP = n.plugins, obj, type, types, AX = window.ActiveXObject;

    if (nP && nP.length) {
      type = 'application/x-shockwave-flash';
      types = n.mimeTypes;
      if (types && types[type] && types[type].enabledPlugin && types[type].enabledPlugin.description) {
        hasPlugin = true;
      }
    } else if (AX !== _undefined && !ua.match(/MSAppHost/i)) {
      // Windows 8 Store Apps (MSAppHost) are weird (compatibility?) and won't complain here, but will barf if Flash/ActiveX object is appended to the DOM.
      try {
        obj = new AX('ShockwaveFlash.ShockwaveFlash');
      } catch(e) {
        // oh well
        obj = null;
      }
      hasPlugin = (!!obj);
      // cleanup, because it is ActiveX after all
      obj = null;
    }

    hasFlash = hasPlugin;

    return hasPlugin;

  };

featureCheck = function() {

    var flashNeeded,
        item,
        formats = sm2.audioFormats,
        // iPhone <= 3.1 has broken HTML5 audio(), but firmware 3.2 (original iPad) + iOS4 works.
        isSpecial = (is_iDevice && !!(ua.match(/os (1|2|3_0|3_1)\s/i)));

    if (isSpecial) {

      // has Audio(), but is broken; let it load links directly.
      sm2.hasHTML5 = false;

      // ignore flash case, however
      sm2.html5Only = true;

      // hide the SWF, if present
      if (sm2.oMC) {
        sm2.oMC.style.display = 'none';
      }

    } else {

      if (sm2.useHTML5Audio) {

        if (!sm2.html5 || !sm2.html5.canPlayType) {
          sm2._wD('SoundManager: No HTML5 Audio() support detected.');
          sm2.hasHTML5 = false;
        }

        // <d>
        if (isBadSafari) {
          sm2._wD(smc + 'Note: Buggy HTML5 Audio in Safari on this OS X release, see https://bugs.webkit.org/show_bug.cgi?id=32159 - ' + (!hasFlash ?' would use flash fallback for MP3/MP4, but none detected.' : 'will use flash fallback for MP3/MP4, if available'), 1);
        }
        // </d>

      }

    }

    if (sm2.useHTML5Audio && sm2.hasHTML5) {

      // sort out whether flash is optional, required or can be ignored.

      // innocent until proven guilty.
      canIgnoreFlash = true;

      for (item in formats) {
        if (formats.hasOwnProperty(item)) {
          if (formats[item].required) {
            if (!sm2.html5.canPlayType(formats[item].type)) {
              // 100% HTML5 mode is not possible.
              canIgnoreFlash = false;
              flashNeeded = true;
            } else if (sm2.preferFlash && (sm2.flash[item] || sm2.flash[formats[item].type])) {
              // flash may be required, or preferred for this format.
              flashNeeded = true;
            }
          }
        }
      }

    }

    // sanity check...
    if (sm2.ignoreFlash) {
      flashNeeded = false;
      canIgnoreFlash = true;
    }

    sm2.html5Only = (sm2.hasHTML5 && sm2.useHTML5Audio && !flashNeeded);

    return (!sm2.html5Only);

  };

  parseURL = function(url) {

    /**
     * Internal: Finds and returns the first playable URL (or failing that, the first URL.)
     * @param {string or array} url A single URL string, OR, an array of URL strings or {url:'/path/to/resource', type:'audio/mp3'} objects.
     */

    var i, j, urlResult = 0, result;

    if (url instanceof Array) {

      // find the first good one
      for (i=0, j=url.length; i<j; i++) {

        if (url[i] instanceof Object) {
          // MIME check
          if (sm2.canPlayMIME(url[i].type)) {
            urlResult = i;
            break;
          }

        } else if (sm2.canPlayURL(url[i])) {
          // URL string check
          urlResult = i;
          break;
        }

      }

      // normalize to string
      if (url[urlResult].url) {
        url[urlResult] = url[urlResult].url;
      }

      result = url[urlResult];

    } else {

      // single URL case
      result = url;

    }

    return result;

  };


  startTimer = function(oSound) {

    /**
     * attach a timer to this sound, and start an interval if needed
     */

    if (!oSound._hasTimer) {

      oSound._hasTimer = true;

      if (!mobileHTML5 && sm2.html5PollingInterval) {

        if (h5IntervalTimer === null && h5TimerCount === 0) {

          h5IntervalTimer = setInterval(timerExecute, sm2.html5PollingInterval);

        }

        h5TimerCount++;

      }

    }

  };

  stopTimer = function(oSound) {

    /**
     * detach a timer
     */

    if (oSound._hasTimer) {

      oSound._hasTimer = false;

      if (!mobileHTML5 && sm2.html5PollingInterval) {

        // interval will stop itself at next execution.

        h5TimerCount--;

      }

    }

  };

  timerExecute = function() {

    /**
     * manual polling for HTML5 progress events, ie., whileplaying() (can achieve greater precision than conservative default HTML5 interval)
     */

    var i;

    if (h5IntervalTimer !== null && !h5TimerCount) {

      // no active timers, stop polling interval.

      clearInterval(h5IntervalTimer);

      h5IntervalTimer = null;

      return false;

    }

    // check all HTML5 sounds with timers

    for (i = sm2.soundIDs.length-1; i >= 0; i--) {

      if (sm2.sounds[sm2.soundIDs[i]].isHTML5 && sm2.sounds[sm2.soundIDs[i]]._hasTimer) {

        sm2.sounds[sm2.soundIDs[i]]._onTimer();

      }

    }

  };

  catchError = function(options) {

    options = (options !== _undefined ? options : {});

    if (typeof sm2.onerror === 'function') {
      sm2.onerror.apply(window, [{type:(options.type !== _undefined ? options.type : null)}]);
    }

    if (options.fatal !== _undefined && options.fatal) {
      sm2.disable();
    }

  };

  badSafariFix = function() {

    // special case: "bad" Safari (OS X 10.3 - 10.7) must fall back to flash for MP3/MP4
    if (!isBadSafari || !detectFlash()) {
      // doesn't apply
      return false;
    }

    var aF = sm2.audioFormats, i, item;

    for (item in aF) {
      if (aF.hasOwnProperty(item)) {
        if (item === 'mp3' || item === 'mp4') {
          sm2._wD(sm + ': Using flash fallback for ' + item + ' format');
          sm2.html5[item] = false;
          // assign result to related formats, too
          if (aF[item] && aF[item].related) {
            for (i = aF[item].related.length-1; i >= 0; i--) {
              sm2.html5[aF[item].related[i]] = false;
            }
          }
        }
      }
    }

  };

  /**
   * Pseudo-private flash/ExternalInterface methods
   * ----------------------------------------------
   */

  this._setSandboxType = function(sandboxType) {

    // <d>
    var sb = sm2.sandbox;

    sb.type = sandboxType;
    sb.description = sb.types[(sb.types[sandboxType] !== _undefined?sandboxType:'unknown')];

    if (sb.type === 'localWithFile') {

      sb.noRemote = true;
      sb.noLocal = false;
      _wDS('secNote', 2);

    } else if (sb.type === 'localWithNetwork') {

      sb.noRemote = false;
      sb.noLocal = true;

    } else if (sb.type === 'localTrusted') {

      sb.noRemote = false;
      sb.noLocal = false;

    }
    // </d>

  };

  this._externalInterfaceOK = function(swfVersion) {

    // flash callback confirming flash loaded, EI working etc.
    // swfVersion: SWF build string

    if (sm2.swfLoaded) {
      return false;
    }

    var e;

    debugTS('swf', true);
    debugTS('flashtojs', true);
    sm2.swfLoaded = true;
    tryInitOnFocus = false;

    if (isBadSafari) {
      badSafariFix();
    }

    // complain if JS + SWF build/version strings don't match, excluding +DEV builds
    // <d>
    if (!swfVersion || swfVersion.replace(/\+dev/i,'') !== sm2.versionNumber.replace(/\+dev/i, '')) {

      e = sm + ': Fatal: JavaScript file build "' + sm2.versionNumber + '" does not match Flash SWF build "' + swfVersion + '" at ' + sm2.url + '. Ensure both are up-to-date.';

      // escape flash -> JS stack so this error fires in window.
      setTimeout(function versionMismatch() {
        throw new Error(e);
      }, 0);

      // exit, init will fail with timeout
      return false;

    }
    // </d>

    // IE needs a larger timeout
    setTimeout(init, isIE ? 100 : 1);

  };

  /**
   * Private initialization helpers
   * ------------------------------
   */

  createMovie = function(smID, smURL) {

    if (didAppend && appendSuccess) {
      // ignore if already succeeded
      return false;
    }

    function initMsg() {

      // <d>

      var options = [],
          title,
          msg = [],
          delimiter = ' + ';

      title = 'SoundManager ' + sm2.version + (!sm2.html5Only && sm2.useHTML5Audio ? (sm2.hasHTML5 ? ' + HTML5 audio' : ', no HTML5 audio support') : '');

      if (!sm2.html5Only) {

        if (sm2.preferFlash) {
          options.push('preferFlash');
        }

        if (sm2.useHighPerformance) {
          options.push('useHighPerformance');
        }

        if (sm2.flashPollingInterval) {
          options.push('flashPollingInterval (' + sm2.flashPollingInterval + 'ms)');
        }

        if (sm2.html5PollingInterval) {
          options.push('html5PollingInterval (' + sm2.html5PollingInterval + 'ms)');
        }

        if (sm2.wmode) {
          options.push('wmode (' + sm2.wmode + ')');
        }

        if (sm2.debugFlash) {
          options.push('debugFlash');
        }

        if (sm2.useFlashBlock) {
          options.push('flashBlock');
        }

      } else {

        if (sm2.html5PollingInterval) {
          options.push('html5PollingInterval (' + sm2.html5PollingInterval + 'ms)');
        }

      }

      if (options.length) {
        msg = msg.concat([options.join(delimiter)]);
      }

      sm2._wD(title + (msg.length ? delimiter + msg.join(', ') : ''), 1);

      showSupport();

      // </d>

    }

    if (sm2.html5Only) {

      // 100% HTML5 mode
      setVersionInfo();

      initMsg();
      sm2.oMC = id(sm2.movieID);
      init();

      // prevent multiple init attempts
      didAppend = true;

      appendSuccess = true;

      return false;

    }

    // flash path
    var remoteURL = (smURL || sm2.url),
    localURL = (sm2.altURL || remoteURL),
    swfTitle = 'JS/Flash audio component (SoundManager 2)',
    oTarget = getDocument(),
    extraClass = getSWFCSS(),
    isRTL = null,
    html = doc.getElementsByTagName('html')[0],
    oEmbed, oMovie, tmp, movieHTML, oEl, s, x, sClass;

    isRTL = (html && html.dir && html.dir.match(/rtl/i));
    smID = (smID === _undefined?sm2.id:smID);

    function param(name, value) {
      return '<param name="'+name+'" value="'+value+'" />';
    }

    // safety check for legacy (change to Flash 9 URL)
    setVersionInfo();
    sm2.url = normalizeMovieURL(overHTTP?remoteURL:localURL);
    smURL = sm2.url;

    sm2.wmode = (!sm2.wmode && sm2.useHighPerformance ? 'transparent' : sm2.wmode);

    if (sm2.wmode !== null && (ua.match(/msie 8/i) || (!isIE && !sm2.useHighPerformance)) && navigator.platform.match(/win32|win64/i)) {
      /**
       * extra-special case: movie doesn't load until scrolled into view when using wmode = anything but 'window' here
       * does not apply when using high performance (position:fixed means on-screen), OR infinite flash load timeout
       * wmode breaks IE 8 on Vista + Win7 too in some cases, as of January 2011 (?)
       */
      messages.push(strings.spcWmode);
      sm2.wmode = null;
    }

    oEmbed = {
      'name': smID,
      'id': smID,
      'src': smURL,
      'quality': 'high',
      'allowScriptAccess': sm2.allowScriptAccess,
      'bgcolor': sm2.bgColor,
      'pluginspage': http+'www.macromedia.com/go/getflashplayer',
      'title': swfTitle,
      'type': 'application/x-shockwave-flash',
      'wmode': sm2.wmode,
      // http://help.adobe.com/en_US/as3/mobile/WS4bebcd66a74275c36cfb8137124318eebc6-7ffd.html
      'hasPriority': 'true'
    };

    if (sm2.debugFlash) {
      oEmbed.FlashVars = 'debug=1';
    }

    if (!sm2.wmode) {
      // don't write empty attribute
      delete oEmbed.wmode;
    }

    if (isIE) {

      // IE is "special".
      oMovie = doc.createElement('div');
      movieHTML = [
        '<object id="' + smID + '" data="' + smURL + '" type="' + oEmbed.type + '" title="' + oEmbed.title +'" classid="clsid:D27CDB6E-AE6D-11cf-96B8-444553540000" codebase="' + http+'download.macromedia.com/pub/shockwave/cabs/flash/swflash.cab#version=6,0,40,0">',
        param('movie', smURL),
        param('AllowScriptAccess', sm2.allowScriptAccess),
        param('quality', oEmbed.quality),
        (sm2.wmode? param('wmode', sm2.wmode): ''),
        param('bgcolor', sm2.bgColor),
        param('hasPriority', 'true'),
        (sm2.debugFlash ? param('FlashVars', oEmbed.FlashVars) : ''),
        '</object>'
      ].join('');

    } else {

      oMovie = doc.createElement('embed');
      for (tmp in oEmbed) {
        if (oEmbed.hasOwnProperty(tmp)) {
          oMovie.setAttribute(tmp, oEmbed[tmp]);
        }
      }

    }

    initDebug();
    extraClass = getSWFCSS();
    oTarget = getDocument();

    if (oTarget) {

      sm2.oMC = (id(sm2.movieID) || doc.createElement('div'));

      if (!sm2.oMC.id) {

        sm2.oMC.id = sm2.movieID;
        sm2.oMC.className = swfCSS.swfDefault + ' ' + extraClass;
        s = null;
        oEl = null;

        if (!sm2.useFlashBlock) {
          if (sm2.useHighPerformance) {
            // on-screen at all times
            s = {
              'position': 'fixed',
              'width': '8px',
              'height': '8px',
              // >= 6px for flash to run fast, >= 8px to start up under Firefox/win32 in some cases. odd? yes.
              'bottom': '0px',
              'left': '0px',
              'overflow': 'hidden'
            };
          } else {
            // hide off-screen, lower priority
            s = {
              'position': 'absolute',
              'width': '6px',
              'height': '6px',
              'top': '-9999px',
              'left': '-9999px'
            };
            if (isRTL) {
              s.left = Math.abs(parseInt(s.left,10))+'px';
            }
          }
        }

        if (isWebkit) {
          // soundcloud-reported render/crash fix, safari 5
          sm2.oMC.style.zIndex = 10000;
        }

        if (!sm2.debugFlash) {
          for (x in s) {
            if (s.hasOwnProperty(x)) {
              sm2.oMC.style[x] = s[x];
            }
          }
        }

        try {
          if (!isIE) {
            sm2.oMC.appendChild(oMovie);
          }
          oTarget.appendChild(sm2.oMC);
          if (isIE) {
            oEl = sm2.oMC.appendChild(doc.createElement('div'));
            oEl.className = swfCSS.swfBox;
            oEl.innerHTML = movieHTML;
          }
          appendSuccess = true;
        } catch(e) {
          throw new Error(str('domError')+' \n'+e.toString());
        }

      } else {

        // SM2 container is already in the document (eg. flashblock use case)
        sClass = sm2.oMC.className;
        sm2.oMC.className = (sClass?sClass+' ':swfCSS.swfDefault) + (extraClass?' '+extraClass:'');
        sm2.oMC.appendChild(oMovie);
        if (isIE) {
          oEl = sm2.oMC.appendChild(doc.createElement('div'));
          oEl.className = swfCSS.swfBox;
          oEl.innerHTML = movieHTML;
        }
        appendSuccess = true;

      }

    }

    didAppend = true;
    initMsg();
    // sm2._wD(sm + ': Trying to load ' + smURL + (!overHTTP && sm2.altURL ? ' (alternate URL)' : ''), 1);

    return true;

  };

  initMovie = function() {

    if (sm2.html5Only) {
      createMovie();
      return false;
    }

    // attempt to get, or create, movie (may already exist)
    if (flash) {
      return false;
    }

    if (!sm2.url) {

      /**
       * Something isn't right - we've reached init, but the soundManager url property has not been set.
       * User has not called setup({url: ...}), or has not set soundManager.url (legacy use case) directly before init time.
       * Notify and exit. If user calls setup() with a url: property, init will be restarted as in the deferred loading case.
       */

       _wDS('noURL');
       return false;

    }

    // inline markup case
    flash = sm2.getMovie(sm2.id);

    if (!flash) {
      if (!oRemoved) {
        // try to create
        createMovie(sm2.id, sm2.url);
      } else {
        // try to re-append removed movie after reboot()
        if (!isIE) {
          sm2.oMC.appendChild(oRemoved);
        } else {
          sm2.oMC.innerHTML = oRemovedHTML;
        }
        oRemoved = null;
        didAppend = true;
      }
      flash = sm2.getMovie(sm2.id);
    }

    if (typeof sm2.oninitmovie === 'function') {
      setTimeout(sm2.oninitmovie, 1);
    }

    // <d>
    flushMessages();
    // </d>

    return true;

  };

  delayWaitForEI = function() {

    setTimeout(waitForEI, 1000);

  };

  rebootIntoHTML5 = function() {

    // special case: try for a reboot with preferFlash: false, if 100% HTML5 mode is possible and useFlashBlock is not enabled.

    window.setTimeout(function() {

      complain(smc + 'useFlashBlock is false, 100% HTML5 mode is possible. Rebooting with preferFlash: false...');

      sm2.setup({
        preferFlash: false
      }).reboot();

      // if for some reason you want to detect this case, use an ontimeout() callback and look for html5Only and didFlashBlock == true.
      sm2.didFlashBlock = true;

      sm2.beginDelayedInit();

    }, 1);

  };

  waitForEI = function() {

    var p,
        loadIncomplete = false;

    if (!sm2.url) {
      // No SWF url to load (noURL case) - exit for now. Will be retried when url is set.
      return false;
    }

    if (waitingForEI) {
      return false;
    }

    waitingForEI = true;
    event.remove(window, 'load', delayWaitForEI);

    if (hasFlash && tryInitOnFocus && !isFocused) {
      // Safari won't load flash in background tabs, only when focused.
      _wDS('waitFocus');
      return false;
    }

    if (!didInit) {
      p = sm2.getMoviePercent();
      if (p > 0 && p < 100) {
        loadIncomplete = true;
      }
    }

    setTimeout(function() {

      p = sm2.getMoviePercent();

      if (loadIncomplete) {
        // special case: if movie *partially* loaded, retry until it's 100% before assuming failure.
        waitingForEI = false;
        sm2._wD(str('waitSWF'));
        window.setTimeout(delayWaitForEI, 1);
        return false;
      }

      // <d>
      if (!didInit) {

        sm2._wD(sm + ': No Flash response within expected time. Likely causes: ' + (p === 0 ? 'SWF load failed, ':'') + 'Flash blocked or JS-Flash security error.' + (sm2.debugFlash?' ' + str('checkSWF'):''), 2);

        if (!overHTTP && p) {

          _wDS('localFail', 2);

          if (!sm2.debugFlash) {
            _wDS('tryDebug', 2);
          }

        }

        if (p === 0) {

          // if 0 (not null), probably a 404.
          sm2._wD(str('swf404', sm2.url), 1);

        }

        debugTS('flashtojs', false, ': Timed out' + overHTTP?' (Check flash security or flash blockers)':' (No plugin/missing SWF?)');

      }
      // </d>

      // give up / time-out, depending

      if (!didInit && okToDisable) {

        if (p === null) {

          // SWF failed to report load progress. Possibly blocked.

          if (sm2.useFlashBlock || sm2.flashLoadTimeout === 0) {

            if (sm2.useFlashBlock) {

              flashBlockHandler();

            }

            _wDS('waitForever');

          } else {

            // no custom flash block handling, but SWF has timed out. Will recover if user unblocks / allows SWF load.

            if (!sm2.useFlashBlock && canIgnoreFlash) {

              rebootIntoHTML5();

            } else {

              _wDS('waitForever');

              // fire any regular registered ontimeout() listeners.
              processOnEvents({type:'ontimeout', ignoreInit: true, error: {type: 'INIT_FLASHBLOCK'}});

            }

          }

        } else {

          // SWF loaded? Shouldn't be a blocking issue, then.

          if (sm2.flashLoadTimeout === 0) {

            _wDS('waitForever');

          } else {

            if (!sm2.useFlashBlock && canIgnoreFlash) {

              rebootIntoHTML5();

            } else {

              failSafely(true);

            }

          }

        }

      }

    }, sm2.flashLoadTimeout);

  };

  handleFocus = function() {

    function cleanup() {
      event.remove(window, 'focus', handleFocus);
    }

    if (isFocused || !tryInitOnFocus) {
      // already focused, or not special Safari background tab case
      cleanup();
      return true;
    }

    okToDisable = true;
    isFocused = true;
    _wDS('gotFocus');

    // allow init to restart
    waitingForEI = false;

    // kick off ExternalInterface timeout, now that the SWF has started
    delayWaitForEI();

    cleanup();
    return true;

  };

  flushMessages = function() {

    // <d>

    // SM2 pre-init debug messages
    if (messages.length) {
      sm2._wD('SoundManager 2: ' + messages.join(' '), 1);
      messages = [];
    }

    // </d>

  };

  showSupport = function() {

    // <d>

    flushMessages();

    var item, tests = [];

    if (sm2.useHTML5Audio && sm2.hasHTML5) {
      for (item in sm2.audioFormats) {
        if (sm2.audioFormats.hasOwnProperty(item)) {
          tests.push(item + ' = ' + sm2.html5[item] + (!sm2.html5[item] && needsFlash && sm2.flash[item] ? ' (using flash)' : (sm2.preferFlash && sm2.flash[item] && needsFlash ? ' (preferring flash)': (!sm2.html5[item] ? ' (' + (sm2.audioFormats[item].required ? 'required, ':'') + 'and no flash support)' : ''))));
        }
      }
      sm2._wD('SoundManager 2 HTML5 support: ' + tests.join(', '), 1);
    }

    // </d>

  };

  initComplete = function(bNoDisable) {

    if (didInit) {
      return false;
    }

    if (sm2.html5Only) {
      // all good.
      _wDS('sm2Loaded', 1);
      didInit = true;
      initUserOnload();
      debugTS('onload', true);
      return true;
    }

    var wasTimeout = (sm2.useFlashBlock && sm2.flashLoadTimeout && !sm2.getMoviePercent()),
        result = true,
        error;

    if (!wasTimeout) {
      didInit = true;
    }

    error = {type: (!hasFlash && needsFlash ? 'NO_FLASH' : 'INIT_TIMEOUT')};

    sm2._wD('SoundManager 2 ' + (disabled ? 'failed to load' : 'loaded') + ' (' + (disabled ? 'Flash security/load error' : 'OK') + ') ' + String.fromCharCode(disabled ? 10006 : 10003), disabled ? 2: 1);

    if (disabled || bNoDisable) {
      if (sm2.useFlashBlock && sm2.oMC) {
        sm2.oMC.className = getSWFCSS() + ' ' + (sm2.getMoviePercent() === null?swfCSS.swfTimedout:swfCSS.swfError);
      }
      processOnEvents({type:'ontimeout', error:error, ignoreInit: true});
      debugTS('onload', false);
      catchError(error);
      result = false;
    } else {
      debugTS('onload', true);
    }

    if (!disabled) {
      if (sm2.waitForWindowLoad && !windowLoaded) {
        _wDS('waitOnload');
        event.add(window, 'load', initUserOnload);
      } else {
        // <d>
        if (sm2.waitForWindowLoad && windowLoaded) {
          _wDS('docLoaded');
        }
        // </d>
        initUserOnload();
      }
    }

    return result;

  };

  /**
   * apply top-level setupOptions object as local properties, eg., this.setupOptions.flashVersion -> this.flashVersion (soundManager.flashVersion)
   * this maintains backward compatibility, and allows properties to be defined separately for use by soundManager.setup().
   */

  setProperties = function() {

    var i,
        o = sm2.setupOptions;

    for (i in o) {

      if (o.hasOwnProperty(i)) {

        // assign local property if not already defined

        if (sm2[i] === _undefined) {

          sm2[i] = o[i];

        } else if (sm2[i] !== o[i]) {

          // legacy support: write manually-assigned property (eg., soundManager.url) back to setupOptions to keep things in sync
          sm2.setupOptions[i] = sm2[i];

        }

      }

    }

  };


  init = function() {

    // called after onload()

    if (didInit) {
      _wDS('didInit');
      return false;
    }

    function cleanup() {
      event.remove(window, 'load', sm2.beginDelayedInit);
    }

    if (sm2.html5Only) {
      if (!didInit) {
        // we don't need no steenking flash!
        cleanup();
        sm2.enabled = true;
        initComplete();
      }
      return true;
    }

    // flash path
    initMovie();

    try {

      // attempt to talk to Flash
      flash._externalInterfaceTest(false);

      // apply user-specified polling interval, OR, if "high performance" set, faster vs. default polling
      // (determines frequency of whileloading/whileplaying callbacks, effectively driving UI framerates)
      setPolling(true, (sm2.flashPollingInterval || (sm2.useHighPerformance ? 10 : 50)));

      if (!sm2.debugMode) {
        // stop the SWF from making debug output calls to JS
        flash._disableDebug();
      }

      sm2.enabled = true;
      debugTS('jstoflash', true);

      if (!sm2.html5Only) {
        // prevent browser from showing cached page state (or rather, restoring "suspended" page state) via back button, because flash may be dead
        // http://www.webkit.org/blog/516/webkit-page-cache-ii-the-unload-event/
        event.add(window, 'unload', doNothing);
      }

    } catch(e) {

      sm2._wD('js/flash exception: ' + e.toString());
      debugTS('jstoflash', false);
      catchError({type:'JS_TO_FLASH_EXCEPTION', fatal:true});
      // don't disable, for reboot()
      failSafely(true);
      initComplete();

      return false;

    }

    initComplete();

    // disconnect events
    cleanup();

    return true;

  };

  domContentLoaded = function() {

    if (didDCLoaded) {
      return false;
    }

    didDCLoaded = true;

    // assign top-level soundManager properties eg. soundManager.url
    setProperties();

    initDebug();

    /**
     * Temporary feature: allow force of HTML5 via URL params: sm2-usehtml5audio=0 or 1
     * Ditto for sm2-preferFlash, too.
     */
    // <d>
    (function(){

      var a = 'sm2-usehtml5audio=',
          a2 = 'sm2-preferflash=',
          b = null,
          b2 = null,
          l = wl.toLowerCase();

      if (l.indexOf(a) !== -1) {
        b = (l.charAt(l.indexOf(a)+a.length) === '1');
        if (hasConsole) {
          console.log((b?'Enabling ':'Disabling ')+'useHTML5Audio via URL parameter');
        }
        sm2.setup({
          'useHTML5Audio': b
        });
      }

      if (l.indexOf(a2) !== -1) {
        b2 = (l.charAt(l.indexOf(a2)+a2.length) === '1');
        if (hasConsole) {
          console.log((b2?'Enabling ':'Disabling ')+'preferFlash via URL parameter');
        }
        sm2.setup({
          'preferFlash': b2
        });
      }

    }());
    // </d>

    if (!hasFlash && sm2.hasHTML5) {
      sm2._wD('SoundManager 2: No Flash detected' + (!sm2.useHTML5Audio ? ', enabling HTML5.' : '. Trying HTML5-only mode.'), 1);
      sm2.setup({
        'useHTML5Audio': true,
        // make sure we aren't preferring flash, either
        // TODO: preferFlash should not matter if flash is not installed. Currently, stuff breaks without the below tweak.
        'preferFlash': false
      });
    }

    testHTML5();

    if (!hasFlash && needsFlash) {
      messages.push(strings.needFlash);
      // TODO: Fatal here vs. timeout approach, etc.
      // hack: fail sooner.
      sm2.setup({
        'flashLoadTimeout': 1
      });
    }

    if (doc.removeEventListener) {
      doc.removeEventListener('DOMContentLoaded', domContentLoaded, false);
    }

    initMovie();

    return true;

  };

  domContentLoadedIE = function() {

    if (doc.readyState === 'complete') {
      domContentLoaded();
      doc.detachEvent('onreadystatechange', domContentLoadedIE);
    }

    return true;

  };

  winOnLoad = function() {

    // catch edge case of initComplete() firing after window.load()
    windowLoaded = true;

    // catch case where DOMContentLoaded has been sent, but we're still in doc.readyState = 'interactive'
    domContentLoaded();

    event.remove(window, 'load', winOnLoad);

  };

  /**
   * miscellaneous run-time, pre-init stuff
   */

  preInit = function() {

    if (mobileHTML5) {

      // prefer HTML5 for mobile + tablet-like devices, probably more reliable vs. flash at this point.

      // <d>
      if (!sm2.setupOptions.useHTML5Audio || sm2.setupOptions.preferFlash) {
        // notify that defaults are being changed.
        messages.push(strings.mobileUA);
      }
      // </d>

      sm2.setupOptions.useHTML5Audio = true;
      sm2.setupOptions.preferFlash = false;

      if (is_iDevice || (isAndroid && !ua.match(/android\s2\.3/i))) {
        // iOS and Android devices tend to work better with a single audio instance, specifically for chained playback of sounds in sequence.
        // common use case: exiting sound onfinish() -> createSound() -> play()
        // <d>
        messages.push(strings.globalHTML5);
        // </d>
        if (is_iDevice) {
          sm2.ignoreFlash = true;
        }
        useGlobalHTML5Audio = true;
      }

    }

  };

  preInit();

  // sniff up-front
  detectFlash();

  // focus and window load, init (primarily flash-driven)
  event.add(window, 'focus', handleFocus);
  event.add(window, 'load', delayWaitForEI);
  event.add(window, 'load', winOnLoad);

  if (doc.addEventListener) {

    doc.addEventListener('DOMContentLoaded', domContentLoaded, false);

  } else if (doc.attachEvent) {

    doc.attachEvent('onreadystatechange', domContentLoadedIE);

  } else {

    // no add/attachevent support - safe to assume no JS -> Flash either
    debugTS('onload', false);
    catchError({type:'NO_DOM2_EVENTS', fatal:true});

  }

} // SoundManager()

// SM2_DEFER details: http://www.schillmania.com/projects/soundmanager2/doc/getstarted/#lazy-loading

if (window.SM2_DEFER === undefined || !SM2_DEFER) {
  soundManager = new SoundManager();
}

/**
 * SoundManager public interfaces
 * ------------------------------
 */

if (typeof module === 'object' && module && typeof module.exports === 'object') {

  /**
   * commonJS module
   * note: SM2 requires a window global due to Flash, which makes calls to window.soundManager.
   * flash may not always be needed, but this is not known until async init and SM2 may even "reboot" into Flash mode.
   */

  window.soundManager = soundManager;

  module.exports.SoundManager = SoundManager;
  module.exports.soundManager = soundManager;

} else if (typeof define === 'function' && define.amd) {

  // AMD - requireJS

  define('SoundManager', [], function() {
    return {
      SoundManager: SoundManager,
      soundManager: soundManager
    };
  });

} else {

  // standard browser case

  window.SoundManager = SoundManager; // constructor
  window.soundManager = soundManager; // public API, flash callbacks etc.

}

}(window));

},{}],"/home/jvwong/Projects/shellac/shellac.no-ip.ca/source/shellac/static/shellac/js/node_modules/moment/moment.js":[function(require,module,exports){
(function (global){
//! moment.js
//! version : 2.8.3
//! authors : Tim Wood, Iskren Chernev, Moment.js contributors
//! license : MIT
//! momentjs.com

(function (undefined) {
    /************************************
        Constants
    ************************************/

    var moment,
        VERSION = '2.8.3',
        // the global-scope this is NOT the global object in Node.js
        globalScope = typeof global !== 'undefined' ? global : this,
        oldGlobalMoment,
        round = Math.round,
        hasOwnProperty = Object.prototype.hasOwnProperty,
        i,

        YEAR = 0,
        MONTH = 1,
        DATE = 2,
        HOUR = 3,
        MINUTE = 4,
        SECOND = 5,
        MILLISECOND = 6,

        // internal storage for locale config files
        locales = {},

        // extra moment internal properties (plugins register props here)
        momentProperties = [],

        // check for nodeJS
        hasModule = (typeof module !== 'undefined' && module.exports),

        // ASP.NET json date format regex
        aspNetJsonRegex = /^\/?Date\((\-?\d+)/i,
        aspNetTimeSpanJsonRegex = /(\-)?(?:(\d*)\.)?(\d+)\:(\d+)(?:\:(\d+)\.?(\d{3})?)?/,

        // from http://docs.closure-library.googlecode.com/git/closure_goog_date_date.js.source.html
        // somewhat more in line with 4.4.3.2 2004 spec, but allows decimal anywhere
        isoDurationRegex = /^(-)?P(?:(?:([0-9,.]*)Y)?(?:([0-9,.]*)M)?(?:([0-9,.]*)D)?(?:T(?:([0-9,.]*)H)?(?:([0-9,.]*)M)?(?:([0-9,.]*)S)?)?|([0-9,.]*)W)$/,

        // format tokens
        formattingTokens = /(\[[^\[]*\])|(\\)?(Mo|MM?M?M?|Do|DDDo|DD?D?D?|ddd?d?|do?|w[o|w]?|W[o|W]?|Q|YYYYYY|YYYYY|YYYY|YY|gg(ggg?)?|GG(GGG?)?|e|E|a|A|hh?|HH?|mm?|ss?|S{1,4}|X|zz?|ZZ?|.)/g,
        localFormattingTokens = /(\[[^\[]*\])|(\\)?(LT|LL?L?L?|l{1,4})/g,

        // parsing token regexes
        parseTokenOneOrTwoDigits = /\d\d?/, // 0 - 99
        parseTokenOneToThreeDigits = /\d{1,3}/, // 0 - 999
        parseTokenOneToFourDigits = /\d{1,4}/, // 0 - 9999
        parseTokenOneToSixDigits = /[+\-]?\d{1,6}/, // -999,999 - 999,999
        parseTokenDigits = /\d+/, // nonzero number of digits
        parseTokenWord = /[0-9]*['a-z\u00A0-\u05FF\u0700-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]+|[\u0600-\u06FF\/]+(\s*?[\u0600-\u06FF]+){1,2}/i, // any word (or two) characters or numbers including two/three word month in arabic.
        parseTokenTimezone = /Z|[\+\-]\d\d:?\d\d/gi, // +00:00 -00:00 +0000 -0000 or Z
        parseTokenT = /T/i, // T (ISO separator)
        parseTokenTimestampMs = /[\+\-]?\d+(\.\d{1,3})?/, // 123456789 123456789.123
        parseTokenOrdinal = /\d{1,2}/,

        //strict parsing regexes
        parseTokenOneDigit = /\d/, // 0 - 9
        parseTokenTwoDigits = /\d\d/, // 00 - 99
        parseTokenThreeDigits = /\d{3}/, // 000 - 999
        parseTokenFourDigits = /\d{4}/, // 0000 - 9999
        parseTokenSixDigits = /[+-]?\d{6}/, // -999,999 - 999,999
        parseTokenSignedNumber = /[+-]?\d+/, // -inf - inf

        // iso 8601 regex
        // 0000-00-00 0000-W00 or 0000-W00-0 + T + 00 or 00:00 or 00:00:00 or 00:00:00.000 + +00:00 or +0000 or +00)
        isoRegex = /^\s*(?:[+-]\d{6}|\d{4})-(?:(\d\d-\d\d)|(W\d\d$)|(W\d\d-\d)|(\d\d\d))((T| )(\d\d(:\d\d(:\d\d(\.\d+)?)?)?)?([\+\-]\d\d(?::?\d\d)?|\s*Z)?)?$/,

        isoFormat = 'YYYY-MM-DDTHH:mm:ssZ',

        isoDates = [
            ['YYYYYY-MM-DD', /[+-]\d{6}-\d{2}-\d{2}/],
            ['YYYY-MM-DD', /\d{4}-\d{2}-\d{2}/],
            ['GGGG-[W]WW-E', /\d{4}-W\d{2}-\d/],
            ['GGGG-[W]WW', /\d{4}-W\d{2}/],
            ['YYYY-DDD', /\d{4}-\d{3}/]
        ],

        // iso time formats and regexes
        isoTimes = [
            ['HH:mm:ss.SSSS', /(T| )\d\d:\d\d:\d\d\.\d+/],
            ['HH:mm:ss', /(T| )\d\d:\d\d:\d\d/],
            ['HH:mm', /(T| )\d\d:\d\d/],
            ['HH', /(T| )\d\d/]
        ],

        // timezone chunker '+10:00' > ['10', '00'] or '-1530' > ['-15', '30']
        parseTimezoneChunker = /([\+\-]|\d\d)/gi,

        // getter and setter names
        proxyGettersAndSetters = 'Date|Hours|Minutes|Seconds|Milliseconds'.split('|'),
        unitMillisecondFactors = {
            'Milliseconds' : 1,
            'Seconds' : 1e3,
            'Minutes' : 6e4,
            'Hours' : 36e5,
            'Days' : 864e5,
            'Months' : 2592e6,
            'Years' : 31536e6
        },

        unitAliases = {
            ms : 'millisecond',
            s : 'second',
            m : 'minute',
            h : 'hour',
            d : 'day',
            D : 'date',
            w : 'week',
            W : 'isoWeek',
            M : 'month',
            Q : 'quarter',
            y : 'year',
            DDD : 'dayOfYear',
            e : 'weekday',
            E : 'isoWeekday',
            gg: 'weekYear',
            GG: 'isoWeekYear'
        },

        camelFunctions = {
            dayofyear : 'dayOfYear',
            isoweekday : 'isoWeekday',
            isoweek : 'isoWeek',
            weekyear : 'weekYear',
            isoweekyear : 'isoWeekYear'
        },

        // format function strings
        formatFunctions = {},

        // default relative time thresholds
        relativeTimeThresholds = {
            s: 45,  // seconds to minute
            m: 45,  // minutes to hour
            h: 22,  // hours to day
            d: 26,  // days to month
            M: 11   // months to year
        },

        // tokens to ordinalize and pad
        ordinalizeTokens = 'DDD w W M D d'.split(' '),
        paddedTokens = 'M D H h m s w W'.split(' '),

        formatTokenFunctions = {
            M    : function () {
                return this.month() + 1;
            },
            MMM  : function (format) {
                return this.localeData().monthsShort(this, format);
            },
            MMMM : function (format) {
                return this.localeData().months(this, format);
            },
            D    : function () {
                return this.date();
            },
            DDD  : function () {
                return this.dayOfYear();
            },
            d    : function () {
                return this.day();
            },
            dd   : function (format) {
                return this.localeData().weekdaysMin(this, format);
            },
            ddd  : function (format) {
                return this.localeData().weekdaysShort(this, format);
            },
            dddd : function (format) {
                return this.localeData().weekdays(this, format);
            },
            w    : function () {
                return this.week();
            },
            W    : function () {
                return this.isoWeek();
            },
            YY   : function () {
                return leftZeroFill(this.year() % 100, 2);
            },
            YYYY : function () {
                return leftZeroFill(this.year(), 4);
            },
            YYYYY : function () {
                return leftZeroFill(this.year(), 5);
            },
            YYYYYY : function () {
                var y = this.year(), sign = y >= 0 ? '+' : '-';
                return sign + leftZeroFill(Math.abs(y), 6);
            },
            gg   : function () {
                return leftZeroFill(this.weekYear() % 100, 2);
            },
            gggg : function () {
                return leftZeroFill(this.weekYear(), 4);
            },
            ggggg : function () {
                return leftZeroFill(this.weekYear(), 5);
            },
            GG   : function () {
                return leftZeroFill(this.isoWeekYear() % 100, 2);
            },
            GGGG : function () {
                return leftZeroFill(this.isoWeekYear(), 4);
            },
            GGGGG : function () {
                return leftZeroFill(this.isoWeekYear(), 5);
            },
            e : function () {
                return this.weekday();
            },
            E : function () {
                return this.isoWeekday();
            },
            a    : function () {
                return this.localeData().meridiem(this.hours(), this.minutes(), true);
            },
            A    : function () {
                return this.localeData().meridiem(this.hours(), this.minutes(), false);
            },
            H    : function () {
                return this.hours();
            },
            h    : function () {
                return this.hours() % 12 || 12;
            },
            m    : function () {
                return this.minutes();
            },
            s    : function () {
                return this.seconds();
            },
            S    : function () {
                return toInt(this.milliseconds() / 100);
            },
            SS   : function () {
                return leftZeroFill(toInt(this.milliseconds() / 10), 2);
            },
            SSS  : function () {
                return leftZeroFill(this.milliseconds(), 3);
            },
            SSSS : function () {
                return leftZeroFill(this.milliseconds(), 3);
            },
            Z    : function () {
                var a = -this.zone(),
                    b = '+';
                if (a < 0) {
                    a = -a;
                    b = '-';
                }
                return b + leftZeroFill(toInt(a / 60), 2) + ':' + leftZeroFill(toInt(a) % 60, 2);
            },
            ZZ   : function () {
                var a = -this.zone(),
                    b = '+';
                if (a < 0) {
                    a = -a;
                    b = '-';
                }
                return b + leftZeroFill(toInt(a / 60), 2) + leftZeroFill(toInt(a) % 60, 2);
            },
            z : function () {
                return this.zoneAbbr();
            },
            zz : function () {
                return this.zoneName();
            },
            X    : function () {
                return this.unix();
            },
            Q : function () {
                return this.quarter();
            }
        },

        deprecations = {},

        lists = ['months', 'monthsShort', 'weekdays', 'weekdaysShort', 'weekdaysMin'];

    // Pick the first defined of two or three arguments. dfl comes from
    // default.
    function dfl(a, b, c) {
        switch (arguments.length) {
            case 2: return a != null ? a : b;
            case 3: return a != null ? a : b != null ? b : c;
            default: throw new Error('Implement me');
        }
    }

    function hasOwnProp(a, b) {
        return hasOwnProperty.call(a, b);
    }

    function defaultParsingFlags() {
        // We need to deep clone this object, and es5 standard is not very
        // helpful.
        return {
            empty : false,
            unusedTokens : [],
            unusedInput : [],
            overflow : -2,
            charsLeftOver : 0,
            nullInput : false,
            invalidMonth : null,
            invalidFormat : false,
            userInvalidated : false,
            iso: false
        };
    }

    function printMsg(msg) {
        if (moment.suppressDeprecationWarnings === false &&
                typeof console !== 'undefined' && console.warn) {
            console.warn('Deprecation warning: ' + msg);
        }
    }

    function deprecate(msg, fn) {
        var firstTime = true;
        return extend(function () {
            if (firstTime) {
                printMsg(msg);
                firstTime = false;
            }
            return fn.apply(this, arguments);
        }, fn);
    }

    function deprecateSimple(name, msg) {
        if (!deprecations[name]) {
            printMsg(msg);
            deprecations[name] = true;
        }
    }

    function padToken(func, count) {
        return function (a) {
            return leftZeroFill(func.call(this, a), count);
        };
    }
    function ordinalizeToken(func, period) {
        return function (a) {
            return this.localeData().ordinal(func.call(this, a), period);
        };
    }

    while (ordinalizeTokens.length) {
        i = ordinalizeTokens.pop();
        formatTokenFunctions[i + 'o'] = ordinalizeToken(formatTokenFunctions[i], i);
    }
    while (paddedTokens.length) {
        i = paddedTokens.pop();
        formatTokenFunctions[i + i] = padToken(formatTokenFunctions[i], 2);
    }
    formatTokenFunctions.DDDD = padToken(formatTokenFunctions.DDD, 3);


    /************************************
        Constructors
    ************************************/

    function Locale() {
    }

    // Moment prototype object
    function Moment(config, skipOverflow) {
        if (skipOverflow !== false) {
            checkOverflow(config);
        }
        copyConfig(this, config);
        this._d = new Date(+config._d);
    }

    // Duration Constructor
    function Duration(duration) {
        var normalizedInput = normalizeObjectUnits(duration),
            years = normalizedInput.year || 0,
            quarters = normalizedInput.quarter || 0,
            months = normalizedInput.month || 0,
            weeks = normalizedInput.week || 0,
            days = normalizedInput.day || 0,
            hours = normalizedInput.hour || 0,
            minutes = normalizedInput.minute || 0,
            seconds = normalizedInput.second || 0,
            milliseconds = normalizedInput.millisecond || 0;

        // representation for dateAddRemove
        this._milliseconds = +milliseconds +
            seconds * 1e3 + // 1000
            minutes * 6e4 + // 1000 * 60
            hours * 36e5; // 1000 * 60 * 60
        // Because of dateAddRemove treats 24 hours as different from a
        // day when working around DST, we need to store them separately
        this._days = +days +
            weeks * 7;
        // It is impossible translate months into days without knowing
        // which months you are are talking about, so we have to store
        // it separately.
        this._months = +months +
            quarters * 3 +
            years * 12;

        this._data = {};

        this._locale = moment.localeData();

        this._bubble();
    }

    /************************************
        Helpers
    ************************************/


    function extend(a, b) {
        for (var i in b) {
            if (hasOwnProp(b, i)) {
                a[i] = b[i];
            }
        }

        if (hasOwnProp(b, 'toString')) {
            a.toString = b.toString;
        }

        if (hasOwnProp(b, 'valueOf')) {
            a.valueOf = b.valueOf;
        }

        return a;
    }

    function copyConfig(to, from) {
        var i, prop, val;

        if (typeof from._isAMomentObject !== 'undefined') {
            to._isAMomentObject = from._isAMomentObject;
        }
        if (typeof from._i !== 'undefined') {
            to._i = from._i;
        }
        if (typeof from._f !== 'undefined') {
            to._f = from._f;
        }
        if (typeof from._l !== 'undefined') {
            to._l = from._l;
        }
        if (typeof from._strict !== 'undefined') {
            to._strict = from._strict;
        }
        if (typeof from._tzm !== 'undefined') {
            to._tzm = from._tzm;
        }
        if (typeof from._isUTC !== 'undefined') {
            to._isUTC = from._isUTC;
        }
        if (typeof from._offset !== 'undefined') {
            to._offset = from._offset;
        }
        if (typeof from._pf !== 'undefined') {
            to._pf = from._pf;
        }
        if (typeof from._locale !== 'undefined') {
            to._locale = from._locale;
        }

        if (momentProperties.length > 0) {
            for (i in momentProperties) {
                prop = momentProperties[i];
                val = from[prop];
                if (typeof val !== 'undefined') {
                    to[prop] = val;
                }
            }
        }

        return to;
    }

    function absRound(number) {
        if (number < 0) {
            return Math.ceil(number);
        } else {
            return Math.floor(number);
        }
    }

    // left zero fill a number
    // see http://jsperf.com/left-zero-filling for performance comparison
    function leftZeroFill(number, targetLength, forceSign) {
        var output = '' + Math.abs(number),
            sign = number >= 0;

        while (output.length < targetLength) {
            output = '0' + output;
        }
        return (sign ? (forceSign ? '+' : '') : '-') + output;
    }

    function positiveMomentsDifference(base, other) {
        var res = {milliseconds: 0, months: 0};

        res.months = other.month() - base.month() +
            (other.year() - base.year()) * 12;
        if (base.clone().add(res.months, 'M').isAfter(other)) {
            --res.months;
        }

        res.milliseconds = +other - +(base.clone().add(res.months, 'M'));

        return res;
    }

    function momentsDifference(base, other) {
        var res;
        other = makeAs(other, base);
        if (base.isBefore(other)) {
            res = positiveMomentsDifference(base, other);
        } else {
            res = positiveMomentsDifference(other, base);
            res.milliseconds = -res.milliseconds;
            res.months = -res.months;
        }

        return res;
    }

    // TODO: remove 'name' arg after deprecation is removed
    function createAdder(direction, name) {
        return function (val, period) {
            var dur, tmp;
            //invert the arguments, but complain about it
            if (period !== null && !isNaN(+period)) {
                deprecateSimple(name, 'moment().' + name  + '(period, number) is deprecated. Please use moment().' + name + '(number, period).');
                tmp = val; val = period; period = tmp;
            }

            val = typeof val === 'string' ? +val : val;
            dur = moment.duration(val, period);
            addOrSubtractDurationFromMoment(this, dur, direction);
            return this;
        };
    }

    function addOrSubtractDurationFromMoment(mom, duration, isAdding, updateOffset) {
        var milliseconds = duration._milliseconds,
            days = duration._days,
            months = duration._months;
        updateOffset = updateOffset == null ? true : updateOffset;

        if (milliseconds) {
            mom._d.setTime(+mom._d + milliseconds * isAdding);
        }
        if (days) {
            rawSetter(mom, 'Date', rawGetter(mom, 'Date') + days * isAdding);
        }
        if (months) {
            rawMonthSetter(mom, rawGetter(mom, 'Month') + months * isAdding);
        }
        if (updateOffset) {
            moment.updateOffset(mom, days || months);
        }
    }

    // check if is an array
    function isArray(input) {
        return Object.prototype.toString.call(input) === '[object Array]';
    }

    function isDate(input) {
        return Object.prototype.toString.call(input) === '[object Date]' ||
            input instanceof Date;
    }

    // compare two arrays, return the number of differences
    function compareArrays(array1, array2, dontConvert) {
        var len = Math.min(array1.length, array2.length),
            lengthDiff = Math.abs(array1.length - array2.length),
            diffs = 0,
            i;
        for (i = 0; i < len; i++) {
            if ((dontConvert && array1[i] !== array2[i]) ||
                (!dontConvert && toInt(array1[i]) !== toInt(array2[i]))) {
                diffs++;
            }
        }
        return diffs + lengthDiff;
    }

    function normalizeUnits(units) {
        if (units) {
            var lowered = units.toLowerCase().replace(/(.)s$/, '$1');
            units = unitAliases[units] || camelFunctions[lowered] || lowered;
        }
        return units;
    }

    function normalizeObjectUnits(inputObject) {
        var normalizedInput = {},
            normalizedProp,
            prop;

        for (prop in inputObject) {
            if (hasOwnProp(inputObject, prop)) {
                normalizedProp = normalizeUnits(prop);
                if (normalizedProp) {
                    normalizedInput[normalizedProp] = inputObject[prop];
                }
            }
        }

        return normalizedInput;
    }

    function makeList(field) {
        var count, setter;

        if (field.indexOf('week') === 0) {
            count = 7;
            setter = 'day';
        }
        else if (field.indexOf('month') === 0) {
            count = 12;
            setter = 'month';
        }
        else {
            return;
        }

        moment[field] = function (format, index) {
            var i, getter,
                method = moment._locale[field],
                results = [];

            if (typeof format === 'number') {
                index = format;
                format = undefined;
            }

            getter = function (i) {
                var m = moment().utc().set(setter, i);
                return method.call(moment._locale, m, format || '');
            };

            if (index != null) {
                return getter(index);
            }
            else {
                for (i = 0; i < count; i++) {
                    results.push(getter(i));
                }
                return results;
            }
        };
    }

    function toInt(argumentForCoercion) {
        var coercedNumber = +argumentForCoercion,
            value = 0;

        if (coercedNumber !== 0 && isFinite(coercedNumber)) {
            if (coercedNumber >= 0) {
                value = Math.floor(coercedNumber);
            } else {
                value = Math.ceil(coercedNumber);
            }
        }

        return value;
    }

    function daysInMonth(year, month) {
        return new Date(Date.UTC(year, month + 1, 0)).getUTCDate();
    }

    function weeksInYear(year, dow, doy) {
        return weekOfYear(moment([year, 11, 31 + dow - doy]), dow, doy).week;
    }

    function daysInYear(year) {
        return isLeapYear(year) ? 366 : 365;
    }

    function isLeapYear(year) {
        return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
    }

    function checkOverflow(m) {
        var overflow;
        if (m._a && m._pf.overflow === -2) {
            overflow =
                m._a[MONTH] < 0 || m._a[MONTH] > 11 ? MONTH :
                m._a[DATE] < 1 || m._a[DATE] > daysInMonth(m._a[YEAR], m._a[MONTH]) ? DATE :
                m._a[HOUR] < 0 || m._a[HOUR] > 23 ? HOUR :
                m._a[MINUTE] < 0 || m._a[MINUTE] > 59 ? MINUTE :
                m._a[SECOND] < 0 || m._a[SECOND] > 59 ? SECOND :
                m._a[MILLISECOND] < 0 || m._a[MILLISECOND] > 999 ? MILLISECOND :
                -1;

            if (m._pf._overflowDayOfYear && (overflow < YEAR || overflow > DATE)) {
                overflow = DATE;
            }

            m._pf.overflow = overflow;
        }
    }

    function isValid(m) {
        if (m._isValid == null) {
            m._isValid = !isNaN(m._d.getTime()) &&
                m._pf.overflow < 0 &&
                !m._pf.empty &&
                !m._pf.invalidMonth &&
                !m._pf.nullInput &&
                !m._pf.invalidFormat &&
                !m._pf.userInvalidated;

            if (m._strict) {
                m._isValid = m._isValid &&
                    m._pf.charsLeftOver === 0 &&
                    m._pf.unusedTokens.length === 0;
            }
        }
        return m._isValid;
    }

    function normalizeLocale(key) {
        return key ? key.toLowerCase().replace('_', '-') : key;
    }

    // pick the locale from the array
    // try ['en-au', 'en-gb'] as 'en-au', 'en-gb', 'en', as in move through the list trying each
    // substring from most specific to least, but move to the next array item if it's a more specific variant than the current root
    function chooseLocale(names) {
        var i = 0, j, next, locale, split;

        while (i < names.length) {
            split = normalizeLocale(names[i]).split('-');
            j = split.length;
            next = normalizeLocale(names[i + 1]);
            next = next ? next.split('-') : null;
            while (j > 0) {
                locale = loadLocale(split.slice(0, j).join('-'));
                if (locale) {
                    return locale;
                }
                if (next && next.length >= j && compareArrays(split, next, true) >= j - 1) {
                    //the next array item is better than a shallower substring of this one
                    break;
                }
                j--;
            }
            i++;
        }
        return null;
    }

    function loadLocale(name) {
        var oldLocale = null;
        if (!locales[name] && hasModule) {
            try {
                oldLocale = moment.locale();
                require('./locale/' + name);
                // because defineLocale currently also sets the global locale, we want to undo that for lazy loaded locales
                moment.locale(oldLocale);
            } catch (e) { }
        }
        return locales[name];
    }

    // Return a moment from input, that is local/utc/zone equivalent to model.
    function makeAs(input, model) {
        return model._isUTC ? moment(input).zone(model._offset || 0) :
            moment(input).local();
    }

    /************************************
        Locale
    ************************************/


    extend(Locale.prototype, {

        set : function (config) {
            var prop, i;
            for (i in config) {
                prop = config[i];
                if (typeof prop === 'function') {
                    this[i] = prop;
                } else {
                    this['_' + i] = prop;
                }
            }
        },

        _months : 'January_February_March_April_May_June_July_August_September_October_November_December'.split('_'),
        months : function (m) {
            return this._months[m.month()];
        },

        _monthsShort : 'Jan_Feb_Mar_Apr_May_Jun_Jul_Aug_Sep_Oct_Nov_Dec'.split('_'),
        monthsShort : function (m) {
            return this._monthsShort[m.month()];
        },

        monthsParse : function (monthName) {
            var i, mom, regex;

            if (!this._monthsParse) {
                this._monthsParse = [];
            }

            for (i = 0; i < 12; i++) {
                // make the regex if we don't have it already
                if (!this._monthsParse[i]) {
                    mom = moment.utc([2000, i]);
                    regex = '^' + this.months(mom, '') + '|^' + this.monthsShort(mom, '');
                    this._monthsParse[i] = new RegExp(regex.replace('.', ''), 'i');
                }
                // test the regex
                if (this._monthsParse[i].test(monthName)) {
                    return i;
                }
            }
        },

        _weekdays : 'Sunday_Monday_Tuesday_Wednesday_Thursday_Friday_Saturday'.split('_'),
        weekdays : function (m) {
            return this._weekdays[m.day()];
        },

        _weekdaysShort : 'Sun_Mon_Tue_Wed_Thu_Fri_Sat'.split('_'),
        weekdaysShort : function (m) {
            return this._weekdaysShort[m.day()];
        },

        _weekdaysMin : 'Su_Mo_Tu_We_Th_Fr_Sa'.split('_'),
        weekdaysMin : function (m) {
            return this._weekdaysMin[m.day()];
        },

        weekdaysParse : function (weekdayName) {
            var i, mom, regex;

            if (!this._weekdaysParse) {
                this._weekdaysParse = [];
            }

            for (i = 0; i < 7; i++) {
                // make the regex if we don't have it already
                if (!this._weekdaysParse[i]) {
                    mom = moment([2000, 1]).day(i);
                    regex = '^' + this.weekdays(mom, '') + '|^' + this.weekdaysShort(mom, '') + '|^' + this.weekdaysMin(mom, '');
                    this._weekdaysParse[i] = new RegExp(regex.replace('.', ''), 'i');
                }
                // test the regex
                if (this._weekdaysParse[i].test(weekdayName)) {
                    return i;
                }
            }
        },

        _longDateFormat : {
            LT : 'h:mm A',
            L : 'MM/DD/YYYY',
            LL : 'MMMM D, YYYY',
            LLL : 'MMMM D, YYYY LT',
            LLLL : 'dddd, MMMM D, YYYY LT'
        },
        longDateFormat : function (key) {
            var output = this._longDateFormat[key];
            if (!output && this._longDateFormat[key.toUpperCase()]) {
                output = this._longDateFormat[key.toUpperCase()].replace(/MMMM|MM|DD|dddd/g, function (val) {
                    return val.slice(1);
                });
                this._longDateFormat[key] = output;
            }
            return output;
        },

        isPM : function (input) {
            // IE8 Quirks Mode & IE7 Standards Mode do not allow accessing strings like arrays
            // Using charAt should be more compatible.
            return ((input + '').toLowerCase().charAt(0) === 'p');
        },

        _meridiemParse : /[ap]\.?m?\.?/i,
        meridiem : function (hours, minutes, isLower) {
            if (hours > 11) {
                return isLower ? 'pm' : 'PM';
            } else {
                return isLower ? 'am' : 'AM';
            }
        },

        _calendar : {
            sameDay : '[Today at] LT',
            nextDay : '[Tomorrow at] LT',
            nextWeek : 'dddd [at] LT',
            lastDay : '[Yesterday at] LT',
            lastWeek : '[Last] dddd [at] LT',
            sameElse : 'L'
        },
        calendar : function (key, mom) {
            var output = this._calendar[key];
            return typeof output === 'function' ? output.apply(mom) : output;
        },

        _relativeTime : {
            future : 'in %s',
            past : '%s ago',
            s : 'a few seconds',
            m : 'a minute',
            mm : '%d minutes',
            h : 'an hour',
            hh : '%d hours',
            d : 'a day',
            dd : '%d days',
            M : 'a month',
            MM : '%d months',
            y : 'a year',
            yy : '%d years'
        },

        relativeTime : function (number, withoutSuffix, string, isFuture) {
            var output = this._relativeTime[string];
            return (typeof output === 'function') ?
                output(number, withoutSuffix, string, isFuture) :
                output.replace(/%d/i, number);
        },

        pastFuture : function (diff, output) {
            var format = this._relativeTime[diff > 0 ? 'future' : 'past'];
            return typeof format === 'function' ? format(output) : format.replace(/%s/i, output);
        },

        ordinal : function (number) {
            return this._ordinal.replace('%d', number);
        },
        _ordinal : '%d',

        preparse : function (string) {
            return string;
        },

        postformat : function (string) {
            return string;
        },

        week : function (mom) {
            return weekOfYear(mom, this._week.dow, this._week.doy).week;
        },

        _week : {
            dow : 0, // Sunday is the first day of the week.
            doy : 6  // The week that contains Jan 1st is the first week of the year.
        },

        _invalidDate: 'Invalid date',
        invalidDate: function () {
            return this._invalidDate;
        }
    });

    /************************************
        Formatting
    ************************************/


    function removeFormattingTokens(input) {
        if (input.match(/\[[\s\S]/)) {
            return input.replace(/^\[|\]$/g, '');
        }
        return input.replace(/\\/g, '');
    }

    function makeFormatFunction(format) {
        var array = format.match(formattingTokens), i, length;

        for (i = 0, length = array.length; i < length; i++) {
            if (formatTokenFunctions[array[i]]) {
                array[i] = formatTokenFunctions[array[i]];
            } else {
                array[i] = removeFormattingTokens(array[i]);
            }
        }

        return function (mom) {
            var output = '';
            for (i = 0; i < length; i++) {
                output += array[i] instanceof Function ? array[i].call(mom, format) : array[i];
            }
            return output;
        };
    }

    // format date using native date object
    function formatMoment(m, format) {
        if (!m.isValid()) {
            return m.localeData().invalidDate();
        }

        format = expandFormat(format, m.localeData());

        if (!formatFunctions[format]) {
            formatFunctions[format] = makeFormatFunction(format);
        }

        return formatFunctions[format](m);
    }

    function expandFormat(format, locale) {
        var i = 5;

        function replaceLongDateFormatTokens(input) {
            return locale.longDateFormat(input) || input;
        }

        localFormattingTokens.lastIndex = 0;
        while (i >= 0 && localFormattingTokens.test(format)) {
            format = format.replace(localFormattingTokens, replaceLongDateFormatTokens);
            localFormattingTokens.lastIndex = 0;
            i -= 1;
        }

        return format;
    }


    /************************************
        Parsing
    ************************************/


    // get the regex to find the next token
    function getParseRegexForToken(token, config) {
        var a, strict = config._strict;
        switch (token) {
        case 'Q':
            return parseTokenOneDigit;
        case 'DDDD':
            return parseTokenThreeDigits;
        case 'YYYY':
        case 'GGGG':
        case 'gggg':
            return strict ? parseTokenFourDigits : parseTokenOneToFourDigits;
        case 'Y':
        case 'G':
        case 'g':
            return parseTokenSignedNumber;
        case 'YYYYYY':
        case 'YYYYY':
        case 'GGGGG':
        case 'ggggg':
            return strict ? parseTokenSixDigits : parseTokenOneToSixDigits;
        case 'S':
            if (strict) {
                return parseTokenOneDigit;
            }
            /* falls through */
        case 'SS':
            if (strict) {
                return parseTokenTwoDigits;
            }
            /* falls through */
        case 'SSS':
            if (strict) {
                return parseTokenThreeDigits;
            }
            /* falls through */
        case 'DDD':
            return parseTokenOneToThreeDigits;
        case 'MMM':
        case 'MMMM':
        case 'dd':
        case 'ddd':
        case 'dddd':
            return parseTokenWord;
        case 'a':
        case 'A':
            return config._locale._meridiemParse;
        case 'X':
            return parseTokenTimestampMs;
        case 'Z':
        case 'ZZ':
            return parseTokenTimezone;
        case 'T':
            return parseTokenT;
        case 'SSSS':
            return parseTokenDigits;
        case 'MM':
        case 'DD':
        case 'YY':
        case 'GG':
        case 'gg':
        case 'HH':
        case 'hh':
        case 'mm':
        case 'ss':
        case 'ww':
        case 'WW':
            return strict ? parseTokenTwoDigits : parseTokenOneOrTwoDigits;
        case 'M':
        case 'D':
        case 'd':
        case 'H':
        case 'h':
        case 'm':
        case 's':
        case 'w':
        case 'W':
        case 'e':
        case 'E':
            return parseTokenOneOrTwoDigits;
        case 'Do':
            return parseTokenOrdinal;
        default :
            a = new RegExp(regexpEscape(unescapeFormat(token.replace('\\', '')), 'i'));
            return a;
        }
    }

    function timezoneMinutesFromString(string) {
        string = string || '';
        var possibleTzMatches = (string.match(parseTokenTimezone) || []),
            tzChunk = possibleTzMatches[possibleTzMatches.length - 1] || [],
            parts = (tzChunk + '').match(parseTimezoneChunker) || ['-', 0, 0],
            minutes = +(parts[1] * 60) + toInt(parts[2]);

        return parts[0] === '+' ? -minutes : minutes;
    }

    // function to convert string input to date
    function addTimeToArrayFromToken(token, input, config) {
        var a, datePartArray = config._a;

        switch (token) {
        // QUARTER
        case 'Q':
            if (input != null) {
                datePartArray[MONTH] = (toInt(input) - 1) * 3;
            }
            break;
        // MONTH
        case 'M' : // fall through to MM
        case 'MM' :
            if (input != null) {
                datePartArray[MONTH] = toInt(input) - 1;
            }
            break;
        case 'MMM' : // fall through to MMMM
        case 'MMMM' :
            a = config._locale.monthsParse(input);
            // if we didn't find a month name, mark the date as invalid.
            if (a != null) {
                datePartArray[MONTH] = a;
            } else {
                config._pf.invalidMonth = input;
            }
            break;
        // DAY OF MONTH
        case 'D' : // fall through to DD
        case 'DD' :
            if (input != null) {
                datePartArray[DATE] = toInt(input);
            }
            break;
        case 'Do' :
            if (input != null) {
                datePartArray[DATE] = toInt(parseInt(input, 10));
            }
            break;
        // DAY OF YEAR
        case 'DDD' : // fall through to DDDD
        case 'DDDD' :
            if (input != null) {
                config._dayOfYear = toInt(input);
            }

            break;
        // YEAR
        case 'YY' :
            datePartArray[YEAR] = moment.parseTwoDigitYear(input);
            break;
        case 'YYYY' :
        case 'YYYYY' :
        case 'YYYYYY' :
            datePartArray[YEAR] = toInt(input);
            break;
        // AM / PM
        case 'a' : // fall through to A
        case 'A' :
            config._isPm = config._locale.isPM(input);
            break;
        // 24 HOUR
        case 'H' : // fall through to hh
        case 'HH' : // fall through to hh
        case 'h' : // fall through to hh
        case 'hh' :
            datePartArray[HOUR] = toInt(input);
            break;
        // MINUTE
        case 'm' : // fall through to mm
        case 'mm' :
            datePartArray[MINUTE] = toInt(input);
            break;
        // SECOND
        case 's' : // fall through to ss
        case 'ss' :
            datePartArray[SECOND] = toInt(input);
            break;
        // MILLISECOND
        case 'S' :
        case 'SS' :
        case 'SSS' :
        case 'SSSS' :
            datePartArray[MILLISECOND] = toInt(('0.' + input) * 1000);
            break;
        // UNIX TIMESTAMP WITH MS
        case 'X':
            config._d = new Date(parseFloat(input) * 1000);
            break;
        // TIMEZONE
        case 'Z' : // fall through to ZZ
        case 'ZZ' :
            config._useUTC = true;
            config._tzm = timezoneMinutesFromString(input);
            break;
        // WEEKDAY - human
        case 'dd':
        case 'ddd':
        case 'dddd':
            a = config._locale.weekdaysParse(input);
            // if we didn't get a weekday name, mark the date as invalid
            if (a != null) {
                config._w = config._w || {};
                config._w['d'] = a;
            } else {
                config._pf.invalidWeekday = input;
            }
            break;
        // WEEK, WEEK DAY - numeric
        case 'w':
        case 'ww':
        case 'W':
        case 'WW':
        case 'd':
        case 'e':
        case 'E':
            token = token.substr(0, 1);
            /* falls through */
        case 'gggg':
        case 'GGGG':
        case 'GGGGG':
            token = token.substr(0, 2);
            if (input) {
                config._w = config._w || {};
                config._w[token] = toInt(input);
            }
            break;
        case 'gg':
        case 'GG':
            config._w = config._w || {};
            config._w[token] = moment.parseTwoDigitYear(input);
        }
    }

    function dayOfYearFromWeekInfo(config) {
        var w, weekYear, week, weekday, dow, doy, temp;

        w = config._w;
        if (w.GG != null || w.W != null || w.E != null) {
            dow = 1;
            doy = 4;

            // TODO: We need to take the current isoWeekYear, but that depends on
            // how we interpret now (local, utc, fixed offset). So create
            // a now version of current config (take local/utc/offset flags, and
            // create now).
            weekYear = dfl(w.GG, config._a[YEAR], weekOfYear(moment(), 1, 4).year);
            week = dfl(w.W, 1);
            weekday = dfl(w.E, 1);
        } else {
            dow = config._locale._week.dow;
            doy = config._locale._week.doy;

            weekYear = dfl(w.gg, config._a[YEAR], weekOfYear(moment(), dow, doy).year);
            week = dfl(w.w, 1);

            if (w.d != null) {
                // weekday -- low day numbers are considered next week
                weekday = w.d;
                if (weekday < dow) {
                    ++week;
                }
            } else if (w.e != null) {
                // local weekday -- counting starts from begining of week
                weekday = w.e + dow;
            } else {
                // default to begining of week
                weekday = dow;
            }
        }
        temp = dayOfYearFromWeeks(weekYear, week, weekday, doy, dow);

        config._a[YEAR] = temp.year;
        config._dayOfYear = temp.dayOfYear;
    }

    // convert an array to a date.
    // the array should mirror the parameters below
    // note: all values past the year are optional and will default to the lowest possible value.
    // [year, month, day , hour, minute, second, millisecond]
    function dateFromConfig(config) {
        var i, date, input = [], currentDate, yearToUse;

        if (config._d) {
            return;
        }

        currentDate = currentDateArray(config);

        //compute day of the year from weeks and weekdays
        if (config._w && config._a[DATE] == null && config._a[MONTH] == null) {
            dayOfYearFromWeekInfo(config);
        }

        //if the day of the year is set, figure out what it is
        if (config._dayOfYear) {
            yearToUse = dfl(config._a[YEAR], currentDate[YEAR]);

            if (config._dayOfYear > daysInYear(yearToUse)) {
                config._pf._overflowDayOfYear = true;
            }

            date = makeUTCDate(yearToUse, 0, config._dayOfYear);
            config._a[MONTH] = date.getUTCMonth();
            config._a[DATE] = date.getUTCDate();
        }

        // Default to current date.
        // * if no year, month, day of month are given, default to today
        // * if day of month is given, default month and year
        // * if month is given, default only year
        // * if year is given, don't default anything
        for (i = 0; i < 3 && config._a[i] == null; ++i) {
            config._a[i] = input[i] = currentDate[i];
        }

        // Zero out whatever was not defaulted, including time
        for (; i < 7; i++) {
            config._a[i] = input[i] = (config._a[i] == null) ? (i === 2 ? 1 : 0) : config._a[i];
        }

        config._d = (config._useUTC ? makeUTCDate : makeDate).apply(null, input);
        // Apply timezone offset from input. The actual zone can be changed
        // with parseZone.
        if (config._tzm != null) {
            config._d.setUTCMinutes(config._d.getUTCMinutes() + config._tzm);
        }
    }

    function dateFromObject(config) {
        var normalizedInput;

        if (config._d) {
            return;
        }

        normalizedInput = normalizeObjectUnits(config._i);
        config._a = [
            normalizedInput.year,
            normalizedInput.month,
            normalizedInput.day,
            normalizedInput.hour,
            normalizedInput.minute,
            normalizedInput.second,
            normalizedInput.millisecond
        ];

        dateFromConfig(config);
    }

    function currentDateArray(config) {
        var now = new Date();
        if (config._useUTC) {
            return [
                now.getUTCFullYear(),
                now.getUTCMonth(),
                now.getUTCDate()
            ];
        } else {
            return [now.getFullYear(), now.getMonth(), now.getDate()];
        }
    }

    // date from string and format string
    function makeDateFromStringAndFormat(config) {
        if (config._f === moment.ISO_8601) {
            parseISO(config);
            return;
        }

        config._a = [];
        config._pf.empty = true;

        // This array is used to make a Date, either with `new Date` or `Date.UTC`
        var string = '' + config._i,
            i, parsedInput, tokens, token, skipped,
            stringLength = string.length,
            totalParsedInputLength = 0;

        tokens = expandFormat(config._f, config._locale).match(formattingTokens) || [];

        for (i = 0; i < tokens.length; i++) {
            token = tokens[i];
            parsedInput = (string.match(getParseRegexForToken(token, config)) || [])[0];
            if (parsedInput) {
                skipped = string.substr(0, string.indexOf(parsedInput));
                if (skipped.length > 0) {
                    config._pf.unusedInput.push(skipped);
                }
                string = string.slice(string.indexOf(parsedInput) + parsedInput.length);
                totalParsedInputLength += parsedInput.length;
            }
            // don't parse if it's not a known token
            if (formatTokenFunctions[token]) {
                if (parsedInput) {
                    config._pf.empty = false;
                }
                else {
                    config._pf.unusedTokens.push(token);
                }
                addTimeToArrayFromToken(token, parsedInput, config);
            }
            else if (config._strict && !parsedInput) {
                config._pf.unusedTokens.push(token);
            }
        }

        // add remaining unparsed input length to the string
        config._pf.charsLeftOver = stringLength - totalParsedInputLength;
        if (string.length > 0) {
            config._pf.unusedInput.push(string);
        }

        // handle am pm
        if (config._isPm && config._a[HOUR] < 12) {
            config._a[HOUR] += 12;
        }
        // if is 12 am, change hours to 0
        if (config._isPm === false && config._a[HOUR] === 12) {
            config._a[HOUR] = 0;
        }

        dateFromConfig(config);
        checkOverflow(config);
    }

    function unescapeFormat(s) {
        return s.replace(/\\(\[)|\\(\])|\[([^\]\[]*)\]|\\(.)/g, function (matched, p1, p2, p3, p4) {
            return p1 || p2 || p3 || p4;
        });
    }

    // Code from http://stackoverflow.com/questions/3561493/is-there-a-regexp-escape-function-in-javascript
    function regexpEscape(s) {
        return s.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
    }

    // date from string and array of format strings
    function makeDateFromStringAndArray(config) {
        var tempConfig,
            bestMoment,

            scoreToBeat,
            i,
            currentScore;

        if (config._f.length === 0) {
            config._pf.invalidFormat = true;
            config._d = new Date(NaN);
            return;
        }

        for (i = 0; i < config._f.length; i++) {
            currentScore = 0;
            tempConfig = copyConfig({}, config);
            if (config._useUTC != null) {
                tempConfig._useUTC = config._useUTC;
            }
            tempConfig._pf = defaultParsingFlags();
            tempConfig._f = config._f[i];
            makeDateFromStringAndFormat(tempConfig);

            if (!isValid(tempConfig)) {
                continue;
            }

            // if there is any input that was not parsed add a penalty for that format
            currentScore += tempConfig._pf.charsLeftOver;

            //or tokens
            currentScore += tempConfig._pf.unusedTokens.length * 10;

            tempConfig._pf.score = currentScore;

            if (scoreToBeat == null || currentScore < scoreToBeat) {
                scoreToBeat = currentScore;
                bestMoment = tempConfig;
            }
        }

        extend(config, bestMoment || tempConfig);
    }

    // date from iso format
    function parseISO(config) {
        var i, l,
            string = config._i,
            match = isoRegex.exec(string);

        if (match) {
            config._pf.iso = true;
            for (i = 0, l = isoDates.length; i < l; i++) {
                if (isoDates[i][1].exec(string)) {
                    // match[5] should be 'T' or undefined
                    config._f = isoDates[i][0] + (match[6] || ' ');
                    break;
                }
            }
            for (i = 0, l = isoTimes.length; i < l; i++) {
                if (isoTimes[i][1].exec(string)) {
                    config._f += isoTimes[i][0];
                    break;
                }
            }
            if (string.match(parseTokenTimezone)) {
                config._f += 'Z';
            }
            makeDateFromStringAndFormat(config);
        } else {
            config._isValid = false;
        }
    }

    // date from iso format or fallback
    function makeDateFromString(config) {
        parseISO(config);
        if (config._isValid === false) {
            delete config._isValid;
            moment.createFromInputFallback(config);
        }
    }

    function map(arr, fn) {
        var res = [], i;
        for (i = 0; i < arr.length; ++i) {
            res.push(fn(arr[i], i));
        }
        return res;
    }

    function makeDateFromInput(config) {
        var input = config._i, matched;
        if (input === undefined) {
            config._d = new Date();
        } else if (isDate(input)) {
            config._d = new Date(+input);
        } else if ((matched = aspNetJsonRegex.exec(input)) !== null) {
            config._d = new Date(+matched[1]);
        } else if (typeof input === 'string') {
            makeDateFromString(config);
        } else if (isArray(input)) {
            config._a = map(input.slice(0), function (obj) {
                return parseInt(obj, 10);
            });
            dateFromConfig(config);
        } else if (typeof(input) === 'object') {
            dateFromObject(config);
        } else if (typeof(input) === 'number') {
            // from milliseconds
            config._d = new Date(input);
        } else {
            moment.createFromInputFallback(config);
        }
    }

    function makeDate(y, m, d, h, M, s, ms) {
        //can't just apply() to create a date:
        //http://stackoverflow.com/questions/181348/instantiating-a-javascript-object-by-calling-prototype-constructor-apply
        var date = new Date(y, m, d, h, M, s, ms);

        //the date constructor doesn't accept years < 1970
        if (y < 1970) {
            date.setFullYear(y);
        }
        return date;
    }

    function makeUTCDate(y) {
        var date = new Date(Date.UTC.apply(null, arguments));
        if (y < 1970) {
            date.setUTCFullYear(y);
        }
        return date;
    }

    function parseWeekday(input, locale) {
        if (typeof input === 'string') {
            if (!isNaN(input)) {
                input = parseInt(input, 10);
            }
            else {
                input = locale.weekdaysParse(input);
                if (typeof input !== 'number') {
                    return null;
                }
            }
        }
        return input;
    }

    /************************************
        Relative Time
    ************************************/


    // helper function for moment.fn.from, moment.fn.fromNow, and moment.duration.fn.humanize
    function substituteTimeAgo(string, number, withoutSuffix, isFuture, locale) {
        return locale.relativeTime(number || 1, !!withoutSuffix, string, isFuture);
    }

    function relativeTime(posNegDuration, withoutSuffix, locale) {
        var duration = moment.duration(posNegDuration).abs(),
            seconds = round(duration.as('s')),
            minutes = round(duration.as('m')),
            hours = round(duration.as('h')),
            days = round(duration.as('d')),
            months = round(duration.as('M')),
            years = round(duration.as('y')),

            args = seconds < relativeTimeThresholds.s && ['s', seconds] ||
                minutes === 1 && ['m'] ||
                minutes < relativeTimeThresholds.m && ['mm', minutes] ||
                hours === 1 && ['h'] ||
                hours < relativeTimeThresholds.h && ['hh', hours] ||
                days === 1 && ['d'] ||
                days < relativeTimeThresholds.d && ['dd', days] ||
                months === 1 && ['M'] ||
                months < relativeTimeThresholds.M && ['MM', months] ||
                years === 1 && ['y'] || ['yy', years];

        args[2] = withoutSuffix;
        args[3] = +posNegDuration > 0;
        args[4] = locale;
        return substituteTimeAgo.apply({}, args);
    }


    /************************************
        Week of Year
    ************************************/


    // firstDayOfWeek       0 = sun, 6 = sat
    //                      the day of the week that starts the week
    //                      (usually sunday or monday)
    // firstDayOfWeekOfYear 0 = sun, 6 = sat
    //                      the first week is the week that contains the first
    //                      of this day of the week
    //                      (eg. ISO weeks use thursday (4))
    function weekOfYear(mom, firstDayOfWeek, firstDayOfWeekOfYear) {
        var end = firstDayOfWeekOfYear - firstDayOfWeek,
            daysToDayOfWeek = firstDayOfWeekOfYear - mom.day(),
            adjustedMoment;


        if (daysToDayOfWeek > end) {
            daysToDayOfWeek -= 7;
        }

        if (daysToDayOfWeek < end - 7) {
            daysToDayOfWeek += 7;
        }

        adjustedMoment = moment(mom).add(daysToDayOfWeek, 'd');
        return {
            week: Math.ceil(adjustedMoment.dayOfYear() / 7),
            year: adjustedMoment.year()
        };
    }

    //http://en.wikipedia.org/wiki/ISO_week_date#Calculating_a_date_given_the_year.2C_week_number_and_weekday
    function dayOfYearFromWeeks(year, week, weekday, firstDayOfWeekOfYear, firstDayOfWeek) {
        var d = makeUTCDate(year, 0, 1).getUTCDay(), daysToAdd, dayOfYear;

        d = d === 0 ? 7 : d;
        weekday = weekday != null ? weekday : firstDayOfWeek;
        daysToAdd = firstDayOfWeek - d + (d > firstDayOfWeekOfYear ? 7 : 0) - (d < firstDayOfWeek ? 7 : 0);
        dayOfYear = 7 * (week - 1) + (weekday - firstDayOfWeek) + daysToAdd + 1;

        return {
            year: dayOfYear > 0 ? year : year - 1,
            dayOfYear: dayOfYear > 0 ?  dayOfYear : daysInYear(year - 1) + dayOfYear
        };
    }

    /************************************
        Top Level Functions
    ************************************/

    function makeMoment(config) {
        var input = config._i,
            format = config._f;

        config._locale = config._locale || moment.localeData(config._l);

        if (input === null || (format === undefined && input === '')) {
            return moment.invalid({nullInput: true});
        }

        if (typeof input === 'string') {
            config._i = input = config._locale.preparse(input);
        }

        if (moment.isMoment(input)) {
            return new Moment(input, true);
        } else if (format) {
            if (isArray(format)) {
                makeDateFromStringAndArray(config);
            } else {
                makeDateFromStringAndFormat(config);
            }
        } else {
            makeDateFromInput(config);
        }

        return new Moment(config);
    }

    moment = function (input, format, locale, strict) {
        var c;

        if (typeof(locale) === 'boolean') {
            strict = locale;
            locale = undefined;
        }
        // object construction must be done this way.
        // https://github.com/moment/moment/issues/1423
        c = {};
        c._isAMomentObject = true;
        c._i = input;
        c._f = format;
        c._l = locale;
        c._strict = strict;
        c._isUTC = false;
        c._pf = defaultParsingFlags();

        return makeMoment(c);
    };

    moment.suppressDeprecationWarnings = false;

    moment.createFromInputFallback = deprecate(
        'moment construction falls back to js Date. This is ' +
        'discouraged and will be removed in upcoming major ' +
        'release. Please refer to ' +
        'https://github.com/moment/moment/issues/1407 for more info.',
        function (config) {
            config._d = new Date(config._i);
        }
    );

    // Pick a moment m from moments so that m[fn](other) is true for all
    // other. This relies on the function fn to be transitive.
    //
    // moments should either be an array of moment objects or an array, whose
    // first element is an array of moment objects.
    function pickBy(fn, moments) {
        var res, i;
        if (moments.length === 1 && isArray(moments[0])) {
            moments = moments[0];
        }
        if (!moments.length) {
            return moment();
        }
        res = moments[0];
        for (i = 1; i < moments.length; ++i) {
            if (moments[i][fn](res)) {
                res = moments[i];
            }
        }
        return res;
    }

    moment.min = function () {
        var args = [].slice.call(arguments, 0);

        return pickBy('isBefore', args);
    };

    moment.max = function () {
        var args = [].slice.call(arguments, 0);

        return pickBy('isAfter', args);
    };

    // creating with utc
    moment.utc = function (input, format, locale, strict) {
        var c;

        if (typeof(locale) === 'boolean') {
            strict = locale;
            locale = undefined;
        }
        // object construction must be done this way.
        // https://github.com/moment/moment/issues/1423
        c = {};
        c._isAMomentObject = true;
        c._useUTC = true;
        c._isUTC = true;
        c._l = locale;
        c._i = input;
        c._f = format;
        c._strict = strict;
        c._pf = defaultParsingFlags();

        return makeMoment(c).utc();
    };

    // creating with unix timestamp (in seconds)
    moment.unix = function (input) {
        return moment(input * 1000);
    };

    // duration
    moment.duration = function (input, key) {
        var duration = input,
            // matching against regexp is expensive, do it on demand
            match = null,
            sign,
            ret,
            parseIso,
            diffRes;

        if (moment.isDuration(input)) {
            duration = {
                ms: input._milliseconds,
                d: input._days,
                M: input._months
            };
        } else if (typeof input === 'number') {
            duration = {};
            if (key) {
                duration[key] = input;
            } else {
                duration.milliseconds = input;
            }
        } else if (!!(match = aspNetTimeSpanJsonRegex.exec(input))) {
            sign = (match[1] === '-') ? -1 : 1;
            duration = {
                y: 0,
                d: toInt(match[DATE]) * sign,
                h: toInt(match[HOUR]) * sign,
                m: toInt(match[MINUTE]) * sign,
                s: toInt(match[SECOND]) * sign,
                ms: toInt(match[MILLISECOND]) * sign
            };
        } else if (!!(match = isoDurationRegex.exec(input))) {
            sign = (match[1] === '-') ? -1 : 1;
            parseIso = function (inp) {
                // We'd normally use ~~inp for this, but unfortunately it also
                // converts floats to ints.
                // inp may be undefined, so careful calling replace on it.
                var res = inp && parseFloat(inp.replace(',', '.'));
                // apply sign while we're at it
                return (isNaN(res) ? 0 : res) * sign;
            };
            duration = {
                y: parseIso(match[2]),
                M: parseIso(match[3]),
                d: parseIso(match[4]),
                h: parseIso(match[5]),
                m: parseIso(match[6]),
                s: parseIso(match[7]),
                w: parseIso(match[8])
            };
        } else if (typeof duration === 'object' &&
                ('from' in duration || 'to' in duration)) {
            diffRes = momentsDifference(moment(duration.from), moment(duration.to));

            duration = {};
            duration.ms = diffRes.milliseconds;
            duration.M = diffRes.months;
        }

        ret = new Duration(duration);

        if (moment.isDuration(input) && hasOwnProp(input, '_locale')) {
            ret._locale = input._locale;
        }

        return ret;
    };

    // version number
    moment.version = VERSION;

    // default format
    moment.defaultFormat = isoFormat;

    // constant that refers to the ISO standard
    moment.ISO_8601 = function () {};

    // Plugins that add properties should also add the key here (null value),
    // so we can properly clone ourselves.
    moment.momentProperties = momentProperties;

    // This function will be called whenever a moment is mutated.
    // It is intended to keep the offset in sync with the timezone.
    moment.updateOffset = function () {};

    // This function allows you to set a threshold for relative time strings
    moment.relativeTimeThreshold = function (threshold, limit) {
        if (relativeTimeThresholds[threshold] === undefined) {
            return false;
        }
        if (limit === undefined) {
            return relativeTimeThresholds[threshold];
        }
        relativeTimeThresholds[threshold] = limit;
        return true;
    };

    moment.lang = deprecate(
        'moment.lang is deprecated. Use moment.locale instead.',
        function (key, value) {
            return moment.locale(key, value);
        }
    );

    // This function will load locale and then set the global locale.  If
    // no arguments are passed in, it will simply return the current global
    // locale key.
    moment.locale = function (key, values) {
        var data;
        if (key) {
            if (typeof(values) !== 'undefined') {
                data = moment.defineLocale(key, values);
            }
            else {
                data = moment.localeData(key);
            }

            if (data) {
                moment.duration._locale = moment._locale = data;
            }
        }

        return moment._locale._abbr;
    };

    moment.defineLocale = function (name, values) {
        if (values !== null) {
            values.abbr = name;
            if (!locales[name]) {
                locales[name] = new Locale();
            }
            locales[name].set(values);

            // backwards compat for now: also set the locale
            moment.locale(name);

            return locales[name];
        } else {
            // useful for testing
            delete locales[name];
            return null;
        }
    };

    moment.langData = deprecate(
        'moment.langData is deprecated. Use moment.localeData instead.',
        function (key) {
            return moment.localeData(key);
        }
    );

    // returns locale data
    moment.localeData = function (key) {
        var locale;

        if (key && key._locale && key._locale._abbr) {
            key = key._locale._abbr;
        }

        if (!key) {
            return moment._locale;
        }

        if (!isArray(key)) {
            //short-circuit everything else
            locale = loadLocale(key);
            if (locale) {
                return locale;
            }
            key = [key];
        }

        return chooseLocale(key);
    };

    // compare moment object
    moment.isMoment = function (obj) {
        return obj instanceof Moment ||
            (obj != null && hasOwnProp(obj, '_isAMomentObject'));
    };

    // for typechecking Duration objects
    moment.isDuration = function (obj) {
        return obj instanceof Duration;
    };

    for (i = lists.length - 1; i >= 0; --i) {
        makeList(lists[i]);
    }

    moment.normalizeUnits = function (units) {
        return normalizeUnits(units);
    };

    moment.invalid = function (flags) {
        var m = moment.utc(NaN);
        if (flags != null) {
            extend(m._pf, flags);
        }
        else {
            m._pf.userInvalidated = true;
        }

        return m;
    };

    moment.parseZone = function () {
        return moment.apply(null, arguments).parseZone();
    };

    moment.parseTwoDigitYear = function (input) {
        return toInt(input) + (toInt(input) > 68 ? 1900 : 2000);
    };

    /************************************
        Moment Prototype
    ************************************/


    extend(moment.fn = Moment.prototype, {

        clone : function () {
            return moment(this);
        },

        valueOf : function () {
            return +this._d + ((this._offset || 0) * 60000);
        },

        unix : function () {
            return Math.floor(+this / 1000);
        },

        toString : function () {
            return this.clone().locale('en').format('ddd MMM DD YYYY HH:mm:ss [GMT]ZZ');
        },

        toDate : function () {
            return this._offset ? new Date(+this) : this._d;
        },

        toISOString : function () {
            var m = moment(this).utc();
            if (0 < m.year() && m.year() <= 9999) {
                return formatMoment(m, 'YYYY-MM-DD[T]HH:mm:ss.SSS[Z]');
            } else {
                return formatMoment(m, 'YYYYYY-MM-DD[T]HH:mm:ss.SSS[Z]');
            }
        },

        toArray : function () {
            var m = this;
            return [
                m.year(),
                m.month(),
                m.date(),
                m.hours(),
                m.minutes(),
                m.seconds(),
                m.milliseconds()
            ];
        },

        isValid : function () {
            return isValid(this);
        },

        isDSTShifted : function () {
            if (this._a) {
                return this.isValid() && compareArrays(this._a, (this._isUTC ? moment.utc(this._a) : moment(this._a)).toArray()) > 0;
            }

            return false;
        },

        parsingFlags : function () {
            return extend({}, this._pf);
        },

        invalidAt: function () {
            return this._pf.overflow;
        },

        utc : function (keepLocalTime) {
            return this.zone(0, keepLocalTime);
        },

        local : function (keepLocalTime) {
            if (this._isUTC) {
                this.zone(0, keepLocalTime);
                this._isUTC = false;

                if (keepLocalTime) {
                    this.add(this._dateTzOffset(), 'm');
                }
            }
            return this;
        },

        format : function (inputString) {
            var output = formatMoment(this, inputString || moment.defaultFormat);
            return this.localeData().postformat(output);
        },

        add : createAdder(1, 'add'),

        subtract : createAdder(-1, 'subtract'),

        diff : function (input, units, asFloat) {
            var that = makeAs(input, this),
                zoneDiff = (this.zone() - that.zone()) * 6e4,
                diff, output, daysAdjust;

            units = normalizeUnits(units);

            if (units === 'year' || units === 'month') {
                // average number of days in the months in the given dates
                diff = (this.daysInMonth() + that.daysInMonth()) * 432e5; // 24 * 60 * 60 * 1000 / 2
                // difference in months
                output = ((this.year() - that.year()) * 12) + (this.month() - that.month());
                // adjust by taking difference in days, average number of days
                // and dst in the given months.
                daysAdjust = (this - moment(this).startOf('month')) -
                    (that - moment(that).startOf('month'));
                // same as above but with zones, to negate all dst
                daysAdjust -= ((this.zone() - moment(this).startOf('month').zone()) -
                        (that.zone() - moment(that).startOf('month').zone())) * 6e4;
                output += daysAdjust / diff;
                if (units === 'year') {
                    output = output / 12;
                }
            } else {
                diff = (this - that);
                output = units === 'second' ? diff / 1e3 : // 1000
                    units === 'minute' ? diff / 6e4 : // 1000 * 60
                    units === 'hour' ? diff / 36e5 : // 1000 * 60 * 60
                    units === 'day' ? (diff - zoneDiff) / 864e5 : // 1000 * 60 * 60 * 24, negate dst
                    units === 'week' ? (diff - zoneDiff) / 6048e5 : // 1000 * 60 * 60 * 24 * 7, negate dst
                    diff;
            }
            return asFloat ? output : absRound(output);
        },

        from : function (time, withoutSuffix) {
            return moment.duration({to: this, from: time}).locale(this.locale()).humanize(!withoutSuffix);
        },

        fromNow : function (withoutSuffix) {
            return this.from(moment(), withoutSuffix);
        },

        calendar : function (time) {
            // We want to compare the start of today, vs this.
            // Getting start-of-today depends on whether we're zone'd or not.
            var now = time || moment(),
                sod = makeAs(now, this).startOf('day'),
                diff = this.diff(sod, 'days', true),
                format = diff < -6 ? 'sameElse' :
                    diff < -1 ? 'lastWeek' :
                    diff < 0 ? 'lastDay' :
                    diff < 1 ? 'sameDay' :
                    diff < 2 ? 'nextDay' :
                    diff < 7 ? 'nextWeek' : 'sameElse';
            return this.format(this.localeData().calendar(format, this));
        },

        isLeapYear : function () {
            return isLeapYear(this.year());
        },

        isDST : function () {
            return (this.zone() < this.clone().month(0).zone() ||
                this.zone() < this.clone().month(5).zone());
        },

        day : function (input) {
            var day = this._isUTC ? this._d.getUTCDay() : this._d.getDay();
            if (input != null) {
                input = parseWeekday(input, this.localeData());
                return this.add(input - day, 'd');
            } else {
                return day;
            }
        },

        month : makeAccessor('Month', true),

        startOf : function (units) {
            units = normalizeUnits(units);
            // the following switch intentionally omits break keywords
            // to utilize falling through the cases.
            switch (units) {
            case 'year':
                this.month(0);
                /* falls through */
            case 'quarter':
            case 'month':
                this.date(1);
                /* falls through */
            case 'week':
            case 'isoWeek':
            case 'day':
                this.hours(0);
                /* falls through */
            case 'hour':
                this.minutes(0);
                /* falls through */
            case 'minute':
                this.seconds(0);
                /* falls through */
            case 'second':
                this.milliseconds(0);
                /* falls through */
            }

            // weeks are a special case
            if (units === 'week') {
                this.weekday(0);
            } else if (units === 'isoWeek') {
                this.isoWeekday(1);
            }

            // quarters are also special
            if (units === 'quarter') {
                this.month(Math.floor(this.month() / 3) * 3);
            }

            return this;
        },

        endOf: function (units) {
            units = normalizeUnits(units);
            return this.startOf(units).add(1, (units === 'isoWeek' ? 'week' : units)).subtract(1, 'ms');
        },

        isAfter: function (input, units) {
            units = normalizeUnits(typeof units !== 'undefined' ? units : 'millisecond');
            if (units === 'millisecond') {
                input = moment.isMoment(input) ? input : moment(input);
                return +this > +input;
            } else {
                return +this.clone().startOf(units) > +moment(input).startOf(units);
            }
        },

        isBefore: function (input, units) {
            units = normalizeUnits(typeof units !== 'undefined' ? units : 'millisecond');
            if (units === 'millisecond') {
                input = moment.isMoment(input) ? input : moment(input);
                return +this < +input;
            } else {
                return +this.clone().startOf(units) < +moment(input).startOf(units);
            }
        },

        isSame: function (input, units) {
            units = normalizeUnits(units || 'millisecond');
            if (units === 'millisecond') {
                input = moment.isMoment(input) ? input : moment(input);
                return +this === +input;
            } else {
                return +this.clone().startOf(units) === +makeAs(input, this).startOf(units);
            }
        },

        min: deprecate(
                 'moment().min is deprecated, use moment.min instead. https://github.com/moment/moment/issues/1548',
                 function (other) {
                     other = moment.apply(null, arguments);
                     return other < this ? this : other;
                 }
         ),

        max: deprecate(
                'moment().max is deprecated, use moment.max instead. https://github.com/moment/moment/issues/1548',
                function (other) {
                    other = moment.apply(null, arguments);
                    return other > this ? this : other;
                }
        ),

        // keepLocalTime = true means only change the timezone, without
        // affecting the local hour. So 5:31:26 +0300 --[zone(2, true)]-->
        // 5:31:26 +0200 It is possible that 5:31:26 doesn't exist int zone
        // +0200, so we adjust the time as needed, to be valid.
        //
        // Keeping the time actually adds/subtracts (one hour)
        // from the actual represented time. That is why we call updateOffset
        // a second time. In case it wants us to change the offset again
        // _changeInProgress == true case, then we have to adjust, because
        // there is no such time in the given timezone.
        zone : function (input, keepLocalTime) {
            var offset = this._offset || 0,
                localAdjust;
            if (input != null) {
                if (typeof input === 'string') {
                    input = timezoneMinutesFromString(input);
                }
                if (Math.abs(input) < 16) {
                    input = input * 60;
                }
                if (!this._isUTC && keepLocalTime) {
                    localAdjust = this._dateTzOffset();
                }
                this._offset = input;
                this._isUTC = true;
                if (localAdjust != null) {
                    this.subtract(localAdjust, 'm');
                }
                if (offset !== input) {
                    if (!keepLocalTime || this._changeInProgress) {
                        addOrSubtractDurationFromMoment(this,
                                moment.duration(offset - input, 'm'), 1, false);
                    } else if (!this._changeInProgress) {
                        this._changeInProgress = true;
                        moment.updateOffset(this, true);
                        this._changeInProgress = null;
                    }
                }
            } else {
                return this._isUTC ? offset : this._dateTzOffset();
            }
            return this;
        },

        zoneAbbr : function () {
            return this._isUTC ? 'UTC' : '';
        },

        zoneName : function () {
            return this._isUTC ? 'Coordinated Universal Time' : '';
        },

        parseZone : function () {
            if (this._tzm) {
                this.zone(this._tzm);
            } else if (typeof this._i === 'string') {
                this.zone(this._i);
            }
            return this;
        },

        hasAlignedHourOffset : function (input) {
            if (!input) {
                input = 0;
            }
            else {
                input = moment(input).zone();
            }

            return (this.zone() - input) % 60 === 0;
        },

        daysInMonth : function () {
            return daysInMonth(this.year(), this.month());
        },

        dayOfYear : function (input) {
            var dayOfYear = round((moment(this).startOf('day') - moment(this).startOf('year')) / 864e5) + 1;
            return input == null ? dayOfYear : this.add((input - dayOfYear), 'd');
        },

        quarter : function (input) {
            return input == null ? Math.ceil((this.month() + 1) / 3) : this.month((input - 1) * 3 + this.month() % 3);
        },

        weekYear : function (input) {
            var year = weekOfYear(this, this.localeData()._week.dow, this.localeData()._week.doy).year;
            return input == null ? year : this.add((input - year), 'y');
        },

        isoWeekYear : function (input) {
            var year = weekOfYear(this, 1, 4).year;
            return input == null ? year : this.add((input - year), 'y');
        },

        week : function (input) {
            var week = this.localeData().week(this);
            return input == null ? week : this.add((input - week) * 7, 'd');
        },

        isoWeek : function (input) {
            var week = weekOfYear(this, 1, 4).week;
            return input == null ? week : this.add((input - week) * 7, 'd');
        },

        weekday : function (input) {
            var weekday = (this.day() + 7 - this.localeData()._week.dow) % 7;
            return input == null ? weekday : this.add(input - weekday, 'd');
        },

        isoWeekday : function (input) {
            // behaves the same as moment#day except
            // as a getter, returns 7 instead of 0 (1-7 range instead of 0-6)
            // as a setter, sunday should belong to the previous week.
            return input == null ? this.day() || 7 : this.day(this.day() % 7 ? input : input - 7);
        },

        isoWeeksInYear : function () {
            return weeksInYear(this.year(), 1, 4);
        },

        weeksInYear : function () {
            var weekInfo = this.localeData()._week;
            return weeksInYear(this.year(), weekInfo.dow, weekInfo.doy);
        },

        get : function (units) {
            units = normalizeUnits(units);
            return this[units]();
        },

        set : function (units, value) {
            units = normalizeUnits(units);
            if (typeof this[units] === 'function') {
                this[units](value);
            }
            return this;
        },

        // If passed a locale key, it will set the locale for this
        // instance.  Otherwise, it will return the locale configuration
        // variables for this instance.
        locale : function (key) {
            var newLocaleData;

            if (key === undefined) {
                return this._locale._abbr;
            } else {
                newLocaleData = moment.localeData(key);
                if (newLocaleData != null) {
                    this._locale = newLocaleData;
                }
                return this;
            }
        },

        lang : deprecate(
            'moment().lang() is deprecated. Use moment().localeData() instead.',
            function (key) {
                if (key === undefined) {
                    return this.localeData();
                } else {
                    return this.locale(key);
                }
            }
        ),

        localeData : function () {
            return this._locale;
        },

        _dateTzOffset : function () {
            // On Firefox.24 Date#getTimezoneOffset returns a floating point.
            // https://github.com/moment/moment/pull/1871
            return Math.round(this._d.getTimezoneOffset() / 15) * 15;
        }
    });

    function rawMonthSetter(mom, value) {
        var dayOfMonth;

        // TODO: Move this out of here!
        if (typeof value === 'string') {
            value = mom.localeData().monthsParse(value);
            // TODO: Another silent failure?
            if (typeof value !== 'number') {
                return mom;
            }
        }

        dayOfMonth = Math.min(mom.date(),
                daysInMonth(mom.year(), value));
        mom._d['set' + (mom._isUTC ? 'UTC' : '') + 'Month'](value, dayOfMonth);
        return mom;
    }

    function rawGetter(mom, unit) {
        return mom._d['get' + (mom._isUTC ? 'UTC' : '') + unit]();
    }

    function rawSetter(mom, unit, value) {
        if (unit === 'Month') {
            return rawMonthSetter(mom, value);
        } else {
            return mom._d['set' + (mom._isUTC ? 'UTC' : '') + unit](value);
        }
    }

    function makeAccessor(unit, keepTime) {
        return function (value) {
            if (value != null) {
                rawSetter(this, unit, value);
                moment.updateOffset(this, keepTime);
                return this;
            } else {
                return rawGetter(this, unit);
            }
        };
    }

    moment.fn.millisecond = moment.fn.milliseconds = makeAccessor('Milliseconds', false);
    moment.fn.second = moment.fn.seconds = makeAccessor('Seconds', false);
    moment.fn.minute = moment.fn.minutes = makeAccessor('Minutes', false);
    // Setting the hour should keep the time, because the user explicitly
    // specified which hour he wants. So trying to maintain the same hour (in
    // a new timezone) makes sense. Adding/subtracting hours does not follow
    // this rule.
    moment.fn.hour = moment.fn.hours = makeAccessor('Hours', true);
    // moment.fn.month is defined separately
    moment.fn.date = makeAccessor('Date', true);
    moment.fn.dates = deprecate('dates accessor is deprecated. Use date instead.', makeAccessor('Date', true));
    moment.fn.year = makeAccessor('FullYear', true);
    moment.fn.years = deprecate('years accessor is deprecated. Use year instead.', makeAccessor('FullYear', true));

    // add plural methods
    moment.fn.days = moment.fn.day;
    moment.fn.months = moment.fn.month;
    moment.fn.weeks = moment.fn.week;
    moment.fn.isoWeeks = moment.fn.isoWeek;
    moment.fn.quarters = moment.fn.quarter;

    // add aliased format methods
    moment.fn.toJSON = moment.fn.toISOString;

    /************************************
        Duration Prototype
    ************************************/


    function daysToYears (days) {
        // 400 years have 146097 days (taking into account leap year rules)
        return days * 400 / 146097;
    }

    function yearsToDays (years) {
        // years * 365 + absRound(years / 4) -
        //     absRound(years / 100) + absRound(years / 400);
        return years * 146097 / 400;
    }

    extend(moment.duration.fn = Duration.prototype, {

        _bubble : function () {
            var milliseconds = this._milliseconds,
                days = this._days,
                months = this._months,
                data = this._data,
                seconds, minutes, hours, years = 0;

            // The following code bubbles up values, see the tests for
            // examples of what that means.
            data.milliseconds = milliseconds % 1000;

            seconds = absRound(milliseconds / 1000);
            data.seconds = seconds % 60;

            minutes = absRound(seconds / 60);
            data.minutes = minutes % 60;

            hours = absRound(minutes / 60);
            data.hours = hours % 24;

            days += absRound(hours / 24);

            // Accurately convert days to years, assume start from year 0.
            years = absRound(daysToYears(days));
            days -= absRound(yearsToDays(years));

            // 30 days to a month
            // TODO (iskren): Use anchor date (like 1st Jan) to compute this.
            months += absRound(days / 30);
            days %= 30;

            // 12 months -> 1 year
            years += absRound(months / 12);
            months %= 12;

            data.days = days;
            data.months = months;
            data.years = years;
        },

        abs : function () {
            this._milliseconds = Math.abs(this._milliseconds);
            this._days = Math.abs(this._days);
            this._months = Math.abs(this._months);

            this._data.milliseconds = Math.abs(this._data.milliseconds);
            this._data.seconds = Math.abs(this._data.seconds);
            this._data.minutes = Math.abs(this._data.minutes);
            this._data.hours = Math.abs(this._data.hours);
            this._data.months = Math.abs(this._data.months);
            this._data.years = Math.abs(this._data.years);

            return this;
        },

        weeks : function () {
            return absRound(this.days() / 7);
        },

        valueOf : function () {
            return this._milliseconds +
              this._days * 864e5 +
              (this._months % 12) * 2592e6 +
              toInt(this._months / 12) * 31536e6;
        },

        humanize : function (withSuffix) {
            var output = relativeTime(this, !withSuffix, this.localeData());

            if (withSuffix) {
                output = this.localeData().pastFuture(+this, output);
            }

            return this.localeData().postformat(output);
        },

        add : function (input, val) {
            // supports only 2.0-style add(1, 's') or add(moment)
            var dur = moment.duration(input, val);

            this._milliseconds += dur._milliseconds;
            this._days += dur._days;
            this._months += dur._months;

            this._bubble();

            return this;
        },

        subtract : function (input, val) {
            var dur = moment.duration(input, val);

            this._milliseconds -= dur._milliseconds;
            this._days -= dur._days;
            this._months -= dur._months;

            this._bubble();

            return this;
        },

        get : function (units) {
            units = normalizeUnits(units);
            return this[units.toLowerCase() + 's']();
        },

        as : function (units) {
            var days, months;
            units = normalizeUnits(units);

            if (units === 'month' || units === 'year') {
                days = this._days + this._milliseconds / 864e5;
                months = this._months + daysToYears(days) * 12;
                return units === 'month' ? months : months / 12;
            } else {
                // handle milliseconds separately because of floating point math errors (issue #1867)
                days = this._days + yearsToDays(this._months / 12);
                switch (units) {
                    case 'week': return days / 7 + this._milliseconds / 6048e5;
                    case 'day': return days + this._milliseconds / 864e5;
                    case 'hour': return days * 24 + this._milliseconds / 36e5;
                    case 'minute': return days * 24 * 60 + this._milliseconds / 6e4;
                    case 'second': return days * 24 * 60 * 60 + this._milliseconds / 1000;
                    // Math.floor prevents floating point math errors here
                    case 'millisecond': return Math.floor(days * 24 * 60 * 60 * 1000) + this._milliseconds;
                    default: throw new Error('Unknown unit ' + units);
                }
            }
        },

        lang : moment.fn.lang,
        locale : moment.fn.locale,

        toIsoString : deprecate(
            'toIsoString() is deprecated. Please use toISOString() instead ' +
            '(notice the capitals)',
            function () {
                return this.toISOString();
            }
        ),

        toISOString : function () {
            // inspired by https://github.com/dordille/moment-isoduration/blob/master/moment.isoduration.js
            var years = Math.abs(this.years()),
                months = Math.abs(this.months()),
                days = Math.abs(this.days()),
                hours = Math.abs(this.hours()),
                minutes = Math.abs(this.minutes()),
                seconds = Math.abs(this.seconds() + this.milliseconds() / 1000);

            if (!this.asSeconds()) {
                // this is the same as C#'s (Noda) and python (isodate)...
                // but not other JS (goog.date)
                return 'P0D';
            }

            return (this.asSeconds() < 0 ? '-' : '') +
                'P' +
                (years ? years + 'Y' : '') +
                (months ? months + 'M' : '') +
                (days ? days + 'D' : '') +
                ((hours || minutes || seconds) ? 'T' : '') +
                (hours ? hours + 'H' : '') +
                (minutes ? minutes + 'M' : '') +
                (seconds ? seconds + 'S' : '');
        },

        localeData : function () {
            return this._locale;
        }
    });

    moment.duration.fn.toString = moment.duration.fn.toISOString;

    function makeDurationGetter(name) {
        moment.duration.fn[name] = function () {
            return this._data[name];
        };
    }

    for (i in unitMillisecondFactors) {
        if (hasOwnProp(unitMillisecondFactors, i)) {
            makeDurationGetter(i.toLowerCase());
        }
    }

    moment.duration.fn.asMilliseconds = function () {
        return this.as('ms');
    };
    moment.duration.fn.asSeconds = function () {
        return this.as('s');
    };
    moment.duration.fn.asMinutes = function () {
        return this.as('m');
    };
    moment.duration.fn.asHours = function () {
        return this.as('h');
    };
    moment.duration.fn.asDays = function () {
        return this.as('d');
    };
    moment.duration.fn.asWeeks = function () {
        return this.as('weeks');
    };
    moment.duration.fn.asMonths = function () {
        return this.as('M');
    };
    moment.duration.fn.asYears = function () {
        return this.as('y');
    };

    /************************************
        Default Locale
    ************************************/


    // Set default locale, other locale will inherit from English.
    moment.locale('en', {
        ordinal : function (number) {
            var b = number % 10,
                output = (toInt(number % 100 / 10) === 1) ? 'th' :
                (b === 1) ? 'st' :
                (b === 2) ? 'nd' :
                (b === 3) ? 'rd' : 'th';
            return number + output;
        }
    });

    /* EMBED_LOCALES */

    /************************************
        Exposing Moment
    ************************************/

    function makeGlobal(shouldDeprecate) {
        /*global ender:false */
        if (typeof ender !== 'undefined') {
            return;
        }
        oldGlobalMoment = globalScope.moment;
        if (shouldDeprecate) {
            globalScope.moment = deprecate(
                    'Accessing Moment through the global scope is ' +
                    'deprecated, and will be removed in an upcoming ' +
                    'release.',
                    moment);
        } else {
            globalScope.moment = moment;
        }
    }

    // CommonJS module is defined
    if (hasModule) {
        module.exports = moment;
    } else if (typeof define === 'function' && define.amd) {
        define('moment', function (require, exports, module) {
            if (module.config && module.config() && module.config().noGlobal === true) {
                // release the global variable
                globalScope.moment = oldGlobalMoment;
            }

            return moment;
        });
        makeGlobal(true);
    } else {
        makeGlobal();
    }
}).call(this);

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{}],"/home/jvwong/Projects/shellac/shellac.no-ip.ca/source/shellac/static/shellac/js/node_modules/taffydb/taffy.js":[function(require,module,exports){
/*

 Software License Agreement (BSD License)
 http://taffydb.com
 Copyright (c)
 All rights reserved.


 Redistribution and use of this software in source and binary forms, with or without modification, are permitted provided that the following condition is met:

 * Redistributions of source code must retain the above copyright notice, this list of conditions and the following disclaimer.

 THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT OWNER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT
 LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.

 */

/*jslint        browser : true, continue : true,
 devel  : true, indent  : 2,    maxerr   : 500,
 newcap : true, nomen   : true, plusplus : true,
 regexp : true, sloppy  : true, vars     : false,
 white  : true
*/

// BUILD 193d48d, modified by mmikowski to pass jslint

// Setup TAFFY name space to return an object with methods
var TAFFY, exports, T;
(function () {
  'use strict';
  var
    typeList,     makeTest,     idx,    typeKey,
    version,      TC,           idpad,  cmax,
    API,          protectJSON,  each,   eachin,
    isIndexable,  returnFilter, runFilters,
    numcharsplit, orderByCol,   run,    intersection,
    filter,       makeCid,      safeForJson,
    isRegexp
    ;


  if ( ! TAFFY ){
    // TC = Counter for Taffy DBs on page, used for unique IDs
    // cmax = size of charnumarray conversion cache
    // idpad = zeros to pad record IDs with
    version = '2.7';
    TC      = 1;
    idpad   = '000000';
    cmax    = 1000;
    API     = {};

    protectJSON = function ( t ) {
      // ****************************************
      // *
      // * Takes: a variable
      // * Returns: the variable if object/array or the parsed variable if JSON
      // *
      // ****************************************  
      if ( TAFFY.isArray( t ) || TAFFY.isObject( t ) ){
        return t;
      }
      else {
        return JSON.parse( t );
      }
    };
    
    // gracefully stolen from underscore.js
    intersection = function(array1, array2) {
        return filter(array1, function(item) {
          return array2.indexOf(item) >= 0;
        });
    };

    // gracefully stolen from underscore.js
    filter = function(obj, iterator, context) {
        var results = [];
        if (obj == null) return results;
        if (Array.prototype.filter && obj.filter === Array.prototype.filter) return obj.filter(iterator, context);
        each(obj, function(value, index, list) {
          if (iterator.call(context, value, index, list)) results[results.length] = value;
        });
        return results;
    };
    
    isRegexp = function(aObj) {
        return Object.prototype.toString.call(aObj)==='[object RegExp]';
    }
    
    safeForJson = function(aObj) {
        var myResult = T.isArray(aObj) ? [] : T.isObject(aObj) ? {} : null;
        if(aObj===null) return aObj;
        for(var i in aObj) {
            myResult[i]  = isRegexp(aObj[i]) ? aObj[i].toString() : T.isArray(aObj[i]) || T.isObject(aObj[i]) ? safeForJson(aObj[i]) : aObj[i];
        }
        return myResult;
    }
    
    makeCid = function(aContext) {
        var myCid = JSON.stringify(aContext);
        if(myCid.match(/regex/)===null) return myCid;
        return JSON.stringify(safeForJson(aContext));
    }
    
    each = function ( a, fun, u ) {
      var r, i, x, y;
      // ****************************************
      // *
      // * Takes:
      // * a = an object/value or an array of objects/values
      // * f = a function
      // * u = optional flag to describe how to handle undefined values
      //   in array of values. True: pass them to the functions,
      //   False: skip. Default False;
      // * Purpose: Used to loop over arrays
      // *
      // ****************************************  
      if ( a && ((T.isArray( a ) && a.length === 1) || (!T.isArray( a ))) ){
        fun( (T.isArray( a )) ? a[0] : a, 0 );
      }
      else {
        for ( r, i, x = 0, a = (T.isArray( a )) ? a : [a], y = a.length;
              x < y; x++ )
        {
          i = a[x];
          if ( !T.isUndefined( i ) || (u || false) ){
            r = fun( i, x );
            if ( r === T.EXIT ){
              break;
            }

          }
        }
      }
    };

    eachin = function ( o, fun ) {
      // ****************************************
      // *
      // * Takes:
      // * o = an object
      // * f = a function
      // * Purpose: Used to loop over objects
      // *
      // ****************************************  
      var x = 0, r, i;

      for ( i in o ){
        if ( o.hasOwnProperty( i ) ){
          r = fun( o[i], i, x++ );
          if ( r === T.EXIT ){
            break;
          }
        }
      }

    };

    API.extend = function ( m, f ) {
      // ****************************************
      // *
      // * Takes: method name, function
      // * Purpose: Add a custom method to the API
      // *
      // ****************************************  
      API[m] = function () {
        return f.apply( this, arguments );
      };
    };

    isIndexable = function ( f ) {
      var i;
      // Check to see if record ID
      if ( T.isString( f ) && /[t][0-9]*[r][0-9]*/i.test( f ) ){
        return true;
      }
      // Check to see if record
      if ( T.isObject( f ) && f.___id && f.___s ){
        return true;
      }

      // Check to see if array of indexes
      if ( T.isArray( f ) ){
        i = true;
        each( f, function ( r ) {
          if ( !isIndexable( r ) ){
            i = false;

            return TAFFY.EXIT;
          }
        });
        return i;
      }

      return false;
    };

    runFilters = function ( r, filter ) {
      // ****************************************
      // *
      // * Takes: takes a record and a collection of filters
      // * Returns: true if the record matches, false otherwise
      // ****************************************
      var match = true;


      each( filter, function ( mf ) {
        switch ( T.typeOf( mf ) ){
          case 'function':
            // run function
            if ( !mf.apply( r ) ){
              match = false;
              return TAFFY.EXIT;
            }
            break;
          case 'array':
            // loop array and treat like a SQL or
            match = (mf.length === 1) ? (runFilters( r, mf[0] )) :
              (mf.length === 2) ? (runFilters( r, mf[0] ) ||
                runFilters( r, mf[1] )) :
                (mf.length === 3) ? (runFilters( r, mf[0] ) ||
                  runFilters( r, mf[1] ) || runFilters( r, mf[2] )) :
                  (mf.length === 4) ? (runFilters( r, mf[0] ) ||
                    runFilters( r, mf[1] ) || runFilters( r, mf[2] ) ||
                    runFilters( r, mf[3] )) : false;
            if ( mf.length > 4 ){
              each( mf, function ( f ) {
                if ( runFilters( r, f ) ){
                  match = true;
                }
              });
            }
            break;
        }
      });

      return match;
    };

    returnFilter = function ( f ) {
      // ****************************************
      // *
      // * Takes: filter object
      // * Returns: a filter function
      // * Purpose: Take a filter object and return a function that can be used to compare
      // * a TaffyDB record to see if the record matches a query
      // ****************************************  
      var nf = [];
      if ( T.isString( f ) && /[t][0-9]*[r][0-9]*/i.test( f ) ){
        f = { ___id : f };
      }
      if ( T.isArray( f ) ){
        // if we are working with an array

        each( f, function ( r ) {
          // loop the array and return a filter func for each value
          nf.push( returnFilter( r ) );
        });
        // now build a func to loop over the filters and return true if ANY of the filters match
        // This handles logical OR expressions
        f = function () {
          var that = this, match = false;
          each( nf, function ( f ) {
            if ( runFilters( that, f ) ){
              match = true;
            }
          });
          return match;
        };
        return f;

      }
      // if we are dealing with an Object
      if ( T.isObject( f ) ){
        if ( T.isObject( f ) && f.___id && f.___s ){
          f = { ___id : f.___id };
        }

        // Loop over each value on the object to prep match type and match value
        eachin( f, function ( v, i ) {

          // default match type to IS/Equals
          if ( !T.isObject( v ) ){
            v = {
              'is' : v
            };
          }
          // loop over each value on the value object  - if any
          eachin( v, function ( mtest, s ) {
            // s = match type, e.g. is, hasAll, like, etc
            var c = [], looper;

            // function to loop and apply filter
            looper = (s === 'hasAll') ?
              function ( mtest, func ) {
                func( mtest );
              } : each;

            // loop over each test
            looper( mtest, function ( mtest ) {

              // su = match success
              // f = match false
              var su = true, f = false, matchFunc;


              // push a function onto the filter collection to do the matching
              matchFunc = function () {

                // get the value from the record
                var
                  mvalue   = this[i],
                  eqeq     = '==',
                  bangeq   = '!=',
                  eqeqeq   = '===',
                  lt   = '<',
                  gt   = '>',
                  lteq   = '<=',
                  gteq   = '>=',
                  bangeqeq = '!==',
                  r
                  ;

                if (typeof mvalue === 'undefined') {
                  return false;
                }
                
                if ( (s.indexOf( '!' ) === 0) && s !== bangeq &&
                  s !== bangeqeq )
                {
                  // if the filter name starts with ! as in '!is' then reverse the match logic and remove the !
                  su = false;
                  s = s.substring( 1, s.length );
                }
                // get the match results based on the s/match type
                /*jslint eqeq : true */
                r = (
                  (s === 'regex') ? (mtest.test( mvalue )) : (s === 'lt' || s === lt)
                  ? (mvalue < mtest)  : (s === 'gt' || s === gt)
                  ? (mvalue > mtest)  : (s === 'lte' || s === lteq)
                  ? (mvalue <= mtest) : (s === 'gte' || s === gteq)
                  ? (mvalue >= mtest) : (s === 'left')
                  ? (mvalue.indexOf( mtest ) === 0) : (s === 'leftnocase')
                  ? (mvalue.toLowerCase().indexOf( mtest.toLowerCase() )
                    === 0) : (s === 'right')
                  ? (mvalue.substring( (mvalue.length - mtest.length) )
                    === mtest) : (s === 'rightnocase')
                  ? (mvalue.toLowerCase().substring(
                    (mvalue.length - mtest.length) ) === mtest.toLowerCase())
                    : (s === 'like')
                  ? (mvalue.indexOf( mtest ) >= 0) : (s === 'likenocase')
                  ? (mvalue.toLowerCase().indexOf(mtest.toLowerCase()) >= 0)
                    : (s === eqeqeq || s === 'is')
                  ? (mvalue ===  mtest) : (s === eqeq)
                  ? (mvalue == mtest) : (s === bangeqeq)
                  ? (mvalue !==  mtest) : (s === bangeq)
                  ? (mvalue != mtest) : (s === 'isnocase')
                  ? (mvalue.toLowerCase
                    ? mvalue.toLowerCase() === mtest.toLowerCase()
                      : mvalue === mtest) : (s === 'has')
                  ? (T.has( mvalue, mtest )) : (s === 'hasall')
                  ? (T.hasAll( mvalue, mtest )) : (s === 'contains')
                  ? (TAFFY.isArray(mvalue) && mvalue.indexOf(mtest) > -1) : (
                    s.indexOf( 'is' ) === -1
                      && !TAFFY.isNull( mvalue )
                      && !TAFFY.isUndefined( mvalue )
                      && !TAFFY.isObject( mtest )
                      && !TAFFY.isArray( mtest )
                    )
                  ? (mtest === mvalue[s])
                    : (T[s] && T.isFunction( T[s] )
                    && s.indexOf( 'is' ) === 0)
                  ? T[s]( mvalue ) === mtest
                    : (T[s] && T.isFunction( T[s] ))
                  ? T[s]( mvalue, mtest ) : (false)
                );
                /*jslint eqeq : false */
                r = (r && !su) ? false : (!r && !su) ? true : r;

                return r;
              };
              c.push( matchFunc );

            });
            // if only one filter in the collection push it onto the filter list without the array
            if ( c.length === 1 ){

              nf.push( c[0] );
            }
            else {
              // else build a function to loop over all the filters and return true only if ALL match
              // this is a logical AND
              nf.push( function () {
                var that = this, match = false;
                each( c, function ( f ) {
                  if ( f.apply( that ) ){
                    match = true;
                  }
                });
                return match;
              });
            }
          });
        });
        // finally return a single function that wraps all the other functions and will run a query
        // where all functions have to return true for a record to appear in a query result
        f = function () {
          var that = this, match = true;
          // faster if less than  4 functions
          match = (nf.length === 1 && !nf[0].apply( that )) ? false :
            (nf.length === 2 &&
              (!nf[0].apply( that ) || !nf[1].apply( that ))) ? false :
              (nf.length === 3 &&
                (!nf[0].apply( that ) || !nf[1].apply( that ) ||
                  !nf[2].apply( that ))) ? false :
                (nf.length === 4 &&
                  (!nf[0].apply( that ) || !nf[1].apply( that ) ||
                    !nf[2].apply( that ) || !nf[3].apply( that ))) ? false
                  : true;
          if ( nf.length > 4 ){
            each( nf, function ( f ) {
              if ( !runFilters( that, f ) ){
                match = false;
              }
            });
          }
          return match;
        };
        return f;
      }

      // if function
      if ( T.isFunction( f ) ){
        return f;
      }
    };

    orderByCol = function ( ar, o ) {
      // ****************************************
      // *
      // * Takes: takes an array and a sort object
      // * Returns: the array sorted
      // * Purpose: Accept filters such as "[col], [col2]" or "[col] desc" and sort on those columns
      // *
      // ****************************************

      var sortFunc = function ( a, b ) {
        // function to pass to the native array.sort to sort an array
        var r = 0;

        T.each( o, function ( sd ) {
          // loop over the sort instructions
          // get the column name
          var o, col, dir, c, d;
          o = sd.split( ' ' );
          col = o[0];

          // get the direction
          dir = (o.length === 1) ? "logical" : o[1];


          if ( dir === 'logical' ){
            // if dir is logical than grab the charnum arrays for the two values we are looking at
            c = numcharsplit( a[col] );
            d = numcharsplit( b[col] );
            // loop over the charnumarrays until one value is higher than the other
            T.each( (c.length <= d.length) ? c : d, function ( x, i ) {
              if ( c[i] < d[i] ){
                r = -1;
                return TAFFY.EXIT;
              }
              else if ( c[i] > d[i] ){
                r = 1;
                return TAFFY.EXIT;
              }
            } );
          }
          else if ( dir === 'logicaldesc' ){
            // if logicaldesc than grab the charnum arrays for the two values we are looking at
            c = numcharsplit( a[col] );
            d = numcharsplit( b[col] );
            // loop over the charnumarrays until one value is lower than the other
            T.each( (c.length <= d.length) ? c : d, function ( x, i ) {
              if ( c[i] > d[i] ){
                r = -1;
                return TAFFY.EXIT;
              }
              else if ( c[i] < d[i] ){
                r = 1;
                return TAFFY.EXIT;
              }
            } );
          }
          else if ( dir === 'asec' && a[col] < b[col] ){
            // if asec - default - check to see which is higher
            r = -1;
            return T.EXIT;
          }
          else if ( dir === 'asec' && a[col] > b[col] ){
            // if asec - default - check to see which is higher
            r = 1;
            return T.EXIT;
          }
          else if ( dir === 'desc' && a[col] > b[col] ){
            // if desc check to see which is lower
            r = -1;
            return T.EXIT;

          }
          else if ( dir === 'desc' && a[col] < b[col] ){
            // if desc check to see which is lower
            r = 1;
            return T.EXIT;

          }
          // if r is still 0 and we are doing a logical sort than look to see if one array is longer than the other
          if ( r === 0 && dir === 'logical' && c.length < d.length ){
            r = -1;
          }
          else if ( r === 0 && dir === 'logical' && c.length > d.length ){
            r = 1;
          }
          else if ( r === 0 && dir === 'logicaldesc' && c.length > d.length ){
            r = -1;
          }
          else if ( r === 0 && dir === 'logicaldesc' && c.length < d.length ){
            r = 1;
          }

          if ( r !== 0 ){
            return T.EXIT;
          }


        } );
        return r;
      };
      // call the sort function and return the newly sorted array
      return (ar && ar.push) ? ar.sort( sortFunc ) : ar;


    };

    // ****************************************
    // *
    // * Takes: a string containing numbers and letters and turn it into an array
    // * Returns: return an array of numbers and letters
    // * Purpose: Used for logical sorting. String Example: 12ABC results: [12,'ABC']
    // **************************************** 
    (function () {
      // creates a cache for numchar conversions
      var cache = {}, cachcounter = 0;
      // creates the numcharsplit function
      numcharsplit = function ( thing ) {
        // if over 1000 items exist in the cache, clear it and start over
        if ( cachcounter > cmax ){
          cache = {};
          cachcounter = 0;
        }

        // if a cache can be found for a numchar then return its array value
        return cache['_' + thing] || (function () {
          // otherwise do the conversion
          // make sure it is a string and setup so other variables
          var nthing = String( thing ),
            na = [],
            rv = '_',
            rt = '',
            x, xx, c;

          // loop over the string char by char
          for ( x = 0, xx = nthing.length; x < xx; x++ ){
            // take the char at each location
            c = nthing.charCodeAt( x );
            // check to see if it is a valid number char and append it to the array.
            // if last char was a string push the string to the charnum array
            if ( ( c >= 48 && c <= 57 ) || c === 46 ){
              if ( rt !== 'n' ){
                rt = 'n';
                na.push( rv.toLowerCase() );
                rv = '';
              }
              rv = rv + nthing.charAt( x );
            }
            else {
              // check to see if it is a valid string char and append to string
              // if last char was a number push the whole number to the charnum array
              if ( rt !== 's' ){
                rt = 's';
                na.push( parseFloat( rv ) );
                rv = '';
              }
              rv = rv + nthing.charAt( x );
            }
          }
          // once done, push the last value to the charnum array and remove the first uneeded item
          na.push( (rt === 'n') ? parseFloat( rv ) : rv.toLowerCase() );
          na.shift();
          // add to cache
          cache['_' + thing] = na;
          cachcounter++;
          // return charnum array
          return na;
        }());
      };
    }());

    // ****************************************
    // *
    // * Runs a query
    // **************************************** 


    run = function () {
      this.context( {
        results : this.getDBI().query( this.context() )
      });

    };

    API.extend( 'filter', function () {
      // ****************************************
      // *
      // * Takes: takes unlimited filter objects as arguments
      // * Returns: method collection
      // * Purpose: Take filters as objects and cache functions for later lookup when a query is run
      // **************************************** 
      var
        nc = TAFFY.mergeObj( this.context(), { run : null } ),
        nq = []
      ;
      each( nc.q, function ( v ) {
        nq.push( v );
      });
      nc.q = nq;
      // Hadnle passing of ___ID or a record on lookup.
      each( arguments, function ( f ) {
        nc.q.push( returnFilter( f ) );
        nc.filterRaw.push( f );
      });

      return this.getroot( nc );
    });

    API.extend( 'order', function ( o ) {
      // ****************************************
      // *
      // * Purpose: takes a string and creates an array of order instructions to be used with a query
      // ****************************************

      o = o.split( ',' );
      var x = [], nc;

      each( o, function ( r ) {
        x.push( r.replace( /^\s*/, '' ).replace( /\s*$/, '' ) );
      });

      nc = TAFFY.mergeObj( this.context(), {sort : null} );
      nc.order = x;

      return this.getroot( nc );
    });

    API.extend( 'limit', function ( n ) {
      // ****************************************
      // *
      // * Purpose: takes a limit number to limit the number of rows returned by a query. Will update the results
      // * of a query
      // **************************************** 
      var nc = TAFFY.mergeObj( this.context(), {}),
        limitedresults
        ;

      nc.limit = n;

      if ( nc.run && nc.sort ){
        limitedresults = [];
        each( nc.results, function ( i, x ) {
          if ( (x + 1) > n ){
            return TAFFY.EXIT;
          }
          limitedresults.push( i );
        });
        nc.results = limitedresults;
      }

      return this.getroot( nc );
    });

    API.extend( 'start', function ( n ) {
      // ****************************************
      // *
      // * Purpose: takes a limit number to limit the number of rows returned by a query. Will update the results
      // * of a query
      // **************************************** 
      var nc = TAFFY.mergeObj( this.context(), {} ),
        limitedresults
        ;

      nc.start = n;

      if ( nc.run && nc.sort && !nc.limit ){
        limitedresults = [];
        each( nc.results, function ( i, x ) {
          if ( (x + 1) > n ){
            limitedresults.push( i );
          }
        });
        nc.results = limitedresults;
      }
      else {
        nc = TAFFY.mergeObj( this.context(), {run : null, start : n} );
      }

      return this.getroot( nc );
    });

    API.extend( 'update', function ( arg0, arg1, arg2 ) {
      // ****************************************
      // *
      // * Takes: a object and passes it off DBI update method for all matched records
      // **************************************** 
      var runEvent = true, o = {}, args = arguments, that;
      if ( TAFFY.isString( arg0 ) &&
        (arguments.length === 2 || arguments.length === 3) )
      {
        o[arg0] = arg1;
        if ( arguments.length === 3 ){
          runEvent = arg2;
        }
      }
      else {
        o = arg0;
        if ( args.length === 2 ){
          runEvent = arg1;
        }
      }

      that = this;
      run.call( this );
      each( this.context().results, function ( r ) {
        var c = o;
        if ( TAFFY.isFunction( c ) ){
          c = c.apply( TAFFY.mergeObj( r, {} ) );
        }
        else {
          if ( T.isFunction( c ) ){
            c = c( TAFFY.mergeObj( r, {} ) );
          }
        }
        if ( TAFFY.isObject( c ) ){
          that.getDBI().update( r.___id, c, runEvent );
        }
      });
      if ( this.context().results.length ){
        this.context( { run : null });
      }
      return this;
    });
    API.extend( 'remove', function ( runEvent ) {
      // ****************************************
      // *
      // * Purpose: removes records from the DB via the remove and removeCommit DBI methods
      // **************************************** 
      var that = this, c = 0;
      run.call( this );
      each( this.context().results, function ( r ) {
        that.getDBI().remove( r.___id );
        c++;
      });
      if ( this.context().results.length ){
        this.context( {
          run : null
        });
        that.getDBI().removeCommit( runEvent );
      }

      return c;
    });


    API.extend( 'count', function () {
      // ****************************************
      // *
      // * Returns: The length of a query result
      // **************************************** 
      run.call( this );
      return this.context().results.length;
    });

    API.extend( 'callback', function ( f, delay ) {
      // ****************************************
      // *
      // * Returns null;
      // * Runs a function on return of run.call
      // **************************************** 
      if ( f ){
        var that = this;
        setTimeout( function () {
          run.call( that );
          f.call( that.getroot( that.context() ) );
        }, delay || 0 );
      }


      return null;
    });

    API.extend( 'get', function () {
      // ****************************************
      // *
      // * Returns: An array of all matching records
      // **************************************** 
      run.call( this );
      return this.context().results;
    });

    API.extend( 'stringify', function () {
      // ****************************************
      // *
      // * Returns: An JSON string of all matching records
      // **************************************** 
      return JSON.stringify( this.get() );
    });
    API.extend( 'first', function () {
      // ****************************************
      // *
      // * Returns: The first matching record
      // **************************************** 
      run.call( this );
      return this.context().results[0] || false;
    });
    API.extend( 'last', function () {
      // ****************************************
      // *
      // * Returns: The last matching record
      // **************************************** 
      run.call( this );
      return this.context().results[this.context().results.length - 1] ||
        false;
    });


    API.extend( 'sum', function () {
      // ****************************************
      // *
      // * Takes: column to sum up
      // * Returns: Sums the values of a column
      // **************************************** 
      var total = 0, that = this;
      run.call( that );
      each( arguments, function ( c ) {
        each( that.context().results, function ( r ) {
          total = total + (r[c] || 0);
        });
      });
      return total;
    });

    API.extend( 'min', function ( c ) {
      // ****************************************
      // *
      // * Takes: column to find min
      // * Returns: the lowest value
      // **************************************** 
      var lowest = null;
      run.call( this );
      each( this.context().results, function ( r ) {
        if ( lowest === null || r[c] < lowest ){
          lowest = r[c];
        }
      });
      return lowest;
    });

    //  Taffy innerJoin Extension (OCD edition)
    //  =======================================
    //
    //  How to Use
    //  **********
    //
    //  left_table.innerJoin( right_table, condition1 <,... conditionN> )
    //
    //  A condition can take one of 2 forms:
    //
    //    1. An ARRAY with 2 or 3 values:
    //    A column name from the left table, an optional comparison string,
    //    and column name from the right table.  The condition passes if the test
    //    indicated is true.   If the condition string is omitted, '===' is assumed.
    //    EXAMPLES: [ 'last_used_time', '>=', 'current_use_time' ], [ 'user_id','id' ]
    //
    //    2. A FUNCTION:
    //    The function receives a left table row and right table row during the
    //    cartesian join.  If the function returns true for the rows considered,
    //    the merged row is included in the result set.
    //    EXAMPLE: function (l,r){ return l.name === r.label; }
    //
    //  Conditions are considered in the order they are presented.  Therefore the best
    //  performance is realized when the least expensive and highest prune-rate
    //  conditions are placed first, since if they return false Taffy skips any
    //  further condition tests.
    //
    //  Other notes
    //  ***********
    //
    //  This code passes jslint with the exception of 2 warnings about
    //  the '==' and '!=' lines.  We can't do anything about that short of
    //  deleting the lines.
    //
    //  Credits
    //  *******
    //
    //  Heavily based upon the work of Ian Toltz.
    //  Revisions to API by Michael Mikowski.
    //  Code convention per standards in http://manning.com/mikowski
    (function () {
      var innerJoinFunction = (function () {
        var fnCompareList, fnCombineRow, fnMain;

        fnCompareList = function ( left_row, right_row, arg_list ) {
          var data_lt, data_rt, op_code, error;

          if ( arg_list.length === 2 ){
            data_lt = left_row[arg_list[0]];
            op_code = '===';
            data_rt = right_row[arg_list[1]];
          }
          else {
            data_lt = left_row[arg_list[0]];
            op_code = arg_list[1];
            data_rt = right_row[arg_list[2]];
          }

          /*jslint eqeq : true */
          switch ( op_code ){
            case '===' :
              return data_lt === data_rt;
            case '!==' :
              return data_lt !== data_rt;
            case '<'   :
              return data_lt < data_rt;
            case '>'   :
              return data_lt > data_rt;
            case '<='  :
              return data_lt <= data_rt;
            case '>='  :
              return data_lt >= data_rt;
            case '=='  :
              return data_lt == data_rt;
            case '!='  :
              return data_lt != data_rt;
            default :
              throw String( op_code ) + ' is not supported';
          }
          // 'jslint eqeq : false'  here results in
          // "Unreachable '/*jslint' after 'return'".
          // We don't need it though, as the rule exception
          // is discarded at the end of this functional scope
        };

        fnCombineRow = function ( left_row, right_row ) {
          var out_map = {}, i, prefix;

          for ( i in left_row ){
            if ( left_row.hasOwnProperty( i ) ){
              out_map[i] = left_row[i];
            }
          }
          for ( i in right_row ){
            if ( right_row.hasOwnProperty( i ) && i !== '___id' &&
              i !== '___s' )
            {
              prefix = !TAFFY.isUndefined( out_map[i] ) ? 'right_' : '';
              out_map[prefix + String( i ) ] = right_row[i];
            }
          }
          return out_map;
        };

        fnMain = function ( table ) {
          var
            right_table, i,
            arg_list = arguments,
            arg_length = arg_list.length,
            result_list = []
            ;

          if ( typeof table.filter !== 'function' ){
            if ( table.TAFFY ){ right_table = table(); }
            else {
              throw 'TAFFY DB or result not supplied';
            }
          }
          else { right_table = table; }

          this.context( {
            results : this.getDBI().query( this.context() )
          } );

          TAFFY.each( this.context().results, function ( left_row ) {
            right_table.each( function ( right_row ) {
              var arg_data, is_ok = true;
              CONDITION:
                for ( i = 1; i < arg_length; i++ ){
                  arg_data = arg_list[i];
                  if ( typeof arg_data === 'function' ){
                    is_ok = arg_data( left_row, right_row );
                  }
                  else if ( typeof arg_data === 'object' && arg_data.length ){
                    is_ok = fnCompareList( left_row, right_row, arg_data );
                  }
                  else {
                    is_ok = false;
                  }

                  if ( !is_ok ){ break CONDITION; } // short circuit
                }

              if ( is_ok ){
                result_list.push( fnCombineRow( left_row, right_row ) );
              }
            } );
          } );
          return TAFFY( result_list )();
        };

        return fnMain;
      }());

      API.extend( 'join', innerJoinFunction );
    }());

    API.extend( 'max', function ( c ) {
      // ****************************************
      // *
      // * Takes: column to find max
      // * Returns: the highest value
      // ****************************************
      var highest = null;
      run.call( this );
      each( this.context().results, function ( r ) {
        if ( highest === null || r[c] > highest ){
          highest = r[c];
        }
      });
      return highest;
    });

    API.extend( 'select', function () {
      // ****************************************
      // *
      // * Takes: columns to select values into an array
      // * Returns: array of values
      // * Note if more than one column is given an array of arrays is returned
      // **************************************** 

      var ra = [], args = arguments;
      run.call( this );
      if ( arguments.length === 1 ){

        each( this.context().results, function ( r ) {

          ra.push( r[args[0]] );
        });
      }
      else {
        each( this.context().results, function ( r ) {
          var row = [];
          each( args, function ( c ) {
            row.push( r[c] );
          });
          ra.push( row );
        });
      }
      return ra;
    });
    API.extend( 'distinct', function () {
      // ****************************************
      // *
      // * Takes: columns to select unique alues into an array
      // * Returns: array of values
      // * Note if more than one column is given an array of arrays is returned
      // **************************************** 
      var ra = [], args = arguments;
      run.call( this );
      if ( arguments.length === 1 ){

        each( this.context().results, function ( r ) {
          var v = r[args[0]], dup = false;
          each( ra, function ( d ) {
            if ( v === d ){
              dup = true;
              return TAFFY.EXIT;
            }
          });
          if ( !dup ){
            ra.push( v );
          }
        });
      }
      else {
        each( this.context().results, function ( r ) {
          var row = [], dup = false;
          each( args, function ( c ) {
            row.push( r[c] );
          });
          each( ra, function ( d ) {
            var ldup = true;
            each( args, function ( c, i ) {
              if ( row[i] !== d[i] ){
                ldup = false;
                return TAFFY.EXIT;
              }
            });
            if ( ldup ){
              dup = true;
              return TAFFY.EXIT;
            }
          });
          if ( !dup ){
            ra.push( row );
          }
        });
      }
      return ra;
    });
    API.extend( 'supplant', function ( template, returnarray ) {
      // ****************************************
      // *
      // * Takes: a string template formated with key to be replaced with values from the rows, flag to determine if we want array of strings
      // * Returns: array of values or a string
      // **************************************** 
      var ra = [];
      run.call( this );
      each( this.context().results, function ( r ) {
        // TODO: The curly braces used to be unescaped
        ra.push( template.replace( /\{([^\{\}]*)\}/g, function ( a, b ) {
          var v = r[b];
          return typeof v === 'string' || typeof v === 'number' ? v : a;
        } ) );
      });
      return (!returnarray) ? ra.join( "" ) : ra;
    });


    API.extend( 'each', function ( m ) {
      // ****************************************
      // *
      // * Takes: a function
      // * Purpose: loops over every matching record and applies the function
      // **************************************** 
      run.call( this );
      each( this.context().results, m );
      return this;
    });
    API.extend( 'map', function ( m ) {
      // ****************************************
      // *
      // * Takes: a function
      // * Purpose: loops over every matching record and applies the function, returing the results in an array
      // **************************************** 
      var ra = [];
      run.call( this );
      each( this.context().results, function ( r ) {
        ra.push( m( r ) );
      });
      return ra;
    });



    T = function ( d ) {
      // ****************************************
      // *
      // * T is the main TAFFY object
      // * Takes: an array of objects or JSON
      // * Returns a new TAFFYDB
      // **************************************** 
      var TOb = [],
        ID = {},
        RC = 1,
        settings = {
          template          : false,
          onInsert          : false,
          onUpdate          : false,
          onRemove          : false,
          onDBChange        : false,
          storageName       : false,
          forcePropertyCase : null,
          cacheSize         : 100,
          name              : ''
        },
        dm = new Date(),
        CacheCount = 0,
        CacheClear = 0,
        Cache = {},
        DBI, runIndexes, root
        ;
      // ****************************************
      // *
      // * TOb = this database
      // * ID = collection of the record IDs and locations within the DB, used for fast lookups
      // * RC = record counter, used for creating IDs
      // * settings.template = the template to merge all new records with
      // * settings.onInsert = event given a copy of the newly inserted record
      // * settings.onUpdate = event given the original record, the changes, and the new record
      // * settings.onRemove = event given the removed record
      // * settings.forcePropertyCase = on insert force the proprty case to be lower or upper. default lower, null/undefined will leave case as is
      // * dm = the modify date of the database, used for query caching
      // **************************************** 


      runIndexes = function ( indexes ) {
        // ****************************************
        // *
        // * Takes: a collection of indexes
        // * Returns: collection with records matching indexed filters
        // **************************************** 

        var records = [], UniqueEnforce = false;

        if ( indexes.length === 0 ){
          return TOb;
        }

        each( indexes, function ( f ) {
          // Check to see if record ID
          if ( T.isString( f ) && /[t][0-9]*[r][0-9]*/i.test( f ) &&
            TOb[ID[f]] )
          {
            records.push( TOb[ID[f]] );
            UniqueEnforce = true;
          }
          // Check to see if record
          if ( T.isObject( f ) && f.___id && f.___s &&
            TOb[ID[f.___id]] )
          {
            records.push( TOb[ID[f.___id]] );
            UniqueEnforce = true;
          }
          // Check to see if array of indexes
          if ( T.isArray( f ) ){
            each( f, function ( r ) {
              each( runIndexes( r ), function ( rr ) {
                records.push( rr );
              });

            });
          }
        });
        if ( UniqueEnforce && records.length > 1 ){
          records = [];
        }

        return records;
      };

      DBI = {
        // ****************************************
        // *
        // * The DBI is the internal DataBase Interface that interacts with the data
        // **************************************** 
        dm           : function ( nd ) {
          // ****************************************
          // *
          // * Takes: an optional new modify date
          // * Purpose: used to get and set the DB modify date
          // **************************************** 
          if ( nd ){
            dm = nd;
            Cache = {};
            CacheCount = 0;
            CacheClear = 0;
          }
          if ( settings.onDBChange ){
            setTimeout( function () {
              settings.onDBChange.call( TOb );
            }, 0 );
          }
          if ( settings.storageName ){
            setTimeout( function () {
              localStorage.setItem( 'taffy_' + settings.storageName,
                JSON.stringify( TOb ) );
            });
          }
          return dm;
        },
        insert       : function ( i, runEvent ) {
          // ****************************************
          // *
          // * Takes: a new record to insert
          // * Purpose: merge the object with the template, add an ID, insert into DB, call insert event
          // **************************************** 
          var columns = [],
            records   = [],
            input     = protectJSON( i )
            ;
          each( input, function ( v, i ) {
            var nv, o;
            if ( T.isArray( v ) && i === 0 ){
              each( v, function ( av ) {

                columns.push( (settings.forcePropertyCase === 'lower')
                  ? av.toLowerCase()
                    : (settings.forcePropertyCase === 'upper')
                  ? av.toUpperCase() : av );
              });
              return true;
            }
            else if ( T.isArray( v ) ){
              nv = {};
              each( v, function ( av, ai ) {
                nv[columns[ai]] = av;
              });
              v = nv;

            }
            else if ( T.isObject( v ) && settings.forcePropertyCase ){
              o = {};

              eachin( v, function ( av, ai ) {
                o[(settings.forcePropertyCase === 'lower') ? ai.toLowerCase()
                  : (settings.forcePropertyCase === 'upper')
                  ? ai.toUpperCase() : ai] = v[ai];
              });
              v = o;
            }

            RC++;
            v.___id = 'T' + String( idpad + TC ).slice( -6 ) + 'R' +
              String( idpad + RC ).slice( -6 );
            v.___s = true;
            records.push( v.___id );
            if ( settings.template ){
              v = T.mergeObj( settings.template, v );
            }
            TOb.push( v );

            ID[v.___id] = TOb.length - 1;
            if ( settings.onInsert &&
              (runEvent || TAFFY.isUndefined( runEvent )) )
            {
              settings.onInsert.call( v );
            }
            DBI.dm( new Date() );
          });
          return root( records );
        },
        sort         : function ( o ) {
          // ****************************************
          // *
          // * Purpose: Change the sort order of the DB itself and reset the ID bucket
          // **************************************** 
          TOb = orderByCol( TOb, o.split( ',' ) );
          ID = {};
          each( TOb, function ( r, i ) {
            ID[r.___id] = i;
          });
          DBI.dm( new Date() );
          return true;
        },
        update       : function ( id, changes, runEvent ) {
          // ****************************************
          // *
          // * Takes: the ID of record being changed and the changes
          // * Purpose: Update a record and change some or all values, call the on update method
          // ****************************************

          var nc = {}, or, nr, tc, hasChange;
          if ( settings.forcePropertyCase ){
            eachin( changes, function ( v, p ) {
              nc[(settings.forcePropertyCase === 'lower') ? p.toLowerCase()
                : (settings.forcePropertyCase === 'upper') ? p.toUpperCase()
                : p] = v;
            });
            changes = nc;
          }

          or = TOb[ID[id]];
          nr = T.mergeObj( or, changes );

          tc = {};
          hasChange = false;
          eachin( nr, function ( v, i ) {
            if ( TAFFY.isUndefined( or[i] ) || or[i] !== v ){
              tc[i] = v;
              hasChange = true;
            }
          });
          if ( hasChange ){
            if ( settings.onUpdate &&
              (runEvent || TAFFY.isUndefined( runEvent )) )
            {
              settings.onUpdate.call( nr, TOb[ID[id]], tc );
            }
            TOb[ID[id]] = nr;
            DBI.dm( new Date() );
          }
        },
        remove       : function ( id ) {
          // ****************************************
          // *
          // * Takes: the ID of record to be removed
          // * Purpose: remove a record, changes its ___s value to false
          // **************************************** 
          TOb[ID[id]].___s = false;
        },
        removeCommit : function ( runEvent ) {
          var x;
          // ****************************************
          // *
          // * 
          // * Purpose: loop over all records and remove records with ___s = false, call onRemove event, clear ID
          // ****************************************
          for ( x = TOb.length - 1; x > -1; x-- ){

            if ( !TOb[x].___s ){
              if ( settings.onRemove &&
                (runEvent || TAFFY.isUndefined( runEvent )) )
              {
                settings.onRemove.call( TOb[x] );
              }
              ID[TOb[x].___id] = undefined;
              TOb.splice( x, 1 );
            }
          }
          ID = {};
          each( TOb, function ( r, i ) {
            ID[r.___id] = i;
          });
          DBI.dm( new Date() );
        },
        query : function ( context ) {
          // ****************************************
          // *
          // * Takes: the context object for a query and either returns a cache result or a new query result
          // **************************************** 
          var returnq, cid, results, indexed, limitq, ni;

          if ( settings.cacheSize ) {
            cid = '';
            each( context.filterRaw, function ( r ) {
              if ( T.isFunction( r ) ){
                cid = 'nocache';
                return TAFFY.EXIT;
              }
            });
            if ( cid === '' ){
              cid = makeCid( T.mergeObj( context,
                {q : false, run : false, sort : false} ) );
            }
          }
          // Run a new query if there are no results or the run date has been cleared
          if ( !context.results || !context.run ||
            (context.run && DBI.dm() > context.run) )
          {
            results = [];

            // check Cache

            if ( settings.cacheSize && Cache[cid] ){

              Cache[cid].i = CacheCount++;
              return Cache[cid].results;
            }
            else {
              // if no filter, return DB
              if ( context.q.length === 0 && context.index.length === 0 ){
                each( TOb, function ( r ) {
                  results.push( r );
                });
                returnq = results;
              }
              else {
                // use indexes

                indexed = runIndexes( context.index );

                // run filters
                each( indexed, function ( r ) {
                  // Run filter to see if record matches query
                  if ( context.q.length === 0 || runFilters( r, context.q ) ){
                    results.push( r );
                  }
                });

                returnq = results;
              }
            }


          }
          else {
            // If query exists and run has not been cleared return the cache results
            returnq = context.results;
          }
          // If a custom order array exists and the run has been clear or the sort has been cleared
          if ( context.order.length > 0 && (!context.run || !context.sort) ){
            // order the results
            returnq = orderByCol( returnq, context.order );
          }

          // If a limit on the number of results exists and it is less than the returned results, limit results
          if ( returnq.length &&
            ((context.limit && context.limit < returnq.length) ||
              context.start)
          ) {
            limitq = [];
            each( returnq, function ( r, i ) {
              if ( !context.start ||
                (context.start && (i + 1) >= context.start) )
              {
                if ( context.limit ){
                  ni = (context.start) ? (i + 1) - context.start : i;
                  if ( ni < context.limit ){
                    limitq.push( r );
                  }
                  else if ( ni > context.limit ){
                    return TAFFY.EXIT;
                  }
                }
                else {
                  limitq.push( r );
                }
              }
            });
            returnq = limitq;
          }

          // update cache
          if ( settings.cacheSize && cid !== 'nocache' ){
            CacheClear++;

            setTimeout( function () {
              var bCounter, nc;
              if ( CacheClear >= settings.cacheSize * 2 ){
                CacheClear = 0;
                bCounter = CacheCount - settings.cacheSize;
                nc = {};
                eachin( function ( r, k ) {
                  if ( r.i >= bCounter ){
                    nc[k] = r;
                  }
                });
                Cache = nc;
              }
            }, 0 );

            Cache[cid] = { i : CacheCount++, results : returnq };
          }
          return returnq;
        }
      };


      root = function () {
        var iAPI, context;
        // ****************************************
        // *
        // * The root function that gets returned when a new DB is created
        // * Takes: unlimited filter arguments and creates filters to be run when a query is called
        // **************************************** 
        // ****************************************
        // *
        // * iAPI is the the method collection valiable when a query has been started by calling dbname
        // * Certain methods are or are not avaliable once you have started a query such as insert -- you can only insert into root
        // ****************************************
        iAPI = TAFFY.mergeObj( TAFFY.mergeObj( API, { insert : undefined } ),
          { getDBI  : function () { return DBI; },
            getroot : function ( c ) { return root.call( c ); },
          context : function ( n ) {
            // ****************************************
            // *
            // * The context contains all the information to manage a query including filters, limits, and sorts
            // **************************************** 
            if ( n ){
              context = TAFFY.mergeObj( context,
                n.hasOwnProperty('results')
                  ? TAFFY.mergeObj( n, { run : new Date(), sort: new Date() })
                  : n
              );
            }
            return context;
          },
          extend  : undefined
        });

        context = (this && this.q) ? this : {
          limit     : false,
          start     : false,
          q         : [],
          filterRaw : [],
          index     : [],
          order     : [],
          results   : false,
          run       : null,
          sort      : null,
          settings  : settings
        };
        // ****************************************
        // *
        // * Call the query method to setup a new query
        // **************************************** 
        each( arguments, function ( f ) {

          if ( isIndexable( f ) ){
            context.index.push( f );
          }
          else {
            context.q.push( returnFilter( f ) );
          }
          context.filterRaw.push( f );
        });


        return iAPI;
      };

      // ****************************************
      // *
      // * If new records have been passed on creation of the DB either as JSON or as an array/object, insert them
      // **************************************** 
      TC++;
      if ( d ){
        DBI.insert( d );
      }


      root.insert = DBI.insert;

      root.merge = function ( i, key, runEvent ) {
        var
          search      = {},
          finalSearch = [],
          obj         = {}
          ;

        runEvent    = runEvent || false;
        key         = key      || 'id';

        each( i, function ( o ) {
          var existingObject;
          search[key] = o[key];
          finalSearch.push( o[key] );
          existingObject = root( search ).first();
          if ( existingObject ){
            DBI.update( existingObject.___id, o, runEvent );
          }
          else {
            DBI.insert( o, runEvent );
          }
        });

        obj[key] = finalSearch;
        return root( obj );
      };

      root.TAFFY = true;
      root.sort = DBI.sort;
      // ****************************************
      // *
      // * These are the methods that can be accessed on off the root DB function. Example dbname.insert;
      // **************************************** 
      root.settings = function ( n ) {
        // ****************************************
        // *
        // * Getting and setting for this DB's settings/events
        // **************************************** 
        if ( n ){
          settings = TAFFY.mergeObj( settings, n );
          if ( n.template ){

            root().update( n.template );
          }
        }
        return settings;
      };

      // ****************************************
      // *
      // * These are the methods that can be accessed on off the root DB function. Example dbname.insert;
      // **************************************** 
      root.store = function ( n ) {
        // ****************************************
        // *
        // * Setup localstorage for this DB on a given name
        // * Pull data into the DB as needed
        // **************************************** 
        var r = false, i;
        if ( localStorage ){
          if ( n ){
            i = localStorage.getItem( 'taffy_' + n );
            if ( i && i.length > 0 ){
              root.insert( i );
              r = true;
            }
            if ( TOb.length > 0 ){
              setTimeout( function () {
                localStorage.setItem( 'taffy_' + settings.storageName,
                  JSON.stringify( TOb ) );
              });
            }
          }
          root.settings( {storageName : n} );
        }
        return root;
      };

      // ****************************************
      // *
      // * Return root on DB creation and start having fun
      // **************************************** 
      return root;
    };
    // ****************************************
    // *
    // * Sets the global TAFFY object
    // **************************************** 
    TAFFY = T;


    // ****************************************
    // *
    // * Create public each method
    // *
    // ****************************************   
    T.each = each;

    // ****************************************
    // *
    // * Create public eachin method
    // *
    // ****************************************   
    T.eachin = eachin;
    // ****************************************
    // *
    // * Create public extend method
    // * Add a custom method to the API
    // *
    // ****************************************   
    T.extend = API.extend;


    // ****************************************
    // *
    // * Creates TAFFY.EXIT value that can be returned to stop an each loop
    // *
    // ****************************************  
    TAFFY.EXIT = 'TAFFYEXIT';

    // ****************************************
    // *
    // * Create public utility mergeObj method
    // * Return a new object where items from obj2
    // * have replaced or been added to the items in
    // * obj1
    // * Purpose: Used to combine objs
    // *
    // ****************************************   
    TAFFY.mergeObj = function ( ob1, ob2 ) {
      var c = {};
      eachin( ob1, function ( v, n ) { c[n] = ob1[n]; });
      eachin( ob2, function ( v, n ) { c[n] = ob2[n]; });
      return c;
    };


    // ****************************************
    // *
    // * Create public utility has method
    // * Returns true if a complex object, array
    // * or taffy collection contains the material
    // * provided in the second argument
    // * Purpose: Used to comare objects
    // *
    // ****************************************
    TAFFY.has = function ( var1, var2 ) {

      var re = false, n;

      if ( (var1.TAFFY) ){
        re = var1( var2 );
        if ( re.length > 0 ){
          return true;
        }
        else {
          return false;
        }
      }
      else {

        switch ( T.typeOf( var1 ) ){
          case 'object':
            if ( T.isObject( var2 ) ){
              eachin( var2, function ( v, n ) {
                if ( re === true && !T.isUndefined( var1[n] ) &&
                  var1.hasOwnProperty( n ) )
                {
                  re = T.has( var1[n], var2[n] );
                }
                else {
                  re = false;
                  return TAFFY.EXIT;
                }
              });
            }
            else if ( T.isArray( var2 ) ){
              each( var2, function ( v, n ) {
                re = T.has( var1, var2[n] );
                if ( re ){
                  return TAFFY.EXIT;
                }
              });
            }
            else if ( T.isString( var2 ) ){
              if ( !TAFFY.isUndefined( var1[var2] ) ){
                return true;
              }
              else {
                return false;
              }
            }
            return re;
          case 'array':
            if ( T.isObject( var2 ) ){
              each( var1, function ( v, i ) {
                re = T.has( var1[i], var2 );
                if ( re === true ){
                  return TAFFY.EXIT;
                }
              });
            }
            else if ( T.isArray( var2 ) ){
              each( var2, function ( v2, i2 ) {
                each( var1, function ( v1, i1 ) {
                  re = T.has( var1[i1], var2[i2] );
                  if ( re === true ){
                    return TAFFY.EXIT;
                  }
                });
                if ( re === true ){
                  return TAFFY.EXIT;
                }
              });
            }
            else if ( T.isString( var2 ) || T.isNumber( var2 ) ){
             re = false;
              for ( n = 0; n < var1.length; n++ ){
                re = T.has( var1[n], var2 );
                if ( re ){
                  return true;
                }
              }
            }
            return re;
          case 'string':
            if ( T.isString( var2 ) && var2 === var1 ){
              return true;
            }
            break;
          default:
            if ( T.typeOf( var1 ) === T.typeOf( var2 ) && var1 === var2 ){
              return true;
            }
            break;
        }
      }
      return false;
    };

    // ****************************************
    // *
    // * Create public utility hasAll method
    // * Returns true if a complex object, array
    // * or taffy collection contains the material
    // * provided in the call - for arrays it must
    // * contain all the material in each array item
    // * Purpose: Used to comare objects
    // *
    // ****************************************
    TAFFY.hasAll = function ( var1, var2 ) {

      var T = TAFFY, ar;
      if ( T.isArray( var2 ) ){
        ar = true;
        each( var2, function ( v ) {
          ar = T.has( var1, v );
          if ( ar === false ){
            return TAFFY.EXIT;
          }
        });
        return ar;
      }
      else {
        return T.has( var1, var2 );
      }
    };


    // ****************************************
    // *
    // * typeOf Fixed in JavaScript as public utility
    // *
    // ****************************************
    TAFFY.typeOf = function ( v ) {
      var s = typeof v;
      if ( s === 'object' ){
        if ( v ){
          if ( typeof v.length === 'number' &&
            !(v.propertyIsEnumerable( 'length' )) )
          {
            s = 'array';
          }
        }
        else {
          s = 'null';
        }
      }
      return s;
    };

    // ****************************************
    // *
    // * Create public utility getObjectKeys method
    // * Returns an array of an objects keys
    // * Purpose: Used to get the keys for an object
    // *
    // ****************************************   
    TAFFY.getObjectKeys = function ( ob ) {
      var kA = [];
      eachin( ob, function ( n, h ) {
        kA.push( h );
      });
      kA.sort();
      return kA;
    };

    // ****************************************
    // *
    // * Create public utility isSameArray
    // * Returns an array of an objects keys
    // * Purpose: Used to get the keys for an object
    // *
    // ****************************************   
    TAFFY.isSameArray = function ( ar1, ar2 ) {
      return (TAFFY.isArray( ar1 ) && TAFFY.isArray( ar2 ) &&
        ar1.join( ',' ) === ar2.join( ',' )) ? true : false;
    };

    // ****************************************
    // *
    // * Create public utility isSameObject method
    // * Returns true if objects contain the same
    // * material or false if they do not
    // * Purpose: Used to comare objects
    // *
    // ****************************************   
    TAFFY.isSameObject = function ( ob1, ob2 ) {
      var T = TAFFY, rv = true;

      if ( T.isObject( ob1 ) && T.isObject( ob2 ) ){
        if ( T.isSameArray( T.getObjectKeys( ob1 ),
          T.getObjectKeys( ob2 ) ) )
        {
          eachin( ob1, function ( v, n ) {
            if ( ! ( (T.isObject( ob1[n] ) && T.isObject( ob2[n] ) &&
              T.isSameObject( ob1[n], ob2[n] )) ||
              (T.isArray( ob1[n] ) && T.isArray( ob2[n] ) &&
                T.isSameArray( ob1[n], ob2[n] )) || (ob1[n] === ob2[n]) )
            ) {
              rv = false;
              return TAFFY.EXIT;
            }
          });
        }
        else {
          rv = false;
        }
      }
      else {
        rv = false;
      }
      return rv;
    };

    // ****************************************
    // *
    // * Create public utility is[DataType] methods
    // * Return true if obj is datatype, false otherwise
    // * Purpose: Used to determine if arguments are of certain data type
    // *
    // * mmikowski 2012-08-06 refactored to make much less "magical":
    // *   fewer closures and passes jslint
    // *
    // ****************************************

    typeList = [
      'String',  'Number', 'Object',   'Array',
      'Boolean', 'Null',   'Function', 'Undefined'
    ];
  
    makeTest = function ( thisKey ) {
      return function ( data ) {
        return TAFFY.typeOf( data ) === thisKey.toLowerCase() ? true : false;
      };
    };
  
    for ( idx = 0; idx < typeList.length; idx++ ){
      typeKey = typeList[idx];
      TAFFY['is' + typeKey] = makeTest( typeKey );
    }
  }
}());

if ( typeof(exports) === 'object' ){
  exports.taffy = TAFFY;
}


},{}],"/home/jvwong/Projects/shellac/shellac.no-ip.ca/source/shellac/static/shellac/js/src/audio.js":[function(require,module,exports){
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

    onCategoryChange,
    onClickPlayer,
    makeSound,
    togglePlayer,

    PubSub = util.PubSub;

    //---------------- END MODULE SCOPE VARIABLES --------------

   //--------------------- BEGIN MODULE SCOPE METHODS --------------------

    setJqueryMap = function($progress, $description){
        jqueryMap.$progress  = $progress;
        jqueryMap.$description  = $description;
        jqueryMap.$progress_bar = jqueryMap.$progress.find('.progress-bar');
    };

    togglePlayer = function(){
        if(stateMap.audio.paused){
            //console.log("Paused; Resume play: %s", stateMap.url);
            stateMap.audio.resume();

        }else if(stateMap.audio.playState === 0){ //stopped or uninitialized
            //console.log("Stopped; Start play: %s", stateMap.url);
            stateMap.audio.play();
        }else if(stateMap.audio.playState === 1){ //playing or buffering
            //console.log("Playing; Pause : %s", stateMap.url);
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
                $description,
                $progress,
                $progress_bar,
                pplayed,
                sound;

            //tack on the media tag
            murl = '/media/' + url;
            //get the span.media-url
            $player = $('.media.clip').find("[data-clip-url='" + murl + "']");
            //get the sound and check if it was created
            sound = soundManager.getSoundById(murl);
            if(sound){

                //inject the progress bar and update the state
                $progress = $player.find('.media-progress');
                $description = $player.find('.media-description');
                $progress.html(configMap.progress_html);
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
                    setJqueryMap($progress, $description);
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
            html5PollingInterval: 50, // increased framerate for whileplaying() etc.
            flashVersion: 9,
            useHighPerformance: true,
            url: 'http://www.hiding-my-file/Soundmanager2Files/soundmanager2_flash9.swf/',
            onready: function() {
                configMap.isSupported = soundManager.ok();
            },
            ontimeout: function() {
                console.log("SoundManager failed to load");
            }
        });

        PubSub.on("shellac-categorychange", onCategoryChange );
    };

    // Begin private method /makeSound/
    // Example   : makeSound( );
    // Purpose   :
    //   Sets up the Audio API context or reports errors
    // Arguments : none
    // Action    : searches and adds the correct AudioContext object to the global window
    // Returns   : none
    // Throws    : none
    makeSound = function(url, autoPlay){
        var sound;
        sound = soundManager.createSound({
            id: url,
            url: url,
            autoPlay: autoPlay,
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
            onplay: function(){
                jqueryMap.$description.toggleClass("playing");
                jqueryMap.$description.toggleClass("played");
            },
            onpause: function(){
                jqueryMap.$description.toggleClass("playing");
            },
            onresume: function(){
                jqueryMap.$description.toggleClass("playing");
            },
            onstop: function () {
                jqueryMap.$description.toggleClass("playing");
                //soundManager._writeDebug('The sound ' + this.id + ' stopped.');
            },
            onfinish: function () {
                jqueryMap.$description.toggleClass("playing");
                //soundManager._writeDebug('The sound ' + this.id + ' finished playing.');
            }
        });

        return sound;

    };

    //--------------------- END MODULE SCOPE METHODS --------------------

    //------------------- BEGIN PUBLIC METHODS -------------------
    onClickPlayer = function(url, $progress, $description){

        console.log(url);
        console.log($progress);

        // *** CASE 0
        // State: Clip selected does was not created yet
        // Action: Create the clip
        if(!soundManager.getSoundById(url)) {

            // Case 0.a: No clip is currently playing
                // do nothing
            // Case 0.b: Another Clip exists and is still playing / buffering
            if (stateMap.audio && stateMap.audio.playState === 1){
                //pause the previous clip
                stateMap.audio.pause();
            }

            stateMap.url = url;
            setJqueryMap($progress, $description);

            //Create the sound, assign it to stateMap, and autoplay
            stateMap.audio = makeSound(stateMap.url, true);
        } else {

            // *** Case 1
            // State: Clip selected indeed exists; stateMap.audio then must exist
            // Action: Check if it is the same clip from before
            var sound = soundManager.getSoundById(url);

            // Case 1a: this is the same clip
            // In this case audio, url, and $player are identical so simply toggle the playing state
            if(stateMap.audio.id !== sound.id){
                // Case 1b: this is a different clip
                // Pause previously playing clip
                stateMap.audio.pause();

                //update the stateMap to reflect the new object
                stateMap.audio = sound;
                stateMap.url = sound.id;
                setJqueryMap($progress, $description);
            }

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


},{"../lib/soundmanager2/script/soundmanager2.js":"/home/jvwong/Projects/shellac/shellac.no-ip.ca/source/shellac/static/shellac/js/lib/soundmanager2/script/soundmanager2.js","./util.js":"/home/jvwong/Projects/shellac/shellac.no-ip.ca/source/shellac/static/shellac/js/src/util.js"}],"/home/jvwong/Projects/shellac/shellac.no-ip.ca/source/shellac/static/shellac/js/src/main.js":[function(require,module,exports){
/*
 * main.js
 * Entry point for shellac app
*/
/* global $, document, STATIC_URL, MEDIA_URL */
'use strict';
$( document ).ready(function() {
    var shellac = require('./shellac.js');
    shellac.initModule($("#shellac-app"), STATIC_URL, MEDIA_URL, username);
});


},{"./shellac.js":"/home/jvwong/Projects/shellac/shellac.no-ip.ca/source/shellac/static/shellac/js/src/shellac.js"}],"/home/jvwong/Projects/shellac/shellac.no-ip.ca/source/shellac/static/shellac/js/src/shellac.js":[function(require,module,exports){
/*
 * shellac.js
 * Root namespace module
*/
/* global $, window, AudioContext, XMLHttpRequest */
'use strict';

var shellac = (function () {

    //---------------- BEGIN MODULE DEPENDENCIES --------------
    var moment = require('moment'),
        TAFFY = require('taffydb').taffy,
        audio = require('./audio.js'),
        util = require('./util.js');

    //---------------- END MODULE DEPENDENCIES --------------

    //---------------- BEGIN MODULE SCOPE VARIABLES --------------
    var
    initModule,

    configMap = {
        main_html: String() +
            '<div class="shellac-app-container">' +

                '<div class="col-sm-3 col-md-2 shellac-app sidebar">' +
                    '<div class="panel-group" id="accordion">' +
                        '<p class="text-right"><a href="#" id="nav-close">X</a></p>' +
                        '<div class="panel panel-default">' +
                            '<div class="panel-heading">' +
                                '<a data-toggle="collapse" data-parent="#accordion" href="#collapseCategories">' +
                                    'Categories' +
                                '</a>' +
                            '</div>' +
                            '<div id="collapseCategories" class="panel-collapse collapse">' +
                                '<div class="panel-body">' +
                                    '<div class="shellac-app nav nav-sidebar list-group"></div>' +
                                '</div>' +
                            '</div>' +
                        '</div>' +
                        '<div class="panel panel-default">' +
                            '<div class="panel-heading">' +
                                '<a data-toggle="collapse" data-parent="#accordion" href="#collapsePeople">' +
                                    'People' +
                                '</a>' +
                            '</div>' +
                            '<div id="collapsePeople" class="panel-collapse collapse">' +
                                '<div class="panel-body">' +
                                    '//Person List TODO' +
                                '</div>' +
                            '</div>' +
                        '</div>' +
                    '</div>' +
                '</div>' +

                '<div class="shellac-app clip content"></div>' +
            '</div>',


        offcanvas_html: String() +
            '<div class="navbar-header pull-right">' +
                '<a id="nav-expander" class="nav-expander fixed">' +
                'MENU &nbsp;<i class="fa fa-bars fa-lg white"></i>' +
                '</a>' +
            '</div>',

        truncatemax: 25
    },

    stateMap = {
        $container: undefined,
        username: undefined,

        STATIC_URL: undefined,
        MEDIA_URL: undefined,

        categories: undefined,
        category_db: TAFFY(),

        clips: undefined,
        clip_db: TAFFY(),

        isPlaying: false
    },

    jqueryMap = {},
    setJqueryMap,

    urlParse,

    parseCategoryData, renderCategories, display_categories,
    parseClipData, loadClips, display_clips,

    onClickCategory,

    PubSub = util.PubSub;

    //---------------- END MODULE SCOPE VARIABLES --------------

    //--------------------- BEGIN MODULE SCOPE METHODS --------------------

    setJqueryMap = function(){
        var $outerDiv = stateMap.$container;

        jqueryMap = {
            $outerDiv               : $outerDiv,
            $app_container          : $outerDiv.find('.shellac-app-container'),
            $nav_sidebar            : $outerDiv.find('.shellac-app.sidebar'),
            $nav_sidebar_categories : $outerDiv.find('.shellac-app.sidebar #collapseCategories .shellac-app.nav.nav-sidebar.list-group'),
            $nav_sidebar_people     : $outerDiv.find('.shellac-app.sidebar #collapsePeople .shellac-app.nav.nav-sidebar.list-group'),
            $clip_content           : $outerDiv.find('.shellac-app.clip.content')
        };
    };


    /*
     * method renderCategories: make an api call to gather the Categories in database
     * parameters
     * return
     *   * jsonArray - a list of valid JSON objects representing
     *   serialized Category objects
     **/
    renderCategories = function(){

        var url = '/api/categories/';
        $.ajax({
            url: url
        })
            .done(function(categories){
                stateMap.category_db.insert(parseCategoryData(categories.results));
                stateMap.categories = stateMap.category_db().get();
                PubSub.emit("categoryLoadComplete");
            })
            .fail(function(){
                console.error("Could not load Clip archive");
            })
            .always(function(){

            });
    };


    /*
     * method loadClips: make an api call to gather the Clips in database
     * @param status type of Relationship
     * @param username username of the intended target Person
     * @return jsonArray list of valid JSON objects representing serialized Clip objects
     **/
    loadClips = function(status, username){

        var url = ['/api/clips', status, username, ""].join('/');

        $.ajax({
            url: url
        })
            .done(function(clips){
                //console.log(clips);
                stateMap.clip_db.insert(parseClipData(clips['results']));
                stateMap.clips = stateMap.clip_db().order("id desc").get();
                console.log(stateMap.clips);
                PubSub.emit("clipLoadComplete");
            })
            .fail(function(){
                console.error("Could not load Clip archive");
            })
            .always(function(){

            });
    };

    /**
     * method parseCategoryData: transform any Category fields to javascript-compatible
     * parameters
     *   * raw - a string describing an array of valid JSON
     * return
     *   * jsonArray - a list of valid JSON objects
     */
    parseCategoryData = function(raw){
        var jsonArray;

        jsonArray = raw.map(function(jsonObj){

            try{
                return jsonObj;
            }catch(err){
                console.error(err);
            }
        });
        return jsonArray;
    };

    /**
    * parseClipData: transform any Clip fields to javascript-compatible
    * @param raw a string describing an array of valid JSON
    * @return jsonArray - a list of valid JSON objects
    */
    parseClipData = function(raw){
        var jsonArray;

        jsonArray = raw.map(function(jsonObj){

            try{
                jsonObj.created = moment(jsonObj.created);
                return jsonObj;
            }catch(err){
                console.log(err);
            }
        });
        return jsonArray;
    };

    /*
     * method urlParse: extract the various aspects of the url from a HyperlinkedRelatedField
     * precondition: requires a HyperlinkedRelatedField of the form protocol:host/api/object/pk/
     * parameters
     *   * url - the url of the resource
     * return
     *   * URLobj - an object literal with fields protocol, host, api, object, and pk
     **/
    urlParse = function(url){
        var URL = {},
            u = url || '',
            parts;

        parts = u.split('/');

        try{
            URL.protocol = parts[0];
            URL.host = parts[2].split(':')[0];
            URL.object = parts[4];
            URL.pk = parts[5];

        } catch (e) {
            throw "Improper url format entered";
        }
        return URL;
    };


    //--------------------- END MODULE SCOPE METHODS --------------------


    //--------------------- BEGIN DOM METHODS --------------------



    display_categories = function(){

        var all_anchor = String(),
            items = String(),
            clip_list = [];
        jqueryMap.$nav_sidebar_categories.append(all_anchor);

        stateMap.categories.forEach(function(object){
            items +=
                '<a class="list-group-item nav-sidebar-category" href="#">' + '<span class="badge">' + object.clips.length + '</span>' +
                    '<h5 class="list-group-item-heading" id="' + object.slug + '">' + object.title + '</h5>' +
                '</a>';

            var filtered = object.clips.filter(function(id){
                return clip_list.indexOf(id) === -1;
            });
            clip_list = clip_list.concat(filtered);
        });

        all_anchor +=
            '<a class="list-group-item nav-sidebar-category active" href="#">' + '<span class="badge">' + clip_list.length + '</span>' +
                '<h5 class="list-group-item-heading" id="all">ALL</h5>' +
            '</a>';

        jqueryMap.$nav_sidebar_categories.append(all_anchor, items);

        //register listeners
        $('.list-group-item-heading').on('click', onClickCategory);
    };


    display_clips = function(){

        jqueryMap.$clip_content.html("");
        stateMap.clips.forEach(function(object){

            var clip = String() +
                '<div class="col-xs-6 col-sm-4 col-md-3 col-lg-2 media clip">' +
                    '<div class="ui360">' +

                        //BEGIN $player
                        '<span class="media-url" data-clip-url="' + stateMap.MEDIA_URL + object.audio_file + '">' +
                            '<img class="media-img img-responsive" src="' + stateMap.MEDIA_URL + object.brand + '" alt="' + object.title + '" />' +
                            '<div class="media-description">' +
                                '<span class="media-description-content lead">' + util.truncate(object.title, configMap.truncate_max) + '</span><br/>' +
                                '<span class="media-description-content"><em>' + util.truncate(object.description, configMap.truncate_max) + '</em></span><br/>' +
                                '<span class="media-description-content"><small>' + object.owner + "  -- " + object.created._d.toDateString() + '</small></span><br/>' +
                            '</div>' +
                            '<div class="media-progress"></div>' +
                        '</span>'  +
                        //END $player

                    '</div>' +
                '</div>';

            jqueryMap.$clip_content.append(clip);


        });
        $('.media.clip .media-url').on('click', function(e){
            var url = $(this).attr('data-clip-url'),
                $progress = $(this).find('.media-progress'),
                $description = $(this).find('.media-description');

            audio.onClickPlayer(url, $progress, $description);
        });
    };

    //--------------------- END DOM METHODS ----------------------

    //------------------- BEGIN EVENT HANDLERS -------------------
    // Begin Event handler /onClickCategory/
    // Purpose    : Handles the event for sidebar category selection
    // Arguments  :
    // Settings   : none
    // Returns    :
    // Actions    : Should signal to audio module to update progress bar state for each clip
    //   * binds to category DOM elements and reloads corresponding clips into
    //     stateMap.clips
    onClickCategory = function(event){

        var category_object;

        //empty the clip array
        stateMap.clips = [];

        //refill the empty the clip array
        if(event.target.id === "all"){
            stateMap.clips = stateMap.clip_db().get();

        } else {
            category_object = stateMap.category_db({slug: event.target.id}).first();

            //push in any matching clip id from the url
            stateMap.clips = category_object.clips.map(function(clip_url){
                var URL = urlParse(clip_url);
                return stateMap.clip_db({id: parseInt(URL.pk)}).first();
            });
        }
        display_clips();
        util.PubSub.emit("shellac-categorychange",
            stateMap.clips.map(function(clip){return clip.audio_file;})
        );
    };



    //-------------------- END EVENT HANDLERS --------------------

    //------------------- BEGIN PUBLIC METHODS -------------------
    // initModule //   Populates $container with the shell of the UI
    //   and then configures and initializes feature modules.
    //   The Shell is also responsible for browser-wide issues
    //   Directs this app to offer its capability to the user
    // @param $container A jQuery collection that should represent
    // a single DOM container
    // @param MEDIA_URL Django media url prefix (settings.MEDIA_URL)
    // @param STATIC_URL Django static url prefix (settings.STATIC_URL)
    // @param username account holder username for retrieving clips

    initModule = function( $container, STATIC_URL, MEDIA_URL, username){
        // load HTML and map jQuery collections
        stateMap.$container = $container;
        stateMap.username = username;
        stateMap.$nav_sidebar = $container.parent;
        stateMap.STATIC_URL = STATIC_URL;
        stateMap.MEDIA_URL = MEDIA_URL;

        $container.html( configMap.offcanvas_html );
        $container.append( configMap.main_html );
        setJqueryMap();

         //register pub-sub methods
        PubSub.on("clipLoadComplete", display_clips);
        PubSub.on("categoryLoadComplete", display_categories);

        //load data into in-browser database
        loadClips("following", username);
        renderCategories();

        //Navigation Menu Slider
        $('#nav-expander').on('click',function(e){
            e.preventDefault();
            $('body').toggleClass('nav-expanded');
        });
        $('#nav-close').on('click',function(e){
            e.preventDefault();
            $('body').removeClass('nav-expanded');
        });
        console.log($container);
    };

    return { initModule: initModule };
}());

module.exports = shellac;


},{"./audio.js":"/home/jvwong/Projects/shellac/shellac.no-ip.ca/source/shellac/static/shellac/js/src/audio.js","./util.js":"/home/jvwong/Projects/shellac/shellac.no-ip.ca/source/shellac/static/shellac/js/src/util.js","moment":"/home/jvwong/Projects/shellac/shellac.no-ip.ca/source/shellac/static/shellac/js/node_modules/moment/moment.js","taffydb":"/home/jvwong/Projects/shellac/shellac.no-ip.ca/source/shellac/static/shellac/js/node_modules/taffydb/taffy.js"}],"/home/jvwong/Projects/shellac/shellac.no-ip.ca/source/shellac/static/shellac/js/src/util.js":[function(require,module,exports){
/*
 * util.js
 * Utilities for the Audio app
*/
/* global */
'use strict';

var util = (function () {

    var PubSub, truncate;

    //---------------- BEGIN MODULE DEPENDENCIES --------------

    //---------------- END MODULE DEPENDENCIES --------------

    //-------------------- END EVENT HANDLERS --------------------

    //------------------- BEGIN PUBLIC METHODS -------------------
    // Begin Public method /PubSub/
    // Example   : PubSub.on('bark', getDog ); PubSub.emit('bark');
    // Purpose   :
    //   Subscribe and publish events
    // Arguments :
    // Action    : The user can subscribe to events with on('<event name>', callback)
    // and listen to events published with emit('<event name>')
    // Returns   : none
    // Throws    : none
    PubSub = {
        handlers: {},

        on : function(eventType, handler) {
            if (!(eventType in this.handlers)) {
                this.handlers[eventType] = [];
            }
            //push handler into array -- "eventType": [handler]
            this.handlers[eventType].push(handler);
            return this;
        },

        emit : function(eventType) {
            var handlerArgs = Array.prototype.slice.call(arguments, 1);
            for (var i = 0; i < this.handlers[eventType].length; i++) {
                this.handlers[eventType][i].apply(this, handlerArgs);
            }
            return this;
        }

    };

    // Begin Public method /truncate/
    // Example   : truncate(string, maxchar)
    // Purpose   :
    //   Truncate a string and append "..." to the remaining
    // Arguments :
    //  * string - the original string
    //  * maxchar - the max number of chars to show
    // Returns   : the truncated string
    // Throws    : none
    truncate = function(string, maxchar){
        var str = string || '';

        var truncated = str.slice(0, maxchar);
        if(str.length > maxchar){
            truncated += "...";
        }
        return truncated;
    };

    return {
        PubSub: PubSub,
        truncate: truncate
    };
}());

module.exports = util;


},{}]},{},["/home/jvwong/Projects/shellac/shellac.no-ip.ca/source/shellac/static/shellac/js/src/main.js"])
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi91c3IvbG9jYWwvbGliL25vZGVfbW9kdWxlcy93YXRjaGlmeS9ub2RlX21vZHVsZXMvYnJvd3NlcmlmeS9ub2RlX21vZHVsZXMvYnJvd3Nlci1wYWNrL19wcmVsdWRlLmpzIiwiL2hvbWUvanZ3b25nL1Byb2plY3RzL3NoZWxsYWMvc2hlbGxhYy5uby1pcC5jYS9zb3VyY2Uvc2hlbGxhYy9zdGF0aWMvc2hlbGxhYy9qcy9saWIvc291bmRtYW5hZ2VyMi9zY3JpcHQvc291bmRtYW5hZ2VyMi5qcyIsIi9ob21lL2p2d29uZy9Qcm9qZWN0cy9zaGVsbGFjL3NoZWxsYWMubm8taXAuY2Evc291cmNlL3NoZWxsYWMvc3RhdGljL3NoZWxsYWMvanMvbm9kZV9tb2R1bGVzL21vbWVudC9tb21lbnQuanMiLCIvaG9tZS9qdndvbmcvUHJvamVjdHMvc2hlbGxhYy9zaGVsbGFjLm5vLWlwLmNhL3NvdXJjZS9zaGVsbGFjL3N0YXRpYy9zaGVsbGFjL2pzL25vZGVfbW9kdWxlcy90YWZmeWRiL3RhZmZ5LmpzIiwiL2hvbWUvanZ3b25nL1Byb2plY3RzL3NoZWxsYWMvc2hlbGxhYy5uby1pcC5jYS9zb3VyY2Uvc2hlbGxhYy9zdGF0aWMvc2hlbGxhYy9qcy9zcmMvYXVkaW8uanMiLCIvaG9tZS9qdndvbmcvUHJvamVjdHMvc2hlbGxhYy9zaGVsbGFjLm5vLWlwLmNhL3NvdXJjZS9zaGVsbGFjL3N0YXRpYy9zaGVsbGFjL2pzL3NyYy9tYWluLmpzIiwiL2hvbWUvanZ3b25nL1Byb2plY3RzL3NoZWxsYWMvc2hlbGxhYy5uby1pcC5jYS9zb3VyY2Uvc2hlbGxhYy9zdGF0aWMvc2hlbGxhYy9qcy9zcmMvc2hlbGxhYy5qcyIsIi9ob21lL2p2d29uZy9Qcm9qZWN0cy9zaGVsbGFjL3NoZWxsYWMubm8taXAuY2Evc291cmNlL3NoZWxsYWMvc3RhdGljL3NoZWxsYWMvanMvc3JjL3V0aWwuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUNBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN4N0xBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMxeUZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDaitEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM5UUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ1hBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDblpBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dmFyIGY9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKTt0aHJvdyBmLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsZn12YXIgbD1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwobC5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxsLGwuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwiLyoqIEBsaWNlbnNlXHJcbiAqXHJcbiAqIFNvdW5kTWFuYWdlciAyOiBKYXZhU2NyaXB0IFNvdW5kIGZvciB0aGUgV2ViXHJcbiAqIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cclxuICogaHR0cDovL3NjaGlsbG1hbmlhLmNvbS9wcm9qZWN0cy9zb3VuZG1hbmFnZXIyL1xyXG4gKlxyXG4gKiBDb3B5cmlnaHQgKGMpIDIwMDcsIFNjb3R0IFNjaGlsbGVyLiBBbGwgcmlnaHRzIHJlc2VydmVkLlxyXG4gKiBDb2RlIHByb3ZpZGVkIHVuZGVyIHRoZSBCU0QgTGljZW5zZTpcclxuICogaHR0cDovL3NjaGlsbG1hbmlhLmNvbS9wcm9qZWN0cy9zb3VuZG1hbmFnZXIyL2xpY2Vuc2UudHh0XHJcbiAqXHJcbiAqIFYyLjk3YS4yMDE0MDkwMVxyXG4gKi9cclxuXHJcbi8qZ2xvYmFsIHdpbmRvdywgU00yX0RFRkVSLCBzbTJEZWJ1Z2dlciwgY29uc29sZSwgZG9jdW1lbnQsIG5hdmlnYXRvciwgc2V0VGltZW91dCwgc2V0SW50ZXJ2YWwsIGNsZWFySW50ZXJ2YWwsIEF1ZGlvLCBvcGVyYSwgbW9kdWxlLCBkZWZpbmUgKi9cclxuLypqc2xpbnQgcmVnZXhwOiB0cnVlLCBzbG9wcHk6IHRydWUsIHdoaXRlOiB0cnVlLCBub21lbjogdHJ1ZSwgcGx1c3BsdXM6IHRydWUsIHRvZG86IHRydWUgKi9cclxuXHJcbi8qKlxyXG4gKiBBYm91dCB0aGlzIGZpbGVcclxuICogLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxyXG4gKiBUaGlzIGlzIHRoZSBmdWxseS1jb21tZW50ZWQgc291cmNlIHZlcnNpb24gb2YgdGhlIFNvdW5kTWFuYWdlciAyIEFQSSxcclxuICogcmVjb21tZW5kZWQgZm9yIHVzZSBkdXJpbmcgZGV2ZWxvcG1lbnQgYW5kIHRlc3RpbmcuXHJcbiAqXHJcbiAqIFNlZSBzb3VuZG1hbmFnZXIyLW5vZGVidWctanNtaW4uanMgZm9yIGFuIG9wdGltaXplZCBidWlsZCAofjExS0Igd2l0aCBnemlwLilcclxuICogaHR0cDovL3NjaGlsbG1hbmlhLmNvbS9wcm9qZWN0cy9zb3VuZG1hbmFnZXIyL2RvYy9nZXRzdGFydGVkLyNiYXNpYy1pbmNsdXNpb25cclxuICogQWx0ZXJuYXRlbHksIHNlcnZlIHRoaXMgZmlsZSB3aXRoIGd6aXAgZm9yIDc1JSBjb21wcmVzc2lvbiBzYXZpbmdzICh+MzBLQiBvdmVyIEhUVFAuKVxyXG4gKlxyXG4gKiBZb3UgbWF5IG5vdGljZSA8ZD4gYW5kIDwvZD4gY29tbWVudHMgaW4gdGhpcyBzb3VyY2U7IHRoZXNlIGFyZSBkZWxpbWl0ZXJzIGZvclxyXG4gKiBkZWJ1ZyBibG9ja3Mgd2hpY2ggYXJlIHJlbW92ZWQgaW4gdGhlIC1ub2RlYnVnIGJ1aWxkcywgZnVydGhlciBvcHRpbWl6aW5nIGNvZGUgc2l6ZS5cclxuICpcclxuICogQWxzbywgYXMgeW91IG1heSBub3RlOiBXaG9hLCByZWxpYWJsZSBjcm9zcy1wbGF0Zm9ybS9kZXZpY2UgYXVkaW8gc3VwcG9ydCBpcyBoYXJkISA7KVxyXG4gKi9cclxuXHJcbihmdW5jdGlvbih3aW5kb3csIF91bmRlZmluZWQpIHtcclxuXHJcblwidXNlIHN0cmljdFwiO1xyXG5cclxuaWYgKCF3aW5kb3cgfHwgIXdpbmRvdy5kb2N1bWVudCkge1xyXG5cclxuICAvLyBEb24ndCBjcm9zcyB0aGUgW2Vudmlyb25tZW50XSBzdHJlYW1zLiBTTTIgZXhwZWN0cyB0byBiZSBydW5uaW5nIGluIGEgYnJvd3Nlciwgbm90IHVuZGVyIG5vZGUuanMgZXRjLlxyXG4gIC8vIEFkZGl0aW9uYWxseSwgaWYgYSBicm93c2VyIHNvbWVob3cgbWFuYWdlcyB0byBmYWlsIHRoaXMgdGVzdCwgYXMgRWdvbiBzYWlkOiBcIkl0IHdvdWxkIGJlIGJhZC5cIlxyXG5cclxuICB0aHJvdyBuZXcgRXJyb3IoJ1NvdW5kTWFuYWdlciByZXF1aXJlcyBhIGJyb3dzZXIgd2l0aCB3aW5kb3cgYW5kIGRvY3VtZW50IG9iamVjdHMuJyk7XHJcblxyXG59XHJcblxyXG52YXIgc291bmRNYW5hZ2VyID0gbnVsbDtcclxuXHJcbi8qKlxyXG4gKiBUaGUgU291bmRNYW5hZ2VyIGNvbnN0cnVjdG9yLlxyXG4gKlxyXG4gKiBAY29uc3RydWN0b3JcclxuICogQHBhcmFtIHtzdHJpbmd9IHNtVVJMIE9wdGlvbmFsOiBQYXRoIHRvIFNXRiBmaWxlc1xyXG4gKiBAcGFyYW0ge3N0cmluZ30gc21JRCBPcHRpb25hbDogVGhlIElEIHRvIHVzZSBmb3IgdGhlIFNXRiBjb250YWluZXIgZWxlbWVudFxyXG4gKiBAdGhpcyB7U291bmRNYW5hZ2VyfVxyXG4gKiBAcmV0dXJuIHtTb3VuZE1hbmFnZXJ9IFRoZSBuZXcgU291bmRNYW5hZ2VyIGluc3RhbmNlXHJcbiAqL1xyXG5cclxuZnVuY3Rpb24gU291bmRNYW5hZ2VyKHNtVVJMLCBzbUlEKSB7XHJcblxyXG4gIC8qKlxyXG4gICAqIHNvdW5kTWFuYWdlciBjb25maWd1cmF0aW9uIG9wdGlvbnMgbGlzdFxyXG4gICAqIGRlZmluZXMgdG9wLWxldmVsIGNvbmZpZ3VyYXRpb24gcHJvcGVydGllcyB0byBiZSBhcHBsaWVkIHRvIHRoZSBzb3VuZE1hbmFnZXIgaW5zdGFuY2UgKGVnLiBzb3VuZE1hbmFnZXIuZmxhc2hWZXJzaW9uKVxyXG4gICAqIHRvIHNldCB0aGVzZSBwcm9wZXJ0aWVzLCB1c2UgdGhlIHNldHVwKCkgbWV0aG9kIC0gZWcuLCBzb3VuZE1hbmFnZXIuc2V0dXAoe3VybDogJy9zd2YvJywgZmxhc2hWZXJzaW9uOiA5fSlcclxuICAgKi9cclxuXHJcbiAgdGhpcy5zZXR1cE9wdGlvbnMgPSB7XHJcblxyXG4gICAgJ3VybCc6IChzbVVSTCB8fCBudWxsKSwgICAgICAgICAgICAgLy8gcGF0aCAoZGlyZWN0b3J5KSB3aGVyZSBTb3VuZE1hbmFnZXIgMiBTV0ZzIGV4aXN0LCBlZy4sIC9wYXRoL3RvL3N3ZnMvXHJcbiAgICAnZmxhc2hWZXJzaW9uJzogOCwgICAgICAgICAgICAgICAgICAvLyBmbGFzaCBidWlsZCB0byB1c2UgKDggb3IgOS4pIFNvbWUgQVBJIGZlYXR1cmVzIHJlcXVpcmUgOS5cclxuICAgICdkZWJ1Z01vZGUnOiB0cnVlLCAgICAgICAgICAgICAgICAgIC8vIGVuYWJsZSBkZWJ1Z2dpbmcgb3V0cHV0IChjb25zb2xlLmxvZygpIHdpdGggSFRNTCBmYWxsYmFjaylcclxuICAgICdkZWJ1Z0ZsYXNoJzogZmFsc2UsICAgICAgICAgICAgICAgIC8vIGVuYWJsZSBkZWJ1Z2dpbmcgb3V0cHV0IGluc2lkZSBTV0YsIHRyb3VibGVzaG9vdCBGbGFzaC9icm93c2VyIGlzc3Vlc1xyXG4gICAgJ3VzZUNvbnNvbGUnOiB0cnVlLCAgICAgICAgICAgICAgICAgLy8gdXNlIGNvbnNvbGUubG9nKCkgaWYgYXZhaWxhYmxlIChvdGhlcndpc2UsIHdyaXRlcyB0byAjc291bmRtYW5hZ2VyLWRlYnVnIGVsZW1lbnQpXHJcbiAgICAnY29uc29sZU9ubHknOiB0cnVlLCAgICAgICAgICAgICAgICAvLyBpZiBjb25zb2xlIGlzIGJlaW5nIHVzZWQsIGRvIG5vdCBjcmVhdGUvd3JpdGUgdG8gI3NvdW5kbWFuYWdlci1kZWJ1Z1xyXG4gICAgJ3dhaXRGb3JXaW5kb3dMb2FkJzogZmFsc2UsICAgICAgICAgLy8gZm9yY2UgU00yIHRvIHdhaXQgZm9yIHdpbmRvdy5vbmxvYWQoKSBiZWZvcmUgdHJ5aW5nIHRvIGNhbGwgc291bmRNYW5hZ2VyLm9ubG9hZCgpXHJcbiAgICAnYmdDb2xvcic6ICcjZmZmZmZmJywgICAgICAgICAgICAgICAvLyBTV0YgYmFja2dyb3VuZCBjb2xvci4gTi9BIHdoZW4gd21vZGUgPSAndHJhbnNwYXJlbnQnXHJcbiAgICAndXNlSGlnaFBlcmZvcm1hbmNlJzogZmFsc2UsICAgICAgICAvLyBwb3NpdGlvbjpmaXhlZCBmbGFzaCBtb3ZpZSBjYW4gaGVscCBpbmNyZWFzZSBqcy9mbGFzaCBzcGVlZCwgbWluaW1pemUgbGFnXHJcbiAgICAnZmxhc2hQb2xsaW5nSW50ZXJ2YWwnOiBudWxsLCAgICAgICAvLyBtc2VjIGFmZmVjdGluZyB3aGlsZXBsYXlpbmcvbG9hZGluZyBjYWxsYmFjayBmcmVxdWVuY3kuIElmIG51bGwsIGRlZmF1bHQgb2YgNTAgbXNlYyBpcyB1c2VkLlxyXG4gICAgJ2h0bWw1UG9sbGluZ0ludGVydmFsJzogbnVsbCwgICAgICAgLy8gbXNlYyBhZmZlY3Rpbmcgd2hpbGVwbGF5aW5nKCkgZm9yIEhUTUw1IGF1ZGlvLCBleGNsdWRpbmcgbW9iaWxlIGRldmljZXMuIElmIG51bGwsIG5hdGl2ZSBIVE1MNSB1cGRhdGUgZXZlbnRzIGFyZSB1c2VkLlxyXG4gICAgJ2ZsYXNoTG9hZFRpbWVvdXQnOiAxMDAwLCAgICAgICAgICAgLy8gbXNlYyB0byB3YWl0IGZvciBmbGFzaCBtb3ZpZSB0byBsb2FkIGJlZm9yZSBmYWlsaW5nICgwID0gaW5maW5pdHkpXHJcbiAgICAnd21vZGUnOiBudWxsLCAgICAgICAgICAgICAgICAgICAgICAvLyBmbGFzaCByZW5kZXJpbmcgbW9kZSAtIG51bGwsICd0cmFuc3BhcmVudCcsIG9yICdvcGFxdWUnIChsYXN0IHR3byBhbGxvdyB6LWluZGV4IHRvIHdvcmspXHJcbiAgICAnYWxsb3dTY3JpcHRBY2Nlc3MnOiAnYWx3YXlzJywgICAgICAvLyBmb3Igc2NyaXB0aW5nIHRoZSBTV0YgKG9iamVjdC9lbWJlZCBwcm9wZXJ0eSksICdhbHdheXMnIG9yICdzYW1lRG9tYWluJ1xyXG4gICAgJ3VzZUZsYXNoQmxvY2snOiBmYWxzZSwgICAgICAgICAgICAgLy8gKnJlcXVpcmVzIGZsYXNoYmxvY2suY3NzLCBzZWUgZGVtb3MqIC0gYWxsb3cgcmVjb3ZlcnkgZnJvbSBmbGFzaCBibG9ja2Vycy4gV2FpdCBpbmRlZmluaXRlbHkgYW5kIGFwcGx5IHRpbWVvdXQgQ1NTIHRvIFNXRiwgaWYgYXBwbGljYWJsZS5cclxuICAgICd1c2VIVE1MNUF1ZGlvJzogdHJ1ZSwgICAgICAgICAgICAgIC8vIHVzZSBIVE1MNSBBdWRpbygpIHdoZXJlIEFQSSBpcyBzdXBwb3J0ZWQgKG1vc3QgU2FmYXJpLCBDaHJvbWUgdmVyc2lvbnMpLCBGaXJlZm94IChubyBNUDMvTVA0LikgSWRlYWxseSwgdHJhbnNwYXJlbnQgdnMuIEZsYXNoIEFQSSB3aGVyZSBwb3NzaWJsZS5cclxuICAgICdodG1sNVRlc3QnOiAvXihwcm9iYWJseXxtYXliZSkkL2ksIC8vIEhUTUw1IEF1ZGlvKCkgZm9ybWF0IHN1cHBvcnQgdGVzdC4gVXNlIC9ecHJvYmFibHkkL2k7IGlmIHlvdSB3YW50IHRvIGJlIG1vcmUgY29uc2VydmF0aXZlLlxyXG4gICAgJ3ByZWZlckZsYXNoJzogZmFsc2UsICAgICAgICAgICAgICAgLy8gb3ZlcnJpZGVzIHVzZUhUTUw1YXVkaW8sIHdpbGwgdXNlIEZsYXNoIGZvciBNUDMvTVA0L0FBQyBpZiBwcmVzZW50LiBQb3RlbnRpYWwgb3B0aW9uIGlmIEhUTUw1IHBsYXliYWNrIHdpdGggdGhlc2UgZm9ybWF0cyBpcyBxdWlya3kuXHJcbiAgICAnbm9TV0ZDYWNoZSc6IGZhbHNlLCAgICAgICAgICAgICAgICAvLyBpZiB0cnVlLCBhcHBlbmRzID90cz17ZGF0ZX0gdG8gYnJlYWsgYWdncmVzc2l2ZSBTV0YgY2FjaGluZy5cclxuICAgICdpZFByZWZpeCc6ICdzb3VuZCcgICAgICAgICAgICAgICAgIC8vIGlmIGFuIGlkIGlzIG5vdCBwcm92aWRlZCB0byBjcmVhdGVTb3VuZCgpLCB0aGlzIHByZWZpeCBpcyB1c2VkIGZvciBnZW5lcmF0ZWQgSURzIC0gJ3NvdW5kMCcsICdzb3VuZDEnIGV0Yy5cclxuXHJcbiAgfTtcclxuXHJcbiAgdGhpcy5kZWZhdWx0T3B0aW9ucyA9IHtcclxuXHJcbiAgICAvKipcclxuICAgICAqIHRoZSBkZWZhdWx0IGNvbmZpZ3VyYXRpb24gZm9yIHNvdW5kIG9iamVjdHMgbWFkZSB3aXRoIGNyZWF0ZVNvdW5kKCkgYW5kIHJlbGF0ZWQgbWV0aG9kc1xyXG4gICAgICogZWcuLCB2b2x1bWUsIGF1dG8tbG9hZCBiZWhhdmlvdXIgYW5kIHNvIGZvcnRoXHJcbiAgICAgKi9cclxuXHJcbiAgICAnYXV0b0xvYWQnOiBmYWxzZSwgICAgICAgIC8vIGVuYWJsZSBhdXRvbWF0aWMgbG9hZGluZyAob3RoZXJ3aXNlIC5sb2FkKCkgd2lsbCBiZSBjYWxsZWQgb24gZGVtYW5kIHdpdGggLnBsYXkoKSwgdGhlIGxhdHRlciBiZWluZyBuaWNlciBvbiBiYW5kd2lkdGggLSBpZiB5b3Ugd2FudCB0byAubG9hZCB5b3Vyc2VsZiwgeW91IGFsc28gY2FuKVxyXG4gICAgJ2F1dG9QbGF5JzogZmFsc2UsICAgICAgICAvLyBlbmFibGUgcGxheWluZyBvZiBmaWxlIGFzIHNvb24gYXMgcG9zc2libGUgKG11Y2ggZmFzdGVyIGlmIFwic3RyZWFtXCIgaXMgdHJ1ZSlcclxuICAgICdmcm9tJzogbnVsbCwgICAgICAgICAgICAgLy8gcG9zaXRpb24gdG8gc3RhcnQgcGxheWJhY2sgd2l0aGluIGEgc291bmQgKG1zZWMpLCBkZWZhdWx0ID0gYmVnaW5uaW5nXHJcbiAgICAnbG9vcHMnOiAxLCAgICAgICAgICAgICAgIC8vIGhvdyBtYW55IHRpbWVzIHRvIHJlcGVhdCB0aGUgc291bmQgKHBvc2l0aW9uIHdpbGwgd3JhcCBhcm91bmQgdG8gMCwgc2V0UG9zaXRpb24oKSB3aWxsIGJyZWFrIG91dCBvZiBsb29wIHdoZW4gPjApXHJcbiAgICAnb25pZDMnOiBudWxsLCAgICAgICAgICAgIC8vIGNhbGxiYWNrIGZ1bmN0aW9uIGZvciBcIklEMyBkYXRhIGlzIGFkZGVkL2F2YWlsYWJsZVwiXHJcbiAgICAnb25sb2FkJzogbnVsbCwgICAgICAgICAgIC8vIGNhbGxiYWNrIGZ1bmN0aW9uIGZvciBcImxvYWQgZmluaXNoZWRcIlxyXG4gICAgJ3doaWxlbG9hZGluZyc6IG51bGwsICAgICAvLyBjYWxsYmFjayBmdW5jdGlvbiBmb3IgXCJkb3dubG9hZCBwcm9ncmVzcyB1cGRhdGVcIiAoWCBvZiBZIGJ5dGVzIHJlY2VpdmVkKVxyXG4gICAgJ29ucGxheSc6IG51bGwsICAgICAgICAgICAvLyBjYWxsYmFjayBmb3IgXCJwbGF5XCIgc3RhcnRcclxuICAgICdvbnBhdXNlJzogbnVsbCwgICAgICAgICAgLy8gY2FsbGJhY2sgZm9yIFwicGF1c2VcIlxyXG4gICAgJ29ucmVzdW1lJzogbnVsbCwgICAgICAgICAvLyBjYWxsYmFjayBmb3IgXCJyZXN1bWVcIiAocGF1c2UgdG9nZ2xlKVxyXG4gICAgJ3doaWxlcGxheWluZyc6IG51bGwsICAgICAvLyBjYWxsYmFjayBkdXJpbmcgcGxheSAocG9zaXRpb24gdXBkYXRlKVxyXG4gICAgJ29ucG9zaXRpb24nOiBudWxsLCAgICAgICAvLyBvYmplY3QgY29udGFpbmluZyB0aW1lcyBhbmQgZnVuY3Rpb24gY2FsbGJhY2tzIGZvciBwb3NpdGlvbnMgb2YgaW50ZXJlc3RcclxuICAgICdvbnN0b3AnOiBudWxsLCAgICAgICAgICAgLy8gY2FsbGJhY2sgZm9yIFwidXNlciBzdG9wXCJcclxuICAgICdvbmZhaWx1cmUnOiBudWxsLCAgICAgICAgLy8gY2FsbGJhY2sgZnVuY3Rpb24gZm9yIHdoZW4gcGxheWluZyBmYWlsc1xyXG4gICAgJ29uZmluaXNoJzogbnVsbCwgICAgICAgICAvLyBjYWxsYmFjayBmdW5jdGlvbiBmb3IgXCJzb3VuZCBmaW5pc2hlZCBwbGF5aW5nXCJcclxuICAgICdtdWx0aVNob3QnOiB0cnVlLCAgICAgICAgLy8gbGV0IHNvdW5kcyBcInJlc3RhcnRcIiBvciBsYXllciBvbiB0b3Agb2YgZWFjaCBvdGhlciB3aGVuIHBsYXllZCBtdWx0aXBsZSB0aW1lcywgcmF0aGVyIHRoYW4gb25lLXNob3Qvb25lIGF0IGEgdGltZVxyXG4gICAgJ211bHRpU2hvdEV2ZW50cyc6IGZhbHNlLCAvLyBmaXJlIG11bHRpcGxlIHNvdW5kIGV2ZW50cyAoY3VycmVudGx5IG9uZmluaXNoKCkgb25seSkgd2hlbiBtdWx0aVNob3QgaXMgZW5hYmxlZFxyXG4gICAgJ3Bvc2l0aW9uJzogbnVsbCwgICAgICAgICAvLyBvZmZzZXQgKG1pbGxpc2Vjb25kcykgdG8gc2VlayB0byB3aXRoaW4gbG9hZGVkIHNvdW5kIGRhdGEuXHJcbiAgICAncGFuJzogMCwgICAgICAgICAgICAgICAgIC8vIFwicGFuXCIgc2V0dGluZ3MsIGxlZnQtdG8tcmlnaHQsIC0xMDAgdG8gMTAwXHJcbiAgICAnc3RyZWFtJzogdHJ1ZSwgICAgICAgICAgIC8vIGFsbG93cyBwbGF5aW5nIGJlZm9yZSBlbnRpcmUgZmlsZSBoYXMgbG9hZGVkIChyZWNvbW1lbmRlZClcclxuICAgICd0byc6IG51bGwsICAgICAgICAgICAgICAgLy8gcG9zaXRpb24gdG8gZW5kIHBsYXliYWNrIHdpdGhpbiBhIHNvdW5kIChtc2VjKSwgZGVmYXVsdCA9IGVuZFxyXG4gICAgJ3R5cGUnOiBudWxsLCAgICAgICAgICAgICAvLyBNSU1FLWxpa2UgaGludCBmb3IgZmlsZSBwYXR0ZXJuIC8gY2FuUGxheSgpIHRlc3RzLCBlZy4gYXVkaW8vbXAzXHJcbiAgICAndXNlUG9saWN5RmlsZSc6IGZhbHNlLCAgIC8vIGVuYWJsZSBjcm9zc2RvbWFpbi54bWwgcmVxdWVzdCBmb3IgYXVkaW8gb24gcmVtb3RlIGRvbWFpbnMgKGZvciBJRDMvd2F2ZWZvcm0gYWNjZXNzKVxyXG4gICAgJ3ZvbHVtZSc6IDEwMCAgICAgICAgICAgICAvLyBzZWxmLWV4cGxhbmF0b3J5LiAwLTEwMCwgdGhlIGxhdHRlciBiZWluZyB0aGUgbWF4LlxyXG5cclxuICB9O1xyXG5cclxuICB0aGlzLmZsYXNoOU9wdGlvbnMgPSB7XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBmbGFzaCA5LW9ubHkgb3B0aW9ucyxcclxuICAgICAqIG1lcmdlZCBpbnRvIGRlZmF1bHRPcHRpb25zIGlmIGZsYXNoIDkgaXMgYmVpbmcgdXNlZFxyXG4gICAgICovXHJcblxyXG4gICAgJ2lzTW92aWVTdGFyJzogbnVsbCwgICAgICAvLyBcIk1vdmllU3RhclwiIE1QRUc0IGF1ZGlvIG1vZGUuIE51bGwgKGRlZmF1bHQpID0gYXV0byBkZXRlY3QgTVA0LCBBQUMgZXRjLiBiYXNlZCBvbiBVUkwuIHRydWUgPSBmb3JjZSBvbiwgaWdub3JlIFVSTFxyXG4gICAgJ3VzZVBlYWtEYXRhJzogZmFsc2UsICAgICAvLyBlbmFibGUgbGVmdC9yaWdodCBjaGFubmVsIHBlYWsgKGxldmVsKSBkYXRhXHJcbiAgICAndXNlV2F2ZWZvcm1EYXRhJzogZmFsc2UsIC8vIGVuYWJsZSBzb3VuZCBzcGVjdHJ1bSAocmF3IHdhdmVmb3JtIGRhdGEpIC0gTk9URTogTWF5IGluY3JlYXNlIENQVSBsb2FkLlxyXG4gICAgJ3VzZUVRRGF0YSc6IGZhbHNlLCAgICAgICAvLyBlbmFibGUgc291bmQgRVEgKGZyZXF1ZW5jeSBzcGVjdHJ1bSBkYXRhKSAtIE5PVEU6IE1heSBpbmNyZWFzZSBDUFUgbG9hZC5cclxuICAgICdvbmJ1ZmZlcmNoYW5nZSc6IG51bGwsICAgLy8gY2FsbGJhY2sgZm9yIFwiaXNCdWZmZXJpbmdcIiBwcm9wZXJ0eSBjaGFuZ2VcclxuICAgICdvbmRhdGFlcnJvcic6IG51bGwgICAgICAgLy8gY2FsbGJhY2sgZm9yIHdhdmVmb3JtL2VxIGRhdGEgYWNjZXNzIGVycm9yIChmbGFzaCBwbGF5aW5nIGF1ZGlvIGluIG90aGVyIHRhYnMvZG9tYWlucylcclxuXHJcbiAgfTtcclxuXHJcbiAgdGhpcy5tb3ZpZVN0YXJPcHRpb25zID0ge1xyXG5cclxuICAgIC8qKlxyXG4gICAgICogZmxhc2ggOS4wcjExNSsgTVBFRzQgYXVkaW8gb3B0aW9ucyxcclxuICAgICAqIG1lcmdlZCBpbnRvIGRlZmF1bHRPcHRpb25zIGlmIGZsYXNoIDkrbW92aWVTdGFyIG1vZGUgaXMgZW5hYmxlZFxyXG4gICAgICovXHJcblxyXG4gICAgJ2J1ZmZlclRpbWUnOiAzLCAgICAgICAgICAvLyBzZWNvbmRzIG9mIGRhdGEgdG8gYnVmZmVyIGJlZm9yZSBwbGF5YmFjayBiZWdpbnMgKG51bGwgPSBmbGFzaCBkZWZhdWx0IG9mIDAuMSBzZWNvbmRzIC0gaWYgQUFDIHBsYXliYWNrIGlzIGdhcHB5LCB0cnkgaW5jcmVhc2luZy4pXHJcbiAgICAnc2VydmVyVVJMJzogbnVsbCwgICAgICAgIC8vIHJ0bXA6IEZNUyBvciBGTUlTIHNlcnZlciB0byBjb25uZWN0IHRvLCByZXF1aXJlZCB3aGVuIHJlcXVlc3RpbmcgbWVkaWEgdmlhIFJUTVAgb3Igb25lIG9mIGl0cyB2YXJpYW50c1xyXG4gICAgJ29uY29ubmVjdCc6IG51bGwsICAgICAgICAvLyBydG1wOiBjYWxsYmFjayBmb3IgY29ubmVjdGlvbiB0byBmbGFzaCBtZWRpYSBzZXJ2ZXJcclxuICAgICdkdXJhdGlvbic6IG51bGwgICAgICAgICAgLy8gcnRtcDogc29uZyBkdXJhdGlvbiAobXNlYylcclxuXHJcbiAgfTtcclxuXHJcbiAgdGhpcy5hdWRpb0Zvcm1hdHMgPSB7XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBkZXRlcm1pbmVzIEhUTUw1IHN1cHBvcnQgKyBmbGFzaCByZXF1aXJlbWVudHMuXHJcbiAgICAgKiBpZiBubyBzdXBwb3J0ICh2aWEgZmxhc2ggYW5kL29yIEhUTUw1KSBmb3IgYSBcInJlcXVpcmVkXCIgZm9ybWF0LCBTTTIgd2lsbCBmYWlsIHRvIHN0YXJ0LlxyXG4gICAgICogZmxhc2ggZmFsbGJhY2sgaXMgdXNlZCBmb3IgTVAzIG9yIE1QNCBpZiBIVE1MNSBjYW4ndCBwbGF5IGl0IChvciBpZiBwcmVmZXJGbGFzaCA9IHRydWUpXHJcbiAgICAgKi9cclxuXHJcbiAgICAnbXAzJzoge1xyXG4gICAgICAndHlwZSc6IFsnYXVkaW8vbXBlZzsgY29kZWNzPVwibXAzXCInLCAnYXVkaW8vbXBlZycsICdhdWRpby9tcDMnLCAnYXVkaW8vTVBBJywgJ2F1ZGlvL21wYS1yb2J1c3QnXSxcclxuICAgICAgJ3JlcXVpcmVkJzogdHJ1ZVxyXG4gICAgfSxcclxuXHJcbiAgICAnbXA0Jzoge1xyXG4gICAgICAncmVsYXRlZCc6IFsnYWFjJywnbTRhJywnbTRiJ10sIC8vIGFkZGl0aW9uYWwgZm9ybWF0cyB1bmRlciB0aGUgTVA0IGNvbnRhaW5lclxyXG4gICAgICAndHlwZSc6IFsnYXVkaW8vbXA0OyBjb2RlY3M9XCJtcDRhLjQwLjJcIicsICdhdWRpby9hYWMnLCAnYXVkaW8veC1tNGEnLCAnYXVkaW8vTVA0QS1MQVRNJywgJ2F1ZGlvL21wZWc0LWdlbmVyaWMnXSxcclxuICAgICAgJ3JlcXVpcmVkJzogZmFsc2VcclxuICAgIH0sXHJcblxyXG4gICAgJ29nZyc6IHtcclxuICAgICAgJ3R5cGUnOiBbJ2F1ZGlvL29nZzsgY29kZWNzPXZvcmJpcyddLFxyXG4gICAgICAncmVxdWlyZWQnOiBmYWxzZVxyXG4gICAgfSxcclxuXHJcbiAgICAnb3B1cyc6IHtcclxuICAgICAgJ3R5cGUnOiBbJ2F1ZGlvL29nZzsgY29kZWNzPW9wdXMnLCAnYXVkaW8vb3B1cyddLFxyXG4gICAgICAncmVxdWlyZWQnOiBmYWxzZVxyXG4gICAgfSxcclxuXHJcbiAgICAnd2F2Jzoge1xyXG4gICAgICAndHlwZSc6IFsnYXVkaW8vd2F2OyBjb2RlY3M9XCIxXCInLCAnYXVkaW8vd2F2JywgJ2F1ZGlvL3dhdmUnLCAnYXVkaW8veC13YXYnXSxcclxuICAgICAgJ3JlcXVpcmVkJzogZmFsc2VcclxuICAgIH1cclxuXHJcbiAgfTtcclxuXHJcbiAgLy8gSFRNTCBhdHRyaWJ1dGVzIChpZCArIGNsYXNzIG5hbWVzKSBmb3IgdGhlIFNXRiBjb250YWluZXJcclxuXHJcbiAgdGhpcy5tb3ZpZUlEID0gJ3NtMi1jb250YWluZXInO1xyXG4gIHRoaXMuaWQgPSAoc21JRCB8fCAnc20ybW92aWUnKTtcclxuXHJcbiAgdGhpcy5kZWJ1Z0lEID0gJ3NvdW5kbWFuYWdlci1kZWJ1Zyc7XHJcbiAgdGhpcy5kZWJ1Z1VSTFBhcmFtID0gLyhbIz8mXSlkZWJ1Zz0xL2k7XHJcblxyXG4gIC8vIGR5bmFtaWMgYXR0cmlidXRlc1xyXG5cclxuICB0aGlzLnZlcnNpb25OdW1iZXIgPSAnVjIuOTdhLjIwMTQwOTAxJztcclxuICB0aGlzLnZlcnNpb24gPSBudWxsO1xyXG4gIHRoaXMubW92aWVVUkwgPSBudWxsO1xyXG4gIHRoaXMuYWx0VVJMID0gbnVsbDtcclxuICB0aGlzLnN3ZkxvYWRlZCA9IGZhbHNlO1xyXG4gIHRoaXMuZW5hYmxlZCA9IGZhbHNlO1xyXG4gIHRoaXMub01DID0gbnVsbDtcclxuICB0aGlzLnNvdW5kcyA9IHt9O1xyXG4gIHRoaXMuc291bmRJRHMgPSBbXTtcclxuICB0aGlzLm11dGVkID0gZmFsc2U7XHJcbiAgdGhpcy5kaWRGbGFzaEJsb2NrID0gZmFsc2U7XHJcbiAgdGhpcy5maWxlUGF0dGVybiA9IG51bGw7XHJcblxyXG4gIHRoaXMuZmlsZVBhdHRlcm5zID0ge1xyXG5cclxuICAgICdmbGFzaDgnOiAvXFwubXAzKFxcPy4qKT8kL2ksXHJcbiAgICAnZmxhc2g5JzogL1xcLm1wMyhcXD8uKik/JC9pXHJcblxyXG4gIH07XHJcblxyXG4gIC8vIHN1cHBvcnQgaW5kaWNhdG9ycywgc2V0IGF0IGluaXRcclxuXHJcbiAgdGhpcy5mZWF0dXJlcyA9IHtcclxuXHJcbiAgICAnYnVmZmVyaW5nJzogZmFsc2UsXHJcbiAgICAncGVha0RhdGEnOiBmYWxzZSxcclxuICAgICd3YXZlZm9ybURhdGEnOiBmYWxzZSxcclxuICAgICdlcURhdGEnOiBmYWxzZSxcclxuICAgICdtb3ZpZVN0YXInOiBmYWxzZVxyXG5cclxuICB9O1xyXG5cclxuICAvLyBmbGFzaCBzYW5kYm94IGluZm8sIHVzZWQgcHJpbWFyaWx5IGluIHRyb3VibGVzaG9vdGluZ1xyXG5cclxuICB0aGlzLnNhbmRib3ggPSB7XHJcblxyXG4gICAgLy8gPGQ+XHJcbiAgICAndHlwZSc6IG51bGwsXHJcbiAgICAndHlwZXMnOiB7XHJcbiAgICAgICdyZW1vdGUnOiAncmVtb3RlIChkb21haW4tYmFzZWQpIHJ1bGVzJyxcclxuICAgICAgJ2xvY2FsV2l0aEZpbGUnOiAnbG9jYWwgd2l0aCBmaWxlIGFjY2VzcyAobm8gaW50ZXJuZXQgYWNjZXNzKScsXHJcbiAgICAgICdsb2NhbFdpdGhOZXR3b3JrJzogJ2xvY2FsIHdpdGggbmV0d29yayAoaW50ZXJuZXQgYWNjZXNzIG9ubHksIG5vIGxvY2FsIGFjY2VzcyknLFxyXG4gICAgICAnbG9jYWxUcnVzdGVkJzogJ2xvY2FsLCB0cnVzdGVkIChsb2NhbCtpbnRlcm5ldCBhY2Nlc3MpJ1xyXG4gICAgfSxcclxuICAgICdkZXNjcmlwdGlvbic6IG51bGwsXHJcbiAgICAnbm9SZW1vdGUnOiBudWxsLFxyXG4gICAgJ25vTG9jYWwnOiBudWxsXHJcbiAgICAvLyA8L2Q+XHJcblxyXG4gIH07XHJcblxyXG4gIC8qKlxyXG4gICAqIGZvcm1hdCBzdXBwb3J0IChodG1sNS9mbGFzaClcclxuICAgKiBzdG9yZXMgY2FuUGxheVR5cGUoKSByZXN1bHRzIGJhc2VkIG9uIGF1ZGlvRm9ybWF0cy5cclxuICAgKiBlZy4geyBtcDM6IGJvb2xlYW4sIG1wNDogYm9vbGVhbiB9XHJcbiAgICogdHJlYXQgYXMgcmVhZC1vbmx5LlxyXG4gICAqL1xyXG5cclxuICB0aGlzLmh0bWw1ID0ge1xyXG4gICAgJ3VzaW5nRmxhc2gnOiBudWxsIC8vIHNldCBpZi93aGVuIGZsYXNoIGZhbGxiYWNrIGlzIG5lZWRlZFxyXG4gIH07XHJcblxyXG4gIC8vIGZpbGUgdHlwZSBzdXBwb3J0IGhhc2hcclxuICB0aGlzLmZsYXNoID0ge307XHJcblxyXG4gIC8vIGRldGVybWluZWQgYXQgaW5pdCB0aW1lXHJcbiAgdGhpcy5odG1sNU9ubHkgPSBmYWxzZTtcclxuXHJcbiAgLy8gdXNlZCBmb3Igc3BlY2lhbCBjYXNlcyAoZWcuIGlQYWQvaVBob25lL3BhbG0gT1M/KVxyXG4gIHRoaXMuaWdub3JlRmxhc2ggPSBmYWxzZTtcclxuXHJcbiAgLyoqXHJcbiAgICogYSBmZXcgcHJpdmF0ZSBpbnRlcm5hbHMgKE9LLCBhIGxvdC4gOkQpXHJcbiAgICovXHJcblxyXG4gIHZhciBTTVNvdW5kLFxyXG4gIHNtMiA9IHRoaXMsIGdsb2JhbEhUTUw1QXVkaW8gPSBudWxsLCBmbGFzaCA9IG51bGwsIHNtID0gJ3NvdW5kTWFuYWdlcicsIHNtYyA9IHNtICsgJzogJywgaDUgPSAnSFRNTDU6OicsIGlkLCB1YSA9IG5hdmlnYXRvci51c2VyQWdlbnQsIHdsID0gd2luZG93LmxvY2F0aW9uLmhyZWYudG9TdHJpbmcoKSwgZG9jID0gZG9jdW1lbnQsIGRvTm90aGluZywgc2V0UHJvcGVydGllcywgaW5pdCwgZlYsIG9uX3F1ZXVlID0gW10sIGRlYnVnT3BlbiA9IHRydWUsIGRlYnVnVFMsIGRpZEFwcGVuZCA9IGZhbHNlLCBhcHBlbmRTdWNjZXNzID0gZmFsc2UsIGRpZEluaXQgPSBmYWxzZSwgZGlzYWJsZWQgPSBmYWxzZSwgd2luZG93TG9hZGVkID0gZmFsc2UsIF93RFMsIHdkQ291bnQgPSAwLCBpbml0Q29tcGxldGUsIG1peGluLCBhc3NpZ24sIGV4dHJhT3B0aW9ucywgYWRkT25FdmVudCwgcHJvY2Vzc09uRXZlbnRzLCBpbml0VXNlck9ubG9hZCwgZGVsYXlXYWl0Rm9yRUksIHdhaXRGb3JFSSwgcmVib290SW50b0hUTUw1LCBzZXRWZXJzaW9uSW5mbywgaGFuZGxlRm9jdXMsIHN0cmluZ3MsIGluaXRNb3ZpZSwgcHJlSW5pdCwgZG9tQ29udGVudExvYWRlZCwgd2luT25Mb2FkLCBkaWREQ0xvYWRlZCwgZ2V0RG9jdW1lbnQsIGNyZWF0ZU1vdmllLCBjYXRjaEVycm9yLCBzZXRQb2xsaW5nLCBpbml0RGVidWcsIGRlYnVnTGV2ZWxzID0gWydsb2cnLCAnaW5mbycsICd3YXJuJywgJ2Vycm9yJ10sIGRlZmF1bHRGbGFzaFZlcnNpb24gPSA4LCBkaXNhYmxlT2JqZWN0LCBmYWlsU2FmZWx5LCBub3JtYWxpemVNb3ZpZVVSTCwgb1JlbW92ZWQgPSBudWxsLCBvUmVtb3ZlZEhUTUwgPSBudWxsLCBzdHIsIGZsYXNoQmxvY2tIYW5kbGVyLCBnZXRTV0ZDU1MsIHN3ZkNTUywgdG9nZ2xlRGVidWcsIGxvb3BGaXgsIHBvbGljeUZpeCwgY29tcGxhaW4sIGlkQ2hlY2ssIHdhaXRpbmdGb3JFSSA9IGZhbHNlLCBpbml0UGVuZGluZyA9IGZhbHNlLCBzdGFydFRpbWVyLCBzdG9wVGltZXIsIHRpbWVyRXhlY3V0ZSwgaDVUaW1lckNvdW50ID0gMCwgaDVJbnRlcnZhbFRpbWVyID0gbnVsbCwgcGFyc2VVUkwsIG1lc3NhZ2VzID0gW10sXHJcbiAgY2FuSWdub3JlRmxhc2gsIG5lZWRzRmxhc2ggPSBudWxsLCBmZWF0dXJlQ2hlY2ssIGh0bWw1T0ssIGh0bWw1Q2FuUGxheSwgaHRtbDVFeHQsIGh0bWw1VW5sb2FkLCBkb21Db250ZW50TG9hZGVkSUUsIHRlc3RIVE1MNSwgZXZlbnQsIHNsaWNlID0gQXJyYXkucHJvdG90eXBlLnNsaWNlLCB1c2VHbG9iYWxIVE1MNUF1ZGlvID0gZmFsc2UsIGxhc3RHbG9iYWxIVE1MNVVSTCwgaGFzRmxhc2gsIGRldGVjdEZsYXNoLCBiYWRTYWZhcmlGaXgsIGh0bWw1X2V2ZW50cywgc2hvd1N1cHBvcnQsIGZsdXNoTWVzc2FnZXMsIHdyYXBDYWxsYmFjaywgaWRDb3VudGVyID0gMCxcclxuICBpc19pRGV2aWNlID0gdWEubWF0Y2goLyhpcGFkfGlwaG9uZXxpcG9kKS9pKSwgaXNBbmRyb2lkID0gdWEubWF0Y2goL2FuZHJvaWQvaSksIGlzSUUgPSB1YS5tYXRjaCgvbXNpZS9pKSwgaXNXZWJraXQgPSB1YS5tYXRjaCgvd2Via2l0L2kpLCBpc1NhZmFyaSA9ICh1YS5tYXRjaCgvc2FmYXJpL2kpICYmICF1YS5tYXRjaCgvY2hyb21lL2kpKSwgaXNPcGVyYSA9ICh1YS5tYXRjaCgvb3BlcmEvaSkpLFxyXG4gIG1vYmlsZUhUTUw1ID0gKHVhLm1hdGNoKC8obW9iaWxlfHByZVxcL3x4b29tKS9pKSB8fCBpc19pRGV2aWNlIHx8IGlzQW5kcm9pZCksXHJcbiAgaXNCYWRTYWZhcmkgPSAoIXdsLm1hdGNoKC91c2VodG1sNWF1ZGlvL2kpICYmICF3bC5tYXRjaCgvc20yXFwtaWdub3JlYmFkdWEvaSkgJiYgaXNTYWZhcmkgJiYgIXVhLm1hdGNoKC9zaWxrL2kpICYmIHVhLm1hdGNoKC9PUyBYIDEwXzZfKFszLTddKS9pKSksIC8vIFNhZmFyaSA0IGFuZCA1IChleGNsdWRpbmcgS2luZGxlIEZpcmUsIFwiU2lsa1wiKSBvY2Nhc2lvbmFsbHkgZmFpbCB0byBsb2FkL3BsYXkgSFRNTDUgYXVkaW8gb24gU25vdyBMZW9wYXJkIDEwLjYuMyB0aHJvdWdoIDEwLjYuNyBkdWUgdG8gYnVnKHMpIGluIFF1aWNrVGltZSBYIGFuZC9vciBvdGhlciB1bmRlcmx5aW5nIGZyYW1ld29ya3MuIDovIENvbmZpcm1lZCBidWcuIGh0dHBzOi8vYnVncy53ZWJraXQub3JnL3Nob3dfYnVnLmNnaT9pZD0zMjE1OVxyXG4gIGhhc0NvbnNvbGUgPSAod2luZG93LmNvbnNvbGUgIT09IF91bmRlZmluZWQgJiYgY29uc29sZS5sb2cgIT09IF91bmRlZmluZWQpLCBpc0ZvY3VzZWQgPSAoZG9jLmhhc0ZvY3VzICE9PSBfdW5kZWZpbmVkP2RvYy5oYXNGb2N1cygpOm51bGwpLCB0cnlJbml0T25Gb2N1cyA9IChpc1NhZmFyaSAmJiAoZG9jLmhhc0ZvY3VzID09PSBfdW5kZWZpbmVkIHx8ICFkb2MuaGFzRm9jdXMoKSkpLCBva1RvRGlzYWJsZSA9ICF0cnlJbml0T25Gb2N1cywgZmxhc2hNSU1FID0gLyhtcDN8bXA0fG1wYXxtNGF8bTRiKS9pLCBtc2VjU2NhbGUgPSAxMDAwLFxyXG4gIGVtcHR5VVJMID0gJ2Fib3V0OmJsYW5rJywgLy8gc2FmZSBVUkwgdG8gdW5sb2FkLCBvciBsb2FkIG5vdGhpbmcgZnJvbSAoZmxhc2ggOCArIG1vc3QgSFRNTDUgVUFzKVxyXG4gIGVtcHR5V0FWID0gJ2RhdGE6YXVkaW8vd2F2ZTtiYXNlNjQsL1VrbEdSaVlBQUFCWFFWWkZabTEwSUJBQUFBQUJBQUVBUkt3QUFJaFlBUUFDQUJBQVpHRjBZUUlBQUFELy93PT0nLCAvLyB0aW55IFdBViBmb3IgSFRNTDUgdW5sb2FkaW5nXHJcbiAgb3ZlckhUVFAgPSAoZG9jLmxvY2F0aW9uP2RvYy5sb2NhdGlvbi5wcm90b2NvbC5tYXRjaCgvaHR0cC9pKTpudWxsKSxcclxuICBodHRwID0gKCFvdmVySFRUUCA/ICdodHRwOi8nKycvJyA6ICcnKSxcclxuICAvLyBtcDMsIG1wNCwgYWFjIGV0Yy5cclxuICBuZXRTdHJlYW1NaW1lVHlwZXMgPSAvXlxccyphdWRpb1xcLyg/OngtKT8oPzptcGVnNHxhYWN8Zmx2fG1vdnxtcDR8fG00dnxtNGF8bTRifG1wNHZ8M2dwfDNnMilcXHMqKD86JHw7KS9pLFxyXG4gIC8vIEZsYXNoIHY5LjByMTE1KyBcIm1vdmllc3RhclwiIGZvcm1hdHNcclxuICBuZXRTdHJlYW1UeXBlcyA9IFsnbXBlZzQnLCAnYWFjJywgJ2ZsdicsICdtb3YnLCAnbXA0JywgJ200dicsICdmNHYnLCAnbTRhJywgJ200YicsICdtcDR2JywgJzNncCcsICczZzInXSxcclxuICBuZXRTdHJlYW1QYXR0ZXJuID0gbmV3IFJlZ0V4cCgnXFxcXC4oJyArIG5ldFN0cmVhbVR5cGVzLmpvaW4oJ3wnKSArICcpKFxcXFw/LiopPyQnLCAnaScpO1xyXG5cclxuICB0aGlzLm1pbWVQYXR0ZXJuID0gL15cXHMqYXVkaW9cXC8oPzp4LSk/KD86bXAoPzplZ3wzKSlcXHMqKD86JHw7KS9pOyAvLyBkZWZhdWx0IG1wMyBzZXRcclxuXHJcbiAgLy8gdXNlIGFsdFVSTCBpZiBub3QgXCJvbmxpbmVcIlxyXG4gIHRoaXMudXNlQWx0VVJMID0gIW92ZXJIVFRQO1xyXG5cclxuICBzd2ZDU1MgPSB7XHJcblxyXG4gICAgJ3N3ZkJveCc6ICdzbTItb2JqZWN0LWJveCcsXHJcbiAgICAnc3dmRGVmYXVsdCc6ICdtb3ZpZUNvbnRhaW5lcicsXHJcbiAgICAnc3dmRXJyb3InOiAnc3dmX2Vycm9yJywgLy8gU1dGIGxvYWRlZCwgYnV0IFNNMiBjb3VsZG4ndCBzdGFydCAob3RoZXIgZXJyb3IpXHJcbiAgICAnc3dmVGltZWRvdXQnOiAnc3dmX3RpbWVkb3V0JyxcclxuICAgICdzd2ZMb2FkZWQnOiAnc3dmX2xvYWRlZCcsXHJcbiAgICAnc3dmVW5ibG9ja2VkJzogJ3N3Zl91bmJsb2NrZWQnLCAvLyBvciBsb2FkZWQgT0tcclxuICAgICdzbTJEZWJ1Zyc6ICdzbTJfZGVidWcnLFxyXG4gICAgJ2hpZ2hQZXJmJzogJ2hpZ2hfcGVyZm9ybWFuY2UnLFxyXG4gICAgJ2ZsYXNoRGVidWcnOiAnZmxhc2hfZGVidWcnXHJcblxyXG4gIH07XHJcblxyXG4gIC8qKlxyXG4gICAqIGJhc2ljIEhUTUw1IEF1ZGlvKCkgc3VwcG9ydCB0ZXN0XHJcbiAgICogdHJ5Li4uY2F0Y2ggYmVjYXVzZSBvZiBJRSA5IFwibm90IGltcGxlbWVudGVkXCIgbm9uc2Vuc2VcclxuICAgKiBodHRwczovL2dpdGh1Yi5jb20vTW9kZXJuaXpyL01vZGVybml6ci9pc3N1ZXMvMjI0XHJcbiAgICovXHJcblxyXG4gIHRoaXMuaGFzSFRNTDUgPSAoZnVuY3Rpb24oKSB7XHJcbiAgICB0cnkge1xyXG4gICAgICAvLyBuZXcgQXVkaW8obnVsbCkgZm9yIHN0dXBpZCBPcGVyYSA5LjY0IGNhc2UsIHdoaWNoIHRocm93cyBub3RfZW5vdWdoX2FyZ3VtZW50cyBleGNlcHRpb24gb3RoZXJ3aXNlLlxyXG4gICAgICByZXR1cm4gKEF1ZGlvICE9PSBfdW5kZWZpbmVkICYmIChpc09wZXJhICYmIG9wZXJhICE9PSBfdW5kZWZpbmVkICYmIG9wZXJhLnZlcnNpb24oKSA8IDEwID8gbmV3IEF1ZGlvKG51bGwpIDogbmV3IEF1ZGlvKCkpLmNhblBsYXlUeXBlICE9PSBfdW5kZWZpbmVkKTtcclxuICAgIH0gY2F0Y2goZSkge1xyXG4gICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICB9XHJcbiAgfSgpKTtcclxuXHJcbiAgLyoqXHJcbiAgICogUHVibGljIFNvdW5kTWFuYWdlciBBUElcclxuICAgKiAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxyXG4gICAqL1xyXG5cclxuICAvKipcclxuICAgKiBDb25maWd1cmVzIHRvcC1sZXZlbCBzb3VuZE1hbmFnZXIgcHJvcGVydGllcy5cclxuICAgKlxyXG4gICAqIEBwYXJhbSB7b2JqZWN0fSBvcHRpb25zIE9wdGlvbiBwYXJhbWV0ZXJzLCBlZy4geyBmbGFzaFZlcnNpb246IDksIHVybDogJy9wYXRoL3RvL3N3ZnMvJyB9XHJcbiAgICogb25yZWFkeSBhbmQgb250aW1lb3V0IGFyZSBhbHNvIGFjY2VwdGVkIHBhcmFtZXRlcnMuIGNhbGwgc291bmRNYW5hZ2VyLnNldHVwKCkgdG8gc2VlIHRoZSBmdWxsIGxpc3QuXHJcbiAgICovXHJcblxyXG4gIHRoaXMuc2V0dXAgPSBmdW5jdGlvbihvcHRpb25zKSB7XHJcblxyXG4gICAgdmFyIG5vVVJMID0gKCFzbTIudXJsKTtcclxuXHJcbiAgICAvLyB3YXJuIGlmIGZsYXNoIG9wdGlvbnMgaGF2ZSBhbHJlYWR5IGJlZW4gYXBwbGllZFxyXG5cclxuICAgIGlmIChvcHRpb25zICE9PSBfdW5kZWZpbmVkICYmIGRpZEluaXQgJiYgbmVlZHNGbGFzaCAmJiBzbTIub2soKSAmJiAob3B0aW9ucy5mbGFzaFZlcnNpb24gIT09IF91bmRlZmluZWQgfHwgb3B0aW9ucy51cmwgIT09IF91bmRlZmluZWQgfHwgb3B0aW9ucy5odG1sNVRlc3QgIT09IF91bmRlZmluZWQpKSB7XHJcbiAgICAgIGNvbXBsYWluKHN0cignc2V0dXBMYXRlJykpO1xyXG4gICAgfVxyXG5cclxuICAgIC8vIFRPRE86IGRlZmVyOiB0cnVlP1xyXG5cclxuICAgIGFzc2lnbihvcHRpb25zKTtcclxuXHJcbiAgICAvLyBzcGVjaWFsIGNhc2UgMTogXCJMYXRlIHNldHVwXCIuIFNNMiBsb2FkZWQgbm9ybWFsbHksIGJ1dCB1c2VyIGRpZG4ndCBhc3NpZ24gZmxhc2ggVVJMIGVnLiwgc2V0dXAoe3VybDouLi59KSBiZWZvcmUgU00yIGluaXQuIFRyZWF0IGFzIGRlbGF5ZWQgaW5pdC5cclxuXHJcbiAgICBpZiAob3B0aW9ucykge1xyXG5cclxuICAgICAgaWYgKG5vVVJMICYmIGRpZERDTG9hZGVkICYmIG9wdGlvbnMudXJsICE9PSBfdW5kZWZpbmVkKSB7XHJcbiAgICAgICAgc20yLmJlZ2luRGVsYXllZEluaXQoKTtcclxuICAgICAgfVxyXG5cclxuICAgICAgLy8gc3BlY2lhbCBjYXNlIDI6IElmIGxhenktbG9hZGluZyBTTTIgKERPTUNvbnRlbnRMb2FkZWQgaGFzIGFscmVhZHkgaGFwcGVuZWQpIGFuZCB1c2VyIGNhbGxzIHNldHVwKCkgd2l0aCB1cmw6IHBhcmFtZXRlciwgdHJ5IHRvIGluaXQgQVNBUC5cclxuXHJcbiAgICAgIGlmICghZGlkRENMb2FkZWQgJiYgb3B0aW9ucy51cmwgIT09IF91bmRlZmluZWQgJiYgZG9jLnJlYWR5U3RhdGUgPT09ICdjb21wbGV0ZScpIHtcclxuICAgICAgICBzZXRUaW1lb3V0KGRvbUNvbnRlbnRMb2FkZWQsIDEpO1xyXG4gICAgICB9XHJcblxyXG4gICAgfVxyXG5cclxuICAgIHJldHVybiBzbTI7XHJcblxyXG4gIH07XHJcblxyXG4gIHRoaXMub2sgPSBmdW5jdGlvbigpIHtcclxuXHJcbiAgICByZXR1cm4gKG5lZWRzRmxhc2ggPyAoZGlkSW5pdCAmJiAhZGlzYWJsZWQpIDogKHNtMi51c2VIVE1MNUF1ZGlvICYmIHNtMi5oYXNIVE1MNSkpO1xyXG5cclxuICB9O1xyXG5cclxuICB0aGlzLnN1cHBvcnRlZCA9IHRoaXMub2s7IC8vIGxlZ2FjeVxyXG5cclxuICB0aGlzLmdldE1vdmllID0gZnVuY3Rpb24oc21JRCkge1xyXG5cclxuICAgIC8vIHNhZmV0eSBuZXQ6IHNvbWUgb2xkIGJyb3dzZXJzIGRpZmZlciBvbiBTV0YgcmVmZXJlbmNlcywgcG9zc2libHkgcmVsYXRlZCB0byBFeHRlcm5hbEludGVyZmFjZSAvIGZsYXNoIHZlcnNpb25cclxuICAgIHJldHVybiBpZChzbUlEKSB8fCBkb2Nbc21JRF0gfHwgd2luZG93W3NtSURdO1xyXG5cclxuICB9O1xyXG5cclxuICAvKipcclxuICAgKiBDcmVhdGVzIGEgU01Tb3VuZCBzb3VuZCBvYmplY3QgaW5zdGFuY2UuXHJcbiAgICpcclxuICAgKiBAcGFyYW0ge29iamVjdH0gb09wdGlvbnMgU291bmQgb3B0aW9ucyAoYXQgbWluaW11bSwgaWQgYW5kIHVybCBwYXJhbWV0ZXJzIGFyZSByZXF1aXJlZC4pXHJcbiAgICogQHJldHVybiB7b2JqZWN0fSBTTVNvdW5kIFRoZSBuZXcgU01Tb3VuZCBvYmplY3QuXHJcbiAgICovXHJcblxyXG4gIHRoaXMuY3JlYXRlU291bmQgPSBmdW5jdGlvbihvT3B0aW9ucywgX3VybCkge1xyXG5cclxuICAgIHZhciBjcywgY3Nfc3RyaW5nLCBvcHRpb25zLCBvU291bmQgPSBudWxsO1xyXG5cclxuICAgIC8vIDxkPlxyXG4gICAgY3MgPSBzbSArICcuY3JlYXRlU291bmQoKTogJztcclxuICAgIGNzX3N0cmluZyA9IGNzICsgc3RyKCFkaWRJbml0Pydub3RSZWFkeSc6J25vdE9LJyk7XHJcbiAgICAvLyA8L2Q+XHJcblxyXG4gICAgaWYgKCFkaWRJbml0IHx8ICFzbTIub2soKSkge1xyXG4gICAgICBjb21wbGFpbihjc19zdHJpbmcpO1xyXG4gICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICB9XHJcblxyXG4gICAgaWYgKF91cmwgIT09IF91bmRlZmluZWQpIHtcclxuICAgICAgLy8gZnVuY3Rpb24gb3ZlcmxvYWRpbmcgaW4gSlMhIDopIC4uYXNzdW1lIHNpbXBsZSBjcmVhdGVTb3VuZChpZCwgdXJsKSB1c2UgY2FzZVxyXG4gICAgICBvT3B0aW9ucyA9IHtcclxuICAgICAgICAnaWQnOiBvT3B0aW9ucyxcclxuICAgICAgICAndXJsJzogX3VybFxyXG4gICAgICB9O1xyXG4gICAgfVxyXG5cclxuICAgIC8vIGluaGVyaXQgZnJvbSBkZWZhdWx0T3B0aW9uc1xyXG4gICAgb3B0aW9ucyA9IG1peGluKG9PcHRpb25zKTtcclxuXHJcbiAgICBvcHRpb25zLnVybCA9IHBhcnNlVVJMKG9wdGlvbnMudXJsKTtcclxuXHJcbiAgICAvLyBnZW5lcmF0ZSBhbiBpZCwgaWYgbmVlZGVkLlxyXG4gICAgaWYgKG9wdGlvbnMuaWQgPT09IHVuZGVmaW5lZCkge1xyXG4gICAgICBvcHRpb25zLmlkID0gc20yLnNldHVwT3B0aW9ucy5pZFByZWZpeCArIChpZENvdW50ZXIrKyk7XHJcbiAgICB9XHJcblxyXG4gICAgLy8gPGQ+XHJcbiAgICBpZiAob3B0aW9ucy5pZC50b1N0cmluZygpLmNoYXJBdCgwKS5tYXRjaCgvXlswLTldJC8pKSB7XHJcbiAgICAgIHNtMi5fd0QoY3MgKyBzdHIoJ2JhZElEJywgb3B0aW9ucy5pZCksIDIpO1xyXG4gICAgfVxyXG5cclxuICAgIHNtMi5fd0QoY3MgKyBvcHRpb25zLmlkICsgKG9wdGlvbnMudXJsID8gJyAoJyArIG9wdGlvbnMudXJsICsgJyknIDogJycpLCAxKTtcclxuICAgIC8vIDwvZD5cclxuXHJcbiAgICBpZiAoaWRDaGVjayhvcHRpb25zLmlkLCB0cnVlKSkge1xyXG4gICAgICBzbTIuX3dEKGNzICsgb3B0aW9ucy5pZCArICcgZXhpc3RzJywgMSk7XHJcbiAgICAgIHJldHVybiBzbTIuc291bmRzW29wdGlvbnMuaWRdO1xyXG4gICAgfVxyXG5cclxuICAgIGZ1bmN0aW9uIG1ha2UoKSB7XHJcblxyXG4gICAgICBvcHRpb25zID0gbG9vcEZpeChvcHRpb25zKTtcclxuICAgICAgc20yLnNvdW5kc1tvcHRpb25zLmlkXSA9IG5ldyBTTVNvdW5kKG9wdGlvbnMpO1xyXG4gICAgICBzbTIuc291bmRJRHMucHVzaChvcHRpb25zLmlkKTtcclxuICAgICAgcmV0dXJuIHNtMi5zb3VuZHNbb3B0aW9ucy5pZF07XHJcblxyXG4gICAgfVxyXG5cclxuICAgIGlmIChodG1sNU9LKG9wdGlvbnMpKSB7XHJcblxyXG4gICAgICBvU291bmQgPSBtYWtlKCk7XHJcbiAgICAgIHNtMi5fd0Qob3B0aW9ucy5pZCArICc6IFVzaW5nIEhUTUw1Jyk7XHJcbiAgICAgIG9Tb3VuZC5fc2V0dXBfaHRtbDUob3B0aW9ucyk7XHJcblxyXG4gICAgfSBlbHNlIHtcclxuXHJcbiAgICAgIGlmIChzbTIuaHRtbDVPbmx5KSB7XHJcbiAgICAgICAgc20yLl93RChvcHRpb25zLmlkICsgJzogTm8gSFRNTDUgc3VwcG9ydCBmb3IgdGhpcyBzb3VuZCwgYW5kIG5vIEZsYXNoLiBFeGl0aW5nLicpO1xyXG4gICAgICAgIHJldHVybiBtYWtlKCk7XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIC8vIFRPRE86IE1vdmUgSFRNTDUvZmxhc2ggY2hlY2tzIGludG8gZ2VuZXJpYyBVUkwgcGFyc2luZy9oYW5kbGluZyBmdW5jdGlvbi5cclxuXHJcbiAgICAgIGlmIChzbTIuaHRtbDUudXNpbmdGbGFzaCAmJiBvcHRpb25zLnVybCAmJiBvcHRpb25zLnVybC5tYXRjaCgvZGF0YVxcOi9pKSkge1xyXG4gICAgICAgIC8vIGRhdGE6IFVSSXMgbm90IHN1cHBvcnRlZCBieSBGbGFzaCwgZWl0aGVyLlxyXG4gICAgICAgIHNtMi5fd0Qob3B0aW9ucy5pZCArICc6IGRhdGE6IFVSSXMgbm90IHN1cHBvcnRlZCB2aWEgRmxhc2guIEV4aXRpbmcuJyk7XHJcbiAgICAgICAgcmV0dXJuIG1ha2UoKTtcclxuICAgICAgfVxyXG5cclxuICAgICAgaWYgKGZWID4gOCkge1xyXG4gICAgICAgIGlmIChvcHRpb25zLmlzTW92aWVTdGFyID09PSBudWxsKSB7XHJcbiAgICAgICAgICAvLyBhdHRlbXB0IHRvIGRldGVjdCBNUEVHLTQgZm9ybWF0c1xyXG4gICAgICAgICAgb3B0aW9ucy5pc01vdmllU3RhciA9ICEhKG9wdGlvbnMuc2VydmVyVVJMIHx8IChvcHRpb25zLnR5cGUgPyBvcHRpb25zLnR5cGUubWF0Y2gobmV0U3RyZWFtTWltZVR5cGVzKSA6IGZhbHNlKSB8fCAob3B0aW9ucy51cmwgJiYgb3B0aW9ucy51cmwubWF0Y2gobmV0U3RyZWFtUGF0dGVybikpKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgLy8gPGQ+XHJcbiAgICAgICAgaWYgKG9wdGlvbnMuaXNNb3ZpZVN0YXIpIHtcclxuICAgICAgICAgIHNtMi5fd0QoY3MgKyAndXNpbmcgTW92aWVTdGFyIGhhbmRsaW5nJyk7XHJcbiAgICAgICAgICBpZiAob3B0aW9ucy5sb29wcyA+IDEpIHtcclxuICAgICAgICAgICAgX3dEUygnbm9OU0xvb3AnKTtcclxuICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgICAgLy8gPC9kPlxyXG4gICAgICB9XHJcblxyXG4gICAgICBvcHRpb25zID0gcG9saWN5Rml4KG9wdGlvbnMsIGNzKTtcclxuICAgICAgb1NvdW5kID0gbWFrZSgpO1xyXG5cclxuICAgICAgaWYgKGZWID09PSA4KSB7XHJcbiAgICAgICAgZmxhc2guX2NyZWF0ZVNvdW5kKG9wdGlvbnMuaWQsIG9wdGlvbnMubG9vcHN8fDEsIG9wdGlvbnMudXNlUG9saWN5RmlsZSk7XHJcbiAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgZmxhc2guX2NyZWF0ZVNvdW5kKG9wdGlvbnMuaWQsIG9wdGlvbnMudXJsLCBvcHRpb25zLnVzZVBlYWtEYXRhLCBvcHRpb25zLnVzZVdhdmVmb3JtRGF0YSwgb3B0aW9ucy51c2VFUURhdGEsIG9wdGlvbnMuaXNNb3ZpZVN0YXIsIChvcHRpb25zLmlzTW92aWVTdGFyP29wdGlvbnMuYnVmZmVyVGltZTpmYWxzZSksIG9wdGlvbnMubG9vcHN8fDEsIG9wdGlvbnMuc2VydmVyVVJMLCBvcHRpb25zLmR1cmF0aW9ufHxudWxsLCBvcHRpb25zLmF1dG9QbGF5LCB0cnVlLCBvcHRpb25zLmF1dG9Mb2FkLCBvcHRpb25zLnVzZVBvbGljeUZpbGUpO1xyXG4gICAgICAgIGlmICghb3B0aW9ucy5zZXJ2ZXJVUkwpIHtcclxuICAgICAgICAgIC8vIFdlIGFyZSBjb25uZWN0ZWQgaW1tZWRpYXRlbHlcclxuICAgICAgICAgIG9Tb3VuZC5jb25uZWN0ZWQgPSB0cnVlO1xyXG4gICAgICAgICAgaWYgKG9wdGlvbnMub25jb25uZWN0KSB7XHJcbiAgICAgICAgICAgIG9wdGlvbnMub25jb25uZWN0LmFwcGx5KG9Tb3VuZCk7XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcblxyXG4gICAgICBpZiAoIW9wdGlvbnMuc2VydmVyVVJMICYmIChvcHRpb25zLmF1dG9Mb2FkIHx8IG9wdGlvbnMuYXV0b1BsYXkpKSB7XHJcbiAgICAgICAgLy8gY2FsbCBsb2FkIGZvciBub24tcnRtcCBzdHJlYW1zXHJcbiAgICAgICAgb1NvdW5kLmxvYWQob3B0aW9ucyk7XHJcbiAgICAgIH1cclxuXHJcbiAgICB9XHJcblxyXG4gICAgLy8gcnRtcCB3aWxsIHBsYXkgaW4gb25jb25uZWN0XHJcbiAgICBpZiAoIW9wdGlvbnMuc2VydmVyVVJMICYmIG9wdGlvbnMuYXV0b1BsYXkpIHtcclxuICAgICAgb1NvdW5kLnBsYXkoKTtcclxuICAgIH1cclxuXHJcbiAgICByZXR1cm4gb1NvdW5kO1xyXG5cclxuICB9O1xyXG5cclxuICAvKipcclxuICAgKiBEZXN0cm95cyBhIFNNU291bmQgc291bmQgb2JqZWN0IGluc3RhbmNlLlxyXG4gICAqXHJcbiAgICogQHBhcmFtIHtzdHJpbmd9IHNJRCBUaGUgSUQgb2YgdGhlIHNvdW5kIHRvIGRlc3Ryb3lcclxuICAgKi9cclxuXHJcbiAgdGhpcy5kZXN0cm95U291bmQgPSBmdW5jdGlvbihzSUQsIF9iRnJvbVNvdW5kKSB7XHJcblxyXG4gICAgLy8gZXhwbGljaXRseSBkZXN0cm95IGEgc291bmQgYmVmb3JlIG5vcm1hbCBwYWdlIHVubG9hZCwgZXRjLlxyXG5cclxuICAgIGlmICghaWRDaGVjayhzSUQpKSB7XHJcbiAgICAgIHJldHVybiBmYWxzZTtcclxuICAgIH1cclxuXHJcbiAgICB2YXIgb1MgPSBzbTIuc291bmRzW3NJRF0sIGk7XHJcblxyXG4gICAgLy8gRGlzYWJsZSBhbGwgY2FsbGJhY2tzIHdoaWxlIHRoZSBzb3VuZCBpcyBiZWluZyBkZXN0cm95ZWRcclxuICAgIG9TLl9pTyA9IHt9O1xyXG5cclxuICAgIG9TLnN0b3AoKTtcclxuICAgIG9TLnVubG9hZCgpO1xyXG5cclxuICAgIGZvciAoaSA9IDA7IGkgPCBzbTIuc291bmRJRHMubGVuZ3RoOyBpKyspIHtcclxuICAgICAgaWYgKHNtMi5zb3VuZElEc1tpXSA9PT0gc0lEKSB7XHJcbiAgICAgICAgc20yLnNvdW5kSURzLnNwbGljZShpLCAxKTtcclxuICAgICAgICBicmVhaztcclxuICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIGlmICghX2JGcm9tU291bmQpIHtcclxuICAgICAgLy8gaWdub3JlIGlmIGJlaW5nIGNhbGxlZCBmcm9tIFNNU291bmQgaW5zdGFuY2VcclxuICAgICAgb1MuZGVzdHJ1Y3QodHJ1ZSk7XHJcbiAgICB9XHJcblxyXG4gICAgb1MgPSBudWxsO1xyXG4gICAgZGVsZXRlIHNtMi5zb3VuZHNbc0lEXTtcclxuXHJcbiAgICByZXR1cm4gdHJ1ZTtcclxuXHJcbiAgfTtcclxuXHJcbiAgLyoqXHJcbiAgICogQ2FsbHMgdGhlIGxvYWQoKSBtZXRob2Qgb2YgYSBTTVNvdW5kIG9iamVjdCBieSBJRC5cclxuICAgKlxyXG4gICAqIEBwYXJhbSB7c3RyaW5nfSBzSUQgVGhlIElEIG9mIHRoZSBzb3VuZFxyXG4gICAqIEBwYXJhbSB7b2JqZWN0fSBvT3B0aW9ucyBPcHRpb25hbDogU291bmQgb3B0aW9uc1xyXG4gICAqL1xyXG5cclxuICB0aGlzLmxvYWQgPSBmdW5jdGlvbihzSUQsIG9PcHRpb25zKSB7XHJcblxyXG4gICAgaWYgKCFpZENoZWNrKHNJRCkpIHtcclxuICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgfVxyXG4gICAgcmV0dXJuIHNtMi5zb3VuZHNbc0lEXS5sb2FkKG9PcHRpb25zKTtcclxuXHJcbiAgfTtcclxuXHJcbiAgLyoqXHJcbiAgICogQ2FsbHMgdGhlIHVubG9hZCgpIG1ldGhvZCBvZiBhIFNNU291bmQgb2JqZWN0IGJ5IElELlxyXG4gICAqXHJcbiAgICogQHBhcmFtIHtzdHJpbmd9IHNJRCBUaGUgSUQgb2YgdGhlIHNvdW5kXHJcbiAgICovXHJcblxyXG4gIHRoaXMudW5sb2FkID0gZnVuY3Rpb24oc0lEKSB7XHJcblxyXG4gICAgaWYgKCFpZENoZWNrKHNJRCkpIHtcclxuICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgfVxyXG4gICAgcmV0dXJuIHNtMi5zb3VuZHNbc0lEXS51bmxvYWQoKTtcclxuXHJcbiAgfTtcclxuXHJcbiAgLyoqXHJcbiAgICogQ2FsbHMgdGhlIG9uUG9zaXRpb24oKSBtZXRob2Qgb2YgYSBTTVNvdW5kIG9iamVjdCBieSBJRC5cclxuICAgKlxyXG4gICAqIEBwYXJhbSB7c3RyaW5nfSBzSUQgVGhlIElEIG9mIHRoZSBzb3VuZFxyXG4gICAqIEBwYXJhbSB7bnVtYmVyfSBuUG9zaXRpb24gVGhlIHBvc2l0aW9uIHRvIHdhdGNoIGZvclxyXG4gICAqIEBwYXJhbSB7ZnVuY3Rpb259IG9NZXRob2QgVGhlIHJlbGV2YW50IGNhbGxiYWNrIHRvIGZpcmVcclxuICAgKiBAcGFyYW0ge29iamVjdH0gb1Njb3BlIE9wdGlvbmFsOiBUaGUgc2NvcGUgdG8gYXBwbHkgdGhlIGNhbGxiYWNrIHRvXHJcbiAgICogQHJldHVybiB7U01Tb3VuZH0gVGhlIFNNU291bmQgb2JqZWN0XHJcbiAgICovXHJcblxyXG4gIHRoaXMub25Qb3NpdGlvbiA9IGZ1bmN0aW9uKHNJRCwgblBvc2l0aW9uLCBvTWV0aG9kLCBvU2NvcGUpIHtcclxuXHJcbiAgICBpZiAoIWlkQ2hlY2soc0lEKSkge1xyXG4gICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICB9XHJcbiAgICByZXR1cm4gc20yLnNvdW5kc1tzSURdLm9ucG9zaXRpb24oblBvc2l0aW9uLCBvTWV0aG9kLCBvU2NvcGUpO1xyXG5cclxuICB9O1xyXG5cclxuICAvLyBsZWdhY3kvYmFja3dhcmRzLWNvbXBhYmlsaXR5OiBsb3dlci1jYXNlIG1ldGhvZCBuYW1lXHJcbiAgdGhpcy5vbnBvc2l0aW9uID0gdGhpcy5vblBvc2l0aW9uO1xyXG5cclxuICAvKipcclxuICAgKiBDYWxscyB0aGUgY2xlYXJPblBvc2l0aW9uKCkgbWV0aG9kIG9mIGEgU01Tb3VuZCBvYmplY3QgYnkgSUQuXHJcbiAgICpcclxuICAgKiBAcGFyYW0ge3N0cmluZ30gc0lEIFRoZSBJRCBvZiB0aGUgc291bmRcclxuICAgKiBAcGFyYW0ge251bWJlcn0gblBvc2l0aW9uIFRoZSBwb3NpdGlvbiB0byB3YXRjaCBmb3JcclxuICAgKiBAcGFyYW0ge2Z1bmN0aW9ufSBvTWV0aG9kIE9wdGlvbmFsOiBUaGUgcmVsZXZhbnQgY2FsbGJhY2sgdG8gZmlyZVxyXG4gICAqIEByZXR1cm4ge1NNU291bmR9IFRoZSBTTVNvdW5kIG9iamVjdFxyXG4gICAqL1xyXG5cclxuICB0aGlzLmNsZWFyT25Qb3NpdGlvbiA9IGZ1bmN0aW9uKHNJRCwgblBvc2l0aW9uLCBvTWV0aG9kKSB7XHJcblxyXG4gICAgaWYgKCFpZENoZWNrKHNJRCkpIHtcclxuICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgfVxyXG4gICAgcmV0dXJuIHNtMi5zb3VuZHNbc0lEXS5jbGVhck9uUG9zaXRpb24oblBvc2l0aW9uLCBvTWV0aG9kKTtcclxuXHJcbiAgfTtcclxuXHJcbiAgLyoqXHJcbiAgICogQ2FsbHMgdGhlIHBsYXkoKSBtZXRob2Qgb2YgYSBTTVNvdW5kIG9iamVjdCBieSBJRC5cclxuICAgKlxyXG4gICAqIEBwYXJhbSB7c3RyaW5nfSBzSUQgVGhlIElEIG9mIHRoZSBzb3VuZFxyXG4gICAqIEBwYXJhbSB7b2JqZWN0fSBvT3B0aW9ucyBPcHRpb25hbDogU291bmQgb3B0aW9uc1xyXG4gICAqIEByZXR1cm4ge1NNU291bmR9IFRoZSBTTVNvdW5kIG9iamVjdFxyXG4gICAqL1xyXG5cclxuICB0aGlzLnBsYXkgPSBmdW5jdGlvbihzSUQsIG9PcHRpb25zKSB7XHJcblxyXG4gICAgdmFyIHJlc3VsdCA9IG51bGwsXHJcbiAgICAgICAgLy8gbGVnYWN5IGZ1bmN0aW9uLW92ZXJsb2FkaW5nIHVzZSBjYXNlOiBwbGF5KCdteVNvdW5kJywgJy9wYXRoL3RvL3NvbWUubXAzJyk7XHJcbiAgICAgICAgb3ZlcmxvYWRlZCA9IChvT3B0aW9ucyAmJiAhKG9PcHRpb25zIGluc3RhbmNlb2YgT2JqZWN0KSk7XHJcblxyXG4gICAgaWYgKCFkaWRJbml0IHx8ICFzbTIub2soKSkge1xyXG4gICAgICBjb21wbGFpbihzbSArICcucGxheSgpOiAnICsgc3RyKCFkaWRJbml0Pydub3RSZWFkeSc6J25vdE9LJykpO1xyXG4gICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICB9XHJcblxyXG4gICAgaWYgKCFpZENoZWNrKHNJRCwgb3ZlcmxvYWRlZCkpIHtcclxuXHJcbiAgICAgIGlmICghb3ZlcmxvYWRlZCkge1xyXG4gICAgICAgIC8vIG5vIHNvdW5kIGZvdW5kIGZvciB0aGUgZ2l2ZW4gSUQuIEJhaWwuXHJcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgICB9XHJcblxyXG4gICAgICBpZiAob3ZlcmxvYWRlZCkge1xyXG4gICAgICAgIG9PcHRpb25zID0ge1xyXG4gICAgICAgICAgdXJsOiBvT3B0aW9uc1xyXG4gICAgICAgIH07XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIGlmIChvT3B0aW9ucyAmJiBvT3B0aW9ucy51cmwpIHtcclxuICAgICAgICAvLyBvdmVybG9hZGluZyB1c2UgY2FzZSwgY3JlYXRlK3BsYXk6IC5wbGF5KCdzb21lSUQnLCB7dXJsOicvcGF0aC90by5tcDMnfSk7XHJcbiAgICAgICAgc20yLl93RChzbSArICcucGxheSgpOiBBdHRlbXB0aW5nIHRvIGNyZWF0ZSBcIicgKyBzSUQgKyAnXCInLCAxKTtcclxuICAgICAgICBvT3B0aW9ucy5pZCA9IHNJRDtcclxuICAgICAgICByZXN1bHQgPSBzbTIuY3JlYXRlU291bmQob09wdGlvbnMpLnBsYXkoKTtcclxuICAgICAgfVxyXG5cclxuICAgIH0gZWxzZSBpZiAob3ZlcmxvYWRlZCkge1xyXG5cclxuICAgICAgLy8gZXhpc3Rpbmcgc291bmQgb2JqZWN0IGNhc2VcclxuICAgICAgb09wdGlvbnMgPSB7XHJcbiAgICAgICAgdXJsOiBvT3B0aW9uc1xyXG4gICAgICB9O1xyXG5cclxuICAgIH1cclxuXHJcbiAgICBpZiAocmVzdWx0ID09PSBudWxsKSB7XHJcbiAgICAgIC8vIGRlZmF1bHQgY2FzZVxyXG4gICAgICByZXN1bHQgPSBzbTIuc291bmRzW3NJRF0ucGxheShvT3B0aW9ucyk7XHJcbiAgICB9XHJcblxyXG4gICAgcmV0dXJuIHJlc3VsdDtcclxuXHJcbiAgfTtcclxuXHJcbiAgdGhpcy5zdGFydCA9IHRoaXMucGxheTsgLy8ganVzdCBmb3IgY29udmVuaWVuY2VcclxuXHJcbiAgLyoqXHJcbiAgICogQ2FsbHMgdGhlIHNldFBvc2l0aW9uKCkgbWV0aG9kIG9mIGEgU01Tb3VuZCBvYmplY3QgYnkgSUQuXHJcbiAgICpcclxuICAgKiBAcGFyYW0ge3N0cmluZ30gc0lEIFRoZSBJRCBvZiB0aGUgc291bmRcclxuICAgKiBAcGFyYW0ge251bWJlcn0gbk1zZWNPZmZzZXQgUG9zaXRpb24gKG1pbGxpc2Vjb25kcylcclxuICAgKiBAcmV0dXJuIHtTTVNvdW5kfSBUaGUgU01Tb3VuZCBvYmplY3RcclxuICAgKi9cclxuXHJcbiAgdGhpcy5zZXRQb3NpdGlvbiA9IGZ1bmN0aW9uKHNJRCwgbk1zZWNPZmZzZXQpIHtcclxuXHJcbiAgICBpZiAoIWlkQ2hlY2soc0lEKSkge1xyXG4gICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICB9XHJcbiAgICByZXR1cm4gc20yLnNvdW5kc1tzSURdLnNldFBvc2l0aW9uKG5Nc2VjT2Zmc2V0KTtcclxuXHJcbiAgfTtcclxuXHJcbiAgLyoqXHJcbiAgICogQ2FsbHMgdGhlIHN0b3AoKSBtZXRob2Qgb2YgYSBTTVNvdW5kIG9iamVjdCBieSBJRC5cclxuICAgKlxyXG4gICAqIEBwYXJhbSB7c3RyaW5nfSBzSUQgVGhlIElEIG9mIHRoZSBzb3VuZFxyXG4gICAqIEByZXR1cm4ge1NNU291bmR9IFRoZSBTTVNvdW5kIG9iamVjdFxyXG4gICAqL1xyXG5cclxuICB0aGlzLnN0b3AgPSBmdW5jdGlvbihzSUQpIHtcclxuXHJcbiAgICBpZiAoIWlkQ2hlY2soc0lEKSkge1xyXG4gICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICB9XHJcblxyXG4gICAgc20yLl93RChzbSArICcuc3RvcCgnICsgc0lEICsgJyknLCAxKTtcclxuICAgIHJldHVybiBzbTIuc291bmRzW3NJRF0uc3RvcCgpO1xyXG5cclxuICB9O1xyXG5cclxuICAvKipcclxuICAgKiBTdG9wcyBhbGwgY3VycmVudGx5LXBsYXlpbmcgc291bmRzLlxyXG4gICAqL1xyXG5cclxuICB0aGlzLnN0b3BBbGwgPSBmdW5jdGlvbigpIHtcclxuXHJcbiAgICB2YXIgb1NvdW5kO1xyXG4gICAgc20yLl93RChzbSArICcuc3RvcEFsbCgpJywgMSk7XHJcblxyXG4gICAgZm9yIChvU291bmQgaW4gc20yLnNvdW5kcykge1xyXG4gICAgICBpZiAoc20yLnNvdW5kcy5oYXNPd25Qcm9wZXJ0eShvU291bmQpKSB7XHJcbiAgICAgICAgLy8gYXBwbHkgb25seSB0byBzb3VuZCBvYmplY3RzXHJcbiAgICAgICAgc20yLnNvdW5kc1tvU291bmRdLnN0b3AoKTtcclxuICAgICAgfVxyXG4gICAgfVxyXG5cclxuICB9O1xyXG5cclxuICAvKipcclxuICAgKiBDYWxscyB0aGUgcGF1c2UoKSBtZXRob2Qgb2YgYSBTTVNvdW5kIG9iamVjdCBieSBJRC5cclxuICAgKlxyXG4gICAqIEBwYXJhbSB7c3RyaW5nfSBzSUQgVGhlIElEIG9mIHRoZSBzb3VuZFxyXG4gICAqIEByZXR1cm4ge1NNU291bmR9IFRoZSBTTVNvdW5kIG9iamVjdFxyXG4gICAqL1xyXG5cclxuICB0aGlzLnBhdXNlID0gZnVuY3Rpb24oc0lEKSB7XHJcblxyXG4gICAgaWYgKCFpZENoZWNrKHNJRCkpIHtcclxuICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgfVxyXG4gICAgcmV0dXJuIHNtMi5zb3VuZHNbc0lEXS5wYXVzZSgpO1xyXG5cclxuICB9O1xyXG5cclxuICAvKipcclxuICAgKiBQYXVzZXMgYWxsIGN1cnJlbnRseS1wbGF5aW5nIHNvdW5kcy5cclxuICAgKi9cclxuXHJcbiAgdGhpcy5wYXVzZUFsbCA9IGZ1bmN0aW9uKCkge1xyXG5cclxuICAgIHZhciBpO1xyXG4gICAgZm9yIChpID0gc20yLnNvdW5kSURzLmxlbmd0aC0xOyBpID49IDA7IGktLSkge1xyXG4gICAgICBzbTIuc291bmRzW3NtMi5zb3VuZElEc1tpXV0ucGF1c2UoKTtcclxuICAgIH1cclxuXHJcbiAgfTtcclxuXHJcbiAgLyoqXHJcbiAgICogQ2FsbHMgdGhlIHJlc3VtZSgpIG1ldGhvZCBvZiBhIFNNU291bmQgb2JqZWN0IGJ5IElELlxyXG4gICAqXHJcbiAgICogQHBhcmFtIHtzdHJpbmd9IHNJRCBUaGUgSUQgb2YgdGhlIHNvdW5kXHJcbiAgICogQHJldHVybiB7U01Tb3VuZH0gVGhlIFNNU291bmQgb2JqZWN0XHJcbiAgICovXHJcblxyXG4gIHRoaXMucmVzdW1lID0gZnVuY3Rpb24oc0lEKSB7XHJcblxyXG4gICAgaWYgKCFpZENoZWNrKHNJRCkpIHtcclxuICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgfVxyXG4gICAgcmV0dXJuIHNtMi5zb3VuZHNbc0lEXS5yZXN1bWUoKTtcclxuXHJcbiAgfTtcclxuXHJcbiAgLyoqXHJcbiAgICogUmVzdW1lcyBhbGwgY3VycmVudGx5LXBhdXNlZCBzb3VuZHMuXHJcbiAgICovXHJcblxyXG4gIHRoaXMucmVzdW1lQWxsID0gZnVuY3Rpb24oKSB7XHJcblxyXG4gICAgdmFyIGk7XHJcbiAgICBmb3IgKGkgPSBzbTIuc291bmRJRHMubGVuZ3RoLTE7IGkgPj0gMDsgaS0tKSB7XHJcbiAgICAgIHNtMi5zb3VuZHNbc20yLnNvdW5kSURzW2ldXS5yZXN1bWUoKTtcclxuICAgIH1cclxuXHJcbiAgfTtcclxuXHJcbiAgLyoqXHJcbiAgICogQ2FsbHMgdGhlIHRvZ2dsZVBhdXNlKCkgbWV0aG9kIG9mIGEgU01Tb3VuZCBvYmplY3QgYnkgSUQuXHJcbiAgICpcclxuICAgKiBAcGFyYW0ge3N0cmluZ30gc0lEIFRoZSBJRCBvZiB0aGUgc291bmRcclxuICAgKiBAcmV0dXJuIHtTTVNvdW5kfSBUaGUgU01Tb3VuZCBvYmplY3RcclxuICAgKi9cclxuXHJcbiAgdGhpcy50b2dnbGVQYXVzZSA9IGZ1bmN0aW9uKHNJRCkge1xyXG5cclxuICAgIGlmICghaWRDaGVjayhzSUQpKSB7XHJcbiAgICAgIHJldHVybiBmYWxzZTtcclxuICAgIH1cclxuICAgIHJldHVybiBzbTIuc291bmRzW3NJRF0udG9nZ2xlUGF1c2UoKTtcclxuXHJcbiAgfTtcclxuXHJcbiAgLyoqXHJcbiAgICogQ2FsbHMgdGhlIHNldFBhbigpIG1ldGhvZCBvZiBhIFNNU291bmQgb2JqZWN0IGJ5IElELlxyXG4gICAqXHJcbiAgICogQHBhcmFtIHtzdHJpbmd9IHNJRCBUaGUgSUQgb2YgdGhlIHNvdW5kXHJcbiAgICogQHBhcmFtIHtudW1iZXJ9IG5QYW4gVGhlIHBhbiB2YWx1ZSAoLTEwMCB0byAxMDApXHJcbiAgICogQHJldHVybiB7U01Tb3VuZH0gVGhlIFNNU291bmQgb2JqZWN0XHJcbiAgICovXHJcblxyXG4gIHRoaXMuc2V0UGFuID0gZnVuY3Rpb24oc0lELCBuUGFuKSB7XHJcblxyXG4gICAgaWYgKCFpZENoZWNrKHNJRCkpIHtcclxuICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgfVxyXG4gICAgcmV0dXJuIHNtMi5zb3VuZHNbc0lEXS5zZXRQYW4oblBhbik7XHJcblxyXG4gIH07XHJcblxyXG4gIC8qKlxyXG4gICAqIENhbGxzIHRoZSBzZXRWb2x1bWUoKSBtZXRob2Qgb2YgYSBTTVNvdW5kIG9iamVjdCBieSBJRC5cclxuICAgKlxyXG4gICAqIEBwYXJhbSB7c3RyaW5nfSBzSUQgVGhlIElEIG9mIHRoZSBzb3VuZFxyXG4gICAqIEBwYXJhbSB7bnVtYmVyfSBuVm9sIFRoZSB2b2x1bWUgdmFsdWUgKDAgdG8gMTAwKVxyXG4gICAqIEByZXR1cm4ge1NNU291bmR9IFRoZSBTTVNvdW5kIG9iamVjdFxyXG4gICAqL1xyXG5cclxuICB0aGlzLnNldFZvbHVtZSA9IGZ1bmN0aW9uKHNJRCwgblZvbCkge1xyXG5cclxuICAgIGlmICghaWRDaGVjayhzSUQpKSB7XHJcbiAgICAgIHJldHVybiBmYWxzZTtcclxuICAgIH1cclxuICAgIHJldHVybiBzbTIuc291bmRzW3NJRF0uc2V0Vm9sdW1lKG5Wb2wpO1xyXG5cclxuICB9O1xyXG5cclxuICAvKipcclxuICAgKiBDYWxscyB0aGUgbXV0ZSgpIG1ldGhvZCBvZiBlaXRoZXIgYSBzaW5nbGUgU01Tb3VuZCBvYmplY3QgYnkgSUQsIG9yIGFsbCBzb3VuZCBvYmplY3RzLlxyXG4gICAqXHJcbiAgICogQHBhcmFtIHtzdHJpbmd9IHNJRCBPcHRpb25hbDogVGhlIElEIG9mIHRoZSBzb3VuZCAoaWYgb21pdHRlZCwgYWxsIHNvdW5kcyB3aWxsIGJlIHVzZWQuKVxyXG4gICAqL1xyXG5cclxuICB0aGlzLm11dGUgPSBmdW5jdGlvbihzSUQpIHtcclxuXHJcbiAgICB2YXIgaSA9IDA7XHJcblxyXG4gICAgaWYgKHNJRCBpbnN0YW5jZW9mIFN0cmluZykge1xyXG4gICAgICBzSUQgPSBudWxsO1xyXG4gICAgfVxyXG5cclxuICAgIGlmICghc0lEKSB7XHJcblxyXG4gICAgICBzbTIuX3dEKHNtICsgJy5tdXRlKCk6IE11dGluZyBhbGwgc291bmRzJyk7XHJcbiAgICAgIGZvciAoaSA9IHNtMi5zb3VuZElEcy5sZW5ndGgtMTsgaSA+PSAwOyBpLS0pIHtcclxuICAgICAgICBzbTIuc291bmRzW3NtMi5zb3VuZElEc1tpXV0ubXV0ZSgpO1xyXG4gICAgICB9XHJcbiAgICAgIHNtMi5tdXRlZCA9IHRydWU7XHJcblxyXG4gICAgfSBlbHNlIHtcclxuXHJcbiAgICAgIGlmICghaWRDaGVjayhzSUQpKSB7XHJcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgICB9XHJcbiAgICAgIHNtMi5fd0Qoc20gKyAnLm11dGUoKTogTXV0aW5nIFwiJyArIHNJRCArICdcIicpO1xyXG4gICAgICByZXR1cm4gc20yLnNvdW5kc1tzSURdLm11dGUoKTtcclxuXHJcbiAgICB9XHJcblxyXG4gICAgcmV0dXJuIHRydWU7XHJcblxyXG4gIH07XHJcblxyXG4gIC8qKlxyXG4gICAqIE11dGVzIGFsbCBzb3VuZHMuXHJcbiAgICovXHJcblxyXG4gIHRoaXMubXV0ZUFsbCA9IGZ1bmN0aW9uKCkge1xyXG5cclxuICAgIHNtMi5tdXRlKCk7XHJcblxyXG4gIH07XHJcblxyXG4gIC8qKlxyXG4gICAqIENhbGxzIHRoZSB1bm11dGUoKSBtZXRob2Qgb2YgZWl0aGVyIGEgc2luZ2xlIFNNU291bmQgb2JqZWN0IGJ5IElELCBvciBhbGwgc291bmQgb2JqZWN0cy5cclxuICAgKlxyXG4gICAqIEBwYXJhbSB7c3RyaW5nfSBzSUQgT3B0aW9uYWw6IFRoZSBJRCBvZiB0aGUgc291bmQgKGlmIG9taXR0ZWQsIGFsbCBzb3VuZHMgd2lsbCBiZSB1c2VkLilcclxuICAgKi9cclxuXHJcbiAgdGhpcy51bm11dGUgPSBmdW5jdGlvbihzSUQpIHtcclxuXHJcbiAgICB2YXIgaTtcclxuXHJcbiAgICBpZiAoc0lEIGluc3RhbmNlb2YgU3RyaW5nKSB7XHJcbiAgICAgIHNJRCA9IG51bGw7XHJcbiAgICB9XHJcblxyXG4gICAgaWYgKCFzSUQpIHtcclxuXHJcbiAgICAgIHNtMi5fd0Qoc20gKyAnLnVubXV0ZSgpOiBVbm11dGluZyBhbGwgc291bmRzJyk7XHJcbiAgICAgIGZvciAoaSA9IHNtMi5zb3VuZElEcy5sZW5ndGgtMTsgaSA+PSAwOyBpLS0pIHtcclxuICAgICAgICBzbTIuc291bmRzW3NtMi5zb3VuZElEc1tpXV0udW5tdXRlKCk7XHJcbiAgICAgIH1cclxuICAgICAgc20yLm11dGVkID0gZmFsc2U7XHJcblxyXG4gICAgfSBlbHNlIHtcclxuXHJcbiAgICAgIGlmICghaWRDaGVjayhzSUQpKSB7XHJcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgICB9XHJcbiAgICAgIHNtMi5fd0Qoc20gKyAnLnVubXV0ZSgpOiBVbm11dGluZyBcIicgKyBzSUQgKyAnXCInKTtcclxuICAgICAgcmV0dXJuIHNtMi5zb3VuZHNbc0lEXS51bm11dGUoKTtcclxuXHJcbiAgICB9XHJcblxyXG4gICAgcmV0dXJuIHRydWU7XHJcblxyXG4gIH07XHJcblxyXG4gIC8qKlxyXG4gICAqIFVubXV0ZXMgYWxsIHNvdW5kcy5cclxuICAgKi9cclxuXHJcbiAgdGhpcy51bm11dGVBbGwgPSBmdW5jdGlvbigpIHtcclxuXHJcbiAgICBzbTIudW5tdXRlKCk7XHJcblxyXG4gIH07XHJcblxyXG4gIC8qKlxyXG4gICAqIENhbGxzIHRoZSB0b2dnbGVNdXRlKCkgbWV0aG9kIG9mIGEgU01Tb3VuZCBvYmplY3QgYnkgSUQuXHJcbiAgICpcclxuICAgKiBAcGFyYW0ge3N0cmluZ30gc0lEIFRoZSBJRCBvZiB0aGUgc291bmRcclxuICAgKiBAcmV0dXJuIHtTTVNvdW5kfSBUaGUgU01Tb3VuZCBvYmplY3RcclxuICAgKi9cclxuXHJcbiAgdGhpcy50b2dnbGVNdXRlID0gZnVuY3Rpb24oc0lEKSB7XHJcblxyXG4gICAgaWYgKCFpZENoZWNrKHNJRCkpIHtcclxuICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgfVxyXG4gICAgcmV0dXJuIHNtMi5zb3VuZHNbc0lEXS50b2dnbGVNdXRlKCk7XHJcblxyXG4gIH07XHJcblxyXG4gIC8qKlxyXG4gICAqIFJldHJpZXZlcyB0aGUgbWVtb3J5IHVzZWQgYnkgdGhlIGZsYXNoIHBsdWdpbi5cclxuICAgKlxyXG4gICAqIEByZXR1cm4ge251bWJlcn0gVGhlIGFtb3VudCBvZiBtZW1vcnkgaW4gdXNlXHJcbiAgICovXHJcblxyXG4gIHRoaXMuZ2V0TWVtb3J5VXNlID0gZnVuY3Rpb24oKSB7XHJcblxyXG4gICAgLy8gZmxhc2gtb25seVxyXG4gICAgdmFyIHJhbSA9IDA7XHJcblxyXG4gICAgaWYgKGZsYXNoICYmIGZWICE9PSA4KSB7XHJcbiAgICAgIHJhbSA9IHBhcnNlSW50KGZsYXNoLl9nZXRNZW1vcnlVc2UoKSwgMTApO1xyXG4gICAgfVxyXG5cclxuICAgIHJldHVybiByYW07XHJcblxyXG4gIH07XHJcblxyXG4gIC8qKlxyXG4gICAqIFVuZG9jdW1lbnRlZDogTk9QcyBzb3VuZE1hbmFnZXIgYW5kIGFsbCBTTVNvdW5kIG9iamVjdHMuXHJcbiAgICovXHJcblxyXG4gIHRoaXMuZGlzYWJsZSA9IGZ1bmN0aW9uKGJOb0Rpc2FibGUpIHtcclxuXHJcbiAgICAvLyBkZXN0cm95IGFsbCBmdW5jdGlvbnNcclxuICAgIHZhciBpO1xyXG5cclxuICAgIGlmIChiTm9EaXNhYmxlID09PSBfdW5kZWZpbmVkKSB7XHJcbiAgICAgIGJOb0Rpc2FibGUgPSBmYWxzZTtcclxuICAgIH1cclxuXHJcbiAgICBpZiAoZGlzYWJsZWQpIHtcclxuICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgfVxyXG5cclxuICAgIGRpc2FibGVkID0gdHJ1ZTtcclxuICAgIF93RFMoJ3NodXRkb3duJywgMSk7XHJcblxyXG4gICAgZm9yIChpID0gc20yLnNvdW5kSURzLmxlbmd0aC0xOyBpID49IDA7IGktLSkge1xyXG4gICAgICBkaXNhYmxlT2JqZWN0KHNtMi5zb3VuZHNbc20yLnNvdW5kSURzW2ldXSk7XHJcbiAgICB9XHJcblxyXG4gICAgLy8gZmlyZSBcImNvbXBsZXRlXCIsIGRlc3BpdGUgZmFpbFxyXG4gICAgaW5pdENvbXBsZXRlKGJOb0Rpc2FibGUpO1xyXG4gICAgZXZlbnQucmVtb3ZlKHdpbmRvdywgJ2xvYWQnLCBpbml0VXNlck9ubG9hZCk7XHJcblxyXG4gICAgcmV0dXJuIHRydWU7XHJcblxyXG4gIH07XHJcblxyXG4gIC8qKlxyXG4gICAqIERldGVybWluZXMgcGxheWFiaWxpdHkgb2YgYSBNSU1FIHR5cGUsIGVnLiAnYXVkaW8vbXAzJy5cclxuICAgKi9cclxuXHJcbiAgdGhpcy5jYW5QbGF5TUlNRSA9IGZ1bmN0aW9uKHNNSU1FKSB7XHJcblxyXG4gICAgdmFyIHJlc3VsdDtcclxuXHJcbiAgICBpZiAoc20yLmhhc0hUTUw1KSB7XHJcbiAgICAgIHJlc3VsdCA9IGh0bWw1Q2FuUGxheSh7dHlwZTpzTUlNRX0pO1xyXG4gICAgfVxyXG5cclxuICAgIGlmICghcmVzdWx0ICYmIG5lZWRzRmxhc2gpIHtcclxuICAgICAgLy8gaWYgZmxhc2ggOSwgdGVzdCBuZXRTdHJlYW0gKG1vdmllU3RhcikgdHlwZXMgYXMgd2VsbC5cclxuICAgICAgcmVzdWx0ID0gKHNNSU1FICYmIHNtMi5vaygpID8gISEoKGZWID4gOCA/IHNNSU1FLm1hdGNoKG5ldFN0cmVhbU1pbWVUeXBlcykgOiBudWxsKSB8fCBzTUlNRS5tYXRjaChzbTIubWltZVBhdHRlcm4pKSA6IG51bGwpOyAvLyBUT0RPOiBtYWtlIGxlc3MgXCJ3ZWlyZFwiIChwZXIgSlNMaW50KVxyXG4gICAgfVxyXG5cclxuICAgIHJldHVybiByZXN1bHQ7XHJcblxyXG4gIH07XHJcblxyXG4gIC8qKlxyXG4gICAqIERldGVybWluZXMgcGxheWFiaWxpdHkgb2YgYSBVUkwgYmFzZWQgb24gYXVkaW8gc3VwcG9ydC5cclxuICAgKlxyXG4gICAqIEBwYXJhbSB7c3RyaW5nfSBzVVJMIFRoZSBVUkwgdG8gdGVzdFxyXG4gICAqIEByZXR1cm4ge2Jvb2xlYW59IFVSTCBwbGF5YWJpbGl0eVxyXG4gICAqL1xyXG5cclxuICB0aGlzLmNhblBsYXlVUkwgPSBmdW5jdGlvbihzVVJMKSB7XHJcblxyXG4gICAgdmFyIHJlc3VsdDtcclxuXHJcbiAgICBpZiAoc20yLmhhc0hUTUw1KSB7XHJcbiAgICAgIHJlc3VsdCA9IGh0bWw1Q2FuUGxheSh7dXJsOiBzVVJMfSk7XHJcbiAgICB9XHJcblxyXG4gICAgaWYgKCFyZXN1bHQgJiYgbmVlZHNGbGFzaCkge1xyXG4gICAgICByZXN1bHQgPSAoc1VSTCAmJiBzbTIub2soKSA/ICEhKHNVUkwubWF0Y2goc20yLmZpbGVQYXR0ZXJuKSkgOiBudWxsKTtcclxuICAgIH1cclxuXHJcbiAgICByZXR1cm4gcmVzdWx0O1xyXG5cclxuICB9O1xyXG5cclxuICAvKipcclxuICAgKiBEZXRlcm1pbmVzIHBsYXlhYmlsaXR5IG9mIGFuIEhUTUwgRE9NICZsdDthJmd0OyBvYmplY3QgKG9yIHNpbWlsYXIgb2JqZWN0IGxpdGVyYWwpIGJhc2VkIG9uIGF1ZGlvIHN1cHBvcnQuXHJcbiAgICpcclxuICAgKiBAcGFyYW0ge29iamVjdH0gb0xpbmsgYW4gSFRNTCBET00gJmx0O2EmZ3Q7IG9iamVjdCBvciBvYmplY3QgbGl0ZXJhbCBpbmNsdWRpbmcgaHJlZiBhbmQvb3IgdHlwZSBhdHRyaWJ1dGVzXHJcbiAgICogQHJldHVybiB7Ym9vbGVhbn0gVVJMIHBsYXlhYmlsaXR5XHJcbiAgICovXHJcblxyXG4gIHRoaXMuY2FuUGxheUxpbmsgPSBmdW5jdGlvbihvTGluaykge1xyXG5cclxuICAgIGlmIChvTGluay50eXBlICE9PSBfdW5kZWZpbmVkICYmIG9MaW5rLnR5cGUpIHtcclxuICAgICAgaWYgKHNtMi5jYW5QbGF5TUlNRShvTGluay50eXBlKSkge1xyXG4gICAgICAgIHJldHVybiB0cnVlO1xyXG4gICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgcmV0dXJuIHNtMi5jYW5QbGF5VVJMKG9MaW5rLmhyZWYpO1xyXG5cclxuICB9O1xyXG5cclxuICAvKipcclxuICAgKiBSZXRyaWV2ZXMgYSBTTVNvdW5kIG9iamVjdCBieSBJRC5cclxuICAgKlxyXG4gICAqIEBwYXJhbSB7c3RyaW5nfSBzSUQgVGhlIElEIG9mIHRoZSBzb3VuZFxyXG4gICAqIEByZXR1cm4ge1NNU291bmR9IFRoZSBTTVNvdW5kIG9iamVjdFxyXG4gICAqL1xyXG5cclxuICB0aGlzLmdldFNvdW5kQnlJZCA9IGZ1bmN0aW9uKHNJRCwgX3N1cHByZXNzRGVidWcpIHtcclxuXHJcbiAgICBpZiAoIXNJRCkge1xyXG4gICAgICByZXR1cm4gbnVsbDtcclxuICAgIH1cclxuXHJcbiAgICB2YXIgcmVzdWx0ID0gc20yLnNvdW5kc1tzSURdO1xyXG5cclxuICAgIC8vIDxkPlxyXG4gICAgaWYgKCFyZXN1bHQgJiYgIV9zdXBwcmVzc0RlYnVnKSB7XHJcbiAgICAgIHNtMi5fd0Qoc20gKyAnLmdldFNvdW5kQnlJZCgpOiBTb3VuZCBcIicgKyBzSUQgKyAnXCIgbm90IGZvdW5kLicsIDIpO1xyXG4gICAgfVxyXG4gICAgLy8gPC9kPlxyXG5cclxuICAgIHJldHVybiByZXN1bHQ7XHJcblxyXG4gIH07XHJcblxyXG4gIC8qKlxyXG4gICAqIFF1ZXVlcyBhIGNhbGxiYWNrIGZvciBleGVjdXRpb24gd2hlbiBTb3VuZE1hbmFnZXIgaGFzIHN1Y2Nlc3NmdWxseSBpbml0aWFsaXplZC5cclxuICAgKlxyXG4gICAqIEBwYXJhbSB7ZnVuY3Rpb259IG9NZXRob2QgVGhlIGNhbGxiYWNrIG1ldGhvZCB0byBmaXJlXHJcbiAgICogQHBhcmFtIHtvYmplY3R9IG9TY29wZSBPcHRpb25hbDogVGhlIHNjb3BlIHRvIGFwcGx5IHRvIHRoZSBjYWxsYmFja1xyXG4gICAqL1xyXG5cclxuICB0aGlzLm9ucmVhZHkgPSBmdW5jdGlvbihvTWV0aG9kLCBvU2NvcGUpIHtcclxuXHJcbiAgICB2YXIgc1R5cGUgPSAnb25yZWFkeScsXHJcbiAgICAgICAgcmVzdWx0ID0gZmFsc2U7XHJcblxyXG4gICAgaWYgKHR5cGVvZiBvTWV0aG9kID09PSAnZnVuY3Rpb24nKSB7XHJcblxyXG4gICAgICAvLyA8ZD5cclxuICAgICAgaWYgKGRpZEluaXQpIHtcclxuICAgICAgICBzbTIuX3dEKHN0cigncXVldWUnLCBzVHlwZSkpO1xyXG4gICAgICB9XHJcbiAgICAgIC8vIDwvZD5cclxuXHJcbiAgICAgIGlmICghb1Njb3BlKSB7XHJcbiAgICAgICAgb1Njb3BlID0gd2luZG93O1xyXG4gICAgICB9XHJcblxyXG4gICAgICBhZGRPbkV2ZW50KHNUeXBlLCBvTWV0aG9kLCBvU2NvcGUpO1xyXG4gICAgICBwcm9jZXNzT25FdmVudHMoKTtcclxuXHJcbiAgICAgIHJlc3VsdCA9IHRydWU7XHJcblxyXG4gICAgfSBlbHNlIHtcclxuXHJcbiAgICAgIHRocm93IHN0cignbmVlZEZ1bmN0aW9uJywgc1R5cGUpO1xyXG5cclxuICAgIH1cclxuXHJcbiAgICByZXR1cm4gcmVzdWx0O1xyXG5cclxuICB9O1xyXG5cclxuICAvKipcclxuICAgKiBRdWV1ZXMgYSBjYWxsYmFjayBmb3IgZXhlY3V0aW9uIHdoZW4gU291bmRNYW5hZ2VyIGhhcyBmYWlsZWQgdG8gaW5pdGlhbGl6ZS5cclxuICAgKlxyXG4gICAqIEBwYXJhbSB7ZnVuY3Rpb259IG9NZXRob2QgVGhlIGNhbGxiYWNrIG1ldGhvZCB0byBmaXJlXHJcbiAgICogQHBhcmFtIHtvYmplY3R9IG9TY29wZSBPcHRpb25hbDogVGhlIHNjb3BlIHRvIGFwcGx5IHRvIHRoZSBjYWxsYmFja1xyXG4gICAqL1xyXG5cclxuICB0aGlzLm9udGltZW91dCA9IGZ1bmN0aW9uKG9NZXRob2QsIG9TY29wZSkge1xyXG5cclxuICAgIHZhciBzVHlwZSA9ICdvbnRpbWVvdXQnLFxyXG4gICAgICAgIHJlc3VsdCA9IGZhbHNlO1xyXG5cclxuICAgIGlmICh0eXBlb2Ygb01ldGhvZCA9PT0gJ2Z1bmN0aW9uJykge1xyXG5cclxuICAgICAgLy8gPGQ+XHJcbiAgICAgIGlmIChkaWRJbml0KSB7XHJcbiAgICAgICAgc20yLl93RChzdHIoJ3F1ZXVlJywgc1R5cGUpKTtcclxuICAgICAgfVxyXG4gICAgICAvLyA8L2Q+XHJcblxyXG4gICAgICBpZiAoIW9TY29wZSkge1xyXG4gICAgICAgIG9TY29wZSA9IHdpbmRvdztcclxuICAgICAgfVxyXG5cclxuICAgICAgYWRkT25FdmVudChzVHlwZSwgb01ldGhvZCwgb1Njb3BlKTtcclxuICAgICAgcHJvY2Vzc09uRXZlbnRzKHt0eXBlOnNUeXBlfSk7XHJcblxyXG4gICAgICByZXN1bHQgPSB0cnVlO1xyXG5cclxuICAgIH0gZWxzZSB7XHJcblxyXG4gICAgICB0aHJvdyBzdHIoJ25lZWRGdW5jdGlvbicsIHNUeXBlKTtcclxuXHJcbiAgICB9XHJcblxyXG4gICAgcmV0dXJuIHJlc3VsdDtcclxuXHJcbiAgfTtcclxuXHJcbiAgLyoqXHJcbiAgICogV3JpdGVzIGNvbnNvbGUubG9nKCktc3R5bGUgZGVidWcgb3V0cHV0IHRvIGEgY29uc29sZSBvciBpbi1icm93c2VyIGVsZW1lbnQuXHJcbiAgICogQXBwbGllcyB3aGVuIGRlYnVnTW9kZSA9IHRydWVcclxuICAgKlxyXG4gICAqIEBwYXJhbSB7c3RyaW5nfSBzVGV4dCBUaGUgY29uc29sZSBtZXNzYWdlXHJcbiAgICogQHBhcmFtIHtvYmplY3R9IG5UeXBlIE9wdGlvbmFsIGxvZyBsZXZlbCAobnVtYmVyKSwgb3Igb2JqZWN0LiBOdW1iZXIgY2FzZTogTG9nIHR5cGUvc3R5bGUgd2hlcmUgMCA9ICdpbmZvJywgMSA9ICd3YXJuJywgMiA9ICdlcnJvcicuIE9iamVjdCBjYXNlOiBPYmplY3QgdG8gYmUgZHVtcGVkLlxyXG4gICAqL1xyXG5cclxuICB0aGlzLl93cml0ZURlYnVnID0gZnVuY3Rpb24oc1RleHQsIHNUeXBlT3JPYmplY3QpIHtcclxuXHJcbiAgICAvLyBwc2V1ZG8tcHJpdmF0ZSBjb25zb2xlLmxvZygpLXN0eWxlIG91dHB1dFxyXG4gICAgLy8gPGQ+XHJcblxyXG4gICAgdmFyIHNESUQgPSAnc291bmRtYW5hZ2VyLWRlYnVnJywgbywgb0l0ZW07XHJcblxyXG4gICAgaWYgKCFzbTIuZGVidWdNb2RlKSB7XHJcbiAgICAgIHJldHVybiBmYWxzZTtcclxuICAgIH1cclxuXHJcbiAgICBpZiAoaGFzQ29uc29sZSAmJiBzbTIudXNlQ29uc29sZSkge1xyXG4gICAgICBpZiAoc1R5cGVPck9iamVjdCAmJiB0eXBlb2Ygc1R5cGVPck9iamVjdCA9PT0gJ29iamVjdCcpIHtcclxuICAgICAgICAvLyBvYmplY3QgcGFzc2VkOyBkdW1wIHRvIGNvbnNvbGUuXHJcbiAgICAgICAgY29uc29sZS5sb2coc1RleHQsIHNUeXBlT3JPYmplY3QpO1xyXG4gICAgICB9IGVsc2UgaWYgKGRlYnVnTGV2ZWxzW3NUeXBlT3JPYmplY3RdICE9PSBfdW5kZWZpbmVkKSB7XHJcbiAgICAgICAgY29uc29sZVtkZWJ1Z0xldmVsc1tzVHlwZU9yT2JqZWN0XV0oc1RleHQpO1xyXG4gICAgICB9IGVsc2Uge1xyXG4gICAgICAgIGNvbnNvbGUubG9nKHNUZXh0KTtcclxuICAgICAgfVxyXG4gICAgICBpZiAoc20yLmNvbnNvbGVPbmx5KSB7XHJcbiAgICAgICAgcmV0dXJuIHRydWU7XHJcbiAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBvID0gaWQoc0RJRCk7XHJcblxyXG4gICAgaWYgKCFvKSB7XHJcbiAgICAgIHJldHVybiBmYWxzZTtcclxuICAgIH1cclxuXHJcbiAgICBvSXRlbSA9IGRvYy5jcmVhdGVFbGVtZW50KCdkaXYnKTtcclxuXHJcbiAgICBpZiAoKyt3ZENvdW50ICUgMiA9PT0gMCkge1xyXG4gICAgICBvSXRlbS5jbGFzc05hbWUgPSAnc20yLWFsdCc7XHJcbiAgICB9XHJcblxyXG4gICAgaWYgKHNUeXBlT3JPYmplY3QgPT09IF91bmRlZmluZWQpIHtcclxuICAgICAgc1R5cGVPck9iamVjdCA9IDA7XHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICBzVHlwZU9yT2JqZWN0ID0gcGFyc2VJbnQoc1R5cGVPck9iamVjdCwgMTApO1xyXG4gICAgfVxyXG5cclxuICAgIG9JdGVtLmFwcGVuZENoaWxkKGRvYy5jcmVhdGVUZXh0Tm9kZShzVGV4dCkpO1xyXG5cclxuICAgIGlmIChzVHlwZU9yT2JqZWN0KSB7XHJcbiAgICAgIGlmIChzVHlwZU9yT2JqZWN0ID49IDIpIHtcclxuICAgICAgICBvSXRlbS5zdHlsZS5mb250V2VpZ2h0ID0gJ2JvbGQnO1xyXG4gICAgICB9XHJcbiAgICAgIGlmIChzVHlwZU9yT2JqZWN0ID09PSAzKSB7XHJcbiAgICAgICAgb0l0ZW0uc3R5bGUuY29sb3IgPSAnI2ZmMzMzMyc7XHJcbiAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICAvLyB0b3AtdG8tYm90dG9tXHJcbiAgICAvLyBvLmFwcGVuZENoaWxkKG9JdGVtKTtcclxuXHJcbiAgICAvLyBib3R0b20tdG8tdG9wXHJcbiAgICBvLmluc2VydEJlZm9yZShvSXRlbSwgby5maXJzdENoaWxkKTtcclxuXHJcbiAgICBvID0gbnVsbDtcclxuICAgIC8vIDwvZD5cclxuXHJcbiAgICByZXR1cm4gdHJ1ZTtcclxuXHJcbiAgfTtcclxuXHJcbiAgLy8gPGQ+XHJcbiAgLy8gbGFzdC1yZXNvcnQgZGVidWdnaW5nIG9wdGlvblxyXG4gIGlmICh3bC5pbmRleE9mKCdzbTItZGVidWc9YWxlcnQnKSAhPT0gLTEpIHtcclxuICAgIHRoaXMuX3dyaXRlRGVidWcgPSBmdW5jdGlvbihzVGV4dCkge1xyXG4gICAgICB3aW5kb3cuYWxlcnQoc1RleHQpO1xyXG4gICAgfTtcclxuICB9XHJcbiAgLy8gPC9kPlxyXG5cclxuICAvLyBhbGlhc1xyXG4gIHRoaXMuX3dEID0gdGhpcy5fd3JpdGVEZWJ1ZztcclxuXHJcbiAgLyoqXHJcbiAgICogUHJvdmlkZXMgZGVidWcgLyBzdGF0ZSBpbmZvcm1hdGlvbiBvbiBhbGwgU01Tb3VuZCBvYmplY3RzLlxyXG4gICAqL1xyXG5cclxuICB0aGlzLl9kZWJ1ZyA9IGZ1bmN0aW9uKCkge1xyXG5cclxuICAgIC8vIDxkPlxyXG4gICAgdmFyIGksIGo7XHJcbiAgICBfd0RTKCdjdXJyZW50T2JqJywgMSk7XHJcblxyXG4gICAgZm9yIChpID0gMCwgaiA9IHNtMi5zb3VuZElEcy5sZW5ndGg7IGkgPCBqOyBpKyspIHtcclxuICAgICAgc20yLnNvdW5kc1tzbTIuc291bmRJRHNbaV1dLl9kZWJ1ZygpO1xyXG4gICAgfVxyXG4gICAgLy8gPC9kPlxyXG5cclxuICB9O1xyXG5cclxuICAvKipcclxuICAgKiBSZXN0YXJ0cyBhbmQgcmUtaW5pdGlhbGl6ZXMgdGhlIFNvdW5kTWFuYWdlciBpbnN0YW5jZS5cclxuICAgKlxyXG4gICAqIEBwYXJhbSB7Ym9vbGVhbn0gcmVzZXRFdmVudHMgT3B0aW9uYWw6IFdoZW4gdHJ1ZSwgcmVtb3ZlcyBhbGwgcmVnaXN0ZXJlZCBvbnJlYWR5IGFuZCBvbnRpbWVvdXQgZXZlbnQgY2FsbGJhY2tzLlxyXG4gICAqIEBwYXJhbSB7Ym9vbGVhbn0gZXhjbHVkZUluaXQgT3B0aW9uczogV2hlbiB0cnVlLCBkb2VzIG5vdCBjYWxsIGJlZ2luRGVsYXllZEluaXQoKSAod2hpY2ggd291bGQgcmVzdGFydCBTTTIpLlxyXG4gICAqIEByZXR1cm4ge29iamVjdH0gc291bmRNYW5hZ2VyIFRoZSBzb3VuZE1hbmFnZXIgaW5zdGFuY2UuXHJcbiAgICovXHJcblxyXG4gIHRoaXMucmVib290ID0gZnVuY3Rpb24ocmVzZXRFdmVudHMsIGV4Y2x1ZGVJbml0KSB7XHJcblxyXG4gICAgLy8gcmVzZXQgc29tZSAob3IgYWxsKSBzdGF0ZSwgYW5kIHJlLWluaXQgdW5sZXNzIG90aGVyd2lzZSBzcGVjaWZpZWQuXHJcblxyXG4gICAgLy8gPGQ+XHJcbiAgICBpZiAoc20yLnNvdW5kSURzLmxlbmd0aCkge1xyXG4gICAgICBzbTIuX3dEKCdEZXN0cm95aW5nICcgKyBzbTIuc291bmRJRHMubGVuZ3RoICsgJyBTTVNvdW5kIG9iamVjdCcgKyAoc20yLnNvdW5kSURzLmxlbmd0aCAhPT0gMSA/ICdzJyA6ICcnKSArICcuLi4nKTtcclxuICAgIH1cclxuICAgIC8vIDwvZD5cclxuXHJcbiAgICB2YXIgaSwgaiwgaztcclxuXHJcbiAgICBmb3IgKGkgPSBzbTIuc291bmRJRHMubGVuZ3RoLTE7IGkgPj0gMDsgaS0tKSB7XHJcbiAgICAgIHNtMi5zb3VuZHNbc20yLnNvdW5kSURzW2ldXS5kZXN0cnVjdCgpO1xyXG4gICAgfVxyXG5cclxuICAgIC8vIHRyYXNoIHplIGZsYXNoIChyZW1vdmUgZnJvbSB0aGUgRE9NKVxyXG5cclxuICAgIGlmIChmbGFzaCkge1xyXG5cclxuICAgICAgdHJ5IHtcclxuXHJcbiAgICAgICAgaWYgKGlzSUUpIHtcclxuICAgICAgICAgIG9SZW1vdmVkSFRNTCA9IGZsYXNoLmlubmVySFRNTDtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIG9SZW1vdmVkID0gZmxhc2gucGFyZW50Tm9kZS5yZW1vdmVDaGlsZChmbGFzaCk7XHJcblxyXG4gICAgICB9IGNhdGNoKGUpIHtcclxuXHJcbiAgICAgICAgLy8gUmVtb3ZlIGZhaWxlZD8gTWF5IGJlIGR1ZSB0byBmbGFzaCBibG9ja2VycyBzaWxlbnRseSByZW1vdmluZyB0aGUgU1dGIG9iamVjdC9lbWJlZCBub2RlIGZyb20gdGhlIERPTS4gV2FybiBhbmQgY29udGludWUuXHJcblxyXG4gICAgICAgIF93RFMoJ2JhZFJlbW92ZScsIDIpO1xyXG5cclxuICAgICAgfVxyXG5cclxuICAgIH1cclxuXHJcbiAgICAvLyBhY3R1YWxseSwgZm9yY2UgcmVjcmVhdGUgb2YgbW92aWUuXHJcblxyXG4gICAgb1JlbW92ZWRIVE1MID0gb1JlbW92ZWQgPSBuZWVkc0ZsYXNoID0gZmxhc2ggPSBudWxsO1xyXG5cclxuICAgIHNtMi5lbmFibGVkID0gZGlkRENMb2FkZWQgPSBkaWRJbml0ID0gd2FpdGluZ0ZvckVJID0gaW5pdFBlbmRpbmcgPSBkaWRBcHBlbmQgPSBhcHBlbmRTdWNjZXNzID0gZGlzYWJsZWQgPSB1c2VHbG9iYWxIVE1MNUF1ZGlvID0gc20yLnN3ZkxvYWRlZCA9IGZhbHNlO1xyXG5cclxuICAgIHNtMi5zb3VuZElEcyA9IFtdO1xyXG4gICAgc20yLnNvdW5kcyA9IHt9O1xyXG5cclxuICAgIGlkQ291bnRlciA9IDA7XHJcblxyXG4gICAgaWYgKCFyZXNldEV2ZW50cykge1xyXG4gICAgICAvLyByZXNldCBjYWxsYmFja3MgZm9yIG9ucmVhZHksIG9udGltZW91dCBldGMuIHNvIHRoYXQgdGhleSB3aWxsIGZpcmUgYWdhaW4gb24gcmUtaW5pdFxyXG4gICAgICBmb3IgKGkgaW4gb25fcXVldWUpIHtcclxuICAgICAgICBpZiAob25fcXVldWUuaGFzT3duUHJvcGVydHkoaSkpIHtcclxuICAgICAgICAgIGZvciAoaiA9IDAsIGsgPSBvbl9xdWV1ZVtpXS5sZW5ndGg7IGogPCBrOyBqKyspIHtcclxuICAgICAgICAgICAgb25fcXVldWVbaV1bal0uZmlyZWQgPSBmYWxzZTtcclxuICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuICAgIH0gZWxzZSB7XHJcbiAgICAgIC8vIHJlbW92ZSBhbGwgY2FsbGJhY2tzIGVudGlyZWx5XHJcbiAgICAgIG9uX3F1ZXVlID0gW107XHJcbiAgICB9XHJcblxyXG4gICAgLy8gPGQ+XHJcbiAgICBpZiAoIWV4Y2x1ZGVJbml0KSB7XHJcbiAgICAgIHNtMi5fd0Qoc20gKyAnOiBSZWJvb3RpbmcuLi4nKTtcclxuICAgIH1cclxuICAgIC8vIDwvZD5cclxuXHJcbiAgICAvLyByZXNldCBIVE1MNSBhbmQgZmxhc2ggY2FuUGxheSB0ZXN0IHJlc3VsdHNcclxuXHJcbiAgICBzbTIuaHRtbDUgPSB7XHJcbiAgICAgICd1c2luZ0ZsYXNoJzogbnVsbFxyXG4gICAgfTtcclxuXHJcbiAgICBzbTIuZmxhc2ggPSB7fTtcclxuXHJcbiAgICAvLyByZXNldCBkZXZpY2Utc3BlY2lmaWMgSFRNTC9mbGFzaCBtb2RlIHN3aXRjaGVzXHJcblxyXG4gICAgc20yLmh0bWw1T25seSA9IGZhbHNlO1xyXG4gICAgc20yLmlnbm9yZUZsYXNoID0gZmFsc2U7XHJcblxyXG4gICAgd2luZG93LnNldFRpbWVvdXQoZnVuY3Rpb24oKSB7XHJcblxyXG4gICAgICBwcmVJbml0KCk7XHJcblxyXG4gICAgICAvLyBieSBkZWZhdWx0LCByZS1pbml0XHJcblxyXG4gICAgICBpZiAoIWV4Y2x1ZGVJbml0KSB7XHJcbiAgICAgICAgc20yLmJlZ2luRGVsYXllZEluaXQoKTtcclxuICAgICAgfVxyXG5cclxuICAgIH0sIDIwKTtcclxuXHJcbiAgICByZXR1cm4gc20yO1xyXG5cclxuICB9O1xyXG5cclxuICB0aGlzLnJlc2V0ID0gZnVuY3Rpb24oKSB7XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBTaHV0cyBkb3duIGFuZCByZXN0b3JlcyB0aGUgU291bmRNYW5hZ2VyIGluc3RhbmNlIHRvIGl0cyBvcmlnaW5hbCBsb2FkZWQgc3RhdGUsIHdpdGhvdXQgYW4gZXhwbGljaXQgcmVib290LiBBbGwgb25yZWFkeS9vbnRpbWVvdXQgaGFuZGxlcnMgYXJlIHJlbW92ZWQuXHJcbiAgICAgKiBBZnRlciB0aGlzIGNhbGwsIFNNMiBtYXkgYmUgcmUtaW5pdGlhbGl6ZWQgdmlhIHNvdW5kTWFuYWdlci5iZWdpbkRlbGF5ZWRJbml0KCkuXHJcbiAgICAgKiBAcmV0dXJuIHtvYmplY3R9IHNvdW5kTWFuYWdlciBUaGUgc291bmRNYW5hZ2VyIGluc3RhbmNlLlxyXG4gICAgICovXHJcblxyXG4gICAgX3dEUygncmVzZXQnKTtcclxuICAgIHJldHVybiBzbTIucmVib290KHRydWUsIHRydWUpO1xyXG5cclxuICB9O1xyXG5cclxuICAvKipcclxuICAgKiBVbmRvY3VtZW50ZWQ6IERldGVybWluZXMgdGhlIFNNMiBmbGFzaCBtb3ZpZSdzIGxvYWQgcHJvZ3Jlc3MuXHJcbiAgICpcclxuICAgKiBAcmV0dXJuIHtudW1iZXIgb3IgbnVsbH0gUGVyY2VudCBsb2FkZWQsIG9yIGlmIGludmFsaWQvdW5zdXBwb3J0ZWQsIG51bGwuXHJcbiAgICovXHJcblxyXG4gIHRoaXMuZ2V0TW92aWVQZXJjZW50ID0gZnVuY3Rpb24oKSB7XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBJbnRlcmVzdGluZyBzeW50YXggbm90ZXMuLi5cclxuICAgICAqIEZsYXNoL0V4dGVybmFsSW50ZXJmYWNlIChBY3RpdmVYL05QQVBJKSBicmlkZ2UgbWV0aG9kcyBhcmUgbm90IHR5cGVvZiBcImZ1bmN0aW9uXCIgbm9yIGluc3RhbmNlb2YgRnVuY3Rpb24sIGJ1dCBhcmUgc3RpbGwgdmFsaWQuXHJcbiAgICAgKiBBZGRpdGlvbmFsbHksIEpTTGludCBkaXNsaWtlcyAoJ1BlcmNlbnRMb2FkZWQnIGluIGZsYXNoKS1zdHlsZSBzeW50YXggYW5kIHJlY29tbWVuZHMgaGFzT3duUHJvcGVydHkoKSwgd2hpY2ggZG9lcyBub3Qgd29yayBpbiB0aGlzIGNhc2UuXHJcbiAgICAgKiBGdXJ0aGVybW9yZSwgdXNpbmcgKGZsYXNoICYmIGZsYXNoLlBlcmNlbnRMb2FkZWQpIGNhdXNlcyBJRSB0byB0aHJvdyBcIm9iamVjdCBkb2Vzbid0IHN1cHBvcnQgdGhpcyBwcm9wZXJ0eSBvciBtZXRob2RcIi5cclxuICAgICAqIFRodXMsICdpbicgc3ludGF4IG11c3QgYmUgdXNlZC5cclxuICAgICAqL1xyXG5cclxuICAgIHJldHVybiAoZmxhc2ggJiYgJ1BlcmNlbnRMb2FkZWQnIGluIGZsYXNoID8gZmxhc2guUGVyY2VudExvYWRlZCgpIDogbnVsbCk7IC8vIFllcywgSlNMaW50LiBTZWUgbmVhcmJ5IGNvbW1lbnQgaW4gc291cmNlIGZvciBleHBsYW5hdGlvbi5cclxuXHJcbiAgfTtcclxuXHJcbiAgLyoqXHJcbiAgICogQWRkaXRpb25hbCBoZWxwZXIgZm9yIG1hbnVhbGx5IGludm9raW5nIFNNMidzIGluaXQgcHJvY2VzcyBhZnRlciBET00gUmVhZHkgLyB3aW5kb3cub25sb2FkKCkuXHJcbiAgICovXHJcblxyXG4gIHRoaXMuYmVnaW5EZWxheWVkSW5pdCA9IGZ1bmN0aW9uKCkge1xyXG5cclxuICAgIHdpbmRvd0xvYWRlZCA9IHRydWU7XHJcbiAgICBkb21Db250ZW50TG9hZGVkKCk7XHJcblxyXG4gICAgc2V0VGltZW91dChmdW5jdGlvbigpIHtcclxuXHJcbiAgICAgIGlmIChpbml0UGVuZGluZykge1xyXG4gICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgICAgfVxyXG5cclxuICAgICAgY3JlYXRlTW92aWUoKTtcclxuICAgICAgaW5pdE1vdmllKCk7XHJcbiAgICAgIGluaXRQZW5kaW5nID0gdHJ1ZTtcclxuXHJcbiAgICAgIHJldHVybiB0cnVlO1xyXG5cclxuICAgIH0sIDIwKTtcclxuXHJcbiAgICBkZWxheVdhaXRGb3JFSSgpO1xyXG5cclxuICB9O1xyXG5cclxuICAvKipcclxuICAgKiBEZXN0cm95cyB0aGUgU291bmRNYW5hZ2VyIGluc3RhbmNlIGFuZCBhbGwgU01Tb3VuZCBpbnN0YW5jZXMuXHJcbiAgICovXHJcblxyXG4gIHRoaXMuZGVzdHJ1Y3QgPSBmdW5jdGlvbigpIHtcclxuXHJcbiAgICBzbTIuX3dEKHNtICsgJy5kZXN0cnVjdCgpJyk7XHJcbiAgICBzbTIuZGlzYWJsZSh0cnVlKTtcclxuXHJcbiAgfTtcclxuXHJcbiAgLyoqXHJcbiAgICogU01Tb3VuZCgpIChzb3VuZCBvYmplY3QpIGNvbnN0cnVjdG9yXHJcbiAgICogLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXHJcbiAgICpcclxuICAgKiBAcGFyYW0ge29iamVjdH0gb09wdGlvbnMgU291bmQgb3B0aW9ucyAoaWQgYW5kIHVybCBhcmUgcmVxdWlyZWQgYXR0cmlidXRlcylcclxuICAgKiBAcmV0dXJuIHtTTVNvdW5kfSBUaGUgbmV3IFNNU291bmQgb2JqZWN0XHJcbiAgICovXHJcblxyXG4gIFNNU291bmQgPSBmdW5jdGlvbihvT3B0aW9ucykge1xyXG5cclxuICAgIHZhciBzID0gdGhpcywgcmVzZXRQcm9wZXJ0aWVzLCBhZGRfaHRtbDVfZXZlbnRzLCByZW1vdmVfaHRtbDVfZXZlbnRzLCBzdG9wX2h0bWw1X3RpbWVyLCBzdGFydF9odG1sNV90aW1lciwgYXR0YWNoT25Qb3NpdGlvbiwgb25wbGF5X2NhbGxlZCA9IGZhbHNlLCBvblBvc2l0aW9uSXRlbXMgPSBbXSwgb25Qb3NpdGlvbkZpcmVkID0gMCwgZGV0YWNoT25Qb3NpdGlvbiwgYXBwbHlGcm9tVG8sIGxhc3RVUkwgPSBudWxsLCBsYXN0SFRNTDVTdGF0ZSwgdXJsT21pdHRlZDtcclxuXHJcbiAgICBsYXN0SFRNTDVTdGF0ZSA9IHtcclxuICAgICAgLy8gdHJhY2tzIGR1cmF0aW9uICsgcG9zaXRpb24gKHRpbWUpXHJcbiAgICAgIGR1cmF0aW9uOiBudWxsLFxyXG4gICAgICB0aW1lOiBudWxsXHJcbiAgICB9O1xyXG5cclxuICAgIHRoaXMuaWQgPSBvT3B0aW9ucy5pZDtcclxuXHJcbiAgICAvLyBsZWdhY3lcclxuICAgIHRoaXMuc0lEID0gdGhpcy5pZDtcclxuXHJcbiAgICB0aGlzLnVybCA9IG9PcHRpb25zLnVybDtcclxuICAgIHRoaXMub3B0aW9ucyA9IG1peGluKG9PcHRpb25zKTtcclxuXHJcbiAgICAvLyBwZXItcGxheS1pbnN0YW5jZS1zcGVjaWZpYyBvcHRpb25zXHJcbiAgICB0aGlzLmluc3RhbmNlT3B0aW9ucyA9IHRoaXMub3B0aW9ucztcclxuXHJcbiAgICAvLyBzaG9ydCBhbGlhc1xyXG4gICAgdGhpcy5faU8gPSB0aGlzLmluc3RhbmNlT3B0aW9ucztcclxuXHJcbiAgICAvLyBhc3NpZ24gcHJvcGVydHkgZGVmYXVsdHNcclxuICAgIHRoaXMucGFuID0gdGhpcy5vcHRpb25zLnBhbjtcclxuICAgIHRoaXMudm9sdW1lID0gdGhpcy5vcHRpb25zLnZvbHVtZTtcclxuXHJcbiAgICAvLyB3aGV0aGVyIG9yIG5vdCB0aGlzIG9iamVjdCBpcyB1c2luZyBIVE1MNVxyXG4gICAgdGhpcy5pc0hUTUw1ID0gZmFsc2U7XHJcblxyXG4gICAgLy8gaW50ZXJuYWwgSFRNTDUgQXVkaW8oKSBvYmplY3QgcmVmZXJlbmNlXHJcbiAgICB0aGlzLl9hID0gbnVsbDtcclxuXHJcbiAgICAvLyBmb3IgZmxhc2ggOCBzcGVjaWFsLWNhc2UgY3JlYXRlU291bmQoKSB3aXRob3V0IHVybCwgZm9sbG93ZWQgYnkgbG9hZC9wbGF5IHdpdGggdXJsIGNhc2VcclxuICAgIHVybE9taXR0ZWQgPSAodGhpcy51cmwgPyBmYWxzZSA6IHRydWUpO1xyXG5cclxuICAgIC8qKlxyXG4gICAgICogU01Tb3VuZCgpIHB1YmxpYyBtZXRob2RzXHJcbiAgICAgKiAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cclxuICAgICAqL1xyXG5cclxuICAgIHRoaXMuaWQzID0ge307XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBXcml0ZXMgU01Tb3VuZCBvYmplY3QgcGFyYW1ldGVycyB0byBkZWJ1ZyBjb25zb2xlXHJcbiAgICAgKi9cclxuXHJcbiAgICB0aGlzLl9kZWJ1ZyA9IGZ1bmN0aW9uKCkge1xyXG5cclxuICAgICAgLy8gPGQ+XHJcbiAgICAgIHNtMi5fd0Qocy5pZCArICc6IE1lcmdlZCBvcHRpb25zOicsIHMub3B0aW9ucyk7XHJcbiAgICAgIC8vIDwvZD5cclxuXHJcbiAgICB9O1xyXG5cclxuICAgIC8qKlxyXG4gICAgICogQmVnaW5zIGxvYWRpbmcgYSBzb3VuZCBwZXIgaXRzICp1cmwqLlxyXG4gICAgICpcclxuICAgICAqIEBwYXJhbSB7b2JqZWN0fSBvT3B0aW9ucyBPcHRpb25hbDogU291bmQgb3B0aW9uc1xyXG4gICAgICogQHJldHVybiB7U01Tb3VuZH0gVGhlIFNNU291bmQgb2JqZWN0XHJcbiAgICAgKi9cclxuXHJcbiAgICB0aGlzLmxvYWQgPSBmdW5jdGlvbihvT3B0aW9ucykge1xyXG5cclxuICAgICAgdmFyIG9Tb3VuZCA9IG51bGwsIGluc3RhbmNlT3B0aW9ucztcclxuXHJcbiAgICAgIGlmIChvT3B0aW9ucyAhPT0gX3VuZGVmaW5lZCkge1xyXG4gICAgICAgIHMuX2lPID0gbWl4aW4ob09wdGlvbnMsIHMub3B0aW9ucyk7XHJcbiAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgb09wdGlvbnMgPSBzLm9wdGlvbnM7XHJcbiAgICAgICAgcy5faU8gPSBvT3B0aW9ucztcclxuICAgICAgICBpZiAobGFzdFVSTCAmJiBsYXN0VVJMICE9PSBzLnVybCkge1xyXG4gICAgICAgICAgX3dEUygnbWFuVVJMJyk7XHJcbiAgICAgICAgICBzLl9pTy51cmwgPSBzLnVybDtcclxuICAgICAgICAgIHMudXJsID0gbnVsbDtcclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIGlmICghcy5faU8udXJsKSB7XHJcbiAgICAgICAgcy5faU8udXJsID0gcy51cmw7XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIHMuX2lPLnVybCA9IHBhcnNlVVJMKHMuX2lPLnVybCk7XHJcblxyXG4gICAgICAvLyBlbnN1cmUgd2UncmUgaW4gc3luY1xyXG4gICAgICBzLmluc3RhbmNlT3B0aW9ucyA9IHMuX2lPO1xyXG5cclxuICAgICAgLy8gbG9jYWwgc2hvcnRjdXRcclxuICAgICAgaW5zdGFuY2VPcHRpb25zID0gcy5faU87XHJcblxyXG4gICAgICBzbTIuX3dEKHMuaWQgKyAnOiBsb2FkICgnICsgaW5zdGFuY2VPcHRpb25zLnVybCArICcpJyk7XHJcblxyXG4gICAgICBpZiAoIWluc3RhbmNlT3B0aW9ucy51cmwgJiYgIXMudXJsKSB7XHJcbiAgICAgICAgc20yLl93RChzLmlkICsgJzogbG9hZCgpOiB1cmwgaXMgdW5hc3NpZ25lZC4gRXhpdGluZy4nLCAyKTtcclxuICAgICAgICByZXR1cm4gcztcclxuICAgICAgfVxyXG5cclxuICAgICAgLy8gPGQ+XHJcbiAgICAgIGlmICghcy5pc0hUTUw1ICYmIGZWID09PSA4ICYmICFzLnVybCAmJiAhaW5zdGFuY2VPcHRpb25zLmF1dG9QbGF5KSB7XHJcbiAgICAgICAgLy8gZmxhc2ggOCBsb2FkKCkgLT4gcGxheSgpIHdvbid0IHdvcmsgYmVmb3JlIG9ubG9hZCBoYXMgZmlyZWQuXHJcbiAgICAgICAgc20yLl93RChzLmlkICsgJzogRmxhc2ggOCBsb2FkKCkgbGltaXRhdGlvbjogV2FpdCBmb3Igb25sb2FkKCkgYmVmb3JlIGNhbGxpbmcgcGxheSgpLicsIDEpO1xyXG4gICAgICB9XHJcbiAgICAgIC8vIDwvZD5cclxuXHJcbiAgICAgIGlmIChpbnN0YW5jZU9wdGlvbnMudXJsID09PSBzLnVybCAmJiBzLnJlYWR5U3RhdGUgIT09IDAgJiYgcy5yZWFkeVN0YXRlICE9PSAyKSB7XHJcbiAgICAgICAgX3dEUygnb25VUkwnLCAxKTtcclxuICAgICAgICAvLyBpZiBsb2FkZWQgYW5kIGFuIG9ubG9hZCgpIGV4aXN0cywgZmlyZSBpbW1lZGlhdGVseS5cclxuICAgICAgICBpZiAocy5yZWFkeVN0YXRlID09PSAzICYmIGluc3RhbmNlT3B0aW9ucy5vbmxvYWQpIHtcclxuICAgICAgICAgIC8vIGFzc3VtZSBzdWNjZXNzIGJhc2VkIG9uIHRydXRoeSBkdXJhdGlvbi5cclxuICAgICAgICAgIHdyYXBDYWxsYmFjayhzLCBmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgaW5zdGFuY2VPcHRpb25zLm9ubG9hZC5hcHBseShzLCBbKCEhcy5kdXJhdGlvbildKTtcclxuICAgICAgICAgIH0pO1xyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gcztcclxuICAgICAgfVxyXG5cclxuICAgICAgLy8gcmVzZXQgYSBmZXcgc3RhdGUgcHJvcGVydGllc1xyXG5cclxuICAgICAgcy5sb2FkZWQgPSBmYWxzZTtcclxuICAgICAgcy5yZWFkeVN0YXRlID0gMTtcclxuICAgICAgcy5wbGF5U3RhdGUgPSAwO1xyXG4gICAgICBzLmlkMyA9IHt9O1xyXG5cclxuICAgICAgLy8gVE9ETzogSWYgc3dpdGNoaW5nIGZyb20gSFRNTDUgLT4gZmxhc2ggKG9yIHZpY2UgdmVyc2EpLCBzdG9wIGN1cnJlbnRseS1wbGF5aW5nIGF1ZGlvLlxyXG5cclxuICAgICAgaWYgKGh0bWw1T0soaW5zdGFuY2VPcHRpb25zKSkge1xyXG5cclxuICAgICAgICBvU291bmQgPSBzLl9zZXR1cF9odG1sNShpbnN0YW5jZU9wdGlvbnMpO1xyXG5cclxuICAgICAgICBpZiAoIW9Tb3VuZC5fY2FsbGVkX2xvYWQpIHtcclxuXHJcbiAgICAgICAgICBzLl9odG1sNV9jYW5wbGF5ID0gZmFsc2U7XHJcblxyXG4gICAgICAgICAgLy8gVE9ETzogcmV2aWV3IGNhbGxlZF9sb2FkIC8gaHRtbDVfY2FucGxheSBsb2dpY1xyXG5cclxuICAgICAgICAgIC8vIGlmIHVybCBwcm92aWRlZCBkaXJlY3RseSB0byBsb2FkKCksIGFzc2lnbiBpdCBoZXJlLlxyXG5cclxuICAgICAgICAgIGlmIChzLnVybCAhPT0gaW5zdGFuY2VPcHRpb25zLnVybCkge1xyXG5cclxuICAgICAgICAgICAgc20yLl93RChfd0RTKCdtYW5VUkwnKSArICc6ICcgKyBpbnN0YW5jZU9wdGlvbnMudXJsKTtcclxuXHJcbiAgICAgICAgICAgIHMuX2Euc3JjID0gaW5zdGFuY2VPcHRpb25zLnVybDtcclxuXHJcbiAgICAgICAgICAgIC8vIFRPRE86IHJldmlldyAvIHJlLWFwcGx5IGFsbCByZWxldmFudCBvcHRpb25zICh2b2x1bWUsIGxvb3AsIG9ucG9zaXRpb24gZXRjLilcclxuXHJcbiAgICAgICAgICAgIC8vIHJlc2V0IHBvc2l0aW9uIGZvciBuZXcgVVJMXHJcbiAgICAgICAgICAgIHMuc2V0UG9zaXRpb24oMCk7XHJcblxyXG4gICAgICAgICAgfVxyXG5cclxuICAgICAgICAgIC8vIGdpdmVuIGV4cGxpY2l0IGxvYWQgY2FsbCwgdHJ5IHRvIHByZWxvYWQuXHJcblxyXG4gICAgICAgICAgLy8gZWFybHkgSFRNTDUgaW1wbGVtZW50YXRpb24gKG5vbi1zdGFuZGFyZClcclxuICAgICAgICAgIHMuX2EuYXV0b2J1ZmZlciA9ICdhdXRvJztcclxuXHJcbiAgICAgICAgICAvLyBzdGFuZGFyZCBwcm9wZXJ0eSwgdmFsdWVzOiBub25lIC8gbWV0YWRhdGEgLyBhdXRvXHJcbiAgICAgICAgICAvLyByZWZlcmVuY2U6IGh0dHA6Ly9tc2RuLm1pY3Jvc29mdC5jb20vZW4tdXMvbGlicmFyeS9pZS9mZjk3NDc1OSUyOHY9dnMuODUlMjkuYXNweFxyXG4gICAgICAgICAgcy5fYS5wcmVsb2FkID0gJ2F1dG8nO1xyXG5cclxuICAgICAgICAgIHMuX2EuX2NhbGxlZF9sb2FkID0gdHJ1ZTtcclxuXHJcbiAgICAgICAgfSBlbHNlIHtcclxuXHJcbiAgICAgICAgICBzbTIuX3dEKHMuaWQgKyAnOiBJZ25vcmluZyByZXF1ZXN0IHRvIGxvYWQgYWdhaW4nKTtcclxuXHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgfSBlbHNlIHtcclxuXHJcbiAgICAgICAgaWYgKHNtMi5odG1sNU9ubHkpIHtcclxuICAgICAgICAgIHNtMi5fd0Qocy5pZCArICc6IE5vIGZsYXNoIHN1cHBvcnQuIEV4aXRpbmcuJyk7XHJcbiAgICAgICAgICByZXR1cm4gcztcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGlmIChzLl9pTy51cmwgJiYgcy5faU8udXJsLm1hdGNoKC9kYXRhXFw6L2kpKSB7XHJcbiAgICAgICAgICAvLyBkYXRhOiBVUklzIG5vdCBzdXBwb3J0ZWQgYnkgRmxhc2gsIGVpdGhlci5cclxuICAgICAgICAgIHNtMi5fd0Qocy5pZCArICc6IGRhdGE6IFVSSXMgbm90IHN1cHBvcnRlZCB2aWEgRmxhc2guIEV4aXRpbmcuJyk7XHJcbiAgICAgICAgICByZXR1cm4gcztcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHRyeSB7XHJcbiAgICAgICAgICBzLmlzSFRNTDUgPSBmYWxzZTtcclxuICAgICAgICAgIHMuX2lPID0gcG9saWN5Rml4KGxvb3BGaXgoaW5zdGFuY2VPcHRpb25zKSk7XHJcbiAgICAgICAgICAvLyBpZiB3ZSBoYXZlIFwicG9zaXRpb25cIiwgZGlzYWJsZSBhdXRvLXBsYXkgYXMgd2UnbGwgYmUgc2Vla2luZyB0byB0aGF0IHBvc2l0aW9uIGF0IG9ubG9hZCgpLlxyXG4gICAgICAgICAgaWYgKHMuX2lPLmF1dG9QbGF5ICYmIChzLl9pTy5wb3NpdGlvbiB8fCBzLl9pTy5mcm9tKSkge1xyXG4gICAgICAgICAgICBzbTIuX3dEKHMuaWQgKyAnOiBEaXNhYmxpbmcgYXV0b1BsYXkgYmVjYXVzZSBvZiBub24temVybyBvZmZzZXQgY2FzZScpO1xyXG4gICAgICAgICAgICBzLl9pTy5hdXRvUGxheSA9IGZhbHNlO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgICAgLy8gcmUtYXNzaWduIGxvY2FsIHNob3J0Y3V0XHJcbiAgICAgICAgICBpbnN0YW5jZU9wdGlvbnMgPSBzLl9pTztcclxuICAgICAgICAgIGlmIChmViA9PT0gOCkge1xyXG4gICAgICAgICAgICBmbGFzaC5fbG9hZChzLmlkLCBpbnN0YW5jZU9wdGlvbnMudXJsLCBpbnN0YW5jZU9wdGlvbnMuc3RyZWFtLCBpbnN0YW5jZU9wdGlvbnMuYXV0b1BsYXksIGluc3RhbmNlT3B0aW9ucy51c2VQb2xpY3lGaWxlKTtcclxuICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIGZsYXNoLl9sb2FkKHMuaWQsIGluc3RhbmNlT3B0aW9ucy51cmwsICEhKGluc3RhbmNlT3B0aW9ucy5zdHJlYW0pLCAhIShpbnN0YW5jZU9wdGlvbnMuYXV0b1BsYXkpLCBpbnN0YW5jZU9wdGlvbnMubG9vcHN8fDEsICEhKGluc3RhbmNlT3B0aW9ucy5hdXRvTG9hZCksIGluc3RhbmNlT3B0aW9ucy51c2VQb2xpY3lGaWxlKTtcclxuICAgICAgICAgIH1cclxuICAgICAgICB9IGNhdGNoKGUpIHtcclxuICAgICAgICAgIF93RFMoJ3NtRXJyb3InLCAyKTtcclxuICAgICAgICAgIGRlYnVnVFMoJ29ubG9hZCcsIGZhbHNlKTtcclxuICAgICAgICAgIGNhdGNoRXJyb3Ioe3R5cGU6J1NNU09VTkRfTE9BRF9KU19FWENFUFRJT04nLCBmYXRhbDp0cnVlfSk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgfVxyXG5cclxuICAgICAgLy8gYWZ0ZXIgYWxsIG9mIHRoaXMsIGVuc3VyZSBzb3VuZCB1cmwgaXMgdXAgdG8gZGF0ZS5cclxuICAgICAgcy51cmwgPSBpbnN0YW5jZU9wdGlvbnMudXJsO1xyXG5cclxuICAgICAgcmV0dXJuIHM7XHJcblxyXG4gICAgfTtcclxuXHJcbiAgICAvKipcclxuICAgICAqIFVubG9hZHMgYSBzb3VuZCwgY2FuY2VsaW5nIGFueSBvcGVuIEhUVFAgcmVxdWVzdHMuXHJcbiAgICAgKlxyXG4gICAgICogQHJldHVybiB7U01Tb3VuZH0gVGhlIFNNU291bmQgb2JqZWN0XHJcbiAgICAgKi9cclxuXHJcbiAgICB0aGlzLnVubG9hZCA9IGZ1bmN0aW9uKCkge1xyXG5cclxuICAgICAgLy8gRmxhc2ggOC9BUzIgY2FuJ3QgXCJjbG9zZVwiIGEgc3RyZWFtIC0gZmFrZSBpdCBieSBsb2FkaW5nIGFuIGVtcHR5IFVSTFxyXG4gICAgICAvLyBGbGFzaCA5L0FTMzogQ2xvc2Ugc3RyZWFtLCBwcmV2ZW50aW5nIGZ1cnRoZXIgbG9hZFxyXG4gICAgICAvLyBIVE1MNTogTW9zdCBVQXMgd2lsbCB1c2UgZW1wdHkgVVJMXHJcblxyXG4gICAgICBpZiAocy5yZWFkeVN0YXRlICE9PSAwKSB7XHJcblxyXG4gICAgICAgIHNtMi5fd0Qocy5pZCArICc6IHVubG9hZCgpJyk7XHJcblxyXG4gICAgICAgIGlmICghcy5pc0hUTUw1KSB7XHJcblxyXG4gICAgICAgICAgaWYgKGZWID09PSA4KSB7XHJcbiAgICAgICAgICAgIGZsYXNoLl91bmxvYWQocy5pZCwgZW1wdHlVUkwpO1xyXG4gICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgZmxhc2guX3VubG9hZChzLmlkKTtcclxuICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgfSBlbHNlIHtcclxuXHJcbiAgICAgICAgICBzdG9wX2h0bWw1X3RpbWVyKCk7XHJcblxyXG4gICAgICAgICAgaWYgKHMuX2EpIHtcclxuXHJcbiAgICAgICAgICAgIHMuX2EucGF1c2UoKTtcclxuXHJcbiAgICAgICAgICAgIC8vIHVwZGF0ZSBlbXB0eSBVUkwsIHRvb1xyXG4gICAgICAgICAgICBsYXN0VVJMID0gaHRtbDVVbmxvYWQocy5fYSk7XHJcblxyXG4gICAgICAgICAgfVxyXG5cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8vIHJlc2V0IGxvYWQvc3RhdHVzIGZsYWdzXHJcbiAgICAgICAgcmVzZXRQcm9wZXJ0aWVzKCk7XHJcblxyXG4gICAgICB9XHJcblxyXG4gICAgICByZXR1cm4gcztcclxuXHJcbiAgICB9O1xyXG5cclxuICAgIC8qKlxyXG4gICAgICogVW5sb2FkcyBhbmQgZGVzdHJveXMgYSBzb3VuZC5cclxuICAgICAqL1xyXG5cclxuICAgIHRoaXMuZGVzdHJ1Y3QgPSBmdW5jdGlvbihfYkZyb21TTSkge1xyXG5cclxuICAgICAgc20yLl93RChzLmlkICsgJzogRGVzdHJ1Y3QnKTtcclxuXHJcbiAgICAgIGlmICghcy5pc0hUTUw1KSB7XHJcblxyXG4gICAgICAgIC8vIGtpbGwgc291bmQgd2l0aGluIEZsYXNoXHJcbiAgICAgICAgLy8gRGlzYWJsZSB0aGUgb25mYWlsdXJlIGhhbmRsZXJcclxuICAgICAgICBzLl9pTy5vbmZhaWx1cmUgPSBudWxsO1xyXG4gICAgICAgIGZsYXNoLl9kZXN0cm95U291bmQocy5pZCk7XHJcblxyXG4gICAgICB9IGVsc2Uge1xyXG5cclxuICAgICAgICBzdG9wX2h0bWw1X3RpbWVyKCk7XHJcblxyXG4gICAgICAgIGlmIChzLl9hKSB7XHJcbiAgICAgICAgICBzLl9hLnBhdXNlKCk7XHJcbiAgICAgICAgICBodG1sNVVubG9hZChzLl9hKTtcclxuICAgICAgICAgIGlmICghdXNlR2xvYmFsSFRNTDVBdWRpbykge1xyXG4gICAgICAgICAgICByZW1vdmVfaHRtbDVfZXZlbnRzKCk7XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgICAvLyBicmVhayBvYnZpb3VzIGNpcmN1bGFyIHJlZmVyZW5jZVxyXG4gICAgICAgICAgcy5fYS5fcyA9IG51bGw7XHJcbiAgICAgICAgICBzLl9hID0gbnVsbDtcclxuICAgICAgICB9XHJcblxyXG4gICAgICB9XHJcblxyXG4gICAgICBpZiAoIV9iRnJvbVNNKSB7XHJcbiAgICAgICAgLy8gZW5zdXJlIGRlbGV0aW9uIGZyb20gY29udHJvbGxlclxyXG4gICAgICAgIHNtMi5kZXN0cm95U291bmQocy5pZCwgdHJ1ZSk7XHJcbiAgICAgIH1cclxuXHJcbiAgICB9O1xyXG5cclxuICAgIC8qKlxyXG4gICAgICogQmVnaW5zIHBsYXlpbmcgYSBzb3VuZC5cclxuICAgICAqXHJcbiAgICAgKiBAcGFyYW0ge29iamVjdH0gb09wdGlvbnMgT3B0aW9uYWw6IFNvdW5kIG9wdGlvbnNcclxuICAgICAqIEByZXR1cm4ge1NNU291bmR9IFRoZSBTTVNvdW5kIG9iamVjdFxyXG4gICAgICovXHJcblxyXG4gICAgdGhpcy5wbGF5ID0gZnVuY3Rpb24ob09wdGlvbnMsIF91cGRhdGVQbGF5U3RhdGUpIHtcclxuXHJcbiAgICAgIHZhciBmTiwgYWxsb3dNdWx0aSwgYSwgb25yZWFkeSxcclxuICAgICAgICAgIGF1ZGlvQ2xvbmUsIG9uZW5kZWQsIG9uY2FucGxheSxcclxuICAgICAgICAgIHN0YXJ0T0sgPSB0cnVlLFxyXG4gICAgICAgICAgZXhpdCA9IG51bGw7XHJcblxyXG4gICAgICAvLyA8ZD5cclxuICAgICAgZk4gPSBzLmlkICsgJzogcGxheSgpOiAnO1xyXG4gICAgICAvLyA8L2Q+XHJcblxyXG4gICAgICAvLyBkZWZhdWx0IHRvIHRydWVcclxuICAgICAgX3VwZGF0ZVBsYXlTdGF0ZSA9IChfdXBkYXRlUGxheVN0YXRlID09PSBfdW5kZWZpbmVkID8gdHJ1ZSA6IF91cGRhdGVQbGF5U3RhdGUpO1xyXG5cclxuICAgICAgaWYgKCFvT3B0aW9ucykge1xyXG4gICAgICAgIG9PcHRpb25zID0ge307XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIC8vIGZpcnN0LCB1c2UgbG9jYWwgVVJMIChpZiBzcGVjaWZpZWQpXHJcbiAgICAgIGlmIChzLnVybCkge1xyXG4gICAgICAgIHMuX2lPLnVybCA9IHMudXJsO1xyXG4gICAgICB9XHJcblxyXG4gICAgICAvLyBtaXggaW4gYW55IG9wdGlvbnMgZGVmaW5lZCBhdCBjcmVhdGVTb3VuZCgpXHJcbiAgICAgIHMuX2lPID0gbWl4aW4ocy5faU8sIHMub3B0aW9ucyk7XHJcblxyXG4gICAgICAvLyBtaXggaW4gYW55IG9wdGlvbnMgc3BlY2lmaWMgdG8gdGhpcyBtZXRob2RcclxuICAgICAgcy5faU8gPSBtaXhpbihvT3B0aW9ucywgcy5faU8pO1xyXG5cclxuICAgICAgcy5faU8udXJsID0gcGFyc2VVUkwocy5faU8udXJsKTtcclxuXHJcbiAgICAgIHMuaW5zdGFuY2VPcHRpb25zID0gcy5faU87XHJcblxyXG4gICAgICAvLyBSVE1QLW9ubHlcclxuICAgICAgaWYgKCFzLmlzSFRNTDUgJiYgcy5faU8uc2VydmVyVVJMICYmICFzLmNvbm5lY3RlZCkge1xyXG4gICAgICAgIGlmICghcy5nZXRBdXRvUGxheSgpKSB7XHJcbiAgICAgICAgICBzbTIuX3dEKGZOICsnIE5ldHN0cmVhbSBub3QgY29ubmVjdGVkIHlldCAtIHNldHRpbmcgYXV0b1BsYXknKTtcclxuICAgICAgICAgIHMuc2V0QXV0b1BsYXkodHJ1ZSk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIC8vIHBsYXkgd2lsbCBiZSBjYWxsZWQgaW4gb25jb25uZWN0KClcclxuICAgICAgICByZXR1cm4gcztcclxuICAgICAgfVxyXG5cclxuICAgICAgaWYgKGh0bWw1T0socy5faU8pKSB7XHJcbiAgICAgICAgcy5fc2V0dXBfaHRtbDUocy5faU8pO1xyXG4gICAgICAgIHN0YXJ0X2h0bWw1X3RpbWVyKCk7XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIGlmIChzLnBsYXlTdGF0ZSA9PT0gMSAmJiAhcy5wYXVzZWQpIHtcclxuICAgICAgICBhbGxvd011bHRpID0gcy5faU8ubXVsdGlTaG90O1xyXG4gICAgICAgIGlmICghYWxsb3dNdWx0aSkge1xyXG4gICAgICAgICAgc20yLl93RChmTiArICdBbHJlYWR5IHBsYXlpbmcgKG9uZS1zaG90KScsIDEpO1xyXG4gICAgICAgICAgaWYgKHMuaXNIVE1MNSkge1xyXG4gICAgICAgICAgICAvLyBnbyBiYWNrIHRvIG9yaWdpbmFsIHBvc2l0aW9uLlxyXG4gICAgICAgICAgICBzLnNldFBvc2l0aW9uKHMuX2lPLnBvc2l0aW9uKTtcclxuICAgICAgICAgIH1cclxuICAgICAgICAgIGV4aXQgPSBzO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICBzbTIuX3dEKGZOICsgJ0FscmVhZHkgcGxheWluZyAobXVsdGktc2hvdCknLCAxKTtcclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIGlmIChleGl0ICE9PSBudWxsKSB7XHJcbiAgICAgICAgcmV0dXJuIGV4aXQ7XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIC8vIGVkZ2UgY2FzZTogcGxheSgpIHdpdGggZXhwbGljaXQgVVJMIHBhcmFtZXRlclxyXG4gICAgICBpZiAob09wdGlvbnMudXJsICYmIG9PcHRpb25zLnVybCAhPT0gcy51cmwpIHtcclxuXHJcbiAgICAgICAgLy8gc3BlY2lhbCBjYXNlIGZvciBjcmVhdGVTb3VuZCgpIGZvbGxvd2VkIGJ5IGxvYWQoKSAvIHBsYXkoKSB3aXRoIHVybDsgYXZvaWQgZG91YmxlLWxvYWQgY2FzZS5cclxuICAgICAgICBpZiAoIXMucmVhZHlTdGF0ZSAmJiAhcy5pc0hUTUw1ICYmIGZWID09PSA4ICYmIHVybE9taXR0ZWQpIHtcclxuXHJcbiAgICAgICAgICB1cmxPbWl0dGVkID0gZmFsc2U7XHJcblxyXG4gICAgICAgIH0gZWxzZSB7XHJcblxyXG4gICAgICAgICAgLy8gbG9hZCB1c2luZyBtZXJnZWQgb3B0aW9uc1xyXG4gICAgICAgICAgcy5sb2FkKHMuX2lPKTtcclxuXHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgfVxyXG5cclxuICAgICAgaWYgKCFzLmxvYWRlZCkge1xyXG5cclxuICAgICAgICBpZiAocy5yZWFkeVN0YXRlID09PSAwKSB7XHJcblxyXG4gICAgICAgICAgc20yLl93RChmTiArICdBdHRlbXB0aW5nIHRvIGxvYWQnKTtcclxuXHJcbiAgICAgICAgICAvLyB0cnkgdG8gZ2V0IHRoaXMgc291bmQgcGxheWluZyBBU0FQXHJcbiAgICAgICAgICBpZiAoIXMuaXNIVE1MNSAmJiAhc20yLmh0bWw1T25seSkge1xyXG5cclxuICAgICAgICAgICAgLy8gZmxhc2g6IGFzc2lnbiBkaXJlY3RseSBiZWNhdXNlIHNldEF1dG9QbGF5KCkgaW5jcmVtZW50cyB0aGUgaW5zdGFuY2VDb3VudFxyXG4gICAgICAgICAgICBzLl9pTy5hdXRvUGxheSA9IHRydWU7XHJcbiAgICAgICAgICAgIHMubG9hZChzLl9pTyk7XHJcblxyXG4gICAgICAgICAgfSBlbHNlIGlmIChzLmlzSFRNTDUpIHtcclxuXHJcbiAgICAgICAgICAgIC8vIGlPUyBuZWVkcyB0aGlzIHdoZW4gcmVjeWNsaW5nIHNvdW5kcywgbG9hZGluZyBhIG5ldyBVUkwgb24gYW4gZXhpc3Rpbmcgb2JqZWN0LlxyXG4gICAgICAgICAgICBzLmxvYWQocy5faU8pO1xyXG5cclxuICAgICAgICAgIH0gZWxzZSB7XHJcblxyXG4gICAgICAgICAgICBzbTIuX3dEKGZOICsgJ1Vuc3VwcG9ydGVkIHR5cGUuIEV4aXRpbmcuJyk7XHJcbiAgICAgICAgICAgIGV4aXQgPSBzO1xyXG5cclxuICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAvLyBIVE1MNSBoYWNrIC0gcmUtc2V0IGluc3RhbmNlT3B0aW9ucz9cclxuICAgICAgICAgIHMuaW5zdGFuY2VPcHRpb25zID0gcy5faU87XHJcblxyXG4gICAgICAgIH0gZWxzZSBpZiAocy5yZWFkeVN0YXRlID09PSAyKSB7XHJcblxyXG4gICAgICAgICAgc20yLl93RChmTiArICdDb3VsZCBub3QgbG9hZCAtIGV4aXRpbmcnLCAyKTtcclxuICAgICAgICAgIGV4aXQgPSBzO1xyXG5cclxuICAgICAgICB9IGVsc2Uge1xyXG5cclxuICAgICAgICAgIHNtMi5fd0QoZk4gKyAnTG9hZGluZyAtIGF0dGVtcHRpbmcgdG8gcGxheS4uLicpO1xyXG5cclxuICAgICAgICB9XHJcblxyXG4gICAgICB9IGVsc2Uge1xyXG5cclxuICAgICAgICAvLyBcInBsYXkoKVwiXHJcbiAgICAgICAgc20yLl93RChmTi5zdWJzdHIoMCwgZk4ubGFzdEluZGV4T2YoJzonKSkpO1xyXG5cclxuICAgICAgfVxyXG5cclxuICAgICAgaWYgKGV4aXQgIT09IG51bGwpIHtcclxuICAgICAgICByZXR1cm4gZXhpdDtcclxuICAgICAgfVxyXG5cclxuICAgICAgaWYgKCFzLmlzSFRNTDUgJiYgZlYgPT09IDkgJiYgcy5wb3NpdGlvbiA+IDAgJiYgcy5wb3NpdGlvbiA9PT0gcy5kdXJhdGlvbikge1xyXG4gICAgICAgIC8vIGZsYXNoIDkgbmVlZHMgYSBwb3NpdGlvbiByZXNldCBpZiBwbGF5KCkgaXMgY2FsbGVkIHdoaWxlIGF0IHRoZSBlbmQgb2YgYSBzb3VuZC5cclxuICAgICAgICBzbTIuX3dEKGZOICsgJ1NvdW5kIGF0IGVuZCwgcmVzZXR0aW5nIHRvIHBvc2l0aW9uOjAnKTtcclxuICAgICAgICBvT3B0aW9ucy5wb3NpdGlvbiA9IDA7XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIC8qKlxyXG4gICAgICAgKiBTdHJlYW1zIHdpbGwgcGF1c2Ugd2hlbiB0aGVpciBidWZmZXIgaXMgZnVsbCBpZiB0aGV5IGFyZSBiZWluZyBsb2FkZWQuXHJcbiAgICAgICAqIEluIHRoaXMgY2FzZSBwYXVzZWQgaXMgdHJ1ZSwgYnV0IHRoZSBzb25nIGhhc24ndCBzdGFydGVkIHBsYXlpbmcgeWV0LlxyXG4gICAgICAgKiBJZiB3ZSBqdXN0IGNhbGwgcmVzdW1lKCkgdGhlIG9ucGxheSgpIGNhbGxiYWNrIHdpbGwgbmV2ZXIgYmUgY2FsbGVkLlxyXG4gICAgICAgKiBTbyBvbmx5IGNhbGwgcmVzdW1lKCkgaWYgdGhlIHBvc2l0aW9uIGlzID4gMC5cclxuICAgICAgICogQW5vdGhlciByZWFzb24gaXMgYmVjYXVzZSBvcHRpb25zIGxpa2Ugdm9sdW1lIHdvbid0IGhhdmUgYmVlbiBhcHBsaWVkIHlldC5cclxuICAgICAgICogRm9yIG5vcm1hbCBzb3VuZHMsIGp1c3QgcmVzdW1lLlxyXG4gICAgICAgKi9cclxuXHJcbiAgICAgIGlmIChzLnBhdXNlZCAmJiBzLnBvc2l0aW9uID49IDAgJiYgKCFzLl9pTy5zZXJ2ZXJVUkwgfHwgcy5wb3NpdGlvbiA+IDApKSB7XHJcblxyXG4gICAgICAgIC8vIGh0dHBzOi8vZ2lzdC5naXRodWIuY29tLzM3YjE3ZGY3NWNjNGQ3YTkwYmY2XHJcbiAgICAgICAgc20yLl93RChmTiArICdSZXN1bWluZyBmcm9tIHBhdXNlZCBzdGF0ZScsIDEpO1xyXG4gICAgICAgIHMucmVzdW1lKCk7XHJcblxyXG4gICAgICB9IGVsc2Uge1xyXG5cclxuICAgICAgICBzLl9pTyA9IG1peGluKG9PcHRpb25zLCBzLl9pTyk7XHJcblxyXG4gICAgICAgIC8qKlxyXG4gICAgICAgICAqIFByZWxvYWQgaW4gdGhlIGV2ZW50IG9mIHBsYXkoKSB3aXRoIHBvc2l0aW9uIHVuZGVyIEZsYXNoLFxyXG4gICAgICAgICAqIG9yIGZyb20vdG8gcGFyYW1ldGVycyBhbmQgbm9uLVJUTVAgY2FzZVxyXG4gICAgICAgICAqL1xyXG4gICAgICAgIGlmICgoKCFzLmlzSFRNTDUgJiYgcy5faU8ucG9zaXRpb24gIT09IG51bGwgJiYgcy5faU8ucG9zaXRpb24gPiAwKSB8fCAocy5faU8uZnJvbSAhPT0gbnVsbCAmJiBzLl9pTy5mcm9tID4gMCkgfHwgcy5faU8udG8gIT09IG51bGwpICYmIHMuaW5zdGFuY2VDb3VudCA9PT0gMCAmJiBzLnBsYXlTdGF0ZSA9PT0gMCAmJiAhcy5faU8uc2VydmVyVVJMKSB7XHJcblxyXG4gICAgICAgICAgb25yZWFkeSA9IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICAvLyBzb3VuZCBcImNhbnBsYXlcIiBvciBvbmxvYWQoKVxyXG4gICAgICAgICAgICAvLyByZS1hcHBseSBwb3NpdGlvbi9mcm9tL3RvIHRvIGluc3RhbmNlIG9wdGlvbnMsIGFuZCBzdGFydCBwbGF5YmFja1xyXG4gICAgICAgICAgICBzLl9pTyA9IG1peGluKG9PcHRpb25zLCBzLl9pTyk7XHJcbiAgICAgICAgICAgIHMucGxheShzLl9pTyk7XHJcbiAgICAgICAgICB9O1xyXG5cclxuICAgICAgICAgIC8vIEhUTUw1IG5lZWRzIHRvIGF0IGxlYXN0IGhhdmUgXCJjYW5wbGF5XCIgZmlyZWQgYmVmb3JlIHNlZWtpbmcuXHJcbiAgICAgICAgICBpZiAocy5pc0hUTUw1ICYmICFzLl9odG1sNV9jYW5wbGF5KSB7XHJcblxyXG4gICAgICAgICAgICAvLyB0aGlzIGhhc24ndCBiZWVuIGxvYWRlZCB5ZXQuIGxvYWQgaXQgZmlyc3QsIGFuZCB0aGVuIGRvIHRoaXMgYWdhaW4uXHJcbiAgICAgICAgICAgIHNtMi5fd0QoZk4gKyAnQmVnaW5uaW5nIGxvYWQgZm9yIG5vbi16ZXJvIG9mZnNldCBjYXNlJyk7XHJcblxyXG4gICAgICAgICAgICBzLmxvYWQoe1xyXG4gICAgICAgICAgICAgIC8vIG5vdGU6IGN1c3RvbSBIVE1MNS1vbmx5IGV2ZW50IGFkZGVkIGZvciBmcm9tL3RvIGltcGxlbWVudGF0aW9uLlxyXG4gICAgICAgICAgICAgIF9vbmNhbnBsYXk6IG9ucmVhZHlcclxuICAgICAgICAgICAgfSk7XHJcblxyXG4gICAgICAgICAgICBleGl0ID0gZmFsc2U7XHJcblxyXG4gICAgICAgICAgfSBlbHNlIGlmICghcy5pc0hUTUw1ICYmICFzLmxvYWRlZCAmJiAoIXMucmVhZHlTdGF0ZSB8fCBzLnJlYWR5U3RhdGUgIT09IDIpKSB7XHJcblxyXG4gICAgICAgICAgICAvLyB0byBiZSBzYWZlLCBwcmVsb2FkIHRoZSB3aG9sZSB0aGluZyBpbiBGbGFzaC5cclxuXHJcbiAgICAgICAgICAgIHNtMi5fd0QoZk4gKyAnUHJlbG9hZGluZyBmb3Igbm9uLXplcm8gb2Zmc2V0IGNhc2UnKTtcclxuXHJcbiAgICAgICAgICAgIHMubG9hZCh7XHJcbiAgICAgICAgICAgICAgb25sb2FkOiBvbnJlYWR5XHJcbiAgICAgICAgICAgIH0pO1xyXG5cclxuICAgICAgICAgICAgZXhpdCA9IGZhbHNlO1xyXG5cclxuICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICBpZiAoZXhpdCAhPT0gbnVsbCkge1xyXG4gICAgICAgICAgICByZXR1cm4gZXhpdDtcclxuICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAvLyBvdGhlcndpc2UsIHdlJ3JlIHJlYWR5IHRvIGdvLiByZS1hcHBseSBsb2NhbCBvcHRpb25zLCBhbmQgY29udGludWVcclxuXHJcbiAgICAgICAgICBzLl9pTyA9IGFwcGx5RnJvbVRvKCk7XHJcblxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLy8gc20yLl93RChmTiArICdTdGFydGluZyB0byBwbGF5Jyk7XHJcblxyXG4gICAgICAgIC8vIGluY3JlbWVudCBpbnN0YW5jZSBjb3VudGVyLCB3aGVyZSBlbmFibGVkICsgc3VwcG9ydGVkXHJcbiAgICAgICAgaWYgKCFzLmluc3RhbmNlQ291bnQgfHwgcy5faU8ubXVsdGlTaG90RXZlbnRzIHx8IChzLmlzSFRNTDUgJiYgcy5faU8ubXVsdGlTaG90ICYmICF1c2VHbG9iYWxIVE1MNUF1ZGlvKSB8fCAoIXMuaXNIVE1MNSAmJiBmViA+IDggJiYgIXMuZ2V0QXV0b1BsYXkoKSkpIHtcclxuICAgICAgICAgIHMuaW5zdGFuY2VDb3VudCsrO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLy8gaWYgZmlyc3QgcGxheSBhbmQgb25wb3NpdGlvbiBwYXJhbWV0ZXJzIGV4aXN0LCBhcHBseSB0aGVtIG5vd1xyXG4gICAgICAgIGlmIChzLl9pTy5vbnBvc2l0aW9uICYmIHMucGxheVN0YXRlID09PSAwKSB7XHJcbiAgICAgICAgICBhdHRhY2hPblBvc2l0aW9uKHMpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcy5wbGF5U3RhdGUgPSAxO1xyXG4gICAgICAgIHMucGF1c2VkID0gZmFsc2U7XHJcblxyXG4gICAgICAgIHMucG9zaXRpb24gPSAocy5faU8ucG9zaXRpb24gIT09IF91bmRlZmluZWQgJiYgIWlzTmFOKHMuX2lPLnBvc2l0aW9uKSA/IHMuX2lPLnBvc2l0aW9uIDogMCk7XHJcblxyXG4gICAgICAgIGlmICghcy5pc0hUTUw1KSB7XHJcbiAgICAgICAgICBzLl9pTyA9IHBvbGljeUZpeChsb29wRml4KHMuX2lPKSk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBpZiAocy5faU8ub25wbGF5ICYmIF91cGRhdGVQbGF5U3RhdGUpIHtcclxuICAgICAgICAgIHMuX2lPLm9ucGxheS5hcHBseShzKTtcclxuICAgICAgICAgIG9ucGxheV9jYWxsZWQgPSB0cnVlO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcy5zZXRWb2x1bWUocy5faU8udm9sdW1lLCB0cnVlKTtcclxuICAgICAgICBzLnNldFBhbihzLl9pTy5wYW4sIHRydWUpO1xyXG5cclxuICAgICAgICBpZiAoIXMuaXNIVE1MNSkge1xyXG5cclxuICAgICAgICAgIHN0YXJ0T0sgPSBmbGFzaC5fc3RhcnQocy5pZCwgcy5faU8ubG9vcHMgfHwgMSwgKGZWID09PSA5ID8gcy5wb3NpdGlvbiA6IHMucG9zaXRpb24gLyBtc2VjU2NhbGUpLCBzLl9pTy5tdWx0aVNob3QgfHwgZmFsc2UpO1xyXG5cclxuICAgICAgICAgIGlmIChmViA9PT0gOSAmJiAhc3RhcnRPSykge1xyXG4gICAgICAgICAgICAvLyBlZGdlIGNhc2U6IG5vIHNvdW5kIGhhcmR3YXJlLCBvciAzMi1jaGFubmVsIGZsYXNoIGNlaWxpbmcgaGl0LlxyXG4gICAgICAgICAgICAvLyBhcHBsaWVzIG9ubHkgdG8gRmxhc2ggOSwgbm9uLU5ldFN0cmVhbS9Nb3ZpZVN0YXIgc291bmRzLlxyXG4gICAgICAgICAgICAvLyBodHRwOi8vaGVscC5hZG9iZS5jb20vZW5fVVMvRmxhc2hQbGF0Zm9ybS9yZWZlcmVuY2UvYWN0aW9uc2NyaXB0LzMvZmxhc2gvbWVkaWEvU291bmQuaHRtbCNwbGF5JTI4JTI5XHJcbiAgICAgICAgICAgIHNtMi5fd0QoZk4gKyAnTm8gc291bmQgaGFyZHdhcmUsIG9yIDMyLXNvdW5kIGNlaWxpbmcgaGl0JywgMik7XHJcbiAgICAgICAgICAgIGlmIChzLl9pTy5vbnBsYXllcnJvcikge1xyXG4gICAgICAgICAgICAgIHMuX2lPLm9ucGxheWVycm9yLmFwcGx5KHMpO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgfVxyXG5cclxuICAgICAgICB9IGVsc2Uge1xyXG5cclxuICAgICAgICAgIGlmIChzLmluc3RhbmNlQ291bnQgPCAyKSB7XHJcblxyXG4gICAgICAgICAgICAvLyBIVE1MNSBzaW5nbGUtaW5zdGFuY2UgY2FzZVxyXG5cclxuICAgICAgICAgICAgc3RhcnRfaHRtbDVfdGltZXIoKTtcclxuXHJcbiAgICAgICAgICAgIGEgPSBzLl9zZXR1cF9odG1sNSgpO1xyXG5cclxuICAgICAgICAgICAgcy5zZXRQb3NpdGlvbihzLl9pTy5wb3NpdGlvbik7XHJcblxyXG4gICAgICAgICAgICBhLnBsYXkoKTtcclxuXHJcbiAgICAgICAgICB9IGVsc2Uge1xyXG5cclxuICAgICAgICAgICAgLy8gSFRNTDUgbXVsdGktc2hvdCBjYXNlXHJcblxyXG4gICAgICAgICAgICBzbTIuX3dEKHMuaWQgKyAnOiBDbG9uaW5nIEF1ZGlvKCkgZm9yIGluc3RhbmNlICMnICsgcy5pbnN0YW5jZUNvdW50ICsgJy4uLicpO1xyXG5cclxuICAgICAgICAgICAgYXVkaW9DbG9uZSA9IG5ldyBBdWRpbyhzLl9pTy51cmwpO1xyXG5cclxuICAgICAgICAgICAgb25lbmRlZCA9IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICAgIGV2ZW50LnJlbW92ZShhdWRpb0Nsb25lLCAnZW5kZWQnLCBvbmVuZGVkKTtcclxuICAgICAgICAgICAgICBzLl9vbmZpbmlzaChzKTtcclxuICAgICAgICAgICAgICAvLyBjbGVhbnVwXHJcbiAgICAgICAgICAgICAgaHRtbDVVbmxvYWQoYXVkaW9DbG9uZSk7XHJcbiAgICAgICAgICAgICAgYXVkaW9DbG9uZSA9IG51bGw7XHJcbiAgICAgICAgICAgIH07XHJcblxyXG4gICAgICAgICAgICBvbmNhbnBsYXkgPSBmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgICBldmVudC5yZW1vdmUoYXVkaW9DbG9uZSwgJ2NhbnBsYXknLCBvbmNhbnBsYXkpO1xyXG4gICAgICAgICAgICAgIHRyeSB7XHJcbiAgICAgICAgICAgICAgICBhdWRpb0Nsb25lLmN1cnJlbnRUaW1lID0gcy5faU8ucG9zaXRpb24vbXNlY1NjYWxlO1xyXG4gICAgICAgICAgICAgIH0gY2F0Y2goZXJyKSB7XHJcbiAgICAgICAgICAgICAgICBjb21wbGFpbihzLmlkICsgJzogbXVsdGlTaG90IHBsYXkoKSBmYWlsZWQgdG8gYXBwbHkgcG9zaXRpb24gb2YgJyArIChzLl9pTy5wb3NpdGlvbi9tc2VjU2NhbGUpKTtcclxuICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgYXVkaW9DbG9uZS5wbGF5KCk7XHJcbiAgICAgICAgICAgIH07XHJcblxyXG4gICAgICAgICAgICBldmVudC5hZGQoYXVkaW9DbG9uZSwgJ2VuZGVkJywgb25lbmRlZCk7XHJcblxyXG4gICAgICAgICAgICAvLyBhcHBseSB2b2x1bWUgdG8gY2xvbmVzLCB0b29cclxuICAgICAgICAgICAgaWYgKHMuX2lPLnZvbHVtZSAhPT0gdW5kZWZpbmVkKSB7XHJcbiAgICAgICAgICAgICAgYXVkaW9DbG9uZS52b2x1bWUgPSBNYXRoLm1heCgwLCBNYXRoLm1pbigxLCBzLl9pTy52b2x1bWUvMTAwKSk7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIC8vIHBsYXlpbmcgbXVsdGlwbGUgbXV0ZWQgc291bmRzPyBpZiB5b3UgZG8gdGhpcywgeW91J3JlIHdlaXJkIDspIC0gYnV0IGxldCdzIGNvdmVyIGl0LlxyXG4gICAgICAgICAgICBpZiAocy5tdXRlZCkge1xyXG4gICAgICAgICAgICAgIGF1ZGlvQ2xvbmUubXV0ZWQgPSB0cnVlO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICBpZiAocy5faU8ucG9zaXRpb24pIHtcclxuICAgICAgICAgICAgICAvLyBIVE1MNSBhdWRpbyBjYW4ndCBzZWVrIGJlZm9yZSBvbnBsYXkoKSBldmVudCBoYXMgZmlyZWQuXHJcbiAgICAgICAgICAgICAgLy8gd2FpdCBmb3IgY2FucGxheSwgdGhlbiBzZWVrIHRvIHBvc2l0aW9uIGFuZCBzdGFydCBwbGF5YmFjay5cclxuICAgICAgICAgICAgICBldmVudC5hZGQoYXVkaW9DbG9uZSwgJ2NhbnBsYXknLCBvbmNhbnBsYXkpO1xyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgIC8vIGJlZ2luIHBsYXliYWNrIGF0IGN1cnJlbnRUaW1lOiAwXHJcbiAgICAgICAgICAgICAgYXVkaW9DbG9uZS5wbGF5KCk7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICB9XHJcblxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgIH1cclxuXHJcbiAgICAgIHJldHVybiBzO1xyXG5cclxuICAgIH07XHJcblxyXG4gICAgLy8ganVzdCBmb3IgY29udmVuaWVuY2VcclxuICAgIHRoaXMuc3RhcnQgPSB0aGlzLnBsYXk7XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBTdG9wcyBwbGF5aW5nIGEgc291bmQgKGFuZCBvcHRpb25hbGx5LCBhbGwgc291bmRzKVxyXG4gICAgICpcclxuICAgICAqIEBwYXJhbSB7Ym9vbGVhbn0gYkFsbCBPcHRpb25hbDogV2hldGhlciB0byBzdG9wIGFsbCBzb3VuZHNcclxuICAgICAqIEByZXR1cm4ge1NNU291bmR9IFRoZSBTTVNvdW5kIG9iamVjdFxyXG4gICAgICovXHJcblxyXG4gICAgdGhpcy5zdG9wID0gZnVuY3Rpb24oYkFsbCkge1xyXG5cclxuICAgICAgdmFyIGluc3RhbmNlT3B0aW9ucyA9IHMuX2lPLFxyXG4gICAgICAgICAgb3JpZ2luYWxQb3NpdGlvbjtcclxuXHJcbiAgICAgIGlmIChzLnBsYXlTdGF0ZSA9PT0gMSkge1xyXG5cclxuICAgICAgICBzbTIuX3dEKHMuaWQgKyAnOiBzdG9wKCknKTtcclxuXHJcbiAgICAgICAgcy5fb25idWZmZXJjaGFuZ2UoMCk7XHJcbiAgICAgICAgcy5fcmVzZXRPblBvc2l0aW9uKDApO1xyXG4gICAgICAgIHMucGF1c2VkID0gZmFsc2U7XHJcblxyXG4gICAgICAgIGlmICghcy5pc0hUTUw1KSB7XHJcbiAgICAgICAgICBzLnBsYXlTdGF0ZSA9IDA7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvLyByZW1vdmUgb25Qb3NpdGlvbiBsaXN0ZW5lcnMsIGlmIGFueVxyXG4gICAgICAgIGRldGFjaE9uUG9zaXRpb24oKTtcclxuXHJcbiAgICAgICAgLy8gYW5kIFwidG9cIiBwb3NpdGlvbiwgaWYgc2V0XHJcbiAgICAgICAgaWYgKGluc3RhbmNlT3B0aW9ucy50bykge1xyXG4gICAgICAgICAgcy5jbGVhck9uUG9zaXRpb24oaW5zdGFuY2VPcHRpb25zLnRvKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGlmICghcy5pc0hUTUw1KSB7XHJcblxyXG4gICAgICAgICAgZmxhc2guX3N0b3Aocy5pZCwgYkFsbCk7XHJcblxyXG4gICAgICAgICAgLy8gaGFjayBmb3IgbmV0U3RyZWFtOiBqdXN0IHVubG9hZFxyXG4gICAgICAgICAgaWYgKGluc3RhbmNlT3B0aW9ucy5zZXJ2ZXJVUkwpIHtcclxuICAgICAgICAgICAgcy51bmxvYWQoKTtcclxuICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgfSBlbHNlIHtcclxuXHJcbiAgICAgICAgICBpZiAocy5fYSkge1xyXG5cclxuICAgICAgICAgICAgb3JpZ2luYWxQb3NpdGlvbiA9IHMucG9zaXRpb247XHJcblxyXG4gICAgICAgICAgICAvLyBhY3QgbGlrZSBGbGFzaCwgdGhvdWdoXHJcbiAgICAgICAgICAgIHMuc2V0UG9zaXRpb24oMCk7XHJcblxyXG4gICAgICAgICAgICAvLyBoYWNrOiByZWZsZWN0IG9sZCBwb3NpdGlvbiBmb3Igb25zdG9wKCkgKGFsc28gbGlrZSBGbGFzaClcclxuICAgICAgICAgICAgcy5wb3NpdGlvbiA9IG9yaWdpbmFsUG9zaXRpb247XHJcblxyXG4gICAgICAgICAgICAvLyBodG1sNSBoYXMgbm8gc3RvcCgpXHJcbiAgICAgICAgICAgIC8vIE5PVEU6IHBhdXNpbmcgbWVhbnMgaU9TIHJlcXVpcmVzIGludGVyYWN0aW9uIHRvIHJlc3VtZS5cclxuICAgICAgICAgICAgcy5fYS5wYXVzZSgpO1xyXG5cclxuICAgICAgICAgICAgcy5wbGF5U3RhdGUgPSAwO1xyXG5cclxuICAgICAgICAgICAgLy8gYW5kIHVwZGF0ZSBVSVxyXG4gICAgICAgICAgICBzLl9vblRpbWVyKCk7XHJcblxyXG4gICAgICAgICAgICBzdG9wX2h0bWw1X3RpbWVyKCk7XHJcblxyXG4gICAgICAgICAgfVxyXG5cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHMuaW5zdGFuY2VDb3VudCA9IDA7XHJcbiAgICAgICAgcy5faU8gPSB7fTtcclxuXHJcbiAgICAgICAgaWYgKGluc3RhbmNlT3B0aW9ucy5vbnN0b3ApIHtcclxuICAgICAgICAgIGluc3RhbmNlT3B0aW9ucy5vbnN0b3AuYXBwbHkocyk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgfVxyXG5cclxuICAgICAgcmV0dXJuIHM7XHJcblxyXG4gICAgfTtcclxuXHJcbiAgICAvKipcclxuICAgICAqIFVuZG9jdW1lbnRlZC9pbnRlcm5hbDogU2V0cyBhdXRvUGxheSBmb3IgUlRNUC5cclxuICAgICAqXHJcbiAgICAgKiBAcGFyYW0ge2Jvb2xlYW59IGF1dG9QbGF5IHN0YXRlXHJcbiAgICAgKi9cclxuXHJcbiAgICB0aGlzLnNldEF1dG9QbGF5ID0gZnVuY3Rpb24oYXV0b1BsYXkpIHtcclxuXHJcbiAgICAgIHNtMi5fd0Qocy5pZCArICc6IEF1dG9wbGF5IHR1cm5lZCAnICsgKGF1dG9QbGF5ID8gJ29uJyA6ICdvZmYnKSk7XHJcbiAgICAgIHMuX2lPLmF1dG9QbGF5ID0gYXV0b1BsYXk7XHJcblxyXG4gICAgICBpZiAoIXMuaXNIVE1MNSkge1xyXG4gICAgICAgIGZsYXNoLl9zZXRBdXRvUGxheShzLmlkLCBhdXRvUGxheSk7XHJcbiAgICAgICAgaWYgKGF1dG9QbGF5KSB7XHJcbiAgICAgICAgICAvLyBvbmx5IGluY3JlbWVudCB0aGUgaW5zdGFuY2VDb3VudCBpZiB0aGUgc291bmQgaXNuJ3QgbG9hZGVkIChUT0RPOiB2ZXJpZnkgUlRNUClcclxuICAgICAgICAgIGlmICghcy5pbnN0YW5jZUNvdW50ICYmIHMucmVhZHlTdGF0ZSA9PT0gMSkge1xyXG4gICAgICAgICAgICBzLmluc3RhbmNlQ291bnQrKztcclxuICAgICAgICAgICAgc20yLl93RChzLmlkICsgJzogSW5jcmVtZW50ZWQgaW5zdGFuY2UgY291bnQgdG8gJytzLmluc3RhbmNlQ291bnQpO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG5cclxuICAgIH07XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBVbmRvY3VtZW50ZWQvaW50ZXJuYWw6IFJldHVybnMgdGhlIGF1dG9QbGF5IGJvb2xlYW4uXHJcbiAgICAgKlxyXG4gICAgICogQHJldHVybiB7Ym9vbGVhbn0gVGhlIGN1cnJlbnQgYXV0b1BsYXkgdmFsdWVcclxuICAgICAqL1xyXG5cclxuICAgIHRoaXMuZ2V0QXV0b1BsYXkgPSBmdW5jdGlvbigpIHtcclxuXHJcbiAgICAgIHJldHVybiBzLl9pTy5hdXRvUGxheTtcclxuXHJcbiAgICB9O1xyXG5cclxuICAgIC8qKlxyXG4gICAgICogU2V0cyB0aGUgcG9zaXRpb24gb2YgYSBzb3VuZC5cclxuICAgICAqXHJcbiAgICAgKiBAcGFyYW0ge251bWJlcn0gbk1zZWNPZmZzZXQgUG9zaXRpb24gKG1pbGxpc2Vjb25kcylcclxuICAgICAqIEByZXR1cm4ge1NNU291bmR9IFRoZSBTTVNvdW5kIG9iamVjdFxyXG4gICAgICovXHJcblxyXG4gICAgdGhpcy5zZXRQb3NpdGlvbiA9IGZ1bmN0aW9uKG5Nc2VjT2Zmc2V0KSB7XHJcblxyXG4gICAgICBpZiAobk1zZWNPZmZzZXQgPT09IF91bmRlZmluZWQpIHtcclxuICAgICAgICBuTXNlY09mZnNldCA9IDA7XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIHZhciBwb3NpdGlvbiwgcG9zaXRpb24xSyxcclxuICAgICAgICAgIC8vIFVzZSB0aGUgZHVyYXRpb24gZnJvbSB0aGUgaW5zdGFuY2Ugb3B0aW9ucywgaWYgd2UgZG9uJ3QgaGF2ZSBhIHRyYWNrIGR1cmF0aW9uIHlldC5cclxuICAgICAgICAgIC8vIHBvc2l0aW9uID49IDAgYW5kIDw9IGN1cnJlbnQgYXZhaWxhYmxlIChsb2FkZWQpIGR1cmF0aW9uXHJcbiAgICAgICAgICBvZmZzZXQgPSAocy5pc0hUTUw1ID8gTWF0aC5tYXgobk1zZWNPZmZzZXQsIDApIDogTWF0aC5taW4ocy5kdXJhdGlvbiB8fCBzLl9pTy5kdXJhdGlvbiwgTWF0aC5tYXgobk1zZWNPZmZzZXQsIDApKSk7XHJcblxyXG4gICAgICBzLnBvc2l0aW9uID0gb2Zmc2V0O1xyXG4gICAgICBwb3NpdGlvbjFLID0gcy5wb3NpdGlvbi9tc2VjU2NhbGU7XHJcbiAgICAgIHMuX3Jlc2V0T25Qb3NpdGlvbihzLnBvc2l0aW9uKTtcclxuICAgICAgcy5faU8ucG9zaXRpb24gPSBvZmZzZXQ7XHJcblxyXG4gICAgICBpZiAoIXMuaXNIVE1MNSkge1xyXG5cclxuICAgICAgICBwb3NpdGlvbiA9IChmViA9PT0gOSA/IHMucG9zaXRpb24gOiBwb3NpdGlvbjFLKTtcclxuXHJcbiAgICAgICAgaWYgKHMucmVhZHlTdGF0ZSAmJiBzLnJlYWR5U3RhdGUgIT09IDIpIHtcclxuICAgICAgICAgIC8vIGlmIHBhdXNlZCBvciBub3QgcGxheWluZywgd2lsbCBub3QgcmVzdW1lIChieSBwbGF5aW5nKVxyXG4gICAgICAgICAgZmxhc2guX3NldFBvc2l0aW9uKHMuaWQsIHBvc2l0aW9uLCAocy5wYXVzZWQgfHwgIXMucGxheVN0YXRlKSwgcy5faU8ubXVsdGlTaG90KTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICB9IGVsc2UgaWYgKHMuX2EpIHtcclxuXHJcbiAgICAgICAgLy8gU2V0IHRoZSBwb3NpdGlvbiBpbiB0aGUgY2FucGxheSBoYW5kbGVyIGlmIHRoZSBzb3VuZCBpcyBub3QgcmVhZHkgeWV0XHJcbiAgICAgICAgaWYgKHMuX2h0bWw1X2NhbnBsYXkpIHtcclxuXHJcbiAgICAgICAgICBpZiAocy5fYS5jdXJyZW50VGltZSAhPT0gcG9zaXRpb24xSykge1xyXG5cclxuICAgICAgICAgICAgLyoqXHJcbiAgICAgICAgICAgICAqIERPTS9KUyBlcnJvcnMvZXhjZXB0aW9ucyB0byB3YXRjaCBvdXQgZm9yOlxyXG4gICAgICAgICAgICAgKiBpZiBzZWVrIGlzIGJleW9uZCAobG9hZGVkPykgcG9zaXRpb24sIFwiRE9NIGV4Y2VwdGlvbiAxMVwiXHJcbiAgICAgICAgICAgICAqIFwiSU5ERVhfU0laRV9FUlJcIjogRE9NIGV4Y2VwdGlvbiAxXHJcbiAgICAgICAgICAgICAqL1xyXG4gICAgICAgICAgICBzbTIuX3dEKHMuaWQgKyAnOiBzZXRQb3NpdGlvbignK3Bvc2l0aW9uMUsrJyknKTtcclxuXHJcbiAgICAgICAgICAgIHRyeSB7XHJcbiAgICAgICAgICAgICAgcy5fYS5jdXJyZW50VGltZSA9IHBvc2l0aW9uMUs7XHJcbiAgICAgICAgICAgICAgaWYgKHMucGxheVN0YXRlID09PSAwIHx8IHMucGF1c2VkKSB7XHJcbiAgICAgICAgICAgICAgICAvLyBhbGxvdyBzZWVrIHdpdGhvdXQgYXV0by1wbGF5L3Jlc3VtZVxyXG4gICAgICAgICAgICAgICAgcy5fYS5wYXVzZSgpO1xyXG4gICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfSBjYXRjaChlKSB7XHJcbiAgICAgICAgICAgICAgc20yLl93RChzLmlkICsgJzogc2V0UG9zaXRpb24oJyArIHBvc2l0aW9uMUsgKyAnKSBmYWlsZWQ6ICcgKyBlLm1lc3NhZ2UsIDIpO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgfVxyXG5cclxuICAgICAgICB9IGVsc2UgaWYgKHBvc2l0aW9uMUspIHtcclxuXHJcbiAgICAgICAgICAvLyB3YXJuIG9uIG5vbi16ZXJvIHNlZWsgYXR0ZW1wdHNcclxuICAgICAgICAgIHNtMi5fd0Qocy5pZCArICc6IHNldFBvc2l0aW9uKCcgKyBwb3NpdGlvbjFLICsgJyk6IENhbm5vdCBzZWVrIHlldCwgc291bmQgbm90IHJlYWR5JywgMik7XHJcbiAgICAgICAgICByZXR1cm4gcztcclxuXHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBpZiAocy5wYXVzZWQpIHtcclxuXHJcbiAgICAgICAgICAvLyBpZiBwYXVzZWQsIHJlZnJlc2ggVUkgcmlnaHQgYXdheVxyXG4gICAgICAgICAgLy8gZm9yY2UgdXBkYXRlXHJcbiAgICAgICAgICBzLl9vblRpbWVyKHRydWUpO1xyXG5cclxuICAgICAgICB9XHJcblxyXG4gICAgICB9XHJcblxyXG4gICAgICByZXR1cm4gcztcclxuXHJcbiAgICB9O1xyXG5cclxuICAgIC8qKlxyXG4gICAgICogUGF1c2VzIHNvdW5kIHBsYXliYWNrLlxyXG4gICAgICpcclxuICAgICAqIEByZXR1cm4ge1NNU291bmR9IFRoZSBTTVNvdW5kIG9iamVjdFxyXG4gICAgICovXHJcblxyXG4gICAgdGhpcy5wYXVzZSA9IGZ1bmN0aW9uKF9iQ2FsbEZsYXNoKSB7XHJcblxyXG4gICAgICBpZiAocy5wYXVzZWQgfHwgKHMucGxheVN0YXRlID09PSAwICYmIHMucmVhZHlTdGF0ZSAhPT0gMSkpIHtcclxuICAgICAgICByZXR1cm4gcztcclxuICAgICAgfVxyXG5cclxuICAgICAgc20yLl93RChzLmlkICsgJzogcGF1c2UoKScpO1xyXG4gICAgICBzLnBhdXNlZCA9IHRydWU7XHJcblxyXG4gICAgICBpZiAoIXMuaXNIVE1MNSkge1xyXG4gICAgICAgIGlmIChfYkNhbGxGbGFzaCB8fCBfYkNhbGxGbGFzaCA9PT0gX3VuZGVmaW5lZCkge1xyXG4gICAgICAgICAgZmxhc2guX3BhdXNlKHMuaWQsIHMuX2lPLm11bHRpU2hvdCk7XHJcbiAgICAgICAgfVxyXG4gICAgICB9IGVsc2Uge1xyXG4gICAgICAgIHMuX3NldHVwX2h0bWw1KCkucGF1c2UoKTtcclxuICAgICAgICBzdG9wX2h0bWw1X3RpbWVyKCk7XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIGlmIChzLl9pTy5vbnBhdXNlKSB7XHJcbiAgICAgICAgcy5faU8ub25wYXVzZS5hcHBseShzKTtcclxuICAgICAgfVxyXG5cclxuICAgICAgcmV0dXJuIHM7XHJcblxyXG4gICAgfTtcclxuXHJcbiAgICAvKipcclxuICAgICAqIFJlc3VtZXMgc291bmQgcGxheWJhY2suXHJcbiAgICAgKlxyXG4gICAgICogQHJldHVybiB7U01Tb3VuZH0gVGhlIFNNU291bmQgb2JqZWN0XHJcbiAgICAgKi9cclxuXHJcbiAgICAvKipcclxuICAgICAqIFdoZW4gYXV0by1sb2FkZWQgc3RyZWFtcyBwYXVzZSBvbiBidWZmZXIgZnVsbCB0aGV5IGhhdmUgYSBwbGF5U3RhdGUgb2YgMC5cclxuICAgICAqIFdlIG5lZWQgdG8gbWFrZSBzdXJlIHRoYXQgdGhlIHBsYXlTdGF0ZSBpcyBzZXQgdG8gMSB3aGVuIHRoZXNlIHN0cmVhbXMgXCJyZXN1bWVcIi5cclxuICAgICAqIFdoZW4gYSBwYXVzZWQgc3RyZWFtIGlzIHJlc3VtZWQsIHdlIG5lZWQgdG8gdHJpZ2dlciB0aGUgb25wbGF5KCkgY2FsbGJhY2sgaWYgaXRcclxuICAgICAqIGhhc24ndCBiZWVuIGNhbGxlZCBhbHJlYWR5LiBJbiB0aGlzIGNhc2Ugc2luY2UgdGhlIHNvdW5kIGlzIGJlaW5nIHBsYXllZCBmb3IgdGhlXHJcbiAgICAgKiBmaXJzdCB0aW1lLCBJIHRoaW5rIGl0J3MgbW9yZSBhcHByb3ByaWF0ZSB0byBjYWxsIG9ucGxheSgpIHJhdGhlciB0aGFuIG9ucmVzdW1lKCkuXHJcbiAgICAgKi9cclxuXHJcbiAgICB0aGlzLnJlc3VtZSA9IGZ1bmN0aW9uKCkge1xyXG5cclxuICAgICAgdmFyIGluc3RhbmNlT3B0aW9ucyA9IHMuX2lPO1xyXG5cclxuICAgICAgaWYgKCFzLnBhdXNlZCkge1xyXG4gICAgICAgIHJldHVybiBzO1xyXG4gICAgICB9XHJcblxyXG4gICAgICBzbTIuX3dEKHMuaWQgKyAnOiByZXN1bWUoKScpO1xyXG4gICAgICBzLnBhdXNlZCA9IGZhbHNlO1xyXG4gICAgICBzLnBsYXlTdGF0ZSA9IDE7XHJcblxyXG4gICAgICBpZiAoIXMuaXNIVE1MNSkge1xyXG4gICAgICAgIGlmIChpbnN0YW5jZU9wdGlvbnMuaXNNb3ZpZVN0YXIgJiYgIWluc3RhbmNlT3B0aW9ucy5zZXJ2ZXJVUkwpIHtcclxuICAgICAgICAgIC8vIEJpemFycmUgV2Via2l0IGJ1ZyAoQ2hyb21lIHJlcG9ydGVkIHZpYSA4dHJhY2tzLmNvbSBkdWRlcyk6IEFBQyBjb250ZW50IHBhdXNlZCBmb3IgMzArIHNlY29uZHMoPykgd2lsbCBub3QgcmVzdW1lIHdpdGhvdXQgYSByZXBvc2l0aW9uLlxyXG4gICAgICAgICAgcy5zZXRQb3NpdGlvbihzLnBvc2l0aW9uKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgLy8gZmxhc2ggbWV0aG9kIGlzIHRvZ2dsZS1iYXNlZCAocGF1c2UvcmVzdW1lKVxyXG4gICAgICAgIGZsYXNoLl9wYXVzZShzLmlkLCBpbnN0YW5jZU9wdGlvbnMubXVsdGlTaG90KTtcclxuICAgICAgfSBlbHNlIHtcclxuICAgICAgICBzLl9zZXR1cF9odG1sNSgpLnBsYXkoKTtcclxuICAgICAgICBzdGFydF9odG1sNV90aW1lcigpO1xyXG4gICAgICB9XHJcblxyXG4gICAgICBpZiAoIW9ucGxheV9jYWxsZWQgJiYgaW5zdGFuY2VPcHRpb25zLm9ucGxheSkge1xyXG4gICAgICAgIGluc3RhbmNlT3B0aW9ucy5vbnBsYXkuYXBwbHkocyk7XHJcbiAgICAgICAgb25wbGF5X2NhbGxlZCA9IHRydWU7XHJcbiAgICAgIH0gZWxzZSBpZiAoaW5zdGFuY2VPcHRpb25zLm9ucmVzdW1lKSB7XHJcbiAgICAgICAgaW5zdGFuY2VPcHRpb25zLm9ucmVzdW1lLmFwcGx5KHMpO1xyXG4gICAgICB9XHJcblxyXG4gICAgICByZXR1cm4gcztcclxuXHJcbiAgICB9O1xyXG5cclxuICAgIC8qKlxyXG4gICAgICogVG9nZ2xlcyBzb3VuZCBwbGF5YmFjay5cclxuICAgICAqXHJcbiAgICAgKiBAcmV0dXJuIHtTTVNvdW5kfSBUaGUgU01Tb3VuZCBvYmplY3RcclxuICAgICAqL1xyXG5cclxuICAgIHRoaXMudG9nZ2xlUGF1c2UgPSBmdW5jdGlvbigpIHtcclxuXHJcbiAgICAgIHNtMi5fd0Qocy5pZCArICc6IHRvZ2dsZVBhdXNlKCknKTtcclxuXHJcbiAgICAgIGlmIChzLnBsYXlTdGF0ZSA9PT0gMCkge1xyXG4gICAgICAgIHMucGxheSh7XHJcbiAgICAgICAgICBwb3NpdGlvbjogKGZWID09PSA5ICYmICFzLmlzSFRNTDUgPyBzLnBvc2l0aW9uIDogcy5wb3NpdGlvbiAvIG1zZWNTY2FsZSlcclxuICAgICAgICB9KTtcclxuICAgICAgICByZXR1cm4gcztcclxuICAgICAgfVxyXG5cclxuICAgICAgaWYgKHMucGF1c2VkKSB7XHJcbiAgICAgICAgcy5yZXN1bWUoKTtcclxuICAgICAgfSBlbHNlIHtcclxuICAgICAgICBzLnBhdXNlKCk7XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIHJldHVybiBzO1xyXG5cclxuICAgIH07XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBTZXRzIHRoZSBwYW5uaW5nIChMLVIpIGVmZmVjdC5cclxuICAgICAqXHJcbiAgICAgKiBAcGFyYW0ge251bWJlcn0gblBhbiBUaGUgcGFuIHZhbHVlICgtMTAwIHRvIDEwMClcclxuICAgICAqIEByZXR1cm4ge1NNU291bmR9IFRoZSBTTVNvdW5kIG9iamVjdFxyXG4gICAgICovXHJcblxyXG4gICAgdGhpcy5zZXRQYW4gPSBmdW5jdGlvbihuUGFuLCBiSW5zdGFuY2VPbmx5KSB7XHJcblxyXG4gICAgICBpZiAoblBhbiA9PT0gX3VuZGVmaW5lZCkge1xyXG4gICAgICAgIG5QYW4gPSAwO1xyXG4gICAgICB9XHJcblxyXG4gICAgICBpZiAoYkluc3RhbmNlT25seSA9PT0gX3VuZGVmaW5lZCkge1xyXG4gICAgICAgIGJJbnN0YW5jZU9ubHkgPSBmYWxzZTtcclxuICAgICAgfVxyXG5cclxuICAgICAgaWYgKCFzLmlzSFRNTDUpIHtcclxuICAgICAgICBmbGFzaC5fc2V0UGFuKHMuaWQsIG5QYW4pO1xyXG4gICAgICB9IC8vIGVsc2UgeyBubyBIVE1MNSBwYW4/IH1cclxuXHJcbiAgICAgIHMuX2lPLnBhbiA9IG5QYW47XHJcblxyXG4gICAgICBpZiAoIWJJbnN0YW5jZU9ubHkpIHtcclxuICAgICAgICBzLnBhbiA9IG5QYW47XHJcbiAgICAgICAgcy5vcHRpb25zLnBhbiA9IG5QYW47XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIHJldHVybiBzO1xyXG5cclxuICAgIH07XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBTZXRzIHRoZSB2b2x1bWUuXHJcbiAgICAgKlxyXG4gICAgICogQHBhcmFtIHtudW1iZXJ9IG5Wb2wgVGhlIHZvbHVtZSB2YWx1ZSAoMCB0byAxMDApXHJcbiAgICAgKiBAcmV0dXJuIHtTTVNvdW5kfSBUaGUgU01Tb3VuZCBvYmplY3RcclxuICAgICAqL1xyXG5cclxuICAgIHRoaXMuc2V0Vm9sdW1lID0gZnVuY3Rpb24oblZvbCwgX2JJbnN0YW5jZU9ubHkpIHtcclxuXHJcbiAgICAgIC8qKlxyXG4gICAgICAgKiBOb3RlOiBTZXR0aW5nIHZvbHVtZSBoYXMgbm8gZWZmZWN0IG9uIGlPUyBcInNwZWNpYWwgc25vd2ZsYWtlXCIgZGV2aWNlcy5cclxuICAgICAgICogSGFyZHdhcmUgdm9sdW1lIGNvbnRyb2wgb3ZlcnJpZGVzIHNvZnR3YXJlLCBhbmQgdm9sdW1lXHJcbiAgICAgICAqIHdpbGwgYWx3YXlzIHJldHVybiAxIHBlciBBcHBsZSBkb2NzLiAoaU9TIDQgKyA1LilcclxuICAgICAgICogaHR0cDovL2RldmVsb3Blci5hcHBsZS5jb20vbGlicmFyeS9zYWZhcmkvZG9jdW1lbnRhdGlvbi9BdWRpb1ZpZGVvL0NvbmNlcHR1YWwvSFRNTC1jYW52YXMtZ3VpZGUvQWRkaW5nU291bmR0b0NhbnZhc0FuaW1hdGlvbnMvQWRkaW5nU291bmR0b0NhbnZhc0FuaW1hdGlvbnMuaHRtbFxyXG4gICAgICAgKi9cclxuXHJcbiAgICAgIGlmIChuVm9sID09PSBfdW5kZWZpbmVkKSB7XHJcbiAgICAgICAgblZvbCA9IDEwMDtcclxuICAgICAgfVxyXG5cclxuICAgICAgaWYgKF9iSW5zdGFuY2VPbmx5ID09PSBfdW5kZWZpbmVkKSB7XHJcbiAgICAgICAgX2JJbnN0YW5jZU9ubHkgPSBmYWxzZTtcclxuICAgICAgfVxyXG5cclxuICAgICAgaWYgKCFzLmlzSFRNTDUpIHtcclxuICAgICAgICBmbGFzaC5fc2V0Vm9sdW1lKHMuaWQsIChzbTIubXV0ZWQgJiYgIXMubXV0ZWQpIHx8IHMubXV0ZWQ/MDpuVm9sKTtcclxuICAgICAgfSBlbHNlIGlmIChzLl9hKSB7XHJcbiAgICAgICAgaWYgKHNtMi5tdXRlZCAmJiAhcy5tdXRlZCkge1xyXG4gICAgICAgICAgcy5tdXRlZCA9IHRydWU7XHJcbiAgICAgICAgICBzLl9hLm11dGVkID0gdHJ1ZTtcclxuICAgICAgICB9XHJcbiAgICAgICAgLy8gdmFsaWQgcmFuZ2U6IDAtMVxyXG4gICAgICAgIHMuX2Eudm9sdW1lID0gTWF0aC5tYXgoMCwgTWF0aC5taW4oMSwgblZvbC8xMDApKTtcclxuICAgICAgfVxyXG5cclxuICAgICAgcy5faU8udm9sdW1lID0gblZvbDtcclxuXHJcbiAgICAgIGlmICghX2JJbnN0YW5jZU9ubHkpIHtcclxuICAgICAgICBzLnZvbHVtZSA9IG5Wb2w7XHJcbiAgICAgICAgcy5vcHRpb25zLnZvbHVtZSA9IG5Wb2w7XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIHJldHVybiBzO1xyXG5cclxuICAgIH07XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBNdXRlcyB0aGUgc291bmQuXHJcbiAgICAgKlxyXG4gICAgICogQHJldHVybiB7U01Tb3VuZH0gVGhlIFNNU291bmQgb2JqZWN0XHJcbiAgICAgKi9cclxuXHJcbiAgICB0aGlzLm11dGUgPSBmdW5jdGlvbigpIHtcclxuXHJcbiAgICAgIHMubXV0ZWQgPSB0cnVlO1xyXG5cclxuICAgICAgaWYgKCFzLmlzSFRNTDUpIHtcclxuICAgICAgICBmbGFzaC5fc2V0Vm9sdW1lKHMuaWQsIDApO1xyXG4gICAgICB9IGVsc2UgaWYgKHMuX2EpIHtcclxuICAgICAgICBzLl9hLm11dGVkID0gdHJ1ZTtcclxuICAgICAgfVxyXG5cclxuICAgICAgcmV0dXJuIHM7XHJcblxyXG4gICAgfTtcclxuXHJcbiAgICAvKipcclxuICAgICAqIFVubXV0ZXMgdGhlIHNvdW5kLlxyXG4gICAgICpcclxuICAgICAqIEByZXR1cm4ge1NNU291bmR9IFRoZSBTTVNvdW5kIG9iamVjdFxyXG4gICAgICovXHJcblxyXG4gICAgdGhpcy51bm11dGUgPSBmdW5jdGlvbigpIHtcclxuXHJcbiAgICAgIHMubXV0ZWQgPSBmYWxzZTtcclxuICAgICAgdmFyIGhhc0lPID0gKHMuX2lPLnZvbHVtZSAhPT0gX3VuZGVmaW5lZCk7XHJcblxyXG4gICAgICBpZiAoIXMuaXNIVE1MNSkge1xyXG4gICAgICAgIGZsYXNoLl9zZXRWb2x1bWUocy5pZCwgaGFzSU8/cy5faU8udm9sdW1lOnMub3B0aW9ucy52b2x1bWUpO1xyXG4gICAgICB9IGVsc2UgaWYgKHMuX2EpIHtcclxuICAgICAgICBzLl9hLm11dGVkID0gZmFsc2U7XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIHJldHVybiBzO1xyXG5cclxuICAgIH07XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBUb2dnbGVzIHRoZSBtdXRlZCBzdGF0ZSBvZiBhIHNvdW5kLlxyXG4gICAgICpcclxuICAgICAqIEByZXR1cm4ge1NNU291bmR9IFRoZSBTTVNvdW5kIG9iamVjdFxyXG4gICAgICovXHJcblxyXG4gICAgdGhpcy50b2dnbGVNdXRlID0gZnVuY3Rpb24oKSB7XHJcblxyXG4gICAgICByZXR1cm4gKHMubXV0ZWQ/cy51bm11dGUoKTpzLm11dGUoKSk7XHJcblxyXG4gICAgfTtcclxuXHJcbiAgICAvKipcclxuICAgICAqIFJlZ2lzdGVycyBhIGNhbGxiYWNrIHRvIGJlIGZpcmVkIHdoZW4gYSBzb3VuZCByZWFjaGVzIGEgZ2l2ZW4gcG9zaXRpb24gZHVyaW5nIHBsYXliYWNrLlxyXG4gICAgICpcclxuICAgICAqIEBwYXJhbSB7bnVtYmVyfSBuUG9zaXRpb24gVGhlIHBvc2l0aW9uIHRvIHdhdGNoIGZvclxyXG4gICAgICogQHBhcmFtIHtmdW5jdGlvbn0gb01ldGhvZCBUaGUgcmVsZXZhbnQgY2FsbGJhY2sgdG8gZmlyZVxyXG4gICAgICogQHBhcmFtIHtvYmplY3R9IG9TY29wZSBPcHRpb25hbDogVGhlIHNjb3BlIHRvIGFwcGx5IHRoZSBjYWxsYmFjayB0b1xyXG4gICAgICogQHJldHVybiB7U01Tb3VuZH0gVGhlIFNNU291bmQgb2JqZWN0XHJcbiAgICAgKi9cclxuXHJcbiAgICB0aGlzLm9uUG9zaXRpb24gPSBmdW5jdGlvbihuUG9zaXRpb24sIG9NZXRob2QsIG9TY29wZSkge1xyXG5cclxuICAgICAgLy8gVE9ETzogYmFzaWMgZHVwZSBjaGVja2luZz9cclxuXHJcbiAgICAgIG9uUG9zaXRpb25JdGVtcy5wdXNoKHtcclxuICAgICAgICBwb3NpdGlvbjogcGFyc2VJbnQoblBvc2l0aW9uLCAxMCksXHJcbiAgICAgICAgbWV0aG9kOiBvTWV0aG9kLFxyXG4gICAgICAgIHNjb3BlOiAob1Njb3BlICE9PSBfdW5kZWZpbmVkID8gb1Njb3BlIDogcyksXHJcbiAgICAgICAgZmlyZWQ6IGZhbHNlXHJcbiAgICAgIH0pO1xyXG5cclxuICAgICAgcmV0dXJuIHM7XHJcblxyXG4gICAgfTtcclxuXHJcbiAgICAvLyBsZWdhY3kvYmFja3dhcmRzLWNvbXBhYmlsaXR5OiBsb3dlci1jYXNlIG1ldGhvZCBuYW1lXHJcbiAgICB0aGlzLm9ucG9zaXRpb24gPSB0aGlzLm9uUG9zaXRpb247XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBSZW1vdmVzIHJlZ2lzdGVyZWQgY2FsbGJhY2socykgZnJvbSBhIHNvdW5kLCBieSBwb3NpdGlvbiBhbmQvb3IgY2FsbGJhY2suXHJcbiAgICAgKlxyXG4gICAgICogQHBhcmFtIHtudW1iZXJ9IG5Qb3NpdGlvbiBUaGUgcG9zaXRpb24gdG8gY2xlYXIgY2FsbGJhY2socykgZm9yXHJcbiAgICAgKiBAcGFyYW0ge2Z1bmN0aW9ufSBvTWV0aG9kIE9wdGlvbmFsOiBJZGVudGlmeSBvbmUgY2FsbGJhY2sgdG8gYmUgcmVtb3ZlZCB3aGVuIG11bHRpcGxlIGxpc3RlbmVycyBleGlzdCBmb3Igb25lIHBvc2l0aW9uXHJcbiAgICAgKiBAcmV0dXJuIHtTTVNvdW5kfSBUaGUgU01Tb3VuZCBvYmplY3RcclxuICAgICAqL1xyXG5cclxuICAgIHRoaXMuY2xlYXJPblBvc2l0aW9uID0gZnVuY3Rpb24oblBvc2l0aW9uLCBvTWV0aG9kKSB7XHJcblxyXG4gICAgICB2YXIgaTtcclxuXHJcbiAgICAgIG5Qb3NpdGlvbiA9IHBhcnNlSW50KG5Qb3NpdGlvbiwgMTApO1xyXG5cclxuICAgICAgaWYgKGlzTmFOKG5Qb3NpdGlvbikpIHtcclxuICAgICAgICAvLyBzYWZldHkgY2hlY2tcclxuICAgICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIGZvciAoaT0wOyBpIDwgb25Qb3NpdGlvbkl0ZW1zLmxlbmd0aDsgaSsrKSB7XHJcblxyXG4gICAgICAgIGlmIChuUG9zaXRpb24gPT09IG9uUG9zaXRpb25JdGVtc1tpXS5wb3NpdGlvbikge1xyXG4gICAgICAgICAgLy8gcmVtb3ZlIHRoaXMgaXRlbSBpZiBubyBtZXRob2Qgd2FzIHNwZWNpZmllZCwgb3IsIGlmIHRoZSBtZXRob2QgbWF0Y2hlc1xyXG4gICAgICAgICAgaWYgKCFvTWV0aG9kIHx8IChvTWV0aG9kID09PSBvblBvc2l0aW9uSXRlbXNbaV0ubWV0aG9kKSkge1xyXG4gICAgICAgICAgICBpZiAob25Qb3NpdGlvbkl0ZW1zW2ldLmZpcmVkKSB7XHJcbiAgICAgICAgICAgICAgLy8gZGVjcmVtZW50IFwiZmlyZWRcIiBjb3VudGVyLCB0b29cclxuICAgICAgICAgICAgICBvblBvc2l0aW9uRmlyZWQtLTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBvblBvc2l0aW9uSXRlbXMuc3BsaWNlKGksIDEpO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgIH1cclxuXHJcbiAgICB9O1xyXG5cclxuICAgIHRoaXMuX3Byb2Nlc3NPblBvc2l0aW9uID0gZnVuY3Rpb24oKSB7XHJcblxyXG4gICAgICB2YXIgaSwgaXRlbSwgaiA9IG9uUG9zaXRpb25JdGVtcy5sZW5ndGg7XHJcblx0XHRcclxuICAgICAgaWYgKCFqIHx8ICFzLnBsYXlTdGF0ZSB8fCBvblBvc2l0aW9uRmlyZWQgPj0gaikge1xyXG4gICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgICAgfVxyXG5cclxuICAgICAgZm9yIChpPWotMTsgaSA+PSAwOyBpLS0pIHtcclxuICAgICAgICBpdGVtID0gb25Qb3NpdGlvbkl0ZW1zW2ldO1xyXG4gICAgICAgIGlmICghaXRlbS5maXJlZCAmJiBzLnBvc2l0aW9uID49IGl0ZW0ucG9zaXRpb24pIHtcclxuICAgICAgICAgIGl0ZW0uZmlyZWQgPSB0cnVlO1xyXG4gICAgICAgICAgb25Qb3NpdGlvbkZpcmVkKys7XHJcbiAgICAgICAgICBpdGVtLm1ldGhvZC5hcHBseShpdGVtLnNjb3BlLCBbaXRlbS5wb3NpdGlvbl0pO1xyXG5cdFx0ICBqID0gb25Qb3NpdGlvbkl0ZW1zLmxlbmd0aDsgLy8gIHJlc2V0IGogLS0gb25Qb3NpdGlvbkl0ZW1zLmxlbmd0aCBjYW4gYmUgY2hhbmdlZCBpbiB0aGUgaXRlbSBjYWxsYmFjayBhYm92ZS4uLiBvY2Nhc2lvbmFsbHkgYnJlYWtpbmcgdGhlIGxvb3AuXHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcblx0XHJcbiAgICAgIHJldHVybiB0cnVlO1xyXG5cclxuICAgIH07XHJcblxyXG4gICAgdGhpcy5fcmVzZXRPblBvc2l0aW9uID0gZnVuY3Rpb24oblBvc2l0aW9uKSB7XHJcblxyXG4gICAgICAvLyByZXNldCBcImZpcmVkXCIgZm9yIGl0ZW1zIGludGVyZXN0ZWQgaW4gdGhpcyBwb3NpdGlvblxyXG4gICAgICB2YXIgaSwgaXRlbSwgaiA9IG9uUG9zaXRpb25JdGVtcy5sZW5ndGg7XHJcblxyXG4gICAgICBpZiAoIWopIHtcclxuICAgICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIGZvciAoaT1qLTE7IGkgPj0gMDsgaS0tKSB7XHJcbiAgICAgICAgaXRlbSA9IG9uUG9zaXRpb25JdGVtc1tpXTtcclxuICAgICAgICBpZiAoaXRlbS5maXJlZCAmJiBuUG9zaXRpb24gPD0gaXRlbS5wb3NpdGlvbikge1xyXG4gICAgICAgICAgaXRlbS5maXJlZCA9IGZhbHNlO1xyXG4gICAgICAgICAgb25Qb3NpdGlvbkZpcmVkLS07XHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcblxyXG4gICAgICByZXR1cm4gdHJ1ZTtcclxuXHJcbiAgICB9O1xyXG5cclxuICAgIC8qKlxyXG4gICAgICogU01Tb3VuZCgpIHByaXZhdGUgaW50ZXJuYWxzXHJcbiAgICAgKiAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxyXG4gICAgICovXHJcblxyXG4gICAgYXBwbHlGcm9tVG8gPSBmdW5jdGlvbigpIHtcclxuXHJcbiAgICAgIHZhciBpbnN0YW5jZU9wdGlvbnMgPSBzLl9pTyxcclxuICAgICAgICAgIGYgPSBpbnN0YW5jZU9wdGlvbnMuZnJvbSxcclxuICAgICAgICAgIHQgPSBpbnN0YW5jZU9wdGlvbnMudG8sXHJcbiAgICAgICAgICBzdGFydCwgZW5kO1xyXG5cclxuICAgICAgZW5kID0gZnVuY3Rpb24oKSB7XHJcblxyXG4gICAgICAgIC8vIGVuZCBoYXMgYmVlbiByZWFjaGVkLlxyXG4gICAgICAgIHNtMi5fd0Qocy5pZCArICc6IFwiVG9cIiB0aW1lIG9mICcgKyB0ICsgJyByZWFjaGVkLicpO1xyXG5cclxuICAgICAgICAvLyBkZXRhY2ggbGlzdGVuZXJcclxuICAgICAgICBzLmNsZWFyT25Qb3NpdGlvbih0LCBlbmQpO1xyXG5cclxuICAgICAgICAvLyBzdG9wIHNob3VsZCBjbGVhciB0aGlzLCB0b29cclxuICAgICAgICBzLnN0b3AoKTtcclxuXHJcbiAgICAgIH07XHJcblxyXG4gICAgICBzdGFydCA9IGZ1bmN0aW9uKCkge1xyXG5cclxuICAgICAgICBzbTIuX3dEKHMuaWQgKyAnOiBQbGF5aW5nIFwiZnJvbVwiICcgKyBmKTtcclxuXHJcbiAgICAgICAgLy8gYWRkIGxpc3RlbmVyIGZvciBlbmRcclxuICAgICAgICBpZiAodCAhPT0gbnVsbCAmJiAhaXNOYU4odCkpIHtcclxuICAgICAgICAgIHMub25Qb3NpdGlvbih0LCBlbmQpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgIH07XHJcblxyXG4gICAgICBpZiAoZiAhPT0gbnVsbCAmJiAhaXNOYU4oZikpIHtcclxuXHJcbiAgICAgICAgLy8gYXBwbHkgdG8gaW5zdGFuY2Ugb3B0aW9ucywgZ3VhcmFudGVlaW5nIGNvcnJlY3Qgc3RhcnQgcG9zaXRpb24uXHJcbiAgICAgICAgaW5zdGFuY2VPcHRpb25zLnBvc2l0aW9uID0gZjtcclxuXHJcbiAgICAgICAgLy8gbXVsdGlTaG90IHRpbWluZyBjYW4ndCBiZSB0cmFja2VkLCBzbyBwcmV2ZW50IHRoYXQuXHJcbiAgICAgICAgaW5zdGFuY2VPcHRpb25zLm11bHRpU2hvdCA9IGZhbHNlO1xyXG5cclxuICAgICAgICBzdGFydCgpO1xyXG5cclxuICAgICAgfVxyXG5cclxuICAgICAgLy8gcmV0dXJuIHVwZGF0ZWQgaW5zdGFuY2VPcHRpb25zIGluY2x1ZGluZyBzdGFydGluZyBwb3NpdGlvblxyXG4gICAgICByZXR1cm4gaW5zdGFuY2VPcHRpb25zO1xyXG5cclxuICAgIH07XHJcblxyXG4gICAgYXR0YWNoT25Qb3NpdGlvbiA9IGZ1bmN0aW9uKCkge1xyXG5cclxuICAgICAgdmFyIGl0ZW0sXHJcbiAgICAgICAgICBvcCA9IHMuX2lPLm9ucG9zaXRpb247XHJcblxyXG4gICAgICAvLyBhdHRhY2ggb25wb3NpdGlvbiB0aGluZ3MsIGlmIGFueSwgbm93LlxyXG5cclxuICAgICAgaWYgKG9wKSB7XHJcblxyXG4gICAgICAgIGZvciAoaXRlbSBpbiBvcCkge1xyXG4gICAgICAgICAgaWYgKG9wLmhhc093blByb3BlcnR5KGl0ZW0pKSB7XHJcbiAgICAgICAgICAgIHMub25Qb3NpdGlvbihwYXJzZUludChpdGVtLCAxMCksIG9wW2l0ZW1dKTtcclxuICAgICAgICAgIH1cclxuICAgICAgICB9XHJcblxyXG4gICAgICB9XHJcblxyXG4gICAgfTtcclxuXHJcbiAgICBkZXRhY2hPblBvc2l0aW9uID0gZnVuY3Rpb24oKSB7XHJcblxyXG4gICAgICB2YXIgaXRlbSxcclxuICAgICAgICAgIG9wID0gcy5faU8ub25wb3NpdGlvbjtcclxuXHJcbiAgICAgIC8vIGRldGFjaCBhbnkgb25wb3NpdGlvbigpLXN0eWxlIGxpc3RlbmVycy5cclxuXHJcbiAgICAgIGlmIChvcCkge1xyXG5cclxuICAgICAgICBmb3IgKGl0ZW0gaW4gb3ApIHtcclxuICAgICAgICAgIGlmIChvcC5oYXNPd25Qcm9wZXJ0eShpdGVtKSkge1xyXG4gICAgICAgICAgICBzLmNsZWFyT25Qb3NpdGlvbihwYXJzZUludChpdGVtLCAxMCkpO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgIH1cclxuXHJcbiAgICB9O1xyXG5cclxuICAgIHN0YXJ0X2h0bWw1X3RpbWVyID0gZnVuY3Rpb24oKSB7XHJcblxyXG4gICAgICBpZiAocy5pc0hUTUw1KSB7XHJcbiAgICAgICAgc3RhcnRUaW1lcihzKTtcclxuICAgICAgfVxyXG5cclxuICAgIH07XHJcblxyXG4gICAgc3RvcF9odG1sNV90aW1lciA9IGZ1bmN0aW9uKCkge1xyXG5cclxuICAgICAgaWYgKHMuaXNIVE1MNSkge1xyXG4gICAgICAgIHN0b3BUaW1lcihzKTtcclxuICAgICAgfVxyXG5cclxuICAgIH07XHJcblxyXG4gICAgcmVzZXRQcm9wZXJ0aWVzID0gZnVuY3Rpb24ocmV0YWluUG9zaXRpb24pIHtcclxuXHJcbiAgICAgIGlmICghcmV0YWluUG9zaXRpb24pIHtcclxuICAgICAgICBvblBvc2l0aW9uSXRlbXMgPSBbXTtcclxuICAgICAgICBvblBvc2l0aW9uRmlyZWQgPSAwO1xyXG4gICAgICB9XHJcblxyXG4gICAgICBvbnBsYXlfY2FsbGVkID0gZmFsc2U7XHJcblxyXG4gICAgICBzLl9oYXNUaW1lciA9IG51bGw7XHJcbiAgICAgIHMuX2EgPSBudWxsO1xyXG4gICAgICBzLl9odG1sNV9jYW5wbGF5ID0gZmFsc2U7XHJcbiAgICAgIHMuYnl0ZXNMb2FkZWQgPSBudWxsO1xyXG4gICAgICBzLmJ5dGVzVG90YWwgPSBudWxsO1xyXG4gICAgICBzLmR1cmF0aW9uID0gKHMuX2lPICYmIHMuX2lPLmR1cmF0aW9uID8gcy5faU8uZHVyYXRpb24gOiBudWxsKTtcclxuICAgICAgcy5kdXJhdGlvbkVzdGltYXRlID0gbnVsbDtcclxuICAgICAgcy5idWZmZXJlZCA9IFtdO1xyXG5cclxuICAgICAgLy8gbGVnYWN5OiAxRCBhcnJheVxyXG4gICAgICBzLmVxRGF0YSA9IFtdO1xyXG5cclxuICAgICAgcy5lcURhdGEubGVmdCA9IFtdO1xyXG4gICAgICBzLmVxRGF0YS5yaWdodCA9IFtdO1xyXG5cclxuICAgICAgcy5mYWlsdXJlcyA9IDA7XHJcbiAgICAgIHMuaXNCdWZmZXJpbmcgPSBmYWxzZTtcclxuICAgICAgcy5pbnN0YW5jZU9wdGlvbnMgPSB7fTtcclxuICAgICAgcy5pbnN0YW5jZUNvdW50ID0gMDtcclxuICAgICAgcy5sb2FkZWQgPSBmYWxzZTtcclxuICAgICAgcy5tZXRhZGF0YSA9IHt9O1xyXG5cclxuICAgICAgLy8gMCA9IHVuaW5pdGlhbGlzZWQsIDEgPSBsb2FkaW5nLCAyID0gZmFpbGVkL2Vycm9yLCAzID0gbG9hZGVkL3N1Y2Nlc3NcclxuICAgICAgcy5yZWFkeVN0YXRlID0gMDtcclxuXHJcbiAgICAgIHMubXV0ZWQgPSBmYWxzZTtcclxuICAgICAgcy5wYXVzZWQgPSBmYWxzZTtcclxuXHJcbiAgICAgIHMucGVha0RhdGEgPSB7XHJcbiAgICAgICAgbGVmdDogMCxcclxuICAgICAgICByaWdodDogMFxyXG4gICAgICB9O1xyXG5cclxuICAgICAgcy53YXZlZm9ybURhdGEgPSB7XHJcbiAgICAgICAgbGVmdDogW10sXHJcbiAgICAgICAgcmlnaHQ6IFtdXHJcbiAgICAgIH07XHJcblxyXG4gICAgICBzLnBsYXlTdGF0ZSA9IDA7XHJcbiAgICAgIHMucG9zaXRpb24gPSBudWxsO1xyXG5cclxuICAgICAgcy5pZDMgPSB7fTtcclxuXHJcbiAgICB9O1xyXG5cclxuICAgIHJlc2V0UHJvcGVydGllcygpO1xyXG5cclxuICAgIC8qKlxyXG4gICAgICogUHNldWRvLXByaXZhdGUgU01Tb3VuZCBpbnRlcm5hbHNcclxuICAgICAqIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXHJcbiAgICAgKi9cclxuXHJcbiAgICB0aGlzLl9vblRpbWVyID0gZnVuY3Rpb24oYkZvcmNlKSB7XHJcblxyXG4gICAgICAvKipcclxuICAgICAgICogSFRNTDUtb25seSBfd2hpbGVwbGF5aW5nKCkgZXRjLlxyXG4gICAgICAgKiBjYWxsZWQgZnJvbSBib3RoIEhUTUw1IG5hdGl2ZSBldmVudHMsIGFuZCBwb2xsaW5nL2ludGVydmFsLWJhc2VkIHRpbWVyc1xyXG4gICAgICAgKiBtaW1pY3MgZmxhc2ggYW5kIGZpcmVzIG9ubHkgd2hlbiB0aW1lL2R1cmF0aW9uIGNoYW5nZSwgc28gYXMgdG8gYmUgcG9sbGluZy1mcmllbmRseVxyXG4gICAgICAgKi9cclxuXHJcbiAgICAgIHZhciBkdXJhdGlvbiwgaXNOZXcgPSBmYWxzZSwgdGltZSwgeCA9IHt9O1xyXG5cclxuICAgICAgaWYgKHMuX2hhc1RpbWVyIHx8IGJGb3JjZSkge1xyXG5cclxuICAgICAgICAvLyBUT0RPOiBNYXkgbm90IG5lZWQgdG8gdHJhY2sgcmVhZHlTdGF0ZSAoMSA9IGxvYWRpbmcpXHJcblxyXG4gICAgICAgIGlmIChzLl9hICYmIChiRm9yY2UgfHwgKChzLnBsYXlTdGF0ZSA+IDAgfHwgcy5yZWFkeVN0YXRlID09PSAxKSAmJiAhcy5wYXVzZWQpKSkge1xyXG5cclxuICAgICAgICAgIGR1cmF0aW9uID0gcy5fZ2V0X2h0bWw1X2R1cmF0aW9uKCk7XHJcblxyXG4gICAgICAgICAgaWYgKGR1cmF0aW9uICE9PSBsYXN0SFRNTDVTdGF0ZS5kdXJhdGlvbikge1xyXG5cclxuICAgICAgICAgICAgbGFzdEhUTUw1U3RhdGUuZHVyYXRpb24gPSBkdXJhdGlvbjtcclxuICAgICAgICAgICAgcy5kdXJhdGlvbiA9IGR1cmF0aW9uO1xyXG4gICAgICAgICAgICBpc05ldyA9IHRydWU7XHJcblxyXG4gICAgICAgICAgfVxyXG5cclxuICAgICAgICAgIC8vIFRPRE86IGludmVzdGlnYXRlIHdoeSB0aGlzIGdvZXMgd2FjayBpZiBub3Qgc2V0L3JlLXNldCBlYWNoIHRpbWUuXHJcbiAgICAgICAgICBzLmR1cmF0aW9uRXN0aW1hdGUgPSBzLmR1cmF0aW9uO1xyXG5cclxuICAgICAgICAgIHRpbWUgPSAocy5fYS5jdXJyZW50VGltZSAqIG1zZWNTY2FsZSB8fCAwKTtcclxuXHJcbiAgICAgICAgICBpZiAodGltZSAhPT0gbGFzdEhUTUw1U3RhdGUudGltZSkge1xyXG5cclxuICAgICAgICAgICAgbGFzdEhUTUw1U3RhdGUudGltZSA9IHRpbWU7XHJcbiAgICAgICAgICAgIGlzTmV3ID0gdHJ1ZTtcclxuXHJcbiAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgaWYgKGlzTmV3IHx8IGJGb3JjZSkge1xyXG5cclxuICAgICAgICAgICAgcy5fd2hpbGVwbGF5aW5nKHRpbWUseCx4LHgseCk7XHJcblxyXG4gICAgICAgICAgfVxyXG5cclxuICAgICAgICB9LyogZWxzZSB7XHJcblxyXG4gICAgICAgICAgLy8gc20yLl93RCgnX29uVGltZXI6IFdhcm4gZm9yIFwiJytzLmlkKydcIjogJysoIXMuX2E/J0NvdWxkIG5vdCBmaW5kIGVsZW1lbnQuICc6JycpKyhzLnBsYXlTdGF0ZSA9PT0gMD8ncGxheVN0YXRlIGJhZCwgMD8nOidwbGF5U3RhdGUgPSAnK3MucGxheVN0YXRlKycsIE9LJykpO1xyXG5cclxuICAgICAgICAgIHJldHVybiBmYWxzZTtcclxuXHJcbiAgICAgICAgfSovXHJcblxyXG4gICAgICAgIHJldHVybiBpc05ldztcclxuXHJcbiAgICAgIH1cclxuXHJcbiAgICB9O1xyXG5cclxuICAgIHRoaXMuX2dldF9odG1sNV9kdXJhdGlvbiA9IGZ1bmN0aW9uKCkge1xyXG5cclxuICAgICAgdmFyIGluc3RhbmNlT3B0aW9ucyA9IHMuX2lPLFxyXG4gICAgICAgICAgLy8gaWYgYXVkaW8gb2JqZWN0IGV4aXN0cywgdXNlIGl0cyBkdXJhdGlvbiAtIGVsc2UsIGluc3RhbmNlIG9wdGlvbiBkdXJhdGlvbiAoaWYgcHJvdmlkZWQgLSBpdCdzIGEgaGFjaywgcmVhbGx5LCBhbmQgc2hvdWxkIGJlIHJldGlyZWQpIE9SIG51bGxcclxuICAgICAgICAgIGQgPSAocy5fYSAmJiBzLl9hLmR1cmF0aW9uID8gcy5fYS5kdXJhdGlvbiptc2VjU2NhbGUgOiAoaW5zdGFuY2VPcHRpb25zICYmIGluc3RhbmNlT3B0aW9ucy5kdXJhdGlvbiA/IGluc3RhbmNlT3B0aW9ucy5kdXJhdGlvbiA6IG51bGwpKSxcclxuICAgICAgICAgIHJlc3VsdCA9IChkICYmICFpc05hTihkKSAmJiBkICE9PSBJbmZpbml0eSA/IGQgOiBudWxsKTtcclxuXHJcbiAgICAgIHJldHVybiByZXN1bHQ7XHJcblxyXG4gICAgfTtcclxuXHJcbiAgICB0aGlzLl9hcHBseV9sb29wID0gZnVuY3Rpb24oYSwgbkxvb3BzKSB7XHJcblxyXG4gICAgICAvKipcclxuICAgICAgICogYm9vbGVhbiBpbnN0ZWFkIG9mIFwibG9vcFwiLCBmb3Igd2Via2l0PyAtIHNwZWMgc2F5cyBzdHJpbmcuIGh0dHA6Ly93d3cudzMub3JnL1RSL2h0bWwtbWFya3VwL2F1ZGlvLmh0bWwjYXVkaW8uYXR0cnMubG9vcFxyXG4gICAgICAgKiBub3RlIHRoYXQgbG9vcCBpcyBlaXRoZXIgb2ZmIG9yIGluZmluaXRlIHVuZGVyIEhUTUw1LCB1bmxpa2UgRmxhc2ggd2hpY2ggYWxsb3dzIGFyYml0cmFyeSBsb29wIGNvdW50cyB0byBiZSBzcGVjaWZpZWQuXHJcbiAgICAgICAqL1xyXG5cclxuICAgICAgLy8gPGQ+XHJcbiAgICAgIGlmICghYS5sb29wICYmIG5Mb29wcyA+IDEpIHtcclxuICAgICAgICBzbTIuX3dEKCdOb3RlOiBOYXRpdmUgSFRNTDUgbG9vcGluZyBpcyBpbmZpbml0ZS4nLCAxKTtcclxuICAgICAgfVxyXG4gICAgICAvLyA8L2Q+XHJcblxyXG4gICAgICBhLmxvb3AgPSAobkxvb3BzID4gMSA/ICdsb29wJyA6ICcnKTtcclxuXHJcbiAgICB9O1xyXG5cclxuICAgIHRoaXMuX3NldHVwX2h0bWw1ID0gZnVuY3Rpb24ob09wdGlvbnMpIHtcclxuXHJcbiAgICAgIHZhciBpbnN0YW5jZU9wdGlvbnMgPSBtaXhpbihzLl9pTywgb09wdGlvbnMpLFxyXG4gICAgICAgICAgYSA9IHVzZUdsb2JhbEhUTUw1QXVkaW8gPyBnbG9iYWxIVE1MNUF1ZGlvIDogcy5fYSxcclxuICAgICAgICAgIGRVUkwgPSBkZWNvZGVVUkkoaW5zdGFuY2VPcHRpb25zLnVybCksXHJcbiAgICAgICAgICBzYW1lVVJMO1xyXG5cclxuICAgICAgLyoqXHJcbiAgICAgICAqIFwiRmlyc3QgdGhpbmdzIGZpcnN0LCBJLCBQb3BwYS4uLlwiIChyZXNldCB0aGUgcHJldmlvdXMgc3RhdGUgb2YgdGhlIG9sZCBzb3VuZCwgaWYgcGxheWluZylcclxuICAgICAgICogRml4ZXMgY2FzZSB3aXRoIGRldmljZXMgdGhhdCBjYW4gb25seSBwbGF5IG9uZSBzb3VuZCBhdCBhIHRpbWVcclxuICAgICAgICogT3RoZXJ3aXNlLCBvdGhlciBzb3VuZHMgaW4gbWlkLXBsYXkgd2lsbCBiZSB0ZXJtaW5hdGVkIHdpdGhvdXQgd2FybmluZyBhbmQgaW4gYSBzdHVjayBzdGF0ZVxyXG4gICAgICAgKi9cclxuXHJcbiAgICAgIGlmICh1c2VHbG9iYWxIVE1MNUF1ZGlvKSB7XHJcblxyXG4gICAgICAgIGlmIChkVVJMID09PSBkZWNvZGVVUkkobGFzdEdsb2JhbEhUTUw1VVJMKSkge1xyXG4gICAgICAgICAgLy8gZ2xvYmFsIEhUTUw1IGF1ZGlvOiByZS11c2Ugb2YgVVJMXHJcbiAgICAgICAgICBzYW1lVVJMID0gdHJ1ZTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICB9IGVsc2UgaWYgKGRVUkwgPT09IGRlY29kZVVSSShsYXN0VVJMKSkge1xyXG5cclxuICAgICAgICAvLyBvcHRpb25zIFVSTCBpcyB0aGUgc2FtZSBhcyB0aGUgXCJsYXN0XCIgVVJMLCBhbmQgd2UgdXNlZCAobG9hZGVkKSBpdFxyXG4gICAgICAgIHNhbWVVUkwgPSB0cnVlO1xyXG5cclxuICAgICAgfVxyXG5cclxuICAgICAgaWYgKGEpIHtcclxuXHJcbiAgICAgICAgaWYgKGEuX3MpIHtcclxuXHJcbiAgICAgICAgICBpZiAodXNlR2xvYmFsSFRNTDVBdWRpbykge1xyXG5cclxuICAgICAgICAgICAgaWYgKGEuX3MgJiYgYS5fcy5wbGF5U3RhdGUgJiYgIXNhbWVVUkwpIHtcclxuXHJcbiAgICAgICAgICAgICAgLy8gZ2xvYmFsIEhUTUw1IGF1ZGlvIGNhc2UsIGFuZCBsb2FkaW5nIGEgbmV3IFVSTC4gc3RvcCB0aGUgY3VycmVudGx5LXBsYXlpbmcgb25lLlxyXG4gICAgICAgICAgICAgIGEuX3Muc3RvcCgpO1xyXG5cclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgIH0gZWxzZSBpZiAoIXVzZUdsb2JhbEhUTUw1QXVkaW8gJiYgZFVSTCA9PT0gZGVjb2RlVVJJKGxhc3RVUkwpKSB7XHJcblxyXG4gICAgICAgICAgICAvLyBub24tZ2xvYmFsIEhUTUw1IHJldXNlIGNhc2U6IHNhbWUgdXJsLCBpZ25vcmUgcmVxdWVzdFxyXG4gICAgICAgICAgICBzLl9hcHBseV9sb29wKGEsIGluc3RhbmNlT3B0aW9ucy5sb29wcyk7XHJcblxyXG4gICAgICAgICAgICByZXR1cm4gYTtcclxuXHJcbiAgICAgICAgICB9XHJcblxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgaWYgKCFzYW1lVVJMKSB7XHJcblxyXG4gICAgICAgICAgLy8gZG9uJ3QgcmV0YWluIG9uUG9zaXRpb24oKSBzdHVmZiB3aXRoIG5ldyBVUkxzLlxyXG5cclxuICAgICAgICAgIGlmIChsYXN0VVJMKSB7XHJcbiAgICAgICAgICAgIHJlc2V0UHJvcGVydGllcyhmYWxzZSk7XHJcbiAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgLy8gYXNzaWduIG5ldyBIVE1MNSBVUkxcclxuXHJcbiAgICAgICAgICBhLnNyYyA9IGluc3RhbmNlT3B0aW9ucy51cmw7XHJcblxyXG4gICAgICAgICAgcy51cmwgPSBpbnN0YW5jZU9wdGlvbnMudXJsO1xyXG5cclxuICAgICAgICAgIGxhc3RVUkwgPSBpbnN0YW5jZU9wdGlvbnMudXJsO1xyXG5cclxuICAgICAgICAgIGxhc3RHbG9iYWxIVE1MNVVSTCA9IGluc3RhbmNlT3B0aW9ucy51cmw7XHJcblxyXG4gICAgICAgICAgYS5fY2FsbGVkX2xvYWQgPSBmYWxzZTtcclxuXHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgfSBlbHNlIHtcclxuXHJcbiAgICAgICAgaWYgKGluc3RhbmNlT3B0aW9ucy5hdXRvTG9hZCB8fCBpbnN0YW5jZU9wdGlvbnMuYXV0b1BsYXkpIHtcclxuXHJcbiAgICAgICAgICBzLl9hID0gbmV3IEF1ZGlvKGluc3RhbmNlT3B0aW9ucy51cmwpO1xyXG4gICAgICAgICAgcy5fYS5sb2FkKCk7XHJcblxyXG4gICAgICAgIH0gZWxzZSB7XHJcblxyXG4gICAgICAgICAgLy8gbnVsbCBmb3Igc3R1cGlkIE9wZXJhIDkuNjQgY2FzZVxyXG4gICAgICAgICAgcy5fYSA9IChpc09wZXJhICYmIG9wZXJhLnZlcnNpb24oKSA8IDEwID8gbmV3IEF1ZGlvKG51bGwpIDogbmV3IEF1ZGlvKCkpO1xyXG5cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8vIGFzc2lnbiBsb2NhbCByZWZlcmVuY2VcclxuICAgICAgICBhID0gcy5fYTtcclxuXHJcbiAgICAgICAgYS5fY2FsbGVkX2xvYWQgPSBmYWxzZTtcclxuXHJcbiAgICAgICAgaWYgKHVzZUdsb2JhbEhUTUw1QXVkaW8pIHtcclxuXHJcbiAgICAgICAgICBnbG9iYWxIVE1MNUF1ZGlvID0gYTtcclxuXHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgfVxyXG5cclxuICAgICAgcy5pc0hUTUw1ID0gdHJ1ZTtcclxuXHJcbiAgICAgIC8vIHN0b3JlIGEgcmVmIG9uIHRoZSB0cmFja1xyXG4gICAgICBzLl9hID0gYTtcclxuXHJcbiAgICAgIC8vIHN0b3JlIGEgcmVmIG9uIHRoZSBhdWRpb1xyXG4gICAgICBhLl9zID0gcztcclxuXHJcbiAgICAgIGFkZF9odG1sNV9ldmVudHMoKTtcclxuXHJcbiAgICAgIHMuX2FwcGx5X2xvb3AoYSwgaW5zdGFuY2VPcHRpb25zLmxvb3BzKTtcclxuXHJcbiAgICAgIGlmIChpbnN0YW5jZU9wdGlvbnMuYXV0b0xvYWQgfHwgaW5zdGFuY2VPcHRpb25zLmF1dG9QbGF5KSB7XHJcblxyXG4gICAgICAgIHMubG9hZCgpO1xyXG5cclxuICAgICAgfSBlbHNlIHtcclxuXHJcbiAgICAgICAgLy8gZWFybHkgSFRNTDUgaW1wbGVtZW50YXRpb24gKG5vbi1zdGFuZGFyZClcclxuICAgICAgICBhLmF1dG9idWZmZXIgPSBmYWxzZTtcclxuXHJcbiAgICAgICAgLy8gc3RhbmRhcmQgKCdub25lJyBpcyBhbHNvIGFuIG9wdGlvbi4pXHJcbiAgICAgICAgYS5wcmVsb2FkID0gJ2F1dG8nO1xyXG5cclxuICAgICAgfVxyXG5cclxuICAgICAgcmV0dXJuIGE7XHJcblxyXG4gICAgfTtcclxuXHJcbiAgICBhZGRfaHRtbDVfZXZlbnRzID0gZnVuY3Rpb24oKSB7XHJcblxyXG4gICAgICBpZiAocy5fYS5fYWRkZWRfZXZlbnRzKSB7XHJcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgICB9XHJcblxyXG4gICAgICB2YXIgZjtcclxuXHJcbiAgICAgIGZ1bmN0aW9uIGFkZChvRXZ0LCBvRm4sIGJDYXB0dXJlKSB7XHJcbiAgICAgICAgcmV0dXJuIHMuX2EgPyBzLl9hLmFkZEV2ZW50TGlzdGVuZXIob0V2dCwgb0ZuLCBiQ2FwdHVyZXx8ZmFsc2UpIDogbnVsbDtcclxuICAgICAgfVxyXG5cclxuICAgICAgcy5fYS5fYWRkZWRfZXZlbnRzID0gdHJ1ZTtcclxuXHJcbiAgICAgIGZvciAoZiBpbiBodG1sNV9ldmVudHMpIHtcclxuICAgICAgICBpZiAoaHRtbDVfZXZlbnRzLmhhc093blByb3BlcnR5KGYpKSB7XHJcbiAgICAgICAgICBhZGQoZiwgaHRtbDVfZXZlbnRzW2ZdKTtcclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIHJldHVybiB0cnVlO1xyXG5cclxuICAgIH07XHJcblxyXG4gICAgcmVtb3ZlX2h0bWw1X2V2ZW50cyA9IGZ1bmN0aW9uKCkge1xyXG5cclxuICAgICAgLy8gUmVtb3ZlIGV2ZW50IGxpc3RlbmVyc1xyXG5cclxuICAgICAgdmFyIGY7XHJcblxyXG4gICAgICBmdW5jdGlvbiByZW1vdmUob0V2dCwgb0ZuLCBiQ2FwdHVyZSkge1xyXG4gICAgICAgIHJldHVybiAocy5fYSA/IHMuX2EucmVtb3ZlRXZlbnRMaXN0ZW5lcihvRXZ0LCBvRm4sIGJDYXB0dXJlfHxmYWxzZSkgOiBudWxsKTtcclxuICAgICAgfVxyXG5cclxuICAgICAgc20yLl93RChzLmlkICsgJzogUmVtb3ZpbmcgZXZlbnQgbGlzdGVuZXJzJyk7XHJcbiAgICAgIHMuX2EuX2FkZGVkX2V2ZW50cyA9IGZhbHNlO1xyXG5cclxuICAgICAgZm9yIChmIGluIGh0bWw1X2V2ZW50cykge1xyXG4gICAgICAgIGlmIChodG1sNV9ldmVudHMuaGFzT3duUHJvcGVydHkoZikpIHtcclxuICAgICAgICAgIHJlbW92ZShmLCBodG1sNV9ldmVudHNbZl0pO1xyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG5cclxuICAgIH07XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBQc2V1ZG8tcHJpdmF0ZSBldmVudCBpbnRlcm5hbHNcclxuICAgICAqIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxyXG4gICAgICovXHJcblxyXG4gICAgdGhpcy5fb25sb2FkID0gZnVuY3Rpb24oblN1Y2Nlc3MpIHtcclxuXHJcbiAgICAgIHZhciBmTixcclxuICAgICAgICAgIC8vIGNoZWNrIGZvciBkdXJhdGlvbiB0byBwcmV2ZW50IGZhbHNlIHBvc2l0aXZlcyBmcm9tIGZsYXNoIDggd2hlbiBsb2FkaW5nIGZyb20gY2FjaGUuXHJcbiAgICAgICAgICBsb2FkT0sgPSAhIW5TdWNjZXNzIHx8ICghcy5pc0hUTUw1ICYmIGZWID09PSA4ICYmIHMuZHVyYXRpb24pO1xyXG5cclxuICAgICAgLy8gPGQ+XHJcbiAgICAgIGZOID0gcy5pZCArICc6ICc7XHJcbiAgICAgIHNtMi5fd0QoZk4gKyAobG9hZE9LID8gJ29ubG9hZCgpJyA6ICdGYWlsZWQgdG8gbG9hZCAvIGludmFsaWQgc291bmQ/JyArICghcy5kdXJhdGlvbiA/ICcgWmVyby1sZW5ndGggZHVyYXRpb24gcmVwb3J0ZWQuJyA6ICcgLScpICsgJyAoJyArIHMudXJsICsgJyknKSwgKGxvYWRPSyA/IDEgOiAyKSk7XHJcbiAgICAgIGlmICghbG9hZE9LICYmICFzLmlzSFRNTDUpIHtcclxuICAgICAgICBpZiAoc20yLnNhbmRib3gubm9SZW1vdGUgPT09IHRydWUpIHtcclxuICAgICAgICAgIHNtMi5fd0QoZk4gKyBzdHIoJ25vTmV0JyksIDEpO1xyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAoc20yLnNhbmRib3gubm9Mb2NhbCA9PT0gdHJ1ZSkge1xyXG4gICAgICAgICAgc20yLl93RChmTiArIHN0cignbm9Mb2NhbCcpLCAxKTtcclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuICAgICAgLy8gPC9kPlxyXG5cclxuICAgICAgcy5sb2FkZWQgPSBsb2FkT0s7XHJcbiAgICAgIHMucmVhZHlTdGF0ZSA9IGxvYWRPSz8zOjI7XHJcbiAgICAgIHMuX29uYnVmZmVyY2hhbmdlKDApO1xyXG5cclxuICAgICAgaWYgKHMuX2lPLm9ubG9hZCkge1xyXG4gICAgICAgIHdyYXBDYWxsYmFjayhzLCBmdW5jdGlvbigpIHtcclxuICAgICAgICAgIHMuX2lPLm9ubG9hZC5hcHBseShzLCBbbG9hZE9LXSk7XHJcbiAgICAgICAgfSk7XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIHJldHVybiB0cnVlO1xyXG5cclxuICAgIH07XHJcblxyXG4gICAgdGhpcy5fb25idWZmZXJjaGFuZ2UgPSBmdW5jdGlvbihuSXNCdWZmZXJpbmcpIHtcclxuXHJcbiAgICAgIGlmIChzLnBsYXlTdGF0ZSA9PT0gMCkge1xyXG4gICAgICAgIC8vIGlnbm9yZSBpZiBub3QgcGxheWluZ1xyXG4gICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgICAgfVxyXG5cclxuICAgICAgaWYgKChuSXNCdWZmZXJpbmcgJiYgcy5pc0J1ZmZlcmluZykgfHwgKCFuSXNCdWZmZXJpbmcgJiYgIXMuaXNCdWZmZXJpbmcpKSB7XHJcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgICB9XHJcblxyXG4gICAgICBzLmlzQnVmZmVyaW5nID0gKG5Jc0J1ZmZlcmluZyA9PT0gMSk7XHJcbiAgICAgIGlmIChzLl9pTy5vbmJ1ZmZlcmNoYW5nZSkge1xyXG4gICAgICAgIHNtMi5fd0Qocy5pZCArICc6IEJ1ZmZlciBzdGF0ZSBjaGFuZ2U6ICcgKyBuSXNCdWZmZXJpbmcpO1xyXG4gICAgICAgIHMuX2lPLm9uYnVmZmVyY2hhbmdlLmFwcGx5KHMsIFtuSXNCdWZmZXJpbmddKTtcclxuICAgICAgfVxyXG5cclxuICAgICAgcmV0dXJuIHRydWU7XHJcblxyXG4gICAgfTtcclxuXHJcbiAgICAvKipcclxuICAgICAqIFBsYXliYWNrIG1heSBoYXZlIHN0b3BwZWQgZHVlIHRvIGJ1ZmZlcmluZywgb3IgcmVsYXRlZCByZWFzb24uXHJcbiAgICAgKiBUaGlzIHN0YXRlIGNhbiBiZSBlbmNvdW50ZXJlZCBvbiBpT1MgPCA2IHdoZW4gYXV0by1wbGF5IGlzIGJsb2NrZWQuXHJcbiAgICAgKi9cclxuXHJcbiAgICB0aGlzLl9vbnN1c3BlbmQgPSBmdW5jdGlvbigpIHtcclxuXHJcbiAgICAgIGlmIChzLl9pTy5vbnN1c3BlbmQpIHtcclxuICAgICAgICBzbTIuX3dEKHMuaWQgKyAnOiBQbGF5YmFjayBzdXNwZW5kZWQnKTtcclxuICAgICAgICBzLl9pTy5vbnN1c3BlbmQuYXBwbHkocyk7XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIHJldHVybiB0cnVlO1xyXG5cclxuICAgIH07XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBmbGFzaCA5L21vdmllU3RhciArIFJUTVAtb25seSBtZXRob2QsIHNob3VsZCBmaXJlIG9ubHkgb25jZSBhdCBtb3N0XHJcbiAgICAgKiBhdCB0aGlzIHBvaW50IHdlIGp1c3QgcmVjcmVhdGUgZmFpbGVkIHNvdW5kcyByYXRoZXIgdGhhbiB0cnlpbmcgdG8gcmVjb25uZWN0XHJcbiAgICAgKi9cclxuXHJcbiAgICB0aGlzLl9vbmZhaWx1cmUgPSBmdW5jdGlvbihtc2csIGxldmVsLCBjb2RlKSB7XHJcblxyXG4gICAgICBzLmZhaWx1cmVzKys7XHJcbiAgICAgIHNtMi5fd0Qocy5pZCArICc6IEZhaWx1cmUgKCcgKyBzLmZhaWx1cmVzICsgJyk6ICcgKyBtc2cpO1xyXG5cclxuICAgICAgaWYgKHMuX2lPLm9uZmFpbHVyZSAmJiBzLmZhaWx1cmVzID09PSAxKSB7XHJcbiAgICAgICAgcy5faU8ub25mYWlsdXJlKG1zZywgbGV2ZWwsIGNvZGUpO1xyXG4gICAgICB9IGVsc2Uge1xyXG4gICAgICAgIHNtMi5fd0Qocy5pZCArICc6IElnbm9yaW5nIGZhaWx1cmUnKTtcclxuICAgICAgfVxyXG5cclxuICAgIH07XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBmbGFzaCA5L21vdmllU3RhciArIFJUTVAtb25seSBtZXRob2QgZm9yIHVuaGFuZGxlZCB3YXJuaW5ncy9leGNlcHRpb25zIGZyb20gRmxhc2hcclxuICAgICAqIGUuZy4sIFJUTVAgXCJtZXRob2QgbWlzc2luZ1wiIHdhcm5pbmcgKG5vbi1mYXRhbCkgZm9yIGdldFN0cmVhbUxlbmd0aCBvbiBzZXJ2ZXJcclxuICAgICAqL1xyXG5cclxuICAgIHRoaXMuX29ud2FybmluZyA9IGZ1bmN0aW9uKG1zZywgbGV2ZWwsIGNvZGUpIHtcclxuXHJcbiAgICAgIGlmIChzLl9pTy5vbndhcm5pbmcpIHtcclxuICAgICAgICBzLl9pTy5vbndhcm5pbmcobXNnLCBsZXZlbCwgY29kZSk7XHJcbiAgICAgIH1cclxuXHJcbiAgICB9O1xyXG5cclxuICAgIHRoaXMuX29uZmluaXNoID0gZnVuY3Rpb24oKSB7XHJcblxyXG4gICAgICAvLyBzdG9yZSBsb2NhbCBjb3B5IGJlZm9yZSBpdCBnZXRzIHRyYXNoZWQuLi5cclxuICAgICAgdmFyIGlvX29uZmluaXNoID0gcy5faU8ub25maW5pc2g7XHJcblxyXG4gICAgICBzLl9vbmJ1ZmZlcmNoYW5nZSgwKTtcclxuICAgICAgcy5fcmVzZXRPblBvc2l0aW9uKDApO1xyXG5cclxuICAgICAgLy8gcmVzZXQgc29tZSBzdGF0ZSBpdGVtc1xyXG4gICAgICBpZiAocy5pbnN0YW5jZUNvdW50KSB7XHJcblxyXG4gICAgICAgIHMuaW5zdGFuY2VDb3VudC0tO1xyXG5cclxuICAgICAgICBpZiAoIXMuaW5zdGFuY2VDb3VudCkge1xyXG5cclxuICAgICAgICAgIC8vIHJlbW92ZSBvblBvc2l0aW9uIGxpc3RlbmVycywgaWYgYW55XHJcbiAgICAgICAgICBkZXRhY2hPblBvc2l0aW9uKCk7XHJcblxyXG4gICAgICAgICAgLy8gcmVzZXQgaW5zdGFuY2Ugb3B0aW9uc1xyXG4gICAgICAgICAgcy5wbGF5U3RhdGUgPSAwO1xyXG4gICAgICAgICAgcy5wYXVzZWQgPSBmYWxzZTtcclxuICAgICAgICAgIHMuaW5zdGFuY2VDb3VudCA9IDA7XHJcbiAgICAgICAgICBzLmluc3RhbmNlT3B0aW9ucyA9IHt9O1xyXG4gICAgICAgICAgcy5faU8gPSB7fTtcclxuICAgICAgICAgIHN0b3BfaHRtbDVfdGltZXIoKTtcclxuXHJcbiAgICAgICAgICAvLyByZXNldCBwb3NpdGlvbiwgdG9vXHJcbiAgICAgICAgICBpZiAocy5pc0hUTUw1KSB7XHJcbiAgICAgICAgICAgIHMucG9zaXRpb24gPSAwO1xyXG4gICAgICAgICAgfVxyXG5cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGlmICghcy5pbnN0YW5jZUNvdW50IHx8IHMuX2lPLm11bHRpU2hvdEV2ZW50cykge1xyXG4gICAgICAgICAgLy8gZmlyZSBvbmZpbmlzaCBmb3IgbGFzdCwgb3IgZXZlcnkgaW5zdGFuY2VcclxuICAgICAgICAgIGlmIChpb19vbmZpbmlzaCkge1xyXG4gICAgICAgICAgICBzbTIuX3dEKHMuaWQgKyAnOiBvbmZpbmlzaCgpJyk7XHJcbiAgICAgICAgICAgIHdyYXBDYWxsYmFjayhzLCBmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgICBpb19vbmZpbmlzaC5hcHBseShzKTtcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgfVxyXG5cclxuICAgIH07XHJcblxyXG4gICAgdGhpcy5fd2hpbGVsb2FkaW5nID0gZnVuY3Rpb24obkJ5dGVzTG9hZGVkLCBuQnl0ZXNUb3RhbCwgbkR1cmF0aW9uLCBuQnVmZmVyTGVuZ3RoKSB7XHJcblxyXG4gICAgICB2YXIgaW5zdGFuY2VPcHRpb25zID0gcy5faU87XHJcblxyXG4gICAgICBzLmJ5dGVzTG9hZGVkID0gbkJ5dGVzTG9hZGVkO1xyXG4gICAgICBzLmJ5dGVzVG90YWwgPSBuQnl0ZXNUb3RhbDtcclxuICAgICAgcy5kdXJhdGlvbiA9IE1hdGguZmxvb3IobkR1cmF0aW9uKTtcclxuICAgICAgcy5idWZmZXJMZW5ndGggPSBuQnVmZmVyTGVuZ3RoO1xyXG5cclxuICAgICAgaWYgKCFzLmlzSFRNTDUgJiYgIWluc3RhbmNlT3B0aW9ucy5pc01vdmllU3Rhcikge1xyXG5cclxuICAgICAgICBpZiAoaW5zdGFuY2VPcHRpb25zLmR1cmF0aW9uKSB7XHJcbiAgICAgICAgICAvLyB1c2UgZHVyYXRpb24gZnJvbSBvcHRpb25zLCBpZiBzcGVjaWZpZWQgYW5kIGxhcmdlci4gbm9ib2R5IHNob3VsZCBiZSBzcGVjaWZ5aW5nIGR1cmF0aW9uIGluIG9wdGlvbnMsIGFjdHVhbGx5LCBhbmQgaXQgc2hvdWxkIGJlIHJldGlyZWQuXHJcbiAgICAgICAgICBzLmR1cmF0aW9uRXN0aW1hdGUgPSAocy5kdXJhdGlvbiA+IGluc3RhbmNlT3B0aW9ucy5kdXJhdGlvbikgPyBzLmR1cmF0aW9uIDogaW5zdGFuY2VPcHRpb25zLmR1cmF0aW9uO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICBzLmR1cmF0aW9uRXN0aW1hdGUgPSBwYXJzZUludCgocy5ieXRlc1RvdGFsIC8gcy5ieXRlc0xvYWRlZCkgKiBzLmR1cmF0aW9uLCAxMCk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgfSBlbHNlIHtcclxuXHJcbiAgICAgICAgcy5kdXJhdGlvbkVzdGltYXRlID0gcy5kdXJhdGlvbjtcclxuXHJcbiAgICAgIH1cclxuXHJcbiAgICAgIC8vIGZvciBmbGFzaCwgcmVmbGVjdCBzZXF1ZW50aWFsLWxvYWQtc3R5bGUgYnVmZmVyaW5nXHJcbiAgICAgIGlmICghcy5pc0hUTUw1KSB7XHJcbiAgICAgICAgcy5idWZmZXJlZCA9IFt7XHJcbiAgICAgICAgICAnc3RhcnQnOiAwLFxyXG4gICAgICAgICAgJ2VuZCc6IHMuZHVyYXRpb25cclxuICAgICAgICB9XTtcclxuICAgICAgfVxyXG5cclxuICAgICAgLy8gYWxsb3cgd2hpbGVsb2FkaW5nIHRvIGZpcmUgZXZlbiBpZiBcImxvYWRcIiBmaXJlZCB1bmRlciBIVE1MNSwgZHVlIHRvIEhUVFAgcmFuZ2UvcGFydGlhbHNcclxuICAgICAgaWYgKChzLnJlYWR5U3RhdGUgIT09IDMgfHwgcy5pc0hUTUw1KSAmJiBpbnN0YW5jZU9wdGlvbnMud2hpbGVsb2FkaW5nKSB7XHJcbiAgICAgICAgaW5zdGFuY2VPcHRpb25zLndoaWxlbG9hZGluZy5hcHBseShzKTtcclxuICAgICAgfVxyXG5cclxuICAgIH07XHJcblxyXG4gICAgdGhpcy5fd2hpbGVwbGF5aW5nID0gZnVuY3Rpb24oblBvc2l0aW9uLCBvUGVha0RhdGEsIG9XYXZlZm9ybURhdGFMZWZ0LCBvV2F2ZWZvcm1EYXRhUmlnaHQsIG9FUURhdGEpIHtcclxuXHJcbiAgICAgIHZhciBpbnN0YW5jZU9wdGlvbnMgPSBzLl9pTyxcclxuICAgICAgICAgIGVxTGVmdDtcclxuXHJcbiAgICAgIGlmIChpc05hTihuUG9zaXRpb24pIHx8IG5Qb3NpdGlvbiA9PT0gbnVsbCkge1xyXG4gICAgICAgIC8vIGZsYXNoIHNhZmV0eSBuZXRcclxuICAgICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIC8vIFNhZmFyaSBIVE1MNSBwbGF5KCkgbWF5IHJldHVybiBzbWFsbCAtdmUgdmFsdWVzIHdoZW4gc3RhcnRpbmcgZnJvbSBwb3NpdGlvbjogMCwgZWcuIC01MC4xMjAzOTY4NzUuIFVuZXhwZWN0ZWQvaW52YWxpZCBwZXIgVzMsIEkgdGhpbmsuIE5vcm1hbGl6ZSB0byAwLlxyXG4gICAgICBzLnBvc2l0aW9uID0gTWF0aC5tYXgoMCwgblBvc2l0aW9uKTtcclxuXHJcbiAgICAgIHMuX3Byb2Nlc3NPblBvc2l0aW9uKCk7XHJcblxyXG4gICAgICBpZiAoIXMuaXNIVE1MNSAmJiBmViA+IDgpIHtcclxuXHJcbiAgICAgICAgaWYgKGluc3RhbmNlT3B0aW9ucy51c2VQZWFrRGF0YSAmJiBvUGVha0RhdGEgIT09IF91bmRlZmluZWQgJiYgb1BlYWtEYXRhKSB7XHJcbiAgICAgICAgICBzLnBlYWtEYXRhID0ge1xyXG4gICAgICAgICAgICBsZWZ0OiBvUGVha0RhdGEubGVmdFBlYWssXHJcbiAgICAgICAgICAgIHJpZ2h0OiBvUGVha0RhdGEucmlnaHRQZWFrXHJcbiAgICAgICAgICB9O1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgaWYgKGluc3RhbmNlT3B0aW9ucy51c2VXYXZlZm9ybURhdGEgJiYgb1dhdmVmb3JtRGF0YUxlZnQgIT09IF91bmRlZmluZWQgJiYgb1dhdmVmb3JtRGF0YUxlZnQpIHtcclxuICAgICAgICAgIHMud2F2ZWZvcm1EYXRhID0ge1xyXG4gICAgICAgICAgICBsZWZ0OiBvV2F2ZWZvcm1EYXRhTGVmdC5zcGxpdCgnLCcpLFxyXG4gICAgICAgICAgICByaWdodDogb1dhdmVmb3JtRGF0YVJpZ2h0LnNwbGl0KCcsJylcclxuICAgICAgICAgIH07XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBpZiAoaW5zdGFuY2VPcHRpb25zLnVzZUVRRGF0YSkge1xyXG4gICAgICAgICAgaWYgKG9FUURhdGEgIT09IF91bmRlZmluZWQgJiYgb0VRRGF0YSAmJiBvRVFEYXRhLmxlZnRFUSkge1xyXG4gICAgICAgICAgICBlcUxlZnQgPSBvRVFEYXRhLmxlZnRFUS5zcGxpdCgnLCcpO1xyXG4gICAgICAgICAgICBzLmVxRGF0YSA9IGVxTGVmdDtcclxuICAgICAgICAgICAgcy5lcURhdGEubGVmdCA9IGVxTGVmdDtcclxuICAgICAgICAgICAgaWYgKG9FUURhdGEucmlnaHRFUSAhPT0gX3VuZGVmaW5lZCAmJiBvRVFEYXRhLnJpZ2h0RVEpIHtcclxuICAgICAgICAgICAgICBzLmVxRGF0YS5yaWdodCA9IG9FUURhdGEucmlnaHRFUS5zcGxpdCgnLCcpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgfVxyXG5cclxuICAgICAgaWYgKHMucGxheVN0YXRlID09PSAxKSB7XHJcblxyXG4gICAgICAgIC8vIHNwZWNpYWwgY2FzZS9oYWNrOiBlbnN1cmUgYnVmZmVyaW5nIGlzIGZhbHNlIGlmIGxvYWRpbmcgZnJvbSBjYWNoZSAoYW5kIG5vdCB5ZXQgc3RhcnRlZClcclxuICAgICAgICBpZiAoIXMuaXNIVE1MNSAmJiBmViA9PT0gOCAmJiAhcy5wb3NpdGlvbiAmJiBzLmlzQnVmZmVyaW5nKSB7XHJcbiAgICAgICAgICBzLl9vbmJ1ZmZlcmNoYW5nZSgwKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGlmIChpbnN0YW5jZU9wdGlvbnMud2hpbGVwbGF5aW5nKSB7XHJcbiAgICAgICAgICAvLyBmbGFzaCBtYXkgY2FsbCBhZnRlciBhY3R1YWwgZmluaXNoXHJcbiAgICAgICAgICBpbnN0YW5jZU9wdGlvbnMud2hpbGVwbGF5aW5nLmFwcGx5KHMpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgIH1cclxuXHJcbiAgICAgIHJldHVybiB0cnVlO1xyXG5cclxuICAgIH07XHJcblxyXG4gICAgdGhpcy5fb25jYXB0aW9uZGF0YSA9IGZ1bmN0aW9uKG9EYXRhKSB7XHJcblxyXG4gICAgICAvKipcclxuICAgICAgICogaW50ZXJuYWw6IGZsYXNoIDkgKyBOZXRTdHJlYW0gKE1vdmllU3Rhci9SVE1QLW9ubHkpIGZlYXR1cmVcclxuICAgICAgICpcclxuICAgICAgICogQHBhcmFtIHtvYmplY3R9IG9EYXRhXHJcbiAgICAgICAqL1xyXG5cclxuICAgICAgc20yLl93RChzLmlkICsgJzogQ2FwdGlvbiBkYXRhIHJlY2VpdmVkLicpO1xyXG5cclxuICAgICAgcy5jYXB0aW9uZGF0YSA9IG9EYXRhO1xyXG5cclxuICAgICAgaWYgKHMuX2lPLm9uY2FwdGlvbmRhdGEpIHtcclxuICAgICAgICBzLl9pTy5vbmNhcHRpb25kYXRhLmFwcGx5KHMsIFtvRGF0YV0pO1xyXG4gICAgICB9XHJcblxyXG4gICAgfTtcclxuXHJcbiAgICB0aGlzLl9vbm1ldGFkYXRhID0gZnVuY3Rpb24ob01EUHJvcHMsIG9NRERhdGEpIHtcclxuXHJcbiAgICAgIC8qKlxyXG4gICAgICAgKiBpbnRlcm5hbDogZmxhc2ggOSArIE5ldFN0cmVhbSAoTW92aWVTdGFyL1JUTVAtb25seSkgZmVhdHVyZVxyXG4gICAgICAgKiBSVE1QIG1heSBpbmNsdWRlIHNvbmcgdGl0bGUsIE1vdmllU3RhciBjb250ZW50IG1heSBpbmNsdWRlIGVuY29kaW5nIGluZm9cclxuICAgICAgICpcclxuICAgICAgICogQHBhcmFtIHthcnJheX0gb01EUHJvcHMgKG5hbWVzKVxyXG4gICAgICAgKiBAcGFyYW0ge2FycmF5fSBvTUREYXRhICh2YWx1ZXMpXHJcbiAgICAgICAqL1xyXG5cclxuICAgICAgc20yLl93RChzLmlkICsgJzogTWV0YWRhdGEgcmVjZWl2ZWQuJyk7XHJcblxyXG4gICAgICB2YXIgb0RhdGEgPSB7fSwgaSwgajtcclxuXHJcbiAgICAgIGZvciAoaSA9IDAsIGogPSBvTURQcm9wcy5sZW5ndGg7IGkgPCBqOyBpKyspIHtcclxuICAgICAgICBvRGF0YVtvTURQcm9wc1tpXV0gPSBvTUREYXRhW2ldO1xyXG4gICAgICB9XHJcbiAgICAgIHMubWV0YWRhdGEgPSBvRGF0YTtcclxuXHJcbmNvbnNvbGUubG9nKCd1cGRhdGVkIG1ldGFkYXRhJywgcy5tZXRhZGF0YSk7XHJcblxyXG4gICAgICBpZiAocy5faU8ub25tZXRhZGF0YSkge1xyXG4gICAgICAgIHMuX2lPLm9ubWV0YWRhdGEuY2FsbChzLCBzLm1ldGFkYXRhKTtcclxuICAgICAgfVxyXG5cclxuICAgIH07XHJcblxyXG4gICAgdGhpcy5fb25pZDMgPSBmdW5jdGlvbihvSUQzUHJvcHMsIG9JRDNEYXRhKSB7XHJcblxyXG4gICAgICAvKipcclxuICAgICAgICogaW50ZXJuYWw6IGZsYXNoIDggKyBmbGFzaCA5IElEMyBmZWF0dXJlXHJcbiAgICAgICAqIG1heSBpbmNsdWRlIGFydGlzdCwgc29uZyB0aXRsZSBldGMuXHJcbiAgICAgICAqXHJcbiAgICAgICAqIEBwYXJhbSB7YXJyYXl9IG9JRDNQcm9wcyAobmFtZXMpXHJcbiAgICAgICAqIEBwYXJhbSB7YXJyYXl9IG9JRDNEYXRhICh2YWx1ZXMpXHJcbiAgICAgICAqL1xyXG5cclxuICAgICAgc20yLl93RChzLmlkICsgJzogSUQzIGRhdGEgcmVjZWl2ZWQuJyk7XHJcblxyXG4gICAgICB2YXIgb0RhdGEgPSBbXSwgaSwgajtcclxuXHJcbiAgICAgIGZvciAoaSA9IDAsIGogPSBvSUQzUHJvcHMubGVuZ3RoOyBpIDwgajsgaSsrKSB7XHJcbiAgICAgICAgb0RhdGFbb0lEM1Byb3BzW2ldXSA9IG9JRDNEYXRhW2ldO1xyXG4gICAgICB9XHJcbiAgICAgIHMuaWQzID0gbWl4aW4ocy5pZDMsIG9EYXRhKTtcclxuXHJcbiAgICAgIGlmIChzLl9pTy5vbmlkMykge1xyXG4gICAgICAgIHMuX2lPLm9uaWQzLmFwcGx5KHMpO1xyXG4gICAgICB9XHJcblxyXG4gICAgfTtcclxuXHJcbiAgICAvLyBmbGFzaC9SVE1QLW9ubHlcclxuXHJcbiAgICB0aGlzLl9vbmNvbm5lY3QgPSBmdW5jdGlvbihiU3VjY2Vzcykge1xyXG5cclxuICAgICAgYlN1Y2Nlc3MgPSAoYlN1Y2Nlc3MgPT09IDEpO1xyXG4gICAgICBzbTIuX3dEKHMuaWQgKyAnOiAnICsgKGJTdWNjZXNzID8gJ0Nvbm5lY3RlZC4nIDogJ0ZhaWxlZCB0byBjb25uZWN0PyAtICcgKyBzLnVybCksIChiU3VjY2VzcyA/IDEgOiAyKSk7XHJcbiAgICAgIHMuY29ubmVjdGVkID0gYlN1Y2Nlc3M7XHJcblxyXG4gICAgICBpZiAoYlN1Y2Nlc3MpIHtcclxuXHJcbiAgICAgICAgcy5mYWlsdXJlcyA9IDA7XHJcblxyXG4gICAgICAgIGlmIChpZENoZWNrKHMuaWQpKSB7XHJcbiAgICAgICAgICBpZiAocy5nZXRBdXRvUGxheSgpKSB7XHJcbiAgICAgICAgICAgIC8vIG9ubHkgdXBkYXRlIHRoZSBwbGF5IHN0YXRlIGlmIGF1dG8gcGxheWluZ1xyXG4gICAgICAgICAgICBzLnBsYXkoX3VuZGVmaW5lZCwgcy5nZXRBdXRvUGxheSgpKTtcclxuICAgICAgICAgIH0gZWxzZSBpZiAocy5faU8uYXV0b0xvYWQpIHtcclxuICAgICAgICAgICAgcy5sb2FkKCk7XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBpZiAocy5faU8ub25jb25uZWN0KSB7XHJcbiAgICAgICAgICBzLl9pTy5vbmNvbm5lY3QuYXBwbHkocywgW2JTdWNjZXNzXSk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgfVxyXG5cclxuICAgIH07XHJcblxyXG4gICAgdGhpcy5fb25kYXRhZXJyb3IgPSBmdW5jdGlvbihzRXJyb3IpIHtcclxuXHJcbiAgICAgIC8vIGZsYXNoIDkgd2F2ZS9lcSBkYXRhIGhhbmRsZXJcclxuICAgICAgLy8gaGFjazogY2FsbGVkIGF0IHN0YXJ0LCBhbmQgZW5kIGZyb20gZmxhc2ggYXQvYWZ0ZXIgb25maW5pc2goKVxyXG4gICAgICBpZiAocy5wbGF5U3RhdGUgPiAwKSB7XHJcbiAgICAgICAgc20yLl93RChzLmlkICsgJzogRGF0YSBlcnJvcjogJyArIHNFcnJvcik7XHJcbiAgICAgICAgaWYgKHMuX2lPLm9uZGF0YWVycm9yKSB7XHJcbiAgICAgICAgICBzLl9pTy5vbmRhdGFlcnJvci5hcHBseShzKTtcclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuXHJcbiAgICB9O1xyXG5cclxuICAgIC8vIDxkPlxyXG4gICAgdGhpcy5fZGVidWcoKTtcclxuICAgIC8vIDwvZD5cclxuXHJcbiAgfTsgLy8gU01Tb3VuZCgpXHJcblxyXG4gIC8qKlxyXG4gICAqIFByaXZhdGUgU291bmRNYW5hZ2VyIGludGVybmFsc1xyXG4gICAqIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxyXG4gICAqL1xyXG5cclxuICBnZXREb2N1bWVudCA9IGZ1bmN0aW9uKCkge1xyXG5cclxuICAgIHJldHVybiAoZG9jLmJvZHkgfHwgZG9jLmdldEVsZW1lbnRzQnlUYWdOYW1lKCdkaXYnKVswXSk7XHJcblxyXG4gIH07XHJcblxyXG4gIGlkID0gZnVuY3Rpb24oc0lEKSB7XHJcblxyXG4gICAgcmV0dXJuIGRvYy5nZXRFbGVtZW50QnlJZChzSUQpO1xyXG5cclxuICB9O1xyXG5cclxuICBtaXhpbiA9IGZ1bmN0aW9uKG9NYWluLCBvQWRkKSB7XHJcblxyXG4gICAgLy8gbm9uLWRlc3RydWN0aXZlIG1lcmdlXHJcbiAgICB2YXIgbzEgPSAob01haW4gfHwge30pLCBvMiwgbztcclxuXHJcbiAgICAvLyBpZiB1bnNwZWNpZmllZCwgbzIgaXMgdGhlIGRlZmF1bHQgb3B0aW9ucyBvYmplY3RcclxuICAgIG8yID0gKG9BZGQgPT09IF91bmRlZmluZWQgPyBzbTIuZGVmYXVsdE9wdGlvbnMgOiBvQWRkKTtcclxuXHJcbiAgICBmb3IgKG8gaW4gbzIpIHtcclxuXHJcbiAgICAgIGlmIChvMi5oYXNPd25Qcm9wZXJ0eShvKSAmJiBvMVtvXSA9PT0gX3VuZGVmaW5lZCkge1xyXG5cclxuICAgICAgICBpZiAodHlwZW9mIG8yW29dICE9PSAnb2JqZWN0JyB8fCBvMltvXSA9PT0gbnVsbCkge1xyXG5cclxuICAgICAgICAgIC8vIGFzc2lnbiBkaXJlY3RseVxyXG4gICAgICAgICAgbzFbb10gPSBvMltvXTtcclxuXHJcbiAgICAgICAgfSBlbHNlIHtcclxuXHJcbiAgICAgICAgICAvLyByZWN1cnNlIHRocm91Z2ggbzJcclxuICAgICAgICAgIG8xW29dID0gbWl4aW4obzFbb10sIG8yW29dKTtcclxuXHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgfVxyXG5cclxuICAgIH1cclxuXHJcbiAgICByZXR1cm4gbzE7XHJcblxyXG4gIH07XHJcblxyXG4gIHdyYXBDYWxsYmFjayA9IGZ1bmN0aW9uKG9Tb3VuZCwgY2FsbGJhY2spIHtcclxuXHJcbiAgICAvKipcclxuICAgICAqIDAzLzAzLzIwMTM6IEZpeCBmb3IgRmxhc2ggUGxheWVyIDExLjYuNjAyLjE3MSArIEZsYXNoIDggKGZsYXNoVmVyc2lvbiA9IDgpIFNXRiBpc3N1ZVxyXG4gICAgICogc2V0VGltZW91dCgpIGZpeCBmb3IgY2VydGFpbiBTTVNvdW5kIGNhbGxiYWNrcyBsaWtlIG9ubG9hZCgpIGFuZCBvbmZpbmlzaCgpLCB3aGVyZSBzdWJzZXF1ZW50IGNhbGxzIGxpa2UgcGxheSgpIGFuZCBsb2FkKCkgZmFpbCB3aGVuIEZsYXNoIFBsYXllciAxMS42LjYwMi4xNzEgaXMgaW5zdGFsbGVkLCBhbmQgdXNpbmcgc291bmRNYW5hZ2VyIHdpdGggZmxhc2hWZXJzaW9uID0gOCAod2hpY2ggaXMgdGhlIGRlZmF1bHQpLlxyXG4gICAgICogTm90IHN1cmUgb2YgZXhhY3QgY2F1c2UuIFN1c3BlY3QgcmFjZSBjb25kaXRpb24gYW5kL29yIGludmFsaWQgKE5hTi1zdHlsZSkgcG9zaXRpb24gYXJndW1lbnQgdHJpY2tsaW5nIGRvd24gdG8gdGhlIG5leHQgSlMgLT4gRmxhc2ggX3N0YXJ0KCkgY2FsbCwgaW4gdGhlIHBsYXkoKSBjYXNlLlxyXG4gICAgICogRml4OiBzZXRUaW1lb3V0KCkgdG8geWllbGQsIHBsdXMgc2FmZXIgbnVsbCAvIE5hTiBjaGVja2luZyBvbiBwb3NpdGlvbiBhcmd1bWVudCBwcm92aWRlZCB0byBGbGFzaC5cclxuICAgICAqIGh0dHBzOi8vZ2V0c2F0aXNmYWN0aW9uLmNvbS9zY2hpbGxtYW5pYS90b3BpY3MvcmVjZW50X2Nocm9tZV91cGRhdGVfc2VlbXNfdG9faGF2ZV9icm9rZW5fbXlfc20yX2F1ZGlvX3BsYXllclxyXG4gICAgICovXHJcbiAgICBpZiAoIW9Tb3VuZC5pc0hUTUw1ICYmIGZWID09PSA4KSB7XHJcbiAgICAgIHdpbmRvdy5zZXRUaW1lb3V0KGNhbGxiYWNrLCAwKTtcclxuICAgIH0gZWxzZSB7XHJcbiAgICAgIGNhbGxiYWNrKCk7XHJcbiAgICB9XHJcblxyXG4gIH07XHJcblxyXG4gIC8vIGFkZGl0aW9uYWwgc291bmRNYW5hZ2VyIHByb3BlcnRpZXMgdGhhdCBzb3VuZE1hbmFnZXIuc2V0dXAoKSB3aWxsIGFjY2VwdFxyXG5cclxuICBleHRyYU9wdGlvbnMgPSB7XHJcbiAgICAnb25yZWFkeSc6IDEsXHJcbiAgICAnb250aW1lb3V0JzogMSxcclxuICAgICdkZWZhdWx0T3B0aW9ucyc6IDEsXHJcbiAgICAnZmxhc2g5T3B0aW9ucyc6IDEsXHJcbiAgICAnbW92aWVTdGFyT3B0aW9ucyc6IDFcclxuICB9O1xyXG5cclxuICBhc3NpZ24gPSBmdW5jdGlvbihvLCBvUGFyZW50KSB7XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiByZWN1cnNpdmUgYXNzaWdubWVudCBvZiBwcm9wZXJ0aWVzLCBzb3VuZE1hbmFnZXIuc2V0dXAoKSBoZWxwZXJcclxuICAgICAqIGFsbG93cyBwcm9wZXJ0eSBhc3NpZ25tZW50IGJhc2VkIG9uIHdoaXRlbGlzdFxyXG4gICAgICovXHJcblxyXG4gICAgdmFyIGksXHJcbiAgICAgICAgcmVzdWx0ID0gdHJ1ZSxcclxuICAgICAgICBoYXNQYXJlbnQgPSAob1BhcmVudCAhPT0gX3VuZGVmaW5lZCksXHJcbiAgICAgICAgc2V0dXBPcHRpb25zID0gc20yLnNldHVwT3B0aW9ucyxcclxuICAgICAgICBib251c09wdGlvbnMgPSBleHRyYU9wdGlvbnM7XHJcblxyXG4gICAgLy8gPGQ+XHJcblxyXG4gICAgLy8gaWYgc291bmRNYW5hZ2VyLnNldHVwKCkgY2FsbGVkLCBzaG93IGFjY2VwdGVkIHBhcmFtZXRlcnMuXHJcblxyXG4gICAgaWYgKG8gPT09IF91bmRlZmluZWQpIHtcclxuXHJcbiAgICAgIHJlc3VsdCA9IFtdO1xyXG5cclxuICAgICAgZm9yIChpIGluIHNldHVwT3B0aW9ucykge1xyXG5cclxuICAgICAgICBpZiAoc2V0dXBPcHRpb25zLmhhc093blByb3BlcnR5KGkpKSB7XHJcbiAgICAgICAgICByZXN1bHQucHVzaChpKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICB9XHJcblxyXG4gICAgICBmb3IgKGkgaW4gYm9udXNPcHRpb25zKSB7XHJcblxyXG4gICAgICAgIGlmIChib251c09wdGlvbnMuaGFzT3duUHJvcGVydHkoaSkpIHtcclxuXHJcbiAgICAgICAgICBpZiAodHlwZW9mIHNtMltpXSA9PT0gJ29iamVjdCcpIHtcclxuXHJcbiAgICAgICAgICAgIHJlc3VsdC5wdXNoKGkrJzogey4uLn0nKTtcclxuXHJcbiAgICAgICAgICB9IGVsc2UgaWYgKHNtMltpXSBpbnN0YW5jZW9mIEZ1bmN0aW9uKSB7XHJcblxyXG4gICAgICAgICAgICByZXN1bHQucHVzaChpKyc6IGZ1bmN0aW9uKCkgey4uLn0nKTtcclxuXHJcbiAgICAgICAgICB9IGVsc2Uge1xyXG5cclxuICAgICAgICAgICAgcmVzdWx0LnB1c2goaSk7XHJcblxyXG4gICAgICAgICAgfVxyXG5cclxuICAgICAgICB9XHJcblxyXG4gICAgICB9XHJcblxyXG4gICAgICBzbTIuX3dEKHN0cignc2V0dXAnLCByZXN1bHQuam9pbignLCAnKSkpO1xyXG5cclxuICAgICAgcmV0dXJuIGZhbHNlO1xyXG5cclxuICAgIH1cclxuXHJcbiAgICAvLyA8L2Q+XHJcblxyXG4gICAgZm9yIChpIGluIG8pIHtcclxuXHJcbiAgICAgIGlmIChvLmhhc093blByb3BlcnR5KGkpKSB7XHJcblxyXG4gICAgICAgIC8vIGlmIG5vdCBhbiB7b2JqZWN0fSB3ZSB3YW50IHRvIHJlY3Vyc2UgdGhyb3VnaC4uLlxyXG5cclxuICAgICAgICBpZiAodHlwZW9mIG9baV0gIT09ICdvYmplY3QnIHx8IG9baV0gPT09IG51bGwgfHwgb1tpXSBpbnN0YW5jZW9mIEFycmF5IHx8IG9baV0gaW5zdGFuY2VvZiBSZWdFeHApIHtcclxuXHJcbiAgICAgICAgICAvLyBjaGVjayBcImFsbG93ZWRcIiBvcHRpb25zXHJcblxyXG4gICAgICAgICAgaWYgKGhhc1BhcmVudCAmJiBib251c09wdGlvbnNbb1BhcmVudF0gIT09IF91bmRlZmluZWQpIHtcclxuXHJcbiAgICAgICAgICAgIC8vIHZhbGlkIHJlY3Vyc2l2ZSAvIG5lc3RlZCBvYmplY3Qgb3B0aW9uLCBlZy4sIHsgZGVmYXVsdE9wdGlvbnM6IHsgdm9sdW1lOiA1MCB9IH1cclxuICAgICAgICAgICAgc20yW29QYXJlbnRdW2ldID0gb1tpXTtcclxuXHJcbiAgICAgICAgICB9IGVsc2UgaWYgKHNldHVwT3B0aW9uc1tpXSAhPT0gX3VuZGVmaW5lZCkge1xyXG5cclxuICAgICAgICAgICAgLy8gc3BlY2lhbCBjYXNlOiBhc3NpZ24gdG8gc2V0dXBPcHRpb25zIG9iamVjdCwgd2hpY2ggc291bmRNYW5hZ2VyIHByb3BlcnR5IHJlZmVyZW5jZXNcclxuICAgICAgICAgICAgc20yLnNldHVwT3B0aW9uc1tpXSA9IG9baV07XHJcblxyXG4gICAgICAgICAgICAvLyBhc3NpZ24gZGlyZWN0bHkgdG8gc291bmRNYW5hZ2VyLCB0b29cclxuICAgICAgICAgICAgc20yW2ldID0gb1tpXTtcclxuXHJcbiAgICAgICAgICB9IGVsc2UgaWYgKGJvbnVzT3B0aW9uc1tpXSA9PT0gX3VuZGVmaW5lZCkge1xyXG5cclxuICAgICAgICAgICAgLy8gaW52YWxpZCBvciBkaXNhbGxvd2VkIHBhcmFtZXRlci4gY29tcGxhaW4uXHJcbiAgICAgICAgICAgIGNvbXBsYWluKHN0cigoc20yW2ldID09PSBfdW5kZWZpbmVkID8gJ3NldHVwVW5kZWYnIDogJ3NldHVwRXJyb3InKSwgaSksIDIpO1xyXG5cclxuICAgICAgICAgICAgcmVzdWx0ID0gZmFsc2U7XHJcblxyXG4gICAgICAgICAgfSBlbHNlIHtcclxuXHJcbiAgICAgICAgICAgIC8qKlxyXG4gICAgICAgICAgICAgKiB2YWxpZCBleHRyYU9wdGlvbnMgKGJvbnVzT3B0aW9ucykgcGFyYW1ldGVyLlxyXG4gICAgICAgICAgICAgKiBpcyBpdCBhIG1ldGhvZCwgbGlrZSBvbnJlYWR5L29udGltZW91dD8gY2FsbCBpdC5cclxuICAgICAgICAgICAgICogbXVsdGlwbGUgcGFyYW1ldGVycyBzaG91bGQgYmUgaW4gYW4gYXJyYXksIGVnLiBzb3VuZE1hbmFnZXIuc2V0dXAoe29ucmVhZHk6IFtteUhhbmRsZXIsIG15U2NvcGVdfSk7XHJcbiAgICAgICAgICAgICAqL1xyXG5cclxuICAgICAgICAgICAgaWYgKHNtMltpXSBpbnN0YW5jZW9mIEZ1bmN0aW9uKSB7XHJcblxyXG4gICAgICAgICAgICAgIHNtMltpXS5hcHBseShzbTIsIChvW2ldIGluc3RhbmNlb2YgQXJyYXk/IG9baV0gOiBbb1tpXV0pKTtcclxuXHJcbiAgICAgICAgICAgIH0gZWxzZSB7XHJcblxyXG4gICAgICAgICAgICAgIC8vIGdvb2Qgb2xkLWZhc2hpb25lZCBkaXJlY3QgYXNzaWdubWVudFxyXG4gICAgICAgICAgICAgIHNtMltpXSA9IG9baV07XHJcblxyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgfVxyXG5cclxuICAgICAgICB9IGVsc2Uge1xyXG5cclxuICAgICAgICAgIC8vIHJlY3Vyc2lvbiBjYXNlLCBlZy4sIHsgZGVmYXVsdE9wdGlvbnM6IHsgLi4uIH0gfVxyXG5cclxuICAgICAgICAgIGlmIChib251c09wdGlvbnNbaV0gPT09IF91bmRlZmluZWQpIHtcclxuXHJcbiAgICAgICAgICAgIC8vIGludmFsaWQgb3IgZGlzYWxsb3dlZCBwYXJhbWV0ZXIuIGNvbXBsYWluLlxyXG4gICAgICAgICAgICBjb21wbGFpbihzdHIoKHNtMltpXSA9PT0gX3VuZGVmaW5lZCA/ICdzZXR1cFVuZGVmJyA6ICdzZXR1cEVycm9yJyksIGkpLCAyKTtcclxuXHJcbiAgICAgICAgICAgIHJlc3VsdCA9IGZhbHNlO1xyXG5cclxuICAgICAgICAgIH0gZWxzZSB7XHJcblxyXG4gICAgICAgICAgICAvLyByZWN1cnNlIHRocm91Z2ggb2JqZWN0XHJcbiAgICAgICAgICAgIHJldHVybiBhc3NpZ24ob1tpXSwgaSk7XHJcblxyXG4gICAgICAgICAgfVxyXG5cclxuICAgICAgICB9XHJcblxyXG4gICAgICB9XHJcblxyXG4gICAgfVxyXG5cclxuICAgIHJldHVybiByZXN1bHQ7XHJcblxyXG4gIH07XHJcblxyXG4gIGZ1bmN0aW9uIHByZWZlckZsYXNoQ2hlY2soa2luZCkge1xyXG5cclxuICAgIC8vIHdoZXRoZXIgZmxhc2ggc2hvdWxkIHBsYXkgYSBnaXZlbiB0eXBlXHJcbiAgICByZXR1cm4gKHNtMi5wcmVmZXJGbGFzaCAmJiBoYXNGbGFzaCAmJiAhc20yLmlnbm9yZUZsYXNoICYmIChzbTIuZmxhc2hba2luZF0gIT09IF91bmRlZmluZWQgJiYgc20yLmZsYXNoW2tpbmRdKSk7XHJcblxyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogSW50ZXJuYWwgRE9NMi1sZXZlbCBldmVudCBoZWxwZXJzXHJcbiAgICogLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXHJcbiAgICovXHJcblxyXG4gIGV2ZW50ID0gKGZ1bmN0aW9uKCkge1xyXG5cclxuICAgIC8vIG5vcm1hbGl6ZSBldmVudCBtZXRob2RzXHJcbiAgICB2YXIgb2xkID0gKHdpbmRvdy5hdHRhY2hFdmVudCksXHJcbiAgICBldnQgPSB7XHJcbiAgICAgIGFkZDogKG9sZD8nYXR0YWNoRXZlbnQnOidhZGRFdmVudExpc3RlbmVyJyksXHJcbiAgICAgIHJlbW92ZTogKG9sZD8nZGV0YWNoRXZlbnQnOidyZW1vdmVFdmVudExpc3RlbmVyJylcclxuICAgIH07XHJcblxyXG4gICAgLy8gbm9ybWFsaXplIFwib25cIiBldmVudCBwcmVmaXgsIG9wdGlvbmFsIGNhcHR1cmUgYXJndW1lbnRcclxuICAgIGZ1bmN0aW9uIGdldEFyZ3Mob0FyZ3MpIHtcclxuXHJcbiAgICAgIHZhciBhcmdzID0gc2xpY2UuY2FsbChvQXJncyksXHJcbiAgICAgICAgICBsZW4gPSBhcmdzLmxlbmd0aDtcclxuXHJcbiAgICAgIGlmIChvbGQpIHtcclxuICAgICAgICAvLyBwcmVmaXhcclxuICAgICAgICBhcmdzWzFdID0gJ29uJyArIGFyZ3NbMV07XHJcbiAgICAgICAgaWYgKGxlbiA+IDMpIHtcclxuICAgICAgICAgIC8vIG5vIGNhcHR1cmVcclxuICAgICAgICAgIGFyZ3MucG9wKCk7XHJcbiAgICAgICAgfVxyXG4gICAgICB9IGVsc2UgaWYgKGxlbiA9PT0gMykge1xyXG4gICAgICAgIGFyZ3MucHVzaChmYWxzZSk7XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIHJldHVybiBhcmdzO1xyXG5cclxuICAgIH1cclxuXHJcbiAgICBmdW5jdGlvbiBhcHBseShhcmdzLCBzVHlwZSkge1xyXG5cclxuICAgICAgLy8gbm9ybWFsaXplIGFuZCBjYWxsIHRoZSBldmVudCBtZXRob2QsIHdpdGggdGhlIHByb3BlciBhcmd1bWVudHNcclxuICAgICAgdmFyIGVsZW1lbnQgPSBhcmdzLnNoaWZ0KCksXHJcbiAgICAgICAgICBtZXRob2QgPSBbZXZ0W3NUeXBlXV07XHJcblxyXG4gICAgICBpZiAob2xkKSB7XHJcbiAgICAgICAgLy8gb2xkIElFIGNhbid0IGRvIGFwcGx5KCkuXHJcbiAgICAgICAgZWxlbWVudFttZXRob2RdKGFyZ3NbMF0sIGFyZ3NbMV0pO1xyXG4gICAgICB9IGVsc2Uge1xyXG4gICAgICAgIGVsZW1lbnRbbWV0aG9kXS5hcHBseShlbGVtZW50LCBhcmdzKTtcclxuICAgICAgfVxyXG5cclxuICAgIH1cclxuXHJcbiAgICBmdW5jdGlvbiBhZGQoKSB7XHJcblxyXG4gICAgICBhcHBseShnZXRBcmdzKGFyZ3VtZW50cyksICdhZGQnKTtcclxuXHJcbiAgICB9XHJcblxyXG4gICAgZnVuY3Rpb24gcmVtb3ZlKCkge1xyXG5cclxuICAgICAgYXBwbHkoZ2V0QXJncyhhcmd1bWVudHMpLCAncmVtb3ZlJyk7XHJcblxyXG4gICAgfVxyXG5cclxuICAgIHJldHVybiB7XHJcbiAgICAgICdhZGQnOiBhZGQsXHJcbiAgICAgICdyZW1vdmUnOiByZW1vdmVcclxuICAgIH07XHJcblxyXG4gIH0oKSk7XHJcblxyXG4gIC8qKlxyXG4gICAqIEludGVybmFsIEhUTUw1IGV2ZW50IGhhbmRsaW5nXHJcbiAgICogLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cclxuICAgKi9cclxuXHJcbiAgZnVuY3Rpb24gaHRtbDVfZXZlbnQob0ZuKSB7XHJcblxyXG4gICAgLy8gd3JhcCBodG1sNSBldmVudCBoYW5kbGVycyBzbyB3ZSBkb24ndCBjYWxsIHRoZW0gb24gZGVzdHJveWVkIGFuZC9vciB1bmxvYWRlZCBzb3VuZHNcclxuXHJcbiAgICByZXR1cm4gZnVuY3Rpb24oZSkge1xyXG5cclxuICAgICAgdmFyIHMgPSB0aGlzLl9zLFxyXG4gICAgICAgICAgcmVzdWx0O1xyXG5cclxuICAgICAgaWYgKCFzIHx8ICFzLl9hKSB7XHJcbiAgICAgICAgLy8gPGQ+XHJcbiAgICAgICAgaWYgKHMgJiYgcy5pZCkge1xyXG4gICAgICAgICAgc20yLl93RChzLmlkICsgJzogSWdub3JpbmcgJyArIGUudHlwZSk7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgIHNtMi5fd0QoaDUgKyAnSWdub3JpbmcgJyArIGUudHlwZSk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIC8vIDwvZD5cclxuICAgICAgICByZXN1bHQgPSBudWxsO1xyXG4gICAgICB9IGVsc2Uge1xyXG4gICAgICAgIHJlc3VsdCA9IG9Gbi5jYWxsKHRoaXMsIGUpO1xyXG4gICAgICB9XHJcblxyXG4gICAgICByZXR1cm4gcmVzdWx0O1xyXG5cclxuICAgIH07XHJcblxyXG4gIH1cclxuXHJcbiAgaHRtbDVfZXZlbnRzID0ge1xyXG5cclxuICAgIC8vIEhUTUw1IGV2ZW50LW5hbWUtdG8taGFuZGxlciBtYXBcclxuXHJcbiAgICBhYm9ydDogaHRtbDVfZXZlbnQoZnVuY3Rpb24oKSB7XHJcblxyXG4gICAgICBzbTIuX3dEKHRoaXMuX3MuaWQgKyAnOiBhYm9ydCcpO1xyXG5cclxuICAgIH0pLFxyXG5cclxuICAgIC8vIGVub3VnaCBoYXMgbG9hZGVkIHRvIHBsYXlcclxuXHJcbiAgICBjYW5wbGF5OiBodG1sNV9ldmVudChmdW5jdGlvbigpIHtcclxuXHJcbiAgICAgIHZhciBzID0gdGhpcy5fcyxcclxuICAgICAgICAgIHBvc2l0aW9uMUs7XHJcblxyXG4gICAgICBpZiAocy5faHRtbDVfY2FucGxheSkge1xyXG4gICAgICAgIC8vIHRoaXMgZXZlbnQgaGFzIGFscmVhZHkgZmlyZWQuIGlnbm9yZS5cclxuICAgICAgICByZXR1cm4gdHJ1ZTtcclxuICAgICAgfVxyXG5cclxuICAgICAgcy5faHRtbDVfY2FucGxheSA9IHRydWU7XHJcbiAgICAgIHNtMi5fd0Qocy5pZCArICc6IGNhbnBsYXknKTtcclxuICAgICAgcy5fb25idWZmZXJjaGFuZ2UoMCk7XHJcblxyXG4gICAgICAvLyBwb3NpdGlvbiBhY2NvcmRpbmcgdG8gaW5zdGFuY2Ugb3B0aW9uc1xyXG4gICAgICBwb3NpdGlvbjFLID0gKHMuX2lPLnBvc2l0aW9uICE9PSBfdW5kZWZpbmVkICYmICFpc05hTihzLl9pTy5wb3NpdGlvbikgPyBzLl9pTy5wb3NpdGlvbi9tc2VjU2NhbGUgOiBudWxsKTtcclxuXHJcbiAgICAgIC8vIHNldCB0aGUgcG9zaXRpb24gaWYgcG9zaXRpb24gd2FzIHByb3ZpZGVkIGJlZm9yZSB0aGUgc291bmQgbG9hZGVkXHJcbiAgICAgIGlmICh0aGlzLmN1cnJlbnRUaW1lICE9PSBwb3NpdGlvbjFLKSB7XHJcbiAgICAgICAgc20yLl93RChzLmlkICsgJzogY2FucGxheTogU2V0dGluZyBwb3NpdGlvbiB0byAnICsgcG9zaXRpb24xSyk7XHJcbiAgICAgICAgdHJ5IHtcclxuICAgICAgICAgIHRoaXMuY3VycmVudFRpbWUgPSBwb3NpdGlvbjFLO1xyXG4gICAgICAgIH0gY2F0Y2goZWUpIHtcclxuICAgICAgICAgIHNtMi5fd0Qocy5pZCArICc6IGNhbnBsYXk6IFNldHRpbmcgcG9zaXRpb24gb2YgJyArIHBvc2l0aW9uMUsgKyAnIGZhaWxlZDogJyArIGVlLm1lc3NhZ2UsIDIpO1xyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG5cclxuICAgICAgLy8gaGFjayBmb3IgSFRNTDUgZnJvbS90byBjYXNlXHJcbiAgICAgIGlmIChzLl9pTy5fb25jYW5wbGF5KSB7XHJcbiAgICAgICAgcy5faU8uX29uY2FucGxheSgpO1xyXG4gICAgICB9XHJcblxyXG4gICAgfSksXHJcblxyXG4gICAgY2FucGxheXRocm91Z2g6IGh0bWw1X2V2ZW50KGZ1bmN0aW9uKCkge1xyXG5cclxuICAgICAgdmFyIHMgPSB0aGlzLl9zO1xyXG5cclxuICAgICAgaWYgKCFzLmxvYWRlZCkge1xyXG4gICAgICAgIHMuX29uYnVmZmVyY2hhbmdlKDApO1xyXG4gICAgICAgIHMuX3doaWxlbG9hZGluZyhzLmJ5dGVzTG9hZGVkLCBzLmJ5dGVzVG90YWwsIHMuX2dldF9odG1sNV9kdXJhdGlvbigpKTtcclxuICAgICAgICBzLl9vbmxvYWQodHJ1ZSk7XHJcbiAgICAgIH1cclxuXHJcbiAgICB9KSxcclxuXHJcbiAgICBkdXJhdGlvbmNoYW5nZTogaHRtbDVfZXZlbnQoZnVuY3Rpb24oKSB7XHJcblxyXG4gICAgICAvLyBkdXJhdGlvbmNoYW5nZSBtYXkgZmlyZSBhdCB2YXJpb3VzIHRpbWVzLCBwcm9iYWJseSB0aGUgc2FmZXN0IHdheSB0byBjYXB0dXJlIGFjY3VyYXRlL2ZpbmFsIGR1cmF0aW9uLlxyXG5cclxuICAgICAgdmFyIHMgPSB0aGlzLl9zLFxyXG4gICAgICAgICAgZHVyYXRpb247XHJcblxyXG4gICAgICBkdXJhdGlvbiA9IHMuX2dldF9odG1sNV9kdXJhdGlvbigpO1xyXG5cclxuICAgICAgaWYgKCFpc05hTihkdXJhdGlvbikgJiYgZHVyYXRpb24gIT09IHMuZHVyYXRpb24pIHtcclxuXHJcbiAgICAgICAgc20yLl93RCh0aGlzLl9zLmlkICsgJzogZHVyYXRpb25jaGFuZ2UgKCcgKyBkdXJhdGlvbiArICcpJyArIChzLmR1cmF0aW9uID8gJywgcHJldmlvdXNseSAnICsgcy5kdXJhdGlvbiA6ICcnKSk7XHJcblxyXG4gICAgICAgIHMuZHVyYXRpb25Fc3RpbWF0ZSA9IHMuZHVyYXRpb24gPSBkdXJhdGlvbjtcclxuXHJcbiAgICAgIH1cclxuXHJcbiAgICB9KSxcclxuXHJcbiAgICAvLyBUT0RPOiBSZXNlcnZlZCBmb3IgcG90ZW50aWFsIHVzZVxyXG4gICAgLypcclxuICAgIGVtcHRpZWQ6IGh0bWw1X2V2ZW50KGZ1bmN0aW9uKCkge1xyXG5cclxuICAgICAgc20yLl93RCh0aGlzLl9zLmlkICsgJzogZW1wdGllZCcpO1xyXG5cclxuICAgIH0pLFxyXG4gICAgKi9cclxuXHJcbiAgICBlbmRlZDogaHRtbDVfZXZlbnQoZnVuY3Rpb24oKSB7XHJcblxyXG4gICAgICB2YXIgcyA9IHRoaXMuX3M7XHJcblxyXG4gICAgICBzbTIuX3dEKHMuaWQgKyAnOiBlbmRlZCcpO1xyXG5cclxuICAgICAgcy5fb25maW5pc2goKTtcclxuXHJcbiAgICB9KSxcclxuXHJcbiAgICBlcnJvcjogaHRtbDVfZXZlbnQoZnVuY3Rpb24oKSB7XHJcblxyXG4gICAgICBzbTIuX3dEKHRoaXMuX3MuaWQgKyAnOiBIVE1MNSBlcnJvciwgY29kZSAnICsgdGhpcy5lcnJvci5jb2RlKTtcclxuICAgICAgLyoqXHJcbiAgICAgICAqIEhUTUw1IGVycm9yIGNvZGVzLCBwZXIgVzNDXHJcbiAgICAgICAqIEVycm9yIDE6IENsaWVudCBhYm9ydGVkIGRvd25sb2FkIGF0IHVzZXIncyByZXF1ZXN0LlxyXG4gICAgICAgKiBFcnJvciAyOiBOZXR3b3JrIGVycm9yIGFmdGVyIGxvYWQgc3RhcnRlZC5cclxuICAgICAgICogRXJyb3IgMzogRGVjb2RpbmcgaXNzdWUuXHJcbiAgICAgICAqIEVycm9yIDQ6IE1lZGlhIChhdWRpbyBmaWxlKSBub3Qgc3VwcG9ydGVkLlxyXG4gICAgICAgKiBSZWZlcmVuY2U6IGh0dHA6Ly93d3cud2hhdHdnLm9yZy9zcGVjcy93ZWItYXBwcy9jdXJyZW50LXdvcmsvbXVsdGlwYWdlL3RoZS12aWRlby1lbGVtZW50Lmh0bWwjZXJyb3ItY29kZXNcclxuICAgICAgICovXHJcbiAgICAgIC8vIGNhbGwgbG9hZCB3aXRoIGVycm9yIHN0YXRlP1xyXG4gICAgICB0aGlzLl9zLl9vbmxvYWQoZmFsc2UpO1xyXG5cclxuICAgIH0pLFxyXG5cclxuICAgIGxvYWRlZGRhdGE6IGh0bWw1X2V2ZW50KGZ1bmN0aW9uKCkge1xyXG5cclxuICAgICAgdmFyIHMgPSB0aGlzLl9zO1xyXG5cclxuICAgICAgc20yLl93RChzLmlkICsgJzogbG9hZGVkZGF0YScpO1xyXG5cclxuICAgICAgLy8gc2FmYXJpIHNlZW1zIHRvIG5pY2VseSByZXBvcnQgcHJvZ3Jlc3MgZXZlbnRzLCBldmVudHVhbGx5IHRvdGFsbGluZyAxMDAlXHJcbiAgICAgIGlmICghcy5fbG9hZGVkICYmICFpc1NhZmFyaSkge1xyXG4gICAgICAgIHMuZHVyYXRpb24gPSBzLl9nZXRfaHRtbDVfZHVyYXRpb24oKTtcclxuICAgICAgfVxyXG5cclxuICAgIH0pLFxyXG5cclxuICAgIGxvYWRlZG1ldGFkYXRhOiBodG1sNV9ldmVudChmdW5jdGlvbigpIHtcclxuXHJcbiAgICAgIHNtMi5fd0QodGhpcy5fcy5pZCArICc6IGxvYWRlZG1ldGFkYXRhJyk7XHJcblxyXG4gICAgfSksXHJcblxyXG4gICAgbG9hZHN0YXJ0OiBodG1sNV9ldmVudChmdW5jdGlvbigpIHtcclxuXHJcbiAgICAgIHNtMi5fd0QodGhpcy5fcy5pZCArICc6IGxvYWRzdGFydCcpO1xyXG4gICAgICAvLyBhc3N1bWUgYnVmZmVyaW5nIGF0IGZpcnN0XHJcbiAgICAgIHRoaXMuX3MuX29uYnVmZmVyY2hhbmdlKDEpO1xyXG5cclxuICAgIH0pLFxyXG5cclxuICAgIHBsYXk6IGh0bWw1X2V2ZW50KGZ1bmN0aW9uKCkge1xyXG5cclxuICAgICAgLy8gc20yLl93RCh0aGlzLl9zLmlkICsgJzogcGxheSgpJyk7XHJcbiAgICAgIC8vIG9uY2UgcGxheSBzdGFydHMsIG5vIGJ1ZmZlcmluZ1xyXG4gICAgICB0aGlzLl9zLl9vbmJ1ZmZlcmNoYW5nZSgwKTtcclxuXHJcbiAgICB9KSxcclxuXHJcbiAgICBwbGF5aW5nOiBodG1sNV9ldmVudChmdW5jdGlvbigpIHtcclxuXHJcbiAgICAgIHNtMi5fd0QodGhpcy5fcy5pZCArICc6IHBsYXlpbmcgJyArIFN0cmluZy5mcm9tQ2hhckNvZGUoOTgzNSkpO1xyXG4gICAgICAvLyBvbmNlIHBsYXkgc3RhcnRzLCBubyBidWZmZXJpbmdcclxuICAgICAgdGhpcy5fcy5fb25idWZmZXJjaGFuZ2UoMCk7XHJcblxyXG4gICAgfSksXHJcblxyXG4gICAgcHJvZ3Jlc3M6IGh0bWw1X2V2ZW50KGZ1bmN0aW9uKGUpIHtcclxuXHJcbiAgICAgIC8vIG5vdGU6IGNhbiBmaXJlIHJlcGVhdGVkbHkgYWZ0ZXIgXCJsb2FkZWRcIiBldmVudCwgZHVlIHRvIHVzZSBvZiBIVFRQIHJhbmdlL3BhcnRpYWxzXHJcblxyXG4gICAgICB2YXIgcyA9IHRoaXMuX3MsXHJcbiAgICAgICAgICBpLCBqLCBwcm9nU3RyLCBidWZmZXJlZCA9IDAsXHJcbiAgICAgICAgICBpc1Byb2dyZXNzID0gKGUudHlwZSA9PT0gJ3Byb2dyZXNzJyksXHJcbiAgICAgICAgICByYW5nZXMgPSBlLnRhcmdldC5idWZmZXJlZCxcclxuICAgICAgICAgIC8vIGZpcmVmb3ggMy42IGltcGxlbWVudHMgZS5sb2FkZWQvdG90YWwgKGJ5dGVzKVxyXG4gICAgICAgICAgbG9hZGVkID0gKGUubG9hZGVkfHwwKSxcclxuICAgICAgICAgIHRvdGFsID0gKGUudG90YWx8fDEpO1xyXG5cclxuICAgICAgLy8gcmVzZXQgdGhlIFwiYnVmZmVyZWRcIiAobG9hZGVkIGJ5dGUgcmFuZ2VzKSBhcnJheVxyXG4gICAgICBzLmJ1ZmZlcmVkID0gW107XHJcblxyXG4gICAgICBpZiAocmFuZ2VzICYmIHJhbmdlcy5sZW5ndGgpIHtcclxuXHJcbiAgICAgICAgLy8gaWYgbG9hZGVkIGlzIDAsIHRyeSBUaW1lUmFuZ2VzIGltcGxlbWVudGF0aW9uIGFzICUgb2YgbG9hZFxyXG4gICAgICAgIC8vIGh0dHBzOi8vZGV2ZWxvcGVyLm1vemlsbGEub3JnL2VuL0RPTS9UaW1lUmFuZ2VzXHJcblxyXG4gICAgICAgIC8vIHJlLWJ1aWxkIFwiYnVmZmVyZWRcIiBhcnJheVxyXG4gICAgICAgIC8vIEhUTUw1IHJldHVybnMgc2Vjb25kcy4gU00yIEFQSSB1c2VzIG1zZWMgZm9yIHNldFBvc2l0aW9uKCkgZXRjLiwgd2hldGhlciBGbGFzaCBvciBIVE1MNS5cclxuICAgICAgICBmb3IgKGk9MCwgaj1yYW5nZXMubGVuZ3RoOyBpPGo7IGkrKykge1xyXG4gICAgICAgICAgcy5idWZmZXJlZC5wdXNoKHtcclxuICAgICAgICAgICAgJ3N0YXJ0JzogcmFuZ2VzLnN0YXJ0KGkpICogbXNlY1NjYWxlLFxyXG4gICAgICAgICAgICAnZW5kJzogcmFuZ2VzLmVuZChpKSAqIG1zZWNTY2FsZVxyXG4gICAgICAgICAgfSk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvLyB1c2UgdGhlIGxhc3QgdmFsdWUgbG9jYWxseVxyXG4gICAgICAgIGJ1ZmZlcmVkID0gKHJhbmdlcy5lbmQoMCkgLSByYW5nZXMuc3RhcnQoMCkpICogbXNlY1NjYWxlO1xyXG5cclxuICAgICAgICAvLyBsaW5lYXIgY2FzZSwgYnVmZmVyIHN1bTsgZG9lcyBub3QgYWNjb3VudCBmb3Igc2Vla2luZyBhbmQgSFRUUCBwYXJ0aWFscyAvIGJ5dGUgcmFuZ2VzXHJcbiAgICAgICAgbG9hZGVkID0gTWF0aC5taW4oMSwgYnVmZmVyZWQvKGUudGFyZ2V0LmR1cmF0aW9uKm1zZWNTY2FsZSkpO1xyXG5cclxuICAgICAgICAvLyA8ZD5cclxuICAgICAgICBpZiAoaXNQcm9ncmVzcyAmJiByYW5nZXMubGVuZ3RoID4gMSkge1xyXG4gICAgICAgICAgcHJvZ1N0ciA9IFtdO1xyXG4gICAgICAgICAgaiA9IHJhbmdlcy5sZW5ndGg7XHJcbiAgICAgICAgICBmb3IgKGk9MDsgaTxqOyBpKyspIHtcclxuICAgICAgICAgICAgcHJvZ1N0ci5wdXNoKGUudGFyZ2V0LmJ1ZmZlcmVkLnN0YXJ0KGkpKm1zZWNTY2FsZSArJy0nKyBlLnRhcmdldC5idWZmZXJlZC5lbmQoaSkqbXNlY1NjYWxlKTtcclxuICAgICAgICAgIH1cclxuICAgICAgICAgIHNtMi5fd0QodGhpcy5fcy5pZCArICc6IHByb2dyZXNzLCB0aW1lUmFuZ2VzOiAnICsgcHJvZ1N0ci5qb2luKCcsICcpKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGlmIChpc1Byb2dyZXNzICYmICFpc05hTihsb2FkZWQpKSB7XHJcbiAgICAgICAgICBzbTIuX3dEKHRoaXMuX3MuaWQgKyAnOiBwcm9ncmVzcywgJyArIE1hdGguZmxvb3IobG9hZGVkKjEwMCkgKyAnJSBsb2FkZWQnKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgLy8gPC9kPlxyXG5cclxuICAgICAgfVxyXG5cclxuICAgICAgaWYgKCFpc05hTihsb2FkZWQpKSB7XHJcblxyXG4gICAgICAgIC8vIFRPRE86IHByZXZlbnQgY2FsbHMgd2l0aCBkdXBsaWNhdGUgdmFsdWVzLlxyXG4gICAgICAgIHMuX3doaWxlbG9hZGluZyhsb2FkZWQsIHRvdGFsLCBzLl9nZXRfaHRtbDVfZHVyYXRpb24oKSk7XHJcbiAgICAgICAgaWYgKGxvYWRlZCAmJiB0b3RhbCAmJiBsb2FkZWQgPT09IHRvdGFsKSB7XHJcbiAgICAgICAgICAvLyBpbiBjYXNlIFwib25sb2FkXCIgZG9lc24ndCBmaXJlIChlZy4gZ2Vja28gMS45LjIpXHJcbiAgICAgICAgICBodG1sNV9ldmVudHMuY2FucGxheXRocm91Z2guY2FsbCh0aGlzLCBlKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICB9XHJcblxyXG4gICAgfSksXHJcblxyXG4gICAgcmF0ZWNoYW5nZTogaHRtbDVfZXZlbnQoZnVuY3Rpb24oKSB7XHJcblxyXG4gICAgICBzbTIuX3dEKHRoaXMuX3MuaWQgKyAnOiByYXRlY2hhbmdlJyk7XHJcblxyXG4gICAgfSksXHJcblxyXG4gICAgc3VzcGVuZDogaHRtbDVfZXZlbnQoZnVuY3Rpb24oZSkge1xyXG5cclxuICAgICAgLy8gZG93bmxvYWQgcGF1c2VkL3N0b3BwZWQsIG1heSBoYXZlIGZpbmlzaGVkIChlZy4gb25sb2FkKVxyXG4gICAgICB2YXIgcyA9IHRoaXMuX3M7XHJcblxyXG4gICAgICBzbTIuX3dEKHRoaXMuX3MuaWQgKyAnOiBzdXNwZW5kJyk7XHJcbiAgICAgIGh0bWw1X2V2ZW50cy5wcm9ncmVzcy5jYWxsKHRoaXMsIGUpO1xyXG4gICAgICBzLl9vbnN1c3BlbmQoKTtcclxuXHJcbiAgICB9KSxcclxuXHJcbiAgICBzdGFsbGVkOiBodG1sNV9ldmVudChmdW5jdGlvbigpIHtcclxuXHJcbiAgICAgIHNtMi5fd0QodGhpcy5fcy5pZCArICc6IHN0YWxsZWQnKTtcclxuXHJcbiAgICB9KSxcclxuXHJcbiAgICB0aW1ldXBkYXRlOiBodG1sNV9ldmVudChmdW5jdGlvbigpIHtcclxuXHJcbiAgICAgIHRoaXMuX3MuX29uVGltZXIoKTtcclxuXHJcbiAgICB9KSxcclxuXHJcbiAgICB3YWl0aW5nOiBodG1sNV9ldmVudChmdW5jdGlvbigpIHtcclxuXHJcbiAgICAgIHZhciBzID0gdGhpcy5fcztcclxuXHJcbiAgICAgIC8vIHNlZSBhbHNvOiBzZWVraW5nXHJcbiAgICAgIHNtMi5fd0QodGhpcy5fcy5pZCArICc6IHdhaXRpbmcnKTtcclxuXHJcbiAgICAgIC8vIHBsYXliYWNrIGZhc3RlciB0aGFuIGRvd25sb2FkIHJhdGUsIGV0Yy5cclxuICAgICAgcy5fb25idWZmZXJjaGFuZ2UoMSk7XHJcblxyXG4gICAgfSlcclxuXHJcbiAgfTtcclxuXHJcbiAgaHRtbDVPSyA9IGZ1bmN0aW9uKGlPKSB7XHJcblxyXG4gICAgLy8gcGxheWFiaWxpdHkgdGVzdCBiYXNlZCBvbiBVUkwgb3IgTUlNRSB0eXBlXHJcblxyXG4gICAgdmFyIHJlc3VsdDtcclxuXHJcbiAgICBpZiAoIWlPIHx8ICghaU8udHlwZSAmJiAhaU8udXJsICYmICFpTy5zZXJ2ZXJVUkwpKSB7XHJcblxyXG4gICAgICAvLyBub3RoaW5nIHRvIGNoZWNrXHJcbiAgICAgIHJlc3VsdCA9IGZhbHNlO1xyXG5cclxuICAgIH0gZWxzZSBpZiAoaU8uc2VydmVyVVJMIHx8IChpTy50eXBlICYmIHByZWZlckZsYXNoQ2hlY2soaU8udHlwZSkpKSB7XHJcblxyXG4gICAgICAvLyBSVE1QLCBvciBwcmVmZXJyaW5nIGZsYXNoXHJcbiAgICAgIHJlc3VsdCA9IGZhbHNlO1xyXG5cclxuICAgIH0gZWxzZSB7XHJcblxyXG4gICAgICAvLyBVc2UgdHlwZSwgaWYgc3BlY2lmaWVkLiBQYXNzIGRhdGE6IFVSSXMgdG8gSFRNTDUuIElmIEhUTUw1LW9ubHkgbW9kZSwgbm8gb3RoZXIgb3B0aW9ucywgc28ganVzdCBnaXZlICdlclxyXG4gICAgICByZXN1bHQgPSAoKGlPLnR5cGUgPyBodG1sNUNhblBsYXkoe3R5cGU6aU8udHlwZX0pIDogaHRtbDVDYW5QbGF5KHt1cmw6aU8udXJsfSkgfHwgc20yLmh0bWw1T25seSB8fCBpTy51cmwubWF0Y2goL2RhdGFcXDovaSkpKTtcclxuXHJcbiAgICB9XHJcblxyXG4gICAgcmV0dXJuIHJlc3VsdDtcclxuXHJcbiAgfTtcclxuXHJcbiAgaHRtbDVVbmxvYWQgPSBmdW5jdGlvbihvQXVkaW8pIHtcclxuXHJcbiAgICAvKipcclxuICAgICAqIEludGVybmFsIG1ldGhvZDogVW5sb2FkIG1lZGlhLCBhbmQgY2FuY2VsIGFueSBjdXJyZW50L3BlbmRpbmcgbmV0d29yayByZXF1ZXN0cy5cclxuICAgICAqIEZpcmVmb3ggY2FuIGxvYWQgYW4gZW1wdHkgVVJMLCB3aGljaCBhbGxlZ2VkbHkgZGVzdHJveXMgdGhlIGRlY29kZXIgYW5kIHN0b3BzIHRoZSBkb3dubG9hZC5cclxuICAgICAqIGh0dHBzOi8vZGV2ZWxvcGVyLm1vemlsbGEub3JnL0VuL1VzaW5nX2F1ZGlvX2FuZF92aWRlb19pbl9GaXJlZm94I1N0b3BwaW5nX3RoZV9kb3dubG9hZF9vZl9tZWRpYVxyXG4gICAgICogSG93ZXZlciwgRmlyZWZveCBoYXMgYmVlbiBzZWVuIGxvYWRpbmcgYSByZWxhdGl2ZSBVUkwgZnJvbSAnJyBhbmQgdGh1cyByZXF1ZXN0aW5nIHRoZSBob3N0aW5nIHBhZ2Ugb24gdW5sb2FkLlxyXG4gICAgICogT3RoZXIgVUEgYmVoYXZpb3VyIGlzIHVuY2xlYXIsIHNvIGV2ZXJ5b25lIGVsc2UgZ2V0cyBhbiBhYm91dDpibGFuay1zdHlsZSBVUkwuXHJcbiAgICAgKi9cclxuXHJcbiAgICB2YXIgdXJsO1xyXG5cclxuICAgIGlmIChvQXVkaW8pIHtcclxuXHJcbiAgICAgIC8vIEZpcmVmb3ggYW5kIENocm9tZSBhY2NlcHQgc2hvcnQgV0FWZSBkYXRhOiBVUklzLiBDaG9tZSBkaXNsaWtlcyBhdWRpby93YXYsIGJ1dCBhY2NlcHRzIGF1ZGlvL3dhdiBmb3IgZGF0YTogTUlNRS5cclxuICAgICAgLy8gRGVza3RvcCBTYWZhcmkgY29tcGxhaW5zIC8gZmFpbHMgb24gZGF0YTogVVJJLCBzbyBpdCBnZXRzIGFib3V0OmJsYW5rLlxyXG4gICAgICB1cmwgPSAoaXNTYWZhcmkgPyBlbXB0eVVSTCA6IChzbTIuaHRtbDUuY2FuUGxheVR5cGUoJ2F1ZGlvL3dhdicpID8gZW1wdHlXQVYgOiBlbXB0eVVSTCkpO1xyXG5cclxuICAgICAgb0F1ZGlvLnNyYyA9IHVybDtcclxuXHJcbiAgICAgIC8vIHJlc2V0IHNvbWUgc3RhdGUsIHRvb1xyXG4gICAgICBpZiAob0F1ZGlvLl9jYWxsZWRfdW5sb2FkICE9PSB1bmRlZmluZWQpIHtcclxuICAgICAgICBvQXVkaW8uX2NhbGxlZF9sb2FkID0gZmFsc2U7XHJcbiAgICAgIH1cclxuXHJcbiAgICB9XHJcblxyXG4gICAgaWYgKHVzZUdsb2JhbEhUTUw1QXVkaW8pIHtcclxuXHJcbiAgICAgIC8vIGVuc3VyZSBVUkwgc3RhdGUgaXMgdHJhc2hlZCwgYWxzb1xyXG4gICAgICBsYXN0R2xvYmFsSFRNTDVVUkwgPSBudWxsO1xyXG5cclxuICAgIH1cclxuXHJcbiAgICByZXR1cm4gdXJsO1xyXG5cclxuICB9O1xyXG5cclxuICBodG1sNUNhblBsYXkgPSBmdW5jdGlvbihvKSB7XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBUcnkgdG8gZmluZCBNSU1FLCB0ZXN0IGFuZCByZXR1cm4gdHJ1dGhpbmVzc1xyXG4gICAgICogbyA9IHtcclxuICAgICAqICB1cmw6ICcvcGF0aC90by9hbi5tcDMnLFxyXG4gICAgICogIHR5cGU6ICdhdWRpby9tcDMnXHJcbiAgICAgKiB9XHJcbiAgICAgKi9cclxuXHJcbiAgICBpZiAoIXNtMi51c2VIVE1MNUF1ZGlvIHx8ICFzbTIuaGFzSFRNTDUpIHtcclxuICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgfVxyXG5cclxuICAgIHZhciB1cmwgPSAoby51cmwgfHwgbnVsbCksXHJcbiAgICAgICAgbWltZSA9IChvLnR5cGUgfHwgbnVsbCksXHJcbiAgICAgICAgYUYgPSBzbTIuYXVkaW9Gb3JtYXRzLFxyXG4gICAgICAgIHJlc3VsdCxcclxuICAgICAgICBvZmZzZXQsXHJcbiAgICAgICAgZmlsZUV4dCxcclxuICAgICAgICBpdGVtO1xyXG5cclxuICAgIC8vIGFjY291bnQgZm9yIGtub3duIGNhc2VzIGxpa2UgYXVkaW8vbXAzXHJcblxyXG4gICAgaWYgKG1pbWUgJiYgc20yLmh0bWw1W21pbWVdICE9PSBfdW5kZWZpbmVkKSB7XHJcbiAgICAgIHJldHVybiAoc20yLmh0bWw1W21pbWVdICYmICFwcmVmZXJGbGFzaENoZWNrKG1pbWUpKTtcclxuICAgIH1cclxuXHJcbiAgICBpZiAoIWh0bWw1RXh0KSB7XHJcbiAgICAgIGh0bWw1RXh0ID0gW107XHJcbiAgICAgIGZvciAoaXRlbSBpbiBhRikge1xyXG4gICAgICAgIGlmIChhRi5oYXNPd25Qcm9wZXJ0eShpdGVtKSkge1xyXG4gICAgICAgICAgaHRtbDVFeHQucHVzaChpdGVtKTtcclxuICAgICAgICAgIGlmIChhRltpdGVtXS5yZWxhdGVkKSB7XHJcbiAgICAgICAgICAgIGh0bWw1RXh0ID0gaHRtbDVFeHQuY29uY2F0KGFGW2l0ZW1dLnJlbGF0ZWQpO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG4gICAgICBodG1sNUV4dCA9IG5ldyBSZWdFeHAoJ1xcXFwuKCcraHRtbDVFeHQuam9pbignfCcpKycpKFxcXFw/LiopPyQnLCdpJyk7XHJcbiAgICB9XHJcblxyXG4gICAgLy8gVE9ETzogU3RyaXAgVVJMIHF1ZXJpZXMsIGV0Yy5cclxuICAgIGZpbGVFeHQgPSAodXJsID8gdXJsLnRvTG93ZXJDYXNlKCkubWF0Y2goaHRtbDVFeHQpIDogbnVsbCk7XHJcblxyXG4gICAgaWYgKCFmaWxlRXh0IHx8ICFmaWxlRXh0Lmxlbmd0aCkge1xyXG4gICAgICBpZiAoIW1pbWUpIHtcclxuICAgICAgICByZXN1bHQgPSBmYWxzZTtcclxuICAgICAgfSBlbHNlIHtcclxuICAgICAgICAvLyBhdWRpby9tcDMgLT4gbXAzLCByZXN1bHQgc2hvdWxkIGJlIGtub3duXHJcbiAgICAgICAgb2Zmc2V0ID0gbWltZS5pbmRleE9mKCc7Jyk7XHJcbiAgICAgICAgLy8gc3RyaXAgXCJhdWRpby9YOyBjb2RlY3MuLi5cIlxyXG4gICAgICAgIGZpbGVFeHQgPSAob2Zmc2V0ICE9PSAtMT9taW1lLnN1YnN0cigwLG9mZnNldCk6bWltZSkuc3Vic3RyKDYpO1xyXG4gICAgICB9XHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICAvLyBtYXRjaCB0aGUgcmF3IGV4dGVuc2lvbiBuYW1lIC0gXCJtcDNcIiwgZm9yIGV4YW1wbGVcclxuICAgICAgZmlsZUV4dCA9IGZpbGVFeHRbMV07XHJcbiAgICB9XHJcblxyXG4gICAgaWYgKGZpbGVFeHQgJiYgc20yLmh0bWw1W2ZpbGVFeHRdICE9PSBfdW5kZWZpbmVkKSB7XHJcbiAgICAgIC8vIHJlc3VsdCBrbm93blxyXG4gICAgICByZXN1bHQgPSAoc20yLmh0bWw1W2ZpbGVFeHRdICYmICFwcmVmZXJGbGFzaENoZWNrKGZpbGVFeHQpKTtcclxuICAgIH0gZWxzZSB7XHJcbiAgICAgIG1pbWUgPSAnYXVkaW8vJytmaWxlRXh0O1xyXG4gICAgICByZXN1bHQgPSBzbTIuaHRtbDUuY2FuUGxheVR5cGUoe3R5cGU6bWltZX0pO1xyXG4gICAgICBzbTIuaHRtbDVbZmlsZUV4dF0gPSByZXN1bHQ7XHJcbiAgICAgIC8vIHNtMi5fd0QoJ2NhblBsYXlUeXBlLCBmb3VuZCByZXN1bHQ6ICcgKyByZXN1bHQpO1xyXG4gICAgICByZXN1bHQgPSAocmVzdWx0ICYmIHNtMi5odG1sNVttaW1lXSAmJiAhcHJlZmVyRmxhc2hDaGVjayhtaW1lKSk7XHJcbiAgICB9XHJcblxyXG4gICAgcmV0dXJuIHJlc3VsdDtcclxuXHJcbiAgfTtcclxuXHJcbiAgdGVzdEhUTUw1ID0gZnVuY3Rpb24oKSB7XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBJbnRlcm5hbDogSXRlcmF0ZXMgb3ZlciBhdWRpb0Zvcm1hdHMsIGRldGVybWluaW5nIHN1cHBvcnQgZWcuIGF1ZGlvL21wMywgYXVkaW8vbXBlZyBhbmQgc28gb25cclxuICAgICAqIGFzc2lnbnMgcmVzdWx0cyB0byBodG1sNVtdIGFuZCBmbGFzaFtdLlxyXG4gICAgICovXHJcblxyXG4gICAgaWYgKCFzbTIudXNlSFRNTDVBdWRpbyB8fCAhc20yLmhhc0hUTUw1KSB7XHJcbiAgICAgIC8vIHdpdGhvdXQgSFRNTDUsIHdlIG5lZWQgRmxhc2guXHJcbiAgICAgIHNtMi5odG1sNS51c2luZ0ZsYXNoID0gdHJ1ZTtcclxuICAgICAgbmVlZHNGbGFzaCA9IHRydWU7XHJcbiAgICAgIHJldHVybiBmYWxzZTtcclxuICAgIH1cclxuXHJcbiAgICAvLyBkb3VibGUtd2hhbW15OiBPcGVyYSA5LjY0IHRocm93cyBXUk9OR19BUkdVTUVOVFNfRVJSIGlmIG5vIHBhcmFtZXRlciBwYXNzZWQgdG8gQXVkaW8oKSwgYW5kIFdlYmtpdCArIGlPUyBoYXBwaWx5IHRyaWVzIHRvIGxvYWQgXCJudWxsXCIgYXMgYSBVUkwuIDovXHJcbiAgICB2YXIgYSA9IChBdWRpbyAhPT0gX3VuZGVmaW5lZCA/IChpc09wZXJhICYmIG9wZXJhLnZlcnNpb24oKSA8IDEwID8gbmV3IEF1ZGlvKG51bGwpIDogbmV3IEF1ZGlvKCkpIDogbnVsbCksXHJcbiAgICAgICAgaXRlbSwgbG9va3VwLCBzdXBwb3J0ID0ge30sIGFGLCBpO1xyXG5cclxuICAgIGZ1bmN0aW9uIGNwKG0pIHtcclxuXHJcbiAgICAgIHZhciBjYW5QbGF5LCBqLFxyXG4gICAgICAgICAgcmVzdWx0ID0gZmFsc2UsXHJcbiAgICAgICAgICBpc09LID0gZmFsc2U7XHJcblxyXG4gICAgICBpZiAoIWEgfHwgdHlwZW9mIGEuY2FuUGxheVR5cGUgIT09ICdmdW5jdGlvbicpIHtcclxuICAgICAgICByZXR1cm4gcmVzdWx0O1xyXG4gICAgICB9XHJcblxyXG4gICAgICBpZiAobSBpbnN0YW5jZW9mIEFycmF5KSB7XHJcbiAgICAgICAgLy8gaXRlcmF0ZSB0aHJvdWdoIGFsbCBtaW1lIHR5cGVzLCByZXR1cm4gYW55IHN1Y2Nlc3Nlc1xyXG4gICAgICAgIGZvciAoaT0wLCBqPW0ubGVuZ3RoOyBpPGo7IGkrKykge1xyXG4gICAgICAgICAgaWYgKHNtMi5odG1sNVttW2ldXSB8fCBhLmNhblBsYXlUeXBlKG1baV0pLm1hdGNoKHNtMi5odG1sNVRlc3QpKSB7XHJcbiAgICAgICAgICAgIGlzT0sgPSB0cnVlO1xyXG4gICAgICAgICAgICBzbTIuaHRtbDVbbVtpXV0gPSB0cnVlO1xyXG4gICAgICAgICAgICAvLyBub3RlIGZsYXNoIHN1cHBvcnQsIHRvb1xyXG4gICAgICAgICAgICBzbTIuZmxhc2hbbVtpXV0gPSAhIShtW2ldLm1hdGNoKGZsYXNoTUlNRSkpO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgICByZXN1bHQgPSBpc09LO1xyXG4gICAgICB9IGVsc2Uge1xyXG4gICAgICAgIGNhblBsYXkgPSAoYSAmJiB0eXBlb2YgYS5jYW5QbGF5VHlwZSA9PT0gJ2Z1bmN0aW9uJyA/IGEuY2FuUGxheVR5cGUobSkgOiBmYWxzZSk7XHJcbiAgICAgICAgcmVzdWx0ID0gISEoY2FuUGxheSAmJiAoY2FuUGxheS5tYXRjaChzbTIuaHRtbDVUZXN0KSkpO1xyXG4gICAgICB9XHJcblxyXG4gICAgICByZXR1cm4gcmVzdWx0O1xyXG5cclxuICAgIH1cclxuXHJcbiAgICAvLyB0ZXN0IGFsbCByZWdpc3RlcmVkIGZvcm1hdHMgKyBjb2RlY3NcclxuXHJcbiAgICBhRiA9IHNtMi5hdWRpb0Zvcm1hdHM7XHJcblxyXG4gICAgZm9yIChpdGVtIGluIGFGKSB7XHJcblxyXG4gICAgICBpZiAoYUYuaGFzT3duUHJvcGVydHkoaXRlbSkpIHtcclxuXHJcbiAgICAgICAgbG9va3VwID0gJ2F1ZGlvLycgKyBpdGVtO1xyXG5cclxuICAgICAgICBzdXBwb3J0W2l0ZW1dID0gY3AoYUZbaXRlbV0udHlwZSk7XHJcblxyXG4gICAgICAgIC8vIHdyaXRlIGJhY2sgZ2VuZXJpYyB0eXBlIHRvbywgZWcuIGF1ZGlvL21wM1xyXG4gICAgICAgIHN1cHBvcnRbbG9va3VwXSA9IHN1cHBvcnRbaXRlbV07XHJcblxyXG4gICAgICAgIC8vIGFzc2lnbiBmbGFzaFxyXG4gICAgICAgIGlmIChpdGVtLm1hdGNoKGZsYXNoTUlNRSkpIHtcclxuXHJcbiAgICAgICAgICBzbTIuZmxhc2hbaXRlbV0gPSB0cnVlO1xyXG4gICAgICAgICAgc20yLmZsYXNoW2xvb2t1cF0gPSB0cnVlO1xyXG5cclxuICAgICAgICB9IGVsc2Uge1xyXG5cclxuICAgICAgICAgIHNtMi5mbGFzaFtpdGVtXSA9IGZhbHNlO1xyXG4gICAgICAgICAgc20yLmZsYXNoW2xvb2t1cF0gPSBmYWxzZTtcclxuXHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvLyBhc3NpZ24gcmVzdWx0IHRvIHJlbGF0ZWQgZm9ybWF0cywgdG9vXHJcblxyXG4gICAgICAgIGlmIChhRltpdGVtXSAmJiBhRltpdGVtXS5yZWxhdGVkKSB7XHJcblxyXG4gICAgICAgICAgZm9yIChpPWFGW2l0ZW1dLnJlbGF0ZWQubGVuZ3RoLTE7IGkgPj0gMDsgaS0tKSB7XHJcblxyXG4gICAgICAgICAgICAvLyBlZy4gYXVkaW8vbTRhXHJcbiAgICAgICAgICAgIHN1cHBvcnRbJ2F1ZGlvLycrYUZbaXRlbV0ucmVsYXRlZFtpXV0gPSBzdXBwb3J0W2l0ZW1dO1xyXG4gICAgICAgICAgICBzbTIuaHRtbDVbYUZbaXRlbV0ucmVsYXRlZFtpXV0gPSBzdXBwb3J0W2l0ZW1dO1xyXG4gICAgICAgICAgICBzbTIuZmxhc2hbYUZbaXRlbV0ucmVsYXRlZFtpXV0gPSBzdXBwb3J0W2l0ZW1dO1xyXG5cclxuICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgfVxyXG5cclxuICAgIH1cclxuXHJcbiAgICBzdXBwb3J0LmNhblBsYXlUeXBlID0gKGE/Y3A6bnVsbCk7XHJcbiAgICBzbTIuaHRtbDUgPSBtaXhpbihzbTIuaHRtbDUsIHN1cHBvcnQpO1xyXG5cclxuICAgIHNtMi5odG1sNS51c2luZ0ZsYXNoID0gZmVhdHVyZUNoZWNrKCk7XHJcbiAgICBuZWVkc0ZsYXNoID0gc20yLmh0bWw1LnVzaW5nRmxhc2g7XHJcblxyXG4gICAgcmV0dXJuIHRydWU7XHJcblxyXG4gIH07XHJcblxyXG4gIHN0cmluZ3MgPSB7XHJcblxyXG4gICAgLy8gPGQ+XHJcbiAgICBub3RSZWFkeTogJ1VuYXZhaWxhYmxlIC0gd2FpdCB1bnRpbCBvbnJlYWR5KCkgaGFzIGZpcmVkLicsXHJcbiAgICBub3RPSzogJ0F1ZGlvIHN1cHBvcnQgaXMgbm90IGF2YWlsYWJsZS4nLFxyXG4gICAgZG9tRXJyb3I6IHNtICsgJ2V4Y2VwdGlvbiBjYXVnaHQgd2hpbGUgYXBwZW5kaW5nIFNXRiB0byBET00uJyxcclxuICAgIHNwY1dtb2RlOiAnUmVtb3Zpbmcgd21vZGUsIHByZXZlbnRpbmcga25vd24gU1dGIGxvYWRpbmcgaXNzdWUocyknLFxyXG4gICAgc3dmNDA0OiBzbWMgKyAnVmVyaWZ5IHRoYXQgJXMgaXMgYSB2YWxpZCBwYXRoLicsXHJcbiAgICB0cnlEZWJ1ZzogJ1RyeSAnICsgc20gKyAnLmRlYnVnRmxhc2ggPSB0cnVlIGZvciBtb3JlIHNlY3VyaXR5IGRldGFpbHMgKG91dHB1dCBnb2VzIHRvIFNXRi4pJyxcclxuICAgIGNoZWNrU1dGOiAnU2VlIFNXRiBvdXRwdXQgZm9yIG1vcmUgZGVidWcgaW5mby4nLFxyXG4gICAgbG9jYWxGYWlsOiBzbWMgKyAnTm9uLUhUVFAgcGFnZSAoJyArIGRvYy5sb2NhdGlvbi5wcm90b2NvbCArICcgVVJMPykgUmV2aWV3IEZsYXNoIHBsYXllciBzZWN1cml0eSBzZXR0aW5ncyBmb3IgdGhpcyBzcGVjaWFsIGNhc2U6XFxuaHR0cDovL3d3dy5tYWNyb21lZGlhLmNvbS9zdXBwb3J0L2RvY3VtZW50YXRpb24vZW4vZmxhc2hwbGF5ZXIvaGVscC9zZXR0aW5nc19tYW5hZ2VyMDQuaHRtbFxcbk1heSBuZWVkIHRvIGFkZC9hbGxvdyBwYXRoLCBlZy4gYzovc20yLyBvciAvdXNlcnMvbWUvc20yLycsXHJcbiAgICB3YWl0Rm9jdXM6IHNtYyArICdTcGVjaWFsIGNhc2U6IFdhaXRpbmcgZm9yIFNXRiB0byBsb2FkIHdpdGggd2luZG93IGZvY3VzLi4uJyxcclxuICAgIHdhaXRGb3JldmVyOiBzbWMgKyAnV2FpdGluZyBpbmRlZmluaXRlbHkgZm9yIEZsYXNoICh3aWxsIHJlY292ZXIgaWYgdW5ibG9ja2VkKS4uLicsXHJcbiAgICB3YWl0U1dGOiBzbWMgKyAnV2FpdGluZyBmb3IgMTAwJSBTV0YgbG9hZC4uLicsXHJcbiAgICBuZWVkRnVuY3Rpb246IHNtYyArICdGdW5jdGlvbiBvYmplY3QgZXhwZWN0ZWQgZm9yICVzJyxcclxuICAgIGJhZElEOiAnU291bmQgSUQgXCIlc1wiIHNob3VsZCBiZSBhIHN0cmluZywgc3RhcnRpbmcgd2l0aCBhIG5vbi1udW1lcmljIGNoYXJhY3RlcicsXHJcbiAgICBjdXJyZW50T2JqOiBzbWMgKyAnX2RlYnVnKCk6IEN1cnJlbnQgc291bmQgb2JqZWN0cycsXHJcbiAgICB3YWl0T25sb2FkOiBzbWMgKyAnV2FpdGluZyBmb3Igd2luZG93Lm9ubG9hZCgpJyxcclxuICAgIGRvY0xvYWRlZDogc21jICsgJ0RvY3VtZW50IGFscmVhZHkgbG9hZGVkJyxcclxuICAgIG9ubG9hZDogc21jICsgJ2luaXRDb21wbGV0ZSgpOiBjYWxsaW5nIHNvdW5kTWFuYWdlci5vbmxvYWQoKScsXHJcbiAgICBvbmxvYWRPSzogc20gKyAnLm9ubG9hZCgpIGNvbXBsZXRlJyxcclxuICAgIGRpZEluaXQ6IHNtYyArICdpbml0KCk6IEFscmVhZHkgY2FsbGVkPycsXHJcbiAgICBzZWNOb3RlOiAnRmxhc2ggc2VjdXJpdHkgbm90ZTogTmV0d29yay9pbnRlcm5ldCBVUkxzIHdpbGwgbm90IGxvYWQgZHVlIHRvIHNlY3VyaXR5IHJlc3RyaWN0aW9ucy4gQWNjZXNzIGNhbiBiZSBjb25maWd1cmVkIHZpYSBGbGFzaCBQbGF5ZXIgR2xvYmFsIFNlY3VyaXR5IFNldHRpbmdzIFBhZ2U6IGh0dHA6Ly93d3cubWFjcm9tZWRpYS5jb20vc3VwcG9ydC9kb2N1bWVudGF0aW9uL2VuL2ZsYXNocGxheWVyL2hlbHAvc2V0dGluZ3NfbWFuYWdlcjA0Lmh0bWwnLFxyXG4gICAgYmFkUmVtb3ZlOiBzbWMgKyAnRmFpbGVkIHRvIHJlbW92ZSBGbGFzaCBub2RlLicsXHJcbiAgICBzaHV0ZG93bjogc20gKyAnLmRpc2FibGUoKTogU2h1dHRpbmcgZG93bicsXHJcbiAgICBxdWV1ZTogc21jICsgJ1F1ZXVlaW5nICVzIGhhbmRsZXInLFxyXG4gICAgc21FcnJvcjogJ1NNU291bmQubG9hZCgpOiBFeGNlcHRpb246IEpTLUZsYXNoIGNvbW11bmljYXRpb24gZmFpbGVkLCBvciBKUyBlcnJvci4nLFxyXG4gICAgZmJUaW1lb3V0OiAnTm8gZmxhc2ggcmVzcG9uc2UsIGFwcGx5aW5nIC4nK3N3ZkNTUy5zd2ZUaW1lZG91dCsnIENTUy4uLicsXHJcbiAgICBmYkxvYWRlZDogJ0ZsYXNoIGxvYWRlZCcsXHJcbiAgICBmYkhhbmRsZXI6IHNtYyArICdmbGFzaEJsb2NrSGFuZGxlcigpJyxcclxuICAgIG1hblVSTDogJ1NNU291bmQubG9hZCgpOiBVc2luZyBtYW51YWxseS1hc3NpZ25lZCBVUkwnLFxyXG4gICAgb25VUkw6IHNtICsgJy5sb2FkKCk6IGN1cnJlbnQgVVJMIGFscmVhZHkgYXNzaWduZWQuJyxcclxuICAgIGJhZEZWOiBzbSArICcuZmxhc2hWZXJzaW9uIG11c3QgYmUgOCBvciA5LiBcIiVzXCIgaXMgaW52YWxpZC4gUmV2ZXJ0aW5nIHRvICVzLicsXHJcbiAgICBhczJsb29wOiAnTm90ZTogU2V0dGluZyBzdHJlYW06ZmFsc2Ugc28gbG9vcGluZyBjYW4gd29yayAoZmxhc2ggOCBsaW1pdGF0aW9uKScsXHJcbiAgICBub05TTG9vcDogJ05vdGU6IExvb3Bpbmcgbm90IGltcGxlbWVudGVkIGZvciBNb3ZpZVN0YXIgZm9ybWF0cycsXHJcbiAgICBuZWVkZmw5OiAnTm90ZTogU3dpdGNoaW5nIHRvIGZsYXNoIDksIHJlcXVpcmVkIGZvciBNUDQgZm9ybWF0cy4nLFxyXG4gICAgbWZUaW1lb3V0OiAnU2V0dGluZyBmbGFzaExvYWRUaW1lb3V0ID0gMCAoaW5maW5pdGUpIGZvciBvZmYtc2NyZWVuLCBtb2JpbGUgZmxhc2ggY2FzZScsXHJcbiAgICBuZWVkRmxhc2g6IHNtYyArICdGYXRhbCBlcnJvcjogRmxhc2ggaXMgbmVlZGVkIHRvIHBsYXkgc29tZSByZXF1aXJlZCBmb3JtYXRzLCBidXQgaXMgbm90IGF2YWlsYWJsZS4nLFxyXG4gICAgZ290Rm9jdXM6IHNtYyArICdHb3Qgd2luZG93IGZvY3VzLicsXHJcbiAgICBwb2xpY3k6ICdFbmFibGluZyB1c2VQb2xpY3lGaWxlIGZvciBkYXRhIGFjY2VzcycsXHJcbiAgICBzZXR1cDogc20gKyAnLnNldHVwKCk6IGFsbG93ZWQgcGFyYW1ldGVyczogJXMnLFxyXG4gICAgc2V0dXBFcnJvcjogc20gKyAnLnNldHVwKCk6IFwiJXNcIiBjYW5ub3QgYmUgYXNzaWduZWQgd2l0aCB0aGlzIG1ldGhvZC4nLFxyXG4gICAgc2V0dXBVbmRlZjogc20gKyAnLnNldHVwKCk6IENvdWxkIG5vdCBmaW5kIG9wdGlvbiBcIiVzXCInLFxyXG4gICAgc2V0dXBMYXRlOiBzbSArICcuc2V0dXAoKTogdXJsLCBmbGFzaFZlcnNpb24gYW5kIGh0bWw1VGVzdCBwcm9wZXJ0eSBjaGFuZ2VzIHdpbGwgbm90IHRha2UgZWZmZWN0IHVudGlsIHJlYm9vdCgpLicsXHJcbiAgICBub1VSTDogc21jICsgJ0ZsYXNoIFVSTCByZXF1aXJlZC4gQ2FsbCBzb3VuZE1hbmFnZXIuc2V0dXAoe3VybDouLi59KSB0byBnZXQgc3RhcnRlZC4nLFxyXG4gICAgc20yTG9hZGVkOiAnU291bmRNYW5hZ2VyIDI6IFJlYWR5LiAnICsgU3RyaW5nLmZyb21DaGFyQ29kZSgxMDAwMyksXHJcbiAgICByZXNldDogc20gKyAnLnJlc2V0KCk6IFJlbW92aW5nIGV2ZW50IGNhbGxiYWNrcycsXHJcbiAgICBtb2JpbGVVQTogJ01vYmlsZSBVQSBkZXRlY3RlZCwgcHJlZmVycmluZyBIVE1MNSBieSBkZWZhdWx0LicsXHJcbiAgICBnbG9iYWxIVE1MNTogJ1VzaW5nIHNpbmdsZXRvbiBIVE1MNSBBdWRpbygpIHBhdHRlcm4gZm9yIHRoaXMgZGV2aWNlLidcclxuICAgIC8vIDwvZD5cclxuXHJcbiAgfTtcclxuXHJcbiAgc3RyID0gZnVuY3Rpb24oKSB7XHJcblxyXG4gICAgLy8gaW50ZXJuYWwgc3RyaW5nIHJlcGxhY2UgaGVscGVyLlxyXG4gICAgLy8gYXJndW1lbnRzOiBvIFssaXRlbXMgdG8gcmVwbGFjZV1cclxuICAgIC8vIDxkPlxyXG5cclxuICAgIHZhciBhcmdzLFxyXG4gICAgICAgIGksIGosIG8sXHJcbiAgICAgICAgc3N0cjtcclxuXHJcbiAgICAvLyByZWFsIGFycmF5LCBwbGVhc2VcclxuICAgIGFyZ3MgPSBzbGljZS5jYWxsKGFyZ3VtZW50cyk7XHJcblxyXG4gICAgLy8gZmlyc3QgYXJndW1lbnRcclxuICAgIG8gPSBhcmdzLnNoaWZ0KCk7XHJcblxyXG4gICAgc3N0ciA9IChzdHJpbmdzICYmIHN0cmluZ3Nbb10gPyBzdHJpbmdzW29dIDogJycpO1xyXG5cclxuICAgIGlmIChzc3RyICYmIGFyZ3MgJiYgYXJncy5sZW5ndGgpIHtcclxuICAgICAgZm9yIChpID0gMCwgaiA9IGFyZ3MubGVuZ3RoOyBpIDwgajsgaSsrKSB7XHJcbiAgICAgICAgc3N0ciA9IHNzdHIucmVwbGFjZSgnJXMnLCBhcmdzW2ldKTtcclxuICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIHJldHVybiBzc3RyO1xyXG4gICAgLy8gPC9kPlxyXG5cclxuICB9O1xyXG5cclxuICBsb29wRml4ID0gZnVuY3Rpb24oc09wdCkge1xyXG5cclxuICAgIC8vIGZsYXNoIDggcmVxdWlyZXMgc3RyZWFtID0gZmFsc2UgZm9yIGxvb3BpbmcgdG8gd29ya1xyXG4gICAgaWYgKGZWID09PSA4ICYmIHNPcHQubG9vcHMgPiAxICYmIHNPcHQuc3RyZWFtKSB7XHJcbiAgICAgIF93RFMoJ2FzMmxvb3AnKTtcclxuICAgICAgc09wdC5zdHJlYW0gPSBmYWxzZTtcclxuICAgIH1cclxuXHJcbiAgICByZXR1cm4gc09wdDtcclxuXHJcbiAgfTtcclxuXHJcbiAgcG9saWN5Rml4ID0gZnVuY3Rpb24oc09wdCwgc1ByZSkge1xyXG5cclxuICAgIGlmIChzT3B0ICYmICFzT3B0LnVzZVBvbGljeUZpbGUgJiYgKHNPcHQub25pZDMgfHwgc09wdC51c2VQZWFrRGF0YSB8fCBzT3B0LnVzZVdhdmVmb3JtRGF0YSB8fCBzT3B0LnVzZUVRRGF0YSkpIHtcclxuICAgICAgc20yLl93RCgoc1ByZSB8fCAnJykgKyBzdHIoJ3BvbGljeScpKTtcclxuICAgICAgc09wdC51c2VQb2xpY3lGaWxlID0gdHJ1ZTtcclxuICAgIH1cclxuXHJcbiAgICByZXR1cm4gc09wdDtcclxuXHJcbiAgfTtcclxuXHJcbiAgY29tcGxhaW4gPSBmdW5jdGlvbihzTXNnKSB7XHJcblxyXG4gICAgLy8gPGQ+XHJcbiAgICBpZiAoaGFzQ29uc29sZSAmJiBjb25zb2xlLndhcm4gIT09IF91bmRlZmluZWQpIHtcclxuICAgICAgY29uc29sZS53YXJuKHNNc2cpO1xyXG4gICAgfSBlbHNlIHtcclxuICAgICAgc20yLl93RChzTXNnKTtcclxuICAgIH1cclxuICAgIC8vIDwvZD5cclxuXHJcbiAgfTtcclxuXHJcbiAgZG9Ob3RoaW5nID0gZnVuY3Rpb24oKSB7XHJcblxyXG4gICAgcmV0dXJuIGZhbHNlO1xyXG5cclxuICB9O1xyXG5cclxuICBkaXNhYmxlT2JqZWN0ID0gZnVuY3Rpb24obykge1xyXG5cclxuICAgIHZhciBvUHJvcDtcclxuXHJcbiAgICBmb3IgKG9Qcm9wIGluIG8pIHtcclxuICAgICAgaWYgKG8uaGFzT3duUHJvcGVydHkob1Byb3ApICYmIHR5cGVvZiBvW29Qcm9wXSA9PT0gJ2Z1bmN0aW9uJykge1xyXG4gICAgICAgIG9bb1Byb3BdID0gZG9Ob3RoaW5nO1xyXG4gICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgb1Byb3AgPSBudWxsO1xyXG5cclxuICB9O1xyXG5cclxuICBmYWlsU2FmZWx5ID0gZnVuY3Rpb24oYk5vRGlzYWJsZSkge1xyXG5cclxuICAgIC8vIGdlbmVyYWwgZmFpbHVyZSBleGNlcHRpb24gaGFuZGxlclxyXG5cclxuICAgIGlmIChiTm9EaXNhYmxlID09PSBfdW5kZWZpbmVkKSB7XHJcbiAgICAgIGJOb0Rpc2FibGUgPSBmYWxzZTtcclxuICAgIH1cclxuXHJcbiAgICBpZiAoZGlzYWJsZWQgfHwgYk5vRGlzYWJsZSkge1xyXG4gICAgICBzbTIuZGlzYWJsZShiTm9EaXNhYmxlKTtcclxuICAgIH1cclxuXHJcbiAgfTtcclxuXHJcbiAgbm9ybWFsaXplTW92aWVVUkwgPSBmdW5jdGlvbihzbVVSTCkge1xyXG5cclxuICAgIHZhciB1cmxQYXJhbXMgPSBudWxsLCB1cmw7XHJcblxyXG4gICAgaWYgKHNtVVJMKSB7XHJcbiAgICAgIGlmIChzbVVSTC5tYXRjaCgvXFwuc3dmKFxcPy4qKT8kL2kpKSB7XHJcbiAgICAgICAgdXJsUGFyYW1zID0gc21VUkwuc3Vic3RyKHNtVVJMLnRvTG93ZXJDYXNlKCkubGFzdEluZGV4T2YoJy5zd2Y/JykgKyA0KTtcclxuICAgICAgICBpZiAodXJsUGFyYW1zKSB7XHJcbiAgICAgICAgICAvLyBhc3N1bWUgdXNlciBrbm93cyB3aGF0IHRoZXkncmUgZG9pbmdcclxuICAgICAgICAgIHJldHVybiBzbVVSTDtcclxuICAgICAgICB9XHJcbiAgICAgIH0gZWxzZSBpZiAoc21VUkwubGFzdEluZGV4T2YoJy8nKSAhPT0gc21VUkwubGVuZ3RoIC0gMSkge1xyXG4gICAgICAgIC8vIGFwcGVuZCB0cmFpbGluZyBzbGFzaCwgaWYgbmVlZGVkXHJcbiAgICAgICAgc21VUkwgKz0gJy8nO1xyXG4gICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgdXJsID0gKHNtVVJMICYmIHNtVVJMLmxhc3RJbmRleE9mKCcvJykgIT09IC0gMSA/IHNtVVJMLnN1YnN0cigwLCBzbVVSTC5sYXN0SW5kZXhPZignLycpICsgMSkgOiAnLi8nKSArIHNtMi5tb3ZpZVVSTDtcclxuXHJcbiAgICBpZiAoc20yLm5vU1dGQ2FjaGUpIHtcclxuICAgICAgdXJsICs9ICgnP3RzPScgKyBuZXcgRGF0ZSgpLmdldFRpbWUoKSk7XHJcbiAgICB9XHJcblxyXG4gICAgcmV0dXJuIHVybDtcclxuXHJcbiAgfTtcclxuXHJcbiAgc2V0VmVyc2lvbkluZm8gPSBmdW5jdGlvbigpIHtcclxuXHJcbiAgICAvLyBzaG9ydC1oYW5kIGZvciBpbnRlcm5hbCB1c2VcclxuXHJcbiAgICBmViA9IHBhcnNlSW50KHNtMi5mbGFzaFZlcnNpb24sIDEwKTtcclxuXHJcbiAgICBpZiAoZlYgIT09IDggJiYgZlYgIT09IDkpIHtcclxuICAgICAgc20yLl93RChzdHIoJ2JhZEZWJywgZlYsIGRlZmF1bHRGbGFzaFZlcnNpb24pKTtcclxuICAgICAgc20yLmZsYXNoVmVyc2lvbiA9IGZWID0gZGVmYXVsdEZsYXNoVmVyc2lvbjtcclxuICAgIH1cclxuXHJcbiAgICAvLyBkZWJ1ZyBmbGFzaCBtb3ZpZSwgaWYgYXBwbGljYWJsZVxyXG5cclxuICAgIHZhciBpc0RlYnVnID0gKHNtMi5kZWJ1Z01vZGUgfHwgc20yLmRlYnVnRmxhc2g/J19kZWJ1Zy5zd2YnOicuc3dmJyk7XHJcblxyXG4gICAgaWYgKHNtMi51c2VIVE1MNUF1ZGlvICYmICFzbTIuaHRtbDVPbmx5ICYmIHNtMi5hdWRpb0Zvcm1hdHMubXA0LnJlcXVpcmVkICYmIGZWIDwgOSkge1xyXG4gICAgICBzbTIuX3dEKHN0cignbmVlZGZsOScpKTtcclxuICAgICAgc20yLmZsYXNoVmVyc2lvbiA9IGZWID0gOTtcclxuICAgIH1cclxuXHJcbiAgICBzbTIudmVyc2lvbiA9IHNtMi52ZXJzaW9uTnVtYmVyICsgKHNtMi5odG1sNU9ubHk/JyAoSFRNTDUtb25seSBtb2RlKSc6KGZWID09PSA5PycgKEFTMy9GbGFzaCA5KSc6JyAoQVMyL0ZsYXNoIDgpJykpO1xyXG5cclxuICAgIC8vIHNldCB1cCBkZWZhdWx0IG9wdGlvbnNcclxuICAgIGlmIChmViA+IDgpIHtcclxuICAgICAgLy8gK2ZsYXNoIDkgYmFzZSBvcHRpb25zXHJcbiAgICAgIHNtMi5kZWZhdWx0T3B0aW9ucyA9IG1peGluKHNtMi5kZWZhdWx0T3B0aW9ucywgc20yLmZsYXNoOU9wdGlvbnMpO1xyXG4gICAgICBzbTIuZmVhdHVyZXMuYnVmZmVyaW5nID0gdHJ1ZTtcclxuICAgICAgLy8gK21vdmllc3RhciBzdXBwb3J0XHJcbiAgICAgIHNtMi5kZWZhdWx0T3B0aW9ucyA9IG1peGluKHNtMi5kZWZhdWx0T3B0aW9ucywgc20yLm1vdmllU3Rhck9wdGlvbnMpO1xyXG4gICAgICBzbTIuZmlsZVBhdHRlcm5zLmZsYXNoOSA9IG5ldyBSZWdFeHAoJ1xcXFwuKG1wM3wnICsgbmV0U3RyZWFtVHlwZXMuam9pbignfCcpICsgJykoXFxcXD8uKik/JCcsICdpJyk7XHJcbiAgICAgIHNtMi5mZWF0dXJlcy5tb3ZpZVN0YXIgPSB0cnVlO1xyXG4gICAgfSBlbHNlIHtcclxuICAgICAgc20yLmZlYXR1cmVzLm1vdmllU3RhciA9IGZhbHNlO1xyXG4gICAgfVxyXG5cclxuICAgIC8vIHJlZ0V4cCBmb3IgZmxhc2ggY2FuUGxheSgpLCBldGMuXHJcbiAgICBzbTIuZmlsZVBhdHRlcm4gPSBzbTIuZmlsZVBhdHRlcm5zWyhmViAhPT0gOD8nZmxhc2g5JzonZmxhc2g4JyldO1xyXG5cclxuICAgIC8vIGlmIGFwcGxpY2FibGUsIHVzZSBfZGVidWcgdmVyc2lvbnMgb2YgU1dGc1xyXG4gICAgc20yLm1vdmllVVJMID0gKGZWID09PSA4Pydzb3VuZG1hbmFnZXIyLnN3Zic6J3NvdW5kbWFuYWdlcjJfZmxhc2g5LnN3ZicpLnJlcGxhY2UoJy5zd2YnLCBpc0RlYnVnKTtcclxuXHJcbiAgICBzbTIuZmVhdHVyZXMucGVha0RhdGEgPSBzbTIuZmVhdHVyZXMud2F2ZWZvcm1EYXRhID0gc20yLmZlYXR1cmVzLmVxRGF0YSA9IChmViA+IDgpO1xyXG5cclxuICB9O1xyXG5cclxuICBzZXRQb2xsaW5nID0gZnVuY3Rpb24oYlBvbGxpbmcsIGJIaWdoUGVyZm9ybWFuY2UpIHtcclxuXHJcbiAgICBpZiAoIWZsYXNoKSB7XHJcbiAgICAgIHJldHVybiBmYWxzZTtcclxuICAgIH1cclxuXHJcbiAgICBmbGFzaC5fc2V0UG9sbGluZyhiUG9sbGluZywgYkhpZ2hQZXJmb3JtYW5jZSk7XHJcblxyXG4gIH07XHJcblxyXG4gIGluaXREZWJ1ZyA9IGZ1bmN0aW9uKCkge1xyXG5cclxuICAgIC8vIHN0YXJ0cyBkZWJ1ZyBtb2RlLCBjcmVhdGluZyBvdXRwdXQgPGRpdj4gZm9yIFVBcyB3aXRob3V0IGNvbnNvbGUgb2JqZWN0XHJcblxyXG4gICAgLy8gYWxsb3cgZm9yY2Ugb2YgZGVidWcgbW9kZSB2aWEgVVJMXHJcbiAgICAvLyA8ZD5cclxuICAgIGlmIChzbTIuZGVidWdVUkxQYXJhbS50ZXN0KHdsKSkge1xyXG4gICAgICBzbTIuZGVidWdNb2RlID0gdHJ1ZTtcclxuICAgIH1cclxuXHJcbiAgICBpZiAoaWQoc20yLmRlYnVnSUQpKSB7XHJcbiAgICAgIHJldHVybiBmYWxzZTtcclxuICAgIH1cclxuXHJcbiAgICB2YXIgb0QsIG9EZWJ1Zywgb1RhcmdldCwgb1RvZ2dsZSwgdG1wO1xyXG5cclxuICAgIGlmIChzbTIuZGVidWdNb2RlICYmICFpZChzbTIuZGVidWdJRCkgJiYgKCFoYXNDb25zb2xlIHx8ICFzbTIudXNlQ29uc29sZSB8fCAhc20yLmNvbnNvbGVPbmx5KSkge1xyXG5cclxuICAgICAgb0QgPSBkb2MuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XHJcbiAgICAgIG9ELmlkID0gc20yLmRlYnVnSUQgKyAnLXRvZ2dsZSc7XHJcblxyXG4gICAgICBvVG9nZ2xlID0ge1xyXG4gICAgICAgICdwb3NpdGlvbic6ICdmaXhlZCcsXHJcbiAgICAgICAgJ2JvdHRvbSc6ICcwcHgnLFxyXG4gICAgICAgICdyaWdodCc6ICcwcHgnLFxyXG4gICAgICAgICd3aWR0aCc6ICcxLjJlbScsXHJcbiAgICAgICAgJ2hlaWdodCc6ICcxLjJlbScsXHJcbiAgICAgICAgJ2xpbmVIZWlnaHQnOiAnMS4yZW0nLFxyXG4gICAgICAgICdtYXJnaW4nOiAnMnB4JyxcclxuICAgICAgICAndGV4dEFsaWduJzogJ2NlbnRlcicsXHJcbiAgICAgICAgJ2JvcmRlcic6ICcxcHggc29saWQgIzk5OScsXHJcbiAgICAgICAgJ2N1cnNvcic6ICdwb2ludGVyJyxcclxuICAgICAgICAnYmFja2dyb3VuZCc6ICcjZmZmJyxcclxuICAgICAgICAnY29sb3InOiAnIzMzMycsXHJcbiAgICAgICAgJ3pJbmRleCc6IDEwMDAxXHJcbiAgICAgIH07XHJcblxyXG4gICAgICBvRC5hcHBlbmRDaGlsZChkb2MuY3JlYXRlVGV4dE5vZGUoJy0nKSk7XHJcbiAgICAgIG9ELm9uY2xpY2sgPSB0b2dnbGVEZWJ1ZztcclxuICAgICAgb0QudGl0bGUgPSAnVG9nZ2xlIFNNMiBkZWJ1ZyBjb25zb2xlJztcclxuXHJcbiAgICAgIGlmICh1YS5tYXRjaCgvbXNpZSA2L2kpKSB7XHJcbiAgICAgICAgb0Quc3R5bGUucG9zaXRpb24gPSAnYWJzb2x1dGUnO1xyXG4gICAgICAgIG9ELnN0eWxlLmN1cnNvciA9ICdoYW5kJztcclxuICAgICAgfVxyXG5cclxuICAgICAgZm9yICh0bXAgaW4gb1RvZ2dsZSkge1xyXG4gICAgICAgIGlmIChvVG9nZ2xlLmhhc093blByb3BlcnR5KHRtcCkpIHtcclxuICAgICAgICAgIG9ELnN0eWxlW3RtcF0gPSBvVG9nZ2xlW3RtcF07XHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcblxyXG4gICAgICBvRGVidWcgPSBkb2MuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XHJcbiAgICAgIG9EZWJ1Zy5pZCA9IHNtMi5kZWJ1Z0lEO1xyXG4gICAgICBvRGVidWcuc3R5bGUuZGlzcGxheSA9IChzbTIuZGVidWdNb2RlPydibG9jayc6J25vbmUnKTtcclxuXHJcbiAgICAgIGlmIChzbTIuZGVidWdNb2RlICYmICFpZChvRC5pZCkpIHtcclxuICAgICAgICB0cnkge1xyXG4gICAgICAgICAgb1RhcmdldCA9IGdldERvY3VtZW50KCk7XHJcbiAgICAgICAgICBvVGFyZ2V0LmFwcGVuZENoaWxkKG9EKTtcclxuICAgICAgICB9IGNhdGNoKGUyKSB7XHJcbiAgICAgICAgICB0aHJvdyBuZXcgRXJyb3Ioc3RyKCdkb21FcnJvcicpKycgXFxuJytlMi50b1N0cmluZygpKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgb1RhcmdldC5hcHBlbmRDaGlsZChvRGVidWcpO1xyXG4gICAgICB9XHJcblxyXG4gICAgfVxyXG5cclxuICAgIG9UYXJnZXQgPSBudWxsO1xyXG4gICAgLy8gPC9kPlxyXG5cclxuICB9O1xyXG5cclxuICBpZENoZWNrID0gdGhpcy5nZXRTb3VuZEJ5SWQ7XHJcblxyXG4gIC8vIDxkPlxyXG4gIF93RFMgPSBmdW5jdGlvbihvLCBlcnJvckxldmVsKSB7XHJcblxyXG4gICAgcmV0dXJuICghbyA/ICcnIDogc20yLl93RChzdHIobyksIGVycm9yTGV2ZWwpKTtcclxuXHJcbiAgfTtcclxuXHJcbiAgdG9nZ2xlRGVidWcgPSBmdW5jdGlvbigpIHtcclxuXHJcbiAgICB2YXIgbyA9IGlkKHNtMi5kZWJ1Z0lEKSxcclxuICAgIG9UID0gaWQoc20yLmRlYnVnSUQgKyAnLXRvZ2dsZScpO1xyXG5cclxuICAgIGlmICghbykge1xyXG4gICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICB9XHJcblxyXG4gICAgaWYgKGRlYnVnT3Blbikge1xyXG4gICAgICAvLyBtaW5pbWl6ZVxyXG4gICAgICBvVC5pbm5lckhUTUwgPSAnKyc7XHJcbiAgICAgIG8uc3R5bGUuZGlzcGxheSA9ICdub25lJztcclxuICAgIH0gZWxzZSB7XHJcbiAgICAgIG9ULmlubmVySFRNTCA9ICctJztcclxuICAgICAgby5zdHlsZS5kaXNwbGF5ID0gJ2Jsb2NrJztcclxuICAgIH1cclxuXHJcbiAgICBkZWJ1Z09wZW4gPSAhZGVidWdPcGVuO1xyXG5cclxuICB9O1xyXG5cclxuICBkZWJ1Z1RTID0gZnVuY3Rpb24oc0V2ZW50VHlwZSwgYlN1Y2Nlc3MsIHNNZXNzYWdlKSB7XHJcblxyXG4gICAgLy8gdHJvdWJsZXNob290ZXIgZGVidWcgaG9va3NcclxuXHJcbiAgICBpZiAod2luZG93LnNtMkRlYnVnZ2VyICE9PSBfdW5kZWZpbmVkKSB7XHJcbiAgICAgIHRyeSB7XHJcbiAgICAgICAgc20yRGVidWdnZXIuaGFuZGxlRXZlbnQoc0V2ZW50VHlwZSwgYlN1Y2Nlc3MsIHNNZXNzYWdlKTtcclxuICAgICAgfSBjYXRjaChlKSB7XHJcbiAgICAgICAgLy8gb2ggd2VsbFxyXG4gICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIHJldHVybiB0cnVlO1xyXG5cclxuICB9O1xyXG4gIC8vIDwvZD5cclxuXHJcbiAgZ2V0U1dGQ1NTID0gZnVuY3Rpb24oKSB7XHJcblxyXG4gICAgdmFyIGNzcyA9IFtdO1xyXG5cclxuICAgIGlmIChzbTIuZGVidWdNb2RlKSB7XHJcbiAgICAgIGNzcy5wdXNoKHN3ZkNTUy5zbTJEZWJ1Zyk7XHJcbiAgICB9XHJcblxyXG4gICAgaWYgKHNtMi5kZWJ1Z0ZsYXNoKSB7XHJcbiAgICAgIGNzcy5wdXNoKHN3ZkNTUy5mbGFzaERlYnVnKTtcclxuICAgIH1cclxuXHJcbiAgICBpZiAoc20yLnVzZUhpZ2hQZXJmb3JtYW5jZSkge1xyXG4gICAgICBjc3MucHVzaChzd2ZDU1MuaGlnaFBlcmYpO1xyXG4gICAgfVxyXG5cclxuICAgIHJldHVybiBjc3Muam9pbignICcpO1xyXG5cclxuICB9O1xyXG5cclxuICBmbGFzaEJsb2NrSGFuZGxlciA9IGZ1bmN0aW9uKCkge1xyXG5cclxuICAgIC8vICpwb3NzaWJsZSogZmxhc2ggYmxvY2sgc2l0dWF0aW9uLlxyXG5cclxuICAgIHZhciBuYW1lID0gc3RyKCdmYkhhbmRsZXInKSxcclxuICAgICAgICBwID0gc20yLmdldE1vdmllUGVyY2VudCgpLFxyXG4gICAgICAgIGNzcyA9IHN3ZkNTUyxcclxuICAgICAgICBlcnJvciA9IHt0eXBlOidGTEFTSEJMT0NLJ307XHJcblxyXG4gICAgaWYgKHNtMi5odG1sNU9ubHkpIHtcclxuICAgICAgLy8gbm8gZmxhc2gsIG9yIHVudXNlZFxyXG4gICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICB9XHJcblxyXG4gICAgaWYgKCFzbTIub2soKSkge1xyXG5cclxuICAgICAgaWYgKG5lZWRzRmxhc2gpIHtcclxuICAgICAgICAvLyBtYWtlIHRoZSBtb3ZpZSBtb3JlIHZpc2libGUsIHNvIHVzZXIgY2FuIGZpeFxyXG4gICAgICAgIHNtMi5vTUMuY2xhc3NOYW1lID0gZ2V0U1dGQ1NTKCkgKyAnICcgKyBjc3Muc3dmRGVmYXVsdCArICcgJyArIChwID09PSBudWxsP2Nzcy5zd2ZUaW1lZG91dDpjc3Muc3dmRXJyb3IpO1xyXG4gICAgICAgIHNtMi5fd0QobmFtZSArICc6ICcgKyBzdHIoJ2ZiVGltZW91dCcpICsgKHAgPyAnICgnICsgc3RyKCdmYkxvYWRlZCcpICsgJyknIDogJycpKTtcclxuICAgICAgfVxyXG5cclxuICAgICAgc20yLmRpZEZsYXNoQmxvY2sgPSB0cnVlO1xyXG5cclxuICAgICAgLy8gZmlyZSBvbnJlYWR5KCksIGNvbXBsYWluIGxpZ2h0bHlcclxuICAgICAgcHJvY2Vzc09uRXZlbnRzKHt0eXBlOidvbnRpbWVvdXQnLCBpZ25vcmVJbml0OnRydWUsIGVycm9yOmVycm9yfSk7XHJcbiAgICAgIGNhdGNoRXJyb3IoZXJyb3IpO1xyXG5cclxuICAgIH0gZWxzZSB7XHJcblxyXG4gICAgICAvLyBTTTIgbG9hZGVkIE9LIChvciByZWNvdmVyZWQpXHJcblxyXG4gICAgICAvLyA8ZD5cclxuICAgICAgaWYgKHNtMi5kaWRGbGFzaEJsb2NrKSB7XHJcbiAgICAgICAgc20yLl93RChuYW1lICsgJzogVW5ibG9ja2VkJyk7XHJcbiAgICAgIH1cclxuICAgICAgLy8gPC9kPlxyXG5cclxuICAgICAgaWYgKHNtMi5vTUMpIHtcclxuICAgICAgICBzbTIub01DLmNsYXNzTmFtZSA9IFtnZXRTV0ZDU1MoKSwgY3NzLnN3ZkRlZmF1bHQsIGNzcy5zd2ZMb2FkZWQgKyAoc20yLmRpZEZsYXNoQmxvY2s/JyAnK2Nzcy5zd2ZVbmJsb2NrZWQ6JycpXS5qb2luKCcgJyk7XHJcbiAgICAgIH1cclxuXHJcbiAgICB9XHJcblxyXG4gIH07XHJcblxyXG4gIGFkZE9uRXZlbnQgPSBmdW5jdGlvbihzVHlwZSwgb01ldGhvZCwgb1Njb3BlKSB7XHJcblxyXG4gICAgaWYgKG9uX3F1ZXVlW3NUeXBlXSA9PT0gX3VuZGVmaW5lZCkge1xyXG4gICAgICBvbl9xdWV1ZVtzVHlwZV0gPSBbXTtcclxuICAgIH1cclxuXHJcbiAgICBvbl9xdWV1ZVtzVHlwZV0ucHVzaCh7XHJcbiAgICAgICdtZXRob2QnOiBvTWV0aG9kLFxyXG4gICAgICAnc2NvcGUnOiAob1Njb3BlIHx8IG51bGwpLFxyXG4gICAgICAnZmlyZWQnOiBmYWxzZVxyXG4gICAgfSk7XHJcblxyXG4gIH07XHJcblxyXG4gIHByb2Nlc3NPbkV2ZW50cyA9IGZ1bmN0aW9uKG9PcHRpb25zKSB7XHJcblxyXG4gICAgLy8gaWYgdW5zcGVjaWZpZWQsIGFzc3VtZSBPSy9lcnJvclxyXG5cclxuICAgIGlmICghb09wdGlvbnMpIHtcclxuICAgICAgb09wdGlvbnMgPSB7XHJcbiAgICAgICAgdHlwZTogKHNtMi5vaygpID8gJ29ucmVhZHknIDogJ29udGltZW91dCcpXHJcbiAgICAgIH07XHJcbiAgICB9XHJcblxyXG4gICAgaWYgKCFkaWRJbml0ICYmIG9PcHRpb25zICYmICFvT3B0aW9ucy5pZ25vcmVJbml0KSB7XHJcbiAgICAgIC8vIG5vdCByZWFkeSB5ZXQuXHJcbiAgICAgIHJldHVybiBmYWxzZTtcclxuICAgIH1cclxuXHJcbiAgICBpZiAob09wdGlvbnMudHlwZSA9PT0gJ29udGltZW91dCcgJiYgKHNtMi5vaygpIHx8IChkaXNhYmxlZCAmJiAhb09wdGlvbnMuaWdub3JlSW5pdCkpKSB7XHJcbiAgICAgIC8vIGludmFsaWQgY2FzZVxyXG4gICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICB9XHJcblxyXG4gICAgdmFyIHN0YXR1cyA9IHtcclxuICAgICAgICAgIHN1Y2Nlc3M6IChvT3B0aW9ucyAmJiBvT3B0aW9ucy5pZ25vcmVJbml0P3NtMi5vaygpOiFkaXNhYmxlZClcclxuICAgICAgICB9LFxyXG5cclxuICAgICAgICAvLyBxdWV1ZSBzcGVjaWZpZWQgYnkgdHlwZSwgb3Igbm9uZVxyXG4gICAgICAgIHNyY1F1ZXVlID0gKG9PcHRpb25zICYmIG9PcHRpb25zLnR5cGU/b25fcXVldWVbb09wdGlvbnMudHlwZV18fFtdOltdKSxcclxuXHJcbiAgICAgICAgcXVldWUgPSBbXSwgaSwgaixcclxuICAgICAgICBhcmdzID0gW3N0YXR1c10sXHJcbiAgICAgICAgY2FuUmV0cnkgPSAobmVlZHNGbGFzaCAmJiAhc20yLm9rKCkpO1xyXG5cclxuICAgIGlmIChvT3B0aW9ucy5lcnJvcikge1xyXG4gICAgICBhcmdzWzBdLmVycm9yID0gb09wdGlvbnMuZXJyb3I7XHJcbiAgICB9XHJcblxyXG4gICAgZm9yIChpID0gMCwgaiA9IHNyY1F1ZXVlLmxlbmd0aDsgaSA8IGo7IGkrKykge1xyXG4gICAgICBpZiAoc3JjUXVldWVbaV0uZmlyZWQgIT09IHRydWUpIHtcclxuICAgICAgICBxdWV1ZS5wdXNoKHNyY1F1ZXVlW2ldKTtcclxuICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIGlmIChxdWV1ZS5sZW5ndGgpIHtcclxuICAgICAgLy8gc20yLl93RChzbSArICc6IEZpcmluZyAnICsgcXVldWUubGVuZ3RoICsgJyAnICsgb09wdGlvbnMudHlwZSArICcoKSBpdGVtJyArIChxdWV1ZS5sZW5ndGggPT09IDEgPyAnJyA6ICdzJykpO1xyXG4gICAgICBmb3IgKGkgPSAwLCBqID0gcXVldWUubGVuZ3RoOyBpIDwgajsgaSsrKSB7XHJcbiAgICAgICAgaWYgKHF1ZXVlW2ldLnNjb3BlKSB7XHJcbiAgICAgICAgICBxdWV1ZVtpXS5tZXRob2QuYXBwbHkocXVldWVbaV0uc2NvcGUsIGFyZ3MpO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICBxdWV1ZVtpXS5tZXRob2QuYXBwbHkodGhpcywgYXJncyk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmICghY2FuUmV0cnkpIHtcclxuICAgICAgICAgIC8vIHVzZUZsYXNoQmxvY2sgYW5kIFNXRiB0aW1lb3V0IGNhc2UgZG9lc24ndCBjb3VudCBoZXJlLlxyXG4gICAgICAgICAgcXVldWVbaV0uZmlyZWQgPSB0cnVlO1xyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIHJldHVybiB0cnVlO1xyXG5cclxuICB9O1xyXG5cclxuICBpbml0VXNlck9ubG9hZCA9IGZ1bmN0aW9uKCkge1xyXG5cclxuICAgIHdpbmRvdy5zZXRUaW1lb3V0KGZ1bmN0aW9uKCkge1xyXG5cclxuICAgICAgaWYgKHNtMi51c2VGbGFzaEJsb2NrKSB7XHJcbiAgICAgICAgZmxhc2hCbG9ja0hhbmRsZXIoKTtcclxuICAgICAgfVxyXG5cclxuICAgICAgcHJvY2Vzc09uRXZlbnRzKCk7XHJcblxyXG4gICAgICAvLyBjYWxsIHVzZXItZGVmaW5lZCBcIm9ubG9hZFwiLCBzY29wZWQgdG8gd2luZG93XHJcblxyXG4gICAgICBpZiAodHlwZW9mIHNtMi5vbmxvYWQgPT09ICdmdW5jdGlvbicpIHtcclxuICAgICAgICBfd0RTKCdvbmxvYWQnLCAxKTtcclxuICAgICAgICBzbTIub25sb2FkLmFwcGx5KHdpbmRvdyk7XHJcbiAgICAgICAgX3dEUygnb25sb2FkT0snLCAxKTtcclxuICAgICAgfVxyXG5cclxuICAgICAgaWYgKHNtMi53YWl0Rm9yV2luZG93TG9hZCkge1xyXG4gICAgICAgIGV2ZW50LmFkZCh3aW5kb3csICdsb2FkJywgaW5pdFVzZXJPbmxvYWQpO1xyXG4gICAgICB9XHJcblxyXG4gICAgfSwxKTtcclxuXHJcbiAgfTtcclxuXHJcbiAgZGV0ZWN0Rmxhc2ggPSBmdW5jdGlvbigpIHtcclxuXHJcbiAgICAvLyBoYXQgdGlwOiBGbGFzaCBEZXRlY3QgbGlicmFyeSAoQlNELCAoQykgMjAwNykgYnkgQ2FybCBcIkRvY1llc1wiIFMuIFllc3RyYXUgLSBodHRwOi8vZmVhdHVyZWJsZW5kLmNvbS9qYXZhc2NyaXB0LWZsYXNoLWRldGVjdGlvbi1saWJyYXJ5Lmh0bWwgLyBodHRwOi8vZmVhdHVyZWJsZW5kLmNvbS9saWNlbnNlLnR4dFxyXG5cclxuICAgIGlmIChoYXNGbGFzaCAhPT0gX3VuZGVmaW5lZCkge1xyXG4gICAgICAvLyB0aGlzIHdvcmsgaGFzIGFscmVhZHkgYmVlbiBkb25lLlxyXG4gICAgICByZXR1cm4gaGFzRmxhc2g7XHJcbiAgICB9XHJcblxyXG4gICAgdmFyIGhhc1BsdWdpbiA9IGZhbHNlLCBuID0gbmF2aWdhdG9yLCBuUCA9IG4ucGx1Z2lucywgb2JqLCB0eXBlLCB0eXBlcywgQVggPSB3aW5kb3cuQWN0aXZlWE9iamVjdDtcclxuXHJcbiAgICBpZiAoblAgJiYgblAubGVuZ3RoKSB7XHJcbiAgICAgIHR5cGUgPSAnYXBwbGljYXRpb24veC1zaG9ja3dhdmUtZmxhc2gnO1xyXG4gICAgICB0eXBlcyA9IG4ubWltZVR5cGVzO1xyXG4gICAgICBpZiAodHlwZXMgJiYgdHlwZXNbdHlwZV0gJiYgdHlwZXNbdHlwZV0uZW5hYmxlZFBsdWdpbiAmJiB0eXBlc1t0eXBlXS5lbmFibGVkUGx1Z2luLmRlc2NyaXB0aW9uKSB7XHJcbiAgICAgICAgaGFzUGx1Z2luID0gdHJ1ZTtcclxuICAgICAgfVxyXG4gICAgfSBlbHNlIGlmIChBWCAhPT0gX3VuZGVmaW5lZCAmJiAhdWEubWF0Y2goL01TQXBwSG9zdC9pKSkge1xyXG4gICAgICAvLyBXaW5kb3dzIDggU3RvcmUgQXBwcyAoTVNBcHBIb3N0KSBhcmUgd2VpcmQgKGNvbXBhdGliaWxpdHk/KSBhbmQgd29uJ3QgY29tcGxhaW4gaGVyZSwgYnV0IHdpbGwgYmFyZiBpZiBGbGFzaC9BY3RpdmVYIG9iamVjdCBpcyBhcHBlbmRlZCB0byB0aGUgRE9NLlxyXG4gICAgICB0cnkge1xyXG4gICAgICAgIG9iaiA9IG5ldyBBWCgnU2hvY2t3YXZlRmxhc2guU2hvY2t3YXZlRmxhc2gnKTtcclxuICAgICAgfSBjYXRjaChlKSB7XHJcbiAgICAgICAgLy8gb2ggd2VsbFxyXG4gICAgICAgIG9iaiA9IG51bGw7XHJcbiAgICAgIH1cclxuICAgICAgaGFzUGx1Z2luID0gKCEhb2JqKTtcclxuICAgICAgLy8gY2xlYW51cCwgYmVjYXVzZSBpdCBpcyBBY3RpdmVYIGFmdGVyIGFsbFxyXG4gICAgICBvYmogPSBudWxsO1xyXG4gICAgfVxyXG5cclxuICAgIGhhc0ZsYXNoID0gaGFzUGx1Z2luO1xyXG5cclxuICAgIHJldHVybiBoYXNQbHVnaW47XHJcblxyXG4gIH07XHJcblxyXG5mZWF0dXJlQ2hlY2sgPSBmdW5jdGlvbigpIHtcclxuXHJcbiAgICB2YXIgZmxhc2hOZWVkZWQsXHJcbiAgICAgICAgaXRlbSxcclxuICAgICAgICBmb3JtYXRzID0gc20yLmF1ZGlvRm9ybWF0cyxcclxuICAgICAgICAvLyBpUGhvbmUgPD0gMy4xIGhhcyBicm9rZW4gSFRNTDUgYXVkaW8oKSwgYnV0IGZpcm13YXJlIDMuMiAob3JpZ2luYWwgaVBhZCkgKyBpT1M0IHdvcmtzLlxyXG4gICAgICAgIGlzU3BlY2lhbCA9IChpc19pRGV2aWNlICYmICEhKHVhLm1hdGNoKC9vcyAoMXwyfDNfMHwzXzEpXFxzL2kpKSk7XHJcblxyXG4gICAgaWYgKGlzU3BlY2lhbCkge1xyXG5cclxuICAgICAgLy8gaGFzIEF1ZGlvKCksIGJ1dCBpcyBicm9rZW47IGxldCBpdCBsb2FkIGxpbmtzIGRpcmVjdGx5LlxyXG4gICAgICBzbTIuaGFzSFRNTDUgPSBmYWxzZTtcclxuXHJcbiAgICAgIC8vIGlnbm9yZSBmbGFzaCBjYXNlLCBob3dldmVyXHJcbiAgICAgIHNtMi5odG1sNU9ubHkgPSB0cnVlO1xyXG5cclxuICAgICAgLy8gaGlkZSB0aGUgU1dGLCBpZiBwcmVzZW50XHJcbiAgICAgIGlmIChzbTIub01DKSB7XHJcbiAgICAgICAgc20yLm9NQy5zdHlsZS5kaXNwbGF5ID0gJ25vbmUnO1xyXG4gICAgICB9XHJcblxyXG4gICAgfSBlbHNlIHtcclxuXHJcbiAgICAgIGlmIChzbTIudXNlSFRNTDVBdWRpbykge1xyXG5cclxuICAgICAgICBpZiAoIXNtMi5odG1sNSB8fCAhc20yLmh0bWw1LmNhblBsYXlUeXBlKSB7XHJcbiAgICAgICAgICBzbTIuX3dEKCdTb3VuZE1hbmFnZXI6IE5vIEhUTUw1IEF1ZGlvKCkgc3VwcG9ydCBkZXRlY3RlZC4nKTtcclxuICAgICAgICAgIHNtMi5oYXNIVE1MNSA9IGZhbHNlO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLy8gPGQ+XHJcbiAgICAgICAgaWYgKGlzQmFkU2FmYXJpKSB7XHJcbiAgICAgICAgICBzbTIuX3dEKHNtYyArICdOb3RlOiBCdWdneSBIVE1MNSBBdWRpbyBpbiBTYWZhcmkgb24gdGhpcyBPUyBYIHJlbGVhc2UsIHNlZSBodHRwczovL2J1Z3Mud2Via2l0Lm9yZy9zaG93X2J1Zy5jZ2k/aWQ9MzIxNTkgLSAnICsgKCFoYXNGbGFzaCA/JyB3b3VsZCB1c2UgZmxhc2ggZmFsbGJhY2sgZm9yIE1QMy9NUDQsIGJ1dCBub25lIGRldGVjdGVkLicgOiAnd2lsbCB1c2UgZmxhc2ggZmFsbGJhY2sgZm9yIE1QMy9NUDQsIGlmIGF2YWlsYWJsZScpLCAxKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgLy8gPC9kPlxyXG5cclxuICAgICAgfVxyXG5cclxuICAgIH1cclxuXHJcbiAgICBpZiAoc20yLnVzZUhUTUw1QXVkaW8gJiYgc20yLmhhc0hUTUw1KSB7XHJcblxyXG4gICAgICAvLyBzb3J0IG91dCB3aGV0aGVyIGZsYXNoIGlzIG9wdGlvbmFsLCByZXF1aXJlZCBvciBjYW4gYmUgaWdub3JlZC5cclxuXHJcbiAgICAgIC8vIGlubm9jZW50IHVudGlsIHByb3ZlbiBndWlsdHkuXHJcbiAgICAgIGNhbklnbm9yZUZsYXNoID0gdHJ1ZTtcclxuXHJcbiAgICAgIGZvciAoaXRlbSBpbiBmb3JtYXRzKSB7XHJcbiAgICAgICAgaWYgKGZvcm1hdHMuaGFzT3duUHJvcGVydHkoaXRlbSkpIHtcclxuICAgICAgICAgIGlmIChmb3JtYXRzW2l0ZW1dLnJlcXVpcmVkKSB7XHJcbiAgICAgICAgICAgIGlmICghc20yLmh0bWw1LmNhblBsYXlUeXBlKGZvcm1hdHNbaXRlbV0udHlwZSkpIHtcclxuICAgICAgICAgICAgICAvLyAxMDAlIEhUTUw1IG1vZGUgaXMgbm90IHBvc3NpYmxlLlxyXG4gICAgICAgICAgICAgIGNhbklnbm9yZUZsYXNoID0gZmFsc2U7XHJcbiAgICAgICAgICAgICAgZmxhc2hOZWVkZWQgPSB0cnVlO1xyXG4gICAgICAgICAgICB9IGVsc2UgaWYgKHNtMi5wcmVmZXJGbGFzaCAmJiAoc20yLmZsYXNoW2l0ZW1dIHx8IHNtMi5mbGFzaFtmb3JtYXRzW2l0ZW1dLnR5cGVdKSkge1xyXG4gICAgICAgICAgICAgIC8vIGZsYXNoIG1heSBiZSByZXF1aXJlZCwgb3IgcHJlZmVycmVkIGZvciB0aGlzIGZvcm1hdC5cclxuICAgICAgICAgICAgICBmbGFzaE5lZWRlZCA9IHRydWU7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuXHJcbiAgICB9XHJcblxyXG4gICAgLy8gc2FuaXR5IGNoZWNrLi4uXHJcbiAgICBpZiAoc20yLmlnbm9yZUZsYXNoKSB7XHJcbiAgICAgIGZsYXNoTmVlZGVkID0gZmFsc2U7XHJcbiAgICAgIGNhbklnbm9yZUZsYXNoID0gdHJ1ZTtcclxuICAgIH1cclxuXHJcbiAgICBzbTIuaHRtbDVPbmx5ID0gKHNtMi5oYXNIVE1MNSAmJiBzbTIudXNlSFRNTDVBdWRpbyAmJiAhZmxhc2hOZWVkZWQpO1xyXG5cclxuICAgIHJldHVybiAoIXNtMi5odG1sNU9ubHkpO1xyXG5cclxuICB9O1xyXG5cclxuICBwYXJzZVVSTCA9IGZ1bmN0aW9uKHVybCkge1xyXG5cclxuICAgIC8qKlxyXG4gICAgICogSW50ZXJuYWw6IEZpbmRzIGFuZCByZXR1cm5zIHRoZSBmaXJzdCBwbGF5YWJsZSBVUkwgKG9yIGZhaWxpbmcgdGhhdCwgdGhlIGZpcnN0IFVSTC4pXHJcbiAgICAgKiBAcGFyYW0ge3N0cmluZyBvciBhcnJheX0gdXJsIEEgc2luZ2xlIFVSTCBzdHJpbmcsIE9SLCBhbiBhcnJheSBvZiBVUkwgc3RyaW5ncyBvciB7dXJsOicvcGF0aC90by9yZXNvdXJjZScsIHR5cGU6J2F1ZGlvL21wMyd9IG9iamVjdHMuXHJcbiAgICAgKi9cclxuXHJcbiAgICB2YXIgaSwgaiwgdXJsUmVzdWx0ID0gMCwgcmVzdWx0O1xyXG5cclxuICAgIGlmICh1cmwgaW5zdGFuY2VvZiBBcnJheSkge1xyXG5cclxuICAgICAgLy8gZmluZCB0aGUgZmlyc3QgZ29vZCBvbmVcclxuICAgICAgZm9yIChpPTAsIGo9dXJsLmxlbmd0aDsgaTxqOyBpKyspIHtcclxuXHJcbiAgICAgICAgaWYgKHVybFtpXSBpbnN0YW5jZW9mIE9iamVjdCkge1xyXG4gICAgICAgICAgLy8gTUlNRSBjaGVja1xyXG4gICAgICAgICAgaWYgKHNtMi5jYW5QbGF5TUlNRSh1cmxbaV0udHlwZSkpIHtcclxuICAgICAgICAgICAgdXJsUmVzdWx0ID0gaTtcclxuICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICB9XHJcblxyXG4gICAgICAgIH0gZWxzZSBpZiAoc20yLmNhblBsYXlVUkwodXJsW2ldKSkge1xyXG4gICAgICAgICAgLy8gVVJMIHN0cmluZyBjaGVja1xyXG4gICAgICAgICAgdXJsUmVzdWx0ID0gaTtcclxuICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgIH1cclxuXHJcbiAgICAgIC8vIG5vcm1hbGl6ZSB0byBzdHJpbmdcclxuICAgICAgaWYgKHVybFt1cmxSZXN1bHRdLnVybCkge1xyXG4gICAgICAgIHVybFt1cmxSZXN1bHRdID0gdXJsW3VybFJlc3VsdF0udXJsO1xyXG4gICAgICB9XHJcblxyXG4gICAgICByZXN1bHQgPSB1cmxbdXJsUmVzdWx0XTtcclxuXHJcbiAgICB9IGVsc2Uge1xyXG5cclxuICAgICAgLy8gc2luZ2xlIFVSTCBjYXNlXHJcbiAgICAgIHJlc3VsdCA9IHVybDtcclxuXHJcbiAgICB9XHJcblxyXG4gICAgcmV0dXJuIHJlc3VsdDtcclxuXHJcbiAgfTtcclxuXHJcblxyXG4gIHN0YXJ0VGltZXIgPSBmdW5jdGlvbihvU291bmQpIHtcclxuXHJcbiAgICAvKipcclxuICAgICAqIGF0dGFjaCBhIHRpbWVyIHRvIHRoaXMgc291bmQsIGFuZCBzdGFydCBhbiBpbnRlcnZhbCBpZiBuZWVkZWRcclxuICAgICAqL1xyXG5cclxuICAgIGlmICghb1NvdW5kLl9oYXNUaW1lcikge1xyXG5cclxuICAgICAgb1NvdW5kLl9oYXNUaW1lciA9IHRydWU7XHJcblxyXG4gICAgICBpZiAoIW1vYmlsZUhUTUw1ICYmIHNtMi5odG1sNVBvbGxpbmdJbnRlcnZhbCkge1xyXG5cclxuICAgICAgICBpZiAoaDVJbnRlcnZhbFRpbWVyID09PSBudWxsICYmIGg1VGltZXJDb3VudCA9PT0gMCkge1xyXG5cclxuICAgICAgICAgIGg1SW50ZXJ2YWxUaW1lciA9IHNldEludGVydmFsKHRpbWVyRXhlY3V0ZSwgc20yLmh0bWw1UG9sbGluZ0ludGVydmFsKTtcclxuXHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBoNVRpbWVyQ291bnQrKztcclxuXHJcbiAgICAgIH1cclxuXHJcbiAgICB9XHJcblxyXG4gIH07XHJcblxyXG4gIHN0b3BUaW1lciA9IGZ1bmN0aW9uKG9Tb3VuZCkge1xyXG5cclxuICAgIC8qKlxyXG4gICAgICogZGV0YWNoIGEgdGltZXJcclxuICAgICAqL1xyXG5cclxuICAgIGlmIChvU291bmQuX2hhc1RpbWVyKSB7XHJcblxyXG4gICAgICBvU291bmQuX2hhc1RpbWVyID0gZmFsc2U7XHJcblxyXG4gICAgICBpZiAoIW1vYmlsZUhUTUw1ICYmIHNtMi5odG1sNVBvbGxpbmdJbnRlcnZhbCkge1xyXG5cclxuICAgICAgICAvLyBpbnRlcnZhbCB3aWxsIHN0b3AgaXRzZWxmIGF0IG5leHQgZXhlY3V0aW9uLlxyXG5cclxuICAgICAgICBoNVRpbWVyQ291bnQtLTtcclxuXHJcbiAgICAgIH1cclxuXHJcbiAgICB9XHJcblxyXG4gIH07XHJcblxyXG4gIHRpbWVyRXhlY3V0ZSA9IGZ1bmN0aW9uKCkge1xyXG5cclxuICAgIC8qKlxyXG4gICAgICogbWFudWFsIHBvbGxpbmcgZm9yIEhUTUw1IHByb2dyZXNzIGV2ZW50cywgaWUuLCB3aGlsZXBsYXlpbmcoKSAoY2FuIGFjaGlldmUgZ3JlYXRlciBwcmVjaXNpb24gdGhhbiBjb25zZXJ2YXRpdmUgZGVmYXVsdCBIVE1MNSBpbnRlcnZhbClcclxuICAgICAqL1xyXG5cclxuICAgIHZhciBpO1xyXG5cclxuICAgIGlmIChoNUludGVydmFsVGltZXIgIT09IG51bGwgJiYgIWg1VGltZXJDb3VudCkge1xyXG5cclxuICAgICAgLy8gbm8gYWN0aXZlIHRpbWVycywgc3RvcCBwb2xsaW5nIGludGVydmFsLlxyXG5cclxuICAgICAgY2xlYXJJbnRlcnZhbChoNUludGVydmFsVGltZXIpO1xyXG5cclxuICAgICAgaDVJbnRlcnZhbFRpbWVyID0gbnVsbDtcclxuXHJcbiAgICAgIHJldHVybiBmYWxzZTtcclxuXHJcbiAgICB9XHJcblxyXG4gICAgLy8gY2hlY2sgYWxsIEhUTUw1IHNvdW5kcyB3aXRoIHRpbWVyc1xyXG5cclxuICAgIGZvciAoaSA9IHNtMi5zb3VuZElEcy5sZW5ndGgtMTsgaSA+PSAwOyBpLS0pIHtcclxuXHJcbiAgICAgIGlmIChzbTIuc291bmRzW3NtMi5zb3VuZElEc1tpXV0uaXNIVE1MNSAmJiBzbTIuc291bmRzW3NtMi5zb3VuZElEc1tpXV0uX2hhc1RpbWVyKSB7XHJcblxyXG4gICAgICAgIHNtMi5zb3VuZHNbc20yLnNvdW5kSURzW2ldXS5fb25UaW1lcigpO1xyXG5cclxuICAgICAgfVxyXG5cclxuICAgIH1cclxuXHJcbiAgfTtcclxuXHJcbiAgY2F0Y2hFcnJvciA9IGZ1bmN0aW9uKG9wdGlvbnMpIHtcclxuXHJcbiAgICBvcHRpb25zID0gKG9wdGlvbnMgIT09IF91bmRlZmluZWQgPyBvcHRpb25zIDoge30pO1xyXG5cclxuICAgIGlmICh0eXBlb2Ygc20yLm9uZXJyb3IgPT09ICdmdW5jdGlvbicpIHtcclxuICAgICAgc20yLm9uZXJyb3IuYXBwbHkod2luZG93LCBbe3R5cGU6KG9wdGlvbnMudHlwZSAhPT0gX3VuZGVmaW5lZCA/IG9wdGlvbnMudHlwZSA6IG51bGwpfV0pO1xyXG4gICAgfVxyXG5cclxuICAgIGlmIChvcHRpb25zLmZhdGFsICE9PSBfdW5kZWZpbmVkICYmIG9wdGlvbnMuZmF0YWwpIHtcclxuICAgICAgc20yLmRpc2FibGUoKTtcclxuICAgIH1cclxuXHJcbiAgfTtcclxuXHJcbiAgYmFkU2FmYXJpRml4ID0gZnVuY3Rpb24oKSB7XHJcblxyXG4gICAgLy8gc3BlY2lhbCBjYXNlOiBcImJhZFwiIFNhZmFyaSAoT1MgWCAxMC4zIC0gMTAuNykgbXVzdCBmYWxsIGJhY2sgdG8gZmxhc2ggZm9yIE1QMy9NUDRcclxuICAgIGlmICghaXNCYWRTYWZhcmkgfHwgIWRldGVjdEZsYXNoKCkpIHtcclxuICAgICAgLy8gZG9lc24ndCBhcHBseVxyXG4gICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICB9XHJcblxyXG4gICAgdmFyIGFGID0gc20yLmF1ZGlvRm9ybWF0cywgaSwgaXRlbTtcclxuXHJcbiAgICBmb3IgKGl0ZW0gaW4gYUYpIHtcclxuICAgICAgaWYgKGFGLmhhc093blByb3BlcnR5KGl0ZW0pKSB7XHJcbiAgICAgICAgaWYgKGl0ZW0gPT09ICdtcDMnIHx8IGl0ZW0gPT09ICdtcDQnKSB7XHJcbiAgICAgICAgICBzbTIuX3dEKHNtICsgJzogVXNpbmcgZmxhc2ggZmFsbGJhY2sgZm9yICcgKyBpdGVtICsgJyBmb3JtYXQnKTtcclxuICAgICAgICAgIHNtMi5odG1sNVtpdGVtXSA9IGZhbHNlO1xyXG4gICAgICAgICAgLy8gYXNzaWduIHJlc3VsdCB0byByZWxhdGVkIGZvcm1hdHMsIHRvb1xyXG4gICAgICAgICAgaWYgKGFGW2l0ZW1dICYmIGFGW2l0ZW1dLnJlbGF0ZWQpIHtcclxuICAgICAgICAgICAgZm9yIChpID0gYUZbaXRlbV0ucmVsYXRlZC5sZW5ndGgtMTsgaSA+PSAwOyBpLS0pIHtcclxuICAgICAgICAgICAgICBzbTIuaHRtbDVbYUZbaXRlbV0ucmVsYXRlZFtpXV0gPSBmYWxzZTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG4gICAgfVxyXG5cclxuICB9O1xyXG5cclxuICAvKipcclxuICAgKiBQc2V1ZG8tcHJpdmF0ZSBmbGFzaC9FeHRlcm5hbEludGVyZmFjZSBtZXRob2RzXHJcbiAgICogLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxyXG4gICAqL1xyXG5cclxuICB0aGlzLl9zZXRTYW5kYm94VHlwZSA9IGZ1bmN0aW9uKHNhbmRib3hUeXBlKSB7XHJcblxyXG4gICAgLy8gPGQ+XHJcbiAgICB2YXIgc2IgPSBzbTIuc2FuZGJveDtcclxuXHJcbiAgICBzYi50eXBlID0gc2FuZGJveFR5cGU7XHJcbiAgICBzYi5kZXNjcmlwdGlvbiA9IHNiLnR5cGVzWyhzYi50eXBlc1tzYW5kYm94VHlwZV0gIT09IF91bmRlZmluZWQ/c2FuZGJveFR5cGU6J3Vua25vd24nKV07XHJcblxyXG4gICAgaWYgKHNiLnR5cGUgPT09ICdsb2NhbFdpdGhGaWxlJykge1xyXG5cclxuICAgICAgc2Iubm9SZW1vdGUgPSB0cnVlO1xyXG4gICAgICBzYi5ub0xvY2FsID0gZmFsc2U7XHJcbiAgICAgIF93RFMoJ3NlY05vdGUnLCAyKTtcclxuXHJcbiAgICB9IGVsc2UgaWYgKHNiLnR5cGUgPT09ICdsb2NhbFdpdGhOZXR3b3JrJykge1xyXG5cclxuICAgICAgc2Iubm9SZW1vdGUgPSBmYWxzZTtcclxuICAgICAgc2Iubm9Mb2NhbCA9IHRydWU7XHJcblxyXG4gICAgfSBlbHNlIGlmIChzYi50eXBlID09PSAnbG9jYWxUcnVzdGVkJykge1xyXG5cclxuICAgICAgc2Iubm9SZW1vdGUgPSBmYWxzZTtcclxuICAgICAgc2Iubm9Mb2NhbCA9IGZhbHNlO1xyXG5cclxuICAgIH1cclxuICAgIC8vIDwvZD5cclxuXHJcbiAgfTtcclxuXHJcbiAgdGhpcy5fZXh0ZXJuYWxJbnRlcmZhY2VPSyA9IGZ1bmN0aW9uKHN3ZlZlcnNpb24pIHtcclxuXHJcbiAgICAvLyBmbGFzaCBjYWxsYmFjayBjb25maXJtaW5nIGZsYXNoIGxvYWRlZCwgRUkgd29ya2luZyBldGMuXHJcbiAgICAvLyBzd2ZWZXJzaW9uOiBTV0YgYnVpbGQgc3RyaW5nXHJcblxyXG4gICAgaWYgKHNtMi5zd2ZMb2FkZWQpIHtcclxuICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgfVxyXG5cclxuICAgIHZhciBlO1xyXG5cclxuICAgIGRlYnVnVFMoJ3N3ZicsIHRydWUpO1xyXG4gICAgZGVidWdUUygnZmxhc2h0b2pzJywgdHJ1ZSk7XHJcbiAgICBzbTIuc3dmTG9hZGVkID0gdHJ1ZTtcclxuICAgIHRyeUluaXRPbkZvY3VzID0gZmFsc2U7XHJcblxyXG4gICAgaWYgKGlzQmFkU2FmYXJpKSB7XHJcbiAgICAgIGJhZFNhZmFyaUZpeCgpO1xyXG4gICAgfVxyXG5cclxuICAgIC8vIGNvbXBsYWluIGlmIEpTICsgU1dGIGJ1aWxkL3ZlcnNpb24gc3RyaW5ncyBkb24ndCBtYXRjaCwgZXhjbHVkaW5nICtERVYgYnVpbGRzXHJcbiAgICAvLyA8ZD5cclxuICAgIGlmICghc3dmVmVyc2lvbiB8fCBzd2ZWZXJzaW9uLnJlcGxhY2UoL1xcK2Rldi9pLCcnKSAhPT0gc20yLnZlcnNpb25OdW1iZXIucmVwbGFjZSgvXFwrZGV2L2ksICcnKSkge1xyXG5cclxuICAgICAgZSA9IHNtICsgJzogRmF0YWw6IEphdmFTY3JpcHQgZmlsZSBidWlsZCBcIicgKyBzbTIudmVyc2lvbk51bWJlciArICdcIiBkb2VzIG5vdCBtYXRjaCBGbGFzaCBTV0YgYnVpbGQgXCInICsgc3dmVmVyc2lvbiArICdcIiBhdCAnICsgc20yLnVybCArICcuIEVuc3VyZSBib3RoIGFyZSB1cC10by1kYXRlLic7XHJcblxyXG4gICAgICAvLyBlc2NhcGUgZmxhc2ggLT4gSlMgc3RhY2sgc28gdGhpcyBlcnJvciBmaXJlcyBpbiB3aW5kb3cuXHJcbiAgICAgIHNldFRpbWVvdXQoZnVuY3Rpb24gdmVyc2lvbk1pc21hdGNoKCkge1xyXG4gICAgICAgIHRocm93IG5ldyBFcnJvcihlKTtcclxuICAgICAgfSwgMCk7XHJcblxyXG4gICAgICAvLyBleGl0LCBpbml0IHdpbGwgZmFpbCB3aXRoIHRpbWVvdXRcclxuICAgICAgcmV0dXJuIGZhbHNlO1xyXG5cclxuICAgIH1cclxuICAgIC8vIDwvZD5cclxuXHJcbiAgICAvLyBJRSBuZWVkcyBhIGxhcmdlciB0aW1lb3V0XHJcbiAgICBzZXRUaW1lb3V0KGluaXQsIGlzSUUgPyAxMDAgOiAxKTtcclxuXHJcbiAgfTtcclxuXHJcbiAgLyoqXHJcbiAgICogUHJpdmF0ZSBpbml0aWFsaXphdGlvbiBoZWxwZXJzXHJcbiAgICogLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXHJcbiAgICovXHJcblxyXG4gIGNyZWF0ZU1vdmllID0gZnVuY3Rpb24oc21JRCwgc21VUkwpIHtcclxuXHJcbiAgICBpZiAoZGlkQXBwZW5kICYmIGFwcGVuZFN1Y2Nlc3MpIHtcclxuICAgICAgLy8gaWdub3JlIGlmIGFscmVhZHkgc3VjY2VlZGVkXHJcbiAgICAgIHJldHVybiBmYWxzZTtcclxuICAgIH1cclxuXHJcbiAgICBmdW5jdGlvbiBpbml0TXNnKCkge1xyXG5cclxuICAgICAgLy8gPGQ+XHJcblxyXG4gICAgICB2YXIgb3B0aW9ucyA9IFtdLFxyXG4gICAgICAgICAgdGl0bGUsXHJcbiAgICAgICAgICBtc2cgPSBbXSxcclxuICAgICAgICAgIGRlbGltaXRlciA9ICcgKyAnO1xyXG5cclxuICAgICAgdGl0bGUgPSAnU291bmRNYW5hZ2VyICcgKyBzbTIudmVyc2lvbiArICghc20yLmh0bWw1T25seSAmJiBzbTIudXNlSFRNTDVBdWRpbyA/IChzbTIuaGFzSFRNTDUgPyAnICsgSFRNTDUgYXVkaW8nIDogJywgbm8gSFRNTDUgYXVkaW8gc3VwcG9ydCcpIDogJycpO1xyXG5cclxuICAgICAgaWYgKCFzbTIuaHRtbDVPbmx5KSB7XHJcblxyXG4gICAgICAgIGlmIChzbTIucHJlZmVyRmxhc2gpIHtcclxuICAgICAgICAgIG9wdGlvbnMucHVzaCgncHJlZmVyRmxhc2gnKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGlmIChzbTIudXNlSGlnaFBlcmZvcm1hbmNlKSB7XHJcbiAgICAgICAgICBvcHRpb25zLnB1c2goJ3VzZUhpZ2hQZXJmb3JtYW5jZScpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgaWYgKHNtMi5mbGFzaFBvbGxpbmdJbnRlcnZhbCkge1xyXG4gICAgICAgICAgb3B0aW9ucy5wdXNoKCdmbGFzaFBvbGxpbmdJbnRlcnZhbCAoJyArIHNtMi5mbGFzaFBvbGxpbmdJbnRlcnZhbCArICdtcyknKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGlmIChzbTIuaHRtbDVQb2xsaW5nSW50ZXJ2YWwpIHtcclxuICAgICAgICAgIG9wdGlvbnMucHVzaCgnaHRtbDVQb2xsaW5nSW50ZXJ2YWwgKCcgKyBzbTIuaHRtbDVQb2xsaW5nSW50ZXJ2YWwgKyAnbXMpJyk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBpZiAoc20yLndtb2RlKSB7XHJcbiAgICAgICAgICBvcHRpb25zLnB1c2goJ3dtb2RlICgnICsgc20yLndtb2RlICsgJyknKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGlmIChzbTIuZGVidWdGbGFzaCkge1xyXG4gICAgICAgICAgb3B0aW9ucy5wdXNoKCdkZWJ1Z0ZsYXNoJyk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBpZiAoc20yLnVzZUZsYXNoQmxvY2spIHtcclxuICAgICAgICAgIG9wdGlvbnMucHVzaCgnZmxhc2hCbG9jaycpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgIH0gZWxzZSB7XHJcblxyXG4gICAgICAgIGlmIChzbTIuaHRtbDVQb2xsaW5nSW50ZXJ2YWwpIHtcclxuICAgICAgICAgIG9wdGlvbnMucHVzaCgnaHRtbDVQb2xsaW5nSW50ZXJ2YWwgKCcgKyBzbTIuaHRtbDVQb2xsaW5nSW50ZXJ2YWwgKyAnbXMpJyk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgfVxyXG5cclxuICAgICAgaWYgKG9wdGlvbnMubGVuZ3RoKSB7XHJcbiAgICAgICAgbXNnID0gbXNnLmNvbmNhdChbb3B0aW9ucy5qb2luKGRlbGltaXRlcildKTtcclxuICAgICAgfVxyXG5cclxuICAgICAgc20yLl93RCh0aXRsZSArIChtc2cubGVuZ3RoID8gZGVsaW1pdGVyICsgbXNnLmpvaW4oJywgJykgOiAnJyksIDEpO1xyXG5cclxuICAgICAgc2hvd1N1cHBvcnQoKTtcclxuXHJcbiAgICAgIC8vIDwvZD5cclxuXHJcbiAgICB9XHJcblxyXG4gICAgaWYgKHNtMi5odG1sNU9ubHkpIHtcclxuXHJcbiAgICAgIC8vIDEwMCUgSFRNTDUgbW9kZVxyXG4gICAgICBzZXRWZXJzaW9uSW5mbygpO1xyXG5cclxuICAgICAgaW5pdE1zZygpO1xyXG4gICAgICBzbTIub01DID0gaWQoc20yLm1vdmllSUQpO1xyXG4gICAgICBpbml0KCk7XHJcblxyXG4gICAgICAvLyBwcmV2ZW50IG11bHRpcGxlIGluaXQgYXR0ZW1wdHNcclxuICAgICAgZGlkQXBwZW5kID0gdHJ1ZTtcclxuXHJcbiAgICAgIGFwcGVuZFN1Y2Nlc3MgPSB0cnVlO1xyXG5cclxuICAgICAgcmV0dXJuIGZhbHNlO1xyXG5cclxuICAgIH1cclxuXHJcbiAgICAvLyBmbGFzaCBwYXRoXHJcbiAgICB2YXIgcmVtb3RlVVJMID0gKHNtVVJMIHx8IHNtMi51cmwpLFxyXG4gICAgbG9jYWxVUkwgPSAoc20yLmFsdFVSTCB8fCByZW1vdGVVUkwpLFxyXG4gICAgc3dmVGl0bGUgPSAnSlMvRmxhc2ggYXVkaW8gY29tcG9uZW50IChTb3VuZE1hbmFnZXIgMiknLFxyXG4gICAgb1RhcmdldCA9IGdldERvY3VtZW50KCksXHJcbiAgICBleHRyYUNsYXNzID0gZ2V0U1dGQ1NTKCksXHJcbiAgICBpc1JUTCA9IG51bGwsXHJcbiAgICBodG1sID0gZG9jLmdldEVsZW1lbnRzQnlUYWdOYW1lKCdodG1sJylbMF0sXHJcbiAgICBvRW1iZWQsIG9Nb3ZpZSwgdG1wLCBtb3ZpZUhUTUwsIG9FbCwgcywgeCwgc0NsYXNzO1xyXG5cclxuICAgIGlzUlRMID0gKGh0bWwgJiYgaHRtbC5kaXIgJiYgaHRtbC5kaXIubWF0Y2goL3J0bC9pKSk7XHJcbiAgICBzbUlEID0gKHNtSUQgPT09IF91bmRlZmluZWQ/c20yLmlkOnNtSUQpO1xyXG5cclxuICAgIGZ1bmN0aW9uIHBhcmFtKG5hbWUsIHZhbHVlKSB7XHJcbiAgICAgIHJldHVybiAnPHBhcmFtIG5hbWU9XCInK25hbWUrJ1wiIHZhbHVlPVwiJyt2YWx1ZSsnXCIgLz4nO1xyXG4gICAgfVxyXG5cclxuICAgIC8vIHNhZmV0eSBjaGVjayBmb3IgbGVnYWN5IChjaGFuZ2UgdG8gRmxhc2ggOSBVUkwpXHJcbiAgICBzZXRWZXJzaW9uSW5mbygpO1xyXG4gICAgc20yLnVybCA9IG5vcm1hbGl6ZU1vdmllVVJMKG92ZXJIVFRQP3JlbW90ZVVSTDpsb2NhbFVSTCk7XHJcbiAgICBzbVVSTCA9IHNtMi51cmw7XHJcblxyXG4gICAgc20yLndtb2RlID0gKCFzbTIud21vZGUgJiYgc20yLnVzZUhpZ2hQZXJmb3JtYW5jZSA/ICd0cmFuc3BhcmVudCcgOiBzbTIud21vZGUpO1xyXG5cclxuICAgIGlmIChzbTIud21vZGUgIT09IG51bGwgJiYgKHVhLm1hdGNoKC9tc2llIDgvaSkgfHwgKCFpc0lFICYmICFzbTIudXNlSGlnaFBlcmZvcm1hbmNlKSkgJiYgbmF2aWdhdG9yLnBsYXRmb3JtLm1hdGNoKC93aW4zMnx3aW42NC9pKSkge1xyXG4gICAgICAvKipcclxuICAgICAgICogZXh0cmEtc3BlY2lhbCBjYXNlOiBtb3ZpZSBkb2Vzbid0IGxvYWQgdW50aWwgc2Nyb2xsZWQgaW50byB2aWV3IHdoZW4gdXNpbmcgd21vZGUgPSBhbnl0aGluZyBidXQgJ3dpbmRvdycgaGVyZVxyXG4gICAgICAgKiBkb2VzIG5vdCBhcHBseSB3aGVuIHVzaW5nIGhpZ2ggcGVyZm9ybWFuY2UgKHBvc2l0aW9uOmZpeGVkIG1lYW5zIG9uLXNjcmVlbiksIE9SIGluZmluaXRlIGZsYXNoIGxvYWQgdGltZW91dFxyXG4gICAgICAgKiB3bW9kZSBicmVha3MgSUUgOCBvbiBWaXN0YSArIFdpbjcgdG9vIGluIHNvbWUgY2FzZXMsIGFzIG9mIEphbnVhcnkgMjAxMSAoPylcclxuICAgICAgICovXHJcbiAgICAgIG1lc3NhZ2VzLnB1c2goc3RyaW5ncy5zcGNXbW9kZSk7XHJcbiAgICAgIHNtMi53bW9kZSA9IG51bGw7XHJcbiAgICB9XHJcblxyXG4gICAgb0VtYmVkID0ge1xyXG4gICAgICAnbmFtZSc6IHNtSUQsXHJcbiAgICAgICdpZCc6IHNtSUQsXHJcbiAgICAgICdzcmMnOiBzbVVSTCxcclxuICAgICAgJ3F1YWxpdHknOiAnaGlnaCcsXHJcbiAgICAgICdhbGxvd1NjcmlwdEFjY2Vzcyc6IHNtMi5hbGxvd1NjcmlwdEFjY2VzcyxcclxuICAgICAgJ2JnY29sb3InOiBzbTIuYmdDb2xvcixcclxuICAgICAgJ3BsdWdpbnNwYWdlJzogaHR0cCsnd3d3Lm1hY3JvbWVkaWEuY29tL2dvL2dldGZsYXNocGxheWVyJyxcclxuICAgICAgJ3RpdGxlJzogc3dmVGl0bGUsXHJcbiAgICAgICd0eXBlJzogJ2FwcGxpY2F0aW9uL3gtc2hvY2t3YXZlLWZsYXNoJyxcclxuICAgICAgJ3dtb2RlJzogc20yLndtb2RlLFxyXG4gICAgICAvLyBodHRwOi8vaGVscC5hZG9iZS5jb20vZW5fVVMvYXMzL21vYmlsZS9XUzRiZWJjZDY2YTc0Mjc1YzM2Y2ZiODEzNzEyNDMxOGVlYmM2LTdmZmQuaHRtbFxyXG4gICAgICAnaGFzUHJpb3JpdHknOiAndHJ1ZSdcclxuICAgIH07XHJcblxyXG4gICAgaWYgKHNtMi5kZWJ1Z0ZsYXNoKSB7XHJcbiAgICAgIG9FbWJlZC5GbGFzaFZhcnMgPSAnZGVidWc9MSc7XHJcbiAgICB9XHJcblxyXG4gICAgaWYgKCFzbTIud21vZGUpIHtcclxuICAgICAgLy8gZG9uJ3Qgd3JpdGUgZW1wdHkgYXR0cmlidXRlXHJcbiAgICAgIGRlbGV0ZSBvRW1iZWQud21vZGU7XHJcbiAgICB9XHJcblxyXG4gICAgaWYgKGlzSUUpIHtcclxuXHJcbiAgICAgIC8vIElFIGlzIFwic3BlY2lhbFwiLlxyXG4gICAgICBvTW92aWUgPSBkb2MuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XHJcbiAgICAgIG1vdmllSFRNTCA9IFtcclxuICAgICAgICAnPG9iamVjdCBpZD1cIicgKyBzbUlEICsgJ1wiIGRhdGE9XCInICsgc21VUkwgKyAnXCIgdHlwZT1cIicgKyBvRW1iZWQudHlwZSArICdcIiB0aXRsZT1cIicgKyBvRW1iZWQudGl0bGUgKydcIiBjbGFzc2lkPVwiY2xzaWQ6RDI3Q0RCNkUtQUU2RC0xMWNmLTk2QjgtNDQ0NTUzNTQwMDAwXCIgY29kZWJhc2U9XCInICsgaHR0cCsnZG93bmxvYWQubWFjcm9tZWRpYS5jb20vcHViL3Nob2Nrd2F2ZS9jYWJzL2ZsYXNoL3N3Zmxhc2guY2FiI3ZlcnNpb249NiwwLDQwLDBcIj4nLFxyXG4gICAgICAgIHBhcmFtKCdtb3ZpZScsIHNtVVJMKSxcclxuICAgICAgICBwYXJhbSgnQWxsb3dTY3JpcHRBY2Nlc3MnLCBzbTIuYWxsb3dTY3JpcHRBY2Nlc3MpLFxyXG4gICAgICAgIHBhcmFtKCdxdWFsaXR5Jywgb0VtYmVkLnF1YWxpdHkpLFxyXG4gICAgICAgIChzbTIud21vZGU/IHBhcmFtKCd3bW9kZScsIHNtMi53bW9kZSk6ICcnKSxcclxuICAgICAgICBwYXJhbSgnYmdjb2xvcicsIHNtMi5iZ0NvbG9yKSxcclxuICAgICAgICBwYXJhbSgnaGFzUHJpb3JpdHknLCAndHJ1ZScpLFxyXG4gICAgICAgIChzbTIuZGVidWdGbGFzaCA/IHBhcmFtKCdGbGFzaFZhcnMnLCBvRW1iZWQuRmxhc2hWYXJzKSA6ICcnKSxcclxuICAgICAgICAnPC9vYmplY3Q+J1xyXG4gICAgICBdLmpvaW4oJycpO1xyXG5cclxuICAgIH0gZWxzZSB7XHJcblxyXG4gICAgICBvTW92aWUgPSBkb2MuY3JlYXRlRWxlbWVudCgnZW1iZWQnKTtcclxuICAgICAgZm9yICh0bXAgaW4gb0VtYmVkKSB7XHJcbiAgICAgICAgaWYgKG9FbWJlZC5oYXNPd25Qcm9wZXJ0eSh0bXApKSB7XHJcbiAgICAgICAgICBvTW92aWUuc2V0QXR0cmlidXRlKHRtcCwgb0VtYmVkW3RtcF0pO1xyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG5cclxuICAgIH1cclxuXHJcbiAgICBpbml0RGVidWcoKTtcclxuICAgIGV4dHJhQ2xhc3MgPSBnZXRTV0ZDU1MoKTtcclxuICAgIG9UYXJnZXQgPSBnZXREb2N1bWVudCgpO1xyXG5cclxuICAgIGlmIChvVGFyZ2V0KSB7XHJcblxyXG4gICAgICBzbTIub01DID0gKGlkKHNtMi5tb3ZpZUlEKSB8fCBkb2MuY3JlYXRlRWxlbWVudCgnZGl2JykpO1xyXG5cclxuICAgICAgaWYgKCFzbTIub01DLmlkKSB7XHJcblxyXG4gICAgICAgIHNtMi5vTUMuaWQgPSBzbTIubW92aWVJRDtcclxuICAgICAgICBzbTIub01DLmNsYXNzTmFtZSA9IHN3ZkNTUy5zd2ZEZWZhdWx0ICsgJyAnICsgZXh0cmFDbGFzcztcclxuICAgICAgICBzID0gbnVsbDtcclxuICAgICAgICBvRWwgPSBudWxsO1xyXG5cclxuICAgICAgICBpZiAoIXNtMi51c2VGbGFzaEJsb2NrKSB7XHJcbiAgICAgICAgICBpZiAoc20yLnVzZUhpZ2hQZXJmb3JtYW5jZSkge1xyXG4gICAgICAgICAgICAvLyBvbi1zY3JlZW4gYXQgYWxsIHRpbWVzXHJcbiAgICAgICAgICAgIHMgPSB7XHJcbiAgICAgICAgICAgICAgJ3Bvc2l0aW9uJzogJ2ZpeGVkJyxcclxuICAgICAgICAgICAgICAnd2lkdGgnOiAnOHB4JyxcclxuICAgICAgICAgICAgICAnaGVpZ2h0JzogJzhweCcsXHJcbiAgICAgICAgICAgICAgLy8gPj0gNnB4IGZvciBmbGFzaCB0byBydW4gZmFzdCwgPj0gOHB4IHRvIHN0YXJ0IHVwIHVuZGVyIEZpcmVmb3gvd2luMzIgaW4gc29tZSBjYXNlcy4gb2RkPyB5ZXMuXHJcbiAgICAgICAgICAgICAgJ2JvdHRvbSc6ICcwcHgnLFxyXG4gICAgICAgICAgICAgICdsZWZ0JzogJzBweCcsXHJcbiAgICAgICAgICAgICAgJ292ZXJmbG93JzogJ2hpZGRlbidcclxuICAgICAgICAgICAgfTtcclxuICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIC8vIGhpZGUgb2ZmLXNjcmVlbiwgbG93ZXIgcHJpb3JpdHlcclxuICAgICAgICAgICAgcyA9IHtcclxuICAgICAgICAgICAgICAncG9zaXRpb24nOiAnYWJzb2x1dGUnLFxyXG4gICAgICAgICAgICAgICd3aWR0aCc6ICc2cHgnLFxyXG4gICAgICAgICAgICAgICdoZWlnaHQnOiAnNnB4JyxcclxuICAgICAgICAgICAgICAndG9wJzogJy05OTk5cHgnLFxyXG4gICAgICAgICAgICAgICdsZWZ0JzogJy05OTk5cHgnXHJcbiAgICAgICAgICAgIH07XHJcbiAgICAgICAgICAgIGlmIChpc1JUTCkge1xyXG4gICAgICAgICAgICAgIHMubGVmdCA9IE1hdGguYWJzKHBhcnNlSW50KHMubGVmdCwxMCkpKydweCc7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgIH1cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGlmIChpc1dlYmtpdCkge1xyXG4gICAgICAgICAgLy8gc291bmRjbG91ZC1yZXBvcnRlZCByZW5kZXIvY3Jhc2ggZml4LCBzYWZhcmkgNVxyXG4gICAgICAgICAgc20yLm9NQy5zdHlsZS56SW5kZXggPSAxMDAwMDtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGlmICghc20yLmRlYnVnRmxhc2gpIHtcclxuICAgICAgICAgIGZvciAoeCBpbiBzKSB7XHJcbiAgICAgICAgICAgIGlmIChzLmhhc093blByb3BlcnR5KHgpKSB7XHJcbiAgICAgICAgICAgICAgc20yLm9NQy5zdHlsZVt4XSA9IHNbeF07XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgIH1cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHRyeSB7XHJcbiAgICAgICAgICBpZiAoIWlzSUUpIHtcclxuICAgICAgICAgICAgc20yLm9NQy5hcHBlbmRDaGlsZChvTW92aWUpO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgICAgb1RhcmdldC5hcHBlbmRDaGlsZChzbTIub01DKTtcclxuICAgICAgICAgIGlmIChpc0lFKSB7XHJcbiAgICAgICAgICAgIG9FbCA9IHNtMi5vTUMuYXBwZW5kQ2hpbGQoZG9jLmNyZWF0ZUVsZW1lbnQoJ2RpdicpKTtcclxuICAgICAgICAgICAgb0VsLmNsYXNzTmFtZSA9IHN3ZkNTUy5zd2ZCb3g7XHJcbiAgICAgICAgICAgIG9FbC5pbm5lckhUTUwgPSBtb3ZpZUhUTUw7XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgICBhcHBlbmRTdWNjZXNzID0gdHJ1ZTtcclxuICAgICAgICB9IGNhdGNoKGUpIHtcclxuICAgICAgICAgIHRocm93IG5ldyBFcnJvcihzdHIoJ2RvbUVycm9yJykrJyBcXG4nK2UudG9TdHJpbmcoKSk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgfSBlbHNlIHtcclxuXHJcbiAgICAgICAgLy8gU00yIGNvbnRhaW5lciBpcyBhbHJlYWR5IGluIHRoZSBkb2N1bWVudCAoZWcuIGZsYXNoYmxvY2sgdXNlIGNhc2UpXHJcbiAgICAgICAgc0NsYXNzID0gc20yLm9NQy5jbGFzc05hbWU7XHJcbiAgICAgICAgc20yLm9NQy5jbGFzc05hbWUgPSAoc0NsYXNzP3NDbGFzcysnICc6c3dmQ1NTLnN3ZkRlZmF1bHQpICsgKGV4dHJhQ2xhc3M/JyAnK2V4dHJhQ2xhc3M6JycpO1xyXG4gICAgICAgIHNtMi5vTUMuYXBwZW5kQ2hpbGQob01vdmllKTtcclxuICAgICAgICBpZiAoaXNJRSkge1xyXG4gICAgICAgICAgb0VsID0gc20yLm9NQy5hcHBlbmRDaGlsZChkb2MuY3JlYXRlRWxlbWVudCgnZGl2JykpO1xyXG4gICAgICAgICAgb0VsLmNsYXNzTmFtZSA9IHN3ZkNTUy5zd2ZCb3g7XHJcbiAgICAgICAgICBvRWwuaW5uZXJIVE1MID0gbW92aWVIVE1MO1xyXG4gICAgICAgIH1cclxuICAgICAgICBhcHBlbmRTdWNjZXNzID0gdHJ1ZTtcclxuXHJcbiAgICAgIH1cclxuXHJcbiAgICB9XHJcblxyXG4gICAgZGlkQXBwZW5kID0gdHJ1ZTtcclxuICAgIGluaXRNc2coKTtcclxuICAgIC8vIHNtMi5fd0Qoc20gKyAnOiBUcnlpbmcgdG8gbG9hZCAnICsgc21VUkwgKyAoIW92ZXJIVFRQICYmIHNtMi5hbHRVUkwgPyAnIChhbHRlcm5hdGUgVVJMKScgOiAnJyksIDEpO1xyXG5cclxuICAgIHJldHVybiB0cnVlO1xyXG5cclxuICB9O1xyXG5cclxuICBpbml0TW92aWUgPSBmdW5jdGlvbigpIHtcclxuXHJcbiAgICBpZiAoc20yLmh0bWw1T25seSkge1xyXG4gICAgICBjcmVhdGVNb3ZpZSgpO1xyXG4gICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICB9XHJcblxyXG4gICAgLy8gYXR0ZW1wdCB0byBnZXQsIG9yIGNyZWF0ZSwgbW92aWUgKG1heSBhbHJlYWR5IGV4aXN0KVxyXG4gICAgaWYgKGZsYXNoKSB7XHJcbiAgICAgIHJldHVybiBmYWxzZTtcclxuICAgIH1cclxuXHJcbiAgICBpZiAoIXNtMi51cmwpIHtcclxuXHJcbiAgICAgIC8qKlxyXG4gICAgICAgKiBTb21ldGhpbmcgaXNuJ3QgcmlnaHQgLSB3ZSd2ZSByZWFjaGVkIGluaXQsIGJ1dCB0aGUgc291bmRNYW5hZ2VyIHVybCBwcm9wZXJ0eSBoYXMgbm90IGJlZW4gc2V0LlxyXG4gICAgICAgKiBVc2VyIGhhcyBub3QgY2FsbGVkIHNldHVwKHt1cmw6IC4uLn0pLCBvciBoYXMgbm90IHNldCBzb3VuZE1hbmFnZXIudXJsIChsZWdhY3kgdXNlIGNhc2UpIGRpcmVjdGx5IGJlZm9yZSBpbml0IHRpbWUuXHJcbiAgICAgICAqIE5vdGlmeSBhbmQgZXhpdC4gSWYgdXNlciBjYWxscyBzZXR1cCgpIHdpdGggYSB1cmw6IHByb3BlcnR5LCBpbml0IHdpbGwgYmUgcmVzdGFydGVkIGFzIGluIHRoZSBkZWZlcnJlZCBsb2FkaW5nIGNhc2UuXHJcbiAgICAgICAqL1xyXG5cclxuICAgICAgIF93RFMoJ25vVVJMJyk7XHJcbiAgICAgICByZXR1cm4gZmFsc2U7XHJcblxyXG4gICAgfVxyXG5cclxuICAgIC8vIGlubGluZSBtYXJrdXAgY2FzZVxyXG4gICAgZmxhc2ggPSBzbTIuZ2V0TW92aWUoc20yLmlkKTtcclxuXHJcbiAgICBpZiAoIWZsYXNoKSB7XHJcbiAgICAgIGlmICghb1JlbW92ZWQpIHtcclxuICAgICAgICAvLyB0cnkgdG8gY3JlYXRlXHJcbiAgICAgICAgY3JlYXRlTW92aWUoc20yLmlkLCBzbTIudXJsKTtcclxuICAgICAgfSBlbHNlIHtcclxuICAgICAgICAvLyB0cnkgdG8gcmUtYXBwZW5kIHJlbW92ZWQgbW92aWUgYWZ0ZXIgcmVib290KClcclxuICAgICAgICBpZiAoIWlzSUUpIHtcclxuICAgICAgICAgIHNtMi5vTUMuYXBwZW5kQ2hpbGQob1JlbW92ZWQpO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICBzbTIub01DLmlubmVySFRNTCA9IG9SZW1vdmVkSFRNTDtcclxuICAgICAgICB9XHJcbiAgICAgICAgb1JlbW92ZWQgPSBudWxsO1xyXG4gICAgICAgIGRpZEFwcGVuZCA9IHRydWU7XHJcbiAgICAgIH1cclxuICAgICAgZmxhc2ggPSBzbTIuZ2V0TW92aWUoc20yLmlkKTtcclxuICAgIH1cclxuXHJcbiAgICBpZiAodHlwZW9mIHNtMi5vbmluaXRtb3ZpZSA9PT0gJ2Z1bmN0aW9uJykge1xyXG4gICAgICBzZXRUaW1lb3V0KHNtMi5vbmluaXRtb3ZpZSwgMSk7XHJcbiAgICB9XHJcblxyXG4gICAgLy8gPGQ+XHJcbiAgICBmbHVzaE1lc3NhZ2VzKCk7XHJcbiAgICAvLyA8L2Q+XHJcblxyXG4gICAgcmV0dXJuIHRydWU7XHJcblxyXG4gIH07XHJcblxyXG4gIGRlbGF5V2FpdEZvckVJID0gZnVuY3Rpb24oKSB7XHJcblxyXG4gICAgc2V0VGltZW91dCh3YWl0Rm9yRUksIDEwMDApO1xyXG5cclxuICB9O1xyXG5cclxuICByZWJvb3RJbnRvSFRNTDUgPSBmdW5jdGlvbigpIHtcclxuXHJcbiAgICAvLyBzcGVjaWFsIGNhc2U6IHRyeSBmb3IgYSByZWJvb3Qgd2l0aCBwcmVmZXJGbGFzaDogZmFsc2UsIGlmIDEwMCUgSFRNTDUgbW9kZSBpcyBwb3NzaWJsZSBhbmQgdXNlRmxhc2hCbG9jayBpcyBub3QgZW5hYmxlZC5cclxuXHJcbiAgICB3aW5kb3cuc2V0VGltZW91dChmdW5jdGlvbigpIHtcclxuXHJcbiAgICAgIGNvbXBsYWluKHNtYyArICd1c2VGbGFzaEJsb2NrIGlzIGZhbHNlLCAxMDAlIEhUTUw1IG1vZGUgaXMgcG9zc2libGUuIFJlYm9vdGluZyB3aXRoIHByZWZlckZsYXNoOiBmYWxzZS4uLicpO1xyXG5cclxuICAgICAgc20yLnNldHVwKHtcclxuICAgICAgICBwcmVmZXJGbGFzaDogZmFsc2VcclxuICAgICAgfSkucmVib290KCk7XHJcblxyXG4gICAgICAvLyBpZiBmb3Igc29tZSByZWFzb24geW91IHdhbnQgdG8gZGV0ZWN0IHRoaXMgY2FzZSwgdXNlIGFuIG9udGltZW91dCgpIGNhbGxiYWNrIGFuZCBsb29rIGZvciBodG1sNU9ubHkgYW5kIGRpZEZsYXNoQmxvY2sgPT0gdHJ1ZS5cclxuICAgICAgc20yLmRpZEZsYXNoQmxvY2sgPSB0cnVlO1xyXG5cclxuICAgICAgc20yLmJlZ2luRGVsYXllZEluaXQoKTtcclxuXHJcbiAgICB9LCAxKTtcclxuXHJcbiAgfTtcclxuXHJcbiAgd2FpdEZvckVJID0gZnVuY3Rpb24oKSB7XHJcblxyXG4gICAgdmFyIHAsXHJcbiAgICAgICAgbG9hZEluY29tcGxldGUgPSBmYWxzZTtcclxuXHJcbiAgICBpZiAoIXNtMi51cmwpIHtcclxuICAgICAgLy8gTm8gU1dGIHVybCB0byBsb2FkIChub1VSTCBjYXNlKSAtIGV4aXQgZm9yIG5vdy4gV2lsbCBiZSByZXRyaWVkIHdoZW4gdXJsIGlzIHNldC5cclxuICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgfVxyXG5cclxuICAgIGlmICh3YWl0aW5nRm9yRUkpIHtcclxuICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgfVxyXG5cclxuICAgIHdhaXRpbmdGb3JFSSA9IHRydWU7XHJcbiAgICBldmVudC5yZW1vdmUod2luZG93LCAnbG9hZCcsIGRlbGF5V2FpdEZvckVJKTtcclxuXHJcbiAgICBpZiAoaGFzRmxhc2ggJiYgdHJ5SW5pdE9uRm9jdXMgJiYgIWlzRm9jdXNlZCkge1xyXG4gICAgICAvLyBTYWZhcmkgd29uJ3QgbG9hZCBmbGFzaCBpbiBiYWNrZ3JvdW5kIHRhYnMsIG9ubHkgd2hlbiBmb2N1c2VkLlxyXG4gICAgICBfd0RTKCd3YWl0Rm9jdXMnKTtcclxuICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgfVxyXG5cclxuICAgIGlmICghZGlkSW5pdCkge1xyXG4gICAgICBwID0gc20yLmdldE1vdmllUGVyY2VudCgpO1xyXG4gICAgICBpZiAocCA+IDAgJiYgcCA8IDEwMCkge1xyXG4gICAgICAgIGxvYWRJbmNvbXBsZXRlID0gdHJ1ZTtcclxuICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIHNldFRpbWVvdXQoZnVuY3Rpb24oKSB7XHJcblxyXG4gICAgICBwID0gc20yLmdldE1vdmllUGVyY2VudCgpO1xyXG5cclxuICAgICAgaWYgKGxvYWRJbmNvbXBsZXRlKSB7XHJcbiAgICAgICAgLy8gc3BlY2lhbCBjYXNlOiBpZiBtb3ZpZSAqcGFydGlhbGx5KiBsb2FkZWQsIHJldHJ5IHVudGlsIGl0J3MgMTAwJSBiZWZvcmUgYXNzdW1pbmcgZmFpbHVyZS5cclxuICAgICAgICB3YWl0aW5nRm9yRUkgPSBmYWxzZTtcclxuICAgICAgICBzbTIuX3dEKHN0cignd2FpdFNXRicpKTtcclxuICAgICAgICB3aW5kb3cuc2V0VGltZW91dChkZWxheVdhaXRGb3JFSSwgMSk7XHJcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgICB9XHJcblxyXG4gICAgICAvLyA8ZD5cclxuICAgICAgaWYgKCFkaWRJbml0KSB7XHJcblxyXG4gICAgICAgIHNtMi5fd0Qoc20gKyAnOiBObyBGbGFzaCByZXNwb25zZSB3aXRoaW4gZXhwZWN0ZWQgdGltZS4gTGlrZWx5IGNhdXNlczogJyArIChwID09PSAwID8gJ1NXRiBsb2FkIGZhaWxlZCwgJzonJykgKyAnRmxhc2ggYmxvY2tlZCBvciBKUy1GbGFzaCBzZWN1cml0eSBlcnJvci4nICsgKHNtMi5kZWJ1Z0ZsYXNoPycgJyArIHN0cignY2hlY2tTV0YnKTonJyksIDIpO1xyXG5cclxuICAgICAgICBpZiAoIW92ZXJIVFRQICYmIHApIHtcclxuXHJcbiAgICAgICAgICBfd0RTKCdsb2NhbEZhaWwnLCAyKTtcclxuXHJcbiAgICAgICAgICBpZiAoIXNtMi5kZWJ1Z0ZsYXNoKSB7XHJcbiAgICAgICAgICAgIF93RFMoJ3RyeURlYnVnJywgMik7XHJcbiAgICAgICAgICB9XHJcblxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgaWYgKHAgPT09IDApIHtcclxuXHJcbiAgICAgICAgICAvLyBpZiAwIChub3QgbnVsbCksIHByb2JhYmx5IGEgNDA0LlxyXG4gICAgICAgICAgc20yLl93RChzdHIoJ3N3ZjQwNCcsIHNtMi51cmwpLCAxKTtcclxuXHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBkZWJ1Z1RTKCdmbGFzaHRvanMnLCBmYWxzZSwgJzogVGltZWQgb3V0JyArIG92ZXJIVFRQPycgKENoZWNrIGZsYXNoIHNlY3VyaXR5IG9yIGZsYXNoIGJsb2NrZXJzKSc6JyAoTm8gcGx1Z2luL21pc3NpbmcgU1dGPyknKTtcclxuXHJcbiAgICAgIH1cclxuICAgICAgLy8gPC9kPlxyXG5cclxuICAgICAgLy8gZ2l2ZSB1cCAvIHRpbWUtb3V0LCBkZXBlbmRpbmdcclxuXHJcbiAgICAgIGlmICghZGlkSW5pdCAmJiBva1RvRGlzYWJsZSkge1xyXG5cclxuICAgICAgICBpZiAocCA9PT0gbnVsbCkge1xyXG5cclxuICAgICAgICAgIC8vIFNXRiBmYWlsZWQgdG8gcmVwb3J0IGxvYWQgcHJvZ3Jlc3MuIFBvc3NpYmx5IGJsb2NrZWQuXHJcblxyXG4gICAgICAgICAgaWYgKHNtMi51c2VGbGFzaEJsb2NrIHx8IHNtMi5mbGFzaExvYWRUaW1lb3V0ID09PSAwKSB7XHJcblxyXG4gICAgICAgICAgICBpZiAoc20yLnVzZUZsYXNoQmxvY2spIHtcclxuXHJcbiAgICAgICAgICAgICAgZmxhc2hCbG9ja0hhbmRsZXIoKTtcclxuXHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIF93RFMoJ3dhaXRGb3JldmVyJyk7XHJcblxyXG4gICAgICAgICAgfSBlbHNlIHtcclxuXHJcbiAgICAgICAgICAgIC8vIG5vIGN1c3RvbSBmbGFzaCBibG9jayBoYW5kbGluZywgYnV0IFNXRiBoYXMgdGltZWQgb3V0LiBXaWxsIHJlY292ZXIgaWYgdXNlciB1bmJsb2NrcyAvIGFsbG93cyBTV0YgbG9hZC5cclxuXHJcbiAgICAgICAgICAgIGlmICghc20yLnVzZUZsYXNoQmxvY2sgJiYgY2FuSWdub3JlRmxhc2gpIHtcclxuXHJcbiAgICAgICAgICAgICAgcmVib290SW50b0hUTUw1KCk7XHJcblxyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG5cclxuICAgICAgICAgICAgICBfd0RTKCd3YWl0Rm9yZXZlcicpO1xyXG5cclxuICAgICAgICAgICAgICAvLyBmaXJlIGFueSByZWd1bGFyIHJlZ2lzdGVyZWQgb250aW1lb3V0KCkgbGlzdGVuZXJzLlxyXG4gICAgICAgICAgICAgIHByb2Nlc3NPbkV2ZW50cyh7dHlwZTonb250aW1lb3V0JywgaWdub3JlSW5pdDogdHJ1ZSwgZXJyb3I6IHt0eXBlOiAnSU5JVF9GTEFTSEJMT0NLJ319KTtcclxuXHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICB9XHJcblxyXG4gICAgICAgIH0gZWxzZSB7XHJcblxyXG4gICAgICAgICAgLy8gU1dGIGxvYWRlZD8gU2hvdWxkbid0IGJlIGEgYmxvY2tpbmcgaXNzdWUsIHRoZW4uXHJcblxyXG4gICAgICAgICAgaWYgKHNtMi5mbGFzaExvYWRUaW1lb3V0ID09PSAwKSB7XHJcblxyXG4gICAgICAgICAgICBfd0RTKCd3YWl0Rm9yZXZlcicpO1xyXG5cclxuICAgICAgICAgIH0gZWxzZSB7XHJcblxyXG4gICAgICAgICAgICBpZiAoIXNtMi51c2VGbGFzaEJsb2NrICYmIGNhbklnbm9yZUZsYXNoKSB7XHJcblxyXG4gICAgICAgICAgICAgIHJlYm9vdEludG9IVE1MNSgpO1xyXG5cclxuICAgICAgICAgICAgfSBlbHNlIHtcclxuXHJcbiAgICAgICAgICAgICAgZmFpbFNhZmVseSh0cnVlKTtcclxuXHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICB9XHJcblxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgIH1cclxuXHJcbiAgICB9LCBzbTIuZmxhc2hMb2FkVGltZW91dCk7XHJcblxyXG4gIH07XHJcblxyXG4gIGhhbmRsZUZvY3VzID0gZnVuY3Rpb24oKSB7XHJcblxyXG4gICAgZnVuY3Rpb24gY2xlYW51cCgpIHtcclxuICAgICAgZXZlbnQucmVtb3ZlKHdpbmRvdywgJ2ZvY3VzJywgaGFuZGxlRm9jdXMpO1xyXG4gICAgfVxyXG5cclxuICAgIGlmIChpc0ZvY3VzZWQgfHwgIXRyeUluaXRPbkZvY3VzKSB7XHJcbiAgICAgIC8vIGFscmVhZHkgZm9jdXNlZCwgb3Igbm90IHNwZWNpYWwgU2FmYXJpIGJhY2tncm91bmQgdGFiIGNhc2VcclxuICAgICAgY2xlYW51cCgpO1xyXG4gICAgICByZXR1cm4gdHJ1ZTtcclxuICAgIH1cclxuXHJcbiAgICBva1RvRGlzYWJsZSA9IHRydWU7XHJcbiAgICBpc0ZvY3VzZWQgPSB0cnVlO1xyXG4gICAgX3dEUygnZ290Rm9jdXMnKTtcclxuXHJcbiAgICAvLyBhbGxvdyBpbml0IHRvIHJlc3RhcnRcclxuICAgIHdhaXRpbmdGb3JFSSA9IGZhbHNlO1xyXG5cclxuICAgIC8vIGtpY2sgb2ZmIEV4dGVybmFsSW50ZXJmYWNlIHRpbWVvdXQsIG5vdyB0aGF0IHRoZSBTV0YgaGFzIHN0YXJ0ZWRcclxuICAgIGRlbGF5V2FpdEZvckVJKCk7XHJcblxyXG4gICAgY2xlYW51cCgpO1xyXG4gICAgcmV0dXJuIHRydWU7XHJcblxyXG4gIH07XHJcblxyXG4gIGZsdXNoTWVzc2FnZXMgPSBmdW5jdGlvbigpIHtcclxuXHJcbiAgICAvLyA8ZD5cclxuXHJcbiAgICAvLyBTTTIgcHJlLWluaXQgZGVidWcgbWVzc2FnZXNcclxuICAgIGlmIChtZXNzYWdlcy5sZW5ndGgpIHtcclxuICAgICAgc20yLl93RCgnU291bmRNYW5hZ2VyIDI6ICcgKyBtZXNzYWdlcy5qb2luKCcgJyksIDEpO1xyXG4gICAgICBtZXNzYWdlcyA9IFtdO1xyXG4gICAgfVxyXG5cclxuICAgIC8vIDwvZD5cclxuXHJcbiAgfTtcclxuXHJcbiAgc2hvd1N1cHBvcnQgPSBmdW5jdGlvbigpIHtcclxuXHJcbiAgICAvLyA8ZD5cclxuXHJcbiAgICBmbHVzaE1lc3NhZ2VzKCk7XHJcblxyXG4gICAgdmFyIGl0ZW0sIHRlc3RzID0gW107XHJcblxyXG4gICAgaWYgKHNtMi51c2VIVE1MNUF1ZGlvICYmIHNtMi5oYXNIVE1MNSkge1xyXG4gICAgICBmb3IgKGl0ZW0gaW4gc20yLmF1ZGlvRm9ybWF0cykge1xyXG4gICAgICAgIGlmIChzbTIuYXVkaW9Gb3JtYXRzLmhhc093blByb3BlcnR5KGl0ZW0pKSB7XHJcbiAgICAgICAgICB0ZXN0cy5wdXNoKGl0ZW0gKyAnID0gJyArIHNtMi5odG1sNVtpdGVtXSArICghc20yLmh0bWw1W2l0ZW1dICYmIG5lZWRzRmxhc2ggJiYgc20yLmZsYXNoW2l0ZW1dID8gJyAodXNpbmcgZmxhc2gpJyA6IChzbTIucHJlZmVyRmxhc2ggJiYgc20yLmZsYXNoW2l0ZW1dICYmIG5lZWRzRmxhc2ggPyAnIChwcmVmZXJyaW5nIGZsYXNoKSc6ICghc20yLmh0bWw1W2l0ZW1dID8gJyAoJyArIChzbTIuYXVkaW9Gb3JtYXRzW2l0ZW1dLnJlcXVpcmVkID8gJ3JlcXVpcmVkLCAnOicnKSArICdhbmQgbm8gZmxhc2ggc3VwcG9ydCknIDogJycpKSkpO1xyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG4gICAgICBzbTIuX3dEKCdTb3VuZE1hbmFnZXIgMiBIVE1MNSBzdXBwb3J0OiAnICsgdGVzdHMuam9pbignLCAnKSwgMSk7XHJcbiAgICB9XHJcblxyXG4gICAgLy8gPC9kPlxyXG5cclxuICB9O1xyXG5cclxuICBpbml0Q29tcGxldGUgPSBmdW5jdGlvbihiTm9EaXNhYmxlKSB7XHJcblxyXG4gICAgaWYgKGRpZEluaXQpIHtcclxuICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgfVxyXG5cclxuICAgIGlmIChzbTIuaHRtbDVPbmx5KSB7XHJcbiAgICAgIC8vIGFsbCBnb29kLlxyXG4gICAgICBfd0RTKCdzbTJMb2FkZWQnLCAxKTtcclxuICAgICAgZGlkSW5pdCA9IHRydWU7XHJcbiAgICAgIGluaXRVc2VyT25sb2FkKCk7XHJcbiAgICAgIGRlYnVnVFMoJ29ubG9hZCcsIHRydWUpO1xyXG4gICAgICByZXR1cm4gdHJ1ZTtcclxuICAgIH1cclxuXHJcbiAgICB2YXIgd2FzVGltZW91dCA9IChzbTIudXNlRmxhc2hCbG9jayAmJiBzbTIuZmxhc2hMb2FkVGltZW91dCAmJiAhc20yLmdldE1vdmllUGVyY2VudCgpKSxcclxuICAgICAgICByZXN1bHQgPSB0cnVlLFxyXG4gICAgICAgIGVycm9yO1xyXG5cclxuICAgIGlmICghd2FzVGltZW91dCkge1xyXG4gICAgICBkaWRJbml0ID0gdHJ1ZTtcclxuICAgIH1cclxuXHJcbiAgICBlcnJvciA9IHt0eXBlOiAoIWhhc0ZsYXNoICYmIG5lZWRzRmxhc2ggPyAnTk9fRkxBU0gnIDogJ0lOSVRfVElNRU9VVCcpfTtcclxuXHJcbiAgICBzbTIuX3dEKCdTb3VuZE1hbmFnZXIgMiAnICsgKGRpc2FibGVkID8gJ2ZhaWxlZCB0byBsb2FkJyA6ICdsb2FkZWQnKSArICcgKCcgKyAoZGlzYWJsZWQgPyAnRmxhc2ggc2VjdXJpdHkvbG9hZCBlcnJvcicgOiAnT0snKSArICcpICcgKyBTdHJpbmcuZnJvbUNoYXJDb2RlKGRpc2FibGVkID8gMTAwMDYgOiAxMDAwMyksIGRpc2FibGVkID8gMjogMSk7XHJcblxyXG4gICAgaWYgKGRpc2FibGVkIHx8IGJOb0Rpc2FibGUpIHtcclxuICAgICAgaWYgKHNtMi51c2VGbGFzaEJsb2NrICYmIHNtMi5vTUMpIHtcclxuICAgICAgICBzbTIub01DLmNsYXNzTmFtZSA9IGdldFNXRkNTUygpICsgJyAnICsgKHNtMi5nZXRNb3ZpZVBlcmNlbnQoKSA9PT0gbnVsbD9zd2ZDU1Muc3dmVGltZWRvdXQ6c3dmQ1NTLnN3ZkVycm9yKTtcclxuICAgICAgfVxyXG4gICAgICBwcm9jZXNzT25FdmVudHMoe3R5cGU6J29udGltZW91dCcsIGVycm9yOmVycm9yLCBpZ25vcmVJbml0OiB0cnVlfSk7XHJcbiAgICAgIGRlYnVnVFMoJ29ubG9hZCcsIGZhbHNlKTtcclxuICAgICAgY2F0Y2hFcnJvcihlcnJvcik7XHJcbiAgICAgIHJlc3VsdCA9IGZhbHNlO1xyXG4gICAgfSBlbHNlIHtcclxuICAgICAgZGVidWdUUygnb25sb2FkJywgdHJ1ZSk7XHJcbiAgICB9XHJcblxyXG4gICAgaWYgKCFkaXNhYmxlZCkge1xyXG4gICAgICBpZiAoc20yLndhaXRGb3JXaW5kb3dMb2FkICYmICF3aW5kb3dMb2FkZWQpIHtcclxuICAgICAgICBfd0RTKCd3YWl0T25sb2FkJyk7XHJcbiAgICAgICAgZXZlbnQuYWRkKHdpbmRvdywgJ2xvYWQnLCBpbml0VXNlck9ubG9hZCk7XHJcbiAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgLy8gPGQ+XHJcbiAgICAgICAgaWYgKHNtMi53YWl0Rm9yV2luZG93TG9hZCAmJiB3aW5kb3dMb2FkZWQpIHtcclxuICAgICAgICAgIF93RFMoJ2RvY0xvYWRlZCcpO1xyXG4gICAgICAgIH1cclxuICAgICAgICAvLyA8L2Q+XHJcbiAgICAgICAgaW5pdFVzZXJPbmxvYWQoKTtcclxuICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIHJldHVybiByZXN1bHQ7XHJcblxyXG4gIH07XHJcblxyXG4gIC8qKlxyXG4gICAqIGFwcGx5IHRvcC1sZXZlbCBzZXR1cE9wdGlvbnMgb2JqZWN0IGFzIGxvY2FsIHByb3BlcnRpZXMsIGVnLiwgdGhpcy5zZXR1cE9wdGlvbnMuZmxhc2hWZXJzaW9uIC0+IHRoaXMuZmxhc2hWZXJzaW9uIChzb3VuZE1hbmFnZXIuZmxhc2hWZXJzaW9uKVxyXG4gICAqIHRoaXMgbWFpbnRhaW5zIGJhY2t3YXJkIGNvbXBhdGliaWxpdHksIGFuZCBhbGxvd3MgcHJvcGVydGllcyB0byBiZSBkZWZpbmVkIHNlcGFyYXRlbHkgZm9yIHVzZSBieSBzb3VuZE1hbmFnZXIuc2V0dXAoKS5cclxuICAgKi9cclxuXHJcbiAgc2V0UHJvcGVydGllcyA9IGZ1bmN0aW9uKCkge1xyXG5cclxuICAgIHZhciBpLFxyXG4gICAgICAgIG8gPSBzbTIuc2V0dXBPcHRpb25zO1xyXG5cclxuICAgIGZvciAoaSBpbiBvKSB7XHJcblxyXG4gICAgICBpZiAoby5oYXNPd25Qcm9wZXJ0eShpKSkge1xyXG5cclxuICAgICAgICAvLyBhc3NpZ24gbG9jYWwgcHJvcGVydHkgaWYgbm90IGFscmVhZHkgZGVmaW5lZFxyXG5cclxuICAgICAgICBpZiAoc20yW2ldID09PSBfdW5kZWZpbmVkKSB7XHJcblxyXG4gICAgICAgICAgc20yW2ldID0gb1tpXTtcclxuXHJcbiAgICAgICAgfSBlbHNlIGlmIChzbTJbaV0gIT09IG9baV0pIHtcclxuXHJcbiAgICAgICAgICAvLyBsZWdhY3kgc3VwcG9ydDogd3JpdGUgbWFudWFsbHktYXNzaWduZWQgcHJvcGVydHkgKGVnLiwgc291bmRNYW5hZ2VyLnVybCkgYmFjayB0byBzZXR1cE9wdGlvbnMgdG8ga2VlcCB0aGluZ3MgaW4gc3luY1xyXG4gICAgICAgICAgc20yLnNldHVwT3B0aW9uc1tpXSA9IHNtMltpXTtcclxuXHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgfVxyXG5cclxuICAgIH1cclxuXHJcbiAgfTtcclxuXHJcblxyXG4gIGluaXQgPSBmdW5jdGlvbigpIHtcclxuXHJcbiAgICAvLyBjYWxsZWQgYWZ0ZXIgb25sb2FkKClcclxuXHJcbiAgICBpZiAoZGlkSW5pdCkge1xyXG4gICAgICBfd0RTKCdkaWRJbml0Jyk7XHJcbiAgICAgIHJldHVybiBmYWxzZTtcclxuICAgIH1cclxuXHJcbiAgICBmdW5jdGlvbiBjbGVhbnVwKCkge1xyXG4gICAgICBldmVudC5yZW1vdmUod2luZG93LCAnbG9hZCcsIHNtMi5iZWdpbkRlbGF5ZWRJbml0KTtcclxuICAgIH1cclxuXHJcbiAgICBpZiAoc20yLmh0bWw1T25seSkge1xyXG4gICAgICBpZiAoIWRpZEluaXQpIHtcclxuICAgICAgICAvLyB3ZSBkb24ndCBuZWVkIG5vIHN0ZWVua2luZyBmbGFzaCFcclxuICAgICAgICBjbGVhbnVwKCk7XHJcbiAgICAgICAgc20yLmVuYWJsZWQgPSB0cnVlO1xyXG4gICAgICAgIGluaXRDb21wbGV0ZSgpO1xyXG4gICAgICB9XHJcbiAgICAgIHJldHVybiB0cnVlO1xyXG4gICAgfVxyXG5cclxuICAgIC8vIGZsYXNoIHBhdGhcclxuICAgIGluaXRNb3ZpZSgpO1xyXG5cclxuICAgIHRyeSB7XHJcblxyXG4gICAgICAvLyBhdHRlbXB0IHRvIHRhbGsgdG8gRmxhc2hcclxuICAgICAgZmxhc2guX2V4dGVybmFsSW50ZXJmYWNlVGVzdChmYWxzZSk7XHJcblxyXG4gICAgICAvLyBhcHBseSB1c2VyLXNwZWNpZmllZCBwb2xsaW5nIGludGVydmFsLCBPUiwgaWYgXCJoaWdoIHBlcmZvcm1hbmNlXCIgc2V0LCBmYXN0ZXIgdnMuIGRlZmF1bHQgcG9sbGluZ1xyXG4gICAgICAvLyAoZGV0ZXJtaW5lcyBmcmVxdWVuY3kgb2Ygd2hpbGVsb2FkaW5nL3doaWxlcGxheWluZyBjYWxsYmFja3MsIGVmZmVjdGl2ZWx5IGRyaXZpbmcgVUkgZnJhbWVyYXRlcylcclxuICAgICAgc2V0UG9sbGluZyh0cnVlLCAoc20yLmZsYXNoUG9sbGluZ0ludGVydmFsIHx8IChzbTIudXNlSGlnaFBlcmZvcm1hbmNlID8gMTAgOiA1MCkpKTtcclxuXHJcbiAgICAgIGlmICghc20yLmRlYnVnTW9kZSkge1xyXG4gICAgICAgIC8vIHN0b3AgdGhlIFNXRiBmcm9tIG1ha2luZyBkZWJ1ZyBvdXRwdXQgY2FsbHMgdG8gSlNcclxuICAgICAgICBmbGFzaC5fZGlzYWJsZURlYnVnKCk7XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIHNtMi5lbmFibGVkID0gdHJ1ZTtcclxuICAgICAgZGVidWdUUygnanN0b2ZsYXNoJywgdHJ1ZSk7XHJcblxyXG4gICAgICBpZiAoIXNtMi5odG1sNU9ubHkpIHtcclxuICAgICAgICAvLyBwcmV2ZW50IGJyb3dzZXIgZnJvbSBzaG93aW5nIGNhY2hlZCBwYWdlIHN0YXRlIChvciByYXRoZXIsIHJlc3RvcmluZyBcInN1c3BlbmRlZFwiIHBhZ2Ugc3RhdGUpIHZpYSBiYWNrIGJ1dHRvbiwgYmVjYXVzZSBmbGFzaCBtYXkgYmUgZGVhZFxyXG4gICAgICAgIC8vIGh0dHA6Ly93d3cud2Via2l0Lm9yZy9ibG9nLzUxNi93ZWJraXQtcGFnZS1jYWNoZS1paS10aGUtdW5sb2FkLWV2ZW50L1xyXG4gICAgICAgIGV2ZW50LmFkZCh3aW5kb3csICd1bmxvYWQnLCBkb05vdGhpbmcpO1xyXG4gICAgICB9XHJcblxyXG4gICAgfSBjYXRjaChlKSB7XHJcblxyXG4gICAgICBzbTIuX3dEKCdqcy9mbGFzaCBleGNlcHRpb246ICcgKyBlLnRvU3RyaW5nKCkpO1xyXG4gICAgICBkZWJ1Z1RTKCdqc3RvZmxhc2gnLCBmYWxzZSk7XHJcbiAgICAgIGNhdGNoRXJyb3Ioe3R5cGU6J0pTX1RPX0ZMQVNIX0VYQ0VQVElPTicsIGZhdGFsOnRydWV9KTtcclxuICAgICAgLy8gZG9uJ3QgZGlzYWJsZSwgZm9yIHJlYm9vdCgpXHJcbiAgICAgIGZhaWxTYWZlbHkodHJ1ZSk7XHJcbiAgICAgIGluaXRDb21wbGV0ZSgpO1xyXG5cclxuICAgICAgcmV0dXJuIGZhbHNlO1xyXG5cclxuICAgIH1cclxuXHJcbiAgICBpbml0Q29tcGxldGUoKTtcclxuXHJcbiAgICAvLyBkaXNjb25uZWN0IGV2ZW50c1xyXG4gICAgY2xlYW51cCgpO1xyXG5cclxuICAgIHJldHVybiB0cnVlO1xyXG5cclxuICB9O1xyXG5cclxuICBkb21Db250ZW50TG9hZGVkID0gZnVuY3Rpb24oKSB7XHJcblxyXG4gICAgaWYgKGRpZERDTG9hZGVkKSB7XHJcbiAgICAgIHJldHVybiBmYWxzZTtcclxuICAgIH1cclxuXHJcbiAgICBkaWREQ0xvYWRlZCA9IHRydWU7XHJcblxyXG4gICAgLy8gYXNzaWduIHRvcC1sZXZlbCBzb3VuZE1hbmFnZXIgcHJvcGVydGllcyBlZy4gc291bmRNYW5hZ2VyLnVybFxyXG4gICAgc2V0UHJvcGVydGllcygpO1xyXG5cclxuICAgIGluaXREZWJ1ZygpO1xyXG5cclxuICAgIC8qKlxyXG4gICAgICogVGVtcG9yYXJ5IGZlYXR1cmU6IGFsbG93IGZvcmNlIG9mIEhUTUw1IHZpYSBVUkwgcGFyYW1zOiBzbTItdXNlaHRtbDVhdWRpbz0wIG9yIDFcclxuICAgICAqIERpdHRvIGZvciBzbTItcHJlZmVyRmxhc2gsIHRvby5cclxuICAgICAqL1xyXG4gICAgLy8gPGQ+XHJcbiAgICAoZnVuY3Rpb24oKXtcclxuXHJcbiAgICAgIHZhciBhID0gJ3NtMi11c2VodG1sNWF1ZGlvPScsXHJcbiAgICAgICAgICBhMiA9ICdzbTItcHJlZmVyZmxhc2g9JyxcclxuICAgICAgICAgIGIgPSBudWxsLFxyXG4gICAgICAgICAgYjIgPSBudWxsLFxyXG4gICAgICAgICAgbCA9IHdsLnRvTG93ZXJDYXNlKCk7XHJcblxyXG4gICAgICBpZiAobC5pbmRleE9mKGEpICE9PSAtMSkge1xyXG4gICAgICAgIGIgPSAobC5jaGFyQXQobC5pbmRleE9mKGEpK2EubGVuZ3RoKSA9PT0gJzEnKTtcclxuICAgICAgICBpZiAoaGFzQ29uc29sZSkge1xyXG4gICAgICAgICAgY29uc29sZS5sb2coKGI/J0VuYWJsaW5nICc6J0Rpc2FibGluZyAnKSsndXNlSFRNTDVBdWRpbyB2aWEgVVJMIHBhcmFtZXRlcicpO1xyXG4gICAgICAgIH1cclxuICAgICAgICBzbTIuc2V0dXAoe1xyXG4gICAgICAgICAgJ3VzZUhUTUw1QXVkaW8nOiBiXHJcbiAgICAgICAgfSk7XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIGlmIChsLmluZGV4T2YoYTIpICE9PSAtMSkge1xyXG4gICAgICAgIGIyID0gKGwuY2hhckF0KGwuaW5kZXhPZihhMikrYTIubGVuZ3RoKSA9PT0gJzEnKTtcclxuICAgICAgICBpZiAoaGFzQ29uc29sZSkge1xyXG4gICAgICAgICAgY29uc29sZS5sb2coKGIyPydFbmFibGluZyAnOidEaXNhYmxpbmcgJykrJ3ByZWZlckZsYXNoIHZpYSBVUkwgcGFyYW1ldGVyJyk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHNtMi5zZXR1cCh7XHJcbiAgICAgICAgICAncHJlZmVyRmxhc2gnOiBiMlxyXG4gICAgICAgIH0pO1xyXG4gICAgICB9XHJcblxyXG4gICAgfSgpKTtcclxuICAgIC8vIDwvZD5cclxuXHJcbiAgICBpZiAoIWhhc0ZsYXNoICYmIHNtMi5oYXNIVE1MNSkge1xyXG4gICAgICBzbTIuX3dEKCdTb3VuZE1hbmFnZXIgMjogTm8gRmxhc2ggZGV0ZWN0ZWQnICsgKCFzbTIudXNlSFRNTDVBdWRpbyA/ICcsIGVuYWJsaW5nIEhUTUw1LicgOiAnLiBUcnlpbmcgSFRNTDUtb25seSBtb2RlLicpLCAxKTtcclxuICAgICAgc20yLnNldHVwKHtcclxuICAgICAgICAndXNlSFRNTDVBdWRpbyc6IHRydWUsXHJcbiAgICAgICAgLy8gbWFrZSBzdXJlIHdlIGFyZW4ndCBwcmVmZXJyaW5nIGZsYXNoLCBlaXRoZXJcclxuICAgICAgICAvLyBUT0RPOiBwcmVmZXJGbGFzaCBzaG91bGQgbm90IG1hdHRlciBpZiBmbGFzaCBpcyBub3QgaW5zdGFsbGVkLiBDdXJyZW50bHksIHN0dWZmIGJyZWFrcyB3aXRob3V0IHRoZSBiZWxvdyB0d2Vhay5cclxuICAgICAgICAncHJlZmVyRmxhc2gnOiBmYWxzZVxyXG4gICAgICB9KTtcclxuICAgIH1cclxuXHJcbiAgICB0ZXN0SFRNTDUoKTtcclxuXHJcbiAgICBpZiAoIWhhc0ZsYXNoICYmIG5lZWRzRmxhc2gpIHtcclxuICAgICAgbWVzc2FnZXMucHVzaChzdHJpbmdzLm5lZWRGbGFzaCk7XHJcbiAgICAgIC8vIFRPRE86IEZhdGFsIGhlcmUgdnMuIHRpbWVvdXQgYXBwcm9hY2gsIGV0Yy5cclxuICAgICAgLy8gaGFjazogZmFpbCBzb29uZXIuXHJcbiAgICAgIHNtMi5zZXR1cCh7XHJcbiAgICAgICAgJ2ZsYXNoTG9hZFRpbWVvdXQnOiAxXHJcbiAgICAgIH0pO1xyXG4gICAgfVxyXG5cclxuICAgIGlmIChkb2MucmVtb3ZlRXZlbnRMaXN0ZW5lcikge1xyXG4gICAgICBkb2MucmVtb3ZlRXZlbnRMaXN0ZW5lcignRE9NQ29udGVudExvYWRlZCcsIGRvbUNvbnRlbnRMb2FkZWQsIGZhbHNlKTtcclxuICAgIH1cclxuXHJcbiAgICBpbml0TW92aWUoKTtcclxuXHJcbiAgICByZXR1cm4gdHJ1ZTtcclxuXHJcbiAgfTtcclxuXHJcbiAgZG9tQ29udGVudExvYWRlZElFID0gZnVuY3Rpb24oKSB7XHJcblxyXG4gICAgaWYgKGRvYy5yZWFkeVN0YXRlID09PSAnY29tcGxldGUnKSB7XHJcbiAgICAgIGRvbUNvbnRlbnRMb2FkZWQoKTtcclxuICAgICAgZG9jLmRldGFjaEV2ZW50KCdvbnJlYWR5c3RhdGVjaGFuZ2UnLCBkb21Db250ZW50TG9hZGVkSUUpO1xyXG4gICAgfVxyXG5cclxuICAgIHJldHVybiB0cnVlO1xyXG5cclxuICB9O1xyXG5cclxuICB3aW5PbkxvYWQgPSBmdW5jdGlvbigpIHtcclxuXHJcbiAgICAvLyBjYXRjaCBlZGdlIGNhc2Ugb2YgaW5pdENvbXBsZXRlKCkgZmlyaW5nIGFmdGVyIHdpbmRvdy5sb2FkKClcclxuICAgIHdpbmRvd0xvYWRlZCA9IHRydWU7XHJcblxyXG4gICAgLy8gY2F0Y2ggY2FzZSB3aGVyZSBET01Db250ZW50TG9hZGVkIGhhcyBiZWVuIHNlbnQsIGJ1dCB3ZSdyZSBzdGlsbCBpbiBkb2MucmVhZHlTdGF0ZSA9ICdpbnRlcmFjdGl2ZSdcclxuICAgIGRvbUNvbnRlbnRMb2FkZWQoKTtcclxuXHJcbiAgICBldmVudC5yZW1vdmUod2luZG93LCAnbG9hZCcsIHdpbk9uTG9hZCk7XHJcblxyXG4gIH07XHJcblxyXG4gIC8qKlxyXG4gICAqIG1pc2NlbGxhbmVvdXMgcnVuLXRpbWUsIHByZS1pbml0IHN0dWZmXHJcbiAgICovXHJcblxyXG4gIHByZUluaXQgPSBmdW5jdGlvbigpIHtcclxuXHJcbiAgICBpZiAobW9iaWxlSFRNTDUpIHtcclxuXHJcbiAgICAgIC8vIHByZWZlciBIVE1MNSBmb3IgbW9iaWxlICsgdGFibGV0LWxpa2UgZGV2aWNlcywgcHJvYmFibHkgbW9yZSByZWxpYWJsZSB2cy4gZmxhc2ggYXQgdGhpcyBwb2ludC5cclxuXHJcbiAgICAgIC8vIDxkPlxyXG4gICAgICBpZiAoIXNtMi5zZXR1cE9wdGlvbnMudXNlSFRNTDVBdWRpbyB8fCBzbTIuc2V0dXBPcHRpb25zLnByZWZlckZsYXNoKSB7XHJcbiAgICAgICAgLy8gbm90aWZ5IHRoYXQgZGVmYXVsdHMgYXJlIGJlaW5nIGNoYW5nZWQuXHJcbiAgICAgICAgbWVzc2FnZXMucHVzaChzdHJpbmdzLm1vYmlsZVVBKTtcclxuICAgICAgfVxyXG4gICAgICAvLyA8L2Q+XHJcblxyXG4gICAgICBzbTIuc2V0dXBPcHRpb25zLnVzZUhUTUw1QXVkaW8gPSB0cnVlO1xyXG4gICAgICBzbTIuc2V0dXBPcHRpb25zLnByZWZlckZsYXNoID0gZmFsc2U7XHJcblxyXG4gICAgICBpZiAoaXNfaURldmljZSB8fCAoaXNBbmRyb2lkICYmICF1YS5tYXRjaCgvYW5kcm9pZFxcczJcXC4zL2kpKSkge1xyXG4gICAgICAgIC8vIGlPUyBhbmQgQW5kcm9pZCBkZXZpY2VzIHRlbmQgdG8gd29yayBiZXR0ZXIgd2l0aCBhIHNpbmdsZSBhdWRpbyBpbnN0YW5jZSwgc3BlY2lmaWNhbGx5IGZvciBjaGFpbmVkIHBsYXliYWNrIG9mIHNvdW5kcyBpbiBzZXF1ZW5jZS5cclxuICAgICAgICAvLyBjb21tb24gdXNlIGNhc2U6IGV4aXRpbmcgc291bmQgb25maW5pc2goKSAtPiBjcmVhdGVTb3VuZCgpIC0+IHBsYXkoKVxyXG4gICAgICAgIC8vIDxkPlxyXG4gICAgICAgIG1lc3NhZ2VzLnB1c2goc3RyaW5ncy5nbG9iYWxIVE1MNSk7XHJcbiAgICAgICAgLy8gPC9kPlxyXG4gICAgICAgIGlmIChpc19pRGV2aWNlKSB7XHJcbiAgICAgICAgICBzbTIuaWdub3JlRmxhc2ggPSB0cnVlO1xyXG4gICAgICAgIH1cclxuICAgICAgICB1c2VHbG9iYWxIVE1MNUF1ZGlvID0gdHJ1ZTtcclxuICAgICAgfVxyXG5cclxuICAgIH1cclxuXHJcbiAgfTtcclxuXHJcbiAgcHJlSW5pdCgpO1xyXG5cclxuICAvLyBzbmlmZiB1cC1mcm9udFxyXG4gIGRldGVjdEZsYXNoKCk7XHJcblxyXG4gIC8vIGZvY3VzIGFuZCB3aW5kb3cgbG9hZCwgaW5pdCAocHJpbWFyaWx5IGZsYXNoLWRyaXZlbilcclxuICBldmVudC5hZGQod2luZG93LCAnZm9jdXMnLCBoYW5kbGVGb2N1cyk7XHJcbiAgZXZlbnQuYWRkKHdpbmRvdywgJ2xvYWQnLCBkZWxheVdhaXRGb3JFSSk7XHJcbiAgZXZlbnQuYWRkKHdpbmRvdywgJ2xvYWQnLCB3aW5PbkxvYWQpO1xyXG5cclxuICBpZiAoZG9jLmFkZEV2ZW50TGlzdGVuZXIpIHtcclxuXHJcbiAgICBkb2MuYWRkRXZlbnRMaXN0ZW5lcignRE9NQ29udGVudExvYWRlZCcsIGRvbUNvbnRlbnRMb2FkZWQsIGZhbHNlKTtcclxuXHJcbiAgfSBlbHNlIGlmIChkb2MuYXR0YWNoRXZlbnQpIHtcclxuXHJcbiAgICBkb2MuYXR0YWNoRXZlbnQoJ29ucmVhZHlzdGF0ZWNoYW5nZScsIGRvbUNvbnRlbnRMb2FkZWRJRSk7XHJcblxyXG4gIH0gZWxzZSB7XHJcblxyXG4gICAgLy8gbm8gYWRkL2F0dGFjaGV2ZW50IHN1cHBvcnQgLSBzYWZlIHRvIGFzc3VtZSBubyBKUyAtPiBGbGFzaCBlaXRoZXJcclxuICAgIGRlYnVnVFMoJ29ubG9hZCcsIGZhbHNlKTtcclxuICAgIGNhdGNoRXJyb3Ioe3R5cGU6J05PX0RPTTJfRVZFTlRTJywgZmF0YWw6dHJ1ZX0pO1xyXG5cclxuICB9XHJcblxyXG59IC8vIFNvdW5kTWFuYWdlcigpXHJcblxyXG4vLyBTTTJfREVGRVIgZGV0YWlsczogaHR0cDovL3d3dy5zY2hpbGxtYW5pYS5jb20vcHJvamVjdHMvc291bmRtYW5hZ2VyMi9kb2MvZ2V0c3RhcnRlZC8jbGF6eS1sb2FkaW5nXHJcblxyXG5pZiAod2luZG93LlNNMl9ERUZFUiA9PT0gdW5kZWZpbmVkIHx8ICFTTTJfREVGRVIpIHtcclxuICBzb3VuZE1hbmFnZXIgPSBuZXcgU291bmRNYW5hZ2VyKCk7XHJcbn1cclxuXHJcbi8qKlxyXG4gKiBTb3VuZE1hbmFnZXIgcHVibGljIGludGVyZmFjZXNcclxuICogLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXHJcbiAqL1xyXG5cclxuaWYgKHR5cGVvZiBtb2R1bGUgPT09ICdvYmplY3QnICYmIG1vZHVsZSAmJiB0eXBlb2YgbW9kdWxlLmV4cG9ydHMgPT09ICdvYmplY3QnKSB7XHJcblxyXG4gIC8qKlxyXG4gICAqIGNvbW1vbkpTIG1vZHVsZVxyXG4gICAqIG5vdGU6IFNNMiByZXF1aXJlcyBhIHdpbmRvdyBnbG9iYWwgZHVlIHRvIEZsYXNoLCB3aGljaCBtYWtlcyBjYWxscyB0byB3aW5kb3cuc291bmRNYW5hZ2VyLlxyXG4gICAqIGZsYXNoIG1heSBub3QgYWx3YXlzIGJlIG5lZWRlZCwgYnV0IHRoaXMgaXMgbm90IGtub3duIHVudGlsIGFzeW5jIGluaXQgYW5kIFNNMiBtYXkgZXZlbiBcInJlYm9vdFwiIGludG8gRmxhc2ggbW9kZS5cclxuICAgKi9cclxuXHJcbiAgd2luZG93LnNvdW5kTWFuYWdlciA9IHNvdW5kTWFuYWdlcjtcclxuXHJcbiAgbW9kdWxlLmV4cG9ydHMuU291bmRNYW5hZ2VyID0gU291bmRNYW5hZ2VyO1xyXG4gIG1vZHVsZS5leHBvcnRzLnNvdW5kTWFuYWdlciA9IHNvdW5kTWFuYWdlcjtcclxuXHJcbn0gZWxzZSBpZiAodHlwZW9mIGRlZmluZSA9PT0gJ2Z1bmN0aW9uJyAmJiBkZWZpbmUuYW1kKSB7XHJcblxyXG4gIC8vIEFNRCAtIHJlcXVpcmVKU1xyXG5cclxuICBkZWZpbmUoJ1NvdW5kTWFuYWdlcicsIFtdLCBmdW5jdGlvbigpIHtcclxuICAgIHJldHVybiB7XHJcbiAgICAgIFNvdW5kTWFuYWdlcjogU291bmRNYW5hZ2VyLFxyXG4gICAgICBzb3VuZE1hbmFnZXI6IHNvdW5kTWFuYWdlclxyXG4gICAgfTtcclxuICB9KTtcclxuXHJcbn0gZWxzZSB7XHJcblxyXG4gIC8vIHN0YW5kYXJkIGJyb3dzZXIgY2FzZVxyXG5cclxuICB3aW5kb3cuU291bmRNYW5hZ2VyID0gU291bmRNYW5hZ2VyOyAvLyBjb25zdHJ1Y3RvclxyXG4gIHdpbmRvdy5zb3VuZE1hbmFnZXIgPSBzb3VuZE1hbmFnZXI7IC8vIHB1YmxpYyBBUEksIGZsYXNoIGNhbGxiYWNrcyBldGMuXHJcblxyXG59XHJcblxyXG59KHdpbmRvdykpO1xyXG4iLCIoZnVuY3Rpb24gKGdsb2JhbCl7XG4vLyEgbW9tZW50LmpzXG4vLyEgdmVyc2lvbiA6IDIuOC4zXG4vLyEgYXV0aG9ycyA6IFRpbSBXb29kLCBJc2tyZW4gQ2hlcm5ldiwgTW9tZW50LmpzIGNvbnRyaWJ1dG9yc1xuLy8hIGxpY2Vuc2UgOiBNSVRcbi8vISBtb21lbnRqcy5jb21cblxuKGZ1bmN0aW9uICh1bmRlZmluZWQpIHtcbiAgICAvKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqXG4gICAgICAgIENvbnN0YW50c1xuICAgICoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKi9cblxuICAgIHZhciBtb21lbnQsXG4gICAgICAgIFZFUlNJT04gPSAnMi44LjMnLFxuICAgICAgICAvLyB0aGUgZ2xvYmFsLXNjb3BlIHRoaXMgaXMgTk9UIHRoZSBnbG9iYWwgb2JqZWN0IGluIE5vZGUuanNcbiAgICAgICAgZ2xvYmFsU2NvcGUgPSB0eXBlb2YgZ2xvYmFsICE9PSAndW5kZWZpbmVkJyA/IGdsb2JhbCA6IHRoaXMsXG4gICAgICAgIG9sZEdsb2JhbE1vbWVudCxcbiAgICAgICAgcm91bmQgPSBNYXRoLnJvdW5kLFxuICAgICAgICBoYXNPd25Qcm9wZXJ0eSA9IE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHksXG4gICAgICAgIGksXG5cbiAgICAgICAgWUVBUiA9IDAsXG4gICAgICAgIE1PTlRIID0gMSxcbiAgICAgICAgREFURSA9IDIsXG4gICAgICAgIEhPVVIgPSAzLFxuICAgICAgICBNSU5VVEUgPSA0LFxuICAgICAgICBTRUNPTkQgPSA1LFxuICAgICAgICBNSUxMSVNFQ09ORCA9IDYsXG5cbiAgICAgICAgLy8gaW50ZXJuYWwgc3RvcmFnZSBmb3IgbG9jYWxlIGNvbmZpZyBmaWxlc1xuICAgICAgICBsb2NhbGVzID0ge30sXG5cbiAgICAgICAgLy8gZXh0cmEgbW9tZW50IGludGVybmFsIHByb3BlcnRpZXMgKHBsdWdpbnMgcmVnaXN0ZXIgcHJvcHMgaGVyZSlcbiAgICAgICAgbW9tZW50UHJvcGVydGllcyA9IFtdLFxuXG4gICAgICAgIC8vIGNoZWNrIGZvciBub2RlSlNcbiAgICAgICAgaGFzTW9kdWxlID0gKHR5cGVvZiBtb2R1bGUgIT09ICd1bmRlZmluZWQnICYmIG1vZHVsZS5leHBvcnRzKSxcblxuICAgICAgICAvLyBBU1AuTkVUIGpzb24gZGF0ZSBmb3JtYXQgcmVnZXhcbiAgICAgICAgYXNwTmV0SnNvblJlZ2V4ID0gL15cXC8/RGF0ZVxcKChcXC0/XFxkKykvaSxcbiAgICAgICAgYXNwTmV0VGltZVNwYW5Kc29uUmVnZXggPSAvKFxcLSk/KD86KFxcZCopXFwuKT8oXFxkKylcXDooXFxkKykoPzpcXDooXFxkKylcXC4/KFxcZHszfSk/KT8vLFxuXG4gICAgICAgIC8vIGZyb20gaHR0cDovL2RvY3MuY2xvc3VyZS1saWJyYXJ5Lmdvb2dsZWNvZGUuY29tL2dpdC9jbG9zdXJlX2dvb2dfZGF0ZV9kYXRlLmpzLnNvdXJjZS5odG1sXG4gICAgICAgIC8vIHNvbWV3aGF0IG1vcmUgaW4gbGluZSB3aXRoIDQuNC4zLjIgMjAwNCBzcGVjLCBidXQgYWxsb3dzIGRlY2ltYWwgYW55d2hlcmVcbiAgICAgICAgaXNvRHVyYXRpb25SZWdleCA9IC9eKC0pP1AoPzooPzooWzAtOSwuXSopWSk/KD86KFswLTksLl0qKU0pPyg/OihbMC05LC5dKilEKT8oPzpUKD86KFswLTksLl0qKUgpPyg/OihbMC05LC5dKilNKT8oPzooWzAtOSwuXSopUyk/KT98KFswLTksLl0qKVcpJC8sXG5cbiAgICAgICAgLy8gZm9ybWF0IHRva2Vuc1xuICAgICAgICBmb3JtYXR0aW5nVG9rZW5zID0gLyhcXFtbXlxcW10qXFxdKXwoXFxcXCk/KE1vfE1NP00/TT98RG98REREb3xERD9EP0Q/fGRkZD9kP3xkbz98d1tvfHddP3xXW298V10/fFF8WVlZWVlZfFlZWVlZfFlZWVl8WVl8Z2coZ2dnPyk/fEdHKEdHRz8pP3xlfEV8YXxBfGhoP3xISD98bW0/fHNzP3xTezEsNH18WHx6ej98Wlo/fC4pL2csXG4gICAgICAgIGxvY2FsRm9ybWF0dGluZ1Rva2VucyA9IC8oXFxbW15cXFtdKlxcXSl8KFxcXFwpPyhMVHxMTD9MP0w/fGx7MSw0fSkvZyxcblxuICAgICAgICAvLyBwYXJzaW5nIHRva2VuIHJlZ2V4ZXNcbiAgICAgICAgcGFyc2VUb2tlbk9uZU9yVHdvRGlnaXRzID0gL1xcZFxcZD8vLCAvLyAwIC0gOTlcbiAgICAgICAgcGFyc2VUb2tlbk9uZVRvVGhyZWVEaWdpdHMgPSAvXFxkezEsM30vLCAvLyAwIC0gOTk5XG4gICAgICAgIHBhcnNlVG9rZW5PbmVUb0ZvdXJEaWdpdHMgPSAvXFxkezEsNH0vLCAvLyAwIC0gOTk5OVxuICAgICAgICBwYXJzZVRva2VuT25lVG9TaXhEaWdpdHMgPSAvWytcXC1dP1xcZHsxLDZ9LywgLy8gLTk5OSw5OTkgLSA5OTksOTk5XG4gICAgICAgIHBhcnNlVG9rZW5EaWdpdHMgPSAvXFxkKy8sIC8vIG5vbnplcm8gbnVtYmVyIG9mIGRpZ2l0c1xuICAgICAgICBwYXJzZVRva2VuV29yZCA9IC9bMC05XSpbJ2EtelxcdTAwQTAtXFx1MDVGRlxcdTA3MDAtXFx1RDdGRlxcdUY5MDAtXFx1RkRDRlxcdUZERjAtXFx1RkZFRl0rfFtcXHUwNjAwLVxcdTA2RkZcXC9dKyhcXHMqP1tcXHUwNjAwLVxcdTA2RkZdKyl7MSwyfS9pLCAvLyBhbnkgd29yZCAob3IgdHdvKSBjaGFyYWN0ZXJzIG9yIG51bWJlcnMgaW5jbHVkaW5nIHR3by90aHJlZSB3b3JkIG1vbnRoIGluIGFyYWJpYy5cbiAgICAgICAgcGFyc2VUb2tlblRpbWV6b25lID0gL1p8W1xcK1xcLV1cXGRcXGQ6P1xcZFxcZC9naSwgLy8gKzAwOjAwIC0wMDowMCArMDAwMCAtMDAwMCBvciBaXG4gICAgICAgIHBhcnNlVG9rZW5UID0gL1QvaSwgLy8gVCAoSVNPIHNlcGFyYXRvcilcbiAgICAgICAgcGFyc2VUb2tlblRpbWVzdGFtcE1zID0gL1tcXCtcXC1dP1xcZCsoXFwuXFxkezEsM30pPy8sIC8vIDEyMzQ1Njc4OSAxMjM0NTY3ODkuMTIzXG4gICAgICAgIHBhcnNlVG9rZW5PcmRpbmFsID0gL1xcZHsxLDJ9LyxcblxuICAgICAgICAvL3N0cmljdCBwYXJzaW5nIHJlZ2V4ZXNcbiAgICAgICAgcGFyc2VUb2tlbk9uZURpZ2l0ID0gL1xcZC8sIC8vIDAgLSA5XG4gICAgICAgIHBhcnNlVG9rZW5Ud29EaWdpdHMgPSAvXFxkXFxkLywgLy8gMDAgLSA5OVxuICAgICAgICBwYXJzZVRva2VuVGhyZWVEaWdpdHMgPSAvXFxkezN9LywgLy8gMDAwIC0gOTk5XG4gICAgICAgIHBhcnNlVG9rZW5Gb3VyRGlnaXRzID0gL1xcZHs0fS8sIC8vIDAwMDAgLSA5OTk5XG4gICAgICAgIHBhcnNlVG9rZW5TaXhEaWdpdHMgPSAvWystXT9cXGR7Nn0vLCAvLyAtOTk5LDk5OSAtIDk5OSw5OTlcbiAgICAgICAgcGFyc2VUb2tlblNpZ25lZE51bWJlciA9IC9bKy1dP1xcZCsvLCAvLyAtaW5mIC0gaW5mXG5cbiAgICAgICAgLy8gaXNvIDg2MDEgcmVnZXhcbiAgICAgICAgLy8gMDAwMC0wMC0wMCAwMDAwLVcwMCBvciAwMDAwLVcwMC0wICsgVCArIDAwIG9yIDAwOjAwIG9yIDAwOjAwOjAwIG9yIDAwOjAwOjAwLjAwMCArICswMDowMCBvciArMDAwMCBvciArMDApXG4gICAgICAgIGlzb1JlZ2V4ID0gL15cXHMqKD86WystXVxcZHs2fXxcXGR7NH0pLSg/OihcXGRcXGQtXFxkXFxkKXwoV1xcZFxcZCQpfChXXFxkXFxkLVxcZCl8KFxcZFxcZFxcZCkpKChUfCApKFxcZFxcZCg6XFxkXFxkKDpcXGRcXGQoXFwuXFxkKyk/KT8pPyk/KFtcXCtcXC1dXFxkXFxkKD86Oj9cXGRcXGQpP3xcXHMqWik/KT8kLyxcblxuICAgICAgICBpc29Gb3JtYXQgPSAnWVlZWS1NTS1ERFRISDptbTpzc1onLFxuXG4gICAgICAgIGlzb0RhdGVzID0gW1xuICAgICAgICAgICAgWydZWVlZWVktTU0tREQnLCAvWystXVxcZHs2fS1cXGR7Mn0tXFxkezJ9L10sXG4gICAgICAgICAgICBbJ1lZWVktTU0tREQnLCAvXFxkezR9LVxcZHsyfS1cXGR7Mn0vXSxcbiAgICAgICAgICAgIFsnR0dHRy1bV11XVy1FJywgL1xcZHs0fS1XXFxkezJ9LVxcZC9dLFxuICAgICAgICAgICAgWydHR0dHLVtXXVdXJywgL1xcZHs0fS1XXFxkezJ9L10sXG4gICAgICAgICAgICBbJ1lZWVktREREJywgL1xcZHs0fS1cXGR7M30vXVxuICAgICAgICBdLFxuXG4gICAgICAgIC8vIGlzbyB0aW1lIGZvcm1hdHMgYW5kIHJlZ2V4ZXNcbiAgICAgICAgaXNvVGltZXMgPSBbXG4gICAgICAgICAgICBbJ0hIOm1tOnNzLlNTU1MnLCAvKFR8IClcXGRcXGQ6XFxkXFxkOlxcZFxcZFxcLlxcZCsvXSxcbiAgICAgICAgICAgIFsnSEg6bW06c3MnLCAvKFR8IClcXGRcXGQ6XFxkXFxkOlxcZFxcZC9dLFxuICAgICAgICAgICAgWydISDptbScsIC8oVHwgKVxcZFxcZDpcXGRcXGQvXSxcbiAgICAgICAgICAgIFsnSEgnLCAvKFR8IClcXGRcXGQvXVxuICAgICAgICBdLFxuXG4gICAgICAgIC8vIHRpbWV6b25lIGNodW5rZXIgJysxMDowMCcgPiBbJzEwJywgJzAwJ10gb3IgJy0xNTMwJyA+IFsnLTE1JywgJzMwJ11cbiAgICAgICAgcGFyc2VUaW1lem9uZUNodW5rZXIgPSAvKFtcXCtcXC1dfFxcZFxcZCkvZ2ksXG5cbiAgICAgICAgLy8gZ2V0dGVyIGFuZCBzZXR0ZXIgbmFtZXNcbiAgICAgICAgcHJveHlHZXR0ZXJzQW5kU2V0dGVycyA9ICdEYXRlfEhvdXJzfE1pbnV0ZXN8U2Vjb25kc3xNaWxsaXNlY29uZHMnLnNwbGl0KCd8JyksXG4gICAgICAgIHVuaXRNaWxsaXNlY29uZEZhY3RvcnMgPSB7XG4gICAgICAgICAgICAnTWlsbGlzZWNvbmRzJyA6IDEsXG4gICAgICAgICAgICAnU2Vjb25kcycgOiAxZTMsXG4gICAgICAgICAgICAnTWludXRlcycgOiA2ZTQsXG4gICAgICAgICAgICAnSG91cnMnIDogMzZlNSxcbiAgICAgICAgICAgICdEYXlzJyA6IDg2NGU1LFxuICAgICAgICAgICAgJ01vbnRocycgOiAyNTkyZTYsXG4gICAgICAgICAgICAnWWVhcnMnIDogMzE1MzZlNlxuICAgICAgICB9LFxuXG4gICAgICAgIHVuaXRBbGlhc2VzID0ge1xuICAgICAgICAgICAgbXMgOiAnbWlsbGlzZWNvbmQnLFxuICAgICAgICAgICAgcyA6ICdzZWNvbmQnLFxuICAgICAgICAgICAgbSA6ICdtaW51dGUnLFxuICAgICAgICAgICAgaCA6ICdob3VyJyxcbiAgICAgICAgICAgIGQgOiAnZGF5JyxcbiAgICAgICAgICAgIEQgOiAnZGF0ZScsXG4gICAgICAgICAgICB3IDogJ3dlZWsnLFxuICAgICAgICAgICAgVyA6ICdpc29XZWVrJyxcbiAgICAgICAgICAgIE0gOiAnbW9udGgnLFxuICAgICAgICAgICAgUSA6ICdxdWFydGVyJyxcbiAgICAgICAgICAgIHkgOiAneWVhcicsXG4gICAgICAgICAgICBEREQgOiAnZGF5T2ZZZWFyJyxcbiAgICAgICAgICAgIGUgOiAnd2Vla2RheScsXG4gICAgICAgICAgICBFIDogJ2lzb1dlZWtkYXknLFxuICAgICAgICAgICAgZ2c6ICd3ZWVrWWVhcicsXG4gICAgICAgICAgICBHRzogJ2lzb1dlZWtZZWFyJ1xuICAgICAgICB9LFxuXG4gICAgICAgIGNhbWVsRnVuY3Rpb25zID0ge1xuICAgICAgICAgICAgZGF5b2Z5ZWFyIDogJ2RheU9mWWVhcicsXG4gICAgICAgICAgICBpc293ZWVrZGF5IDogJ2lzb1dlZWtkYXknLFxuICAgICAgICAgICAgaXNvd2VlayA6ICdpc29XZWVrJyxcbiAgICAgICAgICAgIHdlZWt5ZWFyIDogJ3dlZWtZZWFyJyxcbiAgICAgICAgICAgIGlzb3dlZWt5ZWFyIDogJ2lzb1dlZWtZZWFyJ1xuICAgICAgICB9LFxuXG4gICAgICAgIC8vIGZvcm1hdCBmdW5jdGlvbiBzdHJpbmdzXG4gICAgICAgIGZvcm1hdEZ1bmN0aW9ucyA9IHt9LFxuXG4gICAgICAgIC8vIGRlZmF1bHQgcmVsYXRpdmUgdGltZSB0aHJlc2hvbGRzXG4gICAgICAgIHJlbGF0aXZlVGltZVRocmVzaG9sZHMgPSB7XG4gICAgICAgICAgICBzOiA0NSwgIC8vIHNlY29uZHMgdG8gbWludXRlXG4gICAgICAgICAgICBtOiA0NSwgIC8vIG1pbnV0ZXMgdG8gaG91clxuICAgICAgICAgICAgaDogMjIsICAvLyBob3VycyB0byBkYXlcbiAgICAgICAgICAgIGQ6IDI2LCAgLy8gZGF5cyB0byBtb250aFxuICAgICAgICAgICAgTTogMTEgICAvLyBtb250aHMgdG8geWVhclxuICAgICAgICB9LFxuXG4gICAgICAgIC8vIHRva2VucyB0byBvcmRpbmFsaXplIGFuZCBwYWRcbiAgICAgICAgb3JkaW5hbGl6ZVRva2VucyA9ICdEREQgdyBXIE0gRCBkJy5zcGxpdCgnICcpLFxuICAgICAgICBwYWRkZWRUb2tlbnMgPSAnTSBEIEggaCBtIHMgdyBXJy5zcGxpdCgnICcpLFxuXG4gICAgICAgIGZvcm1hdFRva2VuRnVuY3Rpb25zID0ge1xuICAgICAgICAgICAgTSAgICA6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gdGhpcy5tb250aCgpICsgMTtcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBNTU0gIDogZnVuY3Rpb24gKGZvcm1hdCkge1xuICAgICAgICAgICAgICAgIHJldHVybiB0aGlzLmxvY2FsZURhdGEoKS5tb250aHNTaG9ydCh0aGlzLCBmb3JtYXQpO1xuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIE1NTU0gOiBmdW5jdGlvbiAoZm9ybWF0KSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHRoaXMubG9jYWxlRGF0YSgpLm1vbnRocyh0aGlzLCBmb3JtYXQpO1xuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIEQgICAgOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHRoaXMuZGF0ZSgpO1xuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIERERCAgOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHRoaXMuZGF5T2ZZZWFyKCk7XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgZCAgICA6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gdGhpcy5kYXkoKTtcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBkZCAgIDogZnVuY3Rpb24gKGZvcm1hdCkge1xuICAgICAgICAgICAgICAgIHJldHVybiB0aGlzLmxvY2FsZURhdGEoKS53ZWVrZGF5c01pbih0aGlzLCBmb3JtYXQpO1xuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIGRkZCAgOiBmdW5jdGlvbiAoZm9ybWF0KSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHRoaXMubG9jYWxlRGF0YSgpLndlZWtkYXlzU2hvcnQodGhpcywgZm9ybWF0KTtcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBkZGRkIDogZnVuY3Rpb24gKGZvcm1hdCkge1xuICAgICAgICAgICAgICAgIHJldHVybiB0aGlzLmxvY2FsZURhdGEoKS53ZWVrZGF5cyh0aGlzLCBmb3JtYXQpO1xuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIHcgICAgOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHRoaXMud2VlaygpO1xuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIFcgICAgOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHRoaXMuaXNvV2VlaygpO1xuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIFlZICAgOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGxlZnRaZXJvRmlsbCh0aGlzLnllYXIoKSAlIDEwMCwgMik7XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgWVlZWSA6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gbGVmdFplcm9GaWxsKHRoaXMueWVhcigpLCA0KTtcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBZWVlZWSA6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gbGVmdFplcm9GaWxsKHRoaXMueWVhcigpLCA1KTtcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBZWVlZWVkgOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgdmFyIHkgPSB0aGlzLnllYXIoKSwgc2lnbiA9IHkgPj0gMCA/ICcrJyA6ICctJztcbiAgICAgICAgICAgICAgICByZXR1cm4gc2lnbiArIGxlZnRaZXJvRmlsbChNYXRoLmFicyh5KSwgNik7XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgZ2cgICA6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gbGVmdFplcm9GaWxsKHRoaXMud2Vla1llYXIoKSAlIDEwMCwgMik7XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgZ2dnZyA6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gbGVmdFplcm9GaWxsKHRoaXMud2Vla1llYXIoKSwgNCk7XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgZ2dnZ2cgOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGxlZnRaZXJvRmlsbCh0aGlzLndlZWtZZWFyKCksIDUpO1xuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIEdHICAgOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGxlZnRaZXJvRmlsbCh0aGlzLmlzb1dlZWtZZWFyKCkgJSAxMDAsIDIpO1xuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIEdHR0cgOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGxlZnRaZXJvRmlsbCh0aGlzLmlzb1dlZWtZZWFyKCksIDQpO1xuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIEdHR0dHIDogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgIHJldHVybiBsZWZ0WmVyb0ZpbGwodGhpcy5pc29XZWVrWWVhcigpLCA1KTtcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBlIDogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgIHJldHVybiB0aGlzLndlZWtkYXkoKTtcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBFIDogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgIHJldHVybiB0aGlzLmlzb1dlZWtkYXkoKTtcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBhICAgIDogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgIHJldHVybiB0aGlzLmxvY2FsZURhdGEoKS5tZXJpZGllbSh0aGlzLmhvdXJzKCksIHRoaXMubWludXRlcygpLCB0cnVlKTtcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBBICAgIDogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgIHJldHVybiB0aGlzLmxvY2FsZURhdGEoKS5tZXJpZGllbSh0aGlzLmhvdXJzKCksIHRoaXMubWludXRlcygpLCBmYWxzZSk7XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgSCAgICA6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gdGhpcy5ob3VycygpO1xuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIGggICAgOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHRoaXMuaG91cnMoKSAlIDEyIHx8IDEyO1xuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIG0gICAgOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHRoaXMubWludXRlcygpO1xuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIHMgICAgOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHRoaXMuc2Vjb25kcygpO1xuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIFMgICAgOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHRvSW50KHRoaXMubWlsbGlzZWNvbmRzKCkgLyAxMDApO1xuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIFNTICAgOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGxlZnRaZXJvRmlsbCh0b0ludCh0aGlzLm1pbGxpc2Vjb25kcygpIC8gMTApLCAyKTtcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBTU1MgIDogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgIHJldHVybiBsZWZ0WmVyb0ZpbGwodGhpcy5taWxsaXNlY29uZHMoKSwgMyk7XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgU1NTUyA6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gbGVmdFplcm9GaWxsKHRoaXMubWlsbGlzZWNvbmRzKCksIDMpO1xuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIFogICAgOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgdmFyIGEgPSAtdGhpcy56b25lKCksXG4gICAgICAgICAgICAgICAgICAgIGIgPSAnKyc7XG4gICAgICAgICAgICAgICAgaWYgKGEgPCAwKSB7XG4gICAgICAgICAgICAgICAgICAgIGEgPSAtYTtcbiAgICAgICAgICAgICAgICAgICAgYiA9ICctJztcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgcmV0dXJuIGIgKyBsZWZ0WmVyb0ZpbGwodG9JbnQoYSAvIDYwKSwgMikgKyAnOicgKyBsZWZ0WmVyb0ZpbGwodG9JbnQoYSkgJSA2MCwgMik7XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgWlogICA6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICB2YXIgYSA9IC10aGlzLnpvbmUoKSxcbiAgICAgICAgICAgICAgICAgICAgYiA9ICcrJztcbiAgICAgICAgICAgICAgICBpZiAoYSA8IDApIHtcbiAgICAgICAgICAgICAgICAgICAgYSA9IC1hO1xuICAgICAgICAgICAgICAgICAgICBiID0gJy0nO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICByZXR1cm4gYiArIGxlZnRaZXJvRmlsbCh0b0ludChhIC8gNjApLCAyKSArIGxlZnRaZXJvRmlsbCh0b0ludChhKSAlIDYwLCAyKTtcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICB6IDogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgIHJldHVybiB0aGlzLnpvbmVBYmJyKCk7XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgenogOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHRoaXMuem9uZU5hbWUoKTtcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBYICAgIDogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgIHJldHVybiB0aGlzLnVuaXgoKTtcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBRIDogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgIHJldHVybiB0aGlzLnF1YXJ0ZXIoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSxcblxuICAgICAgICBkZXByZWNhdGlvbnMgPSB7fSxcblxuICAgICAgICBsaXN0cyA9IFsnbW9udGhzJywgJ21vbnRoc1Nob3J0JywgJ3dlZWtkYXlzJywgJ3dlZWtkYXlzU2hvcnQnLCAnd2Vla2RheXNNaW4nXTtcblxuICAgIC8vIFBpY2sgdGhlIGZpcnN0IGRlZmluZWQgb2YgdHdvIG9yIHRocmVlIGFyZ3VtZW50cy4gZGZsIGNvbWVzIGZyb21cbiAgICAvLyBkZWZhdWx0LlxuICAgIGZ1bmN0aW9uIGRmbChhLCBiLCBjKSB7XG4gICAgICAgIHN3aXRjaCAoYXJndW1lbnRzLmxlbmd0aCkge1xuICAgICAgICAgICAgY2FzZSAyOiByZXR1cm4gYSAhPSBudWxsID8gYSA6IGI7XG4gICAgICAgICAgICBjYXNlIDM6IHJldHVybiBhICE9IG51bGwgPyBhIDogYiAhPSBudWxsID8gYiA6IGM7XG4gICAgICAgICAgICBkZWZhdWx0OiB0aHJvdyBuZXcgRXJyb3IoJ0ltcGxlbWVudCBtZScpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gaGFzT3duUHJvcChhLCBiKSB7XG4gICAgICAgIHJldHVybiBoYXNPd25Qcm9wZXJ0eS5jYWxsKGEsIGIpO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIGRlZmF1bHRQYXJzaW5nRmxhZ3MoKSB7XG4gICAgICAgIC8vIFdlIG5lZWQgdG8gZGVlcCBjbG9uZSB0aGlzIG9iamVjdCwgYW5kIGVzNSBzdGFuZGFyZCBpcyBub3QgdmVyeVxuICAgICAgICAvLyBoZWxwZnVsLlxuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgZW1wdHkgOiBmYWxzZSxcbiAgICAgICAgICAgIHVudXNlZFRva2VucyA6IFtdLFxuICAgICAgICAgICAgdW51c2VkSW5wdXQgOiBbXSxcbiAgICAgICAgICAgIG92ZXJmbG93IDogLTIsXG4gICAgICAgICAgICBjaGFyc0xlZnRPdmVyIDogMCxcbiAgICAgICAgICAgIG51bGxJbnB1dCA6IGZhbHNlLFxuICAgICAgICAgICAgaW52YWxpZE1vbnRoIDogbnVsbCxcbiAgICAgICAgICAgIGludmFsaWRGb3JtYXQgOiBmYWxzZSxcbiAgICAgICAgICAgIHVzZXJJbnZhbGlkYXRlZCA6IGZhbHNlLFxuICAgICAgICAgICAgaXNvOiBmYWxzZVxuICAgICAgICB9O1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIHByaW50TXNnKG1zZykge1xuICAgICAgICBpZiAobW9tZW50LnN1cHByZXNzRGVwcmVjYXRpb25XYXJuaW5ncyA9PT0gZmFsc2UgJiZcbiAgICAgICAgICAgICAgICB0eXBlb2YgY29uc29sZSAhPT0gJ3VuZGVmaW5lZCcgJiYgY29uc29sZS53YXJuKSB7XG4gICAgICAgICAgICBjb25zb2xlLndhcm4oJ0RlcHJlY2F0aW9uIHdhcm5pbmc6ICcgKyBtc2cpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gZGVwcmVjYXRlKG1zZywgZm4pIHtcbiAgICAgICAgdmFyIGZpcnN0VGltZSA9IHRydWU7XG4gICAgICAgIHJldHVybiBleHRlbmQoZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgaWYgKGZpcnN0VGltZSkge1xuICAgICAgICAgICAgICAgIHByaW50TXNnKG1zZyk7XG4gICAgICAgICAgICAgICAgZmlyc3RUaW1lID0gZmFsc2U7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gZm4uYXBwbHkodGhpcywgYXJndW1lbnRzKTtcbiAgICAgICAgfSwgZm4pO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIGRlcHJlY2F0ZVNpbXBsZShuYW1lLCBtc2cpIHtcbiAgICAgICAgaWYgKCFkZXByZWNhdGlvbnNbbmFtZV0pIHtcbiAgICAgICAgICAgIHByaW50TXNnKG1zZyk7XG4gICAgICAgICAgICBkZXByZWNhdGlvbnNbbmFtZV0gPSB0cnVlO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gcGFkVG9rZW4oZnVuYywgY291bnQpIHtcbiAgICAgICAgcmV0dXJuIGZ1bmN0aW9uIChhKSB7XG4gICAgICAgICAgICByZXR1cm4gbGVmdFplcm9GaWxsKGZ1bmMuY2FsbCh0aGlzLCBhKSwgY291bnQpO1xuICAgICAgICB9O1xuICAgIH1cbiAgICBmdW5jdGlvbiBvcmRpbmFsaXplVG9rZW4oZnVuYywgcGVyaW9kKSB7XG4gICAgICAgIHJldHVybiBmdW5jdGlvbiAoYSkge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMubG9jYWxlRGF0YSgpLm9yZGluYWwoZnVuYy5jYWxsKHRoaXMsIGEpLCBwZXJpb2QpO1xuICAgICAgICB9O1xuICAgIH1cblxuICAgIHdoaWxlIChvcmRpbmFsaXplVG9rZW5zLmxlbmd0aCkge1xuICAgICAgICBpID0gb3JkaW5hbGl6ZVRva2Vucy5wb3AoKTtcbiAgICAgICAgZm9ybWF0VG9rZW5GdW5jdGlvbnNbaSArICdvJ10gPSBvcmRpbmFsaXplVG9rZW4oZm9ybWF0VG9rZW5GdW5jdGlvbnNbaV0sIGkpO1xuICAgIH1cbiAgICB3aGlsZSAocGFkZGVkVG9rZW5zLmxlbmd0aCkge1xuICAgICAgICBpID0gcGFkZGVkVG9rZW5zLnBvcCgpO1xuICAgICAgICBmb3JtYXRUb2tlbkZ1bmN0aW9uc1tpICsgaV0gPSBwYWRUb2tlbihmb3JtYXRUb2tlbkZ1bmN0aW9uc1tpXSwgMik7XG4gICAgfVxuICAgIGZvcm1hdFRva2VuRnVuY3Rpb25zLkREREQgPSBwYWRUb2tlbihmb3JtYXRUb2tlbkZ1bmN0aW9ucy5EREQsIDMpO1xuXG5cbiAgICAvKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqXG4gICAgICAgIENvbnN0cnVjdG9yc1xuICAgICoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKi9cblxuICAgIGZ1bmN0aW9uIExvY2FsZSgpIHtcbiAgICB9XG5cbiAgICAvLyBNb21lbnQgcHJvdG90eXBlIG9iamVjdFxuICAgIGZ1bmN0aW9uIE1vbWVudChjb25maWcsIHNraXBPdmVyZmxvdykge1xuICAgICAgICBpZiAoc2tpcE92ZXJmbG93ICE9PSBmYWxzZSkge1xuICAgICAgICAgICAgY2hlY2tPdmVyZmxvdyhjb25maWcpO1xuICAgICAgICB9XG4gICAgICAgIGNvcHlDb25maWcodGhpcywgY29uZmlnKTtcbiAgICAgICAgdGhpcy5fZCA9IG5ldyBEYXRlKCtjb25maWcuX2QpO1xuICAgIH1cblxuICAgIC8vIER1cmF0aW9uIENvbnN0cnVjdG9yXG4gICAgZnVuY3Rpb24gRHVyYXRpb24oZHVyYXRpb24pIHtcbiAgICAgICAgdmFyIG5vcm1hbGl6ZWRJbnB1dCA9IG5vcm1hbGl6ZU9iamVjdFVuaXRzKGR1cmF0aW9uKSxcbiAgICAgICAgICAgIHllYXJzID0gbm9ybWFsaXplZElucHV0LnllYXIgfHwgMCxcbiAgICAgICAgICAgIHF1YXJ0ZXJzID0gbm9ybWFsaXplZElucHV0LnF1YXJ0ZXIgfHwgMCxcbiAgICAgICAgICAgIG1vbnRocyA9IG5vcm1hbGl6ZWRJbnB1dC5tb250aCB8fCAwLFxuICAgICAgICAgICAgd2Vla3MgPSBub3JtYWxpemVkSW5wdXQud2VlayB8fCAwLFxuICAgICAgICAgICAgZGF5cyA9IG5vcm1hbGl6ZWRJbnB1dC5kYXkgfHwgMCxcbiAgICAgICAgICAgIGhvdXJzID0gbm9ybWFsaXplZElucHV0LmhvdXIgfHwgMCxcbiAgICAgICAgICAgIG1pbnV0ZXMgPSBub3JtYWxpemVkSW5wdXQubWludXRlIHx8IDAsXG4gICAgICAgICAgICBzZWNvbmRzID0gbm9ybWFsaXplZElucHV0LnNlY29uZCB8fCAwLFxuICAgICAgICAgICAgbWlsbGlzZWNvbmRzID0gbm9ybWFsaXplZElucHV0Lm1pbGxpc2Vjb25kIHx8IDA7XG5cbiAgICAgICAgLy8gcmVwcmVzZW50YXRpb24gZm9yIGRhdGVBZGRSZW1vdmVcbiAgICAgICAgdGhpcy5fbWlsbGlzZWNvbmRzID0gK21pbGxpc2Vjb25kcyArXG4gICAgICAgICAgICBzZWNvbmRzICogMWUzICsgLy8gMTAwMFxuICAgICAgICAgICAgbWludXRlcyAqIDZlNCArIC8vIDEwMDAgKiA2MFxuICAgICAgICAgICAgaG91cnMgKiAzNmU1OyAvLyAxMDAwICogNjAgKiA2MFxuICAgICAgICAvLyBCZWNhdXNlIG9mIGRhdGVBZGRSZW1vdmUgdHJlYXRzIDI0IGhvdXJzIGFzIGRpZmZlcmVudCBmcm9tIGFcbiAgICAgICAgLy8gZGF5IHdoZW4gd29ya2luZyBhcm91bmQgRFNULCB3ZSBuZWVkIHRvIHN0b3JlIHRoZW0gc2VwYXJhdGVseVxuICAgICAgICB0aGlzLl9kYXlzID0gK2RheXMgK1xuICAgICAgICAgICAgd2Vla3MgKiA3O1xuICAgICAgICAvLyBJdCBpcyBpbXBvc3NpYmxlIHRyYW5zbGF0ZSBtb250aHMgaW50byBkYXlzIHdpdGhvdXQga25vd2luZ1xuICAgICAgICAvLyB3aGljaCBtb250aHMgeW91IGFyZSBhcmUgdGFsa2luZyBhYm91dCwgc28gd2UgaGF2ZSB0byBzdG9yZVxuICAgICAgICAvLyBpdCBzZXBhcmF0ZWx5LlxuICAgICAgICB0aGlzLl9tb250aHMgPSArbW9udGhzICtcbiAgICAgICAgICAgIHF1YXJ0ZXJzICogMyArXG4gICAgICAgICAgICB5ZWFycyAqIDEyO1xuXG4gICAgICAgIHRoaXMuX2RhdGEgPSB7fTtcblxuICAgICAgICB0aGlzLl9sb2NhbGUgPSBtb21lbnQubG9jYWxlRGF0YSgpO1xuXG4gICAgICAgIHRoaXMuX2J1YmJsZSgpO1xuICAgIH1cblxuICAgIC8qKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKipcbiAgICAgICAgSGVscGVyc1xuICAgICoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKi9cblxuXG4gICAgZnVuY3Rpb24gZXh0ZW5kKGEsIGIpIHtcbiAgICAgICAgZm9yICh2YXIgaSBpbiBiKSB7XG4gICAgICAgICAgICBpZiAoaGFzT3duUHJvcChiLCBpKSkge1xuICAgICAgICAgICAgICAgIGFbaV0gPSBiW2ldO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgaWYgKGhhc093blByb3AoYiwgJ3RvU3RyaW5nJykpIHtcbiAgICAgICAgICAgIGEudG9TdHJpbmcgPSBiLnRvU3RyaW5nO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKGhhc093blByb3AoYiwgJ3ZhbHVlT2YnKSkge1xuICAgICAgICAgICAgYS52YWx1ZU9mID0gYi52YWx1ZU9mO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIGE7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gY29weUNvbmZpZyh0bywgZnJvbSkge1xuICAgICAgICB2YXIgaSwgcHJvcCwgdmFsO1xuXG4gICAgICAgIGlmICh0eXBlb2YgZnJvbS5faXNBTW9tZW50T2JqZWN0ICE9PSAndW5kZWZpbmVkJykge1xuICAgICAgICAgICAgdG8uX2lzQU1vbWVudE9iamVjdCA9IGZyb20uX2lzQU1vbWVudE9iamVjdDtcbiAgICAgICAgfVxuICAgICAgICBpZiAodHlwZW9mIGZyb20uX2kgIT09ICd1bmRlZmluZWQnKSB7XG4gICAgICAgICAgICB0by5faSA9IGZyb20uX2k7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKHR5cGVvZiBmcm9tLl9mICE9PSAndW5kZWZpbmVkJykge1xuICAgICAgICAgICAgdG8uX2YgPSBmcm9tLl9mO1xuICAgICAgICB9XG4gICAgICAgIGlmICh0eXBlb2YgZnJvbS5fbCAhPT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAgICAgICAgIHRvLl9sID0gZnJvbS5fbDtcbiAgICAgICAgfVxuICAgICAgICBpZiAodHlwZW9mIGZyb20uX3N0cmljdCAhPT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAgICAgICAgIHRvLl9zdHJpY3QgPSBmcm9tLl9zdHJpY3Q7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKHR5cGVvZiBmcm9tLl90em0gIT09ICd1bmRlZmluZWQnKSB7XG4gICAgICAgICAgICB0by5fdHptID0gZnJvbS5fdHptO1xuICAgICAgICB9XG4gICAgICAgIGlmICh0eXBlb2YgZnJvbS5faXNVVEMgIT09ICd1bmRlZmluZWQnKSB7XG4gICAgICAgICAgICB0by5faXNVVEMgPSBmcm9tLl9pc1VUQztcbiAgICAgICAgfVxuICAgICAgICBpZiAodHlwZW9mIGZyb20uX29mZnNldCAhPT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAgICAgICAgIHRvLl9vZmZzZXQgPSBmcm9tLl9vZmZzZXQ7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKHR5cGVvZiBmcm9tLl9wZiAhPT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAgICAgICAgIHRvLl9wZiA9IGZyb20uX3BmO1xuICAgICAgICB9XG4gICAgICAgIGlmICh0eXBlb2YgZnJvbS5fbG9jYWxlICE9PSAndW5kZWZpbmVkJykge1xuICAgICAgICAgICAgdG8uX2xvY2FsZSA9IGZyb20uX2xvY2FsZTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChtb21lbnRQcm9wZXJ0aWVzLmxlbmd0aCA+IDApIHtcbiAgICAgICAgICAgIGZvciAoaSBpbiBtb21lbnRQcm9wZXJ0aWVzKSB7XG4gICAgICAgICAgICAgICAgcHJvcCA9IG1vbWVudFByb3BlcnRpZXNbaV07XG4gICAgICAgICAgICAgICAgdmFsID0gZnJvbVtwcm9wXTtcbiAgICAgICAgICAgICAgICBpZiAodHlwZW9mIHZhbCAhPT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAgICAgICAgICAgICAgICAgdG9bcHJvcF0gPSB2YWw7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIHRvO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIGFic1JvdW5kKG51bWJlcikge1xuICAgICAgICBpZiAobnVtYmVyIDwgMCkge1xuICAgICAgICAgICAgcmV0dXJuIE1hdGguY2VpbChudW1iZXIpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgcmV0dXJuIE1hdGguZmxvb3IobnVtYmVyKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIC8vIGxlZnQgemVybyBmaWxsIGEgbnVtYmVyXG4gICAgLy8gc2VlIGh0dHA6Ly9qc3BlcmYuY29tL2xlZnQtemVyby1maWxsaW5nIGZvciBwZXJmb3JtYW5jZSBjb21wYXJpc29uXG4gICAgZnVuY3Rpb24gbGVmdFplcm9GaWxsKG51bWJlciwgdGFyZ2V0TGVuZ3RoLCBmb3JjZVNpZ24pIHtcbiAgICAgICAgdmFyIG91dHB1dCA9ICcnICsgTWF0aC5hYnMobnVtYmVyKSxcbiAgICAgICAgICAgIHNpZ24gPSBudW1iZXIgPj0gMDtcblxuICAgICAgICB3aGlsZSAob3V0cHV0Lmxlbmd0aCA8IHRhcmdldExlbmd0aCkge1xuICAgICAgICAgICAgb3V0cHV0ID0gJzAnICsgb3V0cHV0O1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiAoc2lnbiA/IChmb3JjZVNpZ24gPyAnKycgOiAnJykgOiAnLScpICsgb3V0cHV0O1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIHBvc2l0aXZlTW9tZW50c0RpZmZlcmVuY2UoYmFzZSwgb3RoZXIpIHtcbiAgICAgICAgdmFyIHJlcyA9IHttaWxsaXNlY29uZHM6IDAsIG1vbnRoczogMH07XG5cbiAgICAgICAgcmVzLm1vbnRocyA9IG90aGVyLm1vbnRoKCkgLSBiYXNlLm1vbnRoKCkgK1xuICAgICAgICAgICAgKG90aGVyLnllYXIoKSAtIGJhc2UueWVhcigpKSAqIDEyO1xuICAgICAgICBpZiAoYmFzZS5jbG9uZSgpLmFkZChyZXMubW9udGhzLCAnTScpLmlzQWZ0ZXIob3RoZXIpKSB7XG4gICAgICAgICAgICAtLXJlcy5tb250aHM7XG4gICAgICAgIH1cblxuICAgICAgICByZXMubWlsbGlzZWNvbmRzID0gK290aGVyIC0gKyhiYXNlLmNsb25lKCkuYWRkKHJlcy5tb250aHMsICdNJykpO1xuXG4gICAgICAgIHJldHVybiByZXM7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gbW9tZW50c0RpZmZlcmVuY2UoYmFzZSwgb3RoZXIpIHtcbiAgICAgICAgdmFyIHJlcztcbiAgICAgICAgb3RoZXIgPSBtYWtlQXMob3RoZXIsIGJhc2UpO1xuICAgICAgICBpZiAoYmFzZS5pc0JlZm9yZShvdGhlcikpIHtcbiAgICAgICAgICAgIHJlcyA9IHBvc2l0aXZlTW9tZW50c0RpZmZlcmVuY2UoYmFzZSwgb3RoZXIpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgcmVzID0gcG9zaXRpdmVNb21lbnRzRGlmZmVyZW5jZShvdGhlciwgYmFzZSk7XG4gICAgICAgICAgICByZXMubWlsbGlzZWNvbmRzID0gLXJlcy5taWxsaXNlY29uZHM7XG4gICAgICAgICAgICByZXMubW9udGhzID0gLXJlcy5tb250aHM7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gcmVzO1xuICAgIH1cblxuICAgIC8vIFRPRE86IHJlbW92ZSAnbmFtZScgYXJnIGFmdGVyIGRlcHJlY2F0aW9uIGlzIHJlbW92ZWRcbiAgICBmdW5jdGlvbiBjcmVhdGVBZGRlcihkaXJlY3Rpb24sIG5hbWUpIHtcbiAgICAgICAgcmV0dXJuIGZ1bmN0aW9uICh2YWwsIHBlcmlvZCkge1xuICAgICAgICAgICAgdmFyIGR1ciwgdG1wO1xuICAgICAgICAgICAgLy9pbnZlcnQgdGhlIGFyZ3VtZW50cywgYnV0IGNvbXBsYWluIGFib3V0IGl0XG4gICAgICAgICAgICBpZiAocGVyaW9kICE9PSBudWxsICYmICFpc05hTigrcGVyaW9kKSkge1xuICAgICAgICAgICAgICAgIGRlcHJlY2F0ZVNpbXBsZShuYW1lLCAnbW9tZW50KCkuJyArIG5hbWUgICsgJyhwZXJpb2QsIG51bWJlcikgaXMgZGVwcmVjYXRlZC4gUGxlYXNlIHVzZSBtb21lbnQoKS4nICsgbmFtZSArICcobnVtYmVyLCBwZXJpb2QpLicpO1xuICAgICAgICAgICAgICAgIHRtcCA9IHZhbDsgdmFsID0gcGVyaW9kOyBwZXJpb2QgPSB0bXA7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHZhbCA9IHR5cGVvZiB2YWwgPT09ICdzdHJpbmcnID8gK3ZhbCA6IHZhbDtcbiAgICAgICAgICAgIGR1ciA9IG1vbWVudC5kdXJhdGlvbih2YWwsIHBlcmlvZCk7XG4gICAgICAgICAgICBhZGRPclN1YnRyYWN0RHVyYXRpb25Gcm9tTW9tZW50KHRoaXMsIGR1ciwgZGlyZWN0aW9uKTtcbiAgICAgICAgICAgIHJldHVybiB0aGlzO1xuICAgICAgICB9O1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIGFkZE9yU3VidHJhY3REdXJhdGlvbkZyb21Nb21lbnQobW9tLCBkdXJhdGlvbiwgaXNBZGRpbmcsIHVwZGF0ZU9mZnNldCkge1xuICAgICAgICB2YXIgbWlsbGlzZWNvbmRzID0gZHVyYXRpb24uX21pbGxpc2Vjb25kcyxcbiAgICAgICAgICAgIGRheXMgPSBkdXJhdGlvbi5fZGF5cyxcbiAgICAgICAgICAgIG1vbnRocyA9IGR1cmF0aW9uLl9tb250aHM7XG4gICAgICAgIHVwZGF0ZU9mZnNldCA9IHVwZGF0ZU9mZnNldCA9PSBudWxsID8gdHJ1ZSA6IHVwZGF0ZU9mZnNldDtcblxuICAgICAgICBpZiAobWlsbGlzZWNvbmRzKSB7XG4gICAgICAgICAgICBtb20uX2Quc2V0VGltZSgrbW9tLl9kICsgbWlsbGlzZWNvbmRzICogaXNBZGRpbmcpO1xuICAgICAgICB9XG4gICAgICAgIGlmIChkYXlzKSB7XG4gICAgICAgICAgICByYXdTZXR0ZXIobW9tLCAnRGF0ZScsIHJhd0dldHRlcihtb20sICdEYXRlJykgKyBkYXlzICogaXNBZGRpbmcpO1xuICAgICAgICB9XG4gICAgICAgIGlmIChtb250aHMpIHtcbiAgICAgICAgICAgIHJhd01vbnRoU2V0dGVyKG1vbSwgcmF3R2V0dGVyKG1vbSwgJ01vbnRoJykgKyBtb250aHMgKiBpc0FkZGluZyk7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKHVwZGF0ZU9mZnNldCkge1xuICAgICAgICAgICAgbW9tZW50LnVwZGF0ZU9mZnNldChtb20sIGRheXMgfHwgbW9udGhzKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIC8vIGNoZWNrIGlmIGlzIGFuIGFycmF5XG4gICAgZnVuY3Rpb24gaXNBcnJheShpbnB1dCkge1xuICAgICAgICByZXR1cm4gT2JqZWN0LnByb3RvdHlwZS50b1N0cmluZy5jYWxsKGlucHV0KSA9PT0gJ1tvYmplY3QgQXJyYXldJztcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBpc0RhdGUoaW5wdXQpIHtcbiAgICAgICAgcmV0dXJuIE9iamVjdC5wcm90b3R5cGUudG9TdHJpbmcuY2FsbChpbnB1dCkgPT09ICdbb2JqZWN0IERhdGVdJyB8fFxuICAgICAgICAgICAgaW5wdXQgaW5zdGFuY2VvZiBEYXRlO1xuICAgIH1cblxuICAgIC8vIGNvbXBhcmUgdHdvIGFycmF5cywgcmV0dXJuIHRoZSBudW1iZXIgb2YgZGlmZmVyZW5jZXNcbiAgICBmdW5jdGlvbiBjb21wYXJlQXJyYXlzKGFycmF5MSwgYXJyYXkyLCBkb250Q29udmVydCkge1xuICAgICAgICB2YXIgbGVuID0gTWF0aC5taW4oYXJyYXkxLmxlbmd0aCwgYXJyYXkyLmxlbmd0aCksXG4gICAgICAgICAgICBsZW5ndGhEaWZmID0gTWF0aC5hYnMoYXJyYXkxLmxlbmd0aCAtIGFycmF5Mi5sZW5ndGgpLFxuICAgICAgICAgICAgZGlmZnMgPSAwLFxuICAgICAgICAgICAgaTtcbiAgICAgICAgZm9yIChpID0gMDsgaSA8IGxlbjsgaSsrKSB7XG4gICAgICAgICAgICBpZiAoKGRvbnRDb252ZXJ0ICYmIGFycmF5MVtpXSAhPT0gYXJyYXkyW2ldKSB8fFxuICAgICAgICAgICAgICAgICghZG9udENvbnZlcnQgJiYgdG9JbnQoYXJyYXkxW2ldKSAhPT0gdG9JbnQoYXJyYXkyW2ldKSkpIHtcbiAgICAgICAgICAgICAgICBkaWZmcysrO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHJldHVybiBkaWZmcyArIGxlbmd0aERpZmY7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gbm9ybWFsaXplVW5pdHModW5pdHMpIHtcbiAgICAgICAgaWYgKHVuaXRzKSB7XG4gICAgICAgICAgICB2YXIgbG93ZXJlZCA9IHVuaXRzLnRvTG93ZXJDYXNlKCkucmVwbGFjZSgvKC4pcyQvLCAnJDEnKTtcbiAgICAgICAgICAgIHVuaXRzID0gdW5pdEFsaWFzZXNbdW5pdHNdIHx8IGNhbWVsRnVuY3Rpb25zW2xvd2VyZWRdIHx8IGxvd2VyZWQ7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHVuaXRzO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIG5vcm1hbGl6ZU9iamVjdFVuaXRzKGlucHV0T2JqZWN0KSB7XG4gICAgICAgIHZhciBub3JtYWxpemVkSW5wdXQgPSB7fSxcbiAgICAgICAgICAgIG5vcm1hbGl6ZWRQcm9wLFxuICAgICAgICAgICAgcHJvcDtcblxuICAgICAgICBmb3IgKHByb3AgaW4gaW5wdXRPYmplY3QpIHtcbiAgICAgICAgICAgIGlmIChoYXNPd25Qcm9wKGlucHV0T2JqZWN0LCBwcm9wKSkge1xuICAgICAgICAgICAgICAgIG5vcm1hbGl6ZWRQcm9wID0gbm9ybWFsaXplVW5pdHMocHJvcCk7XG4gICAgICAgICAgICAgICAgaWYgKG5vcm1hbGl6ZWRQcm9wKSB7XG4gICAgICAgICAgICAgICAgICAgIG5vcm1hbGl6ZWRJbnB1dFtub3JtYWxpemVkUHJvcF0gPSBpbnB1dE9iamVjdFtwcm9wXTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gbm9ybWFsaXplZElucHV0O1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIG1ha2VMaXN0KGZpZWxkKSB7XG4gICAgICAgIHZhciBjb3VudCwgc2V0dGVyO1xuXG4gICAgICAgIGlmIChmaWVsZC5pbmRleE9mKCd3ZWVrJykgPT09IDApIHtcbiAgICAgICAgICAgIGNvdW50ID0gNztcbiAgICAgICAgICAgIHNldHRlciA9ICdkYXknO1xuICAgICAgICB9XG4gICAgICAgIGVsc2UgaWYgKGZpZWxkLmluZGV4T2YoJ21vbnRoJykgPT09IDApIHtcbiAgICAgICAgICAgIGNvdW50ID0gMTI7XG4gICAgICAgICAgICBzZXR0ZXIgPSAnbW9udGgnO1xuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgbW9tZW50W2ZpZWxkXSA9IGZ1bmN0aW9uIChmb3JtYXQsIGluZGV4KSB7XG4gICAgICAgICAgICB2YXIgaSwgZ2V0dGVyLFxuICAgICAgICAgICAgICAgIG1ldGhvZCA9IG1vbWVudC5fbG9jYWxlW2ZpZWxkXSxcbiAgICAgICAgICAgICAgICByZXN1bHRzID0gW107XG5cbiAgICAgICAgICAgIGlmICh0eXBlb2YgZm9ybWF0ID09PSAnbnVtYmVyJykge1xuICAgICAgICAgICAgICAgIGluZGV4ID0gZm9ybWF0O1xuICAgICAgICAgICAgICAgIGZvcm1hdCA9IHVuZGVmaW5lZDtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgZ2V0dGVyID0gZnVuY3Rpb24gKGkpIHtcbiAgICAgICAgICAgICAgICB2YXIgbSA9IG1vbWVudCgpLnV0YygpLnNldChzZXR0ZXIsIGkpO1xuICAgICAgICAgICAgICAgIHJldHVybiBtZXRob2QuY2FsbChtb21lbnQuX2xvY2FsZSwgbSwgZm9ybWF0IHx8ICcnKTtcbiAgICAgICAgICAgIH07XG5cbiAgICAgICAgICAgIGlmIChpbmRleCAhPSBudWxsKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGdldHRlcihpbmRleCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICBmb3IgKGkgPSAwOyBpIDwgY291bnQ7IGkrKykge1xuICAgICAgICAgICAgICAgICAgICByZXN1bHRzLnB1c2goZ2V0dGVyKGkpKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgcmV0dXJuIHJlc3VsdHM7XG4gICAgICAgICAgICB9XG4gICAgICAgIH07XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gdG9JbnQoYXJndW1lbnRGb3JDb2VyY2lvbikge1xuICAgICAgICB2YXIgY29lcmNlZE51bWJlciA9ICthcmd1bWVudEZvckNvZXJjaW9uLFxuICAgICAgICAgICAgdmFsdWUgPSAwO1xuXG4gICAgICAgIGlmIChjb2VyY2VkTnVtYmVyICE9PSAwICYmIGlzRmluaXRlKGNvZXJjZWROdW1iZXIpKSB7XG4gICAgICAgICAgICBpZiAoY29lcmNlZE51bWJlciA+PSAwKSB7XG4gICAgICAgICAgICAgICAgdmFsdWUgPSBNYXRoLmZsb29yKGNvZXJjZWROdW1iZXIpO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICB2YWx1ZSA9IE1hdGguY2VpbChjb2VyY2VkTnVtYmVyKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiB2YWx1ZTtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBkYXlzSW5Nb250aCh5ZWFyLCBtb250aCkge1xuICAgICAgICByZXR1cm4gbmV3IERhdGUoRGF0ZS5VVEMoeWVhciwgbW9udGggKyAxLCAwKSkuZ2V0VVRDRGF0ZSgpO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIHdlZWtzSW5ZZWFyKHllYXIsIGRvdywgZG95KSB7XG4gICAgICAgIHJldHVybiB3ZWVrT2ZZZWFyKG1vbWVudChbeWVhciwgMTEsIDMxICsgZG93IC0gZG95XSksIGRvdywgZG95KS53ZWVrO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIGRheXNJblllYXIoeWVhcikge1xuICAgICAgICByZXR1cm4gaXNMZWFwWWVhcih5ZWFyKSA/IDM2NiA6IDM2NTtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBpc0xlYXBZZWFyKHllYXIpIHtcbiAgICAgICAgcmV0dXJuICh5ZWFyICUgNCA9PT0gMCAmJiB5ZWFyICUgMTAwICE9PSAwKSB8fCB5ZWFyICUgNDAwID09PSAwO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIGNoZWNrT3ZlcmZsb3cobSkge1xuICAgICAgICB2YXIgb3ZlcmZsb3c7XG4gICAgICAgIGlmIChtLl9hICYmIG0uX3BmLm92ZXJmbG93ID09PSAtMikge1xuICAgICAgICAgICAgb3ZlcmZsb3cgPVxuICAgICAgICAgICAgICAgIG0uX2FbTU9OVEhdIDwgMCB8fCBtLl9hW01PTlRIXSA+IDExID8gTU9OVEggOlxuICAgICAgICAgICAgICAgIG0uX2FbREFURV0gPCAxIHx8IG0uX2FbREFURV0gPiBkYXlzSW5Nb250aChtLl9hW1lFQVJdLCBtLl9hW01PTlRIXSkgPyBEQVRFIDpcbiAgICAgICAgICAgICAgICBtLl9hW0hPVVJdIDwgMCB8fCBtLl9hW0hPVVJdID4gMjMgPyBIT1VSIDpcbiAgICAgICAgICAgICAgICBtLl9hW01JTlVURV0gPCAwIHx8IG0uX2FbTUlOVVRFXSA+IDU5ID8gTUlOVVRFIDpcbiAgICAgICAgICAgICAgICBtLl9hW1NFQ09ORF0gPCAwIHx8IG0uX2FbU0VDT05EXSA+IDU5ID8gU0VDT05EIDpcbiAgICAgICAgICAgICAgICBtLl9hW01JTExJU0VDT05EXSA8IDAgfHwgbS5fYVtNSUxMSVNFQ09ORF0gPiA5OTkgPyBNSUxMSVNFQ09ORCA6XG4gICAgICAgICAgICAgICAgLTE7XG5cbiAgICAgICAgICAgIGlmIChtLl9wZi5fb3ZlcmZsb3dEYXlPZlllYXIgJiYgKG92ZXJmbG93IDwgWUVBUiB8fCBvdmVyZmxvdyA+IERBVEUpKSB7XG4gICAgICAgICAgICAgICAgb3ZlcmZsb3cgPSBEQVRFO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBtLl9wZi5vdmVyZmxvdyA9IG92ZXJmbG93O1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gaXNWYWxpZChtKSB7XG4gICAgICAgIGlmIChtLl9pc1ZhbGlkID09IG51bGwpIHtcbiAgICAgICAgICAgIG0uX2lzVmFsaWQgPSAhaXNOYU4obS5fZC5nZXRUaW1lKCkpICYmXG4gICAgICAgICAgICAgICAgbS5fcGYub3ZlcmZsb3cgPCAwICYmXG4gICAgICAgICAgICAgICAgIW0uX3BmLmVtcHR5ICYmXG4gICAgICAgICAgICAgICAgIW0uX3BmLmludmFsaWRNb250aCAmJlxuICAgICAgICAgICAgICAgICFtLl9wZi5udWxsSW5wdXQgJiZcbiAgICAgICAgICAgICAgICAhbS5fcGYuaW52YWxpZEZvcm1hdCAmJlxuICAgICAgICAgICAgICAgICFtLl9wZi51c2VySW52YWxpZGF0ZWQ7XG5cbiAgICAgICAgICAgIGlmIChtLl9zdHJpY3QpIHtcbiAgICAgICAgICAgICAgICBtLl9pc1ZhbGlkID0gbS5faXNWYWxpZCAmJlxuICAgICAgICAgICAgICAgICAgICBtLl9wZi5jaGFyc0xlZnRPdmVyID09PSAwICYmXG4gICAgICAgICAgICAgICAgICAgIG0uX3BmLnVudXNlZFRva2Vucy5sZW5ndGggPT09IDA7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIG0uX2lzVmFsaWQ7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gbm9ybWFsaXplTG9jYWxlKGtleSkge1xuICAgICAgICByZXR1cm4ga2V5ID8ga2V5LnRvTG93ZXJDYXNlKCkucmVwbGFjZSgnXycsICctJykgOiBrZXk7XG4gICAgfVxuXG4gICAgLy8gcGljayB0aGUgbG9jYWxlIGZyb20gdGhlIGFycmF5XG4gICAgLy8gdHJ5IFsnZW4tYXUnLCAnZW4tZ2InXSBhcyAnZW4tYXUnLCAnZW4tZ2InLCAnZW4nLCBhcyBpbiBtb3ZlIHRocm91Z2ggdGhlIGxpc3QgdHJ5aW5nIGVhY2hcbiAgICAvLyBzdWJzdHJpbmcgZnJvbSBtb3N0IHNwZWNpZmljIHRvIGxlYXN0LCBidXQgbW92ZSB0byB0aGUgbmV4dCBhcnJheSBpdGVtIGlmIGl0J3MgYSBtb3JlIHNwZWNpZmljIHZhcmlhbnQgdGhhbiB0aGUgY3VycmVudCByb290XG4gICAgZnVuY3Rpb24gY2hvb3NlTG9jYWxlKG5hbWVzKSB7XG4gICAgICAgIHZhciBpID0gMCwgaiwgbmV4dCwgbG9jYWxlLCBzcGxpdDtcblxuICAgICAgICB3aGlsZSAoaSA8IG5hbWVzLmxlbmd0aCkge1xuICAgICAgICAgICAgc3BsaXQgPSBub3JtYWxpemVMb2NhbGUobmFtZXNbaV0pLnNwbGl0KCctJyk7XG4gICAgICAgICAgICBqID0gc3BsaXQubGVuZ3RoO1xuICAgICAgICAgICAgbmV4dCA9IG5vcm1hbGl6ZUxvY2FsZShuYW1lc1tpICsgMV0pO1xuICAgICAgICAgICAgbmV4dCA9IG5leHQgPyBuZXh0LnNwbGl0KCctJykgOiBudWxsO1xuICAgICAgICAgICAgd2hpbGUgKGogPiAwKSB7XG4gICAgICAgICAgICAgICAgbG9jYWxlID0gbG9hZExvY2FsZShzcGxpdC5zbGljZSgwLCBqKS5qb2luKCctJykpO1xuICAgICAgICAgICAgICAgIGlmIChsb2NhbGUpIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGxvY2FsZTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgaWYgKG5leHQgJiYgbmV4dC5sZW5ndGggPj0gaiAmJiBjb21wYXJlQXJyYXlzKHNwbGl0LCBuZXh0LCB0cnVlKSA+PSBqIC0gMSkge1xuICAgICAgICAgICAgICAgICAgICAvL3RoZSBuZXh0IGFycmF5IGl0ZW0gaXMgYmV0dGVyIHRoYW4gYSBzaGFsbG93ZXIgc3Vic3RyaW5nIG9mIHRoaXMgb25lXG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBqLS07XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpKys7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gbG9hZExvY2FsZShuYW1lKSB7XG4gICAgICAgIHZhciBvbGRMb2NhbGUgPSBudWxsO1xuICAgICAgICBpZiAoIWxvY2FsZXNbbmFtZV0gJiYgaGFzTW9kdWxlKSB7XG4gICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgIG9sZExvY2FsZSA9IG1vbWVudC5sb2NhbGUoKTtcbiAgICAgICAgICAgICAgICByZXF1aXJlKCcuL2xvY2FsZS8nICsgbmFtZSk7XG4gICAgICAgICAgICAgICAgLy8gYmVjYXVzZSBkZWZpbmVMb2NhbGUgY3VycmVudGx5IGFsc28gc2V0cyB0aGUgZ2xvYmFsIGxvY2FsZSwgd2Ugd2FudCB0byB1bmRvIHRoYXQgZm9yIGxhenkgbG9hZGVkIGxvY2FsZXNcbiAgICAgICAgICAgICAgICBtb21lbnQubG9jYWxlKG9sZExvY2FsZSk7XG4gICAgICAgICAgICB9IGNhdGNoIChlKSB7IH1cbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gbG9jYWxlc1tuYW1lXTtcbiAgICB9XG5cbiAgICAvLyBSZXR1cm4gYSBtb21lbnQgZnJvbSBpbnB1dCwgdGhhdCBpcyBsb2NhbC91dGMvem9uZSBlcXVpdmFsZW50IHRvIG1vZGVsLlxuICAgIGZ1bmN0aW9uIG1ha2VBcyhpbnB1dCwgbW9kZWwpIHtcbiAgICAgICAgcmV0dXJuIG1vZGVsLl9pc1VUQyA/IG1vbWVudChpbnB1dCkuem9uZShtb2RlbC5fb2Zmc2V0IHx8IDApIDpcbiAgICAgICAgICAgIG1vbWVudChpbnB1dCkubG9jYWwoKTtcbiAgICB9XG5cbiAgICAvKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqXG4gICAgICAgIExvY2FsZVxuICAgICoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKi9cblxuXG4gICAgZXh0ZW5kKExvY2FsZS5wcm90b3R5cGUsIHtcblxuICAgICAgICBzZXQgOiBmdW5jdGlvbiAoY29uZmlnKSB7XG4gICAgICAgICAgICB2YXIgcHJvcCwgaTtcbiAgICAgICAgICAgIGZvciAoaSBpbiBjb25maWcpIHtcbiAgICAgICAgICAgICAgICBwcm9wID0gY29uZmlnW2ldO1xuICAgICAgICAgICAgICAgIGlmICh0eXBlb2YgcHJvcCA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgICAgICAgICAgICAgICB0aGlzW2ldID0gcHJvcDtcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICB0aGlzWydfJyArIGldID0gcHJvcDtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH0sXG5cbiAgICAgICAgX21vbnRocyA6ICdKYW51YXJ5X0ZlYnJ1YXJ5X01hcmNoX0FwcmlsX01heV9KdW5lX0p1bHlfQXVndXN0X1NlcHRlbWJlcl9PY3RvYmVyX05vdmVtYmVyX0RlY2VtYmVyJy5zcGxpdCgnXycpLFxuICAgICAgICBtb250aHMgOiBmdW5jdGlvbiAobSkge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMuX21vbnRoc1ttLm1vbnRoKCldO1xuICAgICAgICB9LFxuXG4gICAgICAgIF9tb250aHNTaG9ydCA6ICdKYW5fRmViX01hcl9BcHJfTWF5X0p1bl9KdWxfQXVnX1NlcF9PY3RfTm92X0RlYycuc3BsaXQoJ18nKSxcbiAgICAgICAgbW9udGhzU2hvcnQgOiBmdW5jdGlvbiAobSkge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMuX21vbnRoc1Nob3J0W20ubW9udGgoKV07XG4gICAgICAgIH0sXG5cbiAgICAgICAgbW9udGhzUGFyc2UgOiBmdW5jdGlvbiAobW9udGhOYW1lKSB7XG4gICAgICAgICAgICB2YXIgaSwgbW9tLCByZWdleDtcblxuICAgICAgICAgICAgaWYgKCF0aGlzLl9tb250aHNQYXJzZSkge1xuICAgICAgICAgICAgICAgIHRoaXMuX21vbnRoc1BhcnNlID0gW107XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGZvciAoaSA9IDA7IGkgPCAxMjsgaSsrKSB7XG4gICAgICAgICAgICAgICAgLy8gbWFrZSB0aGUgcmVnZXggaWYgd2UgZG9uJ3QgaGF2ZSBpdCBhbHJlYWR5XG4gICAgICAgICAgICAgICAgaWYgKCF0aGlzLl9tb250aHNQYXJzZVtpXSkge1xuICAgICAgICAgICAgICAgICAgICBtb20gPSBtb21lbnQudXRjKFsyMDAwLCBpXSk7XG4gICAgICAgICAgICAgICAgICAgIHJlZ2V4ID0gJ14nICsgdGhpcy5tb250aHMobW9tLCAnJykgKyAnfF4nICsgdGhpcy5tb250aHNTaG9ydChtb20sICcnKTtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5fbW9udGhzUGFyc2VbaV0gPSBuZXcgUmVnRXhwKHJlZ2V4LnJlcGxhY2UoJy4nLCAnJyksICdpJyk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIC8vIHRlc3QgdGhlIHJlZ2V4XG4gICAgICAgICAgICAgICAgaWYgKHRoaXMuX21vbnRoc1BhcnNlW2ldLnRlc3QobW9udGhOYW1lKSkge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gaTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH0sXG5cbiAgICAgICAgX3dlZWtkYXlzIDogJ1N1bmRheV9Nb25kYXlfVHVlc2RheV9XZWRuZXNkYXlfVGh1cnNkYXlfRnJpZGF5X1NhdHVyZGF5Jy5zcGxpdCgnXycpLFxuICAgICAgICB3ZWVrZGF5cyA6IGZ1bmN0aW9uIChtKSB7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5fd2Vla2RheXNbbS5kYXkoKV07XG4gICAgICAgIH0sXG5cbiAgICAgICAgX3dlZWtkYXlzU2hvcnQgOiAnU3VuX01vbl9UdWVfV2VkX1RodV9GcmlfU2F0Jy5zcGxpdCgnXycpLFxuICAgICAgICB3ZWVrZGF5c1Nob3J0IDogZnVuY3Rpb24gKG0pIHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLl93ZWVrZGF5c1Nob3J0W20uZGF5KCldO1xuICAgICAgICB9LFxuXG4gICAgICAgIF93ZWVrZGF5c01pbiA6ICdTdV9Nb19UdV9XZV9UaF9Gcl9TYScuc3BsaXQoJ18nKSxcbiAgICAgICAgd2Vla2RheXNNaW4gOiBmdW5jdGlvbiAobSkge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMuX3dlZWtkYXlzTWluW20uZGF5KCldO1xuICAgICAgICB9LFxuXG4gICAgICAgIHdlZWtkYXlzUGFyc2UgOiBmdW5jdGlvbiAod2Vla2RheU5hbWUpIHtcbiAgICAgICAgICAgIHZhciBpLCBtb20sIHJlZ2V4O1xuXG4gICAgICAgICAgICBpZiAoIXRoaXMuX3dlZWtkYXlzUGFyc2UpIHtcbiAgICAgICAgICAgICAgICB0aGlzLl93ZWVrZGF5c1BhcnNlID0gW107XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGZvciAoaSA9IDA7IGkgPCA3OyBpKyspIHtcbiAgICAgICAgICAgICAgICAvLyBtYWtlIHRoZSByZWdleCBpZiB3ZSBkb24ndCBoYXZlIGl0IGFscmVhZHlcbiAgICAgICAgICAgICAgICBpZiAoIXRoaXMuX3dlZWtkYXlzUGFyc2VbaV0pIHtcbiAgICAgICAgICAgICAgICAgICAgbW9tID0gbW9tZW50KFsyMDAwLCAxXSkuZGF5KGkpO1xuICAgICAgICAgICAgICAgICAgICByZWdleCA9ICdeJyArIHRoaXMud2Vla2RheXMobW9tLCAnJykgKyAnfF4nICsgdGhpcy53ZWVrZGF5c1Nob3J0KG1vbSwgJycpICsgJ3xeJyArIHRoaXMud2Vla2RheXNNaW4obW9tLCAnJyk7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuX3dlZWtkYXlzUGFyc2VbaV0gPSBuZXcgUmVnRXhwKHJlZ2V4LnJlcGxhY2UoJy4nLCAnJyksICdpJyk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIC8vIHRlc3QgdGhlIHJlZ2V4XG4gICAgICAgICAgICAgICAgaWYgKHRoaXMuX3dlZWtkYXlzUGFyc2VbaV0udGVzdCh3ZWVrZGF5TmFtZSkpIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9LFxuXG4gICAgICAgIF9sb25nRGF0ZUZvcm1hdCA6IHtcbiAgICAgICAgICAgIExUIDogJ2g6bW0gQScsXG4gICAgICAgICAgICBMIDogJ01NL0REL1lZWVknLFxuICAgICAgICAgICAgTEwgOiAnTU1NTSBELCBZWVlZJyxcbiAgICAgICAgICAgIExMTCA6ICdNTU1NIEQsIFlZWVkgTFQnLFxuICAgICAgICAgICAgTExMTCA6ICdkZGRkLCBNTU1NIEQsIFlZWVkgTFQnXG4gICAgICAgIH0sXG4gICAgICAgIGxvbmdEYXRlRm9ybWF0IDogZnVuY3Rpb24gKGtleSkge1xuICAgICAgICAgICAgdmFyIG91dHB1dCA9IHRoaXMuX2xvbmdEYXRlRm9ybWF0W2tleV07XG4gICAgICAgICAgICBpZiAoIW91dHB1dCAmJiB0aGlzLl9sb25nRGF0ZUZvcm1hdFtrZXkudG9VcHBlckNhc2UoKV0pIHtcbiAgICAgICAgICAgICAgICBvdXRwdXQgPSB0aGlzLl9sb25nRGF0ZUZvcm1hdFtrZXkudG9VcHBlckNhc2UoKV0ucmVwbGFjZSgvTU1NTXxNTXxERHxkZGRkL2csIGZ1bmN0aW9uICh2YWwpIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHZhbC5zbGljZSgxKTtcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICB0aGlzLl9sb25nRGF0ZUZvcm1hdFtrZXldID0gb3V0cHV0O1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIG91dHB1dDtcbiAgICAgICAgfSxcblxuICAgICAgICBpc1BNIDogZnVuY3Rpb24gKGlucHV0KSB7XG4gICAgICAgICAgICAvLyBJRTggUXVpcmtzIE1vZGUgJiBJRTcgU3RhbmRhcmRzIE1vZGUgZG8gbm90IGFsbG93IGFjY2Vzc2luZyBzdHJpbmdzIGxpa2UgYXJyYXlzXG4gICAgICAgICAgICAvLyBVc2luZyBjaGFyQXQgc2hvdWxkIGJlIG1vcmUgY29tcGF0aWJsZS5cbiAgICAgICAgICAgIHJldHVybiAoKGlucHV0ICsgJycpLnRvTG93ZXJDYXNlKCkuY2hhckF0KDApID09PSAncCcpO1xuICAgICAgICB9LFxuXG4gICAgICAgIF9tZXJpZGllbVBhcnNlIDogL1thcF1cXC4/bT9cXC4/L2ksXG4gICAgICAgIG1lcmlkaWVtIDogZnVuY3Rpb24gKGhvdXJzLCBtaW51dGVzLCBpc0xvd2VyKSB7XG4gICAgICAgICAgICBpZiAoaG91cnMgPiAxMSkge1xuICAgICAgICAgICAgICAgIHJldHVybiBpc0xvd2VyID8gJ3BtJyA6ICdQTSc7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIHJldHVybiBpc0xvd2VyID8gJ2FtJyA6ICdBTSc7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0sXG5cbiAgICAgICAgX2NhbGVuZGFyIDoge1xuICAgICAgICAgICAgc2FtZURheSA6ICdbVG9kYXkgYXRdIExUJyxcbiAgICAgICAgICAgIG5leHREYXkgOiAnW1RvbW9ycm93IGF0XSBMVCcsXG4gICAgICAgICAgICBuZXh0V2VlayA6ICdkZGRkIFthdF0gTFQnLFxuICAgICAgICAgICAgbGFzdERheSA6ICdbWWVzdGVyZGF5IGF0XSBMVCcsXG4gICAgICAgICAgICBsYXN0V2VlayA6ICdbTGFzdF0gZGRkZCBbYXRdIExUJyxcbiAgICAgICAgICAgIHNhbWVFbHNlIDogJ0wnXG4gICAgICAgIH0sXG4gICAgICAgIGNhbGVuZGFyIDogZnVuY3Rpb24gKGtleSwgbW9tKSB7XG4gICAgICAgICAgICB2YXIgb3V0cHV0ID0gdGhpcy5fY2FsZW5kYXJba2V5XTtcbiAgICAgICAgICAgIHJldHVybiB0eXBlb2Ygb3V0cHV0ID09PSAnZnVuY3Rpb24nID8gb3V0cHV0LmFwcGx5KG1vbSkgOiBvdXRwdXQ7XG4gICAgICAgIH0sXG5cbiAgICAgICAgX3JlbGF0aXZlVGltZSA6IHtcbiAgICAgICAgICAgIGZ1dHVyZSA6ICdpbiAlcycsXG4gICAgICAgICAgICBwYXN0IDogJyVzIGFnbycsXG4gICAgICAgICAgICBzIDogJ2EgZmV3IHNlY29uZHMnLFxuICAgICAgICAgICAgbSA6ICdhIG1pbnV0ZScsXG4gICAgICAgICAgICBtbSA6ICclZCBtaW51dGVzJyxcbiAgICAgICAgICAgIGggOiAnYW4gaG91cicsXG4gICAgICAgICAgICBoaCA6ICclZCBob3VycycsXG4gICAgICAgICAgICBkIDogJ2EgZGF5JyxcbiAgICAgICAgICAgIGRkIDogJyVkIGRheXMnLFxuICAgICAgICAgICAgTSA6ICdhIG1vbnRoJyxcbiAgICAgICAgICAgIE1NIDogJyVkIG1vbnRocycsXG4gICAgICAgICAgICB5IDogJ2EgeWVhcicsXG4gICAgICAgICAgICB5eSA6ICclZCB5ZWFycydcbiAgICAgICAgfSxcblxuICAgICAgICByZWxhdGl2ZVRpbWUgOiBmdW5jdGlvbiAobnVtYmVyLCB3aXRob3V0U3VmZml4LCBzdHJpbmcsIGlzRnV0dXJlKSB7XG4gICAgICAgICAgICB2YXIgb3V0cHV0ID0gdGhpcy5fcmVsYXRpdmVUaW1lW3N0cmluZ107XG4gICAgICAgICAgICByZXR1cm4gKHR5cGVvZiBvdXRwdXQgPT09ICdmdW5jdGlvbicpID9cbiAgICAgICAgICAgICAgICBvdXRwdXQobnVtYmVyLCB3aXRob3V0U3VmZml4LCBzdHJpbmcsIGlzRnV0dXJlKSA6XG4gICAgICAgICAgICAgICAgb3V0cHV0LnJlcGxhY2UoLyVkL2ksIG51bWJlcik7XG4gICAgICAgIH0sXG5cbiAgICAgICAgcGFzdEZ1dHVyZSA6IGZ1bmN0aW9uIChkaWZmLCBvdXRwdXQpIHtcbiAgICAgICAgICAgIHZhciBmb3JtYXQgPSB0aGlzLl9yZWxhdGl2ZVRpbWVbZGlmZiA+IDAgPyAnZnV0dXJlJyA6ICdwYXN0J107XG4gICAgICAgICAgICByZXR1cm4gdHlwZW9mIGZvcm1hdCA9PT0gJ2Z1bmN0aW9uJyA/IGZvcm1hdChvdXRwdXQpIDogZm9ybWF0LnJlcGxhY2UoLyVzL2ksIG91dHB1dCk7XG4gICAgICAgIH0sXG5cbiAgICAgICAgb3JkaW5hbCA6IGZ1bmN0aW9uIChudW1iZXIpIHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLl9vcmRpbmFsLnJlcGxhY2UoJyVkJywgbnVtYmVyKTtcbiAgICAgICAgfSxcbiAgICAgICAgX29yZGluYWwgOiAnJWQnLFxuXG4gICAgICAgIHByZXBhcnNlIDogZnVuY3Rpb24gKHN0cmluZykge1xuICAgICAgICAgICAgcmV0dXJuIHN0cmluZztcbiAgICAgICAgfSxcblxuICAgICAgICBwb3N0Zm9ybWF0IDogZnVuY3Rpb24gKHN0cmluZykge1xuICAgICAgICAgICAgcmV0dXJuIHN0cmluZztcbiAgICAgICAgfSxcblxuICAgICAgICB3ZWVrIDogZnVuY3Rpb24gKG1vbSkge1xuICAgICAgICAgICAgcmV0dXJuIHdlZWtPZlllYXIobW9tLCB0aGlzLl93ZWVrLmRvdywgdGhpcy5fd2Vlay5kb3kpLndlZWs7XG4gICAgICAgIH0sXG5cbiAgICAgICAgX3dlZWsgOiB7XG4gICAgICAgICAgICBkb3cgOiAwLCAvLyBTdW5kYXkgaXMgdGhlIGZpcnN0IGRheSBvZiB0aGUgd2Vlay5cbiAgICAgICAgICAgIGRveSA6IDYgIC8vIFRoZSB3ZWVrIHRoYXQgY29udGFpbnMgSmFuIDFzdCBpcyB0aGUgZmlyc3Qgd2VlayBvZiB0aGUgeWVhci5cbiAgICAgICAgfSxcblxuICAgICAgICBfaW52YWxpZERhdGU6ICdJbnZhbGlkIGRhdGUnLFxuICAgICAgICBpbnZhbGlkRGF0ZTogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMuX2ludmFsaWREYXRlO1xuICAgICAgICB9XG4gICAgfSk7XG5cbiAgICAvKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqXG4gICAgICAgIEZvcm1hdHRpbmdcbiAgICAqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKiovXG5cblxuICAgIGZ1bmN0aW9uIHJlbW92ZUZvcm1hdHRpbmdUb2tlbnMoaW5wdXQpIHtcbiAgICAgICAgaWYgKGlucHV0Lm1hdGNoKC9cXFtbXFxzXFxTXS8pKSB7XG4gICAgICAgICAgICByZXR1cm4gaW5wdXQucmVwbGFjZSgvXlxcW3xcXF0kL2csICcnKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gaW5wdXQucmVwbGFjZSgvXFxcXC9nLCAnJyk7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gbWFrZUZvcm1hdEZ1bmN0aW9uKGZvcm1hdCkge1xuICAgICAgICB2YXIgYXJyYXkgPSBmb3JtYXQubWF0Y2goZm9ybWF0dGluZ1Rva2VucyksIGksIGxlbmd0aDtcblxuICAgICAgICBmb3IgKGkgPSAwLCBsZW5ndGggPSBhcnJheS5sZW5ndGg7IGkgPCBsZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgaWYgKGZvcm1hdFRva2VuRnVuY3Rpb25zW2FycmF5W2ldXSkge1xuICAgICAgICAgICAgICAgIGFycmF5W2ldID0gZm9ybWF0VG9rZW5GdW5jdGlvbnNbYXJyYXlbaV1dO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBhcnJheVtpXSA9IHJlbW92ZUZvcm1hdHRpbmdUb2tlbnMoYXJyYXlbaV0pO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIGZ1bmN0aW9uIChtb20pIHtcbiAgICAgICAgICAgIHZhciBvdXRwdXQgPSAnJztcbiAgICAgICAgICAgIGZvciAoaSA9IDA7IGkgPCBsZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgICAgIG91dHB1dCArPSBhcnJheVtpXSBpbnN0YW5jZW9mIEZ1bmN0aW9uID8gYXJyYXlbaV0uY2FsbChtb20sIGZvcm1hdCkgOiBhcnJheVtpXTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiBvdXRwdXQ7XG4gICAgICAgIH07XG4gICAgfVxuXG4gICAgLy8gZm9ybWF0IGRhdGUgdXNpbmcgbmF0aXZlIGRhdGUgb2JqZWN0XG4gICAgZnVuY3Rpb24gZm9ybWF0TW9tZW50KG0sIGZvcm1hdCkge1xuICAgICAgICBpZiAoIW0uaXNWYWxpZCgpKSB7XG4gICAgICAgICAgICByZXR1cm4gbS5sb2NhbGVEYXRhKCkuaW52YWxpZERhdGUoKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGZvcm1hdCA9IGV4cGFuZEZvcm1hdChmb3JtYXQsIG0ubG9jYWxlRGF0YSgpKTtcblxuICAgICAgICBpZiAoIWZvcm1hdEZ1bmN0aW9uc1tmb3JtYXRdKSB7XG4gICAgICAgICAgICBmb3JtYXRGdW5jdGlvbnNbZm9ybWF0XSA9IG1ha2VGb3JtYXRGdW5jdGlvbihmb3JtYXQpO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIGZvcm1hdEZ1bmN0aW9uc1tmb3JtYXRdKG0pO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIGV4cGFuZEZvcm1hdChmb3JtYXQsIGxvY2FsZSkge1xuICAgICAgICB2YXIgaSA9IDU7XG5cbiAgICAgICAgZnVuY3Rpb24gcmVwbGFjZUxvbmdEYXRlRm9ybWF0VG9rZW5zKGlucHV0KSB7XG4gICAgICAgICAgICByZXR1cm4gbG9jYWxlLmxvbmdEYXRlRm9ybWF0KGlucHV0KSB8fCBpbnB1dDtcbiAgICAgICAgfVxuXG4gICAgICAgIGxvY2FsRm9ybWF0dGluZ1Rva2Vucy5sYXN0SW5kZXggPSAwO1xuICAgICAgICB3aGlsZSAoaSA+PSAwICYmIGxvY2FsRm9ybWF0dGluZ1Rva2Vucy50ZXN0KGZvcm1hdCkpIHtcbiAgICAgICAgICAgIGZvcm1hdCA9IGZvcm1hdC5yZXBsYWNlKGxvY2FsRm9ybWF0dGluZ1Rva2VucywgcmVwbGFjZUxvbmdEYXRlRm9ybWF0VG9rZW5zKTtcbiAgICAgICAgICAgIGxvY2FsRm9ybWF0dGluZ1Rva2Vucy5sYXN0SW5kZXggPSAwO1xuICAgICAgICAgICAgaSAtPSAxO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIGZvcm1hdDtcbiAgICB9XG5cblxuICAgIC8qKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKipcbiAgICAgICAgUGFyc2luZ1xuICAgICoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKi9cblxuXG4gICAgLy8gZ2V0IHRoZSByZWdleCB0byBmaW5kIHRoZSBuZXh0IHRva2VuXG4gICAgZnVuY3Rpb24gZ2V0UGFyc2VSZWdleEZvclRva2VuKHRva2VuLCBjb25maWcpIHtcbiAgICAgICAgdmFyIGEsIHN0cmljdCA9IGNvbmZpZy5fc3RyaWN0O1xuICAgICAgICBzd2l0Y2ggKHRva2VuKSB7XG4gICAgICAgIGNhc2UgJ1EnOlxuICAgICAgICAgICAgcmV0dXJuIHBhcnNlVG9rZW5PbmVEaWdpdDtcbiAgICAgICAgY2FzZSAnRERERCc6XG4gICAgICAgICAgICByZXR1cm4gcGFyc2VUb2tlblRocmVlRGlnaXRzO1xuICAgICAgICBjYXNlICdZWVlZJzpcbiAgICAgICAgY2FzZSAnR0dHRyc6XG4gICAgICAgIGNhc2UgJ2dnZ2cnOlxuICAgICAgICAgICAgcmV0dXJuIHN0cmljdCA/IHBhcnNlVG9rZW5Gb3VyRGlnaXRzIDogcGFyc2VUb2tlbk9uZVRvRm91ckRpZ2l0cztcbiAgICAgICAgY2FzZSAnWSc6XG4gICAgICAgIGNhc2UgJ0cnOlxuICAgICAgICBjYXNlICdnJzpcbiAgICAgICAgICAgIHJldHVybiBwYXJzZVRva2VuU2lnbmVkTnVtYmVyO1xuICAgICAgICBjYXNlICdZWVlZWVknOlxuICAgICAgICBjYXNlICdZWVlZWSc6XG4gICAgICAgIGNhc2UgJ0dHR0dHJzpcbiAgICAgICAgY2FzZSAnZ2dnZ2cnOlxuICAgICAgICAgICAgcmV0dXJuIHN0cmljdCA/IHBhcnNlVG9rZW5TaXhEaWdpdHMgOiBwYXJzZVRva2VuT25lVG9TaXhEaWdpdHM7XG4gICAgICAgIGNhc2UgJ1MnOlxuICAgICAgICAgICAgaWYgKHN0cmljdCkge1xuICAgICAgICAgICAgICAgIHJldHVybiBwYXJzZVRva2VuT25lRGlnaXQ7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICAvKiBmYWxscyB0aHJvdWdoICovXG4gICAgICAgIGNhc2UgJ1NTJzpcbiAgICAgICAgICAgIGlmIChzdHJpY3QpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gcGFyc2VUb2tlblR3b0RpZ2l0cztcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIC8qIGZhbGxzIHRocm91Z2ggKi9cbiAgICAgICAgY2FzZSAnU1NTJzpcbiAgICAgICAgICAgIGlmIChzdHJpY3QpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gcGFyc2VUb2tlblRocmVlRGlnaXRzO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgLyogZmFsbHMgdGhyb3VnaCAqL1xuICAgICAgICBjYXNlICdEREQnOlxuICAgICAgICAgICAgcmV0dXJuIHBhcnNlVG9rZW5PbmVUb1RocmVlRGlnaXRzO1xuICAgICAgICBjYXNlICdNTU0nOlxuICAgICAgICBjYXNlICdNTU1NJzpcbiAgICAgICAgY2FzZSAnZGQnOlxuICAgICAgICBjYXNlICdkZGQnOlxuICAgICAgICBjYXNlICdkZGRkJzpcbiAgICAgICAgICAgIHJldHVybiBwYXJzZVRva2VuV29yZDtcbiAgICAgICAgY2FzZSAnYSc6XG4gICAgICAgIGNhc2UgJ0EnOlxuICAgICAgICAgICAgcmV0dXJuIGNvbmZpZy5fbG9jYWxlLl9tZXJpZGllbVBhcnNlO1xuICAgICAgICBjYXNlICdYJzpcbiAgICAgICAgICAgIHJldHVybiBwYXJzZVRva2VuVGltZXN0YW1wTXM7XG4gICAgICAgIGNhc2UgJ1onOlxuICAgICAgICBjYXNlICdaWic6XG4gICAgICAgICAgICByZXR1cm4gcGFyc2VUb2tlblRpbWV6b25lO1xuICAgICAgICBjYXNlICdUJzpcbiAgICAgICAgICAgIHJldHVybiBwYXJzZVRva2VuVDtcbiAgICAgICAgY2FzZSAnU1NTUyc6XG4gICAgICAgICAgICByZXR1cm4gcGFyc2VUb2tlbkRpZ2l0cztcbiAgICAgICAgY2FzZSAnTU0nOlxuICAgICAgICBjYXNlICdERCc6XG4gICAgICAgIGNhc2UgJ1lZJzpcbiAgICAgICAgY2FzZSAnR0cnOlxuICAgICAgICBjYXNlICdnZyc6XG4gICAgICAgIGNhc2UgJ0hIJzpcbiAgICAgICAgY2FzZSAnaGgnOlxuICAgICAgICBjYXNlICdtbSc6XG4gICAgICAgIGNhc2UgJ3NzJzpcbiAgICAgICAgY2FzZSAnd3cnOlxuICAgICAgICBjYXNlICdXVyc6XG4gICAgICAgICAgICByZXR1cm4gc3RyaWN0ID8gcGFyc2VUb2tlblR3b0RpZ2l0cyA6IHBhcnNlVG9rZW5PbmVPclR3b0RpZ2l0cztcbiAgICAgICAgY2FzZSAnTSc6XG4gICAgICAgIGNhc2UgJ0QnOlxuICAgICAgICBjYXNlICdkJzpcbiAgICAgICAgY2FzZSAnSCc6XG4gICAgICAgIGNhc2UgJ2gnOlxuICAgICAgICBjYXNlICdtJzpcbiAgICAgICAgY2FzZSAncyc6XG4gICAgICAgIGNhc2UgJ3cnOlxuICAgICAgICBjYXNlICdXJzpcbiAgICAgICAgY2FzZSAnZSc6XG4gICAgICAgIGNhc2UgJ0UnOlxuICAgICAgICAgICAgcmV0dXJuIHBhcnNlVG9rZW5PbmVPclR3b0RpZ2l0cztcbiAgICAgICAgY2FzZSAnRG8nOlxuICAgICAgICAgICAgcmV0dXJuIHBhcnNlVG9rZW5PcmRpbmFsO1xuICAgICAgICBkZWZhdWx0IDpcbiAgICAgICAgICAgIGEgPSBuZXcgUmVnRXhwKHJlZ2V4cEVzY2FwZSh1bmVzY2FwZUZvcm1hdCh0b2tlbi5yZXBsYWNlKCdcXFxcJywgJycpKSwgJ2knKSk7XG4gICAgICAgICAgICByZXR1cm4gYTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIGZ1bmN0aW9uIHRpbWV6b25lTWludXRlc0Zyb21TdHJpbmcoc3RyaW5nKSB7XG4gICAgICAgIHN0cmluZyA9IHN0cmluZyB8fCAnJztcbiAgICAgICAgdmFyIHBvc3NpYmxlVHpNYXRjaGVzID0gKHN0cmluZy5tYXRjaChwYXJzZVRva2VuVGltZXpvbmUpIHx8IFtdKSxcbiAgICAgICAgICAgIHR6Q2h1bmsgPSBwb3NzaWJsZVR6TWF0Y2hlc1twb3NzaWJsZVR6TWF0Y2hlcy5sZW5ndGggLSAxXSB8fCBbXSxcbiAgICAgICAgICAgIHBhcnRzID0gKHR6Q2h1bmsgKyAnJykubWF0Y2gocGFyc2VUaW1lem9uZUNodW5rZXIpIHx8IFsnLScsIDAsIDBdLFxuICAgICAgICAgICAgbWludXRlcyA9ICsocGFydHNbMV0gKiA2MCkgKyB0b0ludChwYXJ0c1syXSk7XG5cbiAgICAgICAgcmV0dXJuIHBhcnRzWzBdID09PSAnKycgPyAtbWludXRlcyA6IG1pbnV0ZXM7XG4gICAgfVxuXG4gICAgLy8gZnVuY3Rpb24gdG8gY29udmVydCBzdHJpbmcgaW5wdXQgdG8gZGF0ZVxuICAgIGZ1bmN0aW9uIGFkZFRpbWVUb0FycmF5RnJvbVRva2VuKHRva2VuLCBpbnB1dCwgY29uZmlnKSB7XG4gICAgICAgIHZhciBhLCBkYXRlUGFydEFycmF5ID0gY29uZmlnLl9hO1xuXG4gICAgICAgIHN3aXRjaCAodG9rZW4pIHtcbiAgICAgICAgLy8gUVVBUlRFUlxuICAgICAgICBjYXNlICdRJzpcbiAgICAgICAgICAgIGlmIChpbnB1dCAhPSBudWxsKSB7XG4gICAgICAgICAgICAgICAgZGF0ZVBhcnRBcnJheVtNT05USF0gPSAodG9JbnQoaW5wdXQpIC0gMSkgKiAzO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIC8vIE1PTlRIXG4gICAgICAgIGNhc2UgJ00nIDogLy8gZmFsbCB0aHJvdWdoIHRvIE1NXG4gICAgICAgIGNhc2UgJ01NJyA6XG4gICAgICAgICAgICBpZiAoaW5wdXQgIT0gbnVsbCkge1xuICAgICAgICAgICAgICAgIGRhdGVQYXJ0QXJyYXlbTU9OVEhdID0gdG9JbnQoaW5wdXQpIC0gMTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlICdNTU0nIDogLy8gZmFsbCB0aHJvdWdoIHRvIE1NTU1cbiAgICAgICAgY2FzZSAnTU1NTScgOlxuICAgICAgICAgICAgYSA9IGNvbmZpZy5fbG9jYWxlLm1vbnRoc1BhcnNlKGlucHV0KTtcbiAgICAgICAgICAgIC8vIGlmIHdlIGRpZG4ndCBmaW5kIGEgbW9udGggbmFtZSwgbWFyayB0aGUgZGF0ZSBhcyBpbnZhbGlkLlxuICAgICAgICAgICAgaWYgKGEgIT0gbnVsbCkge1xuICAgICAgICAgICAgICAgIGRhdGVQYXJ0QXJyYXlbTU9OVEhdID0gYTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgY29uZmlnLl9wZi5pbnZhbGlkTW9udGggPSBpbnB1dDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAvLyBEQVkgT0YgTU9OVEhcbiAgICAgICAgY2FzZSAnRCcgOiAvLyBmYWxsIHRocm91Z2ggdG8gRERcbiAgICAgICAgY2FzZSAnREQnIDpcbiAgICAgICAgICAgIGlmIChpbnB1dCAhPSBudWxsKSB7XG4gICAgICAgICAgICAgICAgZGF0ZVBhcnRBcnJheVtEQVRFXSA9IHRvSW50KGlucHV0KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlICdEbycgOlxuICAgICAgICAgICAgaWYgKGlucHV0ICE9IG51bGwpIHtcbiAgICAgICAgICAgICAgICBkYXRlUGFydEFycmF5W0RBVEVdID0gdG9JbnQocGFyc2VJbnQoaW5wdXQsIDEwKSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgLy8gREFZIE9GIFlFQVJcbiAgICAgICAgY2FzZSAnREREJyA6IC8vIGZhbGwgdGhyb3VnaCB0byBEREREXG4gICAgICAgIGNhc2UgJ0REREQnIDpcbiAgICAgICAgICAgIGlmIChpbnB1dCAhPSBudWxsKSB7XG4gICAgICAgICAgICAgICAgY29uZmlnLl9kYXlPZlllYXIgPSB0b0ludChpbnB1dCk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAvLyBZRUFSXG4gICAgICAgIGNhc2UgJ1lZJyA6XG4gICAgICAgICAgICBkYXRlUGFydEFycmF5W1lFQVJdID0gbW9tZW50LnBhcnNlVHdvRGlnaXRZZWFyKGlucHV0KTtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlICdZWVlZJyA6XG4gICAgICAgIGNhc2UgJ1lZWVlZJyA6XG4gICAgICAgIGNhc2UgJ1lZWVlZWScgOlxuICAgICAgICAgICAgZGF0ZVBhcnRBcnJheVtZRUFSXSA9IHRvSW50KGlucHV0KTtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAvLyBBTSAvIFBNXG4gICAgICAgIGNhc2UgJ2EnIDogLy8gZmFsbCB0aHJvdWdoIHRvIEFcbiAgICAgICAgY2FzZSAnQScgOlxuICAgICAgICAgICAgY29uZmlnLl9pc1BtID0gY29uZmlnLl9sb2NhbGUuaXNQTShpbnB1dCk7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgLy8gMjQgSE9VUlxuICAgICAgICBjYXNlICdIJyA6IC8vIGZhbGwgdGhyb3VnaCB0byBoaFxuICAgICAgICBjYXNlICdISCcgOiAvLyBmYWxsIHRocm91Z2ggdG8gaGhcbiAgICAgICAgY2FzZSAnaCcgOiAvLyBmYWxsIHRocm91Z2ggdG8gaGhcbiAgICAgICAgY2FzZSAnaGgnIDpcbiAgICAgICAgICAgIGRhdGVQYXJ0QXJyYXlbSE9VUl0gPSB0b0ludChpbnB1dCk7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgLy8gTUlOVVRFXG4gICAgICAgIGNhc2UgJ20nIDogLy8gZmFsbCB0aHJvdWdoIHRvIG1tXG4gICAgICAgIGNhc2UgJ21tJyA6XG4gICAgICAgICAgICBkYXRlUGFydEFycmF5W01JTlVURV0gPSB0b0ludChpbnB1dCk7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgLy8gU0VDT05EXG4gICAgICAgIGNhc2UgJ3MnIDogLy8gZmFsbCB0aHJvdWdoIHRvIHNzXG4gICAgICAgIGNhc2UgJ3NzJyA6XG4gICAgICAgICAgICBkYXRlUGFydEFycmF5W1NFQ09ORF0gPSB0b0ludChpbnB1dCk7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgLy8gTUlMTElTRUNPTkRcbiAgICAgICAgY2FzZSAnUycgOlxuICAgICAgICBjYXNlICdTUycgOlxuICAgICAgICBjYXNlICdTU1MnIDpcbiAgICAgICAgY2FzZSAnU1NTUycgOlxuICAgICAgICAgICAgZGF0ZVBhcnRBcnJheVtNSUxMSVNFQ09ORF0gPSB0b0ludCgoJzAuJyArIGlucHV0KSAqIDEwMDApO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIC8vIFVOSVggVElNRVNUQU1QIFdJVEggTVNcbiAgICAgICAgY2FzZSAnWCc6XG4gICAgICAgICAgICBjb25maWcuX2QgPSBuZXcgRGF0ZShwYXJzZUZsb2F0KGlucHV0KSAqIDEwMDApO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIC8vIFRJTUVaT05FXG4gICAgICAgIGNhc2UgJ1onIDogLy8gZmFsbCB0aHJvdWdoIHRvIFpaXG4gICAgICAgIGNhc2UgJ1paJyA6XG4gICAgICAgICAgICBjb25maWcuX3VzZVVUQyA9IHRydWU7XG4gICAgICAgICAgICBjb25maWcuX3R6bSA9IHRpbWV6b25lTWludXRlc0Zyb21TdHJpbmcoaW5wdXQpO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIC8vIFdFRUtEQVkgLSBodW1hblxuICAgICAgICBjYXNlICdkZCc6XG4gICAgICAgIGNhc2UgJ2RkZCc6XG4gICAgICAgIGNhc2UgJ2RkZGQnOlxuICAgICAgICAgICAgYSA9IGNvbmZpZy5fbG9jYWxlLndlZWtkYXlzUGFyc2UoaW5wdXQpO1xuICAgICAgICAgICAgLy8gaWYgd2UgZGlkbid0IGdldCBhIHdlZWtkYXkgbmFtZSwgbWFyayB0aGUgZGF0ZSBhcyBpbnZhbGlkXG4gICAgICAgICAgICBpZiAoYSAhPSBudWxsKSB7XG4gICAgICAgICAgICAgICAgY29uZmlnLl93ID0gY29uZmlnLl93IHx8IHt9O1xuICAgICAgICAgICAgICAgIGNvbmZpZy5fd1snZCddID0gYTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgY29uZmlnLl9wZi5pbnZhbGlkV2Vla2RheSA9IGlucHV0O1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIC8vIFdFRUssIFdFRUsgREFZIC0gbnVtZXJpY1xuICAgICAgICBjYXNlICd3JzpcbiAgICAgICAgY2FzZSAnd3cnOlxuICAgICAgICBjYXNlICdXJzpcbiAgICAgICAgY2FzZSAnV1cnOlxuICAgICAgICBjYXNlICdkJzpcbiAgICAgICAgY2FzZSAnZSc6XG4gICAgICAgIGNhc2UgJ0UnOlxuICAgICAgICAgICAgdG9rZW4gPSB0b2tlbi5zdWJzdHIoMCwgMSk7XG4gICAgICAgICAgICAvKiBmYWxscyB0aHJvdWdoICovXG4gICAgICAgIGNhc2UgJ2dnZ2cnOlxuICAgICAgICBjYXNlICdHR0dHJzpcbiAgICAgICAgY2FzZSAnR0dHR0cnOlxuICAgICAgICAgICAgdG9rZW4gPSB0b2tlbi5zdWJzdHIoMCwgMik7XG4gICAgICAgICAgICBpZiAoaW5wdXQpIHtcbiAgICAgICAgICAgICAgICBjb25maWcuX3cgPSBjb25maWcuX3cgfHwge307XG4gICAgICAgICAgICAgICAgY29uZmlnLl93W3Rva2VuXSA9IHRvSW50KGlucHV0KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlICdnZyc6XG4gICAgICAgIGNhc2UgJ0dHJzpcbiAgICAgICAgICAgIGNvbmZpZy5fdyA9IGNvbmZpZy5fdyB8fCB7fTtcbiAgICAgICAgICAgIGNvbmZpZy5fd1t0b2tlbl0gPSBtb21lbnQucGFyc2VUd29EaWdpdFllYXIoaW5wdXQpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gZGF5T2ZZZWFyRnJvbVdlZWtJbmZvKGNvbmZpZykge1xuICAgICAgICB2YXIgdywgd2Vla1llYXIsIHdlZWssIHdlZWtkYXksIGRvdywgZG95LCB0ZW1wO1xuXG4gICAgICAgIHcgPSBjb25maWcuX3c7XG4gICAgICAgIGlmICh3LkdHICE9IG51bGwgfHwgdy5XICE9IG51bGwgfHwgdy5FICE9IG51bGwpIHtcbiAgICAgICAgICAgIGRvdyA9IDE7XG4gICAgICAgICAgICBkb3kgPSA0O1xuXG4gICAgICAgICAgICAvLyBUT0RPOiBXZSBuZWVkIHRvIHRha2UgdGhlIGN1cnJlbnQgaXNvV2Vla1llYXIsIGJ1dCB0aGF0IGRlcGVuZHMgb25cbiAgICAgICAgICAgIC8vIGhvdyB3ZSBpbnRlcnByZXQgbm93IChsb2NhbCwgdXRjLCBmaXhlZCBvZmZzZXQpLiBTbyBjcmVhdGVcbiAgICAgICAgICAgIC8vIGEgbm93IHZlcnNpb24gb2YgY3VycmVudCBjb25maWcgKHRha2UgbG9jYWwvdXRjL29mZnNldCBmbGFncywgYW5kXG4gICAgICAgICAgICAvLyBjcmVhdGUgbm93KS5cbiAgICAgICAgICAgIHdlZWtZZWFyID0gZGZsKHcuR0csIGNvbmZpZy5fYVtZRUFSXSwgd2Vla09mWWVhcihtb21lbnQoKSwgMSwgNCkueWVhcik7XG4gICAgICAgICAgICB3ZWVrID0gZGZsKHcuVywgMSk7XG4gICAgICAgICAgICB3ZWVrZGF5ID0gZGZsKHcuRSwgMSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBkb3cgPSBjb25maWcuX2xvY2FsZS5fd2Vlay5kb3c7XG4gICAgICAgICAgICBkb3kgPSBjb25maWcuX2xvY2FsZS5fd2Vlay5kb3k7XG5cbiAgICAgICAgICAgIHdlZWtZZWFyID0gZGZsKHcuZ2csIGNvbmZpZy5fYVtZRUFSXSwgd2Vla09mWWVhcihtb21lbnQoKSwgZG93LCBkb3kpLnllYXIpO1xuICAgICAgICAgICAgd2VlayA9IGRmbCh3LncsIDEpO1xuXG4gICAgICAgICAgICBpZiAody5kICE9IG51bGwpIHtcbiAgICAgICAgICAgICAgICAvLyB3ZWVrZGF5IC0tIGxvdyBkYXkgbnVtYmVycyBhcmUgY29uc2lkZXJlZCBuZXh0IHdlZWtcbiAgICAgICAgICAgICAgICB3ZWVrZGF5ID0gdy5kO1xuICAgICAgICAgICAgICAgIGlmICh3ZWVrZGF5IDwgZG93KSB7XG4gICAgICAgICAgICAgICAgICAgICsrd2VlaztcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9IGVsc2UgaWYgKHcuZSAhPSBudWxsKSB7XG4gICAgICAgICAgICAgICAgLy8gbG9jYWwgd2Vla2RheSAtLSBjb3VudGluZyBzdGFydHMgZnJvbSBiZWdpbmluZyBvZiB3ZWVrXG4gICAgICAgICAgICAgICAgd2Vla2RheSA9IHcuZSArIGRvdztcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgLy8gZGVmYXVsdCB0byBiZWdpbmluZyBvZiB3ZWVrXG4gICAgICAgICAgICAgICAgd2Vla2RheSA9IGRvdztcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICB0ZW1wID0gZGF5T2ZZZWFyRnJvbVdlZWtzKHdlZWtZZWFyLCB3ZWVrLCB3ZWVrZGF5LCBkb3ksIGRvdyk7XG5cbiAgICAgICAgY29uZmlnLl9hW1lFQVJdID0gdGVtcC55ZWFyO1xuICAgICAgICBjb25maWcuX2RheU9mWWVhciA9IHRlbXAuZGF5T2ZZZWFyO1xuICAgIH1cblxuICAgIC8vIGNvbnZlcnQgYW4gYXJyYXkgdG8gYSBkYXRlLlxuICAgIC8vIHRoZSBhcnJheSBzaG91bGQgbWlycm9yIHRoZSBwYXJhbWV0ZXJzIGJlbG93XG4gICAgLy8gbm90ZTogYWxsIHZhbHVlcyBwYXN0IHRoZSB5ZWFyIGFyZSBvcHRpb25hbCBhbmQgd2lsbCBkZWZhdWx0IHRvIHRoZSBsb3dlc3QgcG9zc2libGUgdmFsdWUuXG4gICAgLy8gW3llYXIsIG1vbnRoLCBkYXkgLCBob3VyLCBtaW51dGUsIHNlY29uZCwgbWlsbGlzZWNvbmRdXG4gICAgZnVuY3Rpb24gZGF0ZUZyb21Db25maWcoY29uZmlnKSB7XG4gICAgICAgIHZhciBpLCBkYXRlLCBpbnB1dCA9IFtdLCBjdXJyZW50RGF0ZSwgeWVhclRvVXNlO1xuXG4gICAgICAgIGlmIChjb25maWcuX2QpIHtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIGN1cnJlbnREYXRlID0gY3VycmVudERhdGVBcnJheShjb25maWcpO1xuXG4gICAgICAgIC8vY29tcHV0ZSBkYXkgb2YgdGhlIHllYXIgZnJvbSB3ZWVrcyBhbmQgd2Vla2RheXNcbiAgICAgICAgaWYgKGNvbmZpZy5fdyAmJiBjb25maWcuX2FbREFURV0gPT0gbnVsbCAmJiBjb25maWcuX2FbTU9OVEhdID09IG51bGwpIHtcbiAgICAgICAgICAgIGRheU9mWWVhckZyb21XZWVrSW5mbyhjb25maWcpO1xuICAgICAgICB9XG5cbiAgICAgICAgLy9pZiB0aGUgZGF5IG9mIHRoZSB5ZWFyIGlzIHNldCwgZmlndXJlIG91dCB3aGF0IGl0IGlzXG4gICAgICAgIGlmIChjb25maWcuX2RheU9mWWVhcikge1xuICAgICAgICAgICAgeWVhclRvVXNlID0gZGZsKGNvbmZpZy5fYVtZRUFSXSwgY3VycmVudERhdGVbWUVBUl0pO1xuXG4gICAgICAgICAgICBpZiAoY29uZmlnLl9kYXlPZlllYXIgPiBkYXlzSW5ZZWFyKHllYXJUb1VzZSkpIHtcbiAgICAgICAgICAgICAgICBjb25maWcuX3BmLl9vdmVyZmxvd0RheU9mWWVhciA9IHRydWU7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGRhdGUgPSBtYWtlVVRDRGF0ZSh5ZWFyVG9Vc2UsIDAsIGNvbmZpZy5fZGF5T2ZZZWFyKTtcbiAgICAgICAgICAgIGNvbmZpZy5fYVtNT05USF0gPSBkYXRlLmdldFVUQ01vbnRoKCk7XG4gICAgICAgICAgICBjb25maWcuX2FbREFURV0gPSBkYXRlLmdldFVUQ0RhdGUoKTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIERlZmF1bHQgdG8gY3VycmVudCBkYXRlLlxuICAgICAgICAvLyAqIGlmIG5vIHllYXIsIG1vbnRoLCBkYXkgb2YgbW9udGggYXJlIGdpdmVuLCBkZWZhdWx0IHRvIHRvZGF5XG4gICAgICAgIC8vICogaWYgZGF5IG9mIG1vbnRoIGlzIGdpdmVuLCBkZWZhdWx0IG1vbnRoIGFuZCB5ZWFyXG4gICAgICAgIC8vICogaWYgbW9udGggaXMgZ2l2ZW4sIGRlZmF1bHQgb25seSB5ZWFyXG4gICAgICAgIC8vICogaWYgeWVhciBpcyBnaXZlbiwgZG9uJ3QgZGVmYXVsdCBhbnl0aGluZ1xuICAgICAgICBmb3IgKGkgPSAwOyBpIDwgMyAmJiBjb25maWcuX2FbaV0gPT0gbnVsbDsgKytpKSB7XG4gICAgICAgICAgICBjb25maWcuX2FbaV0gPSBpbnB1dFtpXSA9IGN1cnJlbnREYXRlW2ldO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gWmVybyBvdXQgd2hhdGV2ZXIgd2FzIG5vdCBkZWZhdWx0ZWQsIGluY2x1ZGluZyB0aW1lXG4gICAgICAgIGZvciAoOyBpIDwgNzsgaSsrKSB7XG4gICAgICAgICAgICBjb25maWcuX2FbaV0gPSBpbnB1dFtpXSA9IChjb25maWcuX2FbaV0gPT0gbnVsbCkgPyAoaSA9PT0gMiA/IDEgOiAwKSA6IGNvbmZpZy5fYVtpXTtcbiAgICAgICAgfVxuXG4gICAgICAgIGNvbmZpZy5fZCA9IChjb25maWcuX3VzZVVUQyA/IG1ha2VVVENEYXRlIDogbWFrZURhdGUpLmFwcGx5KG51bGwsIGlucHV0KTtcbiAgICAgICAgLy8gQXBwbHkgdGltZXpvbmUgb2Zmc2V0IGZyb20gaW5wdXQuIFRoZSBhY3R1YWwgem9uZSBjYW4gYmUgY2hhbmdlZFxuICAgICAgICAvLyB3aXRoIHBhcnNlWm9uZS5cbiAgICAgICAgaWYgKGNvbmZpZy5fdHptICE9IG51bGwpIHtcbiAgICAgICAgICAgIGNvbmZpZy5fZC5zZXRVVENNaW51dGVzKGNvbmZpZy5fZC5nZXRVVENNaW51dGVzKCkgKyBjb25maWcuX3R6bSk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBmdW5jdGlvbiBkYXRlRnJvbU9iamVjdChjb25maWcpIHtcbiAgICAgICAgdmFyIG5vcm1hbGl6ZWRJbnB1dDtcblxuICAgICAgICBpZiAoY29uZmlnLl9kKSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICBub3JtYWxpemVkSW5wdXQgPSBub3JtYWxpemVPYmplY3RVbml0cyhjb25maWcuX2kpO1xuICAgICAgICBjb25maWcuX2EgPSBbXG4gICAgICAgICAgICBub3JtYWxpemVkSW5wdXQueWVhcixcbiAgICAgICAgICAgIG5vcm1hbGl6ZWRJbnB1dC5tb250aCxcbiAgICAgICAgICAgIG5vcm1hbGl6ZWRJbnB1dC5kYXksXG4gICAgICAgICAgICBub3JtYWxpemVkSW5wdXQuaG91cixcbiAgICAgICAgICAgIG5vcm1hbGl6ZWRJbnB1dC5taW51dGUsXG4gICAgICAgICAgICBub3JtYWxpemVkSW5wdXQuc2Vjb25kLFxuICAgICAgICAgICAgbm9ybWFsaXplZElucHV0Lm1pbGxpc2Vjb25kXG4gICAgICAgIF07XG5cbiAgICAgICAgZGF0ZUZyb21Db25maWcoY29uZmlnKTtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBjdXJyZW50RGF0ZUFycmF5KGNvbmZpZykge1xuICAgICAgICB2YXIgbm93ID0gbmV3IERhdGUoKTtcbiAgICAgICAgaWYgKGNvbmZpZy5fdXNlVVRDKSB7XG4gICAgICAgICAgICByZXR1cm4gW1xuICAgICAgICAgICAgICAgIG5vdy5nZXRVVENGdWxsWWVhcigpLFxuICAgICAgICAgICAgICAgIG5vdy5nZXRVVENNb250aCgpLFxuICAgICAgICAgICAgICAgIG5vdy5nZXRVVENEYXRlKClcbiAgICAgICAgICAgIF07XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICByZXR1cm4gW25vdy5nZXRGdWxsWWVhcigpLCBub3cuZ2V0TW9udGgoKSwgbm93LmdldERhdGUoKV07XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICAvLyBkYXRlIGZyb20gc3RyaW5nIGFuZCBmb3JtYXQgc3RyaW5nXG4gICAgZnVuY3Rpb24gbWFrZURhdGVGcm9tU3RyaW5nQW5kRm9ybWF0KGNvbmZpZykge1xuICAgICAgICBpZiAoY29uZmlnLl9mID09PSBtb21lbnQuSVNPXzg2MDEpIHtcbiAgICAgICAgICAgIHBhcnNlSVNPKGNvbmZpZyk7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICBjb25maWcuX2EgPSBbXTtcbiAgICAgICAgY29uZmlnLl9wZi5lbXB0eSA9IHRydWU7XG5cbiAgICAgICAgLy8gVGhpcyBhcnJheSBpcyB1c2VkIHRvIG1ha2UgYSBEYXRlLCBlaXRoZXIgd2l0aCBgbmV3IERhdGVgIG9yIGBEYXRlLlVUQ2BcbiAgICAgICAgdmFyIHN0cmluZyA9ICcnICsgY29uZmlnLl9pLFxuICAgICAgICAgICAgaSwgcGFyc2VkSW5wdXQsIHRva2VucywgdG9rZW4sIHNraXBwZWQsXG4gICAgICAgICAgICBzdHJpbmdMZW5ndGggPSBzdHJpbmcubGVuZ3RoLFxuICAgICAgICAgICAgdG90YWxQYXJzZWRJbnB1dExlbmd0aCA9IDA7XG5cbiAgICAgICAgdG9rZW5zID0gZXhwYW5kRm9ybWF0KGNvbmZpZy5fZiwgY29uZmlnLl9sb2NhbGUpLm1hdGNoKGZvcm1hdHRpbmdUb2tlbnMpIHx8IFtdO1xuXG4gICAgICAgIGZvciAoaSA9IDA7IGkgPCB0b2tlbnMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgIHRva2VuID0gdG9rZW5zW2ldO1xuICAgICAgICAgICAgcGFyc2VkSW5wdXQgPSAoc3RyaW5nLm1hdGNoKGdldFBhcnNlUmVnZXhGb3JUb2tlbih0b2tlbiwgY29uZmlnKSkgfHwgW10pWzBdO1xuICAgICAgICAgICAgaWYgKHBhcnNlZElucHV0KSB7XG4gICAgICAgICAgICAgICAgc2tpcHBlZCA9IHN0cmluZy5zdWJzdHIoMCwgc3RyaW5nLmluZGV4T2YocGFyc2VkSW5wdXQpKTtcbiAgICAgICAgICAgICAgICBpZiAoc2tpcHBlZC5sZW5ndGggPiAwKSB7XG4gICAgICAgICAgICAgICAgICAgIGNvbmZpZy5fcGYudW51c2VkSW5wdXQucHVzaChza2lwcGVkKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgc3RyaW5nID0gc3RyaW5nLnNsaWNlKHN0cmluZy5pbmRleE9mKHBhcnNlZElucHV0KSArIHBhcnNlZElucHV0Lmxlbmd0aCk7XG4gICAgICAgICAgICAgICAgdG90YWxQYXJzZWRJbnB1dExlbmd0aCArPSBwYXJzZWRJbnB1dC5sZW5ndGg7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICAvLyBkb24ndCBwYXJzZSBpZiBpdCdzIG5vdCBhIGtub3duIHRva2VuXG4gICAgICAgICAgICBpZiAoZm9ybWF0VG9rZW5GdW5jdGlvbnNbdG9rZW5dKSB7XG4gICAgICAgICAgICAgICAgaWYgKHBhcnNlZElucHV0KSB7XG4gICAgICAgICAgICAgICAgICAgIGNvbmZpZy5fcGYuZW1wdHkgPSBmYWxzZTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIGNvbmZpZy5fcGYudW51c2VkVG9rZW5zLnB1c2godG9rZW4pO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBhZGRUaW1lVG9BcnJheUZyb21Ub2tlbih0b2tlbiwgcGFyc2VkSW5wdXQsIGNvbmZpZyk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIGlmIChjb25maWcuX3N0cmljdCAmJiAhcGFyc2VkSW5wdXQpIHtcbiAgICAgICAgICAgICAgICBjb25maWcuX3BmLnVudXNlZFRva2Vucy5wdXNoKHRva2VuKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIC8vIGFkZCByZW1haW5pbmcgdW5wYXJzZWQgaW5wdXQgbGVuZ3RoIHRvIHRoZSBzdHJpbmdcbiAgICAgICAgY29uZmlnLl9wZi5jaGFyc0xlZnRPdmVyID0gc3RyaW5nTGVuZ3RoIC0gdG90YWxQYXJzZWRJbnB1dExlbmd0aDtcbiAgICAgICAgaWYgKHN0cmluZy5sZW5ndGggPiAwKSB7XG4gICAgICAgICAgICBjb25maWcuX3BmLnVudXNlZElucHV0LnB1c2goc3RyaW5nKTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIGhhbmRsZSBhbSBwbVxuICAgICAgICBpZiAoY29uZmlnLl9pc1BtICYmIGNvbmZpZy5fYVtIT1VSXSA8IDEyKSB7XG4gICAgICAgICAgICBjb25maWcuX2FbSE9VUl0gKz0gMTI7XG4gICAgICAgIH1cbiAgICAgICAgLy8gaWYgaXMgMTIgYW0sIGNoYW5nZSBob3VycyB0byAwXG4gICAgICAgIGlmIChjb25maWcuX2lzUG0gPT09IGZhbHNlICYmIGNvbmZpZy5fYVtIT1VSXSA9PT0gMTIpIHtcbiAgICAgICAgICAgIGNvbmZpZy5fYVtIT1VSXSA9IDA7XG4gICAgICAgIH1cblxuICAgICAgICBkYXRlRnJvbUNvbmZpZyhjb25maWcpO1xuICAgICAgICBjaGVja092ZXJmbG93KGNvbmZpZyk7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gdW5lc2NhcGVGb3JtYXQocykge1xuICAgICAgICByZXR1cm4gcy5yZXBsYWNlKC9cXFxcKFxcWyl8XFxcXChcXF0pfFxcWyhbXlxcXVxcW10qKVxcXXxcXFxcKC4pL2csIGZ1bmN0aW9uIChtYXRjaGVkLCBwMSwgcDIsIHAzLCBwNCkge1xuICAgICAgICAgICAgcmV0dXJuIHAxIHx8IHAyIHx8IHAzIHx8IHA0O1xuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICAvLyBDb2RlIGZyb20gaHR0cDovL3N0YWNrb3ZlcmZsb3cuY29tL3F1ZXN0aW9ucy8zNTYxNDkzL2lzLXRoZXJlLWEtcmVnZXhwLWVzY2FwZS1mdW5jdGlvbi1pbi1qYXZhc2NyaXB0XG4gICAgZnVuY3Rpb24gcmVnZXhwRXNjYXBlKHMpIHtcbiAgICAgICAgcmV0dXJuIHMucmVwbGFjZSgvWy1cXC9cXFxcXiQqKz8uKCl8W1xcXXt9XS9nLCAnXFxcXCQmJyk7XG4gICAgfVxuXG4gICAgLy8gZGF0ZSBmcm9tIHN0cmluZyBhbmQgYXJyYXkgb2YgZm9ybWF0IHN0cmluZ3NcbiAgICBmdW5jdGlvbiBtYWtlRGF0ZUZyb21TdHJpbmdBbmRBcnJheShjb25maWcpIHtcbiAgICAgICAgdmFyIHRlbXBDb25maWcsXG4gICAgICAgICAgICBiZXN0TW9tZW50LFxuXG4gICAgICAgICAgICBzY29yZVRvQmVhdCxcbiAgICAgICAgICAgIGksXG4gICAgICAgICAgICBjdXJyZW50U2NvcmU7XG5cbiAgICAgICAgaWYgKGNvbmZpZy5fZi5sZW5ndGggPT09IDApIHtcbiAgICAgICAgICAgIGNvbmZpZy5fcGYuaW52YWxpZEZvcm1hdCA9IHRydWU7XG4gICAgICAgICAgICBjb25maWcuX2QgPSBuZXcgRGF0ZShOYU4pO1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgZm9yIChpID0gMDsgaSA8IGNvbmZpZy5fZi5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgY3VycmVudFNjb3JlID0gMDtcbiAgICAgICAgICAgIHRlbXBDb25maWcgPSBjb3B5Q29uZmlnKHt9LCBjb25maWcpO1xuICAgICAgICAgICAgaWYgKGNvbmZpZy5fdXNlVVRDICE9IG51bGwpIHtcbiAgICAgICAgICAgICAgICB0ZW1wQ29uZmlnLl91c2VVVEMgPSBjb25maWcuX3VzZVVUQztcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHRlbXBDb25maWcuX3BmID0gZGVmYXVsdFBhcnNpbmdGbGFncygpO1xuICAgICAgICAgICAgdGVtcENvbmZpZy5fZiA9IGNvbmZpZy5fZltpXTtcbiAgICAgICAgICAgIG1ha2VEYXRlRnJvbVN0cmluZ0FuZEZvcm1hdCh0ZW1wQ29uZmlnKTtcblxuICAgICAgICAgICAgaWYgKCFpc1ZhbGlkKHRlbXBDb25maWcpKSB7XG4gICAgICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIC8vIGlmIHRoZXJlIGlzIGFueSBpbnB1dCB0aGF0IHdhcyBub3QgcGFyc2VkIGFkZCBhIHBlbmFsdHkgZm9yIHRoYXQgZm9ybWF0XG4gICAgICAgICAgICBjdXJyZW50U2NvcmUgKz0gdGVtcENvbmZpZy5fcGYuY2hhcnNMZWZ0T3ZlcjtcblxuICAgICAgICAgICAgLy9vciB0b2tlbnNcbiAgICAgICAgICAgIGN1cnJlbnRTY29yZSArPSB0ZW1wQ29uZmlnLl9wZi51bnVzZWRUb2tlbnMubGVuZ3RoICogMTA7XG5cbiAgICAgICAgICAgIHRlbXBDb25maWcuX3BmLnNjb3JlID0gY3VycmVudFNjb3JlO1xuXG4gICAgICAgICAgICBpZiAoc2NvcmVUb0JlYXQgPT0gbnVsbCB8fCBjdXJyZW50U2NvcmUgPCBzY29yZVRvQmVhdCkge1xuICAgICAgICAgICAgICAgIHNjb3JlVG9CZWF0ID0gY3VycmVudFNjb3JlO1xuICAgICAgICAgICAgICAgIGJlc3RNb21lbnQgPSB0ZW1wQ29uZmlnO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgZXh0ZW5kKGNvbmZpZywgYmVzdE1vbWVudCB8fCB0ZW1wQ29uZmlnKTtcbiAgICB9XG5cbiAgICAvLyBkYXRlIGZyb20gaXNvIGZvcm1hdFxuICAgIGZ1bmN0aW9uIHBhcnNlSVNPKGNvbmZpZykge1xuICAgICAgICB2YXIgaSwgbCxcbiAgICAgICAgICAgIHN0cmluZyA9IGNvbmZpZy5faSxcbiAgICAgICAgICAgIG1hdGNoID0gaXNvUmVnZXguZXhlYyhzdHJpbmcpO1xuXG4gICAgICAgIGlmIChtYXRjaCkge1xuICAgICAgICAgICAgY29uZmlnLl9wZi5pc28gPSB0cnVlO1xuICAgICAgICAgICAgZm9yIChpID0gMCwgbCA9IGlzb0RhdGVzLmxlbmd0aDsgaSA8IGw7IGkrKykge1xuICAgICAgICAgICAgICAgIGlmIChpc29EYXRlc1tpXVsxXS5leGVjKHN0cmluZykpIHtcbiAgICAgICAgICAgICAgICAgICAgLy8gbWF0Y2hbNV0gc2hvdWxkIGJlICdUJyBvciB1bmRlZmluZWRcbiAgICAgICAgICAgICAgICAgICAgY29uZmlnLl9mID0gaXNvRGF0ZXNbaV1bMF0gKyAobWF0Y2hbNl0gfHwgJyAnKTtcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZm9yIChpID0gMCwgbCA9IGlzb1RpbWVzLmxlbmd0aDsgaSA8IGw7IGkrKykge1xuICAgICAgICAgICAgICAgIGlmIChpc29UaW1lc1tpXVsxXS5leGVjKHN0cmluZykpIHtcbiAgICAgICAgICAgICAgICAgICAgY29uZmlnLl9mICs9IGlzb1RpbWVzW2ldWzBdO1xuICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAoc3RyaW5nLm1hdGNoKHBhcnNlVG9rZW5UaW1lem9uZSkpIHtcbiAgICAgICAgICAgICAgICBjb25maWcuX2YgKz0gJ1onO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgbWFrZURhdGVGcm9tU3RyaW5nQW5kRm9ybWF0KGNvbmZpZyk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBjb25maWcuX2lzVmFsaWQgPSBmYWxzZTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIC8vIGRhdGUgZnJvbSBpc28gZm9ybWF0IG9yIGZhbGxiYWNrXG4gICAgZnVuY3Rpb24gbWFrZURhdGVGcm9tU3RyaW5nKGNvbmZpZykge1xuICAgICAgICBwYXJzZUlTTyhjb25maWcpO1xuICAgICAgICBpZiAoY29uZmlnLl9pc1ZhbGlkID09PSBmYWxzZSkge1xuICAgICAgICAgICAgZGVsZXRlIGNvbmZpZy5faXNWYWxpZDtcbiAgICAgICAgICAgIG1vbWVudC5jcmVhdGVGcm9tSW5wdXRGYWxsYmFjayhjb25maWcpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gbWFwKGFyciwgZm4pIHtcbiAgICAgICAgdmFyIHJlcyA9IFtdLCBpO1xuICAgICAgICBmb3IgKGkgPSAwOyBpIDwgYXJyLmxlbmd0aDsgKytpKSB7XG4gICAgICAgICAgICByZXMucHVzaChmbihhcnJbaV0sIGkpKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gcmVzO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIG1ha2VEYXRlRnJvbUlucHV0KGNvbmZpZykge1xuICAgICAgICB2YXIgaW5wdXQgPSBjb25maWcuX2ksIG1hdGNoZWQ7XG4gICAgICAgIGlmIChpbnB1dCA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICBjb25maWcuX2QgPSBuZXcgRGF0ZSgpO1xuICAgICAgICB9IGVsc2UgaWYgKGlzRGF0ZShpbnB1dCkpIHtcbiAgICAgICAgICAgIGNvbmZpZy5fZCA9IG5ldyBEYXRlKCtpbnB1dCk7XG4gICAgICAgIH0gZWxzZSBpZiAoKG1hdGNoZWQgPSBhc3BOZXRKc29uUmVnZXguZXhlYyhpbnB1dCkpICE9PSBudWxsKSB7XG4gICAgICAgICAgICBjb25maWcuX2QgPSBuZXcgRGF0ZSgrbWF0Y2hlZFsxXSk7XG4gICAgICAgIH0gZWxzZSBpZiAodHlwZW9mIGlucHV0ID09PSAnc3RyaW5nJykge1xuICAgICAgICAgICAgbWFrZURhdGVGcm9tU3RyaW5nKGNvbmZpZyk7XG4gICAgICAgIH0gZWxzZSBpZiAoaXNBcnJheShpbnB1dCkpIHtcbiAgICAgICAgICAgIGNvbmZpZy5fYSA9IG1hcChpbnB1dC5zbGljZSgwKSwgZnVuY3Rpb24gKG9iaikge1xuICAgICAgICAgICAgICAgIHJldHVybiBwYXJzZUludChvYmosIDEwKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgZGF0ZUZyb21Db25maWcoY29uZmlnKTtcbiAgICAgICAgfSBlbHNlIGlmICh0eXBlb2YoaW5wdXQpID09PSAnb2JqZWN0Jykge1xuICAgICAgICAgICAgZGF0ZUZyb21PYmplY3QoY29uZmlnKTtcbiAgICAgICAgfSBlbHNlIGlmICh0eXBlb2YoaW5wdXQpID09PSAnbnVtYmVyJykge1xuICAgICAgICAgICAgLy8gZnJvbSBtaWxsaXNlY29uZHNcbiAgICAgICAgICAgIGNvbmZpZy5fZCA9IG5ldyBEYXRlKGlucHV0KTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIG1vbWVudC5jcmVhdGVGcm9tSW5wdXRGYWxsYmFjayhjb25maWcpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gbWFrZURhdGUoeSwgbSwgZCwgaCwgTSwgcywgbXMpIHtcbiAgICAgICAgLy9jYW4ndCBqdXN0IGFwcGx5KCkgdG8gY3JlYXRlIGEgZGF0ZTpcbiAgICAgICAgLy9odHRwOi8vc3RhY2tvdmVyZmxvdy5jb20vcXVlc3Rpb25zLzE4MTM0OC9pbnN0YW50aWF0aW5nLWEtamF2YXNjcmlwdC1vYmplY3QtYnktY2FsbGluZy1wcm90b3R5cGUtY29uc3RydWN0b3ItYXBwbHlcbiAgICAgICAgdmFyIGRhdGUgPSBuZXcgRGF0ZSh5LCBtLCBkLCBoLCBNLCBzLCBtcyk7XG5cbiAgICAgICAgLy90aGUgZGF0ZSBjb25zdHJ1Y3RvciBkb2Vzbid0IGFjY2VwdCB5ZWFycyA8IDE5NzBcbiAgICAgICAgaWYgKHkgPCAxOTcwKSB7XG4gICAgICAgICAgICBkYXRlLnNldEZ1bGxZZWFyKHkpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBkYXRlO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIG1ha2VVVENEYXRlKHkpIHtcbiAgICAgICAgdmFyIGRhdGUgPSBuZXcgRGF0ZShEYXRlLlVUQy5hcHBseShudWxsLCBhcmd1bWVudHMpKTtcbiAgICAgICAgaWYgKHkgPCAxOTcwKSB7XG4gICAgICAgICAgICBkYXRlLnNldFVUQ0Z1bGxZZWFyKHkpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBkYXRlO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIHBhcnNlV2Vla2RheShpbnB1dCwgbG9jYWxlKSB7XG4gICAgICAgIGlmICh0eXBlb2YgaW5wdXQgPT09ICdzdHJpbmcnKSB7XG4gICAgICAgICAgICBpZiAoIWlzTmFOKGlucHV0KSkge1xuICAgICAgICAgICAgICAgIGlucHV0ID0gcGFyc2VJbnQoaW5wdXQsIDEwKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgIGlucHV0ID0gbG9jYWxlLndlZWtkYXlzUGFyc2UoaW5wdXQpO1xuICAgICAgICAgICAgICAgIGlmICh0eXBlb2YgaW5wdXQgIT09ICdudW1iZXInKSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBudWxsO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gaW5wdXQ7XG4gICAgfVxuXG4gICAgLyoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKlxuICAgICAgICBSZWxhdGl2ZSBUaW1lXG4gICAgKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqL1xuXG5cbiAgICAvLyBoZWxwZXIgZnVuY3Rpb24gZm9yIG1vbWVudC5mbi5mcm9tLCBtb21lbnQuZm4uZnJvbU5vdywgYW5kIG1vbWVudC5kdXJhdGlvbi5mbi5odW1hbml6ZVxuICAgIGZ1bmN0aW9uIHN1YnN0aXR1dGVUaW1lQWdvKHN0cmluZywgbnVtYmVyLCB3aXRob3V0U3VmZml4LCBpc0Z1dHVyZSwgbG9jYWxlKSB7XG4gICAgICAgIHJldHVybiBsb2NhbGUucmVsYXRpdmVUaW1lKG51bWJlciB8fCAxLCAhIXdpdGhvdXRTdWZmaXgsIHN0cmluZywgaXNGdXR1cmUpO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIHJlbGF0aXZlVGltZShwb3NOZWdEdXJhdGlvbiwgd2l0aG91dFN1ZmZpeCwgbG9jYWxlKSB7XG4gICAgICAgIHZhciBkdXJhdGlvbiA9IG1vbWVudC5kdXJhdGlvbihwb3NOZWdEdXJhdGlvbikuYWJzKCksXG4gICAgICAgICAgICBzZWNvbmRzID0gcm91bmQoZHVyYXRpb24uYXMoJ3MnKSksXG4gICAgICAgICAgICBtaW51dGVzID0gcm91bmQoZHVyYXRpb24uYXMoJ20nKSksXG4gICAgICAgICAgICBob3VycyA9IHJvdW5kKGR1cmF0aW9uLmFzKCdoJykpLFxuICAgICAgICAgICAgZGF5cyA9IHJvdW5kKGR1cmF0aW9uLmFzKCdkJykpLFxuICAgICAgICAgICAgbW9udGhzID0gcm91bmQoZHVyYXRpb24uYXMoJ00nKSksXG4gICAgICAgICAgICB5ZWFycyA9IHJvdW5kKGR1cmF0aW9uLmFzKCd5JykpLFxuXG4gICAgICAgICAgICBhcmdzID0gc2Vjb25kcyA8IHJlbGF0aXZlVGltZVRocmVzaG9sZHMucyAmJiBbJ3MnLCBzZWNvbmRzXSB8fFxuICAgICAgICAgICAgICAgIG1pbnV0ZXMgPT09IDEgJiYgWydtJ10gfHxcbiAgICAgICAgICAgICAgICBtaW51dGVzIDwgcmVsYXRpdmVUaW1lVGhyZXNob2xkcy5tICYmIFsnbW0nLCBtaW51dGVzXSB8fFxuICAgICAgICAgICAgICAgIGhvdXJzID09PSAxICYmIFsnaCddIHx8XG4gICAgICAgICAgICAgICAgaG91cnMgPCByZWxhdGl2ZVRpbWVUaHJlc2hvbGRzLmggJiYgWydoaCcsIGhvdXJzXSB8fFxuICAgICAgICAgICAgICAgIGRheXMgPT09IDEgJiYgWydkJ10gfHxcbiAgICAgICAgICAgICAgICBkYXlzIDwgcmVsYXRpdmVUaW1lVGhyZXNob2xkcy5kICYmIFsnZGQnLCBkYXlzXSB8fFxuICAgICAgICAgICAgICAgIG1vbnRocyA9PT0gMSAmJiBbJ00nXSB8fFxuICAgICAgICAgICAgICAgIG1vbnRocyA8IHJlbGF0aXZlVGltZVRocmVzaG9sZHMuTSAmJiBbJ01NJywgbW9udGhzXSB8fFxuICAgICAgICAgICAgICAgIHllYXJzID09PSAxICYmIFsneSddIHx8IFsneXknLCB5ZWFyc107XG5cbiAgICAgICAgYXJnc1syXSA9IHdpdGhvdXRTdWZmaXg7XG4gICAgICAgIGFyZ3NbM10gPSArcG9zTmVnRHVyYXRpb24gPiAwO1xuICAgICAgICBhcmdzWzRdID0gbG9jYWxlO1xuICAgICAgICByZXR1cm4gc3Vic3RpdHV0ZVRpbWVBZ28uYXBwbHkoe30sIGFyZ3MpO1xuICAgIH1cblxuXG4gICAgLyoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKlxuICAgICAgICBXZWVrIG9mIFllYXJcbiAgICAqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKiovXG5cblxuICAgIC8vIGZpcnN0RGF5T2ZXZWVrICAgICAgIDAgPSBzdW4sIDYgPSBzYXRcbiAgICAvLyAgICAgICAgICAgICAgICAgICAgICB0aGUgZGF5IG9mIHRoZSB3ZWVrIHRoYXQgc3RhcnRzIHRoZSB3ZWVrXG4gICAgLy8gICAgICAgICAgICAgICAgICAgICAgKHVzdWFsbHkgc3VuZGF5IG9yIG1vbmRheSlcbiAgICAvLyBmaXJzdERheU9mV2Vla09mWWVhciAwID0gc3VuLCA2ID0gc2F0XG4gICAgLy8gICAgICAgICAgICAgICAgICAgICAgdGhlIGZpcnN0IHdlZWsgaXMgdGhlIHdlZWsgdGhhdCBjb250YWlucyB0aGUgZmlyc3RcbiAgICAvLyAgICAgICAgICAgICAgICAgICAgICBvZiB0aGlzIGRheSBvZiB0aGUgd2Vla1xuICAgIC8vICAgICAgICAgICAgICAgICAgICAgIChlZy4gSVNPIHdlZWtzIHVzZSB0aHVyc2RheSAoNCkpXG4gICAgZnVuY3Rpb24gd2Vla09mWWVhcihtb20sIGZpcnN0RGF5T2ZXZWVrLCBmaXJzdERheU9mV2Vla09mWWVhcikge1xuICAgICAgICB2YXIgZW5kID0gZmlyc3REYXlPZldlZWtPZlllYXIgLSBmaXJzdERheU9mV2VlayxcbiAgICAgICAgICAgIGRheXNUb0RheU9mV2VlayA9IGZpcnN0RGF5T2ZXZWVrT2ZZZWFyIC0gbW9tLmRheSgpLFxuICAgICAgICAgICAgYWRqdXN0ZWRNb21lbnQ7XG5cblxuICAgICAgICBpZiAoZGF5c1RvRGF5T2ZXZWVrID4gZW5kKSB7XG4gICAgICAgICAgICBkYXlzVG9EYXlPZldlZWsgLT0gNztcbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChkYXlzVG9EYXlPZldlZWsgPCBlbmQgLSA3KSB7XG4gICAgICAgICAgICBkYXlzVG9EYXlPZldlZWsgKz0gNztcbiAgICAgICAgfVxuXG4gICAgICAgIGFkanVzdGVkTW9tZW50ID0gbW9tZW50KG1vbSkuYWRkKGRheXNUb0RheU9mV2VlaywgJ2QnKTtcbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgIHdlZWs6IE1hdGguY2VpbChhZGp1c3RlZE1vbWVudC5kYXlPZlllYXIoKSAvIDcpLFxuICAgICAgICAgICAgeWVhcjogYWRqdXN0ZWRNb21lbnQueWVhcigpXG4gICAgICAgIH07XG4gICAgfVxuXG4gICAgLy9odHRwOi8vZW4ud2lraXBlZGlhLm9yZy93aWtpL0lTT193ZWVrX2RhdGUjQ2FsY3VsYXRpbmdfYV9kYXRlX2dpdmVuX3RoZV95ZWFyLjJDX3dlZWtfbnVtYmVyX2FuZF93ZWVrZGF5XG4gICAgZnVuY3Rpb24gZGF5T2ZZZWFyRnJvbVdlZWtzKHllYXIsIHdlZWssIHdlZWtkYXksIGZpcnN0RGF5T2ZXZWVrT2ZZZWFyLCBmaXJzdERheU9mV2Vlaykge1xuICAgICAgICB2YXIgZCA9IG1ha2VVVENEYXRlKHllYXIsIDAsIDEpLmdldFVUQ0RheSgpLCBkYXlzVG9BZGQsIGRheU9mWWVhcjtcblxuICAgICAgICBkID0gZCA9PT0gMCA/IDcgOiBkO1xuICAgICAgICB3ZWVrZGF5ID0gd2Vla2RheSAhPSBudWxsID8gd2Vla2RheSA6IGZpcnN0RGF5T2ZXZWVrO1xuICAgICAgICBkYXlzVG9BZGQgPSBmaXJzdERheU9mV2VlayAtIGQgKyAoZCA+IGZpcnN0RGF5T2ZXZWVrT2ZZZWFyID8gNyA6IDApIC0gKGQgPCBmaXJzdERheU9mV2VlayA/IDcgOiAwKTtcbiAgICAgICAgZGF5T2ZZZWFyID0gNyAqICh3ZWVrIC0gMSkgKyAod2Vla2RheSAtIGZpcnN0RGF5T2ZXZWVrKSArIGRheXNUb0FkZCArIDE7XG5cbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgIHllYXI6IGRheU9mWWVhciA+IDAgPyB5ZWFyIDogeWVhciAtIDEsXG4gICAgICAgICAgICBkYXlPZlllYXI6IGRheU9mWWVhciA+IDAgPyAgZGF5T2ZZZWFyIDogZGF5c0luWWVhcih5ZWFyIC0gMSkgKyBkYXlPZlllYXJcbiAgICAgICAgfTtcbiAgICB9XG5cbiAgICAvKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqXG4gICAgICAgIFRvcCBMZXZlbCBGdW5jdGlvbnNcbiAgICAqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKiovXG5cbiAgICBmdW5jdGlvbiBtYWtlTW9tZW50KGNvbmZpZykge1xuICAgICAgICB2YXIgaW5wdXQgPSBjb25maWcuX2ksXG4gICAgICAgICAgICBmb3JtYXQgPSBjb25maWcuX2Y7XG5cbiAgICAgICAgY29uZmlnLl9sb2NhbGUgPSBjb25maWcuX2xvY2FsZSB8fCBtb21lbnQubG9jYWxlRGF0YShjb25maWcuX2wpO1xuXG4gICAgICAgIGlmIChpbnB1dCA9PT0gbnVsbCB8fCAoZm9ybWF0ID09PSB1bmRlZmluZWQgJiYgaW5wdXQgPT09ICcnKSkge1xuICAgICAgICAgICAgcmV0dXJuIG1vbWVudC5pbnZhbGlkKHtudWxsSW5wdXQ6IHRydWV9KTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmICh0eXBlb2YgaW5wdXQgPT09ICdzdHJpbmcnKSB7XG4gICAgICAgICAgICBjb25maWcuX2kgPSBpbnB1dCA9IGNvbmZpZy5fbG9jYWxlLnByZXBhcnNlKGlucHV0KTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChtb21lbnQuaXNNb21lbnQoaW5wdXQpKSB7XG4gICAgICAgICAgICByZXR1cm4gbmV3IE1vbWVudChpbnB1dCwgdHJ1ZSk7XG4gICAgICAgIH0gZWxzZSBpZiAoZm9ybWF0KSB7XG4gICAgICAgICAgICBpZiAoaXNBcnJheShmb3JtYXQpKSB7XG4gICAgICAgICAgICAgICAgbWFrZURhdGVGcm9tU3RyaW5nQW5kQXJyYXkoY29uZmlnKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgbWFrZURhdGVGcm9tU3RyaW5nQW5kRm9ybWF0KGNvbmZpZyk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBtYWtlRGF0ZUZyb21JbnB1dChjb25maWcpO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIG5ldyBNb21lbnQoY29uZmlnKTtcbiAgICB9XG5cbiAgICBtb21lbnQgPSBmdW5jdGlvbiAoaW5wdXQsIGZvcm1hdCwgbG9jYWxlLCBzdHJpY3QpIHtcbiAgICAgICAgdmFyIGM7XG5cbiAgICAgICAgaWYgKHR5cGVvZihsb2NhbGUpID09PSAnYm9vbGVhbicpIHtcbiAgICAgICAgICAgIHN0cmljdCA9IGxvY2FsZTtcbiAgICAgICAgICAgIGxvY2FsZSA9IHVuZGVmaW5lZDtcbiAgICAgICAgfVxuICAgICAgICAvLyBvYmplY3QgY29uc3RydWN0aW9uIG11c3QgYmUgZG9uZSB0aGlzIHdheS5cbiAgICAgICAgLy8gaHR0cHM6Ly9naXRodWIuY29tL21vbWVudC9tb21lbnQvaXNzdWVzLzE0MjNcbiAgICAgICAgYyA9IHt9O1xuICAgICAgICBjLl9pc0FNb21lbnRPYmplY3QgPSB0cnVlO1xuICAgICAgICBjLl9pID0gaW5wdXQ7XG4gICAgICAgIGMuX2YgPSBmb3JtYXQ7XG4gICAgICAgIGMuX2wgPSBsb2NhbGU7XG4gICAgICAgIGMuX3N0cmljdCA9IHN0cmljdDtcbiAgICAgICAgYy5faXNVVEMgPSBmYWxzZTtcbiAgICAgICAgYy5fcGYgPSBkZWZhdWx0UGFyc2luZ0ZsYWdzKCk7XG5cbiAgICAgICAgcmV0dXJuIG1ha2VNb21lbnQoYyk7XG4gICAgfTtcblxuICAgIG1vbWVudC5zdXBwcmVzc0RlcHJlY2F0aW9uV2FybmluZ3MgPSBmYWxzZTtcblxuICAgIG1vbWVudC5jcmVhdGVGcm9tSW5wdXRGYWxsYmFjayA9IGRlcHJlY2F0ZShcbiAgICAgICAgJ21vbWVudCBjb25zdHJ1Y3Rpb24gZmFsbHMgYmFjayB0byBqcyBEYXRlLiBUaGlzIGlzICcgK1xuICAgICAgICAnZGlzY291cmFnZWQgYW5kIHdpbGwgYmUgcmVtb3ZlZCBpbiB1cGNvbWluZyBtYWpvciAnICtcbiAgICAgICAgJ3JlbGVhc2UuIFBsZWFzZSByZWZlciB0byAnICtcbiAgICAgICAgJ2h0dHBzOi8vZ2l0aHViLmNvbS9tb21lbnQvbW9tZW50L2lzc3Vlcy8xNDA3IGZvciBtb3JlIGluZm8uJyxcbiAgICAgICAgZnVuY3Rpb24gKGNvbmZpZykge1xuICAgICAgICAgICAgY29uZmlnLl9kID0gbmV3IERhdGUoY29uZmlnLl9pKTtcbiAgICAgICAgfVxuICAgICk7XG5cbiAgICAvLyBQaWNrIGEgbW9tZW50IG0gZnJvbSBtb21lbnRzIHNvIHRoYXQgbVtmbl0ob3RoZXIpIGlzIHRydWUgZm9yIGFsbFxuICAgIC8vIG90aGVyLiBUaGlzIHJlbGllcyBvbiB0aGUgZnVuY3Rpb24gZm4gdG8gYmUgdHJhbnNpdGl2ZS5cbiAgICAvL1xuICAgIC8vIG1vbWVudHMgc2hvdWxkIGVpdGhlciBiZSBhbiBhcnJheSBvZiBtb21lbnQgb2JqZWN0cyBvciBhbiBhcnJheSwgd2hvc2VcbiAgICAvLyBmaXJzdCBlbGVtZW50IGlzIGFuIGFycmF5IG9mIG1vbWVudCBvYmplY3RzLlxuICAgIGZ1bmN0aW9uIHBpY2tCeShmbiwgbW9tZW50cykge1xuICAgICAgICB2YXIgcmVzLCBpO1xuICAgICAgICBpZiAobW9tZW50cy5sZW5ndGggPT09IDEgJiYgaXNBcnJheShtb21lbnRzWzBdKSkge1xuICAgICAgICAgICAgbW9tZW50cyA9IG1vbWVudHNbMF07XG4gICAgICAgIH1cbiAgICAgICAgaWYgKCFtb21lbnRzLmxlbmd0aCkge1xuICAgICAgICAgICAgcmV0dXJuIG1vbWVudCgpO1xuICAgICAgICB9XG4gICAgICAgIHJlcyA9IG1vbWVudHNbMF07XG4gICAgICAgIGZvciAoaSA9IDE7IGkgPCBtb21lbnRzLmxlbmd0aDsgKytpKSB7XG4gICAgICAgICAgICBpZiAobW9tZW50c1tpXVtmbl0ocmVzKSkge1xuICAgICAgICAgICAgICAgIHJlcyA9IG1vbWVudHNbaV07XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHJlcztcbiAgICB9XG5cbiAgICBtb21lbnQubWluID0gZnVuY3Rpb24gKCkge1xuICAgICAgICB2YXIgYXJncyA9IFtdLnNsaWNlLmNhbGwoYXJndW1lbnRzLCAwKTtcblxuICAgICAgICByZXR1cm4gcGlja0J5KCdpc0JlZm9yZScsIGFyZ3MpO1xuICAgIH07XG5cbiAgICBtb21lbnQubWF4ID0gZnVuY3Rpb24gKCkge1xuICAgICAgICB2YXIgYXJncyA9IFtdLnNsaWNlLmNhbGwoYXJndW1lbnRzLCAwKTtcblxuICAgICAgICByZXR1cm4gcGlja0J5KCdpc0FmdGVyJywgYXJncyk7XG4gICAgfTtcblxuICAgIC8vIGNyZWF0aW5nIHdpdGggdXRjXG4gICAgbW9tZW50LnV0YyA9IGZ1bmN0aW9uIChpbnB1dCwgZm9ybWF0LCBsb2NhbGUsIHN0cmljdCkge1xuICAgICAgICB2YXIgYztcblxuICAgICAgICBpZiAodHlwZW9mKGxvY2FsZSkgPT09ICdib29sZWFuJykge1xuICAgICAgICAgICAgc3RyaWN0ID0gbG9jYWxlO1xuICAgICAgICAgICAgbG9jYWxlID0gdW5kZWZpbmVkO1xuICAgICAgICB9XG4gICAgICAgIC8vIG9iamVjdCBjb25zdHJ1Y3Rpb24gbXVzdCBiZSBkb25lIHRoaXMgd2F5LlxuICAgICAgICAvLyBodHRwczovL2dpdGh1Yi5jb20vbW9tZW50L21vbWVudC9pc3N1ZXMvMTQyM1xuICAgICAgICBjID0ge307XG4gICAgICAgIGMuX2lzQU1vbWVudE9iamVjdCA9IHRydWU7XG4gICAgICAgIGMuX3VzZVVUQyA9IHRydWU7XG4gICAgICAgIGMuX2lzVVRDID0gdHJ1ZTtcbiAgICAgICAgYy5fbCA9IGxvY2FsZTtcbiAgICAgICAgYy5faSA9IGlucHV0O1xuICAgICAgICBjLl9mID0gZm9ybWF0O1xuICAgICAgICBjLl9zdHJpY3QgPSBzdHJpY3Q7XG4gICAgICAgIGMuX3BmID0gZGVmYXVsdFBhcnNpbmdGbGFncygpO1xuXG4gICAgICAgIHJldHVybiBtYWtlTW9tZW50KGMpLnV0YygpO1xuICAgIH07XG5cbiAgICAvLyBjcmVhdGluZyB3aXRoIHVuaXggdGltZXN0YW1wIChpbiBzZWNvbmRzKVxuICAgIG1vbWVudC51bml4ID0gZnVuY3Rpb24gKGlucHV0KSB7XG4gICAgICAgIHJldHVybiBtb21lbnQoaW5wdXQgKiAxMDAwKTtcbiAgICB9O1xuXG4gICAgLy8gZHVyYXRpb25cbiAgICBtb21lbnQuZHVyYXRpb24gPSBmdW5jdGlvbiAoaW5wdXQsIGtleSkge1xuICAgICAgICB2YXIgZHVyYXRpb24gPSBpbnB1dCxcbiAgICAgICAgICAgIC8vIG1hdGNoaW5nIGFnYWluc3QgcmVnZXhwIGlzIGV4cGVuc2l2ZSwgZG8gaXQgb24gZGVtYW5kXG4gICAgICAgICAgICBtYXRjaCA9IG51bGwsXG4gICAgICAgICAgICBzaWduLFxuICAgICAgICAgICAgcmV0LFxuICAgICAgICAgICAgcGFyc2VJc28sXG4gICAgICAgICAgICBkaWZmUmVzO1xuXG4gICAgICAgIGlmIChtb21lbnQuaXNEdXJhdGlvbihpbnB1dCkpIHtcbiAgICAgICAgICAgIGR1cmF0aW9uID0ge1xuICAgICAgICAgICAgICAgIG1zOiBpbnB1dC5fbWlsbGlzZWNvbmRzLFxuICAgICAgICAgICAgICAgIGQ6IGlucHV0Ll9kYXlzLFxuICAgICAgICAgICAgICAgIE06IGlucHV0Ll9tb250aHNcbiAgICAgICAgICAgIH07XG4gICAgICAgIH0gZWxzZSBpZiAodHlwZW9mIGlucHV0ID09PSAnbnVtYmVyJykge1xuICAgICAgICAgICAgZHVyYXRpb24gPSB7fTtcbiAgICAgICAgICAgIGlmIChrZXkpIHtcbiAgICAgICAgICAgICAgICBkdXJhdGlvbltrZXldID0gaW5wdXQ7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIGR1cmF0aW9uLm1pbGxpc2Vjb25kcyA9IGlucHV0O1xuICAgICAgICAgICAgfVxuICAgICAgICB9IGVsc2UgaWYgKCEhKG1hdGNoID0gYXNwTmV0VGltZVNwYW5Kc29uUmVnZXguZXhlYyhpbnB1dCkpKSB7XG4gICAgICAgICAgICBzaWduID0gKG1hdGNoWzFdID09PSAnLScpID8gLTEgOiAxO1xuICAgICAgICAgICAgZHVyYXRpb24gPSB7XG4gICAgICAgICAgICAgICAgeTogMCxcbiAgICAgICAgICAgICAgICBkOiB0b0ludChtYXRjaFtEQVRFXSkgKiBzaWduLFxuICAgICAgICAgICAgICAgIGg6IHRvSW50KG1hdGNoW0hPVVJdKSAqIHNpZ24sXG4gICAgICAgICAgICAgICAgbTogdG9JbnQobWF0Y2hbTUlOVVRFXSkgKiBzaWduLFxuICAgICAgICAgICAgICAgIHM6IHRvSW50KG1hdGNoW1NFQ09ORF0pICogc2lnbixcbiAgICAgICAgICAgICAgICBtczogdG9JbnQobWF0Y2hbTUlMTElTRUNPTkRdKSAqIHNpZ25cbiAgICAgICAgICAgIH07XG4gICAgICAgIH0gZWxzZSBpZiAoISEobWF0Y2ggPSBpc29EdXJhdGlvblJlZ2V4LmV4ZWMoaW5wdXQpKSkge1xuICAgICAgICAgICAgc2lnbiA9IChtYXRjaFsxXSA9PT0gJy0nKSA/IC0xIDogMTtcbiAgICAgICAgICAgIHBhcnNlSXNvID0gZnVuY3Rpb24gKGlucCkge1xuICAgICAgICAgICAgICAgIC8vIFdlJ2Qgbm9ybWFsbHkgdXNlIH5+aW5wIGZvciB0aGlzLCBidXQgdW5mb3J0dW5hdGVseSBpdCBhbHNvXG4gICAgICAgICAgICAgICAgLy8gY29udmVydHMgZmxvYXRzIHRvIGludHMuXG4gICAgICAgICAgICAgICAgLy8gaW5wIG1heSBiZSB1bmRlZmluZWQsIHNvIGNhcmVmdWwgY2FsbGluZyByZXBsYWNlIG9uIGl0LlxuICAgICAgICAgICAgICAgIHZhciByZXMgPSBpbnAgJiYgcGFyc2VGbG9hdChpbnAucmVwbGFjZSgnLCcsICcuJykpO1xuICAgICAgICAgICAgICAgIC8vIGFwcGx5IHNpZ24gd2hpbGUgd2UncmUgYXQgaXRcbiAgICAgICAgICAgICAgICByZXR1cm4gKGlzTmFOKHJlcykgPyAwIDogcmVzKSAqIHNpZ247XG4gICAgICAgICAgICB9O1xuICAgICAgICAgICAgZHVyYXRpb24gPSB7XG4gICAgICAgICAgICAgICAgeTogcGFyc2VJc28obWF0Y2hbMl0pLFxuICAgICAgICAgICAgICAgIE06IHBhcnNlSXNvKG1hdGNoWzNdKSxcbiAgICAgICAgICAgICAgICBkOiBwYXJzZUlzbyhtYXRjaFs0XSksXG4gICAgICAgICAgICAgICAgaDogcGFyc2VJc28obWF0Y2hbNV0pLFxuICAgICAgICAgICAgICAgIG06IHBhcnNlSXNvKG1hdGNoWzZdKSxcbiAgICAgICAgICAgICAgICBzOiBwYXJzZUlzbyhtYXRjaFs3XSksXG4gICAgICAgICAgICAgICAgdzogcGFyc2VJc28obWF0Y2hbOF0pXG4gICAgICAgICAgICB9O1xuICAgICAgICB9IGVsc2UgaWYgKHR5cGVvZiBkdXJhdGlvbiA9PT0gJ29iamVjdCcgJiZcbiAgICAgICAgICAgICAgICAoJ2Zyb20nIGluIGR1cmF0aW9uIHx8ICd0bycgaW4gZHVyYXRpb24pKSB7XG4gICAgICAgICAgICBkaWZmUmVzID0gbW9tZW50c0RpZmZlcmVuY2UobW9tZW50KGR1cmF0aW9uLmZyb20pLCBtb21lbnQoZHVyYXRpb24udG8pKTtcblxuICAgICAgICAgICAgZHVyYXRpb24gPSB7fTtcbiAgICAgICAgICAgIGR1cmF0aW9uLm1zID0gZGlmZlJlcy5taWxsaXNlY29uZHM7XG4gICAgICAgICAgICBkdXJhdGlvbi5NID0gZGlmZlJlcy5tb250aHM7XG4gICAgICAgIH1cblxuICAgICAgICByZXQgPSBuZXcgRHVyYXRpb24oZHVyYXRpb24pO1xuXG4gICAgICAgIGlmIChtb21lbnQuaXNEdXJhdGlvbihpbnB1dCkgJiYgaGFzT3duUHJvcChpbnB1dCwgJ19sb2NhbGUnKSkge1xuICAgICAgICAgICAgcmV0Ll9sb2NhbGUgPSBpbnB1dC5fbG9jYWxlO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIHJldDtcbiAgICB9O1xuXG4gICAgLy8gdmVyc2lvbiBudW1iZXJcbiAgICBtb21lbnQudmVyc2lvbiA9IFZFUlNJT047XG5cbiAgICAvLyBkZWZhdWx0IGZvcm1hdFxuICAgIG1vbWVudC5kZWZhdWx0Rm9ybWF0ID0gaXNvRm9ybWF0O1xuXG4gICAgLy8gY29uc3RhbnQgdGhhdCByZWZlcnMgdG8gdGhlIElTTyBzdGFuZGFyZFxuICAgIG1vbWVudC5JU09fODYwMSA9IGZ1bmN0aW9uICgpIHt9O1xuXG4gICAgLy8gUGx1Z2lucyB0aGF0IGFkZCBwcm9wZXJ0aWVzIHNob3VsZCBhbHNvIGFkZCB0aGUga2V5IGhlcmUgKG51bGwgdmFsdWUpLFxuICAgIC8vIHNvIHdlIGNhbiBwcm9wZXJseSBjbG9uZSBvdXJzZWx2ZXMuXG4gICAgbW9tZW50Lm1vbWVudFByb3BlcnRpZXMgPSBtb21lbnRQcm9wZXJ0aWVzO1xuXG4gICAgLy8gVGhpcyBmdW5jdGlvbiB3aWxsIGJlIGNhbGxlZCB3aGVuZXZlciBhIG1vbWVudCBpcyBtdXRhdGVkLlxuICAgIC8vIEl0IGlzIGludGVuZGVkIHRvIGtlZXAgdGhlIG9mZnNldCBpbiBzeW5jIHdpdGggdGhlIHRpbWV6b25lLlxuICAgIG1vbWVudC51cGRhdGVPZmZzZXQgPSBmdW5jdGlvbiAoKSB7fTtcblxuICAgIC8vIFRoaXMgZnVuY3Rpb24gYWxsb3dzIHlvdSB0byBzZXQgYSB0aHJlc2hvbGQgZm9yIHJlbGF0aXZlIHRpbWUgc3RyaW5nc1xuICAgIG1vbWVudC5yZWxhdGl2ZVRpbWVUaHJlc2hvbGQgPSBmdW5jdGlvbiAodGhyZXNob2xkLCBsaW1pdCkge1xuICAgICAgICBpZiAocmVsYXRpdmVUaW1lVGhyZXNob2xkc1t0aHJlc2hvbGRdID09PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgfVxuICAgICAgICBpZiAobGltaXQgPT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgcmV0dXJuIHJlbGF0aXZlVGltZVRocmVzaG9sZHNbdGhyZXNob2xkXTtcbiAgICAgICAgfVxuICAgICAgICByZWxhdGl2ZVRpbWVUaHJlc2hvbGRzW3RocmVzaG9sZF0gPSBsaW1pdDtcbiAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgfTtcblxuICAgIG1vbWVudC5sYW5nID0gZGVwcmVjYXRlKFxuICAgICAgICAnbW9tZW50LmxhbmcgaXMgZGVwcmVjYXRlZC4gVXNlIG1vbWVudC5sb2NhbGUgaW5zdGVhZC4nLFxuICAgICAgICBmdW5jdGlvbiAoa2V5LCB2YWx1ZSkge1xuICAgICAgICAgICAgcmV0dXJuIG1vbWVudC5sb2NhbGUoa2V5LCB2YWx1ZSk7XG4gICAgICAgIH1cbiAgICApO1xuXG4gICAgLy8gVGhpcyBmdW5jdGlvbiB3aWxsIGxvYWQgbG9jYWxlIGFuZCB0aGVuIHNldCB0aGUgZ2xvYmFsIGxvY2FsZS4gIElmXG4gICAgLy8gbm8gYXJndW1lbnRzIGFyZSBwYXNzZWQgaW4sIGl0IHdpbGwgc2ltcGx5IHJldHVybiB0aGUgY3VycmVudCBnbG9iYWxcbiAgICAvLyBsb2NhbGUga2V5LlxuICAgIG1vbWVudC5sb2NhbGUgPSBmdW5jdGlvbiAoa2V5LCB2YWx1ZXMpIHtcbiAgICAgICAgdmFyIGRhdGE7XG4gICAgICAgIGlmIChrZXkpIHtcbiAgICAgICAgICAgIGlmICh0eXBlb2YodmFsdWVzKSAhPT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAgICAgICAgICAgICBkYXRhID0gbW9tZW50LmRlZmluZUxvY2FsZShrZXksIHZhbHVlcyk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICBkYXRhID0gbW9tZW50LmxvY2FsZURhdGEoa2V5KTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgaWYgKGRhdGEpIHtcbiAgICAgICAgICAgICAgICBtb21lbnQuZHVyYXRpb24uX2xvY2FsZSA9IG1vbWVudC5fbG9jYWxlID0gZGF0YTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiBtb21lbnQuX2xvY2FsZS5fYWJicjtcbiAgICB9O1xuXG4gICAgbW9tZW50LmRlZmluZUxvY2FsZSA9IGZ1bmN0aW9uIChuYW1lLCB2YWx1ZXMpIHtcbiAgICAgICAgaWYgKHZhbHVlcyAhPT0gbnVsbCkge1xuICAgICAgICAgICAgdmFsdWVzLmFiYnIgPSBuYW1lO1xuICAgICAgICAgICAgaWYgKCFsb2NhbGVzW25hbWVdKSB7XG4gICAgICAgICAgICAgICAgbG9jYWxlc1tuYW1lXSA9IG5ldyBMb2NhbGUoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGxvY2FsZXNbbmFtZV0uc2V0KHZhbHVlcyk7XG5cbiAgICAgICAgICAgIC8vIGJhY2t3YXJkcyBjb21wYXQgZm9yIG5vdzogYWxzbyBzZXQgdGhlIGxvY2FsZVxuICAgICAgICAgICAgbW9tZW50LmxvY2FsZShuYW1lKTtcblxuICAgICAgICAgICAgcmV0dXJuIGxvY2FsZXNbbmFtZV07XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAvLyB1c2VmdWwgZm9yIHRlc3RpbmdcbiAgICAgICAgICAgIGRlbGV0ZSBsb2NhbGVzW25hbWVdO1xuICAgICAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgICAgIH1cbiAgICB9O1xuXG4gICAgbW9tZW50LmxhbmdEYXRhID0gZGVwcmVjYXRlKFxuICAgICAgICAnbW9tZW50LmxhbmdEYXRhIGlzIGRlcHJlY2F0ZWQuIFVzZSBtb21lbnQubG9jYWxlRGF0YSBpbnN0ZWFkLicsXG4gICAgICAgIGZ1bmN0aW9uIChrZXkpIHtcbiAgICAgICAgICAgIHJldHVybiBtb21lbnQubG9jYWxlRGF0YShrZXkpO1xuICAgICAgICB9XG4gICAgKTtcblxuICAgIC8vIHJldHVybnMgbG9jYWxlIGRhdGFcbiAgICBtb21lbnQubG9jYWxlRGF0YSA9IGZ1bmN0aW9uIChrZXkpIHtcbiAgICAgICAgdmFyIGxvY2FsZTtcblxuICAgICAgICBpZiAoa2V5ICYmIGtleS5fbG9jYWxlICYmIGtleS5fbG9jYWxlLl9hYmJyKSB7XG4gICAgICAgICAgICBrZXkgPSBrZXkuX2xvY2FsZS5fYWJicjtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmICgha2V5KSB7XG4gICAgICAgICAgICByZXR1cm4gbW9tZW50Ll9sb2NhbGU7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoIWlzQXJyYXkoa2V5KSkge1xuICAgICAgICAgICAgLy9zaG9ydC1jaXJjdWl0IGV2ZXJ5dGhpbmcgZWxzZVxuICAgICAgICAgICAgbG9jYWxlID0gbG9hZExvY2FsZShrZXkpO1xuICAgICAgICAgICAgaWYgKGxvY2FsZSkge1xuICAgICAgICAgICAgICAgIHJldHVybiBsb2NhbGU7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBrZXkgPSBba2V5XTtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiBjaG9vc2VMb2NhbGUoa2V5KTtcbiAgICB9O1xuXG4gICAgLy8gY29tcGFyZSBtb21lbnQgb2JqZWN0XG4gICAgbW9tZW50LmlzTW9tZW50ID0gZnVuY3Rpb24gKG9iaikge1xuICAgICAgICByZXR1cm4gb2JqIGluc3RhbmNlb2YgTW9tZW50IHx8XG4gICAgICAgICAgICAob2JqICE9IG51bGwgJiYgaGFzT3duUHJvcChvYmosICdfaXNBTW9tZW50T2JqZWN0JykpO1xuICAgIH07XG5cbiAgICAvLyBmb3IgdHlwZWNoZWNraW5nIER1cmF0aW9uIG9iamVjdHNcbiAgICBtb21lbnQuaXNEdXJhdGlvbiA9IGZ1bmN0aW9uIChvYmopIHtcbiAgICAgICAgcmV0dXJuIG9iaiBpbnN0YW5jZW9mIER1cmF0aW9uO1xuICAgIH07XG5cbiAgICBmb3IgKGkgPSBsaXN0cy5sZW5ndGggLSAxOyBpID49IDA7IC0taSkge1xuICAgICAgICBtYWtlTGlzdChsaXN0c1tpXSk7XG4gICAgfVxuXG4gICAgbW9tZW50Lm5vcm1hbGl6ZVVuaXRzID0gZnVuY3Rpb24gKHVuaXRzKSB7XG4gICAgICAgIHJldHVybiBub3JtYWxpemVVbml0cyh1bml0cyk7XG4gICAgfTtcblxuICAgIG1vbWVudC5pbnZhbGlkID0gZnVuY3Rpb24gKGZsYWdzKSB7XG4gICAgICAgIHZhciBtID0gbW9tZW50LnV0YyhOYU4pO1xuICAgICAgICBpZiAoZmxhZ3MgIT0gbnVsbCkge1xuICAgICAgICAgICAgZXh0ZW5kKG0uX3BmLCBmbGFncyk7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICBtLl9wZi51c2VySW52YWxpZGF0ZWQgPSB0cnVlO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIG07XG4gICAgfTtcblxuICAgIG1vbWVudC5wYXJzZVpvbmUgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHJldHVybiBtb21lbnQuYXBwbHkobnVsbCwgYXJndW1lbnRzKS5wYXJzZVpvbmUoKTtcbiAgICB9O1xuXG4gICAgbW9tZW50LnBhcnNlVHdvRGlnaXRZZWFyID0gZnVuY3Rpb24gKGlucHV0KSB7XG4gICAgICAgIHJldHVybiB0b0ludChpbnB1dCkgKyAodG9JbnQoaW5wdXQpID4gNjggPyAxOTAwIDogMjAwMCk7XG4gICAgfTtcblxuICAgIC8qKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKipcbiAgICAgICAgTW9tZW50IFByb3RvdHlwZVxuICAgICoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKi9cblxuXG4gICAgZXh0ZW5kKG1vbWVudC5mbiA9IE1vbWVudC5wcm90b3R5cGUsIHtcblxuICAgICAgICBjbG9uZSA6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHJldHVybiBtb21lbnQodGhpcyk7XG4gICAgICAgIH0sXG5cbiAgICAgICAgdmFsdWVPZiA6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHJldHVybiArdGhpcy5fZCArICgodGhpcy5fb2Zmc2V0IHx8IDApICogNjAwMDApO1xuICAgICAgICB9LFxuXG4gICAgICAgIHVuaXggOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICByZXR1cm4gTWF0aC5mbG9vcigrdGhpcyAvIDEwMDApO1xuICAgICAgICB9LFxuXG4gICAgICAgIHRvU3RyaW5nIDogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMuY2xvbmUoKS5sb2NhbGUoJ2VuJykuZm9ybWF0KCdkZGQgTU1NIEREIFlZWVkgSEg6bW06c3MgW0dNVF1aWicpO1xuICAgICAgICB9LFxuXG4gICAgICAgIHRvRGF0ZSA6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLl9vZmZzZXQgPyBuZXcgRGF0ZSgrdGhpcykgOiB0aGlzLl9kO1xuICAgICAgICB9LFxuXG4gICAgICAgIHRvSVNPU3RyaW5nIDogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgdmFyIG0gPSBtb21lbnQodGhpcykudXRjKCk7XG4gICAgICAgICAgICBpZiAoMCA8IG0ueWVhcigpICYmIG0ueWVhcigpIDw9IDk5OTkpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gZm9ybWF0TW9tZW50KG0sICdZWVlZLU1NLUREW1RdSEg6bW06c3MuU1NTW1pdJyk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIHJldHVybiBmb3JtYXRNb21lbnQobSwgJ1lZWVlZWS1NTS1ERFtUXUhIOm1tOnNzLlNTU1taXScpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9LFxuXG4gICAgICAgIHRvQXJyYXkgOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICB2YXIgbSA9IHRoaXM7XG4gICAgICAgICAgICByZXR1cm4gW1xuICAgICAgICAgICAgICAgIG0ueWVhcigpLFxuICAgICAgICAgICAgICAgIG0ubW9udGgoKSxcbiAgICAgICAgICAgICAgICBtLmRhdGUoKSxcbiAgICAgICAgICAgICAgICBtLmhvdXJzKCksXG4gICAgICAgICAgICAgICAgbS5taW51dGVzKCksXG4gICAgICAgICAgICAgICAgbS5zZWNvbmRzKCksXG4gICAgICAgICAgICAgICAgbS5taWxsaXNlY29uZHMoKVxuICAgICAgICAgICAgXTtcbiAgICAgICAgfSxcblxuICAgICAgICBpc1ZhbGlkIDogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgcmV0dXJuIGlzVmFsaWQodGhpcyk7XG4gICAgICAgIH0sXG5cbiAgICAgICAgaXNEU1RTaGlmdGVkIDogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgaWYgKHRoaXMuX2EpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gdGhpcy5pc1ZhbGlkKCkgJiYgY29tcGFyZUFycmF5cyh0aGlzLl9hLCAodGhpcy5faXNVVEMgPyBtb21lbnQudXRjKHRoaXMuX2EpIDogbW9tZW50KHRoaXMuX2EpKS50b0FycmF5KCkpID4gMDtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICB9LFxuXG4gICAgICAgIHBhcnNpbmdGbGFncyA6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHJldHVybiBleHRlbmQoe30sIHRoaXMuX3BmKTtcbiAgICAgICAgfSxcblxuICAgICAgICBpbnZhbGlkQXQ6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLl9wZi5vdmVyZmxvdztcbiAgICAgICAgfSxcblxuICAgICAgICB1dGMgOiBmdW5jdGlvbiAoa2VlcExvY2FsVGltZSkge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMuem9uZSgwLCBrZWVwTG9jYWxUaW1lKTtcbiAgICAgICAgfSxcblxuICAgICAgICBsb2NhbCA6IGZ1bmN0aW9uIChrZWVwTG9jYWxUaW1lKSB7XG4gICAgICAgICAgICBpZiAodGhpcy5faXNVVEMpIHtcbiAgICAgICAgICAgICAgICB0aGlzLnpvbmUoMCwga2VlcExvY2FsVGltZSk7XG4gICAgICAgICAgICAgICAgdGhpcy5faXNVVEMgPSBmYWxzZTtcblxuICAgICAgICAgICAgICAgIGlmIChrZWVwTG9jYWxUaW1lKSB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuYWRkKHRoaXMuX2RhdGVUek9mZnNldCgpLCAnbScpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiB0aGlzO1xuICAgICAgICB9LFxuXG4gICAgICAgIGZvcm1hdCA6IGZ1bmN0aW9uIChpbnB1dFN0cmluZykge1xuICAgICAgICAgICAgdmFyIG91dHB1dCA9IGZvcm1hdE1vbWVudCh0aGlzLCBpbnB1dFN0cmluZyB8fCBtb21lbnQuZGVmYXVsdEZvcm1hdCk7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5sb2NhbGVEYXRhKCkucG9zdGZvcm1hdChvdXRwdXQpO1xuICAgICAgICB9LFxuXG4gICAgICAgIGFkZCA6IGNyZWF0ZUFkZGVyKDEsICdhZGQnKSxcblxuICAgICAgICBzdWJ0cmFjdCA6IGNyZWF0ZUFkZGVyKC0xLCAnc3VidHJhY3QnKSxcblxuICAgICAgICBkaWZmIDogZnVuY3Rpb24gKGlucHV0LCB1bml0cywgYXNGbG9hdCkge1xuICAgICAgICAgICAgdmFyIHRoYXQgPSBtYWtlQXMoaW5wdXQsIHRoaXMpLFxuICAgICAgICAgICAgICAgIHpvbmVEaWZmID0gKHRoaXMuem9uZSgpIC0gdGhhdC56b25lKCkpICogNmU0LFxuICAgICAgICAgICAgICAgIGRpZmYsIG91dHB1dCwgZGF5c0FkanVzdDtcblxuICAgICAgICAgICAgdW5pdHMgPSBub3JtYWxpemVVbml0cyh1bml0cyk7XG5cbiAgICAgICAgICAgIGlmICh1bml0cyA9PT0gJ3llYXInIHx8IHVuaXRzID09PSAnbW9udGgnKSB7XG4gICAgICAgICAgICAgICAgLy8gYXZlcmFnZSBudW1iZXIgb2YgZGF5cyBpbiB0aGUgbW9udGhzIGluIHRoZSBnaXZlbiBkYXRlc1xuICAgICAgICAgICAgICAgIGRpZmYgPSAodGhpcy5kYXlzSW5Nb250aCgpICsgdGhhdC5kYXlzSW5Nb250aCgpKSAqIDQzMmU1OyAvLyAyNCAqIDYwICogNjAgKiAxMDAwIC8gMlxuICAgICAgICAgICAgICAgIC8vIGRpZmZlcmVuY2UgaW4gbW9udGhzXG4gICAgICAgICAgICAgICAgb3V0cHV0ID0gKCh0aGlzLnllYXIoKSAtIHRoYXQueWVhcigpKSAqIDEyKSArICh0aGlzLm1vbnRoKCkgLSB0aGF0Lm1vbnRoKCkpO1xuICAgICAgICAgICAgICAgIC8vIGFkanVzdCBieSB0YWtpbmcgZGlmZmVyZW5jZSBpbiBkYXlzLCBhdmVyYWdlIG51bWJlciBvZiBkYXlzXG4gICAgICAgICAgICAgICAgLy8gYW5kIGRzdCBpbiB0aGUgZ2l2ZW4gbW9udGhzLlxuICAgICAgICAgICAgICAgIGRheXNBZGp1c3QgPSAodGhpcyAtIG1vbWVudCh0aGlzKS5zdGFydE9mKCdtb250aCcpKSAtXG4gICAgICAgICAgICAgICAgICAgICh0aGF0IC0gbW9tZW50KHRoYXQpLnN0YXJ0T2YoJ21vbnRoJykpO1xuICAgICAgICAgICAgICAgIC8vIHNhbWUgYXMgYWJvdmUgYnV0IHdpdGggem9uZXMsIHRvIG5lZ2F0ZSBhbGwgZHN0XG4gICAgICAgICAgICAgICAgZGF5c0FkanVzdCAtPSAoKHRoaXMuem9uZSgpIC0gbW9tZW50KHRoaXMpLnN0YXJ0T2YoJ21vbnRoJykuem9uZSgpKSAtXG4gICAgICAgICAgICAgICAgICAgICAgICAodGhhdC56b25lKCkgLSBtb21lbnQodGhhdCkuc3RhcnRPZignbW9udGgnKS56b25lKCkpKSAqIDZlNDtcbiAgICAgICAgICAgICAgICBvdXRwdXQgKz0gZGF5c0FkanVzdCAvIGRpZmY7XG4gICAgICAgICAgICAgICAgaWYgKHVuaXRzID09PSAneWVhcicpIHtcbiAgICAgICAgICAgICAgICAgICAgb3V0cHV0ID0gb3V0cHV0IC8gMTI7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBkaWZmID0gKHRoaXMgLSB0aGF0KTtcbiAgICAgICAgICAgICAgICBvdXRwdXQgPSB1bml0cyA9PT0gJ3NlY29uZCcgPyBkaWZmIC8gMWUzIDogLy8gMTAwMFxuICAgICAgICAgICAgICAgICAgICB1bml0cyA9PT0gJ21pbnV0ZScgPyBkaWZmIC8gNmU0IDogLy8gMTAwMCAqIDYwXG4gICAgICAgICAgICAgICAgICAgIHVuaXRzID09PSAnaG91cicgPyBkaWZmIC8gMzZlNSA6IC8vIDEwMDAgKiA2MCAqIDYwXG4gICAgICAgICAgICAgICAgICAgIHVuaXRzID09PSAnZGF5JyA/IChkaWZmIC0gem9uZURpZmYpIC8gODY0ZTUgOiAvLyAxMDAwICogNjAgKiA2MCAqIDI0LCBuZWdhdGUgZHN0XG4gICAgICAgICAgICAgICAgICAgIHVuaXRzID09PSAnd2VlaycgPyAoZGlmZiAtIHpvbmVEaWZmKSAvIDYwNDhlNSA6IC8vIDEwMDAgKiA2MCAqIDYwICogMjQgKiA3LCBuZWdhdGUgZHN0XG4gICAgICAgICAgICAgICAgICAgIGRpZmY7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gYXNGbG9hdCA/IG91dHB1dCA6IGFic1JvdW5kKG91dHB1dCk7XG4gICAgICAgIH0sXG5cbiAgICAgICAgZnJvbSA6IGZ1bmN0aW9uICh0aW1lLCB3aXRob3V0U3VmZml4KSB7XG4gICAgICAgICAgICByZXR1cm4gbW9tZW50LmR1cmF0aW9uKHt0bzogdGhpcywgZnJvbTogdGltZX0pLmxvY2FsZSh0aGlzLmxvY2FsZSgpKS5odW1hbml6ZSghd2l0aG91dFN1ZmZpeCk7XG4gICAgICAgIH0sXG5cbiAgICAgICAgZnJvbU5vdyA6IGZ1bmN0aW9uICh3aXRob3V0U3VmZml4KSB7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5mcm9tKG1vbWVudCgpLCB3aXRob3V0U3VmZml4KTtcbiAgICAgICAgfSxcblxuICAgICAgICBjYWxlbmRhciA6IGZ1bmN0aW9uICh0aW1lKSB7XG4gICAgICAgICAgICAvLyBXZSB3YW50IHRvIGNvbXBhcmUgdGhlIHN0YXJ0IG9mIHRvZGF5LCB2cyB0aGlzLlxuICAgICAgICAgICAgLy8gR2V0dGluZyBzdGFydC1vZi10b2RheSBkZXBlbmRzIG9uIHdoZXRoZXIgd2UncmUgem9uZSdkIG9yIG5vdC5cbiAgICAgICAgICAgIHZhciBub3cgPSB0aW1lIHx8IG1vbWVudCgpLFxuICAgICAgICAgICAgICAgIHNvZCA9IG1ha2VBcyhub3csIHRoaXMpLnN0YXJ0T2YoJ2RheScpLFxuICAgICAgICAgICAgICAgIGRpZmYgPSB0aGlzLmRpZmYoc29kLCAnZGF5cycsIHRydWUpLFxuICAgICAgICAgICAgICAgIGZvcm1hdCA9IGRpZmYgPCAtNiA/ICdzYW1lRWxzZScgOlxuICAgICAgICAgICAgICAgICAgICBkaWZmIDwgLTEgPyAnbGFzdFdlZWsnIDpcbiAgICAgICAgICAgICAgICAgICAgZGlmZiA8IDAgPyAnbGFzdERheScgOlxuICAgICAgICAgICAgICAgICAgICBkaWZmIDwgMSA/ICdzYW1lRGF5JyA6XG4gICAgICAgICAgICAgICAgICAgIGRpZmYgPCAyID8gJ25leHREYXknIDpcbiAgICAgICAgICAgICAgICAgICAgZGlmZiA8IDcgPyAnbmV4dFdlZWsnIDogJ3NhbWVFbHNlJztcbiAgICAgICAgICAgIHJldHVybiB0aGlzLmZvcm1hdCh0aGlzLmxvY2FsZURhdGEoKS5jYWxlbmRhcihmb3JtYXQsIHRoaXMpKTtcbiAgICAgICAgfSxcblxuICAgICAgICBpc0xlYXBZZWFyIDogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgcmV0dXJuIGlzTGVhcFllYXIodGhpcy55ZWFyKCkpO1xuICAgICAgICB9LFxuXG4gICAgICAgIGlzRFNUIDogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgcmV0dXJuICh0aGlzLnpvbmUoKSA8IHRoaXMuY2xvbmUoKS5tb250aCgwKS56b25lKCkgfHxcbiAgICAgICAgICAgICAgICB0aGlzLnpvbmUoKSA8IHRoaXMuY2xvbmUoKS5tb250aCg1KS56b25lKCkpO1xuICAgICAgICB9LFxuXG4gICAgICAgIGRheSA6IGZ1bmN0aW9uIChpbnB1dCkge1xuICAgICAgICAgICAgdmFyIGRheSA9IHRoaXMuX2lzVVRDID8gdGhpcy5fZC5nZXRVVENEYXkoKSA6IHRoaXMuX2QuZ2V0RGF5KCk7XG4gICAgICAgICAgICBpZiAoaW5wdXQgIT0gbnVsbCkge1xuICAgICAgICAgICAgICAgIGlucHV0ID0gcGFyc2VXZWVrZGF5KGlucHV0LCB0aGlzLmxvY2FsZURhdGEoKSk7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHRoaXMuYWRkKGlucHV0IC0gZGF5LCAnZCcpO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gZGF5O1xuICAgICAgICAgICAgfVxuICAgICAgICB9LFxuXG4gICAgICAgIG1vbnRoIDogbWFrZUFjY2Vzc29yKCdNb250aCcsIHRydWUpLFxuXG4gICAgICAgIHN0YXJ0T2YgOiBmdW5jdGlvbiAodW5pdHMpIHtcbiAgICAgICAgICAgIHVuaXRzID0gbm9ybWFsaXplVW5pdHModW5pdHMpO1xuICAgICAgICAgICAgLy8gdGhlIGZvbGxvd2luZyBzd2l0Y2ggaW50ZW50aW9uYWxseSBvbWl0cyBicmVhayBrZXl3b3Jkc1xuICAgICAgICAgICAgLy8gdG8gdXRpbGl6ZSBmYWxsaW5nIHRocm91Z2ggdGhlIGNhc2VzLlxuICAgICAgICAgICAgc3dpdGNoICh1bml0cykge1xuICAgICAgICAgICAgY2FzZSAneWVhcic6XG4gICAgICAgICAgICAgICAgdGhpcy5tb250aCgwKTtcbiAgICAgICAgICAgICAgICAvKiBmYWxscyB0aHJvdWdoICovXG4gICAgICAgICAgICBjYXNlICdxdWFydGVyJzpcbiAgICAgICAgICAgIGNhc2UgJ21vbnRoJzpcbiAgICAgICAgICAgICAgICB0aGlzLmRhdGUoMSk7XG4gICAgICAgICAgICAgICAgLyogZmFsbHMgdGhyb3VnaCAqL1xuICAgICAgICAgICAgY2FzZSAnd2Vlayc6XG4gICAgICAgICAgICBjYXNlICdpc29XZWVrJzpcbiAgICAgICAgICAgIGNhc2UgJ2RheSc6XG4gICAgICAgICAgICAgICAgdGhpcy5ob3VycygwKTtcbiAgICAgICAgICAgICAgICAvKiBmYWxscyB0aHJvdWdoICovXG4gICAgICAgICAgICBjYXNlICdob3VyJzpcbiAgICAgICAgICAgICAgICB0aGlzLm1pbnV0ZXMoMCk7XG4gICAgICAgICAgICAgICAgLyogZmFsbHMgdGhyb3VnaCAqL1xuICAgICAgICAgICAgY2FzZSAnbWludXRlJzpcbiAgICAgICAgICAgICAgICB0aGlzLnNlY29uZHMoMCk7XG4gICAgICAgICAgICAgICAgLyogZmFsbHMgdGhyb3VnaCAqL1xuICAgICAgICAgICAgY2FzZSAnc2Vjb25kJzpcbiAgICAgICAgICAgICAgICB0aGlzLm1pbGxpc2Vjb25kcygwKTtcbiAgICAgICAgICAgICAgICAvKiBmYWxscyB0aHJvdWdoICovXG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIC8vIHdlZWtzIGFyZSBhIHNwZWNpYWwgY2FzZVxuICAgICAgICAgICAgaWYgKHVuaXRzID09PSAnd2VlaycpIHtcbiAgICAgICAgICAgICAgICB0aGlzLndlZWtkYXkoMCk7XG4gICAgICAgICAgICB9IGVsc2UgaWYgKHVuaXRzID09PSAnaXNvV2VlaycpIHtcbiAgICAgICAgICAgICAgICB0aGlzLmlzb1dlZWtkYXkoMSk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIC8vIHF1YXJ0ZXJzIGFyZSBhbHNvIHNwZWNpYWxcbiAgICAgICAgICAgIGlmICh1bml0cyA9PT0gJ3F1YXJ0ZXInKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5tb250aChNYXRoLmZsb29yKHRoaXMubW9udGgoKSAvIDMpICogMyk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHJldHVybiB0aGlzO1xuICAgICAgICB9LFxuXG4gICAgICAgIGVuZE9mOiBmdW5jdGlvbiAodW5pdHMpIHtcbiAgICAgICAgICAgIHVuaXRzID0gbm9ybWFsaXplVW5pdHModW5pdHMpO1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMuc3RhcnRPZih1bml0cykuYWRkKDEsICh1bml0cyA9PT0gJ2lzb1dlZWsnID8gJ3dlZWsnIDogdW5pdHMpKS5zdWJ0cmFjdCgxLCAnbXMnKTtcbiAgICAgICAgfSxcblxuICAgICAgICBpc0FmdGVyOiBmdW5jdGlvbiAoaW5wdXQsIHVuaXRzKSB7XG4gICAgICAgICAgICB1bml0cyA9IG5vcm1hbGl6ZVVuaXRzKHR5cGVvZiB1bml0cyAhPT0gJ3VuZGVmaW5lZCcgPyB1bml0cyA6ICdtaWxsaXNlY29uZCcpO1xuICAgICAgICAgICAgaWYgKHVuaXRzID09PSAnbWlsbGlzZWNvbmQnKSB7XG4gICAgICAgICAgICAgICAgaW5wdXQgPSBtb21lbnQuaXNNb21lbnQoaW5wdXQpID8gaW5wdXQgOiBtb21lbnQoaW5wdXQpO1xuICAgICAgICAgICAgICAgIHJldHVybiArdGhpcyA+ICtpbnB1dDtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuICt0aGlzLmNsb25lKCkuc3RhcnRPZih1bml0cykgPiArbW9tZW50KGlucHV0KS5zdGFydE9mKHVuaXRzKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSxcblxuICAgICAgICBpc0JlZm9yZTogZnVuY3Rpb24gKGlucHV0LCB1bml0cykge1xuICAgICAgICAgICAgdW5pdHMgPSBub3JtYWxpemVVbml0cyh0eXBlb2YgdW5pdHMgIT09ICd1bmRlZmluZWQnID8gdW5pdHMgOiAnbWlsbGlzZWNvbmQnKTtcbiAgICAgICAgICAgIGlmICh1bml0cyA9PT0gJ21pbGxpc2Vjb25kJykge1xuICAgICAgICAgICAgICAgIGlucHV0ID0gbW9tZW50LmlzTW9tZW50KGlucHV0KSA/IGlucHV0IDogbW9tZW50KGlucHV0KTtcbiAgICAgICAgICAgICAgICByZXR1cm4gK3RoaXMgPCAraW5wdXQ7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIHJldHVybiArdGhpcy5jbG9uZSgpLnN0YXJ0T2YodW5pdHMpIDwgK21vbWVudChpbnB1dCkuc3RhcnRPZih1bml0cyk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0sXG5cbiAgICAgICAgaXNTYW1lOiBmdW5jdGlvbiAoaW5wdXQsIHVuaXRzKSB7XG4gICAgICAgICAgICB1bml0cyA9IG5vcm1hbGl6ZVVuaXRzKHVuaXRzIHx8ICdtaWxsaXNlY29uZCcpO1xuICAgICAgICAgICAgaWYgKHVuaXRzID09PSAnbWlsbGlzZWNvbmQnKSB7XG4gICAgICAgICAgICAgICAgaW5wdXQgPSBtb21lbnQuaXNNb21lbnQoaW5wdXQpID8gaW5wdXQgOiBtb21lbnQoaW5wdXQpO1xuICAgICAgICAgICAgICAgIHJldHVybiArdGhpcyA9PT0gK2lucHV0O1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gK3RoaXMuY2xvbmUoKS5zdGFydE9mKHVuaXRzKSA9PT0gK21ha2VBcyhpbnB1dCwgdGhpcykuc3RhcnRPZih1bml0cyk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0sXG5cbiAgICAgICAgbWluOiBkZXByZWNhdGUoXG4gICAgICAgICAgICAgICAgICdtb21lbnQoKS5taW4gaXMgZGVwcmVjYXRlZCwgdXNlIG1vbWVudC5taW4gaW5zdGVhZC4gaHR0cHM6Ly9naXRodWIuY29tL21vbWVudC9tb21lbnQvaXNzdWVzLzE1NDgnLFxuICAgICAgICAgICAgICAgICBmdW5jdGlvbiAob3RoZXIpIHtcbiAgICAgICAgICAgICAgICAgICAgIG90aGVyID0gbW9tZW50LmFwcGx5KG51bGwsIGFyZ3VtZW50cyk7XG4gICAgICAgICAgICAgICAgICAgICByZXR1cm4gb3RoZXIgPCB0aGlzID8gdGhpcyA6IG90aGVyO1xuICAgICAgICAgICAgICAgICB9XG4gICAgICAgICApLFxuXG4gICAgICAgIG1heDogZGVwcmVjYXRlKFxuICAgICAgICAgICAgICAgICdtb21lbnQoKS5tYXggaXMgZGVwcmVjYXRlZCwgdXNlIG1vbWVudC5tYXggaW5zdGVhZC4gaHR0cHM6Ly9naXRodWIuY29tL21vbWVudC9tb21lbnQvaXNzdWVzLzE1NDgnLFxuICAgICAgICAgICAgICAgIGZ1bmN0aW9uIChvdGhlcikge1xuICAgICAgICAgICAgICAgICAgICBvdGhlciA9IG1vbWVudC5hcHBseShudWxsLCBhcmd1bWVudHMpO1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gb3RoZXIgPiB0aGlzID8gdGhpcyA6IG90aGVyO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgKSxcblxuICAgICAgICAvLyBrZWVwTG9jYWxUaW1lID0gdHJ1ZSBtZWFucyBvbmx5IGNoYW5nZSB0aGUgdGltZXpvbmUsIHdpdGhvdXRcbiAgICAgICAgLy8gYWZmZWN0aW5nIHRoZSBsb2NhbCBob3VyLiBTbyA1OjMxOjI2ICswMzAwIC0tW3pvbmUoMiwgdHJ1ZSldLS0+XG4gICAgICAgIC8vIDU6MzE6MjYgKzAyMDAgSXQgaXMgcG9zc2libGUgdGhhdCA1OjMxOjI2IGRvZXNuJ3QgZXhpc3QgaW50IHpvbmVcbiAgICAgICAgLy8gKzAyMDAsIHNvIHdlIGFkanVzdCB0aGUgdGltZSBhcyBuZWVkZWQsIHRvIGJlIHZhbGlkLlxuICAgICAgICAvL1xuICAgICAgICAvLyBLZWVwaW5nIHRoZSB0aW1lIGFjdHVhbGx5IGFkZHMvc3VidHJhY3RzIChvbmUgaG91cilcbiAgICAgICAgLy8gZnJvbSB0aGUgYWN0dWFsIHJlcHJlc2VudGVkIHRpbWUuIFRoYXQgaXMgd2h5IHdlIGNhbGwgdXBkYXRlT2Zmc2V0XG4gICAgICAgIC8vIGEgc2Vjb25kIHRpbWUuIEluIGNhc2UgaXQgd2FudHMgdXMgdG8gY2hhbmdlIHRoZSBvZmZzZXQgYWdhaW5cbiAgICAgICAgLy8gX2NoYW5nZUluUHJvZ3Jlc3MgPT0gdHJ1ZSBjYXNlLCB0aGVuIHdlIGhhdmUgdG8gYWRqdXN0LCBiZWNhdXNlXG4gICAgICAgIC8vIHRoZXJlIGlzIG5vIHN1Y2ggdGltZSBpbiB0aGUgZ2l2ZW4gdGltZXpvbmUuXG4gICAgICAgIHpvbmUgOiBmdW5jdGlvbiAoaW5wdXQsIGtlZXBMb2NhbFRpbWUpIHtcbiAgICAgICAgICAgIHZhciBvZmZzZXQgPSB0aGlzLl9vZmZzZXQgfHwgMCxcbiAgICAgICAgICAgICAgICBsb2NhbEFkanVzdDtcbiAgICAgICAgICAgIGlmIChpbnB1dCAhPSBudWxsKSB7XG4gICAgICAgICAgICAgICAgaWYgKHR5cGVvZiBpbnB1dCA9PT0gJ3N0cmluZycpIHtcbiAgICAgICAgICAgICAgICAgICAgaW5wdXQgPSB0aW1lem9uZU1pbnV0ZXNGcm9tU3RyaW5nKGlucHV0KTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgaWYgKE1hdGguYWJzKGlucHV0KSA8IDE2KSB7XG4gICAgICAgICAgICAgICAgICAgIGlucHV0ID0gaW5wdXQgKiA2MDtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgaWYgKCF0aGlzLl9pc1VUQyAmJiBrZWVwTG9jYWxUaW1lKSB7XG4gICAgICAgICAgICAgICAgICAgIGxvY2FsQWRqdXN0ID0gdGhpcy5fZGF0ZVR6T2Zmc2V0KCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIHRoaXMuX29mZnNldCA9IGlucHV0O1xuICAgICAgICAgICAgICAgIHRoaXMuX2lzVVRDID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICBpZiAobG9jYWxBZGp1c3QgIT0gbnVsbCkge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLnN1YnRyYWN0KGxvY2FsQWRqdXN0LCAnbScpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBpZiAob2Zmc2V0ICE9PSBpbnB1dCkge1xuICAgICAgICAgICAgICAgICAgICBpZiAoIWtlZXBMb2NhbFRpbWUgfHwgdGhpcy5fY2hhbmdlSW5Qcm9ncmVzcykge1xuICAgICAgICAgICAgICAgICAgICAgICAgYWRkT3JTdWJ0cmFjdER1cmF0aW9uRnJvbU1vbWVudCh0aGlzLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtb21lbnQuZHVyYXRpb24ob2Zmc2V0IC0gaW5wdXQsICdtJyksIDEsIGZhbHNlKTtcbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIGlmICghdGhpcy5fY2hhbmdlSW5Qcm9ncmVzcykge1xuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5fY2hhbmdlSW5Qcm9ncmVzcyA9IHRydWU7XG4gICAgICAgICAgICAgICAgICAgICAgICBtb21lbnQudXBkYXRlT2Zmc2V0KHRoaXMsIHRydWUpO1xuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5fY2hhbmdlSW5Qcm9ncmVzcyA9IG51bGw7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIHJldHVybiB0aGlzLl9pc1VUQyA/IG9mZnNldCA6IHRoaXMuX2RhdGVUek9mZnNldCgpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgICAgIH0sXG5cbiAgICAgICAgem9uZUFiYnIgOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5faXNVVEMgPyAnVVRDJyA6ICcnO1xuICAgICAgICB9LFxuXG4gICAgICAgIHpvbmVOYW1lIDogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMuX2lzVVRDID8gJ0Nvb3JkaW5hdGVkIFVuaXZlcnNhbCBUaW1lJyA6ICcnO1xuICAgICAgICB9LFxuXG4gICAgICAgIHBhcnNlWm9uZSA6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIGlmICh0aGlzLl90em0pIHtcbiAgICAgICAgICAgICAgICB0aGlzLnpvbmUodGhpcy5fdHptKTtcbiAgICAgICAgICAgIH0gZWxzZSBpZiAodHlwZW9mIHRoaXMuX2kgPT09ICdzdHJpbmcnKSB7XG4gICAgICAgICAgICAgICAgdGhpcy56b25lKHRoaXMuX2kpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgICAgIH0sXG5cbiAgICAgICAgaGFzQWxpZ25lZEhvdXJPZmZzZXQgOiBmdW5jdGlvbiAoaW5wdXQpIHtcbiAgICAgICAgICAgIGlmICghaW5wdXQpIHtcbiAgICAgICAgICAgICAgICBpbnB1dCA9IDA7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICBpbnB1dCA9IG1vbWVudChpbnB1dCkuem9uZSgpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICByZXR1cm4gKHRoaXMuem9uZSgpIC0gaW5wdXQpICUgNjAgPT09IDA7XG4gICAgICAgIH0sXG5cbiAgICAgICAgZGF5c0luTW9udGggOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICByZXR1cm4gZGF5c0luTW9udGgodGhpcy55ZWFyKCksIHRoaXMubW9udGgoKSk7XG4gICAgICAgIH0sXG5cbiAgICAgICAgZGF5T2ZZZWFyIDogZnVuY3Rpb24gKGlucHV0KSB7XG4gICAgICAgICAgICB2YXIgZGF5T2ZZZWFyID0gcm91bmQoKG1vbWVudCh0aGlzKS5zdGFydE9mKCdkYXknKSAtIG1vbWVudCh0aGlzKS5zdGFydE9mKCd5ZWFyJykpIC8gODY0ZTUpICsgMTtcbiAgICAgICAgICAgIHJldHVybiBpbnB1dCA9PSBudWxsID8gZGF5T2ZZZWFyIDogdGhpcy5hZGQoKGlucHV0IC0gZGF5T2ZZZWFyKSwgJ2QnKTtcbiAgICAgICAgfSxcblxuICAgICAgICBxdWFydGVyIDogZnVuY3Rpb24gKGlucHV0KSB7XG4gICAgICAgICAgICByZXR1cm4gaW5wdXQgPT0gbnVsbCA/IE1hdGguY2VpbCgodGhpcy5tb250aCgpICsgMSkgLyAzKSA6IHRoaXMubW9udGgoKGlucHV0IC0gMSkgKiAzICsgdGhpcy5tb250aCgpICUgMyk7XG4gICAgICAgIH0sXG5cbiAgICAgICAgd2Vla1llYXIgOiBmdW5jdGlvbiAoaW5wdXQpIHtcbiAgICAgICAgICAgIHZhciB5ZWFyID0gd2Vla09mWWVhcih0aGlzLCB0aGlzLmxvY2FsZURhdGEoKS5fd2Vlay5kb3csIHRoaXMubG9jYWxlRGF0YSgpLl93ZWVrLmRveSkueWVhcjtcbiAgICAgICAgICAgIHJldHVybiBpbnB1dCA9PSBudWxsID8geWVhciA6IHRoaXMuYWRkKChpbnB1dCAtIHllYXIpLCAneScpO1xuICAgICAgICB9LFxuXG4gICAgICAgIGlzb1dlZWtZZWFyIDogZnVuY3Rpb24gKGlucHV0KSB7XG4gICAgICAgICAgICB2YXIgeWVhciA9IHdlZWtPZlllYXIodGhpcywgMSwgNCkueWVhcjtcbiAgICAgICAgICAgIHJldHVybiBpbnB1dCA9PSBudWxsID8geWVhciA6IHRoaXMuYWRkKChpbnB1dCAtIHllYXIpLCAneScpO1xuICAgICAgICB9LFxuXG4gICAgICAgIHdlZWsgOiBmdW5jdGlvbiAoaW5wdXQpIHtcbiAgICAgICAgICAgIHZhciB3ZWVrID0gdGhpcy5sb2NhbGVEYXRhKCkud2Vlayh0aGlzKTtcbiAgICAgICAgICAgIHJldHVybiBpbnB1dCA9PSBudWxsID8gd2VlayA6IHRoaXMuYWRkKChpbnB1dCAtIHdlZWspICogNywgJ2QnKTtcbiAgICAgICAgfSxcblxuICAgICAgICBpc29XZWVrIDogZnVuY3Rpb24gKGlucHV0KSB7XG4gICAgICAgICAgICB2YXIgd2VlayA9IHdlZWtPZlllYXIodGhpcywgMSwgNCkud2VlaztcbiAgICAgICAgICAgIHJldHVybiBpbnB1dCA9PSBudWxsID8gd2VlayA6IHRoaXMuYWRkKChpbnB1dCAtIHdlZWspICogNywgJ2QnKTtcbiAgICAgICAgfSxcblxuICAgICAgICB3ZWVrZGF5IDogZnVuY3Rpb24gKGlucHV0KSB7XG4gICAgICAgICAgICB2YXIgd2Vla2RheSA9ICh0aGlzLmRheSgpICsgNyAtIHRoaXMubG9jYWxlRGF0YSgpLl93ZWVrLmRvdykgJSA3O1xuICAgICAgICAgICAgcmV0dXJuIGlucHV0ID09IG51bGwgPyB3ZWVrZGF5IDogdGhpcy5hZGQoaW5wdXQgLSB3ZWVrZGF5LCAnZCcpO1xuICAgICAgICB9LFxuXG4gICAgICAgIGlzb1dlZWtkYXkgOiBmdW5jdGlvbiAoaW5wdXQpIHtcbiAgICAgICAgICAgIC8vIGJlaGF2ZXMgdGhlIHNhbWUgYXMgbW9tZW50I2RheSBleGNlcHRcbiAgICAgICAgICAgIC8vIGFzIGEgZ2V0dGVyLCByZXR1cm5zIDcgaW5zdGVhZCBvZiAwICgxLTcgcmFuZ2UgaW5zdGVhZCBvZiAwLTYpXG4gICAgICAgICAgICAvLyBhcyBhIHNldHRlciwgc3VuZGF5IHNob3VsZCBiZWxvbmcgdG8gdGhlIHByZXZpb3VzIHdlZWsuXG4gICAgICAgICAgICByZXR1cm4gaW5wdXQgPT0gbnVsbCA/IHRoaXMuZGF5KCkgfHwgNyA6IHRoaXMuZGF5KHRoaXMuZGF5KCkgJSA3ID8gaW5wdXQgOiBpbnB1dCAtIDcpO1xuICAgICAgICB9LFxuXG4gICAgICAgIGlzb1dlZWtzSW5ZZWFyIDogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgcmV0dXJuIHdlZWtzSW5ZZWFyKHRoaXMueWVhcigpLCAxLCA0KTtcbiAgICAgICAgfSxcblxuICAgICAgICB3ZWVrc0luWWVhciA6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHZhciB3ZWVrSW5mbyA9IHRoaXMubG9jYWxlRGF0YSgpLl93ZWVrO1xuICAgICAgICAgICAgcmV0dXJuIHdlZWtzSW5ZZWFyKHRoaXMueWVhcigpLCB3ZWVrSW5mby5kb3csIHdlZWtJbmZvLmRveSk7XG4gICAgICAgIH0sXG5cbiAgICAgICAgZ2V0IDogZnVuY3Rpb24gKHVuaXRzKSB7XG4gICAgICAgICAgICB1bml0cyA9IG5vcm1hbGl6ZVVuaXRzKHVuaXRzKTtcbiAgICAgICAgICAgIHJldHVybiB0aGlzW3VuaXRzXSgpO1xuICAgICAgICB9LFxuXG4gICAgICAgIHNldCA6IGZ1bmN0aW9uICh1bml0cywgdmFsdWUpIHtcbiAgICAgICAgICAgIHVuaXRzID0gbm9ybWFsaXplVW5pdHModW5pdHMpO1xuICAgICAgICAgICAgaWYgKHR5cGVvZiB0aGlzW3VuaXRzXSA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgICAgICAgICAgIHRoaXNbdW5pdHNdKHZhbHVlKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiB0aGlzO1xuICAgICAgICB9LFxuXG4gICAgICAgIC8vIElmIHBhc3NlZCBhIGxvY2FsZSBrZXksIGl0IHdpbGwgc2V0IHRoZSBsb2NhbGUgZm9yIHRoaXNcbiAgICAgICAgLy8gaW5zdGFuY2UuICBPdGhlcndpc2UsIGl0IHdpbGwgcmV0dXJuIHRoZSBsb2NhbGUgY29uZmlndXJhdGlvblxuICAgICAgICAvLyB2YXJpYWJsZXMgZm9yIHRoaXMgaW5zdGFuY2UuXG4gICAgICAgIGxvY2FsZSA6IGZ1bmN0aW9uIChrZXkpIHtcbiAgICAgICAgICAgIHZhciBuZXdMb2NhbGVEYXRhO1xuXG4gICAgICAgICAgICBpZiAoa2V5ID09PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gdGhpcy5fbG9jYWxlLl9hYmJyO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBuZXdMb2NhbGVEYXRhID0gbW9tZW50LmxvY2FsZURhdGEoa2V5KTtcbiAgICAgICAgICAgICAgICBpZiAobmV3TG9jYWxlRGF0YSAhPSBudWxsKSB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuX2xvY2FsZSA9IG5ld0xvY2FsZURhdGE7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIHJldHVybiB0aGlzO1xuICAgICAgICAgICAgfVxuICAgICAgICB9LFxuXG4gICAgICAgIGxhbmcgOiBkZXByZWNhdGUoXG4gICAgICAgICAgICAnbW9tZW50KCkubGFuZygpIGlzIGRlcHJlY2F0ZWQuIFVzZSBtb21lbnQoKS5sb2NhbGVEYXRhKCkgaW5zdGVhZC4nLFxuICAgICAgICAgICAgZnVuY3Rpb24gKGtleSkge1xuICAgICAgICAgICAgICAgIGlmIChrZXkgPT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gdGhpcy5sb2NhbGVEYXRhKCk7XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHRoaXMubG9jYWxlKGtleSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICApLFxuXG4gICAgICAgIGxvY2FsZURhdGEgOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5fbG9jYWxlO1xuICAgICAgICB9LFxuXG4gICAgICAgIF9kYXRlVHpPZmZzZXQgOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAvLyBPbiBGaXJlZm94LjI0IERhdGUjZ2V0VGltZXpvbmVPZmZzZXQgcmV0dXJucyBhIGZsb2F0aW5nIHBvaW50LlxuICAgICAgICAgICAgLy8gaHR0cHM6Ly9naXRodWIuY29tL21vbWVudC9tb21lbnQvcHVsbC8xODcxXG4gICAgICAgICAgICByZXR1cm4gTWF0aC5yb3VuZCh0aGlzLl9kLmdldFRpbWV6b25lT2Zmc2V0KCkgLyAxNSkgKiAxNTtcbiAgICAgICAgfVxuICAgIH0pO1xuXG4gICAgZnVuY3Rpb24gcmF3TW9udGhTZXR0ZXIobW9tLCB2YWx1ZSkge1xuICAgICAgICB2YXIgZGF5T2ZNb250aDtcblxuICAgICAgICAvLyBUT0RPOiBNb3ZlIHRoaXMgb3V0IG9mIGhlcmUhXG4gICAgICAgIGlmICh0eXBlb2YgdmFsdWUgPT09ICdzdHJpbmcnKSB7XG4gICAgICAgICAgICB2YWx1ZSA9IG1vbS5sb2NhbGVEYXRhKCkubW9udGhzUGFyc2UodmFsdWUpO1xuICAgICAgICAgICAgLy8gVE9ETzogQW5vdGhlciBzaWxlbnQgZmFpbHVyZT9cbiAgICAgICAgICAgIGlmICh0eXBlb2YgdmFsdWUgIT09ICdudW1iZXInKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIG1vbTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIGRheU9mTW9udGggPSBNYXRoLm1pbihtb20uZGF0ZSgpLFxuICAgICAgICAgICAgICAgIGRheXNJbk1vbnRoKG1vbS55ZWFyKCksIHZhbHVlKSk7XG4gICAgICAgIG1vbS5fZFsnc2V0JyArIChtb20uX2lzVVRDID8gJ1VUQycgOiAnJykgKyAnTW9udGgnXSh2YWx1ZSwgZGF5T2ZNb250aCk7XG4gICAgICAgIHJldHVybiBtb207XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gcmF3R2V0dGVyKG1vbSwgdW5pdCkge1xuICAgICAgICByZXR1cm4gbW9tLl9kWydnZXQnICsgKG1vbS5faXNVVEMgPyAnVVRDJyA6ICcnKSArIHVuaXRdKCk7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gcmF3U2V0dGVyKG1vbSwgdW5pdCwgdmFsdWUpIHtcbiAgICAgICAgaWYgKHVuaXQgPT09ICdNb250aCcpIHtcbiAgICAgICAgICAgIHJldHVybiByYXdNb250aFNldHRlcihtb20sIHZhbHVlKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHJldHVybiBtb20uX2RbJ3NldCcgKyAobW9tLl9pc1VUQyA/ICdVVEMnIDogJycpICsgdW5pdF0odmFsdWUpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gbWFrZUFjY2Vzc29yKHVuaXQsIGtlZXBUaW1lKSB7XG4gICAgICAgIHJldHVybiBmdW5jdGlvbiAodmFsdWUpIHtcbiAgICAgICAgICAgIGlmICh2YWx1ZSAhPSBudWxsKSB7XG4gICAgICAgICAgICAgICAgcmF3U2V0dGVyKHRoaXMsIHVuaXQsIHZhbHVlKTtcbiAgICAgICAgICAgICAgICBtb21lbnQudXBkYXRlT2Zmc2V0KHRoaXMsIGtlZXBUaW1lKTtcbiAgICAgICAgICAgICAgICByZXR1cm4gdGhpcztcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHJhd0dldHRlcih0aGlzLCB1bml0KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfTtcbiAgICB9XG5cbiAgICBtb21lbnQuZm4ubWlsbGlzZWNvbmQgPSBtb21lbnQuZm4ubWlsbGlzZWNvbmRzID0gbWFrZUFjY2Vzc29yKCdNaWxsaXNlY29uZHMnLCBmYWxzZSk7XG4gICAgbW9tZW50LmZuLnNlY29uZCA9IG1vbWVudC5mbi5zZWNvbmRzID0gbWFrZUFjY2Vzc29yKCdTZWNvbmRzJywgZmFsc2UpO1xuICAgIG1vbWVudC5mbi5taW51dGUgPSBtb21lbnQuZm4ubWludXRlcyA9IG1ha2VBY2Nlc3NvcignTWludXRlcycsIGZhbHNlKTtcbiAgICAvLyBTZXR0aW5nIHRoZSBob3VyIHNob3VsZCBrZWVwIHRoZSB0aW1lLCBiZWNhdXNlIHRoZSB1c2VyIGV4cGxpY2l0bHlcbiAgICAvLyBzcGVjaWZpZWQgd2hpY2ggaG91ciBoZSB3YW50cy4gU28gdHJ5aW5nIHRvIG1haW50YWluIHRoZSBzYW1lIGhvdXIgKGluXG4gICAgLy8gYSBuZXcgdGltZXpvbmUpIG1ha2VzIHNlbnNlLiBBZGRpbmcvc3VidHJhY3RpbmcgaG91cnMgZG9lcyBub3QgZm9sbG93XG4gICAgLy8gdGhpcyBydWxlLlxuICAgIG1vbWVudC5mbi5ob3VyID0gbW9tZW50LmZuLmhvdXJzID0gbWFrZUFjY2Vzc29yKCdIb3VycycsIHRydWUpO1xuICAgIC8vIG1vbWVudC5mbi5tb250aCBpcyBkZWZpbmVkIHNlcGFyYXRlbHlcbiAgICBtb21lbnQuZm4uZGF0ZSA9IG1ha2VBY2Nlc3NvcignRGF0ZScsIHRydWUpO1xuICAgIG1vbWVudC5mbi5kYXRlcyA9IGRlcHJlY2F0ZSgnZGF0ZXMgYWNjZXNzb3IgaXMgZGVwcmVjYXRlZC4gVXNlIGRhdGUgaW5zdGVhZC4nLCBtYWtlQWNjZXNzb3IoJ0RhdGUnLCB0cnVlKSk7XG4gICAgbW9tZW50LmZuLnllYXIgPSBtYWtlQWNjZXNzb3IoJ0Z1bGxZZWFyJywgdHJ1ZSk7XG4gICAgbW9tZW50LmZuLnllYXJzID0gZGVwcmVjYXRlKCd5ZWFycyBhY2Nlc3NvciBpcyBkZXByZWNhdGVkLiBVc2UgeWVhciBpbnN0ZWFkLicsIG1ha2VBY2Nlc3NvcignRnVsbFllYXInLCB0cnVlKSk7XG5cbiAgICAvLyBhZGQgcGx1cmFsIG1ldGhvZHNcbiAgICBtb21lbnQuZm4uZGF5cyA9IG1vbWVudC5mbi5kYXk7XG4gICAgbW9tZW50LmZuLm1vbnRocyA9IG1vbWVudC5mbi5tb250aDtcbiAgICBtb21lbnQuZm4ud2Vla3MgPSBtb21lbnQuZm4ud2VlaztcbiAgICBtb21lbnQuZm4uaXNvV2Vla3MgPSBtb21lbnQuZm4uaXNvV2VlaztcbiAgICBtb21lbnQuZm4ucXVhcnRlcnMgPSBtb21lbnQuZm4ucXVhcnRlcjtcblxuICAgIC8vIGFkZCBhbGlhc2VkIGZvcm1hdCBtZXRob2RzXG4gICAgbW9tZW50LmZuLnRvSlNPTiA9IG1vbWVudC5mbi50b0lTT1N0cmluZztcblxuICAgIC8qKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKipcbiAgICAgICAgRHVyYXRpb24gUHJvdG90eXBlXG4gICAgKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqL1xuXG5cbiAgICBmdW5jdGlvbiBkYXlzVG9ZZWFycyAoZGF5cykge1xuICAgICAgICAvLyA0MDAgeWVhcnMgaGF2ZSAxNDYwOTcgZGF5cyAodGFraW5nIGludG8gYWNjb3VudCBsZWFwIHllYXIgcnVsZXMpXG4gICAgICAgIHJldHVybiBkYXlzICogNDAwIC8gMTQ2MDk3O1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIHllYXJzVG9EYXlzICh5ZWFycykge1xuICAgICAgICAvLyB5ZWFycyAqIDM2NSArIGFic1JvdW5kKHllYXJzIC8gNCkgLVxuICAgICAgICAvLyAgICAgYWJzUm91bmQoeWVhcnMgLyAxMDApICsgYWJzUm91bmQoeWVhcnMgLyA0MDApO1xuICAgICAgICByZXR1cm4geWVhcnMgKiAxNDYwOTcgLyA0MDA7XG4gICAgfVxuXG4gICAgZXh0ZW5kKG1vbWVudC5kdXJhdGlvbi5mbiA9IER1cmF0aW9uLnByb3RvdHlwZSwge1xuXG4gICAgICAgIF9idWJibGUgOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICB2YXIgbWlsbGlzZWNvbmRzID0gdGhpcy5fbWlsbGlzZWNvbmRzLFxuICAgICAgICAgICAgICAgIGRheXMgPSB0aGlzLl9kYXlzLFxuICAgICAgICAgICAgICAgIG1vbnRocyA9IHRoaXMuX21vbnRocyxcbiAgICAgICAgICAgICAgICBkYXRhID0gdGhpcy5fZGF0YSxcbiAgICAgICAgICAgICAgICBzZWNvbmRzLCBtaW51dGVzLCBob3VycywgeWVhcnMgPSAwO1xuXG4gICAgICAgICAgICAvLyBUaGUgZm9sbG93aW5nIGNvZGUgYnViYmxlcyB1cCB2YWx1ZXMsIHNlZSB0aGUgdGVzdHMgZm9yXG4gICAgICAgICAgICAvLyBleGFtcGxlcyBvZiB3aGF0IHRoYXQgbWVhbnMuXG4gICAgICAgICAgICBkYXRhLm1pbGxpc2Vjb25kcyA9IG1pbGxpc2Vjb25kcyAlIDEwMDA7XG5cbiAgICAgICAgICAgIHNlY29uZHMgPSBhYnNSb3VuZChtaWxsaXNlY29uZHMgLyAxMDAwKTtcbiAgICAgICAgICAgIGRhdGEuc2Vjb25kcyA9IHNlY29uZHMgJSA2MDtcblxuICAgICAgICAgICAgbWludXRlcyA9IGFic1JvdW5kKHNlY29uZHMgLyA2MCk7XG4gICAgICAgICAgICBkYXRhLm1pbnV0ZXMgPSBtaW51dGVzICUgNjA7XG5cbiAgICAgICAgICAgIGhvdXJzID0gYWJzUm91bmQobWludXRlcyAvIDYwKTtcbiAgICAgICAgICAgIGRhdGEuaG91cnMgPSBob3VycyAlIDI0O1xuXG4gICAgICAgICAgICBkYXlzICs9IGFic1JvdW5kKGhvdXJzIC8gMjQpO1xuXG4gICAgICAgICAgICAvLyBBY2N1cmF0ZWx5IGNvbnZlcnQgZGF5cyB0byB5ZWFycywgYXNzdW1lIHN0YXJ0IGZyb20geWVhciAwLlxuICAgICAgICAgICAgeWVhcnMgPSBhYnNSb3VuZChkYXlzVG9ZZWFycyhkYXlzKSk7XG4gICAgICAgICAgICBkYXlzIC09IGFic1JvdW5kKHllYXJzVG9EYXlzKHllYXJzKSk7XG5cbiAgICAgICAgICAgIC8vIDMwIGRheXMgdG8gYSBtb250aFxuICAgICAgICAgICAgLy8gVE9ETyAoaXNrcmVuKTogVXNlIGFuY2hvciBkYXRlIChsaWtlIDFzdCBKYW4pIHRvIGNvbXB1dGUgdGhpcy5cbiAgICAgICAgICAgIG1vbnRocyArPSBhYnNSb3VuZChkYXlzIC8gMzApO1xuICAgICAgICAgICAgZGF5cyAlPSAzMDtcblxuICAgICAgICAgICAgLy8gMTIgbW9udGhzIC0+IDEgeWVhclxuICAgICAgICAgICAgeWVhcnMgKz0gYWJzUm91bmQobW9udGhzIC8gMTIpO1xuICAgICAgICAgICAgbW9udGhzICU9IDEyO1xuXG4gICAgICAgICAgICBkYXRhLmRheXMgPSBkYXlzO1xuICAgICAgICAgICAgZGF0YS5tb250aHMgPSBtb250aHM7XG4gICAgICAgICAgICBkYXRhLnllYXJzID0geWVhcnM7XG4gICAgICAgIH0sXG5cbiAgICAgICAgYWJzIDogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgdGhpcy5fbWlsbGlzZWNvbmRzID0gTWF0aC5hYnModGhpcy5fbWlsbGlzZWNvbmRzKTtcbiAgICAgICAgICAgIHRoaXMuX2RheXMgPSBNYXRoLmFicyh0aGlzLl9kYXlzKTtcbiAgICAgICAgICAgIHRoaXMuX21vbnRocyA9IE1hdGguYWJzKHRoaXMuX21vbnRocyk7XG5cbiAgICAgICAgICAgIHRoaXMuX2RhdGEubWlsbGlzZWNvbmRzID0gTWF0aC5hYnModGhpcy5fZGF0YS5taWxsaXNlY29uZHMpO1xuICAgICAgICAgICAgdGhpcy5fZGF0YS5zZWNvbmRzID0gTWF0aC5hYnModGhpcy5fZGF0YS5zZWNvbmRzKTtcbiAgICAgICAgICAgIHRoaXMuX2RhdGEubWludXRlcyA9IE1hdGguYWJzKHRoaXMuX2RhdGEubWludXRlcyk7XG4gICAgICAgICAgICB0aGlzLl9kYXRhLmhvdXJzID0gTWF0aC5hYnModGhpcy5fZGF0YS5ob3Vycyk7XG4gICAgICAgICAgICB0aGlzLl9kYXRhLm1vbnRocyA9IE1hdGguYWJzKHRoaXMuX2RhdGEubW9udGhzKTtcbiAgICAgICAgICAgIHRoaXMuX2RhdGEueWVhcnMgPSBNYXRoLmFicyh0aGlzLl9kYXRhLnllYXJzKTtcblxuICAgICAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgICAgIH0sXG5cbiAgICAgICAgd2Vla3MgOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICByZXR1cm4gYWJzUm91bmQodGhpcy5kYXlzKCkgLyA3KTtcbiAgICAgICAgfSxcblxuICAgICAgICB2YWx1ZU9mIDogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMuX21pbGxpc2Vjb25kcyArXG4gICAgICAgICAgICAgIHRoaXMuX2RheXMgKiA4NjRlNSArXG4gICAgICAgICAgICAgICh0aGlzLl9tb250aHMgJSAxMikgKiAyNTkyZTYgK1xuICAgICAgICAgICAgICB0b0ludCh0aGlzLl9tb250aHMgLyAxMikgKiAzMTUzNmU2O1xuICAgICAgICB9LFxuXG4gICAgICAgIGh1bWFuaXplIDogZnVuY3Rpb24gKHdpdGhTdWZmaXgpIHtcbiAgICAgICAgICAgIHZhciBvdXRwdXQgPSByZWxhdGl2ZVRpbWUodGhpcywgIXdpdGhTdWZmaXgsIHRoaXMubG9jYWxlRGF0YSgpKTtcblxuICAgICAgICAgICAgaWYgKHdpdGhTdWZmaXgpIHtcbiAgICAgICAgICAgICAgICBvdXRwdXQgPSB0aGlzLmxvY2FsZURhdGEoKS5wYXN0RnV0dXJlKCt0aGlzLCBvdXRwdXQpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICByZXR1cm4gdGhpcy5sb2NhbGVEYXRhKCkucG9zdGZvcm1hdChvdXRwdXQpO1xuICAgICAgICB9LFxuXG4gICAgICAgIGFkZCA6IGZ1bmN0aW9uIChpbnB1dCwgdmFsKSB7XG4gICAgICAgICAgICAvLyBzdXBwb3J0cyBvbmx5IDIuMC1zdHlsZSBhZGQoMSwgJ3MnKSBvciBhZGQobW9tZW50KVxuICAgICAgICAgICAgdmFyIGR1ciA9IG1vbWVudC5kdXJhdGlvbihpbnB1dCwgdmFsKTtcblxuICAgICAgICAgICAgdGhpcy5fbWlsbGlzZWNvbmRzICs9IGR1ci5fbWlsbGlzZWNvbmRzO1xuICAgICAgICAgICAgdGhpcy5fZGF5cyArPSBkdXIuX2RheXM7XG4gICAgICAgICAgICB0aGlzLl9tb250aHMgKz0gZHVyLl9tb250aHM7XG5cbiAgICAgICAgICAgIHRoaXMuX2J1YmJsZSgpO1xuXG4gICAgICAgICAgICByZXR1cm4gdGhpcztcbiAgICAgICAgfSxcblxuICAgICAgICBzdWJ0cmFjdCA6IGZ1bmN0aW9uIChpbnB1dCwgdmFsKSB7XG4gICAgICAgICAgICB2YXIgZHVyID0gbW9tZW50LmR1cmF0aW9uKGlucHV0LCB2YWwpO1xuXG4gICAgICAgICAgICB0aGlzLl9taWxsaXNlY29uZHMgLT0gZHVyLl9taWxsaXNlY29uZHM7XG4gICAgICAgICAgICB0aGlzLl9kYXlzIC09IGR1ci5fZGF5cztcbiAgICAgICAgICAgIHRoaXMuX21vbnRocyAtPSBkdXIuX21vbnRocztcblxuICAgICAgICAgICAgdGhpcy5fYnViYmxlKCk7XG5cbiAgICAgICAgICAgIHJldHVybiB0aGlzO1xuICAgICAgICB9LFxuXG4gICAgICAgIGdldCA6IGZ1bmN0aW9uICh1bml0cykge1xuICAgICAgICAgICAgdW5pdHMgPSBub3JtYWxpemVVbml0cyh1bml0cyk7XG4gICAgICAgICAgICByZXR1cm4gdGhpc1t1bml0cy50b0xvd2VyQ2FzZSgpICsgJ3MnXSgpO1xuICAgICAgICB9LFxuXG4gICAgICAgIGFzIDogZnVuY3Rpb24gKHVuaXRzKSB7XG4gICAgICAgICAgICB2YXIgZGF5cywgbW9udGhzO1xuICAgICAgICAgICAgdW5pdHMgPSBub3JtYWxpemVVbml0cyh1bml0cyk7XG5cbiAgICAgICAgICAgIGlmICh1bml0cyA9PT0gJ21vbnRoJyB8fCB1bml0cyA9PT0gJ3llYXInKSB7XG4gICAgICAgICAgICAgICAgZGF5cyA9IHRoaXMuX2RheXMgKyB0aGlzLl9taWxsaXNlY29uZHMgLyA4NjRlNTtcbiAgICAgICAgICAgICAgICBtb250aHMgPSB0aGlzLl9tb250aHMgKyBkYXlzVG9ZZWFycyhkYXlzKSAqIDEyO1xuICAgICAgICAgICAgICAgIHJldHVybiB1bml0cyA9PT0gJ21vbnRoJyA/IG1vbnRocyA6IG1vbnRocyAvIDEyO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAvLyBoYW5kbGUgbWlsbGlzZWNvbmRzIHNlcGFyYXRlbHkgYmVjYXVzZSBvZiBmbG9hdGluZyBwb2ludCBtYXRoIGVycm9ycyAoaXNzdWUgIzE4NjcpXG4gICAgICAgICAgICAgICAgZGF5cyA9IHRoaXMuX2RheXMgKyB5ZWFyc1RvRGF5cyh0aGlzLl9tb250aHMgLyAxMik7XG4gICAgICAgICAgICAgICAgc3dpdGNoICh1bml0cykge1xuICAgICAgICAgICAgICAgICAgICBjYXNlICd3ZWVrJzogcmV0dXJuIGRheXMgLyA3ICsgdGhpcy5fbWlsbGlzZWNvbmRzIC8gNjA0OGU1O1xuICAgICAgICAgICAgICAgICAgICBjYXNlICdkYXknOiByZXR1cm4gZGF5cyArIHRoaXMuX21pbGxpc2Vjb25kcyAvIDg2NGU1O1xuICAgICAgICAgICAgICAgICAgICBjYXNlICdob3VyJzogcmV0dXJuIGRheXMgKiAyNCArIHRoaXMuX21pbGxpc2Vjb25kcyAvIDM2ZTU7XG4gICAgICAgICAgICAgICAgICAgIGNhc2UgJ21pbnV0ZSc6IHJldHVybiBkYXlzICogMjQgKiA2MCArIHRoaXMuX21pbGxpc2Vjb25kcyAvIDZlNDtcbiAgICAgICAgICAgICAgICAgICAgY2FzZSAnc2Vjb25kJzogcmV0dXJuIGRheXMgKiAyNCAqIDYwICogNjAgKyB0aGlzLl9taWxsaXNlY29uZHMgLyAxMDAwO1xuICAgICAgICAgICAgICAgICAgICAvLyBNYXRoLmZsb29yIHByZXZlbnRzIGZsb2F0aW5nIHBvaW50IG1hdGggZXJyb3JzIGhlcmVcbiAgICAgICAgICAgICAgICAgICAgY2FzZSAnbWlsbGlzZWNvbmQnOiByZXR1cm4gTWF0aC5mbG9vcihkYXlzICogMjQgKiA2MCAqIDYwICogMTAwMCkgKyB0aGlzLl9taWxsaXNlY29uZHM7XG4gICAgICAgICAgICAgICAgICAgIGRlZmF1bHQ6IHRocm93IG5ldyBFcnJvcignVW5rbm93biB1bml0ICcgKyB1bml0cyk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9LFxuXG4gICAgICAgIGxhbmcgOiBtb21lbnQuZm4ubGFuZyxcbiAgICAgICAgbG9jYWxlIDogbW9tZW50LmZuLmxvY2FsZSxcblxuICAgICAgICB0b0lzb1N0cmluZyA6IGRlcHJlY2F0ZShcbiAgICAgICAgICAgICd0b0lzb1N0cmluZygpIGlzIGRlcHJlY2F0ZWQuIFBsZWFzZSB1c2UgdG9JU09TdHJpbmcoKSBpbnN0ZWFkICcgK1xuICAgICAgICAgICAgJyhub3RpY2UgdGhlIGNhcGl0YWxzKScsXG4gICAgICAgICAgICBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHRoaXMudG9JU09TdHJpbmcoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgKSxcblxuICAgICAgICB0b0lTT1N0cmluZyA6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIC8vIGluc3BpcmVkIGJ5IGh0dHBzOi8vZ2l0aHViLmNvbS9kb3JkaWxsZS9tb21lbnQtaXNvZHVyYXRpb24vYmxvYi9tYXN0ZXIvbW9tZW50Lmlzb2R1cmF0aW9uLmpzXG4gICAgICAgICAgICB2YXIgeWVhcnMgPSBNYXRoLmFicyh0aGlzLnllYXJzKCkpLFxuICAgICAgICAgICAgICAgIG1vbnRocyA9IE1hdGguYWJzKHRoaXMubW9udGhzKCkpLFxuICAgICAgICAgICAgICAgIGRheXMgPSBNYXRoLmFicyh0aGlzLmRheXMoKSksXG4gICAgICAgICAgICAgICAgaG91cnMgPSBNYXRoLmFicyh0aGlzLmhvdXJzKCkpLFxuICAgICAgICAgICAgICAgIG1pbnV0ZXMgPSBNYXRoLmFicyh0aGlzLm1pbnV0ZXMoKSksXG4gICAgICAgICAgICAgICAgc2Vjb25kcyA9IE1hdGguYWJzKHRoaXMuc2Vjb25kcygpICsgdGhpcy5taWxsaXNlY29uZHMoKSAvIDEwMDApO1xuXG4gICAgICAgICAgICBpZiAoIXRoaXMuYXNTZWNvbmRzKCkpIHtcbiAgICAgICAgICAgICAgICAvLyB0aGlzIGlzIHRoZSBzYW1lIGFzIEMjJ3MgKE5vZGEpIGFuZCBweXRob24gKGlzb2RhdGUpLi4uXG4gICAgICAgICAgICAgICAgLy8gYnV0IG5vdCBvdGhlciBKUyAoZ29vZy5kYXRlKVxuICAgICAgICAgICAgICAgIHJldHVybiAnUDBEJztcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgcmV0dXJuICh0aGlzLmFzU2Vjb25kcygpIDwgMCA/ICctJyA6ICcnKSArXG4gICAgICAgICAgICAgICAgJ1AnICtcbiAgICAgICAgICAgICAgICAoeWVhcnMgPyB5ZWFycyArICdZJyA6ICcnKSArXG4gICAgICAgICAgICAgICAgKG1vbnRocyA/IG1vbnRocyArICdNJyA6ICcnKSArXG4gICAgICAgICAgICAgICAgKGRheXMgPyBkYXlzICsgJ0QnIDogJycpICtcbiAgICAgICAgICAgICAgICAoKGhvdXJzIHx8IG1pbnV0ZXMgfHwgc2Vjb25kcykgPyAnVCcgOiAnJykgK1xuICAgICAgICAgICAgICAgIChob3VycyA/IGhvdXJzICsgJ0gnIDogJycpICtcbiAgICAgICAgICAgICAgICAobWludXRlcyA/IG1pbnV0ZXMgKyAnTScgOiAnJykgK1xuICAgICAgICAgICAgICAgIChzZWNvbmRzID8gc2Vjb25kcyArICdTJyA6ICcnKTtcbiAgICAgICAgfSxcblxuICAgICAgICBsb2NhbGVEYXRhIDogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMuX2xvY2FsZTtcbiAgICAgICAgfVxuICAgIH0pO1xuXG4gICAgbW9tZW50LmR1cmF0aW9uLmZuLnRvU3RyaW5nID0gbW9tZW50LmR1cmF0aW9uLmZuLnRvSVNPU3RyaW5nO1xuXG4gICAgZnVuY3Rpb24gbWFrZUR1cmF0aW9uR2V0dGVyKG5hbWUpIHtcbiAgICAgICAgbW9tZW50LmR1cmF0aW9uLmZuW25hbWVdID0gZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMuX2RhdGFbbmFtZV07XG4gICAgICAgIH07XG4gICAgfVxuXG4gICAgZm9yIChpIGluIHVuaXRNaWxsaXNlY29uZEZhY3RvcnMpIHtcbiAgICAgICAgaWYgKGhhc093blByb3AodW5pdE1pbGxpc2Vjb25kRmFjdG9ycywgaSkpIHtcbiAgICAgICAgICAgIG1ha2VEdXJhdGlvbkdldHRlcihpLnRvTG93ZXJDYXNlKCkpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgbW9tZW50LmR1cmF0aW9uLmZuLmFzTWlsbGlzZWNvbmRzID0gZnVuY3Rpb24gKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5hcygnbXMnKTtcbiAgICB9O1xuICAgIG1vbWVudC5kdXJhdGlvbi5mbi5hc1NlY29uZHMgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLmFzKCdzJyk7XG4gICAgfTtcbiAgICBtb21lbnQuZHVyYXRpb24uZm4uYXNNaW51dGVzID0gZnVuY3Rpb24gKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5hcygnbScpO1xuICAgIH07XG4gICAgbW9tZW50LmR1cmF0aW9uLmZuLmFzSG91cnMgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLmFzKCdoJyk7XG4gICAgfTtcbiAgICBtb21lbnQuZHVyYXRpb24uZm4uYXNEYXlzID0gZnVuY3Rpb24gKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5hcygnZCcpO1xuICAgIH07XG4gICAgbW9tZW50LmR1cmF0aW9uLmZuLmFzV2Vla3MgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLmFzKCd3ZWVrcycpO1xuICAgIH07XG4gICAgbW9tZW50LmR1cmF0aW9uLmZuLmFzTW9udGhzID0gZnVuY3Rpb24gKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5hcygnTScpO1xuICAgIH07XG4gICAgbW9tZW50LmR1cmF0aW9uLmZuLmFzWWVhcnMgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLmFzKCd5Jyk7XG4gICAgfTtcblxuICAgIC8qKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKipcbiAgICAgICAgRGVmYXVsdCBMb2NhbGVcbiAgICAqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKiovXG5cblxuICAgIC8vIFNldCBkZWZhdWx0IGxvY2FsZSwgb3RoZXIgbG9jYWxlIHdpbGwgaW5oZXJpdCBmcm9tIEVuZ2xpc2guXG4gICAgbW9tZW50LmxvY2FsZSgnZW4nLCB7XG4gICAgICAgIG9yZGluYWwgOiBmdW5jdGlvbiAobnVtYmVyKSB7XG4gICAgICAgICAgICB2YXIgYiA9IG51bWJlciAlIDEwLFxuICAgICAgICAgICAgICAgIG91dHB1dCA9ICh0b0ludChudW1iZXIgJSAxMDAgLyAxMCkgPT09IDEpID8gJ3RoJyA6XG4gICAgICAgICAgICAgICAgKGIgPT09IDEpID8gJ3N0JyA6XG4gICAgICAgICAgICAgICAgKGIgPT09IDIpID8gJ25kJyA6XG4gICAgICAgICAgICAgICAgKGIgPT09IDMpID8gJ3JkJyA6ICd0aCc7XG4gICAgICAgICAgICByZXR1cm4gbnVtYmVyICsgb3V0cHV0O1xuICAgICAgICB9XG4gICAgfSk7XG5cbiAgICAvKiBFTUJFRF9MT0NBTEVTICovXG5cbiAgICAvKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqXG4gICAgICAgIEV4cG9zaW5nIE1vbWVudFxuICAgICoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKi9cblxuICAgIGZ1bmN0aW9uIG1ha2VHbG9iYWwoc2hvdWxkRGVwcmVjYXRlKSB7XG4gICAgICAgIC8qZ2xvYmFsIGVuZGVyOmZhbHNlICovXG4gICAgICAgIGlmICh0eXBlb2YgZW5kZXIgIT09ICd1bmRlZmluZWQnKSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgb2xkR2xvYmFsTW9tZW50ID0gZ2xvYmFsU2NvcGUubW9tZW50O1xuICAgICAgICBpZiAoc2hvdWxkRGVwcmVjYXRlKSB7XG4gICAgICAgICAgICBnbG9iYWxTY29wZS5tb21lbnQgPSBkZXByZWNhdGUoXG4gICAgICAgICAgICAgICAgICAgICdBY2Nlc3NpbmcgTW9tZW50IHRocm91Z2ggdGhlIGdsb2JhbCBzY29wZSBpcyAnICtcbiAgICAgICAgICAgICAgICAgICAgJ2RlcHJlY2F0ZWQsIGFuZCB3aWxsIGJlIHJlbW92ZWQgaW4gYW4gdXBjb21pbmcgJyArXG4gICAgICAgICAgICAgICAgICAgICdyZWxlYXNlLicsXG4gICAgICAgICAgICAgICAgICAgIG1vbWVudCk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBnbG9iYWxTY29wZS5tb21lbnQgPSBtb21lbnQ7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICAvLyBDb21tb25KUyBtb2R1bGUgaXMgZGVmaW5lZFxuICAgIGlmIChoYXNNb2R1bGUpIHtcbiAgICAgICAgbW9kdWxlLmV4cG9ydHMgPSBtb21lbnQ7XG4gICAgfSBlbHNlIGlmICh0eXBlb2YgZGVmaW5lID09PSAnZnVuY3Rpb24nICYmIGRlZmluZS5hbWQpIHtcbiAgICAgICAgZGVmaW5lKCdtb21lbnQnLCBmdW5jdGlvbiAocmVxdWlyZSwgZXhwb3J0cywgbW9kdWxlKSB7XG4gICAgICAgICAgICBpZiAobW9kdWxlLmNvbmZpZyAmJiBtb2R1bGUuY29uZmlnKCkgJiYgbW9kdWxlLmNvbmZpZygpLm5vR2xvYmFsID09PSB0cnVlKSB7XG4gICAgICAgICAgICAgICAgLy8gcmVsZWFzZSB0aGUgZ2xvYmFsIHZhcmlhYmxlXG4gICAgICAgICAgICAgICAgZ2xvYmFsU2NvcGUubW9tZW50ID0gb2xkR2xvYmFsTW9tZW50O1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICByZXR1cm4gbW9tZW50O1xuICAgICAgICB9KTtcbiAgICAgICAgbWFrZUdsb2JhbCh0cnVlKTtcbiAgICB9IGVsc2Uge1xuICAgICAgICBtYWtlR2xvYmFsKCk7XG4gICAgfVxufSkuY2FsbCh0aGlzKTtcblxufSkuY2FsbCh0aGlzLHR5cGVvZiBnbG9iYWwgIT09IFwidW5kZWZpbmVkXCIgPyBnbG9iYWwgOiB0eXBlb2Ygc2VsZiAhPT0gXCJ1bmRlZmluZWRcIiA/IHNlbGYgOiB0eXBlb2Ygd2luZG93ICE9PSBcInVuZGVmaW5lZFwiID8gd2luZG93IDoge30pIiwiLypcclxuXHJcbiBTb2Z0d2FyZSBMaWNlbnNlIEFncmVlbWVudCAoQlNEIExpY2Vuc2UpXHJcbiBodHRwOi8vdGFmZnlkYi5jb21cclxuIENvcHlyaWdodCAoYylcclxuIEFsbCByaWdodHMgcmVzZXJ2ZWQuXHJcblxyXG5cclxuIFJlZGlzdHJpYnV0aW9uIGFuZCB1c2Ugb2YgdGhpcyBzb2Z0d2FyZSBpbiBzb3VyY2UgYW5kIGJpbmFyeSBmb3Jtcywgd2l0aCBvciB3aXRob3V0IG1vZGlmaWNhdGlvbiwgYXJlIHBlcm1pdHRlZCBwcm92aWRlZCB0aGF0IHRoZSBmb2xsb3dpbmcgY29uZGl0aW9uIGlzIG1ldDpcclxuXHJcbiAqIFJlZGlzdHJpYnV0aW9ucyBvZiBzb3VyY2UgY29kZSBtdXN0IHJldGFpbiB0aGUgYWJvdmUgY29weXJpZ2h0IG5vdGljZSwgdGhpcyBsaXN0IG9mIGNvbmRpdGlvbnMgYW5kIHRoZSBmb2xsb3dpbmcgZGlzY2xhaW1lci5cclxuXHJcbiBUSElTIFNPRlRXQVJFIElTIFBST1ZJREVEIEJZIFRIRSBDT1BZUklHSFQgSE9MREVSUyBBTkQgQ09OVFJJQlVUT1JTIFwiQVMgSVNcIiBBTkQgQU5ZIEVYUFJFU1MgT1IgSU1QTElFRCBXQVJSQU5USUVTLCBJTkNMVURJTkcsIEJVVCBOT1QgTElNSVRFRCBUTywgVEhFIElNUExJRUQgV0FSUkFOVElFUyBPRiBNRVJDSEFOVEFCSUxJVFkgQU5EIEZJVE5FU1MgRk9SIEEgUEFSVElDVUxBUiBQVVJQT1NFIEFSRSBESVNDTEFJTUVELiBJTiBOTyBFVkVOVCBTSEFMTCBUSEUgQ09QWVJJR0hUIE9XTkVSIE9SIENPTlRSSUJVVE9SUyBCRSBMSUFCTEUgRk9SIEFOWSBESVJFQ1QsIElORElSRUNULCBJTkNJREVOVEFMLCBTUEVDSUFMLCBFWEVNUExBUlksIE9SIENPTlNFUVVFTlRJQUwgREFNQUdFUyAoSU5DTFVESU5HLCBCVVQgTk9UXHJcbiBMSU1JVEVEIFRPLCBQUk9DVVJFTUVOVCBPRiBTVUJTVElUVVRFIEdPT0RTIE9SIFNFUlZJQ0VTOyBMT1NTIE9GIFVTRSwgREFUQSwgT1IgUFJPRklUUzsgT1IgQlVTSU5FU1MgSU5URVJSVVBUSU9OKSBIT1dFVkVSIENBVVNFRCBBTkQgT04gQU5ZIFRIRU9SWSBPRiBMSUFCSUxJVFksIFdIRVRIRVIgSU4gQ09OVFJBQ1QsIFNUUklDVCBMSUFCSUxJVFksIE9SIFRPUlQgKElOQ0xVRElORyBORUdMSUdFTkNFIE9SIE9USEVSV0lTRSkgQVJJU0lORyBJTiBBTlkgV0FZIE9VVCBPRiBUSEUgVVNFIE9GIFRISVMgU09GVFdBUkUsIEVWRU4gSUYgQURWSVNFRCBPRiBUSEUgUE9TU0lCSUxJVFkgT0YgU1VDSCBEQU1BR0UuXHJcblxyXG4gKi9cclxuXHJcbi8qanNsaW50ICAgICAgICBicm93c2VyIDogdHJ1ZSwgY29udGludWUgOiB0cnVlLFxyXG4gZGV2ZWwgIDogdHJ1ZSwgaW5kZW50ICA6IDIsICAgIG1heGVyciAgIDogNTAwLFxyXG4gbmV3Y2FwIDogdHJ1ZSwgbm9tZW4gICA6IHRydWUsIHBsdXNwbHVzIDogdHJ1ZSxcclxuIHJlZ2V4cCA6IHRydWUsIHNsb3BweSAgOiB0cnVlLCB2YXJzICAgICA6IGZhbHNlLFxyXG4gd2hpdGUgIDogdHJ1ZVxyXG4qL1xyXG5cclxuLy8gQlVJTEQgMTkzZDQ4ZCwgbW9kaWZpZWQgYnkgbW1pa293c2tpIHRvIHBhc3MganNsaW50XHJcblxyXG4vLyBTZXR1cCBUQUZGWSBuYW1lIHNwYWNlIHRvIHJldHVybiBhbiBvYmplY3Qgd2l0aCBtZXRob2RzXHJcbnZhciBUQUZGWSwgZXhwb3J0cywgVDtcclxuKGZ1bmN0aW9uICgpIHtcclxuICAndXNlIHN0cmljdCc7XHJcbiAgdmFyXHJcbiAgICB0eXBlTGlzdCwgICAgIG1ha2VUZXN0LCAgICAgaWR4LCAgICB0eXBlS2V5LFxyXG4gICAgdmVyc2lvbiwgICAgICBUQywgICAgICAgICAgIGlkcGFkLCAgY21heCxcclxuICAgIEFQSSwgICAgICAgICAgcHJvdGVjdEpTT04sICBlYWNoLCAgIGVhY2hpbixcclxuICAgIGlzSW5kZXhhYmxlLCAgcmV0dXJuRmlsdGVyLCBydW5GaWx0ZXJzLFxyXG4gICAgbnVtY2hhcnNwbGl0LCBvcmRlckJ5Q29sLCAgIHJ1biwgICAgaW50ZXJzZWN0aW9uLFxyXG4gICAgZmlsdGVyLCAgICAgICBtYWtlQ2lkLCAgICAgIHNhZmVGb3JKc29uLFxyXG4gICAgaXNSZWdleHBcclxuICAgIDtcclxuXHJcblxyXG4gIGlmICggISBUQUZGWSApe1xyXG4gICAgLy8gVEMgPSBDb3VudGVyIGZvciBUYWZmeSBEQnMgb24gcGFnZSwgdXNlZCBmb3IgdW5pcXVlIElEc1xyXG4gICAgLy8gY21heCA9IHNpemUgb2YgY2hhcm51bWFycmF5IGNvbnZlcnNpb24gY2FjaGVcclxuICAgIC8vIGlkcGFkID0gemVyb3MgdG8gcGFkIHJlY29yZCBJRHMgd2l0aFxyXG4gICAgdmVyc2lvbiA9ICcyLjcnO1xyXG4gICAgVEMgICAgICA9IDE7XHJcbiAgICBpZHBhZCAgID0gJzAwMDAwMCc7XHJcbiAgICBjbWF4ICAgID0gMTAwMDtcclxuICAgIEFQSSAgICAgPSB7fTtcclxuXHJcbiAgICBwcm90ZWN0SlNPTiA9IGZ1bmN0aW9uICggdCApIHtcclxuICAgICAgLy8gKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKlxyXG4gICAgICAvLyAqXHJcbiAgICAgIC8vICogVGFrZXM6IGEgdmFyaWFibGVcclxuICAgICAgLy8gKiBSZXR1cm5zOiB0aGUgdmFyaWFibGUgaWYgb2JqZWN0L2FycmF5IG9yIHRoZSBwYXJzZWQgdmFyaWFibGUgaWYgSlNPTlxyXG4gICAgICAvLyAqXHJcbiAgICAgIC8vICoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKiogIFxyXG4gICAgICBpZiAoIFRBRkZZLmlzQXJyYXkoIHQgKSB8fCBUQUZGWS5pc09iamVjdCggdCApICl7XHJcbiAgICAgICAgcmV0dXJuIHQ7XHJcbiAgICAgIH1cclxuICAgICAgZWxzZSB7XHJcbiAgICAgICAgcmV0dXJuIEpTT04ucGFyc2UoIHQgKTtcclxuICAgICAgfVxyXG4gICAgfTtcclxuICAgIFxyXG4gICAgLy8gZ3JhY2VmdWxseSBzdG9sZW4gZnJvbSB1bmRlcnNjb3JlLmpzXHJcbiAgICBpbnRlcnNlY3Rpb24gPSBmdW5jdGlvbihhcnJheTEsIGFycmF5Mikge1xyXG4gICAgICAgIHJldHVybiBmaWx0ZXIoYXJyYXkxLCBmdW5jdGlvbihpdGVtKSB7XHJcbiAgICAgICAgICByZXR1cm4gYXJyYXkyLmluZGV4T2YoaXRlbSkgPj0gMDtcclxuICAgICAgICB9KTtcclxuICAgIH07XHJcblxyXG4gICAgLy8gZ3JhY2VmdWxseSBzdG9sZW4gZnJvbSB1bmRlcnNjb3JlLmpzXHJcbiAgICBmaWx0ZXIgPSBmdW5jdGlvbihvYmosIGl0ZXJhdG9yLCBjb250ZXh0KSB7XHJcbiAgICAgICAgdmFyIHJlc3VsdHMgPSBbXTtcclxuICAgICAgICBpZiAob2JqID09IG51bGwpIHJldHVybiByZXN1bHRzO1xyXG4gICAgICAgIGlmIChBcnJheS5wcm90b3R5cGUuZmlsdGVyICYmIG9iai5maWx0ZXIgPT09IEFycmF5LnByb3RvdHlwZS5maWx0ZXIpIHJldHVybiBvYmouZmlsdGVyKGl0ZXJhdG9yLCBjb250ZXh0KTtcclxuICAgICAgICBlYWNoKG9iaiwgZnVuY3Rpb24odmFsdWUsIGluZGV4LCBsaXN0KSB7XHJcbiAgICAgICAgICBpZiAoaXRlcmF0b3IuY2FsbChjb250ZXh0LCB2YWx1ZSwgaW5kZXgsIGxpc3QpKSByZXN1bHRzW3Jlc3VsdHMubGVuZ3RoXSA9IHZhbHVlO1xyXG4gICAgICAgIH0pO1xyXG4gICAgICAgIHJldHVybiByZXN1bHRzO1xyXG4gICAgfTtcclxuICAgIFxyXG4gICAgaXNSZWdleHAgPSBmdW5jdGlvbihhT2JqKSB7XHJcbiAgICAgICAgcmV0dXJuIE9iamVjdC5wcm90b3R5cGUudG9TdHJpbmcuY2FsbChhT2JqKT09PSdbb2JqZWN0IFJlZ0V4cF0nO1xyXG4gICAgfVxyXG4gICAgXHJcbiAgICBzYWZlRm9ySnNvbiA9IGZ1bmN0aW9uKGFPYmopIHtcclxuICAgICAgICB2YXIgbXlSZXN1bHQgPSBULmlzQXJyYXkoYU9iaikgPyBbXSA6IFQuaXNPYmplY3QoYU9iaikgPyB7fSA6IG51bGw7XHJcbiAgICAgICAgaWYoYU9iaj09PW51bGwpIHJldHVybiBhT2JqO1xyXG4gICAgICAgIGZvcih2YXIgaSBpbiBhT2JqKSB7XHJcbiAgICAgICAgICAgIG15UmVzdWx0W2ldICA9IGlzUmVnZXhwKGFPYmpbaV0pID8gYU9ialtpXS50b1N0cmluZygpIDogVC5pc0FycmF5KGFPYmpbaV0pIHx8IFQuaXNPYmplY3QoYU9ialtpXSkgPyBzYWZlRm9ySnNvbihhT2JqW2ldKSA6IGFPYmpbaV07XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiBteVJlc3VsdDtcclxuICAgIH1cclxuICAgIFxyXG4gICAgbWFrZUNpZCA9IGZ1bmN0aW9uKGFDb250ZXh0KSB7XHJcbiAgICAgICAgdmFyIG15Q2lkID0gSlNPTi5zdHJpbmdpZnkoYUNvbnRleHQpO1xyXG4gICAgICAgIGlmKG15Q2lkLm1hdGNoKC9yZWdleC8pPT09bnVsbCkgcmV0dXJuIG15Q2lkO1xyXG4gICAgICAgIHJldHVybiBKU09OLnN0cmluZ2lmeShzYWZlRm9ySnNvbihhQ29udGV4dCkpO1xyXG4gICAgfVxyXG4gICAgXHJcbiAgICBlYWNoID0gZnVuY3Rpb24gKCBhLCBmdW4sIHUgKSB7XHJcbiAgICAgIHZhciByLCBpLCB4LCB5O1xyXG4gICAgICAvLyAqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqXHJcbiAgICAgIC8vICpcclxuICAgICAgLy8gKiBUYWtlczpcclxuICAgICAgLy8gKiBhID0gYW4gb2JqZWN0L3ZhbHVlIG9yIGFuIGFycmF5IG9mIG9iamVjdHMvdmFsdWVzXHJcbiAgICAgIC8vICogZiA9IGEgZnVuY3Rpb25cclxuICAgICAgLy8gKiB1ID0gb3B0aW9uYWwgZmxhZyB0byBkZXNjcmliZSBob3cgdG8gaGFuZGxlIHVuZGVmaW5lZCB2YWx1ZXNcclxuICAgICAgLy8gICBpbiBhcnJheSBvZiB2YWx1ZXMuIFRydWU6IHBhc3MgdGhlbSB0byB0aGUgZnVuY3Rpb25zLFxyXG4gICAgICAvLyAgIEZhbHNlOiBza2lwLiBEZWZhdWx0IEZhbHNlO1xyXG4gICAgICAvLyAqIFB1cnBvc2U6IFVzZWQgdG8gbG9vcCBvdmVyIGFycmF5c1xyXG4gICAgICAvLyAqXHJcbiAgICAgIC8vICoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKiogIFxyXG4gICAgICBpZiAoIGEgJiYgKChULmlzQXJyYXkoIGEgKSAmJiBhLmxlbmd0aCA9PT0gMSkgfHwgKCFULmlzQXJyYXkoIGEgKSkpICl7XHJcbiAgICAgICAgZnVuKCAoVC5pc0FycmF5KCBhICkpID8gYVswXSA6IGEsIDAgKTtcclxuICAgICAgfVxyXG4gICAgICBlbHNlIHtcclxuICAgICAgICBmb3IgKCByLCBpLCB4ID0gMCwgYSA9IChULmlzQXJyYXkoIGEgKSkgPyBhIDogW2FdLCB5ID0gYS5sZW5ndGg7XHJcbiAgICAgICAgICAgICAgeCA8IHk7IHgrKyApXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgaSA9IGFbeF07XHJcbiAgICAgICAgICBpZiAoICFULmlzVW5kZWZpbmVkKCBpICkgfHwgKHUgfHwgZmFsc2UpICl7XHJcbiAgICAgICAgICAgIHIgPSBmdW4oIGksIHggKTtcclxuICAgICAgICAgICAgaWYgKCByID09PSBULkVYSVQgKXtcclxuICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuICAgIH07XHJcblxyXG4gICAgZWFjaGluID0gZnVuY3Rpb24gKCBvLCBmdW4gKSB7XHJcbiAgICAgIC8vICoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKipcclxuICAgICAgLy8gKlxyXG4gICAgICAvLyAqIFRha2VzOlxyXG4gICAgICAvLyAqIG8gPSBhbiBvYmplY3RcclxuICAgICAgLy8gKiBmID0gYSBmdW5jdGlvblxyXG4gICAgICAvLyAqIFB1cnBvc2U6IFVzZWQgdG8gbG9vcCBvdmVyIG9iamVjdHNcclxuICAgICAgLy8gKlxyXG4gICAgICAvLyAqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqICBcclxuICAgICAgdmFyIHggPSAwLCByLCBpO1xyXG5cclxuICAgICAgZm9yICggaSBpbiBvICl7XHJcbiAgICAgICAgaWYgKCBvLmhhc093blByb3BlcnR5KCBpICkgKXtcclxuICAgICAgICAgIHIgPSBmdW4oIG9baV0sIGksIHgrKyApO1xyXG4gICAgICAgICAgaWYgKCByID09PSBULkVYSVQgKXtcclxuICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcblxyXG4gICAgfTtcclxuXHJcbiAgICBBUEkuZXh0ZW5kID0gZnVuY3Rpb24gKCBtLCBmICkge1xyXG4gICAgICAvLyAqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqXHJcbiAgICAgIC8vICpcclxuICAgICAgLy8gKiBUYWtlczogbWV0aG9kIG5hbWUsIGZ1bmN0aW9uXHJcbiAgICAgIC8vICogUHVycG9zZTogQWRkIGEgY3VzdG9tIG1ldGhvZCB0byB0aGUgQVBJXHJcbiAgICAgIC8vICpcclxuICAgICAgLy8gKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKiAgXHJcbiAgICAgIEFQSVttXSA9IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICByZXR1cm4gZi5hcHBseSggdGhpcywgYXJndW1lbnRzICk7XHJcbiAgICAgIH07XHJcbiAgICB9O1xyXG5cclxuICAgIGlzSW5kZXhhYmxlID0gZnVuY3Rpb24gKCBmICkge1xyXG4gICAgICB2YXIgaTtcclxuICAgICAgLy8gQ2hlY2sgdG8gc2VlIGlmIHJlY29yZCBJRFxyXG4gICAgICBpZiAoIFQuaXNTdHJpbmcoIGYgKSAmJiAvW3RdWzAtOV0qW3JdWzAtOV0qL2kudGVzdCggZiApICl7XHJcbiAgICAgICAgcmV0dXJuIHRydWU7XHJcbiAgICAgIH1cclxuICAgICAgLy8gQ2hlY2sgdG8gc2VlIGlmIHJlY29yZFxyXG4gICAgICBpZiAoIFQuaXNPYmplY3QoIGYgKSAmJiBmLl9fX2lkICYmIGYuX19fcyApe1xyXG4gICAgICAgIHJldHVybiB0cnVlO1xyXG4gICAgICB9XHJcblxyXG4gICAgICAvLyBDaGVjayB0byBzZWUgaWYgYXJyYXkgb2YgaW5kZXhlc1xyXG4gICAgICBpZiAoIFQuaXNBcnJheSggZiApICl7XHJcbiAgICAgICAgaSA9IHRydWU7XHJcbiAgICAgICAgZWFjaCggZiwgZnVuY3Rpb24gKCByICkge1xyXG4gICAgICAgICAgaWYgKCAhaXNJbmRleGFibGUoIHIgKSApe1xyXG4gICAgICAgICAgICBpID0gZmFsc2U7XHJcblxyXG4gICAgICAgICAgICByZXR1cm4gVEFGRlkuRVhJVDtcclxuICAgICAgICAgIH1cclxuICAgICAgICB9KTtcclxuICAgICAgICByZXR1cm4gaTtcclxuICAgICAgfVxyXG5cclxuICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgfTtcclxuXHJcbiAgICBydW5GaWx0ZXJzID0gZnVuY3Rpb24gKCByLCBmaWx0ZXIgKSB7XHJcbiAgICAgIC8vICoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKipcclxuICAgICAgLy8gKlxyXG4gICAgICAvLyAqIFRha2VzOiB0YWtlcyBhIHJlY29yZCBhbmQgYSBjb2xsZWN0aW9uIG9mIGZpbHRlcnNcclxuICAgICAgLy8gKiBSZXR1cm5zOiB0cnVlIGlmIHRoZSByZWNvcmQgbWF0Y2hlcywgZmFsc2Ugb3RoZXJ3aXNlXHJcbiAgICAgIC8vICoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKipcclxuICAgICAgdmFyIG1hdGNoID0gdHJ1ZTtcclxuXHJcblxyXG4gICAgICBlYWNoKCBmaWx0ZXIsIGZ1bmN0aW9uICggbWYgKSB7XHJcbiAgICAgICAgc3dpdGNoICggVC50eXBlT2YoIG1mICkgKXtcclxuICAgICAgICAgIGNhc2UgJ2Z1bmN0aW9uJzpcclxuICAgICAgICAgICAgLy8gcnVuIGZ1bmN0aW9uXHJcbiAgICAgICAgICAgIGlmICggIW1mLmFwcGx5KCByICkgKXtcclxuICAgICAgICAgICAgICBtYXRjaCA9IGZhbHNlO1xyXG4gICAgICAgICAgICAgIHJldHVybiBUQUZGWS5FWElUO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgY2FzZSAnYXJyYXknOlxyXG4gICAgICAgICAgICAvLyBsb29wIGFycmF5IGFuZCB0cmVhdCBsaWtlIGEgU1FMIG9yXHJcbiAgICAgICAgICAgIG1hdGNoID0gKG1mLmxlbmd0aCA9PT0gMSkgPyAocnVuRmlsdGVycyggciwgbWZbMF0gKSkgOlxyXG4gICAgICAgICAgICAgIChtZi5sZW5ndGggPT09IDIpID8gKHJ1bkZpbHRlcnMoIHIsIG1mWzBdICkgfHxcclxuICAgICAgICAgICAgICAgIHJ1bkZpbHRlcnMoIHIsIG1mWzFdICkpIDpcclxuICAgICAgICAgICAgICAgIChtZi5sZW5ndGggPT09IDMpID8gKHJ1bkZpbHRlcnMoIHIsIG1mWzBdICkgfHxcclxuICAgICAgICAgICAgICAgICAgcnVuRmlsdGVycyggciwgbWZbMV0gKSB8fCBydW5GaWx0ZXJzKCByLCBtZlsyXSApKSA6XHJcbiAgICAgICAgICAgICAgICAgIChtZi5sZW5ndGggPT09IDQpID8gKHJ1bkZpbHRlcnMoIHIsIG1mWzBdICkgfHxcclxuICAgICAgICAgICAgICAgICAgICBydW5GaWx0ZXJzKCByLCBtZlsxXSApIHx8IHJ1bkZpbHRlcnMoIHIsIG1mWzJdICkgfHxcclxuICAgICAgICAgICAgICAgICAgICBydW5GaWx0ZXJzKCByLCBtZlszXSApKSA6IGZhbHNlO1xyXG4gICAgICAgICAgICBpZiAoIG1mLmxlbmd0aCA+IDQgKXtcclxuICAgICAgICAgICAgICBlYWNoKCBtZiwgZnVuY3Rpb24gKCBmICkge1xyXG4gICAgICAgICAgICAgICAgaWYgKCBydW5GaWx0ZXJzKCByLCBmICkgKXtcclxuICAgICAgICAgICAgICAgICAgbWF0Y2ggPSB0cnVlO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgIH1cclxuICAgICAgfSk7XHJcblxyXG4gICAgICByZXR1cm4gbWF0Y2g7XHJcbiAgICB9O1xyXG5cclxuICAgIHJldHVybkZpbHRlciA9IGZ1bmN0aW9uICggZiApIHtcclxuICAgICAgLy8gKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKlxyXG4gICAgICAvLyAqXHJcbiAgICAgIC8vICogVGFrZXM6IGZpbHRlciBvYmplY3RcclxuICAgICAgLy8gKiBSZXR1cm5zOiBhIGZpbHRlciBmdW5jdGlvblxyXG4gICAgICAvLyAqIFB1cnBvc2U6IFRha2UgYSBmaWx0ZXIgb2JqZWN0IGFuZCByZXR1cm4gYSBmdW5jdGlvbiB0aGF0IGNhbiBiZSB1c2VkIHRvIGNvbXBhcmVcclxuICAgICAgLy8gKiBhIFRhZmZ5REIgcmVjb3JkIHRvIHNlZSBpZiB0aGUgcmVjb3JkIG1hdGNoZXMgYSBxdWVyeVxyXG4gICAgICAvLyAqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqICBcclxuICAgICAgdmFyIG5mID0gW107XHJcbiAgICAgIGlmICggVC5pc1N0cmluZyggZiApICYmIC9bdF1bMC05XSpbcl1bMC05XSovaS50ZXN0KCBmICkgKXtcclxuICAgICAgICBmID0geyBfX19pZCA6IGYgfTtcclxuICAgICAgfVxyXG4gICAgICBpZiAoIFQuaXNBcnJheSggZiApICl7XHJcbiAgICAgICAgLy8gaWYgd2UgYXJlIHdvcmtpbmcgd2l0aCBhbiBhcnJheVxyXG5cclxuICAgICAgICBlYWNoKCBmLCBmdW5jdGlvbiAoIHIgKSB7XHJcbiAgICAgICAgICAvLyBsb29wIHRoZSBhcnJheSBhbmQgcmV0dXJuIGEgZmlsdGVyIGZ1bmMgZm9yIGVhY2ggdmFsdWVcclxuICAgICAgICAgIG5mLnB1c2goIHJldHVybkZpbHRlciggciApICk7XHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgLy8gbm93IGJ1aWxkIGEgZnVuYyB0byBsb29wIG92ZXIgdGhlIGZpbHRlcnMgYW5kIHJldHVybiB0cnVlIGlmIEFOWSBvZiB0aGUgZmlsdGVycyBtYXRjaFxyXG4gICAgICAgIC8vIFRoaXMgaGFuZGxlcyBsb2dpY2FsIE9SIGV4cHJlc3Npb25zXHJcbiAgICAgICAgZiA9IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgIHZhciB0aGF0ID0gdGhpcywgbWF0Y2ggPSBmYWxzZTtcclxuICAgICAgICAgIGVhY2goIG5mLCBmdW5jdGlvbiAoIGYgKSB7XHJcbiAgICAgICAgICAgIGlmICggcnVuRmlsdGVycyggdGhhdCwgZiApICl7XHJcbiAgICAgICAgICAgICAgbWF0Y2ggPSB0cnVlO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICB9KTtcclxuICAgICAgICAgIHJldHVybiBtYXRjaDtcclxuICAgICAgICB9O1xyXG4gICAgICAgIHJldHVybiBmO1xyXG5cclxuICAgICAgfVxyXG4gICAgICAvLyBpZiB3ZSBhcmUgZGVhbGluZyB3aXRoIGFuIE9iamVjdFxyXG4gICAgICBpZiAoIFQuaXNPYmplY3QoIGYgKSApe1xyXG4gICAgICAgIGlmICggVC5pc09iamVjdCggZiApICYmIGYuX19faWQgJiYgZi5fX19zICl7XHJcbiAgICAgICAgICBmID0geyBfX19pZCA6IGYuX19faWQgfTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8vIExvb3Agb3ZlciBlYWNoIHZhbHVlIG9uIHRoZSBvYmplY3QgdG8gcHJlcCBtYXRjaCB0eXBlIGFuZCBtYXRjaCB2YWx1ZVxyXG4gICAgICAgIGVhY2hpbiggZiwgZnVuY3Rpb24gKCB2LCBpICkge1xyXG5cclxuICAgICAgICAgIC8vIGRlZmF1bHQgbWF0Y2ggdHlwZSB0byBJUy9FcXVhbHNcclxuICAgICAgICAgIGlmICggIVQuaXNPYmplY3QoIHYgKSApe1xyXG4gICAgICAgICAgICB2ID0ge1xyXG4gICAgICAgICAgICAgICdpcycgOiB2XHJcbiAgICAgICAgICAgIH07XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgICAvLyBsb29wIG92ZXIgZWFjaCB2YWx1ZSBvbiB0aGUgdmFsdWUgb2JqZWN0ICAtIGlmIGFueVxyXG4gICAgICAgICAgZWFjaGluKCB2LCBmdW5jdGlvbiAoIG10ZXN0LCBzICkge1xyXG4gICAgICAgICAgICAvLyBzID0gbWF0Y2ggdHlwZSwgZS5nLiBpcywgaGFzQWxsLCBsaWtlLCBldGNcclxuICAgICAgICAgICAgdmFyIGMgPSBbXSwgbG9vcGVyO1xyXG5cclxuICAgICAgICAgICAgLy8gZnVuY3Rpb24gdG8gbG9vcCBhbmQgYXBwbHkgZmlsdGVyXHJcbiAgICAgICAgICAgIGxvb3BlciA9IChzID09PSAnaGFzQWxsJykgP1xyXG4gICAgICAgICAgICAgIGZ1bmN0aW9uICggbXRlc3QsIGZ1bmMgKSB7XHJcbiAgICAgICAgICAgICAgICBmdW5jKCBtdGVzdCApO1xyXG4gICAgICAgICAgICAgIH0gOiBlYWNoO1xyXG5cclxuICAgICAgICAgICAgLy8gbG9vcCBvdmVyIGVhY2ggdGVzdFxyXG4gICAgICAgICAgICBsb29wZXIoIG10ZXN0LCBmdW5jdGlvbiAoIG10ZXN0ICkge1xyXG5cclxuICAgICAgICAgICAgICAvLyBzdSA9IG1hdGNoIHN1Y2Nlc3NcclxuICAgICAgICAgICAgICAvLyBmID0gbWF0Y2ggZmFsc2VcclxuICAgICAgICAgICAgICB2YXIgc3UgPSB0cnVlLCBmID0gZmFsc2UsIG1hdGNoRnVuYztcclxuXHJcblxyXG4gICAgICAgICAgICAgIC8vIHB1c2ggYSBmdW5jdGlvbiBvbnRvIHRoZSBmaWx0ZXIgY29sbGVjdGlvbiB0byBkbyB0aGUgbWF0Y2hpbmdcclxuICAgICAgICAgICAgICBtYXRjaEZ1bmMgPSBmdW5jdGlvbiAoKSB7XHJcblxyXG4gICAgICAgICAgICAgICAgLy8gZ2V0IHRoZSB2YWx1ZSBmcm9tIHRoZSByZWNvcmRcclxuICAgICAgICAgICAgICAgIHZhclxyXG4gICAgICAgICAgICAgICAgICBtdmFsdWUgICA9IHRoaXNbaV0sXHJcbiAgICAgICAgICAgICAgICAgIGVxZXEgICAgID0gJz09JyxcclxuICAgICAgICAgICAgICAgICAgYmFuZ2VxICAgPSAnIT0nLFxyXG4gICAgICAgICAgICAgICAgICBlcWVxZXEgICA9ICc9PT0nLFxyXG4gICAgICAgICAgICAgICAgICBsdCAgID0gJzwnLFxyXG4gICAgICAgICAgICAgICAgICBndCAgID0gJz4nLFxyXG4gICAgICAgICAgICAgICAgICBsdGVxICAgPSAnPD0nLFxyXG4gICAgICAgICAgICAgICAgICBndGVxICAgPSAnPj0nLFxyXG4gICAgICAgICAgICAgICAgICBiYW5nZXFlcSA9ICchPT0nLFxyXG4gICAgICAgICAgICAgICAgICByXHJcbiAgICAgICAgICAgICAgICAgIDtcclxuXHJcbiAgICAgICAgICAgICAgICBpZiAodHlwZW9mIG12YWx1ZSA9PT0gJ3VuZGVmaW5lZCcpIHtcclxuICAgICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgXHJcbiAgICAgICAgICAgICAgICBpZiAoIChzLmluZGV4T2YoICchJyApID09PSAwKSAmJiBzICE9PSBiYW5nZXEgJiZcclxuICAgICAgICAgICAgICAgICAgcyAhPT0gYmFuZ2VxZXEgKVxyXG4gICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAvLyBpZiB0aGUgZmlsdGVyIG5hbWUgc3RhcnRzIHdpdGggISBhcyBpbiAnIWlzJyB0aGVuIHJldmVyc2UgdGhlIG1hdGNoIGxvZ2ljIGFuZCByZW1vdmUgdGhlICFcclxuICAgICAgICAgICAgICAgICAgc3UgPSBmYWxzZTtcclxuICAgICAgICAgICAgICAgICAgcyA9IHMuc3Vic3RyaW5nKCAxLCBzLmxlbmd0aCApO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgLy8gZ2V0IHRoZSBtYXRjaCByZXN1bHRzIGJhc2VkIG9uIHRoZSBzL21hdGNoIHR5cGVcclxuICAgICAgICAgICAgICAgIC8qanNsaW50IGVxZXEgOiB0cnVlICovXHJcbiAgICAgICAgICAgICAgICByID0gKFxyXG4gICAgICAgICAgICAgICAgICAocyA9PT0gJ3JlZ2V4JykgPyAobXRlc3QudGVzdCggbXZhbHVlICkpIDogKHMgPT09ICdsdCcgfHwgcyA9PT0gbHQpXHJcbiAgICAgICAgICAgICAgICAgID8gKG12YWx1ZSA8IG10ZXN0KSAgOiAocyA9PT0gJ2d0JyB8fCBzID09PSBndClcclxuICAgICAgICAgICAgICAgICAgPyAobXZhbHVlID4gbXRlc3QpICA6IChzID09PSAnbHRlJyB8fCBzID09PSBsdGVxKVxyXG4gICAgICAgICAgICAgICAgICA/IChtdmFsdWUgPD0gbXRlc3QpIDogKHMgPT09ICdndGUnIHx8IHMgPT09IGd0ZXEpXHJcbiAgICAgICAgICAgICAgICAgID8gKG12YWx1ZSA+PSBtdGVzdCkgOiAocyA9PT0gJ2xlZnQnKVxyXG4gICAgICAgICAgICAgICAgICA/IChtdmFsdWUuaW5kZXhPZiggbXRlc3QgKSA9PT0gMCkgOiAocyA9PT0gJ2xlZnRub2Nhc2UnKVxyXG4gICAgICAgICAgICAgICAgICA/IChtdmFsdWUudG9Mb3dlckNhc2UoKS5pbmRleE9mKCBtdGVzdC50b0xvd2VyQ2FzZSgpIClcclxuICAgICAgICAgICAgICAgICAgICA9PT0gMCkgOiAocyA9PT0gJ3JpZ2h0JylcclxuICAgICAgICAgICAgICAgICAgPyAobXZhbHVlLnN1YnN0cmluZyggKG12YWx1ZS5sZW5ndGggLSBtdGVzdC5sZW5ndGgpIClcclxuICAgICAgICAgICAgICAgICAgICA9PT0gbXRlc3QpIDogKHMgPT09ICdyaWdodG5vY2FzZScpXHJcbiAgICAgICAgICAgICAgICAgID8gKG12YWx1ZS50b0xvd2VyQ2FzZSgpLnN1YnN0cmluZyhcclxuICAgICAgICAgICAgICAgICAgICAobXZhbHVlLmxlbmd0aCAtIG10ZXN0Lmxlbmd0aCkgKSA9PT0gbXRlc3QudG9Mb3dlckNhc2UoKSlcclxuICAgICAgICAgICAgICAgICAgICA6IChzID09PSAnbGlrZScpXHJcbiAgICAgICAgICAgICAgICAgID8gKG12YWx1ZS5pbmRleE9mKCBtdGVzdCApID49IDApIDogKHMgPT09ICdsaWtlbm9jYXNlJylcclxuICAgICAgICAgICAgICAgICAgPyAobXZhbHVlLnRvTG93ZXJDYXNlKCkuaW5kZXhPZihtdGVzdC50b0xvd2VyQ2FzZSgpKSA+PSAwKVxyXG4gICAgICAgICAgICAgICAgICAgIDogKHMgPT09IGVxZXFlcSB8fCBzID09PSAnaXMnKVxyXG4gICAgICAgICAgICAgICAgICA/IChtdmFsdWUgPT09ICBtdGVzdCkgOiAocyA9PT0gZXFlcSlcclxuICAgICAgICAgICAgICAgICAgPyAobXZhbHVlID09IG10ZXN0KSA6IChzID09PSBiYW5nZXFlcSlcclxuICAgICAgICAgICAgICAgICAgPyAobXZhbHVlICE9PSAgbXRlc3QpIDogKHMgPT09IGJhbmdlcSlcclxuICAgICAgICAgICAgICAgICAgPyAobXZhbHVlICE9IG10ZXN0KSA6IChzID09PSAnaXNub2Nhc2UnKVxyXG4gICAgICAgICAgICAgICAgICA/IChtdmFsdWUudG9Mb3dlckNhc2VcclxuICAgICAgICAgICAgICAgICAgICA/IG12YWx1ZS50b0xvd2VyQ2FzZSgpID09PSBtdGVzdC50b0xvd2VyQ2FzZSgpXHJcbiAgICAgICAgICAgICAgICAgICAgICA6IG12YWx1ZSA9PT0gbXRlc3QpIDogKHMgPT09ICdoYXMnKVxyXG4gICAgICAgICAgICAgICAgICA/IChULmhhcyggbXZhbHVlLCBtdGVzdCApKSA6IChzID09PSAnaGFzYWxsJylcclxuICAgICAgICAgICAgICAgICAgPyAoVC5oYXNBbGwoIG12YWx1ZSwgbXRlc3QgKSkgOiAocyA9PT0gJ2NvbnRhaW5zJylcclxuICAgICAgICAgICAgICAgICAgPyAoVEFGRlkuaXNBcnJheShtdmFsdWUpICYmIG12YWx1ZS5pbmRleE9mKG10ZXN0KSA+IC0xKSA6IChcclxuICAgICAgICAgICAgICAgICAgICBzLmluZGV4T2YoICdpcycgKSA9PT0gLTFcclxuICAgICAgICAgICAgICAgICAgICAgICYmICFUQUZGWS5pc051bGwoIG12YWx1ZSApXHJcbiAgICAgICAgICAgICAgICAgICAgICAmJiAhVEFGRlkuaXNVbmRlZmluZWQoIG12YWx1ZSApXHJcbiAgICAgICAgICAgICAgICAgICAgICAmJiAhVEFGRlkuaXNPYmplY3QoIG10ZXN0IClcclxuICAgICAgICAgICAgICAgICAgICAgICYmICFUQUZGWS5pc0FycmF5KCBtdGVzdCApXHJcbiAgICAgICAgICAgICAgICAgICAgKVxyXG4gICAgICAgICAgICAgICAgICA/IChtdGVzdCA9PT0gbXZhbHVlW3NdKVxyXG4gICAgICAgICAgICAgICAgICAgIDogKFRbc10gJiYgVC5pc0Z1bmN0aW9uKCBUW3NdIClcclxuICAgICAgICAgICAgICAgICAgICAmJiBzLmluZGV4T2YoICdpcycgKSA9PT0gMClcclxuICAgICAgICAgICAgICAgICAgPyBUW3NdKCBtdmFsdWUgKSA9PT0gbXRlc3RcclxuICAgICAgICAgICAgICAgICAgICA6IChUW3NdICYmIFQuaXNGdW5jdGlvbiggVFtzXSApKVxyXG4gICAgICAgICAgICAgICAgICA/IFRbc10oIG12YWx1ZSwgbXRlc3QgKSA6IChmYWxzZSlcclxuICAgICAgICAgICAgICAgICk7XHJcbiAgICAgICAgICAgICAgICAvKmpzbGludCBlcWVxIDogZmFsc2UgKi9cclxuICAgICAgICAgICAgICAgIHIgPSAociAmJiAhc3UpID8gZmFsc2UgOiAoIXIgJiYgIXN1KSA/IHRydWUgOiByO1xyXG5cclxuICAgICAgICAgICAgICAgIHJldHVybiByO1xyXG4gICAgICAgICAgICAgIH07XHJcbiAgICAgICAgICAgICAgYy5wdXNoKCBtYXRjaEZ1bmMgKTtcclxuXHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAvLyBpZiBvbmx5IG9uZSBmaWx0ZXIgaW4gdGhlIGNvbGxlY3Rpb24gcHVzaCBpdCBvbnRvIHRoZSBmaWx0ZXIgbGlzdCB3aXRob3V0IHRoZSBhcnJheVxyXG4gICAgICAgICAgICBpZiAoIGMubGVuZ3RoID09PSAxICl7XHJcblxyXG4gICAgICAgICAgICAgIG5mLnB1c2goIGNbMF0gKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgICAvLyBlbHNlIGJ1aWxkIGEgZnVuY3Rpb24gdG8gbG9vcCBvdmVyIGFsbCB0aGUgZmlsdGVycyBhbmQgcmV0dXJuIHRydWUgb25seSBpZiBBTEwgbWF0Y2hcclxuICAgICAgICAgICAgICAvLyB0aGlzIGlzIGEgbG9naWNhbCBBTkRcclxuICAgICAgICAgICAgICBuZi5wdXNoKCBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgICAgICB2YXIgdGhhdCA9IHRoaXMsIG1hdGNoID0gZmFsc2U7XHJcbiAgICAgICAgICAgICAgICBlYWNoKCBjLCBmdW5jdGlvbiAoIGYgKSB7XHJcbiAgICAgICAgICAgICAgICAgIGlmICggZi5hcHBseSggdGhhdCApICl7XHJcbiAgICAgICAgICAgICAgICAgICAgbWF0Y2ggPSB0cnVlO1xyXG4gICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgICAgIHJldHVybiBtYXRjaDtcclxuICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgfSk7XHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgLy8gZmluYWxseSByZXR1cm4gYSBzaW5nbGUgZnVuY3Rpb24gdGhhdCB3cmFwcyBhbGwgdGhlIG90aGVyIGZ1bmN0aW9ucyBhbmQgd2lsbCBydW4gYSBxdWVyeVxyXG4gICAgICAgIC8vIHdoZXJlIGFsbCBmdW5jdGlvbnMgaGF2ZSB0byByZXR1cm4gdHJ1ZSBmb3IgYSByZWNvcmQgdG8gYXBwZWFyIGluIGEgcXVlcnkgcmVzdWx0XHJcbiAgICAgICAgZiA9IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgIHZhciB0aGF0ID0gdGhpcywgbWF0Y2ggPSB0cnVlO1xyXG4gICAgICAgICAgLy8gZmFzdGVyIGlmIGxlc3MgdGhhbiAgNCBmdW5jdGlvbnNcclxuICAgICAgICAgIG1hdGNoID0gKG5mLmxlbmd0aCA9PT0gMSAmJiAhbmZbMF0uYXBwbHkoIHRoYXQgKSkgPyBmYWxzZSA6XHJcbiAgICAgICAgICAgIChuZi5sZW5ndGggPT09IDIgJiZcclxuICAgICAgICAgICAgICAoIW5mWzBdLmFwcGx5KCB0aGF0ICkgfHwgIW5mWzFdLmFwcGx5KCB0aGF0ICkpKSA/IGZhbHNlIDpcclxuICAgICAgICAgICAgICAobmYubGVuZ3RoID09PSAzICYmXHJcbiAgICAgICAgICAgICAgICAoIW5mWzBdLmFwcGx5KCB0aGF0ICkgfHwgIW5mWzFdLmFwcGx5KCB0aGF0ICkgfHxcclxuICAgICAgICAgICAgICAgICAgIW5mWzJdLmFwcGx5KCB0aGF0ICkpKSA/IGZhbHNlIDpcclxuICAgICAgICAgICAgICAgIChuZi5sZW5ndGggPT09IDQgJiZcclxuICAgICAgICAgICAgICAgICAgKCFuZlswXS5hcHBseSggdGhhdCApIHx8ICFuZlsxXS5hcHBseSggdGhhdCApIHx8XHJcbiAgICAgICAgICAgICAgICAgICAgIW5mWzJdLmFwcGx5KCB0aGF0ICkgfHwgIW5mWzNdLmFwcGx5KCB0aGF0ICkpKSA/IGZhbHNlXHJcbiAgICAgICAgICAgICAgICAgIDogdHJ1ZTtcclxuICAgICAgICAgIGlmICggbmYubGVuZ3RoID4gNCApe1xyXG4gICAgICAgICAgICBlYWNoKCBuZiwgZnVuY3Rpb24gKCBmICkge1xyXG4gICAgICAgICAgICAgIGlmICggIXJ1bkZpbHRlcnMoIHRoYXQsIGYgKSApe1xyXG4gICAgICAgICAgICAgICAgbWF0Y2ggPSBmYWxzZTtcclxuICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgICAgcmV0dXJuIG1hdGNoO1xyXG4gICAgICAgIH07XHJcbiAgICAgICAgcmV0dXJuIGY7XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIC8vIGlmIGZ1bmN0aW9uXHJcbiAgICAgIGlmICggVC5pc0Z1bmN0aW9uKCBmICkgKXtcclxuICAgICAgICByZXR1cm4gZjtcclxuICAgICAgfVxyXG4gICAgfTtcclxuXHJcbiAgICBvcmRlckJ5Q29sID0gZnVuY3Rpb24gKCBhciwgbyApIHtcclxuICAgICAgLy8gKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKlxyXG4gICAgICAvLyAqXHJcbiAgICAgIC8vICogVGFrZXM6IHRha2VzIGFuIGFycmF5IGFuZCBhIHNvcnQgb2JqZWN0XHJcbiAgICAgIC8vICogUmV0dXJuczogdGhlIGFycmF5IHNvcnRlZFxyXG4gICAgICAvLyAqIFB1cnBvc2U6IEFjY2VwdCBmaWx0ZXJzIHN1Y2ggYXMgXCJbY29sXSwgW2NvbDJdXCIgb3IgXCJbY29sXSBkZXNjXCIgYW5kIHNvcnQgb24gdGhvc2UgY29sdW1uc1xyXG4gICAgICAvLyAqXHJcbiAgICAgIC8vICoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKipcclxuXHJcbiAgICAgIHZhciBzb3J0RnVuYyA9IGZ1bmN0aW9uICggYSwgYiApIHtcclxuICAgICAgICAvLyBmdW5jdGlvbiB0byBwYXNzIHRvIHRoZSBuYXRpdmUgYXJyYXkuc29ydCB0byBzb3J0IGFuIGFycmF5XHJcbiAgICAgICAgdmFyIHIgPSAwO1xyXG5cclxuICAgICAgICBULmVhY2goIG8sIGZ1bmN0aW9uICggc2QgKSB7XHJcbiAgICAgICAgICAvLyBsb29wIG92ZXIgdGhlIHNvcnQgaW5zdHJ1Y3Rpb25zXHJcbiAgICAgICAgICAvLyBnZXQgdGhlIGNvbHVtbiBuYW1lXHJcbiAgICAgICAgICB2YXIgbywgY29sLCBkaXIsIGMsIGQ7XHJcbiAgICAgICAgICBvID0gc2Quc3BsaXQoICcgJyApO1xyXG4gICAgICAgICAgY29sID0gb1swXTtcclxuXHJcbiAgICAgICAgICAvLyBnZXQgdGhlIGRpcmVjdGlvblxyXG4gICAgICAgICAgZGlyID0gKG8ubGVuZ3RoID09PSAxKSA/IFwibG9naWNhbFwiIDogb1sxXTtcclxuXHJcblxyXG4gICAgICAgICAgaWYgKCBkaXIgPT09ICdsb2dpY2FsJyApe1xyXG4gICAgICAgICAgICAvLyBpZiBkaXIgaXMgbG9naWNhbCB0aGFuIGdyYWIgdGhlIGNoYXJudW0gYXJyYXlzIGZvciB0aGUgdHdvIHZhbHVlcyB3ZSBhcmUgbG9va2luZyBhdFxyXG4gICAgICAgICAgICBjID0gbnVtY2hhcnNwbGl0KCBhW2NvbF0gKTtcclxuICAgICAgICAgICAgZCA9IG51bWNoYXJzcGxpdCggYltjb2xdICk7XHJcbiAgICAgICAgICAgIC8vIGxvb3Agb3ZlciB0aGUgY2hhcm51bWFycmF5cyB1bnRpbCBvbmUgdmFsdWUgaXMgaGlnaGVyIHRoYW4gdGhlIG90aGVyXHJcbiAgICAgICAgICAgIFQuZWFjaCggKGMubGVuZ3RoIDw9IGQubGVuZ3RoKSA/IGMgOiBkLCBmdW5jdGlvbiAoIHgsIGkgKSB7XHJcbiAgICAgICAgICAgICAgaWYgKCBjW2ldIDwgZFtpXSApe1xyXG4gICAgICAgICAgICAgICAgciA9IC0xO1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIFRBRkZZLkVYSVQ7XHJcbiAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgIGVsc2UgaWYgKCBjW2ldID4gZFtpXSApe1xyXG4gICAgICAgICAgICAgICAgciA9IDE7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gVEFGRlkuRVhJVDtcclxuICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH0gKTtcclxuICAgICAgICAgIH1cclxuICAgICAgICAgIGVsc2UgaWYgKCBkaXIgPT09ICdsb2dpY2FsZGVzYycgKXtcclxuICAgICAgICAgICAgLy8gaWYgbG9naWNhbGRlc2MgdGhhbiBncmFiIHRoZSBjaGFybnVtIGFycmF5cyBmb3IgdGhlIHR3byB2YWx1ZXMgd2UgYXJlIGxvb2tpbmcgYXRcclxuICAgICAgICAgICAgYyA9IG51bWNoYXJzcGxpdCggYVtjb2xdICk7XHJcbiAgICAgICAgICAgIGQgPSBudW1jaGFyc3BsaXQoIGJbY29sXSApO1xyXG4gICAgICAgICAgICAvLyBsb29wIG92ZXIgdGhlIGNoYXJudW1hcnJheXMgdW50aWwgb25lIHZhbHVlIGlzIGxvd2VyIHRoYW4gdGhlIG90aGVyXHJcbiAgICAgICAgICAgIFQuZWFjaCggKGMubGVuZ3RoIDw9IGQubGVuZ3RoKSA/IGMgOiBkLCBmdW5jdGlvbiAoIHgsIGkgKSB7XHJcbiAgICAgICAgICAgICAgaWYgKCBjW2ldID4gZFtpXSApe1xyXG4gICAgICAgICAgICAgICAgciA9IC0xO1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIFRBRkZZLkVYSVQ7XHJcbiAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgIGVsc2UgaWYgKCBjW2ldIDwgZFtpXSApe1xyXG4gICAgICAgICAgICAgICAgciA9IDE7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gVEFGRlkuRVhJVDtcclxuICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH0gKTtcclxuICAgICAgICAgIH1cclxuICAgICAgICAgIGVsc2UgaWYgKCBkaXIgPT09ICdhc2VjJyAmJiBhW2NvbF0gPCBiW2NvbF0gKXtcclxuICAgICAgICAgICAgLy8gaWYgYXNlYyAtIGRlZmF1bHQgLSBjaGVjayB0byBzZWUgd2hpY2ggaXMgaGlnaGVyXHJcbiAgICAgICAgICAgIHIgPSAtMTtcclxuICAgICAgICAgICAgcmV0dXJuIFQuRVhJVDtcclxuICAgICAgICAgIH1cclxuICAgICAgICAgIGVsc2UgaWYgKCBkaXIgPT09ICdhc2VjJyAmJiBhW2NvbF0gPiBiW2NvbF0gKXtcclxuICAgICAgICAgICAgLy8gaWYgYXNlYyAtIGRlZmF1bHQgLSBjaGVjayB0byBzZWUgd2hpY2ggaXMgaGlnaGVyXHJcbiAgICAgICAgICAgIHIgPSAxO1xyXG4gICAgICAgICAgICByZXR1cm4gVC5FWElUO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgICAgZWxzZSBpZiAoIGRpciA9PT0gJ2Rlc2MnICYmIGFbY29sXSA+IGJbY29sXSApe1xyXG4gICAgICAgICAgICAvLyBpZiBkZXNjIGNoZWNrIHRvIHNlZSB3aGljaCBpcyBsb3dlclxyXG4gICAgICAgICAgICByID0gLTE7XHJcbiAgICAgICAgICAgIHJldHVybiBULkVYSVQ7XHJcblxyXG4gICAgICAgICAgfVxyXG4gICAgICAgICAgZWxzZSBpZiAoIGRpciA9PT0gJ2Rlc2MnICYmIGFbY29sXSA8IGJbY29sXSApe1xyXG4gICAgICAgICAgICAvLyBpZiBkZXNjIGNoZWNrIHRvIHNlZSB3aGljaCBpcyBsb3dlclxyXG4gICAgICAgICAgICByID0gMTtcclxuICAgICAgICAgICAgcmV0dXJuIFQuRVhJVDtcclxuXHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgICAvLyBpZiByIGlzIHN0aWxsIDAgYW5kIHdlIGFyZSBkb2luZyBhIGxvZ2ljYWwgc29ydCB0aGFuIGxvb2sgdG8gc2VlIGlmIG9uZSBhcnJheSBpcyBsb25nZXIgdGhhbiB0aGUgb3RoZXJcclxuICAgICAgICAgIGlmICggciA9PT0gMCAmJiBkaXIgPT09ICdsb2dpY2FsJyAmJiBjLmxlbmd0aCA8IGQubGVuZ3RoICl7XHJcbiAgICAgICAgICAgIHIgPSAtMTtcclxuICAgICAgICAgIH1cclxuICAgICAgICAgIGVsc2UgaWYgKCByID09PSAwICYmIGRpciA9PT0gJ2xvZ2ljYWwnICYmIGMubGVuZ3RoID4gZC5sZW5ndGggKXtcclxuICAgICAgICAgICAgciA9IDE7XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgICBlbHNlIGlmICggciA9PT0gMCAmJiBkaXIgPT09ICdsb2dpY2FsZGVzYycgJiYgYy5sZW5ndGggPiBkLmxlbmd0aCApe1xyXG4gICAgICAgICAgICByID0gLTE7XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgICBlbHNlIGlmICggciA9PT0gMCAmJiBkaXIgPT09ICdsb2dpY2FsZGVzYycgJiYgYy5sZW5ndGggPCBkLmxlbmd0aCApe1xyXG4gICAgICAgICAgICByID0gMTtcclxuICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICBpZiAoIHIgIT09IDAgKXtcclxuICAgICAgICAgICAgcmV0dXJuIFQuRVhJVDtcclxuICAgICAgICAgIH1cclxuXHJcblxyXG4gICAgICAgIH0gKTtcclxuICAgICAgICByZXR1cm4gcjtcclxuICAgICAgfTtcclxuICAgICAgLy8gY2FsbCB0aGUgc29ydCBmdW5jdGlvbiBhbmQgcmV0dXJuIHRoZSBuZXdseSBzb3J0ZWQgYXJyYXlcclxuICAgICAgcmV0dXJuIChhciAmJiBhci5wdXNoKSA/IGFyLnNvcnQoIHNvcnRGdW5jICkgOiBhcjtcclxuXHJcblxyXG4gICAgfTtcclxuXHJcbiAgICAvLyAqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqXHJcbiAgICAvLyAqXHJcbiAgICAvLyAqIFRha2VzOiBhIHN0cmluZyBjb250YWluaW5nIG51bWJlcnMgYW5kIGxldHRlcnMgYW5kIHR1cm4gaXQgaW50byBhbiBhcnJheVxyXG4gICAgLy8gKiBSZXR1cm5zOiByZXR1cm4gYW4gYXJyYXkgb2YgbnVtYmVycyBhbmQgbGV0dGVyc1xyXG4gICAgLy8gKiBQdXJwb3NlOiBVc2VkIGZvciBsb2dpY2FsIHNvcnRpbmcuIFN0cmluZyBFeGFtcGxlOiAxMkFCQyByZXN1bHRzOiBbMTIsJ0FCQyddXHJcbiAgICAvLyAqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqIFxyXG4gICAgKGZ1bmN0aW9uICgpIHtcclxuICAgICAgLy8gY3JlYXRlcyBhIGNhY2hlIGZvciBudW1jaGFyIGNvbnZlcnNpb25zXHJcbiAgICAgIHZhciBjYWNoZSA9IHt9LCBjYWNoY291bnRlciA9IDA7XHJcbiAgICAgIC8vIGNyZWF0ZXMgdGhlIG51bWNoYXJzcGxpdCBmdW5jdGlvblxyXG4gICAgICBudW1jaGFyc3BsaXQgPSBmdW5jdGlvbiAoIHRoaW5nICkge1xyXG4gICAgICAgIC8vIGlmIG92ZXIgMTAwMCBpdGVtcyBleGlzdCBpbiB0aGUgY2FjaGUsIGNsZWFyIGl0IGFuZCBzdGFydCBvdmVyXHJcbiAgICAgICAgaWYgKCBjYWNoY291bnRlciA+IGNtYXggKXtcclxuICAgICAgICAgIGNhY2hlID0ge307XHJcbiAgICAgICAgICBjYWNoY291bnRlciA9IDA7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvLyBpZiBhIGNhY2hlIGNhbiBiZSBmb3VuZCBmb3IgYSBudW1jaGFyIHRoZW4gcmV0dXJuIGl0cyBhcnJheSB2YWx1ZVxyXG4gICAgICAgIHJldHVybiBjYWNoZVsnXycgKyB0aGluZ10gfHwgKGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgIC8vIG90aGVyd2lzZSBkbyB0aGUgY29udmVyc2lvblxyXG4gICAgICAgICAgLy8gbWFrZSBzdXJlIGl0IGlzIGEgc3RyaW5nIGFuZCBzZXR1cCBzbyBvdGhlciB2YXJpYWJsZXNcclxuICAgICAgICAgIHZhciBudGhpbmcgPSBTdHJpbmcoIHRoaW5nICksXHJcbiAgICAgICAgICAgIG5hID0gW10sXHJcbiAgICAgICAgICAgIHJ2ID0gJ18nLFxyXG4gICAgICAgICAgICBydCA9ICcnLFxyXG4gICAgICAgICAgICB4LCB4eCwgYztcclxuXHJcbiAgICAgICAgICAvLyBsb29wIG92ZXIgdGhlIHN0cmluZyBjaGFyIGJ5IGNoYXJcclxuICAgICAgICAgIGZvciAoIHggPSAwLCB4eCA9IG50aGluZy5sZW5ndGg7IHggPCB4eDsgeCsrICl7XHJcbiAgICAgICAgICAgIC8vIHRha2UgdGhlIGNoYXIgYXQgZWFjaCBsb2NhdGlvblxyXG4gICAgICAgICAgICBjID0gbnRoaW5nLmNoYXJDb2RlQXQoIHggKTtcclxuICAgICAgICAgICAgLy8gY2hlY2sgdG8gc2VlIGlmIGl0IGlzIGEgdmFsaWQgbnVtYmVyIGNoYXIgYW5kIGFwcGVuZCBpdCB0byB0aGUgYXJyYXkuXHJcbiAgICAgICAgICAgIC8vIGlmIGxhc3QgY2hhciB3YXMgYSBzdHJpbmcgcHVzaCB0aGUgc3RyaW5nIHRvIHRoZSBjaGFybnVtIGFycmF5XHJcbiAgICAgICAgICAgIGlmICggKCBjID49IDQ4ICYmIGMgPD0gNTcgKSB8fCBjID09PSA0NiApe1xyXG4gICAgICAgICAgICAgIGlmICggcnQgIT09ICduJyApe1xyXG4gICAgICAgICAgICAgICAgcnQgPSAnbic7XHJcbiAgICAgICAgICAgICAgICBuYS5wdXNoKCBydi50b0xvd2VyQ2FzZSgpICk7XHJcbiAgICAgICAgICAgICAgICBydiA9ICcnO1xyXG4gICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICBydiA9IHJ2ICsgbnRoaW5nLmNoYXJBdCggeCApO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICAgIC8vIGNoZWNrIHRvIHNlZSBpZiBpdCBpcyBhIHZhbGlkIHN0cmluZyBjaGFyIGFuZCBhcHBlbmQgdG8gc3RyaW5nXHJcbiAgICAgICAgICAgICAgLy8gaWYgbGFzdCBjaGFyIHdhcyBhIG51bWJlciBwdXNoIHRoZSB3aG9sZSBudW1iZXIgdG8gdGhlIGNoYXJudW0gYXJyYXlcclxuICAgICAgICAgICAgICBpZiAoIHJ0ICE9PSAncycgKXtcclxuICAgICAgICAgICAgICAgIHJ0ID0gJ3MnO1xyXG4gICAgICAgICAgICAgICAgbmEucHVzaCggcGFyc2VGbG9hdCggcnYgKSApO1xyXG4gICAgICAgICAgICAgICAgcnYgPSAnJztcclxuICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgcnYgPSBydiArIG50aGluZy5jaGFyQXQoIHggKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgfVxyXG4gICAgICAgICAgLy8gb25jZSBkb25lLCBwdXNoIHRoZSBsYXN0IHZhbHVlIHRvIHRoZSBjaGFybnVtIGFycmF5IGFuZCByZW1vdmUgdGhlIGZpcnN0IHVuZWVkZWQgaXRlbVxyXG4gICAgICAgICAgbmEucHVzaCggKHJ0ID09PSAnbicpID8gcGFyc2VGbG9hdCggcnYgKSA6IHJ2LnRvTG93ZXJDYXNlKCkgKTtcclxuICAgICAgICAgIG5hLnNoaWZ0KCk7XHJcbiAgICAgICAgICAvLyBhZGQgdG8gY2FjaGVcclxuICAgICAgICAgIGNhY2hlWydfJyArIHRoaW5nXSA9IG5hO1xyXG4gICAgICAgICAgY2FjaGNvdW50ZXIrKztcclxuICAgICAgICAgIC8vIHJldHVybiBjaGFybnVtIGFycmF5XHJcbiAgICAgICAgICByZXR1cm4gbmE7XHJcbiAgICAgICAgfSgpKTtcclxuICAgICAgfTtcclxuICAgIH0oKSk7XHJcblxyXG4gICAgLy8gKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKlxyXG4gICAgLy8gKlxyXG4gICAgLy8gKiBSdW5zIGEgcXVlcnlcclxuICAgIC8vICoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKiogXHJcblxyXG5cclxuICAgIHJ1biA9IGZ1bmN0aW9uICgpIHtcclxuICAgICAgdGhpcy5jb250ZXh0KCB7XHJcbiAgICAgICAgcmVzdWx0cyA6IHRoaXMuZ2V0REJJKCkucXVlcnkoIHRoaXMuY29udGV4dCgpIClcclxuICAgICAgfSk7XHJcblxyXG4gICAgfTtcclxuXHJcbiAgICBBUEkuZXh0ZW5kKCAnZmlsdGVyJywgZnVuY3Rpb24gKCkge1xyXG4gICAgICAvLyAqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqXHJcbiAgICAgIC8vICpcclxuICAgICAgLy8gKiBUYWtlczogdGFrZXMgdW5saW1pdGVkIGZpbHRlciBvYmplY3RzIGFzIGFyZ3VtZW50c1xyXG4gICAgICAvLyAqIFJldHVybnM6IG1ldGhvZCBjb2xsZWN0aW9uXHJcbiAgICAgIC8vICogUHVycG9zZTogVGFrZSBmaWx0ZXJzIGFzIG9iamVjdHMgYW5kIGNhY2hlIGZ1bmN0aW9ucyBmb3IgbGF0ZXIgbG9va3VwIHdoZW4gYSBxdWVyeSBpcyBydW5cclxuICAgICAgLy8gKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKiBcclxuICAgICAgdmFyXHJcbiAgICAgICAgbmMgPSBUQUZGWS5tZXJnZU9iaiggdGhpcy5jb250ZXh0KCksIHsgcnVuIDogbnVsbCB9ICksXHJcbiAgICAgICAgbnEgPSBbXVxyXG4gICAgICA7XHJcbiAgICAgIGVhY2goIG5jLnEsIGZ1bmN0aW9uICggdiApIHtcclxuICAgICAgICBucS5wdXNoKCB2ICk7XHJcbiAgICAgIH0pO1xyXG4gICAgICBuYy5xID0gbnE7XHJcbiAgICAgIC8vIEhhZG5sZSBwYXNzaW5nIG9mIF9fX0lEIG9yIGEgcmVjb3JkIG9uIGxvb2t1cC5cclxuICAgICAgZWFjaCggYXJndW1lbnRzLCBmdW5jdGlvbiAoIGYgKSB7XHJcbiAgICAgICAgbmMucS5wdXNoKCByZXR1cm5GaWx0ZXIoIGYgKSApO1xyXG4gICAgICAgIG5jLmZpbHRlclJhdy5wdXNoKCBmICk7XHJcbiAgICAgIH0pO1xyXG5cclxuICAgICAgcmV0dXJuIHRoaXMuZ2V0cm9vdCggbmMgKTtcclxuICAgIH0pO1xyXG5cclxuICAgIEFQSS5leHRlbmQoICdvcmRlcicsIGZ1bmN0aW9uICggbyApIHtcclxuICAgICAgLy8gKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKlxyXG4gICAgICAvLyAqXHJcbiAgICAgIC8vICogUHVycG9zZTogdGFrZXMgYSBzdHJpbmcgYW5kIGNyZWF0ZXMgYW4gYXJyYXkgb2Ygb3JkZXIgaW5zdHJ1Y3Rpb25zIHRvIGJlIHVzZWQgd2l0aCBhIHF1ZXJ5XHJcbiAgICAgIC8vICoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKipcclxuXHJcbiAgICAgIG8gPSBvLnNwbGl0KCAnLCcgKTtcclxuICAgICAgdmFyIHggPSBbXSwgbmM7XHJcblxyXG4gICAgICBlYWNoKCBvLCBmdW5jdGlvbiAoIHIgKSB7XHJcbiAgICAgICAgeC5wdXNoKCByLnJlcGxhY2UoIC9eXFxzKi8sICcnICkucmVwbGFjZSggL1xccyokLywgJycgKSApO1xyXG4gICAgICB9KTtcclxuXHJcbiAgICAgIG5jID0gVEFGRlkubWVyZ2VPYmooIHRoaXMuY29udGV4dCgpLCB7c29ydCA6IG51bGx9ICk7XHJcbiAgICAgIG5jLm9yZGVyID0geDtcclxuXHJcbiAgICAgIHJldHVybiB0aGlzLmdldHJvb3QoIG5jICk7XHJcbiAgICB9KTtcclxuXHJcbiAgICBBUEkuZXh0ZW5kKCAnbGltaXQnLCBmdW5jdGlvbiAoIG4gKSB7XHJcbiAgICAgIC8vICoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKipcclxuICAgICAgLy8gKlxyXG4gICAgICAvLyAqIFB1cnBvc2U6IHRha2VzIGEgbGltaXQgbnVtYmVyIHRvIGxpbWl0IHRoZSBudW1iZXIgb2Ygcm93cyByZXR1cm5lZCBieSBhIHF1ZXJ5LiBXaWxsIHVwZGF0ZSB0aGUgcmVzdWx0c1xyXG4gICAgICAvLyAqIG9mIGEgcXVlcnlcclxuICAgICAgLy8gKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKiBcclxuICAgICAgdmFyIG5jID0gVEFGRlkubWVyZ2VPYmooIHRoaXMuY29udGV4dCgpLCB7fSksXHJcbiAgICAgICAgbGltaXRlZHJlc3VsdHNcclxuICAgICAgICA7XHJcblxyXG4gICAgICBuYy5saW1pdCA9IG47XHJcblxyXG4gICAgICBpZiAoIG5jLnJ1biAmJiBuYy5zb3J0ICl7XHJcbiAgICAgICAgbGltaXRlZHJlc3VsdHMgPSBbXTtcclxuICAgICAgICBlYWNoKCBuYy5yZXN1bHRzLCBmdW5jdGlvbiAoIGksIHggKSB7XHJcbiAgICAgICAgICBpZiAoICh4ICsgMSkgPiBuICl7XHJcbiAgICAgICAgICAgIHJldHVybiBUQUZGWS5FWElUO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgICAgbGltaXRlZHJlc3VsdHMucHVzaCggaSApO1xyXG4gICAgICAgIH0pO1xyXG4gICAgICAgIG5jLnJlc3VsdHMgPSBsaW1pdGVkcmVzdWx0cztcclxuICAgICAgfVxyXG5cclxuICAgICAgcmV0dXJuIHRoaXMuZ2V0cm9vdCggbmMgKTtcclxuICAgIH0pO1xyXG5cclxuICAgIEFQSS5leHRlbmQoICdzdGFydCcsIGZ1bmN0aW9uICggbiApIHtcclxuICAgICAgLy8gKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKlxyXG4gICAgICAvLyAqXHJcbiAgICAgIC8vICogUHVycG9zZTogdGFrZXMgYSBsaW1pdCBudW1iZXIgdG8gbGltaXQgdGhlIG51bWJlciBvZiByb3dzIHJldHVybmVkIGJ5IGEgcXVlcnkuIFdpbGwgdXBkYXRlIHRoZSByZXN1bHRzXHJcbiAgICAgIC8vICogb2YgYSBxdWVyeVxyXG4gICAgICAvLyAqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqIFxyXG4gICAgICB2YXIgbmMgPSBUQUZGWS5tZXJnZU9iaiggdGhpcy5jb250ZXh0KCksIHt9ICksXHJcbiAgICAgICAgbGltaXRlZHJlc3VsdHNcclxuICAgICAgICA7XHJcblxyXG4gICAgICBuYy5zdGFydCA9IG47XHJcblxyXG4gICAgICBpZiAoIG5jLnJ1biAmJiBuYy5zb3J0ICYmICFuYy5saW1pdCApe1xyXG4gICAgICAgIGxpbWl0ZWRyZXN1bHRzID0gW107XHJcbiAgICAgICAgZWFjaCggbmMucmVzdWx0cywgZnVuY3Rpb24gKCBpLCB4ICkge1xyXG4gICAgICAgICAgaWYgKCAoeCArIDEpID4gbiApe1xyXG4gICAgICAgICAgICBsaW1pdGVkcmVzdWx0cy5wdXNoKCBpICk7XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgbmMucmVzdWx0cyA9IGxpbWl0ZWRyZXN1bHRzO1xyXG4gICAgICB9XHJcbiAgICAgIGVsc2Uge1xyXG4gICAgICAgIG5jID0gVEFGRlkubWVyZ2VPYmooIHRoaXMuY29udGV4dCgpLCB7cnVuIDogbnVsbCwgc3RhcnQgOiBufSApO1xyXG4gICAgICB9XHJcblxyXG4gICAgICByZXR1cm4gdGhpcy5nZXRyb290KCBuYyApO1xyXG4gICAgfSk7XHJcblxyXG4gICAgQVBJLmV4dGVuZCggJ3VwZGF0ZScsIGZ1bmN0aW9uICggYXJnMCwgYXJnMSwgYXJnMiApIHtcclxuICAgICAgLy8gKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKlxyXG4gICAgICAvLyAqXHJcbiAgICAgIC8vICogVGFrZXM6IGEgb2JqZWN0IGFuZCBwYXNzZXMgaXQgb2ZmIERCSSB1cGRhdGUgbWV0aG9kIGZvciBhbGwgbWF0Y2hlZCByZWNvcmRzXHJcbiAgICAgIC8vICoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKiogXHJcbiAgICAgIHZhciBydW5FdmVudCA9IHRydWUsIG8gPSB7fSwgYXJncyA9IGFyZ3VtZW50cywgdGhhdDtcclxuICAgICAgaWYgKCBUQUZGWS5pc1N0cmluZyggYXJnMCApICYmXHJcbiAgICAgICAgKGFyZ3VtZW50cy5sZW5ndGggPT09IDIgfHwgYXJndW1lbnRzLmxlbmd0aCA9PT0gMykgKVxyXG4gICAgICB7XHJcbiAgICAgICAgb1thcmcwXSA9IGFyZzE7XHJcbiAgICAgICAgaWYgKCBhcmd1bWVudHMubGVuZ3RoID09PSAzICl7XHJcbiAgICAgICAgICBydW5FdmVudCA9IGFyZzI7XHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcbiAgICAgIGVsc2Uge1xyXG4gICAgICAgIG8gPSBhcmcwO1xyXG4gICAgICAgIGlmICggYXJncy5sZW5ndGggPT09IDIgKXtcclxuICAgICAgICAgIHJ1bkV2ZW50ID0gYXJnMTtcclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIHRoYXQgPSB0aGlzO1xyXG4gICAgICBydW4uY2FsbCggdGhpcyApO1xyXG4gICAgICBlYWNoKCB0aGlzLmNvbnRleHQoKS5yZXN1bHRzLCBmdW5jdGlvbiAoIHIgKSB7XHJcbiAgICAgICAgdmFyIGMgPSBvO1xyXG4gICAgICAgIGlmICggVEFGRlkuaXNGdW5jdGlvbiggYyApICl7XHJcbiAgICAgICAgICBjID0gYy5hcHBseSggVEFGRlkubWVyZ2VPYmooIHIsIHt9ICkgKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICBpZiAoIFQuaXNGdW5jdGlvbiggYyApICl7XHJcbiAgICAgICAgICAgIGMgPSBjKCBUQUZGWS5tZXJnZU9iaiggciwge30gKSApO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAoIFRBRkZZLmlzT2JqZWN0KCBjICkgKXtcclxuICAgICAgICAgIHRoYXQuZ2V0REJJKCkudXBkYXRlKCByLl9fX2lkLCBjLCBydW5FdmVudCApO1xyXG4gICAgICAgIH1cclxuICAgICAgfSk7XHJcbiAgICAgIGlmICggdGhpcy5jb250ZXh0KCkucmVzdWx0cy5sZW5ndGggKXtcclxuICAgICAgICB0aGlzLmNvbnRleHQoIHsgcnVuIDogbnVsbCB9KTtcclxuICAgICAgfVxyXG4gICAgICByZXR1cm4gdGhpcztcclxuICAgIH0pO1xyXG4gICAgQVBJLmV4dGVuZCggJ3JlbW92ZScsIGZ1bmN0aW9uICggcnVuRXZlbnQgKSB7XHJcbiAgICAgIC8vICoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKipcclxuICAgICAgLy8gKlxyXG4gICAgICAvLyAqIFB1cnBvc2U6IHJlbW92ZXMgcmVjb3JkcyBmcm9tIHRoZSBEQiB2aWEgdGhlIHJlbW92ZSBhbmQgcmVtb3ZlQ29tbWl0IERCSSBtZXRob2RzXHJcbiAgICAgIC8vICoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKiogXHJcbiAgICAgIHZhciB0aGF0ID0gdGhpcywgYyA9IDA7XHJcbiAgICAgIHJ1bi5jYWxsKCB0aGlzICk7XHJcbiAgICAgIGVhY2goIHRoaXMuY29udGV4dCgpLnJlc3VsdHMsIGZ1bmN0aW9uICggciApIHtcclxuICAgICAgICB0aGF0LmdldERCSSgpLnJlbW92ZSggci5fX19pZCApO1xyXG4gICAgICAgIGMrKztcclxuICAgICAgfSk7XHJcbiAgICAgIGlmICggdGhpcy5jb250ZXh0KCkucmVzdWx0cy5sZW5ndGggKXtcclxuICAgICAgICB0aGlzLmNvbnRleHQoIHtcclxuICAgICAgICAgIHJ1biA6IG51bGxcclxuICAgICAgICB9KTtcclxuICAgICAgICB0aGF0LmdldERCSSgpLnJlbW92ZUNvbW1pdCggcnVuRXZlbnQgKTtcclxuICAgICAgfVxyXG5cclxuICAgICAgcmV0dXJuIGM7XHJcbiAgICB9KTtcclxuXHJcblxyXG4gICAgQVBJLmV4dGVuZCggJ2NvdW50JywgZnVuY3Rpb24gKCkge1xyXG4gICAgICAvLyAqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqXHJcbiAgICAgIC8vICpcclxuICAgICAgLy8gKiBSZXR1cm5zOiBUaGUgbGVuZ3RoIG9mIGEgcXVlcnkgcmVzdWx0XHJcbiAgICAgIC8vICoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKiogXHJcbiAgICAgIHJ1bi5jYWxsKCB0aGlzICk7XHJcbiAgICAgIHJldHVybiB0aGlzLmNvbnRleHQoKS5yZXN1bHRzLmxlbmd0aDtcclxuICAgIH0pO1xyXG5cclxuICAgIEFQSS5leHRlbmQoICdjYWxsYmFjaycsIGZ1bmN0aW9uICggZiwgZGVsYXkgKSB7XHJcbiAgICAgIC8vICoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKipcclxuICAgICAgLy8gKlxyXG4gICAgICAvLyAqIFJldHVybnMgbnVsbDtcclxuICAgICAgLy8gKiBSdW5zIGEgZnVuY3Rpb24gb24gcmV0dXJuIG9mIHJ1bi5jYWxsXHJcbiAgICAgIC8vICoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKiogXHJcbiAgICAgIGlmICggZiApe1xyXG4gICAgICAgIHZhciB0aGF0ID0gdGhpcztcclxuICAgICAgICBzZXRUaW1lb3V0KCBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICBydW4uY2FsbCggdGhhdCApO1xyXG4gICAgICAgICAgZi5jYWxsKCB0aGF0LmdldHJvb3QoIHRoYXQuY29udGV4dCgpICkgKTtcclxuICAgICAgICB9LCBkZWxheSB8fCAwICk7XHJcbiAgICAgIH1cclxuXHJcblxyXG4gICAgICByZXR1cm4gbnVsbDtcclxuICAgIH0pO1xyXG5cclxuICAgIEFQSS5leHRlbmQoICdnZXQnLCBmdW5jdGlvbiAoKSB7XHJcbiAgICAgIC8vICoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKipcclxuICAgICAgLy8gKlxyXG4gICAgICAvLyAqIFJldHVybnM6IEFuIGFycmF5IG9mIGFsbCBtYXRjaGluZyByZWNvcmRzXHJcbiAgICAgIC8vICoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKiogXHJcbiAgICAgIHJ1bi5jYWxsKCB0aGlzICk7XHJcbiAgICAgIHJldHVybiB0aGlzLmNvbnRleHQoKS5yZXN1bHRzO1xyXG4gICAgfSk7XHJcblxyXG4gICAgQVBJLmV4dGVuZCggJ3N0cmluZ2lmeScsIGZ1bmN0aW9uICgpIHtcclxuICAgICAgLy8gKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKlxyXG4gICAgICAvLyAqXHJcbiAgICAgIC8vICogUmV0dXJuczogQW4gSlNPTiBzdHJpbmcgb2YgYWxsIG1hdGNoaW5nIHJlY29yZHNcclxuICAgICAgLy8gKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKiBcclxuICAgICAgcmV0dXJuIEpTT04uc3RyaW5naWZ5KCB0aGlzLmdldCgpICk7XHJcbiAgICB9KTtcclxuICAgIEFQSS5leHRlbmQoICdmaXJzdCcsIGZ1bmN0aW9uICgpIHtcclxuICAgICAgLy8gKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKlxyXG4gICAgICAvLyAqXHJcbiAgICAgIC8vICogUmV0dXJuczogVGhlIGZpcnN0IG1hdGNoaW5nIHJlY29yZFxyXG4gICAgICAvLyAqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqIFxyXG4gICAgICBydW4uY2FsbCggdGhpcyApO1xyXG4gICAgICByZXR1cm4gdGhpcy5jb250ZXh0KCkucmVzdWx0c1swXSB8fCBmYWxzZTtcclxuICAgIH0pO1xyXG4gICAgQVBJLmV4dGVuZCggJ2xhc3QnLCBmdW5jdGlvbiAoKSB7XHJcbiAgICAgIC8vICoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKipcclxuICAgICAgLy8gKlxyXG4gICAgICAvLyAqIFJldHVybnM6IFRoZSBsYXN0IG1hdGNoaW5nIHJlY29yZFxyXG4gICAgICAvLyAqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqIFxyXG4gICAgICBydW4uY2FsbCggdGhpcyApO1xyXG4gICAgICByZXR1cm4gdGhpcy5jb250ZXh0KCkucmVzdWx0c1t0aGlzLmNvbnRleHQoKS5yZXN1bHRzLmxlbmd0aCAtIDFdIHx8XHJcbiAgICAgICAgZmFsc2U7XHJcbiAgICB9KTtcclxuXHJcblxyXG4gICAgQVBJLmV4dGVuZCggJ3N1bScsIGZ1bmN0aW9uICgpIHtcclxuICAgICAgLy8gKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKlxyXG4gICAgICAvLyAqXHJcbiAgICAgIC8vICogVGFrZXM6IGNvbHVtbiB0byBzdW0gdXBcclxuICAgICAgLy8gKiBSZXR1cm5zOiBTdW1zIHRoZSB2YWx1ZXMgb2YgYSBjb2x1bW5cclxuICAgICAgLy8gKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKiBcclxuICAgICAgdmFyIHRvdGFsID0gMCwgdGhhdCA9IHRoaXM7XHJcbiAgICAgIHJ1bi5jYWxsKCB0aGF0ICk7XHJcbiAgICAgIGVhY2goIGFyZ3VtZW50cywgZnVuY3Rpb24gKCBjICkge1xyXG4gICAgICAgIGVhY2goIHRoYXQuY29udGV4dCgpLnJlc3VsdHMsIGZ1bmN0aW9uICggciApIHtcclxuICAgICAgICAgIHRvdGFsID0gdG90YWwgKyAocltjXSB8fCAwKTtcclxuICAgICAgICB9KTtcclxuICAgICAgfSk7XHJcbiAgICAgIHJldHVybiB0b3RhbDtcclxuICAgIH0pO1xyXG5cclxuICAgIEFQSS5leHRlbmQoICdtaW4nLCBmdW5jdGlvbiAoIGMgKSB7XHJcbiAgICAgIC8vICoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKipcclxuICAgICAgLy8gKlxyXG4gICAgICAvLyAqIFRha2VzOiBjb2x1bW4gdG8gZmluZCBtaW5cclxuICAgICAgLy8gKiBSZXR1cm5zOiB0aGUgbG93ZXN0IHZhbHVlXHJcbiAgICAgIC8vICoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKiogXHJcbiAgICAgIHZhciBsb3dlc3QgPSBudWxsO1xyXG4gICAgICBydW4uY2FsbCggdGhpcyApO1xyXG4gICAgICBlYWNoKCB0aGlzLmNvbnRleHQoKS5yZXN1bHRzLCBmdW5jdGlvbiAoIHIgKSB7XHJcbiAgICAgICAgaWYgKCBsb3dlc3QgPT09IG51bGwgfHwgcltjXSA8IGxvd2VzdCApe1xyXG4gICAgICAgICAgbG93ZXN0ID0gcltjXTtcclxuICAgICAgICB9XHJcbiAgICAgIH0pO1xyXG4gICAgICByZXR1cm4gbG93ZXN0O1xyXG4gICAgfSk7XHJcblxyXG4gICAgLy8gIFRhZmZ5IGlubmVySm9pbiBFeHRlbnNpb24gKE9DRCBlZGl0aW9uKVxyXG4gICAgLy8gID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxyXG4gICAgLy9cclxuICAgIC8vICBIb3cgdG8gVXNlXHJcbiAgICAvLyAgKioqKioqKioqKlxyXG4gICAgLy9cclxuICAgIC8vICBsZWZ0X3RhYmxlLmlubmVySm9pbiggcmlnaHRfdGFibGUsIGNvbmRpdGlvbjEgPCwuLi4gY29uZGl0aW9uTj4gKVxyXG4gICAgLy9cclxuICAgIC8vICBBIGNvbmRpdGlvbiBjYW4gdGFrZSBvbmUgb2YgMiBmb3JtczpcclxuICAgIC8vXHJcbiAgICAvLyAgICAxLiBBbiBBUlJBWSB3aXRoIDIgb3IgMyB2YWx1ZXM6XHJcbiAgICAvLyAgICBBIGNvbHVtbiBuYW1lIGZyb20gdGhlIGxlZnQgdGFibGUsIGFuIG9wdGlvbmFsIGNvbXBhcmlzb24gc3RyaW5nLFxyXG4gICAgLy8gICAgYW5kIGNvbHVtbiBuYW1lIGZyb20gdGhlIHJpZ2h0IHRhYmxlLiAgVGhlIGNvbmRpdGlvbiBwYXNzZXMgaWYgdGhlIHRlc3RcclxuICAgIC8vICAgIGluZGljYXRlZCBpcyB0cnVlLiAgIElmIHRoZSBjb25kaXRpb24gc3RyaW5nIGlzIG9taXR0ZWQsICc9PT0nIGlzIGFzc3VtZWQuXHJcbiAgICAvLyAgICBFWEFNUExFUzogWyAnbGFzdF91c2VkX3RpbWUnLCAnPj0nLCAnY3VycmVudF91c2VfdGltZScgXSwgWyAndXNlcl9pZCcsJ2lkJyBdXHJcbiAgICAvL1xyXG4gICAgLy8gICAgMi4gQSBGVU5DVElPTjpcclxuICAgIC8vICAgIFRoZSBmdW5jdGlvbiByZWNlaXZlcyBhIGxlZnQgdGFibGUgcm93IGFuZCByaWdodCB0YWJsZSByb3cgZHVyaW5nIHRoZVxyXG4gICAgLy8gICAgY2FydGVzaWFuIGpvaW4uICBJZiB0aGUgZnVuY3Rpb24gcmV0dXJucyB0cnVlIGZvciB0aGUgcm93cyBjb25zaWRlcmVkLFxyXG4gICAgLy8gICAgdGhlIG1lcmdlZCByb3cgaXMgaW5jbHVkZWQgaW4gdGhlIHJlc3VsdCBzZXQuXHJcbiAgICAvLyAgICBFWEFNUExFOiBmdW5jdGlvbiAobCxyKXsgcmV0dXJuIGwubmFtZSA9PT0gci5sYWJlbDsgfVxyXG4gICAgLy9cclxuICAgIC8vICBDb25kaXRpb25zIGFyZSBjb25zaWRlcmVkIGluIHRoZSBvcmRlciB0aGV5IGFyZSBwcmVzZW50ZWQuICBUaGVyZWZvcmUgdGhlIGJlc3RcclxuICAgIC8vICBwZXJmb3JtYW5jZSBpcyByZWFsaXplZCB3aGVuIHRoZSBsZWFzdCBleHBlbnNpdmUgYW5kIGhpZ2hlc3QgcHJ1bmUtcmF0ZVxyXG4gICAgLy8gIGNvbmRpdGlvbnMgYXJlIHBsYWNlZCBmaXJzdCwgc2luY2UgaWYgdGhleSByZXR1cm4gZmFsc2UgVGFmZnkgc2tpcHMgYW55XHJcbiAgICAvLyAgZnVydGhlciBjb25kaXRpb24gdGVzdHMuXHJcbiAgICAvL1xyXG4gICAgLy8gIE90aGVyIG5vdGVzXHJcbiAgICAvLyAgKioqKioqKioqKipcclxuICAgIC8vXHJcbiAgICAvLyAgVGhpcyBjb2RlIHBhc3NlcyBqc2xpbnQgd2l0aCB0aGUgZXhjZXB0aW9uIG9mIDIgd2FybmluZ3MgYWJvdXRcclxuICAgIC8vICB0aGUgJz09JyBhbmQgJyE9JyBsaW5lcy4gIFdlIGNhbid0IGRvIGFueXRoaW5nIGFib3V0IHRoYXQgc2hvcnQgb2ZcclxuICAgIC8vICBkZWxldGluZyB0aGUgbGluZXMuXHJcbiAgICAvL1xyXG4gICAgLy8gIENyZWRpdHNcclxuICAgIC8vICAqKioqKioqXHJcbiAgICAvL1xyXG4gICAgLy8gIEhlYXZpbHkgYmFzZWQgdXBvbiB0aGUgd29yayBvZiBJYW4gVG9sdHouXHJcbiAgICAvLyAgUmV2aXNpb25zIHRvIEFQSSBieSBNaWNoYWVsIE1pa293c2tpLlxyXG4gICAgLy8gIENvZGUgY29udmVudGlvbiBwZXIgc3RhbmRhcmRzIGluIGh0dHA6Ly9tYW5uaW5nLmNvbS9taWtvd3NraVxyXG4gICAgKGZ1bmN0aW9uICgpIHtcclxuICAgICAgdmFyIGlubmVySm9pbkZ1bmN0aW9uID0gKGZ1bmN0aW9uICgpIHtcclxuICAgICAgICB2YXIgZm5Db21wYXJlTGlzdCwgZm5Db21iaW5lUm93LCBmbk1haW47XHJcblxyXG4gICAgICAgIGZuQ29tcGFyZUxpc3QgPSBmdW5jdGlvbiAoIGxlZnRfcm93LCByaWdodF9yb3csIGFyZ19saXN0ICkge1xyXG4gICAgICAgICAgdmFyIGRhdGFfbHQsIGRhdGFfcnQsIG9wX2NvZGUsIGVycm9yO1xyXG5cclxuICAgICAgICAgIGlmICggYXJnX2xpc3QubGVuZ3RoID09PSAyICl7XHJcbiAgICAgICAgICAgIGRhdGFfbHQgPSBsZWZ0X3Jvd1thcmdfbGlzdFswXV07XHJcbiAgICAgICAgICAgIG9wX2NvZGUgPSAnPT09JztcclxuICAgICAgICAgICAgZGF0YV9ydCA9IHJpZ2h0X3Jvd1thcmdfbGlzdFsxXV07XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgZGF0YV9sdCA9IGxlZnRfcm93W2FyZ19saXN0WzBdXTtcclxuICAgICAgICAgICAgb3BfY29kZSA9IGFyZ19saXN0WzFdO1xyXG4gICAgICAgICAgICBkYXRhX3J0ID0gcmlnaHRfcm93W2FyZ19saXN0WzJdXTtcclxuICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAvKmpzbGludCBlcWVxIDogdHJ1ZSAqL1xyXG4gICAgICAgICAgc3dpdGNoICggb3BfY29kZSApe1xyXG4gICAgICAgICAgICBjYXNlICc9PT0nIDpcclxuICAgICAgICAgICAgICByZXR1cm4gZGF0YV9sdCA9PT0gZGF0YV9ydDtcclxuICAgICAgICAgICAgY2FzZSAnIT09JyA6XHJcbiAgICAgICAgICAgICAgcmV0dXJuIGRhdGFfbHQgIT09IGRhdGFfcnQ7XHJcbiAgICAgICAgICAgIGNhc2UgJzwnICAgOlxyXG4gICAgICAgICAgICAgIHJldHVybiBkYXRhX2x0IDwgZGF0YV9ydDtcclxuICAgICAgICAgICAgY2FzZSAnPicgICA6XHJcbiAgICAgICAgICAgICAgcmV0dXJuIGRhdGFfbHQgPiBkYXRhX3J0O1xyXG4gICAgICAgICAgICBjYXNlICc8PScgIDpcclxuICAgICAgICAgICAgICByZXR1cm4gZGF0YV9sdCA8PSBkYXRhX3J0O1xyXG4gICAgICAgICAgICBjYXNlICc+PScgIDpcclxuICAgICAgICAgICAgICByZXR1cm4gZGF0YV9sdCA+PSBkYXRhX3J0O1xyXG4gICAgICAgICAgICBjYXNlICc9PScgIDpcclxuICAgICAgICAgICAgICByZXR1cm4gZGF0YV9sdCA9PSBkYXRhX3J0O1xyXG4gICAgICAgICAgICBjYXNlICchPScgIDpcclxuICAgICAgICAgICAgICByZXR1cm4gZGF0YV9sdCAhPSBkYXRhX3J0O1xyXG4gICAgICAgICAgICBkZWZhdWx0IDpcclxuICAgICAgICAgICAgICB0aHJvdyBTdHJpbmcoIG9wX2NvZGUgKSArICcgaXMgbm90IHN1cHBvcnRlZCc7XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgICAvLyAnanNsaW50IGVxZXEgOiBmYWxzZScgIGhlcmUgcmVzdWx0cyBpblxyXG4gICAgICAgICAgLy8gXCJVbnJlYWNoYWJsZSAnLypqc2xpbnQnIGFmdGVyICdyZXR1cm4nXCIuXHJcbiAgICAgICAgICAvLyBXZSBkb24ndCBuZWVkIGl0IHRob3VnaCwgYXMgdGhlIHJ1bGUgZXhjZXB0aW9uXHJcbiAgICAgICAgICAvLyBpcyBkaXNjYXJkZWQgYXQgdGhlIGVuZCBvZiB0aGlzIGZ1bmN0aW9uYWwgc2NvcGVcclxuICAgICAgICB9O1xyXG5cclxuICAgICAgICBmbkNvbWJpbmVSb3cgPSBmdW5jdGlvbiAoIGxlZnRfcm93LCByaWdodF9yb3cgKSB7XHJcbiAgICAgICAgICB2YXIgb3V0X21hcCA9IHt9LCBpLCBwcmVmaXg7XHJcblxyXG4gICAgICAgICAgZm9yICggaSBpbiBsZWZ0X3JvdyApe1xyXG4gICAgICAgICAgICBpZiAoIGxlZnRfcm93Lmhhc093blByb3BlcnR5KCBpICkgKXtcclxuICAgICAgICAgICAgICBvdXRfbWFwW2ldID0gbGVmdF9yb3dbaV07XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgIH1cclxuICAgICAgICAgIGZvciAoIGkgaW4gcmlnaHRfcm93ICl7XHJcbiAgICAgICAgICAgIGlmICggcmlnaHRfcm93Lmhhc093blByb3BlcnR5KCBpICkgJiYgaSAhPT0gJ19fX2lkJyAmJlxyXG4gICAgICAgICAgICAgIGkgIT09ICdfX19zJyApXHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICBwcmVmaXggPSAhVEFGRlkuaXNVbmRlZmluZWQoIG91dF9tYXBbaV0gKSA/ICdyaWdodF8nIDogJyc7XHJcbiAgICAgICAgICAgICAgb3V0X21hcFtwcmVmaXggKyBTdHJpbmcoIGkgKSBdID0gcmlnaHRfcm93W2ldO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgICByZXR1cm4gb3V0X21hcDtcclxuICAgICAgICB9O1xyXG5cclxuICAgICAgICBmbk1haW4gPSBmdW5jdGlvbiAoIHRhYmxlICkge1xyXG4gICAgICAgICAgdmFyXHJcbiAgICAgICAgICAgIHJpZ2h0X3RhYmxlLCBpLFxyXG4gICAgICAgICAgICBhcmdfbGlzdCA9IGFyZ3VtZW50cyxcclxuICAgICAgICAgICAgYXJnX2xlbmd0aCA9IGFyZ19saXN0Lmxlbmd0aCxcclxuICAgICAgICAgICAgcmVzdWx0X2xpc3QgPSBbXVxyXG4gICAgICAgICAgICA7XHJcblxyXG4gICAgICAgICAgaWYgKCB0eXBlb2YgdGFibGUuZmlsdGVyICE9PSAnZnVuY3Rpb24nICl7XHJcbiAgICAgICAgICAgIGlmICggdGFibGUuVEFGRlkgKXsgcmlnaHRfdGFibGUgPSB0YWJsZSgpOyB9XHJcbiAgICAgICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICAgIHRocm93ICdUQUZGWSBEQiBvciByZXN1bHQgbm90IHN1cHBsaWVkJztcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgfVxyXG4gICAgICAgICAgZWxzZSB7IHJpZ2h0X3RhYmxlID0gdGFibGU7IH1cclxuXHJcbiAgICAgICAgICB0aGlzLmNvbnRleHQoIHtcclxuICAgICAgICAgICAgcmVzdWx0cyA6IHRoaXMuZ2V0REJJKCkucXVlcnkoIHRoaXMuY29udGV4dCgpIClcclxuICAgICAgICAgIH0gKTtcclxuXHJcbiAgICAgICAgICBUQUZGWS5lYWNoKCB0aGlzLmNvbnRleHQoKS5yZXN1bHRzLCBmdW5jdGlvbiAoIGxlZnRfcm93ICkge1xyXG4gICAgICAgICAgICByaWdodF90YWJsZS5lYWNoKCBmdW5jdGlvbiAoIHJpZ2h0X3JvdyApIHtcclxuICAgICAgICAgICAgICB2YXIgYXJnX2RhdGEsIGlzX29rID0gdHJ1ZTtcclxuICAgICAgICAgICAgICBDT05ESVRJT046XHJcbiAgICAgICAgICAgICAgICBmb3IgKCBpID0gMTsgaSA8IGFyZ19sZW5ndGg7IGkrKyApe1xyXG4gICAgICAgICAgICAgICAgICBhcmdfZGF0YSA9IGFyZ19saXN0W2ldO1xyXG4gICAgICAgICAgICAgICAgICBpZiAoIHR5cGVvZiBhcmdfZGF0YSA9PT0gJ2Z1bmN0aW9uJyApe1xyXG4gICAgICAgICAgICAgICAgICAgIGlzX29rID0gYXJnX2RhdGEoIGxlZnRfcm93LCByaWdodF9yb3cgKTtcclxuICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICBlbHNlIGlmICggdHlwZW9mIGFyZ19kYXRhID09PSAnb2JqZWN0JyAmJiBhcmdfZGF0YS5sZW5ndGggKXtcclxuICAgICAgICAgICAgICAgICAgICBpc19vayA9IGZuQ29tcGFyZUxpc3QoIGxlZnRfcm93LCByaWdodF9yb3csIGFyZ19kYXRhICk7XHJcbiAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgaXNfb2sgPSBmYWxzZTtcclxuICAgICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgICAgaWYgKCAhaXNfb2sgKXsgYnJlYWsgQ09ORElUSU9OOyB9IC8vIHNob3J0IGNpcmN1aXRcclxuICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgaWYgKCBpc19vayApe1xyXG4gICAgICAgICAgICAgICAgcmVzdWx0X2xpc3QucHVzaCggZm5Db21iaW5lUm93KCBsZWZ0X3JvdywgcmlnaHRfcm93ICkgKTtcclxuICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH0gKTtcclxuICAgICAgICAgIH0gKTtcclxuICAgICAgICAgIHJldHVybiBUQUZGWSggcmVzdWx0X2xpc3QgKSgpO1xyXG4gICAgICAgIH07XHJcblxyXG4gICAgICAgIHJldHVybiBmbk1haW47XHJcbiAgICAgIH0oKSk7XHJcblxyXG4gICAgICBBUEkuZXh0ZW5kKCAnam9pbicsIGlubmVySm9pbkZ1bmN0aW9uICk7XHJcbiAgICB9KCkpO1xyXG5cclxuICAgIEFQSS5leHRlbmQoICdtYXgnLCBmdW5jdGlvbiAoIGMgKSB7XHJcbiAgICAgIC8vICoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKipcclxuICAgICAgLy8gKlxyXG4gICAgICAvLyAqIFRha2VzOiBjb2x1bW4gdG8gZmluZCBtYXhcclxuICAgICAgLy8gKiBSZXR1cm5zOiB0aGUgaGlnaGVzdCB2YWx1ZVxyXG4gICAgICAvLyAqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqXHJcbiAgICAgIHZhciBoaWdoZXN0ID0gbnVsbDtcclxuICAgICAgcnVuLmNhbGwoIHRoaXMgKTtcclxuICAgICAgZWFjaCggdGhpcy5jb250ZXh0KCkucmVzdWx0cywgZnVuY3Rpb24gKCByICkge1xyXG4gICAgICAgIGlmICggaGlnaGVzdCA9PT0gbnVsbCB8fCByW2NdID4gaGlnaGVzdCApe1xyXG4gICAgICAgICAgaGlnaGVzdCA9IHJbY107XHJcbiAgICAgICAgfVxyXG4gICAgICB9KTtcclxuICAgICAgcmV0dXJuIGhpZ2hlc3Q7XHJcbiAgICB9KTtcclxuXHJcbiAgICBBUEkuZXh0ZW5kKCAnc2VsZWN0JywgZnVuY3Rpb24gKCkge1xyXG4gICAgICAvLyAqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqXHJcbiAgICAgIC8vICpcclxuICAgICAgLy8gKiBUYWtlczogY29sdW1ucyB0byBzZWxlY3QgdmFsdWVzIGludG8gYW4gYXJyYXlcclxuICAgICAgLy8gKiBSZXR1cm5zOiBhcnJheSBvZiB2YWx1ZXNcclxuICAgICAgLy8gKiBOb3RlIGlmIG1vcmUgdGhhbiBvbmUgY29sdW1uIGlzIGdpdmVuIGFuIGFycmF5IG9mIGFycmF5cyBpcyByZXR1cm5lZFxyXG4gICAgICAvLyAqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqIFxyXG5cclxuICAgICAgdmFyIHJhID0gW10sIGFyZ3MgPSBhcmd1bWVudHM7XHJcbiAgICAgIHJ1bi5jYWxsKCB0aGlzICk7XHJcbiAgICAgIGlmICggYXJndW1lbnRzLmxlbmd0aCA9PT0gMSApe1xyXG5cclxuICAgICAgICBlYWNoKCB0aGlzLmNvbnRleHQoKS5yZXN1bHRzLCBmdW5jdGlvbiAoIHIgKSB7XHJcblxyXG4gICAgICAgICAgcmEucHVzaCggclthcmdzWzBdXSApO1xyXG4gICAgICAgIH0pO1xyXG4gICAgICB9XHJcbiAgICAgIGVsc2Uge1xyXG4gICAgICAgIGVhY2goIHRoaXMuY29udGV4dCgpLnJlc3VsdHMsIGZ1bmN0aW9uICggciApIHtcclxuICAgICAgICAgIHZhciByb3cgPSBbXTtcclxuICAgICAgICAgIGVhY2goIGFyZ3MsIGZ1bmN0aW9uICggYyApIHtcclxuICAgICAgICAgICAgcm93LnB1c2goIHJbY10gKTtcclxuICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgcmEucHVzaCggcm93ICk7XHJcbiAgICAgICAgfSk7XHJcbiAgICAgIH1cclxuICAgICAgcmV0dXJuIHJhO1xyXG4gICAgfSk7XHJcbiAgICBBUEkuZXh0ZW5kKCAnZGlzdGluY3QnLCBmdW5jdGlvbiAoKSB7XHJcbiAgICAgIC8vICoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKipcclxuICAgICAgLy8gKlxyXG4gICAgICAvLyAqIFRha2VzOiBjb2x1bW5zIHRvIHNlbGVjdCB1bmlxdWUgYWx1ZXMgaW50byBhbiBhcnJheVxyXG4gICAgICAvLyAqIFJldHVybnM6IGFycmF5IG9mIHZhbHVlc1xyXG4gICAgICAvLyAqIE5vdGUgaWYgbW9yZSB0aGFuIG9uZSBjb2x1bW4gaXMgZ2l2ZW4gYW4gYXJyYXkgb2YgYXJyYXlzIGlzIHJldHVybmVkXHJcbiAgICAgIC8vICoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKiogXHJcbiAgICAgIHZhciByYSA9IFtdLCBhcmdzID0gYXJndW1lbnRzO1xyXG4gICAgICBydW4uY2FsbCggdGhpcyApO1xyXG4gICAgICBpZiAoIGFyZ3VtZW50cy5sZW5ndGggPT09IDEgKXtcclxuXHJcbiAgICAgICAgZWFjaCggdGhpcy5jb250ZXh0KCkucmVzdWx0cywgZnVuY3Rpb24gKCByICkge1xyXG4gICAgICAgICAgdmFyIHYgPSByW2FyZ3NbMF1dLCBkdXAgPSBmYWxzZTtcclxuICAgICAgICAgIGVhY2goIHJhLCBmdW5jdGlvbiAoIGQgKSB7XHJcbiAgICAgICAgICAgIGlmICggdiA9PT0gZCApe1xyXG4gICAgICAgICAgICAgIGR1cCA9IHRydWU7XHJcbiAgICAgICAgICAgICAgcmV0dXJuIFRBRkZZLkVYSVQ7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgaWYgKCAhZHVwICl7XHJcbiAgICAgICAgICAgIHJhLnB1c2goIHYgKTtcclxuICAgICAgICAgIH1cclxuICAgICAgICB9KTtcclxuICAgICAgfVxyXG4gICAgICBlbHNlIHtcclxuICAgICAgICBlYWNoKCB0aGlzLmNvbnRleHQoKS5yZXN1bHRzLCBmdW5jdGlvbiAoIHIgKSB7XHJcbiAgICAgICAgICB2YXIgcm93ID0gW10sIGR1cCA9IGZhbHNlO1xyXG4gICAgICAgICAgZWFjaCggYXJncywgZnVuY3Rpb24gKCBjICkge1xyXG4gICAgICAgICAgICByb3cucHVzaCggcltjXSApO1xyXG4gICAgICAgICAgfSk7XHJcbiAgICAgICAgICBlYWNoKCByYSwgZnVuY3Rpb24gKCBkICkge1xyXG4gICAgICAgICAgICB2YXIgbGR1cCA9IHRydWU7XHJcbiAgICAgICAgICAgIGVhY2goIGFyZ3MsIGZ1bmN0aW9uICggYywgaSApIHtcclxuICAgICAgICAgICAgICBpZiAoIHJvd1tpXSAhPT0gZFtpXSApe1xyXG4gICAgICAgICAgICAgICAgbGR1cCA9IGZhbHNlO1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIFRBRkZZLkVYSVQ7XHJcbiAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgaWYgKCBsZHVwICl7XHJcbiAgICAgICAgICAgICAgZHVwID0gdHJ1ZTtcclxuICAgICAgICAgICAgICByZXR1cm4gVEFGRlkuRVhJVDtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgfSk7XHJcbiAgICAgICAgICBpZiAoICFkdXAgKXtcclxuICAgICAgICAgICAgcmEucHVzaCggcm93ICk7XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgfSk7XHJcbiAgICAgIH1cclxuICAgICAgcmV0dXJuIHJhO1xyXG4gICAgfSk7XHJcbiAgICBBUEkuZXh0ZW5kKCAnc3VwcGxhbnQnLCBmdW5jdGlvbiAoIHRlbXBsYXRlLCByZXR1cm5hcnJheSApIHtcclxuICAgICAgLy8gKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKlxyXG4gICAgICAvLyAqXHJcbiAgICAgIC8vICogVGFrZXM6IGEgc3RyaW5nIHRlbXBsYXRlIGZvcm1hdGVkIHdpdGgga2V5IHRvIGJlIHJlcGxhY2VkIHdpdGggdmFsdWVzIGZyb20gdGhlIHJvd3MsIGZsYWcgdG8gZGV0ZXJtaW5lIGlmIHdlIHdhbnQgYXJyYXkgb2Ygc3RyaW5nc1xyXG4gICAgICAvLyAqIFJldHVybnM6IGFycmF5IG9mIHZhbHVlcyBvciBhIHN0cmluZ1xyXG4gICAgICAvLyAqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqIFxyXG4gICAgICB2YXIgcmEgPSBbXTtcclxuICAgICAgcnVuLmNhbGwoIHRoaXMgKTtcclxuICAgICAgZWFjaCggdGhpcy5jb250ZXh0KCkucmVzdWx0cywgZnVuY3Rpb24gKCByICkge1xyXG4gICAgICAgIC8vIFRPRE86IFRoZSBjdXJseSBicmFjZXMgdXNlZCB0byBiZSB1bmVzY2FwZWRcclxuICAgICAgICByYS5wdXNoKCB0ZW1wbGF0ZS5yZXBsYWNlKCAvXFx7KFteXFx7XFx9XSopXFx9L2csIGZ1bmN0aW9uICggYSwgYiApIHtcclxuICAgICAgICAgIHZhciB2ID0gcltiXTtcclxuICAgICAgICAgIHJldHVybiB0eXBlb2YgdiA9PT0gJ3N0cmluZycgfHwgdHlwZW9mIHYgPT09ICdudW1iZXInID8gdiA6IGE7XHJcbiAgICAgICAgfSApICk7XHJcbiAgICAgIH0pO1xyXG4gICAgICByZXR1cm4gKCFyZXR1cm5hcnJheSkgPyByYS5qb2luKCBcIlwiICkgOiByYTtcclxuICAgIH0pO1xyXG5cclxuXHJcbiAgICBBUEkuZXh0ZW5kKCAnZWFjaCcsIGZ1bmN0aW9uICggbSApIHtcclxuICAgICAgLy8gKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKlxyXG4gICAgICAvLyAqXHJcbiAgICAgIC8vICogVGFrZXM6IGEgZnVuY3Rpb25cclxuICAgICAgLy8gKiBQdXJwb3NlOiBsb29wcyBvdmVyIGV2ZXJ5IG1hdGNoaW5nIHJlY29yZCBhbmQgYXBwbGllcyB0aGUgZnVuY3Rpb25cclxuICAgICAgLy8gKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKiBcclxuICAgICAgcnVuLmNhbGwoIHRoaXMgKTtcclxuICAgICAgZWFjaCggdGhpcy5jb250ZXh0KCkucmVzdWx0cywgbSApO1xyXG4gICAgICByZXR1cm4gdGhpcztcclxuICAgIH0pO1xyXG4gICAgQVBJLmV4dGVuZCggJ21hcCcsIGZ1bmN0aW9uICggbSApIHtcclxuICAgICAgLy8gKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKlxyXG4gICAgICAvLyAqXHJcbiAgICAgIC8vICogVGFrZXM6IGEgZnVuY3Rpb25cclxuICAgICAgLy8gKiBQdXJwb3NlOiBsb29wcyBvdmVyIGV2ZXJ5IG1hdGNoaW5nIHJlY29yZCBhbmQgYXBwbGllcyB0aGUgZnVuY3Rpb24sIHJldHVyaW5nIHRoZSByZXN1bHRzIGluIGFuIGFycmF5XHJcbiAgICAgIC8vICoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKiogXHJcbiAgICAgIHZhciByYSA9IFtdO1xyXG4gICAgICBydW4uY2FsbCggdGhpcyApO1xyXG4gICAgICBlYWNoKCB0aGlzLmNvbnRleHQoKS5yZXN1bHRzLCBmdW5jdGlvbiAoIHIgKSB7XHJcbiAgICAgICAgcmEucHVzaCggbSggciApICk7XHJcbiAgICAgIH0pO1xyXG4gICAgICByZXR1cm4gcmE7XHJcbiAgICB9KTtcclxuXHJcblxyXG5cclxuICAgIFQgPSBmdW5jdGlvbiAoIGQgKSB7XHJcbiAgICAgIC8vICoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKipcclxuICAgICAgLy8gKlxyXG4gICAgICAvLyAqIFQgaXMgdGhlIG1haW4gVEFGRlkgb2JqZWN0XHJcbiAgICAgIC8vICogVGFrZXM6IGFuIGFycmF5IG9mIG9iamVjdHMgb3IgSlNPTlxyXG4gICAgICAvLyAqIFJldHVybnMgYSBuZXcgVEFGRllEQlxyXG4gICAgICAvLyAqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqIFxyXG4gICAgICB2YXIgVE9iID0gW10sXHJcbiAgICAgICAgSUQgPSB7fSxcclxuICAgICAgICBSQyA9IDEsXHJcbiAgICAgICAgc2V0dGluZ3MgPSB7XHJcbiAgICAgICAgICB0ZW1wbGF0ZSAgICAgICAgICA6IGZhbHNlLFxyXG4gICAgICAgICAgb25JbnNlcnQgICAgICAgICAgOiBmYWxzZSxcclxuICAgICAgICAgIG9uVXBkYXRlICAgICAgICAgIDogZmFsc2UsXHJcbiAgICAgICAgICBvblJlbW92ZSAgICAgICAgICA6IGZhbHNlLFxyXG4gICAgICAgICAgb25EQkNoYW5nZSAgICAgICAgOiBmYWxzZSxcclxuICAgICAgICAgIHN0b3JhZ2VOYW1lICAgICAgIDogZmFsc2UsXHJcbiAgICAgICAgICBmb3JjZVByb3BlcnR5Q2FzZSA6IG51bGwsXHJcbiAgICAgICAgICBjYWNoZVNpemUgICAgICAgICA6IDEwMCxcclxuICAgICAgICAgIG5hbWUgICAgICAgICAgICAgIDogJydcclxuICAgICAgICB9LFxyXG4gICAgICAgIGRtID0gbmV3IERhdGUoKSxcclxuICAgICAgICBDYWNoZUNvdW50ID0gMCxcclxuICAgICAgICBDYWNoZUNsZWFyID0gMCxcclxuICAgICAgICBDYWNoZSA9IHt9LFxyXG4gICAgICAgIERCSSwgcnVuSW5kZXhlcywgcm9vdFxyXG4gICAgICAgIDtcclxuICAgICAgLy8gKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKlxyXG4gICAgICAvLyAqXHJcbiAgICAgIC8vICogVE9iID0gdGhpcyBkYXRhYmFzZVxyXG4gICAgICAvLyAqIElEID0gY29sbGVjdGlvbiBvZiB0aGUgcmVjb3JkIElEcyBhbmQgbG9jYXRpb25zIHdpdGhpbiB0aGUgREIsIHVzZWQgZm9yIGZhc3QgbG9va3Vwc1xyXG4gICAgICAvLyAqIFJDID0gcmVjb3JkIGNvdW50ZXIsIHVzZWQgZm9yIGNyZWF0aW5nIElEc1xyXG4gICAgICAvLyAqIHNldHRpbmdzLnRlbXBsYXRlID0gdGhlIHRlbXBsYXRlIHRvIG1lcmdlIGFsbCBuZXcgcmVjb3JkcyB3aXRoXHJcbiAgICAgIC8vICogc2V0dGluZ3Mub25JbnNlcnQgPSBldmVudCBnaXZlbiBhIGNvcHkgb2YgdGhlIG5ld2x5IGluc2VydGVkIHJlY29yZFxyXG4gICAgICAvLyAqIHNldHRpbmdzLm9uVXBkYXRlID0gZXZlbnQgZ2l2ZW4gdGhlIG9yaWdpbmFsIHJlY29yZCwgdGhlIGNoYW5nZXMsIGFuZCB0aGUgbmV3IHJlY29yZFxyXG4gICAgICAvLyAqIHNldHRpbmdzLm9uUmVtb3ZlID0gZXZlbnQgZ2l2ZW4gdGhlIHJlbW92ZWQgcmVjb3JkXHJcbiAgICAgIC8vICogc2V0dGluZ3MuZm9yY2VQcm9wZXJ0eUNhc2UgPSBvbiBpbnNlcnQgZm9yY2UgdGhlIHByb3BydHkgY2FzZSB0byBiZSBsb3dlciBvciB1cHBlci4gZGVmYXVsdCBsb3dlciwgbnVsbC91bmRlZmluZWQgd2lsbCBsZWF2ZSBjYXNlIGFzIGlzXHJcbiAgICAgIC8vICogZG0gPSB0aGUgbW9kaWZ5IGRhdGUgb2YgdGhlIGRhdGFiYXNlLCB1c2VkIGZvciBxdWVyeSBjYWNoaW5nXHJcbiAgICAgIC8vICoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKiogXHJcblxyXG5cclxuICAgICAgcnVuSW5kZXhlcyA9IGZ1bmN0aW9uICggaW5kZXhlcyApIHtcclxuICAgICAgICAvLyAqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqXHJcbiAgICAgICAgLy8gKlxyXG4gICAgICAgIC8vICogVGFrZXM6IGEgY29sbGVjdGlvbiBvZiBpbmRleGVzXHJcbiAgICAgICAgLy8gKiBSZXR1cm5zOiBjb2xsZWN0aW9uIHdpdGggcmVjb3JkcyBtYXRjaGluZyBpbmRleGVkIGZpbHRlcnNcclxuICAgICAgICAvLyAqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqIFxyXG5cclxuICAgICAgICB2YXIgcmVjb3JkcyA9IFtdLCBVbmlxdWVFbmZvcmNlID0gZmFsc2U7XHJcblxyXG4gICAgICAgIGlmICggaW5kZXhlcy5sZW5ndGggPT09IDAgKXtcclxuICAgICAgICAgIHJldHVybiBUT2I7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBlYWNoKCBpbmRleGVzLCBmdW5jdGlvbiAoIGYgKSB7XHJcbiAgICAgICAgICAvLyBDaGVjayB0byBzZWUgaWYgcmVjb3JkIElEXHJcbiAgICAgICAgICBpZiAoIFQuaXNTdHJpbmcoIGYgKSAmJiAvW3RdWzAtOV0qW3JdWzAtOV0qL2kudGVzdCggZiApICYmXHJcbiAgICAgICAgICAgIFRPYltJRFtmXV0gKVxyXG4gICAgICAgICAge1xyXG4gICAgICAgICAgICByZWNvcmRzLnB1c2goIFRPYltJRFtmXV0gKTtcclxuICAgICAgICAgICAgVW5pcXVlRW5mb3JjZSA9IHRydWU7XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgICAvLyBDaGVjayB0byBzZWUgaWYgcmVjb3JkXHJcbiAgICAgICAgICBpZiAoIFQuaXNPYmplY3QoIGYgKSAmJiBmLl9fX2lkICYmIGYuX19fcyAmJlxyXG4gICAgICAgICAgICBUT2JbSURbZi5fX19pZF1dIClcclxuICAgICAgICAgIHtcclxuICAgICAgICAgICAgcmVjb3Jkcy5wdXNoKCBUT2JbSURbZi5fX19pZF1dICk7XHJcbiAgICAgICAgICAgIFVuaXF1ZUVuZm9yY2UgPSB0cnVlO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgICAgLy8gQ2hlY2sgdG8gc2VlIGlmIGFycmF5IG9mIGluZGV4ZXNcclxuICAgICAgICAgIGlmICggVC5pc0FycmF5KCBmICkgKXtcclxuICAgICAgICAgICAgZWFjaCggZiwgZnVuY3Rpb24gKCByICkge1xyXG4gICAgICAgICAgICAgIGVhY2goIHJ1bkluZGV4ZXMoIHIgKSwgZnVuY3Rpb24gKCByciApIHtcclxuICAgICAgICAgICAgICAgIHJlY29yZHMucHVzaCggcnIgKTtcclxuICAgICAgICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgIH0pO1xyXG4gICAgICAgIGlmICggVW5pcXVlRW5mb3JjZSAmJiByZWNvcmRzLmxlbmd0aCA+IDEgKXtcclxuICAgICAgICAgIHJlY29yZHMgPSBbXTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHJldHVybiByZWNvcmRzO1xyXG4gICAgICB9O1xyXG5cclxuICAgICAgREJJID0ge1xyXG4gICAgICAgIC8vICoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKipcclxuICAgICAgICAvLyAqXHJcbiAgICAgICAgLy8gKiBUaGUgREJJIGlzIHRoZSBpbnRlcm5hbCBEYXRhQmFzZSBJbnRlcmZhY2UgdGhhdCBpbnRlcmFjdHMgd2l0aCB0aGUgZGF0YVxyXG4gICAgICAgIC8vICoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKiogXHJcbiAgICAgICAgZG0gICAgICAgICAgIDogZnVuY3Rpb24gKCBuZCApIHtcclxuICAgICAgICAgIC8vICoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKipcclxuICAgICAgICAgIC8vICpcclxuICAgICAgICAgIC8vICogVGFrZXM6IGFuIG9wdGlvbmFsIG5ldyBtb2RpZnkgZGF0ZVxyXG4gICAgICAgICAgLy8gKiBQdXJwb3NlOiB1c2VkIHRvIGdldCBhbmQgc2V0IHRoZSBEQiBtb2RpZnkgZGF0ZVxyXG4gICAgICAgICAgLy8gKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKiBcclxuICAgICAgICAgIGlmICggbmQgKXtcclxuICAgICAgICAgICAgZG0gPSBuZDtcclxuICAgICAgICAgICAgQ2FjaGUgPSB7fTtcclxuICAgICAgICAgICAgQ2FjaGVDb3VudCA9IDA7XHJcbiAgICAgICAgICAgIENhY2hlQ2xlYXIgPSAwO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgICAgaWYgKCBzZXR0aW5ncy5vbkRCQ2hhbmdlICl7XHJcbiAgICAgICAgICAgIHNldFRpbWVvdXQoIGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgICBzZXR0aW5ncy5vbkRCQ2hhbmdlLmNhbGwoIFRPYiApO1xyXG4gICAgICAgICAgICB9LCAwICk7XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgICBpZiAoIHNldHRpbmdzLnN0b3JhZ2VOYW1lICl7XHJcbiAgICAgICAgICAgIHNldFRpbWVvdXQoIGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgICBsb2NhbFN0b3JhZ2Uuc2V0SXRlbSggJ3RhZmZ5XycgKyBzZXR0aW5ncy5zdG9yYWdlTmFtZSxcclxuICAgICAgICAgICAgICAgIEpTT04uc3RyaW5naWZ5KCBUT2IgKSApO1xyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICAgIH1cclxuICAgICAgICAgIHJldHVybiBkbTtcclxuICAgICAgICB9LFxyXG4gICAgICAgIGluc2VydCAgICAgICA6IGZ1bmN0aW9uICggaSwgcnVuRXZlbnQgKSB7XHJcbiAgICAgICAgICAvLyAqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqXHJcbiAgICAgICAgICAvLyAqXHJcbiAgICAgICAgICAvLyAqIFRha2VzOiBhIG5ldyByZWNvcmQgdG8gaW5zZXJ0XHJcbiAgICAgICAgICAvLyAqIFB1cnBvc2U6IG1lcmdlIHRoZSBvYmplY3Qgd2l0aCB0aGUgdGVtcGxhdGUsIGFkZCBhbiBJRCwgaW5zZXJ0IGludG8gREIsIGNhbGwgaW5zZXJ0IGV2ZW50XHJcbiAgICAgICAgICAvLyAqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqIFxyXG4gICAgICAgICAgdmFyIGNvbHVtbnMgPSBbXSxcclxuICAgICAgICAgICAgcmVjb3JkcyAgID0gW10sXHJcbiAgICAgICAgICAgIGlucHV0ICAgICA9IHByb3RlY3RKU09OKCBpIClcclxuICAgICAgICAgICAgO1xyXG4gICAgICAgICAgZWFjaCggaW5wdXQsIGZ1bmN0aW9uICggdiwgaSApIHtcclxuICAgICAgICAgICAgdmFyIG52LCBvO1xyXG4gICAgICAgICAgICBpZiAoIFQuaXNBcnJheSggdiApICYmIGkgPT09IDAgKXtcclxuICAgICAgICAgICAgICBlYWNoKCB2LCBmdW5jdGlvbiAoIGF2ICkge1xyXG5cclxuICAgICAgICAgICAgICAgIGNvbHVtbnMucHVzaCggKHNldHRpbmdzLmZvcmNlUHJvcGVydHlDYXNlID09PSAnbG93ZXInKVxyXG4gICAgICAgICAgICAgICAgICA/IGF2LnRvTG93ZXJDYXNlKClcclxuICAgICAgICAgICAgICAgICAgICA6IChzZXR0aW5ncy5mb3JjZVByb3BlcnR5Q2FzZSA9PT0gJ3VwcGVyJylcclxuICAgICAgICAgICAgICAgICAgPyBhdi50b1VwcGVyQ2FzZSgpIDogYXYgKTtcclxuICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgICByZXR1cm4gdHJ1ZTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBlbHNlIGlmICggVC5pc0FycmF5KCB2ICkgKXtcclxuICAgICAgICAgICAgICBudiA9IHt9O1xyXG4gICAgICAgICAgICAgIGVhY2goIHYsIGZ1bmN0aW9uICggYXYsIGFpICkge1xyXG4gICAgICAgICAgICAgICAgbnZbY29sdW1uc1thaV1dID0gYXY7XHJcbiAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICAgdiA9IG52O1xyXG5cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBlbHNlIGlmICggVC5pc09iamVjdCggdiApICYmIHNldHRpbmdzLmZvcmNlUHJvcGVydHlDYXNlICl7XHJcbiAgICAgICAgICAgICAgbyA9IHt9O1xyXG5cclxuICAgICAgICAgICAgICBlYWNoaW4oIHYsIGZ1bmN0aW9uICggYXYsIGFpICkge1xyXG4gICAgICAgICAgICAgICAgb1soc2V0dGluZ3MuZm9yY2VQcm9wZXJ0eUNhc2UgPT09ICdsb3dlcicpID8gYWkudG9Mb3dlckNhc2UoKVxyXG4gICAgICAgICAgICAgICAgICA6IChzZXR0aW5ncy5mb3JjZVByb3BlcnR5Q2FzZSA9PT0gJ3VwcGVyJylcclxuICAgICAgICAgICAgICAgICAgPyBhaS50b1VwcGVyQ2FzZSgpIDogYWldID0gdlthaV07XHJcbiAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICAgdiA9IG87XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIFJDKys7XHJcbiAgICAgICAgICAgIHYuX19faWQgPSAnVCcgKyBTdHJpbmcoIGlkcGFkICsgVEMgKS5zbGljZSggLTYgKSArICdSJyArXHJcbiAgICAgICAgICAgICAgU3RyaW5nKCBpZHBhZCArIFJDICkuc2xpY2UoIC02ICk7XHJcbiAgICAgICAgICAgIHYuX19fcyA9IHRydWU7XHJcbiAgICAgICAgICAgIHJlY29yZHMucHVzaCggdi5fX19pZCApO1xyXG4gICAgICAgICAgICBpZiAoIHNldHRpbmdzLnRlbXBsYXRlICl7XHJcbiAgICAgICAgICAgICAgdiA9IFQubWVyZ2VPYmooIHNldHRpbmdzLnRlbXBsYXRlLCB2ICk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgVE9iLnB1c2goIHYgKTtcclxuXHJcbiAgICAgICAgICAgIElEW3YuX19faWRdID0gVE9iLmxlbmd0aCAtIDE7XHJcbiAgICAgICAgICAgIGlmICggc2V0dGluZ3Mub25JbnNlcnQgJiZcclxuICAgICAgICAgICAgICAocnVuRXZlbnQgfHwgVEFGRlkuaXNVbmRlZmluZWQoIHJ1bkV2ZW50ICkpIClcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgIHNldHRpbmdzLm9uSW5zZXJ0LmNhbGwoIHYgKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBEQkkuZG0oIG5ldyBEYXRlKCkgKTtcclxuICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgcmV0dXJuIHJvb3QoIHJlY29yZHMgKTtcclxuICAgICAgICB9LFxyXG4gICAgICAgIHNvcnQgICAgICAgICA6IGZ1bmN0aW9uICggbyApIHtcclxuICAgICAgICAgIC8vICoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKipcclxuICAgICAgICAgIC8vICpcclxuICAgICAgICAgIC8vICogUHVycG9zZTogQ2hhbmdlIHRoZSBzb3J0IG9yZGVyIG9mIHRoZSBEQiBpdHNlbGYgYW5kIHJlc2V0IHRoZSBJRCBidWNrZXRcclxuICAgICAgICAgIC8vICoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKiogXHJcbiAgICAgICAgICBUT2IgPSBvcmRlckJ5Q29sKCBUT2IsIG8uc3BsaXQoICcsJyApICk7XHJcbiAgICAgICAgICBJRCA9IHt9O1xyXG4gICAgICAgICAgZWFjaCggVE9iLCBmdW5jdGlvbiAoIHIsIGkgKSB7XHJcbiAgICAgICAgICAgIElEW3IuX19faWRdID0gaTtcclxuICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgREJJLmRtKCBuZXcgRGF0ZSgpICk7XHJcbiAgICAgICAgICByZXR1cm4gdHJ1ZTtcclxuICAgICAgICB9LFxyXG4gICAgICAgIHVwZGF0ZSAgICAgICA6IGZ1bmN0aW9uICggaWQsIGNoYW5nZXMsIHJ1bkV2ZW50ICkge1xyXG4gICAgICAgICAgLy8gKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKlxyXG4gICAgICAgICAgLy8gKlxyXG4gICAgICAgICAgLy8gKiBUYWtlczogdGhlIElEIG9mIHJlY29yZCBiZWluZyBjaGFuZ2VkIGFuZCB0aGUgY2hhbmdlc1xyXG4gICAgICAgICAgLy8gKiBQdXJwb3NlOiBVcGRhdGUgYSByZWNvcmQgYW5kIGNoYW5nZSBzb21lIG9yIGFsbCB2YWx1ZXMsIGNhbGwgdGhlIG9uIHVwZGF0ZSBtZXRob2RcclxuICAgICAgICAgIC8vICoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKipcclxuXHJcbiAgICAgICAgICB2YXIgbmMgPSB7fSwgb3IsIG5yLCB0YywgaGFzQ2hhbmdlO1xyXG4gICAgICAgICAgaWYgKCBzZXR0aW5ncy5mb3JjZVByb3BlcnR5Q2FzZSApe1xyXG4gICAgICAgICAgICBlYWNoaW4oIGNoYW5nZXMsIGZ1bmN0aW9uICggdiwgcCApIHtcclxuICAgICAgICAgICAgICBuY1soc2V0dGluZ3MuZm9yY2VQcm9wZXJ0eUNhc2UgPT09ICdsb3dlcicpID8gcC50b0xvd2VyQ2FzZSgpXHJcbiAgICAgICAgICAgICAgICA6IChzZXR0aW5ncy5mb3JjZVByb3BlcnR5Q2FzZSA9PT0gJ3VwcGVyJykgPyBwLnRvVXBwZXJDYXNlKClcclxuICAgICAgICAgICAgICAgIDogcF0gPSB2O1xyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgY2hhbmdlcyA9IG5jO1xyXG4gICAgICAgICAgfVxyXG5cclxuICAgICAgICAgIG9yID0gVE9iW0lEW2lkXV07XHJcbiAgICAgICAgICBuciA9IFQubWVyZ2VPYmooIG9yLCBjaGFuZ2VzICk7XHJcblxyXG4gICAgICAgICAgdGMgPSB7fTtcclxuICAgICAgICAgIGhhc0NoYW5nZSA9IGZhbHNlO1xyXG4gICAgICAgICAgZWFjaGluKCBuciwgZnVuY3Rpb24gKCB2LCBpICkge1xyXG4gICAgICAgICAgICBpZiAoIFRBRkZZLmlzVW5kZWZpbmVkKCBvcltpXSApIHx8IG9yW2ldICE9PSB2ICl7XHJcbiAgICAgICAgICAgICAgdGNbaV0gPSB2O1xyXG4gICAgICAgICAgICAgIGhhc0NoYW5nZSA9IHRydWU7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgaWYgKCBoYXNDaGFuZ2UgKXtcclxuICAgICAgICAgICAgaWYgKCBzZXR0aW5ncy5vblVwZGF0ZSAmJlxyXG4gICAgICAgICAgICAgIChydW5FdmVudCB8fCBUQUZGWS5pc1VuZGVmaW5lZCggcnVuRXZlbnQgKSkgKVxyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgc2V0dGluZ3Mub25VcGRhdGUuY2FsbCggbnIsIFRPYltJRFtpZF1dLCB0YyApO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIFRPYltJRFtpZF1dID0gbnI7XHJcbiAgICAgICAgICAgIERCSS5kbSggbmV3IERhdGUoKSApO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgIH0sXHJcbiAgICAgICAgcmVtb3ZlICAgICAgIDogZnVuY3Rpb24gKCBpZCApIHtcclxuICAgICAgICAgIC8vICoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKipcclxuICAgICAgICAgIC8vICpcclxuICAgICAgICAgIC8vICogVGFrZXM6IHRoZSBJRCBvZiByZWNvcmQgdG8gYmUgcmVtb3ZlZFxyXG4gICAgICAgICAgLy8gKiBQdXJwb3NlOiByZW1vdmUgYSByZWNvcmQsIGNoYW5nZXMgaXRzIF9fX3MgdmFsdWUgdG8gZmFsc2VcclxuICAgICAgICAgIC8vICoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKiogXHJcbiAgICAgICAgICBUT2JbSURbaWRdXS5fX19zID0gZmFsc2U7XHJcbiAgICAgICAgfSxcclxuICAgICAgICByZW1vdmVDb21taXQgOiBmdW5jdGlvbiAoIHJ1bkV2ZW50ICkge1xyXG4gICAgICAgICAgdmFyIHg7XHJcbiAgICAgICAgICAvLyAqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqXHJcbiAgICAgICAgICAvLyAqXHJcbiAgICAgICAgICAvLyAqIFxyXG4gICAgICAgICAgLy8gKiBQdXJwb3NlOiBsb29wIG92ZXIgYWxsIHJlY29yZHMgYW5kIHJlbW92ZSByZWNvcmRzIHdpdGggX19fcyA9IGZhbHNlLCBjYWxsIG9uUmVtb3ZlIGV2ZW50LCBjbGVhciBJRFxyXG4gICAgICAgICAgLy8gKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKlxyXG4gICAgICAgICAgZm9yICggeCA9IFRPYi5sZW5ndGggLSAxOyB4ID4gLTE7IHgtLSApe1xyXG5cclxuICAgICAgICAgICAgaWYgKCAhVE9iW3hdLl9fX3MgKXtcclxuICAgICAgICAgICAgICBpZiAoIHNldHRpbmdzLm9uUmVtb3ZlICYmXHJcbiAgICAgICAgICAgICAgICAocnVuRXZlbnQgfHwgVEFGRlkuaXNVbmRlZmluZWQoIHJ1bkV2ZW50ICkpIClcclxuICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICBzZXR0aW5ncy5vblJlbW92ZS5jYWxsKCBUT2JbeF0gKTtcclxuICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgSURbVE9iW3hdLl9fX2lkXSA9IHVuZGVmaW5lZDtcclxuICAgICAgICAgICAgICBUT2Iuc3BsaWNlKCB4LCAxICk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgIH1cclxuICAgICAgICAgIElEID0ge307XHJcbiAgICAgICAgICBlYWNoKCBUT2IsIGZ1bmN0aW9uICggciwgaSApIHtcclxuICAgICAgICAgICAgSURbci5fX19pZF0gPSBpO1xyXG4gICAgICAgICAgfSk7XHJcbiAgICAgICAgICBEQkkuZG0oIG5ldyBEYXRlKCkgKTtcclxuICAgICAgICB9LFxyXG4gICAgICAgIHF1ZXJ5IDogZnVuY3Rpb24gKCBjb250ZXh0ICkge1xyXG4gICAgICAgICAgLy8gKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKlxyXG4gICAgICAgICAgLy8gKlxyXG4gICAgICAgICAgLy8gKiBUYWtlczogdGhlIGNvbnRleHQgb2JqZWN0IGZvciBhIHF1ZXJ5IGFuZCBlaXRoZXIgcmV0dXJucyBhIGNhY2hlIHJlc3VsdCBvciBhIG5ldyBxdWVyeSByZXN1bHRcclxuICAgICAgICAgIC8vICoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKiogXHJcbiAgICAgICAgICB2YXIgcmV0dXJucSwgY2lkLCByZXN1bHRzLCBpbmRleGVkLCBsaW1pdHEsIG5pO1xyXG5cclxuICAgICAgICAgIGlmICggc2V0dGluZ3MuY2FjaGVTaXplICkge1xyXG4gICAgICAgICAgICBjaWQgPSAnJztcclxuICAgICAgICAgICAgZWFjaCggY29udGV4dC5maWx0ZXJSYXcsIGZ1bmN0aW9uICggciApIHtcclxuICAgICAgICAgICAgICBpZiAoIFQuaXNGdW5jdGlvbiggciApICl7XHJcbiAgICAgICAgICAgICAgICBjaWQgPSAnbm9jYWNoZSc7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gVEFGRlkuRVhJVDtcclxuICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICBpZiAoIGNpZCA9PT0gJycgKXtcclxuICAgICAgICAgICAgICBjaWQgPSBtYWtlQ2lkKCBULm1lcmdlT2JqKCBjb250ZXh0LFxyXG4gICAgICAgICAgICAgICAge3EgOiBmYWxzZSwgcnVuIDogZmFsc2UsIHNvcnQgOiBmYWxzZX0gKSApO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgICAvLyBSdW4gYSBuZXcgcXVlcnkgaWYgdGhlcmUgYXJlIG5vIHJlc3VsdHMgb3IgdGhlIHJ1biBkYXRlIGhhcyBiZWVuIGNsZWFyZWRcclxuICAgICAgICAgIGlmICggIWNvbnRleHQucmVzdWx0cyB8fCAhY29udGV4dC5ydW4gfHxcclxuICAgICAgICAgICAgKGNvbnRleHQucnVuICYmIERCSS5kbSgpID4gY29udGV4dC5ydW4pIClcclxuICAgICAgICAgIHtcclxuICAgICAgICAgICAgcmVzdWx0cyA9IFtdO1xyXG5cclxuICAgICAgICAgICAgLy8gY2hlY2sgQ2FjaGVcclxuXHJcbiAgICAgICAgICAgIGlmICggc2V0dGluZ3MuY2FjaGVTaXplICYmIENhY2hlW2NpZF0gKXtcclxuXHJcbiAgICAgICAgICAgICAgQ2FjaGVbY2lkXS5pID0gQ2FjaGVDb3VudCsrO1xyXG4gICAgICAgICAgICAgIHJldHVybiBDYWNoZVtjaWRdLnJlc3VsdHM7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgICAgLy8gaWYgbm8gZmlsdGVyLCByZXR1cm4gREJcclxuICAgICAgICAgICAgICBpZiAoIGNvbnRleHQucS5sZW5ndGggPT09IDAgJiYgY29udGV4dC5pbmRleC5sZW5ndGggPT09IDAgKXtcclxuICAgICAgICAgICAgICAgIGVhY2goIFRPYiwgZnVuY3Rpb24gKCByICkge1xyXG4gICAgICAgICAgICAgICAgICByZXN1bHRzLnB1c2goIHIgKTtcclxuICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAgICAgcmV0dXJucSA9IHJlc3VsdHM7XHJcbiAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgLy8gdXNlIGluZGV4ZXNcclxuXHJcbiAgICAgICAgICAgICAgICBpbmRleGVkID0gcnVuSW5kZXhlcyggY29udGV4dC5pbmRleCApO1xyXG5cclxuICAgICAgICAgICAgICAgIC8vIHJ1biBmaWx0ZXJzXHJcbiAgICAgICAgICAgICAgICBlYWNoKCBpbmRleGVkLCBmdW5jdGlvbiAoIHIgKSB7XHJcbiAgICAgICAgICAgICAgICAgIC8vIFJ1biBmaWx0ZXIgdG8gc2VlIGlmIHJlY29yZCBtYXRjaGVzIHF1ZXJ5XHJcbiAgICAgICAgICAgICAgICAgIGlmICggY29udGV4dC5xLmxlbmd0aCA9PT0gMCB8fCBydW5GaWx0ZXJzKCByLCBjb250ZXh0LnEgKSApe1xyXG4gICAgICAgICAgICAgICAgICAgIHJlc3VsdHMucHVzaCggciApO1xyXG4gICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgICAgICAgICByZXR1cm5xID0gcmVzdWx0cztcclxuICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuXHJcblxyXG4gICAgICAgICAgfVxyXG4gICAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgIC8vIElmIHF1ZXJ5IGV4aXN0cyBhbmQgcnVuIGhhcyBub3QgYmVlbiBjbGVhcmVkIHJldHVybiB0aGUgY2FjaGUgcmVzdWx0c1xyXG4gICAgICAgICAgICByZXR1cm5xID0gY29udGV4dC5yZXN1bHRzO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgICAgLy8gSWYgYSBjdXN0b20gb3JkZXIgYXJyYXkgZXhpc3RzIGFuZCB0aGUgcnVuIGhhcyBiZWVuIGNsZWFyIG9yIHRoZSBzb3J0IGhhcyBiZWVuIGNsZWFyZWRcclxuICAgICAgICAgIGlmICggY29udGV4dC5vcmRlci5sZW5ndGggPiAwICYmICghY29udGV4dC5ydW4gfHwgIWNvbnRleHQuc29ydCkgKXtcclxuICAgICAgICAgICAgLy8gb3JkZXIgdGhlIHJlc3VsdHNcclxuICAgICAgICAgICAgcmV0dXJucSA9IG9yZGVyQnlDb2woIHJldHVybnEsIGNvbnRleHQub3JkZXIgKTtcclxuICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAvLyBJZiBhIGxpbWl0IG9uIHRoZSBudW1iZXIgb2YgcmVzdWx0cyBleGlzdHMgYW5kIGl0IGlzIGxlc3MgdGhhbiB0aGUgcmV0dXJuZWQgcmVzdWx0cywgbGltaXQgcmVzdWx0c1xyXG4gICAgICAgICAgaWYgKCByZXR1cm5xLmxlbmd0aCAmJlxyXG4gICAgICAgICAgICAoKGNvbnRleHQubGltaXQgJiYgY29udGV4dC5saW1pdCA8IHJldHVybnEubGVuZ3RoKSB8fFxyXG4gICAgICAgICAgICAgIGNvbnRleHQuc3RhcnQpXHJcbiAgICAgICAgICApIHtcclxuICAgICAgICAgICAgbGltaXRxID0gW107XHJcbiAgICAgICAgICAgIGVhY2goIHJldHVybnEsIGZ1bmN0aW9uICggciwgaSApIHtcclxuICAgICAgICAgICAgICBpZiAoICFjb250ZXh0LnN0YXJ0IHx8XHJcbiAgICAgICAgICAgICAgICAoY29udGV4dC5zdGFydCAmJiAoaSArIDEpID49IGNvbnRleHQuc3RhcnQpIClcclxuICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICBpZiAoIGNvbnRleHQubGltaXQgKXtcclxuICAgICAgICAgICAgICAgICAgbmkgPSAoY29udGV4dC5zdGFydCkgPyAoaSArIDEpIC0gY29udGV4dC5zdGFydCA6IGk7XHJcbiAgICAgICAgICAgICAgICAgIGlmICggbmkgPCBjb250ZXh0LmxpbWl0ICl7XHJcbiAgICAgICAgICAgICAgICAgICAgbGltaXRxLnB1c2goIHIgKTtcclxuICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICBlbHNlIGlmICggbmkgPiBjb250ZXh0LmxpbWl0ICl7XHJcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIFRBRkZZLkVYSVQ7XHJcbiAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICBsaW1pdHEucHVzaCggciApO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgIHJldHVybnEgPSBsaW1pdHE7XHJcbiAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgLy8gdXBkYXRlIGNhY2hlXHJcbiAgICAgICAgICBpZiAoIHNldHRpbmdzLmNhY2hlU2l6ZSAmJiBjaWQgIT09ICdub2NhY2hlJyApe1xyXG4gICAgICAgICAgICBDYWNoZUNsZWFyKys7XHJcblxyXG4gICAgICAgICAgICBzZXRUaW1lb3V0KCBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgICAgdmFyIGJDb3VudGVyLCBuYztcclxuICAgICAgICAgICAgICBpZiAoIENhY2hlQ2xlYXIgPj0gc2V0dGluZ3MuY2FjaGVTaXplICogMiApe1xyXG4gICAgICAgICAgICAgICAgQ2FjaGVDbGVhciA9IDA7XHJcbiAgICAgICAgICAgICAgICBiQ291bnRlciA9IENhY2hlQ291bnQgLSBzZXR0aW5ncy5jYWNoZVNpemU7XHJcbiAgICAgICAgICAgICAgICBuYyA9IHt9O1xyXG4gICAgICAgICAgICAgICAgZWFjaGluKCBmdW5jdGlvbiAoIHIsIGsgKSB7XHJcbiAgICAgICAgICAgICAgICAgIGlmICggci5pID49IGJDb3VudGVyICl7XHJcbiAgICAgICAgICAgICAgICAgICAgbmNba10gPSByO1xyXG4gICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgICAgIENhY2hlID0gbmM7XHJcbiAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9LCAwICk7XHJcblxyXG4gICAgICAgICAgICBDYWNoZVtjaWRdID0geyBpIDogQ2FjaGVDb3VudCsrLCByZXN1bHRzIDogcmV0dXJucSB9O1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgICAgcmV0dXJuIHJldHVybnE7XHJcbiAgICAgICAgfVxyXG4gICAgICB9O1xyXG5cclxuXHJcbiAgICAgIHJvb3QgPSBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgdmFyIGlBUEksIGNvbnRleHQ7XHJcbiAgICAgICAgLy8gKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKlxyXG4gICAgICAgIC8vICpcclxuICAgICAgICAvLyAqIFRoZSByb290IGZ1bmN0aW9uIHRoYXQgZ2V0cyByZXR1cm5lZCB3aGVuIGEgbmV3IERCIGlzIGNyZWF0ZWRcclxuICAgICAgICAvLyAqIFRha2VzOiB1bmxpbWl0ZWQgZmlsdGVyIGFyZ3VtZW50cyBhbmQgY3JlYXRlcyBmaWx0ZXJzIHRvIGJlIHJ1biB3aGVuIGEgcXVlcnkgaXMgY2FsbGVkXHJcbiAgICAgICAgLy8gKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKiBcclxuICAgICAgICAvLyAqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqXHJcbiAgICAgICAgLy8gKlxyXG4gICAgICAgIC8vICogaUFQSSBpcyB0aGUgdGhlIG1ldGhvZCBjb2xsZWN0aW9uIHZhbGlhYmxlIHdoZW4gYSBxdWVyeSBoYXMgYmVlbiBzdGFydGVkIGJ5IGNhbGxpbmcgZGJuYW1lXHJcbiAgICAgICAgLy8gKiBDZXJ0YWluIG1ldGhvZHMgYXJlIG9yIGFyZSBub3QgYXZhbGlhYmxlIG9uY2UgeW91IGhhdmUgc3RhcnRlZCBhIHF1ZXJ5IHN1Y2ggYXMgaW5zZXJ0IC0tIHlvdSBjYW4gb25seSBpbnNlcnQgaW50byByb290XHJcbiAgICAgICAgLy8gKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKlxyXG4gICAgICAgIGlBUEkgPSBUQUZGWS5tZXJnZU9iaiggVEFGRlkubWVyZ2VPYmooIEFQSSwgeyBpbnNlcnQgOiB1bmRlZmluZWQgfSApLFxyXG4gICAgICAgICAgeyBnZXREQkkgIDogZnVuY3Rpb24gKCkgeyByZXR1cm4gREJJOyB9LFxyXG4gICAgICAgICAgICBnZXRyb290IDogZnVuY3Rpb24gKCBjICkgeyByZXR1cm4gcm9vdC5jYWxsKCBjICk7IH0sXHJcbiAgICAgICAgICBjb250ZXh0IDogZnVuY3Rpb24gKCBuICkge1xyXG4gICAgICAgICAgICAvLyAqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqXHJcbiAgICAgICAgICAgIC8vICpcclxuICAgICAgICAgICAgLy8gKiBUaGUgY29udGV4dCBjb250YWlucyBhbGwgdGhlIGluZm9ybWF0aW9uIHRvIG1hbmFnZSBhIHF1ZXJ5IGluY2x1ZGluZyBmaWx0ZXJzLCBsaW1pdHMsIGFuZCBzb3J0c1xyXG4gICAgICAgICAgICAvLyAqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqIFxyXG4gICAgICAgICAgICBpZiAoIG4gKXtcclxuICAgICAgICAgICAgICBjb250ZXh0ID0gVEFGRlkubWVyZ2VPYmooIGNvbnRleHQsXHJcbiAgICAgICAgICAgICAgICBuLmhhc093blByb3BlcnR5KCdyZXN1bHRzJylcclxuICAgICAgICAgICAgICAgICAgPyBUQUZGWS5tZXJnZU9iaiggbiwgeyBydW4gOiBuZXcgRGF0ZSgpLCBzb3J0OiBuZXcgRGF0ZSgpIH0pXHJcbiAgICAgICAgICAgICAgICAgIDogblxyXG4gICAgICAgICAgICAgICk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgcmV0dXJuIGNvbnRleHQ7XHJcbiAgICAgICAgICB9LFxyXG4gICAgICAgICAgZXh0ZW5kICA6IHVuZGVmaW5lZFxyXG4gICAgICAgIH0pO1xyXG5cclxuICAgICAgICBjb250ZXh0ID0gKHRoaXMgJiYgdGhpcy5xKSA/IHRoaXMgOiB7XHJcbiAgICAgICAgICBsaW1pdCAgICAgOiBmYWxzZSxcclxuICAgICAgICAgIHN0YXJ0ICAgICA6IGZhbHNlLFxyXG4gICAgICAgICAgcSAgICAgICAgIDogW10sXHJcbiAgICAgICAgICBmaWx0ZXJSYXcgOiBbXSxcclxuICAgICAgICAgIGluZGV4ICAgICA6IFtdLFxyXG4gICAgICAgICAgb3JkZXIgICAgIDogW10sXHJcbiAgICAgICAgICByZXN1bHRzICAgOiBmYWxzZSxcclxuICAgICAgICAgIHJ1biAgICAgICA6IG51bGwsXHJcbiAgICAgICAgICBzb3J0ICAgICAgOiBudWxsLFxyXG4gICAgICAgICAgc2V0dGluZ3MgIDogc2V0dGluZ3NcclxuICAgICAgICB9O1xyXG4gICAgICAgIC8vICoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKipcclxuICAgICAgICAvLyAqXHJcbiAgICAgICAgLy8gKiBDYWxsIHRoZSBxdWVyeSBtZXRob2QgdG8gc2V0dXAgYSBuZXcgcXVlcnlcclxuICAgICAgICAvLyAqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqIFxyXG4gICAgICAgIGVhY2goIGFyZ3VtZW50cywgZnVuY3Rpb24gKCBmICkge1xyXG5cclxuICAgICAgICAgIGlmICggaXNJbmRleGFibGUoIGYgKSApe1xyXG4gICAgICAgICAgICBjb250ZXh0LmluZGV4LnB1c2goIGYgKTtcclxuICAgICAgICAgIH1cclxuICAgICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICBjb250ZXh0LnEucHVzaCggcmV0dXJuRmlsdGVyKCBmICkgKTtcclxuICAgICAgICAgIH1cclxuICAgICAgICAgIGNvbnRleHQuZmlsdGVyUmF3LnB1c2goIGYgKTtcclxuICAgICAgICB9KTtcclxuXHJcblxyXG4gICAgICAgIHJldHVybiBpQVBJO1xyXG4gICAgICB9O1xyXG5cclxuICAgICAgLy8gKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKlxyXG4gICAgICAvLyAqXHJcbiAgICAgIC8vICogSWYgbmV3IHJlY29yZHMgaGF2ZSBiZWVuIHBhc3NlZCBvbiBjcmVhdGlvbiBvZiB0aGUgREIgZWl0aGVyIGFzIEpTT04gb3IgYXMgYW4gYXJyYXkvb2JqZWN0LCBpbnNlcnQgdGhlbVxyXG4gICAgICAvLyAqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqIFxyXG4gICAgICBUQysrO1xyXG4gICAgICBpZiAoIGQgKXtcclxuICAgICAgICBEQkkuaW5zZXJ0KCBkICk7XHJcbiAgICAgIH1cclxuXHJcblxyXG4gICAgICByb290Lmluc2VydCA9IERCSS5pbnNlcnQ7XHJcblxyXG4gICAgICByb290Lm1lcmdlID0gZnVuY3Rpb24gKCBpLCBrZXksIHJ1bkV2ZW50ICkge1xyXG4gICAgICAgIHZhclxyXG4gICAgICAgICAgc2VhcmNoICAgICAgPSB7fSxcclxuICAgICAgICAgIGZpbmFsU2VhcmNoID0gW10sXHJcbiAgICAgICAgICBvYmogICAgICAgICA9IHt9XHJcbiAgICAgICAgICA7XHJcblxyXG4gICAgICAgIHJ1bkV2ZW50ICAgID0gcnVuRXZlbnQgfHwgZmFsc2U7XHJcbiAgICAgICAga2V5ICAgICAgICAgPSBrZXkgICAgICB8fCAnaWQnO1xyXG5cclxuICAgICAgICBlYWNoKCBpLCBmdW5jdGlvbiAoIG8gKSB7XHJcbiAgICAgICAgICB2YXIgZXhpc3RpbmdPYmplY3Q7XHJcbiAgICAgICAgICBzZWFyY2hba2V5XSA9IG9ba2V5XTtcclxuICAgICAgICAgIGZpbmFsU2VhcmNoLnB1c2goIG9ba2V5XSApO1xyXG4gICAgICAgICAgZXhpc3RpbmdPYmplY3QgPSByb290KCBzZWFyY2ggKS5maXJzdCgpO1xyXG4gICAgICAgICAgaWYgKCBleGlzdGluZ09iamVjdCApe1xyXG4gICAgICAgICAgICBEQkkudXBkYXRlKCBleGlzdGluZ09iamVjdC5fX19pZCwgbywgcnVuRXZlbnQgKTtcclxuICAgICAgICAgIH1cclxuICAgICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICBEQkkuaW5zZXJ0KCBvLCBydW5FdmVudCApO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgIH0pO1xyXG5cclxuICAgICAgICBvYmpba2V5XSA9IGZpbmFsU2VhcmNoO1xyXG4gICAgICAgIHJldHVybiByb290KCBvYmogKTtcclxuICAgICAgfTtcclxuXHJcbiAgICAgIHJvb3QuVEFGRlkgPSB0cnVlO1xyXG4gICAgICByb290LnNvcnQgPSBEQkkuc29ydDtcclxuICAgICAgLy8gKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKlxyXG4gICAgICAvLyAqXHJcbiAgICAgIC8vICogVGhlc2UgYXJlIHRoZSBtZXRob2RzIHRoYXQgY2FuIGJlIGFjY2Vzc2VkIG9uIG9mZiB0aGUgcm9vdCBEQiBmdW5jdGlvbi4gRXhhbXBsZSBkYm5hbWUuaW5zZXJ0O1xyXG4gICAgICAvLyAqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqIFxyXG4gICAgICByb290LnNldHRpbmdzID0gZnVuY3Rpb24gKCBuICkge1xyXG4gICAgICAgIC8vICoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKipcclxuICAgICAgICAvLyAqXHJcbiAgICAgICAgLy8gKiBHZXR0aW5nIGFuZCBzZXR0aW5nIGZvciB0aGlzIERCJ3Mgc2V0dGluZ3MvZXZlbnRzXHJcbiAgICAgICAgLy8gKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKiBcclxuICAgICAgICBpZiAoIG4gKXtcclxuICAgICAgICAgIHNldHRpbmdzID0gVEFGRlkubWVyZ2VPYmooIHNldHRpbmdzLCBuICk7XHJcbiAgICAgICAgICBpZiAoIG4udGVtcGxhdGUgKXtcclxuXHJcbiAgICAgICAgICAgIHJvb3QoKS51cGRhdGUoIG4udGVtcGxhdGUgKTtcclxuICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIHNldHRpbmdzO1xyXG4gICAgICB9O1xyXG5cclxuICAgICAgLy8gKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKlxyXG4gICAgICAvLyAqXHJcbiAgICAgIC8vICogVGhlc2UgYXJlIHRoZSBtZXRob2RzIHRoYXQgY2FuIGJlIGFjY2Vzc2VkIG9uIG9mZiB0aGUgcm9vdCBEQiBmdW5jdGlvbi4gRXhhbXBsZSBkYm5hbWUuaW5zZXJ0O1xyXG4gICAgICAvLyAqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqIFxyXG4gICAgICByb290LnN0b3JlID0gZnVuY3Rpb24gKCBuICkge1xyXG4gICAgICAgIC8vICoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKipcclxuICAgICAgICAvLyAqXHJcbiAgICAgICAgLy8gKiBTZXR1cCBsb2NhbHN0b3JhZ2UgZm9yIHRoaXMgREIgb24gYSBnaXZlbiBuYW1lXHJcbiAgICAgICAgLy8gKiBQdWxsIGRhdGEgaW50byB0aGUgREIgYXMgbmVlZGVkXHJcbiAgICAgICAgLy8gKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKiBcclxuICAgICAgICB2YXIgciA9IGZhbHNlLCBpO1xyXG4gICAgICAgIGlmICggbG9jYWxTdG9yYWdlICl7XHJcbiAgICAgICAgICBpZiAoIG4gKXtcclxuICAgICAgICAgICAgaSA9IGxvY2FsU3RvcmFnZS5nZXRJdGVtKCAndGFmZnlfJyArIG4gKTtcclxuICAgICAgICAgICAgaWYgKCBpICYmIGkubGVuZ3RoID4gMCApe1xyXG4gICAgICAgICAgICAgIHJvb3QuaW5zZXJ0KCBpICk7XHJcbiAgICAgICAgICAgICAgciA9IHRydWU7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgaWYgKCBUT2IubGVuZ3RoID4gMCApe1xyXG4gICAgICAgICAgICAgIHNldFRpbWVvdXQoIGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgICAgIGxvY2FsU3RvcmFnZS5zZXRJdGVtKCAndGFmZnlfJyArIHNldHRpbmdzLnN0b3JhZ2VOYW1lLFxyXG4gICAgICAgICAgICAgICAgICBKU09OLnN0cmluZ2lmeSggVE9iICkgKTtcclxuICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgfVxyXG4gICAgICAgICAgcm9vdC5zZXR0aW5ncygge3N0b3JhZ2VOYW1lIDogbn0gKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIHJvb3Q7XHJcbiAgICAgIH07XHJcblxyXG4gICAgICAvLyAqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqXHJcbiAgICAgIC8vICpcclxuICAgICAgLy8gKiBSZXR1cm4gcm9vdCBvbiBEQiBjcmVhdGlvbiBhbmQgc3RhcnQgaGF2aW5nIGZ1blxyXG4gICAgICAvLyAqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqIFxyXG4gICAgICByZXR1cm4gcm9vdDtcclxuICAgIH07XHJcbiAgICAvLyAqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqXHJcbiAgICAvLyAqXHJcbiAgICAvLyAqIFNldHMgdGhlIGdsb2JhbCBUQUZGWSBvYmplY3RcclxuICAgIC8vICoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKiogXHJcbiAgICBUQUZGWSA9IFQ7XHJcblxyXG5cclxuICAgIC8vICoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKipcclxuICAgIC8vICpcclxuICAgIC8vICogQ3JlYXRlIHB1YmxpYyBlYWNoIG1ldGhvZFxyXG4gICAgLy8gKlxyXG4gICAgLy8gKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKiAgIFxyXG4gICAgVC5lYWNoID0gZWFjaDtcclxuXHJcbiAgICAvLyAqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqXHJcbiAgICAvLyAqXHJcbiAgICAvLyAqIENyZWF0ZSBwdWJsaWMgZWFjaGluIG1ldGhvZFxyXG4gICAgLy8gKlxyXG4gICAgLy8gKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKiAgIFxyXG4gICAgVC5lYWNoaW4gPSBlYWNoaW47XHJcbiAgICAvLyAqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqXHJcbiAgICAvLyAqXHJcbiAgICAvLyAqIENyZWF0ZSBwdWJsaWMgZXh0ZW5kIG1ldGhvZFxyXG4gICAgLy8gKiBBZGQgYSBjdXN0b20gbWV0aG9kIHRvIHRoZSBBUElcclxuICAgIC8vICpcclxuICAgIC8vICoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKiogICBcclxuICAgIFQuZXh0ZW5kID0gQVBJLmV4dGVuZDtcclxuXHJcblxyXG4gICAgLy8gKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKlxyXG4gICAgLy8gKlxyXG4gICAgLy8gKiBDcmVhdGVzIFRBRkZZLkVYSVQgdmFsdWUgdGhhdCBjYW4gYmUgcmV0dXJuZWQgdG8gc3RvcCBhbiBlYWNoIGxvb3BcclxuICAgIC8vICpcclxuICAgIC8vICoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKiogIFxyXG4gICAgVEFGRlkuRVhJVCA9ICdUQUZGWUVYSVQnO1xyXG5cclxuICAgIC8vICoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKipcclxuICAgIC8vICpcclxuICAgIC8vICogQ3JlYXRlIHB1YmxpYyB1dGlsaXR5IG1lcmdlT2JqIG1ldGhvZFxyXG4gICAgLy8gKiBSZXR1cm4gYSBuZXcgb2JqZWN0IHdoZXJlIGl0ZW1zIGZyb20gb2JqMlxyXG4gICAgLy8gKiBoYXZlIHJlcGxhY2VkIG9yIGJlZW4gYWRkZWQgdG8gdGhlIGl0ZW1zIGluXHJcbiAgICAvLyAqIG9iajFcclxuICAgIC8vICogUHVycG9zZTogVXNlZCB0byBjb21iaW5lIG9ianNcclxuICAgIC8vICpcclxuICAgIC8vICoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKiogICBcclxuICAgIFRBRkZZLm1lcmdlT2JqID0gZnVuY3Rpb24gKCBvYjEsIG9iMiApIHtcclxuICAgICAgdmFyIGMgPSB7fTtcclxuICAgICAgZWFjaGluKCBvYjEsIGZ1bmN0aW9uICggdiwgbiApIHsgY1tuXSA9IG9iMVtuXTsgfSk7XHJcbiAgICAgIGVhY2hpbiggb2IyLCBmdW5jdGlvbiAoIHYsIG4gKSB7IGNbbl0gPSBvYjJbbl07IH0pO1xyXG4gICAgICByZXR1cm4gYztcclxuICAgIH07XHJcblxyXG5cclxuICAgIC8vICoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKipcclxuICAgIC8vICpcclxuICAgIC8vICogQ3JlYXRlIHB1YmxpYyB1dGlsaXR5IGhhcyBtZXRob2RcclxuICAgIC8vICogUmV0dXJucyB0cnVlIGlmIGEgY29tcGxleCBvYmplY3QsIGFycmF5XHJcbiAgICAvLyAqIG9yIHRhZmZ5IGNvbGxlY3Rpb24gY29udGFpbnMgdGhlIG1hdGVyaWFsXHJcbiAgICAvLyAqIHByb3ZpZGVkIGluIHRoZSBzZWNvbmQgYXJndW1lbnRcclxuICAgIC8vICogUHVycG9zZTogVXNlZCB0byBjb21hcmUgb2JqZWN0c1xyXG4gICAgLy8gKlxyXG4gICAgLy8gKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKlxyXG4gICAgVEFGRlkuaGFzID0gZnVuY3Rpb24gKCB2YXIxLCB2YXIyICkge1xyXG5cclxuICAgICAgdmFyIHJlID0gZmFsc2UsIG47XHJcblxyXG4gICAgICBpZiAoICh2YXIxLlRBRkZZKSApe1xyXG4gICAgICAgIHJlID0gdmFyMSggdmFyMiApO1xyXG4gICAgICAgIGlmICggcmUubGVuZ3RoID4gMCApe1xyXG4gICAgICAgICAgcmV0dXJuIHRydWU7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG4gICAgICBlbHNlIHtcclxuXHJcbiAgICAgICAgc3dpdGNoICggVC50eXBlT2YoIHZhcjEgKSApe1xyXG4gICAgICAgICAgY2FzZSAnb2JqZWN0JzpcclxuICAgICAgICAgICAgaWYgKCBULmlzT2JqZWN0KCB2YXIyICkgKXtcclxuICAgICAgICAgICAgICBlYWNoaW4oIHZhcjIsIGZ1bmN0aW9uICggdiwgbiApIHtcclxuICAgICAgICAgICAgICAgIGlmICggcmUgPT09IHRydWUgJiYgIVQuaXNVbmRlZmluZWQoIHZhcjFbbl0gKSAmJlxyXG4gICAgICAgICAgICAgICAgICB2YXIxLmhhc093blByb3BlcnR5KCBuICkgKVxyXG4gICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICByZSA9IFQuaGFzKCB2YXIxW25dLCB2YXIyW25dICk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgcmUgPSBmYWxzZTtcclxuICAgICAgICAgICAgICAgICAgcmV0dXJuIFRBRkZZLkVYSVQ7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgZWxzZSBpZiAoIFQuaXNBcnJheSggdmFyMiApICl7XHJcbiAgICAgICAgICAgICAgZWFjaCggdmFyMiwgZnVuY3Rpb24gKCB2LCBuICkge1xyXG4gICAgICAgICAgICAgICAgcmUgPSBULmhhcyggdmFyMSwgdmFyMltuXSApO1xyXG4gICAgICAgICAgICAgICAgaWYgKCByZSApe1xyXG4gICAgICAgICAgICAgICAgICByZXR1cm4gVEFGRlkuRVhJVDtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBlbHNlIGlmICggVC5pc1N0cmluZyggdmFyMiApICl7XHJcbiAgICAgICAgICAgICAgaWYgKCAhVEFGRlkuaXNVbmRlZmluZWQoIHZhcjFbdmFyMl0gKSApe1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIHRydWU7XHJcbiAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICByZXR1cm4gcmU7XHJcbiAgICAgICAgICBjYXNlICdhcnJheSc6XHJcbiAgICAgICAgICAgIGlmICggVC5pc09iamVjdCggdmFyMiApICl7XHJcbiAgICAgICAgICAgICAgZWFjaCggdmFyMSwgZnVuY3Rpb24gKCB2LCBpICkge1xyXG4gICAgICAgICAgICAgICAgcmUgPSBULmhhcyggdmFyMVtpXSwgdmFyMiApO1xyXG4gICAgICAgICAgICAgICAgaWYgKCByZSA9PT0gdHJ1ZSApe1xyXG4gICAgICAgICAgICAgICAgICByZXR1cm4gVEFGRlkuRVhJVDtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBlbHNlIGlmICggVC5pc0FycmF5KCB2YXIyICkgKXtcclxuICAgICAgICAgICAgICBlYWNoKCB2YXIyLCBmdW5jdGlvbiAoIHYyLCBpMiApIHtcclxuICAgICAgICAgICAgICAgIGVhY2goIHZhcjEsIGZ1bmN0aW9uICggdjEsIGkxICkge1xyXG4gICAgICAgICAgICAgICAgICByZSA9IFQuaGFzKCB2YXIxW2kxXSwgdmFyMltpMl0gKTtcclxuICAgICAgICAgICAgICAgICAgaWYgKCByZSA9PT0gdHJ1ZSApe1xyXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBUQUZGWS5FWElUO1xyXG4gICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgICAgIGlmICggcmUgPT09IHRydWUgKXtcclxuICAgICAgICAgICAgICAgICAgcmV0dXJuIFRBRkZZLkVYSVQ7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgZWxzZSBpZiAoIFQuaXNTdHJpbmcoIHZhcjIgKSB8fCBULmlzTnVtYmVyKCB2YXIyICkgKXtcclxuICAgICAgICAgICAgIHJlID0gZmFsc2U7XHJcbiAgICAgICAgICAgICAgZm9yICggbiA9IDA7IG4gPCB2YXIxLmxlbmd0aDsgbisrICl7XHJcbiAgICAgICAgICAgICAgICByZSA9IFQuaGFzKCB2YXIxW25dLCB2YXIyICk7XHJcbiAgICAgICAgICAgICAgICBpZiAoIHJlICl7XHJcbiAgICAgICAgICAgICAgICAgIHJldHVybiB0cnVlO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICByZXR1cm4gcmU7XHJcbiAgICAgICAgICBjYXNlICdzdHJpbmcnOlxyXG4gICAgICAgICAgICBpZiAoIFQuaXNTdHJpbmcoIHZhcjIgKSAmJiB2YXIyID09PSB2YXIxICl7XHJcbiAgICAgICAgICAgICAgcmV0dXJuIHRydWU7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICBkZWZhdWx0OlxyXG4gICAgICAgICAgICBpZiAoIFQudHlwZU9mKCB2YXIxICkgPT09IFQudHlwZU9mKCB2YXIyICkgJiYgdmFyMSA9PT0gdmFyMiApe1xyXG4gICAgICAgICAgICAgIHJldHVybiB0cnVlO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG4gICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICB9O1xyXG5cclxuICAgIC8vICoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKipcclxuICAgIC8vICpcclxuICAgIC8vICogQ3JlYXRlIHB1YmxpYyB1dGlsaXR5IGhhc0FsbCBtZXRob2RcclxuICAgIC8vICogUmV0dXJucyB0cnVlIGlmIGEgY29tcGxleCBvYmplY3QsIGFycmF5XHJcbiAgICAvLyAqIG9yIHRhZmZ5IGNvbGxlY3Rpb24gY29udGFpbnMgdGhlIG1hdGVyaWFsXHJcbiAgICAvLyAqIHByb3ZpZGVkIGluIHRoZSBjYWxsIC0gZm9yIGFycmF5cyBpdCBtdXN0XHJcbiAgICAvLyAqIGNvbnRhaW4gYWxsIHRoZSBtYXRlcmlhbCBpbiBlYWNoIGFycmF5IGl0ZW1cclxuICAgIC8vICogUHVycG9zZTogVXNlZCB0byBjb21hcmUgb2JqZWN0c1xyXG4gICAgLy8gKlxyXG4gICAgLy8gKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKlxyXG4gICAgVEFGRlkuaGFzQWxsID0gZnVuY3Rpb24gKCB2YXIxLCB2YXIyICkge1xyXG5cclxuICAgICAgdmFyIFQgPSBUQUZGWSwgYXI7XHJcbiAgICAgIGlmICggVC5pc0FycmF5KCB2YXIyICkgKXtcclxuICAgICAgICBhciA9IHRydWU7XHJcbiAgICAgICAgZWFjaCggdmFyMiwgZnVuY3Rpb24gKCB2ICkge1xyXG4gICAgICAgICAgYXIgPSBULmhhcyggdmFyMSwgdiApO1xyXG4gICAgICAgICAgaWYgKCBhciA9PT0gZmFsc2UgKXtcclxuICAgICAgICAgICAgcmV0dXJuIFRBRkZZLkVYSVQ7XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgcmV0dXJuIGFyO1xyXG4gICAgICB9XHJcbiAgICAgIGVsc2Uge1xyXG4gICAgICAgIHJldHVybiBULmhhcyggdmFyMSwgdmFyMiApO1xyXG4gICAgICB9XHJcbiAgICB9O1xyXG5cclxuXHJcbiAgICAvLyAqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqXHJcbiAgICAvLyAqXHJcbiAgICAvLyAqIHR5cGVPZiBGaXhlZCBpbiBKYXZhU2NyaXB0IGFzIHB1YmxpYyB1dGlsaXR5XHJcbiAgICAvLyAqXHJcbiAgICAvLyAqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqXHJcbiAgICBUQUZGWS50eXBlT2YgPSBmdW5jdGlvbiAoIHYgKSB7XHJcbiAgICAgIHZhciBzID0gdHlwZW9mIHY7XHJcbiAgICAgIGlmICggcyA9PT0gJ29iamVjdCcgKXtcclxuICAgICAgICBpZiAoIHYgKXtcclxuICAgICAgICAgIGlmICggdHlwZW9mIHYubGVuZ3RoID09PSAnbnVtYmVyJyAmJlxyXG4gICAgICAgICAgICAhKHYucHJvcGVydHlJc0VudW1lcmFibGUoICdsZW5ndGgnICkpIClcclxuICAgICAgICAgIHtcclxuICAgICAgICAgICAgcyA9ICdhcnJheSc7XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgcyA9ICdudWxsJztcclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuICAgICAgcmV0dXJuIHM7XHJcbiAgICB9O1xyXG5cclxuICAgIC8vICoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKipcclxuICAgIC8vICpcclxuICAgIC8vICogQ3JlYXRlIHB1YmxpYyB1dGlsaXR5IGdldE9iamVjdEtleXMgbWV0aG9kXHJcbiAgICAvLyAqIFJldHVybnMgYW4gYXJyYXkgb2YgYW4gb2JqZWN0cyBrZXlzXHJcbiAgICAvLyAqIFB1cnBvc2U6IFVzZWQgdG8gZ2V0IHRoZSBrZXlzIGZvciBhbiBvYmplY3RcclxuICAgIC8vICpcclxuICAgIC8vICoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKiogICBcclxuICAgIFRBRkZZLmdldE9iamVjdEtleXMgPSBmdW5jdGlvbiAoIG9iICkge1xyXG4gICAgICB2YXIga0EgPSBbXTtcclxuICAgICAgZWFjaGluKCBvYiwgZnVuY3Rpb24gKCBuLCBoICkge1xyXG4gICAgICAgIGtBLnB1c2goIGggKTtcclxuICAgICAgfSk7XHJcbiAgICAgIGtBLnNvcnQoKTtcclxuICAgICAgcmV0dXJuIGtBO1xyXG4gICAgfTtcclxuXHJcbiAgICAvLyAqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqXHJcbiAgICAvLyAqXHJcbiAgICAvLyAqIENyZWF0ZSBwdWJsaWMgdXRpbGl0eSBpc1NhbWVBcnJheVxyXG4gICAgLy8gKiBSZXR1cm5zIGFuIGFycmF5IG9mIGFuIG9iamVjdHMga2V5c1xyXG4gICAgLy8gKiBQdXJwb3NlOiBVc2VkIHRvIGdldCB0aGUga2V5cyBmb3IgYW4gb2JqZWN0XHJcbiAgICAvLyAqXHJcbiAgICAvLyAqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqICAgXHJcbiAgICBUQUZGWS5pc1NhbWVBcnJheSA9IGZ1bmN0aW9uICggYXIxLCBhcjIgKSB7XHJcbiAgICAgIHJldHVybiAoVEFGRlkuaXNBcnJheSggYXIxICkgJiYgVEFGRlkuaXNBcnJheSggYXIyICkgJiZcclxuICAgICAgICBhcjEuam9pbiggJywnICkgPT09IGFyMi5qb2luKCAnLCcgKSkgPyB0cnVlIDogZmFsc2U7XHJcbiAgICB9O1xyXG5cclxuICAgIC8vICoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKipcclxuICAgIC8vICpcclxuICAgIC8vICogQ3JlYXRlIHB1YmxpYyB1dGlsaXR5IGlzU2FtZU9iamVjdCBtZXRob2RcclxuICAgIC8vICogUmV0dXJucyB0cnVlIGlmIG9iamVjdHMgY29udGFpbiB0aGUgc2FtZVxyXG4gICAgLy8gKiBtYXRlcmlhbCBvciBmYWxzZSBpZiB0aGV5IGRvIG5vdFxyXG4gICAgLy8gKiBQdXJwb3NlOiBVc2VkIHRvIGNvbWFyZSBvYmplY3RzXHJcbiAgICAvLyAqXHJcbiAgICAvLyAqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqICAgXHJcbiAgICBUQUZGWS5pc1NhbWVPYmplY3QgPSBmdW5jdGlvbiAoIG9iMSwgb2IyICkge1xyXG4gICAgICB2YXIgVCA9IFRBRkZZLCBydiA9IHRydWU7XHJcblxyXG4gICAgICBpZiAoIFQuaXNPYmplY3QoIG9iMSApICYmIFQuaXNPYmplY3QoIG9iMiApICl7XHJcbiAgICAgICAgaWYgKCBULmlzU2FtZUFycmF5KCBULmdldE9iamVjdEtleXMoIG9iMSApLFxyXG4gICAgICAgICAgVC5nZXRPYmplY3RLZXlzKCBvYjIgKSApIClcclxuICAgICAgICB7XHJcbiAgICAgICAgICBlYWNoaW4oIG9iMSwgZnVuY3Rpb24gKCB2LCBuICkge1xyXG4gICAgICAgICAgICBpZiAoICEgKCAoVC5pc09iamVjdCggb2IxW25dICkgJiYgVC5pc09iamVjdCggb2IyW25dICkgJiZcclxuICAgICAgICAgICAgICBULmlzU2FtZU9iamVjdCggb2IxW25dLCBvYjJbbl0gKSkgfHxcclxuICAgICAgICAgICAgICAoVC5pc0FycmF5KCBvYjFbbl0gKSAmJiBULmlzQXJyYXkoIG9iMltuXSApICYmXHJcbiAgICAgICAgICAgICAgICBULmlzU2FtZUFycmF5KCBvYjFbbl0sIG9iMltuXSApKSB8fCAob2IxW25dID09PSBvYjJbbl0pIClcclxuICAgICAgICAgICAgKSB7XHJcbiAgICAgICAgICAgICAgcnYgPSBmYWxzZTtcclxuICAgICAgICAgICAgICByZXR1cm4gVEFGRlkuRVhJVDtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgfSk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgcnYgPSBmYWxzZTtcclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuICAgICAgZWxzZSB7XHJcbiAgICAgICAgcnYgPSBmYWxzZTtcclxuICAgICAgfVxyXG4gICAgICByZXR1cm4gcnY7XHJcbiAgICB9O1xyXG5cclxuICAgIC8vICoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKipcclxuICAgIC8vICpcclxuICAgIC8vICogQ3JlYXRlIHB1YmxpYyB1dGlsaXR5IGlzW0RhdGFUeXBlXSBtZXRob2RzXHJcbiAgICAvLyAqIFJldHVybiB0cnVlIGlmIG9iaiBpcyBkYXRhdHlwZSwgZmFsc2Ugb3RoZXJ3aXNlXHJcbiAgICAvLyAqIFB1cnBvc2U6IFVzZWQgdG8gZGV0ZXJtaW5lIGlmIGFyZ3VtZW50cyBhcmUgb2YgY2VydGFpbiBkYXRhIHR5cGVcclxuICAgIC8vICpcclxuICAgIC8vICogbW1pa293c2tpIDIwMTItMDgtMDYgcmVmYWN0b3JlZCB0byBtYWtlIG11Y2ggbGVzcyBcIm1hZ2ljYWxcIjpcclxuICAgIC8vICogICBmZXdlciBjbG9zdXJlcyBhbmQgcGFzc2VzIGpzbGludFxyXG4gICAgLy8gKlxyXG4gICAgLy8gKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKlxyXG5cclxuICAgIHR5cGVMaXN0ID0gW1xyXG4gICAgICAnU3RyaW5nJywgICdOdW1iZXInLCAnT2JqZWN0JywgICAnQXJyYXknLFxyXG4gICAgICAnQm9vbGVhbicsICdOdWxsJywgICAnRnVuY3Rpb24nLCAnVW5kZWZpbmVkJ1xyXG4gICAgXTtcclxuICBcclxuICAgIG1ha2VUZXN0ID0gZnVuY3Rpb24gKCB0aGlzS2V5ICkge1xyXG4gICAgICByZXR1cm4gZnVuY3Rpb24gKCBkYXRhICkge1xyXG4gICAgICAgIHJldHVybiBUQUZGWS50eXBlT2YoIGRhdGEgKSA9PT0gdGhpc0tleS50b0xvd2VyQ2FzZSgpID8gdHJ1ZSA6IGZhbHNlO1xyXG4gICAgICB9O1xyXG4gICAgfTtcclxuICBcclxuICAgIGZvciAoIGlkeCA9IDA7IGlkeCA8IHR5cGVMaXN0Lmxlbmd0aDsgaWR4KysgKXtcclxuICAgICAgdHlwZUtleSA9IHR5cGVMaXN0W2lkeF07XHJcbiAgICAgIFRBRkZZWydpcycgKyB0eXBlS2V5XSA9IG1ha2VUZXN0KCB0eXBlS2V5ICk7XHJcbiAgICB9XHJcbiAgfVxyXG59KCkpO1xyXG5cclxuaWYgKCB0eXBlb2YoZXhwb3J0cykgPT09ICdvYmplY3QnICl7XHJcbiAgZXhwb3J0cy50YWZmeSA9IFRBRkZZO1xyXG59XHJcblxyXG4iLCIvKlxuICogYXVkaW8uanNcbiAqIFdlYiBBdWRpbyBBUEkgbWV0aG9kc1xuKi9cbi8qIGdsb2JhbCAkLCB3aW5kb3csIEF1ZGlvQ29udGV4dCwgWE1MSHR0cFJlcXVlc3QsIEF1ZGlvKi9cbid1c2Ugc3RyaWN0JztcblxudmFyIGF1ZGlvID0gKGZ1bmN0aW9uICgpIHtcblxuICAgIC8vLS0tLS0tLS0tLS0tLS0tLSBCRUdJTiBNT0RVTEUgREVQRU5ERU5DSUVTIC0tLS0tLS0tLS0tLS0tXG4gICAgdmFyIHV0aWwgPSByZXF1aXJlKCcuL3V0aWwuanMnKSxcbiAgICAgICAgc291bmRNYW5hZ2VyID0gcmVxdWlyZSgnLi4vbGliL3NvdW5kbWFuYWdlcjIvc2NyaXB0L3NvdW5kbWFuYWdlcjIuanMnKS5zb3VuZE1hbmFnZXI7XG5cbiAgICAvLy0tLS0tLS0tLS0tLS0tLS0gRU5EIE1PRFVMRSBERVBFTkRFTkNJRVMgLS0tLS0tLS0tLS0tLS1cblxuICAgIC8vLS0tLS0tLS0tLS0tLS0tLSBCRUdJTiBNT0RVTEUgU0NPUEUgVkFSSUFCTEVTIC0tLS0tLS0tLS0tLS0tXG4gICAgdmFyXG5cbiAgICBjb25maWdNYXAgPSB7XG4gICAgICAgIHByb2dyZXNzX2h0bWwgOiBTdHJpbmcoKSArXG4gICAgICAgICAgICAnPGRpdiBjbGFzcz1cInByb2dyZXNzXCI+JyArXG4gICAgICAgICAgICAgICAgJzxkaXYgY2xhc3M9XCJwcm9ncmVzcy1iYXJcIiByb2xlPVwicHJvZ3Jlc3NiYXJcIiBhcmlhLXZhbHVlbm93PVwiMTAwXCIgYXJpYS12YWx1ZW1pbj1cIjBcIiBhcmlhLXZhbHVlbWF4PVwiMTAwXCIgc3R5bGU9XCJ3aWR0aDogMCU7XCI+JyArXG4gICAgICAgICAgICAgICAgICAgICc8c3BhbiBjbGFzcz1cInNyLW9ubHlcIj42MCUgQ29tcGxldGU8L3NwYW4+JyArXG4gICAgICAgICAgICAgICAgJzwvZGl2PicgK1xuICAgICAgICAgICAgJzwvZGl2PicsXG5cbiAgICAgICAgaXNTdXBwb3J0ZWQ6IHVuZGVmaW5lZFxuICAgIH0sXG5cbiAgICBzdGF0ZU1hcCA9IHtcbiAgICAgICAgc291cmNlOiB1bmRlZmluZWQsXG4gICAgICAgIGNvbnRleHQ6IHVuZGVmaW5lZCxcbiAgICAgICAgYXVkaW86IHVuZGVmaW5lZCxcbiAgICAgICAgaXNQbGF5aW5nOiBmYWxzZSxcblxuICAgICAgICB1cmw6IHVuZGVmaW5lZCxcbiAgICAgICAgcGVyY2VudFBsYXllZDogdW5kZWZpbmVkXG4gICAgfSxcblxuICAgIGpxdWVyeU1hcCA9IHt9LFxuICAgIHNldEpxdWVyeU1hcCxcblxuICAgIGluaXRNb2R1bGUsXG5cbiAgICBvbkNhdGVnb3J5Q2hhbmdlLFxuICAgIG9uQ2xpY2tQbGF5ZXIsXG4gICAgbWFrZVNvdW5kLFxuICAgIHRvZ2dsZVBsYXllcixcblxuICAgIFB1YlN1YiA9IHV0aWwuUHViU3ViO1xuXG4gICAgLy8tLS0tLS0tLS0tLS0tLS0tIEVORCBNT0RVTEUgU0NPUEUgVkFSSUFCTEVTIC0tLS0tLS0tLS0tLS0tXG5cbiAgIC8vLS0tLS0tLS0tLS0tLS0tLS0tLS0tIEJFR0lOIE1PRFVMRSBTQ09QRSBNRVRIT0RTIC0tLS0tLS0tLS0tLS0tLS0tLS0tXG5cbiAgICBzZXRKcXVlcnlNYXAgPSBmdW5jdGlvbigkcHJvZ3Jlc3MsICRkZXNjcmlwdGlvbil7XG4gICAgICAgIGpxdWVyeU1hcC4kcHJvZ3Jlc3MgID0gJHByb2dyZXNzO1xuICAgICAgICBqcXVlcnlNYXAuJGRlc2NyaXB0aW9uICA9ICRkZXNjcmlwdGlvbjtcbiAgICAgICAganF1ZXJ5TWFwLiRwcm9ncmVzc19iYXIgPSBqcXVlcnlNYXAuJHByb2dyZXNzLmZpbmQoJy5wcm9ncmVzcy1iYXInKTtcbiAgICB9O1xuXG4gICAgdG9nZ2xlUGxheWVyID0gZnVuY3Rpb24oKXtcbiAgICAgICAgaWYoc3RhdGVNYXAuYXVkaW8ucGF1c2VkKXtcbiAgICAgICAgICAgIC8vY29uc29sZS5sb2coXCJQYXVzZWQ7IFJlc3VtZSBwbGF5OiAlc1wiLCBzdGF0ZU1hcC51cmwpO1xuICAgICAgICAgICAgc3RhdGVNYXAuYXVkaW8ucmVzdW1lKCk7XG5cbiAgICAgICAgfWVsc2UgaWYoc3RhdGVNYXAuYXVkaW8ucGxheVN0YXRlID09PSAwKXsgLy9zdG9wcGVkIG9yIHVuaW5pdGlhbGl6ZWRcbiAgICAgICAgICAgIC8vY29uc29sZS5sb2coXCJTdG9wcGVkOyBTdGFydCBwbGF5OiAlc1wiLCBzdGF0ZU1hcC51cmwpO1xuICAgICAgICAgICAgc3RhdGVNYXAuYXVkaW8ucGxheSgpO1xuICAgICAgICB9ZWxzZSBpZihzdGF0ZU1hcC5hdWRpby5wbGF5U3RhdGUgPT09IDEpeyAvL3BsYXlpbmcgb3IgYnVmZmVyaW5nXG4gICAgICAgICAgICAvL2NvbnNvbGUubG9nKFwiUGxheWluZzsgUGF1c2UgOiAlc1wiLCBzdGF0ZU1hcC51cmwpO1xuICAgICAgICAgICAgc3RhdGVNYXAuYXVkaW8ucGF1c2UoKTtcbiAgICAgICAgfVxuICAgIH07XG5cbiAgICAvLyBCZWdpbiBwcml2YXRlIG1ldGhvZCAvb25DYXRlZ29yeUNoYW5nZS9cbiAgICAvLyBFeGFtcGxlICAgOiBvbkNhdGVnb3J5Q2hhbmdlO1xuICAgIC8vIFB1cnBvc2UgICA6XG4gICAgLy8gICBQdWJTdWIgY2FsbGJhY2sgZm9yIGNoYW5nZXMgaW4gdGhlIGNhdGVnb3J5IFVJXG4gICAgLy8gQXJndW1lbnRzIDpcbiAgICAvLyAgKiB1cmxzIC0gYXJyYXkgb2YgdXJscyBmb3IgQ2xpcCBvYmplY3RzIGN1cnJlbnRseSBkaXNwbGF5ZWRcbiAgICAvLyBBY3Rpb24gICAgOiBmb3IgZWFjaCB1cmwsIHVwZGF0ZSB0aGUgZ2l2ZW4gcHJvZ3Jlc3MgYmFyLiBGaW5kIHRoZSBcImN1cnJlbnRcIiBzb3VuZCBvYmplY3RcbiAgICAvLyAgYW5kIHJlYXNzaWduIHRoZSBqcXVlcnlNYXAgdG8gcmVmbGVjdCB0aGUgdXBkYXRlZCAvIG5ldyBET00gZWxlbWVudFxuICAgIC8vIFJldHVybnMgICA6IG5vbmVcbiAgICAvLyBUaHJvd3MgICAgOiBub25lXG4gICAgb25DYXRlZ29yeUNoYW5nZSA9IGZ1bmN0aW9uKHVybHMpe1xuXG4gICAgICAgIHVybHMuZm9yRWFjaChmdW5jdGlvbih1cmwpe1xuICAgICAgICAgICAgdmFyIG11cmwsXG4gICAgICAgICAgICAgICAgJHBsYXllcixcbiAgICAgICAgICAgICAgICAkZGVzY3JpcHRpb24sXG4gICAgICAgICAgICAgICAgJHByb2dyZXNzLFxuICAgICAgICAgICAgICAgICRwcm9ncmVzc19iYXIsXG4gICAgICAgICAgICAgICAgcHBsYXllZCxcbiAgICAgICAgICAgICAgICBzb3VuZDtcblxuICAgICAgICAgICAgLy90YWNrIG9uIHRoZSBtZWRpYSB0YWdcbiAgICAgICAgICAgIG11cmwgPSAnL21lZGlhLycgKyB1cmw7XG4gICAgICAgICAgICAvL2dldCB0aGUgc3Bhbi5tZWRpYS11cmxcbiAgICAgICAgICAgICRwbGF5ZXIgPSAkKCcubWVkaWEuY2xpcCcpLmZpbmQoXCJbZGF0YS1jbGlwLXVybD0nXCIgKyBtdXJsICsgXCInXVwiKTtcbiAgICAgICAgICAgIC8vZ2V0IHRoZSBzb3VuZCBhbmQgY2hlY2sgaWYgaXQgd2FzIGNyZWF0ZWRcbiAgICAgICAgICAgIHNvdW5kID0gc291bmRNYW5hZ2VyLmdldFNvdW5kQnlJZChtdXJsKTtcbiAgICAgICAgICAgIGlmKHNvdW5kKXtcblxuICAgICAgICAgICAgICAgIC8vaW5qZWN0IHRoZSBwcm9ncmVzcyBiYXIgYW5kIHVwZGF0ZSB0aGUgc3RhdGVcbiAgICAgICAgICAgICAgICAkcHJvZ3Jlc3MgPSAkcGxheWVyLmZpbmQoJy5tZWRpYS1wcm9ncmVzcycpO1xuICAgICAgICAgICAgICAgICRkZXNjcmlwdGlvbiA9ICRwbGF5ZXIuZmluZCgnLm1lZGlhLWRlc2NyaXB0aW9uJyk7XG4gICAgICAgICAgICAgICAgJHByb2dyZXNzLmh0bWwoY29uZmlnTWFwLnByb2dyZXNzX2h0bWwpO1xuICAgICAgICAgICAgICAgICRwcm9ncmVzc19iYXIgPSAkcGxheWVyLmZpbmQoJy5tZWRpYS1wcm9ncmVzcyAucHJvZ3Jlc3MtYmFyJyk7XG5cbiAgICAgICAgICAgICAgICAvL2lmIGl0IHdhcyBzdG9wcGVkIHRoZW4gc2V0IGl0IHRvIDEwMCVcbiAgICAgICAgICAgICAgICBpZihzb3VuZC5wbGF5U3RhdGUgPT09IDApe1xuICAgICAgICAgICAgICAgICAgICBwcGxheWVkID0gJzEwMCc7XG4gICAgICAgICAgICAgICAgfWVsc2V7XG4gICAgICAgICAgICAgICAgICAgIHBwbGF5ZWQgPSAoc291bmQucG9zaXRpb24gLyBzb3VuZC5kdXJhdGlvbkVzdGltYXRlICogMTAwKS50b0ZpeGVkKDEpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAkcHJvZ3Jlc3NfYmFyLndpZHRoKHBwbGF5ZWQgKyAnJScpO1xuXG4gICAgICAgICAgICAgICAgLy8gaWYgdGhlIHNvdW5kID09PSBzdGF0ZU1hcC5hdWRpbyB0aGVuIHJlYXNzaWduIHRoZSBqUXVlcnkgbWFwXG4gICAgICAgICAgICAgICAgaWYoc3RhdGVNYXAuYXVkaW8uaWQgPT09IG11cmwpe1xuICAgICAgICAgICAgICAgICAgICBzZXRKcXVlcnlNYXAoJHByb2dyZXNzLCAkZGVzY3JpcHRpb24pO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgfTtcblxuICAgIC8vIEJlZ2luIHByaXZhdGUgbWV0aG9kIC9pbml0TW9kdWxlL1xuICAgIC8vIEV4YW1wbGUgICA6IGluaXRNb2R1bGUoKTtcbiAgICAvLyBQdXJwb3NlICAgOlxuICAgIC8vICAgU2V0cyB1cCB0aGUgQXVkaW8gQVBJIGNvbnRleHQgb3IgcmVwb3J0cyBlcnJvcnNcbiAgICAvLyBBcmd1bWVudHMgOiBub25lXG4gICAgLy8gQWN0aW9uICAgIDogc2VhcmNoZXMgYW5kIGFkZHMgdGhlIGNvcnJlY3QgQXVkaW9Db250ZXh0IG9iamVjdCB0byB0aGUgZ2xvYmFsIHdpbmRvd1xuICAgIC8vIFJldHVybnMgICA6IG5vbmVcbiAgICAvLyBUaHJvd3MgICAgOiBub25lXG4gICAgaW5pdE1vZHVsZSA9IGZ1bmN0aW9uKCl7XG4gICAgICAgIHNvdW5kTWFuYWdlci5zZXR1cCh7XG4gICAgICAgICAgICBkZWJ1Z01vZGU6IHRydWUsXG4gICAgICAgICAgICBjb25zb2xlT25seTogdHJ1ZSxcbiAgICAgICAgICAgIGh0bWw1UG9sbGluZ0ludGVydmFsOiA1MCwgLy8gaW5jcmVhc2VkIGZyYW1lcmF0ZSBmb3Igd2hpbGVwbGF5aW5nKCkgZXRjLlxuICAgICAgICAgICAgZmxhc2hWZXJzaW9uOiA5LFxuICAgICAgICAgICAgdXNlSGlnaFBlcmZvcm1hbmNlOiB0cnVlLFxuICAgICAgICAgICAgdXJsOiAnaHR0cDovL3d3dy5oaWRpbmctbXktZmlsZS9Tb3VuZG1hbmFnZXIyRmlsZXMvc291bmRtYW5hZ2VyMl9mbGFzaDkuc3dmLycsXG4gICAgICAgICAgICBvbnJlYWR5OiBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgICBjb25maWdNYXAuaXNTdXBwb3J0ZWQgPSBzb3VuZE1hbmFnZXIub2soKTtcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBvbnRpbWVvdXQ6IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKFwiU291bmRNYW5hZ2VyIGZhaWxlZCB0byBsb2FkXCIpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcblxuICAgICAgICBQdWJTdWIub24oXCJzaGVsbGFjLWNhdGVnb3J5Y2hhbmdlXCIsIG9uQ2F0ZWdvcnlDaGFuZ2UgKTtcbiAgICB9O1xuXG4gICAgLy8gQmVnaW4gcHJpdmF0ZSBtZXRob2QgL21ha2VTb3VuZC9cbiAgICAvLyBFeGFtcGxlICAgOiBtYWtlU291bmQoICk7XG4gICAgLy8gUHVycG9zZSAgIDpcbiAgICAvLyAgIFNldHMgdXAgdGhlIEF1ZGlvIEFQSSBjb250ZXh0IG9yIHJlcG9ydHMgZXJyb3JzXG4gICAgLy8gQXJndW1lbnRzIDogbm9uZVxuICAgIC8vIEFjdGlvbiAgICA6IHNlYXJjaGVzIGFuZCBhZGRzIHRoZSBjb3JyZWN0IEF1ZGlvQ29udGV4dCBvYmplY3QgdG8gdGhlIGdsb2JhbCB3aW5kb3dcbiAgICAvLyBSZXR1cm5zICAgOiBub25lXG4gICAgLy8gVGhyb3dzICAgIDogbm9uZVxuICAgIG1ha2VTb3VuZCA9IGZ1bmN0aW9uKHVybCwgYXV0b1BsYXkpe1xuICAgICAgICB2YXIgc291bmQ7XG4gICAgICAgIHNvdW5kID0gc291bmRNYW5hZ2VyLmNyZWF0ZVNvdW5kKHtcbiAgICAgICAgICAgIGlkOiB1cmwsXG4gICAgICAgICAgICB1cmw6IHVybCxcbiAgICAgICAgICAgIGF1dG9QbGF5OiBhdXRvUGxheSxcbiAgICAgICAgICAgIHdoaWxlbG9hZGluZzogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgIC8vc291bmRNYW5hZ2VyLl93cml0ZURlYnVnKCdMT0FEIFBST0dSRVNTICcgKyB0aGlzLmJ5dGVzTG9hZGVkICsgJyAvICcgKyB0aGlzLmJ5dGVzVG90YWwpO1xuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIHdoaWxlcGxheWluZzogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgIHZhciBwZXJjZW50UGxheWVkID0gKHRoaXMucG9zaXRpb24gLyB0aGlzLmR1cmF0aW9uRXN0aW1hdGUgKiAxMDApLnRvRml4ZWQoMSk7XG5cbiAgICAgICAgICAgICAgICBpZiAocGVyY2VudFBsYXllZCAhPT0gc3RhdGVNYXAucGVyY2VudFBsYXllZCkge1xuICAgICAgICAgICAgICAgICAgICBzdGF0ZU1hcC5wZXJjZW50UGxheWVkID0gcGVyY2VudFBsYXllZDtcbiAgICAgICAgICAgICAgICAgICAganF1ZXJ5TWFwLiRwcm9ncmVzc19iYXIud2lkdGgocGVyY2VudFBsYXllZCArICclJyk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIG9ubG9hZDogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgIC8vaW5qZWN0IHRoZSBwbGF5IHByb2dyZXNzIGJhciBhbmQgc2V0IGpxdWVyeU1hcCBhdHRyaWJ1dGVcbiAgICAgICAgICAgICAgICBqcXVlcnlNYXAuJHByb2dyZXNzLmh0bWwoY29uZmlnTWFwLnByb2dyZXNzX2h0bWwpO1xuICAgICAgICAgICAgICAgIGpxdWVyeU1hcC4kcHJvZ3Jlc3NfYmFyID0ganF1ZXJ5TWFwLiRwcm9ncmVzcy5maW5kKCcucHJvZ3Jlc3MtYmFyJyk7XG5cbiAgICAgICAgICAgICAgICAvL2luaXRpYWxpemUgdGhlIHBlcmNlbnRQbGF5ZWRcbiAgICAgICAgICAgICAgICBzdGF0ZU1hcC5wZXJjZW50UGxheWVkID0gKHRoaXMucG9zaXRpb24gLyB0aGlzLmR1cmF0aW9uRXN0aW1hdGUgKiAxMDApLnRvRml4ZWQoMSk7XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgb25wbGF5OiBmdW5jdGlvbigpe1xuICAgICAgICAgICAgICAgIGpxdWVyeU1hcC4kZGVzY3JpcHRpb24udG9nZ2xlQ2xhc3MoXCJwbGF5aW5nXCIpO1xuICAgICAgICAgICAgICAgIGpxdWVyeU1hcC4kZGVzY3JpcHRpb24udG9nZ2xlQ2xhc3MoXCJwbGF5ZWRcIik7XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgb25wYXVzZTogZnVuY3Rpb24oKXtcbiAgICAgICAgICAgICAgICBqcXVlcnlNYXAuJGRlc2NyaXB0aW9uLnRvZ2dsZUNsYXNzKFwicGxheWluZ1wiKTtcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBvbnJlc3VtZTogZnVuY3Rpb24oKXtcbiAgICAgICAgICAgICAgICBqcXVlcnlNYXAuJGRlc2NyaXB0aW9uLnRvZ2dsZUNsYXNzKFwicGxheWluZ1wiKTtcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBvbnN0b3A6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICBqcXVlcnlNYXAuJGRlc2NyaXB0aW9uLnRvZ2dsZUNsYXNzKFwicGxheWluZ1wiKTtcbiAgICAgICAgICAgICAgICAvL3NvdW5kTWFuYWdlci5fd3JpdGVEZWJ1ZygnVGhlIHNvdW5kICcgKyB0aGlzLmlkICsgJyBzdG9wcGVkLicpO1xuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIG9uZmluaXNoOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAganF1ZXJ5TWFwLiRkZXNjcmlwdGlvbi50b2dnbGVDbGFzcyhcInBsYXlpbmdcIik7XG4gICAgICAgICAgICAgICAgLy9zb3VuZE1hbmFnZXIuX3dyaXRlRGVidWcoJ1RoZSBzb3VuZCAnICsgdGhpcy5pZCArICcgZmluaXNoZWQgcGxheWluZy4nKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG5cbiAgICAgICAgcmV0dXJuIHNvdW5kO1xuXG4gICAgfTtcblxuICAgIC8vLS0tLS0tLS0tLS0tLS0tLS0tLS0tIEVORCBNT0RVTEUgU0NPUEUgTUVUSE9EUyAtLS0tLS0tLS0tLS0tLS0tLS0tLVxuXG4gICAgLy8tLS0tLS0tLS0tLS0tLS0tLS0tIEJFR0lOIFBVQkxJQyBNRVRIT0RTIC0tLS0tLS0tLS0tLS0tLS0tLS1cbiAgICBvbkNsaWNrUGxheWVyID0gZnVuY3Rpb24odXJsLCAkcHJvZ3Jlc3MsICRkZXNjcmlwdGlvbil7XG5cbiAgICAgICAgY29uc29sZS5sb2codXJsKTtcbiAgICAgICAgY29uc29sZS5sb2coJHByb2dyZXNzKTtcblxuICAgICAgICAvLyAqKiogQ0FTRSAwXG4gICAgICAgIC8vIFN0YXRlOiBDbGlwIHNlbGVjdGVkIGRvZXMgd2FzIG5vdCBjcmVhdGVkIHlldFxuICAgICAgICAvLyBBY3Rpb246IENyZWF0ZSB0aGUgY2xpcFxuICAgICAgICBpZighc291bmRNYW5hZ2VyLmdldFNvdW5kQnlJZCh1cmwpKSB7XG5cbiAgICAgICAgICAgIC8vIENhc2UgMC5hOiBObyBjbGlwIGlzIGN1cnJlbnRseSBwbGF5aW5nXG4gICAgICAgICAgICAgICAgLy8gZG8gbm90aGluZ1xuICAgICAgICAgICAgLy8gQ2FzZSAwLmI6IEFub3RoZXIgQ2xpcCBleGlzdHMgYW5kIGlzIHN0aWxsIHBsYXlpbmcgLyBidWZmZXJpbmdcbiAgICAgICAgICAgIGlmIChzdGF0ZU1hcC5hdWRpbyAmJiBzdGF0ZU1hcC5hdWRpby5wbGF5U3RhdGUgPT09IDEpe1xuICAgICAgICAgICAgICAgIC8vcGF1c2UgdGhlIHByZXZpb3VzIGNsaXBcbiAgICAgICAgICAgICAgICBzdGF0ZU1hcC5hdWRpby5wYXVzZSgpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBzdGF0ZU1hcC51cmwgPSB1cmw7XG4gICAgICAgICAgICBzZXRKcXVlcnlNYXAoJHByb2dyZXNzLCAkZGVzY3JpcHRpb24pO1xuXG4gICAgICAgICAgICAvL0NyZWF0ZSB0aGUgc291bmQsIGFzc2lnbiBpdCB0byBzdGF0ZU1hcCwgYW5kIGF1dG9wbGF5XG4gICAgICAgICAgICBzdGF0ZU1hcC5hdWRpbyA9IG1ha2VTb3VuZChzdGF0ZU1hcC51cmwsIHRydWUpO1xuICAgICAgICB9IGVsc2Uge1xuXG4gICAgICAgICAgICAvLyAqKiogQ2FzZSAxXG4gICAgICAgICAgICAvLyBTdGF0ZTogQ2xpcCBzZWxlY3RlZCBpbmRlZWQgZXhpc3RzOyBzdGF0ZU1hcC5hdWRpbyB0aGVuIG11c3QgZXhpc3RcbiAgICAgICAgICAgIC8vIEFjdGlvbjogQ2hlY2sgaWYgaXQgaXMgdGhlIHNhbWUgY2xpcCBmcm9tIGJlZm9yZVxuICAgICAgICAgICAgdmFyIHNvdW5kID0gc291bmRNYW5hZ2VyLmdldFNvdW5kQnlJZCh1cmwpO1xuXG4gICAgICAgICAgICAvLyBDYXNlIDFhOiB0aGlzIGlzIHRoZSBzYW1lIGNsaXBcbiAgICAgICAgICAgIC8vIEluIHRoaXMgY2FzZSBhdWRpbywgdXJsLCBhbmQgJHBsYXllciBhcmUgaWRlbnRpY2FsIHNvIHNpbXBseSB0b2dnbGUgdGhlIHBsYXlpbmcgc3RhdGVcbiAgICAgICAgICAgIGlmKHN0YXRlTWFwLmF1ZGlvLmlkICE9PSBzb3VuZC5pZCl7XG4gICAgICAgICAgICAgICAgLy8gQ2FzZSAxYjogdGhpcyBpcyBhIGRpZmZlcmVudCBjbGlwXG4gICAgICAgICAgICAgICAgLy8gUGF1c2UgcHJldmlvdXNseSBwbGF5aW5nIGNsaXBcbiAgICAgICAgICAgICAgICBzdGF0ZU1hcC5hdWRpby5wYXVzZSgpO1xuXG4gICAgICAgICAgICAgICAgLy91cGRhdGUgdGhlIHN0YXRlTWFwIHRvIHJlZmxlY3QgdGhlIG5ldyBvYmplY3RcbiAgICAgICAgICAgICAgICBzdGF0ZU1hcC5hdWRpbyA9IHNvdW5kO1xuICAgICAgICAgICAgICAgIHN0YXRlTWFwLnVybCA9IHNvdW5kLmlkO1xuICAgICAgICAgICAgICAgIHNldEpxdWVyeU1hcCgkcHJvZ3Jlc3MsICRkZXNjcmlwdGlvbik7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHRvZ2dsZVBsYXllcigpO1xuICAgICAgICB9XG4gICAgfTtcbiAgICAvLy0tLS0tLS0tLS0tLS0tLS0tLS0gRU5EIFBVQkxJQyBNRVRIT0RTIC0tLS0tLS0tLS0tLS0tLS0tLS1cblxuICAgIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKCdsb2FkJywgaW5pdE1vZHVsZSwgZmFsc2UpO1xuXG4gICAgcmV0dXJuIHtcbiAgICAgICAgb25DbGlja1BsYXllcjogb25DbGlja1BsYXllclxuICAgIH07XG59KCkpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGF1ZGlvO1xuXG4iLCIvKlxuICogbWFpbi5qc1xuICogRW50cnkgcG9pbnQgZm9yIHNoZWxsYWMgYXBwXG4qL1xuLyogZ2xvYmFsICQsIGRvY3VtZW50LCBTVEFUSUNfVVJMLCBNRURJQV9VUkwgKi9cbid1c2Ugc3RyaWN0JztcbiQoIGRvY3VtZW50ICkucmVhZHkoZnVuY3Rpb24oKSB7XG4gICAgdmFyIHNoZWxsYWMgPSByZXF1aXJlKCcuL3NoZWxsYWMuanMnKTtcbiAgICBzaGVsbGFjLmluaXRNb2R1bGUoJChcIiNzaGVsbGFjLWFwcFwiKSwgU1RBVElDX1VSTCwgTUVESUFfVVJMLCB1c2VybmFtZSk7XG59KTtcblxuIiwiLypcbiAqIHNoZWxsYWMuanNcbiAqIFJvb3QgbmFtZXNwYWNlIG1vZHVsZVxuKi9cbi8qIGdsb2JhbCAkLCB3aW5kb3csIEF1ZGlvQ29udGV4dCwgWE1MSHR0cFJlcXVlc3QgKi9cbid1c2Ugc3RyaWN0JztcblxudmFyIHNoZWxsYWMgPSAoZnVuY3Rpb24gKCkge1xuXG4gICAgLy8tLS0tLS0tLS0tLS0tLS0tIEJFR0lOIE1PRFVMRSBERVBFTkRFTkNJRVMgLS0tLS0tLS0tLS0tLS1cbiAgICB2YXIgbW9tZW50ID0gcmVxdWlyZSgnbW9tZW50JyksXG4gICAgICAgIFRBRkZZID0gcmVxdWlyZSgndGFmZnlkYicpLnRhZmZ5LFxuICAgICAgICBhdWRpbyA9IHJlcXVpcmUoJy4vYXVkaW8uanMnKSxcbiAgICAgICAgdXRpbCA9IHJlcXVpcmUoJy4vdXRpbC5qcycpO1xuXG4gICAgLy8tLS0tLS0tLS0tLS0tLS0tIEVORCBNT0RVTEUgREVQRU5ERU5DSUVTIC0tLS0tLS0tLS0tLS0tXG5cbiAgICAvLy0tLS0tLS0tLS0tLS0tLS0gQkVHSU4gTU9EVUxFIFNDT1BFIFZBUklBQkxFUyAtLS0tLS0tLS0tLS0tLVxuICAgIHZhclxuICAgIGluaXRNb2R1bGUsXG5cbiAgICBjb25maWdNYXAgPSB7XG4gICAgICAgIG1haW5faHRtbDogU3RyaW5nKCkgK1xuICAgICAgICAgICAgJzxkaXYgY2xhc3M9XCJzaGVsbGFjLWFwcC1jb250YWluZXJcIj4nICtcblxuICAgICAgICAgICAgICAgICc8ZGl2IGNsYXNzPVwiY29sLXNtLTMgY29sLW1kLTIgc2hlbGxhYy1hcHAgc2lkZWJhclwiPicgK1xuICAgICAgICAgICAgICAgICAgICAnPGRpdiBjbGFzcz1cInBhbmVsLWdyb3VwXCIgaWQ9XCJhY2NvcmRpb25cIj4nICtcbiAgICAgICAgICAgICAgICAgICAgICAgICc8cCBjbGFzcz1cInRleHQtcmlnaHRcIj48YSBocmVmPVwiI1wiIGlkPVwibmF2LWNsb3NlXCI+WDwvYT48L3A+JyArXG4gICAgICAgICAgICAgICAgICAgICAgICAnPGRpdiBjbGFzcz1cInBhbmVsIHBhbmVsLWRlZmF1bHRcIj4nICtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAnPGRpdiBjbGFzcz1cInBhbmVsLWhlYWRpbmdcIj4nICtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJzxhIGRhdGEtdG9nZ2xlPVwiY29sbGFwc2VcIiBkYXRhLXBhcmVudD1cIiNhY2NvcmRpb25cIiBocmVmPVwiI2NvbGxhcHNlQ2F0ZWdvcmllc1wiPicgK1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJ0NhdGVnb3JpZXMnICtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJzwvYT4nICtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAnPC9kaXY+JyArXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgJzxkaXYgaWQ9XCJjb2xsYXBzZUNhdGVnb3JpZXNcIiBjbGFzcz1cInBhbmVsLWNvbGxhcHNlIGNvbGxhcHNlXCI+JyArXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICc8ZGl2IGNsYXNzPVwicGFuZWwtYm9keVwiPicgK1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJzxkaXYgY2xhc3M9XCJzaGVsbGFjLWFwcCBuYXYgbmF2LXNpZGViYXIgbGlzdC1ncm91cFwiPjwvZGl2PicgK1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAnPC9kaXY+JyArXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgJzwvZGl2PicgK1xuICAgICAgICAgICAgICAgICAgICAgICAgJzwvZGl2PicgK1xuICAgICAgICAgICAgICAgICAgICAgICAgJzxkaXYgY2xhc3M9XCJwYW5lbCBwYW5lbC1kZWZhdWx0XCI+JyArXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgJzxkaXYgY2xhc3M9XCJwYW5lbC1oZWFkaW5nXCI+JyArXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICc8YSBkYXRhLXRvZ2dsZT1cImNvbGxhcHNlXCIgZGF0YS1wYXJlbnQ9XCIjYWNjb3JkaW9uXCIgaHJlZj1cIiNjb2xsYXBzZVBlb3BsZVwiPicgK1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJ1Blb3BsZScgK1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAnPC9hPicgK1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICc8L2Rpdj4nICtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAnPGRpdiBpZD1cImNvbGxhcHNlUGVvcGxlXCIgY2xhc3M9XCJwYW5lbC1jb2xsYXBzZSBjb2xsYXBzZVwiPicgK1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAnPGRpdiBjbGFzcz1cInBhbmVsLWJvZHlcIj4nICtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICcvL1BlcnNvbiBMaXN0IFRPRE8nICtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJzwvZGl2PicgK1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICc8L2Rpdj4nICtcbiAgICAgICAgICAgICAgICAgICAgICAgICc8L2Rpdj4nICtcbiAgICAgICAgICAgICAgICAgICAgJzwvZGl2PicgK1xuICAgICAgICAgICAgICAgICc8L2Rpdj4nICtcblxuICAgICAgICAgICAgICAgICc8ZGl2IGNsYXNzPVwic2hlbGxhYy1hcHAgY2xpcCBjb250ZW50XCI+PC9kaXY+JyArXG4gICAgICAgICAgICAnPC9kaXY+JyxcblxuXG4gICAgICAgIG9mZmNhbnZhc19odG1sOiBTdHJpbmcoKSArXG4gICAgICAgICAgICAnPGRpdiBjbGFzcz1cIm5hdmJhci1oZWFkZXIgcHVsbC1yaWdodFwiPicgK1xuICAgICAgICAgICAgICAgICc8YSBpZD1cIm5hdi1leHBhbmRlclwiIGNsYXNzPVwibmF2LWV4cGFuZGVyIGZpeGVkXCI+JyArXG4gICAgICAgICAgICAgICAgJ01FTlUgJm5ic3A7PGkgY2xhc3M9XCJmYSBmYS1iYXJzIGZhLWxnIHdoaXRlXCI+PC9pPicgK1xuICAgICAgICAgICAgICAgICc8L2E+JyArXG4gICAgICAgICAgICAnPC9kaXY+JyxcblxuICAgICAgICB0cnVuY2F0ZW1heDogMjVcbiAgICB9LFxuXG4gICAgc3RhdGVNYXAgPSB7XG4gICAgICAgICRjb250YWluZXI6IHVuZGVmaW5lZCxcbiAgICAgICAgdXNlcm5hbWU6IHVuZGVmaW5lZCxcblxuICAgICAgICBTVEFUSUNfVVJMOiB1bmRlZmluZWQsXG4gICAgICAgIE1FRElBX1VSTDogdW5kZWZpbmVkLFxuXG4gICAgICAgIGNhdGVnb3JpZXM6IHVuZGVmaW5lZCxcbiAgICAgICAgY2F0ZWdvcnlfZGI6IFRBRkZZKCksXG5cbiAgICAgICAgY2xpcHM6IHVuZGVmaW5lZCxcbiAgICAgICAgY2xpcF9kYjogVEFGRlkoKSxcblxuICAgICAgICBpc1BsYXlpbmc6IGZhbHNlXG4gICAgfSxcblxuICAgIGpxdWVyeU1hcCA9IHt9LFxuICAgIHNldEpxdWVyeU1hcCxcblxuICAgIHVybFBhcnNlLFxuXG4gICAgcGFyc2VDYXRlZ29yeURhdGEsIHJlbmRlckNhdGVnb3JpZXMsIGRpc3BsYXlfY2F0ZWdvcmllcyxcbiAgICBwYXJzZUNsaXBEYXRhLCBsb2FkQ2xpcHMsIGRpc3BsYXlfY2xpcHMsXG5cbiAgICBvbkNsaWNrQ2F0ZWdvcnksXG5cbiAgICBQdWJTdWIgPSB1dGlsLlB1YlN1YjtcblxuICAgIC8vLS0tLS0tLS0tLS0tLS0tLSBFTkQgTU9EVUxFIFNDT1BFIFZBUklBQkxFUyAtLS0tLS0tLS0tLS0tLVxuXG4gICAgLy8tLS0tLS0tLS0tLS0tLS0tLS0tLS0gQkVHSU4gTU9EVUxFIFNDT1BFIE1FVEhPRFMgLS0tLS0tLS0tLS0tLS0tLS0tLS1cblxuICAgIHNldEpxdWVyeU1hcCA9IGZ1bmN0aW9uKCl7XG4gICAgICAgIHZhciAkb3V0ZXJEaXYgPSBzdGF0ZU1hcC4kY29udGFpbmVyO1xuXG4gICAgICAgIGpxdWVyeU1hcCA9IHtcbiAgICAgICAgICAgICRvdXRlckRpdiAgICAgICAgICAgICAgIDogJG91dGVyRGl2LFxuICAgICAgICAgICAgJGFwcF9jb250YWluZXIgICAgICAgICAgOiAkb3V0ZXJEaXYuZmluZCgnLnNoZWxsYWMtYXBwLWNvbnRhaW5lcicpLFxuICAgICAgICAgICAgJG5hdl9zaWRlYmFyICAgICAgICAgICAgOiAkb3V0ZXJEaXYuZmluZCgnLnNoZWxsYWMtYXBwLnNpZGViYXInKSxcbiAgICAgICAgICAgICRuYXZfc2lkZWJhcl9jYXRlZ29yaWVzIDogJG91dGVyRGl2LmZpbmQoJy5zaGVsbGFjLWFwcC5zaWRlYmFyICNjb2xsYXBzZUNhdGVnb3JpZXMgLnNoZWxsYWMtYXBwLm5hdi5uYXYtc2lkZWJhci5saXN0LWdyb3VwJyksXG4gICAgICAgICAgICAkbmF2X3NpZGViYXJfcGVvcGxlICAgICA6ICRvdXRlckRpdi5maW5kKCcuc2hlbGxhYy1hcHAuc2lkZWJhciAjY29sbGFwc2VQZW9wbGUgLnNoZWxsYWMtYXBwLm5hdi5uYXYtc2lkZWJhci5saXN0LWdyb3VwJyksXG4gICAgICAgICAgICAkY2xpcF9jb250ZW50ICAgICAgICAgICA6ICRvdXRlckRpdi5maW5kKCcuc2hlbGxhYy1hcHAuY2xpcC5jb250ZW50JylcbiAgICAgICAgfTtcbiAgICB9O1xuXG5cbiAgICAvKlxuICAgICAqIG1ldGhvZCByZW5kZXJDYXRlZ29yaWVzOiBtYWtlIGFuIGFwaSBjYWxsIHRvIGdhdGhlciB0aGUgQ2F0ZWdvcmllcyBpbiBkYXRhYmFzZVxuICAgICAqIHBhcmFtZXRlcnNcbiAgICAgKiByZXR1cm5cbiAgICAgKiAgICoganNvbkFycmF5IC0gYSBsaXN0IG9mIHZhbGlkIEpTT04gb2JqZWN0cyByZXByZXNlbnRpbmdcbiAgICAgKiAgIHNlcmlhbGl6ZWQgQ2F0ZWdvcnkgb2JqZWN0c1xuICAgICAqKi9cbiAgICByZW5kZXJDYXRlZ29yaWVzID0gZnVuY3Rpb24oKXtcblxuICAgICAgICB2YXIgdXJsID0gJy9hcGkvY2F0ZWdvcmllcy8nO1xuICAgICAgICAkLmFqYXgoe1xuICAgICAgICAgICAgdXJsOiB1cmxcbiAgICAgICAgfSlcbiAgICAgICAgICAgIC5kb25lKGZ1bmN0aW9uKGNhdGVnb3JpZXMpe1xuICAgICAgICAgICAgICAgIHN0YXRlTWFwLmNhdGVnb3J5X2RiLmluc2VydChwYXJzZUNhdGVnb3J5RGF0YShjYXRlZ29yaWVzLnJlc3VsdHMpKTtcbiAgICAgICAgICAgICAgICBzdGF0ZU1hcC5jYXRlZ29yaWVzID0gc3RhdGVNYXAuY2F0ZWdvcnlfZGIoKS5nZXQoKTtcbiAgICAgICAgICAgICAgICBQdWJTdWIuZW1pdChcImNhdGVnb3J5TG9hZENvbXBsZXRlXCIpO1xuICAgICAgICAgICAgfSlcbiAgICAgICAgICAgIC5mYWlsKGZ1bmN0aW9uKCl7XG4gICAgICAgICAgICAgICAgY29uc29sZS5lcnJvcihcIkNvdWxkIG5vdCBsb2FkIENsaXAgYXJjaGl2ZVwiKTtcbiAgICAgICAgICAgIH0pXG4gICAgICAgICAgICAuYWx3YXlzKGZ1bmN0aW9uKCl7XG5cbiAgICAgICAgICAgIH0pO1xuICAgIH07XG5cblxuICAgIC8qXG4gICAgICogbWV0aG9kIGxvYWRDbGlwczogbWFrZSBhbiBhcGkgY2FsbCB0byBnYXRoZXIgdGhlIENsaXBzIGluIGRhdGFiYXNlXG4gICAgICogQHBhcmFtIHN0YXR1cyB0eXBlIG9mIFJlbGF0aW9uc2hpcFxuICAgICAqIEBwYXJhbSB1c2VybmFtZSB1c2VybmFtZSBvZiB0aGUgaW50ZW5kZWQgdGFyZ2V0IFBlcnNvblxuICAgICAqIEByZXR1cm4ganNvbkFycmF5IGxpc3Qgb2YgdmFsaWQgSlNPTiBvYmplY3RzIHJlcHJlc2VudGluZyBzZXJpYWxpemVkIENsaXAgb2JqZWN0c1xuICAgICAqKi9cbiAgICBsb2FkQ2xpcHMgPSBmdW5jdGlvbihzdGF0dXMsIHVzZXJuYW1lKXtcblxuICAgICAgICB2YXIgdXJsID0gWycvYXBpL2NsaXBzJywgc3RhdHVzLCB1c2VybmFtZSwgXCJcIl0uam9pbignLycpO1xuXG4gICAgICAgICQuYWpheCh7XG4gICAgICAgICAgICB1cmw6IHVybFxuICAgICAgICB9KVxuICAgICAgICAgICAgLmRvbmUoZnVuY3Rpb24oY2xpcHMpe1xuICAgICAgICAgICAgICAgIC8vY29uc29sZS5sb2coY2xpcHMpO1xuICAgICAgICAgICAgICAgIHN0YXRlTWFwLmNsaXBfZGIuaW5zZXJ0KHBhcnNlQ2xpcERhdGEoY2xpcHNbJ3Jlc3VsdHMnXSkpO1xuICAgICAgICAgICAgICAgIHN0YXRlTWFwLmNsaXBzID0gc3RhdGVNYXAuY2xpcF9kYigpLm9yZGVyKFwiaWQgZGVzY1wiKS5nZXQoKTtcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhzdGF0ZU1hcC5jbGlwcyk7XG4gICAgICAgICAgICAgICAgUHViU3ViLmVtaXQoXCJjbGlwTG9hZENvbXBsZXRlXCIpO1xuICAgICAgICAgICAgfSlcbiAgICAgICAgICAgIC5mYWlsKGZ1bmN0aW9uKCl7XG4gICAgICAgICAgICAgICAgY29uc29sZS5lcnJvcihcIkNvdWxkIG5vdCBsb2FkIENsaXAgYXJjaGl2ZVwiKTtcbiAgICAgICAgICAgIH0pXG4gICAgICAgICAgICAuYWx3YXlzKGZ1bmN0aW9uKCl7XG5cbiAgICAgICAgICAgIH0pO1xuICAgIH07XG5cbiAgICAvKipcbiAgICAgKiBtZXRob2QgcGFyc2VDYXRlZ29yeURhdGE6IHRyYW5zZm9ybSBhbnkgQ2F0ZWdvcnkgZmllbGRzIHRvIGphdmFzY3JpcHQtY29tcGF0aWJsZVxuICAgICAqIHBhcmFtZXRlcnNcbiAgICAgKiAgICogcmF3IC0gYSBzdHJpbmcgZGVzY3JpYmluZyBhbiBhcnJheSBvZiB2YWxpZCBKU09OXG4gICAgICogcmV0dXJuXG4gICAgICogICAqIGpzb25BcnJheSAtIGEgbGlzdCBvZiB2YWxpZCBKU09OIG9iamVjdHNcbiAgICAgKi9cbiAgICBwYXJzZUNhdGVnb3J5RGF0YSA9IGZ1bmN0aW9uKHJhdyl7XG4gICAgICAgIHZhciBqc29uQXJyYXk7XG5cbiAgICAgICAganNvbkFycmF5ID0gcmF3Lm1hcChmdW5jdGlvbihqc29uT2JqKXtcblxuICAgICAgICAgICAgdHJ5e1xuICAgICAgICAgICAgICAgIHJldHVybiBqc29uT2JqO1xuICAgICAgICAgICAgfWNhdGNoKGVycil7XG4gICAgICAgICAgICAgICAgY29uc29sZS5lcnJvcihlcnIpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICAgICAgcmV0dXJuIGpzb25BcnJheTtcbiAgICB9O1xuXG4gICAgLyoqXG4gICAgKiBwYXJzZUNsaXBEYXRhOiB0cmFuc2Zvcm0gYW55IENsaXAgZmllbGRzIHRvIGphdmFzY3JpcHQtY29tcGF0aWJsZVxuICAgICogQHBhcmFtIHJhdyBhIHN0cmluZyBkZXNjcmliaW5nIGFuIGFycmF5IG9mIHZhbGlkIEpTT05cbiAgICAqIEByZXR1cm4ganNvbkFycmF5IC0gYSBsaXN0IG9mIHZhbGlkIEpTT04gb2JqZWN0c1xuICAgICovXG4gICAgcGFyc2VDbGlwRGF0YSA9IGZ1bmN0aW9uKHJhdyl7XG4gICAgICAgIHZhciBqc29uQXJyYXk7XG5cbiAgICAgICAganNvbkFycmF5ID0gcmF3Lm1hcChmdW5jdGlvbihqc29uT2JqKXtcblxuICAgICAgICAgICAgdHJ5e1xuICAgICAgICAgICAgICAgIGpzb25PYmouY3JlYXRlZCA9IG1vbWVudChqc29uT2JqLmNyZWF0ZWQpO1xuICAgICAgICAgICAgICAgIHJldHVybiBqc29uT2JqO1xuICAgICAgICAgICAgfWNhdGNoKGVycil7XG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2coZXJyKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgICAgIHJldHVybiBqc29uQXJyYXk7XG4gICAgfTtcblxuICAgIC8qXG4gICAgICogbWV0aG9kIHVybFBhcnNlOiBleHRyYWN0IHRoZSB2YXJpb3VzIGFzcGVjdHMgb2YgdGhlIHVybCBmcm9tIGEgSHlwZXJsaW5rZWRSZWxhdGVkRmllbGRcbiAgICAgKiBwcmVjb25kaXRpb246IHJlcXVpcmVzIGEgSHlwZXJsaW5rZWRSZWxhdGVkRmllbGQgb2YgdGhlIGZvcm0gcHJvdG9jb2w6aG9zdC9hcGkvb2JqZWN0L3BrL1xuICAgICAqIHBhcmFtZXRlcnNcbiAgICAgKiAgICogdXJsIC0gdGhlIHVybCBvZiB0aGUgcmVzb3VyY2VcbiAgICAgKiByZXR1cm5cbiAgICAgKiAgICogVVJMb2JqIC0gYW4gb2JqZWN0IGxpdGVyYWwgd2l0aCBmaWVsZHMgcHJvdG9jb2wsIGhvc3QsIGFwaSwgb2JqZWN0LCBhbmQgcGtcbiAgICAgKiovXG4gICAgdXJsUGFyc2UgPSBmdW5jdGlvbih1cmwpe1xuICAgICAgICB2YXIgVVJMID0ge30sXG4gICAgICAgICAgICB1ID0gdXJsIHx8ICcnLFxuICAgICAgICAgICAgcGFydHM7XG5cbiAgICAgICAgcGFydHMgPSB1LnNwbGl0KCcvJyk7XG5cbiAgICAgICAgdHJ5e1xuICAgICAgICAgICAgVVJMLnByb3RvY29sID0gcGFydHNbMF07XG4gICAgICAgICAgICBVUkwuaG9zdCA9IHBhcnRzWzJdLnNwbGl0KCc6JylbMF07XG4gICAgICAgICAgICBVUkwub2JqZWN0ID0gcGFydHNbNF07XG4gICAgICAgICAgICBVUkwucGsgPSBwYXJ0c1s1XTtcblxuICAgICAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgICAgICB0aHJvdyBcIkltcHJvcGVyIHVybCBmb3JtYXQgZW50ZXJlZFwiO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBVUkw7XG4gICAgfTtcblxuXG4gICAgLy8tLS0tLS0tLS0tLS0tLS0tLS0tLS0gRU5EIE1PRFVMRSBTQ09QRSBNRVRIT0RTIC0tLS0tLS0tLS0tLS0tLS0tLS0tXG5cblxuICAgIC8vLS0tLS0tLS0tLS0tLS0tLS0tLS0tIEJFR0lOIERPTSBNRVRIT0RTIC0tLS0tLS0tLS0tLS0tLS0tLS0tXG5cblxuXG4gICAgZGlzcGxheV9jYXRlZ29yaWVzID0gZnVuY3Rpb24oKXtcblxuICAgICAgICB2YXIgYWxsX2FuY2hvciA9IFN0cmluZygpLFxuICAgICAgICAgICAgaXRlbXMgPSBTdHJpbmcoKSxcbiAgICAgICAgICAgIGNsaXBfbGlzdCA9IFtdO1xuICAgICAgICBqcXVlcnlNYXAuJG5hdl9zaWRlYmFyX2NhdGVnb3JpZXMuYXBwZW5kKGFsbF9hbmNob3IpO1xuXG4gICAgICAgIHN0YXRlTWFwLmNhdGVnb3JpZXMuZm9yRWFjaChmdW5jdGlvbihvYmplY3Qpe1xuICAgICAgICAgICAgaXRlbXMgKz1cbiAgICAgICAgICAgICAgICAnPGEgY2xhc3M9XCJsaXN0LWdyb3VwLWl0ZW0gbmF2LXNpZGViYXItY2F0ZWdvcnlcIiBocmVmPVwiI1wiPicgKyAnPHNwYW4gY2xhc3M9XCJiYWRnZVwiPicgKyBvYmplY3QuY2xpcHMubGVuZ3RoICsgJzwvc3Bhbj4nICtcbiAgICAgICAgICAgICAgICAgICAgJzxoNSBjbGFzcz1cImxpc3QtZ3JvdXAtaXRlbS1oZWFkaW5nXCIgaWQ9XCInICsgb2JqZWN0LnNsdWcgKyAnXCI+JyArIG9iamVjdC50aXRsZSArICc8L2g1PicgK1xuICAgICAgICAgICAgICAgICc8L2E+JztcblxuICAgICAgICAgICAgdmFyIGZpbHRlcmVkID0gb2JqZWN0LmNsaXBzLmZpbHRlcihmdW5jdGlvbihpZCl7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGNsaXBfbGlzdC5pbmRleE9mKGlkKSA9PT0gLTE7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIGNsaXBfbGlzdCA9IGNsaXBfbGlzdC5jb25jYXQoZmlsdGVyZWQpO1xuICAgICAgICB9KTtcblxuICAgICAgICBhbGxfYW5jaG9yICs9XG4gICAgICAgICAgICAnPGEgY2xhc3M9XCJsaXN0LWdyb3VwLWl0ZW0gbmF2LXNpZGViYXItY2F0ZWdvcnkgYWN0aXZlXCIgaHJlZj1cIiNcIj4nICsgJzxzcGFuIGNsYXNzPVwiYmFkZ2VcIj4nICsgY2xpcF9saXN0Lmxlbmd0aCArICc8L3NwYW4+JyArXG4gICAgICAgICAgICAgICAgJzxoNSBjbGFzcz1cImxpc3QtZ3JvdXAtaXRlbS1oZWFkaW5nXCIgaWQ9XCJhbGxcIj5BTEw8L2g1PicgK1xuICAgICAgICAgICAgJzwvYT4nO1xuXG4gICAgICAgIGpxdWVyeU1hcC4kbmF2X3NpZGViYXJfY2F0ZWdvcmllcy5hcHBlbmQoYWxsX2FuY2hvciwgaXRlbXMpO1xuXG4gICAgICAgIC8vcmVnaXN0ZXIgbGlzdGVuZXJzXG4gICAgICAgICQoJy5saXN0LWdyb3VwLWl0ZW0taGVhZGluZycpLm9uKCdjbGljaycsIG9uQ2xpY2tDYXRlZ29yeSk7XG4gICAgfTtcblxuXG4gICAgZGlzcGxheV9jbGlwcyA9IGZ1bmN0aW9uKCl7XG5cbiAgICAgICAganF1ZXJ5TWFwLiRjbGlwX2NvbnRlbnQuaHRtbChcIlwiKTtcbiAgICAgICAgc3RhdGVNYXAuY2xpcHMuZm9yRWFjaChmdW5jdGlvbihvYmplY3Qpe1xuXG4gICAgICAgICAgICB2YXIgY2xpcCA9IFN0cmluZygpICtcbiAgICAgICAgICAgICAgICAnPGRpdiBjbGFzcz1cImNvbC14cy02IGNvbC1zbS00IGNvbC1tZC0zIGNvbC1sZy0yIG1lZGlhIGNsaXBcIj4nICtcbiAgICAgICAgICAgICAgICAgICAgJzxkaXYgY2xhc3M9XCJ1aTM2MFwiPicgK1xuXG4gICAgICAgICAgICAgICAgICAgICAgICAvL0JFR0lOICRwbGF5ZXJcbiAgICAgICAgICAgICAgICAgICAgICAgICc8c3BhbiBjbGFzcz1cIm1lZGlhLXVybFwiIGRhdGEtY2xpcC11cmw9XCInICsgc3RhdGVNYXAuTUVESUFfVVJMICsgb2JqZWN0LmF1ZGlvX2ZpbGUgKyAnXCI+JyArXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgJzxpbWcgY2xhc3M9XCJtZWRpYS1pbWcgaW1nLXJlc3BvbnNpdmVcIiBzcmM9XCInICsgc3RhdGVNYXAuTUVESUFfVVJMICsgb2JqZWN0LmJyYW5kICsgJ1wiIGFsdD1cIicgKyBvYmplY3QudGl0bGUgKyAnXCIgLz4nICtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAnPGRpdiBjbGFzcz1cIm1lZGlhLWRlc2NyaXB0aW9uXCI+JyArXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICc8c3BhbiBjbGFzcz1cIm1lZGlhLWRlc2NyaXB0aW9uLWNvbnRlbnQgbGVhZFwiPicgKyB1dGlsLnRydW5jYXRlKG9iamVjdC50aXRsZSwgY29uZmlnTWFwLnRydW5jYXRlX21heCkgKyAnPC9zcGFuPjxici8+JyArXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICc8c3BhbiBjbGFzcz1cIm1lZGlhLWRlc2NyaXB0aW9uLWNvbnRlbnRcIj48ZW0+JyArIHV0aWwudHJ1bmNhdGUob2JqZWN0LmRlc2NyaXB0aW9uLCBjb25maWdNYXAudHJ1bmNhdGVfbWF4KSArICc8L2VtPjwvc3Bhbj48YnIvPicgK1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAnPHNwYW4gY2xhc3M9XCJtZWRpYS1kZXNjcmlwdGlvbi1jb250ZW50XCI+PHNtYWxsPicgKyBvYmplY3Qub3duZXIgKyBcIiAgLS0gXCIgKyBvYmplY3QuY3JlYXRlZC5fZC50b0RhdGVTdHJpbmcoKSArICc8L3NtYWxsPjwvc3Bhbj48YnIvPicgK1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICc8L2Rpdj4nICtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAnPGRpdiBjbGFzcz1cIm1lZGlhLXByb2dyZXNzXCI+PC9kaXY+JyArXG4gICAgICAgICAgICAgICAgICAgICAgICAnPC9zcGFuPicgICtcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vRU5EICRwbGF5ZXJcblxuICAgICAgICAgICAgICAgICAgICAnPC9kaXY+JyArXG4gICAgICAgICAgICAgICAgJzwvZGl2Pic7XG5cbiAgICAgICAgICAgIGpxdWVyeU1hcC4kY2xpcF9jb250ZW50LmFwcGVuZChjbGlwKTtcblxuXG4gICAgICAgIH0pO1xuICAgICAgICAkKCcubWVkaWEuY2xpcCAubWVkaWEtdXJsJykub24oJ2NsaWNrJywgZnVuY3Rpb24oZSl7XG4gICAgICAgICAgICB2YXIgdXJsID0gJCh0aGlzKS5hdHRyKCdkYXRhLWNsaXAtdXJsJyksXG4gICAgICAgICAgICAgICAgJHByb2dyZXNzID0gJCh0aGlzKS5maW5kKCcubWVkaWEtcHJvZ3Jlc3MnKSxcbiAgICAgICAgICAgICAgICAkZGVzY3JpcHRpb24gPSAkKHRoaXMpLmZpbmQoJy5tZWRpYS1kZXNjcmlwdGlvbicpO1xuXG4gICAgICAgICAgICBhdWRpby5vbkNsaWNrUGxheWVyKHVybCwgJHByb2dyZXNzLCAkZGVzY3JpcHRpb24pO1xuICAgICAgICB9KTtcbiAgICB9O1xuXG4gICAgLy8tLS0tLS0tLS0tLS0tLS0tLS0tLS0gRU5EIERPTSBNRVRIT0RTIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cblxuICAgIC8vLS0tLS0tLS0tLS0tLS0tLS0tLSBCRUdJTiBFVkVOVCBIQU5ETEVSUyAtLS0tLS0tLS0tLS0tLS0tLS0tXG4gICAgLy8gQmVnaW4gRXZlbnQgaGFuZGxlciAvb25DbGlja0NhdGVnb3J5L1xuICAgIC8vIFB1cnBvc2UgICAgOiBIYW5kbGVzIHRoZSBldmVudCBmb3Igc2lkZWJhciBjYXRlZ29yeSBzZWxlY3Rpb25cbiAgICAvLyBBcmd1bWVudHMgIDpcbiAgICAvLyBTZXR0aW5ncyAgIDogbm9uZVxuICAgIC8vIFJldHVybnMgICAgOlxuICAgIC8vIEFjdGlvbnMgICAgOiBTaG91bGQgc2lnbmFsIHRvIGF1ZGlvIG1vZHVsZSB0byB1cGRhdGUgcHJvZ3Jlc3MgYmFyIHN0YXRlIGZvciBlYWNoIGNsaXBcbiAgICAvLyAgICogYmluZHMgdG8gY2F0ZWdvcnkgRE9NIGVsZW1lbnRzIGFuZCByZWxvYWRzIGNvcnJlc3BvbmRpbmcgY2xpcHMgaW50b1xuICAgIC8vICAgICBzdGF0ZU1hcC5jbGlwc1xuICAgIG9uQ2xpY2tDYXRlZ29yeSA9IGZ1bmN0aW9uKGV2ZW50KXtcblxuICAgICAgICB2YXIgY2F0ZWdvcnlfb2JqZWN0O1xuXG4gICAgICAgIC8vZW1wdHkgdGhlIGNsaXAgYXJyYXlcbiAgICAgICAgc3RhdGVNYXAuY2xpcHMgPSBbXTtcblxuICAgICAgICAvL3JlZmlsbCB0aGUgZW1wdHkgdGhlIGNsaXAgYXJyYXlcbiAgICAgICAgaWYoZXZlbnQudGFyZ2V0LmlkID09PSBcImFsbFwiKXtcbiAgICAgICAgICAgIHN0YXRlTWFwLmNsaXBzID0gc3RhdGVNYXAuY2xpcF9kYigpLmdldCgpO1xuXG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBjYXRlZ29yeV9vYmplY3QgPSBzdGF0ZU1hcC5jYXRlZ29yeV9kYih7c2x1ZzogZXZlbnQudGFyZ2V0LmlkfSkuZmlyc3QoKTtcblxuICAgICAgICAgICAgLy9wdXNoIGluIGFueSBtYXRjaGluZyBjbGlwIGlkIGZyb20gdGhlIHVybFxuICAgICAgICAgICAgc3RhdGVNYXAuY2xpcHMgPSBjYXRlZ29yeV9vYmplY3QuY2xpcHMubWFwKGZ1bmN0aW9uKGNsaXBfdXJsKXtcbiAgICAgICAgICAgICAgICB2YXIgVVJMID0gdXJsUGFyc2UoY2xpcF91cmwpO1xuICAgICAgICAgICAgICAgIHJldHVybiBzdGF0ZU1hcC5jbGlwX2RiKHtpZDogcGFyc2VJbnQoVVJMLnBrKX0pLmZpcnN0KCk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgICAgICBkaXNwbGF5X2NsaXBzKCk7XG4gICAgICAgIHV0aWwuUHViU3ViLmVtaXQoXCJzaGVsbGFjLWNhdGVnb3J5Y2hhbmdlXCIsXG4gICAgICAgICAgICBzdGF0ZU1hcC5jbGlwcy5tYXAoZnVuY3Rpb24oY2xpcCl7cmV0dXJuIGNsaXAuYXVkaW9fZmlsZTt9KVxuICAgICAgICApO1xuICAgIH07XG5cblxuXG4gICAgLy8tLS0tLS0tLS0tLS0tLS0tLS0tLSBFTkQgRVZFTlQgSEFORExFUlMgLS0tLS0tLS0tLS0tLS0tLS0tLS1cblxuICAgIC8vLS0tLS0tLS0tLS0tLS0tLS0tLSBCRUdJTiBQVUJMSUMgTUVUSE9EUyAtLS0tLS0tLS0tLS0tLS0tLS0tXG4gICAgLy8gaW5pdE1vZHVsZSAvLyAgIFBvcHVsYXRlcyAkY29udGFpbmVyIHdpdGggdGhlIHNoZWxsIG9mIHRoZSBVSVxuICAgIC8vICAgYW5kIHRoZW4gY29uZmlndXJlcyBhbmQgaW5pdGlhbGl6ZXMgZmVhdHVyZSBtb2R1bGVzLlxuICAgIC8vICAgVGhlIFNoZWxsIGlzIGFsc28gcmVzcG9uc2libGUgZm9yIGJyb3dzZXItd2lkZSBpc3N1ZXNcbiAgICAvLyAgIERpcmVjdHMgdGhpcyBhcHAgdG8gb2ZmZXIgaXRzIGNhcGFiaWxpdHkgdG8gdGhlIHVzZXJcbiAgICAvLyBAcGFyYW0gJGNvbnRhaW5lciBBIGpRdWVyeSBjb2xsZWN0aW9uIHRoYXQgc2hvdWxkIHJlcHJlc2VudFxuICAgIC8vIGEgc2luZ2xlIERPTSBjb250YWluZXJcbiAgICAvLyBAcGFyYW0gTUVESUFfVVJMIERqYW5nbyBtZWRpYSB1cmwgcHJlZml4IChzZXR0aW5ncy5NRURJQV9VUkwpXG4gICAgLy8gQHBhcmFtIFNUQVRJQ19VUkwgRGphbmdvIHN0YXRpYyB1cmwgcHJlZml4IChzZXR0aW5ncy5TVEFUSUNfVVJMKVxuICAgIC8vIEBwYXJhbSB1c2VybmFtZSBhY2NvdW50IGhvbGRlciB1c2VybmFtZSBmb3IgcmV0cmlldmluZyBjbGlwc1xuXG4gICAgaW5pdE1vZHVsZSA9IGZ1bmN0aW9uKCAkY29udGFpbmVyLCBTVEFUSUNfVVJMLCBNRURJQV9VUkwsIHVzZXJuYW1lKXtcbiAgICAgICAgLy8gbG9hZCBIVE1MIGFuZCBtYXAgalF1ZXJ5IGNvbGxlY3Rpb25zXG4gICAgICAgIHN0YXRlTWFwLiRjb250YWluZXIgPSAkY29udGFpbmVyO1xuICAgICAgICBzdGF0ZU1hcC51c2VybmFtZSA9IHVzZXJuYW1lO1xuICAgICAgICBzdGF0ZU1hcC4kbmF2X3NpZGViYXIgPSAkY29udGFpbmVyLnBhcmVudDtcbiAgICAgICAgc3RhdGVNYXAuU1RBVElDX1VSTCA9IFNUQVRJQ19VUkw7XG4gICAgICAgIHN0YXRlTWFwLk1FRElBX1VSTCA9IE1FRElBX1VSTDtcblxuICAgICAgICAkY29udGFpbmVyLmh0bWwoIGNvbmZpZ01hcC5vZmZjYW52YXNfaHRtbCApO1xuICAgICAgICAkY29udGFpbmVyLmFwcGVuZCggY29uZmlnTWFwLm1haW5faHRtbCApO1xuICAgICAgICBzZXRKcXVlcnlNYXAoKTtcblxuICAgICAgICAgLy9yZWdpc3RlciBwdWItc3ViIG1ldGhvZHNcbiAgICAgICAgUHViU3ViLm9uKFwiY2xpcExvYWRDb21wbGV0ZVwiLCBkaXNwbGF5X2NsaXBzKTtcbiAgICAgICAgUHViU3ViLm9uKFwiY2F0ZWdvcnlMb2FkQ29tcGxldGVcIiwgZGlzcGxheV9jYXRlZ29yaWVzKTtcblxuICAgICAgICAvL2xvYWQgZGF0YSBpbnRvIGluLWJyb3dzZXIgZGF0YWJhc2VcbiAgICAgICAgbG9hZENsaXBzKFwiZm9sbG93aW5nXCIsIHVzZXJuYW1lKTtcbiAgICAgICAgcmVuZGVyQ2F0ZWdvcmllcygpO1xuXG4gICAgICAgIC8vTmF2aWdhdGlvbiBNZW51IFNsaWRlclxuICAgICAgICAkKCcjbmF2LWV4cGFuZGVyJykub24oJ2NsaWNrJyxmdW5jdGlvbihlKXtcbiAgICAgICAgICAgIGUucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgICAgICQoJ2JvZHknKS50b2dnbGVDbGFzcygnbmF2LWV4cGFuZGVkJyk7XG4gICAgICAgIH0pO1xuICAgICAgICAkKCcjbmF2LWNsb3NlJykub24oJ2NsaWNrJyxmdW5jdGlvbihlKXtcbiAgICAgICAgICAgIGUucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgICAgICQoJ2JvZHknKS5yZW1vdmVDbGFzcygnbmF2LWV4cGFuZGVkJyk7XG4gICAgICAgIH0pO1xuICAgICAgICBjb25zb2xlLmxvZygkY29udGFpbmVyKTtcbiAgICB9O1xuXG4gICAgcmV0dXJuIHsgaW5pdE1vZHVsZTogaW5pdE1vZHVsZSB9O1xufSgpKTtcblxubW9kdWxlLmV4cG9ydHMgPSBzaGVsbGFjO1xuXG4iLCIvKlxuICogdXRpbC5qc1xuICogVXRpbGl0aWVzIGZvciB0aGUgQXVkaW8gYXBwXG4qL1xuLyogZ2xvYmFsICovXG4ndXNlIHN0cmljdCc7XG5cbnZhciB1dGlsID0gKGZ1bmN0aW9uICgpIHtcblxuICAgIHZhciBQdWJTdWIsIHRydW5jYXRlO1xuXG4gICAgLy8tLS0tLS0tLS0tLS0tLS0tIEJFR0lOIE1PRFVMRSBERVBFTkRFTkNJRVMgLS0tLS0tLS0tLS0tLS1cblxuICAgIC8vLS0tLS0tLS0tLS0tLS0tLSBFTkQgTU9EVUxFIERFUEVOREVOQ0lFUyAtLS0tLS0tLS0tLS0tLVxuXG4gICAgLy8tLS0tLS0tLS0tLS0tLS0tLS0tLSBFTkQgRVZFTlQgSEFORExFUlMgLS0tLS0tLS0tLS0tLS0tLS0tLS1cblxuICAgIC8vLS0tLS0tLS0tLS0tLS0tLS0tLSBCRUdJTiBQVUJMSUMgTUVUSE9EUyAtLS0tLS0tLS0tLS0tLS0tLS0tXG4gICAgLy8gQmVnaW4gUHVibGljIG1ldGhvZCAvUHViU3ViL1xuICAgIC8vIEV4YW1wbGUgICA6IFB1YlN1Yi5vbignYmFyaycsIGdldERvZyApOyBQdWJTdWIuZW1pdCgnYmFyaycpO1xuICAgIC8vIFB1cnBvc2UgICA6XG4gICAgLy8gICBTdWJzY3JpYmUgYW5kIHB1Ymxpc2ggZXZlbnRzXG4gICAgLy8gQXJndW1lbnRzIDpcbiAgICAvLyBBY3Rpb24gICAgOiBUaGUgdXNlciBjYW4gc3Vic2NyaWJlIHRvIGV2ZW50cyB3aXRoIG9uKCc8ZXZlbnQgbmFtZT4nLCBjYWxsYmFjaylcbiAgICAvLyBhbmQgbGlzdGVuIHRvIGV2ZW50cyBwdWJsaXNoZWQgd2l0aCBlbWl0KCc8ZXZlbnQgbmFtZT4nKVxuICAgIC8vIFJldHVybnMgICA6IG5vbmVcbiAgICAvLyBUaHJvd3MgICAgOiBub25lXG4gICAgUHViU3ViID0ge1xuICAgICAgICBoYW5kbGVyczoge30sXG5cbiAgICAgICAgb24gOiBmdW5jdGlvbihldmVudFR5cGUsIGhhbmRsZXIpIHtcbiAgICAgICAgICAgIGlmICghKGV2ZW50VHlwZSBpbiB0aGlzLmhhbmRsZXJzKSkge1xuICAgICAgICAgICAgICAgIHRoaXMuaGFuZGxlcnNbZXZlbnRUeXBlXSA9IFtdO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgLy9wdXNoIGhhbmRsZXIgaW50byBhcnJheSAtLSBcImV2ZW50VHlwZVwiOiBbaGFuZGxlcl1cbiAgICAgICAgICAgIHRoaXMuaGFuZGxlcnNbZXZlbnRUeXBlXS5wdXNoKGhhbmRsZXIpO1xuICAgICAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgICAgIH0sXG5cbiAgICAgICAgZW1pdCA6IGZ1bmN0aW9uKGV2ZW50VHlwZSkge1xuICAgICAgICAgICAgdmFyIGhhbmRsZXJBcmdzID0gQXJyYXkucHJvdG90eXBlLnNsaWNlLmNhbGwoYXJndW1lbnRzLCAxKTtcbiAgICAgICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgdGhpcy5oYW5kbGVyc1tldmVudFR5cGVdLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5oYW5kbGVyc1tldmVudFR5cGVdW2ldLmFwcGx5KHRoaXMsIGhhbmRsZXJBcmdzKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiB0aGlzO1xuICAgICAgICB9XG5cbiAgICB9O1xuXG4gICAgLy8gQmVnaW4gUHVibGljIG1ldGhvZCAvdHJ1bmNhdGUvXG4gICAgLy8gRXhhbXBsZSAgIDogdHJ1bmNhdGUoc3RyaW5nLCBtYXhjaGFyKVxuICAgIC8vIFB1cnBvc2UgICA6XG4gICAgLy8gICBUcnVuY2F0ZSBhIHN0cmluZyBhbmQgYXBwZW5kIFwiLi4uXCIgdG8gdGhlIHJlbWFpbmluZ1xuICAgIC8vIEFyZ3VtZW50cyA6XG4gICAgLy8gICogc3RyaW5nIC0gdGhlIG9yaWdpbmFsIHN0cmluZ1xuICAgIC8vICAqIG1heGNoYXIgLSB0aGUgbWF4IG51bWJlciBvZiBjaGFycyB0byBzaG93XG4gICAgLy8gUmV0dXJucyAgIDogdGhlIHRydW5jYXRlZCBzdHJpbmdcbiAgICAvLyBUaHJvd3MgICAgOiBub25lXG4gICAgdHJ1bmNhdGUgPSBmdW5jdGlvbihzdHJpbmcsIG1heGNoYXIpe1xuICAgICAgICB2YXIgc3RyID0gc3RyaW5nIHx8ICcnO1xuXG4gICAgICAgIHZhciB0cnVuY2F0ZWQgPSBzdHIuc2xpY2UoMCwgbWF4Y2hhcik7XG4gICAgICAgIGlmKHN0ci5sZW5ndGggPiBtYXhjaGFyKXtcbiAgICAgICAgICAgIHRydW5jYXRlZCArPSBcIi4uLlwiO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiB0cnVuY2F0ZWQ7XG4gICAgfTtcblxuICAgIHJldHVybiB7XG4gICAgICAgIFB1YlN1YjogUHViU3ViLFxuICAgICAgICB0cnVuY2F0ZTogdHJ1bmNhdGVcbiAgICB9O1xufSgpKTtcblxubW9kdWxlLmV4cG9ydHMgPSB1dGlsO1xuXG4iXX0=
