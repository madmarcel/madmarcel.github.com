class State {
    constructor(c, imgs) {
        this.config = c;
        this.imgs = imgs;
    }

    init() {}

    render() {}

    update() {}

    finish() {}

    next(name){
        const e = new CustomEvent('ns', { detail: { 'n': name, 'c': this.config, 'i': this.imgs }});
        window.dispatchEvent(e);
    }

    processClick(mx, my) {
        mx = Math.floor(mx);
        my = Math.floor(my);
        this.handleClick(mx, my);
    }

    processMove(mx, my, c) {
        mx = Math.floor(mx);
        my = Math.floor(my);
        this.handleMove(mx, my, c);
    }

    handleMove(mx, my, c) {}

    handleClick(mx, my) {}
}

const WIDTH = 1366;
const HEIGHT = 768;

let rect = (c, col, x, y, w, h) => {
    c.fillStyle = col;
    c.fillRect(x, y, w, h);
};

let fsrect = (c, col) => {
    rect(c, col, 0, 0, WIDTH, HEIGHT);
};

let contains = (xa, ya, xb, yb, w, h) => {
    return xa >= xb && xa <= xb + w &&
           ya >= yb && ya <= yb + h
};

let getIntersectingRectangle = (r1, r2) => {  
    [r1, r2] = [r1, r2].map(r => {
        return {x: [r.x1, r.x2].sort(), y: [r.y1, r.y2].sort()}
    });
  
    const noIntersect = r2.x[0] > r1.x[1] || r2.x[1] < r1.x[0] ||
                        r2.y[0] > r1.y[1] || r2.y[1] < r1.y[0];
  
    return noIntersect ? false : {
        x1: Math.max(r1.x[0], r2.x[0]), // _[0] is the lesser,
        y1: Math.max(r1.y[0], r2.y[0]), // _[1] is the greater
        x2: Math.min(r1.x[1], r2.x[1]),
        y2: Math.min(r1.y[1], r2.y[1])
    }
};

// returns a percentage overlap
let overlaps = (ax, ay, aw, ah, bx, by, bw, bh) => {
    let a = {x1: ax, y1: ay, x2: ax + aw, y2: ay + ah};
    let b = {x1: bx, y1: by, x2: bx + bw, y2: by + bh};
    let r = getIntersectingRectangle(a, b);
    
    if(!r) {
        return 0.0
    } else {
        let bsize = (bw * bh) / 100.0;
        let rsize = Math.abs((r.x2 - r.x1) * (r.y2 - r.y1));
        if(rsize > 0.0 && bsize > 0.0) {
            return rsize / bsize
        }
        return 0.0
    }
};

let text = (c, t, x, y, col, size) => {
    if(size) {
        c.font = 'bold ' + size + 'px Arial';
    }
    c.fillStyle = col;
    c.fillText(t, x, y);
};

let drawImage = (ctx, img, x, y, width, height, deg, flip, flop, center) => {
    ctx.save();

    if(typeof width === "undefined") width = img.width;
    if(typeof height === "undefined") height = img.height;
    if(typeof center === "undefined") center = false;

    // Set rotation point to center of image, instead of top/left
    if(center) {
        x -= width/2;
        y -= height/2;
    }

    // Set the origin to the center of the image
    ctx.translate(x + width/2, y + height/2);

    // Rotate the canvas around the origin
    const rad = 2 * Math.PI - deg * Math.PI / 180;
    ctx.rotate(rad);

    let flipScale = 0;
    let flopScale = 0;

    // Flip/flop the canvas
    if(flip) {
        flipScale = -1; 
    } else {
        flipScale = 1;
    }
    if(flop) {
        flopScale = -1;
    } else {
         flopScale = 1;
    }
    ctx.scale(flipScale, flopScale);

    // Draw the image
    ctx.drawImage(img, -width/2, -height/2, width, height);
    ctx.restore();
};

let timestamp = () => {
    return new Date().getTime()
};

let randomint = (min, max) => {
    return Math.floor(Math.random() * (max - min + 1)) + min;
};

let colours = [];

let ctx = null;

const rad = (d) => {
    return (Math.PI/180)*d;
};

const r = {
    // colour
    'k': (l) => {
        ctx.fillStyle = colours[l[0]];
        ctx.strokeStyle = colours[l[0]];
    },
    // filled rectangle
    'b': (l) => {
        ctx.fillRect(l[0], l[1], l[2], l[3]);
    },
    // line
    'd': (l) => {
        ctx.beginPath();
        ctx.moveTo(l[0],l[1]);
        ctx.lineTo(l[2],l[3]);
        ctx.stroke();
    },
    // filled polygon
    'f': (l) => {
        ctx.beginPath();
        ctx.moveTo(l[0],l[1]);
        for(let i = 2; i < l.length; i += 2) {
            ctx.lineTo(l[i], l[i + 1]);
        }
        ctx.fill();
    },
    // filled circle
    'i': (l) => {
        ctx.beginPath();
        ctx.arc(l[0], l[1], l[2], 0, rad(360), 0);
        ctx.fill();
    },
    // filled rounded rect
    'n': (l) => {
        roundRect(l[0], l[1], l[2], l[3], l[4], true);
    }, 
    // line width
    'o': (l) => {
        ctx.lineWidth = l[0];
    },
    // filled arc
    'a': (l) => {
        ctx.beginPath();
        ctx.arc(l[0], l[1], l[2], rad(l[3]), rad(l[4]), true);
        ctx.fill();
    },
    // NOT USING THESE
    /*
    z: (l) => {
        ctx.globalAlpha = l[0];
    },
    // stroke rectangle
    a: (l) => {
        ctx.strokeRect(l[0], l[1], l[2], l[3]);
    },
    // clear rectangle
    c: (l) => {
        ctx.clearRect(l[0], l[1], l[2], l[3]);
    },
    // stroke polygon
    e: (l) => {
        ctx.beginPath();
        ctx.moveTo(l[0],l[1]);
        for(let i = 2; i < l.length; i += 2) {
            ctx.lineTo(l[i], l[i + 1]);
        }
        ctx.closePath();
        ctx.stroke();
    },
    // text
    g: (l) => {
        ctx.font = l[0] + 'px ' + fonts[l[1]];
        ctx.fillText(texts(l[2]),l[3],l[4]);
    },
    // stroke circle
    h: (l) => {
        ctx.beginPath();
        ctx.arc(l[0], l[1], l[2], 0, rad(360), 0);
        ctx.stroke();
    },
    // stroke rounded rect
    m: (l) => {
        roundRect(l[0], l[1], l[2], l[3], l[4], false);
    },
    */
};

// rounded rectangle
const roundRect = (x, y, w, h, r, f) => {
    let z = {tl: r, tr: r, br: r, bl: r};
    ctx.beginPath();
    ctx.moveTo(x + z.tl, y);
    ctx.lineTo(x + w - z.tr, y);
    ctx.quadraticCurveTo(x + w, y, x + w, y + z.tr);
    ctx.lineTo(x + w, y + h - z.br);
    ctx.quadraticCurveTo(x + w, y + h, x + w - z.br, y + h);
    ctx.lineTo(x + z.bl, y + h);
    ctx.quadraticCurveTo(x, y + h, x, y + h - z.bl);
    ctx.lineTo(x, y + z.tl);
    ctx.quadraticCurveTo(x, y, x + z.tl, y);
    ctx.closePath();
    if (f) {
        ctx.fill();
    } else {
        ctx.stroke();
    }
};

const setPalette = (c) => {
    colours = c;
};

const processCommands = (commands, flag, inc) => {
    for(let i = 0; i < commands.length; i++){
        let c = commands[i];
        let l = c.split(',');
        const f = l.shift();
        if(f === 'x') {
            if(parseInt(l[0]) > 0) {
                // sub process, outline in black
                processCommands([].concat(commands.slice(i + 1)), true, parseInt(l[0]));
            } else {
                // it's an x 0, bail out
                if(flag) {
                    return;
                }
            }
            // always skip the x commands
            continue;
        }
        // params
        let p = l.map(Number);
        // this generates the black outline
        if(flag && inc > 0) {
            switch(f) {
                case 'k':
                    p[0] = 0;
                break;
                case 'n':
                case 'b':
                    p[0] -= inc;
                    p[1] -= inc;
                    p[2] += inc * 2;
                    p[3] += inc * 2;
                break;
                case 'a':
                case 'i':
                    p[2] += inc;
                break;

            }
        }
        //console.log(f, l[0]);
        // there's a good chance you could replace a big chunk
        // of this file by using this:
        // let path = new Path2D('m100,100v50h50v-50')
        // ctx.stroke(path)
        //
        r[f](p);
    }
};


const vgrender = (newctx, data) => {
    //console.log('[' + data + ']');
    let commands = data.split(/([a-z]\,[\d+\,*]+)/).filter(s => s !== '');
    //console.log(commands);
    if(!commands) return
    ctx = newctx;
    ctx.lineWidth = 1;
    processCommands(commands, false, 0);
    return ctx
};

