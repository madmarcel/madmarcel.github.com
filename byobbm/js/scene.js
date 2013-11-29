'use strict';

// a wrapper around the widget data
var Scene = function(x, y, height, width, loc, widget ) {
    this.x = x || 0;
    this.y = y || 0;
    
    this.height = height || 100;
    this.width = width || 100;
        
    this.location = loc;    
    this.widget = widget;
}

Scene.prototype.render = function( ctx ) {    
    // draw the template
    this.widget.render(ctx, this.x, this.y);        
}

Scene.prototype.update = function() {
    this.widget.update(this.x, this.y);   
}

Scene.prototype.checkHitNode = function( x, y, margin) {
    return this.widget.checkHitNode(x - this.x, y - this.y, margin);  
}

Scene.prototype.findClosestEntryNode = function( x, y, radius ) {
    var result = this.widget.findClosestEntryNode( x, y, this.x, this.y, radius );
    if( result !== null ) {
       result.scene = this;
    }
    return result;
}

Scene.prototype.claimBall = function( ball ) {    
    this.widget.claimBall( ball );
}

Scene.prototype.triggerEvent = function( trackid, nodeindex, source ) {
    this.widget.triggerEvent( trackid, nodeindex, source );
}

Scene.prototype.getType = function() {
    return this.widget.nodetype;
}
