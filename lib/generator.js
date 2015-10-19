'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _util = require('./util');

var Generator = (function () {
  function Generator() {
    var options = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

    _classCallCheck(this, Generator);

    (0, _util.createDelegators)(this, options);
  }

  _createClass(Generator, [{
    key: 'documentFolderNames',
    value: function documentFolderNames() {}
  }]);

  return Generator;
})();

exports['default'] = Generator;
module.exports = exports['default'];
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3NyYy9nZW5lcmF0b3IuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7O2tCQUFlLElBQUk7Ozs7b0JBQ0YsTUFBTTs7OztvQkFDUSxRQUFROztJQUVsQixTQUFTO0FBQ2pCLFdBRFEsU0FBUyxHQUNIO1FBQWIsT0FBTyx5REFBRyxFQUFFOzswQkFETCxTQUFTOztBQUUxQixnQ0FBaUIsSUFBSSxFQUFFLE9BQU8sQ0FBQyxDQUFBO0dBQ2hDOztlQUhrQixTQUFTOztXQUtULCtCQUFFLEVBRXBCOzs7U0FQa0IsU0FBUzs7O3FCQUFULFNBQVMiLCJmaWxlIjoiZ2VuZXJhdG9yLmpzIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IGZzIGZyb20gJ2ZzJ1xuaW1wb3J0IHBhdGggZnJvbSAncGF0aCdcbmltcG9ydCB7Y3JlYXRlRGVsZWdhdG9yc30gZnJvbSAnLi91dGlsJ1xuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBHZW5lcmF0b3Ige1xuICBjb25zdHJ1Y3RvcihvcHRpb25zID0ge30pe1xuICAgIGNyZWF0ZURlbGVnYXRvcnModGhpcywgb3B0aW9ucykgXG4gIH1cblxuICBkb2N1bWVudEZvbGRlck5hbWVzKCl7XG5cbiAgfVxufVxuIl19