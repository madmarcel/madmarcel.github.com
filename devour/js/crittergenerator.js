var CritterGenerator = function( draw, nx, ny, pile ) {
    this.x = nx;
    this.y = ny;
    this.draw = draw;
    this.pile = pile;
    this.lastMove = getTimeStamp();
    this.paused = false;
};

CritterGenerator.prototype = {
    reset : function(){
        this.paused = false;
    },
    update : function(){
        var now = getTimeStamp();

        if ( !this.paused ) {
            if ( now - this.lastMove > 600 ) {
                this.spawnCritter();
                this.lastMove = getTimeStamp();
            }
        }
    },
    render : function(){
        this.draw.rect( this.x, this.y, 5, 5, this.paused ? 'red' : 'green');
    },
    spawnCritter : function() {
        this.pile.push( new Critter( this.draw, this.x, this.y ) );
    },
    toggle: function( flag ) {
        this.paused = flag;
    }
};
