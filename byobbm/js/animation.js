var Animation = function( parent ) {
    this.x = 0;
    this.y = 0;
    this.opacity = 1.0;
    this.currentFrame = 0;
    this.frameCounter = 0;
    this.visible = true;
    this.z = 0;
    this.paused = true;
    this.loop = true;
    this.autoreset = false;
    this.frames = [];
    this.parent = parent;
    this.startTriggers = [];
    this.endTriggers = [];
}

Animation.prototype.render = function( ctx, offsetX, offsetY, imageList ) {

    if( this.visible && this.currentFrame < this.frames.length) {
        // -1 denotes a blank image/time gap
        if( this.frames[this.currentFrame].image > -1 ) {
            ctx.save();            
            
            if( this.opacity < 1.0 ) {
                ctx.globalAlpha = this.opacity;
            }
            ctx.drawImage(imageList[this.frames[this.currentFrame].image], this.x + offsetX + this.frames[this.currentFrame].x, this.y + offsetY + this.frames[this.currentFrame].y );
            ctx.restore();
        }
    }    
}

Animation.prototype.update = function() {
    
    if( !this.paused ) {
    
        this.frameCounter++;
                
        if( this.frameCounter > this.frames[this.currentFrame].duration ) {
            this.frameCounter = 0;
            this.currentFrame++;
        }
        
        if( this.currentFrame >= this.frames.length ) {
            if( this.loop ) {            
                this.currentFrame = 0;
                this.frameCounter = 0;
            }
            else
            {
                this.currentFrame = this.frames.length;                
                this.paused = true;
            }
            // fire end triggers
            this.fireEndTriggers();
            
            if( this.autoreset ) {
                this.reset();
            }
        }                
    }
}

Animation.prototype.start = function() {
    if( this.paused ) {
        // fire start triggers                
        this.fireStartTriggers();
    }
    this.paused = false;
}

Animation.prototype.reset = function() {
    this.currentFrame = 0;
    this.frameCounter = 0;    
}

Animation.prototype.setProp = function( propname, value ) {
    if( this.hasOwnProperty( propname ) ) {
        this[propname] = value;
    }
}

Animation.prototype.execute = function( method, params ) {
    this[ method ] && this[ method ].apply( this, params );
}

Animation.prototype.fireEndTriggers = function() {
    // console.log("Animation is firing end triggers");
    for(var i = 0; i < this.endTriggers.length; i++ ) {
        this.parent.executeTrigger( this.endTriggers[i] );
    }
}

Animation.prototype.fireStartTriggers = function() {
    // console.log("Animation is firing start triggers");
    for(var i = 0; i < this.startTriggers.length; i++ ) {
        this.parent.executeTrigger( this.startTriggers[i] );
    }
}
