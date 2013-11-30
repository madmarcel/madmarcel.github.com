'use strict';

var selectedBallIndex = 0;
var selectedWidget = null;

var hasSolvedOnce = false;

var ballImageNames = [ 'blueball',
                       'redball',
                       'greenball',
                       'orangeball',
                       'purpleball',
                       'blackball',
                       'yellowball',
                       'pinkball',
                       'cyanball',
                       'rainbow'
                      ];

var selectionRect = {
                        visible: false,
                        x: 0,
                        y: 0,                        
                        render: function(ctx) {
                            if( this.visible ) {
                                                                
                                if( selectedWidget !== null ) {
                                    var item = previews[selectedWidget];
                                    if( item.gs === null ) {
                                        item.gs = Filters.convertToGrayScale( item.orig );
                                    }                                    
                                                                        
                                    ctx.putImageData( item.gs, this.x, this.y );
                                }
                                else {
                                    // draw a red border
                                    ctx.beginPath()
                                    ctx.strokeStyle = "red";
                                    ctx.rect(this.x, this.y, BLOCKWIDTH, BLOCKHEIGHT); 
                                    ctx.stroke();                                
                                }
                            }
                        },
                        intersect: function(mx,my) {
                            if( mx >= this.x &&
                                mx <= this.x + BLOCKWIDTH &&
                                my >= this.y &&
                                my <= this.y + BLOCKHEIGHT
                               ) {
                                return true;
                            }
                            return false;
                        },
                        setPosition: function(nx,ny) {
                            this.x = nx;
                            this.y = ny;
                        }
                    };

var instructions = {
                            visible: true,
                            x: 0,
                            y: 0,
                            render: function(ctx) {
                                if( this.visible ) {
                                    if( images.length > 0 ) {                                        
                                        ctx.drawImage( images[ (images.length - 1) ], this.x, this.y );
                                    }
                                }
                            }
                    };

var scenes = [];
var balls = [];
var images = [];
var previews = [];

/* fudge for chrome and firefox - otherwise can't get correct mouse coordinates if page is scrolled */
var browserKludge = function( event, canvas_offset ) {

    var is_firefox = /firefox/i.test(navigator.userAgent);
    
    // chrome and ie need this
    if (event.offsetX !== undefined && event.offsetY !== undefined && !is_firefox) {
        return { "x" : event.offsetX, "y" : event.offsetY };
    }
    
    // most browsers should be able to use this
    var sl = document.documentElement.scrollLeft;
    var st = document.documentElement.scrollTop;
    
    // firefox needs this instead
    if( is_firefox ) {
        sl = document.body.scrollLeft;
        st = document.body.scrollTop;
    }
    
    var mx = event.clientX + sl + document.documentElement.scrollLeft - Math.floor(canvas_offset.left);   
    var my = event.clientY + sl + document.documentElement.scrollTop - Math.floor(canvas_offset.top) + 1;
    
    return { "x" : mx, "y" : my };
};

var updateWidgetTotals = function() {
    $("#wTotal").html("" + CONTRAPTIONS.length);
    $("#wUsed").html("" + 0);
}

