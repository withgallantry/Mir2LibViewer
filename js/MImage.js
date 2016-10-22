var Pako = require ('../bower_components/pako/dist/pako_inflate.min.js');
var CanvasFromArray = require ('./Bitmap');

const WIDTH_OFFSET = 0;
const HEIGHT_OFFSET = 2;
const X_OFFSET = 4;
const Y_OFFSET = 6;
const SHADOWX_OFFSET = 8;
const SHADOWY_OFFSET = 10;
const SHADOW_OFFSET = 12;
const LENGTH_OFFSET = 13;
const IMAGE_OFFSET = 17;

var MImage = function ( view, idx ) {

  this.layer1 = {
    width: -1,
    height: -1,
    x: -1,
    y: -1,
    shadowX: -1,
    shadowY: -1,
    shadow: -1,
    length: -1,
    hasMask : false,
    image: []
  };

  this.mask = {

  };


  this.view = view;

  this.getImage (idx);
};

MImage.prototype.getImage = function ( idx, cb ) {
  this.layer1.width = this.view.getInt16 (idx + WIDTH_OFFSET, true);
  this.layer1.height = this.view.getInt16 (idx + HEIGHT_OFFSET, true);
  this.layer1.x = this.view.getInt16 (idx + X_OFFSET, true);
  this.layer1.y = this.view.getInt16 (idx + Y_OFFSET, true);
  this.layer1.shadowX = this.view.getInt16 (idx + SHADOWX_OFFSET, true);
  this.layer1.shadowY = this.view.getInt16 (idx + SHADOWY_OFFSET, true);
  this.layer1.shadow = this.view.getInt8 (idx + SHADOW_OFFSET, true);
  this.layer1.length = this.view.getInt32 (idx + LENGTH_OFFSET, true);
  this.layer1.image = new Uint8Array (this.view.buffer.slice (idx + IMAGE_OFFSET, idx + IMAGE_OFFSET + this.layer1.length));
  this.layer1.hasMask = ((this.layer1.shadow >> 7) === 1) ? true : false;
};

MImage.prototype.createBitmap = function ( cb ) {

  if (this.layer1.width === 0 || this.layer1.height === 0)
    return;

  if (this.layer1.width < 3 || this.layer1.height < 3)
    return;

  try {
    var result = Pako.inflate (this.layer1.image);
  } catch (err) {
    console.log (err);
  }

  var canvasFromArray = CanvasFromArray (result, 32, this.layer1.height, this.layer1.width);
  return canvasFromArray;

};

module.exports = MImage;