// this is all the mini-svg data
// format is: 
// w, h, data
const data = [
    /** -------------------------------
     * 
     *     Hans the Giant
     * 
     * -------------------------------- */
    // open eye
    80,80,'x,2k,2i,41,41,37x,0', 
    // closed eye
    80,80,'x,2k,3i,41,41,37x,0k,0o,2d,4,46,78,26d,8,46,78,41d,6,48,79,55',
    // fist
    272,175,'x,2k,3i,33,50,28n,4,44,54,122,20x,0k,2i,32,45,23k,3i,33,55,28k,6n,40,19,54,151,20x,2k,3i,74,40,32n,45,45,54,122,20x,0k,2i,73,38,29k,3i,72,43,29k,6n,89,17,54,151,20x,2k,3i,126,38,33n,94,37,62,129,20x,0k,2i,128,37,31k,3i,127,45,34k,6n,145,30,53,137,20x,2k,3n,156,27,91,124,20x,0x,2k,3i,183,41,30n,151,32,64,136,20x,0k,2i,184,41,29k,3i,183,48,31k,6i,215,107,33n,207,73,53,68,20x,2k,3i,220,103,33n,216,69,53,68,20x,0',
    // nose 1
    155,135,'k,4i,124,103,31i,76,106,31i,32,102,31x,2k,4i,122,91,31i,34,91,31x,0x,2k,6i,75,57,54i,75,99,27x,0k,2i,50,35,14',
    // head 1
    455,470,'x,2k,3i,52,216,50k,4i,48,219,45i,62,276,27x,0k,7n,67,151,108,156,20x,2k,3i,403,215,50k,4i,408,219,45i,396,275,27x,0k,7n,288,149,108,156,20x,2k,3i,200,434,32i,248,435,32i,230,160,157n,73,88,317,344,20x,0k,6i,360,322,5i,326,291,5i,356,267,5i,116,283,5k,7i,303,211,43i,145,214,43k,2i,173,48,22',
    // body
    570,500,'x,2k,11n,2,3,566,495,20k,9n,2,10,565,487,20x,0k,0o,2d,277,130,277,516k,10o,3d,279,124,280,522i,467,158,15i,484,234,29i,469,207,16i,428,310,7k,10i,281,167,28i,285,256,28i,285,350,28k,1f,152,51,282,166,441,40k,2f,164,53,282,160,426,44o,2k,0d,163,62,283,168d,436,45,280,169x,2k,14i,277,163,26k,13i,278,165,24x,0k,2i,265,147,3x,2k,14i,283,253,26k,13i,283,255,24x,0k,2i,274,236,3x,2k,14i,283,347,26k,13i,284,349,24x,0k,2i,272,330,3',
    // eyebrow
    105,40,'x,2k,5n,2,3,97,32,20x,0',
    // hair 1
    40,105,'x,2k,5n,2,2,36,97,20x,0',
    // pupil 1 green
    43,43,'k,8i,21,22,21k,0i,21,22,11k,2i,29,15,5',
    // mouth grr
    208,63,'x,2k,2n,2,2,203,53,20x,0o,2k,0d,188,247,395,247d,0,26,206,26',
    // mouth open/ouch
    10,10,'x,2k,2n,2,2,203,53,20x,0o,2k,0d,188,247,395,247d,0,26,206,26',
    // mouth hmm
    10,10,'x,2k,2n,2,2,203,53,20x,0o,2k,0d,188,247,395,247d,0,26,206,26',
    
    // chewing cheeks
    10,10,'x,2k,2n,2,2,203,53,20x,0o,2k,0d,188,247,395,247d,0,26,206,26',

    /** -------------------------------
     * 
     *     Misc
     * 
     * -------------------------------- */
    // glass of beer - upright
    320,445,'x,2k,2n,209,321,102,42,20n,210,123,102,42,20n,269,125,46,237,20x,0x,2k,2n,44,389,200,52,20k,0f,63,395,73,372,28,111,256,107,220,366,227,399k,2f,61,403,75,373,30,112,253,110,218,364,227,399x,0b,36,79,215,39k,13i,145,344,63i,141,123,91f,82,346,49,122,234,118,208,350k,2i,139,280,8i,114,205,5i,127,186,4i,118,151,3f,88,275,103,330,95,272,70,106,63,107f,182,340,163,389,195,348,226,110,198,103f,49,123,128,100,239,124,235,79,44,78x,2k,2i,48,108,29i,26,94,19i,76,83,19i,44,72,19i,72,59,19i,111,55,37i,123,93,19i,123,119,11i,153,65,25i,190,67,25i,220,80,19i,244,105,18i,242,79,18i,226,53,18i,202,35,18i,168,31,24i,135,32,24i,82,43,24i,55,52,24x,0',
    // glass of beer - drinking
    280,330,'x,2k,2i,30,54,23i,60,43,23i,93,31,23i,136,26,23i,156,49,23i,118,46,23i,171,71,23i,26,79,23x,0x,2k,2i,100,129,93x,0k,2f,9,137,24,261,179,260,193,137k,0o,2d,6,137,27,265d,194,138,176,264k,14i,99,129,76f,24,139,42,268,160,268,173,138k,2i,93,84,5i,117,119,5i,80,136,8x,2k,2n,177,98,95,39,20x,0x,2k,2n,236,98,39,118,20x,0x,2k,2n,174,182,102,39,20x,0x,2k,2i,99,233,96x,0k,14i,100,232,79k,13a,101,234,78,180,0k,2i,65,277,7i,114,255,4i,107,283,4',
    // glass empty
    320,445,'x,2k,2n,209,321,102,42,20n,210,123,102,42,20n,269,125,46,237,20x,0x,2k,2n,44,389,200,52,20k,0f,63,395,73,372,28,111,256,107,220,366,227,399k,2b,31,79,222,37f,61,403,75,373,30,112,254,108,218,364,227,399x,0b,36,79,215,39k,15i,145,344,63f,82,346,40,96,243,96,208,350k,2f,182,340,163,389,195,348,231,91,198,91',

    /** -------------------------------
     * 
     *     Level data
     * 
     * -------------------------------- */
     // cloud
     320,225,'k,2i,148,62,50i,217,52,50i,270,95,50i,234,159,50i,146,159,65i,59,149,53i,106,97,53i,197,107,53',
     // tree
     153,473,'x,2k,24b,56,277,28,194x,0x,2k,25i,91,254,53i,98,183,53i,94,119,53i,85,60,35i,66,24,22i,58,275,51i,54,207,51i,56,129,51i,56,70,36x,0k,26i,88,256,53i,61,273,53i,56,208,53i,59,129,53i,89,121,53i,94,184,53i,86,60,30i,64,26,21i,53,69,33',
     // ground block
     100,104,'k,18b,0,4,100,100k,19i,25,55,5i,17,71,2i,45,46,5i,71,77,3i,46,73,5i,92,64,2i,76,51,2k,20b,0,4,100,13k,0b,0,0,100,12k,22b,0,2,100,8k,23b,0,2,100,3',
     // van
     220,105,'x,2k,2n,4,2,180,3,2k,29n,37,99,119,4,2k,28n,5,7,179,91,5f,185,6,167,98,205,98,206,59x,0k,27b,5,54,200,9k,0o,2d,205,60,184,3d,207,57,207,93x,2k,2i,201,62,6k,29n,187,77,20,24,5n,2,77,13,23,5k,17n,4,58,11,13,5x,0k,14n,12,12,104,38,5x,2k,29a,153,98,24,0,180a,45,98,24,0,180k,16n,130,12,45,36,5x,0k,0f,180,51,179,8,195,49k,16f,181,48,180,10,194,48k,0o,2d,195,51,180,9',
     // van wheel
     44,44,'k,0i,22,22,22k,12i,23,22,10k,21i,23,6,3',
     // grass
     30,40,'k,8f,2,3,1,37,14,33f,16,1,8,37,19,33f,28,6,13,34,25,34k,0o,2d,2,3,11,23d,2,3,1,40d,16,0,10,25d,16,0,19,26d,28,3,19,26d,28,3,26,37',
     // house
     255,375,'x,2k,17n,2,2,251,98,20k,2b,2,15,251,272k,21b,2,269,251,100x,0x,2k,19n,19,150,61,109,10x,2k,12i,69,212,3k,16n,97,149,143,58,10n,97,42,60,58,10n,19,42,60,58,10n,97,41,60,58,10n,180,41,60,58,10k,1b,14,257,70,10x,0k,21b,1,15,252,5k,15b,108,149,12,58b,188,42,12,56b,106,42,12,58b,27,42,12,58k,3b,11,2,233,3k,0o,2d,1,14,254,14'
];

