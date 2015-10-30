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
      this.createDocumentFolders();
      this.createOutline();
    }
  }, {
    key: 'createOutline',
    value: function createOutline() {
      var root = this.root || process.env.PWD;

      var lines = ['---', 'type: outline', 'title: outline', '---', '', '# Outline', '', 'This is an outline for the briefcase.', '', '## Table of Contents', ''];

      var pathname = _path2['default'].join(root, 'docs', 'outline.md');

      _fs2['default'].writeFileSync(pathname, lines.join("\n"));
    }
  }, {
    key: 'createDocumentFolders',
    value: function createDocumentFolders() {
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3NyYy9nZW5lcmF0b3IuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7O2tCQUFlLElBQUk7Ozs7b0JBQ0YsTUFBTTs7OztvQkFLaEIsUUFBUTs7SUFFTSxTQUFTO0FBQ2pCLFdBRFEsU0FBUyxHQUNIO1FBQWIsT0FBTyx5REFBRyxFQUFFOzswQkFETCxTQUFTOztBQUUxQixnQ0FBaUIsSUFBSSxFQUFFLE9BQU8sQ0FBQyxDQUFBO0dBQ2hDOztlQUhrQixTQUFTOztXQUt6QixlQUFFO0FBQ0gsVUFBSSxDQUFDLHFCQUFxQixFQUFFLENBQUE7QUFDNUIsVUFBSSxDQUFDLGFBQWEsRUFBRSxDQUFBO0tBQ3JCOzs7V0FFWSx5QkFBRTtBQUNiLFVBQUksSUFBSSxHQUFHLElBQUksQ0FBQyxJQUFJLElBQUksT0FBTyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUE7O0FBRXZDLFVBQUksS0FBSyxHQUFHLENBQ1YsS0FBSyxFQUNMLGVBQWUsRUFDZixnQkFBZ0IsRUFDaEIsS0FBSyxFQUNMLEVBQUUsRUFDRixXQUFXLEVBQ1gsRUFBRSxFQUNGLHVDQUF1QyxFQUN2QyxFQUFFLEVBQ0Ysc0JBQXNCLEVBQ3RCLEVBQUUsQ0FDSCxDQUFBOztBQUVELFVBQUksUUFBUSxHQUFHLGtCQUFLLElBQUksQ0FBQyxJQUFJLEVBQUUsTUFBTSxFQUFFLFlBQVksQ0FBQyxDQUFBOztBQUVwRCxzQkFBRyxhQUFhLENBQUMsUUFBUSxFQUFFLEtBQUssQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQTtLQUM3Qzs7O1dBRW9CLGlDQUFFO0FBQ3JCLFVBQUksSUFBSSxHQUFHLElBQUksQ0FBQyxJQUFJLElBQUksT0FBTyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUE7O0FBRXZDLFVBQUksQ0FBQyxtQkFBbUIsRUFBRSxDQUFDLE9BQU8sQ0FBQyxVQUFBLFFBQVEsRUFBSTtBQUM3QyxZQUFJLGVBQWUsR0FBRyxrQkFBSyxJQUFJLENBQUMsSUFBSSxFQUFFLE1BQU0sRUFBRSxRQUFRLENBQUMsQ0FBQTtBQUN2RCxlQUFPLENBQUMsR0FBRyxDQUFDLFdBQVcsR0FBRyxRQUFRLEdBQUcsU0FBUyxFQUFFLGVBQWUsQ0FBQyxDQUFBOztBQUVoRSxZQUFJO0FBQ0YsY0FBRyxDQUFDLGdCQUFHLFVBQVUsQ0FBQyxlQUFlLENBQUMsRUFBQztBQUNqQyw0QkFBRyxTQUFTLENBQUMsZUFBZSxDQUFDLENBQUE7V0FDOUI7U0FDRixDQUFDLE9BQU8sQ0FBQyxFQUFFO0FBQ1YsaUJBQU8sQ0FBQyxHQUFHLENBQUMsU0FBUyxHQUFHLENBQUMsQ0FBQyxPQUFPLENBQUMsQ0FBQTtTQUNuQztPQUNGLENBQUMsQ0FBQTs7QUFFRixhQUFPLElBQUksQ0FBQztLQUNiOzs7V0FFa0IsK0JBQUU7QUFDbkIsYUFBTyxtQkFBUSxJQUFJLENBQUMsS0FBSyxDQUFDLE9BQU8sQ0FBQyxHQUFHLENBQUMsVUFBQSxNQUFNLEVBQUk7QUFDOUMsWUFBSSxJQUFJLEdBQUcsRUFBRSxDQUFBO0FBQ2IsWUFBRyxNQUFNLENBQUMsVUFBVSxFQUFDO0FBQ25CLGNBQUksR0FBRyxNQUFNLENBQUMsVUFBVSxDQUFBO1NBQ3pCO0FBQ0QsZUFBTyxJQUFJLENBQUE7T0FDWixDQUFDLENBQUMsQ0FBQTtLQUNKOzs7U0EzRGtCLFNBQVM7OztxQkFBVCxTQUFTIiwiZmlsZSI6ImdlbmVyYXRvci5qcyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCBmcyBmcm9tICdmcydcbmltcG9ydCBwYXRoIGZyb20gJ3BhdGgnXG5cbmltcG9ydCB7XG4gIGNyZWF0ZURlbGVnYXRvcnMsXG4gIGZsYXR0ZW5cbn0gZnJvbSAnLi91dGlsJ1xuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBHZW5lcmF0b3Ige1xuICBjb25zdHJ1Y3RvcihvcHRpb25zID0ge30pe1xuICAgIGNyZWF0ZURlbGVnYXRvcnModGhpcywgb3B0aW9ucykgXG4gIH1cbiAgXG4gIHJ1bigpe1xuICAgIHRoaXMuY3JlYXRlRG9jdW1lbnRGb2xkZXJzKClcbiAgICB0aGlzLmNyZWF0ZU91dGxpbmUoKVxuICB9XG5cbiAgY3JlYXRlT3V0bGluZSgpe1xuICAgIGxldCByb290ID0gdGhpcy5yb290IHx8IHByb2Nlc3MuZW52LlBXRFxuXG4gICAgbGV0IGxpbmVzID0gW1xuICAgICAgJy0tLScsXG4gICAgICAndHlwZTogb3V0bGluZScsXG4gICAgICAndGl0bGU6IG91dGxpbmUnLFxuICAgICAgJy0tLScsXG4gICAgICAnJyxcbiAgICAgICcjIE91dGxpbmUnLFxuICAgICAgJycsXG4gICAgICAnVGhpcyBpcyBhbiBvdXRsaW5lIGZvciB0aGUgYnJpZWZjYXNlLicsXG4gICAgICAnJyxcbiAgICAgICcjIyBUYWJsZSBvZiBDb250ZW50cycsXG4gICAgICAnJ1xuICAgIF1cbiAgICBcbiAgICBsZXQgcGF0aG5hbWUgPSBwYXRoLmpvaW4ocm9vdCwgJ2RvY3MnLCAnb3V0bGluZS5tZCcpXG5cbiAgICBmcy53cml0ZUZpbGVTeW5jKHBhdGhuYW1lLCBsaW5lcy5qb2luKFwiXFxuXCIpKVxuICB9XG5cbiAgY3JlYXRlRG9jdW1lbnRGb2xkZXJzKCl7XG4gICAgbGV0IHJvb3QgPSB0aGlzLnJvb3QgfHwgcHJvY2Vzcy5lbnYuUFdEXG5cbiAgICB0aGlzLmRvY3VtZW50Rm9sZGVyTmFtZXMoKS5mb3JFYWNoKGJhc2VOYW1lID0+IHtcbiAgICAgIGxldCBtb2RlbEZvbGRlclBhdGggPSBwYXRoLmpvaW4ocm9vdCwgJ2RvY3MnLCBiYXNlTmFtZSlcbiAgICAgIGNvbnNvbGUubG9nKFwiQ3JlYXRpbmcgXCIgKyBiYXNlTmFtZSArIFwiIEZvbGRlclwiLCBtb2RlbEZvbGRlclBhdGgpXG5cbiAgICAgIHRyeSB7XG4gICAgICAgIGlmKCFmcy5leGlzdHNTeW5jKG1vZGVsRm9sZGVyUGF0aCkpe1xuICAgICAgICAgIGZzLm1rZGlyU3luYyhtb2RlbEZvbGRlclBhdGgpXG4gICAgICAgIH1cbiAgICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgY29uc29sZS5sb2coXCJFcnJvcjogXCIgKyBlLm1lc3NhZ2UpXG4gICAgICB9XG4gICAgfSlcblxuICAgIHJldHVybiB0aGlzO1xuICB9XG5cbiAgZG9jdW1lbnRGb2xkZXJOYW1lcygpe1xuICAgIHJldHVybiBmbGF0dGVuKHRoaXMuYnJpZWYucGx1Z2lucy5tYXAocGx1Z2luID0+IHtcbiAgICAgIGxldCBsaXN0ID0gW11cbiAgICAgIGlmKHBsdWdpbi5ncm91cE5hbWVzKXtcbiAgICAgICAgbGlzdCA9IHBsdWdpbi5ncm91cE5hbWVzXG4gICAgICB9XG4gICAgICByZXR1cm4gbGlzdFxuICAgIH0pKVxuICB9XG59XG4iXX0=