function canvasFromArray ( arr, depth, h, w ) {
  var offset, height, data, image;

  function conv ( size ) {
    return String.fromCharCode (size & 0xff, (size >> 8) & 0xff, (size >> 16) & 0xff, (size >> 24) & 0xff);
  }

  offset = depth <= 8 ? 54 + Math.pow (2, depth) * 4 : 54;
  // height = Math.ceil(Math.sqrt(arr.length * 8/depth));

  //BMP Header
  data = 'BM';                          // ID field
  data += conv (offset + arr.length);     // BMP size
  data += conv (0);                       // unused
  data += conv (offset);                  // pixel data offset

  //DIB Header
  data += conv (40);                      // DIB header length
  data += conv (w);                  // image width
  data += conv (h);                  // image height
  data += String.fromCharCode (1, 0);     // colour panes
  data += String.fromCharCode (depth, 0); // bits per pixel
  data += conv (0);                       // compression method
  data += conv (arr.length);              // size of the raw data
  data += conv (2835);                    // horizontal print resolution
  data += conv (2835);                    // vertical print resolution
  data += conv (0);                       // colour palette, 0 == 2^n
  data += conv (0);                       // important colours

  //Grayscale tables for bit depths <= 8
  if (depth <= 8) {
    data += conv (0);

    for (var s = Math.floor (255 / (Math.pow (2, depth) - 1)), i = s; i < 256; i += s) {
      data += conv (i + i * 256 + i * 65536);
    }
  }

  //Pixel data

  var element;

  if (arr.length > 0) {

    //Image element
    element = document.createElement ("canvas");
    element.height = h;
    element.width = w;

    var ctx = element.getContext ("2d");
    var imgData = ctx.createImageData (w, h);
    var imgDataCopy = ctx.createImageData (w, h);
    imgData.data.set (arr);
    imgDataCopy.data.set(arr);

    var invert = function ( data, imgDataCopy ) {
      for (var i = 0; i < data.length; i += 4) {
          data[i] = imgDataCopy[i + 2];     // red
          data[i + 1] = imgDataCopy[i + 1]; // green
          data[i + 2] = imgDataCopy[i]; // blue
          data[i + 3] = 255;
      }

    };

    invert (imgData.data, imgDataCopy.data);

    ctx.putImageData (imgData, 0, 0, 0, 0, w, h);

  } else {
    element = document.createElement ('img');
    data = 'R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7';
    element.src = 'data:image/bmp;base64,' + btoa (data);
  }

  return element;

}

module.exports = canvasFromArray;