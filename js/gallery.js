'use strict';
(function() {
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
  }

  Gallery.prototype = {
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
     * @private
     */
    _onCloseClick: function() {
      this.hide();
    },
    /**
     * Обработчик нажатия Esc
     * @private
     */
    _onDocumentKeyDown: function(e) {
      if (e.keyCode === ESC_KEY) {
        this.hide();
      }
    },
    /**
     * Обработчик клика по картинке в открытом окне галереи
     * @private
     */
    _onPhotoClick: function() {
      console.log('photo clicked');
    }
  };

  window.Gallery = Gallery;
})();
