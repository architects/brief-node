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

var _pipelines = require('./pipelines');

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

  getModelPrototype: function getModelPrototype(nameOrTypeAlias) {
    var guess = arguments.length <= 1 || arguments[1] === undefined ? true : arguments[1];

    return (0, _model_registry.getModelPrototype)(nameOrTypeAlias, guess);
  },

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

  /** 
  * find a briefcase object that owns a given document or asset path
  */
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
  markdown: _pipelines.markdown,
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
//# sourceMappingURL=data:application/json;base64,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Q0FBQTtHQUM5RCxDQUFBO0NBQ0Y7O3FCQUVjLEtBQUsiLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgcGF0aCBmcm9tICdwYXRoJ1xuaW1wb3J0IGZzIGZyb20gJ2ZzJ1xuaW1wb3J0IEJyaWVmY2FzZSBmcm9tIFwiLi9icmllZmNhc2VcIlxuaW1wb3J0IEFzc2V0IGZyb20gJy4vYXNzZXQnXG5pbXBvcnQgRGF0YVNvdXJjZSBmcm9tICcuL2RhdGFfc291cmNlJ1xuaW1wb3J0IE1vZGVsIGZyb20gXCIuL21vZGVsXCJcbmltcG9ydCBEb2N1bWVudCBmcm9tIFwiLi9kb2N1bWVudFwiXG5pbXBvcnQgTW9kZWxEZWZpbml0aW9uIGZyb20gXCIuL21vZGVsX2RlZmluaXRpb25cIlxuaW1wb3J0IHttb2RlbCwgcmVnaXN0cnksIGdldE1vZGVsUHJvdG90eXBlfSBmcm9tICcuL21vZGVsX3JlZ2lzdHJ5J1xuaW1wb3J0IEdlbmVyYXRvciBmcm9tICcuL2dlbmVyYXRvcidcbmltcG9ydCB7bWFya2Rvd259IGZyb20gJy4vcGlwZWxpbmVzJ1xuaW1wb3J0IHttaXhpbn0gZnJvbSAnLi91dGlsJ1xuXG5jb25zdCBwbHVnaW5zID0gW11cbmNvbnN0IHBsdWdpbk5hbWVzID0ge31cblxuY29uc3QgcGtnID0gcGF0aC5qb2luKF9fZGlybmFtZSwgJy4uL3BhY2thZ2UuanNvbicpXG5jb25zdCBtYW5pZmVzdCA9IEpTT04ucGFyc2UoZnMucmVhZEZpbGVTeW5jKHBrZykpXG5cbmxldCBicmllZiA9IHtcbiAgVkVSU0lPTjogbWFuaWZlc3QudmVyc2lvbixcbiAgcGx1Z2luczogcGx1Z2lucyxcblxuICBCcmllZmNhc2U6IEJyaWVmY2FzZSxcblxuICBNb2RlbDogTW9kZWwsXG4gICBcbiAgTW9kZWxEZWZpbml0aW9uOiBNb2RlbERlZmluaXRpb24sXG5cbiAgLy8gVE9ET1xuICAvLyBUaGluayBvZiBhIGJldHRlciBBUEkgZm9yIHRoaXMuXG4gIHJlZ2lzdHJ5OiByZWdpc3RyeSxcblxuICBtb2RlbDogbW9kZWwsXG4gXG4gIGdldE1vZGVsUHJvdG90eXBlOiBmdW5jdGlvbihuYW1lT3JUeXBlQWxpYXMsIGd1ZXNzID0gdHJ1ZSl7XG4gICAgcmV0dXJuIGdldE1vZGVsUHJvdG90eXBlKG5hbWVPclR5cGVBbGlhcywgZ3Vlc3MpXG4gIH0sXG5cbiAgcmVzb2x2ZUxpbms6IGZ1bmN0aW9uKHBhdGhBbGlhcyl7XG4gICAgaWYoIWJyaWVmLmxpbmtSZXNvbHZlcil7XG4gICAgICByZXR1cm4gcGF0aEFsaWFzXG4gICAgfVxuICAgIHJldHVybiBicmllZi5saW5rUmVzb2x2ZXIocGF0aEFsaWFzKVxuICB9LFxuXG4gIHJlc29sdmVMaW5rc1dpdGg6IGZ1bmN0aW9uKGZuKXtcbiAgICBicmllZi5saW5rUmVzb2x2ZXIgPSBmblxuICB9LFxuXG4gIGluc3RhbmNlczogZnVuY3Rpb24oKXtcbiAgICByZXR1cm4gQnJpZWZjYXNlLmluc3RhbmNlcygpXG4gIH0sXG4gIFxuICAvKiogXG4gICogZmluZCBhIGJyaWVmY2FzZSBvYmplY3QgdGhhdCBvd25zIGEgZ2l2ZW4gZG9jdW1lbnQgb3IgYXNzZXQgcGF0aFxuICAqL1xuICBmaW5kQnJpZWZjYXNlQnlQYXRoOiBmdW5jdGlvbihwYXRoKXtcbiAgICByZXR1cm4gQnJpZWZjYXNlLmZpbmRGb3JQYXRoKHBhdGgpXG4gIH0sXG4gICBcbiAgYXRQYXRoOiBmdW5jdGlvbihyb290LCBvcHRpb25zPXt9KXtcbiAgICByZXR1cm4gQnJpZWZjYXNlLmxvYWQocm9vdCwgb3B0aW9ucylcbiAgfSxcblxuICBsb2FkOiBmdW5jdGlvbiAocm9vdCwgb3B0aW9ucz17fSkge1xuICAgIHJldHVybiBCcmllZmNhc2UubG9hZChyb290LCBvcHRpb25zKVxuICB9LFxuICBleGFtcGxlOiBmdW5jdGlvbihvcHRpb25zPXt9KXtcbiAgICByZXR1cm4gcmVxdWlyZShcIi4uL3Rlc3QvZXhhbXBsZVwiKSgpXG4gIH0sXG4gIGdlbmVyYXRlOiBmdW5jdGlvbihyb290LCBvcHRpb25zPXt9KXtcbiAgICByZXR1cm4gbmV3IEdlbmVyYXRvcih7XG4gICAgICBicmllZixcbiAgICAgIHJvb3RcbiAgICB9KS5ydW4oKVxuICB9LFxuICBmcm9tUGF0aDogZnVuY3Rpb24ocGF0aG5hbWUsIG9wdGlvbnMpe1xuICAgIGlmKGZzLmV4aXN0c1N5bmMocGF0aG5hbWUgKyAnL3BhY2thZ2UuanNvbicpKXtcbiAgICAgIHJldHVybiBicmllZi5mcm9tTWFuaWZlc3QocGF0aG5hbWUgKyAnL3BhY2thZ2UuanNvbicsIG9wdGlvbnMpXG4gICAgfVxuICAgIHJldHVybiBicmllZi5sb2FkKHBhdGhuYW1lLCBvcHRpb25zKVxuICB9LFxuICBmcm9tTWFuaWZlc3Q6IGZ1bmN0aW9uKGJyaWVmY2FzZU1hbmlmZXN0UGF0aCwgb3B0aW9ucyl7XG4gICAgbGV0IHVzZXNQbHVnaW5zID0gW11cbiAgICBsZXQgcGFyc2VkID0ge31cbiAgICBcbiAgICBpZihmcy5leGlzdHNTeW5jKGJyaWVmY2FzZU1hbmlmZXN0UGF0aCkpe1xuICAgICAgcGFyc2VkID0gSlNPTi5wYXJzZShmcy5yZWFkRmlsZVN5bmMoYnJpZWZjYXNlTWFuaWZlc3RQYXRoKS50b1N0cmluZygpKVxuICAgICAgaWYocGFyc2VkLmJyaWVmICYmIHBhcnNlZC5icmllZi5wbHVnaW5zKXtcbiAgICAgICAgdXNlc1BsdWdpbnMgPSB1c2VzUGx1Z2lucy5jb25jYXQocGFyc2VkLmJyaWVmLnBsdWdpbnMpICBcbiAgICAgIH1cbiAgICB9XG5cbiAgICB1c2VzUGx1Z2lucy5mb3JFYWNoKHBsdWdpbk5hbWUgPT4ge1xuICAgICAgYnJpZWYgPSBicmllZi51c2UocmVxdWlyZSgnYnJpZWYtcGx1Z2lucy0nICsgcGx1Z2luTmFtZSkpXG4gICAgfSlcblxuICAgIHJldHVybiBicmllZi5sb2FkKHBhdGguZGlybmFtZShicmllZmNhc2VNYW5pZmVzdFBhdGgpLCBvcHRpb25zKVxuICB9LFxuICBwbHVnaW5OYW1lczogZnVuY3Rpb24oKXtcbiAgICByZXR1cm4gT2JqZWN0LmtleXMocGx1Z2luTmFtZXMpXG4gIH0sXG4gIG1hcmtkb3duOiBtYXJrZG93bixcbiAgdXRpbDogcmVxdWlyZSgnLi91dGlsJyksXG4gIG1peGluOiBmdW5jdGlvbihleHRlbnNpb24sIG9wdGlvbnM9e30pe1xuICAgIGlmKHR5cGVvZihvcHRpb25zKT09PSdzdHJpbmcnKXtcbiAgICAgIG9wdGlvbnMgPSB7dGFyZ2V0OiBvcHRpb25zfVxuICAgIH1cblxuICAgIGxldCB7dGFyZ2V0fSA9IG9wdGlvbnNcbiAgICBcbiAgICBpZih0YXJnZXQgPT09ICdtb2RlbCcpeyBtaXhpbihNb2RlbCwgZXh0ZW5zaW9uKSB9XG4gICAgaWYodGFyZ2V0ID09PSAnYnJpZWZjYXNlJyl7IG1peGluKEJyaWVmY2FzZSwgZXh0ZW5zaW9uKSB9XG4gICAgaWYodGFyZ2V0ID09PSAnZG9jdW1lbnQnKXsgbWl4aW4oRG9jdW1lbnQsIGV4dGVuc2lvbikgfVxuICAgIGlmKHRhcmdldCA9PT0gJ2Fzc2V0Jyl7IG1peGluKEFzc2V0LCBleHRlbnNpb24pIH1cbiAgICBpZih0YXJnZXQgPT09ICdkYXRhJyl7IG1peGluKERhdGFTb3VyY2UsIGV4dGVuc2lvbikgfVxuICB9LFxuICB1c2U6IGZ1bmN0aW9uKHBsdWdpbiwgb3B0aW9ucyl7XG4gICAgdmFyIGJyaWVmID0gdGhpc1xuICAgIHZhciBtb2RpZmllciA9IHBsdWdpbihicmllZiwgb3B0aW9ucylcbiAgICBtb2RpZmllci52ZXJzaW9uID0gcGx1Z2luLnZlcnNpb25cbiAgICBtb2RpZmllci5wbHVnaW5fbmFtZSA9IHBsdWdpbi5wbHVnaW5fbmFtZVxuICAgIFxuICAgIGlmKCFwbHVnaW5OYW1lc1twbHVnaW4ucGx1Z2luX25hbWVdKXtcbiAgICAgIHBsdWdpbnMucHVzaChtb2RpZmllcilcbiAgICB9XG5cbiAgICBwbHVnaW5OYW1lc1twbHVnaW4ucGx1Z2luX25hbWVdID0gdHJ1ZVxuXG4gICAgcmV0dXJuIGJyaWVmXG4gIH1cbn1cblxuaWYoIU9iamVjdC52YWx1ZXMpe1xuICBPYmplY3QudmFsdWVzID0gZnVuY3Rpb24ob2JqKXtcbiAgICByZXR1cm4gT2JqZWN0LmtleXMob2JqKS5tYXAoZnVuY3Rpb24oa2V5KXsgcmV0dXJuIG9ialtrZXldIH0pXG4gIH1cbn1cblxuZXhwb3J0IGRlZmF1bHQgYnJpZWZcbiJdfQ==