const palette = [
    '#000',
    '#ccc',
    '#fff',
    '#ffd5d5', // pink skin,
    '#faa', // dark pink skin
    '#c83737', // hair - alts for these: 
    '#ff9191', // nose,
    '#ff8080', // hands,
    '#080',    // eyes / plants - alt: 8c83ff
    '#a6cda6', // body
    '#85ba85', // stains
    '#e6f1e6', // shoulders,
    '#fd5', // ring
    '#ffe381', // button / beer
    '#fff6d5', // button highlight / beer
    '#d5f6ff', // empty glass
    '#aef', // window blue
    '#ff2a2a', // red
    '#830', // brown door/ground
    '#a40', // brown highlight
    '#520', // brown shadow
    '#666',    // dark gray
    '#59eb59', // ground grass
    '#a2f4a2', // ground grass highlight
    '#d38d5f', // tree trunk
    '#abc837', // tree highlight
    '#677821', // tree green
    '#3c3cff', // tractor/van
    '#f60'   , // orange
    '#4d4d4d', // dark dark gray
    '#009a9a', // bg trees 1
    '#00cbcb', // bg trees 2
];

class LoadingState extends State {
    constructor(c) {
        super(c, []);
        this.progress = 0;
        this.imgs = [];
    }

    init() {
        setPalette(palette);

        let d = data;
        let inc = 100.0 / (d.length / 3);
        for(let i = 0; i < d.length; i += 3) {
            let w = d[i];
            let h = d[i + 1];
            let r = d[i + 2];

            let [img, cv] = this.createCanvas(w,h);
            vgrender(img, r);
            this.imgs.push(cv);
            this.progress += inc;
        }

        // we also need to generate some background tree blobs
        let i = 17 * 3;
        let w = data[i];
        let h = data[i + 1];
        let r = data[i + 2];

        // lazy solution, we just wreck our entire pallete.
        // no extra code required in mv.js this way
        // grab a copy of this colour before we overwrite it ;)
        let col = palette[30];
        this.config.tree1 = this.singleColourSprite(palette[31], r, w, h);
        this.config.tree2 = this.singleColourSprite(col, r, w, h);
        
        // and then draw the tree five times or so
        this.config.tree1 = this.genBGTile(this.config.tree1);
        this.config.tree2 = this.genBGTile(this.config.tree2);

        this.next('titl');
    }

    singleColourSprite(colour, r, w, h) {
        setPalette(this.overrideColour(palette, colour));
        let [img, cv] = this.createCanvas(w,h);
        vgrender(img, r);
        return cv
    }

    genBGTile(tree) {
        let [img, cv] = this.createCanvas(76*5, 300);
        for(let b = 0; b < 4; b++) {
            for(let a = 0; a < 6; a++) {
                let r = randomint(0,50);
                drawImage(img, tree, a * 60, (b * 50) + r, 76, 236);
            }
        }
        return cv
    }

    overrideColour(list, value) {
        for(let i = 0; i < list.length; i++) {
            list[i] = value;
        }
        return list
    }

    createCanvas(w,h) {
        let bf = document.createElement('canvas');
        bf.width = w;
        bf.height = h;
        let bc = bf.getContext('2d');
        // Don't you dare AntiAlias the pixelart!
        // bc.imageSmoothingEnabled = bc.mozImageSmoothingEnabled = bc.webkitImageSmoothingEnabled = false

        // we need both. We draw our stuff on the 2d context for this canvas,
        // and in turn we pass the canvas element when we want to draw our stuff on another canvas
        return [bc, bf]
    }

    render(ctx) {
        fsrect(ctx, '#892ca0');
        text(ctx, `Loading -- ${Math.round(this.progress)}%`, 1366/2 - 120, 768/2, '#fff', 32);

        //let c = 0
        //this.config.imgs.forEach(i => {
            //ctx.drawImage(i, c, 0)
            //c += 100
        //})
    }
}

/**
 * SfxrParams
 *
 * Copyright 2010 Thomas Vian
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 * @author Thomas Vian
 */
/** @constructor */

let jsfxr = {};

