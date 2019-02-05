class WitchDialog {
    constructor() {
        this.poster = null
        this.paragraph = null
        this.images = [ 'blackdialog2' ]
        this.answers = []
        this.answerTexts = []

        this.currentAnswerSet = 0
        this.answersets = [
            [
                { text: 'Yeah, huh. That was weird.', used: false, speech: 1 },
                { text: 'What were we talking about?', used: false, speech: 2 },
                { text: 'Where is my tea?', used: false, speech: 3 },
                { text: 'Oobewoobeloo', used: false, speech: 4 },
            ],

        ]

        this.currentSpeech = 0;
        this.speech = [
            [
                "Are you alright?", 
                "You looked like you were",
                "gone there for a second..."
            ],
            [
                "Have you been drinking",
                "cactus tea again?"
            ],
            [
                "Your new underground house!",
                "It's ah-mah-zing!"
            ],
            [
                "Right in front of you?!"
            ],
            [
                "You really need to stay",
                "away from that cactus tea!"
            ]
        ]
    }

    init() {
        // the dialog
        this.poster = new PANOLENS.Tile( 60, // width
            60, // height
            64,
            64, 
            new THREE.Vector3( 0, 0, 1 ), 
            new THREE.Vector3( 0, 1, 0 ), 
            0 ); //Math.PI / 6 );
        this.poster.position.set( -99, 20, -63 );
        this.poster.rotation.set( 0, Math.PI / 2, 0 );
        
        // A 2d text paragraph
        this.paragraph = new PANOLENS.SpriteText( this.speech[this.currentSpeech].join('\n') );
  
        this.paragraph.rotation.y = Math.PI / 2 * -1;
        this.paragraph.position.set( -98, 15, -98 );

        let self = this

        this.poster.addEventListener('click', () => {
            self.next();
        })

        
        /* answer tiles */
        this.answers = []
        this.answerTexts = [];
        let z = 52
        let y = -39.5

        for(let i = 0; i <  4; i++) {
            let a = new PANOLENS.Tile( 60, // width
                7.5, // height
                64,
                64, 
                new THREE.Vector3( 0, 0, 1 ),
                new THREE.Vector3( 0, 1, 0 ),
                0 ); //Math.PI / 6 );
            a.position.set( -90, y, z );
            a.rotation.set( 0, Math.PI / 2, 0 );
            a.tween( 'scale-up', a.scale, { y: 1.1, x: 1.1 }, 300, TWEEN.Easing.Bounce.Out );
            a.tween( 'scale-down', a.scale, { y: 1, x: 1 }, 300, TWEEN.Easing.Bounce.Out );
            a.addEventListener( 'hoverenter', function(){
                this.tweens[ 'scale-up' ].start();
            } );
            a.addEventListener( 'hoverleave', function(){
            this.tweens[ 'scale-down' ].start();
            } );

            let p = new PANOLENS.SpriteText( this.answersets[this.currentAnswerSet][i].text );
            p.rotation.y = Math.PI / 2 * -1;
            p.position.set( -89, y + 3, z - 23);

            this.answers.push(a)
            this.answerTexts.push(p)
            y = -48
            if(i === 1) {
                y = -39.5
                z = -50
            }
        }

        PANOLENS.Utils.TextureLoader.load( 
            `images/answerdialog.png`,
            function ( texture ) {
                self.answers.forEach( answer => {
                    answer.material.map = texture; 
                    answer.material.needsUpdate = true;
                })
            }
        );

        this.images.forEach((image) => {
            // Load images for witch
            PANOLENS.Utils.TextureLoader.load( 
                `images/${image}.png`,
                function ( texture ) {
                    self.poster.material.map = texture; 
                    self.poster.material.needsUpdate = true;
                }
            );
        });

        // Load font with callback when font is ready
        PANOLENS.Utils.loadBMFont({
            font: 'fonts/Lato-Regular-64.fnt',
            image: 'fonts/lato.png'
        }, self.onFontLoaded);

        this.hideOptions()
    }

    toggleAnswers(flag) {
        this.answers.forEach(a => {
            a.visible = flag
        })
        this.answerTexts.forEach(a => {
            a.visible = flag
        })
    }

    hideOptions() {
        this.toggleAnswers(false)
    }

    // questions
    showOptions() {
        this.toggleAnswers(true)
    }

    getTimeStamp() {
        return new Date().getTime();
    }

    update() {
        
    }

    next() {
        this.poster.visible = false
        this.paragraph.visible = false
        this.showOptions()
    }
}


