'use strict';

var Trigger = function() {
    this.track = null;
    this.node = null;
    this.target = null;
    this.index = null;
    this.actions = [];
    this.enabled = true;
}

Trigger.prototype.execute = function( method, params ) {    
    this[ method ] && this[ method ].apply( this, params );
}

Trigger.prototype.setProp = function( propname, value ) {
    if( this.hasOwnProperty( propname ) ) {
        this[propname] = value;
    }
}
