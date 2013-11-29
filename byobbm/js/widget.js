'use strict';

// A class that loads and contains the data for a specific widget
var Widget = function( id ) {
    this.id = id;
    this.nodetype = "a";
    this.images = [];
    this.nodes = [];
    this.config = {};
    this.sprites = [];
    this.balls = [];
    this.triggers = [];
    this.animations = [];
    this.counters = [];
}

// releases and clears balls only
Widget.prototype.clearBalls = function(flag) {
    for(var i = 0; i < this.balls.length; i++ ) {
        this.balls[i].reset();
    }
    
    // release all the balls, leave the nodes alone
    this.clearNodes( false );
    
    if( flag ) {
        this.balls = [];
    }
}

// releases balls and/or clears nodes
Widget.prototype.clearNodes = function(flag) {
    for( var i = 0; i < this.nodes.length; i++ ) {
            for( var j = 0; j < this.nodes[i].nodes.length; j++ ) {
                if( this.nodes[i].nodes[j].getNodeType() === "blocking" ) {
                    this.nodes[i].nodes[j].releaseAllBalls();
                }
            }
            if( flag ) {
                this.nodes[i].nodes = [];
            }
    }
    if( flag ) {
        this.nodes = [];
    }
}

// misnamed, leaves the balls alone
Widget.prototype.clearAll = function() {
    this.clearBalls(false);
    this.clearNodes(true);
    this.images = [];    
    this.config = {};
    this.sprites = [];    
    this.triggers = [];
    this.animations = [];
    this.counters = [];
}

Widget.prototype.loadConfig = function() {

    var theConfig = this.loadFile('config');
    
    if( theConfig.hasOwnProperty('nodetype') ) {
        this.nodetype = theConfig.nodetype;
    }
    
    if( theConfig.hasOwnProperty('images') ) {
        
        for( var i = 0; i < theConfig.images.length; i++ ) {
            var imageObj = new Image();
            imageObj.src = BASE_FOLDER + this.id + "/" + theConfig.images[i];        
            this.images[i] = imageObj;
        }
    }
    
    if( theConfig.hasOwnProperty('sprites') ) {
        // create sprite objects from config
        for( var p = 0; p < theConfig.sprites.length; p++ ) {
            var newSprite = new Sprite();
                                
            // only update specified keys
            for( var key in theConfig.sprites[p] ) {
                newSprite[key] = theConfig.sprites[p][key];            
            }
            this.sprites.push( newSprite );
        }
    }
    
    if( theConfig.hasOwnProperty('triggers') ) {
        // create trigger objects from config
        for( var p = 0; p < theConfig.triggers.length; p++ ) {
            
            var newTrigger = new Trigger();
                                
            // only update specified keys
            for( var key in theConfig.triggers[p] ) {                                
                newTrigger[key] = theConfig.triggers[p][key];            
            }                                                                
            this.triggers.push( newTrigger );
        }
    }
    
    // console.dir( this.triggers );
    
    if( theConfig.hasOwnProperty('animations') ) {
        // create animation objects from config
        for( var p = 0; p < theConfig.animations.length; p++ ) {
            
            var newAnimation = new Animation( this );
                                
            // only update specified keys
            for( var key in theConfig.animations[p] ) {                                
                newAnimation[key] = theConfig.animations[p][key];            
            }                                                                
            this.animations.push( newAnimation );
        }
    }
    
    if( theConfig.hasOwnProperty('counters') ) {
        // create counter objects from config
        for( var p = 0; p < theConfig.counters.length; p++ ) {
            
            var newCounter = new Counter( this );
                                
            // only update specified keys
            for( var key in theConfig.counters[p] ) {                                
                newCounter[key] = theConfig.counters[p][key];            
            }            
            this.counters.push( newCounter );
        }
    }
        
    if( theConfig.hasOwnProperty('tracks') ) {
        // create nodes objects from config
        
        // this.nodes = theConfig.tracks;
        for( var p = 0; p < theConfig.tracks.length; p++ ) {
            var track = {};
            
            // only update specified keys
            for( var key in theConfig.tracks[p] ) {
                if( key !== "nodes" ) {
                    track[key] = theConfig.tracks[p][key];
                }
                else
                {
                    track[key] = [];
                    var cNodes = theConfig.tracks[p][key];
                    for(var n = 0; n < cNodes.length; n++ ) {
                        var cNode = cNodes[n];
                        var newNode = null;
                        if( cNode.hasOwnProperty("delayTime") || cNode.hasOwnProperty("blocking") ) {
                            newNode = new BlockingNode( this );
                        }
                        else if ( cNode.hasOwnProperty("switch") ) {
                            newNode = new SwitchNode( this );
                        }
                        else
                        {
                            newNode = new NormalNode();                            
                        }
                        for( var nkey in cNode ) {
                            newNode[nkey] = cNode[nkey];
                        }
                        track[key][n] = newNode;
                    }
                }
            }  
            
            this.nodes[p] = track;
        }
    }
}

Widget.prototype.loadFile = function(name) {
    var req = new XMLHttpRequest();
    
    req.open('GET', BASE_FOLDER + this.id + "/" + name + '.json', false);
    req.send();
    
    return JSON.parse(req.responseText);
}

Widget.prototype.init = function() {
    
}

