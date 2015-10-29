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
  registry: _model_registry.registry,
  model: _model_registry.model,
  resolveLink: function resolveLink(pathAlias) {
    if (!brief.linkResolver) {
      console.log("There is no link resolver");
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
    if (_fs2['default'].existsSync(pathname + './package.json')) {
      return brief.fromManifest(pathname + './package.json', options);
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
      brief.use(require('brief-plugins-' + pluginName));
    });

    return brief.load(_path2['default'].dirname(briefcaseManifestPath), options);
  },
  pluginNames: function pluginNames() {
    return Object.keys(_pluginNames);
  },
  markdown: _render.markdown,
  use: function use(plugin, options) {
    var modifier = plugin(this, options);
    modifier.version = plugin.version;
    modifier.plugin_name = plugin.plugin_name;

    if (!_pluginNames[plugin.plugin_name]) {
      plugins.push(modifier);
    }

    _pluginNames[plugin.plugin_name] = true;

    return this;
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3NyYy9pbmRleC5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7OztvQkFBaUIsTUFBTTs7OztrQkFDUixJQUFJOzs7O3lCQUNHLGFBQWE7Ozs7cUJBQ2pCLFNBQVM7Ozs7d0JBQ04sWUFBWTs7OztnQ0FDTCxvQkFBb0I7Ozs7OEJBQ2xCLGtCQUFrQjs7eUJBQzFCLGFBQWE7Ozs7c0JBQ1osVUFBVTs7QUFFakMsSUFBTSxPQUFPLEdBQUcsRUFBRSxDQUFBO0FBQ2xCLElBQU0sWUFBVyxHQUFHLEVBQUUsQ0FBQTs7QUFFdEIsSUFBTSxHQUFHLEdBQUcsa0JBQUssSUFBSSxDQUFDLFNBQVMsRUFBRSxpQkFBaUIsQ0FBQyxDQUFBO0FBQ25ELElBQU0sUUFBUSxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsZ0JBQUcsWUFBWSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUE7O0FBRWpELElBQUksS0FBSyxHQUFHO0FBQ1YsU0FBTyxFQUFFLFFBQVEsQ0FBQyxPQUFPO0FBQ3pCLFNBQU8sRUFBRSxPQUFPO0FBQ2hCLFdBQVMsd0JBQVc7QUFDcEIsT0FBSyxvQkFBTztBQUNaLGlCQUFlLCtCQUFpQjtBQUNoQyxVQUFRLDBCQUFVO0FBQ2xCLE9BQUssdUJBQU87QUFDWixhQUFXLEVBQUUscUJBQVMsU0FBUyxFQUFDO0FBQzlCLFFBQUcsQ0FBQyxLQUFLLENBQUMsWUFBWSxFQUFDO0FBQ3JCLGFBQU8sQ0FBQyxHQUFHLENBQUMsMkJBQTJCLENBQUMsQ0FBQTtBQUN4QyxhQUFPLFNBQVMsQ0FBQTtLQUNqQjtBQUNELFdBQU8sS0FBSyxDQUFDLFlBQVksQ0FBQyxTQUFTLENBQUMsQ0FBQTtHQUNyQztBQUNELGtCQUFnQixFQUFFLDBCQUFTLEVBQUUsRUFBQztBQUM1QixTQUFLLENBQUMsWUFBWSxHQUFHLEVBQUUsQ0FBQTtHQUN4QjtBQUNELFdBQVMsRUFBRSxxQkFBVTtBQUNuQixXQUFPLHVCQUFVLFNBQVMsRUFBRSxDQUFBO0dBQzdCO0FBQ0QscUJBQW1CLEVBQUUsNkJBQVMsSUFBSSxFQUFDO0FBQ2pDLFdBQU8sdUJBQVUsV0FBVyxDQUFDLElBQUksQ0FBQyxDQUFBO0dBQ25DO0FBQ0QsUUFBTSxFQUFFLGdCQUFTLElBQUksRUFBYTtRQUFYLE9BQU8seURBQUMsRUFBRTs7QUFDL0IsV0FBTyx1QkFBVSxJQUFJLENBQUMsSUFBSSxFQUFFLE9BQU8sQ0FBQyxDQUFBO0dBQ3JDO0FBQ0QsTUFBSSxFQUFFLGNBQVUsSUFBSSxFQUFjO1FBQVosT0FBTyx5REFBQyxFQUFFOztBQUM5QixXQUFPLHVCQUFVLElBQUksQ0FBQyxJQUFJLEVBQUUsT0FBTyxDQUFDLENBQUE7R0FDckM7QUFDRCxTQUFPLEVBQUUsbUJBQW9CO1FBQVgsT0FBTyx5REFBQyxFQUFFOztBQUMxQixXQUFPLE9BQU8sQ0FBQyxpQkFBaUIsQ0FBQyxFQUFFLENBQUE7R0FDcEM7QUFDRCxVQUFRLEVBQUUsa0JBQVMsSUFBSSxFQUFhO1FBQVgsT0FBTyx5REFBQyxFQUFFOztBQUNqQyxXQUFPLDJCQUFjO0FBQ25CLFdBQUssRUFBTCxLQUFLO0FBQ0wsVUFBSSxFQUFKLElBQUk7S0FDTCxDQUFDLENBQUMsR0FBRyxFQUFFLENBQUE7R0FDVDtBQUNELFVBQVEsRUFBRSxrQkFBUyxRQUFRLEVBQUUsT0FBTyxFQUFDO0FBQ25DLFFBQUcsZ0JBQUcsVUFBVSxDQUFDLFFBQVEsR0FBRyxnQkFBZ0IsQ0FBQyxFQUFDO0FBQzVDLGFBQU8sS0FBSyxDQUFDLFlBQVksQ0FBQyxRQUFRLEdBQUcsZ0JBQWdCLEVBQUUsT0FBTyxDQUFDLENBQUE7S0FDaEU7QUFDRCxXQUFPLEtBQUssQ0FBQyxJQUFJLENBQUMsUUFBUSxFQUFFLE9BQU8sQ0FBQyxDQUFBO0dBQ3JDO0FBQ0QsY0FBWSxFQUFFLHNCQUFTLHFCQUFxQixFQUFFLE9BQU8sRUFBQztBQUNwRCxRQUFJLFdBQVcsR0FBRyxFQUFFLENBQUE7QUFDcEIsUUFBSSxNQUFNLEdBQUcsRUFBRSxDQUFBOztBQUVmLFFBQUcsZ0JBQUcsVUFBVSxDQUFDLHFCQUFxQixDQUFDLEVBQUM7QUFDdEMsWUFBTSxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsZ0JBQUcsWUFBWSxDQUFDLHFCQUFxQixDQUFDLENBQUMsUUFBUSxFQUFFLENBQUMsQ0FBQTtBQUN0RSxVQUFHLE1BQU0sQ0FBQyxLQUFLLElBQUksTUFBTSxDQUFDLEtBQUssQ0FBQyxPQUFPLEVBQUM7QUFDdEMsbUJBQVcsR0FBRyxXQUFXLENBQUMsTUFBTSxDQUFDLE1BQU0sQ0FBQyxLQUFLLENBQUMsT0FBTyxDQUFDLENBQUE7T0FDdkQ7S0FDRjs7QUFFRCxlQUFXLENBQUMsT0FBTyxDQUFDLFVBQUEsVUFBVSxFQUFJO0FBQ2hDLFdBQUssQ0FBQyxHQUFHLENBQUMsT0FBTyxDQUFDLGdCQUFnQixHQUFHLFVBQVUsQ0FBQyxDQUFDLENBQUE7S0FDbEQsQ0FBQyxDQUFBOztBQUVGLFdBQU8sS0FBSyxDQUFDLElBQUksQ0FBQyxrQkFBSyxPQUFPLENBQUMscUJBQXFCLENBQUMsRUFBRSxPQUFPLENBQUMsQ0FBQTtHQUNoRTtBQUNELGFBQVcsRUFBRSx1QkFBVTtBQUNyQixXQUFPLE1BQU0sQ0FBQyxJQUFJLENBQUMsWUFBVyxDQUFDLENBQUE7R0FDaEM7QUFDRCxVQUFRLGtCQUFVO0FBQ2xCLEtBQUcsRUFBRSxhQUFTLE1BQU0sRUFBRSxPQUFPLEVBQUM7QUFDNUIsUUFBSSxRQUFRLEdBQUcsTUFBTSxDQUFDLElBQUksRUFBRSxPQUFPLENBQUMsQ0FBQTtBQUNwQyxZQUFRLENBQUMsT0FBTyxHQUFHLE1BQU0sQ0FBQyxPQUFPLENBQUE7QUFDakMsWUFBUSxDQUFDLFdBQVcsR0FBRyxNQUFNLENBQUMsV0FBVyxDQUFBOztBQUV6QyxRQUFHLENBQUMsWUFBVyxDQUFDLE1BQU0sQ0FBQyxXQUFXLENBQUMsRUFBQztBQUNsQyxhQUFPLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxDQUFBO0tBQ3ZCOztBQUVELGdCQUFXLENBQUMsTUFBTSxDQUFDLFdBQVcsQ0FBQyxHQUFHLElBQUksQ0FBQTs7QUFFdEMsV0FBTyxJQUFJLENBQUE7R0FDWjtDQUNGLENBQUE7O0FBRUQsSUFBRyxDQUFDLE1BQU0sQ0FBQyxNQUFNLEVBQUM7QUFDaEIsUUFBTSxDQUFDLE1BQU0sR0FBRyxVQUFTLEdBQUcsRUFBQztBQUMzQixXQUFPLE1BQU0sQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUMsR0FBRyxDQUFDLFVBQVMsR0FBRyxFQUFDO0FBQUUsYUFBTyxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUE7S0FBRSxDQUFDLENBQUE7R0FDOUQsQ0FBQTtDQUNGOztxQkFFYyxLQUFLIiwiZmlsZSI6ImluZGV4LmpzIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHBhdGggZnJvbSAncGF0aCdcbmltcG9ydCBmcyBmcm9tICdmcydcbmltcG9ydCBCcmllZmNhc2UgZnJvbSBcIi4vYnJpZWZjYXNlXCJcbmltcG9ydCBNb2RlbCBmcm9tIFwiLi9tb2RlbFwiXG5pbXBvcnQgRG9jdW1lbnQgZnJvbSBcIi4vZG9jdW1lbnRcIlxuaW1wb3J0IE1vZGVsRGVmaW5pdGlvbiBmcm9tIFwiLi9tb2RlbF9kZWZpbml0aW9uXCJcbmltcG9ydCB7bW9kZWwsIHJlZ2lzdHJ5fSBmcm9tICcuL21vZGVsX3JlZ2lzdHJ5J1xuaW1wb3J0IEdlbmVyYXRvciBmcm9tICcuL2dlbmVyYXRvcidcbmltcG9ydCB7bWFya2Rvd259IGZyb20gJy4vcmVuZGVyJ1xuXG5jb25zdCBwbHVnaW5zID0gW11cbmNvbnN0IHBsdWdpbk5hbWVzID0ge31cblxuY29uc3QgcGtnID0gcGF0aC5qb2luKF9fZGlybmFtZSwgJy4uL3BhY2thZ2UuanNvbicpXG5jb25zdCBtYW5pZmVzdCA9IEpTT04ucGFyc2UoZnMucmVhZEZpbGVTeW5jKHBrZykpXG5cbmxldCBicmllZiA9IHtcbiAgVkVSU0lPTjogbWFuaWZlc3QudmVyc2lvbixcbiAgcGx1Z2luczogcGx1Z2lucyxcbiAgQnJpZWZjYXNlOiBCcmllZmNhc2UsXG4gIE1vZGVsOiBNb2RlbCxcbiAgTW9kZWxEZWZpbml0aW9uOiBNb2RlbERlZmluaXRpb24sXG4gIHJlZ2lzdHJ5OiByZWdpc3RyeSxcbiAgbW9kZWw6IG1vZGVsLFxuICByZXNvbHZlTGluazogZnVuY3Rpb24ocGF0aEFsaWFzKXtcbiAgICBpZighYnJpZWYubGlua1Jlc29sdmVyKXtcbiAgICAgIGNvbnNvbGUubG9nKFwiVGhlcmUgaXMgbm8gbGluayByZXNvbHZlclwiKVxuICAgICAgcmV0dXJuIHBhdGhBbGlhc1xuICAgIH1cbiAgICByZXR1cm4gYnJpZWYubGlua1Jlc29sdmVyKHBhdGhBbGlhcylcbiAgfSxcbiAgcmVzb2x2ZUxpbmtzV2l0aDogZnVuY3Rpb24oZm4pe1xuICAgIGJyaWVmLmxpbmtSZXNvbHZlciA9IGZuXG4gIH0sXG4gIGluc3RhbmNlczogZnVuY3Rpb24oKXtcbiAgICByZXR1cm4gQnJpZWZjYXNlLmluc3RhbmNlcygpXG4gIH0sXG4gIGZpbmRCcmllZmNhc2VCeVBhdGg6IGZ1bmN0aW9uKHBhdGgpe1xuICAgIHJldHVybiBCcmllZmNhc2UuZmluZEZvclBhdGgocGF0aClcbiAgfSxcbiAgYXRQYXRoOiBmdW5jdGlvbihyb290LCBvcHRpb25zPXt9KXtcbiAgICByZXR1cm4gQnJpZWZjYXNlLmxvYWQocm9vdCwgb3B0aW9ucylcbiAgfSxcbiAgbG9hZDogZnVuY3Rpb24gKHJvb3QsIG9wdGlvbnM9e30pIHtcbiAgICByZXR1cm4gQnJpZWZjYXNlLmxvYWQocm9vdCwgb3B0aW9ucylcbiAgfSxcbiAgZXhhbXBsZTogZnVuY3Rpb24ob3B0aW9ucz17fSl7XG4gICAgcmV0dXJuIHJlcXVpcmUoXCIuLi90ZXN0L2V4YW1wbGVcIikoKVxuICB9LFxuICBnZW5lcmF0ZTogZnVuY3Rpb24ocm9vdCwgb3B0aW9ucz17fSl7XG4gICAgcmV0dXJuIG5ldyBHZW5lcmF0b3Ioe1xuICAgICAgYnJpZWYsXG4gICAgICByb290XG4gICAgfSkucnVuKClcbiAgfSxcbiAgZnJvbVBhdGg6IGZ1bmN0aW9uKHBhdGhuYW1lLCBvcHRpb25zKXtcbiAgICBpZihmcy5leGlzdHNTeW5jKHBhdGhuYW1lICsgJy4vcGFja2FnZS5qc29uJykpe1xuICAgICAgcmV0dXJuIGJyaWVmLmZyb21NYW5pZmVzdChwYXRobmFtZSArICcuL3BhY2thZ2UuanNvbicsIG9wdGlvbnMpXG4gICAgfVxuICAgIHJldHVybiBicmllZi5sb2FkKHBhdGhuYW1lLCBvcHRpb25zKVxuICB9LFxuICBmcm9tTWFuaWZlc3Q6IGZ1bmN0aW9uKGJyaWVmY2FzZU1hbmlmZXN0UGF0aCwgb3B0aW9ucyl7XG4gICAgbGV0IHVzZXNQbHVnaW5zID0gW11cbiAgICBsZXQgcGFyc2VkID0ge31cbiAgICBcbiAgICBpZihmcy5leGlzdHNTeW5jKGJyaWVmY2FzZU1hbmlmZXN0UGF0aCkpe1xuICAgICAgcGFyc2VkID0gSlNPTi5wYXJzZShmcy5yZWFkRmlsZVN5bmMoYnJpZWZjYXNlTWFuaWZlc3RQYXRoKS50b1N0cmluZygpKVxuICAgICAgaWYocGFyc2VkLmJyaWVmICYmIHBhcnNlZC5icmllZi5wbHVnaW5zKXtcbiAgICAgICAgdXNlc1BsdWdpbnMgPSB1c2VzUGx1Z2lucy5jb25jYXQocGFyc2VkLmJyaWVmLnBsdWdpbnMpICBcbiAgICAgIH1cbiAgICB9XG5cbiAgICB1c2VzUGx1Z2lucy5mb3JFYWNoKHBsdWdpbk5hbWUgPT4ge1xuICAgICAgYnJpZWYudXNlKHJlcXVpcmUoJ2JyaWVmLXBsdWdpbnMtJyArIHBsdWdpbk5hbWUpKVxuICAgIH0pXG5cbiAgICByZXR1cm4gYnJpZWYubG9hZChwYXRoLmRpcm5hbWUoYnJpZWZjYXNlTWFuaWZlc3RQYXRoKSwgb3B0aW9ucylcbiAgfSxcbiAgcGx1Z2luTmFtZXM6IGZ1bmN0aW9uKCl7XG4gICAgcmV0dXJuIE9iamVjdC5rZXlzKHBsdWdpbk5hbWVzKVxuICB9LFxuICBtYXJrZG93bjogbWFya2Rvd24sXG4gIHVzZTogZnVuY3Rpb24ocGx1Z2luLCBvcHRpb25zKXtcbiAgICB2YXIgbW9kaWZpZXIgPSBwbHVnaW4odGhpcywgb3B0aW9ucylcbiAgICBtb2RpZmllci52ZXJzaW9uID0gcGx1Z2luLnZlcnNpb25cbiAgICBtb2RpZmllci5wbHVnaW5fbmFtZSA9IHBsdWdpbi5wbHVnaW5fbmFtZVxuICAgIFxuICAgIGlmKCFwbHVnaW5OYW1lc1twbHVnaW4ucGx1Z2luX25hbWVdKXtcbiAgICAgIHBsdWdpbnMucHVzaChtb2RpZmllcilcbiAgICB9XG5cbiAgICBwbHVnaW5OYW1lc1twbHVnaW4ucGx1Z2luX25hbWVdID0gdHJ1ZVxuXG4gICAgcmV0dXJuIHRoaXNcbiAgfVxufVxuXG5pZighT2JqZWN0LnZhbHVlcyl7XG4gIE9iamVjdC52YWx1ZXMgPSBmdW5jdGlvbihvYmope1xuICAgIHJldHVybiBPYmplY3Qua2V5cyhvYmopLm1hcChmdW5jdGlvbihrZXkpeyByZXR1cm4gb2JqW2tleV0gfSlcbiAgfVxufVxuXG5leHBvcnQgZGVmYXVsdCBicmllZlxuIl19