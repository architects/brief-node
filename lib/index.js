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
  util: require('./util'),
  mixin: function mixin(_mixin) {
    var options = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];
  },

  //TODO
  // Allow a plugin to extend default class behavior via mixins
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
//# sourceMappingURL=data:application/json;base64,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QUcsQ0FBQyxZQUFXLENBQUMsTUFBTSxDQUFDLFdBQVcsQ0FBQyxFQUFDO0FBQ2xDLGFBQU8sQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLENBQUE7S0FDdkI7O0FBRUQsZ0JBQVcsQ0FBQyxNQUFNLENBQUMsV0FBVyxDQUFDLEdBQUcsSUFBSSxDQUFBOztBQUV0QyxXQUFPLEtBQUssQ0FBQTtHQUNiO0NBQ0YsQ0FBQTs7QUFFRCxJQUFHLENBQUMsTUFBTSxDQUFDLE1BQU0sRUFBQztBQUNoQixRQUFNLENBQUMsTUFBTSxHQUFHLFVBQVMsR0FBRyxFQUFDO0FBQzNCLFdBQU8sTUFBTSxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQyxHQUFHLENBQUMsVUFBUyxHQUFHLEVBQUM7QUFBRSxhQUFPLEdBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQTtLQUFFLENBQUMsQ0FBQTtHQUM5RCxDQUFBO0NBQ0Y7O3FCQUVjLEtBQUsiLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgcGF0aCBmcm9tICdwYXRoJ1xuaW1wb3J0IGZzIGZyb20gJ2ZzJ1xuaW1wb3J0IEJyaWVmY2FzZSBmcm9tIFwiLi9icmllZmNhc2VcIlxuaW1wb3J0IEFzc2V0IGZyb20gJy4vYXNzZXQnXG5pbXBvcnQgRGF0YVNvdXJjZSBmcm9tICcuL2RhdGFfc291cmNlJ1xuaW1wb3J0IE1vZGVsIGZyb20gXCIuL21vZGVsXCJcbmltcG9ydCBEb2N1bWVudCBmcm9tIFwiLi9kb2N1bWVudFwiXG5pbXBvcnQgTW9kZWxEZWZpbml0aW9uIGZyb20gXCIuL21vZGVsX2RlZmluaXRpb25cIlxuaW1wb3J0IHttb2RlbCwgcmVnaXN0cnl9IGZyb20gJy4vbW9kZWxfcmVnaXN0cnknXG5pbXBvcnQgR2VuZXJhdG9yIGZyb20gJy4vZ2VuZXJhdG9yJ1xuaW1wb3J0IHttYXJrZG93bn0gZnJvbSAnLi9yZW5kZXInXG5cbmNvbnN0IHBsdWdpbnMgPSBbXVxuY29uc3QgcGx1Z2luTmFtZXMgPSB7fVxuXG5jb25zdCBwa2cgPSBwYXRoLmpvaW4oX19kaXJuYW1lLCAnLi4vcGFja2FnZS5qc29uJylcbmNvbnN0IG1hbmlmZXN0ID0gSlNPTi5wYXJzZShmcy5yZWFkRmlsZVN5bmMocGtnKSlcblxubGV0IGJyaWVmID0ge1xuICBWRVJTSU9OOiBtYW5pZmVzdC52ZXJzaW9uLFxuICBwbHVnaW5zOiBwbHVnaW5zLFxuICBCcmllZmNhc2U6IEJyaWVmY2FzZSxcbiAgTW9kZWw6IE1vZGVsLFxuICAgXG4gIE1vZGVsRGVmaW5pdGlvbjogTW9kZWxEZWZpbml0aW9uLFxuXG4gIC8vIFRPRE9cbiAgLy8gVGhpbmsgb2YgYSBiZXR0ZXIgQVBJIGZvciB0aGlzLlxuICByZWdpc3RyeTogcmVnaXN0cnksXG4gIG1vZGVsOiBtb2RlbCxcblxuICByZXNvbHZlTGluazogZnVuY3Rpb24ocGF0aEFsaWFzKXtcbiAgICBpZighYnJpZWYubGlua1Jlc29sdmVyKXtcbiAgICAgIGNvbnNvbGUubG9nKFwiVGhlcmUgaXMgbm8gbGluayByZXNvbHZlclwiKVxuICAgICAgcmV0dXJuIHBhdGhBbGlhc1xuICAgIH1cbiAgICByZXR1cm4gYnJpZWYubGlua1Jlc29sdmVyKHBhdGhBbGlhcylcbiAgfSxcbiAgcmVzb2x2ZUxpbmtzV2l0aDogZnVuY3Rpb24oZm4pe1xuICAgIGJyaWVmLmxpbmtSZXNvbHZlciA9IGZuXG4gIH0sXG4gIGluc3RhbmNlczogZnVuY3Rpb24oKXtcbiAgICByZXR1cm4gQnJpZWZjYXNlLmluc3RhbmNlcygpXG4gIH0sXG4gIGZpbmRCcmllZmNhc2VCeVBhdGg6IGZ1bmN0aW9uKHBhdGgpe1xuICAgIHJldHVybiBCcmllZmNhc2UuZmluZEZvclBhdGgocGF0aClcbiAgfSxcbiAgYXRQYXRoOiBmdW5jdGlvbihyb290LCBvcHRpb25zPXt9KXtcbiAgICByZXR1cm4gQnJpZWZjYXNlLmxvYWQocm9vdCwgb3B0aW9ucylcbiAgfSxcbiAgbG9hZDogZnVuY3Rpb24gKHJvb3QsIG9wdGlvbnM9e30pIHtcbiAgICByZXR1cm4gQnJpZWZjYXNlLmxvYWQocm9vdCwgb3B0aW9ucylcbiAgfSxcbiAgZXhhbXBsZTogZnVuY3Rpb24ob3B0aW9ucz17fSl7XG4gICAgcmV0dXJuIHJlcXVpcmUoXCIuLi90ZXN0L2V4YW1wbGVcIikoKVxuICB9LFxuICBnZW5lcmF0ZTogZnVuY3Rpb24ocm9vdCwgb3B0aW9ucz17fSl7XG4gICAgcmV0dXJuIG5ldyBHZW5lcmF0b3Ioe1xuICAgICAgYnJpZWYsXG4gICAgICByb290XG4gICAgfSkucnVuKClcbiAgfSxcbiAgZnJvbVBhdGg6IGZ1bmN0aW9uKHBhdGhuYW1lLCBvcHRpb25zKXtcbiAgICBpZihmcy5leGlzdHNTeW5jKHBhdGhuYW1lICsgJy4vcGFja2FnZS5qc29uJykpe1xuICAgICAgcmV0dXJuIGJyaWVmLmZyb21NYW5pZmVzdChwYXRobmFtZSArICcuL3BhY2thZ2UuanNvbicsIG9wdGlvbnMpXG4gICAgfVxuICAgIHJldHVybiBicmllZi5sb2FkKHBhdGhuYW1lLCBvcHRpb25zKVxuICB9LFxuICBmcm9tTWFuaWZlc3Q6IGZ1bmN0aW9uKGJyaWVmY2FzZU1hbmlmZXN0UGF0aCwgb3B0aW9ucyl7XG4gICAgbGV0IHVzZXNQbHVnaW5zID0gW11cbiAgICBsZXQgcGFyc2VkID0ge31cbiAgICBcbiAgICBpZihmcy5leGlzdHNTeW5jKGJyaWVmY2FzZU1hbmlmZXN0UGF0aCkpe1xuICAgICAgcGFyc2VkID0gSlNPTi5wYXJzZShmcy5yZWFkRmlsZVN5bmMoYnJpZWZjYXNlTWFuaWZlc3RQYXRoKS50b1N0cmluZygpKVxuICAgICAgaWYocGFyc2VkLmJyaWVmICYmIHBhcnNlZC5icmllZi5wbHVnaW5zKXtcbiAgICAgICAgdXNlc1BsdWdpbnMgPSB1c2VzUGx1Z2lucy5jb25jYXQocGFyc2VkLmJyaWVmLnBsdWdpbnMpICBcbiAgICAgIH1cbiAgICB9XG5cbiAgICB1c2VzUGx1Z2lucy5mb3JFYWNoKHBsdWdpbk5hbWUgPT4ge1xuICAgICAgYnJpZWYudXNlKHJlcXVpcmUoJ2JyaWVmLXBsdWdpbnMtJyArIHBsdWdpbk5hbWUpKVxuICAgIH0pXG5cbiAgICByZXR1cm4gYnJpZWYubG9hZChwYXRoLmRpcm5hbWUoYnJpZWZjYXNlTWFuaWZlc3RQYXRoKSwgb3B0aW9ucylcbiAgfSxcbiAgcGx1Z2luTmFtZXM6IGZ1bmN0aW9uKCl7XG4gICAgcmV0dXJuIE9iamVjdC5rZXlzKHBsdWdpbk5hbWVzKVxuICB9LFxuICBtYXJrZG93bjogbWFya2Rvd24sXG4gIHV0aWw6IHJlcXVpcmUoJy4vdXRpbCcpLFxuICBtaXhpbjogZnVuY3Rpb24obWl4aW4sIG9wdGlvbnM9e30pe1xuICAgIC8vVE9ETyBcbiAgICAvLyBBbGxvdyBhIHBsdWdpbiB0byBleHRlbmQgZGVmYXVsdCBjbGFzcyBiZWhhdmlvciB2aWEgbWl4aW5zXG4gIH0sXG4gIHVzZTogZnVuY3Rpb24ocGx1Z2luLCBvcHRpb25zKXtcbiAgICB2YXIgYnJpZWYgPSB0aGlzXG4gICAgdmFyIG1vZGlmaWVyID0gcGx1Z2luKGJyaWVmLCBvcHRpb25zKVxuICAgIG1vZGlmaWVyLnZlcnNpb24gPSBwbHVnaW4udmVyc2lvblxuICAgIG1vZGlmaWVyLnBsdWdpbl9uYW1lID0gcGx1Z2luLnBsdWdpbl9uYW1lXG4gICAgXG4gICAgaWYoIXBsdWdpbk5hbWVzW3BsdWdpbi5wbHVnaW5fbmFtZV0pe1xuICAgICAgcGx1Z2lucy5wdXNoKG1vZGlmaWVyKVxuICAgIH1cblxuICAgIHBsdWdpbk5hbWVzW3BsdWdpbi5wbHVnaW5fbmFtZV0gPSB0cnVlXG5cbiAgICByZXR1cm4gYnJpZWZcbiAgfVxufVxuXG5pZighT2JqZWN0LnZhbHVlcyl7XG4gIE9iamVjdC52YWx1ZXMgPSBmdW5jdGlvbihvYmope1xuICAgIHJldHVybiBPYmplY3Qua2V5cyhvYmopLm1hcChmdW5jdGlvbihrZXkpeyByZXR1cm4gb2JqW2tleV0gfSlcbiAgfVxufVxuXG5leHBvcnQgZGVmYXVsdCBicmllZlxuIl19