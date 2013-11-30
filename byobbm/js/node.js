'use strict';

/* --------------------------------------------
          basic node, does nothing
   -------------------------------------------- */
var NormalNode = function() {    
    this.x = 0;
    this.y = 0;
    this.startAnimation = null;
}

NormalNode.prototype.getNodeType = function() {
    return "basic";
}

NormalNode.prototype.update = function() {    
}

NormalNode.prototype.execute = function( method, params ) {
    this[ method ] && this[ method ].apply( this, params );
}

NormalNode.prototype.setProp = function( propname, value ) {
    if( this.hasOwnProperty( propname ) ) {
        this[propname] = value;
    }
}

/* ----------------------------------------------------------
          switching node, can send ball to either target
   ---------------------------------------------------------- */
var SwitchNode = function( parent ) {    
    this.x = 0;
    this.y = 0;
    this.startAnimation = null;
    // control whether to use alternate or not
    this.toggled = false;
    // points to alternate node
    this.track = 0;
    this.index = 0;
    this.toggleTriggers = [];
    this.parent = parent;
}

SwitchNode.prototype.getNodeType = function() {
    return "switch";
}

SwitchNode.prototype.update = function() {    
}

SwitchNode.prototype.toggleSwitch = function() {
    this.toggled = !this.toggled;
    this.fireTriggers( this.toggleTriggers );
}

SwitchNode.prototype.execute = function( method, params ) {
    this[ method ] && this[ method ].apply( this, params );
}

SwitchNode.prototype.setProp = function( propname, value ) {
    if( this.hasOwnProperty( propname ) ) {
        this[propname] = value;
    }
}

SwitchNode.prototype.fireTriggers = function(list) {
    for(var i = 0; i < list.length; i++ ) {
        this.parent.executeTrigger( list[i] );
    }    
}

/*  --------------------------------------------------------------------
      blocking node, can hold balls indefinitely or delay them for x ms
      
      uses a FIFO to stack the balls
    -------------------------------------------------------------------- */
var BlockingNode = function(parent) {    
    this.x = 0;
    this.y = 0;
    this.FIFO = [];
    // delay for x ms
    this.delayTime = 0;
    // or block until triggered release
    this.blocking = false;
    this.lastRelease = null;
    this.startAnimation = null;
    this.emptyTriggers = [];
    this.thresholdTriggers = [];
    this.addBallTriggers = [];
    this.releaseBallTriggers = [];
    this.parent = parent;
    this.threshold = 0;
    this.showhead = true;
}

BlockingNode.prototype.getNodeType = function() {
    return "blocking";
}

BlockingNode.prototype.update = function() {
    // blocker does nothing, only responds to release
    if( !this.blocking && this.delayTime > 0 ) {
        // delay checks if enough time has passed and then releases a ball
        var now = new Date().getTime();
        
        if( now >= (this.lastRelease + this.delayTime) ) {            
            this.releaseBall();
        }        
    }
}

BlockingNode.prototype.execute = function( method, params ) {
    this[ method ] && this[ method ].apply( this, params );
}

BlockingNode.prototype.setProp = function( propname, value ) {
    if( this.hasOwnProperty( propname ) ) {
        this[propname] = value;
    }
}

BlockingNode.prototype.registerBall = function( ball ) {
    ball.paused = true;
    ball.visible = false;
    this.FIFO.push( ball );
    this.updateFIFO();
    
    this.fireTriggers( this.addBallTriggers );
    
    if( this.delayTime > 0 && this.lastRelease === null ) {
        this.lastRelease = new Date().getTime();
    }
    
    if( this.threshold > 0 && this.FIFO.length >= this.threshold ) {        
        this.fireTriggers( this.thresholdTriggers );
    }
}

BlockingNode.prototype.releaseBall = function() {
   
   if( this.FIFO.length > 0 ) {
        var b = this.FIFO.pop();
        b.paused = false;
        if( this.showhead ) {
            b.visible = true;
        }
        this.lastRelease = new Date().getTime();        
   }
   this.updateFIFO();
   
   this.fireTriggers( this.releaseBallTriggers );
   
   // we're empty
   if( this.FIFO.length < 1 ) {
        this.lastRelease = null;
        this.fireTriggers( this.emptyTriggers );
   }
}

// make sure only the head of the FIFO is visible
BlockingNode.prototype.updateFIFO = function() {
    if( this.showhead ) {
        if( this.FIFO.length > 0 ) {
            this.FIFO[0].visible = true;
        }
    }
}

BlockingNode.prototype.fireTriggers = function(list) {
    for(var i = 0; i < list.length; i++ ) {
        this.parent.executeTrigger( list[i] );
    }    
}

BlockingNode.prototype.emptyFIFO = function() {
    var max = this.FIFO.length;
    var parentNode = this;
    var f = (function(total, theNode) {
        for(var i = 0; i < total; i++ ) {
              theNode.releaseBall();
        };
    })(max, parentNode);    
}

BlockingNode.prototype.releaseAllBalls = function() {
    for(var i = 0; i < this.FIFO.length; i++ ) {
        this.FIFO[i].reset();
    }    
    this.FIFO = [];
}
