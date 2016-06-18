'use strict';

var GameState = {
};

GameState.Boot = function(game){
};

GameState.Boot.prototype = {
	init: function() {
	},
	create: function() {
		this.game.state.start("GameOne");
	}
};