$( document ).ready(function() {
    
    // update total widgets used
    updateWidgetTotals();
    
    $("#winMsg").html("");        
                                        
    // log mouse click coordinates on canvas
    $("#bbm").mousedown( function(e) {
       
       var canvas = $("#bbm")[0];
       var canvas_offset = $("#bbm").offset();
                   
       var mousePos = browserKludge(e, canvas_offset );
       var mx = mousePos.x;
       var my = mousePos.y;
       
       // console.log("Clicked at (" + mx + "," + my + ")");
       
       if( instructions.visible ) {
        instructions.visible = false;
       }
       
       processClick( mx, my );              
    });
    
    $("#bbm").mouseenter( function(e){
        selectionRect.visible = true;              
    });
    $("#bbm").mouseleave( function(e){
        selectionRect.visible = false;              
    });
    
    $("#bbm").mousemove( function(e){
       var canvas = $("#bbm")[0];
       var canvas_offset = $("#bbm").offset();
                   
       var mousePos = browserKludge(e, canvas_offset );
       var mx = mousePos.x;
       var my = mousePos.y;
       
       var newX = Math.floor(mx / BLOCKWIDTH) * BLOCKWIDTH;
       var newY = Math.floor(my / BLOCKHEIGHT) * BLOCKHEIGHT;
        
       selectionRect.setPosition(newX, newY);    
       selectionRect.visible = true;              
    });
    
    // setup the buttons    
    $("a.addBall").click( function(e) {
        e.preventDefault();
        if( instructions.visible ) {
            instructions.visible = false;
        }        
        addBall();
        countWidgetsUsed(); 
    });
    
    $("a.clearBalls").click( function(e) {
        e.preventDefault();
        if( instructions.visible ) {
            instructions.visible = false;
        }       
        clearAllBalls();
        countWidgetsUsed(); 
    });
    
    $("a.clearWidgets").click( function(e) {
        e.preventDefault();
        if( instructions.visible ) {
            instructions.visible = false;
        }        
        clearAllWidgets();
        checkIsSolved();
        countWidgetsUsed(); 
    });
                
    $("a.resetAll").click( function(e) {
        e.preventDefault();
        if( instructions.visible ) {
            instructions.visible = false;
        }        
        clearAllBalls();
        clearAllWidgets();
        checkIsSolved();
        countWidgetsUsed(); 
    });
    
    $("a.help").click( function(e) {
        e.preventDefault();
        instructions.visible = !instructions.visible;
    });
    
    $("a", ".minihelp").click( function(e) {
        e.preventDefault();
        instructions.visible = !instructions.visible;
    });
    
    // force focus onto the canvas
    $("#bbm").focus();
    
    animate();    
    
    loadImages();
            
    // add the balls to the ball selection dropdown
    var bsContainer = $(".ballSelection ul");
    for( var i = 0; i < ballImageNames.length; i++) {
        var id = i;
        if( i === ballImageNames.length - 1 ) {
            id = 99;
        }
        $(bsContainer).append("<li data-id='" + id + "'><img src='images/" + ballImageNames[i] + ".png'/></li>");
    }
    
    // setup the custom ball selection dropdown - there is probably a better ways to do this
    // on hover, pop out list
    $("li#head").click( function(){
        
            if( instructions.visible ) {
                instructions.visible = false;
            }
            $("ul.ballSelection").toggle();
            $("li", ".ballSelection").not("#head").toggle();
    }); 
    
    // on click, set head to show selection
    $(".ballSelection li").not("#head").click( function(e) {
        if( instructions.visible ) {
            instructions.visible = false;
        }
        selectedBallIndex = $(this).data('id');
        
        var i = selectedBallIndex;
        
        if( i == 99 ) {
            i = ballImageNames.length - 1;   
        }        
        
        $("#selectedBall").html("<img src='images/" + ballImageNames[i] + ".png' />");
        
        $("ul.ballSelection").hide();
        $("li", ".ballSelection").not("#head").hide();        
    });
    
    // social links
    setupSocialLinks();
});

