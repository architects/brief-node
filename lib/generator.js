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
      var root = this.root || process.env.PWD;
      this.documentFolderNames().forEach(function (baseName) {
        var modelFolderPath = _path2['default'].join(root, 'docs', baseName);
        console.log("Creating " + baseName + " Folder", modelFolderPath);
        try {
          if (!_fs2['default'].existsSync(modelFolderPath)) {
            _fs2['default'].mkdirSync(modelFolderPath);
          }
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
          list = plugin.groupNames;
        }
        return list;
      }));
    }
  }]);

  return Generator;
})();

exports['default'] = Generator;
module.exports = exports['default'];
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3NyYy9nZW5lcmF0b3IuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7O2tCQUFlLElBQUk7Ozs7b0JBQ0YsTUFBTTs7OztvQkFLaEIsUUFBUTs7SUFFTSxTQUFTO0FBQ2pCLFdBRFEsU0FBUyxHQUNIO1FBQWIsT0FBTyx5REFBRyxFQUFFOzswQkFETCxTQUFTOztBQUUxQixnQ0FBaUIsSUFBSSxFQUFFLE9BQU8sQ0FBQyxDQUFBO0dBQ2hDOztlQUhrQixTQUFTOztXQUt6QixlQUFFO0FBQ0gsVUFBSSxJQUFJLEdBQUcsSUFBSSxDQUFDLElBQUksSUFBSSxPQUFPLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQTtBQUN2QyxVQUFJLENBQUMsbUJBQW1CLEVBQUUsQ0FBQyxPQUFPLENBQUMsVUFBQSxRQUFRLEVBQUk7QUFDN0MsWUFBSSxlQUFlLEdBQUcsa0JBQUssSUFBSSxDQUFDLElBQUksRUFBRSxNQUFNLEVBQUUsUUFBUSxDQUFDLENBQUE7QUFDdkQsZUFBTyxDQUFDLEdBQUcsQ0FBQyxXQUFXLEdBQUcsUUFBUSxHQUFHLFNBQVMsRUFBRSxlQUFlLENBQUMsQ0FBQTtBQUNoRSxZQUFJO0FBQ0YsY0FBRyxDQUFDLGdCQUFHLFVBQVUsQ0FBQyxlQUFlLENBQUMsRUFBQztBQUNqQyw0QkFBRyxTQUFTLENBQUMsZUFBZSxDQUFDLENBQUE7V0FDOUI7U0FDRixDQUFDLE9BQU8sQ0FBQyxFQUFFO0FBQ1YsaUJBQU8sQ0FBQyxHQUFHLENBQUMsU0FBUyxHQUFHLENBQUMsQ0FBQyxPQUFPLENBQUMsQ0FBQTtTQUNuQztPQUNGLENBQUMsQ0FBQTs7QUFFRixhQUFPLElBQUksQ0FBQztLQUNiOzs7V0FFa0IsK0JBQUU7QUFDbkIsYUFBTyxtQkFBUSxJQUFJLENBQUMsS0FBSyxDQUFDLE9BQU8sQ0FBQyxHQUFHLENBQUMsVUFBQSxNQUFNLEVBQUk7QUFDOUMsWUFBSSxJQUFJLEdBQUcsRUFBRSxDQUFBO0FBQ2IsWUFBRyxNQUFNLENBQUMsVUFBVSxFQUFDO0FBQ25CLGNBQUksR0FBRyxNQUFNLENBQUMsVUFBVSxDQUFBO1NBQ3pCO0FBQ0QsZUFBTyxJQUFJLENBQUE7T0FDWixDQUFDLENBQUMsQ0FBQTtLQUNKOzs7U0E5QmtCLFNBQVM7OztxQkFBVCxTQUFTIiwiZmlsZSI6ImdlbmVyYXRvci5qcyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCBmcyBmcm9tICdmcydcbmltcG9ydCBwYXRoIGZyb20gJ3BhdGgnXG5cbmltcG9ydCB7XG4gIGNyZWF0ZURlbGVnYXRvcnMsXG4gIGZsYXR0ZW5cbn0gZnJvbSAnLi91dGlsJ1xuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBHZW5lcmF0b3Ige1xuICBjb25zdHJ1Y3RvcihvcHRpb25zID0ge30pe1xuICAgIGNyZWF0ZURlbGVnYXRvcnModGhpcywgb3B0aW9ucykgXG4gIH1cbiAgXG4gIHJ1bigpe1xuICAgIGxldCByb290ID0gdGhpcy5yb290IHx8IHByb2Nlc3MuZW52LlBXRFxuICAgIHRoaXMuZG9jdW1lbnRGb2xkZXJOYW1lcygpLmZvckVhY2goYmFzZU5hbWUgPT4ge1xuICAgICAgbGV0IG1vZGVsRm9sZGVyUGF0aCA9IHBhdGguam9pbihyb290LCAnZG9jcycsIGJhc2VOYW1lKVxuICAgICAgY29uc29sZS5sb2coXCJDcmVhdGluZyBcIiArIGJhc2VOYW1lICsgXCIgRm9sZGVyXCIsIG1vZGVsRm9sZGVyUGF0aClcbiAgICAgIHRyeSB7XG4gICAgICAgIGlmKCFmcy5leGlzdHNTeW5jKG1vZGVsRm9sZGVyUGF0aCkpe1xuICAgICAgICAgIGZzLm1rZGlyU3luYyhtb2RlbEZvbGRlclBhdGgpXG4gICAgICAgIH1cbiAgICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgY29uc29sZS5sb2coXCJFcnJvcjogXCIgKyBlLm1lc3NhZ2UpXG4gICAgICB9XG4gICAgfSlcblxuICAgIHJldHVybiB0aGlzO1xuICB9XG5cbiAgZG9jdW1lbnRGb2xkZXJOYW1lcygpe1xuICAgIHJldHVybiBmbGF0dGVuKHRoaXMuYnJpZWYucGx1Z2lucy5tYXAocGx1Z2luID0+IHtcbiAgICAgIGxldCBsaXN0ID0gW11cbiAgICAgIGlmKHBsdWdpbi5ncm91cE5hbWVzKXtcbiAgICAgICAgbGlzdCA9IHBsdWdpbi5ncm91cE5hbWVzXG4gICAgICB9XG4gICAgICByZXR1cm4gbGlzdFxuICAgIH0pKVxuICB9XG59XG4iXX0=