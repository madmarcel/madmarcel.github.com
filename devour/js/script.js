(function() {
    'use strict';

    var theGame = null;

    // start game when page has finished loading
    window.addEventListener("load", function() {
      theGame = new Game();
    });
})();
