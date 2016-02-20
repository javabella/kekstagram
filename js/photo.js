/* global actionAfterLastElement: true */
'use strict';
(function() {
  var PICTURE_SIDE = 182;
  var IMAGE_TIMEOUT = 10000;

  /**
   * Создает элемент по шаблону
   * @constructor
   * @param {Object}  data
   * @param {boolean} isLastElement
   */
  function Photo(data, isLastElement) {
    this._data = data;
    this._isLastElement = isLastElement;
  }

  Photo.prototype = {
    render: function() {
      var template = document.querySelector('#picture-template');
      var imageLoadTimeout;

      if ('content' in template) {
        this.element = template.content.children[0].cloneNode(true);
      } else {
        this.element = template.childNodes[0].cloneNode(true);
      }

      this.element.querySelector('.picture-likes').textContent = this._data.likes;
      this.element.querySelector('.picture-comments').textContent = this._data.comments;

      var img = new Image();
      img.src = this._data.url;
      img.width = PICTURE_SIDE;
      img.height = PICTURE_SIDE;

      img.onload = function() {
        clearTimeout(imageLoadTimeout);
        this.element.classList.remove('pictures-loading');
        this.element.replaceChild(img, this.element.childNodes[1]);
        actionAfterLastElement(this._isLastElement);
      }.bind(this);

      img.onerror = function() {
        this.element.classList.remove('pictures-loading');
        this.element.classList.add('picture-load-failure');
        actionAfterLastElement(this._isLastElement);
      }.bind(this);

      //в случае отсутсвия ответа сервера
      imageLoadTimeout = setTimeout(function() {
        img.src = '';
        this.element.classList.remove('pictures-loading');
        this.element.classList.add('picture-load-failure');
        actionAfterLastElement(this._isLastElement);
      }.bind(this), IMAGE_TIMEOUT);
    }
  };

  window.Photo = Photo;
})();
