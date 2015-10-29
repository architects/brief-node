'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

exports.attach = attach;

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

var _underscore = require('underscore');

var _underscore2 = _interopRequireDefault(_underscore);

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _globAll = require('glob-all');

var _globAll2 = _interopRequireDefault(_globAll);

var _jsYaml = require('js-yaml');

var _jsYaml2 = _interopRequireDefault(_jsYaml);

var _index = require('./index');

var _index2 = _interopRequireDefault(_index);

var _util = require('./util');

var DataSource = (function () {
  /**
   * creates a new instance of the data source at path
   * @param {path} path - the absolute path to data source.
   * @param {type} type - what type of data source is this 
  */

  function DataSource(pathname, id, options) {
    _classCallCheck(this, DataSource);

    this.path = pathname;
    this.id = id;
    this.options = options || {};
    this.dirname = _path2['default'].dirname(this.path);
    this.type = _path2['default'].extname(this.path).toLowerCase().replace('.', '');

    if (this.options.type) {
      this.type = this.options.type;
    }
  }

  _createClass(DataSource, [{
    key: 'content',
    get: function get() {
      return _fs2['default'].readFileSync(this.path).toString();
    }
  }, {
    key: 'data',
    get: function get() {
      if (this.type === 'json') {
        return JSON.parse(this.content);
      }

      if (this.type === 'yaml' || this.type === 'yml') {
        return _jsYaml2['default'].safeLoad(this.content, 'utf8');
      }

      if (this.type === 'csv') {
        throw 'CSV Is not implemented yet';
      }

      return JSON.parse(this.content);
    }
  }], [{
    key: 'repo',
    value: function repo(briefcase) {
      var options = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

      if (!options.extensions) {
        options.extensions = briefcase.config.data_extensions;
      }

      var extensions = options.extensions;

      extensions = extensions || 'csv,json,yml,yaml';

      return attach(briefcase.config.data_path, { extensions: extensions });
    }
  }]);

  return DataSource;
})();

exports['default'] = DataSource;

function normalize(path, root) {
  return path.replace(root + '/', '').replace(/.\w+$/, '');
}

