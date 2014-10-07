'use strict';

var Draw = function(context, gameSize ) {
    this.ctx = context;
    this.canvasHeight = gameSize.height;
    this.canvasWidth = gameSize.width;
};

Draw.prototype = {

  'invertY' : function(y) {
    return y;
  },
  'line' : function( x1, y1, x2, y2, colour ) {
    this.ctx.strokeStyle = colour;
    this.ctx.beginPath();
    this.ctx.moveTo( x1, this.invertY(y1) );
    this.ctx.lineTo( x2, this.invertY(y2) );
    this.ctx.stroke();
    this.ctx.closePath();
  },
  'dashedLine' : function( x1, y1, x2, y2, colour ) {
    this.ctx.strokeStyle = colour;
    this.ctx.beginPath();
    if ( this.ctx.setLineDash !== undefined )   this.ctx.setLineDash([5,10]);
    if ( this.ctx.mozDash !== undefined )       this.ctx.mozDash = [5,10];
    this.ctx.moveTo( x1, this.invertY(y1) );
    this.ctx.lineTo( x2, this.invertY(y2) );
    this.ctx.stroke();
    this.ctx.closePath();
    if ( this.ctx.setLineDash !== undefined )   this.ctx.setLineDash([]);
    if ( this.ctx.mozDash !== undefined )       this.ctx.mozDash = null;
  },
  'rect' : function( x, y, width, height, colour ) {
    this.ctx.fillStyle = colour;
    this.ctx.fillRect(x, this.invertY(y), width, height);
  },
  'linerect' : function( x, y, width, height, colour, linewidth ) {
    this.ctx.strokeStyle = colour;
    this.ctx.lineWidth = linewidth;
    this.ctx.beginPath();
    this.ctx.rect(x, this.invertY(y), width, height);
    this.ctx.stroke();
  },
  'circle' : function( cx, cy, radius, colour ) {
    this.ctx.fillStyle = colour;
    this.ctx.beginPath();
    this.ctx.arc( cx, this.invertY(cy), radius, 0, 2 * Math.PI, false);
    this.ctx.fill();
  },
  'pixel' : function( x, y, colour ) {
    this.ctx.fillStyle = colour;
    this.ctx.fillRect( x, this.invertY(y), 2, 2 );
  },
  'text' : function( text, x, y, colour, alignment, size ) {
    if ( size ) {
        this.ctx.font = size + "pt Arial";
    } else {
        this.ctx.font = "14pt Arial";
    }
    this.ctx.fillStyle = colour;
    if ( alignment ) {
        this.ctx.textAlign = alignment;
    }
    this.ctx.fillText(text, x, this.invertY(y));
  },
  'restore': function() {
    this.ctx.restore();
  },
  'save' : function() {
    this.ctx.save();
  },
  'translate' : function( x, y ) {
    this.ctx.translate( x, y * -1 );
  },
  'rotate': function( angle ) {
    this.ctx.rotate( angle *  this.RAD );
  },
  'rotRect' : function( angle, bx, by, x, y, width, height, colour ) {
    this.ctx.save();
    this.ctx.translate(bx, this.invertY(by));
    this.ctx.rotate( angle * this.RAD );
    this.ctx.fillStyle = colour;
    this.ctx.fillRect(x, y, width, height);
    this.ctx.restore();
  },
  // [ 5,5, 100,50, 50,100, 10,90 ]
  'polygon' : function ( poly, colour) {
    this.ctx.fillStyle = colour;
    this.ctx.beginPath();
    this.ctx.moveTo(poly[0], this.invertY(poly[1]));
    for ( var item = 2 ; item < poly.length - 1 ; item += 2 )
    {
        this.ctx.lineTo( poly[item] , this.invertY(poly[item + 1]) );
    }
    this.ctx.closePath();
    this.ctx.fill();
  }
};
