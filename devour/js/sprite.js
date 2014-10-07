var Sprite = function( w, h, frameDef, imageIndex ) {
      this.width = w;
      this.height = h;
      this.frame = 0;
      this.frames = frameDef;
      this.ts = getTimeStamp();
      this.SCALE = 1;
      this.imageIndex = imageIndex || 0;
    };

Sprite.prototype = {
    render: function(ctx, x, y, doFlip){
        var flip = doFlip || false;
        if ( this.frame >= this.frames.length ) {
            this.frame = 0;
        }
        if ( flip ) {
            ctx.save();
            ctx.translate(ctx.canvas.width, 0);
            ctx.scale(-1, 1);
            ctx.drawImage( images[this.imageIndex],
                       this.frames[this.frame].ssx,
                       this.frames[this.frame].ssy,
                       this.width,
                       this.height,
                       // secret sauce: change the destination's X registration point
                       ctx.canvas.width - x - (this.width * this.SCALE),
                       y,
                       this.width * this.SCALE,
                       this.height * this.SCALE);
            ctx.restore();
        }
        else
        {
            ctx.drawImage( images[this.imageIndex],
                       this.frames[this.frame].ssx,
                       this.frames[this.frame].ssy,
                       this.width,
                       this.height,
                       x,
                       y,
                       this.width * this.SCALE,
                       this.height * this.SCALE);
        }
    },
    update: function(){
        var now = getTimeStamp();
        if ( !!this.frames[this.frame].duration && now - this.ts > this.frames[this.frame].duration ) {
            this.ts = now;
            this.nextFrame();
        }
    },
    setFrame: function(newframe) {
        this.frame = newframe;
    },
    nextFrame: function() {
        this.frame++;
        if ( this.frame >= this.frames.length ) {
            this.frame = 0;
        }
    },
    getFrame: function() {
        return this.frame;
    },
    reset: function() {
        this.frame = 0;
        this.ts = getTimeStamp();
    }
};