Widget.prototype.render = function( ctx, offsetX, offsetY ) {
    
    var somestuff = this.sprites.concat(this.balls);
    var stuff = somestuff.concat( this.animations );
    
    // sort the thing by z order
    stuff.sort(function(a,b) {
        return a.z - b.z;
    });
            
    // and draw them
    for( var i = 0; i < stuff.length; i++ ) {       
        stuff[i].render( ctx, offsetX, offsetY, this.images );
    }    
    
    // DEBUG: render the nodes
    /*
    for(var i = 0; i < this.nodes.length; i++ ) {
        var track = this.nodes[i];
        for( var t = 0; t < track.nodes.length; t++) {
            ctx.beginPath();
            ctx.strokeStyle = "red";
            ctx.rect(track.nodes[t].x - 1  + offsetX, track.nodes[t].y - 1 + offsetY, 3, 3); 
            ctx.stroke();            
        }
    } */
}

Widget.prototype.update = function(px,py) {
    
    // update claimed balls
    for( var i = 0; i < this.balls.length; i++ ) {
        if( !this.balls[i].unclaimed ) {
            this.balls[i].update(px,py);
        }
    }
    
    // remove unclaimed balls from widget
    var claimed = [];
    for( var i = 0; i < this.balls.length; i++ ) {
        // only retain claimed balls here
        if( !this.balls[i].unclaimed ) {
            claimed.push( this.balls[i] );
        }        
    }
    // replace our list of balls with list of claimed balls only
    this.balls = claimed;
    
    // don't forget to update the animations
    for( var i = 0; i < this.animations.length; i++ ) {        
            this.animations[i].update();
    }
    
    // and the counters as well
    for( var i = 0; i < this.counters.length; i++ ) {        
            this.counters[i].update();
    }
    
    // and last but not least, update the nodes
    for( var i = 0; i < this.nodes.length; i++ ) {
            for( var j = 0; j < this.nodes[i].nodes.length; j++ ) {
                this.nodes[i].nodes[j].update();
            }
    }    
}

Widget.prototype.checkHitNode = function(x, y, margin) {
    
    for(var i = 0; i < this.nodes.length; i++ ) {
        var track = this.nodes[i];
        for( var t = 0; t < track.nodes.length; t++) {
            if(
                track.nodes[t].x <= x + margin &&
                track.nodes[t].x >= x - margin && 
                track.nodes[t].y <= y + margin &&
                track.nodes[t].y >= y - margin
              ) {
                return { "track": track, "index": t };
            }
        }
    }
    
    return null;
}

Widget.prototype.findClosestEntryNode = function( x, y, offsetX, offsetY, radius ) {
    
    var bestTrack = null;    
    var bestNode = null;
    var bestDistance = 99999;
    
    for(var i = 0; i < this.nodes.length; i++ ) {
        var track = this.nodes[i];                
        
        if( track.nodes.length > 0 ) {
            var entryNode = track.nodes[0];
                                                                        
            var dx = (entryNode.x + offsetX) - x;
            var dy = (entryNode.y + offsetY) - y;
            var distance = Math.sqrt(Math.pow(dx,2) + Math.pow(dy,2));
            
            // console.log( "dist: " + distance + " (x,y) " + x + "," + y + " (dx,dy) " + dx + ", " + dy + " (ex,ey) " + entryNode.x + "," + entryNode.y + " (ax,ay) " + (entryNode.x + offsetX) + "," + (entryNode.y + offsetY));
                        
            if( Math.abs(dx) < radius && Math.abs(dy) < radius ) {
                                
                if( distance <= bestDistance ) {                    
                    bestTrack = track;
                    bestNode = entryNode;
                    bestDistance = distance;
                }
            }
        }
    }
    
    if( bestTrack !== null && bestNode !== null ) {
       return { "track": bestTrack, "target": 0, "distance": bestDistance };
    }    
    return null;
}

Widget.prototype.claimBall = function( ball ) {
    this.balls.push( ball );
}

// a ball hit a node, check the triggers
Widget.prototype.triggerEvent = function( trackid, nodeindex, source ) {
    if( this.triggers.length > 0 ) {        
        for( var i = 0; i < this.triggers.length; i++ ) {
            var theTrigger = this.triggers[i];
            
            if( theTrigger.track == trackid &&
                theTrigger.node == nodeindex
               ) {
                
                this.processActions( theTrigger );                
            }
        }
    }
    
    // also check if we need to start animation for this node:
    var track = this.nodes[ trackid ];
    var theNode = track.nodes[ nodeindex ];
    
    if( theNode.startAnimation !== null ) {
        var anim = this.animations[ theNode.startAnimation ];
        anim.execute( "start", [] );
    }
}

// these are generic triggers, fired by counters, etc.
Widget.prototype.executeTrigger = function( triggerIndex ) {
    if( this.triggers.length > 0 ) {
        var theTrigger = this.triggers[triggerIndex];
        
        this.processActions(theTrigger);
    }
}

Widget.prototype.processActions = function(theTrigger) {
    if( !theTrigger.enabled ) {
        return;
    }
    for( var a = 0; a < theTrigger.actions.length; a++ ) {
        var theTarget = null;
        var theAction = theTrigger.actions[a];
        
        if( theAction.target === 'sprite' ) {
            theTarget = this.sprites[ theAction.index ];                                        
        }
        if( theAction.target === 'ball' ) {
            theTarget = source;                    
        }
        if( theAction.target === 'trigger' ) {
            theTarget = this.triggers[ theAction.index ];
        }                
        if( theAction.target === 'counter' ) {
            theTarget = this.counters[ theAction.index ];
        }
        if( theAction.target === 'animation' ) {
            theTarget = this.animations[ theAction.index ];
        }
        if( theAction.target === 'node' ) {
            var track = this.nodes[ theAction.track ];
            theTarget = track.nodes[ theAction.index ];
        }
        
        if( theTarget !== null ) {
            // console.log("Firing a trigger on " + theAction.target );
            if( theAction.hasOwnProperty("values") ) {
                theTarget.execute( theAction.method, theAction.values );
            }
        }
    }
}
