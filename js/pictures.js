'use strict';

module.exports = actionAfterLastElement;
var Photo = require('photo');
var Gallery = require('gallery');

var XHR_TIMEOUT = 10000;
var START_TIME = (new Date().valueOf()) - (14 * 24 * 60 * 60 * 1000);
var container = document.querySelector('.pictures');
var filters = document.querySelector('.filters');
var filtersItem = document.querySelectorAll('.filters-radio');
/**
 * название-идентификатор фильтра
 * @type {string}
 */
var activeFilterId = localStorage.getItem('activeFilterId') || filtersItem[0].id;
var currentPage = 0;
var PICTURES_PER_PAGE = 12;
var filteredPictures;
var THROTTLE_TIMEOUT = 100;
/**
 * объекты-картинки
 * @type {Array<Photo>}
 */
var elements = [];
var gallery = new Gallery();

filters.classList.add('hidden');
getPictures();

/**
 * Вывод картинок
 * @param  {Array<Object>}  pictures
 * @param  {number}         pageNumber
 * @param  {boolean}        replace
 * @return
 */
function renderPictures(pictures, pageNumber, replace) {
  container.classList.add('pictures-loading');
  if (replace) {
    elements.forEach(function(element) {
      element.onClick = null;
      element.remove();
      container.removeChild(element.element);
    });
    elements.length = 0;
  }

  var fragment = document.createDocumentFragment();
  var fromItem = pageNumber * PICTURES_PER_PAGE;
  var toItem = fromItem + PICTURES_PER_PAGE;
  var pagePictures = pictures.slice(fromItem, toItem);

  pagePictures.forEach(function(picture, index, array) {
    var element = new Photo(picture, (index === array.length - 1));
    elements.push(element);
    element.render();
    fragment.appendChild(element.element);
  });

  elements.forEach(function(element, index) {
    /**
     * Обработчик клика по картинке
     */
    element.onClick = function() {
      gallery.setCurrentPicture(index);
      gallery.show();
    };
  });
  //записываем в галерею текущий набор объектов-картинок
  gallery.setPictures(elements);

  container.appendChild(fragment);
  currentPage++;
}

/**
 * Получаем картинки и отправляем их на отображение
 */
function getPictures() {
  var xhr = new XMLHttpRequest();
  var loadedPictures;
  xhr.open('GET', 'https://o0.github.io/assets/json/pictures.json');
  xhr.timeout = XHR_TIMEOUT;
  xhr.onload = function(e) {
    var response = e.target.response;
    loadedPictures = JSON.parse(response);

    container.classList.remove('pictures-failure');
    filteredPictures = loadedPictures;
    currentPage = 0;

    document.getElementById(activeFilterId).click();
    setActiveFilter(activeFilterId, loadedPictures, true);

    filters.addEventListener('click', function(ev) {
      var clickedElement = ev.target;
      if (clickedElement.classList.contains('filters-item')) {
        setActiveFilter(clickedElement.getAttribute('for'), loadedPictures);
      }
    });
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
 * Действия, выполняющиеся после обработки последнего элемента
 * @param  {Boolean} isLastElement
 */
function actionAfterLastElement(isLastElement) {
  if (isLastElement) {
    filters.classList.remove('hidden');
    container.classList.remove('pictures-loading');
    // Додобавляем страницы в случае большого экрана
    var containerCoordinates = container.getBoundingClientRect();
    if (containerCoordinates.bottom < window.innerHeight) {
      appendPage(true);
    }
  }
}

/**
 * Установка выбранного фильтра
 * @param {string} id               идентификатор фильтра
 * @param {Array<Object>} pictures  загруженные картинки
 * @param {boolean} setForce        'насильно' установить нужный фильтр
 */
function setActiveFilter(id, pictures, setForce) {
  if (activeFilterId === id && !setForce) {
    return;
  }
  activeFilterId = id;
  localStorage.setItem('activeFilterId', activeFilterId);
  filteredPictures = pictures.slice(0);

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

  currentPage = 0;
  renderPictures(filteredPictures, currentPage, true);
}

var scrollTimeout;

window.addEventListener('scroll', function() {
  clearTimeout(scrollTimeout);
  scrollTimeout = setTimeout(function() {
    appendPage();
  }, THROTTLE_TIMEOUT);
});

/**
 * Добавление в конец новой страницы
 * @param  {boolean} appendForce
 */
function appendPage(appendForce) {
  var containerCoordinates = container.getBoundingClientRect();
  if (containerCoordinates.bottom === window.innerHeight || appendForce) {
    if (currentPage < Math.ceil(filteredPictures.length / PICTURES_PER_PAGE)) {
      renderPictures(filteredPictures, currentPage);
    }
  }
}