function SfxrParams() {
    //--------------------------------------------------------------------------
    //
    //  Settings String Methods
    //
    //--------------------------------------------------------------------------
  
    /**
     * Parses a settings array into the parameters
     * @param array Array of the settings values, where elements 0 - 23 are
     *                a: waveType
     *                b: attackTime
     *                c: sustainTime
     *                d: sustainPunch
     *                e: decayTime
     *                f: startFrequency
     *                g: minFrequency
     *                h: slide
     *                i: deltaSlide
     *                j: vibratoDepth
     *                k: vibratoSpeed
     *                l: changeAmount
     *                m: changeSpeed
     *                n: squareDuty
     *                o: dutySweep
     *                p: repeatSpeed
     *                q: phaserOffset
     *                r: phaserSweep
     *                s: lpFilterCutoff
     *                t: lpFilterCutoffSweep
     *                u: lpFilterResonance
     *                v: hpFilterCutoff
     *                w: hpFilterCutoffSweep
     *                x: masterVolume
     * @return If the string successfully parsed
     */
    this.setSettings = function(values)
    {
      for ( var i = 0; i < 24; i++ )
      {
        this[String.fromCharCode( 97 + i )] = values[i] || 0;
      }
  
      // I moved this here from the reset(true) function
      if (this['c'] < .01) {
        this['c'] = .01;
      }
  
      var totalTime = this['b'] + this['c'] + this['e'];
      if (totalTime < .18) {
        var multiplier = .18 / totalTime;
        this['b']  *= multiplier;
        this['c'] *= multiplier;
        this['e']   *= multiplier;
      }
    };
  }
  
  /**
   * SfxrSynth
   *
   * Copyright 2010 Thomas Vian
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   *
   * @author Thomas Vian
   */
  /** @constructor */
  function SfxrSynth() {
    // All variables are kept alive through function closures
  
    //--------------------------------------------------------------------------
    //
    //  Sound Parameters
    //
    //--------------------------------------------------------------------------
  
    this._params = new SfxrParams();  // Params instance
  
    //--------------------------------------------------------------------------
    //
    //  Synth Variables
    //
    //--------------------------------------------------------------------------
  
    var _envelopeLength0, // Length of the attack stage
        _envelopeLength1, // Length of the sustain stage
        _envelopeLength2, // Length of the decay stage
  
        _period,          // Period of the wave
        _maxPeriod,       // Maximum period before sound stops (from minFrequency)
  
        _slide,           // Note slide
        _deltaSlide,      // Change in slide
  
        _changeAmount,    // Amount to change the note by
        _changeTime,      // Counter for the note change
        _changeLimit,     // Once the time reaches this limit, the note changes
  
        _squareDuty,      // Offset of center switching point in the square wave
        _dutySweep;       // Amount to change the duty by
  
    //--------------------------------------------------------------------------
    //
    //  Synth Methods
    //
    //--------------------------------------------------------------------------
  
    /**
     * Resets the runing variables from the params
     * Used once at the start (total reset) and for the repeat effect (partial reset)
     */
    this.reset = function() {
      // Shorter reference
      var p = this._params;
  
      _period       = 100 / (p['f'] * p['f'] + .001);
      _maxPeriod    = 100 / (p['g']   * p['g']   + .001);
  
      _slide        = 1 - p['h'] * p['h'] * p['h'] * .01;
      _deltaSlide   = -p['i'] * p['i'] * p['i'] * .000001;
  
      if (!p['a']) {
        _squareDuty = .5 - p['n'] / 2;
        _dutySweep  = -p['o'] * .00005;
      }
  
      _changeAmount =  1 + p['l'] * p['l'] * (p['l'] > 0 ? -.9 : 10);
      _changeTime   = 0;
      _changeLimit  = p['m'] == 1 ? 0 : (1 - p['m']) * (1 - p['m']) * 20000 + 32;
    };
  
    // I split the reset() function into two functions for better readability
    this.totalReset = function() {
      this.reset();
  
      // Shorter reference
      var p = this._params;
  
      // Calculating the length is all that remained here, everything else moved somewhere
      _envelopeLength0 = p['b']  * p['b']  * 100000;
      _envelopeLength1 = p['c'] * p['c'] * 100000;
      _envelopeLength2 = p['e']   * p['e']   * 100000 + 12;
      // Full length of the volume envelop (and therefore sound)
      // Make sure the length can be divided by 3 so we will not need the padding "==" after base64 encode
      return ((_envelopeLength0 + _envelopeLength1 + _envelopeLength2) / 3 | 0) * 3;
    };
  
    /**
     * Writes the wave to the supplied buffer ByteArray
     * @param buffer A ByteArray to write the wave to
     * @return If the wave is finished
     */
    this.synthWave = function(buffer, length) {
      // Shorter reference
      var p = this._params;
  
      // If the filters are active
      var _filters = p['s'] != 1 || p['v'],
          // Cutoff multiplier which adjusts the amount the wave position can move
          _hpFilterCutoff = p['v'] * p['v'] * .1,
          // Speed of the high-pass cutoff multiplier
          _hpFilterDeltaCutoff = 1 + p['w'] * .0003,
          // Cutoff multiplier which adjusts the amount the wave position can move
          _lpFilterCutoff = p['s'] * p['s'] * p['s'] * .1,
          // Speed of the low-pass cutoff multiplier
          _lpFilterDeltaCutoff = 1 + p['t'] * .0001,
          // If the low pass filter is active
          _lpFilterOn = p['s'] != 1,
          // masterVolume * masterVolume (for quick calculations)
          _masterVolume = p['x'] * p['x'],
          // Minimum frequency before stopping
          _minFreqency = p['g'],
          // If the phaser is active
          _phaser = p['q'] || p['r'],
          // Change in phase offset
          _phaserDeltaOffset = p['r'] * p['r'] * p['r'] * .2,
          // Phase offset for phaser effect
          _phaserOffset = p['q'] * p['q'] * (p['q'] < 0 ? -1020 : 1020),
          // Once the time reaches this limit, some of the    iables are reset
          _repeatLimit = p['p'] ? ((1 - p['p']) * (1 - p['p']) * 20000 | 0) + 32 : 0,
          // The punch factor (louder at begining of sustain)
          _sustainPunch = p['d'],
          // Amount to change the period of the wave by at the peak of the vibrato wave
          _vibratoAmplitude = p['j'] / 2,
          // Speed at which the vibrato phase moves
          _vibratoSpeed = p['k'] * p['k'] * .01,
          // The type of wave to generate
          _waveType = p['a'];
  
      var _envelopeLength      = _envelopeLength0,     // Length of the current envelope stage
          _envelopeOverLength0 = 1 / _envelopeLength0, // (for quick calculations)
          _envelopeOverLength1 = 1 / _envelopeLength1, // (for quick calculations)
          _envelopeOverLength2 = 1 / _envelopeLength2; // (for quick calculations)
  
      // Damping muliplier which restricts how fast the wave position can move
      var _lpFilterDamping = 5 / (1 + p['u'] * p['u'] * 20) * (.01 + _lpFilterCutoff);
      if (_lpFilterDamping > .8) {
        _lpFilterDamping = .8;
      }
      _lpFilterDamping = 1 - _lpFilterDamping;
  
      var _finished = false,     // If the sound has finished
          _envelopeStage    = 0, // Current stage of the envelope (attack, sustain, decay, end)
          _envelopeTime     = 0, // Current time through current enelope stage
          _envelopeVolume   = 0, // Current volume of the envelope
          _hpFilterPos      = 0, // Adjusted wave position after high-pass filter
          _lpFilterDeltaPos = 0, // Change in low-pass wave position, as allowed by the cutoff and damping
          _lpFilterOldPos,       // Previous low-pass wave position
          _lpFilterPos      = 0, // Adjusted wave position after low-pass filter
          _periodTemp,           // Period modified by vibrato
          _phase            = 0, // Phase through the wave
          _phaserInt,            // Integer phaser offset, for bit maths
          _phaserPos        = 0, // Position through the phaser buffer
          _pos,                  // Phase expresed as a Number from 0-1, used for fast sin approx
          _repeatTime       = 0, // Counter for the repeats
          _sample,               // Sub-sample calculated 8 times per actual sample, averaged out to get the super sample
          _superSample,          // Actual sample writen to the wave
          _vibratoPhase     = 0; // Phase through the vibrato sine wave
  
      // Buffer of wave values used to create the out of phase second wave
      var _phaserBuffer = new Array(1024),
          // Buffer of random values used to generate noise
          _noiseBuffer  = new Array(32);
      for (var i = _phaserBuffer.length; i--; ) {
        _phaserBuffer[i] = 0;
      }
      for (var i = _noiseBuffer.length; i--; ) {
        _noiseBuffer[i] = Math.random() * 2 - 1;
      }
  
      for (var i = 0; i < length; i++) {
        if (_finished) {
          return i;
        }
  
        // Repeats every _repeatLimit times, partially resetting the sound parameters
        if (_repeatLimit) {
          if (++_repeatTime >= _repeatLimit) {
            _repeatTime = 0;
            this.reset();
          }
        }
  
        // If _changeLimit is reached, shifts the pitch
        if (_changeLimit) {
          if (++_changeTime >= _changeLimit) {
            _changeLimit = 0;
            _period *= _changeAmount;
          }
        }
  
        // Acccelerate and apply slide
        _slide += _deltaSlide;
        _period *= _slide;
  
        // Checks for frequency getting too low, and stops the sound if a minFrequency was set
        if (_period > _maxPeriod) {
          _period = _maxPeriod;
          if (_minFreqency > 0) {
            _finished = true;
          }
        }
  
        _periodTemp = _period;
  
        // Applies the vibrato effect
        if (_vibratoAmplitude > 0) {
          _vibratoPhase += _vibratoSpeed;
          _periodTemp *= 1 + Math.sin(_vibratoPhase) * _vibratoAmplitude;
        }
  
        _periodTemp |= 0;
        if (_periodTemp < 8) {
          _periodTemp = 8;
        }
  
        // Sweeps the square duty
        if (!_waveType) {
          _squareDuty += _dutySweep;
          if (_squareDuty < 0) {
            _squareDuty = 0;
          } else if (_squareDuty > .5) {
            _squareDuty = .5;
          }
        }
  
        // Moves through the different stages of the volume envelope
        if (++_envelopeTime > _envelopeLength) {
          _envelopeTime = 0;
  
          switch (++_envelopeStage)  {
            case 1:
              _envelopeLength = _envelopeLength1;
              break;
            case 2:
              _envelopeLength = _envelopeLength2;
          }
        }
  
        // Sets the volume based on the position in the envelope
        switch (_envelopeStage) {
          case 0:
            _envelopeVolume = _envelopeTime * _envelopeOverLength0;
            break;
          case 1:
            _envelopeVolume = 1 + (1 - _envelopeTime * _envelopeOverLength1) * 2 * _sustainPunch;
            break;
          case 2:
            _envelopeVolume = 1 - _envelopeTime * _envelopeOverLength2;
            break;
          case 3:
            _envelopeVolume = 0;
            _finished = true;
        }
  
        // Moves the phaser offset
        if (_phaser) {
          _phaserOffset += _phaserDeltaOffset;
          _phaserInt = _phaserOffset | 0;
          if (_phaserInt < 0) {
            _phaserInt = -_phaserInt;
          } else if (_phaserInt > 1023) {
            _phaserInt = 1023;
          }
        }
  
        // Moves the high-pass filter cutoff
        if (_filters && _hpFilterDeltaCutoff) {
          _hpFilterCutoff *= _hpFilterDeltaCutoff;
          if (_hpFilterCutoff < .00001) {
            _hpFilterCutoff = .00001;
          } else if (_hpFilterCutoff > .1) {
            _hpFilterCutoff = .1;
          }
        }
  
        _superSample = 0;
        for (var j = 8; j--; ) {
          // Cycles through the period
          _phase++;
          if (_phase >= _periodTemp) {
            _phase %= _periodTemp;
  
            // Generates new random noise for this period
            if (_waveType == 3) {
              for (var n = _noiseBuffer.length; n--; ) {
                _noiseBuffer[n] = Math.random() * 2 - 1;
              }
            }
          }
  
          // Gets the sample from the oscillator
          switch (_waveType) {
            case 0: // Square wave
              _sample = ((_phase / _periodTemp) < _squareDuty) ? .5 : -.5;
              break;
            case 1: // Saw wave
              _sample = 1 - _phase / _periodTemp * 2;
              break;
            case 2: // Sine wave (fast and accurate approx)
              _pos = _phase / _periodTemp;
              _pos = (_pos > .5 ? _pos - 1 : _pos) * 6.28318531;
              _sample = 1.27323954 * _pos + .405284735 * _pos * _pos * (_pos < 0 ? 1 : -1);
              _sample = .225 * ((_sample < 0 ? -1 : 1) * _sample * _sample  - _sample) + _sample;
              break;
            case 3: // Noise
              _sample = _noiseBuffer[Math.abs(_phase * 32 / _periodTemp | 0)];
          }
  
          // Applies the low and high pass filters
          if (_filters) {
            _lpFilterOldPos = _lpFilterPos;
            _lpFilterCutoff *= _lpFilterDeltaCutoff;
            if (_lpFilterCutoff < 0) {
              _lpFilterCutoff = 0;
            } else if (_lpFilterCutoff > .1) {
              _lpFilterCutoff = .1;
            }
  
            if (_lpFilterOn) {
              _lpFilterDeltaPos += (_sample - _lpFilterPos) * _lpFilterCutoff;
              _lpFilterDeltaPos *= _lpFilterDamping;
            } else {
              _lpFilterPos = _sample;
              _lpFilterDeltaPos = 0;
            }
  
            _lpFilterPos += _lpFilterDeltaPos;
  
            _hpFilterPos += _lpFilterPos - _lpFilterOldPos;
            _hpFilterPos *= 1 - _hpFilterCutoff;
            _sample = _hpFilterPos;
          }
  
          // Applies the phaser effect
          if (_phaser) {
            _phaserBuffer[_phaserPos % 1024] = _sample;
            _sample += _phaserBuffer[(_phaserPos - _phaserInt + 1024) % 1024];
            _phaserPos++;
          }
  
          _superSample += _sample;
        }
  
        // Averages out the super samples and applies volumes
        _superSample *= .125 * _envelopeVolume * _masterVolume;
  
        // Clipping if too loud
        buffer[i] = _superSample >= 1 ? 32767 : _superSample <= -1 ? -32768 : _superSample * 32767 | 0;
      }
  
      return length;
    };
  }
  
  // Adapted from http://codebase.es/riffwave/
  var synth = new SfxrSynth();
  // Export for the Closure Compiler
  jsfxr = function(settings) {
    // Initialize SfxrParams
    synth._params.setSettings(settings);
    // Synthesize Wave
    var envelopeFullLength = synth.totalReset();
    var data = new Uint8Array(((envelopeFullLength + 1) / 2 | 0) * 4 + 44);
    var used = synth.synthWave(new Uint16Array(data.buffer, 44), envelopeFullLength) * 2;
    var dv = new Uint32Array(data.buffer, 0, 44);
    // Initialize header
    dv[0] = 0x46464952; // "RIFF"
    dv[1] = used + 36;  // put total size here
    dv[2] = 0x45564157; // "WAVE"
    dv[3] = 0x20746D66; // "fmt "
    dv[4] = 0x00000010; // size of the following
    dv[5] = 0x00010001; // Mono: 1 channel, PCM format
    dv[6] = 0x0000AC44; // 44,100 samples per second
    dv[7] = 0x00015888; // byte rate: two bytes per sample
    dv[8] = 0x00100002; // 16 bits per sample, aligned on every two bytes
    dv[9] = 0x61746164; // "data"
    dv[10] = used;      // put number of samples here
  
    // Base64 encoding written by me, @maettig
    used += 44;
    var i = 0,
        base64Characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/',
        output = 'data:audio/wav;base64,';
    for (; i < used; i += 3)
    {
      var a = data[i] << 16 | data[i + 1] << 8 | data[i + 2];
      output += base64Characters[a >> 18] + base64Characters[a >> 12 & 63] + base64Characters[a >> 6 & 63] + base64Characters[a & 63];
    }
    return output;
  };

