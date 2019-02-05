class Witch {
    constructor(dialog) {
        this.poster = null
        this.images = [ 'witch', 'witch-blink1', 'witch-blink2', 'witch-blink3', 
                        'witch-bigsmile', 
                        'witch-oops', 
                        'witch-smile', 'witch-smile1', 'witch-smile2', 'witch-smile3',
                        'witch-tea1', 'witch-tea2', 'witch-tea3', 'witch-tea4', 'witch-tea5', 'witch-tea6', 'witch-tea7', 'witch-tea8', 'witch-tea9', 'witch-tea10', 'witch-tea11', 'witch-tea12' 
                        ]
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
            },
            'smile': {
                frames: ['witch-smile', 'witch-smile1', 'witch-smile2', 'witch-smile3', 'witch-smile2', 'witch-smile1',
                    'witch-smile', 
                    'witch-tea1', 'witch-tea2', 'witch-tea3', 'witch-tea4', 'witch-tea5', 'witch-tea6', 'witch-tea7', 'witch-tea8', 'witch-tea9', 'witch-tea10', 'witch-tea11', 
                    'witch-tea12',
                    'witch-tea11', 'witch-tea10', 'witch-tea9', 'witch-tea8', 'witch-tea7', 'witch-tea6', 'witch-tea5', 'witch-tea4', 'witch-tea3', 'witch-tea2', 'witch-tea1',
                ],
                intervals: [ 3500, 100, 100, 100, 100, 100,
                    1000, 
                    90, 90, 90, 90, 90, 90, 90, 92, 94, 96, 98,
                    400,
                    90, 80, 70, 70, 70, 70, 70, 70, 80, 90, 100
                ]
            },
            'oops': {
                frames: ['witch-oops'],
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
            0 ) //Math.PI / 6 );
        this.poster.position.set( -100, -30, 0 )
        this.poster.rotation.set( 0, Math.PI / 2, 0 )
        
        /* this.poster.addEventListener('click', () => {
            self.dialog.showOptions();
        }) */

        let count = 0
        
        let self = this

        this.images.forEach((image) => {
            // Load images for witch
            PANOLENS.Utils.TextureLoader.load( 
                `images/${image}.png`,
                function ( texture ) {
                    if(image === 'witch' ) {
                        self.poster.material.map = texture
                        self.poster.material.needsUpdate = true
                    }
                    self.wtextures[image] = texture
                    count++
                    if(count > 2) {
                        self.ready = true
                    }
                }
            )
        })
    }

    getTimeStamp() {
        return new Date().getTime()
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
                    this.currentframe = 0
                }
                this.timestamp = now
                this.poster.material.map = this.wtextures[this.getFrame()]
                this.poster.material.needsUpdate = true
            }
        }
    }

    setAnimation(name) {
        this.currentframe = 0
        this.currentanim = name
        this.timestamp = this.getTimeStamp()
        this.poster.material.map = this.wtextures[this.getFrame()]
        this.poster.material.needsUpdate = true
    }
}


