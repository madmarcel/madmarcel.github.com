'use strict';

var Game = function() {

    var canvas = document.getElementById('mc');
    var context = canvas.getContext('2d');

    this.gameSize = { width: canvas.width, height: canvas.height };

    var SKIPTICKS = 1000 / 60;
    var nextFrame = getTimeStamp();
    var loops = 0;

    this.draw = new Draw( context, this.gameSize );

    this.boxes = [];
    this.boxes.push( new Box( this.draw, 0, 560, 800, 40, false ) );
    this.boxes.push( new Box( this.draw, 95, 514, 3, 50, false ) );
    this.boxes.push( new Box( this.draw, 188, 525, 3, 40, false ) );
    this.boxes.push( new Box( this.draw, 278, 525, 3, 40, false ) );
    this.boxes.push( new Box( this.draw, 378, 525, 3, 40, false ) );
    this.boxes.push( new Box( this.draw, 478, 525, 3, 40, false ) );
    this.boxes.push( new Box( this.draw, 588, 525, 3, 40, false ) );
    this.boxes.push( new Box( this.draw, 688, 525, 3, 40, false ) );
    this.boxes.push( new Box( this.draw, 773, 505, 3, 60, false ) );
    // throat
    this.boxes.push( new Box( this.draw, 0, 150, 30, 420, true ) );

    var wolfMouthRoof = new Box( this.draw, 0, 0, 1000, 80, false );
    var wolfTongue = new Box( this.draw, 40, 560, 710, 80, false );

    this.boxes.push( wolfMouthRoof );
    this.boxes.push( wolfTongue );

    this.bigbadwolf = new BigBadWolf( this.draw, wolfMouthRoof, wolfTongue );

    this.player = new Player( this.draw, this );

    this.critters = [];
    this.generators = [];
    this.generators.push( new CritterGenerator( this.draw, 790, 400, this.critters ) );

    var self = this;

    this.state = 'LOADING';

    this.timer = 0;
    this.timerRunning = false;
    this.timeElapsed = 0.0;

    var tick = function() {
        loops = 0;
        // frame rate independent game speed
        while( getTimeStamp() > nextFrame && loops < 10 ) {
            self.update();
            nextFrame += SKIPTICKS;
            loops++;
        }
        self.render(context);
        requestAnimationFrame(tick);
    };

    this.keyboard = new Keyboard();

    this.gamepad = new Gamepad();

    if (this.gamepad.init()) {
        this.initGamepadControls();
    }
    else
    {
        console.log('Gamepad is not supported.');
    }

    tick();
    this.loadImages();

    this.titleScreen = new Sprite( 800, 600, [ { ssx: 0, ssy: 0 } ], 0 );
    this.deadScreen = new Sprite( 800, 600, [ { ssx: 0, ssy: 0 } ], 8 );
};