const sounds = [
    // blip
    [0,,0.1344,,0.195,0.4999,,,,,,,,0.4824,,,,,1,,,0.1,,0.5],
    
    // beep beep
    [0,,0.654,0.3615,0.7695,0.2925,,-0.015,,,,0.046,,0.223,0.539,,-0.3229,,1,,,,0.2159,0.5],
    
    // thump
    [3,,0.3696,0.2535,0.4037,0.0999,,-0.0134,,,,,,,,0.4544,0.2196,-0.1392,1,,,,,0.5],
    [3,,0.2579,0.3189,0.3249,0.0597,,0.1712,,,,-0.2342,0.6582,,,0.4716,-0.2343,-0.1203,1,,,,,0.5],
    [3,,0.3455,0.514,0.3441,0.1119,,0.0362,,,,,,,,,,,1,,,,,0.5],

    // drink
    [0,,0.3403,,0.3456,0.25,,0.0916,,,,,,0.137,,,,,1,,,,,0.5],
    [0,,0.3403,,0.3184,0.2172,0.0192,0.0916,,,,0.0409,0.0441,0.1705,0.01,0.0017,-0.0489,,1,-0.0258,0.0765,,,0.5]
];

let playsound = (index) => {
    const player = new Audio();
    player.src = jsfxr(sounds[index]);
    player.play();
};

class Button {
    constructor(x, y, width, height, text$$1, bgcolour, hcolour, colour, fontSize, margin) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.text = text$$1;
        this.bgcolour = bgcolour;
        this.colour = colour;
        this.fontSize = fontSize;
        this.margin = margin;
        this.hcolour = hcolour;
        this.highlight = false;
        this.enabled = true;
    }

    render(ctx) {
        //draw bg box
        if(this.bgcolour) {
            if(this.highlight) { ctx.fillStyle = this.hcolour; } else { ctx.fillStyle = this.bgcolour; }
            ctx.fillRect(this.x, this.y, this.width, this.height);
        }
        if(this.fontSize) {
            ctx.font = 'bold ' + this.fontSize + 'px Arial';
        }
        ctx.fillStyle = this.colour;
        ctx.textBaseline = "hanging";
        ctx.fillText(this.text, this.x + this.margin, this.y + this.margin, this.width);
    }

    hover(mx, my, c) {
        if(this.enabled && contains(mx, my, this.x, this.y, this.width, this.height)) {
            this.highlight = true;
            c.style.cursor = 'pointer';
        } else {
            this.highlight = false;
            c.style.cursor = 'default';
        }
        return this.highlight
    }

    click(mx, my) {
        if(this.enabled && contains(mx, my, this.x, this.y, this.width, this.height)) {
            playsound(0);
            this.action();
        }
    }

    action() {}
}

class TitleState extends State {
    constructor(c, i) {
        super(c, i);

        let actions = {
            'Story': 'play',
            'Start': 'play',
            'Controls': 'play'
        };

        this.buttons = [];

        let count = 0;

        Object.keys(actions).forEach(key => {
            let a = actions[key];
            let button = new Button(1366/2 - 60, 500 + count * 60, 120, 40, key, 'black', 'red', 'white', 24, 10);
            button.action = () => {
                this.next(a);
            };
            this.buttons.push(button);
            count++;
        });
    }

    render(ctx) {
        this.buttons.forEach(b => {
            b.render(ctx);
        });
    }

    update() {
        
    }

    handleMove(mx, my, c) {
        for(let i = 0; i < this.buttons.length; i++) {
            if(this.buttons[i].hover(mx, my, c)) {
                break
            }
        }
    }

    handleClick(mx, my) {
        this.buttons.forEach(b => {
            b.click(mx, my);
        });
    }
}

class Head {
    constructor(x,y,c) {
        this.x = x;
        this.y = y;
        this.c = c;

        this.busy = false;
        this.eyesclosed = false;

        this.eyes = {
            x: this.x + 128,
            y: this.y + 187,
            moving: false,
            tx: this.x + 128,
            ty: this.y + 187,
            timer: timestamp()
        };
    }

    render(c) {
        // head
        c.drawImage(this.c[4], this.x, this.y);
        // eyes
        
        if(!this.eyesclosed) {
            // left
            c.drawImage(this.c[0], this.x + 108, this.y + 167);
            // pupil
            c.drawImage(this.c[8], this.eyes.x, this.eyes.y);
        } else {
            drawImage(c, this.c[1], this.x + 108, this.y + 167, this.c[1].height, this.c[1].width, 0, true);
        }
        if(!this.eyesclosed) {
            // right
            c.drawImage(this.c[0], this.x + 258, this.y + 167);
            // pupil
            c.drawImage(this.c[8], this.eyes.x + 150, this.eyes.y);
        } else {
            c.drawImage(this.c[1], this.x + 258, this.y + 167);
        }
        // nose
        c.drawImage(this.c[3], this.x + 150, this.y + 217);
        // mouth
        c.drawImage(this.c[9], this.x + 125, this.y + 360);
        // hair
        // left
        c.drawImage(this.c[7], this.x + 53, this.y + 81);
        // right
        c.drawImage(this.c[7], this.x + 363, this.y + 81);
        // eyebrows
        // left
        c.drawImage(this.c[6], this.x + 100, this.y + 100);
        // right
        c.drawImage(this.c[6], this.x + 255, this.y + 100);
    }

    update(global) {
        global.grabthese.forEach(g => {
            if(this.checkHover(g)) {
                if(!g.isExhausted()) {
                    if(!g.isInAction()) {
                        g.startAction();
                    }
                    this.busy = true;
                    if(g.closeEyes) {
                        this.closeEyes();
                    }
                } else {
                    if(g.isInAction()) {
                        g.endAction();
                    }
                    this.busy = false;
                    if(g.closeEyes) {
                        this.openEyes();
                    }
                }
            } else {
                if(g.isInAction()) {
                    g.endAction();
                }
                this.busy = false;
                this.openEyes();
            }
        });
        if(!this.eyesclosed) {
            this.updateEyes();
        }
    }

    checkHover(g) {
        return g.checkHover(this.x + 125, this.y + 360, this.c[9].width, this.c[9].height)
    }

    closeEyes() {
        this.eyesclosed = true;
    }