var setupSocialLinks = function() {
    var myUrl = 'http://madmarcel.github.io/byobbm';
    var myUrl2 = 'madmarcel.github.io/byobbm';
    var desc = 'BYO Blue Ball Machine';
    var thumbnail = 'http://madmarcel.github.io/byobbm/images/media/thumbnail.png';
    var thumbnail2 = 'http://madmarcel.github.io/byobbm/images/media/thumbnail-200x200.png';
    var screenshot = 'http://madmarcel.github.io/byobbm/images/media/screenshot.png';
            
    var links = [
                    { "url" : "http://www.facebook.com/sharer.php?s=100&p[url]=" + encodeURI(myUrl) + "p[images][0]=" + encodeURI(thumbnail2) + "&p[title]=" + encodeURI(desc), "title": "Facebook", "image": "facebook.png", "popup": true },
                    { "url" : "http://twitter.com/share?url=" + encodeURI(myUrl) + "&text=" + encodeURI(desc), "title": "Twitter", "image": "twitter.png", "popup": true },
                    { "url" : "http://plusone.google.com/_/+1/confirm?hl=en&url=" + encodeURI(myUrl) + "&title=" + encodeURI(desc), "title": "Google+", "image": "google.png", "popup": true },
                    { "url" : "http://pinterest.com/pin/create/button/?url=" + encodeURI(myUrl) + "&media=" + encodeURI(thumbnail2) + "&description=" + encodeURI(desc), "title": "Pinterest", "image": "pinterest.png", "popup": true },
                    { "url" : "http://www.tumblr.com/share/link?url=" + encodeURI(myUrl2) + "&name=" + encodeURI(desc) + "&description=" + encodeURI(desc), "title": "Tumblr", "image": "tumblr.png", "popup": true },
                    /* { "url" : "http://github.com/madmarcel", "title": "Github", "image": "github.png", "popup": true }, */
                    { "url" : "http://www.stumbleupon.com/submit?url=" + encodeURI(myUrl) + "&title=" + encodeURI(desc), "title": "StumbleUpon", "image": "stumbleupon.png", "popup": true },
                    { "url" : "mailto:?subject=Check out " + myUrl, "title": "Email", "image": "email.png", "popup": false }
                ];
    
    for(var i = 0; i < links.length; i++ ) {
        var popup = "";
        if( links[i].popup ) {
            popup = " target='_blank' onclick='return popitup(this.href);'";
        }
        $("div.social_sharing").append("<a href='" + links[i].url + "' title='" + links[i].title + "'" + popup + "><img src='images/social/" + links[i].image + "' alt='" + links[i].title + "' width='16' height='16'></a>");
    }
}

var popitup = function(url) {
	var newwindow=window.open(url,'name','height=400,width=800');
	if (window.focus) {newwindow.focus()}
	return false;
}

// 30 fps is heaps
window.requestAnimFrame = (function(callback) {
        return window.requestAnimationFrame || window.webkitRequestAnimationFrame || window.mozRequestAnimationFrame || window.oRequestAnimationFrame || window.msRequestAnimationFrame ||
        function(callback) {
          window.setTimeout(callback, 1000 / FPS);
        };
})();

var animate = function() {
        var canvas = $('#bbm')[0];
        var context = canvas.getContext('2d');
        canvas.tabIndex = 1;
        
        // update        
        update();
        
        // clear the viewport
        context.clearRect(0, 0, canvas.width, canvas.height);
        
        // draw stuff
        render( context );
        
        // request new frame
        requestAnimFrame(function() {
          animate();
        });
}

var update = function() {
    for(var si in scenes) {
        scenes[si].update();
    }
    
    // only update unclaimed balls
    for(var bi in balls) {
        
        if( balls[bi].performScan ) {
            balls[bi].update();
            continue;
        }
        
        if( balls[bi].unclaimed ) {                        
            balls[bi].update();                
            
            // check if the ball hit a node
            for(var si in scenes ) {
                var o = scenes[si].checkHitNode(balls[bi].x, balls[bi].y, 3);
                if( o !== null ) {
                    
                    // console.log( o.track[o.index].x + "," + o.track[o.index].y + " vs " + balls[bi].prevNodeX + "," + balls[bi].prevNodeY );
                    
                    // make sure we skip the node we just came from
                    if( o.track.nodes[o.index].x == balls[bi].prevNodeX &&
                        o.track.nodes[o.index].y == balls[bi].prevNodeY ) {                        
                        continue;
                    }
                    
                    scenes[si].claimBall(balls[bi]);
                    balls[bi].unclaimed = false;
                    balls[bi].scene = scenes[si];
                    balls[bi].target = o.index;
                    balls[bi].track = o.track;
                    balls[bi].z = o.track.z;
                }
            }                        
        }
    }
}

var render = function(ctx) {
    
    // only draw unclaimed balls
    for(var bi in balls ) {
        if( balls[bi].unclaimed ) {
            balls[bi].render(ctx);
        }
    }
    
    for(var si in scenes ) {
        scenes[si].render(ctx);
    }
    
    selectionRect.render(ctx);
    
    instructions.render(ctx);
}

