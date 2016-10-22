var MImage = require ('./MImage.js');

var MLibrary = function ( file ) {
  this.imageList = [];
  this.indexList = [];
  this.currentVersion = -1;
  this.count = -1;
  this.view = {};
  this.file = file;
};

MLibrary.prototype.loadFromFilePath = function ( cb ) {
  var oReq = new XMLHttpRequest ();
  oReq.open ("GET", this.file, true);
  oReq.responseType = "arraybuffer";

  oReq.onload = function ( oEvent ) {
    var arrayBuffer = oReq.response;
    if (arrayBuffer) {
      var Int32View = new DataView (arrayBuffer);
      this.view = Int32View;
      this.currentVersion = this.getVersion (Int32View);
      this.count = this.getCount (Int32View);
      this.indexList = this.generateIndex (Int32View);

      cb (this);
    }
  }.bind (this);

  oReq.send (null);
};

MLibrary.prototype.loadFromFile = function ( cb ) {
    var arrayBuffer = this.file;
    if (arrayBuffer) {
      var Int32View = new DataView (arrayBuffer);
      this.view = Int32View;
      this.currentVersion = this.getVersion (Int32View);
      this.count = this.getCount (Int32View);
      this.indexList = this.generateIndex (Int32View);
      cb (this);
    }

};

MLibrary.prototype.getVersion = function ( view ) {
  var version = view.getInt32 (0, true);
  return version;
};

MLibrary.prototype.getCount = function ( view ) {
  var count = view.getInt32 (4, true);
  return count;
};

MLibrary.prototype.generateIndex = function ( view ) {
  var offset = 8;
  var index = [];

  for (i = 0; i < this.count; i++) {
    index.push (view.getInt32 ((i * 4) + offset, true));
  }

  return index;
};

MLibrary.prototype.getImage = function ( idx ) {

  var image;

  if (this.imageList[idx]) {
    image = this.imageList[idx];
  } else {
    image = new MImage (this.view, idx);
    this.imageList.push (image);
  }

  return image;
};

window.MLibrary = MLibrary;

module.exports = MLibrary;