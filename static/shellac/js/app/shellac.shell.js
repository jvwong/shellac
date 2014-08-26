/*
 * shellac.shell.js
 * The basic container for shellac app
*/

shellac.shell = (function () {
  'use strict';

  var initModule = function ( $container ) {
    console.log($container);
  };

  return { initModule: initModule };
}());

