'use strict';

var d = Date;

var getTimeStamp = function() {
    return d.now();
};

var getRandomInt = function(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
};

var getRandomBoolean = function(){
    return Math.random() < 0.5;
};

var colCheck = function(shapeA, shapeB, prevDir) {

    //if ( prevDir ) {
    //    console.log( "PrevDir is: " + prevDir );
   // }

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
                if ( prevDir && prevDir === 'b' ) {
                    shapeB.velY = 0;
                    shapeB.isStoppedY = true;
                }
                else
                {
                    shapeA.y += oY;
                }
            } else {
                colDir = 'b';
                if ( prevDir && prevDir === 't' ) {
                    shapeB.velY = 0;
                    shapeB.isStoppedY = true;
                }
                else
                {
                    shapeA.y -= oY;
                }
            }
        } else {
            if (vX > 0) {
                colDir = 'l';
                if ( prevDir && prevDir === 'r') {
                    shapeB.velX = 0;
                    shapeB.isStoppedX = true;
                }
                else
                {

                    shapeA.x += oX;
                }
            } else {
                colDir = 'r';

                if ( prevDir && prevDir === 'l') {
                    shapeB.velX = 0;
                    shapeB.isStoppedX = true;
                }
                else
                {
                    shapeA.x -= oX;
                }
            }
        }
    }
    return colDir;
};
