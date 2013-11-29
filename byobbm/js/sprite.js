'use strict';

var Sprite = function() {
    this.x = 0;
    this.y = 0;
    this.opacity = 1.0;
    this.image = -1;
    this.visible = true;
    this.z = 0;
}

Sprite.prototype.render = function( ctx, offsetX, offsetY, imageList ) {
    if( this.image > -1 ) {
        if( this.visible ) {
            ctx.save();
            if( this.opacity < 1.0 ) {
                ctx.globalAlpha = this.opacity;
            }
            ctx.drawImage(imageList[this.image], this.x + offsetX, this.y + offsetY );
            ctx.restore();
        }
    }
}

Sprite.prototype.setProp = function( propname, value ) {
    if( this.hasOwnProperty( propname ) ) {
        this[propname] = value;
    }
}

Sprite.prototype.execute = function( method, params ) {
    this[ method ] && this[ method ].apply( this, params );
}
