'use strict';

// спешл для iframe
if (window.location !== window.parent.location) {
  window.parent.location = window.location;
}

require('inherit');
require('pictures');
require('resizer');
require('upload');
