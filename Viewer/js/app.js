var app = function () {

  this.images = [];
  this.curImageRangeMax = 51;
  this.curIndex = 0;
  this.loadingPreviewImages = false;
  this.mLibrary = [];

  this.DOM = {
    file: $ ('#file'),
    leftBar: $ ('#leftBar'),
    previewImage: $ ('#previewImage'),
    appendTarget: $ ('#appendTarget'),
    fileLoader: $ ('#fileLoader'),
    imageList: $ ('#imagesInLib'),
    loader: $ ('#loader'),
    stats: {
      count: $ ('#count'),
      x: $ ('#x'),
      y: $ ('#y'),
      shadowX: $ ('#shadowX'),
      shadowY: $ ('#shadowY')
    }
  };

  this.attachEventListeners ();
};

app.prototype.progressChange = function ( event ) {

  var progress = (this.DOM.leftBar[0].scrollTop / this.DOM.leftBar[0].scrollHeight) * 100;

  if (progress > 40) {
    if (this.loadingPreviewImages === false) {
      this.loadingPreivewImages = true;
      this.loadImageRange (this.curImageRangeMax, this.curImageRangeMax + 20);
      this.curImageRangeMax += 21;
    }

  }
}

app.prototype.loadLibFromFile = function ( event ) {
  this.DOM.loader.show ();
  var files = event.target.files;
  if (files.length > 0) {

    var reader = new FileReader ();

    reader.onload = function () {
      var result = reader.result;
      this.mLibrary = new MLibrary (result);
      this.mLibrary.loadFromFile (this.onLibLoad.bind (this));
      this.changeDOMText (this.DOM.stats.count, "Image Count: " + this.mLibrary.count);
    }.bind (this);

    reader.readAsArrayBuffer (files[0]);

    this.changeDOMText (this.DOM.file, "File: From file");
  }
};

app.prototype.clearImagePreviewList = function () {
  var listItems = this.listView.find ('.thumbnail');

  for (var index = 0, length = listItems.length; index < length; index++) {

    listItems[index].remove ();
  }
};

app.prototype.onLibLoad = function () {
  // this.listView.clear ();
  this.DOM.imageList.html ('');
  this.curImageRangeMax = 51;
  this.images = [];
  this.curIndex = 0;
  this.DOM.stats.count.text ('');
  this.DOM.stats.x.val ('');
  this.DOM.stats.y.val ('');
  this.DOM.stats.shadowX.val ('');
  this.DOM.stats.shadowY.val ('');
  this.loadingPreivewImages = false;
  this.loadImageRange (0, 50);

};

app.prototype.changeDOMText = function ( domElement, text ) {
  domElement.text (text);
};

app.prototype.loadImageRange = function ( begin, end ) {
  var updatedImages = [];

  for (i = begin; i <= end; i++) {
    if (i > this.mLibrary.count) {
      this.loadingPreviewImages === false;
      break;
    }

    var image = this.mLibrary.getImage (this.mLibrary.indexList[i]).createBitmap ();
    this.images.push (image);
    updatedImages.push ({ index: i, image: image });
  }

  this.appendPreviewImages (updatedImages);
  this.loadingPreviewImages === false;
  this.DOM.loader.hide ();
};

app.prototype.showPreviewImage = function ( event ) {

  var thumbnail = $ (event.target).is ('.thumbnail') ? $ (event.target) : $ (event.target).parents ('.thumbnail');
  thumbnail.focus();
  var canvas = thumbnail.find ('canvas');
  if (canvas[0]) {
    var idx = thumbnail.find ('.number').text ();
    this.DOM.previewImage[0].src = canvas[0].toDataURL ();
    this.curIndex = Number (idx);
    this.updateImageStats (idx);
  } else {
    this.DOM.previewImage[0].src = "";
  }

};

app.prototype.attachEventListeners = function () {

  this.DOM.imageList.hover (function () {
    this.focus ();
  }, function () {
    this.blur ();
  }).keydown (function ( e ) {
    if (e.keyCode === 40) {
      this.selectNextInImageList (this.curIndex);
      e.preventDefault();
    }
    if (e.keyCode === 38) {
      this.selectPreviousInImageList (this.curIndex);
      e.preventDefault();
    }
  }.bind (this));

  this.DOM.imageList.on ('click', this.showPreviewImage.bind (this));
  this.DOM.fileLoader.on ('change', this.loadLibFromFile.bind (this));
  this.DOM.leftBar.on ('scroll', this.progressChange.bind (this));
};

app.prototype.selectNextInImageList = function ( idx ) {
  var nextIdx = idx + 1 > this.mLibrary.count ? this.mLibrary.count : idx + 1;
  var next = $ (".thumbnail .number:contains('" + (idx + 1) + "')")
    .filter (function ( index ) {
      return $ (this).text () == nextIdx;
    });

  this.showPreviewImage ({ target: next[0] });
  this.DOM.leftBar[0].scrollTop = $ (next).parents('.thumbnail')[0].offsetTop;
  this.curIndex = nextIdx;
};

app.prototype.selectPreviousInImageList = function ( idx ) {
  var prevIdx = idx - 1 < 0 ? 0 : idx - 1;
  var prev = $ (".thumbnail .number:contains('" + (prevIdx) + "')")
    .filter (function ( index ) {
      return $ (this).text () == prevIdx;
    });

  this.showPreviewImage ({ target: prev[0] });
  this.DOM.leftBar[0].scrollTop = $ (prev).parents('.thumbnail')[0].offsetTop;
  this.curIndex = prevIdx;
};

app.prototype.updateImageStats = function ( idx ) {
  var image = this.mLibrary.getImage (idx);
  this.DOM.stats.x.val (image.layer1.x);
  this.DOM.stats.y.val (image.layer1.y);
  this.DOM.stats.shadowX.val (image.layer1.shadowX);
  this.DOM.stats.shadowY.val (image.layer1.shadowY);
};

app.prototype.renderListCanvas = function () {
  var thumbnails = this.DOM.imageList.find ('.thumbnail');
  thumbnails.each (function ( index, thumb ) {
    var idx = $ (thumb).find ('.number').text ();
    var image = this.images[idx];
    $ (thumb).find ('canvas').replaceWith (image);
  }.bind (this));
};

app.prototype.appendPreviewImages = function ( images ) {

  images.forEach (function ( item ) {
    var $newContent = $ ('<li class="thumbnail" tabindex="0"><div class="number"><span>' + item.index + '</span></div><canvas></canvas></li>');
    this.DOM.imageList.append ($newContent);
  }.bind (this));

  this.renderListCanvas ();
};

var App = new app ();