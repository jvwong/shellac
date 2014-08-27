(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({"/home/jvwong/Projects/shellac/shellac.no-ip.ca/source/static/shellac/js/app/shellac.js":[function(require,module,exports){
/*
 * shellac.js
 * Root namespace module
*/
'use strict';

var shellac = (function () {
    var TAFFY = require('../lib/taffydb/taffy.js').taffy;


    //---------------- BEGIN MODULE DEPENDENCIES --------------

    //---------------- END MODULE DEPENDENCIES --------------

    //---------------- BEGIN MODULE SCOPE VARIABLES --------------
    var
    initModule,

    configMap = {
        main_html: String() +
            '<div class="shellac-container"></div>',

        clip_template_html: String() +
            '<a class="shellac-clip-anchor"></a>'
    },

    stateMap = {
        $container  : undefined
        , clip_db     : TAFFY()
    },

    jqueryMap = {},

    //---------------- END MODULE SCOPE VARIABLES --------------


    //--------------------- BEGIN DOM METHODS --------------------

    setJqueryMap = function(){
        var $outerDiv = stateMap.$container;

        jqueryMap = {
            $outerDiv                   : $outerDiv,
            $shellac_container          : $outerDiv.find('.shellac-container')
        };
    },

    display_clips = function(clipArray, $container){

        clipArray.forEach(function(url){

            var anchor = String() +
            '<div class="row shellac-clip-list">' +
                '<div class="media">' +
                    '<a class="pull-left" href="' + url + '">' +
                        '<img class="media-object clip" src="/static/shellac/assets/seventyEight.png" alt="">' +
                    '</a>' +
                    '<div class="media-body">' +
                        '<h4 class="media-heading">Media title</h4>' +
                        '<p class="media-meta">Metadata</p>' +
                        '<p class="media-description">brief description</p>' +
                    '</div>' +
                '</div>' +
            '</div>';

            $container.append(anchor);

        });

    };
    //--------------------- END DOM METHODS ----------------------

    //------------------- BEGIN EVENT HANDLERS -------------------
    // Begin Event handler //
    // Purpose    : Handles the event
    // Arguments  :
    //   * event - jQuery event object.
    // Settings   : none
    // Returns    : false
    // Actions    :
    //   * Parses the URI anchor component
    //-------------------- END EVENT HANDLERS --------------------

    //------------------- BEGIN PUBLIC METHODS -------------------
    // Begin Public method /initModule/
    // Example   : spa.shell.initModule( $('#div') );
    // Purpose   :
    //   Directs this app to offer its capability to the user
    // Arguments :
    //   * $container (example: $('#div')).
    //     A jQuery collection that should represent
    //     a single DOM container
    // Action    :
    //   Populates $container with the shell of the UI
    //   and then configures and initializes feature modules.
    //   The Shell is also responsible for browser-wide issues
    // Returns   : none
    // Throws    : none
    initModule = function( $container, data, TAFFY ){
        // load HTML and map jQuery collections
        stateMap.$container = $container;
        $container.html( configMap.main_html );
        setJqueryMap();

        //load data into in-browser database
        stateMap.clip_db.insert(data);
        stateMap.clips = stateMap.clip_db().get();

        display_clips(stateMap.clips, jqueryMap.$shellac_container);
        console.log($(".media-object.clip"));
    };

    return { initModule: initModule }
}());

module.exports = shellac;


},{"../lib/taffydb/taffy.js":"/home/jvwong/Projects/shellac/shellac.no-ip.ca/source/static/shellac/js/lib/taffydb/taffy.js"}],"/home/jvwong/Projects/shellac/shellac.no-ip.ca/source/static/shellac/js/lib/taffydb/taffy.js":[function(require,module,exports){
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


},{}],"/home/jvwong/Projects/shellac/shellac.no-ip.ca/source/static/shellac/js/main.js":[function(require,module,exports){
/*
 * main.js
 * Entry point for shellac app
*/
'use strict';

$( document ).ready(function() {
    var shellac = require('./app/shellac.js');
    shellac.initModule($("#shellac-app"), data);
});


},{"./app/shellac.js":"/home/jvwong/Projects/shellac/shellac.no-ip.ca/source/static/shellac/js/app/shellac.js"}]},{},["/home/jvwong/Projects/shellac/shellac.no-ip.ca/source/static/shellac/js/main.js"])
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi91c3IvbG9jYWwvbGliL25vZGVfbW9kdWxlcy93YXRjaGlmeS9ub2RlX21vZHVsZXMvYnJvd3NlcmlmeS9ub2RlX21vZHVsZXMvYnJvd3Nlci1wYWNrL19wcmVsdWRlLmpzIiwiL2hvbWUvanZ3b25nL1Byb2plY3RzL3NoZWxsYWMvc2hlbGxhYy5uby1pcC5jYS9zb3VyY2Uvc3RhdGljL3NoZWxsYWMvanMvYXBwL3NoZWxsYWMuanMiLCIvaG9tZS9qdndvbmcvUHJvamVjdHMvc2hlbGxhYy9zaGVsbGFjLm5vLWlwLmNhL3NvdXJjZS9zdGF0aWMvc2hlbGxhYy9qcy9saWIvdGFmZnlkYi90YWZmeS5qcyIsIi9ob21lL2p2d29uZy9Qcm9qZWN0cy9zaGVsbGFjL3NoZWxsYWMubm8taXAuY2Evc291cmNlL3N0YXRpYy9zaGVsbGFjL2pzL21haW4uanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUNBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNySEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNqK0RBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCIvKlxuICogc2hlbGxhYy5qc1xuICogUm9vdCBuYW1lc3BhY2UgbW9kdWxlXG4qL1xuJ3VzZSBzdHJpY3QnO1xuXG52YXIgc2hlbGxhYyA9IChmdW5jdGlvbiAoKSB7XG4gICAgdmFyIFRBRkZZID0gcmVxdWlyZSgnLi4vbGliL3RhZmZ5ZGIvdGFmZnkuanMnKS50YWZmeTtcblxuXG4gICAgLy8tLS0tLS0tLS0tLS0tLS0tIEJFR0lOIE1PRFVMRSBERVBFTkRFTkNJRVMgLS0tLS0tLS0tLS0tLS1cblxuICAgIC8vLS0tLS0tLS0tLS0tLS0tLSBFTkQgTU9EVUxFIERFUEVOREVOQ0lFUyAtLS0tLS0tLS0tLS0tLVxuXG4gICAgLy8tLS0tLS0tLS0tLS0tLS0tIEJFR0lOIE1PRFVMRSBTQ09QRSBWQVJJQUJMRVMgLS0tLS0tLS0tLS0tLS1cbiAgICB2YXJcbiAgICBpbml0TW9kdWxlLFxuXG4gICAgY29uZmlnTWFwID0ge1xuICAgICAgICBtYWluX2h0bWw6IFN0cmluZygpICtcbiAgICAgICAgICAgICc8ZGl2IGNsYXNzPVwic2hlbGxhYy1jb250YWluZXJcIj48L2Rpdj4nLFxuXG4gICAgICAgIGNsaXBfdGVtcGxhdGVfaHRtbDogU3RyaW5nKCkgK1xuICAgICAgICAgICAgJzxhIGNsYXNzPVwic2hlbGxhYy1jbGlwLWFuY2hvclwiPjwvYT4nXG4gICAgfSxcblxuICAgIHN0YXRlTWFwID0ge1xuICAgICAgICAkY29udGFpbmVyICA6IHVuZGVmaW5lZFxuICAgICAgICAsIGNsaXBfZGIgICAgIDogVEFGRlkoKVxuICAgIH0sXG5cbiAgICBqcXVlcnlNYXAgPSB7fSxcblxuICAgIC8vLS0tLS0tLS0tLS0tLS0tLSBFTkQgTU9EVUxFIFNDT1BFIFZBUklBQkxFUyAtLS0tLS0tLS0tLS0tLVxuXG5cbiAgICAvLy0tLS0tLS0tLS0tLS0tLS0tLS0tLSBCRUdJTiBET00gTUVUSE9EUyAtLS0tLS0tLS0tLS0tLS0tLS0tLVxuXG4gICAgc2V0SnF1ZXJ5TWFwID0gZnVuY3Rpb24oKXtcbiAgICAgICAgdmFyICRvdXRlckRpdiA9IHN0YXRlTWFwLiRjb250YWluZXI7XG5cbiAgICAgICAganF1ZXJ5TWFwID0ge1xuICAgICAgICAgICAgJG91dGVyRGl2ICAgICAgICAgICAgICAgICAgIDogJG91dGVyRGl2LFxuICAgICAgICAgICAgJHNoZWxsYWNfY29udGFpbmVyICAgICAgICAgIDogJG91dGVyRGl2LmZpbmQoJy5zaGVsbGFjLWNvbnRhaW5lcicpXG4gICAgICAgIH07XG4gICAgfSxcblxuICAgIGRpc3BsYXlfY2xpcHMgPSBmdW5jdGlvbihjbGlwQXJyYXksICRjb250YWluZXIpe1xuXG4gICAgICAgIGNsaXBBcnJheS5mb3JFYWNoKGZ1bmN0aW9uKHVybCl7XG5cbiAgICAgICAgICAgIHZhciBhbmNob3IgPSBTdHJpbmcoKSArXG4gICAgICAgICAgICAnPGRpdiBjbGFzcz1cInJvdyBzaGVsbGFjLWNsaXAtbGlzdFwiPicgK1xuICAgICAgICAgICAgICAgICc8ZGl2IGNsYXNzPVwibWVkaWFcIj4nICtcbiAgICAgICAgICAgICAgICAgICAgJzxhIGNsYXNzPVwicHVsbC1sZWZ0XCIgaHJlZj1cIicgKyB1cmwgKyAnXCI+JyArXG4gICAgICAgICAgICAgICAgICAgICAgICAnPGltZyBjbGFzcz1cIm1lZGlhLW9iamVjdCBjbGlwXCIgc3JjPVwiL3N0YXRpYy9zaGVsbGFjL2Fzc2V0cy9zZXZlbnR5RWlnaHQucG5nXCIgYWx0PVwiXCI+JyArXG4gICAgICAgICAgICAgICAgICAgICc8L2E+JyArXG4gICAgICAgICAgICAgICAgICAgICc8ZGl2IGNsYXNzPVwibWVkaWEtYm9keVwiPicgK1xuICAgICAgICAgICAgICAgICAgICAgICAgJzxoNCBjbGFzcz1cIm1lZGlhLWhlYWRpbmdcIj5NZWRpYSB0aXRsZTwvaDQ+JyArXG4gICAgICAgICAgICAgICAgICAgICAgICAnPHAgY2xhc3M9XCJtZWRpYS1tZXRhXCI+TWV0YWRhdGE8L3A+JyArXG4gICAgICAgICAgICAgICAgICAgICAgICAnPHAgY2xhc3M9XCJtZWRpYS1kZXNjcmlwdGlvblwiPmJyaWVmIGRlc2NyaXB0aW9uPC9wPicgK1xuICAgICAgICAgICAgICAgICAgICAnPC9kaXY+JyArXG4gICAgICAgICAgICAgICAgJzwvZGl2PicgK1xuICAgICAgICAgICAgJzwvZGl2Pic7XG5cbiAgICAgICAgICAgICRjb250YWluZXIuYXBwZW5kKGFuY2hvcik7XG5cbiAgICAgICAgfSk7XG5cbiAgICB9O1xuICAgIC8vLS0tLS0tLS0tLS0tLS0tLS0tLS0tIEVORCBET00gTUVUSE9EUyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5cbiAgICAvLy0tLS0tLS0tLS0tLS0tLS0tLS0gQkVHSU4gRVZFTlQgSEFORExFUlMgLS0tLS0tLS0tLS0tLS0tLS0tLVxuICAgIC8vIEJlZ2luIEV2ZW50IGhhbmRsZXIgLy9cbiAgICAvLyBQdXJwb3NlICAgIDogSGFuZGxlcyB0aGUgZXZlbnRcbiAgICAvLyBBcmd1bWVudHMgIDpcbiAgICAvLyAgICogZXZlbnQgLSBqUXVlcnkgZXZlbnQgb2JqZWN0LlxuICAgIC8vIFNldHRpbmdzICAgOiBub25lXG4gICAgLy8gUmV0dXJucyAgICA6IGZhbHNlXG4gICAgLy8gQWN0aW9ucyAgICA6XG4gICAgLy8gICAqIFBhcnNlcyB0aGUgVVJJIGFuY2hvciBjb21wb25lbnRcbiAgICAvLy0tLS0tLS0tLS0tLS0tLS0tLS0tIEVORCBFVkVOVCBIQU5ETEVSUyAtLS0tLS0tLS0tLS0tLS0tLS0tLVxuXG4gICAgLy8tLS0tLS0tLS0tLS0tLS0tLS0tIEJFR0lOIFBVQkxJQyBNRVRIT0RTIC0tLS0tLS0tLS0tLS0tLS0tLS1cbiAgICAvLyBCZWdpbiBQdWJsaWMgbWV0aG9kIC9pbml0TW9kdWxlL1xuICAgIC8vIEV4YW1wbGUgICA6IHNwYS5zaGVsbC5pbml0TW9kdWxlKCAkKCcjZGl2JykgKTtcbiAgICAvLyBQdXJwb3NlICAgOlxuICAgIC8vICAgRGlyZWN0cyB0aGlzIGFwcCB0byBvZmZlciBpdHMgY2FwYWJpbGl0eSB0byB0aGUgdXNlclxuICAgIC8vIEFyZ3VtZW50cyA6XG4gICAgLy8gICAqICRjb250YWluZXIgKGV4YW1wbGU6ICQoJyNkaXYnKSkuXG4gICAgLy8gICAgIEEgalF1ZXJ5IGNvbGxlY3Rpb24gdGhhdCBzaG91bGQgcmVwcmVzZW50XG4gICAgLy8gICAgIGEgc2luZ2xlIERPTSBjb250YWluZXJcbiAgICAvLyBBY3Rpb24gICAgOlxuICAgIC8vICAgUG9wdWxhdGVzICRjb250YWluZXIgd2l0aCB0aGUgc2hlbGwgb2YgdGhlIFVJXG4gICAgLy8gICBhbmQgdGhlbiBjb25maWd1cmVzIGFuZCBpbml0aWFsaXplcyBmZWF0dXJlIG1vZHVsZXMuXG4gICAgLy8gICBUaGUgU2hlbGwgaXMgYWxzbyByZXNwb25zaWJsZSBmb3IgYnJvd3Nlci13aWRlIGlzc3Vlc1xuICAgIC8vIFJldHVybnMgICA6IG5vbmVcbiAgICAvLyBUaHJvd3MgICAgOiBub25lXG4gICAgaW5pdE1vZHVsZSA9IGZ1bmN0aW9uKCAkY29udGFpbmVyLCBkYXRhLCBUQUZGWSApe1xuICAgICAgICAvLyBsb2FkIEhUTUwgYW5kIG1hcCBqUXVlcnkgY29sbGVjdGlvbnNcbiAgICAgICAgc3RhdGVNYXAuJGNvbnRhaW5lciA9ICRjb250YWluZXI7XG4gICAgICAgICRjb250YWluZXIuaHRtbCggY29uZmlnTWFwLm1haW5faHRtbCApO1xuICAgICAgICBzZXRKcXVlcnlNYXAoKTtcblxuICAgICAgICAvL2xvYWQgZGF0YSBpbnRvIGluLWJyb3dzZXIgZGF0YWJhc2VcbiAgICAgICAgc3RhdGVNYXAuY2xpcF9kYi5pbnNlcnQoZGF0YSk7XG4gICAgICAgIHN0YXRlTWFwLmNsaXBzID0gc3RhdGVNYXAuY2xpcF9kYigpLmdldCgpO1xuXG4gICAgICAgIGRpc3BsYXlfY2xpcHMoc3RhdGVNYXAuY2xpcHMsIGpxdWVyeU1hcC4kc2hlbGxhY19jb250YWluZXIpO1xuICAgICAgICBjb25zb2xlLmxvZygkKFwiLm1lZGlhLW9iamVjdC5jbGlwXCIpKTtcbiAgICB9O1xuXG4gICAgcmV0dXJuIHsgaW5pdE1vZHVsZTogaW5pdE1vZHVsZSB9XG59KCkpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IHNoZWxsYWM7XG5cbiIsIi8qXG5cbiBTb2Z0d2FyZSBMaWNlbnNlIEFncmVlbWVudCAoQlNEIExpY2Vuc2UpXG4gaHR0cDovL3RhZmZ5ZGIuY29tXG4gQ29weXJpZ2h0IChjKVxuIEFsbCByaWdodHMgcmVzZXJ2ZWQuXG5cblxuIFJlZGlzdHJpYnV0aW9uIGFuZCB1c2Ugb2YgdGhpcyBzb2Z0d2FyZSBpbiBzb3VyY2UgYW5kIGJpbmFyeSBmb3Jtcywgd2l0aCBvciB3aXRob3V0IG1vZGlmaWNhdGlvbiwgYXJlIHBlcm1pdHRlZCBwcm92aWRlZCB0aGF0IHRoZSBmb2xsb3dpbmcgY29uZGl0aW9uIGlzIG1ldDpcblxuICogUmVkaXN0cmlidXRpb25zIG9mIHNvdXJjZSBjb2RlIG11c3QgcmV0YWluIHRoZSBhYm92ZSBjb3B5cmlnaHQgbm90aWNlLCB0aGlzIGxpc3Qgb2YgY29uZGl0aW9ucyBhbmQgdGhlIGZvbGxvd2luZyBkaXNjbGFpbWVyLlxuXG4gVEhJUyBTT0ZUV0FSRSBJUyBQUk9WSURFRCBCWSBUSEUgQ09QWVJJR0hUIEhPTERFUlMgQU5EIENPTlRSSUJVVE9SUyBcIkFTIElTXCIgQU5EIEFOWSBFWFBSRVNTIE9SIElNUExJRUQgV0FSUkFOVElFUywgSU5DTFVESU5HLCBCVVQgTk9UIExJTUlURUQgVE8sIFRIRSBJTVBMSUVEIFdBUlJBTlRJRVMgT0YgTUVSQ0hBTlRBQklMSVRZIEFORCBGSVRORVNTIEZPUiBBIFBBUlRJQ1VMQVIgUFVSUE9TRSBBUkUgRElTQ0xBSU1FRC4gSU4gTk8gRVZFTlQgU0hBTEwgVEhFIENPUFlSSUdIVCBPV05FUiBPUiBDT05UUklCVVRPUlMgQkUgTElBQkxFIEZPUiBBTlkgRElSRUNULCBJTkRJUkVDVCwgSU5DSURFTlRBTCwgU1BFQ0lBTCwgRVhFTVBMQVJZLCBPUiBDT05TRVFVRU5USUFMIERBTUFHRVMgKElOQ0xVRElORywgQlVUIE5PVFxuIExJTUlURUQgVE8sIFBST0NVUkVNRU5UIE9GIFNVQlNUSVRVVEUgR09PRFMgT1IgU0VSVklDRVM7IExPU1MgT0YgVVNFLCBEQVRBLCBPUiBQUk9GSVRTOyBPUiBCVVNJTkVTUyBJTlRFUlJVUFRJT04pIEhPV0VWRVIgQ0FVU0VEIEFORCBPTiBBTlkgVEhFT1JZIE9GIExJQUJJTElUWSwgV0hFVEhFUiBJTiBDT05UUkFDVCwgU1RSSUNUIExJQUJJTElUWSwgT1IgVE9SVCAoSU5DTFVESU5HIE5FR0xJR0VOQ0UgT1IgT1RIRVJXSVNFKSBBUklTSU5HIElOIEFOWSBXQVkgT1VUIE9GIFRIRSBVU0UgT0YgVEhJUyBTT0ZUV0FSRSwgRVZFTiBJRiBBRFZJU0VEIE9GIFRIRSBQT1NTSUJJTElUWSBPRiBTVUNIIERBTUFHRS5cblxuICovXG5cbi8qanNsaW50ICAgICAgICBicm93c2VyIDogdHJ1ZSwgY29udGludWUgOiB0cnVlLFxuIGRldmVsICA6IHRydWUsIGluZGVudCAgOiAyLCAgICBtYXhlcnIgICA6IDUwMCxcbiBuZXdjYXAgOiB0cnVlLCBub21lbiAgIDogdHJ1ZSwgcGx1c3BsdXMgOiB0cnVlLFxuIHJlZ2V4cCA6IHRydWUsIHNsb3BweSAgOiB0cnVlLCB2YXJzICAgICA6IGZhbHNlLFxuIHdoaXRlICA6IHRydWVcbiovXG5cbi8vIEJVSUxEIDE5M2Q0OGQsIG1vZGlmaWVkIGJ5IG1taWtvd3NraSB0byBwYXNzIGpzbGludFxuXG4vLyBTZXR1cCBUQUZGWSBuYW1lIHNwYWNlIHRvIHJldHVybiBhbiBvYmplY3Qgd2l0aCBtZXRob2RzXG52YXIgVEFGRlksIGV4cG9ydHMsIFQ7XG4oZnVuY3Rpb24gKCkge1xuICAndXNlIHN0cmljdCc7XG4gIHZhclxuICAgIHR5cGVMaXN0LCAgICAgbWFrZVRlc3QsICAgICBpZHgsICAgIHR5cGVLZXksXG4gICAgdmVyc2lvbiwgICAgICBUQywgICAgICAgICAgIGlkcGFkLCAgY21heCxcbiAgICBBUEksICAgICAgICAgIHByb3RlY3RKU09OLCAgZWFjaCwgICBlYWNoaW4sXG4gICAgaXNJbmRleGFibGUsICByZXR1cm5GaWx0ZXIsIHJ1bkZpbHRlcnMsXG4gICAgbnVtY2hhcnNwbGl0LCBvcmRlckJ5Q29sLCAgIHJ1biwgICAgaW50ZXJzZWN0aW9uLFxuICAgIGZpbHRlciwgICAgICAgbWFrZUNpZCwgICAgICBzYWZlRm9ySnNvbixcbiAgICBpc1JlZ2V4cFxuICAgIDtcblxuXG4gIGlmICggISBUQUZGWSApe1xuICAgIC8vIFRDID0gQ291bnRlciBmb3IgVGFmZnkgREJzIG9uIHBhZ2UsIHVzZWQgZm9yIHVuaXF1ZSBJRHNcbiAgICAvLyBjbWF4ID0gc2l6ZSBvZiBjaGFybnVtYXJyYXkgY29udmVyc2lvbiBjYWNoZVxuICAgIC8vIGlkcGFkID0gemVyb3MgdG8gcGFkIHJlY29yZCBJRHMgd2l0aFxuICAgIHZlcnNpb24gPSAnMi43JztcbiAgICBUQyAgICAgID0gMTtcbiAgICBpZHBhZCAgID0gJzAwMDAwMCc7XG4gICAgY21heCAgICA9IDEwMDA7XG4gICAgQVBJICAgICA9IHt9O1xuXG4gICAgcHJvdGVjdEpTT04gPSBmdW5jdGlvbiAoIHQgKSB7XG4gICAgICAvLyAqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqXG4gICAgICAvLyAqXG4gICAgICAvLyAqIFRha2VzOiBhIHZhcmlhYmxlXG4gICAgICAvLyAqIFJldHVybnM6IHRoZSB2YXJpYWJsZSBpZiBvYmplY3QvYXJyYXkgb3IgdGhlIHBhcnNlZCB2YXJpYWJsZSBpZiBKU09OXG4gICAgICAvLyAqXG4gICAgICAvLyAqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqICBcbiAgICAgIGlmICggVEFGRlkuaXNBcnJheSggdCApIHx8IFRBRkZZLmlzT2JqZWN0KCB0ICkgKXtcbiAgICAgICAgcmV0dXJuIHQ7XG4gICAgICB9XG4gICAgICBlbHNlIHtcbiAgICAgICAgcmV0dXJuIEpTT04ucGFyc2UoIHQgKTtcbiAgICAgIH1cbiAgICB9O1xuICAgIFxuICAgIC8vIGdyYWNlZnVsbHkgc3RvbGVuIGZyb20gdW5kZXJzY29yZS5qc1xuICAgIGludGVyc2VjdGlvbiA9IGZ1bmN0aW9uKGFycmF5MSwgYXJyYXkyKSB7XG4gICAgICAgIHJldHVybiBmaWx0ZXIoYXJyYXkxLCBmdW5jdGlvbihpdGVtKSB7XG4gICAgICAgICAgcmV0dXJuIGFycmF5Mi5pbmRleE9mKGl0ZW0pID49IDA7XG4gICAgICAgIH0pO1xuICAgIH07XG5cbiAgICAvLyBncmFjZWZ1bGx5IHN0b2xlbiBmcm9tIHVuZGVyc2NvcmUuanNcbiAgICBmaWx0ZXIgPSBmdW5jdGlvbihvYmosIGl0ZXJhdG9yLCBjb250ZXh0KSB7XG4gICAgICAgIHZhciByZXN1bHRzID0gW107XG4gICAgICAgIGlmIChvYmogPT0gbnVsbCkgcmV0dXJuIHJlc3VsdHM7XG4gICAgICAgIGlmIChBcnJheS5wcm90b3R5cGUuZmlsdGVyICYmIG9iai5maWx0ZXIgPT09IEFycmF5LnByb3RvdHlwZS5maWx0ZXIpIHJldHVybiBvYmouZmlsdGVyKGl0ZXJhdG9yLCBjb250ZXh0KTtcbiAgICAgICAgZWFjaChvYmosIGZ1bmN0aW9uKHZhbHVlLCBpbmRleCwgbGlzdCkge1xuICAgICAgICAgIGlmIChpdGVyYXRvci5jYWxsKGNvbnRleHQsIHZhbHVlLCBpbmRleCwgbGlzdCkpIHJlc3VsdHNbcmVzdWx0cy5sZW5ndGhdID0gdmFsdWU7XG4gICAgICAgIH0pO1xuICAgICAgICByZXR1cm4gcmVzdWx0cztcbiAgICB9O1xuICAgIFxuICAgIGlzUmVnZXhwID0gZnVuY3Rpb24oYU9iaikge1xuICAgICAgICByZXR1cm4gT2JqZWN0LnByb3RvdHlwZS50b1N0cmluZy5jYWxsKGFPYmopPT09J1tvYmplY3QgUmVnRXhwXSc7XG4gICAgfVxuICAgIFxuICAgIHNhZmVGb3JKc29uID0gZnVuY3Rpb24oYU9iaikge1xuICAgICAgICB2YXIgbXlSZXN1bHQgPSBULmlzQXJyYXkoYU9iaikgPyBbXSA6IFQuaXNPYmplY3QoYU9iaikgPyB7fSA6IG51bGw7XG4gICAgICAgIGlmKGFPYmo9PT1udWxsKSByZXR1cm4gYU9iajtcbiAgICAgICAgZm9yKHZhciBpIGluIGFPYmopIHtcbiAgICAgICAgICAgIG15UmVzdWx0W2ldICA9IGlzUmVnZXhwKGFPYmpbaV0pID8gYU9ialtpXS50b1N0cmluZygpIDogVC5pc0FycmF5KGFPYmpbaV0pIHx8IFQuaXNPYmplY3QoYU9ialtpXSkgPyBzYWZlRm9ySnNvbihhT2JqW2ldKSA6IGFPYmpbaV07XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIG15UmVzdWx0O1xuICAgIH1cbiAgICBcbiAgICBtYWtlQ2lkID0gZnVuY3Rpb24oYUNvbnRleHQpIHtcbiAgICAgICAgdmFyIG15Q2lkID0gSlNPTi5zdHJpbmdpZnkoYUNvbnRleHQpO1xuICAgICAgICBpZihteUNpZC5tYXRjaCgvcmVnZXgvKT09PW51bGwpIHJldHVybiBteUNpZDtcbiAgICAgICAgcmV0dXJuIEpTT04uc3RyaW5naWZ5KHNhZmVGb3JKc29uKGFDb250ZXh0KSk7XG4gICAgfVxuICAgIFxuICAgIGVhY2ggPSBmdW5jdGlvbiAoIGEsIGZ1biwgdSApIHtcbiAgICAgIHZhciByLCBpLCB4LCB5O1xuICAgICAgLy8gKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKlxuICAgICAgLy8gKlxuICAgICAgLy8gKiBUYWtlczpcbiAgICAgIC8vICogYSA9IGFuIG9iamVjdC92YWx1ZSBvciBhbiBhcnJheSBvZiBvYmplY3RzL3ZhbHVlc1xuICAgICAgLy8gKiBmID0gYSBmdW5jdGlvblxuICAgICAgLy8gKiB1ID0gb3B0aW9uYWwgZmxhZyB0byBkZXNjcmliZSBob3cgdG8gaGFuZGxlIHVuZGVmaW5lZCB2YWx1ZXNcbiAgICAgIC8vICAgaW4gYXJyYXkgb2YgdmFsdWVzLiBUcnVlOiBwYXNzIHRoZW0gdG8gdGhlIGZ1bmN0aW9ucyxcbiAgICAgIC8vICAgRmFsc2U6IHNraXAuIERlZmF1bHQgRmFsc2U7XG4gICAgICAvLyAqIFB1cnBvc2U6IFVzZWQgdG8gbG9vcCBvdmVyIGFycmF5c1xuICAgICAgLy8gKlxuICAgICAgLy8gKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKiAgXG4gICAgICBpZiAoIGEgJiYgKChULmlzQXJyYXkoIGEgKSAmJiBhLmxlbmd0aCA9PT0gMSkgfHwgKCFULmlzQXJyYXkoIGEgKSkpICl7XG4gICAgICAgIGZ1biggKFQuaXNBcnJheSggYSApKSA/IGFbMF0gOiBhLCAwICk7XG4gICAgICB9XG4gICAgICBlbHNlIHtcbiAgICAgICAgZm9yICggciwgaSwgeCA9IDAsIGEgPSAoVC5pc0FycmF5KCBhICkpID8gYSA6IFthXSwgeSA9IGEubGVuZ3RoO1xuICAgICAgICAgICAgICB4IDwgeTsgeCsrIClcbiAgICAgICAge1xuICAgICAgICAgIGkgPSBhW3hdO1xuICAgICAgICAgIGlmICggIVQuaXNVbmRlZmluZWQoIGkgKSB8fCAodSB8fCBmYWxzZSkgKXtcbiAgICAgICAgICAgIHIgPSBmdW4oIGksIHggKTtcbiAgICAgICAgICAgIGlmICggciA9PT0gVC5FWElUICl7XG4gICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9XG4gICAgfTtcblxuICAgIGVhY2hpbiA9IGZ1bmN0aW9uICggbywgZnVuICkge1xuICAgICAgLy8gKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKlxuICAgICAgLy8gKlxuICAgICAgLy8gKiBUYWtlczpcbiAgICAgIC8vICogbyA9IGFuIG9iamVjdFxuICAgICAgLy8gKiBmID0gYSBmdW5jdGlvblxuICAgICAgLy8gKiBQdXJwb3NlOiBVc2VkIHRvIGxvb3Agb3ZlciBvYmplY3RzXG4gICAgICAvLyAqXG4gICAgICAvLyAqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqICBcbiAgICAgIHZhciB4ID0gMCwgciwgaTtcblxuICAgICAgZm9yICggaSBpbiBvICl7XG4gICAgICAgIGlmICggby5oYXNPd25Qcm9wZXJ0eSggaSApICl7XG4gICAgICAgICAgciA9IGZ1biggb1tpXSwgaSwgeCsrICk7XG4gICAgICAgICAgaWYgKCByID09PSBULkVYSVQgKXtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgfTtcblxuICAgIEFQSS5leHRlbmQgPSBmdW5jdGlvbiAoIG0sIGYgKSB7XG4gICAgICAvLyAqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqXG4gICAgICAvLyAqXG4gICAgICAvLyAqIFRha2VzOiBtZXRob2QgbmFtZSwgZnVuY3Rpb25cbiAgICAgIC8vICogUHVycG9zZTogQWRkIGEgY3VzdG9tIG1ldGhvZCB0byB0aGUgQVBJXG4gICAgICAvLyAqXG4gICAgICAvLyAqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqICBcbiAgICAgIEFQSVttXSA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgcmV0dXJuIGYuYXBwbHkoIHRoaXMsIGFyZ3VtZW50cyApO1xuICAgICAgfTtcbiAgICB9O1xuXG4gICAgaXNJbmRleGFibGUgPSBmdW5jdGlvbiAoIGYgKSB7XG4gICAgICB2YXIgaTtcbiAgICAgIC8vIENoZWNrIHRvIHNlZSBpZiByZWNvcmQgSURcbiAgICAgIGlmICggVC5pc1N0cmluZyggZiApICYmIC9bdF1bMC05XSpbcl1bMC05XSovaS50ZXN0KCBmICkgKXtcbiAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICB9XG4gICAgICAvLyBDaGVjayB0byBzZWUgaWYgcmVjb3JkXG4gICAgICBpZiAoIFQuaXNPYmplY3QoIGYgKSAmJiBmLl9fX2lkICYmIGYuX19fcyApe1xuICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgIH1cblxuICAgICAgLy8gQ2hlY2sgdG8gc2VlIGlmIGFycmF5IG9mIGluZGV4ZXNcbiAgICAgIGlmICggVC5pc0FycmF5KCBmICkgKXtcbiAgICAgICAgaSA9IHRydWU7XG4gICAgICAgIGVhY2goIGYsIGZ1bmN0aW9uICggciApIHtcbiAgICAgICAgICBpZiAoICFpc0luZGV4YWJsZSggciApICl7XG4gICAgICAgICAgICBpID0gZmFsc2U7XG5cbiAgICAgICAgICAgIHJldHVybiBUQUZGWS5FWElUO1xuICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgICAgIHJldHVybiBpO1xuICAgICAgfVxuXG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfTtcblxuICAgIHJ1bkZpbHRlcnMgPSBmdW5jdGlvbiAoIHIsIGZpbHRlciApIHtcbiAgICAgIC8vICoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKipcbiAgICAgIC8vICpcbiAgICAgIC8vICogVGFrZXM6IHRha2VzIGEgcmVjb3JkIGFuZCBhIGNvbGxlY3Rpb24gb2YgZmlsdGVyc1xuICAgICAgLy8gKiBSZXR1cm5zOiB0cnVlIGlmIHRoZSByZWNvcmQgbWF0Y2hlcywgZmFsc2Ugb3RoZXJ3aXNlXG4gICAgICAvLyAqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqXG4gICAgICB2YXIgbWF0Y2ggPSB0cnVlO1xuXG5cbiAgICAgIGVhY2goIGZpbHRlciwgZnVuY3Rpb24gKCBtZiApIHtcbiAgICAgICAgc3dpdGNoICggVC50eXBlT2YoIG1mICkgKXtcbiAgICAgICAgICBjYXNlICdmdW5jdGlvbic6XG4gICAgICAgICAgICAvLyBydW4gZnVuY3Rpb25cbiAgICAgICAgICAgIGlmICggIW1mLmFwcGx5KCByICkgKXtcbiAgICAgICAgICAgICAgbWF0Y2ggPSBmYWxzZTtcbiAgICAgICAgICAgICAgcmV0dXJuIFRBRkZZLkVYSVQ7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgICBjYXNlICdhcnJheSc6XG4gICAgICAgICAgICAvLyBsb29wIGFycmF5IGFuZCB0cmVhdCBsaWtlIGEgU1FMIG9yXG4gICAgICAgICAgICBtYXRjaCA9IChtZi5sZW5ndGggPT09IDEpID8gKHJ1bkZpbHRlcnMoIHIsIG1mWzBdICkpIDpcbiAgICAgICAgICAgICAgKG1mLmxlbmd0aCA9PT0gMikgPyAocnVuRmlsdGVycyggciwgbWZbMF0gKSB8fFxuICAgICAgICAgICAgICAgIHJ1bkZpbHRlcnMoIHIsIG1mWzFdICkpIDpcbiAgICAgICAgICAgICAgICAobWYubGVuZ3RoID09PSAzKSA/IChydW5GaWx0ZXJzKCByLCBtZlswXSApIHx8XG4gICAgICAgICAgICAgICAgICBydW5GaWx0ZXJzKCByLCBtZlsxXSApIHx8IHJ1bkZpbHRlcnMoIHIsIG1mWzJdICkpIDpcbiAgICAgICAgICAgICAgICAgIChtZi5sZW5ndGggPT09IDQpID8gKHJ1bkZpbHRlcnMoIHIsIG1mWzBdICkgfHxcbiAgICAgICAgICAgICAgICAgICAgcnVuRmlsdGVycyggciwgbWZbMV0gKSB8fCBydW5GaWx0ZXJzKCByLCBtZlsyXSApIHx8XG4gICAgICAgICAgICAgICAgICAgIHJ1bkZpbHRlcnMoIHIsIG1mWzNdICkpIDogZmFsc2U7XG4gICAgICAgICAgICBpZiAoIG1mLmxlbmd0aCA+IDQgKXtcbiAgICAgICAgICAgICAgZWFjaCggbWYsIGZ1bmN0aW9uICggZiApIHtcbiAgICAgICAgICAgICAgICBpZiAoIHJ1bkZpbHRlcnMoIHIsIGYgKSApe1xuICAgICAgICAgICAgICAgICAgbWF0Y2ggPSB0cnVlO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgfVxuICAgICAgfSk7XG5cbiAgICAgIHJldHVybiBtYXRjaDtcbiAgICB9O1xuXG4gICAgcmV0dXJuRmlsdGVyID0gZnVuY3Rpb24gKCBmICkge1xuICAgICAgLy8gKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKlxuICAgICAgLy8gKlxuICAgICAgLy8gKiBUYWtlczogZmlsdGVyIG9iamVjdFxuICAgICAgLy8gKiBSZXR1cm5zOiBhIGZpbHRlciBmdW5jdGlvblxuICAgICAgLy8gKiBQdXJwb3NlOiBUYWtlIGEgZmlsdGVyIG9iamVjdCBhbmQgcmV0dXJuIGEgZnVuY3Rpb24gdGhhdCBjYW4gYmUgdXNlZCB0byBjb21wYXJlXG4gICAgICAvLyAqIGEgVGFmZnlEQiByZWNvcmQgdG8gc2VlIGlmIHRoZSByZWNvcmQgbWF0Y2hlcyBhIHF1ZXJ5XG4gICAgICAvLyAqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqICBcbiAgICAgIHZhciBuZiA9IFtdO1xuICAgICAgaWYgKCBULmlzU3RyaW5nKCBmICkgJiYgL1t0XVswLTldKltyXVswLTldKi9pLnRlc3QoIGYgKSApe1xuICAgICAgICBmID0geyBfX19pZCA6IGYgfTtcbiAgICAgIH1cbiAgICAgIGlmICggVC5pc0FycmF5KCBmICkgKXtcbiAgICAgICAgLy8gaWYgd2UgYXJlIHdvcmtpbmcgd2l0aCBhbiBhcnJheVxuXG4gICAgICAgIGVhY2goIGYsIGZ1bmN0aW9uICggciApIHtcbiAgICAgICAgICAvLyBsb29wIHRoZSBhcnJheSBhbmQgcmV0dXJuIGEgZmlsdGVyIGZ1bmMgZm9yIGVhY2ggdmFsdWVcbiAgICAgICAgICBuZi5wdXNoKCByZXR1cm5GaWx0ZXIoIHIgKSApO1xuICAgICAgICB9KTtcbiAgICAgICAgLy8gbm93IGJ1aWxkIGEgZnVuYyB0byBsb29wIG92ZXIgdGhlIGZpbHRlcnMgYW5kIHJldHVybiB0cnVlIGlmIEFOWSBvZiB0aGUgZmlsdGVycyBtYXRjaFxuICAgICAgICAvLyBUaGlzIGhhbmRsZXMgbG9naWNhbCBPUiBleHByZXNzaW9uc1xuICAgICAgICBmID0gZnVuY3Rpb24gKCkge1xuICAgICAgICAgIHZhciB0aGF0ID0gdGhpcywgbWF0Y2ggPSBmYWxzZTtcbiAgICAgICAgICBlYWNoKCBuZiwgZnVuY3Rpb24gKCBmICkge1xuICAgICAgICAgICAgaWYgKCBydW5GaWx0ZXJzKCB0aGF0LCBmICkgKXtcbiAgICAgICAgICAgICAgbWF0Y2ggPSB0cnVlO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH0pO1xuICAgICAgICAgIHJldHVybiBtYXRjaDtcbiAgICAgICAgfTtcbiAgICAgICAgcmV0dXJuIGY7XG5cbiAgICAgIH1cbiAgICAgIC8vIGlmIHdlIGFyZSBkZWFsaW5nIHdpdGggYW4gT2JqZWN0XG4gICAgICBpZiAoIFQuaXNPYmplY3QoIGYgKSApe1xuICAgICAgICBpZiAoIFQuaXNPYmplY3QoIGYgKSAmJiBmLl9fX2lkICYmIGYuX19fcyApe1xuICAgICAgICAgIGYgPSB7IF9fX2lkIDogZi5fX19pZCB9O1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gTG9vcCBvdmVyIGVhY2ggdmFsdWUgb24gdGhlIG9iamVjdCB0byBwcmVwIG1hdGNoIHR5cGUgYW5kIG1hdGNoIHZhbHVlXG4gICAgICAgIGVhY2hpbiggZiwgZnVuY3Rpb24gKCB2LCBpICkge1xuXG4gICAgICAgICAgLy8gZGVmYXVsdCBtYXRjaCB0eXBlIHRvIElTL0VxdWFsc1xuICAgICAgICAgIGlmICggIVQuaXNPYmplY3QoIHYgKSApe1xuICAgICAgICAgICAgdiA9IHtcbiAgICAgICAgICAgICAgJ2lzJyA6IHZcbiAgICAgICAgICAgIH07XG4gICAgICAgICAgfVxuICAgICAgICAgIC8vIGxvb3Agb3ZlciBlYWNoIHZhbHVlIG9uIHRoZSB2YWx1ZSBvYmplY3QgIC0gaWYgYW55XG4gICAgICAgICAgZWFjaGluKCB2LCBmdW5jdGlvbiAoIG10ZXN0LCBzICkge1xuICAgICAgICAgICAgLy8gcyA9IG1hdGNoIHR5cGUsIGUuZy4gaXMsIGhhc0FsbCwgbGlrZSwgZXRjXG4gICAgICAgICAgICB2YXIgYyA9IFtdLCBsb29wZXI7XG5cbiAgICAgICAgICAgIC8vIGZ1bmN0aW9uIHRvIGxvb3AgYW5kIGFwcGx5IGZpbHRlclxuICAgICAgICAgICAgbG9vcGVyID0gKHMgPT09ICdoYXNBbGwnKSA/XG4gICAgICAgICAgICAgIGZ1bmN0aW9uICggbXRlc3QsIGZ1bmMgKSB7XG4gICAgICAgICAgICAgICAgZnVuYyggbXRlc3QgKTtcbiAgICAgICAgICAgICAgfSA6IGVhY2g7XG5cbiAgICAgICAgICAgIC8vIGxvb3Agb3ZlciBlYWNoIHRlc3RcbiAgICAgICAgICAgIGxvb3BlciggbXRlc3QsIGZ1bmN0aW9uICggbXRlc3QgKSB7XG5cbiAgICAgICAgICAgICAgLy8gc3UgPSBtYXRjaCBzdWNjZXNzXG4gICAgICAgICAgICAgIC8vIGYgPSBtYXRjaCBmYWxzZVxuICAgICAgICAgICAgICB2YXIgc3UgPSB0cnVlLCBmID0gZmFsc2UsIG1hdGNoRnVuYztcblxuXG4gICAgICAgICAgICAgIC8vIHB1c2ggYSBmdW5jdGlvbiBvbnRvIHRoZSBmaWx0ZXIgY29sbGVjdGlvbiB0byBkbyB0aGUgbWF0Y2hpbmdcbiAgICAgICAgICAgICAgbWF0Y2hGdW5jID0gZnVuY3Rpb24gKCkge1xuXG4gICAgICAgICAgICAgICAgLy8gZ2V0IHRoZSB2YWx1ZSBmcm9tIHRoZSByZWNvcmRcbiAgICAgICAgICAgICAgICB2YXJcbiAgICAgICAgICAgICAgICAgIG12YWx1ZSAgID0gdGhpc1tpXSxcbiAgICAgICAgICAgICAgICAgIGVxZXEgICAgID0gJz09JyxcbiAgICAgICAgICAgICAgICAgIGJhbmdlcSAgID0gJyE9JyxcbiAgICAgICAgICAgICAgICAgIGVxZXFlcSAgID0gJz09PScsXG4gICAgICAgICAgICAgICAgICBsdCAgID0gJzwnLFxuICAgICAgICAgICAgICAgICAgZ3QgICA9ICc+JyxcbiAgICAgICAgICAgICAgICAgIGx0ZXEgICA9ICc8PScsXG4gICAgICAgICAgICAgICAgICBndGVxICAgPSAnPj0nLFxuICAgICAgICAgICAgICAgICAgYmFuZ2VxZXEgPSAnIT09JyxcbiAgICAgICAgICAgICAgICAgIHJcbiAgICAgICAgICAgICAgICAgIDtcblxuICAgICAgICAgICAgICAgIGlmICh0eXBlb2YgbXZhbHVlID09PSAndW5kZWZpbmVkJykge1xuICAgICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICBpZiAoIChzLmluZGV4T2YoICchJyApID09PSAwKSAmJiBzICE9PSBiYW5nZXEgJiZcbiAgICAgICAgICAgICAgICAgIHMgIT09IGJhbmdlcWVxIClcbiAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAvLyBpZiB0aGUgZmlsdGVyIG5hbWUgc3RhcnRzIHdpdGggISBhcyBpbiAnIWlzJyB0aGVuIHJldmVyc2UgdGhlIG1hdGNoIGxvZ2ljIGFuZCByZW1vdmUgdGhlICFcbiAgICAgICAgICAgICAgICAgIHN1ID0gZmFsc2U7XG4gICAgICAgICAgICAgICAgICBzID0gcy5zdWJzdHJpbmcoIDEsIHMubGVuZ3RoICk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIC8vIGdldCB0aGUgbWF0Y2ggcmVzdWx0cyBiYXNlZCBvbiB0aGUgcy9tYXRjaCB0eXBlXG4gICAgICAgICAgICAgICAgLypqc2xpbnQgZXFlcSA6IHRydWUgKi9cbiAgICAgICAgICAgICAgICByID0gKFxuICAgICAgICAgICAgICAgICAgKHMgPT09ICdyZWdleCcpID8gKG10ZXN0LnRlc3QoIG12YWx1ZSApKSA6IChzID09PSAnbHQnIHx8IHMgPT09IGx0KVxuICAgICAgICAgICAgICAgICAgPyAobXZhbHVlIDwgbXRlc3QpICA6IChzID09PSAnZ3QnIHx8IHMgPT09IGd0KVxuICAgICAgICAgICAgICAgICAgPyAobXZhbHVlID4gbXRlc3QpICA6IChzID09PSAnbHRlJyB8fCBzID09PSBsdGVxKVxuICAgICAgICAgICAgICAgICAgPyAobXZhbHVlIDw9IG10ZXN0KSA6IChzID09PSAnZ3RlJyB8fCBzID09PSBndGVxKVxuICAgICAgICAgICAgICAgICAgPyAobXZhbHVlID49IG10ZXN0KSA6IChzID09PSAnbGVmdCcpXG4gICAgICAgICAgICAgICAgICA/IChtdmFsdWUuaW5kZXhPZiggbXRlc3QgKSA9PT0gMCkgOiAocyA9PT0gJ2xlZnRub2Nhc2UnKVxuICAgICAgICAgICAgICAgICAgPyAobXZhbHVlLnRvTG93ZXJDYXNlKCkuaW5kZXhPZiggbXRlc3QudG9Mb3dlckNhc2UoKSApXG4gICAgICAgICAgICAgICAgICAgID09PSAwKSA6IChzID09PSAncmlnaHQnKVxuICAgICAgICAgICAgICAgICAgPyAobXZhbHVlLnN1YnN0cmluZyggKG12YWx1ZS5sZW5ndGggLSBtdGVzdC5sZW5ndGgpIClcbiAgICAgICAgICAgICAgICAgICAgPT09IG10ZXN0KSA6IChzID09PSAncmlnaHRub2Nhc2UnKVxuICAgICAgICAgICAgICAgICAgPyAobXZhbHVlLnRvTG93ZXJDYXNlKCkuc3Vic3RyaW5nKFxuICAgICAgICAgICAgICAgICAgICAobXZhbHVlLmxlbmd0aCAtIG10ZXN0Lmxlbmd0aCkgKSA9PT0gbXRlc3QudG9Mb3dlckNhc2UoKSlcbiAgICAgICAgICAgICAgICAgICAgOiAocyA9PT0gJ2xpa2UnKVxuICAgICAgICAgICAgICAgICAgPyAobXZhbHVlLmluZGV4T2YoIG10ZXN0ICkgPj0gMCkgOiAocyA9PT0gJ2xpa2Vub2Nhc2UnKVxuICAgICAgICAgICAgICAgICAgPyAobXZhbHVlLnRvTG93ZXJDYXNlKCkuaW5kZXhPZihtdGVzdC50b0xvd2VyQ2FzZSgpKSA+PSAwKVxuICAgICAgICAgICAgICAgICAgICA6IChzID09PSBlcWVxZXEgfHwgcyA9PT0gJ2lzJylcbiAgICAgICAgICAgICAgICAgID8gKG12YWx1ZSA9PT0gIG10ZXN0KSA6IChzID09PSBlcWVxKVxuICAgICAgICAgICAgICAgICAgPyAobXZhbHVlID09IG10ZXN0KSA6IChzID09PSBiYW5nZXFlcSlcbiAgICAgICAgICAgICAgICAgID8gKG12YWx1ZSAhPT0gIG10ZXN0KSA6IChzID09PSBiYW5nZXEpXG4gICAgICAgICAgICAgICAgICA/IChtdmFsdWUgIT0gbXRlc3QpIDogKHMgPT09ICdpc25vY2FzZScpXG4gICAgICAgICAgICAgICAgICA/IChtdmFsdWUudG9Mb3dlckNhc2VcbiAgICAgICAgICAgICAgICAgICAgPyBtdmFsdWUudG9Mb3dlckNhc2UoKSA9PT0gbXRlc3QudG9Mb3dlckNhc2UoKVxuICAgICAgICAgICAgICAgICAgICAgIDogbXZhbHVlID09PSBtdGVzdCkgOiAocyA9PT0gJ2hhcycpXG4gICAgICAgICAgICAgICAgICA/IChULmhhcyggbXZhbHVlLCBtdGVzdCApKSA6IChzID09PSAnaGFzYWxsJylcbiAgICAgICAgICAgICAgICAgID8gKFQuaGFzQWxsKCBtdmFsdWUsIG10ZXN0ICkpIDogKHMgPT09ICdjb250YWlucycpXG4gICAgICAgICAgICAgICAgICA/IChUQUZGWS5pc0FycmF5KG12YWx1ZSkgJiYgbXZhbHVlLmluZGV4T2YobXRlc3QpID4gLTEpIDogKFxuICAgICAgICAgICAgICAgICAgICBzLmluZGV4T2YoICdpcycgKSA9PT0gLTFcbiAgICAgICAgICAgICAgICAgICAgICAmJiAhVEFGRlkuaXNOdWxsKCBtdmFsdWUgKVxuICAgICAgICAgICAgICAgICAgICAgICYmICFUQUZGWS5pc1VuZGVmaW5lZCggbXZhbHVlIClcbiAgICAgICAgICAgICAgICAgICAgICAmJiAhVEFGRlkuaXNPYmplY3QoIG10ZXN0IClcbiAgICAgICAgICAgICAgICAgICAgICAmJiAhVEFGRlkuaXNBcnJheSggbXRlc3QgKVxuICAgICAgICAgICAgICAgICAgICApXG4gICAgICAgICAgICAgICAgICA/IChtdGVzdCA9PT0gbXZhbHVlW3NdKVxuICAgICAgICAgICAgICAgICAgICA6IChUW3NdICYmIFQuaXNGdW5jdGlvbiggVFtzXSApXG4gICAgICAgICAgICAgICAgICAgICYmIHMuaW5kZXhPZiggJ2lzJyApID09PSAwKVxuICAgICAgICAgICAgICAgICAgPyBUW3NdKCBtdmFsdWUgKSA9PT0gbXRlc3RcbiAgICAgICAgICAgICAgICAgICAgOiAoVFtzXSAmJiBULmlzRnVuY3Rpb24oIFRbc10gKSlcbiAgICAgICAgICAgICAgICAgID8gVFtzXSggbXZhbHVlLCBtdGVzdCApIDogKGZhbHNlKVxuICAgICAgICAgICAgICAgICk7XG4gICAgICAgICAgICAgICAgLypqc2xpbnQgZXFlcSA6IGZhbHNlICovXG4gICAgICAgICAgICAgICAgciA9IChyICYmICFzdSkgPyBmYWxzZSA6ICghciAmJiAhc3UpID8gdHJ1ZSA6IHI7XG5cbiAgICAgICAgICAgICAgICByZXR1cm4gcjtcbiAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgICAgYy5wdXNoKCBtYXRjaEZ1bmMgKTtcblxuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAvLyBpZiBvbmx5IG9uZSBmaWx0ZXIgaW4gdGhlIGNvbGxlY3Rpb24gcHVzaCBpdCBvbnRvIHRoZSBmaWx0ZXIgbGlzdCB3aXRob3V0IHRoZSBhcnJheVxuICAgICAgICAgICAgaWYgKCBjLmxlbmd0aCA9PT0gMSApe1xuXG4gICAgICAgICAgICAgIG5mLnB1c2goIGNbMF0gKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAvLyBlbHNlIGJ1aWxkIGEgZnVuY3Rpb24gdG8gbG9vcCBvdmVyIGFsbCB0aGUgZmlsdGVycyBhbmQgcmV0dXJuIHRydWUgb25seSBpZiBBTEwgbWF0Y2hcbiAgICAgICAgICAgICAgLy8gdGhpcyBpcyBhIGxvZ2ljYWwgQU5EXG4gICAgICAgICAgICAgIG5mLnB1c2goIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICB2YXIgdGhhdCA9IHRoaXMsIG1hdGNoID0gZmFsc2U7XG4gICAgICAgICAgICAgICAgZWFjaCggYywgZnVuY3Rpb24gKCBmICkge1xuICAgICAgICAgICAgICAgICAgaWYgKCBmLmFwcGx5KCB0aGF0ICkgKXtcbiAgICAgICAgICAgICAgICAgICAgbWF0Y2ggPSB0cnVlO1xuICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIHJldHVybiBtYXRjaDtcbiAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfSk7XG4gICAgICAgIH0pO1xuICAgICAgICAvLyBmaW5hbGx5IHJldHVybiBhIHNpbmdsZSBmdW5jdGlvbiB0aGF0IHdyYXBzIGFsbCB0aGUgb3RoZXIgZnVuY3Rpb25zIGFuZCB3aWxsIHJ1biBhIHF1ZXJ5XG4gICAgICAgIC8vIHdoZXJlIGFsbCBmdW5jdGlvbnMgaGF2ZSB0byByZXR1cm4gdHJ1ZSBmb3IgYSByZWNvcmQgdG8gYXBwZWFyIGluIGEgcXVlcnkgcmVzdWx0XG4gICAgICAgIGYgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgdmFyIHRoYXQgPSB0aGlzLCBtYXRjaCA9IHRydWU7XG4gICAgICAgICAgLy8gZmFzdGVyIGlmIGxlc3MgdGhhbiAgNCBmdW5jdGlvbnNcbiAgICAgICAgICBtYXRjaCA9IChuZi5sZW5ndGggPT09IDEgJiYgIW5mWzBdLmFwcGx5KCB0aGF0ICkpID8gZmFsc2UgOlxuICAgICAgICAgICAgKG5mLmxlbmd0aCA9PT0gMiAmJlxuICAgICAgICAgICAgICAoIW5mWzBdLmFwcGx5KCB0aGF0ICkgfHwgIW5mWzFdLmFwcGx5KCB0aGF0ICkpKSA/IGZhbHNlIDpcbiAgICAgICAgICAgICAgKG5mLmxlbmd0aCA9PT0gMyAmJlxuICAgICAgICAgICAgICAgICghbmZbMF0uYXBwbHkoIHRoYXQgKSB8fCAhbmZbMV0uYXBwbHkoIHRoYXQgKSB8fFxuICAgICAgICAgICAgICAgICAgIW5mWzJdLmFwcGx5KCB0aGF0ICkpKSA/IGZhbHNlIDpcbiAgICAgICAgICAgICAgICAobmYubGVuZ3RoID09PSA0ICYmXG4gICAgICAgICAgICAgICAgICAoIW5mWzBdLmFwcGx5KCB0aGF0ICkgfHwgIW5mWzFdLmFwcGx5KCB0aGF0ICkgfHxcbiAgICAgICAgICAgICAgICAgICAgIW5mWzJdLmFwcGx5KCB0aGF0ICkgfHwgIW5mWzNdLmFwcGx5KCB0aGF0ICkpKSA/IGZhbHNlXG4gICAgICAgICAgICAgICAgICA6IHRydWU7XG4gICAgICAgICAgaWYgKCBuZi5sZW5ndGggPiA0ICl7XG4gICAgICAgICAgICBlYWNoKCBuZiwgZnVuY3Rpb24gKCBmICkge1xuICAgICAgICAgICAgICBpZiAoICFydW5GaWx0ZXJzKCB0aGF0LCBmICkgKXtcbiAgICAgICAgICAgICAgICBtYXRjaCA9IGZhbHNlO1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICB9XG4gICAgICAgICAgcmV0dXJuIG1hdGNoO1xuICAgICAgICB9O1xuICAgICAgICByZXR1cm4gZjtcbiAgICAgIH1cblxuICAgICAgLy8gaWYgZnVuY3Rpb25cbiAgICAgIGlmICggVC5pc0Z1bmN0aW9uKCBmICkgKXtcbiAgICAgICAgcmV0dXJuIGY7XG4gICAgICB9XG4gICAgfTtcblxuICAgIG9yZGVyQnlDb2wgPSBmdW5jdGlvbiAoIGFyLCBvICkge1xuICAgICAgLy8gKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKlxuICAgICAgLy8gKlxuICAgICAgLy8gKiBUYWtlczogdGFrZXMgYW4gYXJyYXkgYW5kIGEgc29ydCBvYmplY3RcbiAgICAgIC8vICogUmV0dXJuczogdGhlIGFycmF5IHNvcnRlZFxuICAgICAgLy8gKiBQdXJwb3NlOiBBY2NlcHQgZmlsdGVycyBzdWNoIGFzIFwiW2NvbF0sIFtjb2wyXVwiIG9yIFwiW2NvbF0gZGVzY1wiIGFuZCBzb3J0IG9uIHRob3NlIGNvbHVtbnNcbiAgICAgIC8vICpcbiAgICAgIC8vICoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKipcblxuICAgICAgdmFyIHNvcnRGdW5jID0gZnVuY3Rpb24gKCBhLCBiICkge1xuICAgICAgICAvLyBmdW5jdGlvbiB0byBwYXNzIHRvIHRoZSBuYXRpdmUgYXJyYXkuc29ydCB0byBzb3J0IGFuIGFycmF5XG4gICAgICAgIHZhciByID0gMDtcblxuICAgICAgICBULmVhY2goIG8sIGZ1bmN0aW9uICggc2QgKSB7XG4gICAgICAgICAgLy8gbG9vcCBvdmVyIHRoZSBzb3J0IGluc3RydWN0aW9uc1xuICAgICAgICAgIC8vIGdldCB0aGUgY29sdW1uIG5hbWVcbiAgICAgICAgICB2YXIgbywgY29sLCBkaXIsIGMsIGQ7XG4gICAgICAgICAgbyA9IHNkLnNwbGl0KCAnICcgKTtcbiAgICAgICAgICBjb2wgPSBvWzBdO1xuXG4gICAgICAgICAgLy8gZ2V0IHRoZSBkaXJlY3Rpb25cbiAgICAgICAgICBkaXIgPSAoby5sZW5ndGggPT09IDEpID8gXCJsb2dpY2FsXCIgOiBvWzFdO1xuXG5cbiAgICAgICAgICBpZiAoIGRpciA9PT0gJ2xvZ2ljYWwnICl7XG4gICAgICAgICAgICAvLyBpZiBkaXIgaXMgbG9naWNhbCB0aGFuIGdyYWIgdGhlIGNoYXJudW0gYXJyYXlzIGZvciB0aGUgdHdvIHZhbHVlcyB3ZSBhcmUgbG9va2luZyBhdFxuICAgICAgICAgICAgYyA9IG51bWNoYXJzcGxpdCggYVtjb2xdICk7XG4gICAgICAgICAgICBkID0gbnVtY2hhcnNwbGl0KCBiW2NvbF0gKTtcbiAgICAgICAgICAgIC8vIGxvb3Agb3ZlciB0aGUgY2hhcm51bWFycmF5cyB1bnRpbCBvbmUgdmFsdWUgaXMgaGlnaGVyIHRoYW4gdGhlIG90aGVyXG4gICAgICAgICAgICBULmVhY2goIChjLmxlbmd0aCA8PSBkLmxlbmd0aCkgPyBjIDogZCwgZnVuY3Rpb24gKCB4LCBpICkge1xuICAgICAgICAgICAgICBpZiAoIGNbaV0gPCBkW2ldICl7XG4gICAgICAgICAgICAgICAgciA9IC0xO1xuICAgICAgICAgICAgICAgIHJldHVybiBUQUZGWS5FWElUO1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgIGVsc2UgaWYgKCBjW2ldID4gZFtpXSApe1xuICAgICAgICAgICAgICAgIHIgPSAxO1xuICAgICAgICAgICAgICAgIHJldHVybiBUQUZGWS5FWElUO1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9ICk7XG4gICAgICAgICAgfVxuICAgICAgICAgIGVsc2UgaWYgKCBkaXIgPT09ICdsb2dpY2FsZGVzYycgKXtcbiAgICAgICAgICAgIC8vIGlmIGxvZ2ljYWxkZXNjIHRoYW4gZ3JhYiB0aGUgY2hhcm51bSBhcnJheXMgZm9yIHRoZSB0d28gdmFsdWVzIHdlIGFyZSBsb29raW5nIGF0XG4gICAgICAgICAgICBjID0gbnVtY2hhcnNwbGl0KCBhW2NvbF0gKTtcbiAgICAgICAgICAgIGQgPSBudW1jaGFyc3BsaXQoIGJbY29sXSApO1xuICAgICAgICAgICAgLy8gbG9vcCBvdmVyIHRoZSBjaGFybnVtYXJyYXlzIHVudGlsIG9uZSB2YWx1ZSBpcyBsb3dlciB0aGFuIHRoZSBvdGhlclxuICAgICAgICAgICAgVC5lYWNoKCAoYy5sZW5ndGggPD0gZC5sZW5ndGgpID8gYyA6IGQsIGZ1bmN0aW9uICggeCwgaSApIHtcbiAgICAgICAgICAgICAgaWYgKCBjW2ldID4gZFtpXSApe1xuICAgICAgICAgICAgICAgIHIgPSAtMTtcbiAgICAgICAgICAgICAgICByZXR1cm4gVEFGRlkuRVhJVDtcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICBlbHNlIGlmICggY1tpXSA8IGRbaV0gKXtcbiAgICAgICAgICAgICAgICByID0gMTtcbiAgICAgICAgICAgICAgICByZXR1cm4gVEFGRlkuRVhJVDtcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSApO1xuICAgICAgICAgIH1cbiAgICAgICAgICBlbHNlIGlmICggZGlyID09PSAnYXNlYycgJiYgYVtjb2xdIDwgYltjb2xdICl7XG4gICAgICAgICAgICAvLyBpZiBhc2VjIC0gZGVmYXVsdCAtIGNoZWNrIHRvIHNlZSB3aGljaCBpcyBoaWdoZXJcbiAgICAgICAgICAgIHIgPSAtMTtcbiAgICAgICAgICAgIHJldHVybiBULkVYSVQ7XG4gICAgICAgICAgfVxuICAgICAgICAgIGVsc2UgaWYgKCBkaXIgPT09ICdhc2VjJyAmJiBhW2NvbF0gPiBiW2NvbF0gKXtcbiAgICAgICAgICAgIC8vIGlmIGFzZWMgLSBkZWZhdWx0IC0gY2hlY2sgdG8gc2VlIHdoaWNoIGlzIGhpZ2hlclxuICAgICAgICAgICAgciA9IDE7XG4gICAgICAgICAgICByZXR1cm4gVC5FWElUO1xuICAgICAgICAgIH1cbiAgICAgICAgICBlbHNlIGlmICggZGlyID09PSAnZGVzYycgJiYgYVtjb2xdID4gYltjb2xdICl7XG4gICAgICAgICAgICAvLyBpZiBkZXNjIGNoZWNrIHRvIHNlZSB3aGljaCBpcyBsb3dlclxuICAgICAgICAgICAgciA9IC0xO1xuICAgICAgICAgICAgcmV0dXJuIFQuRVhJVDtcblxuICAgICAgICAgIH1cbiAgICAgICAgICBlbHNlIGlmICggZGlyID09PSAnZGVzYycgJiYgYVtjb2xdIDwgYltjb2xdICl7XG4gICAgICAgICAgICAvLyBpZiBkZXNjIGNoZWNrIHRvIHNlZSB3aGljaCBpcyBsb3dlclxuICAgICAgICAgICAgciA9IDE7XG4gICAgICAgICAgICByZXR1cm4gVC5FWElUO1xuXG4gICAgICAgICAgfVxuICAgICAgICAgIC8vIGlmIHIgaXMgc3RpbGwgMCBhbmQgd2UgYXJlIGRvaW5nIGEgbG9naWNhbCBzb3J0IHRoYW4gbG9vayB0byBzZWUgaWYgb25lIGFycmF5IGlzIGxvbmdlciB0aGFuIHRoZSBvdGhlclxuICAgICAgICAgIGlmICggciA9PT0gMCAmJiBkaXIgPT09ICdsb2dpY2FsJyAmJiBjLmxlbmd0aCA8IGQubGVuZ3RoICl7XG4gICAgICAgICAgICByID0gLTE7XG4gICAgICAgICAgfVxuICAgICAgICAgIGVsc2UgaWYgKCByID09PSAwICYmIGRpciA9PT0gJ2xvZ2ljYWwnICYmIGMubGVuZ3RoID4gZC5sZW5ndGggKXtcbiAgICAgICAgICAgIHIgPSAxO1xuICAgICAgICAgIH1cbiAgICAgICAgICBlbHNlIGlmICggciA9PT0gMCAmJiBkaXIgPT09ICdsb2dpY2FsZGVzYycgJiYgYy5sZW5ndGggPiBkLmxlbmd0aCApe1xuICAgICAgICAgICAgciA9IC0xO1xuICAgICAgICAgIH1cbiAgICAgICAgICBlbHNlIGlmICggciA9PT0gMCAmJiBkaXIgPT09ICdsb2dpY2FsZGVzYycgJiYgYy5sZW5ndGggPCBkLmxlbmd0aCApe1xuICAgICAgICAgICAgciA9IDE7XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgaWYgKCByICE9PSAwICl7XG4gICAgICAgICAgICByZXR1cm4gVC5FWElUO1xuICAgICAgICAgIH1cblxuXG4gICAgICAgIH0gKTtcbiAgICAgICAgcmV0dXJuIHI7XG4gICAgICB9O1xuICAgICAgLy8gY2FsbCB0aGUgc29ydCBmdW5jdGlvbiBhbmQgcmV0dXJuIHRoZSBuZXdseSBzb3J0ZWQgYXJyYXlcbiAgICAgIHJldHVybiAoYXIgJiYgYXIucHVzaCkgPyBhci5zb3J0KCBzb3J0RnVuYyApIDogYXI7XG5cblxuICAgIH07XG5cbiAgICAvLyAqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqXG4gICAgLy8gKlxuICAgIC8vICogVGFrZXM6IGEgc3RyaW5nIGNvbnRhaW5pbmcgbnVtYmVycyBhbmQgbGV0dGVycyBhbmQgdHVybiBpdCBpbnRvIGFuIGFycmF5XG4gICAgLy8gKiBSZXR1cm5zOiByZXR1cm4gYW4gYXJyYXkgb2YgbnVtYmVycyBhbmQgbGV0dGVyc1xuICAgIC8vICogUHVycG9zZTogVXNlZCBmb3IgbG9naWNhbCBzb3J0aW5nLiBTdHJpbmcgRXhhbXBsZTogMTJBQkMgcmVzdWx0czogWzEyLCdBQkMnXVxuICAgIC8vICoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKiogXG4gICAgKGZ1bmN0aW9uICgpIHtcbiAgICAgIC8vIGNyZWF0ZXMgYSBjYWNoZSBmb3IgbnVtY2hhciBjb252ZXJzaW9uc1xuICAgICAgdmFyIGNhY2hlID0ge30sIGNhY2hjb3VudGVyID0gMDtcbiAgICAgIC8vIGNyZWF0ZXMgdGhlIG51bWNoYXJzcGxpdCBmdW5jdGlvblxuICAgICAgbnVtY2hhcnNwbGl0ID0gZnVuY3Rpb24gKCB0aGluZyApIHtcbiAgICAgICAgLy8gaWYgb3ZlciAxMDAwIGl0ZW1zIGV4aXN0IGluIHRoZSBjYWNoZSwgY2xlYXIgaXQgYW5kIHN0YXJ0IG92ZXJcbiAgICAgICAgaWYgKCBjYWNoY291bnRlciA+IGNtYXggKXtcbiAgICAgICAgICBjYWNoZSA9IHt9O1xuICAgICAgICAgIGNhY2hjb3VudGVyID0gMDtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIGlmIGEgY2FjaGUgY2FuIGJlIGZvdW5kIGZvciBhIG51bWNoYXIgdGhlbiByZXR1cm4gaXRzIGFycmF5IHZhbHVlXG4gICAgICAgIHJldHVybiBjYWNoZVsnXycgKyB0aGluZ10gfHwgKGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAvLyBvdGhlcndpc2UgZG8gdGhlIGNvbnZlcnNpb25cbiAgICAgICAgICAvLyBtYWtlIHN1cmUgaXQgaXMgYSBzdHJpbmcgYW5kIHNldHVwIHNvIG90aGVyIHZhcmlhYmxlc1xuICAgICAgICAgIHZhciBudGhpbmcgPSBTdHJpbmcoIHRoaW5nICksXG4gICAgICAgICAgICBuYSA9IFtdLFxuICAgICAgICAgICAgcnYgPSAnXycsXG4gICAgICAgICAgICBydCA9ICcnLFxuICAgICAgICAgICAgeCwgeHgsIGM7XG5cbiAgICAgICAgICAvLyBsb29wIG92ZXIgdGhlIHN0cmluZyBjaGFyIGJ5IGNoYXJcbiAgICAgICAgICBmb3IgKCB4ID0gMCwgeHggPSBudGhpbmcubGVuZ3RoOyB4IDwgeHg7IHgrKyApe1xuICAgICAgICAgICAgLy8gdGFrZSB0aGUgY2hhciBhdCBlYWNoIGxvY2F0aW9uXG4gICAgICAgICAgICBjID0gbnRoaW5nLmNoYXJDb2RlQXQoIHggKTtcbiAgICAgICAgICAgIC8vIGNoZWNrIHRvIHNlZSBpZiBpdCBpcyBhIHZhbGlkIG51bWJlciBjaGFyIGFuZCBhcHBlbmQgaXQgdG8gdGhlIGFycmF5LlxuICAgICAgICAgICAgLy8gaWYgbGFzdCBjaGFyIHdhcyBhIHN0cmluZyBwdXNoIHRoZSBzdHJpbmcgdG8gdGhlIGNoYXJudW0gYXJyYXlcbiAgICAgICAgICAgIGlmICggKCBjID49IDQ4ICYmIGMgPD0gNTcgKSB8fCBjID09PSA0NiApe1xuICAgICAgICAgICAgICBpZiAoIHJ0ICE9PSAnbicgKXtcbiAgICAgICAgICAgICAgICBydCA9ICduJztcbiAgICAgICAgICAgICAgICBuYS5wdXNoKCBydi50b0xvd2VyQ2FzZSgpICk7XG4gICAgICAgICAgICAgICAgcnYgPSAnJztcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICBydiA9IHJ2ICsgbnRoaW5nLmNoYXJBdCggeCApO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgIC8vIGNoZWNrIHRvIHNlZSBpZiBpdCBpcyBhIHZhbGlkIHN0cmluZyBjaGFyIGFuZCBhcHBlbmQgdG8gc3RyaW5nXG4gICAgICAgICAgICAgIC8vIGlmIGxhc3QgY2hhciB3YXMgYSBudW1iZXIgcHVzaCB0aGUgd2hvbGUgbnVtYmVyIHRvIHRoZSBjaGFybnVtIGFycmF5XG4gICAgICAgICAgICAgIGlmICggcnQgIT09ICdzJyApe1xuICAgICAgICAgICAgICAgIHJ0ID0gJ3MnO1xuICAgICAgICAgICAgICAgIG5hLnB1c2goIHBhcnNlRmxvYXQoIHJ2ICkgKTtcbiAgICAgICAgICAgICAgICBydiA9ICcnO1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgIHJ2ID0gcnYgKyBudGhpbmcuY2hhckF0KCB4ICk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuICAgICAgICAgIC8vIG9uY2UgZG9uZSwgcHVzaCB0aGUgbGFzdCB2YWx1ZSB0byB0aGUgY2hhcm51bSBhcnJheSBhbmQgcmVtb3ZlIHRoZSBmaXJzdCB1bmVlZGVkIGl0ZW1cbiAgICAgICAgICBuYS5wdXNoKCAocnQgPT09ICduJykgPyBwYXJzZUZsb2F0KCBydiApIDogcnYudG9Mb3dlckNhc2UoKSApO1xuICAgICAgICAgIG5hLnNoaWZ0KCk7XG4gICAgICAgICAgLy8gYWRkIHRvIGNhY2hlXG4gICAgICAgICAgY2FjaGVbJ18nICsgdGhpbmddID0gbmE7XG4gICAgICAgICAgY2FjaGNvdW50ZXIrKztcbiAgICAgICAgICAvLyByZXR1cm4gY2hhcm51bSBhcnJheVxuICAgICAgICAgIHJldHVybiBuYTtcbiAgICAgICAgfSgpKTtcbiAgICAgIH07XG4gICAgfSgpKTtcblxuICAgIC8vICoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKipcbiAgICAvLyAqXG4gICAgLy8gKiBSdW5zIGEgcXVlcnlcbiAgICAvLyAqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqIFxuXG5cbiAgICBydW4gPSBmdW5jdGlvbiAoKSB7XG4gICAgICB0aGlzLmNvbnRleHQoIHtcbiAgICAgICAgcmVzdWx0cyA6IHRoaXMuZ2V0REJJKCkucXVlcnkoIHRoaXMuY29udGV4dCgpIClcbiAgICAgIH0pO1xuXG4gICAgfTtcblxuICAgIEFQSS5leHRlbmQoICdmaWx0ZXInLCBmdW5jdGlvbiAoKSB7XG4gICAgICAvLyAqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqXG4gICAgICAvLyAqXG4gICAgICAvLyAqIFRha2VzOiB0YWtlcyB1bmxpbWl0ZWQgZmlsdGVyIG9iamVjdHMgYXMgYXJndW1lbnRzXG4gICAgICAvLyAqIFJldHVybnM6IG1ldGhvZCBjb2xsZWN0aW9uXG4gICAgICAvLyAqIFB1cnBvc2U6IFRha2UgZmlsdGVycyBhcyBvYmplY3RzIGFuZCBjYWNoZSBmdW5jdGlvbnMgZm9yIGxhdGVyIGxvb2t1cCB3aGVuIGEgcXVlcnkgaXMgcnVuXG4gICAgICAvLyAqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqIFxuICAgICAgdmFyXG4gICAgICAgIG5jID0gVEFGRlkubWVyZ2VPYmooIHRoaXMuY29udGV4dCgpLCB7IHJ1biA6IG51bGwgfSApLFxuICAgICAgICBucSA9IFtdXG4gICAgICA7XG4gICAgICBlYWNoKCBuYy5xLCBmdW5jdGlvbiAoIHYgKSB7XG4gICAgICAgIG5xLnB1c2goIHYgKTtcbiAgICAgIH0pO1xuICAgICAgbmMucSA9IG5xO1xuICAgICAgLy8gSGFkbmxlIHBhc3Npbmcgb2YgX19fSUQgb3IgYSByZWNvcmQgb24gbG9va3VwLlxuICAgICAgZWFjaCggYXJndW1lbnRzLCBmdW5jdGlvbiAoIGYgKSB7XG4gICAgICAgIG5jLnEucHVzaCggcmV0dXJuRmlsdGVyKCBmICkgKTtcbiAgICAgICAgbmMuZmlsdGVyUmF3LnB1c2goIGYgKTtcbiAgICAgIH0pO1xuXG4gICAgICByZXR1cm4gdGhpcy5nZXRyb290KCBuYyApO1xuICAgIH0pO1xuXG4gICAgQVBJLmV4dGVuZCggJ29yZGVyJywgZnVuY3Rpb24gKCBvICkge1xuICAgICAgLy8gKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKlxuICAgICAgLy8gKlxuICAgICAgLy8gKiBQdXJwb3NlOiB0YWtlcyBhIHN0cmluZyBhbmQgY3JlYXRlcyBhbiBhcnJheSBvZiBvcmRlciBpbnN0cnVjdGlvbnMgdG8gYmUgdXNlZCB3aXRoIGEgcXVlcnlcbiAgICAgIC8vICoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKipcblxuICAgICAgbyA9IG8uc3BsaXQoICcsJyApO1xuICAgICAgdmFyIHggPSBbXSwgbmM7XG5cbiAgICAgIGVhY2goIG8sIGZ1bmN0aW9uICggciApIHtcbiAgICAgICAgeC5wdXNoKCByLnJlcGxhY2UoIC9eXFxzKi8sICcnICkucmVwbGFjZSggL1xccyokLywgJycgKSApO1xuICAgICAgfSk7XG5cbiAgICAgIG5jID0gVEFGRlkubWVyZ2VPYmooIHRoaXMuY29udGV4dCgpLCB7c29ydCA6IG51bGx9ICk7XG4gICAgICBuYy5vcmRlciA9IHg7XG5cbiAgICAgIHJldHVybiB0aGlzLmdldHJvb3QoIG5jICk7XG4gICAgfSk7XG5cbiAgICBBUEkuZXh0ZW5kKCAnbGltaXQnLCBmdW5jdGlvbiAoIG4gKSB7XG4gICAgICAvLyAqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqXG4gICAgICAvLyAqXG4gICAgICAvLyAqIFB1cnBvc2U6IHRha2VzIGEgbGltaXQgbnVtYmVyIHRvIGxpbWl0IHRoZSBudW1iZXIgb2Ygcm93cyByZXR1cm5lZCBieSBhIHF1ZXJ5LiBXaWxsIHVwZGF0ZSB0aGUgcmVzdWx0c1xuICAgICAgLy8gKiBvZiBhIHF1ZXJ5XG4gICAgICAvLyAqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqIFxuICAgICAgdmFyIG5jID0gVEFGRlkubWVyZ2VPYmooIHRoaXMuY29udGV4dCgpLCB7fSksXG4gICAgICAgIGxpbWl0ZWRyZXN1bHRzXG4gICAgICAgIDtcblxuICAgICAgbmMubGltaXQgPSBuO1xuXG4gICAgICBpZiAoIG5jLnJ1biAmJiBuYy5zb3J0ICl7XG4gICAgICAgIGxpbWl0ZWRyZXN1bHRzID0gW107XG4gICAgICAgIGVhY2goIG5jLnJlc3VsdHMsIGZ1bmN0aW9uICggaSwgeCApIHtcbiAgICAgICAgICBpZiAoICh4ICsgMSkgPiBuICl7XG4gICAgICAgICAgICByZXR1cm4gVEFGRlkuRVhJVDtcbiAgICAgICAgICB9XG4gICAgICAgICAgbGltaXRlZHJlc3VsdHMucHVzaCggaSApO1xuICAgICAgICB9KTtcbiAgICAgICAgbmMucmVzdWx0cyA9IGxpbWl0ZWRyZXN1bHRzO1xuICAgICAgfVxuXG4gICAgICByZXR1cm4gdGhpcy5nZXRyb290KCBuYyApO1xuICAgIH0pO1xuXG4gICAgQVBJLmV4dGVuZCggJ3N0YXJ0JywgZnVuY3Rpb24gKCBuICkge1xuICAgICAgLy8gKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKlxuICAgICAgLy8gKlxuICAgICAgLy8gKiBQdXJwb3NlOiB0YWtlcyBhIGxpbWl0IG51bWJlciB0byBsaW1pdCB0aGUgbnVtYmVyIG9mIHJvd3MgcmV0dXJuZWQgYnkgYSBxdWVyeS4gV2lsbCB1cGRhdGUgdGhlIHJlc3VsdHNcbiAgICAgIC8vICogb2YgYSBxdWVyeVxuICAgICAgLy8gKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKiBcbiAgICAgIHZhciBuYyA9IFRBRkZZLm1lcmdlT2JqKCB0aGlzLmNvbnRleHQoKSwge30gKSxcbiAgICAgICAgbGltaXRlZHJlc3VsdHNcbiAgICAgICAgO1xuXG4gICAgICBuYy5zdGFydCA9IG47XG5cbiAgICAgIGlmICggbmMucnVuICYmIG5jLnNvcnQgJiYgIW5jLmxpbWl0ICl7XG4gICAgICAgIGxpbWl0ZWRyZXN1bHRzID0gW107XG4gICAgICAgIGVhY2goIG5jLnJlc3VsdHMsIGZ1bmN0aW9uICggaSwgeCApIHtcbiAgICAgICAgICBpZiAoICh4ICsgMSkgPiBuICl7XG4gICAgICAgICAgICBsaW1pdGVkcmVzdWx0cy5wdXNoKCBpICk7XG4gICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICAgICAgbmMucmVzdWx0cyA9IGxpbWl0ZWRyZXN1bHRzO1xuICAgICAgfVxuICAgICAgZWxzZSB7XG4gICAgICAgIG5jID0gVEFGRlkubWVyZ2VPYmooIHRoaXMuY29udGV4dCgpLCB7cnVuIDogbnVsbCwgc3RhcnQgOiBufSApO1xuICAgICAgfVxuXG4gICAgICByZXR1cm4gdGhpcy5nZXRyb290KCBuYyApO1xuICAgIH0pO1xuXG4gICAgQVBJLmV4dGVuZCggJ3VwZGF0ZScsIGZ1bmN0aW9uICggYXJnMCwgYXJnMSwgYXJnMiApIHtcbiAgICAgIC8vICoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKipcbiAgICAgIC8vICpcbiAgICAgIC8vICogVGFrZXM6IGEgb2JqZWN0IGFuZCBwYXNzZXMgaXQgb2ZmIERCSSB1cGRhdGUgbWV0aG9kIGZvciBhbGwgbWF0Y2hlZCByZWNvcmRzXG4gICAgICAvLyAqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqIFxuICAgICAgdmFyIHJ1bkV2ZW50ID0gdHJ1ZSwgbyA9IHt9LCBhcmdzID0gYXJndW1lbnRzLCB0aGF0O1xuICAgICAgaWYgKCBUQUZGWS5pc1N0cmluZyggYXJnMCApICYmXG4gICAgICAgIChhcmd1bWVudHMubGVuZ3RoID09PSAyIHx8IGFyZ3VtZW50cy5sZW5ndGggPT09IDMpIClcbiAgICAgIHtcbiAgICAgICAgb1thcmcwXSA9IGFyZzE7XG4gICAgICAgIGlmICggYXJndW1lbnRzLmxlbmd0aCA9PT0gMyApe1xuICAgICAgICAgIHJ1bkV2ZW50ID0gYXJnMjtcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgZWxzZSB7XG4gICAgICAgIG8gPSBhcmcwO1xuICAgICAgICBpZiAoIGFyZ3MubGVuZ3RoID09PSAyICl7XG4gICAgICAgICAgcnVuRXZlbnQgPSBhcmcxO1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIHRoYXQgPSB0aGlzO1xuICAgICAgcnVuLmNhbGwoIHRoaXMgKTtcbiAgICAgIGVhY2goIHRoaXMuY29udGV4dCgpLnJlc3VsdHMsIGZ1bmN0aW9uICggciApIHtcbiAgICAgICAgdmFyIGMgPSBvO1xuICAgICAgICBpZiAoIFRBRkZZLmlzRnVuY3Rpb24oIGMgKSApe1xuICAgICAgICAgIGMgPSBjLmFwcGx5KCBUQUZGWS5tZXJnZU9iaiggciwge30gKSApO1xuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgIGlmICggVC5pc0Z1bmN0aW9uKCBjICkgKXtcbiAgICAgICAgICAgIGMgPSBjKCBUQUZGWS5tZXJnZU9iaiggciwge30gKSApO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBpZiAoIFRBRkZZLmlzT2JqZWN0KCBjICkgKXtcbiAgICAgICAgICB0aGF0LmdldERCSSgpLnVwZGF0ZSggci5fX19pZCwgYywgcnVuRXZlbnQgKTtcbiAgICAgICAgfVxuICAgICAgfSk7XG4gICAgICBpZiAoIHRoaXMuY29udGV4dCgpLnJlc3VsdHMubGVuZ3RoICl7XG4gICAgICAgIHRoaXMuY29udGV4dCggeyBydW4gOiBudWxsIH0pO1xuICAgICAgfVxuICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfSk7XG4gICAgQVBJLmV4dGVuZCggJ3JlbW92ZScsIGZ1bmN0aW9uICggcnVuRXZlbnQgKSB7XG4gICAgICAvLyAqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqXG4gICAgICAvLyAqXG4gICAgICAvLyAqIFB1cnBvc2U6IHJlbW92ZXMgcmVjb3JkcyBmcm9tIHRoZSBEQiB2aWEgdGhlIHJlbW92ZSBhbmQgcmVtb3ZlQ29tbWl0IERCSSBtZXRob2RzXG4gICAgICAvLyAqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqIFxuICAgICAgdmFyIHRoYXQgPSB0aGlzLCBjID0gMDtcbiAgICAgIHJ1bi5jYWxsKCB0aGlzICk7XG4gICAgICBlYWNoKCB0aGlzLmNvbnRleHQoKS5yZXN1bHRzLCBmdW5jdGlvbiAoIHIgKSB7XG4gICAgICAgIHRoYXQuZ2V0REJJKCkucmVtb3ZlKCByLl9fX2lkICk7XG4gICAgICAgIGMrKztcbiAgICAgIH0pO1xuICAgICAgaWYgKCB0aGlzLmNvbnRleHQoKS5yZXN1bHRzLmxlbmd0aCApe1xuICAgICAgICB0aGlzLmNvbnRleHQoIHtcbiAgICAgICAgICBydW4gOiBudWxsXG4gICAgICAgIH0pO1xuICAgICAgICB0aGF0LmdldERCSSgpLnJlbW92ZUNvbW1pdCggcnVuRXZlbnQgKTtcbiAgICAgIH1cblxuICAgICAgcmV0dXJuIGM7XG4gICAgfSk7XG5cblxuICAgIEFQSS5leHRlbmQoICdjb3VudCcsIGZ1bmN0aW9uICgpIHtcbiAgICAgIC8vICoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKipcbiAgICAgIC8vICpcbiAgICAgIC8vICogUmV0dXJuczogVGhlIGxlbmd0aCBvZiBhIHF1ZXJ5IHJlc3VsdFxuICAgICAgLy8gKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKiBcbiAgICAgIHJ1bi5jYWxsKCB0aGlzICk7XG4gICAgICByZXR1cm4gdGhpcy5jb250ZXh0KCkucmVzdWx0cy5sZW5ndGg7XG4gICAgfSk7XG5cbiAgICBBUEkuZXh0ZW5kKCAnY2FsbGJhY2snLCBmdW5jdGlvbiAoIGYsIGRlbGF5ICkge1xuICAgICAgLy8gKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKlxuICAgICAgLy8gKlxuICAgICAgLy8gKiBSZXR1cm5zIG51bGw7XG4gICAgICAvLyAqIFJ1bnMgYSBmdW5jdGlvbiBvbiByZXR1cm4gb2YgcnVuLmNhbGxcbiAgICAgIC8vICoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKiogXG4gICAgICBpZiAoIGYgKXtcbiAgICAgICAgdmFyIHRoYXQgPSB0aGlzO1xuICAgICAgICBzZXRUaW1lb3V0KCBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgcnVuLmNhbGwoIHRoYXQgKTtcbiAgICAgICAgICBmLmNhbGwoIHRoYXQuZ2V0cm9vdCggdGhhdC5jb250ZXh0KCkgKSApO1xuICAgICAgICB9LCBkZWxheSB8fCAwICk7XG4gICAgICB9XG5cblxuICAgICAgcmV0dXJuIG51bGw7XG4gICAgfSk7XG5cbiAgICBBUEkuZXh0ZW5kKCAnZ2V0JywgZnVuY3Rpb24gKCkge1xuICAgICAgLy8gKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKlxuICAgICAgLy8gKlxuICAgICAgLy8gKiBSZXR1cm5zOiBBbiBhcnJheSBvZiBhbGwgbWF0Y2hpbmcgcmVjb3Jkc1xuICAgICAgLy8gKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKiBcbiAgICAgIHJ1bi5jYWxsKCB0aGlzICk7XG4gICAgICByZXR1cm4gdGhpcy5jb250ZXh0KCkucmVzdWx0cztcbiAgICB9KTtcblxuICAgIEFQSS5leHRlbmQoICdzdHJpbmdpZnknLCBmdW5jdGlvbiAoKSB7XG4gICAgICAvLyAqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqXG4gICAgICAvLyAqXG4gICAgICAvLyAqIFJldHVybnM6IEFuIEpTT04gc3RyaW5nIG9mIGFsbCBtYXRjaGluZyByZWNvcmRzXG4gICAgICAvLyAqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqIFxuICAgICAgcmV0dXJuIEpTT04uc3RyaW5naWZ5KCB0aGlzLmdldCgpICk7XG4gICAgfSk7XG4gICAgQVBJLmV4dGVuZCggJ2ZpcnN0JywgZnVuY3Rpb24gKCkge1xuICAgICAgLy8gKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKlxuICAgICAgLy8gKlxuICAgICAgLy8gKiBSZXR1cm5zOiBUaGUgZmlyc3QgbWF0Y2hpbmcgcmVjb3JkXG4gICAgICAvLyAqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqIFxuICAgICAgcnVuLmNhbGwoIHRoaXMgKTtcbiAgICAgIHJldHVybiB0aGlzLmNvbnRleHQoKS5yZXN1bHRzWzBdIHx8IGZhbHNlO1xuICAgIH0pO1xuICAgIEFQSS5leHRlbmQoICdsYXN0JywgZnVuY3Rpb24gKCkge1xuICAgICAgLy8gKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKlxuICAgICAgLy8gKlxuICAgICAgLy8gKiBSZXR1cm5zOiBUaGUgbGFzdCBtYXRjaGluZyByZWNvcmRcbiAgICAgIC8vICoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKiogXG4gICAgICBydW4uY2FsbCggdGhpcyApO1xuICAgICAgcmV0dXJuIHRoaXMuY29udGV4dCgpLnJlc3VsdHNbdGhpcy5jb250ZXh0KCkucmVzdWx0cy5sZW5ndGggLSAxXSB8fFxuICAgICAgICBmYWxzZTtcbiAgICB9KTtcblxuXG4gICAgQVBJLmV4dGVuZCggJ3N1bScsIGZ1bmN0aW9uICgpIHtcbiAgICAgIC8vICoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKipcbiAgICAgIC8vICpcbiAgICAgIC8vICogVGFrZXM6IGNvbHVtbiB0byBzdW0gdXBcbiAgICAgIC8vICogUmV0dXJuczogU3VtcyB0aGUgdmFsdWVzIG9mIGEgY29sdW1uXG4gICAgICAvLyAqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqIFxuICAgICAgdmFyIHRvdGFsID0gMCwgdGhhdCA9IHRoaXM7XG4gICAgICBydW4uY2FsbCggdGhhdCApO1xuICAgICAgZWFjaCggYXJndW1lbnRzLCBmdW5jdGlvbiAoIGMgKSB7XG4gICAgICAgIGVhY2goIHRoYXQuY29udGV4dCgpLnJlc3VsdHMsIGZ1bmN0aW9uICggciApIHtcbiAgICAgICAgICB0b3RhbCA9IHRvdGFsICsgKHJbY10gfHwgMCk7XG4gICAgICAgIH0pO1xuICAgICAgfSk7XG4gICAgICByZXR1cm4gdG90YWw7XG4gICAgfSk7XG5cbiAgICBBUEkuZXh0ZW5kKCAnbWluJywgZnVuY3Rpb24gKCBjICkge1xuICAgICAgLy8gKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKlxuICAgICAgLy8gKlxuICAgICAgLy8gKiBUYWtlczogY29sdW1uIHRvIGZpbmQgbWluXG4gICAgICAvLyAqIFJldHVybnM6IHRoZSBsb3dlc3QgdmFsdWVcbiAgICAgIC8vICoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKiogXG4gICAgICB2YXIgbG93ZXN0ID0gbnVsbDtcbiAgICAgIHJ1bi5jYWxsKCB0aGlzICk7XG4gICAgICBlYWNoKCB0aGlzLmNvbnRleHQoKS5yZXN1bHRzLCBmdW5jdGlvbiAoIHIgKSB7XG4gICAgICAgIGlmICggbG93ZXN0ID09PSBudWxsIHx8IHJbY10gPCBsb3dlc3QgKXtcbiAgICAgICAgICBsb3dlc3QgPSByW2NdO1xuICAgICAgICB9XG4gICAgICB9KTtcbiAgICAgIHJldHVybiBsb3dlc3Q7XG4gICAgfSk7XG5cbiAgICAvLyAgVGFmZnkgaW5uZXJKb2luIEV4dGVuc2lvbiAoT0NEIGVkaXRpb24pXG4gICAgLy8gID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxuICAgIC8vXG4gICAgLy8gIEhvdyB0byBVc2VcbiAgICAvLyAgKioqKioqKioqKlxuICAgIC8vXG4gICAgLy8gIGxlZnRfdGFibGUuaW5uZXJKb2luKCByaWdodF90YWJsZSwgY29uZGl0aW9uMSA8LC4uLiBjb25kaXRpb25OPiApXG4gICAgLy9cbiAgICAvLyAgQSBjb25kaXRpb24gY2FuIHRha2Ugb25lIG9mIDIgZm9ybXM6XG4gICAgLy9cbiAgICAvLyAgICAxLiBBbiBBUlJBWSB3aXRoIDIgb3IgMyB2YWx1ZXM6XG4gICAgLy8gICAgQSBjb2x1bW4gbmFtZSBmcm9tIHRoZSBsZWZ0IHRhYmxlLCBhbiBvcHRpb25hbCBjb21wYXJpc29uIHN0cmluZyxcbiAgICAvLyAgICBhbmQgY29sdW1uIG5hbWUgZnJvbSB0aGUgcmlnaHQgdGFibGUuICBUaGUgY29uZGl0aW9uIHBhc3NlcyBpZiB0aGUgdGVzdFxuICAgIC8vICAgIGluZGljYXRlZCBpcyB0cnVlLiAgIElmIHRoZSBjb25kaXRpb24gc3RyaW5nIGlzIG9taXR0ZWQsICc9PT0nIGlzIGFzc3VtZWQuXG4gICAgLy8gICAgRVhBTVBMRVM6IFsgJ2xhc3RfdXNlZF90aW1lJywgJz49JywgJ2N1cnJlbnRfdXNlX3RpbWUnIF0sIFsgJ3VzZXJfaWQnLCdpZCcgXVxuICAgIC8vXG4gICAgLy8gICAgMi4gQSBGVU5DVElPTjpcbiAgICAvLyAgICBUaGUgZnVuY3Rpb24gcmVjZWl2ZXMgYSBsZWZ0IHRhYmxlIHJvdyBhbmQgcmlnaHQgdGFibGUgcm93IGR1cmluZyB0aGVcbiAgICAvLyAgICBjYXJ0ZXNpYW4gam9pbi4gIElmIHRoZSBmdW5jdGlvbiByZXR1cm5zIHRydWUgZm9yIHRoZSByb3dzIGNvbnNpZGVyZWQsXG4gICAgLy8gICAgdGhlIG1lcmdlZCByb3cgaXMgaW5jbHVkZWQgaW4gdGhlIHJlc3VsdCBzZXQuXG4gICAgLy8gICAgRVhBTVBMRTogZnVuY3Rpb24gKGwscil7IHJldHVybiBsLm5hbWUgPT09IHIubGFiZWw7IH1cbiAgICAvL1xuICAgIC8vICBDb25kaXRpb25zIGFyZSBjb25zaWRlcmVkIGluIHRoZSBvcmRlciB0aGV5IGFyZSBwcmVzZW50ZWQuICBUaGVyZWZvcmUgdGhlIGJlc3RcbiAgICAvLyAgcGVyZm9ybWFuY2UgaXMgcmVhbGl6ZWQgd2hlbiB0aGUgbGVhc3QgZXhwZW5zaXZlIGFuZCBoaWdoZXN0IHBydW5lLXJhdGVcbiAgICAvLyAgY29uZGl0aW9ucyBhcmUgcGxhY2VkIGZpcnN0LCBzaW5jZSBpZiB0aGV5IHJldHVybiBmYWxzZSBUYWZmeSBza2lwcyBhbnlcbiAgICAvLyAgZnVydGhlciBjb25kaXRpb24gdGVzdHMuXG4gICAgLy9cbiAgICAvLyAgT3RoZXIgbm90ZXNcbiAgICAvLyAgKioqKioqKioqKipcbiAgICAvL1xuICAgIC8vICBUaGlzIGNvZGUgcGFzc2VzIGpzbGludCB3aXRoIHRoZSBleGNlcHRpb24gb2YgMiB3YXJuaW5ncyBhYm91dFxuICAgIC8vICB0aGUgJz09JyBhbmQgJyE9JyBsaW5lcy4gIFdlIGNhbid0IGRvIGFueXRoaW5nIGFib3V0IHRoYXQgc2hvcnQgb2ZcbiAgICAvLyAgZGVsZXRpbmcgdGhlIGxpbmVzLlxuICAgIC8vXG4gICAgLy8gIENyZWRpdHNcbiAgICAvLyAgKioqKioqKlxuICAgIC8vXG4gICAgLy8gIEhlYXZpbHkgYmFzZWQgdXBvbiB0aGUgd29yayBvZiBJYW4gVG9sdHouXG4gICAgLy8gIFJldmlzaW9ucyB0byBBUEkgYnkgTWljaGFlbCBNaWtvd3NraS5cbiAgICAvLyAgQ29kZSBjb252ZW50aW9uIHBlciBzdGFuZGFyZHMgaW4gaHR0cDovL21hbm5pbmcuY29tL21pa293c2tpXG4gICAgKGZ1bmN0aW9uICgpIHtcbiAgICAgIHZhciBpbm5lckpvaW5GdW5jdGlvbiA9IChmdW5jdGlvbiAoKSB7XG4gICAgICAgIHZhciBmbkNvbXBhcmVMaXN0LCBmbkNvbWJpbmVSb3csIGZuTWFpbjtcblxuICAgICAgICBmbkNvbXBhcmVMaXN0ID0gZnVuY3Rpb24gKCBsZWZ0X3JvdywgcmlnaHRfcm93LCBhcmdfbGlzdCApIHtcbiAgICAgICAgICB2YXIgZGF0YV9sdCwgZGF0YV9ydCwgb3BfY29kZSwgZXJyb3I7XG5cbiAgICAgICAgICBpZiAoIGFyZ19saXN0Lmxlbmd0aCA9PT0gMiApe1xuICAgICAgICAgICAgZGF0YV9sdCA9IGxlZnRfcm93W2FyZ19saXN0WzBdXTtcbiAgICAgICAgICAgIG9wX2NvZGUgPSAnPT09JztcbiAgICAgICAgICAgIGRhdGFfcnQgPSByaWdodF9yb3dbYXJnX2xpc3RbMV1dO1xuICAgICAgICAgIH1cbiAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIGRhdGFfbHQgPSBsZWZ0X3Jvd1thcmdfbGlzdFswXV07XG4gICAgICAgICAgICBvcF9jb2RlID0gYXJnX2xpc3RbMV07XG4gICAgICAgICAgICBkYXRhX3J0ID0gcmlnaHRfcm93W2FyZ19saXN0WzJdXTtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICAvKmpzbGludCBlcWVxIDogdHJ1ZSAqL1xuICAgICAgICAgIHN3aXRjaCAoIG9wX2NvZGUgKXtcbiAgICAgICAgICAgIGNhc2UgJz09PScgOlxuICAgICAgICAgICAgICByZXR1cm4gZGF0YV9sdCA9PT0gZGF0YV9ydDtcbiAgICAgICAgICAgIGNhc2UgJyE9PScgOlxuICAgICAgICAgICAgICByZXR1cm4gZGF0YV9sdCAhPT0gZGF0YV9ydDtcbiAgICAgICAgICAgIGNhc2UgJzwnICAgOlxuICAgICAgICAgICAgICByZXR1cm4gZGF0YV9sdCA8IGRhdGFfcnQ7XG4gICAgICAgICAgICBjYXNlICc+JyAgIDpcbiAgICAgICAgICAgICAgcmV0dXJuIGRhdGFfbHQgPiBkYXRhX3J0O1xuICAgICAgICAgICAgY2FzZSAnPD0nICA6XG4gICAgICAgICAgICAgIHJldHVybiBkYXRhX2x0IDw9IGRhdGFfcnQ7XG4gICAgICAgICAgICBjYXNlICc+PScgIDpcbiAgICAgICAgICAgICAgcmV0dXJuIGRhdGFfbHQgPj0gZGF0YV9ydDtcbiAgICAgICAgICAgIGNhc2UgJz09JyAgOlxuICAgICAgICAgICAgICByZXR1cm4gZGF0YV9sdCA9PSBkYXRhX3J0O1xuICAgICAgICAgICAgY2FzZSAnIT0nICA6XG4gICAgICAgICAgICAgIHJldHVybiBkYXRhX2x0ICE9IGRhdGFfcnQ7XG4gICAgICAgICAgICBkZWZhdWx0IDpcbiAgICAgICAgICAgICAgdGhyb3cgU3RyaW5nKCBvcF9jb2RlICkgKyAnIGlzIG5vdCBzdXBwb3J0ZWQnO1xuICAgICAgICAgIH1cbiAgICAgICAgICAvLyAnanNsaW50IGVxZXEgOiBmYWxzZScgIGhlcmUgcmVzdWx0cyBpblxuICAgICAgICAgIC8vIFwiVW5yZWFjaGFibGUgJy8qanNsaW50JyBhZnRlciAncmV0dXJuJ1wiLlxuICAgICAgICAgIC8vIFdlIGRvbid0IG5lZWQgaXQgdGhvdWdoLCBhcyB0aGUgcnVsZSBleGNlcHRpb25cbiAgICAgICAgICAvLyBpcyBkaXNjYXJkZWQgYXQgdGhlIGVuZCBvZiB0aGlzIGZ1bmN0aW9uYWwgc2NvcGVcbiAgICAgICAgfTtcblxuICAgICAgICBmbkNvbWJpbmVSb3cgPSBmdW5jdGlvbiAoIGxlZnRfcm93LCByaWdodF9yb3cgKSB7XG4gICAgICAgICAgdmFyIG91dF9tYXAgPSB7fSwgaSwgcHJlZml4O1xuXG4gICAgICAgICAgZm9yICggaSBpbiBsZWZ0X3JvdyApe1xuICAgICAgICAgICAgaWYgKCBsZWZ0X3Jvdy5oYXNPd25Qcm9wZXJ0eSggaSApICl7XG4gICAgICAgICAgICAgIG91dF9tYXBbaV0gPSBsZWZ0X3Jvd1tpXTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG4gICAgICAgICAgZm9yICggaSBpbiByaWdodF9yb3cgKXtcbiAgICAgICAgICAgIGlmICggcmlnaHRfcm93Lmhhc093blByb3BlcnR5KCBpICkgJiYgaSAhPT0gJ19fX2lkJyAmJlxuICAgICAgICAgICAgICBpICE9PSAnX19fcycgKVxuICAgICAgICAgICAge1xuICAgICAgICAgICAgICBwcmVmaXggPSAhVEFGRlkuaXNVbmRlZmluZWQoIG91dF9tYXBbaV0gKSA/ICdyaWdodF8nIDogJyc7XG4gICAgICAgICAgICAgIG91dF9tYXBbcHJlZml4ICsgU3RyaW5nKCBpICkgXSA9IHJpZ2h0X3Jvd1tpXTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG4gICAgICAgICAgcmV0dXJuIG91dF9tYXA7XG4gICAgICAgIH07XG5cbiAgICAgICAgZm5NYWluID0gZnVuY3Rpb24gKCB0YWJsZSApIHtcbiAgICAgICAgICB2YXJcbiAgICAgICAgICAgIHJpZ2h0X3RhYmxlLCBpLFxuICAgICAgICAgICAgYXJnX2xpc3QgPSBhcmd1bWVudHMsXG4gICAgICAgICAgICBhcmdfbGVuZ3RoID0gYXJnX2xpc3QubGVuZ3RoLFxuICAgICAgICAgICAgcmVzdWx0X2xpc3QgPSBbXVxuICAgICAgICAgICAgO1xuXG4gICAgICAgICAgaWYgKCB0eXBlb2YgdGFibGUuZmlsdGVyICE9PSAnZnVuY3Rpb24nICl7XG4gICAgICAgICAgICBpZiAoIHRhYmxlLlRBRkZZICl7IHJpZ2h0X3RhYmxlID0gdGFibGUoKTsgfVxuICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgIHRocm93ICdUQUZGWSBEQiBvciByZXN1bHQgbm90IHN1cHBsaWVkJztcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG4gICAgICAgICAgZWxzZSB7IHJpZ2h0X3RhYmxlID0gdGFibGU7IH1cblxuICAgICAgICAgIHRoaXMuY29udGV4dCgge1xuICAgICAgICAgICAgcmVzdWx0cyA6IHRoaXMuZ2V0REJJKCkucXVlcnkoIHRoaXMuY29udGV4dCgpIClcbiAgICAgICAgICB9ICk7XG5cbiAgICAgICAgICBUQUZGWS5lYWNoKCB0aGlzLmNvbnRleHQoKS5yZXN1bHRzLCBmdW5jdGlvbiAoIGxlZnRfcm93ICkge1xuICAgICAgICAgICAgcmlnaHRfdGFibGUuZWFjaCggZnVuY3Rpb24gKCByaWdodF9yb3cgKSB7XG4gICAgICAgICAgICAgIHZhciBhcmdfZGF0YSwgaXNfb2sgPSB0cnVlO1xuICAgICAgICAgICAgICBDT05ESVRJT046XG4gICAgICAgICAgICAgICAgZm9yICggaSA9IDE7IGkgPCBhcmdfbGVuZ3RoOyBpKysgKXtcbiAgICAgICAgICAgICAgICAgIGFyZ19kYXRhID0gYXJnX2xpc3RbaV07XG4gICAgICAgICAgICAgICAgICBpZiAoIHR5cGVvZiBhcmdfZGF0YSA9PT0gJ2Z1bmN0aW9uJyApe1xuICAgICAgICAgICAgICAgICAgICBpc19vayA9IGFyZ19kYXRhKCBsZWZ0X3JvdywgcmlnaHRfcm93ICk7XG4gICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICBlbHNlIGlmICggdHlwZW9mIGFyZ19kYXRhID09PSAnb2JqZWN0JyAmJiBhcmdfZGF0YS5sZW5ndGggKXtcbiAgICAgICAgICAgICAgICAgICAgaXNfb2sgPSBmbkNvbXBhcmVMaXN0KCBsZWZ0X3JvdywgcmlnaHRfcm93LCBhcmdfZGF0YSApO1xuICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIGlzX29rID0gZmFsc2U7XG4gICAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAgIGlmICggIWlzX29rICl7IGJyZWFrIENPTkRJVElPTjsgfSAvLyBzaG9ydCBjaXJjdWl0XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgIGlmICggaXNfb2sgKXtcbiAgICAgICAgICAgICAgICByZXN1bHRfbGlzdC5wdXNoKCBmbkNvbWJpbmVSb3coIGxlZnRfcm93LCByaWdodF9yb3cgKSApO1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9ICk7XG4gICAgICAgICAgfSApO1xuICAgICAgICAgIHJldHVybiBUQUZGWSggcmVzdWx0X2xpc3QgKSgpO1xuICAgICAgICB9O1xuXG4gICAgICAgIHJldHVybiBmbk1haW47XG4gICAgICB9KCkpO1xuXG4gICAgICBBUEkuZXh0ZW5kKCAnam9pbicsIGlubmVySm9pbkZ1bmN0aW9uICk7XG4gICAgfSgpKTtcblxuICAgIEFQSS5leHRlbmQoICdtYXgnLCBmdW5jdGlvbiAoIGMgKSB7XG4gICAgICAvLyAqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqXG4gICAgICAvLyAqXG4gICAgICAvLyAqIFRha2VzOiBjb2x1bW4gdG8gZmluZCBtYXhcbiAgICAgIC8vICogUmV0dXJuczogdGhlIGhpZ2hlc3QgdmFsdWVcbiAgICAgIC8vICoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKipcbiAgICAgIHZhciBoaWdoZXN0ID0gbnVsbDtcbiAgICAgIHJ1bi5jYWxsKCB0aGlzICk7XG4gICAgICBlYWNoKCB0aGlzLmNvbnRleHQoKS5yZXN1bHRzLCBmdW5jdGlvbiAoIHIgKSB7XG4gICAgICAgIGlmICggaGlnaGVzdCA9PT0gbnVsbCB8fCByW2NdID4gaGlnaGVzdCApe1xuICAgICAgICAgIGhpZ2hlc3QgPSByW2NdO1xuICAgICAgICB9XG4gICAgICB9KTtcbiAgICAgIHJldHVybiBoaWdoZXN0O1xuICAgIH0pO1xuXG4gICAgQVBJLmV4dGVuZCggJ3NlbGVjdCcsIGZ1bmN0aW9uICgpIHtcbiAgICAgIC8vICoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKipcbiAgICAgIC8vICpcbiAgICAgIC8vICogVGFrZXM6IGNvbHVtbnMgdG8gc2VsZWN0IHZhbHVlcyBpbnRvIGFuIGFycmF5XG4gICAgICAvLyAqIFJldHVybnM6IGFycmF5IG9mIHZhbHVlc1xuICAgICAgLy8gKiBOb3RlIGlmIG1vcmUgdGhhbiBvbmUgY29sdW1uIGlzIGdpdmVuIGFuIGFycmF5IG9mIGFycmF5cyBpcyByZXR1cm5lZFxuICAgICAgLy8gKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKiBcblxuICAgICAgdmFyIHJhID0gW10sIGFyZ3MgPSBhcmd1bWVudHM7XG4gICAgICBydW4uY2FsbCggdGhpcyApO1xuICAgICAgaWYgKCBhcmd1bWVudHMubGVuZ3RoID09PSAxICl7XG5cbiAgICAgICAgZWFjaCggdGhpcy5jb250ZXh0KCkucmVzdWx0cywgZnVuY3Rpb24gKCByICkge1xuXG4gICAgICAgICAgcmEucHVzaCggclthcmdzWzBdXSApO1xuICAgICAgICB9KTtcbiAgICAgIH1cbiAgICAgIGVsc2Uge1xuICAgICAgICBlYWNoKCB0aGlzLmNvbnRleHQoKS5yZXN1bHRzLCBmdW5jdGlvbiAoIHIgKSB7XG4gICAgICAgICAgdmFyIHJvdyA9IFtdO1xuICAgICAgICAgIGVhY2goIGFyZ3MsIGZ1bmN0aW9uICggYyApIHtcbiAgICAgICAgICAgIHJvdy5wdXNoKCByW2NdICk7XG4gICAgICAgICAgfSk7XG4gICAgICAgICAgcmEucHVzaCggcm93ICk7XG4gICAgICAgIH0pO1xuICAgICAgfVxuICAgICAgcmV0dXJuIHJhO1xuICAgIH0pO1xuICAgIEFQSS5leHRlbmQoICdkaXN0aW5jdCcsIGZ1bmN0aW9uICgpIHtcbiAgICAgIC8vICoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKipcbiAgICAgIC8vICpcbiAgICAgIC8vICogVGFrZXM6IGNvbHVtbnMgdG8gc2VsZWN0IHVuaXF1ZSBhbHVlcyBpbnRvIGFuIGFycmF5XG4gICAgICAvLyAqIFJldHVybnM6IGFycmF5IG9mIHZhbHVlc1xuICAgICAgLy8gKiBOb3RlIGlmIG1vcmUgdGhhbiBvbmUgY29sdW1uIGlzIGdpdmVuIGFuIGFycmF5IG9mIGFycmF5cyBpcyByZXR1cm5lZFxuICAgICAgLy8gKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKiBcbiAgICAgIHZhciByYSA9IFtdLCBhcmdzID0gYXJndW1lbnRzO1xuICAgICAgcnVuLmNhbGwoIHRoaXMgKTtcbiAgICAgIGlmICggYXJndW1lbnRzLmxlbmd0aCA9PT0gMSApe1xuXG4gICAgICAgIGVhY2goIHRoaXMuY29udGV4dCgpLnJlc3VsdHMsIGZ1bmN0aW9uICggciApIHtcbiAgICAgICAgICB2YXIgdiA9IHJbYXJnc1swXV0sIGR1cCA9IGZhbHNlO1xuICAgICAgICAgIGVhY2goIHJhLCBmdW5jdGlvbiAoIGQgKSB7XG4gICAgICAgICAgICBpZiAoIHYgPT09IGQgKXtcbiAgICAgICAgICAgICAgZHVwID0gdHJ1ZTtcbiAgICAgICAgICAgICAgcmV0dXJuIFRBRkZZLkVYSVQ7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfSk7XG4gICAgICAgICAgaWYgKCAhZHVwICl7XG4gICAgICAgICAgICByYS5wdXNoKCB2ICk7XG4gICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICAgIH1cbiAgICAgIGVsc2Uge1xuICAgICAgICBlYWNoKCB0aGlzLmNvbnRleHQoKS5yZXN1bHRzLCBmdW5jdGlvbiAoIHIgKSB7XG4gICAgICAgICAgdmFyIHJvdyA9IFtdLCBkdXAgPSBmYWxzZTtcbiAgICAgICAgICBlYWNoKCBhcmdzLCBmdW5jdGlvbiAoIGMgKSB7XG4gICAgICAgICAgICByb3cucHVzaCggcltjXSApO1xuICAgICAgICAgIH0pO1xuICAgICAgICAgIGVhY2goIHJhLCBmdW5jdGlvbiAoIGQgKSB7XG4gICAgICAgICAgICB2YXIgbGR1cCA9IHRydWU7XG4gICAgICAgICAgICBlYWNoKCBhcmdzLCBmdW5jdGlvbiAoIGMsIGkgKSB7XG4gICAgICAgICAgICAgIGlmICggcm93W2ldICE9PSBkW2ldICl7XG4gICAgICAgICAgICAgICAgbGR1cCA9IGZhbHNlO1xuICAgICAgICAgICAgICAgIHJldHVybiBUQUZGWS5FWElUO1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIGlmICggbGR1cCApe1xuICAgICAgICAgICAgICBkdXAgPSB0cnVlO1xuICAgICAgICAgICAgICByZXR1cm4gVEFGRlkuRVhJVDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9KTtcbiAgICAgICAgICBpZiAoICFkdXAgKXtcbiAgICAgICAgICAgIHJhLnB1c2goIHJvdyApO1xuICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgICB9XG4gICAgICByZXR1cm4gcmE7XG4gICAgfSk7XG4gICAgQVBJLmV4dGVuZCggJ3N1cHBsYW50JywgZnVuY3Rpb24gKCB0ZW1wbGF0ZSwgcmV0dXJuYXJyYXkgKSB7XG4gICAgICAvLyAqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqXG4gICAgICAvLyAqXG4gICAgICAvLyAqIFRha2VzOiBhIHN0cmluZyB0ZW1wbGF0ZSBmb3JtYXRlZCB3aXRoIGtleSB0byBiZSByZXBsYWNlZCB3aXRoIHZhbHVlcyBmcm9tIHRoZSByb3dzLCBmbGFnIHRvIGRldGVybWluZSBpZiB3ZSB3YW50IGFycmF5IG9mIHN0cmluZ3NcbiAgICAgIC8vICogUmV0dXJuczogYXJyYXkgb2YgdmFsdWVzIG9yIGEgc3RyaW5nXG4gICAgICAvLyAqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqIFxuICAgICAgdmFyIHJhID0gW107XG4gICAgICBydW4uY2FsbCggdGhpcyApO1xuICAgICAgZWFjaCggdGhpcy5jb250ZXh0KCkucmVzdWx0cywgZnVuY3Rpb24gKCByICkge1xuICAgICAgICAvLyBUT0RPOiBUaGUgY3VybHkgYnJhY2VzIHVzZWQgdG8gYmUgdW5lc2NhcGVkXG4gICAgICAgIHJhLnB1c2goIHRlbXBsYXRlLnJlcGxhY2UoIC9cXHsoW15cXHtcXH1dKilcXH0vZywgZnVuY3Rpb24gKCBhLCBiICkge1xuICAgICAgICAgIHZhciB2ID0gcltiXTtcbiAgICAgICAgICByZXR1cm4gdHlwZW9mIHYgPT09ICdzdHJpbmcnIHx8IHR5cGVvZiB2ID09PSAnbnVtYmVyJyA/IHYgOiBhO1xuICAgICAgICB9ICkgKTtcbiAgICAgIH0pO1xuICAgICAgcmV0dXJuICghcmV0dXJuYXJyYXkpID8gcmEuam9pbiggXCJcIiApIDogcmE7XG4gICAgfSk7XG5cblxuICAgIEFQSS5leHRlbmQoICdlYWNoJywgZnVuY3Rpb24gKCBtICkge1xuICAgICAgLy8gKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKlxuICAgICAgLy8gKlxuICAgICAgLy8gKiBUYWtlczogYSBmdW5jdGlvblxuICAgICAgLy8gKiBQdXJwb3NlOiBsb29wcyBvdmVyIGV2ZXJ5IG1hdGNoaW5nIHJlY29yZCBhbmQgYXBwbGllcyB0aGUgZnVuY3Rpb25cbiAgICAgIC8vICoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKiogXG4gICAgICBydW4uY2FsbCggdGhpcyApO1xuICAgICAgZWFjaCggdGhpcy5jb250ZXh0KCkucmVzdWx0cywgbSApO1xuICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfSk7XG4gICAgQVBJLmV4dGVuZCggJ21hcCcsIGZ1bmN0aW9uICggbSApIHtcbiAgICAgIC8vICoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKipcbiAgICAgIC8vICpcbiAgICAgIC8vICogVGFrZXM6IGEgZnVuY3Rpb25cbiAgICAgIC8vICogUHVycG9zZTogbG9vcHMgb3ZlciBldmVyeSBtYXRjaGluZyByZWNvcmQgYW5kIGFwcGxpZXMgdGhlIGZ1bmN0aW9uLCByZXR1cmluZyB0aGUgcmVzdWx0cyBpbiBhbiBhcnJheVxuICAgICAgLy8gKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKiBcbiAgICAgIHZhciByYSA9IFtdO1xuICAgICAgcnVuLmNhbGwoIHRoaXMgKTtcbiAgICAgIGVhY2goIHRoaXMuY29udGV4dCgpLnJlc3VsdHMsIGZ1bmN0aW9uICggciApIHtcbiAgICAgICAgcmEucHVzaCggbSggciApICk7XG4gICAgICB9KTtcbiAgICAgIHJldHVybiByYTtcbiAgICB9KTtcblxuXG5cbiAgICBUID0gZnVuY3Rpb24gKCBkICkge1xuICAgICAgLy8gKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKlxuICAgICAgLy8gKlxuICAgICAgLy8gKiBUIGlzIHRoZSBtYWluIFRBRkZZIG9iamVjdFxuICAgICAgLy8gKiBUYWtlczogYW4gYXJyYXkgb2Ygb2JqZWN0cyBvciBKU09OXG4gICAgICAvLyAqIFJldHVybnMgYSBuZXcgVEFGRllEQlxuICAgICAgLy8gKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKiBcbiAgICAgIHZhciBUT2IgPSBbXSxcbiAgICAgICAgSUQgPSB7fSxcbiAgICAgICAgUkMgPSAxLFxuICAgICAgICBzZXR0aW5ncyA9IHtcbiAgICAgICAgICB0ZW1wbGF0ZSAgICAgICAgICA6IGZhbHNlLFxuICAgICAgICAgIG9uSW5zZXJ0ICAgICAgICAgIDogZmFsc2UsXG4gICAgICAgICAgb25VcGRhdGUgICAgICAgICAgOiBmYWxzZSxcbiAgICAgICAgICBvblJlbW92ZSAgICAgICAgICA6IGZhbHNlLFxuICAgICAgICAgIG9uREJDaGFuZ2UgICAgICAgIDogZmFsc2UsXG4gICAgICAgICAgc3RvcmFnZU5hbWUgICAgICAgOiBmYWxzZSxcbiAgICAgICAgICBmb3JjZVByb3BlcnR5Q2FzZSA6IG51bGwsXG4gICAgICAgICAgY2FjaGVTaXplICAgICAgICAgOiAxMDAsXG4gICAgICAgICAgbmFtZSAgICAgICAgICAgICAgOiAnJ1xuICAgICAgICB9LFxuICAgICAgICBkbSA9IG5ldyBEYXRlKCksXG4gICAgICAgIENhY2hlQ291bnQgPSAwLFxuICAgICAgICBDYWNoZUNsZWFyID0gMCxcbiAgICAgICAgQ2FjaGUgPSB7fSxcbiAgICAgICAgREJJLCBydW5JbmRleGVzLCByb290XG4gICAgICAgIDtcbiAgICAgIC8vICoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKipcbiAgICAgIC8vICpcbiAgICAgIC8vICogVE9iID0gdGhpcyBkYXRhYmFzZVxuICAgICAgLy8gKiBJRCA9IGNvbGxlY3Rpb24gb2YgdGhlIHJlY29yZCBJRHMgYW5kIGxvY2F0aW9ucyB3aXRoaW4gdGhlIERCLCB1c2VkIGZvciBmYXN0IGxvb2t1cHNcbiAgICAgIC8vICogUkMgPSByZWNvcmQgY291bnRlciwgdXNlZCBmb3IgY3JlYXRpbmcgSURzXG4gICAgICAvLyAqIHNldHRpbmdzLnRlbXBsYXRlID0gdGhlIHRlbXBsYXRlIHRvIG1lcmdlIGFsbCBuZXcgcmVjb3JkcyB3aXRoXG4gICAgICAvLyAqIHNldHRpbmdzLm9uSW5zZXJ0ID0gZXZlbnQgZ2l2ZW4gYSBjb3B5IG9mIHRoZSBuZXdseSBpbnNlcnRlZCByZWNvcmRcbiAgICAgIC8vICogc2V0dGluZ3Mub25VcGRhdGUgPSBldmVudCBnaXZlbiB0aGUgb3JpZ2luYWwgcmVjb3JkLCB0aGUgY2hhbmdlcywgYW5kIHRoZSBuZXcgcmVjb3JkXG4gICAgICAvLyAqIHNldHRpbmdzLm9uUmVtb3ZlID0gZXZlbnQgZ2l2ZW4gdGhlIHJlbW92ZWQgcmVjb3JkXG4gICAgICAvLyAqIHNldHRpbmdzLmZvcmNlUHJvcGVydHlDYXNlID0gb24gaW5zZXJ0IGZvcmNlIHRoZSBwcm9wcnR5IGNhc2UgdG8gYmUgbG93ZXIgb3IgdXBwZXIuIGRlZmF1bHQgbG93ZXIsIG51bGwvdW5kZWZpbmVkIHdpbGwgbGVhdmUgY2FzZSBhcyBpc1xuICAgICAgLy8gKiBkbSA9IHRoZSBtb2RpZnkgZGF0ZSBvZiB0aGUgZGF0YWJhc2UsIHVzZWQgZm9yIHF1ZXJ5IGNhY2hpbmdcbiAgICAgIC8vICoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKiogXG5cblxuICAgICAgcnVuSW5kZXhlcyA9IGZ1bmN0aW9uICggaW5kZXhlcyApIHtcbiAgICAgICAgLy8gKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKlxuICAgICAgICAvLyAqXG4gICAgICAgIC8vICogVGFrZXM6IGEgY29sbGVjdGlvbiBvZiBpbmRleGVzXG4gICAgICAgIC8vICogUmV0dXJuczogY29sbGVjdGlvbiB3aXRoIHJlY29yZHMgbWF0Y2hpbmcgaW5kZXhlZCBmaWx0ZXJzXG4gICAgICAgIC8vICoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKiogXG5cbiAgICAgICAgdmFyIHJlY29yZHMgPSBbXSwgVW5pcXVlRW5mb3JjZSA9IGZhbHNlO1xuXG4gICAgICAgIGlmICggaW5kZXhlcy5sZW5ndGggPT09IDAgKXtcbiAgICAgICAgICByZXR1cm4gVE9iO1xuICAgICAgICB9XG5cbiAgICAgICAgZWFjaCggaW5kZXhlcywgZnVuY3Rpb24gKCBmICkge1xuICAgICAgICAgIC8vIENoZWNrIHRvIHNlZSBpZiByZWNvcmQgSURcbiAgICAgICAgICBpZiAoIFQuaXNTdHJpbmcoIGYgKSAmJiAvW3RdWzAtOV0qW3JdWzAtOV0qL2kudGVzdCggZiApICYmXG4gICAgICAgICAgICBUT2JbSURbZl1dIClcbiAgICAgICAgICB7XG4gICAgICAgICAgICByZWNvcmRzLnB1c2goIFRPYltJRFtmXV0gKTtcbiAgICAgICAgICAgIFVuaXF1ZUVuZm9yY2UgPSB0cnVlO1xuICAgICAgICAgIH1cbiAgICAgICAgICAvLyBDaGVjayB0byBzZWUgaWYgcmVjb3JkXG4gICAgICAgICAgaWYgKCBULmlzT2JqZWN0KCBmICkgJiYgZi5fX19pZCAmJiBmLl9fX3MgJiZcbiAgICAgICAgICAgIFRPYltJRFtmLl9fX2lkXV0gKVxuICAgICAgICAgIHtcbiAgICAgICAgICAgIHJlY29yZHMucHVzaCggVE9iW0lEW2YuX19faWRdXSApO1xuICAgICAgICAgICAgVW5pcXVlRW5mb3JjZSA9IHRydWU7XG4gICAgICAgICAgfVxuICAgICAgICAgIC8vIENoZWNrIHRvIHNlZSBpZiBhcnJheSBvZiBpbmRleGVzXG4gICAgICAgICAgaWYgKCBULmlzQXJyYXkoIGYgKSApe1xuICAgICAgICAgICAgZWFjaCggZiwgZnVuY3Rpb24gKCByICkge1xuICAgICAgICAgICAgICBlYWNoKCBydW5JbmRleGVzKCByICksIGZ1bmN0aW9uICggcnIgKSB7XG4gICAgICAgICAgICAgICAgcmVjb3Jkcy5wdXNoKCByciApO1xuICAgICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICAgICAgaWYgKCBVbmlxdWVFbmZvcmNlICYmIHJlY29yZHMubGVuZ3RoID4gMSApe1xuICAgICAgICAgIHJlY29yZHMgPSBbXTtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiByZWNvcmRzO1xuICAgICAgfTtcblxuICAgICAgREJJID0ge1xuICAgICAgICAvLyAqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqXG4gICAgICAgIC8vICpcbiAgICAgICAgLy8gKiBUaGUgREJJIGlzIHRoZSBpbnRlcm5hbCBEYXRhQmFzZSBJbnRlcmZhY2UgdGhhdCBpbnRlcmFjdHMgd2l0aCB0aGUgZGF0YVxuICAgICAgICAvLyAqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqIFxuICAgICAgICBkbSAgICAgICAgICAgOiBmdW5jdGlvbiAoIG5kICkge1xuICAgICAgICAgIC8vICoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKipcbiAgICAgICAgICAvLyAqXG4gICAgICAgICAgLy8gKiBUYWtlczogYW4gb3B0aW9uYWwgbmV3IG1vZGlmeSBkYXRlXG4gICAgICAgICAgLy8gKiBQdXJwb3NlOiB1c2VkIHRvIGdldCBhbmQgc2V0IHRoZSBEQiBtb2RpZnkgZGF0ZVxuICAgICAgICAgIC8vICoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKiogXG4gICAgICAgICAgaWYgKCBuZCApe1xuICAgICAgICAgICAgZG0gPSBuZDtcbiAgICAgICAgICAgIENhY2hlID0ge307XG4gICAgICAgICAgICBDYWNoZUNvdW50ID0gMDtcbiAgICAgICAgICAgIENhY2hlQ2xlYXIgPSAwO1xuICAgICAgICAgIH1cbiAgICAgICAgICBpZiAoIHNldHRpbmdzLm9uREJDaGFuZ2UgKXtcbiAgICAgICAgICAgIHNldFRpbWVvdXQoIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgc2V0dGluZ3Mub25EQkNoYW5nZS5jYWxsKCBUT2IgKTtcbiAgICAgICAgICAgIH0sIDAgKTtcbiAgICAgICAgICB9XG4gICAgICAgICAgaWYgKCBzZXR0aW5ncy5zdG9yYWdlTmFtZSApe1xuICAgICAgICAgICAgc2V0VGltZW91dCggZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICBsb2NhbFN0b3JhZ2Uuc2V0SXRlbSggJ3RhZmZ5XycgKyBzZXR0aW5ncy5zdG9yYWdlTmFtZSxcbiAgICAgICAgICAgICAgICBKU09OLnN0cmluZ2lmeSggVE9iICkgKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgIH1cbiAgICAgICAgICByZXR1cm4gZG07XG4gICAgICAgIH0sXG4gICAgICAgIGluc2VydCAgICAgICA6IGZ1bmN0aW9uICggaSwgcnVuRXZlbnQgKSB7XG4gICAgICAgICAgLy8gKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKlxuICAgICAgICAgIC8vICpcbiAgICAgICAgICAvLyAqIFRha2VzOiBhIG5ldyByZWNvcmQgdG8gaW5zZXJ0XG4gICAgICAgICAgLy8gKiBQdXJwb3NlOiBtZXJnZSB0aGUgb2JqZWN0IHdpdGggdGhlIHRlbXBsYXRlLCBhZGQgYW4gSUQsIGluc2VydCBpbnRvIERCLCBjYWxsIGluc2VydCBldmVudFxuICAgICAgICAgIC8vICoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKiogXG4gICAgICAgICAgdmFyIGNvbHVtbnMgPSBbXSxcbiAgICAgICAgICAgIHJlY29yZHMgICA9IFtdLFxuICAgICAgICAgICAgaW5wdXQgICAgID0gcHJvdGVjdEpTT04oIGkgKVxuICAgICAgICAgICAgO1xuICAgICAgICAgIGVhY2goIGlucHV0LCBmdW5jdGlvbiAoIHYsIGkgKSB7XG4gICAgICAgICAgICB2YXIgbnYsIG87XG4gICAgICAgICAgICBpZiAoIFQuaXNBcnJheSggdiApICYmIGkgPT09IDAgKXtcbiAgICAgICAgICAgICAgZWFjaCggdiwgZnVuY3Rpb24gKCBhdiApIHtcblxuICAgICAgICAgICAgICAgIGNvbHVtbnMucHVzaCggKHNldHRpbmdzLmZvcmNlUHJvcGVydHlDYXNlID09PSAnbG93ZXInKVxuICAgICAgICAgICAgICAgICAgPyBhdi50b0xvd2VyQ2FzZSgpXG4gICAgICAgICAgICAgICAgICAgIDogKHNldHRpbmdzLmZvcmNlUHJvcGVydHlDYXNlID09PSAndXBwZXInKVxuICAgICAgICAgICAgICAgICAgPyBhdi50b1VwcGVyQ2FzZSgpIDogYXYgKTtcbiAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSBpZiAoIFQuaXNBcnJheSggdiApICl7XG4gICAgICAgICAgICAgIG52ID0ge307XG4gICAgICAgICAgICAgIGVhY2goIHYsIGZ1bmN0aW9uICggYXYsIGFpICkge1xuICAgICAgICAgICAgICAgIG52W2NvbHVtbnNbYWldXSA9IGF2O1xuICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgdiA9IG52O1xuXG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIGlmICggVC5pc09iamVjdCggdiApICYmIHNldHRpbmdzLmZvcmNlUHJvcGVydHlDYXNlICl7XG4gICAgICAgICAgICAgIG8gPSB7fTtcblxuICAgICAgICAgICAgICBlYWNoaW4oIHYsIGZ1bmN0aW9uICggYXYsIGFpICkge1xuICAgICAgICAgICAgICAgIG9bKHNldHRpbmdzLmZvcmNlUHJvcGVydHlDYXNlID09PSAnbG93ZXInKSA/IGFpLnRvTG93ZXJDYXNlKClcbiAgICAgICAgICAgICAgICAgIDogKHNldHRpbmdzLmZvcmNlUHJvcGVydHlDYXNlID09PSAndXBwZXInKVxuICAgICAgICAgICAgICAgICAgPyBhaS50b1VwcGVyQ2FzZSgpIDogYWldID0gdlthaV07XG4gICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICB2ID0gbztcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgUkMrKztcbiAgICAgICAgICAgIHYuX19faWQgPSAnVCcgKyBTdHJpbmcoIGlkcGFkICsgVEMgKS5zbGljZSggLTYgKSArICdSJyArXG4gICAgICAgICAgICAgIFN0cmluZyggaWRwYWQgKyBSQyApLnNsaWNlKCAtNiApO1xuICAgICAgICAgICAgdi5fX19zID0gdHJ1ZTtcbiAgICAgICAgICAgIHJlY29yZHMucHVzaCggdi5fX19pZCApO1xuICAgICAgICAgICAgaWYgKCBzZXR0aW5ncy50ZW1wbGF0ZSApe1xuICAgICAgICAgICAgICB2ID0gVC5tZXJnZU9iaiggc2V0dGluZ3MudGVtcGxhdGUsIHYgKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIFRPYi5wdXNoKCB2ICk7XG5cbiAgICAgICAgICAgIElEW3YuX19faWRdID0gVE9iLmxlbmd0aCAtIDE7XG4gICAgICAgICAgICBpZiAoIHNldHRpbmdzLm9uSW5zZXJ0ICYmXG4gICAgICAgICAgICAgIChydW5FdmVudCB8fCBUQUZGWS5pc1VuZGVmaW5lZCggcnVuRXZlbnQgKSkgKVxuICAgICAgICAgICAge1xuICAgICAgICAgICAgICBzZXR0aW5ncy5vbkluc2VydC5jYWxsKCB2ICk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBEQkkuZG0oIG5ldyBEYXRlKCkgKTtcbiAgICAgICAgICB9KTtcbiAgICAgICAgICByZXR1cm4gcm9vdCggcmVjb3JkcyApO1xuICAgICAgICB9LFxuICAgICAgICBzb3J0ICAgICAgICAgOiBmdW5jdGlvbiAoIG8gKSB7XG4gICAgICAgICAgLy8gKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKlxuICAgICAgICAgIC8vICpcbiAgICAgICAgICAvLyAqIFB1cnBvc2U6IENoYW5nZSB0aGUgc29ydCBvcmRlciBvZiB0aGUgREIgaXRzZWxmIGFuZCByZXNldCB0aGUgSUQgYnVja2V0XG4gICAgICAgICAgLy8gKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKiBcbiAgICAgICAgICBUT2IgPSBvcmRlckJ5Q29sKCBUT2IsIG8uc3BsaXQoICcsJyApICk7XG4gICAgICAgICAgSUQgPSB7fTtcbiAgICAgICAgICBlYWNoKCBUT2IsIGZ1bmN0aW9uICggciwgaSApIHtcbiAgICAgICAgICAgIElEW3IuX19faWRdID0gaTtcbiAgICAgICAgICB9KTtcbiAgICAgICAgICBEQkkuZG0oIG5ldyBEYXRlKCkgKTtcbiAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgfSxcbiAgICAgICAgdXBkYXRlICAgICAgIDogZnVuY3Rpb24gKCBpZCwgY2hhbmdlcywgcnVuRXZlbnQgKSB7XG4gICAgICAgICAgLy8gKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKlxuICAgICAgICAgIC8vICpcbiAgICAgICAgICAvLyAqIFRha2VzOiB0aGUgSUQgb2YgcmVjb3JkIGJlaW5nIGNoYW5nZWQgYW5kIHRoZSBjaGFuZ2VzXG4gICAgICAgICAgLy8gKiBQdXJwb3NlOiBVcGRhdGUgYSByZWNvcmQgYW5kIGNoYW5nZSBzb21lIG9yIGFsbCB2YWx1ZXMsIGNhbGwgdGhlIG9uIHVwZGF0ZSBtZXRob2RcbiAgICAgICAgICAvLyAqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqXG5cbiAgICAgICAgICB2YXIgbmMgPSB7fSwgb3IsIG5yLCB0YywgaGFzQ2hhbmdlO1xuICAgICAgICAgIGlmICggc2V0dGluZ3MuZm9yY2VQcm9wZXJ0eUNhc2UgKXtcbiAgICAgICAgICAgIGVhY2hpbiggY2hhbmdlcywgZnVuY3Rpb24gKCB2LCBwICkge1xuICAgICAgICAgICAgICBuY1soc2V0dGluZ3MuZm9yY2VQcm9wZXJ0eUNhc2UgPT09ICdsb3dlcicpID8gcC50b0xvd2VyQ2FzZSgpXG4gICAgICAgICAgICAgICAgOiAoc2V0dGluZ3MuZm9yY2VQcm9wZXJ0eUNhc2UgPT09ICd1cHBlcicpID8gcC50b1VwcGVyQ2FzZSgpXG4gICAgICAgICAgICAgICAgOiBwXSA9IHY7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIGNoYW5nZXMgPSBuYztcbiAgICAgICAgICB9XG5cbiAgICAgICAgICBvciA9IFRPYltJRFtpZF1dO1xuICAgICAgICAgIG5yID0gVC5tZXJnZU9iaiggb3IsIGNoYW5nZXMgKTtcblxuICAgICAgICAgIHRjID0ge307XG4gICAgICAgICAgaGFzQ2hhbmdlID0gZmFsc2U7XG4gICAgICAgICAgZWFjaGluKCBuciwgZnVuY3Rpb24gKCB2LCBpICkge1xuICAgICAgICAgICAgaWYgKCBUQUZGWS5pc1VuZGVmaW5lZCggb3JbaV0gKSB8fCBvcltpXSAhPT0gdiApe1xuICAgICAgICAgICAgICB0Y1tpXSA9IHY7XG4gICAgICAgICAgICAgIGhhc0NoYW5nZSA9IHRydWU7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfSk7XG4gICAgICAgICAgaWYgKCBoYXNDaGFuZ2UgKXtcbiAgICAgICAgICAgIGlmICggc2V0dGluZ3Mub25VcGRhdGUgJiZcbiAgICAgICAgICAgICAgKHJ1bkV2ZW50IHx8IFRBRkZZLmlzVW5kZWZpbmVkKCBydW5FdmVudCApKSApXG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgIHNldHRpbmdzLm9uVXBkYXRlLmNhbGwoIG5yLCBUT2JbSURbaWRdXSwgdGMgKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIFRPYltJRFtpZF1dID0gbnI7XG4gICAgICAgICAgICBEQkkuZG0oIG5ldyBEYXRlKCkgKTtcbiAgICAgICAgICB9XG4gICAgICAgIH0sXG4gICAgICAgIHJlbW92ZSAgICAgICA6IGZ1bmN0aW9uICggaWQgKSB7XG4gICAgICAgICAgLy8gKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKlxuICAgICAgICAgIC8vICpcbiAgICAgICAgICAvLyAqIFRha2VzOiB0aGUgSUQgb2YgcmVjb3JkIHRvIGJlIHJlbW92ZWRcbiAgICAgICAgICAvLyAqIFB1cnBvc2U6IHJlbW92ZSBhIHJlY29yZCwgY2hhbmdlcyBpdHMgX19fcyB2YWx1ZSB0byBmYWxzZVxuICAgICAgICAgIC8vICoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKiogXG4gICAgICAgICAgVE9iW0lEW2lkXV0uX19fcyA9IGZhbHNlO1xuICAgICAgICB9LFxuICAgICAgICByZW1vdmVDb21taXQgOiBmdW5jdGlvbiAoIHJ1bkV2ZW50ICkge1xuICAgICAgICAgIHZhciB4O1xuICAgICAgICAgIC8vICoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKipcbiAgICAgICAgICAvLyAqXG4gICAgICAgICAgLy8gKiBcbiAgICAgICAgICAvLyAqIFB1cnBvc2U6IGxvb3Agb3ZlciBhbGwgcmVjb3JkcyBhbmQgcmVtb3ZlIHJlY29yZHMgd2l0aCBfX19zID0gZmFsc2UsIGNhbGwgb25SZW1vdmUgZXZlbnQsIGNsZWFyIElEXG4gICAgICAgICAgLy8gKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKlxuICAgICAgICAgIGZvciAoIHggPSBUT2IubGVuZ3RoIC0gMTsgeCA+IC0xOyB4LS0gKXtcblxuICAgICAgICAgICAgaWYgKCAhVE9iW3hdLl9fX3MgKXtcbiAgICAgICAgICAgICAgaWYgKCBzZXR0aW5ncy5vblJlbW92ZSAmJlxuICAgICAgICAgICAgICAgIChydW5FdmVudCB8fCBUQUZGWS5pc1VuZGVmaW5lZCggcnVuRXZlbnQgKSkgKVxuICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgc2V0dGluZ3Mub25SZW1vdmUuY2FsbCggVE9iW3hdICk7XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgSURbVE9iW3hdLl9fX2lkXSA9IHVuZGVmaW5lZDtcbiAgICAgICAgICAgICAgVE9iLnNwbGljZSggeCwgMSApO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cbiAgICAgICAgICBJRCA9IHt9O1xuICAgICAgICAgIGVhY2goIFRPYiwgZnVuY3Rpb24gKCByLCBpICkge1xuICAgICAgICAgICAgSURbci5fX19pZF0gPSBpO1xuICAgICAgICAgIH0pO1xuICAgICAgICAgIERCSS5kbSggbmV3IERhdGUoKSApO1xuICAgICAgICB9LFxuICAgICAgICBxdWVyeSA6IGZ1bmN0aW9uICggY29udGV4dCApIHtcbiAgICAgICAgICAvLyAqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqXG4gICAgICAgICAgLy8gKlxuICAgICAgICAgIC8vICogVGFrZXM6IHRoZSBjb250ZXh0IG9iamVjdCBmb3IgYSBxdWVyeSBhbmQgZWl0aGVyIHJldHVybnMgYSBjYWNoZSByZXN1bHQgb3IgYSBuZXcgcXVlcnkgcmVzdWx0XG4gICAgICAgICAgLy8gKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKiBcbiAgICAgICAgICB2YXIgcmV0dXJucSwgY2lkLCByZXN1bHRzLCBpbmRleGVkLCBsaW1pdHEsIG5pO1xuXG4gICAgICAgICAgaWYgKCBzZXR0aW5ncy5jYWNoZVNpemUgKSB7XG4gICAgICAgICAgICBjaWQgPSAnJztcbiAgICAgICAgICAgIGVhY2goIGNvbnRleHQuZmlsdGVyUmF3LCBmdW5jdGlvbiAoIHIgKSB7XG4gICAgICAgICAgICAgIGlmICggVC5pc0Z1bmN0aW9uKCByICkgKXtcbiAgICAgICAgICAgICAgICBjaWQgPSAnbm9jYWNoZSc7XG4gICAgICAgICAgICAgICAgcmV0dXJuIFRBRkZZLkVYSVQ7XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgaWYgKCBjaWQgPT09ICcnICl7XG4gICAgICAgICAgICAgIGNpZCA9IG1ha2VDaWQoIFQubWVyZ2VPYmooIGNvbnRleHQsXG4gICAgICAgICAgICAgICAge3EgOiBmYWxzZSwgcnVuIDogZmFsc2UsIHNvcnQgOiBmYWxzZX0gKSApO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cbiAgICAgICAgICAvLyBSdW4gYSBuZXcgcXVlcnkgaWYgdGhlcmUgYXJlIG5vIHJlc3VsdHMgb3IgdGhlIHJ1biBkYXRlIGhhcyBiZWVuIGNsZWFyZWRcbiAgICAgICAgICBpZiAoICFjb250ZXh0LnJlc3VsdHMgfHwgIWNvbnRleHQucnVuIHx8XG4gICAgICAgICAgICAoY29udGV4dC5ydW4gJiYgREJJLmRtKCkgPiBjb250ZXh0LnJ1bikgKVxuICAgICAgICAgIHtcbiAgICAgICAgICAgIHJlc3VsdHMgPSBbXTtcblxuICAgICAgICAgICAgLy8gY2hlY2sgQ2FjaGVcblxuICAgICAgICAgICAgaWYgKCBzZXR0aW5ncy5jYWNoZVNpemUgJiYgQ2FjaGVbY2lkXSApe1xuXG4gICAgICAgICAgICAgIENhY2hlW2NpZF0uaSA9IENhY2hlQ291bnQrKztcbiAgICAgICAgICAgICAgcmV0dXJuIENhY2hlW2NpZF0ucmVzdWx0cztcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAvLyBpZiBubyBmaWx0ZXIsIHJldHVybiBEQlxuICAgICAgICAgICAgICBpZiAoIGNvbnRleHQucS5sZW5ndGggPT09IDAgJiYgY29udGV4dC5pbmRleC5sZW5ndGggPT09IDAgKXtcbiAgICAgICAgICAgICAgICBlYWNoKCBUT2IsIGZ1bmN0aW9uICggciApIHtcbiAgICAgICAgICAgICAgICAgIHJlc3VsdHMucHVzaCggciApO1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIHJldHVybnEgPSByZXN1bHRzO1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgIC8vIHVzZSBpbmRleGVzXG5cbiAgICAgICAgICAgICAgICBpbmRleGVkID0gcnVuSW5kZXhlcyggY29udGV4dC5pbmRleCApO1xuXG4gICAgICAgICAgICAgICAgLy8gcnVuIGZpbHRlcnNcbiAgICAgICAgICAgICAgICBlYWNoKCBpbmRleGVkLCBmdW5jdGlvbiAoIHIgKSB7XG4gICAgICAgICAgICAgICAgICAvLyBSdW4gZmlsdGVyIHRvIHNlZSBpZiByZWNvcmQgbWF0Y2hlcyBxdWVyeVxuICAgICAgICAgICAgICAgICAgaWYgKCBjb250ZXh0LnEubGVuZ3RoID09PSAwIHx8IHJ1bkZpbHRlcnMoIHIsIGNvbnRleHQucSApICl7XG4gICAgICAgICAgICAgICAgICAgIHJlc3VsdHMucHVzaCggciApO1xuICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICAgICAgcmV0dXJucSA9IHJlc3VsdHM7XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cblxuXG4gICAgICAgICAgfVxuICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgLy8gSWYgcXVlcnkgZXhpc3RzIGFuZCBydW4gaGFzIG5vdCBiZWVuIGNsZWFyZWQgcmV0dXJuIHRoZSBjYWNoZSByZXN1bHRzXG4gICAgICAgICAgICByZXR1cm5xID0gY29udGV4dC5yZXN1bHRzO1xuICAgICAgICAgIH1cbiAgICAgICAgICAvLyBJZiBhIGN1c3RvbSBvcmRlciBhcnJheSBleGlzdHMgYW5kIHRoZSBydW4gaGFzIGJlZW4gY2xlYXIgb3IgdGhlIHNvcnQgaGFzIGJlZW4gY2xlYXJlZFxuICAgICAgICAgIGlmICggY29udGV4dC5vcmRlci5sZW5ndGggPiAwICYmICghY29udGV4dC5ydW4gfHwgIWNvbnRleHQuc29ydCkgKXtcbiAgICAgICAgICAgIC8vIG9yZGVyIHRoZSByZXN1bHRzXG4gICAgICAgICAgICByZXR1cm5xID0gb3JkZXJCeUNvbCggcmV0dXJucSwgY29udGV4dC5vcmRlciApO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIC8vIElmIGEgbGltaXQgb24gdGhlIG51bWJlciBvZiByZXN1bHRzIGV4aXN0cyBhbmQgaXQgaXMgbGVzcyB0aGFuIHRoZSByZXR1cm5lZCByZXN1bHRzLCBsaW1pdCByZXN1bHRzXG4gICAgICAgICAgaWYgKCByZXR1cm5xLmxlbmd0aCAmJlxuICAgICAgICAgICAgKChjb250ZXh0LmxpbWl0ICYmIGNvbnRleHQubGltaXQgPCByZXR1cm5xLmxlbmd0aCkgfHxcbiAgICAgICAgICAgICAgY29udGV4dC5zdGFydClcbiAgICAgICAgICApIHtcbiAgICAgICAgICAgIGxpbWl0cSA9IFtdO1xuICAgICAgICAgICAgZWFjaCggcmV0dXJucSwgZnVuY3Rpb24gKCByLCBpICkge1xuICAgICAgICAgICAgICBpZiAoICFjb250ZXh0LnN0YXJ0IHx8XG4gICAgICAgICAgICAgICAgKGNvbnRleHQuc3RhcnQgJiYgKGkgKyAxKSA+PSBjb250ZXh0LnN0YXJ0KSApXG4gICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICBpZiAoIGNvbnRleHQubGltaXQgKXtcbiAgICAgICAgICAgICAgICAgIG5pID0gKGNvbnRleHQuc3RhcnQpID8gKGkgKyAxKSAtIGNvbnRleHQuc3RhcnQgOiBpO1xuICAgICAgICAgICAgICAgICAgaWYgKCBuaSA8IGNvbnRleHQubGltaXQgKXtcbiAgICAgICAgICAgICAgICAgICAgbGltaXRxLnB1c2goIHIgKTtcbiAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgIGVsc2UgaWYgKCBuaSA+IGNvbnRleHQubGltaXQgKXtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIFRBRkZZLkVYSVQ7XG4gICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgICAgbGltaXRxLnB1c2goIHIgKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgcmV0dXJucSA9IGxpbWl0cTtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICAvLyB1cGRhdGUgY2FjaGVcbiAgICAgICAgICBpZiAoIHNldHRpbmdzLmNhY2hlU2l6ZSAmJiBjaWQgIT09ICdub2NhY2hlJyApe1xuICAgICAgICAgICAgQ2FjaGVDbGVhcisrO1xuXG4gICAgICAgICAgICBzZXRUaW1lb3V0KCBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgIHZhciBiQ291bnRlciwgbmM7XG4gICAgICAgICAgICAgIGlmICggQ2FjaGVDbGVhciA+PSBzZXR0aW5ncy5jYWNoZVNpemUgKiAyICl7XG4gICAgICAgICAgICAgICAgQ2FjaGVDbGVhciA9IDA7XG4gICAgICAgICAgICAgICAgYkNvdW50ZXIgPSBDYWNoZUNvdW50IC0gc2V0dGluZ3MuY2FjaGVTaXplO1xuICAgICAgICAgICAgICAgIG5jID0ge307XG4gICAgICAgICAgICAgICAgZWFjaGluKCBmdW5jdGlvbiAoIHIsIGsgKSB7XG4gICAgICAgICAgICAgICAgICBpZiAoIHIuaSA+PSBiQ291bnRlciApe1xuICAgICAgICAgICAgICAgICAgICBuY1trXSA9IHI7XG4gICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgQ2FjaGUgPSBuYztcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSwgMCApO1xuXG4gICAgICAgICAgICBDYWNoZVtjaWRdID0geyBpIDogQ2FjaGVDb3VudCsrLCByZXN1bHRzIDogcmV0dXJucSB9O1xuICAgICAgICAgIH1cbiAgICAgICAgICByZXR1cm4gcmV0dXJucTtcbiAgICAgICAgfVxuICAgICAgfTtcblxuXG4gICAgICByb290ID0gZnVuY3Rpb24gKCkge1xuICAgICAgICB2YXIgaUFQSSwgY29udGV4dDtcbiAgICAgICAgLy8gKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKlxuICAgICAgICAvLyAqXG4gICAgICAgIC8vICogVGhlIHJvb3QgZnVuY3Rpb24gdGhhdCBnZXRzIHJldHVybmVkIHdoZW4gYSBuZXcgREIgaXMgY3JlYXRlZFxuICAgICAgICAvLyAqIFRha2VzOiB1bmxpbWl0ZWQgZmlsdGVyIGFyZ3VtZW50cyBhbmQgY3JlYXRlcyBmaWx0ZXJzIHRvIGJlIHJ1biB3aGVuIGEgcXVlcnkgaXMgY2FsbGVkXG4gICAgICAgIC8vICoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKiogXG4gICAgICAgIC8vICoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKipcbiAgICAgICAgLy8gKlxuICAgICAgICAvLyAqIGlBUEkgaXMgdGhlIHRoZSBtZXRob2QgY29sbGVjdGlvbiB2YWxpYWJsZSB3aGVuIGEgcXVlcnkgaGFzIGJlZW4gc3RhcnRlZCBieSBjYWxsaW5nIGRibmFtZVxuICAgICAgICAvLyAqIENlcnRhaW4gbWV0aG9kcyBhcmUgb3IgYXJlIG5vdCBhdmFsaWFibGUgb25jZSB5b3UgaGF2ZSBzdGFydGVkIGEgcXVlcnkgc3VjaCBhcyBpbnNlcnQgLS0geW91IGNhbiBvbmx5IGluc2VydCBpbnRvIHJvb3RcbiAgICAgICAgLy8gKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKlxuICAgICAgICBpQVBJID0gVEFGRlkubWVyZ2VPYmooIFRBRkZZLm1lcmdlT2JqKCBBUEksIHsgaW5zZXJ0IDogdW5kZWZpbmVkIH0gKSxcbiAgICAgICAgICB7IGdldERCSSAgOiBmdW5jdGlvbiAoKSB7IHJldHVybiBEQkk7IH0sXG4gICAgICAgICAgICBnZXRyb290IDogZnVuY3Rpb24gKCBjICkgeyByZXR1cm4gcm9vdC5jYWxsKCBjICk7IH0sXG4gICAgICAgICAgY29udGV4dCA6IGZ1bmN0aW9uICggbiApIHtcbiAgICAgICAgICAgIC8vICoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKipcbiAgICAgICAgICAgIC8vICpcbiAgICAgICAgICAgIC8vICogVGhlIGNvbnRleHQgY29udGFpbnMgYWxsIHRoZSBpbmZvcm1hdGlvbiB0byBtYW5hZ2UgYSBxdWVyeSBpbmNsdWRpbmcgZmlsdGVycywgbGltaXRzLCBhbmQgc29ydHNcbiAgICAgICAgICAgIC8vICoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKiogXG4gICAgICAgICAgICBpZiAoIG4gKXtcbiAgICAgICAgICAgICAgY29udGV4dCA9IFRBRkZZLm1lcmdlT2JqKCBjb250ZXh0LFxuICAgICAgICAgICAgICAgIG4uaGFzT3duUHJvcGVydHkoJ3Jlc3VsdHMnKVxuICAgICAgICAgICAgICAgICAgPyBUQUZGWS5tZXJnZU9iaiggbiwgeyBydW4gOiBuZXcgRGF0ZSgpLCBzb3J0OiBuZXcgRGF0ZSgpIH0pXG4gICAgICAgICAgICAgICAgICA6IG5cbiAgICAgICAgICAgICAgKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiBjb250ZXh0O1xuICAgICAgICAgIH0sXG4gICAgICAgICAgZXh0ZW5kICA6IHVuZGVmaW5lZFxuICAgICAgICB9KTtcblxuICAgICAgICBjb250ZXh0ID0gKHRoaXMgJiYgdGhpcy5xKSA/IHRoaXMgOiB7XG4gICAgICAgICAgbGltaXQgICAgIDogZmFsc2UsXG4gICAgICAgICAgc3RhcnQgICAgIDogZmFsc2UsXG4gICAgICAgICAgcSAgICAgICAgIDogW10sXG4gICAgICAgICAgZmlsdGVyUmF3IDogW10sXG4gICAgICAgICAgaW5kZXggICAgIDogW10sXG4gICAgICAgICAgb3JkZXIgICAgIDogW10sXG4gICAgICAgICAgcmVzdWx0cyAgIDogZmFsc2UsXG4gICAgICAgICAgcnVuICAgICAgIDogbnVsbCxcbiAgICAgICAgICBzb3J0ICAgICAgOiBudWxsLFxuICAgICAgICAgIHNldHRpbmdzICA6IHNldHRpbmdzXG4gICAgICAgIH07XG4gICAgICAgIC8vICoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKipcbiAgICAgICAgLy8gKlxuICAgICAgICAvLyAqIENhbGwgdGhlIHF1ZXJ5IG1ldGhvZCB0byBzZXR1cCBhIG5ldyBxdWVyeVxuICAgICAgICAvLyAqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqIFxuICAgICAgICBlYWNoKCBhcmd1bWVudHMsIGZ1bmN0aW9uICggZiApIHtcblxuICAgICAgICAgIGlmICggaXNJbmRleGFibGUoIGYgKSApe1xuICAgICAgICAgICAgY29udGV4dC5pbmRleC5wdXNoKCBmICk7XG4gICAgICAgICAgfVxuICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgY29udGV4dC5xLnB1c2goIHJldHVybkZpbHRlciggZiApICk7XG4gICAgICAgICAgfVxuICAgICAgICAgIGNvbnRleHQuZmlsdGVyUmF3LnB1c2goIGYgKTtcbiAgICAgICAgfSk7XG5cblxuICAgICAgICByZXR1cm4gaUFQSTtcbiAgICAgIH07XG5cbiAgICAgIC8vICoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKipcbiAgICAgIC8vICpcbiAgICAgIC8vICogSWYgbmV3IHJlY29yZHMgaGF2ZSBiZWVuIHBhc3NlZCBvbiBjcmVhdGlvbiBvZiB0aGUgREIgZWl0aGVyIGFzIEpTT04gb3IgYXMgYW4gYXJyYXkvb2JqZWN0LCBpbnNlcnQgdGhlbVxuICAgICAgLy8gKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKiBcbiAgICAgIFRDKys7XG4gICAgICBpZiAoIGQgKXtcbiAgICAgICAgREJJLmluc2VydCggZCApO1xuICAgICAgfVxuXG5cbiAgICAgIHJvb3QuaW5zZXJ0ID0gREJJLmluc2VydDtcblxuICAgICAgcm9vdC5tZXJnZSA9IGZ1bmN0aW9uICggaSwga2V5LCBydW5FdmVudCApIHtcbiAgICAgICAgdmFyXG4gICAgICAgICAgc2VhcmNoICAgICAgPSB7fSxcbiAgICAgICAgICBmaW5hbFNlYXJjaCA9IFtdLFxuICAgICAgICAgIG9iaiAgICAgICAgID0ge31cbiAgICAgICAgICA7XG5cbiAgICAgICAgcnVuRXZlbnQgICAgPSBydW5FdmVudCB8fCBmYWxzZTtcbiAgICAgICAga2V5ICAgICAgICAgPSBrZXkgICAgICB8fCAnaWQnO1xuXG4gICAgICAgIGVhY2goIGksIGZ1bmN0aW9uICggbyApIHtcbiAgICAgICAgICB2YXIgZXhpc3RpbmdPYmplY3Q7XG4gICAgICAgICAgc2VhcmNoW2tleV0gPSBvW2tleV07XG4gICAgICAgICAgZmluYWxTZWFyY2gucHVzaCggb1trZXldICk7XG4gICAgICAgICAgZXhpc3RpbmdPYmplY3QgPSByb290KCBzZWFyY2ggKS5maXJzdCgpO1xuICAgICAgICAgIGlmICggZXhpc3RpbmdPYmplY3QgKXtcbiAgICAgICAgICAgIERCSS51cGRhdGUoIGV4aXN0aW5nT2JqZWN0Ll9fX2lkLCBvLCBydW5FdmVudCApO1xuICAgICAgICAgIH1cbiAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIERCSS5pbnNlcnQoIG8sIHJ1bkV2ZW50ICk7XG4gICAgICAgICAgfVxuICAgICAgICB9KTtcblxuICAgICAgICBvYmpba2V5XSA9IGZpbmFsU2VhcmNoO1xuICAgICAgICByZXR1cm4gcm9vdCggb2JqICk7XG4gICAgICB9O1xuXG4gICAgICByb290LlRBRkZZID0gdHJ1ZTtcbiAgICAgIHJvb3Quc29ydCA9IERCSS5zb3J0O1xuICAgICAgLy8gKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKlxuICAgICAgLy8gKlxuICAgICAgLy8gKiBUaGVzZSBhcmUgdGhlIG1ldGhvZHMgdGhhdCBjYW4gYmUgYWNjZXNzZWQgb24gb2ZmIHRoZSByb290IERCIGZ1bmN0aW9uLiBFeGFtcGxlIGRibmFtZS5pbnNlcnQ7XG4gICAgICAvLyAqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqIFxuICAgICAgcm9vdC5zZXR0aW5ncyA9IGZ1bmN0aW9uICggbiApIHtcbiAgICAgICAgLy8gKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKlxuICAgICAgICAvLyAqXG4gICAgICAgIC8vICogR2V0dGluZyBhbmQgc2V0dGluZyBmb3IgdGhpcyBEQidzIHNldHRpbmdzL2V2ZW50c1xuICAgICAgICAvLyAqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqIFxuICAgICAgICBpZiAoIG4gKXtcbiAgICAgICAgICBzZXR0aW5ncyA9IFRBRkZZLm1lcmdlT2JqKCBzZXR0aW5ncywgbiApO1xuICAgICAgICAgIGlmICggbi50ZW1wbGF0ZSApe1xuXG4gICAgICAgICAgICByb290KCkudXBkYXRlKCBuLnRlbXBsYXRlICk7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHJldHVybiBzZXR0aW5ncztcbiAgICAgIH07XG5cbiAgICAgIC8vICoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKipcbiAgICAgIC8vICpcbiAgICAgIC8vICogVGhlc2UgYXJlIHRoZSBtZXRob2RzIHRoYXQgY2FuIGJlIGFjY2Vzc2VkIG9uIG9mZiB0aGUgcm9vdCBEQiBmdW5jdGlvbi4gRXhhbXBsZSBkYm5hbWUuaW5zZXJ0O1xuICAgICAgLy8gKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKiBcbiAgICAgIHJvb3Quc3RvcmUgPSBmdW5jdGlvbiAoIG4gKSB7XG4gICAgICAgIC8vICoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKipcbiAgICAgICAgLy8gKlxuICAgICAgICAvLyAqIFNldHVwIGxvY2Fsc3RvcmFnZSBmb3IgdGhpcyBEQiBvbiBhIGdpdmVuIG5hbWVcbiAgICAgICAgLy8gKiBQdWxsIGRhdGEgaW50byB0aGUgREIgYXMgbmVlZGVkXG4gICAgICAgIC8vICoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKiogXG4gICAgICAgIHZhciByID0gZmFsc2UsIGk7XG4gICAgICAgIGlmICggbG9jYWxTdG9yYWdlICl7XG4gICAgICAgICAgaWYgKCBuICl7XG4gICAgICAgICAgICBpID0gbG9jYWxTdG9yYWdlLmdldEl0ZW0oICd0YWZmeV8nICsgbiApO1xuICAgICAgICAgICAgaWYgKCBpICYmIGkubGVuZ3RoID4gMCApe1xuICAgICAgICAgICAgICByb290Lmluc2VydCggaSApO1xuICAgICAgICAgICAgICByID0gdHJ1ZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmICggVE9iLmxlbmd0aCA+IDAgKXtcbiAgICAgICAgICAgICAgc2V0VGltZW91dCggZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgIGxvY2FsU3RvcmFnZS5zZXRJdGVtKCAndGFmZnlfJyArIHNldHRpbmdzLnN0b3JhZ2VOYW1lLFxuICAgICAgICAgICAgICAgICAgSlNPTi5zdHJpbmdpZnkoIFRPYiApICk7XG4gICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cbiAgICAgICAgICByb290LnNldHRpbmdzKCB7c3RvcmFnZU5hbWUgOiBufSApO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiByb290O1xuICAgICAgfTtcblxuICAgICAgLy8gKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKlxuICAgICAgLy8gKlxuICAgICAgLy8gKiBSZXR1cm4gcm9vdCBvbiBEQiBjcmVhdGlvbiBhbmQgc3RhcnQgaGF2aW5nIGZ1blxuICAgICAgLy8gKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKiBcbiAgICAgIHJldHVybiByb290O1xuICAgIH07XG4gICAgLy8gKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKlxuICAgIC8vICpcbiAgICAvLyAqIFNldHMgdGhlIGdsb2JhbCBUQUZGWSBvYmplY3RcbiAgICAvLyAqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqIFxuICAgIFRBRkZZID0gVDtcblxuXG4gICAgLy8gKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKlxuICAgIC8vICpcbiAgICAvLyAqIENyZWF0ZSBwdWJsaWMgZWFjaCBtZXRob2RcbiAgICAvLyAqXG4gICAgLy8gKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKiAgIFxuICAgIFQuZWFjaCA9IGVhY2g7XG5cbiAgICAvLyAqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqXG4gICAgLy8gKlxuICAgIC8vICogQ3JlYXRlIHB1YmxpYyBlYWNoaW4gbWV0aG9kXG4gICAgLy8gKlxuICAgIC8vICoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKiogICBcbiAgICBULmVhY2hpbiA9IGVhY2hpbjtcbiAgICAvLyAqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqXG4gICAgLy8gKlxuICAgIC8vICogQ3JlYXRlIHB1YmxpYyBleHRlbmQgbWV0aG9kXG4gICAgLy8gKiBBZGQgYSBjdXN0b20gbWV0aG9kIHRvIHRoZSBBUElcbiAgICAvLyAqXG4gICAgLy8gKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKiAgIFxuICAgIFQuZXh0ZW5kID0gQVBJLmV4dGVuZDtcblxuXG4gICAgLy8gKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKlxuICAgIC8vICpcbiAgICAvLyAqIENyZWF0ZXMgVEFGRlkuRVhJVCB2YWx1ZSB0aGF0IGNhbiBiZSByZXR1cm5lZCB0byBzdG9wIGFuIGVhY2ggbG9vcFxuICAgIC8vICpcbiAgICAvLyAqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqICBcbiAgICBUQUZGWS5FWElUID0gJ1RBRkZZRVhJVCc7XG5cbiAgICAvLyAqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqXG4gICAgLy8gKlxuICAgIC8vICogQ3JlYXRlIHB1YmxpYyB1dGlsaXR5IG1lcmdlT2JqIG1ldGhvZFxuICAgIC8vICogUmV0dXJuIGEgbmV3IG9iamVjdCB3aGVyZSBpdGVtcyBmcm9tIG9iajJcbiAgICAvLyAqIGhhdmUgcmVwbGFjZWQgb3IgYmVlbiBhZGRlZCB0byB0aGUgaXRlbXMgaW5cbiAgICAvLyAqIG9iajFcbiAgICAvLyAqIFB1cnBvc2U6IFVzZWQgdG8gY29tYmluZSBvYmpzXG4gICAgLy8gKlxuICAgIC8vICoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKiogICBcbiAgICBUQUZGWS5tZXJnZU9iaiA9IGZ1bmN0aW9uICggb2IxLCBvYjIgKSB7XG4gICAgICB2YXIgYyA9IHt9O1xuICAgICAgZWFjaGluKCBvYjEsIGZ1bmN0aW9uICggdiwgbiApIHsgY1tuXSA9IG9iMVtuXTsgfSk7XG4gICAgICBlYWNoaW4oIG9iMiwgZnVuY3Rpb24gKCB2LCBuICkgeyBjW25dID0gb2IyW25dOyB9KTtcbiAgICAgIHJldHVybiBjO1xuICAgIH07XG5cblxuICAgIC8vICoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKipcbiAgICAvLyAqXG4gICAgLy8gKiBDcmVhdGUgcHVibGljIHV0aWxpdHkgaGFzIG1ldGhvZFxuICAgIC8vICogUmV0dXJucyB0cnVlIGlmIGEgY29tcGxleCBvYmplY3QsIGFycmF5XG4gICAgLy8gKiBvciB0YWZmeSBjb2xsZWN0aW9uIGNvbnRhaW5zIHRoZSBtYXRlcmlhbFxuICAgIC8vICogcHJvdmlkZWQgaW4gdGhlIHNlY29uZCBhcmd1bWVudFxuICAgIC8vICogUHVycG9zZTogVXNlZCB0byBjb21hcmUgb2JqZWN0c1xuICAgIC8vICpcbiAgICAvLyAqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqXG4gICAgVEFGRlkuaGFzID0gZnVuY3Rpb24gKCB2YXIxLCB2YXIyICkge1xuXG4gICAgICB2YXIgcmUgPSBmYWxzZSwgbjtcblxuICAgICAgaWYgKCAodmFyMS5UQUZGWSkgKXtcbiAgICAgICAgcmUgPSB2YXIxKCB2YXIyICk7XG4gICAgICAgIGlmICggcmUubGVuZ3RoID4gMCApe1xuICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgZWxzZSB7XG5cbiAgICAgICAgc3dpdGNoICggVC50eXBlT2YoIHZhcjEgKSApe1xuICAgICAgICAgIGNhc2UgJ29iamVjdCc6XG4gICAgICAgICAgICBpZiAoIFQuaXNPYmplY3QoIHZhcjIgKSApe1xuICAgICAgICAgICAgICBlYWNoaW4oIHZhcjIsIGZ1bmN0aW9uICggdiwgbiApIHtcbiAgICAgICAgICAgICAgICBpZiAoIHJlID09PSB0cnVlICYmICFULmlzVW5kZWZpbmVkKCB2YXIxW25dICkgJiZcbiAgICAgICAgICAgICAgICAgIHZhcjEuaGFzT3duUHJvcGVydHkoIG4gKSApXG4gICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgcmUgPSBULmhhcyggdmFyMVtuXSwgdmFyMltuXSApO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICAgIHJlID0gZmFsc2U7XG4gICAgICAgICAgICAgICAgICByZXR1cm4gVEFGRlkuRVhJVDtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSBpZiAoIFQuaXNBcnJheSggdmFyMiApICl7XG4gICAgICAgICAgICAgIGVhY2goIHZhcjIsIGZ1bmN0aW9uICggdiwgbiApIHtcbiAgICAgICAgICAgICAgICByZSA9IFQuaGFzKCB2YXIxLCB2YXIyW25dICk7XG4gICAgICAgICAgICAgICAgaWYgKCByZSApe1xuICAgICAgICAgICAgICAgICAgcmV0dXJuIFRBRkZZLkVYSVQ7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2UgaWYgKCBULmlzU3RyaW5nKCB2YXIyICkgKXtcbiAgICAgICAgICAgICAgaWYgKCAhVEFGRlkuaXNVbmRlZmluZWQoIHZhcjFbdmFyMl0gKSApe1xuICAgICAgICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIHJlO1xuICAgICAgICAgIGNhc2UgJ2FycmF5JzpcbiAgICAgICAgICAgIGlmICggVC5pc09iamVjdCggdmFyMiApICl7XG4gICAgICAgICAgICAgIGVhY2goIHZhcjEsIGZ1bmN0aW9uICggdiwgaSApIHtcbiAgICAgICAgICAgICAgICByZSA9IFQuaGFzKCB2YXIxW2ldLCB2YXIyICk7XG4gICAgICAgICAgICAgICAgaWYgKCByZSA9PT0gdHJ1ZSApe1xuICAgICAgICAgICAgICAgICAgcmV0dXJuIFRBRkZZLkVYSVQ7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2UgaWYgKCBULmlzQXJyYXkoIHZhcjIgKSApe1xuICAgICAgICAgICAgICBlYWNoKCB2YXIyLCBmdW5jdGlvbiAoIHYyLCBpMiApIHtcbiAgICAgICAgICAgICAgICBlYWNoKCB2YXIxLCBmdW5jdGlvbiAoIHYxLCBpMSApIHtcbiAgICAgICAgICAgICAgICAgIHJlID0gVC5oYXMoIHZhcjFbaTFdLCB2YXIyW2kyXSApO1xuICAgICAgICAgICAgICAgICAgaWYgKCByZSA9PT0gdHJ1ZSApe1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gVEFGRlkuRVhJVDtcbiAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICBpZiAoIHJlID09PSB0cnVlICl7XG4gICAgICAgICAgICAgICAgICByZXR1cm4gVEFGRlkuRVhJVDtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSBpZiAoIFQuaXNTdHJpbmcoIHZhcjIgKSB8fCBULmlzTnVtYmVyKCB2YXIyICkgKXtcbiAgICAgICAgICAgICByZSA9IGZhbHNlO1xuICAgICAgICAgICAgICBmb3IgKCBuID0gMDsgbiA8IHZhcjEubGVuZ3RoOyBuKysgKXtcbiAgICAgICAgICAgICAgICByZSA9IFQuaGFzKCB2YXIxW25dLCB2YXIyICk7XG4gICAgICAgICAgICAgICAgaWYgKCByZSApe1xuICAgICAgICAgICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gcmU7XG4gICAgICAgICAgY2FzZSAnc3RyaW5nJzpcbiAgICAgICAgICAgIGlmICggVC5pc1N0cmluZyggdmFyMiApICYmIHZhcjIgPT09IHZhcjEgKXtcbiAgICAgICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgICAgaWYgKCBULnR5cGVPZiggdmFyMSApID09PSBULnR5cGVPZiggdmFyMiApICYmIHZhcjEgPT09IHZhcjIgKXtcbiAgICAgICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH07XG5cbiAgICAvLyAqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqXG4gICAgLy8gKlxuICAgIC8vICogQ3JlYXRlIHB1YmxpYyB1dGlsaXR5IGhhc0FsbCBtZXRob2RcbiAgICAvLyAqIFJldHVybnMgdHJ1ZSBpZiBhIGNvbXBsZXggb2JqZWN0LCBhcnJheVxuICAgIC8vICogb3IgdGFmZnkgY29sbGVjdGlvbiBjb250YWlucyB0aGUgbWF0ZXJpYWxcbiAgICAvLyAqIHByb3ZpZGVkIGluIHRoZSBjYWxsIC0gZm9yIGFycmF5cyBpdCBtdXN0XG4gICAgLy8gKiBjb250YWluIGFsbCB0aGUgbWF0ZXJpYWwgaW4gZWFjaCBhcnJheSBpdGVtXG4gICAgLy8gKiBQdXJwb3NlOiBVc2VkIHRvIGNvbWFyZSBvYmplY3RzXG4gICAgLy8gKlxuICAgIC8vICoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKipcbiAgICBUQUZGWS5oYXNBbGwgPSBmdW5jdGlvbiAoIHZhcjEsIHZhcjIgKSB7XG5cbiAgICAgIHZhciBUID0gVEFGRlksIGFyO1xuICAgICAgaWYgKCBULmlzQXJyYXkoIHZhcjIgKSApe1xuICAgICAgICBhciA9IHRydWU7XG4gICAgICAgIGVhY2goIHZhcjIsIGZ1bmN0aW9uICggdiApIHtcbiAgICAgICAgICBhciA9IFQuaGFzKCB2YXIxLCB2ICk7XG4gICAgICAgICAgaWYgKCBhciA9PT0gZmFsc2UgKXtcbiAgICAgICAgICAgIHJldHVybiBUQUZGWS5FWElUO1xuICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgICAgIHJldHVybiBhcjtcbiAgICAgIH1cbiAgICAgIGVsc2Uge1xuICAgICAgICByZXR1cm4gVC5oYXMoIHZhcjEsIHZhcjIgKTtcbiAgICAgIH1cbiAgICB9O1xuXG5cbiAgICAvLyAqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqXG4gICAgLy8gKlxuICAgIC8vICogdHlwZU9mIEZpeGVkIGluIEphdmFTY3JpcHQgYXMgcHVibGljIHV0aWxpdHlcbiAgICAvLyAqXG4gICAgLy8gKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKlxuICAgIFRBRkZZLnR5cGVPZiA9IGZ1bmN0aW9uICggdiApIHtcbiAgICAgIHZhciBzID0gdHlwZW9mIHY7XG4gICAgICBpZiAoIHMgPT09ICdvYmplY3QnICl7XG4gICAgICAgIGlmICggdiApe1xuICAgICAgICAgIGlmICggdHlwZW9mIHYubGVuZ3RoID09PSAnbnVtYmVyJyAmJlxuICAgICAgICAgICAgISh2LnByb3BlcnR5SXNFbnVtZXJhYmxlKCAnbGVuZ3RoJyApKSApXG4gICAgICAgICAge1xuICAgICAgICAgICAgcyA9ICdhcnJheSc7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgIHMgPSAnbnVsbCc7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIHJldHVybiBzO1xuICAgIH07XG5cbiAgICAvLyAqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqXG4gICAgLy8gKlxuICAgIC8vICogQ3JlYXRlIHB1YmxpYyB1dGlsaXR5IGdldE9iamVjdEtleXMgbWV0aG9kXG4gICAgLy8gKiBSZXR1cm5zIGFuIGFycmF5IG9mIGFuIG9iamVjdHMga2V5c1xuICAgIC8vICogUHVycG9zZTogVXNlZCB0byBnZXQgdGhlIGtleXMgZm9yIGFuIG9iamVjdFxuICAgIC8vICpcbiAgICAvLyAqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqICAgXG4gICAgVEFGRlkuZ2V0T2JqZWN0S2V5cyA9IGZ1bmN0aW9uICggb2IgKSB7XG4gICAgICB2YXIga0EgPSBbXTtcbiAgICAgIGVhY2hpbiggb2IsIGZ1bmN0aW9uICggbiwgaCApIHtcbiAgICAgICAga0EucHVzaCggaCApO1xuICAgICAgfSk7XG4gICAgICBrQS5zb3J0KCk7XG4gICAgICByZXR1cm4ga0E7XG4gICAgfTtcblxuICAgIC8vICoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKipcbiAgICAvLyAqXG4gICAgLy8gKiBDcmVhdGUgcHVibGljIHV0aWxpdHkgaXNTYW1lQXJyYXlcbiAgICAvLyAqIFJldHVybnMgYW4gYXJyYXkgb2YgYW4gb2JqZWN0cyBrZXlzXG4gICAgLy8gKiBQdXJwb3NlOiBVc2VkIHRvIGdldCB0aGUga2V5cyBmb3IgYW4gb2JqZWN0XG4gICAgLy8gKlxuICAgIC8vICoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKiogICBcbiAgICBUQUZGWS5pc1NhbWVBcnJheSA9IGZ1bmN0aW9uICggYXIxLCBhcjIgKSB7XG4gICAgICByZXR1cm4gKFRBRkZZLmlzQXJyYXkoIGFyMSApICYmIFRBRkZZLmlzQXJyYXkoIGFyMiApICYmXG4gICAgICAgIGFyMS5qb2luKCAnLCcgKSA9PT0gYXIyLmpvaW4oICcsJyApKSA/IHRydWUgOiBmYWxzZTtcbiAgICB9O1xuXG4gICAgLy8gKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKlxuICAgIC8vICpcbiAgICAvLyAqIENyZWF0ZSBwdWJsaWMgdXRpbGl0eSBpc1NhbWVPYmplY3QgbWV0aG9kXG4gICAgLy8gKiBSZXR1cm5zIHRydWUgaWYgb2JqZWN0cyBjb250YWluIHRoZSBzYW1lXG4gICAgLy8gKiBtYXRlcmlhbCBvciBmYWxzZSBpZiB0aGV5IGRvIG5vdFxuICAgIC8vICogUHVycG9zZTogVXNlZCB0byBjb21hcmUgb2JqZWN0c1xuICAgIC8vICpcbiAgICAvLyAqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqICAgXG4gICAgVEFGRlkuaXNTYW1lT2JqZWN0ID0gZnVuY3Rpb24gKCBvYjEsIG9iMiApIHtcbiAgICAgIHZhciBUID0gVEFGRlksIHJ2ID0gdHJ1ZTtcblxuICAgICAgaWYgKCBULmlzT2JqZWN0KCBvYjEgKSAmJiBULmlzT2JqZWN0KCBvYjIgKSApe1xuICAgICAgICBpZiAoIFQuaXNTYW1lQXJyYXkoIFQuZ2V0T2JqZWN0S2V5cyggb2IxICksXG4gICAgICAgICAgVC5nZXRPYmplY3RLZXlzKCBvYjIgKSApIClcbiAgICAgICAge1xuICAgICAgICAgIGVhY2hpbiggb2IxLCBmdW5jdGlvbiAoIHYsIG4gKSB7XG4gICAgICAgICAgICBpZiAoICEgKCAoVC5pc09iamVjdCggb2IxW25dICkgJiYgVC5pc09iamVjdCggb2IyW25dICkgJiZcbiAgICAgICAgICAgICAgVC5pc1NhbWVPYmplY3QoIG9iMVtuXSwgb2IyW25dICkpIHx8XG4gICAgICAgICAgICAgIChULmlzQXJyYXkoIG9iMVtuXSApICYmIFQuaXNBcnJheSggb2IyW25dICkgJiZcbiAgICAgICAgICAgICAgICBULmlzU2FtZUFycmF5KCBvYjFbbl0sIG9iMltuXSApKSB8fCAob2IxW25dID09PSBvYjJbbl0pIClcbiAgICAgICAgICAgICkge1xuICAgICAgICAgICAgICBydiA9IGZhbHNlO1xuICAgICAgICAgICAgICByZXR1cm4gVEFGRlkuRVhJVDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICBydiA9IGZhbHNlO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICBlbHNlIHtcbiAgICAgICAgcnYgPSBmYWxzZTtcbiAgICAgIH1cbiAgICAgIHJldHVybiBydjtcbiAgICB9O1xuXG4gICAgLy8gKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKlxuICAgIC8vICpcbiAgICAvLyAqIENyZWF0ZSBwdWJsaWMgdXRpbGl0eSBpc1tEYXRhVHlwZV0gbWV0aG9kc1xuICAgIC8vICogUmV0dXJuIHRydWUgaWYgb2JqIGlzIGRhdGF0eXBlLCBmYWxzZSBvdGhlcndpc2VcbiAgICAvLyAqIFB1cnBvc2U6IFVzZWQgdG8gZGV0ZXJtaW5lIGlmIGFyZ3VtZW50cyBhcmUgb2YgY2VydGFpbiBkYXRhIHR5cGVcbiAgICAvLyAqXG4gICAgLy8gKiBtbWlrb3dza2kgMjAxMi0wOC0wNiByZWZhY3RvcmVkIHRvIG1ha2UgbXVjaCBsZXNzIFwibWFnaWNhbFwiOlxuICAgIC8vICogICBmZXdlciBjbG9zdXJlcyBhbmQgcGFzc2VzIGpzbGludFxuICAgIC8vICpcbiAgICAvLyAqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqXG5cbiAgICB0eXBlTGlzdCA9IFtcbiAgICAgICdTdHJpbmcnLCAgJ051bWJlcicsICdPYmplY3QnLCAgICdBcnJheScsXG4gICAgICAnQm9vbGVhbicsICdOdWxsJywgICAnRnVuY3Rpb24nLCAnVW5kZWZpbmVkJ1xuICAgIF07XG4gIFxuICAgIG1ha2VUZXN0ID0gZnVuY3Rpb24gKCB0aGlzS2V5ICkge1xuICAgICAgcmV0dXJuIGZ1bmN0aW9uICggZGF0YSApIHtcbiAgICAgICAgcmV0dXJuIFRBRkZZLnR5cGVPZiggZGF0YSApID09PSB0aGlzS2V5LnRvTG93ZXJDYXNlKCkgPyB0cnVlIDogZmFsc2U7XG4gICAgICB9O1xuICAgIH07XG4gIFxuICAgIGZvciAoIGlkeCA9IDA7IGlkeCA8IHR5cGVMaXN0Lmxlbmd0aDsgaWR4KysgKXtcbiAgICAgIHR5cGVLZXkgPSB0eXBlTGlzdFtpZHhdO1xuICAgICAgVEFGRllbJ2lzJyArIHR5cGVLZXldID0gbWFrZVRlc3QoIHR5cGVLZXkgKTtcbiAgICB9XG4gIH1cbn0oKSk7XG5cbmlmICggdHlwZW9mKGV4cG9ydHMpID09PSAnb2JqZWN0JyApe1xuICBleHBvcnRzLnRhZmZ5ID0gVEFGRlk7XG59XG5cbiIsIi8qXG4gKiBtYWluLmpzXG4gKiBFbnRyeSBwb2ludCBmb3Igc2hlbGxhYyBhcHBcbiovXG4ndXNlIHN0cmljdCc7XG5cbiQoIGRvY3VtZW50ICkucmVhZHkoZnVuY3Rpb24oKSB7XG4gICAgdmFyIHNoZWxsYWMgPSByZXF1aXJlKCcuL2FwcC9zaGVsbGFjLmpzJyk7XG4gICAgc2hlbGxhYy5pbml0TW9kdWxlKCQoXCIjc2hlbGxhYy1hcHBcIiksIGRhdGEpO1xufSk7XG5cbiJdfQ==
