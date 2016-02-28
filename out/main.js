/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};

/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {

/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;

/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			exports: {},
/******/ 			id: moduleId,
/******/ 			loaded: false
/******/ 		};

/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);

/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;

/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}


/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;

/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;

/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";

/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	__webpack_require__(1);
	__webpack_require__(2);
	__webpack_require__(5);
	__webpack_require__(6);


/***/ },
/* 1 */
/***/ function(module, exports) {

	'use strict';

	/**
	 * Наследование свойств и методов
	 * @param  {Function} Child  наследник-конструктор
	 * @param  {Function} Parent родитель-конструктор
	 */
	function inherit(Child, Parent) {
	  function EmptyConstructor() {}

	  EmptyConstructor.prototype = Parent.prototype;
	  Child.prototype = new EmptyConstructor();
	}

	module.exports = inherit;



/***/ },
/* 2 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	module.exports = actionAfterLastElement;
	var Photo = __webpack_require__(3);
	var Gallery = __webpack_require__(4);

	var XHR_TIMEOUT = 10000;
	var START_TIME = (new Date().valueOf()) - (14 * 24 * 60 * 60 * 1000);
	var container = document.querySelector('.pictures');
	var filters = document.querySelector('.filters');
	var filtersItem = document.querySelectorAll('.filters-radio');
	var activeFilterId = filtersItem[0].id;
	var currentPage = 0;
	var PICTURES_PER_PAGE = 12;
	var filteredPictures;
	var THROTTLE_TIMEOUT = 100;
	var elements = []; // объекты-картинки
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
	 * @return {Array<Object>} [description]
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
	    renderPictures(loadedPictures, currentPage, true);

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
	 * @return
	 */
	function actionAfterLastElement(isLastElement) {
	  console.log('wow');
	  if (isLastElement) {
	    console.log('wowow');
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
	 */
	function setActiveFilter(id, pictures) {
	  if (activeFilterId === id) {
	    return;
	  }
	  activeFilterId = id;
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
	 * @return {[type]}             [description]
	 */
	function appendPage(appendForce) {
	  var containerCoordinates = container.getBoundingClientRect();
	  if (containerCoordinates.bottom === window.innerHeight || appendForce) {
	    if (currentPage < Math.ceil(filteredPictures.length / PICTURES_PER_PAGE)) {
	      renderPictures(filteredPictures, currentPage);
	    }
	  }
	}


/***/ },
/* 3 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var actionAfterLastElement = __webpack_require__(2);

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
	  this._runOnClickEvent = this._runOnClickEvent.bind(this);
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

	    this.element.addEventListener('click', this._runOnClickEvent);
	  },
	  getData: function() {
	    return this._data;
	  },
	  onClick: null,
	  remove: function() {
	    this.element.removeEventListener('click', this._runOnClickEvent);
	  },
	  _runOnClickEvent: function(e) {
	    e.preventDefault();
	    if (e.currentTarget.classList.contains('picture')
	        && !this.element.classList.contains('picture-load-failure')) {
	      if (typeof this.onClick === 'function') {
	        this.onClick();
	      }
	    }
	  }
	};

	module.exports = Photo;



/***/ },
/* 4 */
/***/ function(module, exports) {

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
	    if (this.currentIndex + 1 < this.pictures.length) {
	      var nextPicture = this.pictures[this.currentIndex + 1];
	      if (nextPicture.element.classList.contains('picture-load-failure')) {
	        ++this.currentIndex;
	        this._onPhotoClick();
	      } else {
	        this.setCurrentPicture(++this.currentIndex);
	      }
	    }
	  },
	  setPictures: function(pictures) {
	    this.pictures = pictures;
	  },
	  setCurrentPicture: function(index) {
	    this.currentIndex = index;
	    var picture = this.pictures[index].getData();
	    var image = document.querySelector('.gallery-overlay-image');
	    var comments = document.querySelector('.gallery-overlay-controls-comments .comments-count');
	    var likes = document.querySelector('.gallery-overlay-controls-like .likes-count');

	    image.src = picture.url;
	    comments.textContent = picture.comments;
	    likes.textContent = picture.likes;
	  }
	};

	module.exports = Gallery;