    openEyes() {
        this.eyesclosed = false;
    }

    updateEyes() {
        let now = timestamp();
        if ( this.eyes.moving ) {

            if ( this.eyes.x < this.eyes.tx ) {
                this.eyes.x++;
            }
            if ( this.eyes.x > this.eyes.tx ) {
                this.eyes.x--;
            }
            if ( this.eyes.y < this.eyes.ty ) {
                this.eyes.y++;
            }
            if ( this.eyes.y > this.eyes.ty ) {
                this.eyes.y--;
            }
            if ( this.eyes.x === this.eyes.tx && this.eyes.y === this.eyes.ty ) {
                this.eyes.moving = false;
            }
        } else {
            if ( now - this.eyes.timer > 2000) {
                const radius = 14;
                const angle = Math.random() * Math.PI * 2;
                const nx = Math.floor(Math.cos(angle) * radius);
                const ny = Math.floor(Math.sin(angle) * radius);

                this.eyes.tx = this.x + nx + 128;
                this.eyes.ty = this.y + ny + 187;

                this.eyes.moving = true;
                this.eyes.timer = timestamp();
            }
        }
    }
}

// this allows a thing to grab other things
class Grabber {
    constructor(x, y, c, imageindex, grabwidth, grabheight, offsetX, offsetY) {
        this.x = x;
        this.y = y;
        this.c = c;

        this.target = null;

        let i = this.c[imageindex];

        this.iw = Math.floor(i.width / 2) + offsetX;
        this.ih = Math.floor(i.height / 2) + offsetY;
        this.oX = Math.floor(this.iw - grabwidth / 2);
        this.oY = Math.floor(this.ih - grabheight / 2);
        
        this.gx = this.x + this.oX;
        this.gy = this.y + this.oY;
        this.gw = grabwidth;
        this.gh = grabheight;
    }

    update() {
        if(this.x < -100) {
            this.x = -100;
        }
        if(this.x > 1200) {
            this.x = 1200;
        }
        if(this.y < -100) {
            this.y = -100;
        }
        if(this.y > 650) {
            this.y = 650;
        }

        // update the grab offset
        this.gx = this.x + this.oX;
        this.gy = this.y + this.oY;
        this.moveGrab();
    }

    grabThing(target) {
        if(!this.target) {
            if(target.checkGrab(this.gx, this.gy, this.gw, this.gh)) {
                playsound(0);
                this.target = target;
            }
        }
    }

    moveGrab() {
        if(this.target) {
            this.target.moveGrab(this.gx, this.gy);

            if(this.target.isExhausted() && this.target.gy < 30) {
                this.target.releaseAction();
                this.target = null;
            }
        }
    }
}

class Hand extends Grabber {
    constructor(x, y, c, flip) {
        // center grabber, image 11, size is 30x30
        super(x,y,c, 2, 30, 30, 0, 20);

        this.imageIndex = 2;
        this.w = this.c[2].width;
        this.h = this.c[2].height;
        this.angle = 90;
        this.flip = flip;
        if(flip) {
            this.angle = -90;
        }

        this.hbx = this.x;
        this.hby = this.y;
        this.hbw = this.c[2].height;
        this.hbh = this.c[2].width;

        this.downCount = 0;
    }

    render(c) {
        if(this.target) {
            this.target.render(c, true);
        }
        drawImage(c,this.c[2], this.x, this.y, this.w, this.h, this.angle, this.flip);
        // render the grabber hitpoint
        //c.fillStyle = 'blue'
        //c.fillRect(this.gx, this.gy, this.gw, this.gh)

        /*
        c.strokeStyle = 'red'
        c.beginPath()
        c.rect(this.hbx, this.hby, this.hbw, this.hbh)
        c.stroke()
        */
    }

    update(global) {
        super.update();
        this.hbx = this.x + 50;
        this.hby = this.y - 50;

        if(!this.target) {
            global.grabthese.forEach(g => {
                this.grabThing(g);
            });
        }
    }

    move(incX, incY) {
        if(incX !== null) {
            this.x += incX;
        }
        if(incY !== null) {
            this.oldy = this.y;
            this.y += incY;

            if(this.y > this.oldy) {
                this.downCount += Math.abs((this.y - this.oldy));
            } else {
                this.downCount = 0;
            }
        }
    }

    collideWith(list) {
        for(let i = 0; i < list.length; i++) {
            if(!list[i].grabbed) {
                if(overlaps(this.hbx, this.hby, this.hbw, this.hbh,
                            list[i].hbx, list[i].hby, list[i].hbw, list[i].hbh
                ) > 1.0) {
                    return { 'r': true, 'c': this.downCount, 'o': list[i] }
                }
            }
        }
        return { 'r': false }
    }
}

class Giant {
    constructor(x,y,c) {
        this.x = x;
        this.y = y;
        this.c = c;
        //428, 385
        //469, 22
        this.head = new Head(x + 51, y - 363, c);
        this.fw = this.c[2].width;
        this.fh = this.c[2].height;

        this.lefthand = new Hand(this.x - 300, this.y + 180, c, false);
        this.righthand = new Hand(this.x + 600, this.y + 180, c, true);
    }

    render(c) {
        // body
        c.drawImage(this.c[5], this.x, this.y);
        this.head.render(c);
        // hands
        
        // left
        //drawImage(c,this.c.imgs[2], this.x - 300, this.y + 150, this.fw, this.fh, 90)
        
        // right
        //drawImage(c,this.c.imgs[2], this.x + 600, this.y + 90, this.fw, this.fh, -90, true)
        this.lefthand.render(c);
        this.righthand.render(c);
    }

    update(global) {
        this.head.update(global);
        this.lefthand.update(global);
        this.righthand.update(global);
    }

    /* (handleMove(x,y) {
        this.righthand.x = x
        this.righthand.y = y
    } */
}

// this allows a thing to be grabbed and also triggers when held over a hoverpoint
class Grabbable {
    constructor(x, y, c, imageindex, grabwidth, grabheight, percentage, offsetX, offsetY, hoverX, hoverY, hoverWidth, hoverHeight) {
        this.x = x;
        this.y = y;
        this.c = c;
        this.percentage = percentage;

        this.grabbed = false;

        let i = this.c[imageindex];

        this.iw = Math.floor(i.width / 2) + offsetX;
        this.ih = Math.floor(i.height / 2) + offsetY;
        this.oX = Math.floor(this.iw - grabwidth / 2);
        this.oY = Math.floor(this.ih - grabheight / 2);
        
        this.gx = this.x + this.oX;
        this.gy = this.y + this.oY;
        this.gw = grabwidth;
        this.gh = grabheight;

        // hover target is just a box
        this.hox = hoverX;
        this.hoy = hoverY;
        this.hx = this.x + this.hox;
        this.hy = this.y + this.hoy;
        this.hw = hoverWidth;
        this.hh = hoverHeight;
    }

    update() {
        // update the grab offset
        this.gx = this.x + this.oX;
        this.gy = this.y + this.oY;
        this.hx = this.x + this.hox;
        this.hy = this.y + this.hoy;
    }

    checkGrab(px, py, w, h) {
        if(!this.grabbed) {
            let p = overlaps(px, py, w, h, this.gx, this.gy, this.gw, this.gh);
            if(p >= this.percentage) {
                this.grabbed = true;
                return true
            }
        }
        return false
    }

    moveGrab(cx, cy) {
        // center the grabbed item on the provided point
        if(this.grabbed) {
            this.x = cx - this.iw;
            this.y = cy - this.ih;
            this.gx = this.x + this.oX;
            this.gy = this.y + this.oY;
            this.hx = this.x + this.hox;
            this.hy = this.y + this.hoy;
        }
    }

    checkHover(px, py, w, h) {
        if(this.grabbed) {
            let p = overlaps(px, py, w, h, this.hx, this.hy, this.hw, this.hh);
            if(p >= this.percentage) {
                return true
            }
        }
        return false
    }

    isExhausted() {
        return false
    }

    isInAction() {
        return false
    }

    startAction() {
    }

    endAction() {
    }

    releaseAction() {
    }
}

const STATE = {
    STANDING: 0,
    HELD: 1,
    DRINKING: 2,
    EMPTY: 3,
    FALLING: 4
};

class Beer extends Grabbable {
    constructor(x,y,c) {
        // center grabber, image 14, size is 30x30, 25% overlap
        // hover target
        super(x,y,c, 13, 60, 200, 2.0, 120, 20,  100, 60, 100, 80);

        this.state = STATE.STANDING;
        this.energy = 100;
        this.ts = timestamp();
        this.closeEyes = true;

        this.hbx = this.x;
        this.hby = this.y;
        this.hbw = this.c[13].width;
        this.hbh = this.c[13].height;
        this.flip = false;
    }

