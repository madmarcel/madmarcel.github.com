'use strict';

var BigBadWolf = function(draw, roofMouth, tongue) {
    this.draw = draw;
    //this.fullSprite = new Sprite( 800, 600, [ { ssx: 0, ssy: 0 } ], 1 );

    this.headVelY = 1;

    this.headTop = {
        'y': 0,
        'sprite': new Sprite( 800, 501, [ { ssx: 0, ssy: 0 } ], 2 ),
        'yMin': 1,
        'yMax': 330
    };

    this.eyes = {
        'x': 74,
        'y': 82,
        'sprite': new Sprite( 73, 18, [ { ssx: 0, ssy: 0 } ], 3 ),
        'moving': false,
        'tx': 74,
        'ty': 82,
        'timer': getTimeStamp()
    };

    this.headBottom = new Sprite( 800, 109, [ { ssx: 0, ssy: 0 } ], 4 );

    this.gums = new Sprite(779, 116, [ { ssx: 0, ssy: 0 } ], 5 );

    this.chomp = new Sprite(577, 163, [ { ssx: 0, ssy: 0 } ], 1 );

    this.throat = new Sprite(104, 485, [ { ssx: 0, ssy: 0 } ], 6 );

    this.tongueSprite = new Sprite(748, 130, [ { ssx: 0, ssy: 0 } ], 9 );

    this.roofMouth = roofMouth;
    this.tongue = tongue;
};

BigBadWolf.prototype = {
    reset: function() {
        this.headTop.y = 0;
        this.headVelY = 1;
    },
    render: function() {

        this.throat.render( this.draw.ctx, 0, 110 + this.headTop.y , false );
        this.gums.render( this.draw.ctx, 0, 128 + this.headTop.y , false );
        this.headTop.sprite.render( this.draw.ctx, 0, this.headTop.y, false );
        this.eyes.sprite.render( this.draw.ctx, this.eyes.x, this.headTop.y + this.eyes.y, false );
    },
    render2: function() {

        this.tongueSprite.render( this.draw.ctx, 20, this.tongue.y - 58 , false );

        this.headBottom.render( this.draw.ctx, 0, 491, false );

        if ( this.headTop.y >= (this.headTop.yMax - 80) && this.headTop.y <= (this.headTop.yMax - 20) && this.headVelY > 0 ) {
            this.draw.text('Duck between his teeth!', 400, 200, 'black', 'center', '40' );
        }

        if ( this.headTop.y >= (this.headTop.yMax - 10) ) {
            this.chomp.render( this.draw.ctx, 147, 420, false );
        }
    },
    update: function( generators ) {

        var now = getTimeStamp();
        this.updateEyes( now );

        this.headTop.y += this.headVelY;

        if ( this.headTop.y > this.headTop.yMax ) {
            this.headVelY = -1;
        }
        if ( this.headTop.y < this.headTop.yMin ) {
            this.headVelY = 1;
        }

        this.roofMouth.y = this.headTop.y + 100;
        if ( this.headTop.y >= (this.headTop.yMax - 10) ) {
            this.roofMouth.isDeadly = true;
        } else {
            this.roofMouth.isDeadly = false;
        }

        // the tongue
        if ( this.headVelY === -1 && this.roofMouth.y < 300 && this.tongue.y > 518) {
            this.tongue.y--;
        }
        if ( this.headVelY === 1 && this.tongue.y < 561 ) {
            this.tongue.y++;
        }

        // shutdown the generators
        if ( this.headTop.y >= (this.headTop.yMax - 100) ) {
            this.toggleGenerators( true, generators );
        }
        else
        {
            this.toggleGenerators( false, generators );
        }
    },
    updateEyes: function( now ) {
        if ( this.eyes.moving ) {

            if ( this.eyes.x < this.eyes.tx ) {
                this.eyes.x++;
            }
            if ( this.eyes.x > this.eyes.tx ) {
                this.eyes.x--;
            }
            if ( this.eyes.y < this.eyes.ty ) {
                this.eyes.y++;
            }
            if ( this.eyes.y > this.eyes.ty ) {
                this.eyes.y--;
            }
            if ( this.eyes.x === this.eyes.tx && this.eyes.y === this.eyes.ty ) {
                this.eyes.moving = false;
            }
        } else {
            if ( now - this.eyes.timer > 800) {
                var radius = 20;
                var angle = Math.random() * Math.PI * 2;
                var nx = Math.floor(Math.cos(angle) * radius);
                var ny = Math.floor(Math.sin(angle) * radius);

                this.eyes.tx = nx + 70;
                this.eyes.ty = ny + 75;

                this.eyes.moving = true;
                this.eyes.timer = getTimeStamp();
            }
        }
    },
    toggleGenerators: function(flag, generators) {
        for(var i = 0; i < generators.length; i++ ) {
            generators[i].toggle(flag);
        }
    }
};
