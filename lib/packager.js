'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var _admZip = require('adm-zip');

var _admZip2 = _interopRequireDefault(_admZip);

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

var _globAll = require('glob-all');

var _globAll2 = _interopRequireDefault(_globAll);

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var Packager = (function () {
  function Packager(briefcase) {
    var ignoreList = arguments.length <= 1 || arguments[1] === undefined ? [] : arguments[1];

    _classCallCheck(this, Packager);

    this.briefcase = briefcase;
    this.ignoreList = ignoreList;
  }

  _createClass(Packager, [{
    key: 'archive',
    value: function archive() {
      var _this = this;

      var zip = new _admZip2['default']();

      briefcase.getAllFiles().forEach(function (file) {
        var relative_path = file.replace(briefcase.root + '/');

        if (!_this.ignoreList.indexOf(relative_path) >= 0) {
          try {
            var buffer = _fs2['default'].readFileSync(_path2['default'].join(briefcase.root, relative_path));
            zip.addFile(relative_path, buffer);
          } catch (error) {}
        }
      });

      return zip;
    }

    /**
    * package up the briefcase as a zipfile
    * 
    * @param {string} path - where to persist the package
    */
  }, {
    key: 'persist',
    value: function persist(path) {
      var zip = this.archive();

      zip.writeZip(path);
    }
  }]);

  return Packager;
})();

exports['default'] = Packager;
module.exports = exports['default'];
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3NyYy9wYWNrYWdlci5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7c0JBQWdCLFNBQVM7Ozs7a0JBQ1YsSUFBSTs7Ozt1QkFDRixVQUFVOzs7O29CQUNWLE1BQU07Ozs7SUFFRixRQUFRO0FBQ2hCLFdBRFEsUUFBUSxDQUNmLFNBQVMsRUFBaUI7UUFBZixVQUFVLHlEQUFDLEVBQUU7OzBCQURqQixRQUFROztBQUV6QixRQUFJLENBQUMsU0FBUyxHQUFHLFNBQVMsQ0FBQTtBQUMxQixRQUFJLENBQUMsVUFBVSxHQUFHLFVBQVUsQ0FBQTtHQUM3Qjs7ZUFKa0IsUUFBUTs7V0FNcEIsbUJBQUc7OztBQUNSLFVBQUksR0FBRyxHQUFHLHlCQUFTLENBQUE7O0FBRW5CLGVBQVMsQ0FBQyxXQUFXLEVBQUUsQ0FBQyxPQUFPLENBQUMsVUFBQSxJQUFJLEVBQUk7QUFDdEMsWUFBSSxhQUFhLEdBQUcsSUFBSSxDQUFDLE9BQU8sQ0FBQyxTQUFTLENBQUMsSUFBSSxHQUFHLEdBQUcsQ0FBQyxDQUFBOztBQUV0RCxZQUFHLENBQUMsTUFBSyxVQUFVLENBQUMsT0FBTyxDQUFDLGFBQWEsQ0FBQyxJQUFJLENBQUMsRUFBQztBQUM5QyxjQUFJO0FBQ0YsZ0JBQUksTUFBTSxHQUFHLGdCQUFHLFlBQVksQ0FBQyxrQkFBSyxJQUFJLENBQUMsU0FBUyxDQUFDLElBQUksRUFBRSxhQUFhLENBQUMsQ0FBQyxDQUFBO0FBQ3RFLGVBQUcsQ0FBQyxPQUFPLENBQUMsYUFBYSxFQUFFLE1BQU0sQ0FBQyxDQUFBO1dBQ25DLENBQUMsT0FBTSxLQUFLLEVBQUUsRUFFZDtTQUNGO09BQ0YsQ0FBQyxDQUFBOztBQUVGLGFBQU8sR0FBRyxDQUFBO0tBQ1g7Ozs7Ozs7OztXQU9PLGlCQUFDLElBQUksRUFBQztBQUNaLFVBQUksR0FBRyxHQUFHLElBQUksQ0FBQyxPQUFPLEVBQUUsQ0FBQTs7QUFFeEIsU0FBRyxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsQ0FBQTtLQUNuQjs7O1NBbENrQixRQUFROzs7cUJBQVIsUUFBUSIsImZpbGUiOiJwYWNrYWdlci5qcyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCBaaXAgZnJvbSAnYWRtLXppcCdcbmltcG9ydCBmcyBmcm9tICdmcydcbmltcG9ydCBnbG9iIGZyb20gJ2dsb2ItYWxsJ1xuaW1wb3J0IHBhdGggZnJvbSAncGF0aCdcblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgUGFja2FnZXIge1xuICBjb25zdHJ1Y3RvcihicmllZmNhc2UsIGlnbm9yZUxpc3Q9W10pIHtcbiAgICB0aGlzLmJyaWVmY2FzZSA9IGJyaWVmY2FzZVxuICAgIHRoaXMuaWdub3JlTGlzdCA9IGlnbm9yZUxpc3RcbiAgfVxuICBcbiAgYXJjaGl2ZSgpIHtcbiAgICBsZXQgemlwID0gbmV3IFppcCgpXG4gICAgXG4gICAgYnJpZWZjYXNlLmdldEFsbEZpbGVzKCkuZm9yRWFjaChmaWxlID0+IHtcbiAgICAgIGxldCByZWxhdGl2ZV9wYXRoID0gZmlsZS5yZXBsYWNlKGJyaWVmY2FzZS5yb290ICsgJy8nKVxuXG4gICAgICBpZighdGhpcy5pZ25vcmVMaXN0LmluZGV4T2YocmVsYXRpdmVfcGF0aCkgPj0gMCl7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgbGV0IGJ1ZmZlciA9IGZzLnJlYWRGaWxlU3luYyhwYXRoLmpvaW4oYnJpZWZjYXNlLnJvb3QsIHJlbGF0aXZlX3BhdGgpKVxuICAgICAgICAgIHppcC5hZGRGaWxlKHJlbGF0aXZlX3BhdGgsIGJ1ZmZlcilcbiAgICAgICAgfSBjYXRjaChlcnJvcikge1xuXG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9KVxuXG4gICAgcmV0dXJuIHppcFxuICB9XG5cbiAgLyoqXG4gICogcGFja2FnZSB1cCB0aGUgYnJpZWZjYXNlIGFzIGEgemlwZmlsZVxuICAqIFxuICAqIEBwYXJhbSB7c3RyaW5nfSBwYXRoIC0gd2hlcmUgdG8gcGVyc2lzdCB0aGUgcGFja2FnZVxuICAqL1xuICBwZXJzaXN0IChwYXRoKXtcbiAgICBsZXQgemlwID0gdGhpcy5hcmNoaXZlKClcblxuICAgIHppcC53cml0ZVppcChwYXRoKVxuICB9XG59XG4iXX0=