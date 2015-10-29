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

var _index = require('./index');

var _index2 = _interopRequireDefault(_index);

var _util = require('./util');

var Asset = (function () {
  /**
   * creates a new instance of the asset at path
   * @param {path} path - the absolute path to data source.
   * @param {type} type - what type of data source is this 
  */

  function Asset(pathname, id, options) {
    _classCallCheck(this, Asset);

    this.path = pathname;
    this.id = id;
    this.options = options || {};
    this.dirname = _path2['default'].dirname(this.path);
    this.type = _path2['default'].extname(this.path).toLowerCase().replace('.', '');

    if (this.options.type) {
      this.type = this.options.type;
    }
  }

  _createClass(Asset, [{
    key: 'content',
    get: function get() {
      return _fs2['default'].readFileSync(this.path).toString();
    }
  }, {
    key: 'data',
    get: function get() {
      return this.content;
    }
  }], [{
    key: 'repo',
    value: function repo(briefcase) {
      var options = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

      if (!options.extensions) {
        options.extensions = briefcase.config.asset_extensions;
      }

      var extensions = options.extensions;

      extensions = extensions || 'svg,png,jpg,gif,js,css,html';

      return attach(briefcase.config.assets_path, { extensions: extensions });
    }
  }]);

  return Asset;
})();

exports['default'] = Asset;

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
    return new Asset(file, normalize(file, root));
  }));

  wrapper.at = function (pathAlias) {
    return wrapper.find(function (asset) {
      return pathAlias.toLowerCase() === asset.id;
    });
  };

  return wrapper;
}
//# sourceMappingURL=data:application/json;base64,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LEVBQUM7QUFDOUIsV0FBTyxPQUFPLENBQUMsSUFBSSxDQUFDLFVBQUEsS0FBSzthQUFJLFNBQVMsQ0FBQyxXQUFXLEVBQUUsS0FBSyxLQUFLLENBQUMsRUFBRTtLQUFBLENBQUMsQ0FBQTtHQUNuRSxDQUFBOztBQUVELFNBQU8sT0FBTyxDQUFBO0NBQ2YiLCJmaWxlIjoiYXNzZXQuanMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgZnMgZnJvbSAnZnMnXG5pbXBvcnQgXyBmcm9tICd1bmRlcnNjb3JlJ1xuaW1wb3J0IHBhdGggZnJvbSAncGF0aCdcbmltcG9ydCBnbG9iIGZyb20gJ2dsb2ItYWxsJ1xuXG5pbXBvcnQgYnJpZWYgZnJvbSAnLi9pbmRleCdcbmltcG9ydCB7Y2xvbmUsIGZsYXR0ZW4sIHNpbmd1bGFyaXplLCBzdHJpcH0gZnJvbSAnLi91dGlsJ1xuXG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIEFzc2V0IHtcbiAgLyoqXG4gICAqIGNyZWF0ZXMgYSBuZXcgaW5zdGFuY2Ugb2YgdGhlIGFzc2V0IGF0IHBhdGhcbiAgICogQHBhcmFtIHtwYXRofSBwYXRoIC0gdGhlIGFic29sdXRlIHBhdGggdG8gZGF0YSBzb3VyY2UuXG4gICAqIEBwYXJhbSB7dHlwZX0gdHlwZSAtIHdoYXQgdHlwZSBvZiBkYXRhIHNvdXJjZSBpcyB0aGlzIFxuICAqL1xuICBjb25zdHJ1Y3RvcihwYXRobmFtZSwgaWQsIG9wdGlvbnMpIHtcbiAgICB0aGlzLnBhdGggPSBwYXRobmFtZVxuICAgIHRoaXMuaWQgPSBpZFxuICAgIHRoaXMub3B0aW9ucyA9IG9wdGlvbnMgfHwge31cbiAgICB0aGlzLmRpcm5hbWUgPSBwYXRoLmRpcm5hbWUodGhpcy5wYXRoKVxuICAgIHRoaXMudHlwZSA9IHBhdGguZXh0bmFtZSh0aGlzLnBhdGgpLnRvTG93ZXJDYXNlKCkucmVwbGFjZSgnLicsJycpXG5cbiAgICBpZih0aGlzLm9wdGlvbnMudHlwZSl7XG4gICAgICB0aGlzLnR5cGUgPSB0aGlzLm9wdGlvbnMudHlwZVxuICAgIH1cbiAgfVxuICBcbiAgZ2V0IGNvbnRlbnQoKXtcbiAgICByZXR1cm4gZnMucmVhZEZpbGVTeW5jKHRoaXMucGF0aCkudG9TdHJpbmcoKVxuICB9XG4gIFxuICBnZXQgZGF0YSgpe1xuICAgIHJldHVybiB0aGlzLmNvbnRlbnRcbiAgfVxuXG4gIHN0YXRpYyByZXBvKGJyaWVmY2FzZSwgb3B0aW9ucz17fSl7XG4gICAgaWYoIW9wdGlvbnMuZXh0ZW5zaW9ucyl7XG4gICAgICBvcHRpb25zLmV4dGVuc2lvbnMgPSBicmllZmNhc2UuY29uZmlnLmFzc2V0X2V4dGVuc2lvbnNcbiAgICB9XG4gICAgXG4gICAgbGV0IHtleHRlbnNpb25zfSA9IG9wdGlvbnNcblxuICAgIGV4dGVuc2lvbnMgPSBleHRlbnNpb25zIHx8ICdzdmcscG5nLGpwZyxnaWYsanMsY3NzLGh0bWwnIFxuXG4gICAgcmV0dXJuIGF0dGFjaChicmllZmNhc2UuY29uZmlnLmFzc2V0c19wYXRoLCB7ZXh0ZW5zaW9uc30pXG4gIH1cbn1cblxuZnVuY3Rpb24gbm9ybWFsaXplKHBhdGgsIHJvb3Qpe1xuICByZXR1cm4gcGF0aC5yZXBsYWNlKHJvb3QgKyAnLycsICcnKS5yZXBsYWNlKC8uXFx3KyQvLCcnKVxufVxuXG5leHBvcnQgZnVuY3Rpb24gYXR0YWNoKHJvb3QsIG9wdGlvbnM9e30pe1xuICBsZXQgZXh0ZW5zaW9ucyA9IG9wdGlvbnMuZXh0ZW5zaW9ucy5zcGxpdCgnLCcpLm1hcChleHQgPT4gc3RyaXAoZXh0KS50b0xvd2VyQ2FzZSgpKVxuICBsZXQgZmlsZXMgPSBmbGF0dGVuKGV4dGVuc2lvbnMubWFwKGV4dCA9PiBnbG9iLnN5bmMocGF0aC5qb2luKHJvb3QsJyoqLyouJyArIGV4dCkpKSlcbiAgbGV0IHdyYXBwZXIgPSBfKGZpbGVzLm1hcChmaWxlID0+IG5ldyBBc3NldChmaWxlLCBub3JtYWxpemUoZmlsZSxyb290KSkpKSBcbiAgIFxuICB3cmFwcGVyLmF0ID0gZnVuY3Rpb24ocGF0aEFsaWFzKXtcbiAgICByZXR1cm4gd3JhcHBlci5maW5kKGFzc2V0ID0+IHBhdGhBbGlhcy50b0xvd2VyQ2FzZSgpID09PSBhc3NldC5pZCkgXG4gIH0gXG5cbiAgcmV0dXJuIHdyYXBwZXJcbn1cbiJdfQ==