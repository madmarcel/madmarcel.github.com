'use strict';

var minCarousel = -119;
var maxCarousel = -15;
var carouselStep = 104;
var moving = false;

var carouselItems = {};

$( document ).ready(function() {
                        
    // populate carousel using available contraptions
    for(var i = 0; i < CONTRAPTIONS.length; i++ ) {
           carouselItems[CONTRAPTIONS[i]] =  PREVIEW_FOLDER + CONTRAPTIONS[i] + ".png";                                   
    }
                                                        
    var root = $("#addSlidesHere");
    
    var alternate = false;
    var altClass = "";
    // add a slide for each of the contraptions
    for( var item in carouselItems) {
         if( alternate ) {
             altClass = " altslide";           
         }
         else
         {
             altClass = "";           
         }
        $(root).append( "<li class='slide" + altClass + "' data-id='" + item + "'><img src='" + carouselItems[item] + "'></li>" );
        alternate = !alternate;
    }
    
    if( Object.keys(carouselItems).length < 5 ) {
        minCarousel = maxCarousel;
    }
    else
    {
        minCarousel = maxCarousel - (carouselStep * (Object.keys(carouselItems).length - 5 ));
    }
    
    // add action to down button
    $("#downButton").click( function(e) {
        if( instructions.visible ) {
            instructions.visible = false;
        } 
        var curPos = parseInt($("#slides ul").css("top"));
                
        if( curPos > minCarousel && !moving ) {
            
            moving = true;
                    
            var vert_space = "-=" + carouselStep;
            
            $('#slides ul').animate({
                    top : vert_space
                    }, 100, function () {
                        
                        moving = false;
                    });
        }
        
    });
    
    // add action to up button
    $("#upButton").click( function(e) {
        if( instructions.visible ) {
            instructions.visible = false;
        } 
        var curPos = parseInt($("#slides ul").css("top"));        
        
        if( curPos < maxCarousel && !moving ) {
            
            moving = true;
            
            var vert_space = "+=" + carouselStep;
            
            $('#slides ul').animate( {
                    top : vert_space
                }, 100, function () {
                    
                     moving = false;
                });
        }
    });
    
    // add action if user clicks on slide
    $("li.slide").click( function(e) {
        if( instructions.visible ) {
            instructions.visible = false;
        } 
        setTheSelectedWidget( parseInt($(this).data("id")) );
        $("li", "ul#addSlidesHere").each( function(){ $(this).removeClass("selectedWidget"); });
        $(this).addClass("selectedWidget");
    });
});
