(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({"/home/jvwong/Projects/shellac/shellac.no-ip.ca/source/shellac/static/shellac/js/lib/taffydb/taffy.js":[function(require,module,exports){
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


},{}],"/home/jvwong/Projects/shellac/shellac.no-ip.ca/source/shellac/static/shellac/js/src/main.js":[function(require,module,exports){
/*
 * main.js
 * Entry point for shellac app
*/
'use strict';

$( document ).ready(function() {
    var shellac = require('./shellac.js');
    shellac.initModule($("#shellac-app"), data);
});


},{"./shellac.js":"/home/jvwong/Projects/shellac/shellac.no-ip.ca/source/shellac/static/shellac/js/src/shellac.js"}],"/home/jvwong/Projects/shellac/shellac.no-ip.ca/source/shellac/static/shellac/js/src/shellac.js":[function(require,module,exports){
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


},{"../lib/taffydb/taffy.js":"/home/jvwong/Projects/shellac/shellac.no-ip.ca/source/shellac/static/shellac/js/lib/taffydb/taffy.js"}]},{},["/home/jvwong/Projects/shellac/shellac.no-ip.ca/source/shellac/static/shellac/js/src/main.js"])
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi91c3IvbG9jYWwvbGliL25vZGVfbW9kdWxlcy93YXRjaGlmeS9ub2RlX21vZHVsZXMvYnJvd3NlcmlmeS9ub2RlX21vZHVsZXMvYnJvd3Nlci1wYWNrL19wcmVsdWRlLmpzIiwiL2hvbWUvanZ3b25nL1Byb2plY3RzL3NoZWxsYWMvc2hlbGxhYy5uby1pcC5jYS9zb3VyY2Uvc2hlbGxhYy9zdGF0aWMvc2hlbGxhYy9qcy9saWIvdGFmZnlkYi90YWZmeS5qcyIsIi9ob21lL2p2d29uZy9Qcm9qZWN0cy9zaGVsbGFjL3NoZWxsYWMubm8taXAuY2Evc291cmNlL3NoZWxsYWMvc3RhdGljL3NoZWxsYWMvanMvc3JjL21haW4uanMiLCIvaG9tZS9qdndvbmcvUHJvamVjdHMvc2hlbGxhYy9zaGVsbGFjLm5vLWlwLmNhL3NvdXJjZS9zaGVsbGFjL3N0YXRpYy9zaGVsbGFjL2pzL3NyYy9zaGVsbGFjLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FDQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNqK0RBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNYQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCIvKlxuXG4gU29mdHdhcmUgTGljZW5zZSBBZ3JlZW1lbnQgKEJTRCBMaWNlbnNlKVxuIGh0dHA6Ly90YWZmeWRiLmNvbVxuIENvcHlyaWdodCAoYylcbiBBbGwgcmlnaHRzIHJlc2VydmVkLlxuXG5cbiBSZWRpc3RyaWJ1dGlvbiBhbmQgdXNlIG9mIHRoaXMgc29mdHdhcmUgaW4gc291cmNlIGFuZCBiaW5hcnkgZm9ybXMsIHdpdGggb3Igd2l0aG91dCBtb2RpZmljYXRpb24sIGFyZSBwZXJtaXR0ZWQgcHJvdmlkZWQgdGhhdCB0aGUgZm9sbG93aW5nIGNvbmRpdGlvbiBpcyBtZXQ6XG5cbiAqIFJlZGlzdHJpYnV0aW9ucyBvZiBzb3VyY2UgY29kZSBtdXN0IHJldGFpbiB0aGUgYWJvdmUgY29weXJpZ2h0IG5vdGljZSwgdGhpcyBsaXN0IG9mIGNvbmRpdGlvbnMgYW5kIHRoZSBmb2xsb3dpbmcgZGlzY2xhaW1lci5cblxuIFRISVMgU09GVFdBUkUgSVMgUFJPVklERUQgQlkgVEhFIENPUFlSSUdIVCBIT0xERVJTIEFORCBDT05UUklCVVRPUlMgXCJBUyBJU1wiIEFORCBBTlkgRVhQUkVTUyBPUiBJTVBMSUVEIFdBUlJBTlRJRVMsIElOQ0xVRElORywgQlVUIE5PVCBMSU1JVEVEIFRPLCBUSEUgSU1QTElFRCBXQVJSQU5USUVTIE9GIE1FUkNIQU5UQUJJTElUWSBBTkQgRklUTkVTUyBGT1IgQSBQQVJUSUNVTEFSIFBVUlBPU0UgQVJFIERJU0NMQUlNRUQuIElOIE5PIEVWRU5UIFNIQUxMIFRIRSBDT1BZUklHSFQgT1dORVIgT1IgQ09OVFJJQlVUT1JTIEJFIExJQUJMRSBGT1IgQU5ZIERJUkVDVCwgSU5ESVJFQ1QsIElOQ0lERU5UQUwsIFNQRUNJQUwsIEVYRU1QTEFSWSwgT1IgQ09OU0VRVUVOVElBTCBEQU1BR0VTIChJTkNMVURJTkcsIEJVVCBOT1RcbiBMSU1JVEVEIFRPLCBQUk9DVVJFTUVOVCBPRiBTVUJTVElUVVRFIEdPT0RTIE9SIFNFUlZJQ0VTOyBMT1NTIE9GIFVTRSwgREFUQSwgT1IgUFJPRklUUzsgT1IgQlVTSU5FU1MgSU5URVJSVVBUSU9OKSBIT1dFVkVSIENBVVNFRCBBTkQgT04gQU5ZIFRIRU9SWSBPRiBMSUFCSUxJVFksIFdIRVRIRVIgSU4gQ09OVFJBQ1QsIFNUUklDVCBMSUFCSUxJVFksIE9SIFRPUlQgKElOQ0xVRElORyBORUdMSUdFTkNFIE9SIE9USEVSV0lTRSkgQVJJU0lORyBJTiBBTlkgV0FZIE9VVCBPRiBUSEUgVVNFIE9GIFRISVMgU09GVFdBUkUsIEVWRU4gSUYgQURWSVNFRCBPRiBUSEUgUE9TU0lCSUxJVFkgT0YgU1VDSCBEQU1BR0UuXG5cbiAqL1xuXG4vKmpzbGludCAgICAgICAgYnJvd3NlciA6IHRydWUsIGNvbnRpbnVlIDogdHJ1ZSxcbiBkZXZlbCAgOiB0cnVlLCBpbmRlbnQgIDogMiwgICAgbWF4ZXJyICAgOiA1MDAsXG4gbmV3Y2FwIDogdHJ1ZSwgbm9tZW4gICA6IHRydWUsIHBsdXNwbHVzIDogdHJ1ZSxcbiByZWdleHAgOiB0cnVlLCBzbG9wcHkgIDogdHJ1ZSwgdmFycyAgICAgOiBmYWxzZSxcbiB3aGl0ZSAgOiB0cnVlXG4qL1xuXG4vLyBCVUlMRCAxOTNkNDhkLCBtb2RpZmllZCBieSBtbWlrb3dza2kgdG8gcGFzcyBqc2xpbnRcblxuLy8gU2V0dXAgVEFGRlkgbmFtZSBzcGFjZSB0byByZXR1cm4gYW4gb2JqZWN0IHdpdGggbWV0aG9kc1xudmFyIFRBRkZZLCBleHBvcnRzLCBUO1xuKGZ1bmN0aW9uICgpIHtcbiAgJ3VzZSBzdHJpY3QnO1xuICB2YXJcbiAgICB0eXBlTGlzdCwgICAgIG1ha2VUZXN0LCAgICAgaWR4LCAgICB0eXBlS2V5LFxuICAgIHZlcnNpb24sICAgICAgVEMsICAgICAgICAgICBpZHBhZCwgIGNtYXgsXG4gICAgQVBJLCAgICAgICAgICBwcm90ZWN0SlNPTiwgIGVhY2gsICAgZWFjaGluLFxuICAgIGlzSW5kZXhhYmxlLCAgcmV0dXJuRmlsdGVyLCBydW5GaWx0ZXJzLFxuICAgIG51bWNoYXJzcGxpdCwgb3JkZXJCeUNvbCwgICBydW4sICAgIGludGVyc2VjdGlvbixcbiAgICBmaWx0ZXIsICAgICAgIG1ha2VDaWQsICAgICAgc2FmZUZvckpzb24sXG4gICAgaXNSZWdleHBcbiAgICA7XG5cblxuICBpZiAoICEgVEFGRlkgKXtcbiAgICAvLyBUQyA9IENvdW50ZXIgZm9yIFRhZmZ5IERCcyBvbiBwYWdlLCB1c2VkIGZvciB1bmlxdWUgSURzXG4gICAgLy8gY21heCA9IHNpemUgb2YgY2hhcm51bWFycmF5IGNvbnZlcnNpb24gY2FjaGVcbiAgICAvLyBpZHBhZCA9IHplcm9zIHRvIHBhZCByZWNvcmQgSURzIHdpdGhcbiAgICB2ZXJzaW9uID0gJzIuNyc7XG4gICAgVEMgICAgICA9IDE7XG4gICAgaWRwYWQgICA9ICcwMDAwMDAnO1xuICAgIGNtYXggICAgPSAxMDAwO1xuICAgIEFQSSAgICAgPSB7fTtcblxuICAgIHByb3RlY3RKU09OID0gZnVuY3Rpb24gKCB0ICkge1xuICAgICAgLy8gKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKlxuICAgICAgLy8gKlxuICAgICAgLy8gKiBUYWtlczogYSB2YXJpYWJsZVxuICAgICAgLy8gKiBSZXR1cm5zOiB0aGUgdmFyaWFibGUgaWYgb2JqZWN0L2FycmF5IG9yIHRoZSBwYXJzZWQgdmFyaWFibGUgaWYgSlNPTlxuICAgICAgLy8gKlxuICAgICAgLy8gKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKiAgXG4gICAgICBpZiAoIFRBRkZZLmlzQXJyYXkoIHQgKSB8fCBUQUZGWS5pc09iamVjdCggdCApICl7XG4gICAgICAgIHJldHVybiB0O1xuICAgICAgfVxuICAgICAgZWxzZSB7XG4gICAgICAgIHJldHVybiBKU09OLnBhcnNlKCB0ICk7XG4gICAgICB9XG4gICAgfTtcbiAgICBcbiAgICAvLyBncmFjZWZ1bGx5IHN0b2xlbiBmcm9tIHVuZGVyc2NvcmUuanNcbiAgICBpbnRlcnNlY3Rpb24gPSBmdW5jdGlvbihhcnJheTEsIGFycmF5Mikge1xuICAgICAgICByZXR1cm4gZmlsdGVyKGFycmF5MSwgZnVuY3Rpb24oaXRlbSkge1xuICAgICAgICAgIHJldHVybiBhcnJheTIuaW5kZXhPZihpdGVtKSA+PSAwO1xuICAgICAgICB9KTtcbiAgICB9O1xuXG4gICAgLy8gZ3JhY2VmdWxseSBzdG9sZW4gZnJvbSB1bmRlcnNjb3JlLmpzXG4gICAgZmlsdGVyID0gZnVuY3Rpb24ob2JqLCBpdGVyYXRvciwgY29udGV4dCkge1xuICAgICAgICB2YXIgcmVzdWx0cyA9IFtdO1xuICAgICAgICBpZiAob2JqID09IG51bGwpIHJldHVybiByZXN1bHRzO1xuICAgICAgICBpZiAoQXJyYXkucHJvdG90eXBlLmZpbHRlciAmJiBvYmouZmlsdGVyID09PSBBcnJheS5wcm90b3R5cGUuZmlsdGVyKSByZXR1cm4gb2JqLmZpbHRlcihpdGVyYXRvciwgY29udGV4dCk7XG4gICAgICAgIGVhY2gob2JqLCBmdW5jdGlvbih2YWx1ZSwgaW5kZXgsIGxpc3QpIHtcbiAgICAgICAgICBpZiAoaXRlcmF0b3IuY2FsbChjb250ZXh0LCB2YWx1ZSwgaW5kZXgsIGxpc3QpKSByZXN1bHRzW3Jlc3VsdHMubGVuZ3RoXSA9IHZhbHVlO1xuICAgICAgICB9KTtcbiAgICAgICAgcmV0dXJuIHJlc3VsdHM7XG4gICAgfTtcbiAgICBcbiAgICBpc1JlZ2V4cCA9IGZ1bmN0aW9uKGFPYmopIHtcbiAgICAgICAgcmV0dXJuIE9iamVjdC5wcm90b3R5cGUudG9TdHJpbmcuY2FsbChhT2JqKT09PSdbb2JqZWN0IFJlZ0V4cF0nO1xuICAgIH1cbiAgICBcbiAgICBzYWZlRm9ySnNvbiA9IGZ1bmN0aW9uKGFPYmopIHtcbiAgICAgICAgdmFyIG15UmVzdWx0ID0gVC5pc0FycmF5KGFPYmopID8gW10gOiBULmlzT2JqZWN0KGFPYmopID8ge30gOiBudWxsO1xuICAgICAgICBpZihhT2JqPT09bnVsbCkgcmV0dXJuIGFPYmo7XG4gICAgICAgIGZvcih2YXIgaSBpbiBhT2JqKSB7XG4gICAgICAgICAgICBteVJlc3VsdFtpXSAgPSBpc1JlZ2V4cChhT2JqW2ldKSA/IGFPYmpbaV0udG9TdHJpbmcoKSA6IFQuaXNBcnJheShhT2JqW2ldKSB8fCBULmlzT2JqZWN0KGFPYmpbaV0pID8gc2FmZUZvckpzb24oYU9ialtpXSkgOiBhT2JqW2ldO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBteVJlc3VsdDtcbiAgICB9XG4gICAgXG4gICAgbWFrZUNpZCA9IGZ1bmN0aW9uKGFDb250ZXh0KSB7XG4gICAgICAgIHZhciBteUNpZCA9IEpTT04uc3RyaW5naWZ5KGFDb250ZXh0KTtcbiAgICAgICAgaWYobXlDaWQubWF0Y2goL3JlZ2V4Lyk9PT1udWxsKSByZXR1cm4gbXlDaWQ7XG4gICAgICAgIHJldHVybiBKU09OLnN0cmluZ2lmeShzYWZlRm9ySnNvbihhQ29udGV4dCkpO1xuICAgIH1cbiAgICBcbiAgICBlYWNoID0gZnVuY3Rpb24gKCBhLCBmdW4sIHUgKSB7XG4gICAgICB2YXIgciwgaSwgeCwgeTtcbiAgICAgIC8vICoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKipcbiAgICAgIC8vICpcbiAgICAgIC8vICogVGFrZXM6XG4gICAgICAvLyAqIGEgPSBhbiBvYmplY3QvdmFsdWUgb3IgYW4gYXJyYXkgb2Ygb2JqZWN0cy92YWx1ZXNcbiAgICAgIC8vICogZiA9IGEgZnVuY3Rpb25cbiAgICAgIC8vICogdSA9IG9wdGlvbmFsIGZsYWcgdG8gZGVzY3JpYmUgaG93IHRvIGhhbmRsZSB1bmRlZmluZWQgdmFsdWVzXG4gICAgICAvLyAgIGluIGFycmF5IG9mIHZhbHVlcy4gVHJ1ZTogcGFzcyB0aGVtIHRvIHRoZSBmdW5jdGlvbnMsXG4gICAgICAvLyAgIEZhbHNlOiBza2lwLiBEZWZhdWx0IEZhbHNlO1xuICAgICAgLy8gKiBQdXJwb3NlOiBVc2VkIHRvIGxvb3Agb3ZlciBhcnJheXNcbiAgICAgIC8vICpcbiAgICAgIC8vICoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKiogIFxuICAgICAgaWYgKCBhICYmICgoVC5pc0FycmF5KCBhICkgJiYgYS5sZW5ndGggPT09IDEpIHx8ICghVC5pc0FycmF5KCBhICkpKSApe1xuICAgICAgICBmdW4oIChULmlzQXJyYXkoIGEgKSkgPyBhWzBdIDogYSwgMCApO1xuICAgICAgfVxuICAgICAgZWxzZSB7XG4gICAgICAgIGZvciAoIHIsIGksIHggPSAwLCBhID0gKFQuaXNBcnJheSggYSApKSA/IGEgOiBbYV0sIHkgPSBhLmxlbmd0aDtcbiAgICAgICAgICAgICAgeCA8IHk7IHgrKyApXG4gICAgICAgIHtcbiAgICAgICAgICBpID0gYVt4XTtcbiAgICAgICAgICBpZiAoICFULmlzVW5kZWZpbmVkKCBpICkgfHwgKHUgfHwgZmFsc2UpICl7XG4gICAgICAgICAgICByID0gZnVuKCBpLCB4ICk7XG4gICAgICAgICAgICBpZiAoIHIgPT09IFQuRVhJVCApe1xuICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfVxuICAgIH07XG5cbiAgICBlYWNoaW4gPSBmdW5jdGlvbiAoIG8sIGZ1biApIHtcbiAgICAgIC8vICoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKipcbiAgICAgIC8vICpcbiAgICAgIC8vICogVGFrZXM6XG4gICAgICAvLyAqIG8gPSBhbiBvYmplY3RcbiAgICAgIC8vICogZiA9IGEgZnVuY3Rpb25cbiAgICAgIC8vICogUHVycG9zZTogVXNlZCB0byBsb29wIG92ZXIgb2JqZWN0c1xuICAgICAgLy8gKlxuICAgICAgLy8gKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKiAgXG4gICAgICB2YXIgeCA9IDAsIHIsIGk7XG5cbiAgICAgIGZvciAoIGkgaW4gbyApe1xuICAgICAgICBpZiAoIG8uaGFzT3duUHJvcGVydHkoIGkgKSApe1xuICAgICAgICAgIHIgPSBmdW4oIG9baV0sIGksIHgrKyApO1xuICAgICAgICAgIGlmICggciA9PT0gVC5FWElUICl7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgIH07XG5cbiAgICBBUEkuZXh0ZW5kID0gZnVuY3Rpb24gKCBtLCBmICkge1xuICAgICAgLy8gKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKlxuICAgICAgLy8gKlxuICAgICAgLy8gKiBUYWtlczogbWV0aG9kIG5hbWUsIGZ1bmN0aW9uXG4gICAgICAvLyAqIFB1cnBvc2U6IEFkZCBhIGN1c3RvbSBtZXRob2QgdG8gdGhlIEFQSVxuICAgICAgLy8gKlxuICAgICAgLy8gKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKiAgXG4gICAgICBBUElbbV0gPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHJldHVybiBmLmFwcGx5KCB0aGlzLCBhcmd1bWVudHMgKTtcbiAgICAgIH07XG4gICAgfTtcblxuICAgIGlzSW5kZXhhYmxlID0gZnVuY3Rpb24gKCBmICkge1xuICAgICAgdmFyIGk7XG4gICAgICAvLyBDaGVjayB0byBzZWUgaWYgcmVjb3JkIElEXG4gICAgICBpZiAoIFQuaXNTdHJpbmcoIGYgKSAmJiAvW3RdWzAtOV0qW3JdWzAtOV0qL2kudGVzdCggZiApICl7XG4gICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgfVxuICAgICAgLy8gQ2hlY2sgdG8gc2VlIGlmIHJlY29yZFxuICAgICAgaWYgKCBULmlzT2JqZWN0KCBmICkgJiYgZi5fX19pZCAmJiBmLl9fX3MgKXtcbiAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICB9XG5cbiAgICAgIC8vIENoZWNrIHRvIHNlZSBpZiBhcnJheSBvZiBpbmRleGVzXG4gICAgICBpZiAoIFQuaXNBcnJheSggZiApICl7XG4gICAgICAgIGkgPSB0cnVlO1xuICAgICAgICBlYWNoKCBmLCBmdW5jdGlvbiAoIHIgKSB7XG4gICAgICAgICAgaWYgKCAhaXNJbmRleGFibGUoIHIgKSApe1xuICAgICAgICAgICAgaSA9IGZhbHNlO1xuXG4gICAgICAgICAgICByZXR1cm4gVEFGRlkuRVhJVDtcbiAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgICAgICByZXR1cm4gaTtcbiAgICAgIH1cblxuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH07XG5cbiAgICBydW5GaWx0ZXJzID0gZnVuY3Rpb24gKCByLCBmaWx0ZXIgKSB7XG4gICAgICAvLyAqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqXG4gICAgICAvLyAqXG4gICAgICAvLyAqIFRha2VzOiB0YWtlcyBhIHJlY29yZCBhbmQgYSBjb2xsZWN0aW9uIG9mIGZpbHRlcnNcbiAgICAgIC8vICogUmV0dXJuczogdHJ1ZSBpZiB0aGUgcmVjb3JkIG1hdGNoZXMsIGZhbHNlIG90aGVyd2lzZVxuICAgICAgLy8gKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKlxuICAgICAgdmFyIG1hdGNoID0gdHJ1ZTtcblxuXG4gICAgICBlYWNoKCBmaWx0ZXIsIGZ1bmN0aW9uICggbWYgKSB7XG4gICAgICAgIHN3aXRjaCAoIFQudHlwZU9mKCBtZiApICl7XG4gICAgICAgICAgY2FzZSAnZnVuY3Rpb24nOlxuICAgICAgICAgICAgLy8gcnVuIGZ1bmN0aW9uXG4gICAgICAgICAgICBpZiAoICFtZi5hcHBseSggciApICl7XG4gICAgICAgICAgICAgIG1hdGNoID0gZmFsc2U7XG4gICAgICAgICAgICAgIHJldHVybiBUQUZGWS5FWElUO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgY2FzZSAnYXJyYXknOlxuICAgICAgICAgICAgLy8gbG9vcCBhcnJheSBhbmQgdHJlYXQgbGlrZSBhIFNRTCBvclxuICAgICAgICAgICAgbWF0Y2ggPSAobWYubGVuZ3RoID09PSAxKSA/IChydW5GaWx0ZXJzKCByLCBtZlswXSApKSA6XG4gICAgICAgICAgICAgIChtZi5sZW5ndGggPT09IDIpID8gKHJ1bkZpbHRlcnMoIHIsIG1mWzBdICkgfHxcbiAgICAgICAgICAgICAgICBydW5GaWx0ZXJzKCByLCBtZlsxXSApKSA6XG4gICAgICAgICAgICAgICAgKG1mLmxlbmd0aCA9PT0gMykgPyAocnVuRmlsdGVycyggciwgbWZbMF0gKSB8fFxuICAgICAgICAgICAgICAgICAgcnVuRmlsdGVycyggciwgbWZbMV0gKSB8fCBydW5GaWx0ZXJzKCByLCBtZlsyXSApKSA6XG4gICAgICAgICAgICAgICAgICAobWYubGVuZ3RoID09PSA0KSA/IChydW5GaWx0ZXJzKCByLCBtZlswXSApIHx8XG4gICAgICAgICAgICAgICAgICAgIHJ1bkZpbHRlcnMoIHIsIG1mWzFdICkgfHwgcnVuRmlsdGVycyggciwgbWZbMl0gKSB8fFxuICAgICAgICAgICAgICAgICAgICBydW5GaWx0ZXJzKCByLCBtZlszXSApKSA6IGZhbHNlO1xuICAgICAgICAgICAgaWYgKCBtZi5sZW5ndGggPiA0ICl7XG4gICAgICAgICAgICAgIGVhY2goIG1mLCBmdW5jdGlvbiAoIGYgKSB7XG4gICAgICAgICAgICAgICAgaWYgKCBydW5GaWx0ZXJzKCByLCBmICkgKXtcbiAgICAgICAgICAgICAgICAgIG1hdGNoID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIH1cbiAgICAgIH0pO1xuXG4gICAgICByZXR1cm4gbWF0Y2g7XG4gICAgfTtcblxuICAgIHJldHVybkZpbHRlciA9IGZ1bmN0aW9uICggZiApIHtcbiAgICAgIC8vICoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKipcbiAgICAgIC8vICpcbiAgICAgIC8vICogVGFrZXM6IGZpbHRlciBvYmplY3RcbiAgICAgIC8vICogUmV0dXJuczogYSBmaWx0ZXIgZnVuY3Rpb25cbiAgICAgIC8vICogUHVycG9zZTogVGFrZSBhIGZpbHRlciBvYmplY3QgYW5kIHJldHVybiBhIGZ1bmN0aW9uIHRoYXQgY2FuIGJlIHVzZWQgdG8gY29tcGFyZVxuICAgICAgLy8gKiBhIFRhZmZ5REIgcmVjb3JkIHRvIHNlZSBpZiB0aGUgcmVjb3JkIG1hdGNoZXMgYSBxdWVyeVxuICAgICAgLy8gKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKiAgXG4gICAgICB2YXIgbmYgPSBbXTtcbiAgICAgIGlmICggVC5pc1N0cmluZyggZiApICYmIC9bdF1bMC05XSpbcl1bMC05XSovaS50ZXN0KCBmICkgKXtcbiAgICAgICAgZiA9IHsgX19faWQgOiBmIH07XG4gICAgICB9XG4gICAgICBpZiAoIFQuaXNBcnJheSggZiApICl7XG4gICAgICAgIC8vIGlmIHdlIGFyZSB3b3JraW5nIHdpdGggYW4gYXJyYXlcblxuICAgICAgICBlYWNoKCBmLCBmdW5jdGlvbiAoIHIgKSB7XG4gICAgICAgICAgLy8gbG9vcCB0aGUgYXJyYXkgYW5kIHJldHVybiBhIGZpbHRlciBmdW5jIGZvciBlYWNoIHZhbHVlXG4gICAgICAgICAgbmYucHVzaCggcmV0dXJuRmlsdGVyKCByICkgKTtcbiAgICAgICAgfSk7XG4gICAgICAgIC8vIG5vdyBidWlsZCBhIGZ1bmMgdG8gbG9vcCBvdmVyIHRoZSBmaWx0ZXJzIGFuZCByZXR1cm4gdHJ1ZSBpZiBBTlkgb2YgdGhlIGZpbHRlcnMgbWF0Y2hcbiAgICAgICAgLy8gVGhpcyBoYW5kbGVzIGxvZ2ljYWwgT1IgZXhwcmVzc2lvbnNcbiAgICAgICAgZiA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICB2YXIgdGhhdCA9IHRoaXMsIG1hdGNoID0gZmFsc2U7XG4gICAgICAgICAgZWFjaCggbmYsIGZ1bmN0aW9uICggZiApIHtcbiAgICAgICAgICAgIGlmICggcnVuRmlsdGVycyggdGhhdCwgZiApICl7XG4gICAgICAgICAgICAgIG1hdGNoID0gdHJ1ZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9KTtcbiAgICAgICAgICByZXR1cm4gbWF0Y2g7XG4gICAgICAgIH07XG4gICAgICAgIHJldHVybiBmO1xuXG4gICAgICB9XG4gICAgICAvLyBpZiB3ZSBhcmUgZGVhbGluZyB3aXRoIGFuIE9iamVjdFxuICAgICAgaWYgKCBULmlzT2JqZWN0KCBmICkgKXtcbiAgICAgICAgaWYgKCBULmlzT2JqZWN0KCBmICkgJiYgZi5fX19pZCAmJiBmLl9fX3MgKXtcbiAgICAgICAgICBmID0geyBfX19pZCA6IGYuX19faWQgfTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIExvb3Agb3ZlciBlYWNoIHZhbHVlIG9uIHRoZSBvYmplY3QgdG8gcHJlcCBtYXRjaCB0eXBlIGFuZCBtYXRjaCB2YWx1ZVxuICAgICAgICBlYWNoaW4oIGYsIGZ1bmN0aW9uICggdiwgaSApIHtcblxuICAgICAgICAgIC8vIGRlZmF1bHQgbWF0Y2ggdHlwZSB0byBJUy9FcXVhbHNcbiAgICAgICAgICBpZiAoICFULmlzT2JqZWN0KCB2ICkgKXtcbiAgICAgICAgICAgIHYgPSB7XG4gICAgICAgICAgICAgICdpcycgOiB2XG4gICAgICAgICAgICB9O1xuICAgICAgICAgIH1cbiAgICAgICAgICAvLyBsb29wIG92ZXIgZWFjaCB2YWx1ZSBvbiB0aGUgdmFsdWUgb2JqZWN0ICAtIGlmIGFueVxuICAgICAgICAgIGVhY2hpbiggdiwgZnVuY3Rpb24gKCBtdGVzdCwgcyApIHtcbiAgICAgICAgICAgIC8vIHMgPSBtYXRjaCB0eXBlLCBlLmcuIGlzLCBoYXNBbGwsIGxpa2UsIGV0Y1xuICAgICAgICAgICAgdmFyIGMgPSBbXSwgbG9vcGVyO1xuXG4gICAgICAgICAgICAvLyBmdW5jdGlvbiB0byBsb29wIGFuZCBhcHBseSBmaWx0ZXJcbiAgICAgICAgICAgIGxvb3BlciA9IChzID09PSAnaGFzQWxsJykgP1xuICAgICAgICAgICAgICBmdW5jdGlvbiAoIG10ZXN0LCBmdW5jICkge1xuICAgICAgICAgICAgICAgIGZ1bmMoIG10ZXN0ICk7XG4gICAgICAgICAgICAgIH0gOiBlYWNoO1xuXG4gICAgICAgICAgICAvLyBsb29wIG92ZXIgZWFjaCB0ZXN0XG4gICAgICAgICAgICBsb29wZXIoIG10ZXN0LCBmdW5jdGlvbiAoIG10ZXN0ICkge1xuXG4gICAgICAgICAgICAgIC8vIHN1ID0gbWF0Y2ggc3VjY2Vzc1xuICAgICAgICAgICAgICAvLyBmID0gbWF0Y2ggZmFsc2VcbiAgICAgICAgICAgICAgdmFyIHN1ID0gdHJ1ZSwgZiA9IGZhbHNlLCBtYXRjaEZ1bmM7XG5cblxuICAgICAgICAgICAgICAvLyBwdXNoIGEgZnVuY3Rpb24gb250byB0aGUgZmlsdGVyIGNvbGxlY3Rpb24gdG8gZG8gdGhlIG1hdGNoaW5nXG4gICAgICAgICAgICAgIG1hdGNoRnVuYyA9IGZ1bmN0aW9uICgpIHtcblxuICAgICAgICAgICAgICAgIC8vIGdldCB0aGUgdmFsdWUgZnJvbSB0aGUgcmVjb3JkXG4gICAgICAgICAgICAgICAgdmFyXG4gICAgICAgICAgICAgICAgICBtdmFsdWUgICA9IHRoaXNbaV0sXG4gICAgICAgICAgICAgICAgICBlcWVxICAgICA9ICc9PScsXG4gICAgICAgICAgICAgICAgICBiYW5nZXEgICA9ICchPScsXG4gICAgICAgICAgICAgICAgICBlcWVxZXEgICA9ICc9PT0nLFxuICAgICAgICAgICAgICAgICAgbHQgICA9ICc8JyxcbiAgICAgICAgICAgICAgICAgIGd0ICAgPSAnPicsXG4gICAgICAgICAgICAgICAgICBsdGVxICAgPSAnPD0nLFxuICAgICAgICAgICAgICAgICAgZ3RlcSAgID0gJz49JyxcbiAgICAgICAgICAgICAgICAgIGJhbmdlcWVxID0gJyE9PScsXG4gICAgICAgICAgICAgICAgICByXG4gICAgICAgICAgICAgICAgICA7XG5cbiAgICAgICAgICAgICAgICBpZiAodHlwZW9mIG12YWx1ZSA9PT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAgICAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgaWYgKCAocy5pbmRleE9mKCAnIScgKSA9PT0gMCkgJiYgcyAhPT0gYmFuZ2VxICYmXG4gICAgICAgICAgICAgICAgICBzICE9PSBiYW5nZXFlcSApXG4gICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgLy8gaWYgdGhlIGZpbHRlciBuYW1lIHN0YXJ0cyB3aXRoICEgYXMgaW4gJyFpcycgdGhlbiByZXZlcnNlIHRoZSBtYXRjaCBsb2dpYyBhbmQgcmVtb3ZlIHRoZSAhXG4gICAgICAgICAgICAgICAgICBzdSA9IGZhbHNlO1xuICAgICAgICAgICAgICAgICAgcyA9IHMuc3Vic3RyaW5nKCAxLCBzLmxlbmd0aCApO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAvLyBnZXQgdGhlIG1hdGNoIHJlc3VsdHMgYmFzZWQgb24gdGhlIHMvbWF0Y2ggdHlwZVxuICAgICAgICAgICAgICAgIC8qanNsaW50IGVxZXEgOiB0cnVlICovXG4gICAgICAgICAgICAgICAgciA9IChcbiAgICAgICAgICAgICAgICAgIChzID09PSAncmVnZXgnKSA/IChtdGVzdC50ZXN0KCBtdmFsdWUgKSkgOiAocyA9PT0gJ2x0JyB8fCBzID09PSBsdClcbiAgICAgICAgICAgICAgICAgID8gKG12YWx1ZSA8IG10ZXN0KSAgOiAocyA9PT0gJ2d0JyB8fCBzID09PSBndClcbiAgICAgICAgICAgICAgICAgID8gKG12YWx1ZSA+IG10ZXN0KSAgOiAocyA9PT0gJ2x0ZScgfHwgcyA9PT0gbHRlcSlcbiAgICAgICAgICAgICAgICAgID8gKG12YWx1ZSA8PSBtdGVzdCkgOiAocyA9PT0gJ2d0ZScgfHwgcyA9PT0gZ3RlcSlcbiAgICAgICAgICAgICAgICAgID8gKG12YWx1ZSA+PSBtdGVzdCkgOiAocyA9PT0gJ2xlZnQnKVxuICAgICAgICAgICAgICAgICAgPyAobXZhbHVlLmluZGV4T2YoIG10ZXN0ICkgPT09IDApIDogKHMgPT09ICdsZWZ0bm9jYXNlJylcbiAgICAgICAgICAgICAgICAgID8gKG12YWx1ZS50b0xvd2VyQ2FzZSgpLmluZGV4T2YoIG10ZXN0LnRvTG93ZXJDYXNlKCkgKVxuICAgICAgICAgICAgICAgICAgICA9PT0gMCkgOiAocyA9PT0gJ3JpZ2h0JylcbiAgICAgICAgICAgICAgICAgID8gKG12YWx1ZS5zdWJzdHJpbmcoIChtdmFsdWUubGVuZ3RoIC0gbXRlc3QubGVuZ3RoKSApXG4gICAgICAgICAgICAgICAgICAgID09PSBtdGVzdCkgOiAocyA9PT0gJ3JpZ2h0bm9jYXNlJylcbiAgICAgICAgICAgICAgICAgID8gKG12YWx1ZS50b0xvd2VyQ2FzZSgpLnN1YnN0cmluZyhcbiAgICAgICAgICAgICAgICAgICAgKG12YWx1ZS5sZW5ndGggLSBtdGVzdC5sZW5ndGgpICkgPT09IG10ZXN0LnRvTG93ZXJDYXNlKCkpXG4gICAgICAgICAgICAgICAgICAgIDogKHMgPT09ICdsaWtlJylcbiAgICAgICAgICAgICAgICAgID8gKG12YWx1ZS5pbmRleE9mKCBtdGVzdCApID49IDApIDogKHMgPT09ICdsaWtlbm9jYXNlJylcbiAgICAgICAgICAgICAgICAgID8gKG12YWx1ZS50b0xvd2VyQ2FzZSgpLmluZGV4T2YobXRlc3QudG9Mb3dlckNhc2UoKSkgPj0gMClcbiAgICAgICAgICAgICAgICAgICAgOiAocyA9PT0gZXFlcWVxIHx8IHMgPT09ICdpcycpXG4gICAgICAgICAgICAgICAgICA/IChtdmFsdWUgPT09ICBtdGVzdCkgOiAocyA9PT0gZXFlcSlcbiAgICAgICAgICAgICAgICAgID8gKG12YWx1ZSA9PSBtdGVzdCkgOiAocyA9PT0gYmFuZ2VxZXEpXG4gICAgICAgICAgICAgICAgICA/IChtdmFsdWUgIT09ICBtdGVzdCkgOiAocyA9PT0gYmFuZ2VxKVxuICAgICAgICAgICAgICAgICAgPyAobXZhbHVlICE9IG10ZXN0KSA6IChzID09PSAnaXNub2Nhc2UnKVxuICAgICAgICAgICAgICAgICAgPyAobXZhbHVlLnRvTG93ZXJDYXNlXG4gICAgICAgICAgICAgICAgICAgID8gbXZhbHVlLnRvTG93ZXJDYXNlKCkgPT09IG10ZXN0LnRvTG93ZXJDYXNlKClcbiAgICAgICAgICAgICAgICAgICAgICA6IG12YWx1ZSA9PT0gbXRlc3QpIDogKHMgPT09ICdoYXMnKVxuICAgICAgICAgICAgICAgICAgPyAoVC5oYXMoIG12YWx1ZSwgbXRlc3QgKSkgOiAocyA9PT0gJ2hhc2FsbCcpXG4gICAgICAgICAgICAgICAgICA/IChULmhhc0FsbCggbXZhbHVlLCBtdGVzdCApKSA6IChzID09PSAnY29udGFpbnMnKVxuICAgICAgICAgICAgICAgICAgPyAoVEFGRlkuaXNBcnJheShtdmFsdWUpICYmIG12YWx1ZS5pbmRleE9mKG10ZXN0KSA+IC0xKSA6IChcbiAgICAgICAgICAgICAgICAgICAgcy5pbmRleE9mKCAnaXMnICkgPT09IC0xXG4gICAgICAgICAgICAgICAgICAgICAgJiYgIVRBRkZZLmlzTnVsbCggbXZhbHVlIClcbiAgICAgICAgICAgICAgICAgICAgICAmJiAhVEFGRlkuaXNVbmRlZmluZWQoIG12YWx1ZSApXG4gICAgICAgICAgICAgICAgICAgICAgJiYgIVRBRkZZLmlzT2JqZWN0KCBtdGVzdCApXG4gICAgICAgICAgICAgICAgICAgICAgJiYgIVRBRkZZLmlzQXJyYXkoIG10ZXN0IClcbiAgICAgICAgICAgICAgICAgICAgKVxuICAgICAgICAgICAgICAgICAgPyAobXRlc3QgPT09IG12YWx1ZVtzXSlcbiAgICAgICAgICAgICAgICAgICAgOiAoVFtzXSAmJiBULmlzRnVuY3Rpb24oIFRbc10gKVxuICAgICAgICAgICAgICAgICAgICAmJiBzLmluZGV4T2YoICdpcycgKSA9PT0gMClcbiAgICAgICAgICAgICAgICAgID8gVFtzXSggbXZhbHVlICkgPT09IG10ZXN0XG4gICAgICAgICAgICAgICAgICAgIDogKFRbc10gJiYgVC5pc0Z1bmN0aW9uKCBUW3NdICkpXG4gICAgICAgICAgICAgICAgICA/IFRbc10oIG12YWx1ZSwgbXRlc3QgKSA6IChmYWxzZSlcbiAgICAgICAgICAgICAgICApO1xuICAgICAgICAgICAgICAgIC8qanNsaW50IGVxZXEgOiBmYWxzZSAqL1xuICAgICAgICAgICAgICAgIHIgPSAociAmJiAhc3UpID8gZmFsc2UgOiAoIXIgJiYgIXN1KSA/IHRydWUgOiByO1xuXG4gICAgICAgICAgICAgICAgcmV0dXJuIHI7XG4gICAgICAgICAgICAgIH07XG4gICAgICAgICAgICAgIGMucHVzaCggbWF0Y2hGdW5jICk7XG5cbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgLy8gaWYgb25seSBvbmUgZmlsdGVyIGluIHRoZSBjb2xsZWN0aW9uIHB1c2ggaXQgb250byB0aGUgZmlsdGVyIGxpc3Qgd2l0aG91dCB0aGUgYXJyYXlcbiAgICAgICAgICAgIGlmICggYy5sZW5ndGggPT09IDEgKXtcblxuICAgICAgICAgICAgICBuZi5wdXNoKCBjWzBdICk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgLy8gZWxzZSBidWlsZCBhIGZ1bmN0aW9uIHRvIGxvb3Agb3ZlciBhbGwgdGhlIGZpbHRlcnMgYW5kIHJldHVybiB0cnVlIG9ubHkgaWYgQUxMIG1hdGNoXG4gICAgICAgICAgICAgIC8vIHRoaXMgaXMgYSBsb2dpY2FsIEFORFxuICAgICAgICAgICAgICBuZi5wdXNoKCBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgdmFyIHRoYXQgPSB0aGlzLCBtYXRjaCA9IGZhbHNlO1xuICAgICAgICAgICAgICAgIGVhY2goIGMsIGZ1bmN0aW9uICggZiApIHtcbiAgICAgICAgICAgICAgICAgIGlmICggZi5hcHBseSggdGhhdCApICl7XG4gICAgICAgICAgICAgICAgICAgIG1hdGNoID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICByZXR1cm4gbWF0Y2g7XG4gICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH0pO1xuICAgICAgICB9KTtcbiAgICAgICAgLy8gZmluYWxseSByZXR1cm4gYSBzaW5nbGUgZnVuY3Rpb24gdGhhdCB3cmFwcyBhbGwgdGhlIG90aGVyIGZ1bmN0aW9ucyBhbmQgd2lsbCBydW4gYSBxdWVyeVxuICAgICAgICAvLyB3aGVyZSBhbGwgZnVuY3Rpb25zIGhhdmUgdG8gcmV0dXJuIHRydWUgZm9yIGEgcmVjb3JkIHRvIGFwcGVhciBpbiBhIHF1ZXJ5IHJlc3VsdFxuICAgICAgICBmID0gZnVuY3Rpb24gKCkge1xuICAgICAgICAgIHZhciB0aGF0ID0gdGhpcywgbWF0Y2ggPSB0cnVlO1xuICAgICAgICAgIC8vIGZhc3RlciBpZiBsZXNzIHRoYW4gIDQgZnVuY3Rpb25zXG4gICAgICAgICAgbWF0Y2ggPSAobmYubGVuZ3RoID09PSAxICYmICFuZlswXS5hcHBseSggdGhhdCApKSA/IGZhbHNlIDpcbiAgICAgICAgICAgIChuZi5sZW5ndGggPT09IDIgJiZcbiAgICAgICAgICAgICAgKCFuZlswXS5hcHBseSggdGhhdCApIHx8ICFuZlsxXS5hcHBseSggdGhhdCApKSkgPyBmYWxzZSA6XG4gICAgICAgICAgICAgIChuZi5sZW5ndGggPT09IDMgJiZcbiAgICAgICAgICAgICAgICAoIW5mWzBdLmFwcGx5KCB0aGF0ICkgfHwgIW5mWzFdLmFwcGx5KCB0aGF0ICkgfHxcbiAgICAgICAgICAgICAgICAgICFuZlsyXS5hcHBseSggdGhhdCApKSkgPyBmYWxzZSA6XG4gICAgICAgICAgICAgICAgKG5mLmxlbmd0aCA9PT0gNCAmJlxuICAgICAgICAgICAgICAgICAgKCFuZlswXS5hcHBseSggdGhhdCApIHx8ICFuZlsxXS5hcHBseSggdGhhdCApIHx8XG4gICAgICAgICAgICAgICAgICAgICFuZlsyXS5hcHBseSggdGhhdCApIHx8ICFuZlszXS5hcHBseSggdGhhdCApKSkgPyBmYWxzZVxuICAgICAgICAgICAgICAgICAgOiB0cnVlO1xuICAgICAgICAgIGlmICggbmYubGVuZ3RoID4gNCApe1xuICAgICAgICAgICAgZWFjaCggbmYsIGZ1bmN0aW9uICggZiApIHtcbiAgICAgICAgICAgICAgaWYgKCAhcnVuRmlsdGVycyggdGhhdCwgZiApICl7XG4gICAgICAgICAgICAgICAgbWF0Y2ggPSBmYWxzZTtcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgfVxuICAgICAgICAgIHJldHVybiBtYXRjaDtcbiAgICAgICAgfTtcbiAgICAgICAgcmV0dXJuIGY7XG4gICAgICB9XG5cbiAgICAgIC8vIGlmIGZ1bmN0aW9uXG4gICAgICBpZiAoIFQuaXNGdW5jdGlvbiggZiApICl7XG4gICAgICAgIHJldHVybiBmO1xuICAgICAgfVxuICAgIH07XG5cbiAgICBvcmRlckJ5Q29sID0gZnVuY3Rpb24gKCBhciwgbyApIHtcbiAgICAgIC8vICoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKipcbiAgICAgIC8vICpcbiAgICAgIC8vICogVGFrZXM6IHRha2VzIGFuIGFycmF5IGFuZCBhIHNvcnQgb2JqZWN0XG4gICAgICAvLyAqIFJldHVybnM6IHRoZSBhcnJheSBzb3J0ZWRcbiAgICAgIC8vICogUHVycG9zZTogQWNjZXB0IGZpbHRlcnMgc3VjaCBhcyBcIltjb2xdLCBbY29sMl1cIiBvciBcIltjb2xdIGRlc2NcIiBhbmQgc29ydCBvbiB0aG9zZSBjb2x1bW5zXG4gICAgICAvLyAqXG4gICAgICAvLyAqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqXG5cbiAgICAgIHZhciBzb3J0RnVuYyA9IGZ1bmN0aW9uICggYSwgYiApIHtcbiAgICAgICAgLy8gZnVuY3Rpb24gdG8gcGFzcyB0byB0aGUgbmF0aXZlIGFycmF5LnNvcnQgdG8gc29ydCBhbiBhcnJheVxuICAgICAgICB2YXIgciA9IDA7XG5cbiAgICAgICAgVC5lYWNoKCBvLCBmdW5jdGlvbiAoIHNkICkge1xuICAgICAgICAgIC8vIGxvb3Agb3ZlciB0aGUgc29ydCBpbnN0cnVjdGlvbnNcbiAgICAgICAgICAvLyBnZXQgdGhlIGNvbHVtbiBuYW1lXG4gICAgICAgICAgdmFyIG8sIGNvbCwgZGlyLCBjLCBkO1xuICAgICAgICAgIG8gPSBzZC5zcGxpdCggJyAnICk7XG4gICAgICAgICAgY29sID0gb1swXTtcblxuICAgICAgICAgIC8vIGdldCB0aGUgZGlyZWN0aW9uXG4gICAgICAgICAgZGlyID0gKG8ubGVuZ3RoID09PSAxKSA/IFwibG9naWNhbFwiIDogb1sxXTtcblxuXG4gICAgICAgICAgaWYgKCBkaXIgPT09ICdsb2dpY2FsJyApe1xuICAgICAgICAgICAgLy8gaWYgZGlyIGlzIGxvZ2ljYWwgdGhhbiBncmFiIHRoZSBjaGFybnVtIGFycmF5cyBmb3IgdGhlIHR3byB2YWx1ZXMgd2UgYXJlIGxvb2tpbmcgYXRcbiAgICAgICAgICAgIGMgPSBudW1jaGFyc3BsaXQoIGFbY29sXSApO1xuICAgICAgICAgICAgZCA9IG51bWNoYXJzcGxpdCggYltjb2xdICk7XG4gICAgICAgICAgICAvLyBsb29wIG92ZXIgdGhlIGNoYXJudW1hcnJheXMgdW50aWwgb25lIHZhbHVlIGlzIGhpZ2hlciB0aGFuIHRoZSBvdGhlclxuICAgICAgICAgICAgVC5lYWNoKCAoYy5sZW5ndGggPD0gZC5sZW5ndGgpID8gYyA6IGQsIGZ1bmN0aW9uICggeCwgaSApIHtcbiAgICAgICAgICAgICAgaWYgKCBjW2ldIDwgZFtpXSApe1xuICAgICAgICAgICAgICAgIHIgPSAtMTtcbiAgICAgICAgICAgICAgICByZXR1cm4gVEFGRlkuRVhJVDtcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICBlbHNlIGlmICggY1tpXSA+IGRbaV0gKXtcbiAgICAgICAgICAgICAgICByID0gMTtcbiAgICAgICAgICAgICAgICByZXR1cm4gVEFGRlkuRVhJVDtcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSApO1xuICAgICAgICAgIH1cbiAgICAgICAgICBlbHNlIGlmICggZGlyID09PSAnbG9naWNhbGRlc2MnICl7XG4gICAgICAgICAgICAvLyBpZiBsb2dpY2FsZGVzYyB0aGFuIGdyYWIgdGhlIGNoYXJudW0gYXJyYXlzIGZvciB0aGUgdHdvIHZhbHVlcyB3ZSBhcmUgbG9va2luZyBhdFxuICAgICAgICAgICAgYyA9IG51bWNoYXJzcGxpdCggYVtjb2xdICk7XG4gICAgICAgICAgICBkID0gbnVtY2hhcnNwbGl0KCBiW2NvbF0gKTtcbiAgICAgICAgICAgIC8vIGxvb3Agb3ZlciB0aGUgY2hhcm51bWFycmF5cyB1bnRpbCBvbmUgdmFsdWUgaXMgbG93ZXIgdGhhbiB0aGUgb3RoZXJcbiAgICAgICAgICAgIFQuZWFjaCggKGMubGVuZ3RoIDw9IGQubGVuZ3RoKSA/IGMgOiBkLCBmdW5jdGlvbiAoIHgsIGkgKSB7XG4gICAgICAgICAgICAgIGlmICggY1tpXSA+IGRbaV0gKXtcbiAgICAgICAgICAgICAgICByID0gLTE7XG4gICAgICAgICAgICAgICAgcmV0dXJuIFRBRkZZLkVYSVQ7XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgZWxzZSBpZiAoIGNbaV0gPCBkW2ldICl7XG4gICAgICAgICAgICAgICAgciA9IDE7XG4gICAgICAgICAgICAgICAgcmV0dXJuIFRBRkZZLkVYSVQ7XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0gKTtcbiAgICAgICAgICB9XG4gICAgICAgICAgZWxzZSBpZiAoIGRpciA9PT0gJ2FzZWMnICYmIGFbY29sXSA8IGJbY29sXSApe1xuICAgICAgICAgICAgLy8gaWYgYXNlYyAtIGRlZmF1bHQgLSBjaGVjayB0byBzZWUgd2hpY2ggaXMgaGlnaGVyXG4gICAgICAgICAgICByID0gLTE7XG4gICAgICAgICAgICByZXR1cm4gVC5FWElUO1xuICAgICAgICAgIH1cbiAgICAgICAgICBlbHNlIGlmICggZGlyID09PSAnYXNlYycgJiYgYVtjb2xdID4gYltjb2xdICl7XG4gICAgICAgICAgICAvLyBpZiBhc2VjIC0gZGVmYXVsdCAtIGNoZWNrIHRvIHNlZSB3aGljaCBpcyBoaWdoZXJcbiAgICAgICAgICAgIHIgPSAxO1xuICAgICAgICAgICAgcmV0dXJuIFQuRVhJVDtcbiAgICAgICAgICB9XG4gICAgICAgICAgZWxzZSBpZiAoIGRpciA9PT0gJ2Rlc2MnICYmIGFbY29sXSA+IGJbY29sXSApe1xuICAgICAgICAgICAgLy8gaWYgZGVzYyBjaGVjayB0byBzZWUgd2hpY2ggaXMgbG93ZXJcbiAgICAgICAgICAgIHIgPSAtMTtcbiAgICAgICAgICAgIHJldHVybiBULkVYSVQ7XG5cbiAgICAgICAgICB9XG4gICAgICAgICAgZWxzZSBpZiAoIGRpciA9PT0gJ2Rlc2MnICYmIGFbY29sXSA8IGJbY29sXSApe1xuICAgICAgICAgICAgLy8gaWYgZGVzYyBjaGVjayB0byBzZWUgd2hpY2ggaXMgbG93ZXJcbiAgICAgICAgICAgIHIgPSAxO1xuICAgICAgICAgICAgcmV0dXJuIFQuRVhJVDtcblxuICAgICAgICAgIH1cbiAgICAgICAgICAvLyBpZiByIGlzIHN0aWxsIDAgYW5kIHdlIGFyZSBkb2luZyBhIGxvZ2ljYWwgc29ydCB0aGFuIGxvb2sgdG8gc2VlIGlmIG9uZSBhcnJheSBpcyBsb25nZXIgdGhhbiB0aGUgb3RoZXJcbiAgICAgICAgICBpZiAoIHIgPT09IDAgJiYgZGlyID09PSAnbG9naWNhbCcgJiYgYy5sZW5ndGggPCBkLmxlbmd0aCApe1xuICAgICAgICAgICAgciA9IC0xO1xuICAgICAgICAgIH1cbiAgICAgICAgICBlbHNlIGlmICggciA9PT0gMCAmJiBkaXIgPT09ICdsb2dpY2FsJyAmJiBjLmxlbmd0aCA+IGQubGVuZ3RoICl7XG4gICAgICAgICAgICByID0gMTtcbiAgICAgICAgICB9XG4gICAgICAgICAgZWxzZSBpZiAoIHIgPT09IDAgJiYgZGlyID09PSAnbG9naWNhbGRlc2MnICYmIGMubGVuZ3RoID4gZC5sZW5ndGggKXtcbiAgICAgICAgICAgIHIgPSAtMTtcbiAgICAgICAgICB9XG4gICAgICAgICAgZWxzZSBpZiAoIHIgPT09IDAgJiYgZGlyID09PSAnbG9naWNhbGRlc2MnICYmIGMubGVuZ3RoIDwgZC5sZW5ndGggKXtcbiAgICAgICAgICAgIHIgPSAxO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIGlmICggciAhPT0gMCApe1xuICAgICAgICAgICAgcmV0dXJuIFQuRVhJVDtcbiAgICAgICAgICB9XG5cblxuICAgICAgICB9ICk7XG4gICAgICAgIHJldHVybiByO1xuICAgICAgfTtcbiAgICAgIC8vIGNhbGwgdGhlIHNvcnQgZnVuY3Rpb24gYW5kIHJldHVybiB0aGUgbmV3bHkgc29ydGVkIGFycmF5XG4gICAgICByZXR1cm4gKGFyICYmIGFyLnB1c2gpID8gYXIuc29ydCggc29ydEZ1bmMgKSA6IGFyO1xuXG5cbiAgICB9O1xuXG4gICAgLy8gKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKlxuICAgIC8vICpcbiAgICAvLyAqIFRha2VzOiBhIHN0cmluZyBjb250YWluaW5nIG51bWJlcnMgYW5kIGxldHRlcnMgYW5kIHR1cm4gaXQgaW50byBhbiBhcnJheVxuICAgIC8vICogUmV0dXJuczogcmV0dXJuIGFuIGFycmF5IG9mIG51bWJlcnMgYW5kIGxldHRlcnNcbiAgICAvLyAqIFB1cnBvc2U6IFVzZWQgZm9yIGxvZ2ljYWwgc29ydGluZy4gU3RyaW5nIEV4YW1wbGU6IDEyQUJDIHJlc3VsdHM6IFsxMiwnQUJDJ11cbiAgICAvLyAqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqIFxuICAgIChmdW5jdGlvbiAoKSB7XG4gICAgICAvLyBjcmVhdGVzIGEgY2FjaGUgZm9yIG51bWNoYXIgY29udmVyc2lvbnNcbiAgICAgIHZhciBjYWNoZSA9IHt9LCBjYWNoY291bnRlciA9IDA7XG4gICAgICAvLyBjcmVhdGVzIHRoZSBudW1jaGFyc3BsaXQgZnVuY3Rpb25cbiAgICAgIG51bWNoYXJzcGxpdCA9IGZ1bmN0aW9uICggdGhpbmcgKSB7XG4gICAgICAgIC8vIGlmIG92ZXIgMTAwMCBpdGVtcyBleGlzdCBpbiB0aGUgY2FjaGUsIGNsZWFyIGl0IGFuZCBzdGFydCBvdmVyXG4gICAgICAgIGlmICggY2FjaGNvdW50ZXIgPiBjbWF4ICl7XG4gICAgICAgICAgY2FjaGUgPSB7fTtcbiAgICAgICAgICBjYWNoY291bnRlciA9IDA7XG4gICAgICAgIH1cblxuICAgICAgICAvLyBpZiBhIGNhY2hlIGNhbiBiZSBmb3VuZCBmb3IgYSBudW1jaGFyIHRoZW4gcmV0dXJuIGl0cyBhcnJheSB2YWx1ZVxuICAgICAgICByZXR1cm4gY2FjaGVbJ18nICsgdGhpbmddIHx8IChmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgLy8gb3RoZXJ3aXNlIGRvIHRoZSBjb252ZXJzaW9uXG4gICAgICAgICAgLy8gbWFrZSBzdXJlIGl0IGlzIGEgc3RyaW5nIGFuZCBzZXR1cCBzbyBvdGhlciB2YXJpYWJsZXNcbiAgICAgICAgICB2YXIgbnRoaW5nID0gU3RyaW5nKCB0aGluZyApLFxuICAgICAgICAgICAgbmEgPSBbXSxcbiAgICAgICAgICAgIHJ2ID0gJ18nLFxuICAgICAgICAgICAgcnQgPSAnJyxcbiAgICAgICAgICAgIHgsIHh4LCBjO1xuXG4gICAgICAgICAgLy8gbG9vcCBvdmVyIHRoZSBzdHJpbmcgY2hhciBieSBjaGFyXG4gICAgICAgICAgZm9yICggeCA9IDAsIHh4ID0gbnRoaW5nLmxlbmd0aDsgeCA8IHh4OyB4KysgKXtcbiAgICAgICAgICAgIC8vIHRha2UgdGhlIGNoYXIgYXQgZWFjaCBsb2NhdGlvblxuICAgICAgICAgICAgYyA9IG50aGluZy5jaGFyQ29kZUF0KCB4ICk7XG4gICAgICAgICAgICAvLyBjaGVjayB0byBzZWUgaWYgaXQgaXMgYSB2YWxpZCBudW1iZXIgY2hhciBhbmQgYXBwZW5kIGl0IHRvIHRoZSBhcnJheS5cbiAgICAgICAgICAgIC8vIGlmIGxhc3QgY2hhciB3YXMgYSBzdHJpbmcgcHVzaCB0aGUgc3RyaW5nIHRvIHRoZSBjaGFybnVtIGFycmF5XG4gICAgICAgICAgICBpZiAoICggYyA+PSA0OCAmJiBjIDw9IDU3ICkgfHwgYyA9PT0gNDYgKXtcbiAgICAgICAgICAgICAgaWYgKCBydCAhPT0gJ24nICl7XG4gICAgICAgICAgICAgICAgcnQgPSAnbic7XG4gICAgICAgICAgICAgICAgbmEucHVzaCggcnYudG9Mb3dlckNhc2UoKSApO1xuICAgICAgICAgICAgICAgIHJ2ID0gJyc7XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgcnYgPSBydiArIG50aGluZy5jaGFyQXQoIHggKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAvLyBjaGVjayB0byBzZWUgaWYgaXQgaXMgYSB2YWxpZCBzdHJpbmcgY2hhciBhbmQgYXBwZW5kIHRvIHN0cmluZ1xuICAgICAgICAgICAgICAvLyBpZiBsYXN0IGNoYXIgd2FzIGEgbnVtYmVyIHB1c2ggdGhlIHdob2xlIG51bWJlciB0byB0aGUgY2hhcm51bSBhcnJheVxuICAgICAgICAgICAgICBpZiAoIHJ0ICE9PSAncycgKXtcbiAgICAgICAgICAgICAgICBydCA9ICdzJztcbiAgICAgICAgICAgICAgICBuYS5wdXNoKCBwYXJzZUZsb2F0KCBydiApICk7XG4gICAgICAgICAgICAgICAgcnYgPSAnJztcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICBydiA9IHJ2ICsgbnRoaW5nLmNoYXJBdCggeCApO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cbiAgICAgICAgICAvLyBvbmNlIGRvbmUsIHB1c2ggdGhlIGxhc3QgdmFsdWUgdG8gdGhlIGNoYXJudW0gYXJyYXkgYW5kIHJlbW92ZSB0aGUgZmlyc3QgdW5lZWRlZCBpdGVtXG4gICAgICAgICAgbmEucHVzaCggKHJ0ID09PSAnbicpID8gcGFyc2VGbG9hdCggcnYgKSA6IHJ2LnRvTG93ZXJDYXNlKCkgKTtcbiAgICAgICAgICBuYS5zaGlmdCgpO1xuICAgICAgICAgIC8vIGFkZCB0byBjYWNoZVxuICAgICAgICAgIGNhY2hlWydfJyArIHRoaW5nXSA9IG5hO1xuICAgICAgICAgIGNhY2hjb3VudGVyKys7XG4gICAgICAgICAgLy8gcmV0dXJuIGNoYXJudW0gYXJyYXlcbiAgICAgICAgICByZXR1cm4gbmE7XG4gICAgICAgIH0oKSk7XG4gICAgICB9O1xuICAgIH0oKSk7XG5cbiAgICAvLyAqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqXG4gICAgLy8gKlxuICAgIC8vICogUnVucyBhIHF1ZXJ5XG4gICAgLy8gKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKiBcblxuXG4gICAgcnVuID0gZnVuY3Rpb24gKCkge1xuICAgICAgdGhpcy5jb250ZXh0KCB7XG4gICAgICAgIHJlc3VsdHMgOiB0aGlzLmdldERCSSgpLnF1ZXJ5KCB0aGlzLmNvbnRleHQoKSApXG4gICAgICB9KTtcblxuICAgIH07XG5cbiAgICBBUEkuZXh0ZW5kKCAnZmlsdGVyJywgZnVuY3Rpb24gKCkge1xuICAgICAgLy8gKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKlxuICAgICAgLy8gKlxuICAgICAgLy8gKiBUYWtlczogdGFrZXMgdW5saW1pdGVkIGZpbHRlciBvYmplY3RzIGFzIGFyZ3VtZW50c1xuICAgICAgLy8gKiBSZXR1cm5zOiBtZXRob2QgY29sbGVjdGlvblxuICAgICAgLy8gKiBQdXJwb3NlOiBUYWtlIGZpbHRlcnMgYXMgb2JqZWN0cyBhbmQgY2FjaGUgZnVuY3Rpb25zIGZvciBsYXRlciBsb29rdXAgd2hlbiBhIHF1ZXJ5IGlzIHJ1blxuICAgICAgLy8gKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKiBcbiAgICAgIHZhclxuICAgICAgICBuYyA9IFRBRkZZLm1lcmdlT2JqKCB0aGlzLmNvbnRleHQoKSwgeyBydW4gOiBudWxsIH0gKSxcbiAgICAgICAgbnEgPSBbXVxuICAgICAgO1xuICAgICAgZWFjaCggbmMucSwgZnVuY3Rpb24gKCB2ICkge1xuICAgICAgICBucS5wdXNoKCB2ICk7XG4gICAgICB9KTtcbiAgICAgIG5jLnEgPSBucTtcbiAgICAgIC8vIEhhZG5sZSBwYXNzaW5nIG9mIF9fX0lEIG9yIGEgcmVjb3JkIG9uIGxvb2t1cC5cbiAgICAgIGVhY2goIGFyZ3VtZW50cywgZnVuY3Rpb24gKCBmICkge1xuICAgICAgICBuYy5xLnB1c2goIHJldHVybkZpbHRlciggZiApICk7XG4gICAgICAgIG5jLmZpbHRlclJhdy5wdXNoKCBmICk7XG4gICAgICB9KTtcblxuICAgICAgcmV0dXJuIHRoaXMuZ2V0cm9vdCggbmMgKTtcbiAgICB9KTtcblxuICAgIEFQSS5leHRlbmQoICdvcmRlcicsIGZ1bmN0aW9uICggbyApIHtcbiAgICAgIC8vICoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKipcbiAgICAgIC8vICpcbiAgICAgIC8vICogUHVycG9zZTogdGFrZXMgYSBzdHJpbmcgYW5kIGNyZWF0ZXMgYW4gYXJyYXkgb2Ygb3JkZXIgaW5zdHJ1Y3Rpb25zIHRvIGJlIHVzZWQgd2l0aCBhIHF1ZXJ5XG4gICAgICAvLyAqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqXG5cbiAgICAgIG8gPSBvLnNwbGl0KCAnLCcgKTtcbiAgICAgIHZhciB4ID0gW10sIG5jO1xuXG4gICAgICBlYWNoKCBvLCBmdW5jdGlvbiAoIHIgKSB7XG4gICAgICAgIHgucHVzaCggci5yZXBsYWNlKCAvXlxccyovLCAnJyApLnJlcGxhY2UoIC9cXHMqJC8sICcnICkgKTtcbiAgICAgIH0pO1xuXG4gICAgICBuYyA9IFRBRkZZLm1lcmdlT2JqKCB0aGlzLmNvbnRleHQoKSwge3NvcnQgOiBudWxsfSApO1xuICAgICAgbmMub3JkZXIgPSB4O1xuXG4gICAgICByZXR1cm4gdGhpcy5nZXRyb290KCBuYyApO1xuICAgIH0pO1xuXG4gICAgQVBJLmV4dGVuZCggJ2xpbWl0JywgZnVuY3Rpb24gKCBuICkge1xuICAgICAgLy8gKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKlxuICAgICAgLy8gKlxuICAgICAgLy8gKiBQdXJwb3NlOiB0YWtlcyBhIGxpbWl0IG51bWJlciB0byBsaW1pdCB0aGUgbnVtYmVyIG9mIHJvd3MgcmV0dXJuZWQgYnkgYSBxdWVyeS4gV2lsbCB1cGRhdGUgdGhlIHJlc3VsdHNcbiAgICAgIC8vICogb2YgYSBxdWVyeVxuICAgICAgLy8gKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKiBcbiAgICAgIHZhciBuYyA9IFRBRkZZLm1lcmdlT2JqKCB0aGlzLmNvbnRleHQoKSwge30pLFxuICAgICAgICBsaW1pdGVkcmVzdWx0c1xuICAgICAgICA7XG5cbiAgICAgIG5jLmxpbWl0ID0gbjtcblxuICAgICAgaWYgKCBuYy5ydW4gJiYgbmMuc29ydCApe1xuICAgICAgICBsaW1pdGVkcmVzdWx0cyA9IFtdO1xuICAgICAgICBlYWNoKCBuYy5yZXN1bHRzLCBmdW5jdGlvbiAoIGksIHggKSB7XG4gICAgICAgICAgaWYgKCAoeCArIDEpID4gbiApe1xuICAgICAgICAgICAgcmV0dXJuIFRBRkZZLkVYSVQ7XG4gICAgICAgICAgfVxuICAgICAgICAgIGxpbWl0ZWRyZXN1bHRzLnB1c2goIGkgKTtcbiAgICAgICAgfSk7XG4gICAgICAgIG5jLnJlc3VsdHMgPSBsaW1pdGVkcmVzdWx0cztcbiAgICAgIH1cblxuICAgICAgcmV0dXJuIHRoaXMuZ2V0cm9vdCggbmMgKTtcbiAgICB9KTtcblxuICAgIEFQSS5leHRlbmQoICdzdGFydCcsIGZ1bmN0aW9uICggbiApIHtcbiAgICAgIC8vICoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKipcbiAgICAgIC8vICpcbiAgICAgIC8vICogUHVycG9zZTogdGFrZXMgYSBsaW1pdCBudW1iZXIgdG8gbGltaXQgdGhlIG51bWJlciBvZiByb3dzIHJldHVybmVkIGJ5IGEgcXVlcnkuIFdpbGwgdXBkYXRlIHRoZSByZXN1bHRzXG4gICAgICAvLyAqIG9mIGEgcXVlcnlcbiAgICAgIC8vICoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKiogXG4gICAgICB2YXIgbmMgPSBUQUZGWS5tZXJnZU9iaiggdGhpcy5jb250ZXh0KCksIHt9ICksXG4gICAgICAgIGxpbWl0ZWRyZXN1bHRzXG4gICAgICAgIDtcblxuICAgICAgbmMuc3RhcnQgPSBuO1xuXG4gICAgICBpZiAoIG5jLnJ1biAmJiBuYy5zb3J0ICYmICFuYy5saW1pdCApe1xuICAgICAgICBsaW1pdGVkcmVzdWx0cyA9IFtdO1xuICAgICAgICBlYWNoKCBuYy5yZXN1bHRzLCBmdW5jdGlvbiAoIGksIHggKSB7XG4gICAgICAgICAgaWYgKCAoeCArIDEpID4gbiApe1xuICAgICAgICAgICAgbGltaXRlZHJlc3VsdHMucHVzaCggaSApO1xuICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgICAgIG5jLnJlc3VsdHMgPSBsaW1pdGVkcmVzdWx0cztcbiAgICAgIH1cbiAgICAgIGVsc2Uge1xuICAgICAgICBuYyA9IFRBRkZZLm1lcmdlT2JqKCB0aGlzLmNvbnRleHQoKSwge3J1biA6IG51bGwsIHN0YXJ0IDogbn0gKTtcbiAgICAgIH1cblxuICAgICAgcmV0dXJuIHRoaXMuZ2V0cm9vdCggbmMgKTtcbiAgICB9KTtcblxuICAgIEFQSS5leHRlbmQoICd1cGRhdGUnLCBmdW5jdGlvbiAoIGFyZzAsIGFyZzEsIGFyZzIgKSB7XG4gICAgICAvLyAqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqXG4gICAgICAvLyAqXG4gICAgICAvLyAqIFRha2VzOiBhIG9iamVjdCBhbmQgcGFzc2VzIGl0IG9mZiBEQkkgdXBkYXRlIG1ldGhvZCBmb3IgYWxsIG1hdGNoZWQgcmVjb3Jkc1xuICAgICAgLy8gKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKiBcbiAgICAgIHZhciBydW5FdmVudCA9IHRydWUsIG8gPSB7fSwgYXJncyA9IGFyZ3VtZW50cywgdGhhdDtcbiAgICAgIGlmICggVEFGRlkuaXNTdHJpbmcoIGFyZzAgKSAmJlxuICAgICAgICAoYXJndW1lbnRzLmxlbmd0aCA9PT0gMiB8fCBhcmd1bWVudHMubGVuZ3RoID09PSAzKSApXG4gICAgICB7XG4gICAgICAgIG9bYXJnMF0gPSBhcmcxO1xuICAgICAgICBpZiAoIGFyZ3VtZW50cy5sZW5ndGggPT09IDMgKXtcbiAgICAgICAgICBydW5FdmVudCA9IGFyZzI7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIGVsc2Uge1xuICAgICAgICBvID0gYXJnMDtcbiAgICAgICAgaWYgKCBhcmdzLmxlbmd0aCA9PT0gMiApe1xuICAgICAgICAgIHJ1bkV2ZW50ID0gYXJnMTtcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICB0aGF0ID0gdGhpcztcbiAgICAgIHJ1bi5jYWxsKCB0aGlzICk7XG4gICAgICBlYWNoKCB0aGlzLmNvbnRleHQoKS5yZXN1bHRzLCBmdW5jdGlvbiAoIHIgKSB7XG4gICAgICAgIHZhciBjID0gbztcbiAgICAgICAgaWYgKCBUQUZGWS5pc0Z1bmN0aW9uKCBjICkgKXtcbiAgICAgICAgICBjID0gYy5hcHBseSggVEFGRlkubWVyZ2VPYmooIHIsIHt9ICkgKTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICBpZiAoIFQuaXNGdW5jdGlvbiggYyApICl7XG4gICAgICAgICAgICBjID0gYyggVEFGRlkubWVyZ2VPYmooIHIsIHt9ICkgKTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgaWYgKCBUQUZGWS5pc09iamVjdCggYyApICl7XG4gICAgICAgICAgdGhhdC5nZXREQkkoKS51cGRhdGUoIHIuX19faWQsIGMsIHJ1bkV2ZW50ICk7XG4gICAgICAgIH1cbiAgICAgIH0pO1xuICAgICAgaWYgKCB0aGlzLmNvbnRleHQoKS5yZXN1bHRzLmxlbmd0aCApe1xuICAgICAgICB0aGlzLmNvbnRleHQoIHsgcnVuIDogbnVsbCB9KTtcbiAgICAgIH1cbiAgICAgIHJldHVybiB0aGlzO1xuICAgIH0pO1xuICAgIEFQSS5leHRlbmQoICdyZW1vdmUnLCBmdW5jdGlvbiAoIHJ1bkV2ZW50ICkge1xuICAgICAgLy8gKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKlxuICAgICAgLy8gKlxuICAgICAgLy8gKiBQdXJwb3NlOiByZW1vdmVzIHJlY29yZHMgZnJvbSB0aGUgREIgdmlhIHRoZSByZW1vdmUgYW5kIHJlbW92ZUNvbW1pdCBEQkkgbWV0aG9kc1xuICAgICAgLy8gKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKiBcbiAgICAgIHZhciB0aGF0ID0gdGhpcywgYyA9IDA7XG4gICAgICBydW4uY2FsbCggdGhpcyApO1xuICAgICAgZWFjaCggdGhpcy5jb250ZXh0KCkucmVzdWx0cywgZnVuY3Rpb24gKCByICkge1xuICAgICAgICB0aGF0LmdldERCSSgpLnJlbW92ZSggci5fX19pZCApO1xuICAgICAgICBjKys7XG4gICAgICB9KTtcbiAgICAgIGlmICggdGhpcy5jb250ZXh0KCkucmVzdWx0cy5sZW5ndGggKXtcbiAgICAgICAgdGhpcy5jb250ZXh0KCB7XG4gICAgICAgICAgcnVuIDogbnVsbFxuICAgICAgICB9KTtcbiAgICAgICAgdGhhdC5nZXREQkkoKS5yZW1vdmVDb21taXQoIHJ1bkV2ZW50ICk7XG4gICAgICB9XG5cbiAgICAgIHJldHVybiBjO1xuICAgIH0pO1xuXG5cbiAgICBBUEkuZXh0ZW5kKCAnY291bnQnLCBmdW5jdGlvbiAoKSB7XG4gICAgICAvLyAqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqXG4gICAgICAvLyAqXG4gICAgICAvLyAqIFJldHVybnM6IFRoZSBsZW5ndGggb2YgYSBxdWVyeSByZXN1bHRcbiAgICAgIC8vICoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKiogXG4gICAgICBydW4uY2FsbCggdGhpcyApO1xuICAgICAgcmV0dXJuIHRoaXMuY29udGV4dCgpLnJlc3VsdHMubGVuZ3RoO1xuICAgIH0pO1xuXG4gICAgQVBJLmV4dGVuZCggJ2NhbGxiYWNrJywgZnVuY3Rpb24gKCBmLCBkZWxheSApIHtcbiAgICAgIC8vICoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKipcbiAgICAgIC8vICpcbiAgICAgIC8vICogUmV0dXJucyBudWxsO1xuICAgICAgLy8gKiBSdW5zIGEgZnVuY3Rpb24gb24gcmV0dXJuIG9mIHJ1bi5jYWxsXG4gICAgICAvLyAqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqIFxuICAgICAgaWYgKCBmICl7XG4gICAgICAgIHZhciB0aGF0ID0gdGhpcztcbiAgICAgICAgc2V0VGltZW91dCggZnVuY3Rpb24gKCkge1xuICAgICAgICAgIHJ1bi5jYWxsKCB0aGF0ICk7XG4gICAgICAgICAgZi5jYWxsKCB0aGF0LmdldHJvb3QoIHRoYXQuY29udGV4dCgpICkgKTtcbiAgICAgICAgfSwgZGVsYXkgfHwgMCApO1xuICAgICAgfVxuXG5cbiAgICAgIHJldHVybiBudWxsO1xuICAgIH0pO1xuXG4gICAgQVBJLmV4dGVuZCggJ2dldCcsIGZ1bmN0aW9uICgpIHtcbiAgICAgIC8vICoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKipcbiAgICAgIC8vICpcbiAgICAgIC8vICogUmV0dXJuczogQW4gYXJyYXkgb2YgYWxsIG1hdGNoaW5nIHJlY29yZHNcbiAgICAgIC8vICoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKiogXG4gICAgICBydW4uY2FsbCggdGhpcyApO1xuICAgICAgcmV0dXJuIHRoaXMuY29udGV4dCgpLnJlc3VsdHM7XG4gICAgfSk7XG5cbiAgICBBUEkuZXh0ZW5kKCAnc3RyaW5naWZ5JywgZnVuY3Rpb24gKCkge1xuICAgICAgLy8gKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKlxuICAgICAgLy8gKlxuICAgICAgLy8gKiBSZXR1cm5zOiBBbiBKU09OIHN0cmluZyBvZiBhbGwgbWF0Y2hpbmcgcmVjb3Jkc1xuICAgICAgLy8gKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKiBcbiAgICAgIHJldHVybiBKU09OLnN0cmluZ2lmeSggdGhpcy5nZXQoKSApO1xuICAgIH0pO1xuICAgIEFQSS5leHRlbmQoICdmaXJzdCcsIGZ1bmN0aW9uICgpIHtcbiAgICAgIC8vICoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKipcbiAgICAgIC8vICpcbiAgICAgIC8vICogUmV0dXJuczogVGhlIGZpcnN0IG1hdGNoaW5nIHJlY29yZFxuICAgICAgLy8gKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKiBcbiAgICAgIHJ1bi5jYWxsKCB0aGlzICk7XG4gICAgICByZXR1cm4gdGhpcy5jb250ZXh0KCkucmVzdWx0c1swXSB8fCBmYWxzZTtcbiAgICB9KTtcbiAgICBBUEkuZXh0ZW5kKCAnbGFzdCcsIGZ1bmN0aW9uICgpIHtcbiAgICAgIC8vICoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKipcbiAgICAgIC8vICpcbiAgICAgIC8vICogUmV0dXJuczogVGhlIGxhc3QgbWF0Y2hpbmcgcmVjb3JkXG4gICAgICAvLyAqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqIFxuICAgICAgcnVuLmNhbGwoIHRoaXMgKTtcbiAgICAgIHJldHVybiB0aGlzLmNvbnRleHQoKS5yZXN1bHRzW3RoaXMuY29udGV4dCgpLnJlc3VsdHMubGVuZ3RoIC0gMV0gfHxcbiAgICAgICAgZmFsc2U7XG4gICAgfSk7XG5cblxuICAgIEFQSS5leHRlbmQoICdzdW0nLCBmdW5jdGlvbiAoKSB7XG4gICAgICAvLyAqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqXG4gICAgICAvLyAqXG4gICAgICAvLyAqIFRha2VzOiBjb2x1bW4gdG8gc3VtIHVwXG4gICAgICAvLyAqIFJldHVybnM6IFN1bXMgdGhlIHZhbHVlcyBvZiBhIGNvbHVtblxuICAgICAgLy8gKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKiBcbiAgICAgIHZhciB0b3RhbCA9IDAsIHRoYXQgPSB0aGlzO1xuICAgICAgcnVuLmNhbGwoIHRoYXQgKTtcbiAgICAgIGVhY2goIGFyZ3VtZW50cywgZnVuY3Rpb24gKCBjICkge1xuICAgICAgICBlYWNoKCB0aGF0LmNvbnRleHQoKS5yZXN1bHRzLCBmdW5jdGlvbiAoIHIgKSB7XG4gICAgICAgICAgdG90YWwgPSB0b3RhbCArIChyW2NdIHx8IDApO1xuICAgICAgICB9KTtcbiAgICAgIH0pO1xuICAgICAgcmV0dXJuIHRvdGFsO1xuICAgIH0pO1xuXG4gICAgQVBJLmV4dGVuZCggJ21pbicsIGZ1bmN0aW9uICggYyApIHtcbiAgICAgIC8vICoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKipcbiAgICAgIC8vICpcbiAgICAgIC8vICogVGFrZXM6IGNvbHVtbiB0byBmaW5kIG1pblxuICAgICAgLy8gKiBSZXR1cm5zOiB0aGUgbG93ZXN0IHZhbHVlXG4gICAgICAvLyAqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqIFxuICAgICAgdmFyIGxvd2VzdCA9IG51bGw7XG4gICAgICBydW4uY2FsbCggdGhpcyApO1xuICAgICAgZWFjaCggdGhpcy5jb250ZXh0KCkucmVzdWx0cywgZnVuY3Rpb24gKCByICkge1xuICAgICAgICBpZiAoIGxvd2VzdCA9PT0gbnVsbCB8fCByW2NdIDwgbG93ZXN0ICl7XG4gICAgICAgICAgbG93ZXN0ID0gcltjXTtcbiAgICAgICAgfVxuICAgICAgfSk7XG4gICAgICByZXR1cm4gbG93ZXN0O1xuICAgIH0pO1xuXG4gICAgLy8gIFRhZmZ5IGlubmVySm9pbiBFeHRlbnNpb24gKE9DRCBlZGl0aW9uKVxuICAgIC8vICA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cbiAgICAvL1xuICAgIC8vICBIb3cgdG8gVXNlXG4gICAgLy8gICoqKioqKioqKipcbiAgICAvL1xuICAgIC8vICBsZWZ0X3RhYmxlLmlubmVySm9pbiggcmlnaHRfdGFibGUsIGNvbmRpdGlvbjEgPCwuLi4gY29uZGl0aW9uTj4gKVxuICAgIC8vXG4gICAgLy8gIEEgY29uZGl0aW9uIGNhbiB0YWtlIG9uZSBvZiAyIGZvcm1zOlxuICAgIC8vXG4gICAgLy8gICAgMS4gQW4gQVJSQVkgd2l0aCAyIG9yIDMgdmFsdWVzOlxuICAgIC8vICAgIEEgY29sdW1uIG5hbWUgZnJvbSB0aGUgbGVmdCB0YWJsZSwgYW4gb3B0aW9uYWwgY29tcGFyaXNvbiBzdHJpbmcsXG4gICAgLy8gICAgYW5kIGNvbHVtbiBuYW1lIGZyb20gdGhlIHJpZ2h0IHRhYmxlLiAgVGhlIGNvbmRpdGlvbiBwYXNzZXMgaWYgdGhlIHRlc3RcbiAgICAvLyAgICBpbmRpY2F0ZWQgaXMgdHJ1ZS4gICBJZiB0aGUgY29uZGl0aW9uIHN0cmluZyBpcyBvbWl0dGVkLCAnPT09JyBpcyBhc3N1bWVkLlxuICAgIC8vICAgIEVYQU1QTEVTOiBbICdsYXN0X3VzZWRfdGltZScsICc+PScsICdjdXJyZW50X3VzZV90aW1lJyBdLCBbICd1c2VyX2lkJywnaWQnIF1cbiAgICAvL1xuICAgIC8vICAgIDIuIEEgRlVOQ1RJT046XG4gICAgLy8gICAgVGhlIGZ1bmN0aW9uIHJlY2VpdmVzIGEgbGVmdCB0YWJsZSByb3cgYW5kIHJpZ2h0IHRhYmxlIHJvdyBkdXJpbmcgdGhlXG4gICAgLy8gICAgY2FydGVzaWFuIGpvaW4uICBJZiB0aGUgZnVuY3Rpb24gcmV0dXJucyB0cnVlIGZvciB0aGUgcm93cyBjb25zaWRlcmVkLFxuICAgIC8vICAgIHRoZSBtZXJnZWQgcm93IGlzIGluY2x1ZGVkIGluIHRoZSByZXN1bHQgc2V0LlxuICAgIC8vICAgIEVYQU1QTEU6IGZ1bmN0aW9uIChsLHIpeyByZXR1cm4gbC5uYW1lID09PSByLmxhYmVsOyB9XG4gICAgLy9cbiAgICAvLyAgQ29uZGl0aW9ucyBhcmUgY29uc2lkZXJlZCBpbiB0aGUgb3JkZXIgdGhleSBhcmUgcHJlc2VudGVkLiAgVGhlcmVmb3JlIHRoZSBiZXN0XG4gICAgLy8gIHBlcmZvcm1hbmNlIGlzIHJlYWxpemVkIHdoZW4gdGhlIGxlYXN0IGV4cGVuc2l2ZSBhbmQgaGlnaGVzdCBwcnVuZS1yYXRlXG4gICAgLy8gIGNvbmRpdGlvbnMgYXJlIHBsYWNlZCBmaXJzdCwgc2luY2UgaWYgdGhleSByZXR1cm4gZmFsc2UgVGFmZnkgc2tpcHMgYW55XG4gICAgLy8gIGZ1cnRoZXIgY29uZGl0aW9uIHRlc3RzLlxuICAgIC8vXG4gICAgLy8gIE90aGVyIG5vdGVzXG4gICAgLy8gICoqKioqKioqKioqXG4gICAgLy9cbiAgICAvLyAgVGhpcyBjb2RlIHBhc3NlcyBqc2xpbnQgd2l0aCB0aGUgZXhjZXB0aW9uIG9mIDIgd2FybmluZ3MgYWJvdXRcbiAgICAvLyAgdGhlICc9PScgYW5kICchPScgbGluZXMuICBXZSBjYW4ndCBkbyBhbnl0aGluZyBhYm91dCB0aGF0IHNob3J0IG9mXG4gICAgLy8gIGRlbGV0aW5nIHRoZSBsaW5lcy5cbiAgICAvL1xuICAgIC8vICBDcmVkaXRzXG4gICAgLy8gICoqKioqKipcbiAgICAvL1xuICAgIC8vICBIZWF2aWx5IGJhc2VkIHVwb24gdGhlIHdvcmsgb2YgSWFuIFRvbHR6LlxuICAgIC8vICBSZXZpc2lvbnMgdG8gQVBJIGJ5IE1pY2hhZWwgTWlrb3dza2kuXG4gICAgLy8gIENvZGUgY29udmVudGlvbiBwZXIgc3RhbmRhcmRzIGluIGh0dHA6Ly9tYW5uaW5nLmNvbS9taWtvd3NraVxuICAgIChmdW5jdGlvbiAoKSB7XG4gICAgICB2YXIgaW5uZXJKb2luRnVuY3Rpb24gPSAoZnVuY3Rpb24gKCkge1xuICAgICAgICB2YXIgZm5Db21wYXJlTGlzdCwgZm5Db21iaW5lUm93LCBmbk1haW47XG5cbiAgICAgICAgZm5Db21wYXJlTGlzdCA9IGZ1bmN0aW9uICggbGVmdF9yb3csIHJpZ2h0X3JvdywgYXJnX2xpc3QgKSB7XG4gICAgICAgICAgdmFyIGRhdGFfbHQsIGRhdGFfcnQsIG9wX2NvZGUsIGVycm9yO1xuXG4gICAgICAgICAgaWYgKCBhcmdfbGlzdC5sZW5ndGggPT09IDIgKXtcbiAgICAgICAgICAgIGRhdGFfbHQgPSBsZWZ0X3Jvd1thcmdfbGlzdFswXV07XG4gICAgICAgICAgICBvcF9jb2RlID0gJz09PSc7XG4gICAgICAgICAgICBkYXRhX3J0ID0gcmlnaHRfcm93W2FyZ19saXN0WzFdXTtcbiAgICAgICAgICB9XG4gICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICBkYXRhX2x0ID0gbGVmdF9yb3dbYXJnX2xpc3RbMF1dO1xuICAgICAgICAgICAgb3BfY29kZSA9IGFyZ19saXN0WzFdO1xuICAgICAgICAgICAgZGF0YV9ydCA9IHJpZ2h0X3Jvd1thcmdfbGlzdFsyXV07XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgLypqc2xpbnQgZXFlcSA6IHRydWUgKi9cbiAgICAgICAgICBzd2l0Y2ggKCBvcF9jb2RlICl7XG4gICAgICAgICAgICBjYXNlICc9PT0nIDpcbiAgICAgICAgICAgICAgcmV0dXJuIGRhdGFfbHQgPT09IGRhdGFfcnQ7XG4gICAgICAgICAgICBjYXNlICchPT0nIDpcbiAgICAgICAgICAgICAgcmV0dXJuIGRhdGFfbHQgIT09IGRhdGFfcnQ7XG4gICAgICAgICAgICBjYXNlICc8JyAgIDpcbiAgICAgICAgICAgICAgcmV0dXJuIGRhdGFfbHQgPCBkYXRhX3J0O1xuICAgICAgICAgICAgY2FzZSAnPicgICA6XG4gICAgICAgICAgICAgIHJldHVybiBkYXRhX2x0ID4gZGF0YV9ydDtcbiAgICAgICAgICAgIGNhc2UgJzw9JyAgOlxuICAgICAgICAgICAgICByZXR1cm4gZGF0YV9sdCA8PSBkYXRhX3J0O1xuICAgICAgICAgICAgY2FzZSAnPj0nICA6XG4gICAgICAgICAgICAgIHJldHVybiBkYXRhX2x0ID49IGRhdGFfcnQ7XG4gICAgICAgICAgICBjYXNlICc9PScgIDpcbiAgICAgICAgICAgICAgcmV0dXJuIGRhdGFfbHQgPT0gZGF0YV9ydDtcbiAgICAgICAgICAgIGNhc2UgJyE9JyAgOlxuICAgICAgICAgICAgICByZXR1cm4gZGF0YV9sdCAhPSBkYXRhX3J0O1xuICAgICAgICAgICAgZGVmYXVsdCA6XG4gICAgICAgICAgICAgIHRocm93IFN0cmluZyggb3BfY29kZSApICsgJyBpcyBub3Qgc3VwcG9ydGVkJztcbiAgICAgICAgICB9XG4gICAgICAgICAgLy8gJ2pzbGludCBlcWVxIDogZmFsc2UnICBoZXJlIHJlc3VsdHMgaW5cbiAgICAgICAgICAvLyBcIlVucmVhY2hhYmxlICcvKmpzbGludCcgYWZ0ZXIgJ3JldHVybidcIi5cbiAgICAgICAgICAvLyBXZSBkb24ndCBuZWVkIGl0IHRob3VnaCwgYXMgdGhlIHJ1bGUgZXhjZXB0aW9uXG4gICAgICAgICAgLy8gaXMgZGlzY2FyZGVkIGF0IHRoZSBlbmQgb2YgdGhpcyBmdW5jdGlvbmFsIHNjb3BlXG4gICAgICAgIH07XG5cbiAgICAgICAgZm5Db21iaW5lUm93ID0gZnVuY3Rpb24gKCBsZWZ0X3JvdywgcmlnaHRfcm93ICkge1xuICAgICAgICAgIHZhciBvdXRfbWFwID0ge30sIGksIHByZWZpeDtcblxuICAgICAgICAgIGZvciAoIGkgaW4gbGVmdF9yb3cgKXtcbiAgICAgICAgICAgIGlmICggbGVmdF9yb3cuaGFzT3duUHJvcGVydHkoIGkgKSApe1xuICAgICAgICAgICAgICBvdXRfbWFwW2ldID0gbGVmdF9yb3dbaV07XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuICAgICAgICAgIGZvciAoIGkgaW4gcmlnaHRfcm93ICl7XG4gICAgICAgICAgICBpZiAoIHJpZ2h0X3Jvdy5oYXNPd25Qcm9wZXJ0eSggaSApICYmIGkgIT09ICdfX19pZCcgJiZcbiAgICAgICAgICAgICAgaSAhPT0gJ19fX3MnIClcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgcHJlZml4ID0gIVRBRkZZLmlzVW5kZWZpbmVkKCBvdXRfbWFwW2ldICkgPyAncmlnaHRfJyA6ICcnO1xuICAgICAgICAgICAgICBvdXRfbWFwW3ByZWZpeCArIFN0cmluZyggaSApIF0gPSByaWdodF9yb3dbaV07XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuICAgICAgICAgIHJldHVybiBvdXRfbWFwO1xuICAgICAgICB9O1xuXG4gICAgICAgIGZuTWFpbiA9IGZ1bmN0aW9uICggdGFibGUgKSB7XG4gICAgICAgICAgdmFyXG4gICAgICAgICAgICByaWdodF90YWJsZSwgaSxcbiAgICAgICAgICAgIGFyZ19saXN0ID0gYXJndW1lbnRzLFxuICAgICAgICAgICAgYXJnX2xlbmd0aCA9IGFyZ19saXN0Lmxlbmd0aCxcbiAgICAgICAgICAgIHJlc3VsdF9saXN0ID0gW11cbiAgICAgICAgICAgIDtcblxuICAgICAgICAgIGlmICggdHlwZW9mIHRhYmxlLmZpbHRlciAhPT0gJ2Z1bmN0aW9uJyApe1xuICAgICAgICAgICAgaWYgKCB0YWJsZS5UQUZGWSApeyByaWdodF90YWJsZSA9IHRhYmxlKCk7IH1cbiAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICB0aHJvdyAnVEFGRlkgREIgb3IgcmVzdWx0IG5vdCBzdXBwbGllZCc7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuICAgICAgICAgIGVsc2UgeyByaWdodF90YWJsZSA9IHRhYmxlOyB9XG5cbiAgICAgICAgICB0aGlzLmNvbnRleHQoIHtcbiAgICAgICAgICAgIHJlc3VsdHMgOiB0aGlzLmdldERCSSgpLnF1ZXJ5KCB0aGlzLmNvbnRleHQoKSApXG4gICAgICAgICAgfSApO1xuXG4gICAgICAgICAgVEFGRlkuZWFjaCggdGhpcy5jb250ZXh0KCkucmVzdWx0cywgZnVuY3Rpb24gKCBsZWZ0X3JvdyApIHtcbiAgICAgICAgICAgIHJpZ2h0X3RhYmxlLmVhY2goIGZ1bmN0aW9uICggcmlnaHRfcm93ICkge1xuICAgICAgICAgICAgICB2YXIgYXJnX2RhdGEsIGlzX29rID0gdHJ1ZTtcbiAgICAgICAgICAgICAgQ09ORElUSU9OOlxuICAgICAgICAgICAgICAgIGZvciAoIGkgPSAxOyBpIDwgYXJnX2xlbmd0aDsgaSsrICl7XG4gICAgICAgICAgICAgICAgICBhcmdfZGF0YSA9IGFyZ19saXN0W2ldO1xuICAgICAgICAgICAgICAgICAgaWYgKCB0eXBlb2YgYXJnX2RhdGEgPT09ICdmdW5jdGlvbicgKXtcbiAgICAgICAgICAgICAgICAgICAgaXNfb2sgPSBhcmdfZGF0YSggbGVmdF9yb3csIHJpZ2h0X3JvdyApO1xuICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgZWxzZSBpZiAoIHR5cGVvZiBhcmdfZGF0YSA9PT0gJ29iamVjdCcgJiYgYXJnX2RhdGEubGVuZ3RoICl7XG4gICAgICAgICAgICAgICAgICAgIGlzX29rID0gZm5Db21wYXJlTGlzdCggbGVmdF9yb3csIHJpZ2h0X3JvdywgYXJnX2RhdGEgKTtcbiAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICBpc19vayA9IGZhbHNlO1xuICAgICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgICBpZiAoICFpc19vayApeyBicmVhayBDT05ESVRJT047IH0gLy8gc2hvcnQgY2lyY3VpdFxuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICBpZiAoIGlzX29rICl7XG4gICAgICAgICAgICAgICAgcmVzdWx0X2xpc3QucHVzaCggZm5Db21iaW5lUm93KCBsZWZ0X3JvdywgcmlnaHRfcm93ICkgKTtcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSApO1xuICAgICAgICAgIH0gKTtcbiAgICAgICAgICByZXR1cm4gVEFGRlkoIHJlc3VsdF9saXN0ICkoKTtcbiAgICAgICAgfTtcblxuICAgICAgICByZXR1cm4gZm5NYWluO1xuICAgICAgfSgpKTtcblxuICAgICAgQVBJLmV4dGVuZCggJ2pvaW4nLCBpbm5lckpvaW5GdW5jdGlvbiApO1xuICAgIH0oKSk7XG5cbiAgICBBUEkuZXh0ZW5kKCAnbWF4JywgZnVuY3Rpb24gKCBjICkge1xuICAgICAgLy8gKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKlxuICAgICAgLy8gKlxuICAgICAgLy8gKiBUYWtlczogY29sdW1uIHRvIGZpbmQgbWF4XG4gICAgICAvLyAqIFJldHVybnM6IHRoZSBoaWdoZXN0IHZhbHVlXG4gICAgICAvLyAqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqXG4gICAgICB2YXIgaGlnaGVzdCA9IG51bGw7XG4gICAgICBydW4uY2FsbCggdGhpcyApO1xuICAgICAgZWFjaCggdGhpcy5jb250ZXh0KCkucmVzdWx0cywgZnVuY3Rpb24gKCByICkge1xuICAgICAgICBpZiAoIGhpZ2hlc3QgPT09IG51bGwgfHwgcltjXSA+IGhpZ2hlc3QgKXtcbiAgICAgICAgICBoaWdoZXN0ID0gcltjXTtcbiAgICAgICAgfVxuICAgICAgfSk7XG4gICAgICByZXR1cm4gaGlnaGVzdDtcbiAgICB9KTtcblxuICAgIEFQSS5leHRlbmQoICdzZWxlY3QnLCBmdW5jdGlvbiAoKSB7XG4gICAgICAvLyAqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqXG4gICAgICAvLyAqXG4gICAgICAvLyAqIFRha2VzOiBjb2x1bW5zIHRvIHNlbGVjdCB2YWx1ZXMgaW50byBhbiBhcnJheVxuICAgICAgLy8gKiBSZXR1cm5zOiBhcnJheSBvZiB2YWx1ZXNcbiAgICAgIC8vICogTm90ZSBpZiBtb3JlIHRoYW4gb25lIGNvbHVtbiBpcyBnaXZlbiBhbiBhcnJheSBvZiBhcnJheXMgaXMgcmV0dXJuZWRcbiAgICAgIC8vICoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKiogXG5cbiAgICAgIHZhciByYSA9IFtdLCBhcmdzID0gYXJndW1lbnRzO1xuICAgICAgcnVuLmNhbGwoIHRoaXMgKTtcbiAgICAgIGlmICggYXJndW1lbnRzLmxlbmd0aCA9PT0gMSApe1xuXG4gICAgICAgIGVhY2goIHRoaXMuY29udGV4dCgpLnJlc3VsdHMsIGZ1bmN0aW9uICggciApIHtcblxuICAgICAgICAgIHJhLnB1c2goIHJbYXJnc1swXV0gKTtcbiAgICAgICAgfSk7XG4gICAgICB9XG4gICAgICBlbHNlIHtcbiAgICAgICAgZWFjaCggdGhpcy5jb250ZXh0KCkucmVzdWx0cywgZnVuY3Rpb24gKCByICkge1xuICAgICAgICAgIHZhciByb3cgPSBbXTtcbiAgICAgICAgICBlYWNoKCBhcmdzLCBmdW5jdGlvbiAoIGMgKSB7XG4gICAgICAgICAgICByb3cucHVzaCggcltjXSApO1xuICAgICAgICAgIH0pO1xuICAgICAgICAgIHJhLnB1c2goIHJvdyApO1xuICAgICAgICB9KTtcbiAgICAgIH1cbiAgICAgIHJldHVybiByYTtcbiAgICB9KTtcbiAgICBBUEkuZXh0ZW5kKCAnZGlzdGluY3QnLCBmdW5jdGlvbiAoKSB7XG4gICAgICAvLyAqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqXG4gICAgICAvLyAqXG4gICAgICAvLyAqIFRha2VzOiBjb2x1bW5zIHRvIHNlbGVjdCB1bmlxdWUgYWx1ZXMgaW50byBhbiBhcnJheVxuICAgICAgLy8gKiBSZXR1cm5zOiBhcnJheSBvZiB2YWx1ZXNcbiAgICAgIC8vICogTm90ZSBpZiBtb3JlIHRoYW4gb25lIGNvbHVtbiBpcyBnaXZlbiBhbiBhcnJheSBvZiBhcnJheXMgaXMgcmV0dXJuZWRcbiAgICAgIC8vICoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKiogXG4gICAgICB2YXIgcmEgPSBbXSwgYXJncyA9IGFyZ3VtZW50cztcbiAgICAgIHJ1bi5jYWxsKCB0aGlzICk7XG4gICAgICBpZiAoIGFyZ3VtZW50cy5sZW5ndGggPT09IDEgKXtcblxuICAgICAgICBlYWNoKCB0aGlzLmNvbnRleHQoKS5yZXN1bHRzLCBmdW5jdGlvbiAoIHIgKSB7XG4gICAgICAgICAgdmFyIHYgPSByW2FyZ3NbMF1dLCBkdXAgPSBmYWxzZTtcbiAgICAgICAgICBlYWNoKCByYSwgZnVuY3Rpb24gKCBkICkge1xuICAgICAgICAgICAgaWYgKCB2ID09PSBkICl7XG4gICAgICAgICAgICAgIGR1cCA9IHRydWU7XG4gICAgICAgICAgICAgIHJldHVybiBUQUZGWS5FWElUO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH0pO1xuICAgICAgICAgIGlmICggIWR1cCApe1xuICAgICAgICAgICAgcmEucHVzaCggdiApO1xuICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgICB9XG4gICAgICBlbHNlIHtcbiAgICAgICAgZWFjaCggdGhpcy5jb250ZXh0KCkucmVzdWx0cywgZnVuY3Rpb24gKCByICkge1xuICAgICAgICAgIHZhciByb3cgPSBbXSwgZHVwID0gZmFsc2U7XG4gICAgICAgICAgZWFjaCggYXJncywgZnVuY3Rpb24gKCBjICkge1xuICAgICAgICAgICAgcm93LnB1c2goIHJbY10gKTtcbiAgICAgICAgICB9KTtcbiAgICAgICAgICBlYWNoKCByYSwgZnVuY3Rpb24gKCBkICkge1xuICAgICAgICAgICAgdmFyIGxkdXAgPSB0cnVlO1xuICAgICAgICAgICAgZWFjaCggYXJncywgZnVuY3Rpb24gKCBjLCBpICkge1xuICAgICAgICAgICAgICBpZiAoIHJvd1tpXSAhPT0gZFtpXSApe1xuICAgICAgICAgICAgICAgIGxkdXAgPSBmYWxzZTtcbiAgICAgICAgICAgICAgICByZXR1cm4gVEFGRlkuRVhJVDtcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICBpZiAoIGxkdXAgKXtcbiAgICAgICAgICAgICAgZHVwID0gdHJ1ZTtcbiAgICAgICAgICAgICAgcmV0dXJuIFRBRkZZLkVYSVQ7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfSk7XG4gICAgICAgICAgaWYgKCAhZHVwICl7XG4gICAgICAgICAgICByYS5wdXNoKCByb3cgKTtcbiAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgICAgfVxuICAgICAgcmV0dXJuIHJhO1xuICAgIH0pO1xuICAgIEFQSS5leHRlbmQoICdzdXBwbGFudCcsIGZ1bmN0aW9uICggdGVtcGxhdGUsIHJldHVybmFycmF5ICkge1xuICAgICAgLy8gKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKlxuICAgICAgLy8gKlxuICAgICAgLy8gKiBUYWtlczogYSBzdHJpbmcgdGVtcGxhdGUgZm9ybWF0ZWQgd2l0aCBrZXkgdG8gYmUgcmVwbGFjZWQgd2l0aCB2YWx1ZXMgZnJvbSB0aGUgcm93cywgZmxhZyB0byBkZXRlcm1pbmUgaWYgd2Ugd2FudCBhcnJheSBvZiBzdHJpbmdzXG4gICAgICAvLyAqIFJldHVybnM6IGFycmF5IG9mIHZhbHVlcyBvciBhIHN0cmluZ1xuICAgICAgLy8gKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKiBcbiAgICAgIHZhciByYSA9IFtdO1xuICAgICAgcnVuLmNhbGwoIHRoaXMgKTtcbiAgICAgIGVhY2goIHRoaXMuY29udGV4dCgpLnJlc3VsdHMsIGZ1bmN0aW9uICggciApIHtcbiAgICAgICAgLy8gVE9ETzogVGhlIGN1cmx5IGJyYWNlcyB1c2VkIHRvIGJlIHVuZXNjYXBlZFxuICAgICAgICByYS5wdXNoKCB0ZW1wbGF0ZS5yZXBsYWNlKCAvXFx7KFteXFx7XFx9XSopXFx9L2csIGZ1bmN0aW9uICggYSwgYiApIHtcbiAgICAgICAgICB2YXIgdiA9IHJbYl07XG4gICAgICAgICAgcmV0dXJuIHR5cGVvZiB2ID09PSAnc3RyaW5nJyB8fCB0eXBlb2YgdiA9PT0gJ251bWJlcicgPyB2IDogYTtcbiAgICAgICAgfSApICk7XG4gICAgICB9KTtcbiAgICAgIHJldHVybiAoIXJldHVybmFycmF5KSA/IHJhLmpvaW4oIFwiXCIgKSA6IHJhO1xuICAgIH0pO1xuXG5cbiAgICBBUEkuZXh0ZW5kKCAnZWFjaCcsIGZ1bmN0aW9uICggbSApIHtcbiAgICAgIC8vICoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKipcbiAgICAgIC8vICpcbiAgICAgIC8vICogVGFrZXM6IGEgZnVuY3Rpb25cbiAgICAgIC8vICogUHVycG9zZTogbG9vcHMgb3ZlciBldmVyeSBtYXRjaGluZyByZWNvcmQgYW5kIGFwcGxpZXMgdGhlIGZ1bmN0aW9uXG4gICAgICAvLyAqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqIFxuICAgICAgcnVuLmNhbGwoIHRoaXMgKTtcbiAgICAgIGVhY2goIHRoaXMuY29udGV4dCgpLnJlc3VsdHMsIG0gKTtcbiAgICAgIHJldHVybiB0aGlzO1xuICAgIH0pO1xuICAgIEFQSS5leHRlbmQoICdtYXAnLCBmdW5jdGlvbiAoIG0gKSB7XG4gICAgICAvLyAqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqXG4gICAgICAvLyAqXG4gICAgICAvLyAqIFRha2VzOiBhIGZ1bmN0aW9uXG4gICAgICAvLyAqIFB1cnBvc2U6IGxvb3BzIG92ZXIgZXZlcnkgbWF0Y2hpbmcgcmVjb3JkIGFuZCBhcHBsaWVzIHRoZSBmdW5jdGlvbiwgcmV0dXJpbmcgdGhlIHJlc3VsdHMgaW4gYW4gYXJyYXlcbiAgICAgIC8vICoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKiogXG4gICAgICB2YXIgcmEgPSBbXTtcbiAgICAgIHJ1bi5jYWxsKCB0aGlzICk7XG4gICAgICBlYWNoKCB0aGlzLmNvbnRleHQoKS5yZXN1bHRzLCBmdW5jdGlvbiAoIHIgKSB7XG4gICAgICAgIHJhLnB1c2goIG0oIHIgKSApO1xuICAgICAgfSk7XG4gICAgICByZXR1cm4gcmE7XG4gICAgfSk7XG5cblxuXG4gICAgVCA9IGZ1bmN0aW9uICggZCApIHtcbiAgICAgIC8vICoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKipcbiAgICAgIC8vICpcbiAgICAgIC8vICogVCBpcyB0aGUgbWFpbiBUQUZGWSBvYmplY3RcbiAgICAgIC8vICogVGFrZXM6IGFuIGFycmF5IG9mIG9iamVjdHMgb3IgSlNPTlxuICAgICAgLy8gKiBSZXR1cm5zIGEgbmV3IFRBRkZZREJcbiAgICAgIC8vICoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKiogXG4gICAgICB2YXIgVE9iID0gW10sXG4gICAgICAgIElEID0ge30sXG4gICAgICAgIFJDID0gMSxcbiAgICAgICAgc2V0dGluZ3MgPSB7XG4gICAgICAgICAgdGVtcGxhdGUgICAgICAgICAgOiBmYWxzZSxcbiAgICAgICAgICBvbkluc2VydCAgICAgICAgICA6IGZhbHNlLFxuICAgICAgICAgIG9uVXBkYXRlICAgICAgICAgIDogZmFsc2UsXG4gICAgICAgICAgb25SZW1vdmUgICAgICAgICAgOiBmYWxzZSxcbiAgICAgICAgICBvbkRCQ2hhbmdlICAgICAgICA6IGZhbHNlLFxuICAgICAgICAgIHN0b3JhZ2VOYW1lICAgICAgIDogZmFsc2UsXG4gICAgICAgICAgZm9yY2VQcm9wZXJ0eUNhc2UgOiBudWxsLFxuICAgICAgICAgIGNhY2hlU2l6ZSAgICAgICAgIDogMTAwLFxuICAgICAgICAgIG5hbWUgICAgICAgICAgICAgIDogJydcbiAgICAgICAgfSxcbiAgICAgICAgZG0gPSBuZXcgRGF0ZSgpLFxuICAgICAgICBDYWNoZUNvdW50ID0gMCxcbiAgICAgICAgQ2FjaGVDbGVhciA9IDAsXG4gICAgICAgIENhY2hlID0ge30sXG4gICAgICAgIERCSSwgcnVuSW5kZXhlcywgcm9vdFxuICAgICAgICA7XG4gICAgICAvLyAqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqXG4gICAgICAvLyAqXG4gICAgICAvLyAqIFRPYiA9IHRoaXMgZGF0YWJhc2VcbiAgICAgIC8vICogSUQgPSBjb2xsZWN0aW9uIG9mIHRoZSByZWNvcmQgSURzIGFuZCBsb2NhdGlvbnMgd2l0aGluIHRoZSBEQiwgdXNlZCBmb3IgZmFzdCBsb29rdXBzXG4gICAgICAvLyAqIFJDID0gcmVjb3JkIGNvdW50ZXIsIHVzZWQgZm9yIGNyZWF0aW5nIElEc1xuICAgICAgLy8gKiBzZXR0aW5ncy50ZW1wbGF0ZSA9IHRoZSB0ZW1wbGF0ZSB0byBtZXJnZSBhbGwgbmV3IHJlY29yZHMgd2l0aFxuICAgICAgLy8gKiBzZXR0aW5ncy5vbkluc2VydCA9IGV2ZW50IGdpdmVuIGEgY29weSBvZiB0aGUgbmV3bHkgaW5zZXJ0ZWQgcmVjb3JkXG4gICAgICAvLyAqIHNldHRpbmdzLm9uVXBkYXRlID0gZXZlbnQgZ2l2ZW4gdGhlIG9yaWdpbmFsIHJlY29yZCwgdGhlIGNoYW5nZXMsIGFuZCB0aGUgbmV3IHJlY29yZFxuICAgICAgLy8gKiBzZXR0aW5ncy5vblJlbW92ZSA9IGV2ZW50IGdpdmVuIHRoZSByZW1vdmVkIHJlY29yZFxuICAgICAgLy8gKiBzZXR0aW5ncy5mb3JjZVByb3BlcnR5Q2FzZSA9IG9uIGluc2VydCBmb3JjZSB0aGUgcHJvcHJ0eSBjYXNlIHRvIGJlIGxvd2VyIG9yIHVwcGVyLiBkZWZhdWx0IGxvd2VyLCBudWxsL3VuZGVmaW5lZCB3aWxsIGxlYXZlIGNhc2UgYXMgaXNcbiAgICAgIC8vICogZG0gPSB0aGUgbW9kaWZ5IGRhdGUgb2YgdGhlIGRhdGFiYXNlLCB1c2VkIGZvciBxdWVyeSBjYWNoaW5nXG4gICAgICAvLyAqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqIFxuXG5cbiAgICAgIHJ1bkluZGV4ZXMgPSBmdW5jdGlvbiAoIGluZGV4ZXMgKSB7XG4gICAgICAgIC8vICoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKipcbiAgICAgICAgLy8gKlxuICAgICAgICAvLyAqIFRha2VzOiBhIGNvbGxlY3Rpb24gb2YgaW5kZXhlc1xuICAgICAgICAvLyAqIFJldHVybnM6IGNvbGxlY3Rpb24gd2l0aCByZWNvcmRzIG1hdGNoaW5nIGluZGV4ZWQgZmlsdGVyc1xuICAgICAgICAvLyAqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqIFxuXG4gICAgICAgIHZhciByZWNvcmRzID0gW10sIFVuaXF1ZUVuZm9yY2UgPSBmYWxzZTtcblxuICAgICAgICBpZiAoIGluZGV4ZXMubGVuZ3RoID09PSAwICl7XG4gICAgICAgICAgcmV0dXJuIFRPYjtcbiAgICAgICAgfVxuXG4gICAgICAgIGVhY2goIGluZGV4ZXMsIGZ1bmN0aW9uICggZiApIHtcbiAgICAgICAgICAvLyBDaGVjayB0byBzZWUgaWYgcmVjb3JkIElEXG4gICAgICAgICAgaWYgKCBULmlzU3RyaW5nKCBmICkgJiYgL1t0XVswLTldKltyXVswLTldKi9pLnRlc3QoIGYgKSAmJlxuICAgICAgICAgICAgVE9iW0lEW2ZdXSApXG4gICAgICAgICAge1xuICAgICAgICAgICAgcmVjb3Jkcy5wdXNoKCBUT2JbSURbZl1dICk7XG4gICAgICAgICAgICBVbmlxdWVFbmZvcmNlID0gdHJ1ZTtcbiAgICAgICAgICB9XG4gICAgICAgICAgLy8gQ2hlY2sgdG8gc2VlIGlmIHJlY29yZFxuICAgICAgICAgIGlmICggVC5pc09iamVjdCggZiApICYmIGYuX19faWQgJiYgZi5fX19zICYmXG4gICAgICAgICAgICBUT2JbSURbZi5fX19pZF1dIClcbiAgICAgICAgICB7XG4gICAgICAgICAgICByZWNvcmRzLnB1c2goIFRPYltJRFtmLl9fX2lkXV0gKTtcbiAgICAgICAgICAgIFVuaXF1ZUVuZm9yY2UgPSB0cnVlO1xuICAgICAgICAgIH1cbiAgICAgICAgICAvLyBDaGVjayB0byBzZWUgaWYgYXJyYXkgb2YgaW5kZXhlc1xuICAgICAgICAgIGlmICggVC5pc0FycmF5KCBmICkgKXtcbiAgICAgICAgICAgIGVhY2goIGYsIGZ1bmN0aW9uICggciApIHtcbiAgICAgICAgICAgICAgZWFjaCggcnVuSW5kZXhlcyggciApLCBmdW5jdGlvbiAoIHJyICkge1xuICAgICAgICAgICAgICAgIHJlY29yZHMucHVzaCggcnIgKTtcbiAgICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgICAgIGlmICggVW5pcXVlRW5mb3JjZSAmJiByZWNvcmRzLmxlbmd0aCA+IDEgKXtcbiAgICAgICAgICByZWNvcmRzID0gW107XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gcmVjb3JkcztcbiAgICAgIH07XG5cbiAgICAgIERCSSA9IHtcbiAgICAgICAgLy8gKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKlxuICAgICAgICAvLyAqXG4gICAgICAgIC8vICogVGhlIERCSSBpcyB0aGUgaW50ZXJuYWwgRGF0YUJhc2UgSW50ZXJmYWNlIHRoYXQgaW50ZXJhY3RzIHdpdGggdGhlIGRhdGFcbiAgICAgICAgLy8gKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKiBcbiAgICAgICAgZG0gICAgICAgICAgIDogZnVuY3Rpb24gKCBuZCApIHtcbiAgICAgICAgICAvLyAqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqXG4gICAgICAgICAgLy8gKlxuICAgICAgICAgIC8vICogVGFrZXM6IGFuIG9wdGlvbmFsIG5ldyBtb2RpZnkgZGF0ZVxuICAgICAgICAgIC8vICogUHVycG9zZTogdXNlZCB0byBnZXQgYW5kIHNldCB0aGUgREIgbW9kaWZ5IGRhdGVcbiAgICAgICAgICAvLyAqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqIFxuICAgICAgICAgIGlmICggbmQgKXtcbiAgICAgICAgICAgIGRtID0gbmQ7XG4gICAgICAgICAgICBDYWNoZSA9IHt9O1xuICAgICAgICAgICAgQ2FjaGVDb3VudCA9IDA7XG4gICAgICAgICAgICBDYWNoZUNsZWFyID0gMDtcbiAgICAgICAgICB9XG4gICAgICAgICAgaWYgKCBzZXR0aW5ncy5vbkRCQ2hhbmdlICl7XG4gICAgICAgICAgICBzZXRUaW1lb3V0KCBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgIHNldHRpbmdzLm9uREJDaGFuZ2UuY2FsbCggVE9iICk7XG4gICAgICAgICAgICB9LCAwICk7XG4gICAgICAgICAgfVxuICAgICAgICAgIGlmICggc2V0dGluZ3Muc3RvcmFnZU5hbWUgKXtcbiAgICAgICAgICAgIHNldFRpbWVvdXQoIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgbG9jYWxTdG9yYWdlLnNldEl0ZW0oICd0YWZmeV8nICsgc2V0dGluZ3Muc3RvcmFnZU5hbWUsXG4gICAgICAgICAgICAgICAgSlNPTi5zdHJpbmdpZnkoIFRPYiApICk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICB9XG4gICAgICAgICAgcmV0dXJuIGRtO1xuICAgICAgICB9LFxuICAgICAgICBpbnNlcnQgICAgICAgOiBmdW5jdGlvbiAoIGksIHJ1bkV2ZW50ICkge1xuICAgICAgICAgIC8vICoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKipcbiAgICAgICAgICAvLyAqXG4gICAgICAgICAgLy8gKiBUYWtlczogYSBuZXcgcmVjb3JkIHRvIGluc2VydFxuICAgICAgICAgIC8vICogUHVycG9zZTogbWVyZ2UgdGhlIG9iamVjdCB3aXRoIHRoZSB0ZW1wbGF0ZSwgYWRkIGFuIElELCBpbnNlcnQgaW50byBEQiwgY2FsbCBpbnNlcnQgZXZlbnRcbiAgICAgICAgICAvLyAqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqIFxuICAgICAgICAgIHZhciBjb2x1bW5zID0gW10sXG4gICAgICAgICAgICByZWNvcmRzICAgPSBbXSxcbiAgICAgICAgICAgIGlucHV0ICAgICA9IHByb3RlY3RKU09OKCBpIClcbiAgICAgICAgICAgIDtcbiAgICAgICAgICBlYWNoKCBpbnB1dCwgZnVuY3Rpb24gKCB2LCBpICkge1xuICAgICAgICAgICAgdmFyIG52LCBvO1xuICAgICAgICAgICAgaWYgKCBULmlzQXJyYXkoIHYgKSAmJiBpID09PSAwICl7XG4gICAgICAgICAgICAgIGVhY2goIHYsIGZ1bmN0aW9uICggYXYgKSB7XG5cbiAgICAgICAgICAgICAgICBjb2x1bW5zLnB1c2goIChzZXR0aW5ncy5mb3JjZVByb3BlcnR5Q2FzZSA9PT0gJ2xvd2VyJylcbiAgICAgICAgICAgICAgICAgID8gYXYudG9Mb3dlckNhc2UoKVxuICAgICAgICAgICAgICAgICAgICA6IChzZXR0aW5ncy5mb3JjZVByb3BlcnR5Q2FzZSA9PT0gJ3VwcGVyJylcbiAgICAgICAgICAgICAgICAgID8gYXYudG9VcHBlckNhc2UoKSA6IGF2ICk7XG4gICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2UgaWYgKCBULmlzQXJyYXkoIHYgKSApe1xuICAgICAgICAgICAgICBudiA9IHt9O1xuICAgICAgICAgICAgICBlYWNoKCB2LCBmdW5jdGlvbiAoIGF2LCBhaSApIHtcbiAgICAgICAgICAgICAgICBudltjb2x1bW5zW2FpXV0gPSBhdjtcbiAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgIHYgPSBudjtcblxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSBpZiAoIFQuaXNPYmplY3QoIHYgKSAmJiBzZXR0aW5ncy5mb3JjZVByb3BlcnR5Q2FzZSApe1xuICAgICAgICAgICAgICBvID0ge307XG5cbiAgICAgICAgICAgICAgZWFjaGluKCB2LCBmdW5jdGlvbiAoIGF2LCBhaSApIHtcbiAgICAgICAgICAgICAgICBvWyhzZXR0aW5ncy5mb3JjZVByb3BlcnR5Q2FzZSA9PT0gJ2xvd2VyJykgPyBhaS50b0xvd2VyQ2FzZSgpXG4gICAgICAgICAgICAgICAgICA6IChzZXR0aW5ncy5mb3JjZVByb3BlcnR5Q2FzZSA9PT0gJ3VwcGVyJylcbiAgICAgICAgICAgICAgICAgID8gYWkudG9VcHBlckNhc2UoKSA6IGFpXSA9IHZbYWldO1xuICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgdiA9IG87XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIFJDKys7XG4gICAgICAgICAgICB2Ll9fX2lkID0gJ1QnICsgU3RyaW5nKCBpZHBhZCArIFRDICkuc2xpY2UoIC02ICkgKyAnUicgK1xuICAgICAgICAgICAgICBTdHJpbmcoIGlkcGFkICsgUkMgKS5zbGljZSggLTYgKTtcbiAgICAgICAgICAgIHYuX19fcyA9IHRydWU7XG4gICAgICAgICAgICByZWNvcmRzLnB1c2goIHYuX19faWQgKTtcbiAgICAgICAgICAgIGlmICggc2V0dGluZ3MudGVtcGxhdGUgKXtcbiAgICAgICAgICAgICAgdiA9IFQubWVyZ2VPYmooIHNldHRpbmdzLnRlbXBsYXRlLCB2ICk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBUT2IucHVzaCggdiApO1xuXG4gICAgICAgICAgICBJRFt2Ll9fX2lkXSA9IFRPYi5sZW5ndGggLSAxO1xuICAgICAgICAgICAgaWYgKCBzZXR0aW5ncy5vbkluc2VydCAmJlxuICAgICAgICAgICAgICAocnVuRXZlbnQgfHwgVEFGRlkuaXNVbmRlZmluZWQoIHJ1bkV2ZW50ICkpIClcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgc2V0dGluZ3Mub25JbnNlcnQuY2FsbCggdiApO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgREJJLmRtKCBuZXcgRGF0ZSgpICk7XG4gICAgICAgICAgfSk7XG4gICAgICAgICAgcmV0dXJuIHJvb3QoIHJlY29yZHMgKTtcbiAgICAgICAgfSxcbiAgICAgICAgc29ydCAgICAgICAgIDogZnVuY3Rpb24gKCBvICkge1xuICAgICAgICAgIC8vICoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKipcbiAgICAgICAgICAvLyAqXG4gICAgICAgICAgLy8gKiBQdXJwb3NlOiBDaGFuZ2UgdGhlIHNvcnQgb3JkZXIgb2YgdGhlIERCIGl0c2VsZiBhbmQgcmVzZXQgdGhlIElEIGJ1Y2tldFxuICAgICAgICAgIC8vICoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKiogXG4gICAgICAgICAgVE9iID0gb3JkZXJCeUNvbCggVE9iLCBvLnNwbGl0KCAnLCcgKSApO1xuICAgICAgICAgIElEID0ge307XG4gICAgICAgICAgZWFjaCggVE9iLCBmdW5jdGlvbiAoIHIsIGkgKSB7XG4gICAgICAgICAgICBJRFtyLl9fX2lkXSA9IGk7XG4gICAgICAgICAgfSk7XG4gICAgICAgICAgREJJLmRtKCBuZXcgRGF0ZSgpICk7XG4gICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgIH0sXG4gICAgICAgIHVwZGF0ZSAgICAgICA6IGZ1bmN0aW9uICggaWQsIGNoYW5nZXMsIHJ1bkV2ZW50ICkge1xuICAgICAgICAgIC8vICoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKipcbiAgICAgICAgICAvLyAqXG4gICAgICAgICAgLy8gKiBUYWtlczogdGhlIElEIG9mIHJlY29yZCBiZWluZyBjaGFuZ2VkIGFuZCB0aGUgY2hhbmdlc1xuICAgICAgICAgIC8vICogUHVycG9zZTogVXBkYXRlIGEgcmVjb3JkIGFuZCBjaGFuZ2Ugc29tZSBvciBhbGwgdmFsdWVzLCBjYWxsIHRoZSBvbiB1cGRhdGUgbWV0aG9kXG4gICAgICAgICAgLy8gKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKlxuXG4gICAgICAgICAgdmFyIG5jID0ge30sIG9yLCBuciwgdGMsIGhhc0NoYW5nZTtcbiAgICAgICAgICBpZiAoIHNldHRpbmdzLmZvcmNlUHJvcGVydHlDYXNlICl7XG4gICAgICAgICAgICBlYWNoaW4oIGNoYW5nZXMsIGZ1bmN0aW9uICggdiwgcCApIHtcbiAgICAgICAgICAgICAgbmNbKHNldHRpbmdzLmZvcmNlUHJvcGVydHlDYXNlID09PSAnbG93ZXInKSA/IHAudG9Mb3dlckNhc2UoKVxuICAgICAgICAgICAgICAgIDogKHNldHRpbmdzLmZvcmNlUHJvcGVydHlDYXNlID09PSAndXBwZXInKSA/IHAudG9VcHBlckNhc2UoKVxuICAgICAgICAgICAgICAgIDogcF0gPSB2O1xuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICBjaGFuZ2VzID0gbmM7XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgb3IgPSBUT2JbSURbaWRdXTtcbiAgICAgICAgICBuciA9IFQubWVyZ2VPYmooIG9yLCBjaGFuZ2VzICk7XG5cbiAgICAgICAgICB0YyA9IHt9O1xuICAgICAgICAgIGhhc0NoYW5nZSA9IGZhbHNlO1xuICAgICAgICAgIGVhY2hpbiggbnIsIGZ1bmN0aW9uICggdiwgaSApIHtcbiAgICAgICAgICAgIGlmICggVEFGRlkuaXNVbmRlZmluZWQoIG9yW2ldICkgfHwgb3JbaV0gIT09IHYgKXtcbiAgICAgICAgICAgICAgdGNbaV0gPSB2O1xuICAgICAgICAgICAgICBoYXNDaGFuZ2UgPSB0cnVlO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH0pO1xuICAgICAgICAgIGlmICggaGFzQ2hhbmdlICl7XG4gICAgICAgICAgICBpZiAoIHNldHRpbmdzLm9uVXBkYXRlICYmXG4gICAgICAgICAgICAgIChydW5FdmVudCB8fCBUQUZGWS5pc1VuZGVmaW5lZCggcnVuRXZlbnQgKSkgKVxuICAgICAgICAgICAge1xuICAgICAgICAgICAgICBzZXR0aW5ncy5vblVwZGF0ZS5jYWxsKCBuciwgVE9iW0lEW2lkXV0sIHRjICk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBUT2JbSURbaWRdXSA9IG5yO1xuICAgICAgICAgICAgREJJLmRtKCBuZXcgRGF0ZSgpICk7XG4gICAgICAgICAgfVxuICAgICAgICB9LFxuICAgICAgICByZW1vdmUgICAgICAgOiBmdW5jdGlvbiAoIGlkICkge1xuICAgICAgICAgIC8vICoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKipcbiAgICAgICAgICAvLyAqXG4gICAgICAgICAgLy8gKiBUYWtlczogdGhlIElEIG9mIHJlY29yZCB0byBiZSByZW1vdmVkXG4gICAgICAgICAgLy8gKiBQdXJwb3NlOiByZW1vdmUgYSByZWNvcmQsIGNoYW5nZXMgaXRzIF9fX3MgdmFsdWUgdG8gZmFsc2VcbiAgICAgICAgICAvLyAqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqIFxuICAgICAgICAgIFRPYltJRFtpZF1dLl9fX3MgPSBmYWxzZTtcbiAgICAgICAgfSxcbiAgICAgICAgcmVtb3ZlQ29tbWl0IDogZnVuY3Rpb24gKCBydW5FdmVudCApIHtcbiAgICAgICAgICB2YXIgeDtcbiAgICAgICAgICAvLyAqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqXG4gICAgICAgICAgLy8gKlxuICAgICAgICAgIC8vICogXG4gICAgICAgICAgLy8gKiBQdXJwb3NlOiBsb29wIG92ZXIgYWxsIHJlY29yZHMgYW5kIHJlbW92ZSByZWNvcmRzIHdpdGggX19fcyA9IGZhbHNlLCBjYWxsIG9uUmVtb3ZlIGV2ZW50LCBjbGVhciBJRFxuICAgICAgICAgIC8vICoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKipcbiAgICAgICAgICBmb3IgKCB4ID0gVE9iLmxlbmd0aCAtIDE7IHggPiAtMTsgeC0tICl7XG5cbiAgICAgICAgICAgIGlmICggIVRPYlt4XS5fX19zICl7XG4gICAgICAgICAgICAgIGlmICggc2V0dGluZ3Mub25SZW1vdmUgJiZcbiAgICAgICAgICAgICAgICAocnVuRXZlbnQgfHwgVEFGRlkuaXNVbmRlZmluZWQoIHJ1bkV2ZW50ICkpIClcbiAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgIHNldHRpbmdzLm9uUmVtb3ZlLmNhbGwoIFRPYlt4XSApO1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgIElEW1RPYlt4XS5fX19pZF0gPSB1bmRlZmluZWQ7XG4gICAgICAgICAgICAgIFRPYi5zcGxpY2UoIHgsIDEgKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG4gICAgICAgICAgSUQgPSB7fTtcbiAgICAgICAgICBlYWNoKCBUT2IsIGZ1bmN0aW9uICggciwgaSApIHtcbiAgICAgICAgICAgIElEW3IuX19faWRdID0gaTtcbiAgICAgICAgICB9KTtcbiAgICAgICAgICBEQkkuZG0oIG5ldyBEYXRlKCkgKTtcbiAgICAgICAgfSxcbiAgICAgICAgcXVlcnkgOiBmdW5jdGlvbiAoIGNvbnRleHQgKSB7XG4gICAgICAgICAgLy8gKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKlxuICAgICAgICAgIC8vICpcbiAgICAgICAgICAvLyAqIFRha2VzOiB0aGUgY29udGV4dCBvYmplY3QgZm9yIGEgcXVlcnkgYW5kIGVpdGhlciByZXR1cm5zIGEgY2FjaGUgcmVzdWx0IG9yIGEgbmV3IHF1ZXJ5IHJlc3VsdFxuICAgICAgICAgIC8vICoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKiogXG4gICAgICAgICAgdmFyIHJldHVybnEsIGNpZCwgcmVzdWx0cywgaW5kZXhlZCwgbGltaXRxLCBuaTtcblxuICAgICAgICAgIGlmICggc2V0dGluZ3MuY2FjaGVTaXplICkge1xuICAgICAgICAgICAgY2lkID0gJyc7XG4gICAgICAgICAgICBlYWNoKCBjb250ZXh0LmZpbHRlclJhdywgZnVuY3Rpb24gKCByICkge1xuICAgICAgICAgICAgICBpZiAoIFQuaXNGdW5jdGlvbiggciApICl7XG4gICAgICAgICAgICAgICAgY2lkID0gJ25vY2FjaGUnO1xuICAgICAgICAgICAgICAgIHJldHVybiBUQUZGWS5FWElUO1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIGlmICggY2lkID09PSAnJyApe1xuICAgICAgICAgICAgICBjaWQgPSBtYWtlQ2lkKCBULm1lcmdlT2JqKCBjb250ZXh0LFxuICAgICAgICAgICAgICAgIHtxIDogZmFsc2UsIHJ1biA6IGZhbHNlLCBzb3J0IDogZmFsc2V9ICkgKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG4gICAgICAgICAgLy8gUnVuIGEgbmV3IHF1ZXJ5IGlmIHRoZXJlIGFyZSBubyByZXN1bHRzIG9yIHRoZSBydW4gZGF0ZSBoYXMgYmVlbiBjbGVhcmVkXG4gICAgICAgICAgaWYgKCAhY29udGV4dC5yZXN1bHRzIHx8ICFjb250ZXh0LnJ1biB8fFxuICAgICAgICAgICAgKGNvbnRleHQucnVuICYmIERCSS5kbSgpID4gY29udGV4dC5ydW4pIClcbiAgICAgICAgICB7XG4gICAgICAgICAgICByZXN1bHRzID0gW107XG5cbiAgICAgICAgICAgIC8vIGNoZWNrIENhY2hlXG5cbiAgICAgICAgICAgIGlmICggc2V0dGluZ3MuY2FjaGVTaXplICYmIENhY2hlW2NpZF0gKXtcblxuICAgICAgICAgICAgICBDYWNoZVtjaWRdLmkgPSBDYWNoZUNvdW50Kys7XG4gICAgICAgICAgICAgIHJldHVybiBDYWNoZVtjaWRdLnJlc3VsdHM7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgLy8gaWYgbm8gZmlsdGVyLCByZXR1cm4gREJcbiAgICAgICAgICAgICAgaWYgKCBjb250ZXh0LnEubGVuZ3RoID09PSAwICYmIGNvbnRleHQuaW5kZXgubGVuZ3RoID09PSAwICl7XG4gICAgICAgICAgICAgICAgZWFjaCggVE9iLCBmdW5jdGlvbiAoIHIgKSB7XG4gICAgICAgICAgICAgICAgICByZXN1bHRzLnB1c2goIHIgKTtcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICByZXR1cm5xID0gcmVzdWx0cztcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICAvLyB1c2UgaW5kZXhlc1xuXG4gICAgICAgICAgICAgICAgaW5kZXhlZCA9IHJ1bkluZGV4ZXMoIGNvbnRleHQuaW5kZXggKTtcblxuICAgICAgICAgICAgICAgIC8vIHJ1biBmaWx0ZXJzXG4gICAgICAgICAgICAgICAgZWFjaCggaW5kZXhlZCwgZnVuY3Rpb24gKCByICkge1xuICAgICAgICAgICAgICAgICAgLy8gUnVuIGZpbHRlciB0byBzZWUgaWYgcmVjb3JkIG1hdGNoZXMgcXVlcnlcbiAgICAgICAgICAgICAgICAgIGlmICggY29udGV4dC5xLmxlbmd0aCA9PT0gMCB8fCBydW5GaWx0ZXJzKCByLCBjb250ZXh0LnEgKSApe1xuICAgICAgICAgICAgICAgICAgICByZXN1bHRzLnB1c2goIHIgKTtcbiAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgICAgIHJldHVybnEgPSByZXN1bHRzO1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG5cblxuICAgICAgICAgIH1cbiAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIC8vIElmIHF1ZXJ5IGV4aXN0cyBhbmQgcnVuIGhhcyBub3QgYmVlbiBjbGVhcmVkIHJldHVybiB0aGUgY2FjaGUgcmVzdWx0c1xuICAgICAgICAgICAgcmV0dXJucSA9IGNvbnRleHQucmVzdWx0cztcbiAgICAgICAgICB9XG4gICAgICAgICAgLy8gSWYgYSBjdXN0b20gb3JkZXIgYXJyYXkgZXhpc3RzIGFuZCB0aGUgcnVuIGhhcyBiZWVuIGNsZWFyIG9yIHRoZSBzb3J0IGhhcyBiZWVuIGNsZWFyZWRcbiAgICAgICAgICBpZiAoIGNvbnRleHQub3JkZXIubGVuZ3RoID4gMCAmJiAoIWNvbnRleHQucnVuIHx8ICFjb250ZXh0LnNvcnQpICl7XG4gICAgICAgICAgICAvLyBvcmRlciB0aGUgcmVzdWx0c1xuICAgICAgICAgICAgcmV0dXJucSA9IG9yZGVyQnlDb2woIHJldHVybnEsIGNvbnRleHQub3JkZXIgKTtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICAvLyBJZiBhIGxpbWl0IG9uIHRoZSBudW1iZXIgb2YgcmVzdWx0cyBleGlzdHMgYW5kIGl0IGlzIGxlc3MgdGhhbiB0aGUgcmV0dXJuZWQgcmVzdWx0cywgbGltaXQgcmVzdWx0c1xuICAgICAgICAgIGlmICggcmV0dXJucS5sZW5ndGggJiZcbiAgICAgICAgICAgICgoY29udGV4dC5saW1pdCAmJiBjb250ZXh0LmxpbWl0IDwgcmV0dXJucS5sZW5ndGgpIHx8XG4gICAgICAgICAgICAgIGNvbnRleHQuc3RhcnQpXG4gICAgICAgICAgKSB7XG4gICAgICAgICAgICBsaW1pdHEgPSBbXTtcbiAgICAgICAgICAgIGVhY2goIHJldHVybnEsIGZ1bmN0aW9uICggciwgaSApIHtcbiAgICAgICAgICAgICAgaWYgKCAhY29udGV4dC5zdGFydCB8fFxuICAgICAgICAgICAgICAgIChjb250ZXh0LnN0YXJ0ICYmIChpICsgMSkgPj0gY29udGV4dC5zdGFydCkgKVxuICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgaWYgKCBjb250ZXh0LmxpbWl0ICl7XG4gICAgICAgICAgICAgICAgICBuaSA9IChjb250ZXh0LnN0YXJ0KSA/IChpICsgMSkgLSBjb250ZXh0LnN0YXJ0IDogaTtcbiAgICAgICAgICAgICAgICAgIGlmICggbmkgPCBjb250ZXh0LmxpbWl0ICl7XG4gICAgICAgICAgICAgICAgICAgIGxpbWl0cS5wdXNoKCByICk7XG4gICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICBlbHNlIGlmICggbmkgPiBjb250ZXh0LmxpbWl0ICl7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBUQUZGWS5FWElUO1xuICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICAgIGxpbWl0cS5wdXNoKCByICk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIHJldHVybnEgPSBsaW1pdHE7XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgLy8gdXBkYXRlIGNhY2hlXG4gICAgICAgICAgaWYgKCBzZXR0aW5ncy5jYWNoZVNpemUgJiYgY2lkICE9PSAnbm9jYWNoZScgKXtcbiAgICAgICAgICAgIENhY2hlQ2xlYXIrKztcblxuICAgICAgICAgICAgc2V0VGltZW91dCggZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICB2YXIgYkNvdW50ZXIsIG5jO1xuICAgICAgICAgICAgICBpZiAoIENhY2hlQ2xlYXIgPj0gc2V0dGluZ3MuY2FjaGVTaXplICogMiApe1xuICAgICAgICAgICAgICAgIENhY2hlQ2xlYXIgPSAwO1xuICAgICAgICAgICAgICAgIGJDb3VudGVyID0gQ2FjaGVDb3VudCAtIHNldHRpbmdzLmNhY2hlU2l6ZTtcbiAgICAgICAgICAgICAgICBuYyA9IHt9O1xuICAgICAgICAgICAgICAgIGVhY2hpbiggZnVuY3Rpb24gKCByLCBrICkge1xuICAgICAgICAgICAgICAgICAgaWYgKCByLmkgPj0gYkNvdW50ZXIgKXtcbiAgICAgICAgICAgICAgICAgICAgbmNba10gPSByO1xuICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIENhY2hlID0gbmM7XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0sIDAgKTtcblxuICAgICAgICAgICAgQ2FjaGVbY2lkXSA9IHsgaSA6IENhY2hlQ291bnQrKywgcmVzdWx0cyA6IHJldHVybnEgfTtcbiAgICAgICAgICB9XG4gICAgICAgICAgcmV0dXJuIHJldHVybnE7XG4gICAgICAgIH1cbiAgICAgIH07XG5cblxuICAgICAgcm9vdCA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgdmFyIGlBUEksIGNvbnRleHQ7XG4gICAgICAgIC8vICoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKipcbiAgICAgICAgLy8gKlxuICAgICAgICAvLyAqIFRoZSByb290IGZ1bmN0aW9uIHRoYXQgZ2V0cyByZXR1cm5lZCB3aGVuIGEgbmV3IERCIGlzIGNyZWF0ZWRcbiAgICAgICAgLy8gKiBUYWtlczogdW5saW1pdGVkIGZpbHRlciBhcmd1bWVudHMgYW5kIGNyZWF0ZXMgZmlsdGVycyB0byBiZSBydW4gd2hlbiBhIHF1ZXJ5IGlzIGNhbGxlZFxuICAgICAgICAvLyAqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqIFxuICAgICAgICAvLyAqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqXG4gICAgICAgIC8vICpcbiAgICAgICAgLy8gKiBpQVBJIGlzIHRoZSB0aGUgbWV0aG9kIGNvbGxlY3Rpb24gdmFsaWFibGUgd2hlbiBhIHF1ZXJ5IGhhcyBiZWVuIHN0YXJ0ZWQgYnkgY2FsbGluZyBkYm5hbWVcbiAgICAgICAgLy8gKiBDZXJ0YWluIG1ldGhvZHMgYXJlIG9yIGFyZSBub3QgYXZhbGlhYmxlIG9uY2UgeW91IGhhdmUgc3RhcnRlZCBhIHF1ZXJ5IHN1Y2ggYXMgaW5zZXJ0IC0tIHlvdSBjYW4gb25seSBpbnNlcnQgaW50byByb290XG4gICAgICAgIC8vICoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKipcbiAgICAgICAgaUFQSSA9IFRBRkZZLm1lcmdlT2JqKCBUQUZGWS5tZXJnZU9iaiggQVBJLCB7IGluc2VydCA6IHVuZGVmaW5lZCB9ICksXG4gICAgICAgICAgeyBnZXREQkkgIDogZnVuY3Rpb24gKCkgeyByZXR1cm4gREJJOyB9LFxuICAgICAgICAgICAgZ2V0cm9vdCA6IGZ1bmN0aW9uICggYyApIHsgcmV0dXJuIHJvb3QuY2FsbCggYyApOyB9LFxuICAgICAgICAgIGNvbnRleHQgOiBmdW5jdGlvbiAoIG4gKSB7XG4gICAgICAgICAgICAvLyAqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqXG4gICAgICAgICAgICAvLyAqXG4gICAgICAgICAgICAvLyAqIFRoZSBjb250ZXh0IGNvbnRhaW5zIGFsbCB0aGUgaW5mb3JtYXRpb24gdG8gbWFuYWdlIGEgcXVlcnkgaW5jbHVkaW5nIGZpbHRlcnMsIGxpbWl0cywgYW5kIHNvcnRzXG4gICAgICAgICAgICAvLyAqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqIFxuICAgICAgICAgICAgaWYgKCBuICl7XG4gICAgICAgICAgICAgIGNvbnRleHQgPSBUQUZGWS5tZXJnZU9iaiggY29udGV4dCxcbiAgICAgICAgICAgICAgICBuLmhhc093blByb3BlcnR5KCdyZXN1bHRzJylcbiAgICAgICAgICAgICAgICAgID8gVEFGRlkubWVyZ2VPYmooIG4sIHsgcnVuIDogbmV3IERhdGUoKSwgc29ydDogbmV3IERhdGUoKSB9KVxuICAgICAgICAgICAgICAgICAgOiBuXG4gICAgICAgICAgICAgICk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gY29udGV4dDtcbiAgICAgICAgICB9LFxuICAgICAgICAgIGV4dGVuZCAgOiB1bmRlZmluZWRcbiAgICAgICAgfSk7XG5cbiAgICAgICAgY29udGV4dCA9ICh0aGlzICYmIHRoaXMucSkgPyB0aGlzIDoge1xuICAgICAgICAgIGxpbWl0ICAgICA6IGZhbHNlLFxuICAgICAgICAgIHN0YXJ0ICAgICA6IGZhbHNlLFxuICAgICAgICAgIHEgICAgICAgICA6IFtdLFxuICAgICAgICAgIGZpbHRlclJhdyA6IFtdLFxuICAgICAgICAgIGluZGV4ICAgICA6IFtdLFxuICAgICAgICAgIG9yZGVyICAgICA6IFtdLFxuICAgICAgICAgIHJlc3VsdHMgICA6IGZhbHNlLFxuICAgICAgICAgIHJ1biAgICAgICA6IG51bGwsXG4gICAgICAgICAgc29ydCAgICAgIDogbnVsbCxcbiAgICAgICAgICBzZXR0aW5ncyAgOiBzZXR0aW5nc1xuICAgICAgICB9O1xuICAgICAgICAvLyAqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqXG4gICAgICAgIC8vICpcbiAgICAgICAgLy8gKiBDYWxsIHRoZSBxdWVyeSBtZXRob2QgdG8gc2V0dXAgYSBuZXcgcXVlcnlcbiAgICAgICAgLy8gKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKiBcbiAgICAgICAgZWFjaCggYXJndW1lbnRzLCBmdW5jdGlvbiAoIGYgKSB7XG5cbiAgICAgICAgICBpZiAoIGlzSW5kZXhhYmxlKCBmICkgKXtcbiAgICAgICAgICAgIGNvbnRleHQuaW5kZXgucHVzaCggZiApO1xuICAgICAgICAgIH1cbiAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIGNvbnRleHQucS5wdXNoKCByZXR1cm5GaWx0ZXIoIGYgKSApO1xuICAgICAgICAgIH1cbiAgICAgICAgICBjb250ZXh0LmZpbHRlclJhdy5wdXNoKCBmICk7XG4gICAgICAgIH0pO1xuXG5cbiAgICAgICAgcmV0dXJuIGlBUEk7XG4gICAgICB9O1xuXG4gICAgICAvLyAqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqXG4gICAgICAvLyAqXG4gICAgICAvLyAqIElmIG5ldyByZWNvcmRzIGhhdmUgYmVlbiBwYXNzZWQgb24gY3JlYXRpb24gb2YgdGhlIERCIGVpdGhlciBhcyBKU09OIG9yIGFzIGFuIGFycmF5L29iamVjdCwgaW5zZXJ0IHRoZW1cbiAgICAgIC8vICoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKiogXG4gICAgICBUQysrO1xuICAgICAgaWYgKCBkICl7XG4gICAgICAgIERCSS5pbnNlcnQoIGQgKTtcbiAgICAgIH1cblxuXG4gICAgICByb290Lmluc2VydCA9IERCSS5pbnNlcnQ7XG5cbiAgICAgIHJvb3QubWVyZ2UgPSBmdW5jdGlvbiAoIGksIGtleSwgcnVuRXZlbnQgKSB7XG4gICAgICAgIHZhclxuICAgICAgICAgIHNlYXJjaCAgICAgID0ge30sXG4gICAgICAgICAgZmluYWxTZWFyY2ggPSBbXSxcbiAgICAgICAgICBvYmogICAgICAgICA9IHt9XG4gICAgICAgICAgO1xuXG4gICAgICAgIHJ1bkV2ZW50ICAgID0gcnVuRXZlbnQgfHwgZmFsc2U7XG4gICAgICAgIGtleSAgICAgICAgID0ga2V5ICAgICAgfHwgJ2lkJztcblxuICAgICAgICBlYWNoKCBpLCBmdW5jdGlvbiAoIG8gKSB7XG4gICAgICAgICAgdmFyIGV4aXN0aW5nT2JqZWN0O1xuICAgICAgICAgIHNlYXJjaFtrZXldID0gb1trZXldO1xuICAgICAgICAgIGZpbmFsU2VhcmNoLnB1c2goIG9ba2V5XSApO1xuICAgICAgICAgIGV4aXN0aW5nT2JqZWN0ID0gcm9vdCggc2VhcmNoICkuZmlyc3QoKTtcbiAgICAgICAgICBpZiAoIGV4aXN0aW5nT2JqZWN0ICl7XG4gICAgICAgICAgICBEQkkudXBkYXRlKCBleGlzdGluZ09iamVjdC5fX19pZCwgbywgcnVuRXZlbnQgKTtcbiAgICAgICAgICB9XG4gICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICBEQkkuaW5zZXJ0KCBvLCBydW5FdmVudCApO1xuICAgICAgICAgIH1cbiAgICAgICAgfSk7XG5cbiAgICAgICAgb2JqW2tleV0gPSBmaW5hbFNlYXJjaDtcbiAgICAgICAgcmV0dXJuIHJvb3QoIG9iaiApO1xuICAgICAgfTtcblxuICAgICAgcm9vdC5UQUZGWSA9IHRydWU7XG4gICAgICByb290LnNvcnQgPSBEQkkuc29ydDtcbiAgICAgIC8vICoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKipcbiAgICAgIC8vICpcbiAgICAgIC8vICogVGhlc2UgYXJlIHRoZSBtZXRob2RzIHRoYXQgY2FuIGJlIGFjY2Vzc2VkIG9uIG9mZiB0aGUgcm9vdCBEQiBmdW5jdGlvbi4gRXhhbXBsZSBkYm5hbWUuaW5zZXJ0O1xuICAgICAgLy8gKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKiBcbiAgICAgIHJvb3Quc2V0dGluZ3MgPSBmdW5jdGlvbiAoIG4gKSB7XG4gICAgICAgIC8vICoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKipcbiAgICAgICAgLy8gKlxuICAgICAgICAvLyAqIEdldHRpbmcgYW5kIHNldHRpbmcgZm9yIHRoaXMgREIncyBzZXR0aW5ncy9ldmVudHNcbiAgICAgICAgLy8gKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKiBcbiAgICAgICAgaWYgKCBuICl7XG4gICAgICAgICAgc2V0dGluZ3MgPSBUQUZGWS5tZXJnZU9iaiggc2V0dGluZ3MsIG4gKTtcbiAgICAgICAgICBpZiAoIG4udGVtcGxhdGUgKXtcblxuICAgICAgICAgICAgcm9vdCgpLnVwZGF0ZSggbi50ZW1wbGF0ZSApO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gc2V0dGluZ3M7XG4gICAgICB9O1xuXG4gICAgICAvLyAqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqXG4gICAgICAvLyAqXG4gICAgICAvLyAqIFRoZXNlIGFyZSB0aGUgbWV0aG9kcyB0aGF0IGNhbiBiZSBhY2Nlc3NlZCBvbiBvZmYgdGhlIHJvb3QgREIgZnVuY3Rpb24uIEV4YW1wbGUgZGJuYW1lLmluc2VydDtcbiAgICAgIC8vICoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKiogXG4gICAgICByb290LnN0b3JlID0gZnVuY3Rpb24gKCBuICkge1xuICAgICAgICAvLyAqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqXG4gICAgICAgIC8vICpcbiAgICAgICAgLy8gKiBTZXR1cCBsb2NhbHN0b3JhZ2UgZm9yIHRoaXMgREIgb24gYSBnaXZlbiBuYW1lXG4gICAgICAgIC8vICogUHVsbCBkYXRhIGludG8gdGhlIERCIGFzIG5lZWRlZFxuICAgICAgICAvLyAqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqIFxuICAgICAgICB2YXIgciA9IGZhbHNlLCBpO1xuICAgICAgICBpZiAoIGxvY2FsU3RvcmFnZSApe1xuICAgICAgICAgIGlmICggbiApe1xuICAgICAgICAgICAgaSA9IGxvY2FsU3RvcmFnZS5nZXRJdGVtKCAndGFmZnlfJyArIG4gKTtcbiAgICAgICAgICAgIGlmICggaSAmJiBpLmxlbmd0aCA+IDAgKXtcbiAgICAgICAgICAgICAgcm9vdC5pbnNlcnQoIGkgKTtcbiAgICAgICAgICAgICAgciA9IHRydWU7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAoIFRPYi5sZW5ndGggPiAwICl7XG4gICAgICAgICAgICAgIHNldFRpbWVvdXQoIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICBsb2NhbFN0b3JhZ2Uuc2V0SXRlbSggJ3RhZmZ5XycgKyBzZXR0aW5ncy5zdG9yYWdlTmFtZSxcbiAgICAgICAgICAgICAgICAgIEpTT04uc3RyaW5naWZ5KCBUT2IgKSApO1xuICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG4gICAgICAgICAgcm9vdC5zZXR0aW5ncygge3N0b3JhZ2VOYW1lIDogbn0gKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gcm9vdDtcbiAgICAgIH07XG5cbiAgICAgIC8vICoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKipcbiAgICAgIC8vICpcbiAgICAgIC8vICogUmV0dXJuIHJvb3Qgb24gREIgY3JlYXRpb24gYW5kIHN0YXJ0IGhhdmluZyBmdW5cbiAgICAgIC8vICoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKiogXG4gICAgICByZXR1cm4gcm9vdDtcbiAgICB9O1xuICAgIC8vICoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKipcbiAgICAvLyAqXG4gICAgLy8gKiBTZXRzIHRoZSBnbG9iYWwgVEFGRlkgb2JqZWN0XG4gICAgLy8gKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKiBcbiAgICBUQUZGWSA9IFQ7XG5cblxuICAgIC8vICoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKipcbiAgICAvLyAqXG4gICAgLy8gKiBDcmVhdGUgcHVibGljIGVhY2ggbWV0aG9kXG4gICAgLy8gKlxuICAgIC8vICoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKiogICBcbiAgICBULmVhY2ggPSBlYWNoO1xuXG4gICAgLy8gKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKlxuICAgIC8vICpcbiAgICAvLyAqIENyZWF0ZSBwdWJsaWMgZWFjaGluIG1ldGhvZFxuICAgIC8vICpcbiAgICAvLyAqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqICAgXG4gICAgVC5lYWNoaW4gPSBlYWNoaW47XG4gICAgLy8gKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKlxuICAgIC8vICpcbiAgICAvLyAqIENyZWF0ZSBwdWJsaWMgZXh0ZW5kIG1ldGhvZFxuICAgIC8vICogQWRkIGEgY3VzdG9tIG1ldGhvZCB0byB0aGUgQVBJXG4gICAgLy8gKlxuICAgIC8vICoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKiogICBcbiAgICBULmV4dGVuZCA9IEFQSS5leHRlbmQ7XG5cblxuICAgIC8vICoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKipcbiAgICAvLyAqXG4gICAgLy8gKiBDcmVhdGVzIFRBRkZZLkVYSVQgdmFsdWUgdGhhdCBjYW4gYmUgcmV0dXJuZWQgdG8gc3RvcCBhbiBlYWNoIGxvb3BcbiAgICAvLyAqXG4gICAgLy8gKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKiAgXG4gICAgVEFGRlkuRVhJVCA9ICdUQUZGWUVYSVQnO1xuXG4gICAgLy8gKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKlxuICAgIC8vICpcbiAgICAvLyAqIENyZWF0ZSBwdWJsaWMgdXRpbGl0eSBtZXJnZU9iaiBtZXRob2RcbiAgICAvLyAqIFJldHVybiBhIG5ldyBvYmplY3Qgd2hlcmUgaXRlbXMgZnJvbSBvYmoyXG4gICAgLy8gKiBoYXZlIHJlcGxhY2VkIG9yIGJlZW4gYWRkZWQgdG8gdGhlIGl0ZW1zIGluXG4gICAgLy8gKiBvYmoxXG4gICAgLy8gKiBQdXJwb3NlOiBVc2VkIHRvIGNvbWJpbmUgb2Jqc1xuICAgIC8vICpcbiAgICAvLyAqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqICAgXG4gICAgVEFGRlkubWVyZ2VPYmogPSBmdW5jdGlvbiAoIG9iMSwgb2IyICkge1xuICAgICAgdmFyIGMgPSB7fTtcbiAgICAgIGVhY2hpbiggb2IxLCBmdW5jdGlvbiAoIHYsIG4gKSB7IGNbbl0gPSBvYjFbbl07IH0pO1xuICAgICAgZWFjaGluKCBvYjIsIGZ1bmN0aW9uICggdiwgbiApIHsgY1tuXSA9IG9iMltuXTsgfSk7XG4gICAgICByZXR1cm4gYztcbiAgICB9O1xuXG5cbiAgICAvLyAqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqXG4gICAgLy8gKlxuICAgIC8vICogQ3JlYXRlIHB1YmxpYyB1dGlsaXR5IGhhcyBtZXRob2RcbiAgICAvLyAqIFJldHVybnMgdHJ1ZSBpZiBhIGNvbXBsZXggb2JqZWN0LCBhcnJheVxuICAgIC8vICogb3IgdGFmZnkgY29sbGVjdGlvbiBjb250YWlucyB0aGUgbWF0ZXJpYWxcbiAgICAvLyAqIHByb3ZpZGVkIGluIHRoZSBzZWNvbmQgYXJndW1lbnRcbiAgICAvLyAqIFB1cnBvc2U6IFVzZWQgdG8gY29tYXJlIG9iamVjdHNcbiAgICAvLyAqXG4gICAgLy8gKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKlxuICAgIFRBRkZZLmhhcyA9IGZ1bmN0aW9uICggdmFyMSwgdmFyMiApIHtcblxuICAgICAgdmFyIHJlID0gZmFsc2UsIG47XG5cbiAgICAgIGlmICggKHZhcjEuVEFGRlkpICl7XG4gICAgICAgIHJlID0gdmFyMSggdmFyMiApO1xuICAgICAgICBpZiAoIHJlLmxlbmd0aCA+IDAgKXtcbiAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIGVsc2Uge1xuXG4gICAgICAgIHN3aXRjaCAoIFQudHlwZU9mKCB2YXIxICkgKXtcbiAgICAgICAgICBjYXNlICdvYmplY3QnOlxuICAgICAgICAgICAgaWYgKCBULmlzT2JqZWN0KCB2YXIyICkgKXtcbiAgICAgICAgICAgICAgZWFjaGluKCB2YXIyLCBmdW5jdGlvbiAoIHYsIG4gKSB7XG4gICAgICAgICAgICAgICAgaWYgKCByZSA9PT0gdHJ1ZSAmJiAhVC5pc1VuZGVmaW5lZCggdmFyMVtuXSApICYmXG4gICAgICAgICAgICAgICAgICB2YXIxLmhhc093blByb3BlcnR5KCBuICkgKVxuICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgIHJlID0gVC5oYXMoIHZhcjFbbl0sIHZhcjJbbl0gKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgICByZSA9IGZhbHNlO1xuICAgICAgICAgICAgICAgICAgcmV0dXJuIFRBRkZZLkVYSVQ7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2UgaWYgKCBULmlzQXJyYXkoIHZhcjIgKSApe1xuICAgICAgICAgICAgICBlYWNoKCB2YXIyLCBmdW5jdGlvbiAoIHYsIG4gKSB7XG4gICAgICAgICAgICAgICAgcmUgPSBULmhhcyggdmFyMSwgdmFyMltuXSApO1xuICAgICAgICAgICAgICAgIGlmICggcmUgKXtcbiAgICAgICAgICAgICAgICAgIHJldHVybiBUQUZGWS5FWElUO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIGlmICggVC5pc1N0cmluZyggdmFyMiApICl7XG4gICAgICAgICAgICAgIGlmICggIVRBRkZZLmlzVW5kZWZpbmVkKCB2YXIxW3ZhcjJdICkgKXtcbiAgICAgICAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiByZTtcbiAgICAgICAgICBjYXNlICdhcnJheSc6XG4gICAgICAgICAgICBpZiAoIFQuaXNPYmplY3QoIHZhcjIgKSApe1xuICAgICAgICAgICAgICBlYWNoKCB2YXIxLCBmdW5jdGlvbiAoIHYsIGkgKSB7XG4gICAgICAgICAgICAgICAgcmUgPSBULmhhcyggdmFyMVtpXSwgdmFyMiApO1xuICAgICAgICAgICAgICAgIGlmICggcmUgPT09IHRydWUgKXtcbiAgICAgICAgICAgICAgICAgIHJldHVybiBUQUZGWS5FWElUO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIGlmICggVC5pc0FycmF5KCB2YXIyICkgKXtcbiAgICAgICAgICAgICAgZWFjaCggdmFyMiwgZnVuY3Rpb24gKCB2MiwgaTIgKSB7XG4gICAgICAgICAgICAgICAgZWFjaCggdmFyMSwgZnVuY3Rpb24gKCB2MSwgaTEgKSB7XG4gICAgICAgICAgICAgICAgICByZSA9IFQuaGFzKCB2YXIxW2kxXSwgdmFyMltpMl0gKTtcbiAgICAgICAgICAgICAgICAgIGlmICggcmUgPT09IHRydWUgKXtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIFRBRkZZLkVYSVQ7XG4gICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgaWYgKCByZSA9PT0gdHJ1ZSApe1xuICAgICAgICAgICAgICAgICAgcmV0dXJuIFRBRkZZLkVYSVQ7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2UgaWYgKCBULmlzU3RyaW5nKCB2YXIyICkgfHwgVC5pc051bWJlciggdmFyMiApICl7XG4gICAgICAgICAgICAgcmUgPSBmYWxzZTtcbiAgICAgICAgICAgICAgZm9yICggbiA9IDA7IG4gPCB2YXIxLmxlbmd0aDsgbisrICl7XG4gICAgICAgICAgICAgICAgcmUgPSBULmhhcyggdmFyMVtuXSwgdmFyMiApO1xuICAgICAgICAgICAgICAgIGlmICggcmUgKXtcbiAgICAgICAgICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIHJlO1xuICAgICAgICAgIGNhc2UgJ3N0cmluZyc6XG4gICAgICAgICAgICBpZiAoIFQuaXNTdHJpbmcoIHZhcjIgKSAmJiB2YXIyID09PSB2YXIxICl7XG4gICAgICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICAgIGlmICggVC50eXBlT2YoIHZhcjEgKSA9PT0gVC50eXBlT2YoIHZhcjIgKSAmJiB2YXIxID09PSB2YXIyICl7XG4gICAgICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9O1xuXG4gICAgLy8gKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKlxuICAgIC8vICpcbiAgICAvLyAqIENyZWF0ZSBwdWJsaWMgdXRpbGl0eSBoYXNBbGwgbWV0aG9kXG4gICAgLy8gKiBSZXR1cm5zIHRydWUgaWYgYSBjb21wbGV4IG9iamVjdCwgYXJyYXlcbiAgICAvLyAqIG9yIHRhZmZ5IGNvbGxlY3Rpb24gY29udGFpbnMgdGhlIG1hdGVyaWFsXG4gICAgLy8gKiBwcm92aWRlZCBpbiB0aGUgY2FsbCAtIGZvciBhcnJheXMgaXQgbXVzdFxuICAgIC8vICogY29udGFpbiBhbGwgdGhlIG1hdGVyaWFsIGluIGVhY2ggYXJyYXkgaXRlbVxuICAgIC8vICogUHVycG9zZTogVXNlZCB0byBjb21hcmUgb2JqZWN0c1xuICAgIC8vICpcbiAgICAvLyAqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqXG4gICAgVEFGRlkuaGFzQWxsID0gZnVuY3Rpb24gKCB2YXIxLCB2YXIyICkge1xuXG4gICAgICB2YXIgVCA9IFRBRkZZLCBhcjtcbiAgICAgIGlmICggVC5pc0FycmF5KCB2YXIyICkgKXtcbiAgICAgICAgYXIgPSB0cnVlO1xuICAgICAgICBlYWNoKCB2YXIyLCBmdW5jdGlvbiAoIHYgKSB7XG4gICAgICAgICAgYXIgPSBULmhhcyggdmFyMSwgdiApO1xuICAgICAgICAgIGlmICggYXIgPT09IGZhbHNlICl7XG4gICAgICAgICAgICByZXR1cm4gVEFGRlkuRVhJVDtcbiAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgICAgICByZXR1cm4gYXI7XG4gICAgICB9XG4gICAgICBlbHNlIHtcbiAgICAgICAgcmV0dXJuIFQuaGFzKCB2YXIxLCB2YXIyICk7XG4gICAgICB9XG4gICAgfTtcblxuXG4gICAgLy8gKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKlxuICAgIC8vICpcbiAgICAvLyAqIHR5cGVPZiBGaXhlZCBpbiBKYXZhU2NyaXB0IGFzIHB1YmxpYyB1dGlsaXR5XG4gICAgLy8gKlxuICAgIC8vICoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKipcbiAgICBUQUZGWS50eXBlT2YgPSBmdW5jdGlvbiAoIHYgKSB7XG4gICAgICB2YXIgcyA9IHR5cGVvZiB2O1xuICAgICAgaWYgKCBzID09PSAnb2JqZWN0JyApe1xuICAgICAgICBpZiAoIHYgKXtcbiAgICAgICAgICBpZiAoIHR5cGVvZiB2Lmxlbmd0aCA9PT0gJ251bWJlcicgJiZcbiAgICAgICAgICAgICEodi5wcm9wZXJ0eUlzRW51bWVyYWJsZSggJ2xlbmd0aCcgKSkgKVxuICAgICAgICAgIHtcbiAgICAgICAgICAgIHMgPSAnYXJyYXknO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICBzID0gJ251bGwnO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICByZXR1cm4gcztcbiAgICB9O1xuXG4gICAgLy8gKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKlxuICAgIC8vICpcbiAgICAvLyAqIENyZWF0ZSBwdWJsaWMgdXRpbGl0eSBnZXRPYmplY3RLZXlzIG1ldGhvZFxuICAgIC8vICogUmV0dXJucyBhbiBhcnJheSBvZiBhbiBvYmplY3RzIGtleXNcbiAgICAvLyAqIFB1cnBvc2U6IFVzZWQgdG8gZ2V0IHRoZSBrZXlzIGZvciBhbiBvYmplY3RcbiAgICAvLyAqXG4gICAgLy8gKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKiAgIFxuICAgIFRBRkZZLmdldE9iamVjdEtleXMgPSBmdW5jdGlvbiAoIG9iICkge1xuICAgICAgdmFyIGtBID0gW107XG4gICAgICBlYWNoaW4oIG9iLCBmdW5jdGlvbiAoIG4sIGggKSB7XG4gICAgICAgIGtBLnB1c2goIGggKTtcbiAgICAgIH0pO1xuICAgICAga0Euc29ydCgpO1xuICAgICAgcmV0dXJuIGtBO1xuICAgIH07XG5cbiAgICAvLyAqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqXG4gICAgLy8gKlxuICAgIC8vICogQ3JlYXRlIHB1YmxpYyB1dGlsaXR5IGlzU2FtZUFycmF5XG4gICAgLy8gKiBSZXR1cm5zIGFuIGFycmF5IG9mIGFuIG9iamVjdHMga2V5c1xuICAgIC8vICogUHVycG9zZTogVXNlZCB0byBnZXQgdGhlIGtleXMgZm9yIGFuIG9iamVjdFxuICAgIC8vICpcbiAgICAvLyAqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqICAgXG4gICAgVEFGRlkuaXNTYW1lQXJyYXkgPSBmdW5jdGlvbiAoIGFyMSwgYXIyICkge1xuICAgICAgcmV0dXJuIChUQUZGWS5pc0FycmF5KCBhcjEgKSAmJiBUQUZGWS5pc0FycmF5KCBhcjIgKSAmJlxuICAgICAgICBhcjEuam9pbiggJywnICkgPT09IGFyMi5qb2luKCAnLCcgKSkgPyB0cnVlIDogZmFsc2U7XG4gICAgfTtcblxuICAgIC8vICoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKipcbiAgICAvLyAqXG4gICAgLy8gKiBDcmVhdGUgcHVibGljIHV0aWxpdHkgaXNTYW1lT2JqZWN0IG1ldGhvZFxuICAgIC8vICogUmV0dXJucyB0cnVlIGlmIG9iamVjdHMgY29udGFpbiB0aGUgc2FtZVxuICAgIC8vICogbWF0ZXJpYWwgb3IgZmFsc2UgaWYgdGhleSBkbyBub3RcbiAgICAvLyAqIFB1cnBvc2U6IFVzZWQgdG8gY29tYXJlIG9iamVjdHNcbiAgICAvLyAqXG4gICAgLy8gKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKiAgIFxuICAgIFRBRkZZLmlzU2FtZU9iamVjdCA9IGZ1bmN0aW9uICggb2IxLCBvYjIgKSB7XG4gICAgICB2YXIgVCA9IFRBRkZZLCBydiA9IHRydWU7XG5cbiAgICAgIGlmICggVC5pc09iamVjdCggb2IxICkgJiYgVC5pc09iamVjdCggb2IyICkgKXtcbiAgICAgICAgaWYgKCBULmlzU2FtZUFycmF5KCBULmdldE9iamVjdEtleXMoIG9iMSApLFxuICAgICAgICAgIFQuZ2V0T2JqZWN0S2V5cyggb2IyICkgKSApXG4gICAgICAgIHtcbiAgICAgICAgICBlYWNoaW4oIG9iMSwgZnVuY3Rpb24gKCB2LCBuICkge1xuICAgICAgICAgICAgaWYgKCAhICggKFQuaXNPYmplY3QoIG9iMVtuXSApICYmIFQuaXNPYmplY3QoIG9iMltuXSApICYmXG4gICAgICAgICAgICAgIFQuaXNTYW1lT2JqZWN0KCBvYjFbbl0sIG9iMltuXSApKSB8fFxuICAgICAgICAgICAgICAoVC5pc0FycmF5KCBvYjFbbl0gKSAmJiBULmlzQXJyYXkoIG9iMltuXSApICYmXG4gICAgICAgICAgICAgICAgVC5pc1NhbWVBcnJheSggb2IxW25dLCBvYjJbbl0gKSkgfHwgKG9iMVtuXSA9PT0gb2IyW25dKSApXG4gICAgICAgICAgICApIHtcbiAgICAgICAgICAgICAgcnYgPSBmYWxzZTtcbiAgICAgICAgICAgICAgcmV0dXJuIFRBRkZZLkVYSVQ7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgcnYgPSBmYWxzZTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgZWxzZSB7XG4gICAgICAgIHJ2ID0gZmFsc2U7XG4gICAgICB9XG4gICAgICByZXR1cm4gcnY7XG4gICAgfTtcblxuICAgIC8vICoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKipcbiAgICAvLyAqXG4gICAgLy8gKiBDcmVhdGUgcHVibGljIHV0aWxpdHkgaXNbRGF0YVR5cGVdIG1ldGhvZHNcbiAgICAvLyAqIFJldHVybiB0cnVlIGlmIG9iaiBpcyBkYXRhdHlwZSwgZmFsc2Ugb3RoZXJ3aXNlXG4gICAgLy8gKiBQdXJwb3NlOiBVc2VkIHRvIGRldGVybWluZSBpZiBhcmd1bWVudHMgYXJlIG9mIGNlcnRhaW4gZGF0YSB0eXBlXG4gICAgLy8gKlxuICAgIC8vICogbW1pa293c2tpIDIwMTItMDgtMDYgcmVmYWN0b3JlZCB0byBtYWtlIG11Y2ggbGVzcyBcIm1hZ2ljYWxcIjpcbiAgICAvLyAqICAgZmV3ZXIgY2xvc3VyZXMgYW5kIHBhc3NlcyBqc2xpbnRcbiAgICAvLyAqXG4gICAgLy8gKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKlxuXG4gICAgdHlwZUxpc3QgPSBbXG4gICAgICAnU3RyaW5nJywgICdOdW1iZXInLCAnT2JqZWN0JywgICAnQXJyYXknLFxuICAgICAgJ0Jvb2xlYW4nLCAnTnVsbCcsICAgJ0Z1bmN0aW9uJywgJ1VuZGVmaW5lZCdcbiAgICBdO1xuICBcbiAgICBtYWtlVGVzdCA9IGZ1bmN0aW9uICggdGhpc0tleSApIHtcbiAgICAgIHJldHVybiBmdW5jdGlvbiAoIGRhdGEgKSB7XG4gICAgICAgIHJldHVybiBUQUZGWS50eXBlT2YoIGRhdGEgKSA9PT0gdGhpc0tleS50b0xvd2VyQ2FzZSgpID8gdHJ1ZSA6IGZhbHNlO1xuICAgICAgfTtcbiAgICB9O1xuICBcbiAgICBmb3IgKCBpZHggPSAwOyBpZHggPCB0eXBlTGlzdC5sZW5ndGg7IGlkeCsrICl7XG4gICAgICB0eXBlS2V5ID0gdHlwZUxpc3RbaWR4XTtcbiAgICAgIFRBRkZZWydpcycgKyB0eXBlS2V5XSA9IG1ha2VUZXN0KCB0eXBlS2V5ICk7XG4gICAgfVxuICB9XG59KCkpO1xuXG5pZiAoIHR5cGVvZihleHBvcnRzKSA9PT0gJ29iamVjdCcgKXtcbiAgZXhwb3J0cy50YWZmeSA9IFRBRkZZO1xufVxuXG4iLCIvKlxuICogbWFpbi5qc1xuICogRW50cnkgcG9pbnQgZm9yIHNoZWxsYWMgYXBwXG4qL1xuJ3VzZSBzdHJpY3QnO1xuXG4kKCBkb2N1bWVudCApLnJlYWR5KGZ1bmN0aW9uKCkge1xuICAgIHZhciBzaGVsbGFjID0gcmVxdWlyZSgnLi9zaGVsbGFjLmpzJyk7XG4gICAgc2hlbGxhYy5pbml0TW9kdWxlKCQoXCIjc2hlbGxhYy1hcHBcIiksIGRhdGEpO1xufSk7XG5cbiIsIi8qXG4gKiBzaGVsbGFjLmpzXG4gKiBSb290IG5hbWVzcGFjZSBtb2R1bGVcbiovXG4ndXNlIHN0cmljdCc7XG5cbnZhciBzaGVsbGFjID0gKGZ1bmN0aW9uICgpIHtcbiAgICB2YXIgVEFGRlkgPSByZXF1aXJlKCcuLi9saWIvdGFmZnlkYi90YWZmeS5qcycpLnRhZmZ5O1xuXG5cbiAgICAvLy0tLS0tLS0tLS0tLS0tLS0gQkVHSU4gTU9EVUxFIERFUEVOREVOQ0lFUyAtLS0tLS0tLS0tLS0tLVxuXG4gICAgLy8tLS0tLS0tLS0tLS0tLS0tIEVORCBNT0RVTEUgREVQRU5ERU5DSUVTIC0tLS0tLS0tLS0tLS0tXG5cbiAgICAvLy0tLS0tLS0tLS0tLS0tLS0gQkVHSU4gTU9EVUxFIFNDT1BFIFZBUklBQkxFUyAtLS0tLS0tLS0tLS0tLVxuICAgIHZhclxuICAgIGluaXRNb2R1bGUsXG5cbiAgICBjb25maWdNYXAgPSB7XG4gICAgICAgIG1haW5faHRtbDogU3RyaW5nKCkgK1xuICAgICAgICAgICAgJzxkaXYgY2xhc3M9XCJzaGVsbGFjLWNvbnRhaW5lclwiPjwvZGl2PicsXG5cbiAgICAgICAgY2xpcF90ZW1wbGF0ZV9odG1sOiBTdHJpbmcoKSArXG4gICAgICAgICAgICAnPGEgY2xhc3M9XCJzaGVsbGFjLWNsaXAtYW5jaG9yXCI+PC9hPidcbiAgICB9LFxuXG4gICAgc3RhdGVNYXAgPSB7XG4gICAgICAgICRjb250YWluZXIgIDogdW5kZWZpbmVkXG4gICAgICAgICwgY2xpcF9kYiAgICAgOiBUQUZGWSgpXG4gICAgfSxcblxuICAgIGpxdWVyeU1hcCA9IHt9LFxuXG4gICAgLy8tLS0tLS0tLS0tLS0tLS0tIEVORCBNT0RVTEUgU0NPUEUgVkFSSUFCTEVTIC0tLS0tLS0tLS0tLS0tXG5cblxuICAgIC8vLS0tLS0tLS0tLS0tLS0tLS0tLS0tIEJFR0lOIERPTSBNRVRIT0RTIC0tLS0tLS0tLS0tLS0tLS0tLS0tXG5cbiAgICBzZXRKcXVlcnlNYXAgPSBmdW5jdGlvbigpe1xuICAgICAgICB2YXIgJG91dGVyRGl2ID0gc3RhdGVNYXAuJGNvbnRhaW5lcjtcblxuICAgICAgICBqcXVlcnlNYXAgPSB7XG4gICAgICAgICAgICAkb3V0ZXJEaXYgICAgICAgICAgICAgICAgICAgOiAkb3V0ZXJEaXYsXG4gICAgICAgICAgICAkc2hlbGxhY19jb250YWluZXIgICAgICAgICAgOiAkb3V0ZXJEaXYuZmluZCgnLnNoZWxsYWMtY29udGFpbmVyJylcbiAgICAgICAgfTtcbiAgICB9LFxuXG4gICAgZGlzcGxheV9jbGlwcyA9IGZ1bmN0aW9uKGNsaXBBcnJheSwgJGNvbnRhaW5lcil7XG5cbiAgICAgICAgY2xpcEFycmF5LmZvckVhY2goZnVuY3Rpb24odXJsKXtcblxuICAgICAgICAgICAgdmFyIGFuY2hvciA9IFN0cmluZygpICtcbiAgICAgICAgICAgICc8ZGl2IGNsYXNzPVwicm93IHNoZWxsYWMtY2xpcC1saXN0XCI+JyArXG4gICAgICAgICAgICAgICAgJzxkaXYgY2xhc3M9XCJtZWRpYVwiPicgK1xuICAgICAgICAgICAgICAgICAgICAnPGEgY2xhc3M9XCJwdWxsLWxlZnRcIiBocmVmPVwiJyArIHVybCArICdcIj4nICtcbiAgICAgICAgICAgICAgICAgICAgICAgICc8aW1nIGNsYXNzPVwibWVkaWEtb2JqZWN0IGNsaXBcIiBzcmM9XCIvc3RhdGljL3NoZWxsYWMvYXNzZXRzL3NldmVudHlFaWdodC5wbmdcIiBhbHQ9XCJcIj4nICtcbiAgICAgICAgICAgICAgICAgICAgJzwvYT4nICtcbiAgICAgICAgICAgICAgICAgICAgJzxkaXYgY2xhc3M9XCJtZWRpYS1ib2R5XCI+JyArXG4gICAgICAgICAgICAgICAgICAgICAgICAnPGg0IGNsYXNzPVwibWVkaWEtaGVhZGluZ1wiPk1lZGlhIHRpdGxlPC9oND4nICtcbiAgICAgICAgICAgICAgICAgICAgICAgICc8cCBjbGFzcz1cIm1lZGlhLW1ldGFcIj5NZXRhZGF0YTwvcD4nICtcbiAgICAgICAgICAgICAgICAgICAgICAgICc8cCBjbGFzcz1cIm1lZGlhLWRlc2NyaXB0aW9uXCI+YnJpZWYgZGVzY3JpcHRpb248L3A+JyArXG4gICAgICAgICAgICAgICAgICAgICc8L2Rpdj4nICtcbiAgICAgICAgICAgICAgICAnPC9kaXY+JyArXG4gICAgICAgICAgICAnPC9kaXY+JztcblxuICAgICAgICAgICAgJGNvbnRhaW5lci5hcHBlbmQoYW5jaG9yKTtcblxuICAgICAgICB9KTtcblxuICAgIH07XG4gICAgLy8tLS0tLS0tLS0tLS0tLS0tLS0tLS0gRU5EIERPTSBNRVRIT0RTIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cblxuICAgIC8vLS0tLS0tLS0tLS0tLS0tLS0tLSBCRUdJTiBFVkVOVCBIQU5ETEVSUyAtLS0tLS0tLS0tLS0tLS0tLS0tXG4gICAgLy8gQmVnaW4gRXZlbnQgaGFuZGxlciAvL1xuICAgIC8vIFB1cnBvc2UgICAgOiBIYW5kbGVzIHRoZSBldmVudFxuICAgIC8vIEFyZ3VtZW50cyAgOlxuICAgIC8vICAgKiBldmVudCAtIGpRdWVyeSBldmVudCBvYmplY3QuXG4gICAgLy8gU2V0dGluZ3MgICA6IG5vbmVcbiAgICAvLyBSZXR1cm5zICAgIDogZmFsc2VcbiAgICAvLyBBY3Rpb25zICAgIDpcbiAgICAvLyAgICogUGFyc2VzIHRoZSBVUkkgYW5jaG9yIGNvbXBvbmVudFxuICAgIC8vLS0tLS0tLS0tLS0tLS0tLS0tLS0gRU5EIEVWRU5UIEhBTkRMRVJTIC0tLS0tLS0tLS0tLS0tLS0tLS0tXG5cbiAgICAvLy0tLS0tLS0tLS0tLS0tLS0tLS0gQkVHSU4gUFVCTElDIE1FVEhPRFMgLS0tLS0tLS0tLS0tLS0tLS0tLVxuICAgIC8vIEJlZ2luIFB1YmxpYyBtZXRob2QgL2luaXRNb2R1bGUvXG4gICAgLy8gRXhhbXBsZSAgIDogc3BhLnNoZWxsLmluaXRNb2R1bGUoICQoJyNkaXYnKSApO1xuICAgIC8vIFB1cnBvc2UgICA6XG4gICAgLy8gICBEaXJlY3RzIHRoaXMgYXBwIHRvIG9mZmVyIGl0cyBjYXBhYmlsaXR5IHRvIHRoZSB1c2VyXG4gICAgLy8gQXJndW1lbnRzIDpcbiAgICAvLyAgICogJGNvbnRhaW5lciAoZXhhbXBsZTogJCgnI2RpdicpKS5cbiAgICAvLyAgICAgQSBqUXVlcnkgY29sbGVjdGlvbiB0aGF0IHNob3VsZCByZXByZXNlbnRcbiAgICAvLyAgICAgYSBzaW5nbGUgRE9NIGNvbnRhaW5lclxuICAgIC8vIEFjdGlvbiAgICA6XG4gICAgLy8gICBQb3B1bGF0ZXMgJGNvbnRhaW5lciB3aXRoIHRoZSBzaGVsbCBvZiB0aGUgVUlcbiAgICAvLyAgIGFuZCB0aGVuIGNvbmZpZ3VyZXMgYW5kIGluaXRpYWxpemVzIGZlYXR1cmUgbW9kdWxlcy5cbiAgICAvLyAgIFRoZSBTaGVsbCBpcyBhbHNvIHJlc3BvbnNpYmxlIGZvciBicm93c2VyLXdpZGUgaXNzdWVzXG4gICAgLy8gUmV0dXJucyAgIDogbm9uZVxuICAgIC8vIFRocm93cyAgICA6IG5vbmVcbiAgICBpbml0TW9kdWxlID0gZnVuY3Rpb24oICRjb250YWluZXIsIGRhdGEsIFRBRkZZICl7XG4gICAgICAgIC8vIGxvYWQgSFRNTCBhbmQgbWFwIGpRdWVyeSBjb2xsZWN0aW9uc1xuICAgICAgICBzdGF0ZU1hcC4kY29udGFpbmVyID0gJGNvbnRhaW5lcjtcbiAgICAgICAgJGNvbnRhaW5lci5odG1sKCBjb25maWdNYXAubWFpbl9odG1sICk7XG4gICAgICAgIHNldEpxdWVyeU1hcCgpO1xuXG4gICAgICAgIC8vbG9hZCBkYXRhIGludG8gaW4tYnJvd3NlciBkYXRhYmFzZVxuICAgICAgICBzdGF0ZU1hcC5jbGlwX2RiLmluc2VydChkYXRhKTtcbiAgICAgICAgc3RhdGVNYXAuY2xpcHMgPSBzdGF0ZU1hcC5jbGlwX2RiKCkuZ2V0KCk7XG5cbiAgICAgICAgZGlzcGxheV9jbGlwcyhzdGF0ZU1hcC5jbGlwcywganF1ZXJ5TWFwLiRzaGVsbGFjX2NvbnRhaW5lcik7XG4gICAgICAgIGNvbnNvbGUubG9nKCQoXCIubWVkaWEtb2JqZWN0LmNsaXBcIikpO1xuICAgIH07XG5cbiAgICByZXR1cm4geyBpbml0TW9kdWxlOiBpbml0TW9kdWxlIH1cbn0oKSk7XG5cbm1vZHVsZS5leHBvcnRzID0gc2hlbGxhYztcblxuIl19
