var app = function () {

  this.images = [];
  this.curImageRangeMax = 51;
  this.loadingPreviewImages = false;
  this.listView = new Clusterize ({
    scrollId: 'leftBar',
    contentId: 'imagesInLib',
    callbacks: {
      scrollingProgress: this.progressChange.bind (this)
    }
  });
  this.mLibrary = [];
  this.DOM = {
    file: $ ('#file'),
    previewImage : $('#previewImage'),
    appendTarget: $ ('#appendTarget'),
    fileLoader: $ ('#fileLoader'),
    imageList: $ ('#imagesInLib'),
    loader : $('#loader'),
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

app.prototype.progressChange = function ( progress ) {
  if (progress > 40) {
    if (this.loadingPreviewImages === false) {
      this.loadingPreivewImages = true;
      this.loadImageRange (this.curImageRangeMax, this.curImageRangeMax + 20);
      this.curImageRangeMax += 21;
    }

  }
}

app.prototype.loadLibFromFile = function ( event ) {
  this.DOM.loader.show();
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
  this.listView.clear ();
  this.curImageRangeMax = 51;
  this.images = [];
  this.DOM.stats.count.text('');
  this.DOM.stats.x.val('');
  this.DOM.stats.y.val('');
  this.DOM.stats.shadowX.val('');
  this.DOM.stats.shadowY.val('');
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
  this.DOM.loader.hide();
};

app.prototype.attachEventListeners = function () {

  function showPreview ( event ) {
    var thumbnail = $ (event.target).is ('.thumbnail') ? $ (event.target) : $ (event.target).parents ('.thumbnail');
    var canvas = thumbnail.find ('canvas');
    var idx = thumbnail.find ('.number').text();
    this.DOM.previewImage[0].src = canvas[0].toDataURL();


    this.updateImageStats (idx);
  }

  this.DOM.imageList.on ('click', showPreview.bind (this));
  this.DOM.fileLoader.on ('change', this.loadLibFromFile.bind (this));
};

app.prototype.updateImageStats = function ( idx ) {
  var image = this.mLibrary.getImage(idx);
  this.DOM.stats.x.val(image.layer1.x);
  this.DOM.stats.y.val(image.layer1.y);
  this.DOM.stats.shadowX.val(image.layer1.shadowX);
  this.DOM.stats.shadowY.val(image.layer1.shadowY);
};

app.prototype.renderListCanvas = function() {
  var thumbnails = this.DOM.imageList.find('.thumbnail');
  thumbnails.each(function(index, thumb) {
    var idx = $(thumb).find('.number').text();
    var image = this.images[idx];
    $(thumb).find('canvas').replaceWith(image);
  }.bind(this));
};

app.prototype.appendPreviewImages = function ( images ) {

  var toAppend = [];

  images.forEach (function ( item ) {
    var $newContent = $ ('<li class="thumbnail"><div class="number"><span>' + item.index + '</span></div><canvas></canvas></li>');
    toAppend.push ($newContent[0]);
  });

  this.listView.append (toAppend);
  this.renderListCanvas();
};

var App = new app ();