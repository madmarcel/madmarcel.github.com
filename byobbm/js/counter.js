'use strict';

var Counter = function( parent ) {
    
    this.parent = parent;
    
    this.minValue = 0;
    this.maxValue = 1000;
    this.currentValue = 0;
    this.loop = false;
    this.enabled = false;
    this.endTriggers = [];
}

Counter.prototype.execute = function( method, params ) {
    this[ method ] && this[ method ].apply( this, params );
}

Counter.prototype.setProp = function( propname, value ) {
    if( this.hasOwnProperty( propname ) ) {
        this[propname] = value;
    }
}

Counter.prototype.start = function() {
    this.enabled = true;
}

Counter.prototype.reset = function() {
    this.currentValue = this.minValue;
}

Counter.prototype.stop = function() {
    this.enabled = false;
}

Counter.prototype.update = function() {
    
    if( this.enabled ) {
        this.currentValue++;
        
        // this.checkTriggers();
        
        if( this.currentValue > this.maxValue ) {
                                    
            this.fireEndTriggers();
            
            if( this.loop ) {
                this.currentValue = this.minValue;
            }
            else {
                this.enabled = false;
            }
        }
    }
}

Counter.prototype.fireEndTriggers = function() {
    for(var i = 0; i < this.endTriggers.length; i++ ) {
        this.parent.executeTrigger( this.endTriggers[i] );
    }
}
