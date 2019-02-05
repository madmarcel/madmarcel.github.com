class Witch {
    constructor(dialog) {
        this.poster = null
        this.images = [ 'witch', 'witch-blink1', 'witch-blink2', 'witch-blink3', 'witch-bigsmile']
        this.wtextures = {} 

        this.currentanim = 'grumpy'
        this.currentframe = 0
        this.animations = {
            'grumpy': {
                frames: [ 'witch', 'witch-blink1', 'witch-blink2', 'witch-blink3', 'witch-blink2', 'witch-blink1' ],
                intervals: [ 4000, 100, 100, 100, 100, 100 ]
            },
            'bigsmile': {
                frames: ['witch-bigsmile'],
                intervals: [ 1000 ]
            }
        }
        this.timestamp = new Date().getTime()
        this.ready = false
        this.dialog = dialog
    }

    init() {
        // the witch
        this.poster = new PANOLENS.Tile( 120, // width
            240, // height
            64,
            64, 
            new THREE.Vector3( 0, 0, 1 ), 
            new THREE.Vector3( 0, 1, 0 ), 
            0 ); //Math.PI / 6 );
        this.poster.position.set( -100, -30, 0 );
        this.poster.rotation.set( 0, Math.PI / 2, 0 );
        
        this.poster.addEventListener('click', () => {
            self.dialog.showOptions();
        })

        let count = 0;
        
        let self = this

        this.images.forEach((image) => {
            // Load images for witch
            PANOLENS.Utils.TextureLoader.load( 
                `images/${image}.png`,
                function ( texture ) {
                    if(image === 'witch' ) {
                        self.poster.material.map = texture; 
                        self.poster.material.needsUpdate = true;
                    }
                    self.wtextures[image] = texture;
                    count++;
                    if(count > 2) {
                        self.ready = true
                    }
                }
            );
        });
    }

    getTimeStamp() {
        return new Date().getTime();
    }

    getAnimation() {
        return this.animations[this.currentanim].frames
    }

    getFrame() {
        return this.animations[this.currentanim].frames[this.currentframe]
    }

    getInterval() {
        return this.animations[this.currentanim].intervals[this.currentframe]
    }

    update() {
        if(this.ready) {
            let now = this.getTimeStamp()
            if(this.timestamp + this.getInterval() < now) {
                this.currentframe++
                if(this.currentframe > this.getAnimation().length - 1) {
                    this.currentframe = 0;
                }
                this.timestamp = now
                this.poster.material.map = this.wtextures[this.getFrame()];
                this.poster.material.needsUpdate = true;
            }
        }
    }

    setAnimation(name) {
        this.currentframe = 0;
        this.currentanim = name;
        this.timestamp = this.getTimeStamp()
        this.poster.material.map = this.wtextures[this.getFrame()];
        this.poster.material.needsUpdate = true;
    }
}


