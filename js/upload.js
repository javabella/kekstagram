/**
 * @fileoverview
 * @author Igor Alexeenko (o0)
 */

'use strict';


var Resizer = require('resizer');

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