var processClick = function(mx, my) {
    if( selectedWidget !== null && selectionRect.visible ) {
        var canvas = $("#bbm")[0];
            
        var tx = Math.floor(selectionRect.x / BLOCKWIDTH) * BLOCKWIDTH;
        var ty = Math.floor(selectionRect.y / BLOCKHEIGHT) * BLOCKHEIGHT;
        
        var ly = Math.floor(ty / BLOCKHEIGHT);
        var lx = Math.floor(tx / BLOCKWIDTH);
        var rowCount = Math.floor(canvas.width / BLOCKWIDTH);
        var loc = ly * rowCount + lx;                
        
        //console.log("Selected widget is " + selectedWidget + " => " + CONTRAPTIONS[selectedWidget]);
                                            
        var widget = new Widget("" + CONTRAPTIONS[selectedWidget] );
                    
        // in theory, these are cached, so only have to load them once
        widget.loadConfig();                
        
        if( scenes[loc] !== undefined ) {
            scenes[loc].widget.clearBalls(true);
        }
        
        scenes[loc] = new Scene( tx, ty, BLOCKHEIGHT, BLOCKWIDTH, loc, widget );
        
        countWidgetsUsed();   
        checkIsSolved();
    }
};

var countWidgetsUsed = function() {
    var list = [];
    
    for( var i in scenes ) {
        
        var k = scenes[i].widget.id;
        if( $.inArray( k, list ) < 0 ) {
            list.push( k );
        }
    }
    
    $("#wUsed").html(list.length);
    $("#wTotal").html(CONTRAPTIONS.length);
}

var checkIsSolved = function() {
    // lamest win notification EVER :P
    if( checkWinCondition() ) {
        $("#winMsg").html("WOOHOO! SOLVED!");
        // let's play a sad party sound ONCE to make sure player notices
        if( !hasSolvedOnce ) {
            var snd = new Audio('sounds/combined.mp3');
            snd.play();
            hasSolvedOnce = true;
        }
    }
    else
    {
        $("#winMsg").html("");
    }
};

var addBall = function() {
    
    var canvas = $('#bbm')[0];    
    
    var i = selectedBallIndex;
    // rainbow ball
    if( i == 99 ) {
        // pick a random ball
        i = Math.floor(Math.random() * (ballImageNames.length - 1) );
    }
    
    var b1 = new Ball(146,-2, canvas.height, canvas.width, images[i], this);            
    b1.y_delta = 1;        
    balls.push( b1 );    
}

var loadImages = function() {
    var imageNames = [
                        'blueball',
                        'redball',
                        'greenball',
                        'orangeball',
                        'purpleball',                        
                        'blackball',                        
                        'yellowball',
                        'pinkball',
                        'cyanball',
                        'instructions'
                     ];
        
    for( var i = 0; i < imageNames.length; i++ ) {
        var imageObj = new Image();
                        
        imageObj.src = IMAGES_FOLDER + imageNames[i] + ".png";
        
        images[i] = imageObj;
    }
            
    for(var i = 0; i < CONTRAPTIONS.length; i++ ) {
        var imageObj = new Image();                
        
        imageObj.src =  PREVIEW_FOLDER + CONTRAPTIONS[i] + ".png";
        
        previews[i] = { "orig" : imageObj, "gs" : null };
    }
}

var clearAllBalls = function() {
    for( var i in scenes ) {
        scenes[i].widget.clearBalls(true);  
    }
    
    balls = [];
}

var clearAllWidgets = function() {    
    for( var i in scenes.length ) {
        scenes[i].widget.clearAll();        
    }
    
    scenes = [];
    for(var i = 0; i < balls.length; i++) {
        balls[i].reset();
    }
}

var setTheSelectedWidget = function(id) {
    selectedWidget = id;
}

/* ----------------------------------------------------
 *                WIN CONDITION FUNCTIONS
 * ---------------------------------------------------- */

var getMaxWidgets = function(canvas) {        
    var cols = canvas.width / BLOCKWIDTH;
    var rows = canvas.height / BLOCKHEIGHT;
    
    return Math.floor( cols * rows );
};

