'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

var _briefcase = require("./briefcase");

var _briefcase2 = _interopRequireDefault(_briefcase);

var _asset = require('./asset');

var _asset2 = _interopRequireDefault(_asset);

var _data_source = require('./data_source');

var _data_source2 = _interopRequireDefault(_data_source);

var _model = require("./model");

var _model2 = _interopRequireDefault(_model);

var _document = require("./document");

var _document2 = _interopRequireDefault(_document);

var _model_definition = require("./model_definition");

var _model_definition2 = _interopRequireDefault(_model_definition);

var _model_registry = require('./model_registry');

var _generator = require('./generator');

var _generator2 = _interopRequireDefault(_generator);

var _render = require('./render');

var _util = require('./util');

var plugins = [];
var _pluginNames = {};

var pkg = _path2['default'].join(__dirname, '../package.json');
var manifest = JSON.parse(_fs2['default'].readFileSync(pkg));

var brief = {
  VERSION: manifest.version,
  plugins: plugins,
  Briefcase: _briefcase2['default'],
  Model: _model2['default'],

  ModelDefinition: _model_definition2['default'],

  // TODO
  // Think of a better API for this.
  registry: _model_registry.registry,
  model: _model_registry.model,

  resolveLink: function resolveLink(pathAlias) {
    if (!brief.linkResolver) {
      return pathAlias;
    }
    return brief.linkResolver(pathAlias);
  },
  resolveLinksWith: function resolveLinksWith(fn) {
    brief.linkResolver = fn;
  },
  instances: function instances() {
    return _briefcase2['default'].instances();
  },
  findBriefcaseByPath: function findBriefcaseByPath(path) {
    return _briefcase2['default'].findForPath(path);
  },
  atPath: function atPath(root) {
    var options = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

    return _briefcase2['default'].load(root, options);
  },
  load: function load(root) {
    var options = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

    return _briefcase2['default'].load(root, options);
  },
  example: function example() {
    var options = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

    return require("../test/example")();
  },
  generate: function generate(root) {
    var options = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

    return new _generator2['default']({
      brief: brief,
      root: root
    }).run();
  },
  fromPath: function fromPath(pathname, options) {
    if (_fs2['default'].existsSync(pathname + '/package.json')) {
      return brief.fromManifest(pathname + '/package.json', options);
    }
    return brief.load(pathname, options);
  },
  fromManifest: function fromManifest(briefcaseManifestPath, options) {
    var usesPlugins = [];
    var parsed = {};

    if (_fs2['default'].existsSync(briefcaseManifestPath)) {
      parsed = JSON.parse(_fs2['default'].readFileSync(briefcaseManifestPath).toString());
      if (parsed.brief && parsed.brief.plugins) {
        usesPlugins = usesPlugins.concat(parsed.brief.plugins);
      }
    }

    usesPlugins.forEach(function (pluginName) {
      brief = brief.use(require('brief-plugins-' + pluginName));
    });

    return brief.load(_path2['default'].dirname(briefcaseManifestPath), options);
  },
  pluginNames: function pluginNames() {
    return Object.keys(_pluginNames);
  },
  markdown: _render.markdown,
  util: require('./util'),
  mixin: function mixin(extension) {
    var options = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

    if (typeof options === 'string') {
      options = { target: options };
    }

    var _options = options;
    var target = _options.target;

    if (target === 'model') {
      (0, _util.mixin)(_model2['default'], extension);
    }
    if (target === 'briefcase') {
      (0, _util.mixin)(_briefcase2['default'], extension);
    }
    if (target === 'document') {
      (0, _util.mixin)(_document2['default'], extension);
    }
    if (target === 'asset') {
      (0, _util.mixin)(_asset2['default'], extension);
    }
    if (target === 'data') {
      (0, _util.mixin)(_data_source2['default'], extension);
    }
  },
  use: function use(plugin, options) {
    var brief = this;
    var modifier = plugin(brief, options);
    modifier.version = plugin.version;
    modifier.plugin_name = plugin.plugin_name;

    if (!_pluginNames[plugin.plugin_name]) {
      plugins.push(modifier);
    }

    _pluginNames[plugin.plugin_name] = true;

    return brief;
  }
};

if (!Object.values) {
  Object.values = function (obj) {
    return Object.keys(obj).map(function (key) {
      return obj[key];
    });
  };
}

