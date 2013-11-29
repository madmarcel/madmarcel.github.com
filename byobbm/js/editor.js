$( document ).ready(function() {
    
    // log mouse click coordinates on canvas
    $("#bbmeditor").mousedown( function(e) {
       
       var canvas = $("#bbmeditor")[0];
       var canvas_offset = $("#bbmeditor").offset();
            
       var mx = e.clientX + document.documentElement.scrollLeft + document.documentElement.scrollLeft - Math.floor(canvas_offset.left);           
       var my = e.clientY + document.documentElement.scrollTop + document.documentElement.scrollTop - Math.floor(canvas_offset.top) + 1;               
       
       processClick( mx, my );
       
       
    });
    
    
});

var processClick = function(mx,my) {
    
};

