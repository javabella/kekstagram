'use strict';
(function() {
  var PICTURE_SIDE = 182;
  var IMAGE_TIMEOUT = 10000;
  var container = document.querySelector('.pictures');
  var filters = document.querySelector('.filters');

  filters.classList.add('hidden');

  /*global pictures */

  pictures.forEach(function(picture, index, array) {
    var element = createElementFromTemplate(picture);
    container.appendChild(element);
    if (index === array.length - 1) {
      filters.classList.remove('hidden');
    }
  });

  /**
   * Создает элемент по шаблону
   * @param  {Object} data
   * @return {HTMLElement}
   */
  function createElementFromTemplate(data) {
    var template = document.querySelector('#picture-template');
    var element;
    var imageLoadTimeout;

    if ('content' in template) {
      element = template.content.children[0].cloneNode(true);
    } else {
      element = template.childNodes[0].cloneNode(true);
    }

    element.querySelector('.picture-likes').textContent = data.likes;
    element.querySelector('.picture-comments').textContent = data.comments;

    var img = new Image();
    img.src = data.url;
    img.width = PICTURE_SIDE;
    img.height = PICTURE_SIDE;

    img.onload = function() {
      clearTimeout(imageLoadTimeout);
      element.replaceChild(img, element.childNodes[1]);
    };

    img.onerror = function() {
      element.classList.add('picture-load-failure');
    };

    //в случае отсутсвия ответа сервера
    imageLoadTimeout = setTimeout(function() {
      img.src = '';
      element.classList.add('picture-load-failure');
    }, IMAGE_TIMEOUT);

    return element;
  }
})();
