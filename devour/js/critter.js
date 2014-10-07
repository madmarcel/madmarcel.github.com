var Critter = function( draw, nx, ny ) {
    this.draw = draw;
    this.width = 48;
    this.height = 56;
    this.x = nx;
    this.y = ny;

    this.speed = (Math.random() * 4) + 2;
    this.velX = 0;
    this.velY = (Math.random() * 3) - 1;
    this.friction = 0.9;
    this.gravity = 0.3;

    this.isDead = false;
    this.isStoppedX = false;
    this.isStoppedY = false;

    this.sprite = new Sprite( 48, 56,
                [
                    { ssx: 200, ssy: 6 }, // cat 1
                    { ssx: 251, ssy: 7 }, // cat 2
                    { ssx: 300, ssy: 8 }, // dog 1
                    { ssx: 353, ssy: 6 }, // dog 2,
                    { ssx: 399, ssy: 6 }, // pig 1,
                    { ssx: 447, ssy: 5 }  // pig 2

                 ], 7);

    var m = getRandomInt(0, this.sprite.frames.length);
    this.sprite.setFrame( m );
};

Critter.prototype = {
    update : function( boxes, player ) {

        if ( !this.isDead ) {

            if ( !this.isStoppedX ) {
                if (this.velX > -this.speed) {
                    this.velX--;
                }

                //this.velY = 0; // -this.speed * 2;

                // this.velY *= this.friction;
                this.velX += this.gravity;

                this.x += this.velX;
            }
            if ( !this.isStoppedY ) {
                this.y += this.velY;
            }

            for (var i = 0; i < boxes.length; i++) {

                var dir = colCheck(this, boxes[i]);
                if ( boxes[i].isDeadly && dir !== null ) {
                    this.isDead = true;
                }
            }
            // var dir = colCheck( this, player );
        }
    },
    render : function(){
        this.sprite.render(this.draw.ctx, this.x, this.y, false );
        //this.draw.linerect( this.x, this.y, this.width, this.height, this.isDead ? 'red': 'blue', '2');
    }
};
