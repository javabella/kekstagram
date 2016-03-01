'use strict';

var ESC_KEY = 27;
/**
 * @constructor
 */
function Gallery() {
  this.element = document.querySelector('.gallery-overlay');
  this._closeButton = document.querySelector('.gallery-overlay-close');
  this._photo = document.querySelector('.gallery-overlay-image');

  this._onCloseClick = this._onCloseClick.bind(this);
  this._onDocumentKeyDown = this._onDocumentKeyDown.bind(this);
  this._onPhotoClick = this._onPhotoClick.bind(this);
  this._onHashChange = this._onHashChange.bind(this);
  this._getPictureIndexUsingHash = this._getPictureIndexUsingHash.bind(this);
}

Gallery.prototype = {
  init: function() {
    window.addEventListener('hashchange', this._onHashChange);
  },
  show: function() {
    this.element.classList.remove('invisible');

    this._closeButton.addEventListener('click', this._onCloseClick);
    this._photo.addEventListener('click', this._onPhotoClick);
    document.addEventListener('keydown', this._onDocumentKeyDown);
  },
  hide: function() {
    this.element.classList.add('invisible');

    this._closeButton.removeEventListener('click', this._onCloseClick);
    this._photo.removeEventListener('click', this._onPhotoClick);
    document.removeEventListener('keydown', this._onDocumentKeyDown);
  },
  /**
   * Обработчик клика по крестику
   * @listens click
   * @private
   */
  _onCloseClick: function() {
    this.hide();
    this.removeHash();
  },
  /**
   * Обработчик нажатия Esc
   * @listens keydown
   * @private
   */
  _onDocumentKeyDown: function(e) {
    if (e.keyCode === ESC_KEY) {
      this._onCloseClick();
    }
  },
  /**
   * Обработчик клика по картинке в открытом окне галереи
   * @listens click
   * @private
   */
  _onPhotoClick: function() {
    if (this.currentIndex + 1 < this.pictures.length) {
      var nextPicture = this.pictures[this.currentIndex + 1];
      if (nextPicture.element.classList.contains('picture-load-failure')) {
        ++this.currentIndex;
        this._onPhotoClick();
      } else {
        window.location.hash = this.HASH_PREFIX + (this.pictures[++this.currentIndex]).getURL();
      }
    }
  },
  /**
   * @param {Array<Photo>} pictures
   */
  setPictures: function(pictures) {
    this.pictures = pictures;
  },
  /**
   * @param {(number | string)} index
   */
  setCurrentPicture: function(index) {
    this.currentIndex = index;
    if (typeof index === 'string') {
      this.currentIndex = this._getPictureIndexUsingHash(index);
    }

    var picture = this.pictures[this.currentIndex].getData();
    var image = document.querySelector('.gallery-overlay-image');
    var comments = document.querySelector('.gallery-overlay-controls-comments .comments-count');
    var likes = document.querySelector('.gallery-overlay-controls-like .likes-count');

    image.src = picture.url;
    comments.textContent = picture.comments;
    likes.textContent = picture.likes;
  },
  removeHash: function() {
    var location = window.location;
    if ('pushState' in history) {
      // pushState корректно сработает только на сервере
      try {
        history.pushState('', document.title, location.pathname + location.search);
      } catch (err) {
        location.hash = '';
      }
    } else {
      location.hash = '';
    }
  },
  /**
   * @type {number}
   * @private
   */
  _radix: 10,
  /**
   * @listens hashchange
   * @private
   */
  _onHashChange: function() {
    this.restoreFromHash();
  },
  restoreFromHash: function() {
    var expr = /#photo\/(\S+)/g;
    if (expr.test(window.location.hash)) {
      this.setCurrentPicture(window.location.hash);
      this.show();
    }
  },
  /**
   * @param  {string} hash
   * @return {number}
   */
  _getPictureIndexUsingHash: function(hash) {
    var result;
    (this.pictures).forEach(function(item, index) {
      if (hash.indexOf(item.getURL()) !== -1) {
        result = index;
      }
    });
    return result;
  },
  /**
   * @type {string}
   * @constant
   */
  HASH_PREFIX: 'photo/'
};

module.exports = Gallery;

