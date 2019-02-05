window.addEventListener('load', () => { 

    // -----------------
    // witch
    // -----------------
    let bdialog = new WitchDialog()
    bdialog.init()

    let witch = new Witch(bdialog)
    witch.init()

    bdialog.witch = witch

    // -----------------
    // info spots
    // -----------------
    let infospot, firstspot

    // witch talk spot
    /*infospot = new PANOLENS.Infospot( 350, 'images/message-bubble.png' );
    infospot.position.set( 3000, 60, -200 );*/

    // throwaway infospot
    firstspot = new PANOLENS.Infospot( 350, 'images/message-bubble.png' )
    firstspot.position.set( 4995.49, 12.61, 76.51 )

    /*// witches spot clicked
    infospot.addEventListener('click', () => {
        console.log('Click')
        bdialog.next()
    })*/

    // force the camera to focus on the witch
    function onEnter(event) {
        firstspot.focus()
        firstspot.dispose()
    }

    // ---------------
    // game logic
    // ---------------

    function updateGame() {
        witch.update()
        bdialog.update()
    }

    // -----------------
    // panorama
    // -----------------
    let panorama, viewer;

    panorama = new PANOLENS.ImagePanorama( 'images/equirectangular.png' )

    panorama.addEventListener('load', onEnter)
    //panorama.add(infospot);
    panorama.add(firstspot)
    panorama.add(witch.poster)
    panorama.add(bdialog.poster)
    panorama.add(bdialog.paragraph)
    bdialog.answers.forEach(a => {
        panorama.add(a)
    })
    bdialog.answerTexts.forEach(a => {
        panorama.add(a)
    })

    viewer = new PANOLENS.Viewer({
        output: 'console'
    });
    viewer.add( panorama );
    //panorama.fadeIn();

    viewer.addUpdateCallback(updateGame)
});
