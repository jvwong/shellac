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
            '<div class="col-sm-3 col-md-2 shellac-app sidebar">' +

                '<div class="panel-group" id="accordion">' +

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

            '<div class="col-sm-9 col-sm-offset-3 col-md-10 col-md-offset-2 shellac-app clip content"></div>',

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
                stateMap.clip_db.insert(parseClipData(clips));
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
                console.error(err);
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
                '<div class="col-xs-6 col-sm-6 col-md-6 col-lg-4 media clip">' +
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
                        '</span>' +
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

        $container.html( configMap.main_html );
        setJqueryMap();

        //register pub-sub methods
        PubSub.on("clipLoadComplete", display_clips);
        PubSub.on("categoryLoadComplete", display_categories);

        //load data into in-browser database
        loadClips("following", username);
        renderCategories();

//        console.log($container);
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi91c3IvbG9jYWwvbGliL25vZGVfbW9kdWxlcy93YXRjaGlmeS9ub2RlX21vZHVsZXMvYnJvd3NlcmlmeS9ub2RlX21vZHVsZXMvYnJvd3Nlci1wYWNrL19wcmVsdWRlLmpzIiwiL2hvbWUvanZ3b25nL1Byb2plY3RzL3NoZWxsYWMvc2hlbGxhYy5uby1pcC5jYS9zb3VyY2Uvc2hlbGxhYy9zdGF0aWMvc2hlbGxhYy9qcy9saWIvc291bmRtYW5hZ2VyMi9zY3JpcHQvc291bmRtYW5hZ2VyMi5qcyIsIi9ob21lL2p2d29uZy9Qcm9qZWN0cy9zaGVsbGFjL3NoZWxsYWMubm8taXAuY2Evc291cmNlL3NoZWxsYWMvc3RhdGljL3NoZWxsYWMvanMvbm9kZV9tb2R1bGVzL21vbWVudC9tb21lbnQuanMiLCIvaG9tZS9qdndvbmcvUHJvamVjdHMvc2hlbGxhYy9zaGVsbGFjLm5vLWlwLmNhL3NvdXJjZS9zaGVsbGFjL3N0YXRpYy9zaGVsbGFjL2pzL25vZGVfbW9kdWxlcy90YWZmeWRiL3RhZmZ5LmpzIiwiL2hvbWUvanZ3b25nL1Byb2plY3RzL3NoZWxsYWMvc2hlbGxhYy5uby1pcC5jYS9zb3VyY2Uvc2hlbGxhYy9zdGF0aWMvc2hlbGxhYy9qcy9zcmMvYXVkaW8uanMiLCIvaG9tZS9qdndvbmcvUHJvamVjdHMvc2hlbGxhYy9zaGVsbGFjLm5vLWlwLmNhL3NvdXJjZS9zaGVsbGFjL3N0YXRpYy9zaGVsbGFjL2pzL3NyYy9tYWluLmpzIiwiL2hvbWUvanZ3b25nL1Byb2plY3RzL3NoZWxsYWMvc2hlbGxhYy5uby1pcC5jYS9zb3VyY2Uvc2hlbGxhYy9zdGF0aWMvc2hlbGxhYy9qcy9zcmMvc2hlbGxhYy5qcyIsIi9ob21lL2p2d29uZy9Qcm9qZWN0cy9zaGVsbGFjL3NoZWxsYWMubm8taXAuY2Evc291cmNlL3NoZWxsYWMvc3RhdGljL3NoZWxsYWMvanMvc3JjL3V0aWwuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUNBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN4N0xBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMxeUZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDaitEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM5UUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ1hBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMvWEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCIvKiogQGxpY2Vuc2VcclxuICpcclxuICogU291bmRNYW5hZ2VyIDI6IEphdmFTY3JpcHQgU291bmQgZm9yIHRoZSBXZWJcclxuICogLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxyXG4gKiBodHRwOi8vc2NoaWxsbWFuaWEuY29tL3Byb2plY3RzL3NvdW5kbWFuYWdlcjIvXHJcbiAqXHJcbiAqIENvcHlyaWdodCAoYykgMjAwNywgU2NvdHQgU2NoaWxsZXIuIEFsbCByaWdodHMgcmVzZXJ2ZWQuXHJcbiAqIENvZGUgcHJvdmlkZWQgdW5kZXIgdGhlIEJTRCBMaWNlbnNlOlxyXG4gKiBodHRwOi8vc2NoaWxsbWFuaWEuY29tL3Byb2plY3RzL3NvdW5kbWFuYWdlcjIvbGljZW5zZS50eHRcclxuICpcclxuICogVjIuOTdhLjIwMTQwOTAxXHJcbiAqL1xyXG5cclxuLypnbG9iYWwgd2luZG93LCBTTTJfREVGRVIsIHNtMkRlYnVnZ2VyLCBjb25zb2xlLCBkb2N1bWVudCwgbmF2aWdhdG9yLCBzZXRUaW1lb3V0LCBzZXRJbnRlcnZhbCwgY2xlYXJJbnRlcnZhbCwgQXVkaW8sIG9wZXJhLCBtb2R1bGUsIGRlZmluZSAqL1xyXG4vKmpzbGludCByZWdleHA6IHRydWUsIHNsb3BweTogdHJ1ZSwgd2hpdGU6IHRydWUsIG5vbWVuOiB0cnVlLCBwbHVzcGx1czogdHJ1ZSwgdG9kbzogdHJ1ZSAqL1xyXG5cclxuLyoqXHJcbiAqIEFib3V0IHRoaXMgZmlsZVxyXG4gKiAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXHJcbiAqIFRoaXMgaXMgdGhlIGZ1bGx5LWNvbW1lbnRlZCBzb3VyY2UgdmVyc2lvbiBvZiB0aGUgU291bmRNYW5hZ2VyIDIgQVBJLFxyXG4gKiByZWNvbW1lbmRlZCBmb3IgdXNlIGR1cmluZyBkZXZlbG9wbWVudCBhbmQgdGVzdGluZy5cclxuICpcclxuICogU2VlIHNvdW5kbWFuYWdlcjItbm9kZWJ1Zy1qc21pbi5qcyBmb3IgYW4gb3B0aW1pemVkIGJ1aWxkICh+MTFLQiB3aXRoIGd6aXAuKVxyXG4gKiBodHRwOi8vc2NoaWxsbWFuaWEuY29tL3Byb2plY3RzL3NvdW5kbWFuYWdlcjIvZG9jL2dldHN0YXJ0ZWQvI2Jhc2ljLWluY2x1c2lvblxyXG4gKiBBbHRlcm5hdGVseSwgc2VydmUgdGhpcyBmaWxlIHdpdGggZ3ppcCBmb3IgNzUlIGNvbXByZXNzaW9uIHNhdmluZ3MgKH4zMEtCIG92ZXIgSFRUUC4pXHJcbiAqXHJcbiAqIFlvdSBtYXkgbm90aWNlIDxkPiBhbmQgPC9kPiBjb21tZW50cyBpbiB0aGlzIHNvdXJjZTsgdGhlc2UgYXJlIGRlbGltaXRlcnMgZm9yXHJcbiAqIGRlYnVnIGJsb2NrcyB3aGljaCBhcmUgcmVtb3ZlZCBpbiB0aGUgLW5vZGVidWcgYnVpbGRzLCBmdXJ0aGVyIG9wdGltaXppbmcgY29kZSBzaXplLlxyXG4gKlxyXG4gKiBBbHNvLCBhcyB5b3UgbWF5IG5vdGU6IFdob2EsIHJlbGlhYmxlIGNyb3NzLXBsYXRmb3JtL2RldmljZSBhdWRpbyBzdXBwb3J0IGlzIGhhcmQhIDspXHJcbiAqL1xyXG5cclxuKGZ1bmN0aW9uKHdpbmRvdywgX3VuZGVmaW5lZCkge1xyXG5cclxuXCJ1c2Ugc3RyaWN0XCI7XHJcblxyXG5pZiAoIXdpbmRvdyB8fCAhd2luZG93LmRvY3VtZW50KSB7XHJcblxyXG4gIC8vIERvbid0IGNyb3NzIHRoZSBbZW52aXJvbm1lbnRdIHN0cmVhbXMuIFNNMiBleHBlY3RzIHRvIGJlIHJ1bm5pbmcgaW4gYSBicm93c2VyLCBub3QgdW5kZXIgbm9kZS5qcyBldGMuXHJcbiAgLy8gQWRkaXRpb25hbGx5LCBpZiBhIGJyb3dzZXIgc29tZWhvdyBtYW5hZ2VzIHRvIGZhaWwgdGhpcyB0ZXN0LCBhcyBFZ29uIHNhaWQ6IFwiSXQgd291bGQgYmUgYmFkLlwiXHJcblxyXG4gIHRocm93IG5ldyBFcnJvcignU291bmRNYW5hZ2VyIHJlcXVpcmVzIGEgYnJvd3NlciB3aXRoIHdpbmRvdyBhbmQgZG9jdW1lbnQgb2JqZWN0cy4nKTtcclxuXHJcbn1cclxuXHJcbnZhciBzb3VuZE1hbmFnZXIgPSBudWxsO1xyXG5cclxuLyoqXHJcbiAqIFRoZSBTb3VuZE1hbmFnZXIgY29uc3RydWN0b3IuXHJcbiAqXHJcbiAqIEBjb25zdHJ1Y3RvclxyXG4gKiBAcGFyYW0ge3N0cmluZ30gc21VUkwgT3B0aW9uYWw6IFBhdGggdG8gU1dGIGZpbGVzXHJcbiAqIEBwYXJhbSB7c3RyaW5nfSBzbUlEIE9wdGlvbmFsOiBUaGUgSUQgdG8gdXNlIGZvciB0aGUgU1dGIGNvbnRhaW5lciBlbGVtZW50XHJcbiAqIEB0aGlzIHtTb3VuZE1hbmFnZXJ9XHJcbiAqIEByZXR1cm4ge1NvdW5kTWFuYWdlcn0gVGhlIG5ldyBTb3VuZE1hbmFnZXIgaW5zdGFuY2VcclxuICovXHJcblxyXG5mdW5jdGlvbiBTb3VuZE1hbmFnZXIoc21VUkwsIHNtSUQpIHtcclxuXHJcbiAgLyoqXHJcbiAgICogc291bmRNYW5hZ2VyIGNvbmZpZ3VyYXRpb24gb3B0aW9ucyBsaXN0XHJcbiAgICogZGVmaW5lcyB0b3AtbGV2ZWwgY29uZmlndXJhdGlvbiBwcm9wZXJ0aWVzIHRvIGJlIGFwcGxpZWQgdG8gdGhlIHNvdW5kTWFuYWdlciBpbnN0YW5jZSAoZWcuIHNvdW5kTWFuYWdlci5mbGFzaFZlcnNpb24pXHJcbiAgICogdG8gc2V0IHRoZXNlIHByb3BlcnRpZXMsIHVzZSB0aGUgc2V0dXAoKSBtZXRob2QgLSBlZy4sIHNvdW5kTWFuYWdlci5zZXR1cCh7dXJsOiAnL3N3Zi8nLCBmbGFzaFZlcnNpb246IDl9KVxyXG4gICAqL1xyXG5cclxuICB0aGlzLnNldHVwT3B0aW9ucyA9IHtcclxuXHJcbiAgICAndXJsJzogKHNtVVJMIHx8IG51bGwpLCAgICAgICAgICAgICAvLyBwYXRoIChkaXJlY3RvcnkpIHdoZXJlIFNvdW5kTWFuYWdlciAyIFNXRnMgZXhpc3QsIGVnLiwgL3BhdGgvdG8vc3dmcy9cclxuICAgICdmbGFzaFZlcnNpb24nOiA4LCAgICAgICAgICAgICAgICAgIC8vIGZsYXNoIGJ1aWxkIHRvIHVzZSAoOCBvciA5LikgU29tZSBBUEkgZmVhdHVyZXMgcmVxdWlyZSA5LlxyXG4gICAgJ2RlYnVnTW9kZSc6IHRydWUsICAgICAgICAgICAgICAgICAgLy8gZW5hYmxlIGRlYnVnZ2luZyBvdXRwdXQgKGNvbnNvbGUubG9nKCkgd2l0aCBIVE1MIGZhbGxiYWNrKVxyXG4gICAgJ2RlYnVnRmxhc2gnOiBmYWxzZSwgICAgICAgICAgICAgICAgLy8gZW5hYmxlIGRlYnVnZ2luZyBvdXRwdXQgaW5zaWRlIFNXRiwgdHJvdWJsZXNob290IEZsYXNoL2Jyb3dzZXIgaXNzdWVzXHJcbiAgICAndXNlQ29uc29sZSc6IHRydWUsICAgICAgICAgICAgICAgICAvLyB1c2UgY29uc29sZS5sb2coKSBpZiBhdmFpbGFibGUgKG90aGVyd2lzZSwgd3JpdGVzIHRvICNzb3VuZG1hbmFnZXItZGVidWcgZWxlbWVudClcclxuICAgICdjb25zb2xlT25seSc6IHRydWUsICAgICAgICAgICAgICAgIC8vIGlmIGNvbnNvbGUgaXMgYmVpbmcgdXNlZCwgZG8gbm90IGNyZWF0ZS93cml0ZSB0byAjc291bmRtYW5hZ2VyLWRlYnVnXHJcbiAgICAnd2FpdEZvcldpbmRvd0xvYWQnOiBmYWxzZSwgICAgICAgICAvLyBmb3JjZSBTTTIgdG8gd2FpdCBmb3Igd2luZG93Lm9ubG9hZCgpIGJlZm9yZSB0cnlpbmcgdG8gY2FsbCBzb3VuZE1hbmFnZXIub25sb2FkKClcclxuICAgICdiZ0NvbG9yJzogJyNmZmZmZmYnLCAgICAgICAgICAgICAgIC8vIFNXRiBiYWNrZ3JvdW5kIGNvbG9yLiBOL0Egd2hlbiB3bW9kZSA9ICd0cmFuc3BhcmVudCdcclxuICAgICd1c2VIaWdoUGVyZm9ybWFuY2UnOiBmYWxzZSwgICAgICAgIC8vIHBvc2l0aW9uOmZpeGVkIGZsYXNoIG1vdmllIGNhbiBoZWxwIGluY3JlYXNlIGpzL2ZsYXNoIHNwZWVkLCBtaW5pbWl6ZSBsYWdcclxuICAgICdmbGFzaFBvbGxpbmdJbnRlcnZhbCc6IG51bGwsICAgICAgIC8vIG1zZWMgYWZmZWN0aW5nIHdoaWxlcGxheWluZy9sb2FkaW5nIGNhbGxiYWNrIGZyZXF1ZW5jeS4gSWYgbnVsbCwgZGVmYXVsdCBvZiA1MCBtc2VjIGlzIHVzZWQuXHJcbiAgICAnaHRtbDVQb2xsaW5nSW50ZXJ2YWwnOiBudWxsLCAgICAgICAvLyBtc2VjIGFmZmVjdGluZyB3aGlsZXBsYXlpbmcoKSBmb3IgSFRNTDUgYXVkaW8sIGV4Y2x1ZGluZyBtb2JpbGUgZGV2aWNlcy4gSWYgbnVsbCwgbmF0aXZlIEhUTUw1IHVwZGF0ZSBldmVudHMgYXJlIHVzZWQuXHJcbiAgICAnZmxhc2hMb2FkVGltZW91dCc6IDEwMDAsICAgICAgICAgICAvLyBtc2VjIHRvIHdhaXQgZm9yIGZsYXNoIG1vdmllIHRvIGxvYWQgYmVmb3JlIGZhaWxpbmcgKDAgPSBpbmZpbml0eSlcclxuICAgICd3bW9kZSc6IG51bGwsICAgICAgICAgICAgICAgICAgICAgIC8vIGZsYXNoIHJlbmRlcmluZyBtb2RlIC0gbnVsbCwgJ3RyYW5zcGFyZW50Jywgb3IgJ29wYXF1ZScgKGxhc3QgdHdvIGFsbG93IHotaW5kZXggdG8gd29yaylcclxuICAgICdhbGxvd1NjcmlwdEFjY2Vzcyc6ICdhbHdheXMnLCAgICAgIC8vIGZvciBzY3JpcHRpbmcgdGhlIFNXRiAob2JqZWN0L2VtYmVkIHByb3BlcnR5KSwgJ2Fsd2F5cycgb3IgJ3NhbWVEb21haW4nXHJcbiAgICAndXNlRmxhc2hCbG9jayc6IGZhbHNlLCAgICAgICAgICAgICAvLyAqcmVxdWlyZXMgZmxhc2hibG9jay5jc3MsIHNlZSBkZW1vcyogLSBhbGxvdyByZWNvdmVyeSBmcm9tIGZsYXNoIGJsb2NrZXJzLiBXYWl0IGluZGVmaW5pdGVseSBhbmQgYXBwbHkgdGltZW91dCBDU1MgdG8gU1dGLCBpZiBhcHBsaWNhYmxlLlxyXG4gICAgJ3VzZUhUTUw1QXVkaW8nOiB0cnVlLCAgICAgICAgICAgICAgLy8gdXNlIEhUTUw1IEF1ZGlvKCkgd2hlcmUgQVBJIGlzIHN1cHBvcnRlZCAobW9zdCBTYWZhcmksIENocm9tZSB2ZXJzaW9ucyksIEZpcmVmb3ggKG5vIE1QMy9NUDQuKSBJZGVhbGx5LCB0cmFuc3BhcmVudCB2cy4gRmxhc2ggQVBJIHdoZXJlIHBvc3NpYmxlLlxyXG4gICAgJ2h0bWw1VGVzdCc6IC9eKHByb2JhYmx5fG1heWJlKSQvaSwgLy8gSFRNTDUgQXVkaW8oKSBmb3JtYXQgc3VwcG9ydCB0ZXN0LiBVc2UgL15wcm9iYWJseSQvaTsgaWYgeW91IHdhbnQgdG8gYmUgbW9yZSBjb25zZXJ2YXRpdmUuXHJcbiAgICAncHJlZmVyRmxhc2gnOiBmYWxzZSwgICAgICAgICAgICAgICAvLyBvdmVycmlkZXMgdXNlSFRNTDVhdWRpbywgd2lsbCB1c2UgRmxhc2ggZm9yIE1QMy9NUDQvQUFDIGlmIHByZXNlbnQuIFBvdGVudGlhbCBvcHRpb24gaWYgSFRNTDUgcGxheWJhY2sgd2l0aCB0aGVzZSBmb3JtYXRzIGlzIHF1aXJreS5cclxuICAgICdub1NXRkNhY2hlJzogZmFsc2UsICAgICAgICAgICAgICAgIC8vIGlmIHRydWUsIGFwcGVuZHMgP3RzPXtkYXRlfSB0byBicmVhayBhZ2dyZXNzaXZlIFNXRiBjYWNoaW5nLlxyXG4gICAgJ2lkUHJlZml4JzogJ3NvdW5kJyAgICAgICAgICAgICAgICAgLy8gaWYgYW4gaWQgaXMgbm90IHByb3ZpZGVkIHRvIGNyZWF0ZVNvdW5kKCksIHRoaXMgcHJlZml4IGlzIHVzZWQgZm9yIGdlbmVyYXRlZCBJRHMgLSAnc291bmQwJywgJ3NvdW5kMScgZXRjLlxyXG5cclxuICB9O1xyXG5cclxuICB0aGlzLmRlZmF1bHRPcHRpb25zID0ge1xyXG5cclxuICAgIC8qKlxyXG4gICAgICogdGhlIGRlZmF1bHQgY29uZmlndXJhdGlvbiBmb3Igc291bmQgb2JqZWN0cyBtYWRlIHdpdGggY3JlYXRlU291bmQoKSBhbmQgcmVsYXRlZCBtZXRob2RzXHJcbiAgICAgKiBlZy4sIHZvbHVtZSwgYXV0by1sb2FkIGJlaGF2aW91ciBhbmQgc28gZm9ydGhcclxuICAgICAqL1xyXG5cclxuICAgICdhdXRvTG9hZCc6IGZhbHNlLCAgICAgICAgLy8gZW5hYmxlIGF1dG9tYXRpYyBsb2FkaW5nIChvdGhlcndpc2UgLmxvYWQoKSB3aWxsIGJlIGNhbGxlZCBvbiBkZW1hbmQgd2l0aCAucGxheSgpLCB0aGUgbGF0dGVyIGJlaW5nIG5pY2VyIG9uIGJhbmR3aWR0aCAtIGlmIHlvdSB3YW50IHRvIC5sb2FkIHlvdXJzZWxmLCB5b3UgYWxzbyBjYW4pXHJcbiAgICAnYXV0b1BsYXknOiBmYWxzZSwgICAgICAgIC8vIGVuYWJsZSBwbGF5aW5nIG9mIGZpbGUgYXMgc29vbiBhcyBwb3NzaWJsZSAobXVjaCBmYXN0ZXIgaWYgXCJzdHJlYW1cIiBpcyB0cnVlKVxyXG4gICAgJ2Zyb20nOiBudWxsLCAgICAgICAgICAgICAvLyBwb3NpdGlvbiB0byBzdGFydCBwbGF5YmFjayB3aXRoaW4gYSBzb3VuZCAobXNlYyksIGRlZmF1bHQgPSBiZWdpbm5pbmdcclxuICAgICdsb29wcyc6IDEsICAgICAgICAgICAgICAgLy8gaG93IG1hbnkgdGltZXMgdG8gcmVwZWF0IHRoZSBzb3VuZCAocG9zaXRpb24gd2lsbCB3cmFwIGFyb3VuZCB0byAwLCBzZXRQb3NpdGlvbigpIHdpbGwgYnJlYWsgb3V0IG9mIGxvb3Agd2hlbiA+MClcclxuICAgICdvbmlkMyc6IG51bGwsICAgICAgICAgICAgLy8gY2FsbGJhY2sgZnVuY3Rpb24gZm9yIFwiSUQzIGRhdGEgaXMgYWRkZWQvYXZhaWxhYmxlXCJcclxuICAgICdvbmxvYWQnOiBudWxsLCAgICAgICAgICAgLy8gY2FsbGJhY2sgZnVuY3Rpb24gZm9yIFwibG9hZCBmaW5pc2hlZFwiXHJcbiAgICAnd2hpbGVsb2FkaW5nJzogbnVsbCwgICAgIC8vIGNhbGxiYWNrIGZ1bmN0aW9uIGZvciBcImRvd25sb2FkIHByb2dyZXNzIHVwZGF0ZVwiIChYIG9mIFkgYnl0ZXMgcmVjZWl2ZWQpXHJcbiAgICAnb25wbGF5JzogbnVsbCwgICAgICAgICAgIC8vIGNhbGxiYWNrIGZvciBcInBsYXlcIiBzdGFydFxyXG4gICAgJ29ucGF1c2UnOiBudWxsLCAgICAgICAgICAvLyBjYWxsYmFjayBmb3IgXCJwYXVzZVwiXHJcbiAgICAnb25yZXN1bWUnOiBudWxsLCAgICAgICAgIC8vIGNhbGxiYWNrIGZvciBcInJlc3VtZVwiIChwYXVzZSB0b2dnbGUpXHJcbiAgICAnd2hpbGVwbGF5aW5nJzogbnVsbCwgICAgIC8vIGNhbGxiYWNrIGR1cmluZyBwbGF5IChwb3NpdGlvbiB1cGRhdGUpXHJcbiAgICAnb25wb3NpdGlvbic6IG51bGwsICAgICAgIC8vIG9iamVjdCBjb250YWluaW5nIHRpbWVzIGFuZCBmdW5jdGlvbiBjYWxsYmFja3MgZm9yIHBvc2l0aW9ucyBvZiBpbnRlcmVzdFxyXG4gICAgJ29uc3RvcCc6IG51bGwsICAgICAgICAgICAvLyBjYWxsYmFjayBmb3IgXCJ1c2VyIHN0b3BcIlxyXG4gICAgJ29uZmFpbHVyZSc6IG51bGwsICAgICAgICAvLyBjYWxsYmFjayBmdW5jdGlvbiBmb3Igd2hlbiBwbGF5aW5nIGZhaWxzXHJcbiAgICAnb25maW5pc2gnOiBudWxsLCAgICAgICAgIC8vIGNhbGxiYWNrIGZ1bmN0aW9uIGZvciBcInNvdW5kIGZpbmlzaGVkIHBsYXlpbmdcIlxyXG4gICAgJ211bHRpU2hvdCc6IHRydWUsICAgICAgICAvLyBsZXQgc291bmRzIFwicmVzdGFydFwiIG9yIGxheWVyIG9uIHRvcCBvZiBlYWNoIG90aGVyIHdoZW4gcGxheWVkIG11bHRpcGxlIHRpbWVzLCByYXRoZXIgdGhhbiBvbmUtc2hvdC9vbmUgYXQgYSB0aW1lXHJcbiAgICAnbXVsdGlTaG90RXZlbnRzJzogZmFsc2UsIC8vIGZpcmUgbXVsdGlwbGUgc291bmQgZXZlbnRzIChjdXJyZW50bHkgb25maW5pc2goKSBvbmx5KSB3aGVuIG11bHRpU2hvdCBpcyBlbmFibGVkXHJcbiAgICAncG9zaXRpb24nOiBudWxsLCAgICAgICAgIC8vIG9mZnNldCAobWlsbGlzZWNvbmRzKSB0byBzZWVrIHRvIHdpdGhpbiBsb2FkZWQgc291bmQgZGF0YS5cclxuICAgICdwYW4nOiAwLCAgICAgICAgICAgICAgICAgLy8gXCJwYW5cIiBzZXR0aW5ncywgbGVmdC10by1yaWdodCwgLTEwMCB0byAxMDBcclxuICAgICdzdHJlYW0nOiB0cnVlLCAgICAgICAgICAgLy8gYWxsb3dzIHBsYXlpbmcgYmVmb3JlIGVudGlyZSBmaWxlIGhhcyBsb2FkZWQgKHJlY29tbWVuZGVkKVxyXG4gICAgJ3RvJzogbnVsbCwgICAgICAgICAgICAgICAvLyBwb3NpdGlvbiB0byBlbmQgcGxheWJhY2sgd2l0aGluIGEgc291bmQgKG1zZWMpLCBkZWZhdWx0ID0gZW5kXHJcbiAgICAndHlwZSc6IG51bGwsICAgICAgICAgICAgIC8vIE1JTUUtbGlrZSBoaW50IGZvciBmaWxlIHBhdHRlcm4gLyBjYW5QbGF5KCkgdGVzdHMsIGVnLiBhdWRpby9tcDNcclxuICAgICd1c2VQb2xpY3lGaWxlJzogZmFsc2UsICAgLy8gZW5hYmxlIGNyb3NzZG9tYWluLnhtbCByZXF1ZXN0IGZvciBhdWRpbyBvbiByZW1vdGUgZG9tYWlucyAoZm9yIElEMy93YXZlZm9ybSBhY2Nlc3MpXHJcbiAgICAndm9sdW1lJzogMTAwICAgICAgICAgICAgIC8vIHNlbGYtZXhwbGFuYXRvcnkuIDAtMTAwLCB0aGUgbGF0dGVyIGJlaW5nIHRoZSBtYXguXHJcblxyXG4gIH07XHJcblxyXG4gIHRoaXMuZmxhc2g5T3B0aW9ucyA9IHtcclxuXHJcbiAgICAvKipcclxuICAgICAqIGZsYXNoIDktb25seSBvcHRpb25zLFxyXG4gICAgICogbWVyZ2VkIGludG8gZGVmYXVsdE9wdGlvbnMgaWYgZmxhc2ggOSBpcyBiZWluZyB1c2VkXHJcbiAgICAgKi9cclxuXHJcbiAgICAnaXNNb3ZpZVN0YXInOiBudWxsLCAgICAgIC8vIFwiTW92aWVTdGFyXCIgTVBFRzQgYXVkaW8gbW9kZS4gTnVsbCAoZGVmYXVsdCkgPSBhdXRvIGRldGVjdCBNUDQsIEFBQyBldGMuIGJhc2VkIG9uIFVSTC4gdHJ1ZSA9IGZvcmNlIG9uLCBpZ25vcmUgVVJMXHJcbiAgICAndXNlUGVha0RhdGEnOiBmYWxzZSwgICAgIC8vIGVuYWJsZSBsZWZ0L3JpZ2h0IGNoYW5uZWwgcGVhayAobGV2ZWwpIGRhdGFcclxuICAgICd1c2VXYXZlZm9ybURhdGEnOiBmYWxzZSwgLy8gZW5hYmxlIHNvdW5kIHNwZWN0cnVtIChyYXcgd2F2ZWZvcm0gZGF0YSkgLSBOT1RFOiBNYXkgaW5jcmVhc2UgQ1BVIGxvYWQuXHJcbiAgICAndXNlRVFEYXRhJzogZmFsc2UsICAgICAgIC8vIGVuYWJsZSBzb3VuZCBFUSAoZnJlcXVlbmN5IHNwZWN0cnVtIGRhdGEpIC0gTk9URTogTWF5IGluY3JlYXNlIENQVSBsb2FkLlxyXG4gICAgJ29uYnVmZmVyY2hhbmdlJzogbnVsbCwgICAvLyBjYWxsYmFjayBmb3IgXCJpc0J1ZmZlcmluZ1wiIHByb3BlcnR5IGNoYW5nZVxyXG4gICAgJ29uZGF0YWVycm9yJzogbnVsbCAgICAgICAvLyBjYWxsYmFjayBmb3Igd2F2ZWZvcm0vZXEgZGF0YSBhY2Nlc3MgZXJyb3IgKGZsYXNoIHBsYXlpbmcgYXVkaW8gaW4gb3RoZXIgdGFicy9kb21haW5zKVxyXG5cclxuICB9O1xyXG5cclxuICB0aGlzLm1vdmllU3Rhck9wdGlvbnMgPSB7XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBmbGFzaCA5LjByMTE1KyBNUEVHNCBhdWRpbyBvcHRpb25zLFxyXG4gICAgICogbWVyZ2VkIGludG8gZGVmYXVsdE9wdGlvbnMgaWYgZmxhc2ggOSttb3ZpZVN0YXIgbW9kZSBpcyBlbmFibGVkXHJcbiAgICAgKi9cclxuXHJcbiAgICAnYnVmZmVyVGltZSc6IDMsICAgICAgICAgIC8vIHNlY29uZHMgb2YgZGF0YSB0byBidWZmZXIgYmVmb3JlIHBsYXliYWNrIGJlZ2lucyAobnVsbCA9IGZsYXNoIGRlZmF1bHQgb2YgMC4xIHNlY29uZHMgLSBpZiBBQUMgcGxheWJhY2sgaXMgZ2FwcHksIHRyeSBpbmNyZWFzaW5nLilcclxuICAgICdzZXJ2ZXJVUkwnOiBudWxsLCAgICAgICAgLy8gcnRtcDogRk1TIG9yIEZNSVMgc2VydmVyIHRvIGNvbm5lY3QgdG8sIHJlcXVpcmVkIHdoZW4gcmVxdWVzdGluZyBtZWRpYSB2aWEgUlRNUCBvciBvbmUgb2YgaXRzIHZhcmlhbnRzXHJcbiAgICAnb25jb25uZWN0JzogbnVsbCwgICAgICAgIC8vIHJ0bXA6IGNhbGxiYWNrIGZvciBjb25uZWN0aW9uIHRvIGZsYXNoIG1lZGlhIHNlcnZlclxyXG4gICAgJ2R1cmF0aW9uJzogbnVsbCAgICAgICAgICAvLyBydG1wOiBzb25nIGR1cmF0aW9uIChtc2VjKVxyXG5cclxuICB9O1xyXG5cclxuICB0aGlzLmF1ZGlvRm9ybWF0cyA9IHtcclxuXHJcbiAgICAvKipcclxuICAgICAqIGRldGVybWluZXMgSFRNTDUgc3VwcG9ydCArIGZsYXNoIHJlcXVpcmVtZW50cy5cclxuICAgICAqIGlmIG5vIHN1cHBvcnQgKHZpYSBmbGFzaCBhbmQvb3IgSFRNTDUpIGZvciBhIFwicmVxdWlyZWRcIiBmb3JtYXQsIFNNMiB3aWxsIGZhaWwgdG8gc3RhcnQuXHJcbiAgICAgKiBmbGFzaCBmYWxsYmFjayBpcyB1c2VkIGZvciBNUDMgb3IgTVA0IGlmIEhUTUw1IGNhbid0IHBsYXkgaXQgKG9yIGlmIHByZWZlckZsYXNoID0gdHJ1ZSlcclxuICAgICAqL1xyXG5cclxuICAgICdtcDMnOiB7XHJcbiAgICAgICd0eXBlJzogWydhdWRpby9tcGVnOyBjb2RlY3M9XCJtcDNcIicsICdhdWRpby9tcGVnJywgJ2F1ZGlvL21wMycsICdhdWRpby9NUEEnLCAnYXVkaW8vbXBhLXJvYnVzdCddLFxyXG4gICAgICAncmVxdWlyZWQnOiB0cnVlXHJcbiAgICB9LFxyXG5cclxuICAgICdtcDQnOiB7XHJcbiAgICAgICdyZWxhdGVkJzogWydhYWMnLCdtNGEnLCdtNGInXSwgLy8gYWRkaXRpb25hbCBmb3JtYXRzIHVuZGVyIHRoZSBNUDQgY29udGFpbmVyXHJcbiAgICAgICd0eXBlJzogWydhdWRpby9tcDQ7IGNvZGVjcz1cIm1wNGEuNDAuMlwiJywgJ2F1ZGlvL2FhYycsICdhdWRpby94LW00YScsICdhdWRpby9NUDRBLUxBVE0nLCAnYXVkaW8vbXBlZzQtZ2VuZXJpYyddLFxyXG4gICAgICAncmVxdWlyZWQnOiBmYWxzZVxyXG4gICAgfSxcclxuXHJcbiAgICAnb2dnJzoge1xyXG4gICAgICAndHlwZSc6IFsnYXVkaW8vb2dnOyBjb2RlY3M9dm9yYmlzJ10sXHJcbiAgICAgICdyZXF1aXJlZCc6IGZhbHNlXHJcbiAgICB9LFxyXG5cclxuICAgICdvcHVzJzoge1xyXG4gICAgICAndHlwZSc6IFsnYXVkaW8vb2dnOyBjb2RlY3M9b3B1cycsICdhdWRpby9vcHVzJ10sXHJcbiAgICAgICdyZXF1aXJlZCc6IGZhbHNlXHJcbiAgICB9LFxyXG5cclxuICAgICd3YXYnOiB7XHJcbiAgICAgICd0eXBlJzogWydhdWRpby93YXY7IGNvZGVjcz1cIjFcIicsICdhdWRpby93YXYnLCAnYXVkaW8vd2F2ZScsICdhdWRpby94LXdhdiddLFxyXG4gICAgICAncmVxdWlyZWQnOiBmYWxzZVxyXG4gICAgfVxyXG5cclxuICB9O1xyXG5cclxuICAvLyBIVE1MIGF0dHJpYnV0ZXMgKGlkICsgY2xhc3MgbmFtZXMpIGZvciB0aGUgU1dGIGNvbnRhaW5lclxyXG5cclxuICB0aGlzLm1vdmllSUQgPSAnc20yLWNvbnRhaW5lcic7XHJcbiAgdGhpcy5pZCA9IChzbUlEIHx8ICdzbTJtb3ZpZScpO1xyXG5cclxuICB0aGlzLmRlYnVnSUQgPSAnc291bmRtYW5hZ2VyLWRlYnVnJztcclxuICB0aGlzLmRlYnVnVVJMUGFyYW0gPSAvKFsjPyZdKWRlYnVnPTEvaTtcclxuXHJcbiAgLy8gZHluYW1pYyBhdHRyaWJ1dGVzXHJcblxyXG4gIHRoaXMudmVyc2lvbk51bWJlciA9ICdWMi45N2EuMjAxNDA5MDEnO1xyXG4gIHRoaXMudmVyc2lvbiA9IG51bGw7XHJcbiAgdGhpcy5tb3ZpZVVSTCA9IG51bGw7XHJcbiAgdGhpcy5hbHRVUkwgPSBudWxsO1xyXG4gIHRoaXMuc3dmTG9hZGVkID0gZmFsc2U7XHJcbiAgdGhpcy5lbmFibGVkID0gZmFsc2U7XHJcbiAgdGhpcy5vTUMgPSBudWxsO1xyXG4gIHRoaXMuc291bmRzID0ge307XHJcbiAgdGhpcy5zb3VuZElEcyA9IFtdO1xyXG4gIHRoaXMubXV0ZWQgPSBmYWxzZTtcclxuICB0aGlzLmRpZEZsYXNoQmxvY2sgPSBmYWxzZTtcclxuICB0aGlzLmZpbGVQYXR0ZXJuID0gbnVsbDtcclxuXHJcbiAgdGhpcy5maWxlUGF0dGVybnMgPSB7XHJcblxyXG4gICAgJ2ZsYXNoOCc6IC9cXC5tcDMoXFw/LiopPyQvaSxcclxuICAgICdmbGFzaDknOiAvXFwubXAzKFxcPy4qKT8kL2lcclxuXHJcbiAgfTtcclxuXHJcbiAgLy8gc3VwcG9ydCBpbmRpY2F0b3JzLCBzZXQgYXQgaW5pdFxyXG5cclxuICB0aGlzLmZlYXR1cmVzID0ge1xyXG5cclxuICAgICdidWZmZXJpbmcnOiBmYWxzZSxcclxuICAgICdwZWFrRGF0YSc6IGZhbHNlLFxyXG4gICAgJ3dhdmVmb3JtRGF0YSc6IGZhbHNlLFxyXG4gICAgJ2VxRGF0YSc6IGZhbHNlLFxyXG4gICAgJ21vdmllU3Rhcic6IGZhbHNlXHJcblxyXG4gIH07XHJcblxyXG4gIC8vIGZsYXNoIHNhbmRib3ggaW5mbywgdXNlZCBwcmltYXJpbHkgaW4gdHJvdWJsZXNob290aW5nXHJcblxyXG4gIHRoaXMuc2FuZGJveCA9IHtcclxuXHJcbiAgICAvLyA8ZD5cclxuICAgICd0eXBlJzogbnVsbCxcclxuICAgICd0eXBlcyc6IHtcclxuICAgICAgJ3JlbW90ZSc6ICdyZW1vdGUgKGRvbWFpbi1iYXNlZCkgcnVsZXMnLFxyXG4gICAgICAnbG9jYWxXaXRoRmlsZSc6ICdsb2NhbCB3aXRoIGZpbGUgYWNjZXNzIChubyBpbnRlcm5ldCBhY2Nlc3MpJyxcclxuICAgICAgJ2xvY2FsV2l0aE5ldHdvcmsnOiAnbG9jYWwgd2l0aCBuZXR3b3JrIChpbnRlcm5ldCBhY2Nlc3Mgb25seSwgbm8gbG9jYWwgYWNjZXNzKScsXHJcbiAgICAgICdsb2NhbFRydXN0ZWQnOiAnbG9jYWwsIHRydXN0ZWQgKGxvY2FsK2ludGVybmV0IGFjY2VzcyknXHJcbiAgICB9LFxyXG4gICAgJ2Rlc2NyaXB0aW9uJzogbnVsbCxcclxuICAgICdub1JlbW90ZSc6IG51bGwsXHJcbiAgICAnbm9Mb2NhbCc6IG51bGxcclxuICAgIC8vIDwvZD5cclxuXHJcbiAgfTtcclxuXHJcbiAgLyoqXHJcbiAgICogZm9ybWF0IHN1cHBvcnQgKGh0bWw1L2ZsYXNoKVxyXG4gICAqIHN0b3JlcyBjYW5QbGF5VHlwZSgpIHJlc3VsdHMgYmFzZWQgb24gYXVkaW9Gb3JtYXRzLlxyXG4gICAqIGVnLiB7IG1wMzogYm9vbGVhbiwgbXA0OiBib29sZWFuIH1cclxuICAgKiB0cmVhdCBhcyByZWFkLW9ubHkuXHJcbiAgICovXHJcblxyXG4gIHRoaXMuaHRtbDUgPSB7XHJcbiAgICAndXNpbmdGbGFzaCc6IG51bGwgLy8gc2V0IGlmL3doZW4gZmxhc2ggZmFsbGJhY2sgaXMgbmVlZGVkXHJcbiAgfTtcclxuXHJcbiAgLy8gZmlsZSB0eXBlIHN1cHBvcnQgaGFzaFxyXG4gIHRoaXMuZmxhc2ggPSB7fTtcclxuXHJcbiAgLy8gZGV0ZXJtaW5lZCBhdCBpbml0IHRpbWVcclxuICB0aGlzLmh0bWw1T25seSA9IGZhbHNlO1xyXG5cclxuICAvLyB1c2VkIGZvciBzcGVjaWFsIGNhc2VzIChlZy4gaVBhZC9pUGhvbmUvcGFsbSBPUz8pXHJcbiAgdGhpcy5pZ25vcmVGbGFzaCA9IGZhbHNlO1xyXG5cclxuICAvKipcclxuICAgKiBhIGZldyBwcml2YXRlIGludGVybmFscyAoT0ssIGEgbG90LiA6RClcclxuICAgKi9cclxuXHJcbiAgdmFyIFNNU291bmQsXHJcbiAgc20yID0gdGhpcywgZ2xvYmFsSFRNTDVBdWRpbyA9IG51bGwsIGZsYXNoID0gbnVsbCwgc20gPSAnc291bmRNYW5hZ2VyJywgc21jID0gc20gKyAnOiAnLCBoNSA9ICdIVE1MNTo6JywgaWQsIHVhID0gbmF2aWdhdG9yLnVzZXJBZ2VudCwgd2wgPSB3aW5kb3cubG9jYXRpb24uaHJlZi50b1N0cmluZygpLCBkb2MgPSBkb2N1bWVudCwgZG9Ob3RoaW5nLCBzZXRQcm9wZXJ0aWVzLCBpbml0LCBmViwgb25fcXVldWUgPSBbXSwgZGVidWdPcGVuID0gdHJ1ZSwgZGVidWdUUywgZGlkQXBwZW5kID0gZmFsc2UsIGFwcGVuZFN1Y2Nlc3MgPSBmYWxzZSwgZGlkSW5pdCA9IGZhbHNlLCBkaXNhYmxlZCA9IGZhbHNlLCB3aW5kb3dMb2FkZWQgPSBmYWxzZSwgX3dEUywgd2RDb3VudCA9IDAsIGluaXRDb21wbGV0ZSwgbWl4aW4sIGFzc2lnbiwgZXh0cmFPcHRpb25zLCBhZGRPbkV2ZW50LCBwcm9jZXNzT25FdmVudHMsIGluaXRVc2VyT25sb2FkLCBkZWxheVdhaXRGb3JFSSwgd2FpdEZvckVJLCByZWJvb3RJbnRvSFRNTDUsIHNldFZlcnNpb25JbmZvLCBoYW5kbGVGb2N1cywgc3RyaW5ncywgaW5pdE1vdmllLCBwcmVJbml0LCBkb21Db250ZW50TG9hZGVkLCB3aW5PbkxvYWQsIGRpZERDTG9hZGVkLCBnZXREb2N1bWVudCwgY3JlYXRlTW92aWUsIGNhdGNoRXJyb3IsIHNldFBvbGxpbmcsIGluaXREZWJ1ZywgZGVidWdMZXZlbHMgPSBbJ2xvZycsICdpbmZvJywgJ3dhcm4nLCAnZXJyb3InXSwgZGVmYXVsdEZsYXNoVmVyc2lvbiA9IDgsIGRpc2FibGVPYmplY3QsIGZhaWxTYWZlbHksIG5vcm1hbGl6ZU1vdmllVVJMLCBvUmVtb3ZlZCA9IG51bGwsIG9SZW1vdmVkSFRNTCA9IG51bGwsIHN0ciwgZmxhc2hCbG9ja0hhbmRsZXIsIGdldFNXRkNTUywgc3dmQ1NTLCB0b2dnbGVEZWJ1ZywgbG9vcEZpeCwgcG9saWN5Rml4LCBjb21wbGFpbiwgaWRDaGVjaywgd2FpdGluZ0ZvckVJID0gZmFsc2UsIGluaXRQZW5kaW5nID0gZmFsc2UsIHN0YXJ0VGltZXIsIHN0b3BUaW1lciwgdGltZXJFeGVjdXRlLCBoNVRpbWVyQ291bnQgPSAwLCBoNUludGVydmFsVGltZXIgPSBudWxsLCBwYXJzZVVSTCwgbWVzc2FnZXMgPSBbXSxcclxuICBjYW5JZ25vcmVGbGFzaCwgbmVlZHNGbGFzaCA9IG51bGwsIGZlYXR1cmVDaGVjaywgaHRtbDVPSywgaHRtbDVDYW5QbGF5LCBodG1sNUV4dCwgaHRtbDVVbmxvYWQsIGRvbUNvbnRlbnRMb2FkZWRJRSwgdGVzdEhUTUw1LCBldmVudCwgc2xpY2UgPSBBcnJheS5wcm90b3R5cGUuc2xpY2UsIHVzZUdsb2JhbEhUTUw1QXVkaW8gPSBmYWxzZSwgbGFzdEdsb2JhbEhUTUw1VVJMLCBoYXNGbGFzaCwgZGV0ZWN0Rmxhc2gsIGJhZFNhZmFyaUZpeCwgaHRtbDVfZXZlbnRzLCBzaG93U3VwcG9ydCwgZmx1c2hNZXNzYWdlcywgd3JhcENhbGxiYWNrLCBpZENvdW50ZXIgPSAwLFxyXG4gIGlzX2lEZXZpY2UgPSB1YS5tYXRjaCgvKGlwYWR8aXBob25lfGlwb2QpL2kpLCBpc0FuZHJvaWQgPSB1YS5tYXRjaCgvYW5kcm9pZC9pKSwgaXNJRSA9IHVhLm1hdGNoKC9tc2llL2kpLCBpc1dlYmtpdCA9IHVhLm1hdGNoKC93ZWJraXQvaSksIGlzU2FmYXJpID0gKHVhLm1hdGNoKC9zYWZhcmkvaSkgJiYgIXVhLm1hdGNoKC9jaHJvbWUvaSkpLCBpc09wZXJhID0gKHVhLm1hdGNoKC9vcGVyYS9pKSksXHJcbiAgbW9iaWxlSFRNTDUgPSAodWEubWF0Y2goLyhtb2JpbGV8cHJlXFwvfHhvb20pL2kpIHx8IGlzX2lEZXZpY2UgfHwgaXNBbmRyb2lkKSxcclxuICBpc0JhZFNhZmFyaSA9ICghd2wubWF0Y2goL3VzZWh0bWw1YXVkaW8vaSkgJiYgIXdsLm1hdGNoKC9zbTJcXC1pZ25vcmViYWR1YS9pKSAmJiBpc1NhZmFyaSAmJiAhdWEubWF0Y2goL3NpbGsvaSkgJiYgdWEubWF0Y2goL09TIFggMTBfNl8oWzMtN10pL2kpKSwgLy8gU2FmYXJpIDQgYW5kIDUgKGV4Y2x1ZGluZyBLaW5kbGUgRmlyZSwgXCJTaWxrXCIpIG9jY2FzaW9uYWxseSBmYWlsIHRvIGxvYWQvcGxheSBIVE1MNSBhdWRpbyBvbiBTbm93IExlb3BhcmQgMTAuNi4zIHRocm91Z2ggMTAuNi43IGR1ZSB0byBidWcocykgaW4gUXVpY2tUaW1lIFggYW5kL29yIG90aGVyIHVuZGVybHlpbmcgZnJhbWV3b3Jrcy4gOi8gQ29uZmlybWVkIGJ1Zy4gaHR0cHM6Ly9idWdzLndlYmtpdC5vcmcvc2hvd19idWcuY2dpP2lkPTMyMTU5XHJcbiAgaGFzQ29uc29sZSA9ICh3aW5kb3cuY29uc29sZSAhPT0gX3VuZGVmaW5lZCAmJiBjb25zb2xlLmxvZyAhPT0gX3VuZGVmaW5lZCksIGlzRm9jdXNlZCA9IChkb2MuaGFzRm9jdXMgIT09IF91bmRlZmluZWQ/ZG9jLmhhc0ZvY3VzKCk6bnVsbCksIHRyeUluaXRPbkZvY3VzID0gKGlzU2FmYXJpICYmIChkb2MuaGFzRm9jdXMgPT09IF91bmRlZmluZWQgfHwgIWRvYy5oYXNGb2N1cygpKSksIG9rVG9EaXNhYmxlID0gIXRyeUluaXRPbkZvY3VzLCBmbGFzaE1JTUUgPSAvKG1wM3xtcDR8bXBhfG00YXxtNGIpL2ksIG1zZWNTY2FsZSA9IDEwMDAsXHJcbiAgZW1wdHlVUkwgPSAnYWJvdXQ6YmxhbmsnLCAvLyBzYWZlIFVSTCB0byB1bmxvYWQsIG9yIGxvYWQgbm90aGluZyBmcm9tIChmbGFzaCA4ICsgbW9zdCBIVE1MNSBVQXMpXHJcbiAgZW1wdHlXQVYgPSAnZGF0YTphdWRpby93YXZlO2Jhc2U2NCwvVWtsR1JpWUFBQUJYUVZaRlptMTBJQkFBQUFBQkFBRUFSS3dBQUloWUFRQUNBQkFBWkdGMFlRSUFBQUQvL3c9PScsIC8vIHRpbnkgV0FWIGZvciBIVE1MNSB1bmxvYWRpbmdcclxuICBvdmVySFRUUCA9IChkb2MubG9jYXRpb24/ZG9jLmxvY2F0aW9uLnByb3RvY29sLm1hdGNoKC9odHRwL2kpOm51bGwpLFxyXG4gIGh0dHAgPSAoIW92ZXJIVFRQID8gJ2h0dHA6LycrJy8nIDogJycpLFxyXG4gIC8vIG1wMywgbXA0LCBhYWMgZXRjLlxyXG4gIG5ldFN0cmVhbU1pbWVUeXBlcyA9IC9eXFxzKmF1ZGlvXFwvKD86eC0pPyg/Om1wZWc0fGFhY3xmbHZ8bW92fG1wNHx8bTR2fG00YXxtNGJ8bXA0dnwzZ3B8M2cyKVxccyooPzokfDspL2ksXHJcbiAgLy8gRmxhc2ggdjkuMHIxMTUrIFwibW92aWVzdGFyXCIgZm9ybWF0c1xyXG4gIG5ldFN0cmVhbVR5cGVzID0gWydtcGVnNCcsICdhYWMnLCAnZmx2JywgJ21vdicsICdtcDQnLCAnbTR2JywgJ2Y0dicsICdtNGEnLCAnbTRiJywgJ21wNHYnLCAnM2dwJywgJzNnMiddLFxyXG4gIG5ldFN0cmVhbVBhdHRlcm4gPSBuZXcgUmVnRXhwKCdcXFxcLignICsgbmV0U3RyZWFtVHlwZXMuam9pbignfCcpICsgJykoXFxcXD8uKik/JCcsICdpJyk7XHJcblxyXG4gIHRoaXMubWltZVBhdHRlcm4gPSAvXlxccyphdWRpb1xcLyg/OngtKT8oPzptcCg/OmVnfDMpKVxccyooPzokfDspL2k7IC8vIGRlZmF1bHQgbXAzIHNldFxyXG5cclxuICAvLyB1c2UgYWx0VVJMIGlmIG5vdCBcIm9ubGluZVwiXHJcbiAgdGhpcy51c2VBbHRVUkwgPSAhb3ZlckhUVFA7XHJcblxyXG4gIHN3ZkNTUyA9IHtcclxuXHJcbiAgICAnc3dmQm94JzogJ3NtMi1vYmplY3QtYm94JyxcclxuICAgICdzd2ZEZWZhdWx0JzogJ21vdmllQ29udGFpbmVyJyxcclxuICAgICdzd2ZFcnJvcic6ICdzd2ZfZXJyb3InLCAvLyBTV0YgbG9hZGVkLCBidXQgU00yIGNvdWxkbid0IHN0YXJ0IChvdGhlciBlcnJvcilcclxuICAgICdzd2ZUaW1lZG91dCc6ICdzd2ZfdGltZWRvdXQnLFxyXG4gICAgJ3N3ZkxvYWRlZCc6ICdzd2ZfbG9hZGVkJyxcclxuICAgICdzd2ZVbmJsb2NrZWQnOiAnc3dmX3VuYmxvY2tlZCcsIC8vIG9yIGxvYWRlZCBPS1xyXG4gICAgJ3NtMkRlYnVnJzogJ3NtMl9kZWJ1ZycsXHJcbiAgICAnaGlnaFBlcmYnOiAnaGlnaF9wZXJmb3JtYW5jZScsXHJcbiAgICAnZmxhc2hEZWJ1Zyc6ICdmbGFzaF9kZWJ1ZydcclxuXHJcbiAgfTtcclxuXHJcbiAgLyoqXHJcbiAgICogYmFzaWMgSFRNTDUgQXVkaW8oKSBzdXBwb3J0IHRlc3RcclxuICAgKiB0cnkuLi5jYXRjaCBiZWNhdXNlIG9mIElFIDkgXCJub3QgaW1wbGVtZW50ZWRcIiBub25zZW5zZVxyXG4gICAqIGh0dHBzOi8vZ2l0aHViLmNvbS9Nb2Rlcm5penIvTW9kZXJuaXpyL2lzc3Vlcy8yMjRcclxuICAgKi9cclxuXHJcbiAgdGhpcy5oYXNIVE1MNSA9IChmdW5jdGlvbigpIHtcclxuICAgIHRyeSB7XHJcbiAgICAgIC8vIG5ldyBBdWRpbyhudWxsKSBmb3Igc3R1cGlkIE9wZXJhIDkuNjQgY2FzZSwgd2hpY2ggdGhyb3dzIG5vdF9lbm91Z2hfYXJndW1lbnRzIGV4Y2VwdGlvbiBvdGhlcndpc2UuXHJcbiAgICAgIHJldHVybiAoQXVkaW8gIT09IF91bmRlZmluZWQgJiYgKGlzT3BlcmEgJiYgb3BlcmEgIT09IF91bmRlZmluZWQgJiYgb3BlcmEudmVyc2lvbigpIDwgMTAgPyBuZXcgQXVkaW8obnVsbCkgOiBuZXcgQXVkaW8oKSkuY2FuUGxheVR5cGUgIT09IF91bmRlZmluZWQpO1xyXG4gICAgfSBjYXRjaChlKSB7XHJcbiAgICAgIHJldHVybiBmYWxzZTtcclxuICAgIH1cclxuICB9KCkpO1xyXG5cclxuICAvKipcclxuICAgKiBQdWJsaWMgU291bmRNYW5hZ2VyIEFQSVxyXG4gICAqIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXHJcbiAgICovXHJcblxyXG4gIC8qKlxyXG4gICAqIENvbmZpZ3VyZXMgdG9wLWxldmVsIHNvdW5kTWFuYWdlciBwcm9wZXJ0aWVzLlxyXG4gICAqXHJcbiAgICogQHBhcmFtIHtvYmplY3R9IG9wdGlvbnMgT3B0aW9uIHBhcmFtZXRlcnMsIGVnLiB7IGZsYXNoVmVyc2lvbjogOSwgdXJsOiAnL3BhdGgvdG8vc3dmcy8nIH1cclxuICAgKiBvbnJlYWR5IGFuZCBvbnRpbWVvdXQgYXJlIGFsc28gYWNjZXB0ZWQgcGFyYW1ldGVycy4gY2FsbCBzb3VuZE1hbmFnZXIuc2V0dXAoKSB0byBzZWUgdGhlIGZ1bGwgbGlzdC5cclxuICAgKi9cclxuXHJcbiAgdGhpcy5zZXR1cCA9IGZ1bmN0aW9uKG9wdGlvbnMpIHtcclxuXHJcbiAgICB2YXIgbm9VUkwgPSAoIXNtMi51cmwpO1xyXG5cclxuICAgIC8vIHdhcm4gaWYgZmxhc2ggb3B0aW9ucyBoYXZlIGFscmVhZHkgYmVlbiBhcHBsaWVkXHJcblxyXG4gICAgaWYgKG9wdGlvbnMgIT09IF91bmRlZmluZWQgJiYgZGlkSW5pdCAmJiBuZWVkc0ZsYXNoICYmIHNtMi5vaygpICYmIChvcHRpb25zLmZsYXNoVmVyc2lvbiAhPT0gX3VuZGVmaW5lZCB8fCBvcHRpb25zLnVybCAhPT0gX3VuZGVmaW5lZCB8fCBvcHRpb25zLmh0bWw1VGVzdCAhPT0gX3VuZGVmaW5lZCkpIHtcclxuICAgICAgY29tcGxhaW4oc3RyKCdzZXR1cExhdGUnKSk7XHJcbiAgICB9XHJcblxyXG4gICAgLy8gVE9ETzogZGVmZXI6IHRydWU/XHJcblxyXG4gICAgYXNzaWduKG9wdGlvbnMpO1xyXG5cclxuICAgIC8vIHNwZWNpYWwgY2FzZSAxOiBcIkxhdGUgc2V0dXBcIi4gU00yIGxvYWRlZCBub3JtYWxseSwgYnV0IHVzZXIgZGlkbid0IGFzc2lnbiBmbGFzaCBVUkwgZWcuLCBzZXR1cCh7dXJsOi4uLn0pIGJlZm9yZSBTTTIgaW5pdC4gVHJlYXQgYXMgZGVsYXllZCBpbml0LlxyXG5cclxuICAgIGlmIChvcHRpb25zKSB7XHJcblxyXG4gICAgICBpZiAobm9VUkwgJiYgZGlkRENMb2FkZWQgJiYgb3B0aW9ucy51cmwgIT09IF91bmRlZmluZWQpIHtcclxuICAgICAgICBzbTIuYmVnaW5EZWxheWVkSW5pdCgpO1xyXG4gICAgICB9XHJcblxyXG4gICAgICAvLyBzcGVjaWFsIGNhc2UgMjogSWYgbGF6eS1sb2FkaW5nIFNNMiAoRE9NQ29udGVudExvYWRlZCBoYXMgYWxyZWFkeSBoYXBwZW5lZCkgYW5kIHVzZXIgY2FsbHMgc2V0dXAoKSB3aXRoIHVybDogcGFyYW1ldGVyLCB0cnkgdG8gaW5pdCBBU0FQLlxyXG5cclxuICAgICAgaWYgKCFkaWREQ0xvYWRlZCAmJiBvcHRpb25zLnVybCAhPT0gX3VuZGVmaW5lZCAmJiBkb2MucmVhZHlTdGF0ZSA9PT0gJ2NvbXBsZXRlJykge1xyXG4gICAgICAgIHNldFRpbWVvdXQoZG9tQ29udGVudExvYWRlZCwgMSk7XHJcbiAgICAgIH1cclxuXHJcbiAgICB9XHJcblxyXG4gICAgcmV0dXJuIHNtMjtcclxuXHJcbiAgfTtcclxuXHJcbiAgdGhpcy5vayA9IGZ1bmN0aW9uKCkge1xyXG5cclxuICAgIHJldHVybiAobmVlZHNGbGFzaCA/IChkaWRJbml0ICYmICFkaXNhYmxlZCkgOiAoc20yLnVzZUhUTUw1QXVkaW8gJiYgc20yLmhhc0hUTUw1KSk7XHJcblxyXG4gIH07XHJcblxyXG4gIHRoaXMuc3VwcG9ydGVkID0gdGhpcy5vazsgLy8gbGVnYWN5XHJcblxyXG4gIHRoaXMuZ2V0TW92aWUgPSBmdW5jdGlvbihzbUlEKSB7XHJcblxyXG4gICAgLy8gc2FmZXR5IG5ldDogc29tZSBvbGQgYnJvd3NlcnMgZGlmZmVyIG9uIFNXRiByZWZlcmVuY2VzLCBwb3NzaWJseSByZWxhdGVkIHRvIEV4dGVybmFsSW50ZXJmYWNlIC8gZmxhc2ggdmVyc2lvblxyXG4gICAgcmV0dXJuIGlkKHNtSUQpIHx8IGRvY1tzbUlEXSB8fCB3aW5kb3dbc21JRF07XHJcblxyXG4gIH07XHJcblxyXG4gIC8qKlxyXG4gICAqIENyZWF0ZXMgYSBTTVNvdW5kIHNvdW5kIG9iamVjdCBpbnN0YW5jZS5cclxuICAgKlxyXG4gICAqIEBwYXJhbSB7b2JqZWN0fSBvT3B0aW9ucyBTb3VuZCBvcHRpb25zIChhdCBtaW5pbXVtLCBpZCBhbmQgdXJsIHBhcmFtZXRlcnMgYXJlIHJlcXVpcmVkLilcclxuICAgKiBAcmV0dXJuIHtvYmplY3R9IFNNU291bmQgVGhlIG5ldyBTTVNvdW5kIG9iamVjdC5cclxuICAgKi9cclxuXHJcbiAgdGhpcy5jcmVhdGVTb3VuZCA9IGZ1bmN0aW9uKG9PcHRpb25zLCBfdXJsKSB7XHJcblxyXG4gICAgdmFyIGNzLCBjc19zdHJpbmcsIG9wdGlvbnMsIG9Tb3VuZCA9IG51bGw7XHJcblxyXG4gICAgLy8gPGQ+XHJcbiAgICBjcyA9IHNtICsgJy5jcmVhdGVTb3VuZCgpOiAnO1xyXG4gICAgY3Nfc3RyaW5nID0gY3MgKyBzdHIoIWRpZEluaXQ/J25vdFJlYWR5Jzonbm90T0snKTtcclxuICAgIC8vIDwvZD5cclxuXHJcbiAgICBpZiAoIWRpZEluaXQgfHwgIXNtMi5vaygpKSB7XHJcbiAgICAgIGNvbXBsYWluKGNzX3N0cmluZyk7XHJcbiAgICAgIHJldHVybiBmYWxzZTtcclxuICAgIH1cclxuXHJcbiAgICBpZiAoX3VybCAhPT0gX3VuZGVmaW5lZCkge1xyXG4gICAgICAvLyBmdW5jdGlvbiBvdmVybG9hZGluZyBpbiBKUyEgOikgLi5hc3N1bWUgc2ltcGxlIGNyZWF0ZVNvdW5kKGlkLCB1cmwpIHVzZSBjYXNlXHJcbiAgICAgIG9PcHRpb25zID0ge1xyXG4gICAgICAgICdpZCc6IG9PcHRpb25zLFxyXG4gICAgICAgICd1cmwnOiBfdXJsXHJcbiAgICAgIH07XHJcbiAgICB9XHJcblxyXG4gICAgLy8gaW5oZXJpdCBmcm9tIGRlZmF1bHRPcHRpb25zXHJcbiAgICBvcHRpb25zID0gbWl4aW4ob09wdGlvbnMpO1xyXG5cclxuICAgIG9wdGlvbnMudXJsID0gcGFyc2VVUkwob3B0aW9ucy51cmwpO1xyXG5cclxuICAgIC8vIGdlbmVyYXRlIGFuIGlkLCBpZiBuZWVkZWQuXHJcbiAgICBpZiAob3B0aW9ucy5pZCA9PT0gdW5kZWZpbmVkKSB7XHJcbiAgICAgIG9wdGlvbnMuaWQgPSBzbTIuc2V0dXBPcHRpb25zLmlkUHJlZml4ICsgKGlkQ291bnRlcisrKTtcclxuICAgIH1cclxuXHJcbiAgICAvLyA8ZD5cclxuICAgIGlmIChvcHRpb25zLmlkLnRvU3RyaW5nKCkuY2hhckF0KDApLm1hdGNoKC9eWzAtOV0kLykpIHtcclxuICAgICAgc20yLl93RChjcyArIHN0cignYmFkSUQnLCBvcHRpb25zLmlkKSwgMik7XHJcbiAgICB9XHJcblxyXG4gICAgc20yLl93RChjcyArIG9wdGlvbnMuaWQgKyAob3B0aW9ucy51cmwgPyAnICgnICsgb3B0aW9ucy51cmwgKyAnKScgOiAnJyksIDEpO1xyXG4gICAgLy8gPC9kPlxyXG5cclxuICAgIGlmIChpZENoZWNrKG9wdGlvbnMuaWQsIHRydWUpKSB7XHJcbiAgICAgIHNtMi5fd0QoY3MgKyBvcHRpb25zLmlkICsgJyBleGlzdHMnLCAxKTtcclxuICAgICAgcmV0dXJuIHNtMi5zb3VuZHNbb3B0aW9ucy5pZF07XHJcbiAgICB9XHJcblxyXG4gICAgZnVuY3Rpb24gbWFrZSgpIHtcclxuXHJcbiAgICAgIG9wdGlvbnMgPSBsb29wRml4KG9wdGlvbnMpO1xyXG4gICAgICBzbTIuc291bmRzW29wdGlvbnMuaWRdID0gbmV3IFNNU291bmQob3B0aW9ucyk7XHJcbiAgICAgIHNtMi5zb3VuZElEcy5wdXNoKG9wdGlvbnMuaWQpO1xyXG4gICAgICByZXR1cm4gc20yLnNvdW5kc1tvcHRpb25zLmlkXTtcclxuXHJcbiAgICB9XHJcblxyXG4gICAgaWYgKGh0bWw1T0sob3B0aW9ucykpIHtcclxuXHJcbiAgICAgIG9Tb3VuZCA9IG1ha2UoKTtcclxuICAgICAgc20yLl93RChvcHRpb25zLmlkICsgJzogVXNpbmcgSFRNTDUnKTtcclxuICAgICAgb1NvdW5kLl9zZXR1cF9odG1sNShvcHRpb25zKTtcclxuXHJcbiAgICB9IGVsc2Uge1xyXG5cclxuICAgICAgaWYgKHNtMi5odG1sNU9ubHkpIHtcclxuICAgICAgICBzbTIuX3dEKG9wdGlvbnMuaWQgKyAnOiBObyBIVE1MNSBzdXBwb3J0IGZvciB0aGlzIHNvdW5kLCBhbmQgbm8gRmxhc2guIEV4aXRpbmcuJyk7XHJcbiAgICAgICAgcmV0dXJuIG1ha2UoKTtcclxuICAgICAgfVxyXG5cclxuICAgICAgLy8gVE9ETzogTW92ZSBIVE1MNS9mbGFzaCBjaGVja3MgaW50byBnZW5lcmljIFVSTCBwYXJzaW5nL2hhbmRsaW5nIGZ1bmN0aW9uLlxyXG5cclxuICAgICAgaWYgKHNtMi5odG1sNS51c2luZ0ZsYXNoICYmIG9wdGlvbnMudXJsICYmIG9wdGlvbnMudXJsLm1hdGNoKC9kYXRhXFw6L2kpKSB7XHJcbiAgICAgICAgLy8gZGF0YTogVVJJcyBub3Qgc3VwcG9ydGVkIGJ5IEZsYXNoLCBlaXRoZXIuXHJcbiAgICAgICAgc20yLl93RChvcHRpb25zLmlkICsgJzogZGF0YTogVVJJcyBub3Qgc3VwcG9ydGVkIHZpYSBGbGFzaC4gRXhpdGluZy4nKTtcclxuICAgICAgICByZXR1cm4gbWFrZSgpO1xyXG4gICAgICB9XHJcblxyXG4gICAgICBpZiAoZlYgPiA4KSB7XHJcbiAgICAgICAgaWYgKG9wdGlvbnMuaXNNb3ZpZVN0YXIgPT09IG51bGwpIHtcclxuICAgICAgICAgIC8vIGF0dGVtcHQgdG8gZGV0ZWN0IE1QRUctNCBmb3JtYXRzXHJcbiAgICAgICAgICBvcHRpb25zLmlzTW92aWVTdGFyID0gISEob3B0aW9ucy5zZXJ2ZXJVUkwgfHwgKG9wdGlvbnMudHlwZSA/IG9wdGlvbnMudHlwZS5tYXRjaChuZXRTdHJlYW1NaW1lVHlwZXMpIDogZmFsc2UpIHx8IChvcHRpb25zLnVybCAmJiBvcHRpb25zLnVybC5tYXRjaChuZXRTdHJlYW1QYXR0ZXJuKSkpO1xyXG4gICAgICAgIH1cclxuICAgICAgICAvLyA8ZD5cclxuICAgICAgICBpZiAob3B0aW9ucy5pc01vdmllU3Rhcikge1xyXG4gICAgICAgICAgc20yLl93RChjcyArICd1c2luZyBNb3ZpZVN0YXIgaGFuZGxpbmcnKTtcclxuICAgICAgICAgIGlmIChvcHRpb25zLmxvb3BzID4gMSkge1xyXG4gICAgICAgICAgICBfd0RTKCdub05TTG9vcCcpO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgICAvLyA8L2Q+XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIG9wdGlvbnMgPSBwb2xpY3lGaXgob3B0aW9ucywgY3MpO1xyXG4gICAgICBvU291bmQgPSBtYWtlKCk7XHJcblxyXG4gICAgICBpZiAoZlYgPT09IDgpIHtcclxuICAgICAgICBmbGFzaC5fY3JlYXRlU291bmQob3B0aW9ucy5pZCwgb3B0aW9ucy5sb29wc3x8MSwgb3B0aW9ucy51c2VQb2xpY3lGaWxlKTtcclxuICAgICAgfSBlbHNlIHtcclxuICAgICAgICBmbGFzaC5fY3JlYXRlU291bmQob3B0aW9ucy5pZCwgb3B0aW9ucy51cmwsIG9wdGlvbnMudXNlUGVha0RhdGEsIG9wdGlvbnMudXNlV2F2ZWZvcm1EYXRhLCBvcHRpb25zLnVzZUVRRGF0YSwgb3B0aW9ucy5pc01vdmllU3RhciwgKG9wdGlvbnMuaXNNb3ZpZVN0YXI/b3B0aW9ucy5idWZmZXJUaW1lOmZhbHNlKSwgb3B0aW9ucy5sb29wc3x8MSwgb3B0aW9ucy5zZXJ2ZXJVUkwsIG9wdGlvbnMuZHVyYXRpb258fG51bGwsIG9wdGlvbnMuYXV0b1BsYXksIHRydWUsIG9wdGlvbnMuYXV0b0xvYWQsIG9wdGlvbnMudXNlUG9saWN5RmlsZSk7XHJcbiAgICAgICAgaWYgKCFvcHRpb25zLnNlcnZlclVSTCkge1xyXG4gICAgICAgICAgLy8gV2UgYXJlIGNvbm5lY3RlZCBpbW1lZGlhdGVseVxyXG4gICAgICAgICAgb1NvdW5kLmNvbm5lY3RlZCA9IHRydWU7XHJcbiAgICAgICAgICBpZiAob3B0aW9ucy5vbmNvbm5lY3QpIHtcclxuICAgICAgICAgICAgb3B0aW9ucy5vbmNvbm5lY3QuYXBwbHkob1NvdW5kKTtcclxuICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIGlmICghb3B0aW9ucy5zZXJ2ZXJVUkwgJiYgKG9wdGlvbnMuYXV0b0xvYWQgfHwgb3B0aW9ucy5hdXRvUGxheSkpIHtcclxuICAgICAgICAvLyBjYWxsIGxvYWQgZm9yIG5vbi1ydG1wIHN0cmVhbXNcclxuICAgICAgICBvU291bmQubG9hZChvcHRpb25zKTtcclxuICAgICAgfVxyXG5cclxuICAgIH1cclxuXHJcbiAgICAvLyBydG1wIHdpbGwgcGxheSBpbiBvbmNvbm5lY3RcclxuICAgIGlmICghb3B0aW9ucy5zZXJ2ZXJVUkwgJiYgb3B0aW9ucy5hdXRvUGxheSkge1xyXG4gICAgICBvU291bmQucGxheSgpO1xyXG4gICAgfVxyXG5cclxuICAgIHJldHVybiBvU291bmQ7XHJcblxyXG4gIH07XHJcblxyXG4gIC8qKlxyXG4gICAqIERlc3Ryb3lzIGEgU01Tb3VuZCBzb3VuZCBvYmplY3QgaW5zdGFuY2UuXHJcbiAgICpcclxuICAgKiBAcGFyYW0ge3N0cmluZ30gc0lEIFRoZSBJRCBvZiB0aGUgc291bmQgdG8gZGVzdHJveVxyXG4gICAqL1xyXG5cclxuICB0aGlzLmRlc3Ryb3lTb3VuZCA9IGZ1bmN0aW9uKHNJRCwgX2JGcm9tU291bmQpIHtcclxuXHJcbiAgICAvLyBleHBsaWNpdGx5IGRlc3Ryb3kgYSBzb3VuZCBiZWZvcmUgbm9ybWFsIHBhZ2UgdW5sb2FkLCBldGMuXHJcblxyXG4gICAgaWYgKCFpZENoZWNrKHNJRCkpIHtcclxuICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgfVxyXG5cclxuICAgIHZhciBvUyA9IHNtMi5zb3VuZHNbc0lEXSwgaTtcclxuXHJcbiAgICAvLyBEaXNhYmxlIGFsbCBjYWxsYmFja3Mgd2hpbGUgdGhlIHNvdW5kIGlzIGJlaW5nIGRlc3Ryb3llZFxyXG4gICAgb1MuX2lPID0ge307XHJcblxyXG4gICAgb1Muc3RvcCgpO1xyXG4gICAgb1MudW5sb2FkKCk7XHJcblxyXG4gICAgZm9yIChpID0gMDsgaSA8IHNtMi5zb3VuZElEcy5sZW5ndGg7IGkrKykge1xyXG4gICAgICBpZiAoc20yLnNvdW5kSURzW2ldID09PSBzSUQpIHtcclxuICAgICAgICBzbTIuc291bmRJRHMuc3BsaWNlKGksIDEpO1xyXG4gICAgICAgIGJyZWFrO1xyXG4gICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgaWYgKCFfYkZyb21Tb3VuZCkge1xyXG4gICAgICAvLyBpZ25vcmUgaWYgYmVpbmcgY2FsbGVkIGZyb20gU01Tb3VuZCBpbnN0YW5jZVxyXG4gICAgICBvUy5kZXN0cnVjdCh0cnVlKTtcclxuICAgIH1cclxuXHJcbiAgICBvUyA9IG51bGw7XHJcbiAgICBkZWxldGUgc20yLnNvdW5kc1tzSURdO1xyXG5cclxuICAgIHJldHVybiB0cnVlO1xyXG5cclxuICB9O1xyXG5cclxuICAvKipcclxuICAgKiBDYWxscyB0aGUgbG9hZCgpIG1ldGhvZCBvZiBhIFNNU291bmQgb2JqZWN0IGJ5IElELlxyXG4gICAqXHJcbiAgICogQHBhcmFtIHtzdHJpbmd9IHNJRCBUaGUgSUQgb2YgdGhlIHNvdW5kXHJcbiAgICogQHBhcmFtIHtvYmplY3R9IG9PcHRpb25zIE9wdGlvbmFsOiBTb3VuZCBvcHRpb25zXHJcbiAgICovXHJcblxyXG4gIHRoaXMubG9hZCA9IGZ1bmN0aW9uKHNJRCwgb09wdGlvbnMpIHtcclxuXHJcbiAgICBpZiAoIWlkQ2hlY2soc0lEKSkge1xyXG4gICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICB9XHJcbiAgICByZXR1cm4gc20yLnNvdW5kc1tzSURdLmxvYWQob09wdGlvbnMpO1xyXG5cclxuICB9O1xyXG5cclxuICAvKipcclxuICAgKiBDYWxscyB0aGUgdW5sb2FkKCkgbWV0aG9kIG9mIGEgU01Tb3VuZCBvYmplY3QgYnkgSUQuXHJcbiAgICpcclxuICAgKiBAcGFyYW0ge3N0cmluZ30gc0lEIFRoZSBJRCBvZiB0aGUgc291bmRcclxuICAgKi9cclxuXHJcbiAgdGhpcy51bmxvYWQgPSBmdW5jdGlvbihzSUQpIHtcclxuXHJcbiAgICBpZiAoIWlkQ2hlY2soc0lEKSkge1xyXG4gICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICB9XHJcbiAgICByZXR1cm4gc20yLnNvdW5kc1tzSURdLnVubG9hZCgpO1xyXG5cclxuICB9O1xyXG5cclxuICAvKipcclxuICAgKiBDYWxscyB0aGUgb25Qb3NpdGlvbigpIG1ldGhvZCBvZiBhIFNNU291bmQgb2JqZWN0IGJ5IElELlxyXG4gICAqXHJcbiAgICogQHBhcmFtIHtzdHJpbmd9IHNJRCBUaGUgSUQgb2YgdGhlIHNvdW5kXHJcbiAgICogQHBhcmFtIHtudW1iZXJ9IG5Qb3NpdGlvbiBUaGUgcG9zaXRpb24gdG8gd2F0Y2ggZm9yXHJcbiAgICogQHBhcmFtIHtmdW5jdGlvbn0gb01ldGhvZCBUaGUgcmVsZXZhbnQgY2FsbGJhY2sgdG8gZmlyZVxyXG4gICAqIEBwYXJhbSB7b2JqZWN0fSBvU2NvcGUgT3B0aW9uYWw6IFRoZSBzY29wZSB0byBhcHBseSB0aGUgY2FsbGJhY2sgdG9cclxuICAgKiBAcmV0dXJuIHtTTVNvdW5kfSBUaGUgU01Tb3VuZCBvYmplY3RcclxuICAgKi9cclxuXHJcbiAgdGhpcy5vblBvc2l0aW9uID0gZnVuY3Rpb24oc0lELCBuUG9zaXRpb24sIG9NZXRob2QsIG9TY29wZSkge1xyXG5cclxuICAgIGlmICghaWRDaGVjayhzSUQpKSB7XHJcbiAgICAgIHJldHVybiBmYWxzZTtcclxuICAgIH1cclxuICAgIHJldHVybiBzbTIuc291bmRzW3NJRF0ub25wb3NpdGlvbihuUG9zaXRpb24sIG9NZXRob2QsIG9TY29wZSk7XHJcblxyXG4gIH07XHJcblxyXG4gIC8vIGxlZ2FjeS9iYWNrd2FyZHMtY29tcGFiaWxpdHk6IGxvd2VyLWNhc2UgbWV0aG9kIG5hbWVcclxuICB0aGlzLm9ucG9zaXRpb24gPSB0aGlzLm9uUG9zaXRpb247XHJcblxyXG4gIC8qKlxyXG4gICAqIENhbGxzIHRoZSBjbGVhck9uUG9zaXRpb24oKSBtZXRob2Qgb2YgYSBTTVNvdW5kIG9iamVjdCBieSBJRC5cclxuICAgKlxyXG4gICAqIEBwYXJhbSB7c3RyaW5nfSBzSUQgVGhlIElEIG9mIHRoZSBzb3VuZFxyXG4gICAqIEBwYXJhbSB7bnVtYmVyfSBuUG9zaXRpb24gVGhlIHBvc2l0aW9uIHRvIHdhdGNoIGZvclxyXG4gICAqIEBwYXJhbSB7ZnVuY3Rpb259IG9NZXRob2QgT3B0aW9uYWw6IFRoZSByZWxldmFudCBjYWxsYmFjayB0byBmaXJlXHJcbiAgICogQHJldHVybiB7U01Tb3VuZH0gVGhlIFNNU291bmQgb2JqZWN0XHJcbiAgICovXHJcblxyXG4gIHRoaXMuY2xlYXJPblBvc2l0aW9uID0gZnVuY3Rpb24oc0lELCBuUG9zaXRpb24sIG9NZXRob2QpIHtcclxuXHJcbiAgICBpZiAoIWlkQ2hlY2soc0lEKSkge1xyXG4gICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICB9XHJcbiAgICByZXR1cm4gc20yLnNvdW5kc1tzSURdLmNsZWFyT25Qb3NpdGlvbihuUG9zaXRpb24sIG9NZXRob2QpO1xyXG5cclxuICB9O1xyXG5cclxuICAvKipcclxuICAgKiBDYWxscyB0aGUgcGxheSgpIG1ldGhvZCBvZiBhIFNNU291bmQgb2JqZWN0IGJ5IElELlxyXG4gICAqXHJcbiAgICogQHBhcmFtIHtzdHJpbmd9IHNJRCBUaGUgSUQgb2YgdGhlIHNvdW5kXHJcbiAgICogQHBhcmFtIHtvYmplY3R9IG9PcHRpb25zIE9wdGlvbmFsOiBTb3VuZCBvcHRpb25zXHJcbiAgICogQHJldHVybiB7U01Tb3VuZH0gVGhlIFNNU291bmQgb2JqZWN0XHJcbiAgICovXHJcblxyXG4gIHRoaXMucGxheSA9IGZ1bmN0aW9uKHNJRCwgb09wdGlvbnMpIHtcclxuXHJcbiAgICB2YXIgcmVzdWx0ID0gbnVsbCxcclxuICAgICAgICAvLyBsZWdhY3kgZnVuY3Rpb24tb3ZlcmxvYWRpbmcgdXNlIGNhc2U6IHBsYXkoJ215U291bmQnLCAnL3BhdGgvdG8vc29tZS5tcDMnKTtcclxuICAgICAgICBvdmVybG9hZGVkID0gKG9PcHRpb25zICYmICEob09wdGlvbnMgaW5zdGFuY2VvZiBPYmplY3QpKTtcclxuXHJcbiAgICBpZiAoIWRpZEluaXQgfHwgIXNtMi5vaygpKSB7XHJcbiAgICAgIGNvbXBsYWluKHNtICsgJy5wbGF5KCk6ICcgKyBzdHIoIWRpZEluaXQ/J25vdFJlYWR5Jzonbm90T0snKSk7XHJcbiAgICAgIHJldHVybiBmYWxzZTtcclxuICAgIH1cclxuXHJcbiAgICBpZiAoIWlkQ2hlY2soc0lELCBvdmVybG9hZGVkKSkge1xyXG5cclxuICAgICAgaWYgKCFvdmVybG9hZGVkKSB7XHJcbiAgICAgICAgLy8gbm8gc291bmQgZm91bmQgZm9yIHRoZSBnaXZlbiBJRC4gQmFpbC5cclxuICAgICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIGlmIChvdmVybG9hZGVkKSB7XHJcbiAgICAgICAgb09wdGlvbnMgPSB7XHJcbiAgICAgICAgICB1cmw6IG9PcHRpb25zXHJcbiAgICAgICAgfTtcclxuICAgICAgfVxyXG5cclxuICAgICAgaWYgKG9PcHRpb25zICYmIG9PcHRpb25zLnVybCkge1xyXG4gICAgICAgIC8vIG92ZXJsb2FkaW5nIHVzZSBjYXNlLCBjcmVhdGUrcGxheTogLnBsYXkoJ3NvbWVJRCcsIHt1cmw6Jy9wYXRoL3RvLm1wMyd9KTtcclxuICAgICAgICBzbTIuX3dEKHNtICsgJy5wbGF5KCk6IEF0dGVtcHRpbmcgdG8gY3JlYXRlIFwiJyArIHNJRCArICdcIicsIDEpO1xyXG4gICAgICAgIG9PcHRpb25zLmlkID0gc0lEO1xyXG4gICAgICAgIHJlc3VsdCA9IHNtMi5jcmVhdGVTb3VuZChvT3B0aW9ucykucGxheSgpO1xyXG4gICAgICB9XHJcblxyXG4gICAgfSBlbHNlIGlmIChvdmVybG9hZGVkKSB7XHJcblxyXG4gICAgICAvLyBleGlzdGluZyBzb3VuZCBvYmplY3QgY2FzZVxyXG4gICAgICBvT3B0aW9ucyA9IHtcclxuICAgICAgICB1cmw6IG9PcHRpb25zXHJcbiAgICAgIH07XHJcblxyXG4gICAgfVxyXG5cclxuICAgIGlmIChyZXN1bHQgPT09IG51bGwpIHtcclxuICAgICAgLy8gZGVmYXVsdCBjYXNlXHJcbiAgICAgIHJlc3VsdCA9IHNtMi5zb3VuZHNbc0lEXS5wbGF5KG9PcHRpb25zKTtcclxuICAgIH1cclxuXHJcbiAgICByZXR1cm4gcmVzdWx0O1xyXG5cclxuICB9O1xyXG5cclxuICB0aGlzLnN0YXJ0ID0gdGhpcy5wbGF5OyAvLyBqdXN0IGZvciBjb252ZW5pZW5jZVxyXG5cclxuICAvKipcclxuICAgKiBDYWxscyB0aGUgc2V0UG9zaXRpb24oKSBtZXRob2Qgb2YgYSBTTVNvdW5kIG9iamVjdCBieSBJRC5cclxuICAgKlxyXG4gICAqIEBwYXJhbSB7c3RyaW5nfSBzSUQgVGhlIElEIG9mIHRoZSBzb3VuZFxyXG4gICAqIEBwYXJhbSB7bnVtYmVyfSBuTXNlY09mZnNldCBQb3NpdGlvbiAobWlsbGlzZWNvbmRzKVxyXG4gICAqIEByZXR1cm4ge1NNU291bmR9IFRoZSBTTVNvdW5kIG9iamVjdFxyXG4gICAqL1xyXG5cclxuICB0aGlzLnNldFBvc2l0aW9uID0gZnVuY3Rpb24oc0lELCBuTXNlY09mZnNldCkge1xyXG5cclxuICAgIGlmICghaWRDaGVjayhzSUQpKSB7XHJcbiAgICAgIHJldHVybiBmYWxzZTtcclxuICAgIH1cclxuICAgIHJldHVybiBzbTIuc291bmRzW3NJRF0uc2V0UG9zaXRpb24obk1zZWNPZmZzZXQpO1xyXG5cclxuICB9O1xyXG5cclxuICAvKipcclxuICAgKiBDYWxscyB0aGUgc3RvcCgpIG1ldGhvZCBvZiBhIFNNU291bmQgb2JqZWN0IGJ5IElELlxyXG4gICAqXHJcbiAgICogQHBhcmFtIHtzdHJpbmd9IHNJRCBUaGUgSUQgb2YgdGhlIHNvdW5kXHJcbiAgICogQHJldHVybiB7U01Tb3VuZH0gVGhlIFNNU291bmQgb2JqZWN0XHJcbiAgICovXHJcblxyXG4gIHRoaXMuc3RvcCA9IGZ1bmN0aW9uKHNJRCkge1xyXG5cclxuICAgIGlmICghaWRDaGVjayhzSUQpKSB7XHJcbiAgICAgIHJldHVybiBmYWxzZTtcclxuICAgIH1cclxuXHJcbiAgICBzbTIuX3dEKHNtICsgJy5zdG9wKCcgKyBzSUQgKyAnKScsIDEpO1xyXG4gICAgcmV0dXJuIHNtMi5zb3VuZHNbc0lEXS5zdG9wKCk7XHJcblxyXG4gIH07XHJcblxyXG4gIC8qKlxyXG4gICAqIFN0b3BzIGFsbCBjdXJyZW50bHktcGxheWluZyBzb3VuZHMuXHJcbiAgICovXHJcblxyXG4gIHRoaXMuc3RvcEFsbCA9IGZ1bmN0aW9uKCkge1xyXG5cclxuICAgIHZhciBvU291bmQ7XHJcbiAgICBzbTIuX3dEKHNtICsgJy5zdG9wQWxsKCknLCAxKTtcclxuXHJcbiAgICBmb3IgKG9Tb3VuZCBpbiBzbTIuc291bmRzKSB7XHJcbiAgICAgIGlmIChzbTIuc291bmRzLmhhc093blByb3BlcnR5KG9Tb3VuZCkpIHtcclxuICAgICAgICAvLyBhcHBseSBvbmx5IHRvIHNvdW5kIG9iamVjdHNcclxuICAgICAgICBzbTIuc291bmRzW29Tb3VuZF0uc3RvcCgpO1xyXG4gICAgICB9XHJcbiAgICB9XHJcblxyXG4gIH07XHJcblxyXG4gIC8qKlxyXG4gICAqIENhbGxzIHRoZSBwYXVzZSgpIG1ldGhvZCBvZiBhIFNNU291bmQgb2JqZWN0IGJ5IElELlxyXG4gICAqXHJcbiAgICogQHBhcmFtIHtzdHJpbmd9IHNJRCBUaGUgSUQgb2YgdGhlIHNvdW5kXHJcbiAgICogQHJldHVybiB7U01Tb3VuZH0gVGhlIFNNU291bmQgb2JqZWN0XHJcbiAgICovXHJcblxyXG4gIHRoaXMucGF1c2UgPSBmdW5jdGlvbihzSUQpIHtcclxuXHJcbiAgICBpZiAoIWlkQ2hlY2soc0lEKSkge1xyXG4gICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICB9XHJcbiAgICByZXR1cm4gc20yLnNvdW5kc1tzSURdLnBhdXNlKCk7XHJcblxyXG4gIH07XHJcblxyXG4gIC8qKlxyXG4gICAqIFBhdXNlcyBhbGwgY3VycmVudGx5LXBsYXlpbmcgc291bmRzLlxyXG4gICAqL1xyXG5cclxuICB0aGlzLnBhdXNlQWxsID0gZnVuY3Rpb24oKSB7XHJcblxyXG4gICAgdmFyIGk7XHJcbiAgICBmb3IgKGkgPSBzbTIuc291bmRJRHMubGVuZ3RoLTE7IGkgPj0gMDsgaS0tKSB7XHJcbiAgICAgIHNtMi5zb3VuZHNbc20yLnNvdW5kSURzW2ldXS5wYXVzZSgpO1xyXG4gICAgfVxyXG5cclxuICB9O1xyXG5cclxuICAvKipcclxuICAgKiBDYWxscyB0aGUgcmVzdW1lKCkgbWV0aG9kIG9mIGEgU01Tb3VuZCBvYmplY3QgYnkgSUQuXHJcbiAgICpcclxuICAgKiBAcGFyYW0ge3N0cmluZ30gc0lEIFRoZSBJRCBvZiB0aGUgc291bmRcclxuICAgKiBAcmV0dXJuIHtTTVNvdW5kfSBUaGUgU01Tb3VuZCBvYmplY3RcclxuICAgKi9cclxuXHJcbiAgdGhpcy5yZXN1bWUgPSBmdW5jdGlvbihzSUQpIHtcclxuXHJcbiAgICBpZiAoIWlkQ2hlY2soc0lEKSkge1xyXG4gICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICB9XHJcbiAgICByZXR1cm4gc20yLnNvdW5kc1tzSURdLnJlc3VtZSgpO1xyXG5cclxuICB9O1xyXG5cclxuICAvKipcclxuICAgKiBSZXN1bWVzIGFsbCBjdXJyZW50bHktcGF1c2VkIHNvdW5kcy5cclxuICAgKi9cclxuXHJcbiAgdGhpcy5yZXN1bWVBbGwgPSBmdW5jdGlvbigpIHtcclxuXHJcbiAgICB2YXIgaTtcclxuICAgIGZvciAoaSA9IHNtMi5zb3VuZElEcy5sZW5ndGgtMTsgaSA+PSAwOyBpLS0pIHtcclxuICAgICAgc20yLnNvdW5kc1tzbTIuc291bmRJRHNbaV1dLnJlc3VtZSgpO1xyXG4gICAgfVxyXG5cclxuICB9O1xyXG5cclxuICAvKipcclxuICAgKiBDYWxscyB0aGUgdG9nZ2xlUGF1c2UoKSBtZXRob2Qgb2YgYSBTTVNvdW5kIG9iamVjdCBieSBJRC5cclxuICAgKlxyXG4gICAqIEBwYXJhbSB7c3RyaW5nfSBzSUQgVGhlIElEIG9mIHRoZSBzb3VuZFxyXG4gICAqIEByZXR1cm4ge1NNU291bmR9IFRoZSBTTVNvdW5kIG9iamVjdFxyXG4gICAqL1xyXG5cclxuICB0aGlzLnRvZ2dsZVBhdXNlID0gZnVuY3Rpb24oc0lEKSB7XHJcblxyXG4gICAgaWYgKCFpZENoZWNrKHNJRCkpIHtcclxuICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgfVxyXG4gICAgcmV0dXJuIHNtMi5zb3VuZHNbc0lEXS50b2dnbGVQYXVzZSgpO1xyXG5cclxuICB9O1xyXG5cclxuICAvKipcclxuICAgKiBDYWxscyB0aGUgc2V0UGFuKCkgbWV0aG9kIG9mIGEgU01Tb3VuZCBvYmplY3QgYnkgSUQuXHJcbiAgICpcclxuICAgKiBAcGFyYW0ge3N0cmluZ30gc0lEIFRoZSBJRCBvZiB0aGUgc291bmRcclxuICAgKiBAcGFyYW0ge251bWJlcn0gblBhbiBUaGUgcGFuIHZhbHVlICgtMTAwIHRvIDEwMClcclxuICAgKiBAcmV0dXJuIHtTTVNvdW5kfSBUaGUgU01Tb3VuZCBvYmplY3RcclxuICAgKi9cclxuXHJcbiAgdGhpcy5zZXRQYW4gPSBmdW5jdGlvbihzSUQsIG5QYW4pIHtcclxuXHJcbiAgICBpZiAoIWlkQ2hlY2soc0lEKSkge1xyXG4gICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICB9XHJcbiAgICByZXR1cm4gc20yLnNvdW5kc1tzSURdLnNldFBhbihuUGFuKTtcclxuXHJcbiAgfTtcclxuXHJcbiAgLyoqXHJcbiAgICogQ2FsbHMgdGhlIHNldFZvbHVtZSgpIG1ldGhvZCBvZiBhIFNNU291bmQgb2JqZWN0IGJ5IElELlxyXG4gICAqXHJcbiAgICogQHBhcmFtIHtzdHJpbmd9IHNJRCBUaGUgSUQgb2YgdGhlIHNvdW5kXHJcbiAgICogQHBhcmFtIHtudW1iZXJ9IG5Wb2wgVGhlIHZvbHVtZSB2YWx1ZSAoMCB0byAxMDApXHJcbiAgICogQHJldHVybiB7U01Tb3VuZH0gVGhlIFNNU291bmQgb2JqZWN0XHJcbiAgICovXHJcblxyXG4gIHRoaXMuc2V0Vm9sdW1lID0gZnVuY3Rpb24oc0lELCBuVm9sKSB7XHJcblxyXG4gICAgaWYgKCFpZENoZWNrKHNJRCkpIHtcclxuICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgfVxyXG4gICAgcmV0dXJuIHNtMi5zb3VuZHNbc0lEXS5zZXRWb2x1bWUoblZvbCk7XHJcblxyXG4gIH07XHJcblxyXG4gIC8qKlxyXG4gICAqIENhbGxzIHRoZSBtdXRlKCkgbWV0aG9kIG9mIGVpdGhlciBhIHNpbmdsZSBTTVNvdW5kIG9iamVjdCBieSBJRCwgb3IgYWxsIHNvdW5kIG9iamVjdHMuXHJcbiAgICpcclxuICAgKiBAcGFyYW0ge3N0cmluZ30gc0lEIE9wdGlvbmFsOiBUaGUgSUQgb2YgdGhlIHNvdW5kIChpZiBvbWl0dGVkLCBhbGwgc291bmRzIHdpbGwgYmUgdXNlZC4pXHJcbiAgICovXHJcblxyXG4gIHRoaXMubXV0ZSA9IGZ1bmN0aW9uKHNJRCkge1xyXG5cclxuICAgIHZhciBpID0gMDtcclxuXHJcbiAgICBpZiAoc0lEIGluc3RhbmNlb2YgU3RyaW5nKSB7XHJcbiAgICAgIHNJRCA9IG51bGw7XHJcbiAgICB9XHJcblxyXG4gICAgaWYgKCFzSUQpIHtcclxuXHJcbiAgICAgIHNtMi5fd0Qoc20gKyAnLm11dGUoKTogTXV0aW5nIGFsbCBzb3VuZHMnKTtcclxuICAgICAgZm9yIChpID0gc20yLnNvdW5kSURzLmxlbmd0aC0xOyBpID49IDA7IGktLSkge1xyXG4gICAgICAgIHNtMi5zb3VuZHNbc20yLnNvdW5kSURzW2ldXS5tdXRlKCk7XHJcbiAgICAgIH1cclxuICAgICAgc20yLm11dGVkID0gdHJ1ZTtcclxuXHJcbiAgICB9IGVsc2Uge1xyXG5cclxuICAgICAgaWYgKCFpZENoZWNrKHNJRCkpIHtcclxuICAgICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICAgIH1cclxuICAgICAgc20yLl93RChzbSArICcubXV0ZSgpOiBNdXRpbmcgXCInICsgc0lEICsgJ1wiJyk7XHJcbiAgICAgIHJldHVybiBzbTIuc291bmRzW3NJRF0ubXV0ZSgpO1xyXG5cclxuICAgIH1cclxuXHJcbiAgICByZXR1cm4gdHJ1ZTtcclxuXHJcbiAgfTtcclxuXHJcbiAgLyoqXHJcbiAgICogTXV0ZXMgYWxsIHNvdW5kcy5cclxuICAgKi9cclxuXHJcbiAgdGhpcy5tdXRlQWxsID0gZnVuY3Rpb24oKSB7XHJcblxyXG4gICAgc20yLm11dGUoKTtcclxuXHJcbiAgfTtcclxuXHJcbiAgLyoqXHJcbiAgICogQ2FsbHMgdGhlIHVubXV0ZSgpIG1ldGhvZCBvZiBlaXRoZXIgYSBzaW5nbGUgU01Tb3VuZCBvYmplY3QgYnkgSUQsIG9yIGFsbCBzb3VuZCBvYmplY3RzLlxyXG4gICAqXHJcbiAgICogQHBhcmFtIHtzdHJpbmd9IHNJRCBPcHRpb25hbDogVGhlIElEIG9mIHRoZSBzb3VuZCAoaWYgb21pdHRlZCwgYWxsIHNvdW5kcyB3aWxsIGJlIHVzZWQuKVxyXG4gICAqL1xyXG5cclxuICB0aGlzLnVubXV0ZSA9IGZ1bmN0aW9uKHNJRCkge1xyXG5cclxuICAgIHZhciBpO1xyXG5cclxuICAgIGlmIChzSUQgaW5zdGFuY2VvZiBTdHJpbmcpIHtcclxuICAgICAgc0lEID0gbnVsbDtcclxuICAgIH1cclxuXHJcbiAgICBpZiAoIXNJRCkge1xyXG5cclxuICAgICAgc20yLl93RChzbSArICcudW5tdXRlKCk6IFVubXV0aW5nIGFsbCBzb3VuZHMnKTtcclxuICAgICAgZm9yIChpID0gc20yLnNvdW5kSURzLmxlbmd0aC0xOyBpID49IDA7IGktLSkge1xyXG4gICAgICAgIHNtMi5zb3VuZHNbc20yLnNvdW5kSURzW2ldXS51bm11dGUoKTtcclxuICAgICAgfVxyXG4gICAgICBzbTIubXV0ZWQgPSBmYWxzZTtcclxuXHJcbiAgICB9IGVsc2Uge1xyXG5cclxuICAgICAgaWYgKCFpZENoZWNrKHNJRCkpIHtcclxuICAgICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICAgIH1cclxuICAgICAgc20yLl93RChzbSArICcudW5tdXRlKCk6IFVubXV0aW5nIFwiJyArIHNJRCArICdcIicpO1xyXG4gICAgICByZXR1cm4gc20yLnNvdW5kc1tzSURdLnVubXV0ZSgpO1xyXG5cclxuICAgIH1cclxuXHJcbiAgICByZXR1cm4gdHJ1ZTtcclxuXHJcbiAgfTtcclxuXHJcbiAgLyoqXHJcbiAgICogVW5tdXRlcyBhbGwgc291bmRzLlxyXG4gICAqL1xyXG5cclxuICB0aGlzLnVubXV0ZUFsbCA9IGZ1bmN0aW9uKCkge1xyXG5cclxuICAgIHNtMi51bm11dGUoKTtcclxuXHJcbiAgfTtcclxuXHJcbiAgLyoqXHJcbiAgICogQ2FsbHMgdGhlIHRvZ2dsZU11dGUoKSBtZXRob2Qgb2YgYSBTTVNvdW5kIG9iamVjdCBieSBJRC5cclxuICAgKlxyXG4gICAqIEBwYXJhbSB7c3RyaW5nfSBzSUQgVGhlIElEIG9mIHRoZSBzb3VuZFxyXG4gICAqIEByZXR1cm4ge1NNU291bmR9IFRoZSBTTVNvdW5kIG9iamVjdFxyXG4gICAqL1xyXG5cclxuICB0aGlzLnRvZ2dsZU11dGUgPSBmdW5jdGlvbihzSUQpIHtcclxuXHJcbiAgICBpZiAoIWlkQ2hlY2soc0lEKSkge1xyXG4gICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICB9XHJcbiAgICByZXR1cm4gc20yLnNvdW5kc1tzSURdLnRvZ2dsZU11dGUoKTtcclxuXHJcbiAgfTtcclxuXHJcbiAgLyoqXHJcbiAgICogUmV0cmlldmVzIHRoZSBtZW1vcnkgdXNlZCBieSB0aGUgZmxhc2ggcGx1Z2luLlxyXG4gICAqXHJcbiAgICogQHJldHVybiB7bnVtYmVyfSBUaGUgYW1vdW50IG9mIG1lbW9yeSBpbiB1c2VcclxuICAgKi9cclxuXHJcbiAgdGhpcy5nZXRNZW1vcnlVc2UgPSBmdW5jdGlvbigpIHtcclxuXHJcbiAgICAvLyBmbGFzaC1vbmx5XHJcbiAgICB2YXIgcmFtID0gMDtcclxuXHJcbiAgICBpZiAoZmxhc2ggJiYgZlYgIT09IDgpIHtcclxuICAgICAgcmFtID0gcGFyc2VJbnQoZmxhc2guX2dldE1lbW9yeVVzZSgpLCAxMCk7XHJcbiAgICB9XHJcblxyXG4gICAgcmV0dXJuIHJhbTtcclxuXHJcbiAgfTtcclxuXHJcbiAgLyoqXHJcbiAgICogVW5kb2N1bWVudGVkOiBOT1BzIHNvdW5kTWFuYWdlciBhbmQgYWxsIFNNU291bmQgb2JqZWN0cy5cclxuICAgKi9cclxuXHJcbiAgdGhpcy5kaXNhYmxlID0gZnVuY3Rpb24oYk5vRGlzYWJsZSkge1xyXG5cclxuICAgIC8vIGRlc3Ryb3kgYWxsIGZ1bmN0aW9uc1xyXG4gICAgdmFyIGk7XHJcblxyXG4gICAgaWYgKGJOb0Rpc2FibGUgPT09IF91bmRlZmluZWQpIHtcclxuICAgICAgYk5vRGlzYWJsZSA9IGZhbHNlO1xyXG4gICAgfVxyXG5cclxuICAgIGlmIChkaXNhYmxlZCkge1xyXG4gICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICB9XHJcblxyXG4gICAgZGlzYWJsZWQgPSB0cnVlO1xyXG4gICAgX3dEUygnc2h1dGRvd24nLCAxKTtcclxuXHJcbiAgICBmb3IgKGkgPSBzbTIuc291bmRJRHMubGVuZ3RoLTE7IGkgPj0gMDsgaS0tKSB7XHJcbiAgICAgIGRpc2FibGVPYmplY3Qoc20yLnNvdW5kc1tzbTIuc291bmRJRHNbaV1dKTtcclxuICAgIH1cclxuXHJcbiAgICAvLyBmaXJlIFwiY29tcGxldGVcIiwgZGVzcGl0ZSBmYWlsXHJcbiAgICBpbml0Q29tcGxldGUoYk5vRGlzYWJsZSk7XHJcbiAgICBldmVudC5yZW1vdmUod2luZG93LCAnbG9hZCcsIGluaXRVc2VyT25sb2FkKTtcclxuXHJcbiAgICByZXR1cm4gdHJ1ZTtcclxuXHJcbiAgfTtcclxuXHJcbiAgLyoqXHJcbiAgICogRGV0ZXJtaW5lcyBwbGF5YWJpbGl0eSBvZiBhIE1JTUUgdHlwZSwgZWcuICdhdWRpby9tcDMnLlxyXG4gICAqL1xyXG5cclxuICB0aGlzLmNhblBsYXlNSU1FID0gZnVuY3Rpb24oc01JTUUpIHtcclxuXHJcbiAgICB2YXIgcmVzdWx0O1xyXG5cclxuICAgIGlmIChzbTIuaGFzSFRNTDUpIHtcclxuICAgICAgcmVzdWx0ID0gaHRtbDVDYW5QbGF5KHt0eXBlOnNNSU1FfSk7XHJcbiAgICB9XHJcblxyXG4gICAgaWYgKCFyZXN1bHQgJiYgbmVlZHNGbGFzaCkge1xyXG4gICAgICAvLyBpZiBmbGFzaCA5LCB0ZXN0IG5ldFN0cmVhbSAobW92aWVTdGFyKSB0eXBlcyBhcyB3ZWxsLlxyXG4gICAgICByZXN1bHQgPSAoc01JTUUgJiYgc20yLm9rKCkgPyAhISgoZlYgPiA4ID8gc01JTUUubWF0Y2gobmV0U3RyZWFtTWltZVR5cGVzKSA6IG51bGwpIHx8IHNNSU1FLm1hdGNoKHNtMi5taW1lUGF0dGVybikpIDogbnVsbCk7IC8vIFRPRE86IG1ha2UgbGVzcyBcIndlaXJkXCIgKHBlciBKU0xpbnQpXHJcbiAgICB9XHJcblxyXG4gICAgcmV0dXJuIHJlc3VsdDtcclxuXHJcbiAgfTtcclxuXHJcbiAgLyoqXHJcbiAgICogRGV0ZXJtaW5lcyBwbGF5YWJpbGl0eSBvZiBhIFVSTCBiYXNlZCBvbiBhdWRpbyBzdXBwb3J0LlxyXG4gICAqXHJcbiAgICogQHBhcmFtIHtzdHJpbmd9IHNVUkwgVGhlIFVSTCB0byB0ZXN0XHJcbiAgICogQHJldHVybiB7Ym9vbGVhbn0gVVJMIHBsYXlhYmlsaXR5XHJcbiAgICovXHJcblxyXG4gIHRoaXMuY2FuUGxheVVSTCA9IGZ1bmN0aW9uKHNVUkwpIHtcclxuXHJcbiAgICB2YXIgcmVzdWx0O1xyXG5cclxuICAgIGlmIChzbTIuaGFzSFRNTDUpIHtcclxuICAgICAgcmVzdWx0ID0gaHRtbDVDYW5QbGF5KHt1cmw6IHNVUkx9KTtcclxuICAgIH1cclxuXHJcbiAgICBpZiAoIXJlc3VsdCAmJiBuZWVkc0ZsYXNoKSB7XHJcbiAgICAgIHJlc3VsdCA9IChzVVJMICYmIHNtMi5vaygpID8gISEoc1VSTC5tYXRjaChzbTIuZmlsZVBhdHRlcm4pKSA6IG51bGwpO1xyXG4gICAgfVxyXG5cclxuICAgIHJldHVybiByZXN1bHQ7XHJcblxyXG4gIH07XHJcblxyXG4gIC8qKlxyXG4gICAqIERldGVybWluZXMgcGxheWFiaWxpdHkgb2YgYW4gSFRNTCBET00gJmx0O2EmZ3Q7IG9iamVjdCAob3Igc2ltaWxhciBvYmplY3QgbGl0ZXJhbCkgYmFzZWQgb24gYXVkaW8gc3VwcG9ydC5cclxuICAgKlxyXG4gICAqIEBwYXJhbSB7b2JqZWN0fSBvTGluayBhbiBIVE1MIERPTSAmbHQ7YSZndDsgb2JqZWN0IG9yIG9iamVjdCBsaXRlcmFsIGluY2x1ZGluZyBocmVmIGFuZC9vciB0eXBlIGF0dHJpYnV0ZXNcclxuICAgKiBAcmV0dXJuIHtib29sZWFufSBVUkwgcGxheWFiaWxpdHlcclxuICAgKi9cclxuXHJcbiAgdGhpcy5jYW5QbGF5TGluayA9IGZ1bmN0aW9uKG9MaW5rKSB7XHJcblxyXG4gICAgaWYgKG9MaW5rLnR5cGUgIT09IF91bmRlZmluZWQgJiYgb0xpbmsudHlwZSkge1xyXG4gICAgICBpZiAoc20yLmNhblBsYXlNSU1FKG9MaW5rLnR5cGUpKSB7XHJcbiAgICAgICAgcmV0dXJuIHRydWU7XHJcbiAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICByZXR1cm4gc20yLmNhblBsYXlVUkwob0xpbmsuaHJlZik7XHJcblxyXG4gIH07XHJcblxyXG4gIC8qKlxyXG4gICAqIFJldHJpZXZlcyBhIFNNU291bmQgb2JqZWN0IGJ5IElELlxyXG4gICAqXHJcbiAgICogQHBhcmFtIHtzdHJpbmd9IHNJRCBUaGUgSUQgb2YgdGhlIHNvdW5kXHJcbiAgICogQHJldHVybiB7U01Tb3VuZH0gVGhlIFNNU291bmQgb2JqZWN0XHJcbiAgICovXHJcblxyXG4gIHRoaXMuZ2V0U291bmRCeUlkID0gZnVuY3Rpb24oc0lELCBfc3VwcHJlc3NEZWJ1Zykge1xyXG5cclxuICAgIGlmICghc0lEKSB7XHJcbiAgICAgIHJldHVybiBudWxsO1xyXG4gICAgfVxyXG5cclxuICAgIHZhciByZXN1bHQgPSBzbTIuc291bmRzW3NJRF07XHJcblxyXG4gICAgLy8gPGQ+XHJcbiAgICBpZiAoIXJlc3VsdCAmJiAhX3N1cHByZXNzRGVidWcpIHtcclxuICAgICAgc20yLl93RChzbSArICcuZ2V0U291bmRCeUlkKCk6IFNvdW5kIFwiJyArIHNJRCArICdcIiBub3QgZm91bmQuJywgMik7XHJcbiAgICB9XHJcbiAgICAvLyA8L2Q+XHJcblxyXG4gICAgcmV0dXJuIHJlc3VsdDtcclxuXHJcbiAgfTtcclxuXHJcbiAgLyoqXHJcbiAgICogUXVldWVzIGEgY2FsbGJhY2sgZm9yIGV4ZWN1dGlvbiB3aGVuIFNvdW5kTWFuYWdlciBoYXMgc3VjY2Vzc2Z1bGx5IGluaXRpYWxpemVkLlxyXG4gICAqXHJcbiAgICogQHBhcmFtIHtmdW5jdGlvbn0gb01ldGhvZCBUaGUgY2FsbGJhY2sgbWV0aG9kIHRvIGZpcmVcclxuICAgKiBAcGFyYW0ge29iamVjdH0gb1Njb3BlIE9wdGlvbmFsOiBUaGUgc2NvcGUgdG8gYXBwbHkgdG8gdGhlIGNhbGxiYWNrXHJcbiAgICovXHJcblxyXG4gIHRoaXMub25yZWFkeSA9IGZ1bmN0aW9uKG9NZXRob2QsIG9TY29wZSkge1xyXG5cclxuICAgIHZhciBzVHlwZSA9ICdvbnJlYWR5JyxcclxuICAgICAgICByZXN1bHQgPSBmYWxzZTtcclxuXHJcbiAgICBpZiAodHlwZW9mIG9NZXRob2QgPT09ICdmdW5jdGlvbicpIHtcclxuXHJcbiAgICAgIC8vIDxkPlxyXG4gICAgICBpZiAoZGlkSW5pdCkge1xyXG4gICAgICAgIHNtMi5fd0Qoc3RyKCdxdWV1ZScsIHNUeXBlKSk7XHJcbiAgICAgIH1cclxuICAgICAgLy8gPC9kPlxyXG5cclxuICAgICAgaWYgKCFvU2NvcGUpIHtcclxuICAgICAgICBvU2NvcGUgPSB3aW5kb3c7XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIGFkZE9uRXZlbnQoc1R5cGUsIG9NZXRob2QsIG9TY29wZSk7XHJcbiAgICAgIHByb2Nlc3NPbkV2ZW50cygpO1xyXG5cclxuICAgICAgcmVzdWx0ID0gdHJ1ZTtcclxuXHJcbiAgICB9IGVsc2Uge1xyXG5cclxuICAgICAgdGhyb3cgc3RyKCduZWVkRnVuY3Rpb24nLCBzVHlwZSk7XHJcblxyXG4gICAgfVxyXG5cclxuICAgIHJldHVybiByZXN1bHQ7XHJcblxyXG4gIH07XHJcblxyXG4gIC8qKlxyXG4gICAqIFF1ZXVlcyBhIGNhbGxiYWNrIGZvciBleGVjdXRpb24gd2hlbiBTb3VuZE1hbmFnZXIgaGFzIGZhaWxlZCB0byBpbml0aWFsaXplLlxyXG4gICAqXHJcbiAgICogQHBhcmFtIHtmdW5jdGlvbn0gb01ldGhvZCBUaGUgY2FsbGJhY2sgbWV0aG9kIHRvIGZpcmVcclxuICAgKiBAcGFyYW0ge29iamVjdH0gb1Njb3BlIE9wdGlvbmFsOiBUaGUgc2NvcGUgdG8gYXBwbHkgdG8gdGhlIGNhbGxiYWNrXHJcbiAgICovXHJcblxyXG4gIHRoaXMub250aW1lb3V0ID0gZnVuY3Rpb24ob01ldGhvZCwgb1Njb3BlKSB7XHJcblxyXG4gICAgdmFyIHNUeXBlID0gJ29udGltZW91dCcsXHJcbiAgICAgICAgcmVzdWx0ID0gZmFsc2U7XHJcblxyXG4gICAgaWYgKHR5cGVvZiBvTWV0aG9kID09PSAnZnVuY3Rpb24nKSB7XHJcblxyXG4gICAgICAvLyA8ZD5cclxuICAgICAgaWYgKGRpZEluaXQpIHtcclxuICAgICAgICBzbTIuX3dEKHN0cigncXVldWUnLCBzVHlwZSkpO1xyXG4gICAgICB9XHJcbiAgICAgIC8vIDwvZD5cclxuXHJcbiAgICAgIGlmICghb1Njb3BlKSB7XHJcbiAgICAgICAgb1Njb3BlID0gd2luZG93O1xyXG4gICAgICB9XHJcblxyXG4gICAgICBhZGRPbkV2ZW50KHNUeXBlLCBvTWV0aG9kLCBvU2NvcGUpO1xyXG4gICAgICBwcm9jZXNzT25FdmVudHMoe3R5cGU6c1R5cGV9KTtcclxuXHJcbiAgICAgIHJlc3VsdCA9IHRydWU7XHJcblxyXG4gICAgfSBlbHNlIHtcclxuXHJcbiAgICAgIHRocm93IHN0cignbmVlZEZ1bmN0aW9uJywgc1R5cGUpO1xyXG5cclxuICAgIH1cclxuXHJcbiAgICByZXR1cm4gcmVzdWx0O1xyXG5cclxuICB9O1xyXG5cclxuICAvKipcclxuICAgKiBXcml0ZXMgY29uc29sZS5sb2coKS1zdHlsZSBkZWJ1ZyBvdXRwdXQgdG8gYSBjb25zb2xlIG9yIGluLWJyb3dzZXIgZWxlbWVudC5cclxuICAgKiBBcHBsaWVzIHdoZW4gZGVidWdNb2RlID0gdHJ1ZVxyXG4gICAqXHJcbiAgICogQHBhcmFtIHtzdHJpbmd9IHNUZXh0IFRoZSBjb25zb2xlIG1lc3NhZ2VcclxuICAgKiBAcGFyYW0ge29iamVjdH0gblR5cGUgT3B0aW9uYWwgbG9nIGxldmVsIChudW1iZXIpLCBvciBvYmplY3QuIE51bWJlciBjYXNlOiBMb2cgdHlwZS9zdHlsZSB3aGVyZSAwID0gJ2luZm8nLCAxID0gJ3dhcm4nLCAyID0gJ2Vycm9yJy4gT2JqZWN0IGNhc2U6IE9iamVjdCB0byBiZSBkdW1wZWQuXHJcbiAgICovXHJcblxyXG4gIHRoaXMuX3dyaXRlRGVidWcgPSBmdW5jdGlvbihzVGV4dCwgc1R5cGVPck9iamVjdCkge1xyXG5cclxuICAgIC8vIHBzZXVkby1wcml2YXRlIGNvbnNvbGUubG9nKCktc3R5bGUgb3V0cHV0XHJcbiAgICAvLyA8ZD5cclxuXHJcbiAgICB2YXIgc0RJRCA9ICdzb3VuZG1hbmFnZXItZGVidWcnLCBvLCBvSXRlbTtcclxuXHJcbiAgICBpZiAoIXNtMi5kZWJ1Z01vZGUpIHtcclxuICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgfVxyXG5cclxuICAgIGlmIChoYXNDb25zb2xlICYmIHNtMi51c2VDb25zb2xlKSB7XHJcbiAgICAgIGlmIChzVHlwZU9yT2JqZWN0ICYmIHR5cGVvZiBzVHlwZU9yT2JqZWN0ID09PSAnb2JqZWN0Jykge1xyXG4gICAgICAgIC8vIG9iamVjdCBwYXNzZWQ7IGR1bXAgdG8gY29uc29sZS5cclxuICAgICAgICBjb25zb2xlLmxvZyhzVGV4dCwgc1R5cGVPck9iamVjdCk7XHJcbiAgICAgIH0gZWxzZSBpZiAoZGVidWdMZXZlbHNbc1R5cGVPck9iamVjdF0gIT09IF91bmRlZmluZWQpIHtcclxuICAgICAgICBjb25zb2xlW2RlYnVnTGV2ZWxzW3NUeXBlT3JPYmplY3RdXShzVGV4dCk7XHJcbiAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgY29uc29sZS5sb2coc1RleHQpO1xyXG4gICAgICB9XHJcbiAgICAgIGlmIChzbTIuY29uc29sZU9ubHkpIHtcclxuICAgICAgICByZXR1cm4gdHJ1ZTtcclxuICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIG8gPSBpZChzRElEKTtcclxuXHJcbiAgICBpZiAoIW8pIHtcclxuICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgfVxyXG5cclxuICAgIG9JdGVtID0gZG9jLmNyZWF0ZUVsZW1lbnQoJ2RpdicpO1xyXG5cclxuICAgIGlmICgrK3dkQ291bnQgJSAyID09PSAwKSB7XHJcbiAgICAgIG9JdGVtLmNsYXNzTmFtZSA9ICdzbTItYWx0JztcclxuICAgIH1cclxuXHJcbiAgICBpZiAoc1R5cGVPck9iamVjdCA9PT0gX3VuZGVmaW5lZCkge1xyXG4gICAgICBzVHlwZU9yT2JqZWN0ID0gMDtcclxuICAgIH0gZWxzZSB7XHJcbiAgICAgIHNUeXBlT3JPYmplY3QgPSBwYXJzZUludChzVHlwZU9yT2JqZWN0LCAxMCk7XHJcbiAgICB9XHJcblxyXG4gICAgb0l0ZW0uYXBwZW5kQ2hpbGQoZG9jLmNyZWF0ZVRleHROb2RlKHNUZXh0KSk7XHJcblxyXG4gICAgaWYgKHNUeXBlT3JPYmplY3QpIHtcclxuICAgICAgaWYgKHNUeXBlT3JPYmplY3QgPj0gMikge1xyXG4gICAgICAgIG9JdGVtLnN0eWxlLmZvbnRXZWlnaHQgPSAnYm9sZCc7XHJcbiAgICAgIH1cclxuICAgICAgaWYgKHNUeXBlT3JPYmplY3QgPT09IDMpIHtcclxuICAgICAgICBvSXRlbS5zdHlsZS5jb2xvciA9ICcjZmYzMzMzJztcclxuICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIC8vIHRvcC10by1ib3R0b21cclxuICAgIC8vIG8uYXBwZW5kQ2hpbGQob0l0ZW0pO1xyXG5cclxuICAgIC8vIGJvdHRvbS10by10b3BcclxuICAgIG8uaW5zZXJ0QmVmb3JlKG9JdGVtLCBvLmZpcnN0Q2hpbGQpO1xyXG5cclxuICAgIG8gPSBudWxsO1xyXG4gICAgLy8gPC9kPlxyXG5cclxuICAgIHJldHVybiB0cnVlO1xyXG5cclxuICB9O1xyXG5cclxuICAvLyA8ZD5cclxuICAvLyBsYXN0LXJlc29ydCBkZWJ1Z2dpbmcgb3B0aW9uXHJcbiAgaWYgKHdsLmluZGV4T2YoJ3NtMi1kZWJ1Zz1hbGVydCcpICE9PSAtMSkge1xyXG4gICAgdGhpcy5fd3JpdGVEZWJ1ZyA9IGZ1bmN0aW9uKHNUZXh0KSB7XHJcbiAgICAgIHdpbmRvdy5hbGVydChzVGV4dCk7XHJcbiAgICB9O1xyXG4gIH1cclxuICAvLyA8L2Q+XHJcblxyXG4gIC8vIGFsaWFzXHJcbiAgdGhpcy5fd0QgPSB0aGlzLl93cml0ZURlYnVnO1xyXG5cclxuICAvKipcclxuICAgKiBQcm92aWRlcyBkZWJ1ZyAvIHN0YXRlIGluZm9ybWF0aW9uIG9uIGFsbCBTTVNvdW5kIG9iamVjdHMuXHJcbiAgICovXHJcblxyXG4gIHRoaXMuX2RlYnVnID0gZnVuY3Rpb24oKSB7XHJcblxyXG4gICAgLy8gPGQ+XHJcbiAgICB2YXIgaSwgajtcclxuICAgIF93RFMoJ2N1cnJlbnRPYmonLCAxKTtcclxuXHJcbiAgICBmb3IgKGkgPSAwLCBqID0gc20yLnNvdW5kSURzLmxlbmd0aDsgaSA8IGo7IGkrKykge1xyXG4gICAgICBzbTIuc291bmRzW3NtMi5zb3VuZElEc1tpXV0uX2RlYnVnKCk7XHJcbiAgICB9XHJcbiAgICAvLyA8L2Q+XHJcblxyXG4gIH07XHJcblxyXG4gIC8qKlxyXG4gICAqIFJlc3RhcnRzIGFuZCByZS1pbml0aWFsaXplcyB0aGUgU291bmRNYW5hZ2VyIGluc3RhbmNlLlxyXG4gICAqXHJcbiAgICogQHBhcmFtIHtib29sZWFufSByZXNldEV2ZW50cyBPcHRpb25hbDogV2hlbiB0cnVlLCByZW1vdmVzIGFsbCByZWdpc3RlcmVkIG9ucmVhZHkgYW5kIG9udGltZW91dCBldmVudCBjYWxsYmFja3MuXHJcbiAgICogQHBhcmFtIHtib29sZWFufSBleGNsdWRlSW5pdCBPcHRpb25zOiBXaGVuIHRydWUsIGRvZXMgbm90IGNhbGwgYmVnaW5EZWxheWVkSW5pdCgpICh3aGljaCB3b3VsZCByZXN0YXJ0IFNNMikuXHJcbiAgICogQHJldHVybiB7b2JqZWN0fSBzb3VuZE1hbmFnZXIgVGhlIHNvdW5kTWFuYWdlciBpbnN0YW5jZS5cclxuICAgKi9cclxuXHJcbiAgdGhpcy5yZWJvb3QgPSBmdW5jdGlvbihyZXNldEV2ZW50cywgZXhjbHVkZUluaXQpIHtcclxuXHJcbiAgICAvLyByZXNldCBzb21lIChvciBhbGwpIHN0YXRlLCBhbmQgcmUtaW5pdCB1bmxlc3Mgb3RoZXJ3aXNlIHNwZWNpZmllZC5cclxuXHJcbiAgICAvLyA8ZD5cclxuICAgIGlmIChzbTIuc291bmRJRHMubGVuZ3RoKSB7XHJcbiAgICAgIHNtMi5fd0QoJ0Rlc3Ryb3lpbmcgJyArIHNtMi5zb3VuZElEcy5sZW5ndGggKyAnIFNNU291bmQgb2JqZWN0JyArIChzbTIuc291bmRJRHMubGVuZ3RoICE9PSAxID8gJ3MnIDogJycpICsgJy4uLicpO1xyXG4gICAgfVxyXG4gICAgLy8gPC9kPlxyXG5cclxuICAgIHZhciBpLCBqLCBrO1xyXG5cclxuICAgIGZvciAoaSA9IHNtMi5zb3VuZElEcy5sZW5ndGgtMTsgaSA+PSAwOyBpLS0pIHtcclxuICAgICAgc20yLnNvdW5kc1tzbTIuc291bmRJRHNbaV1dLmRlc3RydWN0KCk7XHJcbiAgICB9XHJcblxyXG4gICAgLy8gdHJhc2ggemUgZmxhc2ggKHJlbW92ZSBmcm9tIHRoZSBET00pXHJcblxyXG4gICAgaWYgKGZsYXNoKSB7XHJcblxyXG4gICAgICB0cnkge1xyXG5cclxuICAgICAgICBpZiAoaXNJRSkge1xyXG4gICAgICAgICAgb1JlbW92ZWRIVE1MID0gZmxhc2guaW5uZXJIVE1MO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgb1JlbW92ZWQgPSBmbGFzaC5wYXJlbnROb2RlLnJlbW92ZUNoaWxkKGZsYXNoKTtcclxuXHJcbiAgICAgIH0gY2F0Y2goZSkge1xyXG5cclxuICAgICAgICAvLyBSZW1vdmUgZmFpbGVkPyBNYXkgYmUgZHVlIHRvIGZsYXNoIGJsb2NrZXJzIHNpbGVudGx5IHJlbW92aW5nIHRoZSBTV0Ygb2JqZWN0L2VtYmVkIG5vZGUgZnJvbSB0aGUgRE9NLiBXYXJuIGFuZCBjb250aW51ZS5cclxuXHJcbiAgICAgICAgX3dEUygnYmFkUmVtb3ZlJywgMik7XHJcblxyXG4gICAgICB9XHJcblxyXG4gICAgfVxyXG5cclxuICAgIC8vIGFjdHVhbGx5LCBmb3JjZSByZWNyZWF0ZSBvZiBtb3ZpZS5cclxuXHJcbiAgICBvUmVtb3ZlZEhUTUwgPSBvUmVtb3ZlZCA9IG5lZWRzRmxhc2ggPSBmbGFzaCA9IG51bGw7XHJcblxyXG4gICAgc20yLmVuYWJsZWQgPSBkaWREQ0xvYWRlZCA9IGRpZEluaXQgPSB3YWl0aW5nRm9yRUkgPSBpbml0UGVuZGluZyA9IGRpZEFwcGVuZCA9IGFwcGVuZFN1Y2Nlc3MgPSBkaXNhYmxlZCA9IHVzZUdsb2JhbEhUTUw1QXVkaW8gPSBzbTIuc3dmTG9hZGVkID0gZmFsc2U7XHJcblxyXG4gICAgc20yLnNvdW5kSURzID0gW107XHJcbiAgICBzbTIuc291bmRzID0ge307XHJcblxyXG4gICAgaWRDb3VudGVyID0gMDtcclxuXHJcbiAgICBpZiAoIXJlc2V0RXZlbnRzKSB7XHJcbiAgICAgIC8vIHJlc2V0IGNhbGxiYWNrcyBmb3Igb25yZWFkeSwgb250aW1lb3V0IGV0Yy4gc28gdGhhdCB0aGV5IHdpbGwgZmlyZSBhZ2FpbiBvbiByZS1pbml0XHJcbiAgICAgIGZvciAoaSBpbiBvbl9xdWV1ZSkge1xyXG4gICAgICAgIGlmIChvbl9xdWV1ZS5oYXNPd25Qcm9wZXJ0eShpKSkge1xyXG4gICAgICAgICAgZm9yIChqID0gMCwgayA9IG9uX3F1ZXVlW2ldLmxlbmd0aDsgaiA8IGs7IGorKykge1xyXG4gICAgICAgICAgICBvbl9xdWV1ZVtpXVtqXS5maXJlZCA9IGZhbHNlO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG4gICAgfSBlbHNlIHtcclxuICAgICAgLy8gcmVtb3ZlIGFsbCBjYWxsYmFja3MgZW50aXJlbHlcclxuICAgICAgb25fcXVldWUgPSBbXTtcclxuICAgIH1cclxuXHJcbiAgICAvLyA8ZD5cclxuICAgIGlmICghZXhjbHVkZUluaXQpIHtcclxuICAgICAgc20yLl93RChzbSArICc6IFJlYm9vdGluZy4uLicpO1xyXG4gICAgfVxyXG4gICAgLy8gPC9kPlxyXG5cclxuICAgIC8vIHJlc2V0IEhUTUw1IGFuZCBmbGFzaCBjYW5QbGF5IHRlc3QgcmVzdWx0c1xyXG5cclxuICAgIHNtMi5odG1sNSA9IHtcclxuICAgICAgJ3VzaW5nRmxhc2gnOiBudWxsXHJcbiAgICB9O1xyXG5cclxuICAgIHNtMi5mbGFzaCA9IHt9O1xyXG5cclxuICAgIC8vIHJlc2V0IGRldmljZS1zcGVjaWZpYyBIVE1ML2ZsYXNoIG1vZGUgc3dpdGNoZXNcclxuXHJcbiAgICBzbTIuaHRtbDVPbmx5ID0gZmFsc2U7XHJcbiAgICBzbTIuaWdub3JlRmxhc2ggPSBmYWxzZTtcclxuXHJcbiAgICB3aW5kb3cuc2V0VGltZW91dChmdW5jdGlvbigpIHtcclxuXHJcbiAgICAgIHByZUluaXQoKTtcclxuXHJcbiAgICAgIC8vIGJ5IGRlZmF1bHQsIHJlLWluaXRcclxuXHJcbiAgICAgIGlmICghZXhjbHVkZUluaXQpIHtcclxuICAgICAgICBzbTIuYmVnaW5EZWxheWVkSW5pdCgpO1xyXG4gICAgICB9XHJcblxyXG4gICAgfSwgMjApO1xyXG5cclxuICAgIHJldHVybiBzbTI7XHJcblxyXG4gIH07XHJcblxyXG4gIHRoaXMucmVzZXQgPSBmdW5jdGlvbigpIHtcclxuXHJcbiAgICAvKipcclxuICAgICAqIFNodXRzIGRvd24gYW5kIHJlc3RvcmVzIHRoZSBTb3VuZE1hbmFnZXIgaW5zdGFuY2UgdG8gaXRzIG9yaWdpbmFsIGxvYWRlZCBzdGF0ZSwgd2l0aG91dCBhbiBleHBsaWNpdCByZWJvb3QuIEFsbCBvbnJlYWR5L29udGltZW91dCBoYW5kbGVycyBhcmUgcmVtb3ZlZC5cclxuICAgICAqIEFmdGVyIHRoaXMgY2FsbCwgU00yIG1heSBiZSByZS1pbml0aWFsaXplZCB2aWEgc291bmRNYW5hZ2VyLmJlZ2luRGVsYXllZEluaXQoKS5cclxuICAgICAqIEByZXR1cm4ge29iamVjdH0gc291bmRNYW5hZ2VyIFRoZSBzb3VuZE1hbmFnZXIgaW5zdGFuY2UuXHJcbiAgICAgKi9cclxuXHJcbiAgICBfd0RTKCdyZXNldCcpO1xyXG4gICAgcmV0dXJuIHNtMi5yZWJvb3QodHJ1ZSwgdHJ1ZSk7XHJcblxyXG4gIH07XHJcblxyXG4gIC8qKlxyXG4gICAqIFVuZG9jdW1lbnRlZDogRGV0ZXJtaW5lcyB0aGUgU00yIGZsYXNoIG1vdmllJ3MgbG9hZCBwcm9ncmVzcy5cclxuICAgKlxyXG4gICAqIEByZXR1cm4ge251bWJlciBvciBudWxsfSBQZXJjZW50IGxvYWRlZCwgb3IgaWYgaW52YWxpZC91bnN1cHBvcnRlZCwgbnVsbC5cclxuICAgKi9cclxuXHJcbiAgdGhpcy5nZXRNb3ZpZVBlcmNlbnQgPSBmdW5jdGlvbigpIHtcclxuXHJcbiAgICAvKipcclxuICAgICAqIEludGVyZXN0aW5nIHN5bnRheCBub3Rlcy4uLlxyXG4gICAgICogRmxhc2gvRXh0ZXJuYWxJbnRlcmZhY2UgKEFjdGl2ZVgvTlBBUEkpIGJyaWRnZSBtZXRob2RzIGFyZSBub3QgdHlwZW9mIFwiZnVuY3Rpb25cIiBub3IgaW5zdGFuY2VvZiBGdW5jdGlvbiwgYnV0IGFyZSBzdGlsbCB2YWxpZC5cclxuICAgICAqIEFkZGl0aW9uYWxseSwgSlNMaW50IGRpc2xpa2VzICgnUGVyY2VudExvYWRlZCcgaW4gZmxhc2gpLXN0eWxlIHN5bnRheCBhbmQgcmVjb21tZW5kcyBoYXNPd25Qcm9wZXJ0eSgpLCB3aGljaCBkb2VzIG5vdCB3b3JrIGluIHRoaXMgY2FzZS5cclxuICAgICAqIEZ1cnRoZXJtb3JlLCB1c2luZyAoZmxhc2ggJiYgZmxhc2guUGVyY2VudExvYWRlZCkgY2F1c2VzIElFIHRvIHRocm93IFwib2JqZWN0IGRvZXNuJ3Qgc3VwcG9ydCB0aGlzIHByb3BlcnR5IG9yIG1ldGhvZFwiLlxyXG4gICAgICogVGh1cywgJ2luJyBzeW50YXggbXVzdCBiZSB1c2VkLlxyXG4gICAgICovXHJcblxyXG4gICAgcmV0dXJuIChmbGFzaCAmJiAnUGVyY2VudExvYWRlZCcgaW4gZmxhc2ggPyBmbGFzaC5QZXJjZW50TG9hZGVkKCkgOiBudWxsKTsgLy8gWWVzLCBKU0xpbnQuIFNlZSBuZWFyYnkgY29tbWVudCBpbiBzb3VyY2UgZm9yIGV4cGxhbmF0aW9uLlxyXG5cclxuICB9O1xyXG5cclxuICAvKipcclxuICAgKiBBZGRpdGlvbmFsIGhlbHBlciBmb3IgbWFudWFsbHkgaW52b2tpbmcgU00yJ3MgaW5pdCBwcm9jZXNzIGFmdGVyIERPTSBSZWFkeSAvIHdpbmRvdy5vbmxvYWQoKS5cclxuICAgKi9cclxuXHJcbiAgdGhpcy5iZWdpbkRlbGF5ZWRJbml0ID0gZnVuY3Rpb24oKSB7XHJcblxyXG4gICAgd2luZG93TG9hZGVkID0gdHJ1ZTtcclxuICAgIGRvbUNvbnRlbnRMb2FkZWQoKTtcclxuXHJcbiAgICBzZXRUaW1lb3V0KGZ1bmN0aW9uKCkge1xyXG5cclxuICAgICAgaWYgKGluaXRQZW5kaW5nKSB7XHJcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgICB9XHJcblxyXG4gICAgICBjcmVhdGVNb3ZpZSgpO1xyXG4gICAgICBpbml0TW92aWUoKTtcclxuICAgICAgaW5pdFBlbmRpbmcgPSB0cnVlO1xyXG5cclxuICAgICAgcmV0dXJuIHRydWU7XHJcblxyXG4gICAgfSwgMjApO1xyXG5cclxuICAgIGRlbGF5V2FpdEZvckVJKCk7XHJcblxyXG4gIH07XHJcblxyXG4gIC8qKlxyXG4gICAqIERlc3Ryb3lzIHRoZSBTb3VuZE1hbmFnZXIgaW5zdGFuY2UgYW5kIGFsbCBTTVNvdW5kIGluc3RhbmNlcy5cclxuICAgKi9cclxuXHJcbiAgdGhpcy5kZXN0cnVjdCA9IGZ1bmN0aW9uKCkge1xyXG5cclxuICAgIHNtMi5fd0Qoc20gKyAnLmRlc3RydWN0KCknKTtcclxuICAgIHNtMi5kaXNhYmxlKHRydWUpO1xyXG5cclxuICB9O1xyXG5cclxuICAvKipcclxuICAgKiBTTVNvdW5kKCkgKHNvdW5kIG9iamVjdCkgY29uc3RydWN0b3JcclxuICAgKiAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cclxuICAgKlxyXG4gICAqIEBwYXJhbSB7b2JqZWN0fSBvT3B0aW9ucyBTb3VuZCBvcHRpb25zIChpZCBhbmQgdXJsIGFyZSByZXF1aXJlZCBhdHRyaWJ1dGVzKVxyXG4gICAqIEByZXR1cm4ge1NNU291bmR9IFRoZSBuZXcgU01Tb3VuZCBvYmplY3RcclxuICAgKi9cclxuXHJcbiAgU01Tb3VuZCA9IGZ1bmN0aW9uKG9PcHRpb25zKSB7XHJcblxyXG4gICAgdmFyIHMgPSB0aGlzLCByZXNldFByb3BlcnRpZXMsIGFkZF9odG1sNV9ldmVudHMsIHJlbW92ZV9odG1sNV9ldmVudHMsIHN0b3BfaHRtbDVfdGltZXIsIHN0YXJ0X2h0bWw1X3RpbWVyLCBhdHRhY2hPblBvc2l0aW9uLCBvbnBsYXlfY2FsbGVkID0gZmFsc2UsIG9uUG9zaXRpb25JdGVtcyA9IFtdLCBvblBvc2l0aW9uRmlyZWQgPSAwLCBkZXRhY2hPblBvc2l0aW9uLCBhcHBseUZyb21UbywgbGFzdFVSTCA9IG51bGwsIGxhc3RIVE1MNVN0YXRlLCB1cmxPbWl0dGVkO1xyXG5cclxuICAgIGxhc3RIVE1MNVN0YXRlID0ge1xyXG4gICAgICAvLyB0cmFja3MgZHVyYXRpb24gKyBwb3NpdGlvbiAodGltZSlcclxuICAgICAgZHVyYXRpb246IG51bGwsXHJcbiAgICAgIHRpbWU6IG51bGxcclxuICAgIH07XHJcblxyXG4gICAgdGhpcy5pZCA9IG9PcHRpb25zLmlkO1xyXG5cclxuICAgIC8vIGxlZ2FjeVxyXG4gICAgdGhpcy5zSUQgPSB0aGlzLmlkO1xyXG5cclxuICAgIHRoaXMudXJsID0gb09wdGlvbnMudXJsO1xyXG4gICAgdGhpcy5vcHRpb25zID0gbWl4aW4ob09wdGlvbnMpO1xyXG5cclxuICAgIC8vIHBlci1wbGF5LWluc3RhbmNlLXNwZWNpZmljIG9wdGlvbnNcclxuICAgIHRoaXMuaW5zdGFuY2VPcHRpb25zID0gdGhpcy5vcHRpb25zO1xyXG5cclxuICAgIC8vIHNob3J0IGFsaWFzXHJcbiAgICB0aGlzLl9pTyA9IHRoaXMuaW5zdGFuY2VPcHRpb25zO1xyXG5cclxuICAgIC8vIGFzc2lnbiBwcm9wZXJ0eSBkZWZhdWx0c1xyXG4gICAgdGhpcy5wYW4gPSB0aGlzLm9wdGlvbnMucGFuO1xyXG4gICAgdGhpcy52b2x1bWUgPSB0aGlzLm9wdGlvbnMudm9sdW1lO1xyXG5cclxuICAgIC8vIHdoZXRoZXIgb3Igbm90IHRoaXMgb2JqZWN0IGlzIHVzaW5nIEhUTUw1XHJcbiAgICB0aGlzLmlzSFRNTDUgPSBmYWxzZTtcclxuXHJcbiAgICAvLyBpbnRlcm5hbCBIVE1MNSBBdWRpbygpIG9iamVjdCByZWZlcmVuY2VcclxuICAgIHRoaXMuX2EgPSBudWxsO1xyXG5cclxuICAgIC8vIGZvciBmbGFzaCA4IHNwZWNpYWwtY2FzZSBjcmVhdGVTb3VuZCgpIHdpdGhvdXQgdXJsLCBmb2xsb3dlZCBieSBsb2FkL3BsYXkgd2l0aCB1cmwgY2FzZVxyXG4gICAgdXJsT21pdHRlZCA9ICh0aGlzLnVybCA/IGZhbHNlIDogdHJ1ZSk7XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBTTVNvdW5kKCkgcHVibGljIG1ldGhvZHNcclxuICAgICAqIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxyXG4gICAgICovXHJcblxyXG4gICAgdGhpcy5pZDMgPSB7fTtcclxuXHJcbiAgICAvKipcclxuICAgICAqIFdyaXRlcyBTTVNvdW5kIG9iamVjdCBwYXJhbWV0ZXJzIHRvIGRlYnVnIGNvbnNvbGVcclxuICAgICAqL1xyXG5cclxuICAgIHRoaXMuX2RlYnVnID0gZnVuY3Rpb24oKSB7XHJcblxyXG4gICAgICAvLyA8ZD5cclxuICAgICAgc20yLl93RChzLmlkICsgJzogTWVyZ2VkIG9wdGlvbnM6Jywgcy5vcHRpb25zKTtcclxuICAgICAgLy8gPC9kPlxyXG5cclxuICAgIH07XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBCZWdpbnMgbG9hZGluZyBhIHNvdW5kIHBlciBpdHMgKnVybCouXHJcbiAgICAgKlxyXG4gICAgICogQHBhcmFtIHtvYmplY3R9IG9PcHRpb25zIE9wdGlvbmFsOiBTb3VuZCBvcHRpb25zXHJcbiAgICAgKiBAcmV0dXJuIHtTTVNvdW5kfSBUaGUgU01Tb3VuZCBvYmplY3RcclxuICAgICAqL1xyXG5cclxuICAgIHRoaXMubG9hZCA9IGZ1bmN0aW9uKG9PcHRpb25zKSB7XHJcblxyXG4gICAgICB2YXIgb1NvdW5kID0gbnVsbCwgaW5zdGFuY2VPcHRpb25zO1xyXG5cclxuICAgICAgaWYgKG9PcHRpb25zICE9PSBfdW5kZWZpbmVkKSB7XHJcbiAgICAgICAgcy5faU8gPSBtaXhpbihvT3B0aW9ucywgcy5vcHRpb25zKTtcclxuICAgICAgfSBlbHNlIHtcclxuICAgICAgICBvT3B0aW9ucyA9IHMub3B0aW9ucztcclxuICAgICAgICBzLl9pTyA9IG9PcHRpb25zO1xyXG4gICAgICAgIGlmIChsYXN0VVJMICYmIGxhc3RVUkwgIT09IHMudXJsKSB7XHJcbiAgICAgICAgICBfd0RTKCdtYW5VUkwnKTtcclxuICAgICAgICAgIHMuX2lPLnVybCA9IHMudXJsO1xyXG4gICAgICAgICAgcy51cmwgPSBudWxsO1xyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG5cclxuICAgICAgaWYgKCFzLl9pTy51cmwpIHtcclxuICAgICAgICBzLl9pTy51cmwgPSBzLnVybDtcclxuICAgICAgfVxyXG5cclxuICAgICAgcy5faU8udXJsID0gcGFyc2VVUkwocy5faU8udXJsKTtcclxuXHJcbiAgICAgIC8vIGVuc3VyZSB3ZSdyZSBpbiBzeW5jXHJcbiAgICAgIHMuaW5zdGFuY2VPcHRpb25zID0gcy5faU87XHJcblxyXG4gICAgICAvLyBsb2NhbCBzaG9ydGN1dFxyXG4gICAgICBpbnN0YW5jZU9wdGlvbnMgPSBzLl9pTztcclxuXHJcbiAgICAgIHNtMi5fd0Qocy5pZCArICc6IGxvYWQgKCcgKyBpbnN0YW5jZU9wdGlvbnMudXJsICsgJyknKTtcclxuXHJcbiAgICAgIGlmICghaW5zdGFuY2VPcHRpb25zLnVybCAmJiAhcy51cmwpIHtcclxuICAgICAgICBzbTIuX3dEKHMuaWQgKyAnOiBsb2FkKCk6IHVybCBpcyB1bmFzc2lnbmVkLiBFeGl0aW5nLicsIDIpO1xyXG4gICAgICAgIHJldHVybiBzO1xyXG4gICAgICB9XHJcblxyXG4gICAgICAvLyA8ZD5cclxuICAgICAgaWYgKCFzLmlzSFRNTDUgJiYgZlYgPT09IDggJiYgIXMudXJsICYmICFpbnN0YW5jZU9wdGlvbnMuYXV0b1BsYXkpIHtcclxuICAgICAgICAvLyBmbGFzaCA4IGxvYWQoKSAtPiBwbGF5KCkgd29uJ3Qgd29yayBiZWZvcmUgb25sb2FkIGhhcyBmaXJlZC5cclxuICAgICAgICBzbTIuX3dEKHMuaWQgKyAnOiBGbGFzaCA4IGxvYWQoKSBsaW1pdGF0aW9uOiBXYWl0IGZvciBvbmxvYWQoKSBiZWZvcmUgY2FsbGluZyBwbGF5KCkuJywgMSk7XHJcbiAgICAgIH1cclxuICAgICAgLy8gPC9kPlxyXG5cclxuICAgICAgaWYgKGluc3RhbmNlT3B0aW9ucy51cmwgPT09IHMudXJsICYmIHMucmVhZHlTdGF0ZSAhPT0gMCAmJiBzLnJlYWR5U3RhdGUgIT09IDIpIHtcclxuICAgICAgICBfd0RTKCdvblVSTCcsIDEpO1xyXG4gICAgICAgIC8vIGlmIGxvYWRlZCBhbmQgYW4gb25sb2FkKCkgZXhpc3RzLCBmaXJlIGltbWVkaWF0ZWx5LlxyXG4gICAgICAgIGlmIChzLnJlYWR5U3RhdGUgPT09IDMgJiYgaW5zdGFuY2VPcHRpb25zLm9ubG9hZCkge1xyXG4gICAgICAgICAgLy8gYXNzdW1lIHN1Y2Nlc3MgYmFzZWQgb24gdHJ1dGh5IGR1cmF0aW9uLlxyXG4gICAgICAgICAgd3JhcENhbGxiYWNrKHMsIGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICBpbnN0YW5jZU9wdGlvbnMub25sb2FkLmFwcGx5KHMsIFsoISFzLmR1cmF0aW9uKV0pO1xyXG4gICAgICAgICAgfSk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiBzO1xyXG4gICAgICB9XHJcblxyXG4gICAgICAvLyByZXNldCBhIGZldyBzdGF0ZSBwcm9wZXJ0aWVzXHJcblxyXG4gICAgICBzLmxvYWRlZCA9IGZhbHNlO1xyXG4gICAgICBzLnJlYWR5U3RhdGUgPSAxO1xyXG4gICAgICBzLnBsYXlTdGF0ZSA9IDA7XHJcbiAgICAgIHMuaWQzID0ge307XHJcblxyXG4gICAgICAvLyBUT0RPOiBJZiBzd2l0Y2hpbmcgZnJvbSBIVE1MNSAtPiBmbGFzaCAob3IgdmljZSB2ZXJzYSksIHN0b3AgY3VycmVudGx5LXBsYXlpbmcgYXVkaW8uXHJcblxyXG4gICAgICBpZiAoaHRtbDVPSyhpbnN0YW5jZU9wdGlvbnMpKSB7XHJcblxyXG4gICAgICAgIG9Tb3VuZCA9IHMuX3NldHVwX2h0bWw1KGluc3RhbmNlT3B0aW9ucyk7XHJcblxyXG4gICAgICAgIGlmICghb1NvdW5kLl9jYWxsZWRfbG9hZCkge1xyXG5cclxuICAgICAgICAgIHMuX2h0bWw1X2NhbnBsYXkgPSBmYWxzZTtcclxuXHJcbiAgICAgICAgICAvLyBUT0RPOiByZXZpZXcgY2FsbGVkX2xvYWQgLyBodG1sNV9jYW5wbGF5IGxvZ2ljXHJcblxyXG4gICAgICAgICAgLy8gaWYgdXJsIHByb3ZpZGVkIGRpcmVjdGx5IHRvIGxvYWQoKSwgYXNzaWduIGl0IGhlcmUuXHJcblxyXG4gICAgICAgICAgaWYgKHMudXJsICE9PSBpbnN0YW5jZU9wdGlvbnMudXJsKSB7XHJcblxyXG4gICAgICAgICAgICBzbTIuX3dEKF93RFMoJ21hblVSTCcpICsgJzogJyArIGluc3RhbmNlT3B0aW9ucy51cmwpO1xyXG5cclxuICAgICAgICAgICAgcy5fYS5zcmMgPSBpbnN0YW5jZU9wdGlvbnMudXJsO1xyXG5cclxuICAgICAgICAgICAgLy8gVE9ETzogcmV2aWV3IC8gcmUtYXBwbHkgYWxsIHJlbGV2YW50IG9wdGlvbnMgKHZvbHVtZSwgbG9vcCwgb25wb3NpdGlvbiBldGMuKVxyXG5cclxuICAgICAgICAgICAgLy8gcmVzZXQgcG9zaXRpb24gZm9yIG5ldyBVUkxcclxuICAgICAgICAgICAgcy5zZXRQb3NpdGlvbigwKTtcclxuXHJcbiAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgLy8gZ2l2ZW4gZXhwbGljaXQgbG9hZCBjYWxsLCB0cnkgdG8gcHJlbG9hZC5cclxuXHJcbiAgICAgICAgICAvLyBlYXJseSBIVE1MNSBpbXBsZW1lbnRhdGlvbiAobm9uLXN0YW5kYXJkKVxyXG4gICAgICAgICAgcy5fYS5hdXRvYnVmZmVyID0gJ2F1dG8nO1xyXG5cclxuICAgICAgICAgIC8vIHN0YW5kYXJkIHByb3BlcnR5LCB2YWx1ZXM6IG5vbmUgLyBtZXRhZGF0YSAvIGF1dG9cclxuICAgICAgICAgIC8vIHJlZmVyZW5jZTogaHR0cDovL21zZG4ubWljcm9zb2Z0LmNvbS9lbi11cy9saWJyYXJ5L2llL2ZmOTc0NzU5JTI4dj12cy44NSUyOS5hc3B4XHJcbiAgICAgICAgICBzLl9hLnByZWxvYWQgPSAnYXV0byc7XHJcblxyXG4gICAgICAgICAgcy5fYS5fY2FsbGVkX2xvYWQgPSB0cnVlO1xyXG5cclxuICAgICAgICB9IGVsc2Uge1xyXG5cclxuICAgICAgICAgIHNtMi5fd0Qocy5pZCArICc6IElnbm9yaW5nIHJlcXVlc3QgdG8gbG9hZCBhZ2FpbicpO1xyXG5cclxuICAgICAgICB9XHJcblxyXG4gICAgICB9IGVsc2Uge1xyXG5cclxuICAgICAgICBpZiAoc20yLmh0bWw1T25seSkge1xyXG4gICAgICAgICAgc20yLl93RChzLmlkICsgJzogTm8gZmxhc2ggc3VwcG9ydC4gRXhpdGluZy4nKTtcclxuICAgICAgICAgIHJldHVybiBzO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgaWYgKHMuX2lPLnVybCAmJiBzLl9pTy51cmwubWF0Y2goL2RhdGFcXDovaSkpIHtcclxuICAgICAgICAgIC8vIGRhdGE6IFVSSXMgbm90IHN1cHBvcnRlZCBieSBGbGFzaCwgZWl0aGVyLlxyXG4gICAgICAgICAgc20yLl93RChzLmlkICsgJzogZGF0YTogVVJJcyBub3Qgc3VwcG9ydGVkIHZpYSBGbGFzaC4gRXhpdGluZy4nKTtcclxuICAgICAgICAgIHJldHVybiBzO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgdHJ5IHtcclxuICAgICAgICAgIHMuaXNIVE1MNSA9IGZhbHNlO1xyXG4gICAgICAgICAgcy5faU8gPSBwb2xpY3lGaXgobG9vcEZpeChpbnN0YW5jZU9wdGlvbnMpKTtcclxuICAgICAgICAgIC8vIGlmIHdlIGhhdmUgXCJwb3NpdGlvblwiLCBkaXNhYmxlIGF1dG8tcGxheSBhcyB3ZSdsbCBiZSBzZWVraW5nIHRvIHRoYXQgcG9zaXRpb24gYXQgb25sb2FkKCkuXHJcbiAgICAgICAgICBpZiAocy5faU8uYXV0b1BsYXkgJiYgKHMuX2lPLnBvc2l0aW9uIHx8IHMuX2lPLmZyb20pKSB7XHJcbiAgICAgICAgICAgIHNtMi5fd0Qocy5pZCArICc6IERpc2FibGluZyBhdXRvUGxheSBiZWNhdXNlIG9mIG5vbi16ZXJvIG9mZnNldCBjYXNlJyk7XHJcbiAgICAgICAgICAgIHMuX2lPLmF1dG9QbGF5ID0gZmFsc2U7XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgICAvLyByZS1hc3NpZ24gbG9jYWwgc2hvcnRjdXRcclxuICAgICAgICAgIGluc3RhbmNlT3B0aW9ucyA9IHMuX2lPO1xyXG4gICAgICAgICAgaWYgKGZWID09PSA4KSB7XHJcbiAgICAgICAgICAgIGZsYXNoLl9sb2FkKHMuaWQsIGluc3RhbmNlT3B0aW9ucy51cmwsIGluc3RhbmNlT3B0aW9ucy5zdHJlYW0sIGluc3RhbmNlT3B0aW9ucy5hdXRvUGxheSwgaW5zdGFuY2VPcHRpb25zLnVzZVBvbGljeUZpbGUpO1xyXG4gICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgZmxhc2guX2xvYWQocy5pZCwgaW5zdGFuY2VPcHRpb25zLnVybCwgISEoaW5zdGFuY2VPcHRpb25zLnN0cmVhbSksICEhKGluc3RhbmNlT3B0aW9ucy5hdXRvUGxheSksIGluc3RhbmNlT3B0aW9ucy5sb29wc3x8MSwgISEoaW5zdGFuY2VPcHRpb25zLmF1dG9Mb2FkKSwgaW5zdGFuY2VPcHRpb25zLnVzZVBvbGljeUZpbGUpO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgIH0gY2F0Y2goZSkge1xyXG4gICAgICAgICAgX3dEUygnc21FcnJvcicsIDIpO1xyXG4gICAgICAgICAgZGVidWdUUygnb25sb2FkJywgZmFsc2UpO1xyXG4gICAgICAgICAgY2F0Y2hFcnJvcih7dHlwZTonU01TT1VORF9MT0FEX0pTX0VYQ0VQVElPTicsIGZhdGFsOnRydWV9KTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICB9XHJcblxyXG4gICAgICAvLyBhZnRlciBhbGwgb2YgdGhpcywgZW5zdXJlIHNvdW5kIHVybCBpcyB1cCB0byBkYXRlLlxyXG4gICAgICBzLnVybCA9IGluc3RhbmNlT3B0aW9ucy51cmw7XHJcblxyXG4gICAgICByZXR1cm4gcztcclxuXHJcbiAgICB9O1xyXG5cclxuICAgIC8qKlxyXG4gICAgICogVW5sb2FkcyBhIHNvdW5kLCBjYW5jZWxpbmcgYW55IG9wZW4gSFRUUCByZXF1ZXN0cy5cclxuICAgICAqXHJcbiAgICAgKiBAcmV0dXJuIHtTTVNvdW5kfSBUaGUgU01Tb3VuZCBvYmplY3RcclxuICAgICAqL1xyXG5cclxuICAgIHRoaXMudW5sb2FkID0gZnVuY3Rpb24oKSB7XHJcblxyXG4gICAgICAvLyBGbGFzaCA4L0FTMiBjYW4ndCBcImNsb3NlXCIgYSBzdHJlYW0gLSBmYWtlIGl0IGJ5IGxvYWRpbmcgYW4gZW1wdHkgVVJMXHJcbiAgICAgIC8vIEZsYXNoIDkvQVMzOiBDbG9zZSBzdHJlYW0sIHByZXZlbnRpbmcgZnVydGhlciBsb2FkXHJcbiAgICAgIC8vIEhUTUw1OiBNb3N0IFVBcyB3aWxsIHVzZSBlbXB0eSBVUkxcclxuXHJcbiAgICAgIGlmIChzLnJlYWR5U3RhdGUgIT09IDApIHtcclxuXHJcbiAgICAgICAgc20yLl93RChzLmlkICsgJzogdW5sb2FkKCknKTtcclxuXHJcbiAgICAgICAgaWYgKCFzLmlzSFRNTDUpIHtcclxuXHJcbiAgICAgICAgICBpZiAoZlYgPT09IDgpIHtcclxuICAgICAgICAgICAgZmxhc2guX3VubG9hZChzLmlkLCBlbXB0eVVSTCk7XHJcbiAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICBmbGFzaC5fdW5sb2FkKHMuaWQpO1xyXG4gICAgICAgICAgfVxyXG5cclxuICAgICAgICB9IGVsc2Uge1xyXG5cclxuICAgICAgICAgIHN0b3BfaHRtbDVfdGltZXIoKTtcclxuXHJcbiAgICAgICAgICBpZiAocy5fYSkge1xyXG5cclxuICAgICAgICAgICAgcy5fYS5wYXVzZSgpO1xyXG5cclxuICAgICAgICAgICAgLy8gdXBkYXRlIGVtcHR5IFVSTCwgdG9vXHJcbiAgICAgICAgICAgIGxhc3RVUkwgPSBodG1sNVVubG9hZChzLl9hKTtcclxuXHJcbiAgICAgICAgICB9XHJcblxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLy8gcmVzZXQgbG9hZC9zdGF0dXMgZmxhZ3NcclxuICAgICAgICByZXNldFByb3BlcnRpZXMoKTtcclxuXHJcbiAgICAgIH1cclxuXHJcbiAgICAgIHJldHVybiBzO1xyXG5cclxuICAgIH07XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBVbmxvYWRzIGFuZCBkZXN0cm95cyBhIHNvdW5kLlxyXG4gICAgICovXHJcblxyXG4gICAgdGhpcy5kZXN0cnVjdCA9IGZ1bmN0aW9uKF9iRnJvbVNNKSB7XHJcblxyXG4gICAgICBzbTIuX3dEKHMuaWQgKyAnOiBEZXN0cnVjdCcpO1xyXG5cclxuICAgICAgaWYgKCFzLmlzSFRNTDUpIHtcclxuXHJcbiAgICAgICAgLy8ga2lsbCBzb3VuZCB3aXRoaW4gRmxhc2hcclxuICAgICAgICAvLyBEaXNhYmxlIHRoZSBvbmZhaWx1cmUgaGFuZGxlclxyXG4gICAgICAgIHMuX2lPLm9uZmFpbHVyZSA9IG51bGw7XHJcbiAgICAgICAgZmxhc2guX2Rlc3Ryb3lTb3VuZChzLmlkKTtcclxuXHJcbiAgICAgIH0gZWxzZSB7XHJcblxyXG4gICAgICAgIHN0b3BfaHRtbDVfdGltZXIoKTtcclxuXHJcbiAgICAgICAgaWYgKHMuX2EpIHtcclxuICAgICAgICAgIHMuX2EucGF1c2UoKTtcclxuICAgICAgICAgIGh0bWw1VW5sb2FkKHMuX2EpO1xyXG4gICAgICAgICAgaWYgKCF1c2VHbG9iYWxIVE1MNUF1ZGlvKSB7XHJcbiAgICAgICAgICAgIHJlbW92ZV9odG1sNV9ldmVudHMoKTtcclxuICAgICAgICAgIH1cclxuICAgICAgICAgIC8vIGJyZWFrIG9idmlvdXMgY2lyY3VsYXIgcmVmZXJlbmNlXHJcbiAgICAgICAgICBzLl9hLl9zID0gbnVsbDtcclxuICAgICAgICAgIHMuX2EgPSBudWxsO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgIH1cclxuXHJcbiAgICAgIGlmICghX2JGcm9tU00pIHtcclxuICAgICAgICAvLyBlbnN1cmUgZGVsZXRpb24gZnJvbSBjb250cm9sbGVyXHJcbiAgICAgICAgc20yLmRlc3Ryb3lTb3VuZChzLmlkLCB0cnVlKTtcclxuICAgICAgfVxyXG5cclxuICAgIH07XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBCZWdpbnMgcGxheWluZyBhIHNvdW5kLlxyXG4gICAgICpcclxuICAgICAqIEBwYXJhbSB7b2JqZWN0fSBvT3B0aW9ucyBPcHRpb25hbDogU291bmQgb3B0aW9uc1xyXG4gICAgICogQHJldHVybiB7U01Tb3VuZH0gVGhlIFNNU291bmQgb2JqZWN0XHJcbiAgICAgKi9cclxuXHJcbiAgICB0aGlzLnBsYXkgPSBmdW5jdGlvbihvT3B0aW9ucywgX3VwZGF0ZVBsYXlTdGF0ZSkge1xyXG5cclxuICAgICAgdmFyIGZOLCBhbGxvd011bHRpLCBhLCBvbnJlYWR5LFxyXG4gICAgICAgICAgYXVkaW9DbG9uZSwgb25lbmRlZCwgb25jYW5wbGF5LFxyXG4gICAgICAgICAgc3RhcnRPSyA9IHRydWUsXHJcbiAgICAgICAgICBleGl0ID0gbnVsbDtcclxuXHJcbiAgICAgIC8vIDxkPlxyXG4gICAgICBmTiA9IHMuaWQgKyAnOiBwbGF5KCk6ICc7XHJcbiAgICAgIC8vIDwvZD5cclxuXHJcbiAgICAgIC8vIGRlZmF1bHQgdG8gdHJ1ZVxyXG4gICAgICBfdXBkYXRlUGxheVN0YXRlID0gKF91cGRhdGVQbGF5U3RhdGUgPT09IF91bmRlZmluZWQgPyB0cnVlIDogX3VwZGF0ZVBsYXlTdGF0ZSk7XHJcblxyXG4gICAgICBpZiAoIW9PcHRpb25zKSB7XHJcbiAgICAgICAgb09wdGlvbnMgPSB7fTtcclxuICAgICAgfVxyXG5cclxuICAgICAgLy8gZmlyc3QsIHVzZSBsb2NhbCBVUkwgKGlmIHNwZWNpZmllZClcclxuICAgICAgaWYgKHMudXJsKSB7XHJcbiAgICAgICAgcy5faU8udXJsID0gcy51cmw7XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIC8vIG1peCBpbiBhbnkgb3B0aW9ucyBkZWZpbmVkIGF0IGNyZWF0ZVNvdW5kKClcclxuICAgICAgcy5faU8gPSBtaXhpbihzLl9pTywgcy5vcHRpb25zKTtcclxuXHJcbiAgICAgIC8vIG1peCBpbiBhbnkgb3B0aW9ucyBzcGVjaWZpYyB0byB0aGlzIG1ldGhvZFxyXG4gICAgICBzLl9pTyA9IG1peGluKG9PcHRpb25zLCBzLl9pTyk7XHJcblxyXG4gICAgICBzLl9pTy51cmwgPSBwYXJzZVVSTChzLl9pTy51cmwpO1xyXG5cclxuICAgICAgcy5pbnN0YW5jZU9wdGlvbnMgPSBzLl9pTztcclxuXHJcbiAgICAgIC8vIFJUTVAtb25seVxyXG4gICAgICBpZiAoIXMuaXNIVE1MNSAmJiBzLl9pTy5zZXJ2ZXJVUkwgJiYgIXMuY29ubmVjdGVkKSB7XHJcbiAgICAgICAgaWYgKCFzLmdldEF1dG9QbGF5KCkpIHtcclxuICAgICAgICAgIHNtMi5fd0QoZk4gKycgTmV0c3RyZWFtIG5vdCBjb25uZWN0ZWQgeWV0IC0gc2V0dGluZyBhdXRvUGxheScpO1xyXG4gICAgICAgICAgcy5zZXRBdXRvUGxheSh0cnVlKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgLy8gcGxheSB3aWxsIGJlIGNhbGxlZCBpbiBvbmNvbm5lY3QoKVxyXG4gICAgICAgIHJldHVybiBzO1xyXG4gICAgICB9XHJcblxyXG4gICAgICBpZiAoaHRtbDVPSyhzLl9pTykpIHtcclxuICAgICAgICBzLl9zZXR1cF9odG1sNShzLl9pTyk7XHJcbiAgICAgICAgc3RhcnRfaHRtbDVfdGltZXIoKTtcclxuICAgICAgfVxyXG5cclxuICAgICAgaWYgKHMucGxheVN0YXRlID09PSAxICYmICFzLnBhdXNlZCkge1xyXG4gICAgICAgIGFsbG93TXVsdGkgPSBzLl9pTy5tdWx0aVNob3Q7XHJcbiAgICAgICAgaWYgKCFhbGxvd011bHRpKSB7XHJcbiAgICAgICAgICBzbTIuX3dEKGZOICsgJ0FscmVhZHkgcGxheWluZyAob25lLXNob3QpJywgMSk7XHJcbiAgICAgICAgICBpZiAocy5pc0hUTUw1KSB7XHJcbiAgICAgICAgICAgIC8vIGdvIGJhY2sgdG8gb3JpZ2luYWwgcG9zaXRpb24uXHJcbiAgICAgICAgICAgIHMuc2V0UG9zaXRpb24ocy5faU8ucG9zaXRpb24pO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgICAgZXhpdCA9IHM7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgIHNtMi5fd0QoZk4gKyAnQWxyZWFkeSBwbGF5aW5nIChtdWx0aS1zaG90KScsIDEpO1xyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG5cclxuICAgICAgaWYgKGV4aXQgIT09IG51bGwpIHtcclxuICAgICAgICByZXR1cm4gZXhpdDtcclxuICAgICAgfVxyXG5cclxuICAgICAgLy8gZWRnZSBjYXNlOiBwbGF5KCkgd2l0aCBleHBsaWNpdCBVUkwgcGFyYW1ldGVyXHJcbiAgICAgIGlmIChvT3B0aW9ucy51cmwgJiYgb09wdGlvbnMudXJsICE9PSBzLnVybCkge1xyXG5cclxuICAgICAgICAvLyBzcGVjaWFsIGNhc2UgZm9yIGNyZWF0ZVNvdW5kKCkgZm9sbG93ZWQgYnkgbG9hZCgpIC8gcGxheSgpIHdpdGggdXJsOyBhdm9pZCBkb3VibGUtbG9hZCBjYXNlLlxyXG4gICAgICAgIGlmICghcy5yZWFkeVN0YXRlICYmICFzLmlzSFRNTDUgJiYgZlYgPT09IDggJiYgdXJsT21pdHRlZCkge1xyXG5cclxuICAgICAgICAgIHVybE9taXR0ZWQgPSBmYWxzZTtcclxuXHJcbiAgICAgICAgfSBlbHNlIHtcclxuXHJcbiAgICAgICAgICAvLyBsb2FkIHVzaW5nIG1lcmdlZCBvcHRpb25zXHJcbiAgICAgICAgICBzLmxvYWQocy5faU8pO1xyXG5cclxuICAgICAgICB9XHJcblxyXG4gICAgICB9XHJcblxyXG4gICAgICBpZiAoIXMubG9hZGVkKSB7XHJcblxyXG4gICAgICAgIGlmIChzLnJlYWR5U3RhdGUgPT09IDApIHtcclxuXHJcbiAgICAgICAgICBzbTIuX3dEKGZOICsgJ0F0dGVtcHRpbmcgdG8gbG9hZCcpO1xyXG5cclxuICAgICAgICAgIC8vIHRyeSB0byBnZXQgdGhpcyBzb3VuZCBwbGF5aW5nIEFTQVBcclxuICAgICAgICAgIGlmICghcy5pc0hUTUw1ICYmICFzbTIuaHRtbDVPbmx5KSB7XHJcblxyXG4gICAgICAgICAgICAvLyBmbGFzaDogYXNzaWduIGRpcmVjdGx5IGJlY2F1c2Ugc2V0QXV0b1BsYXkoKSBpbmNyZW1lbnRzIHRoZSBpbnN0YW5jZUNvdW50XHJcbiAgICAgICAgICAgIHMuX2lPLmF1dG9QbGF5ID0gdHJ1ZTtcclxuICAgICAgICAgICAgcy5sb2FkKHMuX2lPKTtcclxuXHJcbiAgICAgICAgICB9IGVsc2UgaWYgKHMuaXNIVE1MNSkge1xyXG5cclxuICAgICAgICAgICAgLy8gaU9TIG5lZWRzIHRoaXMgd2hlbiByZWN5Y2xpbmcgc291bmRzLCBsb2FkaW5nIGEgbmV3IFVSTCBvbiBhbiBleGlzdGluZyBvYmplY3QuXHJcbiAgICAgICAgICAgIHMubG9hZChzLl9pTyk7XHJcblxyXG4gICAgICAgICAgfSBlbHNlIHtcclxuXHJcbiAgICAgICAgICAgIHNtMi5fd0QoZk4gKyAnVW5zdXBwb3J0ZWQgdHlwZS4gRXhpdGluZy4nKTtcclxuICAgICAgICAgICAgZXhpdCA9IHM7XHJcblxyXG4gICAgICAgICAgfVxyXG5cclxuICAgICAgICAgIC8vIEhUTUw1IGhhY2sgLSByZS1zZXQgaW5zdGFuY2VPcHRpb25zP1xyXG4gICAgICAgICAgcy5pbnN0YW5jZU9wdGlvbnMgPSBzLl9pTztcclxuXHJcbiAgICAgICAgfSBlbHNlIGlmIChzLnJlYWR5U3RhdGUgPT09IDIpIHtcclxuXHJcbiAgICAgICAgICBzbTIuX3dEKGZOICsgJ0NvdWxkIG5vdCBsb2FkIC0gZXhpdGluZycsIDIpO1xyXG4gICAgICAgICAgZXhpdCA9IHM7XHJcblxyXG4gICAgICAgIH0gZWxzZSB7XHJcblxyXG4gICAgICAgICAgc20yLl93RChmTiArICdMb2FkaW5nIC0gYXR0ZW1wdGluZyB0byBwbGF5Li4uJyk7XHJcblxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgIH0gZWxzZSB7XHJcblxyXG4gICAgICAgIC8vIFwicGxheSgpXCJcclxuICAgICAgICBzbTIuX3dEKGZOLnN1YnN0cigwLCBmTi5sYXN0SW5kZXhPZignOicpKSk7XHJcblxyXG4gICAgICB9XHJcblxyXG4gICAgICBpZiAoZXhpdCAhPT0gbnVsbCkge1xyXG4gICAgICAgIHJldHVybiBleGl0O1xyXG4gICAgICB9XHJcblxyXG4gICAgICBpZiAoIXMuaXNIVE1MNSAmJiBmViA9PT0gOSAmJiBzLnBvc2l0aW9uID4gMCAmJiBzLnBvc2l0aW9uID09PSBzLmR1cmF0aW9uKSB7XHJcbiAgICAgICAgLy8gZmxhc2ggOSBuZWVkcyBhIHBvc2l0aW9uIHJlc2V0IGlmIHBsYXkoKSBpcyBjYWxsZWQgd2hpbGUgYXQgdGhlIGVuZCBvZiBhIHNvdW5kLlxyXG4gICAgICAgIHNtMi5fd0QoZk4gKyAnU291bmQgYXQgZW5kLCByZXNldHRpbmcgdG8gcG9zaXRpb246MCcpO1xyXG4gICAgICAgIG9PcHRpb25zLnBvc2l0aW9uID0gMDtcclxuICAgICAgfVxyXG5cclxuICAgICAgLyoqXHJcbiAgICAgICAqIFN0cmVhbXMgd2lsbCBwYXVzZSB3aGVuIHRoZWlyIGJ1ZmZlciBpcyBmdWxsIGlmIHRoZXkgYXJlIGJlaW5nIGxvYWRlZC5cclxuICAgICAgICogSW4gdGhpcyBjYXNlIHBhdXNlZCBpcyB0cnVlLCBidXQgdGhlIHNvbmcgaGFzbid0IHN0YXJ0ZWQgcGxheWluZyB5ZXQuXHJcbiAgICAgICAqIElmIHdlIGp1c3QgY2FsbCByZXN1bWUoKSB0aGUgb25wbGF5KCkgY2FsbGJhY2sgd2lsbCBuZXZlciBiZSBjYWxsZWQuXHJcbiAgICAgICAqIFNvIG9ubHkgY2FsbCByZXN1bWUoKSBpZiB0aGUgcG9zaXRpb24gaXMgPiAwLlxyXG4gICAgICAgKiBBbm90aGVyIHJlYXNvbiBpcyBiZWNhdXNlIG9wdGlvbnMgbGlrZSB2b2x1bWUgd29uJ3QgaGF2ZSBiZWVuIGFwcGxpZWQgeWV0LlxyXG4gICAgICAgKiBGb3Igbm9ybWFsIHNvdW5kcywganVzdCByZXN1bWUuXHJcbiAgICAgICAqL1xyXG5cclxuICAgICAgaWYgKHMucGF1c2VkICYmIHMucG9zaXRpb24gPj0gMCAmJiAoIXMuX2lPLnNlcnZlclVSTCB8fCBzLnBvc2l0aW9uID4gMCkpIHtcclxuXHJcbiAgICAgICAgLy8gaHR0cHM6Ly9naXN0LmdpdGh1Yi5jb20vMzdiMTdkZjc1Y2M0ZDdhOTBiZjZcclxuICAgICAgICBzbTIuX3dEKGZOICsgJ1Jlc3VtaW5nIGZyb20gcGF1c2VkIHN0YXRlJywgMSk7XHJcbiAgICAgICAgcy5yZXN1bWUoKTtcclxuXHJcbiAgICAgIH0gZWxzZSB7XHJcblxyXG4gICAgICAgIHMuX2lPID0gbWl4aW4ob09wdGlvbnMsIHMuX2lPKTtcclxuXHJcbiAgICAgICAgLyoqXHJcbiAgICAgICAgICogUHJlbG9hZCBpbiB0aGUgZXZlbnQgb2YgcGxheSgpIHdpdGggcG9zaXRpb24gdW5kZXIgRmxhc2gsXHJcbiAgICAgICAgICogb3IgZnJvbS90byBwYXJhbWV0ZXJzIGFuZCBub24tUlRNUCBjYXNlXHJcbiAgICAgICAgICovXHJcbiAgICAgICAgaWYgKCgoIXMuaXNIVE1MNSAmJiBzLl9pTy5wb3NpdGlvbiAhPT0gbnVsbCAmJiBzLl9pTy5wb3NpdGlvbiA+IDApIHx8IChzLl9pTy5mcm9tICE9PSBudWxsICYmIHMuX2lPLmZyb20gPiAwKSB8fCBzLl9pTy50byAhPT0gbnVsbCkgJiYgcy5pbnN0YW5jZUNvdW50ID09PSAwICYmIHMucGxheVN0YXRlID09PSAwICYmICFzLl9pTy5zZXJ2ZXJVUkwpIHtcclxuXHJcbiAgICAgICAgICBvbnJlYWR5ID0gZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgIC8vIHNvdW5kIFwiY2FucGxheVwiIG9yIG9ubG9hZCgpXHJcbiAgICAgICAgICAgIC8vIHJlLWFwcGx5IHBvc2l0aW9uL2Zyb20vdG8gdG8gaW5zdGFuY2Ugb3B0aW9ucywgYW5kIHN0YXJ0IHBsYXliYWNrXHJcbiAgICAgICAgICAgIHMuX2lPID0gbWl4aW4ob09wdGlvbnMsIHMuX2lPKTtcclxuICAgICAgICAgICAgcy5wbGF5KHMuX2lPKTtcclxuICAgICAgICAgIH07XHJcblxyXG4gICAgICAgICAgLy8gSFRNTDUgbmVlZHMgdG8gYXQgbGVhc3QgaGF2ZSBcImNhbnBsYXlcIiBmaXJlZCBiZWZvcmUgc2Vla2luZy5cclxuICAgICAgICAgIGlmIChzLmlzSFRNTDUgJiYgIXMuX2h0bWw1X2NhbnBsYXkpIHtcclxuXHJcbiAgICAgICAgICAgIC8vIHRoaXMgaGFzbid0IGJlZW4gbG9hZGVkIHlldC4gbG9hZCBpdCBmaXJzdCwgYW5kIHRoZW4gZG8gdGhpcyBhZ2Fpbi5cclxuICAgICAgICAgICAgc20yLl93RChmTiArICdCZWdpbm5pbmcgbG9hZCBmb3Igbm9uLXplcm8gb2Zmc2V0IGNhc2UnKTtcclxuXHJcbiAgICAgICAgICAgIHMubG9hZCh7XHJcbiAgICAgICAgICAgICAgLy8gbm90ZTogY3VzdG9tIEhUTUw1LW9ubHkgZXZlbnQgYWRkZWQgZm9yIGZyb20vdG8gaW1wbGVtZW50YXRpb24uXHJcbiAgICAgICAgICAgICAgX29uY2FucGxheTogb25yZWFkeVxyXG4gICAgICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgICAgIGV4aXQgPSBmYWxzZTtcclxuXHJcbiAgICAgICAgICB9IGVsc2UgaWYgKCFzLmlzSFRNTDUgJiYgIXMubG9hZGVkICYmICghcy5yZWFkeVN0YXRlIHx8IHMucmVhZHlTdGF0ZSAhPT0gMikpIHtcclxuXHJcbiAgICAgICAgICAgIC8vIHRvIGJlIHNhZmUsIHByZWxvYWQgdGhlIHdob2xlIHRoaW5nIGluIEZsYXNoLlxyXG5cclxuICAgICAgICAgICAgc20yLl93RChmTiArICdQcmVsb2FkaW5nIGZvciBub24temVybyBvZmZzZXQgY2FzZScpO1xyXG5cclxuICAgICAgICAgICAgcy5sb2FkKHtcclxuICAgICAgICAgICAgICBvbmxvYWQ6IG9ucmVhZHlcclxuICAgICAgICAgICAgfSk7XHJcblxyXG4gICAgICAgICAgICBleGl0ID0gZmFsc2U7XHJcblxyXG4gICAgICAgICAgfVxyXG5cclxuICAgICAgICAgIGlmIChleGl0ICE9PSBudWxsKSB7XHJcbiAgICAgICAgICAgIHJldHVybiBleGl0O1xyXG4gICAgICAgICAgfVxyXG5cclxuICAgICAgICAgIC8vIG90aGVyd2lzZSwgd2UncmUgcmVhZHkgdG8gZ28uIHJlLWFwcGx5IGxvY2FsIG9wdGlvbnMsIGFuZCBjb250aW51ZVxyXG5cclxuICAgICAgICAgIHMuX2lPID0gYXBwbHlGcm9tVG8oKTtcclxuXHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvLyBzbTIuX3dEKGZOICsgJ1N0YXJ0aW5nIHRvIHBsYXknKTtcclxuXHJcbiAgICAgICAgLy8gaW5jcmVtZW50IGluc3RhbmNlIGNvdW50ZXIsIHdoZXJlIGVuYWJsZWQgKyBzdXBwb3J0ZWRcclxuICAgICAgICBpZiAoIXMuaW5zdGFuY2VDb3VudCB8fCBzLl9pTy5tdWx0aVNob3RFdmVudHMgfHwgKHMuaXNIVE1MNSAmJiBzLl9pTy5tdWx0aVNob3QgJiYgIXVzZUdsb2JhbEhUTUw1QXVkaW8pIHx8ICghcy5pc0hUTUw1ICYmIGZWID4gOCAmJiAhcy5nZXRBdXRvUGxheSgpKSkge1xyXG4gICAgICAgICAgcy5pbnN0YW5jZUNvdW50Kys7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvLyBpZiBmaXJzdCBwbGF5IGFuZCBvbnBvc2l0aW9uIHBhcmFtZXRlcnMgZXhpc3QsIGFwcGx5IHRoZW0gbm93XHJcbiAgICAgICAgaWYgKHMuX2lPLm9ucG9zaXRpb24gJiYgcy5wbGF5U3RhdGUgPT09IDApIHtcclxuICAgICAgICAgIGF0dGFjaE9uUG9zaXRpb24ocyk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBzLnBsYXlTdGF0ZSA9IDE7XHJcbiAgICAgICAgcy5wYXVzZWQgPSBmYWxzZTtcclxuXHJcbiAgICAgICAgcy5wb3NpdGlvbiA9IChzLl9pTy5wb3NpdGlvbiAhPT0gX3VuZGVmaW5lZCAmJiAhaXNOYU4ocy5faU8ucG9zaXRpb24pID8gcy5faU8ucG9zaXRpb24gOiAwKTtcclxuXHJcbiAgICAgICAgaWYgKCFzLmlzSFRNTDUpIHtcclxuICAgICAgICAgIHMuX2lPID0gcG9saWN5Rml4KGxvb3BGaXgocy5faU8pKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGlmIChzLl9pTy5vbnBsYXkgJiYgX3VwZGF0ZVBsYXlTdGF0ZSkge1xyXG4gICAgICAgICAgcy5faU8ub25wbGF5LmFwcGx5KHMpO1xyXG4gICAgICAgICAgb25wbGF5X2NhbGxlZCA9IHRydWU7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBzLnNldFZvbHVtZShzLl9pTy52b2x1bWUsIHRydWUpO1xyXG4gICAgICAgIHMuc2V0UGFuKHMuX2lPLnBhbiwgdHJ1ZSk7XHJcblxyXG4gICAgICAgIGlmICghcy5pc0hUTUw1KSB7XHJcblxyXG4gICAgICAgICAgc3RhcnRPSyA9IGZsYXNoLl9zdGFydChzLmlkLCBzLl9pTy5sb29wcyB8fCAxLCAoZlYgPT09IDkgPyBzLnBvc2l0aW9uIDogcy5wb3NpdGlvbiAvIG1zZWNTY2FsZSksIHMuX2lPLm11bHRpU2hvdCB8fCBmYWxzZSk7XHJcblxyXG4gICAgICAgICAgaWYgKGZWID09PSA5ICYmICFzdGFydE9LKSB7XHJcbiAgICAgICAgICAgIC8vIGVkZ2UgY2FzZTogbm8gc291bmQgaGFyZHdhcmUsIG9yIDMyLWNoYW5uZWwgZmxhc2ggY2VpbGluZyBoaXQuXHJcbiAgICAgICAgICAgIC8vIGFwcGxpZXMgb25seSB0byBGbGFzaCA5LCBub24tTmV0U3RyZWFtL01vdmllU3RhciBzb3VuZHMuXHJcbiAgICAgICAgICAgIC8vIGh0dHA6Ly9oZWxwLmFkb2JlLmNvbS9lbl9VUy9GbGFzaFBsYXRmb3JtL3JlZmVyZW5jZS9hY3Rpb25zY3JpcHQvMy9mbGFzaC9tZWRpYS9Tb3VuZC5odG1sI3BsYXklMjglMjlcclxuICAgICAgICAgICAgc20yLl93RChmTiArICdObyBzb3VuZCBoYXJkd2FyZSwgb3IgMzItc291bmQgY2VpbGluZyBoaXQnLCAyKTtcclxuICAgICAgICAgICAgaWYgKHMuX2lPLm9ucGxheWVycm9yKSB7XHJcbiAgICAgICAgICAgICAgcy5faU8ub25wbGF5ZXJyb3IuYXBwbHkocyk7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICB9XHJcblxyXG4gICAgICAgIH0gZWxzZSB7XHJcblxyXG4gICAgICAgICAgaWYgKHMuaW5zdGFuY2VDb3VudCA8IDIpIHtcclxuXHJcbiAgICAgICAgICAgIC8vIEhUTUw1IHNpbmdsZS1pbnN0YW5jZSBjYXNlXHJcblxyXG4gICAgICAgICAgICBzdGFydF9odG1sNV90aW1lcigpO1xyXG5cclxuICAgICAgICAgICAgYSA9IHMuX3NldHVwX2h0bWw1KCk7XHJcblxyXG4gICAgICAgICAgICBzLnNldFBvc2l0aW9uKHMuX2lPLnBvc2l0aW9uKTtcclxuXHJcbiAgICAgICAgICAgIGEucGxheSgpO1xyXG5cclxuICAgICAgICAgIH0gZWxzZSB7XHJcblxyXG4gICAgICAgICAgICAvLyBIVE1MNSBtdWx0aS1zaG90IGNhc2VcclxuXHJcbiAgICAgICAgICAgIHNtMi5fd0Qocy5pZCArICc6IENsb25pbmcgQXVkaW8oKSBmb3IgaW5zdGFuY2UgIycgKyBzLmluc3RhbmNlQ291bnQgKyAnLi4uJyk7XHJcblxyXG4gICAgICAgICAgICBhdWRpb0Nsb25lID0gbmV3IEF1ZGlvKHMuX2lPLnVybCk7XHJcblxyXG4gICAgICAgICAgICBvbmVuZGVkID0gZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgICAgZXZlbnQucmVtb3ZlKGF1ZGlvQ2xvbmUsICdlbmRlZCcsIG9uZW5kZWQpO1xyXG4gICAgICAgICAgICAgIHMuX29uZmluaXNoKHMpO1xyXG4gICAgICAgICAgICAgIC8vIGNsZWFudXBcclxuICAgICAgICAgICAgICBodG1sNVVubG9hZChhdWRpb0Nsb25lKTtcclxuICAgICAgICAgICAgICBhdWRpb0Nsb25lID0gbnVsbDtcclxuICAgICAgICAgICAgfTtcclxuXHJcbiAgICAgICAgICAgIG9uY2FucGxheSA9IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICAgIGV2ZW50LnJlbW92ZShhdWRpb0Nsb25lLCAnY2FucGxheScsIG9uY2FucGxheSk7XHJcbiAgICAgICAgICAgICAgdHJ5IHtcclxuICAgICAgICAgICAgICAgIGF1ZGlvQ2xvbmUuY3VycmVudFRpbWUgPSBzLl9pTy5wb3NpdGlvbi9tc2VjU2NhbGU7XHJcbiAgICAgICAgICAgICAgfSBjYXRjaChlcnIpIHtcclxuICAgICAgICAgICAgICAgIGNvbXBsYWluKHMuaWQgKyAnOiBtdWx0aVNob3QgcGxheSgpIGZhaWxlZCB0byBhcHBseSBwb3NpdGlvbiBvZiAnICsgKHMuX2lPLnBvc2l0aW9uL21zZWNTY2FsZSkpO1xyXG4gICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICBhdWRpb0Nsb25lLnBsYXkoKTtcclxuICAgICAgICAgICAgfTtcclxuXHJcbiAgICAgICAgICAgIGV2ZW50LmFkZChhdWRpb0Nsb25lLCAnZW5kZWQnLCBvbmVuZGVkKTtcclxuXHJcbiAgICAgICAgICAgIC8vIGFwcGx5IHZvbHVtZSB0byBjbG9uZXMsIHRvb1xyXG4gICAgICAgICAgICBpZiAocy5faU8udm9sdW1lICE9PSB1bmRlZmluZWQpIHtcclxuICAgICAgICAgICAgICBhdWRpb0Nsb25lLnZvbHVtZSA9IE1hdGgubWF4KDAsIE1hdGgubWluKDEsIHMuX2lPLnZvbHVtZS8xMDApKTtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgLy8gcGxheWluZyBtdWx0aXBsZSBtdXRlZCBzb3VuZHM/IGlmIHlvdSBkbyB0aGlzLCB5b3UncmUgd2VpcmQgOykgLSBidXQgbGV0J3MgY292ZXIgaXQuXHJcbiAgICAgICAgICAgIGlmIChzLm11dGVkKSB7XHJcbiAgICAgICAgICAgICAgYXVkaW9DbG9uZS5tdXRlZCA9IHRydWU7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIGlmIChzLl9pTy5wb3NpdGlvbikge1xyXG4gICAgICAgICAgICAgIC8vIEhUTUw1IGF1ZGlvIGNhbid0IHNlZWsgYmVmb3JlIG9ucGxheSgpIGV2ZW50IGhhcyBmaXJlZC5cclxuICAgICAgICAgICAgICAvLyB3YWl0IGZvciBjYW5wbGF5LCB0aGVuIHNlZWsgdG8gcG9zaXRpb24gYW5kIHN0YXJ0IHBsYXliYWNrLlxyXG4gICAgICAgICAgICAgIGV2ZW50LmFkZChhdWRpb0Nsb25lLCAnY2FucGxheScsIG9uY2FucGxheSk7XHJcbiAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgLy8gYmVnaW4gcGxheWJhY2sgYXQgY3VycmVudFRpbWU6IDBcclxuICAgICAgICAgICAgICBhdWRpb0Nsb25lLnBsYXkoKTtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgfVxyXG5cclxuICAgICAgcmV0dXJuIHM7XHJcblxyXG4gICAgfTtcclxuXHJcbiAgICAvLyBqdXN0IGZvciBjb252ZW5pZW5jZVxyXG4gICAgdGhpcy5zdGFydCA9IHRoaXMucGxheTtcclxuXHJcbiAgICAvKipcclxuICAgICAqIFN0b3BzIHBsYXlpbmcgYSBzb3VuZCAoYW5kIG9wdGlvbmFsbHksIGFsbCBzb3VuZHMpXHJcbiAgICAgKlxyXG4gICAgICogQHBhcmFtIHtib29sZWFufSBiQWxsIE9wdGlvbmFsOiBXaGV0aGVyIHRvIHN0b3AgYWxsIHNvdW5kc1xyXG4gICAgICogQHJldHVybiB7U01Tb3VuZH0gVGhlIFNNU291bmQgb2JqZWN0XHJcbiAgICAgKi9cclxuXHJcbiAgICB0aGlzLnN0b3AgPSBmdW5jdGlvbihiQWxsKSB7XHJcblxyXG4gICAgICB2YXIgaW5zdGFuY2VPcHRpb25zID0gcy5faU8sXHJcbiAgICAgICAgICBvcmlnaW5hbFBvc2l0aW9uO1xyXG5cclxuICAgICAgaWYgKHMucGxheVN0YXRlID09PSAxKSB7XHJcblxyXG4gICAgICAgIHNtMi5fd0Qocy5pZCArICc6IHN0b3AoKScpO1xyXG5cclxuICAgICAgICBzLl9vbmJ1ZmZlcmNoYW5nZSgwKTtcclxuICAgICAgICBzLl9yZXNldE9uUG9zaXRpb24oMCk7XHJcbiAgICAgICAgcy5wYXVzZWQgPSBmYWxzZTtcclxuXHJcbiAgICAgICAgaWYgKCFzLmlzSFRNTDUpIHtcclxuICAgICAgICAgIHMucGxheVN0YXRlID0gMDtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8vIHJlbW92ZSBvblBvc2l0aW9uIGxpc3RlbmVycywgaWYgYW55XHJcbiAgICAgICAgZGV0YWNoT25Qb3NpdGlvbigpO1xyXG5cclxuICAgICAgICAvLyBhbmQgXCJ0b1wiIHBvc2l0aW9uLCBpZiBzZXRcclxuICAgICAgICBpZiAoaW5zdGFuY2VPcHRpb25zLnRvKSB7XHJcbiAgICAgICAgICBzLmNsZWFyT25Qb3NpdGlvbihpbnN0YW5jZU9wdGlvbnMudG8pO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgaWYgKCFzLmlzSFRNTDUpIHtcclxuXHJcbiAgICAgICAgICBmbGFzaC5fc3RvcChzLmlkLCBiQWxsKTtcclxuXHJcbiAgICAgICAgICAvLyBoYWNrIGZvciBuZXRTdHJlYW06IGp1c3QgdW5sb2FkXHJcbiAgICAgICAgICBpZiAoaW5zdGFuY2VPcHRpb25zLnNlcnZlclVSTCkge1xyXG4gICAgICAgICAgICBzLnVubG9hZCgpO1xyXG4gICAgICAgICAgfVxyXG5cclxuICAgICAgICB9IGVsc2Uge1xyXG5cclxuICAgICAgICAgIGlmIChzLl9hKSB7XHJcblxyXG4gICAgICAgICAgICBvcmlnaW5hbFBvc2l0aW9uID0gcy5wb3NpdGlvbjtcclxuXHJcbiAgICAgICAgICAgIC8vIGFjdCBsaWtlIEZsYXNoLCB0aG91Z2hcclxuICAgICAgICAgICAgcy5zZXRQb3NpdGlvbigwKTtcclxuXHJcbiAgICAgICAgICAgIC8vIGhhY2s6IHJlZmxlY3Qgb2xkIHBvc2l0aW9uIGZvciBvbnN0b3AoKSAoYWxzbyBsaWtlIEZsYXNoKVxyXG4gICAgICAgICAgICBzLnBvc2l0aW9uID0gb3JpZ2luYWxQb3NpdGlvbjtcclxuXHJcbiAgICAgICAgICAgIC8vIGh0bWw1IGhhcyBubyBzdG9wKClcclxuICAgICAgICAgICAgLy8gTk9URTogcGF1c2luZyBtZWFucyBpT1MgcmVxdWlyZXMgaW50ZXJhY3Rpb24gdG8gcmVzdW1lLlxyXG4gICAgICAgICAgICBzLl9hLnBhdXNlKCk7XHJcblxyXG4gICAgICAgICAgICBzLnBsYXlTdGF0ZSA9IDA7XHJcblxyXG4gICAgICAgICAgICAvLyBhbmQgdXBkYXRlIFVJXHJcbiAgICAgICAgICAgIHMuX29uVGltZXIoKTtcclxuXHJcbiAgICAgICAgICAgIHN0b3BfaHRtbDVfdGltZXIoKTtcclxuXHJcbiAgICAgICAgICB9XHJcblxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcy5pbnN0YW5jZUNvdW50ID0gMDtcclxuICAgICAgICBzLl9pTyA9IHt9O1xyXG5cclxuICAgICAgICBpZiAoaW5zdGFuY2VPcHRpb25zLm9uc3RvcCkge1xyXG4gICAgICAgICAgaW5zdGFuY2VPcHRpb25zLm9uc3RvcC5hcHBseShzKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICB9XHJcblxyXG4gICAgICByZXR1cm4gcztcclxuXHJcbiAgICB9O1xyXG5cclxuICAgIC8qKlxyXG4gICAgICogVW5kb2N1bWVudGVkL2ludGVybmFsOiBTZXRzIGF1dG9QbGF5IGZvciBSVE1QLlxyXG4gICAgICpcclxuICAgICAqIEBwYXJhbSB7Ym9vbGVhbn0gYXV0b1BsYXkgc3RhdGVcclxuICAgICAqL1xyXG5cclxuICAgIHRoaXMuc2V0QXV0b1BsYXkgPSBmdW5jdGlvbihhdXRvUGxheSkge1xyXG5cclxuICAgICAgc20yLl93RChzLmlkICsgJzogQXV0b3BsYXkgdHVybmVkICcgKyAoYXV0b1BsYXkgPyAnb24nIDogJ29mZicpKTtcclxuICAgICAgcy5faU8uYXV0b1BsYXkgPSBhdXRvUGxheTtcclxuXHJcbiAgICAgIGlmICghcy5pc0hUTUw1KSB7XHJcbiAgICAgICAgZmxhc2guX3NldEF1dG9QbGF5KHMuaWQsIGF1dG9QbGF5KTtcclxuICAgICAgICBpZiAoYXV0b1BsYXkpIHtcclxuICAgICAgICAgIC8vIG9ubHkgaW5jcmVtZW50IHRoZSBpbnN0YW5jZUNvdW50IGlmIHRoZSBzb3VuZCBpc24ndCBsb2FkZWQgKFRPRE86IHZlcmlmeSBSVE1QKVxyXG4gICAgICAgICAgaWYgKCFzLmluc3RhbmNlQ291bnQgJiYgcy5yZWFkeVN0YXRlID09PSAxKSB7XHJcbiAgICAgICAgICAgIHMuaW5zdGFuY2VDb3VudCsrO1xyXG4gICAgICAgICAgICBzbTIuX3dEKHMuaWQgKyAnOiBJbmNyZW1lbnRlZCBpbnN0YW5jZSBjb3VudCB0byAnK3MuaW5zdGFuY2VDb3VudCk7XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcblxyXG4gICAgfTtcclxuXHJcbiAgICAvKipcclxuICAgICAqIFVuZG9jdW1lbnRlZC9pbnRlcm5hbDogUmV0dXJucyB0aGUgYXV0b1BsYXkgYm9vbGVhbi5cclxuICAgICAqXHJcbiAgICAgKiBAcmV0dXJuIHtib29sZWFufSBUaGUgY3VycmVudCBhdXRvUGxheSB2YWx1ZVxyXG4gICAgICovXHJcblxyXG4gICAgdGhpcy5nZXRBdXRvUGxheSA9IGZ1bmN0aW9uKCkge1xyXG5cclxuICAgICAgcmV0dXJuIHMuX2lPLmF1dG9QbGF5O1xyXG5cclxuICAgIH07XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBTZXRzIHRoZSBwb3NpdGlvbiBvZiBhIHNvdW5kLlxyXG4gICAgICpcclxuICAgICAqIEBwYXJhbSB7bnVtYmVyfSBuTXNlY09mZnNldCBQb3NpdGlvbiAobWlsbGlzZWNvbmRzKVxyXG4gICAgICogQHJldHVybiB7U01Tb3VuZH0gVGhlIFNNU291bmQgb2JqZWN0XHJcbiAgICAgKi9cclxuXHJcbiAgICB0aGlzLnNldFBvc2l0aW9uID0gZnVuY3Rpb24obk1zZWNPZmZzZXQpIHtcclxuXHJcbiAgICAgIGlmIChuTXNlY09mZnNldCA9PT0gX3VuZGVmaW5lZCkge1xyXG4gICAgICAgIG5Nc2VjT2Zmc2V0ID0gMDtcclxuICAgICAgfVxyXG5cclxuICAgICAgdmFyIHBvc2l0aW9uLCBwb3NpdGlvbjFLLFxyXG4gICAgICAgICAgLy8gVXNlIHRoZSBkdXJhdGlvbiBmcm9tIHRoZSBpbnN0YW5jZSBvcHRpb25zLCBpZiB3ZSBkb24ndCBoYXZlIGEgdHJhY2sgZHVyYXRpb24geWV0LlxyXG4gICAgICAgICAgLy8gcG9zaXRpb24gPj0gMCBhbmQgPD0gY3VycmVudCBhdmFpbGFibGUgKGxvYWRlZCkgZHVyYXRpb25cclxuICAgICAgICAgIG9mZnNldCA9IChzLmlzSFRNTDUgPyBNYXRoLm1heChuTXNlY09mZnNldCwgMCkgOiBNYXRoLm1pbihzLmR1cmF0aW9uIHx8IHMuX2lPLmR1cmF0aW9uLCBNYXRoLm1heChuTXNlY09mZnNldCwgMCkpKTtcclxuXHJcbiAgICAgIHMucG9zaXRpb24gPSBvZmZzZXQ7XHJcbiAgICAgIHBvc2l0aW9uMUsgPSBzLnBvc2l0aW9uL21zZWNTY2FsZTtcclxuICAgICAgcy5fcmVzZXRPblBvc2l0aW9uKHMucG9zaXRpb24pO1xyXG4gICAgICBzLl9pTy5wb3NpdGlvbiA9IG9mZnNldDtcclxuXHJcbiAgICAgIGlmICghcy5pc0hUTUw1KSB7XHJcblxyXG4gICAgICAgIHBvc2l0aW9uID0gKGZWID09PSA5ID8gcy5wb3NpdGlvbiA6IHBvc2l0aW9uMUspO1xyXG5cclxuICAgICAgICBpZiAocy5yZWFkeVN0YXRlICYmIHMucmVhZHlTdGF0ZSAhPT0gMikge1xyXG4gICAgICAgICAgLy8gaWYgcGF1c2VkIG9yIG5vdCBwbGF5aW5nLCB3aWxsIG5vdCByZXN1bWUgKGJ5IHBsYXlpbmcpXHJcbiAgICAgICAgICBmbGFzaC5fc2V0UG9zaXRpb24ocy5pZCwgcG9zaXRpb24sIChzLnBhdXNlZCB8fCAhcy5wbGF5U3RhdGUpLCBzLl9pTy5tdWx0aVNob3QpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgIH0gZWxzZSBpZiAocy5fYSkge1xyXG5cclxuICAgICAgICAvLyBTZXQgdGhlIHBvc2l0aW9uIGluIHRoZSBjYW5wbGF5IGhhbmRsZXIgaWYgdGhlIHNvdW5kIGlzIG5vdCByZWFkeSB5ZXRcclxuICAgICAgICBpZiAocy5faHRtbDVfY2FucGxheSkge1xyXG5cclxuICAgICAgICAgIGlmIChzLl9hLmN1cnJlbnRUaW1lICE9PSBwb3NpdGlvbjFLKSB7XHJcblxyXG4gICAgICAgICAgICAvKipcclxuICAgICAgICAgICAgICogRE9NL0pTIGVycm9ycy9leGNlcHRpb25zIHRvIHdhdGNoIG91dCBmb3I6XHJcbiAgICAgICAgICAgICAqIGlmIHNlZWsgaXMgYmV5b25kIChsb2FkZWQ/KSBwb3NpdGlvbiwgXCJET00gZXhjZXB0aW9uIDExXCJcclxuICAgICAgICAgICAgICogXCJJTkRFWF9TSVpFX0VSUlwiOiBET00gZXhjZXB0aW9uIDFcclxuICAgICAgICAgICAgICovXHJcbiAgICAgICAgICAgIHNtMi5fd0Qocy5pZCArICc6IHNldFBvc2l0aW9uKCcrcG9zaXRpb24xSysnKScpO1xyXG5cclxuICAgICAgICAgICAgdHJ5IHtcclxuICAgICAgICAgICAgICBzLl9hLmN1cnJlbnRUaW1lID0gcG9zaXRpb24xSztcclxuICAgICAgICAgICAgICBpZiAocy5wbGF5U3RhdGUgPT09IDAgfHwgcy5wYXVzZWQpIHtcclxuICAgICAgICAgICAgICAgIC8vIGFsbG93IHNlZWsgd2l0aG91dCBhdXRvLXBsYXkvcmVzdW1lXHJcbiAgICAgICAgICAgICAgICBzLl9hLnBhdXNlKCk7XHJcbiAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9IGNhdGNoKGUpIHtcclxuICAgICAgICAgICAgICBzbTIuX3dEKHMuaWQgKyAnOiBzZXRQb3NpdGlvbignICsgcG9zaXRpb24xSyArICcpIGZhaWxlZDogJyArIGUubWVzc2FnZSwgMik7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICB9XHJcblxyXG4gICAgICAgIH0gZWxzZSBpZiAocG9zaXRpb24xSykge1xyXG5cclxuICAgICAgICAgIC8vIHdhcm4gb24gbm9uLXplcm8gc2VlayBhdHRlbXB0c1xyXG4gICAgICAgICAgc20yLl93RChzLmlkICsgJzogc2V0UG9zaXRpb24oJyArIHBvc2l0aW9uMUsgKyAnKTogQ2Fubm90IHNlZWsgeWV0LCBzb3VuZCBub3QgcmVhZHknLCAyKTtcclxuICAgICAgICAgIHJldHVybiBzO1xyXG5cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGlmIChzLnBhdXNlZCkge1xyXG5cclxuICAgICAgICAgIC8vIGlmIHBhdXNlZCwgcmVmcmVzaCBVSSByaWdodCBhd2F5XHJcbiAgICAgICAgICAvLyBmb3JjZSB1cGRhdGVcclxuICAgICAgICAgIHMuX29uVGltZXIodHJ1ZSk7XHJcblxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgIH1cclxuXHJcbiAgICAgIHJldHVybiBzO1xyXG5cclxuICAgIH07XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBQYXVzZXMgc291bmQgcGxheWJhY2suXHJcbiAgICAgKlxyXG4gICAgICogQHJldHVybiB7U01Tb3VuZH0gVGhlIFNNU291bmQgb2JqZWN0XHJcbiAgICAgKi9cclxuXHJcbiAgICB0aGlzLnBhdXNlID0gZnVuY3Rpb24oX2JDYWxsRmxhc2gpIHtcclxuXHJcbiAgICAgIGlmIChzLnBhdXNlZCB8fCAocy5wbGF5U3RhdGUgPT09IDAgJiYgcy5yZWFkeVN0YXRlICE9PSAxKSkge1xyXG4gICAgICAgIHJldHVybiBzO1xyXG4gICAgICB9XHJcblxyXG4gICAgICBzbTIuX3dEKHMuaWQgKyAnOiBwYXVzZSgpJyk7XHJcbiAgICAgIHMucGF1c2VkID0gdHJ1ZTtcclxuXHJcbiAgICAgIGlmICghcy5pc0hUTUw1KSB7XHJcbiAgICAgICAgaWYgKF9iQ2FsbEZsYXNoIHx8IF9iQ2FsbEZsYXNoID09PSBfdW5kZWZpbmVkKSB7XHJcbiAgICAgICAgICBmbGFzaC5fcGF1c2Uocy5pZCwgcy5faU8ubXVsdGlTaG90KTtcclxuICAgICAgICB9XHJcbiAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgcy5fc2V0dXBfaHRtbDUoKS5wYXVzZSgpO1xyXG4gICAgICAgIHN0b3BfaHRtbDVfdGltZXIoKTtcclxuICAgICAgfVxyXG5cclxuICAgICAgaWYgKHMuX2lPLm9ucGF1c2UpIHtcclxuICAgICAgICBzLl9pTy5vbnBhdXNlLmFwcGx5KHMpO1xyXG4gICAgICB9XHJcblxyXG4gICAgICByZXR1cm4gcztcclxuXHJcbiAgICB9O1xyXG5cclxuICAgIC8qKlxyXG4gICAgICogUmVzdW1lcyBzb3VuZCBwbGF5YmFjay5cclxuICAgICAqXHJcbiAgICAgKiBAcmV0dXJuIHtTTVNvdW5kfSBUaGUgU01Tb3VuZCBvYmplY3RcclxuICAgICAqL1xyXG5cclxuICAgIC8qKlxyXG4gICAgICogV2hlbiBhdXRvLWxvYWRlZCBzdHJlYW1zIHBhdXNlIG9uIGJ1ZmZlciBmdWxsIHRoZXkgaGF2ZSBhIHBsYXlTdGF0ZSBvZiAwLlxyXG4gICAgICogV2UgbmVlZCB0byBtYWtlIHN1cmUgdGhhdCB0aGUgcGxheVN0YXRlIGlzIHNldCB0byAxIHdoZW4gdGhlc2Ugc3RyZWFtcyBcInJlc3VtZVwiLlxyXG4gICAgICogV2hlbiBhIHBhdXNlZCBzdHJlYW0gaXMgcmVzdW1lZCwgd2UgbmVlZCB0byB0cmlnZ2VyIHRoZSBvbnBsYXkoKSBjYWxsYmFjayBpZiBpdFxyXG4gICAgICogaGFzbid0IGJlZW4gY2FsbGVkIGFscmVhZHkuIEluIHRoaXMgY2FzZSBzaW5jZSB0aGUgc291bmQgaXMgYmVpbmcgcGxheWVkIGZvciB0aGVcclxuICAgICAqIGZpcnN0IHRpbWUsIEkgdGhpbmsgaXQncyBtb3JlIGFwcHJvcHJpYXRlIHRvIGNhbGwgb25wbGF5KCkgcmF0aGVyIHRoYW4gb25yZXN1bWUoKS5cclxuICAgICAqL1xyXG5cclxuICAgIHRoaXMucmVzdW1lID0gZnVuY3Rpb24oKSB7XHJcblxyXG4gICAgICB2YXIgaW5zdGFuY2VPcHRpb25zID0gcy5faU87XHJcblxyXG4gICAgICBpZiAoIXMucGF1c2VkKSB7XHJcbiAgICAgICAgcmV0dXJuIHM7XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIHNtMi5fd0Qocy5pZCArICc6IHJlc3VtZSgpJyk7XHJcbiAgICAgIHMucGF1c2VkID0gZmFsc2U7XHJcbiAgICAgIHMucGxheVN0YXRlID0gMTtcclxuXHJcbiAgICAgIGlmICghcy5pc0hUTUw1KSB7XHJcbiAgICAgICAgaWYgKGluc3RhbmNlT3B0aW9ucy5pc01vdmllU3RhciAmJiAhaW5zdGFuY2VPcHRpb25zLnNlcnZlclVSTCkge1xyXG4gICAgICAgICAgLy8gQml6YXJyZSBXZWJraXQgYnVnIChDaHJvbWUgcmVwb3J0ZWQgdmlhIDh0cmFja3MuY29tIGR1ZGVzKTogQUFDIGNvbnRlbnQgcGF1c2VkIGZvciAzMCsgc2Vjb25kcyg/KSB3aWxsIG5vdCByZXN1bWUgd2l0aG91dCBhIHJlcG9zaXRpb24uXHJcbiAgICAgICAgICBzLnNldFBvc2l0aW9uKHMucG9zaXRpb24pO1xyXG4gICAgICAgIH1cclxuICAgICAgICAvLyBmbGFzaCBtZXRob2QgaXMgdG9nZ2xlLWJhc2VkIChwYXVzZS9yZXN1bWUpXHJcbiAgICAgICAgZmxhc2guX3BhdXNlKHMuaWQsIGluc3RhbmNlT3B0aW9ucy5tdWx0aVNob3QpO1xyXG4gICAgICB9IGVsc2Uge1xyXG4gICAgICAgIHMuX3NldHVwX2h0bWw1KCkucGxheSgpO1xyXG4gICAgICAgIHN0YXJ0X2h0bWw1X3RpbWVyKCk7XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIGlmICghb25wbGF5X2NhbGxlZCAmJiBpbnN0YW5jZU9wdGlvbnMub25wbGF5KSB7XHJcbiAgICAgICAgaW5zdGFuY2VPcHRpb25zLm9ucGxheS5hcHBseShzKTtcclxuICAgICAgICBvbnBsYXlfY2FsbGVkID0gdHJ1ZTtcclxuICAgICAgfSBlbHNlIGlmIChpbnN0YW5jZU9wdGlvbnMub25yZXN1bWUpIHtcclxuICAgICAgICBpbnN0YW5jZU9wdGlvbnMub25yZXN1bWUuYXBwbHkocyk7XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIHJldHVybiBzO1xyXG5cclxuICAgIH07XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBUb2dnbGVzIHNvdW5kIHBsYXliYWNrLlxyXG4gICAgICpcclxuICAgICAqIEByZXR1cm4ge1NNU291bmR9IFRoZSBTTVNvdW5kIG9iamVjdFxyXG4gICAgICovXHJcblxyXG4gICAgdGhpcy50b2dnbGVQYXVzZSA9IGZ1bmN0aW9uKCkge1xyXG5cclxuICAgICAgc20yLl93RChzLmlkICsgJzogdG9nZ2xlUGF1c2UoKScpO1xyXG5cclxuICAgICAgaWYgKHMucGxheVN0YXRlID09PSAwKSB7XHJcbiAgICAgICAgcy5wbGF5KHtcclxuICAgICAgICAgIHBvc2l0aW9uOiAoZlYgPT09IDkgJiYgIXMuaXNIVE1MNSA/IHMucG9zaXRpb24gOiBzLnBvc2l0aW9uIC8gbXNlY1NjYWxlKVxyXG4gICAgICAgIH0pO1xyXG4gICAgICAgIHJldHVybiBzO1xyXG4gICAgICB9XHJcblxyXG4gICAgICBpZiAocy5wYXVzZWQpIHtcclxuICAgICAgICBzLnJlc3VtZSgpO1xyXG4gICAgICB9IGVsc2Uge1xyXG4gICAgICAgIHMucGF1c2UoKTtcclxuICAgICAgfVxyXG5cclxuICAgICAgcmV0dXJuIHM7XHJcblxyXG4gICAgfTtcclxuXHJcbiAgICAvKipcclxuICAgICAqIFNldHMgdGhlIHBhbm5pbmcgKEwtUikgZWZmZWN0LlxyXG4gICAgICpcclxuICAgICAqIEBwYXJhbSB7bnVtYmVyfSBuUGFuIFRoZSBwYW4gdmFsdWUgKC0xMDAgdG8gMTAwKVxyXG4gICAgICogQHJldHVybiB7U01Tb3VuZH0gVGhlIFNNU291bmQgb2JqZWN0XHJcbiAgICAgKi9cclxuXHJcbiAgICB0aGlzLnNldFBhbiA9IGZ1bmN0aW9uKG5QYW4sIGJJbnN0YW5jZU9ubHkpIHtcclxuXHJcbiAgICAgIGlmIChuUGFuID09PSBfdW5kZWZpbmVkKSB7XHJcbiAgICAgICAgblBhbiA9IDA7XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIGlmIChiSW5zdGFuY2VPbmx5ID09PSBfdW5kZWZpbmVkKSB7XHJcbiAgICAgICAgYkluc3RhbmNlT25seSA9IGZhbHNlO1xyXG4gICAgICB9XHJcblxyXG4gICAgICBpZiAoIXMuaXNIVE1MNSkge1xyXG4gICAgICAgIGZsYXNoLl9zZXRQYW4ocy5pZCwgblBhbik7XHJcbiAgICAgIH0gLy8gZWxzZSB7IG5vIEhUTUw1IHBhbj8gfVxyXG5cclxuICAgICAgcy5faU8ucGFuID0gblBhbjtcclxuXHJcbiAgICAgIGlmICghYkluc3RhbmNlT25seSkge1xyXG4gICAgICAgIHMucGFuID0gblBhbjtcclxuICAgICAgICBzLm9wdGlvbnMucGFuID0gblBhbjtcclxuICAgICAgfVxyXG5cclxuICAgICAgcmV0dXJuIHM7XHJcblxyXG4gICAgfTtcclxuXHJcbiAgICAvKipcclxuICAgICAqIFNldHMgdGhlIHZvbHVtZS5cclxuICAgICAqXHJcbiAgICAgKiBAcGFyYW0ge251bWJlcn0gblZvbCBUaGUgdm9sdW1lIHZhbHVlICgwIHRvIDEwMClcclxuICAgICAqIEByZXR1cm4ge1NNU291bmR9IFRoZSBTTVNvdW5kIG9iamVjdFxyXG4gICAgICovXHJcblxyXG4gICAgdGhpcy5zZXRWb2x1bWUgPSBmdW5jdGlvbihuVm9sLCBfYkluc3RhbmNlT25seSkge1xyXG5cclxuICAgICAgLyoqXHJcbiAgICAgICAqIE5vdGU6IFNldHRpbmcgdm9sdW1lIGhhcyBubyBlZmZlY3Qgb24gaU9TIFwic3BlY2lhbCBzbm93Zmxha2VcIiBkZXZpY2VzLlxyXG4gICAgICAgKiBIYXJkd2FyZSB2b2x1bWUgY29udHJvbCBvdmVycmlkZXMgc29mdHdhcmUsIGFuZCB2b2x1bWVcclxuICAgICAgICogd2lsbCBhbHdheXMgcmV0dXJuIDEgcGVyIEFwcGxlIGRvY3MuIChpT1MgNCArIDUuKVxyXG4gICAgICAgKiBodHRwOi8vZGV2ZWxvcGVyLmFwcGxlLmNvbS9saWJyYXJ5L3NhZmFyaS9kb2N1bWVudGF0aW9uL0F1ZGlvVmlkZW8vQ29uY2VwdHVhbC9IVE1MLWNhbnZhcy1ndWlkZS9BZGRpbmdTb3VuZHRvQ2FudmFzQW5pbWF0aW9ucy9BZGRpbmdTb3VuZHRvQ2FudmFzQW5pbWF0aW9ucy5odG1sXHJcbiAgICAgICAqL1xyXG5cclxuICAgICAgaWYgKG5Wb2wgPT09IF91bmRlZmluZWQpIHtcclxuICAgICAgICBuVm9sID0gMTAwO1xyXG4gICAgICB9XHJcblxyXG4gICAgICBpZiAoX2JJbnN0YW5jZU9ubHkgPT09IF91bmRlZmluZWQpIHtcclxuICAgICAgICBfYkluc3RhbmNlT25seSA9IGZhbHNlO1xyXG4gICAgICB9XHJcblxyXG4gICAgICBpZiAoIXMuaXNIVE1MNSkge1xyXG4gICAgICAgIGZsYXNoLl9zZXRWb2x1bWUocy5pZCwgKHNtMi5tdXRlZCAmJiAhcy5tdXRlZCkgfHwgcy5tdXRlZD8wOm5Wb2wpO1xyXG4gICAgICB9IGVsc2UgaWYgKHMuX2EpIHtcclxuICAgICAgICBpZiAoc20yLm11dGVkICYmICFzLm11dGVkKSB7XHJcbiAgICAgICAgICBzLm11dGVkID0gdHJ1ZTtcclxuICAgICAgICAgIHMuX2EubXV0ZWQgPSB0cnVlO1xyXG4gICAgICAgIH1cclxuICAgICAgICAvLyB2YWxpZCByYW5nZTogMC0xXHJcbiAgICAgICAgcy5fYS52b2x1bWUgPSBNYXRoLm1heCgwLCBNYXRoLm1pbigxLCBuVm9sLzEwMCkpO1xyXG4gICAgICB9XHJcblxyXG4gICAgICBzLl9pTy52b2x1bWUgPSBuVm9sO1xyXG5cclxuICAgICAgaWYgKCFfYkluc3RhbmNlT25seSkge1xyXG4gICAgICAgIHMudm9sdW1lID0gblZvbDtcclxuICAgICAgICBzLm9wdGlvbnMudm9sdW1lID0gblZvbDtcclxuICAgICAgfVxyXG5cclxuICAgICAgcmV0dXJuIHM7XHJcblxyXG4gICAgfTtcclxuXHJcbiAgICAvKipcclxuICAgICAqIE11dGVzIHRoZSBzb3VuZC5cclxuICAgICAqXHJcbiAgICAgKiBAcmV0dXJuIHtTTVNvdW5kfSBUaGUgU01Tb3VuZCBvYmplY3RcclxuICAgICAqL1xyXG5cclxuICAgIHRoaXMubXV0ZSA9IGZ1bmN0aW9uKCkge1xyXG5cclxuICAgICAgcy5tdXRlZCA9IHRydWU7XHJcblxyXG4gICAgICBpZiAoIXMuaXNIVE1MNSkge1xyXG4gICAgICAgIGZsYXNoLl9zZXRWb2x1bWUocy5pZCwgMCk7XHJcbiAgICAgIH0gZWxzZSBpZiAocy5fYSkge1xyXG4gICAgICAgIHMuX2EubXV0ZWQgPSB0cnVlO1xyXG4gICAgICB9XHJcblxyXG4gICAgICByZXR1cm4gcztcclxuXHJcbiAgICB9O1xyXG5cclxuICAgIC8qKlxyXG4gICAgICogVW5tdXRlcyB0aGUgc291bmQuXHJcbiAgICAgKlxyXG4gICAgICogQHJldHVybiB7U01Tb3VuZH0gVGhlIFNNU291bmQgb2JqZWN0XHJcbiAgICAgKi9cclxuXHJcbiAgICB0aGlzLnVubXV0ZSA9IGZ1bmN0aW9uKCkge1xyXG5cclxuICAgICAgcy5tdXRlZCA9IGZhbHNlO1xyXG4gICAgICB2YXIgaGFzSU8gPSAocy5faU8udm9sdW1lICE9PSBfdW5kZWZpbmVkKTtcclxuXHJcbiAgICAgIGlmICghcy5pc0hUTUw1KSB7XHJcbiAgICAgICAgZmxhc2guX3NldFZvbHVtZShzLmlkLCBoYXNJTz9zLl9pTy52b2x1bWU6cy5vcHRpb25zLnZvbHVtZSk7XHJcbiAgICAgIH0gZWxzZSBpZiAocy5fYSkge1xyXG4gICAgICAgIHMuX2EubXV0ZWQgPSBmYWxzZTtcclxuICAgICAgfVxyXG5cclxuICAgICAgcmV0dXJuIHM7XHJcblxyXG4gICAgfTtcclxuXHJcbiAgICAvKipcclxuICAgICAqIFRvZ2dsZXMgdGhlIG11dGVkIHN0YXRlIG9mIGEgc291bmQuXHJcbiAgICAgKlxyXG4gICAgICogQHJldHVybiB7U01Tb3VuZH0gVGhlIFNNU291bmQgb2JqZWN0XHJcbiAgICAgKi9cclxuXHJcbiAgICB0aGlzLnRvZ2dsZU11dGUgPSBmdW5jdGlvbigpIHtcclxuXHJcbiAgICAgIHJldHVybiAocy5tdXRlZD9zLnVubXV0ZSgpOnMubXV0ZSgpKTtcclxuXHJcbiAgICB9O1xyXG5cclxuICAgIC8qKlxyXG4gICAgICogUmVnaXN0ZXJzIGEgY2FsbGJhY2sgdG8gYmUgZmlyZWQgd2hlbiBhIHNvdW5kIHJlYWNoZXMgYSBnaXZlbiBwb3NpdGlvbiBkdXJpbmcgcGxheWJhY2suXHJcbiAgICAgKlxyXG4gICAgICogQHBhcmFtIHtudW1iZXJ9IG5Qb3NpdGlvbiBUaGUgcG9zaXRpb24gdG8gd2F0Y2ggZm9yXHJcbiAgICAgKiBAcGFyYW0ge2Z1bmN0aW9ufSBvTWV0aG9kIFRoZSByZWxldmFudCBjYWxsYmFjayB0byBmaXJlXHJcbiAgICAgKiBAcGFyYW0ge29iamVjdH0gb1Njb3BlIE9wdGlvbmFsOiBUaGUgc2NvcGUgdG8gYXBwbHkgdGhlIGNhbGxiYWNrIHRvXHJcbiAgICAgKiBAcmV0dXJuIHtTTVNvdW5kfSBUaGUgU01Tb3VuZCBvYmplY3RcclxuICAgICAqL1xyXG5cclxuICAgIHRoaXMub25Qb3NpdGlvbiA9IGZ1bmN0aW9uKG5Qb3NpdGlvbiwgb01ldGhvZCwgb1Njb3BlKSB7XHJcblxyXG4gICAgICAvLyBUT0RPOiBiYXNpYyBkdXBlIGNoZWNraW5nP1xyXG5cclxuICAgICAgb25Qb3NpdGlvbkl0ZW1zLnB1c2goe1xyXG4gICAgICAgIHBvc2l0aW9uOiBwYXJzZUludChuUG9zaXRpb24sIDEwKSxcclxuICAgICAgICBtZXRob2Q6IG9NZXRob2QsXHJcbiAgICAgICAgc2NvcGU6IChvU2NvcGUgIT09IF91bmRlZmluZWQgPyBvU2NvcGUgOiBzKSxcclxuICAgICAgICBmaXJlZDogZmFsc2VcclxuICAgICAgfSk7XHJcblxyXG4gICAgICByZXR1cm4gcztcclxuXHJcbiAgICB9O1xyXG5cclxuICAgIC8vIGxlZ2FjeS9iYWNrd2FyZHMtY29tcGFiaWxpdHk6IGxvd2VyLWNhc2UgbWV0aG9kIG5hbWVcclxuICAgIHRoaXMub25wb3NpdGlvbiA9IHRoaXMub25Qb3NpdGlvbjtcclxuXHJcbiAgICAvKipcclxuICAgICAqIFJlbW92ZXMgcmVnaXN0ZXJlZCBjYWxsYmFjayhzKSBmcm9tIGEgc291bmQsIGJ5IHBvc2l0aW9uIGFuZC9vciBjYWxsYmFjay5cclxuICAgICAqXHJcbiAgICAgKiBAcGFyYW0ge251bWJlcn0gblBvc2l0aW9uIFRoZSBwb3NpdGlvbiB0byBjbGVhciBjYWxsYmFjayhzKSBmb3JcclxuICAgICAqIEBwYXJhbSB7ZnVuY3Rpb259IG9NZXRob2QgT3B0aW9uYWw6IElkZW50aWZ5IG9uZSBjYWxsYmFjayB0byBiZSByZW1vdmVkIHdoZW4gbXVsdGlwbGUgbGlzdGVuZXJzIGV4aXN0IGZvciBvbmUgcG9zaXRpb25cclxuICAgICAqIEByZXR1cm4ge1NNU291bmR9IFRoZSBTTVNvdW5kIG9iamVjdFxyXG4gICAgICovXHJcblxyXG4gICAgdGhpcy5jbGVhck9uUG9zaXRpb24gPSBmdW5jdGlvbihuUG9zaXRpb24sIG9NZXRob2QpIHtcclxuXHJcbiAgICAgIHZhciBpO1xyXG5cclxuICAgICAgblBvc2l0aW9uID0gcGFyc2VJbnQoblBvc2l0aW9uLCAxMCk7XHJcblxyXG4gICAgICBpZiAoaXNOYU4oblBvc2l0aW9uKSkge1xyXG4gICAgICAgIC8vIHNhZmV0eSBjaGVja1xyXG4gICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgICAgfVxyXG5cclxuICAgICAgZm9yIChpPTA7IGkgPCBvblBvc2l0aW9uSXRlbXMubGVuZ3RoOyBpKyspIHtcclxuXHJcbiAgICAgICAgaWYgKG5Qb3NpdGlvbiA9PT0gb25Qb3NpdGlvbkl0ZW1zW2ldLnBvc2l0aW9uKSB7XHJcbiAgICAgICAgICAvLyByZW1vdmUgdGhpcyBpdGVtIGlmIG5vIG1ldGhvZCB3YXMgc3BlY2lmaWVkLCBvciwgaWYgdGhlIG1ldGhvZCBtYXRjaGVzXHJcbiAgICAgICAgICBpZiAoIW9NZXRob2QgfHwgKG9NZXRob2QgPT09IG9uUG9zaXRpb25JdGVtc1tpXS5tZXRob2QpKSB7XHJcbiAgICAgICAgICAgIGlmIChvblBvc2l0aW9uSXRlbXNbaV0uZmlyZWQpIHtcclxuICAgICAgICAgICAgICAvLyBkZWNyZW1lbnQgXCJmaXJlZFwiIGNvdW50ZXIsIHRvb1xyXG4gICAgICAgICAgICAgIG9uUG9zaXRpb25GaXJlZC0tO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIG9uUG9zaXRpb25JdGVtcy5zcGxpY2UoaSwgMSk7XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgfVxyXG5cclxuICAgIH07XHJcblxyXG4gICAgdGhpcy5fcHJvY2Vzc09uUG9zaXRpb24gPSBmdW5jdGlvbigpIHtcclxuXHJcbiAgICAgIHZhciBpLCBpdGVtLCBqID0gb25Qb3NpdGlvbkl0ZW1zLmxlbmd0aDtcclxuXHRcdFxyXG4gICAgICBpZiAoIWogfHwgIXMucGxheVN0YXRlIHx8IG9uUG9zaXRpb25GaXJlZCA+PSBqKSB7XHJcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgICB9XHJcblxyXG4gICAgICBmb3IgKGk9ai0xOyBpID49IDA7IGktLSkge1xyXG4gICAgICAgIGl0ZW0gPSBvblBvc2l0aW9uSXRlbXNbaV07XHJcbiAgICAgICAgaWYgKCFpdGVtLmZpcmVkICYmIHMucG9zaXRpb24gPj0gaXRlbS5wb3NpdGlvbikge1xyXG4gICAgICAgICAgaXRlbS5maXJlZCA9IHRydWU7XHJcbiAgICAgICAgICBvblBvc2l0aW9uRmlyZWQrKztcclxuICAgICAgICAgIGl0ZW0ubWV0aG9kLmFwcGx5KGl0ZW0uc2NvcGUsIFtpdGVtLnBvc2l0aW9uXSk7XHJcblx0XHQgIGogPSBvblBvc2l0aW9uSXRlbXMubGVuZ3RoOyAvLyAgcmVzZXQgaiAtLSBvblBvc2l0aW9uSXRlbXMubGVuZ3RoIGNhbiBiZSBjaGFuZ2VkIGluIHRoZSBpdGVtIGNhbGxiYWNrIGFib3ZlLi4uIG9jY2FzaW9uYWxseSBicmVha2luZyB0aGUgbG9vcC5cclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuXHRcclxuICAgICAgcmV0dXJuIHRydWU7XHJcblxyXG4gICAgfTtcclxuXHJcbiAgICB0aGlzLl9yZXNldE9uUG9zaXRpb24gPSBmdW5jdGlvbihuUG9zaXRpb24pIHtcclxuXHJcbiAgICAgIC8vIHJlc2V0IFwiZmlyZWRcIiBmb3IgaXRlbXMgaW50ZXJlc3RlZCBpbiB0aGlzIHBvc2l0aW9uXHJcbiAgICAgIHZhciBpLCBpdGVtLCBqID0gb25Qb3NpdGlvbkl0ZW1zLmxlbmd0aDtcclxuXHJcbiAgICAgIGlmICghaikge1xyXG4gICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgICAgfVxyXG5cclxuICAgICAgZm9yIChpPWotMTsgaSA+PSAwOyBpLS0pIHtcclxuICAgICAgICBpdGVtID0gb25Qb3NpdGlvbkl0ZW1zW2ldO1xyXG4gICAgICAgIGlmIChpdGVtLmZpcmVkICYmIG5Qb3NpdGlvbiA8PSBpdGVtLnBvc2l0aW9uKSB7XHJcbiAgICAgICAgICBpdGVtLmZpcmVkID0gZmFsc2U7XHJcbiAgICAgICAgICBvblBvc2l0aW9uRmlyZWQtLTtcclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIHJldHVybiB0cnVlO1xyXG5cclxuICAgIH07XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBTTVNvdW5kKCkgcHJpdmF0ZSBpbnRlcm5hbHNcclxuICAgICAqIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXHJcbiAgICAgKi9cclxuXHJcbiAgICBhcHBseUZyb21UbyA9IGZ1bmN0aW9uKCkge1xyXG5cclxuICAgICAgdmFyIGluc3RhbmNlT3B0aW9ucyA9IHMuX2lPLFxyXG4gICAgICAgICAgZiA9IGluc3RhbmNlT3B0aW9ucy5mcm9tLFxyXG4gICAgICAgICAgdCA9IGluc3RhbmNlT3B0aW9ucy50byxcclxuICAgICAgICAgIHN0YXJ0LCBlbmQ7XHJcblxyXG4gICAgICBlbmQgPSBmdW5jdGlvbigpIHtcclxuXHJcbiAgICAgICAgLy8gZW5kIGhhcyBiZWVuIHJlYWNoZWQuXHJcbiAgICAgICAgc20yLl93RChzLmlkICsgJzogXCJUb1wiIHRpbWUgb2YgJyArIHQgKyAnIHJlYWNoZWQuJyk7XHJcblxyXG4gICAgICAgIC8vIGRldGFjaCBsaXN0ZW5lclxyXG4gICAgICAgIHMuY2xlYXJPblBvc2l0aW9uKHQsIGVuZCk7XHJcblxyXG4gICAgICAgIC8vIHN0b3Agc2hvdWxkIGNsZWFyIHRoaXMsIHRvb1xyXG4gICAgICAgIHMuc3RvcCgpO1xyXG5cclxuICAgICAgfTtcclxuXHJcbiAgICAgIHN0YXJ0ID0gZnVuY3Rpb24oKSB7XHJcblxyXG4gICAgICAgIHNtMi5fd0Qocy5pZCArICc6IFBsYXlpbmcgXCJmcm9tXCIgJyArIGYpO1xyXG5cclxuICAgICAgICAvLyBhZGQgbGlzdGVuZXIgZm9yIGVuZFxyXG4gICAgICAgIGlmICh0ICE9PSBudWxsICYmICFpc05hTih0KSkge1xyXG4gICAgICAgICAgcy5vblBvc2l0aW9uKHQsIGVuZCk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgfTtcclxuXHJcbiAgICAgIGlmIChmICE9PSBudWxsICYmICFpc05hTihmKSkge1xyXG5cclxuICAgICAgICAvLyBhcHBseSB0byBpbnN0YW5jZSBvcHRpb25zLCBndWFyYW50ZWVpbmcgY29ycmVjdCBzdGFydCBwb3NpdGlvbi5cclxuICAgICAgICBpbnN0YW5jZU9wdGlvbnMucG9zaXRpb24gPSBmO1xyXG5cclxuICAgICAgICAvLyBtdWx0aVNob3QgdGltaW5nIGNhbid0IGJlIHRyYWNrZWQsIHNvIHByZXZlbnQgdGhhdC5cclxuICAgICAgICBpbnN0YW5jZU9wdGlvbnMubXVsdGlTaG90ID0gZmFsc2U7XHJcblxyXG4gICAgICAgIHN0YXJ0KCk7XHJcblxyXG4gICAgICB9XHJcblxyXG4gICAgICAvLyByZXR1cm4gdXBkYXRlZCBpbnN0YW5jZU9wdGlvbnMgaW5jbHVkaW5nIHN0YXJ0aW5nIHBvc2l0aW9uXHJcbiAgICAgIHJldHVybiBpbnN0YW5jZU9wdGlvbnM7XHJcblxyXG4gICAgfTtcclxuXHJcbiAgICBhdHRhY2hPblBvc2l0aW9uID0gZnVuY3Rpb24oKSB7XHJcblxyXG4gICAgICB2YXIgaXRlbSxcclxuICAgICAgICAgIG9wID0gcy5faU8ub25wb3NpdGlvbjtcclxuXHJcbiAgICAgIC8vIGF0dGFjaCBvbnBvc2l0aW9uIHRoaW5ncywgaWYgYW55LCBub3cuXHJcblxyXG4gICAgICBpZiAob3ApIHtcclxuXHJcbiAgICAgICAgZm9yIChpdGVtIGluIG9wKSB7XHJcbiAgICAgICAgICBpZiAob3AuaGFzT3duUHJvcGVydHkoaXRlbSkpIHtcclxuICAgICAgICAgICAgcy5vblBvc2l0aW9uKHBhcnNlSW50KGl0ZW0sIDEwKSwgb3BbaXRlbV0pO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgIH1cclxuXHJcbiAgICB9O1xyXG5cclxuICAgIGRldGFjaE9uUG9zaXRpb24gPSBmdW5jdGlvbigpIHtcclxuXHJcbiAgICAgIHZhciBpdGVtLFxyXG4gICAgICAgICAgb3AgPSBzLl9pTy5vbnBvc2l0aW9uO1xyXG5cclxuICAgICAgLy8gZGV0YWNoIGFueSBvbnBvc2l0aW9uKCktc3R5bGUgbGlzdGVuZXJzLlxyXG5cclxuICAgICAgaWYgKG9wKSB7XHJcblxyXG4gICAgICAgIGZvciAoaXRlbSBpbiBvcCkge1xyXG4gICAgICAgICAgaWYgKG9wLmhhc093blByb3BlcnR5KGl0ZW0pKSB7XHJcbiAgICAgICAgICAgIHMuY2xlYXJPblBvc2l0aW9uKHBhcnNlSW50KGl0ZW0sIDEwKSk7XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgfVxyXG5cclxuICAgIH07XHJcblxyXG4gICAgc3RhcnRfaHRtbDVfdGltZXIgPSBmdW5jdGlvbigpIHtcclxuXHJcbiAgICAgIGlmIChzLmlzSFRNTDUpIHtcclxuICAgICAgICBzdGFydFRpbWVyKHMpO1xyXG4gICAgICB9XHJcblxyXG4gICAgfTtcclxuXHJcbiAgICBzdG9wX2h0bWw1X3RpbWVyID0gZnVuY3Rpb24oKSB7XHJcblxyXG4gICAgICBpZiAocy5pc0hUTUw1KSB7XHJcbiAgICAgICAgc3RvcFRpbWVyKHMpO1xyXG4gICAgICB9XHJcblxyXG4gICAgfTtcclxuXHJcbiAgICByZXNldFByb3BlcnRpZXMgPSBmdW5jdGlvbihyZXRhaW5Qb3NpdGlvbikge1xyXG5cclxuICAgICAgaWYgKCFyZXRhaW5Qb3NpdGlvbikge1xyXG4gICAgICAgIG9uUG9zaXRpb25JdGVtcyA9IFtdO1xyXG4gICAgICAgIG9uUG9zaXRpb25GaXJlZCA9IDA7XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIG9ucGxheV9jYWxsZWQgPSBmYWxzZTtcclxuXHJcbiAgICAgIHMuX2hhc1RpbWVyID0gbnVsbDtcclxuICAgICAgcy5fYSA9IG51bGw7XHJcbiAgICAgIHMuX2h0bWw1X2NhbnBsYXkgPSBmYWxzZTtcclxuICAgICAgcy5ieXRlc0xvYWRlZCA9IG51bGw7XHJcbiAgICAgIHMuYnl0ZXNUb3RhbCA9IG51bGw7XHJcbiAgICAgIHMuZHVyYXRpb24gPSAocy5faU8gJiYgcy5faU8uZHVyYXRpb24gPyBzLl9pTy5kdXJhdGlvbiA6IG51bGwpO1xyXG4gICAgICBzLmR1cmF0aW9uRXN0aW1hdGUgPSBudWxsO1xyXG4gICAgICBzLmJ1ZmZlcmVkID0gW107XHJcblxyXG4gICAgICAvLyBsZWdhY3k6IDFEIGFycmF5XHJcbiAgICAgIHMuZXFEYXRhID0gW107XHJcblxyXG4gICAgICBzLmVxRGF0YS5sZWZ0ID0gW107XHJcbiAgICAgIHMuZXFEYXRhLnJpZ2h0ID0gW107XHJcblxyXG4gICAgICBzLmZhaWx1cmVzID0gMDtcclxuICAgICAgcy5pc0J1ZmZlcmluZyA9IGZhbHNlO1xyXG4gICAgICBzLmluc3RhbmNlT3B0aW9ucyA9IHt9O1xyXG4gICAgICBzLmluc3RhbmNlQ291bnQgPSAwO1xyXG4gICAgICBzLmxvYWRlZCA9IGZhbHNlO1xyXG4gICAgICBzLm1ldGFkYXRhID0ge307XHJcblxyXG4gICAgICAvLyAwID0gdW5pbml0aWFsaXNlZCwgMSA9IGxvYWRpbmcsIDIgPSBmYWlsZWQvZXJyb3IsIDMgPSBsb2FkZWQvc3VjY2Vzc1xyXG4gICAgICBzLnJlYWR5U3RhdGUgPSAwO1xyXG5cclxuICAgICAgcy5tdXRlZCA9IGZhbHNlO1xyXG4gICAgICBzLnBhdXNlZCA9IGZhbHNlO1xyXG5cclxuICAgICAgcy5wZWFrRGF0YSA9IHtcclxuICAgICAgICBsZWZ0OiAwLFxyXG4gICAgICAgIHJpZ2h0OiAwXHJcbiAgICAgIH07XHJcblxyXG4gICAgICBzLndhdmVmb3JtRGF0YSA9IHtcclxuICAgICAgICBsZWZ0OiBbXSxcclxuICAgICAgICByaWdodDogW11cclxuICAgICAgfTtcclxuXHJcbiAgICAgIHMucGxheVN0YXRlID0gMDtcclxuICAgICAgcy5wb3NpdGlvbiA9IG51bGw7XHJcblxyXG4gICAgICBzLmlkMyA9IHt9O1xyXG5cclxuICAgIH07XHJcblxyXG4gICAgcmVzZXRQcm9wZXJ0aWVzKCk7XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBQc2V1ZG8tcHJpdmF0ZSBTTVNvdW5kIGludGVybmFsc1xyXG4gICAgICogLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cclxuICAgICAqL1xyXG5cclxuICAgIHRoaXMuX29uVGltZXIgPSBmdW5jdGlvbihiRm9yY2UpIHtcclxuXHJcbiAgICAgIC8qKlxyXG4gICAgICAgKiBIVE1MNS1vbmx5IF93aGlsZXBsYXlpbmcoKSBldGMuXHJcbiAgICAgICAqIGNhbGxlZCBmcm9tIGJvdGggSFRNTDUgbmF0aXZlIGV2ZW50cywgYW5kIHBvbGxpbmcvaW50ZXJ2YWwtYmFzZWQgdGltZXJzXHJcbiAgICAgICAqIG1pbWljcyBmbGFzaCBhbmQgZmlyZXMgb25seSB3aGVuIHRpbWUvZHVyYXRpb24gY2hhbmdlLCBzbyBhcyB0byBiZSBwb2xsaW5nLWZyaWVuZGx5XHJcbiAgICAgICAqL1xyXG5cclxuICAgICAgdmFyIGR1cmF0aW9uLCBpc05ldyA9IGZhbHNlLCB0aW1lLCB4ID0ge307XHJcblxyXG4gICAgICBpZiAocy5faGFzVGltZXIgfHwgYkZvcmNlKSB7XHJcblxyXG4gICAgICAgIC8vIFRPRE86IE1heSBub3QgbmVlZCB0byB0cmFjayByZWFkeVN0YXRlICgxID0gbG9hZGluZylcclxuXHJcbiAgICAgICAgaWYgKHMuX2EgJiYgKGJGb3JjZSB8fCAoKHMucGxheVN0YXRlID4gMCB8fCBzLnJlYWR5U3RhdGUgPT09IDEpICYmICFzLnBhdXNlZCkpKSB7XHJcblxyXG4gICAgICAgICAgZHVyYXRpb24gPSBzLl9nZXRfaHRtbDVfZHVyYXRpb24oKTtcclxuXHJcbiAgICAgICAgICBpZiAoZHVyYXRpb24gIT09IGxhc3RIVE1MNVN0YXRlLmR1cmF0aW9uKSB7XHJcblxyXG4gICAgICAgICAgICBsYXN0SFRNTDVTdGF0ZS5kdXJhdGlvbiA9IGR1cmF0aW9uO1xyXG4gICAgICAgICAgICBzLmR1cmF0aW9uID0gZHVyYXRpb247XHJcbiAgICAgICAgICAgIGlzTmV3ID0gdHJ1ZTtcclxuXHJcbiAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgLy8gVE9ETzogaW52ZXN0aWdhdGUgd2h5IHRoaXMgZ29lcyB3YWNrIGlmIG5vdCBzZXQvcmUtc2V0IGVhY2ggdGltZS5cclxuICAgICAgICAgIHMuZHVyYXRpb25Fc3RpbWF0ZSA9IHMuZHVyYXRpb247XHJcblxyXG4gICAgICAgICAgdGltZSA9IChzLl9hLmN1cnJlbnRUaW1lICogbXNlY1NjYWxlIHx8IDApO1xyXG5cclxuICAgICAgICAgIGlmICh0aW1lICE9PSBsYXN0SFRNTDVTdGF0ZS50aW1lKSB7XHJcblxyXG4gICAgICAgICAgICBsYXN0SFRNTDVTdGF0ZS50aW1lID0gdGltZTtcclxuICAgICAgICAgICAgaXNOZXcgPSB0cnVlO1xyXG5cclxuICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICBpZiAoaXNOZXcgfHwgYkZvcmNlKSB7XHJcblxyXG4gICAgICAgICAgICBzLl93aGlsZXBsYXlpbmcodGltZSx4LHgseCx4KTtcclxuXHJcbiAgICAgICAgICB9XHJcblxyXG4gICAgICAgIH0vKiBlbHNlIHtcclxuXHJcbiAgICAgICAgICAvLyBzbTIuX3dEKCdfb25UaW1lcjogV2FybiBmb3IgXCInK3MuaWQrJ1wiOiAnKyghcy5fYT8nQ291bGQgbm90IGZpbmQgZWxlbWVudC4gJzonJykrKHMucGxheVN0YXRlID09PSAwPydwbGF5U3RhdGUgYmFkLCAwPyc6J3BsYXlTdGF0ZSA9ICcrcy5wbGF5U3RhdGUrJywgT0snKSk7XHJcblxyXG4gICAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG5cclxuICAgICAgICB9Ki9cclxuXHJcbiAgICAgICAgcmV0dXJuIGlzTmV3O1xyXG5cclxuICAgICAgfVxyXG5cclxuICAgIH07XHJcblxyXG4gICAgdGhpcy5fZ2V0X2h0bWw1X2R1cmF0aW9uID0gZnVuY3Rpb24oKSB7XHJcblxyXG4gICAgICB2YXIgaW5zdGFuY2VPcHRpb25zID0gcy5faU8sXHJcbiAgICAgICAgICAvLyBpZiBhdWRpbyBvYmplY3QgZXhpc3RzLCB1c2UgaXRzIGR1cmF0aW9uIC0gZWxzZSwgaW5zdGFuY2Ugb3B0aW9uIGR1cmF0aW9uIChpZiBwcm92aWRlZCAtIGl0J3MgYSBoYWNrLCByZWFsbHksIGFuZCBzaG91bGQgYmUgcmV0aXJlZCkgT1IgbnVsbFxyXG4gICAgICAgICAgZCA9IChzLl9hICYmIHMuX2EuZHVyYXRpb24gPyBzLl9hLmR1cmF0aW9uKm1zZWNTY2FsZSA6IChpbnN0YW5jZU9wdGlvbnMgJiYgaW5zdGFuY2VPcHRpb25zLmR1cmF0aW9uID8gaW5zdGFuY2VPcHRpb25zLmR1cmF0aW9uIDogbnVsbCkpLFxyXG4gICAgICAgICAgcmVzdWx0ID0gKGQgJiYgIWlzTmFOKGQpICYmIGQgIT09IEluZmluaXR5ID8gZCA6IG51bGwpO1xyXG5cclxuICAgICAgcmV0dXJuIHJlc3VsdDtcclxuXHJcbiAgICB9O1xyXG5cclxuICAgIHRoaXMuX2FwcGx5X2xvb3AgPSBmdW5jdGlvbihhLCBuTG9vcHMpIHtcclxuXHJcbiAgICAgIC8qKlxyXG4gICAgICAgKiBib29sZWFuIGluc3RlYWQgb2YgXCJsb29wXCIsIGZvciB3ZWJraXQ/IC0gc3BlYyBzYXlzIHN0cmluZy4gaHR0cDovL3d3dy53My5vcmcvVFIvaHRtbC1tYXJrdXAvYXVkaW8uaHRtbCNhdWRpby5hdHRycy5sb29wXHJcbiAgICAgICAqIG5vdGUgdGhhdCBsb29wIGlzIGVpdGhlciBvZmYgb3IgaW5maW5pdGUgdW5kZXIgSFRNTDUsIHVubGlrZSBGbGFzaCB3aGljaCBhbGxvd3MgYXJiaXRyYXJ5IGxvb3AgY291bnRzIHRvIGJlIHNwZWNpZmllZC5cclxuICAgICAgICovXHJcblxyXG4gICAgICAvLyA8ZD5cclxuICAgICAgaWYgKCFhLmxvb3AgJiYgbkxvb3BzID4gMSkge1xyXG4gICAgICAgIHNtMi5fd0QoJ05vdGU6IE5hdGl2ZSBIVE1MNSBsb29waW5nIGlzIGluZmluaXRlLicsIDEpO1xyXG4gICAgICB9XHJcbiAgICAgIC8vIDwvZD5cclxuXHJcbiAgICAgIGEubG9vcCA9IChuTG9vcHMgPiAxID8gJ2xvb3AnIDogJycpO1xyXG5cclxuICAgIH07XHJcblxyXG4gICAgdGhpcy5fc2V0dXBfaHRtbDUgPSBmdW5jdGlvbihvT3B0aW9ucykge1xyXG5cclxuICAgICAgdmFyIGluc3RhbmNlT3B0aW9ucyA9IG1peGluKHMuX2lPLCBvT3B0aW9ucyksXHJcbiAgICAgICAgICBhID0gdXNlR2xvYmFsSFRNTDVBdWRpbyA/IGdsb2JhbEhUTUw1QXVkaW8gOiBzLl9hLFxyXG4gICAgICAgICAgZFVSTCA9IGRlY29kZVVSSShpbnN0YW5jZU9wdGlvbnMudXJsKSxcclxuICAgICAgICAgIHNhbWVVUkw7XHJcblxyXG4gICAgICAvKipcclxuICAgICAgICogXCJGaXJzdCB0aGluZ3MgZmlyc3QsIEksIFBvcHBhLi4uXCIgKHJlc2V0IHRoZSBwcmV2aW91cyBzdGF0ZSBvZiB0aGUgb2xkIHNvdW5kLCBpZiBwbGF5aW5nKVxyXG4gICAgICAgKiBGaXhlcyBjYXNlIHdpdGggZGV2aWNlcyB0aGF0IGNhbiBvbmx5IHBsYXkgb25lIHNvdW5kIGF0IGEgdGltZVxyXG4gICAgICAgKiBPdGhlcndpc2UsIG90aGVyIHNvdW5kcyBpbiBtaWQtcGxheSB3aWxsIGJlIHRlcm1pbmF0ZWQgd2l0aG91dCB3YXJuaW5nIGFuZCBpbiBhIHN0dWNrIHN0YXRlXHJcbiAgICAgICAqL1xyXG5cclxuICAgICAgaWYgKHVzZUdsb2JhbEhUTUw1QXVkaW8pIHtcclxuXHJcbiAgICAgICAgaWYgKGRVUkwgPT09IGRlY29kZVVSSShsYXN0R2xvYmFsSFRNTDVVUkwpKSB7XHJcbiAgICAgICAgICAvLyBnbG9iYWwgSFRNTDUgYXVkaW86IHJlLXVzZSBvZiBVUkxcclxuICAgICAgICAgIHNhbWVVUkwgPSB0cnVlO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgIH0gZWxzZSBpZiAoZFVSTCA9PT0gZGVjb2RlVVJJKGxhc3RVUkwpKSB7XHJcblxyXG4gICAgICAgIC8vIG9wdGlvbnMgVVJMIGlzIHRoZSBzYW1lIGFzIHRoZSBcImxhc3RcIiBVUkwsIGFuZCB3ZSB1c2VkIChsb2FkZWQpIGl0XHJcbiAgICAgICAgc2FtZVVSTCA9IHRydWU7XHJcblxyXG4gICAgICB9XHJcblxyXG4gICAgICBpZiAoYSkge1xyXG5cclxuICAgICAgICBpZiAoYS5fcykge1xyXG5cclxuICAgICAgICAgIGlmICh1c2VHbG9iYWxIVE1MNUF1ZGlvKSB7XHJcblxyXG4gICAgICAgICAgICBpZiAoYS5fcyAmJiBhLl9zLnBsYXlTdGF0ZSAmJiAhc2FtZVVSTCkge1xyXG5cclxuICAgICAgICAgICAgICAvLyBnbG9iYWwgSFRNTDUgYXVkaW8gY2FzZSwgYW5kIGxvYWRpbmcgYSBuZXcgVVJMLiBzdG9wIHRoZSBjdXJyZW50bHktcGxheWluZyBvbmUuXHJcbiAgICAgICAgICAgICAgYS5fcy5zdG9wKCk7XHJcblxyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgfSBlbHNlIGlmICghdXNlR2xvYmFsSFRNTDVBdWRpbyAmJiBkVVJMID09PSBkZWNvZGVVUkkobGFzdFVSTCkpIHtcclxuXHJcbiAgICAgICAgICAgIC8vIG5vbi1nbG9iYWwgSFRNTDUgcmV1c2UgY2FzZTogc2FtZSB1cmwsIGlnbm9yZSByZXF1ZXN0XHJcbiAgICAgICAgICAgIHMuX2FwcGx5X2xvb3AoYSwgaW5zdGFuY2VPcHRpb25zLmxvb3BzKTtcclxuXHJcbiAgICAgICAgICAgIHJldHVybiBhO1xyXG5cclxuICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBpZiAoIXNhbWVVUkwpIHtcclxuXHJcbiAgICAgICAgICAvLyBkb24ndCByZXRhaW4gb25Qb3NpdGlvbigpIHN0dWZmIHdpdGggbmV3IFVSTHMuXHJcblxyXG4gICAgICAgICAgaWYgKGxhc3RVUkwpIHtcclxuICAgICAgICAgICAgcmVzZXRQcm9wZXJ0aWVzKGZhbHNlKTtcclxuICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAvLyBhc3NpZ24gbmV3IEhUTUw1IFVSTFxyXG5cclxuICAgICAgICAgIGEuc3JjID0gaW5zdGFuY2VPcHRpb25zLnVybDtcclxuXHJcbiAgICAgICAgICBzLnVybCA9IGluc3RhbmNlT3B0aW9ucy51cmw7XHJcblxyXG4gICAgICAgICAgbGFzdFVSTCA9IGluc3RhbmNlT3B0aW9ucy51cmw7XHJcblxyXG4gICAgICAgICAgbGFzdEdsb2JhbEhUTUw1VVJMID0gaW5zdGFuY2VPcHRpb25zLnVybDtcclxuXHJcbiAgICAgICAgICBhLl9jYWxsZWRfbG9hZCA9IGZhbHNlO1xyXG5cclxuICAgICAgICB9XHJcblxyXG4gICAgICB9IGVsc2Uge1xyXG5cclxuICAgICAgICBpZiAoaW5zdGFuY2VPcHRpb25zLmF1dG9Mb2FkIHx8IGluc3RhbmNlT3B0aW9ucy5hdXRvUGxheSkge1xyXG5cclxuICAgICAgICAgIHMuX2EgPSBuZXcgQXVkaW8oaW5zdGFuY2VPcHRpb25zLnVybCk7XHJcbiAgICAgICAgICBzLl9hLmxvYWQoKTtcclxuXHJcbiAgICAgICAgfSBlbHNlIHtcclxuXHJcbiAgICAgICAgICAvLyBudWxsIGZvciBzdHVwaWQgT3BlcmEgOS42NCBjYXNlXHJcbiAgICAgICAgICBzLl9hID0gKGlzT3BlcmEgJiYgb3BlcmEudmVyc2lvbigpIDwgMTAgPyBuZXcgQXVkaW8obnVsbCkgOiBuZXcgQXVkaW8oKSk7XHJcblxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLy8gYXNzaWduIGxvY2FsIHJlZmVyZW5jZVxyXG4gICAgICAgIGEgPSBzLl9hO1xyXG5cclxuICAgICAgICBhLl9jYWxsZWRfbG9hZCA9IGZhbHNlO1xyXG5cclxuICAgICAgICBpZiAodXNlR2xvYmFsSFRNTDVBdWRpbykge1xyXG5cclxuICAgICAgICAgIGdsb2JhbEhUTUw1QXVkaW8gPSBhO1xyXG5cclxuICAgICAgICB9XHJcblxyXG4gICAgICB9XHJcblxyXG4gICAgICBzLmlzSFRNTDUgPSB0cnVlO1xyXG5cclxuICAgICAgLy8gc3RvcmUgYSByZWYgb24gdGhlIHRyYWNrXHJcbiAgICAgIHMuX2EgPSBhO1xyXG5cclxuICAgICAgLy8gc3RvcmUgYSByZWYgb24gdGhlIGF1ZGlvXHJcbiAgICAgIGEuX3MgPSBzO1xyXG5cclxuICAgICAgYWRkX2h0bWw1X2V2ZW50cygpO1xyXG5cclxuICAgICAgcy5fYXBwbHlfbG9vcChhLCBpbnN0YW5jZU9wdGlvbnMubG9vcHMpO1xyXG5cclxuICAgICAgaWYgKGluc3RhbmNlT3B0aW9ucy5hdXRvTG9hZCB8fCBpbnN0YW5jZU9wdGlvbnMuYXV0b1BsYXkpIHtcclxuXHJcbiAgICAgICAgcy5sb2FkKCk7XHJcblxyXG4gICAgICB9IGVsc2Uge1xyXG5cclxuICAgICAgICAvLyBlYXJseSBIVE1MNSBpbXBsZW1lbnRhdGlvbiAobm9uLXN0YW5kYXJkKVxyXG4gICAgICAgIGEuYXV0b2J1ZmZlciA9IGZhbHNlO1xyXG5cclxuICAgICAgICAvLyBzdGFuZGFyZCAoJ25vbmUnIGlzIGFsc28gYW4gb3B0aW9uLilcclxuICAgICAgICBhLnByZWxvYWQgPSAnYXV0byc7XHJcblxyXG4gICAgICB9XHJcblxyXG4gICAgICByZXR1cm4gYTtcclxuXHJcbiAgICB9O1xyXG5cclxuICAgIGFkZF9odG1sNV9ldmVudHMgPSBmdW5jdGlvbigpIHtcclxuXHJcbiAgICAgIGlmIChzLl9hLl9hZGRlZF9ldmVudHMpIHtcclxuICAgICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIHZhciBmO1xyXG5cclxuICAgICAgZnVuY3Rpb24gYWRkKG9FdnQsIG9GbiwgYkNhcHR1cmUpIHtcclxuICAgICAgICByZXR1cm4gcy5fYSA/IHMuX2EuYWRkRXZlbnRMaXN0ZW5lcihvRXZ0LCBvRm4sIGJDYXB0dXJlfHxmYWxzZSkgOiBudWxsO1xyXG4gICAgICB9XHJcblxyXG4gICAgICBzLl9hLl9hZGRlZF9ldmVudHMgPSB0cnVlO1xyXG5cclxuICAgICAgZm9yIChmIGluIGh0bWw1X2V2ZW50cykge1xyXG4gICAgICAgIGlmIChodG1sNV9ldmVudHMuaGFzT3duUHJvcGVydHkoZikpIHtcclxuICAgICAgICAgIGFkZChmLCBodG1sNV9ldmVudHNbZl0pO1xyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG5cclxuICAgICAgcmV0dXJuIHRydWU7XHJcblxyXG4gICAgfTtcclxuXHJcbiAgICByZW1vdmVfaHRtbDVfZXZlbnRzID0gZnVuY3Rpb24oKSB7XHJcblxyXG4gICAgICAvLyBSZW1vdmUgZXZlbnQgbGlzdGVuZXJzXHJcblxyXG4gICAgICB2YXIgZjtcclxuXHJcbiAgICAgIGZ1bmN0aW9uIHJlbW92ZShvRXZ0LCBvRm4sIGJDYXB0dXJlKSB7XHJcbiAgICAgICAgcmV0dXJuIChzLl9hID8gcy5fYS5yZW1vdmVFdmVudExpc3RlbmVyKG9FdnQsIG9GbiwgYkNhcHR1cmV8fGZhbHNlKSA6IG51bGwpO1xyXG4gICAgICB9XHJcblxyXG4gICAgICBzbTIuX3dEKHMuaWQgKyAnOiBSZW1vdmluZyBldmVudCBsaXN0ZW5lcnMnKTtcclxuICAgICAgcy5fYS5fYWRkZWRfZXZlbnRzID0gZmFsc2U7XHJcblxyXG4gICAgICBmb3IgKGYgaW4gaHRtbDVfZXZlbnRzKSB7XHJcbiAgICAgICAgaWYgKGh0bWw1X2V2ZW50cy5oYXNPd25Qcm9wZXJ0eShmKSkge1xyXG4gICAgICAgICAgcmVtb3ZlKGYsIGh0bWw1X2V2ZW50c1tmXSk7XHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcblxyXG4gICAgfTtcclxuXHJcbiAgICAvKipcclxuICAgICAqIFBzZXVkby1wcml2YXRlIGV2ZW50IGludGVybmFsc1xyXG4gICAgICogLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXHJcbiAgICAgKi9cclxuXHJcbiAgICB0aGlzLl9vbmxvYWQgPSBmdW5jdGlvbihuU3VjY2Vzcykge1xyXG5cclxuICAgICAgdmFyIGZOLFxyXG4gICAgICAgICAgLy8gY2hlY2sgZm9yIGR1cmF0aW9uIHRvIHByZXZlbnQgZmFsc2UgcG9zaXRpdmVzIGZyb20gZmxhc2ggOCB3aGVuIGxvYWRpbmcgZnJvbSBjYWNoZS5cclxuICAgICAgICAgIGxvYWRPSyA9ICEhblN1Y2Nlc3MgfHwgKCFzLmlzSFRNTDUgJiYgZlYgPT09IDggJiYgcy5kdXJhdGlvbik7XHJcblxyXG4gICAgICAvLyA8ZD5cclxuICAgICAgZk4gPSBzLmlkICsgJzogJztcclxuICAgICAgc20yLl93RChmTiArIChsb2FkT0sgPyAnb25sb2FkKCknIDogJ0ZhaWxlZCB0byBsb2FkIC8gaW52YWxpZCBzb3VuZD8nICsgKCFzLmR1cmF0aW9uID8gJyBaZXJvLWxlbmd0aCBkdXJhdGlvbiByZXBvcnRlZC4nIDogJyAtJykgKyAnICgnICsgcy51cmwgKyAnKScpLCAobG9hZE9LID8gMSA6IDIpKTtcclxuICAgICAgaWYgKCFsb2FkT0sgJiYgIXMuaXNIVE1MNSkge1xyXG4gICAgICAgIGlmIChzbTIuc2FuZGJveC5ub1JlbW90ZSA9PT0gdHJ1ZSkge1xyXG4gICAgICAgICAgc20yLl93RChmTiArIHN0cignbm9OZXQnKSwgMSk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmIChzbTIuc2FuZGJveC5ub0xvY2FsID09PSB0cnVlKSB7XHJcbiAgICAgICAgICBzbTIuX3dEKGZOICsgc3RyKCdub0xvY2FsJyksIDEpO1xyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG4gICAgICAvLyA8L2Q+XHJcblxyXG4gICAgICBzLmxvYWRlZCA9IGxvYWRPSztcclxuICAgICAgcy5yZWFkeVN0YXRlID0gbG9hZE9LPzM6MjtcclxuICAgICAgcy5fb25idWZmZXJjaGFuZ2UoMCk7XHJcblxyXG4gICAgICBpZiAocy5faU8ub25sb2FkKSB7XHJcbiAgICAgICAgd3JhcENhbGxiYWNrKHMsIGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgcy5faU8ub25sb2FkLmFwcGx5KHMsIFtsb2FkT0tdKTtcclxuICAgICAgICB9KTtcclxuICAgICAgfVxyXG5cclxuICAgICAgcmV0dXJuIHRydWU7XHJcblxyXG4gICAgfTtcclxuXHJcbiAgICB0aGlzLl9vbmJ1ZmZlcmNoYW5nZSA9IGZ1bmN0aW9uKG5Jc0J1ZmZlcmluZykge1xyXG5cclxuICAgICAgaWYgKHMucGxheVN0YXRlID09PSAwKSB7XHJcbiAgICAgICAgLy8gaWdub3JlIGlmIG5vdCBwbGF5aW5nXHJcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgICB9XHJcblxyXG4gICAgICBpZiAoKG5Jc0J1ZmZlcmluZyAmJiBzLmlzQnVmZmVyaW5nKSB8fCAoIW5Jc0J1ZmZlcmluZyAmJiAhcy5pc0J1ZmZlcmluZykpIHtcclxuICAgICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIHMuaXNCdWZmZXJpbmcgPSAobklzQnVmZmVyaW5nID09PSAxKTtcclxuICAgICAgaWYgKHMuX2lPLm9uYnVmZmVyY2hhbmdlKSB7XHJcbiAgICAgICAgc20yLl93RChzLmlkICsgJzogQnVmZmVyIHN0YXRlIGNoYW5nZTogJyArIG5Jc0J1ZmZlcmluZyk7XHJcbiAgICAgICAgcy5faU8ub25idWZmZXJjaGFuZ2UuYXBwbHkocywgW25Jc0J1ZmZlcmluZ10pO1xyXG4gICAgICB9XHJcblxyXG4gICAgICByZXR1cm4gdHJ1ZTtcclxuXHJcbiAgICB9O1xyXG5cclxuICAgIC8qKlxyXG4gICAgICogUGxheWJhY2sgbWF5IGhhdmUgc3RvcHBlZCBkdWUgdG8gYnVmZmVyaW5nLCBvciByZWxhdGVkIHJlYXNvbi5cclxuICAgICAqIFRoaXMgc3RhdGUgY2FuIGJlIGVuY291bnRlcmVkIG9uIGlPUyA8IDYgd2hlbiBhdXRvLXBsYXkgaXMgYmxvY2tlZC5cclxuICAgICAqL1xyXG5cclxuICAgIHRoaXMuX29uc3VzcGVuZCA9IGZ1bmN0aW9uKCkge1xyXG5cclxuICAgICAgaWYgKHMuX2lPLm9uc3VzcGVuZCkge1xyXG4gICAgICAgIHNtMi5fd0Qocy5pZCArICc6IFBsYXliYWNrIHN1c3BlbmRlZCcpO1xyXG4gICAgICAgIHMuX2lPLm9uc3VzcGVuZC5hcHBseShzKTtcclxuICAgICAgfVxyXG5cclxuICAgICAgcmV0dXJuIHRydWU7XHJcblxyXG4gICAgfTtcclxuXHJcbiAgICAvKipcclxuICAgICAqIGZsYXNoIDkvbW92aWVTdGFyICsgUlRNUC1vbmx5IG1ldGhvZCwgc2hvdWxkIGZpcmUgb25seSBvbmNlIGF0IG1vc3RcclxuICAgICAqIGF0IHRoaXMgcG9pbnQgd2UganVzdCByZWNyZWF0ZSBmYWlsZWQgc291bmRzIHJhdGhlciB0aGFuIHRyeWluZyB0byByZWNvbm5lY3RcclxuICAgICAqL1xyXG5cclxuICAgIHRoaXMuX29uZmFpbHVyZSA9IGZ1bmN0aW9uKG1zZywgbGV2ZWwsIGNvZGUpIHtcclxuXHJcbiAgICAgIHMuZmFpbHVyZXMrKztcclxuICAgICAgc20yLl93RChzLmlkICsgJzogRmFpbHVyZSAoJyArIHMuZmFpbHVyZXMgKyAnKTogJyArIG1zZyk7XHJcblxyXG4gICAgICBpZiAocy5faU8ub25mYWlsdXJlICYmIHMuZmFpbHVyZXMgPT09IDEpIHtcclxuICAgICAgICBzLl9pTy5vbmZhaWx1cmUobXNnLCBsZXZlbCwgY29kZSk7XHJcbiAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgc20yLl93RChzLmlkICsgJzogSWdub3JpbmcgZmFpbHVyZScpO1xyXG4gICAgICB9XHJcblxyXG4gICAgfTtcclxuXHJcbiAgICAvKipcclxuICAgICAqIGZsYXNoIDkvbW92aWVTdGFyICsgUlRNUC1vbmx5IG1ldGhvZCBmb3IgdW5oYW5kbGVkIHdhcm5pbmdzL2V4Y2VwdGlvbnMgZnJvbSBGbGFzaFxyXG4gICAgICogZS5nLiwgUlRNUCBcIm1ldGhvZCBtaXNzaW5nXCIgd2FybmluZyAobm9uLWZhdGFsKSBmb3IgZ2V0U3RyZWFtTGVuZ3RoIG9uIHNlcnZlclxyXG4gICAgICovXHJcblxyXG4gICAgdGhpcy5fb253YXJuaW5nID0gZnVuY3Rpb24obXNnLCBsZXZlbCwgY29kZSkge1xyXG5cclxuICAgICAgaWYgKHMuX2lPLm9ud2FybmluZykge1xyXG4gICAgICAgIHMuX2lPLm9ud2FybmluZyhtc2csIGxldmVsLCBjb2RlKTtcclxuICAgICAgfVxyXG5cclxuICAgIH07XHJcblxyXG4gICAgdGhpcy5fb25maW5pc2ggPSBmdW5jdGlvbigpIHtcclxuXHJcbiAgICAgIC8vIHN0b3JlIGxvY2FsIGNvcHkgYmVmb3JlIGl0IGdldHMgdHJhc2hlZC4uLlxyXG4gICAgICB2YXIgaW9fb25maW5pc2ggPSBzLl9pTy5vbmZpbmlzaDtcclxuXHJcbiAgICAgIHMuX29uYnVmZmVyY2hhbmdlKDApO1xyXG4gICAgICBzLl9yZXNldE9uUG9zaXRpb24oMCk7XHJcblxyXG4gICAgICAvLyByZXNldCBzb21lIHN0YXRlIGl0ZW1zXHJcbiAgICAgIGlmIChzLmluc3RhbmNlQ291bnQpIHtcclxuXHJcbiAgICAgICAgcy5pbnN0YW5jZUNvdW50LS07XHJcblxyXG4gICAgICAgIGlmICghcy5pbnN0YW5jZUNvdW50KSB7XHJcblxyXG4gICAgICAgICAgLy8gcmVtb3ZlIG9uUG9zaXRpb24gbGlzdGVuZXJzLCBpZiBhbnlcclxuICAgICAgICAgIGRldGFjaE9uUG9zaXRpb24oKTtcclxuXHJcbiAgICAgICAgICAvLyByZXNldCBpbnN0YW5jZSBvcHRpb25zXHJcbiAgICAgICAgICBzLnBsYXlTdGF0ZSA9IDA7XHJcbiAgICAgICAgICBzLnBhdXNlZCA9IGZhbHNlO1xyXG4gICAgICAgICAgcy5pbnN0YW5jZUNvdW50ID0gMDtcclxuICAgICAgICAgIHMuaW5zdGFuY2VPcHRpb25zID0ge307XHJcbiAgICAgICAgICBzLl9pTyA9IHt9O1xyXG4gICAgICAgICAgc3RvcF9odG1sNV90aW1lcigpO1xyXG5cclxuICAgICAgICAgIC8vIHJlc2V0IHBvc2l0aW9uLCB0b29cclxuICAgICAgICAgIGlmIChzLmlzSFRNTDUpIHtcclxuICAgICAgICAgICAgcy5wb3NpdGlvbiA9IDA7XHJcbiAgICAgICAgICB9XHJcblxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgaWYgKCFzLmluc3RhbmNlQ291bnQgfHwgcy5faU8ubXVsdGlTaG90RXZlbnRzKSB7XHJcbiAgICAgICAgICAvLyBmaXJlIG9uZmluaXNoIGZvciBsYXN0LCBvciBldmVyeSBpbnN0YW5jZVxyXG4gICAgICAgICAgaWYgKGlvX29uZmluaXNoKSB7XHJcbiAgICAgICAgICAgIHNtMi5fd0Qocy5pZCArICc6IG9uZmluaXNoKCknKTtcclxuICAgICAgICAgICAgd3JhcENhbGxiYWNrKHMsIGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICAgIGlvX29uZmluaXNoLmFwcGx5KHMpO1xyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICAgIH1cclxuICAgICAgICB9XHJcblxyXG4gICAgICB9XHJcblxyXG4gICAgfTtcclxuXHJcbiAgICB0aGlzLl93aGlsZWxvYWRpbmcgPSBmdW5jdGlvbihuQnl0ZXNMb2FkZWQsIG5CeXRlc1RvdGFsLCBuRHVyYXRpb24sIG5CdWZmZXJMZW5ndGgpIHtcclxuXHJcbiAgICAgIHZhciBpbnN0YW5jZU9wdGlvbnMgPSBzLl9pTztcclxuXHJcbiAgICAgIHMuYnl0ZXNMb2FkZWQgPSBuQnl0ZXNMb2FkZWQ7XHJcbiAgICAgIHMuYnl0ZXNUb3RhbCA9IG5CeXRlc1RvdGFsO1xyXG4gICAgICBzLmR1cmF0aW9uID0gTWF0aC5mbG9vcihuRHVyYXRpb24pO1xyXG4gICAgICBzLmJ1ZmZlckxlbmd0aCA9IG5CdWZmZXJMZW5ndGg7XHJcblxyXG4gICAgICBpZiAoIXMuaXNIVE1MNSAmJiAhaW5zdGFuY2VPcHRpb25zLmlzTW92aWVTdGFyKSB7XHJcblxyXG4gICAgICAgIGlmIChpbnN0YW5jZU9wdGlvbnMuZHVyYXRpb24pIHtcclxuICAgICAgICAgIC8vIHVzZSBkdXJhdGlvbiBmcm9tIG9wdGlvbnMsIGlmIHNwZWNpZmllZCBhbmQgbGFyZ2VyLiBub2JvZHkgc2hvdWxkIGJlIHNwZWNpZnlpbmcgZHVyYXRpb24gaW4gb3B0aW9ucywgYWN0dWFsbHksIGFuZCBpdCBzaG91bGQgYmUgcmV0aXJlZC5cclxuICAgICAgICAgIHMuZHVyYXRpb25Fc3RpbWF0ZSA9IChzLmR1cmF0aW9uID4gaW5zdGFuY2VPcHRpb25zLmR1cmF0aW9uKSA/IHMuZHVyYXRpb24gOiBpbnN0YW5jZU9wdGlvbnMuZHVyYXRpb247XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgIHMuZHVyYXRpb25Fc3RpbWF0ZSA9IHBhcnNlSW50KChzLmJ5dGVzVG90YWwgLyBzLmJ5dGVzTG9hZGVkKSAqIHMuZHVyYXRpb24sIDEwKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICB9IGVsc2Uge1xyXG5cclxuICAgICAgICBzLmR1cmF0aW9uRXN0aW1hdGUgPSBzLmR1cmF0aW9uO1xyXG5cclxuICAgICAgfVxyXG5cclxuICAgICAgLy8gZm9yIGZsYXNoLCByZWZsZWN0IHNlcXVlbnRpYWwtbG9hZC1zdHlsZSBidWZmZXJpbmdcclxuICAgICAgaWYgKCFzLmlzSFRNTDUpIHtcclxuICAgICAgICBzLmJ1ZmZlcmVkID0gW3tcclxuICAgICAgICAgICdzdGFydCc6IDAsXHJcbiAgICAgICAgICAnZW5kJzogcy5kdXJhdGlvblxyXG4gICAgICAgIH1dO1xyXG4gICAgICB9XHJcblxyXG4gICAgICAvLyBhbGxvdyB3aGlsZWxvYWRpbmcgdG8gZmlyZSBldmVuIGlmIFwibG9hZFwiIGZpcmVkIHVuZGVyIEhUTUw1LCBkdWUgdG8gSFRUUCByYW5nZS9wYXJ0aWFsc1xyXG4gICAgICBpZiAoKHMucmVhZHlTdGF0ZSAhPT0gMyB8fCBzLmlzSFRNTDUpICYmIGluc3RhbmNlT3B0aW9ucy53aGlsZWxvYWRpbmcpIHtcclxuICAgICAgICBpbnN0YW5jZU9wdGlvbnMud2hpbGVsb2FkaW5nLmFwcGx5KHMpO1xyXG4gICAgICB9XHJcblxyXG4gICAgfTtcclxuXHJcbiAgICB0aGlzLl93aGlsZXBsYXlpbmcgPSBmdW5jdGlvbihuUG9zaXRpb24sIG9QZWFrRGF0YSwgb1dhdmVmb3JtRGF0YUxlZnQsIG9XYXZlZm9ybURhdGFSaWdodCwgb0VRRGF0YSkge1xyXG5cclxuICAgICAgdmFyIGluc3RhbmNlT3B0aW9ucyA9IHMuX2lPLFxyXG4gICAgICAgICAgZXFMZWZ0O1xyXG5cclxuICAgICAgaWYgKGlzTmFOKG5Qb3NpdGlvbikgfHwgblBvc2l0aW9uID09PSBudWxsKSB7XHJcbiAgICAgICAgLy8gZmxhc2ggc2FmZXR5IG5ldFxyXG4gICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgICAgfVxyXG5cclxuICAgICAgLy8gU2FmYXJpIEhUTUw1IHBsYXkoKSBtYXkgcmV0dXJuIHNtYWxsIC12ZSB2YWx1ZXMgd2hlbiBzdGFydGluZyBmcm9tIHBvc2l0aW9uOiAwLCBlZy4gLTUwLjEyMDM5Njg3NS4gVW5leHBlY3RlZC9pbnZhbGlkIHBlciBXMywgSSB0aGluay4gTm9ybWFsaXplIHRvIDAuXHJcbiAgICAgIHMucG9zaXRpb24gPSBNYXRoLm1heCgwLCBuUG9zaXRpb24pO1xyXG5cclxuICAgICAgcy5fcHJvY2Vzc09uUG9zaXRpb24oKTtcclxuXHJcbiAgICAgIGlmICghcy5pc0hUTUw1ICYmIGZWID4gOCkge1xyXG5cclxuICAgICAgICBpZiAoaW5zdGFuY2VPcHRpb25zLnVzZVBlYWtEYXRhICYmIG9QZWFrRGF0YSAhPT0gX3VuZGVmaW5lZCAmJiBvUGVha0RhdGEpIHtcclxuICAgICAgICAgIHMucGVha0RhdGEgPSB7XHJcbiAgICAgICAgICAgIGxlZnQ6IG9QZWFrRGF0YS5sZWZ0UGVhayxcclxuICAgICAgICAgICAgcmlnaHQ6IG9QZWFrRGF0YS5yaWdodFBlYWtcclxuICAgICAgICAgIH07XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBpZiAoaW5zdGFuY2VPcHRpb25zLnVzZVdhdmVmb3JtRGF0YSAmJiBvV2F2ZWZvcm1EYXRhTGVmdCAhPT0gX3VuZGVmaW5lZCAmJiBvV2F2ZWZvcm1EYXRhTGVmdCkge1xyXG4gICAgICAgICAgcy53YXZlZm9ybURhdGEgPSB7XHJcbiAgICAgICAgICAgIGxlZnQ6IG9XYXZlZm9ybURhdGFMZWZ0LnNwbGl0KCcsJyksXHJcbiAgICAgICAgICAgIHJpZ2h0OiBvV2F2ZWZvcm1EYXRhUmlnaHQuc3BsaXQoJywnKVxyXG4gICAgICAgICAgfTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGlmIChpbnN0YW5jZU9wdGlvbnMudXNlRVFEYXRhKSB7XHJcbiAgICAgICAgICBpZiAob0VRRGF0YSAhPT0gX3VuZGVmaW5lZCAmJiBvRVFEYXRhICYmIG9FUURhdGEubGVmdEVRKSB7XHJcbiAgICAgICAgICAgIGVxTGVmdCA9IG9FUURhdGEubGVmdEVRLnNwbGl0KCcsJyk7XHJcbiAgICAgICAgICAgIHMuZXFEYXRhID0gZXFMZWZ0O1xyXG4gICAgICAgICAgICBzLmVxRGF0YS5sZWZ0ID0gZXFMZWZ0O1xyXG4gICAgICAgICAgICBpZiAob0VRRGF0YS5yaWdodEVRICE9PSBfdW5kZWZpbmVkICYmIG9FUURhdGEucmlnaHRFUSkge1xyXG4gICAgICAgICAgICAgIHMuZXFEYXRhLnJpZ2h0ID0gb0VRRGF0YS5yaWdodEVRLnNwbGl0KCcsJyk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgIH1cclxuICAgICAgICB9XHJcblxyXG4gICAgICB9XHJcblxyXG4gICAgICBpZiAocy5wbGF5U3RhdGUgPT09IDEpIHtcclxuXHJcbiAgICAgICAgLy8gc3BlY2lhbCBjYXNlL2hhY2s6IGVuc3VyZSBidWZmZXJpbmcgaXMgZmFsc2UgaWYgbG9hZGluZyBmcm9tIGNhY2hlIChhbmQgbm90IHlldCBzdGFydGVkKVxyXG4gICAgICAgIGlmICghcy5pc0hUTUw1ICYmIGZWID09PSA4ICYmICFzLnBvc2l0aW9uICYmIHMuaXNCdWZmZXJpbmcpIHtcclxuICAgICAgICAgIHMuX29uYnVmZmVyY2hhbmdlKDApO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgaWYgKGluc3RhbmNlT3B0aW9ucy53aGlsZXBsYXlpbmcpIHtcclxuICAgICAgICAgIC8vIGZsYXNoIG1heSBjYWxsIGFmdGVyIGFjdHVhbCBmaW5pc2hcclxuICAgICAgICAgIGluc3RhbmNlT3B0aW9ucy53aGlsZXBsYXlpbmcuYXBwbHkocyk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgfVxyXG5cclxuICAgICAgcmV0dXJuIHRydWU7XHJcblxyXG4gICAgfTtcclxuXHJcbiAgICB0aGlzLl9vbmNhcHRpb25kYXRhID0gZnVuY3Rpb24ob0RhdGEpIHtcclxuXHJcbiAgICAgIC8qKlxyXG4gICAgICAgKiBpbnRlcm5hbDogZmxhc2ggOSArIE5ldFN0cmVhbSAoTW92aWVTdGFyL1JUTVAtb25seSkgZmVhdHVyZVxyXG4gICAgICAgKlxyXG4gICAgICAgKiBAcGFyYW0ge29iamVjdH0gb0RhdGFcclxuICAgICAgICovXHJcblxyXG4gICAgICBzbTIuX3dEKHMuaWQgKyAnOiBDYXB0aW9uIGRhdGEgcmVjZWl2ZWQuJyk7XHJcblxyXG4gICAgICBzLmNhcHRpb25kYXRhID0gb0RhdGE7XHJcblxyXG4gICAgICBpZiAocy5faU8ub25jYXB0aW9uZGF0YSkge1xyXG4gICAgICAgIHMuX2lPLm9uY2FwdGlvbmRhdGEuYXBwbHkocywgW29EYXRhXSk7XHJcbiAgICAgIH1cclxuXHJcbiAgICB9O1xyXG5cclxuICAgIHRoaXMuX29ubWV0YWRhdGEgPSBmdW5jdGlvbihvTURQcm9wcywgb01ERGF0YSkge1xyXG5cclxuICAgICAgLyoqXHJcbiAgICAgICAqIGludGVybmFsOiBmbGFzaCA5ICsgTmV0U3RyZWFtIChNb3ZpZVN0YXIvUlRNUC1vbmx5KSBmZWF0dXJlXHJcbiAgICAgICAqIFJUTVAgbWF5IGluY2x1ZGUgc29uZyB0aXRsZSwgTW92aWVTdGFyIGNvbnRlbnQgbWF5IGluY2x1ZGUgZW5jb2RpbmcgaW5mb1xyXG4gICAgICAgKlxyXG4gICAgICAgKiBAcGFyYW0ge2FycmF5fSBvTURQcm9wcyAobmFtZXMpXHJcbiAgICAgICAqIEBwYXJhbSB7YXJyYXl9IG9NRERhdGEgKHZhbHVlcylcclxuICAgICAgICovXHJcblxyXG4gICAgICBzbTIuX3dEKHMuaWQgKyAnOiBNZXRhZGF0YSByZWNlaXZlZC4nKTtcclxuXHJcbiAgICAgIHZhciBvRGF0YSA9IHt9LCBpLCBqO1xyXG5cclxuICAgICAgZm9yIChpID0gMCwgaiA9IG9NRFByb3BzLmxlbmd0aDsgaSA8IGo7IGkrKykge1xyXG4gICAgICAgIG9EYXRhW29NRFByb3BzW2ldXSA9IG9NRERhdGFbaV07XHJcbiAgICAgIH1cclxuICAgICAgcy5tZXRhZGF0YSA9IG9EYXRhO1xyXG5cclxuY29uc29sZS5sb2coJ3VwZGF0ZWQgbWV0YWRhdGEnLCBzLm1ldGFkYXRhKTtcclxuXHJcbiAgICAgIGlmIChzLl9pTy5vbm1ldGFkYXRhKSB7XHJcbiAgICAgICAgcy5faU8ub25tZXRhZGF0YS5jYWxsKHMsIHMubWV0YWRhdGEpO1xyXG4gICAgICB9XHJcblxyXG4gICAgfTtcclxuXHJcbiAgICB0aGlzLl9vbmlkMyA9IGZ1bmN0aW9uKG9JRDNQcm9wcywgb0lEM0RhdGEpIHtcclxuXHJcbiAgICAgIC8qKlxyXG4gICAgICAgKiBpbnRlcm5hbDogZmxhc2ggOCArIGZsYXNoIDkgSUQzIGZlYXR1cmVcclxuICAgICAgICogbWF5IGluY2x1ZGUgYXJ0aXN0LCBzb25nIHRpdGxlIGV0Yy5cclxuICAgICAgICpcclxuICAgICAgICogQHBhcmFtIHthcnJheX0gb0lEM1Byb3BzIChuYW1lcylcclxuICAgICAgICogQHBhcmFtIHthcnJheX0gb0lEM0RhdGEgKHZhbHVlcylcclxuICAgICAgICovXHJcblxyXG4gICAgICBzbTIuX3dEKHMuaWQgKyAnOiBJRDMgZGF0YSByZWNlaXZlZC4nKTtcclxuXHJcbiAgICAgIHZhciBvRGF0YSA9IFtdLCBpLCBqO1xyXG5cclxuICAgICAgZm9yIChpID0gMCwgaiA9IG9JRDNQcm9wcy5sZW5ndGg7IGkgPCBqOyBpKyspIHtcclxuICAgICAgICBvRGF0YVtvSUQzUHJvcHNbaV1dID0gb0lEM0RhdGFbaV07XHJcbiAgICAgIH1cclxuICAgICAgcy5pZDMgPSBtaXhpbihzLmlkMywgb0RhdGEpO1xyXG5cclxuICAgICAgaWYgKHMuX2lPLm9uaWQzKSB7XHJcbiAgICAgICAgcy5faU8ub25pZDMuYXBwbHkocyk7XHJcbiAgICAgIH1cclxuXHJcbiAgICB9O1xyXG5cclxuICAgIC8vIGZsYXNoL1JUTVAtb25seVxyXG5cclxuICAgIHRoaXMuX29uY29ubmVjdCA9IGZ1bmN0aW9uKGJTdWNjZXNzKSB7XHJcblxyXG4gICAgICBiU3VjY2VzcyA9IChiU3VjY2VzcyA9PT0gMSk7XHJcbiAgICAgIHNtMi5fd0Qocy5pZCArICc6ICcgKyAoYlN1Y2Nlc3MgPyAnQ29ubmVjdGVkLicgOiAnRmFpbGVkIHRvIGNvbm5lY3Q/IC0gJyArIHMudXJsKSwgKGJTdWNjZXNzID8gMSA6IDIpKTtcclxuICAgICAgcy5jb25uZWN0ZWQgPSBiU3VjY2VzcztcclxuXHJcbiAgICAgIGlmIChiU3VjY2Vzcykge1xyXG5cclxuICAgICAgICBzLmZhaWx1cmVzID0gMDtcclxuXHJcbiAgICAgICAgaWYgKGlkQ2hlY2socy5pZCkpIHtcclxuICAgICAgICAgIGlmIChzLmdldEF1dG9QbGF5KCkpIHtcclxuICAgICAgICAgICAgLy8gb25seSB1cGRhdGUgdGhlIHBsYXkgc3RhdGUgaWYgYXV0byBwbGF5aW5nXHJcbiAgICAgICAgICAgIHMucGxheShfdW5kZWZpbmVkLCBzLmdldEF1dG9QbGF5KCkpO1xyXG4gICAgICAgICAgfSBlbHNlIGlmIChzLl9pTy5hdXRvTG9hZCkge1xyXG4gICAgICAgICAgICBzLmxvYWQoKTtcclxuICAgICAgICAgIH1cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGlmIChzLl9pTy5vbmNvbm5lY3QpIHtcclxuICAgICAgICAgIHMuX2lPLm9uY29ubmVjdC5hcHBseShzLCBbYlN1Y2Nlc3NdKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICB9XHJcblxyXG4gICAgfTtcclxuXHJcbiAgICB0aGlzLl9vbmRhdGFlcnJvciA9IGZ1bmN0aW9uKHNFcnJvcikge1xyXG5cclxuICAgICAgLy8gZmxhc2ggOSB3YXZlL2VxIGRhdGEgaGFuZGxlclxyXG4gICAgICAvLyBoYWNrOiBjYWxsZWQgYXQgc3RhcnQsIGFuZCBlbmQgZnJvbSBmbGFzaCBhdC9hZnRlciBvbmZpbmlzaCgpXHJcbiAgICAgIGlmIChzLnBsYXlTdGF0ZSA+IDApIHtcclxuICAgICAgICBzbTIuX3dEKHMuaWQgKyAnOiBEYXRhIGVycm9yOiAnICsgc0Vycm9yKTtcclxuICAgICAgICBpZiAocy5faU8ub25kYXRhZXJyb3IpIHtcclxuICAgICAgICAgIHMuX2lPLm9uZGF0YWVycm9yLmFwcGx5KHMpO1xyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG5cclxuICAgIH07XHJcblxyXG4gICAgLy8gPGQ+XHJcbiAgICB0aGlzLl9kZWJ1ZygpO1xyXG4gICAgLy8gPC9kPlxyXG5cclxuICB9OyAvLyBTTVNvdW5kKClcclxuXHJcbiAgLyoqXHJcbiAgICogUHJpdmF0ZSBTb3VuZE1hbmFnZXIgaW50ZXJuYWxzXHJcbiAgICogLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXHJcbiAgICovXHJcblxyXG4gIGdldERvY3VtZW50ID0gZnVuY3Rpb24oKSB7XHJcblxyXG4gICAgcmV0dXJuIChkb2MuYm9keSB8fCBkb2MuZ2V0RWxlbWVudHNCeVRhZ05hbWUoJ2RpdicpWzBdKTtcclxuXHJcbiAgfTtcclxuXHJcbiAgaWQgPSBmdW5jdGlvbihzSUQpIHtcclxuXHJcbiAgICByZXR1cm4gZG9jLmdldEVsZW1lbnRCeUlkKHNJRCk7XHJcblxyXG4gIH07XHJcblxyXG4gIG1peGluID0gZnVuY3Rpb24ob01haW4sIG9BZGQpIHtcclxuXHJcbiAgICAvLyBub24tZGVzdHJ1Y3RpdmUgbWVyZ2VcclxuICAgIHZhciBvMSA9IChvTWFpbiB8fCB7fSksIG8yLCBvO1xyXG5cclxuICAgIC8vIGlmIHVuc3BlY2lmaWVkLCBvMiBpcyB0aGUgZGVmYXVsdCBvcHRpb25zIG9iamVjdFxyXG4gICAgbzIgPSAob0FkZCA9PT0gX3VuZGVmaW5lZCA/IHNtMi5kZWZhdWx0T3B0aW9ucyA6IG9BZGQpO1xyXG5cclxuICAgIGZvciAobyBpbiBvMikge1xyXG5cclxuICAgICAgaWYgKG8yLmhhc093blByb3BlcnR5KG8pICYmIG8xW29dID09PSBfdW5kZWZpbmVkKSB7XHJcblxyXG4gICAgICAgIGlmICh0eXBlb2YgbzJbb10gIT09ICdvYmplY3QnIHx8IG8yW29dID09PSBudWxsKSB7XHJcblxyXG4gICAgICAgICAgLy8gYXNzaWduIGRpcmVjdGx5XHJcbiAgICAgICAgICBvMVtvXSA9IG8yW29dO1xyXG5cclxuICAgICAgICB9IGVsc2Uge1xyXG5cclxuICAgICAgICAgIC8vIHJlY3Vyc2UgdGhyb3VnaCBvMlxyXG4gICAgICAgICAgbzFbb10gPSBtaXhpbihvMVtvXSwgbzJbb10pO1xyXG5cclxuICAgICAgICB9XHJcblxyXG4gICAgICB9XHJcblxyXG4gICAgfVxyXG5cclxuICAgIHJldHVybiBvMTtcclxuXHJcbiAgfTtcclxuXHJcbiAgd3JhcENhbGxiYWNrID0gZnVuY3Rpb24ob1NvdW5kLCBjYWxsYmFjaykge1xyXG5cclxuICAgIC8qKlxyXG4gICAgICogMDMvMDMvMjAxMzogRml4IGZvciBGbGFzaCBQbGF5ZXIgMTEuNi42MDIuMTcxICsgRmxhc2ggOCAoZmxhc2hWZXJzaW9uID0gOCkgU1dGIGlzc3VlXHJcbiAgICAgKiBzZXRUaW1lb3V0KCkgZml4IGZvciBjZXJ0YWluIFNNU291bmQgY2FsbGJhY2tzIGxpa2Ugb25sb2FkKCkgYW5kIG9uZmluaXNoKCksIHdoZXJlIHN1YnNlcXVlbnQgY2FsbHMgbGlrZSBwbGF5KCkgYW5kIGxvYWQoKSBmYWlsIHdoZW4gRmxhc2ggUGxheWVyIDExLjYuNjAyLjE3MSBpcyBpbnN0YWxsZWQsIGFuZCB1c2luZyBzb3VuZE1hbmFnZXIgd2l0aCBmbGFzaFZlcnNpb24gPSA4ICh3aGljaCBpcyB0aGUgZGVmYXVsdCkuXHJcbiAgICAgKiBOb3Qgc3VyZSBvZiBleGFjdCBjYXVzZS4gU3VzcGVjdCByYWNlIGNvbmRpdGlvbiBhbmQvb3IgaW52YWxpZCAoTmFOLXN0eWxlKSBwb3NpdGlvbiBhcmd1bWVudCB0cmlja2xpbmcgZG93biB0byB0aGUgbmV4dCBKUyAtPiBGbGFzaCBfc3RhcnQoKSBjYWxsLCBpbiB0aGUgcGxheSgpIGNhc2UuXHJcbiAgICAgKiBGaXg6IHNldFRpbWVvdXQoKSB0byB5aWVsZCwgcGx1cyBzYWZlciBudWxsIC8gTmFOIGNoZWNraW5nIG9uIHBvc2l0aW9uIGFyZ3VtZW50IHByb3ZpZGVkIHRvIEZsYXNoLlxyXG4gICAgICogaHR0cHM6Ly9nZXRzYXRpc2ZhY3Rpb24uY29tL3NjaGlsbG1hbmlhL3RvcGljcy9yZWNlbnRfY2hyb21lX3VwZGF0ZV9zZWVtc190b19oYXZlX2Jyb2tlbl9teV9zbTJfYXVkaW9fcGxheWVyXHJcbiAgICAgKi9cclxuICAgIGlmICghb1NvdW5kLmlzSFRNTDUgJiYgZlYgPT09IDgpIHtcclxuICAgICAgd2luZG93LnNldFRpbWVvdXQoY2FsbGJhY2ssIDApO1xyXG4gICAgfSBlbHNlIHtcclxuICAgICAgY2FsbGJhY2soKTtcclxuICAgIH1cclxuXHJcbiAgfTtcclxuXHJcbiAgLy8gYWRkaXRpb25hbCBzb3VuZE1hbmFnZXIgcHJvcGVydGllcyB0aGF0IHNvdW5kTWFuYWdlci5zZXR1cCgpIHdpbGwgYWNjZXB0XHJcblxyXG4gIGV4dHJhT3B0aW9ucyA9IHtcclxuICAgICdvbnJlYWR5JzogMSxcclxuICAgICdvbnRpbWVvdXQnOiAxLFxyXG4gICAgJ2RlZmF1bHRPcHRpb25zJzogMSxcclxuICAgICdmbGFzaDlPcHRpb25zJzogMSxcclxuICAgICdtb3ZpZVN0YXJPcHRpb25zJzogMVxyXG4gIH07XHJcblxyXG4gIGFzc2lnbiA9IGZ1bmN0aW9uKG8sIG9QYXJlbnQpIHtcclxuXHJcbiAgICAvKipcclxuICAgICAqIHJlY3Vyc2l2ZSBhc3NpZ25tZW50IG9mIHByb3BlcnRpZXMsIHNvdW5kTWFuYWdlci5zZXR1cCgpIGhlbHBlclxyXG4gICAgICogYWxsb3dzIHByb3BlcnR5IGFzc2lnbm1lbnQgYmFzZWQgb24gd2hpdGVsaXN0XHJcbiAgICAgKi9cclxuXHJcbiAgICB2YXIgaSxcclxuICAgICAgICByZXN1bHQgPSB0cnVlLFxyXG4gICAgICAgIGhhc1BhcmVudCA9IChvUGFyZW50ICE9PSBfdW5kZWZpbmVkKSxcclxuICAgICAgICBzZXR1cE9wdGlvbnMgPSBzbTIuc2V0dXBPcHRpb25zLFxyXG4gICAgICAgIGJvbnVzT3B0aW9ucyA9IGV4dHJhT3B0aW9ucztcclxuXHJcbiAgICAvLyA8ZD5cclxuXHJcbiAgICAvLyBpZiBzb3VuZE1hbmFnZXIuc2V0dXAoKSBjYWxsZWQsIHNob3cgYWNjZXB0ZWQgcGFyYW1ldGVycy5cclxuXHJcbiAgICBpZiAobyA9PT0gX3VuZGVmaW5lZCkge1xyXG5cclxuICAgICAgcmVzdWx0ID0gW107XHJcblxyXG4gICAgICBmb3IgKGkgaW4gc2V0dXBPcHRpb25zKSB7XHJcblxyXG4gICAgICAgIGlmIChzZXR1cE9wdGlvbnMuaGFzT3duUHJvcGVydHkoaSkpIHtcclxuICAgICAgICAgIHJlc3VsdC5wdXNoKGkpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgIH1cclxuXHJcbiAgICAgIGZvciAoaSBpbiBib251c09wdGlvbnMpIHtcclxuXHJcbiAgICAgICAgaWYgKGJvbnVzT3B0aW9ucy5oYXNPd25Qcm9wZXJ0eShpKSkge1xyXG5cclxuICAgICAgICAgIGlmICh0eXBlb2Ygc20yW2ldID09PSAnb2JqZWN0Jykge1xyXG5cclxuICAgICAgICAgICAgcmVzdWx0LnB1c2goaSsnOiB7Li4ufScpO1xyXG5cclxuICAgICAgICAgIH0gZWxzZSBpZiAoc20yW2ldIGluc3RhbmNlb2YgRnVuY3Rpb24pIHtcclxuXHJcbiAgICAgICAgICAgIHJlc3VsdC5wdXNoKGkrJzogZnVuY3Rpb24oKSB7Li4ufScpO1xyXG5cclxuICAgICAgICAgIH0gZWxzZSB7XHJcblxyXG4gICAgICAgICAgICByZXN1bHQucHVzaChpKTtcclxuXHJcbiAgICAgICAgICB9XHJcblxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgIH1cclxuXHJcbiAgICAgIHNtMi5fd0Qoc3RyKCdzZXR1cCcsIHJlc3VsdC5qb2luKCcsICcpKSk7XHJcblxyXG4gICAgICByZXR1cm4gZmFsc2U7XHJcblxyXG4gICAgfVxyXG5cclxuICAgIC8vIDwvZD5cclxuXHJcbiAgICBmb3IgKGkgaW4gbykge1xyXG5cclxuICAgICAgaWYgKG8uaGFzT3duUHJvcGVydHkoaSkpIHtcclxuXHJcbiAgICAgICAgLy8gaWYgbm90IGFuIHtvYmplY3R9IHdlIHdhbnQgdG8gcmVjdXJzZSB0aHJvdWdoLi4uXHJcblxyXG4gICAgICAgIGlmICh0eXBlb2Ygb1tpXSAhPT0gJ29iamVjdCcgfHwgb1tpXSA9PT0gbnVsbCB8fCBvW2ldIGluc3RhbmNlb2YgQXJyYXkgfHwgb1tpXSBpbnN0YW5jZW9mIFJlZ0V4cCkge1xyXG5cclxuICAgICAgICAgIC8vIGNoZWNrIFwiYWxsb3dlZFwiIG9wdGlvbnNcclxuXHJcbiAgICAgICAgICBpZiAoaGFzUGFyZW50ICYmIGJvbnVzT3B0aW9uc1tvUGFyZW50XSAhPT0gX3VuZGVmaW5lZCkge1xyXG5cclxuICAgICAgICAgICAgLy8gdmFsaWQgcmVjdXJzaXZlIC8gbmVzdGVkIG9iamVjdCBvcHRpb24sIGVnLiwgeyBkZWZhdWx0T3B0aW9uczogeyB2b2x1bWU6IDUwIH0gfVxyXG4gICAgICAgICAgICBzbTJbb1BhcmVudF1baV0gPSBvW2ldO1xyXG5cclxuICAgICAgICAgIH0gZWxzZSBpZiAoc2V0dXBPcHRpb25zW2ldICE9PSBfdW5kZWZpbmVkKSB7XHJcblxyXG4gICAgICAgICAgICAvLyBzcGVjaWFsIGNhc2U6IGFzc2lnbiB0byBzZXR1cE9wdGlvbnMgb2JqZWN0LCB3aGljaCBzb3VuZE1hbmFnZXIgcHJvcGVydHkgcmVmZXJlbmNlc1xyXG4gICAgICAgICAgICBzbTIuc2V0dXBPcHRpb25zW2ldID0gb1tpXTtcclxuXHJcbiAgICAgICAgICAgIC8vIGFzc2lnbiBkaXJlY3RseSB0byBzb3VuZE1hbmFnZXIsIHRvb1xyXG4gICAgICAgICAgICBzbTJbaV0gPSBvW2ldO1xyXG5cclxuICAgICAgICAgIH0gZWxzZSBpZiAoYm9udXNPcHRpb25zW2ldID09PSBfdW5kZWZpbmVkKSB7XHJcblxyXG4gICAgICAgICAgICAvLyBpbnZhbGlkIG9yIGRpc2FsbG93ZWQgcGFyYW1ldGVyLiBjb21wbGFpbi5cclxuICAgICAgICAgICAgY29tcGxhaW4oc3RyKChzbTJbaV0gPT09IF91bmRlZmluZWQgPyAnc2V0dXBVbmRlZicgOiAnc2V0dXBFcnJvcicpLCBpKSwgMik7XHJcblxyXG4gICAgICAgICAgICByZXN1bHQgPSBmYWxzZTtcclxuXHJcbiAgICAgICAgICB9IGVsc2Uge1xyXG5cclxuICAgICAgICAgICAgLyoqXHJcbiAgICAgICAgICAgICAqIHZhbGlkIGV4dHJhT3B0aW9ucyAoYm9udXNPcHRpb25zKSBwYXJhbWV0ZXIuXHJcbiAgICAgICAgICAgICAqIGlzIGl0IGEgbWV0aG9kLCBsaWtlIG9ucmVhZHkvb250aW1lb3V0PyBjYWxsIGl0LlxyXG4gICAgICAgICAgICAgKiBtdWx0aXBsZSBwYXJhbWV0ZXJzIHNob3VsZCBiZSBpbiBhbiBhcnJheSwgZWcuIHNvdW5kTWFuYWdlci5zZXR1cCh7b25yZWFkeTogW215SGFuZGxlciwgbXlTY29wZV19KTtcclxuICAgICAgICAgICAgICovXHJcblxyXG4gICAgICAgICAgICBpZiAoc20yW2ldIGluc3RhbmNlb2YgRnVuY3Rpb24pIHtcclxuXHJcbiAgICAgICAgICAgICAgc20yW2ldLmFwcGx5KHNtMiwgKG9baV0gaW5zdGFuY2VvZiBBcnJheT8gb1tpXSA6IFtvW2ldXSkpO1xyXG5cclxuICAgICAgICAgICAgfSBlbHNlIHtcclxuXHJcbiAgICAgICAgICAgICAgLy8gZ29vZCBvbGQtZmFzaGlvbmVkIGRpcmVjdCBhc3NpZ25tZW50XHJcbiAgICAgICAgICAgICAgc20yW2ldID0gb1tpXTtcclxuXHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICB9XHJcblxyXG4gICAgICAgIH0gZWxzZSB7XHJcblxyXG4gICAgICAgICAgLy8gcmVjdXJzaW9uIGNhc2UsIGVnLiwgeyBkZWZhdWx0T3B0aW9uczogeyAuLi4gfSB9XHJcblxyXG4gICAgICAgICAgaWYgKGJvbnVzT3B0aW9uc1tpXSA9PT0gX3VuZGVmaW5lZCkge1xyXG5cclxuICAgICAgICAgICAgLy8gaW52YWxpZCBvciBkaXNhbGxvd2VkIHBhcmFtZXRlci4gY29tcGxhaW4uXHJcbiAgICAgICAgICAgIGNvbXBsYWluKHN0cigoc20yW2ldID09PSBfdW5kZWZpbmVkID8gJ3NldHVwVW5kZWYnIDogJ3NldHVwRXJyb3InKSwgaSksIDIpO1xyXG5cclxuICAgICAgICAgICAgcmVzdWx0ID0gZmFsc2U7XHJcblxyXG4gICAgICAgICAgfSBlbHNlIHtcclxuXHJcbiAgICAgICAgICAgIC8vIHJlY3Vyc2UgdGhyb3VnaCBvYmplY3RcclxuICAgICAgICAgICAgcmV0dXJuIGFzc2lnbihvW2ldLCBpKTtcclxuXHJcbiAgICAgICAgICB9XHJcblxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgIH1cclxuXHJcbiAgICB9XHJcblxyXG4gICAgcmV0dXJuIHJlc3VsdDtcclxuXHJcbiAgfTtcclxuXHJcbiAgZnVuY3Rpb24gcHJlZmVyRmxhc2hDaGVjayhraW5kKSB7XHJcblxyXG4gICAgLy8gd2hldGhlciBmbGFzaCBzaG91bGQgcGxheSBhIGdpdmVuIHR5cGVcclxuICAgIHJldHVybiAoc20yLnByZWZlckZsYXNoICYmIGhhc0ZsYXNoICYmICFzbTIuaWdub3JlRmxhc2ggJiYgKHNtMi5mbGFzaFtraW5kXSAhPT0gX3VuZGVmaW5lZCAmJiBzbTIuZmxhc2hba2luZF0pKTtcclxuXHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBJbnRlcm5hbCBET00yLWxldmVsIGV2ZW50IGhlbHBlcnNcclxuICAgKiAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cclxuICAgKi9cclxuXHJcbiAgZXZlbnQgPSAoZnVuY3Rpb24oKSB7XHJcblxyXG4gICAgLy8gbm9ybWFsaXplIGV2ZW50IG1ldGhvZHNcclxuICAgIHZhciBvbGQgPSAod2luZG93LmF0dGFjaEV2ZW50KSxcclxuICAgIGV2dCA9IHtcclxuICAgICAgYWRkOiAob2xkPydhdHRhY2hFdmVudCc6J2FkZEV2ZW50TGlzdGVuZXInKSxcclxuICAgICAgcmVtb3ZlOiAob2xkPydkZXRhY2hFdmVudCc6J3JlbW92ZUV2ZW50TGlzdGVuZXInKVxyXG4gICAgfTtcclxuXHJcbiAgICAvLyBub3JtYWxpemUgXCJvblwiIGV2ZW50IHByZWZpeCwgb3B0aW9uYWwgY2FwdHVyZSBhcmd1bWVudFxyXG4gICAgZnVuY3Rpb24gZ2V0QXJncyhvQXJncykge1xyXG5cclxuICAgICAgdmFyIGFyZ3MgPSBzbGljZS5jYWxsKG9BcmdzKSxcclxuICAgICAgICAgIGxlbiA9IGFyZ3MubGVuZ3RoO1xyXG5cclxuICAgICAgaWYgKG9sZCkge1xyXG4gICAgICAgIC8vIHByZWZpeFxyXG4gICAgICAgIGFyZ3NbMV0gPSAnb24nICsgYXJnc1sxXTtcclxuICAgICAgICBpZiAobGVuID4gMykge1xyXG4gICAgICAgICAgLy8gbm8gY2FwdHVyZVxyXG4gICAgICAgICAgYXJncy5wb3AoKTtcclxuICAgICAgICB9XHJcbiAgICAgIH0gZWxzZSBpZiAobGVuID09PSAzKSB7XHJcbiAgICAgICAgYXJncy5wdXNoKGZhbHNlKTtcclxuICAgICAgfVxyXG5cclxuICAgICAgcmV0dXJuIGFyZ3M7XHJcblxyXG4gICAgfVxyXG5cclxuICAgIGZ1bmN0aW9uIGFwcGx5KGFyZ3MsIHNUeXBlKSB7XHJcblxyXG4gICAgICAvLyBub3JtYWxpemUgYW5kIGNhbGwgdGhlIGV2ZW50IG1ldGhvZCwgd2l0aCB0aGUgcHJvcGVyIGFyZ3VtZW50c1xyXG4gICAgICB2YXIgZWxlbWVudCA9IGFyZ3Muc2hpZnQoKSxcclxuICAgICAgICAgIG1ldGhvZCA9IFtldnRbc1R5cGVdXTtcclxuXHJcbiAgICAgIGlmIChvbGQpIHtcclxuICAgICAgICAvLyBvbGQgSUUgY2FuJ3QgZG8gYXBwbHkoKS5cclxuICAgICAgICBlbGVtZW50W21ldGhvZF0oYXJnc1swXSwgYXJnc1sxXSk7XHJcbiAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgZWxlbWVudFttZXRob2RdLmFwcGx5KGVsZW1lbnQsIGFyZ3MpO1xyXG4gICAgICB9XHJcblxyXG4gICAgfVxyXG5cclxuICAgIGZ1bmN0aW9uIGFkZCgpIHtcclxuXHJcbiAgICAgIGFwcGx5KGdldEFyZ3MoYXJndW1lbnRzKSwgJ2FkZCcpO1xyXG5cclxuICAgIH1cclxuXHJcbiAgICBmdW5jdGlvbiByZW1vdmUoKSB7XHJcblxyXG4gICAgICBhcHBseShnZXRBcmdzKGFyZ3VtZW50cyksICdyZW1vdmUnKTtcclxuXHJcbiAgICB9XHJcblxyXG4gICAgcmV0dXJuIHtcclxuICAgICAgJ2FkZCc6IGFkZCxcclxuICAgICAgJ3JlbW92ZSc6IHJlbW92ZVxyXG4gICAgfTtcclxuXHJcbiAgfSgpKTtcclxuXHJcbiAgLyoqXHJcbiAgICogSW50ZXJuYWwgSFRNTDUgZXZlbnQgaGFuZGxpbmdcclxuICAgKiAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxyXG4gICAqL1xyXG5cclxuICBmdW5jdGlvbiBodG1sNV9ldmVudChvRm4pIHtcclxuXHJcbiAgICAvLyB3cmFwIGh0bWw1IGV2ZW50IGhhbmRsZXJzIHNvIHdlIGRvbid0IGNhbGwgdGhlbSBvbiBkZXN0cm95ZWQgYW5kL29yIHVubG9hZGVkIHNvdW5kc1xyXG5cclxuICAgIHJldHVybiBmdW5jdGlvbihlKSB7XHJcblxyXG4gICAgICB2YXIgcyA9IHRoaXMuX3MsXHJcbiAgICAgICAgICByZXN1bHQ7XHJcblxyXG4gICAgICBpZiAoIXMgfHwgIXMuX2EpIHtcclxuICAgICAgICAvLyA8ZD5cclxuICAgICAgICBpZiAocyAmJiBzLmlkKSB7XHJcbiAgICAgICAgICBzbTIuX3dEKHMuaWQgKyAnOiBJZ25vcmluZyAnICsgZS50eXBlKTtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgc20yLl93RChoNSArICdJZ25vcmluZyAnICsgZS50eXBlKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgLy8gPC9kPlxyXG4gICAgICAgIHJlc3VsdCA9IG51bGw7XHJcbiAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgcmVzdWx0ID0gb0ZuLmNhbGwodGhpcywgZSk7XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIHJldHVybiByZXN1bHQ7XHJcblxyXG4gICAgfTtcclxuXHJcbiAgfVxyXG5cclxuICBodG1sNV9ldmVudHMgPSB7XHJcblxyXG4gICAgLy8gSFRNTDUgZXZlbnQtbmFtZS10by1oYW5kbGVyIG1hcFxyXG5cclxuICAgIGFib3J0OiBodG1sNV9ldmVudChmdW5jdGlvbigpIHtcclxuXHJcbiAgICAgIHNtMi5fd0QodGhpcy5fcy5pZCArICc6IGFib3J0Jyk7XHJcblxyXG4gICAgfSksXHJcblxyXG4gICAgLy8gZW5vdWdoIGhhcyBsb2FkZWQgdG8gcGxheVxyXG5cclxuICAgIGNhbnBsYXk6IGh0bWw1X2V2ZW50KGZ1bmN0aW9uKCkge1xyXG5cclxuICAgICAgdmFyIHMgPSB0aGlzLl9zLFxyXG4gICAgICAgICAgcG9zaXRpb24xSztcclxuXHJcbiAgICAgIGlmIChzLl9odG1sNV9jYW5wbGF5KSB7XHJcbiAgICAgICAgLy8gdGhpcyBldmVudCBoYXMgYWxyZWFkeSBmaXJlZC4gaWdub3JlLlxyXG4gICAgICAgIHJldHVybiB0cnVlO1xyXG4gICAgICB9XHJcblxyXG4gICAgICBzLl9odG1sNV9jYW5wbGF5ID0gdHJ1ZTtcclxuICAgICAgc20yLl93RChzLmlkICsgJzogY2FucGxheScpO1xyXG4gICAgICBzLl9vbmJ1ZmZlcmNoYW5nZSgwKTtcclxuXHJcbiAgICAgIC8vIHBvc2l0aW9uIGFjY29yZGluZyB0byBpbnN0YW5jZSBvcHRpb25zXHJcbiAgICAgIHBvc2l0aW9uMUsgPSAocy5faU8ucG9zaXRpb24gIT09IF91bmRlZmluZWQgJiYgIWlzTmFOKHMuX2lPLnBvc2l0aW9uKSA/IHMuX2lPLnBvc2l0aW9uL21zZWNTY2FsZSA6IG51bGwpO1xyXG5cclxuICAgICAgLy8gc2V0IHRoZSBwb3NpdGlvbiBpZiBwb3NpdGlvbiB3YXMgcHJvdmlkZWQgYmVmb3JlIHRoZSBzb3VuZCBsb2FkZWRcclxuICAgICAgaWYgKHRoaXMuY3VycmVudFRpbWUgIT09IHBvc2l0aW9uMUspIHtcclxuICAgICAgICBzbTIuX3dEKHMuaWQgKyAnOiBjYW5wbGF5OiBTZXR0aW5nIHBvc2l0aW9uIHRvICcgKyBwb3NpdGlvbjFLKTtcclxuICAgICAgICB0cnkge1xyXG4gICAgICAgICAgdGhpcy5jdXJyZW50VGltZSA9IHBvc2l0aW9uMUs7XHJcbiAgICAgICAgfSBjYXRjaChlZSkge1xyXG4gICAgICAgICAgc20yLl93RChzLmlkICsgJzogY2FucGxheTogU2V0dGluZyBwb3NpdGlvbiBvZiAnICsgcG9zaXRpb24xSyArICcgZmFpbGVkOiAnICsgZWUubWVzc2FnZSwgMik7XHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcblxyXG4gICAgICAvLyBoYWNrIGZvciBIVE1MNSBmcm9tL3RvIGNhc2VcclxuICAgICAgaWYgKHMuX2lPLl9vbmNhbnBsYXkpIHtcclxuICAgICAgICBzLl9pTy5fb25jYW5wbGF5KCk7XHJcbiAgICAgIH1cclxuXHJcbiAgICB9KSxcclxuXHJcbiAgICBjYW5wbGF5dGhyb3VnaDogaHRtbDVfZXZlbnQoZnVuY3Rpb24oKSB7XHJcblxyXG4gICAgICB2YXIgcyA9IHRoaXMuX3M7XHJcblxyXG4gICAgICBpZiAoIXMubG9hZGVkKSB7XHJcbiAgICAgICAgcy5fb25idWZmZXJjaGFuZ2UoMCk7XHJcbiAgICAgICAgcy5fd2hpbGVsb2FkaW5nKHMuYnl0ZXNMb2FkZWQsIHMuYnl0ZXNUb3RhbCwgcy5fZ2V0X2h0bWw1X2R1cmF0aW9uKCkpO1xyXG4gICAgICAgIHMuX29ubG9hZCh0cnVlKTtcclxuICAgICAgfVxyXG5cclxuICAgIH0pLFxyXG5cclxuICAgIGR1cmF0aW9uY2hhbmdlOiBodG1sNV9ldmVudChmdW5jdGlvbigpIHtcclxuXHJcbiAgICAgIC8vIGR1cmF0aW9uY2hhbmdlIG1heSBmaXJlIGF0IHZhcmlvdXMgdGltZXMsIHByb2JhYmx5IHRoZSBzYWZlc3Qgd2F5IHRvIGNhcHR1cmUgYWNjdXJhdGUvZmluYWwgZHVyYXRpb24uXHJcblxyXG4gICAgICB2YXIgcyA9IHRoaXMuX3MsXHJcbiAgICAgICAgICBkdXJhdGlvbjtcclxuXHJcbiAgICAgIGR1cmF0aW9uID0gcy5fZ2V0X2h0bWw1X2R1cmF0aW9uKCk7XHJcblxyXG4gICAgICBpZiAoIWlzTmFOKGR1cmF0aW9uKSAmJiBkdXJhdGlvbiAhPT0gcy5kdXJhdGlvbikge1xyXG5cclxuICAgICAgICBzbTIuX3dEKHRoaXMuX3MuaWQgKyAnOiBkdXJhdGlvbmNoYW5nZSAoJyArIGR1cmF0aW9uICsgJyknICsgKHMuZHVyYXRpb24gPyAnLCBwcmV2aW91c2x5ICcgKyBzLmR1cmF0aW9uIDogJycpKTtcclxuXHJcbiAgICAgICAgcy5kdXJhdGlvbkVzdGltYXRlID0gcy5kdXJhdGlvbiA9IGR1cmF0aW9uO1xyXG5cclxuICAgICAgfVxyXG5cclxuICAgIH0pLFxyXG5cclxuICAgIC8vIFRPRE86IFJlc2VydmVkIGZvciBwb3RlbnRpYWwgdXNlXHJcbiAgICAvKlxyXG4gICAgZW1wdGllZDogaHRtbDVfZXZlbnQoZnVuY3Rpb24oKSB7XHJcblxyXG4gICAgICBzbTIuX3dEKHRoaXMuX3MuaWQgKyAnOiBlbXB0aWVkJyk7XHJcblxyXG4gICAgfSksXHJcbiAgICAqL1xyXG5cclxuICAgIGVuZGVkOiBodG1sNV9ldmVudChmdW5jdGlvbigpIHtcclxuXHJcbiAgICAgIHZhciBzID0gdGhpcy5fcztcclxuXHJcbiAgICAgIHNtMi5fd0Qocy5pZCArICc6IGVuZGVkJyk7XHJcblxyXG4gICAgICBzLl9vbmZpbmlzaCgpO1xyXG5cclxuICAgIH0pLFxyXG5cclxuICAgIGVycm9yOiBodG1sNV9ldmVudChmdW5jdGlvbigpIHtcclxuXHJcbiAgICAgIHNtMi5fd0QodGhpcy5fcy5pZCArICc6IEhUTUw1IGVycm9yLCBjb2RlICcgKyB0aGlzLmVycm9yLmNvZGUpO1xyXG4gICAgICAvKipcclxuICAgICAgICogSFRNTDUgZXJyb3IgY29kZXMsIHBlciBXM0NcclxuICAgICAgICogRXJyb3IgMTogQ2xpZW50IGFib3J0ZWQgZG93bmxvYWQgYXQgdXNlcidzIHJlcXVlc3QuXHJcbiAgICAgICAqIEVycm9yIDI6IE5ldHdvcmsgZXJyb3IgYWZ0ZXIgbG9hZCBzdGFydGVkLlxyXG4gICAgICAgKiBFcnJvciAzOiBEZWNvZGluZyBpc3N1ZS5cclxuICAgICAgICogRXJyb3IgNDogTWVkaWEgKGF1ZGlvIGZpbGUpIG5vdCBzdXBwb3J0ZWQuXHJcbiAgICAgICAqIFJlZmVyZW5jZTogaHR0cDovL3d3dy53aGF0d2cub3JnL3NwZWNzL3dlYi1hcHBzL2N1cnJlbnQtd29yay9tdWx0aXBhZ2UvdGhlLXZpZGVvLWVsZW1lbnQuaHRtbCNlcnJvci1jb2Rlc1xyXG4gICAgICAgKi9cclxuICAgICAgLy8gY2FsbCBsb2FkIHdpdGggZXJyb3Igc3RhdGU/XHJcbiAgICAgIHRoaXMuX3MuX29ubG9hZChmYWxzZSk7XHJcblxyXG4gICAgfSksXHJcblxyXG4gICAgbG9hZGVkZGF0YTogaHRtbDVfZXZlbnQoZnVuY3Rpb24oKSB7XHJcblxyXG4gICAgICB2YXIgcyA9IHRoaXMuX3M7XHJcblxyXG4gICAgICBzbTIuX3dEKHMuaWQgKyAnOiBsb2FkZWRkYXRhJyk7XHJcblxyXG4gICAgICAvLyBzYWZhcmkgc2VlbXMgdG8gbmljZWx5IHJlcG9ydCBwcm9ncmVzcyBldmVudHMsIGV2ZW50dWFsbHkgdG90YWxsaW5nIDEwMCVcclxuICAgICAgaWYgKCFzLl9sb2FkZWQgJiYgIWlzU2FmYXJpKSB7XHJcbiAgICAgICAgcy5kdXJhdGlvbiA9IHMuX2dldF9odG1sNV9kdXJhdGlvbigpO1xyXG4gICAgICB9XHJcblxyXG4gICAgfSksXHJcblxyXG4gICAgbG9hZGVkbWV0YWRhdGE6IGh0bWw1X2V2ZW50KGZ1bmN0aW9uKCkge1xyXG5cclxuICAgICAgc20yLl93RCh0aGlzLl9zLmlkICsgJzogbG9hZGVkbWV0YWRhdGEnKTtcclxuXHJcbiAgICB9KSxcclxuXHJcbiAgICBsb2Fkc3RhcnQ6IGh0bWw1X2V2ZW50KGZ1bmN0aW9uKCkge1xyXG5cclxuICAgICAgc20yLl93RCh0aGlzLl9zLmlkICsgJzogbG9hZHN0YXJ0Jyk7XHJcbiAgICAgIC8vIGFzc3VtZSBidWZmZXJpbmcgYXQgZmlyc3RcclxuICAgICAgdGhpcy5fcy5fb25idWZmZXJjaGFuZ2UoMSk7XHJcblxyXG4gICAgfSksXHJcblxyXG4gICAgcGxheTogaHRtbDVfZXZlbnQoZnVuY3Rpb24oKSB7XHJcblxyXG4gICAgICAvLyBzbTIuX3dEKHRoaXMuX3MuaWQgKyAnOiBwbGF5KCknKTtcclxuICAgICAgLy8gb25jZSBwbGF5IHN0YXJ0cywgbm8gYnVmZmVyaW5nXHJcbiAgICAgIHRoaXMuX3MuX29uYnVmZmVyY2hhbmdlKDApO1xyXG5cclxuICAgIH0pLFxyXG5cclxuICAgIHBsYXlpbmc6IGh0bWw1X2V2ZW50KGZ1bmN0aW9uKCkge1xyXG5cclxuICAgICAgc20yLl93RCh0aGlzLl9zLmlkICsgJzogcGxheWluZyAnICsgU3RyaW5nLmZyb21DaGFyQ29kZSg5ODM1KSk7XHJcbiAgICAgIC8vIG9uY2UgcGxheSBzdGFydHMsIG5vIGJ1ZmZlcmluZ1xyXG4gICAgICB0aGlzLl9zLl9vbmJ1ZmZlcmNoYW5nZSgwKTtcclxuXHJcbiAgICB9KSxcclxuXHJcbiAgICBwcm9ncmVzczogaHRtbDVfZXZlbnQoZnVuY3Rpb24oZSkge1xyXG5cclxuICAgICAgLy8gbm90ZTogY2FuIGZpcmUgcmVwZWF0ZWRseSBhZnRlciBcImxvYWRlZFwiIGV2ZW50LCBkdWUgdG8gdXNlIG9mIEhUVFAgcmFuZ2UvcGFydGlhbHNcclxuXHJcbiAgICAgIHZhciBzID0gdGhpcy5fcyxcclxuICAgICAgICAgIGksIGosIHByb2dTdHIsIGJ1ZmZlcmVkID0gMCxcclxuICAgICAgICAgIGlzUHJvZ3Jlc3MgPSAoZS50eXBlID09PSAncHJvZ3Jlc3MnKSxcclxuICAgICAgICAgIHJhbmdlcyA9IGUudGFyZ2V0LmJ1ZmZlcmVkLFxyXG4gICAgICAgICAgLy8gZmlyZWZveCAzLjYgaW1wbGVtZW50cyBlLmxvYWRlZC90b3RhbCAoYnl0ZXMpXHJcbiAgICAgICAgICBsb2FkZWQgPSAoZS5sb2FkZWR8fDApLFxyXG4gICAgICAgICAgdG90YWwgPSAoZS50b3RhbHx8MSk7XHJcblxyXG4gICAgICAvLyByZXNldCB0aGUgXCJidWZmZXJlZFwiIChsb2FkZWQgYnl0ZSByYW5nZXMpIGFycmF5XHJcbiAgICAgIHMuYnVmZmVyZWQgPSBbXTtcclxuXHJcbiAgICAgIGlmIChyYW5nZXMgJiYgcmFuZ2VzLmxlbmd0aCkge1xyXG5cclxuICAgICAgICAvLyBpZiBsb2FkZWQgaXMgMCwgdHJ5IFRpbWVSYW5nZXMgaW1wbGVtZW50YXRpb24gYXMgJSBvZiBsb2FkXHJcbiAgICAgICAgLy8gaHR0cHM6Ly9kZXZlbG9wZXIubW96aWxsYS5vcmcvZW4vRE9NL1RpbWVSYW5nZXNcclxuXHJcbiAgICAgICAgLy8gcmUtYnVpbGQgXCJidWZmZXJlZFwiIGFycmF5XHJcbiAgICAgICAgLy8gSFRNTDUgcmV0dXJucyBzZWNvbmRzLiBTTTIgQVBJIHVzZXMgbXNlYyBmb3Igc2V0UG9zaXRpb24oKSBldGMuLCB3aGV0aGVyIEZsYXNoIG9yIEhUTUw1LlxyXG4gICAgICAgIGZvciAoaT0wLCBqPXJhbmdlcy5sZW5ndGg7IGk8ajsgaSsrKSB7XHJcbiAgICAgICAgICBzLmJ1ZmZlcmVkLnB1c2goe1xyXG4gICAgICAgICAgICAnc3RhcnQnOiByYW5nZXMuc3RhcnQoaSkgKiBtc2VjU2NhbGUsXHJcbiAgICAgICAgICAgICdlbmQnOiByYW5nZXMuZW5kKGkpICogbXNlY1NjYWxlXHJcbiAgICAgICAgICB9KTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8vIHVzZSB0aGUgbGFzdCB2YWx1ZSBsb2NhbGx5XHJcbiAgICAgICAgYnVmZmVyZWQgPSAocmFuZ2VzLmVuZCgwKSAtIHJhbmdlcy5zdGFydCgwKSkgKiBtc2VjU2NhbGU7XHJcblxyXG4gICAgICAgIC8vIGxpbmVhciBjYXNlLCBidWZmZXIgc3VtOyBkb2VzIG5vdCBhY2NvdW50IGZvciBzZWVraW5nIGFuZCBIVFRQIHBhcnRpYWxzIC8gYnl0ZSByYW5nZXNcclxuICAgICAgICBsb2FkZWQgPSBNYXRoLm1pbigxLCBidWZmZXJlZC8oZS50YXJnZXQuZHVyYXRpb24qbXNlY1NjYWxlKSk7XHJcblxyXG4gICAgICAgIC8vIDxkPlxyXG4gICAgICAgIGlmIChpc1Byb2dyZXNzICYmIHJhbmdlcy5sZW5ndGggPiAxKSB7XHJcbiAgICAgICAgICBwcm9nU3RyID0gW107XHJcbiAgICAgICAgICBqID0gcmFuZ2VzLmxlbmd0aDtcclxuICAgICAgICAgIGZvciAoaT0wOyBpPGo7IGkrKykge1xyXG4gICAgICAgICAgICBwcm9nU3RyLnB1c2goZS50YXJnZXQuYnVmZmVyZWQuc3RhcnQoaSkqbXNlY1NjYWxlICsnLScrIGUudGFyZ2V0LmJ1ZmZlcmVkLmVuZChpKSptc2VjU2NhbGUpO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgICAgc20yLl93RCh0aGlzLl9zLmlkICsgJzogcHJvZ3Jlc3MsIHRpbWVSYW5nZXM6ICcgKyBwcm9nU3RyLmpvaW4oJywgJykpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgaWYgKGlzUHJvZ3Jlc3MgJiYgIWlzTmFOKGxvYWRlZCkpIHtcclxuICAgICAgICAgIHNtMi5fd0QodGhpcy5fcy5pZCArICc6IHByb2dyZXNzLCAnICsgTWF0aC5mbG9vcihsb2FkZWQqMTAwKSArICclIGxvYWRlZCcpO1xyXG4gICAgICAgIH1cclxuICAgICAgICAvLyA8L2Q+XHJcblxyXG4gICAgICB9XHJcblxyXG4gICAgICBpZiAoIWlzTmFOKGxvYWRlZCkpIHtcclxuXHJcbiAgICAgICAgLy8gVE9ETzogcHJldmVudCBjYWxscyB3aXRoIGR1cGxpY2F0ZSB2YWx1ZXMuXHJcbiAgICAgICAgcy5fd2hpbGVsb2FkaW5nKGxvYWRlZCwgdG90YWwsIHMuX2dldF9odG1sNV9kdXJhdGlvbigpKTtcclxuICAgICAgICBpZiAobG9hZGVkICYmIHRvdGFsICYmIGxvYWRlZCA9PT0gdG90YWwpIHtcclxuICAgICAgICAgIC8vIGluIGNhc2UgXCJvbmxvYWRcIiBkb2Vzbid0IGZpcmUgKGVnLiBnZWNrbyAxLjkuMilcclxuICAgICAgICAgIGh0bWw1X2V2ZW50cy5jYW5wbGF5dGhyb3VnaC5jYWxsKHRoaXMsIGUpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgIH1cclxuXHJcbiAgICB9KSxcclxuXHJcbiAgICByYXRlY2hhbmdlOiBodG1sNV9ldmVudChmdW5jdGlvbigpIHtcclxuXHJcbiAgICAgIHNtMi5fd0QodGhpcy5fcy5pZCArICc6IHJhdGVjaGFuZ2UnKTtcclxuXHJcbiAgICB9KSxcclxuXHJcbiAgICBzdXNwZW5kOiBodG1sNV9ldmVudChmdW5jdGlvbihlKSB7XHJcblxyXG4gICAgICAvLyBkb3dubG9hZCBwYXVzZWQvc3RvcHBlZCwgbWF5IGhhdmUgZmluaXNoZWQgKGVnLiBvbmxvYWQpXHJcbiAgICAgIHZhciBzID0gdGhpcy5fcztcclxuXHJcbiAgICAgIHNtMi5fd0QodGhpcy5fcy5pZCArICc6IHN1c3BlbmQnKTtcclxuICAgICAgaHRtbDVfZXZlbnRzLnByb2dyZXNzLmNhbGwodGhpcywgZSk7XHJcbiAgICAgIHMuX29uc3VzcGVuZCgpO1xyXG5cclxuICAgIH0pLFxyXG5cclxuICAgIHN0YWxsZWQ6IGh0bWw1X2V2ZW50KGZ1bmN0aW9uKCkge1xyXG5cclxuICAgICAgc20yLl93RCh0aGlzLl9zLmlkICsgJzogc3RhbGxlZCcpO1xyXG5cclxuICAgIH0pLFxyXG5cclxuICAgIHRpbWV1cGRhdGU6IGh0bWw1X2V2ZW50KGZ1bmN0aW9uKCkge1xyXG5cclxuICAgICAgdGhpcy5fcy5fb25UaW1lcigpO1xyXG5cclxuICAgIH0pLFxyXG5cclxuICAgIHdhaXRpbmc6IGh0bWw1X2V2ZW50KGZ1bmN0aW9uKCkge1xyXG5cclxuICAgICAgdmFyIHMgPSB0aGlzLl9zO1xyXG5cclxuICAgICAgLy8gc2VlIGFsc286IHNlZWtpbmdcclxuICAgICAgc20yLl93RCh0aGlzLl9zLmlkICsgJzogd2FpdGluZycpO1xyXG5cclxuICAgICAgLy8gcGxheWJhY2sgZmFzdGVyIHRoYW4gZG93bmxvYWQgcmF0ZSwgZXRjLlxyXG4gICAgICBzLl9vbmJ1ZmZlcmNoYW5nZSgxKTtcclxuXHJcbiAgICB9KVxyXG5cclxuICB9O1xyXG5cclxuICBodG1sNU9LID0gZnVuY3Rpb24oaU8pIHtcclxuXHJcbiAgICAvLyBwbGF5YWJpbGl0eSB0ZXN0IGJhc2VkIG9uIFVSTCBvciBNSU1FIHR5cGVcclxuXHJcbiAgICB2YXIgcmVzdWx0O1xyXG5cclxuICAgIGlmICghaU8gfHwgKCFpTy50eXBlICYmICFpTy51cmwgJiYgIWlPLnNlcnZlclVSTCkpIHtcclxuXHJcbiAgICAgIC8vIG5vdGhpbmcgdG8gY2hlY2tcclxuICAgICAgcmVzdWx0ID0gZmFsc2U7XHJcblxyXG4gICAgfSBlbHNlIGlmIChpTy5zZXJ2ZXJVUkwgfHwgKGlPLnR5cGUgJiYgcHJlZmVyRmxhc2hDaGVjayhpTy50eXBlKSkpIHtcclxuXHJcbiAgICAgIC8vIFJUTVAsIG9yIHByZWZlcnJpbmcgZmxhc2hcclxuICAgICAgcmVzdWx0ID0gZmFsc2U7XHJcblxyXG4gICAgfSBlbHNlIHtcclxuXHJcbiAgICAgIC8vIFVzZSB0eXBlLCBpZiBzcGVjaWZpZWQuIFBhc3MgZGF0YTogVVJJcyB0byBIVE1MNS4gSWYgSFRNTDUtb25seSBtb2RlLCBubyBvdGhlciBvcHRpb25zLCBzbyBqdXN0IGdpdmUgJ2VyXHJcbiAgICAgIHJlc3VsdCA9ICgoaU8udHlwZSA/IGh0bWw1Q2FuUGxheSh7dHlwZTppTy50eXBlfSkgOiBodG1sNUNhblBsYXkoe3VybDppTy51cmx9KSB8fCBzbTIuaHRtbDVPbmx5IHx8IGlPLnVybC5tYXRjaCgvZGF0YVxcOi9pKSkpO1xyXG5cclxuICAgIH1cclxuXHJcbiAgICByZXR1cm4gcmVzdWx0O1xyXG5cclxuICB9O1xyXG5cclxuICBodG1sNVVubG9hZCA9IGZ1bmN0aW9uKG9BdWRpbykge1xyXG5cclxuICAgIC8qKlxyXG4gICAgICogSW50ZXJuYWwgbWV0aG9kOiBVbmxvYWQgbWVkaWEsIGFuZCBjYW5jZWwgYW55IGN1cnJlbnQvcGVuZGluZyBuZXR3b3JrIHJlcXVlc3RzLlxyXG4gICAgICogRmlyZWZveCBjYW4gbG9hZCBhbiBlbXB0eSBVUkwsIHdoaWNoIGFsbGVnZWRseSBkZXN0cm95cyB0aGUgZGVjb2RlciBhbmQgc3RvcHMgdGhlIGRvd25sb2FkLlxyXG4gICAgICogaHR0cHM6Ly9kZXZlbG9wZXIubW96aWxsYS5vcmcvRW4vVXNpbmdfYXVkaW9fYW5kX3ZpZGVvX2luX0ZpcmVmb3gjU3RvcHBpbmdfdGhlX2Rvd25sb2FkX29mX21lZGlhXHJcbiAgICAgKiBIb3dldmVyLCBGaXJlZm94IGhhcyBiZWVuIHNlZW4gbG9hZGluZyBhIHJlbGF0aXZlIFVSTCBmcm9tICcnIGFuZCB0aHVzIHJlcXVlc3RpbmcgdGhlIGhvc3RpbmcgcGFnZSBvbiB1bmxvYWQuXHJcbiAgICAgKiBPdGhlciBVQSBiZWhhdmlvdXIgaXMgdW5jbGVhciwgc28gZXZlcnlvbmUgZWxzZSBnZXRzIGFuIGFib3V0OmJsYW5rLXN0eWxlIFVSTC5cclxuICAgICAqL1xyXG5cclxuICAgIHZhciB1cmw7XHJcblxyXG4gICAgaWYgKG9BdWRpbykge1xyXG5cclxuICAgICAgLy8gRmlyZWZveCBhbmQgQ2hyb21lIGFjY2VwdCBzaG9ydCBXQVZlIGRhdGE6IFVSSXMuIENob21lIGRpc2xpa2VzIGF1ZGlvL3dhdiwgYnV0IGFjY2VwdHMgYXVkaW8vd2F2IGZvciBkYXRhOiBNSU1FLlxyXG4gICAgICAvLyBEZXNrdG9wIFNhZmFyaSBjb21wbGFpbnMgLyBmYWlscyBvbiBkYXRhOiBVUkksIHNvIGl0IGdldHMgYWJvdXQ6YmxhbmsuXHJcbiAgICAgIHVybCA9IChpc1NhZmFyaSA/IGVtcHR5VVJMIDogKHNtMi5odG1sNS5jYW5QbGF5VHlwZSgnYXVkaW8vd2F2JykgPyBlbXB0eVdBViA6IGVtcHR5VVJMKSk7XHJcblxyXG4gICAgICBvQXVkaW8uc3JjID0gdXJsO1xyXG5cclxuICAgICAgLy8gcmVzZXQgc29tZSBzdGF0ZSwgdG9vXHJcbiAgICAgIGlmIChvQXVkaW8uX2NhbGxlZF91bmxvYWQgIT09IHVuZGVmaW5lZCkge1xyXG4gICAgICAgIG9BdWRpby5fY2FsbGVkX2xvYWQgPSBmYWxzZTtcclxuICAgICAgfVxyXG5cclxuICAgIH1cclxuXHJcbiAgICBpZiAodXNlR2xvYmFsSFRNTDVBdWRpbykge1xyXG5cclxuICAgICAgLy8gZW5zdXJlIFVSTCBzdGF0ZSBpcyB0cmFzaGVkLCBhbHNvXHJcbiAgICAgIGxhc3RHbG9iYWxIVE1MNVVSTCA9IG51bGw7XHJcblxyXG4gICAgfVxyXG5cclxuICAgIHJldHVybiB1cmw7XHJcblxyXG4gIH07XHJcblxyXG4gIGh0bWw1Q2FuUGxheSA9IGZ1bmN0aW9uKG8pIHtcclxuXHJcbiAgICAvKipcclxuICAgICAqIFRyeSB0byBmaW5kIE1JTUUsIHRlc3QgYW5kIHJldHVybiB0cnV0aGluZXNzXHJcbiAgICAgKiBvID0ge1xyXG4gICAgICogIHVybDogJy9wYXRoL3RvL2FuLm1wMycsXHJcbiAgICAgKiAgdHlwZTogJ2F1ZGlvL21wMydcclxuICAgICAqIH1cclxuICAgICAqL1xyXG5cclxuICAgIGlmICghc20yLnVzZUhUTUw1QXVkaW8gfHwgIXNtMi5oYXNIVE1MNSkge1xyXG4gICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICB9XHJcblxyXG4gICAgdmFyIHVybCA9IChvLnVybCB8fCBudWxsKSxcclxuICAgICAgICBtaW1lID0gKG8udHlwZSB8fCBudWxsKSxcclxuICAgICAgICBhRiA9IHNtMi5hdWRpb0Zvcm1hdHMsXHJcbiAgICAgICAgcmVzdWx0LFxyXG4gICAgICAgIG9mZnNldCxcclxuICAgICAgICBmaWxlRXh0LFxyXG4gICAgICAgIGl0ZW07XHJcblxyXG4gICAgLy8gYWNjb3VudCBmb3Iga25vd24gY2FzZXMgbGlrZSBhdWRpby9tcDNcclxuXHJcbiAgICBpZiAobWltZSAmJiBzbTIuaHRtbDVbbWltZV0gIT09IF91bmRlZmluZWQpIHtcclxuICAgICAgcmV0dXJuIChzbTIuaHRtbDVbbWltZV0gJiYgIXByZWZlckZsYXNoQ2hlY2sobWltZSkpO1xyXG4gICAgfVxyXG5cclxuICAgIGlmICghaHRtbDVFeHQpIHtcclxuICAgICAgaHRtbDVFeHQgPSBbXTtcclxuICAgICAgZm9yIChpdGVtIGluIGFGKSB7XHJcbiAgICAgICAgaWYgKGFGLmhhc093blByb3BlcnR5KGl0ZW0pKSB7XHJcbiAgICAgICAgICBodG1sNUV4dC5wdXNoKGl0ZW0pO1xyXG4gICAgICAgICAgaWYgKGFGW2l0ZW1dLnJlbGF0ZWQpIHtcclxuICAgICAgICAgICAgaHRtbDVFeHQgPSBodG1sNUV4dC5jb25jYXQoYUZbaXRlbV0ucmVsYXRlZCk7XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcbiAgICAgIGh0bWw1RXh0ID0gbmV3IFJlZ0V4cCgnXFxcXC4oJytodG1sNUV4dC5qb2luKCd8JykrJykoXFxcXD8uKik/JCcsJ2knKTtcclxuICAgIH1cclxuXHJcbiAgICAvLyBUT0RPOiBTdHJpcCBVUkwgcXVlcmllcywgZXRjLlxyXG4gICAgZmlsZUV4dCA9ICh1cmwgPyB1cmwudG9Mb3dlckNhc2UoKS5tYXRjaChodG1sNUV4dCkgOiBudWxsKTtcclxuXHJcbiAgICBpZiAoIWZpbGVFeHQgfHwgIWZpbGVFeHQubGVuZ3RoKSB7XHJcbiAgICAgIGlmICghbWltZSkge1xyXG4gICAgICAgIHJlc3VsdCA9IGZhbHNlO1xyXG4gICAgICB9IGVsc2Uge1xyXG4gICAgICAgIC8vIGF1ZGlvL21wMyAtPiBtcDMsIHJlc3VsdCBzaG91bGQgYmUga25vd25cclxuICAgICAgICBvZmZzZXQgPSBtaW1lLmluZGV4T2YoJzsnKTtcclxuICAgICAgICAvLyBzdHJpcCBcImF1ZGlvL1g7IGNvZGVjcy4uLlwiXHJcbiAgICAgICAgZmlsZUV4dCA9IChvZmZzZXQgIT09IC0xP21pbWUuc3Vic3RyKDAsb2Zmc2V0KTptaW1lKS5zdWJzdHIoNik7XHJcbiAgICAgIH1cclxuICAgIH0gZWxzZSB7XHJcbiAgICAgIC8vIG1hdGNoIHRoZSByYXcgZXh0ZW5zaW9uIG5hbWUgLSBcIm1wM1wiLCBmb3IgZXhhbXBsZVxyXG4gICAgICBmaWxlRXh0ID0gZmlsZUV4dFsxXTtcclxuICAgIH1cclxuXHJcbiAgICBpZiAoZmlsZUV4dCAmJiBzbTIuaHRtbDVbZmlsZUV4dF0gIT09IF91bmRlZmluZWQpIHtcclxuICAgICAgLy8gcmVzdWx0IGtub3duXHJcbiAgICAgIHJlc3VsdCA9IChzbTIuaHRtbDVbZmlsZUV4dF0gJiYgIXByZWZlckZsYXNoQ2hlY2soZmlsZUV4dCkpO1xyXG4gICAgfSBlbHNlIHtcclxuICAgICAgbWltZSA9ICdhdWRpby8nK2ZpbGVFeHQ7XHJcbiAgICAgIHJlc3VsdCA9IHNtMi5odG1sNS5jYW5QbGF5VHlwZSh7dHlwZTptaW1lfSk7XHJcbiAgICAgIHNtMi5odG1sNVtmaWxlRXh0XSA9IHJlc3VsdDtcclxuICAgICAgLy8gc20yLl93RCgnY2FuUGxheVR5cGUsIGZvdW5kIHJlc3VsdDogJyArIHJlc3VsdCk7XHJcbiAgICAgIHJlc3VsdCA9IChyZXN1bHQgJiYgc20yLmh0bWw1W21pbWVdICYmICFwcmVmZXJGbGFzaENoZWNrKG1pbWUpKTtcclxuICAgIH1cclxuXHJcbiAgICByZXR1cm4gcmVzdWx0O1xyXG5cclxuICB9O1xyXG5cclxuICB0ZXN0SFRNTDUgPSBmdW5jdGlvbigpIHtcclxuXHJcbiAgICAvKipcclxuICAgICAqIEludGVybmFsOiBJdGVyYXRlcyBvdmVyIGF1ZGlvRm9ybWF0cywgZGV0ZXJtaW5pbmcgc3VwcG9ydCBlZy4gYXVkaW8vbXAzLCBhdWRpby9tcGVnIGFuZCBzbyBvblxyXG4gICAgICogYXNzaWducyByZXN1bHRzIHRvIGh0bWw1W10gYW5kIGZsYXNoW10uXHJcbiAgICAgKi9cclxuXHJcbiAgICBpZiAoIXNtMi51c2VIVE1MNUF1ZGlvIHx8ICFzbTIuaGFzSFRNTDUpIHtcclxuICAgICAgLy8gd2l0aG91dCBIVE1MNSwgd2UgbmVlZCBGbGFzaC5cclxuICAgICAgc20yLmh0bWw1LnVzaW5nRmxhc2ggPSB0cnVlO1xyXG4gICAgICBuZWVkc0ZsYXNoID0gdHJ1ZTtcclxuICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgfVxyXG5cclxuICAgIC8vIGRvdWJsZS13aGFtbXk6IE9wZXJhIDkuNjQgdGhyb3dzIFdST05HX0FSR1VNRU5UU19FUlIgaWYgbm8gcGFyYW1ldGVyIHBhc3NlZCB0byBBdWRpbygpLCBhbmQgV2Via2l0ICsgaU9TIGhhcHBpbHkgdHJpZXMgdG8gbG9hZCBcIm51bGxcIiBhcyBhIFVSTC4gOi9cclxuICAgIHZhciBhID0gKEF1ZGlvICE9PSBfdW5kZWZpbmVkID8gKGlzT3BlcmEgJiYgb3BlcmEudmVyc2lvbigpIDwgMTAgPyBuZXcgQXVkaW8obnVsbCkgOiBuZXcgQXVkaW8oKSkgOiBudWxsKSxcclxuICAgICAgICBpdGVtLCBsb29rdXAsIHN1cHBvcnQgPSB7fSwgYUYsIGk7XHJcblxyXG4gICAgZnVuY3Rpb24gY3AobSkge1xyXG5cclxuICAgICAgdmFyIGNhblBsYXksIGosXHJcbiAgICAgICAgICByZXN1bHQgPSBmYWxzZSxcclxuICAgICAgICAgIGlzT0sgPSBmYWxzZTtcclxuXHJcbiAgICAgIGlmICghYSB8fCB0eXBlb2YgYS5jYW5QbGF5VHlwZSAhPT0gJ2Z1bmN0aW9uJykge1xyXG4gICAgICAgIHJldHVybiByZXN1bHQ7XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIGlmIChtIGluc3RhbmNlb2YgQXJyYXkpIHtcclxuICAgICAgICAvLyBpdGVyYXRlIHRocm91Z2ggYWxsIG1pbWUgdHlwZXMsIHJldHVybiBhbnkgc3VjY2Vzc2VzXHJcbiAgICAgICAgZm9yIChpPTAsIGo9bS5sZW5ndGg7IGk8ajsgaSsrKSB7XHJcbiAgICAgICAgICBpZiAoc20yLmh0bWw1W21baV1dIHx8IGEuY2FuUGxheVR5cGUobVtpXSkubWF0Y2goc20yLmh0bWw1VGVzdCkpIHtcclxuICAgICAgICAgICAgaXNPSyA9IHRydWU7XHJcbiAgICAgICAgICAgIHNtMi5odG1sNVttW2ldXSA9IHRydWU7XHJcbiAgICAgICAgICAgIC8vIG5vdGUgZmxhc2ggc3VwcG9ydCwgdG9vXHJcbiAgICAgICAgICAgIHNtMi5mbGFzaFttW2ldXSA9ICEhKG1baV0ubWF0Y2goZmxhc2hNSU1FKSk7XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJlc3VsdCA9IGlzT0s7XHJcbiAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgY2FuUGxheSA9IChhICYmIHR5cGVvZiBhLmNhblBsYXlUeXBlID09PSAnZnVuY3Rpb24nID8gYS5jYW5QbGF5VHlwZShtKSA6IGZhbHNlKTtcclxuICAgICAgICByZXN1bHQgPSAhIShjYW5QbGF5ICYmIChjYW5QbGF5Lm1hdGNoKHNtMi5odG1sNVRlc3QpKSk7XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIHJldHVybiByZXN1bHQ7XHJcblxyXG4gICAgfVxyXG5cclxuICAgIC8vIHRlc3QgYWxsIHJlZ2lzdGVyZWQgZm9ybWF0cyArIGNvZGVjc1xyXG5cclxuICAgIGFGID0gc20yLmF1ZGlvRm9ybWF0cztcclxuXHJcbiAgICBmb3IgKGl0ZW0gaW4gYUYpIHtcclxuXHJcbiAgICAgIGlmIChhRi5oYXNPd25Qcm9wZXJ0eShpdGVtKSkge1xyXG5cclxuICAgICAgICBsb29rdXAgPSAnYXVkaW8vJyArIGl0ZW07XHJcblxyXG4gICAgICAgIHN1cHBvcnRbaXRlbV0gPSBjcChhRltpdGVtXS50eXBlKTtcclxuXHJcbiAgICAgICAgLy8gd3JpdGUgYmFjayBnZW5lcmljIHR5cGUgdG9vLCBlZy4gYXVkaW8vbXAzXHJcbiAgICAgICAgc3VwcG9ydFtsb29rdXBdID0gc3VwcG9ydFtpdGVtXTtcclxuXHJcbiAgICAgICAgLy8gYXNzaWduIGZsYXNoXHJcbiAgICAgICAgaWYgKGl0ZW0ubWF0Y2goZmxhc2hNSU1FKSkge1xyXG5cclxuICAgICAgICAgIHNtMi5mbGFzaFtpdGVtXSA9IHRydWU7XHJcbiAgICAgICAgICBzbTIuZmxhc2hbbG9va3VwXSA9IHRydWU7XHJcblxyXG4gICAgICAgIH0gZWxzZSB7XHJcblxyXG4gICAgICAgICAgc20yLmZsYXNoW2l0ZW1dID0gZmFsc2U7XHJcbiAgICAgICAgICBzbTIuZmxhc2hbbG9va3VwXSA9IGZhbHNlO1xyXG5cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8vIGFzc2lnbiByZXN1bHQgdG8gcmVsYXRlZCBmb3JtYXRzLCB0b29cclxuXHJcbiAgICAgICAgaWYgKGFGW2l0ZW1dICYmIGFGW2l0ZW1dLnJlbGF0ZWQpIHtcclxuXHJcbiAgICAgICAgICBmb3IgKGk9YUZbaXRlbV0ucmVsYXRlZC5sZW5ndGgtMTsgaSA+PSAwOyBpLS0pIHtcclxuXHJcbiAgICAgICAgICAgIC8vIGVnLiBhdWRpby9tNGFcclxuICAgICAgICAgICAgc3VwcG9ydFsnYXVkaW8vJythRltpdGVtXS5yZWxhdGVkW2ldXSA9IHN1cHBvcnRbaXRlbV07XHJcbiAgICAgICAgICAgIHNtMi5odG1sNVthRltpdGVtXS5yZWxhdGVkW2ldXSA9IHN1cHBvcnRbaXRlbV07XHJcbiAgICAgICAgICAgIHNtMi5mbGFzaFthRltpdGVtXS5yZWxhdGVkW2ldXSA9IHN1cHBvcnRbaXRlbV07XHJcblxyXG4gICAgICAgICAgfVxyXG5cclxuICAgICAgICB9XHJcblxyXG4gICAgICB9XHJcblxyXG4gICAgfVxyXG5cclxuICAgIHN1cHBvcnQuY2FuUGxheVR5cGUgPSAoYT9jcDpudWxsKTtcclxuICAgIHNtMi5odG1sNSA9IG1peGluKHNtMi5odG1sNSwgc3VwcG9ydCk7XHJcblxyXG4gICAgc20yLmh0bWw1LnVzaW5nRmxhc2ggPSBmZWF0dXJlQ2hlY2soKTtcclxuICAgIG5lZWRzRmxhc2ggPSBzbTIuaHRtbDUudXNpbmdGbGFzaDtcclxuXHJcbiAgICByZXR1cm4gdHJ1ZTtcclxuXHJcbiAgfTtcclxuXHJcbiAgc3RyaW5ncyA9IHtcclxuXHJcbiAgICAvLyA8ZD5cclxuICAgIG5vdFJlYWR5OiAnVW5hdmFpbGFibGUgLSB3YWl0IHVudGlsIG9ucmVhZHkoKSBoYXMgZmlyZWQuJyxcclxuICAgIG5vdE9LOiAnQXVkaW8gc3VwcG9ydCBpcyBub3QgYXZhaWxhYmxlLicsXHJcbiAgICBkb21FcnJvcjogc20gKyAnZXhjZXB0aW9uIGNhdWdodCB3aGlsZSBhcHBlbmRpbmcgU1dGIHRvIERPTS4nLFxyXG4gICAgc3BjV21vZGU6ICdSZW1vdmluZyB3bW9kZSwgcHJldmVudGluZyBrbm93biBTV0YgbG9hZGluZyBpc3N1ZShzKScsXHJcbiAgICBzd2Y0MDQ6IHNtYyArICdWZXJpZnkgdGhhdCAlcyBpcyBhIHZhbGlkIHBhdGguJyxcclxuICAgIHRyeURlYnVnOiAnVHJ5ICcgKyBzbSArICcuZGVidWdGbGFzaCA9IHRydWUgZm9yIG1vcmUgc2VjdXJpdHkgZGV0YWlscyAob3V0cHV0IGdvZXMgdG8gU1dGLiknLFxyXG4gICAgY2hlY2tTV0Y6ICdTZWUgU1dGIG91dHB1dCBmb3IgbW9yZSBkZWJ1ZyBpbmZvLicsXHJcbiAgICBsb2NhbEZhaWw6IHNtYyArICdOb24tSFRUUCBwYWdlICgnICsgZG9jLmxvY2F0aW9uLnByb3RvY29sICsgJyBVUkw/KSBSZXZpZXcgRmxhc2ggcGxheWVyIHNlY3VyaXR5IHNldHRpbmdzIGZvciB0aGlzIHNwZWNpYWwgY2FzZTpcXG5odHRwOi8vd3d3Lm1hY3JvbWVkaWEuY29tL3N1cHBvcnQvZG9jdW1lbnRhdGlvbi9lbi9mbGFzaHBsYXllci9oZWxwL3NldHRpbmdzX21hbmFnZXIwNC5odG1sXFxuTWF5IG5lZWQgdG8gYWRkL2FsbG93IHBhdGgsIGVnLiBjOi9zbTIvIG9yIC91c2Vycy9tZS9zbTIvJyxcclxuICAgIHdhaXRGb2N1czogc21jICsgJ1NwZWNpYWwgY2FzZTogV2FpdGluZyBmb3IgU1dGIHRvIGxvYWQgd2l0aCB3aW5kb3cgZm9jdXMuLi4nLFxyXG4gICAgd2FpdEZvcmV2ZXI6IHNtYyArICdXYWl0aW5nIGluZGVmaW5pdGVseSBmb3IgRmxhc2ggKHdpbGwgcmVjb3ZlciBpZiB1bmJsb2NrZWQpLi4uJyxcclxuICAgIHdhaXRTV0Y6IHNtYyArICdXYWl0aW5nIGZvciAxMDAlIFNXRiBsb2FkLi4uJyxcclxuICAgIG5lZWRGdW5jdGlvbjogc21jICsgJ0Z1bmN0aW9uIG9iamVjdCBleHBlY3RlZCBmb3IgJXMnLFxyXG4gICAgYmFkSUQ6ICdTb3VuZCBJRCBcIiVzXCIgc2hvdWxkIGJlIGEgc3RyaW5nLCBzdGFydGluZyB3aXRoIGEgbm9uLW51bWVyaWMgY2hhcmFjdGVyJyxcclxuICAgIGN1cnJlbnRPYmo6IHNtYyArICdfZGVidWcoKTogQ3VycmVudCBzb3VuZCBvYmplY3RzJyxcclxuICAgIHdhaXRPbmxvYWQ6IHNtYyArICdXYWl0aW5nIGZvciB3aW5kb3cub25sb2FkKCknLFxyXG4gICAgZG9jTG9hZGVkOiBzbWMgKyAnRG9jdW1lbnQgYWxyZWFkeSBsb2FkZWQnLFxyXG4gICAgb25sb2FkOiBzbWMgKyAnaW5pdENvbXBsZXRlKCk6IGNhbGxpbmcgc291bmRNYW5hZ2VyLm9ubG9hZCgpJyxcclxuICAgIG9ubG9hZE9LOiBzbSArICcub25sb2FkKCkgY29tcGxldGUnLFxyXG4gICAgZGlkSW5pdDogc21jICsgJ2luaXQoKTogQWxyZWFkeSBjYWxsZWQ/JyxcclxuICAgIHNlY05vdGU6ICdGbGFzaCBzZWN1cml0eSBub3RlOiBOZXR3b3JrL2ludGVybmV0IFVSTHMgd2lsbCBub3QgbG9hZCBkdWUgdG8gc2VjdXJpdHkgcmVzdHJpY3Rpb25zLiBBY2Nlc3MgY2FuIGJlIGNvbmZpZ3VyZWQgdmlhIEZsYXNoIFBsYXllciBHbG9iYWwgU2VjdXJpdHkgU2V0dGluZ3MgUGFnZTogaHR0cDovL3d3dy5tYWNyb21lZGlhLmNvbS9zdXBwb3J0L2RvY3VtZW50YXRpb24vZW4vZmxhc2hwbGF5ZXIvaGVscC9zZXR0aW5nc19tYW5hZ2VyMDQuaHRtbCcsXHJcbiAgICBiYWRSZW1vdmU6IHNtYyArICdGYWlsZWQgdG8gcmVtb3ZlIEZsYXNoIG5vZGUuJyxcclxuICAgIHNodXRkb3duOiBzbSArICcuZGlzYWJsZSgpOiBTaHV0dGluZyBkb3duJyxcclxuICAgIHF1ZXVlOiBzbWMgKyAnUXVldWVpbmcgJXMgaGFuZGxlcicsXHJcbiAgICBzbUVycm9yOiAnU01Tb3VuZC5sb2FkKCk6IEV4Y2VwdGlvbjogSlMtRmxhc2ggY29tbXVuaWNhdGlvbiBmYWlsZWQsIG9yIEpTIGVycm9yLicsXHJcbiAgICBmYlRpbWVvdXQ6ICdObyBmbGFzaCByZXNwb25zZSwgYXBwbHlpbmcgLicrc3dmQ1NTLnN3ZlRpbWVkb3V0KycgQ1NTLi4uJyxcclxuICAgIGZiTG9hZGVkOiAnRmxhc2ggbG9hZGVkJyxcclxuICAgIGZiSGFuZGxlcjogc21jICsgJ2ZsYXNoQmxvY2tIYW5kbGVyKCknLFxyXG4gICAgbWFuVVJMOiAnU01Tb3VuZC5sb2FkKCk6IFVzaW5nIG1hbnVhbGx5LWFzc2lnbmVkIFVSTCcsXHJcbiAgICBvblVSTDogc20gKyAnLmxvYWQoKTogY3VycmVudCBVUkwgYWxyZWFkeSBhc3NpZ25lZC4nLFxyXG4gICAgYmFkRlY6IHNtICsgJy5mbGFzaFZlcnNpb24gbXVzdCBiZSA4IG9yIDkuIFwiJXNcIiBpcyBpbnZhbGlkLiBSZXZlcnRpbmcgdG8gJXMuJyxcclxuICAgIGFzMmxvb3A6ICdOb3RlOiBTZXR0aW5nIHN0cmVhbTpmYWxzZSBzbyBsb29waW5nIGNhbiB3b3JrIChmbGFzaCA4IGxpbWl0YXRpb24pJyxcclxuICAgIG5vTlNMb29wOiAnTm90ZTogTG9vcGluZyBub3QgaW1wbGVtZW50ZWQgZm9yIE1vdmllU3RhciBmb3JtYXRzJyxcclxuICAgIG5lZWRmbDk6ICdOb3RlOiBTd2l0Y2hpbmcgdG8gZmxhc2ggOSwgcmVxdWlyZWQgZm9yIE1QNCBmb3JtYXRzLicsXHJcbiAgICBtZlRpbWVvdXQ6ICdTZXR0aW5nIGZsYXNoTG9hZFRpbWVvdXQgPSAwIChpbmZpbml0ZSkgZm9yIG9mZi1zY3JlZW4sIG1vYmlsZSBmbGFzaCBjYXNlJyxcclxuICAgIG5lZWRGbGFzaDogc21jICsgJ0ZhdGFsIGVycm9yOiBGbGFzaCBpcyBuZWVkZWQgdG8gcGxheSBzb21lIHJlcXVpcmVkIGZvcm1hdHMsIGJ1dCBpcyBub3QgYXZhaWxhYmxlLicsXHJcbiAgICBnb3RGb2N1czogc21jICsgJ0dvdCB3aW5kb3cgZm9jdXMuJyxcclxuICAgIHBvbGljeTogJ0VuYWJsaW5nIHVzZVBvbGljeUZpbGUgZm9yIGRhdGEgYWNjZXNzJyxcclxuICAgIHNldHVwOiBzbSArICcuc2V0dXAoKTogYWxsb3dlZCBwYXJhbWV0ZXJzOiAlcycsXHJcbiAgICBzZXR1cEVycm9yOiBzbSArICcuc2V0dXAoKTogXCIlc1wiIGNhbm5vdCBiZSBhc3NpZ25lZCB3aXRoIHRoaXMgbWV0aG9kLicsXHJcbiAgICBzZXR1cFVuZGVmOiBzbSArICcuc2V0dXAoKTogQ291bGQgbm90IGZpbmQgb3B0aW9uIFwiJXNcIicsXHJcbiAgICBzZXR1cExhdGU6IHNtICsgJy5zZXR1cCgpOiB1cmwsIGZsYXNoVmVyc2lvbiBhbmQgaHRtbDVUZXN0IHByb3BlcnR5IGNoYW5nZXMgd2lsbCBub3QgdGFrZSBlZmZlY3QgdW50aWwgcmVib290KCkuJyxcclxuICAgIG5vVVJMOiBzbWMgKyAnRmxhc2ggVVJMIHJlcXVpcmVkLiBDYWxsIHNvdW5kTWFuYWdlci5zZXR1cCh7dXJsOi4uLn0pIHRvIGdldCBzdGFydGVkLicsXHJcbiAgICBzbTJMb2FkZWQ6ICdTb3VuZE1hbmFnZXIgMjogUmVhZHkuICcgKyBTdHJpbmcuZnJvbUNoYXJDb2RlKDEwMDAzKSxcclxuICAgIHJlc2V0OiBzbSArICcucmVzZXQoKTogUmVtb3ZpbmcgZXZlbnQgY2FsbGJhY2tzJyxcclxuICAgIG1vYmlsZVVBOiAnTW9iaWxlIFVBIGRldGVjdGVkLCBwcmVmZXJyaW5nIEhUTUw1IGJ5IGRlZmF1bHQuJyxcclxuICAgIGdsb2JhbEhUTUw1OiAnVXNpbmcgc2luZ2xldG9uIEhUTUw1IEF1ZGlvKCkgcGF0dGVybiBmb3IgdGhpcyBkZXZpY2UuJ1xyXG4gICAgLy8gPC9kPlxyXG5cclxuICB9O1xyXG5cclxuICBzdHIgPSBmdW5jdGlvbigpIHtcclxuXHJcbiAgICAvLyBpbnRlcm5hbCBzdHJpbmcgcmVwbGFjZSBoZWxwZXIuXHJcbiAgICAvLyBhcmd1bWVudHM6IG8gWyxpdGVtcyB0byByZXBsYWNlXVxyXG4gICAgLy8gPGQ+XHJcblxyXG4gICAgdmFyIGFyZ3MsXHJcbiAgICAgICAgaSwgaiwgbyxcclxuICAgICAgICBzc3RyO1xyXG5cclxuICAgIC8vIHJlYWwgYXJyYXksIHBsZWFzZVxyXG4gICAgYXJncyA9IHNsaWNlLmNhbGwoYXJndW1lbnRzKTtcclxuXHJcbiAgICAvLyBmaXJzdCBhcmd1bWVudFxyXG4gICAgbyA9IGFyZ3Muc2hpZnQoKTtcclxuXHJcbiAgICBzc3RyID0gKHN0cmluZ3MgJiYgc3RyaW5nc1tvXSA/IHN0cmluZ3Nbb10gOiAnJyk7XHJcblxyXG4gICAgaWYgKHNzdHIgJiYgYXJncyAmJiBhcmdzLmxlbmd0aCkge1xyXG4gICAgICBmb3IgKGkgPSAwLCBqID0gYXJncy5sZW5ndGg7IGkgPCBqOyBpKyspIHtcclxuICAgICAgICBzc3RyID0gc3N0ci5yZXBsYWNlKCclcycsIGFyZ3NbaV0pO1xyXG4gICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgcmV0dXJuIHNzdHI7XHJcbiAgICAvLyA8L2Q+XHJcblxyXG4gIH07XHJcblxyXG4gIGxvb3BGaXggPSBmdW5jdGlvbihzT3B0KSB7XHJcblxyXG4gICAgLy8gZmxhc2ggOCByZXF1aXJlcyBzdHJlYW0gPSBmYWxzZSBmb3IgbG9vcGluZyB0byB3b3JrXHJcbiAgICBpZiAoZlYgPT09IDggJiYgc09wdC5sb29wcyA+IDEgJiYgc09wdC5zdHJlYW0pIHtcclxuICAgICAgX3dEUygnYXMybG9vcCcpO1xyXG4gICAgICBzT3B0LnN0cmVhbSA9IGZhbHNlO1xyXG4gICAgfVxyXG5cclxuICAgIHJldHVybiBzT3B0O1xyXG5cclxuICB9O1xyXG5cclxuICBwb2xpY3lGaXggPSBmdW5jdGlvbihzT3B0LCBzUHJlKSB7XHJcblxyXG4gICAgaWYgKHNPcHQgJiYgIXNPcHQudXNlUG9saWN5RmlsZSAmJiAoc09wdC5vbmlkMyB8fCBzT3B0LnVzZVBlYWtEYXRhIHx8IHNPcHQudXNlV2F2ZWZvcm1EYXRhIHx8IHNPcHQudXNlRVFEYXRhKSkge1xyXG4gICAgICBzbTIuX3dEKChzUHJlIHx8ICcnKSArIHN0cigncG9saWN5JykpO1xyXG4gICAgICBzT3B0LnVzZVBvbGljeUZpbGUgPSB0cnVlO1xyXG4gICAgfVxyXG5cclxuICAgIHJldHVybiBzT3B0O1xyXG5cclxuICB9O1xyXG5cclxuICBjb21wbGFpbiA9IGZ1bmN0aW9uKHNNc2cpIHtcclxuXHJcbiAgICAvLyA8ZD5cclxuICAgIGlmIChoYXNDb25zb2xlICYmIGNvbnNvbGUud2FybiAhPT0gX3VuZGVmaW5lZCkge1xyXG4gICAgICBjb25zb2xlLndhcm4oc01zZyk7XHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICBzbTIuX3dEKHNNc2cpO1xyXG4gICAgfVxyXG4gICAgLy8gPC9kPlxyXG5cclxuICB9O1xyXG5cclxuICBkb05vdGhpbmcgPSBmdW5jdGlvbigpIHtcclxuXHJcbiAgICByZXR1cm4gZmFsc2U7XHJcblxyXG4gIH07XHJcblxyXG4gIGRpc2FibGVPYmplY3QgPSBmdW5jdGlvbihvKSB7XHJcblxyXG4gICAgdmFyIG9Qcm9wO1xyXG5cclxuICAgIGZvciAob1Byb3AgaW4gbykge1xyXG4gICAgICBpZiAoby5oYXNPd25Qcm9wZXJ0eShvUHJvcCkgJiYgdHlwZW9mIG9bb1Byb3BdID09PSAnZnVuY3Rpb24nKSB7XHJcbiAgICAgICAgb1tvUHJvcF0gPSBkb05vdGhpbmc7XHJcbiAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBvUHJvcCA9IG51bGw7XHJcblxyXG4gIH07XHJcblxyXG4gIGZhaWxTYWZlbHkgPSBmdW5jdGlvbihiTm9EaXNhYmxlKSB7XHJcblxyXG4gICAgLy8gZ2VuZXJhbCBmYWlsdXJlIGV4Y2VwdGlvbiBoYW5kbGVyXHJcblxyXG4gICAgaWYgKGJOb0Rpc2FibGUgPT09IF91bmRlZmluZWQpIHtcclxuICAgICAgYk5vRGlzYWJsZSA9IGZhbHNlO1xyXG4gICAgfVxyXG5cclxuICAgIGlmIChkaXNhYmxlZCB8fCBiTm9EaXNhYmxlKSB7XHJcbiAgICAgIHNtMi5kaXNhYmxlKGJOb0Rpc2FibGUpO1xyXG4gICAgfVxyXG5cclxuICB9O1xyXG5cclxuICBub3JtYWxpemVNb3ZpZVVSTCA9IGZ1bmN0aW9uKHNtVVJMKSB7XHJcblxyXG4gICAgdmFyIHVybFBhcmFtcyA9IG51bGwsIHVybDtcclxuXHJcbiAgICBpZiAoc21VUkwpIHtcclxuICAgICAgaWYgKHNtVVJMLm1hdGNoKC9cXC5zd2YoXFw/LiopPyQvaSkpIHtcclxuICAgICAgICB1cmxQYXJhbXMgPSBzbVVSTC5zdWJzdHIoc21VUkwudG9Mb3dlckNhc2UoKS5sYXN0SW5kZXhPZignLnN3Zj8nKSArIDQpO1xyXG4gICAgICAgIGlmICh1cmxQYXJhbXMpIHtcclxuICAgICAgICAgIC8vIGFzc3VtZSB1c2VyIGtub3dzIHdoYXQgdGhleSdyZSBkb2luZ1xyXG4gICAgICAgICAgcmV0dXJuIHNtVVJMO1xyXG4gICAgICAgIH1cclxuICAgICAgfSBlbHNlIGlmIChzbVVSTC5sYXN0SW5kZXhPZignLycpICE9PSBzbVVSTC5sZW5ndGggLSAxKSB7XHJcbiAgICAgICAgLy8gYXBwZW5kIHRyYWlsaW5nIHNsYXNoLCBpZiBuZWVkZWRcclxuICAgICAgICBzbVVSTCArPSAnLyc7XHJcbiAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICB1cmwgPSAoc21VUkwgJiYgc21VUkwubGFzdEluZGV4T2YoJy8nKSAhPT0gLSAxID8gc21VUkwuc3Vic3RyKDAsIHNtVVJMLmxhc3RJbmRleE9mKCcvJykgKyAxKSA6ICcuLycpICsgc20yLm1vdmllVVJMO1xyXG5cclxuICAgIGlmIChzbTIubm9TV0ZDYWNoZSkge1xyXG4gICAgICB1cmwgKz0gKCc/dHM9JyArIG5ldyBEYXRlKCkuZ2V0VGltZSgpKTtcclxuICAgIH1cclxuXHJcbiAgICByZXR1cm4gdXJsO1xyXG5cclxuICB9O1xyXG5cclxuICBzZXRWZXJzaW9uSW5mbyA9IGZ1bmN0aW9uKCkge1xyXG5cclxuICAgIC8vIHNob3J0LWhhbmQgZm9yIGludGVybmFsIHVzZVxyXG5cclxuICAgIGZWID0gcGFyc2VJbnQoc20yLmZsYXNoVmVyc2lvbiwgMTApO1xyXG5cclxuICAgIGlmIChmViAhPT0gOCAmJiBmViAhPT0gOSkge1xyXG4gICAgICBzbTIuX3dEKHN0cignYmFkRlYnLCBmViwgZGVmYXVsdEZsYXNoVmVyc2lvbikpO1xyXG4gICAgICBzbTIuZmxhc2hWZXJzaW9uID0gZlYgPSBkZWZhdWx0Rmxhc2hWZXJzaW9uO1xyXG4gICAgfVxyXG5cclxuICAgIC8vIGRlYnVnIGZsYXNoIG1vdmllLCBpZiBhcHBsaWNhYmxlXHJcblxyXG4gICAgdmFyIGlzRGVidWcgPSAoc20yLmRlYnVnTW9kZSB8fCBzbTIuZGVidWdGbGFzaD8nX2RlYnVnLnN3Zic6Jy5zd2YnKTtcclxuXHJcbiAgICBpZiAoc20yLnVzZUhUTUw1QXVkaW8gJiYgIXNtMi5odG1sNU9ubHkgJiYgc20yLmF1ZGlvRm9ybWF0cy5tcDQucmVxdWlyZWQgJiYgZlYgPCA5KSB7XHJcbiAgICAgIHNtMi5fd0Qoc3RyKCduZWVkZmw5JykpO1xyXG4gICAgICBzbTIuZmxhc2hWZXJzaW9uID0gZlYgPSA5O1xyXG4gICAgfVxyXG5cclxuICAgIHNtMi52ZXJzaW9uID0gc20yLnZlcnNpb25OdW1iZXIgKyAoc20yLmh0bWw1T25seT8nIChIVE1MNS1vbmx5IG1vZGUpJzooZlYgPT09IDk/JyAoQVMzL0ZsYXNoIDkpJzonIChBUzIvRmxhc2ggOCknKSk7XHJcblxyXG4gICAgLy8gc2V0IHVwIGRlZmF1bHQgb3B0aW9uc1xyXG4gICAgaWYgKGZWID4gOCkge1xyXG4gICAgICAvLyArZmxhc2ggOSBiYXNlIG9wdGlvbnNcclxuICAgICAgc20yLmRlZmF1bHRPcHRpb25zID0gbWl4aW4oc20yLmRlZmF1bHRPcHRpb25zLCBzbTIuZmxhc2g5T3B0aW9ucyk7XHJcbiAgICAgIHNtMi5mZWF0dXJlcy5idWZmZXJpbmcgPSB0cnVlO1xyXG4gICAgICAvLyArbW92aWVzdGFyIHN1cHBvcnRcclxuICAgICAgc20yLmRlZmF1bHRPcHRpb25zID0gbWl4aW4oc20yLmRlZmF1bHRPcHRpb25zLCBzbTIubW92aWVTdGFyT3B0aW9ucyk7XHJcbiAgICAgIHNtMi5maWxlUGF0dGVybnMuZmxhc2g5ID0gbmV3IFJlZ0V4cCgnXFxcXC4obXAzfCcgKyBuZXRTdHJlYW1UeXBlcy5qb2luKCd8JykgKyAnKShcXFxcPy4qKT8kJywgJ2knKTtcclxuICAgICAgc20yLmZlYXR1cmVzLm1vdmllU3RhciA9IHRydWU7XHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICBzbTIuZmVhdHVyZXMubW92aWVTdGFyID0gZmFsc2U7XHJcbiAgICB9XHJcblxyXG4gICAgLy8gcmVnRXhwIGZvciBmbGFzaCBjYW5QbGF5KCksIGV0Yy5cclxuICAgIHNtMi5maWxlUGF0dGVybiA9IHNtMi5maWxlUGF0dGVybnNbKGZWICE9PSA4PydmbGFzaDknOidmbGFzaDgnKV07XHJcblxyXG4gICAgLy8gaWYgYXBwbGljYWJsZSwgdXNlIF9kZWJ1ZyB2ZXJzaW9ucyBvZiBTV0ZzXHJcbiAgICBzbTIubW92aWVVUkwgPSAoZlYgPT09IDg/J3NvdW5kbWFuYWdlcjIuc3dmJzonc291bmRtYW5hZ2VyMl9mbGFzaDkuc3dmJykucmVwbGFjZSgnLnN3ZicsIGlzRGVidWcpO1xyXG5cclxuICAgIHNtMi5mZWF0dXJlcy5wZWFrRGF0YSA9IHNtMi5mZWF0dXJlcy53YXZlZm9ybURhdGEgPSBzbTIuZmVhdHVyZXMuZXFEYXRhID0gKGZWID4gOCk7XHJcblxyXG4gIH07XHJcblxyXG4gIHNldFBvbGxpbmcgPSBmdW5jdGlvbihiUG9sbGluZywgYkhpZ2hQZXJmb3JtYW5jZSkge1xyXG5cclxuICAgIGlmICghZmxhc2gpIHtcclxuICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgfVxyXG5cclxuICAgIGZsYXNoLl9zZXRQb2xsaW5nKGJQb2xsaW5nLCBiSGlnaFBlcmZvcm1hbmNlKTtcclxuXHJcbiAgfTtcclxuXHJcbiAgaW5pdERlYnVnID0gZnVuY3Rpb24oKSB7XHJcblxyXG4gICAgLy8gc3RhcnRzIGRlYnVnIG1vZGUsIGNyZWF0aW5nIG91dHB1dCA8ZGl2PiBmb3IgVUFzIHdpdGhvdXQgY29uc29sZSBvYmplY3RcclxuXHJcbiAgICAvLyBhbGxvdyBmb3JjZSBvZiBkZWJ1ZyBtb2RlIHZpYSBVUkxcclxuICAgIC8vIDxkPlxyXG4gICAgaWYgKHNtMi5kZWJ1Z1VSTFBhcmFtLnRlc3Qod2wpKSB7XHJcbiAgICAgIHNtMi5kZWJ1Z01vZGUgPSB0cnVlO1xyXG4gICAgfVxyXG5cclxuICAgIGlmIChpZChzbTIuZGVidWdJRCkpIHtcclxuICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgfVxyXG5cclxuICAgIHZhciBvRCwgb0RlYnVnLCBvVGFyZ2V0LCBvVG9nZ2xlLCB0bXA7XHJcblxyXG4gICAgaWYgKHNtMi5kZWJ1Z01vZGUgJiYgIWlkKHNtMi5kZWJ1Z0lEKSAmJiAoIWhhc0NvbnNvbGUgfHwgIXNtMi51c2VDb25zb2xlIHx8ICFzbTIuY29uc29sZU9ubHkpKSB7XHJcblxyXG4gICAgICBvRCA9IGRvYy5jcmVhdGVFbGVtZW50KCdkaXYnKTtcclxuICAgICAgb0QuaWQgPSBzbTIuZGVidWdJRCArICctdG9nZ2xlJztcclxuXHJcbiAgICAgIG9Ub2dnbGUgPSB7XHJcbiAgICAgICAgJ3Bvc2l0aW9uJzogJ2ZpeGVkJyxcclxuICAgICAgICAnYm90dG9tJzogJzBweCcsXHJcbiAgICAgICAgJ3JpZ2h0JzogJzBweCcsXHJcbiAgICAgICAgJ3dpZHRoJzogJzEuMmVtJyxcclxuICAgICAgICAnaGVpZ2h0JzogJzEuMmVtJyxcclxuICAgICAgICAnbGluZUhlaWdodCc6ICcxLjJlbScsXHJcbiAgICAgICAgJ21hcmdpbic6ICcycHgnLFxyXG4gICAgICAgICd0ZXh0QWxpZ24nOiAnY2VudGVyJyxcclxuICAgICAgICAnYm9yZGVyJzogJzFweCBzb2xpZCAjOTk5JyxcclxuICAgICAgICAnY3Vyc29yJzogJ3BvaW50ZXInLFxyXG4gICAgICAgICdiYWNrZ3JvdW5kJzogJyNmZmYnLFxyXG4gICAgICAgICdjb2xvcic6ICcjMzMzJyxcclxuICAgICAgICAnekluZGV4JzogMTAwMDFcclxuICAgICAgfTtcclxuXHJcbiAgICAgIG9ELmFwcGVuZENoaWxkKGRvYy5jcmVhdGVUZXh0Tm9kZSgnLScpKTtcclxuICAgICAgb0Qub25jbGljayA9IHRvZ2dsZURlYnVnO1xyXG4gICAgICBvRC50aXRsZSA9ICdUb2dnbGUgU00yIGRlYnVnIGNvbnNvbGUnO1xyXG5cclxuICAgICAgaWYgKHVhLm1hdGNoKC9tc2llIDYvaSkpIHtcclxuICAgICAgICBvRC5zdHlsZS5wb3NpdGlvbiA9ICdhYnNvbHV0ZSc7XHJcbiAgICAgICAgb0Quc3R5bGUuY3Vyc29yID0gJ2hhbmQnO1xyXG4gICAgICB9XHJcblxyXG4gICAgICBmb3IgKHRtcCBpbiBvVG9nZ2xlKSB7XHJcbiAgICAgICAgaWYgKG9Ub2dnbGUuaGFzT3duUHJvcGVydHkodG1wKSkge1xyXG4gICAgICAgICAgb0Quc3R5bGVbdG1wXSA9IG9Ub2dnbGVbdG1wXTtcclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIG9EZWJ1ZyA9IGRvYy5jcmVhdGVFbGVtZW50KCdkaXYnKTtcclxuICAgICAgb0RlYnVnLmlkID0gc20yLmRlYnVnSUQ7XHJcbiAgICAgIG9EZWJ1Zy5zdHlsZS5kaXNwbGF5ID0gKHNtMi5kZWJ1Z01vZGU/J2Jsb2NrJzonbm9uZScpO1xyXG5cclxuICAgICAgaWYgKHNtMi5kZWJ1Z01vZGUgJiYgIWlkKG9ELmlkKSkge1xyXG4gICAgICAgIHRyeSB7XHJcbiAgICAgICAgICBvVGFyZ2V0ID0gZ2V0RG9jdW1lbnQoKTtcclxuICAgICAgICAgIG9UYXJnZXQuYXBwZW5kQ2hpbGQob0QpO1xyXG4gICAgICAgIH0gY2F0Y2goZTIpIHtcclxuICAgICAgICAgIHRocm93IG5ldyBFcnJvcihzdHIoJ2RvbUVycm9yJykrJyBcXG4nK2UyLnRvU3RyaW5nKCkpO1xyXG4gICAgICAgIH1cclxuICAgICAgICBvVGFyZ2V0LmFwcGVuZENoaWxkKG9EZWJ1Zyk7XHJcbiAgICAgIH1cclxuXHJcbiAgICB9XHJcblxyXG4gICAgb1RhcmdldCA9IG51bGw7XHJcbiAgICAvLyA8L2Q+XHJcblxyXG4gIH07XHJcblxyXG4gIGlkQ2hlY2sgPSB0aGlzLmdldFNvdW5kQnlJZDtcclxuXHJcbiAgLy8gPGQ+XHJcbiAgX3dEUyA9IGZ1bmN0aW9uKG8sIGVycm9yTGV2ZWwpIHtcclxuXHJcbiAgICByZXR1cm4gKCFvID8gJycgOiBzbTIuX3dEKHN0cihvKSwgZXJyb3JMZXZlbCkpO1xyXG5cclxuICB9O1xyXG5cclxuICB0b2dnbGVEZWJ1ZyA9IGZ1bmN0aW9uKCkge1xyXG5cclxuICAgIHZhciBvID0gaWQoc20yLmRlYnVnSUQpLFxyXG4gICAgb1QgPSBpZChzbTIuZGVidWdJRCArICctdG9nZ2xlJyk7XHJcblxyXG4gICAgaWYgKCFvKSB7XHJcbiAgICAgIHJldHVybiBmYWxzZTtcclxuICAgIH1cclxuXHJcbiAgICBpZiAoZGVidWdPcGVuKSB7XHJcbiAgICAgIC8vIG1pbmltaXplXHJcbiAgICAgIG9ULmlubmVySFRNTCA9ICcrJztcclxuICAgICAgby5zdHlsZS5kaXNwbGF5ID0gJ25vbmUnO1xyXG4gICAgfSBlbHNlIHtcclxuICAgICAgb1QuaW5uZXJIVE1MID0gJy0nO1xyXG4gICAgICBvLnN0eWxlLmRpc3BsYXkgPSAnYmxvY2snO1xyXG4gICAgfVxyXG5cclxuICAgIGRlYnVnT3BlbiA9ICFkZWJ1Z09wZW47XHJcblxyXG4gIH07XHJcblxyXG4gIGRlYnVnVFMgPSBmdW5jdGlvbihzRXZlbnRUeXBlLCBiU3VjY2Vzcywgc01lc3NhZ2UpIHtcclxuXHJcbiAgICAvLyB0cm91Ymxlc2hvb3RlciBkZWJ1ZyBob29rc1xyXG5cclxuICAgIGlmICh3aW5kb3cuc20yRGVidWdnZXIgIT09IF91bmRlZmluZWQpIHtcclxuICAgICAgdHJ5IHtcclxuICAgICAgICBzbTJEZWJ1Z2dlci5oYW5kbGVFdmVudChzRXZlbnRUeXBlLCBiU3VjY2Vzcywgc01lc3NhZ2UpO1xyXG4gICAgICB9IGNhdGNoKGUpIHtcclxuICAgICAgICAvLyBvaCB3ZWxsXHJcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgcmV0dXJuIHRydWU7XHJcblxyXG4gIH07XHJcbiAgLy8gPC9kPlxyXG5cclxuICBnZXRTV0ZDU1MgPSBmdW5jdGlvbigpIHtcclxuXHJcbiAgICB2YXIgY3NzID0gW107XHJcblxyXG4gICAgaWYgKHNtMi5kZWJ1Z01vZGUpIHtcclxuICAgICAgY3NzLnB1c2goc3dmQ1NTLnNtMkRlYnVnKTtcclxuICAgIH1cclxuXHJcbiAgICBpZiAoc20yLmRlYnVnRmxhc2gpIHtcclxuICAgICAgY3NzLnB1c2goc3dmQ1NTLmZsYXNoRGVidWcpO1xyXG4gICAgfVxyXG5cclxuICAgIGlmIChzbTIudXNlSGlnaFBlcmZvcm1hbmNlKSB7XHJcbiAgICAgIGNzcy5wdXNoKHN3ZkNTUy5oaWdoUGVyZik7XHJcbiAgICB9XHJcblxyXG4gICAgcmV0dXJuIGNzcy5qb2luKCcgJyk7XHJcblxyXG4gIH07XHJcblxyXG4gIGZsYXNoQmxvY2tIYW5kbGVyID0gZnVuY3Rpb24oKSB7XHJcblxyXG4gICAgLy8gKnBvc3NpYmxlKiBmbGFzaCBibG9jayBzaXR1YXRpb24uXHJcblxyXG4gICAgdmFyIG5hbWUgPSBzdHIoJ2ZiSGFuZGxlcicpLFxyXG4gICAgICAgIHAgPSBzbTIuZ2V0TW92aWVQZXJjZW50KCksXHJcbiAgICAgICAgY3NzID0gc3dmQ1NTLFxyXG4gICAgICAgIGVycm9yID0ge3R5cGU6J0ZMQVNIQkxPQ0snfTtcclxuXHJcbiAgICBpZiAoc20yLmh0bWw1T25seSkge1xyXG4gICAgICAvLyBubyBmbGFzaCwgb3IgdW51c2VkXHJcbiAgICAgIHJldHVybiBmYWxzZTtcclxuICAgIH1cclxuXHJcbiAgICBpZiAoIXNtMi5vaygpKSB7XHJcblxyXG4gICAgICBpZiAobmVlZHNGbGFzaCkge1xyXG4gICAgICAgIC8vIG1ha2UgdGhlIG1vdmllIG1vcmUgdmlzaWJsZSwgc28gdXNlciBjYW4gZml4XHJcbiAgICAgICAgc20yLm9NQy5jbGFzc05hbWUgPSBnZXRTV0ZDU1MoKSArICcgJyArIGNzcy5zd2ZEZWZhdWx0ICsgJyAnICsgKHAgPT09IG51bGw/Y3NzLnN3ZlRpbWVkb3V0OmNzcy5zd2ZFcnJvcik7XHJcbiAgICAgICAgc20yLl93RChuYW1lICsgJzogJyArIHN0cignZmJUaW1lb3V0JykgKyAocCA/ICcgKCcgKyBzdHIoJ2ZiTG9hZGVkJykgKyAnKScgOiAnJykpO1xyXG4gICAgICB9XHJcblxyXG4gICAgICBzbTIuZGlkRmxhc2hCbG9jayA9IHRydWU7XHJcblxyXG4gICAgICAvLyBmaXJlIG9ucmVhZHkoKSwgY29tcGxhaW4gbGlnaHRseVxyXG4gICAgICBwcm9jZXNzT25FdmVudHMoe3R5cGU6J29udGltZW91dCcsIGlnbm9yZUluaXQ6dHJ1ZSwgZXJyb3I6ZXJyb3J9KTtcclxuICAgICAgY2F0Y2hFcnJvcihlcnJvcik7XHJcblxyXG4gICAgfSBlbHNlIHtcclxuXHJcbiAgICAgIC8vIFNNMiBsb2FkZWQgT0sgKG9yIHJlY292ZXJlZClcclxuXHJcbiAgICAgIC8vIDxkPlxyXG4gICAgICBpZiAoc20yLmRpZEZsYXNoQmxvY2spIHtcclxuICAgICAgICBzbTIuX3dEKG5hbWUgKyAnOiBVbmJsb2NrZWQnKTtcclxuICAgICAgfVxyXG4gICAgICAvLyA8L2Q+XHJcblxyXG4gICAgICBpZiAoc20yLm9NQykge1xyXG4gICAgICAgIHNtMi5vTUMuY2xhc3NOYW1lID0gW2dldFNXRkNTUygpLCBjc3Muc3dmRGVmYXVsdCwgY3NzLnN3ZkxvYWRlZCArIChzbTIuZGlkRmxhc2hCbG9jaz8nICcrY3NzLnN3ZlVuYmxvY2tlZDonJyldLmpvaW4oJyAnKTtcclxuICAgICAgfVxyXG5cclxuICAgIH1cclxuXHJcbiAgfTtcclxuXHJcbiAgYWRkT25FdmVudCA9IGZ1bmN0aW9uKHNUeXBlLCBvTWV0aG9kLCBvU2NvcGUpIHtcclxuXHJcbiAgICBpZiAob25fcXVldWVbc1R5cGVdID09PSBfdW5kZWZpbmVkKSB7XHJcbiAgICAgIG9uX3F1ZXVlW3NUeXBlXSA9IFtdO1xyXG4gICAgfVxyXG5cclxuICAgIG9uX3F1ZXVlW3NUeXBlXS5wdXNoKHtcclxuICAgICAgJ21ldGhvZCc6IG9NZXRob2QsXHJcbiAgICAgICdzY29wZSc6IChvU2NvcGUgfHwgbnVsbCksXHJcbiAgICAgICdmaXJlZCc6IGZhbHNlXHJcbiAgICB9KTtcclxuXHJcbiAgfTtcclxuXHJcbiAgcHJvY2Vzc09uRXZlbnRzID0gZnVuY3Rpb24ob09wdGlvbnMpIHtcclxuXHJcbiAgICAvLyBpZiB1bnNwZWNpZmllZCwgYXNzdW1lIE9LL2Vycm9yXHJcblxyXG4gICAgaWYgKCFvT3B0aW9ucykge1xyXG4gICAgICBvT3B0aW9ucyA9IHtcclxuICAgICAgICB0eXBlOiAoc20yLm9rKCkgPyAnb25yZWFkeScgOiAnb250aW1lb3V0JylcclxuICAgICAgfTtcclxuICAgIH1cclxuXHJcbiAgICBpZiAoIWRpZEluaXQgJiYgb09wdGlvbnMgJiYgIW9PcHRpb25zLmlnbm9yZUluaXQpIHtcclxuICAgICAgLy8gbm90IHJlYWR5IHlldC5cclxuICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgfVxyXG5cclxuICAgIGlmIChvT3B0aW9ucy50eXBlID09PSAnb250aW1lb3V0JyAmJiAoc20yLm9rKCkgfHwgKGRpc2FibGVkICYmICFvT3B0aW9ucy5pZ25vcmVJbml0KSkpIHtcclxuICAgICAgLy8gaW52YWxpZCBjYXNlXHJcbiAgICAgIHJldHVybiBmYWxzZTtcclxuICAgIH1cclxuXHJcbiAgICB2YXIgc3RhdHVzID0ge1xyXG4gICAgICAgICAgc3VjY2VzczogKG9PcHRpb25zICYmIG9PcHRpb25zLmlnbm9yZUluaXQ/c20yLm9rKCk6IWRpc2FibGVkKVxyXG4gICAgICAgIH0sXHJcblxyXG4gICAgICAgIC8vIHF1ZXVlIHNwZWNpZmllZCBieSB0eXBlLCBvciBub25lXHJcbiAgICAgICAgc3JjUXVldWUgPSAob09wdGlvbnMgJiYgb09wdGlvbnMudHlwZT9vbl9xdWV1ZVtvT3B0aW9ucy50eXBlXXx8W106W10pLFxyXG5cclxuICAgICAgICBxdWV1ZSA9IFtdLCBpLCBqLFxyXG4gICAgICAgIGFyZ3MgPSBbc3RhdHVzXSxcclxuICAgICAgICBjYW5SZXRyeSA9IChuZWVkc0ZsYXNoICYmICFzbTIub2soKSk7XHJcblxyXG4gICAgaWYgKG9PcHRpb25zLmVycm9yKSB7XHJcbiAgICAgIGFyZ3NbMF0uZXJyb3IgPSBvT3B0aW9ucy5lcnJvcjtcclxuICAgIH1cclxuXHJcbiAgICBmb3IgKGkgPSAwLCBqID0gc3JjUXVldWUubGVuZ3RoOyBpIDwgajsgaSsrKSB7XHJcbiAgICAgIGlmIChzcmNRdWV1ZVtpXS5maXJlZCAhPT0gdHJ1ZSkge1xyXG4gICAgICAgIHF1ZXVlLnB1c2goc3JjUXVldWVbaV0pO1xyXG4gICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgaWYgKHF1ZXVlLmxlbmd0aCkge1xyXG4gICAgICAvLyBzbTIuX3dEKHNtICsgJzogRmlyaW5nICcgKyBxdWV1ZS5sZW5ndGggKyAnICcgKyBvT3B0aW9ucy50eXBlICsgJygpIGl0ZW0nICsgKHF1ZXVlLmxlbmd0aCA9PT0gMSA/ICcnIDogJ3MnKSk7XHJcbiAgICAgIGZvciAoaSA9IDAsIGogPSBxdWV1ZS5sZW5ndGg7IGkgPCBqOyBpKyspIHtcclxuICAgICAgICBpZiAocXVldWVbaV0uc2NvcGUpIHtcclxuICAgICAgICAgIHF1ZXVlW2ldLm1ldGhvZC5hcHBseShxdWV1ZVtpXS5zY29wZSwgYXJncyk7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgIHF1ZXVlW2ldLm1ldGhvZC5hcHBseSh0aGlzLCBhcmdzKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKCFjYW5SZXRyeSkge1xyXG4gICAgICAgICAgLy8gdXNlRmxhc2hCbG9jayBhbmQgU1dGIHRpbWVvdXQgY2FzZSBkb2Vzbid0IGNvdW50IGhlcmUuXHJcbiAgICAgICAgICBxdWV1ZVtpXS5maXJlZCA9IHRydWU7XHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgcmV0dXJuIHRydWU7XHJcblxyXG4gIH07XHJcblxyXG4gIGluaXRVc2VyT25sb2FkID0gZnVuY3Rpb24oKSB7XHJcblxyXG4gICAgd2luZG93LnNldFRpbWVvdXQoZnVuY3Rpb24oKSB7XHJcblxyXG4gICAgICBpZiAoc20yLnVzZUZsYXNoQmxvY2spIHtcclxuICAgICAgICBmbGFzaEJsb2NrSGFuZGxlcigpO1xyXG4gICAgICB9XHJcblxyXG4gICAgICBwcm9jZXNzT25FdmVudHMoKTtcclxuXHJcbiAgICAgIC8vIGNhbGwgdXNlci1kZWZpbmVkIFwib25sb2FkXCIsIHNjb3BlZCB0byB3aW5kb3dcclxuXHJcbiAgICAgIGlmICh0eXBlb2Ygc20yLm9ubG9hZCA9PT0gJ2Z1bmN0aW9uJykge1xyXG4gICAgICAgIF93RFMoJ29ubG9hZCcsIDEpO1xyXG4gICAgICAgIHNtMi5vbmxvYWQuYXBwbHkod2luZG93KTtcclxuICAgICAgICBfd0RTKCdvbmxvYWRPSycsIDEpO1xyXG4gICAgICB9XHJcblxyXG4gICAgICBpZiAoc20yLndhaXRGb3JXaW5kb3dMb2FkKSB7XHJcbiAgICAgICAgZXZlbnQuYWRkKHdpbmRvdywgJ2xvYWQnLCBpbml0VXNlck9ubG9hZCk7XHJcbiAgICAgIH1cclxuXHJcbiAgICB9LDEpO1xyXG5cclxuICB9O1xyXG5cclxuICBkZXRlY3RGbGFzaCA9IGZ1bmN0aW9uKCkge1xyXG5cclxuICAgIC8vIGhhdCB0aXA6IEZsYXNoIERldGVjdCBsaWJyYXJ5IChCU0QsIChDKSAyMDA3KSBieSBDYXJsIFwiRG9jWWVzXCIgUy4gWWVzdHJhdSAtIGh0dHA6Ly9mZWF0dXJlYmxlbmQuY29tL2phdmFzY3JpcHQtZmxhc2gtZGV0ZWN0aW9uLWxpYnJhcnkuaHRtbCAvIGh0dHA6Ly9mZWF0dXJlYmxlbmQuY29tL2xpY2Vuc2UudHh0XHJcblxyXG4gICAgaWYgKGhhc0ZsYXNoICE9PSBfdW5kZWZpbmVkKSB7XHJcbiAgICAgIC8vIHRoaXMgd29yayBoYXMgYWxyZWFkeSBiZWVuIGRvbmUuXHJcbiAgICAgIHJldHVybiBoYXNGbGFzaDtcclxuICAgIH1cclxuXHJcbiAgICB2YXIgaGFzUGx1Z2luID0gZmFsc2UsIG4gPSBuYXZpZ2F0b3IsIG5QID0gbi5wbHVnaW5zLCBvYmosIHR5cGUsIHR5cGVzLCBBWCA9IHdpbmRvdy5BY3RpdmVYT2JqZWN0O1xyXG5cclxuICAgIGlmIChuUCAmJiBuUC5sZW5ndGgpIHtcclxuICAgICAgdHlwZSA9ICdhcHBsaWNhdGlvbi94LXNob2Nrd2F2ZS1mbGFzaCc7XHJcbiAgICAgIHR5cGVzID0gbi5taW1lVHlwZXM7XHJcbiAgICAgIGlmICh0eXBlcyAmJiB0eXBlc1t0eXBlXSAmJiB0eXBlc1t0eXBlXS5lbmFibGVkUGx1Z2luICYmIHR5cGVzW3R5cGVdLmVuYWJsZWRQbHVnaW4uZGVzY3JpcHRpb24pIHtcclxuICAgICAgICBoYXNQbHVnaW4gPSB0cnVlO1xyXG4gICAgICB9XHJcbiAgICB9IGVsc2UgaWYgKEFYICE9PSBfdW5kZWZpbmVkICYmICF1YS5tYXRjaCgvTVNBcHBIb3N0L2kpKSB7XHJcbiAgICAgIC8vIFdpbmRvd3MgOCBTdG9yZSBBcHBzIChNU0FwcEhvc3QpIGFyZSB3ZWlyZCAoY29tcGF0aWJpbGl0eT8pIGFuZCB3b24ndCBjb21wbGFpbiBoZXJlLCBidXQgd2lsbCBiYXJmIGlmIEZsYXNoL0FjdGl2ZVggb2JqZWN0IGlzIGFwcGVuZGVkIHRvIHRoZSBET00uXHJcbiAgICAgIHRyeSB7XHJcbiAgICAgICAgb2JqID0gbmV3IEFYKCdTaG9ja3dhdmVGbGFzaC5TaG9ja3dhdmVGbGFzaCcpO1xyXG4gICAgICB9IGNhdGNoKGUpIHtcclxuICAgICAgICAvLyBvaCB3ZWxsXHJcbiAgICAgICAgb2JqID0gbnVsbDtcclxuICAgICAgfVxyXG4gICAgICBoYXNQbHVnaW4gPSAoISFvYmopO1xyXG4gICAgICAvLyBjbGVhbnVwLCBiZWNhdXNlIGl0IGlzIEFjdGl2ZVggYWZ0ZXIgYWxsXHJcbiAgICAgIG9iaiA9IG51bGw7XHJcbiAgICB9XHJcblxyXG4gICAgaGFzRmxhc2ggPSBoYXNQbHVnaW47XHJcblxyXG4gICAgcmV0dXJuIGhhc1BsdWdpbjtcclxuXHJcbiAgfTtcclxuXHJcbmZlYXR1cmVDaGVjayA9IGZ1bmN0aW9uKCkge1xyXG5cclxuICAgIHZhciBmbGFzaE5lZWRlZCxcclxuICAgICAgICBpdGVtLFxyXG4gICAgICAgIGZvcm1hdHMgPSBzbTIuYXVkaW9Gb3JtYXRzLFxyXG4gICAgICAgIC8vIGlQaG9uZSA8PSAzLjEgaGFzIGJyb2tlbiBIVE1MNSBhdWRpbygpLCBidXQgZmlybXdhcmUgMy4yIChvcmlnaW5hbCBpUGFkKSArIGlPUzQgd29ya3MuXHJcbiAgICAgICAgaXNTcGVjaWFsID0gKGlzX2lEZXZpY2UgJiYgISEodWEubWF0Y2goL29zICgxfDJ8M18wfDNfMSlcXHMvaSkpKTtcclxuXHJcbiAgICBpZiAoaXNTcGVjaWFsKSB7XHJcblxyXG4gICAgICAvLyBoYXMgQXVkaW8oKSwgYnV0IGlzIGJyb2tlbjsgbGV0IGl0IGxvYWQgbGlua3MgZGlyZWN0bHkuXHJcbiAgICAgIHNtMi5oYXNIVE1MNSA9IGZhbHNlO1xyXG5cclxuICAgICAgLy8gaWdub3JlIGZsYXNoIGNhc2UsIGhvd2V2ZXJcclxuICAgICAgc20yLmh0bWw1T25seSA9IHRydWU7XHJcblxyXG4gICAgICAvLyBoaWRlIHRoZSBTV0YsIGlmIHByZXNlbnRcclxuICAgICAgaWYgKHNtMi5vTUMpIHtcclxuICAgICAgICBzbTIub01DLnN0eWxlLmRpc3BsYXkgPSAnbm9uZSc7XHJcbiAgICAgIH1cclxuXHJcbiAgICB9IGVsc2Uge1xyXG5cclxuICAgICAgaWYgKHNtMi51c2VIVE1MNUF1ZGlvKSB7XHJcblxyXG4gICAgICAgIGlmICghc20yLmh0bWw1IHx8ICFzbTIuaHRtbDUuY2FuUGxheVR5cGUpIHtcclxuICAgICAgICAgIHNtMi5fd0QoJ1NvdW5kTWFuYWdlcjogTm8gSFRNTDUgQXVkaW8oKSBzdXBwb3J0IGRldGVjdGVkLicpO1xyXG4gICAgICAgICAgc20yLmhhc0hUTUw1ID0gZmFsc2U7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvLyA8ZD5cclxuICAgICAgICBpZiAoaXNCYWRTYWZhcmkpIHtcclxuICAgICAgICAgIHNtMi5fd0Qoc21jICsgJ05vdGU6IEJ1Z2d5IEhUTUw1IEF1ZGlvIGluIFNhZmFyaSBvbiB0aGlzIE9TIFggcmVsZWFzZSwgc2VlIGh0dHBzOi8vYnVncy53ZWJraXQub3JnL3Nob3dfYnVnLmNnaT9pZD0zMjE1OSAtICcgKyAoIWhhc0ZsYXNoID8nIHdvdWxkIHVzZSBmbGFzaCBmYWxsYmFjayBmb3IgTVAzL01QNCwgYnV0IG5vbmUgZGV0ZWN0ZWQuJyA6ICd3aWxsIHVzZSBmbGFzaCBmYWxsYmFjayBmb3IgTVAzL01QNCwgaWYgYXZhaWxhYmxlJyksIDEpO1xyXG4gICAgICAgIH1cclxuICAgICAgICAvLyA8L2Q+XHJcblxyXG4gICAgICB9XHJcblxyXG4gICAgfVxyXG5cclxuICAgIGlmIChzbTIudXNlSFRNTDVBdWRpbyAmJiBzbTIuaGFzSFRNTDUpIHtcclxuXHJcbiAgICAgIC8vIHNvcnQgb3V0IHdoZXRoZXIgZmxhc2ggaXMgb3B0aW9uYWwsIHJlcXVpcmVkIG9yIGNhbiBiZSBpZ25vcmVkLlxyXG5cclxuICAgICAgLy8gaW5ub2NlbnQgdW50aWwgcHJvdmVuIGd1aWx0eS5cclxuICAgICAgY2FuSWdub3JlRmxhc2ggPSB0cnVlO1xyXG5cclxuICAgICAgZm9yIChpdGVtIGluIGZvcm1hdHMpIHtcclxuICAgICAgICBpZiAoZm9ybWF0cy5oYXNPd25Qcm9wZXJ0eShpdGVtKSkge1xyXG4gICAgICAgICAgaWYgKGZvcm1hdHNbaXRlbV0ucmVxdWlyZWQpIHtcclxuICAgICAgICAgICAgaWYgKCFzbTIuaHRtbDUuY2FuUGxheVR5cGUoZm9ybWF0c1tpdGVtXS50eXBlKSkge1xyXG4gICAgICAgICAgICAgIC8vIDEwMCUgSFRNTDUgbW9kZSBpcyBub3QgcG9zc2libGUuXHJcbiAgICAgICAgICAgICAgY2FuSWdub3JlRmxhc2ggPSBmYWxzZTtcclxuICAgICAgICAgICAgICBmbGFzaE5lZWRlZCA9IHRydWU7XHJcbiAgICAgICAgICAgIH0gZWxzZSBpZiAoc20yLnByZWZlckZsYXNoICYmIChzbTIuZmxhc2hbaXRlbV0gfHwgc20yLmZsYXNoW2Zvcm1hdHNbaXRlbV0udHlwZV0pKSB7XHJcbiAgICAgICAgICAgICAgLy8gZmxhc2ggbWF5IGJlIHJlcXVpcmVkLCBvciBwcmVmZXJyZWQgZm9yIHRoaXMgZm9ybWF0LlxyXG4gICAgICAgICAgICAgIGZsYXNoTmVlZGVkID0gdHJ1ZTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG5cclxuICAgIH1cclxuXHJcbiAgICAvLyBzYW5pdHkgY2hlY2suLi5cclxuICAgIGlmIChzbTIuaWdub3JlRmxhc2gpIHtcclxuICAgICAgZmxhc2hOZWVkZWQgPSBmYWxzZTtcclxuICAgICAgY2FuSWdub3JlRmxhc2ggPSB0cnVlO1xyXG4gICAgfVxyXG5cclxuICAgIHNtMi5odG1sNU9ubHkgPSAoc20yLmhhc0hUTUw1ICYmIHNtMi51c2VIVE1MNUF1ZGlvICYmICFmbGFzaE5lZWRlZCk7XHJcblxyXG4gICAgcmV0dXJuICghc20yLmh0bWw1T25seSk7XHJcblxyXG4gIH07XHJcblxyXG4gIHBhcnNlVVJMID0gZnVuY3Rpb24odXJsKSB7XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBJbnRlcm5hbDogRmluZHMgYW5kIHJldHVybnMgdGhlIGZpcnN0IHBsYXlhYmxlIFVSTCAob3IgZmFpbGluZyB0aGF0LCB0aGUgZmlyc3QgVVJMLilcclxuICAgICAqIEBwYXJhbSB7c3RyaW5nIG9yIGFycmF5fSB1cmwgQSBzaW5nbGUgVVJMIHN0cmluZywgT1IsIGFuIGFycmF5IG9mIFVSTCBzdHJpbmdzIG9yIHt1cmw6Jy9wYXRoL3RvL3Jlc291cmNlJywgdHlwZTonYXVkaW8vbXAzJ30gb2JqZWN0cy5cclxuICAgICAqL1xyXG5cclxuICAgIHZhciBpLCBqLCB1cmxSZXN1bHQgPSAwLCByZXN1bHQ7XHJcblxyXG4gICAgaWYgKHVybCBpbnN0YW5jZW9mIEFycmF5KSB7XHJcblxyXG4gICAgICAvLyBmaW5kIHRoZSBmaXJzdCBnb29kIG9uZVxyXG4gICAgICBmb3IgKGk9MCwgaj11cmwubGVuZ3RoOyBpPGo7IGkrKykge1xyXG5cclxuICAgICAgICBpZiAodXJsW2ldIGluc3RhbmNlb2YgT2JqZWN0KSB7XHJcbiAgICAgICAgICAvLyBNSU1FIGNoZWNrXHJcbiAgICAgICAgICBpZiAoc20yLmNhblBsYXlNSU1FKHVybFtpXS50eXBlKSkge1xyXG4gICAgICAgICAgICB1cmxSZXN1bHQgPSBpO1xyXG4gICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgfSBlbHNlIGlmIChzbTIuY2FuUGxheVVSTCh1cmxbaV0pKSB7XHJcbiAgICAgICAgICAvLyBVUkwgc3RyaW5nIGNoZWNrXHJcbiAgICAgICAgICB1cmxSZXN1bHQgPSBpO1xyXG4gICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgfVxyXG5cclxuICAgICAgLy8gbm9ybWFsaXplIHRvIHN0cmluZ1xyXG4gICAgICBpZiAodXJsW3VybFJlc3VsdF0udXJsKSB7XHJcbiAgICAgICAgdXJsW3VybFJlc3VsdF0gPSB1cmxbdXJsUmVzdWx0XS51cmw7XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIHJlc3VsdCA9IHVybFt1cmxSZXN1bHRdO1xyXG5cclxuICAgIH0gZWxzZSB7XHJcblxyXG4gICAgICAvLyBzaW5nbGUgVVJMIGNhc2VcclxuICAgICAgcmVzdWx0ID0gdXJsO1xyXG5cclxuICAgIH1cclxuXHJcbiAgICByZXR1cm4gcmVzdWx0O1xyXG5cclxuICB9O1xyXG5cclxuXHJcbiAgc3RhcnRUaW1lciA9IGZ1bmN0aW9uKG9Tb3VuZCkge1xyXG5cclxuICAgIC8qKlxyXG4gICAgICogYXR0YWNoIGEgdGltZXIgdG8gdGhpcyBzb3VuZCwgYW5kIHN0YXJ0IGFuIGludGVydmFsIGlmIG5lZWRlZFxyXG4gICAgICovXHJcblxyXG4gICAgaWYgKCFvU291bmQuX2hhc1RpbWVyKSB7XHJcblxyXG4gICAgICBvU291bmQuX2hhc1RpbWVyID0gdHJ1ZTtcclxuXHJcbiAgICAgIGlmICghbW9iaWxlSFRNTDUgJiYgc20yLmh0bWw1UG9sbGluZ0ludGVydmFsKSB7XHJcblxyXG4gICAgICAgIGlmIChoNUludGVydmFsVGltZXIgPT09IG51bGwgJiYgaDVUaW1lckNvdW50ID09PSAwKSB7XHJcblxyXG4gICAgICAgICAgaDVJbnRlcnZhbFRpbWVyID0gc2V0SW50ZXJ2YWwodGltZXJFeGVjdXRlLCBzbTIuaHRtbDVQb2xsaW5nSW50ZXJ2YWwpO1xyXG5cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGg1VGltZXJDb3VudCsrO1xyXG5cclxuICAgICAgfVxyXG5cclxuICAgIH1cclxuXHJcbiAgfTtcclxuXHJcbiAgc3RvcFRpbWVyID0gZnVuY3Rpb24ob1NvdW5kKSB7XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBkZXRhY2ggYSB0aW1lclxyXG4gICAgICovXHJcblxyXG4gICAgaWYgKG9Tb3VuZC5faGFzVGltZXIpIHtcclxuXHJcbiAgICAgIG9Tb3VuZC5faGFzVGltZXIgPSBmYWxzZTtcclxuXHJcbiAgICAgIGlmICghbW9iaWxlSFRNTDUgJiYgc20yLmh0bWw1UG9sbGluZ0ludGVydmFsKSB7XHJcblxyXG4gICAgICAgIC8vIGludGVydmFsIHdpbGwgc3RvcCBpdHNlbGYgYXQgbmV4dCBleGVjdXRpb24uXHJcblxyXG4gICAgICAgIGg1VGltZXJDb3VudC0tO1xyXG5cclxuICAgICAgfVxyXG5cclxuICAgIH1cclxuXHJcbiAgfTtcclxuXHJcbiAgdGltZXJFeGVjdXRlID0gZnVuY3Rpb24oKSB7XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBtYW51YWwgcG9sbGluZyBmb3IgSFRNTDUgcHJvZ3Jlc3MgZXZlbnRzLCBpZS4sIHdoaWxlcGxheWluZygpIChjYW4gYWNoaWV2ZSBncmVhdGVyIHByZWNpc2lvbiB0aGFuIGNvbnNlcnZhdGl2ZSBkZWZhdWx0IEhUTUw1IGludGVydmFsKVxyXG4gICAgICovXHJcblxyXG4gICAgdmFyIGk7XHJcblxyXG4gICAgaWYgKGg1SW50ZXJ2YWxUaW1lciAhPT0gbnVsbCAmJiAhaDVUaW1lckNvdW50KSB7XHJcblxyXG4gICAgICAvLyBubyBhY3RpdmUgdGltZXJzLCBzdG9wIHBvbGxpbmcgaW50ZXJ2YWwuXHJcblxyXG4gICAgICBjbGVhckludGVydmFsKGg1SW50ZXJ2YWxUaW1lcik7XHJcblxyXG4gICAgICBoNUludGVydmFsVGltZXIgPSBudWxsO1xyXG5cclxuICAgICAgcmV0dXJuIGZhbHNlO1xyXG5cclxuICAgIH1cclxuXHJcbiAgICAvLyBjaGVjayBhbGwgSFRNTDUgc291bmRzIHdpdGggdGltZXJzXHJcblxyXG4gICAgZm9yIChpID0gc20yLnNvdW5kSURzLmxlbmd0aC0xOyBpID49IDA7IGktLSkge1xyXG5cclxuICAgICAgaWYgKHNtMi5zb3VuZHNbc20yLnNvdW5kSURzW2ldXS5pc0hUTUw1ICYmIHNtMi5zb3VuZHNbc20yLnNvdW5kSURzW2ldXS5faGFzVGltZXIpIHtcclxuXHJcbiAgICAgICAgc20yLnNvdW5kc1tzbTIuc291bmRJRHNbaV1dLl9vblRpbWVyKCk7XHJcblxyXG4gICAgICB9XHJcblxyXG4gICAgfVxyXG5cclxuICB9O1xyXG5cclxuICBjYXRjaEVycm9yID0gZnVuY3Rpb24ob3B0aW9ucykge1xyXG5cclxuICAgIG9wdGlvbnMgPSAob3B0aW9ucyAhPT0gX3VuZGVmaW5lZCA/IG9wdGlvbnMgOiB7fSk7XHJcblxyXG4gICAgaWYgKHR5cGVvZiBzbTIub25lcnJvciA9PT0gJ2Z1bmN0aW9uJykge1xyXG4gICAgICBzbTIub25lcnJvci5hcHBseSh3aW5kb3csIFt7dHlwZToob3B0aW9ucy50eXBlICE9PSBfdW5kZWZpbmVkID8gb3B0aW9ucy50eXBlIDogbnVsbCl9XSk7XHJcbiAgICB9XHJcblxyXG4gICAgaWYgKG9wdGlvbnMuZmF0YWwgIT09IF91bmRlZmluZWQgJiYgb3B0aW9ucy5mYXRhbCkge1xyXG4gICAgICBzbTIuZGlzYWJsZSgpO1xyXG4gICAgfVxyXG5cclxuICB9O1xyXG5cclxuICBiYWRTYWZhcmlGaXggPSBmdW5jdGlvbigpIHtcclxuXHJcbiAgICAvLyBzcGVjaWFsIGNhc2U6IFwiYmFkXCIgU2FmYXJpIChPUyBYIDEwLjMgLSAxMC43KSBtdXN0IGZhbGwgYmFjayB0byBmbGFzaCBmb3IgTVAzL01QNFxyXG4gICAgaWYgKCFpc0JhZFNhZmFyaSB8fCAhZGV0ZWN0Rmxhc2goKSkge1xyXG4gICAgICAvLyBkb2Vzbid0IGFwcGx5XHJcbiAgICAgIHJldHVybiBmYWxzZTtcclxuICAgIH1cclxuXHJcbiAgICB2YXIgYUYgPSBzbTIuYXVkaW9Gb3JtYXRzLCBpLCBpdGVtO1xyXG5cclxuICAgIGZvciAoaXRlbSBpbiBhRikge1xyXG4gICAgICBpZiAoYUYuaGFzT3duUHJvcGVydHkoaXRlbSkpIHtcclxuICAgICAgICBpZiAoaXRlbSA9PT0gJ21wMycgfHwgaXRlbSA9PT0gJ21wNCcpIHtcclxuICAgICAgICAgIHNtMi5fd0Qoc20gKyAnOiBVc2luZyBmbGFzaCBmYWxsYmFjayBmb3IgJyArIGl0ZW0gKyAnIGZvcm1hdCcpO1xyXG4gICAgICAgICAgc20yLmh0bWw1W2l0ZW1dID0gZmFsc2U7XHJcbiAgICAgICAgICAvLyBhc3NpZ24gcmVzdWx0IHRvIHJlbGF0ZWQgZm9ybWF0cywgdG9vXHJcbiAgICAgICAgICBpZiAoYUZbaXRlbV0gJiYgYUZbaXRlbV0ucmVsYXRlZCkge1xyXG4gICAgICAgICAgICBmb3IgKGkgPSBhRltpdGVtXS5yZWxhdGVkLmxlbmd0aC0xOyBpID49IDA7IGktLSkge1xyXG4gICAgICAgICAgICAgIHNtMi5odG1sNVthRltpdGVtXS5yZWxhdGVkW2ldXSA9IGZhbHNlO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcbiAgICB9XHJcblxyXG4gIH07XHJcblxyXG4gIC8qKlxyXG4gICAqIFBzZXVkby1wcml2YXRlIGZsYXNoL0V4dGVybmFsSW50ZXJmYWNlIG1ldGhvZHNcclxuICAgKiAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXHJcbiAgICovXHJcblxyXG4gIHRoaXMuX3NldFNhbmRib3hUeXBlID0gZnVuY3Rpb24oc2FuZGJveFR5cGUpIHtcclxuXHJcbiAgICAvLyA8ZD5cclxuICAgIHZhciBzYiA9IHNtMi5zYW5kYm94O1xyXG5cclxuICAgIHNiLnR5cGUgPSBzYW5kYm94VHlwZTtcclxuICAgIHNiLmRlc2NyaXB0aW9uID0gc2IudHlwZXNbKHNiLnR5cGVzW3NhbmRib3hUeXBlXSAhPT0gX3VuZGVmaW5lZD9zYW5kYm94VHlwZTondW5rbm93bicpXTtcclxuXHJcbiAgICBpZiAoc2IudHlwZSA9PT0gJ2xvY2FsV2l0aEZpbGUnKSB7XHJcblxyXG4gICAgICBzYi5ub1JlbW90ZSA9IHRydWU7XHJcbiAgICAgIHNiLm5vTG9jYWwgPSBmYWxzZTtcclxuICAgICAgX3dEUygnc2VjTm90ZScsIDIpO1xyXG5cclxuICAgIH0gZWxzZSBpZiAoc2IudHlwZSA9PT0gJ2xvY2FsV2l0aE5ldHdvcmsnKSB7XHJcblxyXG4gICAgICBzYi5ub1JlbW90ZSA9IGZhbHNlO1xyXG4gICAgICBzYi5ub0xvY2FsID0gdHJ1ZTtcclxuXHJcbiAgICB9IGVsc2UgaWYgKHNiLnR5cGUgPT09ICdsb2NhbFRydXN0ZWQnKSB7XHJcblxyXG4gICAgICBzYi5ub1JlbW90ZSA9IGZhbHNlO1xyXG4gICAgICBzYi5ub0xvY2FsID0gZmFsc2U7XHJcblxyXG4gICAgfVxyXG4gICAgLy8gPC9kPlxyXG5cclxuICB9O1xyXG5cclxuICB0aGlzLl9leHRlcm5hbEludGVyZmFjZU9LID0gZnVuY3Rpb24oc3dmVmVyc2lvbikge1xyXG5cclxuICAgIC8vIGZsYXNoIGNhbGxiYWNrIGNvbmZpcm1pbmcgZmxhc2ggbG9hZGVkLCBFSSB3b3JraW5nIGV0Yy5cclxuICAgIC8vIHN3ZlZlcnNpb246IFNXRiBidWlsZCBzdHJpbmdcclxuXHJcbiAgICBpZiAoc20yLnN3ZkxvYWRlZCkge1xyXG4gICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICB9XHJcblxyXG4gICAgdmFyIGU7XHJcblxyXG4gICAgZGVidWdUUygnc3dmJywgdHJ1ZSk7XHJcbiAgICBkZWJ1Z1RTKCdmbGFzaHRvanMnLCB0cnVlKTtcclxuICAgIHNtMi5zd2ZMb2FkZWQgPSB0cnVlO1xyXG4gICAgdHJ5SW5pdE9uRm9jdXMgPSBmYWxzZTtcclxuXHJcbiAgICBpZiAoaXNCYWRTYWZhcmkpIHtcclxuICAgICAgYmFkU2FmYXJpRml4KCk7XHJcbiAgICB9XHJcblxyXG4gICAgLy8gY29tcGxhaW4gaWYgSlMgKyBTV0YgYnVpbGQvdmVyc2lvbiBzdHJpbmdzIGRvbid0IG1hdGNoLCBleGNsdWRpbmcgK0RFViBidWlsZHNcclxuICAgIC8vIDxkPlxyXG4gICAgaWYgKCFzd2ZWZXJzaW9uIHx8IHN3ZlZlcnNpb24ucmVwbGFjZSgvXFwrZGV2L2ksJycpICE9PSBzbTIudmVyc2lvbk51bWJlci5yZXBsYWNlKC9cXCtkZXYvaSwgJycpKSB7XHJcblxyXG4gICAgICBlID0gc20gKyAnOiBGYXRhbDogSmF2YVNjcmlwdCBmaWxlIGJ1aWxkIFwiJyArIHNtMi52ZXJzaW9uTnVtYmVyICsgJ1wiIGRvZXMgbm90IG1hdGNoIEZsYXNoIFNXRiBidWlsZCBcIicgKyBzd2ZWZXJzaW9uICsgJ1wiIGF0ICcgKyBzbTIudXJsICsgJy4gRW5zdXJlIGJvdGggYXJlIHVwLXRvLWRhdGUuJztcclxuXHJcbiAgICAgIC8vIGVzY2FwZSBmbGFzaCAtPiBKUyBzdGFjayBzbyB0aGlzIGVycm9yIGZpcmVzIGluIHdpbmRvdy5cclxuICAgICAgc2V0VGltZW91dChmdW5jdGlvbiB2ZXJzaW9uTWlzbWF0Y2goKSB7XHJcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKGUpO1xyXG4gICAgICB9LCAwKTtcclxuXHJcbiAgICAgIC8vIGV4aXQsIGluaXQgd2lsbCBmYWlsIHdpdGggdGltZW91dFxyXG4gICAgICByZXR1cm4gZmFsc2U7XHJcblxyXG4gICAgfVxyXG4gICAgLy8gPC9kPlxyXG5cclxuICAgIC8vIElFIG5lZWRzIGEgbGFyZ2VyIHRpbWVvdXRcclxuICAgIHNldFRpbWVvdXQoaW5pdCwgaXNJRSA/IDEwMCA6IDEpO1xyXG5cclxuICB9O1xyXG5cclxuICAvKipcclxuICAgKiBQcml2YXRlIGluaXRpYWxpemF0aW9uIGhlbHBlcnNcclxuICAgKiAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cclxuICAgKi9cclxuXHJcbiAgY3JlYXRlTW92aWUgPSBmdW5jdGlvbihzbUlELCBzbVVSTCkge1xyXG5cclxuICAgIGlmIChkaWRBcHBlbmQgJiYgYXBwZW5kU3VjY2Vzcykge1xyXG4gICAgICAvLyBpZ25vcmUgaWYgYWxyZWFkeSBzdWNjZWVkZWRcclxuICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgfVxyXG5cclxuICAgIGZ1bmN0aW9uIGluaXRNc2coKSB7XHJcblxyXG4gICAgICAvLyA8ZD5cclxuXHJcbiAgICAgIHZhciBvcHRpb25zID0gW10sXHJcbiAgICAgICAgICB0aXRsZSxcclxuICAgICAgICAgIG1zZyA9IFtdLFxyXG4gICAgICAgICAgZGVsaW1pdGVyID0gJyArICc7XHJcblxyXG4gICAgICB0aXRsZSA9ICdTb3VuZE1hbmFnZXIgJyArIHNtMi52ZXJzaW9uICsgKCFzbTIuaHRtbDVPbmx5ICYmIHNtMi51c2VIVE1MNUF1ZGlvID8gKHNtMi5oYXNIVE1MNSA/ICcgKyBIVE1MNSBhdWRpbycgOiAnLCBubyBIVE1MNSBhdWRpbyBzdXBwb3J0JykgOiAnJyk7XHJcblxyXG4gICAgICBpZiAoIXNtMi5odG1sNU9ubHkpIHtcclxuXHJcbiAgICAgICAgaWYgKHNtMi5wcmVmZXJGbGFzaCkge1xyXG4gICAgICAgICAgb3B0aW9ucy5wdXNoKCdwcmVmZXJGbGFzaCcpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgaWYgKHNtMi51c2VIaWdoUGVyZm9ybWFuY2UpIHtcclxuICAgICAgICAgIG9wdGlvbnMucHVzaCgndXNlSGlnaFBlcmZvcm1hbmNlJyk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBpZiAoc20yLmZsYXNoUG9sbGluZ0ludGVydmFsKSB7XHJcbiAgICAgICAgICBvcHRpb25zLnB1c2goJ2ZsYXNoUG9sbGluZ0ludGVydmFsICgnICsgc20yLmZsYXNoUG9sbGluZ0ludGVydmFsICsgJ21zKScpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgaWYgKHNtMi5odG1sNVBvbGxpbmdJbnRlcnZhbCkge1xyXG4gICAgICAgICAgb3B0aW9ucy5wdXNoKCdodG1sNVBvbGxpbmdJbnRlcnZhbCAoJyArIHNtMi5odG1sNVBvbGxpbmdJbnRlcnZhbCArICdtcyknKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGlmIChzbTIud21vZGUpIHtcclxuICAgICAgICAgIG9wdGlvbnMucHVzaCgnd21vZGUgKCcgKyBzbTIud21vZGUgKyAnKScpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgaWYgKHNtMi5kZWJ1Z0ZsYXNoKSB7XHJcbiAgICAgICAgICBvcHRpb25zLnB1c2goJ2RlYnVnRmxhc2gnKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGlmIChzbTIudXNlRmxhc2hCbG9jaykge1xyXG4gICAgICAgICAgb3B0aW9ucy5wdXNoKCdmbGFzaEJsb2NrJyk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgfSBlbHNlIHtcclxuXHJcbiAgICAgICAgaWYgKHNtMi5odG1sNVBvbGxpbmdJbnRlcnZhbCkge1xyXG4gICAgICAgICAgb3B0aW9ucy5wdXNoKCdodG1sNVBvbGxpbmdJbnRlcnZhbCAoJyArIHNtMi5odG1sNVBvbGxpbmdJbnRlcnZhbCArICdtcyknKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICB9XHJcblxyXG4gICAgICBpZiAob3B0aW9ucy5sZW5ndGgpIHtcclxuICAgICAgICBtc2cgPSBtc2cuY29uY2F0KFtvcHRpb25zLmpvaW4oZGVsaW1pdGVyKV0pO1xyXG4gICAgICB9XHJcblxyXG4gICAgICBzbTIuX3dEKHRpdGxlICsgKG1zZy5sZW5ndGggPyBkZWxpbWl0ZXIgKyBtc2cuam9pbignLCAnKSA6ICcnKSwgMSk7XHJcblxyXG4gICAgICBzaG93U3VwcG9ydCgpO1xyXG5cclxuICAgICAgLy8gPC9kPlxyXG5cclxuICAgIH1cclxuXHJcbiAgICBpZiAoc20yLmh0bWw1T25seSkge1xyXG5cclxuICAgICAgLy8gMTAwJSBIVE1MNSBtb2RlXHJcbiAgICAgIHNldFZlcnNpb25JbmZvKCk7XHJcblxyXG4gICAgICBpbml0TXNnKCk7XHJcbiAgICAgIHNtMi5vTUMgPSBpZChzbTIubW92aWVJRCk7XHJcbiAgICAgIGluaXQoKTtcclxuXHJcbiAgICAgIC8vIHByZXZlbnQgbXVsdGlwbGUgaW5pdCBhdHRlbXB0c1xyXG4gICAgICBkaWRBcHBlbmQgPSB0cnVlO1xyXG5cclxuICAgICAgYXBwZW5kU3VjY2VzcyA9IHRydWU7XHJcblxyXG4gICAgICByZXR1cm4gZmFsc2U7XHJcblxyXG4gICAgfVxyXG5cclxuICAgIC8vIGZsYXNoIHBhdGhcclxuICAgIHZhciByZW1vdGVVUkwgPSAoc21VUkwgfHwgc20yLnVybCksXHJcbiAgICBsb2NhbFVSTCA9IChzbTIuYWx0VVJMIHx8IHJlbW90ZVVSTCksXHJcbiAgICBzd2ZUaXRsZSA9ICdKUy9GbGFzaCBhdWRpbyBjb21wb25lbnQgKFNvdW5kTWFuYWdlciAyKScsXHJcbiAgICBvVGFyZ2V0ID0gZ2V0RG9jdW1lbnQoKSxcclxuICAgIGV4dHJhQ2xhc3MgPSBnZXRTV0ZDU1MoKSxcclxuICAgIGlzUlRMID0gbnVsbCxcclxuICAgIGh0bWwgPSBkb2MuZ2V0RWxlbWVudHNCeVRhZ05hbWUoJ2h0bWwnKVswXSxcclxuICAgIG9FbWJlZCwgb01vdmllLCB0bXAsIG1vdmllSFRNTCwgb0VsLCBzLCB4LCBzQ2xhc3M7XHJcblxyXG4gICAgaXNSVEwgPSAoaHRtbCAmJiBodG1sLmRpciAmJiBodG1sLmRpci5tYXRjaCgvcnRsL2kpKTtcclxuICAgIHNtSUQgPSAoc21JRCA9PT0gX3VuZGVmaW5lZD9zbTIuaWQ6c21JRCk7XHJcblxyXG4gICAgZnVuY3Rpb24gcGFyYW0obmFtZSwgdmFsdWUpIHtcclxuICAgICAgcmV0dXJuICc8cGFyYW0gbmFtZT1cIicrbmFtZSsnXCIgdmFsdWU9XCInK3ZhbHVlKydcIiAvPic7XHJcbiAgICB9XHJcblxyXG4gICAgLy8gc2FmZXR5IGNoZWNrIGZvciBsZWdhY3kgKGNoYW5nZSB0byBGbGFzaCA5IFVSTClcclxuICAgIHNldFZlcnNpb25JbmZvKCk7XHJcbiAgICBzbTIudXJsID0gbm9ybWFsaXplTW92aWVVUkwob3ZlckhUVFA/cmVtb3RlVVJMOmxvY2FsVVJMKTtcclxuICAgIHNtVVJMID0gc20yLnVybDtcclxuXHJcbiAgICBzbTIud21vZGUgPSAoIXNtMi53bW9kZSAmJiBzbTIudXNlSGlnaFBlcmZvcm1hbmNlID8gJ3RyYW5zcGFyZW50JyA6IHNtMi53bW9kZSk7XHJcblxyXG4gICAgaWYgKHNtMi53bW9kZSAhPT0gbnVsbCAmJiAodWEubWF0Y2goL21zaWUgOC9pKSB8fCAoIWlzSUUgJiYgIXNtMi51c2VIaWdoUGVyZm9ybWFuY2UpKSAmJiBuYXZpZ2F0b3IucGxhdGZvcm0ubWF0Y2goL3dpbjMyfHdpbjY0L2kpKSB7XHJcbiAgICAgIC8qKlxyXG4gICAgICAgKiBleHRyYS1zcGVjaWFsIGNhc2U6IG1vdmllIGRvZXNuJ3QgbG9hZCB1bnRpbCBzY3JvbGxlZCBpbnRvIHZpZXcgd2hlbiB1c2luZyB3bW9kZSA9IGFueXRoaW5nIGJ1dCAnd2luZG93JyBoZXJlXHJcbiAgICAgICAqIGRvZXMgbm90IGFwcGx5IHdoZW4gdXNpbmcgaGlnaCBwZXJmb3JtYW5jZSAocG9zaXRpb246Zml4ZWQgbWVhbnMgb24tc2NyZWVuKSwgT1IgaW5maW5pdGUgZmxhc2ggbG9hZCB0aW1lb3V0XHJcbiAgICAgICAqIHdtb2RlIGJyZWFrcyBJRSA4IG9uIFZpc3RhICsgV2luNyB0b28gaW4gc29tZSBjYXNlcywgYXMgb2YgSmFudWFyeSAyMDExICg/KVxyXG4gICAgICAgKi9cclxuICAgICAgbWVzc2FnZXMucHVzaChzdHJpbmdzLnNwY1dtb2RlKTtcclxuICAgICAgc20yLndtb2RlID0gbnVsbDtcclxuICAgIH1cclxuXHJcbiAgICBvRW1iZWQgPSB7XHJcbiAgICAgICduYW1lJzogc21JRCxcclxuICAgICAgJ2lkJzogc21JRCxcclxuICAgICAgJ3NyYyc6IHNtVVJMLFxyXG4gICAgICAncXVhbGl0eSc6ICdoaWdoJyxcclxuICAgICAgJ2FsbG93U2NyaXB0QWNjZXNzJzogc20yLmFsbG93U2NyaXB0QWNjZXNzLFxyXG4gICAgICAnYmdjb2xvcic6IHNtMi5iZ0NvbG9yLFxyXG4gICAgICAncGx1Z2luc3BhZ2UnOiBodHRwKyd3d3cubWFjcm9tZWRpYS5jb20vZ28vZ2V0Zmxhc2hwbGF5ZXInLFxyXG4gICAgICAndGl0bGUnOiBzd2ZUaXRsZSxcclxuICAgICAgJ3R5cGUnOiAnYXBwbGljYXRpb24veC1zaG9ja3dhdmUtZmxhc2gnLFxyXG4gICAgICAnd21vZGUnOiBzbTIud21vZGUsXHJcbiAgICAgIC8vIGh0dHA6Ly9oZWxwLmFkb2JlLmNvbS9lbl9VUy9hczMvbW9iaWxlL1dTNGJlYmNkNjZhNzQyNzVjMzZjZmI4MTM3MTI0MzE4ZWViYzYtN2ZmZC5odG1sXHJcbiAgICAgICdoYXNQcmlvcml0eSc6ICd0cnVlJ1xyXG4gICAgfTtcclxuXHJcbiAgICBpZiAoc20yLmRlYnVnRmxhc2gpIHtcclxuICAgICAgb0VtYmVkLkZsYXNoVmFycyA9ICdkZWJ1Zz0xJztcclxuICAgIH1cclxuXHJcbiAgICBpZiAoIXNtMi53bW9kZSkge1xyXG4gICAgICAvLyBkb24ndCB3cml0ZSBlbXB0eSBhdHRyaWJ1dGVcclxuICAgICAgZGVsZXRlIG9FbWJlZC53bW9kZTtcclxuICAgIH1cclxuXHJcbiAgICBpZiAoaXNJRSkge1xyXG5cclxuICAgICAgLy8gSUUgaXMgXCJzcGVjaWFsXCIuXHJcbiAgICAgIG9Nb3ZpZSA9IGRvYy5jcmVhdGVFbGVtZW50KCdkaXYnKTtcclxuICAgICAgbW92aWVIVE1MID0gW1xyXG4gICAgICAgICc8b2JqZWN0IGlkPVwiJyArIHNtSUQgKyAnXCIgZGF0YT1cIicgKyBzbVVSTCArICdcIiB0eXBlPVwiJyArIG9FbWJlZC50eXBlICsgJ1wiIHRpdGxlPVwiJyArIG9FbWJlZC50aXRsZSArJ1wiIGNsYXNzaWQ9XCJjbHNpZDpEMjdDREI2RS1BRTZELTExY2YtOTZCOC00NDQ1NTM1NDAwMDBcIiBjb2RlYmFzZT1cIicgKyBodHRwKydkb3dubG9hZC5tYWNyb21lZGlhLmNvbS9wdWIvc2hvY2t3YXZlL2NhYnMvZmxhc2gvc3dmbGFzaC5jYWIjdmVyc2lvbj02LDAsNDAsMFwiPicsXHJcbiAgICAgICAgcGFyYW0oJ21vdmllJywgc21VUkwpLFxyXG4gICAgICAgIHBhcmFtKCdBbGxvd1NjcmlwdEFjY2VzcycsIHNtMi5hbGxvd1NjcmlwdEFjY2VzcyksXHJcbiAgICAgICAgcGFyYW0oJ3F1YWxpdHknLCBvRW1iZWQucXVhbGl0eSksXHJcbiAgICAgICAgKHNtMi53bW9kZT8gcGFyYW0oJ3dtb2RlJywgc20yLndtb2RlKTogJycpLFxyXG4gICAgICAgIHBhcmFtKCdiZ2NvbG9yJywgc20yLmJnQ29sb3IpLFxyXG4gICAgICAgIHBhcmFtKCdoYXNQcmlvcml0eScsICd0cnVlJyksXHJcbiAgICAgICAgKHNtMi5kZWJ1Z0ZsYXNoID8gcGFyYW0oJ0ZsYXNoVmFycycsIG9FbWJlZC5GbGFzaFZhcnMpIDogJycpLFxyXG4gICAgICAgICc8L29iamVjdD4nXHJcbiAgICAgIF0uam9pbignJyk7XHJcblxyXG4gICAgfSBlbHNlIHtcclxuXHJcbiAgICAgIG9Nb3ZpZSA9IGRvYy5jcmVhdGVFbGVtZW50KCdlbWJlZCcpO1xyXG4gICAgICBmb3IgKHRtcCBpbiBvRW1iZWQpIHtcclxuICAgICAgICBpZiAob0VtYmVkLmhhc093blByb3BlcnR5KHRtcCkpIHtcclxuICAgICAgICAgIG9Nb3ZpZS5zZXRBdHRyaWJ1dGUodG1wLCBvRW1iZWRbdG1wXSk7XHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcblxyXG4gICAgfVxyXG5cclxuICAgIGluaXREZWJ1ZygpO1xyXG4gICAgZXh0cmFDbGFzcyA9IGdldFNXRkNTUygpO1xyXG4gICAgb1RhcmdldCA9IGdldERvY3VtZW50KCk7XHJcblxyXG4gICAgaWYgKG9UYXJnZXQpIHtcclxuXHJcbiAgICAgIHNtMi5vTUMgPSAoaWQoc20yLm1vdmllSUQpIHx8IGRvYy5jcmVhdGVFbGVtZW50KCdkaXYnKSk7XHJcblxyXG4gICAgICBpZiAoIXNtMi5vTUMuaWQpIHtcclxuXHJcbiAgICAgICAgc20yLm9NQy5pZCA9IHNtMi5tb3ZpZUlEO1xyXG4gICAgICAgIHNtMi5vTUMuY2xhc3NOYW1lID0gc3dmQ1NTLnN3ZkRlZmF1bHQgKyAnICcgKyBleHRyYUNsYXNzO1xyXG4gICAgICAgIHMgPSBudWxsO1xyXG4gICAgICAgIG9FbCA9IG51bGw7XHJcblxyXG4gICAgICAgIGlmICghc20yLnVzZUZsYXNoQmxvY2spIHtcclxuICAgICAgICAgIGlmIChzbTIudXNlSGlnaFBlcmZvcm1hbmNlKSB7XHJcbiAgICAgICAgICAgIC8vIG9uLXNjcmVlbiBhdCBhbGwgdGltZXNcclxuICAgICAgICAgICAgcyA9IHtcclxuICAgICAgICAgICAgICAncG9zaXRpb24nOiAnZml4ZWQnLFxyXG4gICAgICAgICAgICAgICd3aWR0aCc6ICc4cHgnLFxyXG4gICAgICAgICAgICAgICdoZWlnaHQnOiAnOHB4JyxcclxuICAgICAgICAgICAgICAvLyA+PSA2cHggZm9yIGZsYXNoIHRvIHJ1biBmYXN0LCA+PSA4cHggdG8gc3RhcnQgdXAgdW5kZXIgRmlyZWZveC93aW4zMiBpbiBzb21lIGNhc2VzLiBvZGQ/IHllcy5cclxuICAgICAgICAgICAgICAnYm90dG9tJzogJzBweCcsXHJcbiAgICAgICAgICAgICAgJ2xlZnQnOiAnMHB4JyxcclxuICAgICAgICAgICAgICAnb3ZlcmZsb3cnOiAnaGlkZGVuJ1xyXG4gICAgICAgICAgICB9O1xyXG4gICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgLy8gaGlkZSBvZmYtc2NyZWVuLCBsb3dlciBwcmlvcml0eVxyXG4gICAgICAgICAgICBzID0ge1xyXG4gICAgICAgICAgICAgICdwb3NpdGlvbic6ICdhYnNvbHV0ZScsXHJcbiAgICAgICAgICAgICAgJ3dpZHRoJzogJzZweCcsXHJcbiAgICAgICAgICAgICAgJ2hlaWdodCc6ICc2cHgnLFxyXG4gICAgICAgICAgICAgICd0b3AnOiAnLTk5OTlweCcsXHJcbiAgICAgICAgICAgICAgJ2xlZnQnOiAnLTk5OTlweCdcclxuICAgICAgICAgICAgfTtcclxuICAgICAgICAgICAgaWYgKGlzUlRMKSB7XHJcbiAgICAgICAgICAgICAgcy5sZWZ0ID0gTWF0aC5hYnMocGFyc2VJbnQocy5sZWZ0LDEwKSkrJ3B4JztcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgaWYgKGlzV2Via2l0KSB7XHJcbiAgICAgICAgICAvLyBzb3VuZGNsb3VkLXJlcG9ydGVkIHJlbmRlci9jcmFzaCBmaXgsIHNhZmFyaSA1XHJcbiAgICAgICAgICBzbTIub01DLnN0eWxlLnpJbmRleCA9IDEwMDAwO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgaWYgKCFzbTIuZGVidWdGbGFzaCkge1xyXG4gICAgICAgICAgZm9yICh4IGluIHMpIHtcclxuICAgICAgICAgICAgaWYgKHMuaGFzT3duUHJvcGVydHkoeCkpIHtcclxuICAgICAgICAgICAgICBzbTIub01DLnN0eWxlW3hdID0gc1t4XTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgdHJ5IHtcclxuICAgICAgICAgIGlmICghaXNJRSkge1xyXG4gICAgICAgICAgICBzbTIub01DLmFwcGVuZENoaWxkKG9Nb3ZpZSk7XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgICBvVGFyZ2V0LmFwcGVuZENoaWxkKHNtMi5vTUMpO1xyXG4gICAgICAgICAgaWYgKGlzSUUpIHtcclxuICAgICAgICAgICAgb0VsID0gc20yLm9NQy5hcHBlbmRDaGlsZChkb2MuY3JlYXRlRWxlbWVudCgnZGl2JykpO1xyXG4gICAgICAgICAgICBvRWwuY2xhc3NOYW1lID0gc3dmQ1NTLnN3ZkJveDtcclxuICAgICAgICAgICAgb0VsLmlubmVySFRNTCA9IG1vdmllSFRNTDtcclxuICAgICAgICAgIH1cclxuICAgICAgICAgIGFwcGVuZFN1Y2Nlc3MgPSB0cnVlO1xyXG4gICAgICAgIH0gY2F0Y2goZSkge1xyXG4gICAgICAgICAgdGhyb3cgbmV3IEVycm9yKHN0cignZG9tRXJyb3InKSsnIFxcbicrZS50b1N0cmluZygpKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICB9IGVsc2Uge1xyXG5cclxuICAgICAgICAvLyBTTTIgY29udGFpbmVyIGlzIGFscmVhZHkgaW4gdGhlIGRvY3VtZW50IChlZy4gZmxhc2hibG9jayB1c2UgY2FzZSlcclxuICAgICAgICBzQ2xhc3MgPSBzbTIub01DLmNsYXNzTmFtZTtcclxuICAgICAgICBzbTIub01DLmNsYXNzTmFtZSA9IChzQ2xhc3M/c0NsYXNzKycgJzpzd2ZDU1Muc3dmRGVmYXVsdCkgKyAoZXh0cmFDbGFzcz8nICcrZXh0cmFDbGFzczonJyk7XHJcbiAgICAgICAgc20yLm9NQy5hcHBlbmRDaGlsZChvTW92aWUpO1xyXG4gICAgICAgIGlmIChpc0lFKSB7XHJcbiAgICAgICAgICBvRWwgPSBzbTIub01DLmFwcGVuZENoaWxkKGRvYy5jcmVhdGVFbGVtZW50KCdkaXYnKSk7XHJcbiAgICAgICAgICBvRWwuY2xhc3NOYW1lID0gc3dmQ1NTLnN3ZkJveDtcclxuICAgICAgICAgIG9FbC5pbm5lckhUTUwgPSBtb3ZpZUhUTUw7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGFwcGVuZFN1Y2Nlc3MgPSB0cnVlO1xyXG5cclxuICAgICAgfVxyXG5cclxuICAgIH1cclxuXHJcbiAgICBkaWRBcHBlbmQgPSB0cnVlO1xyXG4gICAgaW5pdE1zZygpO1xyXG4gICAgLy8gc20yLl93RChzbSArICc6IFRyeWluZyB0byBsb2FkICcgKyBzbVVSTCArICghb3ZlckhUVFAgJiYgc20yLmFsdFVSTCA/ICcgKGFsdGVybmF0ZSBVUkwpJyA6ICcnKSwgMSk7XHJcblxyXG4gICAgcmV0dXJuIHRydWU7XHJcblxyXG4gIH07XHJcblxyXG4gIGluaXRNb3ZpZSA9IGZ1bmN0aW9uKCkge1xyXG5cclxuICAgIGlmIChzbTIuaHRtbDVPbmx5KSB7XHJcbiAgICAgIGNyZWF0ZU1vdmllKCk7XHJcbiAgICAgIHJldHVybiBmYWxzZTtcclxuICAgIH1cclxuXHJcbiAgICAvLyBhdHRlbXB0IHRvIGdldCwgb3IgY3JlYXRlLCBtb3ZpZSAobWF5IGFscmVhZHkgZXhpc3QpXHJcbiAgICBpZiAoZmxhc2gpIHtcclxuICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgfVxyXG5cclxuICAgIGlmICghc20yLnVybCkge1xyXG5cclxuICAgICAgLyoqXHJcbiAgICAgICAqIFNvbWV0aGluZyBpc24ndCByaWdodCAtIHdlJ3ZlIHJlYWNoZWQgaW5pdCwgYnV0IHRoZSBzb3VuZE1hbmFnZXIgdXJsIHByb3BlcnR5IGhhcyBub3QgYmVlbiBzZXQuXHJcbiAgICAgICAqIFVzZXIgaGFzIG5vdCBjYWxsZWQgc2V0dXAoe3VybDogLi4ufSksIG9yIGhhcyBub3Qgc2V0IHNvdW5kTWFuYWdlci51cmwgKGxlZ2FjeSB1c2UgY2FzZSkgZGlyZWN0bHkgYmVmb3JlIGluaXQgdGltZS5cclxuICAgICAgICogTm90aWZ5IGFuZCBleGl0LiBJZiB1c2VyIGNhbGxzIHNldHVwKCkgd2l0aCBhIHVybDogcHJvcGVydHksIGluaXQgd2lsbCBiZSByZXN0YXJ0ZWQgYXMgaW4gdGhlIGRlZmVycmVkIGxvYWRpbmcgY2FzZS5cclxuICAgICAgICovXHJcblxyXG4gICAgICAgX3dEUygnbm9VUkwnKTtcclxuICAgICAgIHJldHVybiBmYWxzZTtcclxuXHJcbiAgICB9XHJcblxyXG4gICAgLy8gaW5saW5lIG1hcmt1cCBjYXNlXHJcbiAgICBmbGFzaCA9IHNtMi5nZXRNb3ZpZShzbTIuaWQpO1xyXG5cclxuICAgIGlmICghZmxhc2gpIHtcclxuICAgICAgaWYgKCFvUmVtb3ZlZCkge1xyXG4gICAgICAgIC8vIHRyeSB0byBjcmVhdGVcclxuICAgICAgICBjcmVhdGVNb3ZpZShzbTIuaWQsIHNtMi51cmwpO1xyXG4gICAgICB9IGVsc2Uge1xyXG4gICAgICAgIC8vIHRyeSB0byByZS1hcHBlbmQgcmVtb3ZlZCBtb3ZpZSBhZnRlciByZWJvb3QoKVxyXG4gICAgICAgIGlmICghaXNJRSkge1xyXG4gICAgICAgICAgc20yLm9NQy5hcHBlbmRDaGlsZChvUmVtb3ZlZCk7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgIHNtMi5vTUMuaW5uZXJIVE1MID0gb1JlbW92ZWRIVE1MO1xyXG4gICAgICAgIH1cclxuICAgICAgICBvUmVtb3ZlZCA9IG51bGw7XHJcbiAgICAgICAgZGlkQXBwZW5kID0gdHJ1ZTtcclxuICAgICAgfVxyXG4gICAgICBmbGFzaCA9IHNtMi5nZXRNb3ZpZShzbTIuaWQpO1xyXG4gICAgfVxyXG5cclxuICAgIGlmICh0eXBlb2Ygc20yLm9uaW5pdG1vdmllID09PSAnZnVuY3Rpb24nKSB7XHJcbiAgICAgIHNldFRpbWVvdXQoc20yLm9uaW5pdG1vdmllLCAxKTtcclxuICAgIH1cclxuXHJcbiAgICAvLyA8ZD5cclxuICAgIGZsdXNoTWVzc2FnZXMoKTtcclxuICAgIC8vIDwvZD5cclxuXHJcbiAgICByZXR1cm4gdHJ1ZTtcclxuXHJcbiAgfTtcclxuXHJcbiAgZGVsYXlXYWl0Rm9yRUkgPSBmdW5jdGlvbigpIHtcclxuXHJcbiAgICBzZXRUaW1lb3V0KHdhaXRGb3JFSSwgMTAwMCk7XHJcblxyXG4gIH07XHJcblxyXG4gIHJlYm9vdEludG9IVE1MNSA9IGZ1bmN0aW9uKCkge1xyXG5cclxuICAgIC8vIHNwZWNpYWwgY2FzZTogdHJ5IGZvciBhIHJlYm9vdCB3aXRoIHByZWZlckZsYXNoOiBmYWxzZSwgaWYgMTAwJSBIVE1MNSBtb2RlIGlzIHBvc3NpYmxlIGFuZCB1c2VGbGFzaEJsb2NrIGlzIG5vdCBlbmFibGVkLlxyXG5cclxuICAgIHdpbmRvdy5zZXRUaW1lb3V0KGZ1bmN0aW9uKCkge1xyXG5cclxuICAgICAgY29tcGxhaW4oc21jICsgJ3VzZUZsYXNoQmxvY2sgaXMgZmFsc2UsIDEwMCUgSFRNTDUgbW9kZSBpcyBwb3NzaWJsZS4gUmVib290aW5nIHdpdGggcHJlZmVyRmxhc2g6IGZhbHNlLi4uJyk7XHJcblxyXG4gICAgICBzbTIuc2V0dXAoe1xyXG4gICAgICAgIHByZWZlckZsYXNoOiBmYWxzZVxyXG4gICAgICB9KS5yZWJvb3QoKTtcclxuXHJcbiAgICAgIC8vIGlmIGZvciBzb21lIHJlYXNvbiB5b3Ugd2FudCB0byBkZXRlY3QgdGhpcyBjYXNlLCB1c2UgYW4gb250aW1lb3V0KCkgY2FsbGJhY2sgYW5kIGxvb2sgZm9yIGh0bWw1T25seSBhbmQgZGlkRmxhc2hCbG9jayA9PSB0cnVlLlxyXG4gICAgICBzbTIuZGlkRmxhc2hCbG9jayA9IHRydWU7XHJcblxyXG4gICAgICBzbTIuYmVnaW5EZWxheWVkSW5pdCgpO1xyXG5cclxuICAgIH0sIDEpO1xyXG5cclxuICB9O1xyXG5cclxuICB3YWl0Rm9yRUkgPSBmdW5jdGlvbigpIHtcclxuXHJcbiAgICB2YXIgcCxcclxuICAgICAgICBsb2FkSW5jb21wbGV0ZSA9IGZhbHNlO1xyXG5cclxuICAgIGlmICghc20yLnVybCkge1xyXG4gICAgICAvLyBObyBTV0YgdXJsIHRvIGxvYWQgKG5vVVJMIGNhc2UpIC0gZXhpdCBmb3Igbm93LiBXaWxsIGJlIHJldHJpZWQgd2hlbiB1cmwgaXMgc2V0LlxyXG4gICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICB9XHJcblxyXG4gICAgaWYgKHdhaXRpbmdGb3JFSSkge1xyXG4gICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICB9XHJcblxyXG4gICAgd2FpdGluZ0ZvckVJID0gdHJ1ZTtcclxuICAgIGV2ZW50LnJlbW92ZSh3aW5kb3csICdsb2FkJywgZGVsYXlXYWl0Rm9yRUkpO1xyXG5cclxuICAgIGlmIChoYXNGbGFzaCAmJiB0cnlJbml0T25Gb2N1cyAmJiAhaXNGb2N1c2VkKSB7XHJcbiAgICAgIC8vIFNhZmFyaSB3b24ndCBsb2FkIGZsYXNoIGluIGJhY2tncm91bmQgdGFicywgb25seSB3aGVuIGZvY3VzZWQuXHJcbiAgICAgIF93RFMoJ3dhaXRGb2N1cycpO1xyXG4gICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICB9XHJcblxyXG4gICAgaWYgKCFkaWRJbml0KSB7XHJcbiAgICAgIHAgPSBzbTIuZ2V0TW92aWVQZXJjZW50KCk7XHJcbiAgICAgIGlmIChwID4gMCAmJiBwIDwgMTAwKSB7XHJcbiAgICAgICAgbG9hZEluY29tcGxldGUgPSB0cnVlO1xyXG4gICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgc2V0VGltZW91dChmdW5jdGlvbigpIHtcclxuXHJcbiAgICAgIHAgPSBzbTIuZ2V0TW92aWVQZXJjZW50KCk7XHJcblxyXG4gICAgICBpZiAobG9hZEluY29tcGxldGUpIHtcclxuICAgICAgICAvLyBzcGVjaWFsIGNhc2U6IGlmIG1vdmllICpwYXJ0aWFsbHkqIGxvYWRlZCwgcmV0cnkgdW50aWwgaXQncyAxMDAlIGJlZm9yZSBhc3N1bWluZyBmYWlsdXJlLlxyXG4gICAgICAgIHdhaXRpbmdGb3JFSSA9IGZhbHNlO1xyXG4gICAgICAgIHNtMi5fd0Qoc3RyKCd3YWl0U1dGJykpO1xyXG4gICAgICAgIHdpbmRvdy5zZXRUaW1lb3V0KGRlbGF5V2FpdEZvckVJLCAxKTtcclxuICAgICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIC8vIDxkPlxyXG4gICAgICBpZiAoIWRpZEluaXQpIHtcclxuXHJcbiAgICAgICAgc20yLl93RChzbSArICc6IE5vIEZsYXNoIHJlc3BvbnNlIHdpdGhpbiBleHBlY3RlZCB0aW1lLiBMaWtlbHkgY2F1c2VzOiAnICsgKHAgPT09IDAgPyAnU1dGIGxvYWQgZmFpbGVkLCAnOicnKSArICdGbGFzaCBibG9ja2VkIG9yIEpTLUZsYXNoIHNlY3VyaXR5IGVycm9yLicgKyAoc20yLmRlYnVnRmxhc2g/JyAnICsgc3RyKCdjaGVja1NXRicpOicnKSwgMik7XHJcblxyXG4gICAgICAgIGlmICghb3ZlckhUVFAgJiYgcCkge1xyXG5cclxuICAgICAgICAgIF93RFMoJ2xvY2FsRmFpbCcsIDIpO1xyXG5cclxuICAgICAgICAgIGlmICghc20yLmRlYnVnRmxhc2gpIHtcclxuICAgICAgICAgICAgX3dEUygndHJ5RGVidWcnLCAyKTtcclxuICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBpZiAocCA9PT0gMCkge1xyXG5cclxuICAgICAgICAgIC8vIGlmIDAgKG5vdCBudWxsKSwgcHJvYmFibHkgYSA0MDQuXHJcbiAgICAgICAgICBzbTIuX3dEKHN0cignc3dmNDA0Jywgc20yLnVybCksIDEpO1xyXG5cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGRlYnVnVFMoJ2ZsYXNodG9qcycsIGZhbHNlLCAnOiBUaW1lZCBvdXQnICsgb3ZlckhUVFA/JyAoQ2hlY2sgZmxhc2ggc2VjdXJpdHkgb3IgZmxhc2ggYmxvY2tlcnMpJzonIChObyBwbHVnaW4vbWlzc2luZyBTV0Y/KScpO1xyXG5cclxuICAgICAgfVxyXG4gICAgICAvLyA8L2Q+XHJcblxyXG4gICAgICAvLyBnaXZlIHVwIC8gdGltZS1vdXQsIGRlcGVuZGluZ1xyXG5cclxuICAgICAgaWYgKCFkaWRJbml0ICYmIG9rVG9EaXNhYmxlKSB7XHJcblxyXG4gICAgICAgIGlmIChwID09PSBudWxsKSB7XHJcblxyXG4gICAgICAgICAgLy8gU1dGIGZhaWxlZCB0byByZXBvcnQgbG9hZCBwcm9ncmVzcy4gUG9zc2libHkgYmxvY2tlZC5cclxuXHJcbiAgICAgICAgICBpZiAoc20yLnVzZUZsYXNoQmxvY2sgfHwgc20yLmZsYXNoTG9hZFRpbWVvdXQgPT09IDApIHtcclxuXHJcbiAgICAgICAgICAgIGlmIChzbTIudXNlRmxhc2hCbG9jaykge1xyXG5cclxuICAgICAgICAgICAgICBmbGFzaEJsb2NrSGFuZGxlcigpO1xyXG5cclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgX3dEUygnd2FpdEZvcmV2ZXInKTtcclxuXHJcbiAgICAgICAgICB9IGVsc2Uge1xyXG5cclxuICAgICAgICAgICAgLy8gbm8gY3VzdG9tIGZsYXNoIGJsb2NrIGhhbmRsaW5nLCBidXQgU1dGIGhhcyB0aW1lZCBvdXQuIFdpbGwgcmVjb3ZlciBpZiB1c2VyIHVuYmxvY2tzIC8gYWxsb3dzIFNXRiBsb2FkLlxyXG5cclxuICAgICAgICAgICAgaWYgKCFzbTIudXNlRmxhc2hCbG9jayAmJiBjYW5JZ25vcmVGbGFzaCkge1xyXG5cclxuICAgICAgICAgICAgICByZWJvb3RJbnRvSFRNTDUoKTtcclxuXHJcbiAgICAgICAgICAgIH0gZWxzZSB7XHJcblxyXG4gICAgICAgICAgICAgIF93RFMoJ3dhaXRGb3JldmVyJyk7XHJcblxyXG4gICAgICAgICAgICAgIC8vIGZpcmUgYW55IHJlZ3VsYXIgcmVnaXN0ZXJlZCBvbnRpbWVvdXQoKSBsaXN0ZW5lcnMuXHJcbiAgICAgICAgICAgICAgcHJvY2Vzc09uRXZlbnRzKHt0eXBlOidvbnRpbWVvdXQnLCBpZ25vcmVJbml0OiB0cnVlLCBlcnJvcjoge3R5cGU6ICdJTklUX0ZMQVNIQkxPQ0snfX0pO1xyXG5cclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgfSBlbHNlIHtcclxuXHJcbiAgICAgICAgICAvLyBTV0YgbG9hZGVkPyBTaG91bGRuJ3QgYmUgYSBibG9ja2luZyBpc3N1ZSwgdGhlbi5cclxuXHJcbiAgICAgICAgICBpZiAoc20yLmZsYXNoTG9hZFRpbWVvdXQgPT09IDApIHtcclxuXHJcbiAgICAgICAgICAgIF93RFMoJ3dhaXRGb3JldmVyJyk7XHJcblxyXG4gICAgICAgICAgfSBlbHNlIHtcclxuXHJcbiAgICAgICAgICAgIGlmICghc20yLnVzZUZsYXNoQmxvY2sgJiYgY2FuSWdub3JlRmxhc2gpIHtcclxuXHJcbiAgICAgICAgICAgICAgcmVib290SW50b0hUTUw1KCk7XHJcblxyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG5cclxuICAgICAgICAgICAgICBmYWlsU2FmZWx5KHRydWUpO1xyXG5cclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgfVxyXG5cclxuICAgIH0sIHNtMi5mbGFzaExvYWRUaW1lb3V0KTtcclxuXHJcbiAgfTtcclxuXHJcbiAgaGFuZGxlRm9jdXMgPSBmdW5jdGlvbigpIHtcclxuXHJcbiAgICBmdW5jdGlvbiBjbGVhbnVwKCkge1xyXG4gICAgICBldmVudC5yZW1vdmUod2luZG93LCAnZm9jdXMnLCBoYW5kbGVGb2N1cyk7XHJcbiAgICB9XHJcblxyXG4gICAgaWYgKGlzRm9jdXNlZCB8fCAhdHJ5SW5pdE9uRm9jdXMpIHtcclxuICAgICAgLy8gYWxyZWFkeSBmb2N1c2VkLCBvciBub3Qgc3BlY2lhbCBTYWZhcmkgYmFja2dyb3VuZCB0YWIgY2FzZVxyXG4gICAgICBjbGVhbnVwKCk7XHJcbiAgICAgIHJldHVybiB0cnVlO1xyXG4gICAgfVxyXG5cclxuICAgIG9rVG9EaXNhYmxlID0gdHJ1ZTtcclxuICAgIGlzRm9jdXNlZCA9IHRydWU7XHJcbiAgICBfd0RTKCdnb3RGb2N1cycpO1xyXG5cclxuICAgIC8vIGFsbG93IGluaXQgdG8gcmVzdGFydFxyXG4gICAgd2FpdGluZ0ZvckVJID0gZmFsc2U7XHJcblxyXG4gICAgLy8ga2ljayBvZmYgRXh0ZXJuYWxJbnRlcmZhY2UgdGltZW91dCwgbm93IHRoYXQgdGhlIFNXRiBoYXMgc3RhcnRlZFxyXG4gICAgZGVsYXlXYWl0Rm9yRUkoKTtcclxuXHJcbiAgICBjbGVhbnVwKCk7XHJcbiAgICByZXR1cm4gdHJ1ZTtcclxuXHJcbiAgfTtcclxuXHJcbiAgZmx1c2hNZXNzYWdlcyA9IGZ1bmN0aW9uKCkge1xyXG5cclxuICAgIC8vIDxkPlxyXG5cclxuICAgIC8vIFNNMiBwcmUtaW5pdCBkZWJ1ZyBtZXNzYWdlc1xyXG4gICAgaWYgKG1lc3NhZ2VzLmxlbmd0aCkge1xyXG4gICAgICBzbTIuX3dEKCdTb3VuZE1hbmFnZXIgMjogJyArIG1lc3NhZ2VzLmpvaW4oJyAnKSwgMSk7XHJcbiAgICAgIG1lc3NhZ2VzID0gW107XHJcbiAgICB9XHJcblxyXG4gICAgLy8gPC9kPlxyXG5cclxuICB9O1xyXG5cclxuICBzaG93U3VwcG9ydCA9IGZ1bmN0aW9uKCkge1xyXG5cclxuICAgIC8vIDxkPlxyXG5cclxuICAgIGZsdXNoTWVzc2FnZXMoKTtcclxuXHJcbiAgICB2YXIgaXRlbSwgdGVzdHMgPSBbXTtcclxuXHJcbiAgICBpZiAoc20yLnVzZUhUTUw1QXVkaW8gJiYgc20yLmhhc0hUTUw1KSB7XHJcbiAgICAgIGZvciAoaXRlbSBpbiBzbTIuYXVkaW9Gb3JtYXRzKSB7XHJcbiAgICAgICAgaWYgKHNtMi5hdWRpb0Zvcm1hdHMuaGFzT3duUHJvcGVydHkoaXRlbSkpIHtcclxuICAgICAgICAgIHRlc3RzLnB1c2goaXRlbSArICcgPSAnICsgc20yLmh0bWw1W2l0ZW1dICsgKCFzbTIuaHRtbDVbaXRlbV0gJiYgbmVlZHNGbGFzaCAmJiBzbTIuZmxhc2hbaXRlbV0gPyAnICh1c2luZyBmbGFzaCknIDogKHNtMi5wcmVmZXJGbGFzaCAmJiBzbTIuZmxhc2hbaXRlbV0gJiYgbmVlZHNGbGFzaCA/ICcgKHByZWZlcnJpbmcgZmxhc2gpJzogKCFzbTIuaHRtbDVbaXRlbV0gPyAnICgnICsgKHNtMi5hdWRpb0Zvcm1hdHNbaXRlbV0ucmVxdWlyZWQgPyAncmVxdWlyZWQsICc6JycpICsgJ2FuZCBubyBmbGFzaCBzdXBwb3J0KScgOiAnJykpKSk7XHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcbiAgICAgIHNtMi5fd0QoJ1NvdW5kTWFuYWdlciAyIEhUTUw1IHN1cHBvcnQ6ICcgKyB0ZXN0cy5qb2luKCcsICcpLCAxKTtcclxuICAgIH1cclxuXHJcbiAgICAvLyA8L2Q+XHJcblxyXG4gIH07XHJcblxyXG4gIGluaXRDb21wbGV0ZSA9IGZ1bmN0aW9uKGJOb0Rpc2FibGUpIHtcclxuXHJcbiAgICBpZiAoZGlkSW5pdCkge1xyXG4gICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICB9XHJcblxyXG4gICAgaWYgKHNtMi5odG1sNU9ubHkpIHtcclxuICAgICAgLy8gYWxsIGdvb2QuXHJcbiAgICAgIF93RFMoJ3NtMkxvYWRlZCcsIDEpO1xyXG4gICAgICBkaWRJbml0ID0gdHJ1ZTtcclxuICAgICAgaW5pdFVzZXJPbmxvYWQoKTtcclxuICAgICAgZGVidWdUUygnb25sb2FkJywgdHJ1ZSk7XHJcbiAgICAgIHJldHVybiB0cnVlO1xyXG4gICAgfVxyXG5cclxuICAgIHZhciB3YXNUaW1lb3V0ID0gKHNtMi51c2VGbGFzaEJsb2NrICYmIHNtMi5mbGFzaExvYWRUaW1lb3V0ICYmICFzbTIuZ2V0TW92aWVQZXJjZW50KCkpLFxyXG4gICAgICAgIHJlc3VsdCA9IHRydWUsXHJcbiAgICAgICAgZXJyb3I7XHJcblxyXG4gICAgaWYgKCF3YXNUaW1lb3V0KSB7XHJcbiAgICAgIGRpZEluaXQgPSB0cnVlO1xyXG4gICAgfVxyXG5cclxuICAgIGVycm9yID0ge3R5cGU6ICghaGFzRmxhc2ggJiYgbmVlZHNGbGFzaCA/ICdOT19GTEFTSCcgOiAnSU5JVF9USU1FT1VUJyl9O1xyXG5cclxuICAgIHNtMi5fd0QoJ1NvdW5kTWFuYWdlciAyICcgKyAoZGlzYWJsZWQgPyAnZmFpbGVkIHRvIGxvYWQnIDogJ2xvYWRlZCcpICsgJyAoJyArIChkaXNhYmxlZCA/ICdGbGFzaCBzZWN1cml0eS9sb2FkIGVycm9yJyA6ICdPSycpICsgJykgJyArIFN0cmluZy5mcm9tQ2hhckNvZGUoZGlzYWJsZWQgPyAxMDAwNiA6IDEwMDAzKSwgZGlzYWJsZWQgPyAyOiAxKTtcclxuXHJcbiAgICBpZiAoZGlzYWJsZWQgfHwgYk5vRGlzYWJsZSkge1xyXG4gICAgICBpZiAoc20yLnVzZUZsYXNoQmxvY2sgJiYgc20yLm9NQykge1xyXG4gICAgICAgIHNtMi5vTUMuY2xhc3NOYW1lID0gZ2V0U1dGQ1NTKCkgKyAnICcgKyAoc20yLmdldE1vdmllUGVyY2VudCgpID09PSBudWxsP3N3ZkNTUy5zd2ZUaW1lZG91dDpzd2ZDU1Muc3dmRXJyb3IpO1xyXG4gICAgICB9XHJcbiAgICAgIHByb2Nlc3NPbkV2ZW50cyh7dHlwZTonb250aW1lb3V0JywgZXJyb3I6ZXJyb3IsIGlnbm9yZUluaXQ6IHRydWV9KTtcclxuICAgICAgZGVidWdUUygnb25sb2FkJywgZmFsc2UpO1xyXG4gICAgICBjYXRjaEVycm9yKGVycm9yKTtcclxuICAgICAgcmVzdWx0ID0gZmFsc2U7XHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICBkZWJ1Z1RTKCdvbmxvYWQnLCB0cnVlKTtcclxuICAgIH1cclxuXHJcbiAgICBpZiAoIWRpc2FibGVkKSB7XHJcbiAgICAgIGlmIChzbTIud2FpdEZvcldpbmRvd0xvYWQgJiYgIXdpbmRvd0xvYWRlZCkge1xyXG4gICAgICAgIF93RFMoJ3dhaXRPbmxvYWQnKTtcclxuICAgICAgICBldmVudC5hZGQod2luZG93LCAnbG9hZCcsIGluaXRVc2VyT25sb2FkKTtcclxuICAgICAgfSBlbHNlIHtcclxuICAgICAgICAvLyA8ZD5cclxuICAgICAgICBpZiAoc20yLndhaXRGb3JXaW5kb3dMb2FkICYmIHdpbmRvd0xvYWRlZCkge1xyXG4gICAgICAgICAgX3dEUygnZG9jTG9hZGVkJyk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIC8vIDwvZD5cclxuICAgICAgICBpbml0VXNlck9ubG9hZCgpO1xyXG4gICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgcmV0dXJuIHJlc3VsdDtcclxuXHJcbiAgfTtcclxuXHJcbiAgLyoqXHJcbiAgICogYXBwbHkgdG9wLWxldmVsIHNldHVwT3B0aW9ucyBvYmplY3QgYXMgbG9jYWwgcHJvcGVydGllcywgZWcuLCB0aGlzLnNldHVwT3B0aW9ucy5mbGFzaFZlcnNpb24gLT4gdGhpcy5mbGFzaFZlcnNpb24gKHNvdW5kTWFuYWdlci5mbGFzaFZlcnNpb24pXHJcbiAgICogdGhpcyBtYWludGFpbnMgYmFja3dhcmQgY29tcGF0aWJpbGl0eSwgYW5kIGFsbG93cyBwcm9wZXJ0aWVzIHRvIGJlIGRlZmluZWQgc2VwYXJhdGVseSBmb3IgdXNlIGJ5IHNvdW5kTWFuYWdlci5zZXR1cCgpLlxyXG4gICAqL1xyXG5cclxuICBzZXRQcm9wZXJ0aWVzID0gZnVuY3Rpb24oKSB7XHJcblxyXG4gICAgdmFyIGksXHJcbiAgICAgICAgbyA9IHNtMi5zZXR1cE9wdGlvbnM7XHJcblxyXG4gICAgZm9yIChpIGluIG8pIHtcclxuXHJcbiAgICAgIGlmIChvLmhhc093blByb3BlcnR5KGkpKSB7XHJcblxyXG4gICAgICAgIC8vIGFzc2lnbiBsb2NhbCBwcm9wZXJ0eSBpZiBub3QgYWxyZWFkeSBkZWZpbmVkXHJcblxyXG4gICAgICAgIGlmIChzbTJbaV0gPT09IF91bmRlZmluZWQpIHtcclxuXHJcbiAgICAgICAgICBzbTJbaV0gPSBvW2ldO1xyXG5cclxuICAgICAgICB9IGVsc2UgaWYgKHNtMltpXSAhPT0gb1tpXSkge1xyXG5cclxuICAgICAgICAgIC8vIGxlZ2FjeSBzdXBwb3J0OiB3cml0ZSBtYW51YWxseS1hc3NpZ25lZCBwcm9wZXJ0eSAoZWcuLCBzb3VuZE1hbmFnZXIudXJsKSBiYWNrIHRvIHNldHVwT3B0aW9ucyB0byBrZWVwIHRoaW5ncyBpbiBzeW5jXHJcbiAgICAgICAgICBzbTIuc2V0dXBPcHRpb25zW2ldID0gc20yW2ldO1xyXG5cclxuICAgICAgICB9XHJcblxyXG4gICAgICB9XHJcblxyXG4gICAgfVxyXG5cclxuICB9O1xyXG5cclxuXHJcbiAgaW5pdCA9IGZ1bmN0aW9uKCkge1xyXG5cclxuICAgIC8vIGNhbGxlZCBhZnRlciBvbmxvYWQoKVxyXG5cclxuICAgIGlmIChkaWRJbml0KSB7XHJcbiAgICAgIF93RFMoJ2RpZEluaXQnKTtcclxuICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgfVxyXG5cclxuICAgIGZ1bmN0aW9uIGNsZWFudXAoKSB7XHJcbiAgICAgIGV2ZW50LnJlbW92ZSh3aW5kb3csICdsb2FkJywgc20yLmJlZ2luRGVsYXllZEluaXQpO1xyXG4gICAgfVxyXG5cclxuICAgIGlmIChzbTIuaHRtbDVPbmx5KSB7XHJcbiAgICAgIGlmICghZGlkSW5pdCkge1xyXG4gICAgICAgIC8vIHdlIGRvbid0IG5lZWQgbm8gc3RlZW5raW5nIGZsYXNoIVxyXG4gICAgICAgIGNsZWFudXAoKTtcclxuICAgICAgICBzbTIuZW5hYmxlZCA9IHRydWU7XHJcbiAgICAgICAgaW5pdENvbXBsZXRlKCk7XHJcbiAgICAgIH1cclxuICAgICAgcmV0dXJuIHRydWU7XHJcbiAgICB9XHJcblxyXG4gICAgLy8gZmxhc2ggcGF0aFxyXG4gICAgaW5pdE1vdmllKCk7XHJcblxyXG4gICAgdHJ5IHtcclxuXHJcbiAgICAgIC8vIGF0dGVtcHQgdG8gdGFsayB0byBGbGFzaFxyXG4gICAgICBmbGFzaC5fZXh0ZXJuYWxJbnRlcmZhY2VUZXN0KGZhbHNlKTtcclxuXHJcbiAgICAgIC8vIGFwcGx5IHVzZXItc3BlY2lmaWVkIHBvbGxpbmcgaW50ZXJ2YWwsIE9SLCBpZiBcImhpZ2ggcGVyZm9ybWFuY2VcIiBzZXQsIGZhc3RlciB2cy4gZGVmYXVsdCBwb2xsaW5nXHJcbiAgICAgIC8vIChkZXRlcm1pbmVzIGZyZXF1ZW5jeSBvZiB3aGlsZWxvYWRpbmcvd2hpbGVwbGF5aW5nIGNhbGxiYWNrcywgZWZmZWN0aXZlbHkgZHJpdmluZyBVSSBmcmFtZXJhdGVzKVxyXG4gICAgICBzZXRQb2xsaW5nKHRydWUsIChzbTIuZmxhc2hQb2xsaW5nSW50ZXJ2YWwgfHwgKHNtMi51c2VIaWdoUGVyZm9ybWFuY2UgPyAxMCA6IDUwKSkpO1xyXG5cclxuICAgICAgaWYgKCFzbTIuZGVidWdNb2RlKSB7XHJcbiAgICAgICAgLy8gc3RvcCB0aGUgU1dGIGZyb20gbWFraW5nIGRlYnVnIG91dHB1dCBjYWxscyB0byBKU1xyXG4gICAgICAgIGZsYXNoLl9kaXNhYmxlRGVidWcoKTtcclxuICAgICAgfVxyXG5cclxuICAgICAgc20yLmVuYWJsZWQgPSB0cnVlO1xyXG4gICAgICBkZWJ1Z1RTKCdqc3RvZmxhc2gnLCB0cnVlKTtcclxuXHJcbiAgICAgIGlmICghc20yLmh0bWw1T25seSkge1xyXG4gICAgICAgIC8vIHByZXZlbnQgYnJvd3NlciBmcm9tIHNob3dpbmcgY2FjaGVkIHBhZ2Ugc3RhdGUgKG9yIHJhdGhlciwgcmVzdG9yaW5nIFwic3VzcGVuZGVkXCIgcGFnZSBzdGF0ZSkgdmlhIGJhY2sgYnV0dG9uLCBiZWNhdXNlIGZsYXNoIG1heSBiZSBkZWFkXHJcbiAgICAgICAgLy8gaHR0cDovL3d3dy53ZWJraXQub3JnL2Jsb2cvNTE2L3dlYmtpdC1wYWdlLWNhY2hlLWlpLXRoZS11bmxvYWQtZXZlbnQvXHJcbiAgICAgICAgZXZlbnQuYWRkKHdpbmRvdywgJ3VubG9hZCcsIGRvTm90aGluZyk7XHJcbiAgICAgIH1cclxuXHJcbiAgICB9IGNhdGNoKGUpIHtcclxuXHJcbiAgICAgIHNtMi5fd0QoJ2pzL2ZsYXNoIGV4Y2VwdGlvbjogJyArIGUudG9TdHJpbmcoKSk7XHJcbiAgICAgIGRlYnVnVFMoJ2pzdG9mbGFzaCcsIGZhbHNlKTtcclxuICAgICAgY2F0Y2hFcnJvcih7dHlwZTonSlNfVE9fRkxBU0hfRVhDRVBUSU9OJywgZmF0YWw6dHJ1ZX0pO1xyXG4gICAgICAvLyBkb24ndCBkaXNhYmxlLCBmb3IgcmVib290KClcclxuICAgICAgZmFpbFNhZmVseSh0cnVlKTtcclxuICAgICAgaW5pdENvbXBsZXRlKCk7XHJcblxyXG4gICAgICByZXR1cm4gZmFsc2U7XHJcblxyXG4gICAgfVxyXG5cclxuICAgIGluaXRDb21wbGV0ZSgpO1xyXG5cclxuICAgIC8vIGRpc2Nvbm5lY3QgZXZlbnRzXHJcbiAgICBjbGVhbnVwKCk7XHJcblxyXG4gICAgcmV0dXJuIHRydWU7XHJcblxyXG4gIH07XHJcblxyXG4gIGRvbUNvbnRlbnRMb2FkZWQgPSBmdW5jdGlvbigpIHtcclxuXHJcbiAgICBpZiAoZGlkRENMb2FkZWQpIHtcclxuICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgfVxyXG5cclxuICAgIGRpZERDTG9hZGVkID0gdHJ1ZTtcclxuXHJcbiAgICAvLyBhc3NpZ24gdG9wLWxldmVsIHNvdW5kTWFuYWdlciBwcm9wZXJ0aWVzIGVnLiBzb3VuZE1hbmFnZXIudXJsXHJcbiAgICBzZXRQcm9wZXJ0aWVzKCk7XHJcblxyXG4gICAgaW5pdERlYnVnKCk7XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBUZW1wb3JhcnkgZmVhdHVyZTogYWxsb3cgZm9yY2Ugb2YgSFRNTDUgdmlhIFVSTCBwYXJhbXM6IHNtMi11c2VodG1sNWF1ZGlvPTAgb3IgMVxyXG4gICAgICogRGl0dG8gZm9yIHNtMi1wcmVmZXJGbGFzaCwgdG9vLlxyXG4gICAgICovXHJcbiAgICAvLyA8ZD5cclxuICAgIChmdW5jdGlvbigpe1xyXG5cclxuICAgICAgdmFyIGEgPSAnc20yLXVzZWh0bWw1YXVkaW89JyxcclxuICAgICAgICAgIGEyID0gJ3NtMi1wcmVmZXJmbGFzaD0nLFxyXG4gICAgICAgICAgYiA9IG51bGwsXHJcbiAgICAgICAgICBiMiA9IG51bGwsXHJcbiAgICAgICAgICBsID0gd2wudG9Mb3dlckNhc2UoKTtcclxuXHJcbiAgICAgIGlmIChsLmluZGV4T2YoYSkgIT09IC0xKSB7XHJcbiAgICAgICAgYiA9IChsLmNoYXJBdChsLmluZGV4T2YoYSkrYS5sZW5ndGgpID09PSAnMScpO1xyXG4gICAgICAgIGlmIChoYXNDb25zb2xlKSB7XHJcbiAgICAgICAgICBjb25zb2xlLmxvZygoYj8nRW5hYmxpbmcgJzonRGlzYWJsaW5nICcpKyd1c2VIVE1MNUF1ZGlvIHZpYSBVUkwgcGFyYW1ldGVyJyk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHNtMi5zZXR1cCh7XHJcbiAgICAgICAgICAndXNlSFRNTDVBdWRpbyc6IGJcclxuICAgICAgICB9KTtcclxuICAgICAgfVxyXG5cclxuICAgICAgaWYgKGwuaW5kZXhPZihhMikgIT09IC0xKSB7XHJcbiAgICAgICAgYjIgPSAobC5jaGFyQXQobC5pbmRleE9mKGEyKSthMi5sZW5ndGgpID09PSAnMScpO1xyXG4gICAgICAgIGlmIChoYXNDb25zb2xlKSB7XHJcbiAgICAgICAgICBjb25zb2xlLmxvZygoYjI/J0VuYWJsaW5nICc6J0Rpc2FibGluZyAnKSsncHJlZmVyRmxhc2ggdmlhIFVSTCBwYXJhbWV0ZXInKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgc20yLnNldHVwKHtcclxuICAgICAgICAgICdwcmVmZXJGbGFzaCc6IGIyXHJcbiAgICAgICAgfSk7XHJcbiAgICAgIH1cclxuXHJcbiAgICB9KCkpO1xyXG4gICAgLy8gPC9kPlxyXG5cclxuICAgIGlmICghaGFzRmxhc2ggJiYgc20yLmhhc0hUTUw1KSB7XHJcbiAgICAgIHNtMi5fd0QoJ1NvdW5kTWFuYWdlciAyOiBObyBGbGFzaCBkZXRlY3RlZCcgKyAoIXNtMi51c2VIVE1MNUF1ZGlvID8gJywgZW5hYmxpbmcgSFRNTDUuJyA6ICcuIFRyeWluZyBIVE1MNS1vbmx5IG1vZGUuJyksIDEpO1xyXG4gICAgICBzbTIuc2V0dXAoe1xyXG4gICAgICAgICd1c2VIVE1MNUF1ZGlvJzogdHJ1ZSxcclxuICAgICAgICAvLyBtYWtlIHN1cmUgd2UgYXJlbid0IHByZWZlcnJpbmcgZmxhc2gsIGVpdGhlclxyXG4gICAgICAgIC8vIFRPRE86IHByZWZlckZsYXNoIHNob3VsZCBub3QgbWF0dGVyIGlmIGZsYXNoIGlzIG5vdCBpbnN0YWxsZWQuIEN1cnJlbnRseSwgc3R1ZmYgYnJlYWtzIHdpdGhvdXQgdGhlIGJlbG93IHR3ZWFrLlxyXG4gICAgICAgICdwcmVmZXJGbGFzaCc6IGZhbHNlXHJcbiAgICAgIH0pO1xyXG4gICAgfVxyXG5cclxuICAgIHRlc3RIVE1MNSgpO1xyXG5cclxuICAgIGlmICghaGFzRmxhc2ggJiYgbmVlZHNGbGFzaCkge1xyXG4gICAgICBtZXNzYWdlcy5wdXNoKHN0cmluZ3MubmVlZEZsYXNoKTtcclxuICAgICAgLy8gVE9ETzogRmF0YWwgaGVyZSB2cy4gdGltZW91dCBhcHByb2FjaCwgZXRjLlxyXG4gICAgICAvLyBoYWNrOiBmYWlsIHNvb25lci5cclxuICAgICAgc20yLnNldHVwKHtcclxuICAgICAgICAnZmxhc2hMb2FkVGltZW91dCc6IDFcclxuICAgICAgfSk7XHJcbiAgICB9XHJcblxyXG4gICAgaWYgKGRvYy5yZW1vdmVFdmVudExpc3RlbmVyKSB7XHJcbiAgICAgIGRvYy5yZW1vdmVFdmVudExpc3RlbmVyKCdET01Db250ZW50TG9hZGVkJywgZG9tQ29udGVudExvYWRlZCwgZmFsc2UpO1xyXG4gICAgfVxyXG5cclxuICAgIGluaXRNb3ZpZSgpO1xyXG5cclxuICAgIHJldHVybiB0cnVlO1xyXG5cclxuICB9O1xyXG5cclxuICBkb21Db250ZW50TG9hZGVkSUUgPSBmdW5jdGlvbigpIHtcclxuXHJcbiAgICBpZiAoZG9jLnJlYWR5U3RhdGUgPT09ICdjb21wbGV0ZScpIHtcclxuICAgICAgZG9tQ29udGVudExvYWRlZCgpO1xyXG4gICAgICBkb2MuZGV0YWNoRXZlbnQoJ29ucmVhZHlzdGF0ZWNoYW5nZScsIGRvbUNvbnRlbnRMb2FkZWRJRSk7XHJcbiAgICB9XHJcblxyXG4gICAgcmV0dXJuIHRydWU7XHJcblxyXG4gIH07XHJcblxyXG4gIHdpbk9uTG9hZCA9IGZ1bmN0aW9uKCkge1xyXG5cclxuICAgIC8vIGNhdGNoIGVkZ2UgY2FzZSBvZiBpbml0Q29tcGxldGUoKSBmaXJpbmcgYWZ0ZXIgd2luZG93LmxvYWQoKVxyXG4gICAgd2luZG93TG9hZGVkID0gdHJ1ZTtcclxuXHJcbiAgICAvLyBjYXRjaCBjYXNlIHdoZXJlIERPTUNvbnRlbnRMb2FkZWQgaGFzIGJlZW4gc2VudCwgYnV0IHdlJ3JlIHN0aWxsIGluIGRvYy5yZWFkeVN0YXRlID0gJ2ludGVyYWN0aXZlJ1xyXG4gICAgZG9tQ29udGVudExvYWRlZCgpO1xyXG5cclxuICAgIGV2ZW50LnJlbW92ZSh3aW5kb3csICdsb2FkJywgd2luT25Mb2FkKTtcclxuXHJcbiAgfTtcclxuXHJcbiAgLyoqXHJcbiAgICogbWlzY2VsbGFuZW91cyBydW4tdGltZSwgcHJlLWluaXQgc3R1ZmZcclxuICAgKi9cclxuXHJcbiAgcHJlSW5pdCA9IGZ1bmN0aW9uKCkge1xyXG5cclxuICAgIGlmIChtb2JpbGVIVE1MNSkge1xyXG5cclxuICAgICAgLy8gcHJlZmVyIEhUTUw1IGZvciBtb2JpbGUgKyB0YWJsZXQtbGlrZSBkZXZpY2VzLCBwcm9iYWJseSBtb3JlIHJlbGlhYmxlIHZzLiBmbGFzaCBhdCB0aGlzIHBvaW50LlxyXG5cclxuICAgICAgLy8gPGQ+XHJcbiAgICAgIGlmICghc20yLnNldHVwT3B0aW9ucy51c2VIVE1MNUF1ZGlvIHx8IHNtMi5zZXR1cE9wdGlvbnMucHJlZmVyRmxhc2gpIHtcclxuICAgICAgICAvLyBub3RpZnkgdGhhdCBkZWZhdWx0cyBhcmUgYmVpbmcgY2hhbmdlZC5cclxuICAgICAgICBtZXNzYWdlcy5wdXNoKHN0cmluZ3MubW9iaWxlVUEpO1xyXG4gICAgICB9XHJcbiAgICAgIC8vIDwvZD5cclxuXHJcbiAgICAgIHNtMi5zZXR1cE9wdGlvbnMudXNlSFRNTDVBdWRpbyA9IHRydWU7XHJcbiAgICAgIHNtMi5zZXR1cE9wdGlvbnMucHJlZmVyRmxhc2ggPSBmYWxzZTtcclxuXHJcbiAgICAgIGlmIChpc19pRGV2aWNlIHx8IChpc0FuZHJvaWQgJiYgIXVhLm1hdGNoKC9hbmRyb2lkXFxzMlxcLjMvaSkpKSB7XHJcbiAgICAgICAgLy8gaU9TIGFuZCBBbmRyb2lkIGRldmljZXMgdGVuZCB0byB3b3JrIGJldHRlciB3aXRoIGEgc2luZ2xlIGF1ZGlvIGluc3RhbmNlLCBzcGVjaWZpY2FsbHkgZm9yIGNoYWluZWQgcGxheWJhY2sgb2Ygc291bmRzIGluIHNlcXVlbmNlLlxyXG4gICAgICAgIC8vIGNvbW1vbiB1c2UgY2FzZTogZXhpdGluZyBzb3VuZCBvbmZpbmlzaCgpIC0+IGNyZWF0ZVNvdW5kKCkgLT4gcGxheSgpXHJcbiAgICAgICAgLy8gPGQ+XHJcbiAgICAgICAgbWVzc2FnZXMucHVzaChzdHJpbmdzLmdsb2JhbEhUTUw1KTtcclxuICAgICAgICAvLyA8L2Q+XHJcbiAgICAgICAgaWYgKGlzX2lEZXZpY2UpIHtcclxuICAgICAgICAgIHNtMi5pZ25vcmVGbGFzaCA9IHRydWU7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHVzZUdsb2JhbEhUTUw1QXVkaW8gPSB0cnVlO1xyXG4gICAgICB9XHJcblxyXG4gICAgfVxyXG5cclxuICB9O1xyXG5cclxuICBwcmVJbml0KCk7XHJcblxyXG4gIC8vIHNuaWZmIHVwLWZyb250XHJcbiAgZGV0ZWN0Rmxhc2goKTtcclxuXHJcbiAgLy8gZm9jdXMgYW5kIHdpbmRvdyBsb2FkLCBpbml0IChwcmltYXJpbHkgZmxhc2gtZHJpdmVuKVxyXG4gIGV2ZW50LmFkZCh3aW5kb3csICdmb2N1cycsIGhhbmRsZUZvY3VzKTtcclxuICBldmVudC5hZGQod2luZG93LCAnbG9hZCcsIGRlbGF5V2FpdEZvckVJKTtcclxuICBldmVudC5hZGQod2luZG93LCAnbG9hZCcsIHdpbk9uTG9hZCk7XHJcblxyXG4gIGlmIChkb2MuYWRkRXZlbnRMaXN0ZW5lcikge1xyXG5cclxuICAgIGRvYy5hZGRFdmVudExpc3RlbmVyKCdET01Db250ZW50TG9hZGVkJywgZG9tQ29udGVudExvYWRlZCwgZmFsc2UpO1xyXG5cclxuICB9IGVsc2UgaWYgKGRvYy5hdHRhY2hFdmVudCkge1xyXG5cclxuICAgIGRvYy5hdHRhY2hFdmVudCgnb25yZWFkeXN0YXRlY2hhbmdlJywgZG9tQ29udGVudExvYWRlZElFKTtcclxuXHJcbiAgfSBlbHNlIHtcclxuXHJcbiAgICAvLyBubyBhZGQvYXR0YWNoZXZlbnQgc3VwcG9ydCAtIHNhZmUgdG8gYXNzdW1lIG5vIEpTIC0+IEZsYXNoIGVpdGhlclxyXG4gICAgZGVidWdUUygnb25sb2FkJywgZmFsc2UpO1xyXG4gICAgY2F0Y2hFcnJvcih7dHlwZTonTk9fRE9NMl9FVkVOVFMnLCBmYXRhbDp0cnVlfSk7XHJcblxyXG4gIH1cclxuXHJcbn0gLy8gU291bmRNYW5hZ2VyKClcclxuXHJcbi8vIFNNMl9ERUZFUiBkZXRhaWxzOiBodHRwOi8vd3d3LnNjaGlsbG1hbmlhLmNvbS9wcm9qZWN0cy9zb3VuZG1hbmFnZXIyL2RvYy9nZXRzdGFydGVkLyNsYXp5LWxvYWRpbmdcclxuXHJcbmlmICh3aW5kb3cuU00yX0RFRkVSID09PSB1bmRlZmluZWQgfHwgIVNNMl9ERUZFUikge1xyXG4gIHNvdW5kTWFuYWdlciA9IG5ldyBTb3VuZE1hbmFnZXIoKTtcclxufVxyXG5cclxuLyoqXHJcbiAqIFNvdW5kTWFuYWdlciBwdWJsaWMgaW50ZXJmYWNlc1xyXG4gKiAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cclxuICovXHJcblxyXG5pZiAodHlwZW9mIG1vZHVsZSA9PT0gJ29iamVjdCcgJiYgbW9kdWxlICYmIHR5cGVvZiBtb2R1bGUuZXhwb3J0cyA9PT0gJ29iamVjdCcpIHtcclxuXHJcbiAgLyoqXHJcbiAgICogY29tbW9uSlMgbW9kdWxlXHJcbiAgICogbm90ZTogU00yIHJlcXVpcmVzIGEgd2luZG93IGdsb2JhbCBkdWUgdG8gRmxhc2gsIHdoaWNoIG1ha2VzIGNhbGxzIHRvIHdpbmRvdy5zb3VuZE1hbmFnZXIuXHJcbiAgICogZmxhc2ggbWF5IG5vdCBhbHdheXMgYmUgbmVlZGVkLCBidXQgdGhpcyBpcyBub3Qga25vd24gdW50aWwgYXN5bmMgaW5pdCBhbmQgU00yIG1heSBldmVuIFwicmVib290XCIgaW50byBGbGFzaCBtb2RlLlxyXG4gICAqL1xyXG5cclxuICB3aW5kb3cuc291bmRNYW5hZ2VyID0gc291bmRNYW5hZ2VyO1xyXG5cclxuICBtb2R1bGUuZXhwb3J0cy5Tb3VuZE1hbmFnZXIgPSBTb3VuZE1hbmFnZXI7XHJcbiAgbW9kdWxlLmV4cG9ydHMuc291bmRNYW5hZ2VyID0gc291bmRNYW5hZ2VyO1xyXG5cclxufSBlbHNlIGlmICh0eXBlb2YgZGVmaW5lID09PSAnZnVuY3Rpb24nICYmIGRlZmluZS5hbWQpIHtcclxuXHJcbiAgLy8gQU1EIC0gcmVxdWlyZUpTXHJcblxyXG4gIGRlZmluZSgnU291bmRNYW5hZ2VyJywgW10sIGZ1bmN0aW9uKCkge1xyXG4gICAgcmV0dXJuIHtcclxuICAgICAgU291bmRNYW5hZ2VyOiBTb3VuZE1hbmFnZXIsXHJcbiAgICAgIHNvdW5kTWFuYWdlcjogc291bmRNYW5hZ2VyXHJcbiAgICB9O1xyXG4gIH0pO1xyXG5cclxufSBlbHNlIHtcclxuXHJcbiAgLy8gc3RhbmRhcmQgYnJvd3NlciBjYXNlXHJcblxyXG4gIHdpbmRvdy5Tb3VuZE1hbmFnZXIgPSBTb3VuZE1hbmFnZXI7IC8vIGNvbnN0cnVjdG9yXHJcbiAgd2luZG93LnNvdW5kTWFuYWdlciA9IHNvdW5kTWFuYWdlcjsgLy8gcHVibGljIEFQSSwgZmxhc2ggY2FsbGJhY2tzIGV0Yy5cclxuXHJcbn1cclxuXHJcbn0od2luZG93KSk7XHJcbiIsIihmdW5jdGlvbiAoZ2xvYmFsKXtcbi8vISBtb21lbnQuanNcbi8vISB2ZXJzaW9uIDogMi44LjNcbi8vISBhdXRob3JzIDogVGltIFdvb2QsIElza3JlbiBDaGVybmV2LCBNb21lbnQuanMgY29udHJpYnV0b3JzXG4vLyEgbGljZW5zZSA6IE1JVFxuLy8hIG1vbWVudGpzLmNvbVxuXG4oZnVuY3Rpb24gKHVuZGVmaW5lZCkge1xuICAgIC8qKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKipcbiAgICAgICAgQ29uc3RhbnRzXG4gICAgKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqL1xuXG4gICAgdmFyIG1vbWVudCxcbiAgICAgICAgVkVSU0lPTiA9ICcyLjguMycsXG4gICAgICAgIC8vIHRoZSBnbG9iYWwtc2NvcGUgdGhpcyBpcyBOT1QgdGhlIGdsb2JhbCBvYmplY3QgaW4gTm9kZS5qc1xuICAgICAgICBnbG9iYWxTY29wZSA9IHR5cGVvZiBnbG9iYWwgIT09ICd1bmRlZmluZWQnID8gZ2xvYmFsIDogdGhpcyxcbiAgICAgICAgb2xkR2xvYmFsTW9tZW50LFxuICAgICAgICByb3VuZCA9IE1hdGgucm91bmQsXG4gICAgICAgIGhhc093blByb3BlcnR5ID0gT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eSxcbiAgICAgICAgaSxcblxuICAgICAgICBZRUFSID0gMCxcbiAgICAgICAgTU9OVEggPSAxLFxuICAgICAgICBEQVRFID0gMixcbiAgICAgICAgSE9VUiA9IDMsXG4gICAgICAgIE1JTlVURSA9IDQsXG4gICAgICAgIFNFQ09ORCA9IDUsXG4gICAgICAgIE1JTExJU0VDT05EID0gNixcblxuICAgICAgICAvLyBpbnRlcm5hbCBzdG9yYWdlIGZvciBsb2NhbGUgY29uZmlnIGZpbGVzXG4gICAgICAgIGxvY2FsZXMgPSB7fSxcblxuICAgICAgICAvLyBleHRyYSBtb21lbnQgaW50ZXJuYWwgcHJvcGVydGllcyAocGx1Z2lucyByZWdpc3RlciBwcm9wcyBoZXJlKVxuICAgICAgICBtb21lbnRQcm9wZXJ0aWVzID0gW10sXG5cbiAgICAgICAgLy8gY2hlY2sgZm9yIG5vZGVKU1xuICAgICAgICBoYXNNb2R1bGUgPSAodHlwZW9mIG1vZHVsZSAhPT0gJ3VuZGVmaW5lZCcgJiYgbW9kdWxlLmV4cG9ydHMpLFxuXG4gICAgICAgIC8vIEFTUC5ORVQganNvbiBkYXRlIGZvcm1hdCByZWdleFxuICAgICAgICBhc3BOZXRKc29uUmVnZXggPSAvXlxcLz9EYXRlXFwoKFxcLT9cXGQrKS9pLFxuICAgICAgICBhc3BOZXRUaW1lU3Bhbkpzb25SZWdleCA9IC8oXFwtKT8oPzooXFxkKilcXC4pPyhcXGQrKVxcOihcXGQrKSg/OlxcOihcXGQrKVxcLj8oXFxkezN9KT8pPy8sXG5cbiAgICAgICAgLy8gZnJvbSBodHRwOi8vZG9jcy5jbG9zdXJlLWxpYnJhcnkuZ29vZ2xlY29kZS5jb20vZ2l0L2Nsb3N1cmVfZ29vZ19kYXRlX2RhdGUuanMuc291cmNlLmh0bWxcbiAgICAgICAgLy8gc29tZXdoYXQgbW9yZSBpbiBsaW5lIHdpdGggNC40LjMuMiAyMDA0IHNwZWMsIGJ1dCBhbGxvd3MgZGVjaW1hbCBhbnl3aGVyZVxuICAgICAgICBpc29EdXJhdGlvblJlZ2V4ID0gL14oLSk/UCg/Oig/OihbMC05LC5dKilZKT8oPzooWzAtOSwuXSopTSk/KD86KFswLTksLl0qKUQpPyg/OlQoPzooWzAtOSwuXSopSCk/KD86KFswLTksLl0qKU0pPyg/OihbMC05LC5dKilTKT8pP3woWzAtOSwuXSopVykkLyxcblxuICAgICAgICAvLyBmb3JtYXQgdG9rZW5zXG4gICAgICAgIGZvcm1hdHRpbmdUb2tlbnMgPSAvKFxcW1teXFxbXSpcXF0pfChcXFxcKT8oTW98TU0/TT9NP3xEb3xERERvfEREP0Q/RD98ZGRkP2Q/fGRvP3x3W298d10/fFdbb3xXXT98UXxZWVlZWVl8WVlZWVl8WVlZWXxZWXxnZyhnZ2c/KT98R0coR0dHPyk/fGV8RXxhfEF8aGg/fEhIP3xtbT98c3M/fFN7MSw0fXxYfHp6P3xaWj98LikvZyxcbiAgICAgICAgbG9jYWxGb3JtYXR0aW5nVG9rZW5zID0gLyhcXFtbXlxcW10qXFxdKXwoXFxcXCk/KExUfExMP0w/TD98bHsxLDR9KS9nLFxuXG4gICAgICAgIC8vIHBhcnNpbmcgdG9rZW4gcmVnZXhlc1xuICAgICAgICBwYXJzZVRva2VuT25lT3JUd29EaWdpdHMgPSAvXFxkXFxkPy8sIC8vIDAgLSA5OVxuICAgICAgICBwYXJzZVRva2VuT25lVG9UaHJlZURpZ2l0cyA9IC9cXGR7MSwzfS8sIC8vIDAgLSA5OTlcbiAgICAgICAgcGFyc2VUb2tlbk9uZVRvRm91ckRpZ2l0cyA9IC9cXGR7MSw0fS8sIC8vIDAgLSA5OTk5XG4gICAgICAgIHBhcnNlVG9rZW5PbmVUb1NpeERpZ2l0cyA9IC9bK1xcLV0/XFxkezEsNn0vLCAvLyAtOTk5LDk5OSAtIDk5OSw5OTlcbiAgICAgICAgcGFyc2VUb2tlbkRpZ2l0cyA9IC9cXGQrLywgLy8gbm9uemVybyBudW1iZXIgb2YgZGlnaXRzXG4gICAgICAgIHBhcnNlVG9rZW5Xb3JkID0gL1swLTldKlsnYS16XFx1MDBBMC1cXHUwNUZGXFx1MDcwMC1cXHVEN0ZGXFx1RjkwMC1cXHVGRENGXFx1RkRGMC1cXHVGRkVGXSt8W1xcdTA2MDAtXFx1MDZGRlxcL10rKFxccyo/W1xcdTA2MDAtXFx1MDZGRl0rKXsxLDJ9L2ksIC8vIGFueSB3b3JkIChvciB0d28pIGNoYXJhY3RlcnMgb3IgbnVtYmVycyBpbmNsdWRpbmcgdHdvL3RocmVlIHdvcmQgbW9udGggaW4gYXJhYmljLlxuICAgICAgICBwYXJzZVRva2VuVGltZXpvbmUgPSAvWnxbXFwrXFwtXVxcZFxcZDo/XFxkXFxkL2dpLCAvLyArMDA6MDAgLTAwOjAwICswMDAwIC0wMDAwIG9yIFpcbiAgICAgICAgcGFyc2VUb2tlblQgPSAvVC9pLCAvLyBUIChJU08gc2VwYXJhdG9yKVxuICAgICAgICBwYXJzZVRva2VuVGltZXN0YW1wTXMgPSAvW1xcK1xcLV0/XFxkKyhcXC5cXGR7MSwzfSk/LywgLy8gMTIzNDU2Nzg5IDEyMzQ1Njc4OS4xMjNcbiAgICAgICAgcGFyc2VUb2tlbk9yZGluYWwgPSAvXFxkezEsMn0vLFxuXG4gICAgICAgIC8vc3RyaWN0IHBhcnNpbmcgcmVnZXhlc1xuICAgICAgICBwYXJzZVRva2VuT25lRGlnaXQgPSAvXFxkLywgLy8gMCAtIDlcbiAgICAgICAgcGFyc2VUb2tlblR3b0RpZ2l0cyA9IC9cXGRcXGQvLCAvLyAwMCAtIDk5XG4gICAgICAgIHBhcnNlVG9rZW5UaHJlZURpZ2l0cyA9IC9cXGR7M30vLCAvLyAwMDAgLSA5OTlcbiAgICAgICAgcGFyc2VUb2tlbkZvdXJEaWdpdHMgPSAvXFxkezR9LywgLy8gMDAwMCAtIDk5OTlcbiAgICAgICAgcGFyc2VUb2tlblNpeERpZ2l0cyA9IC9bKy1dP1xcZHs2fS8sIC8vIC05OTksOTk5IC0gOTk5LDk5OVxuICAgICAgICBwYXJzZVRva2VuU2lnbmVkTnVtYmVyID0gL1srLV0/XFxkKy8sIC8vIC1pbmYgLSBpbmZcblxuICAgICAgICAvLyBpc28gODYwMSByZWdleFxuICAgICAgICAvLyAwMDAwLTAwLTAwIDAwMDAtVzAwIG9yIDAwMDAtVzAwLTAgKyBUICsgMDAgb3IgMDA6MDAgb3IgMDA6MDA6MDAgb3IgMDA6MDA6MDAuMDAwICsgKzAwOjAwIG9yICswMDAwIG9yICswMClcbiAgICAgICAgaXNvUmVnZXggPSAvXlxccyooPzpbKy1dXFxkezZ9fFxcZHs0fSktKD86KFxcZFxcZC1cXGRcXGQpfChXXFxkXFxkJCl8KFdcXGRcXGQtXFxkKXwoXFxkXFxkXFxkKSkoKFR8ICkoXFxkXFxkKDpcXGRcXGQoOlxcZFxcZChcXC5cXGQrKT8pPyk/KT8oW1xcK1xcLV1cXGRcXGQoPzo6P1xcZFxcZCk/fFxccypaKT8pPyQvLFxuXG4gICAgICAgIGlzb0Zvcm1hdCA9ICdZWVlZLU1NLUREVEhIOm1tOnNzWicsXG5cbiAgICAgICAgaXNvRGF0ZXMgPSBbXG4gICAgICAgICAgICBbJ1lZWVlZWS1NTS1ERCcsIC9bKy1dXFxkezZ9LVxcZHsyfS1cXGR7Mn0vXSxcbiAgICAgICAgICAgIFsnWVlZWS1NTS1ERCcsIC9cXGR7NH0tXFxkezJ9LVxcZHsyfS9dLFxuICAgICAgICAgICAgWydHR0dHLVtXXVdXLUUnLCAvXFxkezR9LVdcXGR7Mn0tXFxkL10sXG4gICAgICAgICAgICBbJ0dHR0ctW1ddV1cnLCAvXFxkezR9LVdcXGR7Mn0vXSxcbiAgICAgICAgICAgIFsnWVlZWS1EREQnLCAvXFxkezR9LVxcZHszfS9dXG4gICAgICAgIF0sXG5cbiAgICAgICAgLy8gaXNvIHRpbWUgZm9ybWF0cyBhbmQgcmVnZXhlc1xuICAgICAgICBpc29UaW1lcyA9IFtcbiAgICAgICAgICAgIFsnSEg6bW06c3MuU1NTUycsIC8oVHwgKVxcZFxcZDpcXGRcXGQ6XFxkXFxkXFwuXFxkKy9dLFxuICAgICAgICAgICAgWydISDptbTpzcycsIC8oVHwgKVxcZFxcZDpcXGRcXGQ6XFxkXFxkL10sXG4gICAgICAgICAgICBbJ0hIOm1tJywgLyhUfCApXFxkXFxkOlxcZFxcZC9dLFxuICAgICAgICAgICAgWydISCcsIC8oVHwgKVxcZFxcZC9dXG4gICAgICAgIF0sXG5cbiAgICAgICAgLy8gdGltZXpvbmUgY2h1bmtlciAnKzEwOjAwJyA+IFsnMTAnLCAnMDAnXSBvciAnLTE1MzAnID4gWyctMTUnLCAnMzAnXVxuICAgICAgICBwYXJzZVRpbWV6b25lQ2h1bmtlciA9IC8oW1xcK1xcLV18XFxkXFxkKS9naSxcblxuICAgICAgICAvLyBnZXR0ZXIgYW5kIHNldHRlciBuYW1lc1xuICAgICAgICBwcm94eUdldHRlcnNBbmRTZXR0ZXJzID0gJ0RhdGV8SG91cnN8TWludXRlc3xTZWNvbmRzfE1pbGxpc2Vjb25kcycuc3BsaXQoJ3wnKSxcbiAgICAgICAgdW5pdE1pbGxpc2Vjb25kRmFjdG9ycyA9IHtcbiAgICAgICAgICAgICdNaWxsaXNlY29uZHMnIDogMSxcbiAgICAgICAgICAgICdTZWNvbmRzJyA6IDFlMyxcbiAgICAgICAgICAgICdNaW51dGVzJyA6IDZlNCxcbiAgICAgICAgICAgICdIb3VycycgOiAzNmU1LFxuICAgICAgICAgICAgJ0RheXMnIDogODY0ZTUsXG4gICAgICAgICAgICAnTW9udGhzJyA6IDI1OTJlNixcbiAgICAgICAgICAgICdZZWFycycgOiAzMTUzNmU2XG4gICAgICAgIH0sXG5cbiAgICAgICAgdW5pdEFsaWFzZXMgPSB7XG4gICAgICAgICAgICBtcyA6ICdtaWxsaXNlY29uZCcsXG4gICAgICAgICAgICBzIDogJ3NlY29uZCcsXG4gICAgICAgICAgICBtIDogJ21pbnV0ZScsXG4gICAgICAgICAgICBoIDogJ2hvdXInLFxuICAgICAgICAgICAgZCA6ICdkYXknLFxuICAgICAgICAgICAgRCA6ICdkYXRlJyxcbiAgICAgICAgICAgIHcgOiAnd2VlaycsXG4gICAgICAgICAgICBXIDogJ2lzb1dlZWsnLFxuICAgICAgICAgICAgTSA6ICdtb250aCcsXG4gICAgICAgICAgICBRIDogJ3F1YXJ0ZXInLFxuICAgICAgICAgICAgeSA6ICd5ZWFyJyxcbiAgICAgICAgICAgIERERCA6ICdkYXlPZlllYXInLFxuICAgICAgICAgICAgZSA6ICd3ZWVrZGF5JyxcbiAgICAgICAgICAgIEUgOiAnaXNvV2Vla2RheScsXG4gICAgICAgICAgICBnZzogJ3dlZWtZZWFyJyxcbiAgICAgICAgICAgIEdHOiAnaXNvV2Vla1llYXInXG4gICAgICAgIH0sXG5cbiAgICAgICAgY2FtZWxGdW5jdGlvbnMgPSB7XG4gICAgICAgICAgICBkYXlvZnllYXIgOiAnZGF5T2ZZZWFyJyxcbiAgICAgICAgICAgIGlzb3dlZWtkYXkgOiAnaXNvV2Vla2RheScsXG4gICAgICAgICAgICBpc293ZWVrIDogJ2lzb1dlZWsnLFxuICAgICAgICAgICAgd2Vla3llYXIgOiAnd2Vla1llYXInLFxuICAgICAgICAgICAgaXNvd2Vla3llYXIgOiAnaXNvV2Vla1llYXInXG4gICAgICAgIH0sXG5cbiAgICAgICAgLy8gZm9ybWF0IGZ1bmN0aW9uIHN0cmluZ3NcbiAgICAgICAgZm9ybWF0RnVuY3Rpb25zID0ge30sXG5cbiAgICAgICAgLy8gZGVmYXVsdCByZWxhdGl2ZSB0aW1lIHRocmVzaG9sZHNcbiAgICAgICAgcmVsYXRpdmVUaW1lVGhyZXNob2xkcyA9IHtcbiAgICAgICAgICAgIHM6IDQ1LCAgLy8gc2Vjb25kcyB0byBtaW51dGVcbiAgICAgICAgICAgIG06IDQ1LCAgLy8gbWludXRlcyB0byBob3VyXG4gICAgICAgICAgICBoOiAyMiwgIC8vIGhvdXJzIHRvIGRheVxuICAgICAgICAgICAgZDogMjYsICAvLyBkYXlzIHRvIG1vbnRoXG4gICAgICAgICAgICBNOiAxMSAgIC8vIG1vbnRocyB0byB5ZWFyXG4gICAgICAgIH0sXG5cbiAgICAgICAgLy8gdG9rZW5zIHRvIG9yZGluYWxpemUgYW5kIHBhZFxuICAgICAgICBvcmRpbmFsaXplVG9rZW5zID0gJ0RERCB3IFcgTSBEIGQnLnNwbGl0KCcgJyksXG4gICAgICAgIHBhZGRlZFRva2VucyA9ICdNIEQgSCBoIG0gcyB3IFcnLnNwbGl0KCcgJyksXG5cbiAgICAgICAgZm9ybWF0VG9rZW5GdW5jdGlvbnMgPSB7XG4gICAgICAgICAgICBNICAgIDogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgIHJldHVybiB0aGlzLm1vbnRoKCkgKyAxO1xuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIE1NTSAgOiBmdW5jdGlvbiAoZm9ybWF0KSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHRoaXMubG9jYWxlRGF0YSgpLm1vbnRoc1Nob3J0KHRoaXMsIGZvcm1hdCk7XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgTU1NTSA6IGZ1bmN0aW9uIChmb3JtYXQpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gdGhpcy5sb2NhbGVEYXRhKCkubW9udGhzKHRoaXMsIGZvcm1hdCk7XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgRCAgICA6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gdGhpcy5kYXRlKCk7XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgREREICA6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gdGhpcy5kYXlPZlllYXIoKTtcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBkICAgIDogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgIHJldHVybiB0aGlzLmRheSgpO1xuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIGRkICAgOiBmdW5jdGlvbiAoZm9ybWF0KSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHRoaXMubG9jYWxlRGF0YSgpLndlZWtkYXlzTWluKHRoaXMsIGZvcm1hdCk7XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgZGRkICA6IGZ1bmN0aW9uIChmb3JtYXQpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gdGhpcy5sb2NhbGVEYXRhKCkud2Vla2RheXNTaG9ydCh0aGlzLCBmb3JtYXQpO1xuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIGRkZGQgOiBmdW5jdGlvbiAoZm9ybWF0KSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHRoaXMubG9jYWxlRGF0YSgpLndlZWtkYXlzKHRoaXMsIGZvcm1hdCk7XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgdyAgICA6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gdGhpcy53ZWVrKCk7XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgVyAgICA6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gdGhpcy5pc29XZWVrKCk7XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgWVkgICA6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gbGVmdFplcm9GaWxsKHRoaXMueWVhcigpICUgMTAwLCAyKTtcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBZWVlZIDogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgIHJldHVybiBsZWZ0WmVyb0ZpbGwodGhpcy55ZWFyKCksIDQpO1xuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIFlZWVlZIDogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgIHJldHVybiBsZWZ0WmVyb0ZpbGwodGhpcy55ZWFyKCksIDUpO1xuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIFlZWVlZWSA6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICB2YXIgeSA9IHRoaXMueWVhcigpLCBzaWduID0geSA+PSAwID8gJysnIDogJy0nO1xuICAgICAgICAgICAgICAgIHJldHVybiBzaWduICsgbGVmdFplcm9GaWxsKE1hdGguYWJzKHkpLCA2KTtcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBnZyAgIDogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgIHJldHVybiBsZWZ0WmVyb0ZpbGwodGhpcy53ZWVrWWVhcigpICUgMTAwLCAyKTtcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBnZ2dnIDogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgIHJldHVybiBsZWZ0WmVyb0ZpbGwodGhpcy53ZWVrWWVhcigpLCA0KTtcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBnZ2dnZyA6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gbGVmdFplcm9GaWxsKHRoaXMud2Vla1llYXIoKSwgNSk7XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgR0cgICA6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gbGVmdFplcm9GaWxsKHRoaXMuaXNvV2Vla1llYXIoKSAlIDEwMCwgMik7XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgR0dHRyA6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gbGVmdFplcm9GaWxsKHRoaXMuaXNvV2Vla1llYXIoKSwgNCk7XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgR0dHR0cgOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGxlZnRaZXJvRmlsbCh0aGlzLmlzb1dlZWtZZWFyKCksIDUpO1xuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIGUgOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHRoaXMud2Vla2RheSgpO1xuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIEUgOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHRoaXMuaXNvV2Vla2RheSgpO1xuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIGEgICAgOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHRoaXMubG9jYWxlRGF0YSgpLm1lcmlkaWVtKHRoaXMuaG91cnMoKSwgdGhpcy5taW51dGVzKCksIHRydWUpO1xuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIEEgICAgOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHRoaXMubG9jYWxlRGF0YSgpLm1lcmlkaWVtKHRoaXMuaG91cnMoKSwgdGhpcy5taW51dGVzKCksIGZhbHNlKTtcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBIICAgIDogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgIHJldHVybiB0aGlzLmhvdXJzKCk7XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgaCAgICA6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gdGhpcy5ob3VycygpICUgMTIgfHwgMTI7XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgbSAgICA6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gdGhpcy5taW51dGVzKCk7XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgcyAgICA6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gdGhpcy5zZWNvbmRzKCk7XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgUyAgICA6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gdG9JbnQodGhpcy5taWxsaXNlY29uZHMoKSAvIDEwMCk7XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgU1MgICA6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gbGVmdFplcm9GaWxsKHRvSW50KHRoaXMubWlsbGlzZWNvbmRzKCkgLyAxMCksIDIpO1xuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIFNTUyAgOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGxlZnRaZXJvRmlsbCh0aGlzLm1pbGxpc2Vjb25kcygpLCAzKTtcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBTU1NTIDogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgIHJldHVybiBsZWZ0WmVyb0ZpbGwodGhpcy5taWxsaXNlY29uZHMoKSwgMyk7XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgWiAgICA6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICB2YXIgYSA9IC10aGlzLnpvbmUoKSxcbiAgICAgICAgICAgICAgICAgICAgYiA9ICcrJztcbiAgICAgICAgICAgICAgICBpZiAoYSA8IDApIHtcbiAgICAgICAgICAgICAgICAgICAgYSA9IC1hO1xuICAgICAgICAgICAgICAgICAgICBiID0gJy0nO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICByZXR1cm4gYiArIGxlZnRaZXJvRmlsbCh0b0ludChhIC8gNjApLCAyKSArICc6JyArIGxlZnRaZXJvRmlsbCh0b0ludChhKSAlIDYwLCAyKTtcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBaWiAgIDogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgIHZhciBhID0gLXRoaXMuem9uZSgpLFxuICAgICAgICAgICAgICAgICAgICBiID0gJysnO1xuICAgICAgICAgICAgICAgIGlmIChhIDwgMCkge1xuICAgICAgICAgICAgICAgICAgICBhID0gLWE7XG4gICAgICAgICAgICAgICAgICAgIGIgPSAnLSc7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIHJldHVybiBiICsgbGVmdFplcm9GaWxsKHRvSW50KGEgLyA2MCksIDIpICsgbGVmdFplcm9GaWxsKHRvSW50KGEpICUgNjAsIDIpO1xuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIHogOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHRoaXMuem9uZUFiYnIoKTtcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICB6eiA6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gdGhpcy56b25lTmFtZSgpO1xuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIFggICAgOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHRoaXMudW5peCgpO1xuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIFEgOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHRoaXMucXVhcnRlcigpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9LFxuXG4gICAgICAgIGRlcHJlY2F0aW9ucyA9IHt9LFxuXG4gICAgICAgIGxpc3RzID0gWydtb250aHMnLCAnbW9udGhzU2hvcnQnLCAnd2Vla2RheXMnLCAnd2Vla2RheXNTaG9ydCcsICd3ZWVrZGF5c01pbiddO1xuXG4gICAgLy8gUGljayB0aGUgZmlyc3QgZGVmaW5lZCBvZiB0d28gb3IgdGhyZWUgYXJndW1lbnRzLiBkZmwgY29tZXMgZnJvbVxuICAgIC8vIGRlZmF1bHQuXG4gICAgZnVuY3Rpb24gZGZsKGEsIGIsIGMpIHtcbiAgICAgICAgc3dpdGNoIChhcmd1bWVudHMubGVuZ3RoKSB7XG4gICAgICAgICAgICBjYXNlIDI6IHJldHVybiBhICE9IG51bGwgPyBhIDogYjtcbiAgICAgICAgICAgIGNhc2UgMzogcmV0dXJuIGEgIT0gbnVsbCA/IGEgOiBiICE9IG51bGwgPyBiIDogYztcbiAgICAgICAgICAgIGRlZmF1bHQ6IHRocm93IG5ldyBFcnJvcignSW1wbGVtZW50IG1lJyk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBmdW5jdGlvbiBoYXNPd25Qcm9wKGEsIGIpIHtcbiAgICAgICAgcmV0dXJuIGhhc093blByb3BlcnR5LmNhbGwoYSwgYik7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gZGVmYXVsdFBhcnNpbmdGbGFncygpIHtcbiAgICAgICAgLy8gV2UgbmVlZCB0byBkZWVwIGNsb25lIHRoaXMgb2JqZWN0LCBhbmQgZXM1IHN0YW5kYXJkIGlzIG5vdCB2ZXJ5XG4gICAgICAgIC8vIGhlbHBmdWwuXG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICBlbXB0eSA6IGZhbHNlLFxuICAgICAgICAgICAgdW51c2VkVG9rZW5zIDogW10sXG4gICAgICAgICAgICB1bnVzZWRJbnB1dCA6IFtdLFxuICAgICAgICAgICAgb3ZlcmZsb3cgOiAtMixcbiAgICAgICAgICAgIGNoYXJzTGVmdE92ZXIgOiAwLFxuICAgICAgICAgICAgbnVsbElucHV0IDogZmFsc2UsXG4gICAgICAgICAgICBpbnZhbGlkTW9udGggOiBudWxsLFxuICAgICAgICAgICAgaW52YWxpZEZvcm1hdCA6IGZhbHNlLFxuICAgICAgICAgICAgdXNlckludmFsaWRhdGVkIDogZmFsc2UsXG4gICAgICAgICAgICBpc286IGZhbHNlXG4gICAgICAgIH07XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gcHJpbnRNc2cobXNnKSB7XG4gICAgICAgIGlmIChtb21lbnQuc3VwcHJlc3NEZXByZWNhdGlvbldhcm5pbmdzID09PSBmYWxzZSAmJlxuICAgICAgICAgICAgICAgIHR5cGVvZiBjb25zb2xlICE9PSAndW5kZWZpbmVkJyAmJiBjb25zb2xlLndhcm4pIHtcbiAgICAgICAgICAgIGNvbnNvbGUud2FybignRGVwcmVjYXRpb24gd2FybmluZzogJyArIG1zZyk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBmdW5jdGlvbiBkZXByZWNhdGUobXNnLCBmbikge1xuICAgICAgICB2YXIgZmlyc3RUaW1lID0gdHJ1ZTtcbiAgICAgICAgcmV0dXJuIGV4dGVuZChmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICBpZiAoZmlyc3RUaW1lKSB7XG4gICAgICAgICAgICAgICAgcHJpbnRNc2cobXNnKTtcbiAgICAgICAgICAgICAgICBmaXJzdFRpbWUgPSBmYWxzZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiBmbi5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xuICAgICAgICB9LCBmbik7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gZGVwcmVjYXRlU2ltcGxlKG5hbWUsIG1zZykge1xuICAgICAgICBpZiAoIWRlcHJlY2F0aW9uc1tuYW1lXSkge1xuICAgICAgICAgICAgcHJpbnRNc2cobXNnKTtcbiAgICAgICAgICAgIGRlcHJlY2F0aW9uc1tuYW1lXSA9IHRydWU7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBmdW5jdGlvbiBwYWRUb2tlbihmdW5jLCBjb3VudCkge1xuICAgICAgICByZXR1cm4gZnVuY3Rpb24gKGEpIHtcbiAgICAgICAgICAgIHJldHVybiBsZWZ0WmVyb0ZpbGwoZnVuYy5jYWxsKHRoaXMsIGEpLCBjb3VudCk7XG4gICAgICAgIH07XG4gICAgfVxuICAgIGZ1bmN0aW9uIG9yZGluYWxpemVUb2tlbihmdW5jLCBwZXJpb2QpIHtcbiAgICAgICAgcmV0dXJuIGZ1bmN0aW9uIChhKSB7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5sb2NhbGVEYXRhKCkub3JkaW5hbChmdW5jLmNhbGwodGhpcywgYSksIHBlcmlvZCk7XG4gICAgICAgIH07XG4gICAgfVxuXG4gICAgd2hpbGUgKG9yZGluYWxpemVUb2tlbnMubGVuZ3RoKSB7XG4gICAgICAgIGkgPSBvcmRpbmFsaXplVG9rZW5zLnBvcCgpO1xuICAgICAgICBmb3JtYXRUb2tlbkZ1bmN0aW9uc1tpICsgJ28nXSA9IG9yZGluYWxpemVUb2tlbihmb3JtYXRUb2tlbkZ1bmN0aW9uc1tpXSwgaSk7XG4gICAgfVxuICAgIHdoaWxlIChwYWRkZWRUb2tlbnMubGVuZ3RoKSB7XG4gICAgICAgIGkgPSBwYWRkZWRUb2tlbnMucG9wKCk7XG4gICAgICAgIGZvcm1hdFRva2VuRnVuY3Rpb25zW2kgKyBpXSA9IHBhZFRva2VuKGZvcm1hdFRva2VuRnVuY3Rpb25zW2ldLCAyKTtcbiAgICB9XG4gICAgZm9ybWF0VG9rZW5GdW5jdGlvbnMuRERERCA9IHBhZFRva2VuKGZvcm1hdFRva2VuRnVuY3Rpb25zLkRERCwgMyk7XG5cblxuICAgIC8qKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKipcbiAgICAgICAgQ29uc3RydWN0b3JzXG4gICAgKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqL1xuXG4gICAgZnVuY3Rpb24gTG9jYWxlKCkge1xuICAgIH1cblxuICAgIC8vIE1vbWVudCBwcm90b3R5cGUgb2JqZWN0XG4gICAgZnVuY3Rpb24gTW9tZW50KGNvbmZpZywgc2tpcE92ZXJmbG93KSB7XG4gICAgICAgIGlmIChza2lwT3ZlcmZsb3cgIT09IGZhbHNlKSB7XG4gICAgICAgICAgICBjaGVja092ZXJmbG93KGNvbmZpZyk7XG4gICAgICAgIH1cbiAgICAgICAgY29weUNvbmZpZyh0aGlzLCBjb25maWcpO1xuICAgICAgICB0aGlzLl9kID0gbmV3IERhdGUoK2NvbmZpZy5fZCk7XG4gICAgfVxuXG4gICAgLy8gRHVyYXRpb24gQ29uc3RydWN0b3JcbiAgICBmdW5jdGlvbiBEdXJhdGlvbihkdXJhdGlvbikge1xuICAgICAgICB2YXIgbm9ybWFsaXplZElucHV0ID0gbm9ybWFsaXplT2JqZWN0VW5pdHMoZHVyYXRpb24pLFxuICAgICAgICAgICAgeWVhcnMgPSBub3JtYWxpemVkSW5wdXQueWVhciB8fCAwLFxuICAgICAgICAgICAgcXVhcnRlcnMgPSBub3JtYWxpemVkSW5wdXQucXVhcnRlciB8fCAwLFxuICAgICAgICAgICAgbW9udGhzID0gbm9ybWFsaXplZElucHV0Lm1vbnRoIHx8IDAsXG4gICAgICAgICAgICB3ZWVrcyA9IG5vcm1hbGl6ZWRJbnB1dC53ZWVrIHx8IDAsXG4gICAgICAgICAgICBkYXlzID0gbm9ybWFsaXplZElucHV0LmRheSB8fCAwLFxuICAgICAgICAgICAgaG91cnMgPSBub3JtYWxpemVkSW5wdXQuaG91ciB8fCAwLFxuICAgICAgICAgICAgbWludXRlcyA9IG5vcm1hbGl6ZWRJbnB1dC5taW51dGUgfHwgMCxcbiAgICAgICAgICAgIHNlY29uZHMgPSBub3JtYWxpemVkSW5wdXQuc2Vjb25kIHx8IDAsXG4gICAgICAgICAgICBtaWxsaXNlY29uZHMgPSBub3JtYWxpemVkSW5wdXQubWlsbGlzZWNvbmQgfHwgMDtcblxuICAgICAgICAvLyByZXByZXNlbnRhdGlvbiBmb3IgZGF0ZUFkZFJlbW92ZVxuICAgICAgICB0aGlzLl9taWxsaXNlY29uZHMgPSArbWlsbGlzZWNvbmRzICtcbiAgICAgICAgICAgIHNlY29uZHMgKiAxZTMgKyAvLyAxMDAwXG4gICAgICAgICAgICBtaW51dGVzICogNmU0ICsgLy8gMTAwMCAqIDYwXG4gICAgICAgICAgICBob3VycyAqIDM2ZTU7IC8vIDEwMDAgKiA2MCAqIDYwXG4gICAgICAgIC8vIEJlY2F1c2Ugb2YgZGF0ZUFkZFJlbW92ZSB0cmVhdHMgMjQgaG91cnMgYXMgZGlmZmVyZW50IGZyb20gYVxuICAgICAgICAvLyBkYXkgd2hlbiB3b3JraW5nIGFyb3VuZCBEU1QsIHdlIG5lZWQgdG8gc3RvcmUgdGhlbSBzZXBhcmF0ZWx5XG4gICAgICAgIHRoaXMuX2RheXMgPSArZGF5cyArXG4gICAgICAgICAgICB3ZWVrcyAqIDc7XG4gICAgICAgIC8vIEl0IGlzIGltcG9zc2libGUgdHJhbnNsYXRlIG1vbnRocyBpbnRvIGRheXMgd2l0aG91dCBrbm93aW5nXG4gICAgICAgIC8vIHdoaWNoIG1vbnRocyB5b3UgYXJlIGFyZSB0YWxraW5nIGFib3V0LCBzbyB3ZSBoYXZlIHRvIHN0b3JlXG4gICAgICAgIC8vIGl0IHNlcGFyYXRlbHkuXG4gICAgICAgIHRoaXMuX21vbnRocyA9ICttb250aHMgK1xuICAgICAgICAgICAgcXVhcnRlcnMgKiAzICtcbiAgICAgICAgICAgIHllYXJzICogMTI7XG5cbiAgICAgICAgdGhpcy5fZGF0YSA9IHt9O1xuXG4gICAgICAgIHRoaXMuX2xvY2FsZSA9IG1vbWVudC5sb2NhbGVEYXRhKCk7XG5cbiAgICAgICAgdGhpcy5fYnViYmxlKCk7XG4gICAgfVxuXG4gICAgLyoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKlxuICAgICAgICBIZWxwZXJzXG4gICAgKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqL1xuXG5cbiAgICBmdW5jdGlvbiBleHRlbmQoYSwgYikge1xuICAgICAgICBmb3IgKHZhciBpIGluIGIpIHtcbiAgICAgICAgICAgIGlmIChoYXNPd25Qcm9wKGIsIGkpKSB7XG4gICAgICAgICAgICAgICAgYVtpXSA9IGJbaV07XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoaGFzT3duUHJvcChiLCAndG9TdHJpbmcnKSkge1xuICAgICAgICAgICAgYS50b1N0cmluZyA9IGIudG9TdHJpbmc7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoaGFzT3duUHJvcChiLCAndmFsdWVPZicpKSB7XG4gICAgICAgICAgICBhLnZhbHVlT2YgPSBiLnZhbHVlT2Y7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gYTtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBjb3B5Q29uZmlnKHRvLCBmcm9tKSB7XG4gICAgICAgIHZhciBpLCBwcm9wLCB2YWw7XG5cbiAgICAgICAgaWYgKHR5cGVvZiBmcm9tLl9pc0FNb21lbnRPYmplY3QgIT09ICd1bmRlZmluZWQnKSB7XG4gICAgICAgICAgICB0by5faXNBTW9tZW50T2JqZWN0ID0gZnJvbS5faXNBTW9tZW50T2JqZWN0O1xuICAgICAgICB9XG4gICAgICAgIGlmICh0eXBlb2YgZnJvbS5faSAhPT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAgICAgICAgIHRvLl9pID0gZnJvbS5faTtcbiAgICAgICAgfVxuICAgICAgICBpZiAodHlwZW9mIGZyb20uX2YgIT09ICd1bmRlZmluZWQnKSB7XG4gICAgICAgICAgICB0by5fZiA9IGZyb20uX2Y7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKHR5cGVvZiBmcm9tLl9sICE9PSAndW5kZWZpbmVkJykge1xuICAgICAgICAgICAgdG8uX2wgPSBmcm9tLl9sO1xuICAgICAgICB9XG4gICAgICAgIGlmICh0eXBlb2YgZnJvbS5fc3RyaWN0ICE9PSAndW5kZWZpbmVkJykge1xuICAgICAgICAgICAgdG8uX3N0cmljdCA9IGZyb20uX3N0cmljdDtcbiAgICAgICAgfVxuICAgICAgICBpZiAodHlwZW9mIGZyb20uX3R6bSAhPT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAgICAgICAgIHRvLl90em0gPSBmcm9tLl90em07XG4gICAgICAgIH1cbiAgICAgICAgaWYgKHR5cGVvZiBmcm9tLl9pc1VUQyAhPT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAgICAgICAgIHRvLl9pc1VUQyA9IGZyb20uX2lzVVRDO1xuICAgICAgICB9XG4gICAgICAgIGlmICh0eXBlb2YgZnJvbS5fb2Zmc2V0ICE9PSAndW5kZWZpbmVkJykge1xuICAgICAgICAgICAgdG8uX29mZnNldCA9IGZyb20uX29mZnNldDtcbiAgICAgICAgfVxuICAgICAgICBpZiAodHlwZW9mIGZyb20uX3BmICE9PSAndW5kZWZpbmVkJykge1xuICAgICAgICAgICAgdG8uX3BmID0gZnJvbS5fcGY7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKHR5cGVvZiBmcm9tLl9sb2NhbGUgIT09ICd1bmRlZmluZWQnKSB7XG4gICAgICAgICAgICB0by5fbG9jYWxlID0gZnJvbS5fbG9jYWxlO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKG1vbWVudFByb3BlcnRpZXMubGVuZ3RoID4gMCkge1xuICAgICAgICAgICAgZm9yIChpIGluIG1vbWVudFByb3BlcnRpZXMpIHtcbiAgICAgICAgICAgICAgICBwcm9wID0gbW9tZW50UHJvcGVydGllc1tpXTtcbiAgICAgICAgICAgICAgICB2YWwgPSBmcm9tW3Byb3BdO1xuICAgICAgICAgICAgICAgIGlmICh0eXBlb2YgdmFsICE9PSAndW5kZWZpbmVkJykge1xuICAgICAgICAgICAgICAgICAgICB0b1twcm9wXSA9IHZhbDtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gdG87XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gYWJzUm91bmQobnVtYmVyKSB7XG4gICAgICAgIGlmIChudW1iZXIgPCAwKSB7XG4gICAgICAgICAgICByZXR1cm4gTWF0aC5jZWlsKG51bWJlcik7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICByZXR1cm4gTWF0aC5mbG9vcihudW1iZXIpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgLy8gbGVmdCB6ZXJvIGZpbGwgYSBudW1iZXJcbiAgICAvLyBzZWUgaHR0cDovL2pzcGVyZi5jb20vbGVmdC16ZXJvLWZpbGxpbmcgZm9yIHBlcmZvcm1hbmNlIGNvbXBhcmlzb25cbiAgICBmdW5jdGlvbiBsZWZ0WmVyb0ZpbGwobnVtYmVyLCB0YXJnZXRMZW5ndGgsIGZvcmNlU2lnbikge1xuICAgICAgICB2YXIgb3V0cHV0ID0gJycgKyBNYXRoLmFicyhudW1iZXIpLFxuICAgICAgICAgICAgc2lnbiA9IG51bWJlciA+PSAwO1xuXG4gICAgICAgIHdoaWxlIChvdXRwdXQubGVuZ3RoIDwgdGFyZ2V0TGVuZ3RoKSB7XG4gICAgICAgICAgICBvdXRwdXQgPSAnMCcgKyBvdXRwdXQ7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIChzaWduID8gKGZvcmNlU2lnbiA/ICcrJyA6ICcnKSA6ICctJykgKyBvdXRwdXQ7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gcG9zaXRpdmVNb21lbnRzRGlmZmVyZW5jZShiYXNlLCBvdGhlcikge1xuICAgICAgICB2YXIgcmVzID0ge21pbGxpc2Vjb25kczogMCwgbW9udGhzOiAwfTtcblxuICAgICAgICByZXMubW9udGhzID0gb3RoZXIubW9udGgoKSAtIGJhc2UubW9udGgoKSArXG4gICAgICAgICAgICAob3RoZXIueWVhcigpIC0gYmFzZS55ZWFyKCkpICogMTI7XG4gICAgICAgIGlmIChiYXNlLmNsb25lKCkuYWRkKHJlcy5tb250aHMsICdNJykuaXNBZnRlcihvdGhlcikpIHtcbiAgICAgICAgICAgIC0tcmVzLm1vbnRocztcbiAgICAgICAgfVxuXG4gICAgICAgIHJlcy5taWxsaXNlY29uZHMgPSArb3RoZXIgLSArKGJhc2UuY2xvbmUoKS5hZGQocmVzLm1vbnRocywgJ00nKSk7XG5cbiAgICAgICAgcmV0dXJuIHJlcztcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBtb21lbnRzRGlmZmVyZW5jZShiYXNlLCBvdGhlcikge1xuICAgICAgICB2YXIgcmVzO1xuICAgICAgICBvdGhlciA9IG1ha2VBcyhvdGhlciwgYmFzZSk7XG4gICAgICAgIGlmIChiYXNlLmlzQmVmb3JlKG90aGVyKSkge1xuICAgICAgICAgICAgcmVzID0gcG9zaXRpdmVNb21lbnRzRGlmZmVyZW5jZShiYXNlLCBvdGhlcik7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICByZXMgPSBwb3NpdGl2ZU1vbWVudHNEaWZmZXJlbmNlKG90aGVyLCBiYXNlKTtcbiAgICAgICAgICAgIHJlcy5taWxsaXNlY29uZHMgPSAtcmVzLm1pbGxpc2Vjb25kcztcbiAgICAgICAgICAgIHJlcy5tb250aHMgPSAtcmVzLm1vbnRocztcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiByZXM7XG4gICAgfVxuXG4gICAgLy8gVE9ETzogcmVtb3ZlICduYW1lJyBhcmcgYWZ0ZXIgZGVwcmVjYXRpb24gaXMgcmVtb3ZlZFxuICAgIGZ1bmN0aW9uIGNyZWF0ZUFkZGVyKGRpcmVjdGlvbiwgbmFtZSkge1xuICAgICAgICByZXR1cm4gZnVuY3Rpb24gKHZhbCwgcGVyaW9kKSB7XG4gICAgICAgICAgICB2YXIgZHVyLCB0bXA7XG4gICAgICAgICAgICAvL2ludmVydCB0aGUgYXJndW1lbnRzLCBidXQgY29tcGxhaW4gYWJvdXQgaXRcbiAgICAgICAgICAgIGlmIChwZXJpb2QgIT09IG51bGwgJiYgIWlzTmFOKCtwZXJpb2QpKSB7XG4gICAgICAgICAgICAgICAgZGVwcmVjYXRlU2ltcGxlKG5hbWUsICdtb21lbnQoKS4nICsgbmFtZSAgKyAnKHBlcmlvZCwgbnVtYmVyKSBpcyBkZXByZWNhdGVkLiBQbGVhc2UgdXNlIG1vbWVudCgpLicgKyBuYW1lICsgJyhudW1iZXIsIHBlcmlvZCkuJyk7XG4gICAgICAgICAgICAgICAgdG1wID0gdmFsOyB2YWwgPSBwZXJpb2Q7IHBlcmlvZCA9IHRtcDtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgdmFsID0gdHlwZW9mIHZhbCA9PT0gJ3N0cmluZycgPyArdmFsIDogdmFsO1xuICAgICAgICAgICAgZHVyID0gbW9tZW50LmR1cmF0aW9uKHZhbCwgcGVyaW9kKTtcbiAgICAgICAgICAgIGFkZE9yU3VidHJhY3REdXJhdGlvbkZyb21Nb21lbnQodGhpcywgZHVyLCBkaXJlY3Rpb24pO1xuICAgICAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgICAgIH07XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gYWRkT3JTdWJ0cmFjdER1cmF0aW9uRnJvbU1vbWVudChtb20sIGR1cmF0aW9uLCBpc0FkZGluZywgdXBkYXRlT2Zmc2V0KSB7XG4gICAgICAgIHZhciBtaWxsaXNlY29uZHMgPSBkdXJhdGlvbi5fbWlsbGlzZWNvbmRzLFxuICAgICAgICAgICAgZGF5cyA9IGR1cmF0aW9uLl9kYXlzLFxuICAgICAgICAgICAgbW9udGhzID0gZHVyYXRpb24uX21vbnRocztcbiAgICAgICAgdXBkYXRlT2Zmc2V0ID0gdXBkYXRlT2Zmc2V0ID09IG51bGwgPyB0cnVlIDogdXBkYXRlT2Zmc2V0O1xuXG4gICAgICAgIGlmIChtaWxsaXNlY29uZHMpIHtcbiAgICAgICAgICAgIG1vbS5fZC5zZXRUaW1lKCttb20uX2QgKyBtaWxsaXNlY29uZHMgKiBpc0FkZGluZyk7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKGRheXMpIHtcbiAgICAgICAgICAgIHJhd1NldHRlcihtb20sICdEYXRlJywgcmF3R2V0dGVyKG1vbSwgJ0RhdGUnKSArIGRheXMgKiBpc0FkZGluZyk7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKG1vbnRocykge1xuICAgICAgICAgICAgcmF3TW9udGhTZXR0ZXIobW9tLCByYXdHZXR0ZXIobW9tLCAnTW9udGgnKSArIG1vbnRocyAqIGlzQWRkaW5nKTtcbiAgICAgICAgfVxuICAgICAgICBpZiAodXBkYXRlT2Zmc2V0KSB7XG4gICAgICAgICAgICBtb21lbnQudXBkYXRlT2Zmc2V0KG1vbSwgZGF5cyB8fCBtb250aHMpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgLy8gY2hlY2sgaWYgaXMgYW4gYXJyYXlcbiAgICBmdW5jdGlvbiBpc0FycmF5KGlucHV0KSB7XG4gICAgICAgIHJldHVybiBPYmplY3QucHJvdG90eXBlLnRvU3RyaW5nLmNhbGwoaW5wdXQpID09PSAnW29iamVjdCBBcnJheV0nO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIGlzRGF0ZShpbnB1dCkge1xuICAgICAgICByZXR1cm4gT2JqZWN0LnByb3RvdHlwZS50b1N0cmluZy5jYWxsKGlucHV0KSA9PT0gJ1tvYmplY3QgRGF0ZV0nIHx8XG4gICAgICAgICAgICBpbnB1dCBpbnN0YW5jZW9mIERhdGU7XG4gICAgfVxuXG4gICAgLy8gY29tcGFyZSB0d28gYXJyYXlzLCByZXR1cm4gdGhlIG51bWJlciBvZiBkaWZmZXJlbmNlc1xuICAgIGZ1bmN0aW9uIGNvbXBhcmVBcnJheXMoYXJyYXkxLCBhcnJheTIsIGRvbnRDb252ZXJ0KSB7XG4gICAgICAgIHZhciBsZW4gPSBNYXRoLm1pbihhcnJheTEubGVuZ3RoLCBhcnJheTIubGVuZ3RoKSxcbiAgICAgICAgICAgIGxlbmd0aERpZmYgPSBNYXRoLmFicyhhcnJheTEubGVuZ3RoIC0gYXJyYXkyLmxlbmd0aCksXG4gICAgICAgICAgICBkaWZmcyA9IDAsXG4gICAgICAgICAgICBpO1xuICAgICAgICBmb3IgKGkgPSAwOyBpIDwgbGVuOyBpKyspIHtcbiAgICAgICAgICAgIGlmICgoZG9udENvbnZlcnQgJiYgYXJyYXkxW2ldICE9PSBhcnJheTJbaV0pIHx8XG4gICAgICAgICAgICAgICAgKCFkb250Q29udmVydCAmJiB0b0ludChhcnJheTFbaV0pICE9PSB0b0ludChhcnJheTJbaV0pKSkge1xuICAgICAgICAgICAgICAgIGRpZmZzKys7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGRpZmZzICsgbGVuZ3RoRGlmZjtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBub3JtYWxpemVVbml0cyh1bml0cykge1xuICAgICAgICBpZiAodW5pdHMpIHtcbiAgICAgICAgICAgIHZhciBsb3dlcmVkID0gdW5pdHMudG9Mb3dlckNhc2UoKS5yZXBsYWNlKC8oLilzJC8sICckMScpO1xuICAgICAgICAgICAgdW5pdHMgPSB1bml0QWxpYXNlc1t1bml0c10gfHwgY2FtZWxGdW5jdGlvbnNbbG93ZXJlZF0gfHwgbG93ZXJlZDtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gdW5pdHM7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gbm9ybWFsaXplT2JqZWN0VW5pdHMoaW5wdXRPYmplY3QpIHtcbiAgICAgICAgdmFyIG5vcm1hbGl6ZWRJbnB1dCA9IHt9LFxuICAgICAgICAgICAgbm9ybWFsaXplZFByb3AsXG4gICAgICAgICAgICBwcm9wO1xuXG4gICAgICAgIGZvciAocHJvcCBpbiBpbnB1dE9iamVjdCkge1xuICAgICAgICAgICAgaWYgKGhhc093blByb3AoaW5wdXRPYmplY3QsIHByb3ApKSB7XG4gICAgICAgICAgICAgICAgbm9ybWFsaXplZFByb3AgPSBub3JtYWxpemVVbml0cyhwcm9wKTtcbiAgICAgICAgICAgICAgICBpZiAobm9ybWFsaXplZFByb3ApIHtcbiAgICAgICAgICAgICAgICAgICAgbm9ybWFsaXplZElucHV0W25vcm1hbGl6ZWRQcm9wXSA9IGlucHV0T2JqZWN0W3Byb3BdO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiBub3JtYWxpemVkSW5wdXQ7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gbWFrZUxpc3QoZmllbGQpIHtcbiAgICAgICAgdmFyIGNvdW50LCBzZXR0ZXI7XG5cbiAgICAgICAgaWYgKGZpZWxkLmluZGV4T2YoJ3dlZWsnKSA9PT0gMCkge1xuICAgICAgICAgICAgY291bnQgPSA3O1xuICAgICAgICAgICAgc2V0dGVyID0gJ2RheSc7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSBpZiAoZmllbGQuaW5kZXhPZignbW9udGgnKSA9PT0gMCkge1xuICAgICAgICAgICAgY291bnQgPSAxMjtcbiAgICAgICAgICAgIHNldHRlciA9ICdtb250aCc7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICBtb21lbnRbZmllbGRdID0gZnVuY3Rpb24gKGZvcm1hdCwgaW5kZXgpIHtcbiAgICAgICAgICAgIHZhciBpLCBnZXR0ZXIsXG4gICAgICAgICAgICAgICAgbWV0aG9kID0gbW9tZW50Ll9sb2NhbGVbZmllbGRdLFxuICAgICAgICAgICAgICAgIHJlc3VsdHMgPSBbXTtcblxuICAgICAgICAgICAgaWYgKHR5cGVvZiBmb3JtYXQgPT09ICdudW1iZXInKSB7XG4gICAgICAgICAgICAgICAgaW5kZXggPSBmb3JtYXQ7XG4gICAgICAgICAgICAgICAgZm9ybWF0ID0gdW5kZWZpbmVkO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBnZXR0ZXIgPSBmdW5jdGlvbiAoaSkge1xuICAgICAgICAgICAgICAgIHZhciBtID0gbW9tZW50KCkudXRjKCkuc2V0KHNldHRlciwgaSk7XG4gICAgICAgICAgICAgICAgcmV0dXJuIG1ldGhvZC5jYWxsKG1vbWVudC5fbG9jYWxlLCBtLCBmb3JtYXQgfHwgJycpO1xuICAgICAgICAgICAgfTtcblxuICAgICAgICAgICAgaWYgKGluZGV4ICE9IG51bGwpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gZ2V0dGVyKGluZGV4KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgIGZvciAoaSA9IDA7IGkgPCBjb3VudDsgaSsrKSB7XG4gICAgICAgICAgICAgICAgICAgIHJlc3VsdHMucHVzaChnZXR0ZXIoaSkpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICByZXR1cm4gcmVzdWx0cztcbiAgICAgICAgICAgIH1cbiAgICAgICAgfTtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiB0b0ludChhcmd1bWVudEZvckNvZXJjaW9uKSB7XG4gICAgICAgIHZhciBjb2VyY2VkTnVtYmVyID0gK2FyZ3VtZW50Rm9yQ29lcmNpb24sXG4gICAgICAgICAgICB2YWx1ZSA9IDA7XG5cbiAgICAgICAgaWYgKGNvZXJjZWROdW1iZXIgIT09IDAgJiYgaXNGaW5pdGUoY29lcmNlZE51bWJlcikpIHtcbiAgICAgICAgICAgIGlmIChjb2VyY2VkTnVtYmVyID49IDApIHtcbiAgICAgICAgICAgICAgICB2YWx1ZSA9IE1hdGguZmxvb3IoY29lcmNlZE51bWJlcik7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIHZhbHVlID0gTWF0aC5jZWlsKGNvZXJjZWROdW1iZXIpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIHZhbHVlO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIGRheXNJbk1vbnRoKHllYXIsIG1vbnRoKSB7XG4gICAgICAgIHJldHVybiBuZXcgRGF0ZShEYXRlLlVUQyh5ZWFyLCBtb250aCArIDEsIDApKS5nZXRVVENEYXRlKCk7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gd2Vla3NJblllYXIoeWVhciwgZG93LCBkb3kpIHtcbiAgICAgICAgcmV0dXJuIHdlZWtPZlllYXIobW9tZW50KFt5ZWFyLCAxMSwgMzEgKyBkb3cgLSBkb3ldKSwgZG93LCBkb3kpLndlZWs7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gZGF5c0luWWVhcih5ZWFyKSB7XG4gICAgICAgIHJldHVybiBpc0xlYXBZZWFyKHllYXIpID8gMzY2IDogMzY1O1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIGlzTGVhcFllYXIoeWVhcikge1xuICAgICAgICByZXR1cm4gKHllYXIgJSA0ID09PSAwICYmIHllYXIgJSAxMDAgIT09IDApIHx8IHllYXIgJSA0MDAgPT09IDA7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gY2hlY2tPdmVyZmxvdyhtKSB7XG4gICAgICAgIHZhciBvdmVyZmxvdztcbiAgICAgICAgaWYgKG0uX2EgJiYgbS5fcGYub3ZlcmZsb3cgPT09IC0yKSB7XG4gICAgICAgICAgICBvdmVyZmxvdyA9XG4gICAgICAgICAgICAgICAgbS5fYVtNT05USF0gPCAwIHx8IG0uX2FbTU9OVEhdID4gMTEgPyBNT05USCA6XG4gICAgICAgICAgICAgICAgbS5fYVtEQVRFXSA8IDEgfHwgbS5fYVtEQVRFXSA+IGRheXNJbk1vbnRoKG0uX2FbWUVBUl0sIG0uX2FbTU9OVEhdKSA/IERBVEUgOlxuICAgICAgICAgICAgICAgIG0uX2FbSE9VUl0gPCAwIHx8IG0uX2FbSE9VUl0gPiAyMyA/IEhPVVIgOlxuICAgICAgICAgICAgICAgIG0uX2FbTUlOVVRFXSA8IDAgfHwgbS5fYVtNSU5VVEVdID4gNTkgPyBNSU5VVEUgOlxuICAgICAgICAgICAgICAgIG0uX2FbU0VDT05EXSA8IDAgfHwgbS5fYVtTRUNPTkRdID4gNTkgPyBTRUNPTkQgOlxuICAgICAgICAgICAgICAgIG0uX2FbTUlMTElTRUNPTkRdIDwgMCB8fCBtLl9hW01JTExJU0VDT05EXSA+IDk5OSA/IE1JTExJU0VDT05EIDpcbiAgICAgICAgICAgICAgICAtMTtcblxuICAgICAgICAgICAgaWYgKG0uX3BmLl9vdmVyZmxvd0RheU9mWWVhciAmJiAob3ZlcmZsb3cgPCBZRUFSIHx8IG92ZXJmbG93ID4gREFURSkpIHtcbiAgICAgICAgICAgICAgICBvdmVyZmxvdyA9IERBVEU7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIG0uX3BmLm92ZXJmbG93ID0gb3ZlcmZsb3c7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBmdW5jdGlvbiBpc1ZhbGlkKG0pIHtcbiAgICAgICAgaWYgKG0uX2lzVmFsaWQgPT0gbnVsbCkge1xuICAgICAgICAgICAgbS5faXNWYWxpZCA9ICFpc05hTihtLl9kLmdldFRpbWUoKSkgJiZcbiAgICAgICAgICAgICAgICBtLl9wZi5vdmVyZmxvdyA8IDAgJiZcbiAgICAgICAgICAgICAgICAhbS5fcGYuZW1wdHkgJiZcbiAgICAgICAgICAgICAgICAhbS5fcGYuaW52YWxpZE1vbnRoICYmXG4gICAgICAgICAgICAgICAgIW0uX3BmLm51bGxJbnB1dCAmJlxuICAgICAgICAgICAgICAgICFtLl9wZi5pbnZhbGlkRm9ybWF0ICYmXG4gICAgICAgICAgICAgICAgIW0uX3BmLnVzZXJJbnZhbGlkYXRlZDtcblxuICAgICAgICAgICAgaWYgKG0uX3N0cmljdCkge1xuICAgICAgICAgICAgICAgIG0uX2lzVmFsaWQgPSBtLl9pc1ZhbGlkICYmXG4gICAgICAgICAgICAgICAgICAgIG0uX3BmLmNoYXJzTGVmdE92ZXIgPT09IDAgJiZcbiAgICAgICAgICAgICAgICAgICAgbS5fcGYudW51c2VkVG9rZW5zLmxlbmd0aCA9PT0gMDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gbS5faXNWYWxpZDtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBub3JtYWxpemVMb2NhbGUoa2V5KSB7XG4gICAgICAgIHJldHVybiBrZXkgPyBrZXkudG9Mb3dlckNhc2UoKS5yZXBsYWNlKCdfJywgJy0nKSA6IGtleTtcbiAgICB9XG5cbiAgICAvLyBwaWNrIHRoZSBsb2NhbGUgZnJvbSB0aGUgYXJyYXlcbiAgICAvLyB0cnkgWydlbi1hdScsICdlbi1nYiddIGFzICdlbi1hdScsICdlbi1nYicsICdlbicsIGFzIGluIG1vdmUgdGhyb3VnaCB0aGUgbGlzdCB0cnlpbmcgZWFjaFxuICAgIC8vIHN1YnN0cmluZyBmcm9tIG1vc3Qgc3BlY2lmaWMgdG8gbGVhc3QsIGJ1dCBtb3ZlIHRvIHRoZSBuZXh0IGFycmF5IGl0ZW0gaWYgaXQncyBhIG1vcmUgc3BlY2lmaWMgdmFyaWFudCB0aGFuIHRoZSBjdXJyZW50IHJvb3RcbiAgICBmdW5jdGlvbiBjaG9vc2VMb2NhbGUobmFtZXMpIHtcbiAgICAgICAgdmFyIGkgPSAwLCBqLCBuZXh0LCBsb2NhbGUsIHNwbGl0O1xuXG4gICAgICAgIHdoaWxlIChpIDwgbmFtZXMubGVuZ3RoKSB7XG4gICAgICAgICAgICBzcGxpdCA9IG5vcm1hbGl6ZUxvY2FsZShuYW1lc1tpXSkuc3BsaXQoJy0nKTtcbiAgICAgICAgICAgIGogPSBzcGxpdC5sZW5ndGg7XG4gICAgICAgICAgICBuZXh0ID0gbm9ybWFsaXplTG9jYWxlKG5hbWVzW2kgKyAxXSk7XG4gICAgICAgICAgICBuZXh0ID0gbmV4dCA/IG5leHQuc3BsaXQoJy0nKSA6IG51bGw7XG4gICAgICAgICAgICB3aGlsZSAoaiA+IDApIHtcbiAgICAgICAgICAgICAgICBsb2NhbGUgPSBsb2FkTG9jYWxlKHNwbGl0LnNsaWNlKDAsIGopLmpvaW4oJy0nKSk7XG4gICAgICAgICAgICAgICAgaWYgKGxvY2FsZSkge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gbG9jYWxlO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBpZiAobmV4dCAmJiBuZXh0Lmxlbmd0aCA+PSBqICYmIGNvbXBhcmVBcnJheXMoc3BsaXQsIG5leHQsIHRydWUpID49IGogLSAxKSB7XG4gICAgICAgICAgICAgICAgICAgIC8vdGhlIG5leHQgYXJyYXkgaXRlbSBpcyBiZXR0ZXIgdGhhbiBhIHNoYWxsb3dlciBzdWJzdHJpbmcgb2YgdGhpcyBvbmVcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGotLTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGkrKztcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBsb2FkTG9jYWxlKG5hbWUpIHtcbiAgICAgICAgdmFyIG9sZExvY2FsZSA9IG51bGw7XG4gICAgICAgIGlmICghbG9jYWxlc1tuYW1lXSAmJiBoYXNNb2R1bGUpIHtcbiAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgb2xkTG9jYWxlID0gbW9tZW50LmxvY2FsZSgpO1xuICAgICAgICAgICAgICAgIHJlcXVpcmUoJy4vbG9jYWxlLycgKyBuYW1lKTtcbiAgICAgICAgICAgICAgICAvLyBiZWNhdXNlIGRlZmluZUxvY2FsZSBjdXJyZW50bHkgYWxzbyBzZXRzIHRoZSBnbG9iYWwgbG9jYWxlLCB3ZSB3YW50IHRvIHVuZG8gdGhhdCBmb3IgbGF6eSBsb2FkZWQgbG9jYWxlc1xuICAgICAgICAgICAgICAgIG1vbWVudC5sb2NhbGUob2xkTG9jYWxlKTtcbiAgICAgICAgICAgIH0gY2F0Y2ggKGUpIHsgfVxuICAgICAgICB9XG4gICAgICAgIHJldHVybiBsb2NhbGVzW25hbWVdO1xuICAgIH1cblxuICAgIC8vIFJldHVybiBhIG1vbWVudCBmcm9tIGlucHV0LCB0aGF0IGlzIGxvY2FsL3V0Yy96b25lIGVxdWl2YWxlbnQgdG8gbW9kZWwuXG4gICAgZnVuY3Rpb24gbWFrZUFzKGlucHV0LCBtb2RlbCkge1xuICAgICAgICByZXR1cm4gbW9kZWwuX2lzVVRDID8gbW9tZW50KGlucHV0KS56b25lKG1vZGVsLl9vZmZzZXQgfHwgMCkgOlxuICAgICAgICAgICAgbW9tZW50KGlucHV0KS5sb2NhbCgpO1xuICAgIH1cblxuICAgIC8qKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKipcbiAgICAgICAgTG9jYWxlXG4gICAgKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqL1xuXG5cbiAgICBleHRlbmQoTG9jYWxlLnByb3RvdHlwZSwge1xuXG4gICAgICAgIHNldCA6IGZ1bmN0aW9uIChjb25maWcpIHtcbiAgICAgICAgICAgIHZhciBwcm9wLCBpO1xuICAgICAgICAgICAgZm9yIChpIGluIGNvbmZpZykge1xuICAgICAgICAgICAgICAgIHByb3AgPSBjb25maWdbaV07XG4gICAgICAgICAgICAgICAgaWYgKHR5cGVvZiBwcm9wID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXNbaV0gPSBwcm9wO1xuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXNbJ18nICsgaV0gPSBwcm9wO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfSxcblxuICAgICAgICBfbW9udGhzIDogJ0phbnVhcnlfRmVicnVhcnlfTWFyY2hfQXByaWxfTWF5X0p1bmVfSnVseV9BdWd1c3RfU2VwdGVtYmVyX09jdG9iZXJfTm92ZW1iZXJfRGVjZW1iZXInLnNwbGl0KCdfJyksXG4gICAgICAgIG1vbnRocyA6IGZ1bmN0aW9uIChtKSB7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5fbW9udGhzW20ubW9udGgoKV07XG4gICAgICAgIH0sXG5cbiAgICAgICAgX21vbnRoc1Nob3J0IDogJ0phbl9GZWJfTWFyX0Fwcl9NYXlfSnVuX0p1bF9BdWdfU2VwX09jdF9Ob3ZfRGVjJy5zcGxpdCgnXycpLFxuICAgICAgICBtb250aHNTaG9ydCA6IGZ1bmN0aW9uIChtKSB7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5fbW9udGhzU2hvcnRbbS5tb250aCgpXTtcbiAgICAgICAgfSxcblxuICAgICAgICBtb250aHNQYXJzZSA6IGZ1bmN0aW9uIChtb250aE5hbWUpIHtcbiAgICAgICAgICAgIHZhciBpLCBtb20sIHJlZ2V4O1xuXG4gICAgICAgICAgICBpZiAoIXRoaXMuX21vbnRoc1BhcnNlKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5fbW9udGhzUGFyc2UgPSBbXTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgZm9yIChpID0gMDsgaSA8IDEyOyBpKyspIHtcbiAgICAgICAgICAgICAgICAvLyBtYWtlIHRoZSByZWdleCBpZiB3ZSBkb24ndCBoYXZlIGl0IGFscmVhZHlcbiAgICAgICAgICAgICAgICBpZiAoIXRoaXMuX21vbnRoc1BhcnNlW2ldKSB7XG4gICAgICAgICAgICAgICAgICAgIG1vbSA9IG1vbWVudC51dGMoWzIwMDAsIGldKTtcbiAgICAgICAgICAgICAgICAgICAgcmVnZXggPSAnXicgKyB0aGlzLm1vbnRocyhtb20sICcnKSArICd8XicgKyB0aGlzLm1vbnRoc1Nob3J0KG1vbSwgJycpO1xuICAgICAgICAgICAgICAgICAgICB0aGlzLl9tb250aHNQYXJzZVtpXSA9IG5ldyBSZWdFeHAocmVnZXgucmVwbGFjZSgnLicsICcnKSwgJ2knKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgLy8gdGVzdCB0aGUgcmVnZXhcbiAgICAgICAgICAgICAgICBpZiAodGhpcy5fbW9udGhzUGFyc2VbaV0udGVzdChtb250aE5hbWUpKSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfSxcblxuICAgICAgICBfd2Vla2RheXMgOiAnU3VuZGF5X01vbmRheV9UdWVzZGF5X1dlZG5lc2RheV9UaHVyc2RheV9GcmlkYXlfU2F0dXJkYXknLnNwbGl0KCdfJyksXG4gICAgICAgIHdlZWtkYXlzIDogZnVuY3Rpb24gKG0pIHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLl93ZWVrZGF5c1ttLmRheSgpXTtcbiAgICAgICAgfSxcblxuICAgICAgICBfd2Vla2RheXNTaG9ydCA6ICdTdW5fTW9uX1R1ZV9XZWRfVGh1X0ZyaV9TYXQnLnNwbGl0KCdfJyksXG4gICAgICAgIHdlZWtkYXlzU2hvcnQgOiBmdW5jdGlvbiAobSkge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMuX3dlZWtkYXlzU2hvcnRbbS5kYXkoKV07XG4gICAgICAgIH0sXG5cbiAgICAgICAgX3dlZWtkYXlzTWluIDogJ1N1X01vX1R1X1dlX1RoX0ZyX1NhJy5zcGxpdCgnXycpLFxuICAgICAgICB3ZWVrZGF5c01pbiA6IGZ1bmN0aW9uIChtKSB7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5fd2Vla2RheXNNaW5bbS5kYXkoKV07XG4gICAgICAgIH0sXG5cbiAgICAgICAgd2Vla2RheXNQYXJzZSA6IGZ1bmN0aW9uICh3ZWVrZGF5TmFtZSkge1xuICAgICAgICAgICAgdmFyIGksIG1vbSwgcmVnZXg7XG5cbiAgICAgICAgICAgIGlmICghdGhpcy5fd2Vla2RheXNQYXJzZSkge1xuICAgICAgICAgICAgICAgIHRoaXMuX3dlZWtkYXlzUGFyc2UgPSBbXTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgZm9yIChpID0gMDsgaSA8IDc7IGkrKykge1xuICAgICAgICAgICAgICAgIC8vIG1ha2UgdGhlIHJlZ2V4IGlmIHdlIGRvbid0IGhhdmUgaXQgYWxyZWFkeVxuICAgICAgICAgICAgICAgIGlmICghdGhpcy5fd2Vla2RheXNQYXJzZVtpXSkge1xuICAgICAgICAgICAgICAgICAgICBtb20gPSBtb21lbnQoWzIwMDAsIDFdKS5kYXkoaSk7XG4gICAgICAgICAgICAgICAgICAgIHJlZ2V4ID0gJ14nICsgdGhpcy53ZWVrZGF5cyhtb20sICcnKSArICd8XicgKyB0aGlzLndlZWtkYXlzU2hvcnQobW9tLCAnJykgKyAnfF4nICsgdGhpcy53ZWVrZGF5c01pbihtb20sICcnKTtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5fd2Vla2RheXNQYXJzZVtpXSA9IG5ldyBSZWdFeHAocmVnZXgucmVwbGFjZSgnLicsICcnKSwgJ2knKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgLy8gdGVzdCB0aGUgcmVnZXhcbiAgICAgICAgICAgICAgICBpZiAodGhpcy5fd2Vla2RheXNQYXJzZVtpXS50ZXN0KHdlZWtkYXlOYW1lKSkge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gaTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH0sXG5cbiAgICAgICAgX2xvbmdEYXRlRm9ybWF0IDoge1xuICAgICAgICAgICAgTFQgOiAnaDptbSBBJyxcbiAgICAgICAgICAgIEwgOiAnTU0vREQvWVlZWScsXG4gICAgICAgICAgICBMTCA6ICdNTU1NIEQsIFlZWVknLFxuICAgICAgICAgICAgTExMIDogJ01NTU0gRCwgWVlZWSBMVCcsXG4gICAgICAgICAgICBMTExMIDogJ2RkZGQsIE1NTU0gRCwgWVlZWSBMVCdcbiAgICAgICAgfSxcbiAgICAgICAgbG9uZ0RhdGVGb3JtYXQgOiBmdW5jdGlvbiAoa2V5KSB7XG4gICAgICAgICAgICB2YXIgb3V0cHV0ID0gdGhpcy5fbG9uZ0RhdGVGb3JtYXRba2V5XTtcbiAgICAgICAgICAgIGlmICghb3V0cHV0ICYmIHRoaXMuX2xvbmdEYXRlRm9ybWF0W2tleS50b1VwcGVyQ2FzZSgpXSkge1xuICAgICAgICAgICAgICAgIG91dHB1dCA9IHRoaXMuX2xvbmdEYXRlRm9ybWF0W2tleS50b1VwcGVyQ2FzZSgpXS5yZXBsYWNlKC9NTU1NfE1NfEREfGRkZGQvZywgZnVuY3Rpb24gKHZhbCkge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gdmFsLnNsaWNlKDEpO1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIHRoaXMuX2xvbmdEYXRlRm9ybWF0W2tleV0gPSBvdXRwdXQ7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gb3V0cHV0O1xuICAgICAgICB9LFxuXG4gICAgICAgIGlzUE0gOiBmdW5jdGlvbiAoaW5wdXQpIHtcbiAgICAgICAgICAgIC8vIElFOCBRdWlya3MgTW9kZSAmIElFNyBTdGFuZGFyZHMgTW9kZSBkbyBub3QgYWxsb3cgYWNjZXNzaW5nIHN0cmluZ3MgbGlrZSBhcnJheXNcbiAgICAgICAgICAgIC8vIFVzaW5nIGNoYXJBdCBzaG91bGQgYmUgbW9yZSBjb21wYXRpYmxlLlxuICAgICAgICAgICAgcmV0dXJuICgoaW5wdXQgKyAnJykudG9Mb3dlckNhc2UoKS5jaGFyQXQoMCkgPT09ICdwJyk7XG4gICAgICAgIH0sXG5cbiAgICAgICAgX21lcmlkaWVtUGFyc2UgOiAvW2FwXVxcLj9tP1xcLj8vaSxcbiAgICAgICAgbWVyaWRpZW0gOiBmdW5jdGlvbiAoaG91cnMsIG1pbnV0ZXMsIGlzTG93ZXIpIHtcbiAgICAgICAgICAgIGlmIChob3VycyA+IDExKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGlzTG93ZXIgPyAncG0nIDogJ1BNJztcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGlzTG93ZXIgPyAnYW0nIDogJ0FNJztcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSxcblxuICAgICAgICBfY2FsZW5kYXIgOiB7XG4gICAgICAgICAgICBzYW1lRGF5IDogJ1tUb2RheSBhdF0gTFQnLFxuICAgICAgICAgICAgbmV4dERheSA6ICdbVG9tb3Jyb3cgYXRdIExUJyxcbiAgICAgICAgICAgIG5leHRXZWVrIDogJ2RkZGQgW2F0XSBMVCcsXG4gICAgICAgICAgICBsYXN0RGF5IDogJ1tZZXN0ZXJkYXkgYXRdIExUJyxcbiAgICAgICAgICAgIGxhc3RXZWVrIDogJ1tMYXN0XSBkZGRkIFthdF0gTFQnLFxuICAgICAgICAgICAgc2FtZUVsc2UgOiAnTCdcbiAgICAgICAgfSxcbiAgICAgICAgY2FsZW5kYXIgOiBmdW5jdGlvbiAoa2V5LCBtb20pIHtcbiAgICAgICAgICAgIHZhciBvdXRwdXQgPSB0aGlzLl9jYWxlbmRhcltrZXldO1xuICAgICAgICAgICAgcmV0dXJuIHR5cGVvZiBvdXRwdXQgPT09ICdmdW5jdGlvbicgPyBvdXRwdXQuYXBwbHkobW9tKSA6IG91dHB1dDtcbiAgICAgICAgfSxcblxuICAgICAgICBfcmVsYXRpdmVUaW1lIDoge1xuICAgICAgICAgICAgZnV0dXJlIDogJ2luICVzJyxcbiAgICAgICAgICAgIHBhc3QgOiAnJXMgYWdvJyxcbiAgICAgICAgICAgIHMgOiAnYSBmZXcgc2Vjb25kcycsXG4gICAgICAgICAgICBtIDogJ2EgbWludXRlJyxcbiAgICAgICAgICAgIG1tIDogJyVkIG1pbnV0ZXMnLFxuICAgICAgICAgICAgaCA6ICdhbiBob3VyJyxcbiAgICAgICAgICAgIGhoIDogJyVkIGhvdXJzJyxcbiAgICAgICAgICAgIGQgOiAnYSBkYXknLFxuICAgICAgICAgICAgZGQgOiAnJWQgZGF5cycsXG4gICAgICAgICAgICBNIDogJ2EgbW9udGgnLFxuICAgICAgICAgICAgTU0gOiAnJWQgbW9udGhzJyxcbiAgICAgICAgICAgIHkgOiAnYSB5ZWFyJyxcbiAgICAgICAgICAgIHl5IDogJyVkIHllYXJzJ1xuICAgICAgICB9LFxuXG4gICAgICAgIHJlbGF0aXZlVGltZSA6IGZ1bmN0aW9uIChudW1iZXIsIHdpdGhvdXRTdWZmaXgsIHN0cmluZywgaXNGdXR1cmUpIHtcbiAgICAgICAgICAgIHZhciBvdXRwdXQgPSB0aGlzLl9yZWxhdGl2ZVRpbWVbc3RyaW5nXTtcbiAgICAgICAgICAgIHJldHVybiAodHlwZW9mIG91dHB1dCA9PT0gJ2Z1bmN0aW9uJykgP1xuICAgICAgICAgICAgICAgIG91dHB1dChudW1iZXIsIHdpdGhvdXRTdWZmaXgsIHN0cmluZywgaXNGdXR1cmUpIDpcbiAgICAgICAgICAgICAgICBvdXRwdXQucmVwbGFjZSgvJWQvaSwgbnVtYmVyKTtcbiAgICAgICAgfSxcblxuICAgICAgICBwYXN0RnV0dXJlIDogZnVuY3Rpb24gKGRpZmYsIG91dHB1dCkge1xuICAgICAgICAgICAgdmFyIGZvcm1hdCA9IHRoaXMuX3JlbGF0aXZlVGltZVtkaWZmID4gMCA/ICdmdXR1cmUnIDogJ3Bhc3QnXTtcbiAgICAgICAgICAgIHJldHVybiB0eXBlb2YgZm9ybWF0ID09PSAnZnVuY3Rpb24nID8gZm9ybWF0KG91dHB1dCkgOiBmb3JtYXQucmVwbGFjZSgvJXMvaSwgb3V0cHV0KTtcbiAgICAgICAgfSxcblxuICAgICAgICBvcmRpbmFsIDogZnVuY3Rpb24gKG51bWJlcikge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMuX29yZGluYWwucmVwbGFjZSgnJWQnLCBudW1iZXIpO1xuICAgICAgICB9LFxuICAgICAgICBfb3JkaW5hbCA6ICclZCcsXG5cbiAgICAgICAgcHJlcGFyc2UgOiBmdW5jdGlvbiAoc3RyaW5nKSB7XG4gICAgICAgICAgICByZXR1cm4gc3RyaW5nO1xuICAgICAgICB9LFxuXG4gICAgICAgIHBvc3Rmb3JtYXQgOiBmdW5jdGlvbiAoc3RyaW5nKSB7XG4gICAgICAgICAgICByZXR1cm4gc3RyaW5nO1xuICAgICAgICB9LFxuXG4gICAgICAgIHdlZWsgOiBmdW5jdGlvbiAobW9tKSB7XG4gICAgICAgICAgICByZXR1cm4gd2Vla09mWWVhcihtb20sIHRoaXMuX3dlZWsuZG93LCB0aGlzLl93ZWVrLmRveSkud2VlaztcbiAgICAgICAgfSxcblxuICAgICAgICBfd2VlayA6IHtcbiAgICAgICAgICAgIGRvdyA6IDAsIC8vIFN1bmRheSBpcyB0aGUgZmlyc3QgZGF5IG9mIHRoZSB3ZWVrLlxuICAgICAgICAgICAgZG95IDogNiAgLy8gVGhlIHdlZWsgdGhhdCBjb250YWlucyBKYW4gMXN0IGlzIHRoZSBmaXJzdCB3ZWVrIG9mIHRoZSB5ZWFyLlxuICAgICAgICB9LFxuXG4gICAgICAgIF9pbnZhbGlkRGF0ZTogJ0ludmFsaWQgZGF0ZScsXG4gICAgICAgIGludmFsaWREYXRlOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5faW52YWxpZERhdGU7XG4gICAgICAgIH1cbiAgICB9KTtcblxuICAgIC8qKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKipcbiAgICAgICAgRm9ybWF0dGluZ1xuICAgICoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKi9cblxuXG4gICAgZnVuY3Rpb24gcmVtb3ZlRm9ybWF0dGluZ1Rva2VucyhpbnB1dCkge1xuICAgICAgICBpZiAoaW5wdXQubWF0Y2goL1xcW1tcXHNcXFNdLykpIHtcbiAgICAgICAgICAgIHJldHVybiBpbnB1dC5yZXBsYWNlKC9eXFxbfFxcXSQvZywgJycpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBpbnB1dC5yZXBsYWNlKC9cXFxcL2csICcnKTtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBtYWtlRm9ybWF0RnVuY3Rpb24oZm9ybWF0KSB7XG4gICAgICAgIHZhciBhcnJheSA9IGZvcm1hdC5tYXRjaChmb3JtYXR0aW5nVG9rZW5zKSwgaSwgbGVuZ3RoO1xuXG4gICAgICAgIGZvciAoaSA9IDAsIGxlbmd0aCA9IGFycmF5Lmxlbmd0aDsgaSA8IGxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICBpZiAoZm9ybWF0VG9rZW5GdW5jdGlvbnNbYXJyYXlbaV1dKSB7XG4gICAgICAgICAgICAgICAgYXJyYXlbaV0gPSBmb3JtYXRUb2tlbkZ1bmN0aW9uc1thcnJheVtpXV07XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIGFycmF5W2ldID0gcmVtb3ZlRm9ybWF0dGluZ1Rva2VucyhhcnJheVtpXSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gZnVuY3Rpb24gKG1vbSkge1xuICAgICAgICAgICAgdmFyIG91dHB1dCA9ICcnO1xuICAgICAgICAgICAgZm9yIChpID0gMDsgaSA8IGxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICAgICAgb3V0cHV0ICs9IGFycmF5W2ldIGluc3RhbmNlb2YgRnVuY3Rpb24gPyBhcnJheVtpXS5jYWxsKG1vbSwgZm9ybWF0KSA6IGFycmF5W2ldO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIG91dHB1dDtcbiAgICAgICAgfTtcbiAgICB9XG5cbiAgICAvLyBmb3JtYXQgZGF0ZSB1c2luZyBuYXRpdmUgZGF0ZSBvYmplY3RcbiAgICBmdW5jdGlvbiBmb3JtYXRNb21lbnQobSwgZm9ybWF0KSB7XG4gICAgICAgIGlmICghbS5pc1ZhbGlkKCkpIHtcbiAgICAgICAgICAgIHJldHVybiBtLmxvY2FsZURhdGEoKS5pbnZhbGlkRGF0ZSgpO1xuICAgICAgICB9XG5cbiAgICAgICAgZm9ybWF0ID0gZXhwYW5kRm9ybWF0KGZvcm1hdCwgbS5sb2NhbGVEYXRhKCkpO1xuXG4gICAgICAgIGlmICghZm9ybWF0RnVuY3Rpb25zW2Zvcm1hdF0pIHtcbiAgICAgICAgICAgIGZvcm1hdEZ1bmN0aW9uc1tmb3JtYXRdID0gbWFrZUZvcm1hdEZ1bmN0aW9uKGZvcm1hdCk7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gZm9ybWF0RnVuY3Rpb25zW2Zvcm1hdF0obSk7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gZXhwYW5kRm9ybWF0KGZvcm1hdCwgbG9jYWxlKSB7XG4gICAgICAgIHZhciBpID0gNTtcblxuICAgICAgICBmdW5jdGlvbiByZXBsYWNlTG9uZ0RhdGVGb3JtYXRUb2tlbnMoaW5wdXQpIHtcbiAgICAgICAgICAgIHJldHVybiBsb2NhbGUubG9uZ0RhdGVGb3JtYXQoaW5wdXQpIHx8IGlucHV0O1xuICAgICAgICB9XG5cbiAgICAgICAgbG9jYWxGb3JtYXR0aW5nVG9rZW5zLmxhc3RJbmRleCA9IDA7XG4gICAgICAgIHdoaWxlIChpID49IDAgJiYgbG9jYWxGb3JtYXR0aW5nVG9rZW5zLnRlc3QoZm9ybWF0KSkge1xuICAgICAgICAgICAgZm9ybWF0ID0gZm9ybWF0LnJlcGxhY2UobG9jYWxGb3JtYXR0aW5nVG9rZW5zLCByZXBsYWNlTG9uZ0RhdGVGb3JtYXRUb2tlbnMpO1xuICAgICAgICAgICAgbG9jYWxGb3JtYXR0aW5nVG9rZW5zLmxhc3RJbmRleCA9IDA7XG4gICAgICAgICAgICBpIC09IDE7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gZm9ybWF0O1xuICAgIH1cblxuXG4gICAgLyoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKlxuICAgICAgICBQYXJzaW5nXG4gICAgKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqL1xuXG5cbiAgICAvLyBnZXQgdGhlIHJlZ2V4IHRvIGZpbmQgdGhlIG5leHQgdG9rZW5cbiAgICBmdW5jdGlvbiBnZXRQYXJzZVJlZ2V4Rm9yVG9rZW4odG9rZW4sIGNvbmZpZykge1xuICAgICAgICB2YXIgYSwgc3RyaWN0ID0gY29uZmlnLl9zdHJpY3Q7XG4gICAgICAgIHN3aXRjaCAodG9rZW4pIHtcbiAgICAgICAgY2FzZSAnUSc6XG4gICAgICAgICAgICByZXR1cm4gcGFyc2VUb2tlbk9uZURpZ2l0O1xuICAgICAgICBjYXNlICdEREREJzpcbiAgICAgICAgICAgIHJldHVybiBwYXJzZVRva2VuVGhyZWVEaWdpdHM7XG4gICAgICAgIGNhc2UgJ1lZWVknOlxuICAgICAgICBjYXNlICdHR0dHJzpcbiAgICAgICAgY2FzZSAnZ2dnZyc6XG4gICAgICAgICAgICByZXR1cm4gc3RyaWN0ID8gcGFyc2VUb2tlbkZvdXJEaWdpdHMgOiBwYXJzZVRva2VuT25lVG9Gb3VyRGlnaXRzO1xuICAgICAgICBjYXNlICdZJzpcbiAgICAgICAgY2FzZSAnRyc6XG4gICAgICAgIGNhc2UgJ2cnOlxuICAgICAgICAgICAgcmV0dXJuIHBhcnNlVG9rZW5TaWduZWROdW1iZXI7XG4gICAgICAgIGNhc2UgJ1lZWVlZWSc6XG4gICAgICAgIGNhc2UgJ1lZWVlZJzpcbiAgICAgICAgY2FzZSAnR0dHR0cnOlxuICAgICAgICBjYXNlICdnZ2dnZyc6XG4gICAgICAgICAgICByZXR1cm4gc3RyaWN0ID8gcGFyc2VUb2tlblNpeERpZ2l0cyA6IHBhcnNlVG9rZW5PbmVUb1NpeERpZ2l0cztcbiAgICAgICAgY2FzZSAnUyc6XG4gICAgICAgICAgICBpZiAoc3RyaWN0KSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHBhcnNlVG9rZW5PbmVEaWdpdDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIC8qIGZhbGxzIHRocm91Z2ggKi9cbiAgICAgICAgY2FzZSAnU1MnOlxuICAgICAgICAgICAgaWYgKHN0cmljdCkge1xuICAgICAgICAgICAgICAgIHJldHVybiBwYXJzZVRva2VuVHdvRGlnaXRzO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgLyogZmFsbHMgdGhyb3VnaCAqL1xuICAgICAgICBjYXNlICdTU1MnOlxuICAgICAgICAgICAgaWYgKHN0cmljdCkge1xuICAgICAgICAgICAgICAgIHJldHVybiBwYXJzZVRva2VuVGhyZWVEaWdpdHM7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICAvKiBmYWxscyB0aHJvdWdoICovXG4gICAgICAgIGNhc2UgJ0RERCc6XG4gICAgICAgICAgICByZXR1cm4gcGFyc2VUb2tlbk9uZVRvVGhyZWVEaWdpdHM7XG4gICAgICAgIGNhc2UgJ01NTSc6XG4gICAgICAgIGNhc2UgJ01NTU0nOlxuICAgICAgICBjYXNlICdkZCc6XG4gICAgICAgIGNhc2UgJ2RkZCc6XG4gICAgICAgIGNhc2UgJ2RkZGQnOlxuICAgICAgICAgICAgcmV0dXJuIHBhcnNlVG9rZW5Xb3JkO1xuICAgICAgICBjYXNlICdhJzpcbiAgICAgICAgY2FzZSAnQSc6XG4gICAgICAgICAgICByZXR1cm4gY29uZmlnLl9sb2NhbGUuX21lcmlkaWVtUGFyc2U7XG4gICAgICAgIGNhc2UgJ1gnOlxuICAgICAgICAgICAgcmV0dXJuIHBhcnNlVG9rZW5UaW1lc3RhbXBNcztcbiAgICAgICAgY2FzZSAnWic6XG4gICAgICAgIGNhc2UgJ1paJzpcbiAgICAgICAgICAgIHJldHVybiBwYXJzZVRva2VuVGltZXpvbmU7XG4gICAgICAgIGNhc2UgJ1QnOlxuICAgICAgICAgICAgcmV0dXJuIHBhcnNlVG9rZW5UO1xuICAgICAgICBjYXNlICdTU1NTJzpcbiAgICAgICAgICAgIHJldHVybiBwYXJzZVRva2VuRGlnaXRzO1xuICAgICAgICBjYXNlICdNTSc6XG4gICAgICAgIGNhc2UgJ0REJzpcbiAgICAgICAgY2FzZSAnWVknOlxuICAgICAgICBjYXNlICdHRyc6XG4gICAgICAgIGNhc2UgJ2dnJzpcbiAgICAgICAgY2FzZSAnSEgnOlxuICAgICAgICBjYXNlICdoaCc6XG4gICAgICAgIGNhc2UgJ21tJzpcbiAgICAgICAgY2FzZSAnc3MnOlxuICAgICAgICBjYXNlICd3dyc6XG4gICAgICAgIGNhc2UgJ1dXJzpcbiAgICAgICAgICAgIHJldHVybiBzdHJpY3QgPyBwYXJzZVRva2VuVHdvRGlnaXRzIDogcGFyc2VUb2tlbk9uZU9yVHdvRGlnaXRzO1xuICAgICAgICBjYXNlICdNJzpcbiAgICAgICAgY2FzZSAnRCc6XG4gICAgICAgIGNhc2UgJ2QnOlxuICAgICAgICBjYXNlICdIJzpcbiAgICAgICAgY2FzZSAnaCc6XG4gICAgICAgIGNhc2UgJ20nOlxuICAgICAgICBjYXNlICdzJzpcbiAgICAgICAgY2FzZSAndyc6XG4gICAgICAgIGNhc2UgJ1cnOlxuICAgICAgICBjYXNlICdlJzpcbiAgICAgICAgY2FzZSAnRSc6XG4gICAgICAgICAgICByZXR1cm4gcGFyc2VUb2tlbk9uZU9yVHdvRGlnaXRzO1xuICAgICAgICBjYXNlICdEbyc6XG4gICAgICAgICAgICByZXR1cm4gcGFyc2VUb2tlbk9yZGluYWw7XG4gICAgICAgIGRlZmF1bHQgOlxuICAgICAgICAgICAgYSA9IG5ldyBSZWdFeHAocmVnZXhwRXNjYXBlKHVuZXNjYXBlRm9ybWF0KHRva2VuLnJlcGxhY2UoJ1xcXFwnLCAnJykpLCAnaScpKTtcbiAgICAgICAgICAgIHJldHVybiBhO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gdGltZXpvbmVNaW51dGVzRnJvbVN0cmluZyhzdHJpbmcpIHtcbiAgICAgICAgc3RyaW5nID0gc3RyaW5nIHx8ICcnO1xuICAgICAgICB2YXIgcG9zc2libGVUek1hdGNoZXMgPSAoc3RyaW5nLm1hdGNoKHBhcnNlVG9rZW5UaW1lem9uZSkgfHwgW10pLFxuICAgICAgICAgICAgdHpDaHVuayA9IHBvc3NpYmxlVHpNYXRjaGVzW3Bvc3NpYmxlVHpNYXRjaGVzLmxlbmd0aCAtIDFdIHx8IFtdLFxuICAgICAgICAgICAgcGFydHMgPSAodHpDaHVuayArICcnKS5tYXRjaChwYXJzZVRpbWV6b25lQ2h1bmtlcikgfHwgWyctJywgMCwgMF0sXG4gICAgICAgICAgICBtaW51dGVzID0gKyhwYXJ0c1sxXSAqIDYwKSArIHRvSW50KHBhcnRzWzJdKTtcblxuICAgICAgICByZXR1cm4gcGFydHNbMF0gPT09ICcrJyA/IC1taW51dGVzIDogbWludXRlcztcbiAgICB9XG5cbiAgICAvLyBmdW5jdGlvbiB0byBjb252ZXJ0IHN0cmluZyBpbnB1dCB0byBkYXRlXG4gICAgZnVuY3Rpb24gYWRkVGltZVRvQXJyYXlGcm9tVG9rZW4odG9rZW4sIGlucHV0LCBjb25maWcpIHtcbiAgICAgICAgdmFyIGEsIGRhdGVQYXJ0QXJyYXkgPSBjb25maWcuX2E7XG5cbiAgICAgICAgc3dpdGNoICh0b2tlbikge1xuICAgICAgICAvLyBRVUFSVEVSXG4gICAgICAgIGNhc2UgJ1EnOlxuICAgICAgICAgICAgaWYgKGlucHV0ICE9IG51bGwpIHtcbiAgICAgICAgICAgICAgICBkYXRlUGFydEFycmF5W01PTlRIXSA9ICh0b0ludChpbnB1dCkgLSAxKSAqIDM7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgLy8gTU9OVEhcbiAgICAgICAgY2FzZSAnTScgOiAvLyBmYWxsIHRocm91Z2ggdG8gTU1cbiAgICAgICAgY2FzZSAnTU0nIDpcbiAgICAgICAgICAgIGlmIChpbnB1dCAhPSBudWxsKSB7XG4gICAgICAgICAgICAgICAgZGF0ZVBhcnRBcnJheVtNT05USF0gPSB0b0ludChpbnB1dCkgLSAxO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgJ01NTScgOiAvLyBmYWxsIHRocm91Z2ggdG8gTU1NTVxuICAgICAgICBjYXNlICdNTU1NJyA6XG4gICAgICAgICAgICBhID0gY29uZmlnLl9sb2NhbGUubW9udGhzUGFyc2UoaW5wdXQpO1xuICAgICAgICAgICAgLy8gaWYgd2UgZGlkbid0IGZpbmQgYSBtb250aCBuYW1lLCBtYXJrIHRoZSBkYXRlIGFzIGludmFsaWQuXG4gICAgICAgICAgICBpZiAoYSAhPSBudWxsKSB7XG4gICAgICAgICAgICAgICAgZGF0ZVBhcnRBcnJheVtNT05USF0gPSBhO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBjb25maWcuX3BmLmludmFsaWRNb250aCA9IGlucHV0O1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIC8vIERBWSBPRiBNT05USFxuICAgICAgICBjYXNlICdEJyA6IC8vIGZhbGwgdGhyb3VnaCB0byBERFxuICAgICAgICBjYXNlICdERCcgOlxuICAgICAgICAgICAgaWYgKGlucHV0ICE9IG51bGwpIHtcbiAgICAgICAgICAgICAgICBkYXRlUGFydEFycmF5W0RBVEVdID0gdG9JbnQoaW5wdXQpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgJ0RvJyA6XG4gICAgICAgICAgICBpZiAoaW5wdXQgIT0gbnVsbCkge1xuICAgICAgICAgICAgICAgIGRhdGVQYXJ0QXJyYXlbREFURV0gPSB0b0ludChwYXJzZUludChpbnB1dCwgMTApKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAvLyBEQVkgT0YgWUVBUlxuICAgICAgICBjYXNlICdEREQnIDogLy8gZmFsbCB0aHJvdWdoIHRvIERERERcbiAgICAgICAgY2FzZSAnRERERCcgOlxuICAgICAgICAgICAgaWYgKGlucHV0ICE9IG51bGwpIHtcbiAgICAgICAgICAgICAgICBjb25maWcuX2RheU9mWWVhciA9IHRvSW50KGlucHV0KTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIC8vIFlFQVJcbiAgICAgICAgY2FzZSAnWVknIDpcbiAgICAgICAgICAgIGRhdGVQYXJ0QXJyYXlbWUVBUl0gPSBtb21lbnQucGFyc2VUd29EaWdpdFllYXIoaW5wdXQpO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgJ1lZWVknIDpcbiAgICAgICAgY2FzZSAnWVlZWVknIDpcbiAgICAgICAgY2FzZSAnWVlZWVlZJyA6XG4gICAgICAgICAgICBkYXRlUGFydEFycmF5W1lFQVJdID0gdG9JbnQoaW5wdXQpO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIC8vIEFNIC8gUE1cbiAgICAgICAgY2FzZSAnYScgOiAvLyBmYWxsIHRocm91Z2ggdG8gQVxuICAgICAgICBjYXNlICdBJyA6XG4gICAgICAgICAgICBjb25maWcuX2lzUG0gPSBjb25maWcuX2xvY2FsZS5pc1BNKGlucHV0KTtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAvLyAyNCBIT1VSXG4gICAgICAgIGNhc2UgJ0gnIDogLy8gZmFsbCB0aHJvdWdoIHRvIGhoXG4gICAgICAgIGNhc2UgJ0hIJyA6IC8vIGZhbGwgdGhyb3VnaCB0byBoaFxuICAgICAgICBjYXNlICdoJyA6IC8vIGZhbGwgdGhyb3VnaCB0byBoaFxuICAgICAgICBjYXNlICdoaCcgOlxuICAgICAgICAgICAgZGF0ZVBhcnRBcnJheVtIT1VSXSA9IHRvSW50KGlucHV0KTtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAvLyBNSU5VVEVcbiAgICAgICAgY2FzZSAnbScgOiAvLyBmYWxsIHRocm91Z2ggdG8gbW1cbiAgICAgICAgY2FzZSAnbW0nIDpcbiAgICAgICAgICAgIGRhdGVQYXJ0QXJyYXlbTUlOVVRFXSA9IHRvSW50KGlucHV0KTtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAvLyBTRUNPTkRcbiAgICAgICAgY2FzZSAncycgOiAvLyBmYWxsIHRocm91Z2ggdG8gc3NcbiAgICAgICAgY2FzZSAnc3MnIDpcbiAgICAgICAgICAgIGRhdGVQYXJ0QXJyYXlbU0VDT05EXSA9IHRvSW50KGlucHV0KTtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAvLyBNSUxMSVNFQ09ORFxuICAgICAgICBjYXNlICdTJyA6XG4gICAgICAgIGNhc2UgJ1NTJyA6XG4gICAgICAgIGNhc2UgJ1NTUycgOlxuICAgICAgICBjYXNlICdTU1NTJyA6XG4gICAgICAgICAgICBkYXRlUGFydEFycmF5W01JTExJU0VDT05EXSA9IHRvSW50KCgnMC4nICsgaW5wdXQpICogMTAwMCk7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgLy8gVU5JWCBUSU1FU1RBTVAgV0lUSCBNU1xuICAgICAgICBjYXNlICdYJzpcbiAgICAgICAgICAgIGNvbmZpZy5fZCA9IG5ldyBEYXRlKHBhcnNlRmxvYXQoaW5wdXQpICogMTAwMCk7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgLy8gVElNRVpPTkVcbiAgICAgICAgY2FzZSAnWicgOiAvLyBmYWxsIHRocm91Z2ggdG8gWlpcbiAgICAgICAgY2FzZSAnWlonIDpcbiAgICAgICAgICAgIGNvbmZpZy5fdXNlVVRDID0gdHJ1ZTtcbiAgICAgICAgICAgIGNvbmZpZy5fdHptID0gdGltZXpvbmVNaW51dGVzRnJvbVN0cmluZyhpbnB1dCk7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgLy8gV0VFS0RBWSAtIGh1bWFuXG4gICAgICAgIGNhc2UgJ2RkJzpcbiAgICAgICAgY2FzZSAnZGRkJzpcbiAgICAgICAgY2FzZSAnZGRkZCc6XG4gICAgICAgICAgICBhID0gY29uZmlnLl9sb2NhbGUud2Vla2RheXNQYXJzZShpbnB1dCk7XG4gICAgICAgICAgICAvLyBpZiB3ZSBkaWRuJ3QgZ2V0IGEgd2Vla2RheSBuYW1lLCBtYXJrIHRoZSBkYXRlIGFzIGludmFsaWRcbiAgICAgICAgICAgIGlmIChhICE9IG51bGwpIHtcbiAgICAgICAgICAgICAgICBjb25maWcuX3cgPSBjb25maWcuX3cgfHwge307XG4gICAgICAgICAgICAgICAgY29uZmlnLl93WydkJ10gPSBhO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBjb25maWcuX3BmLmludmFsaWRXZWVrZGF5ID0gaW5wdXQ7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgLy8gV0VFSywgV0VFSyBEQVkgLSBudW1lcmljXG4gICAgICAgIGNhc2UgJ3cnOlxuICAgICAgICBjYXNlICd3dyc6XG4gICAgICAgIGNhc2UgJ1cnOlxuICAgICAgICBjYXNlICdXVyc6XG4gICAgICAgIGNhc2UgJ2QnOlxuICAgICAgICBjYXNlICdlJzpcbiAgICAgICAgY2FzZSAnRSc6XG4gICAgICAgICAgICB0b2tlbiA9IHRva2VuLnN1YnN0cigwLCAxKTtcbiAgICAgICAgICAgIC8qIGZhbGxzIHRocm91Z2ggKi9cbiAgICAgICAgY2FzZSAnZ2dnZyc6XG4gICAgICAgIGNhc2UgJ0dHR0cnOlxuICAgICAgICBjYXNlICdHR0dHRyc6XG4gICAgICAgICAgICB0b2tlbiA9IHRva2VuLnN1YnN0cigwLCAyKTtcbiAgICAgICAgICAgIGlmIChpbnB1dCkge1xuICAgICAgICAgICAgICAgIGNvbmZpZy5fdyA9IGNvbmZpZy5fdyB8fCB7fTtcbiAgICAgICAgICAgICAgICBjb25maWcuX3dbdG9rZW5dID0gdG9JbnQoaW5wdXQpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgJ2dnJzpcbiAgICAgICAgY2FzZSAnR0cnOlxuICAgICAgICAgICAgY29uZmlnLl93ID0gY29uZmlnLl93IHx8IHt9O1xuICAgICAgICAgICAgY29uZmlnLl93W3Rva2VuXSA9IG1vbWVudC5wYXJzZVR3b0RpZ2l0WWVhcihpbnB1dCk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBmdW5jdGlvbiBkYXlPZlllYXJGcm9tV2Vla0luZm8oY29uZmlnKSB7XG4gICAgICAgIHZhciB3LCB3ZWVrWWVhciwgd2Vlaywgd2Vla2RheSwgZG93LCBkb3ksIHRlbXA7XG5cbiAgICAgICAgdyA9IGNvbmZpZy5fdztcbiAgICAgICAgaWYgKHcuR0cgIT0gbnVsbCB8fCB3LlcgIT0gbnVsbCB8fCB3LkUgIT0gbnVsbCkge1xuICAgICAgICAgICAgZG93ID0gMTtcbiAgICAgICAgICAgIGRveSA9IDQ7XG5cbiAgICAgICAgICAgIC8vIFRPRE86IFdlIG5lZWQgdG8gdGFrZSB0aGUgY3VycmVudCBpc29XZWVrWWVhciwgYnV0IHRoYXQgZGVwZW5kcyBvblxuICAgICAgICAgICAgLy8gaG93IHdlIGludGVycHJldCBub3cgKGxvY2FsLCB1dGMsIGZpeGVkIG9mZnNldCkuIFNvIGNyZWF0ZVxuICAgICAgICAgICAgLy8gYSBub3cgdmVyc2lvbiBvZiBjdXJyZW50IGNvbmZpZyAodGFrZSBsb2NhbC91dGMvb2Zmc2V0IGZsYWdzLCBhbmRcbiAgICAgICAgICAgIC8vIGNyZWF0ZSBub3cpLlxuICAgICAgICAgICAgd2Vla1llYXIgPSBkZmwody5HRywgY29uZmlnLl9hW1lFQVJdLCB3ZWVrT2ZZZWFyKG1vbWVudCgpLCAxLCA0KS55ZWFyKTtcbiAgICAgICAgICAgIHdlZWsgPSBkZmwody5XLCAxKTtcbiAgICAgICAgICAgIHdlZWtkYXkgPSBkZmwody5FLCAxKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGRvdyA9IGNvbmZpZy5fbG9jYWxlLl93ZWVrLmRvdztcbiAgICAgICAgICAgIGRveSA9IGNvbmZpZy5fbG9jYWxlLl93ZWVrLmRveTtcblxuICAgICAgICAgICAgd2Vla1llYXIgPSBkZmwody5nZywgY29uZmlnLl9hW1lFQVJdLCB3ZWVrT2ZZZWFyKG1vbWVudCgpLCBkb3csIGRveSkueWVhcik7XG4gICAgICAgICAgICB3ZWVrID0gZGZsKHcudywgMSk7XG5cbiAgICAgICAgICAgIGlmICh3LmQgIT0gbnVsbCkge1xuICAgICAgICAgICAgICAgIC8vIHdlZWtkYXkgLS0gbG93IGRheSBudW1iZXJzIGFyZSBjb25zaWRlcmVkIG5leHQgd2Vla1xuICAgICAgICAgICAgICAgIHdlZWtkYXkgPSB3LmQ7XG4gICAgICAgICAgICAgICAgaWYgKHdlZWtkYXkgPCBkb3cpIHtcbiAgICAgICAgICAgICAgICAgICAgKyt3ZWVrO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0gZWxzZSBpZiAody5lICE9IG51bGwpIHtcbiAgICAgICAgICAgICAgICAvLyBsb2NhbCB3ZWVrZGF5IC0tIGNvdW50aW5nIHN0YXJ0cyBmcm9tIGJlZ2luaW5nIG9mIHdlZWtcbiAgICAgICAgICAgICAgICB3ZWVrZGF5ID0gdy5lICsgZG93O1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAvLyBkZWZhdWx0IHRvIGJlZ2luaW5nIG9mIHdlZWtcbiAgICAgICAgICAgICAgICB3ZWVrZGF5ID0gZG93O1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHRlbXAgPSBkYXlPZlllYXJGcm9tV2Vla3Mod2Vla1llYXIsIHdlZWssIHdlZWtkYXksIGRveSwgZG93KTtcblxuICAgICAgICBjb25maWcuX2FbWUVBUl0gPSB0ZW1wLnllYXI7XG4gICAgICAgIGNvbmZpZy5fZGF5T2ZZZWFyID0gdGVtcC5kYXlPZlllYXI7XG4gICAgfVxuXG4gICAgLy8gY29udmVydCBhbiBhcnJheSB0byBhIGRhdGUuXG4gICAgLy8gdGhlIGFycmF5IHNob3VsZCBtaXJyb3IgdGhlIHBhcmFtZXRlcnMgYmVsb3dcbiAgICAvLyBub3RlOiBhbGwgdmFsdWVzIHBhc3QgdGhlIHllYXIgYXJlIG9wdGlvbmFsIGFuZCB3aWxsIGRlZmF1bHQgdG8gdGhlIGxvd2VzdCBwb3NzaWJsZSB2YWx1ZS5cbiAgICAvLyBbeWVhciwgbW9udGgsIGRheSAsIGhvdXIsIG1pbnV0ZSwgc2Vjb25kLCBtaWxsaXNlY29uZF1cbiAgICBmdW5jdGlvbiBkYXRlRnJvbUNvbmZpZyhjb25maWcpIHtcbiAgICAgICAgdmFyIGksIGRhdGUsIGlucHV0ID0gW10sIGN1cnJlbnREYXRlLCB5ZWFyVG9Vc2U7XG5cbiAgICAgICAgaWYgKGNvbmZpZy5fZCkge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgY3VycmVudERhdGUgPSBjdXJyZW50RGF0ZUFycmF5KGNvbmZpZyk7XG5cbiAgICAgICAgLy9jb21wdXRlIGRheSBvZiB0aGUgeWVhciBmcm9tIHdlZWtzIGFuZCB3ZWVrZGF5c1xuICAgICAgICBpZiAoY29uZmlnLl93ICYmIGNvbmZpZy5fYVtEQVRFXSA9PSBudWxsICYmIGNvbmZpZy5fYVtNT05USF0gPT0gbnVsbCkge1xuICAgICAgICAgICAgZGF5T2ZZZWFyRnJvbVdlZWtJbmZvKGNvbmZpZyk7XG4gICAgICAgIH1cblxuICAgICAgICAvL2lmIHRoZSBkYXkgb2YgdGhlIHllYXIgaXMgc2V0LCBmaWd1cmUgb3V0IHdoYXQgaXQgaXNcbiAgICAgICAgaWYgKGNvbmZpZy5fZGF5T2ZZZWFyKSB7XG4gICAgICAgICAgICB5ZWFyVG9Vc2UgPSBkZmwoY29uZmlnLl9hW1lFQVJdLCBjdXJyZW50RGF0ZVtZRUFSXSk7XG5cbiAgICAgICAgICAgIGlmIChjb25maWcuX2RheU9mWWVhciA+IGRheXNJblllYXIoeWVhclRvVXNlKSkge1xuICAgICAgICAgICAgICAgIGNvbmZpZy5fcGYuX292ZXJmbG93RGF5T2ZZZWFyID0gdHJ1ZTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgZGF0ZSA9IG1ha2VVVENEYXRlKHllYXJUb1VzZSwgMCwgY29uZmlnLl9kYXlPZlllYXIpO1xuICAgICAgICAgICAgY29uZmlnLl9hW01PTlRIXSA9IGRhdGUuZ2V0VVRDTW9udGgoKTtcbiAgICAgICAgICAgIGNvbmZpZy5fYVtEQVRFXSA9IGRhdGUuZ2V0VVRDRGF0ZSgpO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gRGVmYXVsdCB0byBjdXJyZW50IGRhdGUuXG4gICAgICAgIC8vICogaWYgbm8geWVhciwgbW9udGgsIGRheSBvZiBtb250aCBhcmUgZ2l2ZW4sIGRlZmF1bHQgdG8gdG9kYXlcbiAgICAgICAgLy8gKiBpZiBkYXkgb2YgbW9udGggaXMgZ2l2ZW4sIGRlZmF1bHQgbW9udGggYW5kIHllYXJcbiAgICAgICAgLy8gKiBpZiBtb250aCBpcyBnaXZlbiwgZGVmYXVsdCBvbmx5IHllYXJcbiAgICAgICAgLy8gKiBpZiB5ZWFyIGlzIGdpdmVuLCBkb24ndCBkZWZhdWx0IGFueXRoaW5nXG4gICAgICAgIGZvciAoaSA9IDA7IGkgPCAzICYmIGNvbmZpZy5fYVtpXSA9PSBudWxsOyArK2kpIHtcbiAgICAgICAgICAgIGNvbmZpZy5fYVtpXSA9IGlucHV0W2ldID0gY3VycmVudERhdGVbaV07XG4gICAgICAgIH1cblxuICAgICAgICAvLyBaZXJvIG91dCB3aGF0ZXZlciB3YXMgbm90IGRlZmF1bHRlZCwgaW5jbHVkaW5nIHRpbWVcbiAgICAgICAgZm9yICg7IGkgPCA3OyBpKyspIHtcbiAgICAgICAgICAgIGNvbmZpZy5fYVtpXSA9IGlucHV0W2ldID0gKGNvbmZpZy5fYVtpXSA9PSBudWxsKSA/IChpID09PSAyID8gMSA6IDApIDogY29uZmlnLl9hW2ldO1xuICAgICAgICB9XG5cbiAgICAgICAgY29uZmlnLl9kID0gKGNvbmZpZy5fdXNlVVRDID8gbWFrZVVUQ0RhdGUgOiBtYWtlRGF0ZSkuYXBwbHkobnVsbCwgaW5wdXQpO1xuICAgICAgICAvLyBBcHBseSB0aW1lem9uZSBvZmZzZXQgZnJvbSBpbnB1dC4gVGhlIGFjdHVhbCB6b25lIGNhbiBiZSBjaGFuZ2VkXG4gICAgICAgIC8vIHdpdGggcGFyc2Vab25lLlxuICAgICAgICBpZiAoY29uZmlnLl90em0gIT0gbnVsbCkge1xuICAgICAgICAgICAgY29uZmlnLl9kLnNldFVUQ01pbnV0ZXMoY29uZmlnLl9kLmdldFVUQ01pbnV0ZXMoKSArIGNvbmZpZy5fdHptKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIGZ1bmN0aW9uIGRhdGVGcm9tT2JqZWN0KGNvbmZpZykge1xuICAgICAgICB2YXIgbm9ybWFsaXplZElucHV0O1xuXG4gICAgICAgIGlmIChjb25maWcuX2QpIHtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIG5vcm1hbGl6ZWRJbnB1dCA9IG5vcm1hbGl6ZU9iamVjdFVuaXRzKGNvbmZpZy5faSk7XG4gICAgICAgIGNvbmZpZy5fYSA9IFtcbiAgICAgICAgICAgIG5vcm1hbGl6ZWRJbnB1dC55ZWFyLFxuICAgICAgICAgICAgbm9ybWFsaXplZElucHV0Lm1vbnRoLFxuICAgICAgICAgICAgbm9ybWFsaXplZElucHV0LmRheSxcbiAgICAgICAgICAgIG5vcm1hbGl6ZWRJbnB1dC5ob3VyLFxuICAgICAgICAgICAgbm9ybWFsaXplZElucHV0Lm1pbnV0ZSxcbiAgICAgICAgICAgIG5vcm1hbGl6ZWRJbnB1dC5zZWNvbmQsXG4gICAgICAgICAgICBub3JtYWxpemVkSW5wdXQubWlsbGlzZWNvbmRcbiAgICAgICAgXTtcblxuICAgICAgICBkYXRlRnJvbUNvbmZpZyhjb25maWcpO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIGN1cnJlbnREYXRlQXJyYXkoY29uZmlnKSB7XG4gICAgICAgIHZhciBub3cgPSBuZXcgRGF0ZSgpO1xuICAgICAgICBpZiAoY29uZmlnLl91c2VVVEMpIHtcbiAgICAgICAgICAgIHJldHVybiBbXG4gICAgICAgICAgICAgICAgbm93LmdldFVUQ0Z1bGxZZWFyKCksXG4gICAgICAgICAgICAgICAgbm93LmdldFVUQ01vbnRoKCksXG4gICAgICAgICAgICAgICAgbm93LmdldFVUQ0RhdGUoKVxuICAgICAgICAgICAgXTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHJldHVybiBbbm93LmdldEZ1bGxZZWFyKCksIG5vdy5nZXRNb250aCgpLCBub3cuZ2V0RGF0ZSgpXTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIC8vIGRhdGUgZnJvbSBzdHJpbmcgYW5kIGZvcm1hdCBzdHJpbmdcbiAgICBmdW5jdGlvbiBtYWtlRGF0ZUZyb21TdHJpbmdBbmRGb3JtYXQoY29uZmlnKSB7XG4gICAgICAgIGlmIChjb25maWcuX2YgPT09IG1vbWVudC5JU09fODYwMSkge1xuICAgICAgICAgICAgcGFyc2VJU08oY29uZmlnKTtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIGNvbmZpZy5fYSA9IFtdO1xuICAgICAgICBjb25maWcuX3BmLmVtcHR5ID0gdHJ1ZTtcblxuICAgICAgICAvLyBUaGlzIGFycmF5IGlzIHVzZWQgdG8gbWFrZSBhIERhdGUsIGVpdGhlciB3aXRoIGBuZXcgRGF0ZWAgb3IgYERhdGUuVVRDYFxuICAgICAgICB2YXIgc3RyaW5nID0gJycgKyBjb25maWcuX2ksXG4gICAgICAgICAgICBpLCBwYXJzZWRJbnB1dCwgdG9rZW5zLCB0b2tlbiwgc2tpcHBlZCxcbiAgICAgICAgICAgIHN0cmluZ0xlbmd0aCA9IHN0cmluZy5sZW5ndGgsXG4gICAgICAgICAgICB0b3RhbFBhcnNlZElucHV0TGVuZ3RoID0gMDtcblxuICAgICAgICB0b2tlbnMgPSBleHBhbmRGb3JtYXQoY29uZmlnLl9mLCBjb25maWcuX2xvY2FsZSkubWF0Y2goZm9ybWF0dGluZ1Rva2VucykgfHwgW107XG5cbiAgICAgICAgZm9yIChpID0gMDsgaSA8IHRva2Vucy5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgdG9rZW4gPSB0b2tlbnNbaV07XG4gICAgICAgICAgICBwYXJzZWRJbnB1dCA9IChzdHJpbmcubWF0Y2goZ2V0UGFyc2VSZWdleEZvclRva2VuKHRva2VuLCBjb25maWcpKSB8fCBbXSlbMF07XG4gICAgICAgICAgICBpZiAocGFyc2VkSW5wdXQpIHtcbiAgICAgICAgICAgICAgICBza2lwcGVkID0gc3RyaW5nLnN1YnN0cigwLCBzdHJpbmcuaW5kZXhPZihwYXJzZWRJbnB1dCkpO1xuICAgICAgICAgICAgICAgIGlmIChza2lwcGVkLmxlbmd0aCA+IDApIHtcbiAgICAgICAgICAgICAgICAgICAgY29uZmlnLl9wZi51bnVzZWRJbnB1dC5wdXNoKHNraXBwZWQpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBzdHJpbmcgPSBzdHJpbmcuc2xpY2Uoc3RyaW5nLmluZGV4T2YocGFyc2VkSW5wdXQpICsgcGFyc2VkSW5wdXQubGVuZ3RoKTtcbiAgICAgICAgICAgICAgICB0b3RhbFBhcnNlZElucHV0TGVuZ3RoICs9IHBhcnNlZElucHV0Lmxlbmd0aDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIC8vIGRvbid0IHBhcnNlIGlmIGl0J3Mgbm90IGEga25vd24gdG9rZW5cbiAgICAgICAgICAgIGlmIChmb3JtYXRUb2tlbkZ1bmN0aW9uc1t0b2tlbl0pIHtcbiAgICAgICAgICAgICAgICBpZiAocGFyc2VkSW5wdXQpIHtcbiAgICAgICAgICAgICAgICAgICAgY29uZmlnLl9wZi5lbXB0eSA9IGZhbHNlO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgY29uZmlnLl9wZi51bnVzZWRUb2tlbnMucHVzaCh0b2tlbik7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGFkZFRpbWVUb0FycmF5RnJvbVRva2VuKHRva2VuLCBwYXJzZWRJbnB1dCwgY29uZmlnKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2UgaWYgKGNvbmZpZy5fc3RyaWN0ICYmICFwYXJzZWRJbnB1dCkge1xuICAgICAgICAgICAgICAgIGNvbmZpZy5fcGYudW51c2VkVG9rZW5zLnB1c2godG9rZW4pO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgLy8gYWRkIHJlbWFpbmluZyB1bnBhcnNlZCBpbnB1dCBsZW5ndGggdG8gdGhlIHN0cmluZ1xuICAgICAgICBjb25maWcuX3BmLmNoYXJzTGVmdE92ZXIgPSBzdHJpbmdMZW5ndGggLSB0b3RhbFBhcnNlZElucHV0TGVuZ3RoO1xuICAgICAgICBpZiAoc3RyaW5nLmxlbmd0aCA+IDApIHtcbiAgICAgICAgICAgIGNvbmZpZy5fcGYudW51c2VkSW5wdXQucHVzaChzdHJpbmcpO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gaGFuZGxlIGFtIHBtXG4gICAgICAgIGlmIChjb25maWcuX2lzUG0gJiYgY29uZmlnLl9hW0hPVVJdIDwgMTIpIHtcbiAgICAgICAgICAgIGNvbmZpZy5fYVtIT1VSXSArPSAxMjtcbiAgICAgICAgfVxuICAgICAgICAvLyBpZiBpcyAxMiBhbSwgY2hhbmdlIGhvdXJzIHRvIDBcbiAgICAgICAgaWYgKGNvbmZpZy5faXNQbSA9PT0gZmFsc2UgJiYgY29uZmlnLl9hW0hPVVJdID09PSAxMikge1xuICAgICAgICAgICAgY29uZmlnLl9hW0hPVVJdID0gMDtcbiAgICAgICAgfVxuXG4gICAgICAgIGRhdGVGcm9tQ29uZmlnKGNvbmZpZyk7XG4gICAgICAgIGNoZWNrT3ZlcmZsb3coY29uZmlnKTtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiB1bmVzY2FwZUZvcm1hdChzKSB7XG4gICAgICAgIHJldHVybiBzLnJlcGxhY2UoL1xcXFwoXFxbKXxcXFxcKFxcXSl8XFxbKFteXFxdXFxbXSopXFxdfFxcXFwoLikvZywgZnVuY3Rpb24gKG1hdGNoZWQsIHAxLCBwMiwgcDMsIHA0KSB7XG4gICAgICAgICAgICByZXR1cm4gcDEgfHwgcDIgfHwgcDMgfHwgcDQ7XG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIC8vIENvZGUgZnJvbSBodHRwOi8vc3RhY2tvdmVyZmxvdy5jb20vcXVlc3Rpb25zLzM1NjE0OTMvaXMtdGhlcmUtYS1yZWdleHAtZXNjYXBlLWZ1bmN0aW9uLWluLWphdmFzY3JpcHRcbiAgICBmdW5jdGlvbiByZWdleHBFc2NhcGUocykge1xuICAgICAgICByZXR1cm4gcy5yZXBsYWNlKC9bLVxcL1xcXFxeJCorPy4oKXxbXFxde31dL2csICdcXFxcJCYnKTtcbiAgICB9XG5cbiAgICAvLyBkYXRlIGZyb20gc3RyaW5nIGFuZCBhcnJheSBvZiBmb3JtYXQgc3RyaW5nc1xuICAgIGZ1bmN0aW9uIG1ha2VEYXRlRnJvbVN0cmluZ0FuZEFycmF5KGNvbmZpZykge1xuICAgICAgICB2YXIgdGVtcENvbmZpZyxcbiAgICAgICAgICAgIGJlc3RNb21lbnQsXG5cbiAgICAgICAgICAgIHNjb3JlVG9CZWF0LFxuICAgICAgICAgICAgaSxcbiAgICAgICAgICAgIGN1cnJlbnRTY29yZTtcblxuICAgICAgICBpZiAoY29uZmlnLl9mLmxlbmd0aCA9PT0gMCkge1xuICAgICAgICAgICAgY29uZmlnLl9wZi5pbnZhbGlkRm9ybWF0ID0gdHJ1ZTtcbiAgICAgICAgICAgIGNvbmZpZy5fZCA9IG5ldyBEYXRlKE5hTik7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICBmb3IgKGkgPSAwOyBpIDwgY29uZmlnLl9mLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICBjdXJyZW50U2NvcmUgPSAwO1xuICAgICAgICAgICAgdGVtcENvbmZpZyA9IGNvcHlDb25maWcoe30sIGNvbmZpZyk7XG4gICAgICAgICAgICBpZiAoY29uZmlnLl91c2VVVEMgIT0gbnVsbCkge1xuICAgICAgICAgICAgICAgIHRlbXBDb25maWcuX3VzZVVUQyA9IGNvbmZpZy5fdXNlVVRDO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgdGVtcENvbmZpZy5fcGYgPSBkZWZhdWx0UGFyc2luZ0ZsYWdzKCk7XG4gICAgICAgICAgICB0ZW1wQ29uZmlnLl9mID0gY29uZmlnLl9mW2ldO1xuICAgICAgICAgICAgbWFrZURhdGVGcm9tU3RyaW5nQW5kRm9ybWF0KHRlbXBDb25maWcpO1xuXG4gICAgICAgICAgICBpZiAoIWlzVmFsaWQodGVtcENvbmZpZykpIHtcbiAgICAgICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgLy8gaWYgdGhlcmUgaXMgYW55IGlucHV0IHRoYXQgd2FzIG5vdCBwYXJzZWQgYWRkIGEgcGVuYWx0eSBmb3IgdGhhdCBmb3JtYXRcbiAgICAgICAgICAgIGN1cnJlbnRTY29yZSArPSB0ZW1wQ29uZmlnLl9wZi5jaGFyc0xlZnRPdmVyO1xuXG4gICAgICAgICAgICAvL29yIHRva2Vuc1xuICAgICAgICAgICAgY3VycmVudFNjb3JlICs9IHRlbXBDb25maWcuX3BmLnVudXNlZFRva2Vucy5sZW5ndGggKiAxMDtcblxuICAgICAgICAgICAgdGVtcENvbmZpZy5fcGYuc2NvcmUgPSBjdXJyZW50U2NvcmU7XG5cbiAgICAgICAgICAgIGlmIChzY29yZVRvQmVhdCA9PSBudWxsIHx8IGN1cnJlbnRTY29yZSA8IHNjb3JlVG9CZWF0KSB7XG4gICAgICAgICAgICAgICAgc2NvcmVUb0JlYXQgPSBjdXJyZW50U2NvcmU7XG4gICAgICAgICAgICAgICAgYmVzdE1vbWVudCA9IHRlbXBDb25maWc7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICBleHRlbmQoY29uZmlnLCBiZXN0TW9tZW50IHx8IHRlbXBDb25maWcpO1xuICAgIH1cblxuICAgIC8vIGRhdGUgZnJvbSBpc28gZm9ybWF0XG4gICAgZnVuY3Rpb24gcGFyc2VJU08oY29uZmlnKSB7XG4gICAgICAgIHZhciBpLCBsLFxuICAgICAgICAgICAgc3RyaW5nID0gY29uZmlnLl9pLFxuICAgICAgICAgICAgbWF0Y2ggPSBpc29SZWdleC5leGVjKHN0cmluZyk7XG5cbiAgICAgICAgaWYgKG1hdGNoKSB7XG4gICAgICAgICAgICBjb25maWcuX3BmLmlzbyA9IHRydWU7XG4gICAgICAgICAgICBmb3IgKGkgPSAwLCBsID0gaXNvRGF0ZXMubGVuZ3RoOyBpIDwgbDsgaSsrKSB7XG4gICAgICAgICAgICAgICAgaWYgKGlzb0RhdGVzW2ldWzFdLmV4ZWMoc3RyaW5nKSkge1xuICAgICAgICAgICAgICAgICAgICAvLyBtYXRjaFs1XSBzaG91bGQgYmUgJ1QnIG9yIHVuZGVmaW5lZFxuICAgICAgICAgICAgICAgICAgICBjb25maWcuX2YgPSBpc29EYXRlc1tpXVswXSArIChtYXRjaFs2XSB8fCAnICcpO1xuICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBmb3IgKGkgPSAwLCBsID0gaXNvVGltZXMubGVuZ3RoOyBpIDwgbDsgaSsrKSB7XG4gICAgICAgICAgICAgICAgaWYgKGlzb1RpbWVzW2ldWzFdLmV4ZWMoc3RyaW5nKSkge1xuICAgICAgICAgICAgICAgICAgICBjb25maWcuX2YgKz0gaXNvVGltZXNbaV1bMF07XG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmIChzdHJpbmcubWF0Y2gocGFyc2VUb2tlblRpbWV6b25lKSkge1xuICAgICAgICAgICAgICAgIGNvbmZpZy5fZiArPSAnWic7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBtYWtlRGF0ZUZyb21TdHJpbmdBbmRGb3JtYXQoY29uZmlnKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGNvbmZpZy5faXNWYWxpZCA9IGZhbHNlO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgLy8gZGF0ZSBmcm9tIGlzbyBmb3JtYXQgb3IgZmFsbGJhY2tcbiAgICBmdW5jdGlvbiBtYWtlRGF0ZUZyb21TdHJpbmcoY29uZmlnKSB7XG4gICAgICAgIHBhcnNlSVNPKGNvbmZpZyk7XG4gICAgICAgIGlmIChjb25maWcuX2lzVmFsaWQgPT09IGZhbHNlKSB7XG4gICAgICAgICAgICBkZWxldGUgY29uZmlnLl9pc1ZhbGlkO1xuICAgICAgICAgICAgbW9tZW50LmNyZWF0ZUZyb21JbnB1dEZhbGxiYWNrKGNvbmZpZyk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBmdW5jdGlvbiBtYXAoYXJyLCBmbikge1xuICAgICAgICB2YXIgcmVzID0gW10sIGk7XG4gICAgICAgIGZvciAoaSA9IDA7IGkgPCBhcnIubGVuZ3RoOyArK2kpIHtcbiAgICAgICAgICAgIHJlcy5wdXNoKGZuKGFycltpXSwgaSkpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiByZXM7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gbWFrZURhdGVGcm9tSW5wdXQoY29uZmlnKSB7XG4gICAgICAgIHZhciBpbnB1dCA9IGNvbmZpZy5faSwgbWF0Y2hlZDtcbiAgICAgICAgaWYgKGlucHV0ID09PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgIGNvbmZpZy5fZCA9IG5ldyBEYXRlKCk7XG4gICAgICAgIH0gZWxzZSBpZiAoaXNEYXRlKGlucHV0KSkge1xuICAgICAgICAgICAgY29uZmlnLl9kID0gbmV3IERhdGUoK2lucHV0KTtcbiAgICAgICAgfSBlbHNlIGlmICgobWF0Y2hlZCA9IGFzcE5ldEpzb25SZWdleC5leGVjKGlucHV0KSkgIT09IG51bGwpIHtcbiAgICAgICAgICAgIGNvbmZpZy5fZCA9IG5ldyBEYXRlKCttYXRjaGVkWzFdKTtcbiAgICAgICAgfSBlbHNlIGlmICh0eXBlb2YgaW5wdXQgPT09ICdzdHJpbmcnKSB7XG4gICAgICAgICAgICBtYWtlRGF0ZUZyb21TdHJpbmcoY29uZmlnKTtcbiAgICAgICAgfSBlbHNlIGlmIChpc0FycmF5KGlucHV0KSkge1xuICAgICAgICAgICAgY29uZmlnLl9hID0gbWFwKGlucHV0LnNsaWNlKDApLCBmdW5jdGlvbiAob2JqKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHBhcnNlSW50KG9iaiwgMTApO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICBkYXRlRnJvbUNvbmZpZyhjb25maWcpO1xuICAgICAgICB9IGVsc2UgaWYgKHR5cGVvZihpbnB1dCkgPT09ICdvYmplY3QnKSB7XG4gICAgICAgICAgICBkYXRlRnJvbU9iamVjdChjb25maWcpO1xuICAgICAgICB9IGVsc2UgaWYgKHR5cGVvZihpbnB1dCkgPT09ICdudW1iZXInKSB7XG4gICAgICAgICAgICAvLyBmcm9tIG1pbGxpc2Vjb25kc1xuICAgICAgICAgICAgY29uZmlnLl9kID0gbmV3IERhdGUoaW5wdXQpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgbW9tZW50LmNyZWF0ZUZyb21JbnB1dEZhbGxiYWNrKGNvbmZpZyk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBmdW5jdGlvbiBtYWtlRGF0ZSh5LCBtLCBkLCBoLCBNLCBzLCBtcykge1xuICAgICAgICAvL2Nhbid0IGp1c3QgYXBwbHkoKSB0byBjcmVhdGUgYSBkYXRlOlxuICAgICAgICAvL2h0dHA6Ly9zdGFja292ZXJmbG93LmNvbS9xdWVzdGlvbnMvMTgxMzQ4L2luc3RhbnRpYXRpbmctYS1qYXZhc2NyaXB0LW9iamVjdC1ieS1jYWxsaW5nLXByb3RvdHlwZS1jb25zdHJ1Y3Rvci1hcHBseVxuICAgICAgICB2YXIgZGF0ZSA9IG5ldyBEYXRlKHksIG0sIGQsIGgsIE0sIHMsIG1zKTtcblxuICAgICAgICAvL3RoZSBkYXRlIGNvbnN0cnVjdG9yIGRvZXNuJ3QgYWNjZXB0IHllYXJzIDwgMTk3MFxuICAgICAgICBpZiAoeSA8IDE5NzApIHtcbiAgICAgICAgICAgIGRhdGUuc2V0RnVsbFllYXIoeSk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGRhdGU7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gbWFrZVVUQ0RhdGUoeSkge1xuICAgICAgICB2YXIgZGF0ZSA9IG5ldyBEYXRlKERhdGUuVVRDLmFwcGx5KG51bGwsIGFyZ3VtZW50cykpO1xuICAgICAgICBpZiAoeSA8IDE5NzApIHtcbiAgICAgICAgICAgIGRhdGUuc2V0VVRDRnVsbFllYXIoeSk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGRhdGU7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gcGFyc2VXZWVrZGF5KGlucHV0LCBsb2NhbGUpIHtcbiAgICAgICAgaWYgKHR5cGVvZiBpbnB1dCA9PT0gJ3N0cmluZycpIHtcbiAgICAgICAgICAgIGlmICghaXNOYU4oaW5wdXQpKSB7XG4gICAgICAgICAgICAgICAgaW5wdXQgPSBwYXJzZUludChpbnB1dCwgMTApO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgaW5wdXQgPSBsb2NhbGUud2Vla2RheXNQYXJzZShpbnB1dCk7XG4gICAgICAgICAgICAgICAgaWYgKHR5cGVvZiBpbnB1dCAhPT0gJ251bWJlcicpIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHJldHVybiBpbnB1dDtcbiAgICB9XG5cbiAgICAvKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqXG4gICAgICAgIFJlbGF0aXZlIFRpbWVcbiAgICAqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKiovXG5cblxuICAgIC8vIGhlbHBlciBmdW5jdGlvbiBmb3IgbW9tZW50LmZuLmZyb20sIG1vbWVudC5mbi5mcm9tTm93LCBhbmQgbW9tZW50LmR1cmF0aW9uLmZuLmh1bWFuaXplXG4gICAgZnVuY3Rpb24gc3Vic3RpdHV0ZVRpbWVBZ28oc3RyaW5nLCBudW1iZXIsIHdpdGhvdXRTdWZmaXgsIGlzRnV0dXJlLCBsb2NhbGUpIHtcbiAgICAgICAgcmV0dXJuIGxvY2FsZS5yZWxhdGl2ZVRpbWUobnVtYmVyIHx8IDEsICEhd2l0aG91dFN1ZmZpeCwgc3RyaW5nLCBpc0Z1dHVyZSk7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gcmVsYXRpdmVUaW1lKHBvc05lZ0R1cmF0aW9uLCB3aXRob3V0U3VmZml4LCBsb2NhbGUpIHtcbiAgICAgICAgdmFyIGR1cmF0aW9uID0gbW9tZW50LmR1cmF0aW9uKHBvc05lZ0R1cmF0aW9uKS5hYnMoKSxcbiAgICAgICAgICAgIHNlY29uZHMgPSByb3VuZChkdXJhdGlvbi5hcygncycpKSxcbiAgICAgICAgICAgIG1pbnV0ZXMgPSByb3VuZChkdXJhdGlvbi5hcygnbScpKSxcbiAgICAgICAgICAgIGhvdXJzID0gcm91bmQoZHVyYXRpb24uYXMoJ2gnKSksXG4gICAgICAgICAgICBkYXlzID0gcm91bmQoZHVyYXRpb24uYXMoJ2QnKSksXG4gICAgICAgICAgICBtb250aHMgPSByb3VuZChkdXJhdGlvbi5hcygnTScpKSxcbiAgICAgICAgICAgIHllYXJzID0gcm91bmQoZHVyYXRpb24uYXMoJ3knKSksXG5cbiAgICAgICAgICAgIGFyZ3MgPSBzZWNvbmRzIDwgcmVsYXRpdmVUaW1lVGhyZXNob2xkcy5zICYmIFsncycsIHNlY29uZHNdIHx8XG4gICAgICAgICAgICAgICAgbWludXRlcyA9PT0gMSAmJiBbJ20nXSB8fFxuICAgICAgICAgICAgICAgIG1pbnV0ZXMgPCByZWxhdGl2ZVRpbWVUaHJlc2hvbGRzLm0gJiYgWydtbScsIG1pbnV0ZXNdIHx8XG4gICAgICAgICAgICAgICAgaG91cnMgPT09IDEgJiYgWydoJ10gfHxcbiAgICAgICAgICAgICAgICBob3VycyA8IHJlbGF0aXZlVGltZVRocmVzaG9sZHMuaCAmJiBbJ2hoJywgaG91cnNdIHx8XG4gICAgICAgICAgICAgICAgZGF5cyA9PT0gMSAmJiBbJ2QnXSB8fFxuICAgICAgICAgICAgICAgIGRheXMgPCByZWxhdGl2ZVRpbWVUaHJlc2hvbGRzLmQgJiYgWydkZCcsIGRheXNdIHx8XG4gICAgICAgICAgICAgICAgbW9udGhzID09PSAxICYmIFsnTSddIHx8XG4gICAgICAgICAgICAgICAgbW9udGhzIDwgcmVsYXRpdmVUaW1lVGhyZXNob2xkcy5NICYmIFsnTU0nLCBtb250aHNdIHx8XG4gICAgICAgICAgICAgICAgeWVhcnMgPT09IDEgJiYgWyd5J10gfHwgWyd5eScsIHllYXJzXTtcblxuICAgICAgICBhcmdzWzJdID0gd2l0aG91dFN1ZmZpeDtcbiAgICAgICAgYXJnc1szXSA9ICtwb3NOZWdEdXJhdGlvbiA+IDA7XG4gICAgICAgIGFyZ3NbNF0gPSBsb2NhbGU7XG4gICAgICAgIHJldHVybiBzdWJzdGl0dXRlVGltZUFnby5hcHBseSh7fSwgYXJncyk7XG4gICAgfVxuXG5cbiAgICAvKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqXG4gICAgICAgIFdlZWsgb2YgWWVhclxuICAgICoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKi9cblxuXG4gICAgLy8gZmlyc3REYXlPZldlZWsgICAgICAgMCA9IHN1biwgNiA9IHNhdFxuICAgIC8vICAgICAgICAgICAgICAgICAgICAgIHRoZSBkYXkgb2YgdGhlIHdlZWsgdGhhdCBzdGFydHMgdGhlIHdlZWtcbiAgICAvLyAgICAgICAgICAgICAgICAgICAgICAodXN1YWxseSBzdW5kYXkgb3IgbW9uZGF5KVxuICAgIC8vIGZpcnN0RGF5T2ZXZWVrT2ZZZWFyIDAgPSBzdW4sIDYgPSBzYXRcbiAgICAvLyAgICAgICAgICAgICAgICAgICAgICB0aGUgZmlyc3Qgd2VlayBpcyB0aGUgd2VlayB0aGF0IGNvbnRhaW5zIHRoZSBmaXJzdFxuICAgIC8vICAgICAgICAgICAgICAgICAgICAgIG9mIHRoaXMgZGF5IG9mIHRoZSB3ZWVrXG4gICAgLy8gICAgICAgICAgICAgICAgICAgICAgKGVnLiBJU08gd2Vla3MgdXNlIHRodXJzZGF5ICg0KSlcbiAgICBmdW5jdGlvbiB3ZWVrT2ZZZWFyKG1vbSwgZmlyc3REYXlPZldlZWssIGZpcnN0RGF5T2ZXZWVrT2ZZZWFyKSB7XG4gICAgICAgIHZhciBlbmQgPSBmaXJzdERheU9mV2Vla09mWWVhciAtIGZpcnN0RGF5T2ZXZWVrLFxuICAgICAgICAgICAgZGF5c1RvRGF5T2ZXZWVrID0gZmlyc3REYXlPZldlZWtPZlllYXIgLSBtb20uZGF5KCksXG4gICAgICAgICAgICBhZGp1c3RlZE1vbWVudDtcblxuXG4gICAgICAgIGlmIChkYXlzVG9EYXlPZldlZWsgPiBlbmQpIHtcbiAgICAgICAgICAgIGRheXNUb0RheU9mV2VlayAtPSA3O1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKGRheXNUb0RheU9mV2VlayA8IGVuZCAtIDcpIHtcbiAgICAgICAgICAgIGRheXNUb0RheU9mV2VlayArPSA3O1xuICAgICAgICB9XG5cbiAgICAgICAgYWRqdXN0ZWRNb21lbnQgPSBtb21lbnQobW9tKS5hZGQoZGF5c1RvRGF5T2ZXZWVrLCAnZCcpO1xuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgd2VlazogTWF0aC5jZWlsKGFkanVzdGVkTW9tZW50LmRheU9mWWVhcigpIC8gNyksXG4gICAgICAgICAgICB5ZWFyOiBhZGp1c3RlZE1vbWVudC55ZWFyKClcbiAgICAgICAgfTtcbiAgICB9XG5cbiAgICAvL2h0dHA6Ly9lbi53aWtpcGVkaWEub3JnL3dpa2kvSVNPX3dlZWtfZGF0ZSNDYWxjdWxhdGluZ19hX2RhdGVfZ2l2ZW5fdGhlX3llYXIuMkNfd2Vla19udW1iZXJfYW5kX3dlZWtkYXlcbiAgICBmdW5jdGlvbiBkYXlPZlllYXJGcm9tV2Vla3MoeWVhciwgd2Vlaywgd2Vla2RheSwgZmlyc3REYXlPZldlZWtPZlllYXIsIGZpcnN0RGF5T2ZXZWVrKSB7XG4gICAgICAgIHZhciBkID0gbWFrZVVUQ0RhdGUoeWVhciwgMCwgMSkuZ2V0VVRDRGF5KCksIGRheXNUb0FkZCwgZGF5T2ZZZWFyO1xuXG4gICAgICAgIGQgPSBkID09PSAwID8gNyA6IGQ7XG4gICAgICAgIHdlZWtkYXkgPSB3ZWVrZGF5ICE9IG51bGwgPyB3ZWVrZGF5IDogZmlyc3REYXlPZldlZWs7XG4gICAgICAgIGRheXNUb0FkZCA9IGZpcnN0RGF5T2ZXZWVrIC0gZCArIChkID4gZmlyc3REYXlPZldlZWtPZlllYXIgPyA3IDogMCkgLSAoZCA8IGZpcnN0RGF5T2ZXZWVrID8gNyA6IDApO1xuICAgICAgICBkYXlPZlllYXIgPSA3ICogKHdlZWsgLSAxKSArICh3ZWVrZGF5IC0gZmlyc3REYXlPZldlZWspICsgZGF5c1RvQWRkICsgMTtcblxuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgeWVhcjogZGF5T2ZZZWFyID4gMCA/IHllYXIgOiB5ZWFyIC0gMSxcbiAgICAgICAgICAgIGRheU9mWWVhcjogZGF5T2ZZZWFyID4gMCA/ICBkYXlPZlllYXIgOiBkYXlzSW5ZZWFyKHllYXIgLSAxKSArIGRheU9mWWVhclxuICAgICAgICB9O1xuICAgIH1cblxuICAgIC8qKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKipcbiAgICAgICAgVG9wIExldmVsIEZ1bmN0aW9uc1xuICAgICoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKi9cblxuICAgIGZ1bmN0aW9uIG1ha2VNb21lbnQoY29uZmlnKSB7XG4gICAgICAgIHZhciBpbnB1dCA9IGNvbmZpZy5faSxcbiAgICAgICAgICAgIGZvcm1hdCA9IGNvbmZpZy5fZjtcblxuICAgICAgICBjb25maWcuX2xvY2FsZSA9IGNvbmZpZy5fbG9jYWxlIHx8IG1vbWVudC5sb2NhbGVEYXRhKGNvbmZpZy5fbCk7XG5cbiAgICAgICAgaWYgKGlucHV0ID09PSBudWxsIHx8IChmb3JtYXQgPT09IHVuZGVmaW5lZCAmJiBpbnB1dCA9PT0gJycpKSB7XG4gICAgICAgICAgICByZXR1cm4gbW9tZW50LmludmFsaWQoe251bGxJbnB1dDogdHJ1ZX0pO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKHR5cGVvZiBpbnB1dCA9PT0gJ3N0cmluZycpIHtcbiAgICAgICAgICAgIGNvbmZpZy5faSA9IGlucHV0ID0gY29uZmlnLl9sb2NhbGUucHJlcGFyc2UoaW5wdXQpO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKG1vbWVudC5pc01vbWVudChpbnB1dCkpIHtcbiAgICAgICAgICAgIHJldHVybiBuZXcgTW9tZW50KGlucHV0LCB0cnVlKTtcbiAgICAgICAgfSBlbHNlIGlmIChmb3JtYXQpIHtcbiAgICAgICAgICAgIGlmIChpc0FycmF5KGZvcm1hdCkpIHtcbiAgICAgICAgICAgICAgICBtYWtlRGF0ZUZyb21TdHJpbmdBbmRBcnJheShjb25maWcpO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBtYWtlRGF0ZUZyb21TdHJpbmdBbmRGb3JtYXQoY29uZmlnKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIG1ha2VEYXRlRnJvbUlucHV0KGNvbmZpZyk7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gbmV3IE1vbWVudChjb25maWcpO1xuICAgIH1cblxuICAgIG1vbWVudCA9IGZ1bmN0aW9uIChpbnB1dCwgZm9ybWF0LCBsb2NhbGUsIHN0cmljdCkge1xuICAgICAgICB2YXIgYztcblxuICAgICAgICBpZiAodHlwZW9mKGxvY2FsZSkgPT09ICdib29sZWFuJykge1xuICAgICAgICAgICAgc3RyaWN0ID0gbG9jYWxlO1xuICAgICAgICAgICAgbG9jYWxlID0gdW5kZWZpbmVkO1xuICAgICAgICB9XG4gICAgICAgIC8vIG9iamVjdCBjb25zdHJ1Y3Rpb24gbXVzdCBiZSBkb25lIHRoaXMgd2F5LlxuICAgICAgICAvLyBodHRwczovL2dpdGh1Yi5jb20vbW9tZW50L21vbWVudC9pc3N1ZXMvMTQyM1xuICAgICAgICBjID0ge307XG4gICAgICAgIGMuX2lzQU1vbWVudE9iamVjdCA9IHRydWU7XG4gICAgICAgIGMuX2kgPSBpbnB1dDtcbiAgICAgICAgYy5fZiA9IGZvcm1hdDtcbiAgICAgICAgYy5fbCA9IGxvY2FsZTtcbiAgICAgICAgYy5fc3RyaWN0ID0gc3RyaWN0O1xuICAgICAgICBjLl9pc1VUQyA9IGZhbHNlO1xuICAgICAgICBjLl9wZiA9IGRlZmF1bHRQYXJzaW5nRmxhZ3MoKTtcblxuICAgICAgICByZXR1cm4gbWFrZU1vbWVudChjKTtcbiAgICB9O1xuXG4gICAgbW9tZW50LnN1cHByZXNzRGVwcmVjYXRpb25XYXJuaW5ncyA9IGZhbHNlO1xuXG4gICAgbW9tZW50LmNyZWF0ZUZyb21JbnB1dEZhbGxiYWNrID0gZGVwcmVjYXRlKFxuICAgICAgICAnbW9tZW50IGNvbnN0cnVjdGlvbiBmYWxscyBiYWNrIHRvIGpzIERhdGUuIFRoaXMgaXMgJyArXG4gICAgICAgICdkaXNjb3VyYWdlZCBhbmQgd2lsbCBiZSByZW1vdmVkIGluIHVwY29taW5nIG1ham9yICcgK1xuICAgICAgICAncmVsZWFzZS4gUGxlYXNlIHJlZmVyIHRvICcgK1xuICAgICAgICAnaHR0cHM6Ly9naXRodWIuY29tL21vbWVudC9tb21lbnQvaXNzdWVzLzE0MDcgZm9yIG1vcmUgaW5mby4nLFxuICAgICAgICBmdW5jdGlvbiAoY29uZmlnKSB7XG4gICAgICAgICAgICBjb25maWcuX2QgPSBuZXcgRGF0ZShjb25maWcuX2kpO1xuICAgICAgICB9XG4gICAgKTtcblxuICAgIC8vIFBpY2sgYSBtb21lbnQgbSBmcm9tIG1vbWVudHMgc28gdGhhdCBtW2ZuXShvdGhlcikgaXMgdHJ1ZSBmb3IgYWxsXG4gICAgLy8gb3RoZXIuIFRoaXMgcmVsaWVzIG9uIHRoZSBmdW5jdGlvbiBmbiB0byBiZSB0cmFuc2l0aXZlLlxuICAgIC8vXG4gICAgLy8gbW9tZW50cyBzaG91bGQgZWl0aGVyIGJlIGFuIGFycmF5IG9mIG1vbWVudCBvYmplY3RzIG9yIGFuIGFycmF5LCB3aG9zZVxuICAgIC8vIGZpcnN0IGVsZW1lbnQgaXMgYW4gYXJyYXkgb2YgbW9tZW50IG9iamVjdHMuXG4gICAgZnVuY3Rpb24gcGlja0J5KGZuLCBtb21lbnRzKSB7XG4gICAgICAgIHZhciByZXMsIGk7XG4gICAgICAgIGlmIChtb21lbnRzLmxlbmd0aCA9PT0gMSAmJiBpc0FycmF5KG1vbWVudHNbMF0pKSB7XG4gICAgICAgICAgICBtb21lbnRzID0gbW9tZW50c1swXTtcbiAgICAgICAgfVxuICAgICAgICBpZiAoIW1vbWVudHMubGVuZ3RoKSB7XG4gICAgICAgICAgICByZXR1cm4gbW9tZW50KCk7XG4gICAgICAgIH1cbiAgICAgICAgcmVzID0gbW9tZW50c1swXTtcbiAgICAgICAgZm9yIChpID0gMTsgaSA8IG1vbWVudHMubGVuZ3RoOyArK2kpIHtcbiAgICAgICAgICAgIGlmIChtb21lbnRzW2ldW2ZuXShyZXMpKSB7XG4gICAgICAgICAgICAgICAgcmVzID0gbW9tZW50c1tpXTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gcmVzO1xuICAgIH1cblxuICAgIG1vbWVudC5taW4gPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHZhciBhcmdzID0gW10uc2xpY2UuY2FsbChhcmd1bWVudHMsIDApO1xuXG4gICAgICAgIHJldHVybiBwaWNrQnkoJ2lzQmVmb3JlJywgYXJncyk7XG4gICAgfTtcblxuICAgIG1vbWVudC5tYXggPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHZhciBhcmdzID0gW10uc2xpY2UuY2FsbChhcmd1bWVudHMsIDApO1xuXG4gICAgICAgIHJldHVybiBwaWNrQnkoJ2lzQWZ0ZXInLCBhcmdzKTtcbiAgICB9O1xuXG4gICAgLy8gY3JlYXRpbmcgd2l0aCB1dGNcbiAgICBtb21lbnQudXRjID0gZnVuY3Rpb24gKGlucHV0LCBmb3JtYXQsIGxvY2FsZSwgc3RyaWN0KSB7XG4gICAgICAgIHZhciBjO1xuXG4gICAgICAgIGlmICh0eXBlb2YobG9jYWxlKSA9PT0gJ2Jvb2xlYW4nKSB7XG4gICAgICAgICAgICBzdHJpY3QgPSBsb2NhbGU7XG4gICAgICAgICAgICBsb2NhbGUgPSB1bmRlZmluZWQ7XG4gICAgICAgIH1cbiAgICAgICAgLy8gb2JqZWN0IGNvbnN0cnVjdGlvbiBtdXN0IGJlIGRvbmUgdGhpcyB3YXkuXG4gICAgICAgIC8vIGh0dHBzOi8vZ2l0aHViLmNvbS9tb21lbnQvbW9tZW50L2lzc3Vlcy8xNDIzXG4gICAgICAgIGMgPSB7fTtcbiAgICAgICAgYy5faXNBTW9tZW50T2JqZWN0ID0gdHJ1ZTtcbiAgICAgICAgYy5fdXNlVVRDID0gdHJ1ZTtcbiAgICAgICAgYy5faXNVVEMgPSB0cnVlO1xuICAgICAgICBjLl9sID0gbG9jYWxlO1xuICAgICAgICBjLl9pID0gaW5wdXQ7XG4gICAgICAgIGMuX2YgPSBmb3JtYXQ7XG4gICAgICAgIGMuX3N0cmljdCA9IHN0cmljdDtcbiAgICAgICAgYy5fcGYgPSBkZWZhdWx0UGFyc2luZ0ZsYWdzKCk7XG5cbiAgICAgICAgcmV0dXJuIG1ha2VNb21lbnQoYykudXRjKCk7XG4gICAgfTtcblxuICAgIC8vIGNyZWF0aW5nIHdpdGggdW5peCB0aW1lc3RhbXAgKGluIHNlY29uZHMpXG4gICAgbW9tZW50LnVuaXggPSBmdW5jdGlvbiAoaW5wdXQpIHtcbiAgICAgICAgcmV0dXJuIG1vbWVudChpbnB1dCAqIDEwMDApO1xuICAgIH07XG5cbiAgICAvLyBkdXJhdGlvblxuICAgIG1vbWVudC5kdXJhdGlvbiA9IGZ1bmN0aW9uIChpbnB1dCwga2V5KSB7XG4gICAgICAgIHZhciBkdXJhdGlvbiA9IGlucHV0LFxuICAgICAgICAgICAgLy8gbWF0Y2hpbmcgYWdhaW5zdCByZWdleHAgaXMgZXhwZW5zaXZlLCBkbyBpdCBvbiBkZW1hbmRcbiAgICAgICAgICAgIG1hdGNoID0gbnVsbCxcbiAgICAgICAgICAgIHNpZ24sXG4gICAgICAgICAgICByZXQsXG4gICAgICAgICAgICBwYXJzZUlzbyxcbiAgICAgICAgICAgIGRpZmZSZXM7XG5cbiAgICAgICAgaWYgKG1vbWVudC5pc0R1cmF0aW9uKGlucHV0KSkge1xuICAgICAgICAgICAgZHVyYXRpb24gPSB7XG4gICAgICAgICAgICAgICAgbXM6IGlucHV0Ll9taWxsaXNlY29uZHMsXG4gICAgICAgICAgICAgICAgZDogaW5wdXQuX2RheXMsXG4gICAgICAgICAgICAgICAgTTogaW5wdXQuX21vbnRoc1xuICAgICAgICAgICAgfTtcbiAgICAgICAgfSBlbHNlIGlmICh0eXBlb2YgaW5wdXQgPT09ICdudW1iZXInKSB7XG4gICAgICAgICAgICBkdXJhdGlvbiA9IHt9O1xuICAgICAgICAgICAgaWYgKGtleSkge1xuICAgICAgICAgICAgICAgIGR1cmF0aW9uW2tleV0gPSBpbnB1dDtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgZHVyYXRpb24ubWlsbGlzZWNvbmRzID0gaW5wdXQ7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0gZWxzZSBpZiAoISEobWF0Y2ggPSBhc3BOZXRUaW1lU3Bhbkpzb25SZWdleC5leGVjKGlucHV0KSkpIHtcbiAgICAgICAgICAgIHNpZ24gPSAobWF0Y2hbMV0gPT09ICctJykgPyAtMSA6IDE7XG4gICAgICAgICAgICBkdXJhdGlvbiA9IHtcbiAgICAgICAgICAgICAgICB5OiAwLFxuICAgICAgICAgICAgICAgIGQ6IHRvSW50KG1hdGNoW0RBVEVdKSAqIHNpZ24sXG4gICAgICAgICAgICAgICAgaDogdG9JbnQobWF0Y2hbSE9VUl0pICogc2lnbixcbiAgICAgICAgICAgICAgICBtOiB0b0ludChtYXRjaFtNSU5VVEVdKSAqIHNpZ24sXG4gICAgICAgICAgICAgICAgczogdG9JbnQobWF0Y2hbU0VDT05EXSkgKiBzaWduLFxuICAgICAgICAgICAgICAgIG1zOiB0b0ludChtYXRjaFtNSUxMSVNFQ09ORF0pICogc2lnblxuICAgICAgICAgICAgfTtcbiAgICAgICAgfSBlbHNlIGlmICghIShtYXRjaCA9IGlzb0R1cmF0aW9uUmVnZXguZXhlYyhpbnB1dCkpKSB7XG4gICAgICAgICAgICBzaWduID0gKG1hdGNoWzFdID09PSAnLScpID8gLTEgOiAxO1xuICAgICAgICAgICAgcGFyc2VJc28gPSBmdW5jdGlvbiAoaW5wKSB7XG4gICAgICAgICAgICAgICAgLy8gV2UnZCBub3JtYWxseSB1c2Ugfn5pbnAgZm9yIHRoaXMsIGJ1dCB1bmZvcnR1bmF0ZWx5IGl0IGFsc29cbiAgICAgICAgICAgICAgICAvLyBjb252ZXJ0cyBmbG9hdHMgdG8gaW50cy5cbiAgICAgICAgICAgICAgICAvLyBpbnAgbWF5IGJlIHVuZGVmaW5lZCwgc28gY2FyZWZ1bCBjYWxsaW5nIHJlcGxhY2Ugb24gaXQuXG4gICAgICAgICAgICAgICAgdmFyIHJlcyA9IGlucCAmJiBwYXJzZUZsb2F0KGlucC5yZXBsYWNlKCcsJywgJy4nKSk7XG4gICAgICAgICAgICAgICAgLy8gYXBwbHkgc2lnbiB3aGlsZSB3ZSdyZSBhdCBpdFxuICAgICAgICAgICAgICAgIHJldHVybiAoaXNOYU4ocmVzKSA/IDAgOiByZXMpICogc2lnbjtcbiAgICAgICAgICAgIH07XG4gICAgICAgICAgICBkdXJhdGlvbiA9IHtcbiAgICAgICAgICAgICAgICB5OiBwYXJzZUlzbyhtYXRjaFsyXSksXG4gICAgICAgICAgICAgICAgTTogcGFyc2VJc28obWF0Y2hbM10pLFxuICAgICAgICAgICAgICAgIGQ6IHBhcnNlSXNvKG1hdGNoWzRdKSxcbiAgICAgICAgICAgICAgICBoOiBwYXJzZUlzbyhtYXRjaFs1XSksXG4gICAgICAgICAgICAgICAgbTogcGFyc2VJc28obWF0Y2hbNl0pLFxuICAgICAgICAgICAgICAgIHM6IHBhcnNlSXNvKG1hdGNoWzddKSxcbiAgICAgICAgICAgICAgICB3OiBwYXJzZUlzbyhtYXRjaFs4XSlcbiAgICAgICAgICAgIH07XG4gICAgICAgIH0gZWxzZSBpZiAodHlwZW9mIGR1cmF0aW9uID09PSAnb2JqZWN0JyAmJlxuICAgICAgICAgICAgICAgICgnZnJvbScgaW4gZHVyYXRpb24gfHwgJ3RvJyBpbiBkdXJhdGlvbikpIHtcbiAgICAgICAgICAgIGRpZmZSZXMgPSBtb21lbnRzRGlmZmVyZW5jZShtb21lbnQoZHVyYXRpb24uZnJvbSksIG1vbWVudChkdXJhdGlvbi50bykpO1xuXG4gICAgICAgICAgICBkdXJhdGlvbiA9IHt9O1xuICAgICAgICAgICAgZHVyYXRpb24ubXMgPSBkaWZmUmVzLm1pbGxpc2Vjb25kcztcbiAgICAgICAgICAgIGR1cmF0aW9uLk0gPSBkaWZmUmVzLm1vbnRocztcbiAgICAgICAgfVxuXG4gICAgICAgIHJldCA9IG5ldyBEdXJhdGlvbihkdXJhdGlvbik7XG5cbiAgICAgICAgaWYgKG1vbWVudC5pc0R1cmF0aW9uKGlucHV0KSAmJiBoYXNPd25Qcm9wKGlucHV0LCAnX2xvY2FsZScpKSB7XG4gICAgICAgICAgICByZXQuX2xvY2FsZSA9IGlucHV0Ll9sb2NhbGU7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gcmV0O1xuICAgIH07XG5cbiAgICAvLyB2ZXJzaW9uIG51bWJlclxuICAgIG1vbWVudC52ZXJzaW9uID0gVkVSU0lPTjtcblxuICAgIC8vIGRlZmF1bHQgZm9ybWF0XG4gICAgbW9tZW50LmRlZmF1bHRGb3JtYXQgPSBpc29Gb3JtYXQ7XG5cbiAgICAvLyBjb25zdGFudCB0aGF0IHJlZmVycyB0byB0aGUgSVNPIHN0YW5kYXJkXG4gICAgbW9tZW50LklTT184NjAxID0gZnVuY3Rpb24gKCkge307XG5cbiAgICAvLyBQbHVnaW5zIHRoYXQgYWRkIHByb3BlcnRpZXMgc2hvdWxkIGFsc28gYWRkIHRoZSBrZXkgaGVyZSAobnVsbCB2YWx1ZSksXG4gICAgLy8gc28gd2UgY2FuIHByb3Blcmx5IGNsb25lIG91cnNlbHZlcy5cbiAgICBtb21lbnQubW9tZW50UHJvcGVydGllcyA9IG1vbWVudFByb3BlcnRpZXM7XG5cbiAgICAvLyBUaGlzIGZ1bmN0aW9uIHdpbGwgYmUgY2FsbGVkIHdoZW5ldmVyIGEgbW9tZW50IGlzIG11dGF0ZWQuXG4gICAgLy8gSXQgaXMgaW50ZW5kZWQgdG8ga2VlcCB0aGUgb2Zmc2V0IGluIHN5bmMgd2l0aCB0aGUgdGltZXpvbmUuXG4gICAgbW9tZW50LnVwZGF0ZU9mZnNldCA9IGZ1bmN0aW9uICgpIHt9O1xuXG4gICAgLy8gVGhpcyBmdW5jdGlvbiBhbGxvd3MgeW91IHRvIHNldCBhIHRocmVzaG9sZCBmb3IgcmVsYXRpdmUgdGltZSBzdHJpbmdzXG4gICAgbW9tZW50LnJlbGF0aXZlVGltZVRocmVzaG9sZCA9IGZ1bmN0aW9uICh0aHJlc2hvbGQsIGxpbWl0KSB7XG4gICAgICAgIGlmIChyZWxhdGl2ZVRpbWVUaHJlc2hvbGRzW3RocmVzaG9sZF0gPT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICB9XG4gICAgICAgIGlmIChsaW1pdCA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICByZXR1cm4gcmVsYXRpdmVUaW1lVGhyZXNob2xkc1t0aHJlc2hvbGRdO1xuICAgICAgICB9XG4gICAgICAgIHJlbGF0aXZlVGltZVRocmVzaG9sZHNbdGhyZXNob2xkXSA9IGxpbWl0O1xuICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9O1xuXG4gICAgbW9tZW50LmxhbmcgPSBkZXByZWNhdGUoXG4gICAgICAgICdtb21lbnQubGFuZyBpcyBkZXByZWNhdGVkLiBVc2UgbW9tZW50LmxvY2FsZSBpbnN0ZWFkLicsXG4gICAgICAgIGZ1bmN0aW9uIChrZXksIHZhbHVlKSB7XG4gICAgICAgICAgICByZXR1cm4gbW9tZW50LmxvY2FsZShrZXksIHZhbHVlKTtcbiAgICAgICAgfVxuICAgICk7XG5cbiAgICAvLyBUaGlzIGZ1bmN0aW9uIHdpbGwgbG9hZCBsb2NhbGUgYW5kIHRoZW4gc2V0IHRoZSBnbG9iYWwgbG9jYWxlLiAgSWZcbiAgICAvLyBubyBhcmd1bWVudHMgYXJlIHBhc3NlZCBpbiwgaXQgd2lsbCBzaW1wbHkgcmV0dXJuIHRoZSBjdXJyZW50IGdsb2JhbFxuICAgIC8vIGxvY2FsZSBrZXkuXG4gICAgbW9tZW50LmxvY2FsZSA9IGZ1bmN0aW9uIChrZXksIHZhbHVlcykge1xuICAgICAgICB2YXIgZGF0YTtcbiAgICAgICAgaWYgKGtleSkge1xuICAgICAgICAgICAgaWYgKHR5cGVvZih2YWx1ZXMpICE9PSAndW5kZWZpbmVkJykge1xuICAgICAgICAgICAgICAgIGRhdGEgPSBtb21lbnQuZGVmaW5lTG9jYWxlKGtleSwgdmFsdWVzKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgIGRhdGEgPSBtb21lbnQubG9jYWxlRGF0YShrZXkpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBpZiAoZGF0YSkge1xuICAgICAgICAgICAgICAgIG1vbWVudC5kdXJhdGlvbi5fbG9jYWxlID0gbW9tZW50Ll9sb2NhbGUgPSBkYXRhO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIG1vbWVudC5fbG9jYWxlLl9hYmJyO1xuICAgIH07XG5cbiAgICBtb21lbnQuZGVmaW5lTG9jYWxlID0gZnVuY3Rpb24gKG5hbWUsIHZhbHVlcykge1xuICAgICAgICBpZiAodmFsdWVzICE9PSBudWxsKSB7XG4gICAgICAgICAgICB2YWx1ZXMuYWJiciA9IG5hbWU7XG4gICAgICAgICAgICBpZiAoIWxvY2FsZXNbbmFtZV0pIHtcbiAgICAgICAgICAgICAgICBsb2NhbGVzW25hbWVdID0gbmV3IExvY2FsZSgpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgbG9jYWxlc1tuYW1lXS5zZXQodmFsdWVzKTtcblxuICAgICAgICAgICAgLy8gYmFja3dhcmRzIGNvbXBhdCBmb3Igbm93OiBhbHNvIHNldCB0aGUgbG9jYWxlXG4gICAgICAgICAgICBtb21lbnQubG9jYWxlKG5hbWUpO1xuXG4gICAgICAgICAgICByZXR1cm4gbG9jYWxlc1tuYW1lXTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIC8vIHVzZWZ1bCBmb3IgdGVzdGluZ1xuICAgICAgICAgICAgZGVsZXRlIGxvY2FsZXNbbmFtZV07XG4gICAgICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAgICAgfVxuICAgIH07XG5cbiAgICBtb21lbnQubGFuZ0RhdGEgPSBkZXByZWNhdGUoXG4gICAgICAgICdtb21lbnQubGFuZ0RhdGEgaXMgZGVwcmVjYXRlZC4gVXNlIG1vbWVudC5sb2NhbGVEYXRhIGluc3RlYWQuJyxcbiAgICAgICAgZnVuY3Rpb24gKGtleSkge1xuICAgICAgICAgICAgcmV0dXJuIG1vbWVudC5sb2NhbGVEYXRhKGtleSk7XG4gICAgICAgIH1cbiAgICApO1xuXG4gICAgLy8gcmV0dXJucyBsb2NhbGUgZGF0YVxuICAgIG1vbWVudC5sb2NhbGVEYXRhID0gZnVuY3Rpb24gKGtleSkge1xuICAgICAgICB2YXIgbG9jYWxlO1xuXG4gICAgICAgIGlmIChrZXkgJiYga2V5Ll9sb2NhbGUgJiYga2V5Ll9sb2NhbGUuX2FiYnIpIHtcbiAgICAgICAgICAgIGtleSA9IGtleS5fbG9jYWxlLl9hYmJyO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKCFrZXkpIHtcbiAgICAgICAgICAgIHJldHVybiBtb21lbnQuX2xvY2FsZTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmICghaXNBcnJheShrZXkpKSB7XG4gICAgICAgICAgICAvL3Nob3J0LWNpcmN1aXQgZXZlcnl0aGluZyBlbHNlXG4gICAgICAgICAgICBsb2NhbGUgPSBsb2FkTG9jYWxlKGtleSk7XG4gICAgICAgICAgICBpZiAobG9jYWxlKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGxvY2FsZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGtleSA9IFtrZXldO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIGNob29zZUxvY2FsZShrZXkpO1xuICAgIH07XG5cbiAgICAvLyBjb21wYXJlIG1vbWVudCBvYmplY3RcbiAgICBtb21lbnQuaXNNb21lbnQgPSBmdW5jdGlvbiAob2JqKSB7XG4gICAgICAgIHJldHVybiBvYmogaW5zdGFuY2VvZiBNb21lbnQgfHxcbiAgICAgICAgICAgIChvYmogIT0gbnVsbCAmJiBoYXNPd25Qcm9wKG9iaiwgJ19pc0FNb21lbnRPYmplY3QnKSk7XG4gICAgfTtcblxuICAgIC8vIGZvciB0eXBlY2hlY2tpbmcgRHVyYXRpb24gb2JqZWN0c1xuICAgIG1vbWVudC5pc0R1cmF0aW9uID0gZnVuY3Rpb24gKG9iaikge1xuICAgICAgICByZXR1cm4gb2JqIGluc3RhbmNlb2YgRHVyYXRpb247XG4gICAgfTtcblxuICAgIGZvciAoaSA9IGxpc3RzLmxlbmd0aCAtIDE7IGkgPj0gMDsgLS1pKSB7XG4gICAgICAgIG1ha2VMaXN0KGxpc3RzW2ldKTtcbiAgICB9XG5cbiAgICBtb21lbnQubm9ybWFsaXplVW5pdHMgPSBmdW5jdGlvbiAodW5pdHMpIHtcbiAgICAgICAgcmV0dXJuIG5vcm1hbGl6ZVVuaXRzKHVuaXRzKTtcbiAgICB9O1xuXG4gICAgbW9tZW50LmludmFsaWQgPSBmdW5jdGlvbiAoZmxhZ3MpIHtcbiAgICAgICAgdmFyIG0gPSBtb21lbnQudXRjKE5hTik7XG4gICAgICAgIGlmIChmbGFncyAhPSBudWxsKSB7XG4gICAgICAgICAgICBleHRlbmQobS5fcGYsIGZsYWdzKTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIG0uX3BmLnVzZXJJbnZhbGlkYXRlZCA9IHRydWU7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gbTtcbiAgICB9O1xuXG4gICAgbW9tZW50LnBhcnNlWm9uZSA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgcmV0dXJuIG1vbWVudC5hcHBseShudWxsLCBhcmd1bWVudHMpLnBhcnNlWm9uZSgpO1xuICAgIH07XG5cbiAgICBtb21lbnQucGFyc2VUd29EaWdpdFllYXIgPSBmdW5jdGlvbiAoaW5wdXQpIHtcbiAgICAgICAgcmV0dXJuIHRvSW50KGlucHV0KSArICh0b0ludChpbnB1dCkgPiA2OCA/IDE5MDAgOiAyMDAwKTtcbiAgICB9O1xuXG4gICAgLyoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKlxuICAgICAgICBNb21lbnQgUHJvdG90eXBlXG4gICAgKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqL1xuXG5cbiAgICBleHRlbmQobW9tZW50LmZuID0gTW9tZW50LnByb3RvdHlwZSwge1xuXG4gICAgICAgIGNsb25lIDogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgcmV0dXJuIG1vbWVudCh0aGlzKTtcbiAgICAgICAgfSxcblxuICAgICAgICB2YWx1ZU9mIDogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgcmV0dXJuICt0aGlzLl9kICsgKCh0aGlzLl9vZmZzZXQgfHwgMCkgKiA2MDAwMCk7XG4gICAgICAgIH0sXG5cbiAgICAgICAgdW5peCA6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHJldHVybiBNYXRoLmZsb29yKCt0aGlzIC8gMTAwMCk7XG4gICAgICAgIH0sXG5cbiAgICAgICAgdG9TdHJpbmcgOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5jbG9uZSgpLmxvY2FsZSgnZW4nKS5mb3JtYXQoJ2RkZCBNTU0gREQgWVlZWSBISDptbTpzcyBbR01UXVpaJyk7XG4gICAgICAgIH0sXG5cbiAgICAgICAgdG9EYXRlIDogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMuX29mZnNldCA/IG5ldyBEYXRlKCt0aGlzKSA6IHRoaXMuX2Q7XG4gICAgICAgIH0sXG5cbiAgICAgICAgdG9JU09TdHJpbmcgOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICB2YXIgbSA9IG1vbWVudCh0aGlzKS51dGMoKTtcbiAgICAgICAgICAgIGlmICgwIDwgbS55ZWFyKCkgJiYgbS55ZWFyKCkgPD0gOTk5OSkge1xuICAgICAgICAgICAgICAgIHJldHVybiBmb3JtYXRNb21lbnQobSwgJ1lZWVktTU0tRERbVF1ISDptbTpzcy5TU1NbWl0nKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGZvcm1hdE1vbWVudChtLCAnWVlZWVlZLU1NLUREW1RdSEg6bW06c3MuU1NTW1pdJyk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0sXG5cbiAgICAgICAgdG9BcnJheSA6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHZhciBtID0gdGhpcztcbiAgICAgICAgICAgIHJldHVybiBbXG4gICAgICAgICAgICAgICAgbS55ZWFyKCksXG4gICAgICAgICAgICAgICAgbS5tb250aCgpLFxuICAgICAgICAgICAgICAgIG0uZGF0ZSgpLFxuICAgICAgICAgICAgICAgIG0uaG91cnMoKSxcbiAgICAgICAgICAgICAgICBtLm1pbnV0ZXMoKSxcbiAgICAgICAgICAgICAgICBtLnNlY29uZHMoKSxcbiAgICAgICAgICAgICAgICBtLm1pbGxpc2Vjb25kcygpXG4gICAgICAgICAgICBdO1xuICAgICAgICB9LFxuXG4gICAgICAgIGlzVmFsaWQgOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICByZXR1cm4gaXNWYWxpZCh0aGlzKTtcbiAgICAgICAgfSxcblxuICAgICAgICBpc0RTVFNoaWZ0ZWQgOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICBpZiAodGhpcy5fYSkge1xuICAgICAgICAgICAgICAgIHJldHVybiB0aGlzLmlzVmFsaWQoKSAmJiBjb21wYXJlQXJyYXlzKHRoaXMuX2EsICh0aGlzLl9pc1VUQyA/IG1vbWVudC51dGModGhpcy5fYSkgOiBtb21lbnQodGhpcy5fYSkpLnRvQXJyYXkoKSkgPiAwO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgIH0sXG5cbiAgICAgICAgcGFyc2luZ0ZsYWdzIDogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgcmV0dXJuIGV4dGVuZCh7fSwgdGhpcy5fcGYpO1xuICAgICAgICB9LFxuXG4gICAgICAgIGludmFsaWRBdDogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMuX3BmLm92ZXJmbG93O1xuICAgICAgICB9LFxuXG4gICAgICAgIHV0YyA6IGZ1bmN0aW9uIChrZWVwTG9jYWxUaW1lKSB7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy56b25lKDAsIGtlZXBMb2NhbFRpbWUpO1xuICAgICAgICB9LFxuXG4gICAgICAgIGxvY2FsIDogZnVuY3Rpb24gKGtlZXBMb2NhbFRpbWUpIHtcbiAgICAgICAgICAgIGlmICh0aGlzLl9pc1VUQykge1xuICAgICAgICAgICAgICAgIHRoaXMuem9uZSgwLCBrZWVwTG9jYWxUaW1lKTtcbiAgICAgICAgICAgICAgICB0aGlzLl9pc1VUQyA9IGZhbHNlO1xuXG4gICAgICAgICAgICAgICAgaWYgKGtlZXBMb2NhbFRpbWUpIHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5hZGQodGhpcy5fZGF0ZVR6T2Zmc2V0KCksICdtJyk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgICAgIH0sXG5cbiAgICAgICAgZm9ybWF0IDogZnVuY3Rpb24gKGlucHV0U3RyaW5nKSB7XG4gICAgICAgICAgICB2YXIgb3V0cHV0ID0gZm9ybWF0TW9tZW50KHRoaXMsIGlucHV0U3RyaW5nIHx8IG1vbWVudC5kZWZhdWx0Rm9ybWF0KTtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLmxvY2FsZURhdGEoKS5wb3N0Zm9ybWF0KG91dHB1dCk7XG4gICAgICAgIH0sXG5cbiAgICAgICAgYWRkIDogY3JlYXRlQWRkZXIoMSwgJ2FkZCcpLFxuXG4gICAgICAgIHN1YnRyYWN0IDogY3JlYXRlQWRkZXIoLTEsICdzdWJ0cmFjdCcpLFxuXG4gICAgICAgIGRpZmYgOiBmdW5jdGlvbiAoaW5wdXQsIHVuaXRzLCBhc0Zsb2F0KSB7XG4gICAgICAgICAgICB2YXIgdGhhdCA9IG1ha2VBcyhpbnB1dCwgdGhpcyksXG4gICAgICAgICAgICAgICAgem9uZURpZmYgPSAodGhpcy56b25lKCkgLSB0aGF0LnpvbmUoKSkgKiA2ZTQsXG4gICAgICAgICAgICAgICAgZGlmZiwgb3V0cHV0LCBkYXlzQWRqdXN0O1xuXG4gICAgICAgICAgICB1bml0cyA9IG5vcm1hbGl6ZVVuaXRzKHVuaXRzKTtcblxuICAgICAgICAgICAgaWYgKHVuaXRzID09PSAneWVhcicgfHwgdW5pdHMgPT09ICdtb250aCcpIHtcbiAgICAgICAgICAgICAgICAvLyBhdmVyYWdlIG51bWJlciBvZiBkYXlzIGluIHRoZSBtb250aHMgaW4gdGhlIGdpdmVuIGRhdGVzXG4gICAgICAgICAgICAgICAgZGlmZiA9ICh0aGlzLmRheXNJbk1vbnRoKCkgKyB0aGF0LmRheXNJbk1vbnRoKCkpICogNDMyZTU7IC8vIDI0ICogNjAgKiA2MCAqIDEwMDAgLyAyXG4gICAgICAgICAgICAgICAgLy8gZGlmZmVyZW5jZSBpbiBtb250aHNcbiAgICAgICAgICAgICAgICBvdXRwdXQgPSAoKHRoaXMueWVhcigpIC0gdGhhdC55ZWFyKCkpICogMTIpICsgKHRoaXMubW9udGgoKSAtIHRoYXQubW9udGgoKSk7XG4gICAgICAgICAgICAgICAgLy8gYWRqdXN0IGJ5IHRha2luZyBkaWZmZXJlbmNlIGluIGRheXMsIGF2ZXJhZ2UgbnVtYmVyIG9mIGRheXNcbiAgICAgICAgICAgICAgICAvLyBhbmQgZHN0IGluIHRoZSBnaXZlbiBtb250aHMuXG4gICAgICAgICAgICAgICAgZGF5c0FkanVzdCA9ICh0aGlzIC0gbW9tZW50KHRoaXMpLnN0YXJ0T2YoJ21vbnRoJykpIC1cbiAgICAgICAgICAgICAgICAgICAgKHRoYXQgLSBtb21lbnQodGhhdCkuc3RhcnRPZignbW9udGgnKSk7XG4gICAgICAgICAgICAgICAgLy8gc2FtZSBhcyBhYm92ZSBidXQgd2l0aCB6b25lcywgdG8gbmVnYXRlIGFsbCBkc3RcbiAgICAgICAgICAgICAgICBkYXlzQWRqdXN0IC09ICgodGhpcy56b25lKCkgLSBtb21lbnQodGhpcykuc3RhcnRPZignbW9udGgnKS56b25lKCkpIC1cbiAgICAgICAgICAgICAgICAgICAgICAgICh0aGF0LnpvbmUoKSAtIG1vbWVudCh0aGF0KS5zdGFydE9mKCdtb250aCcpLnpvbmUoKSkpICogNmU0O1xuICAgICAgICAgICAgICAgIG91dHB1dCArPSBkYXlzQWRqdXN0IC8gZGlmZjtcbiAgICAgICAgICAgICAgICBpZiAodW5pdHMgPT09ICd5ZWFyJykge1xuICAgICAgICAgICAgICAgICAgICBvdXRwdXQgPSBvdXRwdXQgLyAxMjtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIGRpZmYgPSAodGhpcyAtIHRoYXQpO1xuICAgICAgICAgICAgICAgIG91dHB1dCA9IHVuaXRzID09PSAnc2Vjb25kJyA/IGRpZmYgLyAxZTMgOiAvLyAxMDAwXG4gICAgICAgICAgICAgICAgICAgIHVuaXRzID09PSAnbWludXRlJyA/IGRpZmYgLyA2ZTQgOiAvLyAxMDAwICogNjBcbiAgICAgICAgICAgICAgICAgICAgdW5pdHMgPT09ICdob3VyJyA/IGRpZmYgLyAzNmU1IDogLy8gMTAwMCAqIDYwICogNjBcbiAgICAgICAgICAgICAgICAgICAgdW5pdHMgPT09ICdkYXknID8gKGRpZmYgLSB6b25lRGlmZikgLyA4NjRlNSA6IC8vIDEwMDAgKiA2MCAqIDYwICogMjQsIG5lZ2F0ZSBkc3RcbiAgICAgICAgICAgICAgICAgICAgdW5pdHMgPT09ICd3ZWVrJyA/IChkaWZmIC0gem9uZURpZmYpIC8gNjA0OGU1IDogLy8gMTAwMCAqIDYwICogNjAgKiAyNCAqIDcsIG5lZ2F0ZSBkc3RcbiAgICAgICAgICAgICAgICAgICAgZGlmZjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiBhc0Zsb2F0ID8gb3V0cHV0IDogYWJzUm91bmQob3V0cHV0KTtcbiAgICAgICAgfSxcblxuICAgICAgICBmcm9tIDogZnVuY3Rpb24gKHRpbWUsIHdpdGhvdXRTdWZmaXgpIHtcbiAgICAgICAgICAgIHJldHVybiBtb21lbnQuZHVyYXRpb24oe3RvOiB0aGlzLCBmcm9tOiB0aW1lfSkubG9jYWxlKHRoaXMubG9jYWxlKCkpLmh1bWFuaXplKCF3aXRob3V0U3VmZml4KTtcbiAgICAgICAgfSxcblxuICAgICAgICBmcm9tTm93IDogZnVuY3Rpb24gKHdpdGhvdXRTdWZmaXgpIHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLmZyb20obW9tZW50KCksIHdpdGhvdXRTdWZmaXgpO1xuICAgICAgICB9LFxuXG4gICAgICAgIGNhbGVuZGFyIDogZnVuY3Rpb24gKHRpbWUpIHtcbiAgICAgICAgICAgIC8vIFdlIHdhbnQgdG8gY29tcGFyZSB0aGUgc3RhcnQgb2YgdG9kYXksIHZzIHRoaXMuXG4gICAgICAgICAgICAvLyBHZXR0aW5nIHN0YXJ0LW9mLXRvZGF5IGRlcGVuZHMgb24gd2hldGhlciB3ZSdyZSB6b25lJ2Qgb3Igbm90LlxuICAgICAgICAgICAgdmFyIG5vdyA9IHRpbWUgfHwgbW9tZW50KCksXG4gICAgICAgICAgICAgICAgc29kID0gbWFrZUFzKG5vdywgdGhpcykuc3RhcnRPZignZGF5JyksXG4gICAgICAgICAgICAgICAgZGlmZiA9IHRoaXMuZGlmZihzb2QsICdkYXlzJywgdHJ1ZSksXG4gICAgICAgICAgICAgICAgZm9ybWF0ID0gZGlmZiA8IC02ID8gJ3NhbWVFbHNlJyA6XG4gICAgICAgICAgICAgICAgICAgIGRpZmYgPCAtMSA/ICdsYXN0V2VlaycgOlxuICAgICAgICAgICAgICAgICAgICBkaWZmIDwgMCA/ICdsYXN0RGF5JyA6XG4gICAgICAgICAgICAgICAgICAgIGRpZmYgPCAxID8gJ3NhbWVEYXknIDpcbiAgICAgICAgICAgICAgICAgICAgZGlmZiA8IDIgPyAnbmV4dERheScgOlxuICAgICAgICAgICAgICAgICAgICBkaWZmIDwgNyA/ICduZXh0V2VlaycgOiAnc2FtZUVsc2UnO1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMuZm9ybWF0KHRoaXMubG9jYWxlRGF0YSgpLmNhbGVuZGFyKGZvcm1hdCwgdGhpcykpO1xuICAgICAgICB9LFxuXG4gICAgICAgIGlzTGVhcFllYXIgOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICByZXR1cm4gaXNMZWFwWWVhcih0aGlzLnllYXIoKSk7XG4gICAgICAgIH0sXG5cbiAgICAgICAgaXNEU1QgOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICByZXR1cm4gKHRoaXMuem9uZSgpIDwgdGhpcy5jbG9uZSgpLm1vbnRoKDApLnpvbmUoKSB8fFxuICAgICAgICAgICAgICAgIHRoaXMuem9uZSgpIDwgdGhpcy5jbG9uZSgpLm1vbnRoKDUpLnpvbmUoKSk7XG4gICAgICAgIH0sXG5cbiAgICAgICAgZGF5IDogZnVuY3Rpb24gKGlucHV0KSB7XG4gICAgICAgICAgICB2YXIgZGF5ID0gdGhpcy5faXNVVEMgPyB0aGlzLl9kLmdldFVUQ0RheSgpIDogdGhpcy5fZC5nZXREYXkoKTtcbiAgICAgICAgICAgIGlmIChpbnB1dCAhPSBudWxsKSB7XG4gICAgICAgICAgICAgICAgaW5wdXQgPSBwYXJzZVdlZWtkYXkoaW5wdXQsIHRoaXMubG9jYWxlRGF0YSgpKTtcbiAgICAgICAgICAgICAgICByZXR1cm4gdGhpcy5hZGQoaW5wdXQgLSBkYXksICdkJyk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIHJldHVybiBkYXk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0sXG5cbiAgICAgICAgbW9udGggOiBtYWtlQWNjZXNzb3IoJ01vbnRoJywgdHJ1ZSksXG5cbiAgICAgICAgc3RhcnRPZiA6IGZ1bmN0aW9uICh1bml0cykge1xuICAgICAgICAgICAgdW5pdHMgPSBub3JtYWxpemVVbml0cyh1bml0cyk7XG4gICAgICAgICAgICAvLyB0aGUgZm9sbG93aW5nIHN3aXRjaCBpbnRlbnRpb25hbGx5IG9taXRzIGJyZWFrIGtleXdvcmRzXG4gICAgICAgICAgICAvLyB0byB1dGlsaXplIGZhbGxpbmcgdGhyb3VnaCB0aGUgY2FzZXMuXG4gICAgICAgICAgICBzd2l0Y2ggKHVuaXRzKSB7XG4gICAgICAgICAgICBjYXNlICd5ZWFyJzpcbiAgICAgICAgICAgICAgICB0aGlzLm1vbnRoKDApO1xuICAgICAgICAgICAgICAgIC8qIGZhbGxzIHRocm91Z2ggKi9cbiAgICAgICAgICAgIGNhc2UgJ3F1YXJ0ZXInOlxuICAgICAgICAgICAgY2FzZSAnbW9udGgnOlxuICAgICAgICAgICAgICAgIHRoaXMuZGF0ZSgxKTtcbiAgICAgICAgICAgICAgICAvKiBmYWxscyB0aHJvdWdoICovXG4gICAgICAgICAgICBjYXNlICd3ZWVrJzpcbiAgICAgICAgICAgIGNhc2UgJ2lzb1dlZWsnOlxuICAgICAgICAgICAgY2FzZSAnZGF5JzpcbiAgICAgICAgICAgICAgICB0aGlzLmhvdXJzKDApO1xuICAgICAgICAgICAgICAgIC8qIGZhbGxzIHRocm91Z2ggKi9cbiAgICAgICAgICAgIGNhc2UgJ2hvdXInOlxuICAgICAgICAgICAgICAgIHRoaXMubWludXRlcygwKTtcbiAgICAgICAgICAgICAgICAvKiBmYWxscyB0aHJvdWdoICovXG4gICAgICAgICAgICBjYXNlICdtaW51dGUnOlxuICAgICAgICAgICAgICAgIHRoaXMuc2Vjb25kcygwKTtcbiAgICAgICAgICAgICAgICAvKiBmYWxscyB0aHJvdWdoICovXG4gICAgICAgICAgICBjYXNlICdzZWNvbmQnOlxuICAgICAgICAgICAgICAgIHRoaXMubWlsbGlzZWNvbmRzKDApO1xuICAgICAgICAgICAgICAgIC8qIGZhbGxzIHRocm91Z2ggKi9cbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgLy8gd2Vla3MgYXJlIGEgc3BlY2lhbCBjYXNlXG4gICAgICAgICAgICBpZiAodW5pdHMgPT09ICd3ZWVrJykge1xuICAgICAgICAgICAgICAgIHRoaXMud2Vla2RheSgwKTtcbiAgICAgICAgICAgIH0gZWxzZSBpZiAodW5pdHMgPT09ICdpc29XZWVrJykge1xuICAgICAgICAgICAgICAgIHRoaXMuaXNvV2Vla2RheSgxKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgLy8gcXVhcnRlcnMgYXJlIGFsc28gc3BlY2lhbFxuICAgICAgICAgICAgaWYgKHVuaXRzID09PSAncXVhcnRlcicpIHtcbiAgICAgICAgICAgICAgICB0aGlzLm1vbnRoKE1hdGguZmxvb3IodGhpcy5tb250aCgpIC8gMykgKiAzKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgICAgIH0sXG5cbiAgICAgICAgZW5kT2Y6IGZ1bmN0aW9uICh1bml0cykge1xuICAgICAgICAgICAgdW5pdHMgPSBub3JtYWxpemVVbml0cyh1bml0cyk7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5zdGFydE9mKHVuaXRzKS5hZGQoMSwgKHVuaXRzID09PSAnaXNvV2VlaycgPyAnd2VlaycgOiB1bml0cykpLnN1YnRyYWN0KDEsICdtcycpO1xuICAgICAgICB9LFxuXG4gICAgICAgIGlzQWZ0ZXI6IGZ1bmN0aW9uIChpbnB1dCwgdW5pdHMpIHtcbiAgICAgICAgICAgIHVuaXRzID0gbm9ybWFsaXplVW5pdHModHlwZW9mIHVuaXRzICE9PSAndW5kZWZpbmVkJyA/IHVuaXRzIDogJ21pbGxpc2Vjb25kJyk7XG4gICAgICAgICAgICBpZiAodW5pdHMgPT09ICdtaWxsaXNlY29uZCcpIHtcbiAgICAgICAgICAgICAgICBpbnB1dCA9IG1vbWVudC5pc01vbWVudChpbnB1dCkgPyBpbnB1dCA6IG1vbWVudChpbnB1dCk7XG4gICAgICAgICAgICAgICAgcmV0dXJuICt0aGlzID4gK2lucHV0O1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gK3RoaXMuY2xvbmUoKS5zdGFydE9mKHVuaXRzKSA+ICttb21lbnQoaW5wdXQpLnN0YXJ0T2YodW5pdHMpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9LFxuXG4gICAgICAgIGlzQmVmb3JlOiBmdW5jdGlvbiAoaW5wdXQsIHVuaXRzKSB7XG4gICAgICAgICAgICB1bml0cyA9IG5vcm1hbGl6ZVVuaXRzKHR5cGVvZiB1bml0cyAhPT0gJ3VuZGVmaW5lZCcgPyB1bml0cyA6ICdtaWxsaXNlY29uZCcpO1xuICAgICAgICAgICAgaWYgKHVuaXRzID09PSAnbWlsbGlzZWNvbmQnKSB7XG4gICAgICAgICAgICAgICAgaW5wdXQgPSBtb21lbnQuaXNNb21lbnQoaW5wdXQpID8gaW5wdXQgOiBtb21lbnQoaW5wdXQpO1xuICAgICAgICAgICAgICAgIHJldHVybiArdGhpcyA8ICtpbnB1dDtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuICt0aGlzLmNsb25lKCkuc3RhcnRPZih1bml0cykgPCArbW9tZW50KGlucHV0KS5zdGFydE9mKHVuaXRzKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSxcblxuICAgICAgICBpc1NhbWU6IGZ1bmN0aW9uIChpbnB1dCwgdW5pdHMpIHtcbiAgICAgICAgICAgIHVuaXRzID0gbm9ybWFsaXplVW5pdHModW5pdHMgfHwgJ21pbGxpc2Vjb25kJyk7XG4gICAgICAgICAgICBpZiAodW5pdHMgPT09ICdtaWxsaXNlY29uZCcpIHtcbiAgICAgICAgICAgICAgICBpbnB1dCA9IG1vbWVudC5pc01vbWVudChpbnB1dCkgPyBpbnB1dCA6IG1vbWVudChpbnB1dCk7XG4gICAgICAgICAgICAgICAgcmV0dXJuICt0aGlzID09PSAraW5wdXQ7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIHJldHVybiArdGhpcy5jbG9uZSgpLnN0YXJ0T2YodW5pdHMpID09PSArbWFrZUFzKGlucHV0LCB0aGlzKS5zdGFydE9mKHVuaXRzKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSxcblxuICAgICAgICBtaW46IGRlcHJlY2F0ZShcbiAgICAgICAgICAgICAgICAgJ21vbWVudCgpLm1pbiBpcyBkZXByZWNhdGVkLCB1c2UgbW9tZW50Lm1pbiBpbnN0ZWFkLiBodHRwczovL2dpdGh1Yi5jb20vbW9tZW50L21vbWVudC9pc3N1ZXMvMTU0OCcsXG4gICAgICAgICAgICAgICAgIGZ1bmN0aW9uIChvdGhlcikge1xuICAgICAgICAgICAgICAgICAgICAgb3RoZXIgPSBtb21lbnQuYXBwbHkobnVsbCwgYXJndW1lbnRzKTtcbiAgICAgICAgICAgICAgICAgICAgIHJldHVybiBvdGhlciA8IHRoaXMgPyB0aGlzIDogb3RoZXI7XG4gICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICksXG5cbiAgICAgICAgbWF4OiBkZXByZWNhdGUoXG4gICAgICAgICAgICAgICAgJ21vbWVudCgpLm1heCBpcyBkZXByZWNhdGVkLCB1c2UgbW9tZW50Lm1heCBpbnN0ZWFkLiBodHRwczovL2dpdGh1Yi5jb20vbW9tZW50L21vbWVudC9pc3N1ZXMvMTU0OCcsXG4gICAgICAgICAgICAgICAgZnVuY3Rpb24gKG90aGVyKSB7XG4gICAgICAgICAgICAgICAgICAgIG90aGVyID0gbW9tZW50LmFwcGx5KG51bGwsIGFyZ3VtZW50cyk7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBvdGhlciA+IHRoaXMgPyB0aGlzIDogb3RoZXI7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICApLFxuXG4gICAgICAgIC8vIGtlZXBMb2NhbFRpbWUgPSB0cnVlIG1lYW5zIG9ubHkgY2hhbmdlIHRoZSB0aW1lem9uZSwgd2l0aG91dFxuICAgICAgICAvLyBhZmZlY3RpbmcgdGhlIGxvY2FsIGhvdXIuIFNvIDU6MzE6MjYgKzAzMDAgLS1bem9uZSgyLCB0cnVlKV0tLT5cbiAgICAgICAgLy8gNTozMToyNiArMDIwMCBJdCBpcyBwb3NzaWJsZSB0aGF0IDU6MzE6MjYgZG9lc24ndCBleGlzdCBpbnQgem9uZVxuICAgICAgICAvLyArMDIwMCwgc28gd2UgYWRqdXN0IHRoZSB0aW1lIGFzIG5lZWRlZCwgdG8gYmUgdmFsaWQuXG4gICAgICAgIC8vXG4gICAgICAgIC8vIEtlZXBpbmcgdGhlIHRpbWUgYWN0dWFsbHkgYWRkcy9zdWJ0cmFjdHMgKG9uZSBob3VyKVxuICAgICAgICAvLyBmcm9tIHRoZSBhY3R1YWwgcmVwcmVzZW50ZWQgdGltZS4gVGhhdCBpcyB3aHkgd2UgY2FsbCB1cGRhdGVPZmZzZXRcbiAgICAgICAgLy8gYSBzZWNvbmQgdGltZS4gSW4gY2FzZSBpdCB3YW50cyB1cyB0byBjaGFuZ2UgdGhlIG9mZnNldCBhZ2FpblxuICAgICAgICAvLyBfY2hhbmdlSW5Qcm9ncmVzcyA9PSB0cnVlIGNhc2UsIHRoZW4gd2UgaGF2ZSB0byBhZGp1c3QsIGJlY2F1c2VcbiAgICAgICAgLy8gdGhlcmUgaXMgbm8gc3VjaCB0aW1lIGluIHRoZSBnaXZlbiB0aW1lem9uZS5cbiAgICAgICAgem9uZSA6IGZ1bmN0aW9uIChpbnB1dCwga2VlcExvY2FsVGltZSkge1xuICAgICAgICAgICAgdmFyIG9mZnNldCA9IHRoaXMuX29mZnNldCB8fCAwLFxuICAgICAgICAgICAgICAgIGxvY2FsQWRqdXN0O1xuICAgICAgICAgICAgaWYgKGlucHV0ICE9IG51bGwpIHtcbiAgICAgICAgICAgICAgICBpZiAodHlwZW9mIGlucHV0ID09PSAnc3RyaW5nJykge1xuICAgICAgICAgICAgICAgICAgICBpbnB1dCA9IHRpbWV6b25lTWludXRlc0Zyb21TdHJpbmcoaW5wdXQpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBpZiAoTWF0aC5hYnMoaW5wdXQpIDwgMTYpIHtcbiAgICAgICAgICAgICAgICAgICAgaW5wdXQgPSBpbnB1dCAqIDYwO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBpZiAoIXRoaXMuX2lzVVRDICYmIGtlZXBMb2NhbFRpbWUpIHtcbiAgICAgICAgICAgICAgICAgICAgbG9jYWxBZGp1c3QgPSB0aGlzLl9kYXRlVHpPZmZzZXQoKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgdGhpcy5fb2Zmc2V0ID0gaW5wdXQ7XG4gICAgICAgICAgICAgICAgdGhpcy5faXNVVEMgPSB0cnVlO1xuICAgICAgICAgICAgICAgIGlmIChsb2NhbEFkanVzdCAhPSBudWxsKSB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuc3VidHJhY3QobG9jYWxBZGp1c3QsICdtJyk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGlmIChvZmZzZXQgIT09IGlucHV0KSB7XG4gICAgICAgICAgICAgICAgICAgIGlmICgha2VlcExvY2FsVGltZSB8fCB0aGlzLl9jaGFuZ2VJblByb2dyZXNzKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBhZGRPclN1YnRyYWN0RHVyYXRpb25Gcm9tTW9tZW50KHRoaXMsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG1vbWVudC5kdXJhdGlvbihvZmZzZXQgLSBpbnB1dCwgJ20nKSwgMSwgZmFsc2UpO1xuICAgICAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKCF0aGlzLl9jaGFuZ2VJblByb2dyZXNzKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLl9jaGFuZ2VJblByb2dyZXNzID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICAgICAgICAgIG1vbWVudC51cGRhdGVPZmZzZXQodGhpcywgdHJ1ZSk7XG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLl9jaGFuZ2VJblByb2dyZXNzID0gbnVsbDtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHRoaXMuX2lzVVRDID8gb2Zmc2V0IDogdGhpcy5fZGF0ZVR6T2Zmc2V0KCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gdGhpcztcbiAgICAgICAgfSxcblxuICAgICAgICB6b25lQWJiciA6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLl9pc1VUQyA/ICdVVEMnIDogJyc7XG4gICAgICAgIH0sXG5cbiAgICAgICAgem9uZU5hbWUgOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5faXNVVEMgPyAnQ29vcmRpbmF0ZWQgVW5pdmVyc2FsIFRpbWUnIDogJyc7XG4gICAgICAgIH0sXG5cbiAgICAgICAgcGFyc2Vab25lIDogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgaWYgKHRoaXMuX3R6bSkge1xuICAgICAgICAgICAgICAgIHRoaXMuem9uZSh0aGlzLl90em0pO1xuICAgICAgICAgICAgfSBlbHNlIGlmICh0eXBlb2YgdGhpcy5faSA9PT0gJ3N0cmluZycpIHtcbiAgICAgICAgICAgICAgICB0aGlzLnpvbmUodGhpcy5faSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gdGhpcztcbiAgICAgICAgfSxcblxuICAgICAgICBoYXNBbGlnbmVkSG91ck9mZnNldCA6IGZ1bmN0aW9uIChpbnB1dCkge1xuICAgICAgICAgICAgaWYgKCFpbnB1dCkge1xuICAgICAgICAgICAgICAgIGlucHV0ID0gMDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgIGlucHV0ID0gbW9tZW50KGlucHV0KS56b25lKCk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHJldHVybiAodGhpcy56b25lKCkgLSBpbnB1dCkgJSA2MCA9PT0gMDtcbiAgICAgICAgfSxcblxuICAgICAgICBkYXlzSW5Nb250aCA6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHJldHVybiBkYXlzSW5Nb250aCh0aGlzLnllYXIoKSwgdGhpcy5tb250aCgpKTtcbiAgICAgICAgfSxcblxuICAgICAgICBkYXlPZlllYXIgOiBmdW5jdGlvbiAoaW5wdXQpIHtcbiAgICAgICAgICAgIHZhciBkYXlPZlllYXIgPSByb3VuZCgobW9tZW50KHRoaXMpLnN0YXJ0T2YoJ2RheScpIC0gbW9tZW50KHRoaXMpLnN0YXJ0T2YoJ3llYXInKSkgLyA4NjRlNSkgKyAxO1xuICAgICAgICAgICAgcmV0dXJuIGlucHV0ID09IG51bGwgPyBkYXlPZlllYXIgOiB0aGlzLmFkZCgoaW5wdXQgLSBkYXlPZlllYXIpLCAnZCcpO1xuICAgICAgICB9LFxuXG4gICAgICAgIHF1YXJ0ZXIgOiBmdW5jdGlvbiAoaW5wdXQpIHtcbiAgICAgICAgICAgIHJldHVybiBpbnB1dCA9PSBudWxsID8gTWF0aC5jZWlsKCh0aGlzLm1vbnRoKCkgKyAxKSAvIDMpIDogdGhpcy5tb250aCgoaW5wdXQgLSAxKSAqIDMgKyB0aGlzLm1vbnRoKCkgJSAzKTtcbiAgICAgICAgfSxcblxuICAgICAgICB3ZWVrWWVhciA6IGZ1bmN0aW9uIChpbnB1dCkge1xuICAgICAgICAgICAgdmFyIHllYXIgPSB3ZWVrT2ZZZWFyKHRoaXMsIHRoaXMubG9jYWxlRGF0YSgpLl93ZWVrLmRvdywgdGhpcy5sb2NhbGVEYXRhKCkuX3dlZWsuZG95KS55ZWFyO1xuICAgICAgICAgICAgcmV0dXJuIGlucHV0ID09IG51bGwgPyB5ZWFyIDogdGhpcy5hZGQoKGlucHV0IC0geWVhciksICd5Jyk7XG4gICAgICAgIH0sXG5cbiAgICAgICAgaXNvV2Vla1llYXIgOiBmdW5jdGlvbiAoaW5wdXQpIHtcbiAgICAgICAgICAgIHZhciB5ZWFyID0gd2Vla09mWWVhcih0aGlzLCAxLCA0KS55ZWFyO1xuICAgICAgICAgICAgcmV0dXJuIGlucHV0ID09IG51bGwgPyB5ZWFyIDogdGhpcy5hZGQoKGlucHV0IC0geWVhciksICd5Jyk7XG4gICAgICAgIH0sXG5cbiAgICAgICAgd2VlayA6IGZ1bmN0aW9uIChpbnB1dCkge1xuICAgICAgICAgICAgdmFyIHdlZWsgPSB0aGlzLmxvY2FsZURhdGEoKS53ZWVrKHRoaXMpO1xuICAgICAgICAgICAgcmV0dXJuIGlucHV0ID09IG51bGwgPyB3ZWVrIDogdGhpcy5hZGQoKGlucHV0IC0gd2VlaykgKiA3LCAnZCcpO1xuICAgICAgICB9LFxuXG4gICAgICAgIGlzb1dlZWsgOiBmdW5jdGlvbiAoaW5wdXQpIHtcbiAgICAgICAgICAgIHZhciB3ZWVrID0gd2Vla09mWWVhcih0aGlzLCAxLCA0KS53ZWVrO1xuICAgICAgICAgICAgcmV0dXJuIGlucHV0ID09IG51bGwgPyB3ZWVrIDogdGhpcy5hZGQoKGlucHV0IC0gd2VlaykgKiA3LCAnZCcpO1xuICAgICAgICB9LFxuXG4gICAgICAgIHdlZWtkYXkgOiBmdW5jdGlvbiAoaW5wdXQpIHtcbiAgICAgICAgICAgIHZhciB3ZWVrZGF5ID0gKHRoaXMuZGF5KCkgKyA3IC0gdGhpcy5sb2NhbGVEYXRhKCkuX3dlZWsuZG93KSAlIDc7XG4gICAgICAgICAgICByZXR1cm4gaW5wdXQgPT0gbnVsbCA/IHdlZWtkYXkgOiB0aGlzLmFkZChpbnB1dCAtIHdlZWtkYXksICdkJyk7XG4gICAgICAgIH0sXG5cbiAgICAgICAgaXNvV2Vla2RheSA6IGZ1bmN0aW9uIChpbnB1dCkge1xuICAgICAgICAgICAgLy8gYmVoYXZlcyB0aGUgc2FtZSBhcyBtb21lbnQjZGF5IGV4Y2VwdFxuICAgICAgICAgICAgLy8gYXMgYSBnZXR0ZXIsIHJldHVybnMgNyBpbnN0ZWFkIG9mIDAgKDEtNyByYW5nZSBpbnN0ZWFkIG9mIDAtNilcbiAgICAgICAgICAgIC8vIGFzIGEgc2V0dGVyLCBzdW5kYXkgc2hvdWxkIGJlbG9uZyB0byB0aGUgcHJldmlvdXMgd2Vlay5cbiAgICAgICAgICAgIHJldHVybiBpbnB1dCA9PSBudWxsID8gdGhpcy5kYXkoKSB8fCA3IDogdGhpcy5kYXkodGhpcy5kYXkoKSAlIDcgPyBpbnB1dCA6IGlucHV0IC0gNyk7XG4gICAgICAgIH0sXG5cbiAgICAgICAgaXNvV2Vla3NJblllYXIgOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICByZXR1cm4gd2Vla3NJblllYXIodGhpcy55ZWFyKCksIDEsIDQpO1xuICAgICAgICB9LFxuXG4gICAgICAgIHdlZWtzSW5ZZWFyIDogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgdmFyIHdlZWtJbmZvID0gdGhpcy5sb2NhbGVEYXRhKCkuX3dlZWs7XG4gICAgICAgICAgICByZXR1cm4gd2Vla3NJblllYXIodGhpcy55ZWFyKCksIHdlZWtJbmZvLmRvdywgd2Vla0luZm8uZG95KTtcbiAgICAgICAgfSxcblxuICAgICAgICBnZXQgOiBmdW5jdGlvbiAodW5pdHMpIHtcbiAgICAgICAgICAgIHVuaXRzID0gbm9ybWFsaXplVW5pdHModW5pdHMpO1xuICAgICAgICAgICAgcmV0dXJuIHRoaXNbdW5pdHNdKCk7XG4gICAgICAgIH0sXG5cbiAgICAgICAgc2V0IDogZnVuY3Rpb24gKHVuaXRzLCB2YWx1ZSkge1xuICAgICAgICAgICAgdW5pdHMgPSBub3JtYWxpemVVbml0cyh1bml0cyk7XG4gICAgICAgICAgICBpZiAodHlwZW9mIHRoaXNbdW5pdHNdID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICAgICAgICAgICAgdGhpc1t1bml0c10odmFsdWUpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgICAgIH0sXG5cbiAgICAgICAgLy8gSWYgcGFzc2VkIGEgbG9jYWxlIGtleSwgaXQgd2lsbCBzZXQgdGhlIGxvY2FsZSBmb3IgdGhpc1xuICAgICAgICAvLyBpbnN0YW5jZS4gIE90aGVyd2lzZSwgaXQgd2lsbCByZXR1cm4gdGhlIGxvY2FsZSBjb25maWd1cmF0aW9uXG4gICAgICAgIC8vIHZhcmlhYmxlcyBmb3IgdGhpcyBpbnN0YW5jZS5cbiAgICAgICAgbG9jYWxlIDogZnVuY3Rpb24gKGtleSkge1xuICAgICAgICAgICAgdmFyIG5ld0xvY2FsZURhdGE7XG5cbiAgICAgICAgICAgIGlmIChrZXkgPT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgICAgIHJldHVybiB0aGlzLl9sb2NhbGUuX2FiYnI7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIG5ld0xvY2FsZURhdGEgPSBtb21lbnQubG9jYWxlRGF0YShrZXkpO1xuICAgICAgICAgICAgICAgIGlmIChuZXdMb2NhbGVEYXRhICE9IG51bGwpIHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5fbG9jYWxlID0gbmV3TG9jYWxlRGF0YTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0sXG5cbiAgICAgICAgbGFuZyA6IGRlcHJlY2F0ZShcbiAgICAgICAgICAgICdtb21lbnQoKS5sYW5nKCkgaXMgZGVwcmVjYXRlZC4gVXNlIG1vbWVudCgpLmxvY2FsZURhdGEoKSBpbnN0ZWFkLicsXG4gICAgICAgICAgICBmdW5jdGlvbiAoa2V5KSB7XG4gICAgICAgICAgICAgICAgaWYgKGtleSA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiB0aGlzLmxvY2FsZURhdGEoKTtcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gdGhpcy5sb2NhbGUoa2V5KTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICksXG5cbiAgICAgICAgbG9jYWxlRGF0YSA6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLl9sb2NhbGU7XG4gICAgICAgIH0sXG5cbiAgICAgICAgX2RhdGVUek9mZnNldCA6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIC8vIE9uIEZpcmVmb3guMjQgRGF0ZSNnZXRUaW1lem9uZU9mZnNldCByZXR1cm5zIGEgZmxvYXRpbmcgcG9pbnQuXG4gICAgICAgICAgICAvLyBodHRwczovL2dpdGh1Yi5jb20vbW9tZW50L21vbWVudC9wdWxsLzE4NzFcbiAgICAgICAgICAgIHJldHVybiBNYXRoLnJvdW5kKHRoaXMuX2QuZ2V0VGltZXpvbmVPZmZzZXQoKSAvIDE1KSAqIDE1O1xuICAgICAgICB9XG4gICAgfSk7XG5cbiAgICBmdW5jdGlvbiByYXdNb250aFNldHRlcihtb20sIHZhbHVlKSB7XG4gICAgICAgIHZhciBkYXlPZk1vbnRoO1xuXG4gICAgICAgIC8vIFRPRE86IE1vdmUgdGhpcyBvdXQgb2YgaGVyZSFcbiAgICAgICAgaWYgKHR5cGVvZiB2YWx1ZSA9PT0gJ3N0cmluZycpIHtcbiAgICAgICAgICAgIHZhbHVlID0gbW9tLmxvY2FsZURhdGEoKS5tb250aHNQYXJzZSh2YWx1ZSk7XG4gICAgICAgICAgICAvLyBUT0RPOiBBbm90aGVyIHNpbGVudCBmYWlsdXJlP1xuICAgICAgICAgICAgaWYgKHR5cGVvZiB2YWx1ZSAhPT0gJ251bWJlcicpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gbW9tO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgZGF5T2ZNb250aCA9IE1hdGgubWluKG1vbS5kYXRlKCksXG4gICAgICAgICAgICAgICAgZGF5c0luTW9udGgobW9tLnllYXIoKSwgdmFsdWUpKTtcbiAgICAgICAgbW9tLl9kWydzZXQnICsgKG1vbS5faXNVVEMgPyAnVVRDJyA6ICcnKSArICdNb250aCddKHZhbHVlLCBkYXlPZk1vbnRoKTtcbiAgICAgICAgcmV0dXJuIG1vbTtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiByYXdHZXR0ZXIobW9tLCB1bml0KSB7XG4gICAgICAgIHJldHVybiBtb20uX2RbJ2dldCcgKyAobW9tLl9pc1VUQyA/ICdVVEMnIDogJycpICsgdW5pdF0oKTtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiByYXdTZXR0ZXIobW9tLCB1bml0LCB2YWx1ZSkge1xuICAgICAgICBpZiAodW5pdCA9PT0gJ01vbnRoJykge1xuICAgICAgICAgICAgcmV0dXJuIHJhd01vbnRoU2V0dGVyKG1vbSwgdmFsdWUpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgcmV0dXJuIG1vbS5fZFsnc2V0JyArIChtb20uX2lzVVRDID8gJ1VUQycgOiAnJykgKyB1bml0XSh2YWx1ZSk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBmdW5jdGlvbiBtYWtlQWNjZXNzb3IodW5pdCwga2VlcFRpbWUpIHtcbiAgICAgICAgcmV0dXJuIGZ1bmN0aW9uICh2YWx1ZSkge1xuICAgICAgICAgICAgaWYgKHZhbHVlICE9IG51bGwpIHtcbiAgICAgICAgICAgICAgICByYXdTZXR0ZXIodGhpcywgdW5pdCwgdmFsdWUpO1xuICAgICAgICAgICAgICAgIG1vbWVudC51cGRhdGVPZmZzZXQodGhpcywga2VlcFRpbWUpO1xuICAgICAgICAgICAgICAgIHJldHVybiB0aGlzO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gcmF3R2V0dGVyKHRoaXMsIHVuaXQpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9O1xuICAgIH1cblxuICAgIG1vbWVudC5mbi5taWxsaXNlY29uZCA9IG1vbWVudC5mbi5taWxsaXNlY29uZHMgPSBtYWtlQWNjZXNzb3IoJ01pbGxpc2Vjb25kcycsIGZhbHNlKTtcbiAgICBtb21lbnQuZm4uc2Vjb25kID0gbW9tZW50LmZuLnNlY29uZHMgPSBtYWtlQWNjZXNzb3IoJ1NlY29uZHMnLCBmYWxzZSk7XG4gICAgbW9tZW50LmZuLm1pbnV0ZSA9IG1vbWVudC5mbi5taW51dGVzID0gbWFrZUFjY2Vzc29yKCdNaW51dGVzJywgZmFsc2UpO1xuICAgIC8vIFNldHRpbmcgdGhlIGhvdXIgc2hvdWxkIGtlZXAgdGhlIHRpbWUsIGJlY2F1c2UgdGhlIHVzZXIgZXhwbGljaXRseVxuICAgIC8vIHNwZWNpZmllZCB3aGljaCBob3VyIGhlIHdhbnRzLiBTbyB0cnlpbmcgdG8gbWFpbnRhaW4gdGhlIHNhbWUgaG91ciAoaW5cbiAgICAvLyBhIG5ldyB0aW1lem9uZSkgbWFrZXMgc2Vuc2UuIEFkZGluZy9zdWJ0cmFjdGluZyBob3VycyBkb2VzIG5vdCBmb2xsb3dcbiAgICAvLyB0aGlzIHJ1bGUuXG4gICAgbW9tZW50LmZuLmhvdXIgPSBtb21lbnQuZm4uaG91cnMgPSBtYWtlQWNjZXNzb3IoJ0hvdXJzJywgdHJ1ZSk7XG4gICAgLy8gbW9tZW50LmZuLm1vbnRoIGlzIGRlZmluZWQgc2VwYXJhdGVseVxuICAgIG1vbWVudC5mbi5kYXRlID0gbWFrZUFjY2Vzc29yKCdEYXRlJywgdHJ1ZSk7XG4gICAgbW9tZW50LmZuLmRhdGVzID0gZGVwcmVjYXRlKCdkYXRlcyBhY2Nlc3NvciBpcyBkZXByZWNhdGVkLiBVc2UgZGF0ZSBpbnN0ZWFkLicsIG1ha2VBY2Nlc3NvcignRGF0ZScsIHRydWUpKTtcbiAgICBtb21lbnQuZm4ueWVhciA9IG1ha2VBY2Nlc3NvcignRnVsbFllYXInLCB0cnVlKTtcbiAgICBtb21lbnQuZm4ueWVhcnMgPSBkZXByZWNhdGUoJ3llYXJzIGFjY2Vzc29yIGlzIGRlcHJlY2F0ZWQuIFVzZSB5ZWFyIGluc3RlYWQuJywgbWFrZUFjY2Vzc29yKCdGdWxsWWVhcicsIHRydWUpKTtcblxuICAgIC8vIGFkZCBwbHVyYWwgbWV0aG9kc1xuICAgIG1vbWVudC5mbi5kYXlzID0gbW9tZW50LmZuLmRheTtcbiAgICBtb21lbnQuZm4ubW9udGhzID0gbW9tZW50LmZuLm1vbnRoO1xuICAgIG1vbWVudC5mbi53ZWVrcyA9IG1vbWVudC5mbi53ZWVrO1xuICAgIG1vbWVudC5mbi5pc29XZWVrcyA9IG1vbWVudC5mbi5pc29XZWVrO1xuICAgIG1vbWVudC5mbi5xdWFydGVycyA9IG1vbWVudC5mbi5xdWFydGVyO1xuXG4gICAgLy8gYWRkIGFsaWFzZWQgZm9ybWF0IG1ldGhvZHNcbiAgICBtb21lbnQuZm4udG9KU09OID0gbW9tZW50LmZuLnRvSVNPU3RyaW5nO1xuXG4gICAgLyoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKlxuICAgICAgICBEdXJhdGlvbiBQcm90b3R5cGVcbiAgICAqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKiovXG5cblxuICAgIGZ1bmN0aW9uIGRheXNUb1llYXJzIChkYXlzKSB7XG4gICAgICAgIC8vIDQwMCB5ZWFycyBoYXZlIDE0NjA5NyBkYXlzICh0YWtpbmcgaW50byBhY2NvdW50IGxlYXAgeWVhciBydWxlcylcbiAgICAgICAgcmV0dXJuIGRheXMgKiA0MDAgLyAxNDYwOTc7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24geWVhcnNUb0RheXMgKHllYXJzKSB7XG4gICAgICAgIC8vIHllYXJzICogMzY1ICsgYWJzUm91bmQoeWVhcnMgLyA0KSAtXG4gICAgICAgIC8vICAgICBhYnNSb3VuZCh5ZWFycyAvIDEwMCkgKyBhYnNSb3VuZCh5ZWFycyAvIDQwMCk7XG4gICAgICAgIHJldHVybiB5ZWFycyAqIDE0NjA5NyAvIDQwMDtcbiAgICB9XG5cbiAgICBleHRlbmQobW9tZW50LmR1cmF0aW9uLmZuID0gRHVyYXRpb24ucHJvdG90eXBlLCB7XG5cbiAgICAgICAgX2J1YmJsZSA6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHZhciBtaWxsaXNlY29uZHMgPSB0aGlzLl9taWxsaXNlY29uZHMsXG4gICAgICAgICAgICAgICAgZGF5cyA9IHRoaXMuX2RheXMsXG4gICAgICAgICAgICAgICAgbW9udGhzID0gdGhpcy5fbW9udGhzLFxuICAgICAgICAgICAgICAgIGRhdGEgPSB0aGlzLl9kYXRhLFxuICAgICAgICAgICAgICAgIHNlY29uZHMsIG1pbnV0ZXMsIGhvdXJzLCB5ZWFycyA9IDA7XG5cbiAgICAgICAgICAgIC8vIFRoZSBmb2xsb3dpbmcgY29kZSBidWJibGVzIHVwIHZhbHVlcywgc2VlIHRoZSB0ZXN0cyBmb3JcbiAgICAgICAgICAgIC8vIGV4YW1wbGVzIG9mIHdoYXQgdGhhdCBtZWFucy5cbiAgICAgICAgICAgIGRhdGEubWlsbGlzZWNvbmRzID0gbWlsbGlzZWNvbmRzICUgMTAwMDtcblxuICAgICAgICAgICAgc2Vjb25kcyA9IGFic1JvdW5kKG1pbGxpc2Vjb25kcyAvIDEwMDApO1xuICAgICAgICAgICAgZGF0YS5zZWNvbmRzID0gc2Vjb25kcyAlIDYwO1xuXG4gICAgICAgICAgICBtaW51dGVzID0gYWJzUm91bmQoc2Vjb25kcyAvIDYwKTtcbiAgICAgICAgICAgIGRhdGEubWludXRlcyA9IG1pbnV0ZXMgJSA2MDtcblxuICAgICAgICAgICAgaG91cnMgPSBhYnNSb3VuZChtaW51dGVzIC8gNjApO1xuICAgICAgICAgICAgZGF0YS5ob3VycyA9IGhvdXJzICUgMjQ7XG5cbiAgICAgICAgICAgIGRheXMgKz0gYWJzUm91bmQoaG91cnMgLyAyNCk7XG5cbiAgICAgICAgICAgIC8vIEFjY3VyYXRlbHkgY29udmVydCBkYXlzIHRvIHllYXJzLCBhc3N1bWUgc3RhcnQgZnJvbSB5ZWFyIDAuXG4gICAgICAgICAgICB5ZWFycyA9IGFic1JvdW5kKGRheXNUb1llYXJzKGRheXMpKTtcbiAgICAgICAgICAgIGRheXMgLT0gYWJzUm91bmQoeWVhcnNUb0RheXMoeWVhcnMpKTtcblxuICAgICAgICAgICAgLy8gMzAgZGF5cyB0byBhIG1vbnRoXG4gICAgICAgICAgICAvLyBUT0RPIChpc2tyZW4pOiBVc2UgYW5jaG9yIGRhdGUgKGxpa2UgMXN0IEphbikgdG8gY29tcHV0ZSB0aGlzLlxuICAgICAgICAgICAgbW9udGhzICs9IGFic1JvdW5kKGRheXMgLyAzMCk7XG4gICAgICAgICAgICBkYXlzICU9IDMwO1xuXG4gICAgICAgICAgICAvLyAxMiBtb250aHMgLT4gMSB5ZWFyXG4gICAgICAgICAgICB5ZWFycyArPSBhYnNSb3VuZChtb250aHMgLyAxMik7XG4gICAgICAgICAgICBtb250aHMgJT0gMTI7XG5cbiAgICAgICAgICAgIGRhdGEuZGF5cyA9IGRheXM7XG4gICAgICAgICAgICBkYXRhLm1vbnRocyA9IG1vbnRocztcbiAgICAgICAgICAgIGRhdGEueWVhcnMgPSB5ZWFycztcbiAgICAgICAgfSxcblxuICAgICAgICBhYnMgOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICB0aGlzLl9taWxsaXNlY29uZHMgPSBNYXRoLmFicyh0aGlzLl9taWxsaXNlY29uZHMpO1xuICAgICAgICAgICAgdGhpcy5fZGF5cyA9IE1hdGguYWJzKHRoaXMuX2RheXMpO1xuICAgICAgICAgICAgdGhpcy5fbW9udGhzID0gTWF0aC5hYnModGhpcy5fbW9udGhzKTtcblxuICAgICAgICAgICAgdGhpcy5fZGF0YS5taWxsaXNlY29uZHMgPSBNYXRoLmFicyh0aGlzLl9kYXRhLm1pbGxpc2Vjb25kcyk7XG4gICAgICAgICAgICB0aGlzLl9kYXRhLnNlY29uZHMgPSBNYXRoLmFicyh0aGlzLl9kYXRhLnNlY29uZHMpO1xuICAgICAgICAgICAgdGhpcy5fZGF0YS5taW51dGVzID0gTWF0aC5hYnModGhpcy5fZGF0YS5taW51dGVzKTtcbiAgICAgICAgICAgIHRoaXMuX2RhdGEuaG91cnMgPSBNYXRoLmFicyh0aGlzLl9kYXRhLmhvdXJzKTtcbiAgICAgICAgICAgIHRoaXMuX2RhdGEubW9udGhzID0gTWF0aC5hYnModGhpcy5fZGF0YS5tb250aHMpO1xuICAgICAgICAgICAgdGhpcy5fZGF0YS55ZWFycyA9IE1hdGguYWJzKHRoaXMuX2RhdGEueWVhcnMpO1xuXG4gICAgICAgICAgICByZXR1cm4gdGhpcztcbiAgICAgICAgfSxcblxuICAgICAgICB3ZWVrcyA6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHJldHVybiBhYnNSb3VuZCh0aGlzLmRheXMoKSAvIDcpO1xuICAgICAgICB9LFxuXG4gICAgICAgIHZhbHVlT2YgOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5fbWlsbGlzZWNvbmRzICtcbiAgICAgICAgICAgICAgdGhpcy5fZGF5cyAqIDg2NGU1ICtcbiAgICAgICAgICAgICAgKHRoaXMuX21vbnRocyAlIDEyKSAqIDI1OTJlNiArXG4gICAgICAgICAgICAgIHRvSW50KHRoaXMuX21vbnRocyAvIDEyKSAqIDMxNTM2ZTY7XG4gICAgICAgIH0sXG5cbiAgICAgICAgaHVtYW5pemUgOiBmdW5jdGlvbiAod2l0aFN1ZmZpeCkge1xuICAgICAgICAgICAgdmFyIG91dHB1dCA9IHJlbGF0aXZlVGltZSh0aGlzLCAhd2l0aFN1ZmZpeCwgdGhpcy5sb2NhbGVEYXRhKCkpO1xuXG4gICAgICAgICAgICBpZiAod2l0aFN1ZmZpeCkge1xuICAgICAgICAgICAgICAgIG91dHB1dCA9IHRoaXMubG9jYWxlRGF0YSgpLnBhc3RGdXR1cmUoK3RoaXMsIG91dHB1dCk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHJldHVybiB0aGlzLmxvY2FsZURhdGEoKS5wb3N0Zm9ybWF0KG91dHB1dCk7XG4gICAgICAgIH0sXG5cbiAgICAgICAgYWRkIDogZnVuY3Rpb24gKGlucHV0LCB2YWwpIHtcbiAgICAgICAgICAgIC8vIHN1cHBvcnRzIG9ubHkgMi4wLXN0eWxlIGFkZCgxLCAncycpIG9yIGFkZChtb21lbnQpXG4gICAgICAgICAgICB2YXIgZHVyID0gbW9tZW50LmR1cmF0aW9uKGlucHV0LCB2YWwpO1xuXG4gICAgICAgICAgICB0aGlzLl9taWxsaXNlY29uZHMgKz0gZHVyLl9taWxsaXNlY29uZHM7XG4gICAgICAgICAgICB0aGlzLl9kYXlzICs9IGR1ci5fZGF5cztcbiAgICAgICAgICAgIHRoaXMuX21vbnRocyArPSBkdXIuX21vbnRocztcblxuICAgICAgICAgICAgdGhpcy5fYnViYmxlKCk7XG5cbiAgICAgICAgICAgIHJldHVybiB0aGlzO1xuICAgICAgICB9LFxuXG4gICAgICAgIHN1YnRyYWN0IDogZnVuY3Rpb24gKGlucHV0LCB2YWwpIHtcbiAgICAgICAgICAgIHZhciBkdXIgPSBtb21lbnQuZHVyYXRpb24oaW5wdXQsIHZhbCk7XG5cbiAgICAgICAgICAgIHRoaXMuX21pbGxpc2Vjb25kcyAtPSBkdXIuX21pbGxpc2Vjb25kcztcbiAgICAgICAgICAgIHRoaXMuX2RheXMgLT0gZHVyLl9kYXlzO1xuICAgICAgICAgICAgdGhpcy5fbW9udGhzIC09IGR1ci5fbW9udGhzO1xuXG4gICAgICAgICAgICB0aGlzLl9idWJibGUoKTtcblxuICAgICAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgICAgIH0sXG5cbiAgICAgICAgZ2V0IDogZnVuY3Rpb24gKHVuaXRzKSB7XG4gICAgICAgICAgICB1bml0cyA9IG5vcm1hbGl6ZVVuaXRzKHVuaXRzKTtcbiAgICAgICAgICAgIHJldHVybiB0aGlzW3VuaXRzLnRvTG93ZXJDYXNlKCkgKyAncyddKCk7XG4gICAgICAgIH0sXG5cbiAgICAgICAgYXMgOiBmdW5jdGlvbiAodW5pdHMpIHtcbiAgICAgICAgICAgIHZhciBkYXlzLCBtb250aHM7XG4gICAgICAgICAgICB1bml0cyA9IG5vcm1hbGl6ZVVuaXRzKHVuaXRzKTtcblxuICAgICAgICAgICAgaWYgKHVuaXRzID09PSAnbW9udGgnIHx8IHVuaXRzID09PSAneWVhcicpIHtcbiAgICAgICAgICAgICAgICBkYXlzID0gdGhpcy5fZGF5cyArIHRoaXMuX21pbGxpc2Vjb25kcyAvIDg2NGU1O1xuICAgICAgICAgICAgICAgIG1vbnRocyA9IHRoaXMuX21vbnRocyArIGRheXNUb1llYXJzKGRheXMpICogMTI7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHVuaXRzID09PSAnbW9udGgnID8gbW9udGhzIDogbW9udGhzIC8gMTI7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIC8vIGhhbmRsZSBtaWxsaXNlY29uZHMgc2VwYXJhdGVseSBiZWNhdXNlIG9mIGZsb2F0aW5nIHBvaW50IG1hdGggZXJyb3JzIChpc3N1ZSAjMTg2NylcbiAgICAgICAgICAgICAgICBkYXlzID0gdGhpcy5fZGF5cyArIHllYXJzVG9EYXlzKHRoaXMuX21vbnRocyAvIDEyKTtcbiAgICAgICAgICAgICAgICBzd2l0Y2ggKHVuaXRzKSB7XG4gICAgICAgICAgICAgICAgICAgIGNhc2UgJ3dlZWsnOiByZXR1cm4gZGF5cyAvIDcgKyB0aGlzLl9taWxsaXNlY29uZHMgLyA2MDQ4ZTU7XG4gICAgICAgICAgICAgICAgICAgIGNhc2UgJ2RheSc6IHJldHVybiBkYXlzICsgdGhpcy5fbWlsbGlzZWNvbmRzIC8gODY0ZTU7XG4gICAgICAgICAgICAgICAgICAgIGNhc2UgJ2hvdXInOiByZXR1cm4gZGF5cyAqIDI0ICsgdGhpcy5fbWlsbGlzZWNvbmRzIC8gMzZlNTtcbiAgICAgICAgICAgICAgICAgICAgY2FzZSAnbWludXRlJzogcmV0dXJuIGRheXMgKiAyNCAqIDYwICsgdGhpcy5fbWlsbGlzZWNvbmRzIC8gNmU0O1xuICAgICAgICAgICAgICAgICAgICBjYXNlICdzZWNvbmQnOiByZXR1cm4gZGF5cyAqIDI0ICogNjAgKiA2MCArIHRoaXMuX21pbGxpc2Vjb25kcyAvIDEwMDA7XG4gICAgICAgICAgICAgICAgICAgIC8vIE1hdGguZmxvb3IgcHJldmVudHMgZmxvYXRpbmcgcG9pbnQgbWF0aCBlcnJvcnMgaGVyZVxuICAgICAgICAgICAgICAgICAgICBjYXNlICdtaWxsaXNlY29uZCc6IHJldHVybiBNYXRoLmZsb29yKGRheXMgKiAyNCAqIDYwICogNjAgKiAxMDAwKSArIHRoaXMuX21pbGxpc2Vjb25kcztcbiAgICAgICAgICAgICAgICAgICAgZGVmYXVsdDogdGhyb3cgbmV3IEVycm9yKCdVbmtub3duIHVuaXQgJyArIHVuaXRzKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH0sXG5cbiAgICAgICAgbGFuZyA6IG1vbWVudC5mbi5sYW5nLFxuICAgICAgICBsb2NhbGUgOiBtb21lbnQuZm4ubG9jYWxlLFxuXG4gICAgICAgIHRvSXNvU3RyaW5nIDogZGVwcmVjYXRlKFxuICAgICAgICAgICAgJ3RvSXNvU3RyaW5nKCkgaXMgZGVwcmVjYXRlZC4gUGxlYXNlIHVzZSB0b0lTT1N0cmluZygpIGluc3RlYWQgJyArXG4gICAgICAgICAgICAnKG5vdGljZSB0aGUgY2FwaXRhbHMpJyxcbiAgICAgICAgICAgIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gdGhpcy50b0lTT1N0cmluZygpO1xuICAgICAgICAgICAgfVxuICAgICAgICApLFxuXG4gICAgICAgIHRvSVNPU3RyaW5nIDogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgLy8gaW5zcGlyZWQgYnkgaHR0cHM6Ly9naXRodWIuY29tL2RvcmRpbGxlL21vbWVudC1pc29kdXJhdGlvbi9ibG9iL21hc3Rlci9tb21lbnQuaXNvZHVyYXRpb24uanNcbiAgICAgICAgICAgIHZhciB5ZWFycyA9IE1hdGguYWJzKHRoaXMueWVhcnMoKSksXG4gICAgICAgICAgICAgICAgbW9udGhzID0gTWF0aC5hYnModGhpcy5tb250aHMoKSksXG4gICAgICAgICAgICAgICAgZGF5cyA9IE1hdGguYWJzKHRoaXMuZGF5cygpKSxcbiAgICAgICAgICAgICAgICBob3VycyA9IE1hdGguYWJzKHRoaXMuaG91cnMoKSksXG4gICAgICAgICAgICAgICAgbWludXRlcyA9IE1hdGguYWJzKHRoaXMubWludXRlcygpKSxcbiAgICAgICAgICAgICAgICBzZWNvbmRzID0gTWF0aC5hYnModGhpcy5zZWNvbmRzKCkgKyB0aGlzLm1pbGxpc2Vjb25kcygpIC8gMTAwMCk7XG5cbiAgICAgICAgICAgIGlmICghdGhpcy5hc1NlY29uZHMoKSkge1xuICAgICAgICAgICAgICAgIC8vIHRoaXMgaXMgdGhlIHNhbWUgYXMgQyMncyAoTm9kYSkgYW5kIHB5dGhvbiAoaXNvZGF0ZSkuLi5cbiAgICAgICAgICAgICAgICAvLyBidXQgbm90IG90aGVyIEpTIChnb29nLmRhdGUpXG4gICAgICAgICAgICAgICAgcmV0dXJuICdQMEQnO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICByZXR1cm4gKHRoaXMuYXNTZWNvbmRzKCkgPCAwID8gJy0nIDogJycpICtcbiAgICAgICAgICAgICAgICAnUCcgK1xuICAgICAgICAgICAgICAgICh5ZWFycyA/IHllYXJzICsgJ1knIDogJycpICtcbiAgICAgICAgICAgICAgICAobW9udGhzID8gbW9udGhzICsgJ00nIDogJycpICtcbiAgICAgICAgICAgICAgICAoZGF5cyA/IGRheXMgKyAnRCcgOiAnJykgK1xuICAgICAgICAgICAgICAgICgoaG91cnMgfHwgbWludXRlcyB8fCBzZWNvbmRzKSA/ICdUJyA6ICcnKSArXG4gICAgICAgICAgICAgICAgKGhvdXJzID8gaG91cnMgKyAnSCcgOiAnJykgK1xuICAgICAgICAgICAgICAgIChtaW51dGVzID8gbWludXRlcyArICdNJyA6ICcnKSArXG4gICAgICAgICAgICAgICAgKHNlY29uZHMgPyBzZWNvbmRzICsgJ1MnIDogJycpO1xuICAgICAgICB9LFxuXG4gICAgICAgIGxvY2FsZURhdGEgOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5fbG9jYWxlO1xuICAgICAgICB9XG4gICAgfSk7XG5cbiAgICBtb21lbnQuZHVyYXRpb24uZm4udG9TdHJpbmcgPSBtb21lbnQuZHVyYXRpb24uZm4udG9JU09TdHJpbmc7XG5cbiAgICBmdW5jdGlvbiBtYWtlRHVyYXRpb25HZXR0ZXIobmFtZSkge1xuICAgICAgICBtb21lbnQuZHVyYXRpb24uZm5bbmFtZV0gPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5fZGF0YVtuYW1lXTtcbiAgICAgICAgfTtcbiAgICB9XG5cbiAgICBmb3IgKGkgaW4gdW5pdE1pbGxpc2Vjb25kRmFjdG9ycykge1xuICAgICAgICBpZiAoaGFzT3duUHJvcCh1bml0TWlsbGlzZWNvbmRGYWN0b3JzLCBpKSkge1xuICAgICAgICAgICAgbWFrZUR1cmF0aW9uR2V0dGVyKGkudG9Mb3dlckNhc2UoKSk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBtb21lbnQuZHVyYXRpb24uZm4uYXNNaWxsaXNlY29uZHMgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLmFzKCdtcycpO1xuICAgIH07XG4gICAgbW9tZW50LmR1cmF0aW9uLmZuLmFzU2Vjb25kcyA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuYXMoJ3MnKTtcbiAgICB9O1xuICAgIG1vbWVudC5kdXJhdGlvbi5mbi5hc01pbnV0ZXMgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLmFzKCdtJyk7XG4gICAgfTtcbiAgICBtb21lbnQuZHVyYXRpb24uZm4uYXNIb3VycyA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuYXMoJ2gnKTtcbiAgICB9O1xuICAgIG1vbWVudC5kdXJhdGlvbi5mbi5hc0RheXMgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLmFzKCdkJyk7XG4gICAgfTtcbiAgICBtb21lbnQuZHVyYXRpb24uZm4uYXNXZWVrcyA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuYXMoJ3dlZWtzJyk7XG4gICAgfTtcbiAgICBtb21lbnQuZHVyYXRpb24uZm4uYXNNb250aHMgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLmFzKCdNJyk7XG4gICAgfTtcbiAgICBtb21lbnQuZHVyYXRpb24uZm4uYXNZZWFycyA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuYXMoJ3knKTtcbiAgICB9O1xuXG4gICAgLyoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKlxuICAgICAgICBEZWZhdWx0IExvY2FsZVxuICAgICoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKi9cblxuXG4gICAgLy8gU2V0IGRlZmF1bHQgbG9jYWxlLCBvdGhlciBsb2NhbGUgd2lsbCBpbmhlcml0IGZyb20gRW5nbGlzaC5cbiAgICBtb21lbnQubG9jYWxlKCdlbicsIHtcbiAgICAgICAgb3JkaW5hbCA6IGZ1bmN0aW9uIChudW1iZXIpIHtcbiAgICAgICAgICAgIHZhciBiID0gbnVtYmVyICUgMTAsXG4gICAgICAgICAgICAgICAgb3V0cHV0ID0gKHRvSW50KG51bWJlciAlIDEwMCAvIDEwKSA9PT0gMSkgPyAndGgnIDpcbiAgICAgICAgICAgICAgICAoYiA9PT0gMSkgPyAnc3QnIDpcbiAgICAgICAgICAgICAgICAoYiA9PT0gMikgPyAnbmQnIDpcbiAgICAgICAgICAgICAgICAoYiA9PT0gMykgPyAncmQnIDogJ3RoJztcbiAgICAgICAgICAgIHJldHVybiBudW1iZXIgKyBvdXRwdXQ7XG4gICAgICAgIH1cbiAgICB9KTtcblxuICAgIC8qIEVNQkVEX0xPQ0FMRVMgKi9cblxuICAgIC8qKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKipcbiAgICAgICAgRXhwb3NpbmcgTW9tZW50XG4gICAgKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqL1xuXG4gICAgZnVuY3Rpb24gbWFrZUdsb2JhbChzaG91bGREZXByZWNhdGUpIHtcbiAgICAgICAgLypnbG9iYWwgZW5kZXI6ZmFsc2UgKi9cbiAgICAgICAgaWYgKHR5cGVvZiBlbmRlciAhPT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICBvbGRHbG9iYWxNb21lbnQgPSBnbG9iYWxTY29wZS5tb21lbnQ7XG4gICAgICAgIGlmIChzaG91bGREZXByZWNhdGUpIHtcbiAgICAgICAgICAgIGdsb2JhbFNjb3BlLm1vbWVudCA9IGRlcHJlY2F0ZShcbiAgICAgICAgICAgICAgICAgICAgJ0FjY2Vzc2luZyBNb21lbnQgdGhyb3VnaCB0aGUgZ2xvYmFsIHNjb3BlIGlzICcgK1xuICAgICAgICAgICAgICAgICAgICAnZGVwcmVjYXRlZCwgYW5kIHdpbGwgYmUgcmVtb3ZlZCBpbiBhbiB1cGNvbWluZyAnICtcbiAgICAgICAgICAgICAgICAgICAgJ3JlbGVhc2UuJyxcbiAgICAgICAgICAgICAgICAgICAgbW9tZW50KTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGdsb2JhbFNjb3BlLm1vbWVudCA9IG1vbWVudDtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIC8vIENvbW1vbkpTIG1vZHVsZSBpcyBkZWZpbmVkXG4gICAgaWYgKGhhc01vZHVsZSkge1xuICAgICAgICBtb2R1bGUuZXhwb3J0cyA9IG1vbWVudDtcbiAgICB9IGVsc2UgaWYgKHR5cGVvZiBkZWZpbmUgPT09ICdmdW5jdGlvbicgJiYgZGVmaW5lLmFtZCkge1xuICAgICAgICBkZWZpbmUoJ21vbWVudCcsIGZ1bmN0aW9uIChyZXF1aXJlLCBleHBvcnRzLCBtb2R1bGUpIHtcbiAgICAgICAgICAgIGlmIChtb2R1bGUuY29uZmlnICYmIG1vZHVsZS5jb25maWcoKSAmJiBtb2R1bGUuY29uZmlnKCkubm9HbG9iYWwgPT09IHRydWUpIHtcbiAgICAgICAgICAgICAgICAvLyByZWxlYXNlIHRoZSBnbG9iYWwgdmFyaWFibGVcbiAgICAgICAgICAgICAgICBnbG9iYWxTY29wZS5tb21lbnQgPSBvbGRHbG9iYWxNb21lbnQ7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHJldHVybiBtb21lbnQ7XG4gICAgICAgIH0pO1xuICAgICAgICBtYWtlR2xvYmFsKHRydWUpO1xuICAgIH0gZWxzZSB7XG4gICAgICAgIG1ha2VHbG9iYWwoKTtcbiAgICB9XG59KS5jYWxsKHRoaXMpO1xuXG59KS5jYWxsKHRoaXMsdHlwZW9mIGdsb2JhbCAhPT0gXCJ1bmRlZmluZWRcIiA/IGdsb2JhbCA6IHR5cGVvZiBzZWxmICE9PSBcInVuZGVmaW5lZFwiID8gc2VsZiA6IHR5cGVvZiB3aW5kb3cgIT09IFwidW5kZWZpbmVkXCIgPyB3aW5kb3cgOiB7fSkiLCIvKlxyXG5cclxuIFNvZnR3YXJlIExpY2Vuc2UgQWdyZWVtZW50IChCU0QgTGljZW5zZSlcclxuIGh0dHA6Ly90YWZmeWRiLmNvbVxyXG4gQ29weXJpZ2h0IChjKVxyXG4gQWxsIHJpZ2h0cyByZXNlcnZlZC5cclxuXHJcblxyXG4gUmVkaXN0cmlidXRpb24gYW5kIHVzZSBvZiB0aGlzIHNvZnR3YXJlIGluIHNvdXJjZSBhbmQgYmluYXJ5IGZvcm1zLCB3aXRoIG9yIHdpdGhvdXQgbW9kaWZpY2F0aW9uLCBhcmUgcGVybWl0dGVkIHByb3ZpZGVkIHRoYXQgdGhlIGZvbGxvd2luZyBjb25kaXRpb24gaXMgbWV0OlxyXG5cclxuICogUmVkaXN0cmlidXRpb25zIG9mIHNvdXJjZSBjb2RlIG11c3QgcmV0YWluIHRoZSBhYm92ZSBjb3B5cmlnaHQgbm90aWNlLCB0aGlzIGxpc3Qgb2YgY29uZGl0aW9ucyBhbmQgdGhlIGZvbGxvd2luZyBkaXNjbGFpbWVyLlxyXG5cclxuIFRISVMgU09GVFdBUkUgSVMgUFJPVklERUQgQlkgVEhFIENPUFlSSUdIVCBIT0xERVJTIEFORCBDT05UUklCVVRPUlMgXCJBUyBJU1wiIEFORCBBTlkgRVhQUkVTUyBPUiBJTVBMSUVEIFdBUlJBTlRJRVMsIElOQ0xVRElORywgQlVUIE5PVCBMSU1JVEVEIFRPLCBUSEUgSU1QTElFRCBXQVJSQU5USUVTIE9GIE1FUkNIQU5UQUJJTElUWSBBTkQgRklUTkVTUyBGT1IgQSBQQVJUSUNVTEFSIFBVUlBPU0UgQVJFIERJU0NMQUlNRUQuIElOIE5PIEVWRU5UIFNIQUxMIFRIRSBDT1BZUklHSFQgT1dORVIgT1IgQ09OVFJJQlVUT1JTIEJFIExJQUJMRSBGT1IgQU5ZIERJUkVDVCwgSU5ESVJFQ1QsIElOQ0lERU5UQUwsIFNQRUNJQUwsIEVYRU1QTEFSWSwgT1IgQ09OU0VRVUVOVElBTCBEQU1BR0VTIChJTkNMVURJTkcsIEJVVCBOT1RcclxuIExJTUlURUQgVE8sIFBST0NVUkVNRU5UIE9GIFNVQlNUSVRVVEUgR09PRFMgT1IgU0VSVklDRVM7IExPU1MgT0YgVVNFLCBEQVRBLCBPUiBQUk9GSVRTOyBPUiBCVVNJTkVTUyBJTlRFUlJVUFRJT04pIEhPV0VWRVIgQ0FVU0VEIEFORCBPTiBBTlkgVEhFT1JZIE9GIExJQUJJTElUWSwgV0hFVEhFUiBJTiBDT05UUkFDVCwgU1RSSUNUIExJQUJJTElUWSwgT1IgVE9SVCAoSU5DTFVESU5HIE5FR0xJR0VOQ0UgT1IgT1RIRVJXSVNFKSBBUklTSU5HIElOIEFOWSBXQVkgT1VUIE9GIFRIRSBVU0UgT0YgVEhJUyBTT0ZUV0FSRSwgRVZFTiBJRiBBRFZJU0VEIE9GIFRIRSBQT1NTSUJJTElUWSBPRiBTVUNIIERBTUFHRS5cclxuXHJcbiAqL1xyXG5cclxuLypqc2xpbnQgICAgICAgIGJyb3dzZXIgOiB0cnVlLCBjb250aW51ZSA6IHRydWUsXHJcbiBkZXZlbCAgOiB0cnVlLCBpbmRlbnQgIDogMiwgICAgbWF4ZXJyICAgOiA1MDAsXHJcbiBuZXdjYXAgOiB0cnVlLCBub21lbiAgIDogdHJ1ZSwgcGx1c3BsdXMgOiB0cnVlLFxyXG4gcmVnZXhwIDogdHJ1ZSwgc2xvcHB5ICA6IHRydWUsIHZhcnMgICAgIDogZmFsc2UsXHJcbiB3aGl0ZSAgOiB0cnVlXHJcbiovXHJcblxyXG4vLyBCVUlMRCAxOTNkNDhkLCBtb2RpZmllZCBieSBtbWlrb3dza2kgdG8gcGFzcyBqc2xpbnRcclxuXHJcbi8vIFNldHVwIFRBRkZZIG5hbWUgc3BhY2UgdG8gcmV0dXJuIGFuIG9iamVjdCB3aXRoIG1ldGhvZHNcclxudmFyIFRBRkZZLCBleHBvcnRzLCBUO1xyXG4oZnVuY3Rpb24gKCkge1xyXG4gICd1c2Ugc3RyaWN0JztcclxuICB2YXJcclxuICAgIHR5cGVMaXN0LCAgICAgbWFrZVRlc3QsICAgICBpZHgsICAgIHR5cGVLZXksXHJcbiAgICB2ZXJzaW9uLCAgICAgIFRDLCAgICAgICAgICAgaWRwYWQsICBjbWF4LFxyXG4gICAgQVBJLCAgICAgICAgICBwcm90ZWN0SlNPTiwgIGVhY2gsICAgZWFjaGluLFxyXG4gICAgaXNJbmRleGFibGUsICByZXR1cm5GaWx0ZXIsIHJ1bkZpbHRlcnMsXHJcbiAgICBudW1jaGFyc3BsaXQsIG9yZGVyQnlDb2wsICAgcnVuLCAgICBpbnRlcnNlY3Rpb24sXHJcbiAgICBmaWx0ZXIsICAgICAgIG1ha2VDaWQsICAgICAgc2FmZUZvckpzb24sXHJcbiAgICBpc1JlZ2V4cFxyXG4gICAgO1xyXG5cclxuXHJcbiAgaWYgKCAhIFRBRkZZICl7XHJcbiAgICAvLyBUQyA9IENvdW50ZXIgZm9yIFRhZmZ5IERCcyBvbiBwYWdlLCB1c2VkIGZvciB1bmlxdWUgSURzXHJcbiAgICAvLyBjbWF4ID0gc2l6ZSBvZiBjaGFybnVtYXJyYXkgY29udmVyc2lvbiBjYWNoZVxyXG4gICAgLy8gaWRwYWQgPSB6ZXJvcyB0byBwYWQgcmVjb3JkIElEcyB3aXRoXHJcbiAgICB2ZXJzaW9uID0gJzIuNyc7XHJcbiAgICBUQyAgICAgID0gMTtcclxuICAgIGlkcGFkICAgPSAnMDAwMDAwJztcclxuICAgIGNtYXggICAgPSAxMDAwO1xyXG4gICAgQVBJICAgICA9IHt9O1xyXG5cclxuICAgIHByb3RlY3RKU09OID0gZnVuY3Rpb24gKCB0ICkge1xyXG4gICAgICAvLyAqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqXHJcbiAgICAgIC8vICpcclxuICAgICAgLy8gKiBUYWtlczogYSB2YXJpYWJsZVxyXG4gICAgICAvLyAqIFJldHVybnM6IHRoZSB2YXJpYWJsZSBpZiBvYmplY3QvYXJyYXkgb3IgdGhlIHBhcnNlZCB2YXJpYWJsZSBpZiBKU09OXHJcbiAgICAgIC8vICpcclxuICAgICAgLy8gKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKiAgXHJcbiAgICAgIGlmICggVEFGRlkuaXNBcnJheSggdCApIHx8IFRBRkZZLmlzT2JqZWN0KCB0ICkgKXtcclxuICAgICAgICByZXR1cm4gdDtcclxuICAgICAgfVxyXG4gICAgICBlbHNlIHtcclxuICAgICAgICByZXR1cm4gSlNPTi5wYXJzZSggdCApO1xyXG4gICAgICB9XHJcbiAgICB9O1xyXG4gICAgXHJcbiAgICAvLyBncmFjZWZ1bGx5IHN0b2xlbiBmcm9tIHVuZGVyc2NvcmUuanNcclxuICAgIGludGVyc2VjdGlvbiA9IGZ1bmN0aW9uKGFycmF5MSwgYXJyYXkyKSB7XHJcbiAgICAgICAgcmV0dXJuIGZpbHRlcihhcnJheTEsIGZ1bmN0aW9uKGl0ZW0pIHtcclxuICAgICAgICAgIHJldHVybiBhcnJheTIuaW5kZXhPZihpdGVtKSA+PSAwO1xyXG4gICAgICAgIH0pO1xyXG4gICAgfTtcclxuXHJcbiAgICAvLyBncmFjZWZ1bGx5IHN0b2xlbiBmcm9tIHVuZGVyc2NvcmUuanNcclxuICAgIGZpbHRlciA9IGZ1bmN0aW9uKG9iaiwgaXRlcmF0b3IsIGNvbnRleHQpIHtcclxuICAgICAgICB2YXIgcmVzdWx0cyA9IFtdO1xyXG4gICAgICAgIGlmIChvYmogPT0gbnVsbCkgcmV0dXJuIHJlc3VsdHM7XHJcbiAgICAgICAgaWYgKEFycmF5LnByb3RvdHlwZS5maWx0ZXIgJiYgb2JqLmZpbHRlciA9PT0gQXJyYXkucHJvdG90eXBlLmZpbHRlcikgcmV0dXJuIG9iai5maWx0ZXIoaXRlcmF0b3IsIGNvbnRleHQpO1xyXG4gICAgICAgIGVhY2gob2JqLCBmdW5jdGlvbih2YWx1ZSwgaW5kZXgsIGxpc3QpIHtcclxuICAgICAgICAgIGlmIChpdGVyYXRvci5jYWxsKGNvbnRleHQsIHZhbHVlLCBpbmRleCwgbGlzdCkpIHJlc3VsdHNbcmVzdWx0cy5sZW5ndGhdID0gdmFsdWU7XHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgcmV0dXJuIHJlc3VsdHM7XHJcbiAgICB9O1xyXG4gICAgXHJcbiAgICBpc1JlZ2V4cCA9IGZ1bmN0aW9uKGFPYmopIHtcclxuICAgICAgICByZXR1cm4gT2JqZWN0LnByb3RvdHlwZS50b1N0cmluZy5jYWxsKGFPYmopPT09J1tvYmplY3QgUmVnRXhwXSc7XHJcbiAgICB9XHJcbiAgICBcclxuICAgIHNhZmVGb3JKc29uID0gZnVuY3Rpb24oYU9iaikge1xyXG4gICAgICAgIHZhciBteVJlc3VsdCA9IFQuaXNBcnJheShhT2JqKSA/IFtdIDogVC5pc09iamVjdChhT2JqKSA/IHt9IDogbnVsbDtcclxuICAgICAgICBpZihhT2JqPT09bnVsbCkgcmV0dXJuIGFPYmo7XHJcbiAgICAgICAgZm9yKHZhciBpIGluIGFPYmopIHtcclxuICAgICAgICAgICAgbXlSZXN1bHRbaV0gID0gaXNSZWdleHAoYU9ialtpXSkgPyBhT2JqW2ldLnRvU3RyaW5nKCkgOiBULmlzQXJyYXkoYU9ialtpXSkgfHwgVC5pc09iamVjdChhT2JqW2ldKSA/IHNhZmVGb3JKc29uKGFPYmpbaV0pIDogYU9ialtpXTtcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIG15UmVzdWx0O1xyXG4gICAgfVxyXG4gICAgXHJcbiAgICBtYWtlQ2lkID0gZnVuY3Rpb24oYUNvbnRleHQpIHtcclxuICAgICAgICB2YXIgbXlDaWQgPSBKU09OLnN0cmluZ2lmeShhQ29udGV4dCk7XHJcbiAgICAgICAgaWYobXlDaWQubWF0Y2goL3JlZ2V4Lyk9PT1udWxsKSByZXR1cm4gbXlDaWQ7XHJcbiAgICAgICAgcmV0dXJuIEpTT04uc3RyaW5naWZ5KHNhZmVGb3JKc29uKGFDb250ZXh0KSk7XHJcbiAgICB9XHJcbiAgICBcclxuICAgIGVhY2ggPSBmdW5jdGlvbiAoIGEsIGZ1biwgdSApIHtcclxuICAgICAgdmFyIHIsIGksIHgsIHk7XHJcbiAgICAgIC8vICoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKipcclxuICAgICAgLy8gKlxyXG4gICAgICAvLyAqIFRha2VzOlxyXG4gICAgICAvLyAqIGEgPSBhbiBvYmplY3QvdmFsdWUgb3IgYW4gYXJyYXkgb2Ygb2JqZWN0cy92YWx1ZXNcclxuICAgICAgLy8gKiBmID0gYSBmdW5jdGlvblxyXG4gICAgICAvLyAqIHUgPSBvcHRpb25hbCBmbGFnIHRvIGRlc2NyaWJlIGhvdyB0byBoYW5kbGUgdW5kZWZpbmVkIHZhbHVlc1xyXG4gICAgICAvLyAgIGluIGFycmF5IG9mIHZhbHVlcy4gVHJ1ZTogcGFzcyB0aGVtIHRvIHRoZSBmdW5jdGlvbnMsXHJcbiAgICAgIC8vICAgRmFsc2U6IHNraXAuIERlZmF1bHQgRmFsc2U7XHJcbiAgICAgIC8vICogUHVycG9zZTogVXNlZCB0byBsb29wIG92ZXIgYXJyYXlzXHJcbiAgICAgIC8vICpcclxuICAgICAgLy8gKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKiAgXHJcbiAgICAgIGlmICggYSAmJiAoKFQuaXNBcnJheSggYSApICYmIGEubGVuZ3RoID09PSAxKSB8fCAoIVQuaXNBcnJheSggYSApKSkgKXtcclxuICAgICAgICBmdW4oIChULmlzQXJyYXkoIGEgKSkgPyBhWzBdIDogYSwgMCApO1xyXG4gICAgICB9XHJcbiAgICAgIGVsc2Uge1xyXG4gICAgICAgIGZvciAoIHIsIGksIHggPSAwLCBhID0gKFQuaXNBcnJheSggYSApKSA/IGEgOiBbYV0sIHkgPSBhLmxlbmd0aDtcclxuICAgICAgICAgICAgICB4IDwgeTsgeCsrIClcclxuICAgICAgICB7XHJcbiAgICAgICAgICBpID0gYVt4XTtcclxuICAgICAgICAgIGlmICggIVQuaXNVbmRlZmluZWQoIGkgKSB8fCAodSB8fCBmYWxzZSkgKXtcclxuICAgICAgICAgICAgciA9IGZ1biggaSwgeCApO1xyXG4gICAgICAgICAgICBpZiAoIHIgPT09IFQuRVhJVCApe1xyXG4gICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG4gICAgfTtcclxuXHJcbiAgICBlYWNoaW4gPSBmdW5jdGlvbiAoIG8sIGZ1biApIHtcclxuICAgICAgLy8gKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKlxyXG4gICAgICAvLyAqXHJcbiAgICAgIC8vICogVGFrZXM6XHJcbiAgICAgIC8vICogbyA9IGFuIG9iamVjdFxyXG4gICAgICAvLyAqIGYgPSBhIGZ1bmN0aW9uXHJcbiAgICAgIC8vICogUHVycG9zZTogVXNlZCB0byBsb29wIG92ZXIgb2JqZWN0c1xyXG4gICAgICAvLyAqXHJcbiAgICAgIC8vICoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKiogIFxyXG4gICAgICB2YXIgeCA9IDAsIHIsIGk7XHJcblxyXG4gICAgICBmb3IgKCBpIGluIG8gKXtcclxuICAgICAgICBpZiAoIG8uaGFzT3duUHJvcGVydHkoIGkgKSApe1xyXG4gICAgICAgICAgciA9IGZ1biggb1tpXSwgaSwgeCsrICk7XHJcbiAgICAgICAgICBpZiAoIHIgPT09IFQuRVhJVCApe1xyXG4gICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuXHJcbiAgICB9O1xyXG5cclxuICAgIEFQSS5leHRlbmQgPSBmdW5jdGlvbiAoIG0sIGYgKSB7XHJcbiAgICAgIC8vICoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKipcclxuICAgICAgLy8gKlxyXG4gICAgICAvLyAqIFRha2VzOiBtZXRob2QgbmFtZSwgZnVuY3Rpb25cclxuICAgICAgLy8gKiBQdXJwb3NlOiBBZGQgYSBjdXN0b20gbWV0aG9kIHRvIHRoZSBBUElcclxuICAgICAgLy8gKlxyXG4gICAgICAvLyAqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqICBcclxuICAgICAgQVBJW21dID0gZnVuY3Rpb24gKCkge1xyXG4gICAgICAgIHJldHVybiBmLmFwcGx5KCB0aGlzLCBhcmd1bWVudHMgKTtcclxuICAgICAgfTtcclxuICAgIH07XHJcblxyXG4gICAgaXNJbmRleGFibGUgPSBmdW5jdGlvbiAoIGYgKSB7XHJcbiAgICAgIHZhciBpO1xyXG4gICAgICAvLyBDaGVjayB0byBzZWUgaWYgcmVjb3JkIElEXHJcbiAgICAgIGlmICggVC5pc1N0cmluZyggZiApICYmIC9bdF1bMC05XSpbcl1bMC05XSovaS50ZXN0KCBmICkgKXtcclxuICAgICAgICByZXR1cm4gdHJ1ZTtcclxuICAgICAgfVxyXG4gICAgICAvLyBDaGVjayB0byBzZWUgaWYgcmVjb3JkXHJcbiAgICAgIGlmICggVC5pc09iamVjdCggZiApICYmIGYuX19faWQgJiYgZi5fX19zICl7XHJcbiAgICAgICAgcmV0dXJuIHRydWU7XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIC8vIENoZWNrIHRvIHNlZSBpZiBhcnJheSBvZiBpbmRleGVzXHJcbiAgICAgIGlmICggVC5pc0FycmF5KCBmICkgKXtcclxuICAgICAgICBpID0gdHJ1ZTtcclxuICAgICAgICBlYWNoKCBmLCBmdW5jdGlvbiAoIHIgKSB7XHJcbiAgICAgICAgICBpZiAoICFpc0luZGV4YWJsZSggciApICl7XHJcbiAgICAgICAgICAgIGkgPSBmYWxzZTtcclxuXHJcbiAgICAgICAgICAgIHJldHVybiBUQUZGWS5FWElUO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgIH0pO1xyXG4gICAgICAgIHJldHVybiBpO1xyXG4gICAgICB9XHJcblxyXG4gICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICB9O1xyXG5cclxuICAgIHJ1bkZpbHRlcnMgPSBmdW5jdGlvbiAoIHIsIGZpbHRlciApIHtcclxuICAgICAgLy8gKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKlxyXG4gICAgICAvLyAqXHJcbiAgICAgIC8vICogVGFrZXM6IHRha2VzIGEgcmVjb3JkIGFuZCBhIGNvbGxlY3Rpb24gb2YgZmlsdGVyc1xyXG4gICAgICAvLyAqIFJldHVybnM6IHRydWUgaWYgdGhlIHJlY29yZCBtYXRjaGVzLCBmYWxzZSBvdGhlcndpc2VcclxuICAgICAgLy8gKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKlxyXG4gICAgICB2YXIgbWF0Y2ggPSB0cnVlO1xyXG5cclxuXHJcbiAgICAgIGVhY2goIGZpbHRlciwgZnVuY3Rpb24gKCBtZiApIHtcclxuICAgICAgICBzd2l0Y2ggKCBULnR5cGVPZiggbWYgKSApe1xyXG4gICAgICAgICAgY2FzZSAnZnVuY3Rpb24nOlxyXG4gICAgICAgICAgICAvLyBydW4gZnVuY3Rpb25cclxuICAgICAgICAgICAgaWYgKCAhbWYuYXBwbHkoIHIgKSApe1xyXG4gICAgICAgICAgICAgIG1hdGNoID0gZmFsc2U7XHJcbiAgICAgICAgICAgICAgcmV0dXJuIFRBRkZZLkVYSVQ7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICBjYXNlICdhcnJheSc6XHJcbiAgICAgICAgICAgIC8vIGxvb3AgYXJyYXkgYW5kIHRyZWF0IGxpa2UgYSBTUUwgb3JcclxuICAgICAgICAgICAgbWF0Y2ggPSAobWYubGVuZ3RoID09PSAxKSA/IChydW5GaWx0ZXJzKCByLCBtZlswXSApKSA6XHJcbiAgICAgICAgICAgICAgKG1mLmxlbmd0aCA9PT0gMikgPyAocnVuRmlsdGVycyggciwgbWZbMF0gKSB8fFxyXG4gICAgICAgICAgICAgICAgcnVuRmlsdGVycyggciwgbWZbMV0gKSkgOlxyXG4gICAgICAgICAgICAgICAgKG1mLmxlbmd0aCA9PT0gMykgPyAocnVuRmlsdGVycyggciwgbWZbMF0gKSB8fFxyXG4gICAgICAgICAgICAgICAgICBydW5GaWx0ZXJzKCByLCBtZlsxXSApIHx8IHJ1bkZpbHRlcnMoIHIsIG1mWzJdICkpIDpcclxuICAgICAgICAgICAgICAgICAgKG1mLmxlbmd0aCA9PT0gNCkgPyAocnVuRmlsdGVycyggciwgbWZbMF0gKSB8fFxyXG4gICAgICAgICAgICAgICAgICAgIHJ1bkZpbHRlcnMoIHIsIG1mWzFdICkgfHwgcnVuRmlsdGVycyggciwgbWZbMl0gKSB8fFxyXG4gICAgICAgICAgICAgICAgICAgIHJ1bkZpbHRlcnMoIHIsIG1mWzNdICkpIDogZmFsc2U7XHJcbiAgICAgICAgICAgIGlmICggbWYubGVuZ3RoID4gNCApe1xyXG4gICAgICAgICAgICAgIGVhY2goIG1mLCBmdW5jdGlvbiAoIGYgKSB7XHJcbiAgICAgICAgICAgICAgICBpZiAoIHJ1bkZpbHRlcnMoIHIsIGYgKSApe1xyXG4gICAgICAgICAgICAgICAgICBtYXRjaCA9IHRydWU7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgfVxyXG4gICAgICB9KTtcclxuXHJcbiAgICAgIHJldHVybiBtYXRjaDtcclxuICAgIH07XHJcblxyXG4gICAgcmV0dXJuRmlsdGVyID0gZnVuY3Rpb24gKCBmICkge1xyXG4gICAgICAvLyAqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqXHJcbiAgICAgIC8vICpcclxuICAgICAgLy8gKiBUYWtlczogZmlsdGVyIG9iamVjdFxyXG4gICAgICAvLyAqIFJldHVybnM6IGEgZmlsdGVyIGZ1bmN0aW9uXHJcbiAgICAgIC8vICogUHVycG9zZTogVGFrZSBhIGZpbHRlciBvYmplY3QgYW5kIHJldHVybiBhIGZ1bmN0aW9uIHRoYXQgY2FuIGJlIHVzZWQgdG8gY29tcGFyZVxyXG4gICAgICAvLyAqIGEgVGFmZnlEQiByZWNvcmQgdG8gc2VlIGlmIHRoZSByZWNvcmQgbWF0Y2hlcyBhIHF1ZXJ5XHJcbiAgICAgIC8vICoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKiogIFxyXG4gICAgICB2YXIgbmYgPSBbXTtcclxuICAgICAgaWYgKCBULmlzU3RyaW5nKCBmICkgJiYgL1t0XVswLTldKltyXVswLTldKi9pLnRlc3QoIGYgKSApe1xyXG4gICAgICAgIGYgPSB7IF9fX2lkIDogZiB9O1xyXG4gICAgICB9XHJcbiAgICAgIGlmICggVC5pc0FycmF5KCBmICkgKXtcclxuICAgICAgICAvLyBpZiB3ZSBhcmUgd29ya2luZyB3aXRoIGFuIGFycmF5XHJcblxyXG4gICAgICAgIGVhY2goIGYsIGZ1bmN0aW9uICggciApIHtcclxuICAgICAgICAgIC8vIGxvb3AgdGhlIGFycmF5IGFuZCByZXR1cm4gYSBmaWx0ZXIgZnVuYyBmb3IgZWFjaCB2YWx1ZVxyXG4gICAgICAgICAgbmYucHVzaCggcmV0dXJuRmlsdGVyKCByICkgKTtcclxuICAgICAgICB9KTtcclxuICAgICAgICAvLyBub3cgYnVpbGQgYSBmdW5jIHRvIGxvb3Agb3ZlciB0aGUgZmlsdGVycyBhbmQgcmV0dXJuIHRydWUgaWYgQU5ZIG9mIHRoZSBmaWx0ZXJzIG1hdGNoXHJcbiAgICAgICAgLy8gVGhpcyBoYW5kbGVzIGxvZ2ljYWwgT1IgZXhwcmVzc2lvbnNcclxuICAgICAgICBmID0gZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgdmFyIHRoYXQgPSB0aGlzLCBtYXRjaCA9IGZhbHNlO1xyXG4gICAgICAgICAgZWFjaCggbmYsIGZ1bmN0aW9uICggZiApIHtcclxuICAgICAgICAgICAgaWYgKCBydW5GaWx0ZXJzKCB0aGF0LCBmICkgKXtcclxuICAgICAgICAgICAgICBtYXRjaCA9IHRydWU7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgcmV0dXJuIG1hdGNoO1xyXG4gICAgICAgIH07XHJcbiAgICAgICAgcmV0dXJuIGY7XHJcblxyXG4gICAgICB9XHJcbiAgICAgIC8vIGlmIHdlIGFyZSBkZWFsaW5nIHdpdGggYW4gT2JqZWN0XHJcbiAgICAgIGlmICggVC5pc09iamVjdCggZiApICl7XHJcbiAgICAgICAgaWYgKCBULmlzT2JqZWN0KCBmICkgJiYgZi5fX19pZCAmJiBmLl9fX3MgKXtcclxuICAgICAgICAgIGYgPSB7IF9fX2lkIDogZi5fX19pZCB9O1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLy8gTG9vcCBvdmVyIGVhY2ggdmFsdWUgb24gdGhlIG9iamVjdCB0byBwcmVwIG1hdGNoIHR5cGUgYW5kIG1hdGNoIHZhbHVlXHJcbiAgICAgICAgZWFjaGluKCBmLCBmdW5jdGlvbiAoIHYsIGkgKSB7XHJcblxyXG4gICAgICAgICAgLy8gZGVmYXVsdCBtYXRjaCB0eXBlIHRvIElTL0VxdWFsc1xyXG4gICAgICAgICAgaWYgKCAhVC5pc09iamVjdCggdiApICl7XHJcbiAgICAgICAgICAgIHYgPSB7XHJcbiAgICAgICAgICAgICAgJ2lzJyA6IHZcclxuICAgICAgICAgICAgfTtcclxuICAgICAgICAgIH1cclxuICAgICAgICAgIC8vIGxvb3Agb3ZlciBlYWNoIHZhbHVlIG9uIHRoZSB2YWx1ZSBvYmplY3QgIC0gaWYgYW55XHJcbiAgICAgICAgICBlYWNoaW4oIHYsIGZ1bmN0aW9uICggbXRlc3QsIHMgKSB7XHJcbiAgICAgICAgICAgIC8vIHMgPSBtYXRjaCB0eXBlLCBlLmcuIGlzLCBoYXNBbGwsIGxpa2UsIGV0Y1xyXG4gICAgICAgICAgICB2YXIgYyA9IFtdLCBsb29wZXI7XHJcblxyXG4gICAgICAgICAgICAvLyBmdW5jdGlvbiB0byBsb29wIGFuZCBhcHBseSBmaWx0ZXJcclxuICAgICAgICAgICAgbG9vcGVyID0gKHMgPT09ICdoYXNBbGwnKSA/XHJcbiAgICAgICAgICAgICAgZnVuY3Rpb24gKCBtdGVzdCwgZnVuYyApIHtcclxuICAgICAgICAgICAgICAgIGZ1bmMoIG10ZXN0ICk7XHJcbiAgICAgICAgICAgICAgfSA6IGVhY2g7XHJcblxyXG4gICAgICAgICAgICAvLyBsb29wIG92ZXIgZWFjaCB0ZXN0XHJcbiAgICAgICAgICAgIGxvb3BlciggbXRlc3QsIGZ1bmN0aW9uICggbXRlc3QgKSB7XHJcblxyXG4gICAgICAgICAgICAgIC8vIHN1ID0gbWF0Y2ggc3VjY2Vzc1xyXG4gICAgICAgICAgICAgIC8vIGYgPSBtYXRjaCBmYWxzZVxyXG4gICAgICAgICAgICAgIHZhciBzdSA9IHRydWUsIGYgPSBmYWxzZSwgbWF0Y2hGdW5jO1xyXG5cclxuXHJcbiAgICAgICAgICAgICAgLy8gcHVzaCBhIGZ1bmN0aW9uIG9udG8gdGhlIGZpbHRlciBjb2xsZWN0aW9uIHRvIGRvIHRoZSBtYXRjaGluZ1xyXG4gICAgICAgICAgICAgIG1hdGNoRnVuYyA9IGZ1bmN0aW9uICgpIHtcclxuXHJcbiAgICAgICAgICAgICAgICAvLyBnZXQgdGhlIHZhbHVlIGZyb20gdGhlIHJlY29yZFxyXG4gICAgICAgICAgICAgICAgdmFyXHJcbiAgICAgICAgICAgICAgICAgIG12YWx1ZSAgID0gdGhpc1tpXSxcclxuICAgICAgICAgICAgICAgICAgZXFlcSAgICAgPSAnPT0nLFxyXG4gICAgICAgICAgICAgICAgICBiYW5nZXEgICA9ICchPScsXHJcbiAgICAgICAgICAgICAgICAgIGVxZXFlcSAgID0gJz09PScsXHJcbiAgICAgICAgICAgICAgICAgIGx0ICAgPSAnPCcsXHJcbiAgICAgICAgICAgICAgICAgIGd0ICAgPSAnPicsXHJcbiAgICAgICAgICAgICAgICAgIGx0ZXEgICA9ICc8PScsXHJcbiAgICAgICAgICAgICAgICAgIGd0ZXEgICA9ICc+PScsXHJcbiAgICAgICAgICAgICAgICAgIGJhbmdlcWVxID0gJyE9PScsXHJcbiAgICAgICAgICAgICAgICAgIHJcclxuICAgICAgICAgICAgICAgICAgO1xyXG5cclxuICAgICAgICAgICAgICAgIGlmICh0eXBlb2YgbXZhbHVlID09PSAndW5kZWZpbmVkJykge1xyXG4gICAgICAgICAgICAgICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBcclxuICAgICAgICAgICAgICAgIGlmICggKHMuaW5kZXhPZiggJyEnICkgPT09IDApICYmIHMgIT09IGJhbmdlcSAmJlxyXG4gICAgICAgICAgICAgICAgICBzICE9PSBiYW5nZXFlcSApXHJcbiAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgIC8vIGlmIHRoZSBmaWx0ZXIgbmFtZSBzdGFydHMgd2l0aCAhIGFzIGluICchaXMnIHRoZW4gcmV2ZXJzZSB0aGUgbWF0Y2ggbG9naWMgYW5kIHJlbW92ZSB0aGUgIVxyXG4gICAgICAgICAgICAgICAgICBzdSA9IGZhbHNlO1xyXG4gICAgICAgICAgICAgICAgICBzID0gcy5zdWJzdHJpbmcoIDEsIHMubGVuZ3RoICk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAvLyBnZXQgdGhlIG1hdGNoIHJlc3VsdHMgYmFzZWQgb24gdGhlIHMvbWF0Y2ggdHlwZVxyXG4gICAgICAgICAgICAgICAgLypqc2xpbnQgZXFlcSA6IHRydWUgKi9cclxuICAgICAgICAgICAgICAgIHIgPSAoXHJcbiAgICAgICAgICAgICAgICAgIChzID09PSAncmVnZXgnKSA/IChtdGVzdC50ZXN0KCBtdmFsdWUgKSkgOiAocyA9PT0gJ2x0JyB8fCBzID09PSBsdClcclxuICAgICAgICAgICAgICAgICAgPyAobXZhbHVlIDwgbXRlc3QpICA6IChzID09PSAnZ3QnIHx8IHMgPT09IGd0KVxyXG4gICAgICAgICAgICAgICAgICA/IChtdmFsdWUgPiBtdGVzdCkgIDogKHMgPT09ICdsdGUnIHx8IHMgPT09IGx0ZXEpXHJcbiAgICAgICAgICAgICAgICAgID8gKG12YWx1ZSA8PSBtdGVzdCkgOiAocyA9PT0gJ2d0ZScgfHwgcyA9PT0gZ3RlcSlcclxuICAgICAgICAgICAgICAgICAgPyAobXZhbHVlID49IG10ZXN0KSA6IChzID09PSAnbGVmdCcpXHJcbiAgICAgICAgICAgICAgICAgID8gKG12YWx1ZS5pbmRleE9mKCBtdGVzdCApID09PSAwKSA6IChzID09PSAnbGVmdG5vY2FzZScpXHJcbiAgICAgICAgICAgICAgICAgID8gKG12YWx1ZS50b0xvd2VyQ2FzZSgpLmluZGV4T2YoIG10ZXN0LnRvTG93ZXJDYXNlKCkgKVxyXG4gICAgICAgICAgICAgICAgICAgID09PSAwKSA6IChzID09PSAncmlnaHQnKVxyXG4gICAgICAgICAgICAgICAgICA/IChtdmFsdWUuc3Vic3RyaW5nKCAobXZhbHVlLmxlbmd0aCAtIG10ZXN0Lmxlbmd0aCkgKVxyXG4gICAgICAgICAgICAgICAgICAgID09PSBtdGVzdCkgOiAocyA9PT0gJ3JpZ2h0bm9jYXNlJylcclxuICAgICAgICAgICAgICAgICAgPyAobXZhbHVlLnRvTG93ZXJDYXNlKCkuc3Vic3RyaW5nKFxyXG4gICAgICAgICAgICAgICAgICAgIChtdmFsdWUubGVuZ3RoIC0gbXRlc3QubGVuZ3RoKSApID09PSBtdGVzdC50b0xvd2VyQ2FzZSgpKVxyXG4gICAgICAgICAgICAgICAgICAgIDogKHMgPT09ICdsaWtlJylcclxuICAgICAgICAgICAgICAgICAgPyAobXZhbHVlLmluZGV4T2YoIG10ZXN0ICkgPj0gMCkgOiAocyA9PT0gJ2xpa2Vub2Nhc2UnKVxyXG4gICAgICAgICAgICAgICAgICA/IChtdmFsdWUudG9Mb3dlckNhc2UoKS5pbmRleE9mKG10ZXN0LnRvTG93ZXJDYXNlKCkpID49IDApXHJcbiAgICAgICAgICAgICAgICAgICAgOiAocyA9PT0gZXFlcWVxIHx8IHMgPT09ICdpcycpXHJcbiAgICAgICAgICAgICAgICAgID8gKG12YWx1ZSA9PT0gIG10ZXN0KSA6IChzID09PSBlcWVxKVxyXG4gICAgICAgICAgICAgICAgICA/IChtdmFsdWUgPT0gbXRlc3QpIDogKHMgPT09IGJhbmdlcWVxKVxyXG4gICAgICAgICAgICAgICAgICA/IChtdmFsdWUgIT09ICBtdGVzdCkgOiAocyA9PT0gYmFuZ2VxKVxyXG4gICAgICAgICAgICAgICAgICA/IChtdmFsdWUgIT0gbXRlc3QpIDogKHMgPT09ICdpc25vY2FzZScpXHJcbiAgICAgICAgICAgICAgICAgID8gKG12YWx1ZS50b0xvd2VyQ2FzZVxyXG4gICAgICAgICAgICAgICAgICAgID8gbXZhbHVlLnRvTG93ZXJDYXNlKCkgPT09IG10ZXN0LnRvTG93ZXJDYXNlKClcclxuICAgICAgICAgICAgICAgICAgICAgIDogbXZhbHVlID09PSBtdGVzdCkgOiAocyA9PT0gJ2hhcycpXHJcbiAgICAgICAgICAgICAgICAgID8gKFQuaGFzKCBtdmFsdWUsIG10ZXN0ICkpIDogKHMgPT09ICdoYXNhbGwnKVxyXG4gICAgICAgICAgICAgICAgICA/IChULmhhc0FsbCggbXZhbHVlLCBtdGVzdCApKSA6IChzID09PSAnY29udGFpbnMnKVxyXG4gICAgICAgICAgICAgICAgICA/IChUQUZGWS5pc0FycmF5KG12YWx1ZSkgJiYgbXZhbHVlLmluZGV4T2YobXRlc3QpID4gLTEpIDogKFxyXG4gICAgICAgICAgICAgICAgICAgIHMuaW5kZXhPZiggJ2lzJyApID09PSAtMVxyXG4gICAgICAgICAgICAgICAgICAgICAgJiYgIVRBRkZZLmlzTnVsbCggbXZhbHVlIClcclxuICAgICAgICAgICAgICAgICAgICAgICYmICFUQUZGWS5pc1VuZGVmaW5lZCggbXZhbHVlIClcclxuICAgICAgICAgICAgICAgICAgICAgICYmICFUQUZGWS5pc09iamVjdCggbXRlc3QgKVxyXG4gICAgICAgICAgICAgICAgICAgICAgJiYgIVRBRkZZLmlzQXJyYXkoIG10ZXN0IClcclxuICAgICAgICAgICAgICAgICAgICApXHJcbiAgICAgICAgICAgICAgICAgID8gKG10ZXN0ID09PSBtdmFsdWVbc10pXHJcbiAgICAgICAgICAgICAgICAgICAgOiAoVFtzXSAmJiBULmlzRnVuY3Rpb24oIFRbc10gKVxyXG4gICAgICAgICAgICAgICAgICAgICYmIHMuaW5kZXhPZiggJ2lzJyApID09PSAwKVxyXG4gICAgICAgICAgICAgICAgICA/IFRbc10oIG12YWx1ZSApID09PSBtdGVzdFxyXG4gICAgICAgICAgICAgICAgICAgIDogKFRbc10gJiYgVC5pc0Z1bmN0aW9uKCBUW3NdICkpXHJcbiAgICAgICAgICAgICAgICAgID8gVFtzXSggbXZhbHVlLCBtdGVzdCApIDogKGZhbHNlKVxyXG4gICAgICAgICAgICAgICAgKTtcclxuICAgICAgICAgICAgICAgIC8qanNsaW50IGVxZXEgOiBmYWxzZSAqL1xyXG4gICAgICAgICAgICAgICAgciA9IChyICYmICFzdSkgPyBmYWxzZSA6ICghciAmJiAhc3UpID8gdHJ1ZSA6IHI7XHJcblxyXG4gICAgICAgICAgICAgICAgcmV0dXJuIHI7XHJcbiAgICAgICAgICAgICAgfTtcclxuICAgICAgICAgICAgICBjLnB1c2goIG1hdGNoRnVuYyApO1xyXG5cclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgIC8vIGlmIG9ubHkgb25lIGZpbHRlciBpbiB0aGUgY29sbGVjdGlvbiBwdXNoIGl0IG9udG8gdGhlIGZpbHRlciBsaXN0IHdpdGhvdXQgdGhlIGFycmF5XHJcbiAgICAgICAgICAgIGlmICggYy5sZW5ndGggPT09IDEgKXtcclxuXHJcbiAgICAgICAgICAgICAgbmYucHVzaCggY1swXSApO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICAgIC8vIGVsc2UgYnVpbGQgYSBmdW5jdGlvbiB0byBsb29wIG92ZXIgYWxsIHRoZSBmaWx0ZXJzIGFuZCByZXR1cm4gdHJ1ZSBvbmx5IGlmIEFMTCBtYXRjaFxyXG4gICAgICAgICAgICAgIC8vIHRoaXMgaXMgYSBsb2dpY2FsIEFORFxyXG4gICAgICAgICAgICAgIG5mLnB1c2goIGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgICAgIHZhciB0aGF0ID0gdGhpcywgbWF0Y2ggPSBmYWxzZTtcclxuICAgICAgICAgICAgICAgIGVhY2goIGMsIGZ1bmN0aW9uICggZiApIHtcclxuICAgICAgICAgICAgICAgICAgaWYgKCBmLmFwcGx5KCB0aGF0ICkgKXtcclxuICAgICAgICAgICAgICAgICAgICBtYXRjaCA9IHRydWU7XHJcbiAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIG1hdGNoO1xyXG4gICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICB9KTtcclxuICAgICAgICB9KTtcclxuICAgICAgICAvLyBmaW5hbGx5IHJldHVybiBhIHNpbmdsZSBmdW5jdGlvbiB0aGF0IHdyYXBzIGFsbCB0aGUgb3RoZXIgZnVuY3Rpb25zIGFuZCB3aWxsIHJ1biBhIHF1ZXJ5XHJcbiAgICAgICAgLy8gd2hlcmUgYWxsIGZ1bmN0aW9ucyBoYXZlIHRvIHJldHVybiB0cnVlIGZvciBhIHJlY29yZCB0byBhcHBlYXIgaW4gYSBxdWVyeSByZXN1bHRcclxuICAgICAgICBmID0gZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgdmFyIHRoYXQgPSB0aGlzLCBtYXRjaCA9IHRydWU7XHJcbiAgICAgICAgICAvLyBmYXN0ZXIgaWYgbGVzcyB0aGFuICA0IGZ1bmN0aW9uc1xyXG4gICAgICAgICAgbWF0Y2ggPSAobmYubGVuZ3RoID09PSAxICYmICFuZlswXS5hcHBseSggdGhhdCApKSA/IGZhbHNlIDpcclxuICAgICAgICAgICAgKG5mLmxlbmd0aCA9PT0gMiAmJlxyXG4gICAgICAgICAgICAgICghbmZbMF0uYXBwbHkoIHRoYXQgKSB8fCAhbmZbMV0uYXBwbHkoIHRoYXQgKSkpID8gZmFsc2UgOlxyXG4gICAgICAgICAgICAgIChuZi5sZW5ndGggPT09IDMgJiZcclxuICAgICAgICAgICAgICAgICghbmZbMF0uYXBwbHkoIHRoYXQgKSB8fCAhbmZbMV0uYXBwbHkoIHRoYXQgKSB8fFxyXG4gICAgICAgICAgICAgICAgICAhbmZbMl0uYXBwbHkoIHRoYXQgKSkpID8gZmFsc2UgOlxyXG4gICAgICAgICAgICAgICAgKG5mLmxlbmd0aCA9PT0gNCAmJlxyXG4gICAgICAgICAgICAgICAgICAoIW5mWzBdLmFwcGx5KCB0aGF0ICkgfHwgIW5mWzFdLmFwcGx5KCB0aGF0ICkgfHxcclxuICAgICAgICAgICAgICAgICAgICAhbmZbMl0uYXBwbHkoIHRoYXQgKSB8fCAhbmZbM10uYXBwbHkoIHRoYXQgKSkpID8gZmFsc2VcclxuICAgICAgICAgICAgICAgICAgOiB0cnVlO1xyXG4gICAgICAgICAgaWYgKCBuZi5sZW5ndGggPiA0ICl7XHJcbiAgICAgICAgICAgIGVhY2goIG5mLCBmdW5jdGlvbiAoIGYgKSB7XHJcbiAgICAgICAgICAgICAgaWYgKCAhcnVuRmlsdGVycyggdGhhdCwgZiApICl7XHJcbiAgICAgICAgICAgICAgICBtYXRjaCA9IGZhbHNlO1xyXG4gICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgICByZXR1cm4gbWF0Y2g7XHJcbiAgICAgICAgfTtcclxuICAgICAgICByZXR1cm4gZjtcclxuICAgICAgfVxyXG5cclxuICAgICAgLy8gaWYgZnVuY3Rpb25cclxuICAgICAgaWYgKCBULmlzRnVuY3Rpb24oIGYgKSApe1xyXG4gICAgICAgIHJldHVybiBmO1xyXG4gICAgICB9XHJcbiAgICB9O1xyXG5cclxuICAgIG9yZGVyQnlDb2wgPSBmdW5jdGlvbiAoIGFyLCBvICkge1xyXG4gICAgICAvLyAqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqXHJcbiAgICAgIC8vICpcclxuICAgICAgLy8gKiBUYWtlczogdGFrZXMgYW4gYXJyYXkgYW5kIGEgc29ydCBvYmplY3RcclxuICAgICAgLy8gKiBSZXR1cm5zOiB0aGUgYXJyYXkgc29ydGVkXHJcbiAgICAgIC8vICogUHVycG9zZTogQWNjZXB0IGZpbHRlcnMgc3VjaCBhcyBcIltjb2xdLCBbY29sMl1cIiBvciBcIltjb2xdIGRlc2NcIiBhbmQgc29ydCBvbiB0aG9zZSBjb2x1bW5zXHJcbiAgICAgIC8vICpcclxuICAgICAgLy8gKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKlxyXG5cclxuICAgICAgdmFyIHNvcnRGdW5jID0gZnVuY3Rpb24gKCBhLCBiICkge1xyXG4gICAgICAgIC8vIGZ1bmN0aW9uIHRvIHBhc3MgdG8gdGhlIG5hdGl2ZSBhcnJheS5zb3J0IHRvIHNvcnQgYW4gYXJyYXlcclxuICAgICAgICB2YXIgciA9IDA7XHJcblxyXG4gICAgICAgIFQuZWFjaCggbywgZnVuY3Rpb24gKCBzZCApIHtcclxuICAgICAgICAgIC8vIGxvb3Agb3ZlciB0aGUgc29ydCBpbnN0cnVjdGlvbnNcclxuICAgICAgICAgIC8vIGdldCB0aGUgY29sdW1uIG5hbWVcclxuICAgICAgICAgIHZhciBvLCBjb2wsIGRpciwgYywgZDtcclxuICAgICAgICAgIG8gPSBzZC5zcGxpdCggJyAnICk7XHJcbiAgICAgICAgICBjb2wgPSBvWzBdO1xyXG5cclxuICAgICAgICAgIC8vIGdldCB0aGUgZGlyZWN0aW9uXHJcbiAgICAgICAgICBkaXIgPSAoby5sZW5ndGggPT09IDEpID8gXCJsb2dpY2FsXCIgOiBvWzFdO1xyXG5cclxuXHJcbiAgICAgICAgICBpZiAoIGRpciA9PT0gJ2xvZ2ljYWwnICl7XHJcbiAgICAgICAgICAgIC8vIGlmIGRpciBpcyBsb2dpY2FsIHRoYW4gZ3JhYiB0aGUgY2hhcm51bSBhcnJheXMgZm9yIHRoZSB0d28gdmFsdWVzIHdlIGFyZSBsb29raW5nIGF0XHJcbiAgICAgICAgICAgIGMgPSBudW1jaGFyc3BsaXQoIGFbY29sXSApO1xyXG4gICAgICAgICAgICBkID0gbnVtY2hhcnNwbGl0KCBiW2NvbF0gKTtcclxuICAgICAgICAgICAgLy8gbG9vcCBvdmVyIHRoZSBjaGFybnVtYXJyYXlzIHVudGlsIG9uZSB2YWx1ZSBpcyBoaWdoZXIgdGhhbiB0aGUgb3RoZXJcclxuICAgICAgICAgICAgVC5lYWNoKCAoYy5sZW5ndGggPD0gZC5sZW5ndGgpID8gYyA6IGQsIGZ1bmN0aW9uICggeCwgaSApIHtcclxuICAgICAgICAgICAgICBpZiAoIGNbaV0gPCBkW2ldICl7XHJcbiAgICAgICAgICAgICAgICByID0gLTE7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gVEFGRlkuRVhJVDtcclxuICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgZWxzZSBpZiAoIGNbaV0gPiBkW2ldICl7XHJcbiAgICAgICAgICAgICAgICByID0gMTtcclxuICAgICAgICAgICAgICAgIHJldHVybiBUQUZGWS5FWElUO1xyXG4gICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfSApO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgICAgZWxzZSBpZiAoIGRpciA9PT0gJ2xvZ2ljYWxkZXNjJyApe1xyXG4gICAgICAgICAgICAvLyBpZiBsb2dpY2FsZGVzYyB0aGFuIGdyYWIgdGhlIGNoYXJudW0gYXJyYXlzIGZvciB0aGUgdHdvIHZhbHVlcyB3ZSBhcmUgbG9va2luZyBhdFxyXG4gICAgICAgICAgICBjID0gbnVtY2hhcnNwbGl0KCBhW2NvbF0gKTtcclxuICAgICAgICAgICAgZCA9IG51bWNoYXJzcGxpdCggYltjb2xdICk7XHJcbiAgICAgICAgICAgIC8vIGxvb3Agb3ZlciB0aGUgY2hhcm51bWFycmF5cyB1bnRpbCBvbmUgdmFsdWUgaXMgbG93ZXIgdGhhbiB0aGUgb3RoZXJcclxuICAgICAgICAgICAgVC5lYWNoKCAoYy5sZW5ndGggPD0gZC5sZW5ndGgpID8gYyA6IGQsIGZ1bmN0aW9uICggeCwgaSApIHtcclxuICAgICAgICAgICAgICBpZiAoIGNbaV0gPiBkW2ldICl7XHJcbiAgICAgICAgICAgICAgICByID0gLTE7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gVEFGRlkuRVhJVDtcclxuICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgZWxzZSBpZiAoIGNbaV0gPCBkW2ldICl7XHJcbiAgICAgICAgICAgICAgICByID0gMTtcclxuICAgICAgICAgICAgICAgIHJldHVybiBUQUZGWS5FWElUO1xyXG4gICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfSApO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgICAgZWxzZSBpZiAoIGRpciA9PT0gJ2FzZWMnICYmIGFbY29sXSA8IGJbY29sXSApe1xyXG4gICAgICAgICAgICAvLyBpZiBhc2VjIC0gZGVmYXVsdCAtIGNoZWNrIHRvIHNlZSB3aGljaCBpcyBoaWdoZXJcclxuICAgICAgICAgICAgciA9IC0xO1xyXG4gICAgICAgICAgICByZXR1cm4gVC5FWElUO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgICAgZWxzZSBpZiAoIGRpciA9PT0gJ2FzZWMnICYmIGFbY29sXSA+IGJbY29sXSApe1xyXG4gICAgICAgICAgICAvLyBpZiBhc2VjIC0gZGVmYXVsdCAtIGNoZWNrIHRvIHNlZSB3aGljaCBpcyBoaWdoZXJcclxuICAgICAgICAgICAgciA9IDE7XHJcbiAgICAgICAgICAgIHJldHVybiBULkVYSVQ7XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgICBlbHNlIGlmICggZGlyID09PSAnZGVzYycgJiYgYVtjb2xdID4gYltjb2xdICl7XHJcbiAgICAgICAgICAgIC8vIGlmIGRlc2MgY2hlY2sgdG8gc2VlIHdoaWNoIGlzIGxvd2VyXHJcbiAgICAgICAgICAgIHIgPSAtMTtcclxuICAgICAgICAgICAgcmV0dXJuIFQuRVhJVDtcclxuXHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgICBlbHNlIGlmICggZGlyID09PSAnZGVzYycgJiYgYVtjb2xdIDwgYltjb2xdICl7XHJcbiAgICAgICAgICAgIC8vIGlmIGRlc2MgY2hlY2sgdG8gc2VlIHdoaWNoIGlzIGxvd2VyXHJcbiAgICAgICAgICAgIHIgPSAxO1xyXG4gICAgICAgICAgICByZXR1cm4gVC5FWElUO1xyXG5cclxuICAgICAgICAgIH1cclxuICAgICAgICAgIC8vIGlmIHIgaXMgc3RpbGwgMCBhbmQgd2UgYXJlIGRvaW5nIGEgbG9naWNhbCBzb3J0IHRoYW4gbG9vayB0byBzZWUgaWYgb25lIGFycmF5IGlzIGxvbmdlciB0aGFuIHRoZSBvdGhlclxyXG4gICAgICAgICAgaWYgKCByID09PSAwICYmIGRpciA9PT0gJ2xvZ2ljYWwnICYmIGMubGVuZ3RoIDwgZC5sZW5ndGggKXtcclxuICAgICAgICAgICAgciA9IC0xO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgICAgZWxzZSBpZiAoIHIgPT09IDAgJiYgZGlyID09PSAnbG9naWNhbCcgJiYgYy5sZW5ndGggPiBkLmxlbmd0aCApe1xyXG4gICAgICAgICAgICByID0gMTtcclxuICAgICAgICAgIH1cclxuICAgICAgICAgIGVsc2UgaWYgKCByID09PSAwICYmIGRpciA9PT0gJ2xvZ2ljYWxkZXNjJyAmJiBjLmxlbmd0aCA+IGQubGVuZ3RoICl7XHJcbiAgICAgICAgICAgIHIgPSAtMTtcclxuICAgICAgICAgIH1cclxuICAgICAgICAgIGVsc2UgaWYgKCByID09PSAwICYmIGRpciA9PT0gJ2xvZ2ljYWxkZXNjJyAmJiBjLmxlbmd0aCA8IGQubGVuZ3RoICl7XHJcbiAgICAgICAgICAgIHIgPSAxO1xyXG4gICAgICAgICAgfVxyXG5cclxuICAgICAgICAgIGlmICggciAhPT0gMCApe1xyXG4gICAgICAgICAgICByZXR1cm4gVC5FWElUO1xyXG4gICAgICAgICAgfVxyXG5cclxuXHJcbiAgICAgICAgfSApO1xyXG4gICAgICAgIHJldHVybiByO1xyXG4gICAgICB9O1xyXG4gICAgICAvLyBjYWxsIHRoZSBzb3J0IGZ1bmN0aW9uIGFuZCByZXR1cm4gdGhlIG5ld2x5IHNvcnRlZCBhcnJheVxyXG4gICAgICByZXR1cm4gKGFyICYmIGFyLnB1c2gpID8gYXIuc29ydCggc29ydEZ1bmMgKSA6IGFyO1xyXG5cclxuXHJcbiAgICB9O1xyXG5cclxuICAgIC8vICoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKipcclxuICAgIC8vICpcclxuICAgIC8vICogVGFrZXM6IGEgc3RyaW5nIGNvbnRhaW5pbmcgbnVtYmVycyBhbmQgbGV0dGVycyBhbmQgdHVybiBpdCBpbnRvIGFuIGFycmF5XHJcbiAgICAvLyAqIFJldHVybnM6IHJldHVybiBhbiBhcnJheSBvZiBudW1iZXJzIGFuZCBsZXR0ZXJzXHJcbiAgICAvLyAqIFB1cnBvc2U6IFVzZWQgZm9yIGxvZ2ljYWwgc29ydGluZy4gU3RyaW5nIEV4YW1wbGU6IDEyQUJDIHJlc3VsdHM6IFsxMiwnQUJDJ11cclxuICAgIC8vICoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKiogXHJcbiAgICAoZnVuY3Rpb24gKCkge1xyXG4gICAgICAvLyBjcmVhdGVzIGEgY2FjaGUgZm9yIG51bWNoYXIgY29udmVyc2lvbnNcclxuICAgICAgdmFyIGNhY2hlID0ge30sIGNhY2hjb3VudGVyID0gMDtcclxuICAgICAgLy8gY3JlYXRlcyB0aGUgbnVtY2hhcnNwbGl0IGZ1bmN0aW9uXHJcbiAgICAgIG51bWNoYXJzcGxpdCA9IGZ1bmN0aW9uICggdGhpbmcgKSB7XHJcbiAgICAgICAgLy8gaWYgb3ZlciAxMDAwIGl0ZW1zIGV4aXN0IGluIHRoZSBjYWNoZSwgY2xlYXIgaXQgYW5kIHN0YXJ0IG92ZXJcclxuICAgICAgICBpZiAoIGNhY2hjb3VudGVyID4gY21heCApe1xyXG4gICAgICAgICAgY2FjaGUgPSB7fTtcclxuICAgICAgICAgIGNhY2hjb3VudGVyID0gMDtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8vIGlmIGEgY2FjaGUgY2FuIGJlIGZvdW5kIGZvciBhIG51bWNoYXIgdGhlbiByZXR1cm4gaXRzIGFycmF5IHZhbHVlXHJcbiAgICAgICAgcmV0dXJuIGNhY2hlWydfJyArIHRoaW5nXSB8fCAoZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgLy8gb3RoZXJ3aXNlIGRvIHRoZSBjb252ZXJzaW9uXHJcbiAgICAgICAgICAvLyBtYWtlIHN1cmUgaXQgaXMgYSBzdHJpbmcgYW5kIHNldHVwIHNvIG90aGVyIHZhcmlhYmxlc1xyXG4gICAgICAgICAgdmFyIG50aGluZyA9IFN0cmluZyggdGhpbmcgKSxcclxuICAgICAgICAgICAgbmEgPSBbXSxcclxuICAgICAgICAgICAgcnYgPSAnXycsXHJcbiAgICAgICAgICAgIHJ0ID0gJycsXHJcbiAgICAgICAgICAgIHgsIHh4LCBjO1xyXG5cclxuICAgICAgICAgIC8vIGxvb3Agb3ZlciB0aGUgc3RyaW5nIGNoYXIgYnkgY2hhclxyXG4gICAgICAgICAgZm9yICggeCA9IDAsIHh4ID0gbnRoaW5nLmxlbmd0aDsgeCA8IHh4OyB4KysgKXtcclxuICAgICAgICAgICAgLy8gdGFrZSB0aGUgY2hhciBhdCBlYWNoIGxvY2F0aW9uXHJcbiAgICAgICAgICAgIGMgPSBudGhpbmcuY2hhckNvZGVBdCggeCApO1xyXG4gICAgICAgICAgICAvLyBjaGVjayB0byBzZWUgaWYgaXQgaXMgYSB2YWxpZCBudW1iZXIgY2hhciBhbmQgYXBwZW5kIGl0IHRvIHRoZSBhcnJheS5cclxuICAgICAgICAgICAgLy8gaWYgbGFzdCBjaGFyIHdhcyBhIHN0cmluZyBwdXNoIHRoZSBzdHJpbmcgdG8gdGhlIGNoYXJudW0gYXJyYXlcclxuICAgICAgICAgICAgaWYgKCAoIGMgPj0gNDggJiYgYyA8PSA1NyApIHx8IGMgPT09IDQ2ICl7XHJcbiAgICAgICAgICAgICAgaWYgKCBydCAhPT0gJ24nICl7XHJcbiAgICAgICAgICAgICAgICBydCA9ICduJztcclxuICAgICAgICAgICAgICAgIG5hLnB1c2goIHJ2LnRvTG93ZXJDYXNlKCkgKTtcclxuICAgICAgICAgICAgICAgIHJ2ID0gJyc7XHJcbiAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgIHJ2ID0gcnYgKyBudGhpbmcuY2hhckF0KCB4ICk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgICAgLy8gY2hlY2sgdG8gc2VlIGlmIGl0IGlzIGEgdmFsaWQgc3RyaW5nIGNoYXIgYW5kIGFwcGVuZCB0byBzdHJpbmdcclxuICAgICAgICAgICAgICAvLyBpZiBsYXN0IGNoYXIgd2FzIGEgbnVtYmVyIHB1c2ggdGhlIHdob2xlIG51bWJlciB0byB0aGUgY2hhcm51bSBhcnJheVxyXG4gICAgICAgICAgICAgIGlmICggcnQgIT09ICdzJyApe1xyXG4gICAgICAgICAgICAgICAgcnQgPSAncyc7XHJcbiAgICAgICAgICAgICAgICBuYS5wdXNoKCBwYXJzZUZsb2F0KCBydiApICk7XHJcbiAgICAgICAgICAgICAgICBydiA9ICcnO1xyXG4gICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICBydiA9IHJ2ICsgbnRoaW5nLmNoYXJBdCggeCApO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgICAvLyBvbmNlIGRvbmUsIHB1c2ggdGhlIGxhc3QgdmFsdWUgdG8gdGhlIGNoYXJudW0gYXJyYXkgYW5kIHJlbW92ZSB0aGUgZmlyc3QgdW5lZWRlZCBpdGVtXHJcbiAgICAgICAgICBuYS5wdXNoKCAocnQgPT09ICduJykgPyBwYXJzZUZsb2F0KCBydiApIDogcnYudG9Mb3dlckNhc2UoKSApO1xyXG4gICAgICAgICAgbmEuc2hpZnQoKTtcclxuICAgICAgICAgIC8vIGFkZCB0byBjYWNoZVxyXG4gICAgICAgICAgY2FjaGVbJ18nICsgdGhpbmddID0gbmE7XHJcbiAgICAgICAgICBjYWNoY291bnRlcisrO1xyXG4gICAgICAgICAgLy8gcmV0dXJuIGNoYXJudW0gYXJyYXlcclxuICAgICAgICAgIHJldHVybiBuYTtcclxuICAgICAgICB9KCkpO1xyXG4gICAgICB9O1xyXG4gICAgfSgpKTtcclxuXHJcbiAgICAvLyAqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqXHJcbiAgICAvLyAqXHJcbiAgICAvLyAqIFJ1bnMgYSBxdWVyeVxyXG4gICAgLy8gKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKiBcclxuXHJcblxyXG4gICAgcnVuID0gZnVuY3Rpb24gKCkge1xyXG4gICAgICB0aGlzLmNvbnRleHQoIHtcclxuICAgICAgICByZXN1bHRzIDogdGhpcy5nZXREQkkoKS5xdWVyeSggdGhpcy5jb250ZXh0KCkgKVxyXG4gICAgICB9KTtcclxuXHJcbiAgICB9O1xyXG5cclxuICAgIEFQSS5leHRlbmQoICdmaWx0ZXInLCBmdW5jdGlvbiAoKSB7XHJcbiAgICAgIC8vICoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKipcclxuICAgICAgLy8gKlxyXG4gICAgICAvLyAqIFRha2VzOiB0YWtlcyB1bmxpbWl0ZWQgZmlsdGVyIG9iamVjdHMgYXMgYXJndW1lbnRzXHJcbiAgICAgIC8vICogUmV0dXJuczogbWV0aG9kIGNvbGxlY3Rpb25cclxuICAgICAgLy8gKiBQdXJwb3NlOiBUYWtlIGZpbHRlcnMgYXMgb2JqZWN0cyBhbmQgY2FjaGUgZnVuY3Rpb25zIGZvciBsYXRlciBsb29rdXAgd2hlbiBhIHF1ZXJ5IGlzIHJ1blxyXG4gICAgICAvLyAqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqIFxyXG4gICAgICB2YXJcclxuICAgICAgICBuYyA9IFRBRkZZLm1lcmdlT2JqKCB0aGlzLmNvbnRleHQoKSwgeyBydW4gOiBudWxsIH0gKSxcclxuICAgICAgICBucSA9IFtdXHJcbiAgICAgIDtcclxuICAgICAgZWFjaCggbmMucSwgZnVuY3Rpb24gKCB2ICkge1xyXG4gICAgICAgIG5xLnB1c2goIHYgKTtcclxuICAgICAgfSk7XHJcbiAgICAgIG5jLnEgPSBucTtcclxuICAgICAgLy8gSGFkbmxlIHBhc3Npbmcgb2YgX19fSUQgb3IgYSByZWNvcmQgb24gbG9va3VwLlxyXG4gICAgICBlYWNoKCBhcmd1bWVudHMsIGZ1bmN0aW9uICggZiApIHtcclxuICAgICAgICBuYy5xLnB1c2goIHJldHVybkZpbHRlciggZiApICk7XHJcbiAgICAgICAgbmMuZmlsdGVyUmF3LnB1c2goIGYgKTtcclxuICAgICAgfSk7XHJcblxyXG4gICAgICByZXR1cm4gdGhpcy5nZXRyb290KCBuYyApO1xyXG4gICAgfSk7XHJcblxyXG4gICAgQVBJLmV4dGVuZCggJ29yZGVyJywgZnVuY3Rpb24gKCBvICkge1xyXG4gICAgICAvLyAqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqXHJcbiAgICAgIC8vICpcclxuICAgICAgLy8gKiBQdXJwb3NlOiB0YWtlcyBhIHN0cmluZyBhbmQgY3JlYXRlcyBhbiBhcnJheSBvZiBvcmRlciBpbnN0cnVjdGlvbnMgdG8gYmUgdXNlZCB3aXRoIGEgcXVlcnlcclxuICAgICAgLy8gKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKlxyXG5cclxuICAgICAgbyA9IG8uc3BsaXQoICcsJyApO1xyXG4gICAgICB2YXIgeCA9IFtdLCBuYztcclxuXHJcbiAgICAgIGVhY2goIG8sIGZ1bmN0aW9uICggciApIHtcclxuICAgICAgICB4LnB1c2goIHIucmVwbGFjZSggL15cXHMqLywgJycgKS5yZXBsYWNlKCAvXFxzKiQvLCAnJyApICk7XHJcbiAgICAgIH0pO1xyXG5cclxuICAgICAgbmMgPSBUQUZGWS5tZXJnZU9iaiggdGhpcy5jb250ZXh0KCksIHtzb3J0IDogbnVsbH0gKTtcclxuICAgICAgbmMub3JkZXIgPSB4O1xyXG5cclxuICAgICAgcmV0dXJuIHRoaXMuZ2V0cm9vdCggbmMgKTtcclxuICAgIH0pO1xyXG5cclxuICAgIEFQSS5leHRlbmQoICdsaW1pdCcsIGZ1bmN0aW9uICggbiApIHtcclxuICAgICAgLy8gKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKlxyXG4gICAgICAvLyAqXHJcbiAgICAgIC8vICogUHVycG9zZTogdGFrZXMgYSBsaW1pdCBudW1iZXIgdG8gbGltaXQgdGhlIG51bWJlciBvZiByb3dzIHJldHVybmVkIGJ5IGEgcXVlcnkuIFdpbGwgdXBkYXRlIHRoZSByZXN1bHRzXHJcbiAgICAgIC8vICogb2YgYSBxdWVyeVxyXG4gICAgICAvLyAqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqIFxyXG4gICAgICB2YXIgbmMgPSBUQUZGWS5tZXJnZU9iaiggdGhpcy5jb250ZXh0KCksIHt9KSxcclxuICAgICAgICBsaW1pdGVkcmVzdWx0c1xyXG4gICAgICAgIDtcclxuXHJcbiAgICAgIG5jLmxpbWl0ID0gbjtcclxuXHJcbiAgICAgIGlmICggbmMucnVuICYmIG5jLnNvcnQgKXtcclxuICAgICAgICBsaW1pdGVkcmVzdWx0cyA9IFtdO1xyXG4gICAgICAgIGVhY2goIG5jLnJlc3VsdHMsIGZ1bmN0aW9uICggaSwgeCApIHtcclxuICAgICAgICAgIGlmICggKHggKyAxKSA+IG4gKXtcclxuICAgICAgICAgICAgcmV0dXJuIFRBRkZZLkVYSVQ7XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgICBsaW1pdGVkcmVzdWx0cy5wdXNoKCBpICk7XHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgbmMucmVzdWx0cyA9IGxpbWl0ZWRyZXN1bHRzO1xyXG4gICAgICB9XHJcblxyXG4gICAgICByZXR1cm4gdGhpcy5nZXRyb290KCBuYyApO1xyXG4gICAgfSk7XHJcblxyXG4gICAgQVBJLmV4dGVuZCggJ3N0YXJ0JywgZnVuY3Rpb24gKCBuICkge1xyXG4gICAgICAvLyAqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqXHJcbiAgICAgIC8vICpcclxuICAgICAgLy8gKiBQdXJwb3NlOiB0YWtlcyBhIGxpbWl0IG51bWJlciB0byBsaW1pdCB0aGUgbnVtYmVyIG9mIHJvd3MgcmV0dXJuZWQgYnkgYSBxdWVyeS4gV2lsbCB1cGRhdGUgdGhlIHJlc3VsdHNcclxuICAgICAgLy8gKiBvZiBhIHF1ZXJ5XHJcbiAgICAgIC8vICoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKiogXHJcbiAgICAgIHZhciBuYyA9IFRBRkZZLm1lcmdlT2JqKCB0aGlzLmNvbnRleHQoKSwge30gKSxcclxuICAgICAgICBsaW1pdGVkcmVzdWx0c1xyXG4gICAgICAgIDtcclxuXHJcbiAgICAgIG5jLnN0YXJ0ID0gbjtcclxuXHJcbiAgICAgIGlmICggbmMucnVuICYmIG5jLnNvcnQgJiYgIW5jLmxpbWl0ICl7XHJcbiAgICAgICAgbGltaXRlZHJlc3VsdHMgPSBbXTtcclxuICAgICAgICBlYWNoKCBuYy5yZXN1bHRzLCBmdW5jdGlvbiAoIGksIHggKSB7XHJcbiAgICAgICAgICBpZiAoICh4ICsgMSkgPiBuICl7XHJcbiAgICAgICAgICAgIGxpbWl0ZWRyZXN1bHRzLnB1c2goIGkgKTtcclxuICAgICAgICAgIH1cclxuICAgICAgICB9KTtcclxuICAgICAgICBuYy5yZXN1bHRzID0gbGltaXRlZHJlc3VsdHM7XHJcbiAgICAgIH1cclxuICAgICAgZWxzZSB7XHJcbiAgICAgICAgbmMgPSBUQUZGWS5tZXJnZU9iaiggdGhpcy5jb250ZXh0KCksIHtydW4gOiBudWxsLCBzdGFydCA6IG59ICk7XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIHJldHVybiB0aGlzLmdldHJvb3QoIG5jICk7XHJcbiAgICB9KTtcclxuXHJcbiAgICBBUEkuZXh0ZW5kKCAndXBkYXRlJywgZnVuY3Rpb24gKCBhcmcwLCBhcmcxLCBhcmcyICkge1xyXG4gICAgICAvLyAqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqXHJcbiAgICAgIC8vICpcclxuICAgICAgLy8gKiBUYWtlczogYSBvYmplY3QgYW5kIHBhc3NlcyBpdCBvZmYgREJJIHVwZGF0ZSBtZXRob2QgZm9yIGFsbCBtYXRjaGVkIHJlY29yZHNcclxuICAgICAgLy8gKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKiBcclxuICAgICAgdmFyIHJ1bkV2ZW50ID0gdHJ1ZSwgbyA9IHt9LCBhcmdzID0gYXJndW1lbnRzLCB0aGF0O1xyXG4gICAgICBpZiAoIFRBRkZZLmlzU3RyaW5nKCBhcmcwICkgJiZcclxuICAgICAgICAoYXJndW1lbnRzLmxlbmd0aCA9PT0gMiB8fCBhcmd1bWVudHMubGVuZ3RoID09PSAzKSApXHJcbiAgICAgIHtcclxuICAgICAgICBvW2FyZzBdID0gYXJnMTtcclxuICAgICAgICBpZiAoIGFyZ3VtZW50cy5sZW5ndGggPT09IDMgKXtcclxuICAgICAgICAgIHJ1bkV2ZW50ID0gYXJnMjtcclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuICAgICAgZWxzZSB7XHJcbiAgICAgICAgbyA9IGFyZzA7XHJcbiAgICAgICAgaWYgKCBhcmdzLmxlbmd0aCA9PT0gMiApe1xyXG4gICAgICAgICAgcnVuRXZlbnQgPSBhcmcxO1xyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG5cclxuICAgICAgdGhhdCA9IHRoaXM7XHJcbiAgICAgIHJ1bi5jYWxsKCB0aGlzICk7XHJcbiAgICAgIGVhY2goIHRoaXMuY29udGV4dCgpLnJlc3VsdHMsIGZ1bmN0aW9uICggciApIHtcclxuICAgICAgICB2YXIgYyA9IG87XHJcbiAgICAgICAgaWYgKCBUQUZGWS5pc0Z1bmN0aW9uKCBjICkgKXtcclxuICAgICAgICAgIGMgPSBjLmFwcGx5KCBUQUZGWS5tZXJnZU9iaiggciwge30gKSApO1xyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNlIHtcclxuICAgICAgICAgIGlmICggVC5pc0Z1bmN0aW9uKCBjICkgKXtcclxuICAgICAgICAgICAgYyA9IGMoIFRBRkZZLm1lcmdlT2JqKCByLCB7fSApICk7XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmICggVEFGRlkuaXNPYmplY3QoIGMgKSApe1xyXG4gICAgICAgICAgdGhhdC5nZXREQkkoKS51cGRhdGUoIHIuX19faWQsIGMsIHJ1bkV2ZW50ICk7XHJcbiAgICAgICAgfVxyXG4gICAgICB9KTtcclxuICAgICAgaWYgKCB0aGlzLmNvbnRleHQoKS5yZXN1bHRzLmxlbmd0aCApe1xyXG4gICAgICAgIHRoaXMuY29udGV4dCggeyBydW4gOiBudWxsIH0pO1xyXG4gICAgICB9XHJcbiAgICAgIHJldHVybiB0aGlzO1xyXG4gICAgfSk7XHJcbiAgICBBUEkuZXh0ZW5kKCAncmVtb3ZlJywgZnVuY3Rpb24gKCBydW5FdmVudCApIHtcclxuICAgICAgLy8gKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKlxyXG4gICAgICAvLyAqXHJcbiAgICAgIC8vICogUHVycG9zZTogcmVtb3ZlcyByZWNvcmRzIGZyb20gdGhlIERCIHZpYSB0aGUgcmVtb3ZlIGFuZCByZW1vdmVDb21taXQgREJJIG1ldGhvZHNcclxuICAgICAgLy8gKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKiBcclxuICAgICAgdmFyIHRoYXQgPSB0aGlzLCBjID0gMDtcclxuICAgICAgcnVuLmNhbGwoIHRoaXMgKTtcclxuICAgICAgZWFjaCggdGhpcy5jb250ZXh0KCkucmVzdWx0cywgZnVuY3Rpb24gKCByICkge1xyXG4gICAgICAgIHRoYXQuZ2V0REJJKCkucmVtb3ZlKCByLl9fX2lkICk7XHJcbiAgICAgICAgYysrO1xyXG4gICAgICB9KTtcclxuICAgICAgaWYgKCB0aGlzLmNvbnRleHQoKS5yZXN1bHRzLmxlbmd0aCApe1xyXG4gICAgICAgIHRoaXMuY29udGV4dCgge1xyXG4gICAgICAgICAgcnVuIDogbnVsbFxyXG4gICAgICAgIH0pO1xyXG4gICAgICAgIHRoYXQuZ2V0REJJKCkucmVtb3ZlQ29tbWl0KCBydW5FdmVudCApO1xyXG4gICAgICB9XHJcblxyXG4gICAgICByZXR1cm4gYztcclxuICAgIH0pO1xyXG5cclxuXHJcbiAgICBBUEkuZXh0ZW5kKCAnY291bnQnLCBmdW5jdGlvbiAoKSB7XHJcbiAgICAgIC8vICoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKipcclxuICAgICAgLy8gKlxyXG4gICAgICAvLyAqIFJldHVybnM6IFRoZSBsZW5ndGggb2YgYSBxdWVyeSByZXN1bHRcclxuICAgICAgLy8gKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKiBcclxuICAgICAgcnVuLmNhbGwoIHRoaXMgKTtcclxuICAgICAgcmV0dXJuIHRoaXMuY29udGV4dCgpLnJlc3VsdHMubGVuZ3RoO1xyXG4gICAgfSk7XHJcblxyXG4gICAgQVBJLmV4dGVuZCggJ2NhbGxiYWNrJywgZnVuY3Rpb24gKCBmLCBkZWxheSApIHtcclxuICAgICAgLy8gKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKlxyXG4gICAgICAvLyAqXHJcbiAgICAgIC8vICogUmV0dXJucyBudWxsO1xyXG4gICAgICAvLyAqIFJ1bnMgYSBmdW5jdGlvbiBvbiByZXR1cm4gb2YgcnVuLmNhbGxcclxuICAgICAgLy8gKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKiBcclxuICAgICAgaWYgKCBmICl7XHJcbiAgICAgICAgdmFyIHRoYXQgPSB0aGlzO1xyXG4gICAgICAgIHNldFRpbWVvdXQoIGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgIHJ1bi5jYWxsKCB0aGF0ICk7XHJcbiAgICAgICAgICBmLmNhbGwoIHRoYXQuZ2V0cm9vdCggdGhhdC5jb250ZXh0KCkgKSApO1xyXG4gICAgICAgIH0sIGRlbGF5IHx8IDAgKTtcclxuICAgICAgfVxyXG5cclxuXHJcbiAgICAgIHJldHVybiBudWxsO1xyXG4gICAgfSk7XHJcblxyXG4gICAgQVBJLmV4dGVuZCggJ2dldCcsIGZ1bmN0aW9uICgpIHtcclxuICAgICAgLy8gKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKlxyXG4gICAgICAvLyAqXHJcbiAgICAgIC8vICogUmV0dXJuczogQW4gYXJyYXkgb2YgYWxsIG1hdGNoaW5nIHJlY29yZHNcclxuICAgICAgLy8gKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKiBcclxuICAgICAgcnVuLmNhbGwoIHRoaXMgKTtcclxuICAgICAgcmV0dXJuIHRoaXMuY29udGV4dCgpLnJlc3VsdHM7XHJcbiAgICB9KTtcclxuXHJcbiAgICBBUEkuZXh0ZW5kKCAnc3RyaW5naWZ5JywgZnVuY3Rpb24gKCkge1xyXG4gICAgICAvLyAqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqXHJcbiAgICAgIC8vICpcclxuICAgICAgLy8gKiBSZXR1cm5zOiBBbiBKU09OIHN0cmluZyBvZiBhbGwgbWF0Y2hpbmcgcmVjb3Jkc1xyXG4gICAgICAvLyAqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqIFxyXG4gICAgICByZXR1cm4gSlNPTi5zdHJpbmdpZnkoIHRoaXMuZ2V0KCkgKTtcclxuICAgIH0pO1xyXG4gICAgQVBJLmV4dGVuZCggJ2ZpcnN0JywgZnVuY3Rpb24gKCkge1xyXG4gICAgICAvLyAqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqXHJcbiAgICAgIC8vICpcclxuICAgICAgLy8gKiBSZXR1cm5zOiBUaGUgZmlyc3QgbWF0Y2hpbmcgcmVjb3JkXHJcbiAgICAgIC8vICoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKiogXHJcbiAgICAgIHJ1bi5jYWxsKCB0aGlzICk7XHJcbiAgICAgIHJldHVybiB0aGlzLmNvbnRleHQoKS5yZXN1bHRzWzBdIHx8IGZhbHNlO1xyXG4gICAgfSk7XHJcbiAgICBBUEkuZXh0ZW5kKCAnbGFzdCcsIGZ1bmN0aW9uICgpIHtcclxuICAgICAgLy8gKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKlxyXG4gICAgICAvLyAqXHJcbiAgICAgIC8vICogUmV0dXJuczogVGhlIGxhc3QgbWF0Y2hpbmcgcmVjb3JkXHJcbiAgICAgIC8vICoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKiogXHJcbiAgICAgIHJ1bi5jYWxsKCB0aGlzICk7XHJcbiAgICAgIHJldHVybiB0aGlzLmNvbnRleHQoKS5yZXN1bHRzW3RoaXMuY29udGV4dCgpLnJlc3VsdHMubGVuZ3RoIC0gMV0gfHxcclxuICAgICAgICBmYWxzZTtcclxuICAgIH0pO1xyXG5cclxuXHJcbiAgICBBUEkuZXh0ZW5kKCAnc3VtJywgZnVuY3Rpb24gKCkge1xyXG4gICAgICAvLyAqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqXHJcbiAgICAgIC8vICpcclxuICAgICAgLy8gKiBUYWtlczogY29sdW1uIHRvIHN1bSB1cFxyXG4gICAgICAvLyAqIFJldHVybnM6IFN1bXMgdGhlIHZhbHVlcyBvZiBhIGNvbHVtblxyXG4gICAgICAvLyAqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqIFxyXG4gICAgICB2YXIgdG90YWwgPSAwLCB0aGF0ID0gdGhpcztcclxuICAgICAgcnVuLmNhbGwoIHRoYXQgKTtcclxuICAgICAgZWFjaCggYXJndW1lbnRzLCBmdW5jdGlvbiAoIGMgKSB7XHJcbiAgICAgICAgZWFjaCggdGhhdC5jb250ZXh0KCkucmVzdWx0cywgZnVuY3Rpb24gKCByICkge1xyXG4gICAgICAgICAgdG90YWwgPSB0b3RhbCArIChyW2NdIHx8IDApO1xyXG4gICAgICAgIH0pO1xyXG4gICAgICB9KTtcclxuICAgICAgcmV0dXJuIHRvdGFsO1xyXG4gICAgfSk7XHJcblxyXG4gICAgQVBJLmV4dGVuZCggJ21pbicsIGZ1bmN0aW9uICggYyApIHtcclxuICAgICAgLy8gKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKlxyXG4gICAgICAvLyAqXHJcbiAgICAgIC8vICogVGFrZXM6IGNvbHVtbiB0byBmaW5kIG1pblxyXG4gICAgICAvLyAqIFJldHVybnM6IHRoZSBsb3dlc3QgdmFsdWVcclxuICAgICAgLy8gKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKiBcclxuICAgICAgdmFyIGxvd2VzdCA9IG51bGw7XHJcbiAgICAgIHJ1bi5jYWxsKCB0aGlzICk7XHJcbiAgICAgIGVhY2goIHRoaXMuY29udGV4dCgpLnJlc3VsdHMsIGZ1bmN0aW9uICggciApIHtcclxuICAgICAgICBpZiAoIGxvd2VzdCA9PT0gbnVsbCB8fCByW2NdIDwgbG93ZXN0ICl7XHJcbiAgICAgICAgICBsb3dlc3QgPSByW2NdO1xyXG4gICAgICAgIH1cclxuICAgICAgfSk7XHJcbiAgICAgIHJldHVybiBsb3dlc3Q7XHJcbiAgICB9KTtcclxuXHJcbiAgICAvLyAgVGFmZnkgaW5uZXJKb2luIEV4dGVuc2lvbiAoT0NEIGVkaXRpb24pXHJcbiAgICAvLyAgPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XHJcbiAgICAvL1xyXG4gICAgLy8gIEhvdyB0byBVc2VcclxuICAgIC8vICAqKioqKioqKioqXHJcbiAgICAvL1xyXG4gICAgLy8gIGxlZnRfdGFibGUuaW5uZXJKb2luKCByaWdodF90YWJsZSwgY29uZGl0aW9uMSA8LC4uLiBjb25kaXRpb25OPiApXHJcbiAgICAvL1xyXG4gICAgLy8gIEEgY29uZGl0aW9uIGNhbiB0YWtlIG9uZSBvZiAyIGZvcm1zOlxyXG4gICAgLy9cclxuICAgIC8vICAgIDEuIEFuIEFSUkFZIHdpdGggMiBvciAzIHZhbHVlczpcclxuICAgIC8vICAgIEEgY29sdW1uIG5hbWUgZnJvbSB0aGUgbGVmdCB0YWJsZSwgYW4gb3B0aW9uYWwgY29tcGFyaXNvbiBzdHJpbmcsXHJcbiAgICAvLyAgICBhbmQgY29sdW1uIG5hbWUgZnJvbSB0aGUgcmlnaHQgdGFibGUuICBUaGUgY29uZGl0aW9uIHBhc3NlcyBpZiB0aGUgdGVzdFxyXG4gICAgLy8gICAgaW5kaWNhdGVkIGlzIHRydWUuICAgSWYgdGhlIGNvbmRpdGlvbiBzdHJpbmcgaXMgb21pdHRlZCwgJz09PScgaXMgYXNzdW1lZC5cclxuICAgIC8vICAgIEVYQU1QTEVTOiBbICdsYXN0X3VzZWRfdGltZScsICc+PScsICdjdXJyZW50X3VzZV90aW1lJyBdLCBbICd1c2VyX2lkJywnaWQnIF1cclxuICAgIC8vXHJcbiAgICAvLyAgICAyLiBBIEZVTkNUSU9OOlxyXG4gICAgLy8gICAgVGhlIGZ1bmN0aW9uIHJlY2VpdmVzIGEgbGVmdCB0YWJsZSByb3cgYW5kIHJpZ2h0IHRhYmxlIHJvdyBkdXJpbmcgdGhlXHJcbiAgICAvLyAgICBjYXJ0ZXNpYW4gam9pbi4gIElmIHRoZSBmdW5jdGlvbiByZXR1cm5zIHRydWUgZm9yIHRoZSByb3dzIGNvbnNpZGVyZWQsXHJcbiAgICAvLyAgICB0aGUgbWVyZ2VkIHJvdyBpcyBpbmNsdWRlZCBpbiB0aGUgcmVzdWx0IHNldC5cclxuICAgIC8vICAgIEVYQU1QTEU6IGZ1bmN0aW9uIChsLHIpeyByZXR1cm4gbC5uYW1lID09PSByLmxhYmVsOyB9XHJcbiAgICAvL1xyXG4gICAgLy8gIENvbmRpdGlvbnMgYXJlIGNvbnNpZGVyZWQgaW4gdGhlIG9yZGVyIHRoZXkgYXJlIHByZXNlbnRlZC4gIFRoZXJlZm9yZSB0aGUgYmVzdFxyXG4gICAgLy8gIHBlcmZvcm1hbmNlIGlzIHJlYWxpemVkIHdoZW4gdGhlIGxlYXN0IGV4cGVuc2l2ZSBhbmQgaGlnaGVzdCBwcnVuZS1yYXRlXHJcbiAgICAvLyAgY29uZGl0aW9ucyBhcmUgcGxhY2VkIGZpcnN0LCBzaW5jZSBpZiB0aGV5IHJldHVybiBmYWxzZSBUYWZmeSBza2lwcyBhbnlcclxuICAgIC8vICBmdXJ0aGVyIGNvbmRpdGlvbiB0ZXN0cy5cclxuICAgIC8vXHJcbiAgICAvLyAgT3RoZXIgbm90ZXNcclxuICAgIC8vICAqKioqKioqKioqKlxyXG4gICAgLy9cclxuICAgIC8vICBUaGlzIGNvZGUgcGFzc2VzIGpzbGludCB3aXRoIHRoZSBleGNlcHRpb24gb2YgMiB3YXJuaW5ncyBhYm91dFxyXG4gICAgLy8gIHRoZSAnPT0nIGFuZCAnIT0nIGxpbmVzLiAgV2UgY2FuJ3QgZG8gYW55dGhpbmcgYWJvdXQgdGhhdCBzaG9ydCBvZlxyXG4gICAgLy8gIGRlbGV0aW5nIHRoZSBsaW5lcy5cclxuICAgIC8vXHJcbiAgICAvLyAgQ3JlZGl0c1xyXG4gICAgLy8gICoqKioqKipcclxuICAgIC8vXHJcbiAgICAvLyAgSGVhdmlseSBiYXNlZCB1cG9uIHRoZSB3b3JrIG9mIElhbiBUb2x0ei5cclxuICAgIC8vICBSZXZpc2lvbnMgdG8gQVBJIGJ5IE1pY2hhZWwgTWlrb3dza2kuXHJcbiAgICAvLyAgQ29kZSBjb252ZW50aW9uIHBlciBzdGFuZGFyZHMgaW4gaHR0cDovL21hbm5pbmcuY29tL21pa293c2tpXHJcbiAgICAoZnVuY3Rpb24gKCkge1xyXG4gICAgICB2YXIgaW5uZXJKb2luRnVuY3Rpb24gPSAoZnVuY3Rpb24gKCkge1xyXG4gICAgICAgIHZhciBmbkNvbXBhcmVMaXN0LCBmbkNvbWJpbmVSb3csIGZuTWFpbjtcclxuXHJcbiAgICAgICAgZm5Db21wYXJlTGlzdCA9IGZ1bmN0aW9uICggbGVmdF9yb3csIHJpZ2h0X3JvdywgYXJnX2xpc3QgKSB7XHJcbiAgICAgICAgICB2YXIgZGF0YV9sdCwgZGF0YV9ydCwgb3BfY29kZSwgZXJyb3I7XHJcblxyXG4gICAgICAgICAgaWYgKCBhcmdfbGlzdC5sZW5ndGggPT09IDIgKXtcclxuICAgICAgICAgICAgZGF0YV9sdCA9IGxlZnRfcm93W2FyZ19saXN0WzBdXTtcclxuICAgICAgICAgICAgb3BfY29kZSA9ICc9PT0nO1xyXG4gICAgICAgICAgICBkYXRhX3J0ID0gcmlnaHRfcm93W2FyZ19saXN0WzFdXTtcclxuICAgICAgICAgIH1cclxuICAgICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICBkYXRhX2x0ID0gbGVmdF9yb3dbYXJnX2xpc3RbMF1dO1xyXG4gICAgICAgICAgICBvcF9jb2RlID0gYXJnX2xpc3RbMV07XHJcbiAgICAgICAgICAgIGRhdGFfcnQgPSByaWdodF9yb3dbYXJnX2xpc3RbMl1dO1xyXG4gICAgICAgICAgfVxyXG5cclxuICAgICAgICAgIC8qanNsaW50IGVxZXEgOiB0cnVlICovXHJcbiAgICAgICAgICBzd2l0Y2ggKCBvcF9jb2RlICl7XHJcbiAgICAgICAgICAgIGNhc2UgJz09PScgOlxyXG4gICAgICAgICAgICAgIHJldHVybiBkYXRhX2x0ID09PSBkYXRhX3J0O1xyXG4gICAgICAgICAgICBjYXNlICchPT0nIDpcclxuICAgICAgICAgICAgICByZXR1cm4gZGF0YV9sdCAhPT0gZGF0YV9ydDtcclxuICAgICAgICAgICAgY2FzZSAnPCcgICA6XHJcbiAgICAgICAgICAgICAgcmV0dXJuIGRhdGFfbHQgPCBkYXRhX3J0O1xyXG4gICAgICAgICAgICBjYXNlICc+JyAgIDpcclxuICAgICAgICAgICAgICByZXR1cm4gZGF0YV9sdCA+IGRhdGFfcnQ7XHJcbiAgICAgICAgICAgIGNhc2UgJzw9JyAgOlxyXG4gICAgICAgICAgICAgIHJldHVybiBkYXRhX2x0IDw9IGRhdGFfcnQ7XHJcbiAgICAgICAgICAgIGNhc2UgJz49JyAgOlxyXG4gICAgICAgICAgICAgIHJldHVybiBkYXRhX2x0ID49IGRhdGFfcnQ7XHJcbiAgICAgICAgICAgIGNhc2UgJz09JyAgOlxyXG4gICAgICAgICAgICAgIHJldHVybiBkYXRhX2x0ID09IGRhdGFfcnQ7XHJcbiAgICAgICAgICAgIGNhc2UgJyE9JyAgOlxyXG4gICAgICAgICAgICAgIHJldHVybiBkYXRhX2x0ICE9IGRhdGFfcnQ7XHJcbiAgICAgICAgICAgIGRlZmF1bHQgOlxyXG4gICAgICAgICAgICAgIHRocm93IFN0cmluZyggb3BfY29kZSApICsgJyBpcyBub3Qgc3VwcG9ydGVkJztcclxuICAgICAgICAgIH1cclxuICAgICAgICAgIC8vICdqc2xpbnQgZXFlcSA6IGZhbHNlJyAgaGVyZSByZXN1bHRzIGluXHJcbiAgICAgICAgICAvLyBcIlVucmVhY2hhYmxlICcvKmpzbGludCcgYWZ0ZXIgJ3JldHVybidcIi5cclxuICAgICAgICAgIC8vIFdlIGRvbid0IG5lZWQgaXQgdGhvdWdoLCBhcyB0aGUgcnVsZSBleGNlcHRpb25cclxuICAgICAgICAgIC8vIGlzIGRpc2NhcmRlZCBhdCB0aGUgZW5kIG9mIHRoaXMgZnVuY3Rpb25hbCBzY29wZVxyXG4gICAgICAgIH07XHJcblxyXG4gICAgICAgIGZuQ29tYmluZVJvdyA9IGZ1bmN0aW9uICggbGVmdF9yb3csIHJpZ2h0X3JvdyApIHtcclxuICAgICAgICAgIHZhciBvdXRfbWFwID0ge30sIGksIHByZWZpeDtcclxuXHJcbiAgICAgICAgICBmb3IgKCBpIGluIGxlZnRfcm93ICl7XHJcbiAgICAgICAgICAgIGlmICggbGVmdF9yb3cuaGFzT3duUHJvcGVydHkoIGkgKSApe1xyXG4gICAgICAgICAgICAgIG91dF9tYXBbaV0gPSBsZWZ0X3Jvd1tpXTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgfVxyXG4gICAgICAgICAgZm9yICggaSBpbiByaWdodF9yb3cgKXtcclxuICAgICAgICAgICAgaWYgKCByaWdodF9yb3cuaGFzT3duUHJvcGVydHkoIGkgKSAmJiBpICE9PSAnX19faWQnICYmXHJcbiAgICAgICAgICAgICAgaSAhPT0gJ19fX3MnIClcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgIHByZWZpeCA9ICFUQUZGWS5pc1VuZGVmaW5lZCggb3V0X21hcFtpXSApID8gJ3JpZ2h0XycgOiAnJztcclxuICAgICAgICAgICAgICBvdXRfbWFwW3ByZWZpeCArIFN0cmluZyggaSApIF0gPSByaWdodF9yb3dbaV07XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgIH1cclxuICAgICAgICAgIHJldHVybiBvdXRfbWFwO1xyXG4gICAgICAgIH07XHJcblxyXG4gICAgICAgIGZuTWFpbiA9IGZ1bmN0aW9uICggdGFibGUgKSB7XHJcbiAgICAgICAgICB2YXJcclxuICAgICAgICAgICAgcmlnaHRfdGFibGUsIGksXHJcbiAgICAgICAgICAgIGFyZ19saXN0ID0gYXJndW1lbnRzLFxyXG4gICAgICAgICAgICBhcmdfbGVuZ3RoID0gYXJnX2xpc3QubGVuZ3RoLFxyXG4gICAgICAgICAgICByZXN1bHRfbGlzdCA9IFtdXHJcbiAgICAgICAgICAgIDtcclxuXHJcbiAgICAgICAgICBpZiAoIHR5cGVvZiB0YWJsZS5maWx0ZXIgIT09ICdmdW5jdGlvbicgKXtcclxuICAgICAgICAgICAgaWYgKCB0YWJsZS5UQUZGWSApeyByaWdodF90YWJsZSA9IHRhYmxlKCk7IH1cclxuICAgICAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgICAgdGhyb3cgJ1RBRkZZIERCIG9yIHJlc3VsdCBub3Qgc3VwcGxpZWQnO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgICBlbHNlIHsgcmlnaHRfdGFibGUgPSB0YWJsZTsgfVxyXG5cclxuICAgICAgICAgIHRoaXMuY29udGV4dCgge1xyXG4gICAgICAgICAgICByZXN1bHRzIDogdGhpcy5nZXREQkkoKS5xdWVyeSggdGhpcy5jb250ZXh0KCkgKVxyXG4gICAgICAgICAgfSApO1xyXG5cclxuICAgICAgICAgIFRBRkZZLmVhY2goIHRoaXMuY29udGV4dCgpLnJlc3VsdHMsIGZ1bmN0aW9uICggbGVmdF9yb3cgKSB7XHJcbiAgICAgICAgICAgIHJpZ2h0X3RhYmxlLmVhY2goIGZ1bmN0aW9uICggcmlnaHRfcm93ICkge1xyXG4gICAgICAgICAgICAgIHZhciBhcmdfZGF0YSwgaXNfb2sgPSB0cnVlO1xyXG4gICAgICAgICAgICAgIENPTkRJVElPTjpcclxuICAgICAgICAgICAgICAgIGZvciAoIGkgPSAxOyBpIDwgYXJnX2xlbmd0aDsgaSsrICl7XHJcbiAgICAgICAgICAgICAgICAgIGFyZ19kYXRhID0gYXJnX2xpc3RbaV07XHJcbiAgICAgICAgICAgICAgICAgIGlmICggdHlwZW9mIGFyZ19kYXRhID09PSAnZnVuY3Rpb24nICl7XHJcbiAgICAgICAgICAgICAgICAgICAgaXNfb2sgPSBhcmdfZGF0YSggbGVmdF9yb3csIHJpZ2h0X3JvdyApO1xyXG4gICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgIGVsc2UgaWYgKCB0eXBlb2YgYXJnX2RhdGEgPT09ICdvYmplY3QnICYmIGFyZ19kYXRhLmxlbmd0aCApe1xyXG4gICAgICAgICAgICAgICAgICAgIGlzX29rID0gZm5Db21wYXJlTGlzdCggbGVmdF9yb3csIHJpZ2h0X3JvdywgYXJnX2RhdGEgKTtcclxuICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICBpc19vayA9IGZhbHNlO1xyXG4gICAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgICBpZiAoICFpc19vayApeyBicmVhayBDT05ESVRJT047IH0gLy8gc2hvcnQgY2lyY3VpdFxyXG4gICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICBpZiAoIGlzX29rICl7XHJcbiAgICAgICAgICAgICAgICByZXN1bHRfbGlzdC5wdXNoKCBmbkNvbWJpbmVSb3coIGxlZnRfcm93LCByaWdodF9yb3cgKSApO1xyXG4gICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfSApO1xyXG4gICAgICAgICAgfSApO1xyXG4gICAgICAgICAgcmV0dXJuIFRBRkZZKCByZXN1bHRfbGlzdCApKCk7XHJcbiAgICAgICAgfTtcclxuXHJcbiAgICAgICAgcmV0dXJuIGZuTWFpbjtcclxuICAgICAgfSgpKTtcclxuXHJcbiAgICAgIEFQSS5leHRlbmQoICdqb2luJywgaW5uZXJKb2luRnVuY3Rpb24gKTtcclxuICAgIH0oKSk7XHJcblxyXG4gICAgQVBJLmV4dGVuZCggJ21heCcsIGZ1bmN0aW9uICggYyApIHtcclxuICAgICAgLy8gKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKlxyXG4gICAgICAvLyAqXHJcbiAgICAgIC8vICogVGFrZXM6IGNvbHVtbiB0byBmaW5kIG1heFxyXG4gICAgICAvLyAqIFJldHVybnM6IHRoZSBoaWdoZXN0IHZhbHVlXHJcbiAgICAgIC8vICoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKipcclxuICAgICAgdmFyIGhpZ2hlc3QgPSBudWxsO1xyXG4gICAgICBydW4uY2FsbCggdGhpcyApO1xyXG4gICAgICBlYWNoKCB0aGlzLmNvbnRleHQoKS5yZXN1bHRzLCBmdW5jdGlvbiAoIHIgKSB7XHJcbiAgICAgICAgaWYgKCBoaWdoZXN0ID09PSBudWxsIHx8IHJbY10gPiBoaWdoZXN0ICl7XHJcbiAgICAgICAgICBoaWdoZXN0ID0gcltjXTtcclxuICAgICAgICB9XHJcbiAgICAgIH0pO1xyXG4gICAgICByZXR1cm4gaGlnaGVzdDtcclxuICAgIH0pO1xyXG5cclxuICAgIEFQSS5leHRlbmQoICdzZWxlY3QnLCBmdW5jdGlvbiAoKSB7XHJcbiAgICAgIC8vICoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKipcclxuICAgICAgLy8gKlxyXG4gICAgICAvLyAqIFRha2VzOiBjb2x1bW5zIHRvIHNlbGVjdCB2YWx1ZXMgaW50byBhbiBhcnJheVxyXG4gICAgICAvLyAqIFJldHVybnM6IGFycmF5IG9mIHZhbHVlc1xyXG4gICAgICAvLyAqIE5vdGUgaWYgbW9yZSB0aGFuIG9uZSBjb2x1bW4gaXMgZ2l2ZW4gYW4gYXJyYXkgb2YgYXJyYXlzIGlzIHJldHVybmVkXHJcbiAgICAgIC8vICoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKiogXHJcblxyXG4gICAgICB2YXIgcmEgPSBbXSwgYXJncyA9IGFyZ3VtZW50cztcclxuICAgICAgcnVuLmNhbGwoIHRoaXMgKTtcclxuICAgICAgaWYgKCBhcmd1bWVudHMubGVuZ3RoID09PSAxICl7XHJcblxyXG4gICAgICAgIGVhY2goIHRoaXMuY29udGV4dCgpLnJlc3VsdHMsIGZ1bmN0aW9uICggciApIHtcclxuXHJcbiAgICAgICAgICByYS5wdXNoKCByW2FyZ3NbMF1dICk7XHJcbiAgICAgICAgfSk7XHJcbiAgICAgIH1cclxuICAgICAgZWxzZSB7XHJcbiAgICAgICAgZWFjaCggdGhpcy5jb250ZXh0KCkucmVzdWx0cywgZnVuY3Rpb24gKCByICkge1xyXG4gICAgICAgICAgdmFyIHJvdyA9IFtdO1xyXG4gICAgICAgICAgZWFjaCggYXJncywgZnVuY3Rpb24gKCBjICkge1xyXG4gICAgICAgICAgICByb3cucHVzaCggcltjXSApO1xyXG4gICAgICAgICAgfSk7XHJcbiAgICAgICAgICByYS5wdXNoKCByb3cgKTtcclxuICAgICAgICB9KTtcclxuICAgICAgfVxyXG4gICAgICByZXR1cm4gcmE7XHJcbiAgICB9KTtcclxuICAgIEFQSS5leHRlbmQoICdkaXN0aW5jdCcsIGZ1bmN0aW9uICgpIHtcclxuICAgICAgLy8gKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKlxyXG4gICAgICAvLyAqXHJcbiAgICAgIC8vICogVGFrZXM6IGNvbHVtbnMgdG8gc2VsZWN0IHVuaXF1ZSBhbHVlcyBpbnRvIGFuIGFycmF5XHJcbiAgICAgIC8vICogUmV0dXJuczogYXJyYXkgb2YgdmFsdWVzXHJcbiAgICAgIC8vICogTm90ZSBpZiBtb3JlIHRoYW4gb25lIGNvbHVtbiBpcyBnaXZlbiBhbiBhcnJheSBvZiBhcnJheXMgaXMgcmV0dXJuZWRcclxuICAgICAgLy8gKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKiBcclxuICAgICAgdmFyIHJhID0gW10sIGFyZ3MgPSBhcmd1bWVudHM7XHJcbiAgICAgIHJ1bi5jYWxsKCB0aGlzICk7XHJcbiAgICAgIGlmICggYXJndW1lbnRzLmxlbmd0aCA9PT0gMSApe1xyXG5cclxuICAgICAgICBlYWNoKCB0aGlzLmNvbnRleHQoKS5yZXN1bHRzLCBmdW5jdGlvbiAoIHIgKSB7XHJcbiAgICAgICAgICB2YXIgdiA9IHJbYXJnc1swXV0sIGR1cCA9IGZhbHNlO1xyXG4gICAgICAgICAgZWFjaCggcmEsIGZ1bmN0aW9uICggZCApIHtcclxuICAgICAgICAgICAgaWYgKCB2ID09PSBkICl7XHJcbiAgICAgICAgICAgICAgZHVwID0gdHJ1ZTtcclxuICAgICAgICAgICAgICByZXR1cm4gVEFGRlkuRVhJVDtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgfSk7XHJcbiAgICAgICAgICBpZiAoICFkdXAgKXtcclxuICAgICAgICAgICAgcmEucHVzaCggdiApO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgIH0pO1xyXG4gICAgICB9XHJcbiAgICAgIGVsc2Uge1xyXG4gICAgICAgIGVhY2goIHRoaXMuY29udGV4dCgpLnJlc3VsdHMsIGZ1bmN0aW9uICggciApIHtcclxuICAgICAgICAgIHZhciByb3cgPSBbXSwgZHVwID0gZmFsc2U7XHJcbiAgICAgICAgICBlYWNoKCBhcmdzLCBmdW5jdGlvbiAoIGMgKSB7XHJcbiAgICAgICAgICAgIHJvdy5wdXNoKCByW2NdICk7XHJcbiAgICAgICAgICB9KTtcclxuICAgICAgICAgIGVhY2goIHJhLCBmdW5jdGlvbiAoIGQgKSB7XHJcbiAgICAgICAgICAgIHZhciBsZHVwID0gdHJ1ZTtcclxuICAgICAgICAgICAgZWFjaCggYXJncywgZnVuY3Rpb24gKCBjLCBpICkge1xyXG4gICAgICAgICAgICAgIGlmICggcm93W2ldICE9PSBkW2ldICl7XHJcbiAgICAgICAgICAgICAgICBsZHVwID0gZmFsc2U7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gVEFGRlkuRVhJVDtcclxuICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICBpZiAoIGxkdXAgKXtcclxuICAgICAgICAgICAgICBkdXAgPSB0cnVlO1xyXG4gICAgICAgICAgICAgIHJldHVybiBUQUZGWS5FWElUO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICB9KTtcclxuICAgICAgICAgIGlmICggIWR1cCApe1xyXG4gICAgICAgICAgICByYS5wdXNoKCByb3cgKTtcclxuICAgICAgICAgIH1cclxuICAgICAgICB9KTtcclxuICAgICAgfVxyXG4gICAgICByZXR1cm4gcmE7XHJcbiAgICB9KTtcclxuICAgIEFQSS5leHRlbmQoICdzdXBwbGFudCcsIGZ1bmN0aW9uICggdGVtcGxhdGUsIHJldHVybmFycmF5ICkge1xyXG4gICAgICAvLyAqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqXHJcbiAgICAgIC8vICpcclxuICAgICAgLy8gKiBUYWtlczogYSBzdHJpbmcgdGVtcGxhdGUgZm9ybWF0ZWQgd2l0aCBrZXkgdG8gYmUgcmVwbGFjZWQgd2l0aCB2YWx1ZXMgZnJvbSB0aGUgcm93cywgZmxhZyB0byBkZXRlcm1pbmUgaWYgd2Ugd2FudCBhcnJheSBvZiBzdHJpbmdzXHJcbiAgICAgIC8vICogUmV0dXJuczogYXJyYXkgb2YgdmFsdWVzIG9yIGEgc3RyaW5nXHJcbiAgICAgIC8vICoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKiogXHJcbiAgICAgIHZhciByYSA9IFtdO1xyXG4gICAgICBydW4uY2FsbCggdGhpcyApO1xyXG4gICAgICBlYWNoKCB0aGlzLmNvbnRleHQoKS5yZXN1bHRzLCBmdW5jdGlvbiAoIHIgKSB7XHJcbiAgICAgICAgLy8gVE9ETzogVGhlIGN1cmx5IGJyYWNlcyB1c2VkIHRvIGJlIHVuZXNjYXBlZFxyXG4gICAgICAgIHJhLnB1c2goIHRlbXBsYXRlLnJlcGxhY2UoIC9cXHsoW15cXHtcXH1dKilcXH0vZywgZnVuY3Rpb24gKCBhLCBiICkge1xyXG4gICAgICAgICAgdmFyIHYgPSByW2JdO1xyXG4gICAgICAgICAgcmV0dXJuIHR5cGVvZiB2ID09PSAnc3RyaW5nJyB8fCB0eXBlb2YgdiA9PT0gJ251bWJlcicgPyB2IDogYTtcclxuICAgICAgICB9ICkgKTtcclxuICAgICAgfSk7XHJcbiAgICAgIHJldHVybiAoIXJldHVybmFycmF5KSA/IHJhLmpvaW4oIFwiXCIgKSA6IHJhO1xyXG4gICAgfSk7XHJcblxyXG5cclxuICAgIEFQSS5leHRlbmQoICdlYWNoJywgZnVuY3Rpb24gKCBtICkge1xyXG4gICAgICAvLyAqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqXHJcbiAgICAgIC8vICpcclxuICAgICAgLy8gKiBUYWtlczogYSBmdW5jdGlvblxyXG4gICAgICAvLyAqIFB1cnBvc2U6IGxvb3BzIG92ZXIgZXZlcnkgbWF0Y2hpbmcgcmVjb3JkIGFuZCBhcHBsaWVzIHRoZSBmdW5jdGlvblxyXG4gICAgICAvLyAqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqIFxyXG4gICAgICBydW4uY2FsbCggdGhpcyApO1xyXG4gICAgICBlYWNoKCB0aGlzLmNvbnRleHQoKS5yZXN1bHRzLCBtICk7XHJcbiAgICAgIHJldHVybiB0aGlzO1xyXG4gICAgfSk7XHJcbiAgICBBUEkuZXh0ZW5kKCAnbWFwJywgZnVuY3Rpb24gKCBtICkge1xyXG4gICAgICAvLyAqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqXHJcbiAgICAgIC8vICpcclxuICAgICAgLy8gKiBUYWtlczogYSBmdW5jdGlvblxyXG4gICAgICAvLyAqIFB1cnBvc2U6IGxvb3BzIG92ZXIgZXZlcnkgbWF0Y2hpbmcgcmVjb3JkIGFuZCBhcHBsaWVzIHRoZSBmdW5jdGlvbiwgcmV0dXJpbmcgdGhlIHJlc3VsdHMgaW4gYW4gYXJyYXlcclxuICAgICAgLy8gKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKiBcclxuICAgICAgdmFyIHJhID0gW107XHJcbiAgICAgIHJ1bi5jYWxsKCB0aGlzICk7XHJcbiAgICAgIGVhY2goIHRoaXMuY29udGV4dCgpLnJlc3VsdHMsIGZ1bmN0aW9uICggciApIHtcclxuICAgICAgICByYS5wdXNoKCBtKCByICkgKTtcclxuICAgICAgfSk7XHJcbiAgICAgIHJldHVybiByYTtcclxuICAgIH0pO1xyXG5cclxuXHJcblxyXG4gICAgVCA9IGZ1bmN0aW9uICggZCApIHtcclxuICAgICAgLy8gKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKlxyXG4gICAgICAvLyAqXHJcbiAgICAgIC8vICogVCBpcyB0aGUgbWFpbiBUQUZGWSBvYmplY3RcclxuICAgICAgLy8gKiBUYWtlczogYW4gYXJyYXkgb2Ygb2JqZWN0cyBvciBKU09OXHJcbiAgICAgIC8vICogUmV0dXJucyBhIG5ldyBUQUZGWURCXHJcbiAgICAgIC8vICoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKiogXHJcbiAgICAgIHZhciBUT2IgPSBbXSxcclxuICAgICAgICBJRCA9IHt9LFxyXG4gICAgICAgIFJDID0gMSxcclxuICAgICAgICBzZXR0aW5ncyA9IHtcclxuICAgICAgICAgIHRlbXBsYXRlICAgICAgICAgIDogZmFsc2UsXHJcbiAgICAgICAgICBvbkluc2VydCAgICAgICAgICA6IGZhbHNlLFxyXG4gICAgICAgICAgb25VcGRhdGUgICAgICAgICAgOiBmYWxzZSxcclxuICAgICAgICAgIG9uUmVtb3ZlICAgICAgICAgIDogZmFsc2UsXHJcbiAgICAgICAgICBvbkRCQ2hhbmdlICAgICAgICA6IGZhbHNlLFxyXG4gICAgICAgICAgc3RvcmFnZU5hbWUgICAgICAgOiBmYWxzZSxcclxuICAgICAgICAgIGZvcmNlUHJvcGVydHlDYXNlIDogbnVsbCxcclxuICAgICAgICAgIGNhY2hlU2l6ZSAgICAgICAgIDogMTAwLFxyXG4gICAgICAgICAgbmFtZSAgICAgICAgICAgICAgOiAnJ1xyXG4gICAgICAgIH0sXHJcbiAgICAgICAgZG0gPSBuZXcgRGF0ZSgpLFxyXG4gICAgICAgIENhY2hlQ291bnQgPSAwLFxyXG4gICAgICAgIENhY2hlQ2xlYXIgPSAwLFxyXG4gICAgICAgIENhY2hlID0ge30sXHJcbiAgICAgICAgREJJLCBydW5JbmRleGVzLCByb290XHJcbiAgICAgICAgO1xyXG4gICAgICAvLyAqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqXHJcbiAgICAgIC8vICpcclxuICAgICAgLy8gKiBUT2IgPSB0aGlzIGRhdGFiYXNlXHJcbiAgICAgIC8vICogSUQgPSBjb2xsZWN0aW9uIG9mIHRoZSByZWNvcmQgSURzIGFuZCBsb2NhdGlvbnMgd2l0aGluIHRoZSBEQiwgdXNlZCBmb3IgZmFzdCBsb29rdXBzXHJcbiAgICAgIC8vICogUkMgPSByZWNvcmQgY291bnRlciwgdXNlZCBmb3IgY3JlYXRpbmcgSURzXHJcbiAgICAgIC8vICogc2V0dGluZ3MudGVtcGxhdGUgPSB0aGUgdGVtcGxhdGUgdG8gbWVyZ2UgYWxsIG5ldyByZWNvcmRzIHdpdGhcclxuICAgICAgLy8gKiBzZXR0aW5ncy5vbkluc2VydCA9IGV2ZW50IGdpdmVuIGEgY29weSBvZiB0aGUgbmV3bHkgaW5zZXJ0ZWQgcmVjb3JkXHJcbiAgICAgIC8vICogc2V0dGluZ3Mub25VcGRhdGUgPSBldmVudCBnaXZlbiB0aGUgb3JpZ2luYWwgcmVjb3JkLCB0aGUgY2hhbmdlcywgYW5kIHRoZSBuZXcgcmVjb3JkXHJcbiAgICAgIC8vICogc2V0dGluZ3Mub25SZW1vdmUgPSBldmVudCBnaXZlbiB0aGUgcmVtb3ZlZCByZWNvcmRcclxuICAgICAgLy8gKiBzZXR0aW5ncy5mb3JjZVByb3BlcnR5Q2FzZSA9IG9uIGluc2VydCBmb3JjZSB0aGUgcHJvcHJ0eSBjYXNlIHRvIGJlIGxvd2VyIG9yIHVwcGVyLiBkZWZhdWx0IGxvd2VyLCBudWxsL3VuZGVmaW5lZCB3aWxsIGxlYXZlIGNhc2UgYXMgaXNcclxuICAgICAgLy8gKiBkbSA9IHRoZSBtb2RpZnkgZGF0ZSBvZiB0aGUgZGF0YWJhc2UsIHVzZWQgZm9yIHF1ZXJ5IGNhY2hpbmdcclxuICAgICAgLy8gKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKiBcclxuXHJcblxyXG4gICAgICBydW5JbmRleGVzID0gZnVuY3Rpb24gKCBpbmRleGVzICkge1xyXG4gICAgICAgIC8vICoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKipcclxuICAgICAgICAvLyAqXHJcbiAgICAgICAgLy8gKiBUYWtlczogYSBjb2xsZWN0aW9uIG9mIGluZGV4ZXNcclxuICAgICAgICAvLyAqIFJldHVybnM6IGNvbGxlY3Rpb24gd2l0aCByZWNvcmRzIG1hdGNoaW5nIGluZGV4ZWQgZmlsdGVyc1xyXG4gICAgICAgIC8vICoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKiogXHJcblxyXG4gICAgICAgIHZhciByZWNvcmRzID0gW10sIFVuaXF1ZUVuZm9yY2UgPSBmYWxzZTtcclxuXHJcbiAgICAgICAgaWYgKCBpbmRleGVzLmxlbmd0aCA9PT0gMCApe1xyXG4gICAgICAgICAgcmV0dXJuIFRPYjtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGVhY2goIGluZGV4ZXMsIGZ1bmN0aW9uICggZiApIHtcclxuICAgICAgICAgIC8vIENoZWNrIHRvIHNlZSBpZiByZWNvcmQgSURcclxuICAgICAgICAgIGlmICggVC5pc1N0cmluZyggZiApICYmIC9bdF1bMC05XSpbcl1bMC05XSovaS50ZXN0KCBmICkgJiZcclxuICAgICAgICAgICAgVE9iW0lEW2ZdXSApXHJcbiAgICAgICAgICB7XHJcbiAgICAgICAgICAgIHJlY29yZHMucHVzaCggVE9iW0lEW2ZdXSApO1xyXG4gICAgICAgICAgICBVbmlxdWVFbmZvcmNlID0gdHJ1ZTtcclxuICAgICAgICAgIH1cclxuICAgICAgICAgIC8vIENoZWNrIHRvIHNlZSBpZiByZWNvcmRcclxuICAgICAgICAgIGlmICggVC5pc09iamVjdCggZiApICYmIGYuX19faWQgJiYgZi5fX19zICYmXHJcbiAgICAgICAgICAgIFRPYltJRFtmLl9fX2lkXV0gKVxyXG4gICAgICAgICAge1xyXG4gICAgICAgICAgICByZWNvcmRzLnB1c2goIFRPYltJRFtmLl9fX2lkXV0gKTtcclxuICAgICAgICAgICAgVW5pcXVlRW5mb3JjZSA9IHRydWU7XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgICAvLyBDaGVjayB0byBzZWUgaWYgYXJyYXkgb2YgaW5kZXhlc1xyXG4gICAgICAgICAgaWYgKCBULmlzQXJyYXkoIGYgKSApe1xyXG4gICAgICAgICAgICBlYWNoKCBmLCBmdW5jdGlvbiAoIHIgKSB7XHJcbiAgICAgICAgICAgICAgZWFjaCggcnVuSW5kZXhlcyggciApLCBmdW5jdGlvbiAoIHJyICkge1xyXG4gICAgICAgICAgICAgICAgcmVjb3Jkcy5wdXNoKCByciApO1xyXG4gICAgICAgICAgICAgIH0pO1xyXG5cclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgaWYgKCBVbmlxdWVFbmZvcmNlICYmIHJlY29yZHMubGVuZ3RoID4gMSApe1xyXG4gICAgICAgICAgcmVjb3JkcyA9IFtdO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcmV0dXJuIHJlY29yZHM7XHJcbiAgICAgIH07XHJcblxyXG4gICAgICBEQkkgPSB7XHJcbiAgICAgICAgLy8gKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKlxyXG4gICAgICAgIC8vICpcclxuICAgICAgICAvLyAqIFRoZSBEQkkgaXMgdGhlIGludGVybmFsIERhdGFCYXNlIEludGVyZmFjZSB0aGF0IGludGVyYWN0cyB3aXRoIHRoZSBkYXRhXHJcbiAgICAgICAgLy8gKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKiBcclxuICAgICAgICBkbSAgICAgICAgICAgOiBmdW5jdGlvbiAoIG5kICkge1xyXG4gICAgICAgICAgLy8gKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKlxyXG4gICAgICAgICAgLy8gKlxyXG4gICAgICAgICAgLy8gKiBUYWtlczogYW4gb3B0aW9uYWwgbmV3IG1vZGlmeSBkYXRlXHJcbiAgICAgICAgICAvLyAqIFB1cnBvc2U6IHVzZWQgdG8gZ2V0IGFuZCBzZXQgdGhlIERCIG1vZGlmeSBkYXRlXHJcbiAgICAgICAgICAvLyAqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqIFxyXG4gICAgICAgICAgaWYgKCBuZCApe1xyXG4gICAgICAgICAgICBkbSA9IG5kO1xyXG4gICAgICAgICAgICBDYWNoZSA9IHt9O1xyXG4gICAgICAgICAgICBDYWNoZUNvdW50ID0gMDtcclxuICAgICAgICAgICAgQ2FjaGVDbGVhciA9IDA7XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgICBpZiAoIHNldHRpbmdzLm9uREJDaGFuZ2UgKXtcclxuICAgICAgICAgICAgc2V0VGltZW91dCggZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICAgIHNldHRpbmdzLm9uREJDaGFuZ2UuY2FsbCggVE9iICk7XHJcbiAgICAgICAgICAgIH0sIDAgKTtcclxuICAgICAgICAgIH1cclxuICAgICAgICAgIGlmICggc2V0dGluZ3Muc3RvcmFnZU5hbWUgKXtcclxuICAgICAgICAgICAgc2V0VGltZW91dCggZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICAgIGxvY2FsU3RvcmFnZS5zZXRJdGVtKCAndGFmZnlfJyArIHNldHRpbmdzLnN0b3JhZ2VOYW1lLFxyXG4gICAgICAgICAgICAgICAgSlNPTi5zdHJpbmdpZnkoIFRPYiApICk7XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgICAgcmV0dXJuIGRtO1xyXG4gICAgICAgIH0sXHJcbiAgICAgICAgaW5zZXJ0ICAgICAgIDogZnVuY3Rpb24gKCBpLCBydW5FdmVudCApIHtcclxuICAgICAgICAgIC8vICoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKipcclxuICAgICAgICAgIC8vICpcclxuICAgICAgICAgIC8vICogVGFrZXM6IGEgbmV3IHJlY29yZCB0byBpbnNlcnRcclxuICAgICAgICAgIC8vICogUHVycG9zZTogbWVyZ2UgdGhlIG9iamVjdCB3aXRoIHRoZSB0ZW1wbGF0ZSwgYWRkIGFuIElELCBpbnNlcnQgaW50byBEQiwgY2FsbCBpbnNlcnQgZXZlbnRcclxuICAgICAgICAgIC8vICoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKiogXHJcbiAgICAgICAgICB2YXIgY29sdW1ucyA9IFtdLFxyXG4gICAgICAgICAgICByZWNvcmRzICAgPSBbXSxcclxuICAgICAgICAgICAgaW5wdXQgICAgID0gcHJvdGVjdEpTT04oIGkgKVxyXG4gICAgICAgICAgICA7XHJcbiAgICAgICAgICBlYWNoKCBpbnB1dCwgZnVuY3Rpb24gKCB2LCBpICkge1xyXG4gICAgICAgICAgICB2YXIgbnYsIG87XHJcbiAgICAgICAgICAgIGlmICggVC5pc0FycmF5KCB2ICkgJiYgaSA9PT0gMCApe1xyXG4gICAgICAgICAgICAgIGVhY2goIHYsIGZ1bmN0aW9uICggYXYgKSB7XHJcblxyXG4gICAgICAgICAgICAgICAgY29sdW1ucy5wdXNoKCAoc2V0dGluZ3MuZm9yY2VQcm9wZXJ0eUNhc2UgPT09ICdsb3dlcicpXHJcbiAgICAgICAgICAgICAgICAgID8gYXYudG9Mb3dlckNhc2UoKVxyXG4gICAgICAgICAgICAgICAgICAgIDogKHNldHRpbmdzLmZvcmNlUHJvcGVydHlDYXNlID09PSAndXBwZXInKVxyXG4gICAgICAgICAgICAgICAgICA/IGF2LnRvVXBwZXJDYXNlKCkgOiBhdiApO1xyXG4gICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAgIHJldHVybiB0cnVlO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGVsc2UgaWYgKCBULmlzQXJyYXkoIHYgKSApe1xyXG4gICAgICAgICAgICAgIG52ID0ge307XHJcbiAgICAgICAgICAgICAgZWFjaCggdiwgZnVuY3Rpb24gKCBhdiwgYWkgKSB7XHJcbiAgICAgICAgICAgICAgICBudltjb2x1bW5zW2FpXV0gPSBhdjtcclxuICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgICB2ID0gbnY7XHJcblxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGVsc2UgaWYgKCBULmlzT2JqZWN0KCB2ICkgJiYgc2V0dGluZ3MuZm9yY2VQcm9wZXJ0eUNhc2UgKXtcclxuICAgICAgICAgICAgICBvID0ge307XHJcblxyXG4gICAgICAgICAgICAgIGVhY2hpbiggdiwgZnVuY3Rpb24gKCBhdiwgYWkgKSB7XHJcbiAgICAgICAgICAgICAgICBvWyhzZXR0aW5ncy5mb3JjZVByb3BlcnR5Q2FzZSA9PT0gJ2xvd2VyJykgPyBhaS50b0xvd2VyQ2FzZSgpXHJcbiAgICAgICAgICAgICAgICAgIDogKHNldHRpbmdzLmZvcmNlUHJvcGVydHlDYXNlID09PSAndXBwZXInKVxyXG4gICAgICAgICAgICAgICAgICA/IGFpLnRvVXBwZXJDYXNlKCkgOiBhaV0gPSB2W2FpXTtcclxuICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgICB2ID0gbztcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgUkMrKztcclxuICAgICAgICAgICAgdi5fX19pZCA9ICdUJyArIFN0cmluZyggaWRwYWQgKyBUQyApLnNsaWNlKCAtNiApICsgJ1InICtcclxuICAgICAgICAgICAgICBTdHJpbmcoIGlkcGFkICsgUkMgKS5zbGljZSggLTYgKTtcclxuICAgICAgICAgICAgdi5fX19zID0gdHJ1ZTtcclxuICAgICAgICAgICAgcmVjb3Jkcy5wdXNoKCB2Ll9fX2lkICk7XHJcbiAgICAgICAgICAgIGlmICggc2V0dGluZ3MudGVtcGxhdGUgKXtcclxuICAgICAgICAgICAgICB2ID0gVC5tZXJnZU9iaiggc2V0dGluZ3MudGVtcGxhdGUsIHYgKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBUT2IucHVzaCggdiApO1xyXG5cclxuICAgICAgICAgICAgSURbdi5fX19pZF0gPSBUT2IubGVuZ3RoIC0gMTtcclxuICAgICAgICAgICAgaWYgKCBzZXR0aW5ncy5vbkluc2VydCAmJlxyXG4gICAgICAgICAgICAgIChydW5FdmVudCB8fCBUQUZGWS5pc1VuZGVmaW5lZCggcnVuRXZlbnQgKSkgKVxyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgc2V0dGluZ3Mub25JbnNlcnQuY2FsbCggdiApO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIERCSS5kbSggbmV3IERhdGUoKSApO1xyXG4gICAgICAgICAgfSk7XHJcbiAgICAgICAgICByZXR1cm4gcm9vdCggcmVjb3JkcyApO1xyXG4gICAgICAgIH0sXHJcbiAgICAgICAgc29ydCAgICAgICAgIDogZnVuY3Rpb24gKCBvICkge1xyXG4gICAgICAgICAgLy8gKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKlxyXG4gICAgICAgICAgLy8gKlxyXG4gICAgICAgICAgLy8gKiBQdXJwb3NlOiBDaGFuZ2UgdGhlIHNvcnQgb3JkZXIgb2YgdGhlIERCIGl0c2VsZiBhbmQgcmVzZXQgdGhlIElEIGJ1Y2tldFxyXG4gICAgICAgICAgLy8gKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKiBcclxuICAgICAgICAgIFRPYiA9IG9yZGVyQnlDb2woIFRPYiwgby5zcGxpdCggJywnICkgKTtcclxuICAgICAgICAgIElEID0ge307XHJcbiAgICAgICAgICBlYWNoKCBUT2IsIGZ1bmN0aW9uICggciwgaSApIHtcclxuICAgICAgICAgICAgSURbci5fX19pZF0gPSBpO1xyXG4gICAgICAgICAgfSk7XHJcbiAgICAgICAgICBEQkkuZG0oIG5ldyBEYXRlKCkgKTtcclxuICAgICAgICAgIHJldHVybiB0cnVlO1xyXG4gICAgICAgIH0sXHJcbiAgICAgICAgdXBkYXRlICAgICAgIDogZnVuY3Rpb24gKCBpZCwgY2hhbmdlcywgcnVuRXZlbnQgKSB7XHJcbiAgICAgICAgICAvLyAqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqXHJcbiAgICAgICAgICAvLyAqXHJcbiAgICAgICAgICAvLyAqIFRha2VzOiB0aGUgSUQgb2YgcmVjb3JkIGJlaW5nIGNoYW5nZWQgYW5kIHRoZSBjaGFuZ2VzXHJcbiAgICAgICAgICAvLyAqIFB1cnBvc2U6IFVwZGF0ZSBhIHJlY29yZCBhbmQgY2hhbmdlIHNvbWUgb3IgYWxsIHZhbHVlcywgY2FsbCB0aGUgb24gdXBkYXRlIG1ldGhvZFxyXG4gICAgICAgICAgLy8gKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKlxyXG5cclxuICAgICAgICAgIHZhciBuYyA9IHt9LCBvciwgbnIsIHRjLCBoYXNDaGFuZ2U7XHJcbiAgICAgICAgICBpZiAoIHNldHRpbmdzLmZvcmNlUHJvcGVydHlDYXNlICl7XHJcbiAgICAgICAgICAgIGVhY2hpbiggY2hhbmdlcywgZnVuY3Rpb24gKCB2LCBwICkge1xyXG4gICAgICAgICAgICAgIG5jWyhzZXR0aW5ncy5mb3JjZVByb3BlcnR5Q2FzZSA9PT0gJ2xvd2VyJykgPyBwLnRvTG93ZXJDYXNlKClcclxuICAgICAgICAgICAgICAgIDogKHNldHRpbmdzLmZvcmNlUHJvcGVydHlDYXNlID09PSAndXBwZXInKSA/IHAudG9VcHBlckNhc2UoKVxyXG4gICAgICAgICAgICAgICAgOiBwXSA9IHY7XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICBjaGFuZ2VzID0gbmM7XHJcbiAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgb3IgPSBUT2JbSURbaWRdXTtcclxuICAgICAgICAgIG5yID0gVC5tZXJnZU9iaiggb3IsIGNoYW5nZXMgKTtcclxuXHJcbiAgICAgICAgICB0YyA9IHt9O1xyXG4gICAgICAgICAgaGFzQ2hhbmdlID0gZmFsc2U7XHJcbiAgICAgICAgICBlYWNoaW4oIG5yLCBmdW5jdGlvbiAoIHYsIGkgKSB7XHJcbiAgICAgICAgICAgIGlmICggVEFGRlkuaXNVbmRlZmluZWQoIG9yW2ldICkgfHwgb3JbaV0gIT09IHYgKXtcclxuICAgICAgICAgICAgICB0Y1tpXSA9IHY7XHJcbiAgICAgICAgICAgICAgaGFzQ2hhbmdlID0gdHJ1ZTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgfSk7XHJcbiAgICAgICAgICBpZiAoIGhhc0NoYW5nZSApe1xyXG4gICAgICAgICAgICBpZiAoIHNldHRpbmdzLm9uVXBkYXRlICYmXHJcbiAgICAgICAgICAgICAgKHJ1bkV2ZW50IHx8IFRBRkZZLmlzVW5kZWZpbmVkKCBydW5FdmVudCApKSApXHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICBzZXR0aW5ncy5vblVwZGF0ZS5jYWxsKCBuciwgVE9iW0lEW2lkXV0sIHRjICk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgVE9iW0lEW2lkXV0gPSBucjtcclxuICAgICAgICAgICAgREJJLmRtKCBuZXcgRGF0ZSgpICk7XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgfSxcclxuICAgICAgICByZW1vdmUgICAgICAgOiBmdW5jdGlvbiAoIGlkICkge1xyXG4gICAgICAgICAgLy8gKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKlxyXG4gICAgICAgICAgLy8gKlxyXG4gICAgICAgICAgLy8gKiBUYWtlczogdGhlIElEIG9mIHJlY29yZCB0byBiZSByZW1vdmVkXHJcbiAgICAgICAgICAvLyAqIFB1cnBvc2U6IHJlbW92ZSBhIHJlY29yZCwgY2hhbmdlcyBpdHMgX19fcyB2YWx1ZSB0byBmYWxzZVxyXG4gICAgICAgICAgLy8gKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKiBcclxuICAgICAgICAgIFRPYltJRFtpZF1dLl9fX3MgPSBmYWxzZTtcclxuICAgICAgICB9LFxyXG4gICAgICAgIHJlbW92ZUNvbW1pdCA6IGZ1bmN0aW9uICggcnVuRXZlbnQgKSB7XHJcbiAgICAgICAgICB2YXIgeDtcclxuICAgICAgICAgIC8vICoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKipcclxuICAgICAgICAgIC8vICpcclxuICAgICAgICAgIC8vICogXHJcbiAgICAgICAgICAvLyAqIFB1cnBvc2U6IGxvb3Agb3ZlciBhbGwgcmVjb3JkcyBhbmQgcmVtb3ZlIHJlY29yZHMgd2l0aCBfX19zID0gZmFsc2UsIGNhbGwgb25SZW1vdmUgZXZlbnQsIGNsZWFyIElEXHJcbiAgICAgICAgICAvLyAqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqXHJcbiAgICAgICAgICBmb3IgKCB4ID0gVE9iLmxlbmd0aCAtIDE7IHggPiAtMTsgeC0tICl7XHJcblxyXG4gICAgICAgICAgICBpZiAoICFUT2JbeF0uX19fcyApe1xyXG4gICAgICAgICAgICAgIGlmICggc2V0dGluZ3Mub25SZW1vdmUgJiZcclxuICAgICAgICAgICAgICAgIChydW5FdmVudCB8fCBUQUZGWS5pc1VuZGVmaW5lZCggcnVuRXZlbnQgKSkgKVxyXG4gICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIHNldHRpbmdzLm9uUmVtb3ZlLmNhbGwoIFRPYlt4XSApO1xyXG4gICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICBJRFtUT2JbeF0uX19faWRdID0gdW5kZWZpbmVkO1xyXG4gICAgICAgICAgICAgIFRPYi5zcGxpY2UoIHgsIDEgKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgfVxyXG4gICAgICAgICAgSUQgPSB7fTtcclxuICAgICAgICAgIGVhY2goIFRPYiwgZnVuY3Rpb24gKCByLCBpICkge1xyXG4gICAgICAgICAgICBJRFtyLl9fX2lkXSA9IGk7XHJcbiAgICAgICAgICB9KTtcclxuICAgICAgICAgIERCSS5kbSggbmV3IERhdGUoKSApO1xyXG4gICAgICAgIH0sXHJcbiAgICAgICAgcXVlcnkgOiBmdW5jdGlvbiAoIGNvbnRleHQgKSB7XHJcbiAgICAgICAgICAvLyAqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqXHJcbiAgICAgICAgICAvLyAqXHJcbiAgICAgICAgICAvLyAqIFRha2VzOiB0aGUgY29udGV4dCBvYmplY3QgZm9yIGEgcXVlcnkgYW5kIGVpdGhlciByZXR1cm5zIGEgY2FjaGUgcmVzdWx0IG9yIGEgbmV3IHF1ZXJ5IHJlc3VsdFxyXG4gICAgICAgICAgLy8gKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKiBcclxuICAgICAgICAgIHZhciByZXR1cm5xLCBjaWQsIHJlc3VsdHMsIGluZGV4ZWQsIGxpbWl0cSwgbmk7XHJcblxyXG4gICAgICAgICAgaWYgKCBzZXR0aW5ncy5jYWNoZVNpemUgKSB7XHJcbiAgICAgICAgICAgIGNpZCA9ICcnO1xyXG4gICAgICAgICAgICBlYWNoKCBjb250ZXh0LmZpbHRlclJhdywgZnVuY3Rpb24gKCByICkge1xyXG4gICAgICAgICAgICAgIGlmICggVC5pc0Z1bmN0aW9uKCByICkgKXtcclxuICAgICAgICAgICAgICAgIGNpZCA9ICdub2NhY2hlJztcclxuICAgICAgICAgICAgICAgIHJldHVybiBUQUZGWS5FWElUO1xyXG4gICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgIGlmICggY2lkID09PSAnJyApe1xyXG4gICAgICAgICAgICAgIGNpZCA9IG1ha2VDaWQoIFQubWVyZ2VPYmooIGNvbnRleHQsXHJcbiAgICAgICAgICAgICAgICB7cSA6IGZhbHNlLCBydW4gOiBmYWxzZSwgc29ydCA6IGZhbHNlfSApICk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgIH1cclxuICAgICAgICAgIC8vIFJ1biBhIG5ldyBxdWVyeSBpZiB0aGVyZSBhcmUgbm8gcmVzdWx0cyBvciB0aGUgcnVuIGRhdGUgaGFzIGJlZW4gY2xlYXJlZFxyXG4gICAgICAgICAgaWYgKCAhY29udGV4dC5yZXN1bHRzIHx8ICFjb250ZXh0LnJ1biB8fFxyXG4gICAgICAgICAgICAoY29udGV4dC5ydW4gJiYgREJJLmRtKCkgPiBjb250ZXh0LnJ1bikgKVxyXG4gICAgICAgICAge1xyXG4gICAgICAgICAgICByZXN1bHRzID0gW107XHJcblxyXG4gICAgICAgICAgICAvLyBjaGVjayBDYWNoZVxyXG5cclxuICAgICAgICAgICAgaWYgKCBzZXR0aW5ncy5jYWNoZVNpemUgJiYgQ2FjaGVbY2lkXSApe1xyXG5cclxuICAgICAgICAgICAgICBDYWNoZVtjaWRdLmkgPSBDYWNoZUNvdW50Kys7XHJcbiAgICAgICAgICAgICAgcmV0dXJuIENhY2hlW2NpZF0ucmVzdWx0cztcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgICAvLyBpZiBubyBmaWx0ZXIsIHJldHVybiBEQlxyXG4gICAgICAgICAgICAgIGlmICggY29udGV4dC5xLmxlbmd0aCA9PT0gMCAmJiBjb250ZXh0LmluZGV4Lmxlbmd0aCA9PT0gMCApe1xyXG4gICAgICAgICAgICAgICAgZWFjaCggVE9iLCBmdW5jdGlvbiAoIHIgKSB7XHJcbiAgICAgICAgICAgICAgICAgIHJlc3VsdHMucHVzaCggciApO1xyXG4gICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICAgICByZXR1cm5xID0gcmVzdWx0cztcclxuICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAvLyB1c2UgaW5kZXhlc1xyXG5cclxuICAgICAgICAgICAgICAgIGluZGV4ZWQgPSBydW5JbmRleGVzKCBjb250ZXh0LmluZGV4ICk7XHJcblxyXG4gICAgICAgICAgICAgICAgLy8gcnVuIGZpbHRlcnNcclxuICAgICAgICAgICAgICAgIGVhY2goIGluZGV4ZWQsIGZ1bmN0aW9uICggciApIHtcclxuICAgICAgICAgICAgICAgICAgLy8gUnVuIGZpbHRlciB0byBzZWUgaWYgcmVjb3JkIG1hdGNoZXMgcXVlcnlcclxuICAgICAgICAgICAgICAgICAgaWYgKCBjb250ZXh0LnEubGVuZ3RoID09PSAwIHx8IHJ1bkZpbHRlcnMoIHIsIGNvbnRleHQucSApICl7XHJcbiAgICAgICAgICAgICAgICAgICAgcmVzdWx0cy5wdXNoKCByICk7XHJcbiAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH0pO1xyXG5cclxuICAgICAgICAgICAgICAgIHJldHVybnEgPSByZXN1bHRzO1xyXG4gICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG5cclxuXHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgLy8gSWYgcXVlcnkgZXhpc3RzIGFuZCBydW4gaGFzIG5vdCBiZWVuIGNsZWFyZWQgcmV0dXJuIHRoZSBjYWNoZSByZXN1bHRzXHJcbiAgICAgICAgICAgIHJldHVybnEgPSBjb250ZXh0LnJlc3VsdHM7XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgICAvLyBJZiBhIGN1c3RvbSBvcmRlciBhcnJheSBleGlzdHMgYW5kIHRoZSBydW4gaGFzIGJlZW4gY2xlYXIgb3IgdGhlIHNvcnQgaGFzIGJlZW4gY2xlYXJlZFxyXG4gICAgICAgICAgaWYgKCBjb250ZXh0Lm9yZGVyLmxlbmd0aCA+IDAgJiYgKCFjb250ZXh0LnJ1biB8fCAhY29udGV4dC5zb3J0KSApe1xyXG4gICAgICAgICAgICAvLyBvcmRlciB0aGUgcmVzdWx0c1xyXG4gICAgICAgICAgICByZXR1cm5xID0gb3JkZXJCeUNvbCggcmV0dXJucSwgY29udGV4dC5vcmRlciApO1xyXG4gICAgICAgICAgfVxyXG5cclxuICAgICAgICAgIC8vIElmIGEgbGltaXQgb24gdGhlIG51bWJlciBvZiByZXN1bHRzIGV4aXN0cyBhbmQgaXQgaXMgbGVzcyB0aGFuIHRoZSByZXR1cm5lZCByZXN1bHRzLCBsaW1pdCByZXN1bHRzXHJcbiAgICAgICAgICBpZiAoIHJldHVybnEubGVuZ3RoICYmXHJcbiAgICAgICAgICAgICgoY29udGV4dC5saW1pdCAmJiBjb250ZXh0LmxpbWl0IDwgcmV0dXJucS5sZW5ndGgpIHx8XHJcbiAgICAgICAgICAgICAgY29udGV4dC5zdGFydClcclxuICAgICAgICAgICkge1xyXG4gICAgICAgICAgICBsaW1pdHEgPSBbXTtcclxuICAgICAgICAgICAgZWFjaCggcmV0dXJucSwgZnVuY3Rpb24gKCByLCBpICkge1xyXG4gICAgICAgICAgICAgIGlmICggIWNvbnRleHQuc3RhcnQgfHxcclxuICAgICAgICAgICAgICAgIChjb250ZXh0LnN0YXJ0ICYmIChpICsgMSkgPj0gY29udGV4dC5zdGFydCkgKVxyXG4gICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIGlmICggY29udGV4dC5saW1pdCApe1xyXG4gICAgICAgICAgICAgICAgICBuaSA9IChjb250ZXh0LnN0YXJ0KSA/IChpICsgMSkgLSBjb250ZXh0LnN0YXJ0IDogaTtcclxuICAgICAgICAgICAgICAgICAgaWYgKCBuaSA8IGNvbnRleHQubGltaXQgKXtcclxuICAgICAgICAgICAgICAgICAgICBsaW1pdHEucHVzaCggciApO1xyXG4gICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgIGVsc2UgaWYgKCBuaSA+IGNvbnRleHQubGltaXQgKXtcclxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gVEFGRlkuRVhJVDtcclxuICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgIGxpbWl0cS5wdXNoKCByICk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgcmV0dXJucSA9IGxpbWl0cTtcclxuICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAvLyB1cGRhdGUgY2FjaGVcclxuICAgICAgICAgIGlmICggc2V0dGluZ3MuY2FjaGVTaXplICYmIGNpZCAhPT0gJ25vY2FjaGUnICl7XHJcbiAgICAgICAgICAgIENhY2hlQ2xlYXIrKztcclxuXHJcbiAgICAgICAgICAgIHNldFRpbWVvdXQoIGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgICB2YXIgYkNvdW50ZXIsIG5jO1xyXG4gICAgICAgICAgICAgIGlmICggQ2FjaGVDbGVhciA+PSBzZXR0aW5ncy5jYWNoZVNpemUgKiAyICl7XHJcbiAgICAgICAgICAgICAgICBDYWNoZUNsZWFyID0gMDtcclxuICAgICAgICAgICAgICAgIGJDb3VudGVyID0gQ2FjaGVDb3VudCAtIHNldHRpbmdzLmNhY2hlU2l6ZTtcclxuICAgICAgICAgICAgICAgIG5jID0ge307XHJcbiAgICAgICAgICAgICAgICBlYWNoaW4oIGZ1bmN0aW9uICggciwgayApIHtcclxuICAgICAgICAgICAgICAgICAgaWYgKCByLmkgPj0gYkNvdW50ZXIgKXtcclxuICAgICAgICAgICAgICAgICAgICBuY1trXSA9IHI7XHJcbiAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAgICAgQ2FjaGUgPSBuYztcclxuICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH0sIDAgKTtcclxuXHJcbiAgICAgICAgICAgIENhY2hlW2NpZF0gPSB7IGkgOiBDYWNoZUNvdW50KyssIHJlc3VsdHMgOiByZXR1cm5xIH07XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgICByZXR1cm4gcmV0dXJucTtcclxuICAgICAgICB9XHJcbiAgICAgIH07XHJcblxyXG5cclxuICAgICAgcm9vdCA9IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICB2YXIgaUFQSSwgY29udGV4dDtcclxuICAgICAgICAvLyAqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqXHJcbiAgICAgICAgLy8gKlxyXG4gICAgICAgIC8vICogVGhlIHJvb3QgZnVuY3Rpb24gdGhhdCBnZXRzIHJldHVybmVkIHdoZW4gYSBuZXcgREIgaXMgY3JlYXRlZFxyXG4gICAgICAgIC8vICogVGFrZXM6IHVubGltaXRlZCBmaWx0ZXIgYXJndW1lbnRzIGFuZCBjcmVhdGVzIGZpbHRlcnMgdG8gYmUgcnVuIHdoZW4gYSBxdWVyeSBpcyBjYWxsZWRcclxuICAgICAgICAvLyAqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqIFxyXG4gICAgICAgIC8vICoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKipcclxuICAgICAgICAvLyAqXHJcbiAgICAgICAgLy8gKiBpQVBJIGlzIHRoZSB0aGUgbWV0aG9kIGNvbGxlY3Rpb24gdmFsaWFibGUgd2hlbiBhIHF1ZXJ5IGhhcyBiZWVuIHN0YXJ0ZWQgYnkgY2FsbGluZyBkYm5hbWVcclxuICAgICAgICAvLyAqIENlcnRhaW4gbWV0aG9kcyBhcmUgb3IgYXJlIG5vdCBhdmFsaWFibGUgb25jZSB5b3UgaGF2ZSBzdGFydGVkIGEgcXVlcnkgc3VjaCBhcyBpbnNlcnQgLS0geW91IGNhbiBvbmx5IGluc2VydCBpbnRvIHJvb3RcclxuICAgICAgICAvLyAqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqXHJcbiAgICAgICAgaUFQSSA9IFRBRkZZLm1lcmdlT2JqKCBUQUZGWS5tZXJnZU9iaiggQVBJLCB7IGluc2VydCA6IHVuZGVmaW5lZCB9ICksXHJcbiAgICAgICAgICB7IGdldERCSSAgOiBmdW5jdGlvbiAoKSB7IHJldHVybiBEQkk7IH0sXHJcbiAgICAgICAgICAgIGdldHJvb3QgOiBmdW5jdGlvbiAoIGMgKSB7IHJldHVybiByb290LmNhbGwoIGMgKTsgfSxcclxuICAgICAgICAgIGNvbnRleHQgOiBmdW5jdGlvbiAoIG4gKSB7XHJcbiAgICAgICAgICAgIC8vICoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKipcclxuICAgICAgICAgICAgLy8gKlxyXG4gICAgICAgICAgICAvLyAqIFRoZSBjb250ZXh0IGNvbnRhaW5zIGFsbCB0aGUgaW5mb3JtYXRpb24gdG8gbWFuYWdlIGEgcXVlcnkgaW5jbHVkaW5nIGZpbHRlcnMsIGxpbWl0cywgYW5kIHNvcnRzXHJcbiAgICAgICAgICAgIC8vICoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKiogXHJcbiAgICAgICAgICAgIGlmICggbiApe1xyXG4gICAgICAgICAgICAgIGNvbnRleHQgPSBUQUZGWS5tZXJnZU9iaiggY29udGV4dCxcclxuICAgICAgICAgICAgICAgIG4uaGFzT3duUHJvcGVydHkoJ3Jlc3VsdHMnKVxyXG4gICAgICAgICAgICAgICAgICA/IFRBRkZZLm1lcmdlT2JqKCBuLCB7IHJ1biA6IG5ldyBEYXRlKCksIHNvcnQ6IG5ldyBEYXRlKCkgfSlcclxuICAgICAgICAgICAgICAgICAgOiBuXHJcbiAgICAgICAgICAgICAgKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICByZXR1cm4gY29udGV4dDtcclxuICAgICAgICAgIH0sXHJcbiAgICAgICAgICBleHRlbmQgIDogdW5kZWZpbmVkXHJcbiAgICAgICAgfSk7XHJcblxyXG4gICAgICAgIGNvbnRleHQgPSAodGhpcyAmJiB0aGlzLnEpID8gdGhpcyA6IHtcclxuICAgICAgICAgIGxpbWl0ICAgICA6IGZhbHNlLFxyXG4gICAgICAgICAgc3RhcnQgICAgIDogZmFsc2UsXHJcbiAgICAgICAgICBxICAgICAgICAgOiBbXSxcclxuICAgICAgICAgIGZpbHRlclJhdyA6IFtdLFxyXG4gICAgICAgICAgaW5kZXggICAgIDogW10sXHJcbiAgICAgICAgICBvcmRlciAgICAgOiBbXSxcclxuICAgICAgICAgIHJlc3VsdHMgICA6IGZhbHNlLFxyXG4gICAgICAgICAgcnVuICAgICAgIDogbnVsbCxcclxuICAgICAgICAgIHNvcnQgICAgICA6IG51bGwsXHJcbiAgICAgICAgICBzZXR0aW5ncyAgOiBzZXR0aW5nc1xyXG4gICAgICAgIH07XHJcbiAgICAgICAgLy8gKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKlxyXG4gICAgICAgIC8vICpcclxuICAgICAgICAvLyAqIENhbGwgdGhlIHF1ZXJ5IG1ldGhvZCB0byBzZXR1cCBhIG5ldyBxdWVyeVxyXG4gICAgICAgIC8vICoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKiogXHJcbiAgICAgICAgZWFjaCggYXJndW1lbnRzLCBmdW5jdGlvbiAoIGYgKSB7XHJcblxyXG4gICAgICAgICAgaWYgKCBpc0luZGV4YWJsZSggZiApICl7XHJcbiAgICAgICAgICAgIGNvbnRleHQuaW5kZXgucHVzaCggZiApO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgIGNvbnRleHQucS5wdXNoKCByZXR1cm5GaWx0ZXIoIGYgKSApO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgICAgY29udGV4dC5maWx0ZXJSYXcucHVzaCggZiApO1xyXG4gICAgICAgIH0pO1xyXG5cclxuXHJcbiAgICAgICAgcmV0dXJuIGlBUEk7XHJcbiAgICAgIH07XHJcblxyXG4gICAgICAvLyAqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqXHJcbiAgICAgIC8vICpcclxuICAgICAgLy8gKiBJZiBuZXcgcmVjb3JkcyBoYXZlIGJlZW4gcGFzc2VkIG9uIGNyZWF0aW9uIG9mIHRoZSBEQiBlaXRoZXIgYXMgSlNPTiBvciBhcyBhbiBhcnJheS9vYmplY3QsIGluc2VydCB0aGVtXHJcbiAgICAgIC8vICoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKiogXHJcbiAgICAgIFRDKys7XHJcbiAgICAgIGlmICggZCApe1xyXG4gICAgICAgIERCSS5pbnNlcnQoIGQgKTtcclxuICAgICAgfVxyXG5cclxuXHJcbiAgICAgIHJvb3QuaW5zZXJ0ID0gREJJLmluc2VydDtcclxuXHJcbiAgICAgIHJvb3QubWVyZ2UgPSBmdW5jdGlvbiAoIGksIGtleSwgcnVuRXZlbnQgKSB7XHJcbiAgICAgICAgdmFyXHJcbiAgICAgICAgICBzZWFyY2ggICAgICA9IHt9LFxyXG4gICAgICAgICAgZmluYWxTZWFyY2ggPSBbXSxcclxuICAgICAgICAgIG9iaiAgICAgICAgID0ge31cclxuICAgICAgICAgIDtcclxuXHJcbiAgICAgICAgcnVuRXZlbnQgICAgPSBydW5FdmVudCB8fCBmYWxzZTtcclxuICAgICAgICBrZXkgICAgICAgICA9IGtleSAgICAgIHx8ICdpZCc7XHJcblxyXG4gICAgICAgIGVhY2goIGksIGZ1bmN0aW9uICggbyApIHtcclxuICAgICAgICAgIHZhciBleGlzdGluZ09iamVjdDtcclxuICAgICAgICAgIHNlYXJjaFtrZXldID0gb1trZXldO1xyXG4gICAgICAgICAgZmluYWxTZWFyY2gucHVzaCggb1trZXldICk7XHJcbiAgICAgICAgICBleGlzdGluZ09iamVjdCA9IHJvb3QoIHNlYXJjaCApLmZpcnN0KCk7XHJcbiAgICAgICAgICBpZiAoIGV4aXN0aW5nT2JqZWN0ICl7XHJcbiAgICAgICAgICAgIERCSS51cGRhdGUoIGV4aXN0aW5nT2JqZWN0Ll9fX2lkLCBvLCBydW5FdmVudCApO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgIERCSS5pbnNlcnQoIG8sIHJ1bkV2ZW50ICk7XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgfSk7XHJcblxyXG4gICAgICAgIG9ialtrZXldID0gZmluYWxTZWFyY2g7XHJcbiAgICAgICAgcmV0dXJuIHJvb3QoIG9iaiApO1xyXG4gICAgICB9O1xyXG5cclxuICAgICAgcm9vdC5UQUZGWSA9IHRydWU7XHJcbiAgICAgIHJvb3Quc29ydCA9IERCSS5zb3J0O1xyXG4gICAgICAvLyAqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqXHJcbiAgICAgIC8vICpcclxuICAgICAgLy8gKiBUaGVzZSBhcmUgdGhlIG1ldGhvZHMgdGhhdCBjYW4gYmUgYWNjZXNzZWQgb24gb2ZmIHRoZSByb290IERCIGZ1bmN0aW9uLiBFeGFtcGxlIGRibmFtZS5pbnNlcnQ7XHJcbiAgICAgIC8vICoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKiogXHJcbiAgICAgIHJvb3Quc2V0dGluZ3MgPSBmdW5jdGlvbiAoIG4gKSB7XHJcbiAgICAgICAgLy8gKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKlxyXG4gICAgICAgIC8vICpcclxuICAgICAgICAvLyAqIEdldHRpbmcgYW5kIHNldHRpbmcgZm9yIHRoaXMgREIncyBzZXR0aW5ncy9ldmVudHNcclxuICAgICAgICAvLyAqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqIFxyXG4gICAgICAgIGlmICggbiApe1xyXG4gICAgICAgICAgc2V0dGluZ3MgPSBUQUZGWS5tZXJnZU9iaiggc2V0dGluZ3MsIG4gKTtcclxuICAgICAgICAgIGlmICggbi50ZW1wbGF0ZSApe1xyXG5cclxuICAgICAgICAgICAgcm9vdCgpLnVwZGF0ZSggbi50ZW1wbGF0ZSApO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gc2V0dGluZ3M7XHJcbiAgICAgIH07XHJcblxyXG4gICAgICAvLyAqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqXHJcbiAgICAgIC8vICpcclxuICAgICAgLy8gKiBUaGVzZSBhcmUgdGhlIG1ldGhvZHMgdGhhdCBjYW4gYmUgYWNjZXNzZWQgb24gb2ZmIHRoZSByb290IERCIGZ1bmN0aW9uLiBFeGFtcGxlIGRibmFtZS5pbnNlcnQ7XHJcbiAgICAgIC8vICoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKiogXHJcbiAgICAgIHJvb3Quc3RvcmUgPSBmdW5jdGlvbiAoIG4gKSB7XHJcbiAgICAgICAgLy8gKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKlxyXG4gICAgICAgIC8vICpcclxuICAgICAgICAvLyAqIFNldHVwIGxvY2Fsc3RvcmFnZSBmb3IgdGhpcyBEQiBvbiBhIGdpdmVuIG5hbWVcclxuICAgICAgICAvLyAqIFB1bGwgZGF0YSBpbnRvIHRoZSBEQiBhcyBuZWVkZWRcclxuICAgICAgICAvLyAqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqIFxyXG4gICAgICAgIHZhciByID0gZmFsc2UsIGk7XHJcbiAgICAgICAgaWYgKCBsb2NhbFN0b3JhZ2UgKXtcclxuICAgICAgICAgIGlmICggbiApe1xyXG4gICAgICAgICAgICBpID0gbG9jYWxTdG9yYWdlLmdldEl0ZW0oICd0YWZmeV8nICsgbiApO1xyXG4gICAgICAgICAgICBpZiAoIGkgJiYgaS5sZW5ndGggPiAwICl7XHJcbiAgICAgICAgICAgICAgcm9vdC5pbnNlcnQoIGkgKTtcclxuICAgICAgICAgICAgICByID0gdHJ1ZTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBpZiAoIFRPYi5sZW5ndGggPiAwICl7XHJcbiAgICAgICAgICAgICAgc2V0VGltZW91dCggZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICAgICAgbG9jYWxTdG9yYWdlLnNldEl0ZW0oICd0YWZmeV8nICsgc2V0dGluZ3Muc3RvcmFnZU5hbWUsXHJcbiAgICAgICAgICAgICAgICAgIEpTT04uc3RyaW5naWZ5KCBUT2IgKSApO1xyXG4gICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgICByb290LnNldHRpbmdzKCB7c3RvcmFnZU5hbWUgOiBufSApO1xyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gcm9vdDtcclxuICAgICAgfTtcclxuXHJcbiAgICAgIC8vICoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKipcclxuICAgICAgLy8gKlxyXG4gICAgICAvLyAqIFJldHVybiByb290IG9uIERCIGNyZWF0aW9uIGFuZCBzdGFydCBoYXZpbmcgZnVuXHJcbiAgICAgIC8vICoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKiogXHJcbiAgICAgIHJldHVybiByb290O1xyXG4gICAgfTtcclxuICAgIC8vICoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKipcclxuICAgIC8vICpcclxuICAgIC8vICogU2V0cyB0aGUgZ2xvYmFsIFRBRkZZIG9iamVjdFxyXG4gICAgLy8gKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKiBcclxuICAgIFRBRkZZID0gVDtcclxuXHJcblxyXG4gICAgLy8gKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKlxyXG4gICAgLy8gKlxyXG4gICAgLy8gKiBDcmVhdGUgcHVibGljIGVhY2ggbWV0aG9kXHJcbiAgICAvLyAqXHJcbiAgICAvLyAqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqICAgXHJcbiAgICBULmVhY2ggPSBlYWNoO1xyXG5cclxuICAgIC8vICoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKipcclxuICAgIC8vICpcclxuICAgIC8vICogQ3JlYXRlIHB1YmxpYyBlYWNoaW4gbWV0aG9kXHJcbiAgICAvLyAqXHJcbiAgICAvLyAqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqICAgXHJcbiAgICBULmVhY2hpbiA9IGVhY2hpbjtcclxuICAgIC8vICoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKipcclxuICAgIC8vICpcclxuICAgIC8vICogQ3JlYXRlIHB1YmxpYyBleHRlbmQgbWV0aG9kXHJcbiAgICAvLyAqIEFkZCBhIGN1c3RvbSBtZXRob2QgdG8gdGhlIEFQSVxyXG4gICAgLy8gKlxyXG4gICAgLy8gKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKiAgIFxyXG4gICAgVC5leHRlbmQgPSBBUEkuZXh0ZW5kO1xyXG5cclxuXHJcbiAgICAvLyAqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqXHJcbiAgICAvLyAqXHJcbiAgICAvLyAqIENyZWF0ZXMgVEFGRlkuRVhJVCB2YWx1ZSB0aGF0IGNhbiBiZSByZXR1cm5lZCB0byBzdG9wIGFuIGVhY2ggbG9vcFxyXG4gICAgLy8gKlxyXG4gICAgLy8gKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKiAgXHJcbiAgICBUQUZGWS5FWElUID0gJ1RBRkZZRVhJVCc7XHJcblxyXG4gICAgLy8gKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKlxyXG4gICAgLy8gKlxyXG4gICAgLy8gKiBDcmVhdGUgcHVibGljIHV0aWxpdHkgbWVyZ2VPYmogbWV0aG9kXHJcbiAgICAvLyAqIFJldHVybiBhIG5ldyBvYmplY3Qgd2hlcmUgaXRlbXMgZnJvbSBvYmoyXHJcbiAgICAvLyAqIGhhdmUgcmVwbGFjZWQgb3IgYmVlbiBhZGRlZCB0byB0aGUgaXRlbXMgaW5cclxuICAgIC8vICogb2JqMVxyXG4gICAgLy8gKiBQdXJwb3NlOiBVc2VkIHRvIGNvbWJpbmUgb2Jqc1xyXG4gICAgLy8gKlxyXG4gICAgLy8gKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKiAgIFxyXG4gICAgVEFGRlkubWVyZ2VPYmogPSBmdW5jdGlvbiAoIG9iMSwgb2IyICkge1xyXG4gICAgICB2YXIgYyA9IHt9O1xyXG4gICAgICBlYWNoaW4oIG9iMSwgZnVuY3Rpb24gKCB2LCBuICkgeyBjW25dID0gb2IxW25dOyB9KTtcclxuICAgICAgZWFjaGluKCBvYjIsIGZ1bmN0aW9uICggdiwgbiApIHsgY1tuXSA9IG9iMltuXTsgfSk7XHJcbiAgICAgIHJldHVybiBjO1xyXG4gICAgfTtcclxuXHJcblxyXG4gICAgLy8gKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKlxyXG4gICAgLy8gKlxyXG4gICAgLy8gKiBDcmVhdGUgcHVibGljIHV0aWxpdHkgaGFzIG1ldGhvZFxyXG4gICAgLy8gKiBSZXR1cm5zIHRydWUgaWYgYSBjb21wbGV4IG9iamVjdCwgYXJyYXlcclxuICAgIC8vICogb3IgdGFmZnkgY29sbGVjdGlvbiBjb250YWlucyB0aGUgbWF0ZXJpYWxcclxuICAgIC8vICogcHJvdmlkZWQgaW4gdGhlIHNlY29uZCBhcmd1bWVudFxyXG4gICAgLy8gKiBQdXJwb3NlOiBVc2VkIHRvIGNvbWFyZSBvYmplY3RzXHJcbiAgICAvLyAqXHJcbiAgICAvLyAqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqXHJcbiAgICBUQUZGWS5oYXMgPSBmdW5jdGlvbiAoIHZhcjEsIHZhcjIgKSB7XHJcblxyXG4gICAgICB2YXIgcmUgPSBmYWxzZSwgbjtcclxuXHJcbiAgICAgIGlmICggKHZhcjEuVEFGRlkpICl7XHJcbiAgICAgICAgcmUgPSB2YXIxKCB2YXIyICk7XHJcbiAgICAgICAgaWYgKCByZS5sZW5ndGggPiAwICl7XHJcbiAgICAgICAgICByZXR1cm4gdHJ1ZTtcclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcbiAgICAgIGVsc2Uge1xyXG5cclxuICAgICAgICBzd2l0Y2ggKCBULnR5cGVPZiggdmFyMSApICl7XHJcbiAgICAgICAgICBjYXNlICdvYmplY3QnOlxyXG4gICAgICAgICAgICBpZiAoIFQuaXNPYmplY3QoIHZhcjIgKSApe1xyXG4gICAgICAgICAgICAgIGVhY2hpbiggdmFyMiwgZnVuY3Rpb24gKCB2LCBuICkge1xyXG4gICAgICAgICAgICAgICAgaWYgKCByZSA9PT0gdHJ1ZSAmJiAhVC5pc1VuZGVmaW5lZCggdmFyMVtuXSApICYmXHJcbiAgICAgICAgICAgICAgICAgIHZhcjEuaGFzT3duUHJvcGVydHkoIG4gKSApXHJcbiAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgIHJlID0gVC5oYXMoIHZhcjFbbl0sIHZhcjJbbl0gKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICByZSA9IGZhbHNlO1xyXG4gICAgICAgICAgICAgICAgICByZXR1cm4gVEFGRlkuRVhJVDtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBlbHNlIGlmICggVC5pc0FycmF5KCB2YXIyICkgKXtcclxuICAgICAgICAgICAgICBlYWNoKCB2YXIyLCBmdW5jdGlvbiAoIHYsIG4gKSB7XHJcbiAgICAgICAgICAgICAgICByZSA9IFQuaGFzKCB2YXIxLCB2YXIyW25dICk7XHJcbiAgICAgICAgICAgICAgICBpZiAoIHJlICl7XHJcbiAgICAgICAgICAgICAgICAgIHJldHVybiBUQUZGWS5FWElUO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGVsc2UgaWYgKCBULmlzU3RyaW5nKCB2YXIyICkgKXtcclxuICAgICAgICAgICAgICBpZiAoICFUQUZGWS5pc1VuZGVmaW5lZCggdmFyMVt2YXIyXSApICl7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gdHJ1ZTtcclxuICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHJldHVybiByZTtcclxuICAgICAgICAgIGNhc2UgJ2FycmF5JzpcclxuICAgICAgICAgICAgaWYgKCBULmlzT2JqZWN0KCB2YXIyICkgKXtcclxuICAgICAgICAgICAgICBlYWNoKCB2YXIxLCBmdW5jdGlvbiAoIHYsIGkgKSB7XHJcbiAgICAgICAgICAgICAgICByZSA9IFQuaGFzKCB2YXIxW2ldLCB2YXIyICk7XHJcbiAgICAgICAgICAgICAgICBpZiAoIHJlID09PSB0cnVlICl7XHJcbiAgICAgICAgICAgICAgICAgIHJldHVybiBUQUZGWS5FWElUO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGVsc2UgaWYgKCBULmlzQXJyYXkoIHZhcjIgKSApe1xyXG4gICAgICAgICAgICAgIGVhY2goIHZhcjIsIGZ1bmN0aW9uICggdjIsIGkyICkge1xyXG4gICAgICAgICAgICAgICAgZWFjaCggdmFyMSwgZnVuY3Rpb24gKCB2MSwgaTEgKSB7XHJcbiAgICAgICAgICAgICAgICAgIHJlID0gVC5oYXMoIHZhcjFbaTFdLCB2YXIyW2kyXSApO1xyXG4gICAgICAgICAgICAgICAgICBpZiAoIHJlID09PSB0cnVlICl7XHJcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIFRBRkZZLkVYSVQ7XHJcbiAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAgICAgaWYgKCByZSA9PT0gdHJ1ZSApe1xyXG4gICAgICAgICAgICAgICAgICByZXR1cm4gVEFGRlkuRVhJVDtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBlbHNlIGlmICggVC5pc1N0cmluZyggdmFyMiApIHx8IFQuaXNOdW1iZXIoIHZhcjIgKSApe1xyXG4gICAgICAgICAgICAgcmUgPSBmYWxzZTtcclxuICAgICAgICAgICAgICBmb3IgKCBuID0gMDsgbiA8IHZhcjEubGVuZ3RoOyBuKysgKXtcclxuICAgICAgICAgICAgICAgIHJlID0gVC5oYXMoIHZhcjFbbl0sIHZhcjIgKTtcclxuICAgICAgICAgICAgICAgIGlmICggcmUgKXtcclxuICAgICAgICAgICAgICAgICAgcmV0dXJuIHRydWU7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHJldHVybiByZTtcclxuICAgICAgICAgIGNhc2UgJ3N0cmluZyc6XHJcbiAgICAgICAgICAgIGlmICggVC5pc1N0cmluZyggdmFyMiApICYmIHZhcjIgPT09IHZhcjEgKXtcclxuICAgICAgICAgICAgICByZXR1cm4gdHJ1ZTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgIGRlZmF1bHQ6XHJcbiAgICAgICAgICAgIGlmICggVC50eXBlT2YoIHZhcjEgKSA9PT0gVC50eXBlT2YoIHZhcjIgKSAmJiB2YXIxID09PSB2YXIyICl7XHJcbiAgICAgICAgICAgICAgcmV0dXJuIHRydWU7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcbiAgICAgIHJldHVybiBmYWxzZTtcclxuICAgIH07XHJcblxyXG4gICAgLy8gKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKlxyXG4gICAgLy8gKlxyXG4gICAgLy8gKiBDcmVhdGUgcHVibGljIHV0aWxpdHkgaGFzQWxsIG1ldGhvZFxyXG4gICAgLy8gKiBSZXR1cm5zIHRydWUgaWYgYSBjb21wbGV4IG9iamVjdCwgYXJyYXlcclxuICAgIC8vICogb3IgdGFmZnkgY29sbGVjdGlvbiBjb250YWlucyB0aGUgbWF0ZXJpYWxcclxuICAgIC8vICogcHJvdmlkZWQgaW4gdGhlIGNhbGwgLSBmb3IgYXJyYXlzIGl0IG11c3RcclxuICAgIC8vICogY29udGFpbiBhbGwgdGhlIG1hdGVyaWFsIGluIGVhY2ggYXJyYXkgaXRlbVxyXG4gICAgLy8gKiBQdXJwb3NlOiBVc2VkIHRvIGNvbWFyZSBvYmplY3RzXHJcbiAgICAvLyAqXHJcbiAgICAvLyAqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqXHJcbiAgICBUQUZGWS5oYXNBbGwgPSBmdW5jdGlvbiAoIHZhcjEsIHZhcjIgKSB7XHJcblxyXG4gICAgICB2YXIgVCA9IFRBRkZZLCBhcjtcclxuICAgICAgaWYgKCBULmlzQXJyYXkoIHZhcjIgKSApe1xyXG4gICAgICAgIGFyID0gdHJ1ZTtcclxuICAgICAgICBlYWNoKCB2YXIyLCBmdW5jdGlvbiAoIHYgKSB7XHJcbiAgICAgICAgICBhciA9IFQuaGFzKCB2YXIxLCB2ICk7XHJcbiAgICAgICAgICBpZiAoIGFyID09PSBmYWxzZSApe1xyXG4gICAgICAgICAgICByZXR1cm4gVEFGRlkuRVhJVDtcclxuICAgICAgICAgIH1cclxuICAgICAgICB9KTtcclxuICAgICAgICByZXR1cm4gYXI7XHJcbiAgICAgIH1cclxuICAgICAgZWxzZSB7XHJcbiAgICAgICAgcmV0dXJuIFQuaGFzKCB2YXIxLCB2YXIyICk7XHJcbiAgICAgIH1cclxuICAgIH07XHJcblxyXG5cclxuICAgIC8vICoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKipcclxuICAgIC8vICpcclxuICAgIC8vICogdHlwZU9mIEZpeGVkIGluIEphdmFTY3JpcHQgYXMgcHVibGljIHV0aWxpdHlcclxuICAgIC8vICpcclxuICAgIC8vICoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKipcclxuICAgIFRBRkZZLnR5cGVPZiA9IGZ1bmN0aW9uICggdiApIHtcclxuICAgICAgdmFyIHMgPSB0eXBlb2YgdjtcclxuICAgICAgaWYgKCBzID09PSAnb2JqZWN0JyApe1xyXG4gICAgICAgIGlmICggdiApe1xyXG4gICAgICAgICAgaWYgKCB0eXBlb2Ygdi5sZW5ndGggPT09ICdudW1iZXInICYmXHJcbiAgICAgICAgICAgICEodi5wcm9wZXJ0eUlzRW51bWVyYWJsZSggJ2xlbmd0aCcgKSkgKVxyXG4gICAgICAgICAge1xyXG4gICAgICAgICAgICBzID0gJ2FycmF5JztcclxuICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICBzID0gJ251bGwnO1xyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG4gICAgICByZXR1cm4gcztcclxuICAgIH07XHJcblxyXG4gICAgLy8gKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKlxyXG4gICAgLy8gKlxyXG4gICAgLy8gKiBDcmVhdGUgcHVibGljIHV0aWxpdHkgZ2V0T2JqZWN0S2V5cyBtZXRob2RcclxuICAgIC8vICogUmV0dXJucyBhbiBhcnJheSBvZiBhbiBvYmplY3RzIGtleXNcclxuICAgIC8vICogUHVycG9zZTogVXNlZCB0byBnZXQgdGhlIGtleXMgZm9yIGFuIG9iamVjdFxyXG4gICAgLy8gKlxyXG4gICAgLy8gKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKiAgIFxyXG4gICAgVEFGRlkuZ2V0T2JqZWN0S2V5cyA9IGZ1bmN0aW9uICggb2IgKSB7XHJcbiAgICAgIHZhciBrQSA9IFtdO1xyXG4gICAgICBlYWNoaW4oIG9iLCBmdW5jdGlvbiAoIG4sIGggKSB7XHJcbiAgICAgICAga0EucHVzaCggaCApO1xyXG4gICAgICB9KTtcclxuICAgICAga0Euc29ydCgpO1xyXG4gICAgICByZXR1cm4ga0E7XHJcbiAgICB9O1xyXG5cclxuICAgIC8vICoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKipcclxuICAgIC8vICpcclxuICAgIC8vICogQ3JlYXRlIHB1YmxpYyB1dGlsaXR5IGlzU2FtZUFycmF5XHJcbiAgICAvLyAqIFJldHVybnMgYW4gYXJyYXkgb2YgYW4gb2JqZWN0cyBrZXlzXHJcbiAgICAvLyAqIFB1cnBvc2U6IFVzZWQgdG8gZ2V0IHRoZSBrZXlzIGZvciBhbiBvYmplY3RcclxuICAgIC8vICpcclxuICAgIC8vICoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKiogICBcclxuICAgIFRBRkZZLmlzU2FtZUFycmF5ID0gZnVuY3Rpb24gKCBhcjEsIGFyMiApIHtcclxuICAgICAgcmV0dXJuIChUQUZGWS5pc0FycmF5KCBhcjEgKSAmJiBUQUZGWS5pc0FycmF5KCBhcjIgKSAmJlxyXG4gICAgICAgIGFyMS5qb2luKCAnLCcgKSA9PT0gYXIyLmpvaW4oICcsJyApKSA/IHRydWUgOiBmYWxzZTtcclxuICAgIH07XHJcblxyXG4gICAgLy8gKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKlxyXG4gICAgLy8gKlxyXG4gICAgLy8gKiBDcmVhdGUgcHVibGljIHV0aWxpdHkgaXNTYW1lT2JqZWN0IG1ldGhvZFxyXG4gICAgLy8gKiBSZXR1cm5zIHRydWUgaWYgb2JqZWN0cyBjb250YWluIHRoZSBzYW1lXHJcbiAgICAvLyAqIG1hdGVyaWFsIG9yIGZhbHNlIGlmIHRoZXkgZG8gbm90XHJcbiAgICAvLyAqIFB1cnBvc2U6IFVzZWQgdG8gY29tYXJlIG9iamVjdHNcclxuICAgIC8vICpcclxuICAgIC8vICoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKiogICBcclxuICAgIFRBRkZZLmlzU2FtZU9iamVjdCA9IGZ1bmN0aW9uICggb2IxLCBvYjIgKSB7XHJcbiAgICAgIHZhciBUID0gVEFGRlksIHJ2ID0gdHJ1ZTtcclxuXHJcbiAgICAgIGlmICggVC5pc09iamVjdCggb2IxICkgJiYgVC5pc09iamVjdCggb2IyICkgKXtcclxuICAgICAgICBpZiAoIFQuaXNTYW1lQXJyYXkoIFQuZ2V0T2JqZWN0S2V5cyggb2IxICksXHJcbiAgICAgICAgICBULmdldE9iamVjdEtleXMoIG9iMiApICkgKVxyXG4gICAgICAgIHtcclxuICAgICAgICAgIGVhY2hpbiggb2IxLCBmdW5jdGlvbiAoIHYsIG4gKSB7XHJcbiAgICAgICAgICAgIGlmICggISAoIChULmlzT2JqZWN0KCBvYjFbbl0gKSAmJiBULmlzT2JqZWN0KCBvYjJbbl0gKSAmJlxyXG4gICAgICAgICAgICAgIFQuaXNTYW1lT2JqZWN0KCBvYjFbbl0sIG9iMltuXSApKSB8fFxyXG4gICAgICAgICAgICAgIChULmlzQXJyYXkoIG9iMVtuXSApICYmIFQuaXNBcnJheSggb2IyW25dICkgJiZcclxuICAgICAgICAgICAgICAgIFQuaXNTYW1lQXJyYXkoIG9iMVtuXSwgb2IyW25dICkpIHx8IChvYjFbbl0gPT09IG9iMltuXSkgKVxyXG4gICAgICAgICAgICApIHtcclxuICAgICAgICAgICAgICBydiA9IGZhbHNlO1xyXG4gICAgICAgICAgICAgIHJldHVybiBUQUZGWS5FWElUO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICB9KTtcclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICBydiA9IGZhbHNlO1xyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG4gICAgICBlbHNlIHtcclxuICAgICAgICBydiA9IGZhbHNlO1xyXG4gICAgICB9XHJcbiAgICAgIHJldHVybiBydjtcclxuICAgIH07XHJcblxyXG4gICAgLy8gKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKlxyXG4gICAgLy8gKlxyXG4gICAgLy8gKiBDcmVhdGUgcHVibGljIHV0aWxpdHkgaXNbRGF0YVR5cGVdIG1ldGhvZHNcclxuICAgIC8vICogUmV0dXJuIHRydWUgaWYgb2JqIGlzIGRhdGF0eXBlLCBmYWxzZSBvdGhlcndpc2VcclxuICAgIC8vICogUHVycG9zZTogVXNlZCB0byBkZXRlcm1pbmUgaWYgYXJndW1lbnRzIGFyZSBvZiBjZXJ0YWluIGRhdGEgdHlwZVxyXG4gICAgLy8gKlxyXG4gICAgLy8gKiBtbWlrb3dza2kgMjAxMi0wOC0wNiByZWZhY3RvcmVkIHRvIG1ha2UgbXVjaCBsZXNzIFwibWFnaWNhbFwiOlxyXG4gICAgLy8gKiAgIGZld2VyIGNsb3N1cmVzIGFuZCBwYXNzZXMganNsaW50XHJcbiAgICAvLyAqXHJcbiAgICAvLyAqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqXHJcblxyXG4gICAgdHlwZUxpc3QgPSBbXHJcbiAgICAgICdTdHJpbmcnLCAgJ051bWJlcicsICdPYmplY3QnLCAgICdBcnJheScsXHJcbiAgICAgICdCb29sZWFuJywgJ051bGwnLCAgICdGdW5jdGlvbicsICdVbmRlZmluZWQnXHJcbiAgICBdO1xyXG4gIFxyXG4gICAgbWFrZVRlc3QgPSBmdW5jdGlvbiAoIHRoaXNLZXkgKSB7XHJcbiAgICAgIHJldHVybiBmdW5jdGlvbiAoIGRhdGEgKSB7XHJcbiAgICAgICAgcmV0dXJuIFRBRkZZLnR5cGVPZiggZGF0YSApID09PSB0aGlzS2V5LnRvTG93ZXJDYXNlKCkgPyB0cnVlIDogZmFsc2U7XHJcbiAgICAgIH07XHJcbiAgICB9O1xyXG4gIFxyXG4gICAgZm9yICggaWR4ID0gMDsgaWR4IDwgdHlwZUxpc3QubGVuZ3RoOyBpZHgrKyApe1xyXG4gICAgICB0eXBlS2V5ID0gdHlwZUxpc3RbaWR4XTtcclxuICAgICAgVEFGRllbJ2lzJyArIHR5cGVLZXldID0gbWFrZVRlc3QoIHR5cGVLZXkgKTtcclxuICAgIH1cclxuICB9XHJcbn0oKSk7XHJcblxyXG5pZiAoIHR5cGVvZihleHBvcnRzKSA9PT0gJ29iamVjdCcgKXtcclxuICBleHBvcnRzLnRhZmZ5ID0gVEFGRlk7XHJcbn1cclxuXHJcbiIsIi8qXG4gKiBhdWRpby5qc1xuICogV2ViIEF1ZGlvIEFQSSBtZXRob2RzXG4qL1xuLyogZ2xvYmFsICQsIHdpbmRvdywgQXVkaW9Db250ZXh0LCBYTUxIdHRwUmVxdWVzdCwgQXVkaW8qL1xuJ3VzZSBzdHJpY3QnO1xuXG52YXIgYXVkaW8gPSAoZnVuY3Rpb24gKCkge1xuXG4gICAgLy8tLS0tLS0tLS0tLS0tLS0tIEJFR0lOIE1PRFVMRSBERVBFTkRFTkNJRVMgLS0tLS0tLS0tLS0tLS1cbiAgICB2YXIgdXRpbCA9IHJlcXVpcmUoJy4vdXRpbC5qcycpLFxuICAgICAgICBzb3VuZE1hbmFnZXIgPSByZXF1aXJlKCcuLi9saWIvc291bmRtYW5hZ2VyMi9zY3JpcHQvc291bmRtYW5hZ2VyMi5qcycpLnNvdW5kTWFuYWdlcjtcblxuICAgIC8vLS0tLS0tLS0tLS0tLS0tLSBFTkQgTU9EVUxFIERFUEVOREVOQ0lFUyAtLS0tLS0tLS0tLS0tLVxuXG4gICAgLy8tLS0tLS0tLS0tLS0tLS0tIEJFR0lOIE1PRFVMRSBTQ09QRSBWQVJJQUJMRVMgLS0tLS0tLS0tLS0tLS1cbiAgICB2YXJcblxuICAgIGNvbmZpZ01hcCA9IHtcbiAgICAgICAgcHJvZ3Jlc3NfaHRtbCA6IFN0cmluZygpICtcbiAgICAgICAgICAgICc8ZGl2IGNsYXNzPVwicHJvZ3Jlc3NcIj4nICtcbiAgICAgICAgICAgICAgICAnPGRpdiBjbGFzcz1cInByb2dyZXNzLWJhclwiIHJvbGU9XCJwcm9ncmVzc2JhclwiIGFyaWEtdmFsdWVub3c9XCIxMDBcIiBhcmlhLXZhbHVlbWluPVwiMFwiIGFyaWEtdmFsdWVtYXg9XCIxMDBcIiBzdHlsZT1cIndpZHRoOiAwJTtcIj4nICtcbiAgICAgICAgICAgICAgICAgICAgJzxzcGFuIGNsYXNzPVwic3Itb25seVwiPjYwJSBDb21wbGV0ZTwvc3Bhbj4nICtcbiAgICAgICAgICAgICAgICAnPC9kaXY+JyArXG4gICAgICAgICAgICAnPC9kaXY+JyxcblxuICAgICAgICBpc1N1cHBvcnRlZDogdW5kZWZpbmVkXG4gICAgfSxcblxuICAgIHN0YXRlTWFwID0ge1xuICAgICAgICBzb3VyY2U6IHVuZGVmaW5lZCxcbiAgICAgICAgY29udGV4dDogdW5kZWZpbmVkLFxuICAgICAgICBhdWRpbzogdW5kZWZpbmVkLFxuICAgICAgICBpc1BsYXlpbmc6IGZhbHNlLFxuXG4gICAgICAgIHVybDogdW5kZWZpbmVkLFxuICAgICAgICBwZXJjZW50UGxheWVkOiB1bmRlZmluZWRcbiAgICB9LFxuXG4gICAganF1ZXJ5TWFwID0ge30sXG4gICAgc2V0SnF1ZXJ5TWFwLFxuXG4gICAgaW5pdE1vZHVsZSxcblxuICAgIG9uQ2F0ZWdvcnlDaGFuZ2UsXG4gICAgb25DbGlja1BsYXllcixcbiAgICBtYWtlU291bmQsXG4gICAgdG9nZ2xlUGxheWVyLFxuXG4gICAgUHViU3ViID0gdXRpbC5QdWJTdWI7XG5cbiAgICAvLy0tLS0tLS0tLS0tLS0tLS0gRU5EIE1PRFVMRSBTQ09QRSBWQVJJQUJMRVMgLS0tLS0tLS0tLS0tLS1cblxuICAgLy8tLS0tLS0tLS0tLS0tLS0tLS0tLS0gQkVHSU4gTU9EVUxFIFNDT1BFIE1FVEhPRFMgLS0tLS0tLS0tLS0tLS0tLS0tLS1cblxuICAgIHNldEpxdWVyeU1hcCA9IGZ1bmN0aW9uKCRwcm9ncmVzcywgJGRlc2NyaXB0aW9uKXtcbiAgICAgICAganF1ZXJ5TWFwLiRwcm9ncmVzcyAgPSAkcHJvZ3Jlc3M7XG4gICAgICAgIGpxdWVyeU1hcC4kZGVzY3JpcHRpb24gID0gJGRlc2NyaXB0aW9uO1xuICAgICAgICBqcXVlcnlNYXAuJHByb2dyZXNzX2JhciA9IGpxdWVyeU1hcC4kcHJvZ3Jlc3MuZmluZCgnLnByb2dyZXNzLWJhcicpO1xuICAgIH07XG5cbiAgICB0b2dnbGVQbGF5ZXIgPSBmdW5jdGlvbigpe1xuICAgICAgICBpZihzdGF0ZU1hcC5hdWRpby5wYXVzZWQpe1xuICAgICAgICAgICAgLy9jb25zb2xlLmxvZyhcIlBhdXNlZDsgUmVzdW1lIHBsYXk6ICVzXCIsIHN0YXRlTWFwLnVybCk7XG4gICAgICAgICAgICBzdGF0ZU1hcC5hdWRpby5yZXN1bWUoKTtcblxuICAgICAgICB9ZWxzZSBpZihzdGF0ZU1hcC5hdWRpby5wbGF5U3RhdGUgPT09IDApeyAvL3N0b3BwZWQgb3IgdW5pbml0aWFsaXplZFxuICAgICAgICAgICAgLy9jb25zb2xlLmxvZyhcIlN0b3BwZWQ7IFN0YXJ0IHBsYXk6ICVzXCIsIHN0YXRlTWFwLnVybCk7XG4gICAgICAgICAgICBzdGF0ZU1hcC5hdWRpby5wbGF5KCk7XG4gICAgICAgIH1lbHNlIGlmKHN0YXRlTWFwLmF1ZGlvLnBsYXlTdGF0ZSA9PT0gMSl7IC8vcGxheWluZyBvciBidWZmZXJpbmdcbiAgICAgICAgICAgIC8vY29uc29sZS5sb2coXCJQbGF5aW5nOyBQYXVzZSA6ICVzXCIsIHN0YXRlTWFwLnVybCk7XG4gICAgICAgICAgICBzdGF0ZU1hcC5hdWRpby5wYXVzZSgpO1xuICAgICAgICB9XG4gICAgfTtcblxuICAgIC8vIEJlZ2luIHByaXZhdGUgbWV0aG9kIC9vbkNhdGVnb3J5Q2hhbmdlL1xuICAgIC8vIEV4YW1wbGUgICA6IG9uQ2F0ZWdvcnlDaGFuZ2U7XG4gICAgLy8gUHVycG9zZSAgIDpcbiAgICAvLyAgIFB1YlN1YiBjYWxsYmFjayBmb3IgY2hhbmdlcyBpbiB0aGUgY2F0ZWdvcnkgVUlcbiAgICAvLyBBcmd1bWVudHMgOlxuICAgIC8vICAqIHVybHMgLSBhcnJheSBvZiB1cmxzIGZvciBDbGlwIG9iamVjdHMgY3VycmVudGx5IGRpc3BsYXllZFxuICAgIC8vIEFjdGlvbiAgICA6IGZvciBlYWNoIHVybCwgdXBkYXRlIHRoZSBnaXZlbiBwcm9ncmVzcyBiYXIuIEZpbmQgdGhlIFwiY3VycmVudFwiIHNvdW5kIG9iamVjdFxuICAgIC8vICBhbmQgcmVhc3NpZ24gdGhlIGpxdWVyeU1hcCB0byByZWZsZWN0IHRoZSB1cGRhdGVkIC8gbmV3IERPTSBlbGVtZW50XG4gICAgLy8gUmV0dXJucyAgIDogbm9uZVxuICAgIC8vIFRocm93cyAgICA6IG5vbmVcbiAgICBvbkNhdGVnb3J5Q2hhbmdlID0gZnVuY3Rpb24odXJscyl7XG5cbiAgICAgICAgdXJscy5mb3JFYWNoKGZ1bmN0aW9uKHVybCl7XG4gICAgICAgICAgICB2YXIgbXVybCxcbiAgICAgICAgICAgICAgICAkcGxheWVyLFxuICAgICAgICAgICAgICAgICRkZXNjcmlwdGlvbixcbiAgICAgICAgICAgICAgICAkcHJvZ3Jlc3MsXG4gICAgICAgICAgICAgICAgJHByb2dyZXNzX2JhcixcbiAgICAgICAgICAgICAgICBwcGxheWVkLFxuICAgICAgICAgICAgICAgIHNvdW5kO1xuXG4gICAgICAgICAgICAvL3RhY2sgb24gdGhlIG1lZGlhIHRhZ1xuICAgICAgICAgICAgbXVybCA9ICcvbWVkaWEvJyArIHVybDtcbiAgICAgICAgICAgIC8vZ2V0IHRoZSBzcGFuLm1lZGlhLXVybFxuICAgICAgICAgICAgJHBsYXllciA9ICQoJy5tZWRpYS5jbGlwJykuZmluZChcIltkYXRhLWNsaXAtdXJsPSdcIiArIG11cmwgKyBcIiddXCIpO1xuICAgICAgICAgICAgLy9nZXQgdGhlIHNvdW5kIGFuZCBjaGVjayBpZiBpdCB3YXMgY3JlYXRlZFxuICAgICAgICAgICAgc291bmQgPSBzb3VuZE1hbmFnZXIuZ2V0U291bmRCeUlkKG11cmwpO1xuICAgICAgICAgICAgaWYoc291bmQpe1xuXG4gICAgICAgICAgICAgICAgLy9pbmplY3QgdGhlIHByb2dyZXNzIGJhciBhbmQgdXBkYXRlIHRoZSBzdGF0ZVxuICAgICAgICAgICAgICAgICRwcm9ncmVzcyA9ICRwbGF5ZXIuZmluZCgnLm1lZGlhLXByb2dyZXNzJyk7XG4gICAgICAgICAgICAgICAgJGRlc2NyaXB0aW9uID0gJHBsYXllci5maW5kKCcubWVkaWEtZGVzY3JpcHRpb24nKTtcbiAgICAgICAgICAgICAgICAkcHJvZ3Jlc3MuaHRtbChjb25maWdNYXAucHJvZ3Jlc3NfaHRtbCk7XG4gICAgICAgICAgICAgICAgJHByb2dyZXNzX2JhciA9ICRwbGF5ZXIuZmluZCgnLm1lZGlhLXByb2dyZXNzIC5wcm9ncmVzcy1iYXInKTtcblxuICAgICAgICAgICAgICAgIC8vaWYgaXQgd2FzIHN0b3BwZWQgdGhlbiBzZXQgaXQgdG8gMTAwJVxuICAgICAgICAgICAgICAgIGlmKHNvdW5kLnBsYXlTdGF0ZSA9PT0gMCl7XG4gICAgICAgICAgICAgICAgICAgIHBwbGF5ZWQgPSAnMTAwJztcbiAgICAgICAgICAgICAgICB9ZWxzZXtcbiAgICAgICAgICAgICAgICAgICAgcHBsYXllZCA9IChzb3VuZC5wb3NpdGlvbiAvIHNvdW5kLmR1cmF0aW9uRXN0aW1hdGUgKiAxMDApLnRvRml4ZWQoMSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICRwcm9ncmVzc19iYXIud2lkdGgocHBsYXllZCArICclJyk7XG5cbiAgICAgICAgICAgICAgICAvLyBpZiB0aGUgc291bmQgPT09IHN0YXRlTWFwLmF1ZGlvIHRoZW4gcmVhc3NpZ24gdGhlIGpRdWVyeSBtYXBcbiAgICAgICAgICAgICAgICBpZihzdGF0ZU1hcC5hdWRpby5pZCA9PT0gbXVybCl7XG4gICAgICAgICAgICAgICAgICAgIHNldEpxdWVyeU1hcCgkcHJvZ3Jlc3MsICRkZXNjcmlwdGlvbik7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICB9O1xuXG4gICAgLy8gQmVnaW4gcHJpdmF0ZSBtZXRob2QgL2luaXRNb2R1bGUvXG4gICAgLy8gRXhhbXBsZSAgIDogaW5pdE1vZHVsZSgpO1xuICAgIC8vIFB1cnBvc2UgICA6XG4gICAgLy8gICBTZXRzIHVwIHRoZSBBdWRpbyBBUEkgY29udGV4dCBvciByZXBvcnRzIGVycm9yc1xuICAgIC8vIEFyZ3VtZW50cyA6IG5vbmVcbiAgICAvLyBBY3Rpb24gICAgOiBzZWFyY2hlcyBhbmQgYWRkcyB0aGUgY29ycmVjdCBBdWRpb0NvbnRleHQgb2JqZWN0IHRvIHRoZSBnbG9iYWwgd2luZG93XG4gICAgLy8gUmV0dXJucyAgIDogbm9uZVxuICAgIC8vIFRocm93cyAgICA6IG5vbmVcbiAgICBpbml0TW9kdWxlID0gZnVuY3Rpb24oKXtcbiAgICAgICAgc291bmRNYW5hZ2VyLnNldHVwKHtcbiAgICAgICAgICAgIGRlYnVnTW9kZTogdHJ1ZSxcbiAgICAgICAgICAgIGNvbnNvbGVPbmx5OiB0cnVlLFxuICAgICAgICAgICAgaHRtbDVQb2xsaW5nSW50ZXJ2YWw6IDUwLCAvLyBpbmNyZWFzZWQgZnJhbWVyYXRlIGZvciB3aGlsZXBsYXlpbmcoKSBldGMuXG4gICAgICAgICAgICBmbGFzaFZlcnNpb246IDksXG4gICAgICAgICAgICB1c2VIaWdoUGVyZm9ybWFuY2U6IHRydWUsXG4gICAgICAgICAgICB1cmw6ICdodHRwOi8vd3d3LmhpZGluZy1teS1maWxlL1NvdW5kbWFuYWdlcjJGaWxlcy9zb3VuZG1hbmFnZXIyX2ZsYXNoOS5zd2YvJyxcbiAgICAgICAgICAgIG9ucmVhZHk6IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgIGNvbmZpZ01hcC5pc1N1cHBvcnRlZCA9IHNvdW5kTWFuYWdlci5vaygpO1xuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIG9udGltZW91dDogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2coXCJTb3VuZE1hbmFnZXIgZmFpbGVkIHRvIGxvYWRcIik7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuXG4gICAgICAgIFB1YlN1Yi5vbihcInNoZWxsYWMtY2F0ZWdvcnljaGFuZ2VcIiwgb25DYXRlZ29yeUNoYW5nZSApO1xuICAgIH07XG5cbiAgICAvLyBCZWdpbiBwcml2YXRlIG1ldGhvZCAvbWFrZVNvdW5kL1xuICAgIC8vIEV4YW1wbGUgICA6IG1ha2VTb3VuZCggKTtcbiAgICAvLyBQdXJwb3NlICAgOlxuICAgIC8vICAgU2V0cyB1cCB0aGUgQXVkaW8gQVBJIGNvbnRleHQgb3IgcmVwb3J0cyBlcnJvcnNcbiAgICAvLyBBcmd1bWVudHMgOiBub25lXG4gICAgLy8gQWN0aW9uICAgIDogc2VhcmNoZXMgYW5kIGFkZHMgdGhlIGNvcnJlY3QgQXVkaW9Db250ZXh0IG9iamVjdCB0byB0aGUgZ2xvYmFsIHdpbmRvd1xuICAgIC8vIFJldHVybnMgICA6IG5vbmVcbiAgICAvLyBUaHJvd3MgICAgOiBub25lXG4gICAgbWFrZVNvdW5kID0gZnVuY3Rpb24odXJsLCBhdXRvUGxheSl7XG4gICAgICAgIHZhciBzb3VuZDtcbiAgICAgICAgc291bmQgPSBzb3VuZE1hbmFnZXIuY3JlYXRlU291bmQoe1xuICAgICAgICAgICAgaWQ6IHVybCxcbiAgICAgICAgICAgIHVybDogdXJsLFxuICAgICAgICAgICAgYXV0b1BsYXk6IGF1dG9QbGF5LFxuICAgICAgICAgICAgd2hpbGVsb2FkaW5nOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgLy9zb3VuZE1hbmFnZXIuX3dyaXRlRGVidWcoJ0xPQUQgUFJPR1JFU1MgJyArIHRoaXMuYnl0ZXNMb2FkZWQgKyAnIC8gJyArIHRoaXMuYnl0ZXNUb3RhbCk7XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgd2hpbGVwbGF5aW5nOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgdmFyIHBlcmNlbnRQbGF5ZWQgPSAodGhpcy5wb3NpdGlvbiAvIHRoaXMuZHVyYXRpb25Fc3RpbWF0ZSAqIDEwMCkudG9GaXhlZCgxKTtcblxuICAgICAgICAgICAgICAgIGlmIChwZXJjZW50UGxheWVkICE9PSBzdGF0ZU1hcC5wZXJjZW50UGxheWVkKSB7XG4gICAgICAgICAgICAgICAgICAgIHN0YXRlTWFwLnBlcmNlbnRQbGF5ZWQgPSBwZXJjZW50UGxheWVkO1xuICAgICAgICAgICAgICAgICAgICBqcXVlcnlNYXAuJHByb2dyZXNzX2Jhci53aWR0aChwZXJjZW50UGxheWVkICsgJyUnKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgb25sb2FkOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgLy9pbmplY3QgdGhlIHBsYXkgcHJvZ3Jlc3MgYmFyIGFuZCBzZXQganF1ZXJ5TWFwIGF0dHJpYnV0ZVxuICAgICAgICAgICAgICAgIGpxdWVyeU1hcC4kcHJvZ3Jlc3MuaHRtbChjb25maWdNYXAucHJvZ3Jlc3NfaHRtbCk7XG4gICAgICAgICAgICAgICAganF1ZXJ5TWFwLiRwcm9ncmVzc19iYXIgPSBqcXVlcnlNYXAuJHByb2dyZXNzLmZpbmQoJy5wcm9ncmVzcy1iYXInKTtcblxuICAgICAgICAgICAgICAgIC8vaW5pdGlhbGl6ZSB0aGUgcGVyY2VudFBsYXllZFxuICAgICAgICAgICAgICAgIHN0YXRlTWFwLnBlcmNlbnRQbGF5ZWQgPSAodGhpcy5wb3NpdGlvbiAvIHRoaXMuZHVyYXRpb25Fc3RpbWF0ZSAqIDEwMCkudG9GaXhlZCgxKTtcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBvbnBsYXk6IGZ1bmN0aW9uKCl7XG4gICAgICAgICAgICAgICAganF1ZXJ5TWFwLiRkZXNjcmlwdGlvbi50b2dnbGVDbGFzcyhcInBsYXlpbmdcIik7XG4gICAgICAgICAgICAgICAganF1ZXJ5TWFwLiRkZXNjcmlwdGlvbi50b2dnbGVDbGFzcyhcInBsYXllZFwiKTtcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBvbnBhdXNlOiBmdW5jdGlvbigpe1xuICAgICAgICAgICAgICAgIGpxdWVyeU1hcC4kZGVzY3JpcHRpb24udG9nZ2xlQ2xhc3MoXCJwbGF5aW5nXCIpO1xuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIG9ucmVzdW1lOiBmdW5jdGlvbigpe1xuICAgICAgICAgICAgICAgIGpxdWVyeU1hcC4kZGVzY3JpcHRpb24udG9nZ2xlQ2xhc3MoXCJwbGF5aW5nXCIpO1xuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIG9uc3RvcDogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgIGpxdWVyeU1hcC4kZGVzY3JpcHRpb24udG9nZ2xlQ2xhc3MoXCJwbGF5aW5nXCIpO1xuICAgICAgICAgICAgICAgIC8vc291bmRNYW5hZ2VyLl93cml0ZURlYnVnKCdUaGUgc291bmQgJyArIHRoaXMuaWQgKyAnIHN0b3BwZWQuJyk7XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgb25maW5pc2g6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICBqcXVlcnlNYXAuJGRlc2NyaXB0aW9uLnRvZ2dsZUNsYXNzKFwicGxheWluZ1wiKTtcbiAgICAgICAgICAgICAgICAvL3NvdW5kTWFuYWdlci5fd3JpdGVEZWJ1ZygnVGhlIHNvdW5kICcgKyB0aGlzLmlkICsgJyBmaW5pc2hlZCBwbGF5aW5nLicpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcblxuICAgICAgICByZXR1cm4gc291bmQ7XG5cbiAgICB9O1xuXG4gICAgLy8tLS0tLS0tLS0tLS0tLS0tLS0tLS0gRU5EIE1PRFVMRSBTQ09QRSBNRVRIT0RTIC0tLS0tLS0tLS0tLS0tLS0tLS0tXG5cbiAgICAvLy0tLS0tLS0tLS0tLS0tLS0tLS0gQkVHSU4gUFVCTElDIE1FVEhPRFMgLS0tLS0tLS0tLS0tLS0tLS0tLVxuICAgIG9uQ2xpY2tQbGF5ZXIgPSBmdW5jdGlvbih1cmwsICRwcm9ncmVzcywgJGRlc2NyaXB0aW9uKXtcblxuICAgICAgICBjb25zb2xlLmxvZyh1cmwpO1xuICAgICAgICBjb25zb2xlLmxvZygkcHJvZ3Jlc3MpO1xuXG4gICAgICAgIC8vICoqKiBDQVNFIDBcbiAgICAgICAgLy8gU3RhdGU6IENsaXAgc2VsZWN0ZWQgZG9lcyB3YXMgbm90IGNyZWF0ZWQgeWV0XG4gICAgICAgIC8vIEFjdGlvbjogQ3JlYXRlIHRoZSBjbGlwXG4gICAgICAgIGlmKCFzb3VuZE1hbmFnZXIuZ2V0U291bmRCeUlkKHVybCkpIHtcblxuICAgICAgICAgICAgLy8gQ2FzZSAwLmE6IE5vIGNsaXAgaXMgY3VycmVudGx5IHBsYXlpbmdcbiAgICAgICAgICAgICAgICAvLyBkbyBub3RoaW5nXG4gICAgICAgICAgICAvLyBDYXNlIDAuYjogQW5vdGhlciBDbGlwIGV4aXN0cyBhbmQgaXMgc3RpbGwgcGxheWluZyAvIGJ1ZmZlcmluZ1xuICAgICAgICAgICAgaWYgKHN0YXRlTWFwLmF1ZGlvICYmIHN0YXRlTWFwLmF1ZGlvLnBsYXlTdGF0ZSA9PT0gMSl7XG4gICAgICAgICAgICAgICAgLy9wYXVzZSB0aGUgcHJldmlvdXMgY2xpcFxuICAgICAgICAgICAgICAgIHN0YXRlTWFwLmF1ZGlvLnBhdXNlKCk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHN0YXRlTWFwLnVybCA9IHVybDtcbiAgICAgICAgICAgIHNldEpxdWVyeU1hcCgkcHJvZ3Jlc3MsICRkZXNjcmlwdGlvbik7XG5cbiAgICAgICAgICAgIC8vQ3JlYXRlIHRoZSBzb3VuZCwgYXNzaWduIGl0IHRvIHN0YXRlTWFwLCBhbmQgYXV0b3BsYXlcbiAgICAgICAgICAgIHN0YXRlTWFwLmF1ZGlvID0gbWFrZVNvdW5kKHN0YXRlTWFwLnVybCwgdHJ1ZSk7XG4gICAgICAgIH0gZWxzZSB7XG5cbiAgICAgICAgICAgIC8vICoqKiBDYXNlIDFcbiAgICAgICAgICAgIC8vIFN0YXRlOiBDbGlwIHNlbGVjdGVkIGluZGVlZCBleGlzdHM7IHN0YXRlTWFwLmF1ZGlvIHRoZW4gbXVzdCBleGlzdFxuICAgICAgICAgICAgLy8gQWN0aW9uOiBDaGVjayBpZiBpdCBpcyB0aGUgc2FtZSBjbGlwIGZyb20gYmVmb3JlXG4gICAgICAgICAgICB2YXIgc291bmQgPSBzb3VuZE1hbmFnZXIuZ2V0U291bmRCeUlkKHVybCk7XG5cbiAgICAgICAgICAgIC8vIENhc2UgMWE6IHRoaXMgaXMgdGhlIHNhbWUgY2xpcFxuICAgICAgICAgICAgLy8gSW4gdGhpcyBjYXNlIGF1ZGlvLCB1cmwsIGFuZCAkcGxheWVyIGFyZSBpZGVudGljYWwgc28gc2ltcGx5IHRvZ2dsZSB0aGUgcGxheWluZyBzdGF0ZVxuICAgICAgICAgICAgaWYoc3RhdGVNYXAuYXVkaW8uaWQgIT09IHNvdW5kLmlkKXtcbiAgICAgICAgICAgICAgICAvLyBDYXNlIDFiOiB0aGlzIGlzIGEgZGlmZmVyZW50IGNsaXBcbiAgICAgICAgICAgICAgICAvLyBQYXVzZSBwcmV2aW91c2x5IHBsYXlpbmcgY2xpcFxuICAgICAgICAgICAgICAgIHN0YXRlTWFwLmF1ZGlvLnBhdXNlKCk7XG5cbiAgICAgICAgICAgICAgICAvL3VwZGF0ZSB0aGUgc3RhdGVNYXAgdG8gcmVmbGVjdCB0aGUgbmV3IG9iamVjdFxuICAgICAgICAgICAgICAgIHN0YXRlTWFwLmF1ZGlvID0gc291bmQ7XG4gICAgICAgICAgICAgICAgc3RhdGVNYXAudXJsID0gc291bmQuaWQ7XG4gICAgICAgICAgICAgICAgc2V0SnF1ZXJ5TWFwKCRwcm9ncmVzcywgJGRlc2NyaXB0aW9uKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgdG9nZ2xlUGxheWVyKCk7XG4gICAgICAgIH1cbiAgICB9O1xuICAgIC8vLS0tLS0tLS0tLS0tLS0tLS0tLSBFTkQgUFVCTElDIE1FVEhPRFMgLS0tLS0tLS0tLS0tLS0tLS0tLVxuXG4gICAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoJ2xvYWQnLCBpbml0TW9kdWxlLCBmYWxzZSk7XG5cbiAgICByZXR1cm4ge1xuICAgICAgICBvbkNsaWNrUGxheWVyOiBvbkNsaWNrUGxheWVyXG4gICAgfTtcbn0oKSk7XG5cbm1vZHVsZS5leHBvcnRzID0gYXVkaW87XG5cbiIsIi8qXG4gKiBtYWluLmpzXG4gKiBFbnRyeSBwb2ludCBmb3Igc2hlbGxhYyBhcHBcbiovXG4vKiBnbG9iYWwgJCwgZG9jdW1lbnQsIFNUQVRJQ19VUkwsIE1FRElBX1VSTCAqL1xuJ3VzZSBzdHJpY3QnO1xuJCggZG9jdW1lbnQgKS5yZWFkeShmdW5jdGlvbigpIHtcbiAgICB2YXIgc2hlbGxhYyA9IHJlcXVpcmUoJy4vc2hlbGxhYy5qcycpO1xuICAgIHNoZWxsYWMuaW5pdE1vZHVsZSgkKFwiI3NoZWxsYWMtYXBwXCIpLCBTVEFUSUNfVVJMLCBNRURJQV9VUkwsIHVzZXJuYW1lKTtcbn0pO1xuXG4iLCIvKlxuICogc2hlbGxhYy5qc1xuICogUm9vdCBuYW1lc3BhY2UgbW9kdWxlXG4qL1xuLyogZ2xvYmFsICQsIHdpbmRvdywgQXVkaW9Db250ZXh0LCBYTUxIdHRwUmVxdWVzdCAqL1xuJ3VzZSBzdHJpY3QnO1xuXG52YXIgc2hlbGxhYyA9IChmdW5jdGlvbiAoKSB7XG5cbiAgICAvLy0tLS0tLS0tLS0tLS0tLS0gQkVHSU4gTU9EVUxFIERFUEVOREVOQ0lFUyAtLS0tLS0tLS0tLS0tLVxuICAgIHZhciBtb21lbnQgPSByZXF1aXJlKCdtb21lbnQnKSxcbiAgICAgICAgVEFGRlkgPSByZXF1aXJlKCd0YWZmeWRiJykudGFmZnksXG4gICAgICAgIGF1ZGlvID0gcmVxdWlyZSgnLi9hdWRpby5qcycpLFxuICAgICAgICB1dGlsID0gcmVxdWlyZSgnLi91dGlsLmpzJyk7XG5cbiAgICAvLy0tLS0tLS0tLS0tLS0tLS0gRU5EIE1PRFVMRSBERVBFTkRFTkNJRVMgLS0tLS0tLS0tLS0tLS1cblxuICAgIC8vLS0tLS0tLS0tLS0tLS0tLSBCRUdJTiBNT0RVTEUgU0NPUEUgVkFSSUFCTEVTIC0tLS0tLS0tLS0tLS0tXG4gICAgdmFyXG4gICAgaW5pdE1vZHVsZSxcblxuICAgIGNvbmZpZ01hcCA9IHtcbiAgICAgICAgbWFpbl9odG1sOiBTdHJpbmcoKSArXG4gICAgICAgICAgICAnPGRpdiBjbGFzcz1cImNvbC1zbS0zIGNvbC1tZC0yIHNoZWxsYWMtYXBwIHNpZGViYXJcIj4nICtcblxuICAgICAgICAgICAgICAgICc8ZGl2IGNsYXNzPVwicGFuZWwtZ3JvdXBcIiBpZD1cImFjY29yZGlvblwiPicgK1xuXG4gICAgICAgICAgICAgICAgICAgICc8ZGl2IGNsYXNzPVwicGFuZWwgcGFuZWwtZGVmYXVsdFwiPicgK1xuICAgICAgICAgICAgICAgICAgICAgICAgJzxkaXYgY2xhc3M9XCJwYW5lbC1oZWFkaW5nXCI+JyArXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgJzxhIGRhdGEtdG9nZ2xlPVwiY29sbGFwc2VcIiBkYXRhLXBhcmVudD1cIiNhY2NvcmRpb25cIiBocmVmPVwiI2NvbGxhcHNlQ2F0ZWdvcmllc1wiPicgK1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAnQ2F0ZWdvcmllcycgK1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICc8L2E+JyArXG4gICAgICAgICAgICAgICAgICAgICAgICAnPC9kaXY+JyArXG4gICAgICAgICAgICAgICAgICAgICAgICAnPGRpdiBpZD1cImNvbGxhcHNlQ2F0ZWdvcmllc1wiIGNsYXNzPVwicGFuZWwtY29sbGFwc2UgY29sbGFwc2VcIj4nICtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAnPGRpdiBjbGFzcz1cInBhbmVsLWJvZHlcIj4nICtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJzxkaXYgY2xhc3M9XCJzaGVsbGFjLWFwcCBuYXYgbmF2LXNpZGViYXIgbGlzdC1ncm91cFwiPjwvZGl2PicgK1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICc8L2Rpdj4nICtcbiAgICAgICAgICAgICAgICAgICAgICAgICc8L2Rpdj4nICtcbiAgICAgICAgICAgICAgICAgICAgJzwvZGl2PicgK1xuXG4gICAgICAgICAgICAgICAgICAgICc8ZGl2IGNsYXNzPVwicGFuZWwgcGFuZWwtZGVmYXVsdFwiPicgK1xuICAgICAgICAgICAgICAgICAgICAgICAgJzxkaXYgY2xhc3M9XCJwYW5lbC1oZWFkaW5nXCI+JyArXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgJzxhIGRhdGEtdG9nZ2xlPVwiY29sbGFwc2VcIiBkYXRhLXBhcmVudD1cIiNhY2NvcmRpb25cIiBocmVmPVwiI2NvbGxhcHNlUGVvcGxlXCI+JyArXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICdQZW9wbGUnICtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAnPC9hPicgK1xuICAgICAgICAgICAgICAgICAgICAgICAgJzwvZGl2PicgK1xuICAgICAgICAgICAgICAgICAgICAgICAgJzxkaXYgaWQ9XCJjb2xsYXBzZVBlb3BsZVwiIGNsYXNzPVwicGFuZWwtY29sbGFwc2UgY29sbGFwc2VcIj4nICtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAnPGRpdiBjbGFzcz1cInBhbmVsLWJvZHlcIj4nICtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJy8vUGVyc29uIExpc3QgVE9ETycgK1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICc8L2Rpdj4nICtcbiAgICAgICAgICAgICAgICAgICAgICAgICc8L2Rpdj4nICtcbiAgICAgICAgICAgICAgICAgICAgJzwvZGl2PicgK1xuXG4gICAgICAgICAgICAgICAgJzwvZGl2PicgK1xuICAgICAgICAgICAgJzwvZGl2PicgK1xuXG4gICAgICAgICAgICAnPGRpdiBjbGFzcz1cImNvbC1zbS05IGNvbC1zbS1vZmZzZXQtMyBjb2wtbWQtMTAgY29sLW1kLW9mZnNldC0yIHNoZWxsYWMtYXBwIGNsaXAgY29udGVudFwiPjwvZGl2PicsXG5cbiAgICAgICAgdHJ1bmNhdGVtYXg6IDI1XG4gICAgfSxcblxuICAgIHN0YXRlTWFwID0ge1xuICAgICAgICAkY29udGFpbmVyOiB1bmRlZmluZWQsXG4gICAgICAgIHVzZXJuYW1lOiB1bmRlZmluZWQsXG5cbiAgICAgICAgU1RBVElDX1VSTDogdW5kZWZpbmVkLFxuICAgICAgICBNRURJQV9VUkw6IHVuZGVmaW5lZCxcblxuICAgICAgICBjYXRlZ29yaWVzOiB1bmRlZmluZWQsXG4gICAgICAgIGNhdGVnb3J5X2RiOiBUQUZGWSgpLFxuXG4gICAgICAgIGNsaXBzOiB1bmRlZmluZWQsXG4gICAgICAgIGNsaXBfZGI6IFRBRkZZKCksXG5cbiAgICAgICAgaXNQbGF5aW5nOiBmYWxzZVxuICAgIH0sXG5cbiAgICBqcXVlcnlNYXAgPSB7fSxcbiAgICBzZXRKcXVlcnlNYXAsXG5cbiAgICB1cmxQYXJzZSxcblxuICAgIHBhcnNlQ2F0ZWdvcnlEYXRhLCByZW5kZXJDYXRlZ29yaWVzLCBkaXNwbGF5X2NhdGVnb3JpZXMsXG4gICAgcGFyc2VDbGlwRGF0YSwgbG9hZENsaXBzLCBkaXNwbGF5X2NsaXBzLFxuXG4gICAgb25DbGlja0NhdGVnb3J5LFxuXG4gICAgUHViU3ViID0gdXRpbC5QdWJTdWI7XG5cbiAgICAvLy0tLS0tLS0tLS0tLS0tLS0gRU5EIE1PRFVMRSBTQ09QRSBWQVJJQUJMRVMgLS0tLS0tLS0tLS0tLS1cblxuICAgIC8vLS0tLS0tLS0tLS0tLS0tLS0tLS0tIEJFR0lOIE1PRFVMRSBTQ09QRSBNRVRIT0RTIC0tLS0tLS0tLS0tLS0tLS0tLS0tXG5cbiAgICBzZXRKcXVlcnlNYXAgPSBmdW5jdGlvbigpe1xuICAgICAgICB2YXIgJG91dGVyRGl2ID0gc3RhdGVNYXAuJGNvbnRhaW5lcjtcblxuICAgICAgICBqcXVlcnlNYXAgPSB7XG4gICAgICAgICAgICAkb3V0ZXJEaXYgICAgICAgICAgICAgICA6ICRvdXRlckRpdixcbiAgICAgICAgICAgICRuYXZfc2lkZWJhciAgICAgICAgICAgIDogJG91dGVyRGl2LmZpbmQoJy5zaGVsbGFjLWFwcC5zaWRlYmFyJyksXG4gICAgICAgICAgICAkbmF2X3NpZGViYXJfY2F0ZWdvcmllcyA6ICRvdXRlckRpdi5maW5kKCcuc2hlbGxhYy1hcHAuc2lkZWJhciAjY29sbGFwc2VDYXRlZ29yaWVzIC5zaGVsbGFjLWFwcC5uYXYubmF2LXNpZGViYXIubGlzdC1ncm91cCcpLFxuICAgICAgICAgICAgJG5hdl9zaWRlYmFyX3Blb3BsZSAgICAgOiAkb3V0ZXJEaXYuZmluZCgnLnNoZWxsYWMtYXBwLnNpZGViYXIgI2NvbGxhcHNlUGVvcGxlIC5zaGVsbGFjLWFwcC5uYXYubmF2LXNpZGViYXIubGlzdC1ncm91cCcpLFxuICAgICAgICAgICAgJGNsaXBfY29udGVudCAgICAgICAgICAgOiAkb3V0ZXJEaXYuZmluZCgnLnNoZWxsYWMtYXBwLmNsaXAuY29udGVudCcpXG4gICAgICAgIH07XG4gICAgfTtcblxuXG4gICAgLypcbiAgICAgKiBtZXRob2QgcmVuZGVyQ2F0ZWdvcmllczogbWFrZSBhbiBhcGkgY2FsbCB0byBnYXRoZXIgdGhlIENhdGVnb3JpZXMgaW4gZGF0YWJhc2VcbiAgICAgKiBwYXJhbWV0ZXJzXG4gICAgICogcmV0dXJuXG4gICAgICogICAqIGpzb25BcnJheSAtIGEgbGlzdCBvZiB2YWxpZCBKU09OIG9iamVjdHMgcmVwcmVzZW50aW5nXG4gICAgICogICBzZXJpYWxpemVkIENhdGVnb3J5IG9iamVjdHNcbiAgICAgKiovXG4gICAgcmVuZGVyQ2F0ZWdvcmllcyA9IGZ1bmN0aW9uKCl7XG5cbiAgICAgICAgdmFyIHVybCA9ICcvYXBpL2NhdGVnb3JpZXMvJztcbiAgICAgICAgJC5hamF4KHtcbiAgICAgICAgICAgIHVybDogdXJsXG4gICAgICAgIH0pXG4gICAgICAgICAgICAuZG9uZShmdW5jdGlvbihjYXRlZ29yaWVzKXtcbiAgICAgICAgICAgICAgICBzdGF0ZU1hcC5jYXRlZ29yeV9kYi5pbnNlcnQocGFyc2VDYXRlZ29yeURhdGEoY2F0ZWdvcmllcy5yZXN1bHRzKSk7XG4gICAgICAgICAgICAgICAgc3RhdGVNYXAuY2F0ZWdvcmllcyA9IHN0YXRlTWFwLmNhdGVnb3J5X2RiKCkuZ2V0KCk7XG4gICAgICAgICAgICAgICAgUHViU3ViLmVtaXQoXCJjYXRlZ29yeUxvYWRDb21wbGV0ZVwiKTtcbiAgICAgICAgICAgIH0pXG4gICAgICAgICAgICAuZmFpbChmdW5jdGlvbigpe1xuICAgICAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoXCJDb3VsZCBub3QgbG9hZCBDbGlwIGFyY2hpdmVcIik7XG4gICAgICAgICAgICB9KVxuICAgICAgICAgICAgLmFsd2F5cyhmdW5jdGlvbigpe1xuXG4gICAgICAgICAgICB9KTtcbiAgICB9O1xuXG5cbiAgICAvKlxuICAgICAqIG1ldGhvZCBsb2FkQ2xpcHM6IG1ha2UgYW4gYXBpIGNhbGwgdG8gZ2F0aGVyIHRoZSBDbGlwcyBpbiBkYXRhYmFzZVxuICAgICAqIEBwYXJhbSBzdGF0dXMgdHlwZSBvZiBSZWxhdGlvbnNoaXBcbiAgICAgKiBAcGFyYW0gdXNlcm5hbWUgdXNlcm5hbWUgb2YgdGhlIGludGVuZGVkIHRhcmdldCBQZXJzb25cbiAgICAgKiBAcmV0dXJuIGpzb25BcnJheSBsaXN0IG9mIHZhbGlkIEpTT04gb2JqZWN0cyByZXByZXNlbnRpbmcgc2VyaWFsaXplZCBDbGlwIG9iamVjdHNcbiAgICAgKiovXG4gICAgbG9hZENsaXBzID0gZnVuY3Rpb24oc3RhdHVzLCB1c2VybmFtZSl7XG5cbiAgICAgICAgdmFyIHVybCA9IFsnL2FwaS9jbGlwcycsIHN0YXR1cywgdXNlcm5hbWUsIFwiXCJdLmpvaW4oJy8nKTtcblxuICAgICAgICAkLmFqYXgoe1xuICAgICAgICAgICAgdXJsOiB1cmxcbiAgICAgICAgfSlcbiAgICAgICAgICAgIC5kb25lKGZ1bmN0aW9uKGNsaXBzKXtcbiAgICAgICAgICAgICAgICBzdGF0ZU1hcC5jbGlwX2RiLmluc2VydChwYXJzZUNsaXBEYXRhKGNsaXBzKSk7XG4gICAgICAgICAgICAgICAgc3RhdGVNYXAuY2xpcHMgPSBzdGF0ZU1hcC5jbGlwX2RiKCkub3JkZXIoXCJpZCBkZXNjXCIpLmdldCgpO1xuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKHN0YXRlTWFwLmNsaXBzKTtcbiAgICAgICAgICAgICAgICBQdWJTdWIuZW1pdChcImNsaXBMb2FkQ29tcGxldGVcIik7XG4gICAgICAgICAgICB9KVxuICAgICAgICAgICAgLmZhaWwoZnVuY3Rpb24oKXtcbiAgICAgICAgICAgICAgICBjb25zb2xlLmVycm9yKFwiQ291bGQgbm90IGxvYWQgQ2xpcCBhcmNoaXZlXCIpO1xuICAgICAgICAgICAgfSlcbiAgICAgICAgICAgIC5hbHdheXMoZnVuY3Rpb24oKXtcblxuICAgICAgICAgICAgfSk7XG4gICAgfTtcblxuICAgIC8qKlxuICAgICAqIG1ldGhvZCBwYXJzZUNhdGVnb3J5RGF0YTogdHJhbnNmb3JtIGFueSBDYXRlZ29yeSBmaWVsZHMgdG8gamF2YXNjcmlwdC1jb21wYXRpYmxlXG4gICAgICogcGFyYW1ldGVyc1xuICAgICAqICAgKiByYXcgLSBhIHN0cmluZyBkZXNjcmliaW5nIGFuIGFycmF5IG9mIHZhbGlkIEpTT05cbiAgICAgKiByZXR1cm5cbiAgICAgKiAgICoganNvbkFycmF5IC0gYSBsaXN0IG9mIHZhbGlkIEpTT04gb2JqZWN0c1xuICAgICAqL1xuICAgIHBhcnNlQ2F0ZWdvcnlEYXRhID0gZnVuY3Rpb24ocmF3KXtcbiAgICAgICAgdmFyIGpzb25BcnJheTtcblxuICAgICAgICBqc29uQXJyYXkgPSByYXcubWFwKGZ1bmN0aW9uKGpzb25PYmope1xuXG4gICAgICAgICAgICB0cnl7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGpzb25PYmo7XG4gICAgICAgICAgICB9Y2F0Y2goZXJyKXtcbiAgICAgICAgICAgICAgICBjb25zb2xlLmVycm9yKGVycik7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgICAgICByZXR1cm4ganNvbkFycmF5O1xuICAgIH07XG5cbiAgICAvKipcbiAgICAqIHBhcnNlQ2xpcERhdGE6IHRyYW5zZm9ybSBhbnkgQ2xpcCBmaWVsZHMgdG8gamF2YXNjcmlwdC1jb21wYXRpYmxlXG4gICAgKiBAcGFyYW0gcmF3IGEgc3RyaW5nIGRlc2NyaWJpbmcgYW4gYXJyYXkgb2YgdmFsaWQgSlNPTlxuICAgICogQHJldHVybiBqc29uQXJyYXkgLSBhIGxpc3Qgb2YgdmFsaWQgSlNPTiBvYmplY3RzXG4gICAgKi9cbiAgICBwYXJzZUNsaXBEYXRhID0gZnVuY3Rpb24ocmF3KXtcbiAgICAgICAgdmFyIGpzb25BcnJheTtcblxuICAgICAgICBqc29uQXJyYXkgPSByYXcubWFwKGZ1bmN0aW9uKGpzb25PYmope1xuXG4gICAgICAgICAgICB0cnl7XG4gICAgICAgICAgICAgICAganNvbk9iai5jcmVhdGVkID0gbW9tZW50KGpzb25PYmouY3JlYXRlZCk7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGpzb25PYmo7XG4gICAgICAgICAgICB9Y2F0Y2goZXJyKXtcbiAgICAgICAgICAgICAgICBjb25zb2xlLmVycm9yKGVycik7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgICAgICByZXR1cm4ganNvbkFycmF5O1xuICAgIH07XG5cbiAgICAvKlxuICAgICAqIG1ldGhvZCB1cmxQYXJzZTogZXh0cmFjdCB0aGUgdmFyaW91cyBhc3BlY3RzIG9mIHRoZSB1cmwgZnJvbSBhIEh5cGVybGlua2VkUmVsYXRlZEZpZWxkXG4gICAgICogcHJlY29uZGl0aW9uOiByZXF1aXJlcyBhIEh5cGVybGlua2VkUmVsYXRlZEZpZWxkIG9mIHRoZSBmb3JtIHByb3RvY29sOmhvc3QvYXBpL29iamVjdC9way9cbiAgICAgKiBwYXJhbWV0ZXJzXG4gICAgICogICAqIHVybCAtIHRoZSB1cmwgb2YgdGhlIHJlc291cmNlXG4gICAgICogcmV0dXJuXG4gICAgICogICAqIFVSTG9iaiAtIGFuIG9iamVjdCBsaXRlcmFsIHdpdGggZmllbGRzIHByb3RvY29sLCBob3N0LCBhcGksIG9iamVjdCwgYW5kIHBrXG4gICAgICoqL1xuICAgIHVybFBhcnNlID0gZnVuY3Rpb24odXJsKXtcbiAgICAgICAgdmFyIFVSTCA9IHt9LFxuICAgICAgICAgICAgdSA9IHVybCB8fCAnJyxcbiAgICAgICAgICAgIHBhcnRzO1xuXG4gICAgICAgIHBhcnRzID0gdS5zcGxpdCgnLycpO1xuXG4gICAgICAgIHRyeXtcbiAgICAgICAgICAgIFVSTC5wcm90b2NvbCA9IHBhcnRzWzBdO1xuICAgICAgICAgICAgVVJMLmhvc3QgPSBwYXJ0c1syXS5zcGxpdCgnOicpWzBdO1xuICAgICAgICAgICAgVVJMLm9iamVjdCA9IHBhcnRzWzRdO1xuICAgICAgICAgICAgVVJMLnBrID0gcGFydHNbNV07XG5cbiAgICAgICAgfSBjYXRjaCAoZSkge1xuICAgICAgICAgICAgdGhyb3cgXCJJbXByb3BlciB1cmwgZm9ybWF0IGVudGVyZWRcIjtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gVVJMO1xuICAgIH07XG5cblxuICAgIC8vLS0tLS0tLS0tLS0tLS0tLS0tLS0tIEVORCBNT0RVTEUgU0NPUEUgTUVUSE9EUyAtLS0tLS0tLS0tLS0tLS0tLS0tLVxuXG5cbiAgICAvLy0tLS0tLS0tLS0tLS0tLS0tLS0tLSBCRUdJTiBET00gTUVUSE9EUyAtLS0tLS0tLS0tLS0tLS0tLS0tLVxuXG5cblxuICAgIGRpc3BsYXlfY2F0ZWdvcmllcyA9IGZ1bmN0aW9uKCl7XG5cbiAgICAgICAgdmFyIGFsbF9hbmNob3IgPSBTdHJpbmcoKSxcbiAgICAgICAgICAgIGl0ZW1zID0gU3RyaW5nKCksXG4gICAgICAgICAgICBjbGlwX2xpc3QgPSBbXTtcbiAgICAgICAganF1ZXJ5TWFwLiRuYXZfc2lkZWJhcl9jYXRlZ29yaWVzLmFwcGVuZChhbGxfYW5jaG9yKTtcblxuICAgICAgICBzdGF0ZU1hcC5jYXRlZ29yaWVzLmZvckVhY2goZnVuY3Rpb24ob2JqZWN0KXtcbiAgICAgICAgICAgIGl0ZW1zICs9XG4gICAgICAgICAgICAgICAgJzxhIGNsYXNzPVwibGlzdC1ncm91cC1pdGVtIG5hdi1zaWRlYmFyLWNhdGVnb3J5XCIgaHJlZj1cIiNcIj4nICsgJzxzcGFuIGNsYXNzPVwiYmFkZ2VcIj4nICsgb2JqZWN0LmNsaXBzLmxlbmd0aCArICc8L3NwYW4+JyArXG4gICAgICAgICAgICAgICAgICAgICc8aDUgY2xhc3M9XCJsaXN0LWdyb3VwLWl0ZW0taGVhZGluZ1wiIGlkPVwiJyArIG9iamVjdC5zbHVnICsgJ1wiPicgKyBvYmplY3QudGl0bGUgKyAnPC9oNT4nICtcbiAgICAgICAgICAgICAgICAnPC9hPic7XG5cbiAgICAgICAgICAgIHZhciBmaWx0ZXJlZCA9IG9iamVjdC5jbGlwcy5maWx0ZXIoZnVuY3Rpb24oaWQpe1xuICAgICAgICAgICAgICAgIHJldHVybiBjbGlwX2xpc3QuaW5kZXhPZihpZCkgPT09IC0xO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICBjbGlwX2xpc3QgPSBjbGlwX2xpc3QuY29uY2F0KGZpbHRlcmVkKTtcbiAgICAgICAgfSk7XG5cbiAgICAgICAgYWxsX2FuY2hvciArPVxuICAgICAgICAgICAgJzxhIGNsYXNzPVwibGlzdC1ncm91cC1pdGVtIG5hdi1zaWRlYmFyLWNhdGVnb3J5IGFjdGl2ZVwiIGhyZWY9XCIjXCI+JyArICc8c3BhbiBjbGFzcz1cImJhZGdlXCI+JyArIGNsaXBfbGlzdC5sZW5ndGggKyAnPC9zcGFuPicgK1xuICAgICAgICAgICAgICAgICc8aDUgY2xhc3M9XCJsaXN0LWdyb3VwLWl0ZW0taGVhZGluZ1wiIGlkPVwiYWxsXCI+QUxMPC9oNT4nICtcbiAgICAgICAgICAgICc8L2E+JztcblxuICAgICAgICBqcXVlcnlNYXAuJG5hdl9zaWRlYmFyX2NhdGVnb3JpZXMuYXBwZW5kKGFsbF9hbmNob3IsIGl0ZW1zKTtcblxuICAgICAgICAvL3JlZ2lzdGVyIGxpc3RlbmVyc1xuICAgICAgICAkKCcubGlzdC1ncm91cC1pdGVtLWhlYWRpbmcnKS5vbignY2xpY2snLCBvbkNsaWNrQ2F0ZWdvcnkpO1xuICAgIH07XG5cblxuICAgIGRpc3BsYXlfY2xpcHMgPSBmdW5jdGlvbigpe1xuXG4gICAgICAgIGpxdWVyeU1hcC4kY2xpcF9jb250ZW50Lmh0bWwoXCJcIik7XG4gICAgICAgIHN0YXRlTWFwLmNsaXBzLmZvckVhY2goZnVuY3Rpb24ob2JqZWN0KXtcblxuICAgICAgICAgICAgdmFyIGNsaXAgPSBTdHJpbmcoKSArXG4gICAgICAgICAgICAgICAgJzxkaXYgY2xhc3M9XCJjb2wteHMtNiBjb2wtc20tNiBjb2wtbWQtNiBjb2wtbGctNCBtZWRpYSBjbGlwXCI+JyArXG4gICAgICAgICAgICAgICAgICAgICc8ZGl2IGNsYXNzPVwidWkzNjBcIj4nICtcblxuICAgICAgICAgICAgICAgICAgICAgICAgLy9CRUdJTiAkcGxheWVyXG4gICAgICAgICAgICAgICAgICAgICAgICAnPHNwYW4gY2xhc3M9XCJtZWRpYS11cmxcIiBkYXRhLWNsaXAtdXJsPVwiJyArIHN0YXRlTWFwLk1FRElBX1VSTCArIG9iamVjdC5hdWRpb19maWxlICsgJ1wiPicgK1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICc8aW1nIGNsYXNzPVwibWVkaWEtaW1nIGltZy1yZXNwb25zaXZlXCIgc3JjPVwiJyArIHN0YXRlTWFwLk1FRElBX1VSTCArIG9iamVjdC5icmFuZCArICdcIiBhbHQ9XCInICsgb2JqZWN0LnRpdGxlICsgJ1wiIC8+JyArXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgJzxkaXYgY2xhc3M9XCJtZWRpYS1kZXNjcmlwdGlvblwiPicgK1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAnPHNwYW4gY2xhc3M9XCJtZWRpYS1kZXNjcmlwdGlvbi1jb250ZW50IGxlYWRcIj4nICsgdXRpbC50cnVuY2F0ZShvYmplY3QudGl0bGUsIGNvbmZpZ01hcC50cnVuY2F0ZV9tYXgpICsgJzwvc3Bhbj48YnIvPicgK1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAnPHNwYW4gY2xhc3M9XCJtZWRpYS1kZXNjcmlwdGlvbi1jb250ZW50XCI+PGVtPicgKyB1dGlsLnRydW5jYXRlKG9iamVjdC5kZXNjcmlwdGlvbiwgY29uZmlnTWFwLnRydW5jYXRlX21heCkgKyAnPC9lbT48L3NwYW4+PGJyLz4nICtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJzxzcGFuIGNsYXNzPVwibWVkaWEtZGVzY3JpcHRpb24tY29udGVudFwiPjxzbWFsbD4nICsgb2JqZWN0Lm93bmVyICsgXCIgIC0tIFwiICsgb2JqZWN0LmNyZWF0ZWQuX2QudG9EYXRlU3RyaW5nKCkgKyAnPC9zbWFsbD48L3NwYW4+PGJyLz4nICtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAnPC9kaXY+JyArXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgJzxkaXYgY2xhc3M9XCJtZWRpYS1wcm9ncmVzc1wiPjwvZGl2PicgK1xuICAgICAgICAgICAgICAgICAgICAgICAgJzwvc3Bhbj4nICtcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vRU5EICRwbGF5ZXJcblxuICAgICAgICAgICAgICAgICAgICAnPC9kaXY+JyArXG4gICAgICAgICAgICAgICAgJzwvZGl2Pic7XG5cbiAgICAgICAgICAgIGpxdWVyeU1hcC4kY2xpcF9jb250ZW50LmFwcGVuZChjbGlwKTtcblxuXG4gICAgICAgIH0pO1xuICAgICAgICAkKCcubWVkaWEuY2xpcCAubWVkaWEtdXJsJykub24oJ2NsaWNrJywgZnVuY3Rpb24oZSl7XG4gICAgICAgICAgICB2YXIgdXJsID0gJCh0aGlzKS5hdHRyKCdkYXRhLWNsaXAtdXJsJyksXG4gICAgICAgICAgICAgICAgJHByb2dyZXNzID0gJCh0aGlzKS5maW5kKCcubWVkaWEtcHJvZ3Jlc3MnKSxcbiAgICAgICAgICAgICAgICAkZGVzY3JpcHRpb24gPSAkKHRoaXMpLmZpbmQoJy5tZWRpYS1kZXNjcmlwdGlvbicpO1xuXG4gICAgICAgICAgICBhdWRpby5vbkNsaWNrUGxheWVyKHVybCwgJHByb2dyZXNzLCAkZGVzY3JpcHRpb24pO1xuICAgICAgICB9KTtcbiAgICB9O1xuXG4gICAgLy8tLS0tLS0tLS0tLS0tLS0tLS0tLS0gRU5EIERPTSBNRVRIT0RTIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cblxuICAgIC8vLS0tLS0tLS0tLS0tLS0tLS0tLSBCRUdJTiBFVkVOVCBIQU5ETEVSUyAtLS0tLS0tLS0tLS0tLS0tLS0tXG4gICAgLy8gQmVnaW4gRXZlbnQgaGFuZGxlciAvb25DbGlja0NhdGVnb3J5L1xuICAgIC8vIFB1cnBvc2UgICAgOiBIYW5kbGVzIHRoZSBldmVudCBmb3Igc2lkZWJhciBjYXRlZ29yeSBzZWxlY3Rpb25cbiAgICAvLyBBcmd1bWVudHMgIDpcbiAgICAvLyBTZXR0aW5ncyAgIDogbm9uZVxuICAgIC8vIFJldHVybnMgICAgOlxuICAgIC8vIEFjdGlvbnMgICAgOiBTaG91bGQgc2lnbmFsIHRvIGF1ZGlvIG1vZHVsZSB0byB1cGRhdGUgcHJvZ3Jlc3MgYmFyIHN0YXRlIGZvciBlYWNoIGNsaXBcbiAgICAvLyAgICogYmluZHMgdG8gY2F0ZWdvcnkgRE9NIGVsZW1lbnRzIGFuZCByZWxvYWRzIGNvcnJlc3BvbmRpbmcgY2xpcHMgaW50b1xuICAgIC8vICAgICBzdGF0ZU1hcC5jbGlwc1xuICAgIG9uQ2xpY2tDYXRlZ29yeSA9IGZ1bmN0aW9uKGV2ZW50KXtcblxuICAgICAgICB2YXIgY2F0ZWdvcnlfb2JqZWN0O1xuXG4gICAgICAgIC8vZW1wdHkgdGhlIGNsaXAgYXJyYXlcbiAgICAgICAgc3RhdGVNYXAuY2xpcHMgPSBbXTtcblxuICAgICAgICAvL3JlZmlsbCB0aGUgZW1wdHkgdGhlIGNsaXAgYXJyYXlcbiAgICAgICAgaWYoZXZlbnQudGFyZ2V0LmlkID09PSBcImFsbFwiKXtcbiAgICAgICAgICAgIHN0YXRlTWFwLmNsaXBzID0gc3RhdGVNYXAuY2xpcF9kYigpLmdldCgpO1xuXG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBjYXRlZ29yeV9vYmplY3QgPSBzdGF0ZU1hcC5jYXRlZ29yeV9kYih7c2x1ZzogZXZlbnQudGFyZ2V0LmlkfSkuZmlyc3QoKTtcblxuICAgICAgICAgICAgLy9wdXNoIGluIGFueSBtYXRjaGluZyBjbGlwIGlkIGZyb20gdGhlIHVybFxuICAgICAgICAgICAgc3RhdGVNYXAuY2xpcHMgPSBjYXRlZ29yeV9vYmplY3QuY2xpcHMubWFwKGZ1bmN0aW9uKGNsaXBfdXJsKXtcbiAgICAgICAgICAgICAgICB2YXIgVVJMID0gdXJsUGFyc2UoY2xpcF91cmwpO1xuICAgICAgICAgICAgICAgIHJldHVybiBzdGF0ZU1hcC5jbGlwX2RiKHtpZDogcGFyc2VJbnQoVVJMLnBrKX0pLmZpcnN0KCk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgICAgICBkaXNwbGF5X2NsaXBzKCk7XG4gICAgICAgIHV0aWwuUHViU3ViLmVtaXQoXCJzaGVsbGFjLWNhdGVnb3J5Y2hhbmdlXCIsXG4gICAgICAgICAgICBzdGF0ZU1hcC5jbGlwcy5tYXAoZnVuY3Rpb24oY2xpcCl7cmV0dXJuIGNsaXAuYXVkaW9fZmlsZTt9KVxuICAgICAgICApO1xuICAgIH07XG5cblxuXG4gICAgLy8tLS0tLS0tLS0tLS0tLS0tLS0tLSBFTkQgRVZFTlQgSEFORExFUlMgLS0tLS0tLS0tLS0tLS0tLS0tLS1cblxuICAgIC8vLS0tLS0tLS0tLS0tLS0tLS0tLSBCRUdJTiBQVUJMSUMgTUVUSE9EUyAtLS0tLS0tLS0tLS0tLS0tLS0tXG4gICAgLy8gaW5pdE1vZHVsZSAvLyAgIFBvcHVsYXRlcyAkY29udGFpbmVyIHdpdGggdGhlIHNoZWxsIG9mIHRoZSBVSVxuICAgIC8vICAgYW5kIHRoZW4gY29uZmlndXJlcyBhbmQgaW5pdGlhbGl6ZXMgZmVhdHVyZSBtb2R1bGVzLlxuICAgIC8vICAgVGhlIFNoZWxsIGlzIGFsc28gcmVzcG9uc2libGUgZm9yIGJyb3dzZXItd2lkZSBpc3N1ZXNcbiAgICAvLyAgIERpcmVjdHMgdGhpcyBhcHAgdG8gb2ZmZXIgaXRzIGNhcGFiaWxpdHkgdG8gdGhlIHVzZXJcbiAgICAvLyBAcGFyYW0gJGNvbnRhaW5lciBBIGpRdWVyeSBjb2xsZWN0aW9uIHRoYXQgc2hvdWxkIHJlcHJlc2VudFxuICAgIC8vIGEgc2luZ2xlIERPTSBjb250YWluZXJcbiAgICAvLyBAcGFyYW0gTUVESUFfVVJMIERqYW5nbyBtZWRpYSB1cmwgcHJlZml4IChzZXR0aW5ncy5NRURJQV9VUkwpXG4gICAgLy8gQHBhcmFtIFNUQVRJQ19VUkwgRGphbmdvIHN0YXRpYyB1cmwgcHJlZml4IChzZXR0aW5ncy5TVEFUSUNfVVJMKVxuICAgIC8vIEBwYXJhbSB1c2VybmFtZSBhY2NvdW50IGhvbGRlciB1c2VybmFtZSBmb3IgcmV0cmlldmluZyBjbGlwc1xuXG4gICAgaW5pdE1vZHVsZSA9IGZ1bmN0aW9uKCAkY29udGFpbmVyLCBTVEFUSUNfVVJMLCBNRURJQV9VUkwsIHVzZXJuYW1lKXtcbiAgICAgICAgLy8gbG9hZCBIVE1MIGFuZCBtYXAgalF1ZXJ5IGNvbGxlY3Rpb25zXG4gICAgICAgIHN0YXRlTWFwLiRjb250YWluZXIgPSAkY29udGFpbmVyO1xuICAgICAgICBzdGF0ZU1hcC51c2VybmFtZSA9IHVzZXJuYW1lO1xuICAgICAgICBzdGF0ZU1hcC4kbmF2X3NpZGViYXIgPSAkY29udGFpbmVyLnBhcmVudDtcbiAgICAgICAgc3RhdGVNYXAuU1RBVElDX1VSTCA9IFNUQVRJQ19VUkw7XG4gICAgICAgIHN0YXRlTWFwLk1FRElBX1VSTCA9IE1FRElBX1VSTDtcblxuICAgICAgICAkY29udGFpbmVyLmh0bWwoIGNvbmZpZ01hcC5tYWluX2h0bWwgKTtcbiAgICAgICAgc2V0SnF1ZXJ5TWFwKCk7XG5cbiAgICAgICAgLy9yZWdpc3RlciBwdWItc3ViIG1ldGhvZHNcbiAgICAgICAgUHViU3ViLm9uKFwiY2xpcExvYWRDb21wbGV0ZVwiLCBkaXNwbGF5X2NsaXBzKTtcbiAgICAgICAgUHViU3ViLm9uKFwiY2F0ZWdvcnlMb2FkQ29tcGxldGVcIiwgZGlzcGxheV9jYXRlZ29yaWVzKTtcblxuICAgICAgICAvL2xvYWQgZGF0YSBpbnRvIGluLWJyb3dzZXIgZGF0YWJhc2VcbiAgICAgICAgbG9hZENsaXBzKFwiZm9sbG93aW5nXCIsIHVzZXJuYW1lKTtcbiAgICAgICAgcmVuZGVyQ2F0ZWdvcmllcygpO1xuXG4vLyAgICAgICAgY29uc29sZS5sb2coJGNvbnRhaW5lcik7XG4gICAgfTtcblxuICAgIHJldHVybiB7IGluaXRNb2R1bGU6IGluaXRNb2R1bGUgfTtcbn0oKSk7XG5cbm1vZHVsZS5leHBvcnRzID0gc2hlbGxhYztcblxuIiwiLypcbiAqIHV0aWwuanNcbiAqIFV0aWxpdGllcyBmb3IgdGhlIEF1ZGlvIGFwcFxuKi9cbi8qIGdsb2JhbCAqL1xuJ3VzZSBzdHJpY3QnO1xuXG52YXIgdXRpbCA9IChmdW5jdGlvbiAoKSB7XG5cbiAgICB2YXIgUHViU3ViLCB0cnVuY2F0ZTtcblxuICAgIC8vLS0tLS0tLS0tLS0tLS0tLSBCRUdJTiBNT0RVTEUgREVQRU5ERU5DSUVTIC0tLS0tLS0tLS0tLS0tXG5cbiAgICAvLy0tLS0tLS0tLS0tLS0tLS0gRU5EIE1PRFVMRSBERVBFTkRFTkNJRVMgLS0tLS0tLS0tLS0tLS1cblxuICAgIC8vLS0tLS0tLS0tLS0tLS0tLS0tLS0gRU5EIEVWRU5UIEhBTkRMRVJTIC0tLS0tLS0tLS0tLS0tLS0tLS0tXG5cbiAgICAvLy0tLS0tLS0tLS0tLS0tLS0tLS0gQkVHSU4gUFVCTElDIE1FVEhPRFMgLS0tLS0tLS0tLS0tLS0tLS0tLVxuICAgIC8vIEJlZ2luIFB1YmxpYyBtZXRob2QgL1B1YlN1Yi9cbiAgICAvLyBFeGFtcGxlICAgOiBQdWJTdWIub24oJ2JhcmsnLCBnZXREb2cgKTsgUHViU3ViLmVtaXQoJ2JhcmsnKTtcbiAgICAvLyBQdXJwb3NlICAgOlxuICAgIC8vICAgU3Vic2NyaWJlIGFuZCBwdWJsaXNoIGV2ZW50c1xuICAgIC8vIEFyZ3VtZW50cyA6XG4gICAgLy8gQWN0aW9uICAgIDogVGhlIHVzZXIgY2FuIHN1YnNjcmliZSB0byBldmVudHMgd2l0aCBvbignPGV2ZW50IG5hbWU+JywgY2FsbGJhY2spXG4gICAgLy8gYW5kIGxpc3RlbiB0byBldmVudHMgcHVibGlzaGVkIHdpdGggZW1pdCgnPGV2ZW50IG5hbWU+JylcbiAgICAvLyBSZXR1cm5zICAgOiBub25lXG4gICAgLy8gVGhyb3dzICAgIDogbm9uZVxuICAgIFB1YlN1YiA9IHtcbiAgICAgICAgaGFuZGxlcnM6IHt9LFxuXG4gICAgICAgIG9uIDogZnVuY3Rpb24oZXZlbnRUeXBlLCBoYW5kbGVyKSB7XG4gICAgICAgICAgICBpZiAoIShldmVudFR5cGUgaW4gdGhpcy5oYW5kbGVycykpIHtcbiAgICAgICAgICAgICAgICB0aGlzLmhhbmRsZXJzW2V2ZW50VHlwZV0gPSBbXTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIC8vcHVzaCBoYW5kbGVyIGludG8gYXJyYXkgLS0gXCJldmVudFR5cGVcIjogW2hhbmRsZXJdXG4gICAgICAgICAgICB0aGlzLmhhbmRsZXJzW2V2ZW50VHlwZV0ucHVzaChoYW5kbGVyKTtcbiAgICAgICAgICAgIHJldHVybiB0aGlzO1xuICAgICAgICB9LFxuXG4gICAgICAgIGVtaXQgOiBmdW5jdGlvbihldmVudFR5cGUpIHtcbiAgICAgICAgICAgIHZhciBoYW5kbGVyQXJncyA9IEFycmF5LnByb3RvdHlwZS5zbGljZS5jYWxsKGFyZ3VtZW50cywgMSk7XG4gICAgICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IHRoaXMuaGFuZGxlcnNbZXZlbnRUeXBlXS5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgICAgIHRoaXMuaGFuZGxlcnNbZXZlbnRUeXBlXVtpXS5hcHBseSh0aGlzLCBoYW5kbGVyQXJncyk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gdGhpcztcbiAgICAgICAgfVxuXG4gICAgfTtcblxuICAgIC8vIEJlZ2luIFB1YmxpYyBtZXRob2QgL3RydW5jYXRlL1xuICAgIC8vIEV4YW1wbGUgICA6IHRydW5jYXRlKHN0cmluZywgbWF4Y2hhcilcbiAgICAvLyBQdXJwb3NlICAgOlxuICAgIC8vICAgVHJ1bmNhdGUgYSBzdHJpbmcgYW5kIGFwcGVuZCBcIi4uLlwiIHRvIHRoZSByZW1haW5pbmdcbiAgICAvLyBBcmd1bWVudHMgOlxuICAgIC8vICAqIHN0cmluZyAtIHRoZSBvcmlnaW5hbCBzdHJpbmdcbiAgICAvLyAgKiBtYXhjaGFyIC0gdGhlIG1heCBudW1iZXIgb2YgY2hhcnMgdG8gc2hvd1xuICAgIC8vIFJldHVybnMgICA6IHRoZSB0cnVuY2F0ZWQgc3RyaW5nXG4gICAgLy8gVGhyb3dzICAgIDogbm9uZVxuICAgIHRydW5jYXRlID0gZnVuY3Rpb24oc3RyaW5nLCBtYXhjaGFyKXtcbiAgICAgICAgdmFyIHN0ciA9IHN0cmluZyB8fCAnJztcblxuICAgICAgICB2YXIgdHJ1bmNhdGVkID0gc3RyLnNsaWNlKDAsIG1heGNoYXIpO1xuICAgICAgICBpZihzdHIubGVuZ3RoID4gbWF4Y2hhcil7XG4gICAgICAgICAgICB0cnVuY2F0ZWQgKz0gXCIuLi5cIjtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gdHJ1bmNhdGVkO1xuICAgIH07XG5cbiAgICByZXR1cm4ge1xuICAgICAgICBQdWJTdWI6IFB1YlN1YixcbiAgICAgICAgdHJ1bmNhdGU6IHRydW5jYXRlXG4gICAgfTtcbn0oKSk7XG5cbm1vZHVsZS5leHBvcnRzID0gdXRpbDtcblxuIl19