Game.prototype = {
    resetGame: function() {
        this.critters = [];
        this.timer = 0;
        this.timerRunning = false;
        this.timeElapsed = 0.0;

        this.player.reset();
        this.bigbadwolf.reset();
        for(var i = 0; i < this.generators.length; i++ ) {
            this.generators[i].reset();
            this.generators[i].pile = this.critters;
        }
    },
    update: function() {

        switch ( this.state) {
            case 'LOADING':
                this.updateLoading();
                break;
            case 'TITLE':
                this.updateTitle();
                break;
            case 'GAME':
                this.updateGame();
                break;
            case 'DEAD':
                this.updateDead();
                break;
        }
    },
    updateLoading: function() {
    },
    updateTitle: function() {
        if ( this.keyboard.isDown( this.keyboard.KEYS.SPACE ) || this.keyboard.isDown( this.keyboard.KEYS.UP ) ) {
            this.state = 'GAME';
            this.startTimer();
        }
    },
    updateGame: function() {

        this.bigbadwolf.update( this.generators );
        this.player.update();
        for(var i = 0; i < this.generators.length; i++ ) {
            this.generators[i].update();
        }
        for(var i = 0; i < this.critters.length; i++ ) {
            if (!this.critters[i].isDead ) {
                this.critters[i].update( this.boxes, this.player );
            }
        }
    },
    updateDead: function() {
        this.stopTimer();
        if ( this.keyboard.isDown( this.keyboard.KEYS.SPACE ) || this.keyboard.isDown( this.keyboard.KEYS.UP ) ) {

            this.resetGame();

            this.state = 'TITLE';
        }
    },
    render: function(screen) {
        screen.clearRect(0, 0, this.gameSize.width, this.gameSize.height);

        switch ( this.state) {
            case 'LOADING':
                this.drawLoadingScreen();
                break;
            case 'TITLE':
                this.drawTitleScreen();
                break;
            case 'GAME':
                this.drawGameScreen();
                break;
            case 'DEAD':
                this.drawDeadScreen();
                break;
        }
    },

    // load our spritesheet
    loadImages: function(){

        var imageNames = [ "title",
                           "chomp",
                           "head-top",
                           "eyes",
                           "head-bottom",
                           "gums",
                           "throat",
                           "critters",
                           "deadscreen",
                           "tongue"
                          ];

        var self = this;

        var check_done = function(count) {
            if ( count >= imageNames.length ) {
                self.state = "TITLE";
            }
        };

        var i_count = 0;

        for( var i = 0; i < imageNames.length; i++ ) {
            var imageObj = new Image();

            imageObj.onload = function() {

                i_count++;
                check_done(i_count);
            };

            imageObj.src = "images/" + imageNames[i] + ".png";
            images[i] = imageObj;
        }
    },

    drawLoadingScreen: function() {
        this.draw.rect(0, 0, this.gameSize.width, this.gameSize.height, '#000');
        this.draw.text('Loading...', this.gameSize.width / 2, this.gameSize.height / 2, 'white', 'center');
    },
    drawTitleScreen: function() {
        this.titleScreen.render( this.draw.ctx, 0, 0, false );
        this.draw.text('Press space to start', this.gameSize.width / 2, 450, 'white', 'center');
        this.draw.text('Controls: Arrow keys or AWSD to move the bunny', 180, 580, 'white', 'center', 10);
    },
    drawGameScreen: function() {
        this.bigbadwolf.render();
        this.player.render();
        for(var i = 0; i < this.critters.length; i++ ) {
            if (!this.critters[i].isDead ) {
                this.critters[i].render();
            }
        }
        this.bigbadwolf.render2();

        if ( DEBUG ) {
            for(var i = 0; i < this.boxes.length; i++ ) {
                this.boxes[i].render();
            }
            for(var i = 0; i < this.generators.length; i++ ) {
                this.generators[i].render();
            }
        }
        this.renderTimer();
    },
    drawDeadScreen: function() {
        this.deadScreen.render( this.draw.ctx, 0, 0, false );
        this.draw.text('You survived for ' + this.timeElapsed.toFixed(1) + ' seconds!', this.gameSize.width / 2, 100, 'black', 'center', 25);
    },

    // init the gamepad
    initGamepadControls: function() {
        var self = this;
        this.gamepad.bind( Gamepad.Event.BUTTON_DOWN,
            function(e) {
                // jump
                if ( e.control === 'FACE_3' ) {
                    keyState['38'] = true;
                }
            }
        );
        this.gamepad.bind( Gamepad.Event.BUTTON_UP,
            function(e) {
                // release jump
                if ( e.control === 'FACE_3' ) {
                    keyState['38'] = false;
                }
            }
        );
        this.gamepad.bind( Gamepad.Event.AXIS_CHANGED,
            function(e) {
                switch( e.axis ) {
                    case 'LEFT_STICK_X':
                        if ( e.value < 0 ) {
                            keyState['37'] = true;
                        }
                        if ( e.value > 0 ) {
                            keyState['39'] = true;
                        }
                        if ( e.value === 0 ) {
                            keyState['37'] = false;
                            keyState['39'] = false;
                        }
                        break;
                    case 'LEFT_STICK_Y':
                        if ( e.value < 0 ) {
                            keyState['38'] = true;
                        }
                        if ( e.value > 0 ) {
                            keyState['40'] = true;
                        }
                        if ( e.value === 0 ) {
                            keyState['40'] = false;
                            keyState['38'] = false;
                        }
                        break;
                }
            }
        );
    },

    startTimer: function() {
      this.timerRunning = true;
      this.timer = getTimeStamp();
    },

    stopTimer: function() {
        this.timerRunning = false;
    },

    renderTimer: function() {
        if ( this.timerRunning ) {
            this.timeElapsed = (getTimeStamp() - this.timer) / 1000;
        }

        this.draw.text( this.timeElapsed.toFixed(1), 780, 40, 'black', 'right', 30 );
    }
};