    render(c, override) {
        if(this.x > 1366) {
            return
        }
        // render the hitbox
        /*
        c.strokeStyle = 'red';
        c.beginPath();
        c.rect(this.hbx, this.hby, this.hbw, this.hbh);
        c.stroke();
        */

        let i = 13;
        switch(this.state) {
            case STATE.DRINKING:
                i = 14;
                break
            case STATE.FALLING:
            case STATE.EMPTY:
                i = 15;
                break
        }

        if(this.isFalling()) {
            c.drawImage(this.c[i], this.x, this.y);
            return
        }

        // don't render it if grabbed, let the grabber render it using override
        if(!this.grabbed || override) {
            c.drawImage(this.c[i], this.x, this.y);
        }
        // render the grabber hitpoint
        //c.fillStyle = 'red'
        //c.fillRect(this.gx, this.gy, this.gw, this.gh)

        /*if(this.isInAction()) {
            c.fillStyle = 'black'
        } else {
            c.fillStyle = 'orange'
        }*/
        //c.fillRect(this.hx, this.hy, this.hw, this.hh)
    }

    update() {
        super.update();

        this.hbx = this.x;
        this.hby = this.y;

        if(this.state === STATE.DRINKING) {
            let t = timestamp();
            if(t >= this.ts) {
                this.ts = timestamp() + 300;
                if(this.energy > 0) {
                    this.energy -= 10;
                    playsound(randomint(5,6));
                }
            }
        }
        if(this.isFalling() && this.y < 1400) {
            this.y += 20;
        }
        if((this.isFalling() && this.y >= 1400) || 
            (this.state === STATE.STANDING && this.x < -400)) {
            this.reset();
        }
    }

    reset() {
        this.x = 3000 + randomint(200, 300);
        this.y = 317 - 86;
        this.state = STATE.STANDING;
        this.energy = 100;
        this.ts = timestamp();
        this.grabbed = false;
    }

    isFalling() {
        return this.state === STATE.FALLING
    }

    isInAction() {
        return this.state === STATE.DRINKING
    }

    startAction() {
        if(this.grabbed && this.energy > 0) {
            this.ts = timestamp() + 300;
            this.state = STATE.DRINKING;
        }
    }

    endAction() {
        if(this.grabbed) {
            if(this.energy > 0) {
                this.state = STATE.HELD;
            } else {
                this.state = STATE.EMPTY;
            }
        }
    }

    isExhausted() {
        //console.log(this.energy)
        return this.energy <= 0
    }

    releaseAction() {
        this.state = STATE.FALLING;
        playsound(0);
    }
}

class Van {
    constructor(x, y, config) {
        this.x = x;
        this.y = y;
        this.c = config;

        this.ismoving = true;
        this.hasbeeped = false;

        this.rot = 0;
        this.bob = 0;
        this.inc = 1;
        this.count = 0;

        this.hbx = this.x + this.c[19].width - 30;
        this.hby = this.y;
        this.hbw = 30;
        this.hbh = this.c[13].height;
    }

    render(c) {
        // draw the van
        c.drawImage(this.c[19], this.x, this.y - this.bob);
        // and the wheels
        // front
        drawImage(c, this.c[20], this.x + 131, this.y + 78, 44, 44, this.rot);
        // back
        drawImage(c, this.c[20], this.x + 23, this.y + 78, 44, 44, this.rot);

        // render the hitbox
        /* c.strokeStyle = 'red'
        c.beginPath()
        c.rect(this.hbx, this.hby, this.hbw, this.hbh)
        c.stroke() */
    }

    update() {
        // bob up and down
        
        if(this.count > 3) {
            this.count = 0;
            this.bob += this.inc;
            if(this.bob > 1) {
                this.inc = -1;
            }
            if(this.bob < 0) {
                this.inc = 1;
            }
        }
        this.count++;

        // wheels rotate if we're moving
        if(this.ismoving) {
            this.rot -= 2;
            if(this.rot < -360) {
                this.rot = 0;
            }
        }
    }

    collideWith(list) {
        for(let i = 0; i < list.length; i++) {
            if(!list[i].grabbed) {
                if(overlaps(this.hbx, this.hby, this.hbw, this.hbh,
                            list[i].hbx, list[i].hby, list[i].hbw, list[i].hbh
                ) > 2.0) {
                    this.beep();
                    this.ismoving = false;
                    return true
                }
            }
        }
        this.hasbeeped = false;
        this.ismoving = true;
        return false
    }

    beep() {
        if(!this.hasbeeped) {
            playsound(1);
            window.setTimeout(playsound, 400, 1);
            this.hasbeeped = true;
        }
    }
}

class House {
    constructor(x, y, config) {
        this.x = x;
        this.y = y;
        this.c = config;

        this.hbx = this.x;
        this.hby = this.y;
        this.hbw = this.c[22].width;
        this.hbh = this.c[22].height;
        
        this.miny = this.y + 270;
        this.grabbed = false;
        this.bashed = false;
    }

    render(c) {
        // draw the house
        c.drawImage(this.c[22], this.x, this.y);

        // render the hitbox
        /*
        c.strokeStyle = 'red'
        c.beginPath()
        c.rect(this.hbx, this.hby, this.hbw, this.hbh)
        c.stroke()
        */
    }

    update() {
        this.hbx = this.x;
        this.hby = this.y;
    }

    bash(power) {
        this.y += Math.ceil(power * 0.1);
        if(this.y > this.miny) {
            this.y = this.miny;
        }
    }
}

class PlayState extends State {
    constructor(c, i) {
        super(c, i);

        this.global = {
            grabthese: [],
            bashthese: [],
            collide: []
        };
    }

    init() {

        //console.log(this.config)

        this.giant = new Giant(428, 345, this.imgs);
        this.beer = new Beer(2000, 317 - 86, this.imgs);
        this.van = new Van(20, 553, this.imgs);
        this.house = new House(800, 404, this.imgs);

        this.global.grabthese.push(this.beer);
        this.global.bashthese.push(this.house);
        this.global.collide.push(this.house);
        this.global.collide.push(this.beer);

        // generate the two bg layers
        this.offset1 = -10;
        this.offset2 = -40;

        this.goffset = -10;

        this.stopped = false;

        CanvasRenderingContext2D.prototype.shakeScreen = (g, x, y) => {
            let imgData = g.getImageData(0,0, 1366, 768);
            g.fillStyle = 'black';
            g.fillRect(0, 0, 1366, 768);
            g.putImageData(imgData, x, y);
        };

        this.trees = [];
        for(let t = 0; t < 4; t++) {
            this.trees.push({ 'x': t * randomint(300,600) + randomint(-50,100), 'y': 220 + randomint(0, 40) });
        }

        this.clouds = [];
        for(let t = 0; t < 4; t++) {
            this.clouds.push({ 'x': t * randomint(200,1600), 'y': 20 + randomint(0, 40) });
        }

        // setup gamepad
        this.gamepads = {};
        this.initGamepad();
        //playsound(0)

        this.shaking = false;
        this.shake_timestamp = 0;
    }

    render(ctx) {

        // clouds
        this.renderClouds(ctx);

        // trees in the bg
        this.renderBG(ctx, this.config.tree1, 6, 360, this.offset1);
        this.renderBG(ctx, this.config.tree2, 6, 460, this.offset2);

        this.giant.render(ctx);

        // render some trees
        this.renderTrees(ctx);


        this.beer.render(ctx);

        // render the van/vehicles
        this.van.render(ctx);

        // render the grass/plants
        this.renderGrass(ctx, 15, 768 - 122, this.goffset);

        // render the ground blocks
        this.renderGround(ctx, 15, 768 - 95, this.goffset);

        this.house.render(ctx);

        //let shakeX = randomint(-25, 25) // rndInt is a global helper of mine just random int from a range of two numbers
        //let shakeY = randomint(-25, 25)

        if(this.shaking) {
            ctx.shakeScreen(ctx, 0, randomint(-25, 25));

            if(timestamp() >= this.shake_timestamp) {
                this.shaking = false;
                //console.log('off')
            }
        }
    }

    renderBG(ctx, tree, qty, Yoffset, Xoffset) {
        for(let x = 0; x < qty; x++) {
            drawImage(ctx, tree, x * 300 + Xoffset, Yoffset);
        }
    }

    renderGrass(ctx, qty, Yoffset, Xoffset) {
        for(let x = 0; x < qty; x++) {
            ctx.drawImage(this.imgs[21], x * 100 + Xoffset, Yoffset);
        }
    }

    renderGround(ctx, qty, Yoffset, Xoffset) {
        for(let x = 0; x < qty; x++) {
            ctx.drawImage(this.imgs[18], x * 100 + Xoffset, Yoffset);
        }
    }

    renderTrees(ctx) {
        for(let i = 0; i < this.trees.length; i++) {
            ctx.drawImage(this.imgs[17], this.trees[i].x, this.trees[i].y);
        }
    }

