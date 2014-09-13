(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
(function() {
    'use strict';
    var theGame = null;
    // globals
    var MUTE_AUDIO = false;
    var images = [];

    var PAUSE = false;
    var AWAY = false;
    var aa = null;
    var heartsindanger = 0;
    var MAXHEARTS = 32;
    var currentHearts = 0;

    // UTIL FUNCTIONS
    var simpleColCheck = function(shapeA, shapeB) {
        if (shapeA.x < shapeB.x + shapeB.width &&
            shapeA.x + shapeA.width > shapeB.x &&
            shapeA.y < shapeB.y + shapeB.height &&
            shapeA.height + shapeA.y > shapeB.y) {
             return true;
        }
        return false;
    };

    var fps = 0, now, lastUpdate = (new Date())*1;
    var fpsFilter = 50;
    var fpsOut = document.getElementById('fps');
    setInterval(function(){
            fpsOut.innerHTML = fps.toFixed(1) + " fps";
    }, 1000);

    var getTimeStamp = function() {
        return Date.now();
    };

    var getRandomInt = function(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    };

    var getRandomBoolean = function(){
        return Math.random() < 0.5;
    };

    var colCheck = function(shapeA, shapeB) {
        // get the vectors to check against
        var vX = (shapeA.x + (shapeA.width / 2)) - (shapeB.x + (shapeB.width / 2)),
            vY = (shapeA.y + (shapeA.height / 2)) - (shapeB.y + (shapeB.height / 2)),
            // add the half widths and half heights of the objects
            hWidths = (shapeA.width / 2) + (shapeB.width / 2),
            hHeights = (shapeA.height / 2) + (shapeB.height / 2),
            colDir = null;

        // if the x and y vector are less than the half width or half height, they we must be inside the object, causing a collision
        if (Math.abs(vX) < hWidths && Math.abs(vY) < hHeights) {
            // figures out on which side we are colliding (top, bottom, left, or right)
            var oX = hWidths - Math.abs(vX),
            oY = hHeights - Math.abs(vY);
            if (oX >= oY) {
                if (vY > 0) {
                    // reset the falling flag, otherwise we drop straight to the bottom
                    shapeA.falling = false;
                    colDir = 't';
                    if ( shapeB.isPassthrough.bottom ) {
                        colDir = null;
                    } else {
                        shapeA.y += oY;
                    }
                } else {
                    // if we are falling, pass through the appropriate floor
                    if ( shapeB.isPassthrough.bottom && shapeA.falling ) {
                        colDir = null;
                    } else {
                        colDir = 'b';
                        shapeA.y -= oY;
                    }
                }
            } else {
                if (vX > 0) {
                    if ( shapeB.isPassthrough.right ) {
                        colDir = null;
                    } else {
                        colDir = 'l';
                        shapeA.x += oX;
                    }
                } else {
                    if ( shapeB.isPassthrough.left ) {
                        colDir = null;
                    } else {
                        colDir = 'r';
                        shapeA.x -= oX;
                    }
                }
            }
        }
        return colDir;
    };

    // UTIL CLASSES

    var DelayCounter = function( delta ) {
        this.timestamp = getTimeStamp();
        this.deltas = delta || [];
        this.currentDelta = 0;
    };

    DelayCounter.prototype = {
        start : function() {
            this.timestamp = getTimeStamp();
        },
        check: function() {
            if ( getTimeStamp() - this.timestamp > this.deltas[this.currentDelta] ) {
                // console.log( this.deltas[this.currentDelta] + this.timestamp );
                this.next();
                //return true;
            }
            //return false;
        },
        next: function() {
            this.start();
            this.currentDelta++;
            if ( this.currentDelta >= this.deltas.length ) {
                this.currentDelta = 0;
            }
            // console.log( 'next' + this.currentDelta + this.deltas[this.currentDelta] + " - " + this.timestamp );
        },
        getStage: function() {
            this.check();

            return this.currentDelta;
        },
        isDone : function() {
            if ( getTimeStamp() - this.timestamp > this.deltas[this.currentDelta] ) {
                return true;
            }
            return false;
        },
        reset : function() {
            this.timestamp = getTimeStamp();
            this.currentDelta = 0;
        }
    };

    var muteButtonDelay = new DelayCounter([200]);
    var pauseButtonDelay = new DelayCounter([200]);
    var longButtonDelay = new DelayCounter([2000]);

    var Sprite = function( w, h, frameDef ) {
      this.width = w;
      this.height = h;
      this.frame = 0;
      this.frames = frameDef;
      this.ts = getTimeStamp();
    };

    Sprite.prototype = {
        render: function(ctx, x, y, doFlip){
            var flip = doFlip || false;
            if ( this.frame >= this.frames.length ) {
                this.frame = 0;
            }
            if ( flip ) {
                ctx.save();
                ctx.translate(ctx.canvas.width, 0);
                ctx.scale(-1, 1);
                ctx.drawImage( images[0],
                           this.frames[this.frame].ssx,
                           this.frames[this.frame].ssy,
                           this.width,
                           this.height,
                           // secret sauce: change the destination's X registration point
                           ctx.canvas.width - x - (this.width * 2),
                           y,
                           this.width * 2,
                           this.height * 2);
                ctx.restore();
            }
            else
            {
                ctx.drawImage( images[0],
                           this.frames[this.frame].ssx,
                           this.frames[this.frame].ssy,
                           this.width,
                           this.height,
                           x,
                           y,
                           this.width * 2,
                           this.height * 2);
            }
        },
        update: function(){
            var now = getTimeStamp();
            if ( !!this.frames[this.frame].duration && now - this.ts > this.frames[this.frame].duration ) {
                this.ts = now;
                this.nextFrame();
            }
        },
        setFrame: function(newframe) {
            this.frame = newframe;
        },
        nextFrame: function() {
            this.frame++;
            if ( this.frame >= this.frames.length ) {
                this.frame = 0;
            }
        },
        getFrame: function() {
            return this.frame;
        },
        reset: function() {
            this.frame = 0;
            this.ts = getTimeStamp();
        }

    };

    var Keyboarder = function() {
        var keyState = {};
        window.addEventListener('keydown', function(e) {
            keyState[e.keyCode] = true;
        });
        window.addEventListener('keyup', function(e) {
            keyState[e.keyCode] = false;
        });
        this.isDown = function(keyCode) {
            return keyState[keyCode] === true;
        };
        this.anyKeyDown = function(flag){
            var k = Object.keys( keyState );
            for ( var z = 0; z < k.length; z++ ) {
                if ( keyState[k[z]] === true ) {
                    if ( flag ) {
                        if( longButtonDelay.isDone() ) {
                            longButtonDelay.reset();
                            return true;
                        }
                    } else {
                     if( muteButtonDelay.isDone() ) {
                        muteButtonDelay.reset();
                        return true;
                        }
                    }
                }
            }
            return false;
        };
        this.KEYS = { LEFT: 37, RIGHT: 39, UP: 38, DOWN: 40, SPACE: 32, Z: 90, X: 88, C: 67, M: 77, P: 80 };
    };



    // SOUNDS
    var ArcadeAudio = function() {
        this.sounds = {};
        this.mute = MUTE_AUDIO;
    };

    ArcadeAudio.prototype = {
        add : function( key, count, settings ) {
            this.sounds[ key ] = [];
            settings.forEach( function( elem, index ) {
                this.sounds[ key ].push( {
                    tick: 0,
                    count: count,
                    pool: []
                } );
                for ( var i = 0; i < count; i++ ) {
                    var audio = new Audio();
                    audio.src = jsfxr( elem );
                    this.sounds[ key ][ index ].pool.push( audio );
                }
            }, this );
        },
        play : function( key ) {
            if ( !this.mute ) {
                var sound = this.sounds[ key ];
                var soundData = sound.length > 1 ? sound[ Math.floor( Math.random() * sound.length ) ] : sound[ 0 ];
                soundData.pool[ soundData.tick ].play();
                soundData.tick < soundData.count - 1 ? soundData.tick++ : soundData.tick = 0;
            }
        }
    };

    // GAME CLASSES
    var Box = function( nx, ny, nw, nh, passthrough, icebase ) {
        this.width = nw;
        this.height = nh;
        this.x = nx;
        this.y = ny;
        this.isPassthrough = {
            bottom: passthrough.bottom || false,
            left: passthrough.left || false,
            right: passthrough.right || false
        };
        this.icebase = icebase || false;
        this.isEmpty = true;
    };

    Box.prototype = {
        update : function(){},
        render : function(ctx){
            /*
            ctx.fillStyle = 'blue';
            ctx.strokeStyle = 'blue';
            if ( this.isPassthrough.bottom ) {
                ctx.fillStyle = 'black';
                ctx.strokeStyle = 'black';
            }
            if ( this.isPassthrough.left || this.isPassthrough.right ) {
                ctx.fillStyle = 'yellow';
                ctx.strokeStyle = 'yellow';
            }

            ctx.beginPath();
            ctx.lineWidth = '1';
            ctx.rect(this.x, this.y, this.width, this.height);
            ctx.stroke();
            */
            // ctx.fillRect(this.x, this.y, this.width, this.height);
        }
    };

    var Heart = function(nx,ny) {
        this.width = 14;
        this.height = 14;
        this.x = nx;
        this.y = ny;
        this.velX = 0;
        this.velY = getRandomInt(1, 2) / 2;
        this.friction = 0.7;
        this.toggle = getRandomBoolean();
        this.counter = 0;
        this.sideways = getRandomInt(20, 60);
        this.stuck = false;
        this.isDead = false;
        this.spriteStuck = new Sprite( 7, 8,
                                [ { ssx: 0, ssy: 0, duration: 400 },
                                  { ssx: 21, ssy: 0, duration: 400 }] );
        this.spriteFluttering = new Sprite( 7, 8,
                    [ { ssx: 0, ssy: 0, duration: 400 },
                      { ssx: 7, ssy: 0, duration: 400 },
                      { ssx: 14, ssy: 0, duration: 400 }]);
    };

    Heart.prototype = {
        update : function(gameSize, heartStoppers, player){

            if ( !this.stuck && !this.isDead ) {
                if ( this.toggle ) {
                    this.velX += 1;
                    this.counter++;
                } else {
                    this.velX -= 1;
                    this.counter++;
                }

                if (this.counter > this.sideways ) {
                    this.toggle = !this.toggle;
                    this.counter = 0;
                    this.sideways = getRandomInt(40, 60);
                }
                this.velX *= this.friction;
                this.x += this.velX;
                this.y += this.velY;

                for (var i = 0; i < heartStoppers.length; i++) {
                    if ( simpleColCheck(this, heartStoppers[i]) ) {
                        if ( this.x < 5 || this.x > (gameSize.width - 5)) {

                            this.isDead = true;
                            this.stuck = true;

                        } else {
                            if ( !this.stuck && !this.isDead) {
                                heartsindanger++;
                            }
                            this.stuck = true;
                        }
                    }
                }
                this.spriteFluttering.update();
            } else {
                    this.spriteStuck.update();
                    if ( this.x < 5 || this.x > (gameSize.width - 5) ) {
                        this.isDead = true;
                        this.stuck = true;
                        // heartsindanger--;
                    }
            }

            if ( !this.isDead && simpleColCheck( this, player)) {
                    this.isDead = true;
                    aa.play('pickup');
                    currentHearts++;

                    if (currentHearts > MAXHEARTS - 1) {
                        endGame('END');
                    }

                    if ( this.stuck) {
                        heartsindanger--;
                    }
            }
        },
        render: function(ctx){
            if ( !this.stuck ) {
                this.spriteFluttering.render(ctx, this.x, this.y, this.velX < 0 );
            }
            else
            {
                this.spriteStuck.render(ctx, this.x, this.y );
            }
        }
    };

    var HeartSprinkler = function(game, gameSize) {
        this.game = game;
        this.width = 18*2;
        this.height = 26*2;
        this.x = gameSize.width / 2;
        this.y = 77;
        this.speed = 3;
        this.velX = 0;
        this.friction = 0.6;
        this.goingLeft = false;
        this.stopped = false;
        this.counter = 0;
        this.nextStop = 10; // 400;
        this.spriteStopped = new Sprite( 18, 26,
                    [ { ssx: 75, ssy: 73, duration: 200 },
                      { ssx: 93, ssy: 73, duration: 200 } ]);
        this.spriteWalking = new Sprite( 18, 26,
                    [ { ssx: 75, ssy: 73, duration: 200 },
                      { ssx: 111, ssy: 73, duration: 200 } ]);
    };

    HeartSprinkler.prototype = {
        update : function(gameSize){

            if ( !this.stopped ) {
                if ( this.goingLeft ) {
                    if (this.velX > -this.speed) {
                        this.velX--;
                    }
                } else {
                    if (this.velX < this.speed) {
                        this.velX++;
                    }
                }

                this.velX *= this.friction;
                this.x += this.velX;

                if ( this.x > gameSize.width - 100 ) {
                    this.goingLeft = true;
                    this.velX = 0;
                }
                if ( this.x < 100 ) {
                    this.goingLeft = false;
                    this.velX = 0;
                }
            }

            // randomly stop once in a while - 5%
            if ( !this.stopped && this.nextStop < 0 ) {
                var i = getRandomInt(1, 1000);
                if (i > 100 ){ // 995 ) {
                    this.stopped = true;
                    this.counter = getRandomInt(100, 200);
                    this.nextStop = 40; //400
                    this.game.fallingStuff = this.game.fallingStuff.concat( new Heart( this.x, this.y ) );
                    this.spriteStopped.update();
                }
            }

            if ( this.counter > 0 && this.stopped) {
                this.counter--;
                this.spriteStopped.update();
                if ( this.counter <= 0 ) {
                    this.stopped = false;
                    this.spriteWalking.setFrame(0);
                }
            } else {
                this.nextStop--;
                this.spriteWalking.update();
            }
        },
        render : function(ctx){
            if ( this.stopped ) {
                this.spriteStopped.render(ctx, this.x, this.y, !this.goingLeft);
            } else {
                this.spriteWalking.render(ctx, this.x, this.y, !this.goingLeft);
            }

        }
    };

    // MONSTER CLASSES

    var MonsterBlock = function( nx, ny, nw, nh, blocks ) {
        this.width = nw;
        this.height = nh;
        this.x = nx;
        this.y = ny;
        this.blocks = blocks || [];
    };

    MonsterBlock.prototype = {
        doesBlock : function(monsterName) {
            if ( this.blocks.indexOf( monsterName.toLowerCase() ) > -1 ) {
                return true;
            }
            return false;
        }
    };

    // four elemental enemies
    var BadGuy = function(dx,dy, type, btype, speed){
        this.width = 32;
        this.height = 64;
        this.x = dx;
        this.y = dy;
        this.type = type; // 0 = fire, 1 = earth, 2 = ice
        this.lastMove = getTimeStamp();
        this.now = null;
        this.goingLeft = getRandomBoolean();
        this.isDead = false;
        this.lastHit = null;
        this.blocktype = btype;
        this.speed = speed || 2;
        this.targetbase = null;
        this.state = 'w';
        this.spriteA = null;
        this.spriteB = null;
        this.spriteC = null;
        this.myblock = null;
        this.delayCounter = new DelayCounter([800, 800, 200]);
        switch( this.type ) {
            // fire sprite
            case 0 :
                this.spriteA = new Sprite( 12, 15, [ { ssx: 33, ssy: 33, duration: 200 }, { ssx: 45, ssy: 33, duration: 200 } ] );
                this.spriteB = new Sprite( 12, 15, [ { ssx: 57, ssy: 33, duration: 50 }, { ssx: 69, ssy: 33, duration: 50 } ] );
                this.height = 30;
            break;
            // sand monster
            case 1:
                this.spriteA = new Sprite( 18, 3, [ { ssx: 61, ssy: 49, duration: 500 }, { ssx: 79, ssy: 49, duration: 500 } ] );
                this.speed = 1;
                // down = 133
                // up1 = 97
                // up2 = 151
                // down = 133
                this.spriteB = new Sprite( 18, 13, [ { ssx: 133, ssy: 32, duration: 400 } ] );
                for(var i = 0; i < 7; i++ ) {
                    this.spriteB.frames.push( { ssx: 97, ssy: 32, duration: 200 } );
                    this.spriteB.frames.push( { ssx: 151, ssy: 32, duration: 200 } );
                }
                this.spriteB.frames.push( { ssx: 133, ssy: 32, duration: 400 } );
                this.spriteB.frames.push( { ssx: 133, ssy: 32, duration: 100 } );

                // attacking = 115
                this.spriteC = new Sprite( 18, 13, [ { ssx: 115, ssy: 32, duration: 100 } ] );
                this.height = 6;
                this.width = 35;
                this.delayCounter = new DelayCounter([600, 800, 4000, 400]);
                this.delayCounter.currentDelta = getRandomInt(0,3);
                break;
            // snow man
            case 2:
                this.spriteA = new Sprite( 13, 12, [ { ssx: 31, ssy: 53, duration: 200 }, { ssx: 44, ssy: 53, duration: 200 } ] );
                this.spriteB = new Sprite( 13, 12, [ { ssx: 57, ssy: 53, duration: 200 }, { ssx: 70, ssy: 53, duration: 200 } ] );
                this.height = 24;
                this.width = 26;
                break;
            // wind duck
            case 3:
                console.log('here');
                this.haveAttacked = false;
                this.changeDirection = false;
                this.hopHeight = 0;
                this.hop = [ [0,10], [2,20], [2,20], [2,20], [1,20], [0,20], [0,20], [0,20], [-1,20], [-2,20], [-2,20], [-2,20] ];
                //this.spriteA = new Sprite( 13, 12, [ { ssx: 31, ssy: 53, duration: 200 }, { ssx: 44, ssy: 53, duration: 200 } ] );
                //this.spriteB = new Sprite( 13, 12, [ { ssx: 57, ssy: 53, duration: 200 }, { ssx: 70, ssy: 53, duration: 200 } ] );

                this.spriteA = new Sprite( 16, 32, [ { ssx: 42, ssy: 0 },
                                                     { ssx: 58, ssy: 0 },
                                                     { ssx: 74, ssy: 0 },
                                                     { ssx: 90, ssy: 0 } ]);
                break;
        }

    };

    BadGuy.prototype = {
        update: function( monsterblockers, player, things, iceblockbases ) {

            for (var i = 0; i < monsterblockers.length; i++ ) {
                if ( simpleColCheck(this, monsterblockers[i] ) && monsterblockers[i].doesBlock(this.blocktype) && this.lastHit !== monsterblockers[i]) { // put this bit back in - reset it in states below) {
                    this.goingLeft = !this.goingLeft;
                    this.lastHit = monsterblockers[i];
                    if ( this.type === 2 ) {
                        // console.log('collision ' + this.state + ' - ' + this.goingLeft);
                        switch( this.state ) {
                            case 'hb':
                                // get an ice block
                                this.state = 'pb';
                                this.speed = 1;
                                this.myblock = spawnAThing( (this.goingLeft ? this.x - 25: this.x + this.width + 1), this.y - 4, 4, this.goingLeft, false, false, false );
                                break;
                            case 'pb':
                            case 'dj':
                                if ( this.myblock !== null && !this.myblock.isDead) {
                                    this.myblock.isDead = true;
                                    this.myblock = null;
                                }
                                this.state = 'w';
                                this.speed = 1;
                                break;
                            case 't':

                                if( this.goingLeft )
                                {
                                    this.x = -60;
                                } else {
                                    this.x = 1030;
                                }
                                //this.goingLeft = !this.goingLeft;
                                this.state = 'w';
                                this.speed = 1;
                                break;
                        }
                    }
                    break;
                }
            }
            switch( this.type ) {
                case 0:
                    this.updateFireGuy(monsterblockers, player, things);
                    break;
                case 1:
                    this.updateEarthGuy(monsterblockers, player, things);
                    break;
                case 2:
                    this.updateIceGuy(monsterblockers, player, things, iceblockbases);
                    break;
                case 3:
                    this.updateDuck(monsterblockers, player, things);
                    break;
            }
        },
        updateDuck: function( monsterblockers, player, things ) {
            if( this.tcolcheck( ["6"], [ "2", "3", "5", "6", "7" ], things) ) {
                this.state = 'd';
            }

            this.now = getTimeStamp();
            switch( this.state ) {
                case 'd':
                        this.y += 3;
                        if ( this.y > 1000 ) {
                            this.reset();
                        }
                        break;
                // hopping duck
                case 'w':
                    this.spriteA.setFrame(0);
                    if ( !this.isDead ) {
                        if ( this.now - this.lastMove > this.hop[this.hopHeight][1] ) {
                            if ( this.goingLeft ) {
                                this.x -= 2;
                                this.y -= this.hop[this.hopHeight][0];
                            } else {
                                this.x += 2;
                                this.y -= this.hop[this.hopHeight][0];
                            }
                            this.hopHeight++;

                            if ( this.hopHeight >= this.hop.length ) {
                                this.hopHeight = 0;
                                this.hopCounter++;
                                if ( this.changeDirection ) {
                                    this.goingLeft = !this.goingLeft;
                                    this.changeDirection = false;
                                }

                                if ( this.checkForPlayer(player, 800) ) {
                                    this.state = 'l';
                                    this.hopCounter = 0;
                                    this.lastMove = this.now;
                                }
                            }
                            this.lastMove = this.now;

                            // check for collission with monster blockers
                            for (var i = 0; i < monsterblockers.length; i++ ) {
                                if ( simpleColCheck(this, monsterblockers[i] ) && monsterblockers[i].doesBlock('wd') && this.lastHit !== monsterblockers[i]) {
                                    this.lastHit = monsterblockers[i];
                                    this.changeDirection = true;
                                }
                            }
                        }
                        if ( this.hopCounter > 13 ) {
                            this.state = 's';
                            this.lastMove = this.now;
                        }

                    }
                    break;
                // looking around
                case 's':
                    // check if player collides with alarm box
                    if ( this.checkForPlayer(player, 800) ) {
                        this.state = 'l';
                        this.hopCounter = 0;
                        this.lastMove = this.now;
                    } else if ( this.now - this.lastMove > 1300 ) {
                        // back to hopping
                        this.lastMove = this.now;
                        this.state = 'w';
                        this.hopCounter = 0;
                        this.haveAttacked = false;
                    } else if ( this.now - this.lastMove > 900 ) {
                        // look right again
                        this.spriteA.setFrame(1);
                    } else if ( this.now - this.lastMove > 300 ) {
                        this.spriteA.setFrame(0);
                    }
                    break;
                // alarm
                case 'l':
                    this.spriteA.setFrame(2);
                    if ( this.now - this.lastMove > 500 ) {
                        this.state = 'a';
                        this.lastMove = this.now;
                        this.haveAttacked = false;
                    }
                    break;
                // attack
                case 'a':
                    if ( !this.haveAttacked ) {
                        aa.play('cheep');
                        this.attack();
                        this.haveAttacked = true;
                        this.spriteA.setFrame(3);
                    }

                    if ( this.now - this.lastMove > 1000 ) {
                        this.lastMove = this.now;
                        this.state = 'w';
                        this.hopCounter = 11;
                        this.haveAttacked = false;
                    }
                    break;
            }
        },
        updateFireGuy: function( monsterblockers, player, things ) {
            if( this.tcolcheck( ["7"], [ "2", "3", "5", "6", "7" ], things) ) {
                this.state = 'd';
            }

            switch( this.state ) {
                case 'd':
                        this.y += 3;
                        if ( this.y > 1000 ) {
                            this.reset();
                        }
                        break;
                case 'w':
                    this.walkLeftRight();
                    this.spriteA.update();
                    switch ( this.delayCounter.getStage() ) {
                        case 1:
                        case 2:
                        // check if player in sight
                        if ( this.checkForPlayer(player, 100)) {
                            this.state = 'a';
                            this.delayCounter.reset();
                        }
                        break;
                    }
                    break;
                case 'a':
                    this.spriteB.update();
                    switch ( this.delayCounter.getStage() ) {
                        case 1:
                            // do attack
                            this.attack();
                            this.state = 'w';
                            this.delayCounter.reset();
                        break;
                    }
                    break;
            }
        },
        tcolcheck : function( t, kt, things ) {
            for(var i = 0; i < things.length; i++ ) {
                if( !things[i].isDead && simpleColCheck(this, things[i] ) ) {
                    if ( kt.indexOf( "" + things[i].type ) > -1 ) {
                        things[i].isDead = true;
                    }
                    if( t.indexOf( "" + things[i].type ) > -1 ) {
                        return true;
                    }
                }
            }
            return false;
        },
        updateIceGuy: function( monsterblockers, player, things, icebases ) {
            this.walkLeftRight();
            this.spriteA.update();
            this.spriteB.update();

            if( this.tcolcheck( ["5"], [ "2", "3", "5", "6", "7" ], things) ) {
                this.state = 'd';
            }

            switch( this.state ) {
                case 'd':
                        this.y += 3;
                        if ( this.y > 1000 ) {
                            this.reset();
                        }
                        break;
                // just walking
                case 'w':
                        var dohurry = false;
                        if ( simpleColCheck(this, icebases[12] ) ) {
                            if ( icebases[12].isEmpty ) {
                                dohurry = true;
                            }
                        }
                        for(var j = 0; j < things.length; j++ ) {
                            if ( !things[j].isDead && things[j].type === 4 ) {
                                if ( simpleColCheck(this, things[j] ) ) {
                                    dohurry = true;
                                }
                            }
                        }

                        if (dohurry) {
                            this.state = 'hb';
                            this.speed = 4;
                            this.goingLeft = !this.goingLeft;
                            this.lastHit = null;
                            this.targetbase = 12;
                            icebases[12].isEmpty = false;
                            if ( this.x < 150 || this.x > 840 ) {
                                this.state = 't';
                            }
                        }

                        break;
                // pushing block of ice
                case 'pb':

                    var donejob = false;

                    if ( this.myblock !== null && !this.myblock.isDead ) {
                        //this.myblock.push( this.goingLeft );
                    }
                    else
                    {
                        donejob = true;
                    }

                    var t = [ "2", "3", "5", "6", "7" ];
                    if ( !donejob ) {
                        for (var j = 0; j < things.length; j++ ) {
                            if ( !things[j].isDead )
                                if( things[j].type === 4 && this.myblock !== things[j] && simpleColCheck(this.myblock, things[j] ) ) {
                                    donejob = true;
                                }

                                if( t.indexOf( "" + things[j].type ) > -1 && simpleColCheck(this.myblock, things[j] ) ) {
                                    things[j].isDead = true;
                                    if ( things[j].type === 5 ) {
                                        this.myblock.isDead = true;
                                        if ( this.myblock.flagged ) {
                                            icebases[12].isEmpty = true;
                                        }
                                    }
                                }
                        }

                        for (var k = 0; k < icebases.length; k++ ) {
                            if ( simpleColCheck(this, icebases[k] ) && k === this.targetbase ) {
                                this.myblock.flagged = true;
                                donejob = true;
                            }
                        }
                    }
                    if ( donejob ) {
                        this.state = 'dj';
                        this.speed = 4;
                        this.targetbase = null;
                        this.goingLeft = !this.goingLeft;
                        this.lastHit = null;
                        this.myblock = null;
                    }

                    break;
            }
        },
        updateEarthGuy: function( monsterblockers, player, things ) {
            this.walkLeftRight();
            switch( this.state ) {
                case 'w':
                    this.spriteA.update();
                    if( this.delayCounter.getStage() > 2 ) {
                        this.state = 'up';
                        this.height = 26;
                        this.y -= 19;
                        this.spriteB.reset();
                    }
                    break;
                case 'up':
                    this.spriteB.update();
                    if ( this.spriteB.getFrame() > 0 && this.spriteB.getFrame() < 16 ) {
                        if ( this.checkForPlayer(player, 80)) {
                            this.state = 'a';
                            this.delayCounter.reset();
                        }
                    }
                    if ( this.spriteB.getFrame() > 15 ) {
                        this.state = 'w';
                        this.y += 19;
                        this.height = 6;
                        this.delayCounter.reset();
                    }
                    break;
                case 'a':
                    if( this.delayCounter.getStage() === 1 ) {
                        spawnAThing( (this.goingLeft ? this.x - 5 : this.x + this.width - 5), this.y + this.height, 3, this.goingLeft, true, true, false );
                        this.state = 'up';
                        this.delayCounter.reset();
                    }
                    break;
            }
        },
        walkLeftRight: function() {
            if ( !this.isDead ) {
                this.now = getTimeStamp();
                if ( this.now - this.lastMove > 10 ) {
                    if ( this.goingLeft ) {
                        this.x -= this.speed;
                    } else {
                        this.x += this.speed;
                    }
                    this.lastMove = this.now;

                    if ( this.type === 2 && this.state === 'pb' && this.myblock !== null && !this.myblock.isDead) {
                        this.myblock.push( this.goingLeft );
                    }
                }
            }
        },
        reset: function(ctx) {
            this.state = 'w';
            this.isDead = false;
            this.myblock = null;
            this.targetbase = null;
            switch( this.type ) {
                case 3:
                    this.x = 200;
                    this.y = 367;
                    this.hopCounter = 0;
                    this.hopHeight = 0;
                    break;
                case 2:
                    this.x = -50;
                    this.y = 705;
                    break;
                case 1:
                    this.y = 575;
                    break;
                case 0:
                    this.y = 251;
                    break;
            }
        },
        render: function(ctx){
            switch( this.type ) {
                case 0:
                    this.drawFireGuy(ctx);
                    break;
                case 1:
                    this.drawEarthGuy(ctx);
                    break;
                case 2:
                    this.drawIceGuy(ctx);
                    break;
                case 3:
                    this.drawDuck(ctx);
                    break;
            }
        },
        drawDuck: function(ctx) {
            this.spriteA.render(ctx, this.x, this.y, !this.goingLeft );
        },
        drawFireGuy: function(ctx) {
            switch( this.state ) {
                case 'd':
                case 'w':
                    this.spriteA.render(ctx, this.x, this.y, !this.goingLeft );
                    break;
                case 'a':
                    this.spriteB.render(ctx, this.x, this.y, !this.goingLeft );
                    break;
            }
        },
        drawIceGuy: function(ctx) {
            switch( this.state ) {
                case 't':
                case 'w':
                case 'd':
                    this.spriteA.render(ctx, this.x, this.y, !this.goingLeft );
                    break;
                case 'hb':
                case 'pb':
                case 'dj':
                    this.spriteB.render(ctx, this.x, this.y, !this.goingLeft );
                    break;
            }

        },
        drawEarthGuy: function(ctx) {
            //ctx.fillStyle = 'yellow';
            //ctx.fillRect(this.x, this.y, this.width, this.height);

            switch( this.state ) {
                case 'w':
                        this.spriteA.render(ctx, this.x, this.y, !this.goingLeft );
                        break;
                case 'up':
                        this.spriteB.render(ctx, this.x, this.y, !this.goingLeft );
                        break;
                case 'a':
                        this.spriteC.render(ctx, this.x, this.y, !this.goingLeft );
                        break;

            }
        },
        checkForPlayer: function(player, distance) {
            if ( !this.goingLeft ) {
                if ( simpleColCheck( player, { x: this.x, y: (this.y + this.height / 2), width: distance, height: 2 } ) ) {
                    return true;
                }
            } else {
                if ( simpleColCheck( player, { x: this.x - distance, y: (this.y + this.height / 2), width: distance, height: 2 } ) ) {
                    return true;
                }
            }
            return false;
        },
        attack: function() {
            switch( this.type ) {
                case 0:
                    // three fireballs
                    // forward
                    spawnAThing( (this.goingLeft ? this.x - this.width - 5 : this.x + this.width + 5), this.y + this.height, 2, this.goingLeft, true, true, false );
                    // diag up
                    spawnAThing( (this.goingLeft ? this.x - this.width - 5 : this.x + this.width + 5), this.y + this.height, 2, this.goingLeft, true, true, true );
                    // diag down
                    spawnAThing( (this.goingLeft ? this.x - this.width - 5 : this.x + this.width + 5), this.y + this.height, 2, this.goingLeft, false, true, true );
                    break;
                case 3:
                    spawnAThing( this.goingLeft ? this.x - this.width - 10 : this.x + this.width + 10, this.y + this.height, 1, this.goingLeft, false, true, false );
                    break;
            }
        }
    };

    var Thingee = function(dx,dy,dtype,a,b,c,d) {

        this.width = 32;
        this.height = 64;
        this.x = dx;
        this.y = dy;
        this.type = dtype;
        this.lifespan = 1000;
        this.goingLeft = a || false;
        this.goingUp = b || false;
        this.moveHoriz = c || false;
        this.moveVert = d || false;
        this.spawnTime = getTimeStamp();
        this.isDead = false;
        this.velX = 0;
        this.velY = 0;
        this.speed = 1;
        this.friction = 0.9;
        this.sprite = null;
        this.fluctuatorX = 0;
        this.fluctuatorY = 5;
        this.dX = -1;
        this.dY = -1;
        this.isPassthrough = {};
        this.flagged = false;

        switch ( this.type ) {
            // whirlwind
            case 1:
                this.lifespan = 3500;
                this.y = this.y - this.height - 1;
                this.speed = 3;
                this.sprite = new Sprite( 16, 32,
                    [ { ssx: 0, ssy: 40, duration: 100 },
                      { ssx: 15, ssy: 40, duration: 100 }  ]);
                break;
            // fireball
            case 5:
            case 2:
                this.lifespan = 3500;
                this.speed = 4;
                this.sprite = new Sprite( 7, 7, [ { ssx: 81, ssy: 34 } ]);
                this.y = this.y - 18;
                break;
            // rock
            case 3:
                this.speed = 2;
            case 6:
                this.lifespan = 2000;
                this.speed = 4;
                this.sprite = new Sprite( 8, 7, [ { ssx: 88, ssy: 34 } ]);
                this.y = this.y - 18;
                break;
            // enemy iceblock
            case 4:
                this.lifespan = 0;
                this.speed = 1;
                this.sprite = new Sprite( 12, 29, [ { ssx: 106, ssy: 0 } ]);
                this.y = this.y - 30;
                this.width = 24;
                this.isPassthrough = {
                    bottom: false,
                    left: false,
                    right: false
                };
                break;
            // snowball
            case 7:
                this.lifespan = 3500;
                this.speed = 5;
                this.sprite = new Sprite( 7, 7, [ { ssx: 83, ssy: 53 } ]);
                this.y = this.y - 18;
                break;
        }
    };

    Thingee.prototype = {
        update: function( player ) {
            // 0 lifespan = doesn't expire
            if ( this.lifespan > 0 ) {
                var now = getTimeStamp();
                if ( now - this.spawnTime > this.lifespan ) {
                    this.isDead = true;
                    if ( this.flagged ) {
                        this.flagged = false;
                        icebases[12].isEmpty = true;
                    }
                }
            }
            if ( this.moveHoriz ) {
                if ( this.goingLeft ) {
                    if (this.velX > -this.speed) {
                        this.velX--;
                    }
                } else {
                    if (this.velX < this.speed) {
                        this.velX++;
                    }
                }
            }
            if ( this.moveVert ) {
                if ( this.goingUp ) {
                    if (this.velY > -this.speed) {
                        this.velY--;
                    }
                } else {
                    if (this.velY < this.speed) {
                        this.velY++;
                    }
                }
            }
            this.velX *= this.friction;
            this.velY *= this.friction;
            this.x += this.velX;
            this.y += this.velY;
            this.sprite.update();
            if ( !this.isDead ) {
                switch ( this.type ) {
                    // whirlwind grabs player
                    case 1:
                        if ( simpleColCheck( player, this ) ) {
                            player.grabbed = true;
                            player.x = this.x + this.fluctuatorX;
                            player.y = this.y - 15 + this.fluctuatorY;
                            player.jumping = true;
                        }
                        this.fluctuatorX += this.dX;
                        this.fluctuatorY += this.dY;

                        if ( this.fluctuatorX < -8 || this.fluctuatorX > 8) {
                            this.dX *= -1;
                        }
                        if ( this.fluctuatorY < -20 || this.fluctuatorY > 5) {
                            this.dY *= -1;
                        }
                        break;
                    // fireball
                    case 2:
                        break;
                    // rock
                    case 3:
                        break;
                    case 4:
                    case 5:
                        break;
                }

                // kill it if reaches edge of screen, except for iceblocks
                if ( this.type !== 4 && (this.x < -5 || this.x > 1028 || this.y < -5 || this.y > 800 )) {
                    this.isDead = true;
                }
            }
        },
        render: function(ctx){
            //ctx.fillStyle = 'yellow';
            //ctx.fillRect(this.x, this.y, this.width, this.height);
            this.sprite.render(ctx, this.x, this.y, this.goingLeft );
        },
        push: function( left ) {
            if ( left ) {
                this.x -= this.speed;
            }
            else
            {
                this.x += this.speed;
            }
        }
    };

    var spawnAThing = function( sx, sy, stype, sgoingleft, sgoingup, moveh, movev ) {
        var thing = new Thingee(sx, sy, stype, sgoingleft, sgoingup, moveh, movev );
        theGame.things = theGame.things.concat( thing );
        return thing;
    };

    // PLAYER

    var Player = function(game, gameSize) {
        this.game = game;
        this.height = 54;
        this.width = 30;
        this.x = gameSize.width / 2;
        this.y = gameSize.height - 50;

        this.keyboarder = new Keyboarder();

        this.speed = 3;
        this.velX = 0;
        this.velY = 0;
        this.friction = 0.9;
        this.jumping = false;
        this.grounded = true;
        this.falling = false;
        this.gravity = 0.3;

        this.grabbed = false;

        this.goingLeft = false;
        this.spriteStopped = new Sprite( 15, 27,
                    [ { ssx: 60, ssy: 72 } ]);
        this.spriteWalking = new Sprite( 15, 27,
                    [ { ssx: 60, ssy: 72, duration: 100 },
                      { ssx: 129, ssy: 72, duration: 100 }
                     ]);
        /* this.spriteShooting = new Sprite( 17, 27,
                    [ { ssx: 146, ssy: 72, duration: 50 } ]); */
        this.spriteDying = new Sprite( 24, 27,
                    [ { ssx: 118, ssy: 0 } ]);
        this.spriteJumping = new Sprite( 20, 29,
                    [ { ssx: 142, ssy: 0, duration: 50 } ]);
        this.state = 'w';
    };

    Player.prototype = {
        update: function(gameSize, boxes, hearts, things) {

            switch( this.state ) {
                case 'w':
                if (this.grabbed && (this.keyboarder.isDown(this.keyboarder.KEYS.LEFT) || this.keyboarder.isDown(this.keyboarder.KEYS.RIGHT)) && (this.keyboarder.isDown(this.keyboarder.KEYS.UP) || this.keyboarder.isDown(this.keyboarder.KEYS.SPACE) || this.keyboarder.isDown(this.keyboarder.KEYS.Z))) {
                    this.grabbed = false;
                } else {
                    // left
                    if (this.keyboarder.isDown(this.keyboarder.KEYS.LEFT)) {
                        if (this.velX > -this.speed) {
                            this.velX--;
                        }
                        this.goingLeft = true;
                    }

                    // right
                    if (this.keyboarder.isDown(this.keyboarder.KEYS.RIGHT)) {
                        if (this.velX < this.speed) {
                            this.velX++;
                        }
                        this.goingLeft = false;
                    }

                    if (this.keyboarder.isDown(this.keyboarder.KEYS.UP) || this.keyboarder.isDown(this.keyboarder.KEYS.SPACE) || this.keyboarder.isDown(this.keyboarder.KEYS.Z) ) {
                        // jump up
                        if (!this.jumping && this.grounded){
                            this.jumping = true;
                            this.grounded = false;
                            this.falling = false;
                            this.velY = -this.speed * 2;
                            aa.play('jump');
                        }
                    }

                    if (this.keyboarder.isDown(this.keyboarder.KEYS.DOWN) ) {
                        // go down the stairs
                        if (!this.jumping && this.grounded){
                           this.grounded = false;
                           this.jumping = false;
                           this.falling = true;
                           this.velY = this.speed * 2;
                        }
                    }

                    if (this.keyboarder.isDown(this.keyboarder.KEYS.X) ) {
                        if ( pauseButtonDelay.isDone() ) {
                            // switch element
                            this.game.currentElement++;
                            if ( this.game.currentElement > 2 ) {
                                this.game.currentElement = 0;
                            }
                            pauseButtonDelay.reset();
                        }
                    }
                    if (this.keyboarder.isDown(this.keyboarder.KEYS.C) ) {
                        // fire/use element
                        if ( pauseButtonDelay.isDone() ) {

                            this.attack = true;
                            spawnAThing( (this.goingLeft ? this.x - 6: this.x + this.width - 6), this.y + 45, 5 + this.game.currentElement, this.goingLeft, false, true, false );

                            pauseButtonDelay.reset();
                        }
                    }
                }
                // mute
                if (this.keyboarder.isDown(this.keyboarder.KEYS.M) ) {
                    if ( muteButtonDelay.isDone() ) {
                        aa.mute = !aa.mute;
                        muteButtonDelay.reset();
                    }
                }
                /*
                if (this.keyboarder.isDown(this.keyboarder.KEYS.P) ) {
                    if ( pauseButtonDelay.isDone() ) {
                        PAUSE = !PAUSE;
                        pauseButtonDelay.reset();
                    }
                } */

                this.velX *= this.friction;
                this.velY += this.gravity;

                this.grounded = false;
                for (var i = 0; i < boxes.length; i++) {

                    var dir = colCheck(this, boxes[i]);

                    if (dir === 'l' || dir === 'r') {
                        this.velX = 0;
                        this.jumping = false;
                    } else if (dir === 'b') {
                        this.grounded = true;
                        this.jumping = false;
                        this.falling = false;
                    } else if (dir === 't') {
                        this.velY *= -1;
                    }
                }
                for (var i = 0; i < things.length; i++) {
                    if ( !things[i].isDead && things[i].type === 4 ) {
                        var dir = colCheck(this, things[i]);

                        if (dir === 'l' || dir === 'r') {
                            this.velX = 0;
                            this.jumping = false;
                        } else if (dir === 'b') {
                            this.grounded = true;
                            this.jumping = false;
                            this.falling = false;
                        } else if (dir === 't') {
                            this.velY *= -1;
                        }

                    }
                }

                if (this.grounded){
                     this.velY = 0;
                }

                this.x += this.velX;
                this.y += this.velY;

                if ( this.x < - (this.width - 2) ) {
                    this.x = gameSize.width - 3;
                }
                else if ( this.x > gameSize.width - 2 ) {
                    this.x = (this.width - 3) * -1;
                }
                if(( this.velX > 0.1 || this.velX < -0.1 ) && !this.jumping ){
                    this.spriteWalking.update();
                }
                break;
            case 'd':
                this.y += 3;
                if ( this.y > 1000 ) {
                    endGame('DIE');
                }
                break;
            }
        },

        render: function(ctx) {
            //if ( this.goingLeft ) {
            switch( this.state ) {
                case 'w':
                    if ( this.jumping || this.falling ) {
                        this.spriteJumping.render(ctx, this.x, this.y, !this.goingLeft);
                    }
                    else
                    {
                        this.spriteWalking.render(ctx, this.x, this.y, !this.goingLeft);
                    }
                    break;
                case 'd':
                        this.spriteDying.render(ctx, this.x, this.y, !this.goingLeft);
                    break;
            }
        }
    };

    // CODE STARTS HERE
    var Game = function() {

        // maybe some other day
        // var gamepadSupportAvailable = !!navigator.webkitGetGamepads || !!navigator.webkitGamepads;

        var canvas = document.getElementById('mc');
        var context = canvas.getContext('2d');

        // don't you dare AA my pixelart!
        context.mozImageSmoothingEnabled = false;
        context.webkitImageSmoothingEnabled = false;
        context.msImageSmoothingEnabled = false;
        context.imageSmoothingEnabled = false;

        var gameSize = { width: canvas.width, height: canvas.height };

        this.state = 'LOADING';
        this.titlescreenBlink = new DelayCounter([500,500]);
        this.keyboarder = new Keyboarder();
        this.player = new Player(this, gameSize);

        this.enemies = [];

        this.enemies = this.enemies.concat(new BadGuy( 200 + getRandomInt(0, 20), 251, 0, 'fg', 2 )); // fire
        this.enemies = this.enemies.concat(new BadGuy( 700 + getRandomInt(0, 20), 251, 0, 'fg', 2 )); // fire
        this.enemies = this.enemies.concat(new BadGuy( 100, 367, 3, 'wd', 0 )); // wind
        // this.enemies = this.enemies.concat(new WindDuck( 200, 367 ));  // wind
        this.enemies = this.enemies.concat(new BadGuy( 200 + getRandomInt(0, 20), 575, 1, 'eg', 1 )); // earth 518
        this.enemies = this.enemies.concat(new BadGuy( 800 + getRandomInt(0, 20), 575, 1, 'eg', 1 )); // earth 518
        this.enemies = this.enemies.concat(new BadGuy( -50, 705, 2, 'ig', 1 )); // ice

        this.things = [];

        var monsterblockers = [];

        // blocks 3 element monsters, not ice monster
        monsterblockers = monsterblockers.concat( new MonsterBlock( 10, 150, 10, 450, ['wd', 'ww', 'fg', 'fb', 'eg', 'ro']) );
        monsterblockers = monsterblockers.concat( new MonsterBlock( 1000, 150, 10, 450, ['wd', 'ww', 'fg', 'fb', 'eg', 'ro']) );

        // fire guys
        monsterblockers = monsterblockers.concat( new MonsterBlock( 345, 150, 10, 130, ['fg']) );
        monsterblockers = monsterblockers.concat( new MonsterBlock( 672, 150, 10, 130, ['fg']) );

        // earth guys
        monsterblockers = monsterblockers.concat( new MonsterBlock( 500, 450, 10, 130, ['eg']) );
        monsterblockers = monsterblockers.concat( new MonsterBlock( 595, 450, 10, 130, ['eg']) );

        // ice monsters
        monsterblockers = monsterblockers.concat( new MonsterBlock( -80, 600, 10, 130, ['ig']) );
        monsterblockers = monsterblockers.concat( new MonsterBlock( 1080, 600, 10, 130, ['ig']) );

        this.lastPewPew = 0;

        aa = new ArcadeAudio();

        // grab heart sound
        aa.add( 'pickup', 2,
            [
                [0,,0.01,0.4394,0.3103,0.8765,,,,,,0.3614,0.5278,,,,,,1,,,,,0.5]
            ]
        );

        aa.add( 'jump', 1,
            [
                [0,,0.1625,,0.159,0.2246,,,,,,,,0.0471,,,,,1,,,0.1,,0.29]
            ]
        );

        // heart in danger sound
        aa.add( 'pewpew', 3,
            [
                [2,,0.2742,0.0215,0.0863,0.6068,0.2,-0.196,,,,,,0.5091,-0.515,,,,1,,,,,0.29]
            ]
        );

        aa.add( 'cheep', 4,
            [
                [2,0.1602,0.01,0.4203,0.6306,0.5952,,-0.129,0.04,0.19,0.75,0.5614,0.06,-0.7285,0.9046,-0.595,0.9816,-0.5187,0.9028,0.6024,0.6813,0.521,-0.0292,0.5]
            ]);

        this.bodies = [];

        this.bodies = this.bodies.concat(this.player);
        this.bodies = this.bodies.concat(new HeartSprinkler(this, gameSize));

        var boxes = [];

        this.fallingStuff = [];

        var heartStoppers = [];
        // stops the hearts at the bottom
        heartStoppers = heartStoppers.concat(new Box( -60, 742, 1084, 20, {} ));

        // ground floor
        boxes = boxes.concat(new Box( -30, 730, 1054, 48, {} ));

        // level floors
        // first floor
        boxes = boxes.concat(new Box( -30, 580,  533, 4, { bottom: true } )); // 150 high
        boxes = boxes.concat(new Box( 600, 580,  500, 4, { bottom: true } )); // 150 high

        // second floor
        boxes = boxes.concat(new Box( -30, 430, 1054, 4, { bottom: true } ));

        // third floor
        // three pieces here
        boxes = boxes.concat(new Box( -30, 280, 372, 4, { bottom: true } ));
        boxes = boxes.concat(new Box( 402, 280, 220, 4, { bottom: true } ));
        boxes = boxes.concat(new Box( 682, 280, 382, 4, { bottom: true } ));

        // heart sprinkler floor - you shall not pass
        boxes = boxes.concat(new Box( 0, 130, 1024, 4, {} ));

        // stairs

        // floor level
        // left
        boxes = boxes.concat(new Box( 64, 680, 32, 5, { left: true, right: true, bottom: true } ));
        boxes = boxes.concat(new Box( 32, 630, 32, 5, { left: true, right: false, bottom: true } ));
        boxes = boxes.concat(new Box( 0, 584, 32, 5, { bottom: false } ));
        // right
        boxes = boxes.concat(new Box( 928, 680, 32, 5, { left: true, right: true, bottom: true } ));
        boxes = boxes.concat(new Box( 960, 630, 32, 5, { left: false, right: true, bottom: true } ));
        boxes = boxes.concat(new Box( 992, 584, 32, 5, { bottom: false } ));

        // first floor
        // left
        boxes = boxes.concat(new Box( 64, 530, 32, 5, { left: true, right: true, bottom: true } ));
        boxes = boxes.concat(new Box( 32, 480, 32, 5, { left: true, right: false, bottom: true } ));
        boxes = boxes.concat(new Box( 0, 434, 32, 5, { bottom: false } ));
        // right
        boxes = boxes.concat(new Box( 928, 530, 32, 5, { left: true, right: true, bottom: true } ));
        boxes = boxes.concat(new Box( 960, 480, 32, 5, { left: false, right: true, bottom: true } ));
        boxes = boxes.concat(new Box( 992, 434, 32, 5, { bottom: false } ));

        // second floor
        // left
        boxes = boxes.concat(new Box( 64, 380, 32, 5, { left: true, right: true, bottom: true } ));
        boxes = boxes.concat(new Box( 32, 330, 32, 5, { left: true, right: false, bottom: true } ));
        boxes = boxes.concat(new Box( 0, 284, 32, 5, { bottom: false } ));
        // right
        boxes = boxes.concat(new Box( 928, 380, 32, 5, { left: true, right: true, bottom: true } ));
        boxes = boxes.concat(new Box( 960, 330, 32, 5, { left: false, right: true, bottom: true } ));
        boxes = boxes.concat(new Box( 992, 284, 32, 5, { bottom: false } ));

        this.iceblockbases = [];
        // ice monster block bases
        for(var z = 100; z < 900; z += 33 ) {
            this.iceblockbases.push( new Box(z, 720, 32, 3, {}, true ) );
        }

        this.bodies = this.bodies.concat( boxes );

        var self = this;

        this.loadImages();

        // background tiles
        this.backgroundTile = new Sprite( 12, 30, [ { ssx: 0, ssy: 72 } ] );
        this.backgroundTile2 = new Sprite( 12, 30, [ { ssx: 12, ssy: 72 } ] );
        this.backgroundTile3 = new Sprite( 12, 30, [ { ssx: 48, ssy: 72 } ] );

        this.cloudTile = new Sprite( 24, 14, [ { ssx: 97, ssy: 58 } ] );
        this.grass1Tile = new Sprite( 7, 3, [ { ssx: 83, ssy: 62 } ] );
        this.grass2Tile = new Sprite( 7, 3, [ { ssx: 90, ssy: 62 } ] );

        this.treeSlice = new Sprite( 60, 4, [ { ssx: 32, ssy: 67 } ] );
        this.treeRootLeft = new Sprite( 7, 8, [ { ssx: 29, ssy: 94 } ] );
        this.treeRootRight = new Sprite( 6, 8, [ { ssx: 36, ssy: 94 } ] );

        this.leavesTile = new Sprite( 24, 21, [ { ssx: 24, ssy: 72 } ] );

        // stair tiles
        this.stairTile = new Sprite( 50, 25, [ { ssx: 121, ssy: 46 } ] );

        // water at the bottom of the screen
        this.waterTile = new Sprite( 14, 8, [ { ssx: 0, ssy: 8, duration: 500 }, { ssx: 14, ssy: 8, duration: 500 } ] );
        this.waterTile2 = new Sprite( 14, 8, [ { ssx: 8, ssy: 16 } ] );

        // platform tiles
        // grass
        this.pf_one_Tile = new Sprite( 4, 8, [ { ssx: 0, ssy: 16 } ] );
        // rock/sand
        this.pf_two_Tile = new Sprite( 4, 8, [ { ssx: 4, ssy: 16 } ] );

        // mute icon
        this.mute_icon = new Sprite( 7, 8, [ { ssx: 0, ssy: 32 } ] );

        this.heartIcon = new Sprite( 7, 8, [ { ssx: 0, ssy: 0, duration: 400 } ] );
        this.elementIcons = new Sprite( 7, 8, [ { ssx: 81, ssy: 34 }, { ssx: 89, ssy: 34 }, { ssx: 83, ssy: 53 } ] );
        this.heartmeter = new Sprite( 13, 6, [ { ssx: 97, ssy: 52 }, { ssx: 97, ssy: 49 } ] );
        this.elementBox = new Sprite( 13, 13, [ { ssx: 97, ssy: 45 } ] );
        this.currentElement = 0;

        var SKIPTICKS = 1000 / 60;

        var nextFrame = getTimeStamp();
        var loops = 0;

        var tick = function() {

            if ( !AWAY ) {
                loops = 0;
                // frame rate independent game speed
                while( getTimeStamp() > nextFrame && loops < 10 ) {
                    self.update(gameSize, boxes, heartStoppers, monsterblockers );
                    nextFrame += SKIPTICKS;
                    loops++;
                }

                self.render(context, gameSize, monsterblockers);
            }
            else
            {
                context.fillStyle = '#000';
                context.fillText('Click to resume', 505, 384);
                nextFrame = getTimeStamp();
            }
            requestAnimationFrame(tick);

        };

        tick();
    };

    var endGame = function(s) {
        longButtonDelay.reset();
        theGame.state = s;
    };

    var resetGame = function() {
        currentHearts = theGame.currentElement = heartsindanger = 0;
        theGame.fallingStuff = [];
        theGame.things = [];
        theGame.player.x = 512;
        theGame.player.y = 700;
        theGame.player.state = 'w';
        for(var i = 0; i < theGame.enemies.length; i++ ) {
            theGame.enemies[i].reset();
        }
        theGame.iceblockbases[12].isEmpty = true;
    };

    Game.prototype = {

      update: function(gameSize, boxes, heartStoppers, monsterblockers) {
        var self = this;

        switch( this.state ) {
            case 'TITLE':
                if ( this.keyboarder.anyKeyDown() ){
                    this.state = 'STORY';
                    PAUSE = false;
                }
                break;
            case 'STORY':
                if ( this.keyboarder.anyKeyDown() ){
                    this.state = 'GAME';
                    PAUSE = false;
                }
                break;
            case 'END':
            case 'DIE':
                if ( this.keyboarder.anyKeyDown( true ) ){
                    this.state = 'TITLE';
                    PAUSE = false;
                }
                break;
            case 'GAME':
                if ( !PAUSE ) {
                    var i = 0;
                    for (i = 0; i < this.bodies.length; i++) {
                        this.bodies[i].update(gameSize, boxes, this.hearts, this.things);
                    }

                    for (i = 0; i < this.enemies.length; i++) {
                        if ( !this.enemies[i].isDead ) {
                            this.enemies[i].update(monsterblockers, this.player, this.things, this.iceblockbases);
                            if ( simpleColCheck( this.player, this.enemies[i] ) ) {
                                if ( this.enemies[i].type === 1 && (( this.enemies[i].state === 'up' && this.enemies[i].spriteB.getFrame() < 1 ) || this.enemies[i].state === 'w' )) {
                                    // do nuthing
                                }
                                else
                                {
                                    this.player.state = 'd';
                                }
                            }
                        }
                    }

                    for (i = 0; i < this.fallingStuff.length; i++) {
                        this.fallingStuff[i].update(gameSize, heartStoppers, this.player);
                    }

                    // check if any hearts are in danger
                    if ( heartsindanger > 0 ) {
                        var n = getTimeStamp();

                        if ( n - this.lastPewPew > 500 ) {
                            aa.play('pewpew');
                            this.lastPewPew = n;
                        }
                    }

                    for (i = 0; i < this.things.length; i++) {
                        if ( !this.things[i].isDead ) {
                            this.things[i].update(this.player, this.iceblockbases);
                        }
                    }

                    // animate the water
                    this.waterTile.update();
                }
                if (this.keyboarder.isDown(this.keyboarder.KEYS.P) ) {
                    if ( pauseButtonDelay.isDone() ) {
                        PAUSE = !PAUSE;
                        pauseButtonDelay.reset();
                    }
                }
                break;
        }
      },

      render: function(screen, gameSize, monsterblockers) {
        screen.clearRect(0, 0, gameSize.width, gameSize.height);

        switch( this.state ) {

            case 'LOADING':
                this.renderLoadingScreen(screen, gameSize);
                break;
            case 'TITLE':
                this.renderPrettyBackground(screen);
                this.renderTitleScreen(screen, gameSize);
                this.waterTile.update();
                break;
            case 'STORY':
                this.renderPrettyBackground(screen);
                this.renderStoryScreen(screen, gameSize);
                this.waterTile.update();
                break;
            case 'END':
                this.renderEndScreen(screen, gameSize, 'You Did it! Congratulations!');
                break;
            case 'DIE':
                this.renderEndScreen(screen, gameSize, 'Game Over!');
                break;
            case 'GAME':
                this.renderPrettyBackground(screen);
                this.renderBackground(screen);

                var i = 0;
                for (i = 0; i < this.bodies.length; i++) {
                  this.bodies[i].render(screen);
                }

                for (i = 0; i < this.enemies.length; i++) {
                    if ( !this.enemies[i].isDead ) {
                        this.enemies[i].render(screen);
                    }
                }

                for (i = 0; i < this.fallingStuff.length; i++) {
                    if ( !this.fallingStuff[i].isDead ) {
                        this.fallingStuff[i].render(screen);
                    }
                }

                for (i = 0; i < this.things.length; i++) {
                    if ( !this.things[i].isDead ) {
                        this.things[i].render(screen);
                    }
                }

                this.renderHUD(screen, this.player);

                if ( PAUSE ) {
                    screen.fillStyle = '#000';
                    screen.font = '30pt monospace';
                    screen.textAlign = 'center';
                    screen.fillText('PAUSED', gameSize.width / 2, gameSize.height / 2);
                }

                var thisFrameFPS = 1000 / ((now = new Date()) - lastUpdate);
                if (now !== lastUpdate){
                  fps += (thisFrameFPS - fps) / fpsFilter;
                  lastUpdate = now;
                }
                break;
        }
      },
      renderEndScreen: function(ctx, gameSize, text) {
            ctx.fillStyle = "#000";
            ctx.fillRect(0,0, gameSize.width, gameSize.height);

            ctx.fillStyle = "#fff";
            ctx.font = '30pt monospace';
            ctx.textAlign = 'center';
            ctx.fillText(text, gameSize.width / 2, gameSize.height / 2);

            this.bst(ctx, 512, 600, true);
            resetGame();
      },
      renderPrettyBackground: function(ctx) {
            // 11b76d - grass
            // 148875 - foreground
            // d3591b - soil
            //

            var tx = 0;
            // tiles
            // clouds
            for (tx = 0; tx < 1024; tx += 94 ) {
                this.cloudTile.render(ctx, tx, 482);
                this.cloudTile.render(ctx, tx + 48, 482, true );
            }

            // treeline
            var c = 0;
            for (tx = 0; tx < 1024; tx += 24 ) {

                this.backgroundTile.render(ctx, tx, 510);
                if ( tx % (24 * 4) === 0 ) {
                    this.backgroundTile2.render(ctx, tx, 510);
                    c = 0;
                }
                if ( tx === (24 * 25) ) {
                    this.backgroundTile3.render(ctx, tx, 510);
                    c = 0;
                }
                c++;
            }

            // third level - grass
            ctx.fillStyle = '#11b76d';
            ctx.fillRect( 0, 570, 1024, 80);

            // second level - foreground
            ctx.fillStyle = '#148875';
            ctx.fillRect( 0, 650, 1024, 40);

            // third level - foreground
            ctx.fillStyle = '#155c6f';
            ctx.fillRect( 0, 690, 1024, 100);

            // grass tile 1
            for (tx = 0; tx < 1024; tx += 15 ) {
                this.grass1Tile.render(ctx, tx, 645);
            }
            // grass tile 2
            for (tx = 0; tx < 1024; tx += 15 ) {
                this.grass2Tile.render(ctx, tx, 685);
            }

            // trees
            for (tx = 0; tx < 768; tx += 8 ) {
                this.treeSlice.render(ctx, 150, tx);
                this.treeSlice.render(ctx, 450, tx);
                this.treeSlice.render(ctx, 750, tx);
            }
            // tree roots
            for(var a = 0; a < 3; a++ ) {
                this.treeRootLeft.render(ctx, 138 + (a * 300), 713);
                this.treeRootRight.render(ctx, 268 + (a * 300), 713);
            }

            // leaves
            for (tx = 0; tx < 1024; tx += 48 ) {
                this.leavesTile.render(ctx, tx, 0);
            }
      },
      renderBackground: function(ctx) {

            var tx = 0;

            // platform tiles
            // 4 x 8 = 8 x 16
            for (tx = 0; tx < 1024; tx += 8 ) {
                this.pf_one_Tile.render(ctx, tx, 729);
                this.pf_two_Tile.render(ctx, tx, 745);
            }

            for (tx = 0; tx < 500; tx += 8 ) {
                this.pf_one_Tile.render(ctx, tx, 580);
            }
            for (tx = 600; tx < 1024; tx += 8 ) {
                this.pf_one_Tile.render(ctx, tx, 580);
            }

            for (tx = 0; tx < 1024; tx += 8 ) {
                this.pf_one_Tile.render(ctx, tx, 430);
            }
            for (tx = 0; tx < 340; tx += 8 ) {
                this.pf_one_Tile.render(ctx, tx, 279);
            }
            for (tx = 400; tx < 620; tx += 8 ) {
                this.pf_one_Tile.render(ctx, tx, 279);
            }
            for (tx = 680; tx < 1024; tx += 8 ) {
                this.pf_one_Tile.render(ctx, tx, 279);
            }

            for (tx = 0; tx < 1024; tx += 8 ) {
                this.pf_one_Tile.render(ctx, tx, 129);
            }

            // stairs
            this.drawStairs(ctx, 0, 280, false);
            this.drawStairs(ctx, 0, 430, false);
            this.drawStairs(ctx, 0, 580, false);

            this.drawStairs(ctx, 1024 - 100, 280, true);
            this.drawStairs(ctx, 1024 - 100, 430, true);
            this.drawStairs(ctx, 1024 - 100, 580, true);

            // water
            for (tx = 0; tx < 1024; tx += 28 ) {
                this.waterTile.render(ctx, tx, 740);
                this.waterTile2.render(ctx, tx, 756);
            }

      },
      drawStairs: function( ctx, locX, locY, flip) {
        if ( flip ) {
            this.stairTile.render(ctx, locX,      locY + 100, flip);
            this.stairTile.render(ctx, locX + 32, locY + 50, flip);
            this.stairTile.render(ctx, locX + 64, locY, flip);
        }
        else
        {
            this.stairTile.render(ctx, locX,      locY + 100, flip);
            this.stairTile.render(ctx, locX - 32, locY + 50, flip);
            this.stairTile.render(ctx, locX - 64, locY, flip);
        }
      },
      renderHUD: function(ctx, player) {
        if ( aa.mute ) {
            this.mute_icon.render(ctx, 1000, 50);
        }

        // heart meter
        // draw a red box to fill the meter
        ctx.fillStyle = 'red';
        ctx.fillRect(18, 168, 20, -1 * currentHearts * 4);

        this.heartIcon.render(ctx, 20, 20);
        this.heartmeter.setFrame(1);
        for ( var i = 0; i < 11; i++ ) {
            this.heartmeter.render(ctx, 14, 40 + (i * 12 ));
            if ( i == 9 ) {
                this.heartmeter.setFrame(0);
            }
        }
        // element box
        this.elementBox.render(ctx, 50, 45 + (this.currentElement * 25));
        // current element
        for ( var i = 0; i < 3; i++) {
            this.elementIcons.setFrame(i);
            this.elementIcons.render(ctx, 55, 50 + (i * 25));
        }
      },
      renderLoadingScreen: function(ctx, gameSize) {
        ctx.fillStyle = "#000";
        ctx.fillRect(0,0, gameSize.width, gameSize.height);
        ctx.fillStyle = 'white';
        ctx.font = '20pt monospace';
        ctx.textAlign = 'center';
        ctx.fillText('Loading...', gameSize.width / 2, gameSize.height / 2);
      },
      renderStoryScreen: function(ctx, gameSize) {
        this.renderBackground(ctx);
        // light overlay
        ctx.fillStyle = "rgba(0, 0, 0, 0.80)";
        ctx.fillRect(0,0, gameSize.width, gameSize.height);

        var hw = gameSize.width / 2;
        var hh = gameSize.height / 2;

        ctx.fillStyle = 'white';
        ctx.font = '12pt monospace';

        var text = [ 'Oh no!',
                     'Felicity\'s boyfriend is losing his love!',
                     'Brave the four elements and collect the hearts before they break.',
                     'Fill the heartmeter to complete the level.',
                     'Watch out for windducks, firesprites, sandmonsters and snowmen.',
                     'Use the correct element to defeat them.',
                     '',
                     'Controls:',
                     'Arrow keys: Move left/right, Jump, Go down stairs',
                     'Z: Jump',
                     'X: Switch Element',
                     'C: Use Element',
                     '',
                     'M: Mute sounds',
                     'P: Pause'
                    ];

        for ( var i = 0; i < text.length; i++) {
            ctx.fillText( text[i], hw, 100 + (i * 40) );
        }

        this.bst(ctx, hw, 720);

      },
      bst: function(ctx, x, y, flag) {
        switch ( this.titlescreenBlink.getStage() ) {
            case 0:
                ctx.fillStyle = 'white';
                ctx.font = '15pt impact';
                if ( flag ) {
                    ctx.fillText('Press any key to try again', x, y );
                } else {
                    ctx.fillText('Press any key to begin', x, y );
                }
                break;
        }
      },
      renderTitleScreen: function(ctx, gs) {
        this.renderBackground(ctx);
        // dark overlay
        ctx.fillStyle = "rgba(255, 255, 255, 0.10)";
        ctx.fillRect(0,0, gs.width, gs.height);
        ctx.fillStyle = 'yellow';
        ctx.font = '60pt impact';
        ctx.textAlign = 'center';
        var t = [ 'Felicity', 'and', 'the Fifth Element:', 'Love'];
        for ( var i = 0; i < t.length; i++) {
            ctx.fillText( t[i], 512, 200 + (i * 100) );
        }
        this.bst(ctx, 512, 630);
      },
      // load our spritesheet
      loadImages: function(){
            var self = this;
            var imageObj = new Image();

            imageObj.onload = function() {
                self.state = "TITLE";
            };
            imageObj.src = "spritesheet.png";
            images[0] = imageObj;
        }
    };

    // start game when page has finished loading
    window.addEventListener("load", function() {
      theGame = new Game();
    });

    // if the window looses focus we pause the game - otherwise you get a superspeed moment!
    window.onblur = function() {
        AWAY = true;
    };
    window.onfocus = function() {
        AWAY = false;
    };
})();

},{}]},{},[1])
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9ob21lL21hcmNlbC9wdWJsaWNfaHRtbC9qczEzazIwMTQvbm9kZV9tb2R1bGVzL2Jyb3dzZXJpZnkvbm9kZV9tb2R1bGVzL2Jyb3dzZXItcGFjay9fcHJlbHVkZS5qcyIsIi4vc3JjL3MiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUNBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3ZhciBmPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIik7dGhyb3cgZi5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGZ9dmFyIGw9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGwuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sbCxsLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsIihmdW5jdGlvbigpIHtcbiAgICAndXNlIHN0cmljdCc7XG4gICAgdmFyIHRoZUdhbWUgPSBudWxsO1xuICAgIC8vIGdsb2JhbHNcbiAgICB2YXIgTVVURV9BVURJTyA9IGZhbHNlO1xuICAgIHZhciBpbWFnZXMgPSBbXTtcblxuICAgIHZhciBQQVVTRSA9IGZhbHNlO1xuICAgIHZhciBBV0FZID0gZmFsc2U7XG4gICAgdmFyIGFhID0gbnVsbDtcbiAgICB2YXIgaGVhcnRzaW5kYW5nZXIgPSAwO1xuICAgIHZhciBNQVhIRUFSVFMgPSAzMjtcbiAgICB2YXIgY3VycmVudEhlYXJ0cyA9IDA7XG5cbiAgICAvLyBVVElMIEZVTkNUSU9OU1xuICAgIHZhciBzaW1wbGVDb2xDaGVjayA9IGZ1bmN0aW9uKHNoYXBlQSwgc2hhcGVCKSB7XG4gICAgICAgIGlmIChzaGFwZUEueCA8IHNoYXBlQi54ICsgc2hhcGVCLndpZHRoICYmXG4gICAgICAgICAgICBzaGFwZUEueCArIHNoYXBlQS53aWR0aCA+IHNoYXBlQi54ICYmXG4gICAgICAgICAgICBzaGFwZUEueSA8IHNoYXBlQi55ICsgc2hhcGVCLmhlaWdodCAmJlxuICAgICAgICAgICAgc2hhcGVBLmhlaWdodCArIHNoYXBlQS55ID4gc2hhcGVCLnkpIHtcbiAgICAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgfTtcblxuICAgIHZhciBmcHMgPSAwLCBub3csIGxhc3RVcGRhdGUgPSAobmV3IERhdGUoKSkqMTtcbiAgICB2YXIgZnBzRmlsdGVyID0gNTA7XG4gICAgdmFyIGZwc091dCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdmcHMnKTtcbiAgICBzZXRJbnRlcnZhbChmdW5jdGlvbigpe1xuICAgICAgICAgICAgZnBzT3V0LmlubmVySFRNTCA9IGZwcy50b0ZpeGVkKDEpICsgXCIgZnBzXCI7XG4gICAgfSwgMTAwMCk7XG5cbiAgICB2YXIgZ2V0VGltZVN0YW1wID0gZnVuY3Rpb24oKSB7XG4gICAgICAgIHJldHVybiBEYXRlLm5vdygpO1xuICAgIH07XG5cbiAgICB2YXIgZ2V0UmFuZG9tSW50ID0gZnVuY3Rpb24obWluLCBtYXgpIHtcbiAgICAgICAgcmV0dXJuIE1hdGguZmxvb3IoTWF0aC5yYW5kb20oKSAqIChtYXggLSBtaW4gKyAxKSkgKyBtaW47XG4gICAgfTtcblxuICAgIHZhciBnZXRSYW5kb21Cb29sZWFuID0gZnVuY3Rpb24oKXtcbiAgICAgICAgcmV0dXJuIE1hdGgucmFuZG9tKCkgPCAwLjU7XG4gICAgfTtcblxuICAgIHZhciBjb2xDaGVjayA9IGZ1bmN0aW9uKHNoYXBlQSwgc2hhcGVCKSB7XG4gICAgICAgIC8vIGdldCB0aGUgdmVjdG9ycyB0byBjaGVjayBhZ2FpbnN0XG4gICAgICAgIHZhciB2WCA9IChzaGFwZUEueCArIChzaGFwZUEud2lkdGggLyAyKSkgLSAoc2hhcGVCLnggKyAoc2hhcGVCLndpZHRoIC8gMikpLFxuICAgICAgICAgICAgdlkgPSAoc2hhcGVBLnkgKyAoc2hhcGVBLmhlaWdodCAvIDIpKSAtIChzaGFwZUIueSArIChzaGFwZUIuaGVpZ2h0IC8gMikpLFxuICAgICAgICAgICAgLy8gYWRkIHRoZSBoYWxmIHdpZHRocyBhbmQgaGFsZiBoZWlnaHRzIG9mIHRoZSBvYmplY3RzXG4gICAgICAgICAgICBoV2lkdGhzID0gKHNoYXBlQS53aWR0aCAvIDIpICsgKHNoYXBlQi53aWR0aCAvIDIpLFxuICAgICAgICAgICAgaEhlaWdodHMgPSAoc2hhcGVBLmhlaWdodCAvIDIpICsgKHNoYXBlQi5oZWlnaHQgLyAyKSxcbiAgICAgICAgICAgIGNvbERpciA9IG51bGw7XG5cbiAgICAgICAgLy8gaWYgdGhlIHggYW5kIHkgdmVjdG9yIGFyZSBsZXNzIHRoYW4gdGhlIGhhbGYgd2lkdGggb3IgaGFsZiBoZWlnaHQsIHRoZXkgd2UgbXVzdCBiZSBpbnNpZGUgdGhlIG9iamVjdCwgY2F1c2luZyBhIGNvbGxpc2lvblxuICAgICAgICBpZiAoTWF0aC5hYnModlgpIDwgaFdpZHRocyAmJiBNYXRoLmFicyh2WSkgPCBoSGVpZ2h0cykge1xuICAgICAgICAgICAgLy8gZmlndXJlcyBvdXQgb24gd2hpY2ggc2lkZSB3ZSBhcmUgY29sbGlkaW5nICh0b3AsIGJvdHRvbSwgbGVmdCwgb3IgcmlnaHQpXG4gICAgICAgICAgICB2YXIgb1ggPSBoV2lkdGhzIC0gTWF0aC5hYnModlgpLFxuICAgICAgICAgICAgb1kgPSBoSGVpZ2h0cyAtIE1hdGguYWJzKHZZKTtcbiAgICAgICAgICAgIGlmIChvWCA+PSBvWSkge1xuICAgICAgICAgICAgICAgIGlmICh2WSA+IDApIHtcbiAgICAgICAgICAgICAgICAgICAgLy8gcmVzZXQgdGhlIGZhbGxpbmcgZmxhZywgb3RoZXJ3aXNlIHdlIGRyb3Agc3RyYWlnaHQgdG8gdGhlIGJvdHRvbVxuICAgICAgICAgICAgICAgICAgICBzaGFwZUEuZmFsbGluZyA9IGZhbHNlO1xuICAgICAgICAgICAgICAgICAgICBjb2xEaXIgPSAndCc7XG4gICAgICAgICAgICAgICAgICAgIGlmICggc2hhcGVCLmlzUGFzc3Rocm91Z2guYm90dG9tICkge1xuICAgICAgICAgICAgICAgICAgICAgICAgY29sRGlyID0gbnVsbDtcbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHNoYXBlQS55ICs9IG9ZO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgLy8gaWYgd2UgYXJlIGZhbGxpbmcsIHBhc3MgdGhyb3VnaCB0aGUgYXBwcm9wcmlhdGUgZmxvb3JcbiAgICAgICAgICAgICAgICAgICAgaWYgKCBzaGFwZUIuaXNQYXNzdGhyb3VnaC5ib3R0b20gJiYgc2hhcGVBLmZhbGxpbmcgKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBjb2xEaXIgPSBudWxsO1xuICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgY29sRGlyID0gJ2InO1xuICAgICAgICAgICAgICAgICAgICAgICAgc2hhcGVBLnkgLT0gb1k7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIGlmICh2WCA+IDApIHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKCBzaGFwZUIuaXNQYXNzdGhyb3VnaC5yaWdodCApIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbERpciA9IG51bGw7XG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBjb2xEaXIgPSAnbCc7XG4gICAgICAgICAgICAgICAgICAgICAgICBzaGFwZUEueCArPSBvWDtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIGlmICggc2hhcGVCLmlzUGFzc3Rocm91Z2gubGVmdCApIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbERpciA9IG51bGw7XG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBjb2xEaXIgPSAncic7XG4gICAgICAgICAgICAgICAgICAgICAgICBzaGFwZUEueCAtPSBvWDtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gY29sRGlyO1xuICAgIH07XG5cbiAgICAvLyBVVElMIENMQVNTRVNcblxuICAgIHZhciBEZWxheUNvdW50ZXIgPSBmdW5jdGlvbiggZGVsdGEgKSB7XG4gICAgICAgIHRoaXMudGltZXN0YW1wID0gZ2V0VGltZVN0YW1wKCk7XG4gICAgICAgIHRoaXMuZGVsdGFzID0gZGVsdGEgfHwgW107XG4gICAgICAgIHRoaXMuY3VycmVudERlbHRhID0gMDtcbiAgICB9O1xuXG4gICAgRGVsYXlDb3VudGVyLnByb3RvdHlwZSA9IHtcbiAgICAgICAgc3RhcnQgOiBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIHRoaXMudGltZXN0YW1wID0gZ2V0VGltZVN0YW1wKCk7XG4gICAgICAgIH0sXG4gICAgICAgIGNoZWNrOiBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIGlmICggZ2V0VGltZVN0YW1wKCkgLSB0aGlzLnRpbWVzdGFtcCA+IHRoaXMuZGVsdGFzW3RoaXMuY3VycmVudERlbHRhXSApIHtcbiAgICAgICAgICAgICAgICAvLyBjb25zb2xlLmxvZyggdGhpcy5kZWx0YXNbdGhpcy5jdXJyZW50RGVsdGFdICsgdGhpcy50aW1lc3RhbXAgKTtcbiAgICAgICAgICAgICAgICB0aGlzLm5leHQoKTtcbiAgICAgICAgICAgICAgICAvL3JldHVybiB0cnVlO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgLy9yZXR1cm4gZmFsc2U7XG4gICAgICAgIH0sXG4gICAgICAgIG5leHQ6IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgdGhpcy5zdGFydCgpO1xuICAgICAgICAgICAgdGhpcy5jdXJyZW50RGVsdGErKztcbiAgICAgICAgICAgIGlmICggdGhpcy5jdXJyZW50RGVsdGEgPj0gdGhpcy5kZWx0YXMubGVuZ3RoICkge1xuICAgICAgICAgICAgICAgIHRoaXMuY3VycmVudERlbHRhID0gMDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIC8vIGNvbnNvbGUubG9nKCAnbmV4dCcgKyB0aGlzLmN1cnJlbnREZWx0YSArIHRoaXMuZGVsdGFzW3RoaXMuY3VycmVudERlbHRhXSArIFwiIC0gXCIgKyB0aGlzLnRpbWVzdGFtcCApO1xuICAgICAgICB9LFxuICAgICAgICBnZXRTdGFnZTogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICB0aGlzLmNoZWNrKCk7XG5cbiAgICAgICAgICAgIHJldHVybiB0aGlzLmN1cnJlbnREZWx0YTtcbiAgICAgICAgfSxcbiAgICAgICAgaXNEb25lIDogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICBpZiAoIGdldFRpbWVTdGFtcCgpIC0gdGhpcy50aW1lc3RhbXAgPiB0aGlzLmRlbHRhc1t0aGlzLmN1cnJlbnREZWx0YV0gKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgIH0sXG4gICAgICAgIHJlc2V0IDogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICB0aGlzLnRpbWVzdGFtcCA9IGdldFRpbWVTdGFtcCgpO1xuICAgICAgICAgICAgdGhpcy5jdXJyZW50RGVsdGEgPSAwO1xuICAgICAgICB9XG4gICAgfTtcblxuICAgIHZhciBtdXRlQnV0dG9uRGVsYXkgPSBuZXcgRGVsYXlDb3VudGVyKFsyMDBdKTtcbiAgICB2YXIgcGF1c2VCdXR0b25EZWxheSA9IG5ldyBEZWxheUNvdW50ZXIoWzIwMF0pO1xuICAgIHZhciBsb25nQnV0dG9uRGVsYXkgPSBuZXcgRGVsYXlDb3VudGVyKFsyMDAwXSk7XG5cbiAgICB2YXIgU3ByaXRlID0gZnVuY3Rpb24oIHcsIGgsIGZyYW1lRGVmICkge1xuICAgICAgdGhpcy53aWR0aCA9IHc7XG4gICAgICB0aGlzLmhlaWdodCA9IGg7XG4gICAgICB0aGlzLmZyYW1lID0gMDtcbiAgICAgIHRoaXMuZnJhbWVzID0gZnJhbWVEZWY7XG4gICAgICB0aGlzLnRzID0gZ2V0VGltZVN0YW1wKCk7XG4gICAgfTtcblxuICAgIFNwcml0ZS5wcm90b3R5cGUgPSB7XG4gICAgICAgIHJlbmRlcjogZnVuY3Rpb24oY3R4LCB4LCB5LCBkb0ZsaXApe1xuICAgICAgICAgICAgdmFyIGZsaXAgPSBkb0ZsaXAgfHwgZmFsc2U7XG4gICAgICAgICAgICBpZiAoIHRoaXMuZnJhbWUgPj0gdGhpcy5mcmFtZXMubGVuZ3RoICkge1xuICAgICAgICAgICAgICAgIHRoaXMuZnJhbWUgPSAwO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKCBmbGlwICkge1xuICAgICAgICAgICAgICAgIGN0eC5zYXZlKCk7XG4gICAgICAgICAgICAgICAgY3R4LnRyYW5zbGF0ZShjdHguY2FudmFzLndpZHRoLCAwKTtcbiAgICAgICAgICAgICAgICBjdHguc2NhbGUoLTEsIDEpO1xuICAgICAgICAgICAgICAgIGN0eC5kcmF3SW1hZ2UoIGltYWdlc1swXSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuZnJhbWVzW3RoaXMuZnJhbWVdLnNzeCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuZnJhbWVzW3RoaXMuZnJhbWVdLnNzeSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMud2lkdGgsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmhlaWdodCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIHNlY3JldCBzYXVjZTogY2hhbmdlIHRoZSBkZXN0aW5hdGlvbidzIFggcmVnaXN0cmF0aW9uIHBvaW50XG4gICAgICAgICAgICAgICAgICAgICAgICAgICBjdHguY2FudmFzLndpZHRoIC0geCAtICh0aGlzLndpZHRoICogMiksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICB5LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy53aWR0aCAqIDIsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmhlaWdodCAqIDIpO1xuICAgICAgICAgICAgICAgIGN0eC5yZXN0b3JlKCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgY3R4LmRyYXdJbWFnZSggaW1hZ2VzWzBdLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5mcmFtZXNbdGhpcy5mcmFtZV0uc3N4LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5mcmFtZXNbdGhpcy5mcmFtZV0uc3N5LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy53aWR0aCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuaGVpZ2h0LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgeCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgIHksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLndpZHRoICogMixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuaGVpZ2h0ICogMik7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0sXG4gICAgICAgIHVwZGF0ZTogZnVuY3Rpb24oKXtcbiAgICAgICAgICAgIHZhciBub3cgPSBnZXRUaW1lU3RhbXAoKTtcbiAgICAgICAgICAgIGlmICggISF0aGlzLmZyYW1lc1t0aGlzLmZyYW1lXS5kdXJhdGlvbiAmJiBub3cgLSB0aGlzLnRzID4gdGhpcy5mcmFtZXNbdGhpcy5mcmFtZV0uZHVyYXRpb24gKSB7XG4gICAgICAgICAgICAgICAgdGhpcy50cyA9IG5vdztcbiAgICAgICAgICAgICAgICB0aGlzLm5leHRGcmFtZSgpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9LFxuICAgICAgICBzZXRGcmFtZTogZnVuY3Rpb24obmV3ZnJhbWUpIHtcbiAgICAgICAgICAgIHRoaXMuZnJhbWUgPSBuZXdmcmFtZTtcbiAgICAgICAgfSxcbiAgICAgICAgbmV4dEZyYW1lOiBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIHRoaXMuZnJhbWUrKztcbiAgICAgICAgICAgIGlmICggdGhpcy5mcmFtZSA+PSB0aGlzLmZyYW1lcy5sZW5ndGggKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5mcmFtZSA9IDA7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0sXG4gICAgICAgIGdldEZyYW1lOiBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLmZyYW1lO1xuICAgICAgICB9LFxuICAgICAgICByZXNldDogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICB0aGlzLmZyYW1lID0gMDtcbiAgICAgICAgICAgIHRoaXMudHMgPSBnZXRUaW1lU3RhbXAoKTtcbiAgICAgICAgfVxuXG4gICAgfTtcblxuICAgIHZhciBLZXlib2FyZGVyID0gZnVuY3Rpb24oKSB7XG4gICAgICAgIHZhciBrZXlTdGF0ZSA9IHt9O1xuICAgICAgICB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcigna2V5ZG93bicsIGZ1bmN0aW9uKGUpIHtcbiAgICAgICAgICAgIGtleVN0YXRlW2Uua2V5Q29kZV0gPSB0cnVlO1xuICAgICAgICB9KTtcbiAgICAgICAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoJ2tleXVwJywgZnVuY3Rpb24oZSkge1xuICAgICAgICAgICAga2V5U3RhdGVbZS5rZXlDb2RlXSA9IGZhbHNlO1xuICAgICAgICB9KTtcbiAgICAgICAgdGhpcy5pc0Rvd24gPSBmdW5jdGlvbihrZXlDb2RlKSB7XG4gICAgICAgICAgICByZXR1cm4ga2V5U3RhdGVba2V5Q29kZV0gPT09IHRydWU7XG4gICAgICAgIH07XG4gICAgICAgIHRoaXMuYW55S2V5RG93biA9IGZ1bmN0aW9uKGZsYWcpe1xuICAgICAgICAgICAgdmFyIGsgPSBPYmplY3Qua2V5cygga2V5U3RhdGUgKTtcbiAgICAgICAgICAgIGZvciAoIHZhciB6ID0gMDsgeiA8IGsubGVuZ3RoOyB6KysgKSB7XG4gICAgICAgICAgICAgICAgaWYgKCBrZXlTdGF0ZVtrW3pdXSA9PT0gdHJ1ZSApIHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKCBmbGFnICkge1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYoIGxvbmdCdXR0b25EZWxheS5pc0RvbmUoKSApIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBsb25nQnV0dG9uRGVsYXkucmVzZXQoKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgIGlmKCBtdXRlQnV0dG9uRGVsYXkuaXNEb25lKCkgKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBtdXRlQnV0dG9uRGVsYXkucmVzZXQoKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICB9O1xuICAgICAgICB0aGlzLktFWVMgPSB7IExFRlQ6IDM3LCBSSUdIVDogMzksIFVQOiAzOCwgRE9XTjogNDAsIFNQQUNFOiAzMiwgWjogOTAsIFg6IDg4LCBDOiA2NywgTTogNzcsIFA6IDgwIH07XG4gICAgfTtcblxuXG5cbiAgICAvLyBTT1VORFNcbiAgICB2YXIgQXJjYWRlQXVkaW8gPSBmdW5jdGlvbigpIHtcbiAgICAgICAgdGhpcy5zb3VuZHMgPSB7fTtcbiAgICAgICAgdGhpcy5tdXRlID0gTVVURV9BVURJTztcbiAgICB9O1xuXG4gICAgQXJjYWRlQXVkaW8ucHJvdG90eXBlID0ge1xuICAgICAgICBhZGQgOiBmdW5jdGlvbigga2V5LCBjb3VudCwgc2V0dGluZ3MgKSB7XG4gICAgICAgICAgICB0aGlzLnNvdW5kc1sga2V5IF0gPSBbXTtcbiAgICAgICAgICAgIHNldHRpbmdzLmZvckVhY2goIGZ1bmN0aW9uKCBlbGVtLCBpbmRleCApIHtcbiAgICAgICAgICAgICAgICB0aGlzLnNvdW5kc1sga2V5IF0ucHVzaCgge1xuICAgICAgICAgICAgICAgICAgICB0aWNrOiAwLFxuICAgICAgICAgICAgICAgICAgICBjb3VudDogY291bnQsXG4gICAgICAgICAgICAgICAgICAgIHBvb2w6IFtdXG4gICAgICAgICAgICAgICAgfSApO1xuICAgICAgICAgICAgICAgIGZvciAoIHZhciBpID0gMDsgaSA8IGNvdW50OyBpKysgKSB7XG4gICAgICAgICAgICAgICAgICAgIHZhciBhdWRpbyA9IG5ldyBBdWRpbygpO1xuICAgICAgICAgICAgICAgICAgICBhdWRpby5zcmMgPSBqc2Z4ciggZWxlbSApO1xuICAgICAgICAgICAgICAgICAgICB0aGlzLnNvdW5kc1sga2V5IF1bIGluZGV4IF0ucG9vbC5wdXNoKCBhdWRpbyApO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0sIHRoaXMgKTtcbiAgICAgICAgfSxcbiAgICAgICAgcGxheSA6IGZ1bmN0aW9uKCBrZXkgKSB7XG4gICAgICAgICAgICBpZiAoICF0aGlzLm11dGUgKSB7XG4gICAgICAgICAgICAgICAgdmFyIHNvdW5kID0gdGhpcy5zb3VuZHNbIGtleSBdO1xuICAgICAgICAgICAgICAgIHZhciBzb3VuZERhdGEgPSBzb3VuZC5sZW5ndGggPiAxID8gc291bmRbIE1hdGguZmxvb3IoIE1hdGgucmFuZG9tKCkgKiBzb3VuZC5sZW5ndGggKSBdIDogc291bmRbIDAgXTtcbiAgICAgICAgICAgICAgICBzb3VuZERhdGEucG9vbFsgc291bmREYXRhLnRpY2sgXS5wbGF5KCk7XG4gICAgICAgICAgICAgICAgc291bmREYXRhLnRpY2sgPCBzb3VuZERhdGEuY291bnQgLSAxID8gc291bmREYXRhLnRpY2srKyA6IHNvdW5kRGF0YS50aWNrID0gMDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH07XG5cbiAgICAvLyBHQU1FIENMQVNTRVNcbiAgICB2YXIgQm94ID0gZnVuY3Rpb24oIG54LCBueSwgbncsIG5oLCBwYXNzdGhyb3VnaCwgaWNlYmFzZSApIHtcbiAgICAgICAgdGhpcy53aWR0aCA9IG53O1xuICAgICAgICB0aGlzLmhlaWdodCA9IG5oO1xuICAgICAgICB0aGlzLnggPSBueDtcbiAgICAgICAgdGhpcy55ID0gbnk7XG4gICAgICAgIHRoaXMuaXNQYXNzdGhyb3VnaCA9IHtcbiAgICAgICAgICAgIGJvdHRvbTogcGFzc3Rocm91Z2guYm90dG9tIHx8IGZhbHNlLFxuICAgICAgICAgICAgbGVmdDogcGFzc3Rocm91Z2gubGVmdCB8fCBmYWxzZSxcbiAgICAgICAgICAgIHJpZ2h0OiBwYXNzdGhyb3VnaC5yaWdodCB8fCBmYWxzZVxuICAgICAgICB9O1xuICAgICAgICB0aGlzLmljZWJhc2UgPSBpY2ViYXNlIHx8IGZhbHNlO1xuICAgICAgICB0aGlzLmlzRW1wdHkgPSB0cnVlO1xuICAgIH07XG5cbiAgICBCb3gucHJvdG90eXBlID0ge1xuICAgICAgICB1cGRhdGUgOiBmdW5jdGlvbigpe30sXG4gICAgICAgIHJlbmRlciA6IGZ1bmN0aW9uKGN0eCl7XG4gICAgICAgICAgICAvKlxuICAgICAgICAgICAgY3R4LmZpbGxTdHlsZSA9ICdibHVlJztcbiAgICAgICAgICAgIGN0eC5zdHJva2VTdHlsZSA9ICdibHVlJztcbiAgICAgICAgICAgIGlmICggdGhpcy5pc1Bhc3N0aHJvdWdoLmJvdHRvbSApIHtcbiAgICAgICAgICAgICAgICBjdHguZmlsbFN0eWxlID0gJ2JsYWNrJztcbiAgICAgICAgICAgICAgICBjdHguc3Ryb2tlU3R5bGUgPSAnYmxhY2snO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKCB0aGlzLmlzUGFzc3Rocm91Z2gubGVmdCB8fCB0aGlzLmlzUGFzc3Rocm91Z2gucmlnaHQgKSB7XG4gICAgICAgICAgICAgICAgY3R4LmZpbGxTdHlsZSA9ICd5ZWxsb3cnO1xuICAgICAgICAgICAgICAgIGN0eC5zdHJva2VTdHlsZSA9ICd5ZWxsb3cnO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBjdHguYmVnaW5QYXRoKCk7XG4gICAgICAgICAgICBjdHgubGluZVdpZHRoID0gJzEnO1xuICAgICAgICAgICAgY3R4LnJlY3QodGhpcy54LCB0aGlzLnksIHRoaXMud2lkdGgsIHRoaXMuaGVpZ2h0KTtcbiAgICAgICAgICAgIGN0eC5zdHJva2UoKTtcbiAgICAgICAgICAgICovXG4gICAgICAgICAgICAvLyBjdHguZmlsbFJlY3QodGhpcy54LCB0aGlzLnksIHRoaXMud2lkdGgsIHRoaXMuaGVpZ2h0KTtcbiAgICAgICAgfVxuICAgIH07XG5cbiAgICB2YXIgSGVhcnQgPSBmdW5jdGlvbihueCxueSkge1xuICAgICAgICB0aGlzLndpZHRoID0gMTQ7XG4gICAgICAgIHRoaXMuaGVpZ2h0ID0gMTQ7XG4gICAgICAgIHRoaXMueCA9IG54O1xuICAgICAgICB0aGlzLnkgPSBueTtcbiAgICAgICAgdGhpcy52ZWxYID0gMDtcbiAgICAgICAgdGhpcy52ZWxZID0gZ2V0UmFuZG9tSW50KDEsIDIpIC8gMjtcbiAgICAgICAgdGhpcy5mcmljdGlvbiA9IDAuNztcbiAgICAgICAgdGhpcy50b2dnbGUgPSBnZXRSYW5kb21Cb29sZWFuKCk7XG4gICAgICAgIHRoaXMuY291bnRlciA9IDA7XG4gICAgICAgIHRoaXMuc2lkZXdheXMgPSBnZXRSYW5kb21JbnQoMjAsIDYwKTtcbiAgICAgICAgdGhpcy5zdHVjayA9IGZhbHNlO1xuICAgICAgICB0aGlzLmlzRGVhZCA9IGZhbHNlO1xuICAgICAgICB0aGlzLnNwcml0ZVN0dWNrID0gbmV3IFNwcml0ZSggNywgOCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgWyB7IHNzeDogMCwgc3N5OiAwLCBkdXJhdGlvbjogNDAwIH0sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgeyBzc3g6IDIxLCBzc3k6IDAsIGR1cmF0aW9uOiA0MDAgfV0gKTtcbiAgICAgICAgdGhpcy5zcHJpdGVGbHV0dGVyaW5nID0gbmV3IFNwcml0ZSggNywgOCxcbiAgICAgICAgICAgICAgICAgICAgWyB7IHNzeDogMCwgc3N5OiAwLCBkdXJhdGlvbjogNDAwIH0sXG4gICAgICAgICAgICAgICAgICAgICAgeyBzc3g6IDcsIHNzeTogMCwgZHVyYXRpb246IDQwMCB9LFxuICAgICAgICAgICAgICAgICAgICAgIHsgc3N4OiAxNCwgc3N5OiAwLCBkdXJhdGlvbjogNDAwIH1dKTtcbiAgICB9O1xuXG4gICAgSGVhcnQucHJvdG90eXBlID0ge1xuICAgICAgICB1cGRhdGUgOiBmdW5jdGlvbihnYW1lU2l6ZSwgaGVhcnRTdG9wcGVycywgcGxheWVyKXtcblxuICAgICAgICAgICAgaWYgKCAhdGhpcy5zdHVjayAmJiAhdGhpcy5pc0RlYWQgKSB7XG4gICAgICAgICAgICAgICAgaWYgKCB0aGlzLnRvZ2dsZSApIHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy52ZWxYICs9IDE7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuY291bnRlcisrO1xuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMudmVsWCAtPSAxO1xuICAgICAgICAgICAgICAgICAgICB0aGlzLmNvdW50ZXIrKztcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICBpZiAodGhpcy5jb3VudGVyID4gdGhpcy5zaWRld2F5cyApIHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy50b2dnbGUgPSAhdGhpcy50b2dnbGU7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuY291bnRlciA9IDA7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuc2lkZXdheXMgPSBnZXRSYW5kb21JbnQoNDAsIDYwKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgdGhpcy52ZWxYICo9IHRoaXMuZnJpY3Rpb247XG4gICAgICAgICAgICAgICAgdGhpcy54ICs9IHRoaXMudmVsWDtcbiAgICAgICAgICAgICAgICB0aGlzLnkgKz0gdGhpcy52ZWxZO1xuXG4gICAgICAgICAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBoZWFydFN0b3BwZXJzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICAgICAgICAgIGlmICggc2ltcGxlQ29sQ2hlY2sodGhpcywgaGVhcnRTdG9wcGVyc1tpXSkgKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoIHRoaXMueCA8IDUgfHwgdGhpcy54ID4gKGdhbWVTaXplLndpZHRoIC0gNSkpIHtcblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuaXNEZWFkID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLnN0dWNrID0gdHJ1ZTtcblxuICAgICAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoICF0aGlzLnN0dWNrICYmICF0aGlzLmlzRGVhZCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBoZWFydHNpbmRhbmdlcisrO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLnN0dWNrID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB0aGlzLnNwcml0ZUZsdXR0ZXJpbmcudXBkYXRlKCk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLnNwcml0ZVN0dWNrLnVwZGF0ZSgpO1xuICAgICAgICAgICAgICAgICAgICBpZiAoIHRoaXMueCA8IDUgfHwgdGhpcy54ID4gKGdhbWVTaXplLndpZHRoIC0gNSkgKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmlzRGVhZCA9IHRydWU7XG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLnN0dWNrID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIGhlYXJ0c2luZGFuZ2VyLS07XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgaWYgKCAhdGhpcy5pc0RlYWQgJiYgc2ltcGxlQ29sQ2hlY2soIHRoaXMsIHBsYXllcikpIHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5pc0RlYWQgPSB0cnVlO1xuICAgICAgICAgICAgICAgICAgICBhYS5wbGF5KCdwaWNrdXAnKTtcbiAgICAgICAgICAgICAgICAgICAgY3VycmVudEhlYXJ0cysrO1xuXG4gICAgICAgICAgICAgICAgICAgIGlmIChjdXJyZW50SGVhcnRzID4gTUFYSEVBUlRTIC0gMSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgZW5kR2FtZSgnRU5EJyk7XG4gICAgICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgICAgICBpZiAoIHRoaXMuc3R1Y2spIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGhlYXJ0c2luZGFuZ2VyLS07XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfSxcbiAgICAgICAgcmVuZGVyOiBmdW5jdGlvbihjdHgpe1xuICAgICAgICAgICAgaWYgKCAhdGhpcy5zdHVjayApIHtcbiAgICAgICAgICAgICAgICB0aGlzLnNwcml0ZUZsdXR0ZXJpbmcucmVuZGVyKGN0eCwgdGhpcy54LCB0aGlzLnksIHRoaXMudmVsWCA8IDAgKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICB0aGlzLnNwcml0ZVN0dWNrLnJlbmRlcihjdHgsIHRoaXMueCwgdGhpcy55ICk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9O1xuXG4gICAgdmFyIEhlYXJ0U3ByaW5rbGVyID0gZnVuY3Rpb24oZ2FtZSwgZ2FtZVNpemUpIHtcbiAgICAgICAgdGhpcy5nYW1lID0gZ2FtZTtcbiAgICAgICAgdGhpcy53aWR0aCA9IDE4KjI7XG4gICAgICAgIHRoaXMuaGVpZ2h0ID0gMjYqMjtcbiAgICAgICAgdGhpcy54ID0gZ2FtZVNpemUud2lkdGggLyAyO1xuICAgICAgICB0aGlzLnkgPSA3NztcbiAgICAgICAgdGhpcy5zcGVlZCA9IDM7XG4gICAgICAgIHRoaXMudmVsWCA9IDA7XG4gICAgICAgIHRoaXMuZnJpY3Rpb24gPSAwLjY7XG4gICAgICAgIHRoaXMuZ29pbmdMZWZ0ID0gZmFsc2U7XG4gICAgICAgIHRoaXMuc3RvcHBlZCA9IGZhbHNlO1xuICAgICAgICB0aGlzLmNvdW50ZXIgPSAwO1xuICAgICAgICB0aGlzLm5leHRTdG9wID0gMTA7IC8vIDQwMDtcbiAgICAgICAgdGhpcy5zcHJpdGVTdG9wcGVkID0gbmV3IFNwcml0ZSggMTgsIDI2LFxuICAgICAgICAgICAgICAgICAgICBbIHsgc3N4OiA3NSwgc3N5OiA3MywgZHVyYXRpb246IDIwMCB9LFxuICAgICAgICAgICAgICAgICAgICAgIHsgc3N4OiA5Mywgc3N5OiA3MywgZHVyYXRpb246IDIwMCB9IF0pO1xuICAgICAgICB0aGlzLnNwcml0ZVdhbGtpbmcgPSBuZXcgU3ByaXRlKCAxOCwgMjYsXG4gICAgICAgICAgICAgICAgICAgIFsgeyBzc3g6IDc1LCBzc3k6IDczLCBkdXJhdGlvbjogMjAwIH0sXG4gICAgICAgICAgICAgICAgICAgICAgeyBzc3g6IDExMSwgc3N5OiA3MywgZHVyYXRpb246IDIwMCB9IF0pO1xuICAgIH07XG5cbiAgICBIZWFydFNwcmlua2xlci5wcm90b3R5cGUgPSB7XG4gICAgICAgIHVwZGF0ZSA6IGZ1bmN0aW9uKGdhbWVTaXplKXtcblxuICAgICAgICAgICAgaWYgKCAhdGhpcy5zdG9wcGVkICkge1xuICAgICAgICAgICAgICAgIGlmICggdGhpcy5nb2luZ0xlZnQgKSB7XG4gICAgICAgICAgICAgICAgICAgIGlmICh0aGlzLnZlbFggPiAtdGhpcy5zcGVlZCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy52ZWxYLS07XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICBpZiAodGhpcy52ZWxYIDwgdGhpcy5zcGVlZCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy52ZWxYKys7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICB0aGlzLnZlbFggKj0gdGhpcy5mcmljdGlvbjtcbiAgICAgICAgICAgICAgICB0aGlzLnggKz0gdGhpcy52ZWxYO1xuXG4gICAgICAgICAgICAgICAgaWYgKCB0aGlzLnggPiBnYW1lU2l6ZS53aWR0aCAtIDEwMCApIHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5nb2luZ0xlZnQgPSB0cnVlO1xuICAgICAgICAgICAgICAgICAgICB0aGlzLnZlbFggPSAwO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBpZiAoIHRoaXMueCA8IDEwMCApIHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5nb2luZ0xlZnQgPSBmYWxzZTtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy52ZWxYID0gMDtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIC8vIHJhbmRvbWx5IHN0b3Agb25jZSBpbiBhIHdoaWxlIC0gNSVcbiAgICAgICAgICAgIGlmICggIXRoaXMuc3RvcHBlZCAmJiB0aGlzLm5leHRTdG9wIDwgMCApIHtcbiAgICAgICAgICAgICAgICB2YXIgaSA9IGdldFJhbmRvbUludCgxLCAxMDAwKTtcbiAgICAgICAgICAgICAgICBpZiAoaSA+IDEwMCApeyAvLyA5OTUgKSB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuc3RvcHBlZCA9IHRydWU7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuY291bnRlciA9IGdldFJhbmRvbUludCgxMDAsIDIwMCk7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMubmV4dFN0b3AgPSA0MDsgLy80MDBcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5nYW1lLmZhbGxpbmdTdHVmZiA9IHRoaXMuZ2FtZS5mYWxsaW5nU3R1ZmYuY29uY2F0KCBuZXcgSGVhcnQoIHRoaXMueCwgdGhpcy55ICkgKTtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5zcHJpdGVTdG9wcGVkLnVwZGF0ZSgpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgaWYgKCB0aGlzLmNvdW50ZXIgPiAwICYmIHRoaXMuc3RvcHBlZCkge1xuICAgICAgICAgICAgICAgIHRoaXMuY291bnRlci0tO1xuICAgICAgICAgICAgICAgIHRoaXMuc3ByaXRlU3RvcHBlZC51cGRhdGUoKTtcbiAgICAgICAgICAgICAgICBpZiAoIHRoaXMuY291bnRlciA8PSAwICkge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLnN0b3BwZWQgPSBmYWxzZTtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5zcHJpdGVXYWxraW5nLnNldEZyYW1lKDApO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgdGhpcy5uZXh0U3RvcC0tO1xuICAgICAgICAgICAgICAgIHRoaXMuc3ByaXRlV2Fsa2luZy51cGRhdGUoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSxcbiAgICAgICAgcmVuZGVyIDogZnVuY3Rpb24oY3R4KXtcbiAgICAgICAgICAgIGlmICggdGhpcy5zdG9wcGVkICkge1xuICAgICAgICAgICAgICAgIHRoaXMuc3ByaXRlU3RvcHBlZC5yZW5kZXIoY3R4LCB0aGlzLngsIHRoaXMueSwgIXRoaXMuZ29pbmdMZWZ0KTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgdGhpcy5zcHJpdGVXYWxraW5nLnJlbmRlcihjdHgsIHRoaXMueCwgdGhpcy55LCAhdGhpcy5nb2luZ0xlZnQpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgIH1cbiAgICB9O1xuXG4gICAgLy8gTU9OU1RFUiBDTEFTU0VTXG5cbiAgICB2YXIgTW9uc3RlckJsb2NrID0gZnVuY3Rpb24oIG54LCBueSwgbncsIG5oLCBibG9ja3MgKSB7XG4gICAgICAgIHRoaXMud2lkdGggPSBudztcbiAgICAgICAgdGhpcy5oZWlnaHQgPSBuaDtcbiAgICAgICAgdGhpcy54ID0gbng7XG4gICAgICAgIHRoaXMueSA9IG55O1xuICAgICAgICB0aGlzLmJsb2NrcyA9IGJsb2NrcyB8fCBbXTtcbiAgICB9O1xuXG4gICAgTW9uc3RlckJsb2NrLnByb3RvdHlwZSA9IHtcbiAgICAgICAgZG9lc0Jsb2NrIDogZnVuY3Rpb24obW9uc3Rlck5hbWUpIHtcbiAgICAgICAgICAgIGlmICggdGhpcy5ibG9ja3MuaW5kZXhPZiggbW9uc3Rlck5hbWUudG9Mb3dlckNhc2UoKSApID4gLTEgKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgIH1cbiAgICB9O1xuXG4gICAgLy8gZm91ciBlbGVtZW50YWwgZW5lbWllc1xuICAgIHZhciBCYWRHdXkgPSBmdW5jdGlvbihkeCxkeSwgdHlwZSwgYnR5cGUsIHNwZWVkKXtcbiAgICAgICAgdGhpcy53aWR0aCA9IDMyO1xuICAgICAgICB0aGlzLmhlaWdodCA9IDY0O1xuICAgICAgICB0aGlzLnggPSBkeDtcbiAgICAgICAgdGhpcy55ID0gZHk7XG4gICAgICAgIHRoaXMudHlwZSA9IHR5cGU7IC8vIDAgPSBmaXJlLCAxID0gZWFydGgsIDIgPSBpY2VcbiAgICAgICAgdGhpcy5sYXN0TW92ZSA9IGdldFRpbWVTdGFtcCgpO1xuICAgICAgICB0aGlzLm5vdyA9IG51bGw7XG4gICAgICAgIHRoaXMuZ29pbmdMZWZ0ID0gZ2V0UmFuZG9tQm9vbGVhbigpO1xuICAgICAgICB0aGlzLmlzRGVhZCA9IGZhbHNlO1xuICAgICAgICB0aGlzLmxhc3RIaXQgPSBudWxsO1xuICAgICAgICB0aGlzLmJsb2NrdHlwZSA9IGJ0eXBlO1xuICAgICAgICB0aGlzLnNwZWVkID0gc3BlZWQgfHwgMjtcbiAgICAgICAgdGhpcy50YXJnZXRiYXNlID0gbnVsbDtcbiAgICAgICAgdGhpcy5zdGF0ZSA9ICd3JztcbiAgICAgICAgdGhpcy5zcHJpdGVBID0gbnVsbDtcbiAgICAgICAgdGhpcy5zcHJpdGVCID0gbnVsbDtcbiAgICAgICAgdGhpcy5zcHJpdGVDID0gbnVsbDtcbiAgICAgICAgdGhpcy5teWJsb2NrID0gbnVsbDtcbiAgICAgICAgdGhpcy5kZWxheUNvdW50ZXIgPSBuZXcgRGVsYXlDb3VudGVyKFs4MDAsIDgwMCwgMjAwXSk7XG4gICAgICAgIHN3aXRjaCggdGhpcy50eXBlICkge1xuICAgICAgICAgICAgLy8gZmlyZSBzcHJpdGVcbiAgICAgICAgICAgIGNhc2UgMCA6XG4gICAgICAgICAgICAgICAgdGhpcy5zcHJpdGVBID0gbmV3IFNwcml0ZSggMTIsIDE1LCBbIHsgc3N4OiAzMywgc3N5OiAzMywgZHVyYXRpb246IDIwMCB9LCB7IHNzeDogNDUsIHNzeTogMzMsIGR1cmF0aW9uOiAyMDAgfSBdICk7XG4gICAgICAgICAgICAgICAgdGhpcy5zcHJpdGVCID0gbmV3IFNwcml0ZSggMTIsIDE1LCBbIHsgc3N4OiA1Nywgc3N5OiAzMywgZHVyYXRpb246IDUwIH0sIHsgc3N4OiA2OSwgc3N5OiAzMywgZHVyYXRpb246IDUwIH0gXSApO1xuICAgICAgICAgICAgICAgIHRoaXMuaGVpZ2h0ID0gMzA7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIC8vIHNhbmQgbW9uc3RlclxuICAgICAgICAgICAgY2FzZSAxOlxuICAgICAgICAgICAgICAgIHRoaXMuc3ByaXRlQSA9IG5ldyBTcHJpdGUoIDE4LCAzLCBbIHsgc3N4OiA2MSwgc3N5OiA0OSwgZHVyYXRpb246IDUwMCB9LCB7IHNzeDogNzksIHNzeTogNDksIGR1cmF0aW9uOiA1MDAgfSBdICk7XG4gICAgICAgICAgICAgICAgdGhpcy5zcGVlZCA9IDE7XG4gICAgICAgICAgICAgICAgLy8gZG93biA9IDEzM1xuICAgICAgICAgICAgICAgIC8vIHVwMSA9IDk3XG4gICAgICAgICAgICAgICAgLy8gdXAyID0gMTUxXG4gICAgICAgICAgICAgICAgLy8gZG93biA9IDEzM1xuICAgICAgICAgICAgICAgIHRoaXMuc3ByaXRlQiA9IG5ldyBTcHJpdGUoIDE4LCAxMywgWyB7IHNzeDogMTMzLCBzc3k6IDMyLCBkdXJhdGlvbjogNDAwIH0gXSApO1xuICAgICAgICAgICAgICAgIGZvcih2YXIgaSA9IDA7IGkgPCA3OyBpKysgKSB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuc3ByaXRlQi5mcmFtZXMucHVzaCggeyBzc3g6IDk3LCBzc3k6IDMyLCBkdXJhdGlvbjogMjAwIH0gKTtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5zcHJpdGVCLmZyYW1lcy5wdXNoKCB7IHNzeDogMTUxLCBzc3k6IDMyLCBkdXJhdGlvbjogMjAwIH0gKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgdGhpcy5zcHJpdGVCLmZyYW1lcy5wdXNoKCB7IHNzeDogMTMzLCBzc3k6IDMyLCBkdXJhdGlvbjogNDAwIH0gKTtcbiAgICAgICAgICAgICAgICB0aGlzLnNwcml0ZUIuZnJhbWVzLnB1c2goIHsgc3N4OiAxMzMsIHNzeTogMzIsIGR1cmF0aW9uOiAxMDAgfSApO1xuXG4gICAgICAgICAgICAgICAgLy8gYXR0YWNraW5nID0gMTE1XG4gICAgICAgICAgICAgICAgdGhpcy5zcHJpdGVDID0gbmV3IFNwcml0ZSggMTgsIDEzLCBbIHsgc3N4OiAxMTUsIHNzeTogMzIsIGR1cmF0aW9uOiAxMDAgfSBdICk7XG4gICAgICAgICAgICAgICAgdGhpcy5oZWlnaHQgPSA2O1xuICAgICAgICAgICAgICAgIHRoaXMud2lkdGggPSAzNTtcbiAgICAgICAgICAgICAgICB0aGlzLmRlbGF5Q291bnRlciA9IG5ldyBEZWxheUNvdW50ZXIoWzYwMCwgODAwLCA0MDAwLCA0MDBdKTtcbiAgICAgICAgICAgICAgICB0aGlzLmRlbGF5Q291bnRlci5jdXJyZW50RGVsdGEgPSBnZXRSYW5kb21JbnQoMCwzKTtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIC8vIHNub3cgbWFuXG4gICAgICAgICAgICBjYXNlIDI6XG4gICAgICAgICAgICAgICAgdGhpcy5zcHJpdGVBID0gbmV3IFNwcml0ZSggMTMsIDEyLCBbIHsgc3N4OiAzMSwgc3N5OiA1MywgZHVyYXRpb246IDIwMCB9LCB7IHNzeDogNDQsIHNzeTogNTMsIGR1cmF0aW9uOiAyMDAgfSBdICk7XG4gICAgICAgICAgICAgICAgdGhpcy5zcHJpdGVCID0gbmV3IFNwcml0ZSggMTMsIDEyLCBbIHsgc3N4OiA1Nywgc3N5OiA1MywgZHVyYXRpb246IDIwMCB9LCB7IHNzeDogNzAsIHNzeTogNTMsIGR1cmF0aW9uOiAyMDAgfSBdICk7XG4gICAgICAgICAgICAgICAgdGhpcy5oZWlnaHQgPSAyNDtcbiAgICAgICAgICAgICAgICB0aGlzLndpZHRoID0gMjY7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAvLyB3aW5kIGR1Y2tcbiAgICAgICAgICAgIGNhc2UgMzpcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZygnaGVyZScpO1xuICAgICAgICAgICAgICAgIHRoaXMuaGF2ZUF0dGFja2VkID0gZmFsc2U7XG4gICAgICAgICAgICAgICAgdGhpcy5jaGFuZ2VEaXJlY3Rpb24gPSBmYWxzZTtcbiAgICAgICAgICAgICAgICB0aGlzLmhvcEhlaWdodCA9IDA7XG4gICAgICAgICAgICAgICAgdGhpcy5ob3AgPSBbIFswLDEwXSwgWzIsMjBdLCBbMiwyMF0sIFsyLDIwXSwgWzEsMjBdLCBbMCwyMF0sIFswLDIwXSwgWzAsMjBdLCBbLTEsMjBdLCBbLTIsMjBdLCBbLTIsMjBdLCBbLTIsMjBdIF07XG4gICAgICAgICAgICAgICAgLy90aGlzLnNwcml0ZUEgPSBuZXcgU3ByaXRlKCAxMywgMTIsIFsgeyBzc3g6IDMxLCBzc3k6IDUzLCBkdXJhdGlvbjogMjAwIH0sIHsgc3N4OiA0NCwgc3N5OiA1MywgZHVyYXRpb246IDIwMCB9IF0gKTtcbiAgICAgICAgICAgICAgICAvL3RoaXMuc3ByaXRlQiA9IG5ldyBTcHJpdGUoIDEzLCAxMiwgWyB7IHNzeDogNTcsIHNzeTogNTMsIGR1cmF0aW9uOiAyMDAgfSwgeyBzc3g6IDcwLCBzc3k6IDUzLCBkdXJhdGlvbjogMjAwIH0gXSApO1xuXG4gICAgICAgICAgICAgICAgdGhpcy5zcHJpdGVBID0gbmV3IFNwcml0ZSggMTYsIDMyLCBbIHsgc3N4OiA0Miwgc3N5OiAwIH0sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHsgc3N4OiA1OCwgc3N5OiAwIH0sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHsgc3N4OiA3NCwgc3N5OiAwIH0sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHsgc3N4OiA5MCwgc3N5OiAwIH0gXSk7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIH1cblxuICAgIH07XG5cbiAgICBCYWRHdXkucHJvdG90eXBlID0ge1xuICAgICAgICB1cGRhdGU6IGZ1bmN0aW9uKCBtb25zdGVyYmxvY2tlcnMsIHBsYXllciwgdGhpbmdzLCBpY2VibG9ja2Jhc2VzICkge1xuXG4gICAgICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IG1vbnN0ZXJibG9ja2Vycy5sZW5ndGg7IGkrKyApIHtcbiAgICAgICAgICAgICAgICBpZiAoIHNpbXBsZUNvbENoZWNrKHRoaXMsIG1vbnN0ZXJibG9ja2Vyc1tpXSApICYmIG1vbnN0ZXJibG9ja2Vyc1tpXS5kb2VzQmxvY2sodGhpcy5ibG9ja3R5cGUpICYmIHRoaXMubGFzdEhpdCAhPT0gbW9uc3RlcmJsb2NrZXJzW2ldKSB7IC8vIHB1dCB0aGlzIGJpdCBiYWNrIGluIC0gcmVzZXQgaXQgaW4gc3RhdGVzIGJlbG93KSB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuZ29pbmdMZWZ0ID0gIXRoaXMuZ29pbmdMZWZ0O1xuICAgICAgICAgICAgICAgICAgICB0aGlzLmxhc3RIaXQgPSBtb25zdGVyYmxvY2tlcnNbaV07XG4gICAgICAgICAgICAgICAgICAgIGlmICggdGhpcy50eXBlID09PSAyICkge1xuICAgICAgICAgICAgICAgICAgICAgICAgLy8gY29uc29sZS5sb2coJ2NvbGxpc2lvbiAnICsgdGhpcy5zdGF0ZSArICcgLSAnICsgdGhpcy5nb2luZ0xlZnQpO1xuICAgICAgICAgICAgICAgICAgICAgICAgc3dpdGNoKCB0aGlzLnN0YXRlICkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNhc2UgJ2hiJzpcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gZ2V0IGFuIGljZSBibG9ja1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLnN0YXRlID0gJ3BiJztcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5zcGVlZCA9IDE7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMubXlibG9jayA9IHNwYXduQVRoaW5nKCAodGhpcy5nb2luZ0xlZnQgPyB0aGlzLnggLSAyNTogdGhpcy54ICsgdGhpcy53aWR0aCArIDEpLCB0aGlzLnkgLSA0LCA0LCB0aGlzLmdvaW5nTGVmdCwgZmFsc2UsIGZhbHNlLCBmYWxzZSApO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjYXNlICdwYic6XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY2FzZSAnZGonOlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoIHRoaXMubXlibG9jayAhPT0gbnVsbCAmJiAhdGhpcy5teWJsb2NrLmlzRGVhZCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5teWJsb2NrLmlzRGVhZCA9IHRydWU7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLm15YmxvY2sgPSBudWxsO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuc3RhdGUgPSAndyc7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuc3BlZWQgPSAxO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjYXNlICd0JzpcblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiggdGhpcy5nb2luZ0xlZnQgKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLnggPSAtNjA7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLnggPSAxMDMwO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vdGhpcy5nb2luZ0xlZnQgPSAhdGhpcy5nb2luZ0xlZnQ7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuc3RhdGUgPSAndyc7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuc3BlZWQgPSAxO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBzd2l0Y2goIHRoaXMudHlwZSApIHtcbiAgICAgICAgICAgICAgICBjYXNlIDA6XG4gICAgICAgICAgICAgICAgICAgIHRoaXMudXBkYXRlRmlyZUd1eShtb25zdGVyYmxvY2tlcnMsIHBsYXllciwgdGhpbmdzKTtcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgY2FzZSAxOlxuICAgICAgICAgICAgICAgICAgICB0aGlzLnVwZGF0ZUVhcnRoR3V5KG1vbnN0ZXJibG9ja2VycywgcGxheWVyLCB0aGluZ3MpO1xuICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICBjYXNlIDI6XG4gICAgICAgICAgICAgICAgICAgIHRoaXMudXBkYXRlSWNlR3V5KG1vbnN0ZXJibG9ja2VycywgcGxheWVyLCB0aGluZ3MsIGljZWJsb2NrYmFzZXMpO1xuICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICBjYXNlIDM6XG4gICAgICAgICAgICAgICAgICAgIHRoaXMudXBkYXRlRHVjayhtb25zdGVyYmxvY2tlcnMsIHBsYXllciwgdGhpbmdzKTtcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0sXG4gICAgICAgIHVwZGF0ZUR1Y2s6IGZ1bmN0aW9uKCBtb25zdGVyYmxvY2tlcnMsIHBsYXllciwgdGhpbmdzICkge1xuICAgICAgICAgICAgaWYoIHRoaXMudGNvbGNoZWNrKCBbXCI2XCJdLCBbIFwiMlwiLCBcIjNcIiwgXCI1XCIsIFwiNlwiLCBcIjdcIiBdLCB0aGluZ3MpICkge1xuICAgICAgICAgICAgICAgIHRoaXMuc3RhdGUgPSAnZCc7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHRoaXMubm93ID0gZ2V0VGltZVN0YW1wKCk7XG4gICAgICAgICAgICBzd2l0Y2goIHRoaXMuc3RhdGUgKSB7XG4gICAgICAgICAgICAgICAgY2FzZSAnZCc6XG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLnkgKz0gMztcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmICggdGhpcy55ID4gMTAwMCApIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLnJlc2V0KCk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICAvLyBob3BwaW5nIGR1Y2tcbiAgICAgICAgICAgICAgICBjYXNlICd3JzpcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5zcHJpdGVBLnNldEZyYW1lKDApO1xuICAgICAgICAgICAgICAgICAgICBpZiAoICF0aGlzLmlzRGVhZCApIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmICggdGhpcy5ub3cgLSB0aGlzLmxhc3RNb3ZlID4gdGhpcy5ob3BbdGhpcy5ob3BIZWlnaHRdWzFdICkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmICggdGhpcy5nb2luZ0xlZnQgKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMueCAtPSAyO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLnkgLT0gdGhpcy5ob3BbdGhpcy5ob3BIZWlnaHRdWzBdO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMueCArPSAyO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLnkgLT0gdGhpcy5ob3BbdGhpcy5ob3BIZWlnaHRdWzBdO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmhvcEhlaWdodCsrO1xuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKCB0aGlzLmhvcEhlaWdodCA+PSB0aGlzLmhvcC5sZW5ndGggKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuaG9wSGVpZ2h0ID0gMDtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5ob3BDb3VudGVyKys7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmICggdGhpcy5jaGFuZ2VEaXJlY3Rpb24gKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmdvaW5nTGVmdCA9ICF0aGlzLmdvaW5nTGVmdDtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuY2hhbmdlRGlyZWN0aW9uID0gZmFsc2U7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoIHRoaXMuY2hlY2tGb3JQbGF5ZXIocGxheWVyLCA4MDApICkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5zdGF0ZSA9ICdsJztcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuaG9wQ291bnRlciA9IDA7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmxhc3RNb3ZlID0gdGhpcy5ub3c7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5sYXN0TW92ZSA9IHRoaXMubm93O1xuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gY2hlY2sgZm9yIGNvbGxpc3Npb24gd2l0aCBtb25zdGVyIGJsb2NrZXJzXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBtb25zdGVyYmxvY2tlcnMubGVuZ3RoOyBpKysgKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmICggc2ltcGxlQ29sQ2hlY2sodGhpcywgbW9uc3RlcmJsb2NrZXJzW2ldICkgJiYgbW9uc3RlcmJsb2NrZXJzW2ldLmRvZXNCbG9jaygnd2QnKSAmJiB0aGlzLmxhc3RIaXQgIT09IG1vbnN0ZXJibG9ja2Vyc1tpXSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5sYXN0SGl0ID0gbW9uc3RlcmJsb2NrZXJzW2ldO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5jaGFuZ2VEaXJlY3Rpb24gPSB0cnVlO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKCB0aGlzLmhvcENvdW50ZXIgPiAxMyApIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLnN0YXRlID0gJ3MnO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMubGFzdE1vdmUgPSB0aGlzLm5vdztcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgIC8vIGxvb2tpbmcgYXJvdW5kXG4gICAgICAgICAgICAgICAgY2FzZSAncyc6XG4gICAgICAgICAgICAgICAgICAgIC8vIGNoZWNrIGlmIHBsYXllciBjb2xsaWRlcyB3aXRoIGFsYXJtIGJveFxuICAgICAgICAgICAgICAgICAgICBpZiAoIHRoaXMuY2hlY2tGb3JQbGF5ZXIocGxheWVyLCA4MDApICkge1xuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5zdGF0ZSA9ICdsJztcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuaG9wQ291bnRlciA9IDA7XG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmxhc3RNb3ZlID0gdGhpcy5ub3c7XG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAoIHRoaXMubm93IC0gdGhpcy5sYXN0TW92ZSA+IDEzMDAgKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAvLyBiYWNrIHRvIGhvcHBpbmdcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMubGFzdE1vdmUgPSB0aGlzLm5vdztcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuc3RhdGUgPSAndyc7XG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmhvcENvdW50ZXIgPSAwO1xuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5oYXZlQXR0YWNrZWQgPSBmYWxzZTtcbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIGlmICggdGhpcy5ub3cgLSB0aGlzLmxhc3RNb3ZlID4gOTAwICkge1xuICAgICAgICAgICAgICAgICAgICAgICAgLy8gbG9vayByaWdodCBhZ2FpblxuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5zcHJpdGVBLnNldEZyYW1lKDEpO1xuICAgICAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKCB0aGlzLm5vdyAtIHRoaXMubGFzdE1vdmUgPiAzMDAgKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLnNwcml0ZUEuc2V0RnJhbWUoMCk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgLy8gYWxhcm1cbiAgICAgICAgICAgICAgICBjYXNlICdsJzpcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5zcHJpdGVBLnNldEZyYW1lKDIpO1xuICAgICAgICAgICAgICAgICAgICBpZiAoIHRoaXMubm93IC0gdGhpcy5sYXN0TW92ZSA+IDUwMCApIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuc3RhdGUgPSAnYSc7XG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmxhc3RNb3ZlID0gdGhpcy5ub3c7XG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmhhdmVBdHRhY2tlZCA9IGZhbHNlO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgIC8vIGF0dGFja1xuICAgICAgICAgICAgICAgIGNhc2UgJ2EnOlxuICAgICAgICAgICAgICAgICAgICBpZiAoICF0aGlzLmhhdmVBdHRhY2tlZCApIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGFhLnBsYXkoJ2NoZWVwJyk7XG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmF0dGFjaygpO1xuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5oYXZlQXR0YWNrZWQgPSB0cnVlO1xuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5zcHJpdGVBLnNldEZyYW1lKDMpO1xuICAgICAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAgICAgaWYgKCB0aGlzLm5vdyAtIHRoaXMubGFzdE1vdmUgPiAxMDAwICkge1xuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5sYXN0TW92ZSA9IHRoaXMubm93O1xuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5zdGF0ZSA9ICd3JztcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuaG9wQ291bnRlciA9IDExO1xuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5oYXZlQXR0YWNrZWQgPSBmYWxzZTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSxcbiAgICAgICAgdXBkYXRlRmlyZUd1eTogZnVuY3Rpb24oIG1vbnN0ZXJibG9ja2VycywgcGxheWVyLCB0aGluZ3MgKSB7XG4gICAgICAgICAgICBpZiggdGhpcy50Y29sY2hlY2soIFtcIjdcIl0sIFsgXCIyXCIsIFwiM1wiLCBcIjVcIiwgXCI2XCIsIFwiN1wiIF0sIHRoaW5ncykgKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5zdGF0ZSA9ICdkJztcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgc3dpdGNoKCB0aGlzLnN0YXRlICkge1xuICAgICAgICAgICAgICAgIGNhc2UgJ2QnOlxuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy55ICs9IDM7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoIHRoaXMueSA+IDEwMDAgKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5yZXNldCgpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgY2FzZSAndyc6XG4gICAgICAgICAgICAgICAgICAgIHRoaXMud2Fsa0xlZnRSaWdodCgpO1xuICAgICAgICAgICAgICAgICAgICB0aGlzLnNwcml0ZUEudXBkYXRlKCk7XG4gICAgICAgICAgICAgICAgICAgIHN3aXRjaCAoIHRoaXMuZGVsYXlDb3VudGVyLmdldFN0YWdlKCkgKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBjYXNlIDE6XG4gICAgICAgICAgICAgICAgICAgICAgICBjYXNlIDI6XG4gICAgICAgICAgICAgICAgICAgICAgICAvLyBjaGVjayBpZiBwbGF5ZXIgaW4gc2lnaHRcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmICggdGhpcy5jaGVja0ZvclBsYXllcihwbGF5ZXIsIDEwMCkpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLnN0YXRlID0gJ2EnO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuZGVsYXlDb3VudGVyLnJlc2V0KCk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICBjYXNlICdhJzpcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5zcHJpdGVCLnVwZGF0ZSgpO1xuICAgICAgICAgICAgICAgICAgICBzd2l0Y2ggKCB0aGlzLmRlbGF5Q291bnRlci5nZXRTdGFnZSgpICkge1xuICAgICAgICAgICAgICAgICAgICAgICAgY2FzZSAxOlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIGRvIGF0dGFja1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuYXR0YWNrKCk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5zdGF0ZSA9ICd3JztcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmRlbGF5Q291bnRlci5yZXNldCgpO1xuICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0sXG4gICAgICAgIHRjb2xjaGVjayA6IGZ1bmN0aW9uKCB0LCBrdCwgdGhpbmdzICkge1xuICAgICAgICAgICAgZm9yKHZhciBpID0gMDsgaSA8IHRoaW5ncy5sZW5ndGg7IGkrKyApIHtcbiAgICAgICAgICAgICAgICBpZiggIXRoaW5nc1tpXS5pc0RlYWQgJiYgc2ltcGxlQ29sQ2hlY2sodGhpcywgdGhpbmdzW2ldICkgKSB7XG4gICAgICAgICAgICAgICAgICAgIGlmICgga3QuaW5kZXhPZiggXCJcIiArIHRoaW5nc1tpXS50eXBlICkgPiAtMSApIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaW5nc1tpXS5pc0RlYWQgPSB0cnVlO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIGlmKCB0LmluZGV4T2YoIFwiXCIgKyB0aGluZ3NbaV0udHlwZSApID4gLTEgKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgfSxcbiAgICAgICAgdXBkYXRlSWNlR3V5OiBmdW5jdGlvbiggbW9uc3RlcmJsb2NrZXJzLCBwbGF5ZXIsIHRoaW5ncywgaWNlYmFzZXMgKSB7XG4gICAgICAgICAgICB0aGlzLndhbGtMZWZ0UmlnaHQoKTtcbiAgICAgICAgICAgIHRoaXMuc3ByaXRlQS51cGRhdGUoKTtcbiAgICAgICAgICAgIHRoaXMuc3ByaXRlQi51cGRhdGUoKTtcblxuICAgICAgICAgICAgaWYoIHRoaXMudGNvbGNoZWNrKCBbXCI1XCJdLCBbIFwiMlwiLCBcIjNcIiwgXCI1XCIsIFwiNlwiLCBcIjdcIiBdLCB0aGluZ3MpICkge1xuICAgICAgICAgICAgICAgIHRoaXMuc3RhdGUgPSAnZCc7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHN3aXRjaCggdGhpcy5zdGF0ZSApIHtcbiAgICAgICAgICAgICAgICBjYXNlICdkJzpcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMueSArPSAzO1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKCB0aGlzLnkgPiAxMDAwICkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMucmVzZXQoKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgIC8vIGp1c3Qgd2Fsa2luZ1xuICAgICAgICAgICAgICAgIGNhc2UgJ3cnOlxuICAgICAgICAgICAgICAgICAgICAgICAgdmFyIGRvaHVycnkgPSBmYWxzZTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmICggc2ltcGxlQ29sQ2hlY2sodGhpcywgaWNlYmFzZXNbMTJdICkgKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKCBpY2ViYXNlc1sxMl0uaXNFbXB0eSApIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZG9odXJyeSA9IHRydWU7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgZm9yKHZhciBqID0gMDsgaiA8IHRoaW5ncy5sZW5ndGg7IGorKyApIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoICF0aGluZ3Nbal0uaXNEZWFkICYmIHRoaW5nc1tqXS50eXBlID09PSA0ICkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoIHNpbXBsZUNvbENoZWNrKHRoaXMsIHRoaW5nc1tqXSApICkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZG9odXJyeSA9IHRydWU7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChkb2h1cnJ5KSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5zdGF0ZSA9ICdoYic7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5zcGVlZCA9IDQ7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5nb2luZ0xlZnQgPSAhdGhpcy5nb2luZ0xlZnQ7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5sYXN0SGl0ID0gbnVsbDtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLnRhcmdldGJhc2UgPSAxMjtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpY2ViYXNlc1sxMl0uaXNFbXB0eSA9IGZhbHNlO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmICggdGhpcy54IDwgMTUwIHx8IHRoaXMueCA+IDg0MCApIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5zdGF0ZSA9ICd0JztcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgIC8vIHB1c2hpbmcgYmxvY2sgb2YgaWNlXG4gICAgICAgICAgICAgICAgY2FzZSAncGInOlxuXG4gICAgICAgICAgICAgICAgICAgIHZhciBkb25lam9iID0gZmFsc2U7XG5cbiAgICAgICAgICAgICAgICAgICAgaWYgKCB0aGlzLm15YmxvY2sgIT09IG51bGwgJiYgIXRoaXMubXlibG9jay5pc0RlYWQgKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAvL3RoaXMubXlibG9jay5wdXNoKCB0aGlzLmdvaW5nTGVmdCApO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICAgICAgZG9uZWpvYiA9IHRydWU7XG4gICAgICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgICAgICB2YXIgdCA9IFsgXCIyXCIsIFwiM1wiLCBcIjVcIiwgXCI2XCIsIFwiN1wiIF07XG4gICAgICAgICAgICAgICAgICAgIGlmICggIWRvbmVqb2IgKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBmb3IgKHZhciBqID0gMDsgaiA8IHRoaW5ncy5sZW5ndGg7IGorKyApIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoICF0aGluZ3Nbal0uaXNEZWFkIClcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYoIHRoaW5nc1tqXS50eXBlID09PSA0ICYmIHRoaXMubXlibG9jayAhPT0gdGhpbmdzW2pdICYmIHNpbXBsZUNvbENoZWNrKHRoaXMubXlibG9jaywgdGhpbmdzW2pdICkgKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBkb25lam9iID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmKCB0LmluZGV4T2YoIFwiXCIgKyB0aGluZ3Nbal0udHlwZSApID4gLTEgJiYgc2ltcGxlQ29sQ2hlY2sodGhpcy5teWJsb2NrLCB0aGluZ3Nbal0gKSApIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaW5nc1tqXS5pc0RlYWQgPSB0cnVlO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKCB0aGluZ3Nbal0udHlwZSA9PT0gNSApIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLm15YmxvY2suaXNEZWFkID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoIHRoaXMubXlibG9jay5mbGFnZ2VkICkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpY2ViYXNlc1sxMl0uaXNFbXB0eSA9IHRydWU7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAgICAgICAgIGZvciAodmFyIGsgPSAwOyBrIDwgaWNlYmFzZXMubGVuZ3RoOyBrKysgKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKCBzaW1wbGVDb2xDaGVjayh0aGlzLCBpY2ViYXNlc1trXSApICYmIGsgPT09IHRoaXMudGFyZ2V0YmFzZSApIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5teWJsb2NrLmZsYWdnZWQgPSB0cnVlO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBkb25lam9iID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgaWYgKCBkb25lam9iICkge1xuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5zdGF0ZSA9ICdkaic7XG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLnNwZWVkID0gNDtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMudGFyZ2V0YmFzZSA9IG51bGw7XG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmdvaW5nTGVmdCA9ICF0aGlzLmdvaW5nTGVmdDtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMubGFzdEhpdCA9IG51bGw7XG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLm15YmxvY2sgPSBudWxsO1xuICAgICAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0sXG4gICAgICAgIHVwZGF0ZUVhcnRoR3V5OiBmdW5jdGlvbiggbW9uc3RlcmJsb2NrZXJzLCBwbGF5ZXIsIHRoaW5ncyApIHtcbiAgICAgICAgICAgIHRoaXMud2Fsa0xlZnRSaWdodCgpO1xuICAgICAgICAgICAgc3dpdGNoKCB0aGlzLnN0YXRlICkge1xuICAgICAgICAgICAgICAgIGNhc2UgJ3cnOlxuICAgICAgICAgICAgICAgICAgICB0aGlzLnNwcml0ZUEudXBkYXRlKCk7XG4gICAgICAgICAgICAgICAgICAgIGlmKCB0aGlzLmRlbGF5Q291bnRlci5nZXRTdGFnZSgpID4gMiApIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuc3RhdGUgPSAndXAnO1xuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5oZWlnaHQgPSAyNjtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMueSAtPSAxOTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuc3ByaXRlQi5yZXNldCgpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgIGNhc2UgJ3VwJzpcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5zcHJpdGVCLnVwZGF0ZSgpO1xuICAgICAgICAgICAgICAgICAgICBpZiAoIHRoaXMuc3ByaXRlQi5nZXRGcmFtZSgpID4gMCAmJiB0aGlzLnNwcml0ZUIuZ2V0RnJhbWUoKSA8IDE2ICkge1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKCB0aGlzLmNoZWNrRm9yUGxheWVyKHBsYXllciwgODApKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5zdGF0ZSA9ICdhJztcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmRlbGF5Q291bnRlci5yZXNldCgpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIGlmICggdGhpcy5zcHJpdGVCLmdldEZyYW1lKCkgPiAxNSApIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuc3RhdGUgPSAndyc7XG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLnkgKz0gMTk7XG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmhlaWdodCA9IDY7XG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmRlbGF5Q291bnRlci5yZXNldCgpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgIGNhc2UgJ2EnOlxuICAgICAgICAgICAgICAgICAgICBpZiggdGhpcy5kZWxheUNvdW50ZXIuZ2V0U3RhZ2UoKSA9PT0gMSApIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHNwYXduQVRoaW5nKCAodGhpcy5nb2luZ0xlZnQgPyB0aGlzLnggLSA1IDogdGhpcy54ICsgdGhpcy53aWR0aCAtIDUpLCB0aGlzLnkgKyB0aGlzLmhlaWdodCwgMywgdGhpcy5nb2luZ0xlZnQsIHRydWUsIHRydWUsIGZhbHNlICk7XG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLnN0YXRlID0gJ3VwJztcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuZGVsYXlDb3VudGVyLnJlc2V0KCk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0sXG4gICAgICAgIHdhbGtMZWZ0UmlnaHQ6IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgaWYgKCAhdGhpcy5pc0RlYWQgKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5ub3cgPSBnZXRUaW1lU3RhbXAoKTtcbiAgICAgICAgICAgICAgICBpZiAoIHRoaXMubm93IC0gdGhpcy5sYXN0TW92ZSA+IDEwICkge1xuICAgICAgICAgICAgICAgICAgICBpZiAoIHRoaXMuZ29pbmdMZWZ0ICkge1xuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy54IC09IHRoaXMuc3BlZWQ7XG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLnggKz0gdGhpcy5zcGVlZDtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB0aGlzLmxhc3RNb3ZlID0gdGhpcy5ub3c7XG5cbiAgICAgICAgICAgICAgICAgICAgaWYgKCB0aGlzLnR5cGUgPT09IDIgJiYgdGhpcy5zdGF0ZSA9PT0gJ3BiJyAmJiB0aGlzLm15YmxvY2sgIT09IG51bGwgJiYgIXRoaXMubXlibG9jay5pc0RlYWQpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMubXlibG9jay5wdXNoKCB0aGlzLmdvaW5nTGVmdCApO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9LFxuICAgICAgICByZXNldDogZnVuY3Rpb24oY3R4KSB7XG4gICAgICAgICAgICB0aGlzLnN0YXRlID0gJ3cnO1xuICAgICAgICAgICAgdGhpcy5pc0RlYWQgPSBmYWxzZTtcbiAgICAgICAgICAgIHRoaXMubXlibG9jayA9IG51bGw7XG4gICAgICAgICAgICB0aGlzLnRhcmdldGJhc2UgPSBudWxsO1xuICAgICAgICAgICAgc3dpdGNoKCB0aGlzLnR5cGUgKSB7XG4gICAgICAgICAgICAgICAgY2FzZSAzOlxuICAgICAgICAgICAgICAgICAgICB0aGlzLnggPSAyMDA7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMueSA9IDM2NztcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5ob3BDb3VudGVyID0gMDtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5ob3BIZWlnaHQgPSAwO1xuICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICBjYXNlIDI6XG4gICAgICAgICAgICAgICAgICAgIHRoaXMueCA9IC01MDtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy55ID0gNzA1O1xuICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICBjYXNlIDE6XG4gICAgICAgICAgICAgICAgICAgIHRoaXMueSA9IDU3NTtcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgY2FzZSAwOlxuICAgICAgICAgICAgICAgICAgICB0aGlzLnkgPSAyNTE7XG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgfVxuICAgICAgICB9LFxuICAgICAgICByZW5kZXI6IGZ1bmN0aW9uKGN0eCl7XG4gICAgICAgICAgICBzd2l0Y2goIHRoaXMudHlwZSApIHtcbiAgICAgICAgICAgICAgICBjYXNlIDA6XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuZHJhd0ZpcmVHdXkoY3R4KTtcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgY2FzZSAxOlxuICAgICAgICAgICAgICAgICAgICB0aGlzLmRyYXdFYXJ0aEd1eShjdHgpO1xuICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICBjYXNlIDI6XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuZHJhd0ljZUd1eShjdHgpO1xuICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICBjYXNlIDM6XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuZHJhd0R1Y2soY3R4KTtcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0sXG4gICAgICAgIGRyYXdEdWNrOiBmdW5jdGlvbihjdHgpIHtcbiAgICAgICAgICAgIHRoaXMuc3ByaXRlQS5yZW5kZXIoY3R4LCB0aGlzLngsIHRoaXMueSwgIXRoaXMuZ29pbmdMZWZ0ICk7XG4gICAgICAgIH0sXG4gICAgICAgIGRyYXdGaXJlR3V5OiBmdW5jdGlvbihjdHgpIHtcbiAgICAgICAgICAgIHN3aXRjaCggdGhpcy5zdGF0ZSApIHtcbiAgICAgICAgICAgICAgICBjYXNlICdkJzpcbiAgICAgICAgICAgICAgICBjYXNlICd3JzpcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5zcHJpdGVBLnJlbmRlcihjdHgsIHRoaXMueCwgdGhpcy55LCAhdGhpcy5nb2luZ0xlZnQgKTtcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgY2FzZSAnYSc6XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuc3ByaXRlQi5yZW5kZXIoY3R4LCB0aGlzLngsIHRoaXMueSwgIXRoaXMuZ29pbmdMZWZ0ICk7XG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgfVxuICAgICAgICB9LFxuICAgICAgICBkcmF3SWNlR3V5OiBmdW5jdGlvbihjdHgpIHtcbiAgICAgICAgICAgIHN3aXRjaCggdGhpcy5zdGF0ZSApIHtcbiAgICAgICAgICAgICAgICBjYXNlICd0JzpcbiAgICAgICAgICAgICAgICBjYXNlICd3JzpcbiAgICAgICAgICAgICAgICBjYXNlICdkJzpcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5zcHJpdGVBLnJlbmRlcihjdHgsIHRoaXMueCwgdGhpcy55LCAhdGhpcy5nb2luZ0xlZnQgKTtcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgY2FzZSAnaGInOlxuICAgICAgICAgICAgICAgIGNhc2UgJ3BiJzpcbiAgICAgICAgICAgICAgICBjYXNlICdkaic6XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuc3ByaXRlQi5yZW5kZXIoY3R4LCB0aGlzLngsIHRoaXMueSwgIXRoaXMuZ29pbmdMZWZ0ICk7XG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgIH0sXG4gICAgICAgIGRyYXdFYXJ0aEd1eTogZnVuY3Rpb24oY3R4KSB7XG4gICAgICAgICAgICAvL2N0eC5maWxsU3R5bGUgPSAneWVsbG93JztcbiAgICAgICAgICAgIC8vY3R4LmZpbGxSZWN0KHRoaXMueCwgdGhpcy55LCB0aGlzLndpZHRoLCB0aGlzLmhlaWdodCk7XG5cbiAgICAgICAgICAgIHN3aXRjaCggdGhpcy5zdGF0ZSApIHtcbiAgICAgICAgICAgICAgICBjYXNlICd3JzpcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuc3ByaXRlQS5yZW5kZXIoY3R4LCB0aGlzLngsIHRoaXMueSwgIXRoaXMuZ29pbmdMZWZ0ICk7XG4gICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICBjYXNlICd1cCc6XG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLnNwcml0ZUIucmVuZGVyKGN0eCwgdGhpcy54LCB0aGlzLnksICF0aGlzLmdvaW5nTGVmdCApO1xuICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgY2FzZSAnYSc6XG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLnNwcml0ZUMucmVuZGVyKGN0eCwgdGhpcy54LCB0aGlzLnksICF0aGlzLmdvaW5nTGVmdCApO1xuICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG5cbiAgICAgICAgICAgIH1cbiAgICAgICAgfSxcbiAgICAgICAgY2hlY2tGb3JQbGF5ZXI6IGZ1bmN0aW9uKHBsYXllciwgZGlzdGFuY2UpIHtcbiAgICAgICAgICAgIGlmICggIXRoaXMuZ29pbmdMZWZ0ICkge1xuICAgICAgICAgICAgICAgIGlmICggc2ltcGxlQ29sQ2hlY2soIHBsYXllciwgeyB4OiB0aGlzLngsIHk6ICh0aGlzLnkgKyB0aGlzLmhlaWdodCAvIDIpLCB3aWR0aDogZGlzdGFuY2UsIGhlaWdodDogMiB9ICkgKSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgaWYgKCBzaW1wbGVDb2xDaGVjayggcGxheWVyLCB7IHg6IHRoaXMueCAtIGRpc3RhbmNlLCB5OiAodGhpcy55ICsgdGhpcy5oZWlnaHQgLyAyKSwgd2lkdGg6IGRpc3RhbmNlLCBoZWlnaHQ6IDIgfSApICkge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgIH0sXG4gICAgICAgIGF0dGFjazogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICBzd2l0Y2goIHRoaXMudHlwZSApIHtcbiAgICAgICAgICAgICAgICBjYXNlIDA6XG4gICAgICAgICAgICAgICAgICAgIC8vIHRocmVlIGZpcmViYWxsc1xuICAgICAgICAgICAgICAgICAgICAvLyBmb3J3YXJkXG4gICAgICAgICAgICAgICAgICAgIHNwYXduQVRoaW5nKCAodGhpcy5nb2luZ0xlZnQgPyB0aGlzLnggLSB0aGlzLndpZHRoIC0gNSA6IHRoaXMueCArIHRoaXMud2lkdGggKyA1KSwgdGhpcy55ICsgdGhpcy5oZWlnaHQsIDIsIHRoaXMuZ29pbmdMZWZ0LCB0cnVlLCB0cnVlLCBmYWxzZSApO1xuICAgICAgICAgICAgICAgICAgICAvLyBkaWFnIHVwXG4gICAgICAgICAgICAgICAgICAgIHNwYXduQVRoaW5nKCAodGhpcy5nb2luZ0xlZnQgPyB0aGlzLnggLSB0aGlzLndpZHRoIC0gNSA6IHRoaXMueCArIHRoaXMud2lkdGggKyA1KSwgdGhpcy55ICsgdGhpcy5oZWlnaHQsIDIsIHRoaXMuZ29pbmdMZWZ0LCB0cnVlLCB0cnVlLCB0cnVlICk7XG4gICAgICAgICAgICAgICAgICAgIC8vIGRpYWcgZG93blxuICAgICAgICAgICAgICAgICAgICBzcGF3bkFUaGluZyggKHRoaXMuZ29pbmdMZWZ0ID8gdGhpcy54IC0gdGhpcy53aWR0aCAtIDUgOiB0aGlzLnggKyB0aGlzLndpZHRoICsgNSksIHRoaXMueSArIHRoaXMuaGVpZ2h0LCAyLCB0aGlzLmdvaW5nTGVmdCwgZmFsc2UsIHRydWUsIHRydWUgKTtcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgY2FzZSAzOlxuICAgICAgICAgICAgICAgICAgICBzcGF3bkFUaGluZyggdGhpcy5nb2luZ0xlZnQgPyB0aGlzLnggLSB0aGlzLndpZHRoIC0gMTAgOiB0aGlzLnggKyB0aGlzLndpZHRoICsgMTAsIHRoaXMueSArIHRoaXMuaGVpZ2h0LCAxLCB0aGlzLmdvaW5nTGVmdCwgZmFsc2UsIHRydWUsIGZhbHNlICk7XG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfTtcblxuICAgIHZhciBUaGluZ2VlID0gZnVuY3Rpb24oZHgsZHksZHR5cGUsYSxiLGMsZCkge1xuXG4gICAgICAgIHRoaXMud2lkdGggPSAzMjtcbiAgICAgICAgdGhpcy5oZWlnaHQgPSA2NDtcbiAgICAgICAgdGhpcy54ID0gZHg7XG4gICAgICAgIHRoaXMueSA9IGR5O1xuICAgICAgICB0aGlzLnR5cGUgPSBkdHlwZTtcbiAgICAgICAgdGhpcy5saWZlc3BhbiA9IDEwMDA7XG4gICAgICAgIHRoaXMuZ29pbmdMZWZ0ID0gYSB8fCBmYWxzZTtcbiAgICAgICAgdGhpcy5nb2luZ1VwID0gYiB8fCBmYWxzZTtcbiAgICAgICAgdGhpcy5tb3ZlSG9yaXogPSBjIHx8IGZhbHNlO1xuICAgICAgICB0aGlzLm1vdmVWZXJ0ID0gZCB8fCBmYWxzZTtcbiAgICAgICAgdGhpcy5zcGF3blRpbWUgPSBnZXRUaW1lU3RhbXAoKTtcbiAgICAgICAgdGhpcy5pc0RlYWQgPSBmYWxzZTtcbiAgICAgICAgdGhpcy52ZWxYID0gMDtcbiAgICAgICAgdGhpcy52ZWxZID0gMDtcbiAgICAgICAgdGhpcy5zcGVlZCA9IDE7XG4gICAgICAgIHRoaXMuZnJpY3Rpb24gPSAwLjk7XG4gICAgICAgIHRoaXMuc3ByaXRlID0gbnVsbDtcbiAgICAgICAgdGhpcy5mbHVjdHVhdG9yWCA9IDA7XG4gICAgICAgIHRoaXMuZmx1Y3R1YXRvclkgPSA1O1xuICAgICAgICB0aGlzLmRYID0gLTE7XG4gICAgICAgIHRoaXMuZFkgPSAtMTtcbiAgICAgICAgdGhpcy5pc1Bhc3N0aHJvdWdoID0ge307XG4gICAgICAgIHRoaXMuZmxhZ2dlZCA9IGZhbHNlO1xuXG4gICAgICAgIHN3aXRjaCAoIHRoaXMudHlwZSApIHtcbiAgICAgICAgICAgIC8vIHdoaXJsd2luZFxuICAgICAgICAgICAgY2FzZSAxOlxuICAgICAgICAgICAgICAgIHRoaXMubGlmZXNwYW4gPSAzNTAwO1xuICAgICAgICAgICAgICAgIHRoaXMueSA9IHRoaXMueSAtIHRoaXMuaGVpZ2h0IC0gMTtcbiAgICAgICAgICAgICAgICB0aGlzLnNwZWVkID0gMztcbiAgICAgICAgICAgICAgICB0aGlzLnNwcml0ZSA9IG5ldyBTcHJpdGUoIDE2LCAzMixcbiAgICAgICAgICAgICAgICAgICAgWyB7IHNzeDogMCwgc3N5OiA0MCwgZHVyYXRpb246IDEwMCB9LFxuICAgICAgICAgICAgICAgICAgICAgIHsgc3N4OiAxNSwgc3N5OiA0MCwgZHVyYXRpb246IDEwMCB9ICBdKTtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIC8vIGZpcmViYWxsXG4gICAgICAgICAgICBjYXNlIDU6XG4gICAgICAgICAgICBjYXNlIDI6XG4gICAgICAgICAgICAgICAgdGhpcy5saWZlc3BhbiA9IDM1MDA7XG4gICAgICAgICAgICAgICAgdGhpcy5zcGVlZCA9IDQ7XG4gICAgICAgICAgICAgICAgdGhpcy5zcHJpdGUgPSBuZXcgU3ByaXRlKCA3LCA3LCBbIHsgc3N4OiA4MSwgc3N5OiAzNCB9IF0pO1xuICAgICAgICAgICAgICAgIHRoaXMueSA9IHRoaXMueSAtIDE4O1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgLy8gcm9ja1xuICAgICAgICAgICAgY2FzZSAzOlxuICAgICAgICAgICAgICAgIHRoaXMuc3BlZWQgPSAyO1xuICAgICAgICAgICAgY2FzZSA2OlxuICAgICAgICAgICAgICAgIHRoaXMubGlmZXNwYW4gPSAyMDAwO1xuICAgICAgICAgICAgICAgIHRoaXMuc3BlZWQgPSA0O1xuICAgICAgICAgICAgICAgIHRoaXMuc3ByaXRlID0gbmV3IFNwcml0ZSggOCwgNywgWyB7IHNzeDogODgsIHNzeTogMzQgfSBdKTtcbiAgICAgICAgICAgICAgICB0aGlzLnkgPSB0aGlzLnkgLSAxODtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIC8vIGVuZW15IGljZWJsb2NrXG4gICAgICAgICAgICBjYXNlIDQ6XG4gICAgICAgICAgICAgICAgdGhpcy5saWZlc3BhbiA9IDA7XG4gICAgICAgICAgICAgICAgdGhpcy5zcGVlZCA9IDE7XG4gICAgICAgICAgICAgICAgdGhpcy5zcHJpdGUgPSBuZXcgU3ByaXRlKCAxMiwgMjksIFsgeyBzc3g6IDEwNiwgc3N5OiAwIH0gXSk7XG4gICAgICAgICAgICAgICAgdGhpcy55ID0gdGhpcy55IC0gMzA7XG4gICAgICAgICAgICAgICAgdGhpcy53aWR0aCA9IDI0O1xuICAgICAgICAgICAgICAgIHRoaXMuaXNQYXNzdGhyb3VnaCA9IHtcbiAgICAgICAgICAgICAgICAgICAgYm90dG9tOiBmYWxzZSxcbiAgICAgICAgICAgICAgICAgICAgbGVmdDogZmFsc2UsXG4gICAgICAgICAgICAgICAgICAgIHJpZ2h0OiBmYWxzZVxuICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAvLyBzbm93YmFsbFxuICAgICAgICAgICAgY2FzZSA3OlxuICAgICAgICAgICAgICAgIHRoaXMubGlmZXNwYW4gPSAzNTAwO1xuICAgICAgICAgICAgICAgIHRoaXMuc3BlZWQgPSA1O1xuICAgICAgICAgICAgICAgIHRoaXMuc3ByaXRlID0gbmV3IFNwcml0ZSggNywgNywgWyB7IHNzeDogODMsIHNzeTogNTMgfSBdKTtcbiAgICAgICAgICAgICAgICB0aGlzLnkgPSB0aGlzLnkgLSAxODtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgfVxuICAgIH07XG5cbiAgICBUaGluZ2VlLnByb3RvdHlwZSA9IHtcbiAgICAgICAgdXBkYXRlOiBmdW5jdGlvbiggcGxheWVyICkge1xuICAgICAgICAgICAgLy8gMCBsaWZlc3BhbiA9IGRvZXNuJ3QgZXhwaXJlXG4gICAgICAgICAgICBpZiAoIHRoaXMubGlmZXNwYW4gPiAwICkge1xuICAgICAgICAgICAgICAgIHZhciBub3cgPSBnZXRUaW1lU3RhbXAoKTtcbiAgICAgICAgICAgICAgICBpZiAoIG5vdyAtIHRoaXMuc3Bhd25UaW1lID4gdGhpcy5saWZlc3BhbiApIHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5pc0RlYWQgPSB0cnVlO1xuICAgICAgICAgICAgICAgICAgICBpZiAoIHRoaXMuZmxhZ2dlZCApIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuZmxhZ2dlZCA9IGZhbHNlO1xuICAgICAgICAgICAgICAgICAgICAgICAgaWNlYmFzZXNbMTJdLmlzRW1wdHkgPSB0cnVlO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKCB0aGlzLm1vdmVIb3JpeiApIHtcbiAgICAgICAgICAgICAgICBpZiAoIHRoaXMuZ29pbmdMZWZ0ICkge1xuICAgICAgICAgICAgICAgICAgICBpZiAodGhpcy52ZWxYID4gLXRoaXMuc3BlZWQpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMudmVsWC0tO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKHRoaXMudmVsWCA8IHRoaXMuc3BlZWQpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMudmVsWCsrO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKCB0aGlzLm1vdmVWZXJ0ICkge1xuICAgICAgICAgICAgICAgIGlmICggdGhpcy5nb2luZ1VwICkge1xuICAgICAgICAgICAgICAgICAgICBpZiAodGhpcy52ZWxZID4gLXRoaXMuc3BlZWQpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMudmVsWS0tO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKHRoaXMudmVsWSA8IHRoaXMuc3BlZWQpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMudmVsWSsrO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgdGhpcy52ZWxYICo9IHRoaXMuZnJpY3Rpb247XG4gICAgICAgICAgICB0aGlzLnZlbFkgKj0gdGhpcy5mcmljdGlvbjtcbiAgICAgICAgICAgIHRoaXMueCArPSB0aGlzLnZlbFg7XG4gICAgICAgICAgICB0aGlzLnkgKz0gdGhpcy52ZWxZO1xuICAgICAgICAgICAgdGhpcy5zcHJpdGUudXBkYXRlKCk7XG4gICAgICAgICAgICBpZiAoICF0aGlzLmlzRGVhZCApIHtcbiAgICAgICAgICAgICAgICBzd2l0Y2ggKCB0aGlzLnR5cGUgKSB7XG4gICAgICAgICAgICAgICAgICAgIC8vIHdoaXJsd2luZCBncmFicyBwbGF5ZXJcbiAgICAgICAgICAgICAgICAgICAgY2FzZSAxOlxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKCBzaW1wbGVDb2xDaGVjayggcGxheWVyLCB0aGlzICkgKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcGxheWVyLmdyYWJiZWQgPSB0cnVlO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHBsYXllci54ID0gdGhpcy54ICsgdGhpcy5mbHVjdHVhdG9yWDtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBwbGF5ZXIueSA9IHRoaXMueSAtIDE1ICsgdGhpcy5mbHVjdHVhdG9yWTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBwbGF5ZXIuanVtcGluZyA9IHRydWU7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmZsdWN0dWF0b3JYICs9IHRoaXMuZFg7XG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmZsdWN0dWF0b3JZICs9IHRoaXMuZFk7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgIGlmICggdGhpcy5mbHVjdHVhdG9yWCA8IC04IHx8IHRoaXMuZmx1Y3R1YXRvclggPiA4KSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5kWCAqPSAtMTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIGlmICggdGhpcy5mbHVjdHVhdG9yWSA8IC0yMCB8fCB0aGlzLmZsdWN0dWF0b3JZID4gNSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuZFkgKj0gLTE7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICAgICAgLy8gZmlyZWJhbGxcbiAgICAgICAgICAgICAgICAgICAgY2FzZSAyOlxuICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgICAgIC8vIHJvY2tcbiAgICAgICAgICAgICAgICAgICAgY2FzZSAzOlxuICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgICAgIGNhc2UgNDpcbiAgICAgICAgICAgICAgICAgICAgY2FzZSA1OlxuICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgLy8ga2lsbCBpdCBpZiByZWFjaGVzIGVkZ2Ugb2Ygc2NyZWVuLCBleGNlcHQgZm9yIGljZWJsb2Nrc1xuICAgICAgICAgICAgICAgIGlmICggdGhpcy50eXBlICE9PSA0ICYmICh0aGlzLnggPCAtNSB8fCB0aGlzLnggPiAxMDI4IHx8IHRoaXMueSA8IC01IHx8IHRoaXMueSA+IDgwMCApKSB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuaXNEZWFkID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH0sXG4gICAgICAgIHJlbmRlcjogZnVuY3Rpb24oY3R4KXtcbiAgICAgICAgICAgIC8vY3R4LmZpbGxTdHlsZSA9ICd5ZWxsb3cnO1xuICAgICAgICAgICAgLy9jdHguZmlsbFJlY3QodGhpcy54LCB0aGlzLnksIHRoaXMud2lkdGgsIHRoaXMuaGVpZ2h0KTtcbiAgICAgICAgICAgIHRoaXMuc3ByaXRlLnJlbmRlcihjdHgsIHRoaXMueCwgdGhpcy55LCB0aGlzLmdvaW5nTGVmdCApO1xuICAgICAgICB9LFxuICAgICAgICBwdXNoOiBmdW5jdGlvbiggbGVmdCApIHtcbiAgICAgICAgICAgIGlmICggbGVmdCApIHtcbiAgICAgICAgICAgICAgICB0aGlzLnggLT0gdGhpcy5zcGVlZDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICB0aGlzLnggKz0gdGhpcy5zcGVlZDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH07XG5cbiAgICB2YXIgc3Bhd25BVGhpbmcgPSBmdW5jdGlvbiggc3gsIHN5LCBzdHlwZSwgc2dvaW5nbGVmdCwgc2dvaW5ndXAsIG1vdmVoLCBtb3ZldiApIHtcbiAgICAgICAgdmFyIHRoaW5nID0gbmV3IFRoaW5nZWUoc3gsIHN5LCBzdHlwZSwgc2dvaW5nbGVmdCwgc2dvaW5ndXAsIG1vdmVoLCBtb3ZldiApO1xuICAgICAgICB0aGVHYW1lLnRoaW5ncyA9IHRoZUdhbWUudGhpbmdzLmNvbmNhdCggdGhpbmcgKTtcbiAgICAgICAgcmV0dXJuIHRoaW5nO1xuICAgIH07XG5cbiAgICAvLyBQTEFZRVJcblxuICAgIHZhciBQbGF5ZXIgPSBmdW5jdGlvbihnYW1lLCBnYW1lU2l6ZSkge1xuICAgICAgICB0aGlzLmdhbWUgPSBnYW1lO1xuICAgICAgICB0aGlzLmhlaWdodCA9IDU0O1xuICAgICAgICB0aGlzLndpZHRoID0gMzA7XG4gICAgICAgIHRoaXMueCA9IGdhbWVTaXplLndpZHRoIC8gMjtcbiAgICAgICAgdGhpcy55ID0gZ2FtZVNpemUuaGVpZ2h0IC0gNTA7XG5cbiAgICAgICAgdGhpcy5rZXlib2FyZGVyID0gbmV3IEtleWJvYXJkZXIoKTtcblxuICAgICAgICB0aGlzLnNwZWVkID0gMztcbiAgICAgICAgdGhpcy52ZWxYID0gMDtcbiAgICAgICAgdGhpcy52ZWxZID0gMDtcbiAgICAgICAgdGhpcy5mcmljdGlvbiA9IDAuOTtcbiAgICAgICAgdGhpcy5qdW1waW5nID0gZmFsc2U7XG4gICAgICAgIHRoaXMuZ3JvdW5kZWQgPSB0cnVlO1xuICAgICAgICB0aGlzLmZhbGxpbmcgPSBmYWxzZTtcbiAgICAgICAgdGhpcy5ncmF2aXR5ID0gMC4zO1xuXG4gICAgICAgIHRoaXMuZ3JhYmJlZCA9IGZhbHNlO1xuXG4gICAgICAgIHRoaXMuZ29pbmdMZWZ0ID0gZmFsc2U7XG4gICAgICAgIHRoaXMuc3ByaXRlU3RvcHBlZCA9IG5ldyBTcHJpdGUoIDE1LCAyNyxcbiAgICAgICAgICAgICAgICAgICAgWyB7IHNzeDogNjAsIHNzeTogNzIgfSBdKTtcbiAgICAgICAgdGhpcy5zcHJpdGVXYWxraW5nID0gbmV3IFNwcml0ZSggMTUsIDI3LFxuICAgICAgICAgICAgICAgICAgICBbIHsgc3N4OiA2MCwgc3N5OiA3MiwgZHVyYXRpb246IDEwMCB9LFxuICAgICAgICAgICAgICAgICAgICAgIHsgc3N4OiAxMjksIHNzeTogNzIsIGR1cmF0aW9uOiAxMDAgfVxuICAgICAgICAgICAgICAgICAgICAgXSk7XG4gICAgICAgIC8qIHRoaXMuc3ByaXRlU2hvb3RpbmcgPSBuZXcgU3ByaXRlKCAxNywgMjcsXG4gICAgICAgICAgICAgICAgICAgIFsgeyBzc3g6IDE0Niwgc3N5OiA3MiwgZHVyYXRpb246IDUwIH0gXSk7ICovXG4gICAgICAgIHRoaXMuc3ByaXRlRHlpbmcgPSBuZXcgU3ByaXRlKCAyNCwgMjcsXG4gICAgICAgICAgICAgICAgICAgIFsgeyBzc3g6IDExOCwgc3N5OiAwIH0gXSk7XG4gICAgICAgIHRoaXMuc3ByaXRlSnVtcGluZyA9IG5ldyBTcHJpdGUoIDIwLCAyOSxcbiAgICAgICAgICAgICAgICAgICAgWyB7IHNzeDogMTQyLCBzc3k6IDAsIGR1cmF0aW9uOiA1MCB9IF0pO1xuICAgICAgICB0aGlzLnN0YXRlID0gJ3cnO1xuICAgIH07XG5cbiAgICBQbGF5ZXIucHJvdG90eXBlID0ge1xuICAgICAgICB1cGRhdGU6IGZ1bmN0aW9uKGdhbWVTaXplLCBib3hlcywgaGVhcnRzLCB0aGluZ3MpIHtcblxuICAgICAgICAgICAgc3dpdGNoKCB0aGlzLnN0YXRlICkge1xuICAgICAgICAgICAgICAgIGNhc2UgJ3cnOlxuICAgICAgICAgICAgICAgIGlmICh0aGlzLmdyYWJiZWQgJiYgKHRoaXMua2V5Ym9hcmRlci5pc0Rvd24odGhpcy5rZXlib2FyZGVyLktFWVMuTEVGVCkgfHwgdGhpcy5rZXlib2FyZGVyLmlzRG93bih0aGlzLmtleWJvYXJkZXIuS0VZUy5SSUdIVCkpICYmICh0aGlzLmtleWJvYXJkZXIuaXNEb3duKHRoaXMua2V5Ym9hcmRlci5LRVlTLlVQKSB8fCB0aGlzLmtleWJvYXJkZXIuaXNEb3duKHRoaXMua2V5Ym9hcmRlci5LRVlTLlNQQUNFKSB8fCB0aGlzLmtleWJvYXJkZXIuaXNEb3duKHRoaXMua2V5Ym9hcmRlci5LRVlTLlopKSkge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLmdyYWJiZWQgPSBmYWxzZTtcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAvLyBsZWZ0XG4gICAgICAgICAgICAgICAgICAgIGlmICh0aGlzLmtleWJvYXJkZXIuaXNEb3duKHRoaXMua2V5Ym9hcmRlci5LRVlTLkxFRlQpKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAodGhpcy52ZWxYID4gLXRoaXMuc3BlZWQpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLnZlbFgtLTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuZ29pbmdMZWZ0ID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgICAgIC8vIHJpZ2h0XG4gICAgICAgICAgICAgICAgICAgIGlmICh0aGlzLmtleWJvYXJkZXIuaXNEb3duKHRoaXMua2V5Ym9hcmRlci5LRVlTLlJJR0hUKSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHRoaXMudmVsWCA8IHRoaXMuc3BlZWQpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLnZlbFgrKztcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuZ29pbmdMZWZ0ID0gZmFsc2U7XG4gICAgICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgICAgICBpZiAodGhpcy5rZXlib2FyZGVyLmlzRG93bih0aGlzLmtleWJvYXJkZXIuS0VZUy5VUCkgfHwgdGhpcy5rZXlib2FyZGVyLmlzRG93bih0aGlzLmtleWJvYXJkZXIuS0VZUy5TUEFDRSkgfHwgdGhpcy5rZXlib2FyZGVyLmlzRG93bih0aGlzLmtleWJvYXJkZXIuS0VZUy5aKSApIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIGp1bXAgdXBcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmICghdGhpcy5qdW1waW5nICYmIHRoaXMuZ3JvdW5kZWQpe1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuanVtcGluZyA9IHRydWU7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5ncm91bmRlZCA9IGZhbHNlO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuZmFsbGluZyA9IGZhbHNlO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMudmVsWSA9IC10aGlzLnNwZWVkICogMjtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBhYS5wbGF5KCdqdW1wJyk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgICAgICBpZiAodGhpcy5rZXlib2FyZGVyLmlzRG93bih0aGlzLmtleWJvYXJkZXIuS0VZUy5ET1dOKSApIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIGdvIGRvd24gdGhlIHN0YWlyc1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKCF0aGlzLmp1bXBpbmcgJiYgdGhpcy5ncm91bmRlZCl7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmdyb3VuZGVkID0gZmFsc2U7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmp1bXBpbmcgPSBmYWxzZTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuZmFsbGluZyA9IHRydWU7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLnZlbFkgPSB0aGlzLnNwZWVkICogMjtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgICAgIGlmICh0aGlzLmtleWJvYXJkZXIuaXNEb3duKHRoaXMua2V5Ym9hcmRlci5LRVlTLlgpICkge1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKCBwYXVzZUJ1dHRvbkRlbGF5LmlzRG9uZSgpICkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIHN3aXRjaCBlbGVtZW50XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5nYW1lLmN1cnJlbnRFbGVtZW50Kys7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKCB0aGlzLmdhbWUuY3VycmVudEVsZW1lbnQgPiAyICkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmdhbWUuY3VycmVudEVsZW1lbnQgPSAwO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBwYXVzZUJ1dHRvbkRlbGF5LnJlc2V0KCk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgaWYgKHRoaXMua2V5Ym9hcmRlci5pc0Rvd24odGhpcy5rZXlib2FyZGVyLktFWVMuQykgKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAvLyBmaXJlL3VzZSBlbGVtZW50XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoIHBhdXNlQnV0dG9uRGVsYXkuaXNEb25lKCkgKSB7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmF0dGFjayA9IHRydWU7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgc3Bhd25BVGhpbmcoICh0aGlzLmdvaW5nTGVmdCA/IHRoaXMueCAtIDY6IHRoaXMueCArIHRoaXMud2lkdGggLSA2KSwgdGhpcy55ICsgNDUsIDUgKyB0aGlzLmdhbWUuY3VycmVudEVsZW1lbnQsIHRoaXMuZ29pbmdMZWZ0LCBmYWxzZSwgdHJ1ZSwgZmFsc2UgKTtcblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHBhdXNlQnV0dG9uRGVsYXkucmVzZXQoKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAvLyBtdXRlXG4gICAgICAgICAgICAgICAgaWYgKHRoaXMua2V5Ym9hcmRlci5pc0Rvd24odGhpcy5rZXlib2FyZGVyLktFWVMuTSkgKSB7XG4gICAgICAgICAgICAgICAgICAgIGlmICggbXV0ZUJ1dHRvbkRlbGF5LmlzRG9uZSgpICkge1xuICAgICAgICAgICAgICAgICAgICAgICAgYWEubXV0ZSA9ICFhYS5tdXRlO1xuICAgICAgICAgICAgICAgICAgICAgICAgbXV0ZUJ1dHRvbkRlbGF5LnJlc2V0KCk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgLypcbiAgICAgICAgICAgICAgICBpZiAodGhpcy5rZXlib2FyZGVyLmlzRG93bih0aGlzLmtleWJvYXJkZXIuS0VZUy5QKSApIHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKCBwYXVzZUJ1dHRvbkRlbGF5LmlzRG9uZSgpICkge1xuICAgICAgICAgICAgICAgICAgICAgICAgUEFVU0UgPSAhUEFVU0U7XG4gICAgICAgICAgICAgICAgICAgICAgICBwYXVzZUJ1dHRvbkRlbGF5LnJlc2V0KCk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9ICovXG5cbiAgICAgICAgICAgICAgICB0aGlzLnZlbFggKj0gdGhpcy5mcmljdGlvbjtcbiAgICAgICAgICAgICAgICB0aGlzLnZlbFkgKz0gdGhpcy5ncmF2aXR5O1xuXG4gICAgICAgICAgICAgICAgdGhpcy5ncm91bmRlZCA9IGZhbHNlO1xuICAgICAgICAgICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgYm94ZXMubGVuZ3RoOyBpKyspIHtcblxuICAgICAgICAgICAgICAgICAgICB2YXIgZGlyID0gY29sQ2hlY2sodGhpcywgYm94ZXNbaV0pO1xuXG4gICAgICAgICAgICAgICAgICAgIGlmIChkaXIgPT09ICdsJyB8fCBkaXIgPT09ICdyJykge1xuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy52ZWxYID0gMDtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuanVtcGluZyA9IGZhbHNlO1xuICAgICAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKGRpciA9PT0gJ2InKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmdyb3VuZGVkID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuanVtcGluZyA9IGZhbHNlO1xuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5mYWxsaW5nID0gZmFsc2U7XG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAoZGlyID09PSAndCcpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMudmVsWSAqPSAtMTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IHRoaW5ncy5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgICAgICAgICBpZiAoICF0aGluZ3NbaV0uaXNEZWFkICYmIHRoaW5nc1tpXS50eXBlID09PSA0ICkge1xuICAgICAgICAgICAgICAgICAgICAgICAgdmFyIGRpciA9IGNvbENoZWNrKHRoaXMsIHRoaW5nc1tpXSk7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChkaXIgPT09ICdsJyB8fCBkaXIgPT09ICdyJykge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMudmVsWCA9IDA7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5qdW1waW5nID0gZmFsc2U7XG4gICAgICAgICAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKGRpciA9PT0gJ2InKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5ncm91bmRlZCA9IHRydWU7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5qdW1waW5nID0gZmFsc2U7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5mYWxsaW5nID0gZmFsc2U7XG4gICAgICAgICAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKGRpciA9PT0gJ3QnKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy52ZWxZICo9IC0xO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICBpZiAodGhpcy5ncm91bmRlZCl7XG4gICAgICAgICAgICAgICAgICAgICB0aGlzLnZlbFkgPSAwO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIHRoaXMueCArPSB0aGlzLnZlbFg7XG4gICAgICAgICAgICAgICAgdGhpcy55ICs9IHRoaXMudmVsWTtcblxuICAgICAgICAgICAgICAgIGlmICggdGhpcy54IDwgLSAodGhpcy53aWR0aCAtIDIpICkge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLnggPSBnYW1lU2l6ZS53aWR0aCAtIDM7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGVsc2UgaWYgKCB0aGlzLnggPiBnYW1lU2l6ZS53aWR0aCAtIDIgKSB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMueCA9ICh0aGlzLndpZHRoIC0gMykgKiAtMTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgaWYoKCB0aGlzLnZlbFggPiAwLjEgfHwgdGhpcy52ZWxYIDwgLTAuMSApICYmICF0aGlzLmp1bXBpbmcgKXtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5zcHJpdGVXYWxraW5nLnVwZGF0ZSgpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGNhc2UgJ2QnOlxuICAgICAgICAgICAgICAgIHRoaXMueSArPSAzO1xuICAgICAgICAgICAgICAgIGlmICggdGhpcy55ID4gMTAwMCApIHtcbiAgICAgICAgICAgICAgICAgICAgZW5kR2FtZSgnRElFJyk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgfVxuICAgICAgICB9LFxuXG4gICAgICAgIHJlbmRlcjogZnVuY3Rpb24oY3R4KSB7XG4gICAgICAgICAgICAvL2lmICggdGhpcy5nb2luZ0xlZnQgKSB7XG4gICAgICAgICAgICBzd2l0Y2goIHRoaXMuc3RhdGUgKSB7XG4gICAgICAgICAgICAgICAgY2FzZSAndyc6XG4gICAgICAgICAgICAgICAgICAgIGlmICggdGhpcy5qdW1waW5nIHx8IHRoaXMuZmFsbGluZyApIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuc3ByaXRlSnVtcGluZy5yZW5kZXIoY3R4LCB0aGlzLngsIHRoaXMueSwgIXRoaXMuZ29pbmdMZWZ0KTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuc3ByaXRlV2Fsa2luZy5yZW5kZXIoY3R4LCB0aGlzLngsIHRoaXMueSwgIXRoaXMuZ29pbmdMZWZ0KTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICBjYXNlICdkJzpcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuc3ByaXRlRHlpbmcucmVuZGVyKGN0eCwgdGhpcy54LCB0aGlzLnksICF0aGlzLmdvaW5nTGVmdCk7XG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfTtcblxuICAgIC8vIENPREUgU1RBUlRTIEhFUkVcbiAgICB2YXIgR2FtZSA9IGZ1bmN0aW9uKCkge1xuXG4gICAgICAgIC8vIG1heWJlIHNvbWUgb3RoZXIgZGF5XG4gICAgICAgIC8vIHZhciBnYW1lcGFkU3VwcG9ydEF2YWlsYWJsZSA9ICEhbmF2aWdhdG9yLndlYmtpdEdldEdhbWVwYWRzIHx8ICEhbmF2aWdhdG9yLndlYmtpdEdhbWVwYWRzO1xuXG4gICAgICAgIHZhciBjYW52YXMgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnbWMnKTtcbiAgICAgICAgdmFyIGNvbnRleHQgPSBjYW52YXMuZ2V0Q29udGV4dCgnMmQnKTtcblxuICAgICAgICAvLyBkb24ndCB5b3UgZGFyZSBBQSBteSBwaXhlbGFydCFcbiAgICAgICAgY29udGV4dC5tb3pJbWFnZVNtb290aGluZ0VuYWJsZWQgPSBmYWxzZTtcbiAgICAgICAgY29udGV4dC53ZWJraXRJbWFnZVNtb290aGluZ0VuYWJsZWQgPSBmYWxzZTtcbiAgICAgICAgY29udGV4dC5tc0ltYWdlU21vb3RoaW5nRW5hYmxlZCA9IGZhbHNlO1xuICAgICAgICBjb250ZXh0LmltYWdlU21vb3RoaW5nRW5hYmxlZCA9IGZhbHNlO1xuXG4gICAgICAgIHZhciBnYW1lU2l6ZSA9IHsgd2lkdGg6IGNhbnZhcy53aWR0aCwgaGVpZ2h0OiBjYW52YXMuaGVpZ2h0IH07XG5cbiAgICAgICAgdGhpcy5zdGF0ZSA9ICdMT0FESU5HJztcbiAgICAgICAgdGhpcy50aXRsZXNjcmVlbkJsaW5rID0gbmV3IERlbGF5Q291bnRlcihbNTAwLDUwMF0pO1xuICAgICAgICB0aGlzLmtleWJvYXJkZXIgPSBuZXcgS2V5Ym9hcmRlcigpO1xuICAgICAgICB0aGlzLnBsYXllciA9IG5ldyBQbGF5ZXIodGhpcywgZ2FtZVNpemUpO1xuXG4gICAgICAgIHRoaXMuZW5lbWllcyA9IFtdO1xuXG4gICAgICAgIHRoaXMuZW5lbWllcyA9IHRoaXMuZW5lbWllcy5jb25jYXQobmV3IEJhZEd1eSggMjAwICsgZ2V0UmFuZG9tSW50KDAsIDIwKSwgMjUxLCAwLCAnZmcnLCAyICkpOyAvLyBmaXJlXG4gICAgICAgIHRoaXMuZW5lbWllcyA9IHRoaXMuZW5lbWllcy5jb25jYXQobmV3IEJhZEd1eSggNzAwICsgZ2V0UmFuZG9tSW50KDAsIDIwKSwgMjUxLCAwLCAnZmcnLCAyICkpOyAvLyBmaXJlXG4gICAgICAgIHRoaXMuZW5lbWllcyA9IHRoaXMuZW5lbWllcy5jb25jYXQobmV3IEJhZEd1eSggMTAwLCAzNjcsIDMsICd3ZCcsIDAgKSk7IC8vIHdpbmRcbiAgICAgICAgLy8gdGhpcy5lbmVtaWVzID0gdGhpcy5lbmVtaWVzLmNvbmNhdChuZXcgV2luZER1Y2soIDIwMCwgMzY3ICkpOyAgLy8gd2luZFxuICAgICAgICB0aGlzLmVuZW1pZXMgPSB0aGlzLmVuZW1pZXMuY29uY2F0KG5ldyBCYWRHdXkoIDIwMCArIGdldFJhbmRvbUludCgwLCAyMCksIDU3NSwgMSwgJ2VnJywgMSApKTsgLy8gZWFydGggNTE4XG4gICAgICAgIHRoaXMuZW5lbWllcyA9IHRoaXMuZW5lbWllcy5jb25jYXQobmV3IEJhZEd1eSggODAwICsgZ2V0UmFuZG9tSW50KDAsIDIwKSwgNTc1LCAxLCAnZWcnLCAxICkpOyAvLyBlYXJ0aCA1MThcbiAgICAgICAgdGhpcy5lbmVtaWVzID0gdGhpcy5lbmVtaWVzLmNvbmNhdChuZXcgQmFkR3V5KCAtNTAsIDcwNSwgMiwgJ2lnJywgMSApKTsgLy8gaWNlXG5cbiAgICAgICAgdGhpcy50aGluZ3MgPSBbXTtcblxuICAgICAgICB2YXIgbW9uc3RlcmJsb2NrZXJzID0gW107XG5cbiAgICAgICAgLy8gYmxvY2tzIDMgZWxlbWVudCBtb25zdGVycywgbm90IGljZSBtb25zdGVyXG4gICAgICAgIG1vbnN0ZXJibG9ja2VycyA9IG1vbnN0ZXJibG9ja2Vycy5jb25jYXQoIG5ldyBNb25zdGVyQmxvY2soIDEwLCAxNTAsIDEwLCA0NTAsIFsnd2QnLCAnd3cnLCAnZmcnLCAnZmInLCAnZWcnLCAncm8nXSkgKTtcbiAgICAgICAgbW9uc3RlcmJsb2NrZXJzID0gbW9uc3RlcmJsb2NrZXJzLmNvbmNhdCggbmV3IE1vbnN0ZXJCbG9jayggMTAwMCwgMTUwLCAxMCwgNDUwLCBbJ3dkJywgJ3d3JywgJ2ZnJywgJ2ZiJywgJ2VnJywgJ3JvJ10pICk7XG5cbiAgICAgICAgLy8gZmlyZSBndXlzXG4gICAgICAgIG1vbnN0ZXJibG9ja2VycyA9IG1vbnN0ZXJibG9ja2Vycy5jb25jYXQoIG5ldyBNb25zdGVyQmxvY2soIDM0NSwgMTUwLCAxMCwgMTMwLCBbJ2ZnJ10pICk7XG4gICAgICAgIG1vbnN0ZXJibG9ja2VycyA9IG1vbnN0ZXJibG9ja2Vycy5jb25jYXQoIG5ldyBNb25zdGVyQmxvY2soIDY3MiwgMTUwLCAxMCwgMTMwLCBbJ2ZnJ10pICk7XG5cbiAgICAgICAgLy8gZWFydGggZ3V5c1xuICAgICAgICBtb25zdGVyYmxvY2tlcnMgPSBtb25zdGVyYmxvY2tlcnMuY29uY2F0KCBuZXcgTW9uc3RlckJsb2NrKCA1MDAsIDQ1MCwgMTAsIDEzMCwgWydlZyddKSApO1xuICAgICAgICBtb25zdGVyYmxvY2tlcnMgPSBtb25zdGVyYmxvY2tlcnMuY29uY2F0KCBuZXcgTW9uc3RlckJsb2NrKCA1OTUsIDQ1MCwgMTAsIDEzMCwgWydlZyddKSApO1xuXG4gICAgICAgIC8vIGljZSBtb25zdGVyc1xuICAgICAgICBtb25zdGVyYmxvY2tlcnMgPSBtb25zdGVyYmxvY2tlcnMuY29uY2F0KCBuZXcgTW9uc3RlckJsb2NrKCAtODAsIDYwMCwgMTAsIDEzMCwgWydpZyddKSApO1xuICAgICAgICBtb25zdGVyYmxvY2tlcnMgPSBtb25zdGVyYmxvY2tlcnMuY29uY2F0KCBuZXcgTW9uc3RlckJsb2NrKCAxMDgwLCA2MDAsIDEwLCAxMzAsIFsnaWcnXSkgKTtcblxuICAgICAgICB0aGlzLmxhc3RQZXdQZXcgPSAwO1xuXG4gICAgICAgIGFhID0gbmV3IEFyY2FkZUF1ZGlvKCk7XG5cbiAgICAgICAgLy8gZ3JhYiBoZWFydCBzb3VuZFxuICAgICAgICBhYS5hZGQoICdwaWNrdXAnLCAyLFxuICAgICAgICAgICAgW1xuICAgICAgICAgICAgICAgIFswLCwwLjAxLDAuNDM5NCwwLjMxMDMsMC44NzY1LCwsLCwsMC4zNjE0LDAuNTI3OCwsLCwsLDEsLCwsLDAuNV1cbiAgICAgICAgICAgIF1cbiAgICAgICAgKTtcblxuICAgICAgICBhYS5hZGQoICdqdW1wJywgMSxcbiAgICAgICAgICAgIFtcbiAgICAgICAgICAgICAgICBbMCwsMC4xNjI1LCwwLjE1OSwwLjIyNDYsLCwsLCwsLDAuMDQ3MSwsLCwsMSwsLDAuMSwsMC4yOV1cbiAgICAgICAgICAgIF1cbiAgICAgICAgKTtcblxuICAgICAgICAvLyBoZWFydCBpbiBkYW5nZXIgc291bmRcbiAgICAgICAgYWEuYWRkKCAncGV3cGV3JywgMyxcbiAgICAgICAgICAgIFtcbiAgICAgICAgICAgICAgICBbMiwsMC4yNzQyLDAuMDIxNSwwLjA4NjMsMC42MDY4LDAuMiwtMC4xOTYsLCwsLCwwLjUwOTEsLTAuNTE1LCwsLDEsLCwsLDAuMjldXG4gICAgICAgICAgICBdXG4gICAgICAgICk7XG5cbiAgICAgICAgYWEuYWRkKCAnY2hlZXAnLCA0LFxuICAgICAgICAgICAgW1xuICAgICAgICAgICAgICAgIFsyLDAuMTYwMiwwLjAxLDAuNDIwMywwLjYzMDYsMC41OTUyLCwtMC4xMjksMC4wNCwwLjE5LDAuNzUsMC41NjE0LDAuMDYsLTAuNzI4NSwwLjkwNDYsLTAuNTk1LDAuOTgxNiwtMC41MTg3LDAuOTAyOCwwLjYwMjQsMC42ODEzLDAuNTIxLC0wLjAyOTIsMC41XVxuICAgICAgICAgICAgXSk7XG5cbiAgICAgICAgdGhpcy5ib2RpZXMgPSBbXTtcblxuICAgICAgICB0aGlzLmJvZGllcyA9IHRoaXMuYm9kaWVzLmNvbmNhdCh0aGlzLnBsYXllcik7XG4gICAgICAgIHRoaXMuYm9kaWVzID0gdGhpcy5ib2RpZXMuY29uY2F0KG5ldyBIZWFydFNwcmlua2xlcih0aGlzLCBnYW1lU2l6ZSkpO1xuXG4gICAgICAgIHZhciBib3hlcyA9IFtdO1xuXG4gICAgICAgIHRoaXMuZmFsbGluZ1N0dWZmID0gW107XG5cbiAgICAgICAgdmFyIGhlYXJ0U3RvcHBlcnMgPSBbXTtcbiAgICAgICAgLy8gc3RvcHMgdGhlIGhlYXJ0cyBhdCB0aGUgYm90dG9tXG4gICAgICAgIGhlYXJ0U3RvcHBlcnMgPSBoZWFydFN0b3BwZXJzLmNvbmNhdChuZXcgQm94KCAtNjAsIDc0MiwgMTA4NCwgMjAsIHt9ICkpO1xuXG4gICAgICAgIC8vIGdyb3VuZCBmbG9vclxuICAgICAgICBib3hlcyA9IGJveGVzLmNvbmNhdChuZXcgQm94KCAtMzAsIDczMCwgMTA1NCwgNDgsIHt9ICkpO1xuXG4gICAgICAgIC8vIGxldmVsIGZsb29yc1xuICAgICAgICAvLyBmaXJzdCBmbG9vclxuICAgICAgICBib3hlcyA9IGJveGVzLmNvbmNhdChuZXcgQm94KCAtMzAsIDU4MCwgIDUzMywgNCwgeyBib3R0b206IHRydWUgfSApKTsgLy8gMTUwIGhpZ2hcbiAgICAgICAgYm94ZXMgPSBib3hlcy5jb25jYXQobmV3IEJveCggNjAwLCA1ODAsICA1MDAsIDQsIHsgYm90dG9tOiB0cnVlIH0gKSk7IC8vIDE1MCBoaWdoXG5cbiAgICAgICAgLy8gc2Vjb25kIGZsb29yXG4gICAgICAgIGJveGVzID0gYm94ZXMuY29uY2F0KG5ldyBCb3goIC0zMCwgNDMwLCAxMDU0LCA0LCB7IGJvdHRvbTogdHJ1ZSB9ICkpO1xuXG4gICAgICAgIC8vIHRoaXJkIGZsb29yXG4gICAgICAgIC8vIHRocmVlIHBpZWNlcyBoZXJlXG4gICAgICAgIGJveGVzID0gYm94ZXMuY29uY2F0KG5ldyBCb3goIC0zMCwgMjgwLCAzNzIsIDQsIHsgYm90dG9tOiB0cnVlIH0gKSk7XG4gICAgICAgIGJveGVzID0gYm94ZXMuY29uY2F0KG5ldyBCb3goIDQwMiwgMjgwLCAyMjAsIDQsIHsgYm90dG9tOiB0cnVlIH0gKSk7XG4gICAgICAgIGJveGVzID0gYm94ZXMuY29uY2F0KG5ldyBCb3goIDY4MiwgMjgwLCAzODIsIDQsIHsgYm90dG9tOiB0cnVlIH0gKSk7XG5cbiAgICAgICAgLy8gaGVhcnQgc3ByaW5rbGVyIGZsb29yIC0geW91IHNoYWxsIG5vdCBwYXNzXG4gICAgICAgIGJveGVzID0gYm94ZXMuY29uY2F0KG5ldyBCb3goIDAsIDEzMCwgMTAyNCwgNCwge30gKSk7XG5cbiAgICAgICAgLy8gc3RhaXJzXG5cbiAgICAgICAgLy8gZmxvb3IgbGV2ZWxcbiAgICAgICAgLy8gbGVmdFxuICAgICAgICBib3hlcyA9IGJveGVzLmNvbmNhdChuZXcgQm94KCA2NCwgNjgwLCAzMiwgNSwgeyBsZWZ0OiB0cnVlLCByaWdodDogdHJ1ZSwgYm90dG9tOiB0cnVlIH0gKSk7XG4gICAgICAgIGJveGVzID0gYm94ZXMuY29uY2F0KG5ldyBCb3goIDMyLCA2MzAsIDMyLCA1LCB7IGxlZnQ6IHRydWUsIHJpZ2h0OiBmYWxzZSwgYm90dG9tOiB0cnVlIH0gKSk7XG4gICAgICAgIGJveGVzID0gYm94ZXMuY29uY2F0KG5ldyBCb3goIDAsIDU4NCwgMzIsIDUsIHsgYm90dG9tOiBmYWxzZSB9ICkpO1xuICAgICAgICAvLyByaWdodFxuICAgICAgICBib3hlcyA9IGJveGVzLmNvbmNhdChuZXcgQm94KCA5MjgsIDY4MCwgMzIsIDUsIHsgbGVmdDogdHJ1ZSwgcmlnaHQ6IHRydWUsIGJvdHRvbTogdHJ1ZSB9ICkpO1xuICAgICAgICBib3hlcyA9IGJveGVzLmNvbmNhdChuZXcgQm94KCA5NjAsIDYzMCwgMzIsIDUsIHsgbGVmdDogZmFsc2UsIHJpZ2h0OiB0cnVlLCBib3R0b206IHRydWUgfSApKTtcbiAgICAgICAgYm94ZXMgPSBib3hlcy5jb25jYXQobmV3IEJveCggOTkyLCA1ODQsIDMyLCA1LCB7IGJvdHRvbTogZmFsc2UgfSApKTtcblxuICAgICAgICAvLyBmaXJzdCBmbG9vclxuICAgICAgICAvLyBsZWZ0XG4gICAgICAgIGJveGVzID0gYm94ZXMuY29uY2F0KG5ldyBCb3goIDY0LCA1MzAsIDMyLCA1LCB7IGxlZnQ6IHRydWUsIHJpZ2h0OiB0cnVlLCBib3R0b206IHRydWUgfSApKTtcbiAgICAgICAgYm94ZXMgPSBib3hlcy5jb25jYXQobmV3IEJveCggMzIsIDQ4MCwgMzIsIDUsIHsgbGVmdDogdHJ1ZSwgcmlnaHQ6IGZhbHNlLCBib3R0b206IHRydWUgfSApKTtcbiAgICAgICAgYm94ZXMgPSBib3hlcy5jb25jYXQobmV3IEJveCggMCwgNDM0LCAzMiwgNSwgeyBib3R0b206IGZhbHNlIH0gKSk7XG4gICAgICAgIC8vIHJpZ2h0XG4gICAgICAgIGJveGVzID0gYm94ZXMuY29uY2F0KG5ldyBCb3goIDkyOCwgNTMwLCAzMiwgNSwgeyBsZWZ0OiB0cnVlLCByaWdodDogdHJ1ZSwgYm90dG9tOiB0cnVlIH0gKSk7XG4gICAgICAgIGJveGVzID0gYm94ZXMuY29uY2F0KG5ldyBCb3goIDk2MCwgNDgwLCAzMiwgNSwgeyBsZWZ0OiBmYWxzZSwgcmlnaHQ6IHRydWUsIGJvdHRvbTogdHJ1ZSB9ICkpO1xuICAgICAgICBib3hlcyA9IGJveGVzLmNvbmNhdChuZXcgQm94KCA5OTIsIDQzNCwgMzIsIDUsIHsgYm90dG9tOiBmYWxzZSB9ICkpO1xuXG4gICAgICAgIC8vIHNlY29uZCBmbG9vclxuICAgICAgICAvLyBsZWZ0XG4gICAgICAgIGJveGVzID0gYm94ZXMuY29uY2F0KG5ldyBCb3goIDY0LCAzODAsIDMyLCA1LCB7IGxlZnQ6IHRydWUsIHJpZ2h0OiB0cnVlLCBib3R0b206IHRydWUgfSApKTtcbiAgICAgICAgYm94ZXMgPSBib3hlcy5jb25jYXQobmV3IEJveCggMzIsIDMzMCwgMzIsIDUsIHsgbGVmdDogdHJ1ZSwgcmlnaHQ6IGZhbHNlLCBib3R0b206IHRydWUgfSApKTtcbiAgICAgICAgYm94ZXMgPSBib3hlcy5jb25jYXQobmV3IEJveCggMCwgMjg0LCAzMiwgNSwgeyBib3R0b206IGZhbHNlIH0gKSk7XG4gICAgICAgIC8vIHJpZ2h0XG4gICAgICAgIGJveGVzID0gYm94ZXMuY29uY2F0KG5ldyBCb3goIDkyOCwgMzgwLCAzMiwgNSwgeyBsZWZ0OiB0cnVlLCByaWdodDogdHJ1ZSwgYm90dG9tOiB0cnVlIH0gKSk7XG4gICAgICAgIGJveGVzID0gYm94ZXMuY29uY2F0KG5ldyBCb3goIDk2MCwgMzMwLCAzMiwgNSwgeyBsZWZ0OiBmYWxzZSwgcmlnaHQ6IHRydWUsIGJvdHRvbTogdHJ1ZSB9ICkpO1xuICAgICAgICBib3hlcyA9IGJveGVzLmNvbmNhdChuZXcgQm94KCA5OTIsIDI4NCwgMzIsIDUsIHsgYm90dG9tOiBmYWxzZSB9ICkpO1xuXG4gICAgICAgIHRoaXMuaWNlYmxvY2tiYXNlcyA9IFtdO1xuICAgICAgICAvLyBpY2UgbW9uc3RlciBibG9jayBiYXNlc1xuICAgICAgICBmb3IodmFyIHogPSAxMDA7IHogPCA5MDA7IHogKz0gMzMgKSB7XG4gICAgICAgICAgICB0aGlzLmljZWJsb2NrYmFzZXMucHVzaCggbmV3IEJveCh6LCA3MjAsIDMyLCAzLCB7fSwgdHJ1ZSApICk7XG4gICAgICAgIH1cblxuICAgICAgICB0aGlzLmJvZGllcyA9IHRoaXMuYm9kaWVzLmNvbmNhdCggYm94ZXMgKTtcblxuICAgICAgICB2YXIgc2VsZiA9IHRoaXM7XG5cbiAgICAgICAgdGhpcy5sb2FkSW1hZ2VzKCk7XG5cbiAgICAgICAgLy8gYmFja2dyb3VuZCB0aWxlc1xuICAgICAgICB0aGlzLmJhY2tncm91bmRUaWxlID0gbmV3IFNwcml0ZSggMTIsIDMwLCBbIHsgc3N4OiAwLCBzc3k6IDcyIH0gXSApO1xuICAgICAgICB0aGlzLmJhY2tncm91bmRUaWxlMiA9IG5ldyBTcHJpdGUoIDEyLCAzMCwgWyB7IHNzeDogMTIsIHNzeTogNzIgfSBdICk7XG4gICAgICAgIHRoaXMuYmFja2dyb3VuZFRpbGUzID0gbmV3IFNwcml0ZSggMTIsIDMwLCBbIHsgc3N4OiA0OCwgc3N5OiA3MiB9IF0gKTtcblxuICAgICAgICB0aGlzLmNsb3VkVGlsZSA9IG5ldyBTcHJpdGUoIDI0LCAxNCwgWyB7IHNzeDogOTcsIHNzeTogNTggfSBdICk7XG4gICAgICAgIHRoaXMuZ3Jhc3MxVGlsZSA9IG5ldyBTcHJpdGUoIDcsIDMsIFsgeyBzc3g6IDgzLCBzc3k6IDYyIH0gXSApO1xuICAgICAgICB0aGlzLmdyYXNzMlRpbGUgPSBuZXcgU3ByaXRlKCA3LCAzLCBbIHsgc3N4OiA5MCwgc3N5OiA2MiB9IF0gKTtcblxuICAgICAgICB0aGlzLnRyZWVTbGljZSA9IG5ldyBTcHJpdGUoIDYwLCA0LCBbIHsgc3N4OiAzMiwgc3N5OiA2NyB9IF0gKTtcbiAgICAgICAgdGhpcy50cmVlUm9vdExlZnQgPSBuZXcgU3ByaXRlKCA3LCA4LCBbIHsgc3N4OiAyOSwgc3N5OiA5NCB9IF0gKTtcbiAgICAgICAgdGhpcy50cmVlUm9vdFJpZ2h0ID0gbmV3IFNwcml0ZSggNiwgOCwgWyB7IHNzeDogMzYsIHNzeTogOTQgfSBdICk7XG5cbiAgICAgICAgdGhpcy5sZWF2ZXNUaWxlID0gbmV3IFNwcml0ZSggMjQsIDIxLCBbIHsgc3N4OiAyNCwgc3N5OiA3MiB9IF0gKTtcblxuICAgICAgICAvLyBzdGFpciB0aWxlc1xuICAgICAgICB0aGlzLnN0YWlyVGlsZSA9IG5ldyBTcHJpdGUoIDUwLCAyNSwgWyB7IHNzeDogMTIxLCBzc3k6IDQ2IH0gXSApO1xuXG4gICAgICAgIC8vIHdhdGVyIGF0IHRoZSBib3R0b20gb2YgdGhlIHNjcmVlblxuICAgICAgICB0aGlzLndhdGVyVGlsZSA9IG5ldyBTcHJpdGUoIDE0LCA4LCBbIHsgc3N4OiAwLCBzc3k6IDgsIGR1cmF0aW9uOiA1MDAgfSwgeyBzc3g6IDE0LCBzc3k6IDgsIGR1cmF0aW9uOiA1MDAgfSBdICk7XG4gICAgICAgIHRoaXMud2F0ZXJUaWxlMiA9IG5ldyBTcHJpdGUoIDE0LCA4LCBbIHsgc3N4OiA4LCBzc3k6IDE2IH0gXSApO1xuXG4gICAgICAgIC8vIHBsYXRmb3JtIHRpbGVzXG4gICAgICAgIC8vIGdyYXNzXG4gICAgICAgIHRoaXMucGZfb25lX1RpbGUgPSBuZXcgU3ByaXRlKCA0LCA4LCBbIHsgc3N4OiAwLCBzc3k6IDE2IH0gXSApO1xuICAgICAgICAvLyByb2NrL3NhbmRcbiAgICAgICAgdGhpcy5wZl90d29fVGlsZSA9IG5ldyBTcHJpdGUoIDQsIDgsIFsgeyBzc3g6IDQsIHNzeTogMTYgfSBdICk7XG5cbiAgICAgICAgLy8gbXV0ZSBpY29uXG4gICAgICAgIHRoaXMubXV0ZV9pY29uID0gbmV3IFNwcml0ZSggNywgOCwgWyB7IHNzeDogMCwgc3N5OiAzMiB9IF0gKTtcblxuICAgICAgICB0aGlzLmhlYXJ0SWNvbiA9IG5ldyBTcHJpdGUoIDcsIDgsIFsgeyBzc3g6IDAsIHNzeTogMCwgZHVyYXRpb246IDQwMCB9IF0gKTtcbiAgICAgICAgdGhpcy5lbGVtZW50SWNvbnMgPSBuZXcgU3ByaXRlKCA3LCA4LCBbIHsgc3N4OiA4MSwgc3N5OiAzNCB9LCB7IHNzeDogODksIHNzeTogMzQgfSwgeyBzc3g6IDgzLCBzc3k6IDUzIH0gXSApO1xuICAgICAgICB0aGlzLmhlYXJ0bWV0ZXIgPSBuZXcgU3ByaXRlKCAxMywgNiwgWyB7IHNzeDogOTcsIHNzeTogNTIgfSwgeyBzc3g6IDk3LCBzc3k6IDQ5IH0gXSApO1xuICAgICAgICB0aGlzLmVsZW1lbnRCb3ggPSBuZXcgU3ByaXRlKCAxMywgMTMsIFsgeyBzc3g6IDk3LCBzc3k6IDQ1IH0gXSApO1xuICAgICAgICB0aGlzLmN1cnJlbnRFbGVtZW50ID0gMDtcblxuICAgICAgICB2YXIgU0tJUFRJQ0tTID0gMTAwMCAvIDYwO1xuXG4gICAgICAgIHZhciBuZXh0RnJhbWUgPSBnZXRUaW1lU3RhbXAoKTtcbiAgICAgICAgdmFyIGxvb3BzID0gMDtcblxuICAgICAgICB2YXIgdGljayA9IGZ1bmN0aW9uKCkge1xuXG4gICAgICAgICAgICBpZiAoICFBV0FZICkge1xuICAgICAgICAgICAgICAgIGxvb3BzID0gMDtcbiAgICAgICAgICAgICAgICAvLyBmcmFtZSByYXRlIGluZGVwZW5kZW50IGdhbWUgc3BlZWRcbiAgICAgICAgICAgICAgICB3aGlsZSggZ2V0VGltZVN0YW1wKCkgPiBuZXh0RnJhbWUgJiYgbG9vcHMgPCAxMCApIHtcbiAgICAgICAgICAgICAgICAgICAgc2VsZi51cGRhdGUoZ2FtZVNpemUsIGJveGVzLCBoZWFydFN0b3BwZXJzLCBtb25zdGVyYmxvY2tlcnMgKTtcbiAgICAgICAgICAgICAgICAgICAgbmV4dEZyYW1lICs9IFNLSVBUSUNLUztcbiAgICAgICAgICAgICAgICAgICAgbG9vcHMrKztcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICBzZWxmLnJlbmRlcihjb250ZXh0LCBnYW1lU2l6ZSwgbW9uc3RlcmJsb2NrZXJzKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICBjb250ZXh0LmZpbGxTdHlsZSA9ICcjMDAwJztcbiAgICAgICAgICAgICAgICBjb250ZXh0LmZpbGxUZXh0KCdDbGljayB0byByZXN1bWUnLCA1MDUsIDM4NCk7XG4gICAgICAgICAgICAgICAgbmV4dEZyYW1lID0gZ2V0VGltZVN0YW1wKCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXF1ZXN0QW5pbWF0aW9uRnJhbWUodGljayk7XG5cbiAgICAgICAgfTtcblxuICAgICAgICB0aWNrKCk7XG4gICAgfTtcblxuICAgIHZhciBlbmRHYW1lID0gZnVuY3Rpb24ocykge1xuICAgICAgICBsb25nQnV0dG9uRGVsYXkucmVzZXQoKTtcbiAgICAgICAgdGhlR2FtZS5zdGF0ZSA9IHM7XG4gICAgfTtcblxuICAgIHZhciByZXNldEdhbWUgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgY3VycmVudEhlYXJ0cyA9IHRoZUdhbWUuY3VycmVudEVsZW1lbnQgPSBoZWFydHNpbmRhbmdlciA9IDA7XG4gICAgICAgIHRoZUdhbWUuZmFsbGluZ1N0dWZmID0gW107XG4gICAgICAgIHRoZUdhbWUudGhpbmdzID0gW107XG4gICAgICAgIHRoZUdhbWUucGxheWVyLnggPSA1MTI7XG4gICAgICAgIHRoZUdhbWUucGxheWVyLnkgPSA3MDA7XG4gICAgICAgIHRoZUdhbWUucGxheWVyLnN0YXRlID0gJ3cnO1xuICAgICAgICBmb3IodmFyIGkgPSAwOyBpIDwgdGhlR2FtZS5lbmVtaWVzLmxlbmd0aDsgaSsrICkge1xuICAgICAgICAgICAgdGhlR2FtZS5lbmVtaWVzW2ldLnJlc2V0KCk7XG4gICAgICAgIH1cbiAgICAgICAgdGhlR2FtZS5pY2VibG9ja2Jhc2VzWzEyXS5pc0VtcHR5ID0gdHJ1ZTtcbiAgICB9O1xuXG4gICAgR2FtZS5wcm90b3R5cGUgPSB7XG5cbiAgICAgIHVwZGF0ZTogZnVuY3Rpb24oZ2FtZVNpemUsIGJveGVzLCBoZWFydFN0b3BwZXJzLCBtb25zdGVyYmxvY2tlcnMpIHtcbiAgICAgICAgdmFyIHNlbGYgPSB0aGlzO1xuXG4gICAgICAgIHN3aXRjaCggdGhpcy5zdGF0ZSApIHtcbiAgICAgICAgICAgIGNhc2UgJ1RJVExFJzpcbiAgICAgICAgICAgICAgICBpZiAoIHRoaXMua2V5Ym9hcmRlci5hbnlLZXlEb3duKCkgKXtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5zdGF0ZSA9ICdTVE9SWSc7XG4gICAgICAgICAgICAgICAgICAgIFBBVVNFID0gZmFsc2U7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgY2FzZSAnU1RPUlknOlxuICAgICAgICAgICAgICAgIGlmICggdGhpcy5rZXlib2FyZGVyLmFueUtleURvd24oKSApe1xuICAgICAgICAgICAgICAgICAgICB0aGlzLnN0YXRlID0gJ0dBTUUnO1xuICAgICAgICAgICAgICAgICAgICBQQVVTRSA9IGZhbHNlO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGNhc2UgJ0VORCc6XG4gICAgICAgICAgICBjYXNlICdESUUnOlxuICAgICAgICAgICAgICAgIGlmICggdGhpcy5rZXlib2FyZGVyLmFueUtleURvd24oIHRydWUgKSApe1xuICAgICAgICAgICAgICAgICAgICB0aGlzLnN0YXRlID0gJ1RJVExFJztcbiAgICAgICAgICAgICAgICAgICAgUEFVU0UgPSBmYWxzZTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBjYXNlICdHQU1FJzpcbiAgICAgICAgICAgICAgICBpZiAoICFQQVVTRSApIHtcbiAgICAgICAgICAgICAgICAgICAgdmFyIGkgPSAwO1xuICAgICAgICAgICAgICAgICAgICBmb3IgKGkgPSAwOyBpIDwgdGhpcy5ib2RpZXMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuYm9kaWVzW2ldLnVwZGF0ZShnYW1lU2l6ZSwgYm94ZXMsIHRoaXMuaGVhcnRzLCB0aGlzLnRoaW5ncyk7XG4gICAgICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgICAgICBmb3IgKGkgPSAwOyBpIDwgdGhpcy5lbmVtaWVzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoICF0aGlzLmVuZW1pZXNbaV0uaXNEZWFkICkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuZW5lbWllc1tpXS51cGRhdGUobW9uc3RlcmJsb2NrZXJzLCB0aGlzLnBsYXllciwgdGhpcy50aGluZ3MsIHRoaXMuaWNlYmxvY2tiYXNlcyk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKCBzaW1wbGVDb2xDaGVjayggdGhpcy5wbGF5ZXIsIHRoaXMuZW5lbWllc1tpXSApICkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoIHRoaXMuZW5lbWllc1tpXS50eXBlID09PSAxICYmICgoIHRoaXMuZW5lbWllc1tpXS5zdGF0ZSA9PT0gJ3VwJyAmJiB0aGlzLmVuZW1pZXNbaV0uc3ByaXRlQi5nZXRGcmFtZSgpIDwgMSApIHx8IHRoaXMuZW5lbWllc1tpXS5zdGF0ZSA9PT0gJ3cnICkpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIGRvIG51dGhpbmdcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMucGxheWVyLnN0YXRlID0gJ2QnO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAgICAgZm9yIChpID0gMDsgaSA8IHRoaXMuZmFsbGluZ1N0dWZmLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmZhbGxpbmdTdHVmZltpXS51cGRhdGUoZ2FtZVNpemUsIGhlYXJ0U3RvcHBlcnMsIHRoaXMucGxheWVyKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgICAgIC8vIGNoZWNrIGlmIGFueSBoZWFydHMgYXJlIGluIGRhbmdlclxuICAgICAgICAgICAgICAgICAgICBpZiAoIGhlYXJ0c2luZGFuZ2VyID4gMCApIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhciBuID0gZ2V0VGltZVN0YW1wKCk7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgIGlmICggbiAtIHRoaXMubGFzdFBld1BldyA+IDUwMCApIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBhYS5wbGF5KCdwZXdwZXcnKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmxhc3RQZXdQZXcgPSBuO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAgICAgZm9yIChpID0gMDsgaSA8IHRoaXMudGhpbmdzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoICF0aGlzLnRoaW5nc1tpXS5pc0RlYWQgKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy50aGluZ3NbaV0udXBkYXRlKHRoaXMucGxheWVyLCB0aGlzLmljZWJsb2NrYmFzZXMpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAgICAgLy8gYW5pbWF0ZSB0aGUgd2F0ZXJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy53YXRlclRpbGUudXBkYXRlKCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGlmICh0aGlzLmtleWJvYXJkZXIuaXNEb3duKHRoaXMua2V5Ym9hcmRlci5LRVlTLlApICkge1xuICAgICAgICAgICAgICAgICAgICBpZiAoIHBhdXNlQnV0dG9uRGVsYXkuaXNEb25lKCkgKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBQQVVTRSA9ICFQQVVTRTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHBhdXNlQnV0dG9uRGVsYXkucmVzZXQoKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgfVxuICAgICAgfSxcblxuICAgICAgcmVuZGVyOiBmdW5jdGlvbihzY3JlZW4sIGdhbWVTaXplLCBtb25zdGVyYmxvY2tlcnMpIHtcbiAgICAgICAgc2NyZWVuLmNsZWFyUmVjdCgwLCAwLCBnYW1lU2l6ZS53aWR0aCwgZ2FtZVNpemUuaGVpZ2h0KTtcblxuICAgICAgICBzd2l0Y2goIHRoaXMuc3RhdGUgKSB7XG5cbiAgICAgICAgICAgIGNhc2UgJ0xPQURJTkcnOlxuICAgICAgICAgICAgICAgIHRoaXMucmVuZGVyTG9hZGluZ1NjcmVlbihzY3JlZW4sIGdhbWVTaXplKTtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGNhc2UgJ1RJVExFJzpcbiAgICAgICAgICAgICAgICB0aGlzLnJlbmRlclByZXR0eUJhY2tncm91bmQoc2NyZWVuKTtcbiAgICAgICAgICAgICAgICB0aGlzLnJlbmRlclRpdGxlU2NyZWVuKHNjcmVlbiwgZ2FtZVNpemUpO1xuICAgICAgICAgICAgICAgIHRoaXMud2F0ZXJUaWxlLnVwZGF0ZSgpO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgY2FzZSAnU1RPUlknOlxuICAgICAgICAgICAgICAgIHRoaXMucmVuZGVyUHJldHR5QmFja2dyb3VuZChzY3JlZW4pO1xuICAgICAgICAgICAgICAgIHRoaXMucmVuZGVyU3RvcnlTY3JlZW4oc2NyZWVuLCBnYW1lU2l6ZSk7XG4gICAgICAgICAgICAgICAgdGhpcy53YXRlclRpbGUudXBkYXRlKCk7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBjYXNlICdFTkQnOlxuICAgICAgICAgICAgICAgIHRoaXMucmVuZGVyRW5kU2NyZWVuKHNjcmVlbiwgZ2FtZVNpemUsICdZb3UgRGlkIGl0ISBDb25ncmF0dWxhdGlvbnMhJyk7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBjYXNlICdESUUnOlxuICAgICAgICAgICAgICAgIHRoaXMucmVuZGVyRW5kU2NyZWVuKHNjcmVlbiwgZ2FtZVNpemUsICdHYW1lIE92ZXIhJyk7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBjYXNlICdHQU1FJzpcbiAgICAgICAgICAgICAgICB0aGlzLnJlbmRlclByZXR0eUJhY2tncm91bmQoc2NyZWVuKTtcbiAgICAgICAgICAgICAgICB0aGlzLnJlbmRlckJhY2tncm91bmQoc2NyZWVuKTtcblxuICAgICAgICAgICAgICAgIHZhciBpID0gMDtcbiAgICAgICAgICAgICAgICBmb3IgKGkgPSAwOyBpIDwgdGhpcy5ib2RpZXMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgICAgICAgIHRoaXMuYm9kaWVzW2ldLnJlbmRlcihzY3JlZW4pO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIGZvciAoaSA9IDA7IGkgPCB0aGlzLmVuZW1pZXMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKCAhdGhpcy5lbmVtaWVzW2ldLmlzRGVhZCApIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuZW5lbWllc1tpXS5yZW5kZXIoc2NyZWVuKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIGZvciAoaSA9IDA7IGkgPCB0aGlzLmZhbGxpbmdTdHVmZi5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgICAgICAgICBpZiAoICF0aGlzLmZhbGxpbmdTdHVmZltpXS5pc0RlYWQgKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmZhbGxpbmdTdHVmZltpXS5yZW5kZXIoc2NyZWVuKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIGZvciAoaSA9IDA7IGkgPCB0aGlzLnRoaW5ncy5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgICAgICAgICBpZiAoICF0aGlzLnRoaW5nc1tpXS5pc0RlYWQgKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLnRoaW5nc1tpXS5yZW5kZXIoc2NyZWVuKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIHRoaXMucmVuZGVySFVEKHNjcmVlbiwgdGhpcy5wbGF5ZXIpO1xuXG4gICAgICAgICAgICAgICAgaWYgKCBQQVVTRSApIHtcbiAgICAgICAgICAgICAgICAgICAgc2NyZWVuLmZpbGxTdHlsZSA9ICcjMDAwJztcbiAgICAgICAgICAgICAgICAgICAgc2NyZWVuLmZvbnQgPSAnMzBwdCBtb25vc3BhY2UnO1xuICAgICAgICAgICAgICAgICAgICBzY3JlZW4udGV4dEFsaWduID0gJ2NlbnRlcic7XG4gICAgICAgICAgICAgICAgICAgIHNjcmVlbi5maWxsVGV4dCgnUEFVU0VEJywgZ2FtZVNpemUud2lkdGggLyAyLCBnYW1lU2l6ZS5oZWlnaHQgLyAyKTtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICB2YXIgdGhpc0ZyYW1lRlBTID0gMTAwMCAvICgobm93ID0gbmV3IERhdGUoKSkgLSBsYXN0VXBkYXRlKTtcbiAgICAgICAgICAgICAgICBpZiAobm93ICE9PSBsYXN0VXBkYXRlKXtcbiAgICAgICAgICAgICAgICAgIGZwcyArPSAodGhpc0ZyYW1lRlBTIC0gZnBzKSAvIGZwc0ZpbHRlcjtcbiAgICAgICAgICAgICAgICAgIGxhc3RVcGRhdGUgPSBub3c7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICB9XG4gICAgICB9LFxuICAgICAgcmVuZGVyRW5kU2NyZWVuOiBmdW5jdGlvbihjdHgsIGdhbWVTaXplLCB0ZXh0KSB7XG4gICAgICAgICAgICBjdHguZmlsbFN0eWxlID0gXCIjMDAwXCI7XG4gICAgICAgICAgICBjdHguZmlsbFJlY3QoMCwwLCBnYW1lU2l6ZS53aWR0aCwgZ2FtZVNpemUuaGVpZ2h0KTtcblxuICAgICAgICAgICAgY3R4LmZpbGxTdHlsZSA9IFwiI2ZmZlwiO1xuICAgICAgICAgICAgY3R4LmZvbnQgPSAnMzBwdCBtb25vc3BhY2UnO1xuICAgICAgICAgICAgY3R4LnRleHRBbGlnbiA9ICdjZW50ZXInO1xuICAgICAgICAgICAgY3R4LmZpbGxUZXh0KHRleHQsIGdhbWVTaXplLndpZHRoIC8gMiwgZ2FtZVNpemUuaGVpZ2h0IC8gMik7XG5cbiAgICAgICAgICAgIHRoaXMuYnN0KGN0eCwgNTEyLCA2MDAsIHRydWUpO1xuICAgICAgICAgICAgcmVzZXRHYW1lKCk7XG4gICAgICB9LFxuICAgICAgcmVuZGVyUHJldHR5QmFja2dyb3VuZDogZnVuY3Rpb24oY3R4KSB7XG4gICAgICAgICAgICAvLyAxMWI3NmQgLSBncmFzc1xuICAgICAgICAgICAgLy8gMTQ4ODc1IC0gZm9yZWdyb3VuZFxuICAgICAgICAgICAgLy8gZDM1OTFiIC0gc29pbFxuICAgICAgICAgICAgLy9cblxuICAgICAgICAgICAgdmFyIHR4ID0gMDtcbiAgICAgICAgICAgIC8vIHRpbGVzXG4gICAgICAgICAgICAvLyBjbG91ZHNcbiAgICAgICAgICAgIGZvciAodHggPSAwOyB0eCA8IDEwMjQ7IHR4ICs9IDk0ICkge1xuICAgICAgICAgICAgICAgIHRoaXMuY2xvdWRUaWxlLnJlbmRlcihjdHgsIHR4LCA0ODIpO1xuICAgICAgICAgICAgICAgIHRoaXMuY2xvdWRUaWxlLnJlbmRlcihjdHgsIHR4ICsgNDgsIDQ4MiwgdHJ1ZSApO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAvLyB0cmVlbGluZVxuICAgICAgICAgICAgdmFyIGMgPSAwO1xuICAgICAgICAgICAgZm9yICh0eCA9IDA7IHR4IDwgMTAyNDsgdHggKz0gMjQgKSB7XG5cbiAgICAgICAgICAgICAgICB0aGlzLmJhY2tncm91bmRUaWxlLnJlbmRlcihjdHgsIHR4LCA1MTApO1xuICAgICAgICAgICAgICAgIGlmICggdHggJSAoMjQgKiA0KSA9PT0gMCApIHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5iYWNrZ3JvdW5kVGlsZTIucmVuZGVyKGN0eCwgdHgsIDUxMCk7XG4gICAgICAgICAgICAgICAgICAgIGMgPSAwO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBpZiAoIHR4ID09PSAoMjQgKiAyNSkgKSB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuYmFja2dyb3VuZFRpbGUzLnJlbmRlcihjdHgsIHR4LCA1MTApO1xuICAgICAgICAgICAgICAgICAgICBjID0gMDtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgYysrO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAvLyB0aGlyZCBsZXZlbCAtIGdyYXNzXG4gICAgICAgICAgICBjdHguZmlsbFN0eWxlID0gJyMxMWI3NmQnO1xuICAgICAgICAgICAgY3R4LmZpbGxSZWN0KCAwLCA1NzAsIDEwMjQsIDgwKTtcblxuICAgICAgICAgICAgLy8gc2Vjb25kIGxldmVsIC0gZm9yZWdyb3VuZFxuICAgICAgICAgICAgY3R4LmZpbGxTdHlsZSA9ICcjMTQ4ODc1JztcbiAgICAgICAgICAgIGN0eC5maWxsUmVjdCggMCwgNjUwLCAxMDI0LCA0MCk7XG5cbiAgICAgICAgICAgIC8vIHRoaXJkIGxldmVsIC0gZm9yZWdyb3VuZFxuICAgICAgICAgICAgY3R4LmZpbGxTdHlsZSA9ICcjMTU1YzZmJztcbiAgICAgICAgICAgIGN0eC5maWxsUmVjdCggMCwgNjkwLCAxMDI0LCAxMDApO1xuXG4gICAgICAgICAgICAvLyBncmFzcyB0aWxlIDFcbiAgICAgICAgICAgIGZvciAodHggPSAwOyB0eCA8IDEwMjQ7IHR4ICs9IDE1ICkge1xuICAgICAgICAgICAgICAgIHRoaXMuZ3Jhc3MxVGlsZS5yZW5kZXIoY3R4LCB0eCwgNjQ1KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIC8vIGdyYXNzIHRpbGUgMlxuICAgICAgICAgICAgZm9yICh0eCA9IDA7IHR4IDwgMTAyNDsgdHggKz0gMTUgKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5ncmFzczJUaWxlLnJlbmRlcihjdHgsIHR4LCA2ODUpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAvLyB0cmVlc1xuICAgICAgICAgICAgZm9yICh0eCA9IDA7IHR4IDwgNzY4OyB0eCArPSA4ICkge1xuICAgICAgICAgICAgICAgIHRoaXMudHJlZVNsaWNlLnJlbmRlcihjdHgsIDE1MCwgdHgpO1xuICAgICAgICAgICAgICAgIHRoaXMudHJlZVNsaWNlLnJlbmRlcihjdHgsIDQ1MCwgdHgpO1xuICAgICAgICAgICAgICAgIHRoaXMudHJlZVNsaWNlLnJlbmRlcihjdHgsIDc1MCwgdHgpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgLy8gdHJlZSByb290c1xuICAgICAgICAgICAgZm9yKHZhciBhID0gMDsgYSA8IDM7IGErKyApIHtcbiAgICAgICAgICAgICAgICB0aGlzLnRyZWVSb290TGVmdC5yZW5kZXIoY3R4LCAxMzggKyAoYSAqIDMwMCksIDcxMyk7XG4gICAgICAgICAgICAgICAgdGhpcy50cmVlUm9vdFJpZ2h0LnJlbmRlcihjdHgsIDI2OCArIChhICogMzAwKSwgNzEzKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgLy8gbGVhdmVzXG4gICAgICAgICAgICBmb3IgKHR4ID0gMDsgdHggPCAxMDI0OyB0eCArPSA0OCApIHtcbiAgICAgICAgICAgICAgICB0aGlzLmxlYXZlc1RpbGUucmVuZGVyKGN0eCwgdHgsIDApO1xuICAgICAgICAgICAgfVxuICAgICAgfSxcbiAgICAgIHJlbmRlckJhY2tncm91bmQ6IGZ1bmN0aW9uKGN0eCkge1xuXG4gICAgICAgICAgICB2YXIgdHggPSAwO1xuXG4gICAgICAgICAgICAvLyBwbGF0Zm9ybSB0aWxlc1xuICAgICAgICAgICAgLy8gNCB4IDggPSA4IHggMTZcbiAgICAgICAgICAgIGZvciAodHggPSAwOyB0eCA8IDEwMjQ7IHR4ICs9IDggKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5wZl9vbmVfVGlsZS5yZW5kZXIoY3R4LCB0eCwgNzI5KTtcbiAgICAgICAgICAgICAgICB0aGlzLnBmX3R3b19UaWxlLnJlbmRlcihjdHgsIHR4LCA3NDUpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBmb3IgKHR4ID0gMDsgdHggPCA1MDA7IHR4ICs9IDggKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5wZl9vbmVfVGlsZS5yZW5kZXIoY3R4LCB0eCwgNTgwKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGZvciAodHggPSA2MDA7IHR4IDwgMTAyNDsgdHggKz0gOCApIHtcbiAgICAgICAgICAgICAgICB0aGlzLnBmX29uZV9UaWxlLnJlbmRlcihjdHgsIHR4LCA1ODApO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBmb3IgKHR4ID0gMDsgdHggPCAxMDI0OyB0eCArPSA4ICkge1xuICAgICAgICAgICAgICAgIHRoaXMucGZfb25lX1RpbGUucmVuZGVyKGN0eCwgdHgsIDQzMCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBmb3IgKHR4ID0gMDsgdHggPCAzNDA7IHR4ICs9IDggKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5wZl9vbmVfVGlsZS5yZW5kZXIoY3R4LCB0eCwgMjc5KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGZvciAodHggPSA0MDA7IHR4IDwgNjIwOyB0eCArPSA4ICkge1xuICAgICAgICAgICAgICAgIHRoaXMucGZfb25lX1RpbGUucmVuZGVyKGN0eCwgdHgsIDI3OSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBmb3IgKHR4ID0gNjgwOyB0eCA8IDEwMjQ7IHR4ICs9IDggKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5wZl9vbmVfVGlsZS5yZW5kZXIoY3R4LCB0eCwgMjc5KTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgZm9yICh0eCA9IDA7IHR4IDwgMTAyNDsgdHggKz0gOCApIHtcbiAgICAgICAgICAgICAgICB0aGlzLnBmX29uZV9UaWxlLnJlbmRlcihjdHgsIHR4LCAxMjkpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAvLyBzdGFpcnNcbiAgICAgICAgICAgIHRoaXMuZHJhd1N0YWlycyhjdHgsIDAsIDI4MCwgZmFsc2UpO1xuICAgICAgICAgICAgdGhpcy5kcmF3U3RhaXJzKGN0eCwgMCwgNDMwLCBmYWxzZSk7XG4gICAgICAgICAgICB0aGlzLmRyYXdTdGFpcnMoY3R4LCAwLCA1ODAsIGZhbHNlKTtcblxuICAgICAgICAgICAgdGhpcy5kcmF3U3RhaXJzKGN0eCwgMTAyNCAtIDEwMCwgMjgwLCB0cnVlKTtcbiAgICAgICAgICAgIHRoaXMuZHJhd1N0YWlycyhjdHgsIDEwMjQgLSAxMDAsIDQzMCwgdHJ1ZSk7XG4gICAgICAgICAgICB0aGlzLmRyYXdTdGFpcnMoY3R4LCAxMDI0IC0gMTAwLCA1ODAsIHRydWUpO1xuXG4gICAgICAgICAgICAvLyB3YXRlclxuICAgICAgICAgICAgZm9yICh0eCA9IDA7IHR4IDwgMTAyNDsgdHggKz0gMjggKSB7XG4gICAgICAgICAgICAgICAgdGhpcy53YXRlclRpbGUucmVuZGVyKGN0eCwgdHgsIDc0MCk7XG4gICAgICAgICAgICAgICAgdGhpcy53YXRlclRpbGUyLnJlbmRlcihjdHgsIHR4LCA3NTYpO1xuICAgICAgICAgICAgfVxuXG4gICAgICB9LFxuICAgICAgZHJhd1N0YWlyczogZnVuY3Rpb24oIGN0eCwgbG9jWCwgbG9jWSwgZmxpcCkge1xuICAgICAgICBpZiAoIGZsaXAgKSB7XG4gICAgICAgICAgICB0aGlzLnN0YWlyVGlsZS5yZW5kZXIoY3R4LCBsb2NYLCAgICAgIGxvY1kgKyAxMDAsIGZsaXApO1xuICAgICAgICAgICAgdGhpcy5zdGFpclRpbGUucmVuZGVyKGN0eCwgbG9jWCArIDMyLCBsb2NZICsgNTAsIGZsaXApO1xuICAgICAgICAgICAgdGhpcy5zdGFpclRpbGUucmVuZGVyKGN0eCwgbG9jWCArIDY0LCBsb2NZLCBmbGlwKTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlXG4gICAgICAgIHtcbiAgICAgICAgICAgIHRoaXMuc3RhaXJUaWxlLnJlbmRlcihjdHgsIGxvY1gsICAgICAgbG9jWSArIDEwMCwgZmxpcCk7XG4gICAgICAgICAgICB0aGlzLnN0YWlyVGlsZS5yZW5kZXIoY3R4LCBsb2NYIC0gMzIsIGxvY1kgKyA1MCwgZmxpcCk7XG4gICAgICAgICAgICB0aGlzLnN0YWlyVGlsZS5yZW5kZXIoY3R4LCBsb2NYIC0gNjQsIGxvY1ksIGZsaXApO1xuICAgICAgICB9XG4gICAgICB9LFxuICAgICAgcmVuZGVySFVEOiBmdW5jdGlvbihjdHgsIHBsYXllcikge1xuICAgICAgICBpZiAoIGFhLm11dGUgKSB7XG4gICAgICAgICAgICB0aGlzLm11dGVfaWNvbi5yZW5kZXIoY3R4LCAxMDAwLCA1MCk7XG4gICAgICAgIH1cblxuICAgICAgICAvLyBoZWFydCBtZXRlclxuICAgICAgICAvLyBkcmF3IGEgcmVkIGJveCB0byBmaWxsIHRoZSBtZXRlclxuICAgICAgICBjdHguZmlsbFN0eWxlID0gJ3JlZCc7XG4gICAgICAgIGN0eC5maWxsUmVjdCgxOCwgMTY4LCAyMCwgLTEgKiBjdXJyZW50SGVhcnRzICogNCk7XG5cbiAgICAgICAgdGhpcy5oZWFydEljb24ucmVuZGVyKGN0eCwgMjAsIDIwKTtcbiAgICAgICAgdGhpcy5oZWFydG1ldGVyLnNldEZyYW1lKDEpO1xuICAgICAgICBmb3IgKCB2YXIgaSA9IDA7IGkgPCAxMTsgaSsrICkge1xuICAgICAgICAgICAgdGhpcy5oZWFydG1ldGVyLnJlbmRlcihjdHgsIDE0LCA0MCArIChpICogMTIgKSk7XG4gICAgICAgICAgICBpZiAoIGkgPT0gOSApIHtcbiAgICAgICAgICAgICAgICB0aGlzLmhlYXJ0bWV0ZXIuc2V0RnJhbWUoMCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgLy8gZWxlbWVudCBib3hcbiAgICAgICAgdGhpcy5lbGVtZW50Qm94LnJlbmRlcihjdHgsIDUwLCA0NSArICh0aGlzLmN1cnJlbnRFbGVtZW50ICogMjUpKTtcbiAgICAgICAgLy8gY3VycmVudCBlbGVtZW50XG4gICAgICAgIGZvciAoIHZhciBpID0gMDsgaSA8IDM7IGkrKykge1xuICAgICAgICAgICAgdGhpcy5lbGVtZW50SWNvbnMuc2V0RnJhbWUoaSk7XG4gICAgICAgICAgICB0aGlzLmVsZW1lbnRJY29ucy5yZW5kZXIoY3R4LCA1NSwgNTAgKyAoaSAqIDI1KSk7XG4gICAgICAgIH1cbiAgICAgIH0sXG4gICAgICByZW5kZXJMb2FkaW5nU2NyZWVuOiBmdW5jdGlvbihjdHgsIGdhbWVTaXplKSB7XG4gICAgICAgIGN0eC5maWxsU3R5bGUgPSBcIiMwMDBcIjtcbiAgICAgICAgY3R4LmZpbGxSZWN0KDAsMCwgZ2FtZVNpemUud2lkdGgsIGdhbWVTaXplLmhlaWdodCk7XG4gICAgICAgIGN0eC5maWxsU3R5bGUgPSAnd2hpdGUnO1xuICAgICAgICBjdHguZm9udCA9ICcyMHB0IG1vbm9zcGFjZSc7XG4gICAgICAgIGN0eC50ZXh0QWxpZ24gPSAnY2VudGVyJztcbiAgICAgICAgY3R4LmZpbGxUZXh0KCdMb2FkaW5nLi4uJywgZ2FtZVNpemUud2lkdGggLyAyLCBnYW1lU2l6ZS5oZWlnaHQgLyAyKTtcbiAgICAgIH0sXG4gICAgICByZW5kZXJTdG9yeVNjcmVlbjogZnVuY3Rpb24oY3R4LCBnYW1lU2l6ZSkge1xuICAgICAgICB0aGlzLnJlbmRlckJhY2tncm91bmQoY3R4KTtcbiAgICAgICAgLy8gbGlnaHQgb3ZlcmxheVxuICAgICAgICBjdHguZmlsbFN0eWxlID0gXCJyZ2JhKDAsIDAsIDAsIDAuODApXCI7XG4gICAgICAgIGN0eC5maWxsUmVjdCgwLDAsIGdhbWVTaXplLndpZHRoLCBnYW1lU2l6ZS5oZWlnaHQpO1xuXG4gICAgICAgIHZhciBodyA9IGdhbWVTaXplLndpZHRoIC8gMjtcbiAgICAgICAgdmFyIGhoID0gZ2FtZVNpemUuaGVpZ2h0IC8gMjtcblxuICAgICAgICBjdHguZmlsbFN0eWxlID0gJ3doaXRlJztcbiAgICAgICAgY3R4LmZvbnQgPSAnMTJwdCBtb25vc3BhY2UnO1xuXG4gICAgICAgIHZhciB0ZXh0ID0gWyAnT2ggbm8hJyxcbiAgICAgICAgICAgICAgICAgICAgICdGZWxpY2l0eVxcJ3MgYm95ZnJpZW5kIGlzIGxvc2luZyBoaXMgbG92ZSEnLFxuICAgICAgICAgICAgICAgICAgICAgJ0JyYXZlIHRoZSBmb3VyIGVsZW1lbnRzIGFuZCBjb2xsZWN0IHRoZSBoZWFydHMgYmVmb3JlIHRoZXkgYnJlYWsuJyxcbiAgICAgICAgICAgICAgICAgICAgICdGaWxsIHRoZSBoZWFydG1ldGVyIHRvIGNvbXBsZXRlIHRoZSBsZXZlbC4nLFxuICAgICAgICAgICAgICAgICAgICAgJ1dhdGNoIG91dCBmb3Igd2luZGR1Y2tzLCBmaXJlc3ByaXRlcywgc2FuZG1vbnN0ZXJzIGFuZCBzbm93bWVuLicsXG4gICAgICAgICAgICAgICAgICAgICAnVXNlIHRoZSBjb3JyZWN0IGVsZW1lbnQgdG8gZGVmZWF0IHRoZW0uJyxcbiAgICAgICAgICAgICAgICAgICAgICcnLFxuICAgICAgICAgICAgICAgICAgICAgJ0NvbnRyb2xzOicsXG4gICAgICAgICAgICAgICAgICAgICAnQXJyb3cga2V5czogTW92ZSBsZWZ0L3JpZ2h0LCBKdW1wLCBHbyBkb3duIHN0YWlycycsXG4gICAgICAgICAgICAgICAgICAgICAnWjogSnVtcCcsXG4gICAgICAgICAgICAgICAgICAgICAnWDogU3dpdGNoIEVsZW1lbnQnLFxuICAgICAgICAgICAgICAgICAgICAgJ0M6IFVzZSBFbGVtZW50JyxcbiAgICAgICAgICAgICAgICAgICAgICcnLFxuICAgICAgICAgICAgICAgICAgICAgJ006IE11dGUgc291bmRzJyxcbiAgICAgICAgICAgICAgICAgICAgICdQOiBQYXVzZSdcbiAgICAgICAgICAgICAgICAgICAgXTtcblxuICAgICAgICBmb3IgKCB2YXIgaSA9IDA7IGkgPCB0ZXh0Lmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICBjdHguZmlsbFRleHQoIHRleHRbaV0sIGh3LCAxMDAgKyAoaSAqIDQwKSApO1xuICAgICAgICB9XG5cbiAgICAgICAgdGhpcy5ic3QoY3R4LCBodywgNzIwKTtcblxuICAgICAgfSxcbiAgICAgIGJzdDogZnVuY3Rpb24oY3R4LCB4LCB5LCBmbGFnKSB7XG4gICAgICAgIHN3aXRjaCAoIHRoaXMudGl0bGVzY3JlZW5CbGluay5nZXRTdGFnZSgpICkge1xuICAgICAgICAgICAgY2FzZSAwOlxuICAgICAgICAgICAgICAgIGN0eC5maWxsU3R5bGUgPSAnd2hpdGUnO1xuICAgICAgICAgICAgICAgIGN0eC5mb250ID0gJzE1cHQgaW1wYWN0JztcbiAgICAgICAgICAgICAgICBpZiAoIGZsYWcgKSB7XG4gICAgICAgICAgICAgICAgICAgIGN0eC5maWxsVGV4dCgnUHJlc3MgYW55IGtleSB0byB0cnkgYWdhaW4nLCB4LCB5ICk7XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgY3R4LmZpbGxUZXh0KCdQcmVzcyBhbnkga2V5IHRvIGJlZ2luJywgeCwgeSApO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgfVxuICAgICAgfSxcbiAgICAgIHJlbmRlclRpdGxlU2NyZWVuOiBmdW5jdGlvbihjdHgsIGdzKSB7XG4gICAgICAgIHRoaXMucmVuZGVyQmFja2dyb3VuZChjdHgpO1xuICAgICAgICAvLyBkYXJrIG92ZXJsYXlcbiAgICAgICAgY3R4LmZpbGxTdHlsZSA9IFwicmdiYSgyNTUsIDI1NSwgMjU1LCAwLjEwKVwiO1xuICAgICAgICBjdHguZmlsbFJlY3QoMCwwLCBncy53aWR0aCwgZ3MuaGVpZ2h0KTtcbiAgICAgICAgY3R4LmZpbGxTdHlsZSA9ICd5ZWxsb3cnO1xuICAgICAgICBjdHguZm9udCA9ICc2MHB0IGltcGFjdCc7XG4gICAgICAgIGN0eC50ZXh0QWxpZ24gPSAnY2VudGVyJztcbiAgICAgICAgdmFyIHQgPSBbICdGZWxpY2l0eScsICdhbmQnLCAndGhlIEZpZnRoIEVsZW1lbnQ6JywgJ0xvdmUnXTtcbiAgICAgICAgZm9yICggdmFyIGkgPSAwOyBpIDwgdC5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgY3R4LmZpbGxUZXh0KCB0W2ldLCA1MTIsIDIwMCArIChpICogMTAwKSApO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMuYnN0KGN0eCwgNTEyLCA2MzApO1xuICAgICAgfSxcbiAgICAgIC8vIGxvYWQgb3VyIHNwcml0ZXNoZWV0XG4gICAgICBsb2FkSW1hZ2VzOiBmdW5jdGlvbigpe1xuICAgICAgICAgICAgdmFyIHNlbGYgPSB0aGlzO1xuICAgICAgICAgICAgdmFyIGltYWdlT2JqID0gbmV3IEltYWdlKCk7XG5cbiAgICAgICAgICAgIGltYWdlT2JqLm9ubG9hZCA9IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgIHNlbGYuc3RhdGUgPSBcIlRJVExFXCI7XG4gICAgICAgICAgICB9O1xuICAgICAgICAgICAgaW1hZ2VPYmouc3JjID0gXCJzcHJpdGVzaGVldC5wbmdcIjtcbiAgICAgICAgICAgIGltYWdlc1swXSA9IGltYWdlT2JqO1xuICAgICAgICB9XG4gICAgfTtcblxuICAgIC8vIHN0YXJ0IGdhbWUgd2hlbiBwYWdlIGhhcyBmaW5pc2hlZCBsb2FkaW5nXG4gICAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoXCJsb2FkXCIsIGZ1bmN0aW9uKCkge1xuICAgICAgdGhlR2FtZSA9IG5ldyBHYW1lKCk7XG4gICAgfSk7XG5cbiAgICAvLyBpZiB0aGUgd2luZG93IGxvb3NlcyBmb2N1cyB3ZSBwYXVzZSB0aGUgZ2FtZSAtIG90aGVyd2lzZSB5b3UgZ2V0IGEgc3VwZXJzcGVlZCBtb21lbnQhXG4gICAgd2luZG93Lm9uYmx1ciA9IGZ1bmN0aW9uKCkge1xuICAgICAgICBBV0FZID0gdHJ1ZTtcbiAgICB9O1xuICAgIHdpbmRvdy5vbmZvY3VzID0gZnVuY3Rpb24oKSB7XG4gICAgICAgIEFXQVkgPSBmYWxzZTtcbiAgICB9O1xufSkoKTtcbiJdfQ==
