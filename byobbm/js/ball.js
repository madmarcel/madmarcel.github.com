'use strict';

var Ball = function( x, y, canvas_height, canvas_width, image, parent ) {
    this.x = x || 0;
    this.y = y || 0;
    this.z = 0;
    
    this.visible = true;
    
    this.SIZE = 7;
    
    this.parent = parent;
    
    this.MIN_X = 0 - this.SIZE;
    this.MIN_Y = 0 - this.SIZE;
    this.MAX_X = canvas_width + this.SIZE;
    this.MAX_Y = canvas_height + this.SIZE;
    
    this.y_delta = 0;
    this.x_delta = 0;
    this.image = image;
    this.unclaimed = true;
    this.scene = null;
    this.prevNodeX = null;
    this.prevNodeY = null;
    this.target = null;
    this.track = null;    
    this.paused = false;
    this.performScan = true;
    this.mask = null;
}

Ball.prototype.render = function( ctx, offsetX, offsetY, otherImages ) {
    if( this.visible ) {
        
        if( this.track !== null && this.track.hasOwnProperty('replace') ) {
            ctx.drawImage( otherImages[ this.track.replace.image ], this.x - this.track.replace.x, this.y - this.track.replace.y);                
        }
        else {
            ctx.drawImage(this.image, this.x - 3, this.y - 3);
        }
        
        if( this.mask !== null ) {            
            ctx.drawImage(otherImages[this.mask.index], this.x - 3 + this.mask.x, this.y - 3 + this.mask.y);
        }
        
        // render the target
        /*
        if( this.target !== null && this.track !== null && this.target < this.track.length && this.scene !== null ) {
            ctx.beginPath();
            ctx.strokeStyle = "purple";
            ctx.rect(this.track[this.target].x - 3 + this.scene.x, this.track[this.target].y - 3 + this.scene.y, 7, 7); 
            ctx.stroke();      
        }
        */
        // render a whole bunch of debugging info
        /*
        ctx.font = "10px sans-serif";
        ctx.fillText("x: " + this.x, 700, 10);
        ctx.fillText("y: " + this.y, 700, 20);
        ctx.fillText("target: " + this.target, 700, 30);
        if( this.target !== null && this.track !== null ) {
            if( this.target < this.track.length ) {
                ctx.fillText("target x: " + this.track[this.target].x, 700, 40);
                ctx.fillText("target y: " + this.track[this.target].y, 700, 50);
                ctx.fillText("actual x: " + (this.track[this.target].x + this.scene.x), 700, 60);
                ctx.fillText("actual y: " + (this.track[this.target].y + this.scene.y), 700, 70);
            }
        }
        ctx.fillText("paused : " + this.paused, 700, 80);
        ctx.fillText("unclaimed: " + this.unclaimed, 700, 90);
        ctx.fillText("perScan: " + this.unclaimed, 700, 100);
        */
    }
}

