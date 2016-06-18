'use strict';

window.onload = function() {
    var parent = document.getElementById('mywrapper');

	var game = new Phaser.Game(1024, 768, Phaser.AUTO, parent);
    game.state.add('Boot', GameState.Boot);
    game.state.add('GameOne', GameState.GameOne);
    game.state.add('GameTwo', GameState.GameTwo);
    game.state.start('Boot');
};
