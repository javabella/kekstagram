'use strict';
(function() {
  var PICTURE_SIDE = 182;
  var IMAGE_TIMEOUT = 10000;
  var XHR_TIMEOUT = 10000;
  var START_TIME = (new Date().valueOf()) - (14 * 24 * 60 * 60 * 1000);
  var container = document.querySelector('.pictures');
  var filters = document.querySelector('.filters');
  var filtersItem = document.querySelectorAll('.filters-radio');
  var activeFilterId = filtersItem[0].id;
  filters.classList.add('hidden');
  getPictures();

  function renderPictures(pictures) {
    container.classList.add('pictures-loading');
    container.innerHTML = '';

    var fragment = document.createDocumentFragment();
    pictures.forEach(function(picture, index, array) {
      var element = createElementFromTemplate(picture, (index === array.length - 1));
      fragment.appendChild(element);
    });
    container.appendChild(fragment);
  }

  /**
   * Получаем картинки и отправляем их на отображение
   * @return {Array<Object>} [description]
   */
  function getPictures() {
    var xhr = new XMLHttpRequest();
    var loadedPictures;
    xhr.open('GET', 'http://o0.github.io/assets/json/pictures.json');
    xhr.timeout = XHR_TIMEOUT;
    xhr.onload = function(e) {
      var response = e.target.response;
      loadedPictures = JSON.parse(response);

      container.classList.remove('pictures-failure');
      renderPictures(loadedPictures);
      for (var i = 0; i < filtersItem.length; i++) {
        filtersItem[i].onclick = function(ev) {
          var filterId = ev.target.id;
          setActiveFilter(filterId, loadedPictures);
        };
      }
    };
    xhr.onerror = function() {
      container.classList.add('pictures-failure');
    };
    xhr.ontimeout = function() {
      container.classList.add('pictures-failure');
    };

    xhr.send();
  }

  /**
   * Создает элемент по шаблону
   * @param  {Object} data
   * @param  {boolean} isLastElement
   * @return {HTMLElement}
   */
  function createElementFromTemplate(data, isLastElement) {
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
      element.classList.remove('pictures-loading');
      element.replaceChild(img, element.childNodes[1]);
      actionAfterLastElement(isLastElement);
    };

    img.onerror = function() {
      element.classList.remove('pictures-loading');
      element.classList.add('picture-load-failure');
      actionAfterLastElement(isLastElement);
    };

    //в случае отсутсвия ответа сервера
    imageLoadTimeout = setTimeout(function() {
      img.src = '';
      element.classList.remove('pictures-loading');
      element.classList.add('picture-load-failure');
      actionAfterLastElement(isLastElement);
    }, IMAGE_TIMEOUT);

    return element;
  }

  /**
   * Действия, выполняющиеся после обработки последнего элемента
   * @param  {Boolean} isLastElement
   * @return
   */
  function actionAfterLastElement(isLastElement) {
    if (isLastElement) {
      filters.classList.remove('hidden');
      container.classList.remove('pictures-loading');
    }
  }

  /**
   * Установка выбранного фильтра
   * @param {string} id               идентификатор фильтра
   * @param {Array<Object>} pictures  загруженные картинки
   */
  function setActiveFilter(id, pictures) {
    if (activeFilterId === id) {
      return;
    }
    activeFilterId = id;
    var filteredPictures = pictures.slice(0);

    switch (id) {
      case 'filter-discussed':
        filteredPictures = filteredPictures.sort(function(a, b) {
          return b.comments - a.comments;
        });
        break;
      case 'filter-new':
        filteredPictures = filteredPictures.sort(function(a, b) {
          return new Date(b.date).valueOf() - new Date(a.date).valueOf();
        });
        filteredPictures = filteredPictures.filter(function(picture) {
          return new Date(picture.date).valueOf() >= START_TIME;
        });
        break;
    }

    renderPictures(filteredPictures);
  }
})();