function attach(root) {
  var options = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

  var extensions = options.extensions.split(',').map(function (ext) {
    return (0, _util.strip)(ext).toLowerCase();
  });
  var files = (0, _util.flatten)(extensions.map(function (ext) {
    return _globAll2['default'].sync(_path2['default'].join(root, '**/*.' + ext));
  }));
  var wrapper = (0, _underscore2['default'])(files.map(function (file) {
    return new DataSource(file, normalize(file, root));
  }));

  wrapper.at = function (pathAlias) {
    return wrapper.find(function (data_source) {
      return pathAlias.toLowerCase() === data_source.id;
    });
  };

  return wrapper;
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3NyYy9kYXRhX3NvdXJjZS5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7OztrQkFBZSxJQUFJOzs7OzBCQUNMLFlBQVk7Ozs7b0JBQ1QsTUFBTTs7Ozt1QkFDTixVQUFVOzs7O3NCQUNWLFNBQVM7Ozs7cUJBRVIsU0FBUzs7OztvQkFDc0IsUUFBUTs7SUFHcEMsVUFBVTs7Ozs7OztBQU1sQixXQU5RLFVBQVUsQ0FNakIsUUFBUSxFQUFFLEVBQUUsRUFBRSxPQUFPLEVBQUU7MEJBTmhCLFVBQVU7O0FBTzNCLFFBQUksQ0FBQyxJQUFJLEdBQUcsUUFBUSxDQUFBO0FBQ3BCLFFBQUksQ0FBQyxFQUFFLEdBQUcsRUFBRSxDQUFBO0FBQ1osUUFBSSxDQUFDLE9BQU8sR0FBRyxPQUFPLElBQUksRUFBRSxDQUFBO0FBQzVCLFFBQUksQ0FBQyxPQUFPLEdBQUcsa0JBQUssT0FBTyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQTtBQUN0QyxRQUFJLENBQUMsSUFBSSxHQUFHLGtCQUFLLE9BQU8sQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsV0FBVyxFQUFFLENBQUMsT0FBTyxDQUFDLEdBQUcsRUFBQyxFQUFFLENBQUMsQ0FBQTs7QUFFakUsUUFBRyxJQUFJLENBQUMsT0FBTyxDQUFDLElBQUksRUFBQztBQUNuQixVQUFJLENBQUMsSUFBSSxHQUFHLElBQUksQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFBO0tBQzlCO0dBQ0Y7O2VBaEJrQixVQUFVOztTQWtCbEIsZUFBRTtBQUNYLGFBQU8sZ0JBQUcsWUFBWSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxRQUFRLEVBQUUsQ0FBQTtLQUM3Qzs7O1NBRU8sZUFBRTtBQUNSLFVBQUcsSUFBSSxDQUFDLElBQUksS0FBSyxNQUFNLEVBQUM7QUFDdEIsZUFBTyxJQUFJLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsQ0FBQTtPQUNoQzs7QUFFRCxVQUFHLElBQUksQ0FBQyxJQUFJLEtBQUssTUFBTSxJQUFJLElBQUksQ0FBQyxJQUFJLEtBQUssS0FBSyxFQUFDO0FBQzdDLGVBQU8sb0JBQUssUUFBUSxDQUFDLElBQUksQ0FBQyxPQUFPLEVBQUUsTUFBTSxDQUFDLENBQUE7T0FDM0M7O0FBRUQsVUFBRyxJQUFJLENBQUMsSUFBSSxLQUFLLEtBQUssRUFBQztBQUNyQixjQUFNLDRCQUE0QixDQUFDO09BQ3BDOztBQUVELGFBQU8sSUFBSSxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLENBQUE7S0FDaEM7OztXQUVVLGNBQUMsU0FBUyxFQUFhO1VBQVgsT0FBTyx5REFBQyxFQUFFOztBQUMvQixVQUFHLENBQUMsT0FBTyxDQUFDLFVBQVUsRUFBQztBQUNyQixlQUFPLENBQUMsVUFBVSxHQUFHLFNBQVMsQ0FBQyxNQUFNLENBQUMsZUFBZSxDQUFBO09BQ3REOztVQUVJLFVBQVUsR0FBSSxPQUFPLENBQXJCLFVBQVU7O0FBRWYsZ0JBQVUsR0FBRyxVQUFVLElBQUksbUJBQW1CLENBQUE7O0FBRTlDLGFBQU8sTUFBTSxDQUFDLFNBQVMsQ0FBQyxNQUFNLENBQUMsU0FBUyxFQUFFLEVBQUMsVUFBVSxFQUFWLFVBQVUsRUFBQyxDQUFDLENBQUE7S0FDeEQ7OztTQWhEa0IsVUFBVTs7O3FCQUFWLFVBQVU7O0FBbUQvQixTQUFTLFNBQVMsQ0FBQyxJQUFJLEVBQUUsSUFBSSxFQUFDO0FBQzVCLFNBQU8sSUFBSSxDQUFDLE9BQU8sQ0FBQyxJQUFJLEdBQUcsR0FBRyxFQUFFLEVBQUUsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxPQUFPLEVBQUMsRUFBRSxDQUFDLENBQUE7Q0FDeEQ7O0FBRU0sU0FBUyxNQUFNLENBQUMsSUFBSSxFQUFhO01BQVgsT0FBTyx5REFBQyxFQUFFOztBQUNyQyxNQUFJLFVBQVUsR0FBRyxPQUFPLENBQUMsVUFBVSxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsQ0FBQyxHQUFHLENBQUMsVUFBQSxHQUFHO1dBQUksaUJBQU0sR0FBRyxDQUFDLENBQUMsV0FBVyxFQUFFO0dBQUEsQ0FBQyxDQUFBO0FBQ25GLE1BQUksS0FBSyxHQUFHLG1CQUFRLFVBQVUsQ0FBQyxHQUFHLENBQUMsVUFBQSxHQUFHO1dBQUkscUJBQUssSUFBSSxDQUFDLGtCQUFLLElBQUksQ0FBQyxJQUFJLEVBQUMsT0FBTyxHQUFHLEdBQUcsQ0FBQyxDQUFDO0dBQUEsQ0FBQyxDQUFDLENBQUE7QUFDcEYsTUFBSSxPQUFPLEdBQUcsNkJBQUUsS0FBSyxDQUFDLEdBQUcsQ0FBQyxVQUFBLElBQUk7V0FBSSxJQUFJLFVBQVUsQ0FBQyxJQUFJLEVBQUUsU0FBUyxDQUFDLElBQUksRUFBQyxJQUFJLENBQUMsQ0FBQztHQUFBLENBQUMsQ0FBQyxDQUFBOztBQUU5RSxTQUFPLENBQUMsRUFBRSxHQUFHLFVBQVMsU0FBUyxFQUFDO0FBQzlCLFdBQU8sT0FBTyxDQUFDLElBQUksQ0FBQyxVQUFBLFdBQVc7YUFBSSxTQUFTLENBQUMsV0FBVyxFQUFFLEtBQUssV0FBVyxDQUFDLEVBQUU7S0FBQSxDQUFDLENBQUE7R0FDL0UsQ0FBQTs7QUFFRCxTQUFPLE9BQU8sQ0FBQTtDQUNmIiwiZmlsZSI6ImRhdGFfc291cmNlLmpzIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IGZzIGZyb20gJ2ZzJ1xuaW1wb3J0IF8gZnJvbSAndW5kZXJzY29yZSdcbmltcG9ydCBwYXRoIGZyb20gJ3BhdGgnXG5pbXBvcnQgZ2xvYiBmcm9tICdnbG9iLWFsbCdcbmltcG9ydCB5YW1sIGZyb20gJ2pzLXlhbWwnXG5cbmltcG9ydCBicmllZiBmcm9tICcuL2luZGV4J1xuaW1wb3J0IHtjbG9uZSwgZmxhdHRlbiwgc2luZ3VsYXJpemUsIHN0cmlwfSBmcm9tICcuL3V0aWwnXG5cblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgRGF0YVNvdXJjZSB7XG4gIC8qKlxuICAgKiBjcmVhdGVzIGEgbmV3IGluc3RhbmNlIG9mIHRoZSBkYXRhIHNvdXJjZSBhdCBwYXRoXG4gICAqIEBwYXJhbSB7cGF0aH0gcGF0aCAtIHRoZSBhYnNvbHV0ZSBwYXRoIHRvIGRhdGEgc291cmNlLlxuICAgKiBAcGFyYW0ge3R5cGV9IHR5cGUgLSB3aGF0IHR5cGUgb2YgZGF0YSBzb3VyY2UgaXMgdGhpcyBcbiAgKi9cbiAgY29uc3RydWN0b3IocGF0aG5hbWUsIGlkLCBvcHRpb25zKSB7XG4gICAgdGhpcy5wYXRoID0gcGF0aG5hbWVcbiAgICB0aGlzLmlkID0gaWRcbiAgICB0aGlzLm9wdGlvbnMgPSBvcHRpb25zIHx8IHt9XG4gICAgdGhpcy5kaXJuYW1lID0gcGF0aC5kaXJuYW1lKHRoaXMucGF0aClcbiAgICB0aGlzLnR5cGUgPSBwYXRoLmV4dG5hbWUodGhpcy5wYXRoKS50b0xvd2VyQ2FzZSgpLnJlcGxhY2UoJy4nLCcnKVxuXG4gICAgaWYodGhpcy5vcHRpb25zLnR5cGUpe1xuICAgICAgdGhpcy50eXBlID0gdGhpcy5vcHRpb25zLnR5cGVcbiAgICB9XG4gIH1cblxuICBnZXQgY29udGVudCgpe1xuICAgIHJldHVybiBmcy5yZWFkRmlsZVN5bmModGhpcy5wYXRoKS50b1N0cmluZygpXG4gIH1cblxuICBnZXQgZGF0YSgpe1xuICAgIGlmKHRoaXMudHlwZSA9PT0gJ2pzb24nKXsgICBcbiAgICAgIHJldHVybiBKU09OLnBhcnNlKHRoaXMuY29udGVudClcbiAgICB9XG5cbiAgICBpZih0aGlzLnR5cGUgPT09ICd5YW1sJyB8fCB0aGlzLnR5cGUgPT09ICd5bWwnKXtcbiAgICAgIHJldHVybiB5YW1sLnNhZmVMb2FkKHRoaXMuY29udGVudCwgJ3V0ZjgnKVxuICAgIH1cblxuICAgIGlmKHRoaXMudHlwZSA9PT0gJ2Nzdicpe1xuICAgICAgdGhyb3coJ0NTViBJcyBub3QgaW1wbGVtZW50ZWQgeWV0JykgIFxuICAgIH1cblxuICAgIHJldHVybiBKU09OLnBhcnNlKHRoaXMuY29udGVudClcbiAgfVxuXG4gIHN0YXRpYyByZXBvKGJyaWVmY2FzZSwgb3B0aW9ucz17fSl7XG4gICAgaWYoIW9wdGlvbnMuZXh0ZW5zaW9ucyl7XG4gICAgICBvcHRpb25zLmV4dGVuc2lvbnMgPSBicmllZmNhc2UuY29uZmlnLmRhdGFfZXh0ZW5zaW9uc1xuICAgIH1cbiAgICBcbiAgICBsZXQge2V4dGVuc2lvbnN9ID0gb3B0aW9uc1xuXG4gICAgZXh0ZW5zaW9ucyA9IGV4dGVuc2lvbnMgfHwgJ2Nzdixqc29uLHltbCx5YW1sJ1xuXG4gICAgcmV0dXJuIGF0dGFjaChicmllZmNhc2UuY29uZmlnLmRhdGFfcGF0aCwge2V4dGVuc2lvbnN9KVxuICB9XG59XG5cbmZ1bmN0aW9uIG5vcm1hbGl6ZShwYXRoLCByb290KXtcbiAgcmV0dXJuIHBhdGgucmVwbGFjZShyb290ICsgJy8nLCAnJykucmVwbGFjZSgvLlxcdyskLywnJylcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGF0dGFjaChyb290LCBvcHRpb25zPXt9KXtcbiAgbGV0IGV4dGVuc2lvbnMgPSBvcHRpb25zLmV4dGVuc2lvbnMuc3BsaXQoJywnKS5tYXAoZXh0ID0+IHN0cmlwKGV4dCkudG9Mb3dlckNhc2UoKSlcbiAgbGV0IGZpbGVzID0gZmxhdHRlbihleHRlbnNpb25zLm1hcChleHQgPT4gZ2xvYi5zeW5jKHBhdGguam9pbihyb290LCcqKi8qLicgKyBleHQpKSkpXG4gIGxldCB3cmFwcGVyID0gXyhmaWxlcy5tYXAoZmlsZSA9PiBuZXcgRGF0YVNvdXJjZShmaWxlLCBub3JtYWxpemUoZmlsZSxyb290KSkpKSBcbiAgIFxuICB3cmFwcGVyLmF0ID0gZnVuY3Rpb24ocGF0aEFsaWFzKXtcbiAgICByZXR1cm4gd3JhcHBlci5maW5kKGRhdGFfc291cmNlID0+IHBhdGhBbGlhcy50b0xvd2VyQ2FzZSgpID09PSBkYXRhX3NvdXJjZS5pZCkgXG4gIH0gXG5cbiAgcmV0dXJuIHdyYXBwZXJcbn1cbiJdfQ==