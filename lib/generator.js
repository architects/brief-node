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

      this.documentFolderNames().forEach(function (baseName) {
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3NyYy9nZW5lcmF0b3IuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7O2tCQUFlLElBQUk7Ozs7b0JBQ0YsTUFBTTs7OztvQkFLaEIsUUFBUTs7SUFFTSxTQUFTO0FBQ2pCLFdBRFEsU0FBUyxHQUNIO1FBQWIsT0FBTyx5REFBRyxFQUFFOzswQkFETCxTQUFTOztBQUUxQixnQ0FBaUIsSUFBSSxFQUFFLE9BQU8sQ0FBQyxDQUFBO0dBQ2hDOztlQUhrQixTQUFTOztXQUt6QixlQUFFOzs7QUFDSCxVQUFJLENBQUMsbUJBQW1CLEVBQUUsQ0FBQyxPQUFPLENBQUMsVUFBQSxRQUFRLEVBQUk7QUFDN0MsWUFBSSxlQUFlLEdBQUcsa0JBQUssSUFBSSxDQUFDLE1BQUssSUFBSSxFQUFFLE1BQU0sRUFBRSxRQUFRLENBQUMsQ0FBQTtBQUM1RCxlQUFPLENBQUMsR0FBRyxDQUFDLFdBQVcsR0FBRyxRQUFRLEdBQUcsU0FBUyxFQUFFLGVBQWUsQ0FBQyxDQUFBO0FBQ2hFLFlBQUk7QUFDRiwwQkFBRyxVQUFVLENBQUMsZUFBZSxDQUFDLENBQUE7U0FDL0IsQ0FBQyxPQUFPLENBQUMsRUFBRTtBQUNWLGlCQUFPLENBQUMsR0FBRyxDQUFDLFNBQVMsR0FBRyxDQUFDLENBQUMsT0FBTyxDQUFDLENBQUE7U0FDbkM7T0FDRixDQUFDLENBQUE7O0FBRUYsYUFBTyxJQUFJLENBQUM7S0FDYjs7O1dBRWtCLCtCQUFFO0FBQ25CLGFBQU8sbUJBQVEsSUFBSSxDQUFDLEtBQUssQ0FBQyxPQUFPLENBQUMsR0FBRyxDQUFDLFVBQUEsTUFBTSxFQUFJO0FBQzlDLFlBQUksSUFBSSxHQUFHLEVBQUUsQ0FBQTtBQUNiLFlBQUcsTUFBTSxDQUFDLFVBQVUsRUFBQztBQUNuQixjQUFJLEdBQUcsTUFBTSxDQUFDLFVBQVUsQ0FBQTtTQUN6QjtBQUNELGVBQU8sSUFBSSxDQUFBO09BQ1osQ0FBQyxDQUFDLENBQUE7S0FDSjs7O1NBM0JrQixTQUFTOzs7cUJBQVQsU0FBUyIsImZpbGUiOiJnZW5lcmF0b3IuanMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgZnMgZnJvbSAnZnMnXG5pbXBvcnQgcGF0aCBmcm9tICdwYXRoJ1xuXG5pbXBvcnQge1xuICBjcmVhdGVEZWxlZ2F0b3JzLFxuICBmbGF0dGVuXG59IGZyb20gJy4vdXRpbCdcblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgR2VuZXJhdG9yIHtcbiAgY29uc3RydWN0b3Iob3B0aW9ucyA9IHt9KXtcbiAgICBjcmVhdGVEZWxlZ2F0b3JzKHRoaXMsIG9wdGlvbnMpIFxuICB9XG4gIFxuICBydW4oKXtcbiAgICB0aGlzLmRvY3VtZW50Rm9sZGVyTmFtZXMoKS5mb3JFYWNoKGJhc2VOYW1lID0+IHtcbiAgICAgIGxldCBtb2RlbEZvbGRlclBhdGggPSBwYXRoLmpvaW4odGhpcy5yb290LCAnZG9jcycsIGJhc2VOYW1lKVxuICAgICAgY29uc29sZS5sb2coXCJDcmVhdGluZyBcIiArIGJhc2VOYW1lICsgXCIgRm9sZGVyXCIsIG1vZGVsRm9sZGVyUGF0aClcbiAgICAgIHRyeSB7XG4gICAgICAgIGZzLm1rZGlycFN5bmMobW9kZWxGb2xkZXJQYXRoKVxuICAgICAgfSBjYXRjaCAoZSkge1xuICAgICAgICBjb25zb2xlLmxvZyhcIkVycm9yOiBcIiArIGUubWVzc2FnZSlcbiAgICAgIH1cbiAgICB9KVxuXG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cblxuICBkb2N1bWVudEZvbGRlck5hbWVzKCl7XG4gICAgcmV0dXJuIGZsYXR0ZW4odGhpcy5icmllZi5wbHVnaW5zLm1hcChwbHVnaW4gPT4ge1xuICAgICAgbGV0IGxpc3QgPSBbXVxuICAgICAgaWYocGx1Z2luLmdyb3VwTmFtZXMpe1xuICAgICAgICBsaXN0ID0gcGx1Z2luLmdyb3VwTmFtZXNcbiAgICAgIH1cbiAgICAgIHJldHVybiBsaXN0XG4gICAgfSkpXG4gIH1cbn1cbiJdfQ==