Ball.prototype.update = function(ox,oy) {
    
    if( this.paused ) {
        return;
    }
    
    if( this.performScan ) {
        this.findClosestEntryNode( parent.scenes, 10 );
        this.performScan = false;
        return;
    }
    
    if ( !this.unclaimed ) {
        
        // no nodes left on our track
        if( this.target >= this.track.nodes.length ) {            
            this.unclaimed = true;
            this.performScan = true;
            this.scene = null;
            this.mask = null;
            return;            
        }
        
        if( this.target !== null && this.track !== null ) {
            //console.log( "target: " + this.target + " - tl: " + this.track.length );                        
            
            var currentNode = this.track.nodes[this.target];
            //console.log("Current node:");
            //console.dir(currentNode);
            
            var actualX = ox + currentNode.x;
            var actualY = oy + currentNode.y;
            
            // the ball has hit the target
            if( this.x == actualX && this.y == actualY ) {
                
                if( this.scene !== null && this.track !== null && this.target !== null && this.track.hasOwnProperty('id')) {
                    this.scene.triggerEvent( this.track.id, this.target, this );
                }
                
                if( currentNode.getNodeType() === "blocking" ) {
                    currentNode.registerBall( this );
                }
                
                var changedCourse = false;
                if( currentNode.getNodeType() === "switch" ) {
                    if( currentNode.toggled ) {
                        if( this.scene !== null ) {
                            this.target = currentNode.index;
                            this.track = this.scene.widget.nodes[currentNode.track];
                            changedCourse = true;
                        }
                    }
                }
                
                if( !changedCourse ) {
                    this.target++;
                }
                
                return;
            }
            else
            {
                // make ball move towards target
                if( this.x < actualX ) {
                    this.x_delta = 1;                    
                }
                if( this.x == actualX ) {
                    this.x_delta = 0;
                }
                if( this.x > actualX ) {
                    this.x_delta = -1;
                }
                if( this.y < actualY ) {
                    this.y_delta = 1;
                }
                if( this.y == actualY ) {
                    this.y_delta = 0;
                }
                if( this.y > actualY ) {
                    this.y_delta = -1;
                }                
            }            
        }
    }
    
    this.y += this.y_delta;
    this.x += this.x_delta;
    
    // if balls flies of edge of canvas, wrap around position to opposite side
    if( this.y_delta < 0 ) {
        if( this.y < this.MIN_Y ) {
            this.y = this.MAX_Y;
            this.y_delta = -1;
            this.x_delta = 0;
        }
    }
    if( this.y_delta > 0 ) {
        if( this.y > this.MAX_Y ) {
            this.y = this.MIN_Y;
            this.y_delta = 1;
            this.x_delta = 0;
        }
    }
    if( this.x_delta < 0 ) {
        if( this.x < this.MIN_X ) {
            this.x = this.MAX_X;
            this.y_delta = 0;
            this.x_delta = -1;
            /* this.performScan = true; */
        }
    }
    if( this.x_delta > 0 ) {
        if( this.x > this.MAX_X ) {
            this.x = this.MIN_X;
            this.y_delta = 0;
            this.x_delta = 1;            
        }
    }
}

Ball.prototype.hide = function() {
    this.visible = false;
}

Ball.prototype.show = function() {
    this.visible = true;
}

// this is not efficient
Ball.prototype.findClosestEntryNode = function( scenes, radius ) {
    
    var bestDistance = 99999;
    
    for(var s in scenes ) {
        
        var closestNode = scenes[s].findClosestEntryNode( this.x, this.y, radius );
        
        if( closestNode !== null ) {
            var distance = closestNode.distance;
            
            if( distance <= bestDistance ) {
                /* console.log("----------------------------");
                console.log( " Ball.js - Better distance: " + distance + " <= " + bestDistance );
                console.dir( closestNode );
                console.log("----------------------------"); */
                bestDistance = distance;                
                this.target = closestNode.target;
                this.track = closestNode.track;
                this.scene = closestNode.scene;
                this.mask = null;
                this.z = this.track.z;
            }
        }        
    }
    if( bestDistance == 99999 ) {        
        this.unclaimed = true;
        if( this.track !== null && this.target !== null ) {
            this.prevNodeX = this.track.nodes[this.target-1].x;
            this.prevNodeY = this.track.nodes[this.target-1].y;
        }
        this.target = null;
        this.track = null;
        this.scene = null;
        this.mask = null;
        this.z = 0;
    }
    else
    {
        // console.log("Found a node, passing ball to scene");
        this.unclaimed = false;
        this.scene.claimBall( this );
    }
}

Ball.prototype.setProp = function( propname, value ) {
    //console.log("Propname: " + propname + " new value: " + value);
    if( this.hasOwnProperty( propname ) ) {
        this[propname] = value;
    }
}

Ball.prototype.execute = function( method, params ) {
    //console.log( "method: " + method + " params: " + params);
    this[ method ] && this[ method ].apply( this, params );
}

Ball.prototype.reset = function() {
    this.visible = true;
    this.z = 0;
    this.paused = false;
    this.unclaimed = true;
    this.scene = null;
    this.prevNodeX = null;
    this.prevNodeY = null;
    this.target = null;
    this.track = null;
    this.mask = null;
    this.performScan = true;
    if( this.x_delta === 0 && this.y_delta === 0 ) {
        this.y_delta = 1;
    }
}
