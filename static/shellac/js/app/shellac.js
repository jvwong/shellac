/*
 * shellac.js
 * Root namespace module
*/

var shellac = (function () {
  'use strict';

  var initModule = function ( $container ) {
    shellac.shell.initModule( $container );
  };

  return { initModule: initModule };
}());