    renderClouds(ctx) {
        for(let i = 0; i < this.clouds.length; i++) {
            drawImage(ctx, this.imgs[16], this.clouds[i].x, this.clouds[i].y, 320, 225, -10);
        }
    }


    update() {
        this.checkGamePads();
        this.giant.update(this.global);
        this.beer.update();
        this.van.update();
        this.house.update();
        if(this.van.collideWith(this.global.collide)) {
            this.stopped = true;
        } else {
            this.stopped = false;
        }
        //this.stopped = this.van.checkStop()

        // bg offset
        if(!this.stopped) {
            this.offset1 -= 0.25;
            this.offset2 -= 0.5;
            this.goffset -= 2;
            this.house.x -= 2;
            for(let i = 0; i < this.trees.length; i++) {
                this.trees[i].x -= 2;
                if(this.trees[i].x < -500) {
                    this.trees[i].x += randomint(2000, 4000) + randomint(-40, 40);
                }
            }
            if(!this.beer.grabbed) {
                this.beer.x -= 2;
            }
        }
        if(this.offset1 < -310) {
            this.offset1 = -10;
        }
        if(this.offset2 < -340) {
            this.offset2 = -40;
        }
        if(this.goffset < -110) {
            this.goffset = -10;
        }
        // ground offset
        for(let i = 0; i < this.clouds.length; i++) {
            this.clouds[i].x -= 0.1;
            if(this.clouds[i].x < -500) {
                this.clouds[i].x += randomint(2000, 4000) + randomint(-40, 40);
            }
        }

        let bl = this.giant.lefthand.collideWith(this.global.bashthese);
        let br = this.giant.righthand.collideWith(this.global.bashthese);

        if(bl.r) {
            //console.log('hit left', bl)
            this.bashThing(bl.o, bl.c);
        }
        if(br.r) {
            //console.log('hit right', br)
            this.bashThing(br.o, br.c);
        }
    }

    bashThing(object, count) {
        if(count > 10) {
            object.bash(count);
            // play sound
            playsound(randomint(2,4));
            this.setShakeScreen(200);
            object.bashed = false;
        }
    }

    setShakeScreen(duration) {
        this.shaking = true;
        this.shake_timestamp = timestamp() + duration;
    }

    finish() {
        
    }

    handleMove(mx, my) {
        //this.giant.handleMove(mx, my)
    }

    handleClick(mx, my) {}

    /* ------------- Gamepad code -------------- */

    moveHands(a, b, c, d) {
        this.giant.lefthand.move(a,b);
        this.giant.righthand.move(c,d);
    }

    convertValue(value) {
        //console.log(value)
        let r = 0;
        if(value > 0.2) {
            r = 6;
        }
        if(value > 0.5) {
            r = 12;
        }
        if(value > 0.9) {
            r = 24;
        }

        if(value < -0.2) {
            r = -6;
        }
        if(value < -0.5) {
            r = -12;
        }
        if(value < -0.9) {
            r = -24;
        }
        return r
    }

    processGamePadInput(axis, value) {
        let lx_inc = null;
        let ly_inc = null;
        let rx_inc = null;
        let ry_inc = null;

        switch(axis) {
            case 0:
                lx_inc = this.convertValue(value);
            break;
            case 1:
                ly_inc = this.convertValue(value);
            break;
            case 2:
                rx_inc = this.convertValue(value);
            break;
            case 3:
                ry_inc = this.convertValue(value);
            break;
        }
        this.moveHands(lx_inc, ly_inc, rx_inc, ry_inc);
    }

    checkGamePads() {
        let gamepads = navigator.getGamepads();
        // firefox returns an autoupdating array, chrome returns an object
        // firefox also does something funky with axes mapping :o
        if(!Array.isArray(gamepads)) {
            this.gamepads = gamepads;
        }
        let keys = Object.keys(this.gamepads);
        keys.forEach(k => {
            let controller = this.gamepads[k];
            if(controller !== null) {
                if(controller.axes) {
                    for(let i = 0; i < controller.axes.length; i++) {
                        let v = controller.axes[i];
                        if(controller.axes[i].value) {
                            v = controller.axes[i].value;
                        }
                        this.processGamePadInput(i, v);
                    }
                }
            }
        });
    }

    gamepadHandler(e,c) {
        let gamepad = e.gamepad;
        if (c) {
            this.gamepads[gamepad.index] = gamepad;
        } else {
            delete this.gamepads[gamepad.index];
        }
    }

    initGamepad() {
        let self = this;
        if(!!navigator.getGamepads){
            window.addEventListener("gamepadconnected", (e) => { self.gamepadHandler(e, true); }, false);
            window.addEventListener("gamepaddisconnected", (e) => { self.gamepadHandler(e, false); }, false);
        }
    }
}

class CalibrateState extends State {
    constructor(c, i) {
        super(c, i);
    }
    
    init() {

    }

    render(ctx) {

    }

    update() {
        
    }

    finish() {
        
    }

    handleMove(mx, my) {}

    handleClick(mx, my) {}
}

class StoryState extends State {
    constructor(c, i) {
        super(c, i);
    }
    
    init() {

    }

    render(ctx) {

    }

    update() {
        
    }

    finish() {
        
    }

    handleMove(mx, my) {}

    handleClick(mx, my) {}
}

(function() {
    'use strict';

    // start game when page has finished loading
    window.addEventListener('load', function() {
        const canvas = document.getElementById('c');
        const ctx = canvas.getContext('2d');
        const video = document.getElementById('v');
        const WIDTH = 1366;
        const HEIGHT = 768;

        let currentState = new LoadingState({});
        //currentState.init()
        let pause = false;
        let fadeOut = false;
        let fadeIn = false;
        let next = null;
        let config = null;
        let imgs = [];
        let inc = 0.0;
        let alpha = 0;
        
        let now = () => {
            return new Date().getTime()
        };

        let ts = now();

        let cls = () => {
            ctx.clearRect(0, 0, WIDTH, HEIGHT);
        };

        // setup miece listeners 
        let initMouse = (c) => {
            c.addEventListener('click', e => {
                let r = c.getBoundingClientRect();
                let x = e.clientX - r.left;
                let y = e.clientY - r.top;
                if(!pause) {
                    currentState.processClick(x, y);
                }
            }, false);
    
            c.addEventListener('mousemove', e => {
                let r = c.getBoundingClientRect();
                let x = e.clientX - r.left;
                let y = e.clientY - r.top;
                currentState.processMove(x, y, c);
            }, false);
        };

        // a bit of code to handle nice state transitions - fade in and out effect
        let skip = 7;

        let startFadeIn = () => {
            fadeIn = true;
            fadeOut = false;
            alpha = 1.0;
            inc = -0.025;
            pause = true;
            ts = now() + skip;
        };

        let startFadeOut = () => {
            fadeOut = true;
            fadeIn = false;
            alpha = 0.0;
            inc = 0.025;
            ts = now() + skip;
        };

        let processFade = () => {
            cls();
            // render whatever the last view was
            currentState.render(ctx);
            // and then draw a great big black box over it
            ctx.fillStyle = '#000';
            // update the alpha for the box to get the transition effect
            ctx.globalAlpha = alpha;
            ctx.fillRect(0, 0, WIDTH, HEIGHT);
            // don't update the alpha too often
            if(now() > ts) {
                alpha += inc;
                ts = now() + skip;
            }
            // check if the fade is completed
            if(fadeOut && alpha > 1.0) {
                nextState();
            }
            if(fadeIn && alpha < 0.0) {
                fadeIn = false;
                pause = false;
            }
        };

        // this invokes the next state class
        let nextState = () => {
            //console.log('Next is', next)
            switch(next) {
                case 'play':
                    currentState = new PlayState(config, imgs);
                break
                case 'titl':
                    currentState = new TitleState(config, imgs);
                break
                case 'cali':
                    currentState = new CalibrateState(config, imgs);
                break
                case 'stor':
                    currentState = new StoryState(config, imgs);
                break
            }
            // dynamic invocation just won't work - webpack omits the class, and rollup mangles the name
            /*try {
                currentState = (Function('return new ' + next))()
            } catch(e) {
                currentState = new this[next]()
            }*/
            currentState.init();
            startFadeIn();
        };

        // the main loop
        let tick = () => {
            ctx.globalAlpha = 1.0;
            if(!pause) {
                currentState.update();
                cls();
                currentState.render(ctx);
            }
            if(fadeOut || fadeIn) {
                processFade();
            }
            requestAnimationFrame(tick);
        };

        // nicely transition to next state when we get a ns signal
        window.addEventListener('ns', e => {
            currentState.finish();
            next = e.detail.n;
            config = e.detail.c;
            imgs = e.detail.i;
            startFadeOut();
        }, false);

        // start the main loop
        initMouse(canvas);
        currentState.init();
        tick();
    });
})();
//# sourceMappingURL=main.js.map