// assumes x and y come from scene
var getIndexLocation = function(x,y, canvas) {    
    var ly = Math.floor(y / BLOCKHEIGHT);
    var lx = Math.floor(x / BLOCKWIDTH);
    var rowCount = Math.floor(canvas.width / BLOCKWIDTH);
    var loc = ly * rowCount + lx;
    
    return loc;
};

var getActualScenesLength = function() {
    var counter = 0;
    for( var key in scenes ) {
        counter++;
    }
    return counter;
}

// check if a ball can traverse each widget on the page at least once
var checkWinCondition = function() {
    var canvas = $("#bbm")[0];
    
    var maxWidgets = getMaxWidgets(canvas);
        
    if( getActualScenesLength() < maxWidgets ) {
        return false;
    }    
    
    var stack = [];
    var wx = 0;
    var wy = 0;
    var done = false;
    
    // start on scene 1, going down
    var current = scenes[1];
    
    /* direction, widgets don't have an exit at the top
     *   
     * <-- 2 + 0 -->
     *       1
     *       |
     *       V
     */
    var d = 1;
    
    // store on the stack
    stack.push( { "s" : 1, "d" : d } );
    
    var lookup = {
                    "a" : [ 0, 1, 2 ],
                    "b" : [ 2, 1, 0 ],
                    "c" : [ 2, 0, 1 ],
                    "d" : [ 0, 2, 1 ],
                    "e" : [ 1, 0, 2 ],
                    "f" : [ 1, 2, 0 ],
                };
    
    var counter = 0;
    
    while( !done ) {
        if( current !== undefined ) {
            
            var theType = current.getType();        
            // lookup where we move to next
            d = lookup[theType][d];
            
            //update the wx and wy accordingly
            switch(d) {
                case 0:
                    wx = -1;
                    wy = 0;
                    break;
                case 1:
                    wx = 0;
                    wy = 1;
                    break;
                case 2:
                    wx = 1;
                    wy = 0;
                    break;
            }            
            
            var nx = current.x + (wx * BLOCKWIDTH);            
            var ny = current.y + (wy * BLOCKHEIGHT);
            
            if( nx >= canvas.width ) {
                nx = 0;                                            
            }
            if( ny >= canvas.height ) {
                ny = 0;
            }
            if( nx < 0 ) {
                nx = canvas.width - BLOCKWIDTH;
            }
            if( ny < 0 ) {
                ny = canvas.height - BLOCKHEIGHT;                
            }            
            var loc = getIndexLocation( nx, ny, canvas );            
            // check if next location already exists on the stack
            if( checkDuplicateExists(stack, loc, d) ) {
                // so we've either reached the end, or we've hit a node we've visited before                                
                var result = checkStackHasVisitedAllLocations(stack, maxWidgets);
                
                return result;
            }
            
            // store on the stack
            stack.push( { "s" : loc, "d" : d } );
            
            // goto next scene
            current = scenes[loc];
        }
        else
        {
            // bail out, we have an undefined scene
            return false;
        }
        // bail out if too many iterations
        if( counter > (maxWidgets * 3) ) {
            console.log("Abort at " + counter + "(max. " + (( maxWidgets * 3 ) + 1) + ")");
            done = true;
        }
        counter++;
    }
    
    return false;
};

var checkDuplicateExists = function( stack, loc, dir ) {
    for(var i = 0; i < stack.length; i++ ) {
        if( stack[i].s === loc ) {
            if( stack[i].d === dir ) {
                return true;
            }
        }
    }
    return false;
}

var checkStackHasVisitedAllLocations = function(stack, max) {    
    
    // sort the stack on s
    stack.sort( function(a,b) {
        return a.s - b.s;
    });
    
    // loop over sorted scenes, abort if any are missing
    for(var counter = 0; counter < max; counter++ ) {
        var found = false;
        
        for( var i = 0; i < stack.length; i++ ) {
            if( stack[i].s === counter ) {
                found = true;
                break;
            }
        }
        
        // we're missing one, abort
        if( !found ) {            
            return false;
        }
    }
    console.log("Wow, there is a track that traverses all the widgets at least once!");
    return true;
}