exports['default'] = brief;
module.exports = exports['default'];
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3NyYy9pbmRleC5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7OztvQkFBaUIsTUFBTTs7OztrQkFDUixJQUFJOzs7O3lCQUNHLGFBQWE7Ozs7cUJBQ2pCLFNBQVM7Ozs7MkJBQ0osZUFBZTs7OztxQkFDcEIsU0FBUzs7Ozt3QkFDTixZQUFZOzs7O2dDQUNMLG9CQUFvQjs7Ozs4QkFDbEIsa0JBQWtCOzt5QkFDMUIsYUFBYTs7OztzQkFDWixVQUFVOztvQkFDYixRQUFROztBQUU1QixJQUFNLE9BQU8sR0FBRyxFQUFFLENBQUE7QUFDbEIsSUFBTSxZQUFXLEdBQUcsRUFBRSxDQUFBOztBQUV0QixJQUFNLEdBQUcsR0FBRyxrQkFBSyxJQUFJLENBQUMsU0FBUyxFQUFFLGlCQUFpQixDQUFDLENBQUE7QUFDbkQsSUFBTSxRQUFRLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxnQkFBRyxZQUFZLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQTs7QUFFakQsSUFBSSxLQUFLLEdBQUc7QUFDVixTQUFPLEVBQUUsUUFBUSxDQUFDLE9BQU87QUFDekIsU0FBTyxFQUFFLE9BQU87QUFDaEIsV0FBUyx3QkFBVztBQUNwQixPQUFLLG9CQUFPOztBQUVaLGlCQUFlLCtCQUFpQjs7OztBQUloQyxVQUFRLDBCQUFVO0FBQ2xCLE9BQUssdUJBQU87O0FBRVosYUFBVyxFQUFFLHFCQUFTLFNBQVMsRUFBQztBQUM5QixRQUFHLENBQUMsS0FBSyxDQUFDLFlBQVksRUFBQztBQUNyQixhQUFPLFNBQVMsQ0FBQTtLQUNqQjtBQUNELFdBQU8sS0FBSyxDQUFDLFlBQVksQ0FBQyxTQUFTLENBQUMsQ0FBQTtHQUNyQztBQUNELGtCQUFnQixFQUFFLDBCQUFTLEVBQUUsRUFBQztBQUM1QixTQUFLLENBQUMsWUFBWSxHQUFHLEVBQUUsQ0FBQTtHQUN4QjtBQUNELFdBQVMsRUFBRSxxQkFBVTtBQUNuQixXQUFPLHVCQUFVLFNBQVMsRUFBRSxDQUFBO0dBQzdCO0FBQ0QscUJBQW1CLEVBQUUsNkJBQVMsSUFBSSxFQUFDO0FBQ2pDLFdBQU8sdUJBQVUsV0FBVyxDQUFDLElBQUksQ0FBQyxDQUFBO0dBQ25DO0FBQ0QsUUFBTSxFQUFFLGdCQUFTLElBQUksRUFBYTtRQUFYLE9BQU8seURBQUMsRUFBRTs7QUFDL0IsV0FBTyx1QkFBVSxJQUFJLENBQUMsSUFBSSxFQUFFLE9BQU8sQ0FBQyxDQUFBO0dBQ3JDO0FBQ0QsTUFBSSxFQUFFLGNBQVUsSUFBSSxFQUFjO1FBQVosT0FBTyx5REFBQyxFQUFFOztBQUM5QixXQUFPLHVCQUFVLElBQUksQ0FBQyxJQUFJLEVBQUUsT0FBTyxDQUFDLENBQUE7R0FDckM7QUFDRCxTQUFPLEVBQUUsbUJBQW9CO1FBQVgsT0FBTyx5REFBQyxFQUFFOztBQUMxQixXQUFPLE9BQU8sQ0FBQyxpQkFBaUIsQ0FBQyxFQUFFLENBQUE7R0FDcEM7QUFDRCxVQUFRLEVBQUUsa0JBQVMsSUFBSSxFQUFhO1FBQVgsT0FBTyx5REFBQyxFQUFFOztBQUNqQyxXQUFPLDJCQUFjO0FBQ25CLFdBQUssRUFBTCxLQUFLO0FBQ0wsVUFBSSxFQUFKLElBQUk7S0FDTCxDQUFDLENBQUMsR0FBRyxFQUFFLENBQUE7R0FDVDtBQUNELFVBQVEsRUFBRSxrQkFBUyxRQUFRLEVBQUUsT0FBTyxFQUFDO0FBQ25DLFFBQUcsZ0JBQUcsVUFBVSxDQUFDLFFBQVEsR0FBRyxlQUFlLENBQUMsRUFBQztBQUMzQyxhQUFPLEtBQUssQ0FBQyxZQUFZLENBQUMsUUFBUSxHQUFHLGVBQWUsRUFBRSxPQUFPLENBQUMsQ0FBQTtLQUMvRDtBQUNELFdBQU8sS0FBSyxDQUFDLElBQUksQ0FBQyxRQUFRLEVBQUUsT0FBTyxDQUFDLENBQUE7R0FDckM7QUFDRCxjQUFZLEVBQUUsc0JBQVMscUJBQXFCLEVBQUUsT0FBTyxFQUFDO0FBQ3BELFFBQUksV0FBVyxHQUFHLEVBQUUsQ0FBQTtBQUNwQixRQUFJLE1BQU0sR0FBRyxFQUFFLENBQUE7O0FBRWYsUUFBRyxnQkFBRyxVQUFVLENBQUMscUJBQXFCLENBQUMsRUFBQztBQUN0QyxZQUFNLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxnQkFBRyxZQUFZLENBQUMscUJBQXFCLENBQUMsQ0FBQyxRQUFRLEVBQUUsQ0FBQyxDQUFBO0FBQ3RFLFVBQUcsTUFBTSxDQUFDLEtBQUssSUFBSSxNQUFNLENBQUMsS0FBSyxDQUFDLE9BQU8sRUFBQztBQUN0QyxtQkFBVyxHQUFHLFdBQVcsQ0FBQyxNQUFNLENBQUMsTUFBTSxDQUFDLEtBQUssQ0FBQyxPQUFPLENBQUMsQ0FBQTtPQUN2RDtLQUNGOztBQUVELGVBQVcsQ0FBQyxPQUFPLENBQUMsVUFBQSxVQUFVLEVBQUk7QUFDaEMsV0FBSyxHQUFHLEtBQUssQ0FBQyxHQUFHLENBQUMsT0FBTyxDQUFDLGdCQUFnQixHQUFHLFVBQVUsQ0FBQyxDQUFDLENBQUE7S0FDMUQsQ0FBQyxDQUFBOztBQUVGLFdBQU8sS0FBSyxDQUFDLElBQUksQ0FBQyxrQkFBSyxPQUFPLENBQUMscUJBQXFCLENBQUMsRUFBRSxPQUFPLENBQUMsQ0FBQTtHQUNoRTtBQUNELGFBQVcsRUFBRSx1QkFBVTtBQUNyQixXQUFPLE1BQU0sQ0FBQyxJQUFJLENBQUMsWUFBVyxDQUFDLENBQUE7R0FDaEM7QUFDRCxVQUFRLGtCQUFVO0FBQ2xCLE1BQUksRUFBRSxPQUFPLENBQUMsUUFBUSxDQUFDO0FBQ3ZCLE9BQUssRUFBRSxlQUFTLFNBQVMsRUFBYTtRQUFYLE9BQU8seURBQUMsRUFBRTs7QUFDbkMsUUFBRyxPQUFPLE9BQU8sQUFBQyxLQUFHLFFBQVEsRUFBQztBQUM1QixhQUFPLEdBQUcsRUFBQyxNQUFNLEVBQUUsT0FBTyxFQUFDLENBQUE7S0FDNUI7O21CQUVjLE9BQU87UUFBakIsTUFBTSxZQUFOLE1BQU07O0FBRVgsUUFBRyxNQUFNLEtBQUssT0FBTyxFQUFDO0FBQUUsMkNBQWEsU0FBUyxDQUFDLENBQUE7S0FBRTtBQUNqRCxRQUFHLE1BQU0sS0FBSyxXQUFXLEVBQUM7QUFBRSwrQ0FBaUIsU0FBUyxDQUFDLENBQUE7S0FBRTtBQUN6RCxRQUFHLE1BQU0sS0FBSyxVQUFVLEVBQUM7QUFBRSw4Q0FBZ0IsU0FBUyxDQUFDLENBQUE7S0FBRTtBQUN2RCxRQUFHLE1BQU0sS0FBSyxPQUFPLEVBQUM7QUFBRSwyQ0FBYSxTQUFTLENBQUMsQ0FBQTtLQUFFO0FBQ2pELFFBQUcsTUFBTSxLQUFLLE1BQU0sRUFBQztBQUFFLGlEQUFrQixTQUFTLENBQUMsQ0FBQTtLQUFFO0dBQ3REO0FBQ0QsS0FBRyxFQUFFLGFBQVMsTUFBTSxFQUFFLE9BQU8sRUFBQztBQUM1QixRQUFJLEtBQUssR0FBRyxJQUFJLENBQUE7QUFDaEIsUUFBSSxRQUFRLEdBQUcsTUFBTSxDQUFDLEtBQUssRUFBRSxPQUFPLENBQUMsQ0FBQTtBQUNyQyxZQUFRLENBQUMsT0FBTyxHQUFHLE1BQU0sQ0FBQyxPQUFPLENBQUE7QUFDakMsWUFBUSxDQUFDLFdBQVcsR0FBRyxNQUFNLENBQUMsV0FBVyxDQUFBOztBQUV6QyxRQUFHLENBQUMsWUFBVyxDQUFDLE1BQU0sQ0FBQyxXQUFXLENBQUMsRUFBQztBQUNsQyxhQUFPLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxDQUFBO0tBQ3ZCOztBQUVELGdCQUFXLENBQUMsTUFBTSxDQUFDLFdBQVcsQ0FBQyxHQUFHLElBQUksQ0FBQTs7QUFFdEMsV0FBTyxLQUFLLENBQUE7R0FDYjtDQUNGLENBQUE7O0FBRUQsSUFBRyxDQUFDLE1BQU0sQ0FBQyxNQUFNLEVBQUM7QUFDaEIsUUFBTSxDQUFDLE1BQU0sR0FBRyxVQUFTLEdBQUcsRUFBQztBQUMzQixXQUFPLE1BQU0sQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUMsR0FBRyxDQUFDLFVBQVMsR0FBRyxFQUFDO0FBQUUsYUFBTyxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUE7S0FBRSxDQUFDLENBQUE7R0FDOUQsQ0FBQTtDQUNGOztxQkFFYyxLQUFLIiwiZmlsZSI6ImluZGV4LmpzIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHBhdGggZnJvbSAncGF0aCdcbmltcG9ydCBmcyBmcm9tICdmcydcbmltcG9ydCBCcmllZmNhc2UgZnJvbSBcIi4vYnJpZWZjYXNlXCJcbmltcG9ydCBBc3NldCBmcm9tICcuL2Fzc2V0J1xuaW1wb3J0IERhdGFTb3VyY2UgZnJvbSAnLi9kYXRhX3NvdXJjZSdcbmltcG9ydCBNb2RlbCBmcm9tIFwiLi9tb2RlbFwiXG5pbXBvcnQgRG9jdW1lbnQgZnJvbSBcIi4vZG9jdW1lbnRcIlxuaW1wb3J0IE1vZGVsRGVmaW5pdGlvbiBmcm9tIFwiLi9tb2RlbF9kZWZpbml0aW9uXCJcbmltcG9ydCB7bW9kZWwsIHJlZ2lzdHJ5fSBmcm9tICcuL21vZGVsX3JlZ2lzdHJ5J1xuaW1wb3J0IEdlbmVyYXRvciBmcm9tICcuL2dlbmVyYXRvcidcbmltcG9ydCB7bWFya2Rvd259IGZyb20gJy4vcmVuZGVyJ1xuaW1wb3J0IHttaXhpbn0gZnJvbSAnLi91dGlsJ1xuXG5jb25zdCBwbHVnaW5zID0gW11cbmNvbnN0IHBsdWdpbk5hbWVzID0ge31cblxuY29uc3QgcGtnID0gcGF0aC5qb2luKF9fZGlybmFtZSwgJy4uL3BhY2thZ2UuanNvbicpXG5jb25zdCBtYW5pZmVzdCA9IEpTT04ucGFyc2UoZnMucmVhZEZpbGVTeW5jKHBrZykpXG5cbmxldCBicmllZiA9IHtcbiAgVkVSU0lPTjogbWFuaWZlc3QudmVyc2lvbixcbiAgcGx1Z2luczogcGx1Z2lucyxcbiAgQnJpZWZjYXNlOiBCcmllZmNhc2UsXG4gIE1vZGVsOiBNb2RlbCxcbiAgIFxuICBNb2RlbERlZmluaXRpb246IE1vZGVsRGVmaW5pdGlvbixcblxuICAvLyBUT0RPXG4gIC8vIFRoaW5rIG9mIGEgYmV0dGVyIEFQSSBmb3IgdGhpcy5cbiAgcmVnaXN0cnk6IHJlZ2lzdHJ5LFxuICBtb2RlbDogbW9kZWwsXG5cbiAgcmVzb2x2ZUxpbms6IGZ1bmN0aW9uKHBhdGhBbGlhcyl7XG4gICAgaWYoIWJyaWVmLmxpbmtSZXNvbHZlcil7XG4gICAgICByZXR1cm4gcGF0aEFsaWFzXG4gICAgfVxuICAgIHJldHVybiBicmllZi5saW5rUmVzb2x2ZXIocGF0aEFsaWFzKVxuICB9LFxuICByZXNvbHZlTGlua3NXaXRoOiBmdW5jdGlvbihmbil7XG4gICAgYnJpZWYubGlua1Jlc29sdmVyID0gZm5cbiAgfSxcbiAgaW5zdGFuY2VzOiBmdW5jdGlvbigpe1xuICAgIHJldHVybiBCcmllZmNhc2UuaW5zdGFuY2VzKClcbiAgfSxcbiAgZmluZEJyaWVmY2FzZUJ5UGF0aDogZnVuY3Rpb24ocGF0aCl7XG4gICAgcmV0dXJuIEJyaWVmY2FzZS5maW5kRm9yUGF0aChwYXRoKVxuICB9LFxuICBhdFBhdGg6IGZ1bmN0aW9uKHJvb3QsIG9wdGlvbnM9e30pe1xuICAgIHJldHVybiBCcmllZmNhc2UubG9hZChyb290LCBvcHRpb25zKVxuICB9LFxuICBsb2FkOiBmdW5jdGlvbiAocm9vdCwgb3B0aW9ucz17fSkge1xuICAgIHJldHVybiBCcmllZmNhc2UubG9hZChyb290LCBvcHRpb25zKVxuICB9LFxuICBleGFtcGxlOiBmdW5jdGlvbihvcHRpb25zPXt9KXtcbiAgICByZXR1cm4gcmVxdWlyZShcIi4uL3Rlc3QvZXhhbXBsZVwiKSgpXG4gIH0sXG4gIGdlbmVyYXRlOiBmdW5jdGlvbihyb290LCBvcHRpb25zPXt9KXtcbiAgICByZXR1cm4gbmV3IEdlbmVyYXRvcih7XG4gICAgICBicmllZixcbiAgICAgIHJvb3RcbiAgICB9KS5ydW4oKVxuICB9LFxuICBmcm9tUGF0aDogZnVuY3Rpb24ocGF0aG5hbWUsIG9wdGlvbnMpe1xuICAgIGlmKGZzLmV4aXN0c1N5bmMocGF0aG5hbWUgKyAnL3BhY2thZ2UuanNvbicpKXtcbiAgICAgIHJldHVybiBicmllZi5mcm9tTWFuaWZlc3QocGF0aG5hbWUgKyAnL3BhY2thZ2UuanNvbicsIG9wdGlvbnMpXG4gICAgfVxuICAgIHJldHVybiBicmllZi5sb2FkKHBhdGhuYW1lLCBvcHRpb25zKVxuICB9LFxuICBmcm9tTWFuaWZlc3Q6IGZ1bmN0aW9uKGJyaWVmY2FzZU1hbmlmZXN0UGF0aCwgb3B0aW9ucyl7XG4gICAgbGV0IHVzZXNQbHVnaW5zID0gW11cbiAgICBsZXQgcGFyc2VkID0ge31cbiAgICBcbiAgICBpZihmcy5leGlzdHNTeW5jKGJyaWVmY2FzZU1hbmlmZXN0UGF0aCkpe1xuICAgICAgcGFyc2VkID0gSlNPTi5wYXJzZShmcy5yZWFkRmlsZVN5bmMoYnJpZWZjYXNlTWFuaWZlc3RQYXRoKS50b1N0cmluZygpKVxuICAgICAgaWYocGFyc2VkLmJyaWVmICYmIHBhcnNlZC5icmllZi5wbHVnaW5zKXtcbiAgICAgICAgdXNlc1BsdWdpbnMgPSB1c2VzUGx1Z2lucy5jb25jYXQocGFyc2VkLmJyaWVmLnBsdWdpbnMpICBcbiAgICAgIH1cbiAgICB9XG5cbiAgICB1c2VzUGx1Z2lucy5mb3JFYWNoKHBsdWdpbk5hbWUgPT4ge1xuICAgICAgYnJpZWYgPSBicmllZi51c2UocmVxdWlyZSgnYnJpZWYtcGx1Z2lucy0nICsgcGx1Z2luTmFtZSkpXG4gICAgfSlcblxuICAgIHJldHVybiBicmllZi5sb2FkKHBhdGguZGlybmFtZShicmllZmNhc2VNYW5pZmVzdFBhdGgpLCBvcHRpb25zKVxuICB9LFxuICBwbHVnaW5OYW1lczogZnVuY3Rpb24oKXtcbiAgICByZXR1cm4gT2JqZWN0LmtleXMocGx1Z2luTmFtZXMpXG4gIH0sXG4gIG1hcmtkb3duOiBtYXJrZG93bixcbiAgdXRpbDogcmVxdWlyZSgnLi91dGlsJyksXG4gIG1peGluOiBmdW5jdGlvbihleHRlbnNpb24sIG9wdGlvbnM9e30pe1xuICAgIGlmKHR5cGVvZihvcHRpb25zKT09PSdzdHJpbmcnKXtcbiAgICAgIG9wdGlvbnMgPSB7dGFyZ2V0OiBvcHRpb25zfVxuICAgIH1cblxuICAgIGxldCB7dGFyZ2V0fSA9IG9wdGlvbnNcbiAgICBcbiAgICBpZih0YXJnZXQgPT09ICdtb2RlbCcpeyBtaXhpbihNb2RlbCwgZXh0ZW5zaW9uKSB9XG4gICAgaWYodGFyZ2V0ID09PSAnYnJpZWZjYXNlJyl7IG1peGluKEJyaWVmY2FzZSwgZXh0ZW5zaW9uKSB9XG4gICAgaWYodGFyZ2V0ID09PSAnZG9jdW1lbnQnKXsgbWl4aW4oRG9jdW1lbnQsIGV4dGVuc2lvbikgfVxuICAgIGlmKHRhcmdldCA9PT0gJ2Fzc2V0Jyl7IG1peGluKEFzc2V0LCBleHRlbnNpb24pIH1cbiAgICBpZih0YXJnZXQgPT09ICdkYXRhJyl7IG1peGluKERhdGFTb3VyY2UsIGV4dGVuc2lvbikgfVxuICB9LFxuICB1c2U6IGZ1bmN0aW9uKHBsdWdpbiwgb3B0aW9ucyl7XG4gICAgdmFyIGJyaWVmID0gdGhpc1xuICAgIHZhciBtb2RpZmllciA9IHBsdWdpbihicmllZiwgb3B0aW9ucylcbiAgICBtb2RpZmllci52ZXJzaW9uID0gcGx1Z2luLnZlcnNpb25cbiAgICBtb2RpZmllci5wbHVnaW5fbmFtZSA9IHBsdWdpbi5wbHVnaW5fbmFtZVxuICAgIFxuICAgIGlmKCFwbHVnaW5OYW1lc1twbHVnaW4ucGx1Z2luX25hbWVdKXtcbiAgICAgIHBsdWdpbnMucHVzaChtb2RpZmllcilcbiAgICB9XG5cbiAgICBwbHVnaW5OYW1lc1twbHVnaW4ucGx1Z2luX25hbWVdID0gdHJ1ZVxuXG4gICAgcmV0dXJuIGJyaWVmXG4gIH1cbn1cblxuaWYoIU9iamVjdC52YWx1ZXMpe1xuICBPYmplY3QudmFsdWVzID0gZnVuY3Rpb24ob2JqKXtcbiAgICByZXR1cm4gT2JqZWN0LmtleXMob2JqKS5tYXAoZnVuY3Rpb24oa2V5KXsgcmV0dXJuIG9ialtrZXldIH0pXG4gIH1cbn1cblxuZXhwb3J0IGRlZmF1bHQgYnJpZWZcbiJdfQ==