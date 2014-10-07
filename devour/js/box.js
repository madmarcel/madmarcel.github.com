var Box = function( draw, nx, ny, nw, nh, isDeadly ) {
    this.draw = draw;
    this.width = nw;
    this.height = nh;
    this.x = nx;
    this.y = ny;
    this.isDeadly = isDeadly;
};

Box.prototype = {
    render : function(){
        this.draw.linerect( this.x, this.y, this.width, this.height, this.isDeadly ? 'red': 'blue', '2');
    }
};
