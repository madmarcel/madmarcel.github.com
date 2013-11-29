'use strict';
/* Source: HTML5Rocks - http://www.html5rocks.com/en/tutorials/canvas/imagefilters/ */

var Filters = {};

Filters.tmpCanvas = document.createElement('canvas');
Filters.tmpCtx = Filters.tmpCanvas.getContext('2d');

Filters.getPixels = function(img) {
  var c = this.getCanvas(img.width, img.height);
  var ctx = c.getContext('2d');
  ctx.drawImage(img,0,0);
  return ctx.getImageData(0,0,c.width,c.height);
};

Filters.getCanvas = function(w,h) {
  var c = document.createElement('canvas');
  c.width = w;
  c.height = h;
  return c;
};

Filters.createImageData = function(w,h) {  
  return this.tmpCtx.createImageData(w,h);
};

Filters.filterImage = function(filter, image, var_args) {
  var args = [this.getPixels(image)];
  for (var i=2; i<arguments.length; i++) {
    args.push(arguments[i]);
  }
  return filter.apply(null, args);
};

Filters.grayscale = function(pixels, args) {
  var d = pixels.data;
  for (var i=0; i<d.length; i+=4) {
    var r = d[i];
    var g = d[i+1];
    var b = d[i+2];
    // CIE luminance for the RGB
    // The human eye is bad at seeing red and blue, so we de-emphasize them.
    var v = 0.2126*r + 0.7152*g + 0.0722*b;
    d[i] = d[i+1] = d[i+2] = v
  }
  return pixels;
};

Filters.convertToGrayScale = function( image ) {
    var grayscale = Filters.filterImage( Filters.grayscale, image );
    /*
    // Note that ImageData values are clamped between 0 and 255, so we need
    // to use a Float32Array for the gradient values because they
    // range between -255 and 255.
    var vertical = Filters.convoluteFloat32(grayscale,
      [ -1, 0, 1,
        -2, 0, 2,
        -1, 0, 1 ]);
    var horizontal = Filters.convoluteFloat32(grayscale,
      [ -1, -2, -1,
         0,  0,  0,
         1,  2,  1 ]);
    */
    /*var final_image = Filters.createImageData(vertical.width, vertical.height);
    for (var i=0; i<final_image.data.length; i+=4) {
      // make the vertical gradient red
      var v = Math.abs(vertical.data[i]);
      final_image.data[i] = v;
      // make the horizontal gradient green
      var h = Math.abs(horizontal.data[i]);
      final_image.data[i+1] = h;
      // and mix in some blue for aesthetics
      final_image.data[i+2] = (v+h)/4;
      final_image.data[i+3] = 255; // opaque alpha
    }*/
    return grayscale;
};