/***/ },
/* 5 */
/***/ function(module, exports) {

	'use strict';

	/**
	 * @constructor
	 * @param {string} image
	 */
	var Resizer = function(image) {
	  // Изображение, с которым будет вестись работа.
	  this._image = new Image();
	  this._image.src = image;

	  // Холст.
	  this._container = document.createElement('canvas');
	  this._ctx = this._container.getContext('2d');

	  // Создаем холст только после загрузки изображения.
	  this._image.onload = function() {
	    // Размер холста равен размеру загруженного изображения. Это нужно
	    // для удобства работы с координатами.
	    this._container.width = this._image.naturalWidth;
	    this._container.height = this._image.naturalHeight;

	    /**
	     * Предлагаемый размер кадра в виде коэффициента относительно меньшей
	     * стороны изображения.
	     * @const
	     * @type {number}
	     */
	    var INITIAL_SIDE_RATIO = 0.75;
	    // Размер меньшей стороны изображения.
	    var side = Math.min(
	        this._container.width * INITIAL_SIDE_RATIO,
	        this._container.height * INITIAL_SIDE_RATIO);

	    // Изначально предлагаемое кадрирование — часть по центру с размером в 3/4
	    // от размера меньшей стороны.
	    this._resizeConstraint = new Square(
	        this._container.width / 2 - side / 2,
	        this._container.height / 2 - side / 2,
	        side);

	    // Отрисовка изначального состояния канваса.
	    this.redraw();
	  }.bind(this);

	  // Фиксирование контекста обработчиков.
	  this._onDragStart = this._onDragStart.bind(this);
	  this._onDragEnd = this._onDragEnd.bind(this);
	  this._onDrag = this._onDrag.bind(this);
	};

	Resizer.prototype = {
	  /**
	   * Родительский элемент канваса.
	   * @type {Element}
	   * @private
	   */
	  _element: null,

	  /**
	   * Положение курсора в момент перетаскивания. От положения курсора
	   * рассчитывается смещение на которое нужно переместить изображение
	   * за каждую итерацию перетаскивания.
	   * @type {Coordinate}
	   * @private
	   */
	  _cursorPosition: null,

	  /**
	   * Объект, хранящий итоговое кадрирование: сторона квадрата и смещение
	   * от верхнего левого угла исходного изображения.
	   * @type {Square}
	   * @private
	   */
	  _resizeConstraint: null,

	  /**
	   * Отрисовка канваса.
	   */
	  redraw: function() {
	    // Очистка изображения.
	    this._ctx.clearRect(0, 0, this._container.width, this._container.height);

	    // Параметры линии.
	    // NB! Такие параметры сохраняются на время всего процесса отрисовки
	    // canvas'a поэтому важно вовремя поменять их, если нужно начать отрисовку
	    // чего-либо с другой обводкой.

	    // Толщина линии.
	    this._ctx.lineWidth = 6;
	    // Цвет обводки.
	    this._ctx.strokeStyle = '#ffe753';
	    // Размер штрихов. Первый элемент массива задает длину штриха, второй
	    // расстояние между соседними штрихами.
	    this._ctx.setLineDash([15, 10]);
	    // Смещение первого штриха от начала линии.
	    this._ctx.lineDashOffset = 7;
	    //Цвет заполнения.
	    this._ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';

	    // Сохранение состояния канваса.
	    // Подробней см. строку 132.
	    this._ctx.save();

	    // Установка начальной точки системы координат в центр холста.
	    this._ctx.translate(this._container.width / 2, this._container.height / 2);

	    var displX = -(this._resizeConstraint.x + this._resizeConstraint.side / 2);
	    var displY = -(this._resizeConstraint.y + this._resizeConstraint.side / 2);


	    //Отрисова зоны, где будет "просвечиваться" картинка с рамкой.
	    this._ctx.fillRect(
	        (-this._resizeConstraint.side / 2) - this._ctx.lineWidth,
	        (-this._resizeConstraint.side / 2) - this._ctx.lineWidth,
	        this._resizeConstraint.side + this._ctx.lineWidth / 2,
	        this._resizeConstraint.side + this._ctx.lineWidth / 2);

	    //Отрисовка затемнения поверх зоны просвечивания,
	    //при этом зона просвечивания становится прозрачной.
	    this._ctx.globalCompositeOperation = 'source-out';
	    this._ctx.fillRect(displX, displY, this._container.width, this._container.height);

	    //Отрисовка изображения за затемнением.
	    this._ctx.globalCompositeOperation = 'destination-atop';
	    // Отрисовка изображения на холсте. Параметры задают изображение, которое
	    // нужно отрисовать и координаты его верхнего левого угла.
	    // Координаты задаются от центра холста.
	    this._ctx.drawImage(this._image, displX, displY);

	    //Отрисовка над всеми предыдущими отрисовками.
	    this._ctx.globalCompositeOperation = 'source-over';
	    //Отрисовка прямоугольника, обозначающего область изображения после
	    //кадрирования. Координаты задаются от центра.
	    this._ctx.strokeRect(
	        (-this._resizeConstraint.side / 2) - this._ctx.lineWidth / 2,
	        (-this._resizeConstraint.side / 2) - this._ctx.lineWidth / 2,
	        this._resizeConstraint.side - this._ctx.lineWidth / 2,
	        this._resizeConstraint.side - this._ctx.lineWidth / 2);

	    //Настройки для текста.
	    this._ctx.fillStyle = 'white';
	    this._ctx.font = '14px "Open Sans", Arial, sans-serif';
	    this._ctx.textAlign = 'center';
	    //Выводим размер кадрируемого изображения.
	    this._ctx.fillText(
	      this._image.naturalWidth + ' x ' + this._image.naturalHeight,
	      -this._ctx.lineWidth,
	      (-this._resizeConstraint.side / 2) - 2.5 * this._ctx.lineWidth);


	    // Восстановление состояния канваса, которое было до вызова ctx.save
	    // и последующего изменения системы координат. Нужно для того, чтобы
	    // следующий кадр рисовался с привычной системой координат, где точка
	    // 0 0 находится в левом верхнем углу холста, в противном случае
	    // некорректно сработает даже очистка холста или нужно будет использовать
	    // сложные рассчеты для координат прямоугольника, который нужно очистить.
	    this._ctx.restore();
	  },

	  /**
	   * Включение режима перемещения. Запоминается текущее положение курсора,
	   * устанавливается флаг, разрешающий перемещение и добавляются обработчики,
	   * позволяющие перерисовывать изображение по мере перетаскивания.
	   * @param {number} x
	   * @param {number} y
	   * @private
	   */
	  _enterDragMode: function(x, y) {
	    this._cursorPosition = new Coordinate(x, y);
	    document.body.addEventListener('mousemove', this._onDrag);
	    document.body.addEventListener('mouseup', this._onDragEnd);
	  },

	  /**
	   * Выключение режима перемещения.
	   * @private
	   */
	  _exitDragMode: function() {
	    this._cursorPosition = null;
	    document.body.removeEventListener('mousemove', this._onDrag);
	    document.body.removeEventListener('mouseup', this._onDragEnd);
	  },

	  /**
	   * Перемещение изображения относительно кадра.
	   * @param {number} x
	   * @param {number} y
	   * @private
	   */
	  updatePosition: function(x, y) {
	    this.moveConstraint(
	        this._cursorPosition.x - x,
	        this._cursorPosition.y - y);
	    this._cursorPosition = new Coordinate(x, y);
	  },

	  /**
	   * @param {MouseEvent} evt
	   * @private
	   */
	  _onDragStart: function(evt) {
	    this._enterDragMode(evt.clientX, evt.clientY);
	  },

	  /**
	   * Обработчик окончания перетаскивания.
	   * @private
	   */
	  _onDragEnd: function() {
	    this._exitDragMode();
	  },

	  /**
	   * Обработчик события перетаскивания.
	   * @param {MouseEvent} evt
	   * @private
	   */
	  _onDrag: function(evt) {
	    this.updatePosition(evt.clientX, evt.clientY);
	  },

	  /**
	   * Добавление элемента в DOM.
	   * @param {Element} element
	   */
	  setElement: function(element) {
	    if (this._element === element) {
	      return;
	    }

	    this._element = element;
	    this._element.insertBefore(this._container, this._element.firstChild);
	    // Обработчики начала и конца перетаскивания.
	    this._container.addEventListener('mousedown', this._onDragStart);
	  },

	  /**
	   * Возвращает кадрирование элемента.
	   * @return {Square}
	   */
	  getConstraint: function() {
	    return this._resizeConstraint;
	  },

	  /**
	   * Смещает кадрирование на значение указанное в параметрах.
	   * @param {number} deltaX
	   * @param {number} deltaY
	   * @param {number} deltaSide
	   */
	  moveConstraint: function(deltaX, deltaY, deltaSide) {
	    this.setConstraint(
	        this._resizeConstraint.x + (deltaX || 0),
	        this._resizeConstraint.y + (deltaY || 0),
	        this._resizeConstraint.side + (deltaSide || 0));
	  },

	  /**
	   * @param {number} x
	   * @param {number} y
	   * @param {number} side
	   */
	  setConstraint: function(x, y, side) {
	    if (typeof x !== 'undefined') {
	      this._resizeConstraint.x = x;
	    }

	    if (typeof y !== 'undefined') {
	      this._resizeConstraint.y = y;
	    }

	    if (typeof side !== 'undefined') {
	      this._resizeConstraint.side = side;
	    }

	    requestAnimationFrame(function() {
	      this.redraw();
	      window.dispatchEvent(new CustomEvent('resizerchange'));
	    }.bind(this));
	  },

	  /**
	   * Удаление. Убирает контейнер из родительского элемента, убирает
	   * все обработчики событий и убирает ссылки.
	   */
	  remove: function() {
	    this._element.removeChild(this._container);

	    this._container.removeEventListener('mousedown', this._onDragStart);
	    this._container = null;
	  },

	  /**
	   * Экспорт обрезанного изображения как HTMLImageElement и исходником
	   * картинки в src в формате dataURL.
	   * @return {Image}
	   */
	  exportImage: function() {
	    // Создаем Image, с размерами, указанными при кадрировании.
	    var imageToExport = new Image();

	    // Создается новый canvas, по размерам совпадающий с кадрированным
	    // изображением, в него добавляется изображение взятое из канваса
	    // с измененными координатами и сохраняется в dataURL, с помощью метода
	    // toDataURL. Полученный исходный код, записывается в src у ранее
	    // созданного изображения.
	    var temporaryCanvas = document.createElement('canvas');
	    var temporaryCtx = temporaryCanvas.getContext('2d');
	    temporaryCanvas.width = this._resizeConstraint.side;
	    temporaryCanvas.height = this._resizeConstraint.side;
	    temporaryCtx.drawImage(this._image,
	        -this._resizeConstraint.x,
	        -this._resizeConstraint.y);
	    imageToExport.src = temporaryCanvas.toDataURL('image/png');

	    return imageToExport;
	  }
	};

	/**
	 * Вспомогательный тип, описывающий квадрат.
	 * @constructor
	 * @param {number} x
	 * @param {number} y
	 * @param {number} side
	 * @private
	 */
	var Square = function(x, y, side) {
	  this.x = x;
	  this.y = y;
	  this.side = side;
	};

	/**
	 * Вспомогательный тип, описывающий координату.
	 * @constructor
	 * @param {number} x
	 * @param {number} y
	 * @private
	 */
	var Coordinate = function(x, y) {
	  this.x = x;
	  this.y = y;
	};

	module.exports = Resizer;



/***/ },
/* 6 */
/***/ function(module, exports, __webpack_require__) {

	/**
	 * @fileoverview
	 * @author Igor Alexeenko (o0)
	 */

	'use strict';


	var Resizer = __webpack_require__(5);

	/** @enum {string} */
	var FileType = {
	  'GIF': '',
	  'JPEG': '',
	  'PNG': '',
	  'SVG+XML': ''
	};

	/** @enum {number} */
	var Action = {
	  ERROR: 0,
	  UPLOADING: 1,
	  CUSTOM: 2
	};

	/**
	 * Регулярное выражение, проверяющее тип загружаемого файла. Составляется
	 * из ключей FileType.
	 * @type {RegExp}
	 */
	var fileRegExp = new RegExp('^image/(' + Object.keys(FileType).join('|').replace('\+', '\\+') + ')$', 'i');

	/**
	 * @type {Object.<string, string>}
	 */
	var filterMap;

	/**
	 * Объект, который занимается кадрированием изображения.
	 * @type {Resizer}
	 */
	var currentResizer;

	/**
	 * Поле для координаты Слева
	 * @type {HTMLInputElement}
	 */
	var resizeX = document.querySelector('#resize-x');

	 /**
	 * Поле для координаты Сверху
	 * @type {HTMLInputElement}
	 */
	var resizeY = document.querySelector('#resize-y');

	/**
	 * Поле для Стороны
	 * @type {HTMLInputElement}
	 */
	var resizeSide = document.querySelector('#resize-size');

	/**
	 * Кнопка применения ресайза
	 * @type {HTMLButtonElement}
	 */
	var resizeSubmit = document.querySelector('#resize-fwd');

	var resizeErrorDiv = document.createElement('div');
	resizeErrorDiv.id = 'upload-resize-error';
	var parent = document.querySelector('.upload-resize-controls');
	parent.insertBefore(resizeErrorDiv, parent.childNodes[0]);
	/**
	 * Блок для вывода сообщения
	 * @type {HTMLDivElement}
	 */
	var uploadResizeError = document.querySelector('#upload-resize-error');

	var radix = 10;

	/**
	 * Ключ для куки
	 * @type {String}
	 */
	var filterKey = 'filter';


	/**
	 * Удаляет текущий объект {@link Resizer}, чтобы создать новый с другим
	 * изображением.
	 */
	function cleanupResizer() {
	  if (currentResizer) {
	    currentResizer.remove();
	    currentResizer = null;
	  }
	}

	/**
	 * Ставит одну из трех случайных картинок на фон формы загрузки.
	 */
	function updateBackground() {
	  var images = [
	    'img/logo-background-1.jpg',
	    'img/logo-background-2.jpg',
	    'img/logo-background-3.jpg'
	  ];

	  var backgroundElement = document.querySelector('.upload');
	  var randomImageNumber = Math.round(Math.random() * (images.length - 1));
	  backgroundElement.style.backgroundImage = 'url(' + images[randomImageNumber] + ')';
	}

	/**
	 * Проверяет, валидны ли данные, в форме кадрирования.
	 * @return {Object}
	 */
	function resizeFormIsValid() {
	  var validity = {
	    valid: true,
	    message: ''
	  };
	  var width = currentResizer._image.naturalWidth;
	  var height = currentResizer._image.naturalHeight;

	  var x = {
	    label: resizeX.previousSibling.innerHTML,
	    val: resizeX.value
	  };
	  var y = {
	    label: resizeY.previousSibling.innerHTML,
	    val: resizeY.value
	  };
	  var side = {
	    label: resizeSide.previousSibling.innerHTML,
	    val: resizeSide.value
	  };
	  var formInputs = [x, y, side];

	  /**
	   * Проверка поля на пустоту
	   */
	  for (var i = 0; i < formInputs.length; i++) {
	    if (formInputs[i].val.length === 0) {
	      validity.message = 'Заполните поле "' + formInputs[i].label + '".';
	      validity.valid = false;
	      break;
	    } else {
	      formInputs[i].val = parseInt(formInputs[i].val, radix);
	    }
	  }

	  /**
	   * Проверяем поля, чтобы были положительными числовыми
	   */
	  for (var k = 0; k < formInputs.length; k++) {
	    if (isNaN(formInputs[k].val)) {
	      validity.message = 'Значение поля "' + formInputs[k].label + '" должно быть числовым.';
	      validity.valid = false;
	      break;
	    } else if (formInputs[k].val < 0) {
	      validity.message = 'Значение поля "' + formInputs[k].label + '" не может быть отрицательным.';
	      validity.valid = false;
	      break;
	    }
	  }

	  /**
	   * Проверяем корректность введенных чисел
	   */
	  if (validity.valid) {
	    if (side.val === 0) {
	      validity.message = 'Значение поля "' + side.label + '" должно быть больше 0.';
	      validity.valid = false;
	    } else if (x.val + side.val > width) {
	      validity.message = 'Суммарное значение полей "' + x.label + '" и "' + side.label + '" не должно превышать ширину исходного изображения.';
	      validity.valid = false;
	    } else if (y.val + side.val > height) {
	      validity.message = 'Суммарное значение полей "' + y.label + '" и "' + side.label + '" не должно превышать высоту исходного изображения.';
	      validity.valid = false;
	    }
	  }

	  return validity;
	}

	/**
	 * Устанавливаем значения в полях
	 */
	var CURRENT_RESIZER_TIMEOUT = 50;
	function setValues() {
	  if ((currentResizer === null) || (typeof currentResizer === 'undefined')) {
	    setTimeout(setValues, CURRENT_RESIZER_TIMEOUT);
	  } else {
	    resizeX.value = parseInt(currentResizer.getConstraint().x, radix);
	    resizeY.value = parseInt(currentResizer.getConstraint().y, radix);
	    resizeSide.value = parseInt(currentResizer.getConstraint().side, radix);
	    actionValidity();
	  }
	}

	/**
	 * Функция принятия мер в зависимости от результатов валидации
	 * @return {boolean} валидна ли форма
	 */
	var actionValidity = function() {
	  var result = resizeFormIsValid();

	  resizeSubmit.disabled = !(result.valid);
	  uploadResizeError.innerHTML = result.message;

	  if (!result.valid) {
	    uploadResizeError.style.display = 'block';
	  } else {
	    uploadResizeError.style.display = 'none';

	  }
	  return result.valid;
	};

	function actionOnInput() {
	  actionValidity();
	  currentResizer.setConstraint(parseInt(resizeX.value, radix), parseInt(resizeY.value, radix), parseInt(resizeSide.value, radix));
	}

	/**
	 * Ставим проверку на валидность
	 * при изменении значений в полях
	 * и отображаем измнения полей в currentResizer
	 */
	resizeX.addEventListener('input', actionOnInput);
	resizeY.addEventListener('input', actionOnInput);
	resizeSide.addEventListener('input', actionOnInput);

	/**
	 * @return {boolean}
	 */
	function someInputIsFocused() {
	  var inputs = document.querySelectorAll('.upload-resize-controls input');
	  for (var i = 0; i < inputs.length; i++) {
	    if (inputs[i] === document.activeElement) {
	      return true;
	    }
	  }
	  return false;
	}

	/**
	 * Форма загрузки изображения.
	 * @type {HTMLFormElement}
	 */
	var uploadForm = document.forms['upload-select-image'];

	/**
	 * Форма кадрирования изображения.
	 * @type {HTMLFormElement}
	 */
	var resizeForm = document.forms['upload-resize'];

	/**
	 * Форма добавления фильтра.
	 * @type {HTMLFormElement}
	 */
	var filterForm = document.forms['upload-filter'];

	/**
	 * @type {HTMLImageElement}
	 */
	var filterImage = filterForm.querySelector('.filter-image-preview');

	/**
	 * @type {HTMLElement}
	 */
	var uploadMessage = document.querySelector('.upload-message');

	/**
	 * @param {Action} action
	 * @param {string=} message
	 * @return {Element}
	 */
	function showMessage(action, message) {
	  var isError = false;

	  switch (action) {
	    case Action.UPLOADING:
	      message = message || 'Кексограмим&hellip;';
	      break;

	    case Action.ERROR:
	      isError = true;
	      message = message || 'Неподдерживаемый формат файла<br> <a href="' + document.location + '">Попробовать еще раз</a>.';
	      break;
	  }

	  uploadMessage.querySelector('.upload-message-container').innerHTML = message;
	  uploadMessage.classList.remove('invisible');
	  uploadMessage.classList.toggle('upload-message-error', isError);
	  return uploadMessage;
	}

	function hideMessage() {
	  uploadMessage.classList.add('invisible');
	}

	/**
	 * Очистка полей и блока ошибок
	 */
	function clearResizeForm() {
	  var inputs = resizeForm.querySelectorAll('input');
	  for (var i = 0; i < inputs.length; i++) {
	    inputs[i].value = '';
	  }
	  uploadResizeError.innerHTML = '';
	  uploadResizeError.style.display = 'none';
	}

	/*global docCookies */

	/**
	 * Устанавливает значения в форме используя куки
	 */
	function setValsFromCookies() {
	  if (docCookies.hasItem(filterKey) && filterKey === 'filter') {
	    var radios = document.querySelectorAll('.upload-filter-controls input');
	    var filterVal = docCookies.getItem(filterKey);
	    var valueExists = false;

	    for (var i = 0; i < radios.length; i++) {
	      if (radios[i].value === filterVal) {
	        radios[i].setAttribute('checked', 'checked');
	        filterImage.classList.add('filter-' + filterVal);
	        valueExists = true;
	      } else {
	        radios[i].removeAttribute('checked');
	      }
	    }

	    if (!valueExists) {
	      radios[0].setAttribute('checked", "checked');
	      filterImage.classList.add('filter-' + radios[0].value);
	    }
	  }
	}

	/**
	 * Срок жизни куки
	 * @param  {string} birthMonth месяц рождения в формате двух символов
	 * @param  {string} birthDay   день рождения в формате двух символов
	 * @return {Date}              день окончания срока
	 */
	function getExpireDay(birthMonth, birthDay) {
	  var monthAndDay = '-' + birthMonth + '-' + birthDay;
	  var assumeNearestPastBirthDay = new Date(new Date().getFullYear() + monthAndDay).valueOf();
	  var now = Date.now().valueOf();
	  var nearestPastBirthDay = function() {
	    if (assumeNearestPastBirthDay > now) {
	      return new Date((new Date().getFullYear() - 1) + monthAndDay).valueOf();
	    } else {
	      return assumeNearestPastBirthDay;
	    }
	  }();
	  var expireDay = new Date(now + now - nearestPastBirthDay);
	  return expireDay;
	}


	/**
	 * Записывает значения в куки
	 */
	function saveValuesInCookies() {
	  if (filterKey === 'filter') {
	    var checkedRadio = document.querySelector('.upload-filter-controls input:checked');
	    docCookies.setItem(filterKey, checkedRadio.value, getExpireDay('06', '15'));
	  }
	}

	var resizerChangeEvent = document.createEvent('CustomEvent');
	resizerChangeEvent.initCustomEvent('resizerchange', false, false, {});

	window.addEventListener('resizerchange', function() {
	  if (!someInputIsFocused()) {
	    setValues();
	  }
	});


	/**
	 * Обработчик изменения изображения в форме загрузки. Если загруженный
	 * файл является изображением, считывается исходник картинки, создается
	 * Resizer с загруженной картинкой, добавляется в форму кадрирования
	 * и показывается форма кадрирования.
	 * @param {Event} evt
	 */
	uploadForm.addEventListener('change', function(evt) {
	  var element = evt.target;
	  if (element.id === 'upload-file') {
	    // Проверка типа загружаемого файла, тип должен быть изображением
	    // одного из форматов: JPEG, PNG, GIF или SVG.
	    if (fileRegExp.test(element.files[0].type)) {
	      var fileReader = new FileReader();

	      showMessage(Action.UPLOADING);

	      fileReader.addEventListener('load', function() {
	        cleanupResizer();

	        currentResizer = new Resizer(fileReader.result);
	        currentResizer.setElement(resizeForm);
	        uploadMessage.classList.add('invisible');

	        uploadForm.classList.add('invisible');
	        resizeForm.classList.remove('invisible');

	        hideMessage();
	      });

	      fileReader.readAsDataURL(element.files[0]);
	      window.dispatchEvent(resizerChangeEvent);
	      //setValues();
	    } else {
	      // Показ сообщения об ошибке, если загружаемый файл, не является
	      // поддерживаемым изображением.
	      showMessage(Action.ERROR);
	    }
	  }
	});

	/**
	 * Обработка сброса формы кадрирования. Возвращает в начальное состояние
	 * и обновляет фон.
	 * @param {Event} evt
	 */
	resizeForm.addEventListener('reset', function(evt) {
	  evt.preventDefault();

	  cleanupResizer();
	  updateBackground();
	  clearResizeForm();

	  resizeForm.classList.add('invisible');
	  uploadForm.classList.remove('invisible');
	});

	/**
	 * Обработка отправки формы кадрирования. Если форма валидна, экспортирует
	 * кропнутое изображение в форму добавления фильтра и показывает ее.
	 * @param {Event} evt
	 */
	resizeForm.addEventListener('submit', function(evt) {
	  evt.preventDefault();
	  var isValid = actionValidity();

	  if (isValid) {
	    filterImage.src = currentResizer.exportImage().src;

	    resizeForm.classList.add('invisible');
	    filterForm.classList.remove('invisible');
	  }
	});

	/**
	 * Сброс формы фильтра. Показывает форму кадрирования.
	 * @param {Event} evt
	 */
	filterForm.addEventListener('reset', function(evt) {
	  evt.preventDefault();

	  filterForm.classList.add('invisible');
	  resizeForm.classList.remove('invisible');
	});

	/**
	 * Отправка формы фильтра. Возвращает в начальное состояние, предварительно
	 * записав сохраненный фильтр в cookie.
	 * @param {Event} evt
	 */
	filterForm.addEventListener('submit', function(evt) {
	  evt.preventDefault();

	  saveValuesInCookies();
	  cleanupResizer();
	  updateBackground();
	  clearResizeForm();

	  filterForm.classList.add('invisible');
	  uploadForm.classList.remove('invisible');
	});

	/**
	 * Обработчик изменения фильтра. Добавляет класс из filterMap соответствующий
	 * выбранному значению в форме.
	 */
	filterForm.addEventListener('change', function() {
	  if (!filterMap) {
	    // Ленивая инициализация. Объект не создается до тех пор, пока
	    // не понадобится прочитать его в первый раз, а после этого запоминается
	    // навсегда.
	    filterMap = {
	      'none': 'filter-none',
	      'chrome': 'filter-chrome',
	      'sepia': 'filter-sepia'
	    };
	  }

	  var selectedFilter = [].filter.call(filterForm['upload-filter'], function(item) {
	    return item.checked;
	  })[0].value;

	  // Класс перезаписывается, а не обновляется через classList потому что нужно
	  // убрать предыдущий примененный класс. Для этого нужно или запоминать его
	  // состояние или просто перезаписывать.
	  filterImage.className = 'filter-image-preview ' + filterMap[selectedFilter];
	});

	cleanupResizer();
	updateBackground();
	setValsFromCookies();




/***/ }
/******/ ]);