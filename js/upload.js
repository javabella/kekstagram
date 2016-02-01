/* global Resizer: true */

/**
 * @fileoverview
 * @author Igor Alexeenko (o0)
 */

'use strict';

(function() {
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
   * @return {boolean}
   */
  function resizeFormIsValid() {
    var valid = true;
    var width = currentResizer._image.naturalWidth;
    var height = currentResizer._image.naturalHeight;
    var currentX = currentResizer._resizeConstraint.x;
    var currentY = currentResizer._resizeConstraint.y;
    var currentSide = currentResizer._resizeConstraint.side;
    var radix = 10;

    var x = {
      label: resizeX.previousSibling.innerHTML,
      val: (resizeX.value === '') ? currentX : parseInt(resizeX.value, radix)
    };
    var y = {
      label: resizeY.previousSibling.innerHTML,
      val: (resizeY.value === '') ? currentY : parseInt(resizeY.value, radix)
    };
    var side = {
      label: resizeSide.previousSibling.innerHTML,
      val: (resizeSide.value === '') ? currentSide : parseInt(resizeSide.value, radix)
    };
    var formInputs = [x, y, side];

    /**
     * Проверяем поля, чтобы были положительными числовыми
     */
    for (var i = 0; i < formInputs.length; i++) {
      if (isNaN(formInputs[i].val)) {
        showMessage(Action.CUSTOM, 'Значение поля "' + formInputs[i].label + '" не числовое.');
        valid = false;
        break;
      } else if (formInputs[i].val < 0) {
        showMessage(Action.CUSTOM, 'Значение поля "' + formInputs[i].label + '" не может быть отрицательным.');
        valid = false;
        break;
      }
    }

    /**
     * Проверяем корректность введенных чисел
     */
    if (valid) {
      if (side.val === 0) {
        showMessage(Action.CUSTOM, 'Значение поля "' + side.label + '" должно быть больше 0.');
      } else if (x.val + side.val > width) {
        showMessage(Action.CUSTOM, 'Суммарное значение полей "' + x.label + '" и "' + side.label + '" не должно превышать ширину исходного изображения.');
        valid = false;
      } else if (y.val + side.val > height) {
        showMessage(Action.CUSTOM, 'Суммарное значение полей "' + y.label + '" и "' + side.label + '" не должно превышать высоту исходного изображения.');
        valid = false;
      }
    }

    return valid;
  }

  /**
   * Устанавливает прослушку закрытия окна сообщения
   */
  function listenHideBtn() {
    var hideBtn = document.querySelector('.hide-message');
    hideBtn.onclick = function(e) {
      e.preventDefault();
      resizeSubmit.disabled = false;
      hideMessage();
    };
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

      case Action.CUSTOM:
        message = (message || 'Что-то пошло не так') + '<br> <a class="hide-message" href="' + document.location + '">Попробовать еще раз</a>.';
        break;
    }

    uploadMessage.querySelector('.upload-message-container').innerHTML = message;
    uploadMessage.classList.remove('invisible');
    uploadMessage.classList.toggle('upload-message-error', isError);
    if (action === Action.CUSTOM) {
      resizeSubmit.disabled = true;
      listenHideBtn();
    }
    return uploadMessage;
  }

  function hideMessage() {
    uploadMessage.classList.add('invisible');
  }

  /**
   * Очистка полей
   */
  function clearResizeFormInputs() {
    var inputs = resizeForm.querySelectorAll('input');
    for (var i = 0; i < inputs.length; i++) {
      inputs[i].value = '';
    }
  }

  /**
   * Обработчик изменения изображения в форме загрузки. Если загруженный
   * файл является изображением, считывается исходник картинки, создается
   * Resizer с загруженной картинкой, добавляется в форму кадрирования
   * и показывается форма кадрирования.
   * @param {Event} evt
   */
  uploadForm.onchange = function(evt) {
    var element = evt.target;
    if (element.id === 'upload-file') {
      // Проверка типа загружаемого файла, тип должен быть изображением
      // одного из форматов: JPEG, PNG, GIF или SVG.
      if (fileRegExp.test(element.files[0].type)) {
        var fileReader = new FileReader();

        showMessage(Action.UPLOADING);

        fileReader.onload = function() {
          cleanupResizer();

          currentResizer = new Resizer(fileReader.result);
          currentResizer.setElement(resizeForm);
          uploadMessage.classList.add('invisible');

          uploadForm.classList.add('invisible');
          resizeForm.classList.remove('invisible');

          hideMessage();
        };

        fileReader.readAsDataURL(element.files[0]);
      } else {
        // Показ сообщения об ошибке, если загружаемый файл, не является
        // поддерживаемым изображением.
        showMessage(Action.ERROR);
      }
    }
  };

  /**
   * Обработка сброса формы кадрирования. Возвращает в начальное состояние
   * и обновляет фон.
   * @param {Event} evt
   */
  resizeForm.onreset = function(evt) {
    evt.preventDefault();

    cleanupResizer();
    updateBackground();
    clearResizeFormInputs();

    resizeForm.classList.add('invisible');
    uploadForm.classList.remove('invisible');
  };

  /**
   * Обработка отправки формы кадрирования. Если форма валидна, экспортирует
   * кропнутое изображение в форму добавления фильтра и показывает ее.
   * @param {Event} evt
   */
  resizeForm.onsubmit = function(evt) {
    evt.preventDefault();

    if (resizeFormIsValid()) {
      filterImage.src = currentResizer.exportImage().src;

      resizeForm.classList.add('invisible');
      filterForm.classList.remove('invisible');
    }
  };

  /**
   * Сброс формы фильтра. Показывает форму кадрирования.
   * @param {Event} evt
   */
  filterForm.onreset = function(evt) {
    evt.preventDefault();

    filterForm.classList.add('invisible');
    resizeForm.classList.remove('invisible');
  };

  /**
   * Отправка формы фильтра. Возвращает в начальное состояние, предварительно
   * записав сохраненный фильтр в cookie.
   * @param {Event} evt
   */
  filterForm.onsubmit = function(evt) {
    evt.preventDefault();

    cleanupResizer();
    updateBackground();
    clearResizeFormInputs();

    filterForm.classList.add('invisible');
    uploadForm.classList.remove('invisible');
  };

  /**
   * Обработчик изменения фильтра. Добавляет класс из filterMap соответствующий
   * выбранному значению в форме.
   */
  filterForm.onchange = function() {
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
  };

  cleanupResizer();
  updateBackground();
})();
