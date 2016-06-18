'use strict';

GameState.GameOne = function(game){
	var self = this;
};

GameState.GameOne.prototype = {
	/* So the idea is to create a scene that fades in from blank, 
	 * and when the user performs a certain action the scene fades out again (faster),
	 * and then fades in in the new state
	 * But the transition only works once?? 
         */
	'create': function() {
		
		this.game.stage.backgroundColor = "#7a449c";
		
		// a thing to click on
		this.thing1 = this.add.sprite(100, 100, 'thing1');
		this.thing1.inputEnabled = true;
	        this.thing1.events.onInputDown.add(this.startGame2, this);
        	this.thing1.input.useHandCursor = true;

		// just some text
		this.text = this.add.text(100, 150, '^ Click here');
		
		// setup the event callbacks
		this.camera.onFadeComplete.add(this.fadeComplete,this);
		this.camera.onFlashComplete.add(this.loadingCompleted,this);
		
		// start with a slow fade in
		this.camera.flash(0x7a449c, 2000);
	},
	'loadingCompleted': function() {
		// fade in has finished, reset the camera
		this.camera.reset();
	},
	'startGame2': function() {
		// user has click on the thing, so reset the camera and start the fast fade out
		this.camera.reset();
		this.camera.fade(0x7a449c, 500);
	},
    	'fadeComplete': function () {
		// fade is done, go to next scene
		this.state.start('GameTwo');
	}
};
