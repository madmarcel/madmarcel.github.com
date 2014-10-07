'use strict';

var Player = function(draw, game) {
    this.draw = draw;
    this.game = game;
    this.height = 72;
    this.width = 38;
    this.x = game.gameSize.width / 2;
    this.y = game.gameSize.height - 120;

    this.speed = 3;
    this.velX = 0;
    this.velY = 0;
    this.friction = 0.9;
    this.jumping = false;
    this.grounded = true;
    this.falling = false;
    this.ducking = false;
    this.gravity = 0.3;

    this.keyboarder = new Keyboard();

    this.goingLeft = false;
    this.spriteWalking = new Sprite( 38, 72,
                [ { ssx: 66, ssy: 0 } ], 7);
    this.spriteJumping = new Sprite( 42, 73,
                [ { ssx: 0, ssy: 0 } ], 7 );
    this.spriteDucking = new Sprite( 44, 41,
                [ { ssx: 126, ssy: 27 } ], 7 );
    this.state = 'walking';
};

Player.prototype = {
    reset: function() {
        this.state = 'walking';
        this.x = this.game.gameSize.width / 2;
        this.y = this.game.gameSize.height - 120;
        this.speed = 3;
        this.velX = 0;
        this.velY = 0;
        this.friction = 0.9;
        this.jumping = false;
        this.grounded = true;
        this.falling = false;
        this.ducking = false;
        this.gravity = 0.3;
        this.goingLeft = false;
    },
    update: function() {

        switch( this.state ) {
            case 'walking':

                // left
                if ((this.keyboarder.isDownNoDelay(this.keyboarder.KEYS.LEFT) || this.keyboarder.isDownNoDelay(this.keyboarder.KEYS.A)) && !this.ducking) {
                    if (this.velX > -this.speed) {
                        this.velX--;
                    }
                    this.goingLeft = true;
                }

                // right
                if ((this.keyboarder.isDownNoDelay(this.keyboarder.KEYS.RIGHT) || this.keyboarder.isDownNoDelay(this.keyboarder.KEYS.D)) && !this.ducking ) {
                    if (this.velX < this.speed) {
                        this.velX++;
                    }
                    this.goingLeft = false;
                }

                if (this.keyboarder.isDownNoDelay(this.keyboarder.KEYS.UP)  || this.keyboarder.isDownNoDelay(this.keyboarder.KEYS.W) ) {
                    // jump up
                    if (!this.jumping && this.grounded){
                        this.jumping = true;
                        this.grounded = false;
                        this.falling = false;
                        this.ducking = false;
                        this.velY = -this.speed * 2;
                    }
                }

                this.ducking = false;
                this.height = 72;
                if ((this.keyboarder.isDownNoDelay(this.keyboarder.KEYS.DOWN)  || this.keyboarder.isDownNoDelay(this.keyboarder.KEYS.S)) && !this.jumping ) {
                    this.ducking = true;
                    this.height = 41;
                    this.y += 25;
                }

                this.velX *= this.friction;
                this.velY += this.gravity;

                this.grounded = false;

                var prevDir = null;

                for (var i = 0; i < this.game.boxes.length; i++) {

                    var dir = colCheck(this, this.game.boxes[i]);

                    // kill player
                    if ( this.game.boxes[i].isDeadly && dir !== null ) {
                        // console.log("You're DEAD!");
                        this.game.state = 'DEAD';
                    }
                    if (dir === 'l' || dir === 'r') {
                        this.velX = 0;
                        this.jumping = false;
                    } else if (dir === 'b') {
                        this.grounded = true;
                        this.jumping = false;
                        this.falling = false;
                    } else if (dir === 't') {
                        this.velY *= -1;
                    }

                    if (dir !== null ) {
                        prevDir = dir;
                    }
                }

                for (var i = 0; i < this.game.critters.length; i++) {
                    if ( !this.game.critters[i].isDead ) {
                        var dir = colCheck(this, this.game.critters[i], prevDir);
                    }
                }

                if (this.grounded){
                     this.velY = 0;
                }

                this.x += this.velX;
                this.y += this.velY;

                if ( this.y > 530 ) {
                    this.y = 500;
                }

            break;
        }
    },

    render: function() {
        switch( this.state ) {
            case 'walking':
                if ( this.jumping || this.falling ) {
                    this.spriteJumping.render( this.draw.ctx, this.x, this.y, !this.goingLeft);
                }
                else if ( this.ducking ) {
                    this.spriteDucking.render( this.draw.ctx, this.x, this.y, !this.goingLeft);
                }
                else
                {
                    this.spriteWalking.render( this.draw.ctx, this.x, this.y, !this.goingLeft);
                }
                break;
        }
        if ( this.x < 80 ) {
            this.draw.text('Stay away from his throat!', 400, 140, 'black', 'center', '40');
        }
    }
};
