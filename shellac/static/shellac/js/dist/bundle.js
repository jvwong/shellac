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

                '<div class="shellac-app-statusbar">Playlist: <span class="shellac-app-statusbar-playing"></span></div>' +

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

                '<div class="shellac-app clip content"></div>' +
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

    onClickCategory, onTapStatusBar, onSwipeSideBar,

    PubSub = util.PubSub;

    //---------------- END MODULE SCOPE VARIABLES --------------

    //--------------------- BEGIN MODULE SCOPE METHODS --------------------

    setJqueryMap = function(){
        var $outerDiv = stateMap.$container;

        jqueryMap = {
            $outerDiv               : $outerDiv,
            $app_container          : $outerDiv.find('.shellac-app-container'),
            $statusbar              : $outerDiv.find('.shellac-app-statusbar'),
            $statusbar_playing      : $outerDiv.find('.shellac-app-statusbar .shellac-app-statusbar-playing'),
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
                stateMap.clip_db.insert(parseClipData(clips['results']));
                stateMap.clips = stateMap.clip_db().order("id desc").get();
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

    onTapStatusBar = function(evt){
//        console.log("tap deteceted");
//        console.log(evt);
        evt.preventDefault();
        jqueryMap.$app_container.toggleClass('nav-expanded');
    };

    onSwipeSideBar = function(evt){
//        console.log("swipe deteceted");
//        console.log(evt);
        evt.preventDefault();
        jqueryMap.$app_container.toggleClass('nav-expanded');
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
        $( '.shellac-app-statusbar' )
            .on( 'utap.utap',   onTapStatusBar   );

        $( '.shellac-app.sidebar' )
            .on( 'udragstart.udrag', onSwipeSideBar );

        jqueryMap.$statusbar_playing.html(username);

        console.log(jqueryMap.$nav_sidebar);
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi91c3IvbG9jYWwvbGliL25vZGVfbW9kdWxlcy93YXRjaGlmeS9ub2RlX21vZHVsZXMvYnJvd3NlcmlmeS9ub2RlX21vZHVsZXMvYnJvd3Nlci1wYWNrL19wcmVsdWRlLmpzIiwiL2hvbWUvanZ3b25nL1Byb2plY3RzL3NoZWxsYWMvc2hlbGxhYy5uby1pcC5jYS9zb3VyY2Uvc2hlbGxhYy9zdGF0aWMvc2hlbGxhYy9qcy9saWIvc291bmRtYW5hZ2VyMi9zY3JpcHQvc291bmRtYW5hZ2VyMi5qcyIsIi9ob21lL2p2d29uZy9Qcm9qZWN0cy9zaGVsbGFjL3NoZWxsYWMubm8taXAuY2Evc291cmNlL3NoZWxsYWMvc3RhdGljL3NoZWxsYWMvanMvbm9kZV9tb2R1bGVzL21vbWVudC9tb21lbnQuanMiLCIvaG9tZS9qdndvbmcvUHJvamVjdHMvc2hlbGxhYy9zaGVsbGFjLm5vLWlwLmNhL3NvdXJjZS9zaGVsbGFjL3N0YXRpYy9zaGVsbGFjL2pzL25vZGVfbW9kdWxlcy90YWZmeWRiL3RhZmZ5LmpzIiwiL2hvbWUvanZ3b25nL1Byb2plY3RzL3NoZWxsYWMvc2hlbGxhYy5uby1pcC5jYS9zb3VyY2Uvc2hlbGxhYy9zdGF0aWMvc2hlbGxhYy9qcy9zcmMvYXVkaW8uanMiLCIvaG9tZS9qdndvbmcvUHJvamVjdHMvc2hlbGxhYy9zaGVsbGFjLm5vLWlwLmNhL3NvdXJjZS9zaGVsbGFjL3N0YXRpYy9zaGVsbGFjL2pzL3NyYy9tYWluLmpzIiwiL2hvbWUvanZ3b25nL1Byb2plY3RzL3NoZWxsYWMvc2hlbGxhYy5uby1pcC5jYS9zb3VyY2Uvc2hlbGxhYy9zdGF0aWMvc2hlbGxhYy9qcy9zcmMvc2hlbGxhYy5qcyIsIi9ob21lL2p2d29uZy9Qcm9qZWN0cy9zaGVsbGFjL3NoZWxsYWMubm8taXAuY2Evc291cmNlL3NoZWxsYWMvc3RhdGljL3NoZWxsYWMvanMvc3JjL3V0aWwuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUNBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN4N0xBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMxeUZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDaitEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM5UUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ1hBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzNaQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3ZhciBmPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIik7dGhyb3cgZi5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGZ9dmFyIGw9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGwuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sbCxsLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsIi8qKiBAbGljZW5zZVxyXG4gKlxyXG4gKiBTb3VuZE1hbmFnZXIgMjogSmF2YVNjcmlwdCBTb3VuZCBmb3IgdGhlIFdlYlxyXG4gKiAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXHJcbiAqIGh0dHA6Ly9zY2hpbGxtYW5pYS5jb20vcHJvamVjdHMvc291bmRtYW5hZ2VyMi9cclxuICpcclxuICogQ29weXJpZ2h0IChjKSAyMDA3LCBTY290dCBTY2hpbGxlci4gQWxsIHJpZ2h0cyByZXNlcnZlZC5cclxuICogQ29kZSBwcm92aWRlZCB1bmRlciB0aGUgQlNEIExpY2Vuc2U6XHJcbiAqIGh0dHA6Ly9zY2hpbGxtYW5pYS5jb20vcHJvamVjdHMvc291bmRtYW5hZ2VyMi9saWNlbnNlLnR4dFxyXG4gKlxyXG4gKiBWMi45N2EuMjAxNDA5MDFcclxuICovXHJcblxyXG4vKmdsb2JhbCB3aW5kb3csIFNNMl9ERUZFUiwgc20yRGVidWdnZXIsIGNvbnNvbGUsIGRvY3VtZW50LCBuYXZpZ2F0b3IsIHNldFRpbWVvdXQsIHNldEludGVydmFsLCBjbGVhckludGVydmFsLCBBdWRpbywgb3BlcmEsIG1vZHVsZSwgZGVmaW5lICovXHJcbi8qanNsaW50IHJlZ2V4cDogdHJ1ZSwgc2xvcHB5OiB0cnVlLCB3aGl0ZTogdHJ1ZSwgbm9tZW46IHRydWUsIHBsdXNwbHVzOiB0cnVlLCB0b2RvOiB0cnVlICovXHJcblxyXG4vKipcclxuICogQWJvdXQgdGhpcyBmaWxlXHJcbiAqIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cclxuICogVGhpcyBpcyB0aGUgZnVsbHktY29tbWVudGVkIHNvdXJjZSB2ZXJzaW9uIG9mIHRoZSBTb3VuZE1hbmFnZXIgMiBBUEksXHJcbiAqIHJlY29tbWVuZGVkIGZvciB1c2UgZHVyaW5nIGRldmVsb3BtZW50IGFuZCB0ZXN0aW5nLlxyXG4gKlxyXG4gKiBTZWUgc291bmRtYW5hZ2VyMi1ub2RlYnVnLWpzbWluLmpzIGZvciBhbiBvcHRpbWl6ZWQgYnVpbGQgKH4xMUtCIHdpdGggZ3ppcC4pXHJcbiAqIGh0dHA6Ly9zY2hpbGxtYW5pYS5jb20vcHJvamVjdHMvc291bmRtYW5hZ2VyMi9kb2MvZ2V0c3RhcnRlZC8jYmFzaWMtaW5jbHVzaW9uXHJcbiAqIEFsdGVybmF0ZWx5LCBzZXJ2ZSB0aGlzIGZpbGUgd2l0aCBnemlwIGZvciA3NSUgY29tcHJlc3Npb24gc2F2aW5ncyAofjMwS0Igb3ZlciBIVFRQLilcclxuICpcclxuICogWW91IG1heSBub3RpY2UgPGQ+IGFuZCA8L2Q+IGNvbW1lbnRzIGluIHRoaXMgc291cmNlOyB0aGVzZSBhcmUgZGVsaW1pdGVycyBmb3JcclxuICogZGVidWcgYmxvY2tzIHdoaWNoIGFyZSByZW1vdmVkIGluIHRoZSAtbm9kZWJ1ZyBidWlsZHMsIGZ1cnRoZXIgb3B0aW1pemluZyBjb2RlIHNpemUuXHJcbiAqXHJcbiAqIEFsc28sIGFzIHlvdSBtYXkgbm90ZTogV2hvYSwgcmVsaWFibGUgY3Jvc3MtcGxhdGZvcm0vZGV2aWNlIGF1ZGlvIHN1cHBvcnQgaXMgaGFyZCEgOylcclxuICovXHJcblxyXG4oZnVuY3Rpb24od2luZG93LCBfdW5kZWZpbmVkKSB7XHJcblxyXG5cInVzZSBzdHJpY3RcIjtcclxuXHJcbmlmICghd2luZG93IHx8ICF3aW5kb3cuZG9jdW1lbnQpIHtcclxuXHJcbiAgLy8gRG9uJ3QgY3Jvc3MgdGhlIFtlbnZpcm9ubWVudF0gc3RyZWFtcy4gU00yIGV4cGVjdHMgdG8gYmUgcnVubmluZyBpbiBhIGJyb3dzZXIsIG5vdCB1bmRlciBub2RlLmpzIGV0Yy5cclxuICAvLyBBZGRpdGlvbmFsbHksIGlmIGEgYnJvd3NlciBzb21laG93IG1hbmFnZXMgdG8gZmFpbCB0aGlzIHRlc3QsIGFzIEVnb24gc2FpZDogXCJJdCB3b3VsZCBiZSBiYWQuXCJcclxuXHJcbiAgdGhyb3cgbmV3IEVycm9yKCdTb3VuZE1hbmFnZXIgcmVxdWlyZXMgYSBicm93c2VyIHdpdGggd2luZG93IGFuZCBkb2N1bWVudCBvYmplY3RzLicpO1xyXG5cclxufVxyXG5cclxudmFyIHNvdW5kTWFuYWdlciA9IG51bGw7XHJcblxyXG4vKipcclxuICogVGhlIFNvdW5kTWFuYWdlciBjb25zdHJ1Y3Rvci5cclxuICpcclxuICogQGNvbnN0cnVjdG9yXHJcbiAqIEBwYXJhbSB7c3RyaW5nfSBzbVVSTCBPcHRpb25hbDogUGF0aCB0byBTV0YgZmlsZXNcclxuICogQHBhcmFtIHtzdHJpbmd9IHNtSUQgT3B0aW9uYWw6IFRoZSBJRCB0byB1c2UgZm9yIHRoZSBTV0YgY29udGFpbmVyIGVsZW1lbnRcclxuICogQHRoaXMge1NvdW5kTWFuYWdlcn1cclxuICogQHJldHVybiB7U291bmRNYW5hZ2VyfSBUaGUgbmV3IFNvdW5kTWFuYWdlciBpbnN0YW5jZVxyXG4gKi9cclxuXHJcbmZ1bmN0aW9uIFNvdW5kTWFuYWdlcihzbVVSTCwgc21JRCkge1xyXG5cclxuICAvKipcclxuICAgKiBzb3VuZE1hbmFnZXIgY29uZmlndXJhdGlvbiBvcHRpb25zIGxpc3RcclxuICAgKiBkZWZpbmVzIHRvcC1sZXZlbCBjb25maWd1cmF0aW9uIHByb3BlcnRpZXMgdG8gYmUgYXBwbGllZCB0byB0aGUgc291bmRNYW5hZ2VyIGluc3RhbmNlIChlZy4gc291bmRNYW5hZ2VyLmZsYXNoVmVyc2lvbilcclxuICAgKiB0byBzZXQgdGhlc2UgcHJvcGVydGllcywgdXNlIHRoZSBzZXR1cCgpIG1ldGhvZCAtIGVnLiwgc291bmRNYW5hZ2VyLnNldHVwKHt1cmw6ICcvc3dmLycsIGZsYXNoVmVyc2lvbjogOX0pXHJcbiAgICovXHJcblxyXG4gIHRoaXMuc2V0dXBPcHRpb25zID0ge1xyXG5cclxuICAgICd1cmwnOiAoc21VUkwgfHwgbnVsbCksICAgICAgICAgICAgIC8vIHBhdGggKGRpcmVjdG9yeSkgd2hlcmUgU291bmRNYW5hZ2VyIDIgU1dGcyBleGlzdCwgZWcuLCAvcGF0aC90by9zd2ZzL1xyXG4gICAgJ2ZsYXNoVmVyc2lvbic6IDgsICAgICAgICAgICAgICAgICAgLy8gZmxhc2ggYnVpbGQgdG8gdXNlICg4IG9yIDkuKSBTb21lIEFQSSBmZWF0dXJlcyByZXF1aXJlIDkuXHJcbiAgICAnZGVidWdNb2RlJzogdHJ1ZSwgICAgICAgICAgICAgICAgICAvLyBlbmFibGUgZGVidWdnaW5nIG91dHB1dCAoY29uc29sZS5sb2coKSB3aXRoIEhUTUwgZmFsbGJhY2spXHJcbiAgICAnZGVidWdGbGFzaCc6IGZhbHNlLCAgICAgICAgICAgICAgICAvLyBlbmFibGUgZGVidWdnaW5nIG91dHB1dCBpbnNpZGUgU1dGLCB0cm91Ymxlc2hvb3QgRmxhc2gvYnJvd3NlciBpc3N1ZXNcclxuICAgICd1c2VDb25zb2xlJzogdHJ1ZSwgICAgICAgICAgICAgICAgIC8vIHVzZSBjb25zb2xlLmxvZygpIGlmIGF2YWlsYWJsZSAob3RoZXJ3aXNlLCB3cml0ZXMgdG8gI3NvdW5kbWFuYWdlci1kZWJ1ZyBlbGVtZW50KVxyXG4gICAgJ2NvbnNvbGVPbmx5JzogdHJ1ZSwgICAgICAgICAgICAgICAgLy8gaWYgY29uc29sZSBpcyBiZWluZyB1c2VkLCBkbyBub3QgY3JlYXRlL3dyaXRlIHRvICNzb3VuZG1hbmFnZXItZGVidWdcclxuICAgICd3YWl0Rm9yV2luZG93TG9hZCc6IGZhbHNlLCAgICAgICAgIC8vIGZvcmNlIFNNMiB0byB3YWl0IGZvciB3aW5kb3cub25sb2FkKCkgYmVmb3JlIHRyeWluZyB0byBjYWxsIHNvdW5kTWFuYWdlci5vbmxvYWQoKVxyXG4gICAgJ2JnQ29sb3InOiAnI2ZmZmZmZicsICAgICAgICAgICAgICAgLy8gU1dGIGJhY2tncm91bmQgY29sb3IuIE4vQSB3aGVuIHdtb2RlID0gJ3RyYW5zcGFyZW50J1xyXG4gICAgJ3VzZUhpZ2hQZXJmb3JtYW5jZSc6IGZhbHNlLCAgICAgICAgLy8gcG9zaXRpb246Zml4ZWQgZmxhc2ggbW92aWUgY2FuIGhlbHAgaW5jcmVhc2UganMvZmxhc2ggc3BlZWQsIG1pbmltaXplIGxhZ1xyXG4gICAgJ2ZsYXNoUG9sbGluZ0ludGVydmFsJzogbnVsbCwgICAgICAgLy8gbXNlYyBhZmZlY3Rpbmcgd2hpbGVwbGF5aW5nL2xvYWRpbmcgY2FsbGJhY2sgZnJlcXVlbmN5LiBJZiBudWxsLCBkZWZhdWx0IG9mIDUwIG1zZWMgaXMgdXNlZC5cclxuICAgICdodG1sNVBvbGxpbmdJbnRlcnZhbCc6IG51bGwsICAgICAgIC8vIG1zZWMgYWZmZWN0aW5nIHdoaWxlcGxheWluZygpIGZvciBIVE1MNSBhdWRpbywgZXhjbHVkaW5nIG1vYmlsZSBkZXZpY2VzLiBJZiBudWxsLCBuYXRpdmUgSFRNTDUgdXBkYXRlIGV2ZW50cyBhcmUgdXNlZC5cclxuICAgICdmbGFzaExvYWRUaW1lb3V0JzogMTAwMCwgICAgICAgICAgIC8vIG1zZWMgdG8gd2FpdCBmb3IgZmxhc2ggbW92aWUgdG8gbG9hZCBiZWZvcmUgZmFpbGluZyAoMCA9IGluZmluaXR5KVxyXG4gICAgJ3dtb2RlJzogbnVsbCwgICAgICAgICAgICAgICAgICAgICAgLy8gZmxhc2ggcmVuZGVyaW5nIG1vZGUgLSBudWxsLCAndHJhbnNwYXJlbnQnLCBvciAnb3BhcXVlJyAobGFzdCB0d28gYWxsb3cgei1pbmRleCB0byB3b3JrKVxyXG4gICAgJ2FsbG93U2NyaXB0QWNjZXNzJzogJ2Fsd2F5cycsICAgICAgLy8gZm9yIHNjcmlwdGluZyB0aGUgU1dGIChvYmplY3QvZW1iZWQgcHJvcGVydHkpLCAnYWx3YXlzJyBvciAnc2FtZURvbWFpbidcclxuICAgICd1c2VGbGFzaEJsb2NrJzogZmFsc2UsICAgICAgICAgICAgIC8vICpyZXF1aXJlcyBmbGFzaGJsb2NrLmNzcywgc2VlIGRlbW9zKiAtIGFsbG93IHJlY292ZXJ5IGZyb20gZmxhc2ggYmxvY2tlcnMuIFdhaXQgaW5kZWZpbml0ZWx5IGFuZCBhcHBseSB0aW1lb3V0IENTUyB0byBTV0YsIGlmIGFwcGxpY2FibGUuXHJcbiAgICAndXNlSFRNTDVBdWRpbyc6IHRydWUsICAgICAgICAgICAgICAvLyB1c2UgSFRNTDUgQXVkaW8oKSB3aGVyZSBBUEkgaXMgc3VwcG9ydGVkIChtb3N0IFNhZmFyaSwgQ2hyb21lIHZlcnNpb25zKSwgRmlyZWZveCAobm8gTVAzL01QNC4pIElkZWFsbHksIHRyYW5zcGFyZW50IHZzLiBGbGFzaCBBUEkgd2hlcmUgcG9zc2libGUuXHJcbiAgICAnaHRtbDVUZXN0JzogL14ocHJvYmFibHl8bWF5YmUpJC9pLCAvLyBIVE1MNSBBdWRpbygpIGZvcm1hdCBzdXBwb3J0IHRlc3QuIFVzZSAvXnByb2JhYmx5JC9pOyBpZiB5b3Ugd2FudCB0byBiZSBtb3JlIGNvbnNlcnZhdGl2ZS5cclxuICAgICdwcmVmZXJGbGFzaCc6IGZhbHNlLCAgICAgICAgICAgICAgIC8vIG92ZXJyaWRlcyB1c2VIVE1MNWF1ZGlvLCB3aWxsIHVzZSBGbGFzaCBmb3IgTVAzL01QNC9BQUMgaWYgcHJlc2VudC4gUG90ZW50aWFsIG9wdGlvbiBpZiBIVE1MNSBwbGF5YmFjayB3aXRoIHRoZXNlIGZvcm1hdHMgaXMgcXVpcmt5LlxyXG4gICAgJ25vU1dGQ2FjaGUnOiBmYWxzZSwgICAgICAgICAgICAgICAgLy8gaWYgdHJ1ZSwgYXBwZW5kcyA/dHM9e2RhdGV9IHRvIGJyZWFrIGFnZ3Jlc3NpdmUgU1dGIGNhY2hpbmcuXHJcbiAgICAnaWRQcmVmaXgnOiAnc291bmQnICAgICAgICAgICAgICAgICAvLyBpZiBhbiBpZCBpcyBub3QgcHJvdmlkZWQgdG8gY3JlYXRlU291bmQoKSwgdGhpcyBwcmVmaXggaXMgdXNlZCBmb3IgZ2VuZXJhdGVkIElEcyAtICdzb3VuZDAnLCAnc291bmQxJyBldGMuXHJcblxyXG4gIH07XHJcblxyXG4gIHRoaXMuZGVmYXVsdE9wdGlvbnMgPSB7XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiB0aGUgZGVmYXVsdCBjb25maWd1cmF0aW9uIGZvciBzb3VuZCBvYmplY3RzIG1hZGUgd2l0aCBjcmVhdGVTb3VuZCgpIGFuZCByZWxhdGVkIG1ldGhvZHNcclxuICAgICAqIGVnLiwgdm9sdW1lLCBhdXRvLWxvYWQgYmVoYXZpb3VyIGFuZCBzbyBmb3J0aFxyXG4gICAgICovXHJcblxyXG4gICAgJ2F1dG9Mb2FkJzogZmFsc2UsICAgICAgICAvLyBlbmFibGUgYXV0b21hdGljIGxvYWRpbmcgKG90aGVyd2lzZSAubG9hZCgpIHdpbGwgYmUgY2FsbGVkIG9uIGRlbWFuZCB3aXRoIC5wbGF5KCksIHRoZSBsYXR0ZXIgYmVpbmcgbmljZXIgb24gYmFuZHdpZHRoIC0gaWYgeW91IHdhbnQgdG8gLmxvYWQgeW91cnNlbGYsIHlvdSBhbHNvIGNhbilcclxuICAgICdhdXRvUGxheSc6IGZhbHNlLCAgICAgICAgLy8gZW5hYmxlIHBsYXlpbmcgb2YgZmlsZSBhcyBzb29uIGFzIHBvc3NpYmxlIChtdWNoIGZhc3RlciBpZiBcInN0cmVhbVwiIGlzIHRydWUpXHJcbiAgICAnZnJvbSc6IG51bGwsICAgICAgICAgICAgIC8vIHBvc2l0aW9uIHRvIHN0YXJ0IHBsYXliYWNrIHdpdGhpbiBhIHNvdW5kIChtc2VjKSwgZGVmYXVsdCA9IGJlZ2lubmluZ1xyXG4gICAgJ2xvb3BzJzogMSwgICAgICAgICAgICAgICAvLyBob3cgbWFueSB0aW1lcyB0byByZXBlYXQgdGhlIHNvdW5kIChwb3NpdGlvbiB3aWxsIHdyYXAgYXJvdW5kIHRvIDAsIHNldFBvc2l0aW9uKCkgd2lsbCBicmVhayBvdXQgb2YgbG9vcCB3aGVuID4wKVxyXG4gICAgJ29uaWQzJzogbnVsbCwgICAgICAgICAgICAvLyBjYWxsYmFjayBmdW5jdGlvbiBmb3IgXCJJRDMgZGF0YSBpcyBhZGRlZC9hdmFpbGFibGVcIlxyXG4gICAgJ29ubG9hZCc6IG51bGwsICAgICAgICAgICAvLyBjYWxsYmFjayBmdW5jdGlvbiBmb3IgXCJsb2FkIGZpbmlzaGVkXCJcclxuICAgICd3aGlsZWxvYWRpbmcnOiBudWxsLCAgICAgLy8gY2FsbGJhY2sgZnVuY3Rpb24gZm9yIFwiZG93bmxvYWQgcHJvZ3Jlc3MgdXBkYXRlXCIgKFggb2YgWSBieXRlcyByZWNlaXZlZClcclxuICAgICdvbnBsYXknOiBudWxsLCAgICAgICAgICAgLy8gY2FsbGJhY2sgZm9yIFwicGxheVwiIHN0YXJ0XHJcbiAgICAnb25wYXVzZSc6IG51bGwsICAgICAgICAgIC8vIGNhbGxiYWNrIGZvciBcInBhdXNlXCJcclxuICAgICdvbnJlc3VtZSc6IG51bGwsICAgICAgICAgLy8gY2FsbGJhY2sgZm9yIFwicmVzdW1lXCIgKHBhdXNlIHRvZ2dsZSlcclxuICAgICd3aGlsZXBsYXlpbmcnOiBudWxsLCAgICAgLy8gY2FsbGJhY2sgZHVyaW5nIHBsYXkgKHBvc2l0aW9uIHVwZGF0ZSlcclxuICAgICdvbnBvc2l0aW9uJzogbnVsbCwgICAgICAgLy8gb2JqZWN0IGNvbnRhaW5pbmcgdGltZXMgYW5kIGZ1bmN0aW9uIGNhbGxiYWNrcyBmb3IgcG9zaXRpb25zIG9mIGludGVyZXN0XHJcbiAgICAnb25zdG9wJzogbnVsbCwgICAgICAgICAgIC8vIGNhbGxiYWNrIGZvciBcInVzZXIgc3RvcFwiXHJcbiAgICAnb25mYWlsdXJlJzogbnVsbCwgICAgICAgIC8vIGNhbGxiYWNrIGZ1bmN0aW9uIGZvciB3aGVuIHBsYXlpbmcgZmFpbHNcclxuICAgICdvbmZpbmlzaCc6IG51bGwsICAgICAgICAgLy8gY2FsbGJhY2sgZnVuY3Rpb24gZm9yIFwic291bmQgZmluaXNoZWQgcGxheWluZ1wiXHJcbiAgICAnbXVsdGlTaG90JzogdHJ1ZSwgICAgICAgIC8vIGxldCBzb3VuZHMgXCJyZXN0YXJ0XCIgb3IgbGF5ZXIgb24gdG9wIG9mIGVhY2ggb3RoZXIgd2hlbiBwbGF5ZWQgbXVsdGlwbGUgdGltZXMsIHJhdGhlciB0aGFuIG9uZS1zaG90L29uZSBhdCBhIHRpbWVcclxuICAgICdtdWx0aVNob3RFdmVudHMnOiBmYWxzZSwgLy8gZmlyZSBtdWx0aXBsZSBzb3VuZCBldmVudHMgKGN1cnJlbnRseSBvbmZpbmlzaCgpIG9ubHkpIHdoZW4gbXVsdGlTaG90IGlzIGVuYWJsZWRcclxuICAgICdwb3NpdGlvbic6IG51bGwsICAgICAgICAgLy8gb2Zmc2V0IChtaWxsaXNlY29uZHMpIHRvIHNlZWsgdG8gd2l0aGluIGxvYWRlZCBzb3VuZCBkYXRhLlxyXG4gICAgJ3Bhbic6IDAsICAgICAgICAgICAgICAgICAvLyBcInBhblwiIHNldHRpbmdzLCBsZWZ0LXRvLXJpZ2h0LCAtMTAwIHRvIDEwMFxyXG4gICAgJ3N0cmVhbSc6IHRydWUsICAgICAgICAgICAvLyBhbGxvd3MgcGxheWluZyBiZWZvcmUgZW50aXJlIGZpbGUgaGFzIGxvYWRlZCAocmVjb21tZW5kZWQpXHJcbiAgICAndG8nOiBudWxsLCAgICAgICAgICAgICAgIC8vIHBvc2l0aW9uIHRvIGVuZCBwbGF5YmFjayB3aXRoaW4gYSBzb3VuZCAobXNlYyksIGRlZmF1bHQgPSBlbmRcclxuICAgICd0eXBlJzogbnVsbCwgICAgICAgICAgICAgLy8gTUlNRS1saWtlIGhpbnQgZm9yIGZpbGUgcGF0dGVybiAvIGNhblBsYXkoKSB0ZXN0cywgZWcuIGF1ZGlvL21wM1xyXG4gICAgJ3VzZVBvbGljeUZpbGUnOiBmYWxzZSwgICAvLyBlbmFibGUgY3Jvc3Nkb21haW4ueG1sIHJlcXVlc3QgZm9yIGF1ZGlvIG9uIHJlbW90ZSBkb21haW5zIChmb3IgSUQzL3dhdmVmb3JtIGFjY2VzcylcclxuICAgICd2b2x1bWUnOiAxMDAgICAgICAgICAgICAgLy8gc2VsZi1leHBsYW5hdG9yeS4gMC0xMDAsIHRoZSBsYXR0ZXIgYmVpbmcgdGhlIG1heC5cclxuXHJcbiAgfTtcclxuXHJcbiAgdGhpcy5mbGFzaDlPcHRpb25zID0ge1xyXG5cclxuICAgIC8qKlxyXG4gICAgICogZmxhc2ggOS1vbmx5IG9wdGlvbnMsXHJcbiAgICAgKiBtZXJnZWQgaW50byBkZWZhdWx0T3B0aW9ucyBpZiBmbGFzaCA5IGlzIGJlaW5nIHVzZWRcclxuICAgICAqL1xyXG5cclxuICAgICdpc01vdmllU3Rhcic6IG51bGwsICAgICAgLy8gXCJNb3ZpZVN0YXJcIiBNUEVHNCBhdWRpbyBtb2RlLiBOdWxsIChkZWZhdWx0KSA9IGF1dG8gZGV0ZWN0IE1QNCwgQUFDIGV0Yy4gYmFzZWQgb24gVVJMLiB0cnVlID0gZm9yY2Ugb24sIGlnbm9yZSBVUkxcclxuICAgICd1c2VQZWFrRGF0YSc6IGZhbHNlLCAgICAgLy8gZW5hYmxlIGxlZnQvcmlnaHQgY2hhbm5lbCBwZWFrIChsZXZlbCkgZGF0YVxyXG4gICAgJ3VzZVdhdmVmb3JtRGF0YSc6IGZhbHNlLCAvLyBlbmFibGUgc291bmQgc3BlY3RydW0gKHJhdyB3YXZlZm9ybSBkYXRhKSAtIE5PVEU6IE1heSBpbmNyZWFzZSBDUFUgbG9hZC5cclxuICAgICd1c2VFUURhdGEnOiBmYWxzZSwgICAgICAgLy8gZW5hYmxlIHNvdW5kIEVRIChmcmVxdWVuY3kgc3BlY3RydW0gZGF0YSkgLSBOT1RFOiBNYXkgaW5jcmVhc2UgQ1BVIGxvYWQuXHJcbiAgICAnb25idWZmZXJjaGFuZ2UnOiBudWxsLCAgIC8vIGNhbGxiYWNrIGZvciBcImlzQnVmZmVyaW5nXCIgcHJvcGVydHkgY2hhbmdlXHJcbiAgICAnb25kYXRhZXJyb3InOiBudWxsICAgICAgIC8vIGNhbGxiYWNrIGZvciB3YXZlZm9ybS9lcSBkYXRhIGFjY2VzcyBlcnJvciAoZmxhc2ggcGxheWluZyBhdWRpbyBpbiBvdGhlciB0YWJzL2RvbWFpbnMpXHJcblxyXG4gIH07XHJcblxyXG4gIHRoaXMubW92aWVTdGFyT3B0aW9ucyA9IHtcclxuXHJcbiAgICAvKipcclxuICAgICAqIGZsYXNoIDkuMHIxMTUrIE1QRUc0IGF1ZGlvIG9wdGlvbnMsXHJcbiAgICAgKiBtZXJnZWQgaW50byBkZWZhdWx0T3B0aW9ucyBpZiBmbGFzaCA5K21vdmllU3RhciBtb2RlIGlzIGVuYWJsZWRcclxuICAgICAqL1xyXG5cclxuICAgICdidWZmZXJUaW1lJzogMywgICAgICAgICAgLy8gc2Vjb25kcyBvZiBkYXRhIHRvIGJ1ZmZlciBiZWZvcmUgcGxheWJhY2sgYmVnaW5zIChudWxsID0gZmxhc2ggZGVmYXVsdCBvZiAwLjEgc2Vjb25kcyAtIGlmIEFBQyBwbGF5YmFjayBpcyBnYXBweSwgdHJ5IGluY3JlYXNpbmcuKVxyXG4gICAgJ3NlcnZlclVSTCc6IG51bGwsICAgICAgICAvLyBydG1wOiBGTVMgb3IgRk1JUyBzZXJ2ZXIgdG8gY29ubmVjdCB0bywgcmVxdWlyZWQgd2hlbiByZXF1ZXN0aW5nIG1lZGlhIHZpYSBSVE1QIG9yIG9uZSBvZiBpdHMgdmFyaWFudHNcclxuICAgICdvbmNvbm5lY3QnOiBudWxsLCAgICAgICAgLy8gcnRtcDogY2FsbGJhY2sgZm9yIGNvbm5lY3Rpb24gdG8gZmxhc2ggbWVkaWEgc2VydmVyXHJcbiAgICAnZHVyYXRpb24nOiBudWxsICAgICAgICAgIC8vIHJ0bXA6IHNvbmcgZHVyYXRpb24gKG1zZWMpXHJcblxyXG4gIH07XHJcblxyXG4gIHRoaXMuYXVkaW9Gb3JtYXRzID0ge1xyXG5cclxuICAgIC8qKlxyXG4gICAgICogZGV0ZXJtaW5lcyBIVE1MNSBzdXBwb3J0ICsgZmxhc2ggcmVxdWlyZW1lbnRzLlxyXG4gICAgICogaWYgbm8gc3VwcG9ydCAodmlhIGZsYXNoIGFuZC9vciBIVE1MNSkgZm9yIGEgXCJyZXF1aXJlZFwiIGZvcm1hdCwgU00yIHdpbGwgZmFpbCB0byBzdGFydC5cclxuICAgICAqIGZsYXNoIGZhbGxiYWNrIGlzIHVzZWQgZm9yIE1QMyBvciBNUDQgaWYgSFRNTDUgY2FuJ3QgcGxheSBpdCAob3IgaWYgcHJlZmVyRmxhc2ggPSB0cnVlKVxyXG4gICAgICovXHJcblxyXG4gICAgJ21wMyc6IHtcclxuICAgICAgJ3R5cGUnOiBbJ2F1ZGlvL21wZWc7IGNvZGVjcz1cIm1wM1wiJywgJ2F1ZGlvL21wZWcnLCAnYXVkaW8vbXAzJywgJ2F1ZGlvL01QQScsICdhdWRpby9tcGEtcm9idXN0J10sXHJcbiAgICAgICdyZXF1aXJlZCc6IHRydWVcclxuICAgIH0sXHJcblxyXG4gICAgJ21wNCc6IHtcclxuICAgICAgJ3JlbGF0ZWQnOiBbJ2FhYycsJ200YScsJ200YiddLCAvLyBhZGRpdGlvbmFsIGZvcm1hdHMgdW5kZXIgdGhlIE1QNCBjb250YWluZXJcclxuICAgICAgJ3R5cGUnOiBbJ2F1ZGlvL21wNDsgY29kZWNzPVwibXA0YS40MC4yXCInLCAnYXVkaW8vYWFjJywgJ2F1ZGlvL3gtbTRhJywgJ2F1ZGlvL01QNEEtTEFUTScsICdhdWRpby9tcGVnNC1nZW5lcmljJ10sXHJcbiAgICAgICdyZXF1aXJlZCc6IGZhbHNlXHJcbiAgICB9LFxyXG5cclxuICAgICdvZ2cnOiB7XHJcbiAgICAgICd0eXBlJzogWydhdWRpby9vZ2c7IGNvZGVjcz12b3JiaXMnXSxcclxuICAgICAgJ3JlcXVpcmVkJzogZmFsc2VcclxuICAgIH0sXHJcblxyXG4gICAgJ29wdXMnOiB7XHJcbiAgICAgICd0eXBlJzogWydhdWRpby9vZ2c7IGNvZGVjcz1vcHVzJywgJ2F1ZGlvL29wdXMnXSxcclxuICAgICAgJ3JlcXVpcmVkJzogZmFsc2VcclxuICAgIH0sXHJcblxyXG4gICAgJ3dhdic6IHtcclxuICAgICAgJ3R5cGUnOiBbJ2F1ZGlvL3dhdjsgY29kZWNzPVwiMVwiJywgJ2F1ZGlvL3dhdicsICdhdWRpby93YXZlJywgJ2F1ZGlvL3gtd2F2J10sXHJcbiAgICAgICdyZXF1aXJlZCc6IGZhbHNlXHJcbiAgICB9XHJcblxyXG4gIH07XHJcblxyXG4gIC8vIEhUTUwgYXR0cmlidXRlcyAoaWQgKyBjbGFzcyBuYW1lcykgZm9yIHRoZSBTV0YgY29udGFpbmVyXHJcblxyXG4gIHRoaXMubW92aWVJRCA9ICdzbTItY29udGFpbmVyJztcclxuICB0aGlzLmlkID0gKHNtSUQgfHwgJ3NtMm1vdmllJyk7XHJcblxyXG4gIHRoaXMuZGVidWdJRCA9ICdzb3VuZG1hbmFnZXItZGVidWcnO1xyXG4gIHRoaXMuZGVidWdVUkxQYXJhbSA9IC8oWyM/Jl0pZGVidWc9MS9pO1xyXG5cclxuICAvLyBkeW5hbWljIGF0dHJpYnV0ZXNcclxuXHJcbiAgdGhpcy52ZXJzaW9uTnVtYmVyID0gJ1YyLjk3YS4yMDE0MDkwMSc7XHJcbiAgdGhpcy52ZXJzaW9uID0gbnVsbDtcclxuICB0aGlzLm1vdmllVVJMID0gbnVsbDtcclxuICB0aGlzLmFsdFVSTCA9IG51bGw7XHJcbiAgdGhpcy5zd2ZMb2FkZWQgPSBmYWxzZTtcclxuICB0aGlzLmVuYWJsZWQgPSBmYWxzZTtcclxuICB0aGlzLm9NQyA9IG51bGw7XHJcbiAgdGhpcy5zb3VuZHMgPSB7fTtcclxuICB0aGlzLnNvdW5kSURzID0gW107XHJcbiAgdGhpcy5tdXRlZCA9IGZhbHNlO1xyXG4gIHRoaXMuZGlkRmxhc2hCbG9jayA9IGZhbHNlO1xyXG4gIHRoaXMuZmlsZVBhdHRlcm4gPSBudWxsO1xyXG5cclxuICB0aGlzLmZpbGVQYXR0ZXJucyA9IHtcclxuXHJcbiAgICAnZmxhc2g4JzogL1xcLm1wMyhcXD8uKik/JC9pLFxyXG4gICAgJ2ZsYXNoOSc6IC9cXC5tcDMoXFw/LiopPyQvaVxyXG5cclxuICB9O1xyXG5cclxuICAvLyBzdXBwb3J0IGluZGljYXRvcnMsIHNldCBhdCBpbml0XHJcblxyXG4gIHRoaXMuZmVhdHVyZXMgPSB7XHJcblxyXG4gICAgJ2J1ZmZlcmluZyc6IGZhbHNlLFxyXG4gICAgJ3BlYWtEYXRhJzogZmFsc2UsXHJcbiAgICAnd2F2ZWZvcm1EYXRhJzogZmFsc2UsXHJcbiAgICAnZXFEYXRhJzogZmFsc2UsXHJcbiAgICAnbW92aWVTdGFyJzogZmFsc2VcclxuXHJcbiAgfTtcclxuXHJcbiAgLy8gZmxhc2ggc2FuZGJveCBpbmZvLCB1c2VkIHByaW1hcmlseSBpbiB0cm91Ymxlc2hvb3RpbmdcclxuXHJcbiAgdGhpcy5zYW5kYm94ID0ge1xyXG5cclxuICAgIC8vIDxkPlxyXG4gICAgJ3R5cGUnOiBudWxsLFxyXG4gICAgJ3R5cGVzJzoge1xyXG4gICAgICAncmVtb3RlJzogJ3JlbW90ZSAoZG9tYWluLWJhc2VkKSBydWxlcycsXHJcbiAgICAgICdsb2NhbFdpdGhGaWxlJzogJ2xvY2FsIHdpdGggZmlsZSBhY2Nlc3MgKG5vIGludGVybmV0IGFjY2VzcyknLFxyXG4gICAgICAnbG9jYWxXaXRoTmV0d29yayc6ICdsb2NhbCB3aXRoIG5ldHdvcmsgKGludGVybmV0IGFjY2VzcyBvbmx5LCBubyBsb2NhbCBhY2Nlc3MpJyxcclxuICAgICAgJ2xvY2FsVHJ1c3RlZCc6ICdsb2NhbCwgdHJ1c3RlZCAobG9jYWwraW50ZXJuZXQgYWNjZXNzKSdcclxuICAgIH0sXHJcbiAgICAnZGVzY3JpcHRpb24nOiBudWxsLFxyXG4gICAgJ25vUmVtb3RlJzogbnVsbCxcclxuICAgICdub0xvY2FsJzogbnVsbFxyXG4gICAgLy8gPC9kPlxyXG5cclxuICB9O1xyXG5cclxuICAvKipcclxuICAgKiBmb3JtYXQgc3VwcG9ydCAoaHRtbDUvZmxhc2gpXHJcbiAgICogc3RvcmVzIGNhblBsYXlUeXBlKCkgcmVzdWx0cyBiYXNlZCBvbiBhdWRpb0Zvcm1hdHMuXHJcbiAgICogZWcuIHsgbXAzOiBib29sZWFuLCBtcDQ6IGJvb2xlYW4gfVxyXG4gICAqIHRyZWF0IGFzIHJlYWQtb25seS5cclxuICAgKi9cclxuXHJcbiAgdGhpcy5odG1sNSA9IHtcclxuICAgICd1c2luZ0ZsYXNoJzogbnVsbCAvLyBzZXQgaWYvd2hlbiBmbGFzaCBmYWxsYmFjayBpcyBuZWVkZWRcclxuICB9O1xyXG5cclxuICAvLyBmaWxlIHR5cGUgc3VwcG9ydCBoYXNoXHJcbiAgdGhpcy5mbGFzaCA9IHt9O1xyXG5cclxuICAvLyBkZXRlcm1pbmVkIGF0IGluaXQgdGltZVxyXG4gIHRoaXMuaHRtbDVPbmx5ID0gZmFsc2U7XHJcblxyXG4gIC8vIHVzZWQgZm9yIHNwZWNpYWwgY2FzZXMgKGVnLiBpUGFkL2lQaG9uZS9wYWxtIE9TPylcclxuICB0aGlzLmlnbm9yZUZsYXNoID0gZmFsc2U7XHJcblxyXG4gIC8qKlxyXG4gICAqIGEgZmV3IHByaXZhdGUgaW50ZXJuYWxzIChPSywgYSBsb3QuIDpEKVxyXG4gICAqL1xyXG5cclxuICB2YXIgU01Tb3VuZCxcclxuICBzbTIgPSB0aGlzLCBnbG9iYWxIVE1MNUF1ZGlvID0gbnVsbCwgZmxhc2ggPSBudWxsLCBzbSA9ICdzb3VuZE1hbmFnZXInLCBzbWMgPSBzbSArICc6ICcsIGg1ID0gJ0hUTUw1OjonLCBpZCwgdWEgPSBuYXZpZ2F0b3IudXNlckFnZW50LCB3bCA9IHdpbmRvdy5sb2NhdGlvbi5ocmVmLnRvU3RyaW5nKCksIGRvYyA9IGRvY3VtZW50LCBkb05vdGhpbmcsIHNldFByb3BlcnRpZXMsIGluaXQsIGZWLCBvbl9xdWV1ZSA9IFtdLCBkZWJ1Z09wZW4gPSB0cnVlLCBkZWJ1Z1RTLCBkaWRBcHBlbmQgPSBmYWxzZSwgYXBwZW5kU3VjY2VzcyA9IGZhbHNlLCBkaWRJbml0ID0gZmFsc2UsIGRpc2FibGVkID0gZmFsc2UsIHdpbmRvd0xvYWRlZCA9IGZhbHNlLCBfd0RTLCB3ZENvdW50ID0gMCwgaW5pdENvbXBsZXRlLCBtaXhpbiwgYXNzaWduLCBleHRyYU9wdGlvbnMsIGFkZE9uRXZlbnQsIHByb2Nlc3NPbkV2ZW50cywgaW5pdFVzZXJPbmxvYWQsIGRlbGF5V2FpdEZvckVJLCB3YWl0Rm9yRUksIHJlYm9vdEludG9IVE1MNSwgc2V0VmVyc2lvbkluZm8sIGhhbmRsZUZvY3VzLCBzdHJpbmdzLCBpbml0TW92aWUsIHByZUluaXQsIGRvbUNvbnRlbnRMb2FkZWQsIHdpbk9uTG9hZCwgZGlkRENMb2FkZWQsIGdldERvY3VtZW50LCBjcmVhdGVNb3ZpZSwgY2F0Y2hFcnJvciwgc2V0UG9sbGluZywgaW5pdERlYnVnLCBkZWJ1Z0xldmVscyA9IFsnbG9nJywgJ2luZm8nLCAnd2FybicsICdlcnJvciddLCBkZWZhdWx0Rmxhc2hWZXJzaW9uID0gOCwgZGlzYWJsZU9iamVjdCwgZmFpbFNhZmVseSwgbm9ybWFsaXplTW92aWVVUkwsIG9SZW1vdmVkID0gbnVsbCwgb1JlbW92ZWRIVE1MID0gbnVsbCwgc3RyLCBmbGFzaEJsb2NrSGFuZGxlciwgZ2V0U1dGQ1NTLCBzd2ZDU1MsIHRvZ2dsZURlYnVnLCBsb29wRml4LCBwb2xpY3lGaXgsIGNvbXBsYWluLCBpZENoZWNrLCB3YWl0aW5nRm9yRUkgPSBmYWxzZSwgaW5pdFBlbmRpbmcgPSBmYWxzZSwgc3RhcnRUaW1lciwgc3RvcFRpbWVyLCB0aW1lckV4ZWN1dGUsIGg1VGltZXJDb3VudCA9IDAsIGg1SW50ZXJ2YWxUaW1lciA9IG51bGwsIHBhcnNlVVJMLCBtZXNzYWdlcyA9IFtdLFxyXG4gIGNhbklnbm9yZUZsYXNoLCBuZWVkc0ZsYXNoID0gbnVsbCwgZmVhdHVyZUNoZWNrLCBodG1sNU9LLCBodG1sNUNhblBsYXksIGh0bWw1RXh0LCBodG1sNVVubG9hZCwgZG9tQ29udGVudExvYWRlZElFLCB0ZXN0SFRNTDUsIGV2ZW50LCBzbGljZSA9IEFycmF5LnByb3RvdHlwZS5zbGljZSwgdXNlR2xvYmFsSFRNTDVBdWRpbyA9IGZhbHNlLCBsYXN0R2xvYmFsSFRNTDVVUkwsIGhhc0ZsYXNoLCBkZXRlY3RGbGFzaCwgYmFkU2FmYXJpRml4LCBodG1sNV9ldmVudHMsIHNob3dTdXBwb3J0LCBmbHVzaE1lc3NhZ2VzLCB3cmFwQ2FsbGJhY2ssIGlkQ291bnRlciA9IDAsXHJcbiAgaXNfaURldmljZSA9IHVhLm1hdGNoKC8oaXBhZHxpcGhvbmV8aXBvZCkvaSksIGlzQW5kcm9pZCA9IHVhLm1hdGNoKC9hbmRyb2lkL2kpLCBpc0lFID0gdWEubWF0Y2goL21zaWUvaSksIGlzV2Via2l0ID0gdWEubWF0Y2goL3dlYmtpdC9pKSwgaXNTYWZhcmkgPSAodWEubWF0Y2goL3NhZmFyaS9pKSAmJiAhdWEubWF0Y2goL2Nocm9tZS9pKSksIGlzT3BlcmEgPSAodWEubWF0Y2goL29wZXJhL2kpKSxcclxuICBtb2JpbGVIVE1MNSA9ICh1YS5tYXRjaCgvKG1vYmlsZXxwcmVcXC98eG9vbSkvaSkgfHwgaXNfaURldmljZSB8fCBpc0FuZHJvaWQpLFxyXG4gIGlzQmFkU2FmYXJpID0gKCF3bC5tYXRjaCgvdXNlaHRtbDVhdWRpby9pKSAmJiAhd2wubWF0Y2goL3NtMlxcLWlnbm9yZWJhZHVhL2kpICYmIGlzU2FmYXJpICYmICF1YS5tYXRjaCgvc2lsay9pKSAmJiB1YS5tYXRjaCgvT1MgWCAxMF82XyhbMy03XSkvaSkpLCAvLyBTYWZhcmkgNCBhbmQgNSAoZXhjbHVkaW5nIEtpbmRsZSBGaXJlLCBcIlNpbGtcIikgb2NjYXNpb25hbGx5IGZhaWwgdG8gbG9hZC9wbGF5IEhUTUw1IGF1ZGlvIG9uIFNub3cgTGVvcGFyZCAxMC42LjMgdGhyb3VnaCAxMC42LjcgZHVlIHRvIGJ1ZyhzKSBpbiBRdWlja1RpbWUgWCBhbmQvb3Igb3RoZXIgdW5kZXJseWluZyBmcmFtZXdvcmtzLiA6LyBDb25maXJtZWQgYnVnLiBodHRwczovL2J1Z3Mud2Via2l0Lm9yZy9zaG93X2J1Zy5jZ2k/aWQ9MzIxNTlcclxuICBoYXNDb25zb2xlID0gKHdpbmRvdy5jb25zb2xlICE9PSBfdW5kZWZpbmVkICYmIGNvbnNvbGUubG9nICE9PSBfdW5kZWZpbmVkKSwgaXNGb2N1c2VkID0gKGRvYy5oYXNGb2N1cyAhPT0gX3VuZGVmaW5lZD9kb2MuaGFzRm9jdXMoKTpudWxsKSwgdHJ5SW5pdE9uRm9jdXMgPSAoaXNTYWZhcmkgJiYgKGRvYy5oYXNGb2N1cyA9PT0gX3VuZGVmaW5lZCB8fCAhZG9jLmhhc0ZvY3VzKCkpKSwgb2tUb0Rpc2FibGUgPSAhdHJ5SW5pdE9uRm9jdXMsIGZsYXNoTUlNRSA9IC8obXAzfG1wNHxtcGF8bTRhfG00YikvaSwgbXNlY1NjYWxlID0gMTAwMCxcclxuICBlbXB0eVVSTCA9ICdhYm91dDpibGFuaycsIC8vIHNhZmUgVVJMIHRvIHVubG9hZCwgb3IgbG9hZCBub3RoaW5nIGZyb20gKGZsYXNoIDggKyBtb3N0IEhUTUw1IFVBcylcclxuICBlbXB0eVdBViA9ICdkYXRhOmF1ZGlvL3dhdmU7YmFzZTY0LC9Va2xHUmlZQUFBQlhRVlpGWm0xMElCQUFBQUFCQUFFQVJLd0FBSWhZQVFBQ0FCQUFaR0YwWVFJQUFBRC8vdz09JywgLy8gdGlueSBXQVYgZm9yIEhUTUw1IHVubG9hZGluZ1xyXG4gIG92ZXJIVFRQID0gKGRvYy5sb2NhdGlvbj9kb2MubG9jYXRpb24ucHJvdG9jb2wubWF0Y2goL2h0dHAvaSk6bnVsbCksXHJcbiAgaHR0cCA9ICghb3ZlckhUVFAgPyAnaHR0cDovJysnLycgOiAnJyksXHJcbiAgLy8gbXAzLCBtcDQsIGFhYyBldGMuXHJcbiAgbmV0U3RyZWFtTWltZVR5cGVzID0gL15cXHMqYXVkaW9cXC8oPzp4LSk/KD86bXBlZzR8YWFjfGZsdnxtb3Z8bXA0fHxtNHZ8bTRhfG00YnxtcDR2fDNncHwzZzIpXFxzKig/OiR8OykvaSxcclxuICAvLyBGbGFzaCB2OS4wcjExNSsgXCJtb3ZpZXN0YXJcIiBmb3JtYXRzXHJcbiAgbmV0U3RyZWFtVHlwZXMgPSBbJ21wZWc0JywgJ2FhYycsICdmbHYnLCAnbW92JywgJ21wNCcsICdtNHYnLCAnZjR2JywgJ200YScsICdtNGInLCAnbXA0dicsICczZ3AnLCAnM2cyJ10sXHJcbiAgbmV0U3RyZWFtUGF0dGVybiA9IG5ldyBSZWdFeHAoJ1xcXFwuKCcgKyBuZXRTdHJlYW1UeXBlcy5qb2luKCd8JykgKyAnKShcXFxcPy4qKT8kJywgJ2knKTtcclxuXHJcbiAgdGhpcy5taW1lUGF0dGVybiA9IC9eXFxzKmF1ZGlvXFwvKD86eC0pPyg/Om1wKD86ZWd8MykpXFxzKig/OiR8OykvaTsgLy8gZGVmYXVsdCBtcDMgc2V0XHJcblxyXG4gIC8vIHVzZSBhbHRVUkwgaWYgbm90IFwib25saW5lXCJcclxuICB0aGlzLnVzZUFsdFVSTCA9ICFvdmVySFRUUDtcclxuXHJcbiAgc3dmQ1NTID0ge1xyXG5cclxuICAgICdzd2ZCb3gnOiAnc20yLW9iamVjdC1ib3gnLFxyXG4gICAgJ3N3ZkRlZmF1bHQnOiAnbW92aWVDb250YWluZXInLFxyXG4gICAgJ3N3ZkVycm9yJzogJ3N3Zl9lcnJvcicsIC8vIFNXRiBsb2FkZWQsIGJ1dCBTTTIgY291bGRuJ3Qgc3RhcnQgKG90aGVyIGVycm9yKVxyXG4gICAgJ3N3ZlRpbWVkb3V0JzogJ3N3Zl90aW1lZG91dCcsXHJcbiAgICAnc3dmTG9hZGVkJzogJ3N3Zl9sb2FkZWQnLFxyXG4gICAgJ3N3ZlVuYmxvY2tlZCc6ICdzd2ZfdW5ibG9ja2VkJywgLy8gb3IgbG9hZGVkIE9LXHJcbiAgICAnc20yRGVidWcnOiAnc20yX2RlYnVnJyxcclxuICAgICdoaWdoUGVyZic6ICdoaWdoX3BlcmZvcm1hbmNlJyxcclxuICAgICdmbGFzaERlYnVnJzogJ2ZsYXNoX2RlYnVnJ1xyXG5cclxuICB9O1xyXG5cclxuICAvKipcclxuICAgKiBiYXNpYyBIVE1MNSBBdWRpbygpIHN1cHBvcnQgdGVzdFxyXG4gICAqIHRyeS4uLmNhdGNoIGJlY2F1c2Ugb2YgSUUgOSBcIm5vdCBpbXBsZW1lbnRlZFwiIG5vbnNlbnNlXHJcbiAgICogaHR0cHM6Ly9naXRodWIuY29tL01vZGVybml6ci9Nb2Rlcm5penIvaXNzdWVzLzIyNFxyXG4gICAqL1xyXG5cclxuICB0aGlzLmhhc0hUTUw1ID0gKGZ1bmN0aW9uKCkge1xyXG4gICAgdHJ5IHtcclxuICAgICAgLy8gbmV3IEF1ZGlvKG51bGwpIGZvciBzdHVwaWQgT3BlcmEgOS42NCBjYXNlLCB3aGljaCB0aHJvd3Mgbm90X2Vub3VnaF9hcmd1bWVudHMgZXhjZXB0aW9uIG90aGVyd2lzZS5cclxuICAgICAgcmV0dXJuIChBdWRpbyAhPT0gX3VuZGVmaW5lZCAmJiAoaXNPcGVyYSAmJiBvcGVyYSAhPT0gX3VuZGVmaW5lZCAmJiBvcGVyYS52ZXJzaW9uKCkgPCAxMCA/IG5ldyBBdWRpbyhudWxsKSA6IG5ldyBBdWRpbygpKS5jYW5QbGF5VHlwZSAhPT0gX3VuZGVmaW5lZCk7XHJcbiAgICB9IGNhdGNoKGUpIHtcclxuICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgfVxyXG4gIH0oKSk7XHJcblxyXG4gIC8qKlxyXG4gICAqIFB1YmxpYyBTb3VuZE1hbmFnZXIgQVBJXHJcbiAgICogLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cclxuICAgKi9cclxuXHJcbiAgLyoqXHJcbiAgICogQ29uZmlndXJlcyB0b3AtbGV2ZWwgc291bmRNYW5hZ2VyIHByb3BlcnRpZXMuXHJcbiAgICpcclxuICAgKiBAcGFyYW0ge29iamVjdH0gb3B0aW9ucyBPcHRpb24gcGFyYW1ldGVycywgZWcuIHsgZmxhc2hWZXJzaW9uOiA5LCB1cmw6ICcvcGF0aC90by9zd2ZzLycgfVxyXG4gICAqIG9ucmVhZHkgYW5kIG9udGltZW91dCBhcmUgYWxzbyBhY2NlcHRlZCBwYXJhbWV0ZXJzLiBjYWxsIHNvdW5kTWFuYWdlci5zZXR1cCgpIHRvIHNlZSB0aGUgZnVsbCBsaXN0LlxyXG4gICAqL1xyXG5cclxuICB0aGlzLnNldHVwID0gZnVuY3Rpb24ob3B0aW9ucykge1xyXG5cclxuICAgIHZhciBub1VSTCA9ICghc20yLnVybCk7XHJcblxyXG4gICAgLy8gd2FybiBpZiBmbGFzaCBvcHRpb25zIGhhdmUgYWxyZWFkeSBiZWVuIGFwcGxpZWRcclxuXHJcbiAgICBpZiAob3B0aW9ucyAhPT0gX3VuZGVmaW5lZCAmJiBkaWRJbml0ICYmIG5lZWRzRmxhc2ggJiYgc20yLm9rKCkgJiYgKG9wdGlvbnMuZmxhc2hWZXJzaW9uICE9PSBfdW5kZWZpbmVkIHx8IG9wdGlvbnMudXJsICE9PSBfdW5kZWZpbmVkIHx8IG9wdGlvbnMuaHRtbDVUZXN0ICE9PSBfdW5kZWZpbmVkKSkge1xyXG4gICAgICBjb21wbGFpbihzdHIoJ3NldHVwTGF0ZScpKTtcclxuICAgIH1cclxuXHJcbiAgICAvLyBUT0RPOiBkZWZlcjogdHJ1ZT9cclxuXHJcbiAgICBhc3NpZ24ob3B0aW9ucyk7XHJcblxyXG4gICAgLy8gc3BlY2lhbCBjYXNlIDE6IFwiTGF0ZSBzZXR1cFwiLiBTTTIgbG9hZGVkIG5vcm1hbGx5LCBidXQgdXNlciBkaWRuJ3QgYXNzaWduIGZsYXNoIFVSTCBlZy4sIHNldHVwKHt1cmw6Li4ufSkgYmVmb3JlIFNNMiBpbml0LiBUcmVhdCBhcyBkZWxheWVkIGluaXQuXHJcblxyXG4gICAgaWYgKG9wdGlvbnMpIHtcclxuXHJcbiAgICAgIGlmIChub1VSTCAmJiBkaWREQ0xvYWRlZCAmJiBvcHRpb25zLnVybCAhPT0gX3VuZGVmaW5lZCkge1xyXG4gICAgICAgIHNtMi5iZWdpbkRlbGF5ZWRJbml0KCk7XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIC8vIHNwZWNpYWwgY2FzZSAyOiBJZiBsYXp5LWxvYWRpbmcgU00yIChET01Db250ZW50TG9hZGVkIGhhcyBhbHJlYWR5IGhhcHBlbmVkKSBhbmQgdXNlciBjYWxscyBzZXR1cCgpIHdpdGggdXJsOiBwYXJhbWV0ZXIsIHRyeSB0byBpbml0IEFTQVAuXHJcblxyXG4gICAgICBpZiAoIWRpZERDTG9hZGVkICYmIG9wdGlvbnMudXJsICE9PSBfdW5kZWZpbmVkICYmIGRvYy5yZWFkeVN0YXRlID09PSAnY29tcGxldGUnKSB7XHJcbiAgICAgICAgc2V0VGltZW91dChkb21Db250ZW50TG9hZGVkLCAxKTtcclxuICAgICAgfVxyXG5cclxuICAgIH1cclxuXHJcbiAgICByZXR1cm4gc20yO1xyXG5cclxuICB9O1xyXG5cclxuICB0aGlzLm9rID0gZnVuY3Rpb24oKSB7XHJcblxyXG4gICAgcmV0dXJuIChuZWVkc0ZsYXNoID8gKGRpZEluaXQgJiYgIWRpc2FibGVkKSA6IChzbTIudXNlSFRNTDVBdWRpbyAmJiBzbTIuaGFzSFRNTDUpKTtcclxuXHJcbiAgfTtcclxuXHJcbiAgdGhpcy5zdXBwb3J0ZWQgPSB0aGlzLm9rOyAvLyBsZWdhY3lcclxuXHJcbiAgdGhpcy5nZXRNb3ZpZSA9IGZ1bmN0aW9uKHNtSUQpIHtcclxuXHJcbiAgICAvLyBzYWZldHkgbmV0OiBzb21lIG9sZCBicm93c2VycyBkaWZmZXIgb24gU1dGIHJlZmVyZW5jZXMsIHBvc3NpYmx5IHJlbGF0ZWQgdG8gRXh0ZXJuYWxJbnRlcmZhY2UgLyBmbGFzaCB2ZXJzaW9uXHJcbiAgICByZXR1cm4gaWQoc21JRCkgfHwgZG9jW3NtSURdIHx8IHdpbmRvd1tzbUlEXTtcclxuXHJcbiAgfTtcclxuXHJcbiAgLyoqXHJcbiAgICogQ3JlYXRlcyBhIFNNU291bmQgc291bmQgb2JqZWN0IGluc3RhbmNlLlxyXG4gICAqXHJcbiAgICogQHBhcmFtIHtvYmplY3R9IG9PcHRpb25zIFNvdW5kIG9wdGlvbnMgKGF0IG1pbmltdW0sIGlkIGFuZCB1cmwgcGFyYW1ldGVycyBhcmUgcmVxdWlyZWQuKVxyXG4gICAqIEByZXR1cm4ge29iamVjdH0gU01Tb3VuZCBUaGUgbmV3IFNNU291bmQgb2JqZWN0LlxyXG4gICAqL1xyXG5cclxuICB0aGlzLmNyZWF0ZVNvdW5kID0gZnVuY3Rpb24ob09wdGlvbnMsIF91cmwpIHtcclxuXHJcbiAgICB2YXIgY3MsIGNzX3N0cmluZywgb3B0aW9ucywgb1NvdW5kID0gbnVsbDtcclxuXHJcbiAgICAvLyA8ZD5cclxuICAgIGNzID0gc20gKyAnLmNyZWF0ZVNvdW5kKCk6ICc7XHJcbiAgICBjc19zdHJpbmcgPSBjcyArIHN0cighZGlkSW5pdD8nbm90UmVhZHknOidub3RPSycpO1xyXG4gICAgLy8gPC9kPlxyXG5cclxuICAgIGlmICghZGlkSW5pdCB8fCAhc20yLm9rKCkpIHtcclxuICAgICAgY29tcGxhaW4oY3Nfc3RyaW5nKTtcclxuICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgfVxyXG5cclxuICAgIGlmIChfdXJsICE9PSBfdW5kZWZpbmVkKSB7XHJcbiAgICAgIC8vIGZ1bmN0aW9uIG92ZXJsb2FkaW5nIGluIEpTISA6KSAuLmFzc3VtZSBzaW1wbGUgY3JlYXRlU291bmQoaWQsIHVybCkgdXNlIGNhc2VcclxuICAgICAgb09wdGlvbnMgPSB7XHJcbiAgICAgICAgJ2lkJzogb09wdGlvbnMsXHJcbiAgICAgICAgJ3VybCc6IF91cmxcclxuICAgICAgfTtcclxuICAgIH1cclxuXHJcbiAgICAvLyBpbmhlcml0IGZyb20gZGVmYXVsdE9wdGlvbnNcclxuICAgIG9wdGlvbnMgPSBtaXhpbihvT3B0aW9ucyk7XHJcblxyXG4gICAgb3B0aW9ucy51cmwgPSBwYXJzZVVSTChvcHRpb25zLnVybCk7XHJcblxyXG4gICAgLy8gZ2VuZXJhdGUgYW4gaWQsIGlmIG5lZWRlZC5cclxuICAgIGlmIChvcHRpb25zLmlkID09PSB1bmRlZmluZWQpIHtcclxuICAgICAgb3B0aW9ucy5pZCA9IHNtMi5zZXR1cE9wdGlvbnMuaWRQcmVmaXggKyAoaWRDb3VudGVyKyspO1xyXG4gICAgfVxyXG5cclxuICAgIC8vIDxkPlxyXG4gICAgaWYgKG9wdGlvbnMuaWQudG9TdHJpbmcoKS5jaGFyQXQoMCkubWF0Y2goL15bMC05XSQvKSkge1xyXG4gICAgICBzbTIuX3dEKGNzICsgc3RyKCdiYWRJRCcsIG9wdGlvbnMuaWQpLCAyKTtcclxuICAgIH1cclxuXHJcbiAgICBzbTIuX3dEKGNzICsgb3B0aW9ucy5pZCArIChvcHRpb25zLnVybCA/ICcgKCcgKyBvcHRpb25zLnVybCArICcpJyA6ICcnKSwgMSk7XHJcbiAgICAvLyA8L2Q+XHJcblxyXG4gICAgaWYgKGlkQ2hlY2sob3B0aW9ucy5pZCwgdHJ1ZSkpIHtcclxuICAgICAgc20yLl93RChjcyArIG9wdGlvbnMuaWQgKyAnIGV4aXN0cycsIDEpO1xyXG4gICAgICByZXR1cm4gc20yLnNvdW5kc1tvcHRpb25zLmlkXTtcclxuICAgIH1cclxuXHJcbiAgICBmdW5jdGlvbiBtYWtlKCkge1xyXG5cclxuICAgICAgb3B0aW9ucyA9IGxvb3BGaXgob3B0aW9ucyk7XHJcbiAgICAgIHNtMi5zb3VuZHNbb3B0aW9ucy5pZF0gPSBuZXcgU01Tb3VuZChvcHRpb25zKTtcclxuICAgICAgc20yLnNvdW5kSURzLnB1c2gob3B0aW9ucy5pZCk7XHJcbiAgICAgIHJldHVybiBzbTIuc291bmRzW29wdGlvbnMuaWRdO1xyXG5cclxuICAgIH1cclxuXHJcbiAgICBpZiAoaHRtbDVPSyhvcHRpb25zKSkge1xyXG5cclxuICAgICAgb1NvdW5kID0gbWFrZSgpO1xyXG4gICAgICBzbTIuX3dEKG9wdGlvbnMuaWQgKyAnOiBVc2luZyBIVE1MNScpO1xyXG4gICAgICBvU291bmQuX3NldHVwX2h0bWw1KG9wdGlvbnMpO1xyXG5cclxuICAgIH0gZWxzZSB7XHJcblxyXG4gICAgICBpZiAoc20yLmh0bWw1T25seSkge1xyXG4gICAgICAgIHNtMi5fd0Qob3B0aW9ucy5pZCArICc6IE5vIEhUTUw1IHN1cHBvcnQgZm9yIHRoaXMgc291bmQsIGFuZCBubyBGbGFzaC4gRXhpdGluZy4nKTtcclxuICAgICAgICByZXR1cm4gbWFrZSgpO1xyXG4gICAgICB9XHJcblxyXG4gICAgICAvLyBUT0RPOiBNb3ZlIEhUTUw1L2ZsYXNoIGNoZWNrcyBpbnRvIGdlbmVyaWMgVVJMIHBhcnNpbmcvaGFuZGxpbmcgZnVuY3Rpb24uXHJcblxyXG4gICAgICBpZiAoc20yLmh0bWw1LnVzaW5nRmxhc2ggJiYgb3B0aW9ucy51cmwgJiYgb3B0aW9ucy51cmwubWF0Y2goL2RhdGFcXDovaSkpIHtcclxuICAgICAgICAvLyBkYXRhOiBVUklzIG5vdCBzdXBwb3J0ZWQgYnkgRmxhc2gsIGVpdGhlci5cclxuICAgICAgICBzbTIuX3dEKG9wdGlvbnMuaWQgKyAnOiBkYXRhOiBVUklzIG5vdCBzdXBwb3J0ZWQgdmlhIEZsYXNoLiBFeGl0aW5nLicpO1xyXG4gICAgICAgIHJldHVybiBtYWtlKCk7XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIGlmIChmViA+IDgpIHtcclxuICAgICAgICBpZiAob3B0aW9ucy5pc01vdmllU3RhciA9PT0gbnVsbCkge1xyXG4gICAgICAgICAgLy8gYXR0ZW1wdCB0byBkZXRlY3QgTVBFRy00IGZvcm1hdHNcclxuICAgICAgICAgIG9wdGlvbnMuaXNNb3ZpZVN0YXIgPSAhIShvcHRpb25zLnNlcnZlclVSTCB8fCAob3B0aW9ucy50eXBlID8gb3B0aW9ucy50eXBlLm1hdGNoKG5ldFN0cmVhbU1pbWVUeXBlcykgOiBmYWxzZSkgfHwgKG9wdGlvbnMudXJsICYmIG9wdGlvbnMudXJsLm1hdGNoKG5ldFN0cmVhbVBhdHRlcm4pKSk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIC8vIDxkPlxyXG4gICAgICAgIGlmIChvcHRpb25zLmlzTW92aWVTdGFyKSB7XHJcbiAgICAgICAgICBzbTIuX3dEKGNzICsgJ3VzaW5nIE1vdmllU3RhciBoYW5kbGluZycpO1xyXG4gICAgICAgICAgaWYgKG9wdGlvbnMubG9vcHMgPiAxKSB7XHJcbiAgICAgICAgICAgIF93RFMoJ25vTlNMb29wJyk7XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICAgIC8vIDwvZD5cclxuICAgICAgfVxyXG5cclxuICAgICAgb3B0aW9ucyA9IHBvbGljeUZpeChvcHRpb25zLCBjcyk7XHJcbiAgICAgIG9Tb3VuZCA9IG1ha2UoKTtcclxuXHJcbiAgICAgIGlmIChmViA9PT0gOCkge1xyXG4gICAgICAgIGZsYXNoLl9jcmVhdGVTb3VuZChvcHRpb25zLmlkLCBvcHRpb25zLmxvb3BzfHwxLCBvcHRpb25zLnVzZVBvbGljeUZpbGUpO1xyXG4gICAgICB9IGVsc2Uge1xyXG4gICAgICAgIGZsYXNoLl9jcmVhdGVTb3VuZChvcHRpb25zLmlkLCBvcHRpb25zLnVybCwgb3B0aW9ucy51c2VQZWFrRGF0YSwgb3B0aW9ucy51c2VXYXZlZm9ybURhdGEsIG9wdGlvbnMudXNlRVFEYXRhLCBvcHRpb25zLmlzTW92aWVTdGFyLCAob3B0aW9ucy5pc01vdmllU3Rhcj9vcHRpb25zLmJ1ZmZlclRpbWU6ZmFsc2UpLCBvcHRpb25zLmxvb3BzfHwxLCBvcHRpb25zLnNlcnZlclVSTCwgb3B0aW9ucy5kdXJhdGlvbnx8bnVsbCwgb3B0aW9ucy5hdXRvUGxheSwgdHJ1ZSwgb3B0aW9ucy5hdXRvTG9hZCwgb3B0aW9ucy51c2VQb2xpY3lGaWxlKTtcclxuICAgICAgICBpZiAoIW9wdGlvbnMuc2VydmVyVVJMKSB7XHJcbiAgICAgICAgICAvLyBXZSBhcmUgY29ubmVjdGVkIGltbWVkaWF0ZWx5XHJcbiAgICAgICAgICBvU291bmQuY29ubmVjdGVkID0gdHJ1ZTtcclxuICAgICAgICAgIGlmIChvcHRpb25zLm9uY29ubmVjdCkge1xyXG4gICAgICAgICAgICBvcHRpb25zLm9uY29ubmVjdC5hcHBseShvU291bmQpO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG5cclxuICAgICAgaWYgKCFvcHRpb25zLnNlcnZlclVSTCAmJiAob3B0aW9ucy5hdXRvTG9hZCB8fCBvcHRpb25zLmF1dG9QbGF5KSkge1xyXG4gICAgICAgIC8vIGNhbGwgbG9hZCBmb3Igbm9uLXJ0bXAgc3RyZWFtc1xyXG4gICAgICAgIG9Tb3VuZC5sb2FkKG9wdGlvbnMpO1xyXG4gICAgICB9XHJcblxyXG4gICAgfVxyXG5cclxuICAgIC8vIHJ0bXAgd2lsbCBwbGF5IGluIG9uY29ubmVjdFxyXG4gICAgaWYgKCFvcHRpb25zLnNlcnZlclVSTCAmJiBvcHRpb25zLmF1dG9QbGF5KSB7XHJcbiAgICAgIG9Tb3VuZC5wbGF5KCk7XHJcbiAgICB9XHJcblxyXG4gICAgcmV0dXJuIG9Tb3VuZDtcclxuXHJcbiAgfTtcclxuXHJcbiAgLyoqXHJcbiAgICogRGVzdHJveXMgYSBTTVNvdW5kIHNvdW5kIG9iamVjdCBpbnN0YW5jZS5cclxuICAgKlxyXG4gICAqIEBwYXJhbSB7c3RyaW5nfSBzSUQgVGhlIElEIG9mIHRoZSBzb3VuZCB0byBkZXN0cm95XHJcbiAgICovXHJcblxyXG4gIHRoaXMuZGVzdHJveVNvdW5kID0gZnVuY3Rpb24oc0lELCBfYkZyb21Tb3VuZCkge1xyXG5cclxuICAgIC8vIGV4cGxpY2l0bHkgZGVzdHJveSBhIHNvdW5kIGJlZm9yZSBub3JtYWwgcGFnZSB1bmxvYWQsIGV0Yy5cclxuXHJcbiAgICBpZiAoIWlkQ2hlY2soc0lEKSkge1xyXG4gICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICB9XHJcblxyXG4gICAgdmFyIG9TID0gc20yLnNvdW5kc1tzSURdLCBpO1xyXG5cclxuICAgIC8vIERpc2FibGUgYWxsIGNhbGxiYWNrcyB3aGlsZSB0aGUgc291bmQgaXMgYmVpbmcgZGVzdHJveWVkXHJcbiAgICBvUy5faU8gPSB7fTtcclxuXHJcbiAgICBvUy5zdG9wKCk7XHJcbiAgICBvUy51bmxvYWQoKTtcclxuXHJcbiAgICBmb3IgKGkgPSAwOyBpIDwgc20yLnNvdW5kSURzLmxlbmd0aDsgaSsrKSB7XHJcbiAgICAgIGlmIChzbTIuc291bmRJRHNbaV0gPT09IHNJRCkge1xyXG4gICAgICAgIHNtMi5zb3VuZElEcy5zcGxpY2UoaSwgMSk7XHJcbiAgICAgICAgYnJlYWs7XHJcbiAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBpZiAoIV9iRnJvbVNvdW5kKSB7XHJcbiAgICAgIC8vIGlnbm9yZSBpZiBiZWluZyBjYWxsZWQgZnJvbSBTTVNvdW5kIGluc3RhbmNlXHJcbiAgICAgIG9TLmRlc3RydWN0KHRydWUpO1xyXG4gICAgfVxyXG5cclxuICAgIG9TID0gbnVsbDtcclxuICAgIGRlbGV0ZSBzbTIuc291bmRzW3NJRF07XHJcblxyXG4gICAgcmV0dXJuIHRydWU7XHJcblxyXG4gIH07XHJcblxyXG4gIC8qKlxyXG4gICAqIENhbGxzIHRoZSBsb2FkKCkgbWV0aG9kIG9mIGEgU01Tb3VuZCBvYmplY3QgYnkgSUQuXHJcbiAgICpcclxuICAgKiBAcGFyYW0ge3N0cmluZ30gc0lEIFRoZSBJRCBvZiB0aGUgc291bmRcclxuICAgKiBAcGFyYW0ge29iamVjdH0gb09wdGlvbnMgT3B0aW9uYWw6IFNvdW5kIG9wdGlvbnNcclxuICAgKi9cclxuXHJcbiAgdGhpcy5sb2FkID0gZnVuY3Rpb24oc0lELCBvT3B0aW9ucykge1xyXG5cclxuICAgIGlmICghaWRDaGVjayhzSUQpKSB7XHJcbiAgICAgIHJldHVybiBmYWxzZTtcclxuICAgIH1cclxuICAgIHJldHVybiBzbTIuc291bmRzW3NJRF0ubG9hZChvT3B0aW9ucyk7XHJcblxyXG4gIH07XHJcblxyXG4gIC8qKlxyXG4gICAqIENhbGxzIHRoZSB1bmxvYWQoKSBtZXRob2Qgb2YgYSBTTVNvdW5kIG9iamVjdCBieSBJRC5cclxuICAgKlxyXG4gICAqIEBwYXJhbSB7c3RyaW5nfSBzSUQgVGhlIElEIG9mIHRoZSBzb3VuZFxyXG4gICAqL1xyXG5cclxuICB0aGlzLnVubG9hZCA9IGZ1bmN0aW9uKHNJRCkge1xyXG5cclxuICAgIGlmICghaWRDaGVjayhzSUQpKSB7XHJcbiAgICAgIHJldHVybiBmYWxzZTtcclxuICAgIH1cclxuICAgIHJldHVybiBzbTIuc291bmRzW3NJRF0udW5sb2FkKCk7XHJcblxyXG4gIH07XHJcblxyXG4gIC8qKlxyXG4gICAqIENhbGxzIHRoZSBvblBvc2l0aW9uKCkgbWV0aG9kIG9mIGEgU01Tb3VuZCBvYmplY3QgYnkgSUQuXHJcbiAgICpcclxuICAgKiBAcGFyYW0ge3N0cmluZ30gc0lEIFRoZSBJRCBvZiB0aGUgc291bmRcclxuICAgKiBAcGFyYW0ge251bWJlcn0gblBvc2l0aW9uIFRoZSBwb3NpdGlvbiB0byB3YXRjaCBmb3JcclxuICAgKiBAcGFyYW0ge2Z1bmN0aW9ufSBvTWV0aG9kIFRoZSByZWxldmFudCBjYWxsYmFjayB0byBmaXJlXHJcbiAgICogQHBhcmFtIHtvYmplY3R9IG9TY29wZSBPcHRpb25hbDogVGhlIHNjb3BlIHRvIGFwcGx5IHRoZSBjYWxsYmFjayB0b1xyXG4gICAqIEByZXR1cm4ge1NNU291bmR9IFRoZSBTTVNvdW5kIG9iamVjdFxyXG4gICAqL1xyXG5cclxuICB0aGlzLm9uUG9zaXRpb24gPSBmdW5jdGlvbihzSUQsIG5Qb3NpdGlvbiwgb01ldGhvZCwgb1Njb3BlKSB7XHJcblxyXG4gICAgaWYgKCFpZENoZWNrKHNJRCkpIHtcclxuICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgfVxyXG4gICAgcmV0dXJuIHNtMi5zb3VuZHNbc0lEXS5vbnBvc2l0aW9uKG5Qb3NpdGlvbiwgb01ldGhvZCwgb1Njb3BlKTtcclxuXHJcbiAgfTtcclxuXHJcbiAgLy8gbGVnYWN5L2JhY2t3YXJkcy1jb21wYWJpbGl0eTogbG93ZXItY2FzZSBtZXRob2QgbmFtZVxyXG4gIHRoaXMub25wb3NpdGlvbiA9IHRoaXMub25Qb3NpdGlvbjtcclxuXHJcbiAgLyoqXHJcbiAgICogQ2FsbHMgdGhlIGNsZWFyT25Qb3NpdGlvbigpIG1ldGhvZCBvZiBhIFNNU291bmQgb2JqZWN0IGJ5IElELlxyXG4gICAqXHJcbiAgICogQHBhcmFtIHtzdHJpbmd9IHNJRCBUaGUgSUQgb2YgdGhlIHNvdW5kXHJcbiAgICogQHBhcmFtIHtudW1iZXJ9IG5Qb3NpdGlvbiBUaGUgcG9zaXRpb24gdG8gd2F0Y2ggZm9yXHJcbiAgICogQHBhcmFtIHtmdW5jdGlvbn0gb01ldGhvZCBPcHRpb25hbDogVGhlIHJlbGV2YW50IGNhbGxiYWNrIHRvIGZpcmVcclxuICAgKiBAcmV0dXJuIHtTTVNvdW5kfSBUaGUgU01Tb3VuZCBvYmplY3RcclxuICAgKi9cclxuXHJcbiAgdGhpcy5jbGVhck9uUG9zaXRpb24gPSBmdW5jdGlvbihzSUQsIG5Qb3NpdGlvbiwgb01ldGhvZCkge1xyXG5cclxuICAgIGlmICghaWRDaGVjayhzSUQpKSB7XHJcbiAgICAgIHJldHVybiBmYWxzZTtcclxuICAgIH1cclxuICAgIHJldHVybiBzbTIuc291bmRzW3NJRF0uY2xlYXJPblBvc2l0aW9uKG5Qb3NpdGlvbiwgb01ldGhvZCk7XHJcblxyXG4gIH07XHJcblxyXG4gIC8qKlxyXG4gICAqIENhbGxzIHRoZSBwbGF5KCkgbWV0aG9kIG9mIGEgU01Tb3VuZCBvYmplY3QgYnkgSUQuXHJcbiAgICpcclxuICAgKiBAcGFyYW0ge3N0cmluZ30gc0lEIFRoZSBJRCBvZiB0aGUgc291bmRcclxuICAgKiBAcGFyYW0ge29iamVjdH0gb09wdGlvbnMgT3B0aW9uYWw6IFNvdW5kIG9wdGlvbnNcclxuICAgKiBAcmV0dXJuIHtTTVNvdW5kfSBUaGUgU01Tb3VuZCBvYmplY3RcclxuICAgKi9cclxuXHJcbiAgdGhpcy5wbGF5ID0gZnVuY3Rpb24oc0lELCBvT3B0aW9ucykge1xyXG5cclxuICAgIHZhciByZXN1bHQgPSBudWxsLFxyXG4gICAgICAgIC8vIGxlZ2FjeSBmdW5jdGlvbi1vdmVybG9hZGluZyB1c2UgY2FzZTogcGxheSgnbXlTb3VuZCcsICcvcGF0aC90by9zb21lLm1wMycpO1xyXG4gICAgICAgIG92ZXJsb2FkZWQgPSAob09wdGlvbnMgJiYgIShvT3B0aW9ucyBpbnN0YW5jZW9mIE9iamVjdCkpO1xyXG5cclxuICAgIGlmICghZGlkSW5pdCB8fCAhc20yLm9rKCkpIHtcclxuICAgICAgY29tcGxhaW4oc20gKyAnLnBsYXkoKTogJyArIHN0cighZGlkSW5pdD8nbm90UmVhZHknOidub3RPSycpKTtcclxuICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgfVxyXG5cclxuICAgIGlmICghaWRDaGVjayhzSUQsIG92ZXJsb2FkZWQpKSB7XHJcblxyXG4gICAgICBpZiAoIW92ZXJsb2FkZWQpIHtcclxuICAgICAgICAvLyBubyBzb3VuZCBmb3VuZCBmb3IgdGhlIGdpdmVuIElELiBCYWlsLlxyXG4gICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgICAgfVxyXG5cclxuICAgICAgaWYgKG92ZXJsb2FkZWQpIHtcclxuICAgICAgICBvT3B0aW9ucyA9IHtcclxuICAgICAgICAgIHVybDogb09wdGlvbnNcclxuICAgICAgICB9O1xyXG4gICAgICB9XHJcblxyXG4gICAgICBpZiAob09wdGlvbnMgJiYgb09wdGlvbnMudXJsKSB7XHJcbiAgICAgICAgLy8gb3ZlcmxvYWRpbmcgdXNlIGNhc2UsIGNyZWF0ZStwbGF5OiAucGxheSgnc29tZUlEJywge3VybDonL3BhdGgvdG8ubXAzJ30pO1xyXG4gICAgICAgIHNtMi5fd0Qoc20gKyAnLnBsYXkoKTogQXR0ZW1wdGluZyB0byBjcmVhdGUgXCInICsgc0lEICsgJ1wiJywgMSk7XHJcbiAgICAgICAgb09wdGlvbnMuaWQgPSBzSUQ7XHJcbiAgICAgICAgcmVzdWx0ID0gc20yLmNyZWF0ZVNvdW5kKG9PcHRpb25zKS5wbGF5KCk7XHJcbiAgICAgIH1cclxuXHJcbiAgICB9IGVsc2UgaWYgKG92ZXJsb2FkZWQpIHtcclxuXHJcbiAgICAgIC8vIGV4aXN0aW5nIHNvdW5kIG9iamVjdCBjYXNlXHJcbiAgICAgIG9PcHRpb25zID0ge1xyXG4gICAgICAgIHVybDogb09wdGlvbnNcclxuICAgICAgfTtcclxuXHJcbiAgICB9XHJcblxyXG4gICAgaWYgKHJlc3VsdCA9PT0gbnVsbCkge1xyXG4gICAgICAvLyBkZWZhdWx0IGNhc2VcclxuICAgICAgcmVzdWx0ID0gc20yLnNvdW5kc1tzSURdLnBsYXkob09wdGlvbnMpO1xyXG4gICAgfVxyXG5cclxuICAgIHJldHVybiByZXN1bHQ7XHJcblxyXG4gIH07XHJcblxyXG4gIHRoaXMuc3RhcnQgPSB0aGlzLnBsYXk7IC8vIGp1c3QgZm9yIGNvbnZlbmllbmNlXHJcblxyXG4gIC8qKlxyXG4gICAqIENhbGxzIHRoZSBzZXRQb3NpdGlvbigpIG1ldGhvZCBvZiBhIFNNU291bmQgb2JqZWN0IGJ5IElELlxyXG4gICAqXHJcbiAgICogQHBhcmFtIHtzdHJpbmd9IHNJRCBUaGUgSUQgb2YgdGhlIHNvdW5kXHJcbiAgICogQHBhcmFtIHtudW1iZXJ9IG5Nc2VjT2Zmc2V0IFBvc2l0aW9uIChtaWxsaXNlY29uZHMpXHJcbiAgICogQHJldHVybiB7U01Tb3VuZH0gVGhlIFNNU291bmQgb2JqZWN0XHJcbiAgICovXHJcblxyXG4gIHRoaXMuc2V0UG9zaXRpb24gPSBmdW5jdGlvbihzSUQsIG5Nc2VjT2Zmc2V0KSB7XHJcblxyXG4gICAgaWYgKCFpZENoZWNrKHNJRCkpIHtcclxuICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgfVxyXG4gICAgcmV0dXJuIHNtMi5zb3VuZHNbc0lEXS5zZXRQb3NpdGlvbihuTXNlY09mZnNldCk7XHJcblxyXG4gIH07XHJcblxyXG4gIC8qKlxyXG4gICAqIENhbGxzIHRoZSBzdG9wKCkgbWV0aG9kIG9mIGEgU01Tb3VuZCBvYmplY3QgYnkgSUQuXHJcbiAgICpcclxuICAgKiBAcGFyYW0ge3N0cmluZ30gc0lEIFRoZSBJRCBvZiB0aGUgc291bmRcclxuICAgKiBAcmV0dXJuIHtTTVNvdW5kfSBUaGUgU01Tb3VuZCBvYmplY3RcclxuICAgKi9cclxuXHJcbiAgdGhpcy5zdG9wID0gZnVuY3Rpb24oc0lEKSB7XHJcblxyXG4gICAgaWYgKCFpZENoZWNrKHNJRCkpIHtcclxuICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgfVxyXG5cclxuICAgIHNtMi5fd0Qoc20gKyAnLnN0b3AoJyArIHNJRCArICcpJywgMSk7XHJcbiAgICByZXR1cm4gc20yLnNvdW5kc1tzSURdLnN0b3AoKTtcclxuXHJcbiAgfTtcclxuXHJcbiAgLyoqXHJcbiAgICogU3RvcHMgYWxsIGN1cnJlbnRseS1wbGF5aW5nIHNvdW5kcy5cclxuICAgKi9cclxuXHJcbiAgdGhpcy5zdG9wQWxsID0gZnVuY3Rpb24oKSB7XHJcblxyXG4gICAgdmFyIG9Tb3VuZDtcclxuICAgIHNtMi5fd0Qoc20gKyAnLnN0b3BBbGwoKScsIDEpO1xyXG5cclxuICAgIGZvciAob1NvdW5kIGluIHNtMi5zb3VuZHMpIHtcclxuICAgICAgaWYgKHNtMi5zb3VuZHMuaGFzT3duUHJvcGVydHkob1NvdW5kKSkge1xyXG4gICAgICAgIC8vIGFwcGx5IG9ubHkgdG8gc291bmQgb2JqZWN0c1xyXG4gICAgICAgIHNtMi5zb3VuZHNbb1NvdW5kXS5zdG9wKCk7XHJcbiAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgfTtcclxuXHJcbiAgLyoqXHJcbiAgICogQ2FsbHMgdGhlIHBhdXNlKCkgbWV0aG9kIG9mIGEgU01Tb3VuZCBvYmplY3QgYnkgSUQuXHJcbiAgICpcclxuICAgKiBAcGFyYW0ge3N0cmluZ30gc0lEIFRoZSBJRCBvZiB0aGUgc291bmRcclxuICAgKiBAcmV0dXJuIHtTTVNvdW5kfSBUaGUgU01Tb3VuZCBvYmplY3RcclxuICAgKi9cclxuXHJcbiAgdGhpcy5wYXVzZSA9IGZ1bmN0aW9uKHNJRCkge1xyXG5cclxuICAgIGlmICghaWRDaGVjayhzSUQpKSB7XHJcbiAgICAgIHJldHVybiBmYWxzZTtcclxuICAgIH1cclxuICAgIHJldHVybiBzbTIuc291bmRzW3NJRF0ucGF1c2UoKTtcclxuXHJcbiAgfTtcclxuXHJcbiAgLyoqXHJcbiAgICogUGF1c2VzIGFsbCBjdXJyZW50bHktcGxheWluZyBzb3VuZHMuXHJcbiAgICovXHJcblxyXG4gIHRoaXMucGF1c2VBbGwgPSBmdW5jdGlvbigpIHtcclxuXHJcbiAgICB2YXIgaTtcclxuICAgIGZvciAoaSA9IHNtMi5zb3VuZElEcy5sZW5ndGgtMTsgaSA+PSAwOyBpLS0pIHtcclxuICAgICAgc20yLnNvdW5kc1tzbTIuc291bmRJRHNbaV1dLnBhdXNlKCk7XHJcbiAgICB9XHJcblxyXG4gIH07XHJcblxyXG4gIC8qKlxyXG4gICAqIENhbGxzIHRoZSByZXN1bWUoKSBtZXRob2Qgb2YgYSBTTVNvdW5kIG9iamVjdCBieSBJRC5cclxuICAgKlxyXG4gICAqIEBwYXJhbSB7c3RyaW5nfSBzSUQgVGhlIElEIG9mIHRoZSBzb3VuZFxyXG4gICAqIEByZXR1cm4ge1NNU291bmR9IFRoZSBTTVNvdW5kIG9iamVjdFxyXG4gICAqL1xyXG5cclxuICB0aGlzLnJlc3VtZSA9IGZ1bmN0aW9uKHNJRCkge1xyXG5cclxuICAgIGlmICghaWRDaGVjayhzSUQpKSB7XHJcbiAgICAgIHJldHVybiBmYWxzZTtcclxuICAgIH1cclxuICAgIHJldHVybiBzbTIuc291bmRzW3NJRF0ucmVzdW1lKCk7XHJcblxyXG4gIH07XHJcblxyXG4gIC8qKlxyXG4gICAqIFJlc3VtZXMgYWxsIGN1cnJlbnRseS1wYXVzZWQgc291bmRzLlxyXG4gICAqL1xyXG5cclxuICB0aGlzLnJlc3VtZUFsbCA9IGZ1bmN0aW9uKCkge1xyXG5cclxuICAgIHZhciBpO1xyXG4gICAgZm9yIChpID0gc20yLnNvdW5kSURzLmxlbmd0aC0xOyBpID49IDA7IGktLSkge1xyXG4gICAgICBzbTIuc291bmRzW3NtMi5zb3VuZElEc1tpXV0ucmVzdW1lKCk7XHJcbiAgICB9XHJcblxyXG4gIH07XHJcblxyXG4gIC8qKlxyXG4gICAqIENhbGxzIHRoZSB0b2dnbGVQYXVzZSgpIG1ldGhvZCBvZiBhIFNNU291bmQgb2JqZWN0IGJ5IElELlxyXG4gICAqXHJcbiAgICogQHBhcmFtIHtzdHJpbmd9IHNJRCBUaGUgSUQgb2YgdGhlIHNvdW5kXHJcbiAgICogQHJldHVybiB7U01Tb3VuZH0gVGhlIFNNU291bmQgb2JqZWN0XHJcbiAgICovXHJcblxyXG4gIHRoaXMudG9nZ2xlUGF1c2UgPSBmdW5jdGlvbihzSUQpIHtcclxuXHJcbiAgICBpZiAoIWlkQ2hlY2soc0lEKSkge1xyXG4gICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICB9XHJcbiAgICByZXR1cm4gc20yLnNvdW5kc1tzSURdLnRvZ2dsZVBhdXNlKCk7XHJcblxyXG4gIH07XHJcblxyXG4gIC8qKlxyXG4gICAqIENhbGxzIHRoZSBzZXRQYW4oKSBtZXRob2Qgb2YgYSBTTVNvdW5kIG9iamVjdCBieSBJRC5cclxuICAgKlxyXG4gICAqIEBwYXJhbSB7c3RyaW5nfSBzSUQgVGhlIElEIG9mIHRoZSBzb3VuZFxyXG4gICAqIEBwYXJhbSB7bnVtYmVyfSBuUGFuIFRoZSBwYW4gdmFsdWUgKC0xMDAgdG8gMTAwKVxyXG4gICAqIEByZXR1cm4ge1NNU291bmR9IFRoZSBTTVNvdW5kIG9iamVjdFxyXG4gICAqL1xyXG5cclxuICB0aGlzLnNldFBhbiA9IGZ1bmN0aW9uKHNJRCwgblBhbikge1xyXG5cclxuICAgIGlmICghaWRDaGVjayhzSUQpKSB7XHJcbiAgICAgIHJldHVybiBmYWxzZTtcclxuICAgIH1cclxuICAgIHJldHVybiBzbTIuc291bmRzW3NJRF0uc2V0UGFuKG5QYW4pO1xyXG5cclxuICB9O1xyXG5cclxuICAvKipcclxuICAgKiBDYWxscyB0aGUgc2V0Vm9sdW1lKCkgbWV0aG9kIG9mIGEgU01Tb3VuZCBvYmplY3QgYnkgSUQuXHJcbiAgICpcclxuICAgKiBAcGFyYW0ge3N0cmluZ30gc0lEIFRoZSBJRCBvZiB0aGUgc291bmRcclxuICAgKiBAcGFyYW0ge251bWJlcn0gblZvbCBUaGUgdm9sdW1lIHZhbHVlICgwIHRvIDEwMClcclxuICAgKiBAcmV0dXJuIHtTTVNvdW5kfSBUaGUgU01Tb3VuZCBvYmplY3RcclxuICAgKi9cclxuXHJcbiAgdGhpcy5zZXRWb2x1bWUgPSBmdW5jdGlvbihzSUQsIG5Wb2wpIHtcclxuXHJcbiAgICBpZiAoIWlkQ2hlY2soc0lEKSkge1xyXG4gICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICB9XHJcbiAgICByZXR1cm4gc20yLnNvdW5kc1tzSURdLnNldFZvbHVtZShuVm9sKTtcclxuXHJcbiAgfTtcclxuXHJcbiAgLyoqXHJcbiAgICogQ2FsbHMgdGhlIG11dGUoKSBtZXRob2Qgb2YgZWl0aGVyIGEgc2luZ2xlIFNNU291bmQgb2JqZWN0IGJ5IElELCBvciBhbGwgc291bmQgb2JqZWN0cy5cclxuICAgKlxyXG4gICAqIEBwYXJhbSB7c3RyaW5nfSBzSUQgT3B0aW9uYWw6IFRoZSBJRCBvZiB0aGUgc291bmQgKGlmIG9taXR0ZWQsIGFsbCBzb3VuZHMgd2lsbCBiZSB1c2VkLilcclxuICAgKi9cclxuXHJcbiAgdGhpcy5tdXRlID0gZnVuY3Rpb24oc0lEKSB7XHJcblxyXG4gICAgdmFyIGkgPSAwO1xyXG5cclxuICAgIGlmIChzSUQgaW5zdGFuY2VvZiBTdHJpbmcpIHtcclxuICAgICAgc0lEID0gbnVsbDtcclxuICAgIH1cclxuXHJcbiAgICBpZiAoIXNJRCkge1xyXG5cclxuICAgICAgc20yLl93RChzbSArICcubXV0ZSgpOiBNdXRpbmcgYWxsIHNvdW5kcycpO1xyXG4gICAgICBmb3IgKGkgPSBzbTIuc291bmRJRHMubGVuZ3RoLTE7IGkgPj0gMDsgaS0tKSB7XHJcbiAgICAgICAgc20yLnNvdW5kc1tzbTIuc291bmRJRHNbaV1dLm11dGUoKTtcclxuICAgICAgfVxyXG4gICAgICBzbTIubXV0ZWQgPSB0cnVlO1xyXG5cclxuICAgIH0gZWxzZSB7XHJcblxyXG4gICAgICBpZiAoIWlkQ2hlY2soc0lEKSkge1xyXG4gICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgICAgfVxyXG4gICAgICBzbTIuX3dEKHNtICsgJy5tdXRlKCk6IE11dGluZyBcIicgKyBzSUQgKyAnXCInKTtcclxuICAgICAgcmV0dXJuIHNtMi5zb3VuZHNbc0lEXS5tdXRlKCk7XHJcblxyXG4gICAgfVxyXG5cclxuICAgIHJldHVybiB0cnVlO1xyXG5cclxuICB9O1xyXG5cclxuICAvKipcclxuICAgKiBNdXRlcyBhbGwgc291bmRzLlxyXG4gICAqL1xyXG5cclxuICB0aGlzLm11dGVBbGwgPSBmdW5jdGlvbigpIHtcclxuXHJcbiAgICBzbTIubXV0ZSgpO1xyXG5cclxuICB9O1xyXG5cclxuICAvKipcclxuICAgKiBDYWxscyB0aGUgdW5tdXRlKCkgbWV0aG9kIG9mIGVpdGhlciBhIHNpbmdsZSBTTVNvdW5kIG9iamVjdCBieSBJRCwgb3IgYWxsIHNvdW5kIG9iamVjdHMuXHJcbiAgICpcclxuICAgKiBAcGFyYW0ge3N0cmluZ30gc0lEIE9wdGlvbmFsOiBUaGUgSUQgb2YgdGhlIHNvdW5kIChpZiBvbWl0dGVkLCBhbGwgc291bmRzIHdpbGwgYmUgdXNlZC4pXHJcbiAgICovXHJcblxyXG4gIHRoaXMudW5tdXRlID0gZnVuY3Rpb24oc0lEKSB7XHJcblxyXG4gICAgdmFyIGk7XHJcblxyXG4gICAgaWYgKHNJRCBpbnN0YW5jZW9mIFN0cmluZykge1xyXG4gICAgICBzSUQgPSBudWxsO1xyXG4gICAgfVxyXG5cclxuICAgIGlmICghc0lEKSB7XHJcblxyXG4gICAgICBzbTIuX3dEKHNtICsgJy51bm11dGUoKTogVW5tdXRpbmcgYWxsIHNvdW5kcycpO1xyXG4gICAgICBmb3IgKGkgPSBzbTIuc291bmRJRHMubGVuZ3RoLTE7IGkgPj0gMDsgaS0tKSB7XHJcbiAgICAgICAgc20yLnNvdW5kc1tzbTIuc291bmRJRHNbaV1dLnVubXV0ZSgpO1xyXG4gICAgICB9XHJcbiAgICAgIHNtMi5tdXRlZCA9IGZhbHNlO1xyXG5cclxuICAgIH0gZWxzZSB7XHJcblxyXG4gICAgICBpZiAoIWlkQ2hlY2soc0lEKSkge1xyXG4gICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgICAgfVxyXG4gICAgICBzbTIuX3dEKHNtICsgJy51bm11dGUoKTogVW5tdXRpbmcgXCInICsgc0lEICsgJ1wiJyk7XHJcbiAgICAgIHJldHVybiBzbTIuc291bmRzW3NJRF0udW5tdXRlKCk7XHJcblxyXG4gICAgfVxyXG5cclxuICAgIHJldHVybiB0cnVlO1xyXG5cclxuICB9O1xyXG5cclxuICAvKipcclxuICAgKiBVbm11dGVzIGFsbCBzb3VuZHMuXHJcbiAgICovXHJcblxyXG4gIHRoaXMudW5tdXRlQWxsID0gZnVuY3Rpb24oKSB7XHJcblxyXG4gICAgc20yLnVubXV0ZSgpO1xyXG5cclxuICB9O1xyXG5cclxuICAvKipcclxuICAgKiBDYWxscyB0aGUgdG9nZ2xlTXV0ZSgpIG1ldGhvZCBvZiBhIFNNU291bmQgb2JqZWN0IGJ5IElELlxyXG4gICAqXHJcbiAgICogQHBhcmFtIHtzdHJpbmd9IHNJRCBUaGUgSUQgb2YgdGhlIHNvdW5kXHJcbiAgICogQHJldHVybiB7U01Tb3VuZH0gVGhlIFNNU291bmQgb2JqZWN0XHJcbiAgICovXHJcblxyXG4gIHRoaXMudG9nZ2xlTXV0ZSA9IGZ1bmN0aW9uKHNJRCkge1xyXG5cclxuICAgIGlmICghaWRDaGVjayhzSUQpKSB7XHJcbiAgICAgIHJldHVybiBmYWxzZTtcclxuICAgIH1cclxuICAgIHJldHVybiBzbTIuc291bmRzW3NJRF0udG9nZ2xlTXV0ZSgpO1xyXG5cclxuICB9O1xyXG5cclxuICAvKipcclxuICAgKiBSZXRyaWV2ZXMgdGhlIG1lbW9yeSB1c2VkIGJ5IHRoZSBmbGFzaCBwbHVnaW4uXHJcbiAgICpcclxuICAgKiBAcmV0dXJuIHtudW1iZXJ9IFRoZSBhbW91bnQgb2YgbWVtb3J5IGluIHVzZVxyXG4gICAqL1xyXG5cclxuICB0aGlzLmdldE1lbW9yeVVzZSA9IGZ1bmN0aW9uKCkge1xyXG5cclxuICAgIC8vIGZsYXNoLW9ubHlcclxuICAgIHZhciByYW0gPSAwO1xyXG5cclxuICAgIGlmIChmbGFzaCAmJiBmViAhPT0gOCkge1xyXG4gICAgICByYW0gPSBwYXJzZUludChmbGFzaC5fZ2V0TWVtb3J5VXNlKCksIDEwKTtcclxuICAgIH1cclxuXHJcbiAgICByZXR1cm4gcmFtO1xyXG5cclxuICB9O1xyXG5cclxuICAvKipcclxuICAgKiBVbmRvY3VtZW50ZWQ6IE5PUHMgc291bmRNYW5hZ2VyIGFuZCBhbGwgU01Tb3VuZCBvYmplY3RzLlxyXG4gICAqL1xyXG5cclxuICB0aGlzLmRpc2FibGUgPSBmdW5jdGlvbihiTm9EaXNhYmxlKSB7XHJcblxyXG4gICAgLy8gZGVzdHJveSBhbGwgZnVuY3Rpb25zXHJcbiAgICB2YXIgaTtcclxuXHJcbiAgICBpZiAoYk5vRGlzYWJsZSA9PT0gX3VuZGVmaW5lZCkge1xyXG4gICAgICBiTm9EaXNhYmxlID0gZmFsc2U7XHJcbiAgICB9XHJcblxyXG4gICAgaWYgKGRpc2FibGVkKSB7XHJcbiAgICAgIHJldHVybiBmYWxzZTtcclxuICAgIH1cclxuXHJcbiAgICBkaXNhYmxlZCA9IHRydWU7XHJcbiAgICBfd0RTKCdzaHV0ZG93bicsIDEpO1xyXG5cclxuICAgIGZvciAoaSA9IHNtMi5zb3VuZElEcy5sZW5ndGgtMTsgaSA+PSAwOyBpLS0pIHtcclxuICAgICAgZGlzYWJsZU9iamVjdChzbTIuc291bmRzW3NtMi5zb3VuZElEc1tpXV0pO1xyXG4gICAgfVxyXG5cclxuICAgIC8vIGZpcmUgXCJjb21wbGV0ZVwiLCBkZXNwaXRlIGZhaWxcclxuICAgIGluaXRDb21wbGV0ZShiTm9EaXNhYmxlKTtcclxuICAgIGV2ZW50LnJlbW92ZSh3aW5kb3csICdsb2FkJywgaW5pdFVzZXJPbmxvYWQpO1xyXG5cclxuICAgIHJldHVybiB0cnVlO1xyXG5cclxuICB9O1xyXG5cclxuICAvKipcclxuICAgKiBEZXRlcm1pbmVzIHBsYXlhYmlsaXR5IG9mIGEgTUlNRSB0eXBlLCBlZy4gJ2F1ZGlvL21wMycuXHJcbiAgICovXHJcblxyXG4gIHRoaXMuY2FuUGxheU1JTUUgPSBmdW5jdGlvbihzTUlNRSkge1xyXG5cclxuICAgIHZhciByZXN1bHQ7XHJcblxyXG4gICAgaWYgKHNtMi5oYXNIVE1MNSkge1xyXG4gICAgICByZXN1bHQgPSBodG1sNUNhblBsYXkoe3R5cGU6c01JTUV9KTtcclxuICAgIH1cclxuXHJcbiAgICBpZiAoIXJlc3VsdCAmJiBuZWVkc0ZsYXNoKSB7XHJcbiAgICAgIC8vIGlmIGZsYXNoIDksIHRlc3QgbmV0U3RyZWFtIChtb3ZpZVN0YXIpIHR5cGVzIGFzIHdlbGwuXHJcbiAgICAgIHJlc3VsdCA9IChzTUlNRSAmJiBzbTIub2soKSA/ICEhKChmViA+IDggPyBzTUlNRS5tYXRjaChuZXRTdHJlYW1NaW1lVHlwZXMpIDogbnVsbCkgfHwgc01JTUUubWF0Y2goc20yLm1pbWVQYXR0ZXJuKSkgOiBudWxsKTsgLy8gVE9ETzogbWFrZSBsZXNzIFwid2VpcmRcIiAocGVyIEpTTGludClcclxuICAgIH1cclxuXHJcbiAgICByZXR1cm4gcmVzdWx0O1xyXG5cclxuICB9O1xyXG5cclxuICAvKipcclxuICAgKiBEZXRlcm1pbmVzIHBsYXlhYmlsaXR5IG9mIGEgVVJMIGJhc2VkIG9uIGF1ZGlvIHN1cHBvcnQuXHJcbiAgICpcclxuICAgKiBAcGFyYW0ge3N0cmluZ30gc1VSTCBUaGUgVVJMIHRvIHRlc3RcclxuICAgKiBAcmV0dXJuIHtib29sZWFufSBVUkwgcGxheWFiaWxpdHlcclxuICAgKi9cclxuXHJcbiAgdGhpcy5jYW5QbGF5VVJMID0gZnVuY3Rpb24oc1VSTCkge1xyXG5cclxuICAgIHZhciByZXN1bHQ7XHJcblxyXG4gICAgaWYgKHNtMi5oYXNIVE1MNSkge1xyXG4gICAgICByZXN1bHQgPSBodG1sNUNhblBsYXkoe3VybDogc1VSTH0pO1xyXG4gICAgfVxyXG5cclxuICAgIGlmICghcmVzdWx0ICYmIG5lZWRzRmxhc2gpIHtcclxuICAgICAgcmVzdWx0ID0gKHNVUkwgJiYgc20yLm9rKCkgPyAhIShzVVJMLm1hdGNoKHNtMi5maWxlUGF0dGVybikpIDogbnVsbCk7XHJcbiAgICB9XHJcblxyXG4gICAgcmV0dXJuIHJlc3VsdDtcclxuXHJcbiAgfTtcclxuXHJcbiAgLyoqXHJcbiAgICogRGV0ZXJtaW5lcyBwbGF5YWJpbGl0eSBvZiBhbiBIVE1MIERPTSAmbHQ7YSZndDsgb2JqZWN0IChvciBzaW1pbGFyIG9iamVjdCBsaXRlcmFsKSBiYXNlZCBvbiBhdWRpbyBzdXBwb3J0LlxyXG4gICAqXHJcbiAgICogQHBhcmFtIHtvYmplY3R9IG9MaW5rIGFuIEhUTUwgRE9NICZsdDthJmd0OyBvYmplY3Qgb3Igb2JqZWN0IGxpdGVyYWwgaW5jbHVkaW5nIGhyZWYgYW5kL29yIHR5cGUgYXR0cmlidXRlc1xyXG4gICAqIEByZXR1cm4ge2Jvb2xlYW59IFVSTCBwbGF5YWJpbGl0eVxyXG4gICAqL1xyXG5cclxuICB0aGlzLmNhblBsYXlMaW5rID0gZnVuY3Rpb24ob0xpbmspIHtcclxuXHJcbiAgICBpZiAob0xpbmsudHlwZSAhPT0gX3VuZGVmaW5lZCAmJiBvTGluay50eXBlKSB7XHJcbiAgICAgIGlmIChzbTIuY2FuUGxheU1JTUUob0xpbmsudHlwZSkpIHtcclxuICAgICAgICByZXR1cm4gdHJ1ZTtcclxuICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIHJldHVybiBzbTIuY2FuUGxheVVSTChvTGluay5ocmVmKTtcclxuXHJcbiAgfTtcclxuXHJcbiAgLyoqXHJcbiAgICogUmV0cmlldmVzIGEgU01Tb3VuZCBvYmplY3QgYnkgSUQuXHJcbiAgICpcclxuICAgKiBAcGFyYW0ge3N0cmluZ30gc0lEIFRoZSBJRCBvZiB0aGUgc291bmRcclxuICAgKiBAcmV0dXJuIHtTTVNvdW5kfSBUaGUgU01Tb3VuZCBvYmplY3RcclxuICAgKi9cclxuXHJcbiAgdGhpcy5nZXRTb3VuZEJ5SWQgPSBmdW5jdGlvbihzSUQsIF9zdXBwcmVzc0RlYnVnKSB7XHJcblxyXG4gICAgaWYgKCFzSUQpIHtcclxuICAgICAgcmV0dXJuIG51bGw7XHJcbiAgICB9XHJcblxyXG4gICAgdmFyIHJlc3VsdCA9IHNtMi5zb3VuZHNbc0lEXTtcclxuXHJcbiAgICAvLyA8ZD5cclxuICAgIGlmICghcmVzdWx0ICYmICFfc3VwcHJlc3NEZWJ1Zykge1xyXG4gICAgICBzbTIuX3dEKHNtICsgJy5nZXRTb3VuZEJ5SWQoKTogU291bmQgXCInICsgc0lEICsgJ1wiIG5vdCBmb3VuZC4nLCAyKTtcclxuICAgIH1cclxuICAgIC8vIDwvZD5cclxuXHJcbiAgICByZXR1cm4gcmVzdWx0O1xyXG5cclxuICB9O1xyXG5cclxuICAvKipcclxuICAgKiBRdWV1ZXMgYSBjYWxsYmFjayBmb3IgZXhlY3V0aW9uIHdoZW4gU291bmRNYW5hZ2VyIGhhcyBzdWNjZXNzZnVsbHkgaW5pdGlhbGl6ZWQuXHJcbiAgICpcclxuICAgKiBAcGFyYW0ge2Z1bmN0aW9ufSBvTWV0aG9kIFRoZSBjYWxsYmFjayBtZXRob2QgdG8gZmlyZVxyXG4gICAqIEBwYXJhbSB7b2JqZWN0fSBvU2NvcGUgT3B0aW9uYWw6IFRoZSBzY29wZSB0byBhcHBseSB0byB0aGUgY2FsbGJhY2tcclxuICAgKi9cclxuXHJcbiAgdGhpcy5vbnJlYWR5ID0gZnVuY3Rpb24ob01ldGhvZCwgb1Njb3BlKSB7XHJcblxyXG4gICAgdmFyIHNUeXBlID0gJ29ucmVhZHknLFxyXG4gICAgICAgIHJlc3VsdCA9IGZhbHNlO1xyXG5cclxuICAgIGlmICh0eXBlb2Ygb01ldGhvZCA9PT0gJ2Z1bmN0aW9uJykge1xyXG5cclxuICAgICAgLy8gPGQ+XHJcbiAgICAgIGlmIChkaWRJbml0KSB7XHJcbiAgICAgICAgc20yLl93RChzdHIoJ3F1ZXVlJywgc1R5cGUpKTtcclxuICAgICAgfVxyXG4gICAgICAvLyA8L2Q+XHJcblxyXG4gICAgICBpZiAoIW9TY29wZSkge1xyXG4gICAgICAgIG9TY29wZSA9IHdpbmRvdztcclxuICAgICAgfVxyXG5cclxuICAgICAgYWRkT25FdmVudChzVHlwZSwgb01ldGhvZCwgb1Njb3BlKTtcclxuICAgICAgcHJvY2Vzc09uRXZlbnRzKCk7XHJcblxyXG4gICAgICByZXN1bHQgPSB0cnVlO1xyXG5cclxuICAgIH0gZWxzZSB7XHJcblxyXG4gICAgICB0aHJvdyBzdHIoJ25lZWRGdW5jdGlvbicsIHNUeXBlKTtcclxuXHJcbiAgICB9XHJcblxyXG4gICAgcmV0dXJuIHJlc3VsdDtcclxuXHJcbiAgfTtcclxuXHJcbiAgLyoqXHJcbiAgICogUXVldWVzIGEgY2FsbGJhY2sgZm9yIGV4ZWN1dGlvbiB3aGVuIFNvdW5kTWFuYWdlciBoYXMgZmFpbGVkIHRvIGluaXRpYWxpemUuXHJcbiAgICpcclxuICAgKiBAcGFyYW0ge2Z1bmN0aW9ufSBvTWV0aG9kIFRoZSBjYWxsYmFjayBtZXRob2QgdG8gZmlyZVxyXG4gICAqIEBwYXJhbSB7b2JqZWN0fSBvU2NvcGUgT3B0aW9uYWw6IFRoZSBzY29wZSB0byBhcHBseSB0byB0aGUgY2FsbGJhY2tcclxuICAgKi9cclxuXHJcbiAgdGhpcy5vbnRpbWVvdXQgPSBmdW5jdGlvbihvTWV0aG9kLCBvU2NvcGUpIHtcclxuXHJcbiAgICB2YXIgc1R5cGUgPSAnb250aW1lb3V0JyxcclxuICAgICAgICByZXN1bHQgPSBmYWxzZTtcclxuXHJcbiAgICBpZiAodHlwZW9mIG9NZXRob2QgPT09ICdmdW5jdGlvbicpIHtcclxuXHJcbiAgICAgIC8vIDxkPlxyXG4gICAgICBpZiAoZGlkSW5pdCkge1xyXG4gICAgICAgIHNtMi5fd0Qoc3RyKCdxdWV1ZScsIHNUeXBlKSk7XHJcbiAgICAgIH1cclxuICAgICAgLy8gPC9kPlxyXG5cclxuICAgICAgaWYgKCFvU2NvcGUpIHtcclxuICAgICAgICBvU2NvcGUgPSB3aW5kb3c7XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIGFkZE9uRXZlbnQoc1R5cGUsIG9NZXRob2QsIG9TY29wZSk7XHJcbiAgICAgIHByb2Nlc3NPbkV2ZW50cyh7dHlwZTpzVHlwZX0pO1xyXG5cclxuICAgICAgcmVzdWx0ID0gdHJ1ZTtcclxuXHJcbiAgICB9IGVsc2Uge1xyXG5cclxuICAgICAgdGhyb3cgc3RyKCduZWVkRnVuY3Rpb24nLCBzVHlwZSk7XHJcblxyXG4gICAgfVxyXG5cclxuICAgIHJldHVybiByZXN1bHQ7XHJcblxyXG4gIH07XHJcblxyXG4gIC8qKlxyXG4gICAqIFdyaXRlcyBjb25zb2xlLmxvZygpLXN0eWxlIGRlYnVnIG91dHB1dCB0byBhIGNvbnNvbGUgb3IgaW4tYnJvd3NlciBlbGVtZW50LlxyXG4gICAqIEFwcGxpZXMgd2hlbiBkZWJ1Z01vZGUgPSB0cnVlXHJcbiAgICpcclxuICAgKiBAcGFyYW0ge3N0cmluZ30gc1RleHQgVGhlIGNvbnNvbGUgbWVzc2FnZVxyXG4gICAqIEBwYXJhbSB7b2JqZWN0fSBuVHlwZSBPcHRpb25hbCBsb2cgbGV2ZWwgKG51bWJlciksIG9yIG9iamVjdC4gTnVtYmVyIGNhc2U6IExvZyB0eXBlL3N0eWxlIHdoZXJlIDAgPSAnaW5mbycsIDEgPSAnd2FybicsIDIgPSAnZXJyb3InLiBPYmplY3QgY2FzZTogT2JqZWN0IHRvIGJlIGR1bXBlZC5cclxuICAgKi9cclxuXHJcbiAgdGhpcy5fd3JpdGVEZWJ1ZyA9IGZ1bmN0aW9uKHNUZXh0LCBzVHlwZU9yT2JqZWN0KSB7XHJcblxyXG4gICAgLy8gcHNldWRvLXByaXZhdGUgY29uc29sZS5sb2coKS1zdHlsZSBvdXRwdXRcclxuICAgIC8vIDxkPlxyXG5cclxuICAgIHZhciBzRElEID0gJ3NvdW5kbWFuYWdlci1kZWJ1ZycsIG8sIG9JdGVtO1xyXG5cclxuICAgIGlmICghc20yLmRlYnVnTW9kZSkge1xyXG4gICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICB9XHJcblxyXG4gICAgaWYgKGhhc0NvbnNvbGUgJiYgc20yLnVzZUNvbnNvbGUpIHtcclxuICAgICAgaWYgKHNUeXBlT3JPYmplY3QgJiYgdHlwZW9mIHNUeXBlT3JPYmplY3QgPT09ICdvYmplY3QnKSB7XHJcbiAgICAgICAgLy8gb2JqZWN0IHBhc3NlZDsgZHVtcCB0byBjb25zb2xlLlxyXG4gICAgICAgIGNvbnNvbGUubG9nKHNUZXh0LCBzVHlwZU9yT2JqZWN0KTtcclxuICAgICAgfSBlbHNlIGlmIChkZWJ1Z0xldmVsc1tzVHlwZU9yT2JqZWN0XSAhPT0gX3VuZGVmaW5lZCkge1xyXG4gICAgICAgIGNvbnNvbGVbZGVidWdMZXZlbHNbc1R5cGVPck9iamVjdF1dKHNUZXh0KTtcclxuICAgICAgfSBlbHNlIHtcclxuICAgICAgICBjb25zb2xlLmxvZyhzVGV4dCk7XHJcbiAgICAgIH1cclxuICAgICAgaWYgKHNtMi5jb25zb2xlT25seSkge1xyXG4gICAgICAgIHJldHVybiB0cnVlO1xyXG4gICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgbyA9IGlkKHNESUQpO1xyXG5cclxuICAgIGlmICghbykge1xyXG4gICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICB9XHJcblxyXG4gICAgb0l0ZW0gPSBkb2MuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XHJcblxyXG4gICAgaWYgKCsrd2RDb3VudCAlIDIgPT09IDApIHtcclxuICAgICAgb0l0ZW0uY2xhc3NOYW1lID0gJ3NtMi1hbHQnO1xyXG4gICAgfVxyXG5cclxuICAgIGlmIChzVHlwZU9yT2JqZWN0ID09PSBfdW5kZWZpbmVkKSB7XHJcbiAgICAgIHNUeXBlT3JPYmplY3QgPSAwO1xyXG4gICAgfSBlbHNlIHtcclxuICAgICAgc1R5cGVPck9iamVjdCA9IHBhcnNlSW50KHNUeXBlT3JPYmplY3QsIDEwKTtcclxuICAgIH1cclxuXHJcbiAgICBvSXRlbS5hcHBlbmRDaGlsZChkb2MuY3JlYXRlVGV4dE5vZGUoc1RleHQpKTtcclxuXHJcbiAgICBpZiAoc1R5cGVPck9iamVjdCkge1xyXG4gICAgICBpZiAoc1R5cGVPck9iamVjdCA+PSAyKSB7XHJcbiAgICAgICAgb0l0ZW0uc3R5bGUuZm9udFdlaWdodCA9ICdib2xkJztcclxuICAgICAgfVxyXG4gICAgICBpZiAoc1R5cGVPck9iamVjdCA9PT0gMykge1xyXG4gICAgICAgIG9JdGVtLnN0eWxlLmNvbG9yID0gJyNmZjMzMzMnO1xyXG4gICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgLy8gdG9wLXRvLWJvdHRvbVxyXG4gICAgLy8gby5hcHBlbmRDaGlsZChvSXRlbSk7XHJcblxyXG4gICAgLy8gYm90dG9tLXRvLXRvcFxyXG4gICAgby5pbnNlcnRCZWZvcmUob0l0ZW0sIG8uZmlyc3RDaGlsZCk7XHJcblxyXG4gICAgbyA9IG51bGw7XHJcbiAgICAvLyA8L2Q+XHJcblxyXG4gICAgcmV0dXJuIHRydWU7XHJcblxyXG4gIH07XHJcblxyXG4gIC8vIDxkPlxyXG4gIC8vIGxhc3QtcmVzb3J0IGRlYnVnZ2luZyBvcHRpb25cclxuICBpZiAod2wuaW5kZXhPZignc20yLWRlYnVnPWFsZXJ0JykgIT09IC0xKSB7XHJcbiAgICB0aGlzLl93cml0ZURlYnVnID0gZnVuY3Rpb24oc1RleHQpIHtcclxuICAgICAgd2luZG93LmFsZXJ0KHNUZXh0KTtcclxuICAgIH07XHJcbiAgfVxyXG4gIC8vIDwvZD5cclxuXHJcbiAgLy8gYWxpYXNcclxuICB0aGlzLl93RCA9IHRoaXMuX3dyaXRlRGVidWc7XHJcblxyXG4gIC8qKlxyXG4gICAqIFByb3ZpZGVzIGRlYnVnIC8gc3RhdGUgaW5mb3JtYXRpb24gb24gYWxsIFNNU291bmQgb2JqZWN0cy5cclxuICAgKi9cclxuXHJcbiAgdGhpcy5fZGVidWcgPSBmdW5jdGlvbigpIHtcclxuXHJcbiAgICAvLyA8ZD5cclxuICAgIHZhciBpLCBqO1xyXG4gICAgX3dEUygnY3VycmVudE9iaicsIDEpO1xyXG5cclxuICAgIGZvciAoaSA9IDAsIGogPSBzbTIuc291bmRJRHMubGVuZ3RoOyBpIDwgajsgaSsrKSB7XHJcbiAgICAgIHNtMi5zb3VuZHNbc20yLnNvdW5kSURzW2ldXS5fZGVidWcoKTtcclxuICAgIH1cclxuICAgIC8vIDwvZD5cclxuXHJcbiAgfTtcclxuXHJcbiAgLyoqXHJcbiAgICogUmVzdGFydHMgYW5kIHJlLWluaXRpYWxpemVzIHRoZSBTb3VuZE1hbmFnZXIgaW5zdGFuY2UuXHJcbiAgICpcclxuICAgKiBAcGFyYW0ge2Jvb2xlYW59IHJlc2V0RXZlbnRzIE9wdGlvbmFsOiBXaGVuIHRydWUsIHJlbW92ZXMgYWxsIHJlZ2lzdGVyZWQgb25yZWFkeSBhbmQgb250aW1lb3V0IGV2ZW50IGNhbGxiYWNrcy5cclxuICAgKiBAcGFyYW0ge2Jvb2xlYW59IGV4Y2x1ZGVJbml0IE9wdGlvbnM6IFdoZW4gdHJ1ZSwgZG9lcyBub3QgY2FsbCBiZWdpbkRlbGF5ZWRJbml0KCkgKHdoaWNoIHdvdWxkIHJlc3RhcnQgU00yKS5cclxuICAgKiBAcmV0dXJuIHtvYmplY3R9IHNvdW5kTWFuYWdlciBUaGUgc291bmRNYW5hZ2VyIGluc3RhbmNlLlxyXG4gICAqL1xyXG5cclxuICB0aGlzLnJlYm9vdCA9IGZ1bmN0aW9uKHJlc2V0RXZlbnRzLCBleGNsdWRlSW5pdCkge1xyXG5cclxuICAgIC8vIHJlc2V0IHNvbWUgKG9yIGFsbCkgc3RhdGUsIGFuZCByZS1pbml0IHVubGVzcyBvdGhlcndpc2Ugc3BlY2lmaWVkLlxyXG5cclxuICAgIC8vIDxkPlxyXG4gICAgaWYgKHNtMi5zb3VuZElEcy5sZW5ndGgpIHtcclxuICAgICAgc20yLl93RCgnRGVzdHJveWluZyAnICsgc20yLnNvdW5kSURzLmxlbmd0aCArICcgU01Tb3VuZCBvYmplY3QnICsgKHNtMi5zb3VuZElEcy5sZW5ndGggIT09IDEgPyAncycgOiAnJykgKyAnLi4uJyk7XHJcbiAgICB9XHJcbiAgICAvLyA8L2Q+XHJcblxyXG4gICAgdmFyIGksIGosIGs7XHJcblxyXG4gICAgZm9yIChpID0gc20yLnNvdW5kSURzLmxlbmd0aC0xOyBpID49IDA7IGktLSkge1xyXG4gICAgICBzbTIuc291bmRzW3NtMi5zb3VuZElEc1tpXV0uZGVzdHJ1Y3QoKTtcclxuICAgIH1cclxuXHJcbiAgICAvLyB0cmFzaCB6ZSBmbGFzaCAocmVtb3ZlIGZyb20gdGhlIERPTSlcclxuXHJcbiAgICBpZiAoZmxhc2gpIHtcclxuXHJcbiAgICAgIHRyeSB7XHJcblxyXG4gICAgICAgIGlmIChpc0lFKSB7XHJcbiAgICAgICAgICBvUmVtb3ZlZEhUTUwgPSBmbGFzaC5pbm5lckhUTUw7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBvUmVtb3ZlZCA9IGZsYXNoLnBhcmVudE5vZGUucmVtb3ZlQ2hpbGQoZmxhc2gpO1xyXG5cclxuICAgICAgfSBjYXRjaChlKSB7XHJcblxyXG4gICAgICAgIC8vIFJlbW92ZSBmYWlsZWQ/IE1heSBiZSBkdWUgdG8gZmxhc2ggYmxvY2tlcnMgc2lsZW50bHkgcmVtb3ZpbmcgdGhlIFNXRiBvYmplY3QvZW1iZWQgbm9kZSBmcm9tIHRoZSBET00uIFdhcm4gYW5kIGNvbnRpbnVlLlxyXG5cclxuICAgICAgICBfd0RTKCdiYWRSZW1vdmUnLCAyKTtcclxuXHJcbiAgICAgIH1cclxuXHJcbiAgICB9XHJcblxyXG4gICAgLy8gYWN0dWFsbHksIGZvcmNlIHJlY3JlYXRlIG9mIG1vdmllLlxyXG5cclxuICAgIG9SZW1vdmVkSFRNTCA9IG9SZW1vdmVkID0gbmVlZHNGbGFzaCA9IGZsYXNoID0gbnVsbDtcclxuXHJcbiAgICBzbTIuZW5hYmxlZCA9IGRpZERDTG9hZGVkID0gZGlkSW5pdCA9IHdhaXRpbmdGb3JFSSA9IGluaXRQZW5kaW5nID0gZGlkQXBwZW5kID0gYXBwZW5kU3VjY2VzcyA9IGRpc2FibGVkID0gdXNlR2xvYmFsSFRNTDVBdWRpbyA9IHNtMi5zd2ZMb2FkZWQgPSBmYWxzZTtcclxuXHJcbiAgICBzbTIuc291bmRJRHMgPSBbXTtcclxuICAgIHNtMi5zb3VuZHMgPSB7fTtcclxuXHJcbiAgICBpZENvdW50ZXIgPSAwO1xyXG5cclxuICAgIGlmICghcmVzZXRFdmVudHMpIHtcclxuICAgICAgLy8gcmVzZXQgY2FsbGJhY2tzIGZvciBvbnJlYWR5LCBvbnRpbWVvdXQgZXRjLiBzbyB0aGF0IHRoZXkgd2lsbCBmaXJlIGFnYWluIG9uIHJlLWluaXRcclxuICAgICAgZm9yIChpIGluIG9uX3F1ZXVlKSB7XHJcbiAgICAgICAgaWYgKG9uX3F1ZXVlLmhhc093blByb3BlcnR5KGkpKSB7XHJcbiAgICAgICAgICBmb3IgKGogPSAwLCBrID0gb25fcXVldWVbaV0ubGVuZ3RoOyBqIDwgazsgaisrKSB7XHJcbiAgICAgICAgICAgIG9uX3F1ZXVlW2ldW2pdLmZpcmVkID0gZmFsc2U7XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICAvLyByZW1vdmUgYWxsIGNhbGxiYWNrcyBlbnRpcmVseVxyXG4gICAgICBvbl9xdWV1ZSA9IFtdO1xyXG4gICAgfVxyXG5cclxuICAgIC8vIDxkPlxyXG4gICAgaWYgKCFleGNsdWRlSW5pdCkge1xyXG4gICAgICBzbTIuX3dEKHNtICsgJzogUmVib290aW5nLi4uJyk7XHJcbiAgICB9XHJcbiAgICAvLyA8L2Q+XHJcblxyXG4gICAgLy8gcmVzZXQgSFRNTDUgYW5kIGZsYXNoIGNhblBsYXkgdGVzdCByZXN1bHRzXHJcblxyXG4gICAgc20yLmh0bWw1ID0ge1xyXG4gICAgICAndXNpbmdGbGFzaCc6IG51bGxcclxuICAgIH07XHJcblxyXG4gICAgc20yLmZsYXNoID0ge307XHJcblxyXG4gICAgLy8gcmVzZXQgZGV2aWNlLXNwZWNpZmljIEhUTUwvZmxhc2ggbW9kZSBzd2l0Y2hlc1xyXG5cclxuICAgIHNtMi5odG1sNU9ubHkgPSBmYWxzZTtcclxuICAgIHNtMi5pZ25vcmVGbGFzaCA9IGZhbHNlO1xyXG5cclxuICAgIHdpbmRvdy5zZXRUaW1lb3V0KGZ1bmN0aW9uKCkge1xyXG5cclxuICAgICAgcHJlSW5pdCgpO1xyXG5cclxuICAgICAgLy8gYnkgZGVmYXVsdCwgcmUtaW5pdFxyXG5cclxuICAgICAgaWYgKCFleGNsdWRlSW5pdCkge1xyXG4gICAgICAgIHNtMi5iZWdpbkRlbGF5ZWRJbml0KCk7XHJcbiAgICAgIH1cclxuXHJcbiAgICB9LCAyMCk7XHJcblxyXG4gICAgcmV0dXJuIHNtMjtcclxuXHJcbiAgfTtcclxuXHJcbiAgdGhpcy5yZXNldCA9IGZ1bmN0aW9uKCkge1xyXG5cclxuICAgIC8qKlxyXG4gICAgICogU2h1dHMgZG93biBhbmQgcmVzdG9yZXMgdGhlIFNvdW5kTWFuYWdlciBpbnN0YW5jZSB0byBpdHMgb3JpZ2luYWwgbG9hZGVkIHN0YXRlLCB3aXRob3V0IGFuIGV4cGxpY2l0IHJlYm9vdC4gQWxsIG9ucmVhZHkvb250aW1lb3V0IGhhbmRsZXJzIGFyZSByZW1vdmVkLlxyXG4gICAgICogQWZ0ZXIgdGhpcyBjYWxsLCBTTTIgbWF5IGJlIHJlLWluaXRpYWxpemVkIHZpYSBzb3VuZE1hbmFnZXIuYmVnaW5EZWxheWVkSW5pdCgpLlxyXG4gICAgICogQHJldHVybiB7b2JqZWN0fSBzb3VuZE1hbmFnZXIgVGhlIHNvdW5kTWFuYWdlciBpbnN0YW5jZS5cclxuICAgICAqL1xyXG5cclxuICAgIF93RFMoJ3Jlc2V0Jyk7XHJcbiAgICByZXR1cm4gc20yLnJlYm9vdCh0cnVlLCB0cnVlKTtcclxuXHJcbiAgfTtcclxuXHJcbiAgLyoqXHJcbiAgICogVW5kb2N1bWVudGVkOiBEZXRlcm1pbmVzIHRoZSBTTTIgZmxhc2ggbW92aWUncyBsb2FkIHByb2dyZXNzLlxyXG4gICAqXHJcbiAgICogQHJldHVybiB7bnVtYmVyIG9yIG51bGx9IFBlcmNlbnQgbG9hZGVkLCBvciBpZiBpbnZhbGlkL3Vuc3VwcG9ydGVkLCBudWxsLlxyXG4gICAqL1xyXG5cclxuICB0aGlzLmdldE1vdmllUGVyY2VudCA9IGZ1bmN0aW9uKCkge1xyXG5cclxuICAgIC8qKlxyXG4gICAgICogSW50ZXJlc3Rpbmcgc3ludGF4IG5vdGVzLi4uXHJcbiAgICAgKiBGbGFzaC9FeHRlcm5hbEludGVyZmFjZSAoQWN0aXZlWC9OUEFQSSkgYnJpZGdlIG1ldGhvZHMgYXJlIG5vdCB0eXBlb2YgXCJmdW5jdGlvblwiIG5vciBpbnN0YW5jZW9mIEZ1bmN0aW9uLCBidXQgYXJlIHN0aWxsIHZhbGlkLlxyXG4gICAgICogQWRkaXRpb25hbGx5LCBKU0xpbnQgZGlzbGlrZXMgKCdQZXJjZW50TG9hZGVkJyBpbiBmbGFzaCktc3R5bGUgc3ludGF4IGFuZCByZWNvbW1lbmRzIGhhc093blByb3BlcnR5KCksIHdoaWNoIGRvZXMgbm90IHdvcmsgaW4gdGhpcyBjYXNlLlxyXG4gICAgICogRnVydGhlcm1vcmUsIHVzaW5nIChmbGFzaCAmJiBmbGFzaC5QZXJjZW50TG9hZGVkKSBjYXVzZXMgSUUgdG8gdGhyb3cgXCJvYmplY3QgZG9lc24ndCBzdXBwb3J0IHRoaXMgcHJvcGVydHkgb3IgbWV0aG9kXCIuXHJcbiAgICAgKiBUaHVzLCAnaW4nIHN5bnRheCBtdXN0IGJlIHVzZWQuXHJcbiAgICAgKi9cclxuXHJcbiAgICByZXR1cm4gKGZsYXNoICYmICdQZXJjZW50TG9hZGVkJyBpbiBmbGFzaCA/IGZsYXNoLlBlcmNlbnRMb2FkZWQoKSA6IG51bGwpOyAvLyBZZXMsIEpTTGludC4gU2VlIG5lYXJieSBjb21tZW50IGluIHNvdXJjZSBmb3IgZXhwbGFuYXRpb24uXHJcblxyXG4gIH07XHJcblxyXG4gIC8qKlxyXG4gICAqIEFkZGl0aW9uYWwgaGVscGVyIGZvciBtYW51YWxseSBpbnZva2luZyBTTTIncyBpbml0IHByb2Nlc3MgYWZ0ZXIgRE9NIFJlYWR5IC8gd2luZG93Lm9ubG9hZCgpLlxyXG4gICAqL1xyXG5cclxuICB0aGlzLmJlZ2luRGVsYXllZEluaXQgPSBmdW5jdGlvbigpIHtcclxuXHJcbiAgICB3aW5kb3dMb2FkZWQgPSB0cnVlO1xyXG4gICAgZG9tQ29udGVudExvYWRlZCgpO1xyXG5cclxuICAgIHNldFRpbWVvdXQoZnVuY3Rpb24oKSB7XHJcblxyXG4gICAgICBpZiAoaW5pdFBlbmRpbmcpIHtcclxuICAgICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIGNyZWF0ZU1vdmllKCk7XHJcbiAgICAgIGluaXRNb3ZpZSgpO1xyXG4gICAgICBpbml0UGVuZGluZyA9IHRydWU7XHJcblxyXG4gICAgICByZXR1cm4gdHJ1ZTtcclxuXHJcbiAgICB9LCAyMCk7XHJcblxyXG4gICAgZGVsYXlXYWl0Rm9yRUkoKTtcclxuXHJcbiAgfTtcclxuXHJcbiAgLyoqXHJcbiAgICogRGVzdHJveXMgdGhlIFNvdW5kTWFuYWdlciBpbnN0YW5jZSBhbmQgYWxsIFNNU291bmQgaW5zdGFuY2VzLlxyXG4gICAqL1xyXG5cclxuICB0aGlzLmRlc3RydWN0ID0gZnVuY3Rpb24oKSB7XHJcblxyXG4gICAgc20yLl93RChzbSArICcuZGVzdHJ1Y3QoKScpO1xyXG4gICAgc20yLmRpc2FibGUodHJ1ZSk7XHJcblxyXG4gIH07XHJcblxyXG4gIC8qKlxyXG4gICAqIFNNU291bmQoKSAoc291bmQgb2JqZWN0KSBjb25zdHJ1Y3RvclxyXG4gICAqIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxyXG4gICAqXHJcbiAgICogQHBhcmFtIHtvYmplY3R9IG9PcHRpb25zIFNvdW5kIG9wdGlvbnMgKGlkIGFuZCB1cmwgYXJlIHJlcXVpcmVkIGF0dHJpYnV0ZXMpXHJcbiAgICogQHJldHVybiB7U01Tb3VuZH0gVGhlIG5ldyBTTVNvdW5kIG9iamVjdFxyXG4gICAqL1xyXG5cclxuICBTTVNvdW5kID0gZnVuY3Rpb24ob09wdGlvbnMpIHtcclxuXHJcbiAgICB2YXIgcyA9IHRoaXMsIHJlc2V0UHJvcGVydGllcywgYWRkX2h0bWw1X2V2ZW50cywgcmVtb3ZlX2h0bWw1X2V2ZW50cywgc3RvcF9odG1sNV90aW1lciwgc3RhcnRfaHRtbDVfdGltZXIsIGF0dGFjaE9uUG9zaXRpb24sIG9ucGxheV9jYWxsZWQgPSBmYWxzZSwgb25Qb3NpdGlvbkl0ZW1zID0gW10sIG9uUG9zaXRpb25GaXJlZCA9IDAsIGRldGFjaE9uUG9zaXRpb24sIGFwcGx5RnJvbVRvLCBsYXN0VVJMID0gbnVsbCwgbGFzdEhUTUw1U3RhdGUsIHVybE9taXR0ZWQ7XHJcblxyXG4gICAgbGFzdEhUTUw1U3RhdGUgPSB7XHJcbiAgICAgIC8vIHRyYWNrcyBkdXJhdGlvbiArIHBvc2l0aW9uICh0aW1lKVxyXG4gICAgICBkdXJhdGlvbjogbnVsbCxcclxuICAgICAgdGltZTogbnVsbFxyXG4gICAgfTtcclxuXHJcbiAgICB0aGlzLmlkID0gb09wdGlvbnMuaWQ7XHJcblxyXG4gICAgLy8gbGVnYWN5XHJcbiAgICB0aGlzLnNJRCA9IHRoaXMuaWQ7XHJcblxyXG4gICAgdGhpcy51cmwgPSBvT3B0aW9ucy51cmw7XHJcbiAgICB0aGlzLm9wdGlvbnMgPSBtaXhpbihvT3B0aW9ucyk7XHJcblxyXG4gICAgLy8gcGVyLXBsYXktaW5zdGFuY2Utc3BlY2lmaWMgb3B0aW9uc1xyXG4gICAgdGhpcy5pbnN0YW5jZU9wdGlvbnMgPSB0aGlzLm9wdGlvbnM7XHJcblxyXG4gICAgLy8gc2hvcnQgYWxpYXNcclxuICAgIHRoaXMuX2lPID0gdGhpcy5pbnN0YW5jZU9wdGlvbnM7XHJcblxyXG4gICAgLy8gYXNzaWduIHByb3BlcnR5IGRlZmF1bHRzXHJcbiAgICB0aGlzLnBhbiA9IHRoaXMub3B0aW9ucy5wYW47XHJcbiAgICB0aGlzLnZvbHVtZSA9IHRoaXMub3B0aW9ucy52b2x1bWU7XHJcblxyXG4gICAgLy8gd2hldGhlciBvciBub3QgdGhpcyBvYmplY3QgaXMgdXNpbmcgSFRNTDVcclxuICAgIHRoaXMuaXNIVE1MNSA9IGZhbHNlO1xyXG5cclxuICAgIC8vIGludGVybmFsIEhUTUw1IEF1ZGlvKCkgb2JqZWN0IHJlZmVyZW5jZVxyXG4gICAgdGhpcy5fYSA9IG51bGw7XHJcblxyXG4gICAgLy8gZm9yIGZsYXNoIDggc3BlY2lhbC1jYXNlIGNyZWF0ZVNvdW5kKCkgd2l0aG91dCB1cmwsIGZvbGxvd2VkIGJ5IGxvYWQvcGxheSB3aXRoIHVybCBjYXNlXHJcbiAgICB1cmxPbWl0dGVkID0gKHRoaXMudXJsID8gZmFsc2UgOiB0cnVlKTtcclxuXHJcbiAgICAvKipcclxuICAgICAqIFNNU291bmQoKSBwdWJsaWMgbWV0aG9kc1xyXG4gICAgICogLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXHJcbiAgICAgKi9cclxuXHJcbiAgICB0aGlzLmlkMyA9IHt9O1xyXG5cclxuICAgIC8qKlxyXG4gICAgICogV3JpdGVzIFNNU291bmQgb2JqZWN0IHBhcmFtZXRlcnMgdG8gZGVidWcgY29uc29sZVxyXG4gICAgICovXHJcblxyXG4gICAgdGhpcy5fZGVidWcgPSBmdW5jdGlvbigpIHtcclxuXHJcbiAgICAgIC8vIDxkPlxyXG4gICAgICBzbTIuX3dEKHMuaWQgKyAnOiBNZXJnZWQgb3B0aW9uczonLCBzLm9wdGlvbnMpO1xyXG4gICAgICAvLyA8L2Q+XHJcblxyXG4gICAgfTtcclxuXHJcbiAgICAvKipcclxuICAgICAqIEJlZ2lucyBsb2FkaW5nIGEgc291bmQgcGVyIGl0cyAqdXJsKi5cclxuICAgICAqXHJcbiAgICAgKiBAcGFyYW0ge29iamVjdH0gb09wdGlvbnMgT3B0aW9uYWw6IFNvdW5kIG9wdGlvbnNcclxuICAgICAqIEByZXR1cm4ge1NNU291bmR9IFRoZSBTTVNvdW5kIG9iamVjdFxyXG4gICAgICovXHJcblxyXG4gICAgdGhpcy5sb2FkID0gZnVuY3Rpb24ob09wdGlvbnMpIHtcclxuXHJcbiAgICAgIHZhciBvU291bmQgPSBudWxsLCBpbnN0YW5jZU9wdGlvbnM7XHJcblxyXG4gICAgICBpZiAob09wdGlvbnMgIT09IF91bmRlZmluZWQpIHtcclxuICAgICAgICBzLl9pTyA9IG1peGluKG9PcHRpb25zLCBzLm9wdGlvbnMpO1xyXG4gICAgICB9IGVsc2Uge1xyXG4gICAgICAgIG9PcHRpb25zID0gcy5vcHRpb25zO1xyXG4gICAgICAgIHMuX2lPID0gb09wdGlvbnM7XHJcbiAgICAgICAgaWYgKGxhc3RVUkwgJiYgbGFzdFVSTCAhPT0gcy51cmwpIHtcclxuICAgICAgICAgIF93RFMoJ21hblVSTCcpO1xyXG4gICAgICAgICAgcy5faU8udXJsID0gcy51cmw7XHJcbiAgICAgICAgICBzLnVybCA9IG51bGw7XHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcblxyXG4gICAgICBpZiAoIXMuX2lPLnVybCkge1xyXG4gICAgICAgIHMuX2lPLnVybCA9IHMudXJsO1xyXG4gICAgICB9XHJcblxyXG4gICAgICBzLl9pTy51cmwgPSBwYXJzZVVSTChzLl9pTy51cmwpO1xyXG5cclxuICAgICAgLy8gZW5zdXJlIHdlJ3JlIGluIHN5bmNcclxuICAgICAgcy5pbnN0YW5jZU9wdGlvbnMgPSBzLl9pTztcclxuXHJcbiAgICAgIC8vIGxvY2FsIHNob3J0Y3V0XHJcbiAgICAgIGluc3RhbmNlT3B0aW9ucyA9IHMuX2lPO1xyXG5cclxuICAgICAgc20yLl93RChzLmlkICsgJzogbG9hZCAoJyArIGluc3RhbmNlT3B0aW9ucy51cmwgKyAnKScpO1xyXG5cclxuICAgICAgaWYgKCFpbnN0YW5jZU9wdGlvbnMudXJsICYmICFzLnVybCkge1xyXG4gICAgICAgIHNtMi5fd0Qocy5pZCArICc6IGxvYWQoKTogdXJsIGlzIHVuYXNzaWduZWQuIEV4aXRpbmcuJywgMik7XHJcbiAgICAgICAgcmV0dXJuIHM7XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIC8vIDxkPlxyXG4gICAgICBpZiAoIXMuaXNIVE1MNSAmJiBmViA9PT0gOCAmJiAhcy51cmwgJiYgIWluc3RhbmNlT3B0aW9ucy5hdXRvUGxheSkge1xyXG4gICAgICAgIC8vIGZsYXNoIDggbG9hZCgpIC0+IHBsYXkoKSB3b24ndCB3b3JrIGJlZm9yZSBvbmxvYWQgaGFzIGZpcmVkLlxyXG4gICAgICAgIHNtMi5fd0Qocy5pZCArICc6IEZsYXNoIDggbG9hZCgpIGxpbWl0YXRpb246IFdhaXQgZm9yIG9ubG9hZCgpIGJlZm9yZSBjYWxsaW5nIHBsYXkoKS4nLCAxKTtcclxuICAgICAgfVxyXG4gICAgICAvLyA8L2Q+XHJcblxyXG4gICAgICBpZiAoaW5zdGFuY2VPcHRpb25zLnVybCA9PT0gcy51cmwgJiYgcy5yZWFkeVN0YXRlICE9PSAwICYmIHMucmVhZHlTdGF0ZSAhPT0gMikge1xyXG4gICAgICAgIF93RFMoJ29uVVJMJywgMSk7XHJcbiAgICAgICAgLy8gaWYgbG9hZGVkIGFuZCBhbiBvbmxvYWQoKSBleGlzdHMsIGZpcmUgaW1tZWRpYXRlbHkuXHJcbiAgICAgICAgaWYgKHMucmVhZHlTdGF0ZSA9PT0gMyAmJiBpbnN0YW5jZU9wdGlvbnMub25sb2FkKSB7XHJcbiAgICAgICAgICAvLyBhc3N1bWUgc3VjY2VzcyBiYXNlZCBvbiB0cnV0aHkgZHVyYXRpb24uXHJcbiAgICAgICAgICB3cmFwQ2FsbGJhY2socywgZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgIGluc3RhbmNlT3B0aW9ucy5vbmxvYWQuYXBwbHkocywgWyghIXMuZHVyYXRpb24pXSk7XHJcbiAgICAgICAgICB9KTtcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIHM7XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIC8vIHJlc2V0IGEgZmV3IHN0YXRlIHByb3BlcnRpZXNcclxuXHJcbiAgICAgIHMubG9hZGVkID0gZmFsc2U7XHJcbiAgICAgIHMucmVhZHlTdGF0ZSA9IDE7XHJcbiAgICAgIHMucGxheVN0YXRlID0gMDtcclxuICAgICAgcy5pZDMgPSB7fTtcclxuXHJcbiAgICAgIC8vIFRPRE86IElmIHN3aXRjaGluZyBmcm9tIEhUTUw1IC0+IGZsYXNoIChvciB2aWNlIHZlcnNhKSwgc3RvcCBjdXJyZW50bHktcGxheWluZyBhdWRpby5cclxuXHJcbiAgICAgIGlmIChodG1sNU9LKGluc3RhbmNlT3B0aW9ucykpIHtcclxuXHJcbiAgICAgICAgb1NvdW5kID0gcy5fc2V0dXBfaHRtbDUoaW5zdGFuY2VPcHRpb25zKTtcclxuXHJcbiAgICAgICAgaWYgKCFvU291bmQuX2NhbGxlZF9sb2FkKSB7XHJcblxyXG4gICAgICAgICAgcy5faHRtbDVfY2FucGxheSA9IGZhbHNlO1xyXG5cclxuICAgICAgICAgIC8vIFRPRE86IHJldmlldyBjYWxsZWRfbG9hZCAvIGh0bWw1X2NhbnBsYXkgbG9naWNcclxuXHJcbiAgICAgICAgICAvLyBpZiB1cmwgcHJvdmlkZWQgZGlyZWN0bHkgdG8gbG9hZCgpLCBhc3NpZ24gaXQgaGVyZS5cclxuXHJcbiAgICAgICAgICBpZiAocy51cmwgIT09IGluc3RhbmNlT3B0aW9ucy51cmwpIHtcclxuXHJcbiAgICAgICAgICAgIHNtMi5fd0QoX3dEUygnbWFuVVJMJykgKyAnOiAnICsgaW5zdGFuY2VPcHRpb25zLnVybCk7XHJcblxyXG4gICAgICAgICAgICBzLl9hLnNyYyA9IGluc3RhbmNlT3B0aW9ucy51cmw7XHJcblxyXG4gICAgICAgICAgICAvLyBUT0RPOiByZXZpZXcgLyByZS1hcHBseSBhbGwgcmVsZXZhbnQgb3B0aW9ucyAodm9sdW1lLCBsb29wLCBvbnBvc2l0aW9uIGV0Yy4pXHJcblxyXG4gICAgICAgICAgICAvLyByZXNldCBwb3NpdGlvbiBmb3IgbmV3IFVSTFxyXG4gICAgICAgICAgICBzLnNldFBvc2l0aW9uKDApO1xyXG5cclxuICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAvLyBnaXZlbiBleHBsaWNpdCBsb2FkIGNhbGwsIHRyeSB0byBwcmVsb2FkLlxyXG5cclxuICAgICAgICAgIC8vIGVhcmx5IEhUTUw1IGltcGxlbWVudGF0aW9uIChub24tc3RhbmRhcmQpXHJcbiAgICAgICAgICBzLl9hLmF1dG9idWZmZXIgPSAnYXV0byc7XHJcblxyXG4gICAgICAgICAgLy8gc3RhbmRhcmQgcHJvcGVydHksIHZhbHVlczogbm9uZSAvIG1ldGFkYXRhIC8gYXV0b1xyXG4gICAgICAgICAgLy8gcmVmZXJlbmNlOiBodHRwOi8vbXNkbi5taWNyb3NvZnQuY29tL2VuLXVzL2xpYnJhcnkvaWUvZmY5NzQ3NTklMjh2PXZzLjg1JTI5LmFzcHhcclxuICAgICAgICAgIHMuX2EucHJlbG9hZCA9ICdhdXRvJztcclxuXHJcbiAgICAgICAgICBzLl9hLl9jYWxsZWRfbG9hZCA9IHRydWU7XHJcblxyXG4gICAgICAgIH0gZWxzZSB7XHJcblxyXG4gICAgICAgICAgc20yLl93RChzLmlkICsgJzogSWdub3JpbmcgcmVxdWVzdCB0byBsb2FkIGFnYWluJyk7XHJcblxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgIH0gZWxzZSB7XHJcblxyXG4gICAgICAgIGlmIChzbTIuaHRtbDVPbmx5KSB7XHJcbiAgICAgICAgICBzbTIuX3dEKHMuaWQgKyAnOiBObyBmbGFzaCBzdXBwb3J0LiBFeGl0aW5nLicpO1xyXG4gICAgICAgICAgcmV0dXJuIHM7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBpZiAocy5faU8udXJsICYmIHMuX2lPLnVybC5tYXRjaCgvZGF0YVxcOi9pKSkge1xyXG4gICAgICAgICAgLy8gZGF0YTogVVJJcyBub3Qgc3VwcG9ydGVkIGJ5IEZsYXNoLCBlaXRoZXIuXHJcbiAgICAgICAgICBzbTIuX3dEKHMuaWQgKyAnOiBkYXRhOiBVUklzIG5vdCBzdXBwb3J0ZWQgdmlhIEZsYXNoLiBFeGl0aW5nLicpO1xyXG4gICAgICAgICAgcmV0dXJuIHM7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICB0cnkge1xyXG4gICAgICAgICAgcy5pc0hUTUw1ID0gZmFsc2U7XHJcbiAgICAgICAgICBzLl9pTyA9IHBvbGljeUZpeChsb29wRml4KGluc3RhbmNlT3B0aW9ucykpO1xyXG4gICAgICAgICAgLy8gaWYgd2UgaGF2ZSBcInBvc2l0aW9uXCIsIGRpc2FibGUgYXV0by1wbGF5IGFzIHdlJ2xsIGJlIHNlZWtpbmcgdG8gdGhhdCBwb3NpdGlvbiBhdCBvbmxvYWQoKS5cclxuICAgICAgICAgIGlmIChzLl9pTy5hdXRvUGxheSAmJiAocy5faU8ucG9zaXRpb24gfHwgcy5faU8uZnJvbSkpIHtcclxuICAgICAgICAgICAgc20yLl93RChzLmlkICsgJzogRGlzYWJsaW5nIGF1dG9QbGF5IGJlY2F1c2Ugb2Ygbm9uLXplcm8gb2Zmc2V0IGNhc2UnKTtcclxuICAgICAgICAgICAgcy5faU8uYXV0b1BsYXkgPSBmYWxzZTtcclxuICAgICAgICAgIH1cclxuICAgICAgICAgIC8vIHJlLWFzc2lnbiBsb2NhbCBzaG9ydGN1dFxyXG4gICAgICAgICAgaW5zdGFuY2VPcHRpb25zID0gcy5faU87XHJcbiAgICAgICAgICBpZiAoZlYgPT09IDgpIHtcclxuICAgICAgICAgICAgZmxhc2guX2xvYWQocy5pZCwgaW5zdGFuY2VPcHRpb25zLnVybCwgaW5zdGFuY2VPcHRpb25zLnN0cmVhbSwgaW5zdGFuY2VPcHRpb25zLmF1dG9QbGF5LCBpbnN0YW5jZU9wdGlvbnMudXNlUG9saWN5RmlsZSk7XHJcbiAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICBmbGFzaC5fbG9hZChzLmlkLCBpbnN0YW5jZU9wdGlvbnMudXJsLCAhIShpbnN0YW5jZU9wdGlvbnMuc3RyZWFtKSwgISEoaW5zdGFuY2VPcHRpb25zLmF1dG9QbGF5KSwgaW5zdGFuY2VPcHRpb25zLmxvb3BzfHwxLCAhIShpbnN0YW5jZU9wdGlvbnMuYXV0b0xvYWQpLCBpbnN0YW5jZU9wdGlvbnMudXNlUG9saWN5RmlsZSk7XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgfSBjYXRjaChlKSB7XHJcbiAgICAgICAgICBfd0RTKCdzbUVycm9yJywgMik7XHJcbiAgICAgICAgICBkZWJ1Z1RTKCdvbmxvYWQnLCBmYWxzZSk7XHJcbiAgICAgICAgICBjYXRjaEVycm9yKHt0eXBlOidTTVNPVU5EX0xPQURfSlNfRVhDRVBUSU9OJywgZmF0YWw6dHJ1ZX0pO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgIH1cclxuXHJcbiAgICAgIC8vIGFmdGVyIGFsbCBvZiB0aGlzLCBlbnN1cmUgc291bmQgdXJsIGlzIHVwIHRvIGRhdGUuXHJcbiAgICAgIHMudXJsID0gaW5zdGFuY2VPcHRpb25zLnVybDtcclxuXHJcbiAgICAgIHJldHVybiBzO1xyXG5cclxuICAgIH07XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBVbmxvYWRzIGEgc291bmQsIGNhbmNlbGluZyBhbnkgb3BlbiBIVFRQIHJlcXVlc3RzLlxyXG4gICAgICpcclxuICAgICAqIEByZXR1cm4ge1NNU291bmR9IFRoZSBTTVNvdW5kIG9iamVjdFxyXG4gICAgICovXHJcblxyXG4gICAgdGhpcy51bmxvYWQgPSBmdW5jdGlvbigpIHtcclxuXHJcbiAgICAgIC8vIEZsYXNoIDgvQVMyIGNhbid0IFwiY2xvc2VcIiBhIHN0cmVhbSAtIGZha2UgaXQgYnkgbG9hZGluZyBhbiBlbXB0eSBVUkxcclxuICAgICAgLy8gRmxhc2ggOS9BUzM6IENsb3NlIHN0cmVhbSwgcHJldmVudGluZyBmdXJ0aGVyIGxvYWRcclxuICAgICAgLy8gSFRNTDU6IE1vc3QgVUFzIHdpbGwgdXNlIGVtcHR5IFVSTFxyXG5cclxuICAgICAgaWYgKHMucmVhZHlTdGF0ZSAhPT0gMCkge1xyXG5cclxuICAgICAgICBzbTIuX3dEKHMuaWQgKyAnOiB1bmxvYWQoKScpO1xyXG5cclxuICAgICAgICBpZiAoIXMuaXNIVE1MNSkge1xyXG5cclxuICAgICAgICAgIGlmIChmViA9PT0gOCkge1xyXG4gICAgICAgICAgICBmbGFzaC5fdW5sb2FkKHMuaWQsIGVtcHR5VVJMKTtcclxuICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIGZsYXNoLl91bmxvYWQocy5pZCk7XHJcbiAgICAgICAgICB9XHJcblxyXG4gICAgICAgIH0gZWxzZSB7XHJcblxyXG4gICAgICAgICAgc3RvcF9odG1sNV90aW1lcigpO1xyXG5cclxuICAgICAgICAgIGlmIChzLl9hKSB7XHJcblxyXG4gICAgICAgICAgICBzLl9hLnBhdXNlKCk7XHJcblxyXG4gICAgICAgICAgICAvLyB1cGRhdGUgZW1wdHkgVVJMLCB0b29cclxuICAgICAgICAgICAgbGFzdFVSTCA9IGh0bWw1VW5sb2FkKHMuX2EpO1xyXG5cclxuICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvLyByZXNldCBsb2FkL3N0YXR1cyBmbGFnc1xyXG4gICAgICAgIHJlc2V0UHJvcGVydGllcygpO1xyXG5cclxuICAgICAgfVxyXG5cclxuICAgICAgcmV0dXJuIHM7XHJcblxyXG4gICAgfTtcclxuXHJcbiAgICAvKipcclxuICAgICAqIFVubG9hZHMgYW5kIGRlc3Ryb3lzIGEgc291bmQuXHJcbiAgICAgKi9cclxuXHJcbiAgICB0aGlzLmRlc3RydWN0ID0gZnVuY3Rpb24oX2JGcm9tU00pIHtcclxuXHJcbiAgICAgIHNtMi5fd0Qocy5pZCArICc6IERlc3RydWN0Jyk7XHJcblxyXG4gICAgICBpZiAoIXMuaXNIVE1MNSkge1xyXG5cclxuICAgICAgICAvLyBraWxsIHNvdW5kIHdpdGhpbiBGbGFzaFxyXG4gICAgICAgIC8vIERpc2FibGUgdGhlIG9uZmFpbHVyZSBoYW5kbGVyXHJcbiAgICAgICAgcy5faU8ub25mYWlsdXJlID0gbnVsbDtcclxuICAgICAgICBmbGFzaC5fZGVzdHJveVNvdW5kKHMuaWQpO1xyXG5cclxuICAgICAgfSBlbHNlIHtcclxuXHJcbiAgICAgICAgc3RvcF9odG1sNV90aW1lcigpO1xyXG5cclxuICAgICAgICBpZiAocy5fYSkge1xyXG4gICAgICAgICAgcy5fYS5wYXVzZSgpO1xyXG4gICAgICAgICAgaHRtbDVVbmxvYWQocy5fYSk7XHJcbiAgICAgICAgICBpZiAoIXVzZUdsb2JhbEhUTUw1QXVkaW8pIHtcclxuICAgICAgICAgICAgcmVtb3ZlX2h0bWw1X2V2ZW50cygpO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgICAgLy8gYnJlYWsgb2J2aW91cyBjaXJjdWxhciByZWZlcmVuY2VcclxuICAgICAgICAgIHMuX2EuX3MgPSBudWxsO1xyXG4gICAgICAgICAgcy5fYSA9IG51bGw7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgfVxyXG5cclxuICAgICAgaWYgKCFfYkZyb21TTSkge1xyXG4gICAgICAgIC8vIGVuc3VyZSBkZWxldGlvbiBmcm9tIGNvbnRyb2xsZXJcclxuICAgICAgICBzbTIuZGVzdHJveVNvdW5kKHMuaWQsIHRydWUpO1xyXG4gICAgICB9XHJcblxyXG4gICAgfTtcclxuXHJcbiAgICAvKipcclxuICAgICAqIEJlZ2lucyBwbGF5aW5nIGEgc291bmQuXHJcbiAgICAgKlxyXG4gICAgICogQHBhcmFtIHtvYmplY3R9IG9PcHRpb25zIE9wdGlvbmFsOiBTb3VuZCBvcHRpb25zXHJcbiAgICAgKiBAcmV0dXJuIHtTTVNvdW5kfSBUaGUgU01Tb3VuZCBvYmplY3RcclxuICAgICAqL1xyXG5cclxuICAgIHRoaXMucGxheSA9IGZ1bmN0aW9uKG9PcHRpb25zLCBfdXBkYXRlUGxheVN0YXRlKSB7XHJcblxyXG4gICAgICB2YXIgZk4sIGFsbG93TXVsdGksIGEsIG9ucmVhZHksXHJcbiAgICAgICAgICBhdWRpb0Nsb25lLCBvbmVuZGVkLCBvbmNhbnBsYXksXHJcbiAgICAgICAgICBzdGFydE9LID0gdHJ1ZSxcclxuICAgICAgICAgIGV4aXQgPSBudWxsO1xyXG5cclxuICAgICAgLy8gPGQ+XHJcbiAgICAgIGZOID0gcy5pZCArICc6IHBsYXkoKTogJztcclxuICAgICAgLy8gPC9kPlxyXG5cclxuICAgICAgLy8gZGVmYXVsdCB0byB0cnVlXHJcbiAgICAgIF91cGRhdGVQbGF5U3RhdGUgPSAoX3VwZGF0ZVBsYXlTdGF0ZSA9PT0gX3VuZGVmaW5lZCA/IHRydWUgOiBfdXBkYXRlUGxheVN0YXRlKTtcclxuXHJcbiAgICAgIGlmICghb09wdGlvbnMpIHtcclxuICAgICAgICBvT3B0aW9ucyA9IHt9O1xyXG4gICAgICB9XHJcblxyXG4gICAgICAvLyBmaXJzdCwgdXNlIGxvY2FsIFVSTCAoaWYgc3BlY2lmaWVkKVxyXG4gICAgICBpZiAocy51cmwpIHtcclxuICAgICAgICBzLl9pTy51cmwgPSBzLnVybDtcclxuICAgICAgfVxyXG5cclxuICAgICAgLy8gbWl4IGluIGFueSBvcHRpb25zIGRlZmluZWQgYXQgY3JlYXRlU291bmQoKVxyXG4gICAgICBzLl9pTyA9IG1peGluKHMuX2lPLCBzLm9wdGlvbnMpO1xyXG5cclxuICAgICAgLy8gbWl4IGluIGFueSBvcHRpb25zIHNwZWNpZmljIHRvIHRoaXMgbWV0aG9kXHJcbiAgICAgIHMuX2lPID0gbWl4aW4ob09wdGlvbnMsIHMuX2lPKTtcclxuXHJcbiAgICAgIHMuX2lPLnVybCA9IHBhcnNlVVJMKHMuX2lPLnVybCk7XHJcblxyXG4gICAgICBzLmluc3RhbmNlT3B0aW9ucyA9IHMuX2lPO1xyXG5cclxuICAgICAgLy8gUlRNUC1vbmx5XHJcbiAgICAgIGlmICghcy5pc0hUTUw1ICYmIHMuX2lPLnNlcnZlclVSTCAmJiAhcy5jb25uZWN0ZWQpIHtcclxuICAgICAgICBpZiAoIXMuZ2V0QXV0b1BsYXkoKSkge1xyXG4gICAgICAgICAgc20yLl93RChmTiArJyBOZXRzdHJlYW0gbm90IGNvbm5lY3RlZCB5ZXQgLSBzZXR0aW5nIGF1dG9QbGF5Jyk7XHJcbiAgICAgICAgICBzLnNldEF1dG9QbGF5KHRydWUpO1xyXG4gICAgICAgIH1cclxuICAgICAgICAvLyBwbGF5IHdpbGwgYmUgY2FsbGVkIGluIG9uY29ubmVjdCgpXHJcbiAgICAgICAgcmV0dXJuIHM7XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIGlmIChodG1sNU9LKHMuX2lPKSkge1xyXG4gICAgICAgIHMuX3NldHVwX2h0bWw1KHMuX2lPKTtcclxuICAgICAgICBzdGFydF9odG1sNV90aW1lcigpO1xyXG4gICAgICB9XHJcblxyXG4gICAgICBpZiAocy5wbGF5U3RhdGUgPT09IDEgJiYgIXMucGF1c2VkKSB7XHJcbiAgICAgICAgYWxsb3dNdWx0aSA9IHMuX2lPLm11bHRpU2hvdDtcclxuICAgICAgICBpZiAoIWFsbG93TXVsdGkpIHtcclxuICAgICAgICAgIHNtMi5fd0QoZk4gKyAnQWxyZWFkeSBwbGF5aW5nIChvbmUtc2hvdCknLCAxKTtcclxuICAgICAgICAgIGlmIChzLmlzSFRNTDUpIHtcclxuICAgICAgICAgICAgLy8gZ28gYmFjayB0byBvcmlnaW5hbCBwb3NpdGlvbi5cclxuICAgICAgICAgICAgcy5zZXRQb3NpdGlvbihzLl9pTy5wb3NpdGlvbik7XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgICBleGl0ID0gcztcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgc20yLl93RChmTiArICdBbHJlYWR5IHBsYXlpbmcgKG11bHRpLXNob3QpJywgMSk7XHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcblxyXG4gICAgICBpZiAoZXhpdCAhPT0gbnVsbCkge1xyXG4gICAgICAgIHJldHVybiBleGl0O1xyXG4gICAgICB9XHJcblxyXG4gICAgICAvLyBlZGdlIGNhc2U6IHBsYXkoKSB3aXRoIGV4cGxpY2l0IFVSTCBwYXJhbWV0ZXJcclxuICAgICAgaWYgKG9PcHRpb25zLnVybCAmJiBvT3B0aW9ucy51cmwgIT09IHMudXJsKSB7XHJcblxyXG4gICAgICAgIC8vIHNwZWNpYWwgY2FzZSBmb3IgY3JlYXRlU291bmQoKSBmb2xsb3dlZCBieSBsb2FkKCkgLyBwbGF5KCkgd2l0aCB1cmw7IGF2b2lkIGRvdWJsZS1sb2FkIGNhc2UuXHJcbiAgICAgICAgaWYgKCFzLnJlYWR5U3RhdGUgJiYgIXMuaXNIVE1MNSAmJiBmViA9PT0gOCAmJiB1cmxPbWl0dGVkKSB7XHJcblxyXG4gICAgICAgICAgdXJsT21pdHRlZCA9IGZhbHNlO1xyXG5cclxuICAgICAgICB9IGVsc2Uge1xyXG5cclxuICAgICAgICAgIC8vIGxvYWQgdXNpbmcgbWVyZ2VkIG9wdGlvbnNcclxuICAgICAgICAgIHMubG9hZChzLl9pTyk7XHJcblxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgIH1cclxuXHJcbiAgICAgIGlmICghcy5sb2FkZWQpIHtcclxuXHJcbiAgICAgICAgaWYgKHMucmVhZHlTdGF0ZSA9PT0gMCkge1xyXG5cclxuICAgICAgICAgIHNtMi5fd0QoZk4gKyAnQXR0ZW1wdGluZyB0byBsb2FkJyk7XHJcblxyXG4gICAgICAgICAgLy8gdHJ5IHRvIGdldCB0aGlzIHNvdW5kIHBsYXlpbmcgQVNBUFxyXG4gICAgICAgICAgaWYgKCFzLmlzSFRNTDUgJiYgIXNtMi5odG1sNU9ubHkpIHtcclxuXHJcbiAgICAgICAgICAgIC8vIGZsYXNoOiBhc3NpZ24gZGlyZWN0bHkgYmVjYXVzZSBzZXRBdXRvUGxheSgpIGluY3JlbWVudHMgdGhlIGluc3RhbmNlQ291bnRcclxuICAgICAgICAgICAgcy5faU8uYXV0b1BsYXkgPSB0cnVlO1xyXG4gICAgICAgICAgICBzLmxvYWQocy5faU8pO1xyXG5cclxuICAgICAgICAgIH0gZWxzZSBpZiAocy5pc0hUTUw1KSB7XHJcblxyXG4gICAgICAgICAgICAvLyBpT1MgbmVlZHMgdGhpcyB3aGVuIHJlY3ljbGluZyBzb3VuZHMsIGxvYWRpbmcgYSBuZXcgVVJMIG9uIGFuIGV4aXN0aW5nIG9iamVjdC5cclxuICAgICAgICAgICAgcy5sb2FkKHMuX2lPKTtcclxuXHJcbiAgICAgICAgICB9IGVsc2Uge1xyXG5cclxuICAgICAgICAgICAgc20yLl93RChmTiArICdVbnN1cHBvcnRlZCB0eXBlLiBFeGl0aW5nLicpO1xyXG4gICAgICAgICAgICBleGl0ID0gcztcclxuXHJcbiAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgLy8gSFRNTDUgaGFjayAtIHJlLXNldCBpbnN0YW5jZU9wdGlvbnM/XHJcbiAgICAgICAgICBzLmluc3RhbmNlT3B0aW9ucyA9IHMuX2lPO1xyXG5cclxuICAgICAgICB9IGVsc2UgaWYgKHMucmVhZHlTdGF0ZSA9PT0gMikge1xyXG5cclxuICAgICAgICAgIHNtMi5fd0QoZk4gKyAnQ291bGQgbm90IGxvYWQgLSBleGl0aW5nJywgMik7XHJcbiAgICAgICAgICBleGl0ID0gcztcclxuXHJcbiAgICAgICAgfSBlbHNlIHtcclxuXHJcbiAgICAgICAgICBzbTIuX3dEKGZOICsgJ0xvYWRpbmcgLSBhdHRlbXB0aW5nIHRvIHBsYXkuLi4nKTtcclxuXHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgfSBlbHNlIHtcclxuXHJcbiAgICAgICAgLy8gXCJwbGF5KClcIlxyXG4gICAgICAgIHNtMi5fd0QoZk4uc3Vic3RyKDAsIGZOLmxhc3RJbmRleE9mKCc6JykpKTtcclxuXHJcbiAgICAgIH1cclxuXHJcbiAgICAgIGlmIChleGl0ICE9PSBudWxsKSB7XHJcbiAgICAgICAgcmV0dXJuIGV4aXQ7XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIGlmICghcy5pc0hUTUw1ICYmIGZWID09PSA5ICYmIHMucG9zaXRpb24gPiAwICYmIHMucG9zaXRpb24gPT09IHMuZHVyYXRpb24pIHtcclxuICAgICAgICAvLyBmbGFzaCA5IG5lZWRzIGEgcG9zaXRpb24gcmVzZXQgaWYgcGxheSgpIGlzIGNhbGxlZCB3aGlsZSBhdCB0aGUgZW5kIG9mIGEgc291bmQuXHJcbiAgICAgICAgc20yLl93RChmTiArICdTb3VuZCBhdCBlbmQsIHJlc2V0dGluZyB0byBwb3NpdGlvbjowJyk7XHJcbiAgICAgICAgb09wdGlvbnMucG9zaXRpb24gPSAwO1xyXG4gICAgICB9XHJcblxyXG4gICAgICAvKipcclxuICAgICAgICogU3RyZWFtcyB3aWxsIHBhdXNlIHdoZW4gdGhlaXIgYnVmZmVyIGlzIGZ1bGwgaWYgdGhleSBhcmUgYmVpbmcgbG9hZGVkLlxyXG4gICAgICAgKiBJbiB0aGlzIGNhc2UgcGF1c2VkIGlzIHRydWUsIGJ1dCB0aGUgc29uZyBoYXNuJ3Qgc3RhcnRlZCBwbGF5aW5nIHlldC5cclxuICAgICAgICogSWYgd2UganVzdCBjYWxsIHJlc3VtZSgpIHRoZSBvbnBsYXkoKSBjYWxsYmFjayB3aWxsIG5ldmVyIGJlIGNhbGxlZC5cclxuICAgICAgICogU28gb25seSBjYWxsIHJlc3VtZSgpIGlmIHRoZSBwb3NpdGlvbiBpcyA+IDAuXHJcbiAgICAgICAqIEFub3RoZXIgcmVhc29uIGlzIGJlY2F1c2Ugb3B0aW9ucyBsaWtlIHZvbHVtZSB3b24ndCBoYXZlIGJlZW4gYXBwbGllZCB5ZXQuXHJcbiAgICAgICAqIEZvciBub3JtYWwgc291bmRzLCBqdXN0IHJlc3VtZS5cclxuICAgICAgICovXHJcblxyXG4gICAgICBpZiAocy5wYXVzZWQgJiYgcy5wb3NpdGlvbiA+PSAwICYmICghcy5faU8uc2VydmVyVVJMIHx8IHMucG9zaXRpb24gPiAwKSkge1xyXG5cclxuICAgICAgICAvLyBodHRwczovL2dpc3QuZ2l0aHViLmNvbS8zN2IxN2RmNzVjYzRkN2E5MGJmNlxyXG4gICAgICAgIHNtMi5fd0QoZk4gKyAnUmVzdW1pbmcgZnJvbSBwYXVzZWQgc3RhdGUnLCAxKTtcclxuICAgICAgICBzLnJlc3VtZSgpO1xyXG5cclxuICAgICAgfSBlbHNlIHtcclxuXHJcbiAgICAgICAgcy5faU8gPSBtaXhpbihvT3B0aW9ucywgcy5faU8pO1xyXG5cclxuICAgICAgICAvKipcclxuICAgICAgICAgKiBQcmVsb2FkIGluIHRoZSBldmVudCBvZiBwbGF5KCkgd2l0aCBwb3NpdGlvbiB1bmRlciBGbGFzaCxcclxuICAgICAgICAgKiBvciBmcm9tL3RvIHBhcmFtZXRlcnMgYW5kIG5vbi1SVE1QIGNhc2VcclxuICAgICAgICAgKi9cclxuICAgICAgICBpZiAoKCghcy5pc0hUTUw1ICYmIHMuX2lPLnBvc2l0aW9uICE9PSBudWxsICYmIHMuX2lPLnBvc2l0aW9uID4gMCkgfHwgKHMuX2lPLmZyb20gIT09IG51bGwgJiYgcy5faU8uZnJvbSA+IDApIHx8IHMuX2lPLnRvICE9PSBudWxsKSAmJiBzLmluc3RhbmNlQ291bnQgPT09IDAgJiYgcy5wbGF5U3RhdGUgPT09IDAgJiYgIXMuX2lPLnNlcnZlclVSTCkge1xyXG5cclxuICAgICAgICAgIG9ucmVhZHkgPSBmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgLy8gc291bmQgXCJjYW5wbGF5XCIgb3Igb25sb2FkKClcclxuICAgICAgICAgICAgLy8gcmUtYXBwbHkgcG9zaXRpb24vZnJvbS90byB0byBpbnN0YW5jZSBvcHRpb25zLCBhbmQgc3RhcnQgcGxheWJhY2tcclxuICAgICAgICAgICAgcy5faU8gPSBtaXhpbihvT3B0aW9ucywgcy5faU8pO1xyXG4gICAgICAgICAgICBzLnBsYXkocy5faU8pO1xyXG4gICAgICAgICAgfTtcclxuXHJcbiAgICAgICAgICAvLyBIVE1MNSBuZWVkcyB0byBhdCBsZWFzdCBoYXZlIFwiY2FucGxheVwiIGZpcmVkIGJlZm9yZSBzZWVraW5nLlxyXG4gICAgICAgICAgaWYgKHMuaXNIVE1MNSAmJiAhcy5faHRtbDVfY2FucGxheSkge1xyXG5cclxuICAgICAgICAgICAgLy8gdGhpcyBoYXNuJ3QgYmVlbiBsb2FkZWQgeWV0LiBsb2FkIGl0IGZpcnN0LCBhbmQgdGhlbiBkbyB0aGlzIGFnYWluLlxyXG4gICAgICAgICAgICBzbTIuX3dEKGZOICsgJ0JlZ2lubmluZyBsb2FkIGZvciBub24temVybyBvZmZzZXQgY2FzZScpO1xyXG5cclxuICAgICAgICAgICAgcy5sb2FkKHtcclxuICAgICAgICAgICAgICAvLyBub3RlOiBjdXN0b20gSFRNTDUtb25seSBldmVudCBhZGRlZCBmb3IgZnJvbS90byBpbXBsZW1lbnRhdGlvbi5cclxuICAgICAgICAgICAgICBfb25jYW5wbGF5OiBvbnJlYWR5XHJcbiAgICAgICAgICAgIH0pO1xyXG5cclxuICAgICAgICAgICAgZXhpdCA9IGZhbHNlO1xyXG5cclxuICAgICAgICAgIH0gZWxzZSBpZiAoIXMuaXNIVE1MNSAmJiAhcy5sb2FkZWQgJiYgKCFzLnJlYWR5U3RhdGUgfHwgcy5yZWFkeVN0YXRlICE9PSAyKSkge1xyXG5cclxuICAgICAgICAgICAgLy8gdG8gYmUgc2FmZSwgcHJlbG9hZCB0aGUgd2hvbGUgdGhpbmcgaW4gRmxhc2guXHJcblxyXG4gICAgICAgICAgICBzbTIuX3dEKGZOICsgJ1ByZWxvYWRpbmcgZm9yIG5vbi16ZXJvIG9mZnNldCBjYXNlJyk7XHJcblxyXG4gICAgICAgICAgICBzLmxvYWQoe1xyXG4gICAgICAgICAgICAgIG9ubG9hZDogb25yZWFkeVxyXG4gICAgICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgICAgIGV4aXQgPSBmYWxzZTtcclxuXHJcbiAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgaWYgKGV4aXQgIT09IG51bGwpIHtcclxuICAgICAgICAgICAgcmV0dXJuIGV4aXQ7XHJcbiAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgLy8gb3RoZXJ3aXNlLCB3ZSdyZSByZWFkeSB0byBnby4gcmUtYXBwbHkgbG9jYWwgb3B0aW9ucywgYW5kIGNvbnRpbnVlXHJcblxyXG4gICAgICAgICAgcy5faU8gPSBhcHBseUZyb21UbygpO1xyXG5cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8vIHNtMi5fd0QoZk4gKyAnU3RhcnRpbmcgdG8gcGxheScpO1xyXG5cclxuICAgICAgICAvLyBpbmNyZW1lbnQgaW5zdGFuY2UgY291bnRlciwgd2hlcmUgZW5hYmxlZCArIHN1cHBvcnRlZFxyXG4gICAgICAgIGlmICghcy5pbnN0YW5jZUNvdW50IHx8IHMuX2lPLm11bHRpU2hvdEV2ZW50cyB8fCAocy5pc0hUTUw1ICYmIHMuX2lPLm11bHRpU2hvdCAmJiAhdXNlR2xvYmFsSFRNTDVBdWRpbykgfHwgKCFzLmlzSFRNTDUgJiYgZlYgPiA4ICYmICFzLmdldEF1dG9QbGF5KCkpKSB7XHJcbiAgICAgICAgICBzLmluc3RhbmNlQ291bnQrKztcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8vIGlmIGZpcnN0IHBsYXkgYW5kIG9ucG9zaXRpb24gcGFyYW1ldGVycyBleGlzdCwgYXBwbHkgdGhlbSBub3dcclxuICAgICAgICBpZiAocy5faU8ub25wb3NpdGlvbiAmJiBzLnBsYXlTdGF0ZSA9PT0gMCkge1xyXG4gICAgICAgICAgYXR0YWNoT25Qb3NpdGlvbihzKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHMucGxheVN0YXRlID0gMTtcclxuICAgICAgICBzLnBhdXNlZCA9IGZhbHNlO1xyXG5cclxuICAgICAgICBzLnBvc2l0aW9uID0gKHMuX2lPLnBvc2l0aW9uICE9PSBfdW5kZWZpbmVkICYmICFpc05hTihzLl9pTy5wb3NpdGlvbikgPyBzLl9pTy5wb3NpdGlvbiA6IDApO1xyXG5cclxuICAgICAgICBpZiAoIXMuaXNIVE1MNSkge1xyXG4gICAgICAgICAgcy5faU8gPSBwb2xpY3lGaXgobG9vcEZpeChzLl9pTykpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgaWYgKHMuX2lPLm9ucGxheSAmJiBfdXBkYXRlUGxheVN0YXRlKSB7XHJcbiAgICAgICAgICBzLl9pTy5vbnBsYXkuYXBwbHkocyk7XHJcbiAgICAgICAgICBvbnBsYXlfY2FsbGVkID0gdHJ1ZTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHMuc2V0Vm9sdW1lKHMuX2lPLnZvbHVtZSwgdHJ1ZSk7XHJcbiAgICAgICAgcy5zZXRQYW4ocy5faU8ucGFuLCB0cnVlKTtcclxuXHJcbiAgICAgICAgaWYgKCFzLmlzSFRNTDUpIHtcclxuXHJcbiAgICAgICAgICBzdGFydE9LID0gZmxhc2guX3N0YXJ0KHMuaWQsIHMuX2lPLmxvb3BzIHx8IDEsIChmViA9PT0gOSA/IHMucG9zaXRpb24gOiBzLnBvc2l0aW9uIC8gbXNlY1NjYWxlKSwgcy5faU8ubXVsdGlTaG90IHx8IGZhbHNlKTtcclxuXHJcbiAgICAgICAgICBpZiAoZlYgPT09IDkgJiYgIXN0YXJ0T0spIHtcclxuICAgICAgICAgICAgLy8gZWRnZSBjYXNlOiBubyBzb3VuZCBoYXJkd2FyZSwgb3IgMzItY2hhbm5lbCBmbGFzaCBjZWlsaW5nIGhpdC5cclxuICAgICAgICAgICAgLy8gYXBwbGllcyBvbmx5IHRvIEZsYXNoIDksIG5vbi1OZXRTdHJlYW0vTW92aWVTdGFyIHNvdW5kcy5cclxuICAgICAgICAgICAgLy8gaHR0cDovL2hlbHAuYWRvYmUuY29tL2VuX1VTL0ZsYXNoUGxhdGZvcm0vcmVmZXJlbmNlL2FjdGlvbnNjcmlwdC8zL2ZsYXNoL21lZGlhL1NvdW5kLmh0bWwjcGxheSUyOCUyOVxyXG4gICAgICAgICAgICBzbTIuX3dEKGZOICsgJ05vIHNvdW5kIGhhcmR3YXJlLCBvciAzMi1zb3VuZCBjZWlsaW5nIGhpdCcsIDIpO1xyXG4gICAgICAgICAgICBpZiAocy5faU8ub25wbGF5ZXJyb3IpIHtcclxuICAgICAgICAgICAgICBzLl9pTy5vbnBsYXllcnJvci5hcHBseShzKTtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgfSBlbHNlIHtcclxuXHJcbiAgICAgICAgICBpZiAocy5pbnN0YW5jZUNvdW50IDwgMikge1xyXG5cclxuICAgICAgICAgICAgLy8gSFRNTDUgc2luZ2xlLWluc3RhbmNlIGNhc2VcclxuXHJcbiAgICAgICAgICAgIHN0YXJ0X2h0bWw1X3RpbWVyKCk7XHJcblxyXG4gICAgICAgICAgICBhID0gcy5fc2V0dXBfaHRtbDUoKTtcclxuXHJcbiAgICAgICAgICAgIHMuc2V0UG9zaXRpb24ocy5faU8ucG9zaXRpb24pO1xyXG5cclxuICAgICAgICAgICAgYS5wbGF5KCk7XHJcblxyXG4gICAgICAgICAgfSBlbHNlIHtcclxuXHJcbiAgICAgICAgICAgIC8vIEhUTUw1IG11bHRpLXNob3QgY2FzZVxyXG5cclxuICAgICAgICAgICAgc20yLl93RChzLmlkICsgJzogQ2xvbmluZyBBdWRpbygpIGZvciBpbnN0YW5jZSAjJyArIHMuaW5zdGFuY2VDb3VudCArICcuLi4nKTtcclxuXHJcbiAgICAgICAgICAgIGF1ZGlvQ2xvbmUgPSBuZXcgQXVkaW8ocy5faU8udXJsKTtcclxuXHJcbiAgICAgICAgICAgIG9uZW5kZWQgPSBmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgICBldmVudC5yZW1vdmUoYXVkaW9DbG9uZSwgJ2VuZGVkJywgb25lbmRlZCk7XHJcbiAgICAgICAgICAgICAgcy5fb25maW5pc2gocyk7XHJcbiAgICAgICAgICAgICAgLy8gY2xlYW51cFxyXG4gICAgICAgICAgICAgIGh0bWw1VW5sb2FkKGF1ZGlvQ2xvbmUpO1xyXG4gICAgICAgICAgICAgIGF1ZGlvQ2xvbmUgPSBudWxsO1xyXG4gICAgICAgICAgICB9O1xyXG5cclxuICAgICAgICAgICAgb25jYW5wbGF5ID0gZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgICAgZXZlbnQucmVtb3ZlKGF1ZGlvQ2xvbmUsICdjYW5wbGF5Jywgb25jYW5wbGF5KTtcclxuICAgICAgICAgICAgICB0cnkge1xyXG4gICAgICAgICAgICAgICAgYXVkaW9DbG9uZS5jdXJyZW50VGltZSA9IHMuX2lPLnBvc2l0aW9uL21zZWNTY2FsZTtcclxuICAgICAgICAgICAgICB9IGNhdGNoKGVycikge1xyXG4gICAgICAgICAgICAgICAgY29tcGxhaW4ocy5pZCArICc6IG11bHRpU2hvdCBwbGF5KCkgZmFpbGVkIHRvIGFwcGx5IHBvc2l0aW9uIG9mICcgKyAocy5faU8ucG9zaXRpb24vbXNlY1NjYWxlKSk7XHJcbiAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgIGF1ZGlvQ2xvbmUucGxheSgpO1xyXG4gICAgICAgICAgICB9O1xyXG5cclxuICAgICAgICAgICAgZXZlbnQuYWRkKGF1ZGlvQ2xvbmUsICdlbmRlZCcsIG9uZW5kZWQpO1xyXG5cclxuICAgICAgICAgICAgLy8gYXBwbHkgdm9sdW1lIHRvIGNsb25lcywgdG9vXHJcbiAgICAgICAgICAgIGlmIChzLl9pTy52b2x1bWUgIT09IHVuZGVmaW5lZCkge1xyXG4gICAgICAgICAgICAgIGF1ZGlvQ2xvbmUudm9sdW1lID0gTWF0aC5tYXgoMCwgTWF0aC5taW4oMSwgcy5faU8udm9sdW1lLzEwMCkpO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAvLyBwbGF5aW5nIG11bHRpcGxlIG11dGVkIHNvdW5kcz8gaWYgeW91IGRvIHRoaXMsIHlvdSdyZSB3ZWlyZCA7KSAtIGJ1dCBsZXQncyBjb3ZlciBpdC5cclxuICAgICAgICAgICAgaWYgKHMubXV0ZWQpIHtcclxuICAgICAgICAgICAgICBhdWRpb0Nsb25lLm11dGVkID0gdHJ1ZTtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgaWYgKHMuX2lPLnBvc2l0aW9uKSB7XHJcbiAgICAgICAgICAgICAgLy8gSFRNTDUgYXVkaW8gY2FuJ3Qgc2VlayBiZWZvcmUgb25wbGF5KCkgZXZlbnQgaGFzIGZpcmVkLlxyXG4gICAgICAgICAgICAgIC8vIHdhaXQgZm9yIGNhbnBsYXksIHRoZW4gc2VlayB0byBwb3NpdGlvbiBhbmQgc3RhcnQgcGxheWJhY2suXHJcbiAgICAgICAgICAgICAgZXZlbnQuYWRkKGF1ZGlvQ2xvbmUsICdjYW5wbGF5Jywgb25jYW5wbGF5KTtcclxuICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAvLyBiZWdpbiBwbGF5YmFjayBhdCBjdXJyZW50VGltZTogMFxyXG4gICAgICAgICAgICAgIGF1ZGlvQ2xvbmUucGxheSgpO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgfVxyXG5cclxuICAgICAgICB9XHJcblxyXG4gICAgICB9XHJcblxyXG4gICAgICByZXR1cm4gcztcclxuXHJcbiAgICB9O1xyXG5cclxuICAgIC8vIGp1c3QgZm9yIGNvbnZlbmllbmNlXHJcbiAgICB0aGlzLnN0YXJ0ID0gdGhpcy5wbGF5O1xyXG5cclxuICAgIC8qKlxyXG4gICAgICogU3RvcHMgcGxheWluZyBhIHNvdW5kIChhbmQgb3B0aW9uYWxseSwgYWxsIHNvdW5kcylcclxuICAgICAqXHJcbiAgICAgKiBAcGFyYW0ge2Jvb2xlYW59IGJBbGwgT3B0aW9uYWw6IFdoZXRoZXIgdG8gc3RvcCBhbGwgc291bmRzXHJcbiAgICAgKiBAcmV0dXJuIHtTTVNvdW5kfSBUaGUgU01Tb3VuZCBvYmplY3RcclxuICAgICAqL1xyXG5cclxuICAgIHRoaXMuc3RvcCA9IGZ1bmN0aW9uKGJBbGwpIHtcclxuXHJcbiAgICAgIHZhciBpbnN0YW5jZU9wdGlvbnMgPSBzLl9pTyxcclxuICAgICAgICAgIG9yaWdpbmFsUG9zaXRpb247XHJcblxyXG4gICAgICBpZiAocy5wbGF5U3RhdGUgPT09IDEpIHtcclxuXHJcbiAgICAgICAgc20yLl93RChzLmlkICsgJzogc3RvcCgpJyk7XHJcblxyXG4gICAgICAgIHMuX29uYnVmZmVyY2hhbmdlKDApO1xyXG4gICAgICAgIHMuX3Jlc2V0T25Qb3NpdGlvbigwKTtcclxuICAgICAgICBzLnBhdXNlZCA9IGZhbHNlO1xyXG5cclxuICAgICAgICBpZiAoIXMuaXNIVE1MNSkge1xyXG4gICAgICAgICAgcy5wbGF5U3RhdGUgPSAwO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLy8gcmVtb3ZlIG9uUG9zaXRpb24gbGlzdGVuZXJzLCBpZiBhbnlcclxuICAgICAgICBkZXRhY2hPblBvc2l0aW9uKCk7XHJcblxyXG4gICAgICAgIC8vIGFuZCBcInRvXCIgcG9zaXRpb24sIGlmIHNldFxyXG4gICAgICAgIGlmIChpbnN0YW5jZU9wdGlvbnMudG8pIHtcclxuICAgICAgICAgIHMuY2xlYXJPblBvc2l0aW9uKGluc3RhbmNlT3B0aW9ucy50byk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBpZiAoIXMuaXNIVE1MNSkge1xyXG5cclxuICAgICAgICAgIGZsYXNoLl9zdG9wKHMuaWQsIGJBbGwpO1xyXG5cclxuICAgICAgICAgIC8vIGhhY2sgZm9yIG5ldFN0cmVhbToganVzdCB1bmxvYWRcclxuICAgICAgICAgIGlmIChpbnN0YW5jZU9wdGlvbnMuc2VydmVyVVJMKSB7XHJcbiAgICAgICAgICAgIHMudW5sb2FkKCk7XHJcbiAgICAgICAgICB9XHJcblxyXG4gICAgICAgIH0gZWxzZSB7XHJcblxyXG4gICAgICAgICAgaWYgKHMuX2EpIHtcclxuXHJcbiAgICAgICAgICAgIG9yaWdpbmFsUG9zaXRpb24gPSBzLnBvc2l0aW9uO1xyXG5cclxuICAgICAgICAgICAgLy8gYWN0IGxpa2UgRmxhc2gsIHRob3VnaFxyXG4gICAgICAgICAgICBzLnNldFBvc2l0aW9uKDApO1xyXG5cclxuICAgICAgICAgICAgLy8gaGFjazogcmVmbGVjdCBvbGQgcG9zaXRpb24gZm9yIG9uc3RvcCgpIChhbHNvIGxpa2UgRmxhc2gpXHJcbiAgICAgICAgICAgIHMucG9zaXRpb24gPSBvcmlnaW5hbFBvc2l0aW9uO1xyXG5cclxuICAgICAgICAgICAgLy8gaHRtbDUgaGFzIG5vIHN0b3AoKVxyXG4gICAgICAgICAgICAvLyBOT1RFOiBwYXVzaW5nIG1lYW5zIGlPUyByZXF1aXJlcyBpbnRlcmFjdGlvbiB0byByZXN1bWUuXHJcbiAgICAgICAgICAgIHMuX2EucGF1c2UoKTtcclxuXHJcbiAgICAgICAgICAgIHMucGxheVN0YXRlID0gMDtcclxuXHJcbiAgICAgICAgICAgIC8vIGFuZCB1cGRhdGUgVUlcclxuICAgICAgICAgICAgcy5fb25UaW1lcigpO1xyXG5cclxuICAgICAgICAgICAgc3RvcF9odG1sNV90aW1lcigpO1xyXG5cclxuICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBzLmluc3RhbmNlQ291bnQgPSAwO1xyXG4gICAgICAgIHMuX2lPID0ge307XHJcblxyXG4gICAgICAgIGlmIChpbnN0YW5jZU9wdGlvbnMub25zdG9wKSB7XHJcbiAgICAgICAgICBpbnN0YW5jZU9wdGlvbnMub25zdG9wLmFwcGx5KHMpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgIH1cclxuXHJcbiAgICAgIHJldHVybiBzO1xyXG5cclxuICAgIH07XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBVbmRvY3VtZW50ZWQvaW50ZXJuYWw6IFNldHMgYXV0b1BsYXkgZm9yIFJUTVAuXHJcbiAgICAgKlxyXG4gICAgICogQHBhcmFtIHtib29sZWFufSBhdXRvUGxheSBzdGF0ZVxyXG4gICAgICovXHJcblxyXG4gICAgdGhpcy5zZXRBdXRvUGxheSA9IGZ1bmN0aW9uKGF1dG9QbGF5KSB7XHJcblxyXG4gICAgICBzbTIuX3dEKHMuaWQgKyAnOiBBdXRvcGxheSB0dXJuZWQgJyArIChhdXRvUGxheSA/ICdvbicgOiAnb2ZmJykpO1xyXG4gICAgICBzLl9pTy5hdXRvUGxheSA9IGF1dG9QbGF5O1xyXG5cclxuICAgICAgaWYgKCFzLmlzSFRNTDUpIHtcclxuICAgICAgICBmbGFzaC5fc2V0QXV0b1BsYXkocy5pZCwgYXV0b1BsYXkpO1xyXG4gICAgICAgIGlmIChhdXRvUGxheSkge1xyXG4gICAgICAgICAgLy8gb25seSBpbmNyZW1lbnQgdGhlIGluc3RhbmNlQ291bnQgaWYgdGhlIHNvdW5kIGlzbid0IGxvYWRlZCAoVE9ETzogdmVyaWZ5IFJUTVApXHJcbiAgICAgICAgICBpZiAoIXMuaW5zdGFuY2VDb3VudCAmJiBzLnJlYWR5U3RhdGUgPT09IDEpIHtcclxuICAgICAgICAgICAgcy5pbnN0YW5jZUNvdW50Kys7XHJcbiAgICAgICAgICAgIHNtMi5fd0Qocy5pZCArICc6IEluY3JlbWVudGVkIGluc3RhbmNlIGNvdW50IHRvICcrcy5pbnN0YW5jZUNvdW50KTtcclxuICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuXHJcbiAgICB9O1xyXG5cclxuICAgIC8qKlxyXG4gICAgICogVW5kb2N1bWVudGVkL2ludGVybmFsOiBSZXR1cm5zIHRoZSBhdXRvUGxheSBib29sZWFuLlxyXG4gICAgICpcclxuICAgICAqIEByZXR1cm4ge2Jvb2xlYW59IFRoZSBjdXJyZW50IGF1dG9QbGF5IHZhbHVlXHJcbiAgICAgKi9cclxuXHJcbiAgICB0aGlzLmdldEF1dG9QbGF5ID0gZnVuY3Rpb24oKSB7XHJcblxyXG4gICAgICByZXR1cm4gcy5faU8uYXV0b1BsYXk7XHJcblxyXG4gICAgfTtcclxuXHJcbiAgICAvKipcclxuICAgICAqIFNldHMgdGhlIHBvc2l0aW9uIG9mIGEgc291bmQuXHJcbiAgICAgKlxyXG4gICAgICogQHBhcmFtIHtudW1iZXJ9IG5Nc2VjT2Zmc2V0IFBvc2l0aW9uIChtaWxsaXNlY29uZHMpXHJcbiAgICAgKiBAcmV0dXJuIHtTTVNvdW5kfSBUaGUgU01Tb3VuZCBvYmplY3RcclxuICAgICAqL1xyXG5cclxuICAgIHRoaXMuc2V0UG9zaXRpb24gPSBmdW5jdGlvbihuTXNlY09mZnNldCkge1xyXG5cclxuICAgICAgaWYgKG5Nc2VjT2Zmc2V0ID09PSBfdW5kZWZpbmVkKSB7XHJcbiAgICAgICAgbk1zZWNPZmZzZXQgPSAwO1xyXG4gICAgICB9XHJcblxyXG4gICAgICB2YXIgcG9zaXRpb24sIHBvc2l0aW9uMUssXHJcbiAgICAgICAgICAvLyBVc2UgdGhlIGR1cmF0aW9uIGZyb20gdGhlIGluc3RhbmNlIG9wdGlvbnMsIGlmIHdlIGRvbid0IGhhdmUgYSB0cmFjayBkdXJhdGlvbiB5ZXQuXHJcbiAgICAgICAgICAvLyBwb3NpdGlvbiA+PSAwIGFuZCA8PSBjdXJyZW50IGF2YWlsYWJsZSAobG9hZGVkKSBkdXJhdGlvblxyXG4gICAgICAgICAgb2Zmc2V0ID0gKHMuaXNIVE1MNSA/IE1hdGgubWF4KG5Nc2VjT2Zmc2V0LCAwKSA6IE1hdGgubWluKHMuZHVyYXRpb24gfHwgcy5faU8uZHVyYXRpb24sIE1hdGgubWF4KG5Nc2VjT2Zmc2V0LCAwKSkpO1xyXG5cclxuICAgICAgcy5wb3NpdGlvbiA9IG9mZnNldDtcclxuICAgICAgcG9zaXRpb24xSyA9IHMucG9zaXRpb24vbXNlY1NjYWxlO1xyXG4gICAgICBzLl9yZXNldE9uUG9zaXRpb24ocy5wb3NpdGlvbik7XHJcbiAgICAgIHMuX2lPLnBvc2l0aW9uID0gb2Zmc2V0O1xyXG5cclxuICAgICAgaWYgKCFzLmlzSFRNTDUpIHtcclxuXHJcbiAgICAgICAgcG9zaXRpb24gPSAoZlYgPT09IDkgPyBzLnBvc2l0aW9uIDogcG9zaXRpb24xSyk7XHJcblxyXG4gICAgICAgIGlmIChzLnJlYWR5U3RhdGUgJiYgcy5yZWFkeVN0YXRlICE9PSAyKSB7XHJcbiAgICAgICAgICAvLyBpZiBwYXVzZWQgb3Igbm90IHBsYXlpbmcsIHdpbGwgbm90IHJlc3VtZSAoYnkgcGxheWluZylcclxuICAgICAgICAgIGZsYXNoLl9zZXRQb3NpdGlvbihzLmlkLCBwb3NpdGlvbiwgKHMucGF1c2VkIHx8ICFzLnBsYXlTdGF0ZSksIHMuX2lPLm11bHRpU2hvdCk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgfSBlbHNlIGlmIChzLl9hKSB7XHJcblxyXG4gICAgICAgIC8vIFNldCB0aGUgcG9zaXRpb24gaW4gdGhlIGNhbnBsYXkgaGFuZGxlciBpZiB0aGUgc291bmQgaXMgbm90IHJlYWR5IHlldFxyXG4gICAgICAgIGlmIChzLl9odG1sNV9jYW5wbGF5KSB7XHJcblxyXG4gICAgICAgICAgaWYgKHMuX2EuY3VycmVudFRpbWUgIT09IHBvc2l0aW9uMUspIHtcclxuXHJcbiAgICAgICAgICAgIC8qKlxyXG4gICAgICAgICAgICAgKiBET00vSlMgZXJyb3JzL2V4Y2VwdGlvbnMgdG8gd2F0Y2ggb3V0IGZvcjpcclxuICAgICAgICAgICAgICogaWYgc2VlayBpcyBiZXlvbmQgKGxvYWRlZD8pIHBvc2l0aW9uLCBcIkRPTSBleGNlcHRpb24gMTFcIlxyXG4gICAgICAgICAgICAgKiBcIklOREVYX1NJWkVfRVJSXCI6IERPTSBleGNlcHRpb24gMVxyXG4gICAgICAgICAgICAgKi9cclxuICAgICAgICAgICAgc20yLl93RChzLmlkICsgJzogc2V0UG9zaXRpb24oJytwb3NpdGlvbjFLKycpJyk7XHJcblxyXG4gICAgICAgICAgICB0cnkge1xyXG4gICAgICAgICAgICAgIHMuX2EuY3VycmVudFRpbWUgPSBwb3NpdGlvbjFLO1xyXG4gICAgICAgICAgICAgIGlmIChzLnBsYXlTdGF0ZSA9PT0gMCB8fCBzLnBhdXNlZCkge1xyXG4gICAgICAgICAgICAgICAgLy8gYWxsb3cgc2VlayB3aXRob3V0IGF1dG8tcGxheS9yZXN1bWVcclxuICAgICAgICAgICAgICAgIHMuX2EucGF1c2UoKTtcclxuICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH0gY2F0Y2goZSkge1xyXG4gICAgICAgICAgICAgIHNtMi5fd0Qocy5pZCArICc6IHNldFBvc2l0aW9uKCcgKyBwb3NpdGlvbjFLICsgJykgZmFpbGVkOiAnICsgZS5tZXNzYWdlLCAyKTtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgfSBlbHNlIGlmIChwb3NpdGlvbjFLKSB7XHJcblxyXG4gICAgICAgICAgLy8gd2FybiBvbiBub24temVybyBzZWVrIGF0dGVtcHRzXHJcbiAgICAgICAgICBzbTIuX3dEKHMuaWQgKyAnOiBzZXRQb3NpdGlvbignICsgcG9zaXRpb24xSyArICcpOiBDYW5ub3Qgc2VlayB5ZXQsIHNvdW5kIG5vdCByZWFkeScsIDIpO1xyXG4gICAgICAgICAgcmV0dXJuIHM7XHJcblxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgaWYgKHMucGF1c2VkKSB7XHJcblxyXG4gICAgICAgICAgLy8gaWYgcGF1c2VkLCByZWZyZXNoIFVJIHJpZ2h0IGF3YXlcclxuICAgICAgICAgIC8vIGZvcmNlIHVwZGF0ZVxyXG4gICAgICAgICAgcy5fb25UaW1lcih0cnVlKTtcclxuXHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgfVxyXG5cclxuICAgICAgcmV0dXJuIHM7XHJcblxyXG4gICAgfTtcclxuXHJcbiAgICAvKipcclxuICAgICAqIFBhdXNlcyBzb3VuZCBwbGF5YmFjay5cclxuICAgICAqXHJcbiAgICAgKiBAcmV0dXJuIHtTTVNvdW5kfSBUaGUgU01Tb3VuZCBvYmplY3RcclxuICAgICAqL1xyXG5cclxuICAgIHRoaXMucGF1c2UgPSBmdW5jdGlvbihfYkNhbGxGbGFzaCkge1xyXG5cclxuICAgICAgaWYgKHMucGF1c2VkIHx8IChzLnBsYXlTdGF0ZSA9PT0gMCAmJiBzLnJlYWR5U3RhdGUgIT09IDEpKSB7XHJcbiAgICAgICAgcmV0dXJuIHM7XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIHNtMi5fd0Qocy5pZCArICc6IHBhdXNlKCknKTtcclxuICAgICAgcy5wYXVzZWQgPSB0cnVlO1xyXG5cclxuICAgICAgaWYgKCFzLmlzSFRNTDUpIHtcclxuICAgICAgICBpZiAoX2JDYWxsRmxhc2ggfHwgX2JDYWxsRmxhc2ggPT09IF91bmRlZmluZWQpIHtcclxuICAgICAgICAgIGZsYXNoLl9wYXVzZShzLmlkLCBzLl9pTy5tdWx0aVNob3QpO1xyXG4gICAgICAgIH1cclxuICAgICAgfSBlbHNlIHtcclxuICAgICAgICBzLl9zZXR1cF9odG1sNSgpLnBhdXNlKCk7XHJcbiAgICAgICAgc3RvcF9odG1sNV90aW1lcigpO1xyXG4gICAgICB9XHJcblxyXG4gICAgICBpZiAocy5faU8ub25wYXVzZSkge1xyXG4gICAgICAgIHMuX2lPLm9ucGF1c2UuYXBwbHkocyk7XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIHJldHVybiBzO1xyXG5cclxuICAgIH07XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBSZXN1bWVzIHNvdW5kIHBsYXliYWNrLlxyXG4gICAgICpcclxuICAgICAqIEByZXR1cm4ge1NNU291bmR9IFRoZSBTTVNvdW5kIG9iamVjdFxyXG4gICAgICovXHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBXaGVuIGF1dG8tbG9hZGVkIHN0cmVhbXMgcGF1c2Ugb24gYnVmZmVyIGZ1bGwgdGhleSBoYXZlIGEgcGxheVN0YXRlIG9mIDAuXHJcbiAgICAgKiBXZSBuZWVkIHRvIG1ha2Ugc3VyZSB0aGF0IHRoZSBwbGF5U3RhdGUgaXMgc2V0IHRvIDEgd2hlbiB0aGVzZSBzdHJlYW1zIFwicmVzdW1lXCIuXHJcbiAgICAgKiBXaGVuIGEgcGF1c2VkIHN0cmVhbSBpcyByZXN1bWVkLCB3ZSBuZWVkIHRvIHRyaWdnZXIgdGhlIG9ucGxheSgpIGNhbGxiYWNrIGlmIGl0XHJcbiAgICAgKiBoYXNuJ3QgYmVlbiBjYWxsZWQgYWxyZWFkeS4gSW4gdGhpcyBjYXNlIHNpbmNlIHRoZSBzb3VuZCBpcyBiZWluZyBwbGF5ZWQgZm9yIHRoZVxyXG4gICAgICogZmlyc3QgdGltZSwgSSB0aGluayBpdCdzIG1vcmUgYXBwcm9wcmlhdGUgdG8gY2FsbCBvbnBsYXkoKSByYXRoZXIgdGhhbiBvbnJlc3VtZSgpLlxyXG4gICAgICovXHJcblxyXG4gICAgdGhpcy5yZXN1bWUgPSBmdW5jdGlvbigpIHtcclxuXHJcbiAgICAgIHZhciBpbnN0YW5jZU9wdGlvbnMgPSBzLl9pTztcclxuXHJcbiAgICAgIGlmICghcy5wYXVzZWQpIHtcclxuICAgICAgICByZXR1cm4gcztcclxuICAgICAgfVxyXG5cclxuICAgICAgc20yLl93RChzLmlkICsgJzogcmVzdW1lKCknKTtcclxuICAgICAgcy5wYXVzZWQgPSBmYWxzZTtcclxuICAgICAgcy5wbGF5U3RhdGUgPSAxO1xyXG5cclxuICAgICAgaWYgKCFzLmlzSFRNTDUpIHtcclxuICAgICAgICBpZiAoaW5zdGFuY2VPcHRpb25zLmlzTW92aWVTdGFyICYmICFpbnN0YW5jZU9wdGlvbnMuc2VydmVyVVJMKSB7XHJcbiAgICAgICAgICAvLyBCaXphcnJlIFdlYmtpdCBidWcgKENocm9tZSByZXBvcnRlZCB2aWEgOHRyYWNrcy5jb20gZHVkZXMpOiBBQUMgY29udGVudCBwYXVzZWQgZm9yIDMwKyBzZWNvbmRzKD8pIHdpbGwgbm90IHJlc3VtZSB3aXRob3V0IGEgcmVwb3NpdGlvbi5cclxuICAgICAgICAgIHMuc2V0UG9zaXRpb24ocy5wb3NpdGlvbik7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIC8vIGZsYXNoIG1ldGhvZCBpcyB0b2dnbGUtYmFzZWQgKHBhdXNlL3Jlc3VtZSlcclxuICAgICAgICBmbGFzaC5fcGF1c2Uocy5pZCwgaW5zdGFuY2VPcHRpb25zLm11bHRpU2hvdCk7XHJcbiAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgcy5fc2V0dXBfaHRtbDUoKS5wbGF5KCk7XHJcbiAgICAgICAgc3RhcnRfaHRtbDVfdGltZXIoKTtcclxuICAgICAgfVxyXG5cclxuICAgICAgaWYgKCFvbnBsYXlfY2FsbGVkICYmIGluc3RhbmNlT3B0aW9ucy5vbnBsYXkpIHtcclxuICAgICAgICBpbnN0YW5jZU9wdGlvbnMub25wbGF5LmFwcGx5KHMpO1xyXG4gICAgICAgIG9ucGxheV9jYWxsZWQgPSB0cnVlO1xyXG4gICAgICB9IGVsc2UgaWYgKGluc3RhbmNlT3B0aW9ucy5vbnJlc3VtZSkge1xyXG4gICAgICAgIGluc3RhbmNlT3B0aW9ucy5vbnJlc3VtZS5hcHBseShzKTtcclxuICAgICAgfVxyXG5cclxuICAgICAgcmV0dXJuIHM7XHJcblxyXG4gICAgfTtcclxuXHJcbiAgICAvKipcclxuICAgICAqIFRvZ2dsZXMgc291bmQgcGxheWJhY2suXHJcbiAgICAgKlxyXG4gICAgICogQHJldHVybiB7U01Tb3VuZH0gVGhlIFNNU291bmQgb2JqZWN0XHJcbiAgICAgKi9cclxuXHJcbiAgICB0aGlzLnRvZ2dsZVBhdXNlID0gZnVuY3Rpb24oKSB7XHJcblxyXG4gICAgICBzbTIuX3dEKHMuaWQgKyAnOiB0b2dnbGVQYXVzZSgpJyk7XHJcblxyXG4gICAgICBpZiAocy5wbGF5U3RhdGUgPT09IDApIHtcclxuICAgICAgICBzLnBsYXkoe1xyXG4gICAgICAgICAgcG9zaXRpb246IChmViA9PT0gOSAmJiAhcy5pc0hUTUw1ID8gcy5wb3NpdGlvbiA6IHMucG9zaXRpb24gLyBtc2VjU2NhbGUpXHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgcmV0dXJuIHM7XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIGlmIChzLnBhdXNlZCkge1xyXG4gICAgICAgIHMucmVzdW1lKCk7XHJcbiAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgcy5wYXVzZSgpO1xyXG4gICAgICB9XHJcblxyXG4gICAgICByZXR1cm4gcztcclxuXHJcbiAgICB9O1xyXG5cclxuICAgIC8qKlxyXG4gICAgICogU2V0cyB0aGUgcGFubmluZyAoTC1SKSBlZmZlY3QuXHJcbiAgICAgKlxyXG4gICAgICogQHBhcmFtIHtudW1iZXJ9IG5QYW4gVGhlIHBhbiB2YWx1ZSAoLTEwMCB0byAxMDApXHJcbiAgICAgKiBAcmV0dXJuIHtTTVNvdW5kfSBUaGUgU01Tb3VuZCBvYmplY3RcclxuICAgICAqL1xyXG5cclxuICAgIHRoaXMuc2V0UGFuID0gZnVuY3Rpb24oblBhbiwgYkluc3RhbmNlT25seSkge1xyXG5cclxuICAgICAgaWYgKG5QYW4gPT09IF91bmRlZmluZWQpIHtcclxuICAgICAgICBuUGFuID0gMDtcclxuICAgICAgfVxyXG5cclxuICAgICAgaWYgKGJJbnN0YW5jZU9ubHkgPT09IF91bmRlZmluZWQpIHtcclxuICAgICAgICBiSW5zdGFuY2VPbmx5ID0gZmFsc2U7XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIGlmICghcy5pc0hUTUw1KSB7XHJcbiAgICAgICAgZmxhc2guX3NldFBhbihzLmlkLCBuUGFuKTtcclxuICAgICAgfSAvLyBlbHNlIHsgbm8gSFRNTDUgcGFuPyB9XHJcblxyXG4gICAgICBzLl9pTy5wYW4gPSBuUGFuO1xyXG5cclxuICAgICAgaWYgKCFiSW5zdGFuY2VPbmx5KSB7XHJcbiAgICAgICAgcy5wYW4gPSBuUGFuO1xyXG4gICAgICAgIHMub3B0aW9ucy5wYW4gPSBuUGFuO1xyXG4gICAgICB9XHJcblxyXG4gICAgICByZXR1cm4gcztcclxuXHJcbiAgICB9O1xyXG5cclxuICAgIC8qKlxyXG4gICAgICogU2V0cyB0aGUgdm9sdW1lLlxyXG4gICAgICpcclxuICAgICAqIEBwYXJhbSB7bnVtYmVyfSBuVm9sIFRoZSB2b2x1bWUgdmFsdWUgKDAgdG8gMTAwKVxyXG4gICAgICogQHJldHVybiB7U01Tb3VuZH0gVGhlIFNNU291bmQgb2JqZWN0XHJcbiAgICAgKi9cclxuXHJcbiAgICB0aGlzLnNldFZvbHVtZSA9IGZ1bmN0aW9uKG5Wb2wsIF9iSW5zdGFuY2VPbmx5KSB7XHJcblxyXG4gICAgICAvKipcclxuICAgICAgICogTm90ZTogU2V0dGluZyB2b2x1bWUgaGFzIG5vIGVmZmVjdCBvbiBpT1MgXCJzcGVjaWFsIHNub3dmbGFrZVwiIGRldmljZXMuXHJcbiAgICAgICAqIEhhcmR3YXJlIHZvbHVtZSBjb250cm9sIG92ZXJyaWRlcyBzb2Z0d2FyZSwgYW5kIHZvbHVtZVxyXG4gICAgICAgKiB3aWxsIGFsd2F5cyByZXR1cm4gMSBwZXIgQXBwbGUgZG9jcy4gKGlPUyA0ICsgNS4pXHJcbiAgICAgICAqIGh0dHA6Ly9kZXZlbG9wZXIuYXBwbGUuY29tL2xpYnJhcnkvc2FmYXJpL2RvY3VtZW50YXRpb24vQXVkaW9WaWRlby9Db25jZXB0dWFsL0hUTUwtY2FudmFzLWd1aWRlL0FkZGluZ1NvdW5kdG9DYW52YXNBbmltYXRpb25zL0FkZGluZ1NvdW5kdG9DYW52YXNBbmltYXRpb25zLmh0bWxcclxuICAgICAgICovXHJcblxyXG4gICAgICBpZiAoblZvbCA9PT0gX3VuZGVmaW5lZCkge1xyXG4gICAgICAgIG5Wb2wgPSAxMDA7XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIGlmIChfYkluc3RhbmNlT25seSA9PT0gX3VuZGVmaW5lZCkge1xyXG4gICAgICAgIF9iSW5zdGFuY2VPbmx5ID0gZmFsc2U7XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIGlmICghcy5pc0hUTUw1KSB7XHJcbiAgICAgICAgZmxhc2guX3NldFZvbHVtZShzLmlkLCAoc20yLm11dGVkICYmICFzLm11dGVkKSB8fCBzLm11dGVkPzA6blZvbCk7XHJcbiAgICAgIH0gZWxzZSBpZiAocy5fYSkge1xyXG4gICAgICAgIGlmIChzbTIubXV0ZWQgJiYgIXMubXV0ZWQpIHtcclxuICAgICAgICAgIHMubXV0ZWQgPSB0cnVlO1xyXG4gICAgICAgICAgcy5fYS5tdXRlZCA9IHRydWU7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIC8vIHZhbGlkIHJhbmdlOiAwLTFcclxuICAgICAgICBzLl9hLnZvbHVtZSA9IE1hdGgubWF4KDAsIE1hdGgubWluKDEsIG5Wb2wvMTAwKSk7XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIHMuX2lPLnZvbHVtZSA9IG5Wb2w7XHJcblxyXG4gICAgICBpZiAoIV9iSW5zdGFuY2VPbmx5KSB7XHJcbiAgICAgICAgcy52b2x1bWUgPSBuVm9sO1xyXG4gICAgICAgIHMub3B0aW9ucy52b2x1bWUgPSBuVm9sO1xyXG4gICAgICB9XHJcblxyXG4gICAgICByZXR1cm4gcztcclxuXHJcbiAgICB9O1xyXG5cclxuICAgIC8qKlxyXG4gICAgICogTXV0ZXMgdGhlIHNvdW5kLlxyXG4gICAgICpcclxuICAgICAqIEByZXR1cm4ge1NNU291bmR9IFRoZSBTTVNvdW5kIG9iamVjdFxyXG4gICAgICovXHJcblxyXG4gICAgdGhpcy5tdXRlID0gZnVuY3Rpb24oKSB7XHJcblxyXG4gICAgICBzLm11dGVkID0gdHJ1ZTtcclxuXHJcbiAgICAgIGlmICghcy5pc0hUTUw1KSB7XHJcbiAgICAgICAgZmxhc2guX3NldFZvbHVtZShzLmlkLCAwKTtcclxuICAgICAgfSBlbHNlIGlmIChzLl9hKSB7XHJcbiAgICAgICAgcy5fYS5tdXRlZCA9IHRydWU7XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIHJldHVybiBzO1xyXG5cclxuICAgIH07XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBVbm11dGVzIHRoZSBzb3VuZC5cclxuICAgICAqXHJcbiAgICAgKiBAcmV0dXJuIHtTTVNvdW5kfSBUaGUgU01Tb3VuZCBvYmplY3RcclxuICAgICAqL1xyXG5cclxuICAgIHRoaXMudW5tdXRlID0gZnVuY3Rpb24oKSB7XHJcblxyXG4gICAgICBzLm11dGVkID0gZmFsc2U7XHJcbiAgICAgIHZhciBoYXNJTyA9IChzLl9pTy52b2x1bWUgIT09IF91bmRlZmluZWQpO1xyXG5cclxuICAgICAgaWYgKCFzLmlzSFRNTDUpIHtcclxuICAgICAgICBmbGFzaC5fc2V0Vm9sdW1lKHMuaWQsIGhhc0lPP3MuX2lPLnZvbHVtZTpzLm9wdGlvbnMudm9sdW1lKTtcclxuICAgICAgfSBlbHNlIGlmIChzLl9hKSB7XHJcbiAgICAgICAgcy5fYS5tdXRlZCA9IGZhbHNlO1xyXG4gICAgICB9XHJcblxyXG4gICAgICByZXR1cm4gcztcclxuXHJcbiAgICB9O1xyXG5cclxuICAgIC8qKlxyXG4gICAgICogVG9nZ2xlcyB0aGUgbXV0ZWQgc3RhdGUgb2YgYSBzb3VuZC5cclxuICAgICAqXHJcbiAgICAgKiBAcmV0dXJuIHtTTVNvdW5kfSBUaGUgU01Tb3VuZCBvYmplY3RcclxuICAgICAqL1xyXG5cclxuICAgIHRoaXMudG9nZ2xlTXV0ZSA9IGZ1bmN0aW9uKCkge1xyXG5cclxuICAgICAgcmV0dXJuIChzLm11dGVkP3MudW5tdXRlKCk6cy5tdXRlKCkpO1xyXG5cclxuICAgIH07XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBSZWdpc3RlcnMgYSBjYWxsYmFjayB0byBiZSBmaXJlZCB3aGVuIGEgc291bmQgcmVhY2hlcyBhIGdpdmVuIHBvc2l0aW9uIGR1cmluZyBwbGF5YmFjay5cclxuICAgICAqXHJcbiAgICAgKiBAcGFyYW0ge251bWJlcn0gblBvc2l0aW9uIFRoZSBwb3NpdGlvbiB0byB3YXRjaCBmb3JcclxuICAgICAqIEBwYXJhbSB7ZnVuY3Rpb259IG9NZXRob2QgVGhlIHJlbGV2YW50IGNhbGxiYWNrIHRvIGZpcmVcclxuICAgICAqIEBwYXJhbSB7b2JqZWN0fSBvU2NvcGUgT3B0aW9uYWw6IFRoZSBzY29wZSB0byBhcHBseSB0aGUgY2FsbGJhY2sgdG9cclxuICAgICAqIEByZXR1cm4ge1NNU291bmR9IFRoZSBTTVNvdW5kIG9iamVjdFxyXG4gICAgICovXHJcblxyXG4gICAgdGhpcy5vblBvc2l0aW9uID0gZnVuY3Rpb24oblBvc2l0aW9uLCBvTWV0aG9kLCBvU2NvcGUpIHtcclxuXHJcbiAgICAgIC8vIFRPRE86IGJhc2ljIGR1cGUgY2hlY2tpbmc/XHJcblxyXG4gICAgICBvblBvc2l0aW9uSXRlbXMucHVzaCh7XHJcbiAgICAgICAgcG9zaXRpb246IHBhcnNlSW50KG5Qb3NpdGlvbiwgMTApLFxyXG4gICAgICAgIG1ldGhvZDogb01ldGhvZCxcclxuICAgICAgICBzY29wZTogKG9TY29wZSAhPT0gX3VuZGVmaW5lZCA/IG9TY29wZSA6IHMpLFxyXG4gICAgICAgIGZpcmVkOiBmYWxzZVxyXG4gICAgICB9KTtcclxuXHJcbiAgICAgIHJldHVybiBzO1xyXG5cclxuICAgIH07XHJcblxyXG4gICAgLy8gbGVnYWN5L2JhY2t3YXJkcy1jb21wYWJpbGl0eTogbG93ZXItY2FzZSBtZXRob2QgbmFtZVxyXG4gICAgdGhpcy5vbnBvc2l0aW9uID0gdGhpcy5vblBvc2l0aW9uO1xyXG5cclxuICAgIC8qKlxyXG4gICAgICogUmVtb3ZlcyByZWdpc3RlcmVkIGNhbGxiYWNrKHMpIGZyb20gYSBzb3VuZCwgYnkgcG9zaXRpb24gYW5kL29yIGNhbGxiYWNrLlxyXG4gICAgICpcclxuICAgICAqIEBwYXJhbSB7bnVtYmVyfSBuUG9zaXRpb24gVGhlIHBvc2l0aW9uIHRvIGNsZWFyIGNhbGxiYWNrKHMpIGZvclxyXG4gICAgICogQHBhcmFtIHtmdW5jdGlvbn0gb01ldGhvZCBPcHRpb25hbDogSWRlbnRpZnkgb25lIGNhbGxiYWNrIHRvIGJlIHJlbW92ZWQgd2hlbiBtdWx0aXBsZSBsaXN0ZW5lcnMgZXhpc3QgZm9yIG9uZSBwb3NpdGlvblxyXG4gICAgICogQHJldHVybiB7U01Tb3VuZH0gVGhlIFNNU291bmQgb2JqZWN0XHJcbiAgICAgKi9cclxuXHJcbiAgICB0aGlzLmNsZWFyT25Qb3NpdGlvbiA9IGZ1bmN0aW9uKG5Qb3NpdGlvbiwgb01ldGhvZCkge1xyXG5cclxuICAgICAgdmFyIGk7XHJcblxyXG4gICAgICBuUG9zaXRpb24gPSBwYXJzZUludChuUG9zaXRpb24sIDEwKTtcclxuXHJcbiAgICAgIGlmIChpc05hTihuUG9zaXRpb24pKSB7XHJcbiAgICAgICAgLy8gc2FmZXR5IGNoZWNrXHJcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgICB9XHJcblxyXG4gICAgICBmb3IgKGk9MDsgaSA8IG9uUG9zaXRpb25JdGVtcy5sZW5ndGg7IGkrKykge1xyXG5cclxuICAgICAgICBpZiAoblBvc2l0aW9uID09PSBvblBvc2l0aW9uSXRlbXNbaV0ucG9zaXRpb24pIHtcclxuICAgICAgICAgIC8vIHJlbW92ZSB0aGlzIGl0ZW0gaWYgbm8gbWV0aG9kIHdhcyBzcGVjaWZpZWQsIG9yLCBpZiB0aGUgbWV0aG9kIG1hdGNoZXNcclxuICAgICAgICAgIGlmICghb01ldGhvZCB8fCAob01ldGhvZCA9PT0gb25Qb3NpdGlvbkl0ZW1zW2ldLm1ldGhvZCkpIHtcclxuICAgICAgICAgICAgaWYgKG9uUG9zaXRpb25JdGVtc1tpXS5maXJlZCkge1xyXG4gICAgICAgICAgICAgIC8vIGRlY3JlbWVudCBcImZpcmVkXCIgY291bnRlciwgdG9vXHJcbiAgICAgICAgICAgICAgb25Qb3NpdGlvbkZpcmVkLS07XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgb25Qb3NpdGlvbkl0ZW1zLnNwbGljZShpLCAxKTtcclxuICAgICAgICAgIH1cclxuICAgICAgICB9XHJcblxyXG4gICAgICB9XHJcblxyXG4gICAgfTtcclxuXHJcbiAgICB0aGlzLl9wcm9jZXNzT25Qb3NpdGlvbiA9IGZ1bmN0aW9uKCkge1xyXG5cclxuICAgICAgdmFyIGksIGl0ZW0sIGogPSBvblBvc2l0aW9uSXRlbXMubGVuZ3RoO1xyXG5cdFx0XHJcbiAgICAgIGlmICghaiB8fCAhcy5wbGF5U3RhdGUgfHwgb25Qb3NpdGlvbkZpcmVkID49IGopIHtcclxuICAgICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIGZvciAoaT1qLTE7IGkgPj0gMDsgaS0tKSB7XHJcbiAgICAgICAgaXRlbSA9IG9uUG9zaXRpb25JdGVtc1tpXTtcclxuICAgICAgICBpZiAoIWl0ZW0uZmlyZWQgJiYgcy5wb3NpdGlvbiA+PSBpdGVtLnBvc2l0aW9uKSB7XHJcbiAgICAgICAgICBpdGVtLmZpcmVkID0gdHJ1ZTtcclxuICAgICAgICAgIG9uUG9zaXRpb25GaXJlZCsrO1xyXG4gICAgICAgICAgaXRlbS5tZXRob2QuYXBwbHkoaXRlbS5zY29wZSwgW2l0ZW0ucG9zaXRpb25dKTtcclxuXHRcdCAgaiA9IG9uUG9zaXRpb25JdGVtcy5sZW5ndGg7IC8vICByZXNldCBqIC0tIG9uUG9zaXRpb25JdGVtcy5sZW5ndGggY2FuIGJlIGNoYW5nZWQgaW4gdGhlIGl0ZW0gY2FsbGJhY2sgYWJvdmUuLi4gb2NjYXNpb25hbGx5IGJyZWFraW5nIHRoZSBsb29wLlxyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG5cdFxyXG4gICAgICByZXR1cm4gdHJ1ZTtcclxuXHJcbiAgICB9O1xyXG5cclxuICAgIHRoaXMuX3Jlc2V0T25Qb3NpdGlvbiA9IGZ1bmN0aW9uKG5Qb3NpdGlvbikge1xyXG5cclxuICAgICAgLy8gcmVzZXQgXCJmaXJlZFwiIGZvciBpdGVtcyBpbnRlcmVzdGVkIGluIHRoaXMgcG9zaXRpb25cclxuICAgICAgdmFyIGksIGl0ZW0sIGogPSBvblBvc2l0aW9uSXRlbXMubGVuZ3RoO1xyXG5cclxuICAgICAgaWYgKCFqKSB7XHJcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgICB9XHJcblxyXG4gICAgICBmb3IgKGk9ai0xOyBpID49IDA7IGktLSkge1xyXG4gICAgICAgIGl0ZW0gPSBvblBvc2l0aW9uSXRlbXNbaV07XHJcbiAgICAgICAgaWYgKGl0ZW0uZmlyZWQgJiYgblBvc2l0aW9uIDw9IGl0ZW0ucG9zaXRpb24pIHtcclxuICAgICAgICAgIGl0ZW0uZmlyZWQgPSBmYWxzZTtcclxuICAgICAgICAgIG9uUG9zaXRpb25GaXJlZC0tO1xyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG5cclxuICAgICAgcmV0dXJuIHRydWU7XHJcblxyXG4gICAgfTtcclxuXHJcbiAgICAvKipcclxuICAgICAqIFNNU291bmQoKSBwcml2YXRlIGludGVybmFsc1xyXG4gICAgICogLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cclxuICAgICAqL1xyXG5cclxuICAgIGFwcGx5RnJvbVRvID0gZnVuY3Rpb24oKSB7XHJcblxyXG4gICAgICB2YXIgaW5zdGFuY2VPcHRpb25zID0gcy5faU8sXHJcbiAgICAgICAgICBmID0gaW5zdGFuY2VPcHRpb25zLmZyb20sXHJcbiAgICAgICAgICB0ID0gaW5zdGFuY2VPcHRpb25zLnRvLFxyXG4gICAgICAgICAgc3RhcnQsIGVuZDtcclxuXHJcbiAgICAgIGVuZCA9IGZ1bmN0aW9uKCkge1xyXG5cclxuICAgICAgICAvLyBlbmQgaGFzIGJlZW4gcmVhY2hlZC5cclxuICAgICAgICBzbTIuX3dEKHMuaWQgKyAnOiBcIlRvXCIgdGltZSBvZiAnICsgdCArICcgcmVhY2hlZC4nKTtcclxuXHJcbiAgICAgICAgLy8gZGV0YWNoIGxpc3RlbmVyXHJcbiAgICAgICAgcy5jbGVhck9uUG9zaXRpb24odCwgZW5kKTtcclxuXHJcbiAgICAgICAgLy8gc3RvcCBzaG91bGQgY2xlYXIgdGhpcywgdG9vXHJcbiAgICAgICAgcy5zdG9wKCk7XHJcblxyXG4gICAgICB9O1xyXG5cclxuICAgICAgc3RhcnQgPSBmdW5jdGlvbigpIHtcclxuXHJcbiAgICAgICAgc20yLl93RChzLmlkICsgJzogUGxheWluZyBcImZyb21cIiAnICsgZik7XHJcblxyXG4gICAgICAgIC8vIGFkZCBsaXN0ZW5lciBmb3IgZW5kXHJcbiAgICAgICAgaWYgKHQgIT09IG51bGwgJiYgIWlzTmFOKHQpKSB7XHJcbiAgICAgICAgICBzLm9uUG9zaXRpb24odCwgZW5kKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICB9O1xyXG5cclxuICAgICAgaWYgKGYgIT09IG51bGwgJiYgIWlzTmFOKGYpKSB7XHJcblxyXG4gICAgICAgIC8vIGFwcGx5IHRvIGluc3RhbmNlIG9wdGlvbnMsIGd1YXJhbnRlZWluZyBjb3JyZWN0IHN0YXJ0IHBvc2l0aW9uLlxyXG4gICAgICAgIGluc3RhbmNlT3B0aW9ucy5wb3NpdGlvbiA9IGY7XHJcblxyXG4gICAgICAgIC8vIG11bHRpU2hvdCB0aW1pbmcgY2FuJ3QgYmUgdHJhY2tlZCwgc28gcHJldmVudCB0aGF0LlxyXG4gICAgICAgIGluc3RhbmNlT3B0aW9ucy5tdWx0aVNob3QgPSBmYWxzZTtcclxuXHJcbiAgICAgICAgc3RhcnQoKTtcclxuXHJcbiAgICAgIH1cclxuXHJcbiAgICAgIC8vIHJldHVybiB1cGRhdGVkIGluc3RhbmNlT3B0aW9ucyBpbmNsdWRpbmcgc3RhcnRpbmcgcG9zaXRpb25cclxuICAgICAgcmV0dXJuIGluc3RhbmNlT3B0aW9ucztcclxuXHJcbiAgICB9O1xyXG5cclxuICAgIGF0dGFjaE9uUG9zaXRpb24gPSBmdW5jdGlvbigpIHtcclxuXHJcbiAgICAgIHZhciBpdGVtLFxyXG4gICAgICAgICAgb3AgPSBzLl9pTy5vbnBvc2l0aW9uO1xyXG5cclxuICAgICAgLy8gYXR0YWNoIG9ucG9zaXRpb24gdGhpbmdzLCBpZiBhbnksIG5vdy5cclxuXHJcbiAgICAgIGlmIChvcCkge1xyXG5cclxuICAgICAgICBmb3IgKGl0ZW0gaW4gb3ApIHtcclxuICAgICAgICAgIGlmIChvcC5oYXNPd25Qcm9wZXJ0eShpdGVtKSkge1xyXG4gICAgICAgICAgICBzLm9uUG9zaXRpb24ocGFyc2VJbnQoaXRlbSwgMTApLCBvcFtpdGVtXSk7XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgfVxyXG5cclxuICAgIH07XHJcblxyXG4gICAgZGV0YWNoT25Qb3NpdGlvbiA9IGZ1bmN0aW9uKCkge1xyXG5cclxuICAgICAgdmFyIGl0ZW0sXHJcbiAgICAgICAgICBvcCA9IHMuX2lPLm9ucG9zaXRpb247XHJcblxyXG4gICAgICAvLyBkZXRhY2ggYW55IG9ucG9zaXRpb24oKS1zdHlsZSBsaXN0ZW5lcnMuXHJcblxyXG4gICAgICBpZiAob3ApIHtcclxuXHJcbiAgICAgICAgZm9yIChpdGVtIGluIG9wKSB7XHJcbiAgICAgICAgICBpZiAob3AuaGFzT3duUHJvcGVydHkoaXRlbSkpIHtcclxuICAgICAgICAgICAgcy5jbGVhck9uUG9zaXRpb24ocGFyc2VJbnQoaXRlbSwgMTApKTtcclxuICAgICAgICAgIH1cclxuICAgICAgICB9XHJcblxyXG4gICAgICB9XHJcblxyXG4gICAgfTtcclxuXHJcbiAgICBzdGFydF9odG1sNV90aW1lciA9IGZ1bmN0aW9uKCkge1xyXG5cclxuICAgICAgaWYgKHMuaXNIVE1MNSkge1xyXG4gICAgICAgIHN0YXJ0VGltZXIocyk7XHJcbiAgICAgIH1cclxuXHJcbiAgICB9O1xyXG5cclxuICAgIHN0b3BfaHRtbDVfdGltZXIgPSBmdW5jdGlvbigpIHtcclxuXHJcbiAgICAgIGlmIChzLmlzSFRNTDUpIHtcclxuICAgICAgICBzdG9wVGltZXIocyk7XHJcbiAgICAgIH1cclxuXHJcbiAgICB9O1xyXG5cclxuICAgIHJlc2V0UHJvcGVydGllcyA9IGZ1bmN0aW9uKHJldGFpblBvc2l0aW9uKSB7XHJcblxyXG4gICAgICBpZiAoIXJldGFpblBvc2l0aW9uKSB7XHJcbiAgICAgICAgb25Qb3NpdGlvbkl0ZW1zID0gW107XHJcbiAgICAgICAgb25Qb3NpdGlvbkZpcmVkID0gMDtcclxuICAgICAgfVxyXG5cclxuICAgICAgb25wbGF5X2NhbGxlZCA9IGZhbHNlO1xyXG5cclxuICAgICAgcy5faGFzVGltZXIgPSBudWxsO1xyXG4gICAgICBzLl9hID0gbnVsbDtcclxuICAgICAgcy5faHRtbDVfY2FucGxheSA9IGZhbHNlO1xyXG4gICAgICBzLmJ5dGVzTG9hZGVkID0gbnVsbDtcclxuICAgICAgcy5ieXRlc1RvdGFsID0gbnVsbDtcclxuICAgICAgcy5kdXJhdGlvbiA9IChzLl9pTyAmJiBzLl9pTy5kdXJhdGlvbiA/IHMuX2lPLmR1cmF0aW9uIDogbnVsbCk7XHJcbiAgICAgIHMuZHVyYXRpb25Fc3RpbWF0ZSA9IG51bGw7XHJcbiAgICAgIHMuYnVmZmVyZWQgPSBbXTtcclxuXHJcbiAgICAgIC8vIGxlZ2FjeTogMUQgYXJyYXlcclxuICAgICAgcy5lcURhdGEgPSBbXTtcclxuXHJcbiAgICAgIHMuZXFEYXRhLmxlZnQgPSBbXTtcclxuICAgICAgcy5lcURhdGEucmlnaHQgPSBbXTtcclxuXHJcbiAgICAgIHMuZmFpbHVyZXMgPSAwO1xyXG4gICAgICBzLmlzQnVmZmVyaW5nID0gZmFsc2U7XHJcbiAgICAgIHMuaW5zdGFuY2VPcHRpb25zID0ge307XHJcbiAgICAgIHMuaW5zdGFuY2VDb3VudCA9IDA7XHJcbiAgICAgIHMubG9hZGVkID0gZmFsc2U7XHJcbiAgICAgIHMubWV0YWRhdGEgPSB7fTtcclxuXHJcbiAgICAgIC8vIDAgPSB1bmluaXRpYWxpc2VkLCAxID0gbG9hZGluZywgMiA9IGZhaWxlZC9lcnJvciwgMyA9IGxvYWRlZC9zdWNjZXNzXHJcbiAgICAgIHMucmVhZHlTdGF0ZSA9IDA7XHJcblxyXG4gICAgICBzLm11dGVkID0gZmFsc2U7XHJcbiAgICAgIHMucGF1c2VkID0gZmFsc2U7XHJcblxyXG4gICAgICBzLnBlYWtEYXRhID0ge1xyXG4gICAgICAgIGxlZnQ6IDAsXHJcbiAgICAgICAgcmlnaHQ6IDBcclxuICAgICAgfTtcclxuXHJcbiAgICAgIHMud2F2ZWZvcm1EYXRhID0ge1xyXG4gICAgICAgIGxlZnQ6IFtdLFxyXG4gICAgICAgIHJpZ2h0OiBbXVxyXG4gICAgICB9O1xyXG5cclxuICAgICAgcy5wbGF5U3RhdGUgPSAwO1xyXG4gICAgICBzLnBvc2l0aW9uID0gbnVsbDtcclxuXHJcbiAgICAgIHMuaWQzID0ge307XHJcblxyXG4gICAgfTtcclxuXHJcbiAgICByZXNldFByb3BlcnRpZXMoKTtcclxuXHJcbiAgICAvKipcclxuICAgICAqIFBzZXVkby1wcml2YXRlIFNNU291bmQgaW50ZXJuYWxzXHJcbiAgICAgKiAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxyXG4gICAgICovXHJcblxyXG4gICAgdGhpcy5fb25UaW1lciA9IGZ1bmN0aW9uKGJGb3JjZSkge1xyXG5cclxuICAgICAgLyoqXHJcbiAgICAgICAqIEhUTUw1LW9ubHkgX3doaWxlcGxheWluZygpIGV0Yy5cclxuICAgICAgICogY2FsbGVkIGZyb20gYm90aCBIVE1MNSBuYXRpdmUgZXZlbnRzLCBhbmQgcG9sbGluZy9pbnRlcnZhbC1iYXNlZCB0aW1lcnNcclxuICAgICAgICogbWltaWNzIGZsYXNoIGFuZCBmaXJlcyBvbmx5IHdoZW4gdGltZS9kdXJhdGlvbiBjaGFuZ2UsIHNvIGFzIHRvIGJlIHBvbGxpbmctZnJpZW5kbHlcclxuICAgICAgICovXHJcblxyXG4gICAgICB2YXIgZHVyYXRpb24sIGlzTmV3ID0gZmFsc2UsIHRpbWUsIHggPSB7fTtcclxuXHJcbiAgICAgIGlmIChzLl9oYXNUaW1lciB8fCBiRm9yY2UpIHtcclxuXHJcbiAgICAgICAgLy8gVE9ETzogTWF5IG5vdCBuZWVkIHRvIHRyYWNrIHJlYWR5U3RhdGUgKDEgPSBsb2FkaW5nKVxyXG5cclxuICAgICAgICBpZiAocy5fYSAmJiAoYkZvcmNlIHx8ICgocy5wbGF5U3RhdGUgPiAwIHx8IHMucmVhZHlTdGF0ZSA9PT0gMSkgJiYgIXMucGF1c2VkKSkpIHtcclxuXHJcbiAgICAgICAgICBkdXJhdGlvbiA9IHMuX2dldF9odG1sNV9kdXJhdGlvbigpO1xyXG5cclxuICAgICAgICAgIGlmIChkdXJhdGlvbiAhPT0gbGFzdEhUTUw1U3RhdGUuZHVyYXRpb24pIHtcclxuXHJcbiAgICAgICAgICAgIGxhc3RIVE1MNVN0YXRlLmR1cmF0aW9uID0gZHVyYXRpb247XHJcbiAgICAgICAgICAgIHMuZHVyYXRpb24gPSBkdXJhdGlvbjtcclxuICAgICAgICAgICAgaXNOZXcgPSB0cnVlO1xyXG5cclxuICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAvLyBUT0RPOiBpbnZlc3RpZ2F0ZSB3aHkgdGhpcyBnb2VzIHdhY2sgaWYgbm90IHNldC9yZS1zZXQgZWFjaCB0aW1lLlxyXG4gICAgICAgICAgcy5kdXJhdGlvbkVzdGltYXRlID0gcy5kdXJhdGlvbjtcclxuXHJcbiAgICAgICAgICB0aW1lID0gKHMuX2EuY3VycmVudFRpbWUgKiBtc2VjU2NhbGUgfHwgMCk7XHJcblxyXG4gICAgICAgICAgaWYgKHRpbWUgIT09IGxhc3RIVE1MNVN0YXRlLnRpbWUpIHtcclxuXHJcbiAgICAgICAgICAgIGxhc3RIVE1MNVN0YXRlLnRpbWUgPSB0aW1lO1xyXG4gICAgICAgICAgICBpc05ldyA9IHRydWU7XHJcblxyXG4gICAgICAgICAgfVxyXG5cclxuICAgICAgICAgIGlmIChpc05ldyB8fCBiRm9yY2UpIHtcclxuXHJcbiAgICAgICAgICAgIHMuX3doaWxlcGxheWluZyh0aW1lLHgseCx4LHgpO1xyXG5cclxuICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgfS8qIGVsc2Uge1xyXG5cclxuICAgICAgICAgIC8vIHNtMi5fd0QoJ19vblRpbWVyOiBXYXJuIGZvciBcIicrcy5pZCsnXCI6ICcrKCFzLl9hPydDb3VsZCBub3QgZmluZCBlbGVtZW50LiAnOicnKSsocy5wbGF5U3RhdGUgPT09IDA/J3BsYXlTdGF0ZSBiYWQsIDA/JzoncGxheVN0YXRlID0gJytzLnBsYXlTdGF0ZSsnLCBPSycpKTtcclxuXHJcbiAgICAgICAgICByZXR1cm4gZmFsc2U7XHJcblxyXG4gICAgICAgIH0qL1xyXG5cclxuICAgICAgICByZXR1cm4gaXNOZXc7XHJcblxyXG4gICAgICB9XHJcblxyXG4gICAgfTtcclxuXHJcbiAgICB0aGlzLl9nZXRfaHRtbDVfZHVyYXRpb24gPSBmdW5jdGlvbigpIHtcclxuXHJcbiAgICAgIHZhciBpbnN0YW5jZU9wdGlvbnMgPSBzLl9pTyxcclxuICAgICAgICAgIC8vIGlmIGF1ZGlvIG9iamVjdCBleGlzdHMsIHVzZSBpdHMgZHVyYXRpb24gLSBlbHNlLCBpbnN0YW5jZSBvcHRpb24gZHVyYXRpb24gKGlmIHByb3ZpZGVkIC0gaXQncyBhIGhhY2ssIHJlYWxseSwgYW5kIHNob3VsZCBiZSByZXRpcmVkKSBPUiBudWxsXHJcbiAgICAgICAgICBkID0gKHMuX2EgJiYgcy5fYS5kdXJhdGlvbiA/IHMuX2EuZHVyYXRpb24qbXNlY1NjYWxlIDogKGluc3RhbmNlT3B0aW9ucyAmJiBpbnN0YW5jZU9wdGlvbnMuZHVyYXRpb24gPyBpbnN0YW5jZU9wdGlvbnMuZHVyYXRpb24gOiBudWxsKSksXHJcbiAgICAgICAgICByZXN1bHQgPSAoZCAmJiAhaXNOYU4oZCkgJiYgZCAhPT0gSW5maW5pdHkgPyBkIDogbnVsbCk7XHJcblxyXG4gICAgICByZXR1cm4gcmVzdWx0O1xyXG5cclxuICAgIH07XHJcblxyXG4gICAgdGhpcy5fYXBwbHlfbG9vcCA9IGZ1bmN0aW9uKGEsIG5Mb29wcykge1xyXG5cclxuICAgICAgLyoqXHJcbiAgICAgICAqIGJvb2xlYW4gaW5zdGVhZCBvZiBcImxvb3BcIiwgZm9yIHdlYmtpdD8gLSBzcGVjIHNheXMgc3RyaW5nLiBodHRwOi8vd3d3LnczLm9yZy9UUi9odG1sLW1hcmt1cC9hdWRpby5odG1sI2F1ZGlvLmF0dHJzLmxvb3BcclxuICAgICAgICogbm90ZSB0aGF0IGxvb3AgaXMgZWl0aGVyIG9mZiBvciBpbmZpbml0ZSB1bmRlciBIVE1MNSwgdW5saWtlIEZsYXNoIHdoaWNoIGFsbG93cyBhcmJpdHJhcnkgbG9vcCBjb3VudHMgdG8gYmUgc3BlY2lmaWVkLlxyXG4gICAgICAgKi9cclxuXHJcbiAgICAgIC8vIDxkPlxyXG4gICAgICBpZiAoIWEubG9vcCAmJiBuTG9vcHMgPiAxKSB7XHJcbiAgICAgICAgc20yLl93RCgnTm90ZTogTmF0aXZlIEhUTUw1IGxvb3BpbmcgaXMgaW5maW5pdGUuJywgMSk7XHJcbiAgICAgIH1cclxuICAgICAgLy8gPC9kPlxyXG5cclxuICAgICAgYS5sb29wID0gKG5Mb29wcyA+IDEgPyAnbG9vcCcgOiAnJyk7XHJcblxyXG4gICAgfTtcclxuXHJcbiAgICB0aGlzLl9zZXR1cF9odG1sNSA9IGZ1bmN0aW9uKG9PcHRpb25zKSB7XHJcblxyXG4gICAgICB2YXIgaW5zdGFuY2VPcHRpb25zID0gbWl4aW4ocy5faU8sIG9PcHRpb25zKSxcclxuICAgICAgICAgIGEgPSB1c2VHbG9iYWxIVE1MNUF1ZGlvID8gZ2xvYmFsSFRNTDVBdWRpbyA6IHMuX2EsXHJcbiAgICAgICAgICBkVVJMID0gZGVjb2RlVVJJKGluc3RhbmNlT3B0aW9ucy51cmwpLFxyXG4gICAgICAgICAgc2FtZVVSTDtcclxuXHJcbiAgICAgIC8qKlxyXG4gICAgICAgKiBcIkZpcnN0IHRoaW5ncyBmaXJzdCwgSSwgUG9wcGEuLi5cIiAocmVzZXQgdGhlIHByZXZpb3VzIHN0YXRlIG9mIHRoZSBvbGQgc291bmQsIGlmIHBsYXlpbmcpXHJcbiAgICAgICAqIEZpeGVzIGNhc2Ugd2l0aCBkZXZpY2VzIHRoYXQgY2FuIG9ubHkgcGxheSBvbmUgc291bmQgYXQgYSB0aW1lXHJcbiAgICAgICAqIE90aGVyd2lzZSwgb3RoZXIgc291bmRzIGluIG1pZC1wbGF5IHdpbGwgYmUgdGVybWluYXRlZCB3aXRob3V0IHdhcm5pbmcgYW5kIGluIGEgc3R1Y2sgc3RhdGVcclxuICAgICAgICovXHJcblxyXG4gICAgICBpZiAodXNlR2xvYmFsSFRNTDVBdWRpbykge1xyXG5cclxuICAgICAgICBpZiAoZFVSTCA9PT0gZGVjb2RlVVJJKGxhc3RHbG9iYWxIVE1MNVVSTCkpIHtcclxuICAgICAgICAgIC8vIGdsb2JhbCBIVE1MNSBhdWRpbzogcmUtdXNlIG9mIFVSTFxyXG4gICAgICAgICAgc2FtZVVSTCA9IHRydWU7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgfSBlbHNlIGlmIChkVVJMID09PSBkZWNvZGVVUkkobGFzdFVSTCkpIHtcclxuXHJcbiAgICAgICAgLy8gb3B0aW9ucyBVUkwgaXMgdGhlIHNhbWUgYXMgdGhlIFwibGFzdFwiIFVSTCwgYW5kIHdlIHVzZWQgKGxvYWRlZCkgaXRcclxuICAgICAgICBzYW1lVVJMID0gdHJ1ZTtcclxuXHJcbiAgICAgIH1cclxuXHJcbiAgICAgIGlmIChhKSB7XHJcblxyXG4gICAgICAgIGlmIChhLl9zKSB7XHJcblxyXG4gICAgICAgICAgaWYgKHVzZUdsb2JhbEhUTUw1QXVkaW8pIHtcclxuXHJcbiAgICAgICAgICAgIGlmIChhLl9zICYmIGEuX3MucGxheVN0YXRlICYmICFzYW1lVVJMKSB7XHJcblxyXG4gICAgICAgICAgICAgIC8vIGdsb2JhbCBIVE1MNSBhdWRpbyBjYXNlLCBhbmQgbG9hZGluZyBhIG5ldyBVUkwuIHN0b3AgdGhlIGN1cnJlbnRseS1wbGF5aW5nIG9uZS5cclxuICAgICAgICAgICAgICBhLl9zLnN0b3AoKTtcclxuXHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICB9IGVsc2UgaWYgKCF1c2VHbG9iYWxIVE1MNUF1ZGlvICYmIGRVUkwgPT09IGRlY29kZVVSSShsYXN0VVJMKSkge1xyXG5cclxuICAgICAgICAgICAgLy8gbm9uLWdsb2JhbCBIVE1MNSByZXVzZSBjYXNlOiBzYW1lIHVybCwgaWdub3JlIHJlcXVlc3RcclxuICAgICAgICAgICAgcy5fYXBwbHlfbG9vcChhLCBpbnN0YW5jZU9wdGlvbnMubG9vcHMpO1xyXG5cclxuICAgICAgICAgICAgcmV0dXJuIGE7XHJcblxyXG4gICAgICAgICAgfVxyXG5cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGlmICghc2FtZVVSTCkge1xyXG5cclxuICAgICAgICAgIC8vIGRvbid0IHJldGFpbiBvblBvc2l0aW9uKCkgc3R1ZmYgd2l0aCBuZXcgVVJMcy5cclxuXHJcbiAgICAgICAgICBpZiAobGFzdFVSTCkge1xyXG4gICAgICAgICAgICByZXNldFByb3BlcnRpZXMoZmFsc2UpO1xyXG4gICAgICAgICAgfVxyXG5cclxuICAgICAgICAgIC8vIGFzc2lnbiBuZXcgSFRNTDUgVVJMXHJcblxyXG4gICAgICAgICAgYS5zcmMgPSBpbnN0YW5jZU9wdGlvbnMudXJsO1xyXG5cclxuICAgICAgICAgIHMudXJsID0gaW5zdGFuY2VPcHRpb25zLnVybDtcclxuXHJcbiAgICAgICAgICBsYXN0VVJMID0gaW5zdGFuY2VPcHRpb25zLnVybDtcclxuXHJcbiAgICAgICAgICBsYXN0R2xvYmFsSFRNTDVVUkwgPSBpbnN0YW5jZU9wdGlvbnMudXJsO1xyXG5cclxuICAgICAgICAgIGEuX2NhbGxlZF9sb2FkID0gZmFsc2U7XHJcblxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgIH0gZWxzZSB7XHJcblxyXG4gICAgICAgIGlmIChpbnN0YW5jZU9wdGlvbnMuYXV0b0xvYWQgfHwgaW5zdGFuY2VPcHRpb25zLmF1dG9QbGF5KSB7XHJcblxyXG4gICAgICAgICAgcy5fYSA9IG5ldyBBdWRpbyhpbnN0YW5jZU9wdGlvbnMudXJsKTtcclxuICAgICAgICAgIHMuX2EubG9hZCgpO1xyXG5cclxuICAgICAgICB9IGVsc2Uge1xyXG5cclxuICAgICAgICAgIC8vIG51bGwgZm9yIHN0dXBpZCBPcGVyYSA5LjY0IGNhc2VcclxuICAgICAgICAgIHMuX2EgPSAoaXNPcGVyYSAmJiBvcGVyYS52ZXJzaW9uKCkgPCAxMCA/IG5ldyBBdWRpbyhudWxsKSA6IG5ldyBBdWRpbygpKTtcclxuXHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvLyBhc3NpZ24gbG9jYWwgcmVmZXJlbmNlXHJcbiAgICAgICAgYSA9IHMuX2E7XHJcblxyXG4gICAgICAgIGEuX2NhbGxlZF9sb2FkID0gZmFsc2U7XHJcblxyXG4gICAgICAgIGlmICh1c2VHbG9iYWxIVE1MNUF1ZGlvKSB7XHJcblxyXG4gICAgICAgICAgZ2xvYmFsSFRNTDVBdWRpbyA9IGE7XHJcblxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgIH1cclxuXHJcbiAgICAgIHMuaXNIVE1MNSA9IHRydWU7XHJcblxyXG4gICAgICAvLyBzdG9yZSBhIHJlZiBvbiB0aGUgdHJhY2tcclxuICAgICAgcy5fYSA9IGE7XHJcblxyXG4gICAgICAvLyBzdG9yZSBhIHJlZiBvbiB0aGUgYXVkaW9cclxuICAgICAgYS5fcyA9IHM7XHJcblxyXG4gICAgICBhZGRfaHRtbDVfZXZlbnRzKCk7XHJcblxyXG4gICAgICBzLl9hcHBseV9sb29wKGEsIGluc3RhbmNlT3B0aW9ucy5sb29wcyk7XHJcblxyXG4gICAgICBpZiAoaW5zdGFuY2VPcHRpb25zLmF1dG9Mb2FkIHx8IGluc3RhbmNlT3B0aW9ucy5hdXRvUGxheSkge1xyXG5cclxuICAgICAgICBzLmxvYWQoKTtcclxuXHJcbiAgICAgIH0gZWxzZSB7XHJcblxyXG4gICAgICAgIC8vIGVhcmx5IEhUTUw1IGltcGxlbWVudGF0aW9uIChub24tc3RhbmRhcmQpXHJcbiAgICAgICAgYS5hdXRvYnVmZmVyID0gZmFsc2U7XHJcblxyXG4gICAgICAgIC8vIHN0YW5kYXJkICgnbm9uZScgaXMgYWxzbyBhbiBvcHRpb24uKVxyXG4gICAgICAgIGEucHJlbG9hZCA9ICdhdXRvJztcclxuXHJcbiAgICAgIH1cclxuXHJcbiAgICAgIHJldHVybiBhO1xyXG5cclxuICAgIH07XHJcblxyXG4gICAgYWRkX2h0bWw1X2V2ZW50cyA9IGZ1bmN0aW9uKCkge1xyXG5cclxuICAgICAgaWYgKHMuX2EuX2FkZGVkX2V2ZW50cykge1xyXG4gICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgICAgfVxyXG5cclxuICAgICAgdmFyIGY7XHJcblxyXG4gICAgICBmdW5jdGlvbiBhZGQob0V2dCwgb0ZuLCBiQ2FwdHVyZSkge1xyXG4gICAgICAgIHJldHVybiBzLl9hID8gcy5fYS5hZGRFdmVudExpc3RlbmVyKG9FdnQsIG9GbiwgYkNhcHR1cmV8fGZhbHNlKSA6IG51bGw7XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIHMuX2EuX2FkZGVkX2V2ZW50cyA9IHRydWU7XHJcblxyXG4gICAgICBmb3IgKGYgaW4gaHRtbDVfZXZlbnRzKSB7XHJcbiAgICAgICAgaWYgKGh0bWw1X2V2ZW50cy5oYXNPd25Qcm9wZXJ0eShmKSkge1xyXG4gICAgICAgICAgYWRkKGYsIGh0bWw1X2V2ZW50c1tmXSk7XHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcblxyXG4gICAgICByZXR1cm4gdHJ1ZTtcclxuXHJcbiAgICB9O1xyXG5cclxuICAgIHJlbW92ZV9odG1sNV9ldmVudHMgPSBmdW5jdGlvbigpIHtcclxuXHJcbiAgICAgIC8vIFJlbW92ZSBldmVudCBsaXN0ZW5lcnNcclxuXHJcbiAgICAgIHZhciBmO1xyXG5cclxuICAgICAgZnVuY3Rpb24gcmVtb3ZlKG9FdnQsIG9GbiwgYkNhcHR1cmUpIHtcclxuICAgICAgICByZXR1cm4gKHMuX2EgPyBzLl9hLnJlbW92ZUV2ZW50TGlzdGVuZXIob0V2dCwgb0ZuLCBiQ2FwdHVyZXx8ZmFsc2UpIDogbnVsbCk7XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIHNtMi5fd0Qocy5pZCArICc6IFJlbW92aW5nIGV2ZW50IGxpc3RlbmVycycpO1xyXG4gICAgICBzLl9hLl9hZGRlZF9ldmVudHMgPSBmYWxzZTtcclxuXHJcbiAgICAgIGZvciAoZiBpbiBodG1sNV9ldmVudHMpIHtcclxuICAgICAgICBpZiAoaHRtbDVfZXZlbnRzLmhhc093blByb3BlcnR5KGYpKSB7XHJcbiAgICAgICAgICByZW1vdmUoZiwgaHRtbDVfZXZlbnRzW2ZdKTtcclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuXHJcbiAgICB9O1xyXG5cclxuICAgIC8qKlxyXG4gICAgICogUHNldWRvLXByaXZhdGUgZXZlbnQgaW50ZXJuYWxzXHJcbiAgICAgKiAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cclxuICAgICAqL1xyXG5cclxuICAgIHRoaXMuX29ubG9hZCA9IGZ1bmN0aW9uKG5TdWNjZXNzKSB7XHJcblxyXG4gICAgICB2YXIgZk4sXHJcbiAgICAgICAgICAvLyBjaGVjayBmb3IgZHVyYXRpb24gdG8gcHJldmVudCBmYWxzZSBwb3NpdGl2ZXMgZnJvbSBmbGFzaCA4IHdoZW4gbG9hZGluZyBmcm9tIGNhY2hlLlxyXG4gICAgICAgICAgbG9hZE9LID0gISFuU3VjY2VzcyB8fCAoIXMuaXNIVE1MNSAmJiBmViA9PT0gOCAmJiBzLmR1cmF0aW9uKTtcclxuXHJcbiAgICAgIC8vIDxkPlxyXG4gICAgICBmTiA9IHMuaWQgKyAnOiAnO1xyXG4gICAgICBzbTIuX3dEKGZOICsgKGxvYWRPSyA/ICdvbmxvYWQoKScgOiAnRmFpbGVkIHRvIGxvYWQgLyBpbnZhbGlkIHNvdW5kPycgKyAoIXMuZHVyYXRpb24gPyAnIFplcm8tbGVuZ3RoIGR1cmF0aW9uIHJlcG9ydGVkLicgOiAnIC0nKSArICcgKCcgKyBzLnVybCArICcpJyksIChsb2FkT0sgPyAxIDogMikpO1xyXG4gICAgICBpZiAoIWxvYWRPSyAmJiAhcy5pc0hUTUw1KSB7XHJcbiAgICAgICAgaWYgKHNtMi5zYW5kYm94Lm5vUmVtb3RlID09PSB0cnVlKSB7XHJcbiAgICAgICAgICBzbTIuX3dEKGZOICsgc3RyKCdub05ldCcpLCAxKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKHNtMi5zYW5kYm94Lm5vTG9jYWwgPT09IHRydWUpIHtcclxuICAgICAgICAgIHNtMi5fd0QoZk4gKyBzdHIoJ25vTG9jYWwnKSwgMSk7XHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcbiAgICAgIC8vIDwvZD5cclxuXHJcbiAgICAgIHMubG9hZGVkID0gbG9hZE9LO1xyXG4gICAgICBzLnJlYWR5U3RhdGUgPSBsb2FkT0s/MzoyO1xyXG4gICAgICBzLl9vbmJ1ZmZlcmNoYW5nZSgwKTtcclxuXHJcbiAgICAgIGlmIChzLl9pTy5vbmxvYWQpIHtcclxuICAgICAgICB3cmFwQ2FsbGJhY2socywgZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICBzLl9pTy5vbmxvYWQuYXBwbHkocywgW2xvYWRPS10pO1xyXG4gICAgICAgIH0pO1xyXG4gICAgICB9XHJcblxyXG4gICAgICByZXR1cm4gdHJ1ZTtcclxuXHJcbiAgICB9O1xyXG5cclxuICAgIHRoaXMuX29uYnVmZmVyY2hhbmdlID0gZnVuY3Rpb24obklzQnVmZmVyaW5nKSB7XHJcblxyXG4gICAgICBpZiAocy5wbGF5U3RhdGUgPT09IDApIHtcclxuICAgICAgICAvLyBpZ25vcmUgaWYgbm90IHBsYXlpbmdcclxuICAgICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIGlmICgobklzQnVmZmVyaW5nICYmIHMuaXNCdWZmZXJpbmcpIHx8ICghbklzQnVmZmVyaW5nICYmICFzLmlzQnVmZmVyaW5nKSkge1xyXG4gICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgICAgfVxyXG5cclxuICAgICAgcy5pc0J1ZmZlcmluZyA9IChuSXNCdWZmZXJpbmcgPT09IDEpO1xyXG4gICAgICBpZiAocy5faU8ub25idWZmZXJjaGFuZ2UpIHtcclxuICAgICAgICBzbTIuX3dEKHMuaWQgKyAnOiBCdWZmZXIgc3RhdGUgY2hhbmdlOiAnICsgbklzQnVmZmVyaW5nKTtcclxuICAgICAgICBzLl9pTy5vbmJ1ZmZlcmNoYW5nZS5hcHBseShzLCBbbklzQnVmZmVyaW5nXSk7XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIHJldHVybiB0cnVlO1xyXG5cclxuICAgIH07XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBQbGF5YmFjayBtYXkgaGF2ZSBzdG9wcGVkIGR1ZSB0byBidWZmZXJpbmcsIG9yIHJlbGF0ZWQgcmVhc29uLlxyXG4gICAgICogVGhpcyBzdGF0ZSBjYW4gYmUgZW5jb3VudGVyZWQgb24gaU9TIDwgNiB3aGVuIGF1dG8tcGxheSBpcyBibG9ja2VkLlxyXG4gICAgICovXHJcblxyXG4gICAgdGhpcy5fb25zdXNwZW5kID0gZnVuY3Rpb24oKSB7XHJcblxyXG4gICAgICBpZiAocy5faU8ub25zdXNwZW5kKSB7XHJcbiAgICAgICAgc20yLl93RChzLmlkICsgJzogUGxheWJhY2sgc3VzcGVuZGVkJyk7XHJcbiAgICAgICAgcy5faU8ub25zdXNwZW5kLmFwcGx5KHMpO1xyXG4gICAgICB9XHJcblxyXG4gICAgICByZXR1cm4gdHJ1ZTtcclxuXHJcbiAgICB9O1xyXG5cclxuICAgIC8qKlxyXG4gICAgICogZmxhc2ggOS9tb3ZpZVN0YXIgKyBSVE1QLW9ubHkgbWV0aG9kLCBzaG91bGQgZmlyZSBvbmx5IG9uY2UgYXQgbW9zdFxyXG4gICAgICogYXQgdGhpcyBwb2ludCB3ZSBqdXN0IHJlY3JlYXRlIGZhaWxlZCBzb3VuZHMgcmF0aGVyIHRoYW4gdHJ5aW5nIHRvIHJlY29ubmVjdFxyXG4gICAgICovXHJcblxyXG4gICAgdGhpcy5fb25mYWlsdXJlID0gZnVuY3Rpb24obXNnLCBsZXZlbCwgY29kZSkge1xyXG5cclxuICAgICAgcy5mYWlsdXJlcysrO1xyXG4gICAgICBzbTIuX3dEKHMuaWQgKyAnOiBGYWlsdXJlICgnICsgcy5mYWlsdXJlcyArICcpOiAnICsgbXNnKTtcclxuXHJcbiAgICAgIGlmIChzLl9pTy5vbmZhaWx1cmUgJiYgcy5mYWlsdXJlcyA9PT0gMSkge1xyXG4gICAgICAgIHMuX2lPLm9uZmFpbHVyZShtc2csIGxldmVsLCBjb2RlKTtcclxuICAgICAgfSBlbHNlIHtcclxuICAgICAgICBzbTIuX3dEKHMuaWQgKyAnOiBJZ25vcmluZyBmYWlsdXJlJyk7XHJcbiAgICAgIH1cclxuXHJcbiAgICB9O1xyXG5cclxuICAgIC8qKlxyXG4gICAgICogZmxhc2ggOS9tb3ZpZVN0YXIgKyBSVE1QLW9ubHkgbWV0aG9kIGZvciB1bmhhbmRsZWQgd2FybmluZ3MvZXhjZXB0aW9ucyBmcm9tIEZsYXNoXHJcbiAgICAgKiBlLmcuLCBSVE1QIFwibWV0aG9kIG1pc3NpbmdcIiB3YXJuaW5nIChub24tZmF0YWwpIGZvciBnZXRTdHJlYW1MZW5ndGggb24gc2VydmVyXHJcbiAgICAgKi9cclxuXHJcbiAgICB0aGlzLl9vbndhcm5pbmcgPSBmdW5jdGlvbihtc2csIGxldmVsLCBjb2RlKSB7XHJcblxyXG4gICAgICBpZiAocy5faU8ub253YXJuaW5nKSB7XHJcbiAgICAgICAgcy5faU8ub253YXJuaW5nKG1zZywgbGV2ZWwsIGNvZGUpO1xyXG4gICAgICB9XHJcblxyXG4gICAgfTtcclxuXHJcbiAgICB0aGlzLl9vbmZpbmlzaCA9IGZ1bmN0aW9uKCkge1xyXG5cclxuICAgICAgLy8gc3RvcmUgbG9jYWwgY29weSBiZWZvcmUgaXQgZ2V0cyB0cmFzaGVkLi4uXHJcbiAgICAgIHZhciBpb19vbmZpbmlzaCA9IHMuX2lPLm9uZmluaXNoO1xyXG5cclxuICAgICAgcy5fb25idWZmZXJjaGFuZ2UoMCk7XHJcbiAgICAgIHMuX3Jlc2V0T25Qb3NpdGlvbigwKTtcclxuXHJcbiAgICAgIC8vIHJlc2V0IHNvbWUgc3RhdGUgaXRlbXNcclxuICAgICAgaWYgKHMuaW5zdGFuY2VDb3VudCkge1xyXG5cclxuICAgICAgICBzLmluc3RhbmNlQ291bnQtLTtcclxuXHJcbiAgICAgICAgaWYgKCFzLmluc3RhbmNlQ291bnQpIHtcclxuXHJcbiAgICAgICAgICAvLyByZW1vdmUgb25Qb3NpdGlvbiBsaXN0ZW5lcnMsIGlmIGFueVxyXG4gICAgICAgICAgZGV0YWNoT25Qb3NpdGlvbigpO1xyXG5cclxuICAgICAgICAgIC8vIHJlc2V0IGluc3RhbmNlIG9wdGlvbnNcclxuICAgICAgICAgIHMucGxheVN0YXRlID0gMDtcclxuICAgICAgICAgIHMucGF1c2VkID0gZmFsc2U7XHJcbiAgICAgICAgICBzLmluc3RhbmNlQ291bnQgPSAwO1xyXG4gICAgICAgICAgcy5pbnN0YW5jZU9wdGlvbnMgPSB7fTtcclxuICAgICAgICAgIHMuX2lPID0ge307XHJcbiAgICAgICAgICBzdG9wX2h0bWw1X3RpbWVyKCk7XHJcblxyXG4gICAgICAgICAgLy8gcmVzZXQgcG9zaXRpb24sIHRvb1xyXG4gICAgICAgICAgaWYgKHMuaXNIVE1MNSkge1xyXG4gICAgICAgICAgICBzLnBvc2l0aW9uID0gMDtcclxuICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBpZiAoIXMuaW5zdGFuY2VDb3VudCB8fCBzLl9pTy5tdWx0aVNob3RFdmVudHMpIHtcclxuICAgICAgICAgIC8vIGZpcmUgb25maW5pc2ggZm9yIGxhc3QsIG9yIGV2ZXJ5IGluc3RhbmNlXHJcbiAgICAgICAgICBpZiAoaW9fb25maW5pc2gpIHtcclxuICAgICAgICAgICAgc20yLl93RChzLmlkICsgJzogb25maW5pc2goKScpO1xyXG4gICAgICAgICAgICB3cmFwQ2FsbGJhY2socywgZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgICAgaW9fb25maW5pc2guYXBwbHkocyk7XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgIH1cclxuXHJcbiAgICB9O1xyXG5cclxuICAgIHRoaXMuX3doaWxlbG9hZGluZyA9IGZ1bmN0aW9uKG5CeXRlc0xvYWRlZCwgbkJ5dGVzVG90YWwsIG5EdXJhdGlvbiwgbkJ1ZmZlckxlbmd0aCkge1xyXG5cclxuICAgICAgdmFyIGluc3RhbmNlT3B0aW9ucyA9IHMuX2lPO1xyXG5cclxuICAgICAgcy5ieXRlc0xvYWRlZCA9IG5CeXRlc0xvYWRlZDtcclxuICAgICAgcy5ieXRlc1RvdGFsID0gbkJ5dGVzVG90YWw7XHJcbiAgICAgIHMuZHVyYXRpb24gPSBNYXRoLmZsb29yKG5EdXJhdGlvbik7XHJcbiAgICAgIHMuYnVmZmVyTGVuZ3RoID0gbkJ1ZmZlckxlbmd0aDtcclxuXHJcbiAgICAgIGlmICghcy5pc0hUTUw1ICYmICFpbnN0YW5jZU9wdGlvbnMuaXNNb3ZpZVN0YXIpIHtcclxuXHJcbiAgICAgICAgaWYgKGluc3RhbmNlT3B0aW9ucy5kdXJhdGlvbikge1xyXG4gICAgICAgICAgLy8gdXNlIGR1cmF0aW9uIGZyb20gb3B0aW9ucywgaWYgc3BlY2lmaWVkIGFuZCBsYXJnZXIuIG5vYm9keSBzaG91bGQgYmUgc3BlY2lmeWluZyBkdXJhdGlvbiBpbiBvcHRpb25zLCBhY3R1YWxseSwgYW5kIGl0IHNob3VsZCBiZSByZXRpcmVkLlxyXG4gICAgICAgICAgcy5kdXJhdGlvbkVzdGltYXRlID0gKHMuZHVyYXRpb24gPiBpbnN0YW5jZU9wdGlvbnMuZHVyYXRpb24pID8gcy5kdXJhdGlvbiA6IGluc3RhbmNlT3B0aW9ucy5kdXJhdGlvbjtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgcy5kdXJhdGlvbkVzdGltYXRlID0gcGFyc2VJbnQoKHMuYnl0ZXNUb3RhbCAvIHMuYnl0ZXNMb2FkZWQpICogcy5kdXJhdGlvbiwgMTApO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgIH0gZWxzZSB7XHJcblxyXG4gICAgICAgIHMuZHVyYXRpb25Fc3RpbWF0ZSA9IHMuZHVyYXRpb247XHJcblxyXG4gICAgICB9XHJcblxyXG4gICAgICAvLyBmb3IgZmxhc2gsIHJlZmxlY3Qgc2VxdWVudGlhbC1sb2FkLXN0eWxlIGJ1ZmZlcmluZ1xyXG4gICAgICBpZiAoIXMuaXNIVE1MNSkge1xyXG4gICAgICAgIHMuYnVmZmVyZWQgPSBbe1xyXG4gICAgICAgICAgJ3N0YXJ0JzogMCxcclxuICAgICAgICAgICdlbmQnOiBzLmR1cmF0aW9uXHJcbiAgICAgICAgfV07XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIC8vIGFsbG93IHdoaWxlbG9hZGluZyB0byBmaXJlIGV2ZW4gaWYgXCJsb2FkXCIgZmlyZWQgdW5kZXIgSFRNTDUsIGR1ZSB0byBIVFRQIHJhbmdlL3BhcnRpYWxzXHJcbiAgICAgIGlmICgocy5yZWFkeVN0YXRlICE9PSAzIHx8IHMuaXNIVE1MNSkgJiYgaW5zdGFuY2VPcHRpb25zLndoaWxlbG9hZGluZykge1xyXG4gICAgICAgIGluc3RhbmNlT3B0aW9ucy53aGlsZWxvYWRpbmcuYXBwbHkocyk7XHJcbiAgICAgIH1cclxuXHJcbiAgICB9O1xyXG5cclxuICAgIHRoaXMuX3doaWxlcGxheWluZyA9IGZ1bmN0aW9uKG5Qb3NpdGlvbiwgb1BlYWtEYXRhLCBvV2F2ZWZvcm1EYXRhTGVmdCwgb1dhdmVmb3JtRGF0YVJpZ2h0LCBvRVFEYXRhKSB7XHJcblxyXG4gICAgICB2YXIgaW5zdGFuY2VPcHRpb25zID0gcy5faU8sXHJcbiAgICAgICAgICBlcUxlZnQ7XHJcblxyXG4gICAgICBpZiAoaXNOYU4oblBvc2l0aW9uKSB8fCBuUG9zaXRpb24gPT09IG51bGwpIHtcclxuICAgICAgICAvLyBmbGFzaCBzYWZldHkgbmV0XHJcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgICB9XHJcblxyXG4gICAgICAvLyBTYWZhcmkgSFRNTDUgcGxheSgpIG1heSByZXR1cm4gc21hbGwgLXZlIHZhbHVlcyB3aGVuIHN0YXJ0aW5nIGZyb20gcG9zaXRpb246IDAsIGVnLiAtNTAuMTIwMzk2ODc1LiBVbmV4cGVjdGVkL2ludmFsaWQgcGVyIFczLCBJIHRoaW5rLiBOb3JtYWxpemUgdG8gMC5cclxuICAgICAgcy5wb3NpdGlvbiA9IE1hdGgubWF4KDAsIG5Qb3NpdGlvbik7XHJcblxyXG4gICAgICBzLl9wcm9jZXNzT25Qb3NpdGlvbigpO1xyXG5cclxuICAgICAgaWYgKCFzLmlzSFRNTDUgJiYgZlYgPiA4KSB7XHJcblxyXG4gICAgICAgIGlmIChpbnN0YW5jZU9wdGlvbnMudXNlUGVha0RhdGEgJiYgb1BlYWtEYXRhICE9PSBfdW5kZWZpbmVkICYmIG9QZWFrRGF0YSkge1xyXG4gICAgICAgICAgcy5wZWFrRGF0YSA9IHtcclxuICAgICAgICAgICAgbGVmdDogb1BlYWtEYXRhLmxlZnRQZWFrLFxyXG4gICAgICAgICAgICByaWdodDogb1BlYWtEYXRhLnJpZ2h0UGVha1xyXG4gICAgICAgICAgfTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGlmIChpbnN0YW5jZU9wdGlvbnMudXNlV2F2ZWZvcm1EYXRhICYmIG9XYXZlZm9ybURhdGFMZWZ0ICE9PSBfdW5kZWZpbmVkICYmIG9XYXZlZm9ybURhdGFMZWZ0KSB7XHJcbiAgICAgICAgICBzLndhdmVmb3JtRGF0YSA9IHtcclxuICAgICAgICAgICAgbGVmdDogb1dhdmVmb3JtRGF0YUxlZnQuc3BsaXQoJywnKSxcclxuICAgICAgICAgICAgcmlnaHQ6IG9XYXZlZm9ybURhdGFSaWdodC5zcGxpdCgnLCcpXHJcbiAgICAgICAgICB9O1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgaWYgKGluc3RhbmNlT3B0aW9ucy51c2VFUURhdGEpIHtcclxuICAgICAgICAgIGlmIChvRVFEYXRhICE9PSBfdW5kZWZpbmVkICYmIG9FUURhdGEgJiYgb0VRRGF0YS5sZWZ0RVEpIHtcclxuICAgICAgICAgICAgZXFMZWZ0ID0gb0VRRGF0YS5sZWZ0RVEuc3BsaXQoJywnKTtcclxuICAgICAgICAgICAgcy5lcURhdGEgPSBlcUxlZnQ7XHJcbiAgICAgICAgICAgIHMuZXFEYXRhLmxlZnQgPSBlcUxlZnQ7XHJcbiAgICAgICAgICAgIGlmIChvRVFEYXRhLnJpZ2h0RVEgIT09IF91bmRlZmluZWQgJiYgb0VRRGF0YS5yaWdodEVRKSB7XHJcbiAgICAgICAgICAgICAgcy5lcURhdGEucmlnaHQgPSBvRVFEYXRhLnJpZ2h0RVEuc3BsaXQoJywnKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgIH1cclxuXHJcbiAgICAgIGlmIChzLnBsYXlTdGF0ZSA9PT0gMSkge1xyXG5cclxuICAgICAgICAvLyBzcGVjaWFsIGNhc2UvaGFjazogZW5zdXJlIGJ1ZmZlcmluZyBpcyBmYWxzZSBpZiBsb2FkaW5nIGZyb20gY2FjaGUgKGFuZCBub3QgeWV0IHN0YXJ0ZWQpXHJcbiAgICAgICAgaWYgKCFzLmlzSFRNTDUgJiYgZlYgPT09IDggJiYgIXMucG9zaXRpb24gJiYgcy5pc0J1ZmZlcmluZykge1xyXG4gICAgICAgICAgcy5fb25idWZmZXJjaGFuZ2UoMCk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBpZiAoaW5zdGFuY2VPcHRpb25zLndoaWxlcGxheWluZykge1xyXG4gICAgICAgICAgLy8gZmxhc2ggbWF5IGNhbGwgYWZ0ZXIgYWN0dWFsIGZpbmlzaFxyXG4gICAgICAgICAgaW5zdGFuY2VPcHRpb25zLndoaWxlcGxheWluZy5hcHBseShzKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICB9XHJcblxyXG4gICAgICByZXR1cm4gdHJ1ZTtcclxuXHJcbiAgICB9O1xyXG5cclxuICAgIHRoaXMuX29uY2FwdGlvbmRhdGEgPSBmdW5jdGlvbihvRGF0YSkge1xyXG5cclxuICAgICAgLyoqXHJcbiAgICAgICAqIGludGVybmFsOiBmbGFzaCA5ICsgTmV0U3RyZWFtIChNb3ZpZVN0YXIvUlRNUC1vbmx5KSBmZWF0dXJlXHJcbiAgICAgICAqXHJcbiAgICAgICAqIEBwYXJhbSB7b2JqZWN0fSBvRGF0YVxyXG4gICAgICAgKi9cclxuXHJcbiAgICAgIHNtMi5fd0Qocy5pZCArICc6IENhcHRpb24gZGF0YSByZWNlaXZlZC4nKTtcclxuXHJcbiAgICAgIHMuY2FwdGlvbmRhdGEgPSBvRGF0YTtcclxuXHJcbiAgICAgIGlmIChzLl9pTy5vbmNhcHRpb25kYXRhKSB7XHJcbiAgICAgICAgcy5faU8ub25jYXB0aW9uZGF0YS5hcHBseShzLCBbb0RhdGFdKTtcclxuICAgICAgfVxyXG5cclxuICAgIH07XHJcblxyXG4gICAgdGhpcy5fb25tZXRhZGF0YSA9IGZ1bmN0aW9uKG9NRFByb3BzLCBvTUREYXRhKSB7XHJcblxyXG4gICAgICAvKipcclxuICAgICAgICogaW50ZXJuYWw6IGZsYXNoIDkgKyBOZXRTdHJlYW0gKE1vdmllU3Rhci9SVE1QLW9ubHkpIGZlYXR1cmVcclxuICAgICAgICogUlRNUCBtYXkgaW5jbHVkZSBzb25nIHRpdGxlLCBNb3ZpZVN0YXIgY29udGVudCBtYXkgaW5jbHVkZSBlbmNvZGluZyBpbmZvXHJcbiAgICAgICAqXHJcbiAgICAgICAqIEBwYXJhbSB7YXJyYXl9IG9NRFByb3BzIChuYW1lcylcclxuICAgICAgICogQHBhcmFtIHthcnJheX0gb01ERGF0YSAodmFsdWVzKVxyXG4gICAgICAgKi9cclxuXHJcbiAgICAgIHNtMi5fd0Qocy5pZCArICc6IE1ldGFkYXRhIHJlY2VpdmVkLicpO1xyXG5cclxuICAgICAgdmFyIG9EYXRhID0ge30sIGksIGo7XHJcblxyXG4gICAgICBmb3IgKGkgPSAwLCBqID0gb01EUHJvcHMubGVuZ3RoOyBpIDwgajsgaSsrKSB7XHJcbiAgICAgICAgb0RhdGFbb01EUHJvcHNbaV1dID0gb01ERGF0YVtpXTtcclxuICAgICAgfVxyXG4gICAgICBzLm1ldGFkYXRhID0gb0RhdGE7XHJcblxyXG5jb25zb2xlLmxvZygndXBkYXRlZCBtZXRhZGF0YScsIHMubWV0YWRhdGEpO1xyXG5cclxuICAgICAgaWYgKHMuX2lPLm9ubWV0YWRhdGEpIHtcclxuICAgICAgICBzLl9pTy5vbm1ldGFkYXRhLmNhbGwocywgcy5tZXRhZGF0YSk7XHJcbiAgICAgIH1cclxuXHJcbiAgICB9O1xyXG5cclxuICAgIHRoaXMuX29uaWQzID0gZnVuY3Rpb24ob0lEM1Byb3BzLCBvSUQzRGF0YSkge1xyXG5cclxuICAgICAgLyoqXHJcbiAgICAgICAqIGludGVybmFsOiBmbGFzaCA4ICsgZmxhc2ggOSBJRDMgZmVhdHVyZVxyXG4gICAgICAgKiBtYXkgaW5jbHVkZSBhcnRpc3QsIHNvbmcgdGl0bGUgZXRjLlxyXG4gICAgICAgKlxyXG4gICAgICAgKiBAcGFyYW0ge2FycmF5fSBvSUQzUHJvcHMgKG5hbWVzKVxyXG4gICAgICAgKiBAcGFyYW0ge2FycmF5fSBvSUQzRGF0YSAodmFsdWVzKVxyXG4gICAgICAgKi9cclxuXHJcbiAgICAgIHNtMi5fd0Qocy5pZCArICc6IElEMyBkYXRhIHJlY2VpdmVkLicpO1xyXG5cclxuICAgICAgdmFyIG9EYXRhID0gW10sIGksIGo7XHJcblxyXG4gICAgICBmb3IgKGkgPSAwLCBqID0gb0lEM1Byb3BzLmxlbmd0aDsgaSA8IGo7IGkrKykge1xyXG4gICAgICAgIG9EYXRhW29JRDNQcm9wc1tpXV0gPSBvSUQzRGF0YVtpXTtcclxuICAgICAgfVxyXG4gICAgICBzLmlkMyA9IG1peGluKHMuaWQzLCBvRGF0YSk7XHJcblxyXG4gICAgICBpZiAocy5faU8ub25pZDMpIHtcclxuICAgICAgICBzLl9pTy5vbmlkMy5hcHBseShzKTtcclxuICAgICAgfVxyXG5cclxuICAgIH07XHJcblxyXG4gICAgLy8gZmxhc2gvUlRNUC1vbmx5XHJcblxyXG4gICAgdGhpcy5fb25jb25uZWN0ID0gZnVuY3Rpb24oYlN1Y2Nlc3MpIHtcclxuXHJcbiAgICAgIGJTdWNjZXNzID0gKGJTdWNjZXNzID09PSAxKTtcclxuICAgICAgc20yLl93RChzLmlkICsgJzogJyArIChiU3VjY2VzcyA/ICdDb25uZWN0ZWQuJyA6ICdGYWlsZWQgdG8gY29ubmVjdD8gLSAnICsgcy51cmwpLCAoYlN1Y2Nlc3MgPyAxIDogMikpO1xyXG4gICAgICBzLmNvbm5lY3RlZCA9IGJTdWNjZXNzO1xyXG5cclxuICAgICAgaWYgKGJTdWNjZXNzKSB7XHJcblxyXG4gICAgICAgIHMuZmFpbHVyZXMgPSAwO1xyXG5cclxuICAgICAgICBpZiAoaWRDaGVjayhzLmlkKSkge1xyXG4gICAgICAgICAgaWYgKHMuZ2V0QXV0b1BsYXkoKSkge1xyXG4gICAgICAgICAgICAvLyBvbmx5IHVwZGF0ZSB0aGUgcGxheSBzdGF0ZSBpZiBhdXRvIHBsYXlpbmdcclxuICAgICAgICAgICAgcy5wbGF5KF91bmRlZmluZWQsIHMuZ2V0QXV0b1BsYXkoKSk7XHJcbiAgICAgICAgICB9IGVsc2UgaWYgKHMuX2lPLmF1dG9Mb2FkKSB7XHJcbiAgICAgICAgICAgIHMubG9hZCgpO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgaWYgKHMuX2lPLm9uY29ubmVjdCkge1xyXG4gICAgICAgICAgcy5faU8ub25jb25uZWN0LmFwcGx5KHMsIFtiU3VjY2Vzc10pO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgIH1cclxuXHJcbiAgICB9O1xyXG5cclxuICAgIHRoaXMuX29uZGF0YWVycm9yID0gZnVuY3Rpb24oc0Vycm9yKSB7XHJcblxyXG4gICAgICAvLyBmbGFzaCA5IHdhdmUvZXEgZGF0YSBoYW5kbGVyXHJcbiAgICAgIC8vIGhhY2s6IGNhbGxlZCBhdCBzdGFydCwgYW5kIGVuZCBmcm9tIGZsYXNoIGF0L2FmdGVyIG9uZmluaXNoKClcclxuICAgICAgaWYgKHMucGxheVN0YXRlID4gMCkge1xyXG4gICAgICAgIHNtMi5fd0Qocy5pZCArICc6IERhdGEgZXJyb3I6ICcgKyBzRXJyb3IpO1xyXG4gICAgICAgIGlmIChzLl9pTy5vbmRhdGFlcnJvcikge1xyXG4gICAgICAgICAgcy5faU8ub25kYXRhZXJyb3IuYXBwbHkocyk7XHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcblxyXG4gICAgfTtcclxuXHJcbiAgICAvLyA8ZD5cclxuICAgIHRoaXMuX2RlYnVnKCk7XHJcbiAgICAvLyA8L2Q+XHJcblxyXG4gIH07IC8vIFNNU291bmQoKVxyXG5cclxuICAvKipcclxuICAgKiBQcml2YXRlIFNvdW5kTWFuYWdlciBpbnRlcm5hbHNcclxuICAgKiAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cclxuICAgKi9cclxuXHJcbiAgZ2V0RG9jdW1lbnQgPSBmdW5jdGlvbigpIHtcclxuXHJcbiAgICByZXR1cm4gKGRvYy5ib2R5IHx8IGRvYy5nZXRFbGVtZW50c0J5VGFnTmFtZSgnZGl2JylbMF0pO1xyXG5cclxuICB9O1xyXG5cclxuICBpZCA9IGZ1bmN0aW9uKHNJRCkge1xyXG5cclxuICAgIHJldHVybiBkb2MuZ2V0RWxlbWVudEJ5SWQoc0lEKTtcclxuXHJcbiAgfTtcclxuXHJcbiAgbWl4aW4gPSBmdW5jdGlvbihvTWFpbiwgb0FkZCkge1xyXG5cclxuICAgIC8vIG5vbi1kZXN0cnVjdGl2ZSBtZXJnZVxyXG4gICAgdmFyIG8xID0gKG9NYWluIHx8IHt9KSwgbzIsIG87XHJcblxyXG4gICAgLy8gaWYgdW5zcGVjaWZpZWQsIG8yIGlzIHRoZSBkZWZhdWx0IG9wdGlvbnMgb2JqZWN0XHJcbiAgICBvMiA9IChvQWRkID09PSBfdW5kZWZpbmVkID8gc20yLmRlZmF1bHRPcHRpb25zIDogb0FkZCk7XHJcblxyXG4gICAgZm9yIChvIGluIG8yKSB7XHJcblxyXG4gICAgICBpZiAobzIuaGFzT3duUHJvcGVydHkobykgJiYgbzFbb10gPT09IF91bmRlZmluZWQpIHtcclxuXHJcbiAgICAgICAgaWYgKHR5cGVvZiBvMltvXSAhPT0gJ29iamVjdCcgfHwgbzJbb10gPT09IG51bGwpIHtcclxuXHJcbiAgICAgICAgICAvLyBhc3NpZ24gZGlyZWN0bHlcclxuICAgICAgICAgIG8xW29dID0gbzJbb107XHJcblxyXG4gICAgICAgIH0gZWxzZSB7XHJcblxyXG4gICAgICAgICAgLy8gcmVjdXJzZSB0aHJvdWdoIG8yXHJcbiAgICAgICAgICBvMVtvXSA9IG1peGluKG8xW29dLCBvMltvXSk7XHJcblxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgIH1cclxuXHJcbiAgICB9XHJcblxyXG4gICAgcmV0dXJuIG8xO1xyXG5cclxuICB9O1xyXG5cclxuICB3cmFwQ2FsbGJhY2sgPSBmdW5jdGlvbihvU291bmQsIGNhbGxiYWNrKSB7XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiAwMy8wMy8yMDEzOiBGaXggZm9yIEZsYXNoIFBsYXllciAxMS42LjYwMi4xNzEgKyBGbGFzaCA4IChmbGFzaFZlcnNpb24gPSA4KSBTV0YgaXNzdWVcclxuICAgICAqIHNldFRpbWVvdXQoKSBmaXggZm9yIGNlcnRhaW4gU01Tb3VuZCBjYWxsYmFja3MgbGlrZSBvbmxvYWQoKSBhbmQgb25maW5pc2goKSwgd2hlcmUgc3Vic2VxdWVudCBjYWxscyBsaWtlIHBsYXkoKSBhbmQgbG9hZCgpIGZhaWwgd2hlbiBGbGFzaCBQbGF5ZXIgMTEuNi42MDIuMTcxIGlzIGluc3RhbGxlZCwgYW5kIHVzaW5nIHNvdW5kTWFuYWdlciB3aXRoIGZsYXNoVmVyc2lvbiA9IDggKHdoaWNoIGlzIHRoZSBkZWZhdWx0KS5cclxuICAgICAqIE5vdCBzdXJlIG9mIGV4YWN0IGNhdXNlLiBTdXNwZWN0IHJhY2UgY29uZGl0aW9uIGFuZC9vciBpbnZhbGlkIChOYU4tc3R5bGUpIHBvc2l0aW9uIGFyZ3VtZW50IHRyaWNrbGluZyBkb3duIHRvIHRoZSBuZXh0IEpTIC0+IEZsYXNoIF9zdGFydCgpIGNhbGwsIGluIHRoZSBwbGF5KCkgY2FzZS5cclxuICAgICAqIEZpeDogc2V0VGltZW91dCgpIHRvIHlpZWxkLCBwbHVzIHNhZmVyIG51bGwgLyBOYU4gY2hlY2tpbmcgb24gcG9zaXRpb24gYXJndW1lbnQgcHJvdmlkZWQgdG8gRmxhc2guXHJcbiAgICAgKiBodHRwczovL2dldHNhdGlzZmFjdGlvbi5jb20vc2NoaWxsbWFuaWEvdG9waWNzL3JlY2VudF9jaHJvbWVfdXBkYXRlX3NlZW1zX3RvX2hhdmVfYnJva2VuX215X3NtMl9hdWRpb19wbGF5ZXJcclxuICAgICAqL1xyXG4gICAgaWYgKCFvU291bmQuaXNIVE1MNSAmJiBmViA9PT0gOCkge1xyXG4gICAgICB3aW5kb3cuc2V0VGltZW91dChjYWxsYmFjaywgMCk7XHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICBjYWxsYmFjaygpO1xyXG4gICAgfVxyXG5cclxuICB9O1xyXG5cclxuICAvLyBhZGRpdGlvbmFsIHNvdW5kTWFuYWdlciBwcm9wZXJ0aWVzIHRoYXQgc291bmRNYW5hZ2VyLnNldHVwKCkgd2lsbCBhY2NlcHRcclxuXHJcbiAgZXh0cmFPcHRpb25zID0ge1xyXG4gICAgJ29ucmVhZHknOiAxLFxyXG4gICAgJ29udGltZW91dCc6IDEsXHJcbiAgICAnZGVmYXVsdE9wdGlvbnMnOiAxLFxyXG4gICAgJ2ZsYXNoOU9wdGlvbnMnOiAxLFxyXG4gICAgJ21vdmllU3Rhck9wdGlvbnMnOiAxXHJcbiAgfTtcclxuXHJcbiAgYXNzaWduID0gZnVuY3Rpb24obywgb1BhcmVudCkge1xyXG5cclxuICAgIC8qKlxyXG4gICAgICogcmVjdXJzaXZlIGFzc2lnbm1lbnQgb2YgcHJvcGVydGllcywgc291bmRNYW5hZ2VyLnNldHVwKCkgaGVscGVyXHJcbiAgICAgKiBhbGxvd3MgcHJvcGVydHkgYXNzaWdubWVudCBiYXNlZCBvbiB3aGl0ZWxpc3RcclxuICAgICAqL1xyXG5cclxuICAgIHZhciBpLFxyXG4gICAgICAgIHJlc3VsdCA9IHRydWUsXHJcbiAgICAgICAgaGFzUGFyZW50ID0gKG9QYXJlbnQgIT09IF91bmRlZmluZWQpLFxyXG4gICAgICAgIHNldHVwT3B0aW9ucyA9IHNtMi5zZXR1cE9wdGlvbnMsXHJcbiAgICAgICAgYm9udXNPcHRpb25zID0gZXh0cmFPcHRpb25zO1xyXG5cclxuICAgIC8vIDxkPlxyXG5cclxuICAgIC8vIGlmIHNvdW5kTWFuYWdlci5zZXR1cCgpIGNhbGxlZCwgc2hvdyBhY2NlcHRlZCBwYXJhbWV0ZXJzLlxyXG5cclxuICAgIGlmIChvID09PSBfdW5kZWZpbmVkKSB7XHJcblxyXG4gICAgICByZXN1bHQgPSBbXTtcclxuXHJcbiAgICAgIGZvciAoaSBpbiBzZXR1cE9wdGlvbnMpIHtcclxuXHJcbiAgICAgICAgaWYgKHNldHVwT3B0aW9ucy5oYXNPd25Qcm9wZXJ0eShpKSkge1xyXG4gICAgICAgICAgcmVzdWx0LnB1c2goaSk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgfVxyXG5cclxuICAgICAgZm9yIChpIGluIGJvbnVzT3B0aW9ucykge1xyXG5cclxuICAgICAgICBpZiAoYm9udXNPcHRpb25zLmhhc093blByb3BlcnR5KGkpKSB7XHJcblxyXG4gICAgICAgICAgaWYgKHR5cGVvZiBzbTJbaV0gPT09ICdvYmplY3QnKSB7XHJcblxyXG4gICAgICAgICAgICByZXN1bHQucHVzaChpKyc6IHsuLi59Jyk7XHJcblxyXG4gICAgICAgICAgfSBlbHNlIGlmIChzbTJbaV0gaW5zdGFuY2VvZiBGdW5jdGlvbikge1xyXG5cclxuICAgICAgICAgICAgcmVzdWx0LnB1c2goaSsnOiBmdW5jdGlvbigpIHsuLi59Jyk7XHJcblxyXG4gICAgICAgICAgfSBlbHNlIHtcclxuXHJcbiAgICAgICAgICAgIHJlc3VsdC5wdXNoKGkpO1xyXG5cclxuICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgfVxyXG5cclxuICAgICAgc20yLl93RChzdHIoJ3NldHVwJywgcmVzdWx0LmpvaW4oJywgJykpKTtcclxuXHJcbiAgICAgIHJldHVybiBmYWxzZTtcclxuXHJcbiAgICB9XHJcblxyXG4gICAgLy8gPC9kPlxyXG5cclxuICAgIGZvciAoaSBpbiBvKSB7XHJcblxyXG4gICAgICBpZiAoby5oYXNPd25Qcm9wZXJ0eShpKSkge1xyXG5cclxuICAgICAgICAvLyBpZiBub3QgYW4ge29iamVjdH0gd2Ugd2FudCB0byByZWN1cnNlIHRocm91Z2guLi5cclxuXHJcbiAgICAgICAgaWYgKHR5cGVvZiBvW2ldICE9PSAnb2JqZWN0JyB8fCBvW2ldID09PSBudWxsIHx8IG9baV0gaW5zdGFuY2VvZiBBcnJheSB8fCBvW2ldIGluc3RhbmNlb2YgUmVnRXhwKSB7XHJcblxyXG4gICAgICAgICAgLy8gY2hlY2sgXCJhbGxvd2VkXCIgb3B0aW9uc1xyXG5cclxuICAgICAgICAgIGlmIChoYXNQYXJlbnQgJiYgYm9udXNPcHRpb25zW29QYXJlbnRdICE9PSBfdW5kZWZpbmVkKSB7XHJcblxyXG4gICAgICAgICAgICAvLyB2YWxpZCByZWN1cnNpdmUgLyBuZXN0ZWQgb2JqZWN0IG9wdGlvbiwgZWcuLCB7IGRlZmF1bHRPcHRpb25zOiB7IHZvbHVtZTogNTAgfSB9XHJcbiAgICAgICAgICAgIHNtMltvUGFyZW50XVtpXSA9IG9baV07XHJcblxyXG4gICAgICAgICAgfSBlbHNlIGlmIChzZXR1cE9wdGlvbnNbaV0gIT09IF91bmRlZmluZWQpIHtcclxuXHJcbiAgICAgICAgICAgIC8vIHNwZWNpYWwgY2FzZTogYXNzaWduIHRvIHNldHVwT3B0aW9ucyBvYmplY3QsIHdoaWNoIHNvdW5kTWFuYWdlciBwcm9wZXJ0eSByZWZlcmVuY2VzXHJcbiAgICAgICAgICAgIHNtMi5zZXR1cE9wdGlvbnNbaV0gPSBvW2ldO1xyXG5cclxuICAgICAgICAgICAgLy8gYXNzaWduIGRpcmVjdGx5IHRvIHNvdW5kTWFuYWdlciwgdG9vXHJcbiAgICAgICAgICAgIHNtMltpXSA9IG9baV07XHJcblxyXG4gICAgICAgICAgfSBlbHNlIGlmIChib251c09wdGlvbnNbaV0gPT09IF91bmRlZmluZWQpIHtcclxuXHJcbiAgICAgICAgICAgIC8vIGludmFsaWQgb3IgZGlzYWxsb3dlZCBwYXJhbWV0ZXIuIGNvbXBsYWluLlxyXG4gICAgICAgICAgICBjb21wbGFpbihzdHIoKHNtMltpXSA9PT0gX3VuZGVmaW5lZCA/ICdzZXR1cFVuZGVmJyA6ICdzZXR1cEVycm9yJyksIGkpLCAyKTtcclxuXHJcbiAgICAgICAgICAgIHJlc3VsdCA9IGZhbHNlO1xyXG5cclxuICAgICAgICAgIH0gZWxzZSB7XHJcblxyXG4gICAgICAgICAgICAvKipcclxuICAgICAgICAgICAgICogdmFsaWQgZXh0cmFPcHRpb25zIChib251c09wdGlvbnMpIHBhcmFtZXRlci5cclxuICAgICAgICAgICAgICogaXMgaXQgYSBtZXRob2QsIGxpa2Ugb25yZWFkeS9vbnRpbWVvdXQ/IGNhbGwgaXQuXHJcbiAgICAgICAgICAgICAqIG11bHRpcGxlIHBhcmFtZXRlcnMgc2hvdWxkIGJlIGluIGFuIGFycmF5LCBlZy4gc291bmRNYW5hZ2VyLnNldHVwKHtvbnJlYWR5OiBbbXlIYW5kbGVyLCBteVNjb3BlXX0pO1xyXG4gICAgICAgICAgICAgKi9cclxuXHJcbiAgICAgICAgICAgIGlmIChzbTJbaV0gaW5zdGFuY2VvZiBGdW5jdGlvbikge1xyXG5cclxuICAgICAgICAgICAgICBzbTJbaV0uYXBwbHkoc20yLCAob1tpXSBpbnN0YW5jZW9mIEFycmF5PyBvW2ldIDogW29baV1dKSk7XHJcblxyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG5cclxuICAgICAgICAgICAgICAvLyBnb29kIG9sZC1mYXNoaW9uZWQgZGlyZWN0IGFzc2lnbm1lbnRcclxuICAgICAgICAgICAgICBzbTJbaV0gPSBvW2ldO1xyXG5cclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgfSBlbHNlIHtcclxuXHJcbiAgICAgICAgICAvLyByZWN1cnNpb24gY2FzZSwgZWcuLCB7IGRlZmF1bHRPcHRpb25zOiB7IC4uLiB9IH1cclxuXHJcbiAgICAgICAgICBpZiAoYm9udXNPcHRpb25zW2ldID09PSBfdW5kZWZpbmVkKSB7XHJcblxyXG4gICAgICAgICAgICAvLyBpbnZhbGlkIG9yIGRpc2FsbG93ZWQgcGFyYW1ldGVyLiBjb21wbGFpbi5cclxuICAgICAgICAgICAgY29tcGxhaW4oc3RyKChzbTJbaV0gPT09IF91bmRlZmluZWQgPyAnc2V0dXBVbmRlZicgOiAnc2V0dXBFcnJvcicpLCBpKSwgMik7XHJcblxyXG4gICAgICAgICAgICByZXN1bHQgPSBmYWxzZTtcclxuXHJcbiAgICAgICAgICB9IGVsc2Uge1xyXG5cclxuICAgICAgICAgICAgLy8gcmVjdXJzZSB0aHJvdWdoIG9iamVjdFxyXG4gICAgICAgICAgICByZXR1cm4gYXNzaWduKG9baV0sIGkpO1xyXG5cclxuICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgfVxyXG5cclxuICAgIH1cclxuXHJcbiAgICByZXR1cm4gcmVzdWx0O1xyXG5cclxuICB9O1xyXG5cclxuICBmdW5jdGlvbiBwcmVmZXJGbGFzaENoZWNrKGtpbmQpIHtcclxuXHJcbiAgICAvLyB3aGV0aGVyIGZsYXNoIHNob3VsZCBwbGF5IGEgZ2l2ZW4gdHlwZVxyXG4gICAgcmV0dXJuIChzbTIucHJlZmVyRmxhc2ggJiYgaGFzRmxhc2ggJiYgIXNtMi5pZ25vcmVGbGFzaCAmJiAoc20yLmZsYXNoW2tpbmRdICE9PSBfdW5kZWZpbmVkICYmIHNtMi5mbGFzaFtraW5kXSkpO1xyXG5cclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIEludGVybmFsIERPTTItbGV2ZWwgZXZlbnQgaGVscGVyc1xyXG4gICAqIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxyXG4gICAqL1xyXG5cclxuICBldmVudCA9IChmdW5jdGlvbigpIHtcclxuXHJcbiAgICAvLyBub3JtYWxpemUgZXZlbnQgbWV0aG9kc1xyXG4gICAgdmFyIG9sZCA9ICh3aW5kb3cuYXR0YWNoRXZlbnQpLFxyXG4gICAgZXZ0ID0ge1xyXG4gICAgICBhZGQ6IChvbGQ/J2F0dGFjaEV2ZW50JzonYWRkRXZlbnRMaXN0ZW5lcicpLFxyXG4gICAgICByZW1vdmU6IChvbGQ/J2RldGFjaEV2ZW50JzoncmVtb3ZlRXZlbnRMaXN0ZW5lcicpXHJcbiAgICB9O1xyXG5cclxuICAgIC8vIG5vcm1hbGl6ZSBcIm9uXCIgZXZlbnQgcHJlZml4LCBvcHRpb25hbCBjYXB0dXJlIGFyZ3VtZW50XHJcbiAgICBmdW5jdGlvbiBnZXRBcmdzKG9BcmdzKSB7XHJcblxyXG4gICAgICB2YXIgYXJncyA9IHNsaWNlLmNhbGwob0FyZ3MpLFxyXG4gICAgICAgICAgbGVuID0gYXJncy5sZW5ndGg7XHJcblxyXG4gICAgICBpZiAob2xkKSB7XHJcbiAgICAgICAgLy8gcHJlZml4XHJcbiAgICAgICAgYXJnc1sxXSA9ICdvbicgKyBhcmdzWzFdO1xyXG4gICAgICAgIGlmIChsZW4gPiAzKSB7XHJcbiAgICAgICAgICAvLyBubyBjYXB0dXJlXHJcbiAgICAgICAgICBhcmdzLnBvcCgpO1xyXG4gICAgICAgIH1cclxuICAgICAgfSBlbHNlIGlmIChsZW4gPT09IDMpIHtcclxuICAgICAgICBhcmdzLnB1c2goZmFsc2UpO1xyXG4gICAgICB9XHJcblxyXG4gICAgICByZXR1cm4gYXJncztcclxuXHJcbiAgICB9XHJcblxyXG4gICAgZnVuY3Rpb24gYXBwbHkoYXJncywgc1R5cGUpIHtcclxuXHJcbiAgICAgIC8vIG5vcm1hbGl6ZSBhbmQgY2FsbCB0aGUgZXZlbnQgbWV0aG9kLCB3aXRoIHRoZSBwcm9wZXIgYXJndW1lbnRzXHJcbiAgICAgIHZhciBlbGVtZW50ID0gYXJncy5zaGlmdCgpLFxyXG4gICAgICAgICAgbWV0aG9kID0gW2V2dFtzVHlwZV1dO1xyXG5cclxuICAgICAgaWYgKG9sZCkge1xyXG4gICAgICAgIC8vIG9sZCBJRSBjYW4ndCBkbyBhcHBseSgpLlxyXG4gICAgICAgIGVsZW1lbnRbbWV0aG9kXShhcmdzWzBdLCBhcmdzWzFdKTtcclxuICAgICAgfSBlbHNlIHtcclxuICAgICAgICBlbGVtZW50W21ldGhvZF0uYXBwbHkoZWxlbWVudCwgYXJncyk7XHJcbiAgICAgIH1cclxuXHJcbiAgICB9XHJcblxyXG4gICAgZnVuY3Rpb24gYWRkKCkge1xyXG5cclxuICAgICAgYXBwbHkoZ2V0QXJncyhhcmd1bWVudHMpLCAnYWRkJyk7XHJcblxyXG4gICAgfVxyXG5cclxuICAgIGZ1bmN0aW9uIHJlbW92ZSgpIHtcclxuXHJcbiAgICAgIGFwcGx5KGdldEFyZ3MoYXJndW1lbnRzKSwgJ3JlbW92ZScpO1xyXG5cclxuICAgIH1cclxuXHJcbiAgICByZXR1cm4ge1xyXG4gICAgICAnYWRkJzogYWRkLFxyXG4gICAgICAncmVtb3ZlJzogcmVtb3ZlXHJcbiAgICB9O1xyXG5cclxuICB9KCkpO1xyXG5cclxuICAvKipcclxuICAgKiBJbnRlcm5hbCBIVE1MNSBldmVudCBoYW5kbGluZ1xyXG4gICAqIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXHJcbiAgICovXHJcblxyXG4gIGZ1bmN0aW9uIGh0bWw1X2V2ZW50KG9Gbikge1xyXG5cclxuICAgIC8vIHdyYXAgaHRtbDUgZXZlbnQgaGFuZGxlcnMgc28gd2UgZG9uJ3QgY2FsbCB0aGVtIG9uIGRlc3Ryb3llZCBhbmQvb3IgdW5sb2FkZWQgc291bmRzXHJcblxyXG4gICAgcmV0dXJuIGZ1bmN0aW9uKGUpIHtcclxuXHJcbiAgICAgIHZhciBzID0gdGhpcy5fcyxcclxuICAgICAgICAgIHJlc3VsdDtcclxuXHJcbiAgICAgIGlmICghcyB8fCAhcy5fYSkge1xyXG4gICAgICAgIC8vIDxkPlxyXG4gICAgICAgIGlmIChzICYmIHMuaWQpIHtcclxuICAgICAgICAgIHNtMi5fd0Qocy5pZCArICc6IElnbm9yaW5nICcgKyBlLnR5cGUpO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICBzbTIuX3dEKGg1ICsgJ0lnbm9yaW5nICcgKyBlLnR5cGUpO1xyXG4gICAgICAgIH1cclxuICAgICAgICAvLyA8L2Q+XHJcbiAgICAgICAgcmVzdWx0ID0gbnVsbDtcclxuICAgICAgfSBlbHNlIHtcclxuICAgICAgICByZXN1bHQgPSBvRm4uY2FsbCh0aGlzLCBlKTtcclxuICAgICAgfVxyXG5cclxuICAgICAgcmV0dXJuIHJlc3VsdDtcclxuXHJcbiAgICB9O1xyXG5cclxuICB9XHJcblxyXG4gIGh0bWw1X2V2ZW50cyA9IHtcclxuXHJcbiAgICAvLyBIVE1MNSBldmVudC1uYW1lLXRvLWhhbmRsZXIgbWFwXHJcblxyXG4gICAgYWJvcnQ6IGh0bWw1X2V2ZW50KGZ1bmN0aW9uKCkge1xyXG5cclxuICAgICAgc20yLl93RCh0aGlzLl9zLmlkICsgJzogYWJvcnQnKTtcclxuXHJcbiAgICB9KSxcclxuXHJcbiAgICAvLyBlbm91Z2ggaGFzIGxvYWRlZCB0byBwbGF5XHJcblxyXG4gICAgY2FucGxheTogaHRtbDVfZXZlbnQoZnVuY3Rpb24oKSB7XHJcblxyXG4gICAgICB2YXIgcyA9IHRoaXMuX3MsXHJcbiAgICAgICAgICBwb3NpdGlvbjFLO1xyXG5cclxuICAgICAgaWYgKHMuX2h0bWw1X2NhbnBsYXkpIHtcclxuICAgICAgICAvLyB0aGlzIGV2ZW50IGhhcyBhbHJlYWR5IGZpcmVkLiBpZ25vcmUuXHJcbiAgICAgICAgcmV0dXJuIHRydWU7XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIHMuX2h0bWw1X2NhbnBsYXkgPSB0cnVlO1xyXG4gICAgICBzbTIuX3dEKHMuaWQgKyAnOiBjYW5wbGF5Jyk7XHJcbiAgICAgIHMuX29uYnVmZmVyY2hhbmdlKDApO1xyXG5cclxuICAgICAgLy8gcG9zaXRpb24gYWNjb3JkaW5nIHRvIGluc3RhbmNlIG9wdGlvbnNcclxuICAgICAgcG9zaXRpb24xSyA9IChzLl9pTy5wb3NpdGlvbiAhPT0gX3VuZGVmaW5lZCAmJiAhaXNOYU4ocy5faU8ucG9zaXRpb24pID8gcy5faU8ucG9zaXRpb24vbXNlY1NjYWxlIDogbnVsbCk7XHJcblxyXG4gICAgICAvLyBzZXQgdGhlIHBvc2l0aW9uIGlmIHBvc2l0aW9uIHdhcyBwcm92aWRlZCBiZWZvcmUgdGhlIHNvdW5kIGxvYWRlZFxyXG4gICAgICBpZiAodGhpcy5jdXJyZW50VGltZSAhPT0gcG9zaXRpb24xSykge1xyXG4gICAgICAgIHNtMi5fd0Qocy5pZCArICc6IGNhbnBsYXk6IFNldHRpbmcgcG9zaXRpb24gdG8gJyArIHBvc2l0aW9uMUspO1xyXG4gICAgICAgIHRyeSB7XHJcbiAgICAgICAgICB0aGlzLmN1cnJlbnRUaW1lID0gcG9zaXRpb24xSztcclxuICAgICAgICB9IGNhdGNoKGVlKSB7XHJcbiAgICAgICAgICBzbTIuX3dEKHMuaWQgKyAnOiBjYW5wbGF5OiBTZXR0aW5nIHBvc2l0aW9uIG9mICcgKyBwb3NpdGlvbjFLICsgJyBmYWlsZWQ6ICcgKyBlZS5tZXNzYWdlLCAyKTtcclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIC8vIGhhY2sgZm9yIEhUTUw1IGZyb20vdG8gY2FzZVxyXG4gICAgICBpZiAocy5faU8uX29uY2FucGxheSkge1xyXG4gICAgICAgIHMuX2lPLl9vbmNhbnBsYXkoKTtcclxuICAgICAgfVxyXG5cclxuICAgIH0pLFxyXG5cclxuICAgIGNhbnBsYXl0aHJvdWdoOiBodG1sNV9ldmVudChmdW5jdGlvbigpIHtcclxuXHJcbiAgICAgIHZhciBzID0gdGhpcy5fcztcclxuXHJcbiAgICAgIGlmICghcy5sb2FkZWQpIHtcclxuICAgICAgICBzLl9vbmJ1ZmZlcmNoYW5nZSgwKTtcclxuICAgICAgICBzLl93aGlsZWxvYWRpbmcocy5ieXRlc0xvYWRlZCwgcy5ieXRlc1RvdGFsLCBzLl9nZXRfaHRtbDVfZHVyYXRpb24oKSk7XHJcbiAgICAgICAgcy5fb25sb2FkKHRydWUpO1xyXG4gICAgICB9XHJcblxyXG4gICAgfSksXHJcblxyXG4gICAgZHVyYXRpb25jaGFuZ2U6IGh0bWw1X2V2ZW50KGZ1bmN0aW9uKCkge1xyXG5cclxuICAgICAgLy8gZHVyYXRpb25jaGFuZ2UgbWF5IGZpcmUgYXQgdmFyaW91cyB0aW1lcywgcHJvYmFibHkgdGhlIHNhZmVzdCB3YXkgdG8gY2FwdHVyZSBhY2N1cmF0ZS9maW5hbCBkdXJhdGlvbi5cclxuXHJcbiAgICAgIHZhciBzID0gdGhpcy5fcyxcclxuICAgICAgICAgIGR1cmF0aW9uO1xyXG5cclxuICAgICAgZHVyYXRpb24gPSBzLl9nZXRfaHRtbDVfZHVyYXRpb24oKTtcclxuXHJcbiAgICAgIGlmICghaXNOYU4oZHVyYXRpb24pICYmIGR1cmF0aW9uICE9PSBzLmR1cmF0aW9uKSB7XHJcblxyXG4gICAgICAgIHNtMi5fd0QodGhpcy5fcy5pZCArICc6IGR1cmF0aW9uY2hhbmdlICgnICsgZHVyYXRpb24gKyAnKScgKyAocy5kdXJhdGlvbiA/ICcsIHByZXZpb3VzbHkgJyArIHMuZHVyYXRpb24gOiAnJykpO1xyXG5cclxuICAgICAgICBzLmR1cmF0aW9uRXN0aW1hdGUgPSBzLmR1cmF0aW9uID0gZHVyYXRpb247XHJcblxyXG4gICAgICB9XHJcblxyXG4gICAgfSksXHJcblxyXG4gICAgLy8gVE9ETzogUmVzZXJ2ZWQgZm9yIHBvdGVudGlhbCB1c2VcclxuICAgIC8qXHJcbiAgICBlbXB0aWVkOiBodG1sNV9ldmVudChmdW5jdGlvbigpIHtcclxuXHJcbiAgICAgIHNtMi5fd0QodGhpcy5fcy5pZCArICc6IGVtcHRpZWQnKTtcclxuXHJcbiAgICB9KSxcclxuICAgICovXHJcblxyXG4gICAgZW5kZWQ6IGh0bWw1X2V2ZW50KGZ1bmN0aW9uKCkge1xyXG5cclxuICAgICAgdmFyIHMgPSB0aGlzLl9zO1xyXG5cclxuICAgICAgc20yLl93RChzLmlkICsgJzogZW5kZWQnKTtcclxuXHJcbiAgICAgIHMuX29uZmluaXNoKCk7XHJcblxyXG4gICAgfSksXHJcblxyXG4gICAgZXJyb3I6IGh0bWw1X2V2ZW50KGZ1bmN0aW9uKCkge1xyXG5cclxuICAgICAgc20yLl93RCh0aGlzLl9zLmlkICsgJzogSFRNTDUgZXJyb3IsIGNvZGUgJyArIHRoaXMuZXJyb3IuY29kZSk7XHJcbiAgICAgIC8qKlxyXG4gICAgICAgKiBIVE1MNSBlcnJvciBjb2RlcywgcGVyIFczQ1xyXG4gICAgICAgKiBFcnJvciAxOiBDbGllbnQgYWJvcnRlZCBkb3dubG9hZCBhdCB1c2VyJ3MgcmVxdWVzdC5cclxuICAgICAgICogRXJyb3IgMjogTmV0d29yayBlcnJvciBhZnRlciBsb2FkIHN0YXJ0ZWQuXHJcbiAgICAgICAqIEVycm9yIDM6IERlY29kaW5nIGlzc3VlLlxyXG4gICAgICAgKiBFcnJvciA0OiBNZWRpYSAoYXVkaW8gZmlsZSkgbm90IHN1cHBvcnRlZC5cclxuICAgICAgICogUmVmZXJlbmNlOiBodHRwOi8vd3d3LndoYXR3Zy5vcmcvc3BlY3Mvd2ViLWFwcHMvY3VycmVudC13b3JrL211bHRpcGFnZS90aGUtdmlkZW8tZWxlbWVudC5odG1sI2Vycm9yLWNvZGVzXHJcbiAgICAgICAqL1xyXG4gICAgICAvLyBjYWxsIGxvYWQgd2l0aCBlcnJvciBzdGF0ZT9cclxuICAgICAgdGhpcy5fcy5fb25sb2FkKGZhbHNlKTtcclxuXHJcbiAgICB9KSxcclxuXHJcbiAgICBsb2FkZWRkYXRhOiBodG1sNV9ldmVudChmdW5jdGlvbigpIHtcclxuXHJcbiAgICAgIHZhciBzID0gdGhpcy5fcztcclxuXHJcbiAgICAgIHNtMi5fd0Qocy5pZCArICc6IGxvYWRlZGRhdGEnKTtcclxuXHJcbiAgICAgIC8vIHNhZmFyaSBzZWVtcyB0byBuaWNlbHkgcmVwb3J0IHByb2dyZXNzIGV2ZW50cywgZXZlbnR1YWxseSB0b3RhbGxpbmcgMTAwJVxyXG4gICAgICBpZiAoIXMuX2xvYWRlZCAmJiAhaXNTYWZhcmkpIHtcclxuICAgICAgICBzLmR1cmF0aW9uID0gcy5fZ2V0X2h0bWw1X2R1cmF0aW9uKCk7XHJcbiAgICAgIH1cclxuXHJcbiAgICB9KSxcclxuXHJcbiAgICBsb2FkZWRtZXRhZGF0YTogaHRtbDVfZXZlbnQoZnVuY3Rpb24oKSB7XHJcblxyXG4gICAgICBzbTIuX3dEKHRoaXMuX3MuaWQgKyAnOiBsb2FkZWRtZXRhZGF0YScpO1xyXG5cclxuICAgIH0pLFxyXG5cclxuICAgIGxvYWRzdGFydDogaHRtbDVfZXZlbnQoZnVuY3Rpb24oKSB7XHJcblxyXG4gICAgICBzbTIuX3dEKHRoaXMuX3MuaWQgKyAnOiBsb2Fkc3RhcnQnKTtcclxuICAgICAgLy8gYXNzdW1lIGJ1ZmZlcmluZyBhdCBmaXJzdFxyXG4gICAgICB0aGlzLl9zLl9vbmJ1ZmZlcmNoYW5nZSgxKTtcclxuXHJcbiAgICB9KSxcclxuXHJcbiAgICBwbGF5OiBodG1sNV9ldmVudChmdW5jdGlvbigpIHtcclxuXHJcbiAgICAgIC8vIHNtMi5fd0QodGhpcy5fcy5pZCArICc6IHBsYXkoKScpO1xyXG4gICAgICAvLyBvbmNlIHBsYXkgc3RhcnRzLCBubyBidWZmZXJpbmdcclxuICAgICAgdGhpcy5fcy5fb25idWZmZXJjaGFuZ2UoMCk7XHJcblxyXG4gICAgfSksXHJcblxyXG4gICAgcGxheWluZzogaHRtbDVfZXZlbnQoZnVuY3Rpb24oKSB7XHJcblxyXG4gICAgICBzbTIuX3dEKHRoaXMuX3MuaWQgKyAnOiBwbGF5aW5nICcgKyBTdHJpbmcuZnJvbUNoYXJDb2RlKDk4MzUpKTtcclxuICAgICAgLy8gb25jZSBwbGF5IHN0YXJ0cywgbm8gYnVmZmVyaW5nXHJcbiAgICAgIHRoaXMuX3MuX29uYnVmZmVyY2hhbmdlKDApO1xyXG5cclxuICAgIH0pLFxyXG5cclxuICAgIHByb2dyZXNzOiBodG1sNV9ldmVudChmdW5jdGlvbihlKSB7XHJcblxyXG4gICAgICAvLyBub3RlOiBjYW4gZmlyZSByZXBlYXRlZGx5IGFmdGVyIFwibG9hZGVkXCIgZXZlbnQsIGR1ZSB0byB1c2Ugb2YgSFRUUCByYW5nZS9wYXJ0aWFsc1xyXG5cclxuICAgICAgdmFyIHMgPSB0aGlzLl9zLFxyXG4gICAgICAgICAgaSwgaiwgcHJvZ1N0ciwgYnVmZmVyZWQgPSAwLFxyXG4gICAgICAgICAgaXNQcm9ncmVzcyA9IChlLnR5cGUgPT09ICdwcm9ncmVzcycpLFxyXG4gICAgICAgICAgcmFuZ2VzID0gZS50YXJnZXQuYnVmZmVyZWQsXHJcbiAgICAgICAgICAvLyBmaXJlZm94IDMuNiBpbXBsZW1lbnRzIGUubG9hZGVkL3RvdGFsIChieXRlcylcclxuICAgICAgICAgIGxvYWRlZCA9IChlLmxvYWRlZHx8MCksXHJcbiAgICAgICAgICB0b3RhbCA9IChlLnRvdGFsfHwxKTtcclxuXHJcbiAgICAgIC8vIHJlc2V0IHRoZSBcImJ1ZmZlcmVkXCIgKGxvYWRlZCBieXRlIHJhbmdlcykgYXJyYXlcclxuICAgICAgcy5idWZmZXJlZCA9IFtdO1xyXG5cclxuICAgICAgaWYgKHJhbmdlcyAmJiByYW5nZXMubGVuZ3RoKSB7XHJcblxyXG4gICAgICAgIC8vIGlmIGxvYWRlZCBpcyAwLCB0cnkgVGltZVJhbmdlcyBpbXBsZW1lbnRhdGlvbiBhcyAlIG9mIGxvYWRcclxuICAgICAgICAvLyBodHRwczovL2RldmVsb3Blci5tb3ppbGxhLm9yZy9lbi9ET00vVGltZVJhbmdlc1xyXG5cclxuICAgICAgICAvLyByZS1idWlsZCBcImJ1ZmZlcmVkXCIgYXJyYXlcclxuICAgICAgICAvLyBIVE1MNSByZXR1cm5zIHNlY29uZHMuIFNNMiBBUEkgdXNlcyBtc2VjIGZvciBzZXRQb3NpdGlvbigpIGV0Yy4sIHdoZXRoZXIgRmxhc2ggb3IgSFRNTDUuXHJcbiAgICAgICAgZm9yIChpPTAsIGo9cmFuZ2VzLmxlbmd0aDsgaTxqOyBpKyspIHtcclxuICAgICAgICAgIHMuYnVmZmVyZWQucHVzaCh7XHJcbiAgICAgICAgICAgICdzdGFydCc6IHJhbmdlcy5zdGFydChpKSAqIG1zZWNTY2FsZSxcclxuICAgICAgICAgICAgJ2VuZCc6IHJhbmdlcy5lbmQoaSkgKiBtc2VjU2NhbGVcclxuICAgICAgICAgIH0pO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLy8gdXNlIHRoZSBsYXN0IHZhbHVlIGxvY2FsbHlcclxuICAgICAgICBidWZmZXJlZCA9IChyYW5nZXMuZW5kKDApIC0gcmFuZ2VzLnN0YXJ0KDApKSAqIG1zZWNTY2FsZTtcclxuXHJcbiAgICAgICAgLy8gbGluZWFyIGNhc2UsIGJ1ZmZlciBzdW07IGRvZXMgbm90IGFjY291bnQgZm9yIHNlZWtpbmcgYW5kIEhUVFAgcGFydGlhbHMgLyBieXRlIHJhbmdlc1xyXG4gICAgICAgIGxvYWRlZCA9IE1hdGgubWluKDEsIGJ1ZmZlcmVkLyhlLnRhcmdldC5kdXJhdGlvbiptc2VjU2NhbGUpKTtcclxuXHJcbiAgICAgICAgLy8gPGQ+XHJcbiAgICAgICAgaWYgKGlzUHJvZ3Jlc3MgJiYgcmFuZ2VzLmxlbmd0aCA+IDEpIHtcclxuICAgICAgICAgIHByb2dTdHIgPSBbXTtcclxuICAgICAgICAgIGogPSByYW5nZXMubGVuZ3RoO1xyXG4gICAgICAgICAgZm9yIChpPTA7IGk8ajsgaSsrKSB7XHJcbiAgICAgICAgICAgIHByb2dTdHIucHVzaChlLnRhcmdldC5idWZmZXJlZC5zdGFydChpKSptc2VjU2NhbGUgKyctJysgZS50YXJnZXQuYnVmZmVyZWQuZW5kKGkpKm1zZWNTY2FsZSk7XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgICBzbTIuX3dEKHRoaXMuX3MuaWQgKyAnOiBwcm9ncmVzcywgdGltZVJhbmdlczogJyArIHByb2dTdHIuam9pbignLCAnKSk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBpZiAoaXNQcm9ncmVzcyAmJiAhaXNOYU4obG9hZGVkKSkge1xyXG4gICAgICAgICAgc20yLl93RCh0aGlzLl9zLmlkICsgJzogcHJvZ3Jlc3MsICcgKyBNYXRoLmZsb29yKGxvYWRlZCoxMDApICsgJyUgbG9hZGVkJyk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIC8vIDwvZD5cclxuXHJcbiAgICAgIH1cclxuXHJcbiAgICAgIGlmICghaXNOYU4obG9hZGVkKSkge1xyXG5cclxuICAgICAgICAvLyBUT0RPOiBwcmV2ZW50IGNhbGxzIHdpdGggZHVwbGljYXRlIHZhbHVlcy5cclxuICAgICAgICBzLl93aGlsZWxvYWRpbmcobG9hZGVkLCB0b3RhbCwgcy5fZ2V0X2h0bWw1X2R1cmF0aW9uKCkpO1xyXG4gICAgICAgIGlmIChsb2FkZWQgJiYgdG90YWwgJiYgbG9hZGVkID09PSB0b3RhbCkge1xyXG4gICAgICAgICAgLy8gaW4gY2FzZSBcIm9ubG9hZFwiIGRvZXNuJ3QgZmlyZSAoZWcuIGdlY2tvIDEuOS4yKVxyXG4gICAgICAgICAgaHRtbDVfZXZlbnRzLmNhbnBsYXl0aHJvdWdoLmNhbGwodGhpcywgZSk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgfVxyXG5cclxuICAgIH0pLFxyXG5cclxuICAgIHJhdGVjaGFuZ2U6IGh0bWw1X2V2ZW50KGZ1bmN0aW9uKCkge1xyXG5cclxuICAgICAgc20yLl93RCh0aGlzLl9zLmlkICsgJzogcmF0ZWNoYW5nZScpO1xyXG5cclxuICAgIH0pLFxyXG5cclxuICAgIHN1c3BlbmQ6IGh0bWw1X2V2ZW50KGZ1bmN0aW9uKGUpIHtcclxuXHJcbiAgICAgIC8vIGRvd25sb2FkIHBhdXNlZC9zdG9wcGVkLCBtYXkgaGF2ZSBmaW5pc2hlZCAoZWcuIG9ubG9hZClcclxuICAgICAgdmFyIHMgPSB0aGlzLl9zO1xyXG5cclxuICAgICAgc20yLl93RCh0aGlzLl9zLmlkICsgJzogc3VzcGVuZCcpO1xyXG4gICAgICBodG1sNV9ldmVudHMucHJvZ3Jlc3MuY2FsbCh0aGlzLCBlKTtcclxuICAgICAgcy5fb25zdXNwZW5kKCk7XHJcblxyXG4gICAgfSksXHJcblxyXG4gICAgc3RhbGxlZDogaHRtbDVfZXZlbnQoZnVuY3Rpb24oKSB7XHJcblxyXG4gICAgICBzbTIuX3dEKHRoaXMuX3MuaWQgKyAnOiBzdGFsbGVkJyk7XHJcblxyXG4gICAgfSksXHJcblxyXG4gICAgdGltZXVwZGF0ZTogaHRtbDVfZXZlbnQoZnVuY3Rpb24oKSB7XHJcblxyXG4gICAgICB0aGlzLl9zLl9vblRpbWVyKCk7XHJcblxyXG4gICAgfSksXHJcblxyXG4gICAgd2FpdGluZzogaHRtbDVfZXZlbnQoZnVuY3Rpb24oKSB7XHJcblxyXG4gICAgICB2YXIgcyA9IHRoaXMuX3M7XHJcblxyXG4gICAgICAvLyBzZWUgYWxzbzogc2Vla2luZ1xyXG4gICAgICBzbTIuX3dEKHRoaXMuX3MuaWQgKyAnOiB3YWl0aW5nJyk7XHJcblxyXG4gICAgICAvLyBwbGF5YmFjayBmYXN0ZXIgdGhhbiBkb3dubG9hZCByYXRlLCBldGMuXHJcbiAgICAgIHMuX29uYnVmZmVyY2hhbmdlKDEpO1xyXG5cclxuICAgIH0pXHJcblxyXG4gIH07XHJcblxyXG4gIGh0bWw1T0sgPSBmdW5jdGlvbihpTykge1xyXG5cclxuICAgIC8vIHBsYXlhYmlsaXR5IHRlc3QgYmFzZWQgb24gVVJMIG9yIE1JTUUgdHlwZVxyXG5cclxuICAgIHZhciByZXN1bHQ7XHJcblxyXG4gICAgaWYgKCFpTyB8fCAoIWlPLnR5cGUgJiYgIWlPLnVybCAmJiAhaU8uc2VydmVyVVJMKSkge1xyXG5cclxuICAgICAgLy8gbm90aGluZyB0byBjaGVja1xyXG4gICAgICByZXN1bHQgPSBmYWxzZTtcclxuXHJcbiAgICB9IGVsc2UgaWYgKGlPLnNlcnZlclVSTCB8fCAoaU8udHlwZSAmJiBwcmVmZXJGbGFzaENoZWNrKGlPLnR5cGUpKSkge1xyXG5cclxuICAgICAgLy8gUlRNUCwgb3IgcHJlZmVycmluZyBmbGFzaFxyXG4gICAgICByZXN1bHQgPSBmYWxzZTtcclxuXHJcbiAgICB9IGVsc2Uge1xyXG5cclxuICAgICAgLy8gVXNlIHR5cGUsIGlmIHNwZWNpZmllZC4gUGFzcyBkYXRhOiBVUklzIHRvIEhUTUw1LiBJZiBIVE1MNS1vbmx5IG1vZGUsIG5vIG90aGVyIG9wdGlvbnMsIHNvIGp1c3QgZ2l2ZSAnZXJcclxuICAgICAgcmVzdWx0ID0gKChpTy50eXBlID8gaHRtbDVDYW5QbGF5KHt0eXBlOmlPLnR5cGV9KSA6IGh0bWw1Q2FuUGxheSh7dXJsOmlPLnVybH0pIHx8IHNtMi5odG1sNU9ubHkgfHwgaU8udXJsLm1hdGNoKC9kYXRhXFw6L2kpKSk7XHJcblxyXG4gICAgfVxyXG5cclxuICAgIHJldHVybiByZXN1bHQ7XHJcblxyXG4gIH07XHJcblxyXG4gIGh0bWw1VW5sb2FkID0gZnVuY3Rpb24ob0F1ZGlvKSB7XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBJbnRlcm5hbCBtZXRob2Q6IFVubG9hZCBtZWRpYSwgYW5kIGNhbmNlbCBhbnkgY3VycmVudC9wZW5kaW5nIG5ldHdvcmsgcmVxdWVzdHMuXHJcbiAgICAgKiBGaXJlZm94IGNhbiBsb2FkIGFuIGVtcHR5IFVSTCwgd2hpY2ggYWxsZWdlZGx5IGRlc3Ryb3lzIHRoZSBkZWNvZGVyIGFuZCBzdG9wcyB0aGUgZG93bmxvYWQuXHJcbiAgICAgKiBodHRwczovL2RldmVsb3Blci5tb3ppbGxhLm9yZy9Fbi9Vc2luZ19hdWRpb19hbmRfdmlkZW9faW5fRmlyZWZveCNTdG9wcGluZ190aGVfZG93bmxvYWRfb2ZfbWVkaWFcclxuICAgICAqIEhvd2V2ZXIsIEZpcmVmb3ggaGFzIGJlZW4gc2VlbiBsb2FkaW5nIGEgcmVsYXRpdmUgVVJMIGZyb20gJycgYW5kIHRodXMgcmVxdWVzdGluZyB0aGUgaG9zdGluZyBwYWdlIG9uIHVubG9hZC5cclxuICAgICAqIE90aGVyIFVBIGJlaGF2aW91ciBpcyB1bmNsZWFyLCBzbyBldmVyeW9uZSBlbHNlIGdldHMgYW4gYWJvdXQ6Ymxhbmstc3R5bGUgVVJMLlxyXG4gICAgICovXHJcblxyXG4gICAgdmFyIHVybDtcclxuXHJcbiAgICBpZiAob0F1ZGlvKSB7XHJcblxyXG4gICAgICAvLyBGaXJlZm94IGFuZCBDaHJvbWUgYWNjZXB0IHNob3J0IFdBVmUgZGF0YTogVVJJcy4gQ2hvbWUgZGlzbGlrZXMgYXVkaW8vd2F2LCBidXQgYWNjZXB0cyBhdWRpby93YXYgZm9yIGRhdGE6IE1JTUUuXHJcbiAgICAgIC8vIERlc2t0b3AgU2FmYXJpIGNvbXBsYWlucyAvIGZhaWxzIG9uIGRhdGE6IFVSSSwgc28gaXQgZ2V0cyBhYm91dDpibGFuay5cclxuICAgICAgdXJsID0gKGlzU2FmYXJpID8gZW1wdHlVUkwgOiAoc20yLmh0bWw1LmNhblBsYXlUeXBlKCdhdWRpby93YXYnKSA/IGVtcHR5V0FWIDogZW1wdHlVUkwpKTtcclxuXHJcbiAgICAgIG9BdWRpby5zcmMgPSB1cmw7XHJcblxyXG4gICAgICAvLyByZXNldCBzb21lIHN0YXRlLCB0b29cclxuICAgICAgaWYgKG9BdWRpby5fY2FsbGVkX3VubG9hZCAhPT0gdW5kZWZpbmVkKSB7XHJcbiAgICAgICAgb0F1ZGlvLl9jYWxsZWRfbG9hZCA9IGZhbHNlO1xyXG4gICAgICB9XHJcblxyXG4gICAgfVxyXG5cclxuICAgIGlmICh1c2VHbG9iYWxIVE1MNUF1ZGlvKSB7XHJcblxyXG4gICAgICAvLyBlbnN1cmUgVVJMIHN0YXRlIGlzIHRyYXNoZWQsIGFsc29cclxuICAgICAgbGFzdEdsb2JhbEhUTUw1VVJMID0gbnVsbDtcclxuXHJcbiAgICB9XHJcblxyXG4gICAgcmV0dXJuIHVybDtcclxuXHJcbiAgfTtcclxuXHJcbiAgaHRtbDVDYW5QbGF5ID0gZnVuY3Rpb24obykge1xyXG5cclxuICAgIC8qKlxyXG4gICAgICogVHJ5IHRvIGZpbmQgTUlNRSwgdGVzdCBhbmQgcmV0dXJuIHRydXRoaW5lc3NcclxuICAgICAqIG8gPSB7XHJcbiAgICAgKiAgdXJsOiAnL3BhdGgvdG8vYW4ubXAzJyxcclxuICAgICAqICB0eXBlOiAnYXVkaW8vbXAzJ1xyXG4gICAgICogfVxyXG4gICAgICovXHJcblxyXG4gICAgaWYgKCFzbTIudXNlSFRNTDVBdWRpbyB8fCAhc20yLmhhc0hUTUw1KSB7XHJcbiAgICAgIHJldHVybiBmYWxzZTtcclxuICAgIH1cclxuXHJcbiAgICB2YXIgdXJsID0gKG8udXJsIHx8IG51bGwpLFxyXG4gICAgICAgIG1pbWUgPSAoby50eXBlIHx8IG51bGwpLFxyXG4gICAgICAgIGFGID0gc20yLmF1ZGlvRm9ybWF0cyxcclxuICAgICAgICByZXN1bHQsXHJcbiAgICAgICAgb2Zmc2V0LFxyXG4gICAgICAgIGZpbGVFeHQsXHJcbiAgICAgICAgaXRlbTtcclxuXHJcbiAgICAvLyBhY2NvdW50IGZvciBrbm93biBjYXNlcyBsaWtlIGF1ZGlvL21wM1xyXG5cclxuICAgIGlmIChtaW1lICYmIHNtMi5odG1sNVttaW1lXSAhPT0gX3VuZGVmaW5lZCkge1xyXG4gICAgICByZXR1cm4gKHNtMi5odG1sNVttaW1lXSAmJiAhcHJlZmVyRmxhc2hDaGVjayhtaW1lKSk7XHJcbiAgICB9XHJcblxyXG4gICAgaWYgKCFodG1sNUV4dCkge1xyXG4gICAgICBodG1sNUV4dCA9IFtdO1xyXG4gICAgICBmb3IgKGl0ZW0gaW4gYUYpIHtcclxuICAgICAgICBpZiAoYUYuaGFzT3duUHJvcGVydHkoaXRlbSkpIHtcclxuICAgICAgICAgIGh0bWw1RXh0LnB1c2goaXRlbSk7XHJcbiAgICAgICAgICBpZiAoYUZbaXRlbV0ucmVsYXRlZCkge1xyXG4gICAgICAgICAgICBodG1sNUV4dCA9IGh0bWw1RXh0LmNvbmNhdChhRltpdGVtXS5yZWxhdGVkKTtcclxuICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuICAgICAgaHRtbDVFeHQgPSBuZXcgUmVnRXhwKCdcXFxcLignK2h0bWw1RXh0LmpvaW4oJ3wnKSsnKShcXFxcPy4qKT8kJywnaScpO1xyXG4gICAgfVxyXG5cclxuICAgIC8vIFRPRE86IFN0cmlwIFVSTCBxdWVyaWVzLCBldGMuXHJcbiAgICBmaWxlRXh0ID0gKHVybCA/IHVybC50b0xvd2VyQ2FzZSgpLm1hdGNoKGh0bWw1RXh0KSA6IG51bGwpO1xyXG5cclxuICAgIGlmICghZmlsZUV4dCB8fCAhZmlsZUV4dC5sZW5ndGgpIHtcclxuICAgICAgaWYgKCFtaW1lKSB7XHJcbiAgICAgICAgcmVzdWx0ID0gZmFsc2U7XHJcbiAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgLy8gYXVkaW8vbXAzIC0+IG1wMywgcmVzdWx0IHNob3VsZCBiZSBrbm93blxyXG4gICAgICAgIG9mZnNldCA9IG1pbWUuaW5kZXhPZignOycpO1xyXG4gICAgICAgIC8vIHN0cmlwIFwiYXVkaW8vWDsgY29kZWNzLi4uXCJcclxuICAgICAgICBmaWxlRXh0ID0gKG9mZnNldCAhPT0gLTE/bWltZS5zdWJzdHIoMCxvZmZzZXQpOm1pbWUpLnN1YnN0cig2KTtcclxuICAgICAgfVxyXG4gICAgfSBlbHNlIHtcclxuICAgICAgLy8gbWF0Y2ggdGhlIHJhdyBleHRlbnNpb24gbmFtZSAtIFwibXAzXCIsIGZvciBleGFtcGxlXHJcbiAgICAgIGZpbGVFeHQgPSBmaWxlRXh0WzFdO1xyXG4gICAgfVxyXG5cclxuICAgIGlmIChmaWxlRXh0ICYmIHNtMi5odG1sNVtmaWxlRXh0XSAhPT0gX3VuZGVmaW5lZCkge1xyXG4gICAgICAvLyByZXN1bHQga25vd25cclxuICAgICAgcmVzdWx0ID0gKHNtMi5odG1sNVtmaWxlRXh0XSAmJiAhcHJlZmVyRmxhc2hDaGVjayhmaWxlRXh0KSk7XHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICBtaW1lID0gJ2F1ZGlvLycrZmlsZUV4dDtcclxuICAgICAgcmVzdWx0ID0gc20yLmh0bWw1LmNhblBsYXlUeXBlKHt0eXBlOm1pbWV9KTtcclxuICAgICAgc20yLmh0bWw1W2ZpbGVFeHRdID0gcmVzdWx0O1xyXG4gICAgICAvLyBzbTIuX3dEKCdjYW5QbGF5VHlwZSwgZm91bmQgcmVzdWx0OiAnICsgcmVzdWx0KTtcclxuICAgICAgcmVzdWx0ID0gKHJlc3VsdCAmJiBzbTIuaHRtbDVbbWltZV0gJiYgIXByZWZlckZsYXNoQ2hlY2sobWltZSkpO1xyXG4gICAgfVxyXG5cclxuICAgIHJldHVybiByZXN1bHQ7XHJcblxyXG4gIH07XHJcblxyXG4gIHRlc3RIVE1MNSA9IGZ1bmN0aW9uKCkge1xyXG5cclxuICAgIC8qKlxyXG4gICAgICogSW50ZXJuYWw6IEl0ZXJhdGVzIG92ZXIgYXVkaW9Gb3JtYXRzLCBkZXRlcm1pbmluZyBzdXBwb3J0IGVnLiBhdWRpby9tcDMsIGF1ZGlvL21wZWcgYW5kIHNvIG9uXHJcbiAgICAgKiBhc3NpZ25zIHJlc3VsdHMgdG8gaHRtbDVbXSBhbmQgZmxhc2hbXS5cclxuICAgICAqL1xyXG5cclxuICAgIGlmICghc20yLnVzZUhUTUw1QXVkaW8gfHwgIXNtMi5oYXNIVE1MNSkge1xyXG4gICAgICAvLyB3aXRob3V0IEhUTUw1LCB3ZSBuZWVkIEZsYXNoLlxyXG4gICAgICBzbTIuaHRtbDUudXNpbmdGbGFzaCA9IHRydWU7XHJcbiAgICAgIG5lZWRzRmxhc2ggPSB0cnVlO1xyXG4gICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICB9XHJcblxyXG4gICAgLy8gZG91YmxlLXdoYW1teTogT3BlcmEgOS42NCB0aHJvd3MgV1JPTkdfQVJHVU1FTlRTX0VSUiBpZiBubyBwYXJhbWV0ZXIgcGFzc2VkIHRvIEF1ZGlvKCksIGFuZCBXZWJraXQgKyBpT1MgaGFwcGlseSB0cmllcyB0byBsb2FkIFwibnVsbFwiIGFzIGEgVVJMLiA6L1xyXG4gICAgdmFyIGEgPSAoQXVkaW8gIT09IF91bmRlZmluZWQgPyAoaXNPcGVyYSAmJiBvcGVyYS52ZXJzaW9uKCkgPCAxMCA/IG5ldyBBdWRpbyhudWxsKSA6IG5ldyBBdWRpbygpKSA6IG51bGwpLFxyXG4gICAgICAgIGl0ZW0sIGxvb2t1cCwgc3VwcG9ydCA9IHt9LCBhRiwgaTtcclxuXHJcbiAgICBmdW5jdGlvbiBjcChtKSB7XHJcblxyXG4gICAgICB2YXIgY2FuUGxheSwgaixcclxuICAgICAgICAgIHJlc3VsdCA9IGZhbHNlLFxyXG4gICAgICAgICAgaXNPSyA9IGZhbHNlO1xyXG5cclxuICAgICAgaWYgKCFhIHx8IHR5cGVvZiBhLmNhblBsYXlUeXBlICE9PSAnZnVuY3Rpb24nKSB7XHJcbiAgICAgICAgcmV0dXJuIHJlc3VsdDtcclxuICAgICAgfVxyXG5cclxuICAgICAgaWYgKG0gaW5zdGFuY2VvZiBBcnJheSkge1xyXG4gICAgICAgIC8vIGl0ZXJhdGUgdGhyb3VnaCBhbGwgbWltZSB0eXBlcywgcmV0dXJuIGFueSBzdWNjZXNzZXNcclxuICAgICAgICBmb3IgKGk9MCwgaj1tLmxlbmd0aDsgaTxqOyBpKyspIHtcclxuICAgICAgICAgIGlmIChzbTIuaHRtbDVbbVtpXV0gfHwgYS5jYW5QbGF5VHlwZShtW2ldKS5tYXRjaChzbTIuaHRtbDVUZXN0KSkge1xyXG4gICAgICAgICAgICBpc09LID0gdHJ1ZTtcclxuICAgICAgICAgICAgc20yLmh0bWw1W21baV1dID0gdHJ1ZTtcclxuICAgICAgICAgICAgLy8gbm90ZSBmbGFzaCBzdXBwb3J0LCB0b29cclxuICAgICAgICAgICAgc20yLmZsYXNoW21baV1dID0gISEobVtpXS5tYXRjaChmbGFzaE1JTUUpKTtcclxuICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgICAgcmVzdWx0ID0gaXNPSztcclxuICAgICAgfSBlbHNlIHtcclxuICAgICAgICBjYW5QbGF5ID0gKGEgJiYgdHlwZW9mIGEuY2FuUGxheVR5cGUgPT09ICdmdW5jdGlvbicgPyBhLmNhblBsYXlUeXBlKG0pIDogZmFsc2UpO1xyXG4gICAgICAgIHJlc3VsdCA9ICEhKGNhblBsYXkgJiYgKGNhblBsYXkubWF0Y2goc20yLmh0bWw1VGVzdCkpKTtcclxuICAgICAgfVxyXG5cclxuICAgICAgcmV0dXJuIHJlc3VsdDtcclxuXHJcbiAgICB9XHJcblxyXG4gICAgLy8gdGVzdCBhbGwgcmVnaXN0ZXJlZCBmb3JtYXRzICsgY29kZWNzXHJcblxyXG4gICAgYUYgPSBzbTIuYXVkaW9Gb3JtYXRzO1xyXG5cclxuICAgIGZvciAoaXRlbSBpbiBhRikge1xyXG5cclxuICAgICAgaWYgKGFGLmhhc093blByb3BlcnR5KGl0ZW0pKSB7XHJcblxyXG4gICAgICAgIGxvb2t1cCA9ICdhdWRpby8nICsgaXRlbTtcclxuXHJcbiAgICAgICAgc3VwcG9ydFtpdGVtXSA9IGNwKGFGW2l0ZW1dLnR5cGUpO1xyXG5cclxuICAgICAgICAvLyB3cml0ZSBiYWNrIGdlbmVyaWMgdHlwZSB0b28sIGVnLiBhdWRpby9tcDNcclxuICAgICAgICBzdXBwb3J0W2xvb2t1cF0gPSBzdXBwb3J0W2l0ZW1dO1xyXG5cclxuICAgICAgICAvLyBhc3NpZ24gZmxhc2hcclxuICAgICAgICBpZiAoaXRlbS5tYXRjaChmbGFzaE1JTUUpKSB7XHJcblxyXG4gICAgICAgICAgc20yLmZsYXNoW2l0ZW1dID0gdHJ1ZTtcclxuICAgICAgICAgIHNtMi5mbGFzaFtsb29rdXBdID0gdHJ1ZTtcclxuXHJcbiAgICAgICAgfSBlbHNlIHtcclxuXHJcbiAgICAgICAgICBzbTIuZmxhc2hbaXRlbV0gPSBmYWxzZTtcclxuICAgICAgICAgIHNtMi5mbGFzaFtsb29rdXBdID0gZmFsc2U7XHJcblxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLy8gYXNzaWduIHJlc3VsdCB0byByZWxhdGVkIGZvcm1hdHMsIHRvb1xyXG5cclxuICAgICAgICBpZiAoYUZbaXRlbV0gJiYgYUZbaXRlbV0ucmVsYXRlZCkge1xyXG5cclxuICAgICAgICAgIGZvciAoaT1hRltpdGVtXS5yZWxhdGVkLmxlbmd0aC0xOyBpID49IDA7IGktLSkge1xyXG5cclxuICAgICAgICAgICAgLy8gZWcuIGF1ZGlvL200YVxyXG4gICAgICAgICAgICBzdXBwb3J0WydhdWRpby8nK2FGW2l0ZW1dLnJlbGF0ZWRbaV1dID0gc3VwcG9ydFtpdGVtXTtcclxuICAgICAgICAgICAgc20yLmh0bWw1W2FGW2l0ZW1dLnJlbGF0ZWRbaV1dID0gc3VwcG9ydFtpdGVtXTtcclxuICAgICAgICAgICAgc20yLmZsYXNoW2FGW2l0ZW1dLnJlbGF0ZWRbaV1dID0gc3VwcG9ydFtpdGVtXTtcclxuXHJcbiAgICAgICAgICB9XHJcblxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgIH1cclxuXHJcbiAgICB9XHJcblxyXG4gICAgc3VwcG9ydC5jYW5QbGF5VHlwZSA9IChhP2NwOm51bGwpO1xyXG4gICAgc20yLmh0bWw1ID0gbWl4aW4oc20yLmh0bWw1LCBzdXBwb3J0KTtcclxuXHJcbiAgICBzbTIuaHRtbDUudXNpbmdGbGFzaCA9IGZlYXR1cmVDaGVjaygpO1xyXG4gICAgbmVlZHNGbGFzaCA9IHNtMi5odG1sNS51c2luZ0ZsYXNoO1xyXG5cclxuICAgIHJldHVybiB0cnVlO1xyXG5cclxuICB9O1xyXG5cclxuICBzdHJpbmdzID0ge1xyXG5cclxuICAgIC8vIDxkPlxyXG4gICAgbm90UmVhZHk6ICdVbmF2YWlsYWJsZSAtIHdhaXQgdW50aWwgb25yZWFkeSgpIGhhcyBmaXJlZC4nLFxyXG4gICAgbm90T0s6ICdBdWRpbyBzdXBwb3J0IGlzIG5vdCBhdmFpbGFibGUuJyxcclxuICAgIGRvbUVycm9yOiBzbSArICdleGNlcHRpb24gY2F1Z2h0IHdoaWxlIGFwcGVuZGluZyBTV0YgdG8gRE9NLicsXHJcbiAgICBzcGNXbW9kZTogJ1JlbW92aW5nIHdtb2RlLCBwcmV2ZW50aW5nIGtub3duIFNXRiBsb2FkaW5nIGlzc3VlKHMpJyxcclxuICAgIHN3ZjQwNDogc21jICsgJ1ZlcmlmeSB0aGF0ICVzIGlzIGEgdmFsaWQgcGF0aC4nLFxyXG4gICAgdHJ5RGVidWc6ICdUcnkgJyArIHNtICsgJy5kZWJ1Z0ZsYXNoID0gdHJ1ZSBmb3IgbW9yZSBzZWN1cml0eSBkZXRhaWxzIChvdXRwdXQgZ29lcyB0byBTV0YuKScsXHJcbiAgICBjaGVja1NXRjogJ1NlZSBTV0Ygb3V0cHV0IGZvciBtb3JlIGRlYnVnIGluZm8uJyxcclxuICAgIGxvY2FsRmFpbDogc21jICsgJ05vbi1IVFRQIHBhZ2UgKCcgKyBkb2MubG9jYXRpb24ucHJvdG9jb2wgKyAnIFVSTD8pIFJldmlldyBGbGFzaCBwbGF5ZXIgc2VjdXJpdHkgc2V0dGluZ3MgZm9yIHRoaXMgc3BlY2lhbCBjYXNlOlxcbmh0dHA6Ly93d3cubWFjcm9tZWRpYS5jb20vc3VwcG9ydC9kb2N1bWVudGF0aW9uL2VuL2ZsYXNocGxheWVyL2hlbHAvc2V0dGluZ3NfbWFuYWdlcjA0Lmh0bWxcXG5NYXkgbmVlZCB0byBhZGQvYWxsb3cgcGF0aCwgZWcuIGM6L3NtMi8gb3IgL3VzZXJzL21lL3NtMi8nLFxyXG4gICAgd2FpdEZvY3VzOiBzbWMgKyAnU3BlY2lhbCBjYXNlOiBXYWl0aW5nIGZvciBTV0YgdG8gbG9hZCB3aXRoIHdpbmRvdyBmb2N1cy4uLicsXHJcbiAgICB3YWl0Rm9yZXZlcjogc21jICsgJ1dhaXRpbmcgaW5kZWZpbml0ZWx5IGZvciBGbGFzaCAod2lsbCByZWNvdmVyIGlmIHVuYmxvY2tlZCkuLi4nLFxyXG4gICAgd2FpdFNXRjogc21jICsgJ1dhaXRpbmcgZm9yIDEwMCUgU1dGIGxvYWQuLi4nLFxyXG4gICAgbmVlZEZ1bmN0aW9uOiBzbWMgKyAnRnVuY3Rpb24gb2JqZWN0IGV4cGVjdGVkIGZvciAlcycsXHJcbiAgICBiYWRJRDogJ1NvdW5kIElEIFwiJXNcIiBzaG91bGQgYmUgYSBzdHJpbmcsIHN0YXJ0aW5nIHdpdGggYSBub24tbnVtZXJpYyBjaGFyYWN0ZXInLFxyXG4gICAgY3VycmVudE9iajogc21jICsgJ19kZWJ1ZygpOiBDdXJyZW50IHNvdW5kIG9iamVjdHMnLFxyXG4gICAgd2FpdE9ubG9hZDogc21jICsgJ1dhaXRpbmcgZm9yIHdpbmRvdy5vbmxvYWQoKScsXHJcbiAgICBkb2NMb2FkZWQ6IHNtYyArICdEb2N1bWVudCBhbHJlYWR5IGxvYWRlZCcsXHJcbiAgICBvbmxvYWQ6IHNtYyArICdpbml0Q29tcGxldGUoKTogY2FsbGluZyBzb3VuZE1hbmFnZXIub25sb2FkKCknLFxyXG4gICAgb25sb2FkT0s6IHNtICsgJy5vbmxvYWQoKSBjb21wbGV0ZScsXHJcbiAgICBkaWRJbml0OiBzbWMgKyAnaW5pdCgpOiBBbHJlYWR5IGNhbGxlZD8nLFxyXG4gICAgc2VjTm90ZTogJ0ZsYXNoIHNlY3VyaXR5IG5vdGU6IE5ldHdvcmsvaW50ZXJuZXQgVVJMcyB3aWxsIG5vdCBsb2FkIGR1ZSB0byBzZWN1cml0eSByZXN0cmljdGlvbnMuIEFjY2VzcyBjYW4gYmUgY29uZmlndXJlZCB2aWEgRmxhc2ggUGxheWVyIEdsb2JhbCBTZWN1cml0eSBTZXR0aW5ncyBQYWdlOiBodHRwOi8vd3d3Lm1hY3JvbWVkaWEuY29tL3N1cHBvcnQvZG9jdW1lbnRhdGlvbi9lbi9mbGFzaHBsYXllci9oZWxwL3NldHRpbmdzX21hbmFnZXIwNC5odG1sJyxcclxuICAgIGJhZFJlbW92ZTogc21jICsgJ0ZhaWxlZCB0byByZW1vdmUgRmxhc2ggbm9kZS4nLFxyXG4gICAgc2h1dGRvd246IHNtICsgJy5kaXNhYmxlKCk6IFNodXR0aW5nIGRvd24nLFxyXG4gICAgcXVldWU6IHNtYyArICdRdWV1ZWluZyAlcyBoYW5kbGVyJyxcclxuICAgIHNtRXJyb3I6ICdTTVNvdW5kLmxvYWQoKTogRXhjZXB0aW9uOiBKUy1GbGFzaCBjb21tdW5pY2F0aW9uIGZhaWxlZCwgb3IgSlMgZXJyb3IuJyxcclxuICAgIGZiVGltZW91dDogJ05vIGZsYXNoIHJlc3BvbnNlLCBhcHBseWluZyAuJytzd2ZDU1Muc3dmVGltZWRvdXQrJyBDU1MuLi4nLFxyXG4gICAgZmJMb2FkZWQ6ICdGbGFzaCBsb2FkZWQnLFxyXG4gICAgZmJIYW5kbGVyOiBzbWMgKyAnZmxhc2hCbG9ja0hhbmRsZXIoKScsXHJcbiAgICBtYW5VUkw6ICdTTVNvdW5kLmxvYWQoKTogVXNpbmcgbWFudWFsbHktYXNzaWduZWQgVVJMJyxcclxuICAgIG9uVVJMOiBzbSArICcubG9hZCgpOiBjdXJyZW50IFVSTCBhbHJlYWR5IGFzc2lnbmVkLicsXHJcbiAgICBiYWRGVjogc20gKyAnLmZsYXNoVmVyc2lvbiBtdXN0IGJlIDggb3IgOS4gXCIlc1wiIGlzIGludmFsaWQuIFJldmVydGluZyB0byAlcy4nLFxyXG4gICAgYXMybG9vcDogJ05vdGU6IFNldHRpbmcgc3RyZWFtOmZhbHNlIHNvIGxvb3BpbmcgY2FuIHdvcmsgKGZsYXNoIDggbGltaXRhdGlvbiknLFxyXG4gICAgbm9OU0xvb3A6ICdOb3RlOiBMb29waW5nIG5vdCBpbXBsZW1lbnRlZCBmb3IgTW92aWVTdGFyIGZvcm1hdHMnLFxyXG4gICAgbmVlZGZsOTogJ05vdGU6IFN3aXRjaGluZyB0byBmbGFzaCA5LCByZXF1aXJlZCBmb3IgTVA0IGZvcm1hdHMuJyxcclxuICAgIG1mVGltZW91dDogJ1NldHRpbmcgZmxhc2hMb2FkVGltZW91dCA9IDAgKGluZmluaXRlKSBmb3Igb2ZmLXNjcmVlbiwgbW9iaWxlIGZsYXNoIGNhc2UnLFxyXG4gICAgbmVlZEZsYXNoOiBzbWMgKyAnRmF0YWwgZXJyb3I6IEZsYXNoIGlzIG5lZWRlZCB0byBwbGF5IHNvbWUgcmVxdWlyZWQgZm9ybWF0cywgYnV0IGlzIG5vdCBhdmFpbGFibGUuJyxcclxuICAgIGdvdEZvY3VzOiBzbWMgKyAnR290IHdpbmRvdyBmb2N1cy4nLFxyXG4gICAgcG9saWN5OiAnRW5hYmxpbmcgdXNlUG9saWN5RmlsZSBmb3IgZGF0YSBhY2Nlc3MnLFxyXG4gICAgc2V0dXA6IHNtICsgJy5zZXR1cCgpOiBhbGxvd2VkIHBhcmFtZXRlcnM6ICVzJyxcclxuICAgIHNldHVwRXJyb3I6IHNtICsgJy5zZXR1cCgpOiBcIiVzXCIgY2Fubm90IGJlIGFzc2lnbmVkIHdpdGggdGhpcyBtZXRob2QuJyxcclxuICAgIHNldHVwVW5kZWY6IHNtICsgJy5zZXR1cCgpOiBDb3VsZCBub3QgZmluZCBvcHRpb24gXCIlc1wiJyxcclxuICAgIHNldHVwTGF0ZTogc20gKyAnLnNldHVwKCk6IHVybCwgZmxhc2hWZXJzaW9uIGFuZCBodG1sNVRlc3QgcHJvcGVydHkgY2hhbmdlcyB3aWxsIG5vdCB0YWtlIGVmZmVjdCB1bnRpbCByZWJvb3QoKS4nLFxyXG4gICAgbm9VUkw6IHNtYyArICdGbGFzaCBVUkwgcmVxdWlyZWQuIENhbGwgc291bmRNYW5hZ2VyLnNldHVwKHt1cmw6Li4ufSkgdG8gZ2V0IHN0YXJ0ZWQuJyxcclxuICAgIHNtMkxvYWRlZDogJ1NvdW5kTWFuYWdlciAyOiBSZWFkeS4gJyArIFN0cmluZy5mcm9tQ2hhckNvZGUoMTAwMDMpLFxyXG4gICAgcmVzZXQ6IHNtICsgJy5yZXNldCgpOiBSZW1vdmluZyBldmVudCBjYWxsYmFja3MnLFxyXG4gICAgbW9iaWxlVUE6ICdNb2JpbGUgVUEgZGV0ZWN0ZWQsIHByZWZlcnJpbmcgSFRNTDUgYnkgZGVmYXVsdC4nLFxyXG4gICAgZ2xvYmFsSFRNTDU6ICdVc2luZyBzaW5nbGV0b24gSFRNTDUgQXVkaW8oKSBwYXR0ZXJuIGZvciB0aGlzIGRldmljZS4nXHJcbiAgICAvLyA8L2Q+XHJcblxyXG4gIH07XHJcblxyXG4gIHN0ciA9IGZ1bmN0aW9uKCkge1xyXG5cclxuICAgIC8vIGludGVybmFsIHN0cmluZyByZXBsYWNlIGhlbHBlci5cclxuICAgIC8vIGFyZ3VtZW50czogbyBbLGl0ZW1zIHRvIHJlcGxhY2VdXHJcbiAgICAvLyA8ZD5cclxuXHJcbiAgICB2YXIgYXJncyxcclxuICAgICAgICBpLCBqLCBvLFxyXG4gICAgICAgIHNzdHI7XHJcblxyXG4gICAgLy8gcmVhbCBhcnJheSwgcGxlYXNlXHJcbiAgICBhcmdzID0gc2xpY2UuY2FsbChhcmd1bWVudHMpO1xyXG5cclxuICAgIC8vIGZpcnN0IGFyZ3VtZW50XHJcbiAgICBvID0gYXJncy5zaGlmdCgpO1xyXG5cclxuICAgIHNzdHIgPSAoc3RyaW5ncyAmJiBzdHJpbmdzW29dID8gc3RyaW5nc1tvXSA6ICcnKTtcclxuXHJcbiAgICBpZiAoc3N0ciAmJiBhcmdzICYmIGFyZ3MubGVuZ3RoKSB7XHJcbiAgICAgIGZvciAoaSA9IDAsIGogPSBhcmdzLmxlbmd0aDsgaSA8IGo7IGkrKykge1xyXG4gICAgICAgIHNzdHIgPSBzc3RyLnJlcGxhY2UoJyVzJywgYXJnc1tpXSk7XHJcbiAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICByZXR1cm4gc3N0cjtcclxuICAgIC8vIDwvZD5cclxuXHJcbiAgfTtcclxuXHJcbiAgbG9vcEZpeCA9IGZ1bmN0aW9uKHNPcHQpIHtcclxuXHJcbiAgICAvLyBmbGFzaCA4IHJlcXVpcmVzIHN0cmVhbSA9IGZhbHNlIGZvciBsb29waW5nIHRvIHdvcmtcclxuICAgIGlmIChmViA9PT0gOCAmJiBzT3B0Lmxvb3BzID4gMSAmJiBzT3B0LnN0cmVhbSkge1xyXG4gICAgICBfd0RTKCdhczJsb29wJyk7XHJcbiAgICAgIHNPcHQuc3RyZWFtID0gZmFsc2U7XHJcbiAgICB9XHJcblxyXG4gICAgcmV0dXJuIHNPcHQ7XHJcblxyXG4gIH07XHJcblxyXG4gIHBvbGljeUZpeCA9IGZ1bmN0aW9uKHNPcHQsIHNQcmUpIHtcclxuXHJcbiAgICBpZiAoc09wdCAmJiAhc09wdC51c2VQb2xpY3lGaWxlICYmIChzT3B0Lm9uaWQzIHx8IHNPcHQudXNlUGVha0RhdGEgfHwgc09wdC51c2VXYXZlZm9ybURhdGEgfHwgc09wdC51c2VFUURhdGEpKSB7XHJcbiAgICAgIHNtMi5fd0QoKHNQcmUgfHwgJycpICsgc3RyKCdwb2xpY3knKSk7XHJcbiAgICAgIHNPcHQudXNlUG9saWN5RmlsZSA9IHRydWU7XHJcbiAgICB9XHJcblxyXG4gICAgcmV0dXJuIHNPcHQ7XHJcblxyXG4gIH07XHJcblxyXG4gIGNvbXBsYWluID0gZnVuY3Rpb24oc01zZykge1xyXG5cclxuICAgIC8vIDxkPlxyXG4gICAgaWYgKGhhc0NvbnNvbGUgJiYgY29uc29sZS53YXJuICE9PSBfdW5kZWZpbmVkKSB7XHJcbiAgICAgIGNvbnNvbGUud2FybihzTXNnKTtcclxuICAgIH0gZWxzZSB7XHJcbiAgICAgIHNtMi5fd0Qoc01zZyk7XHJcbiAgICB9XHJcbiAgICAvLyA8L2Q+XHJcblxyXG4gIH07XHJcblxyXG4gIGRvTm90aGluZyA9IGZ1bmN0aW9uKCkge1xyXG5cclxuICAgIHJldHVybiBmYWxzZTtcclxuXHJcbiAgfTtcclxuXHJcbiAgZGlzYWJsZU9iamVjdCA9IGZ1bmN0aW9uKG8pIHtcclxuXHJcbiAgICB2YXIgb1Byb3A7XHJcblxyXG4gICAgZm9yIChvUHJvcCBpbiBvKSB7XHJcbiAgICAgIGlmIChvLmhhc093blByb3BlcnR5KG9Qcm9wKSAmJiB0eXBlb2Ygb1tvUHJvcF0gPT09ICdmdW5jdGlvbicpIHtcclxuICAgICAgICBvW29Qcm9wXSA9IGRvTm90aGluZztcclxuICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIG9Qcm9wID0gbnVsbDtcclxuXHJcbiAgfTtcclxuXHJcbiAgZmFpbFNhZmVseSA9IGZ1bmN0aW9uKGJOb0Rpc2FibGUpIHtcclxuXHJcbiAgICAvLyBnZW5lcmFsIGZhaWx1cmUgZXhjZXB0aW9uIGhhbmRsZXJcclxuXHJcbiAgICBpZiAoYk5vRGlzYWJsZSA9PT0gX3VuZGVmaW5lZCkge1xyXG4gICAgICBiTm9EaXNhYmxlID0gZmFsc2U7XHJcbiAgICB9XHJcblxyXG4gICAgaWYgKGRpc2FibGVkIHx8IGJOb0Rpc2FibGUpIHtcclxuICAgICAgc20yLmRpc2FibGUoYk5vRGlzYWJsZSk7XHJcbiAgICB9XHJcblxyXG4gIH07XHJcblxyXG4gIG5vcm1hbGl6ZU1vdmllVVJMID0gZnVuY3Rpb24oc21VUkwpIHtcclxuXHJcbiAgICB2YXIgdXJsUGFyYW1zID0gbnVsbCwgdXJsO1xyXG5cclxuICAgIGlmIChzbVVSTCkge1xyXG4gICAgICBpZiAoc21VUkwubWF0Y2goL1xcLnN3ZihcXD8uKik/JC9pKSkge1xyXG4gICAgICAgIHVybFBhcmFtcyA9IHNtVVJMLnN1YnN0cihzbVVSTC50b0xvd2VyQ2FzZSgpLmxhc3RJbmRleE9mKCcuc3dmPycpICsgNCk7XHJcbiAgICAgICAgaWYgKHVybFBhcmFtcykge1xyXG4gICAgICAgICAgLy8gYXNzdW1lIHVzZXIga25vd3Mgd2hhdCB0aGV5J3JlIGRvaW5nXHJcbiAgICAgICAgICByZXR1cm4gc21VUkw7XHJcbiAgICAgICAgfVxyXG4gICAgICB9IGVsc2UgaWYgKHNtVVJMLmxhc3RJbmRleE9mKCcvJykgIT09IHNtVVJMLmxlbmd0aCAtIDEpIHtcclxuICAgICAgICAvLyBhcHBlbmQgdHJhaWxpbmcgc2xhc2gsIGlmIG5lZWRlZFxyXG4gICAgICAgIHNtVVJMICs9ICcvJztcclxuICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIHVybCA9IChzbVVSTCAmJiBzbVVSTC5sYXN0SW5kZXhPZignLycpICE9PSAtIDEgPyBzbVVSTC5zdWJzdHIoMCwgc21VUkwubGFzdEluZGV4T2YoJy8nKSArIDEpIDogJy4vJykgKyBzbTIubW92aWVVUkw7XHJcblxyXG4gICAgaWYgKHNtMi5ub1NXRkNhY2hlKSB7XHJcbiAgICAgIHVybCArPSAoJz90cz0nICsgbmV3IERhdGUoKS5nZXRUaW1lKCkpO1xyXG4gICAgfVxyXG5cclxuICAgIHJldHVybiB1cmw7XHJcblxyXG4gIH07XHJcblxyXG4gIHNldFZlcnNpb25JbmZvID0gZnVuY3Rpb24oKSB7XHJcblxyXG4gICAgLy8gc2hvcnQtaGFuZCBmb3IgaW50ZXJuYWwgdXNlXHJcblxyXG4gICAgZlYgPSBwYXJzZUludChzbTIuZmxhc2hWZXJzaW9uLCAxMCk7XHJcblxyXG4gICAgaWYgKGZWICE9PSA4ICYmIGZWICE9PSA5KSB7XHJcbiAgICAgIHNtMi5fd0Qoc3RyKCdiYWRGVicsIGZWLCBkZWZhdWx0Rmxhc2hWZXJzaW9uKSk7XHJcbiAgICAgIHNtMi5mbGFzaFZlcnNpb24gPSBmViA9IGRlZmF1bHRGbGFzaFZlcnNpb247XHJcbiAgICB9XHJcblxyXG4gICAgLy8gZGVidWcgZmxhc2ggbW92aWUsIGlmIGFwcGxpY2FibGVcclxuXHJcbiAgICB2YXIgaXNEZWJ1ZyA9IChzbTIuZGVidWdNb2RlIHx8IHNtMi5kZWJ1Z0ZsYXNoPydfZGVidWcuc3dmJzonLnN3ZicpO1xyXG5cclxuICAgIGlmIChzbTIudXNlSFRNTDVBdWRpbyAmJiAhc20yLmh0bWw1T25seSAmJiBzbTIuYXVkaW9Gb3JtYXRzLm1wNC5yZXF1aXJlZCAmJiBmViA8IDkpIHtcclxuICAgICAgc20yLl93RChzdHIoJ25lZWRmbDknKSk7XHJcbiAgICAgIHNtMi5mbGFzaFZlcnNpb24gPSBmViA9IDk7XHJcbiAgICB9XHJcblxyXG4gICAgc20yLnZlcnNpb24gPSBzbTIudmVyc2lvbk51bWJlciArIChzbTIuaHRtbDVPbmx5PycgKEhUTUw1LW9ubHkgbW9kZSknOihmViA9PT0gOT8nIChBUzMvRmxhc2ggOSknOicgKEFTMi9GbGFzaCA4KScpKTtcclxuXHJcbiAgICAvLyBzZXQgdXAgZGVmYXVsdCBvcHRpb25zXHJcbiAgICBpZiAoZlYgPiA4KSB7XHJcbiAgICAgIC8vICtmbGFzaCA5IGJhc2Ugb3B0aW9uc1xyXG4gICAgICBzbTIuZGVmYXVsdE9wdGlvbnMgPSBtaXhpbihzbTIuZGVmYXVsdE9wdGlvbnMsIHNtMi5mbGFzaDlPcHRpb25zKTtcclxuICAgICAgc20yLmZlYXR1cmVzLmJ1ZmZlcmluZyA9IHRydWU7XHJcbiAgICAgIC8vICttb3ZpZXN0YXIgc3VwcG9ydFxyXG4gICAgICBzbTIuZGVmYXVsdE9wdGlvbnMgPSBtaXhpbihzbTIuZGVmYXVsdE9wdGlvbnMsIHNtMi5tb3ZpZVN0YXJPcHRpb25zKTtcclxuICAgICAgc20yLmZpbGVQYXR0ZXJucy5mbGFzaDkgPSBuZXcgUmVnRXhwKCdcXFxcLihtcDN8JyArIG5ldFN0cmVhbVR5cGVzLmpvaW4oJ3wnKSArICcpKFxcXFw/LiopPyQnLCAnaScpO1xyXG4gICAgICBzbTIuZmVhdHVyZXMubW92aWVTdGFyID0gdHJ1ZTtcclxuICAgIH0gZWxzZSB7XHJcbiAgICAgIHNtMi5mZWF0dXJlcy5tb3ZpZVN0YXIgPSBmYWxzZTtcclxuICAgIH1cclxuXHJcbiAgICAvLyByZWdFeHAgZm9yIGZsYXNoIGNhblBsYXkoKSwgZXRjLlxyXG4gICAgc20yLmZpbGVQYXR0ZXJuID0gc20yLmZpbGVQYXR0ZXJuc1soZlYgIT09IDg/J2ZsYXNoOSc6J2ZsYXNoOCcpXTtcclxuXHJcbiAgICAvLyBpZiBhcHBsaWNhYmxlLCB1c2UgX2RlYnVnIHZlcnNpb25zIG9mIFNXRnNcclxuICAgIHNtMi5tb3ZpZVVSTCA9IChmViA9PT0gOD8nc291bmRtYW5hZ2VyMi5zd2YnOidzb3VuZG1hbmFnZXIyX2ZsYXNoOS5zd2YnKS5yZXBsYWNlKCcuc3dmJywgaXNEZWJ1Zyk7XHJcblxyXG4gICAgc20yLmZlYXR1cmVzLnBlYWtEYXRhID0gc20yLmZlYXR1cmVzLndhdmVmb3JtRGF0YSA9IHNtMi5mZWF0dXJlcy5lcURhdGEgPSAoZlYgPiA4KTtcclxuXHJcbiAgfTtcclxuXHJcbiAgc2V0UG9sbGluZyA9IGZ1bmN0aW9uKGJQb2xsaW5nLCBiSGlnaFBlcmZvcm1hbmNlKSB7XHJcblxyXG4gICAgaWYgKCFmbGFzaCkge1xyXG4gICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICB9XHJcblxyXG4gICAgZmxhc2guX3NldFBvbGxpbmcoYlBvbGxpbmcsIGJIaWdoUGVyZm9ybWFuY2UpO1xyXG5cclxuICB9O1xyXG5cclxuICBpbml0RGVidWcgPSBmdW5jdGlvbigpIHtcclxuXHJcbiAgICAvLyBzdGFydHMgZGVidWcgbW9kZSwgY3JlYXRpbmcgb3V0cHV0IDxkaXY+IGZvciBVQXMgd2l0aG91dCBjb25zb2xlIG9iamVjdFxyXG5cclxuICAgIC8vIGFsbG93IGZvcmNlIG9mIGRlYnVnIG1vZGUgdmlhIFVSTFxyXG4gICAgLy8gPGQ+XHJcbiAgICBpZiAoc20yLmRlYnVnVVJMUGFyYW0udGVzdCh3bCkpIHtcclxuICAgICAgc20yLmRlYnVnTW9kZSA9IHRydWU7XHJcbiAgICB9XHJcblxyXG4gICAgaWYgKGlkKHNtMi5kZWJ1Z0lEKSkge1xyXG4gICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICB9XHJcblxyXG4gICAgdmFyIG9ELCBvRGVidWcsIG9UYXJnZXQsIG9Ub2dnbGUsIHRtcDtcclxuXHJcbiAgICBpZiAoc20yLmRlYnVnTW9kZSAmJiAhaWQoc20yLmRlYnVnSUQpICYmICghaGFzQ29uc29sZSB8fCAhc20yLnVzZUNvbnNvbGUgfHwgIXNtMi5jb25zb2xlT25seSkpIHtcclxuXHJcbiAgICAgIG9EID0gZG9jLmNyZWF0ZUVsZW1lbnQoJ2RpdicpO1xyXG4gICAgICBvRC5pZCA9IHNtMi5kZWJ1Z0lEICsgJy10b2dnbGUnO1xyXG5cclxuICAgICAgb1RvZ2dsZSA9IHtcclxuICAgICAgICAncG9zaXRpb24nOiAnZml4ZWQnLFxyXG4gICAgICAgICdib3R0b20nOiAnMHB4JyxcclxuICAgICAgICAncmlnaHQnOiAnMHB4JyxcclxuICAgICAgICAnd2lkdGgnOiAnMS4yZW0nLFxyXG4gICAgICAgICdoZWlnaHQnOiAnMS4yZW0nLFxyXG4gICAgICAgICdsaW5lSGVpZ2h0JzogJzEuMmVtJyxcclxuICAgICAgICAnbWFyZ2luJzogJzJweCcsXHJcbiAgICAgICAgJ3RleHRBbGlnbic6ICdjZW50ZXInLFxyXG4gICAgICAgICdib3JkZXInOiAnMXB4IHNvbGlkICM5OTknLFxyXG4gICAgICAgICdjdXJzb3InOiAncG9pbnRlcicsXHJcbiAgICAgICAgJ2JhY2tncm91bmQnOiAnI2ZmZicsXHJcbiAgICAgICAgJ2NvbG9yJzogJyMzMzMnLFxyXG4gICAgICAgICd6SW5kZXgnOiAxMDAwMVxyXG4gICAgICB9O1xyXG5cclxuICAgICAgb0QuYXBwZW5kQ2hpbGQoZG9jLmNyZWF0ZVRleHROb2RlKCctJykpO1xyXG4gICAgICBvRC5vbmNsaWNrID0gdG9nZ2xlRGVidWc7XHJcbiAgICAgIG9ELnRpdGxlID0gJ1RvZ2dsZSBTTTIgZGVidWcgY29uc29sZSc7XHJcblxyXG4gICAgICBpZiAodWEubWF0Y2goL21zaWUgNi9pKSkge1xyXG4gICAgICAgIG9ELnN0eWxlLnBvc2l0aW9uID0gJ2Fic29sdXRlJztcclxuICAgICAgICBvRC5zdHlsZS5jdXJzb3IgPSAnaGFuZCc7XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIGZvciAodG1wIGluIG9Ub2dnbGUpIHtcclxuICAgICAgICBpZiAob1RvZ2dsZS5oYXNPd25Qcm9wZXJ0eSh0bXApKSB7XHJcbiAgICAgICAgICBvRC5zdHlsZVt0bXBdID0gb1RvZ2dsZVt0bXBdO1xyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG5cclxuICAgICAgb0RlYnVnID0gZG9jLmNyZWF0ZUVsZW1lbnQoJ2RpdicpO1xyXG4gICAgICBvRGVidWcuaWQgPSBzbTIuZGVidWdJRDtcclxuICAgICAgb0RlYnVnLnN0eWxlLmRpc3BsYXkgPSAoc20yLmRlYnVnTW9kZT8nYmxvY2snOidub25lJyk7XHJcblxyXG4gICAgICBpZiAoc20yLmRlYnVnTW9kZSAmJiAhaWQob0QuaWQpKSB7XHJcbiAgICAgICAgdHJ5IHtcclxuICAgICAgICAgIG9UYXJnZXQgPSBnZXREb2N1bWVudCgpO1xyXG4gICAgICAgICAgb1RhcmdldC5hcHBlbmRDaGlsZChvRCk7XHJcbiAgICAgICAgfSBjYXRjaChlMikge1xyXG4gICAgICAgICAgdGhyb3cgbmV3IEVycm9yKHN0cignZG9tRXJyb3InKSsnIFxcbicrZTIudG9TdHJpbmcoKSk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIG9UYXJnZXQuYXBwZW5kQ2hpbGQob0RlYnVnKTtcclxuICAgICAgfVxyXG5cclxuICAgIH1cclxuXHJcbiAgICBvVGFyZ2V0ID0gbnVsbDtcclxuICAgIC8vIDwvZD5cclxuXHJcbiAgfTtcclxuXHJcbiAgaWRDaGVjayA9IHRoaXMuZ2V0U291bmRCeUlkO1xyXG5cclxuICAvLyA8ZD5cclxuICBfd0RTID0gZnVuY3Rpb24obywgZXJyb3JMZXZlbCkge1xyXG5cclxuICAgIHJldHVybiAoIW8gPyAnJyA6IHNtMi5fd0Qoc3RyKG8pLCBlcnJvckxldmVsKSk7XHJcblxyXG4gIH07XHJcblxyXG4gIHRvZ2dsZURlYnVnID0gZnVuY3Rpb24oKSB7XHJcblxyXG4gICAgdmFyIG8gPSBpZChzbTIuZGVidWdJRCksXHJcbiAgICBvVCA9IGlkKHNtMi5kZWJ1Z0lEICsgJy10b2dnbGUnKTtcclxuXHJcbiAgICBpZiAoIW8pIHtcclxuICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgfVxyXG5cclxuICAgIGlmIChkZWJ1Z09wZW4pIHtcclxuICAgICAgLy8gbWluaW1pemVcclxuICAgICAgb1QuaW5uZXJIVE1MID0gJysnO1xyXG4gICAgICBvLnN0eWxlLmRpc3BsYXkgPSAnbm9uZSc7XHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICBvVC5pbm5lckhUTUwgPSAnLSc7XHJcbiAgICAgIG8uc3R5bGUuZGlzcGxheSA9ICdibG9jayc7XHJcbiAgICB9XHJcblxyXG4gICAgZGVidWdPcGVuID0gIWRlYnVnT3BlbjtcclxuXHJcbiAgfTtcclxuXHJcbiAgZGVidWdUUyA9IGZ1bmN0aW9uKHNFdmVudFR5cGUsIGJTdWNjZXNzLCBzTWVzc2FnZSkge1xyXG5cclxuICAgIC8vIHRyb3VibGVzaG9vdGVyIGRlYnVnIGhvb2tzXHJcblxyXG4gICAgaWYgKHdpbmRvdy5zbTJEZWJ1Z2dlciAhPT0gX3VuZGVmaW5lZCkge1xyXG4gICAgICB0cnkge1xyXG4gICAgICAgIHNtMkRlYnVnZ2VyLmhhbmRsZUV2ZW50KHNFdmVudFR5cGUsIGJTdWNjZXNzLCBzTWVzc2FnZSk7XHJcbiAgICAgIH0gY2F0Y2goZSkge1xyXG4gICAgICAgIC8vIG9oIHdlbGxcclxuICAgICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICByZXR1cm4gdHJ1ZTtcclxuXHJcbiAgfTtcclxuICAvLyA8L2Q+XHJcblxyXG4gIGdldFNXRkNTUyA9IGZ1bmN0aW9uKCkge1xyXG5cclxuICAgIHZhciBjc3MgPSBbXTtcclxuXHJcbiAgICBpZiAoc20yLmRlYnVnTW9kZSkge1xyXG4gICAgICBjc3MucHVzaChzd2ZDU1Muc20yRGVidWcpO1xyXG4gICAgfVxyXG5cclxuICAgIGlmIChzbTIuZGVidWdGbGFzaCkge1xyXG4gICAgICBjc3MucHVzaChzd2ZDU1MuZmxhc2hEZWJ1Zyk7XHJcbiAgICB9XHJcblxyXG4gICAgaWYgKHNtMi51c2VIaWdoUGVyZm9ybWFuY2UpIHtcclxuICAgICAgY3NzLnB1c2goc3dmQ1NTLmhpZ2hQZXJmKTtcclxuICAgIH1cclxuXHJcbiAgICByZXR1cm4gY3NzLmpvaW4oJyAnKTtcclxuXHJcbiAgfTtcclxuXHJcbiAgZmxhc2hCbG9ja0hhbmRsZXIgPSBmdW5jdGlvbigpIHtcclxuXHJcbiAgICAvLyAqcG9zc2libGUqIGZsYXNoIGJsb2NrIHNpdHVhdGlvbi5cclxuXHJcbiAgICB2YXIgbmFtZSA9IHN0cignZmJIYW5kbGVyJyksXHJcbiAgICAgICAgcCA9IHNtMi5nZXRNb3ZpZVBlcmNlbnQoKSxcclxuICAgICAgICBjc3MgPSBzd2ZDU1MsXHJcbiAgICAgICAgZXJyb3IgPSB7dHlwZTonRkxBU0hCTE9DSyd9O1xyXG5cclxuICAgIGlmIChzbTIuaHRtbDVPbmx5KSB7XHJcbiAgICAgIC8vIG5vIGZsYXNoLCBvciB1bnVzZWRcclxuICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgfVxyXG5cclxuICAgIGlmICghc20yLm9rKCkpIHtcclxuXHJcbiAgICAgIGlmIChuZWVkc0ZsYXNoKSB7XHJcbiAgICAgICAgLy8gbWFrZSB0aGUgbW92aWUgbW9yZSB2aXNpYmxlLCBzbyB1c2VyIGNhbiBmaXhcclxuICAgICAgICBzbTIub01DLmNsYXNzTmFtZSA9IGdldFNXRkNTUygpICsgJyAnICsgY3NzLnN3ZkRlZmF1bHQgKyAnICcgKyAocCA9PT0gbnVsbD9jc3Muc3dmVGltZWRvdXQ6Y3NzLnN3ZkVycm9yKTtcclxuICAgICAgICBzbTIuX3dEKG5hbWUgKyAnOiAnICsgc3RyKCdmYlRpbWVvdXQnKSArIChwID8gJyAoJyArIHN0cignZmJMb2FkZWQnKSArICcpJyA6ICcnKSk7XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIHNtMi5kaWRGbGFzaEJsb2NrID0gdHJ1ZTtcclxuXHJcbiAgICAgIC8vIGZpcmUgb25yZWFkeSgpLCBjb21wbGFpbiBsaWdodGx5XHJcbiAgICAgIHByb2Nlc3NPbkV2ZW50cyh7dHlwZTonb250aW1lb3V0JywgaWdub3JlSW5pdDp0cnVlLCBlcnJvcjplcnJvcn0pO1xyXG4gICAgICBjYXRjaEVycm9yKGVycm9yKTtcclxuXHJcbiAgICB9IGVsc2Uge1xyXG5cclxuICAgICAgLy8gU00yIGxvYWRlZCBPSyAob3IgcmVjb3ZlcmVkKVxyXG5cclxuICAgICAgLy8gPGQ+XHJcbiAgICAgIGlmIChzbTIuZGlkRmxhc2hCbG9jaykge1xyXG4gICAgICAgIHNtMi5fd0QobmFtZSArICc6IFVuYmxvY2tlZCcpO1xyXG4gICAgICB9XHJcbiAgICAgIC8vIDwvZD5cclxuXHJcbiAgICAgIGlmIChzbTIub01DKSB7XHJcbiAgICAgICAgc20yLm9NQy5jbGFzc05hbWUgPSBbZ2V0U1dGQ1NTKCksIGNzcy5zd2ZEZWZhdWx0LCBjc3Muc3dmTG9hZGVkICsgKHNtMi5kaWRGbGFzaEJsb2NrPycgJytjc3Muc3dmVW5ibG9ja2VkOicnKV0uam9pbignICcpO1xyXG4gICAgICB9XHJcblxyXG4gICAgfVxyXG5cclxuICB9O1xyXG5cclxuICBhZGRPbkV2ZW50ID0gZnVuY3Rpb24oc1R5cGUsIG9NZXRob2QsIG9TY29wZSkge1xyXG5cclxuICAgIGlmIChvbl9xdWV1ZVtzVHlwZV0gPT09IF91bmRlZmluZWQpIHtcclxuICAgICAgb25fcXVldWVbc1R5cGVdID0gW107XHJcbiAgICB9XHJcblxyXG4gICAgb25fcXVldWVbc1R5cGVdLnB1c2goe1xyXG4gICAgICAnbWV0aG9kJzogb01ldGhvZCxcclxuICAgICAgJ3Njb3BlJzogKG9TY29wZSB8fCBudWxsKSxcclxuICAgICAgJ2ZpcmVkJzogZmFsc2VcclxuICAgIH0pO1xyXG5cclxuICB9O1xyXG5cclxuICBwcm9jZXNzT25FdmVudHMgPSBmdW5jdGlvbihvT3B0aW9ucykge1xyXG5cclxuICAgIC8vIGlmIHVuc3BlY2lmaWVkLCBhc3N1bWUgT0svZXJyb3JcclxuXHJcbiAgICBpZiAoIW9PcHRpb25zKSB7XHJcbiAgICAgIG9PcHRpb25zID0ge1xyXG4gICAgICAgIHR5cGU6IChzbTIub2soKSA/ICdvbnJlYWR5JyA6ICdvbnRpbWVvdXQnKVxyXG4gICAgICB9O1xyXG4gICAgfVxyXG5cclxuICAgIGlmICghZGlkSW5pdCAmJiBvT3B0aW9ucyAmJiAhb09wdGlvbnMuaWdub3JlSW5pdCkge1xyXG4gICAgICAvLyBub3QgcmVhZHkgeWV0LlxyXG4gICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICB9XHJcblxyXG4gICAgaWYgKG9PcHRpb25zLnR5cGUgPT09ICdvbnRpbWVvdXQnICYmIChzbTIub2soKSB8fCAoZGlzYWJsZWQgJiYgIW9PcHRpb25zLmlnbm9yZUluaXQpKSkge1xyXG4gICAgICAvLyBpbnZhbGlkIGNhc2VcclxuICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgfVxyXG5cclxuICAgIHZhciBzdGF0dXMgPSB7XHJcbiAgICAgICAgICBzdWNjZXNzOiAob09wdGlvbnMgJiYgb09wdGlvbnMuaWdub3JlSW5pdD9zbTIub2soKTohZGlzYWJsZWQpXHJcbiAgICAgICAgfSxcclxuXHJcbiAgICAgICAgLy8gcXVldWUgc3BlY2lmaWVkIGJ5IHR5cGUsIG9yIG5vbmVcclxuICAgICAgICBzcmNRdWV1ZSA9IChvT3B0aW9ucyAmJiBvT3B0aW9ucy50eXBlP29uX3F1ZXVlW29PcHRpb25zLnR5cGVdfHxbXTpbXSksXHJcblxyXG4gICAgICAgIHF1ZXVlID0gW10sIGksIGosXHJcbiAgICAgICAgYXJncyA9IFtzdGF0dXNdLFxyXG4gICAgICAgIGNhblJldHJ5ID0gKG5lZWRzRmxhc2ggJiYgIXNtMi5vaygpKTtcclxuXHJcbiAgICBpZiAob09wdGlvbnMuZXJyb3IpIHtcclxuICAgICAgYXJnc1swXS5lcnJvciA9IG9PcHRpb25zLmVycm9yO1xyXG4gICAgfVxyXG5cclxuICAgIGZvciAoaSA9IDAsIGogPSBzcmNRdWV1ZS5sZW5ndGg7IGkgPCBqOyBpKyspIHtcclxuICAgICAgaWYgKHNyY1F1ZXVlW2ldLmZpcmVkICE9PSB0cnVlKSB7XHJcbiAgICAgICAgcXVldWUucHVzaChzcmNRdWV1ZVtpXSk7XHJcbiAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBpZiAocXVldWUubGVuZ3RoKSB7XHJcbiAgICAgIC8vIHNtMi5fd0Qoc20gKyAnOiBGaXJpbmcgJyArIHF1ZXVlLmxlbmd0aCArICcgJyArIG9PcHRpb25zLnR5cGUgKyAnKCkgaXRlbScgKyAocXVldWUubGVuZ3RoID09PSAxID8gJycgOiAncycpKTtcclxuICAgICAgZm9yIChpID0gMCwgaiA9IHF1ZXVlLmxlbmd0aDsgaSA8IGo7IGkrKykge1xyXG4gICAgICAgIGlmIChxdWV1ZVtpXS5zY29wZSkge1xyXG4gICAgICAgICAgcXVldWVbaV0ubWV0aG9kLmFwcGx5KHF1ZXVlW2ldLnNjb3BlLCBhcmdzKTtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgcXVldWVbaV0ubWV0aG9kLmFwcGx5KHRoaXMsIGFyZ3MpO1xyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAoIWNhblJldHJ5KSB7XHJcbiAgICAgICAgICAvLyB1c2VGbGFzaEJsb2NrIGFuZCBTV0YgdGltZW91dCBjYXNlIGRvZXNuJ3QgY291bnQgaGVyZS5cclxuICAgICAgICAgIHF1ZXVlW2ldLmZpcmVkID0gdHJ1ZTtcclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICByZXR1cm4gdHJ1ZTtcclxuXHJcbiAgfTtcclxuXHJcbiAgaW5pdFVzZXJPbmxvYWQgPSBmdW5jdGlvbigpIHtcclxuXHJcbiAgICB3aW5kb3cuc2V0VGltZW91dChmdW5jdGlvbigpIHtcclxuXHJcbiAgICAgIGlmIChzbTIudXNlRmxhc2hCbG9jaykge1xyXG4gICAgICAgIGZsYXNoQmxvY2tIYW5kbGVyKCk7XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIHByb2Nlc3NPbkV2ZW50cygpO1xyXG5cclxuICAgICAgLy8gY2FsbCB1c2VyLWRlZmluZWQgXCJvbmxvYWRcIiwgc2NvcGVkIHRvIHdpbmRvd1xyXG5cclxuICAgICAgaWYgKHR5cGVvZiBzbTIub25sb2FkID09PSAnZnVuY3Rpb24nKSB7XHJcbiAgICAgICAgX3dEUygnb25sb2FkJywgMSk7XHJcbiAgICAgICAgc20yLm9ubG9hZC5hcHBseSh3aW5kb3cpO1xyXG4gICAgICAgIF93RFMoJ29ubG9hZE9LJywgMSk7XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIGlmIChzbTIud2FpdEZvcldpbmRvd0xvYWQpIHtcclxuICAgICAgICBldmVudC5hZGQod2luZG93LCAnbG9hZCcsIGluaXRVc2VyT25sb2FkKTtcclxuICAgICAgfVxyXG5cclxuICAgIH0sMSk7XHJcblxyXG4gIH07XHJcblxyXG4gIGRldGVjdEZsYXNoID0gZnVuY3Rpb24oKSB7XHJcblxyXG4gICAgLy8gaGF0IHRpcDogRmxhc2ggRGV0ZWN0IGxpYnJhcnkgKEJTRCwgKEMpIDIwMDcpIGJ5IENhcmwgXCJEb2NZZXNcIiBTLiBZZXN0cmF1IC0gaHR0cDovL2ZlYXR1cmVibGVuZC5jb20vamF2YXNjcmlwdC1mbGFzaC1kZXRlY3Rpb24tbGlicmFyeS5odG1sIC8gaHR0cDovL2ZlYXR1cmVibGVuZC5jb20vbGljZW5zZS50eHRcclxuXHJcbiAgICBpZiAoaGFzRmxhc2ggIT09IF91bmRlZmluZWQpIHtcclxuICAgICAgLy8gdGhpcyB3b3JrIGhhcyBhbHJlYWR5IGJlZW4gZG9uZS5cclxuICAgICAgcmV0dXJuIGhhc0ZsYXNoO1xyXG4gICAgfVxyXG5cclxuICAgIHZhciBoYXNQbHVnaW4gPSBmYWxzZSwgbiA9IG5hdmlnYXRvciwgblAgPSBuLnBsdWdpbnMsIG9iaiwgdHlwZSwgdHlwZXMsIEFYID0gd2luZG93LkFjdGl2ZVhPYmplY3Q7XHJcblxyXG4gICAgaWYgKG5QICYmIG5QLmxlbmd0aCkge1xyXG4gICAgICB0eXBlID0gJ2FwcGxpY2F0aW9uL3gtc2hvY2t3YXZlLWZsYXNoJztcclxuICAgICAgdHlwZXMgPSBuLm1pbWVUeXBlcztcclxuICAgICAgaWYgKHR5cGVzICYmIHR5cGVzW3R5cGVdICYmIHR5cGVzW3R5cGVdLmVuYWJsZWRQbHVnaW4gJiYgdHlwZXNbdHlwZV0uZW5hYmxlZFBsdWdpbi5kZXNjcmlwdGlvbikge1xyXG4gICAgICAgIGhhc1BsdWdpbiA9IHRydWU7XHJcbiAgICAgIH1cclxuICAgIH0gZWxzZSBpZiAoQVggIT09IF91bmRlZmluZWQgJiYgIXVhLm1hdGNoKC9NU0FwcEhvc3QvaSkpIHtcclxuICAgICAgLy8gV2luZG93cyA4IFN0b3JlIEFwcHMgKE1TQXBwSG9zdCkgYXJlIHdlaXJkIChjb21wYXRpYmlsaXR5PykgYW5kIHdvbid0IGNvbXBsYWluIGhlcmUsIGJ1dCB3aWxsIGJhcmYgaWYgRmxhc2gvQWN0aXZlWCBvYmplY3QgaXMgYXBwZW5kZWQgdG8gdGhlIERPTS5cclxuICAgICAgdHJ5IHtcclxuICAgICAgICBvYmogPSBuZXcgQVgoJ1Nob2Nrd2F2ZUZsYXNoLlNob2Nrd2F2ZUZsYXNoJyk7XHJcbiAgICAgIH0gY2F0Y2goZSkge1xyXG4gICAgICAgIC8vIG9oIHdlbGxcclxuICAgICAgICBvYmogPSBudWxsO1xyXG4gICAgICB9XHJcbiAgICAgIGhhc1BsdWdpbiA9ICghIW9iaik7XHJcbiAgICAgIC8vIGNsZWFudXAsIGJlY2F1c2UgaXQgaXMgQWN0aXZlWCBhZnRlciBhbGxcclxuICAgICAgb2JqID0gbnVsbDtcclxuICAgIH1cclxuXHJcbiAgICBoYXNGbGFzaCA9IGhhc1BsdWdpbjtcclxuXHJcbiAgICByZXR1cm4gaGFzUGx1Z2luO1xyXG5cclxuICB9O1xyXG5cclxuZmVhdHVyZUNoZWNrID0gZnVuY3Rpb24oKSB7XHJcblxyXG4gICAgdmFyIGZsYXNoTmVlZGVkLFxyXG4gICAgICAgIGl0ZW0sXHJcbiAgICAgICAgZm9ybWF0cyA9IHNtMi5hdWRpb0Zvcm1hdHMsXHJcbiAgICAgICAgLy8gaVBob25lIDw9IDMuMSBoYXMgYnJva2VuIEhUTUw1IGF1ZGlvKCksIGJ1dCBmaXJtd2FyZSAzLjIgKG9yaWdpbmFsIGlQYWQpICsgaU9TNCB3b3Jrcy5cclxuICAgICAgICBpc1NwZWNpYWwgPSAoaXNfaURldmljZSAmJiAhISh1YS5tYXRjaCgvb3MgKDF8MnwzXzB8M18xKVxccy9pKSkpO1xyXG5cclxuICAgIGlmIChpc1NwZWNpYWwpIHtcclxuXHJcbiAgICAgIC8vIGhhcyBBdWRpbygpLCBidXQgaXMgYnJva2VuOyBsZXQgaXQgbG9hZCBsaW5rcyBkaXJlY3RseS5cclxuICAgICAgc20yLmhhc0hUTUw1ID0gZmFsc2U7XHJcblxyXG4gICAgICAvLyBpZ25vcmUgZmxhc2ggY2FzZSwgaG93ZXZlclxyXG4gICAgICBzbTIuaHRtbDVPbmx5ID0gdHJ1ZTtcclxuXHJcbiAgICAgIC8vIGhpZGUgdGhlIFNXRiwgaWYgcHJlc2VudFxyXG4gICAgICBpZiAoc20yLm9NQykge1xyXG4gICAgICAgIHNtMi5vTUMuc3R5bGUuZGlzcGxheSA9ICdub25lJztcclxuICAgICAgfVxyXG5cclxuICAgIH0gZWxzZSB7XHJcblxyXG4gICAgICBpZiAoc20yLnVzZUhUTUw1QXVkaW8pIHtcclxuXHJcbiAgICAgICAgaWYgKCFzbTIuaHRtbDUgfHwgIXNtMi5odG1sNS5jYW5QbGF5VHlwZSkge1xyXG4gICAgICAgICAgc20yLl93RCgnU291bmRNYW5hZ2VyOiBObyBIVE1MNSBBdWRpbygpIHN1cHBvcnQgZGV0ZWN0ZWQuJyk7XHJcbiAgICAgICAgICBzbTIuaGFzSFRNTDUgPSBmYWxzZTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8vIDxkPlxyXG4gICAgICAgIGlmIChpc0JhZFNhZmFyaSkge1xyXG4gICAgICAgICAgc20yLl93RChzbWMgKyAnTm90ZTogQnVnZ3kgSFRNTDUgQXVkaW8gaW4gU2FmYXJpIG9uIHRoaXMgT1MgWCByZWxlYXNlLCBzZWUgaHR0cHM6Ly9idWdzLndlYmtpdC5vcmcvc2hvd19idWcuY2dpP2lkPTMyMTU5IC0gJyArICghaGFzRmxhc2ggPycgd291bGQgdXNlIGZsYXNoIGZhbGxiYWNrIGZvciBNUDMvTVA0LCBidXQgbm9uZSBkZXRlY3RlZC4nIDogJ3dpbGwgdXNlIGZsYXNoIGZhbGxiYWNrIGZvciBNUDMvTVA0LCBpZiBhdmFpbGFibGUnKSwgMSk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIC8vIDwvZD5cclxuXHJcbiAgICAgIH1cclxuXHJcbiAgICB9XHJcblxyXG4gICAgaWYgKHNtMi51c2VIVE1MNUF1ZGlvICYmIHNtMi5oYXNIVE1MNSkge1xyXG5cclxuICAgICAgLy8gc29ydCBvdXQgd2hldGhlciBmbGFzaCBpcyBvcHRpb25hbCwgcmVxdWlyZWQgb3IgY2FuIGJlIGlnbm9yZWQuXHJcblxyXG4gICAgICAvLyBpbm5vY2VudCB1bnRpbCBwcm92ZW4gZ3VpbHR5LlxyXG4gICAgICBjYW5JZ25vcmVGbGFzaCA9IHRydWU7XHJcblxyXG4gICAgICBmb3IgKGl0ZW0gaW4gZm9ybWF0cykge1xyXG4gICAgICAgIGlmIChmb3JtYXRzLmhhc093blByb3BlcnR5KGl0ZW0pKSB7XHJcbiAgICAgICAgICBpZiAoZm9ybWF0c1tpdGVtXS5yZXF1aXJlZCkge1xyXG4gICAgICAgICAgICBpZiAoIXNtMi5odG1sNS5jYW5QbGF5VHlwZShmb3JtYXRzW2l0ZW1dLnR5cGUpKSB7XHJcbiAgICAgICAgICAgICAgLy8gMTAwJSBIVE1MNSBtb2RlIGlzIG5vdCBwb3NzaWJsZS5cclxuICAgICAgICAgICAgICBjYW5JZ25vcmVGbGFzaCA9IGZhbHNlO1xyXG4gICAgICAgICAgICAgIGZsYXNoTmVlZGVkID0gdHJ1ZTtcclxuICAgICAgICAgICAgfSBlbHNlIGlmIChzbTIucHJlZmVyRmxhc2ggJiYgKHNtMi5mbGFzaFtpdGVtXSB8fCBzbTIuZmxhc2hbZm9ybWF0c1tpdGVtXS50eXBlXSkpIHtcclxuICAgICAgICAgICAgICAvLyBmbGFzaCBtYXkgYmUgcmVxdWlyZWQsIG9yIHByZWZlcnJlZCBmb3IgdGhpcyBmb3JtYXQuXHJcbiAgICAgICAgICAgICAgZmxhc2hOZWVkZWQgPSB0cnVlO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcblxyXG4gICAgfVxyXG5cclxuICAgIC8vIHNhbml0eSBjaGVjay4uLlxyXG4gICAgaWYgKHNtMi5pZ25vcmVGbGFzaCkge1xyXG4gICAgICBmbGFzaE5lZWRlZCA9IGZhbHNlO1xyXG4gICAgICBjYW5JZ25vcmVGbGFzaCA9IHRydWU7XHJcbiAgICB9XHJcblxyXG4gICAgc20yLmh0bWw1T25seSA9IChzbTIuaGFzSFRNTDUgJiYgc20yLnVzZUhUTUw1QXVkaW8gJiYgIWZsYXNoTmVlZGVkKTtcclxuXHJcbiAgICByZXR1cm4gKCFzbTIuaHRtbDVPbmx5KTtcclxuXHJcbiAgfTtcclxuXHJcbiAgcGFyc2VVUkwgPSBmdW5jdGlvbih1cmwpIHtcclxuXHJcbiAgICAvKipcclxuICAgICAqIEludGVybmFsOiBGaW5kcyBhbmQgcmV0dXJucyB0aGUgZmlyc3QgcGxheWFibGUgVVJMIChvciBmYWlsaW5nIHRoYXQsIHRoZSBmaXJzdCBVUkwuKVxyXG4gICAgICogQHBhcmFtIHtzdHJpbmcgb3IgYXJyYXl9IHVybCBBIHNpbmdsZSBVUkwgc3RyaW5nLCBPUiwgYW4gYXJyYXkgb2YgVVJMIHN0cmluZ3Mgb3Ige3VybDonL3BhdGgvdG8vcmVzb3VyY2UnLCB0eXBlOidhdWRpby9tcDMnfSBvYmplY3RzLlxyXG4gICAgICovXHJcblxyXG4gICAgdmFyIGksIGosIHVybFJlc3VsdCA9IDAsIHJlc3VsdDtcclxuXHJcbiAgICBpZiAodXJsIGluc3RhbmNlb2YgQXJyYXkpIHtcclxuXHJcbiAgICAgIC8vIGZpbmQgdGhlIGZpcnN0IGdvb2Qgb25lXHJcbiAgICAgIGZvciAoaT0wLCBqPXVybC5sZW5ndGg7IGk8ajsgaSsrKSB7XHJcblxyXG4gICAgICAgIGlmICh1cmxbaV0gaW5zdGFuY2VvZiBPYmplY3QpIHtcclxuICAgICAgICAgIC8vIE1JTUUgY2hlY2tcclxuICAgICAgICAgIGlmIChzbTIuY2FuUGxheU1JTUUodXJsW2ldLnR5cGUpKSB7XHJcbiAgICAgICAgICAgIHVybFJlc3VsdCA9IGk7XHJcbiAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgfVxyXG5cclxuICAgICAgICB9IGVsc2UgaWYgKHNtMi5jYW5QbGF5VVJMKHVybFtpXSkpIHtcclxuICAgICAgICAgIC8vIFVSTCBzdHJpbmcgY2hlY2tcclxuICAgICAgICAgIHVybFJlc3VsdCA9IGk7XHJcbiAgICAgICAgICBicmVhaztcclxuICAgICAgICB9XHJcblxyXG4gICAgICB9XHJcblxyXG4gICAgICAvLyBub3JtYWxpemUgdG8gc3RyaW5nXHJcbiAgICAgIGlmICh1cmxbdXJsUmVzdWx0XS51cmwpIHtcclxuICAgICAgICB1cmxbdXJsUmVzdWx0XSA9IHVybFt1cmxSZXN1bHRdLnVybDtcclxuICAgICAgfVxyXG5cclxuICAgICAgcmVzdWx0ID0gdXJsW3VybFJlc3VsdF07XHJcblxyXG4gICAgfSBlbHNlIHtcclxuXHJcbiAgICAgIC8vIHNpbmdsZSBVUkwgY2FzZVxyXG4gICAgICByZXN1bHQgPSB1cmw7XHJcblxyXG4gICAgfVxyXG5cclxuICAgIHJldHVybiByZXN1bHQ7XHJcblxyXG4gIH07XHJcblxyXG5cclxuICBzdGFydFRpbWVyID0gZnVuY3Rpb24ob1NvdW5kKSB7XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBhdHRhY2ggYSB0aW1lciB0byB0aGlzIHNvdW5kLCBhbmQgc3RhcnQgYW4gaW50ZXJ2YWwgaWYgbmVlZGVkXHJcbiAgICAgKi9cclxuXHJcbiAgICBpZiAoIW9Tb3VuZC5faGFzVGltZXIpIHtcclxuXHJcbiAgICAgIG9Tb3VuZC5faGFzVGltZXIgPSB0cnVlO1xyXG5cclxuICAgICAgaWYgKCFtb2JpbGVIVE1MNSAmJiBzbTIuaHRtbDVQb2xsaW5nSW50ZXJ2YWwpIHtcclxuXHJcbiAgICAgICAgaWYgKGg1SW50ZXJ2YWxUaW1lciA9PT0gbnVsbCAmJiBoNVRpbWVyQ291bnQgPT09IDApIHtcclxuXHJcbiAgICAgICAgICBoNUludGVydmFsVGltZXIgPSBzZXRJbnRlcnZhbCh0aW1lckV4ZWN1dGUsIHNtMi5odG1sNVBvbGxpbmdJbnRlcnZhbCk7XHJcblxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgaDVUaW1lckNvdW50Kys7XHJcblxyXG4gICAgICB9XHJcblxyXG4gICAgfVxyXG5cclxuICB9O1xyXG5cclxuICBzdG9wVGltZXIgPSBmdW5jdGlvbihvU291bmQpIHtcclxuXHJcbiAgICAvKipcclxuICAgICAqIGRldGFjaCBhIHRpbWVyXHJcbiAgICAgKi9cclxuXHJcbiAgICBpZiAob1NvdW5kLl9oYXNUaW1lcikge1xyXG5cclxuICAgICAgb1NvdW5kLl9oYXNUaW1lciA9IGZhbHNlO1xyXG5cclxuICAgICAgaWYgKCFtb2JpbGVIVE1MNSAmJiBzbTIuaHRtbDVQb2xsaW5nSW50ZXJ2YWwpIHtcclxuXHJcbiAgICAgICAgLy8gaW50ZXJ2YWwgd2lsbCBzdG9wIGl0c2VsZiBhdCBuZXh0IGV4ZWN1dGlvbi5cclxuXHJcbiAgICAgICAgaDVUaW1lckNvdW50LS07XHJcblxyXG4gICAgICB9XHJcblxyXG4gICAgfVxyXG5cclxuICB9O1xyXG5cclxuICB0aW1lckV4ZWN1dGUgPSBmdW5jdGlvbigpIHtcclxuXHJcbiAgICAvKipcclxuICAgICAqIG1hbnVhbCBwb2xsaW5nIGZvciBIVE1MNSBwcm9ncmVzcyBldmVudHMsIGllLiwgd2hpbGVwbGF5aW5nKCkgKGNhbiBhY2hpZXZlIGdyZWF0ZXIgcHJlY2lzaW9uIHRoYW4gY29uc2VydmF0aXZlIGRlZmF1bHQgSFRNTDUgaW50ZXJ2YWwpXHJcbiAgICAgKi9cclxuXHJcbiAgICB2YXIgaTtcclxuXHJcbiAgICBpZiAoaDVJbnRlcnZhbFRpbWVyICE9PSBudWxsICYmICFoNVRpbWVyQ291bnQpIHtcclxuXHJcbiAgICAgIC8vIG5vIGFjdGl2ZSB0aW1lcnMsIHN0b3AgcG9sbGluZyBpbnRlcnZhbC5cclxuXHJcbiAgICAgIGNsZWFySW50ZXJ2YWwoaDVJbnRlcnZhbFRpbWVyKTtcclxuXHJcbiAgICAgIGg1SW50ZXJ2YWxUaW1lciA9IG51bGw7XHJcblxyXG4gICAgICByZXR1cm4gZmFsc2U7XHJcblxyXG4gICAgfVxyXG5cclxuICAgIC8vIGNoZWNrIGFsbCBIVE1MNSBzb3VuZHMgd2l0aCB0aW1lcnNcclxuXHJcbiAgICBmb3IgKGkgPSBzbTIuc291bmRJRHMubGVuZ3RoLTE7IGkgPj0gMDsgaS0tKSB7XHJcblxyXG4gICAgICBpZiAoc20yLnNvdW5kc1tzbTIuc291bmRJRHNbaV1dLmlzSFRNTDUgJiYgc20yLnNvdW5kc1tzbTIuc291bmRJRHNbaV1dLl9oYXNUaW1lcikge1xyXG5cclxuICAgICAgICBzbTIuc291bmRzW3NtMi5zb3VuZElEc1tpXV0uX29uVGltZXIoKTtcclxuXHJcbiAgICAgIH1cclxuXHJcbiAgICB9XHJcblxyXG4gIH07XHJcblxyXG4gIGNhdGNoRXJyb3IgPSBmdW5jdGlvbihvcHRpb25zKSB7XHJcblxyXG4gICAgb3B0aW9ucyA9IChvcHRpb25zICE9PSBfdW5kZWZpbmVkID8gb3B0aW9ucyA6IHt9KTtcclxuXHJcbiAgICBpZiAodHlwZW9mIHNtMi5vbmVycm9yID09PSAnZnVuY3Rpb24nKSB7XHJcbiAgICAgIHNtMi5vbmVycm9yLmFwcGx5KHdpbmRvdywgW3t0eXBlOihvcHRpb25zLnR5cGUgIT09IF91bmRlZmluZWQgPyBvcHRpb25zLnR5cGUgOiBudWxsKX1dKTtcclxuICAgIH1cclxuXHJcbiAgICBpZiAob3B0aW9ucy5mYXRhbCAhPT0gX3VuZGVmaW5lZCAmJiBvcHRpb25zLmZhdGFsKSB7XHJcbiAgICAgIHNtMi5kaXNhYmxlKCk7XHJcbiAgICB9XHJcblxyXG4gIH07XHJcblxyXG4gIGJhZFNhZmFyaUZpeCA9IGZ1bmN0aW9uKCkge1xyXG5cclxuICAgIC8vIHNwZWNpYWwgY2FzZTogXCJiYWRcIiBTYWZhcmkgKE9TIFggMTAuMyAtIDEwLjcpIG11c3QgZmFsbCBiYWNrIHRvIGZsYXNoIGZvciBNUDMvTVA0XHJcbiAgICBpZiAoIWlzQmFkU2FmYXJpIHx8ICFkZXRlY3RGbGFzaCgpKSB7XHJcbiAgICAgIC8vIGRvZXNuJ3QgYXBwbHlcclxuICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgfVxyXG5cclxuICAgIHZhciBhRiA9IHNtMi5hdWRpb0Zvcm1hdHMsIGksIGl0ZW07XHJcblxyXG4gICAgZm9yIChpdGVtIGluIGFGKSB7XHJcbiAgICAgIGlmIChhRi5oYXNPd25Qcm9wZXJ0eShpdGVtKSkge1xyXG4gICAgICAgIGlmIChpdGVtID09PSAnbXAzJyB8fCBpdGVtID09PSAnbXA0Jykge1xyXG4gICAgICAgICAgc20yLl93RChzbSArICc6IFVzaW5nIGZsYXNoIGZhbGxiYWNrIGZvciAnICsgaXRlbSArICcgZm9ybWF0Jyk7XHJcbiAgICAgICAgICBzbTIuaHRtbDVbaXRlbV0gPSBmYWxzZTtcclxuICAgICAgICAgIC8vIGFzc2lnbiByZXN1bHQgdG8gcmVsYXRlZCBmb3JtYXRzLCB0b29cclxuICAgICAgICAgIGlmIChhRltpdGVtXSAmJiBhRltpdGVtXS5yZWxhdGVkKSB7XHJcbiAgICAgICAgICAgIGZvciAoaSA9IGFGW2l0ZW1dLnJlbGF0ZWQubGVuZ3RoLTE7IGkgPj0gMDsgaS0tKSB7XHJcbiAgICAgICAgICAgICAgc20yLmh0bWw1W2FGW2l0ZW1dLnJlbGF0ZWRbaV1dID0gZmFsc2U7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgfTtcclxuXHJcbiAgLyoqXHJcbiAgICogUHNldWRvLXByaXZhdGUgZmxhc2gvRXh0ZXJuYWxJbnRlcmZhY2UgbWV0aG9kc1xyXG4gICAqIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cclxuICAgKi9cclxuXHJcbiAgdGhpcy5fc2V0U2FuZGJveFR5cGUgPSBmdW5jdGlvbihzYW5kYm94VHlwZSkge1xyXG5cclxuICAgIC8vIDxkPlxyXG4gICAgdmFyIHNiID0gc20yLnNhbmRib3g7XHJcblxyXG4gICAgc2IudHlwZSA9IHNhbmRib3hUeXBlO1xyXG4gICAgc2IuZGVzY3JpcHRpb24gPSBzYi50eXBlc1soc2IudHlwZXNbc2FuZGJveFR5cGVdICE9PSBfdW5kZWZpbmVkP3NhbmRib3hUeXBlOid1bmtub3duJyldO1xyXG5cclxuICAgIGlmIChzYi50eXBlID09PSAnbG9jYWxXaXRoRmlsZScpIHtcclxuXHJcbiAgICAgIHNiLm5vUmVtb3RlID0gdHJ1ZTtcclxuICAgICAgc2Iubm9Mb2NhbCA9IGZhbHNlO1xyXG4gICAgICBfd0RTKCdzZWNOb3RlJywgMik7XHJcblxyXG4gICAgfSBlbHNlIGlmIChzYi50eXBlID09PSAnbG9jYWxXaXRoTmV0d29yaycpIHtcclxuXHJcbiAgICAgIHNiLm5vUmVtb3RlID0gZmFsc2U7XHJcbiAgICAgIHNiLm5vTG9jYWwgPSB0cnVlO1xyXG5cclxuICAgIH0gZWxzZSBpZiAoc2IudHlwZSA9PT0gJ2xvY2FsVHJ1c3RlZCcpIHtcclxuXHJcbiAgICAgIHNiLm5vUmVtb3RlID0gZmFsc2U7XHJcbiAgICAgIHNiLm5vTG9jYWwgPSBmYWxzZTtcclxuXHJcbiAgICB9XHJcbiAgICAvLyA8L2Q+XHJcblxyXG4gIH07XHJcblxyXG4gIHRoaXMuX2V4dGVybmFsSW50ZXJmYWNlT0sgPSBmdW5jdGlvbihzd2ZWZXJzaW9uKSB7XHJcblxyXG4gICAgLy8gZmxhc2ggY2FsbGJhY2sgY29uZmlybWluZyBmbGFzaCBsb2FkZWQsIEVJIHdvcmtpbmcgZXRjLlxyXG4gICAgLy8gc3dmVmVyc2lvbjogU1dGIGJ1aWxkIHN0cmluZ1xyXG5cclxuICAgIGlmIChzbTIuc3dmTG9hZGVkKSB7XHJcbiAgICAgIHJldHVybiBmYWxzZTtcclxuICAgIH1cclxuXHJcbiAgICB2YXIgZTtcclxuXHJcbiAgICBkZWJ1Z1RTKCdzd2YnLCB0cnVlKTtcclxuICAgIGRlYnVnVFMoJ2ZsYXNodG9qcycsIHRydWUpO1xyXG4gICAgc20yLnN3ZkxvYWRlZCA9IHRydWU7XHJcbiAgICB0cnlJbml0T25Gb2N1cyA9IGZhbHNlO1xyXG5cclxuICAgIGlmIChpc0JhZFNhZmFyaSkge1xyXG4gICAgICBiYWRTYWZhcmlGaXgoKTtcclxuICAgIH1cclxuXHJcbiAgICAvLyBjb21wbGFpbiBpZiBKUyArIFNXRiBidWlsZC92ZXJzaW9uIHN0cmluZ3MgZG9uJ3QgbWF0Y2gsIGV4Y2x1ZGluZyArREVWIGJ1aWxkc1xyXG4gICAgLy8gPGQ+XHJcbiAgICBpZiAoIXN3ZlZlcnNpb24gfHwgc3dmVmVyc2lvbi5yZXBsYWNlKC9cXCtkZXYvaSwnJykgIT09IHNtMi52ZXJzaW9uTnVtYmVyLnJlcGxhY2UoL1xcK2Rldi9pLCAnJykpIHtcclxuXHJcbiAgICAgIGUgPSBzbSArICc6IEZhdGFsOiBKYXZhU2NyaXB0IGZpbGUgYnVpbGQgXCInICsgc20yLnZlcnNpb25OdW1iZXIgKyAnXCIgZG9lcyBub3QgbWF0Y2ggRmxhc2ggU1dGIGJ1aWxkIFwiJyArIHN3ZlZlcnNpb24gKyAnXCIgYXQgJyArIHNtMi51cmwgKyAnLiBFbnN1cmUgYm90aCBhcmUgdXAtdG8tZGF0ZS4nO1xyXG5cclxuICAgICAgLy8gZXNjYXBlIGZsYXNoIC0+IEpTIHN0YWNrIHNvIHRoaXMgZXJyb3IgZmlyZXMgaW4gd2luZG93LlxyXG4gICAgICBzZXRUaW1lb3V0KGZ1bmN0aW9uIHZlcnNpb25NaXNtYXRjaCgpIHtcclxuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoZSk7XHJcbiAgICAgIH0sIDApO1xyXG5cclxuICAgICAgLy8gZXhpdCwgaW5pdCB3aWxsIGZhaWwgd2l0aCB0aW1lb3V0XHJcbiAgICAgIHJldHVybiBmYWxzZTtcclxuXHJcbiAgICB9XHJcbiAgICAvLyA8L2Q+XHJcblxyXG4gICAgLy8gSUUgbmVlZHMgYSBsYXJnZXIgdGltZW91dFxyXG4gICAgc2V0VGltZW91dChpbml0LCBpc0lFID8gMTAwIDogMSk7XHJcblxyXG4gIH07XHJcblxyXG4gIC8qKlxyXG4gICAqIFByaXZhdGUgaW5pdGlhbGl6YXRpb24gaGVscGVyc1xyXG4gICAqIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxyXG4gICAqL1xyXG5cclxuICBjcmVhdGVNb3ZpZSA9IGZ1bmN0aW9uKHNtSUQsIHNtVVJMKSB7XHJcblxyXG4gICAgaWYgKGRpZEFwcGVuZCAmJiBhcHBlbmRTdWNjZXNzKSB7XHJcbiAgICAgIC8vIGlnbm9yZSBpZiBhbHJlYWR5IHN1Y2NlZWRlZFxyXG4gICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICB9XHJcblxyXG4gICAgZnVuY3Rpb24gaW5pdE1zZygpIHtcclxuXHJcbiAgICAgIC8vIDxkPlxyXG5cclxuICAgICAgdmFyIG9wdGlvbnMgPSBbXSxcclxuICAgICAgICAgIHRpdGxlLFxyXG4gICAgICAgICAgbXNnID0gW10sXHJcbiAgICAgICAgICBkZWxpbWl0ZXIgPSAnICsgJztcclxuXHJcbiAgICAgIHRpdGxlID0gJ1NvdW5kTWFuYWdlciAnICsgc20yLnZlcnNpb24gKyAoIXNtMi5odG1sNU9ubHkgJiYgc20yLnVzZUhUTUw1QXVkaW8gPyAoc20yLmhhc0hUTUw1ID8gJyArIEhUTUw1IGF1ZGlvJyA6ICcsIG5vIEhUTUw1IGF1ZGlvIHN1cHBvcnQnKSA6ICcnKTtcclxuXHJcbiAgICAgIGlmICghc20yLmh0bWw1T25seSkge1xyXG5cclxuICAgICAgICBpZiAoc20yLnByZWZlckZsYXNoKSB7XHJcbiAgICAgICAgICBvcHRpb25zLnB1c2goJ3ByZWZlckZsYXNoJyk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBpZiAoc20yLnVzZUhpZ2hQZXJmb3JtYW5jZSkge1xyXG4gICAgICAgICAgb3B0aW9ucy5wdXNoKCd1c2VIaWdoUGVyZm9ybWFuY2UnKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGlmIChzbTIuZmxhc2hQb2xsaW5nSW50ZXJ2YWwpIHtcclxuICAgICAgICAgIG9wdGlvbnMucHVzaCgnZmxhc2hQb2xsaW5nSW50ZXJ2YWwgKCcgKyBzbTIuZmxhc2hQb2xsaW5nSW50ZXJ2YWwgKyAnbXMpJyk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBpZiAoc20yLmh0bWw1UG9sbGluZ0ludGVydmFsKSB7XHJcbiAgICAgICAgICBvcHRpb25zLnB1c2goJ2h0bWw1UG9sbGluZ0ludGVydmFsICgnICsgc20yLmh0bWw1UG9sbGluZ0ludGVydmFsICsgJ21zKScpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgaWYgKHNtMi53bW9kZSkge1xyXG4gICAgICAgICAgb3B0aW9ucy5wdXNoKCd3bW9kZSAoJyArIHNtMi53bW9kZSArICcpJyk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBpZiAoc20yLmRlYnVnRmxhc2gpIHtcclxuICAgICAgICAgIG9wdGlvbnMucHVzaCgnZGVidWdGbGFzaCcpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgaWYgKHNtMi51c2VGbGFzaEJsb2NrKSB7XHJcbiAgICAgICAgICBvcHRpb25zLnB1c2goJ2ZsYXNoQmxvY2snKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICB9IGVsc2Uge1xyXG5cclxuICAgICAgICBpZiAoc20yLmh0bWw1UG9sbGluZ0ludGVydmFsKSB7XHJcbiAgICAgICAgICBvcHRpb25zLnB1c2goJ2h0bWw1UG9sbGluZ0ludGVydmFsICgnICsgc20yLmh0bWw1UG9sbGluZ0ludGVydmFsICsgJ21zKScpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgIH1cclxuXHJcbiAgICAgIGlmIChvcHRpb25zLmxlbmd0aCkge1xyXG4gICAgICAgIG1zZyA9IG1zZy5jb25jYXQoW29wdGlvbnMuam9pbihkZWxpbWl0ZXIpXSk7XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIHNtMi5fd0QodGl0bGUgKyAobXNnLmxlbmd0aCA/IGRlbGltaXRlciArIG1zZy5qb2luKCcsICcpIDogJycpLCAxKTtcclxuXHJcbiAgICAgIHNob3dTdXBwb3J0KCk7XHJcblxyXG4gICAgICAvLyA8L2Q+XHJcblxyXG4gICAgfVxyXG5cclxuICAgIGlmIChzbTIuaHRtbDVPbmx5KSB7XHJcblxyXG4gICAgICAvLyAxMDAlIEhUTUw1IG1vZGVcclxuICAgICAgc2V0VmVyc2lvbkluZm8oKTtcclxuXHJcbiAgICAgIGluaXRNc2coKTtcclxuICAgICAgc20yLm9NQyA9IGlkKHNtMi5tb3ZpZUlEKTtcclxuICAgICAgaW5pdCgpO1xyXG5cclxuICAgICAgLy8gcHJldmVudCBtdWx0aXBsZSBpbml0IGF0dGVtcHRzXHJcbiAgICAgIGRpZEFwcGVuZCA9IHRydWU7XHJcblxyXG4gICAgICBhcHBlbmRTdWNjZXNzID0gdHJ1ZTtcclxuXHJcbiAgICAgIHJldHVybiBmYWxzZTtcclxuXHJcbiAgICB9XHJcblxyXG4gICAgLy8gZmxhc2ggcGF0aFxyXG4gICAgdmFyIHJlbW90ZVVSTCA9IChzbVVSTCB8fCBzbTIudXJsKSxcclxuICAgIGxvY2FsVVJMID0gKHNtMi5hbHRVUkwgfHwgcmVtb3RlVVJMKSxcclxuICAgIHN3ZlRpdGxlID0gJ0pTL0ZsYXNoIGF1ZGlvIGNvbXBvbmVudCAoU291bmRNYW5hZ2VyIDIpJyxcclxuICAgIG9UYXJnZXQgPSBnZXREb2N1bWVudCgpLFxyXG4gICAgZXh0cmFDbGFzcyA9IGdldFNXRkNTUygpLFxyXG4gICAgaXNSVEwgPSBudWxsLFxyXG4gICAgaHRtbCA9IGRvYy5nZXRFbGVtZW50c0J5VGFnTmFtZSgnaHRtbCcpWzBdLFxyXG4gICAgb0VtYmVkLCBvTW92aWUsIHRtcCwgbW92aWVIVE1MLCBvRWwsIHMsIHgsIHNDbGFzcztcclxuXHJcbiAgICBpc1JUTCA9IChodG1sICYmIGh0bWwuZGlyICYmIGh0bWwuZGlyLm1hdGNoKC9ydGwvaSkpO1xyXG4gICAgc21JRCA9IChzbUlEID09PSBfdW5kZWZpbmVkP3NtMi5pZDpzbUlEKTtcclxuXHJcbiAgICBmdW5jdGlvbiBwYXJhbShuYW1lLCB2YWx1ZSkge1xyXG4gICAgICByZXR1cm4gJzxwYXJhbSBuYW1lPVwiJytuYW1lKydcIiB2YWx1ZT1cIicrdmFsdWUrJ1wiIC8+JztcclxuICAgIH1cclxuXHJcbiAgICAvLyBzYWZldHkgY2hlY2sgZm9yIGxlZ2FjeSAoY2hhbmdlIHRvIEZsYXNoIDkgVVJMKVxyXG4gICAgc2V0VmVyc2lvbkluZm8oKTtcclxuICAgIHNtMi51cmwgPSBub3JtYWxpemVNb3ZpZVVSTChvdmVySFRUUD9yZW1vdGVVUkw6bG9jYWxVUkwpO1xyXG4gICAgc21VUkwgPSBzbTIudXJsO1xyXG5cclxuICAgIHNtMi53bW9kZSA9ICghc20yLndtb2RlICYmIHNtMi51c2VIaWdoUGVyZm9ybWFuY2UgPyAndHJhbnNwYXJlbnQnIDogc20yLndtb2RlKTtcclxuXHJcbiAgICBpZiAoc20yLndtb2RlICE9PSBudWxsICYmICh1YS5tYXRjaCgvbXNpZSA4L2kpIHx8ICghaXNJRSAmJiAhc20yLnVzZUhpZ2hQZXJmb3JtYW5jZSkpICYmIG5hdmlnYXRvci5wbGF0Zm9ybS5tYXRjaCgvd2luMzJ8d2luNjQvaSkpIHtcclxuICAgICAgLyoqXHJcbiAgICAgICAqIGV4dHJhLXNwZWNpYWwgY2FzZTogbW92aWUgZG9lc24ndCBsb2FkIHVudGlsIHNjcm9sbGVkIGludG8gdmlldyB3aGVuIHVzaW5nIHdtb2RlID0gYW55dGhpbmcgYnV0ICd3aW5kb3cnIGhlcmVcclxuICAgICAgICogZG9lcyBub3QgYXBwbHkgd2hlbiB1c2luZyBoaWdoIHBlcmZvcm1hbmNlIChwb3NpdGlvbjpmaXhlZCBtZWFucyBvbi1zY3JlZW4pLCBPUiBpbmZpbml0ZSBmbGFzaCBsb2FkIHRpbWVvdXRcclxuICAgICAgICogd21vZGUgYnJlYWtzIElFIDggb24gVmlzdGEgKyBXaW43IHRvbyBpbiBzb21lIGNhc2VzLCBhcyBvZiBKYW51YXJ5IDIwMTEgKD8pXHJcbiAgICAgICAqL1xyXG4gICAgICBtZXNzYWdlcy5wdXNoKHN0cmluZ3Muc3BjV21vZGUpO1xyXG4gICAgICBzbTIud21vZGUgPSBudWxsO1xyXG4gICAgfVxyXG5cclxuICAgIG9FbWJlZCA9IHtcclxuICAgICAgJ25hbWUnOiBzbUlELFxyXG4gICAgICAnaWQnOiBzbUlELFxyXG4gICAgICAnc3JjJzogc21VUkwsXHJcbiAgICAgICdxdWFsaXR5JzogJ2hpZ2gnLFxyXG4gICAgICAnYWxsb3dTY3JpcHRBY2Nlc3MnOiBzbTIuYWxsb3dTY3JpcHRBY2Nlc3MsXHJcbiAgICAgICdiZ2NvbG9yJzogc20yLmJnQ29sb3IsXHJcbiAgICAgICdwbHVnaW5zcGFnZSc6IGh0dHArJ3d3dy5tYWNyb21lZGlhLmNvbS9nby9nZXRmbGFzaHBsYXllcicsXHJcbiAgICAgICd0aXRsZSc6IHN3ZlRpdGxlLFxyXG4gICAgICAndHlwZSc6ICdhcHBsaWNhdGlvbi94LXNob2Nrd2F2ZS1mbGFzaCcsXHJcbiAgICAgICd3bW9kZSc6IHNtMi53bW9kZSxcclxuICAgICAgLy8gaHR0cDovL2hlbHAuYWRvYmUuY29tL2VuX1VTL2FzMy9tb2JpbGUvV1M0YmViY2Q2NmE3NDI3NWMzNmNmYjgxMzcxMjQzMThlZWJjNi03ZmZkLmh0bWxcclxuICAgICAgJ2hhc1ByaW9yaXR5JzogJ3RydWUnXHJcbiAgICB9O1xyXG5cclxuICAgIGlmIChzbTIuZGVidWdGbGFzaCkge1xyXG4gICAgICBvRW1iZWQuRmxhc2hWYXJzID0gJ2RlYnVnPTEnO1xyXG4gICAgfVxyXG5cclxuICAgIGlmICghc20yLndtb2RlKSB7XHJcbiAgICAgIC8vIGRvbid0IHdyaXRlIGVtcHR5IGF0dHJpYnV0ZVxyXG4gICAgICBkZWxldGUgb0VtYmVkLndtb2RlO1xyXG4gICAgfVxyXG5cclxuICAgIGlmIChpc0lFKSB7XHJcblxyXG4gICAgICAvLyBJRSBpcyBcInNwZWNpYWxcIi5cclxuICAgICAgb01vdmllID0gZG9jLmNyZWF0ZUVsZW1lbnQoJ2RpdicpO1xyXG4gICAgICBtb3ZpZUhUTUwgPSBbXHJcbiAgICAgICAgJzxvYmplY3QgaWQ9XCInICsgc21JRCArICdcIiBkYXRhPVwiJyArIHNtVVJMICsgJ1wiIHR5cGU9XCInICsgb0VtYmVkLnR5cGUgKyAnXCIgdGl0bGU9XCInICsgb0VtYmVkLnRpdGxlICsnXCIgY2xhc3NpZD1cImNsc2lkOkQyN0NEQjZFLUFFNkQtMTFjZi05NkI4LTQ0NDU1MzU0MDAwMFwiIGNvZGViYXNlPVwiJyArIGh0dHArJ2Rvd25sb2FkLm1hY3JvbWVkaWEuY29tL3B1Yi9zaG9ja3dhdmUvY2Ficy9mbGFzaC9zd2ZsYXNoLmNhYiN2ZXJzaW9uPTYsMCw0MCwwXCI+JyxcclxuICAgICAgICBwYXJhbSgnbW92aWUnLCBzbVVSTCksXHJcbiAgICAgICAgcGFyYW0oJ0FsbG93U2NyaXB0QWNjZXNzJywgc20yLmFsbG93U2NyaXB0QWNjZXNzKSxcclxuICAgICAgICBwYXJhbSgncXVhbGl0eScsIG9FbWJlZC5xdWFsaXR5KSxcclxuICAgICAgICAoc20yLndtb2RlPyBwYXJhbSgnd21vZGUnLCBzbTIud21vZGUpOiAnJyksXHJcbiAgICAgICAgcGFyYW0oJ2JnY29sb3InLCBzbTIuYmdDb2xvciksXHJcbiAgICAgICAgcGFyYW0oJ2hhc1ByaW9yaXR5JywgJ3RydWUnKSxcclxuICAgICAgICAoc20yLmRlYnVnRmxhc2ggPyBwYXJhbSgnRmxhc2hWYXJzJywgb0VtYmVkLkZsYXNoVmFycykgOiAnJyksXHJcbiAgICAgICAgJzwvb2JqZWN0PidcclxuICAgICAgXS5qb2luKCcnKTtcclxuXHJcbiAgICB9IGVsc2Uge1xyXG5cclxuICAgICAgb01vdmllID0gZG9jLmNyZWF0ZUVsZW1lbnQoJ2VtYmVkJyk7XHJcbiAgICAgIGZvciAodG1wIGluIG9FbWJlZCkge1xyXG4gICAgICAgIGlmIChvRW1iZWQuaGFzT3duUHJvcGVydHkodG1wKSkge1xyXG4gICAgICAgICAgb01vdmllLnNldEF0dHJpYnV0ZSh0bXAsIG9FbWJlZFt0bXBdKTtcclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuXHJcbiAgICB9XHJcblxyXG4gICAgaW5pdERlYnVnKCk7XHJcbiAgICBleHRyYUNsYXNzID0gZ2V0U1dGQ1NTKCk7XHJcbiAgICBvVGFyZ2V0ID0gZ2V0RG9jdW1lbnQoKTtcclxuXHJcbiAgICBpZiAob1RhcmdldCkge1xyXG5cclxuICAgICAgc20yLm9NQyA9IChpZChzbTIubW92aWVJRCkgfHwgZG9jLmNyZWF0ZUVsZW1lbnQoJ2RpdicpKTtcclxuXHJcbiAgICAgIGlmICghc20yLm9NQy5pZCkge1xyXG5cclxuICAgICAgICBzbTIub01DLmlkID0gc20yLm1vdmllSUQ7XHJcbiAgICAgICAgc20yLm9NQy5jbGFzc05hbWUgPSBzd2ZDU1Muc3dmRGVmYXVsdCArICcgJyArIGV4dHJhQ2xhc3M7XHJcbiAgICAgICAgcyA9IG51bGw7XHJcbiAgICAgICAgb0VsID0gbnVsbDtcclxuXHJcbiAgICAgICAgaWYgKCFzbTIudXNlRmxhc2hCbG9jaykge1xyXG4gICAgICAgICAgaWYgKHNtMi51c2VIaWdoUGVyZm9ybWFuY2UpIHtcclxuICAgICAgICAgICAgLy8gb24tc2NyZWVuIGF0IGFsbCB0aW1lc1xyXG4gICAgICAgICAgICBzID0ge1xyXG4gICAgICAgICAgICAgICdwb3NpdGlvbic6ICdmaXhlZCcsXHJcbiAgICAgICAgICAgICAgJ3dpZHRoJzogJzhweCcsXHJcbiAgICAgICAgICAgICAgJ2hlaWdodCc6ICc4cHgnLFxyXG4gICAgICAgICAgICAgIC8vID49IDZweCBmb3IgZmxhc2ggdG8gcnVuIGZhc3QsID49IDhweCB0byBzdGFydCB1cCB1bmRlciBGaXJlZm94L3dpbjMyIGluIHNvbWUgY2FzZXMuIG9kZD8geWVzLlxyXG4gICAgICAgICAgICAgICdib3R0b20nOiAnMHB4JyxcclxuICAgICAgICAgICAgICAnbGVmdCc6ICcwcHgnLFxyXG4gICAgICAgICAgICAgICdvdmVyZmxvdyc6ICdoaWRkZW4nXHJcbiAgICAgICAgICAgIH07XHJcbiAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAvLyBoaWRlIG9mZi1zY3JlZW4sIGxvd2VyIHByaW9yaXR5XHJcbiAgICAgICAgICAgIHMgPSB7XHJcbiAgICAgICAgICAgICAgJ3Bvc2l0aW9uJzogJ2Fic29sdXRlJyxcclxuICAgICAgICAgICAgICAnd2lkdGgnOiAnNnB4JyxcclxuICAgICAgICAgICAgICAnaGVpZ2h0JzogJzZweCcsXHJcbiAgICAgICAgICAgICAgJ3RvcCc6ICctOTk5OXB4JyxcclxuICAgICAgICAgICAgICAnbGVmdCc6ICctOTk5OXB4J1xyXG4gICAgICAgICAgICB9O1xyXG4gICAgICAgICAgICBpZiAoaXNSVEwpIHtcclxuICAgICAgICAgICAgICBzLmxlZnQgPSBNYXRoLmFicyhwYXJzZUludChzLmxlZnQsMTApKSsncHgnO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBpZiAoaXNXZWJraXQpIHtcclxuICAgICAgICAgIC8vIHNvdW5kY2xvdWQtcmVwb3J0ZWQgcmVuZGVyL2NyYXNoIGZpeCwgc2FmYXJpIDVcclxuICAgICAgICAgIHNtMi5vTUMuc3R5bGUuekluZGV4ID0gMTAwMDA7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBpZiAoIXNtMi5kZWJ1Z0ZsYXNoKSB7XHJcbiAgICAgICAgICBmb3IgKHggaW4gcykge1xyXG4gICAgICAgICAgICBpZiAocy5oYXNPd25Qcm9wZXJ0eSh4KSkge1xyXG4gICAgICAgICAgICAgIHNtMi5vTUMuc3R5bGVbeF0gPSBzW3hdO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICB0cnkge1xyXG4gICAgICAgICAgaWYgKCFpc0lFKSB7XHJcbiAgICAgICAgICAgIHNtMi5vTUMuYXBwZW5kQ2hpbGQob01vdmllKTtcclxuICAgICAgICAgIH1cclxuICAgICAgICAgIG9UYXJnZXQuYXBwZW5kQ2hpbGQoc20yLm9NQyk7XHJcbiAgICAgICAgICBpZiAoaXNJRSkge1xyXG4gICAgICAgICAgICBvRWwgPSBzbTIub01DLmFwcGVuZENoaWxkKGRvYy5jcmVhdGVFbGVtZW50KCdkaXYnKSk7XHJcbiAgICAgICAgICAgIG9FbC5jbGFzc05hbWUgPSBzd2ZDU1Muc3dmQm94O1xyXG4gICAgICAgICAgICBvRWwuaW5uZXJIVE1MID0gbW92aWVIVE1MO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgICAgYXBwZW5kU3VjY2VzcyA9IHRydWU7XHJcbiAgICAgICAgfSBjYXRjaChlKSB7XHJcbiAgICAgICAgICB0aHJvdyBuZXcgRXJyb3Ioc3RyKCdkb21FcnJvcicpKycgXFxuJytlLnRvU3RyaW5nKCkpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgIH0gZWxzZSB7XHJcblxyXG4gICAgICAgIC8vIFNNMiBjb250YWluZXIgaXMgYWxyZWFkeSBpbiB0aGUgZG9jdW1lbnQgKGVnLiBmbGFzaGJsb2NrIHVzZSBjYXNlKVxyXG4gICAgICAgIHNDbGFzcyA9IHNtMi5vTUMuY2xhc3NOYW1lO1xyXG4gICAgICAgIHNtMi5vTUMuY2xhc3NOYW1lID0gKHNDbGFzcz9zQ2xhc3MrJyAnOnN3ZkNTUy5zd2ZEZWZhdWx0KSArIChleHRyYUNsYXNzPycgJytleHRyYUNsYXNzOicnKTtcclxuICAgICAgICBzbTIub01DLmFwcGVuZENoaWxkKG9Nb3ZpZSk7XHJcbiAgICAgICAgaWYgKGlzSUUpIHtcclxuICAgICAgICAgIG9FbCA9IHNtMi5vTUMuYXBwZW5kQ2hpbGQoZG9jLmNyZWF0ZUVsZW1lbnQoJ2RpdicpKTtcclxuICAgICAgICAgIG9FbC5jbGFzc05hbWUgPSBzd2ZDU1Muc3dmQm94O1xyXG4gICAgICAgICAgb0VsLmlubmVySFRNTCA9IG1vdmllSFRNTDtcclxuICAgICAgICB9XHJcbiAgICAgICAgYXBwZW5kU3VjY2VzcyA9IHRydWU7XHJcblxyXG4gICAgICB9XHJcblxyXG4gICAgfVxyXG5cclxuICAgIGRpZEFwcGVuZCA9IHRydWU7XHJcbiAgICBpbml0TXNnKCk7XHJcbiAgICAvLyBzbTIuX3dEKHNtICsgJzogVHJ5aW5nIHRvIGxvYWQgJyArIHNtVVJMICsgKCFvdmVySFRUUCAmJiBzbTIuYWx0VVJMID8gJyAoYWx0ZXJuYXRlIFVSTCknIDogJycpLCAxKTtcclxuXHJcbiAgICByZXR1cm4gdHJ1ZTtcclxuXHJcbiAgfTtcclxuXHJcbiAgaW5pdE1vdmllID0gZnVuY3Rpb24oKSB7XHJcblxyXG4gICAgaWYgKHNtMi5odG1sNU9ubHkpIHtcclxuICAgICAgY3JlYXRlTW92aWUoKTtcclxuICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgfVxyXG5cclxuICAgIC8vIGF0dGVtcHQgdG8gZ2V0LCBvciBjcmVhdGUsIG1vdmllIChtYXkgYWxyZWFkeSBleGlzdClcclxuICAgIGlmIChmbGFzaCkge1xyXG4gICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICB9XHJcblxyXG4gICAgaWYgKCFzbTIudXJsKSB7XHJcblxyXG4gICAgICAvKipcclxuICAgICAgICogU29tZXRoaW5nIGlzbid0IHJpZ2h0IC0gd2UndmUgcmVhY2hlZCBpbml0LCBidXQgdGhlIHNvdW5kTWFuYWdlciB1cmwgcHJvcGVydHkgaGFzIG5vdCBiZWVuIHNldC5cclxuICAgICAgICogVXNlciBoYXMgbm90IGNhbGxlZCBzZXR1cCh7dXJsOiAuLi59KSwgb3IgaGFzIG5vdCBzZXQgc291bmRNYW5hZ2VyLnVybCAobGVnYWN5IHVzZSBjYXNlKSBkaXJlY3RseSBiZWZvcmUgaW5pdCB0aW1lLlxyXG4gICAgICAgKiBOb3RpZnkgYW5kIGV4aXQuIElmIHVzZXIgY2FsbHMgc2V0dXAoKSB3aXRoIGEgdXJsOiBwcm9wZXJ0eSwgaW5pdCB3aWxsIGJlIHJlc3RhcnRlZCBhcyBpbiB0aGUgZGVmZXJyZWQgbG9hZGluZyBjYXNlLlxyXG4gICAgICAgKi9cclxuXHJcbiAgICAgICBfd0RTKCdub1VSTCcpO1xyXG4gICAgICAgcmV0dXJuIGZhbHNlO1xyXG5cclxuICAgIH1cclxuXHJcbiAgICAvLyBpbmxpbmUgbWFya3VwIGNhc2VcclxuICAgIGZsYXNoID0gc20yLmdldE1vdmllKHNtMi5pZCk7XHJcblxyXG4gICAgaWYgKCFmbGFzaCkge1xyXG4gICAgICBpZiAoIW9SZW1vdmVkKSB7XHJcbiAgICAgICAgLy8gdHJ5IHRvIGNyZWF0ZVxyXG4gICAgICAgIGNyZWF0ZU1vdmllKHNtMi5pZCwgc20yLnVybCk7XHJcbiAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgLy8gdHJ5IHRvIHJlLWFwcGVuZCByZW1vdmVkIG1vdmllIGFmdGVyIHJlYm9vdCgpXHJcbiAgICAgICAgaWYgKCFpc0lFKSB7XHJcbiAgICAgICAgICBzbTIub01DLmFwcGVuZENoaWxkKG9SZW1vdmVkKTtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgc20yLm9NQy5pbm5lckhUTUwgPSBvUmVtb3ZlZEhUTUw7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIG9SZW1vdmVkID0gbnVsbDtcclxuICAgICAgICBkaWRBcHBlbmQgPSB0cnVlO1xyXG4gICAgICB9XHJcbiAgICAgIGZsYXNoID0gc20yLmdldE1vdmllKHNtMi5pZCk7XHJcbiAgICB9XHJcblxyXG4gICAgaWYgKHR5cGVvZiBzbTIub25pbml0bW92aWUgPT09ICdmdW5jdGlvbicpIHtcclxuICAgICAgc2V0VGltZW91dChzbTIub25pbml0bW92aWUsIDEpO1xyXG4gICAgfVxyXG5cclxuICAgIC8vIDxkPlxyXG4gICAgZmx1c2hNZXNzYWdlcygpO1xyXG4gICAgLy8gPC9kPlxyXG5cclxuICAgIHJldHVybiB0cnVlO1xyXG5cclxuICB9O1xyXG5cclxuICBkZWxheVdhaXRGb3JFSSA9IGZ1bmN0aW9uKCkge1xyXG5cclxuICAgIHNldFRpbWVvdXQod2FpdEZvckVJLCAxMDAwKTtcclxuXHJcbiAgfTtcclxuXHJcbiAgcmVib290SW50b0hUTUw1ID0gZnVuY3Rpb24oKSB7XHJcblxyXG4gICAgLy8gc3BlY2lhbCBjYXNlOiB0cnkgZm9yIGEgcmVib290IHdpdGggcHJlZmVyRmxhc2g6IGZhbHNlLCBpZiAxMDAlIEhUTUw1IG1vZGUgaXMgcG9zc2libGUgYW5kIHVzZUZsYXNoQmxvY2sgaXMgbm90IGVuYWJsZWQuXHJcblxyXG4gICAgd2luZG93LnNldFRpbWVvdXQoZnVuY3Rpb24oKSB7XHJcblxyXG4gICAgICBjb21wbGFpbihzbWMgKyAndXNlRmxhc2hCbG9jayBpcyBmYWxzZSwgMTAwJSBIVE1MNSBtb2RlIGlzIHBvc3NpYmxlLiBSZWJvb3Rpbmcgd2l0aCBwcmVmZXJGbGFzaDogZmFsc2UuLi4nKTtcclxuXHJcbiAgICAgIHNtMi5zZXR1cCh7XHJcbiAgICAgICAgcHJlZmVyRmxhc2g6IGZhbHNlXHJcbiAgICAgIH0pLnJlYm9vdCgpO1xyXG5cclxuICAgICAgLy8gaWYgZm9yIHNvbWUgcmVhc29uIHlvdSB3YW50IHRvIGRldGVjdCB0aGlzIGNhc2UsIHVzZSBhbiBvbnRpbWVvdXQoKSBjYWxsYmFjayBhbmQgbG9vayBmb3IgaHRtbDVPbmx5IGFuZCBkaWRGbGFzaEJsb2NrID09IHRydWUuXHJcbiAgICAgIHNtMi5kaWRGbGFzaEJsb2NrID0gdHJ1ZTtcclxuXHJcbiAgICAgIHNtMi5iZWdpbkRlbGF5ZWRJbml0KCk7XHJcblxyXG4gICAgfSwgMSk7XHJcblxyXG4gIH07XHJcblxyXG4gIHdhaXRGb3JFSSA9IGZ1bmN0aW9uKCkge1xyXG5cclxuICAgIHZhciBwLFxyXG4gICAgICAgIGxvYWRJbmNvbXBsZXRlID0gZmFsc2U7XHJcblxyXG4gICAgaWYgKCFzbTIudXJsKSB7XHJcbiAgICAgIC8vIE5vIFNXRiB1cmwgdG8gbG9hZCAobm9VUkwgY2FzZSkgLSBleGl0IGZvciBub3cuIFdpbGwgYmUgcmV0cmllZCB3aGVuIHVybCBpcyBzZXQuXHJcbiAgICAgIHJldHVybiBmYWxzZTtcclxuICAgIH1cclxuXHJcbiAgICBpZiAod2FpdGluZ0ZvckVJKSB7XHJcbiAgICAgIHJldHVybiBmYWxzZTtcclxuICAgIH1cclxuXHJcbiAgICB3YWl0aW5nRm9yRUkgPSB0cnVlO1xyXG4gICAgZXZlbnQucmVtb3ZlKHdpbmRvdywgJ2xvYWQnLCBkZWxheVdhaXRGb3JFSSk7XHJcblxyXG4gICAgaWYgKGhhc0ZsYXNoICYmIHRyeUluaXRPbkZvY3VzICYmICFpc0ZvY3VzZWQpIHtcclxuICAgICAgLy8gU2FmYXJpIHdvbid0IGxvYWQgZmxhc2ggaW4gYmFja2dyb3VuZCB0YWJzLCBvbmx5IHdoZW4gZm9jdXNlZC5cclxuICAgICAgX3dEUygnd2FpdEZvY3VzJyk7XHJcbiAgICAgIHJldHVybiBmYWxzZTtcclxuICAgIH1cclxuXHJcbiAgICBpZiAoIWRpZEluaXQpIHtcclxuICAgICAgcCA9IHNtMi5nZXRNb3ZpZVBlcmNlbnQoKTtcclxuICAgICAgaWYgKHAgPiAwICYmIHAgPCAxMDApIHtcclxuICAgICAgICBsb2FkSW5jb21wbGV0ZSA9IHRydWU7XHJcbiAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBzZXRUaW1lb3V0KGZ1bmN0aW9uKCkge1xyXG5cclxuICAgICAgcCA9IHNtMi5nZXRNb3ZpZVBlcmNlbnQoKTtcclxuXHJcbiAgICAgIGlmIChsb2FkSW5jb21wbGV0ZSkge1xyXG4gICAgICAgIC8vIHNwZWNpYWwgY2FzZTogaWYgbW92aWUgKnBhcnRpYWxseSogbG9hZGVkLCByZXRyeSB1bnRpbCBpdCdzIDEwMCUgYmVmb3JlIGFzc3VtaW5nIGZhaWx1cmUuXHJcbiAgICAgICAgd2FpdGluZ0ZvckVJID0gZmFsc2U7XHJcbiAgICAgICAgc20yLl93RChzdHIoJ3dhaXRTV0YnKSk7XHJcbiAgICAgICAgd2luZG93LnNldFRpbWVvdXQoZGVsYXlXYWl0Rm9yRUksIDEpO1xyXG4gICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgICAgfVxyXG5cclxuICAgICAgLy8gPGQ+XHJcbiAgICAgIGlmICghZGlkSW5pdCkge1xyXG5cclxuICAgICAgICBzbTIuX3dEKHNtICsgJzogTm8gRmxhc2ggcmVzcG9uc2Ugd2l0aGluIGV4cGVjdGVkIHRpbWUuIExpa2VseSBjYXVzZXM6ICcgKyAocCA9PT0gMCA/ICdTV0YgbG9hZCBmYWlsZWQsICc6JycpICsgJ0ZsYXNoIGJsb2NrZWQgb3IgSlMtRmxhc2ggc2VjdXJpdHkgZXJyb3IuJyArIChzbTIuZGVidWdGbGFzaD8nICcgKyBzdHIoJ2NoZWNrU1dGJyk6JycpLCAyKTtcclxuXHJcbiAgICAgICAgaWYgKCFvdmVySFRUUCAmJiBwKSB7XHJcblxyXG4gICAgICAgICAgX3dEUygnbG9jYWxGYWlsJywgMik7XHJcblxyXG4gICAgICAgICAgaWYgKCFzbTIuZGVidWdGbGFzaCkge1xyXG4gICAgICAgICAgICBfd0RTKCd0cnlEZWJ1ZycsIDIpO1xyXG4gICAgICAgICAgfVxyXG5cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGlmIChwID09PSAwKSB7XHJcblxyXG4gICAgICAgICAgLy8gaWYgMCAobm90IG51bGwpLCBwcm9iYWJseSBhIDQwNC5cclxuICAgICAgICAgIHNtMi5fd0Qoc3RyKCdzd2Y0MDQnLCBzbTIudXJsKSwgMSk7XHJcblxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgZGVidWdUUygnZmxhc2h0b2pzJywgZmFsc2UsICc6IFRpbWVkIG91dCcgKyBvdmVySFRUUD8nIChDaGVjayBmbGFzaCBzZWN1cml0eSBvciBmbGFzaCBibG9ja2VycyknOicgKE5vIHBsdWdpbi9taXNzaW5nIFNXRj8pJyk7XHJcblxyXG4gICAgICB9XHJcbiAgICAgIC8vIDwvZD5cclxuXHJcbiAgICAgIC8vIGdpdmUgdXAgLyB0aW1lLW91dCwgZGVwZW5kaW5nXHJcblxyXG4gICAgICBpZiAoIWRpZEluaXQgJiYgb2tUb0Rpc2FibGUpIHtcclxuXHJcbiAgICAgICAgaWYgKHAgPT09IG51bGwpIHtcclxuXHJcbiAgICAgICAgICAvLyBTV0YgZmFpbGVkIHRvIHJlcG9ydCBsb2FkIHByb2dyZXNzLiBQb3NzaWJseSBibG9ja2VkLlxyXG5cclxuICAgICAgICAgIGlmIChzbTIudXNlRmxhc2hCbG9jayB8fCBzbTIuZmxhc2hMb2FkVGltZW91dCA9PT0gMCkge1xyXG5cclxuICAgICAgICAgICAgaWYgKHNtMi51c2VGbGFzaEJsb2NrKSB7XHJcblxyXG4gICAgICAgICAgICAgIGZsYXNoQmxvY2tIYW5kbGVyKCk7XHJcblxyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICBfd0RTKCd3YWl0Rm9yZXZlcicpO1xyXG5cclxuICAgICAgICAgIH0gZWxzZSB7XHJcblxyXG4gICAgICAgICAgICAvLyBubyBjdXN0b20gZmxhc2ggYmxvY2sgaGFuZGxpbmcsIGJ1dCBTV0YgaGFzIHRpbWVkIG91dC4gV2lsbCByZWNvdmVyIGlmIHVzZXIgdW5ibG9ja3MgLyBhbGxvd3MgU1dGIGxvYWQuXHJcblxyXG4gICAgICAgICAgICBpZiAoIXNtMi51c2VGbGFzaEJsb2NrICYmIGNhbklnbm9yZUZsYXNoKSB7XHJcblxyXG4gICAgICAgICAgICAgIHJlYm9vdEludG9IVE1MNSgpO1xyXG5cclxuICAgICAgICAgICAgfSBlbHNlIHtcclxuXHJcbiAgICAgICAgICAgICAgX3dEUygnd2FpdEZvcmV2ZXInKTtcclxuXHJcbiAgICAgICAgICAgICAgLy8gZmlyZSBhbnkgcmVndWxhciByZWdpc3RlcmVkIG9udGltZW91dCgpIGxpc3RlbmVycy5cclxuICAgICAgICAgICAgICBwcm9jZXNzT25FdmVudHMoe3R5cGU6J29udGltZW91dCcsIGlnbm9yZUluaXQ6IHRydWUsIGVycm9yOiB7dHlwZTogJ0lOSVRfRkxBU0hCTE9DSyd9fSk7XHJcblxyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgfVxyXG5cclxuICAgICAgICB9IGVsc2Uge1xyXG5cclxuICAgICAgICAgIC8vIFNXRiBsb2FkZWQ/IFNob3VsZG4ndCBiZSBhIGJsb2NraW5nIGlzc3VlLCB0aGVuLlxyXG5cclxuICAgICAgICAgIGlmIChzbTIuZmxhc2hMb2FkVGltZW91dCA9PT0gMCkge1xyXG5cclxuICAgICAgICAgICAgX3dEUygnd2FpdEZvcmV2ZXInKTtcclxuXHJcbiAgICAgICAgICB9IGVsc2Uge1xyXG5cclxuICAgICAgICAgICAgaWYgKCFzbTIudXNlRmxhc2hCbG9jayAmJiBjYW5JZ25vcmVGbGFzaCkge1xyXG5cclxuICAgICAgICAgICAgICByZWJvb3RJbnRvSFRNTDUoKTtcclxuXHJcbiAgICAgICAgICAgIH0gZWxzZSB7XHJcblxyXG4gICAgICAgICAgICAgIGZhaWxTYWZlbHkodHJ1ZSk7XHJcblxyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgfVxyXG5cclxuICAgICAgICB9XHJcblxyXG4gICAgICB9XHJcblxyXG4gICAgfSwgc20yLmZsYXNoTG9hZFRpbWVvdXQpO1xyXG5cclxuICB9O1xyXG5cclxuICBoYW5kbGVGb2N1cyA9IGZ1bmN0aW9uKCkge1xyXG5cclxuICAgIGZ1bmN0aW9uIGNsZWFudXAoKSB7XHJcbiAgICAgIGV2ZW50LnJlbW92ZSh3aW5kb3csICdmb2N1cycsIGhhbmRsZUZvY3VzKTtcclxuICAgIH1cclxuXHJcbiAgICBpZiAoaXNGb2N1c2VkIHx8ICF0cnlJbml0T25Gb2N1cykge1xyXG4gICAgICAvLyBhbHJlYWR5IGZvY3VzZWQsIG9yIG5vdCBzcGVjaWFsIFNhZmFyaSBiYWNrZ3JvdW5kIHRhYiBjYXNlXHJcbiAgICAgIGNsZWFudXAoKTtcclxuICAgICAgcmV0dXJuIHRydWU7XHJcbiAgICB9XHJcblxyXG4gICAgb2tUb0Rpc2FibGUgPSB0cnVlO1xyXG4gICAgaXNGb2N1c2VkID0gdHJ1ZTtcclxuICAgIF93RFMoJ2dvdEZvY3VzJyk7XHJcblxyXG4gICAgLy8gYWxsb3cgaW5pdCB0byByZXN0YXJ0XHJcbiAgICB3YWl0aW5nRm9yRUkgPSBmYWxzZTtcclxuXHJcbiAgICAvLyBraWNrIG9mZiBFeHRlcm5hbEludGVyZmFjZSB0aW1lb3V0LCBub3cgdGhhdCB0aGUgU1dGIGhhcyBzdGFydGVkXHJcbiAgICBkZWxheVdhaXRGb3JFSSgpO1xyXG5cclxuICAgIGNsZWFudXAoKTtcclxuICAgIHJldHVybiB0cnVlO1xyXG5cclxuICB9O1xyXG5cclxuICBmbHVzaE1lc3NhZ2VzID0gZnVuY3Rpb24oKSB7XHJcblxyXG4gICAgLy8gPGQ+XHJcblxyXG4gICAgLy8gU00yIHByZS1pbml0IGRlYnVnIG1lc3NhZ2VzXHJcbiAgICBpZiAobWVzc2FnZXMubGVuZ3RoKSB7XHJcbiAgICAgIHNtMi5fd0QoJ1NvdW5kTWFuYWdlciAyOiAnICsgbWVzc2FnZXMuam9pbignICcpLCAxKTtcclxuICAgICAgbWVzc2FnZXMgPSBbXTtcclxuICAgIH1cclxuXHJcbiAgICAvLyA8L2Q+XHJcblxyXG4gIH07XHJcblxyXG4gIHNob3dTdXBwb3J0ID0gZnVuY3Rpb24oKSB7XHJcblxyXG4gICAgLy8gPGQ+XHJcblxyXG4gICAgZmx1c2hNZXNzYWdlcygpO1xyXG5cclxuICAgIHZhciBpdGVtLCB0ZXN0cyA9IFtdO1xyXG5cclxuICAgIGlmIChzbTIudXNlSFRNTDVBdWRpbyAmJiBzbTIuaGFzSFRNTDUpIHtcclxuICAgICAgZm9yIChpdGVtIGluIHNtMi5hdWRpb0Zvcm1hdHMpIHtcclxuICAgICAgICBpZiAoc20yLmF1ZGlvRm9ybWF0cy5oYXNPd25Qcm9wZXJ0eShpdGVtKSkge1xyXG4gICAgICAgICAgdGVzdHMucHVzaChpdGVtICsgJyA9ICcgKyBzbTIuaHRtbDVbaXRlbV0gKyAoIXNtMi5odG1sNVtpdGVtXSAmJiBuZWVkc0ZsYXNoICYmIHNtMi5mbGFzaFtpdGVtXSA/ICcgKHVzaW5nIGZsYXNoKScgOiAoc20yLnByZWZlckZsYXNoICYmIHNtMi5mbGFzaFtpdGVtXSAmJiBuZWVkc0ZsYXNoID8gJyAocHJlZmVycmluZyBmbGFzaCknOiAoIXNtMi5odG1sNVtpdGVtXSA/ICcgKCcgKyAoc20yLmF1ZGlvRm9ybWF0c1tpdGVtXS5yZXF1aXJlZCA/ICdyZXF1aXJlZCwgJzonJykgKyAnYW5kIG5vIGZsYXNoIHN1cHBvcnQpJyA6ICcnKSkpKTtcclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuICAgICAgc20yLl93RCgnU291bmRNYW5hZ2VyIDIgSFRNTDUgc3VwcG9ydDogJyArIHRlc3RzLmpvaW4oJywgJyksIDEpO1xyXG4gICAgfVxyXG5cclxuICAgIC8vIDwvZD5cclxuXHJcbiAgfTtcclxuXHJcbiAgaW5pdENvbXBsZXRlID0gZnVuY3Rpb24oYk5vRGlzYWJsZSkge1xyXG5cclxuICAgIGlmIChkaWRJbml0KSB7XHJcbiAgICAgIHJldHVybiBmYWxzZTtcclxuICAgIH1cclxuXHJcbiAgICBpZiAoc20yLmh0bWw1T25seSkge1xyXG4gICAgICAvLyBhbGwgZ29vZC5cclxuICAgICAgX3dEUygnc20yTG9hZGVkJywgMSk7XHJcbiAgICAgIGRpZEluaXQgPSB0cnVlO1xyXG4gICAgICBpbml0VXNlck9ubG9hZCgpO1xyXG4gICAgICBkZWJ1Z1RTKCdvbmxvYWQnLCB0cnVlKTtcclxuICAgICAgcmV0dXJuIHRydWU7XHJcbiAgICB9XHJcblxyXG4gICAgdmFyIHdhc1RpbWVvdXQgPSAoc20yLnVzZUZsYXNoQmxvY2sgJiYgc20yLmZsYXNoTG9hZFRpbWVvdXQgJiYgIXNtMi5nZXRNb3ZpZVBlcmNlbnQoKSksXHJcbiAgICAgICAgcmVzdWx0ID0gdHJ1ZSxcclxuICAgICAgICBlcnJvcjtcclxuXHJcbiAgICBpZiAoIXdhc1RpbWVvdXQpIHtcclxuICAgICAgZGlkSW5pdCA9IHRydWU7XHJcbiAgICB9XHJcblxyXG4gICAgZXJyb3IgPSB7dHlwZTogKCFoYXNGbGFzaCAmJiBuZWVkc0ZsYXNoID8gJ05PX0ZMQVNIJyA6ICdJTklUX1RJTUVPVVQnKX07XHJcblxyXG4gICAgc20yLl93RCgnU291bmRNYW5hZ2VyIDIgJyArIChkaXNhYmxlZCA/ICdmYWlsZWQgdG8gbG9hZCcgOiAnbG9hZGVkJykgKyAnICgnICsgKGRpc2FibGVkID8gJ0ZsYXNoIHNlY3VyaXR5L2xvYWQgZXJyb3InIDogJ09LJykgKyAnKSAnICsgU3RyaW5nLmZyb21DaGFyQ29kZShkaXNhYmxlZCA/IDEwMDA2IDogMTAwMDMpLCBkaXNhYmxlZCA/IDI6IDEpO1xyXG5cclxuICAgIGlmIChkaXNhYmxlZCB8fCBiTm9EaXNhYmxlKSB7XHJcbiAgICAgIGlmIChzbTIudXNlRmxhc2hCbG9jayAmJiBzbTIub01DKSB7XHJcbiAgICAgICAgc20yLm9NQy5jbGFzc05hbWUgPSBnZXRTV0ZDU1MoKSArICcgJyArIChzbTIuZ2V0TW92aWVQZXJjZW50KCkgPT09IG51bGw/c3dmQ1NTLnN3ZlRpbWVkb3V0OnN3ZkNTUy5zd2ZFcnJvcik7XHJcbiAgICAgIH1cclxuICAgICAgcHJvY2Vzc09uRXZlbnRzKHt0eXBlOidvbnRpbWVvdXQnLCBlcnJvcjplcnJvciwgaWdub3JlSW5pdDogdHJ1ZX0pO1xyXG4gICAgICBkZWJ1Z1RTKCdvbmxvYWQnLCBmYWxzZSk7XHJcbiAgICAgIGNhdGNoRXJyb3IoZXJyb3IpO1xyXG4gICAgICByZXN1bHQgPSBmYWxzZTtcclxuICAgIH0gZWxzZSB7XHJcbiAgICAgIGRlYnVnVFMoJ29ubG9hZCcsIHRydWUpO1xyXG4gICAgfVxyXG5cclxuICAgIGlmICghZGlzYWJsZWQpIHtcclxuICAgICAgaWYgKHNtMi53YWl0Rm9yV2luZG93TG9hZCAmJiAhd2luZG93TG9hZGVkKSB7XHJcbiAgICAgICAgX3dEUygnd2FpdE9ubG9hZCcpO1xyXG4gICAgICAgIGV2ZW50LmFkZCh3aW5kb3csICdsb2FkJywgaW5pdFVzZXJPbmxvYWQpO1xyXG4gICAgICB9IGVsc2Uge1xyXG4gICAgICAgIC8vIDxkPlxyXG4gICAgICAgIGlmIChzbTIud2FpdEZvcldpbmRvd0xvYWQgJiYgd2luZG93TG9hZGVkKSB7XHJcbiAgICAgICAgICBfd0RTKCdkb2NMb2FkZWQnKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgLy8gPC9kPlxyXG4gICAgICAgIGluaXRVc2VyT25sb2FkKCk7XHJcbiAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICByZXR1cm4gcmVzdWx0O1xyXG5cclxuICB9O1xyXG5cclxuICAvKipcclxuICAgKiBhcHBseSB0b3AtbGV2ZWwgc2V0dXBPcHRpb25zIG9iamVjdCBhcyBsb2NhbCBwcm9wZXJ0aWVzLCBlZy4sIHRoaXMuc2V0dXBPcHRpb25zLmZsYXNoVmVyc2lvbiAtPiB0aGlzLmZsYXNoVmVyc2lvbiAoc291bmRNYW5hZ2VyLmZsYXNoVmVyc2lvbilcclxuICAgKiB0aGlzIG1haW50YWlucyBiYWNrd2FyZCBjb21wYXRpYmlsaXR5LCBhbmQgYWxsb3dzIHByb3BlcnRpZXMgdG8gYmUgZGVmaW5lZCBzZXBhcmF0ZWx5IGZvciB1c2UgYnkgc291bmRNYW5hZ2VyLnNldHVwKCkuXHJcbiAgICovXHJcblxyXG4gIHNldFByb3BlcnRpZXMgPSBmdW5jdGlvbigpIHtcclxuXHJcbiAgICB2YXIgaSxcclxuICAgICAgICBvID0gc20yLnNldHVwT3B0aW9ucztcclxuXHJcbiAgICBmb3IgKGkgaW4gbykge1xyXG5cclxuICAgICAgaWYgKG8uaGFzT3duUHJvcGVydHkoaSkpIHtcclxuXHJcbiAgICAgICAgLy8gYXNzaWduIGxvY2FsIHByb3BlcnR5IGlmIG5vdCBhbHJlYWR5IGRlZmluZWRcclxuXHJcbiAgICAgICAgaWYgKHNtMltpXSA9PT0gX3VuZGVmaW5lZCkge1xyXG5cclxuICAgICAgICAgIHNtMltpXSA9IG9baV07XHJcblxyXG4gICAgICAgIH0gZWxzZSBpZiAoc20yW2ldICE9PSBvW2ldKSB7XHJcblxyXG4gICAgICAgICAgLy8gbGVnYWN5IHN1cHBvcnQ6IHdyaXRlIG1hbnVhbGx5LWFzc2lnbmVkIHByb3BlcnR5IChlZy4sIHNvdW5kTWFuYWdlci51cmwpIGJhY2sgdG8gc2V0dXBPcHRpb25zIHRvIGtlZXAgdGhpbmdzIGluIHN5bmNcclxuICAgICAgICAgIHNtMi5zZXR1cE9wdGlvbnNbaV0gPSBzbTJbaV07XHJcblxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgIH1cclxuXHJcbiAgICB9XHJcblxyXG4gIH07XHJcblxyXG5cclxuICBpbml0ID0gZnVuY3Rpb24oKSB7XHJcblxyXG4gICAgLy8gY2FsbGVkIGFmdGVyIG9ubG9hZCgpXHJcblxyXG4gICAgaWYgKGRpZEluaXQpIHtcclxuICAgICAgX3dEUygnZGlkSW5pdCcpO1xyXG4gICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICB9XHJcblxyXG4gICAgZnVuY3Rpb24gY2xlYW51cCgpIHtcclxuICAgICAgZXZlbnQucmVtb3ZlKHdpbmRvdywgJ2xvYWQnLCBzbTIuYmVnaW5EZWxheWVkSW5pdCk7XHJcbiAgICB9XHJcblxyXG4gICAgaWYgKHNtMi5odG1sNU9ubHkpIHtcclxuICAgICAgaWYgKCFkaWRJbml0KSB7XHJcbiAgICAgICAgLy8gd2UgZG9uJ3QgbmVlZCBubyBzdGVlbmtpbmcgZmxhc2ghXHJcbiAgICAgICAgY2xlYW51cCgpO1xyXG4gICAgICAgIHNtMi5lbmFibGVkID0gdHJ1ZTtcclxuICAgICAgICBpbml0Q29tcGxldGUoKTtcclxuICAgICAgfVxyXG4gICAgICByZXR1cm4gdHJ1ZTtcclxuICAgIH1cclxuXHJcbiAgICAvLyBmbGFzaCBwYXRoXHJcbiAgICBpbml0TW92aWUoKTtcclxuXHJcbiAgICB0cnkge1xyXG5cclxuICAgICAgLy8gYXR0ZW1wdCB0byB0YWxrIHRvIEZsYXNoXHJcbiAgICAgIGZsYXNoLl9leHRlcm5hbEludGVyZmFjZVRlc3QoZmFsc2UpO1xyXG5cclxuICAgICAgLy8gYXBwbHkgdXNlci1zcGVjaWZpZWQgcG9sbGluZyBpbnRlcnZhbCwgT1IsIGlmIFwiaGlnaCBwZXJmb3JtYW5jZVwiIHNldCwgZmFzdGVyIHZzLiBkZWZhdWx0IHBvbGxpbmdcclxuICAgICAgLy8gKGRldGVybWluZXMgZnJlcXVlbmN5IG9mIHdoaWxlbG9hZGluZy93aGlsZXBsYXlpbmcgY2FsbGJhY2tzLCBlZmZlY3RpdmVseSBkcml2aW5nIFVJIGZyYW1lcmF0ZXMpXHJcbiAgICAgIHNldFBvbGxpbmcodHJ1ZSwgKHNtMi5mbGFzaFBvbGxpbmdJbnRlcnZhbCB8fCAoc20yLnVzZUhpZ2hQZXJmb3JtYW5jZSA/IDEwIDogNTApKSk7XHJcblxyXG4gICAgICBpZiAoIXNtMi5kZWJ1Z01vZGUpIHtcclxuICAgICAgICAvLyBzdG9wIHRoZSBTV0YgZnJvbSBtYWtpbmcgZGVidWcgb3V0cHV0IGNhbGxzIHRvIEpTXHJcbiAgICAgICAgZmxhc2guX2Rpc2FibGVEZWJ1ZygpO1xyXG4gICAgICB9XHJcblxyXG4gICAgICBzbTIuZW5hYmxlZCA9IHRydWU7XHJcbiAgICAgIGRlYnVnVFMoJ2pzdG9mbGFzaCcsIHRydWUpO1xyXG5cclxuICAgICAgaWYgKCFzbTIuaHRtbDVPbmx5KSB7XHJcbiAgICAgICAgLy8gcHJldmVudCBicm93c2VyIGZyb20gc2hvd2luZyBjYWNoZWQgcGFnZSBzdGF0ZSAob3IgcmF0aGVyLCByZXN0b3JpbmcgXCJzdXNwZW5kZWRcIiBwYWdlIHN0YXRlKSB2aWEgYmFjayBidXR0b24sIGJlY2F1c2UgZmxhc2ggbWF5IGJlIGRlYWRcclxuICAgICAgICAvLyBodHRwOi8vd3d3LndlYmtpdC5vcmcvYmxvZy81MTYvd2Via2l0LXBhZ2UtY2FjaGUtaWktdGhlLXVubG9hZC1ldmVudC9cclxuICAgICAgICBldmVudC5hZGQod2luZG93LCAndW5sb2FkJywgZG9Ob3RoaW5nKTtcclxuICAgICAgfVxyXG5cclxuICAgIH0gY2F0Y2goZSkge1xyXG5cclxuICAgICAgc20yLl93RCgnanMvZmxhc2ggZXhjZXB0aW9uOiAnICsgZS50b1N0cmluZygpKTtcclxuICAgICAgZGVidWdUUygnanN0b2ZsYXNoJywgZmFsc2UpO1xyXG4gICAgICBjYXRjaEVycm9yKHt0eXBlOidKU19UT19GTEFTSF9FWENFUFRJT04nLCBmYXRhbDp0cnVlfSk7XHJcbiAgICAgIC8vIGRvbid0IGRpc2FibGUsIGZvciByZWJvb3QoKVxyXG4gICAgICBmYWlsU2FmZWx5KHRydWUpO1xyXG4gICAgICBpbml0Q29tcGxldGUoKTtcclxuXHJcbiAgICAgIHJldHVybiBmYWxzZTtcclxuXHJcbiAgICB9XHJcblxyXG4gICAgaW5pdENvbXBsZXRlKCk7XHJcblxyXG4gICAgLy8gZGlzY29ubmVjdCBldmVudHNcclxuICAgIGNsZWFudXAoKTtcclxuXHJcbiAgICByZXR1cm4gdHJ1ZTtcclxuXHJcbiAgfTtcclxuXHJcbiAgZG9tQ29udGVudExvYWRlZCA9IGZ1bmN0aW9uKCkge1xyXG5cclxuICAgIGlmIChkaWREQ0xvYWRlZCkge1xyXG4gICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICB9XHJcblxyXG4gICAgZGlkRENMb2FkZWQgPSB0cnVlO1xyXG5cclxuICAgIC8vIGFzc2lnbiB0b3AtbGV2ZWwgc291bmRNYW5hZ2VyIHByb3BlcnRpZXMgZWcuIHNvdW5kTWFuYWdlci51cmxcclxuICAgIHNldFByb3BlcnRpZXMoKTtcclxuXHJcbiAgICBpbml0RGVidWcoKTtcclxuXHJcbiAgICAvKipcclxuICAgICAqIFRlbXBvcmFyeSBmZWF0dXJlOiBhbGxvdyBmb3JjZSBvZiBIVE1MNSB2aWEgVVJMIHBhcmFtczogc20yLXVzZWh0bWw1YXVkaW89MCBvciAxXHJcbiAgICAgKiBEaXR0byBmb3Igc20yLXByZWZlckZsYXNoLCB0b28uXHJcbiAgICAgKi9cclxuICAgIC8vIDxkPlxyXG4gICAgKGZ1bmN0aW9uKCl7XHJcblxyXG4gICAgICB2YXIgYSA9ICdzbTItdXNlaHRtbDVhdWRpbz0nLFxyXG4gICAgICAgICAgYTIgPSAnc20yLXByZWZlcmZsYXNoPScsXHJcbiAgICAgICAgICBiID0gbnVsbCxcclxuICAgICAgICAgIGIyID0gbnVsbCxcclxuICAgICAgICAgIGwgPSB3bC50b0xvd2VyQ2FzZSgpO1xyXG5cclxuICAgICAgaWYgKGwuaW5kZXhPZihhKSAhPT0gLTEpIHtcclxuICAgICAgICBiID0gKGwuY2hhckF0KGwuaW5kZXhPZihhKSthLmxlbmd0aCkgPT09ICcxJyk7XHJcbiAgICAgICAgaWYgKGhhc0NvbnNvbGUpIHtcclxuICAgICAgICAgIGNvbnNvbGUubG9nKChiPydFbmFibGluZyAnOidEaXNhYmxpbmcgJykrJ3VzZUhUTUw1QXVkaW8gdmlhIFVSTCBwYXJhbWV0ZXInKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgc20yLnNldHVwKHtcclxuICAgICAgICAgICd1c2VIVE1MNUF1ZGlvJzogYlxyXG4gICAgICAgIH0pO1xyXG4gICAgICB9XHJcblxyXG4gICAgICBpZiAobC5pbmRleE9mKGEyKSAhPT0gLTEpIHtcclxuICAgICAgICBiMiA9IChsLmNoYXJBdChsLmluZGV4T2YoYTIpK2EyLmxlbmd0aCkgPT09ICcxJyk7XHJcbiAgICAgICAgaWYgKGhhc0NvbnNvbGUpIHtcclxuICAgICAgICAgIGNvbnNvbGUubG9nKChiMj8nRW5hYmxpbmcgJzonRGlzYWJsaW5nICcpKydwcmVmZXJGbGFzaCB2aWEgVVJMIHBhcmFtZXRlcicpO1xyXG4gICAgICAgIH1cclxuICAgICAgICBzbTIuc2V0dXAoe1xyXG4gICAgICAgICAgJ3ByZWZlckZsYXNoJzogYjJcclxuICAgICAgICB9KTtcclxuICAgICAgfVxyXG5cclxuICAgIH0oKSk7XHJcbiAgICAvLyA8L2Q+XHJcblxyXG4gICAgaWYgKCFoYXNGbGFzaCAmJiBzbTIuaGFzSFRNTDUpIHtcclxuICAgICAgc20yLl93RCgnU291bmRNYW5hZ2VyIDI6IE5vIEZsYXNoIGRldGVjdGVkJyArICghc20yLnVzZUhUTUw1QXVkaW8gPyAnLCBlbmFibGluZyBIVE1MNS4nIDogJy4gVHJ5aW5nIEhUTUw1LW9ubHkgbW9kZS4nKSwgMSk7XHJcbiAgICAgIHNtMi5zZXR1cCh7XHJcbiAgICAgICAgJ3VzZUhUTUw1QXVkaW8nOiB0cnVlLFxyXG4gICAgICAgIC8vIG1ha2Ugc3VyZSB3ZSBhcmVuJ3QgcHJlZmVycmluZyBmbGFzaCwgZWl0aGVyXHJcbiAgICAgICAgLy8gVE9ETzogcHJlZmVyRmxhc2ggc2hvdWxkIG5vdCBtYXR0ZXIgaWYgZmxhc2ggaXMgbm90IGluc3RhbGxlZC4gQ3VycmVudGx5LCBzdHVmZiBicmVha3Mgd2l0aG91dCB0aGUgYmVsb3cgdHdlYWsuXHJcbiAgICAgICAgJ3ByZWZlckZsYXNoJzogZmFsc2VcclxuICAgICAgfSk7XHJcbiAgICB9XHJcblxyXG4gICAgdGVzdEhUTUw1KCk7XHJcblxyXG4gICAgaWYgKCFoYXNGbGFzaCAmJiBuZWVkc0ZsYXNoKSB7XHJcbiAgICAgIG1lc3NhZ2VzLnB1c2goc3RyaW5ncy5uZWVkRmxhc2gpO1xyXG4gICAgICAvLyBUT0RPOiBGYXRhbCBoZXJlIHZzLiB0aW1lb3V0IGFwcHJvYWNoLCBldGMuXHJcbiAgICAgIC8vIGhhY2s6IGZhaWwgc29vbmVyLlxyXG4gICAgICBzbTIuc2V0dXAoe1xyXG4gICAgICAgICdmbGFzaExvYWRUaW1lb3V0JzogMVxyXG4gICAgICB9KTtcclxuICAgIH1cclxuXHJcbiAgICBpZiAoZG9jLnJlbW92ZUV2ZW50TGlzdGVuZXIpIHtcclxuICAgICAgZG9jLnJlbW92ZUV2ZW50TGlzdGVuZXIoJ0RPTUNvbnRlbnRMb2FkZWQnLCBkb21Db250ZW50TG9hZGVkLCBmYWxzZSk7XHJcbiAgICB9XHJcblxyXG4gICAgaW5pdE1vdmllKCk7XHJcblxyXG4gICAgcmV0dXJuIHRydWU7XHJcblxyXG4gIH07XHJcblxyXG4gIGRvbUNvbnRlbnRMb2FkZWRJRSA9IGZ1bmN0aW9uKCkge1xyXG5cclxuICAgIGlmIChkb2MucmVhZHlTdGF0ZSA9PT0gJ2NvbXBsZXRlJykge1xyXG4gICAgICBkb21Db250ZW50TG9hZGVkKCk7XHJcbiAgICAgIGRvYy5kZXRhY2hFdmVudCgnb25yZWFkeXN0YXRlY2hhbmdlJywgZG9tQ29udGVudExvYWRlZElFKTtcclxuICAgIH1cclxuXHJcbiAgICByZXR1cm4gdHJ1ZTtcclxuXHJcbiAgfTtcclxuXHJcbiAgd2luT25Mb2FkID0gZnVuY3Rpb24oKSB7XHJcblxyXG4gICAgLy8gY2F0Y2ggZWRnZSBjYXNlIG9mIGluaXRDb21wbGV0ZSgpIGZpcmluZyBhZnRlciB3aW5kb3cubG9hZCgpXHJcbiAgICB3aW5kb3dMb2FkZWQgPSB0cnVlO1xyXG5cclxuICAgIC8vIGNhdGNoIGNhc2Ugd2hlcmUgRE9NQ29udGVudExvYWRlZCBoYXMgYmVlbiBzZW50LCBidXQgd2UncmUgc3RpbGwgaW4gZG9jLnJlYWR5U3RhdGUgPSAnaW50ZXJhY3RpdmUnXHJcbiAgICBkb21Db250ZW50TG9hZGVkKCk7XHJcblxyXG4gICAgZXZlbnQucmVtb3ZlKHdpbmRvdywgJ2xvYWQnLCB3aW5PbkxvYWQpO1xyXG5cclxuICB9O1xyXG5cclxuICAvKipcclxuICAgKiBtaXNjZWxsYW5lb3VzIHJ1bi10aW1lLCBwcmUtaW5pdCBzdHVmZlxyXG4gICAqL1xyXG5cclxuICBwcmVJbml0ID0gZnVuY3Rpb24oKSB7XHJcblxyXG4gICAgaWYgKG1vYmlsZUhUTUw1KSB7XHJcblxyXG4gICAgICAvLyBwcmVmZXIgSFRNTDUgZm9yIG1vYmlsZSArIHRhYmxldC1saWtlIGRldmljZXMsIHByb2JhYmx5IG1vcmUgcmVsaWFibGUgdnMuIGZsYXNoIGF0IHRoaXMgcG9pbnQuXHJcblxyXG4gICAgICAvLyA8ZD5cclxuICAgICAgaWYgKCFzbTIuc2V0dXBPcHRpb25zLnVzZUhUTUw1QXVkaW8gfHwgc20yLnNldHVwT3B0aW9ucy5wcmVmZXJGbGFzaCkge1xyXG4gICAgICAgIC8vIG5vdGlmeSB0aGF0IGRlZmF1bHRzIGFyZSBiZWluZyBjaGFuZ2VkLlxyXG4gICAgICAgIG1lc3NhZ2VzLnB1c2goc3RyaW5ncy5tb2JpbGVVQSk7XHJcbiAgICAgIH1cclxuICAgICAgLy8gPC9kPlxyXG5cclxuICAgICAgc20yLnNldHVwT3B0aW9ucy51c2VIVE1MNUF1ZGlvID0gdHJ1ZTtcclxuICAgICAgc20yLnNldHVwT3B0aW9ucy5wcmVmZXJGbGFzaCA9IGZhbHNlO1xyXG5cclxuICAgICAgaWYgKGlzX2lEZXZpY2UgfHwgKGlzQW5kcm9pZCAmJiAhdWEubWF0Y2goL2FuZHJvaWRcXHMyXFwuMy9pKSkpIHtcclxuICAgICAgICAvLyBpT1MgYW5kIEFuZHJvaWQgZGV2aWNlcyB0ZW5kIHRvIHdvcmsgYmV0dGVyIHdpdGggYSBzaW5nbGUgYXVkaW8gaW5zdGFuY2UsIHNwZWNpZmljYWxseSBmb3IgY2hhaW5lZCBwbGF5YmFjayBvZiBzb3VuZHMgaW4gc2VxdWVuY2UuXHJcbiAgICAgICAgLy8gY29tbW9uIHVzZSBjYXNlOiBleGl0aW5nIHNvdW5kIG9uZmluaXNoKCkgLT4gY3JlYXRlU291bmQoKSAtPiBwbGF5KClcclxuICAgICAgICAvLyA8ZD5cclxuICAgICAgICBtZXNzYWdlcy5wdXNoKHN0cmluZ3MuZ2xvYmFsSFRNTDUpO1xyXG4gICAgICAgIC8vIDwvZD5cclxuICAgICAgICBpZiAoaXNfaURldmljZSkge1xyXG4gICAgICAgICAgc20yLmlnbm9yZUZsYXNoID0gdHJ1ZTtcclxuICAgICAgICB9XHJcbiAgICAgICAgdXNlR2xvYmFsSFRNTDVBdWRpbyA9IHRydWU7XHJcbiAgICAgIH1cclxuXHJcbiAgICB9XHJcblxyXG4gIH07XHJcblxyXG4gIHByZUluaXQoKTtcclxuXHJcbiAgLy8gc25pZmYgdXAtZnJvbnRcclxuICBkZXRlY3RGbGFzaCgpO1xyXG5cclxuICAvLyBmb2N1cyBhbmQgd2luZG93IGxvYWQsIGluaXQgKHByaW1hcmlseSBmbGFzaC1kcml2ZW4pXHJcbiAgZXZlbnQuYWRkKHdpbmRvdywgJ2ZvY3VzJywgaGFuZGxlRm9jdXMpO1xyXG4gIGV2ZW50LmFkZCh3aW5kb3csICdsb2FkJywgZGVsYXlXYWl0Rm9yRUkpO1xyXG4gIGV2ZW50LmFkZCh3aW5kb3csICdsb2FkJywgd2luT25Mb2FkKTtcclxuXHJcbiAgaWYgKGRvYy5hZGRFdmVudExpc3RlbmVyKSB7XHJcblxyXG4gICAgZG9jLmFkZEV2ZW50TGlzdGVuZXIoJ0RPTUNvbnRlbnRMb2FkZWQnLCBkb21Db250ZW50TG9hZGVkLCBmYWxzZSk7XHJcblxyXG4gIH0gZWxzZSBpZiAoZG9jLmF0dGFjaEV2ZW50KSB7XHJcblxyXG4gICAgZG9jLmF0dGFjaEV2ZW50KCdvbnJlYWR5c3RhdGVjaGFuZ2UnLCBkb21Db250ZW50TG9hZGVkSUUpO1xyXG5cclxuICB9IGVsc2Uge1xyXG5cclxuICAgIC8vIG5vIGFkZC9hdHRhY2hldmVudCBzdXBwb3J0IC0gc2FmZSB0byBhc3N1bWUgbm8gSlMgLT4gRmxhc2ggZWl0aGVyXHJcbiAgICBkZWJ1Z1RTKCdvbmxvYWQnLCBmYWxzZSk7XHJcbiAgICBjYXRjaEVycm9yKHt0eXBlOidOT19ET00yX0VWRU5UUycsIGZhdGFsOnRydWV9KTtcclxuXHJcbiAgfVxyXG5cclxufSAvLyBTb3VuZE1hbmFnZXIoKVxyXG5cclxuLy8gU00yX0RFRkVSIGRldGFpbHM6IGh0dHA6Ly93d3cuc2NoaWxsbWFuaWEuY29tL3Byb2plY3RzL3NvdW5kbWFuYWdlcjIvZG9jL2dldHN0YXJ0ZWQvI2xhenktbG9hZGluZ1xyXG5cclxuaWYgKHdpbmRvdy5TTTJfREVGRVIgPT09IHVuZGVmaW5lZCB8fCAhU00yX0RFRkVSKSB7XHJcbiAgc291bmRNYW5hZ2VyID0gbmV3IFNvdW5kTWFuYWdlcigpO1xyXG59XHJcblxyXG4vKipcclxuICogU291bmRNYW5hZ2VyIHB1YmxpYyBpbnRlcmZhY2VzXHJcbiAqIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxyXG4gKi9cclxuXHJcbmlmICh0eXBlb2YgbW9kdWxlID09PSAnb2JqZWN0JyAmJiBtb2R1bGUgJiYgdHlwZW9mIG1vZHVsZS5leHBvcnRzID09PSAnb2JqZWN0Jykge1xyXG5cclxuICAvKipcclxuICAgKiBjb21tb25KUyBtb2R1bGVcclxuICAgKiBub3RlOiBTTTIgcmVxdWlyZXMgYSB3aW5kb3cgZ2xvYmFsIGR1ZSB0byBGbGFzaCwgd2hpY2ggbWFrZXMgY2FsbHMgdG8gd2luZG93LnNvdW5kTWFuYWdlci5cclxuICAgKiBmbGFzaCBtYXkgbm90IGFsd2F5cyBiZSBuZWVkZWQsIGJ1dCB0aGlzIGlzIG5vdCBrbm93biB1bnRpbCBhc3luYyBpbml0IGFuZCBTTTIgbWF5IGV2ZW4gXCJyZWJvb3RcIiBpbnRvIEZsYXNoIG1vZGUuXHJcbiAgICovXHJcblxyXG4gIHdpbmRvdy5zb3VuZE1hbmFnZXIgPSBzb3VuZE1hbmFnZXI7XHJcblxyXG4gIG1vZHVsZS5leHBvcnRzLlNvdW5kTWFuYWdlciA9IFNvdW5kTWFuYWdlcjtcclxuICBtb2R1bGUuZXhwb3J0cy5zb3VuZE1hbmFnZXIgPSBzb3VuZE1hbmFnZXI7XHJcblxyXG59IGVsc2UgaWYgKHR5cGVvZiBkZWZpbmUgPT09ICdmdW5jdGlvbicgJiYgZGVmaW5lLmFtZCkge1xyXG5cclxuICAvLyBBTUQgLSByZXF1aXJlSlNcclxuXHJcbiAgZGVmaW5lKCdTb3VuZE1hbmFnZXInLCBbXSwgZnVuY3Rpb24oKSB7XHJcbiAgICByZXR1cm4ge1xyXG4gICAgICBTb3VuZE1hbmFnZXI6IFNvdW5kTWFuYWdlcixcclxuICAgICAgc291bmRNYW5hZ2VyOiBzb3VuZE1hbmFnZXJcclxuICAgIH07XHJcbiAgfSk7XHJcblxyXG59IGVsc2Uge1xyXG5cclxuICAvLyBzdGFuZGFyZCBicm93c2VyIGNhc2VcclxuXHJcbiAgd2luZG93LlNvdW5kTWFuYWdlciA9IFNvdW5kTWFuYWdlcjsgLy8gY29uc3RydWN0b3JcclxuICB3aW5kb3cuc291bmRNYW5hZ2VyID0gc291bmRNYW5hZ2VyOyAvLyBwdWJsaWMgQVBJLCBmbGFzaCBjYWxsYmFja3MgZXRjLlxyXG5cclxufVxyXG5cclxufSh3aW5kb3cpKTtcclxuIiwiKGZ1bmN0aW9uIChnbG9iYWwpe1xuLy8hIG1vbWVudC5qc1xuLy8hIHZlcnNpb24gOiAyLjguM1xuLy8hIGF1dGhvcnMgOiBUaW0gV29vZCwgSXNrcmVuIENoZXJuZXYsIE1vbWVudC5qcyBjb250cmlidXRvcnNcbi8vISBsaWNlbnNlIDogTUlUXG4vLyEgbW9tZW50anMuY29tXG5cbihmdW5jdGlvbiAodW5kZWZpbmVkKSB7XG4gICAgLyoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKlxuICAgICAgICBDb25zdGFudHNcbiAgICAqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKiovXG5cbiAgICB2YXIgbW9tZW50LFxuICAgICAgICBWRVJTSU9OID0gJzIuOC4zJyxcbiAgICAgICAgLy8gdGhlIGdsb2JhbC1zY29wZSB0aGlzIGlzIE5PVCB0aGUgZ2xvYmFsIG9iamVjdCBpbiBOb2RlLmpzXG4gICAgICAgIGdsb2JhbFNjb3BlID0gdHlwZW9mIGdsb2JhbCAhPT0gJ3VuZGVmaW5lZCcgPyBnbG9iYWwgOiB0aGlzLFxuICAgICAgICBvbGRHbG9iYWxNb21lbnQsXG4gICAgICAgIHJvdW5kID0gTWF0aC5yb3VuZCxcbiAgICAgICAgaGFzT3duUHJvcGVydHkgPSBPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LFxuICAgICAgICBpLFxuXG4gICAgICAgIFlFQVIgPSAwLFxuICAgICAgICBNT05USCA9IDEsXG4gICAgICAgIERBVEUgPSAyLFxuICAgICAgICBIT1VSID0gMyxcbiAgICAgICAgTUlOVVRFID0gNCxcbiAgICAgICAgU0VDT05EID0gNSxcbiAgICAgICAgTUlMTElTRUNPTkQgPSA2LFxuXG4gICAgICAgIC8vIGludGVybmFsIHN0b3JhZ2UgZm9yIGxvY2FsZSBjb25maWcgZmlsZXNcbiAgICAgICAgbG9jYWxlcyA9IHt9LFxuXG4gICAgICAgIC8vIGV4dHJhIG1vbWVudCBpbnRlcm5hbCBwcm9wZXJ0aWVzIChwbHVnaW5zIHJlZ2lzdGVyIHByb3BzIGhlcmUpXG4gICAgICAgIG1vbWVudFByb3BlcnRpZXMgPSBbXSxcblxuICAgICAgICAvLyBjaGVjayBmb3Igbm9kZUpTXG4gICAgICAgIGhhc01vZHVsZSA9ICh0eXBlb2YgbW9kdWxlICE9PSAndW5kZWZpbmVkJyAmJiBtb2R1bGUuZXhwb3J0cyksXG5cbiAgICAgICAgLy8gQVNQLk5FVCBqc29uIGRhdGUgZm9ybWF0IHJlZ2V4XG4gICAgICAgIGFzcE5ldEpzb25SZWdleCA9IC9eXFwvP0RhdGVcXCgoXFwtP1xcZCspL2ksXG4gICAgICAgIGFzcE5ldFRpbWVTcGFuSnNvblJlZ2V4ID0gLyhcXC0pPyg/OihcXGQqKVxcLik/KFxcZCspXFw6KFxcZCspKD86XFw6KFxcZCspXFwuPyhcXGR7M30pPyk/LyxcblxuICAgICAgICAvLyBmcm9tIGh0dHA6Ly9kb2NzLmNsb3N1cmUtbGlicmFyeS5nb29nbGVjb2RlLmNvbS9naXQvY2xvc3VyZV9nb29nX2RhdGVfZGF0ZS5qcy5zb3VyY2UuaHRtbFxuICAgICAgICAvLyBzb21ld2hhdCBtb3JlIGluIGxpbmUgd2l0aCA0LjQuMy4yIDIwMDQgc3BlYywgYnV0IGFsbG93cyBkZWNpbWFsIGFueXdoZXJlXG4gICAgICAgIGlzb0R1cmF0aW9uUmVnZXggPSAvXigtKT9QKD86KD86KFswLTksLl0qKVkpPyg/OihbMC05LC5dKilNKT8oPzooWzAtOSwuXSopRCk/KD86VCg/OihbMC05LC5dKilIKT8oPzooWzAtOSwuXSopTSk/KD86KFswLTksLl0qKVMpPyk/fChbMC05LC5dKilXKSQvLFxuXG4gICAgICAgIC8vIGZvcm1hdCB0b2tlbnNcbiAgICAgICAgZm9ybWF0dGluZ1Rva2VucyA9IC8oXFxbW15cXFtdKlxcXSl8KFxcXFwpPyhNb3xNTT9NP00/fERvfERERG98REQ/RD9EP3xkZGQ/ZD98ZG8/fHdbb3x3XT98V1tvfFddP3xRfFlZWVlZWXxZWVlZWXxZWVlZfFlZfGdnKGdnZz8pP3xHRyhHR0c/KT98ZXxFfGF8QXxoaD98SEg/fG1tP3xzcz98U3sxLDR9fFh8eno/fFpaP3wuKS9nLFxuICAgICAgICBsb2NhbEZvcm1hdHRpbmdUb2tlbnMgPSAvKFxcW1teXFxbXSpcXF0pfChcXFxcKT8oTFR8TEw/TD9MP3xsezEsNH0pL2csXG5cbiAgICAgICAgLy8gcGFyc2luZyB0b2tlbiByZWdleGVzXG4gICAgICAgIHBhcnNlVG9rZW5PbmVPclR3b0RpZ2l0cyA9IC9cXGRcXGQ/LywgLy8gMCAtIDk5XG4gICAgICAgIHBhcnNlVG9rZW5PbmVUb1RocmVlRGlnaXRzID0gL1xcZHsxLDN9LywgLy8gMCAtIDk5OVxuICAgICAgICBwYXJzZVRva2VuT25lVG9Gb3VyRGlnaXRzID0gL1xcZHsxLDR9LywgLy8gMCAtIDk5OTlcbiAgICAgICAgcGFyc2VUb2tlbk9uZVRvU2l4RGlnaXRzID0gL1srXFwtXT9cXGR7MSw2fS8sIC8vIC05OTksOTk5IC0gOTk5LDk5OVxuICAgICAgICBwYXJzZVRva2VuRGlnaXRzID0gL1xcZCsvLCAvLyBub256ZXJvIG51bWJlciBvZiBkaWdpdHNcbiAgICAgICAgcGFyc2VUb2tlbldvcmQgPSAvWzAtOV0qWydhLXpcXHUwMEEwLVxcdTA1RkZcXHUwNzAwLVxcdUQ3RkZcXHVGOTAwLVxcdUZEQ0ZcXHVGREYwLVxcdUZGRUZdK3xbXFx1MDYwMC1cXHUwNkZGXFwvXSsoXFxzKj9bXFx1MDYwMC1cXHUwNkZGXSspezEsMn0vaSwgLy8gYW55IHdvcmQgKG9yIHR3bykgY2hhcmFjdGVycyBvciBudW1iZXJzIGluY2x1ZGluZyB0d28vdGhyZWUgd29yZCBtb250aCBpbiBhcmFiaWMuXG4gICAgICAgIHBhcnNlVG9rZW5UaW1lem9uZSA9IC9afFtcXCtcXC1dXFxkXFxkOj9cXGRcXGQvZ2ksIC8vICswMDowMCAtMDA6MDAgKzAwMDAgLTAwMDAgb3IgWlxuICAgICAgICBwYXJzZVRva2VuVCA9IC9UL2ksIC8vIFQgKElTTyBzZXBhcmF0b3IpXG4gICAgICAgIHBhcnNlVG9rZW5UaW1lc3RhbXBNcyA9IC9bXFwrXFwtXT9cXGQrKFxcLlxcZHsxLDN9KT8vLCAvLyAxMjM0NTY3ODkgMTIzNDU2Nzg5LjEyM1xuICAgICAgICBwYXJzZVRva2VuT3JkaW5hbCA9IC9cXGR7MSwyfS8sXG5cbiAgICAgICAgLy9zdHJpY3QgcGFyc2luZyByZWdleGVzXG4gICAgICAgIHBhcnNlVG9rZW5PbmVEaWdpdCA9IC9cXGQvLCAvLyAwIC0gOVxuICAgICAgICBwYXJzZVRva2VuVHdvRGlnaXRzID0gL1xcZFxcZC8sIC8vIDAwIC0gOTlcbiAgICAgICAgcGFyc2VUb2tlblRocmVlRGlnaXRzID0gL1xcZHszfS8sIC8vIDAwMCAtIDk5OVxuICAgICAgICBwYXJzZVRva2VuRm91ckRpZ2l0cyA9IC9cXGR7NH0vLCAvLyAwMDAwIC0gOTk5OVxuICAgICAgICBwYXJzZVRva2VuU2l4RGlnaXRzID0gL1srLV0/XFxkezZ9LywgLy8gLTk5OSw5OTkgLSA5OTksOTk5XG4gICAgICAgIHBhcnNlVG9rZW5TaWduZWROdW1iZXIgPSAvWystXT9cXGQrLywgLy8gLWluZiAtIGluZlxuXG4gICAgICAgIC8vIGlzbyA4NjAxIHJlZ2V4XG4gICAgICAgIC8vIDAwMDAtMDAtMDAgMDAwMC1XMDAgb3IgMDAwMC1XMDAtMCArIFQgKyAwMCBvciAwMDowMCBvciAwMDowMDowMCBvciAwMDowMDowMC4wMDAgKyArMDA6MDAgb3IgKzAwMDAgb3IgKzAwKVxuICAgICAgICBpc29SZWdleCA9IC9eXFxzKig/OlsrLV1cXGR7Nn18XFxkezR9KS0oPzooXFxkXFxkLVxcZFxcZCl8KFdcXGRcXGQkKXwoV1xcZFxcZC1cXGQpfChcXGRcXGRcXGQpKSgoVHwgKShcXGRcXGQoOlxcZFxcZCg6XFxkXFxkKFxcLlxcZCspPyk/KT8pPyhbXFwrXFwtXVxcZFxcZCg/Ojo/XFxkXFxkKT98XFxzKlopPyk/JC8sXG5cbiAgICAgICAgaXNvRm9ybWF0ID0gJ1lZWVktTU0tRERUSEg6bW06c3NaJyxcblxuICAgICAgICBpc29EYXRlcyA9IFtcbiAgICAgICAgICAgIFsnWVlZWVlZLU1NLUREJywgL1srLV1cXGR7Nn0tXFxkezJ9LVxcZHsyfS9dLFxuICAgICAgICAgICAgWydZWVlZLU1NLUREJywgL1xcZHs0fS1cXGR7Mn0tXFxkezJ9L10sXG4gICAgICAgICAgICBbJ0dHR0ctW1ddV1ctRScsIC9cXGR7NH0tV1xcZHsyfS1cXGQvXSxcbiAgICAgICAgICAgIFsnR0dHRy1bV11XVycsIC9cXGR7NH0tV1xcZHsyfS9dLFxuICAgICAgICAgICAgWydZWVlZLURERCcsIC9cXGR7NH0tXFxkezN9L11cbiAgICAgICAgXSxcblxuICAgICAgICAvLyBpc28gdGltZSBmb3JtYXRzIGFuZCByZWdleGVzXG4gICAgICAgIGlzb1RpbWVzID0gW1xuICAgICAgICAgICAgWydISDptbTpzcy5TU1NTJywgLyhUfCApXFxkXFxkOlxcZFxcZDpcXGRcXGRcXC5cXGQrL10sXG4gICAgICAgICAgICBbJ0hIOm1tOnNzJywgLyhUfCApXFxkXFxkOlxcZFxcZDpcXGRcXGQvXSxcbiAgICAgICAgICAgIFsnSEg6bW0nLCAvKFR8IClcXGRcXGQ6XFxkXFxkL10sXG4gICAgICAgICAgICBbJ0hIJywgLyhUfCApXFxkXFxkL11cbiAgICAgICAgXSxcblxuICAgICAgICAvLyB0aW1lem9uZSBjaHVua2VyICcrMTA6MDAnID4gWycxMCcsICcwMCddIG9yICctMTUzMCcgPiBbJy0xNScsICczMCddXG4gICAgICAgIHBhcnNlVGltZXpvbmVDaHVua2VyID0gLyhbXFwrXFwtXXxcXGRcXGQpL2dpLFxuXG4gICAgICAgIC8vIGdldHRlciBhbmQgc2V0dGVyIG5hbWVzXG4gICAgICAgIHByb3h5R2V0dGVyc0FuZFNldHRlcnMgPSAnRGF0ZXxIb3Vyc3xNaW51dGVzfFNlY29uZHN8TWlsbGlzZWNvbmRzJy5zcGxpdCgnfCcpLFxuICAgICAgICB1bml0TWlsbGlzZWNvbmRGYWN0b3JzID0ge1xuICAgICAgICAgICAgJ01pbGxpc2Vjb25kcycgOiAxLFxuICAgICAgICAgICAgJ1NlY29uZHMnIDogMWUzLFxuICAgICAgICAgICAgJ01pbnV0ZXMnIDogNmU0LFxuICAgICAgICAgICAgJ0hvdXJzJyA6IDM2ZTUsXG4gICAgICAgICAgICAnRGF5cycgOiA4NjRlNSxcbiAgICAgICAgICAgICdNb250aHMnIDogMjU5MmU2LFxuICAgICAgICAgICAgJ1llYXJzJyA6IDMxNTM2ZTZcbiAgICAgICAgfSxcblxuICAgICAgICB1bml0QWxpYXNlcyA9IHtcbiAgICAgICAgICAgIG1zIDogJ21pbGxpc2Vjb25kJyxcbiAgICAgICAgICAgIHMgOiAnc2Vjb25kJyxcbiAgICAgICAgICAgIG0gOiAnbWludXRlJyxcbiAgICAgICAgICAgIGggOiAnaG91cicsXG4gICAgICAgICAgICBkIDogJ2RheScsXG4gICAgICAgICAgICBEIDogJ2RhdGUnLFxuICAgICAgICAgICAgdyA6ICd3ZWVrJyxcbiAgICAgICAgICAgIFcgOiAnaXNvV2VlaycsXG4gICAgICAgICAgICBNIDogJ21vbnRoJyxcbiAgICAgICAgICAgIFEgOiAncXVhcnRlcicsXG4gICAgICAgICAgICB5IDogJ3llYXInLFxuICAgICAgICAgICAgREREIDogJ2RheU9mWWVhcicsXG4gICAgICAgICAgICBlIDogJ3dlZWtkYXknLFxuICAgICAgICAgICAgRSA6ICdpc29XZWVrZGF5JyxcbiAgICAgICAgICAgIGdnOiAnd2Vla1llYXInLFxuICAgICAgICAgICAgR0c6ICdpc29XZWVrWWVhcidcbiAgICAgICAgfSxcblxuICAgICAgICBjYW1lbEZ1bmN0aW9ucyA9IHtcbiAgICAgICAgICAgIGRheW9meWVhciA6ICdkYXlPZlllYXInLFxuICAgICAgICAgICAgaXNvd2Vla2RheSA6ICdpc29XZWVrZGF5JyxcbiAgICAgICAgICAgIGlzb3dlZWsgOiAnaXNvV2VlaycsXG4gICAgICAgICAgICB3ZWVreWVhciA6ICd3ZWVrWWVhcicsXG4gICAgICAgICAgICBpc293ZWVreWVhciA6ICdpc29XZWVrWWVhcidcbiAgICAgICAgfSxcblxuICAgICAgICAvLyBmb3JtYXQgZnVuY3Rpb24gc3RyaW5nc1xuICAgICAgICBmb3JtYXRGdW5jdGlvbnMgPSB7fSxcblxuICAgICAgICAvLyBkZWZhdWx0IHJlbGF0aXZlIHRpbWUgdGhyZXNob2xkc1xuICAgICAgICByZWxhdGl2ZVRpbWVUaHJlc2hvbGRzID0ge1xuICAgICAgICAgICAgczogNDUsICAvLyBzZWNvbmRzIHRvIG1pbnV0ZVxuICAgICAgICAgICAgbTogNDUsICAvLyBtaW51dGVzIHRvIGhvdXJcbiAgICAgICAgICAgIGg6IDIyLCAgLy8gaG91cnMgdG8gZGF5XG4gICAgICAgICAgICBkOiAyNiwgIC8vIGRheXMgdG8gbW9udGhcbiAgICAgICAgICAgIE06IDExICAgLy8gbW9udGhzIHRvIHllYXJcbiAgICAgICAgfSxcblxuICAgICAgICAvLyB0b2tlbnMgdG8gb3JkaW5hbGl6ZSBhbmQgcGFkXG4gICAgICAgIG9yZGluYWxpemVUb2tlbnMgPSAnREREIHcgVyBNIEQgZCcuc3BsaXQoJyAnKSxcbiAgICAgICAgcGFkZGVkVG9rZW5zID0gJ00gRCBIIGggbSBzIHcgVycuc3BsaXQoJyAnKSxcblxuICAgICAgICBmb3JtYXRUb2tlbkZ1bmN0aW9ucyA9IHtcbiAgICAgICAgICAgIE0gICAgOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHRoaXMubW9udGgoKSArIDE7XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgTU1NICA6IGZ1bmN0aW9uIChmb3JtYXQpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gdGhpcy5sb2NhbGVEYXRhKCkubW9udGhzU2hvcnQodGhpcywgZm9ybWF0KTtcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBNTU1NIDogZnVuY3Rpb24gKGZvcm1hdCkge1xuICAgICAgICAgICAgICAgIHJldHVybiB0aGlzLmxvY2FsZURhdGEoKS5tb250aHModGhpcywgZm9ybWF0KTtcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBEICAgIDogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgIHJldHVybiB0aGlzLmRhdGUoKTtcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBEREQgIDogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgIHJldHVybiB0aGlzLmRheU9mWWVhcigpO1xuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIGQgICAgOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHRoaXMuZGF5KCk7XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgZGQgICA6IGZ1bmN0aW9uIChmb3JtYXQpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gdGhpcy5sb2NhbGVEYXRhKCkud2Vla2RheXNNaW4odGhpcywgZm9ybWF0KTtcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBkZGQgIDogZnVuY3Rpb24gKGZvcm1hdCkge1xuICAgICAgICAgICAgICAgIHJldHVybiB0aGlzLmxvY2FsZURhdGEoKS53ZWVrZGF5c1Nob3J0KHRoaXMsIGZvcm1hdCk7XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgZGRkZCA6IGZ1bmN0aW9uIChmb3JtYXQpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gdGhpcy5sb2NhbGVEYXRhKCkud2Vla2RheXModGhpcywgZm9ybWF0KTtcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICB3ICAgIDogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgIHJldHVybiB0aGlzLndlZWsoKTtcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBXICAgIDogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgIHJldHVybiB0aGlzLmlzb1dlZWsoKTtcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBZWSAgIDogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgIHJldHVybiBsZWZ0WmVyb0ZpbGwodGhpcy55ZWFyKCkgJSAxMDAsIDIpO1xuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIFlZWVkgOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGxlZnRaZXJvRmlsbCh0aGlzLnllYXIoKSwgNCk7XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgWVlZWVkgOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGxlZnRaZXJvRmlsbCh0aGlzLnllYXIoKSwgNSk7XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgWVlZWVlZIDogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgIHZhciB5ID0gdGhpcy55ZWFyKCksIHNpZ24gPSB5ID49IDAgPyAnKycgOiAnLSc7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHNpZ24gKyBsZWZ0WmVyb0ZpbGwoTWF0aC5hYnMoeSksIDYpO1xuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIGdnICAgOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGxlZnRaZXJvRmlsbCh0aGlzLndlZWtZZWFyKCkgJSAxMDAsIDIpO1xuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIGdnZ2cgOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGxlZnRaZXJvRmlsbCh0aGlzLndlZWtZZWFyKCksIDQpO1xuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIGdnZ2dnIDogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgIHJldHVybiBsZWZ0WmVyb0ZpbGwodGhpcy53ZWVrWWVhcigpLCA1KTtcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBHRyAgIDogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgIHJldHVybiBsZWZ0WmVyb0ZpbGwodGhpcy5pc29XZWVrWWVhcigpICUgMTAwLCAyKTtcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBHR0dHIDogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgIHJldHVybiBsZWZ0WmVyb0ZpbGwodGhpcy5pc29XZWVrWWVhcigpLCA0KTtcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBHR0dHRyA6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gbGVmdFplcm9GaWxsKHRoaXMuaXNvV2Vla1llYXIoKSwgNSk7XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgZSA6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gdGhpcy53ZWVrZGF5KCk7XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgRSA6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gdGhpcy5pc29XZWVrZGF5KCk7XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgYSAgICA6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gdGhpcy5sb2NhbGVEYXRhKCkubWVyaWRpZW0odGhpcy5ob3VycygpLCB0aGlzLm1pbnV0ZXMoKSwgdHJ1ZSk7XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgQSAgICA6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gdGhpcy5sb2NhbGVEYXRhKCkubWVyaWRpZW0odGhpcy5ob3VycygpLCB0aGlzLm1pbnV0ZXMoKSwgZmFsc2UpO1xuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIEggICAgOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHRoaXMuaG91cnMoKTtcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBoICAgIDogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgIHJldHVybiB0aGlzLmhvdXJzKCkgJSAxMiB8fCAxMjtcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBtICAgIDogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgIHJldHVybiB0aGlzLm1pbnV0ZXMoKTtcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBzICAgIDogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgIHJldHVybiB0aGlzLnNlY29uZHMoKTtcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBTICAgIDogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgIHJldHVybiB0b0ludCh0aGlzLm1pbGxpc2Vjb25kcygpIC8gMTAwKTtcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBTUyAgIDogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgIHJldHVybiBsZWZ0WmVyb0ZpbGwodG9JbnQodGhpcy5taWxsaXNlY29uZHMoKSAvIDEwKSwgMik7XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgU1NTICA6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gbGVmdFplcm9GaWxsKHRoaXMubWlsbGlzZWNvbmRzKCksIDMpO1xuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIFNTU1MgOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGxlZnRaZXJvRmlsbCh0aGlzLm1pbGxpc2Vjb25kcygpLCAzKTtcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBaICAgIDogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgIHZhciBhID0gLXRoaXMuem9uZSgpLFxuICAgICAgICAgICAgICAgICAgICBiID0gJysnO1xuICAgICAgICAgICAgICAgIGlmIChhIDwgMCkge1xuICAgICAgICAgICAgICAgICAgICBhID0gLWE7XG4gICAgICAgICAgICAgICAgICAgIGIgPSAnLSc7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIHJldHVybiBiICsgbGVmdFplcm9GaWxsKHRvSW50KGEgLyA2MCksIDIpICsgJzonICsgbGVmdFplcm9GaWxsKHRvSW50KGEpICUgNjAsIDIpO1xuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIFpaICAgOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgdmFyIGEgPSAtdGhpcy56b25lKCksXG4gICAgICAgICAgICAgICAgICAgIGIgPSAnKyc7XG4gICAgICAgICAgICAgICAgaWYgKGEgPCAwKSB7XG4gICAgICAgICAgICAgICAgICAgIGEgPSAtYTtcbiAgICAgICAgICAgICAgICAgICAgYiA9ICctJztcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgcmV0dXJuIGIgKyBsZWZ0WmVyb0ZpbGwodG9JbnQoYSAvIDYwKSwgMikgKyBsZWZ0WmVyb0ZpbGwodG9JbnQoYSkgJSA2MCwgMik7XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgeiA6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gdGhpcy56b25lQWJicigpO1xuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIHp6IDogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgIHJldHVybiB0aGlzLnpvbmVOYW1lKCk7XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgWCAgICA6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gdGhpcy51bml4KCk7XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgUSA6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gdGhpcy5xdWFydGVyKCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0sXG5cbiAgICAgICAgZGVwcmVjYXRpb25zID0ge30sXG5cbiAgICAgICAgbGlzdHMgPSBbJ21vbnRocycsICdtb250aHNTaG9ydCcsICd3ZWVrZGF5cycsICd3ZWVrZGF5c1Nob3J0JywgJ3dlZWtkYXlzTWluJ107XG5cbiAgICAvLyBQaWNrIHRoZSBmaXJzdCBkZWZpbmVkIG9mIHR3byBvciB0aHJlZSBhcmd1bWVudHMuIGRmbCBjb21lcyBmcm9tXG4gICAgLy8gZGVmYXVsdC5cbiAgICBmdW5jdGlvbiBkZmwoYSwgYiwgYykge1xuICAgICAgICBzd2l0Y2ggKGFyZ3VtZW50cy5sZW5ndGgpIHtcbiAgICAgICAgICAgIGNhc2UgMjogcmV0dXJuIGEgIT0gbnVsbCA/IGEgOiBiO1xuICAgICAgICAgICAgY2FzZSAzOiByZXR1cm4gYSAhPSBudWxsID8gYSA6IGIgIT0gbnVsbCA/IGIgOiBjO1xuICAgICAgICAgICAgZGVmYXVsdDogdGhyb3cgbmV3IEVycm9yKCdJbXBsZW1lbnQgbWUnKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIGZ1bmN0aW9uIGhhc093blByb3AoYSwgYikge1xuICAgICAgICByZXR1cm4gaGFzT3duUHJvcGVydHkuY2FsbChhLCBiKTtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBkZWZhdWx0UGFyc2luZ0ZsYWdzKCkge1xuICAgICAgICAvLyBXZSBuZWVkIHRvIGRlZXAgY2xvbmUgdGhpcyBvYmplY3QsIGFuZCBlczUgc3RhbmRhcmQgaXMgbm90IHZlcnlcbiAgICAgICAgLy8gaGVscGZ1bC5cbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgIGVtcHR5IDogZmFsc2UsXG4gICAgICAgICAgICB1bnVzZWRUb2tlbnMgOiBbXSxcbiAgICAgICAgICAgIHVudXNlZElucHV0IDogW10sXG4gICAgICAgICAgICBvdmVyZmxvdyA6IC0yLFxuICAgICAgICAgICAgY2hhcnNMZWZ0T3ZlciA6IDAsXG4gICAgICAgICAgICBudWxsSW5wdXQgOiBmYWxzZSxcbiAgICAgICAgICAgIGludmFsaWRNb250aCA6IG51bGwsXG4gICAgICAgICAgICBpbnZhbGlkRm9ybWF0IDogZmFsc2UsXG4gICAgICAgICAgICB1c2VySW52YWxpZGF0ZWQgOiBmYWxzZSxcbiAgICAgICAgICAgIGlzbzogZmFsc2VcbiAgICAgICAgfTtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBwcmludE1zZyhtc2cpIHtcbiAgICAgICAgaWYgKG1vbWVudC5zdXBwcmVzc0RlcHJlY2F0aW9uV2FybmluZ3MgPT09IGZhbHNlICYmXG4gICAgICAgICAgICAgICAgdHlwZW9mIGNvbnNvbGUgIT09ICd1bmRlZmluZWQnICYmIGNvbnNvbGUud2Fybikge1xuICAgICAgICAgICAgY29uc29sZS53YXJuKCdEZXByZWNhdGlvbiB3YXJuaW5nOiAnICsgbXNnKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIGZ1bmN0aW9uIGRlcHJlY2F0ZShtc2csIGZuKSB7XG4gICAgICAgIHZhciBmaXJzdFRpbWUgPSB0cnVlO1xuICAgICAgICByZXR1cm4gZXh0ZW5kKGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIGlmIChmaXJzdFRpbWUpIHtcbiAgICAgICAgICAgICAgICBwcmludE1zZyhtc2cpO1xuICAgICAgICAgICAgICAgIGZpcnN0VGltZSA9IGZhbHNlO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIGZuLmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XG4gICAgICAgIH0sIGZuKTtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBkZXByZWNhdGVTaW1wbGUobmFtZSwgbXNnKSB7XG4gICAgICAgIGlmICghZGVwcmVjYXRpb25zW25hbWVdKSB7XG4gICAgICAgICAgICBwcmludE1zZyhtc2cpO1xuICAgICAgICAgICAgZGVwcmVjYXRpb25zW25hbWVdID0gdHJ1ZTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIGZ1bmN0aW9uIHBhZFRva2VuKGZ1bmMsIGNvdW50KSB7XG4gICAgICAgIHJldHVybiBmdW5jdGlvbiAoYSkge1xuICAgICAgICAgICAgcmV0dXJuIGxlZnRaZXJvRmlsbChmdW5jLmNhbGwodGhpcywgYSksIGNvdW50KTtcbiAgICAgICAgfTtcbiAgICB9XG4gICAgZnVuY3Rpb24gb3JkaW5hbGl6ZVRva2VuKGZ1bmMsIHBlcmlvZCkge1xuICAgICAgICByZXR1cm4gZnVuY3Rpb24gKGEpIHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLmxvY2FsZURhdGEoKS5vcmRpbmFsKGZ1bmMuY2FsbCh0aGlzLCBhKSwgcGVyaW9kKTtcbiAgICAgICAgfTtcbiAgICB9XG5cbiAgICB3aGlsZSAob3JkaW5hbGl6ZVRva2Vucy5sZW5ndGgpIHtcbiAgICAgICAgaSA9IG9yZGluYWxpemVUb2tlbnMucG9wKCk7XG4gICAgICAgIGZvcm1hdFRva2VuRnVuY3Rpb25zW2kgKyAnbyddID0gb3JkaW5hbGl6ZVRva2VuKGZvcm1hdFRva2VuRnVuY3Rpb25zW2ldLCBpKTtcbiAgICB9XG4gICAgd2hpbGUgKHBhZGRlZFRva2Vucy5sZW5ndGgpIHtcbiAgICAgICAgaSA9IHBhZGRlZFRva2Vucy5wb3AoKTtcbiAgICAgICAgZm9ybWF0VG9rZW5GdW5jdGlvbnNbaSArIGldID0gcGFkVG9rZW4oZm9ybWF0VG9rZW5GdW5jdGlvbnNbaV0sIDIpO1xuICAgIH1cbiAgICBmb3JtYXRUb2tlbkZ1bmN0aW9ucy5EREREID0gcGFkVG9rZW4oZm9ybWF0VG9rZW5GdW5jdGlvbnMuRERELCAzKTtcblxuXG4gICAgLyoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKlxuICAgICAgICBDb25zdHJ1Y3RvcnNcbiAgICAqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKiovXG5cbiAgICBmdW5jdGlvbiBMb2NhbGUoKSB7XG4gICAgfVxuXG4gICAgLy8gTW9tZW50IHByb3RvdHlwZSBvYmplY3RcbiAgICBmdW5jdGlvbiBNb21lbnQoY29uZmlnLCBza2lwT3ZlcmZsb3cpIHtcbiAgICAgICAgaWYgKHNraXBPdmVyZmxvdyAhPT0gZmFsc2UpIHtcbiAgICAgICAgICAgIGNoZWNrT3ZlcmZsb3coY29uZmlnKTtcbiAgICAgICAgfVxuICAgICAgICBjb3B5Q29uZmlnKHRoaXMsIGNvbmZpZyk7XG4gICAgICAgIHRoaXMuX2QgPSBuZXcgRGF0ZSgrY29uZmlnLl9kKTtcbiAgICB9XG5cbiAgICAvLyBEdXJhdGlvbiBDb25zdHJ1Y3RvclxuICAgIGZ1bmN0aW9uIER1cmF0aW9uKGR1cmF0aW9uKSB7XG4gICAgICAgIHZhciBub3JtYWxpemVkSW5wdXQgPSBub3JtYWxpemVPYmplY3RVbml0cyhkdXJhdGlvbiksXG4gICAgICAgICAgICB5ZWFycyA9IG5vcm1hbGl6ZWRJbnB1dC55ZWFyIHx8IDAsXG4gICAgICAgICAgICBxdWFydGVycyA9IG5vcm1hbGl6ZWRJbnB1dC5xdWFydGVyIHx8IDAsXG4gICAgICAgICAgICBtb250aHMgPSBub3JtYWxpemVkSW5wdXQubW9udGggfHwgMCxcbiAgICAgICAgICAgIHdlZWtzID0gbm9ybWFsaXplZElucHV0LndlZWsgfHwgMCxcbiAgICAgICAgICAgIGRheXMgPSBub3JtYWxpemVkSW5wdXQuZGF5IHx8IDAsXG4gICAgICAgICAgICBob3VycyA9IG5vcm1hbGl6ZWRJbnB1dC5ob3VyIHx8IDAsXG4gICAgICAgICAgICBtaW51dGVzID0gbm9ybWFsaXplZElucHV0Lm1pbnV0ZSB8fCAwLFxuICAgICAgICAgICAgc2Vjb25kcyA9IG5vcm1hbGl6ZWRJbnB1dC5zZWNvbmQgfHwgMCxcbiAgICAgICAgICAgIG1pbGxpc2Vjb25kcyA9IG5vcm1hbGl6ZWRJbnB1dC5taWxsaXNlY29uZCB8fCAwO1xuXG4gICAgICAgIC8vIHJlcHJlc2VudGF0aW9uIGZvciBkYXRlQWRkUmVtb3ZlXG4gICAgICAgIHRoaXMuX21pbGxpc2Vjb25kcyA9ICttaWxsaXNlY29uZHMgK1xuICAgICAgICAgICAgc2Vjb25kcyAqIDFlMyArIC8vIDEwMDBcbiAgICAgICAgICAgIG1pbnV0ZXMgKiA2ZTQgKyAvLyAxMDAwICogNjBcbiAgICAgICAgICAgIGhvdXJzICogMzZlNTsgLy8gMTAwMCAqIDYwICogNjBcbiAgICAgICAgLy8gQmVjYXVzZSBvZiBkYXRlQWRkUmVtb3ZlIHRyZWF0cyAyNCBob3VycyBhcyBkaWZmZXJlbnQgZnJvbSBhXG4gICAgICAgIC8vIGRheSB3aGVuIHdvcmtpbmcgYXJvdW5kIERTVCwgd2UgbmVlZCB0byBzdG9yZSB0aGVtIHNlcGFyYXRlbHlcbiAgICAgICAgdGhpcy5fZGF5cyA9ICtkYXlzICtcbiAgICAgICAgICAgIHdlZWtzICogNztcbiAgICAgICAgLy8gSXQgaXMgaW1wb3NzaWJsZSB0cmFuc2xhdGUgbW9udGhzIGludG8gZGF5cyB3aXRob3V0IGtub3dpbmdcbiAgICAgICAgLy8gd2hpY2ggbW9udGhzIHlvdSBhcmUgYXJlIHRhbGtpbmcgYWJvdXQsIHNvIHdlIGhhdmUgdG8gc3RvcmVcbiAgICAgICAgLy8gaXQgc2VwYXJhdGVseS5cbiAgICAgICAgdGhpcy5fbW9udGhzID0gK21vbnRocyArXG4gICAgICAgICAgICBxdWFydGVycyAqIDMgK1xuICAgICAgICAgICAgeWVhcnMgKiAxMjtcblxuICAgICAgICB0aGlzLl9kYXRhID0ge307XG5cbiAgICAgICAgdGhpcy5fbG9jYWxlID0gbW9tZW50LmxvY2FsZURhdGEoKTtcblxuICAgICAgICB0aGlzLl9idWJibGUoKTtcbiAgICB9XG5cbiAgICAvKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqXG4gICAgICAgIEhlbHBlcnNcbiAgICAqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKiovXG5cblxuICAgIGZ1bmN0aW9uIGV4dGVuZChhLCBiKSB7XG4gICAgICAgIGZvciAodmFyIGkgaW4gYikge1xuICAgICAgICAgICAgaWYgKGhhc093blByb3AoYiwgaSkpIHtcbiAgICAgICAgICAgICAgICBhW2ldID0gYltpXTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChoYXNPd25Qcm9wKGIsICd0b1N0cmluZycpKSB7XG4gICAgICAgICAgICBhLnRvU3RyaW5nID0gYi50b1N0cmluZztcbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChoYXNPd25Qcm9wKGIsICd2YWx1ZU9mJykpIHtcbiAgICAgICAgICAgIGEudmFsdWVPZiA9IGIudmFsdWVPZjtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiBhO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIGNvcHlDb25maWcodG8sIGZyb20pIHtcbiAgICAgICAgdmFyIGksIHByb3AsIHZhbDtcblxuICAgICAgICBpZiAodHlwZW9mIGZyb20uX2lzQU1vbWVudE9iamVjdCAhPT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAgICAgICAgIHRvLl9pc0FNb21lbnRPYmplY3QgPSBmcm9tLl9pc0FNb21lbnRPYmplY3Q7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKHR5cGVvZiBmcm9tLl9pICE9PSAndW5kZWZpbmVkJykge1xuICAgICAgICAgICAgdG8uX2kgPSBmcm9tLl9pO1xuICAgICAgICB9XG4gICAgICAgIGlmICh0eXBlb2YgZnJvbS5fZiAhPT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAgICAgICAgIHRvLl9mID0gZnJvbS5fZjtcbiAgICAgICAgfVxuICAgICAgICBpZiAodHlwZW9mIGZyb20uX2wgIT09ICd1bmRlZmluZWQnKSB7XG4gICAgICAgICAgICB0by5fbCA9IGZyb20uX2w7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKHR5cGVvZiBmcm9tLl9zdHJpY3QgIT09ICd1bmRlZmluZWQnKSB7XG4gICAgICAgICAgICB0by5fc3RyaWN0ID0gZnJvbS5fc3RyaWN0O1xuICAgICAgICB9XG4gICAgICAgIGlmICh0eXBlb2YgZnJvbS5fdHptICE9PSAndW5kZWZpbmVkJykge1xuICAgICAgICAgICAgdG8uX3R6bSA9IGZyb20uX3R6bTtcbiAgICAgICAgfVxuICAgICAgICBpZiAodHlwZW9mIGZyb20uX2lzVVRDICE9PSAndW5kZWZpbmVkJykge1xuICAgICAgICAgICAgdG8uX2lzVVRDID0gZnJvbS5faXNVVEM7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKHR5cGVvZiBmcm9tLl9vZmZzZXQgIT09ICd1bmRlZmluZWQnKSB7XG4gICAgICAgICAgICB0by5fb2Zmc2V0ID0gZnJvbS5fb2Zmc2V0O1xuICAgICAgICB9XG4gICAgICAgIGlmICh0eXBlb2YgZnJvbS5fcGYgIT09ICd1bmRlZmluZWQnKSB7XG4gICAgICAgICAgICB0by5fcGYgPSBmcm9tLl9wZjtcbiAgICAgICAgfVxuICAgICAgICBpZiAodHlwZW9mIGZyb20uX2xvY2FsZSAhPT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAgICAgICAgIHRvLl9sb2NhbGUgPSBmcm9tLl9sb2NhbGU7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAobW9tZW50UHJvcGVydGllcy5sZW5ndGggPiAwKSB7XG4gICAgICAgICAgICBmb3IgKGkgaW4gbW9tZW50UHJvcGVydGllcykge1xuICAgICAgICAgICAgICAgIHByb3AgPSBtb21lbnRQcm9wZXJ0aWVzW2ldO1xuICAgICAgICAgICAgICAgIHZhbCA9IGZyb21bcHJvcF07XG4gICAgICAgICAgICAgICAgaWYgKHR5cGVvZiB2YWwgIT09ICd1bmRlZmluZWQnKSB7XG4gICAgICAgICAgICAgICAgICAgIHRvW3Byb3BdID0gdmFsO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiB0bztcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBhYnNSb3VuZChudW1iZXIpIHtcbiAgICAgICAgaWYgKG51bWJlciA8IDApIHtcbiAgICAgICAgICAgIHJldHVybiBNYXRoLmNlaWwobnVtYmVyKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHJldHVybiBNYXRoLmZsb29yKG51bWJlcik7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICAvLyBsZWZ0IHplcm8gZmlsbCBhIG51bWJlclxuICAgIC8vIHNlZSBodHRwOi8vanNwZXJmLmNvbS9sZWZ0LXplcm8tZmlsbGluZyBmb3IgcGVyZm9ybWFuY2UgY29tcGFyaXNvblxuICAgIGZ1bmN0aW9uIGxlZnRaZXJvRmlsbChudW1iZXIsIHRhcmdldExlbmd0aCwgZm9yY2VTaWduKSB7XG4gICAgICAgIHZhciBvdXRwdXQgPSAnJyArIE1hdGguYWJzKG51bWJlciksXG4gICAgICAgICAgICBzaWduID0gbnVtYmVyID49IDA7XG5cbiAgICAgICAgd2hpbGUgKG91dHB1dC5sZW5ndGggPCB0YXJnZXRMZW5ndGgpIHtcbiAgICAgICAgICAgIG91dHB1dCA9ICcwJyArIG91dHB1dDtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gKHNpZ24gPyAoZm9yY2VTaWduID8gJysnIDogJycpIDogJy0nKSArIG91dHB1dDtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBwb3NpdGl2ZU1vbWVudHNEaWZmZXJlbmNlKGJhc2UsIG90aGVyKSB7XG4gICAgICAgIHZhciByZXMgPSB7bWlsbGlzZWNvbmRzOiAwLCBtb250aHM6IDB9O1xuXG4gICAgICAgIHJlcy5tb250aHMgPSBvdGhlci5tb250aCgpIC0gYmFzZS5tb250aCgpICtcbiAgICAgICAgICAgIChvdGhlci55ZWFyKCkgLSBiYXNlLnllYXIoKSkgKiAxMjtcbiAgICAgICAgaWYgKGJhc2UuY2xvbmUoKS5hZGQocmVzLm1vbnRocywgJ00nKS5pc0FmdGVyKG90aGVyKSkge1xuICAgICAgICAgICAgLS1yZXMubW9udGhzO1xuICAgICAgICB9XG5cbiAgICAgICAgcmVzLm1pbGxpc2Vjb25kcyA9ICtvdGhlciAtICsoYmFzZS5jbG9uZSgpLmFkZChyZXMubW9udGhzLCAnTScpKTtcblxuICAgICAgICByZXR1cm4gcmVzO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIG1vbWVudHNEaWZmZXJlbmNlKGJhc2UsIG90aGVyKSB7XG4gICAgICAgIHZhciByZXM7XG4gICAgICAgIG90aGVyID0gbWFrZUFzKG90aGVyLCBiYXNlKTtcbiAgICAgICAgaWYgKGJhc2UuaXNCZWZvcmUob3RoZXIpKSB7XG4gICAgICAgICAgICByZXMgPSBwb3NpdGl2ZU1vbWVudHNEaWZmZXJlbmNlKGJhc2UsIG90aGVyKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHJlcyA9IHBvc2l0aXZlTW9tZW50c0RpZmZlcmVuY2Uob3RoZXIsIGJhc2UpO1xuICAgICAgICAgICAgcmVzLm1pbGxpc2Vjb25kcyA9IC1yZXMubWlsbGlzZWNvbmRzO1xuICAgICAgICAgICAgcmVzLm1vbnRocyA9IC1yZXMubW9udGhzO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIHJlcztcbiAgICB9XG5cbiAgICAvLyBUT0RPOiByZW1vdmUgJ25hbWUnIGFyZyBhZnRlciBkZXByZWNhdGlvbiBpcyByZW1vdmVkXG4gICAgZnVuY3Rpb24gY3JlYXRlQWRkZXIoZGlyZWN0aW9uLCBuYW1lKSB7XG4gICAgICAgIHJldHVybiBmdW5jdGlvbiAodmFsLCBwZXJpb2QpIHtcbiAgICAgICAgICAgIHZhciBkdXIsIHRtcDtcbiAgICAgICAgICAgIC8vaW52ZXJ0IHRoZSBhcmd1bWVudHMsIGJ1dCBjb21wbGFpbiBhYm91dCBpdFxuICAgICAgICAgICAgaWYgKHBlcmlvZCAhPT0gbnVsbCAmJiAhaXNOYU4oK3BlcmlvZCkpIHtcbiAgICAgICAgICAgICAgICBkZXByZWNhdGVTaW1wbGUobmFtZSwgJ21vbWVudCgpLicgKyBuYW1lICArICcocGVyaW9kLCBudW1iZXIpIGlzIGRlcHJlY2F0ZWQuIFBsZWFzZSB1c2UgbW9tZW50KCkuJyArIG5hbWUgKyAnKG51bWJlciwgcGVyaW9kKS4nKTtcbiAgICAgICAgICAgICAgICB0bXAgPSB2YWw7IHZhbCA9IHBlcmlvZDsgcGVyaW9kID0gdG1wO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICB2YWwgPSB0eXBlb2YgdmFsID09PSAnc3RyaW5nJyA/ICt2YWwgOiB2YWw7XG4gICAgICAgICAgICBkdXIgPSBtb21lbnQuZHVyYXRpb24odmFsLCBwZXJpb2QpO1xuICAgICAgICAgICAgYWRkT3JTdWJ0cmFjdER1cmF0aW9uRnJvbU1vbWVudCh0aGlzLCBkdXIsIGRpcmVjdGlvbik7XG4gICAgICAgICAgICByZXR1cm4gdGhpcztcbiAgICAgICAgfTtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBhZGRPclN1YnRyYWN0RHVyYXRpb25Gcm9tTW9tZW50KG1vbSwgZHVyYXRpb24sIGlzQWRkaW5nLCB1cGRhdGVPZmZzZXQpIHtcbiAgICAgICAgdmFyIG1pbGxpc2Vjb25kcyA9IGR1cmF0aW9uLl9taWxsaXNlY29uZHMsXG4gICAgICAgICAgICBkYXlzID0gZHVyYXRpb24uX2RheXMsXG4gICAgICAgICAgICBtb250aHMgPSBkdXJhdGlvbi5fbW9udGhzO1xuICAgICAgICB1cGRhdGVPZmZzZXQgPSB1cGRhdGVPZmZzZXQgPT0gbnVsbCA/IHRydWUgOiB1cGRhdGVPZmZzZXQ7XG5cbiAgICAgICAgaWYgKG1pbGxpc2Vjb25kcykge1xuICAgICAgICAgICAgbW9tLl9kLnNldFRpbWUoK21vbS5fZCArIG1pbGxpc2Vjb25kcyAqIGlzQWRkaW5nKTtcbiAgICAgICAgfVxuICAgICAgICBpZiAoZGF5cykge1xuICAgICAgICAgICAgcmF3U2V0dGVyKG1vbSwgJ0RhdGUnLCByYXdHZXR0ZXIobW9tLCAnRGF0ZScpICsgZGF5cyAqIGlzQWRkaW5nKTtcbiAgICAgICAgfVxuICAgICAgICBpZiAobW9udGhzKSB7XG4gICAgICAgICAgICByYXdNb250aFNldHRlcihtb20sIHJhd0dldHRlcihtb20sICdNb250aCcpICsgbW9udGhzICogaXNBZGRpbmcpO1xuICAgICAgICB9XG4gICAgICAgIGlmICh1cGRhdGVPZmZzZXQpIHtcbiAgICAgICAgICAgIG1vbWVudC51cGRhdGVPZmZzZXQobW9tLCBkYXlzIHx8IG1vbnRocyk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICAvLyBjaGVjayBpZiBpcyBhbiBhcnJheVxuICAgIGZ1bmN0aW9uIGlzQXJyYXkoaW5wdXQpIHtcbiAgICAgICAgcmV0dXJuIE9iamVjdC5wcm90b3R5cGUudG9TdHJpbmcuY2FsbChpbnB1dCkgPT09ICdbb2JqZWN0IEFycmF5XSc7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gaXNEYXRlKGlucHV0KSB7XG4gICAgICAgIHJldHVybiBPYmplY3QucHJvdG90eXBlLnRvU3RyaW5nLmNhbGwoaW5wdXQpID09PSAnW29iamVjdCBEYXRlXScgfHxcbiAgICAgICAgICAgIGlucHV0IGluc3RhbmNlb2YgRGF0ZTtcbiAgICB9XG5cbiAgICAvLyBjb21wYXJlIHR3byBhcnJheXMsIHJldHVybiB0aGUgbnVtYmVyIG9mIGRpZmZlcmVuY2VzXG4gICAgZnVuY3Rpb24gY29tcGFyZUFycmF5cyhhcnJheTEsIGFycmF5MiwgZG9udENvbnZlcnQpIHtcbiAgICAgICAgdmFyIGxlbiA9IE1hdGgubWluKGFycmF5MS5sZW5ndGgsIGFycmF5Mi5sZW5ndGgpLFxuICAgICAgICAgICAgbGVuZ3RoRGlmZiA9IE1hdGguYWJzKGFycmF5MS5sZW5ndGggLSBhcnJheTIubGVuZ3RoKSxcbiAgICAgICAgICAgIGRpZmZzID0gMCxcbiAgICAgICAgICAgIGk7XG4gICAgICAgIGZvciAoaSA9IDA7IGkgPCBsZW47IGkrKykge1xuICAgICAgICAgICAgaWYgKChkb250Q29udmVydCAmJiBhcnJheTFbaV0gIT09IGFycmF5MltpXSkgfHxcbiAgICAgICAgICAgICAgICAoIWRvbnRDb252ZXJ0ICYmIHRvSW50KGFycmF5MVtpXSkgIT09IHRvSW50KGFycmF5MltpXSkpKSB7XG4gICAgICAgICAgICAgICAgZGlmZnMrKztcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gZGlmZnMgKyBsZW5ndGhEaWZmO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIG5vcm1hbGl6ZVVuaXRzKHVuaXRzKSB7XG4gICAgICAgIGlmICh1bml0cykge1xuICAgICAgICAgICAgdmFyIGxvd2VyZWQgPSB1bml0cy50b0xvd2VyQ2FzZSgpLnJlcGxhY2UoLyguKXMkLywgJyQxJyk7XG4gICAgICAgICAgICB1bml0cyA9IHVuaXRBbGlhc2VzW3VuaXRzXSB8fCBjYW1lbEZ1bmN0aW9uc1tsb3dlcmVkXSB8fCBsb3dlcmVkO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiB1bml0cztcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBub3JtYWxpemVPYmplY3RVbml0cyhpbnB1dE9iamVjdCkge1xuICAgICAgICB2YXIgbm9ybWFsaXplZElucHV0ID0ge30sXG4gICAgICAgICAgICBub3JtYWxpemVkUHJvcCxcbiAgICAgICAgICAgIHByb3A7XG5cbiAgICAgICAgZm9yIChwcm9wIGluIGlucHV0T2JqZWN0KSB7XG4gICAgICAgICAgICBpZiAoaGFzT3duUHJvcChpbnB1dE9iamVjdCwgcHJvcCkpIHtcbiAgICAgICAgICAgICAgICBub3JtYWxpemVkUHJvcCA9IG5vcm1hbGl6ZVVuaXRzKHByb3ApO1xuICAgICAgICAgICAgICAgIGlmIChub3JtYWxpemVkUHJvcCkge1xuICAgICAgICAgICAgICAgICAgICBub3JtYWxpemVkSW5wdXRbbm9ybWFsaXplZFByb3BdID0gaW5wdXRPYmplY3RbcHJvcF07XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIG5vcm1hbGl6ZWRJbnB1dDtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBtYWtlTGlzdChmaWVsZCkge1xuICAgICAgICB2YXIgY291bnQsIHNldHRlcjtcblxuICAgICAgICBpZiAoZmllbGQuaW5kZXhPZignd2VlaycpID09PSAwKSB7XG4gICAgICAgICAgICBjb3VudCA9IDc7XG4gICAgICAgICAgICBzZXR0ZXIgPSAnZGF5JztcbiAgICAgICAgfVxuICAgICAgICBlbHNlIGlmIChmaWVsZC5pbmRleE9mKCdtb250aCcpID09PSAwKSB7XG4gICAgICAgICAgICBjb3VudCA9IDEyO1xuICAgICAgICAgICAgc2V0dGVyID0gJ21vbnRoJztcbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIG1vbWVudFtmaWVsZF0gPSBmdW5jdGlvbiAoZm9ybWF0LCBpbmRleCkge1xuICAgICAgICAgICAgdmFyIGksIGdldHRlcixcbiAgICAgICAgICAgICAgICBtZXRob2QgPSBtb21lbnQuX2xvY2FsZVtmaWVsZF0sXG4gICAgICAgICAgICAgICAgcmVzdWx0cyA9IFtdO1xuXG4gICAgICAgICAgICBpZiAodHlwZW9mIGZvcm1hdCA9PT0gJ251bWJlcicpIHtcbiAgICAgICAgICAgICAgICBpbmRleCA9IGZvcm1hdDtcbiAgICAgICAgICAgICAgICBmb3JtYXQgPSB1bmRlZmluZWQ7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGdldHRlciA9IGZ1bmN0aW9uIChpKSB7XG4gICAgICAgICAgICAgICAgdmFyIG0gPSBtb21lbnQoKS51dGMoKS5zZXQoc2V0dGVyLCBpKTtcbiAgICAgICAgICAgICAgICByZXR1cm4gbWV0aG9kLmNhbGwobW9tZW50Ll9sb2NhbGUsIG0sIGZvcm1hdCB8fCAnJyk7XG4gICAgICAgICAgICB9O1xuXG4gICAgICAgICAgICBpZiAoaW5kZXggIT0gbnVsbCkge1xuICAgICAgICAgICAgICAgIHJldHVybiBnZXR0ZXIoaW5kZXgpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgZm9yIChpID0gMDsgaSA8IGNvdW50OyBpKyspIHtcbiAgICAgICAgICAgICAgICAgICAgcmVzdWx0cy5wdXNoKGdldHRlcihpKSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIHJldHVybiByZXN1bHRzO1xuICAgICAgICAgICAgfVxuICAgICAgICB9O1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIHRvSW50KGFyZ3VtZW50Rm9yQ29lcmNpb24pIHtcbiAgICAgICAgdmFyIGNvZXJjZWROdW1iZXIgPSArYXJndW1lbnRGb3JDb2VyY2lvbixcbiAgICAgICAgICAgIHZhbHVlID0gMDtcblxuICAgICAgICBpZiAoY29lcmNlZE51bWJlciAhPT0gMCAmJiBpc0Zpbml0ZShjb2VyY2VkTnVtYmVyKSkge1xuICAgICAgICAgICAgaWYgKGNvZXJjZWROdW1iZXIgPj0gMCkge1xuICAgICAgICAgICAgICAgIHZhbHVlID0gTWF0aC5mbG9vcihjb2VyY2VkTnVtYmVyKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgdmFsdWUgPSBNYXRoLmNlaWwoY29lcmNlZE51bWJlcik7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gdmFsdWU7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gZGF5c0luTW9udGgoeWVhciwgbW9udGgpIHtcbiAgICAgICAgcmV0dXJuIG5ldyBEYXRlKERhdGUuVVRDKHllYXIsIG1vbnRoICsgMSwgMCkpLmdldFVUQ0RhdGUoKTtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiB3ZWVrc0luWWVhcih5ZWFyLCBkb3csIGRveSkge1xuICAgICAgICByZXR1cm4gd2Vla09mWWVhcihtb21lbnQoW3llYXIsIDExLCAzMSArIGRvdyAtIGRveV0pLCBkb3csIGRveSkud2VlaztcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBkYXlzSW5ZZWFyKHllYXIpIHtcbiAgICAgICAgcmV0dXJuIGlzTGVhcFllYXIoeWVhcikgPyAzNjYgOiAzNjU7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gaXNMZWFwWWVhcih5ZWFyKSB7XG4gICAgICAgIHJldHVybiAoeWVhciAlIDQgPT09IDAgJiYgeWVhciAlIDEwMCAhPT0gMCkgfHwgeWVhciAlIDQwMCA9PT0gMDtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBjaGVja092ZXJmbG93KG0pIHtcbiAgICAgICAgdmFyIG92ZXJmbG93O1xuICAgICAgICBpZiAobS5fYSAmJiBtLl9wZi5vdmVyZmxvdyA9PT0gLTIpIHtcbiAgICAgICAgICAgIG92ZXJmbG93ID1cbiAgICAgICAgICAgICAgICBtLl9hW01PTlRIXSA8IDAgfHwgbS5fYVtNT05USF0gPiAxMSA/IE1PTlRIIDpcbiAgICAgICAgICAgICAgICBtLl9hW0RBVEVdIDwgMSB8fCBtLl9hW0RBVEVdID4gZGF5c0luTW9udGgobS5fYVtZRUFSXSwgbS5fYVtNT05USF0pID8gREFURSA6XG4gICAgICAgICAgICAgICAgbS5fYVtIT1VSXSA8IDAgfHwgbS5fYVtIT1VSXSA+IDIzID8gSE9VUiA6XG4gICAgICAgICAgICAgICAgbS5fYVtNSU5VVEVdIDwgMCB8fCBtLl9hW01JTlVURV0gPiA1OSA/IE1JTlVURSA6XG4gICAgICAgICAgICAgICAgbS5fYVtTRUNPTkRdIDwgMCB8fCBtLl9hW1NFQ09ORF0gPiA1OSA/IFNFQ09ORCA6XG4gICAgICAgICAgICAgICAgbS5fYVtNSUxMSVNFQ09ORF0gPCAwIHx8IG0uX2FbTUlMTElTRUNPTkRdID4gOTk5ID8gTUlMTElTRUNPTkQgOlxuICAgICAgICAgICAgICAgIC0xO1xuXG4gICAgICAgICAgICBpZiAobS5fcGYuX292ZXJmbG93RGF5T2ZZZWFyICYmIChvdmVyZmxvdyA8IFlFQVIgfHwgb3ZlcmZsb3cgPiBEQVRFKSkge1xuICAgICAgICAgICAgICAgIG92ZXJmbG93ID0gREFURTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgbS5fcGYub3ZlcmZsb3cgPSBvdmVyZmxvdztcbiAgICAgICAgfVxuICAgIH1cblxuICAgIGZ1bmN0aW9uIGlzVmFsaWQobSkge1xuICAgICAgICBpZiAobS5faXNWYWxpZCA9PSBudWxsKSB7XG4gICAgICAgICAgICBtLl9pc1ZhbGlkID0gIWlzTmFOKG0uX2QuZ2V0VGltZSgpKSAmJlxuICAgICAgICAgICAgICAgIG0uX3BmLm92ZXJmbG93IDwgMCAmJlxuICAgICAgICAgICAgICAgICFtLl9wZi5lbXB0eSAmJlxuICAgICAgICAgICAgICAgICFtLl9wZi5pbnZhbGlkTW9udGggJiZcbiAgICAgICAgICAgICAgICAhbS5fcGYubnVsbElucHV0ICYmXG4gICAgICAgICAgICAgICAgIW0uX3BmLmludmFsaWRGb3JtYXQgJiZcbiAgICAgICAgICAgICAgICAhbS5fcGYudXNlckludmFsaWRhdGVkO1xuXG4gICAgICAgICAgICBpZiAobS5fc3RyaWN0KSB7XG4gICAgICAgICAgICAgICAgbS5faXNWYWxpZCA9IG0uX2lzVmFsaWQgJiZcbiAgICAgICAgICAgICAgICAgICAgbS5fcGYuY2hhcnNMZWZ0T3ZlciA9PT0gMCAmJlxuICAgICAgICAgICAgICAgICAgICBtLl9wZi51bnVzZWRUb2tlbnMubGVuZ3RoID09PSAwO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHJldHVybiBtLl9pc1ZhbGlkO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIG5vcm1hbGl6ZUxvY2FsZShrZXkpIHtcbiAgICAgICAgcmV0dXJuIGtleSA/IGtleS50b0xvd2VyQ2FzZSgpLnJlcGxhY2UoJ18nLCAnLScpIDoga2V5O1xuICAgIH1cblxuICAgIC8vIHBpY2sgdGhlIGxvY2FsZSBmcm9tIHRoZSBhcnJheVxuICAgIC8vIHRyeSBbJ2VuLWF1JywgJ2VuLWdiJ10gYXMgJ2VuLWF1JywgJ2VuLWdiJywgJ2VuJywgYXMgaW4gbW92ZSB0aHJvdWdoIHRoZSBsaXN0IHRyeWluZyBlYWNoXG4gICAgLy8gc3Vic3RyaW5nIGZyb20gbW9zdCBzcGVjaWZpYyB0byBsZWFzdCwgYnV0IG1vdmUgdG8gdGhlIG5leHQgYXJyYXkgaXRlbSBpZiBpdCdzIGEgbW9yZSBzcGVjaWZpYyB2YXJpYW50IHRoYW4gdGhlIGN1cnJlbnQgcm9vdFxuICAgIGZ1bmN0aW9uIGNob29zZUxvY2FsZShuYW1lcykge1xuICAgICAgICB2YXIgaSA9IDAsIGosIG5leHQsIGxvY2FsZSwgc3BsaXQ7XG5cbiAgICAgICAgd2hpbGUgKGkgPCBuYW1lcy5sZW5ndGgpIHtcbiAgICAgICAgICAgIHNwbGl0ID0gbm9ybWFsaXplTG9jYWxlKG5hbWVzW2ldKS5zcGxpdCgnLScpO1xuICAgICAgICAgICAgaiA9IHNwbGl0Lmxlbmd0aDtcbiAgICAgICAgICAgIG5leHQgPSBub3JtYWxpemVMb2NhbGUobmFtZXNbaSArIDFdKTtcbiAgICAgICAgICAgIG5leHQgPSBuZXh0ID8gbmV4dC5zcGxpdCgnLScpIDogbnVsbDtcbiAgICAgICAgICAgIHdoaWxlIChqID4gMCkge1xuICAgICAgICAgICAgICAgIGxvY2FsZSA9IGxvYWRMb2NhbGUoc3BsaXQuc2xpY2UoMCwgaikuam9pbignLScpKTtcbiAgICAgICAgICAgICAgICBpZiAobG9jYWxlKSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBsb2NhbGU7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGlmIChuZXh0ICYmIG5leHQubGVuZ3RoID49IGogJiYgY29tcGFyZUFycmF5cyhzcGxpdCwgbmV4dCwgdHJ1ZSkgPj0gaiAtIDEpIHtcbiAgICAgICAgICAgICAgICAgICAgLy90aGUgbmV4dCBhcnJheSBpdGVtIGlzIGJldHRlciB0aGFuIGEgc2hhbGxvd2VyIHN1YnN0cmluZyBvZiB0aGlzIG9uZVxuICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgai0tO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaSsrO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBudWxsO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIGxvYWRMb2NhbGUobmFtZSkge1xuICAgICAgICB2YXIgb2xkTG9jYWxlID0gbnVsbDtcbiAgICAgICAgaWYgKCFsb2NhbGVzW25hbWVdICYmIGhhc01vZHVsZSkge1xuICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICBvbGRMb2NhbGUgPSBtb21lbnQubG9jYWxlKCk7XG4gICAgICAgICAgICAgICAgcmVxdWlyZSgnLi9sb2NhbGUvJyArIG5hbWUpO1xuICAgICAgICAgICAgICAgIC8vIGJlY2F1c2UgZGVmaW5lTG9jYWxlIGN1cnJlbnRseSBhbHNvIHNldHMgdGhlIGdsb2JhbCBsb2NhbGUsIHdlIHdhbnQgdG8gdW5kbyB0aGF0IGZvciBsYXp5IGxvYWRlZCBsb2NhbGVzXG4gICAgICAgICAgICAgICAgbW9tZW50LmxvY2FsZShvbGRMb2NhbGUpO1xuICAgICAgICAgICAgfSBjYXRjaCAoZSkgeyB9XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGxvY2FsZXNbbmFtZV07XG4gICAgfVxuXG4gICAgLy8gUmV0dXJuIGEgbW9tZW50IGZyb20gaW5wdXQsIHRoYXQgaXMgbG9jYWwvdXRjL3pvbmUgZXF1aXZhbGVudCB0byBtb2RlbC5cbiAgICBmdW5jdGlvbiBtYWtlQXMoaW5wdXQsIG1vZGVsKSB7XG4gICAgICAgIHJldHVybiBtb2RlbC5faXNVVEMgPyBtb21lbnQoaW5wdXQpLnpvbmUobW9kZWwuX29mZnNldCB8fCAwKSA6XG4gICAgICAgICAgICBtb21lbnQoaW5wdXQpLmxvY2FsKCk7XG4gICAgfVxuXG4gICAgLyoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKlxuICAgICAgICBMb2NhbGVcbiAgICAqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKiovXG5cblxuICAgIGV4dGVuZChMb2NhbGUucHJvdG90eXBlLCB7XG5cbiAgICAgICAgc2V0IDogZnVuY3Rpb24gKGNvbmZpZykge1xuICAgICAgICAgICAgdmFyIHByb3AsIGk7XG4gICAgICAgICAgICBmb3IgKGkgaW4gY29uZmlnKSB7XG4gICAgICAgICAgICAgICAgcHJvcCA9IGNvbmZpZ1tpXTtcbiAgICAgICAgICAgICAgICBpZiAodHlwZW9mIHByb3AgPT09ICdmdW5jdGlvbicpIHtcbiAgICAgICAgICAgICAgICAgICAgdGhpc1tpXSA9IHByb3A7XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgdGhpc1snXycgKyBpXSA9IHByb3A7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9LFxuXG4gICAgICAgIF9tb250aHMgOiAnSmFudWFyeV9GZWJydWFyeV9NYXJjaF9BcHJpbF9NYXlfSnVuZV9KdWx5X0F1Z3VzdF9TZXB0ZW1iZXJfT2N0b2Jlcl9Ob3ZlbWJlcl9EZWNlbWJlcicuc3BsaXQoJ18nKSxcbiAgICAgICAgbW9udGhzIDogZnVuY3Rpb24gKG0pIHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLl9tb250aHNbbS5tb250aCgpXTtcbiAgICAgICAgfSxcblxuICAgICAgICBfbW9udGhzU2hvcnQgOiAnSmFuX0ZlYl9NYXJfQXByX01heV9KdW5fSnVsX0F1Z19TZXBfT2N0X05vdl9EZWMnLnNwbGl0KCdfJyksXG4gICAgICAgIG1vbnRoc1Nob3J0IDogZnVuY3Rpb24gKG0pIHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLl9tb250aHNTaG9ydFttLm1vbnRoKCldO1xuICAgICAgICB9LFxuXG4gICAgICAgIG1vbnRoc1BhcnNlIDogZnVuY3Rpb24gKG1vbnRoTmFtZSkge1xuICAgICAgICAgICAgdmFyIGksIG1vbSwgcmVnZXg7XG5cbiAgICAgICAgICAgIGlmICghdGhpcy5fbW9udGhzUGFyc2UpIHtcbiAgICAgICAgICAgICAgICB0aGlzLl9tb250aHNQYXJzZSA9IFtdO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBmb3IgKGkgPSAwOyBpIDwgMTI7IGkrKykge1xuICAgICAgICAgICAgICAgIC8vIG1ha2UgdGhlIHJlZ2V4IGlmIHdlIGRvbid0IGhhdmUgaXQgYWxyZWFkeVxuICAgICAgICAgICAgICAgIGlmICghdGhpcy5fbW9udGhzUGFyc2VbaV0pIHtcbiAgICAgICAgICAgICAgICAgICAgbW9tID0gbW9tZW50LnV0YyhbMjAwMCwgaV0pO1xuICAgICAgICAgICAgICAgICAgICByZWdleCA9ICdeJyArIHRoaXMubW9udGhzKG1vbSwgJycpICsgJ3xeJyArIHRoaXMubW9udGhzU2hvcnQobW9tLCAnJyk7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuX21vbnRoc1BhcnNlW2ldID0gbmV3IFJlZ0V4cChyZWdleC5yZXBsYWNlKCcuJywgJycpLCAnaScpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAvLyB0ZXN0IHRoZSByZWdleFxuICAgICAgICAgICAgICAgIGlmICh0aGlzLl9tb250aHNQYXJzZVtpXS50ZXN0KG1vbnRoTmFtZSkpIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9LFxuXG4gICAgICAgIF93ZWVrZGF5cyA6ICdTdW5kYXlfTW9uZGF5X1R1ZXNkYXlfV2VkbmVzZGF5X1RodXJzZGF5X0ZyaWRheV9TYXR1cmRheScuc3BsaXQoJ18nKSxcbiAgICAgICAgd2Vla2RheXMgOiBmdW5jdGlvbiAobSkge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMuX3dlZWtkYXlzW20uZGF5KCldO1xuICAgICAgICB9LFxuXG4gICAgICAgIF93ZWVrZGF5c1Nob3J0IDogJ1N1bl9Nb25fVHVlX1dlZF9UaHVfRnJpX1NhdCcuc3BsaXQoJ18nKSxcbiAgICAgICAgd2Vla2RheXNTaG9ydCA6IGZ1bmN0aW9uIChtKSB7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5fd2Vla2RheXNTaG9ydFttLmRheSgpXTtcbiAgICAgICAgfSxcblxuICAgICAgICBfd2Vla2RheXNNaW4gOiAnU3VfTW9fVHVfV2VfVGhfRnJfU2EnLnNwbGl0KCdfJyksXG4gICAgICAgIHdlZWtkYXlzTWluIDogZnVuY3Rpb24gKG0pIHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLl93ZWVrZGF5c01pblttLmRheSgpXTtcbiAgICAgICAgfSxcblxuICAgICAgICB3ZWVrZGF5c1BhcnNlIDogZnVuY3Rpb24gKHdlZWtkYXlOYW1lKSB7XG4gICAgICAgICAgICB2YXIgaSwgbW9tLCByZWdleDtcblxuICAgICAgICAgICAgaWYgKCF0aGlzLl93ZWVrZGF5c1BhcnNlKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5fd2Vla2RheXNQYXJzZSA9IFtdO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBmb3IgKGkgPSAwOyBpIDwgNzsgaSsrKSB7XG4gICAgICAgICAgICAgICAgLy8gbWFrZSB0aGUgcmVnZXggaWYgd2UgZG9uJ3QgaGF2ZSBpdCBhbHJlYWR5XG4gICAgICAgICAgICAgICAgaWYgKCF0aGlzLl93ZWVrZGF5c1BhcnNlW2ldKSB7XG4gICAgICAgICAgICAgICAgICAgIG1vbSA9IG1vbWVudChbMjAwMCwgMV0pLmRheShpKTtcbiAgICAgICAgICAgICAgICAgICAgcmVnZXggPSAnXicgKyB0aGlzLndlZWtkYXlzKG1vbSwgJycpICsgJ3xeJyArIHRoaXMud2Vla2RheXNTaG9ydChtb20sICcnKSArICd8XicgKyB0aGlzLndlZWtkYXlzTWluKG1vbSwgJycpO1xuICAgICAgICAgICAgICAgICAgICB0aGlzLl93ZWVrZGF5c1BhcnNlW2ldID0gbmV3IFJlZ0V4cChyZWdleC5yZXBsYWNlKCcuJywgJycpLCAnaScpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAvLyB0ZXN0IHRoZSByZWdleFxuICAgICAgICAgICAgICAgIGlmICh0aGlzLl93ZWVrZGF5c1BhcnNlW2ldLnRlc3Qod2Vla2RheU5hbWUpKSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfSxcblxuICAgICAgICBfbG9uZ0RhdGVGb3JtYXQgOiB7XG4gICAgICAgICAgICBMVCA6ICdoOm1tIEEnLFxuICAgICAgICAgICAgTCA6ICdNTS9ERC9ZWVlZJyxcbiAgICAgICAgICAgIExMIDogJ01NTU0gRCwgWVlZWScsXG4gICAgICAgICAgICBMTEwgOiAnTU1NTSBELCBZWVlZIExUJyxcbiAgICAgICAgICAgIExMTEwgOiAnZGRkZCwgTU1NTSBELCBZWVlZIExUJ1xuICAgICAgICB9LFxuICAgICAgICBsb25nRGF0ZUZvcm1hdCA6IGZ1bmN0aW9uIChrZXkpIHtcbiAgICAgICAgICAgIHZhciBvdXRwdXQgPSB0aGlzLl9sb25nRGF0ZUZvcm1hdFtrZXldO1xuICAgICAgICAgICAgaWYgKCFvdXRwdXQgJiYgdGhpcy5fbG9uZ0RhdGVGb3JtYXRba2V5LnRvVXBwZXJDYXNlKCldKSB7XG4gICAgICAgICAgICAgICAgb3V0cHV0ID0gdGhpcy5fbG9uZ0RhdGVGb3JtYXRba2V5LnRvVXBwZXJDYXNlKCldLnJlcGxhY2UoL01NTU18TU18RER8ZGRkZC9nLCBmdW5jdGlvbiAodmFsKSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiB2YWwuc2xpY2UoMSk7XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgdGhpcy5fbG9uZ0RhdGVGb3JtYXRba2V5XSA9IG91dHB1dDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiBvdXRwdXQ7XG4gICAgICAgIH0sXG5cbiAgICAgICAgaXNQTSA6IGZ1bmN0aW9uIChpbnB1dCkge1xuICAgICAgICAgICAgLy8gSUU4IFF1aXJrcyBNb2RlICYgSUU3IFN0YW5kYXJkcyBNb2RlIGRvIG5vdCBhbGxvdyBhY2Nlc3Npbmcgc3RyaW5ncyBsaWtlIGFycmF5c1xuICAgICAgICAgICAgLy8gVXNpbmcgY2hhckF0IHNob3VsZCBiZSBtb3JlIGNvbXBhdGlibGUuXG4gICAgICAgICAgICByZXR1cm4gKChpbnB1dCArICcnKS50b0xvd2VyQ2FzZSgpLmNoYXJBdCgwKSA9PT0gJ3AnKTtcbiAgICAgICAgfSxcblxuICAgICAgICBfbWVyaWRpZW1QYXJzZSA6IC9bYXBdXFwuP20/XFwuPy9pLFxuICAgICAgICBtZXJpZGllbSA6IGZ1bmN0aW9uIChob3VycywgbWludXRlcywgaXNMb3dlcikge1xuICAgICAgICAgICAgaWYgKGhvdXJzID4gMTEpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gaXNMb3dlciA/ICdwbScgOiAnUE0nO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gaXNMb3dlciA/ICdhbScgOiAnQU0nO1xuICAgICAgICAgICAgfVxuICAgICAgICB9LFxuXG4gICAgICAgIF9jYWxlbmRhciA6IHtcbiAgICAgICAgICAgIHNhbWVEYXkgOiAnW1RvZGF5IGF0XSBMVCcsXG4gICAgICAgICAgICBuZXh0RGF5IDogJ1tUb21vcnJvdyBhdF0gTFQnLFxuICAgICAgICAgICAgbmV4dFdlZWsgOiAnZGRkZCBbYXRdIExUJyxcbiAgICAgICAgICAgIGxhc3REYXkgOiAnW1llc3RlcmRheSBhdF0gTFQnLFxuICAgICAgICAgICAgbGFzdFdlZWsgOiAnW0xhc3RdIGRkZGQgW2F0XSBMVCcsXG4gICAgICAgICAgICBzYW1lRWxzZSA6ICdMJ1xuICAgICAgICB9LFxuICAgICAgICBjYWxlbmRhciA6IGZ1bmN0aW9uIChrZXksIG1vbSkge1xuICAgICAgICAgICAgdmFyIG91dHB1dCA9IHRoaXMuX2NhbGVuZGFyW2tleV07XG4gICAgICAgICAgICByZXR1cm4gdHlwZW9mIG91dHB1dCA9PT0gJ2Z1bmN0aW9uJyA/IG91dHB1dC5hcHBseShtb20pIDogb3V0cHV0O1xuICAgICAgICB9LFxuXG4gICAgICAgIF9yZWxhdGl2ZVRpbWUgOiB7XG4gICAgICAgICAgICBmdXR1cmUgOiAnaW4gJXMnLFxuICAgICAgICAgICAgcGFzdCA6ICclcyBhZ28nLFxuICAgICAgICAgICAgcyA6ICdhIGZldyBzZWNvbmRzJyxcbiAgICAgICAgICAgIG0gOiAnYSBtaW51dGUnLFxuICAgICAgICAgICAgbW0gOiAnJWQgbWludXRlcycsXG4gICAgICAgICAgICBoIDogJ2FuIGhvdXInLFxuICAgICAgICAgICAgaGggOiAnJWQgaG91cnMnLFxuICAgICAgICAgICAgZCA6ICdhIGRheScsXG4gICAgICAgICAgICBkZCA6ICclZCBkYXlzJyxcbiAgICAgICAgICAgIE0gOiAnYSBtb250aCcsXG4gICAgICAgICAgICBNTSA6ICclZCBtb250aHMnLFxuICAgICAgICAgICAgeSA6ICdhIHllYXInLFxuICAgICAgICAgICAgeXkgOiAnJWQgeWVhcnMnXG4gICAgICAgIH0sXG5cbiAgICAgICAgcmVsYXRpdmVUaW1lIDogZnVuY3Rpb24gKG51bWJlciwgd2l0aG91dFN1ZmZpeCwgc3RyaW5nLCBpc0Z1dHVyZSkge1xuICAgICAgICAgICAgdmFyIG91dHB1dCA9IHRoaXMuX3JlbGF0aXZlVGltZVtzdHJpbmddO1xuICAgICAgICAgICAgcmV0dXJuICh0eXBlb2Ygb3V0cHV0ID09PSAnZnVuY3Rpb24nKSA/XG4gICAgICAgICAgICAgICAgb3V0cHV0KG51bWJlciwgd2l0aG91dFN1ZmZpeCwgc3RyaW5nLCBpc0Z1dHVyZSkgOlxuICAgICAgICAgICAgICAgIG91dHB1dC5yZXBsYWNlKC8lZC9pLCBudW1iZXIpO1xuICAgICAgICB9LFxuXG4gICAgICAgIHBhc3RGdXR1cmUgOiBmdW5jdGlvbiAoZGlmZiwgb3V0cHV0KSB7XG4gICAgICAgICAgICB2YXIgZm9ybWF0ID0gdGhpcy5fcmVsYXRpdmVUaW1lW2RpZmYgPiAwID8gJ2Z1dHVyZScgOiAncGFzdCddO1xuICAgICAgICAgICAgcmV0dXJuIHR5cGVvZiBmb3JtYXQgPT09ICdmdW5jdGlvbicgPyBmb3JtYXQob3V0cHV0KSA6IGZvcm1hdC5yZXBsYWNlKC8lcy9pLCBvdXRwdXQpO1xuICAgICAgICB9LFxuXG4gICAgICAgIG9yZGluYWwgOiBmdW5jdGlvbiAobnVtYmVyKSB7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5fb3JkaW5hbC5yZXBsYWNlKCclZCcsIG51bWJlcik7XG4gICAgICAgIH0sXG4gICAgICAgIF9vcmRpbmFsIDogJyVkJyxcblxuICAgICAgICBwcmVwYXJzZSA6IGZ1bmN0aW9uIChzdHJpbmcpIHtcbiAgICAgICAgICAgIHJldHVybiBzdHJpbmc7XG4gICAgICAgIH0sXG5cbiAgICAgICAgcG9zdGZvcm1hdCA6IGZ1bmN0aW9uIChzdHJpbmcpIHtcbiAgICAgICAgICAgIHJldHVybiBzdHJpbmc7XG4gICAgICAgIH0sXG5cbiAgICAgICAgd2VlayA6IGZ1bmN0aW9uIChtb20pIHtcbiAgICAgICAgICAgIHJldHVybiB3ZWVrT2ZZZWFyKG1vbSwgdGhpcy5fd2Vlay5kb3csIHRoaXMuX3dlZWsuZG95KS53ZWVrO1xuICAgICAgICB9LFxuXG4gICAgICAgIF93ZWVrIDoge1xuICAgICAgICAgICAgZG93IDogMCwgLy8gU3VuZGF5IGlzIHRoZSBmaXJzdCBkYXkgb2YgdGhlIHdlZWsuXG4gICAgICAgICAgICBkb3kgOiA2ICAvLyBUaGUgd2VlayB0aGF0IGNvbnRhaW5zIEphbiAxc3QgaXMgdGhlIGZpcnN0IHdlZWsgb2YgdGhlIHllYXIuXG4gICAgICAgIH0sXG5cbiAgICAgICAgX2ludmFsaWREYXRlOiAnSW52YWxpZCBkYXRlJyxcbiAgICAgICAgaW52YWxpZERhdGU6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLl9pbnZhbGlkRGF0ZTtcbiAgICAgICAgfVxuICAgIH0pO1xuXG4gICAgLyoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKlxuICAgICAgICBGb3JtYXR0aW5nXG4gICAgKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqL1xuXG5cbiAgICBmdW5jdGlvbiByZW1vdmVGb3JtYXR0aW5nVG9rZW5zKGlucHV0KSB7XG4gICAgICAgIGlmIChpbnB1dC5tYXRjaCgvXFxbW1xcc1xcU10vKSkge1xuICAgICAgICAgICAgcmV0dXJuIGlucHV0LnJlcGxhY2UoL15cXFt8XFxdJC9nLCAnJyk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGlucHV0LnJlcGxhY2UoL1xcXFwvZywgJycpO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIG1ha2VGb3JtYXRGdW5jdGlvbihmb3JtYXQpIHtcbiAgICAgICAgdmFyIGFycmF5ID0gZm9ybWF0Lm1hdGNoKGZvcm1hdHRpbmdUb2tlbnMpLCBpLCBsZW5ndGg7XG5cbiAgICAgICAgZm9yIChpID0gMCwgbGVuZ3RoID0gYXJyYXkubGVuZ3RoOyBpIDwgbGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgIGlmIChmb3JtYXRUb2tlbkZ1bmN0aW9uc1thcnJheVtpXV0pIHtcbiAgICAgICAgICAgICAgICBhcnJheVtpXSA9IGZvcm1hdFRva2VuRnVuY3Rpb25zW2FycmF5W2ldXTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgYXJyYXlbaV0gPSByZW1vdmVGb3JtYXR0aW5nVG9rZW5zKGFycmF5W2ldKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiBmdW5jdGlvbiAobW9tKSB7XG4gICAgICAgICAgICB2YXIgb3V0cHV0ID0gJyc7XG4gICAgICAgICAgICBmb3IgKGkgPSAwOyBpIDwgbGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgICAgICBvdXRwdXQgKz0gYXJyYXlbaV0gaW5zdGFuY2VvZiBGdW5jdGlvbiA/IGFycmF5W2ldLmNhbGwobW9tLCBmb3JtYXQpIDogYXJyYXlbaV07XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gb3V0cHV0O1xuICAgICAgICB9O1xuICAgIH1cblxuICAgIC8vIGZvcm1hdCBkYXRlIHVzaW5nIG5hdGl2ZSBkYXRlIG9iamVjdFxuICAgIGZ1bmN0aW9uIGZvcm1hdE1vbWVudChtLCBmb3JtYXQpIHtcbiAgICAgICAgaWYgKCFtLmlzVmFsaWQoKSkge1xuICAgICAgICAgICAgcmV0dXJuIG0ubG9jYWxlRGF0YSgpLmludmFsaWREYXRlKCk7XG4gICAgICAgIH1cblxuICAgICAgICBmb3JtYXQgPSBleHBhbmRGb3JtYXQoZm9ybWF0LCBtLmxvY2FsZURhdGEoKSk7XG5cbiAgICAgICAgaWYgKCFmb3JtYXRGdW5jdGlvbnNbZm9ybWF0XSkge1xuICAgICAgICAgICAgZm9ybWF0RnVuY3Rpb25zW2Zvcm1hdF0gPSBtYWtlRm9ybWF0RnVuY3Rpb24oZm9ybWF0KTtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiBmb3JtYXRGdW5jdGlvbnNbZm9ybWF0XShtKTtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBleHBhbmRGb3JtYXQoZm9ybWF0LCBsb2NhbGUpIHtcbiAgICAgICAgdmFyIGkgPSA1O1xuXG4gICAgICAgIGZ1bmN0aW9uIHJlcGxhY2VMb25nRGF0ZUZvcm1hdFRva2VucyhpbnB1dCkge1xuICAgICAgICAgICAgcmV0dXJuIGxvY2FsZS5sb25nRGF0ZUZvcm1hdChpbnB1dCkgfHwgaW5wdXQ7XG4gICAgICAgIH1cblxuICAgICAgICBsb2NhbEZvcm1hdHRpbmdUb2tlbnMubGFzdEluZGV4ID0gMDtcbiAgICAgICAgd2hpbGUgKGkgPj0gMCAmJiBsb2NhbEZvcm1hdHRpbmdUb2tlbnMudGVzdChmb3JtYXQpKSB7XG4gICAgICAgICAgICBmb3JtYXQgPSBmb3JtYXQucmVwbGFjZShsb2NhbEZvcm1hdHRpbmdUb2tlbnMsIHJlcGxhY2VMb25nRGF0ZUZvcm1hdFRva2Vucyk7XG4gICAgICAgICAgICBsb2NhbEZvcm1hdHRpbmdUb2tlbnMubGFzdEluZGV4ID0gMDtcbiAgICAgICAgICAgIGkgLT0gMTtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiBmb3JtYXQ7XG4gICAgfVxuXG5cbiAgICAvKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqXG4gICAgICAgIFBhcnNpbmdcbiAgICAqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKiovXG5cblxuICAgIC8vIGdldCB0aGUgcmVnZXggdG8gZmluZCB0aGUgbmV4dCB0b2tlblxuICAgIGZ1bmN0aW9uIGdldFBhcnNlUmVnZXhGb3JUb2tlbih0b2tlbiwgY29uZmlnKSB7XG4gICAgICAgIHZhciBhLCBzdHJpY3QgPSBjb25maWcuX3N0cmljdDtcbiAgICAgICAgc3dpdGNoICh0b2tlbikge1xuICAgICAgICBjYXNlICdRJzpcbiAgICAgICAgICAgIHJldHVybiBwYXJzZVRva2VuT25lRGlnaXQ7XG4gICAgICAgIGNhc2UgJ0REREQnOlxuICAgICAgICAgICAgcmV0dXJuIHBhcnNlVG9rZW5UaHJlZURpZ2l0cztcbiAgICAgICAgY2FzZSAnWVlZWSc6XG4gICAgICAgIGNhc2UgJ0dHR0cnOlxuICAgICAgICBjYXNlICdnZ2dnJzpcbiAgICAgICAgICAgIHJldHVybiBzdHJpY3QgPyBwYXJzZVRva2VuRm91ckRpZ2l0cyA6IHBhcnNlVG9rZW5PbmVUb0ZvdXJEaWdpdHM7XG4gICAgICAgIGNhc2UgJ1knOlxuICAgICAgICBjYXNlICdHJzpcbiAgICAgICAgY2FzZSAnZyc6XG4gICAgICAgICAgICByZXR1cm4gcGFyc2VUb2tlblNpZ25lZE51bWJlcjtcbiAgICAgICAgY2FzZSAnWVlZWVlZJzpcbiAgICAgICAgY2FzZSAnWVlZWVknOlxuICAgICAgICBjYXNlICdHR0dHRyc6XG4gICAgICAgIGNhc2UgJ2dnZ2dnJzpcbiAgICAgICAgICAgIHJldHVybiBzdHJpY3QgPyBwYXJzZVRva2VuU2l4RGlnaXRzIDogcGFyc2VUb2tlbk9uZVRvU2l4RGlnaXRzO1xuICAgICAgICBjYXNlICdTJzpcbiAgICAgICAgICAgIGlmIChzdHJpY3QpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gcGFyc2VUb2tlbk9uZURpZ2l0O1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgLyogZmFsbHMgdGhyb3VnaCAqL1xuICAgICAgICBjYXNlICdTUyc6XG4gICAgICAgICAgICBpZiAoc3RyaWN0KSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHBhcnNlVG9rZW5Ud29EaWdpdHM7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICAvKiBmYWxscyB0aHJvdWdoICovXG4gICAgICAgIGNhc2UgJ1NTUyc6XG4gICAgICAgICAgICBpZiAoc3RyaWN0KSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHBhcnNlVG9rZW5UaHJlZURpZ2l0cztcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIC8qIGZhbGxzIHRocm91Z2ggKi9cbiAgICAgICAgY2FzZSAnREREJzpcbiAgICAgICAgICAgIHJldHVybiBwYXJzZVRva2VuT25lVG9UaHJlZURpZ2l0cztcbiAgICAgICAgY2FzZSAnTU1NJzpcbiAgICAgICAgY2FzZSAnTU1NTSc6XG4gICAgICAgIGNhc2UgJ2RkJzpcbiAgICAgICAgY2FzZSAnZGRkJzpcbiAgICAgICAgY2FzZSAnZGRkZCc6XG4gICAgICAgICAgICByZXR1cm4gcGFyc2VUb2tlbldvcmQ7XG4gICAgICAgIGNhc2UgJ2EnOlxuICAgICAgICBjYXNlICdBJzpcbiAgICAgICAgICAgIHJldHVybiBjb25maWcuX2xvY2FsZS5fbWVyaWRpZW1QYXJzZTtcbiAgICAgICAgY2FzZSAnWCc6XG4gICAgICAgICAgICByZXR1cm4gcGFyc2VUb2tlblRpbWVzdGFtcE1zO1xuICAgICAgICBjYXNlICdaJzpcbiAgICAgICAgY2FzZSAnWlonOlxuICAgICAgICAgICAgcmV0dXJuIHBhcnNlVG9rZW5UaW1lem9uZTtcbiAgICAgICAgY2FzZSAnVCc6XG4gICAgICAgICAgICByZXR1cm4gcGFyc2VUb2tlblQ7XG4gICAgICAgIGNhc2UgJ1NTU1MnOlxuICAgICAgICAgICAgcmV0dXJuIHBhcnNlVG9rZW5EaWdpdHM7XG4gICAgICAgIGNhc2UgJ01NJzpcbiAgICAgICAgY2FzZSAnREQnOlxuICAgICAgICBjYXNlICdZWSc6XG4gICAgICAgIGNhc2UgJ0dHJzpcbiAgICAgICAgY2FzZSAnZ2cnOlxuICAgICAgICBjYXNlICdISCc6XG4gICAgICAgIGNhc2UgJ2hoJzpcbiAgICAgICAgY2FzZSAnbW0nOlxuICAgICAgICBjYXNlICdzcyc6XG4gICAgICAgIGNhc2UgJ3d3JzpcbiAgICAgICAgY2FzZSAnV1cnOlxuICAgICAgICAgICAgcmV0dXJuIHN0cmljdCA/IHBhcnNlVG9rZW5Ud29EaWdpdHMgOiBwYXJzZVRva2VuT25lT3JUd29EaWdpdHM7XG4gICAgICAgIGNhc2UgJ00nOlxuICAgICAgICBjYXNlICdEJzpcbiAgICAgICAgY2FzZSAnZCc6XG4gICAgICAgIGNhc2UgJ0gnOlxuICAgICAgICBjYXNlICdoJzpcbiAgICAgICAgY2FzZSAnbSc6XG4gICAgICAgIGNhc2UgJ3MnOlxuICAgICAgICBjYXNlICd3JzpcbiAgICAgICAgY2FzZSAnVyc6XG4gICAgICAgIGNhc2UgJ2UnOlxuICAgICAgICBjYXNlICdFJzpcbiAgICAgICAgICAgIHJldHVybiBwYXJzZVRva2VuT25lT3JUd29EaWdpdHM7XG4gICAgICAgIGNhc2UgJ0RvJzpcbiAgICAgICAgICAgIHJldHVybiBwYXJzZVRva2VuT3JkaW5hbDtcbiAgICAgICAgZGVmYXVsdCA6XG4gICAgICAgICAgICBhID0gbmV3IFJlZ0V4cChyZWdleHBFc2NhcGUodW5lc2NhcGVGb3JtYXQodG9rZW4ucmVwbGFjZSgnXFxcXCcsICcnKSksICdpJykpO1xuICAgICAgICAgICAgcmV0dXJuIGE7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBmdW5jdGlvbiB0aW1lem9uZU1pbnV0ZXNGcm9tU3RyaW5nKHN0cmluZykge1xuICAgICAgICBzdHJpbmcgPSBzdHJpbmcgfHwgJyc7XG4gICAgICAgIHZhciBwb3NzaWJsZVR6TWF0Y2hlcyA9IChzdHJpbmcubWF0Y2gocGFyc2VUb2tlblRpbWV6b25lKSB8fCBbXSksXG4gICAgICAgICAgICB0ekNodW5rID0gcG9zc2libGVUek1hdGNoZXNbcG9zc2libGVUek1hdGNoZXMubGVuZ3RoIC0gMV0gfHwgW10sXG4gICAgICAgICAgICBwYXJ0cyA9ICh0ekNodW5rICsgJycpLm1hdGNoKHBhcnNlVGltZXpvbmVDaHVua2VyKSB8fCBbJy0nLCAwLCAwXSxcbiAgICAgICAgICAgIG1pbnV0ZXMgPSArKHBhcnRzWzFdICogNjApICsgdG9JbnQocGFydHNbMl0pO1xuXG4gICAgICAgIHJldHVybiBwYXJ0c1swXSA9PT0gJysnID8gLW1pbnV0ZXMgOiBtaW51dGVzO1xuICAgIH1cblxuICAgIC8vIGZ1bmN0aW9uIHRvIGNvbnZlcnQgc3RyaW5nIGlucHV0IHRvIGRhdGVcbiAgICBmdW5jdGlvbiBhZGRUaW1lVG9BcnJheUZyb21Ub2tlbih0b2tlbiwgaW5wdXQsIGNvbmZpZykge1xuICAgICAgICB2YXIgYSwgZGF0ZVBhcnRBcnJheSA9IGNvbmZpZy5fYTtcblxuICAgICAgICBzd2l0Y2ggKHRva2VuKSB7XG4gICAgICAgIC8vIFFVQVJURVJcbiAgICAgICAgY2FzZSAnUSc6XG4gICAgICAgICAgICBpZiAoaW5wdXQgIT0gbnVsbCkge1xuICAgICAgICAgICAgICAgIGRhdGVQYXJ0QXJyYXlbTU9OVEhdID0gKHRvSW50KGlucHV0KSAtIDEpICogMztcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAvLyBNT05USFxuICAgICAgICBjYXNlICdNJyA6IC8vIGZhbGwgdGhyb3VnaCB0byBNTVxuICAgICAgICBjYXNlICdNTScgOlxuICAgICAgICAgICAgaWYgKGlucHV0ICE9IG51bGwpIHtcbiAgICAgICAgICAgICAgICBkYXRlUGFydEFycmF5W01PTlRIXSA9IHRvSW50KGlucHV0KSAtIDE7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSAnTU1NJyA6IC8vIGZhbGwgdGhyb3VnaCB0byBNTU1NXG4gICAgICAgIGNhc2UgJ01NTU0nIDpcbiAgICAgICAgICAgIGEgPSBjb25maWcuX2xvY2FsZS5tb250aHNQYXJzZShpbnB1dCk7XG4gICAgICAgICAgICAvLyBpZiB3ZSBkaWRuJ3QgZmluZCBhIG1vbnRoIG5hbWUsIG1hcmsgdGhlIGRhdGUgYXMgaW52YWxpZC5cbiAgICAgICAgICAgIGlmIChhICE9IG51bGwpIHtcbiAgICAgICAgICAgICAgICBkYXRlUGFydEFycmF5W01PTlRIXSA9IGE7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIGNvbmZpZy5fcGYuaW52YWxpZE1vbnRoID0gaW5wdXQ7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgLy8gREFZIE9GIE1PTlRIXG4gICAgICAgIGNhc2UgJ0QnIDogLy8gZmFsbCB0aHJvdWdoIHRvIEREXG4gICAgICAgIGNhc2UgJ0REJyA6XG4gICAgICAgICAgICBpZiAoaW5wdXQgIT0gbnVsbCkge1xuICAgICAgICAgICAgICAgIGRhdGVQYXJ0QXJyYXlbREFURV0gPSB0b0ludChpbnB1dCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSAnRG8nIDpcbiAgICAgICAgICAgIGlmIChpbnB1dCAhPSBudWxsKSB7XG4gICAgICAgICAgICAgICAgZGF0ZVBhcnRBcnJheVtEQVRFXSA9IHRvSW50KHBhcnNlSW50KGlucHV0LCAxMCkpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIC8vIERBWSBPRiBZRUFSXG4gICAgICAgIGNhc2UgJ0RERCcgOiAvLyBmYWxsIHRocm91Z2ggdG8gRERERFxuICAgICAgICBjYXNlICdEREREJyA6XG4gICAgICAgICAgICBpZiAoaW5wdXQgIT0gbnVsbCkge1xuICAgICAgICAgICAgICAgIGNvbmZpZy5fZGF5T2ZZZWFyID0gdG9JbnQoaW5wdXQpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgLy8gWUVBUlxuICAgICAgICBjYXNlICdZWScgOlxuICAgICAgICAgICAgZGF0ZVBhcnRBcnJheVtZRUFSXSA9IG1vbWVudC5wYXJzZVR3b0RpZ2l0WWVhcihpbnB1dCk7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSAnWVlZWScgOlxuICAgICAgICBjYXNlICdZWVlZWScgOlxuICAgICAgICBjYXNlICdZWVlZWVknIDpcbiAgICAgICAgICAgIGRhdGVQYXJ0QXJyYXlbWUVBUl0gPSB0b0ludChpbnB1dCk7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgLy8gQU0gLyBQTVxuICAgICAgICBjYXNlICdhJyA6IC8vIGZhbGwgdGhyb3VnaCB0byBBXG4gICAgICAgIGNhc2UgJ0EnIDpcbiAgICAgICAgICAgIGNvbmZpZy5faXNQbSA9IGNvbmZpZy5fbG9jYWxlLmlzUE0oaW5wdXQpO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIC8vIDI0IEhPVVJcbiAgICAgICAgY2FzZSAnSCcgOiAvLyBmYWxsIHRocm91Z2ggdG8gaGhcbiAgICAgICAgY2FzZSAnSEgnIDogLy8gZmFsbCB0aHJvdWdoIHRvIGhoXG4gICAgICAgIGNhc2UgJ2gnIDogLy8gZmFsbCB0aHJvdWdoIHRvIGhoXG4gICAgICAgIGNhc2UgJ2hoJyA6XG4gICAgICAgICAgICBkYXRlUGFydEFycmF5W0hPVVJdID0gdG9JbnQoaW5wdXQpO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIC8vIE1JTlVURVxuICAgICAgICBjYXNlICdtJyA6IC8vIGZhbGwgdGhyb3VnaCB0byBtbVxuICAgICAgICBjYXNlICdtbScgOlxuICAgICAgICAgICAgZGF0ZVBhcnRBcnJheVtNSU5VVEVdID0gdG9JbnQoaW5wdXQpO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIC8vIFNFQ09ORFxuICAgICAgICBjYXNlICdzJyA6IC8vIGZhbGwgdGhyb3VnaCB0byBzc1xuICAgICAgICBjYXNlICdzcycgOlxuICAgICAgICAgICAgZGF0ZVBhcnRBcnJheVtTRUNPTkRdID0gdG9JbnQoaW5wdXQpO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIC8vIE1JTExJU0VDT05EXG4gICAgICAgIGNhc2UgJ1MnIDpcbiAgICAgICAgY2FzZSAnU1MnIDpcbiAgICAgICAgY2FzZSAnU1NTJyA6XG4gICAgICAgIGNhc2UgJ1NTU1MnIDpcbiAgICAgICAgICAgIGRhdGVQYXJ0QXJyYXlbTUlMTElTRUNPTkRdID0gdG9JbnQoKCcwLicgKyBpbnB1dCkgKiAxMDAwKTtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAvLyBVTklYIFRJTUVTVEFNUCBXSVRIIE1TXG4gICAgICAgIGNhc2UgJ1gnOlxuICAgICAgICAgICAgY29uZmlnLl9kID0gbmV3IERhdGUocGFyc2VGbG9hdChpbnB1dCkgKiAxMDAwKTtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAvLyBUSU1FWk9ORVxuICAgICAgICBjYXNlICdaJyA6IC8vIGZhbGwgdGhyb3VnaCB0byBaWlxuICAgICAgICBjYXNlICdaWicgOlxuICAgICAgICAgICAgY29uZmlnLl91c2VVVEMgPSB0cnVlO1xuICAgICAgICAgICAgY29uZmlnLl90em0gPSB0aW1lem9uZU1pbnV0ZXNGcm9tU3RyaW5nKGlucHV0KTtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAvLyBXRUVLREFZIC0gaHVtYW5cbiAgICAgICAgY2FzZSAnZGQnOlxuICAgICAgICBjYXNlICdkZGQnOlxuICAgICAgICBjYXNlICdkZGRkJzpcbiAgICAgICAgICAgIGEgPSBjb25maWcuX2xvY2FsZS53ZWVrZGF5c1BhcnNlKGlucHV0KTtcbiAgICAgICAgICAgIC8vIGlmIHdlIGRpZG4ndCBnZXQgYSB3ZWVrZGF5IG5hbWUsIG1hcmsgdGhlIGRhdGUgYXMgaW52YWxpZFxuICAgICAgICAgICAgaWYgKGEgIT0gbnVsbCkge1xuICAgICAgICAgICAgICAgIGNvbmZpZy5fdyA9IGNvbmZpZy5fdyB8fCB7fTtcbiAgICAgICAgICAgICAgICBjb25maWcuX3dbJ2QnXSA9IGE7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIGNvbmZpZy5fcGYuaW52YWxpZFdlZWtkYXkgPSBpbnB1dDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAvLyBXRUVLLCBXRUVLIERBWSAtIG51bWVyaWNcbiAgICAgICAgY2FzZSAndyc6XG4gICAgICAgIGNhc2UgJ3d3JzpcbiAgICAgICAgY2FzZSAnVyc6XG4gICAgICAgIGNhc2UgJ1dXJzpcbiAgICAgICAgY2FzZSAnZCc6XG4gICAgICAgIGNhc2UgJ2UnOlxuICAgICAgICBjYXNlICdFJzpcbiAgICAgICAgICAgIHRva2VuID0gdG9rZW4uc3Vic3RyKDAsIDEpO1xuICAgICAgICAgICAgLyogZmFsbHMgdGhyb3VnaCAqL1xuICAgICAgICBjYXNlICdnZ2dnJzpcbiAgICAgICAgY2FzZSAnR0dHRyc6XG4gICAgICAgIGNhc2UgJ0dHR0dHJzpcbiAgICAgICAgICAgIHRva2VuID0gdG9rZW4uc3Vic3RyKDAsIDIpO1xuICAgICAgICAgICAgaWYgKGlucHV0KSB7XG4gICAgICAgICAgICAgICAgY29uZmlnLl93ID0gY29uZmlnLl93IHx8IHt9O1xuICAgICAgICAgICAgICAgIGNvbmZpZy5fd1t0b2tlbl0gPSB0b0ludChpbnB1dCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSAnZ2cnOlxuICAgICAgICBjYXNlICdHRyc6XG4gICAgICAgICAgICBjb25maWcuX3cgPSBjb25maWcuX3cgfHwge307XG4gICAgICAgICAgICBjb25maWcuX3dbdG9rZW5dID0gbW9tZW50LnBhcnNlVHdvRGlnaXRZZWFyKGlucHV0KTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIGZ1bmN0aW9uIGRheU9mWWVhckZyb21XZWVrSW5mbyhjb25maWcpIHtcbiAgICAgICAgdmFyIHcsIHdlZWtZZWFyLCB3ZWVrLCB3ZWVrZGF5LCBkb3csIGRveSwgdGVtcDtcblxuICAgICAgICB3ID0gY29uZmlnLl93O1xuICAgICAgICBpZiAody5HRyAhPSBudWxsIHx8IHcuVyAhPSBudWxsIHx8IHcuRSAhPSBudWxsKSB7XG4gICAgICAgICAgICBkb3cgPSAxO1xuICAgICAgICAgICAgZG95ID0gNDtcblxuICAgICAgICAgICAgLy8gVE9ETzogV2UgbmVlZCB0byB0YWtlIHRoZSBjdXJyZW50IGlzb1dlZWtZZWFyLCBidXQgdGhhdCBkZXBlbmRzIG9uXG4gICAgICAgICAgICAvLyBob3cgd2UgaW50ZXJwcmV0IG5vdyAobG9jYWwsIHV0YywgZml4ZWQgb2Zmc2V0KS4gU28gY3JlYXRlXG4gICAgICAgICAgICAvLyBhIG5vdyB2ZXJzaW9uIG9mIGN1cnJlbnQgY29uZmlnICh0YWtlIGxvY2FsL3V0Yy9vZmZzZXQgZmxhZ3MsIGFuZFxuICAgICAgICAgICAgLy8gY3JlYXRlIG5vdykuXG4gICAgICAgICAgICB3ZWVrWWVhciA9IGRmbCh3LkdHLCBjb25maWcuX2FbWUVBUl0sIHdlZWtPZlllYXIobW9tZW50KCksIDEsIDQpLnllYXIpO1xuICAgICAgICAgICAgd2VlayA9IGRmbCh3LlcsIDEpO1xuICAgICAgICAgICAgd2Vla2RheSA9IGRmbCh3LkUsIDEpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgZG93ID0gY29uZmlnLl9sb2NhbGUuX3dlZWsuZG93O1xuICAgICAgICAgICAgZG95ID0gY29uZmlnLl9sb2NhbGUuX3dlZWsuZG95O1xuXG4gICAgICAgICAgICB3ZWVrWWVhciA9IGRmbCh3LmdnLCBjb25maWcuX2FbWUVBUl0sIHdlZWtPZlllYXIobW9tZW50KCksIGRvdywgZG95KS55ZWFyKTtcbiAgICAgICAgICAgIHdlZWsgPSBkZmwody53LCAxKTtcblxuICAgICAgICAgICAgaWYgKHcuZCAhPSBudWxsKSB7XG4gICAgICAgICAgICAgICAgLy8gd2Vla2RheSAtLSBsb3cgZGF5IG51bWJlcnMgYXJlIGNvbnNpZGVyZWQgbmV4dCB3ZWVrXG4gICAgICAgICAgICAgICAgd2Vla2RheSA9IHcuZDtcbiAgICAgICAgICAgICAgICBpZiAod2Vla2RheSA8IGRvdykge1xuICAgICAgICAgICAgICAgICAgICArK3dlZWs7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSBlbHNlIGlmICh3LmUgIT0gbnVsbCkge1xuICAgICAgICAgICAgICAgIC8vIGxvY2FsIHdlZWtkYXkgLS0gY291bnRpbmcgc3RhcnRzIGZyb20gYmVnaW5pbmcgb2Ygd2Vla1xuICAgICAgICAgICAgICAgIHdlZWtkYXkgPSB3LmUgKyBkb3c7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIC8vIGRlZmF1bHQgdG8gYmVnaW5pbmcgb2Ygd2Vla1xuICAgICAgICAgICAgICAgIHdlZWtkYXkgPSBkb3c7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgdGVtcCA9IGRheU9mWWVhckZyb21XZWVrcyh3ZWVrWWVhciwgd2Vlaywgd2Vla2RheSwgZG95LCBkb3cpO1xuXG4gICAgICAgIGNvbmZpZy5fYVtZRUFSXSA9IHRlbXAueWVhcjtcbiAgICAgICAgY29uZmlnLl9kYXlPZlllYXIgPSB0ZW1wLmRheU9mWWVhcjtcbiAgICB9XG5cbiAgICAvLyBjb252ZXJ0IGFuIGFycmF5IHRvIGEgZGF0ZS5cbiAgICAvLyB0aGUgYXJyYXkgc2hvdWxkIG1pcnJvciB0aGUgcGFyYW1ldGVycyBiZWxvd1xuICAgIC8vIG5vdGU6IGFsbCB2YWx1ZXMgcGFzdCB0aGUgeWVhciBhcmUgb3B0aW9uYWwgYW5kIHdpbGwgZGVmYXVsdCB0byB0aGUgbG93ZXN0IHBvc3NpYmxlIHZhbHVlLlxuICAgIC8vIFt5ZWFyLCBtb250aCwgZGF5ICwgaG91ciwgbWludXRlLCBzZWNvbmQsIG1pbGxpc2Vjb25kXVxuICAgIGZ1bmN0aW9uIGRhdGVGcm9tQ29uZmlnKGNvbmZpZykge1xuICAgICAgICB2YXIgaSwgZGF0ZSwgaW5wdXQgPSBbXSwgY3VycmVudERhdGUsIHllYXJUb1VzZTtcblxuICAgICAgICBpZiAoY29uZmlnLl9kKSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICBjdXJyZW50RGF0ZSA9IGN1cnJlbnREYXRlQXJyYXkoY29uZmlnKTtcblxuICAgICAgICAvL2NvbXB1dGUgZGF5IG9mIHRoZSB5ZWFyIGZyb20gd2Vla3MgYW5kIHdlZWtkYXlzXG4gICAgICAgIGlmIChjb25maWcuX3cgJiYgY29uZmlnLl9hW0RBVEVdID09IG51bGwgJiYgY29uZmlnLl9hW01PTlRIXSA9PSBudWxsKSB7XG4gICAgICAgICAgICBkYXlPZlllYXJGcm9tV2Vla0luZm8oY29uZmlnKTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vaWYgdGhlIGRheSBvZiB0aGUgeWVhciBpcyBzZXQsIGZpZ3VyZSBvdXQgd2hhdCBpdCBpc1xuICAgICAgICBpZiAoY29uZmlnLl9kYXlPZlllYXIpIHtcbiAgICAgICAgICAgIHllYXJUb1VzZSA9IGRmbChjb25maWcuX2FbWUVBUl0sIGN1cnJlbnREYXRlW1lFQVJdKTtcblxuICAgICAgICAgICAgaWYgKGNvbmZpZy5fZGF5T2ZZZWFyID4gZGF5c0luWWVhcih5ZWFyVG9Vc2UpKSB7XG4gICAgICAgICAgICAgICAgY29uZmlnLl9wZi5fb3ZlcmZsb3dEYXlPZlllYXIgPSB0cnVlO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBkYXRlID0gbWFrZVVUQ0RhdGUoeWVhclRvVXNlLCAwLCBjb25maWcuX2RheU9mWWVhcik7XG4gICAgICAgICAgICBjb25maWcuX2FbTU9OVEhdID0gZGF0ZS5nZXRVVENNb250aCgpO1xuICAgICAgICAgICAgY29uZmlnLl9hW0RBVEVdID0gZGF0ZS5nZXRVVENEYXRlKCk7XG4gICAgICAgIH1cblxuICAgICAgICAvLyBEZWZhdWx0IHRvIGN1cnJlbnQgZGF0ZS5cbiAgICAgICAgLy8gKiBpZiBubyB5ZWFyLCBtb250aCwgZGF5IG9mIG1vbnRoIGFyZSBnaXZlbiwgZGVmYXVsdCB0byB0b2RheVxuICAgICAgICAvLyAqIGlmIGRheSBvZiBtb250aCBpcyBnaXZlbiwgZGVmYXVsdCBtb250aCBhbmQgeWVhclxuICAgICAgICAvLyAqIGlmIG1vbnRoIGlzIGdpdmVuLCBkZWZhdWx0IG9ubHkgeWVhclxuICAgICAgICAvLyAqIGlmIHllYXIgaXMgZ2l2ZW4sIGRvbid0IGRlZmF1bHQgYW55dGhpbmdcbiAgICAgICAgZm9yIChpID0gMDsgaSA8IDMgJiYgY29uZmlnLl9hW2ldID09IG51bGw7ICsraSkge1xuICAgICAgICAgICAgY29uZmlnLl9hW2ldID0gaW5wdXRbaV0gPSBjdXJyZW50RGF0ZVtpXTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIFplcm8gb3V0IHdoYXRldmVyIHdhcyBub3QgZGVmYXVsdGVkLCBpbmNsdWRpbmcgdGltZVxuICAgICAgICBmb3IgKDsgaSA8IDc7IGkrKykge1xuICAgICAgICAgICAgY29uZmlnLl9hW2ldID0gaW5wdXRbaV0gPSAoY29uZmlnLl9hW2ldID09IG51bGwpID8gKGkgPT09IDIgPyAxIDogMCkgOiBjb25maWcuX2FbaV07XG4gICAgICAgIH1cblxuICAgICAgICBjb25maWcuX2QgPSAoY29uZmlnLl91c2VVVEMgPyBtYWtlVVRDRGF0ZSA6IG1ha2VEYXRlKS5hcHBseShudWxsLCBpbnB1dCk7XG4gICAgICAgIC8vIEFwcGx5IHRpbWV6b25lIG9mZnNldCBmcm9tIGlucHV0LiBUaGUgYWN0dWFsIHpvbmUgY2FuIGJlIGNoYW5nZWRcbiAgICAgICAgLy8gd2l0aCBwYXJzZVpvbmUuXG4gICAgICAgIGlmIChjb25maWcuX3R6bSAhPSBudWxsKSB7XG4gICAgICAgICAgICBjb25maWcuX2Quc2V0VVRDTWludXRlcyhjb25maWcuX2QuZ2V0VVRDTWludXRlcygpICsgY29uZmlnLl90em0pO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gZGF0ZUZyb21PYmplY3QoY29uZmlnKSB7XG4gICAgICAgIHZhciBub3JtYWxpemVkSW5wdXQ7XG5cbiAgICAgICAgaWYgKGNvbmZpZy5fZCkge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgbm9ybWFsaXplZElucHV0ID0gbm9ybWFsaXplT2JqZWN0VW5pdHMoY29uZmlnLl9pKTtcbiAgICAgICAgY29uZmlnLl9hID0gW1xuICAgICAgICAgICAgbm9ybWFsaXplZElucHV0LnllYXIsXG4gICAgICAgICAgICBub3JtYWxpemVkSW5wdXQubW9udGgsXG4gICAgICAgICAgICBub3JtYWxpemVkSW5wdXQuZGF5LFxuICAgICAgICAgICAgbm9ybWFsaXplZElucHV0LmhvdXIsXG4gICAgICAgICAgICBub3JtYWxpemVkSW5wdXQubWludXRlLFxuICAgICAgICAgICAgbm9ybWFsaXplZElucHV0LnNlY29uZCxcbiAgICAgICAgICAgIG5vcm1hbGl6ZWRJbnB1dC5taWxsaXNlY29uZFxuICAgICAgICBdO1xuXG4gICAgICAgIGRhdGVGcm9tQ29uZmlnKGNvbmZpZyk7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gY3VycmVudERhdGVBcnJheShjb25maWcpIHtcbiAgICAgICAgdmFyIG5vdyA9IG5ldyBEYXRlKCk7XG4gICAgICAgIGlmIChjb25maWcuX3VzZVVUQykge1xuICAgICAgICAgICAgcmV0dXJuIFtcbiAgICAgICAgICAgICAgICBub3cuZ2V0VVRDRnVsbFllYXIoKSxcbiAgICAgICAgICAgICAgICBub3cuZ2V0VVRDTW9udGgoKSxcbiAgICAgICAgICAgICAgICBub3cuZ2V0VVRDRGF0ZSgpXG4gICAgICAgICAgICBdO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgcmV0dXJuIFtub3cuZ2V0RnVsbFllYXIoKSwgbm93LmdldE1vbnRoKCksIG5vdy5nZXREYXRlKCldO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgLy8gZGF0ZSBmcm9tIHN0cmluZyBhbmQgZm9ybWF0IHN0cmluZ1xuICAgIGZ1bmN0aW9uIG1ha2VEYXRlRnJvbVN0cmluZ0FuZEZvcm1hdChjb25maWcpIHtcbiAgICAgICAgaWYgKGNvbmZpZy5fZiA9PT0gbW9tZW50LklTT184NjAxKSB7XG4gICAgICAgICAgICBwYXJzZUlTTyhjb25maWcpO1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgY29uZmlnLl9hID0gW107XG4gICAgICAgIGNvbmZpZy5fcGYuZW1wdHkgPSB0cnVlO1xuXG4gICAgICAgIC8vIFRoaXMgYXJyYXkgaXMgdXNlZCB0byBtYWtlIGEgRGF0ZSwgZWl0aGVyIHdpdGggYG5ldyBEYXRlYCBvciBgRGF0ZS5VVENgXG4gICAgICAgIHZhciBzdHJpbmcgPSAnJyArIGNvbmZpZy5faSxcbiAgICAgICAgICAgIGksIHBhcnNlZElucHV0LCB0b2tlbnMsIHRva2VuLCBza2lwcGVkLFxuICAgICAgICAgICAgc3RyaW5nTGVuZ3RoID0gc3RyaW5nLmxlbmd0aCxcbiAgICAgICAgICAgIHRvdGFsUGFyc2VkSW5wdXRMZW5ndGggPSAwO1xuXG4gICAgICAgIHRva2VucyA9IGV4cGFuZEZvcm1hdChjb25maWcuX2YsIGNvbmZpZy5fbG9jYWxlKS5tYXRjaChmb3JtYXR0aW5nVG9rZW5zKSB8fCBbXTtcblxuICAgICAgICBmb3IgKGkgPSAwOyBpIDwgdG9rZW5zLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICB0b2tlbiA9IHRva2Vuc1tpXTtcbiAgICAgICAgICAgIHBhcnNlZElucHV0ID0gKHN0cmluZy5tYXRjaChnZXRQYXJzZVJlZ2V4Rm9yVG9rZW4odG9rZW4sIGNvbmZpZykpIHx8IFtdKVswXTtcbiAgICAgICAgICAgIGlmIChwYXJzZWRJbnB1dCkge1xuICAgICAgICAgICAgICAgIHNraXBwZWQgPSBzdHJpbmcuc3Vic3RyKDAsIHN0cmluZy5pbmRleE9mKHBhcnNlZElucHV0KSk7XG4gICAgICAgICAgICAgICAgaWYgKHNraXBwZWQubGVuZ3RoID4gMCkge1xuICAgICAgICAgICAgICAgICAgICBjb25maWcuX3BmLnVudXNlZElucHV0LnB1c2goc2tpcHBlZCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIHN0cmluZyA9IHN0cmluZy5zbGljZShzdHJpbmcuaW5kZXhPZihwYXJzZWRJbnB1dCkgKyBwYXJzZWRJbnB1dC5sZW5ndGgpO1xuICAgICAgICAgICAgICAgIHRvdGFsUGFyc2VkSW5wdXRMZW5ndGggKz0gcGFyc2VkSW5wdXQubGVuZ3RoO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgLy8gZG9uJ3QgcGFyc2UgaWYgaXQncyBub3QgYSBrbm93biB0b2tlblxuICAgICAgICAgICAgaWYgKGZvcm1hdFRva2VuRnVuY3Rpb25zW3Rva2VuXSkge1xuICAgICAgICAgICAgICAgIGlmIChwYXJzZWRJbnB1dCkge1xuICAgICAgICAgICAgICAgICAgICBjb25maWcuX3BmLmVtcHR5ID0gZmFsc2U7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICBjb25maWcuX3BmLnVudXNlZFRva2Vucy5wdXNoKHRva2VuKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgYWRkVGltZVRvQXJyYXlGcm9tVG9rZW4odG9rZW4sIHBhcnNlZElucHV0LCBjb25maWcpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSBpZiAoY29uZmlnLl9zdHJpY3QgJiYgIXBhcnNlZElucHV0KSB7XG4gICAgICAgICAgICAgICAgY29uZmlnLl9wZi51bnVzZWRUb2tlbnMucHVzaCh0b2tlbik7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICAvLyBhZGQgcmVtYWluaW5nIHVucGFyc2VkIGlucHV0IGxlbmd0aCB0byB0aGUgc3RyaW5nXG4gICAgICAgIGNvbmZpZy5fcGYuY2hhcnNMZWZ0T3ZlciA9IHN0cmluZ0xlbmd0aCAtIHRvdGFsUGFyc2VkSW5wdXRMZW5ndGg7XG4gICAgICAgIGlmIChzdHJpbmcubGVuZ3RoID4gMCkge1xuICAgICAgICAgICAgY29uZmlnLl9wZi51bnVzZWRJbnB1dC5wdXNoKHN0cmluZyk7XG4gICAgICAgIH1cblxuICAgICAgICAvLyBoYW5kbGUgYW0gcG1cbiAgICAgICAgaWYgKGNvbmZpZy5faXNQbSAmJiBjb25maWcuX2FbSE9VUl0gPCAxMikge1xuICAgICAgICAgICAgY29uZmlnLl9hW0hPVVJdICs9IDEyO1xuICAgICAgICB9XG4gICAgICAgIC8vIGlmIGlzIDEyIGFtLCBjaGFuZ2UgaG91cnMgdG8gMFxuICAgICAgICBpZiAoY29uZmlnLl9pc1BtID09PSBmYWxzZSAmJiBjb25maWcuX2FbSE9VUl0gPT09IDEyKSB7XG4gICAgICAgICAgICBjb25maWcuX2FbSE9VUl0gPSAwO1xuICAgICAgICB9XG5cbiAgICAgICAgZGF0ZUZyb21Db25maWcoY29uZmlnKTtcbiAgICAgICAgY2hlY2tPdmVyZmxvdyhjb25maWcpO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIHVuZXNjYXBlRm9ybWF0KHMpIHtcbiAgICAgICAgcmV0dXJuIHMucmVwbGFjZSgvXFxcXChcXFspfFxcXFwoXFxdKXxcXFsoW15cXF1cXFtdKilcXF18XFxcXCguKS9nLCBmdW5jdGlvbiAobWF0Y2hlZCwgcDEsIHAyLCBwMywgcDQpIHtcbiAgICAgICAgICAgIHJldHVybiBwMSB8fCBwMiB8fCBwMyB8fCBwNDtcbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgLy8gQ29kZSBmcm9tIGh0dHA6Ly9zdGFja292ZXJmbG93LmNvbS9xdWVzdGlvbnMvMzU2MTQ5My9pcy10aGVyZS1hLXJlZ2V4cC1lc2NhcGUtZnVuY3Rpb24taW4tamF2YXNjcmlwdFxuICAgIGZ1bmN0aW9uIHJlZ2V4cEVzY2FwZShzKSB7XG4gICAgICAgIHJldHVybiBzLnJlcGxhY2UoL1stXFwvXFxcXF4kKis/LigpfFtcXF17fV0vZywgJ1xcXFwkJicpO1xuICAgIH1cblxuICAgIC8vIGRhdGUgZnJvbSBzdHJpbmcgYW5kIGFycmF5IG9mIGZvcm1hdCBzdHJpbmdzXG4gICAgZnVuY3Rpb24gbWFrZURhdGVGcm9tU3RyaW5nQW5kQXJyYXkoY29uZmlnKSB7XG4gICAgICAgIHZhciB0ZW1wQ29uZmlnLFxuICAgICAgICAgICAgYmVzdE1vbWVudCxcblxuICAgICAgICAgICAgc2NvcmVUb0JlYXQsXG4gICAgICAgICAgICBpLFxuICAgICAgICAgICAgY3VycmVudFNjb3JlO1xuXG4gICAgICAgIGlmIChjb25maWcuX2YubGVuZ3RoID09PSAwKSB7XG4gICAgICAgICAgICBjb25maWcuX3BmLmludmFsaWRGb3JtYXQgPSB0cnVlO1xuICAgICAgICAgICAgY29uZmlnLl9kID0gbmV3IERhdGUoTmFOKTtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIGZvciAoaSA9IDA7IGkgPCBjb25maWcuX2YubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgIGN1cnJlbnRTY29yZSA9IDA7XG4gICAgICAgICAgICB0ZW1wQ29uZmlnID0gY29weUNvbmZpZyh7fSwgY29uZmlnKTtcbiAgICAgICAgICAgIGlmIChjb25maWcuX3VzZVVUQyAhPSBudWxsKSB7XG4gICAgICAgICAgICAgICAgdGVtcENvbmZpZy5fdXNlVVRDID0gY29uZmlnLl91c2VVVEM7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICB0ZW1wQ29uZmlnLl9wZiA9IGRlZmF1bHRQYXJzaW5nRmxhZ3MoKTtcbiAgICAgICAgICAgIHRlbXBDb25maWcuX2YgPSBjb25maWcuX2ZbaV07XG4gICAgICAgICAgICBtYWtlRGF0ZUZyb21TdHJpbmdBbmRGb3JtYXQodGVtcENvbmZpZyk7XG5cbiAgICAgICAgICAgIGlmICghaXNWYWxpZCh0ZW1wQ29uZmlnKSkge1xuICAgICAgICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAvLyBpZiB0aGVyZSBpcyBhbnkgaW5wdXQgdGhhdCB3YXMgbm90IHBhcnNlZCBhZGQgYSBwZW5hbHR5IGZvciB0aGF0IGZvcm1hdFxuICAgICAgICAgICAgY3VycmVudFNjb3JlICs9IHRlbXBDb25maWcuX3BmLmNoYXJzTGVmdE92ZXI7XG5cbiAgICAgICAgICAgIC8vb3IgdG9rZW5zXG4gICAgICAgICAgICBjdXJyZW50U2NvcmUgKz0gdGVtcENvbmZpZy5fcGYudW51c2VkVG9rZW5zLmxlbmd0aCAqIDEwO1xuXG4gICAgICAgICAgICB0ZW1wQ29uZmlnLl9wZi5zY29yZSA9IGN1cnJlbnRTY29yZTtcblxuICAgICAgICAgICAgaWYgKHNjb3JlVG9CZWF0ID09IG51bGwgfHwgY3VycmVudFNjb3JlIDwgc2NvcmVUb0JlYXQpIHtcbiAgICAgICAgICAgICAgICBzY29yZVRvQmVhdCA9IGN1cnJlbnRTY29yZTtcbiAgICAgICAgICAgICAgICBiZXN0TW9tZW50ID0gdGVtcENvbmZpZztcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIGV4dGVuZChjb25maWcsIGJlc3RNb21lbnQgfHwgdGVtcENvbmZpZyk7XG4gICAgfVxuXG4gICAgLy8gZGF0ZSBmcm9tIGlzbyBmb3JtYXRcbiAgICBmdW5jdGlvbiBwYXJzZUlTTyhjb25maWcpIHtcbiAgICAgICAgdmFyIGksIGwsXG4gICAgICAgICAgICBzdHJpbmcgPSBjb25maWcuX2ksXG4gICAgICAgICAgICBtYXRjaCA9IGlzb1JlZ2V4LmV4ZWMoc3RyaW5nKTtcblxuICAgICAgICBpZiAobWF0Y2gpIHtcbiAgICAgICAgICAgIGNvbmZpZy5fcGYuaXNvID0gdHJ1ZTtcbiAgICAgICAgICAgIGZvciAoaSA9IDAsIGwgPSBpc29EYXRlcy5sZW5ndGg7IGkgPCBsOyBpKyspIHtcbiAgICAgICAgICAgICAgICBpZiAoaXNvRGF0ZXNbaV1bMV0uZXhlYyhzdHJpbmcpKSB7XG4gICAgICAgICAgICAgICAgICAgIC8vIG1hdGNoWzVdIHNob3VsZCBiZSAnVCcgb3IgdW5kZWZpbmVkXG4gICAgICAgICAgICAgICAgICAgIGNvbmZpZy5fZiA9IGlzb0RhdGVzW2ldWzBdICsgKG1hdGNoWzZdIHx8ICcgJyk7XG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGZvciAoaSA9IDAsIGwgPSBpc29UaW1lcy5sZW5ndGg7IGkgPCBsOyBpKyspIHtcbiAgICAgICAgICAgICAgICBpZiAoaXNvVGltZXNbaV1bMV0uZXhlYyhzdHJpbmcpKSB7XG4gICAgICAgICAgICAgICAgICAgIGNvbmZpZy5fZiArPSBpc29UaW1lc1tpXVswXTtcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKHN0cmluZy5tYXRjaChwYXJzZVRva2VuVGltZXpvbmUpKSB7XG4gICAgICAgICAgICAgICAgY29uZmlnLl9mICs9ICdaJztcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIG1ha2VEYXRlRnJvbVN0cmluZ0FuZEZvcm1hdChjb25maWcpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgY29uZmlnLl9pc1ZhbGlkID0gZmFsc2U7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICAvLyBkYXRlIGZyb20gaXNvIGZvcm1hdCBvciBmYWxsYmFja1xuICAgIGZ1bmN0aW9uIG1ha2VEYXRlRnJvbVN0cmluZyhjb25maWcpIHtcbiAgICAgICAgcGFyc2VJU08oY29uZmlnKTtcbiAgICAgICAgaWYgKGNvbmZpZy5faXNWYWxpZCA9PT0gZmFsc2UpIHtcbiAgICAgICAgICAgIGRlbGV0ZSBjb25maWcuX2lzVmFsaWQ7XG4gICAgICAgICAgICBtb21lbnQuY3JlYXRlRnJvbUlucHV0RmFsbGJhY2soY29uZmlnKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIGZ1bmN0aW9uIG1hcChhcnIsIGZuKSB7XG4gICAgICAgIHZhciByZXMgPSBbXSwgaTtcbiAgICAgICAgZm9yIChpID0gMDsgaSA8IGFyci5sZW5ndGg7ICsraSkge1xuICAgICAgICAgICAgcmVzLnB1c2goZm4oYXJyW2ldLCBpKSk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHJlcztcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBtYWtlRGF0ZUZyb21JbnB1dChjb25maWcpIHtcbiAgICAgICAgdmFyIGlucHV0ID0gY29uZmlnLl9pLCBtYXRjaGVkO1xuICAgICAgICBpZiAoaW5wdXQgPT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgY29uZmlnLl9kID0gbmV3IERhdGUoKTtcbiAgICAgICAgfSBlbHNlIGlmIChpc0RhdGUoaW5wdXQpKSB7XG4gICAgICAgICAgICBjb25maWcuX2QgPSBuZXcgRGF0ZSgraW5wdXQpO1xuICAgICAgICB9IGVsc2UgaWYgKChtYXRjaGVkID0gYXNwTmV0SnNvblJlZ2V4LmV4ZWMoaW5wdXQpKSAhPT0gbnVsbCkge1xuICAgICAgICAgICAgY29uZmlnLl9kID0gbmV3IERhdGUoK21hdGNoZWRbMV0pO1xuICAgICAgICB9IGVsc2UgaWYgKHR5cGVvZiBpbnB1dCA9PT0gJ3N0cmluZycpIHtcbiAgICAgICAgICAgIG1ha2VEYXRlRnJvbVN0cmluZyhjb25maWcpO1xuICAgICAgICB9IGVsc2UgaWYgKGlzQXJyYXkoaW5wdXQpKSB7XG4gICAgICAgICAgICBjb25maWcuX2EgPSBtYXAoaW5wdXQuc2xpY2UoMCksIGZ1bmN0aW9uIChvYmopIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gcGFyc2VJbnQob2JqLCAxMCk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIGRhdGVGcm9tQ29uZmlnKGNvbmZpZyk7XG4gICAgICAgIH0gZWxzZSBpZiAodHlwZW9mKGlucHV0KSA9PT0gJ29iamVjdCcpIHtcbiAgICAgICAgICAgIGRhdGVGcm9tT2JqZWN0KGNvbmZpZyk7XG4gICAgICAgIH0gZWxzZSBpZiAodHlwZW9mKGlucHV0KSA9PT0gJ251bWJlcicpIHtcbiAgICAgICAgICAgIC8vIGZyb20gbWlsbGlzZWNvbmRzXG4gICAgICAgICAgICBjb25maWcuX2QgPSBuZXcgRGF0ZShpbnB1dCk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBtb21lbnQuY3JlYXRlRnJvbUlucHV0RmFsbGJhY2soY29uZmlnKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIGZ1bmN0aW9uIG1ha2VEYXRlKHksIG0sIGQsIGgsIE0sIHMsIG1zKSB7XG4gICAgICAgIC8vY2FuJ3QganVzdCBhcHBseSgpIHRvIGNyZWF0ZSBhIGRhdGU6XG4gICAgICAgIC8vaHR0cDovL3N0YWNrb3ZlcmZsb3cuY29tL3F1ZXN0aW9ucy8xODEzNDgvaW5zdGFudGlhdGluZy1hLWphdmFzY3JpcHQtb2JqZWN0LWJ5LWNhbGxpbmctcHJvdG90eXBlLWNvbnN0cnVjdG9yLWFwcGx5XG4gICAgICAgIHZhciBkYXRlID0gbmV3IERhdGUoeSwgbSwgZCwgaCwgTSwgcywgbXMpO1xuXG4gICAgICAgIC8vdGhlIGRhdGUgY29uc3RydWN0b3IgZG9lc24ndCBhY2NlcHQgeWVhcnMgPCAxOTcwXG4gICAgICAgIGlmICh5IDwgMTk3MCkge1xuICAgICAgICAgICAgZGF0ZS5zZXRGdWxsWWVhcih5KTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gZGF0ZTtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBtYWtlVVRDRGF0ZSh5KSB7XG4gICAgICAgIHZhciBkYXRlID0gbmV3IERhdGUoRGF0ZS5VVEMuYXBwbHkobnVsbCwgYXJndW1lbnRzKSk7XG4gICAgICAgIGlmICh5IDwgMTk3MCkge1xuICAgICAgICAgICAgZGF0ZS5zZXRVVENGdWxsWWVhcih5KTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gZGF0ZTtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBwYXJzZVdlZWtkYXkoaW5wdXQsIGxvY2FsZSkge1xuICAgICAgICBpZiAodHlwZW9mIGlucHV0ID09PSAnc3RyaW5nJykge1xuICAgICAgICAgICAgaWYgKCFpc05hTihpbnB1dCkpIHtcbiAgICAgICAgICAgICAgICBpbnB1dCA9IHBhcnNlSW50KGlucHV0LCAxMCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICBpbnB1dCA9IGxvY2FsZS53ZWVrZGF5c1BhcnNlKGlucHV0KTtcbiAgICAgICAgICAgICAgICBpZiAodHlwZW9mIGlucHV0ICE9PSAnbnVtYmVyJykge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGlucHV0O1xuICAgIH1cblxuICAgIC8qKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKipcbiAgICAgICAgUmVsYXRpdmUgVGltZVxuICAgICoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKi9cblxuXG4gICAgLy8gaGVscGVyIGZ1bmN0aW9uIGZvciBtb21lbnQuZm4uZnJvbSwgbW9tZW50LmZuLmZyb21Ob3csIGFuZCBtb21lbnQuZHVyYXRpb24uZm4uaHVtYW5pemVcbiAgICBmdW5jdGlvbiBzdWJzdGl0dXRlVGltZUFnbyhzdHJpbmcsIG51bWJlciwgd2l0aG91dFN1ZmZpeCwgaXNGdXR1cmUsIGxvY2FsZSkge1xuICAgICAgICByZXR1cm4gbG9jYWxlLnJlbGF0aXZlVGltZShudW1iZXIgfHwgMSwgISF3aXRob3V0U3VmZml4LCBzdHJpbmcsIGlzRnV0dXJlKTtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiByZWxhdGl2ZVRpbWUocG9zTmVnRHVyYXRpb24sIHdpdGhvdXRTdWZmaXgsIGxvY2FsZSkge1xuICAgICAgICB2YXIgZHVyYXRpb24gPSBtb21lbnQuZHVyYXRpb24ocG9zTmVnRHVyYXRpb24pLmFicygpLFxuICAgICAgICAgICAgc2Vjb25kcyA9IHJvdW5kKGR1cmF0aW9uLmFzKCdzJykpLFxuICAgICAgICAgICAgbWludXRlcyA9IHJvdW5kKGR1cmF0aW9uLmFzKCdtJykpLFxuICAgICAgICAgICAgaG91cnMgPSByb3VuZChkdXJhdGlvbi5hcygnaCcpKSxcbiAgICAgICAgICAgIGRheXMgPSByb3VuZChkdXJhdGlvbi5hcygnZCcpKSxcbiAgICAgICAgICAgIG1vbnRocyA9IHJvdW5kKGR1cmF0aW9uLmFzKCdNJykpLFxuICAgICAgICAgICAgeWVhcnMgPSByb3VuZChkdXJhdGlvbi5hcygneScpKSxcblxuICAgICAgICAgICAgYXJncyA9IHNlY29uZHMgPCByZWxhdGl2ZVRpbWVUaHJlc2hvbGRzLnMgJiYgWydzJywgc2Vjb25kc10gfHxcbiAgICAgICAgICAgICAgICBtaW51dGVzID09PSAxICYmIFsnbSddIHx8XG4gICAgICAgICAgICAgICAgbWludXRlcyA8IHJlbGF0aXZlVGltZVRocmVzaG9sZHMubSAmJiBbJ21tJywgbWludXRlc10gfHxcbiAgICAgICAgICAgICAgICBob3VycyA9PT0gMSAmJiBbJ2gnXSB8fFxuICAgICAgICAgICAgICAgIGhvdXJzIDwgcmVsYXRpdmVUaW1lVGhyZXNob2xkcy5oICYmIFsnaGgnLCBob3Vyc10gfHxcbiAgICAgICAgICAgICAgICBkYXlzID09PSAxICYmIFsnZCddIHx8XG4gICAgICAgICAgICAgICAgZGF5cyA8IHJlbGF0aXZlVGltZVRocmVzaG9sZHMuZCAmJiBbJ2RkJywgZGF5c10gfHxcbiAgICAgICAgICAgICAgICBtb250aHMgPT09IDEgJiYgWydNJ10gfHxcbiAgICAgICAgICAgICAgICBtb250aHMgPCByZWxhdGl2ZVRpbWVUaHJlc2hvbGRzLk0gJiYgWydNTScsIG1vbnRoc10gfHxcbiAgICAgICAgICAgICAgICB5ZWFycyA9PT0gMSAmJiBbJ3knXSB8fCBbJ3l5JywgeWVhcnNdO1xuXG4gICAgICAgIGFyZ3NbMl0gPSB3aXRob3V0U3VmZml4O1xuICAgICAgICBhcmdzWzNdID0gK3Bvc05lZ0R1cmF0aW9uID4gMDtcbiAgICAgICAgYXJnc1s0XSA9IGxvY2FsZTtcbiAgICAgICAgcmV0dXJuIHN1YnN0aXR1dGVUaW1lQWdvLmFwcGx5KHt9LCBhcmdzKTtcbiAgICB9XG5cblxuICAgIC8qKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKipcbiAgICAgICAgV2VlayBvZiBZZWFyXG4gICAgKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqL1xuXG5cbiAgICAvLyBmaXJzdERheU9mV2VlayAgICAgICAwID0gc3VuLCA2ID0gc2F0XG4gICAgLy8gICAgICAgICAgICAgICAgICAgICAgdGhlIGRheSBvZiB0aGUgd2VlayB0aGF0IHN0YXJ0cyB0aGUgd2Vla1xuICAgIC8vICAgICAgICAgICAgICAgICAgICAgICh1c3VhbGx5IHN1bmRheSBvciBtb25kYXkpXG4gICAgLy8gZmlyc3REYXlPZldlZWtPZlllYXIgMCA9IHN1biwgNiA9IHNhdFxuICAgIC8vICAgICAgICAgICAgICAgICAgICAgIHRoZSBmaXJzdCB3ZWVrIGlzIHRoZSB3ZWVrIHRoYXQgY29udGFpbnMgdGhlIGZpcnN0XG4gICAgLy8gICAgICAgICAgICAgICAgICAgICAgb2YgdGhpcyBkYXkgb2YgdGhlIHdlZWtcbiAgICAvLyAgICAgICAgICAgICAgICAgICAgICAoZWcuIElTTyB3ZWVrcyB1c2UgdGh1cnNkYXkgKDQpKVxuICAgIGZ1bmN0aW9uIHdlZWtPZlllYXIobW9tLCBmaXJzdERheU9mV2VlaywgZmlyc3REYXlPZldlZWtPZlllYXIpIHtcbiAgICAgICAgdmFyIGVuZCA9IGZpcnN0RGF5T2ZXZWVrT2ZZZWFyIC0gZmlyc3REYXlPZldlZWssXG4gICAgICAgICAgICBkYXlzVG9EYXlPZldlZWsgPSBmaXJzdERheU9mV2Vla09mWWVhciAtIG1vbS5kYXkoKSxcbiAgICAgICAgICAgIGFkanVzdGVkTW9tZW50O1xuXG5cbiAgICAgICAgaWYgKGRheXNUb0RheU9mV2VlayA+IGVuZCkge1xuICAgICAgICAgICAgZGF5c1RvRGF5T2ZXZWVrIC09IDc7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoZGF5c1RvRGF5T2ZXZWVrIDwgZW5kIC0gNykge1xuICAgICAgICAgICAgZGF5c1RvRGF5T2ZXZWVrICs9IDc7XG4gICAgICAgIH1cblxuICAgICAgICBhZGp1c3RlZE1vbWVudCA9IG1vbWVudChtb20pLmFkZChkYXlzVG9EYXlPZldlZWssICdkJyk7XG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICB3ZWVrOiBNYXRoLmNlaWwoYWRqdXN0ZWRNb21lbnQuZGF5T2ZZZWFyKCkgLyA3KSxcbiAgICAgICAgICAgIHllYXI6IGFkanVzdGVkTW9tZW50LnllYXIoKVxuICAgICAgICB9O1xuICAgIH1cblxuICAgIC8vaHR0cDovL2VuLndpa2lwZWRpYS5vcmcvd2lraS9JU09fd2Vla19kYXRlI0NhbGN1bGF0aW5nX2FfZGF0ZV9naXZlbl90aGVfeWVhci4yQ193ZWVrX251bWJlcl9hbmRfd2Vla2RheVxuICAgIGZ1bmN0aW9uIGRheU9mWWVhckZyb21XZWVrcyh5ZWFyLCB3ZWVrLCB3ZWVrZGF5LCBmaXJzdERheU9mV2Vla09mWWVhciwgZmlyc3REYXlPZldlZWspIHtcbiAgICAgICAgdmFyIGQgPSBtYWtlVVRDRGF0ZSh5ZWFyLCAwLCAxKS5nZXRVVENEYXkoKSwgZGF5c1RvQWRkLCBkYXlPZlllYXI7XG5cbiAgICAgICAgZCA9IGQgPT09IDAgPyA3IDogZDtcbiAgICAgICAgd2Vla2RheSA9IHdlZWtkYXkgIT0gbnVsbCA/IHdlZWtkYXkgOiBmaXJzdERheU9mV2VlaztcbiAgICAgICAgZGF5c1RvQWRkID0gZmlyc3REYXlPZldlZWsgLSBkICsgKGQgPiBmaXJzdERheU9mV2Vla09mWWVhciA/IDcgOiAwKSAtIChkIDwgZmlyc3REYXlPZldlZWsgPyA3IDogMCk7XG4gICAgICAgIGRheU9mWWVhciA9IDcgKiAod2VlayAtIDEpICsgKHdlZWtkYXkgLSBmaXJzdERheU9mV2VlaykgKyBkYXlzVG9BZGQgKyAxO1xuXG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICB5ZWFyOiBkYXlPZlllYXIgPiAwID8geWVhciA6IHllYXIgLSAxLFxuICAgICAgICAgICAgZGF5T2ZZZWFyOiBkYXlPZlllYXIgPiAwID8gIGRheU9mWWVhciA6IGRheXNJblllYXIoeWVhciAtIDEpICsgZGF5T2ZZZWFyXG4gICAgICAgIH07XG4gICAgfVxuXG4gICAgLyoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKlxuICAgICAgICBUb3AgTGV2ZWwgRnVuY3Rpb25zXG4gICAgKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqL1xuXG4gICAgZnVuY3Rpb24gbWFrZU1vbWVudChjb25maWcpIHtcbiAgICAgICAgdmFyIGlucHV0ID0gY29uZmlnLl9pLFxuICAgICAgICAgICAgZm9ybWF0ID0gY29uZmlnLl9mO1xuXG4gICAgICAgIGNvbmZpZy5fbG9jYWxlID0gY29uZmlnLl9sb2NhbGUgfHwgbW9tZW50LmxvY2FsZURhdGEoY29uZmlnLl9sKTtcblxuICAgICAgICBpZiAoaW5wdXQgPT09IG51bGwgfHwgKGZvcm1hdCA9PT0gdW5kZWZpbmVkICYmIGlucHV0ID09PSAnJykpIHtcbiAgICAgICAgICAgIHJldHVybiBtb21lbnQuaW52YWxpZCh7bnVsbElucHV0OiB0cnVlfSk7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAodHlwZW9mIGlucHV0ID09PSAnc3RyaW5nJykge1xuICAgICAgICAgICAgY29uZmlnLl9pID0gaW5wdXQgPSBjb25maWcuX2xvY2FsZS5wcmVwYXJzZShpbnB1dCk7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAobW9tZW50LmlzTW9tZW50KGlucHV0KSkge1xuICAgICAgICAgICAgcmV0dXJuIG5ldyBNb21lbnQoaW5wdXQsIHRydWUpO1xuICAgICAgICB9IGVsc2UgaWYgKGZvcm1hdCkge1xuICAgICAgICAgICAgaWYgKGlzQXJyYXkoZm9ybWF0KSkge1xuICAgICAgICAgICAgICAgIG1ha2VEYXRlRnJvbVN0cmluZ0FuZEFycmF5KGNvbmZpZyk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIG1ha2VEYXRlRnJvbVN0cmluZ0FuZEZvcm1hdChjb25maWcpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgbWFrZURhdGVGcm9tSW5wdXQoY29uZmlnKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiBuZXcgTW9tZW50KGNvbmZpZyk7XG4gICAgfVxuXG4gICAgbW9tZW50ID0gZnVuY3Rpb24gKGlucHV0LCBmb3JtYXQsIGxvY2FsZSwgc3RyaWN0KSB7XG4gICAgICAgIHZhciBjO1xuXG4gICAgICAgIGlmICh0eXBlb2YobG9jYWxlKSA9PT0gJ2Jvb2xlYW4nKSB7XG4gICAgICAgICAgICBzdHJpY3QgPSBsb2NhbGU7XG4gICAgICAgICAgICBsb2NhbGUgPSB1bmRlZmluZWQ7XG4gICAgICAgIH1cbiAgICAgICAgLy8gb2JqZWN0IGNvbnN0cnVjdGlvbiBtdXN0IGJlIGRvbmUgdGhpcyB3YXkuXG4gICAgICAgIC8vIGh0dHBzOi8vZ2l0aHViLmNvbS9tb21lbnQvbW9tZW50L2lzc3Vlcy8xNDIzXG4gICAgICAgIGMgPSB7fTtcbiAgICAgICAgYy5faXNBTW9tZW50T2JqZWN0ID0gdHJ1ZTtcbiAgICAgICAgYy5faSA9IGlucHV0O1xuICAgICAgICBjLl9mID0gZm9ybWF0O1xuICAgICAgICBjLl9sID0gbG9jYWxlO1xuICAgICAgICBjLl9zdHJpY3QgPSBzdHJpY3Q7XG4gICAgICAgIGMuX2lzVVRDID0gZmFsc2U7XG4gICAgICAgIGMuX3BmID0gZGVmYXVsdFBhcnNpbmdGbGFncygpO1xuXG4gICAgICAgIHJldHVybiBtYWtlTW9tZW50KGMpO1xuICAgIH07XG5cbiAgICBtb21lbnQuc3VwcHJlc3NEZXByZWNhdGlvbldhcm5pbmdzID0gZmFsc2U7XG5cbiAgICBtb21lbnQuY3JlYXRlRnJvbUlucHV0RmFsbGJhY2sgPSBkZXByZWNhdGUoXG4gICAgICAgICdtb21lbnQgY29uc3RydWN0aW9uIGZhbGxzIGJhY2sgdG8ganMgRGF0ZS4gVGhpcyBpcyAnICtcbiAgICAgICAgJ2Rpc2NvdXJhZ2VkIGFuZCB3aWxsIGJlIHJlbW92ZWQgaW4gdXBjb21pbmcgbWFqb3IgJyArXG4gICAgICAgICdyZWxlYXNlLiBQbGVhc2UgcmVmZXIgdG8gJyArXG4gICAgICAgICdodHRwczovL2dpdGh1Yi5jb20vbW9tZW50L21vbWVudC9pc3N1ZXMvMTQwNyBmb3IgbW9yZSBpbmZvLicsXG4gICAgICAgIGZ1bmN0aW9uIChjb25maWcpIHtcbiAgICAgICAgICAgIGNvbmZpZy5fZCA9IG5ldyBEYXRlKGNvbmZpZy5faSk7XG4gICAgICAgIH1cbiAgICApO1xuXG4gICAgLy8gUGljayBhIG1vbWVudCBtIGZyb20gbW9tZW50cyBzbyB0aGF0IG1bZm5dKG90aGVyKSBpcyB0cnVlIGZvciBhbGxcbiAgICAvLyBvdGhlci4gVGhpcyByZWxpZXMgb24gdGhlIGZ1bmN0aW9uIGZuIHRvIGJlIHRyYW5zaXRpdmUuXG4gICAgLy9cbiAgICAvLyBtb21lbnRzIHNob3VsZCBlaXRoZXIgYmUgYW4gYXJyYXkgb2YgbW9tZW50IG9iamVjdHMgb3IgYW4gYXJyYXksIHdob3NlXG4gICAgLy8gZmlyc3QgZWxlbWVudCBpcyBhbiBhcnJheSBvZiBtb21lbnQgb2JqZWN0cy5cbiAgICBmdW5jdGlvbiBwaWNrQnkoZm4sIG1vbWVudHMpIHtcbiAgICAgICAgdmFyIHJlcywgaTtcbiAgICAgICAgaWYgKG1vbWVudHMubGVuZ3RoID09PSAxICYmIGlzQXJyYXkobW9tZW50c1swXSkpIHtcbiAgICAgICAgICAgIG1vbWVudHMgPSBtb21lbnRzWzBdO1xuICAgICAgICB9XG4gICAgICAgIGlmICghbW9tZW50cy5sZW5ndGgpIHtcbiAgICAgICAgICAgIHJldHVybiBtb21lbnQoKTtcbiAgICAgICAgfVxuICAgICAgICByZXMgPSBtb21lbnRzWzBdO1xuICAgICAgICBmb3IgKGkgPSAxOyBpIDwgbW9tZW50cy5sZW5ndGg7ICsraSkge1xuICAgICAgICAgICAgaWYgKG1vbWVudHNbaV1bZm5dKHJlcykpIHtcbiAgICAgICAgICAgICAgICByZXMgPSBtb21lbnRzW2ldO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHJldHVybiByZXM7XG4gICAgfVxuXG4gICAgbW9tZW50Lm1pbiA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgdmFyIGFyZ3MgPSBbXS5zbGljZS5jYWxsKGFyZ3VtZW50cywgMCk7XG5cbiAgICAgICAgcmV0dXJuIHBpY2tCeSgnaXNCZWZvcmUnLCBhcmdzKTtcbiAgICB9O1xuXG4gICAgbW9tZW50Lm1heCA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgdmFyIGFyZ3MgPSBbXS5zbGljZS5jYWxsKGFyZ3VtZW50cywgMCk7XG5cbiAgICAgICAgcmV0dXJuIHBpY2tCeSgnaXNBZnRlcicsIGFyZ3MpO1xuICAgIH07XG5cbiAgICAvLyBjcmVhdGluZyB3aXRoIHV0Y1xuICAgIG1vbWVudC51dGMgPSBmdW5jdGlvbiAoaW5wdXQsIGZvcm1hdCwgbG9jYWxlLCBzdHJpY3QpIHtcbiAgICAgICAgdmFyIGM7XG5cbiAgICAgICAgaWYgKHR5cGVvZihsb2NhbGUpID09PSAnYm9vbGVhbicpIHtcbiAgICAgICAgICAgIHN0cmljdCA9IGxvY2FsZTtcbiAgICAgICAgICAgIGxvY2FsZSA9IHVuZGVmaW5lZDtcbiAgICAgICAgfVxuICAgICAgICAvLyBvYmplY3QgY29uc3RydWN0aW9uIG11c3QgYmUgZG9uZSB0aGlzIHdheS5cbiAgICAgICAgLy8gaHR0cHM6Ly9naXRodWIuY29tL21vbWVudC9tb21lbnQvaXNzdWVzLzE0MjNcbiAgICAgICAgYyA9IHt9O1xuICAgICAgICBjLl9pc0FNb21lbnRPYmplY3QgPSB0cnVlO1xuICAgICAgICBjLl91c2VVVEMgPSB0cnVlO1xuICAgICAgICBjLl9pc1VUQyA9IHRydWU7XG4gICAgICAgIGMuX2wgPSBsb2NhbGU7XG4gICAgICAgIGMuX2kgPSBpbnB1dDtcbiAgICAgICAgYy5fZiA9IGZvcm1hdDtcbiAgICAgICAgYy5fc3RyaWN0ID0gc3RyaWN0O1xuICAgICAgICBjLl9wZiA9IGRlZmF1bHRQYXJzaW5nRmxhZ3MoKTtcblxuICAgICAgICByZXR1cm4gbWFrZU1vbWVudChjKS51dGMoKTtcbiAgICB9O1xuXG4gICAgLy8gY3JlYXRpbmcgd2l0aCB1bml4IHRpbWVzdGFtcCAoaW4gc2Vjb25kcylcbiAgICBtb21lbnQudW5peCA9IGZ1bmN0aW9uIChpbnB1dCkge1xuICAgICAgICByZXR1cm4gbW9tZW50KGlucHV0ICogMTAwMCk7XG4gICAgfTtcblxuICAgIC8vIGR1cmF0aW9uXG4gICAgbW9tZW50LmR1cmF0aW9uID0gZnVuY3Rpb24gKGlucHV0LCBrZXkpIHtcbiAgICAgICAgdmFyIGR1cmF0aW9uID0gaW5wdXQsXG4gICAgICAgICAgICAvLyBtYXRjaGluZyBhZ2FpbnN0IHJlZ2V4cCBpcyBleHBlbnNpdmUsIGRvIGl0IG9uIGRlbWFuZFxuICAgICAgICAgICAgbWF0Y2ggPSBudWxsLFxuICAgICAgICAgICAgc2lnbixcbiAgICAgICAgICAgIHJldCxcbiAgICAgICAgICAgIHBhcnNlSXNvLFxuICAgICAgICAgICAgZGlmZlJlcztcblxuICAgICAgICBpZiAobW9tZW50LmlzRHVyYXRpb24oaW5wdXQpKSB7XG4gICAgICAgICAgICBkdXJhdGlvbiA9IHtcbiAgICAgICAgICAgICAgICBtczogaW5wdXQuX21pbGxpc2Vjb25kcyxcbiAgICAgICAgICAgICAgICBkOiBpbnB1dC5fZGF5cyxcbiAgICAgICAgICAgICAgICBNOiBpbnB1dC5fbW9udGhzXG4gICAgICAgICAgICB9O1xuICAgICAgICB9IGVsc2UgaWYgKHR5cGVvZiBpbnB1dCA9PT0gJ251bWJlcicpIHtcbiAgICAgICAgICAgIGR1cmF0aW9uID0ge307XG4gICAgICAgICAgICBpZiAoa2V5KSB7XG4gICAgICAgICAgICAgICAgZHVyYXRpb25ba2V5XSA9IGlucHV0O1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBkdXJhdGlvbi5taWxsaXNlY29uZHMgPSBpbnB1dDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSBlbHNlIGlmICghIShtYXRjaCA9IGFzcE5ldFRpbWVTcGFuSnNvblJlZ2V4LmV4ZWMoaW5wdXQpKSkge1xuICAgICAgICAgICAgc2lnbiA9IChtYXRjaFsxXSA9PT0gJy0nKSA/IC0xIDogMTtcbiAgICAgICAgICAgIGR1cmF0aW9uID0ge1xuICAgICAgICAgICAgICAgIHk6IDAsXG4gICAgICAgICAgICAgICAgZDogdG9JbnQobWF0Y2hbREFURV0pICogc2lnbixcbiAgICAgICAgICAgICAgICBoOiB0b0ludChtYXRjaFtIT1VSXSkgKiBzaWduLFxuICAgICAgICAgICAgICAgIG06IHRvSW50KG1hdGNoW01JTlVURV0pICogc2lnbixcbiAgICAgICAgICAgICAgICBzOiB0b0ludChtYXRjaFtTRUNPTkRdKSAqIHNpZ24sXG4gICAgICAgICAgICAgICAgbXM6IHRvSW50KG1hdGNoW01JTExJU0VDT05EXSkgKiBzaWduXG4gICAgICAgICAgICB9O1xuICAgICAgICB9IGVsc2UgaWYgKCEhKG1hdGNoID0gaXNvRHVyYXRpb25SZWdleC5leGVjKGlucHV0KSkpIHtcbiAgICAgICAgICAgIHNpZ24gPSAobWF0Y2hbMV0gPT09ICctJykgPyAtMSA6IDE7XG4gICAgICAgICAgICBwYXJzZUlzbyA9IGZ1bmN0aW9uIChpbnApIHtcbiAgICAgICAgICAgICAgICAvLyBXZSdkIG5vcm1hbGx5IHVzZSB+fmlucCBmb3IgdGhpcywgYnV0IHVuZm9ydHVuYXRlbHkgaXQgYWxzb1xuICAgICAgICAgICAgICAgIC8vIGNvbnZlcnRzIGZsb2F0cyB0byBpbnRzLlxuICAgICAgICAgICAgICAgIC8vIGlucCBtYXkgYmUgdW5kZWZpbmVkLCBzbyBjYXJlZnVsIGNhbGxpbmcgcmVwbGFjZSBvbiBpdC5cbiAgICAgICAgICAgICAgICB2YXIgcmVzID0gaW5wICYmIHBhcnNlRmxvYXQoaW5wLnJlcGxhY2UoJywnLCAnLicpKTtcbiAgICAgICAgICAgICAgICAvLyBhcHBseSBzaWduIHdoaWxlIHdlJ3JlIGF0IGl0XG4gICAgICAgICAgICAgICAgcmV0dXJuIChpc05hTihyZXMpID8gMCA6IHJlcykgKiBzaWduO1xuICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIGR1cmF0aW9uID0ge1xuICAgICAgICAgICAgICAgIHk6IHBhcnNlSXNvKG1hdGNoWzJdKSxcbiAgICAgICAgICAgICAgICBNOiBwYXJzZUlzbyhtYXRjaFszXSksXG4gICAgICAgICAgICAgICAgZDogcGFyc2VJc28obWF0Y2hbNF0pLFxuICAgICAgICAgICAgICAgIGg6IHBhcnNlSXNvKG1hdGNoWzVdKSxcbiAgICAgICAgICAgICAgICBtOiBwYXJzZUlzbyhtYXRjaFs2XSksXG4gICAgICAgICAgICAgICAgczogcGFyc2VJc28obWF0Y2hbN10pLFxuICAgICAgICAgICAgICAgIHc6IHBhcnNlSXNvKG1hdGNoWzhdKVxuICAgICAgICAgICAgfTtcbiAgICAgICAgfSBlbHNlIGlmICh0eXBlb2YgZHVyYXRpb24gPT09ICdvYmplY3QnICYmXG4gICAgICAgICAgICAgICAgKCdmcm9tJyBpbiBkdXJhdGlvbiB8fCAndG8nIGluIGR1cmF0aW9uKSkge1xuICAgICAgICAgICAgZGlmZlJlcyA9IG1vbWVudHNEaWZmZXJlbmNlKG1vbWVudChkdXJhdGlvbi5mcm9tKSwgbW9tZW50KGR1cmF0aW9uLnRvKSk7XG5cbiAgICAgICAgICAgIGR1cmF0aW9uID0ge307XG4gICAgICAgICAgICBkdXJhdGlvbi5tcyA9IGRpZmZSZXMubWlsbGlzZWNvbmRzO1xuICAgICAgICAgICAgZHVyYXRpb24uTSA9IGRpZmZSZXMubW9udGhzO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0ID0gbmV3IER1cmF0aW9uKGR1cmF0aW9uKTtcblxuICAgICAgICBpZiAobW9tZW50LmlzRHVyYXRpb24oaW5wdXQpICYmIGhhc093blByb3AoaW5wdXQsICdfbG9jYWxlJykpIHtcbiAgICAgICAgICAgIHJldC5fbG9jYWxlID0gaW5wdXQuX2xvY2FsZTtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiByZXQ7XG4gICAgfTtcblxuICAgIC8vIHZlcnNpb24gbnVtYmVyXG4gICAgbW9tZW50LnZlcnNpb24gPSBWRVJTSU9OO1xuXG4gICAgLy8gZGVmYXVsdCBmb3JtYXRcbiAgICBtb21lbnQuZGVmYXVsdEZvcm1hdCA9IGlzb0Zvcm1hdDtcblxuICAgIC8vIGNvbnN0YW50IHRoYXQgcmVmZXJzIHRvIHRoZSBJU08gc3RhbmRhcmRcbiAgICBtb21lbnQuSVNPXzg2MDEgPSBmdW5jdGlvbiAoKSB7fTtcblxuICAgIC8vIFBsdWdpbnMgdGhhdCBhZGQgcHJvcGVydGllcyBzaG91bGQgYWxzbyBhZGQgdGhlIGtleSBoZXJlIChudWxsIHZhbHVlKSxcbiAgICAvLyBzbyB3ZSBjYW4gcHJvcGVybHkgY2xvbmUgb3Vyc2VsdmVzLlxuICAgIG1vbWVudC5tb21lbnRQcm9wZXJ0aWVzID0gbW9tZW50UHJvcGVydGllcztcblxuICAgIC8vIFRoaXMgZnVuY3Rpb24gd2lsbCBiZSBjYWxsZWQgd2hlbmV2ZXIgYSBtb21lbnQgaXMgbXV0YXRlZC5cbiAgICAvLyBJdCBpcyBpbnRlbmRlZCB0byBrZWVwIHRoZSBvZmZzZXQgaW4gc3luYyB3aXRoIHRoZSB0aW1lem9uZS5cbiAgICBtb21lbnQudXBkYXRlT2Zmc2V0ID0gZnVuY3Rpb24gKCkge307XG5cbiAgICAvLyBUaGlzIGZ1bmN0aW9uIGFsbG93cyB5b3UgdG8gc2V0IGEgdGhyZXNob2xkIGZvciByZWxhdGl2ZSB0aW1lIHN0cmluZ3NcbiAgICBtb21lbnQucmVsYXRpdmVUaW1lVGhyZXNob2xkID0gZnVuY3Rpb24gKHRocmVzaG9sZCwgbGltaXQpIHtcbiAgICAgICAgaWYgKHJlbGF0aXZlVGltZVRocmVzaG9sZHNbdGhyZXNob2xkXSA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKGxpbWl0ID09PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgIHJldHVybiByZWxhdGl2ZVRpbWVUaHJlc2hvbGRzW3RocmVzaG9sZF07XG4gICAgICAgIH1cbiAgICAgICAgcmVsYXRpdmVUaW1lVGhyZXNob2xkc1t0aHJlc2hvbGRdID0gbGltaXQ7XG4gICAgICAgIHJldHVybiB0cnVlO1xuICAgIH07XG5cbiAgICBtb21lbnQubGFuZyA9IGRlcHJlY2F0ZShcbiAgICAgICAgJ21vbWVudC5sYW5nIGlzIGRlcHJlY2F0ZWQuIFVzZSBtb21lbnQubG9jYWxlIGluc3RlYWQuJyxcbiAgICAgICAgZnVuY3Rpb24gKGtleSwgdmFsdWUpIHtcbiAgICAgICAgICAgIHJldHVybiBtb21lbnQubG9jYWxlKGtleSwgdmFsdWUpO1xuICAgICAgICB9XG4gICAgKTtcblxuICAgIC8vIFRoaXMgZnVuY3Rpb24gd2lsbCBsb2FkIGxvY2FsZSBhbmQgdGhlbiBzZXQgdGhlIGdsb2JhbCBsb2NhbGUuICBJZlxuICAgIC8vIG5vIGFyZ3VtZW50cyBhcmUgcGFzc2VkIGluLCBpdCB3aWxsIHNpbXBseSByZXR1cm4gdGhlIGN1cnJlbnQgZ2xvYmFsXG4gICAgLy8gbG9jYWxlIGtleS5cbiAgICBtb21lbnQubG9jYWxlID0gZnVuY3Rpb24gKGtleSwgdmFsdWVzKSB7XG4gICAgICAgIHZhciBkYXRhO1xuICAgICAgICBpZiAoa2V5KSB7XG4gICAgICAgICAgICBpZiAodHlwZW9mKHZhbHVlcykgIT09ICd1bmRlZmluZWQnKSB7XG4gICAgICAgICAgICAgICAgZGF0YSA9IG1vbWVudC5kZWZpbmVMb2NhbGUoa2V5LCB2YWx1ZXMpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgZGF0YSA9IG1vbWVudC5sb2NhbGVEYXRhKGtleSk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGlmIChkYXRhKSB7XG4gICAgICAgICAgICAgICAgbW9tZW50LmR1cmF0aW9uLl9sb2NhbGUgPSBtb21lbnQuX2xvY2FsZSA9IGRhdGE7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gbW9tZW50Ll9sb2NhbGUuX2FiYnI7XG4gICAgfTtcblxuICAgIG1vbWVudC5kZWZpbmVMb2NhbGUgPSBmdW5jdGlvbiAobmFtZSwgdmFsdWVzKSB7XG4gICAgICAgIGlmICh2YWx1ZXMgIT09IG51bGwpIHtcbiAgICAgICAgICAgIHZhbHVlcy5hYmJyID0gbmFtZTtcbiAgICAgICAgICAgIGlmICghbG9jYWxlc1tuYW1lXSkge1xuICAgICAgICAgICAgICAgIGxvY2FsZXNbbmFtZV0gPSBuZXcgTG9jYWxlKCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBsb2NhbGVzW25hbWVdLnNldCh2YWx1ZXMpO1xuXG4gICAgICAgICAgICAvLyBiYWNrd2FyZHMgY29tcGF0IGZvciBub3c6IGFsc28gc2V0IHRoZSBsb2NhbGVcbiAgICAgICAgICAgIG1vbWVudC5sb2NhbGUobmFtZSk7XG5cbiAgICAgICAgICAgIHJldHVybiBsb2NhbGVzW25hbWVdO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgLy8gdXNlZnVsIGZvciB0ZXN0aW5nXG4gICAgICAgICAgICBkZWxldGUgbG9jYWxlc1tuYW1lXTtcbiAgICAgICAgICAgIHJldHVybiBudWxsO1xuICAgICAgICB9XG4gICAgfTtcblxuICAgIG1vbWVudC5sYW5nRGF0YSA9IGRlcHJlY2F0ZShcbiAgICAgICAgJ21vbWVudC5sYW5nRGF0YSBpcyBkZXByZWNhdGVkLiBVc2UgbW9tZW50LmxvY2FsZURhdGEgaW5zdGVhZC4nLFxuICAgICAgICBmdW5jdGlvbiAoa2V5KSB7XG4gICAgICAgICAgICByZXR1cm4gbW9tZW50LmxvY2FsZURhdGEoa2V5KTtcbiAgICAgICAgfVxuICAgICk7XG5cbiAgICAvLyByZXR1cm5zIGxvY2FsZSBkYXRhXG4gICAgbW9tZW50LmxvY2FsZURhdGEgPSBmdW5jdGlvbiAoa2V5KSB7XG4gICAgICAgIHZhciBsb2NhbGU7XG5cbiAgICAgICAgaWYgKGtleSAmJiBrZXkuX2xvY2FsZSAmJiBrZXkuX2xvY2FsZS5fYWJicikge1xuICAgICAgICAgICAga2V5ID0ga2V5Ll9sb2NhbGUuX2FiYnI7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoIWtleSkge1xuICAgICAgICAgICAgcmV0dXJuIG1vbWVudC5fbG9jYWxlO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKCFpc0FycmF5KGtleSkpIHtcbiAgICAgICAgICAgIC8vc2hvcnQtY2lyY3VpdCBldmVyeXRoaW5nIGVsc2VcbiAgICAgICAgICAgIGxvY2FsZSA9IGxvYWRMb2NhbGUoa2V5KTtcbiAgICAgICAgICAgIGlmIChsb2NhbGUpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gbG9jYWxlO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAga2V5ID0gW2tleV07XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gY2hvb3NlTG9jYWxlKGtleSk7XG4gICAgfTtcblxuICAgIC8vIGNvbXBhcmUgbW9tZW50IG9iamVjdFxuICAgIG1vbWVudC5pc01vbWVudCA9IGZ1bmN0aW9uIChvYmopIHtcbiAgICAgICAgcmV0dXJuIG9iaiBpbnN0YW5jZW9mIE1vbWVudCB8fFxuICAgICAgICAgICAgKG9iaiAhPSBudWxsICYmIGhhc093blByb3Aob2JqLCAnX2lzQU1vbWVudE9iamVjdCcpKTtcbiAgICB9O1xuXG4gICAgLy8gZm9yIHR5cGVjaGVja2luZyBEdXJhdGlvbiBvYmplY3RzXG4gICAgbW9tZW50LmlzRHVyYXRpb24gPSBmdW5jdGlvbiAob2JqKSB7XG4gICAgICAgIHJldHVybiBvYmogaW5zdGFuY2VvZiBEdXJhdGlvbjtcbiAgICB9O1xuXG4gICAgZm9yIChpID0gbGlzdHMubGVuZ3RoIC0gMTsgaSA+PSAwOyAtLWkpIHtcbiAgICAgICAgbWFrZUxpc3QobGlzdHNbaV0pO1xuICAgIH1cblxuICAgIG1vbWVudC5ub3JtYWxpemVVbml0cyA9IGZ1bmN0aW9uICh1bml0cykge1xuICAgICAgICByZXR1cm4gbm9ybWFsaXplVW5pdHModW5pdHMpO1xuICAgIH07XG5cbiAgICBtb21lbnQuaW52YWxpZCA9IGZ1bmN0aW9uIChmbGFncykge1xuICAgICAgICB2YXIgbSA9IG1vbWVudC51dGMoTmFOKTtcbiAgICAgICAgaWYgKGZsYWdzICE9IG51bGwpIHtcbiAgICAgICAgICAgIGV4dGVuZChtLl9wZiwgZmxhZ3MpO1xuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgbS5fcGYudXNlckludmFsaWRhdGVkID0gdHJ1ZTtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiBtO1xuICAgIH07XG5cbiAgICBtb21lbnQucGFyc2Vab25lID0gZnVuY3Rpb24gKCkge1xuICAgICAgICByZXR1cm4gbW9tZW50LmFwcGx5KG51bGwsIGFyZ3VtZW50cykucGFyc2Vab25lKCk7XG4gICAgfTtcblxuICAgIG1vbWVudC5wYXJzZVR3b0RpZ2l0WWVhciA9IGZ1bmN0aW9uIChpbnB1dCkge1xuICAgICAgICByZXR1cm4gdG9JbnQoaW5wdXQpICsgKHRvSW50KGlucHV0KSA+IDY4ID8gMTkwMCA6IDIwMDApO1xuICAgIH07XG5cbiAgICAvKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqXG4gICAgICAgIE1vbWVudCBQcm90b3R5cGVcbiAgICAqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKiovXG5cblxuICAgIGV4dGVuZChtb21lbnQuZm4gPSBNb21lbnQucHJvdG90eXBlLCB7XG5cbiAgICAgICAgY2xvbmUgOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICByZXR1cm4gbW9tZW50KHRoaXMpO1xuICAgICAgICB9LFxuXG4gICAgICAgIHZhbHVlT2YgOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICByZXR1cm4gK3RoaXMuX2QgKyAoKHRoaXMuX29mZnNldCB8fCAwKSAqIDYwMDAwKTtcbiAgICAgICAgfSxcblxuICAgICAgICB1bml4IDogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgcmV0dXJuIE1hdGguZmxvb3IoK3RoaXMgLyAxMDAwKTtcbiAgICAgICAgfSxcblxuICAgICAgICB0b1N0cmluZyA6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLmNsb25lKCkubG9jYWxlKCdlbicpLmZvcm1hdCgnZGRkIE1NTSBERCBZWVlZIEhIOm1tOnNzIFtHTVRdWlonKTtcbiAgICAgICAgfSxcblxuICAgICAgICB0b0RhdGUgOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5fb2Zmc2V0ID8gbmV3IERhdGUoK3RoaXMpIDogdGhpcy5fZDtcbiAgICAgICAgfSxcblxuICAgICAgICB0b0lTT1N0cmluZyA6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHZhciBtID0gbW9tZW50KHRoaXMpLnV0YygpO1xuICAgICAgICAgICAgaWYgKDAgPCBtLnllYXIoKSAmJiBtLnllYXIoKSA8PSA5OTk5KSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGZvcm1hdE1vbWVudChtLCAnWVlZWS1NTS1ERFtUXUhIOm1tOnNzLlNTU1taXScpO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gZm9ybWF0TW9tZW50KG0sICdZWVlZWVktTU0tRERbVF1ISDptbTpzcy5TU1NbWl0nKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSxcblxuICAgICAgICB0b0FycmF5IDogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgdmFyIG0gPSB0aGlzO1xuICAgICAgICAgICAgcmV0dXJuIFtcbiAgICAgICAgICAgICAgICBtLnllYXIoKSxcbiAgICAgICAgICAgICAgICBtLm1vbnRoKCksXG4gICAgICAgICAgICAgICAgbS5kYXRlKCksXG4gICAgICAgICAgICAgICAgbS5ob3VycygpLFxuICAgICAgICAgICAgICAgIG0ubWludXRlcygpLFxuICAgICAgICAgICAgICAgIG0uc2Vjb25kcygpLFxuICAgICAgICAgICAgICAgIG0ubWlsbGlzZWNvbmRzKClcbiAgICAgICAgICAgIF07XG4gICAgICAgIH0sXG5cbiAgICAgICAgaXNWYWxpZCA6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHJldHVybiBpc1ZhbGlkKHRoaXMpO1xuICAgICAgICB9LFxuXG4gICAgICAgIGlzRFNUU2hpZnRlZCA6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIGlmICh0aGlzLl9hKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHRoaXMuaXNWYWxpZCgpICYmIGNvbXBhcmVBcnJheXModGhpcy5fYSwgKHRoaXMuX2lzVVRDID8gbW9tZW50LnV0Yyh0aGlzLl9hKSA6IG1vbWVudCh0aGlzLl9hKSkudG9BcnJheSgpKSA+IDA7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgfSxcblxuICAgICAgICBwYXJzaW5nRmxhZ3MgOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICByZXR1cm4gZXh0ZW5kKHt9LCB0aGlzLl9wZik7XG4gICAgICAgIH0sXG5cbiAgICAgICAgaW52YWxpZEF0OiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5fcGYub3ZlcmZsb3c7XG4gICAgICAgIH0sXG5cbiAgICAgICAgdXRjIDogZnVuY3Rpb24gKGtlZXBMb2NhbFRpbWUpIHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLnpvbmUoMCwga2VlcExvY2FsVGltZSk7XG4gICAgICAgIH0sXG5cbiAgICAgICAgbG9jYWwgOiBmdW5jdGlvbiAoa2VlcExvY2FsVGltZSkge1xuICAgICAgICAgICAgaWYgKHRoaXMuX2lzVVRDKSB7XG4gICAgICAgICAgICAgICAgdGhpcy56b25lKDAsIGtlZXBMb2NhbFRpbWUpO1xuICAgICAgICAgICAgICAgIHRoaXMuX2lzVVRDID0gZmFsc2U7XG5cbiAgICAgICAgICAgICAgICBpZiAoa2VlcExvY2FsVGltZSkge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLmFkZCh0aGlzLl9kYXRlVHpPZmZzZXQoKSwgJ20nKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gdGhpcztcbiAgICAgICAgfSxcblxuICAgICAgICBmb3JtYXQgOiBmdW5jdGlvbiAoaW5wdXRTdHJpbmcpIHtcbiAgICAgICAgICAgIHZhciBvdXRwdXQgPSBmb3JtYXRNb21lbnQodGhpcywgaW5wdXRTdHJpbmcgfHwgbW9tZW50LmRlZmF1bHRGb3JtYXQpO1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMubG9jYWxlRGF0YSgpLnBvc3Rmb3JtYXQob3V0cHV0KTtcbiAgICAgICAgfSxcblxuICAgICAgICBhZGQgOiBjcmVhdGVBZGRlcigxLCAnYWRkJyksXG5cbiAgICAgICAgc3VidHJhY3QgOiBjcmVhdGVBZGRlcigtMSwgJ3N1YnRyYWN0JyksXG5cbiAgICAgICAgZGlmZiA6IGZ1bmN0aW9uIChpbnB1dCwgdW5pdHMsIGFzRmxvYXQpIHtcbiAgICAgICAgICAgIHZhciB0aGF0ID0gbWFrZUFzKGlucHV0LCB0aGlzKSxcbiAgICAgICAgICAgICAgICB6b25lRGlmZiA9ICh0aGlzLnpvbmUoKSAtIHRoYXQuem9uZSgpKSAqIDZlNCxcbiAgICAgICAgICAgICAgICBkaWZmLCBvdXRwdXQsIGRheXNBZGp1c3Q7XG5cbiAgICAgICAgICAgIHVuaXRzID0gbm9ybWFsaXplVW5pdHModW5pdHMpO1xuXG4gICAgICAgICAgICBpZiAodW5pdHMgPT09ICd5ZWFyJyB8fCB1bml0cyA9PT0gJ21vbnRoJykge1xuICAgICAgICAgICAgICAgIC8vIGF2ZXJhZ2UgbnVtYmVyIG9mIGRheXMgaW4gdGhlIG1vbnRocyBpbiB0aGUgZ2l2ZW4gZGF0ZXNcbiAgICAgICAgICAgICAgICBkaWZmID0gKHRoaXMuZGF5c0luTW9udGgoKSArIHRoYXQuZGF5c0luTW9udGgoKSkgKiA0MzJlNTsgLy8gMjQgKiA2MCAqIDYwICogMTAwMCAvIDJcbiAgICAgICAgICAgICAgICAvLyBkaWZmZXJlbmNlIGluIG1vbnRoc1xuICAgICAgICAgICAgICAgIG91dHB1dCA9ICgodGhpcy55ZWFyKCkgLSB0aGF0LnllYXIoKSkgKiAxMikgKyAodGhpcy5tb250aCgpIC0gdGhhdC5tb250aCgpKTtcbiAgICAgICAgICAgICAgICAvLyBhZGp1c3QgYnkgdGFraW5nIGRpZmZlcmVuY2UgaW4gZGF5cywgYXZlcmFnZSBudW1iZXIgb2YgZGF5c1xuICAgICAgICAgICAgICAgIC8vIGFuZCBkc3QgaW4gdGhlIGdpdmVuIG1vbnRocy5cbiAgICAgICAgICAgICAgICBkYXlzQWRqdXN0ID0gKHRoaXMgLSBtb21lbnQodGhpcykuc3RhcnRPZignbW9udGgnKSkgLVxuICAgICAgICAgICAgICAgICAgICAodGhhdCAtIG1vbWVudCh0aGF0KS5zdGFydE9mKCdtb250aCcpKTtcbiAgICAgICAgICAgICAgICAvLyBzYW1lIGFzIGFib3ZlIGJ1dCB3aXRoIHpvbmVzLCB0byBuZWdhdGUgYWxsIGRzdFxuICAgICAgICAgICAgICAgIGRheXNBZGp1c3QgLT0gKCh0aGlzLnpvbmUoKSAtIG1vbWVudCh0aGlzKS5zdGFydE9mKCdtb250aCcpLnpvbmUoKSkgLVxuICAgICAgICAgICAgICAgICAgICAgICAgKHRoYXQuem9uZSgpIC0gbW9tZW50KHRoYXQpLnN0YXJ0T2YoJ21vbnRoJykuem9uZSgpKSkgKiA2ZTQ7XG4gICAgICAgICAgICAgICAgb3V0cHV0ICs9IGRheXNBZGp1c3QgLyBkaWZmO1xuICAgICAgICAgICAgICAgIGlmICh1bml0cyA9PT0gJ3llYXInKSB7XG4gICAgICAgICAgICAgICAgICAgIG91dHB1dCA9IG91dHB1dCAvIDEyO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgZGlmZiA9ICh0aGlzIC0gdGhhdCk7XG4gICAgICAgICAgICAgICAgb3V0cHV0ID0gdW5pdHMgPT09ICdzZWNvbmQnID8gZGlmZiAvIDFlMyA6IC8vIDEwMDBcbiAgICAgICAgICAgICAgICAgICAgdW5pdHMgPT09ICdtaW51dGUnID8gZGlmZiAvIDZlNCA6IC8vIDEwMDAgKiA2MFxuICAgICAgICAgICAgICAgICAgICB1bml0cyA9PT0gJ2hvdXInID8gZGlmZiAvIDM2ZTUgOiAvLyAxMDAwICogNjAgKiA2MFxuICAgICAgICAgICAgICAgICAgICB1bml0cyA9PT0gJ2RheScgPyAoZGlmZiAtIHpvbmVEaWZmKSAvIDg2NGU1IDogLy8gMTAwMCAqIDYwICogNjAgKiAyNCwgbmVnYXRlIGRzdFxuICAgICAgICAgICAgICAgICAgICB1bml0cyA9PT0gJ3dlZWsnID8gKGRpZmYgLSB6b25lRGlmZikgLyA2MDQ4ZTUgOiAvLyAxMDAwICogNjAgKiA2MCAqIDI0ICogNywgbmVnYXRlIGRzdFxuICAgICAgICAgICAgICAgICAgICBkaWZmO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIGFzRmxvYXQgPyBvdXRwdXQgOiBhYnNSb3VuZChvdXRwdXQpO1xuICAgICAgICB9LFxuXG4gICAgICAgIGZyb20gOiBmdW5jdGlvbiAodGltZSwgd2l0aG91dFN1ZmZpeCkge1xuICAgICAgICAgICAgcmV0dXJuIG1vbWVudC5kdXJhdGlvbih7dG86IHRoaXMsIGZyb206IHRpbWV9KS5sb2NhbGUodGhpcy5sb2NhbGUoKSkuaHVtYW5pemUoIXdpdGhvdXRTdWZmaXgpO1xuICAgICAgICB9LFxuXG4gICAgICAgIGZyb21Ob3cgOiBmdW5jdGlvbiAod2l0aG91dFN1ZmZpeCkge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMuZnJvbShtb21lbnQoKSwgd2l0aG91dFN1ZmZpeCk7XG4gICAgICAgIH0sXG5cbiAgICAgICAgY2FsZW5kYXIgOiBmdW5jdGlvbiAodGltZSkge1xuICAgICAgICAgICAgLy8gV2Ugd2FudCB0byBjb21wYXJlIHRoZSBzdGFydCBvZiB0b2RheSwgdnMgdGhpcy5cbiAgICAgICAgICAgIC8vIEdldHRpbmcgc3RhcnQtb2YtdG9kYXkgZGVwZW5kcyBvbiB3aGV0aGVyIHdlJ3JlIHpvbmUnZCBvciBub3QuXG4gICAgICAgICAgICB2YXIgbm93ID0gdGltZSB8fCBtb21lbnQoKSxcbiAgICAgICAgICAgICAgICBzb2QgPSBtYWtlQXMobm93LCB0aGlzKS5zdGFydE9mKCdkYXknKSxcbiAgICAgICAgICAgICAgICBkaWZmID0gdGhpcy5kaWZmKHNvZCwgJ2RheXMnLCB0cnVlKSxcbiAgICAgICAgICAgICAgICBmb3JtYXQgPSBkaWZmIDwgLTYgPyAnc2FtZUVsc2UnIDpcbiAgICAgICAgICAgICAgICAgICAgZGlmZiA8IC0xID8gJ2xhc3RXZWVrJyA6XG4gICAgICAgICAgICAgICAgICAgIGRpZmYgPCAwID8gJ2xhc3REYXknIDpcbiAgICAgICAgICAgICAgICAgICAgZGlmZiA8IDEgPyAnc2FtZURheScgOlxuICAgICAgICAgICAgICAgICAgICBkaWZmIDwgMiA/ICduZXh0RGF5JyA6XG4gICAgICAgICAgICAgICAgICAgIGRpZmYgPCA3ID8gJ25leHRXZWVrJyA6ICdzYW1lRWxzZSc7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5mb3JtYXQodGhpcy5sb2NhbGVEYXRhKCkuY2FsZW5kYXIoZm9ybWF0LCB0aGlzKSk7XG4gICAgICAgIH0sXG5cbiAgICAgICAgaXNMZWFwWWVhciA6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHJldHVybiBpc0xlYXBZZWFyKHRoaXMueWVhcigpKTtcbiAgICAgICAgfSxcblxuICAgICAgICBpc0RTVCA6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHJldHVybiAodGhpcy56b25lKCkgPCB0aGlzLmNsb25lKCkubW9udGgoMCkuem9uZSgpIHx8XG4gICAgICAgICAgICAgICAgdGhpcy56b25lKCkgPCB0aGlzLmNsb25lKCkubW9udGgoNSkuem9uZSgpKTtcbiAgICAgICAgfSxcblxuICAgICAgICBkYXkgOiBmdW5jdGlvbiAoaW5wdXQpIHtcbiAgICAgICAgICAgIHZhciBkYXkgPSB0aGlzLl9pc1VUQyA/IHRoaXMuX2QuZ2V0VVRDRGF5KCkgOiB0aGlzLl9kLmdldERheSgpO1xuICAgICAgICAgICAgaWYgKGlucHV0ICE9IG51bGwpIHtcbiAgICAgICAgICAgICAgICBpbnB1dCA9IHBhcnNlV2Vla2RheShpbnB1dCwgdGhpcy5sb2NhbGVEYXRhKCkpO1xuICAgICAgICAgICAgICAgIHJldHVybiB0aGlzLmFkZChpbnB1dCAtIGRheSwgJ2QnKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGRheTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSxcblxuICAgICAgICBtb250aCA6IG1ha2VBY2Nlc3NvcignTW9udGgnLCB0cnVlKSxcblxuICAgICAgICBzdGFydE9mIDogZnVuY3Rpb24gKHVuaXRzKSB7XG4gICAgICAgICAgICB1bml0cyA9IG5vcm1hbGl6ZVVuaXRzKHVuaXRzKTtcbiAgICAgICAgICAgIC8vIHRoZSBmb2xsb3dpbmcgc3dpdGNoIGludGVudGlvbmFsbHkgb21pdHMgYnJlYWsga2V5d29yZHNcbiAgICAgICAgICAgIC8vIHRvIHV0aWxpemUgZmFsbGluZyB0aHJvdWdoIHRoZSBjYXNlcy5cbiAgICAgICAgICAgIHN3aXRjaCAodW5pdHMpIHtcbiAgICAgICAgICAgIGNhc2UgJ3llYXInOlxuICAgICAgICAgICAgICAgIHRoaXMubW9udGgoMCk7XG4gICAgICAgICAgICAgICAgLyogZmFsbHMgdGhyb3VnaCAqL1xuICAgICAgICAgICAgY2FzZSAncXVhcnRlcic6XG4gICAgICAgICAgICBjYXNlICdtb250aCc6XG4gICAgICAgICAgICAgICAgdGhpcy5kYXRlKDEpO1xuICAgICAgICAgICAgICAgIC8qIGZhbGxzIHRocm91Z2ggKi9cbiAgICAgICAgICAgIGNhc2UgJ3dlZWsnOlxuICAgICAgICAgICAgY2FzZSAnaXNvV2Vlayc6XG4gICAgICAgICAgICBjYXNlICdkYXknOlxuICAgICAgICAgICAgICAgIHRoaXMuaG91cnMoMCk7XG4gICAgICAgICAgICAgICAgLyogZmFsbHMgdGhyb3VnaCAqL1xuICAgICAgICAgICAgY2FzZSAnaG91cic6XG4gICAgICAgICAgICAgICAgdGhpcy5taW51dGVzKDApO1xuICAgICAgICAgICAgICAgIC8qIGZhbGxzIHRocm91Z2ggKi9cbiAgICAgICAgICAgIGNhc2UgJ21pbnV0ZSc6XG4gICAgICAgICAgICAgICAgdGhpcy5zZWNvbmRzKDApO1xuICAgICAgICAgICAgICAgIC8qIGZhbGxzIHRocm91Z2ggKi9cbiAgICAgICAgICAgIGNhc2UgJ3NlY29uZCc6XG4gICAgICAgICAgICAgICAgdGhpcy5taWxsaXNlY29uZHMoMCk7XG4gICAgICAgICAgICAgICAgLyogZmFsbHMgdGhyb3VnaCAqL1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAvLyB3ZWVrcyBhcmUgYSBzcGVjaWFsIGNhc2VcbiAgICAgICAgICAgIGlmICh1bml0cyA9PT0gJ3dlZWsnKSB7XG4gICAgICAgICAgICAgICAgdGhpcy53ZWVrZGF5KDApO1xuICAgICAgICAgICAgfSBlbHNlIGlmICh1bml0cyA9PT0gJ2lzb1dlZWsnKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5pc29XZWVrZGF5KDEpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAvLyBxdWFydGVycyBhcmUgYWxzbyBzcGVjaWFsXG4gICAgICAgICAgICBpZiAodW5pdHMgPT09ICdxdWFydGVyJykge1xuICAgICAgICAgICAgICAgIHRoaXMubW9udGgoTWF0aC5mbG9vcih0aGlzLm1vbnRoKCkgLyAzKSAqIDMpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICByZXR1cm4gdGhpcztcbiAgICAgICAgfSxcblxuICAgICAgICBlbmRPZjogZnVuY3Rpb24gKHVuaXRzKSB7XG4gICAgICAgICAgICB1bml0cyA9IG5vcm1hbGl6ZVVuaXRzKHVuaXRzKTtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLnN0YXJ0T2YodW5pdHMpLmFkZCgxLCAodW5pdHMgPT09ICdpc29XZWVrJyA/ICd3ZWVrJyA6IHVuaXRzKSkuc3VidHJhY3QoMSwgJ21zJyk7XG4gICAgICAgIH0sXG5cbiAgICAgICAgaXNBZnRlcjogZnVuY3Rpb24gKGlucHV0LCB1bml0cykge1xuICAgICAgICAgICAgdW5pdHMgPSBub3JtYWxpemVVbml0cyh0eXBlb2YgdW5pdHMgIT09ICd1bmRlZmluZWQnID8gdW5pdHMgOiAnbWlsbGlzZWNvbmQnKTtcbiAgICAgICAgICAgIGlmICh1bml0cyA9PT0gJ21pbGxpc2Vjb25kJykge1xuICAgICAgICAgICAgICAgIGlucHV0ID0gbW9tZW50LmlzTW9tZW50KGlucHV0KSA/IGlucHV0IDogbW9tZW50KGlucHV0KTtcbiAgICAgICAgICAgICAgICByZXR1cm4gK3RoaXMgPiAraW5wdXQ7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIHJldHVybiArdGhpcy5jbG9uZSgpLnN0YXJ0T2YodW5pdHMpID4gK21vbWVudChpbnB1dCkuc3RhcnRPZih1bml0cyk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0sXG5cbiAgICAgICAgaXNCZWZvcmU6IGZ1bmN0aW9uIChpbnB1dCwgdW5pdHMpIHtcbiAgICAgICAgICAgIHVuaXRzID0gbm9ybWFsaXplVW5pdHModHlwZW9mIHVuaXRzICE9PSAndW5kZWZpbmVkJyA/IHVuaXRzIDogJ21pbGxpc2Vjb25kJyk7XG4gICAgICAgICAgICBpZiAodW5pdHMgPT09ICdtaWxsaXNlY29uZCcpIHtcbiAgICAgICAgICAgICAgICBpbnB1dCA9IG1vbWVudC5pc01vbWVudChpbnB1dCkgPyBpbnB1dCA6IG1vbWVudChpbnB1dCk7XG4gICAgICAgICAgICAgICAgcmV0dXJuICt0aGlzIDwgK2lucHV0O1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gK3RoaXMuY2xvbmUoKS5zdGFydE9mKHVuaXRzKSA8ICttb21lbnQoaW5wdXQpLnN0YXJ0T2YodW5pdHMpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9LFxuXG4gICAgICAgIGlzU2FtZTogZnVuY3Rpb24gKGlucHV0LCB1bml0cykge1xuICAgICAgICAgICAgdW5pdHMgPSBub3JtYWxpemVVbml0cyh1bml0cyB8fCAnbWlsbGlzZWNvbmQnKTtcbiAgICAgICAgICAgIGlmICh1bml0cyA9PT0gJ21pbGxpc2Vjb25kJykge1xuICAgICAgICAgICAgICAgIGlucHV0ID0gbW9tZW50LmlzTW9tZW50KGlucHV0KSA/IGlucHV0IDogbW9tZW50KGlucHV0KTtcbiAgICAgICAgICAgICAgICByZXR1cm4gK3RoaXMgPT09ICtpbnB1dDtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuICt0aGlzLmNsb25lKCkuc3RhcnRPZih1bml0cykgPT09ICttYWtlQXMoaW5wdXQsIHRoaXMpLnN0YXJ0T2YodW5pdHMpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9LFxuXG4gICAgICAgIG1pbjogZGVwcmVjYXRlKFxuICAgICAgICAgICAgICAgICAnbW9tZW50KCkubWluIGlzIGRlcHJlY2F0ZWQsIHVzZSBtb21lbnQubWluIGluc3RlYWQuIGh0dHBzOi8vZ2l0aHViLmNvbS9tb21lbnQvbW9tZW50L2lzc3Vlcy8xNTQ4JyxcbiAgICAgICAgICAgICAgICAgZnVuY3Rpb24gKG90aGVyKSB7XG4gICAgICAgICAgICAgICAgICAgICBvdGhlciA9IG1vbWVudC5hcHBseShudWxsLCBhcmd1bWVudHMpO1xuICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIG90aGVyIDwgdGhpcyA/IHRoaXMgOiBvdGhlcjtcbiAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgKSxcblxuICAgICAgICBtYXg6IGRlcHJlY2F0ZShcbiAgICAgICAgICAgICAgICAnbW9tZW50KCkubWF4IGlzIGRlcHJlY2F0ZWQsIHVzZSBtb21lbnQubWF4IGluc3RlYWQuIGh0dHBzOi8vZ2l0aHViLmNvbS9tb21lbnQvbW9tZW50L2lzc3Vlcy8xNTQ4JyxcbiAgICAgICAgICAgICAgICBmdW5jdGlvbiAob3RoZXIpIHtcbiAgICAgICAgICAgICAgICAgICAgb3RoZXIgPSBtb21lbnQuYXBwbHkobnVsbCwgYXJndW1lbnRzKTtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIG90aGVyID4gdGhpcyA/IHRoaXMgOiBvdGhlcjtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICksXG5cbiAgICAgICAgLy8ga2VlcExvY2FsVGltZSA9IHRydWUgbWVhbnMgb25seSBjaGFuZ2UgdGhlIHRpbWV6b25lLCB3aXRob3V0XG4gICAgICAgIC8vIGFmZmVjdGluZyB0aGUgbG9jYWwgaG91ci4gU28gNTozMToyNiArMDMwMCAtLVt6b25lKDIsIHRydWUpXS0tPlxuICAgICAgICAvLyA1OjMxOjI2ICswMjAwIEl0IGlzIHBvc3NpYmxlIHRoYXQgNTozMToyNiBkb2Vzbid0IGV4aXN0IGludCB6b25lXG4gICAgICAgIC8vICswMjAwLCBzbyB3ZSBhZGp1c3QgdGhlIHRpbWUgYXMgbmVlZGVkLCB0byBiZSB2YWxpZC5cbiAgICAgICAgLy9cbiAgICAgICAgLy8gS2VlcGluZyB0aGUgdGltZSBhY3R1YWxseSBhZGRzL3N1YnRyYWN0cyAob25lIGhvdXIpXG4gICAgICAgIC8vIGZyb20gdGhlIGFjdHVhbCByZXByZXNlbnRlZCB0aW1lLiBUaGF0IGlzIHdoeSB3ZSBjYWxsIHVwZGF0ZU9mZnNldFxuICAgICAgICAvLyBhIHNlY29uZCB0aW1lLiBJbiBjYXNlIGl0IHdhbnRzIHVzIHRvIGNoYW5nZSB0aGUgb2Zmc2V0IGFnYWluXG4gICAgICAgIC8vIF9jaGFuZ2VJblByb2dyZXNzID09IHRydWUgY2FzZSwgdGhlbiB3ZSBoYXZlIHRvIGFkanVzdCwgYmVjYXVzZVxuICAgICAgICAvLyB0aGVyZSBpcyBubyBzdWNoIHRpbWUgaW4gdGhlIGdpdmVuIHRpbWV6b25lLlxuICAgICAgICB6b25lIDogZnVuY3Rpb24gKGlucHV0LCBrZWVwTG9jYWxUaW1lKSB7XG4gICAgICAgICAgICB2YXIgb2Zmc2V0ID0gdGhpcy5fb2Zmc2V0IHx8IDAsXG4gICAgICAgICAgICAgICAgbG9jYWxBZGp1c3Q7XG4gICAgICAgICAgICBpZiAoaW5wdXQgIT0gbnVsbCkge1xuICAgICAgICAgICAgICAgIGlmICh0eXBlb2YgaW5wdXQgPT09ICdzdHJpbmcnKSB7XG4gICAgICAgICAgICAgICAgICAgIGlucHV0ID0gdGltZXpvbmVNaW51dGVzRnJvbVN0cmluZyhpbnB1dCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGlmIChNYXRoLmFicyhpbnB1dCkgPCAxNikge1xuICAgICAgICAgICAgICAgICAgICBpbnB1dCA9IGlucHV0ICogNjA7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGlmICghdGhpcy5faXNVVEMgJiYga2VlcExvY2FsVGltZSkge1xuICAgICAgICAgICAgICAgICAgICBsb2NhbEFkanVzdCA9IHRoaXMuX2RhdGVUek9mZnNldCgpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB0aGlzLl9vZmZzZXQgPSBpbnB1dDtcbiAgICAgICAgICAgICAgICB0aGlzLl9pc1VUQyA9IHRydWU7XG4gICAgICAgICAgICAgICAgaWYgKGxvY2FsQWRqdXN0ICE9IG51bGwpIHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5zdWJ0cmFjdChsb2NhbEFkanVzdCwgJ20nKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgaWYgKG9mZnNldCAhPT0gaW5wdXQpIHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKCFrZWVwTG9jYWxUaW1lIHx8IHRoaXMuX2NoYW5nZUluUHJvZ3Jlc3MpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGFkZE9yU3VidHJhY3REdXJhdGlvbkZyb21Nb21lbnQodGhpcyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbW9tZW50LmR1cmF0aW9uKG9mZnNldCAtIGlucHV0LCAnbScpLCAxLCBmYWxzZSk7XG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAoIXRoaXMuX2NoYW5nZUluUHJvZ3Jlc3MpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuX2NoYW5nZUluUHJvZ3Jlc3MgPSB0cnVlO1xuICAgICAgICAgICAgICAgICAgICAgICAgbW9tZW50LnVwZGF0ZU9mZnNldCh0aGlzLCB0cnVlKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuX2NoYW5nZUluUHJvZ3Jlc3MgPSBudWxsO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gdGhpcy5faXNVVEMgPyBvZmZzZXQgOiB0aGlzLl9kYXRlVHpPZmZzZXQoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiB0aGlzO1xuICAgICAgICB9LFxuXG4gICAgICAgIHpvbmVBYmJyIDogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMuX2lzVVRDID8gJ1VUQycgOiAnJztcbiAgICAgICAgfSxcblxuICAgICAgICB6b25lTmFtZSA6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLl9pc1VUQyA/ICdDb29yZGluYXRlZCBVbml2ZXJzYWwgVGltZScgOiAnJztcbiAgICAgICAgfSxcblxuICAgICAgICBwYXJzZVpvbmUgOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICBpZiAodGhpcy5fdHptKSB7XG4gICAgICAgICAgICAgICAgdGhpcy56b25lKHRoaXMuX3R6bSk7XG4gICAgICAgICAgICB9IGVsc2UgaWYgKHR5cGVvZiB0aGlzLl9pID09PSAnc3RyaW5nJykge1xuICAgICAgICAgICAgICAgIHRoaXMuem9uZSh0aGlzLl9pKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiB0aGlzO1xuICAgICAgICB9LFxuXG4gICAgICAgIGhhc0FsaWduZWRIb3VyT2Zmc2V0IDogZnVuY3Rpb24gKGlucHV0KSB7XG4gICAgICAgICAgICBpZiAoIWlucHV0KSB7XG4gICAgICAgICAgICAgICAgaW5wdXQgPSAwO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgaW5wdXQgPSBtb21lbnQoaW5wdXQpLnpvbmUoKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgcmV0dXJuICh0aGlzLnpvbmUoKSAtIGlucHV0KSAlIDYwID09PSAwO1xuICAgICAgICB9LFxuXG4gICAgICAgIGRheXNJbk1vbnRoIDogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgcmV0dXJuIGRheXNJbk1vbnRoKHRoaXMueWVhcigpLCB0aGlzLm1vbnRoKCkpO1xuICAgICAgICB9LFxuXG4gICAgICAgIGRheU9mWWVhciA6IGZ1bmN0aW9uIChpbnB1dCkge1xuICAgICAgICAgICAgdmFyIGRheU9mWWVhciA9IHJvdW5kKChtb21lbnQodGhpcykuc3RhcnRPZignZGF5JykgLSBtb21lbnQodGhpcykuc3RhcnRPZigneWVhcicpKSAvIDg2NGU1KSArIDE7XG4gICAgICAgICAgICByZXR1cm4gaW5wdXQgPT0gbnVsbCA/IGRheU9mWWVhciA6IHRoaXMuYWRkKChpbnB1dCAtIGRheU9mWWVhciksICdkJyk7XG4gICAgICAgIH0sXG5cbiAgICAgICAgcXVhcnRlciA6IGZ1bmN0aW9uIChpbnB1dCkge1xuICAgICAgICAgICAgcmV0dXJuIGlucHV0ID09IG51bGwgPyBNYXRoLmNlaWwoKHRoaXMubW9udGgoKSArIDEpIC8gMykgOiB0aGlzLm1vbnRoKChpbnB1dCAtIDEpICogMyArIHRoaXMubW9udGgoKSAlIDMpO1xuICAgICAgICB9LFxuXG4gICAgICAgIHdlZWtZZWFyIDogZnVuY3Rpb24gKGlucHV0KSB7XG4gICAgICAgICAgICB2YXIgeWVhciA9IHdlZWtPZlllYXIodGhpcywgdGhpcy5sb2NhbGVEYXRhKCkuX3dlZWsuZG93LCB0aGlzLmxvY2FsZURhdGEoKS5fd2Vlay5kb3kpLnllYXI7XG4gICAgICAgICAgICByZXR1cm4gaW5wdXQgPT0gbnVsbCA/IHllYXIgOiB0aGlzLmFkZCgoaW5wdXQgLSB5ZWFyKSwgJ3knKTtcbiAgICAgICAgfSxcblxuICAgICAgICBpc29XZWVrWWVhciA6IGZ1bmN0aW9uIChpbnB1dCkge1xuICAgICAgICAgICAgdmFyIHllYXIgPSB3ZWVrT2ZZZWFyKHRoaXMsIDEsIDQpLnllYXI7XG4gICAgICAgICAgICByZXR1cm4gaW5wdXQgPT0gbnVsbCA/IHllYXIgOiB0aGlzLmFkZCgoaW5wdXQgLSB5ZWFyKSwgJ3knKTtcbiAgICAgICAgfSxcblxuICAgICAgICB3ZWVrIDogZnVuY3Rpb24gKGlucHV0KSB7XG4gICAgICAgICAgICB2YXIgd2VlayA9IHRoaXMubG9jYWxlRGF0YSgpLndlZWsodGhpcyk7XG4gICAgICAgICAgICByZXR1cm4gaW5wdXQgPT0gbnVsbCA/IHdlZWsgOiB0aGlzLmFkZCgoaW5wdXQgLSB3ZWVrKSAqIDcsICdkJyk7XG4gICAgICAgIH0sXG5cbiAgICAgICAgaXNvV2VlayA6IGZ1bmN0aW9uIChpbnB1dCkge1xuICAgICAgICAgICAgdmFyIHdlZWsgPSB3ZWVrT2ZZZWFyKHRoaXMsIDEsIDQpLndlZWs7XG4gICAgICAgICAgICByZXR1cm4gaW5wdXQgPT0gbnVsbCA/IHdlZWsgOiB0aGlzLmFkZCgoaW5wdXQgLSB3ZWVrKSAqIDcsICdkJyk7XG4gICAgICAgIH0sXG5cbiAgICAgICAgd2Vla2RheSA6IGZ1bmN0aW9uIChpbnB1dCkge1xuICAgICAgICAgICAgdmFyIHdlZWtkYXkgPSAodGhpcy5kYXkoKSArIDcgLSB0aGlzLmxvY2FsZURhdGEoKS5fd2Vlay5kb3cpICUgNztcbiAgICAgICAgICAgIHJldHVybiBpbnB1dCA9PSBudWxsID8gd2Vla2RheSA6IHRoaXMuYWRkKGlucHV0IC0gd2Vla2RheSwgJ2QnKTtcbiAgICAgICAgfSxcblxuICAgICAgICBpc29XZWVrZGF5IDogZnVuY3Rpb24gKGlucHV0KSB7XG4gICAgICAgICAgICAvLyBiZWhhdmVzIHRoZSBzYW1lIGFzIG1vbWVudCNkYXkgZXhjZXB0XG4gICAgICAgICAgICAvLyBhcyBhIGdldHRlciwgcmV0dXJucyA3IGluc3RlYWQgb2YgMCAoMS03IHJhbmdlIGluc3RlYWQgb2YgMC02KVxuICAgICAgICAgICAgLy8gYXMgYSBzZXR0ZXIsIHN1bmRheSBzaG91bGQgYmVsb25nIHRvIHRoZSBwcmV2aW91cyB3ZWVrLlxuICAgICAgICAgICAgcmV0dXJuIGlucHV0ID09IG51bGwgPyB0aGlzLmRheSgpIHx8IDcgOiB0aGlzLmRheSh0aGlzLmRheSgpICUgNyA/IGlucHV0IDogaW5wdXQgLSA3KTtcbiAgICAgICAgfSxcblxuICAgICAgICBpc29XZWVrc0luWWVhciA6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHJldHVybiB3ZWVrc0luWWVhcih0aGlzLnllYXIoKSwgMSwgNCk7XG4gICAgICAgIH0sXG5cbiAgICAgICAgd2Vla3NJblllYXIgOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICB2YXIgd2Vla0luZm8gPSB0aGlzLmxvY2FsZURhdGEoKS5fd2VlaztcbiAgICAgICAgICAgIHJldHVybiB3ZWVrc0luWWVhcih0aGlzLnllYXIoKSwgd2Vla0luZm8uZG93LCB3ZWVrSW5mby5kb3kpO1xuICAgICAgICB9LFxuXG4gICAgICAgIGdldCA6IGZ1bmN0aW9uICh1bml0cykge1xuICAgICAgICAgICAgdW5pdHMgPSBub3JtYWxpemVVbml0cyh1bml0cyk7XG4gICAgICAgICAgICByZXR1cm4gdGhpc1t1bml0c10oKTtcbiAgICAgICAgfSxcblxuICAgICAgICBzZXQgOiBmdW5jdGlvbiAodW5pdHMsIHZhbHVlKSB7XG4gICAgICAgICAgICB1bml0cyA9IG5vcm1hbGl6ZVVuaXRzKHVuaXRzKTtcbiAgICAgICAgICAgIGlmICh0eXBlb2YgdGhpc1t1bml0c10gPT09ICdmdW5jdGlvbicpIHtcbiAgICAgICAgICAgICAgICB0aGlzW3VuaXRzXSh2YWx1ZSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gdGhpcztcbiAgICAgICAgfSxcblxuICAgICAgICAvLyBJZiBwYXNzZWQgYSBsb2NhbGUga2V5LCBpdCB3aWxsIHNldCB0aGUgbG9jYWxlIGZvciB0aGlzXG4gICAgICAgIC8vIGluc3RhbmNlLiAgT3RoZXJ3aXNlLCBpdCB3aWxsIHJldHVybiB0aGUgbG9jYWxlIGNvbmZpZ3VyYXRpb25cbiAgICAgICAgLy8gdmFyaWFibGVzIGZvciB0aGlzIGluc3RhbmNlLlxuICAgICAgICBsb2NhbGUgOiBmdW5jdGlvbiAoa2V5KSB7XG4gICAgICAgICAgICB2YXIgbmV3TG9jYWxlRGF0YTtcblxuICAgICAgICAgICAgaWYgKGtleSA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHRoaXMuX2xvY2FsZS5fYWJicjtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgbmV3TG9jYWxlRGF0YSA9IG1vbWVudC5sb2NhbGVEYXRhKGtleSk7XG4gICAgICAgICAgICAgICAgaWYgKG5ld0xvY2FsZURhdGEgIT0gbnVsbCkge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLl9sb2NhbGUgPSBuZXdMb2NhbGVEYXRhO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICByZXR1cm4gdGhpcztcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSxcblxuICAgICAgICBsYW5nIDogZGVwcmVjYXRlKFxuICAgICAgICAgICAgJ21vbWVudCgpLmxhbmcoKSBpcyBkZXByZWNhdGVkLiBVc2UgbW9tZW50KCkubG9jYWxlRGF0YSgpIGluc3RlYWQuJyxcbiAgICAgICAgICAgIGZ1bmN0aW9uIChrZXkpIHtcbiAgICAgICAgICAgICAgICBpZiAoa2V5ID09PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHRoaXMubG9jYWxlRGF0YSgpO1xuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiB0aGlzLmxvY2FsZShrZXkpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgKSxcblxuICAgICAgICBsb2NhbGVEYXRhIDogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMuX2xvY2FsZTtcbiAgICAgICAgfSxcblxuICAgICAgICBfZGF0ZVR6T2Zmc2V0IDogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgLy8gT24gRmlyZWZveC4yNCBEYXRlI2dldFRpbWV6b25lT2Zmc2V0IHJldHVybnMgYSBmbG9hdGluZyBwb2ludC5cbiAgICAgICAgICAgIC8vIGh0dHBzOi8vZ2l0aHViLmNvbS9tb21lbnQvbW9tZW50L3B1bGwvMTg3MVxuICAgICAgICAgICAgcmV0dXJuIE1hdGgucm91bmQodGhpcy5fZC5nZXRUaW1lem9uZU9mZnNldCgpIC8gMTUpICogMTU7XG4gICAgICAgIH1cbiAgICB9KTtcblxuICAgIGZ1bmN0aW9uIHJhd01vbnRoU2V0dGVyKG1vbSwgdmFsdWUpIHtcbiAgICAgICAgdmFyIGRheU9mTW9udGg7XG5cbiAgICAgICAgLy8gVE9ETzogTW92ZSB0aGlzIG91dCBvZiBoZXJlIVxuICAgICAgICBpZiAodHlwZW9mIHZhbHVlID09PSAnc3RyaW5nJykge1xuICAgICAgICAgICAgdmFsdWUgPSBtb20ubG9jYWxlRGF0YSgpLm1vbnRoc1BhcnNlKHZhbHVlKTtcbiAgICAgICAgICAgIC8vIFRPRE86IEFub3RoZXIgc2lsZW50IGZhaWx1cmU/XG4gICAgICAgICAgICBpZiAodHlwZW9mIHZhbHVlICE9PSAnbnVtYmVyJykge1xuICAgICAgICAgICAgICAgIHJldHVybiBtb207XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICBkYXlPZk1vbnRoID0gTWF0aC5taW4obW9tLmRhdGUoKSxcbiAgICAgICAgICAgICAgICBkYXlzSW5Nb250aChtb20ueWVhcigpLCB2YWx1ZSkpO1xuICAgICAgICBtb20uX2RbJ3NldCcgKyAobW9tLl9pc1VUQyA/ICdVVEMnIDogJycpICsgJ01vbnRoJ10odmFsdWUsIGRheU9mTW9udGgpO1xuICAgICAgICByZXR1cm4gbW9tO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIHJhd0dldHRlcihtb20sIHVuaXQpIHtcbiAgICAgICAgcmV0dXJuIG1vbS5fZFsnZ2V0JyArIChtb20uX2lzVVRDID8gJ1VUQycgOiAnJykgKyB1bml0XSgpO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIHJhd1NldHRlcihtb20sIHVuaXQsIHZhbHVlKSB7XG4gICAgICAgIGlmICh1bml0ID09PSAnTW9udGgnKSB7XG4gICAgICAgICAgICByZXR1cm4gcmF3TW9udGhTZXR0ZXIobW9tLCB2YWx1ZSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICByZXR1cm4gbW9tLl9kWydzZXQnICsgKG1vbS5faXNVVEMgPyAnVVRDJyA6ICcnKSArIHVuaXRdKHZhbHVlKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIGZ1bmN0aW9uIG1ha2VBY2Nlc3Nvcih1bml0LCBrZWVwVGltZSkge1xuICAgICAgICByZXR1cm4gZnVuY3Rpb24gKHZhbHVlKSB7XG4gICAgICAgICAgICBpZiAodmFsdWUgIT0gbnVsbCkge1xuICAgICAgICAgICAgICAgIHJhd1NldHRlcih0aGlzLCB1bml0LCB2YWx1ZSk7XG4gICAgICAgICAgICAgICAgbW9tZW50LnVwZGF0ZU9mZnNldCh0aGlzLCBrZWVwVGltZSk7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIHJldHVybiByYXdHZXR0ZXIodGhpcywgdW5pdCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH07XG4gICAgfVxuXG4gICAgbW9tZW50LmZuLm1pbGxpc2Vjb25kID0gbW9tZW50LmZuLm1pbGxpc2Vjb25kcyA9IG1ha2VBY2Nlc3NvcignTWlsbGlzZWNvbmRzJywgZmFsc2UpO1xuICAgIG1vbWVudC5mbi5zZWNvbmQgPSBtb21lbnQuZm4uc2Vjb25kcyA9IG1ha2VBY2Nlc3NvcignU2Vjb25kcycsIGZhbHNlKTtcbiAgICBtb21lbnQuZm4ubWludXRlID0gbW9tZW50LmZuLm1pbnV0ZXMgPSBtYWtlQWNjZXNzb3IoJ01pbnV0ZXMnLCBmYWxzZSk7XG4gICAgLy8gU2V0dGluZyB0aGUgaG91ciBzaG91bGQga2VlcCB0aGUgdGltZSwgYmVjYXVzZSB0aGUgdXNlciBleHBsaWNpdGx5XG4gICAgLy8gc3BlY2lmaWVkIHdoaWNoIGhvdXIgaGUgd2FudHMuIFNvIHRyeWluZyB0byBtYWludGFpbiB0aGUgc2FtZSBob3VyIChpblxuICAgIC8vIGEgbmV3IHRpbWV6b25lKSBtYWtlcyBzZW5zZS4gQWRkaW5nL3N1YnRyYWN0aW5nIGhvdXJzIGRvZXMgbm90IGZvbGxvd1xuICAgIC8vIHRoaXMgcnVsZS5cbiAgICBtb21lbnQuZm4uaG91ciA9IG1vbWVudC5mbi5ob3VycyA9IG1ha2VBY2Nlc3NvcignSG91cnMnLCB0cnVlKTtcbiAgICAvLyBtb21lbnQuZm4ubW9udGggaXMgZGVmaW5lZCBzZXBhcmF0ZWx5XG4gICAgbW9tZW50LmZuLmRhdGUgPSBtYWtlQWNjZXNzb3IoJ0RhdGUnLCB0cnVlKTtcbiAgICBtb21lbnQuZm4uZGF0ZXMgPSBkZXByZWNhdGUoJ2RhdGVzIGFjY2Vzc29yIGlzIGRlcHJlY2F0ZWQuIFVzZSBkYXRlIGluc3RlYWQuJywgbWFrZUFjY2Vzc29yKCdEYXRlJywgdHJ1ZSkpO1xuICAgIG1vbWVudC5mbi55ZWFyID0gbWFrZUFjY2Vzc29yKCdGdWxsWWVhcicsIHRydWUpO1xuICAgIG1vbWVudC5mbi55ZWFycyA9IGRlcHJlY2F0ZSgneWVhcnMgYWNjZXNzb3IgaXMgZGVwcmVjYXRlZC4gVXNlIHllYXIgaW5zdGVhZC4nLCBtYWtlQWNjZXNzb3IoJ0Z1bGxZZWFyJywgdHJ1ZSkpO1xuXG4gICAgLy8gYWRkIHBsdXJhbCBtZXRob2RzXG4gICAgbW9tZW50LmZuLmRheXMgPSBtb21lbnQuZm4uZGF5O1xuICAgIG1vbWVudC5mbi5tb250aHMgPSBtb21lbnQuZm4ubW9udGg7XG4gICAgbW9tZW50LmZuLndlZWtzID0gbW9tZW50LmZuLndlZWs7XG4gICAgbW9tZW50LmZuLmlzb1dlZWtzID0gbW9tZW50LmZuLmlzb1dlZWs7XG4gICAgbW9tZW50LmZuLnF1YXJ0ZXJzID0gbW9tZW50LmZuLnF1YXJ0ZXI7XG5cbiAgICAvLyBhZGQgYWxpYXNlZCBmb3JtYXQgbWV0aG9kc1xuICAgIG1vbWVudC5mbi50b0pTT04gPSBtb21lbnQuZm4udG9JU09TdHJpbmc7XG5cbiAgICAvKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqXG4gICAgICAgIER1cmF0aW9uIFByb3RvdHlwZVxuICAgICoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKi9cblxuXG4gICAgZnVuY3Rpb24gZGF5c1RvWWVhcnMgKGRheXMpIHtcbiAgICAgICAgLy8gNDAwIHllYXJzIGhhdmUgMTQ2MDk3IGRheXMgKHRha2luZyBpbnRvIGFjY291bnQgbGVhcCB5ZWFyIHJ1bGVzKVxuICAgICAgICByZXR1cm4gZGF5cyAqIDQwMCAvIDE0NjA5NztcbiAgICB9XG5cbiAgICBmdW5jdGlvbiB5ZWFyc1RvRGF5cyAoeWVhcnMpIHtcbiAgICAgICAgLy8geWVhcnMgKiAzNjUgKyBhYnNSb3VuZCh5ZWFycyAvIDQpIC1cbiAgICAgICAgLy8gICAgIGFic1JvdW5kKHllYXJzIC8gMTAwKSArIGFic1JvdW5kKHllYXJzIC8gNDAwKTtcbiAgICAgICAgcmV0dXJuIHllYXJzICogMTQ2MDk3IC8gNDAwO1xuICAgIH1cblxuICAgIGV4dGVuZChtb21lbnQuZHVyYXRpb24uZm4gPSBEdXJhdGlvbi5wcm90b3R5cGUsIHtcblxuICAgICAgICBfYnViYmxlIDogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgdmFyIG1pbGxpc2Vjb25kcyA9IHRoaXMuX21pbGxpc2Vjb25kcyxcbiAgICAgICAgICAgICAgICBkYXlzID0gdGhpcy5fZGF5cyxcbiAgICAgICAgICAgICAgICBtb250aHMgPSB0aGlzLl9tb250aHMsXG4gICAgICAgICAgICAgICAgZGF0YSA9IHRoaXMuX2RhdGEsXG4gICAgICAgICAgICAgICAgc2Vjb25kcywgbWludXRlcywgaG91cnMsIHllYXJzID0gMDtcblxuICAgICAgICAgICAgLy8gVGhlIGZvbGxvd2luZyBjb2RlIGJ1YmJsZXMgdXAgdmFsdWVzLCBzZWUgdGhlIHRlc3RzIGZvclxuICAgICAgICAgICAgLy8gZXhhbXBsZXMgb2Ygd2hhdCB0aGF0IG1lYW5zLlxuICAgICAgICAgICAgZGF0YS5taWxsaXNlY29uZHMgPSBtaWxsaXNlY29uZHMgJSAxMDAwO1xuXG4gICAgICAgICAgICBzZWNvbmRzID0gYWJzUm91bmQobWlsbGlzZWNvbmRzIC8gMTAwMCk7XG4gICAgICAgICAgICBkYXRhLnNlY29uZHMgPSBzZWNvbmRzICUgNjA7XG5cbiAgICAgICAgICAgIG1pbnV0ZXMgPSBhYnNSb3VuZChzZWNvbmRzIC8gNjApO1xuICAgICAgICAgICAgZGF0YS5taW51dGVzID0gbWludXRlcyAlIDYwO1xuXG4gICAgICAgICAgICBob3VycyA9IGFic1JvdW5kKG1pbnV0ZXMgLyA2MCk7XG4gICAgICAgICAgICBkYXRhLmhvdXJzID0gaG91cnMgJSAyNDtcblxuICAgICAgICAgICAgZGF5cyArPSBhYnNSb3VuZChob3VycyAvIDI0KTtcblxuICAgICAgICAgICAgLy8gQWNjdXJhdGVseSBjb252ZXJ0IGRheXMgdG8geWVhcnMsIGFzc3VtZSBzdGFydCBmcm9tIHllYXIgMC5cbiAgICAgICAgICAgIHllYXJzID0gYWJzUm91bmQoZGF5c1RvWWVhcnMoZGF5cykpO1xuICAgICAgICAgICAgZGF5cyAtPSBhYnNSb3VuZCh5ZWFyc1RvRGF5cyh5ZWFycykpO1xuXG4gICAgICAgICAgICAvLyAzMCBkYXlzIHRvIGEgbW9udGhcbiAgICAgICAgICAgIC8vIFRPRE8gKGlza3Jlbik6IFVzZSBhbmNob3IgZGF0ZSAobGlrZSAxc3QgSmFuKSB0byBjb21wdXRlIHRoaXMuXG4gICAgICAgICAgICBtb250aHMgKz0gYWJzUm91bmQoZGF5cyAvIDMwKTtcbiAgICAgICAgICAgIGRheXMgJT0gMzA7XG5cbiAgICAgICAgICAgIC8vIDEyIG1vbnRocyAtPiAxIHllYXJcbiAgICAgICAgICAgIHllYXJzICs9IGFic1JvdW5kKG1vbnRocyAvIDEyKTtcbiAgICAgICAgICAgIG1vbnRocyAlPSAxMjtcblxuICAgICAgICAgICAgZGF0YS5kYXlzID0gZGF5cztcbiAgICAgICAgICAgIGRhdGEubW9udGhzID0gbW9udGhzO1xuICAgICAgICAgICAgZGF0YS55ZWFycyA9IHllYXJzO1xuICAgICAgICB9LFxuXG4gICAgICAgIGFicyA6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHRoaXMuX21pbGxpc2Vjb25kcyA9IE1hdGguYWJzKHRoaXMuX21pbGxpc2Vjb25kcyk7XG4gICAgICAgICAgICB0aGlzLl9kYXlzID0gTWF0aC5hYnModGhpcy5fZGF5cyk7XG4gICAgICAgICAgICB0aGlzLl9tb250aHMgPSBNYXRoLmFicyh0aGlzLl9tb250aHMpO1xuXG4gICAgICAgICAgICB0aGlzLl9kYXRhLm1pbGxpc2Vjb25kcyA9IE1hdGguYWJzKHRoaXMuX2RhdGEubWlsbGlzZWNvbmRzKTtcbiAgICAgICAgICAgIHRoaXMuX2RhdGEuc2Vjb25kcyA9IE1hdGguYWJzKHRoaXMuX2RhdGEuc2Vjb25kcyk7XG4gICAgICAgICAgICB0aGlzLl9kYXRhLm1pbnV0ZXMgPSBNYXRoLmFicyh0aGlzLl9kYXRhLm1pbnV0ZXMpO1xuICAgICAgICAgICAgdGhpcy5fZGF0YS5ob3VycyA9IE1hdGguYWJzKHRoaXMuX2RhdGEuaG91cnMpO1xuICAgICAgICAgICAgdGhpcy5fZGF0YS5tb250aHMgPSBNYXRoLmFicyh0aGlzLl9kYXRhLm1vbnRocyk7XG4gICAgICAgICAgICB0aGlzLl9kYXRhLnllYXJzID0gTWF0aC5hYnModGhpcy5fZGF0YS55ZWFycyk7XG5cbiAgICAgICAgICAgIHJldHVybiB0aGlzO1xuICAgICAgICB9LFxuXG4gICAgICAgIHdlZWtzIDogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgcmV0dXJuIGFic1JvdW5kKHRoaXMuZGF5cygpIC8gNyk7XG4gICAgICAgIH0sXG5cbiAgICAgICAgdmFsdWVPZiA6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLl9taWxsaXNlY29uZHMgK1xuICAgICAgICAgICAgICB0aGlzLl9kYXlzICogODY0ZTUgK1xuICAgICAgICAgICAgICAodGhpcy5fbW9udGhzICUgMTIpICogMjU5MmU2ICtcbiAgICAgICAgICAgICAgdG9JbnQodGhpcy5fbW9udGhzIC8gMTIpICogMzE1MzZlNjtcbiAgICAgICAgfSxcblxuICAgICAgICBodW1hbml6ZSA6IGZ1bmN0aW9uICh3aXRoU3VmZml4KSB7XG4gICAgICAgICAgICB2YXIgb3V0cHV0ID0gcmVsYXRpdmVUaW1lKHRoaXMsICF3aXRoU3VmZml4LCB0aGlzLmxvY2FsZURhdGEoKSk7XG5cbiAgICAgICAgICAgIGlmICh3aXRoU3VmZml4KSB7XG4gICAgICAgICAgICAgICAgb3V0cHV0ID0gdGhpcy5sb2NhbGVEYXRhKCkucGFzdEZ1dHVyZSgrdGhpcywgb3V0cHV0KTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgcmV0dXJuIHRoaXMubG9jYWxlRGF0YSgpLnBvc3Rmb3JtYXQob3V0cHV0KTtcbiAgICAgICAgfSxcblxuICAgICAgICBhZGQgOiBmdW5jdGlvbiAoaW5wdXQsIHZhbCkge1xuICAgICAgICAgICAgLy8gc3VwcG9ydHMgb25seSAyLjAtc3R5bGUgYWRkKDEsICdzJykgb3IgYWRkKG1vbWVudClcbiAgICAgICAgICAgIHZhciBkdXIgPSBtb21lbnQuZHVyYXRpb24oaW5wdXQsIHZhbCk7XG5cbiAgICAgICAgICAgIHRoaXMuX21pbGxpc2Vjb25kcyArPSBkdXIuX21pbGxpc2Vjb25kcztcbiAgICAgICAgICAgIHRoaXMuX2RheXMgKz0gZHVyLl9kYXlzO1xuICAgICAgICAgICAgdGhpcy5fbW9udGhzICs9IGR1ci5fbW9udGhzO1xuXG4gICAgICAgICAgICB0aGlzLl9idWJibGUoKTtcblxuICAgICAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgICAgIH0sXG5cbiAgICAgICAgc3VidHJhY3QgOiBmdW5jdGlvbiAoaW5wdXQsIHZhbCkge1xuICAgICAgICAgICAgdmFyIGR1ciA9IG1vbWVudC5kdXJhdGlvbihpbnB1dCwgdmFsKTtcblxuICAgICAgICAgICAgdGhpcy5fbWlsbGlzZWNvbmRzIC09IGR1ci5fbWlsbGlzZWNvbmRzO1xuICAgICAgICAgICAgdGhpcy5fZGF5cyAtPSBkdXIuX2RheXM7XG4gICAgICAgICAgICB0aGlzLl9tb250aHMgLT0gZHVyLl9tb250aHM7XG5cbiAgICAgICAgICAgIHRoaXMuX2J1YmJsZSgpO1xuXG4gICAgICAgICAgICByZXR1cm4gdGhpcztcbiAgICAgICAgfSxcblxuICAgICAgICBnZXQgOiBmdW5jdGlvbiAodW5pdHMpIHtcbiAgICAgICAgICAgIHVuaXRzID0gbm9ybWFsaXplVW5pdHModW5pdHMpO1xuICAgICAgICAgICAgcmV0dXJuIHRoaXNbdW5pdHMudG9Mb3dlckNhc2UoKSArICdzJ10oKTtcbiAgICAgICAgfSxcblxuICAgICAgICBhcyA6IGZ1bmN0aW9uICh1bml0cykge1xuICAgICAgICAgICAgdmFyIGRheXMsIG1vbnRocztcbiAgICAgICAgICAgIHVuaXRzID0gbm9ybWFsaXplVW5pdHModW5pdHMpO1xuXG4gICAgICAgICAgICBpZiAodW5pdHMgPT09ICdtb250aCcgfHwgdW5pdHMgPT09ICd5ZWFyJykge1xuICAgICAgICAgICAgICAgIGRheXMgPSB0aGlzLl9kYXlzICsgdGhpcy5fbWlsbGlzZWNvbmRzIC8gODY0ZTU7XG4gICAgICAgICAgICAgICAgbW9udGhzID0gdGhpcy5fbW9udGhzICsgZGF5c1RvWWVhcnMoZGF5cykgKiAxMjtcbiAgICAgICAgICAgICAgICByZXR1cm4gdW5pdHMgPT09ICdtb250aCcgPyBtb250aHMgOiBtb250aHMgLyAxMjtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgLy8gaGFuZGxlIG1pbGxpc2Vjb25kcyBzZXBhcmF0ZWx5IGJlY2F1c2Ugb2YgZmxvYXRpbmcgcG9pbnQgbWF0aCBlcnJvcnMgKGlzc3VlICMxODY3KVxuICAgICAgICAgICAgICAgIGRheXMgPSB0aGlzLl9kYXlzICsgeWVhcnNUb0RheXModGhpcy5fbW9udGhzIC8gMTIpO1xuICAgICAgICAgICAgICAgIHN3aXRjaCAodW5pdHMpIHtcbiAgICAgICAgICAgICAgICAgICAgY2FzZSAnd2Vlayc6IHJldHVybiBkYXlzIC8gNyArIHRoaXMuX21pbGxpc2Vjb25kcyAvIDYwNDhlNTtcbiAgICAgICAgICAgICAgICAgICAgY2FzZSAnZGF5JzogcmV0dXJuIGRheXMgKyB0aGlzLl9taWxsaXNlY29uZHMgLyA4NjRlNTtcbiAgICAgICAgICAgICAgICAgICAgY2FzZSAnaG91cic6IHJldHVybiBkYXlzICogMjQgKyB0aGlzLl9taWxsaXNlY29uZHMgLyAzNmU1O1xuICAgICAgICAgICAgICAgICAgICBjYXNlICdtaW51dGUnOiByZXR1cm4gZGF5cyAqIDI0ICogNjAgKyB0aGlzLl9taWxsaXNlY29uZHMgLyA2ZTQ7XG4gICAgICAgICAgICAgICAgICAgIGNhc2UgJ3NlY29uZCc6IHJldHVybiBkYXlzICogMjQgKiA2MCAqIDYwICsgdGhpcy5fbWlsbGlzZWNvbmRzIC8gMTAwMDtcbiAgICAgICAgICAgICAgICAgICAgLy8gTWF0aC5mbG9vciBwcmV2ZW50cyBmbG9hdGluZyBwb2ludCBtYXRoIGVycm9ycyBoZXJlXG4gICAgICAgICAgICAgICAgICAgIGNhc2UgJ21pbGxpc2Vjb25kJzogcmV0dXJuIE1hdGguZmxvb3IoZGF5cyAqIDI0ICogNjAgKiA2MCAqIDEwMDApICsgdGhpcy5fbWlsbGlzZWNvbmRzO1xuICAgICAgICAgICAgICAgICAgICBkZWZhdWx0OiB0aHJvdyBuZXcgRXJyb3IoJ1Vua25vd24gdW5pdCAnICsgdW5pdHMpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfSxcblxuICAgICAgICBsYW5nIDogbW9tZW50LmZuLmxhbmcsXG4gICAgICAgIGxvY2FsZSA6IG1vbWVudC5mbi5sb2NhbGUsXG5cbiAgICAgICAgdG9Jc29TdHJpbmcgOiBkZXByZWNhdGUoXG4gICAgICAgICAgICAndG9Jc29TdHJpbmcoKSBpcyBkZXByZWNhdGVkLiBQbGVhc2UgdXNlIHRvSVNPU3RyaW5nKCkgaW5zdGVhZCAnICtcbiAgICAgICAgICAgICcobm90aWNlIHRoZSBjYXBpdGFscyknLFxuICAgICAgICAgICAgZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgIHJldHVybiB0aGlzLnRvSVNPU3RyaW5nKCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICksXG5cbiAgICAgICAgdG9JU09TdHJpbmcgOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAvLyBpbnNwaXJlZCBieSBodHRwczovL2dpdGh1Yi5jb20vZG9yZGlsbGUvbW9tZW50LWlzb2R1cmF0aW9uL2Jsb2IvbWFzdGVyL21vbWVudC5pc29kdXJhdGlvbi5qc1xuICAgICAgICAgICAgdmFyIHllYXJzID0gTWF0aC5hYnModGhpcy55ZWFycygpKSxcbiAgICAgICAgICAgICAgICBtb250aHMgPSBNYXRoLmFicyh0aGlzLm1vbnRocygpKSxcbiAgICAgICAgICAgICAgICBkYXlzID0gTWF0aC5hYnModGhpcy5kYXlzKCkpLFxuICAgICAgICAgICAgICAgIGhvdXJzID0gTWF0aC5hYnModGhpcy5ob3VycygpKSxcbiAgICAgICAgICAgICAgICBtaW51dGVzID0gTWF0aC5hYnModGhpcy5taW51dGVzKCkpLFxuICAgICAgICAgICAgICAgIHNlY29uZHMgPSBNYXRoLmFicyh0aGlzLnNlY29uZHMoKSArIHRoaXMubWlsbGlzZWNvbmRzKCkgLyAxMDAwKTtcblxuICAgICAgICAgICAgaWYgKCF0aGlzLmFzU2Vjb25kcygpKSB7XG4gICAgICAgICAgICAgICAgLy8gdGhpcyBpcyB0aGUgc2FtZSBhcyBDIydzIChOb2RhKSBhbmQgcHl0aG9uIChpc29kYXRlKS4uLlxuICAgICAgICAgICAgICAgIC8vIGJ1dCBub3Qgb3RoZXIgSlMgKGdvb2cuZGF0ZSlcbiAgICAgICAgICAgICAgICByZXR1cm4gJ1AwRCc7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHJldHVybiAodGhpcy5hc1NlY29uZHMoKSA8IDAgPyAnLScgOiAnJykgK1xuICAgICAgICAgICAgICAgICdQJyArXG4gICAgICAgICAgICAgICAgKHllYXJzID8geWVhcnMgKyAnWScgOiAnJykgK1xuICAgICAgICAgICAgICAgIChtb250aHMgPyBtb250aHMgKyAnTScgOiAnJykgK1xuICAgICAgICAgICAgICAgIChkYXlzID8gZGF5cyArICdEJyA6ICcnKSArXG4gICAgICAgICAgICAgICAgKChob3VycyB8fCBtaW51dGVzIHx8IHNlY29uZHMpID8gJ1QnIDogJycpICtcbiAgICAgICAgICAgICAgICAoaG91cnMgPyBob3VycyArICdIJyA6ICcnKSArXG4gICAgICAgICAgICAgICAgKG1pbnV0ZXMgPyBtaW51dGVzICsgJ00nIDogJycpICtcbiAgICAgICAgICAgICAgICAoc2Vjb25kcyA/IHNlY29uZHMgKyAnUycgOiAnJyk7XG4gICAgICAgIH0sXG5cbiAgICAgICAgbG9jYWxlRGF0YSA6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLl9sb2NhbGU7XG4gICAgICAgIH1cbiAgICB9KTtcblxuICAgIG1vbWVudC5kdXJhdGlvbi5mbi50b1N0cmluZyA9IG1vbWVudC5kdXJhdGlvbi5mbi50b0lTT1N0cmluZztcblxuICAgIGZ1bmN0aW9uIG1ha2VEdXJhdGlvbkdldHRlcihuYW1lKSB7XG4gICAgICAgIG1vbWVudC5kdXJhdGlvbi5mbltuYW1lXSA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLl9kYXRhW25hbWVdO1xuICAgICAgICB9O1xuICAgIH1cblxuICAgIGZvciAoaSBpbiB1bml0TWlsbGlzZWNvbmRGYWN0b3JzKSB7XG4gICAgICAgIGlmIChoYXNPd25Qcm9wKHVuaXRNaWxsaXNlY29uZEZhY3RvcnMsIGkpKSB7XG4gICAgICAgICAgICBtYWtlRHVyYXRpb25HZXR0ZXIoaS50b0xvd2VyQ2FzZSgpKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIG1vbWVudC5kdXJhdGlvbi5mbi5hc01pbGxpc2Vjb25kcyA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuYXMoJ21zJyk7XG4gICAgfTtcbiAgICBtb21lbnQuZHVyYXRpb24uZm4uYXNTZWNvbmRzID0gZnVuY3Rpb24gKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5hcygncycpO1xuICAgIH07XG4gICAgbW9tZW50LmR1cmF0aW9uLmZuLmFzTWludXRlcyA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuYXMoJ20nKTtcbiAgICB9O1xuICAgIG1vbWVudC5kdXJhdGlvbi5mbi5hc0hvdXJzID0gZnVuY3Rpb24gKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5hcygnaCcpO1xuICAgIH07XG4gICAgbW9tZW50LmR1cmF0aW9uLmZuLmFzRGF5cyA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuYXMoJ2QnKTtcbiAgICB9O1xuICAgIG1vbWVudC5kdXJhdGlvbi5mbi5hc1dlZWtzID0gZnVuY3Rpb24gKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5hcygnd2Vla3MnKTtcbiAgICB9O1xuICAgIG1vbWVudC5kdXJhdGlvbi5mbi5hc01vbnRocyA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuYXMoJ00nKTtcbiAgICB9O1xuICAgIG1vbWVudC5kdXJhdGlvbi5mbi5hc1llYXJzID0gZnVuY3Rpb24gKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5hcygneScpO1xuICAgIH07XG5cbiAgICAvKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqXG4gICAgICAgIERlZmF1bHQgTG9jYWxlXG4gICAgKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqL1xuXG5cbiAgICAvLyBTZXQgZGVmYXVsdCBsb2NhbGUsIG90aGVyIGxvY2FsZSB3aWxsIGluaGVyaXQgZnJvbSBFbmdsaXNoLlxuICAgIG1vbWVudC5sb2NhbGUoJ2VuJywge1xuICAgICAgICBvcmRpbmFsIDogZnVuY3Rpb24gKG51bWJlcikge1xuICAgICAgICAgICAgdmFyIGIgPSBudW1iZXIgJSAxMCxcbiAgICAgICAgICAgICAgICBvdXRwdXQgPSAodG9JbnQobnVtYmVyICUgMTAwIC8gMTApID09PSAxKSA/ICd0aCcgOlxuICAgICAgICAgICAgICAgIChiID09PSAxKSA/ICdzdCcgOlxuICAgICAgICAgICAgICAgIChiID09PSAyKSA/ICduZCcgOlxuICAgICAgICAgICAgICAgIChiID09PSAzKSA/ICdyZCcgOiAndGgnO1xuICAgICAgICAgICAgcmV0dXJuIG51bWJlciArIG91dHB1dDtcbiAgICAgICAgfVxuICAgIH0pO1xuXG4gICAgLyogRU1CRURfTE9DQUxFUyAqL1xuXG4gICAgLyoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKlxuICAgICAgICBFeHBvc2luZyBNb21lbnRcbiAgICAqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKiovXG5cbiAgICBmdW5jdGlvbiBtYWtlR2xvYmFsKHNob3VsZERlcHJlY2F0ZSkge1xuICAgICAgICAvKmdsb2JhbCBlbmRlcjpmYWxzZSAqL1xuICAgICAgICBpZiAodHlwZW9mIGVuZGVyICE9PSAndW5kZWZpbmVkJykge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIG9sZEdsb2JhbE1vbWVudCA9IGdsb2JhbFNjb3BlLm1vbWVudDtcbiAgICAgICAgaWYgKHNob3VsZERlcHJlY2F0ZSkge1xuICAgICAgICAgICAgZ2xvYmFsU2NvcGUubW9tZW50ID0gZGVwcmVjYXRlKFxuICAgICAgICAgICAgICAgICAgICAnQWNjZXNzaW5nIE1vbWVudCB0aHJvdWdoIHRoZSBnbG9iYWwgc2NvcGUgaXMgJyArXG4gICAgICAgICAgICAgICAgICAgICdkZXByZWNhdGVkLCBhbmQgd2lsbCBiZSByZW1vdmVkIGluIGFuIHVwY29taW5nICcgK1xuICAgICAgICAgICAgICAgICAgICAncmVsZWFzZS4nLFxuICAgICAgICAgICAgICAgICAgICBtb21lbnQpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgZ2xvYmFsU2NvcGUubW9tZW50ID0gbW9tZW50O1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgLy8gQ29tbW9uSlMgbW9kdWxlIGlzIGRlZmluZWRcbiAgICBpZiAoaGFzTW9kdWxlKSB7XG4gICAgICAgIG1vZHVsZS5leHBvcnRzID0gbW9tZW50O1xuICAgIH0gZWxzZSBpZiAodHlwZW9mIGRlZmluZSA9PT0gJ2Z1bmN0aW9uJyAmJiBkZWZpbmUuYW1kKSB7XG4gICAgICAgIGRlZmluZSgnbW9tZW50JywgZnVuY3Rpb24gKHJlcXVpcmUsIGV4cG9ydHMsIG1vZHVsZSkge1xuICAgICAgICAgICAgaWYgKG1vZHVsZS5jb25maWcgJiYgbW9kdWxlLmNvbmZpZygpICYmIG1vZHVsZS5jb25maWcoKS5ub0dsb2JhbCA9PT0gdHJ1ZSkge1xuICAgICAgICAgICAgICAgIC8vIHJlbGVhc2UgdGhlIGdsb2JhbCB2YXJpYWJsZVxuICAgICAgICAgICAgICAgIGdsb2JhbFNjb3BlLm1vbWVudCA9IG9sZEdsb2JhbE1vbWVudDtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgcmV0dXJuIG1vbWVudDtcbiAgICAgICAgfSk7XG4gICAgICAgIG1ha2VHbG9iYWwodHJ1ZSk7XG4gICAgfSBlbHNlIHtcbiAgICAgICAgbWFrZUdsb2JhbCgpO1xuICAgIH1cbn0pLmNhbGwodGhpcyk7XG5cbn0pLmNhbGwodGhpcyx0eXBlb2YgZ2xvYmFsICE9PSBcInVuZGVmaW5lZFwiID8gZ2xvYmFsIDogdHlwZW9mIHNlbGYgIT09IFwidW5kZWZpbmVkXCIgPyBzZWxmIDogdHlwZW9mIHdpbmRvdyAhPT0gXCJ1bmRlZmluZWRcIiA/IHdpbmRvdyA6IHt9KSIsIi8qXHJcblxyXG4gU29mdHdhcmUgTGljZW5zZSBBZ3JlZW1lbnQgKEJTRCBMaWNlbnNlKVxyXG4gaHR0cDovL3RhZmZ5ZGIuY29tXHJcbiBDb3B5cmlnaHQgKGMpXHJcbiBBbGwgcmlnaHRzIHJlc2VydmVkLlxyXG5cclxuXHJcbiBSZWRpc3RyaWJ1dGlvbiBhbmQgdXNlIG9mIHRoaXMgc29mdHdhcmUgaW4gc291cmNlIGFuZCBiaW5hcnkgZm9ybXMsIHdpdGggb3Igd2l0aG91dCBtb2RpZmljYXRpb24sIGFyZSBwZXJtaXR0ZWQgcHJvdmlkZWQgdGhhdCB0aGUgZm9sbG93aW5nIGNvbmRpdGlvbiBpcyBtZXQ6XHJcblxyXG4gKiBSZWRpc3RyaWJ1dGlvbnMgb2Ygc291cmNlIGNvZGUgbXVzdCByZXRhaW4gdGhlIGFib3ZlIGNvcHlyaWdodCBub3RpY2UsIHRoaXMgbGlzdCBvZiBjb25kaXRpb25zIGFuZCB0aGUgZm9sbG93aW5nIGRpc2NsYWltZXIuXHJcblxyXG4gVEhJUyBTT0ZUV0FSRSBJUyBQUk9WSURFRCBCWSBUSEUgQ09QWVJJR0hUIEhPTERFUlMgQU5EIENPTlRSSUJVVE9SUyBcIkFTIElTXCIgQU5EIEFOWSBFWFBSRVNTIE9SIElNUExJRUQgV0FSUkFOVElFUywgSU5DTFVESU5HLCBCVVQgTk9UIExJTUlURUQgVE8sIFRIRSBJTVBMSUVEIFdBUlJBTlRJRVMgT0YgTUVSQ0hBTlRBQklMSVRZIEFORCBGSVRORVNTIEZPUiBBIFBBUlRJQ1VMQVIgUFVSUE9TRSBBUkUgRElTQ0xBSU1FRC4gSU4gTk8gRVZFTlQgU0hBTEwgVEhFIENPUFlSSUdIVCBPV05FUiBPUiBDT05UUklCVVRPUlMgQkUgTElBQkxFIEZPUiBBTlkgRElSRUNULCBJTkRJUkVDVCwgSU5DSURFTlRBTCwgU1BFQ0lBTCwgRVhFTVBMQVJZLCBPUiBDT05TRVFVRU5USUFMIERBTUFHRVMgKElOQ0xVRElORywgQlVUIE5PVFxyXG4gTElNSVRFRCBUTywgUFJPQ1VSRU1FTlQgT0YgU1VCU1RJVFVURSBHT09EUyBPUiBTRVJWSUNFUzsgTE9TUyBPRiBVU0UsIERBVEEsIE9SIFBST0ZJVFM7IE9SIEJVU0lORVNTIElOVEVSUlVQVElPTikgSE9XRVZFUiBDQVVTRUQgQU5EIE9OIEFOWSBUSEVPUlkgT0YgTElBQklMSVRZLCBXSEVUSEVSIElOIENPTlRSQUNULCBTVFJJQ1QgTElBQklMSVRZLCBPUiBUT1JUIChJTkNMVURJTkcgTkVHTElHRU5DRSBPUiBPVEhFUldJU0UpIEFSSVNJTkcgSU4gQU5ZIFdBWSBPVVQgT0YgVEhFIFVTRSBPRiBUSElTIFNPRlRXQVJFLCBFVkVOIElGIEFEVklTRUQgT0YgVEhFIFBPU1NJQklMSVRZIE9GIFNVQ0ggREFNQUdFLlxyXG5cclxuICovXHJcblxyXG4vKmpzbGludCAgICAgICAgYnJvd3NlciA6IHRydWUsIGNvbnRpbnVlIDogdHJ1ZSxcclxuIGRldmVsICA6IHRydWUsIGluZGVudCAgOiAyLCAgICBtYXhlcnIgICA6IDUwMCxcclxuIG5ld2NhcCA6IHRydWUsIG5vbWVuICAgOiB0cnVlLCBwbHVzcGx1cyA6IHRydWUsXHJcbiByZWdleHAgOiB0cnVlLCBzbG9wcHkgIDogdHJ1ZSwgdmFycyAgICAgOiBmYWxzZSxcclxuIHdoaXRlICA6IHRydWVcclxuKi9cclxuXHJcbi8vIEJVSUxEIDE5M2Q0OGQsIG1vZGlmaWVkIGJ5IG1taWtvd3NraSB0byBwYXNzIGpzbGludFxyXG5cclxuLy8gU2V0dXAgVEFGRlkgbmFtZSBzcGFjZSB0byByZXR1cm4gYW4gb2JqZWN0IHdpdGggbWV0aG9kc1xyXG52YXIgVEFGRlksIGV4cG9ydHMsIFQ7XHJcbihmdW5jdGlvbiAoKSB7XHJcbiAgJ3VzZSBzdHJpY3QnO1xyXG4gIHZhclxyXG4gICAgdHlwZUxpc3QsICAgICBtYWtlVGVzdCwgICAgIGlkeCwgICAgdHlwZUtleSxcclxuICAgIHZlcnNpb24sICAgICAgVEMsICAgICAgICAgICBpZHBhZCwgIGNtYXgsXHJcbiAgICBBUEksICAgICAgICAgIHByb3RlY3RKU09OLCAgZWFjaCwgICBlYWNoaW4sXHJcbiAgICBpc0luZGV4YWJsZSwgIHJldHVybkZpbHRlciwgcnVuRmlsdGVycyxcclxuICAgIG51bWNoYXJzcGxpdCwgb3JkZXJCeUNvbCwgICBydW4sICAgIGludGVyc2VjdGlvbixcclxuICAgIGZpbHRlciwgICAgICAgbWFrZUNpZCwgICAgICBzYWZlRm9ySnNvbixcclxuICAgIGlzUmVnZXhwXHJcbiAgICA7XHJcblxyXG5cclxuICBpZiAoICEgVEFGRlkgKXtcclxuICAgIC8vIFRDID0gQ291bnRlciBmb3IgVGFmZnkgREJzIG9uIHBhZ2UsIHVzZWQgZm9yIHVuaXF1ZSBJRHNcclxuICAgIC8vIGNtYXggPSBzaXplIG9mIGNoYXJudW1hcnJheSBjb252ZXJzaW9uIGNhY2hlXHJcbiAgICAvLyBpZHBhZCA9IHplcm9zIHRvIHBhZCByZWNvcmQgSURzIHdpdGhcclxuICAgIHZlcnNpb24gPSAnMi43JztcclxuICAgIFRDICAgICAgPSAxO1xyXG4gICAgaWRwYWQgICA9ICcwMDAwMDAnO1xyXG4gICAgY21heCAgICA9IDEwMDA7XHJcbiAgICBBUEkgICAgID0ge307XHJcblxyXG4gICAgcHJvdGVjdEpTT04gPSBmdW5jdGlvbiAoIHQgKSB7XHJcbiAgICAgIC8vICoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKipcclxuICAgICAgLy8gKlxyXG4gICAgICAvLyAqIFRha2VzOiBhIHZhcmlhYmxlXHJcbiAgICAgIC8vICogUmV0dXJuczogdGhlIHZhcmlhYmxlIGlmIG9iamVjdC9hcnJheSBvciB0aGUgcGFyc2VkIHZhcmlhYmxlIGlmIEpTT05cclxuICAgICAgLy8gKlxyXG4gICAgICAvLyAqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqICBcclxuICAgICAgaWYgKCBUQUZGWS5pc0FycmF5KCB0ICkgfHwgVEFGRlkuaXNPYmplY3QoIHQgKSApe1xyXG4gICAgICAgIHJldHVybiB0O1xyXG4gICAgICB9XHJcbiAgICAgIGVsc2Uge1xyXG4gICAgICAgIHJldHVybiBKU09OLnBhcnNlKCB0ICk7XHJcbiAgICAgIH1cclxuICAgIH07XHJcbiAgICBcclxuICAgIC8vIGdyYWNlZnVsbHkgc3RvbGVuIGZyb20gdW5kZXJzY29yZS5qc1xyXG4gICAgaW50ZXJzZWN0aW9uID0gZnVuY3Rpb24oYXJyYXkxLCBhcnJheTIpIHtcclxuICAgICAgICByZXR1cm4gZmlsdGVyKGFycmF5MSwgZnVuY3Rpb24oaXRlbSkge1xyXG4gICAgICAgICAgcmV0dXJuIGFycmF5Mi5pbmRleE9mKGl0ZW0pID49IDA7XHJcbiAgICAgICAgfSk7XHJcbiAgICB9O1xyXG5cclxuICAgIC8vIGdyYWNlZnVsbHkgc3RvbGVuIGZyb20gdW5kZXJzY29yZS5qc1xyXG4gICAgZmlsdGVyID0gZnVuY3Rpb24ob2JqLCBpdGVyYXRvciwgY29udGV4dCkge1xyXG4gICAgICAgIHZhciByZXN1bHRzID0gW107XHJcbiAgICAgICAgaWYgKG9iaiA9PSBudWxsKSByZXR1cm4gcmVzdWx0cztcclxuICAgICAgICBpZiAoQXJyYXkucHJvdG90eXBlLmZpbHRlciAmJiBvYmouZmlsdGVyID09PSBBcnJheS5wcm90b3R5cGUuZmlsdGVyKSByZXR1cm4gb2JqLmZpbHRlcihpdGVyYXRvciwgY29udGV4dCk7XHJcbiAgICAgICAgZWFjaChvYmosIGZ1bmN0aW9uKHZhbHVlLCBpbmRleCwgbGlzdCkge1xyXG4gICAgICAgICAgaWYgKGl0ZXJhdG9yLmNhbGwoY29udGV4dCwgdmFsdWUsIGluZGV4LCBsaXN0KSkgcmVzdWx0c1tyZXN1bHRzLmxlbmd0aF0gPSB2YWx1ZTtcclxuICAgICAgICB9KTtcclxuICAgICAgICByZXR1cm4gcmVzdWx0cztcclxuICAgIH07XHJcbiAgICBcclxuICAgIGlzUmVnZXhwID0gZnVuY3Rpb24oYU9iaikge1xyXG4gICAgICAgIHJldHVybiBPYmplY3QucHJvdG90eXBlLnRvU3RyaW5nLmNhbGwoYU9iaik9PT0nW29iamVjdCBSZWdFeHBdJztcclxuICAgIH1cclxuICAgIFxyXG4gICAgc2FmZUZvckpzb24gPSBmdW5jdGlvbihhT2JqKSB7XHJcbiAgICAgICAgdmFyIG15UmVzdWx0ID0gVC5pc0FycmF5KGFPYmopID8gW10gOiBULmlzT2JqZWN0KGFPYmopID8ge30gOiBudWxsO1xyXG4gICAgICAgIGlmKGFPYmo9PT1udWxsKSByZXR1cm4gYU9iajtcclxuICAgICAgICBmb3IodmFyIGkgaW4gYU9iaikge1xyXG4gICAgICAgICAgICBteVJlc3VsdFtpXSAgPSBpc1JlZ2V4cChhT2JqW2ldKSA/IGFPYmpbaV0udG9TdHJpbmcoKSA6IFQuaXNBcnJheShhT2JqW2ldKSB8fCBULmlzT2JqZWN0KGFPYmpbaV0pID8gc2FmZUZvckpzb24oYU9ialtpXSkgOiBhT2JqW2ldO1xyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gbXlSZXN1bHQ7XHJcbiAgICB9XHJcbiAgICBcclxuICAgIG1ha2VDaWQgPSBmdW5jdGlvbihhQ29udGV4dCkge1xyXG4gICAgICAgIHZhciBteUNpZCA9IEpTT04uc3RyaW5naWZ5KGFDb250ZXh0KTtcclxuICAgICAgICBpZihteUNpZC5tYXRjaCgvcmVnZXgvKT09PW51bGwpIHJldHVybiBteUNpZDtcclxuICAgICAgICByZXR1cm4gSlNPTi5zdHJpbmdpZnkoc2FmZUZvckpzb24oYUNvbnRleHQpKTtcclxuICAgIH1cclxuICAgIFxyXG4gICAgZWFjaCA9IGZ1bmN0aW9uICggYSwgZnVuLCB1ICkge1xyXG4gICAgICB2YXIgciwgaSwgeCwgeTtcclxuICAgICAgLy8gKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKlxyXG4gICAgICAvLyAqXHJcbiAgICAgIC8vICogVGFrZXM6XHJcbiAgICAgIC8vICogYSA9IGFuIG9iamVjdC92YWx1ZSBvciBhbiBhcnJheSBvZiBvYmplY3RzL3ZhbHVlc1xyXG4gICAgICAvLyAqIGYgPSBhIGZ1bmN0aW9uXHJcbiAgICAgIC8vICogdSA9IG9wdGlvbmFsIGZsYWcgdG8gZGVzY3JpYmUgaG93IHRvIGhhbmRsZSB1bmRlZmluZWQgdmFsdWVzXHJcbiAgICAgIC8vICAgaW4gYXJyYXkgb2YgdmFsdWVzLiBUcnVlOiBwYXNzIHRoZW0gdG8gdGhlIGZ1bmN0aW9ucyxcclxuICAgICAgLy8gICBGYWxzZTogc2tpcC4gRGVmYXVsdCBGYWxzZTtcclxuICAgICAgLy8gKiBQdXJwb3NlOiBVc2VkIHRvIGxvb3Agb3ZlciBhcnJheXNcclxuICAgICAgLy8gKlxyXG4gICAgICAvLyAqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqICBcclxuICAgICAgaWYgKCBhICYmICgoVC5pc0FycmF5KCBhICkgJiYgYS5sZW5ndGggPT09IDEpIHx8ICghVC5pc0FycmF5KCBhICkpKSApe1xyXG4gICAgICAgIGZ1biggKFQuaXNBcnJheSggYSApKSA/IGFbMF0gOiBhLCAwICk7XHJcbiAgICAgIH1cclxuICAgICAgZWxzZSB7XHJcbiAgICAgICAgZm9yICggciwgaSwgeCA9IDAsIGEgPSAoVC5pc0FycmF5KCBhICkpID8gYSA6IFthXSwgeSA9IGEubGVuZ3RoO1xyXG4gICAgICAgICAgICAgIHggPCB5OyB4KysgKVxyXG4gICAgICAgIHtcclxuICAgICAgICAgIGkgPSBhW3hdO1xyXG4gICAgICAgICAgaWYgKCAhVC5pc1VuZGVmaW5lZCggaSApIHx8ICh1IHx8IGZhbHNlKSApe1xyXG4gICAgICAgICAgICByID0gZnVuKCBpLCB4ICk7XHJcbiAgICAgICAgICAgIGlmICggciA9PT0gVC5FWElUICl7XHJcbiAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcbiAgICB9O1xyXG5cclxuICAgIGVhY2hpbiA9IGZ1bmN0aW9uICggbywgZnVuICkge1xyXG4gICAgICAvLyAqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqXHJcbiAgICAgIC8vICpcclxuICAgICAgLy8gKiBUYWtlczpcclxuICAgICAgLy8gKiBvID0gYW4gb2JqZWN0XHJcbiAgICAgIC8vICogZiA9IGEgZnVuY3Rpb25cclxuICAgICAgLy8gKiBQdXJwb3NlOiBVc2VkIHRvIGxvb3Agb3ZlciBvYmplY3RzXHJcbiAgICAgIC8vICpcclxuICAgICAgLy8gKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKiAgXHJcbiAgICAgIHZhciB4ID0gMCwgciwgaTtcclxuXHJcbiAgICAgIGZvciAoIGkgaW4gbyApe1xyXG4gICAgICAgIGlmICggby5oYXNPd25Qcm9wZXJ0eSggaSApICl7XHJcbiAgICAgICAgICByID0gZnVuKCBvW2ldLCBpLCB4KysgKTtcclxuICAgICAgICAgIGlmICggciA9PT0gVC5FWElUICl7XHJcbiAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG5cclxuICAgIH07XHJcblxyXG4gICAgQVBJLmV4dGVuZCA9IGZ1bmN0aW9uICggbSwgZiApIHtcclxuICAgICAgLy8gKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKlxyXG4gICAgICAvLyAqXHJcbiAgICAgIC8vICogVGFrZXM6IG1ldGhvZCBuYW1lLCBmdW5jdGlvblxyXG4gICAgICAvLyAqIFB1cnBvc2U6IEFkZCBhIGN1c3RvbSBtZXRob2QgdG8gdGhlIEFQSVxyXG4gICAgICAvLyAqXHJcbiAgICAgIC8vICoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKiogIFxyXG4gICAgICBBUElbbV0gPSBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgcmV0dXJuIGYuYXBwbHkoIHRoaXMsIGFyZ3VtZW50cyApO1xyXG4gICAgICB9O1xyXG4gICAgfTtcclxuXHJcbiAgICBpc0luZGV4YWJsZSA9IGZ1bmN0aW9uICggZiApIHtcclxuICAgICAgdmFyIGk7XHJcbiAgICAgIC8vIENoZWNrIHRvIHNlZSBpZiByZWNvcmQgSURcclxuICAgICAgaWYgKCBULmlzU3RyaW5nKCBmICkgJiYgL1t0XVswLTldKltyXVswLTldKi9pLnRlc3QoIGYgKSApe1xyXG4gICAgICAgIHJldHVybiB0cnVlO1xyXG4gICAgICB9XHJcbiAgICAgIC8vIENoZWNrIHRvIHNlZSBpZiByZWNvcmRcclxuICAgICAgaWYgKCBULmlzT2JqZWN0KCBmICkgJiYgZi5fX19pZCAmJiBmLl9fX3MgKXtcclxuICAgICAgICByZXR1cm4gdHJ1ZTtcclxuICAgICAgfVxyXG5cclxuICAgICAgLy8gQ2hlY2sgdG8gc2VlIGlmIGFycmF5IG9mIGluZGV4ZXNcclxuICAgICAgaWYgKCBULmlzQXJyYXkoIGYgKSApe1xyXG4gICAgICAgIGkgPSB0cnVlO1xyXG4gICAgICAgIGVhY2goIGYsIGZ1bmN0aW9uICggciApIHtcclxuICAgICAgICAgIGlmICggIWlzSW5kZXhhYmxlKCByICkgKXtcclxuICAgICAgICAgICAgaSA9IGZhbHNlO1xyXG5cclxuICAgICAgICAgICAgcmV0dXJuIFRBRkZZLkVYSVQ7XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgcmV0dXJuIGk7XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIHJldHVybiBmYWxzZTtcclxuICAgIH07XHJcblxyXG4gICAgcnVuRmlsdGVycyA9IGZ1bmN0aW9uICggciwgZmlsdGVyICkge1xyXG4gICAgICAvLyAqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqXHJcbiAgICAgIC8vICpcclxuICAgICAgLy8gKiBUYWtlczogdGFrZXMgYSByZWNvcmQgYW5kIGEgY29sbGVjdGlvbiBvZiBmaWx0ZXJzXHJcbiAgICAgIC8vICogUmV0dXJuczogdHJ1ZSBpZiB0aGUgcmVjb3JkIG1hdGNoZXMsIGZhbHNlIG90aGVyd2lzZVxyXG4gICAgICAvLyAqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqXHJcbiAgICAgIHZhciBtYXRjaCA9IHRydWU7XHJcblxyXG5cclxuICAgICAgZWFjaCggZmlsdGVyLCBmdW5jdGlvbiAoIG1mICkge1xyXG4gICAgICAgIHN3aXRjaCAoIFQudHlwZU9mKCBtZiApICl7XHJcbiAgICAgICAgICBjYXNlICdmdW5jdGlvbic6XHJcbiAgICAgICAgICAgIC8vIHJ1biBmdW5jdGlvblxyXG4gICAgICAgICAgICBpZiAoICFtZi5hcHBseSggciApICl7XHJcbiAgICAgICAgICAgICAgbWF0Y2ggPSBmYWxzZTtcclxuICAgICAgICAgICAgICByZXR1cm4gVEFGRlkuRVhJVDtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgIGNhc2UgJ2FycmF5JzpcclxuICAgICAgICAgICAgLy8gbG9vcCBhcnJheSBhbmQgdHJlYXQgbGlrZSBhIFNRTCBvclxyXG4gICAgICAgICAgICBtYXRjaCA9IChtZi5sZW5ndGggPT09IDEpID8gKHJ1bkZpbHRlcnMoIHIsIG1mWzBdICkpIDpcclxuICAgICAgICAgICAgICAobWYubGVuZ3RoID09PSAyKSA/IChydW5GaWx0ZXJzKCByLCBtZlswXSApIHx8XHJcbiAgICAgICAgICAgICAgICBydW5GaWx0ZXJzKCByLCBtZlsxXSApKSA6XHJcbiAgICAgICAgICAgICAgICAobWYubGVuZ3RoID09PSAzKSA/IChydW5GaWx0ZXJzKCByLCBtZlswXSApIHx8XHJcbiAgICAgICAgICAgICAgICAgIHJ1bkZpbHRlcnMoIHIsIG1mWzFdICkgfHwgcnVuRmlsdGVycyggciwgbWZbMl0gKSkgOlxyXG4gICAgICAgICAgICAgICAgICAobWYubGVuZ3RoID09PSA0KSA/IChydW5GaWx0ZXJzKCByLCBtZlswXSApIHx8XHJcbiAgICAgICAgICAgICAgICAgICAgcnVuRmlsdGVycyggciwgbWZbMV0gKSB8fCBydW5GaWx0ZXJzKCByLCBtZlsyXSApIHx8XHJcbiAgICAgICAgICAgICAgICAgICAgcnVuRmlsdGVycyggciwgbWZbM10gKSkgOiBmYWxzZTtcclxuICAgICAgICAgICAgaWYgKCBtZi5sZW5ndGggPiA0ICl7XHJcbiAgICAgICAgICAgICAgZWFjaCggbWYsIGZ1bmN0aW9uICggZiApIHtcclxuICAgICAgICAgICAgICAgIGlmICggcnVuRmlsdGVycyggciwgZiApICl7XHJcbiAgICAgICAgICAgICAgICAgIG1hdGNoID0gdHJ1ZTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBicmVhaztcclxuICAgICAgICB9XHJcbiAgICAgIH0pO1xyXG5cclxuICAgICAgcmV0dXJuIG1hdGNoO1xyXG4gICAgfTtcclxuXHJcbiAgICByZXR1cm5GaWx0ZXIgPSBmdW5jdGlvbiAoIGYgKSB7XHJcbiAgICAgIC8vICoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKipcclxuICAgICAgLy8gKlxyXG4gICAgICAvLyAqIFRha2VzOiBmaWx0ZXIgb2JqZWN0XHJcbiAgICAgIC8vICogUmV0dXJuczogYSBmaWx0ZXIgZnVuY3Rpb25cclxuICAgICAgLy8gKiBQdXJwb3NlOiBUYWtlIGEgZmlsdGVyIG9iamVjdCBhbmQgcmV0dXJuIGEgZnVuY3Rpb24gdGhhdCBjYW4gYmUgdXNlZCB0byBjb21wYXJlXHJcbiAgICAgIC8vICogYSBUYWZmeURCIHJlY29yZCB0byBzZWUgaWYgdGhlIHJlY29yZCBtYXRjaGVzIGEgcXVlcnlcclxuICAgICAgLy8gKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKiAgXHJcbiAgICAgIHZhciBuZiA9IFtdO1xyXG4gICAgICBpZiAoIFQuaXNTdHJpbmcoIGYgKSAmJiAvW3RdWzAtOV0qW3JdWzAtOV0qL2kudGVzdCggZiApICl7XHJcbiAgICAgICAgZiA9IHsgX19faWQgOiBmIH07XHJcbiAgICAgIH1cclxuICAgICAgaWYgKCBULmlzQXJyYXkoIGYgKSApe1xyXG4gICAgICAgIC8vIGlmIHdlIGFyZSB3b3JraW5nIHdpdGggYW4gYXJyYXlcclxuXHJcbiAgICAgICAgZWFjaCggZiwgZnVuY3Rpb24gKCByICkge1xyXG4gICAgICAgICAgLy8gbG9vcCB0aGUgYXJyYXkgYW5kIHJldHVybiBhIGZpbHRlciBmdW5jIGZvciBlYWNoIHZhbHVlXHJcbiAgICAgICAgICBuZi5wdXNoKCByZXR1cm5GaWx0ZXIoIHIgKSApO1xyXG4gICAgICAgIH0pO1xyXG4gICAgICAgIC8vIG5vdyBidWlsZCBhIGZ1bmMgdG8gbG9vcCBvdmVyIHRoZSBmaWx0ZXJzIGFuZCByZXR1cm4gdHJ1ZSBpZiBBTlkgb2YgdGhlIGZpbHRlcnMgbWF0Y2hcclxuICAgICAgICAvLyBUaGlzIGhhbmRsZXMgbG9naWNhbCBPUiBleHByZXNzaW9uc1xyXG4gICAgICAgIGYgPSBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICB2YXIgdGhhdCA9IHRoaXMsIG1hdGNoID0gZmFsc2U7XHJcbiAgICAgICAgICBlYWNoKCBuZiwgZnVuY3Rpb24gKCBmICkge1xyXG4gICAgICAgICAgICBpZiAoIHJ1bkZpbHRlcnMoIHRoYXQsIGYgKSApe1xyXG4gICAgICAgICAgICAgIG1hdGNoID0gdHJ1ZTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgfSk7XHJcbiAgICAgICAgICByZXR1cm4gbWF0Y2g7XHJcbiAgICAgICAgfTtcclxuICAgICAgICByZXR1cm4gZjtcclxuXHJcbiAgICAgIH1cclxuICAgICAgLy8gaWYgd2UgYXJlIGRlYWxpbmcgd2l0aCBhbiBPYmplY3RcclxuICAgICAgaWYgKCBULmlzT2JqZWN0KCBmICkgKXtcclxuICAgICAgICBpZiAoIFQuaXNPYmplY3QoIGYgKSAmJiBmLl9fX2lkICYmIGYuX19fcyApe1xyXG4gICAgICAgICAgZiA9IHsgX19faWQgOiBmLl9fX2lkIH07XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvLyBMb29wIG92ZXIgZWFjaCB2YWx1ZSBvbiB0aGUgb2JqZWN0IHRvIHByZXAgbWF0Y2ggdHlwZSBhbmQgbWF0Y2ggdmFsdWVcclxuICAgICAgICBlYWNoaW4oIGYsIGZ1bmN0aW9uICggdiwgaSApIHtcclxuXHJcbiAgICAgICAgICAvLyBkZWZhdWx0IG1hdGNoIHR5cGUgdG8gSVMvRXF1YWxzXHJcbiAgICAgICAgICBpZiAoICFULmlzT2JqZWN0KCB2ICkgKXtcclxuICAgICAgICAgICAgdiA9IHtcclxuICAgICAgICAgICAgICAnaXMnIDogdlxyXG4gICAgICAgICAgICB9O1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgICAgLy8gbG9vcCBvdmVyIGVhY2ggdmFsdWUgb24gdGhlIHZhbHVlIG9iamVjdCAgLSBpZiBhbnlcclxuICAgICAgICAgIGVhY2hpbiggdiwgZnVuY3Rpb24gKCBtdGVzdCwgcyApIHtcclxuICAgICAgICAgICAgLy8gcyA9IG1hdGNoIHR5cGUsIGUuZy4gaXMsIGhhc0FsbCwgbGlrZSwgZXRjXHJcbiAgICAgICAgICAgIHZhciBjID0gW10sIGxvb3BlcjtcclxuXHJcbiAgICAgICAgICAgIC8vIGZ1bmN0aW9uIHRvIGxvb3AgYW5kIGFwcGx5IGZpbHRlclxyXG4gICAgICAgICAgICBsb29wZXIgPSAocyA9PT0gJ2hhc0FsbCcpID9cclxuICAgICAgICAgICAgICBmdW5jdGlvbiAoIG10ZXN0LCBmdW5jICkge1xyXG4gICAgICAgICAgICAgICAgZnVuYyggbXRlc3QgKTtcclxuICAgICAgICAgICAgICB9IDogZWFjaDtcclxuXHJcbiAgICAgICAgICAgIC8vIGxvb3Agb3ZlciBlYWNoIHRlc3RcclxuICAgICAgICAgICAgbG9vcGVyKCBtdGVzdCwgZnVuY3Rpb24gKCBtdGVzdCApIHtcclxuXHJcbiAgICAgICAgICAgICAgLy8gc3UgPSBtYXRjaCBzdWNjZXNzXHJcbiAgICAgICAgICAgICAgLy8gZiA9IG1hdGNoIGZhbHNlXHJcbiAgICAgICAgICAgICAgdmFyIHN1ID0gdHJ1ZSwgZiA9IGZhbHNlLCBtYXRjaEZ1bmM7XHJcblxyXG5cclxuICAgICAgICAgICAgICAvLyBwdXNoIGEgZnVuY3Rpb24gb250byB0aGUgZmlsdGVyIGNvbGxlY3Rpb24gdG8gZG8gdGhlIG1hdGNoaW5nXHJcbiAgICAgICAgICAgICAgbWF0Y2hGdW5jID0gZnVuY3Rpb24gKCkge1xyXG5cclxuICAgICAgICAgICAgICAgIC8vIGdldCB0aGUgdmFsdWUgZnJvbSB0aGUgcmVjb3JkXHJcbiAgICAgICAgICAgICAgICB2YXJcclxuICAgICAgICAgICAgICAgICAgbXZhbHVlICAgPSB0aGlzW2ldLFxyXG4gICAgICAgICAgICAgICAgICBlcWVxICAgICA9ICc9PScsXHJcbiAgICAgICAgICAgICAgICAgIGJhbmdlcSAgID0gJyE9JyxcclxuICAgICAgICAgICAgICAgICAgZXFlcWVxICAgPSAnPT09JyxcclxuICAgICAgICAgICAgICAgICAgbHQgICA9ICc8JyxcclxuICAgICAgICAgICAgICAgICAgZ3QgICA9ICc+JyxcclxuICAgICAgICAgICAgICAgICAgbHRlcSAgID0gJzw9JyxcclxuICAgICAgICAgICAgICAgICAgZ3RlcSAgID0gJz49JyxcclxuICAgICAgICAgICAgICAgICAgYmFuZ2VxZXEgPSAnIT09JyxcclxuICAgICAgICAgICAgICAgICAgclxyXG4gICAgICAgICAgICAgICAgICA7XHJcblxyXG4gICAgICAgICAgICAgICAgaWYgKHR5cGVvZiBtdmFsdWUgPT09ICd1bmRlZmluZWQnKSB7XHJcbiAgICAgICAgICAgICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIFxyXG4gICAgICAgICAgICAgICAgaWYgKCAocy5pbmRleE9mKCAnIScgKSA9PT0gMCkgJiYgcyAhPT0gYmFuZ2VxICYmXHJcbiAgICAgICAgICAgICAgICAgIHMgIT09IGJhbmdlcWVxIClcclxuICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgLy8gaWYgdGhlIGZpbHRlciBuYW1lIHN0YXJ0cyB3aXRoICEgYXMgaW4gJyFpcycgdGhlbiByZXZlcnNlIHRoZSBtYXRjaCBsb2dpYyBhbmQgcmVtb3ZlIHRoZSAhXHJcbiAgICAgICAgICAgICAgICAgIHN1ID0gZmFsc2U7XHJcbiAgICAgICAgICAgICAgICAgIHMgPSBzLnN1YnN0cmluZyggMSwgcy5sZW5ndGggKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIC8vIGdldCB0aGUgbWF0Y2ggcmVzdWx0cyBiYXNlZCBvbiB0aGUgcy9tYXRjaCB0eXBlXHJcbiAgICAgICAgICAgICAgICAvKmpzbGludCBlcWVxIDogdHJ1ZSAqL1xyXG4gICAgICAgICAgICAgICAgciA9IChcclxuICAgICAgICAgICAgICAgICAgKHMgPT09ICdyZWdleCcpID8gKG10ZXN0LnRlc3QoIG12YWx1ZSApKSA6IChzID09PSAnbHQnIHx8IHMgPT09IGx0KVxyXG4gICAgICAgICAgICAgICAgICA/IChtdmFsdWUgPCBtdGVzdCkgIDogKHMgPT09ICdndCcgfHwgcyA9PT0gZ3QpXHJcbiAgICAgICAgICAgICAgICAgID8gKG12YWx1ZSA+IG10ZXN0KSAgOiAocyA9PT0gJ2x0ZScgfHwgcyA9PT0gbHRlcSlcclxuICAgICAgICAgICAgICAgICAgPyAobXZhbHVlIDw9IG10ZXN0KSA6IChzID09PSAnZ3RlJyB8fCBzID09PSBndGVxKVxyXG4gICAgICAgICAgICAgICAgICA/IChtdmFsdWUgPj0gbXRlc3QpIDogKHMgPT09ICdsZWZ0JylcclxuICAgICAgICAgICAgICAgICAgPyAobXZhbHVlLmluZGV4T2YoIG10ZXN0ICkgPT09IDApIDogKHMgPT09ICdsZWZ0bm9jYXNlJylcclxuICAgICAgICAgICAgICAgICAgPyAobXZhbHVlLnRvTG93ZXJDYXNlKCkuaW5kZXhPZiggbXRlc3QudG9Mb3dlckNhc2UoKSApXHJcbiAgICAgICAgICAgICAgICAgICAgPT09IDApIDogKHMgPT09ICdyaWdodCcpXHJcbiAgICAgICAgICAgICAgICAgID8gKG12YWx1ZS5zdWJzdHJpbmcoIChtdmFsdWUubGVuZ3RoIC0gbXRlc3QubGVuZ3RoKSApXHJcbiAgICAgICAgICAgICAgICAgICAgPT09IG10ZXN0KSA6IChzID09PSAncmlnaHRub2Nhc2UnKVxyXG4gICAgICAgICAgICAgICAgICA/IChtdmFsdWUudG9Mb3dlckNhc2UoKS5zdWJzdHJpbmcoXHJcbiAgICAgICAgICAgICAgICAgICAgKG12YWx1ZS5sZW5ndGggLSBtdGVzdC5sZW5ndGgpICkgPT09IG10ZXN0LnRvTG93ZXJDYXNlKCkpXHJcbiAgICAgICAgICAgICAgICAgICAgOiAocyA9PT0gJ2xpa2UnKVxyXG4gICAgICAgICAgICAgICAgICA/IChtdmFsdWUuaW5kZXhPZiggbXRlc3QgKSA+PSAwKSA6IChzID09PSAnbGlrZW5vY2FzZScpXHJcbiAgICAgICAgICAgICAgICAgID8gKG12YWx1ZS50b0xvd2VyQ2FzZSgpLmluZGV4T2YobXRlc3QudG9Mb3dlckNhc2UoKSkgPj0gMClcclxuICAgICAgICAgICAgICAgICAgICA6IChzID09PSBlcWVxZXEgfHwgcyA9PT0gJ2lzJylcclxuICAgICAgICAgICAgICAgICAgPyAobXZhbHVlID09PSAgbXRlc3QpIDogKHMgPT09IGVxZXEpXHJcbiAgICAgICAgICAgICAgICAgID8gKG12YWx1ZSA9PSBtdGVzdCkgOiAocyA9PT0gYmFuZ2VxZXEpXHJcbiAgICAgICAgICAgICAgICAgID8gKG12YWx1ZSAhPT0gIG10ZXN0KSA6IChzID09PSBiYW5nZXEpXHJcbiAgICAgICAgICAgICAgICAgID8gKG12YWx1ZSAhPSBtdGVzdCkgOiAocyA9PT0gJ2lzbm9jYXNlJylcclxuICAgICAgICAgICAgICAgICAgPyAobXZhbHVlLnRvTG93ZXJDYXNlXHJcbiAgICAgICAgICAgICAgICAgICAgPyBtdmFsdWUudG9Mb3dlckNhc2UoKSA9PT0gbXRlc3QudG9Mb3dlckNhc2UoKVxyXG4gICAgICAgICAgICAgICAgICAgICAgOiBtdmFsdWUgPT09IG10ZXN0KSA6IChzID09PSAnaGFzJylcclxuICAgICAgICAgICAgICAgICAgPyAoVC5oYXMoIG12YWx1ZSwgbXRlc3QgKSkgOiAocyA9PT0gJ2hhc2FsbCcpXHJcbiAgICAgICAgICAgICAgICAgID8gKFQuaGFzQWxsKCBtdmFsdWUsIG10ZXN0ICkpIDogKHMgPT09ICdjb250YWlucycpXHJcbiAgICAgICAgICAgICAgICAgID8gKFRBRkZZLmlzQXJyYXkobXZhbHVlKSAmJiBtdmFsdWUuaW5kZXhPZihtdGVzdCkgPiAtMSkgOiAoXHJcbiAgICAgICAgICAgICAgICAgICAgcy5pbmRleE9mKCAnaXMnICkgPT09IC0xXHJcbiAgICAgICAgICAgICAgICAgICAgICAmJiAhVEFGRlkuaXNOdWxsKCBtdmFsdWUgKVxyXG4gICAgICAgICAgICAgICAgICAgICAgJiYgIVRBRkZZLmlzVW5kZWZpbmVkKCBtdmFsdWUgKVxyXG4gICAgICAgICAgICAgICAgICAgICAgJiYgIVRBRkZZLmlzT2JqZWN0KCBtdGVzdCApXHJcbiAgICAgICAgICAgICAgICAgICAgICAmJiAhVEFGRlkuaXNBcnJheSggbXRlc3QgKVxyXG4gICAgICAgICAgICAgICAgICAgIClcclxuICAgICAgICAgICAgICAgICAgPyAobXRlc3QgPT09IG12YWx1ZVtzXSlcclxuICAgICAgICAgICAgICAgICAgICA6IChUW3NdICYmIFQuaXNGdW5jdGlvbiggVFtzXSApXHJcbiAgICAgICAgICAgICAgICAgICAgJiYgcy5pbmRleE9mKCAnaXMnICkgPT09IDApXHJcbiAgICAgICAgICAgICAgICAgID8gVFtzXSggbXZhbHVlICkgPT09IG10ZXN0XHJcbiAgICAgICAgICAgICAgICAgICAgOiAoVFtzXSAmJiBULmlzRnVuY3Rpb24oIFRbc10gKSlcclxuICAgICAgICAgICAgICAgICAgPyBUW3NdKCBtdmFsdWUsIG10ZXN0ICkgOiAoZmFsc2UpXHJcbiAgICAgICAgICAgICAgICApO1xyXG4gICAgICAgICAgICAgICAgLypqc2xpbnQgZXFlcSA6IGZhbHNlICovXHJcbiAgICAgICAgICAgICAgICByID0gKHIgJiYgIXN1KSA/IGZhbHNlIDogKCFyICYmICFzdSkgPyB0cnVlIDogcjtcclxuXHJcbiAgICAgICAgICAgICAgICByZXR1cm4gcjtcclxuICAgICAgICAgICAgICB9O1xyXG4gICAgICAgICAgICAgIGMucHVzaCggbWF0Y2hGdW5jICk7XHJcblxyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgLy8gaWYgb25seSBvbmUgZmlsdGVyIGluIHRoZSBjb2xsZWN0aW9uIHB1c2ggaXQgb250byB0aGUgZmlsdGVyIGxpc3Qgd2l0aG91dCB0aGUgYXJyYXlcclxuICAgICAgICAgICAgaWYgKCBjLmxlbmd0aCA9PT0gMSApe1xyXG5cclxuICAgICAgICAgICAgICBuZi5wdXNoKCBjWzBdICk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgICAgLy8gZWxzZSBidWlsZCBhIGZ1bmN0aW9uIHRvIGxvb3Agb3ZlciBhbGwgdGhlIGZpbHRlcnMgYW5kIHJldHVybiB0cnVlIG9ubHkgaWYgQUxMIG1hdGNoXHJcbiAgICAgICAgICAgICAgLy8gdGhpcyBpcyBhIGxvZ2ljYWwgQU5EXHJcbiAgICAgICAgICAgICAgbmYucHVzaCggZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICAgICAgdmFyIHRoYXQgPSB0aGlzLCBtYXRjaCA9IGZhbHNlO1xyXG4gICAgICAgICAgICAgICAgZWFjaCggYywgZnVuY3Rpb24gKCBmICkge1xyXG4gICAgICAgICAgICAgICAgICBpZiAoIGYuYXBwbHkoIHRoYXQgKSApe1xyXG4gICAgICAgICAgICAgICAgICAgIG1hdGNoID0gdHJ1ZTtcclxuICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gbWF0Y2g7XHJcbiAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgIH0pO1xyXG4gICAgICAgIH0pO1xyXG4gICAgICAgIC8vIGZpbmFsbHkgcmV0dXJuIGEgc2luZ2xlIGZ1bmN0aW9uIHRoYXQgd3JhcHMgYWxsIHRoZSBvdGhlciBmdW5jdGlvbnMgYW5kIHdpbGwgcnVuIGEgcXVlcnlcclxuICAgICAgICAvLyB3aGVyZSBhbGwgZnVuY3Rpb25zIGhhdmUgdG8gcmV0dXJuIHRydWUgZm9yIGEgcmVjb3JkIHRvIGFwcGVhciBpbiBhIHF1ZXJ5IHJlc3VsdFxyXG4gICAgICAgIGYgPSBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICB2YXIgdGhhdCA9IHRoaXMsIG1hdGNoID0gdHJ1ZTtcclxuICAgICAgICAgIC8vIGZhc3RlciBpZiBsZXNzIHRoYW4gIDQgZnVuY3Rpb25zXHJcbiAgICAgICAgICBtYXRjaCA9IChuZi5sZW5ndGggPT09IDEgJiYgIW5mWzBdLmFwcGx5KCB0aGF0ICkpID8gZmFsc2UgOlxyXG4gICAgICAgICAgICAobmYubGVuZ3RoID09PSAyICYmXHJcbiAgICAgICAgICAgICAgKCFuZlswXS5hcHBseSggdGhhdCApIHx8ICFuZlsxXS5hcHBseSggdGhhdCApKSkgPyBmYWxzZSA6XHJcbiAgICAgICAgICAgICAgKG5mLmxlbmd0aCA9PT0gMyAmJlxyXG4gICAgICAgICAgICAgICAgKCFuZlswXS5hcHBseSggdGhhdCApIHx8ICFuZlsxXS5hcHBseSggdGhhdCApIHx8XHJcbiAgICAgICAgICAgICAgICAgICFuZlsyXS5hcHBseSggdGhhdCApKSkgPyBmYWxzZSA6XHJcbiAgICAgICAgICAgICAgICAobmYubGVuZ3RoID09PSA0ICYmXHJcbiAgICAgICAgICAgICAgICAgICghbmZbMF0uYXBwbHkoIHRoYXQgKSB8fCAhbmZbMV0uYXBwbHkoIHRoYXQgKSB8fFxyXG4gICAgICAgICAgICAgICAgICAgICFuZlsyXS5hcHBseSggdGhhdCApIHx8ICFuZlszXS5hcHBseSggdGhhdCApKSkgPyBmYWxzZVxyXG4gICAgICAgICAgICAgICAgICA6IHRydWU7XHJcbiAgICAgICAgICBpZiAoIG5mLmxlbmd0aCA+IDQgKXtcclxuICAgICAgICAgICAgZWFjaCggbmYsIGZ1bmN0aW9uICggZiApIHtcclxuICAgICAgICAgICAgICBpZiAoICFydW5GaWx0ZXJzKCB0aGF0LCBmICkgKXtcclxuICAgICAgICAgICAgICAgIG1hdGNoID0gZmFsc2U7XHJcbiAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICAgIH1cclxuICAgICAgICAgIHJldHVybiBtYXRjaDtcclxuICAgICAgICB9O1xyXG4gICAgICAgIHJldHVybiBmO1xyXG4gICAgICB9XHJcblxyXG4gICAgICAvLyBpZiBmdW5jdGlvblxyXG4gICAgICBpZiAoIFQuaXNGdW5jdGlvbiggZiApICl7XHJcbiAgICAgICAgcmV0dXJuIGY7XHJcbiAgICAgIH1cclxuICAgIH07XHJcblxyXG4gICAgb3JkZXJCeUNvbCA9IGZ1bmN0aW9uICggYXIsIG8gKSB7XHJcbiAgICAgIC8vICoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKipcclxuICAgICAgLy8gKlxyXG4gICAgICAvLyAqIFRha2VzOiB0YWtlcyBhbiBhcnJheSBhbmQgYSBzb3J0IG9iamVjdFxyXG4gICAgICAvLyAqIFJldHVybnM6IHRoZSBhcnJheSBzb3J0ZWRcclxuICAgICAgLy8gKiBQdXJwb3NlOiBBY2NlcHQgZmlsdGVycyBzdWNoIGFzIFwiW2NvbF0sIFtjb2wyXVwiIG9yIFwiW2NvbF0gZGVzY1wiIGFuZCBzb3J0IG9uIHRob3NlIGNvbHVtbnNcclxuICAgICAgLy8gKlxyXG4gICAgICAvLyAqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqXHJcblxyXG4gICAgICB2YXIgc29ydEZ1bmMgPSBmdW5jdGlvbiAoIGEsIGIgKSB7XHJcbiAgICAgICAgLy8gZnVuY3Rpb24gdG8gcGFzcyB0byB0aGUgbmF0aXZlIGFycmF5LnNvcnQgdG8gc29ydCBhbiBhcnJheVxyXG4gICAgICAgIHZhciByID0gMDtcclxuXHJcbiAgICAgICAgVC5lYWNoKCBvLCBmdW5jdGlvbiAoIHNkICkge1xyXG4gICAgICAgICAgLy8gbG9vcCBvdmVyIHRoZSBzb3J0IGluc3RydWN0aW9uc1xyXG4gICAgICAgICAgLy8gZ2V0IHRoZSBjb2x1bW4gbmFtZVxyXG4gICAgICAgICAgdmFyIG8sIGNvbCwgZGlyLCBjLCBkO1xyXG4gICAgICAgICAgbyA9IHNkLnNwbGl0KCAnICcgKTtcclxuICAgICAgICAgIGNvbCA9IG9bMF07XHJcblxyXG4gICAgICAgICAgLy8gZ2V0IHRoZSBkaXJlY3Rpb25cclxuICAgICAgICAgIGRpciA9IChvLmxlbmd0aCA9PT0gMSkgPyBcImxvZ2ljYWxcIiA6IG9bMV07XHJcblxyXG5cclxuICAgICAgICAgIGlmICggZGlyID09PSAnbG9naWNhbCcgKXtcclxuICAgICAgICAgICAgLy8gaWYgZGlyIGlzIGxvZ2ljYWwgdGhhbiBncmFiIHRoZSBjaGFybnVtIGFycmF5cyBmb3IgdGhlIHR3byB2YWx1ZXMgd2UgYXJlIGxvb2tpbmcgYXRcclxuICAgICAgICAgICAgYyA9IG51bWNoYXJzcGxpdCggYVtjb2xdICk7XHJcbiAgICAgICAgICAgIGQgPSBudW1jaGFyc3BsaXQoIGJbY29sXSApO1xyXG4gICAgICAgICAgICAvLyBsb29wIG92ZXIgdGhlIGNoYXJudW1hcnJheXMgdW50aWwgb25lIHZhbHVlIGlzIGhpZ2hlciB0aGFuIHRoZSBvdGhlclxyXG4gICAgICAgICAgICBULmVhY2goIChjLmxlbmd0aCA8PSBkLmxlbmd0aCkgPyBjIDogZCwgZnVuY3Rpb24gKCB4LCBpICkge1xyXG4gICAgICAgICAgICAgIGlmICggY1tpXSA8IGRbaV0gKXtcclxuICAgICAgICAgICAgICAgIHIgPSAtMTtcclxuICAgICAgICAgICAgICAgIHJldHVybiBUQUZGWS5FWElUO1xyXG4gICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICBlbHNlIGlmICggY1tpXSA+IGRbaV0gKXtcclxuICAgICAgICAgICAgICAgIHIgPSAxO1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIFRBRkZZLkVYSVQ7XHJcbiAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9ICk7XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgICBlbHNlIGlmICggZGlyID09PSAnbG9naWNhbGRlc2MnICl7XHJcbiAgICAgICAgICAgIC8vIGlmIGxvZ2ljYWxkZXNjIHRoYW4gZ3JhYiB0aGUgY2hhcm51bSBhcnJheXMgZm9yIHRoZSB0d28gdmFsdWVzIHdlIGFyZSBsb29raW5nIGF0XHJcbiAgICAgICAgICAgIGMgPSBudW1jaGFyc3BsaXQoIGFbY29sXSApO1xyXG4gICAgICAgICAgICBkID0gbnVtY2hhcnNwbGl0KCBiW2NvbF0gKTtcclxuICAgICAgICAgICAgLy8gbG9vcCBvdmVyIHRoZSBjaGFybnVtYXJyYXlzIHVudGlsIG9uZSB2YWx1ZSBpcyBsb3dlciB0aGFuIHRoZSBvdGhlclxyXG4gICAgICAgICAgICBULmVhY2goIChjLmxlbmd0aCA8PSBkLmxlbmd0aCkgPyBjIDogZCwgZnVuY3Rpb24gKCB4LCBpICkge1xyXG4gICAgICAgICAgICAgIGlmICggY1tpXSA+IGRbaV0gKXtcclxuICAgICAgICAgICAgICAgIHIgPSAtMTtcclxuICAgICAgICAgICAgICAgIHJldHVybiBUQUZGWS5FWElUO1xyXG4gICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICBlbHNlIGlmICggY1tpXSA8IGRbaV0gKXtcclxuICAgICAgICAgICAgICAgIHIgPSAxO1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIFRBRkZZLkVYSVQ7XHJcbiAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9ICk7XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgICBlbHNlIGlmICggZGlyID09PSAnYXNlYycgJiYgYVtjb2xdIDwgYltjb2xdICl7XHJcbiAgICAgICAgICAgIC8vIGlmIGFzZWMgLSBkZWZhdWx0IC0gY2hlY2sgdG8gc2VlIHdoaWNoIGlzIGhpZ2hlclxyXG4gICAgICAgICAgICByID0gLTE7XHJcbiAgICAgICAgICAgIHJldHVybiBULkVYSVQ7XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgICBlbHNlIGlmICggZGlyID09PSAnYXNlYycgJiYgYVtjb2xdID4gYltjb2xdICl7XHJcbiAgICAgICAgICAgIC8vIGlmIGFzZWMgLSBkZWZhdWx0IC0gY2hlY2sgdG8gc2VlIHdoaWNoIGlzIGhpZ2hlclxyXG4gICAgICAgICAgICByID0gMTtcclxuICAgICAgICAgICAgcmV0dXJuIFQuRVhJVDtcclxuICAgICAgICAgIH1cclxuICAgICAgICAgIGVsc2UgaWYgKCBkaXIgPT09ICdkZXNjJyAmJiBhW2NvbF0gPiBiW2NvbF0gKXtcclxuICAgICAgICAgICAgLy8gaWYgZGVzYyBjaGVjayB0byBzZWUgd2hpY2ggaXMgbG93ZXJcclxuICAgICAgICAgICAgciA9IC0xO1xyXG4gICAgICAgICAgICByZXR1cm4gVC5FWElUO1xyXG5cclxuICAgICAgICAgIH1cclxuICAgICAgICAgIGVsc2UgaWYgKCBkaXIgPT09ICdkZXNjJyAmJiBhW2NvbF0gPCBiW2NvbF0gKXtcclxuICAgICAgICAgICAgLy8gaWYgZGVzYyBjaGVjayB0byBzZWUgd2hpY2ggaXMgbG93ZXJcclxuICAgICAgICAgICAgciA9IDE7XHJcbiAgICAgICAgICAgIHJldHVybiBULkVYSVQ7XHJcblxyXG4gICAgICAgICAgfVxyXG4gICAgICAgICAgLy8gaWYgciBpcyBzdGlsbCAwIGFuZCB3ZSBhcmUgZG9pbmcgYSBsb2dpY2FsIHNvcnQgdGhhbiBsb29rIHRvIHNlZSBpZiBvbmUgYXJyYXkgaXMgbG9uZ2VyIHRoYW4gdGhlIG90aGVyXHJcbiAgICAgICAgICBpZiAoIHIgPT09IDAgJiYgZGlyID09PSAnbG9naWNhbCcgJiYgYy5sZW5ndGggPCBkLmxlbmd0aCApe1xyXG4gICAgICAgICAgICByID0gLTE7XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgICBlbHNlIGlmICggciA9PT0gMCAmJiBkaXIgPT09ICdsb2dpY2FsJyAmJiBjLmxlbmd0aCA+IGQubGVuZ3RoICl7XHJcbiAgICAgICAgICAgIHIgPSAxO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgICAgZWxzZSBpZiAoIHIgPT09IDAgJiYgZGlyID09PSAnbG9naWNhbGRlc2MnICYmIGMubGVuZ3RoID4gZC5sZW5ndGggKXtcclxuICAgICAgICAgICAgciA9IC0xO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgICAgZWxzZSBpZiAoIHIgPT09IDAgJiYgZGlyID09PSAnbG9naWNhbGRlc2MnICYmIGMubGVuZ3RoIDwgZC5sZW5ndGggKXtcclxuICAgICAgICAgICAgciA9IDE7XHJcbiAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgaWYgKCByICE9PSAwICl7XHJcbiAgICAgICAgICAgIHJldHVybiBULkVYSVQ7XHJcbiAgICAgICAgICB9XHJcblxyXG5cclxuICAgICAgICB9ICk7XHJcbiAgICAgICAgcmV0dXJuIHI7XHJcbiAgICAgIH07XHJcbiAgICAgIC8vIGNhbGwgdGhlIHNvcnQgZnVuY3Rpb24gYW5kIHJldHVybiB0aGUgbmV3bHkgc29ydGVkIGFycmF5XHJcbiAgICAgIHJldHVybiAoYXIgJiYgYXIucHVzaCkgPyBhci5zb3J0KCBzb3J0RnVuYyApIDogYXI7XHJcblxyXG5cclxuICAgIH07XHJcblxyXG4gICAgLy8gKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKlxyXG4gICAgLy8gKlxyXG4gICAgLy8gKiBUYWtlczogYSBzdHJpbmcgY29udGFpbmluZyBudW1iZXJzIGFuZCBsZXR0ZXJzIGFuZCB0dXJuIGl0IGludG8gYW4gYXJyYXlcclxuICAgIC8vICogUmV0dXJuczogcmV0dXJuIGFuIGFycmF5IG9mIG51bWJlcnMgYW5kIGxldHRlcnNcclxuICAgIC8vICogUHVycG9zZTogVXNlZCBmb3IgbG9naWNhbCBzb3J0aW5nLiBTdHJpbmcgRXhhbXBsZTogMTJBQkMgcmVzdWx0czogWzEyLCdBQkMnXVxyXG4gICAgLy8gKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKiBcclxuICAgIChmdW5jdGlvbiAoKSB7XHJcbiAgICAgIC8vIGNyZWF0ZXMgYSBjYWNoZSBmb3IgbnVtY2hhciBjb252ZXJzaW9uc1xyXG4gICAgICB2YXIgY2FjaGUgPSB7fSwgY2FjaGNvdW50ZXIgPSAwO1xyXG4gICAgICAvLyBjcmVhdGVzIHRoZSBudW1jaGFyc3BsaXQgZnVuY3Rpb25cclxuICAgICAgbnVtY2hhcnNwbGl0ID0gZnVuY3Rpb24gKCB0aGluZyApIHtcclxuICAgICAgICAvLyBpZiBvdmVyIDEwMDAgaXRlbXMgZXhpc3QgaW4gdGhlIGNhY2hlLCBjbGVhciBpdCBhbmQgc3RhcnQgb3ZlclxyXG4gICAgICAgIGlmICggY2FjaGNvdW50ZXIgPiBjbWF4ICl7XHJcbiAgICAgICAgICBjYWNoZSA9IHt9O1xyXG4gICAgICAgICAgY2FjaGNvdW50ZXIgPSAwO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLy8gaWYgYSBjYWNoZSBjYW4gYmUgZm91bmQgZm9yIGEgbnVtY2hhciB0aGVuIHJldHVybiBpdHMgYXJyYXkgdmFsdWVcclxuICAgICAgICByZXR1cm4gY2FjaGVbJ18nICsgdGhpbmddIHx8IChmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAvLyBvdGhlcndpc2UgZG8gdGhlIGNvbnZlcnNpb25cclxuICAgICAgICAgIC8vIG1ha2Ugc3VyZSBpdCBpcyBhIHN0cmluZyBhbmQgc2V0dXAgc28gb3RoZXIgdmFyaWFibGVzXHJcbiAgICAgICAgICB2YXIgbnRoaW5nID0gU3RyaW5nKCB0aGluZyApLFxyXG4gICAgICAgICAgICBuYSA9IFtdLFxyXG4gICAgICAgICAgICBydiA9ICdfJyxcclxuICAgICAgICAgICAgcnQgPSAnJyxcclxuICAgICAgICAgICAgeCwgeHgsIGM7XHJcblxyXG4gICAgICAgICAgLy8gbG9vcCBvdmVyIHRoZSBzdHJpbmcgY2hhciBieSBjaGFyXHJcbiAgICAgICAgICBmb3IgKCB4ID0gMCwgeHggPSBudGhpbmcubGVuZ3RoOyB4IDwgeHg7IHgrKyApe1xyXG4gICAgICAgICAgICAvLyB0YWtlIHRoZSBjaGFyIGF0IGVhY2ggbG9jYXRpb25cclxuICAgICAgICAgICAgYyA9IG50aGluZy5jaGFyQ29kZUF0KCB4ICk7XHJcbiAgICAgICAgICAgIC8vIGNoZWNrIHRvIHNlZSBpZiBpdCBpcyBhIHZhbGlkIG51bWJlciBjaGFyIGFuZCBhcHBlbmQgaXQgdG8gdGhlIGFycmF5LlxyXG4gICAgICAgICAgICAvLyBpZiBsYXN0IGNoYXIgd2FzIGEgc3RyaW5nIHB1c2ggdGhlIHN0cmluZyB0byB0aGUgY2hhcm51bSBhcnJheVxyXG4gICAgICAgICAgICBpZiAoICggYyA+PSA0OCAmJiBjIDw9IDU3ICkgfHwgYyA9PT0gNDYgKXtcclxuICAgICAgICAgICAgICBpZiAoIHJ0ICE9PSAnbicgKXtcclxuICAgICAgICAgICAgICAgIHJ0ID0gJ24nO1xyXG4gICAgICAgICAgICAgICAgbmEucHVzaCggcnYudG9Mb3dlckNhc2UoKSApO1xyXG4gICAgICAgICAgICAgICAgcnYgPSAnJztcclxuICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgcnYgPSBydiArIG50aGluZy5jaGFyQXQoIHggKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgICAvLyBjaGVjayB0byBzZWUgaWYgaXQgaXMgYSB2YWxpZCBzdHJpbmcgY2hhciBhbmQgYXBwZW5kIHRvIHN0cmluZ1xyXG4gICAgICAgICAgICAgIC8vIGlmIGxhc3QgY2hhciB3YXMgYSBudW1iZXIgcHVzaCB0aGUgd2hvbGUgbnVtYmVyIHRvIHRoZSBjaGFybnVtIGFycmF5XHJcbiAgICAgICAgICAgICAgaWYgKCBydCAhPT0gJ3MnICl7XHJcbiAgICAgICAgICAgICAgICBydCA9ICdzJztcclxuICAgICAgICAgICAgICAgIG5hLnB1c2goIHBhcnNlRmxvYXQoIHJ2ICkgKTtcclxuICAgICAgICAgICAgICAgIHJ2ID0gJyc7XHJcbiAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgIHJ2ID0gcnYgKyBudGhpbmcuY2hhckF0KCB4ICk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgIH1cclxuICAgICAgICAgIC8vIG9uY2UgZG9uZSwgcHVzaCB0aGUgbGFzdCB2YWx1ZSB0byB0aGUgY2hhcm51bSBhcnJheSBhbmQgcmVtb3ZlIHRoZSBmaXJzdCB1bmVlZGVkIGl0ZW1cclxuICAgICAgICAgIG5hLnB1c2goIChydCA9PT0gJ24nKSA/IHBhcnNlRmxvYXQoIHJ2ICkgOiBydi50b0xvd2VyQ2FzZSgpICk7XHJcbiAgICAgICAgICBuYS5zaGlmdCgpO1xyXG4gICAgICAgICAgLy8gYWRkIHRvIGNhY2hlXHJcbiAgICAgICAgICBjYWNoZVsnXycgKyB0aGluZ10gPSBuYTtcclxuICAgICAgICAgIGNhY2hjb3VudGVyKys7XHJcbiAgICAgICAgICAvLyByZXR1cm4gY2hhcm51bSBhcnJheVxyXG4gICAgICAgICAgcmV0dXJuIG5hO1xyXG4gICAgICAgIH0oKSk7XHJcbiAgICAgIH07XHJcbiAgICB9KCkpO1xyXG5cclxuICAgIC8vICoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKipcclxuICAgIC8vICpcclxuICAgIC8vICogUnVucyBhIHF1ZXJ5XHJcbiAgICAvLyAqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqIFxyXG5cclxuXHJcbiAgICBydW4gPSBmdW5jdGlvbiAoKSB7XHJcbiAgICAgIHRoaXMuY29udGV4dCgge1xyXG4gICAgICAgIHJlc3VsdHMgOiB0aGlzLmdldERCSSgpLnF1ZXJ5KCB0aGlzLmNvbnRleHQoKSApXHJcbiAgICAgIH0pO1xyXG5cclxuICAgIH07XHJcblxyXG4gICAgQVBJLmV4dGVuZCggJ2ZpbHRlcicsIGZ1bmN0aW9uICgpIHtcclxuICAgICAgLy8gKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKlxyXG4gICAgICAvLyAqXHJcbiAgICAgIC8vICogVGFrZXM6IHRha2VzIHVubGltaXRlZCBmaWx0ZXIgb2JqZWN0cyBhcyBhcmd1bWVudHNcclxuICAgICAgLy8gKiBSZXR1cm5zOiBtZXRob2QgY29sbGVjdGlvblxyXG4gICAgICAvLyAqIFB1cnBvc2U6IFRha2UgZmlsdGVycyBhcyBvYmplY3RzIGFuZCBjYWNoZSBmdW5jdGlvbnMgZm9yIGxhdGVyIGxvb2t1cCB3aGVuIGEgcXVlcnkgaXMgcnVuXHJcbiAgICAgIC8vICoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKiogXHJcbiAgICAgIHZhclxyXG4gICAgICAgIG5jID0gVEFGRlkubWVyZ2VPYmooIHRoaXMuY29udGV4dCgpLCB7IHJ1biA6IG51bGwgfSApLFxyXG4gICAgICAgIG5xID0gW11cclxuICAgICAgO1xyXG4gICAgICBlYWNoKCBuYy5xLCBmdW5jdGlvbiAoIHYgKSB7XHJcbiAgICAgICAgbnEucHVzaCggdiApO1xyXG4gICAgICB9KTtcclxuICAgICAgbmMucSA9IG5xO1xyXG4gICAgICAvLyBIYWRubGUgcGFzc2luZyBvZiBfX19JRCBvciBhIHJlY29yZCBvbiBsb29rdXAuXHJcbiAgICAgIGVhY2goIGFyZ3VtZW50cywgZnVuY3Rpb24gKCBmICkge1xyXG4gICAgICAgIG5jLnEucHVzaCggcmV0dXJuRmlsdGVyKCBmICkgKTtcclxuICAgICAgICBuYy5maWx0ZXJSYXcucHVzaCggZiApO1xyXG4gICAgICB9KTtcclxuXHJcbiAgICAgIHJldHVybiB0aGlzLmdldHJvb3QoIG5jICk7XHJcbiAgICB9KTtcclxuXHJcbiAgICBBUEkuZXh0ZW5kKCAnb3JkZXInLCBmdW5jdGlvbiAoIG8gKSB7XHJcbiAgICAgIC8vICoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKipcclxuICAgICAgLy8gKlxyXG4gICAgICAvLyAqIFB1cnBvc2U6IHRha2VzIGEgc3RyaW5nIGFuZCBjcmVhdGVzIGFuIGFycmF5IG9mIG9yZGVyIGluc3RydWN0aW9ucyB0byBiZSB1c2VkIHdpdGggYSBxdWVyeVxyXG4gICAgICAvLyAqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqXHJcblxyXG4gICAgICBvID0gby5zcGxpdCggJywnICk7XHJcbiAgICAgIHZhciB4ID0gW10sIG5jO1xyXG5cclxuICAgICAgZWFjaCggbywgZnVuY3Rpb24gKCByICkge1xyXG4gICAgICAgIHgucHVzaCggci5yZXBsYWNlKCAvXlxccyovLCAnJyApLnJlcGxhY2UoIC9cXHMqJC8sICcnICkgKTtcclxuICAgICAgfSk7XHJcblxyXG4gICAgICBuYyA9IFRBRkZZLm1lcmdlT2JqKCB0aGlzLmNvbnRleHQoKSwge3NvcnQgOiBudWxsfSApO1xyXG4gICAgICBuYy5vcmRlciA9IHg7XHJcblxyXG4gICAgICByZXR1cm4gdGhpcy5nZXRyb290KCBuYyApO1xyXG4gICAgfSk7XHJcblxyXG4gICAgQVBJLmV4dGVuZCggJ2xpbWl0JywgZnVuY3Rpb24gKCBuICkge1xyXG4gICAgICAvLyAqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqXHJcbiAgICAgIC8vICpcclxuICAgICAgLy8gKiBQdXJwb3NlOiB0YWtlcyBhIGxpbWl0IG51bWJlciB0byBsaW1pdCB0aGUgbnVtYmVyIG9mIHJvd3MgcmV0dXJuZWQgYnkgYSBxdWVyeS4gV2lsbCB1cGRhdGUgdGhlIHJlc3VsdHNcclxuICAgICAgLy8gKiBvZiBhIHF1ZXJ5XHJcbiAgICAgIC8vICoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKiogXHJcbiAgICAgIHZhciBuYyA9IFRBRkZZLm1lcmdlT2JqKCB0aGlzLmNvbnRleHQoKSwge30pLFxyXG4gICAgICAgIGxpbWl0ZWRyZXN1bHRzXHJcbiAgICAgICAgO1xyXG5cclxuICAgICAgbmMubGltaXQgPSBuO1xyXG5cclxuICAgICAgaWYgKCBuYy5ydW4gJiYgbmMuc29ydCApe1xyXG4gICAgICAgIGxpbWl0ZWRyZXN1bHRzID0gW107XHJcbiAgICAgICAgZWFjaCggbmMucmVzdWx0cywgZnVuY3Rpb24gKCBpLCB4ICkge1xyXG4gICAgICAgICAgaWYgKCAoeCArIDEpID4gbiApe1xyXG4gICAgICAgICAgICByZXR1cm4gVEFGRlkuRVhJVDtcclxuICAgICAgICAgIH1cclxuICAgICAgICAgIGxpbWl0ZWRyZXN1bHRzLnB1c2goIGkgKTtcclxuICAgICAgICB9KTtcclxuICAgICAgICBuYy5yZXN1bHRzID0gbGltaXRlZHJlc3VsdHM7XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIHJldHVybiB0aGlzLmdldHJvb3QoIG5jICk7XHJcbiAgICB9KTtcclxuXHJcbiAgICBBUEkuZXh0ZW5kKCAnc3RhcnQnLCBmdW5jdGlvbiAoIG4gKSB7XHJcbiAgICAgIC8vICoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKipcclxuICAgICAgLy8gKlxyXG4gICAgICAvLyAqIFB1cnBvc2U6IHRha2VzIGEgbGltaXQgbnVtYmVyIHRvIGxpbWl0IHRoZSBudW1iZXIgb2Ygcm93cyByZXR1cm5lZCBieSBhIHF1ZXJ5LiBXaWxsIHVwZGF0ZSB0aGUgcmVzdWx0c1xyXG4gICAgICAvLyAqIG9mIGEgcXVlcnlcclxuICAgICAgLy8gKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKiBcclxuICAgICAgdmFyIG5jID0gVEFGRlkubWVyZ2VPYmooIHRoaXMuY29udGV4dCgpLCB7fSApLFxyXG4gICAgICAgIGxpbWl0ZWRyZXN1bHRzXHJcbiAgICAgICAgO1xyXG5cclxuICAgICAgbmMuc3RhcnQgPSBuO1xyXG5cclxuICAgICAgaWYgKCBuYy5ydW4gJiYgbmMuc29ydCAmJiAhbmMubGltaXQgKXtcclxuICAgICAgICBsaW1pdGVkcmVzdWx0cyA9IFtdO1xyXG4gICAgICAgIGVhY2goIG5jLnJlc3VsdHMsIGZ1bmN0aW9uICggaSwgeCApIHtcclxuICAgICAgICAgIGlmICggKHggKyAxKSA+IG4gKXtcclxuICAgICAgICAgICAgbGltaXRlZHJlc3VsdHMucHVzaCggaSApO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgIH0pO1xyXG4gICAgICAgIG5jLnJlc3VsdHMgPSBsaW1pdGVkcmVzdWx0cztcclxuICAgICAgfVxyXG4gICAgICBlbHNlIHtcclxuICAgICAgICBuYyA9IFRBRkZZLm1lcmdlT2JqKCB0aGlzLmNvbnRleHQoKSwge3J1biA6IG51bGwsIHN0YXJ0IDogbn0gKTtcclxuICAgICAgfVxyXG5cclxuICAgICAgcmV0dXJuIHRoaXMuZ2V0cm9vdCggbmMgKTtcclxuICAgIH0pO1xyXG5cclxuICAgIEFQSS5leHRlbmQoICd1cGRhdGUnLCBmdW5jdGlvbiAoIGFyZzAsIGFyZzEsIGFyZzIgKSB7XHJcbiAgICAgIC8vICoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKipcclxuICAgICAgLy8gKlxyXG4gICAgICAvLyAqIFRha2VzOiBhIG9iamVjdCBhbmQgcGFzc2VzIGl0IG9mZiBEQkkgdXBkYXRlIG1ldGhvZCBmb3IgYWxsIG1hdGNoZWQgcmVjb3Jkc1xyXG4gICAgICAvLyAqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqIFxyXG4gICAgICB2YXIgcnVuRXZlbnQgPSB0cnVlLCBvID0ge30sIGFyZ3MgPSBhcmd1bWVudHMsIHRoYXQ7XHJcbiAgICAgIGlmICggVEFGRlkuaXNTdHJpbmcoIGFyZzAgKSAmJlxyXG4gICAgICAgIChhcmd1bWVudHMubGVuZ3RoID09PSAyIHx8IGFyZ3VtZW50cy5sZW5ndGggPT09IDMpIClcclxuICAgICAge1xyXG4gICAgICAgIG9bYXJnMF0gPSBhcmcxO1xyXG4gICAgICAgIGlmICggYXJndW1lbnRzLmxlbmd0aCA9PT0gMyApe1xyXG4gICAgICAgICAgcnVuRXZlbnQgPSBhcmcyO1xyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG4gICAgICBlbHNlIHtcclxuICAgICAgICBvID0gYXJnMDtcclxuICAgICAgICBpZiAoIGFyZ3MubGVuZ3RoID09PSAyICl7XHJcbiAgICAgICAgICBydW5FdmVudCA9IGFyZzE7XHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcblxyXG4gICAgICB0aGF0ID0gdGhpcztcclxuICAgICAgcnVuLmNhbGwoIHRoaXMgKTtcclxuICAgICAgZWFjaCggdGhpcy5jb250ZXh0KCkucmVzdWx0cywgZnVuY3Rpb24gKCByICkge1xyXG4gICAgICAgIHZhciBjID0gbztcclxuICAgICAgICBpZiAoIFRBRkZZLmlzRnVuY3Rpb24oIGMgKSApe1xyXG4gICAgICAgICAgYyA9IGMuYXBwbHkoIFRBRkZZLm1lcmdlT2JqKCByLCB7fSApICk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgaWYgKCBULmlzRnVuY3Rpb24oIGMgKSApe1xyXG4gICAgICAgICAgICBjID0gYyggVEFGRlkubWVyZ2VPYmooIHIsIHt9ICkgKTtcclxuICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKCBUQUZGWS5pc09iamVjdCggYyApICl7XHJcbiAgICAgICAgICB0aGF0LmdldERCSSgpLnVwZGF0ZSggci5fX19pZCwgYywgcnVuRXZlbnQgKTtcclxuICAgICAgICB9XHJcbiAgICAgIH0pO1xyXG4gICAgICBpZiAoIHRoaXMuY29udGV4dCgpLnJlc3VsdHMubGVuZ3RoICl7XHJcbiAgICAgICAgdGhpcy5jb250ZXh0KCB7IHJ1biA6IG51bGwgfSk7XHJcbiAgICAgIH1cclxuICAgICAgcmV0dXJuIHRoaXM7XHJcbiAgICB9KTtcclxuICAgIEFQSS5leHRlbmQoICdyZW1vdmUnLCBmdW5jdGlvbiAoIHJ1bkV2ZW50ICkge1xyXG4gICAgICAvLyAqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqXHJcbiAgICAgIC8vICpcclxuICAgICAgLy8gKiBQdXJwb3NlOiByZW1vdmVzIHJlY29yZHMgZnJvbSB0aGUgREIgdmlhIHRoZSByZW1vdmUgYW5kIHJlbW92ZUNvbW1pdCBEQkkgbWV0aG9kc1xyXG4gICAgICAvLyAqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqIFxyXG4gICAgICB2YXIgdGhhdCA9IHRoaXMsIGMgPSAwO1xyXG4gICAgICBydW4uY2FsbCggdGhpcyApO1xyXG4gICAgICBlYWNoKCB0aGlzLmNvbnRleHQoKS5yZXN1bHRzLCBmdW5jdGlvbiAoIHIgKSB7XHJcbiAgICAgICAgdGhhdC5nZXREQkkoKS5yZW1vdmUoIHIuX19faWQgKTtcclxuICAgICAgICBjKys7XHJcbiAgICAgIH0pO1xyXG4gICAgICBpZiAoIHRoaXMuY29udGV4dCgpLnJlc3VsdHMubGVuZ3RoICl7XHJcbiAgICAgICAgdGhpcy5jb250ZXh0KCB7XHJcbiAgICAgICAgICBydW4gOiBudWxsXHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgdGhhdC5nZXREQkkoKS5yZW1vdmVDb21taXQoIHJ1bkV2ZW50ICk7XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIHJldHVybiBjO1xyXG4gICAgfSk7XHJcblxyXG5cclxuICAgIEFQSS5leHRlbmQoICdjb3VudCcsIGZ1bmN0aW9uICgpIHtcclxuICAgICAgLy8gKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKlxyXG4gICAgICAvLyAqXHJcbiAgICAgIC8vICogUmV0dXJuczogVGhlIGxlbmd0aCBvZiBhIHF1ZXJ5IHJlc3VsdFxyXG4gICAgICAvLyAqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqIFxyXG4gICAgICBydW4uY2FsbCggdGhpcyApO1xyXG4gICAgICByZXR1cm4gdGhpcy5jb250ZXh0KCkucmVzdWx0cy5sZW5ndGg7XHJcbiAgICB9KTtcclxuXHJcbiAgICBBUEkuZXh0ZW5kKCAnY2FsbGJhY2snLCBmdW5jdGlvbiAoIGYsIGRlbGF5ICkge1xyXG4gICAgICAvLyAqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqXHJcbiAgICAgIC8vICpcclxuICAgICAgLy8gKiBSZXR1cm5zIG51bGw7XHJcbiAgICAgIC8vICogUnVucyBhIGZ1bmN0aW9uIG9uIHJldHVybiBvZiBydW4uY2FsbFxyXG4gICAgICAvLyAqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqIFxyXG4gICAgICBpZiAoIGYgKXtcclxuICAgICAgICB2YXIgdGhhdCA9IHRoaXM7XHJcbiAgICAgICAgc2V0VGltZW91dCggZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgcnVuLmNhbGwoIHRoYXQgKTtcclxuICAgICAgICAgIGYuY2FsbCggdGhhdC5nZXRyb290KCB0aGF0LmNvbnRleHQoKSApICk7XHJcbiAgICAgICAgfSwgZGVsYXkgfHwgMCApO1xyXG4gICAgICB9XHJcblxyXG5cclxuICAgICAgcmV0dXJuIG51bGw7XHJcbiAgICB9KTtcclxuXHJcbiAgICBBUEkuZXh0ZW5kKCAnZ2V0JywgZnVuY3Rpb24gKCkge1xyXG4gICAgICAvLyAqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqXHJcbiAgICAgIC8vICpcclxuICAgICAgLy8gKiBSZXR1cm5zOiBBbiBhcnJheSBvZiBhbGwgbWF0Y2hpbmcgcmVjb3Jkc1xyXG4gICAgICAvLyAqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqIFxyXG4gICAgICBydW4uY2FsbCggdGhpcyApO1xyXG4gICAgICByZXR1cm4gdGhpcy5jb250ZXh0KCkucmVzdWx0cztcclxuICAgIH0pO1xyXG5cclxuICAgIEFQSS5leHRlbmQoICdzdHJpbmdpZnknLCBmdW5jdGlvbiAoKSB7XHJcbiAgICAgIC8vICoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKipcclxuICAgICAgLy8gKlxyXG4gICAgICAvLyAqIFJldHVybnM6IEFuIEpTT04gc3RyaW5nIG9mIGFsbCBtYXRjaGluZyByZWNvcmRzXHJcbiAgICAgIC8vICoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKiogXHJcbiAgICAgIHJldHVybiBKU09OLnN0cmluZ2lmeSggdGhpcy5nZXQoKSApO1xyXG4gICAgfSk7XHJcbiAgICBBUEkuZXh0ZW5kKCAnZmlyc3QnLCBmdW5jdGlvbiAoKSB7XHJcbiAgICAgIC8vICoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKipcclxuICAgICAgLy8gKlxyXG4gICAgICAvLyAqIFJldHVybnM6IFRoZSBmaXJzdCBtYXRjaGluZyByZWNvcmRcclxuICAgICAgLy8gKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKiBcclxuICAgICAgcnVuLmNhbGwoIHRoaXMgKTtcclxuICAgICAgcmV0dXJuIHRoaXMuY29udGV4dCgpLnJlc3VsdHNbMF0gfHwgZmFsc2U7XHJcbiAgICB9KTtcclxuICAgIEFQSS5leHRlbmQoICdsYXN0JywgZnVuY3Rpb24gKCkge1xyXG4gICAgICAvLyAqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqXHJcbiAgICAgIC8vICpcclxuICAgICAgLy8gKiBSZXR1cm5zOiBUaGUgbGFzdCBtYXRjaGluZyByZWNvcmRcclxuICAgICAgLy8gKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKiBcclxuICAgICAgcnVuLmNhbGwoIHRoaXMgKTtcclxuICAgICAgcmV0dXJuIHRoaXMuY29udGV4dCgpLnJlc3VsdHNbdGhpcy5jb250ZXh0KCkucmVzdWx0cy5sZW5ndGggLSAxXSB8fFxyXG4gICAgICAgIGZhbHNlO1xyXG4gICAgfSk7XHJcblxyXG5cclxuICAgIEFQSS5leHRlbmQoICdzdW0nLCBmdW5jdGlvbiAoKSB7XHJcbiAgICAgIC8vICoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKipcclxuICAgICAgLy8gKlxyXG4gICAgICAvLyAqIFRha2VzOiBjb2x1bW4gdG8gc3VtIHVwXHJcbiAgICAgIC8vICogUmV0dXJuczogU3VtcyB0aGUgdmFsdWVzIG9mIGEgY29sdW1uXHJcbiAgICAgIC8vICoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKiogXHJcbiAgICAgIHZhciB0b3RhbCA9IDAsIHRoYXQgPSB0aGlzO1xyXG4gICAgICBydW4uY2FsbCggdGhhdCApO1xyXG4gICAgICBlYWNoKCBhcmd1bWVudHMsIGZ1bmN0aW9uICggYyApIHtcclxuICAgICAgICBlYWNoKCB0aGF0LmNvbnRleHQoKS5yZXN1bHRzLCBmdW5jdGlvbiAoIHIgKSB7XHJcbiAgICAgICAgICB0b3RhbCA9IHRvdGFsICsgKHJbY10gfHwgMCk7XHJcbiAgICAgICAgfSk7XHJcbiAgICAgIH0pO1xyXG4gICAgICByZXR1cm4gdG90YWw7XHJcbiAgICB9KTtcclxuXHJcbiAgICBBUEkuZXh0ZW5kKCAnbWluJywgZnVuY3Rpb24gKCBjICkge1xyXG4gICAgICAvLyAqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqXHJcbiAgICAgIC8vICpcclxuICAgICAgLy8gKiBUYWtlczogY29sdW1uIHRvIGZpbmQgbWluXHJcbiAgICAgIC8vICogUmV0dXJuczogdGhlIGxvd2VzdCB2YWx1ZVxyXG4gICAgICAvLyAqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqIFxyXG4gICAgICB2YXIgbG93ZXN0ID0gbnVsbDtcclxuICAgICAgcnVuLmNhbGwoIHRoaXMgKTtcclxuICAgICAgZWFjaCggdGhpcy5jb250ZXh0KCkucmVzdWx0cywgZnVuY3Rpb24gKCByICkge1xyXG4gICAgICAgIGlmICggbG93ZXN0ID09PSBudWxsIHx8IHJbY10gPCBsb3dlc3QgKXtcclxuICAgICAgICAgIGxvd2VzdCA9IHJbY107XHJcbiAgICAgICAgfVxyXG4gICAgICB9KTtcclxuICAgICAgcmV0dXJuIGxvd2VzdDtcclxuICAgIH0pO1xyXG5cclxuICAgIC8vICBUYWZmeSBpbm5lckpvaW4gRXh0ZW5zaW9uIChPQ0QgZWRpdGlvbilcclxuICAgIC8vICA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cclxuICAgIC8vXHJcbiAgICAvLyAgSG93IHRvIFVzZVxyXG4gICAgLy8gICoqKioqKioqKipcclxuICAgIC8vXHJcbiAgICAvLyAgbGVmdF90YWJsZS5pbm5lckpvaW4oIHJpZ2h0X3RhYmxlLCBjb25kaXRpb24xIDwsLi4uIGNvbmRpdGlvbk4+IClcclxuICAgIC8vXHJcbiAgICAvLyAgQSBjb25kaXRpb24gY2FuIHRha2Ugb25lIG9mIDIgZm9ybXM6XHJcbiAgICAvL1xyXG4gICAgLy8gICAgMS4gQW4gQVJSQVkgd2l0aCAyIG9yIDMgdmFsdWVzOlxyXG4gICAgLy8gICAgQSBjb2x1bW4gbmFtZSBmcm9tIHRoZSBsZWZ0IHRhYmxlLCBhbiBvcHRpb25hbCBjb21wYXJpc29uIHN0cmluZyxcclxuICAgIC8vICAgIGFuZCBjb2x1bW4gbmFtZSBmcm9tIHRoZSByaWdodCB0YWJsZS4gIFRoZSBjb25kaXRpb24gcGFzc2VzIGlmIHRoZSB0ZXN0XHJcbiAgICAvLyAgICBpbmRpY2F0ZWQgaXMgdHJ1ZS4gICBJZiB0aGUgY29uZGl0aW9uIHN0cmluZyBpcyBvbWl0dGVkLCAnPT09JyBpcyBhc3N1bWVkLlxyXG4gICAgLy8gICAgRVhBTVBMRVM6IFsgJ2xhc3RfdXNlZF90aW1lJywgJz49JywgJ2N1cnJlbnRfdXNlX3RpbWUnIF0sIFsgJ3VzZXJfaWQnLCdpZCcgXVxyXG4gICAgLy9cclxuICAgIC8vICAgIDIuIEEgRlVOQ1RJT046XHJcbiAgICAvLyAgICBUaGUgZnVuY3Rpb24gcmVjZWl2ZXMgYSBsZWZ0IHRhYmxlIHJvdyBhbmQgcmlnaHQgdGFibGUgcm93IGR1cmluZyB0aGVcclxuICAgIC8vICAgIGNhcnRlc2lhbiBqb2luLiAgSWYgdGhlIGZ1bmN0aW9uIHJldHVybnMgdHJ1ZSBmb3IgdGhlIHJvd3MgY29uc2lkZXJlZCxcclxuICAgIC8vICAgIHRoZSBtZXJnZWQgcm93IGlzIGluY2x1ZGVkIGluIHRoZSByZXN1bHQgc2V0LlxyXG4gICAgLy8gICAgRVhBTVBMRTogZnVuY3Rpb24gKGwscil7IHJldHVybiBsLm5hbWUgPT09IHIubGFiZWw7IH1cclxuICAgIC8vXHJcbiAgICAvLyAgQ29uZGl0aW9ucyBhcmUgY29uc2lkZXJlZCBpbiB0aGUgb3JkZXIgdGhleSBhcmUgcHJlc2VudGVkLiAgVGhlcmVmb3JlIHRoZSBiZXN0XHJcbiAgICAvLyAgcGVyZm9ybWFuY2UgaXMgcmVhbGl6ZWQgd2hlbiB0aGUgbGVhc3QgZXhwZW5zaXZlIGFuZCBoaWdoZXN0IHBydW5lLXJhdGVcclxuICAgIC8vICBjb25kaXRpb25zIGFyZSBwbGFjZWQgZmlyc3QsIHNpbmNlIGlmIHRoZXkgcmV0dXJuIGZhbHNlIFRhZmZ5IHNraXBzIGFueVxyXG4gICAgLy8gIGZ1cnRoZXIgY29uZGl0aW9uIHRlc3RzLlxyXG4gICAgLy9cclxuICAgIC8vICBPdGhlciBub3Rlc1xyXG4gICAgLy8gICoqKioqKioqKioqXHJcbiAgICAvL1xyXG4gICAgLy8gIFRoaXMgY29kZSBwYXNzZXMganNsaW50IHdpdGggdGhlIGV4Y2VwdGlvbiBvZiAyIHdhcm5pbmdzIGFib3V0XHJcbiAgICAvLyAgdGhlICc9PScgYW5kICchPScgbGluZXMuICBXZSBjYW4ndCBkbyBhbnl0aGluZyBhYm91dCB0aGF0IHNob3J0IG9mXHJcbiAgICAvLyAgZGVsZXRpbmcgdGhlIGxpbmVzLlxyXG4gICAgLy9cclxuICAgIC8vICBDcmVkaXRzXHJcbiAgICAvLyAgKioqKioqKlxyXG4gICAgLy9cclxuICAgIC8vICBIZWF2aWx5IGJhc2VkIHVwb24gdGhlIHdvcmsgb2YgSWFuIFRvbHR6LlxyXG4gICAgLy8gIFJldmlzaW9ucyB0byBBUEkgYnkgTWljaGFlbCBNaWtvd3NraS5cclxuICAgIC8vICBDb2RlIGNvbnZlbnRpb24gcGVyIHN0YW5kYXJkcyBpbiBodHRwOi8vbWFubmluZy5jb20vbWlrb3dza2lcclxuICAgIChmdW5jdGlvbiAoKSB7XHJcbiAgICAgIHZhciBpbm5lckpvaW5GdW5jdGlvbiA9IChmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgdmFyIGZuQ29tcGFyZUxpc3QsIGZuQ29tYmluZVJvdywgZm5NYWluO1xyXG5cclxuICAgICAgICBmbkNvbXBhcmVMaXN0ID0gZnVuY3Rpb24gKCBsZWZ0X3JvdywgcmlnaHRfcm93LCBhcmdfbGlzdCApIHtcclxuICAgICAgICAgIHZhciBkYXRhX2x0LCBkYXRhX3J0LCBvcF9jb2RlLCBlcnJvcjtcclxuXHJcbiAgICAgICAgICBpZiAoIGFyZ19saXN0Lmxlbmd0aCA9PT0gMiApe1xyXG4gICAgICAgICAgICBkYXRhX2x0ID0gbGVmdF9yb3dbYXJnX2xpc3RbMF1dO1xyXG4gICAgICAgICAgICBvcF9jb2RlID0gJz09PSc7XHJcbiAgICAgICAgICAgIGRhdGFfcnQgPSByaWdodF9yb3dbYXJnX2xpc3RbMV1dO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgIGRhdGFfbHQgPSBsZWZ0X3Jvd1thcmdfbGlzdFswXV07XHJcbiAgICAgICAgICAgIG9wX2NvZGUgPSBhcmdfbGlzdFsxXTtcclxuICAgICAgICAgICAgZGF0YV9ydCA9IHJpZ2h0X3Jvd1thcmdfbGlzdFsyXV07XHJcbiAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgLypqc2xpbnQgZXFlcSA6IHRydWUgKi9cclxuICAgICAgICAgIHN3aXRjaCAoIG9wX2NvZGUgKXtcclxuICAgICAgICAgICAgY2FzZSAnPT09JyA6XHJcbiAgICAgICAgICAgICAgcmV0dXJuIGRhdGFfbHQgPT09IGRhdGFfcnQ7XHJcbiAgICAgICAgICAgIGNhc2UgJyE9PScgOlxyXG4gICAgICAgICAgICAgIHJldHVybiBkYXRhX2x0ICE9PSBkYXRhX3J0O1xyXG4gICAgICAgICAgICBjYXNlICc8JyAgIDpcclxuICAgICAgICAgICAgICByZXR1cm4gZGF0YV9sdCA8IGRhdGFfcnQ7XHJcbiAgICAgICAgICAgIGNhc2UgJz4nICAgOlxyXG4gICAgICAgICAgICAgIHJldHVybiBkYXRhX2x0ID4gZGF0YV9ydDtcclxuICAgICAgICAgICAgY2FzZSAnPD0nICA6XHJcbiAgICAgICAgICAgICAgcmV0dXJuIGRhdGFfbHQgPD0gZGF0YV9ydDtcclxuICAgICAgICAgICAgY2FzZSAnPj0nICA6XHJcbiAgICAgICAgICAgICAgcmV0dXJuIGRhdGFfbHQgPj0gZGF0YV9ydDtcclxuICAgICAgICAgICAgY2FzZSAnPT0nICA6XHJcbiAgICAgICAgICAgICAgcmV0dXJuIGRhdGFfbHQgPT0gZGF0YV9ydDtcclxuICAgICAgICAgICAgY2FzZSAnIT0nICA6XHJcbiAgICAgICAgICAgICAgcmV0dXJuIGRhdGFfbHQgIT0gZGF0YV9ydDtcclxuICAgICAgICAgICAgZGVmYXVsdCA6XHJcbiAgICAgICAgICAgICAgdGhyb3cgU3RyaW5nKCBvcF9jb2RlICkgKyAnIGlzIG5vdCBzdXBwb3J0ZWQnO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgICAgLy8gJ2pzbGludCBlcWVxIDogZmFsc2UnICBoZXJlIHJlc3VsdHMgaW5cclxuICAgICAgICAgIC8vIFwiVW5yZWFjaGFibGUgJy8qanNsaW50JyBhZnRlciAncmV0dXJuJ1wiLlxyXG4gICAgICAgICAgLy8gV2UgZG9uJ3QgbmVlZCBpdCB0aG91Z2gsIGFzIHRoZSBydWxlIGV4Y2VwdGlvblxyXG4gICAgICAgICAgLy8gaXMgZGlzY2FyZGVkIGF0IHRoZSBlbmQgb2YgdGhpcyBmdW5jdGlvbmFsIHNjb3BlXHJcbiAgICAgICAgfTtcclxuXHJcbiAgICAgICAgZm5Db21iaW5lUm93ID0gZnVuY3Rpb24gKCBsZWZ0X3JvdywgcmlnaHRfcm93ICkge1xyXG4gICAgICAgICAgdmFyIG91dF9tYXAgPSB7fSwgaSwgcHJlZml4O1xyXG5cclxuICAgICAgICAgIGZvciAoIGkgaW4gbGVmdF9yb3cgKXtcclxuICAgICAgICAgICAgaWYgKCBsZWZ0X3Jvdy5oYXNPd25Qcm9wZXJ0eSggaSApICl7XHJcbiAgICAgICAgICAgICAgb3V0X21hcFtpXSA9IGxlZnRfcm93W2ldO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgICBmb3IgKCBpIGluIHJpZ2h0X3JvdyApe1xyXG4gICAgICAgICAgICBpZiAoIHJpZ2h0X3Jvdy5oYXNPd25Qcm9wZXJ0eSggaSApICYmIGkgIT09ICdfX19pZCcgJiZcclxuICAgICAgICAgICAgICBpICE9PSAnX19fcycgKVxyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgcHJlZml4ID0gIVRBRkZZLmlzVW5kZWZpbmVkKCBvdXRfbWFwW2ldICkgPyAncmlnaHRfJyA6ICcnO1xyXG4gICAgICAgICAgICAgIG91dF9tYXBbcHJlZml4ICsgU3RyaW5nKCBpICkgXSA9IHJpZ2h0X3Jvd1tpXTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgfVxyXG4gICAgICAgICAgcmV0dXJuIG91dF9tYXA7XHJcbiAgICAgICAgfTtcclxuXHJcbiAgICAgICAgZm5NYWluID0gZnVuY3Rpb24gKCB0YWJsZSApIHtcclxuICAgICAgICAgIHZhclxyXG4gICAgICAgICAgICByaWdodF90YWJsZSwgaSxcclxuICAgICAgICAgICAgYXJnX2xpc3QgPSBhcmd1bWVudHMsXHJcbiAgICAgICAgICAgIGFyZ19sZW5ndGggPSBhcmdfbGlzdC5sZW5ndGgsXHJcbiAgICAgICAgICAgIHJlc3VsdF9saXN0ID0gW11cclxuICAgICAgICAgICAgO1xyXG5cclxuICAgICAgICAgIGlmICggdHlwZW9mIHRhYmxlLmZpbHRlciAhPT0gJ2Z1bmN0aW9uJyApe1xyXG4gICAgICAgICAgICBpZiAoIHRhYmxlLlRBRkZZICl7IHJpZ2h0X3RhYmxlID0gdGFibGUoKTsgfVxyXG4gICAgICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgICB0aHJvdyAnVEFGRlkgREIgb3IgcmVzdWx0IG5vdCBzdXBwbGllZCc7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgIH1cclxuICAgICAgICAgIGVsc2UgeyByaWdodF90YWJsZSA9IHRhYmxlOyB9XHJcblxyXG4gICAgICAgICAgdGhpcy5jb250ZXh0KCB7XHJcbiAgICAgICAgICAgIHJlc3VsdHMgOiB0aGlzLmdldERCSSgpLnF1ZXJ5KCB0aGlzLmNvbnRleHQoKSApXHJcbiAgICAgICAgICB9ICk7XHJcblxyXG4gICAgICAgICAgVEFGRlkuZWFjaCggdGhpcy5jb250ZXh0KCkucmVzdWx0cywgZnVuY3Rpb24gKCBsZWZ0X3JvdyApIHtcclxuICAgICAgICAgICAgcmlnaHRfdGFibGUuZWFjaCggZnVuY3Rpb24gKCByaWdodF9yb3cgKSB7XHJcbiAgICAgICAgICAgICAgdmFyIGFyZ19kYXRhLCBpc19vayA9IHRydWU7XHJcbiAgICAgICAgICAgICAgQ09ORElUSU9OOlxyXG4gICAgICAgICAgICAgICAgZm9yICggaSA9IDE7IGkgPCBhcmdfbGVuZ3RoOyBpKysgKXtcclxuICAgICAgICAgICAgICAgICAgYXJnX2RhdGEgPSBhcmdfbGlzdFtpXTtcclxuICAgICAgICAgICAgICAgICAgaWYgKCB0eXBlb2YgYXJnX2RhdGEgPT09ICdmdW5jdGlvbicgKXtcclxuICAgICAgICAgICAgICAgICAgICBpc19vayA9IGFyZ19kYXRhKCBsZWZ0X3JvdywgcmlnaHRfcm93ICk7XHJcbiAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgZWxzZSBpZiAoIHR5cGVvZiBhcmdfZGF0YSA9PT0gJ29iamVjdCcgJiYgYXJnX2RhdGEubGVuZ3RoICl7XHJcbiAgICAgICAgICAgICAgICAgICAgaXNfb2sgPSBmbkNvbXBhcmVMaXN0KCBsZWZ0X3JvdywgcmlnaHRfcm93LCBhcmdfZGF0YSApO1xyXG4gICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgIGlzX29rID0gZmFsc2U7XHJcbiAgICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICAgIGlmICggIWlzX29rICl7IGJyZWFrIENPTkRJVElPTjsgfSAvLyBzaG9ydCBjaXJjdWl0XHJcbiAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgIGlmICggaXNfb2sgKXtcclxuICAgICAgICAgICAgICAgIHJlc3VsdF9saXN0LnB1c2goIGZuQ29tYmluZVJvdyggbGVmdF9yb3csIHJpZ2h0X3JvdyApICk7XHJcbiAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9ICk7XHJcbiAgICAgICAgICB9ICk7XHJcbiAgICAgICAgICByZXR1cm4gVEFGRlkoIHJlc3VsdF9saXN0ICkoKTtcclxuICAgICAgICB9O1xyXG5cclxuICAgICAgICByZXR1cm4gZm5NYWluO1xyXG4gICAgICB9KCkpO1xyXG5cclxuICAgICAgQVBJLmV4dGVuZCggJ2pvaW4nLCBpbm5lckpvaW5GdW5jdGlvbiApO1xyXG4gICAgfSgpKTtcclxuXHJcbiAgICBBUEkuZXh0ZW5kKCAnbWF4JywgZnVuY3Rpb24gKCBjICkge1xyXG4gICAgICAvLyAqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqXHJcbiAgICAgIC8vICpcclxuICAgICAgLy8gKiBUYWtlczogY29sdW1uIHRvIGZpbmQgbWF4XHJcbiAgICAgIC8vICogUmV0dXJuczogdGhlIGhpZ2hlc3QgdmFsdWVcclxuICAgICAgLy8gKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKlxyXG4gICAgICB2YXIgaGlnaGVzdCA9IG51bGw7XHJcbiAgICAgIHJ1bi5jYWxsKCB0aGlzICk7XHJcbiAgICAgIGVhY2goIHRoaXMuY29udGV4dCgpLnJlc3VsdHMsIGZ1bmN0aW9uICggciApIHtcclxuICAgICAgICBpZiAoIGhpZ2hlc3QgPT09IG51bGwgfHwgcltjXSA+IGhpZ2hlc3QgKXtcclxuICAgICAgICAgIGhpZ2hlc3QgPSByW2NdO1xyXG4gICAgICAgIH1cclxuICAgICAgfSk7XHJcbiAgICAgIHJldHVybiBoaWdoZXN0O1xyXG4gICAgfSk7XHJcblxyXG4gICAgQVBJLmV4dGVuZCggJ3NlbGVjdCcsIGZ1bmN0aW9uICgpIHtcclxuICAgICAgLy8gKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKlxyXG4gICAgICAvLyAqXHJcbiAgICAgIC8vICogVGFrZXM6IGNvbHVtbnMgdG8gc2VsZWN0IHZhbHVlcyBpbnRvIGFuIGFycmF5XHJcbiAgICAgIC8vICogUmV0dXJuczogYXJyYXkgb2YgdmFsdWVzXHJcbiAgICAgIC8vICogTm90ZSBpZiBtb3JlIHRoYW4gb25lIGNvbHVtbiBpcyBnaXZlbiBhbiBhcnJheSBvZiBhcnJheXMgaXMgcmV0dXJuZWRcclxuICAgICAgLy8gKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKiBcclxuXHJcbiAgICAgIHZhciByYSA9IFtdLCBhcmdzID0gYXJndW1lbnRzO1xyXG4gICAgICBydW4uY2FsbCggdGhpcyApO1xyXG4gICAgICBpZiAoIGFyZ3VtZW50cy5sZW5ndGggPT09IDEgKXtcclxuXHJcbiAgICAgICAgZWFjaCggdGhpcy5jb250ZXh0KCkucmVzdWx0cywgZnVuY3Rpb24gKCByICkge1xyXG5cclxuICAgICAgICAgIHJhLnB1c2goIHJbYXJnc1swXV0gKTtcclxuICAgICAgICB9KTtcclxuICAgICAgfVxyXG4gICAgICBlbHNlIHtcclxuICAgICAgICBlYWNoKCB0aGlzLmNvbnRleHQoKS5yZXN1bHRzLCBmdW5jdGlvbiAoIHIgKSB7XHJcbiAgICAgICAgICB2YXIgcm93ID0gW107XHJcbiAgICAgICAgICBlYWNoKCBhcmdzLCBmdW5jdGlvbiAoIGMgKSB7XHJcbiAgICAgICAgICAgIHJvdy5wdXNoKCByW2NdICk7XHJcbiAgICAgICAgICB9KTtcclxuICAgICAgICAgIHJhLnB1c2goIHJvdyApO1xyXG4gICAgICAgIH0pO1xyXG4gICAgICB9XHJcbiAgICAgIHJldHVybiByYTtcclxuICAgIH0pO1xyXG4gICAgQVBJLmV4dGVuZCggJ2Rpc3RpbmN0JywgZnVuY3Rpb24gKCkge1xyXG4gICAgICAvLyAqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqXHJcbiAgICAgIC8vICpcclxuICAgICAgLy8gKiBUYWtlczogY29sdW1ucyB0byBzZWxlY3QgdW5pcXVlIGFsdWVzIGludG8gYW4gYXJyYXlcclxuICAgICAgLy8gKiBSZXR1cm5zOiBhcnJheSBvZiB2YWx1ZXNcclxuICAgICAgLy8gKiBOb3RlIGlmIG1vcmUgdGhhbiBvbmUgY29sdW1uIGlzIGdpdmVuIGFuIGFycmF5IG9mIGFycmF5cyBpcyByZXR1cm5lZFxyXG4gICAgICAvLyAqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqIFxyXG4gICAgICB2YXIgcmEgPSBbXSwgYXJncyA9IGFyZ3VtZW50cztcclxuICAgICAgcnVuLmNhbGwoIHRoaXMgKTtcclxuICAgICAgaWYgKCBhcmd1bWVudHMubGVuZ3RoID09PSAxICl7XHJcblxyXG4gICAgICAgIGVhY2goIHRoaXMuY29udGV4dCgpLnJlc3VsdHMsIGZ1bmN0aW9uICggciApIHtcclxuICAgICAgICAgIHZhciB2ID0gclthcmdzWzBdXSwgZHVwID0gZmFsc2U7XHJcbiAgICAgICAgICBlYWNoKCByYSwgZnVuY3Rpb24gKCBkICkge1xyXG4gICAgICAgICAgICBpZiAoIHYgPT09IGQgKXtcclxuICAgICAgICAgICAgICBkdXAgPSB0cnVlO1xyXG4gICAgICAgICAgICAgIHJldHVybiBUQUZGWS5FWElUO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICB9KTtcclxuICAgICAgICAgIGlmICggIWR1cCApe1xyXG4gICAgICAgICAgICByYS5wdXNoKCB2ICk7XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgfSk7XHJcbiAgICAgIH1cclxuICAgICAgZWxzZSB7XHJcbiAgICAgICAgZWFjaCggdGhpcy5jb250ZXh0KCkucmVzdWx0cywgZnVuY3Rpb24gKCByICkge1xyXG4gICAgICAgICAgdmFyIHJvdyA9IFtdLCBkdXAgPSBmYWxzZTtcclxuICAgICAgICAgIGVhY2goIGFyZ3MsIGZ1bmN0aW9uICggYyApIHtcclxuICAgICAgICAgICAgcm93LnB1c2goIHJbY10gKTtcclxuICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgZWFjaCggcmEsIGZ1bmN0aW9uICggZCApIHtcclxuICAgICAgICAgICAgdmFyIGxkdXAgPSB0cnVlO1xyXG4gICAgICAgICAgICBlYWNoKCBhcmdzLCBmdW5jdGlvbiAoIGMsIGkgKSB7XHJcbiAgICAgICAgICAgICAgaWYgKCByb3dbaV0gIT09IGRbaV0gKXtcclxuICAgICAgICAgICAgICAgIGxkdXAgPSBmYWxzZTtcclxuICAgICAgICAgICAgICAgIHJldHVybiBUQUZGWS5FWElUO1xyXG4gICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgIGlmICggbGR1cCApe1xyXG4gICAgICAgICAgICAgIGR1cCA9IHRydWU7XHJcbiAgICAgICAgICAgICAgcmV0dXJuIFRBRkZZLkVYSVQ7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgaWYgKCAhZHVwICl7XHJcbiAgICAgICAgICAgIHJhLnB1c2goIHJvdyApO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgIH0pO1xyXG4gICAgICB9XHJcbiAgICAgIHJldHVybiByYTtcclxuICAgIH0pO1xyXG4gICAgQVBJLmV4dGVuZCggJ3N1cHBsYW50JywgZnVuY3Rpb24gKCB0ZW1wbGF0ZSwgcmV0dXJuYXJyYXkgKSB7XHJcbiAgICAgIC8vICoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKipcclxuICAgICAgLy8gKlxyXG4gICAgICAvLyAqIFRha2VzOiBhIHN0cmluZyB0ZW1wbGF0ZSBmb3JtYXRlZCB3aXRoIGtleSB0byBiZSByZXBsYWNlZCB3aXRoIHZhbHVlcyBmcm9tIHRoZSByb3dzLCBmbGFnIHRvIGRldGVybWluZSBpZiB3ZSB3YW50IGFycmF5IG9mIHN0cmluZ3NcclxuICAgICAgLy8gKiBSZXR1cm5zOiBhcnJheSBvZiB2YWx1ZXMgb3IgYSBzdHJpbmdcclxuICAgICAgLy8gKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKiBcclxuICAgICAgdmFyIHJhID0gW107XHJcbiAgICAgIHJ1bi5jYWxsKCB0aGlzICk7XHJcbiAgICAgIGVhY2goIHRoaXMuY29udGV4dCgpLnJlc3VsdHMsIGZ1bmN0aW9uICggciApIHtcclxuICAgICAgICAvLyBUT0RPOiBUaGUgY3VybHkgYnJhY2VzIHVzZWQgdG8gYmUgdW5lc2NhcGVkXHJcbiAgICAgICAgcmEucHVzaCggdGVtcGxhdGUucmVwbGFjZSggL1xceyhbXlxce1xcfV0qKVxcfS9nLCBmdW5jdGlvbiAoIGEsIGIgKSB7XHJcbiAgICAgICAgICB2YXIgdiA9IHJbYl07XHJcbiAgICAgICAgICByZXR1cm4gdHlwZW9mIHYgPT09ICdzdHJpbmcnIHx8IHR5cGVvZiB2ID09PSAnbnVtYmVyJyA/IHYgOiBhO1xyXG4gICAgICAgIH0gKSApO1xyXG4gICAgICB9KTtcclxuICAgICAgcmV0dXJuICghcmV0dXJuYXJyYXkpID8gcmEuam9pbiggXCJcIiApIDogcmE7XHJcbiAgICB9KTtcclxuXHJcblxyXG4gICAgQVBJLmV4dGVuZCggJ2VhY2gnLCBmdW5jdGlvbiAoIG0gKSB7XHJcbiAgICAgIC8vICoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKipcclxuICAgICAgLy8gKlxyXG4gICAgICAvLyAqIFRha2VzOiBhIGZ1bmN0aW9uXHJcbiAgICAgIC8vICogUHVycG9zZTogbG9vcHMgb3ZlciBldmVyeSBtYXRjaGluZyByZWNvcmQgYW5kIGFwcGxpZXMgdGhlIGZ1bmN0aW9uXHJcbiAgICAgIC8vICoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKiogXHJcbiAgICAgIHJ1bi5jYWxsKCB0aGlzICk7XHJcbiAgICAgIGVhY2goIHRoaXMuY29udGV4dCgpLnJlc3VsdHMsIG0gKTtcclxuICAgICAgcmV0dXJuIHRoaXM7XHJcbiAgICB9KTtcclxuICAgIEFQSS5leHRlbmQoICdtYXAnLCBmdW5jdGlvbiAoIG0gKSB7XHJcbiAgICAgIC8vICoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKipcclxuICAgICAgLy8gKlxyXG4gICAgICAvLyAqIFRha2VzOiBhIGZ1bmN0aW9uXHJcbiAgICAgIC8vICogUHVycG9zZTogbG9vcHMgb3ZlciBldmVyeSBtYXRjaGluZyByZWNvcmQgYW5kIGFwcGxpZXMgdGhlIGZ1bmN0aW9uLCByZXR1cmluZyB0aGUgcmVzdWx0cyBpbiBhbiBhcnJheVxyXG4gICAgICAvLyAqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqIFxyXG4gICAgICB2YXIgcmEgPSBbXTtcclxuICAgICAgcnVuLmNhbGwoIHRoaXMgKTtcclxuICAgICAgZWFjaCggdGhpcy5jb250ZXh0KCkucmVzdWx0cywgZnVuY3Rpb24gKCByICkge1xyXG4gICAgICAgIHJhLnB1c2goIG0oIHIgKSApO1xyXG4gICAgICB9KTtcclxuICAgICAgcmV0dXJuIHJhO1xyXG4gICAgfSk7XHJcblxyXG5cclxuXHJcbiAgICBUID0gZnVuY3Rpb24gKCBkICkge1xyXG4gICAgICAvLyAqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqXHJcbiAgICAgIC8vICpcclxuICAgICAgLy8gKiBUIGlzIHRoZSBtYWluIFRBRkZZIG9iamVjdFxyXG4gICAgICAvLyAqIFRha2VzOiBhbiBhcnJheSBvZiBvYmplY3RzIG9yIEpTT05cclxuICAgICAgLy8gKiBSZXR1cm5zIGEgbmV3IFRBRkZZREJcclxuICAgICAgLy8gKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKiBcclxuICAgICAgdmFyIFRPYiA9IFtdLFxyXG4gICAgICAgIElEID0ge30sXHJcbiAgICAgICAgUkMgPSAxLFxyXG4gICAgICAgIHNldHRpbmdzID0ge1xyXG4gICAgICAgICAgdGVtcGxhdGUgICAgICAgICAgOiBmYWxzZSxcclxuICAgICAgICAgIG9uSW5zZXJ0ICAgICAgICAgIDogZmFsc2UsXHJcbiAgICAgICAgICBvblVwZGF0ZSAgICAgICAgICA6IGZhbHNlLFxyXG4gICAgICAgICAgb25SZW1vdmUgICAgICAgICAgOiBmYWxzZSxcclxuICAgICAgICAgIG9uREJDaGFuZ2UgICAgICAgIDogZmFsc2UsXHJcbiAgICAgICAgICBzdG9yYWdlTmFtZSAgICAgICA6IGZhbHNlLFxyXG4gICAgICAgICAgZm9yY2VQcm9wZXJ0eUNhc2UgOiBudWxsLFxyXG4gICAgICAgICAgY2FjaGVTaXplICAgICAgICAgOiAxMDAsXHJcbiAgICAgICAgICBuYW1lICAgICAgICAgICAgICA6ICcnXHJcbiAgICAgICAgfSxcclxuICAgICAgICBkbSA9IG5ldyBEYXRlKCksXHJcbiAgICAgICAgQ2FjaGVDb3VudCA9IDAsXHJcbiAgICAgICAgQ2FjaGVDbGVhciA9IDAsXHJcbiAgICAgICAgQ2FjaGUgPSB7fSxcclxuICAgICAgICBEQkksIHJ1bkluZGV4ZXMsIHJvb3RcclxuICAgICAgICA7XHJcbiAgICAgIC8vICoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKipcclxuICAgICAgLy8gKlxyXG4gICAgICAvLyAqIFRPYiA9IHRoaXMgZGF0YWJhc2VcclxuICAgICAgLy8gKiBJRCA9IGNvbGxlY3Rpb24gb2YgdGhlIHJlY29yZCBJRHMgYW5kIGxvY2F0aW9ucyB3aXRoaW4gdGhlIERCLCB1c2VkIGZvciBmYXN0IGxvb2t1cHNcclxuICAgICAgLy8gKiBSQyA9IHJlY29yZCBjb3VudGVyLCB1c2VkIGZvciBjcmVhdGluZyBJRHNcclxuICAgICAgLy8gKiBzZXR0aW5ncy50ZW1wbGF0ZSA9IHRoZSB0ZW1wbGF0ZSB0byBtZXJnZSBhbGwgbmV3IHJlY29yZHMgd2l0aFxyXG4gICAgICAvLyAqIHNldHRpbmdzLm9uSW5zZXJ0ID0gZXZlbnQgZ2l2ZW4gYSBjb3B5IG9mIHRoZSBuZXdseSBpbnNlcnRlZCByZWNvcmRcclxuICAgICAgLy8gKiBzZXR0aW5ncy5vblVwZGF0ZSA9IGV2ZW50IGdpdmVuIHRoZSBvcmlnaW5hbCByZWNvcmQsIHRoZSBjaGFuZ2VzLCBhbmQgdGhlIG5ldyByZWNvcmRcclxuICAgICAgLy8gKiBzZXR0aW5ncy5vblJlbW92ZSA9IGV2ZW50IGdpdmVuIHRoZSByZW1vdmVkIHJlY29yZFxyXG4gICAgICAvLyAqIHNldHRpbmdzLmZvcmNlUHJvcGVydHlDYXNlID0gb24gaW5zZXJ0IGZvcmNlIHRoZSBwcm9wcnR5IGNhc2UgdG8gYmUgbG93ZXIgb3IgdXBwZXIuIGRlZmF1bHQgbG93ZXIsIG51bGwvdW5kZWZpbmVkIHdpbGwgbGVhdmUgY2FzZSBhcyBpc1xyXG4gICAgICAvLyAqIGRtID0gdGhlIG1vZGlmeSBkYXRlIG9mIHRoZSBkYXRhYmFzZSwgdXNlZCBmb3IgcXVlcnkgY2FjaGluZ1xyXG4gICAgICAvLyAqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqIFxyXG5cclxuXHJcbiAgICAgIHJ1bkluZGV4ZXMgPSBmdW5jdGlvbiAoIGluZGV4ZXMgKSB7XHJcbiAgICAgICAgLy8gKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKlxyXG4gICAgICAgIC8vICpcclxuICAgICAgICAvLyAqIFRha2VzOiBhIGNvbGxlY3Rpb24gb2YgaW5kZXhlc1xyXG4gICAgICAgIC8vICogUmV0dXJuczogY29sbGVjdGlvbiB3aXRoIHJlY29yZHMgbWF0Y2hpbmcgaW5kZXhlZCBmaWx0ZXJzXHJcbiAgICAgICAgLy8gKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKiBcclxuXHJcbiAgICAgICAgdmFyIHJlY29yZHMgPSBbXSwgVW5pcXVlRW5mb3JjZSA9IGZhbHNlO1xyXG5cclxuICAgICAgICBpZiAoIGluZGV4ZXMubGVuZ3RoID09PSAwICl7XHJcbiAgICAgICAgICByZXR1cm4gVE9iO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgZWFjaCggaW5kZXhlcywgZnVuY3Rpb24gKCBmICkge1xyXG4gICAgICAgICAgLy8gQ2hlY2sgdG8gc2VlIGlmIHJlY29yZCBJRFxyXG4gICAgICAgICAgaWYgKCBULmlzU3RyaW5nKCBmICkgJiYgL1t0XVswLTldKltyXVswLTldKi9pLnRlc3QoIGYgKSAmJlxyXG4gICAgICAgICAgICBUT2JbSURbZl1dIClcclxuICAgICAgICAgIHtcclxuICAgICAgICAgICAgcmVjb3Jkcy5wdXNoKCBUT2JbSURbZl1dICk7XHJcbiAgICAgICAgICAgIFVuaXF1ZUVuZm9yY2UgPSB0cnVlO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgICAgLy8gQ2hlY2sgdG8gc2VlIGlmIHJlY29yZFxyXG4gICAgICAgICAgaWYgKCBULmlzT2JqZWN0KCBmICkgJiYgZi5fX19pZCAmJiBmLl9fX3MgJiZcclxuICAgICAgICAgICAgVE9iW0lEW2YuX19faWRdXSApXHJcbiAgICAgICAgICB7XHJcbiAgICAgICAgICAgIHJlY29yZHMucHVzaCggVE9iW0lEW2YuX19faWRdXSApO1xyXG4gICAgICAgICAgICBVbmlxdWVFbmZvcmNlID0gdHJ1ZTtcclxuICAgICAgICAgIH1cclxuICAgICAgICAgIC8vIENoZWNrIHRvIHNlZSBpZiBhcnJheSBvZiBpbmRleGVzXHJcbiAgICAgICAgICBpZiAoIFQuaXNBcnJheSggZiApICl7XHJcbiAgICAgICAgICAgIGVhY2goIGYsIGZ1bmN0aW9uICggciApIHtcclxuICAgICAgICAgICAgICBlYWNoKCBydW5JbmRleGVzKCByICksIGZ1bmN0aW9uICggcnIgKSB7XHJcbiAgICAgICAgICAgICAgICByZWNvcmRzLnB1c2goIHJyICk7XHJcbiAgICAgICAgICAgICAgfSk7XHJcblxyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICAgIH1cclxuICAgICAgICB9KTtcclxuICAgICAgICBpZiAoIFVuaXF1ZUVuZm9yY2UgJiYgcmVjb3Jkcy5sZW5ndGggPiAxICl7XHJcbiAgICAgICAgICByZWNvcmRzID0gW107XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICByZXR1cm4gcmVjb3JkcztcclxuICAgICAgfTtcclxuXHJcbiAgICAgIERCSSA9IHtcclxuICAgICAgICAvLyAqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqXHJcbiAgICAgICAgLy8gKlxyXG4gICAgICAgIC8vICogVGhlIERCSSBpcyB0aGUgaW50ZXJuYWwgRGF0YUJhc2UgSW50ZXJmYWNlIHRoYXQgaW50ZXJhY3RzIHdpdGggdGhlIGRhdGFcclxuICAgICAgICAvLyAqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqIFxyXG4gICAgICAgIGRtICAgICAgICAgICA6IGZ1bmN0aW9uICggbmQgKSB7XHJcbiAgICAgICAgICAvLyAqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqXHJcbiAgICAgICAgICAvLyAqXHJcbiAgICAgICAgICAvLyAqIFRha2VzOiBhbiBvcHRpb25hbCBuZXcgbW9kaWZ5IGRhdGVcclxuICAgICAgICAgIC8vICogUHVycG9zZTogdXNlZCB0byBnZXQgYW5kIHNldCB0aGUgREIgbW9kaWZ5IGRhdGVcclxuICAgICAgICAgIC8vICoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKiogXHJcbiAgICAgICAgICBpZiAoIG5kICl7XHJcbiAgICAgICAgICAgIGRtID0gbmQ7XHJcbiAgICAgICAgICAgIENhY2hlID0ge307XHJcbiAgICAgICAgICAgIENhY2hlQ291bnQgPSAwO1xyXG4gICAgICAgICAgICBDYWNoZUNsZWFyID0gMDtcclxuICAgICAgICAgIH1cclxuICAgICAgICAgIGlmICggc2V0dGluZ3Mub25EQkNoYW5nZSApe1xyXG4gICAgICAgICAgICBzZXRUaW1lb3V0KCBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgICAgc2V0dGluZ3Mub25EQkNoYW5nZS5jYWxsKCBUT2IgKTtcclxuICAgICAgICAgICAgfSwgMCApO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgICAgaWYgKCBzZXR0aW5ncy5zdG9yYWdlTmFtZSApe1xyXG4gICAgICAgICAgICBzZXRUaW1lb3V0KCBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgICAgbG9jYWxTdG9yYWdlLnNldEl0ZW0oICd0YWZmeV8nICsgc2V0dGluZ3Muc3RvcmFnZU5hbWUsXHJcbiAgICAgICAgICAgICAgICBKU09OLnN0cmluZ2lmeSggVE9iICkgKTtcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgICByZXR1cm4gZG07XHJcbiAgICAgICAgfSxcclxuICAgICAgICBpbnNlcnQgICAgICAgOiBmdW5jdGlvbiAoIGksIHJ1bkV2ZW50ICkge1xyXG4gICAgICAgICAgLy8gKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKlxyXG4gICAgICAgICAgLy8gKlxyXG4gICAgICAgICAgLy8gKiBUYWtlczogYSBuZXcgcmVjb3JkIHRvIGluc2VydFxyXG4gICAgICAgICAgLy8gKiBQdXJwb3NlOiBtZXJnZSB0aGUgb2JqZWN0IHdpdGggdGhlIHRlbXBsYXRlLCBhZGQgYW4gSUQsIGluc2VydCBpbnRvIERCLCBjYWxsIGluc2VydCBldmVudFxyXG4gICAgICAgICAgLy8gKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKiBcclxuICAgICAgICAgIHZhciBjb2x1bW5zID0gW10sXHJcbiAgICAgICAgICAgIHJlY29yZHMgICA9IFtdLFxyXG4gICAgICAgICAgICBpbnB1dCAgICAgPSBwcm90ZWN0SlNPTiggaSApXHJcbiAgICAgICAgICAgIDtcclxuICAgICAgICAgIGVhY2goIGlucHV0LCBmdW5jdGlvbiAoIHYsIGkgKSB7XHJcbiAgICAgICAgICAgIHZhciBudiwgbztcclxuICAgICAgICAgICAgaWYgKCBULmlzQXJyYXkoIHYgKSAmJiBpID09PSAwICl7XHJcbiAgICAgICAgICAgICAgZWFjaCggdiwgZnVuY3Rpb24gKCBhdiApIHtcclxuXHJcbiAgICAgICAgICAgICAgICBjb2x1bW5zLnB1c2goIChzZXR0aW5ncy5mb3JjZVByb3BlcnR5Q2FzZSA9PT0gJ2xvd2VyJylcclxuICAgICAgICAgICAgICAgICAgPyBhdi50b0xvd2VyQ2FzZSgpXHJcbiAgICAgICAgICAgICAgICAgICAgOiAoc2V0dGluZ3MuZm9yY2VQcm9wZXJ0eUNhc2UgPT09ICd1cHBlcicpXHJcbiAgICAgICAgICAgICAgICAgID8gYXYudG9VcHBlckNhc2UoKSA6IGF2ICk7XHJcbiAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICAgcmV0dXJuIHRydWU7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgZWxzZSBpZiAoIFQuaXNBcnJheSggdiApICl7XHJcbiAgICAgICAgICAgICAgbnYgPSB7fTtcclxuICAgICAgICAgICAgICBlYWNoKCB2LCBmdW5jdGlvbiAoIGF2LCBhaSApIHtcclxuICAgICAgICAgICAgICAgIG52W2NvbHVtbnNbYWldXSA9IGF2O1xyXG4gICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAgIHYgPSBudjtcclxuXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgZWxzZSBpZiAoIFQuaXNPYmplY3QoIHYgKSAmJiBzZXR0aW5ncy5mb3JjZVByb3BlcnR5Q2FzZSApe1xyXG4gICAgICAgICAgICAgIG8gPSB7fTtcclxuXHJcbiAgICAgICAgICAgICAgZWFjaGluKCB2LCBmdW5jdGlvbiAoIGF2LCBhaSApIHtcclxuICAgICAgICAgICAgICAgIG9bKHNldHRpbmdzLmZvcmNlUHJvcGVydHlDYXNlID09PSAnbG93ZXInKSA/IGFpLnRvTG93ZXJDYXNlKClcclxuICAgICAgICAgICAgICAgICAgOiAoc2V0dGluZ3MuZm9yY2VQcm9wZXJ0eUNhc2UgPT09ICd1cHBlcicpXHJcbiAgICAgICAgICAgICAgICAgID8gYWkudG9VcHBlckNhc2UoKSA6IGFpXSA9IHZbYWldO1xyXG4gICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAgIHYgPSBvO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICBSQysrO1xyXG4gICAgICAgICAgICB2Ll9fX2lkID0gJ1QnICsgU3RyaW5nKCBpZHBhZCArIFRDICkuc2xpY2UoIC02ICkgKyAnUicgK1xyXG4gICAgICAgICAgICAgIFN0cmluZyggaWRwYWQgKyBSQyApLnNsaWNlKCAtNiApO1xyXG4gICAgICAgICAgICB2Ll9fX3MgPSB0cnVlO1xyXG4gICAgICAgICAgICByZWNvcmRzLnB1c2goIHYuX19faWQgKTtcclxuICAgICAgICAgICAgaWYgKCBzZXR0aW5ncy50ZW1wbGF0ZSApe1xyXG4gICAgICAgICAgICAgIHYgPSBULm1lcmdlT2JqKCBzZXR0aW5ncy50ZW1wbGF0ZSwgdiApO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIFRPYi5wdXNoKCB2ICk7XHJcblxyXG4gICAgICAgICAgICBJRFt2Ll9fX2lkXSA9IFRPYi5sZW5ndGggLSAxO1xyXG4gICAgICAgICAgICBpZiAoIHNldHRpbmdzLm9uSW5zZXJ0ICYmXHJcbiAgICAgICAgICAgICAgKHJ1bkV2ZW50IHx8IFRBRkZZLmlzVW5kZWZpbmVkKCBydW5FdmVudCApKSApXHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICBzZXR0aW5ncy5vbkluc2VydC5jYWxsKCB2ICk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgREJJLmRtKCBuZXcgRGF0ZSgpICk7XHJcbiAgICAgICAgICB9KTtcclxuICAgICAgICAgIHJldHVybiByb290KCByZWNvcmRzICk7XHJcbiAgICAgICAgfSxcclxuICAgICAgICBzb3J0ICAgICAgICAgOiBmdW5jdGlvbiAoIG8gKSB7XHJcbiAgICAgICAgICAvLyAqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqXHJcbiAgICAgICAgICAvLyAqXHJcbiAgICAgICAgICAvLyAqIFB1cnBvc2U6IENoYW5nZSB0aGUgc29ydCBvcmRlciBvZiB0aGUgREIgaXRzZWxmIGFuZCByZXNldCB0aGUgSUQgYnVja2V0XHJcbiAgICAgICAgICAvLyAqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqIFxyXG4gICAgICAgICAgVE9iID0gb3JkZXJCeUNvbCggVE9iLCBvLnNwbGl0KCAnLCcgKSApO1xyXG4gICAgICAgICAgSUQgPSB7fTtcclxuICAgICAgICAgIGVhY2goIFRPYiwgZnVuY3Rpb24gKCByLCBpICkge1xyXG4gICAgICAgICAgICBJRFtyLl9fX2lkXSA9IGk7XHJcbiAgICAgICAgICB9KTtcclxuICAgICAgICAgIERCSS5kbSggbmV3IERhdGUoKSApO1xyXG4gICAgICAgICAgcmV0dXJuIHRydWU7XHJcbiAgICAgICAgfSxcclxuICAgICAgICB1cGRhdGUgICAgICAgOiBmdW5jdGlvbiAoIGlkLCBjaGFuZ2VzLCBydW5FdmVudCApIHtcclxuICAgICAgICAgIC8vICoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKipcclxuICAgICAgICAgIC8vICpcclxuICAgICAgICAgIC8vICogVGFrZXM6IHRoZSBJRCBvZiByZWNvcmQgYmVpbmcgY2hhbmdlZCBhbmQgdGhlIGNoYW5nZXNcclxuICAgICAgICAgIC8vICogUHVycG9zZTogVXBkYXRlIGEgcmVjb3JkIGFuZCBjaGFuZ2Ugc29tZSBvciBhbGwgdmFsdWVzLCBjYWxsIHRoZSBvbiB1cGRhdGUgbWV0aG9kXHJcbiAgICAgICAgICAvLyAqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqXHJcblxyXG4gICAgICAgICAgdmFyIG5jID0ge30sIG9yLCBuciwgdGMsIGhhc0NoYW5nZTtcclxuICAgICAgICAgIGlmICggc2V0dGluZ3MuZm9yY2VQcm9wZXJ0eUNhc2UgKXtcclxuICAgICAgICAgICAgZWFjaGluKCBjaGFuZ2VzLCBmdW5jdGlvbiAoIHYsIHAgKSB7XHJcbiAgICAgICAgICAgICAgbmNbKHNldHRpbmdzLmZvcmNlUHJvcGVydHlDYXNlID09PSAnbG93ZXInKSA/IHAudG9Mb3dlckNhc2UoKVxyXG4gICAgICAgICAgICAgICAgOiAoc2V0dGluZ3MuZm9yY2VQcm9wZXJ0eUNhc2UgPT09ICd1cHBlcicpID8gcC50b1VwcGVyQ2FzZSgpXHJcbiAgICAgICAgICAgICAgICA6IHBdID0gdjtcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgIGNoYW5nZXMgPSBuYztcclxuICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICBvciA9IFRPYltJRFtpZF1dO1xyXG4gICAgICAgICAgbnIgPSBULm1lcmdlT2JqKCBvciwgY2hhbmdlcyApO1xyXG5cclxuICAgICAgICAgIHRjID0ge307XHJcbiAgICAgICAgICBoYXNDaGFuZ2UgPSBmYWxzZTtcclxuICAgICAgICAgIGVhY2hpbiggbnIsIGZ1bmN0aW9uICggdiwgaSApIHtcclxuICAgICAgICAgICAgaWYgKCBUQUZGWS5pc1VuZGVmaW5lZCggb3JbaV0gKSB8fCBvcltpXSAhPT0gdiApe1xyXG4gICAgICAgICAgICAgIHRjW2ldID0gdjtcclxuICAgICAgICAgICAgICBoYXNDaGFuZ2UgPSB0cnVlO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICB9KTtcclxuICAgICAgICAgIGlmICggaGFzQ2hhbmdlICl7XHJcbiAgICAgICAgICAgIGlmICggc2V0dGluZ3Mub25VcGRhdGUgJiZcclxuICAgICAgICAgICAgICAocnVuRXZlbnQgfHwgVEFGRlkuaXNVbmRlZmluZWQoIHJ1bkV2ZW50ICkpIClcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgIHNldHRpbmdzLm9uVXBkYXRlLmNhbGwoIG5yLCBUT2JbSURbaWRdXSwgdGMgKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBUT2JbSURbaWRdXSA9IG5yO1xyXG4gICAgICAgICAgICBEQkkuZG0oIG5ldyBEYXRlKCkgKTtcclxuICAgICAgICAgIH1cclxuICAgICAgICB9LFxyXG4gICAgICAgIHJlbW92ZSAgICAgICA6IGZ1bmN0aW9uICggaWQgKSB7XHJcbiAgICAgICAgICAvLyAqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqXHJcbiAgICAgICAgICAvLyAqXHJcbiAgICAgICAgICAvLyAqIFRha2VzOiB0aGUgSUQgb2YgcmVjb3JkIHRvIGJlIHJlbW92ZWRcclxuICAgICAgICAgIC8vICogUHVycG9zZTogcmVtb3ZlIGEgcmVjb3JkLCBjaGFuZ2VzIGl0cyBfX19zIHZhbHVlIHRvIGZhbHNlXHJcbiAgICAgICAgICAvLyAqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqIFxyXG4gICAgICAgICAgVE9iW0lEW2lkXV0uX19fcyA9IGZhbHNlO1xyXG4gICAgICAgIH0sXHJcbiAgICAgICAgcmVtb3ZlQ29tbWl0IDogZnVuY3Rpb24gKCBydW5FdmVudCApIHtcclxuICAgICAgICAgIHZhciB4O1xyXG4gICAgICAgICAgLy8gKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKlxyXG4gICAgICAgICAgLy8gKlxyXG4gICAgICAgICAgLy8gKiBcclxuICAgICAgICAgIC8vICogUHVycG9zZTogbG9vcCBvdmVyIGFsbCByZWNvcmRzIGFuZCByZW1vdmUgcmVjb3JkcyB3aXRoIF9fX3MgPSBmYWxzZSwgY2FsbCBvblJlbW92ZSBldmVudCwgY2xlYXIgSURcclxuICAgICAgICAgIC8vICoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKipcclxuICAgICAgICAgIGZvciAoIHggPSBUT2IubGVuZ3RoIC0gMTsgeCA+IC0xOyB4LS0gKXtcclxuXHJcbiAgICAgICAgICAgIGlmICggIVRPYlt4XS5fX19zICl7XHJcbiAgICAgICAgICAgICAgaWYgKCBzZXR0aW5ncy5vblJlbW92ZSAmJlxyXG4gICAgICAgICAgICAgICAgKHJ1bkV2ZW50IHx8IFRBRkZZLmlzVW5kZWZpbmVkKCBydW5FdmVudCApKSApXHJcbiAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgc2V0dGluZ3Mub25SZW1vdmUuY2FsbCggVE9iW3hdICk7XHJcbiAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgIElEW1RPYlt4XS5fX19pZF0gPSB1bmRlZmluZWQ7XHJcbiAgICAgICAgICAgICAgVE9iLnNwbGljZSggeCwgMSApO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgICBJRCA9IHt9O1xyXG4gICAgICAgICAgZWFjaCggVE9iLCBmdW5jdGlvbiAoIHIsIGkgKSB7XHJcbiAgICAgICAgICAgIElEW3IuX19faWRdID0gaTtcclxuICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgREJJLmRtKCBuZXcgRGF0ZSgpICk7XHJcbiAgICAgICAgfSxcclxuICAgICAgICBxdWVyeSA6IGZ1bmN0aW9uICggY29udGV4dCApIHtcclxuICAgICAgICAgIC8vICoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKipcclxuICAgICAgICAgIC8vICpcclxuICAgICAgICAgIC8vICogVGFrZXM6IHRoZSBjb250ZXh0IG9iamVjdCBmb3IgYSBxdWVyeSBhbmQgZWl0aGVyIHJldHVybnMgYSBjYWNoZSByZXN1bHQgb3IgYSBuZXcgcXVlcnkgcmVzdWx0XHJcbiAgICAgICAgICAvLyAqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqIFxyXG4gICAgICAgICAgdmFyIHJldHVybnEsIGNpZCwgcmVzdWx0cywgaW5kZXhlZCwgbGltaXRxLCBuaTtcclxuXHJcbiAgICAgICAgICBpZiAoIHNldHRpbmdzLmNhY2hlU2l6ZSApIHtcclxuICAgICAgICAgICAgY2lkID0gJyc7XHJcbiAgICAgICAgICAgIGVhY2goIGNvbnRleHQuZmlsdGVyUmF3LCBmdW5jdGlvbiAoIHIgKSB7XHJcbiAgICAgICAgICAgICAgaWYgKCBULmlzRnVuY3Rpb24oIHIgKSApe1xyXG4gICAgICAgICAgICAgICAgY2lkID0gJ25vY2FjaGUnO1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIFRBRkZZLkVYSVQ7XHJcbiAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgaWYgKCBjaWQgPT09ICcnICl7XHJcbiAgICAgICAgICAgICAgY2lkID0gbWFrZUNpZCggVC5tZXJnZU9iaiggY29udGV4dCxcclxuICAgICAgICAgICAgICAgIHtxIDogZmFsc2UsIHJ1biA6IGZhbHNlLCBzb3J0IDogZmFsc2V9ICkgKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgfVxyXG4gICAgICAgICAgLy8gUnVuIGEgbmV3IHF1ZXJ5IGlmIHRoZXJlIGFyZSBubyByZXN1bHRzIG9yIHRoZSBydW4gZGF0ZSBoYXMgYmVlbiBjbGVhcmVkXHJcbiAgICAgICAgICBpZiAoICFjb250ZXh0LnJlc3VsdHMgfHwgIWNvbnRleHQucnVuIHx8XHJcbiAgICAgICAgICAgIChjb250ZXh0LnJ1biAmJiBEQkkuZG0oKSA+IGNvbnRleHQucnVuKSApXHJcbiAgICAgICAgICB7XHJcbiAgICAgICAgICAgIHJlc3VsdHMgPSBbXTtcclxuXHJcbiAgICAgICAgICAgIC8vIGNoZWNrIENhY2hlXHJcblxyXG4gICAgICAgICAgICBpZiAoIHNldHRpbmdzLmNhY2hlU2l6ZSAmJiBDYWNoZVtjaWRdICl7XHJcblxyXG4gICAgICAgICAgICAgIENhY2hlW2NpZF0uaSA9IENhY2hlQ291bnQrKztcclxuICAgICAgICAgICAgICByZXR1cm4gQ2FjaGVbY2lkXS5yZXN1bHRzO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICAgIC8vIGlmIG5vIGZpbHRlciwgcmV0dXJuIERCXHJcbiAgICAgICAgICAgICAgaWYgKCBjb250ZXh0LnEubGVuZ3RoID09PSAwICYmIGNvbnRleHQuaW5kZXgubGVuZ3RoID09PSAwICl7XHJcbiAgICAgICAgICAgICAgICBlYWNoKCBUT2IsIGZ1bmN0aW9uICggciApIHtcclxuICAgICAgICAgICAgICAgICAgcmVzdWx0cy5wdXNoKCByICk7XHJcbiAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgICAgIHJldHVybnEgPSByZXN1bHRzO1xyXG4gICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgICAgIC8vIHVzZSBpbmRleGVzXHJcblxyXG4gICAgICAgICAgICAgICAgaW5kZXhlZCA9IHJ1bkluZGV4ZXMoIGNvbnRleHQuaW5kZXggKTtcclxuXHJcbiAgICAgICAgICAgICAgICAvLyBydW4gZmlsdGVyc1xyXG4gICAgICAgICAgICAgICAgZWFjaCggaW5kZXhlZCwgZnVuY3Rpb24gKCByICkge1xyXG4gICAgICAgICAgICAgICAgICAvLyBSdW4gZmlsdGVyIHRvIHNlZSBpZiByZWNvcmQgbWF0Y2hlcyBxdWVyeVxyXG4gICAgICAgICAgICAgICAgICBpZiAoIGNvbnRleHQucS5sZW5ndGggPT09IDAgfHwgcnVuRmlsdGVycyggciwgY29udGV4dC5xICkgKXtcclxuICAgICAgICAgICAgICAgICAgICByZXN1bHRzLnB1c2goIHIgKTtcclxuICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfSk7XHJcblxyXG4gICAgICAgICAgICAgICAgcmV0dXJucSA9IHJlc3VsdHM7XHJcbiAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcblxyXG5cclxuICAgICAgICAgIH1cclxuICAgICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICAvLyBJZiBxdWVyeSBleGlzdHMgYW5kIHJ1biBoYXMgbm90IGJlZW4gY2xlYXJlZCByZXR1cm4gdGhlIGNhY2hlIHJlc3VsdHNcclxuICAgICAgICAgICAgcmV0dXJucSA9IGNvbnRleHQucmVzdWx0cztcclxuICAgICAgICAgIH1cclxuICAgICAgICAgIC8vIElmIGEgY3VzdG9tIG9yZGVyIGFycmF5IGV4aXN0cyBhbmQgdGhlIHJ1biBoYXMgYmVlbiBjbGVhciBvciB0aGUgc29ydCBoYXMgYmVlbiBjbGVhcmVkXHJcbiAgICAgICAgICBpZiAoIGNvbnRleHQub3JkZXIubGVuZ3RoID4gMCAmJiAoIWNvbnRleHQucnVuIHx8ICFjb250ZXh0LnNvcnQpICl7XHJcbiAgICAgICAgICAgIC8vIG9yZGVyIHRoZSByZXN1bHRzXHJcbiAgICAgICAgICAgIHJldHVybnEgPSBvcmRlckJ5Q29sKCByZXR1cm5xLCBjb250ZXh0Lm9yZGVyICk7XHJcbiAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgLy8gSWYgYSBsaW1pdCBvbiB0aGUgbnVtYmVyIG9mIHJlc3VsdHMgZXhpc3RzIGFuZCBpdCBpcyBsZXNzIHRoYW4gdGhlIHJldHVybmVkIHJlc3VsdHMsIGxpbWl0IHJlc3VsdHNcclxuICAgICAgICAgIGlmICggcmV0dXJucS5sZW5ndGggJiZcclxuICAgICAgICAgICAgKChjb250ZXh0LmxpbWl0ICYmIGNvbnRleHQubGltaXQgPCByZXR1cm5xLmxlbmd0aCkgfHxcclxuICAgICAgICAgICAgICBjb250ZXh0LnN0YXJ0KVxyXG4gICAgICAgICAgKSB7XHJcbiAgICAgICAgICAgIGxpbWl0cSA9IFtdO1xyXG4gICAgICAgICAgICBlYWNoKCByZXR1cm5xLCBmdW5jdGlvbiAoIHIsIGkgKSB7XHJcbiAgICAgICAgICAgICAgaWYgKCAhY29udGV4dC5zdGFydCB8fFxyXG4gICAgICAgICAgICAgICAgKGNvbnRleHQuc3RhcnQgJiYgKGkgKyAxKSA+PSBjb250ZXh0LnN0YXJ0KSApXHJcbiAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgaWYgKCBjb250ZXh0LmxpbWl0ICl7XHJcbiAgICAgICAgICAgICAgICAgIG5pID0gKGNvbnRleHQuc3RhcnQpID8gKGkgKyAxKSAtIGNvbnRleHQuc3RhcnQgOiBpO1xyXG4gICAgICAgICAgICAgICAgICBpZiAoIG5pIDwgY29udGV4dC5saW1pdCApe1xyXG4gICAgICAgICAgICAgICAgICAgIGxpbWl0cS5wdXNoKCByICk7XHJcbiAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgZWxzZSBpZiAoIG5pID4gY29udGV4dC5saW1pdCApe1xyXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBUQUZGWS5FWElUO1xyXG4gICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgbGltaXRxLnB1c2goIHIgKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICByZXR1cm5xID0gbGltaXRxO1xyXG4gICAgICAgICAgfVxyXG5cclxuICAgICAgICAgIC8vIHVwZGF0ZSBjYWNoZVxyXG4gICAgICAgICAgaWYgKCBzZXR0aW5ncy5jYWNoZVNpemUgJiYgY2lkICE9PSAnbm9jYWNoZScgKXtcclxuICAgICAgICAgICAgQ2FjaGVDbGVhcisrO1xyXG5cclxuICAgICAgICAgICAgc2V0VGltZW91dCggZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICAgIHZhciBiQ291bnRlciwgbmM7XHJcbiAgICAgICAgICAgICAgaWYgKCBDYWNoZUNsZWFyID49IHNldHRpbmdzLmNhY2hlU2l6ZSAqIDIgKXtcclxuICAgICAgICAgICAgICAgIENhY2hlQ2xlYXIgPSAwO1xyXG4gICAgICAgICAgICAgICAgYkNvdW50ZXIgPSBDYWNoZUNvdW50IC0gc2V0dGluZ3MuY2FjaGVTaXplO1xyXG4gICAgICAgICAgICAgICAgbmMgPSB7fTtcclxuICAgICAgICAgICAgICAgIGVhY2hpbiggZnVuY3Rpb24gKCByLCBrICkge1xyXG4gICAgICAgICAgICAgICAgICBpZiAoIHIuaSA+PSBiQ291bnRlciApe1xyXG4gICAgICAgICAgICAgICAgICAgIG5jW2tdID0gcjtcclxuICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICAgICBDYWNoZSA9IG5jO1xyXG4gICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfSwgMCApO1xyXG5cclxuICAgICAgICAgICAgQ2FjaGVbY2lkXSA9IHsgaSA6IENhY2hlQ291bnQrKywgcmVzdWx0cyA6IHJldHVybnEgfTtcclxuICAgICAgICAgIH1cclxuICAgICAgICAgIHJldHVybiByZXR1cm5xO1xyXG4gICAgICAgIH1cclxuICAgICAgfTtcclxuXHJcblxyXG4gICAgICByb290ID0gZnVuY3Rpb24gKCkge1xyXG4gICAgICAgIHZhciBpQVBJLCBjb250ZXh0O1xyXG4gICAgICAgIC8vICoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKipcclxuICAgICAgICAvLyAqXHJcbiAgICAgICAgLy8gKiBUaGUgcm9vdCBmdW5jdGlvbiB0aGF0IGdldHMgcmV0dXJuZWQgd2hlbiBhIG5ldyBEQiBpcyBjcmVhdGVkXHJcbiAgICAgICAgLy8gKiBUYWtlczogdW5saW1pdGVkIGZpbHRlciBhcmd1bWVudHMgYW5kIGNyZWF0ZXMgZmlsdGVycyB0byBiZSBydW4gd2hlbiBhIHF1ZXJ5IGlzIGNhbGxlZFxyXG4gICAgICAgIC8vICoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKiogXHJcbiAgICAgICAgLy8gKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKlxyXG4gICAgICAgIC8vICpcclxuICAgICAgICAvLyAqIGlBUEkgaXMgdGhlIHRoZSBtZXRob2QgY29sbGVjdGlvbiB2YWxpYWJsZSB3aGVuIGEgcXVlcnkgaGFzIGJlZW4gc3RhcnRlZCBieSBjYWxsaW5nIGRibmFtZVxyXG4gICAgICAgIC8vICogQ2VydGFpbiBtZXRob2RzIGFyZSBvciBhcmUgbm90IGF2YWxpYWJsZSBvbmNlIHlvdSBoYXZlIHN0YXJ0ZWQgYSBxdWVyeSBzdWNoIGFzIGluc2VydCAtLSB5b3UgY2FuIG9ubHkgaW5zZXJ0IGludG8gcm9vdFxyXG4gICAgICAgIC8vICoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKipcclxuICAgICAgICBpQVBJID0gVEFGRlkubWVyZ2VPYmooIFRBRkZZLm1lcmdlT2JqKCBBUEksIHsgaW5zZXJ0IDogdW5kZWZpbmVkIH0gKSxcclxuICAgICAgICAgIHsgZ2V0REJJICA6IGZ1bmN0aW9uICgpIHsgcmV0dXJuIERCSTsgfSxcclxuICAgICAgICAgICAgZ2V0cm9vdCA6IGZ1bmN0aW9uICggYyApIHsgcmV0dXJuIHJvb3QuY2FsbCggYyApOyB9LFxyXG4gICAgICAgICAgY29udGV4dCA6IGZ1bmN0aW9uICggbiApIHtcclxuICAgICAgICAgICAgLy8gKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKlxyXG4gICAgICAgICAgICAvLyAqXHJcbiAgICAgICAgICAgIC8vICogVGhlIGNvbnRleHQgY29udGFpbnMgYWxsIHRoZSBpbmZvcm1hdGlvbiB0byBtYW5hZ2UgYSBxdWVyeSBpbmNsdWRpbmcgZmlsdGVycywgbGltaXRzLCBhbmQgc29ydHNcclxuICAgICAgICAgICAgLy8gKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKiBcclxuICAgICAgICAgICAgaWYgKCBuICl7XHJcbiAgICAgICAgICAgICAgY29udGV4dCA9IFRBRkZZLm1lcmdlT2JqKCBjb250ZXh0LFxyXG4gICAgICAgICAgICAgICAgbi5oYXNPd25Qcm9wZXJ0eSgncmVzdWx0cycpXHJcbiAgICAgICAgICAgICAgICAgID8gVEFGRlkubWVyZ2VPYmooIG4sIHsgcnVuIDogbmV3IERhdGUoKSwgc29ydDogbmV3IERhdGUoKSB9KVxyXG4gICAgICAgICAgICAgICAgICA6IG5cclxuICAgICAgICAgICAgICApO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHJldHVybiBjb250ZXh0O1xyXG4gICAgICAgICAgfSxcclxuICAgICAgICAgIGV4dGVuZCAgOiB1bmRlZmluZWRcclxuICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgY29udGV4dCA9ICh0aGlzICYmIHRoaXMucSkgPyB0aGlzIDoge1xyXG4gICAgICAgICAgbGltaXQgICAgIDogZmFsc2UsXHJcbiAgICAgICAgICBzdGFydCAgICAgOiBmYWxzZSxcclxuICAgICAgICAgIHEgICAgICAgICA6IFtdLFxyXG4gICAgICAgICAgZmlsdGVyUmF3IDogW10sXHJcbiAgICAgICAgICBpbmRleCAgICAgOiBbXSxcclxuICAgICAgICAgIG9yZGVyICAgICA6IFtdLFxyXG4gICAgICAgICAgcmVzdWx0cyAgIDogZmFsc2UsXHJcbiAgICAgICAgICBydW4gICAgICAgOiBudWxsLFxyXG4gICAgICAgICAgc29ydCAgICAgIDogbnVsbCxcclxuICAgICAgICAgIHNldHRpbmdzICA6IHNldHRpbmdzXHJcbiAgICAgICAgfTtcclxuICAgICAgICAvLyAqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqXHJcbiAgICAgICAgLy8gKlxyXG4gICAgICAgIC8vICogQ2FsbCB0aGUgcXVlcnkgbWV0aG9kIHRvIHNldHVwIGEgbmV3IHF1ZXJ5XHJcbiAgICAgICAgLy8gKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKiBcclxuICAgICAgICBlYWNoKCBhcmd1bWVudHMsIGZ1bmN0aW9uICggZiApIHtcclxuXHJcbiAgICAgICAgICBpZiAoIGlzSW5kZXhhYmxlKCBmICkgKXtcclxuICAgICAgICAgICAgY29udGV4dC5pbmRleC5wdXNoKCBmICk7XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgY29udGV4dC5xLnB1c2goIHJldHVybkZpbHRlciggZiApICk7XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgICBjb250ZXh0LmZpbHRlclJhdy5wdXNoKCBmICk7XHJcbiAgICAgICAgfSk7XHJcblxyXG5cclxuICAgICAgICByZXR1cm4gaUFQSTtcclxuICAgICAgfTtcclxuXHJcbiAgICAgIC8vICoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKipcclxuICAgICAgLy8gKlxyXG4gICAgICAvLyAqIElmIG5ldyByZWNvcmRzIGhhdmUgYmVlbiBwYXNzZWQgb24gY3JlYXRpb24gb2YgdGhlIERCIGVpdGhlciBhcyBKU09OIG9yIGFzIGFuIGFycmF5L29iamVjdCwgaW5zZXJ0IHRoZW1cclxuICAgICAgLy8gKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKiBcclxuICAgICAgVEMrKztcclxuICAgICAgaWYgKCBkICl7XHJcbiAgICAgICAgREJJLmluc2VydCggZCApO1xyXG4gICAgICB9XHJcblxyXG5cclxuICAgICAgcm9vdC5pbnNlcnQgPSBEQkkuaW5zZXJ0O1xyXG5cclxuICAgICAgcm9vdC5tZXJnZSA9IGZ1bmN0aW9uICggaSwga2V5LCBydW5FdmVudCApIHtcclxuICAgICAgICB2YXJcclxuICAgICAgICAgIHNlYXJjaCAgICAgID0ge30sXHJcbiAgICAgICAgICBmaW5hbFNlYXJjaCA9IFtdLFxyXG4gICAgICAgICAgb2JqICAgICAgICAgPSB7fVxyXG4gICAgICAgICAgO1xyXG5cclxuICAgICAgICBydW5FdmVudCAgICA9IHJ1bkV2ZW50IHx8IGZhbHNlO1xyXG4gICAgICAgIGtleSAgICAgICAgID0ga2V5ICAgICAgfHwgJ2lkJztcclxuXHJcbiAgICAgICAgZWFjaCggaSwgZnVuY3Rpb24gKCBvICkge1xyXG4gICAgICAgICAgdmFyIGV4aXN0aW5nT2JqZWN0O1xyXG4gICAgICAgICAgc2VhcmNoW2tleV0gPSBvW2tleV07XHJcbiAgICAgICAgICBmaW5hbFNlYXJjaC5wdXNoKCBvW2tleV0gKTtcclxuICAgICAgICAgIGV4aXN0aW5nT2JqZWN0ID0gcm9vdCggc2VhcmNoICkuZmlyc3QoKTtcclxuICAgICAgICAgIGlmICggZXhpc3RpbmdPYmplY3QgKXtcclxuICAgICAgICAgICAgREJJLnVwZGF0ZSggZXhpc3RpbmdPYmplY3QuX19faWQsIG8sIHJ1bkV2ZW50ICk7XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgREJJLmluc2VydCggbywgcnVuRXZlbnQgKTtcclxuICAgICAgICAgIH1cclxuICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgb2JqW2tleV0gPSBmaW5hbFNlYXJjaDtcclxuICAgICAgICByZXR1cm4gcm9vdCggb2JqICk7XHJcbiAgICAgIH07XHJcblxyXG4gICAgICByb290LlRBRkZZID0gdHJ1ZTtcclxuICAgICAgcm9vdC5zb3J0ID0gREJJLnNvcnQ7XHJcbiAgICAgIC8vICoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKipcclxuICAgICAgLy8gKlxyXG4gICAgICAvLyAqIFRoZXNlIGFyZSB0aGUgbWV0aG9kcyB0aGF0IGNhbiBiZSBhY2Nlc3NlZCBvbiBvZmYgdGhlIHJvb3QgREIgZnVuY3Rpb24uIEV4YW1wbGUgZGJuYW1lLmluc2VydDtcclxuICAgICAgLy8gKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKiBcclxuICAgICAgcm9vdC5zZXR0aW5ncyA9IGZ1bmN0aW9uICggbiApIHtcclxuICAgICAgICAvLyAqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqXHJcbiAgICAgICAgLy8gKlxyXG4gICAgICAgIC8vICogR2V0dGluZyBhbmQgc2V0dGluZyBmb3IgdGhpcyBEQidzIHNldHRpbmdzL2V2ZW50c1xyXG4gICAgICAgIC8vICoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKiogXHJcbiAgICAgICAgaWYgKCBuICl7XHJcbiAgICAgICAgICBzZXR0aW5ncyA9IFRBRkZZLm1lcmdlT2JqKCBzZXR0aW5ncywgbiApO1xyXG4gICAgICAgICAgaWYgKCBuLnRlbXBsYXRlICl7XHJcblxyXG4gICAgICAgICAgICByb290KCkudXBkYXRlKCBuLnRlbXBsYXRlICk7XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiBzZXR0aW5ncztcclxuICAgICAgfTtcclxuXHJcbiAgICAgIC8vICoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKipcclxuICAgICAgLy8gKlxyXG4gICAgICAvLyAqIFRoZXNlIGFyZSB0aGUgbWV0aG9kcyB0aGF0IGNhbiBiZSBhY2Nlc3NlZCBvbiBvZmYgdGhlIHJvb3QgREIgZnVuY3Rpb24uIEV4YW1wbGUgZGJuYW1lLmluc2VydDtcclxuICAgICAgLy8gKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKiBcclxuICAgICAgcm9vdC5zdG9yZSA9IGZ1bmN0aW9uICggbiApIHtcclxuICAgICAgICAvLyAqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqXHJcbiAgICAgICAgLy8gKlxyXG4gICAgICAgIC8vICogU2V0dXAgbG9jYWxzdG9yYWdlIGZvciB0aGlzIERCIG9uIGEgZ2l2ZW4gbmFtZVxyXG4gICAgICAgIC8vICogUHVsbCBkYXRhIGludG8gdGhlIERCIGFzIG5lZWRlZFxyXG4gICAgICAgIC8vICoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKiogXHJcbiAgICAgICAgdmFyIHIgPSBmYWxzZSwgaTtcclxuICAgICAgICBpZiAoIGxvY2FsU3RvcmFnZSApe1xyXG4gICAgICAgICAgaWYgKCBuICl7XHJcbiAgICAgICAgICAgIGkgPSBsb2NhbFN0b3JhZ2UuZ2V0SXRlbSggJ3RhZmZ5XycgKyBuICk7XHJcbiAgICAgICAgICAgIGlmICggaSAmJiBpLmxlbmd0aCA+IDAgKXtcclxuICAgICAgICAgICAgICByb290Lmluc2VydCggaSApO1xyXG4gICAgICAgICAgICAgIHIgPSB0cnVlO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGlmICggVE9iLmxlbmd0aCA+IDAgKXtcclxuICAgICAgICAgICAgICBzZXRUaW1lb3V0KCBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgICAgICBsb2NhbFN0b3JhZ2Uuc2V0SXRlbSggJ3RhZmZ5XycgKyBzZXR0aW5ncy5zdG9yYWdlTmFtZSxcclxuICAgICAgICAgICAgICAgICAgSlNPTi5zdHJpbmdpZnkoIFRPYiApICk7XHJcbiAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgIH1cclxuICAgICAgICAgIHJvb3Quc2V0dGluZ3MoIHtzdG9yYWdlTmFtZSA6IG59ICk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiByb290O1xyXG4gICAgICB9O1xyXG5cclxuICAgICAgLy8gKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKlxyXG4gICAgICAvLyAqXHJcbiAgICAgIC8vICogUmV0dXJuIHJvb3Qgb24gREIgY3JlYXRpb24gYW5kIHN0YXJ0IGhhdmluZyBmdW5cclxuICAgICAgLy8gKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKiBcclxuICAgICAgcmV0dXJuIHJvb3Q7XHJcbiAgICB9O1xyXG4gICAgLy8gKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKlxyXG4gICAgLy8gKlxyXG4gICAgLy8gKiBTZXRzIHRoZSBnbG9iYWwgVEFGRlkgb2JqZWN0XHJcbiAgICAvLyAqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqIFxyXG4gICAgVEFGRlkgPSBUO1xyXG5cclxuXHJcbiAgICAvLyAqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqXHJcbiAgICAvLyAqXHJcbiAgICAvLyAqIENyZWF0ZSBwdWJsaWMgZWFjaCBtZXRob2RcclxuICAgIC8vICpcclxuICAgIC8vICoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKiogICBcclxuICAgIFQuZWFjaCA9IGVhY2g7XHJcblxyXG4gICAgLy8gKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKlxyXG4gICAgLy8gKlxyXG4gICAgLy8gKiBDcmVhdGUgcHVibGljIGVhY2hpbiBtZXRob2RcclxuICAgIC8vICpcclxuICAgIC8vICoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKiogICBcclxuICAgIFQuZWFjaGluID0gZWFjaGluO1xyXG4gICAgLy8gKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKlxyXG4gICAgLy8gKlxyXG4gICAgLy8gKiBDcmVhdGUgcHVibGljIGV4dGVuZCBtZXRob2RcclxuICAgIC8vICogQWRkIGEgY3VzdG9tIG1ldGhvZCB0byB0aGUgQVBJXHJcbiAgICAvLyAqXHJcbiAgICAvLyAqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqICAgXHJcbiAgICBULmV4dGVuZCA9IEFQSS5leHRlbmQ7XHJcblxyXG5cclxuICAgIC8vICoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKipcclxuICAgIC8vICpcclxuICAgIC8vICogQ3JlYXRlcyBUQUZGWS5FWElUIHZhbHVlIHRoYXQgY2FuIGJlIHJldHVybmVkIHRvIHN0b3AgYW4gZWFjaCBsb29wXHJcbiAgICAvLyAqXHJcbiAgICAvLyAqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqICBcclxuICAgIFRBRkZZLkVYSVQgPSAnVEFGRllFWElUJztcclxuXHJcbiAgICAvLyAqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqXHJcbiAgICAvLyAqXHJcbiAgICAvLyAqIENyZWF0ZSBwdWJsaWMgdXRpbGl0eSBtZXJnZU9iaiBtZXRob2RcclxuICAgIC8vICogUmV0dXJuIGEgbmV3IG9iamVjdCB3aGVyZSBpdGVtcyBmcm9tIG9iajJcclxuICAgIC8vICogaGF2ZSByZXBsYWNlZCBvciBiZWVuIGFkZGVkIHRvIHRoZSBpdGVtcyBpblxyXG4gICAgLy8gKiBvYmoxXHJcbiAgICAvLyAqIFB1cnBvc2U6IFVzZWQgdG8gY29tYmluZSBvYmpzXHJcbiAgICAvLyAqXHJcbiAgICAvLyAqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqICAgXHJcbiAgICBUQUZGWS5tZXJnZU9iaiA9IGZ1bmN0aW9uICggb2IxLCBvYjIgKSB7XHJcbiAgICAgIHZhciBjID0ge307XHJcbiAgICAgIGVhY2hpbiggb2IxLCBmdW5jdGlvbiAoIHYsIG4gKSB7IGNbbl0gPSBvYjFbbl07IH0pO1xyXG4gICAgICBlYWNoaW4oIG9iMiwgZnVuY3Rpb24gKCB2LCBuICkgeyBjW25dID0gb2IyW25dOyB9KTtcclxuICAgICAgcmV0dXJuIGM7XHJcbiAgICB9O1xyXG5cclxuXHJcbiAgICAvLyAqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqXHJcbiAgICAvLyAqXHJcbiAgICAvLyAqIENyZWF0ZSBwdWJsaWMgdXRpbGl0eSBoYXMgbWV0aG9kXHJcbiAgICAvLyAqIFJldHVybnMgdHJ1ZSBpZiBhIGNvbXBsZXggb2JqZWN0LCBhcnJheVxyXG4gICAgLy8gKiBvciB0YWZmeSBjb2xsZWN0aW9uIGNvbnRhaW5zIHRoZSBtYXRlcmlhbFxyXG4gICAgLy8gKiBwcm92aWRlZCBpbiB0aGUgc2Vjb25kIGFyZ3VtZW50XHJcbiAgICAvLyAqIFB1cnBvc2U6IFVzZWQgdG8gY29tYXJlIG9iamVjdHNcclxuICAgIC8vICpcclxuICAgIC8vICoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKipcclxuICAgIFRBRkZZLmhhcyA9IGZ1bmN0aW9uICggdmFyMSwgdmFyMiApIHtcclxuXHJcbiAgICAgIHZhciByZSA9IGZhbHNlLCBuO1xyXG5cclxuICAgICAgaWYgKCAodmFyMS5UQUZGWSkgKXtcclxuICAgICAgICByZSA9IHZhcjEoIHZhcjIgKTtcclxuICAgICAgICBpZiAoIHJlLmxlbmd0aCA+IDAgKXtcclxuICAgICAgICAgIHJldHVybiB0cnVlO1xyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNlIHtcclxuICAgICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuICAgICAgZWxzZSB7XHJcblxyXG4gICAgICAgIHN3aXRjaCAoIFQudHlwZU9mKCB2YXIxICkgKXtcclxuICAgICAgICAgIGNhc2UgJ29iamVjdCc6XHJcbiAgICAgICAgICAgIGlmICggVC5pc09iamVjdCggdmFyMiApICl7XHJcbiAgICAgICAgICAgICAgZWFjaGluKCB2YXIyLCBmdW5jdGlvbiAoIHYsIG4gKSB7XHJcbiAgICAgICAgICAgICAgICBpZiAoIHJlID09PSB0cnVlICYmICFULmlzVW5kZWZpbmVkKCB2YXIxW25dICkgJiZcclxuICAgICAgICAgICAgICAgICAgdmFyMS5oYXNPd25Qcm9wZXJ0eSggbiApIClcclxuICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgcmUgPSBULmhhcyggdmFyMVtuXSwgdmFyMltuXSApO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgIHJlID0gZmFsc2U7XHJcbiAgICAgICAgICAgICAgICAgIHJldHVybiBUQUZGWS5FWElUO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGVsc2UgaWYgKCBULmlzQXJyYXkoIHZhcjIgKSApe1xyXG4gICAgICAgICAgICAgIGVhY2goIHZhcjIsIGZ1bmN0aW9uICggdiwgbiApIHtcclxuICAgICAgICAgICAgICAgIHJlID0gVC5oYXMoIHZhcjEsIHZhcjJbbl0gKTtcclxuICAgICAgICAgICAgICAgIGlmICggcmUgKXtcclxuICAgICAgICAgICAgICAgICAgcmV0dXJuIFRBRkZZLkVYSVQ7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgZWxzZSBpZiAoIFQuaXNTdHJpbmcoIHZhcjIgKSApe1xyXG4gICAgICAgICAgICAgIGlmICggIVRBRkZZLmlzVW5kZWZpbmVkKCB2YXIxW3ZhcjJdICkgKXtcclxuICAgICAgICAgICAgICAgIHJldHVybiB0cnVlO1xyXG4gICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgcmV0dXJuIHJlO1xyXG4gICAgICAgICAgY2FzZSAnYXJyYXknOlxyXG4gICAgICAgICAgICBpZiAoIFQuaXNPYmplY3QoIHZhcjIgKSApe1xyXG4gICAgICAgICAgICAgIGVhY2goIHZhcjEsIGZ1bmN0aW9uICggdiwgaSApIHtcclxuICAgICAgICAgICAgICAgIHJlID0gVC5oYXMoIHZhcjFbaV0sIHZhcjIgKTtcclxuICAgICAgICAgICAgICAgIGlmICggcmUgPT09IHRydWUgKXtcclxuICAgICAgICAgICAgICAgICAgcmV0dXJuIFRBRkZZLkVYSVQ7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgZWxzZSBpZiAoIFQuaXNBcnJheSggdmFyMiApICl7XHJcbiAgICAgICAgICAgICAgZWFjaCggdmFyMiwgZnVuY3Rpb24gKCB2MiwgaTIgKSB7XHJcbiAgICAgICAgICAgICAgICBlYWNoKCB2YXIxLCBmdW5jdGlvbiAoIHYxLCBpMSApIHtcclxuICAgICAgICAgICAgICAgICAgcmUgPSBULmhhcyggdmFyMVtpMV0sIHZhcjJbaTJdICk7XHJcbiAgICAgICAgICAgICAgICAgIGlmICggcmUgPT09IHRydWUgKXtcclxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gVEFGRlkuRVhJVDtcclxuICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICAgICBpZiAoIHJlID09PSB0cnVlICl7XHJcbiAgICAgICAgICAgICAgICAgIHJldHVybiBUQUZGWS5FWElUO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGVsc2UgaWYgKCBULmlzU3RyaW5nKCB2YXIyICkgfHwgVC5pc051bWJlciggdmFyMiApICl7XHJcbiAgICAgICAgICAgICByZSA9IGZhbHNlO1xyXG4gICAgICAgICAgICAgIGZvciAoIG4gPSAwOyBuIDwgdmFyMS5sZW5ndGg7IG4rKyApe1xyXG4gICAgICAgICAgICAgICAgcmUgPSBULmhhcyggdmFyMVtuXSwgdmFyMiApO1xyXG4gICAgICAgICAgICAgICAgaWYgKCByZSApe1xyXG4gICAgICAgICAgICAgICAgICByZXR1cm4gdHJ1ZTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgcmV0dXJuIHJlO1xyXG4gICAgICAgICAgY2FzZSAnc3RyaW5nJzpcclxuICAgICAgICAgICAgaWYgKCBULmlzU3RyaW5nKCB2YXIyICkgJiYgdmFyMiA9PT0gdmFyMSApe1xyXG4gICAgICAgICAgICAgIHJldHVybiB0cnVlO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgZGVmYXVsdDpcclxuICAgICAgICAgICAgaWYgKCBULnR5cGVPZiggdmFyMSApID09PSBULnR5cGVPZiggdmFyMiApICYmIHZhcjEgPT09IHZhcjIgKXtcclxuICAgICAgICAgICAgICByZXR1cm4gdHJ1ZTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBicmVhaztcclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgfTtcclxuXHJcbiAgICAvLyAqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqXHJcbiAgICAvLyAqXHJcbiAgICAvLyAqIENyZWF0ZSBwdWJsaWMgdXRpbGl0eSBoYXNBbGwgbWV0aG9kXHJcbiAgICAvLyAqIFJldHVybnMgdHJ1ZSBpZiBhIGNvbXBsZXggb2JqZWN0LCBhcnJheVxyXG4gICAgLy8gKiBvciB0YWZmeSBjb2xsZWN0aW9uIGNvbnRhaW5zIHRoZSBtYXRlcmlhbFxyXG4gICAgLy8gKiBwcm92aWRlZCBpbiB0aGUgY2FsbCAtIGZvciBhcnJheXMgaXQgbXVzdFxyXG4gICAgLy8gKiBjb250YWluIGFsbCB0aGUgbWF0ZXJpYWwgaW4gZWFjaCBhcnJheSBpdGVtXHJcbiAgICAvLyAqIFB1cnBvc2U6IFVzZWQgdG8gY29tYXJlIG9iamVjdHNcclxuICAgIC8vICpcclxuICAgIC8vICoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKipcclxuICAgIFRBRkZZLmhhc0FsbCA9IGZ1bmN0aW9uICggdmFyMSwgdmFyMiApIHtcclxuXHJcbiAgICAgIHZhciBUID0gVEFGRlksIGFyO1xyXG4gICAgICBpZiAoIFQuaXNBcnJheSggdmFyMiApICl7XHJcbiAgICAgICAgYXIgPSB0cnVlO1xyXG4gICAgICAgIGVhY2goIHZhcjIsIGZ1bmN0aW9uICggdiApIHtcclxuICAgICAgICAgIGFyID0gVC5oYXMoIHZhcjEsIHYgKTtcclxuICAgICAgICAgIGlmICggYXIgPT09IGZhbHNlICl7XHJcbiAgICAgICAgICAgIHJldHVybiBUQUZGWS5FWElUO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgIH0pO1xyXG4gICAgICAgIHJldHVybiBhcjtcclxuICAgICAgfVxyXG4gICAgICBlbHNlIHtcclxuICAgICAgICByZXR1cm4gVC5oYXMoIHZhcjEsIHZhcjIgKTtcclxuICAgICAgfVxyXG4gICAgfTtcclxuXHJcblxyXG4gICAgLy8gKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKlxyXG4gICAgLy8gKlxyXG4gICAgLy8gKiB0eXBlT2YgRml4ZWQgaW4gSmF2YVNjcmlwdCBhcyBwdWJsaWMgdXRpbGl0eVxyXG4gICAgLy8gKlxyXG4gICAgLy8gKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKlxyXG4gICAgVEFGRlkudHlwZU9mID0gZnVuY3Rpb24gKCB2ICkge1xyXG4gICAgICB2YXIgcyA9IHR5cGVvZiB2O1xyXG4gICAgICBpZiAoIHMgPT09ICdvYmplY3QnICl7XHJcbiAgICAgICAgaWYgKCB2ICl7XHJcbiAgICAgICAgICBpZiAoIHR5cGVvZiB2Lmxlbmd0aCA9PT0gJ251bWJlcicgJiZcclxuICAgICAgICAgICAgISh2LnByb3BlcnR5SXNFbnVtZXJhYmxlKCAnbGVuZ3RoJyApKSApXHJcbiAgICAgICAgICB7XHJcbiAgICAgICAgICAgIHMgPSAnYXJyYXknO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNlIHtcclxuICAgICAgICAgIHMgPSAnbnVsbCc7XHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcbiAgICAgIHJldHVybiBzO1xyXG4gICAgfTtcclxuXHJcbiAgICAvLyAqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqXHJcbiAgICAvLyAqXHJcbiAgICAvLyAqIENyZWF0ZSBwdWJsaWMgdXRpbGl0eSBnZXRPYmplY3RLZXlzIG1ldGhvZFxyXG4gICAgLy8gKiBSZXR1cm5zIGFuIGFycmF5IG9mIGFuIG9iamVjdHMga2V5c1xyXG4gICAgLy8gKiBQdXJwb3NlOiBVc2VkIHRvIGdldCB0aGUga2V5cyBmb3IgYW4gb2JqZWN0XHJcbiAgICAvLyAqXHJcbiAgICAvLyAqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqICAgXHJcbiAgICBUQUZGWS5nZXRPYmplY3RLZXlzID0gZnVuY3Rpb24gKCBvYiApIHtcclxuICAgICAgdmFyIGtBID0gW107XHJcbiAgICAgIGVhY2hpbiggb2IsIGZ1bmN0aW9uICggbiwgaCApIHtcclxuICAgICAgICBrQS5wdXNoKCBoICk7XHJcbiAgICAgIH0pO1xyXG4gICAgICBrQS5zb3J0KCk7XHJcbiAgICAgIHJldHVybiBrQTtcclxuICAgIH07XHJcblxyXG4gICAgLy8gKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKlxyXG4gICAgLy8gKlxyXG4gICAgLy8gKiBDcmVhdGUgcHVibGljIHV0aWxpdHkgaXNTYW1lQXJyYXlcclxuICAgIC8vICogUmV0dXJucyBhbiBhcnJheSBvZiBhbiBvYmplY3RzIGtleXNcclxuICAgIC8vICogUHVycG9zZTogVXNlZCB0byBnZXQgdGhlIGtleXMgZm9yIGFuIG9iamVjdFxyXG4gICAgLy8gKlxyXG4gICAgLy8gKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKiAgIFxyXG4gICAgVEFGRlkuaXNTYW1lQXJyYXkgPSBmdW5jdGlvbiAoIGFyMSwgYXIyICkge1xyXG4gICAgICByZXR1cm4gKFRBRkZZLmlzQXJyYXkoIGFyMSApICYmIFRBRkZZLmlzQXJyYXkoIGFyMiApICYmXHJcbiAgICAgICAgYXIxLmpvaW4oICcsJyApID09PSBhcjIuam9pbiggJywnICkpID8gdHJ1ZSA6IGZhbHNlO1xyXG4gICAgfTtcclxuXHJcbiAgICAvLyAqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqXHJcbiAgICAvLyAqXHJcbiAgICAvLyAqIENyZWF0ZSBwdWJsaWMgdXRpbGl0eSBpc1NhbWVPYmplY3QgbWV0aG9kXHJcbiAgICAvLyAqIFJldHVybnMgdHJ1ZSBpZiBvYmplY3RzIGNvbnRhaW4gdGhlIHNhbWVcclxuICAgIC8vICogbWF0ZXJpYWwgb3IgZmFsc2UgaWYgdGhleSBkbyBub3RcclxuICAgIC8vICogUHVycG9zZTogVXNlZCB0byBjb21hcmUgb2JqZWN0c1xyXG4gICAgLy8gKlxyXG4gICAgLy8gKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKiAgIFxyXG4gICAgVEFGRlkuaXNTYW1lT2JqZWN0ID0gZnVuY3Rpb24gKCBvYjEsIG9iMiApIHtcclxuICAgICAgdmFyIFQgPSBUQUZGWSwgcnYgPSB0cnVlO1xyXG5cclxuICAgICAgaWYgKCBULmlzT2JqZWN0KCBvYjEgKSAmJiBULmlzT2JqZWN0KCBvYjIgKSApe1xyXG4gICAgICAgIGlmICggVC5pc1NhbWVBcnJheSggVC5nZXRPYmplY3RLZXlzKCBvYjEgKSxcclxuICAgICAgICAgIFQuZ2V0T2JqZWN0S2V5cyggb2IyICkgKSApXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgZWFjaGluKCBvYjEsIGZ1bmN0aW9uICggdiwgbiApIHtcclxuICAgICAgICAgICAgaWYgKCAhICggKFQuaXNPYmplY3QoIG9iMVtuXSApICYmIFQuaXNPYmplY3QoIG9iMltuXSApICYmXHJcbiAgICAgICAgICAgICAgVC5pc1NhbWVPYmplY3QoIG9iMVtuXSwgb2IyW25dICkpIHx8XHJcbiAgICAgICAgICAgICAgKFQuaXNBcnJheSggb2IxW25dICkgJiYgVC5pc0FycmF5KCBvYjJbbl0gKSAmJlxyXG4gICAgICAgICAgICAgICAgVC5pc1NhbWVBcnJheSggb2IxW25dLCBvYjJbbl0gKSkgfHwgKG9iMVtuXSA9PT0gb2IyW25dKSApXHJcbiAgICAgICAgICAgICkge1xyXG4gICAgICAgICAgICAgIHJ2ID0gZmFsc2U7XHJcbiAgICAgICAgICAgICAgcmV0dXJuIFRBRkZZLkVYSVQ7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgIH0pO1xyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNlIHtcclxuICAgICAgICAgIHJ2ID0gZmFsc2U7XHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcbiAgICAgIGVsc2Uge1xyXG4gICAgICAgIHJ2ID0gZmFsc2U7XHJcbiAgICAgIH1cclxuICAgICAgcmV0dXJuIHJ2O1xyXG4gICAgfTtcclxuXHJcbiAgICAvLyAqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqXHJcbiAgICAvLyAqXHJcbiAgICAvLyAqIENyZWF0ZSBwdWJsaWMgdXRpbGl0eSBpc1tEYXRhVHlwZV0gbWV0aG9kc1xyXG4gICAgLy8gKiBSZXR1cm4gdHJ1ZSBpZiBvYmogaXMgZGF0YXR5cGUsIGZhbHNlIG90aGVyd2lzZVxyXG4gICAgLy8gKiBQdXJwb3NlOiBVc2VkIHRvIGRldGVybWluZSBpZiBhcmd1bWVudHMgYXJlIG9mIGNlcnRhaW4gZGF0YSB0eXBlXHJcbiAgICAvLyAqXHJcbiAgICAvLyAqIG1taWtvd3NraSAyMDEyLTA4LTA2IHJlZmFjdG9yZWQgdG8gbWFrZSBtdWNoIGxlc3MgXCJtYWdpY2FsXCI6XHJcbiAgICAvLyAqICAgZmV3ZXIgY2xvc3VyZXMgYW5kIHBhc3NlcyBqc2xpbnRcclxuICAgIC8vICpcclxuICAgIC8vICoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKipcclxuXHJcbiAgICB0eXBlTGlzdCA9IFtcclxuICAgICAgJ1N0cmluZycsICAnTnVtYmVyJywgJ09iamVjdCcsICAgJ0FycmF5JyxcclxuICAgICAgJ0Jvb2xlYW4nLCAnTnVsbCcsICAgJ0Z1bmN0aW9uJywgJ1VuZGVmaW5lZCdcclxuICAgIF07XHJcbiAgXHJcbiAgICBtYWtlVGVzdCA9IGZ1bmN0aW9uICggdGhpc0tleSApIHtcclxuICAgICAgcmV0dXJuIGZ1bmN0aW9uICggZGF0YSApIHtcclxuICAgICAgICByZXR1cm4gVEFGRlkudHlwZU9mKCBkYXRhICkgPT09IHRoaXNLZXkudG9Mb3dlckNhc2UoKSA/IHRydWUgOiBmYWxzZTtcclxuICAgICAgfTtcclxuICAgIH07XHJcbiAgXHJcbiAgICBmb3IgKCBpZHggPSAwOyBpZHggPCB0eXBlTGlzdC5sZW5ndGg7IGlkeCsrICl7XHJcbiAgICAgIHR5cGVLZXkgPSB0eXBlTGlzdFtpZHhdO1xyXG4gICAgICBUQUZGWVsnaXMnICsgdHlwZUtleV0gPSBtYWtlVGVzdCggdHlwZUtleSApO1xyXG4gICAgfVxyXG4gIH1cclxufSgpKTtcclxuXHJcbmlmICggdHlwZW9mKGV4cG9ydHMpID09PSAnb2JqZWN0JyApe1xyXG4gIGV4cG9ydHMudGFmZnkgPSBUQUZGWTtcclxufVxyXG5cclxuIiwiLypcbiAqIGF1ZGlvLmpzXG4gKiBXZWIgQXVkaW8gQVBJIG1ldGhvZHNcbiovXG4vKiBnbG9iYWwgJCwgd2luZG93LCBBdWRpb0NvbnRleHQsIFhNTEh0dHBSZXF1ZXN0LCBBdWRpbyovXG4ndXNlIHN0cmljdCc7XG5cbnZhciBhdWRpbyA9IChmdW5jdGlvbiAoKSB7XG5cbiAgICAvLy0tLS0tLS0tLS0tLS0tLS0gQkVHSU4gTU9EVUxFIERFUEVOREVOQ0lFUyAtLS0tLS0tLS0tLS0tLVxuICAgIHZhciB1dGlsID0gcmVxdWlyZSgnLi91dGlsLmpzJyksXG4gICAgICAgIHNvdW5kTWFuYWdlciA9IHJlcXVpcmUoJy4uL2xpYi9zb3VuZG1hbmFnZXIyL3NjcmlwdC9zb3VuZG1hbmFnZXIyLmpzJykuc291bmRNYW5hZ2VyO1xuXG4gICAgLy8tLS0tLS0tLS0tLS0tLS0tIEVORCBNT0RVTEUgREVQRU5ERU5DSUVTIC0tLS0tLS0tLS0tLS0tXG5cbiAgICAvLy0tLS0tLS0tLS0tLS0tLS0gQkVHSU4gTU9EVUxFIFNDT1BFIFZBUklBQkxFUyAtLS0tLS0tLS0tLS0tLVxuICAgIHZhclxuXG4gICAgY29uZmlnTWFwID0ge1xuICAgICAgICBwcm9ncmVzc19odG1sIDogU3RyaW5nKCkgK1xuICAgICAgICAgICAgJzxkaXYgY2xhc3M9XCJwcm9ncmVzc1wiPicgK1xuICAgICAgICAgICAgICAgICc8ZGl2IGNsYXNzPVwicHJvZ3Jlc3MtYmFyXCIgcm9sZT1cInByb2dyZXNzYmFyXCIgYXJpYS12YWx1ZW5vdz1cIjEwMFwiIGFyaWEtdmFsdWVtaW49XCIwXCIgYXJpYS12YWx1ZW1heD1cIjEwMFwiIHN0eWxlPVwid2lkdGg6IDAlO1wiPicgK1xuICAgICAgICAgICAgICAgICAgICAnPHNwYW4gY2xhc3M9XCJzci1vbmx5XCI+NjAlIENvbXBsZXRlPC9zcGFuPicgK1xuICAgICAgICAgICAgICAgICc8L2Rpdj4nICtcbiAgICAgICAgICAgICc8L2Rpdj4nLFxuXG4gICAgICAgIGlzU3VwcG9ydGVkOiB1bmRlZmluZWRcbiAgICB9LFxuXG4gICAgc3RhdGVNYXAgPSB7XG4gICAgICAgIHNvdXJjZTogdW5kZWZpbmVkLFxuICAgICAgICBjb250ZXh0OiB1bmRlZmluZWQsXG4gICAgICAgIGF1ZGlvOiB1bmRlZmluZWQsXG4gICAgICAgIGlzUGxheWluZzogZmFsc2UsXG5cbiAgICAgICAgdXJsOiB1bmRlZmluZWQsXG4gICAgICAgIHBlcmNlbnRQbGF5ZWQ6IHVuZGVmaW5lZFxuICAgIH0sXG5cbiAgICBqcXVlcnlNYXAgPSB7fSxcbiAgICBzZXRKcXVlcnlNYXAsXG5cbiAgICBpbml0TW9kdWxlLFxuXG4gICAgb25DYXRlZ29yeUNoYW5nZSxcbiAgICBvbkNsaWNrUGxheWVyLFxuICAgIG1ha2VTb3VuZCxcbiAgICB0b2dnbGVQbGF5ZXIsXG5cbiAgICBQdWJTdWIgPSB1dGlsLlB1YlN1YjtcblxuICAgIC8vLS0tLS0tLS0tLS0tLS0tLSBFTkQgTU9EVUxFIFNDT1BFIFZBUklBQkxFUyAtLS0tLS0tLS0tLS0tLVxuXG4gICAvLy0tLS0tLS0tLS0tLS0tLS0tLS0tLSBCRUdJTiBNT0RVTEUgU0NPUEUgTUVUSE9EUyAtLS0tLS0tLS0tLS0tLS0tLS0tLVxuXG4gICAgc2V0SnF1ZXJ5TWFwID0gZnVuY3Rpb24oJHByb2dyZXNzLCAkZGVzY3JpcHRpb24pe1xuICAgICAgICBqcXVlcnlNYXAuJHByb2dyZXNzICA9ICRwcm9ncmVzcztcbiAgICAgICAganF1ZXJ5TWFwLiRkZXNjcmlwdGlvbiAgPSAkZGVzY3JpcHRpb247XG4gICAgICAgIGpxdWVyeU1hcC4kcHJvZ3Jlc3NfYmFyID0ganF1ZXJ5TWFwLiRwcm9ncmVzcy5maW5kKCcucHJvZ3Jlc3MtYmFyJyk7XG4gICAgfTtcblxuICAgIHRvZ2dsZVBsYXllciA9IGZ1bmN0aW9uKCl7XG4gICAgICAgIGlmKHN0YXRlTWFwLmF1ZGlvLnBhdXNlZCl7XG4gICAgICAgICAgICAvL2NvbnNvbGUubG9nKFwiUGF1c2VkOyBSZXN1bWUgcGxheTogJXNcIiwgc3RhdGVNYXAudXJsKTtcbiAgICAgICAgICAgIHN0YXRlTWFwLmF1ZGlvLnJlc3VtZSgpO1xuXG4gICAgICAgIH1lbHNlIGlmKHN0YXRlTWFwLmF1ZGlvLnBsYXlTdGF0ZSA9PT0gMCl7IC8vc3RvcHBlZCBvciB1bmluaXRpYWxpemVkXG4gICAgICAgICAgICAvL2NvbnNvbGUubG9nKFwiU3RvcHBlZDsgU3RhcnQgcGxheTogJXNcIiwgc3RhdGVNYXAudXJsKTtcbiAgICAgICAgICAgIHN0YXRlTWFwLmF1ZGlvLnBsYXkoKTtcbiAgICAgICAgfWVsc2UgaWYoc3RhdGVNYXAuYXVkaW8ucGxheVN0YXRlID09PSAxKXsgLy9wbGF5aW5nIG9yIGJ1ZmZlcmluZ1xuICAgICAgICAgICAgLy9jb25zb2xlLmxvZyhcIlBsYXlpbmc7IFBhdXNlIDogJXNcIiwgc3RhdGVNYXAudXJsKTtcbiAgICAgICAgICAgIHN0YXRlTWFwLmF1ZGlvLnBhdXNlKCk7XG4gICAgICAgIH1cbiAgICB9O1xuXG4gICAgLy8gQmVnaW4gcHJpdmF0ZSBtZXRob2QgL29uQ2F0ZWdvcnlDaGFuZ2UvXG4gICAgLy8gRXhhbXBsZSAgIDogb25DYXRlZ29yeUNoYW5nZTtcbiAgICAvLyBQdXJwb3NlICAgOlxuICAgIC8vICAgUHViU3ViIGNhbGxiYWNrIGZvciBjaGFuZ2VzIGluIHRoZSBjYXRlZ29yeSBVSVxuICAgIC8vIEFyZ3VtZW50cyA6XG4gICAgLy8gICogdXJscyAtIGFycmF5IG9mIHVybHMgZm9yIENsaXAgb2JqZWN0cyBjdXJyZW50bHkgZGlzcGxheWVkXG4gICAgLy8gQWN0aW9uICAgIDogZm9yIGVhY2ggdXJsLCB1cGRhdGUgdGhlIGdpdmVuIHByb2dyZXNzIGJhci4gRmluZCB0aGUgXCJjdXJyZW50XCIgc291bmQgb2JqZWN0XG4gICAgLy8gIGFuZCByZWFzc2lnbiB0aGUganF1ZXJ5TWFwIHRvIHJlZmxlY3QgdGhlIHVwZGF0ZWQgLyBuZXcgRE9NIGVsZW1lbnRcbiAgICAvLyBSZXR1cm5zICAgOiBub25lXG4gICAgLy8gVGhyb3dzICAgIDogbm9uZVxuICAgIG9uQ2F0ZWdvcnlDaGFuZ2UgPSBmdW5jdGlvbih1cmxzKXtcblxuICAgICAgICB1cmxzLmZvckVhY2goZnVuY3Rpb24odXJsKXtcbiAgICAgICAgICAgIHZhciBtdXJsLFxuICAgICAgICAgICAgICAgICRwbGF5ZXIsXG4gICAgICAgICAgICAgICAgJGRlc2NyaXB0aW9uLFxuICAgICAgICAgICAgICAgICRwcm9ncmVzcyxcbiAgICAgICAgICAgICAgICAkcHJvZ3Jlc3NfYmFyLFxuICAgICAgICAgICAgICAgIHBwbGF5ZWQsXG4gICAgICAgICAgICAgICAgc291bmQ7XG5cbiAgICAgICAgICAgIC8vdGFjayBvbiB0aGUgbWVkaWEgdGFnXG4gICAgICAgICAgICBtdXJsID0gJy9tZWRpYS8nICsgdXJsO1xuICAgICAgICAgICAgLy9nZXQgdGhlIHNwYW4ubWVkaWEtdXJsXG4gICAgICAgICAgICAkcGxheWVyID0gJCgnLm1lZGlhLmNsaXAnKS5maW5kKFwiW2RhdGEtY2xpcC11cmw9J1wiICsgbXVybCArIFwiJ11cIik7XG4gICAgICAgICAgICAvL2dldCB0aGUgc291bmQgYW5kIGNoZWNrIGlmIGl0IHdhcyBjcmVhdGVkXG4gICAgICAgICAgICBzb3VuZCA9IHNvdW5kTWFuYWdlci5nZXRTb3VuZEJ5SWQobXVybCk7XG4gICAgICAgICAgICBpZihzb3VuZCl7XG5cbiAgICAgICAgICAgICAgICAvL2luamVjdCB0aGUgcHJvZ3Jlc3MgYmFyIGFuZCB1cGRhdGUgdGhlIHN0YXRlXG4gICAgICAgICAgICAgICAgJHByb2dyZXNzID0gJHBsYXllci5maW5kKCcubWVkaWEtcHJvZ3Jlc3MnKTtcbiAgICAgICAgICAgICAgICAkZGVzY3JpcHRpb24gPSAkcGxheWVyLmZpbmQoJy5tZWRpYS1kZXNjcmlwdGlvbicpO1xuICAgICAgICAgICAgICAgICRwcm9ncmVzcy5odG1sKGNvbmZpZ01hcC5wcm9ncmVzc19odG1sKTtcbiAgICAgICAgICAgICAgICAkcHJvZ3Jlc3NfYmFyID0gJHBsYXllci5maW5kKCcubWVkaWEtcHJvZ3Jlc3MgLnByb2dyZXNzLWJhcicpO1xuXG4gICAgICAgICAgICAgICAgLy9pZiBpdCB3YXMgc3RvcHBlZCB0aGVuIHNldCBpdCB0byAxMDAlXG4gICAgICAgICAgICAgICAgaWYoc291bmQucGxheVN0YXRlID09PSAwKXtcbiAgICAgICAgICAgICAgICAgICAgcHBsYXllZCA9ICcxMDAnO1xuICAgICAgICAgICAgICAgIH1lbHNle1xuICAgICAgICAgICAgICAgICAgICBwcGxheWVkID0gKHNvdW5kLnBvc2l0aW9uIC8gc291bmQuZHVyYXRpb25Fc3RpbWF0ZSAqIDEwMCkudG9GaXhlZCgxKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgJHByb2dyZXNzX2Jhci53aWR0aChwcGxheWVkICsgJyUnKTtcblxuICAgICAgICAgICAgICAgIC8vIGlmIHRoZSBzb3VuZCA9PT0gc3RhdGVNYXAuYXVkaW8gdGhlbiByZWFzc2lnbiB0aGUgalF1ZXJ5IG1hcFxuICAgICAgICAgICAgICAgIGlmKHN0YXRlTWFwLmF1ZGlvLmlkID09PSBtdXJsKXtcbiAgICAgICAgICAgICAgICAgICAgc2V0SnF1ZXJ5TWFwKCRwcm9ncmVzcywgJGRlc2NyaXB0aW9uKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgIH07XG5cbiAgICAvLyBCZWdpbiBwcml2YXRlIG1ldGhvZCAvaW5pdE1vZHVsZS9cbiAgICAvLyBFeGFtcGxlICAgOiBpbml0TW9kdWxlKCk7XG4gICAgLy8gUHVycG9zZSAgIDpcbiAgICAvLyAgIFNldHMgdXAgdGhlIEF1ZGlvIEFQSSBjb250ZXh0IG9yIHJlcG9ydHMgZXJyb3JzXG4gICAgLy8gQXJndW1lbnRzIDogbm9uZVxuICAgIC8vIEFjdGlvbiAgICA6IHNlYXJjaGVzIGFuZCBhZGRzIHRoZSBjb3JyZWN0IEF1ZGlvQ29udGV4dCBvYmplY3QgdG8gdGhlIGdsb2JhbCB3aW5kb3dcbiAgICAvLyBSZXR1cm5zICAgOiBub25lXG4gICAgLy8gVGhyb3dzICAgIDogbm9uZVxuICAgIGluaXRNb2R1bGUgPSBmdW5jdGlvbigpe1xuICAgICAgICBzb3VuZE1hbmFnZXIuc2V0dXAoe1xuICAgICAgICAgICAgZGVidWdNb2RlOiB0cnVlLFxuICAgICAgICAgICAgY29uc29sZU9ubHk6IHRydWUsXG4gICAgICAgICAgICBodG1sNVBvbGxpbmdJbnRlcnZhbDogNTAsIC8vIGluY3JlYXNlZCBmcmFtZXJhdGUgZm9yIHdoaWxlcGxheWluZygpIGV0Yy5cbiAgICAgICAgICAgIGZsYXNoVmVyc2lvbjogOSxcbiAgICAgICAgICAgIHVzZUhpZ2hQZXJmb3JtYW5jZTogdHJ1ZSxcbiAgICAgICAgICAgIHVybDogJ2h0dHA6Ly93d3cuaGlkaW5nLW15LWZpbGUvU291bmRtYW5hZ2VyMkZpbGVzL3NvdW5kbWFuYWdlcjJfZmxhc2g5LnN3Zi8nLFxuICAgICAgICAgICAgb25yZWFkeTogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgY29uZmlnTWFwLmlzU3VwcG9ydGVkID0gc291bmRNYW5hZ2VyLm9rKCk7XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgb250aW1lb3V0OiBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhcIlNvdW5kTWFuYWdlciBmYWlsZWQgdG8gbG9hZFwiKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG5cbiAgICAgICAgUHViU3ViLm9uKFwic2hlbGxhYy1jYXRlZ29yeWNoYW5nZVwiLCBvbkNhdGVnb3J5Q2hhbmdlICk7XG4gICAgfTtcblxuICAgIC8vIEJlZ2luIHByaXZhdGUgbWV0aG9kIC9tYWtlU291bmQvXG4gICAgLy8gRXhhbXBsZSAgIDogbWFrZVNvdW5kKCApO1xuICAgIC8vIFB1cnBvc2UgICA6XG4gICAgLy8gICBTZXRzIHVwIHRoZSBBdWRpbyBBUEkgY29udGV4dCBvciByZXBvcnRzIGVycm9yc1xuICAgIC8vIEFyZ3VtZW50cyA6IG5vbmVcbiAgICAvLyBBY3Rpb24gICAgOiBzZWFyY2hlcyBhbmQgYWRkcyB0aGUgY29ycmVjdCBBdWRpb0NvbnRleHQgb2JqZWN0IHRvIHRoZSBnbG9iYWwgd2luZG93XG4gICAgLy8gUmV0dXJucyAgIDogbm9uZVxuICAgIC8vIFRocm93cyAgICA6IG5vbmVcbiAgICBtYWtlU291bmQgPSBmdW5jdGlvbih1cmwsIGF1dG9QbGF5KXtcbiAgICAgICAgdmFyIHNvdW5kO1xuICAgICAgICBzb3VuZCA9IHNvdW5kTWFuYWdlci5jcmVhdGVTb3VuZCh7XG4gICAgICAgICAgICBpZDogdXJsLFxuICAgICAgICAgICAgdXJsOiB1cmwsXG4gICAgICAgICAgICBhdXRvUGxheTogYXV0b1BsYXksXG4gICAgICAgICAgICB3aGlsZWxvYWRpbmc6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICAvL3NvdW5kTWFuYWdlci5fd3JpdGVEZWJ1ZygnTE9BRCBQUk9HUkVTUyAnICsgdGhpcy5ieXRlc0xvYWRlZCArICcgLyAnICsgdGhpcy5ieXRlc1RvdGFsKTtcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICB3aGlsZXBsYXlpbmc6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICB2YXIgcGVyY2VudFBsYXllZCA9ICh0aGlzLnBvc2l0aW9uIC8gdGhpcy5kdXJhdGlvbkVzdGltYXRlICogMTAwKS50b0ZpeGVkKDEpO1xuXG4gICAgICAgICAgICAgICAgaWYgKHBlcmNlbnRQbGF5ZWQgIT09IHN0YXRlTWFwLnBlcmNlbnRQbGF5ZWQpIHtcbiAgICAgICAgICAgICAgICAgICAgc3RhdGVNYXAucGVyY2VudFBsYXllZCA9IHBlcmNlbnRQbGF5ZWQ7XG4gICAgICAgICAgICAgICAgICAgIGpxdWVyeU1hcC4kcHJvZ3Jlc3NfYmFyLndpZHRoKHBlcmNlbnRQbGF5ZWQgKyAnJScpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBvbmxvYWQ6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICAvL2luamVjdCB0aGUgcGxheSBwcm9ncmVzcyBiYXIgYW5kIHNldCBqcXVlcnlNYXAgYXR0cmlidXRlXG4gICAgICAgICAgICAgICAganF1ZXJ5TWFwLiRwcm9ncmVzcy5odG1sKGNvbmZpZ01hcC5wcm9ncmVzc19odG1sKTtcbiAgICAgICAgICAgICAgICBqcXVlcnlNYXAuJHByb2dyZXNzX2JhciA9IGpxdWVyeU1hcC4kcHJvZ3Jlc3MuZmluZCgnLnByb2dyZXNzLWJhcicpO1xuXG4gICAgICAgICAgICAgICAgLy9pbml0aWFsaXplIHRoZSBwZXJjZW50UGxheWVkXG4gICAgICAgICAgICAgICAgc3RhdGVNYXAucGVyY2VudFBsYXllZCA9ICh0aGlzLnBvc2l0aW9uIC8gdGhpcy5kdXJhdGlvbkVzdGltYXRlICogMTAwKS50b0ZpeGVkKDEpO1xuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIG9ucGxheTogZnVuY3Rpb24oKXtcbiAgICAgICAgICAgICAgICBqcXVlcnlNYXAuJGRlc2NyaXB0aW9uLnRvZ2dsZUNsYXNzKFwicGxheWluZ1wiKTtcbiAgICAgICAgICAgICAgICBqcXVlcnlNYXAuJGRlc2NyaXB0aW9uLnRvZ2dsZUNsYXNzKFwicGxheWVkXCIpO1xuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIG9ucGF1c2U6IGZ1bmN0aW9uKCl7XG4gICAgICAgICAgICAgICAganF1ZXJ5TWFwLiRkZXNjcmlwdGlvbi50b2dnbGVDbGFzcyhcInBsYXlpbmdcIik7XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgb25yZXN1bWU6IGZ1bmN0aW9uKCl7XG4gICAgICAgICAgICAgICAganF1ZXJ5TWFwLiRkZXNjcmlwdGlvbi50b2dnbGVDbGFzcyhcInBsYXlpbmdcIik7XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgb25zdG9wOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAganF1ZXJ5TWFwLiRkZXNjcmlwdGlvbi50b2dnbGVDbGFzcyhcInBsYXlpbmdcIik7XG4gICAgICAgICAgICAgICAgLy9zb3VuZE1hbmFnZXIuX3dyaXRlRGVidWcoJ1RoZSBzb3VuZCAnICsgdGhpcy5pZCArICcgc3RvcHBlZC4nKTtcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBvbmZpbmlzaDogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgIGpxdWVyeU1hcC4kZGVzY3JpcHRpb24udG9nZ2xlQ2xhc3MoXCJwbGF5aW5nXCIpO1xuICAgICAgICAgICAgICAgIC8vc291bmRNYW5hZ2VyLl93cml0ZURlYnVnKCdUaGUgc291bmQgJyArIHRoaXMuaWQgKyAnIGZpbmlzaGVkIHBsYXlpbmcuJyk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuXG4gICAgICAgIHJldHVybiBzb3VuZDtcblxuICAgIH07XG5cbiAgICAvLy0tLS0tLS0tLS0tLS0tLS0tLS0tLSBFTkQgTU9EVUxFIFNDT1BFIE1FVEhPRFMgLS0tLS0tLS0tLS0tLS0tLS0tLS1cblxuICAgIC8vLS0tLS0tLS0tLS0tLS0tLS0tLSBCRUdJTiBQVUJMSUMgTUVUSE9EUyAtLS0tLS0tLS0tLS0tLS0tLS0tXG4gICAgb25DbGlja1BsYXllciA9IGZ1bmN0aW9uKHVybCwgJHByb2dyZXNzLCAkZGVzY3JpcHRpb24pe1xuXG4gICAgICAgIGNvbnNvbGUubG9nKHVybCk7XG4gICAgICAgIGNvbnNvbGUubG9nKCRwcm9ncmVzcyk7XG5cbiAgICAgICAgLy8gKioqIENBU0UgMFxuICAgICAgICAvLyBTdGF0ZTogQ2xpcCBzZWxlY3RlZCBkb2VzIHdhcyBub3QgY3JlYXRlZCB5ZXRcbiAgICAgICAgLy8gQWN0aW9uOiBDcmVhdGUgdGhlIGNsaXBcbiAgICAgICAgaWYoIXNvdW5kTWFuYWdlci5nZXRTb3VuZEJ5SWQodXJsKSkge1xuXG4gICAgICAgICAgICAvLyBDYXNlIDAuYTogTm8gY2xpcCBpcyBjdXJyZW50bHkgcGxheWluZ1xuICAgICAgICAgICAgICAgIC8vIGRvIG5vdGhpbmdcbiAgICAgICAgICAgIC8vIENhc2UgMC5iOiBBbm90aGVyIENsaXAgZXhpc3RzIGFuZCBpcyBzdGlsbCBwbGF5aW5nIC8gYnVmZmVyaW5nXG4gICAgICAgICAgICBpZiAoc3RhdGVNYXAuYXVkaW8gJiYgc3RhdGVNYXAuYXVkaW8ucGxheVN0YXRlID09PSAxKXtcbiAgICAgICAgICAgICAgICAvL3BhdXNlIHRoZSBwcmV2aW91cyBjbGlwXG4gICAgICAgICAgICAgICAgc3RhdGVNYXAuYXVkaW8ucGF1c2UoKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgc3RhdGVNYXAudXJsID0gdXJsO1xuICAgICAgICAgICAgc2V0SnF1ZXJ5TWFwKCRwcm9ncmVzcywgJGRlc2NyaXB0aW9uKTtcblxuICAgICAgICAgICAgLy9DcmVhdGUgdGhlIHNvdW5kLCBhc3NpZ24gaXQgdG8gc3RhdGVNYXAsIGFuZCBhdXRvcGxheVxuICAgICAgICAgICAgc3RhdGVNYXAuYXVkaW8gPSBtYWtlU291bmQoc3RhdGVNYXAudXJsLCB0cnVlKTtcbiAgICAgICAgfSBlbHNlIHtcblxuICAgICAgICAgICAgLy8gKioqIENhc2UgMVxuICAgICAgICAgICAgLy8gU3RhdGU6IENsaXAgc2VsZWN0ZWQgaW5kZWVkIGV4aXN0czsgc3RhdGVNYXAuYXVkaW8gdGhlbiBtdXN0IGV4aXN0XG4gICAgICAgICAgICAvLyBBY3Rpb246IENoZWNrIGlmIGl0IGlzIHRoZSBzYW1lIGNsaXAgZnJvbSBiZWZvcmVcbiAgICAgICAgICAgIHZhciBzb3VuZCA9IHNvdW5kTWFuYWdlci5nZXRTb3VuZEJ5SWQodXJsKTtcblxuICAgICAgICAgICAgLy8gQ2FzZSAxYTogdGhpcyBpcyB0aGUgc2FtZSBjbGlwXG4gICAgICAgICAgICAvLyBJbiB0aGlzIGNhc2UgYXVkaW8sIHVybCwgYW5kICRwbGF5ZXIgYXJlIGlkZW50aWNhbCBzbyBzaW1wbHkgdG9nZ2xlIHRoZSBwbGF5aW5nIHN0YXRlXG4gICAgICAgICAgICBpZihzdGF0ZU1hcC5hdWRpby5pZCAhPT0gc291bmQuaWQpe1xuICAgICAgICAgICAgICAgIC8vIENhc2UgMWI6IHRoaXMgaXMgYSBkaWZmZXJlbnQgY2xpcFxuICAgICAgICAgICAgICAgIC8vIFBhdXNlIHByZXZpb3VzbHkgcGxheWluZyBjbGlwXG4gICAgICAgICAgICAgICAgc3RhdGVNYXAuYXVkaW8ucGF1c2UoKTtcblxuICAgICAgICAgICAgICAgIC8vdXBkYXRlIHRoZSBzdGF0ZU1hcCB0byByZWZsZWN0IHRoZSBuZXcgb2JqZWN0XG4gICAgICAgICAgICAgICAgc3RhdGVNYXAuYXVkaW8gPSBzb3VuZDtcbiAgICAgICAgICAgICAgICBzdGF0ZU1hcC51cmwgPSBzb3VuZC5pZDtcbiAgICAgICAgICAgICAgICBzZXRKcXVlcnlNYXAoJHByb2dyZXNzLCAkZGVzY3JpcHRpb24pO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICB0b2dnbGVQbGF5ZXIoKTtcbiAgICAgICAgfVxuICAgIH07XG4gICAgLy8tLS0tLS0tLS0tLS0tLS0tLS0tIEVORCBQVUJMSUMgTUVUSE9EUyAtLS0tLS0tLS0tLS0tLS0tLS0tXG5cbiAgICB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcignbG9hZCcsIGluaXRNb2R1bGUsIGZhbHNlKTtcblxuICAgIHJldHVybiB7XG4gICAgICAgIG9uQ2xpY2tQbGF5ZXI6IG9uQ2xpY2tQbGF5ZXJcbiAgICB9O1xufSgpKTtcblxubW9kdWxlLmV4cG9ydHMgPSBhdWRpbztcblxuIiwiLypcbiAqIG1haW4uanNcbiAqIEVudHJ5IHBvaW50IGZvciBzaGVsbGFjIGFwcFxuKi9cbi8qIGdsb2JhbCAkLCBkb2N1bWVudCwgU1RBVElDX1VSTCwgTUVESUFfVVJMICovXG4ndXNlIHN0cmljdCc7XG4kKCBkb2N1bWVudCApLnJlYWR5KGZ1bmN0aW9uKCkge1xuICAgIHZhciBzaGVsbGFjID0gcmVxdWlyZSgnLi9zaGVsbGFjLmpzJyk7XG4gICAgc2hlbGxhYy5pbml0TW9kdWxlKCQoXCIjc2hlbGxhYy1hcHBcIiksIFNUQVRJQ19VUkwsIE1FRElBX1VSTCwgdXNlcm5hbWUpO1xufSk7XG5cbiIsIi8qXG4gKiBzaGVsbGFjLmpzXG4gKiBSb290IG5hbWVzcGFjZSBtb2R1bGVcbiovXG4vKiBnbG9iYWwgJCwgd2luZG93LCBBdWRpb0NvbnRleHQsIFhNTEh0dHBSZXF1ZXN0ICovXG4ndXNlIHN0cmljdCc7XG5cbnZhciBzaGVsbGFjID0gKGZ1bmN0aW9uICgpIHtcblxuICAgIC8vLS0tLS0tLS0tLS0tLS0tLSBCRUdJTiBNT0RVTEUgREVQRU5ERU5DSUVTIC0tLS0tLS0tLS0tLS0tXG4gICAgdmFyIG1vbWVudCA9IHJlcXVpcmUoJ21vbWVudCcpLFxuICAgICAgICBUQUZGWSA9IHJlcXVpcmUoJ3RhZmZ5ZGInKS50YWZmeSxcbiAgICAgICAgYXVkaW8gPSByZXF1aXJlKCcuL2F1ZGlvLmpzJyksXG4gICAgICAgIHV0aWwgPSByZXF1aXJlKCcuL3V0aWwuanMnKTtcblxuICAgIC8vLS0tLS0tLS0tLS0tLS0tLSBFTkQgTU9EVUxFIERFUEVOREVOQ0lFUyAtLS0tLS0tLS0tLS0tLVxuXG4gICAgLy8tLS0tLS0tLS0tLS0tLS0tIEJFR0lOIE1PRFVMRSBTQ09QRSBWQVJJQUJMRVMgLS0tLS0tLS0tLS0tLS1cbiAgICB2YXJcbiAgICBpbml0TW9kdWxlLFxuXG4gICAgY29uZmlnTWFwID0ge1xuXG4gICAgICAgIG1haW5faHRtbDogU3RyaW5nKCkgK1xuICAgICAgICAgICAgJzxkaXYgY2xhc3M9XCJzaGVsbGFjLWFwcC1jb250YWluZXJcIj4nICtcblxuICAgICAgICAgICAgICAgICc8ZGl2IGNsYXNzPVwic2hlbGxhYy1hcHAtc3RhdHVzYmFyXCI+UGxheWxpc3Q6IDxzcGFuIGNsYXNzPVwic2hlbGxhYy1hcHAtc3RhdHVzYmFyLXBsYXlpbmdcIj48L3NwYW4+PC9kaXY+JyArXG5cbiAgICAgICAgICAgICAgICAnPGRpdiBjbGFzcz1cImNvbC1zbS0zIGNvbC1tZC0yIHNoZWxsYWMtYXBwIHNpZGViYXJcIj4nICtcbiAgICAgICAgICAgICAgICAgICAgJzxkaXYgY2xhc3M9XCJwYW5lbC1ncm91cFwiIGlkPVwiYWNjb3JkaW9uXCI+JyArXG4gICAgICAgICAgICAgICAgICAgICAgICAnPGRpdiBjbGFzcz1cInBhbmVsIHBhbmVsLWRlZmF1bHRcIj4nICtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAnPGRpdiBjbGFzcz1cInBhbmVsLWhlYWRpbmdcIj4nICtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJzxhIGRhdGEtdG9nZ2xlPVwiY29sbGFwc2VcIiBkYXRhLXBhcmVudD1cIiNhY2NvcmRpb25cIiBocmVmPVwiI2NvbGxhcHNlQ2F0ZWdvcmllc1wiPicgK1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJ0NhdGVnb3JpZXMnICtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJzwvYT4nICtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAnPC9kaXY+JyArXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgJzxkaXYgaWQ9XCJjb2xsYXBzZUNhdGVnb3JpZXNcIiBjbGFzcz1cInBhbmVsLWNvbGxhcHNlIGNvbGxhcHNlXCI+JyArXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICc8ZGl2IGNsYXNzPVwicGFuZWwtYm9keVwiPicgK1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJzxkaXYgY2xhc3M9XCJzaGVsbGFjLWFwcCBuYXYgbmF2LXNpZGViYXIgbGlzdC1ncm91cFwiPjwvZGl2PicgK1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAnPC9kaXY+JyArXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgJzwvZGl2PicgK1xuICAgICAgICAgICAgICAgICAgICAgICAgJzwvZGl2PicgK1xuICAgICAgICAgICAgICAgICAgICAgICAgJzxkaXYgY2xhc3M9XCJwYW5lbCBwYW5lbC1kZWZhdWx0XCI+JyArXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgJzxkaXYgY2xhc3M9XCJwYW5lbC1oZWFkaW5nXCI+JyArXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICc8YSBkYXRhLXRvZ2dsZT1cImNvbGxhcHNlXCIgZGF0YS1wYXJlbnQ9XCIjYWNjb3JkaW9uXCIgaHJlZj1cIiNjb2xsYXBzZVBlb3BsZVwiPicgK1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJ1Blb3BsZScgK1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAnPC9hPicgK1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICc8L2Rpdj4nICtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAnPGRpdiBpZD1cImNvbGxhcHNlUGVvcGxlXCIgY2xhc3M9XCJwYW5lbC1jb2xsYXBzZSBjb2xsYXBzZVwiPicgK1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAnPGRpdiBjbGFzcz1cInBhbmVsLWJvZHlcIj4nICtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICcvL1BlcnNvbiBMaXN0IFRPRE8nICtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJzwvZGl2PicgK1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICc8L2Rpdj4nICtcbiAgICAgICAgICAgICAgICAgICAgICAgICc8L2Rpdj4nICtcbiAgICAgICAgICAgICAgICAgICAgJzwvZGl2PicgK1xuICAgICAgICAgICAgICAgICc8L2Rpdj4nICtcblxuICAgICAgICAgICAgICAgICc8ZGl2IGNsYXNzPVwic2hlbGxhYy1hcHAgY2xpcCBjb250ZW50XCI+PC9kaXY+JyArXG4gICAgICAgICAgICAnPC9kaXY+JyxcblxuICAgICAgICB0cnVuY2F0ZW1heDogMjVcbiAgICB9LFxuXG4gICAgc3RhdGVNYXAgPSB7XG4gICAgICAgICRjb250YWluZXI6IHVuZGVmaW5lZCxcbiAgICAgICAgdXNlcm5hbWU6IHVuZGVmaW5lZCxcblxuICAgICAgICBTVEFUSUNfVVJMOiB1bmRlZmluZWQsXG4gICAgICAgIE1FRElBX1VSTDogdW5kZWZpbmVkLFxuXG4gICAgICAgIGNhdGVnb3JpZXM6IHVuZGVmaW5lZCxcbiAgICAgICAgY2F0ZWdvcnlfZGI6IFRBRkZZKCksXG5cbiAgICAgICAgY2xpcHM6IHVuZGVmaW5lZCxcbiAgICAgICAgY2xpcF9kYjogVEFGRlkoKSxcblxuICAgICAgICBpc1BsYXlpbmc6IGZhbHNlXG4gICAgfSxcblxuICAgIGpxdWVyeU1hcCA9IHt9LFxuICAgIHNldEpxdWVyeU1hcCxcblxuICAgIHVybFBhcnNlLFxuXG4gICAgcGFyc2VDYXRlZ29yeURhdGEsIHJlbmRlckNhdGVnb3JpZXMsIGRpc3BsYXlfY2F0ZWdvcmllcyxcbiAgICBwYXJzZUNsaXBEYXRhLCBsb2FkQ2xpcHMsIGRpc3BsYXlfY2xpcHMsXG5cbiAgICBvbkNsaWNrQ2F0ZWdvcnksIG9uVGFwU3RhdHVzQmFyLCBvblN3aXBlU2lkZUJhcixcblxuICAgIFB1YlN1YiA9IHV0aWwuUHViU3ViO1xuXG4gICAgLy8tLS0tLS0tLS0tLS0tLS0tIEVORCBNT0RVTEUgU0NPUEUgVkFSSUFCTEVTIC0tLS0tLS0tLS0tLS0tXG5cbiAgICAvLy0tLS0tLS0tLS0tLS0tLS0tLS0tLSBCRUdJTiBNT0RVTEUgU0NPUEUgTUVUSE9EUyAtLS0tLS0tLS0tLS0tLS0tLS0tLVxuXG4gICAgc2V0SnF1ZXJ5TWFwID0gZnVuY3Rpb24oKXtcbiAgICAgICAgdmFyICRvdXRlckRpdiA9IHN0YXRlTWFwLiRjb250YWluZXI7XG5cbiAgICAgICAganF1ZXJ5TWFwID0ge1xuICAgICAgICAgICAgJG91dGVyRGl2ICAgICAgICAgICAgICAgOiAkb3V0ZXJEaXYsXG4gICAgICAgICAgICAkYXBwX2NvbnRhaW5lciAgICAgICAgICA6ICRvdXRlckRpdi5maW5kKCcuc2hlbGxhYy1hcHAtY29udGFpbmVyJyksXG4gICAgICAgICAgICAkc3RhdHVzYmFyICAgICAgICAgICAgICA6ICRvdXRlckRpdi5maW5kKCcuc2hlbGxhYy1hcHAtc3RhdHVzYmFyJyksXG4gICAgICAgICAgICAkc3RhdHVzYmFyX3BsYXlpbmcgICAgICA6ICRvdXRlckRpdi5maW5kKCcuc2hlbGxhYy1hcHAtc3RhdHVzYmFyIC5zaGVsbGFjLWFwcC1zdGF0dXNiYXItcGxheWluZycpLFxuICAgICAgICAgICAgJG5hdl9zaWRlYmFyICAgICAgICAgICAgOiAkb3V0ZXJEaXYuZmluZCgnLnNoZWxsYWMtYXBwLnNpZGViYXInKSxcbiAgICAgICAgICAgICRuYXZfc2lkZWJhcl9jYXRlZ29yaWVzIDogJG91dGVyRGl2LmZpbmQoJy5zaGVsbGFjLWFwcC5zaWRlYmFyICNjb2xsYXBzZUNhdGVnb3JpZXMgLnNoZWxsYWMtYXBwLm5hdi5uYXYtc2lkZWJhci5saXN0LWdyb3VwJyksXG4gICAgICAgICAgICAkbmF2X3NpZGViYXJfcGVvcGxlICAgICA6ICRvdXRlckRpdi5maW5kKCcuc2hlbGxhYy1hcHAuc2lkZWJhciAjY29sbGFwc2VQZW9wbGUgLnNoZWxsYWMtYXBwLm5hdi5uYXYtc2lkZWJhci5saXN0LWdyb3VwJyksXG4gICAgICAgICAgICAkY2xpcF9jb250ZW50ICAgICAgICAgICA6ICRvdXRlckRpdi5maW5kKCcuc2hlbGxhYy1hcHAuY2xpcC5jb250ZW50JylcbiAgICAgICAgfTtcbiAgICB9O1xuXG5cbiAgICAvKlxuICAgICAqIG1ldGhvZCByZW5kZXJDYXRlZ29yaWVzOiBtYWtlIGFuIGFwaSBjYWxsIHRvIGdhdGhlciB0aGUgQ2F0ZWdvcmllcyBpbiBkYXRhYmFzZVxuICAgICAqIHBhcmFtZXRlcnNcbiAgICAgKiByZXR1cm5cbiAgICAgKiAgICoganNvbkFycmF5IC0gYSBsaXN0IG9mIHZhbGlkIEpTT04gb2JqZWN0cyByZXByZXNlbnRpbmdcbiAgICAgKiAgIHNlcmlhbGl6ZWQgQ2F0ZWdvcnkgb2JqZWN0c1xuICAgICAqKi9cbiAgICByZW5kZXJDYXRlZ29yaWVzID0gZnVuY3Rpb24oKXtcblxuICAgICAgICB2YXIgdXJsID0gJy9hcGkvY2F0ZWdvcmllcy8nO1xuICAgICAgICAkLmFqYXgoe1xuICAgICAgICAgICAgdXJsOiB1cmxcbiAgICAgICAgfSlcbiAgICAgICAgICAgIC5kb25lKGZ1bmN0aW9uKGNhdGVnb3JpZXMpe1xuICAgICAgICAgICAgICAgIHN0YXRlTWFwLmNhdGVnb3J5X2RiLmluc2VydChwYXJzZUNhdGVnb3J5RGF0YShjYXRlZ29yaWVzLnJlc3VsdHMpKTtcbiAgICAgICAgICAgICAgICBzdGF0ZU1hcC5jYXRlZ29yaWVzID0gc3RhdGVNYXAuY2F0ZWdvcnlfZGIoKS5nZXQoKTtcbiAgICAgICAgICAgICAgICBQdWJTdWIuZW1pdChcImNhdGVnb3J5TG9hZENvbXBsZXRlXCIpO1xuICAgICAgICAgICAgfSlcbiAgICAgICAgICAgIC5mYWlsKGZ1bmN0aW9uKCl7XG4gICAgICAgICAgICAgICAgY29uc29sZS5lcnJvcihcIkNvdWxkIG5vdCBsb2FkIENsaXAgYXJjaGl2ZVwiKTtcbiAgICAgICAgICAgIH0pXG4gICAgICAgICAgICAuYWx3YXlzKGZ1bmN0aW9uKCl7XG5cbiAgICAgICAgICAgIH0pO1xuICAgIH07XG5cblxuICAgIC8qXG4gICAgICogbWV0aG9kIGxvYWRDbGlwczogbWFrZSBhbiBhcGkgY2FsbCB0byBnYXRoZXIgdGhlIENsaXBzIGluIGRhdGFiYXNlXG4gICAgICogQHBhcmFtIHN0YXR1cyB0eXBlIG9mIFJlbGF0aW9uc2hpcFxuICAgICAqIEBwYXJhbSB1c2VybmFtZSB1c2VybmFtZSBvZiB0aGUgaW50ZW5kZWQgdGFyZ2V0IFBlcnNvblxuICAgICAqIEByZXR1cm4ganNvbkFycmF5IGxpc3Qgb2YgdmFsaWQgSlNPTiBvYmplY3RzIHJlcHJlc2VudGluZyBzZXJpYWxpemVkIENsaXAgb2JqZWN0c1xuICAgICAqKi9cbiAgICBsb2FkQ2xpcHMgPSBmdW5jdGlvbihzdGF0dXMsIHVzZXJuYW1lKXtcblxuICAgICAgICB2YXIgdXJsID0gWycvYXBpL2NsaXBzJywgc3RhdHVzLCB1c2VybmFtZSwgXCJcIl0uam9pbignLycpO1xuXG4gICAgICAgICQuYWpheCh7XG4gICAgICAgICAgICB1cmw6IHVybFxuICAgICAgICB9KVxuICAgICAgICAgICAgLmRvbmUoZnVuY3Rpb24oY2xpcHMpe1xuICAgICAgICAgICAgICAgIHN0YXRlTWFwLmNsaXBfZGIuaW5zZXJ0KHBhcnNlQ2xpcERhdGEoY2xpcHNbJ3Jlc3VsdHMnXSkpO1xuICAgICAgICAgICAgICAgIHN0YXRlTWFwLmNsaXBzID0gc3RhdGVNYXAuY2xpcF9kYigpLm9yZGVyKFwiaWQgZGVzY1wiKS5nZXQoKTtcbiAgICAgICAgICAgICAgICBQdWJTdWIuZW1pdChcImNsaXBMb2FkQ29tcGxldGVcIik7XG4gICAgICAgICAgICB9KVxuICAgICAgICAgICAgLmZhaWwoZnVuY3Rpb24oKXtcbiAgICAgICAgICAgICAgICBjb25zb2xlLmVycm9yKFwiQ291bGQgbm90IGxvYWQgQ2xpcCBhcmNoaXZlXCIpO1xuICAgICAgICAgICAgfSlcbiAgICAgICAgICAgIC5hbHdheXMoZnVuY3Rpb24oKXtcblxuICAgICAgICAgICAgfSk7XG4gICAgfTtcblxuICAgIC8qKlxuICAgICAqIG1ldGhvZCBwYXJzZUNhdGVnb3J5RGF0YTogdHJhbnNmb3JtIGFueSBDYXRlZ29yeSBmaWVsZHMgdG8gamF2YXNjcmlwdC1jb21wYXRpYmxlXG4gICAgICogcGFyYW1ldGVyc1xuICAgICAqICAgKiByYXcgLSBhIHN0cmluZyBkZXNjcmliaW5nIGFuIGFycmF5IG9mIHZhbGlkIEpTT05cbiAgICAgKiByZXR1cm5cbiAgICAgKiAgICoganNvbkFycmF5IC0gYSBsaXN0IG9mIHZhbGlkIEpTT04gb2JqZWN0c1xuICAgICAqL1xuICAgIHBhcnNlQ2F0ZWdvcnlEYXRhID0gZnVuY3Rpb24ocmF3KXtcbiAgICAgICAgdmFyIGpzb25BcnJheTtcblxuICAgICAgICBqc29uQXJyYXkgPSByYXcubWFwKGZ1bmN0aW9uKGpzb25PYmope1xuXG4gICAgICAgICAgICB0cnl7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGpzb25PYmo7XG4gICAgICAgICAgICB9Y2F0Y2goZXJyKXtcbiAgICAgICAgICAgICAgICBjb25zb2xlLmVycm9yKGVycik7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgICAgICByZXR1cm4ganNvbkFycmF5O1xuICAgIH07XG5cbiAgICAvKipcbiAgICAqIHBhcnNlQ2xpcERhdGE6IHRyYW5zZm9ybSBhbnkgQ2xpcCBmaWVsZHMgdG8gamF2YXNjcmlwdC1jb21wYXRpYmxlXG4gICAgKiBAcGFyYW0gcmF3IGEgc3RyaW5nIGRlc2NyaWJpbmcgYW4gYXJyYXkgb2YgdmFsaWQgSlNPTlxuICAgICogQHJldHVybiBqc29uQXJyYXkgLSBhIGxpc3Qgb2YgdmFsaWQgSlNPTiBvYmplY3RzXG4gICAgKi9cbiAgICBwYXJzZUNsaXBEYXRhID0gZnVuY3Rpb24ocmF3KXtcbiAgICAgICAgdmFyIGpzb25BcnJheTtcblxuICAgICAgICBqc29uQXJyYXkgPSByYXcubWFwKGZ1bmN0aW9uKGpzb25PYmope1xuXG4gICAgICAgICAgICB0cnl7XG4gICAgICAgICAgICAgICAganNvbk9iai5jcmVhdGVkID0gbW9tZW50KGpzb25PYmouY3JlYXRlZCk7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGpzb25PYmo7XG4gICAgICAgICAgICB9Y2F0Y2goZXJyKXtcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhlcnIpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICAgICAgcmV0dXJuIGpzb25BcnJheTtcbiAgICB9O1xuXG4gICAgLypcbiAgICAgKiBtZXRob2QgdXJsUGFyc2U6IGV4dHJhY3QgdGhlIHZhcmlvdXMgYXNwZWN0cyBvZiB0aGUgdXJsIGZyb20gYSBIeXBlcmxpbmtlZFJlbGF0ZWRGaWVsZFxuICAgICAqIHByZWNvbmRpdGlvbjogcmVxdWlyZXMgYSBIeXBlcmxpbmtlZFJlbGF0ZWRGaWVsZCBvZiB0aGUgZm9ybSBwcm90b2NvbDpob3N0L2FwaS9vYmplY3QvcGsvXG4gICAgICogcGFyYW1ldGVyc1xuICAgICAqICAgKiB1cmwgLSB0aGUgdXJsIG9mIHRoZSByZXNvdXJjZVxuICAgICAqIHJldHVyblxuICAgICAqICAgKiBVUkxvYmogLSBhbiBvYmplY3QgbGl0ZXJhbCB3aXRoIGZpZWxkcyBwcm90b2NvbCwgaG9zdCwgYXBpLCBvYmplY3QsIGFuZCBwa1xuICAgICAqKi9cbiAgICB1cmxQYXJzZSA9IGZ1bmN0aW9uKHVybCl7XG4gICAgICAgIHZhciBVUkwgPSB7fSxcbiAgICAgICAgICAgIHUgPSB1cmwgfHwgJycsXG4gICAgICAgICAgICBwYXJ0cztcblxuICAgICAgICBwYXJ0cyA9IHUuc3BsaXQoJy8nKTtcblxuICAgICAgICB0cnl7XG4gICAgICAgICAgICBVUkwucHJvdG9jb2wgPSBwYXJ0c1swXTtcbiAgICAgICAgICAgIFVSTC5ob3N0ID0gcGFydHNbMl0uc3BsaXQoJzonKVswXTtcbiAgICAgICAgICAgIFVSTC5vYmplY3QgPSBwYXJ0c1s0XTtcbiAgICAgICAgICAgIFVSTC5wayA9IHBhcnRzWzVdO1xuXG4gICAgICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgICAgIHRocm93IFwiSW1wcm9wZXIgdXJsIGZvcm1hdCBlbnRlcmVkXCI7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIFVSTDtcbiAgICB9O1xuXG5cbiAgICAvLy0tLS0tLS0tLS0tLS0tLS0tLS0tLSBFTkQgTU9EVUxFIFNDT1BFIE1FVEhPRFMgLS0tLS0tLS0tLS0tLS0tLS0tLS1cblxuXG4gICAgLy8tLS0tLS0tLS0tLS0tLS0tLS0tLS0gQkVHSU4gRE9NIE1FVEhPRFMgLS0tLS0tLS0tLS0tLS0tLS0tLS1cblxuXG5cbiAgICBkaXNwbGF5X2NhdGVnb3JpZXMgPSBmdW5jdGlvbigpe1xuXG4gICAgICAgIHZhciBhbGxfYW5jaG9yID0gU3RyaW5nKCksXG4gICAgICAgICAgICBpdGVtcyA9IFN0cmluZygpLFxuICAgICAgICAgICAgY2xpcF9saXN0ID0gW107XG4gICAgICAgIGpxdWVyeU1hcC4kbmF2X3NpZGViYXJfY2F0ZWdvcmllcy5hcHBlbmQoYWxsX2FuY2hvcik7XG5cbiAgICAgICAgc3RhdGVNYXAuY2F0ZWdvcmllcy5mb3JFYWNoKGZ1bmN0aW9uKG9iamVjdCl7XG4gICAgICAgICAgICBpdGVtcyArPVxuICAgICAgICAgICAgICAgICc8YSBjbGFzcz1cImxpc3QtZ3JvdXAtaXRlbSBuYXYtc2lkZWJhci1jYXRlZ29yeVwiIGhyZWY9XCIjXCI+JyArICc8c3BhbiBjbGFzcz1cImJhZGdlXCI+JyArIG9iamVjdC5jbGlwcy5sZW5ndGggKyAnPC9zcGFuPicgK1xuICAgICAgICAgICAgICAgICAgICAnPGg1IGNsYXNzPVwibGlzdC1ncm91cC1pdGVtLWhlYWRpbmdcIiBpZD1cIicgKyBvYmplY3Quc2x1ZyArICdcIj4nICsgb2JqZWN0LnRpdGxlICsgJzwvaDU+JyArXG4gICAgICAgICAgICAgICAgJzwvYT4nO1xuXG4gICAgICAgICAgICB2YXIgZmlsdGVyZWQgPSBvYmplY3QuY2xpcHMuZmlsdGVyKGZ1bmN0aW9uKGlkKXtcbiAgICAgICAgICAgICAgICByZXR1cm4gY2xpcF9saXN0LmluZGV4T2YoaWQpID09PSAtMTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgY2xpcF9saXN0ID0gY2xpcF9saXN0LmNvbmNhdChmaWx0ZXJlZCk7XG4gICAgICAgIH0pO1xuXG4gICAgICAgIGFsbF9hbmNob3IgKz1cbiAgICAgICAgICAgICc8YSBjbGFzcz1cImxpc3QtZ3JvdXAtaXRlbSBuYXYtc2lkZWJhci1jYXRlZ29yeSBhY3RpdmVcIiBocmVmPVwiI1wiPicgKyAnPHNwYW4gY2xhc3M9XCJiYWRnZVwiPicgKyBjbGlwX2xpc3QubGVuZ3RoICsgJzwvc3Bhbj4nICtcbiAgICAgICAgICAgICAgICAnPGg1IGNsYXNzPVwibGlzdC1ncm91cC1pdGVtLWhlYWRpbmdcIiBpZD1cImFsbFwiPkFMTDwvaDU+JyArXG4gICAgICAgICAgICAnPC9hPic7XG5cbiAgICAgICAganF1ZXJ5TWFwLiRuYXZfc2lkZWJhcl9jYXRlZ29yaWVzLmFwcGVuZChhbGxfYW5jaG9yLCBpdGVtcyk7XG5cbiAgICAgICAgLy9yZWdpc3RlciBsaXN0ZW5lcnNcbiAgICAgICAgJCgnLmxpc3QtZ3JvdXAtaXRlbS1oZWFkaW5nJykub24oJ2NsaWNrJywgb25DbGlja0NhdGVnb3J5KTtcbiAgICB9O1xuXG5cbiAgICBkaXNwbGF5X2NsaXBzID0gZnVuY3Rpb24oKXtcblxuICAgICAgICBqcXVlcnlNYXAuJGNsaXBfY29udGVudC5odG1sKFwiXCIpO1xuICAgICAgICBzdGF0ZU1hcC5jbGlwcy5mb3JFYWNoKGZ1bmN0aW9uKG9iamVjdCl7XG5cbiAgICAgICAgICAgIHZhciBjbGlwID0gU3RyaW5nKCkgK1xuICAgICAgICAgICAgICAgICc8ZGl2IGNsYXNzPVwiY29sLXhzLTYgY29sLXNtLTQgY29sLW1kLTMgY29sLWxnLTIgbWVkaWEgY2xpcFwiPicgK1xuICAgICAgICAgICAgICAgICAgICAnPGRpdiBjbGFzcz1cInVpMzYwXCI+JyArXG5cbiAgICAgICAgICAgICAgICAgICAgICAgIC8vQkVHSU4gJHBsYXllclxuICAgICAgICAgICAgICAgICAgICAgICAgJzxzcGFuIGNsYXNzPVwibWVkaWEtdXJsXCIgZGF0YS1jbGlwLXVybD1cIicgKyBzdGF0ZU1hcC5NRURJQV9VUkwgKyBvYmplY3QuYXVkaW9fZmlsZSArICdcIj4nICtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAnPGltZyBjbGFzcz1cIm1lZGlhLWltZyBpbWctcmVzcG9uc2l2ZVwiIHNyYz1cIicgKyBzdGF0ZU1hcC5NRURJQV9VUkwgKyBvYmplY3QuYnJhbmQgKyAnXCIgYWx0PVwiJyArIG9iamVjdC50aXRsZSArICdcIiAvPicgK1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICc8ZGl2IGNsYXNzPVwibWVkaWEtZGVzY3JpcHRpb25cIj4nICtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJzxzcGFuIGNsYXNzPVwibWVkaWEtZGVzY3JpcHRpb24tY29udGVudCBsZWFkXCI+JyArIHV0aWwudHJ1bmNhdGUob2JqZWN0LnRpdGxlLCBjb25maWdNYXAudHJ1bmNhdGVfbWF4KSArICc8L3NwYW4+PGJyLz4nICtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJzxzcGFuIGNsYXNzPVwibWVkaWEtZGVzY3JpcHRpb24tY29udGVudFwiPjxlbT4nICsgdXRpbC50cnVuY2F0ZShvYmplY3QuZGVzY3JpcHRpb24sIGNvbmZpZ01hcC50cnVuY2F0ZV9tYXgpICsgJzwvZW0+PC9zcGFuPjxici8+JyArXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICc8c3BhbiBjbGFzcz1cIm1lZGlhLWRlc2NyaXB0aW9uLWNvbnRlbnRcIj48c21hbGw+JyArIG9iamVjdC5vd25lciArIFwiICAtLSBcIiArIG9iamVjdC5jcmVhdGVkLl9kLnRvRGF0ZVN0cmluZygpICsgJzwvc21hbGw+PC9zcGFuPjxici8+JyArXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgJzwvZGl2PicgK1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICc8ZGl2IGNsYXNzPVwibWVkaWEtcHJvZ3Jlc3NcIj48L2Rpdj4nICtcbiAgICAgICAgICAgICAgICAgICAgICAgICc8L3NwYW4+JyAgK1xuICAgICAgICAgICAgICAgICAgICAgICAgLy9FTkQgJHBsYXllclxuXG4gICAgICAgICAgICAgICAgICAgICc8L2Rpdj4nICtcbiAgICAgICAgICAgICAgICAnPC9kaXY+JztcblxuICAgICAgICAgICAganF1ZXJ5TWFwLiRjbGlwX2NvbnRlbnQuYXBwZW5kKGNsaXApO1xuXG5cbiAgICAgICAgfSk7XG4gICAgICAgICQoJy5tZWRpYS5jbGlwIC5tZWRpYS11cmwnKS5vbignY2xpY2snLCBmdW5jdGlvbihlKXtcbiAgICAgICAgICAgIHZhciB1cmwgPSAkKHRoaXMpLmF0dHIoJ2RhdGEtY2xpcC11cmwnKSxcbiAgICAgICAgICAgICAgICAkcHJvZ3Jlc3MgPSAkKHRoaXMpLmZpbmQoJy5tZWRpYS1wcm9ncmVzcycpLFxuICAgICAgICAgICAgICAgICRkZXNjcmlwdGlvbiA9ICQodGhpcykuZmluZCgnLm1lZGlhLWRlc2NyaXB0aW9uJyk7XG5cbiAgICAgICAgICAgIGF1ZGlvLm9uQ2xpY2tQbGF5ZXIodXJsLCAkcHJvZ3Jlc3MsICRkZXNjcmlwdGlvbik7XG4gICAgICAgIH0pO1xuICAgIH07XG5cbiAgICAvLy0tLS0tLS0tLS0tLS0tLS0tLS0tLSBFTkQgRE9NIE1FVEhPRFMgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuXG4gICAgLy8tLS0tLS0tLS0tLS0tLS0tLS0tIEJFR0lOIEVWRU5UIEhBTkRMRVJTIC0tLS0tLS0tLS0tLS0tLS0tLS1cbiAgICAvLyBCZWdpbiBFdmVudCBoYW5kbGVyIC9vbkNsaWNrQ2F0ZWdvcnkvXG4gICAgLy8gUHVycG9zZSAgICA6IEhhbmRsZXMgdGhlIGV2ZW50IGZvciBzaWRlYmFyIGNhdGVnb3J5IHNlbGVjdGlvblxuICAgIC8vIEFyZ3VtZW50cyAgOlxuICAgIC8vIFNldHRpbmdzICAgOiBub25lXG4gICAgLy8gUmV0dXJucyAgICA6XG4gICAgLy8gQWN0aW9ucyAgICA6IFNob3VsZCBzaWduYWwgdG8gYXVkaW8gbW9kdWxlIHRvIHVwZGF0ZSBwcm9ncmVzcyBiYXIgc3RhdGUgZm9yIGVhY2ggY2xpcFxuICAgIC8vICAgKiBiaW5kcyB0byBjYXRlZ29yeSBET00gZWxlbWVudHMgYW5kIHJlbG9hZHMgY29ycmVzcG9uZGluZyBjbGlwcyBpbnRvXG4gICAgLy8gICAgIHN0YXRlTWFwLmNsaXBzXG4gICAgb25DbGlja0NhdGVnb3J5ID0gZnVuY3Rpb24oZXZlbnQpe1xuXG4gICAgICAgIHZhciBjYXRlZ29yeV9vYmplY3Q7XG5cbiAgICAgICAgLy9lbXB0eSB0aGUgY2xpcCBhcnJheVxuICAgICAgICBzdGF0ZU1hcC5jbGlwcyA9IFtdO1xuXG4gICAgICAgIC8vcmVmaWxsIHRoZSBlbXB0eSB0aGUgY2xpcCBhcnJheVxuICAgICAgICBpZihldmVudC50YXJnZXQuaWQgPT09IFwiYWxsXCIpe1xuICAgICAgICAgICAgc3RhdGVNYXAuY2xpcHMgPSBzdGF0ZU1hcC5jbGlwX2RiKCkuZ2V0KCk7XG5cbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGNhdGVnb3J5X29iamVjdCA9IHN0YXRlTWFwLmNhdGVnb3J5X2RiKHtzbHVnOiBldmVudC50YXJnZXQuaWR9KS5maXJzdCgpO1xuXG4gICAgICAgICAgICAvL3B1c2ggaW4gYW55IG1hdGNoaW5nIGNsaXAgaWQgZnJvbSB0aGUgdXJsXG4gICAgICAgICAgICBzdGF0ZU1hcC5jbGlwcyA9IGNhdGVnb3J5X29iamVjdC5jbGlwcy5tYXAoZnVuY3Rpb24oY2xpcF91cmwpe1xuICAgICAgICAgICAgICAgIHZhciBVUkwgPSB1cmxQYXJzZShjbGlwX3VybCk7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHN0YXRlTWFwLmNsaXBfZGIoe2lkOiBwYXJzZUludChVUkwucGspfSkuZmlyc3QoKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgICAgIGRpc3BsYXlfY2xpcHMoKTtcbiAgICAgICAgdXRpbC5QdWJTdWIuZW1pdChcInNoZWxsYWMtY2F0ZWdvcnljaGFuZ2VcIixcbiAgICAgICAgICAgIHN0YXRlTWFwLmNsaXBzLm1hcChmdW5jdGlvbihjbGlwKXtyZXR1cm4gY2xpcC5hdWRpb19maWxlO30pXG4gICAgICAgICk7XG4gICAgfTtcblxuICAgIG9uVGFwU3RhdHVzQmFyID0gZnVuY3Rpb24oZXZ0KXtcbi8vICAgICAgICBjb25zb2xlLmxvZyhcInRhcCBkZXRlY2V0ZWRcIik7XG4vLyAgICAgICAgY29uc29sZS5sb2coZXZ0KTtcbiAgICAgICAgZXZ0LnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgIGpxdWVyeU1hcC4kYXBwX2NvbnRhaW5lci50b2dnbGVDbGFzcygnbmF2LWV4cGFuZGVkJyk7XG4gICAgfTtcblxuICAgIG9uU3dpcGVTaWRlQmFyID0gZnVuY3Rpb24oZXZ0KXtcbi8vICAgICAgICBjb25zb2xlLmxvZyhcInN3aXBlIGRldGVjZXRlZFwiKTtcbi8vICAgICAgICBjb25zb2xlLmxvZyhldnQpO1xuICAgICAgICBldnQucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAganF1ZXJ5TWFwLiRhcHBfY29udGFpbmVyLnRvZ2dsZUNsYXNzKCduYXYtZXhwYW5kZWQnKTtcbiAgICB9O1xuXG5cblxuICAgIC8vLS0tLS0tLS0tLS0tLS0tLS0tLS0gRU5EIEVWRU5UIEhBTkRMRVJTIC0tLS0tLS0tLS0tLS0tLS0tLS0tXG5cbiAgICAvLy0tLS0tLS0tLS0tLS0tLS0tLS0gQkVHSU4gUFVCTElDIE1FVEhPRFMgLS0tLS0tLS0tLS0tLS0tLS0tLVxuICAgIC8vIGluaXRNb2R1bGUgLy8gICBQb3B1bGF0ZXMgJGNvbnRhaW5lciB3aXRoIHRoZSBzaGVsbCBvZiB0aGUgVUlcbiAgICAvLyAgIGFuZCB0aGVuIGNvbmZpZ3VyZXMgYW5kIGluaXRpYWxpemVzIGZlYXR1cmUgbW9kdWxlcy5cbiAgICAvLyAgIFRoZSBTaGVsbCBpcyBhbHNvIHJlc3BvbnNpYmxlIGZvciBicm93c2VyLXdpZGUgaXNzdWVzXG4gICAgLy8gICBEaXJlY3RzIHRoaXMgYXBwIHRvIG9mZmVyIGl0cyBjYXBhYmlsaXR5IHRvIHRoZSB1c2VyXG4gICAgLy8gQHBhcmFtICRjb250YWluZXIgQSBqUXVlcnkgY29sbGVjdGlvbiB0aGF0IHNob3VsZCByZXByZXNlbnRcbiAgICAvLyBhIHNpbmdsZSBET00gY29udGFpbmVyXG4gICAgLy8gQHBhcmFtIE1FRElBX1VSTCBEamFuZ28gbWVkaWEgdXJsIHByZWZpeCAoc2V0dGluZ3MuTUVESUFfVVJMKVxuICAgIC8vIEBwYXJhbSBTVEFUSUNfVVJMIERqYW5nbyBzdGF0aWMgdXJsIHByZWZpeCAoc2V0dGluZ3MuU1RBVElDX1VSTClcbiAgICAvLyBAcGFyYW0gdXNlcm5hbWUgYWNjb3VudCBob2xkZXIgdXNlcm5hbWUgZm9yIHJldHJpZXZpbmcgY2xpcHNcblxuICAgIGluaXRNb2R1bGUgPSBmdW5jdGlvbiggJGNvbnRhaW5lciwgU1RBVElDX1VSTCwgTUVESUFfVVJMLCB1c2VybmFtZSl7XG4gICAgICAgIC8vIGxvYWQgSFRNTCBhbmQgbWFwIGpRdWVyeSBjb2xsZWN0aW9uc1xuICAgICAgICBzdGF0ZU1hcC4kY29udGFpbmVyID0gJGNvbnRhaW5lcjtcbiAgICAgICAgc3RhdGVNYXAudXNlcm5hbWUgPSB1c2VybmFtZTtcbiAgICAgICAgc3RhdGVNYXAuJG5hdl9zaWRlYmFyID0gJGNvbnRhaW5lci5wYXJlbnQ7XG4gICAgICAgIHN0YXRlTWFwLlNUQVRJQ19VUkwgPSBTVEFUSUNfVVJMO1xuICAgICAgICBzdGF0ZU1hcC5NRURJQV9VUkwgPSBNRURJQV9VUkw7XG5cbiAgICAgICAgJGNvbnRhaW5lci5odG1sKCBjb25maWdNYXAub2ZmY2FudmFzX2h0bWwgKTtcbiAgICAgICAgJGNvbnRhaW5lci5hcHBlbmQoIGNvbmZpZ01hcC5tYWluX2h0bWwgKTtcbiAgICAgICAgc2V0SnF1ZXJ5TWFwKCk7XG5cbiAgICAgICAgIC8vcmVnaXN0ZXIgcHViLXN1YiBtZXRob2RzXG4gICAgICAgIFB1YlN1Yi5vbihcImNsaXBMb2FkQ29tcGxldGVcIiwgZGlzcGxheV9jbGlwcyk7XG4gICAgICAgIFB1YlN1Yi5vbihcImNhdGVnb3J5TG9hZENvbXBsZXRlXCIsIGRpc3BsYXlfY2F0ZWdvcmllcyk7XG5cbiAgICAgICAgLy9sb2FkIGRhdGEgaW50byBpbi1icm93c2VyIGRhdGFiYXNlXG4gICAgICAgIGxvYWRDbGlwcyhcImZvbGxvd2luZ1wiLCB1c2VybmFtZSk7XG4gICAgICAgIHJlbmRlckNhdGVnb3JpZXMoKTtcblxuICAgICAgICAvL05hdmlnYXRpb24gTWVudSBTbGlkZXJcbiAgICAgICAgJCggJy5zaGVsbGFjLWFwcC1zdGF0dXNiYXInIClcbiAgICAgICAgICAgIC5vbiggJ3V0YXAudXRhcCcsICAgb25UYXBTdGF0dXNCYXIgICApO1xuXG4gICAgICAgICQoICcuc2hlbGxhYy1hcHAuc2lkZWJhcicgKVxuICAgICAgICAgICAgLm9uKCAndWRyYWdzdGFydC51ZHJhZycsIG9uU3dpcGVTaWRlQmFyICk7XG5cbiAgICAgICAganF1ZXJ5TWFwLiRzdGF0dXNiYXJfcGxheWluZy5odG1sKHVzZXJuYW1lKTtcblxuICAgICAgICBjb25zb2xlLmxvZyhqcXVlcnlNYXAuJG5hdl9zaWRlYmFyKTtcbiAgICB9O1xuXG4gICAgcmV0dXJuIHsgaW5pdE1vZHVsZTogaW5pdE1vZHVsZSB9O1xufSgpKTtcblxubW9kdWxlLmV4cG9ydHMgPSBzaGVsbGFjO1xuXG4iLCIvKlxuICogdXRpbC5qc1xuICogVXRpbGl0aWVzIGZvciB0aGUgQXVkaW8gYXBwXG4qL1xuLyogZ2xvYmFsICovXG4ndXNlIHN0cmljdCc7XG5cbnZhciB1dGlsID0gKGZ1bmN0aW9uICgpIHtcblxuICAgIHZhciBQdWJTdWIsIHRydW5jYXRlO1xuXG4gICAgLy8tLS0tLS0tLS0tLS0tLS0tIEJFR0lOIE1PRFVMRSBERVBFTkRFTkNJRVMgLS0tLS0tLS0tLS0tLS1cblxuICAgIC8vLS0tLS0tLS0tLS0tLS0tLSBFTkQgTU9EVUxFIERFUEVOREVOQ0lFUyAtLS0tLS0tLS0tLS0tLVxuXG4gICAgLy8tLS0tLS0tLS0tLS0tLS0tLS0tLSBFTkQgRVZFTlQgSEFORExFUlMgLS0tLS0tLS0tLS0tLS0tLS0tLS1cblxuICAgIC8vLS0tLS0tLS0tLS0tLS0tLS0tLSBCRUdJTiBQVUJMSUMgTUVUSE9EUyAtLS0tLS0tLS0tLS0tLS0tLS0tXG4gICAgLy8gQmVnaW4gUHVibGljIG1ldGhvZCAvUHViU3ViL1xuICAgIC8vIEV4YW1wbGUgICA6IFB1YlN1Yi5vbignYmFyaycsIGdldERvZyApOyBQdWJTdWIuZW1pdCgnYmFyaycpO1xuICAgIC8vIFB1cnBvc2UgICA6XG4gICAgLy8gICBTdWJzY3JpYmUgYW5kIHB1Ymxpc2ggZXZlbnRzXG4gICAgLy8gQXJndW1lbnRzIDpcbiAgICAvLyBBY3Rpb24gICAgOiBUaGUgdXNlciBjYW4gc3Vic2NyaWJlIHRvIGV2ZW50cyB3aXRoIG9uKCc8ZXZlbnQgbmFtZT4nLCBjYWxsYmFjaylcbiAgICAvLyBhbmQgbGlzdGVuIHRvIGV2ZW50cyBwdWJsaXNoZWQgd2l0aCBlbWl0KCc8ZXZlbnQgbmFtZT4nKVxuICAgIC8vIFJldHVybnMgICA6IG5vbmVcbiAgICAvLyBUaHJvd3MgICAgOiBub25lXG4gICAgUHViU3ViID0ge1xuICAgICAgICBoYW5kbGVyczoge30sXG5cbiAgICAgICAgb24gOiBmdW5jdGlvbihldmVudFR5cGUsIGhhbmRsZXIpIHtcbiAgICAgICAgICAgIGlmICghKGV2ZW50VHlwZSBpbiB0aGlzLmhhbmRsZXJzKSkge1xuICAgICAgICAgICAgICAgIHRoaXMuaGFuZGxlcnNbZXZlbnRUeXBlXSA9IFtdO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgLy9wdXNoIGhhbmRsZXIgaW50byBhcnJheSAtLSBcImV2ZW50VHlwZVwiOiBbaGFuZGxlcl1cbiAgICAgICAgICAgIHRoaXMuaGFuZGxlcnNbZXZlbnRUeXBlXS5wdXNoKGhhbmRsZXIpO1xuICAgICAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgICAgIH0sXG5cbiAgICAgICAgZW1pdCA6IGZ1bmN0aW9uKGV2ZW50VHlwZSkge1xuICAgICAgICAgICAgdmFyIGhhbmRsZXJBcmdzID0gQXJyYXkucHJvdG90eXBlLnNsaWNlLmNhbGwoYXJndW1lbnRzLCAxKTtcbiAgICAgICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgdGhpcy5oYW5kbGVyc1tldmVudFR5cGVdLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5oYW5kbGVyc1tldmVudFR5cGVdW2ldLmFwcGx5KHRoaXMsIGhhbmRsZXJBcmdzKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiB0aGlzO1xuICAgICAgICB9XG5cbiAgICB9O1xuXG4gICAgLy8gQmVnaW4gUHVibGljIG1ldGhvZCAvdHJ1bmNhdGUvXG4gICAgLy8gRXhhbXBsZSAgIDogdHJ1bmNhdGUoc3RyaW5nLCBtYXhjaGFyKVxuICAgIC8vIFB1cnBvc2UgICA6XG4gICAgLy8gICBUcnVuY2F0ZSBhIHN0cmluZyBhbmQgYXBwZW5kIFwiLi4uXCIgdG8gdGhlIHJlbWFpbmluZ1xuICAgIC8vIEFyZ3VtZW50cyA6XG4gICAgLy8gICogc3RyaW5nIC0gdGhlIG9yaWdpbmFsIHN0cmluZ1xuICAgIC8vICAqIG1heGNoYXIgLSB0aGUgbWF4IG51bWJlciBvZiBjaGFycyB0byBzaG93XG4gICAgLy8gUmV0dXJucyAgIDogdGhlIHRydW5jYXRlZCBzdHJpbmdcbiAgICAvLyBUaHJvd3MgICAgOiBub25lXG4gICAgdHJ1bmNhdGUgPSBmdW5jdGlvbihzdHJpbmcsIG1heGNoYXIpe1xuICAgICAgICB2YXIgc3RyID0gc3RyaW5nIHx8ICcnO1xuXG4gICAgICAgIHZhciB0cnVuY2F0ZWQgPSBzdHIuc2xpY2UoMCwgbWF4Y2hhcik7XG4gICAgICAgIGlmKHN0ci5sZW5ndGggPiBtYXhjaGFyKXtcbiAgICAgICAgICAgIHRydW5jYXRlZCArPSBcIi4uLlwiO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiB0cnVuY2F0ZWQ7XG4gICAgfTtcblxuICAgIHJldHVybiB7XG4gICAgICAgIFB1YlN1YjogUHViU3ViLFxuICAgICAgICB0cnVuY2F0ZTogdHJ1bmNhdGVcbiAgICB9O1xufSgpKTtcblxubW9kdWxlLmV4cG9ydHMgPSB1dGlsO1xuXG4iXX0=
