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
    key: 'run',
    value: function run() {
      var _this = this;

      documentFolderNames().forEach(function (baseName) {
        var modelFolderPath = _path2['default'].join(_this.root, 'docs', baseName);
        console.log("Creating " + baseName + " Folder", modelFolderPath);
        try {
          _fs2['default'].mkdirpSync(modelFolderPath);
        } catch (e) {
          console.log("Error: " + e.message);
        }
      });

      return this;
    }
  }, {
    key: 'documentFolderNames',
    value: function documentFolderNames() {
      return (0, _util.flatten)(this.brief.plugins.map(function (plugin) {
        var list = [];
        if (plugin.groupNames) {
          list = plugin.groupNames();
        }
        return list;
      }));
    }
  }]);

  return Generator;
})();

exports['default'] = Generator;
module.exports = exports['default'];
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3NyYy9nZW5lcmF0b3IuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7O2tCQUFlLElBQUk7Ozs7b0JBQ0YsTUFBTTs7OztvQkFLaEIsUUFBUTs7SUFFTSxTQUFTO0FBQ2pCLFdBRFEsU0FBUyxHQUNIO1FBQWIsT0FBTyx5REFBRyxFQUFFOzswQkFETCxTQUFTOztBQUUxQixnQ0FBaUIsSUFBSSxFQUFFLE9BQU8sQ0FBQyxDQUFBO0dBQ2hDOztlQUhrQixTQUFTOztXQUt6QixlQUFFOzs7QUFDSCx5QkFBbUIsRUFBRSxDQUFDLE9BQU8sQ0FBQyxVQUFBLFFBQVEsRUFBSTtBQUN4QyxZQUFJLGVBQWUsR0FBRyxrQkFBSyxJQUFJLENBQUMsTUFBSyxJQUFJLEVBQUUsTUFBTSxFQUFFLFFBQVEsQ0FBQyxDQUFBO0FBQzVELGVBQU8sQ0FBQyxHQUFHLENBQUMsV0FBVyxHQUFHLFFBQVEsR0FBRyxTQUFTLEVBQUUsZUFBZSxDQUFDLENBQUE7QUFDaEUsWUFBSTtBQUNGLDBCQUFHLFVBQVUsQ0FBQyxlQUFlLENBQUMsQ0FBQTtTQUMvQixDQUFDLE9BQU8sQ0FBQyxFQUFFO0FBQ1YsaUJBQU8sQ0FBQyxHQUFHLENBQUMsU0FBUyxHQUFHLENBQUMsQ0FBQyxPQUFPLENBQUMsQ0FBQTtTQUNuQztPQUNGLENBQUMsQ0FBQTs7QUFFRixhQUFPLElBQUksQ0FBQztLQUNiOzs7V0FFa0IsK0JBQUU7QUFDbkIsYUFBTyxtQkFBUSxJQUFJLENBQUMsS0FBSyxDQUFDLE9BQU8sQ0FBQyxHQUFHLENBQUMsVUFBQSxNQUFNLEVBQUk7QUFDOUMsWUFBSSxJQUFJLEdBQUcsRUFBRSxDQUFBO0FBQ2IsWUFBRyxNQUFNLENBQUMsVUFBVSxFQUFDO0FBQ25CLGNBQUksR0FBRyxNQUFNLENBQUMsVUFBVSxFQUFFLENBQUE7U0FDM0I7QUFDRCxlQUFPLElBQUksQ0FBQTtPQUNaLENBQUMsQ0FBQyxDQUFBO0tBQ0o7OztTQTNCa0IsU0FBUzs7O3FCQUFULFNBQVMiLCJmaWxlIjoiZ2VuZXJhdG9yLmpzIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IGZzIGZyb20gJ2ZzJ1xuaW1wb3J0IHBhdGggZnJvbSAncGF0aCdcblxuaW1wb3J0IHtcbiAgY3JlYXRlRGVsZWdhdG9ycyxcbiAgZmxhdHRlblxufSBmcm9tICcuL3V0aWwnXG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIEdlbmVyYXRvciB7XG4gIGNvbnN0cnVjdG9yKG9wdGlvbnMgPSB7fSl7XG4gICAgY3JlYXRlRGVsZWdhdG9ycyh0aGlzLCBvcHRpb25zKSBcbiAgfVxuICBcbiAgcnVuKCl7XG4gICAgZG9jdW1lbnRGb2xkZXJOYW1lcygpLmZvckVhY2goYmFzZU5hbWUgPT4ge1xuICAgICAgbGV0IG1vZGVsRm9sZGVyUGF0aCA9IHBhdGguam9pbih0aGlzLnJvb3QsICdkb2NzJywgYmFzZU5hbWUpXG4gICAgICBjb25zb2xlLmxvZyhcIkNyZWF0aW5nIFwiICsgYmFzZU5hbWUgKyBcIiBGb2xkZXJcIiwgbW9kZWxGb2xkZXJQYXRoKVxuICAgICAgdHJ5IHtcbiAgICAgICAgZnMubWtkaXJwU3luYyhtb2RlbEZvbGRlclBhdGgpXG4gICAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgIGNvbnNvbGUubG9nKFwiRXJyb3I6IFwiICsgZS5tZXNzYWdlKVxuICAgICAgfVxuICAgIH0pXG5cbiAgICByZXR1cm4gdGhpcztcbiAgfVxuXG4gIGRvY3VtZW50Rm9sZGVyTmFtZXMoKXtcbiAgICByZXR1cm4gZmxhdHRlbih0aGlzLmJyaWVmLnBsdWdpbnMubWFwKHBsdWdpbiA9PiB7XG4gICAgICBsZXQgbGlzdCA9IFtdXG4gICAgICBpZihwbHVnaW4uZ3JvdXBOYW1lcyl7XG4gICAgICAgIGxpc3QgPSBwbHVnaW4uZ3JvdXBOYW1lcygpXG4gICAgICB9XG4gICAgICByZXR1cm4gbGlzdFxuICAgIH0pKVxuICB9XG59XG4iXX0=