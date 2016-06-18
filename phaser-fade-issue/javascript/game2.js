'use strict';

GameState.GameTwo = function(game){
};

GameState.GameTwo.prototype = {
  	'create': function() {
		this.game.stage.backgroundColor = '#ff8182';
		
		// another thing to click on
		this.thing2 = this.add.sprite(300, 300, 'thing2');
		this.thing2.inputEnabled = true;
	        this.thing2.events.onInputDown.add(this.startGame1, this);
        	this.thing2.input.useHandCursor = true;	
		
		// just some text
		this.text = this.add.text(300, 350, '^ Now click here');

		// setup the event callbacks
		this.camera.onFadeComplete.add(this.fadeComplete,this);
		this.camera.onFlashComplete.add(this.loadingCompleted,this);

		// fast fade in
		this.camera.flash(0xff8182, 500);
	},
	'loadingCompleted': function() {
		// fade in has finished, reset the camera
		this.camera.reset();
	},
	'startGame1': function() {
		// user has clicked on the thing, so reset the camera and start the fast fade out
		this.camera.reset();
		this.camera.fade(0xff8182, 500);
	},
    	'fadeComplete': function () {
		// fade is done, go to next scene
		this.state.start('GameOne');
	}
};
