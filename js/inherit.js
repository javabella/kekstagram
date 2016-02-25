'use strict';
(function() {
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

  window.inherit = inherit;
})();
