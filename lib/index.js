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
//# sourceMappingURL=data:application/json;base64,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RCxDQUFBO0NBQ0Y7O3FCQUVjLEtBQUsiLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgcGF0aCBmcm9tICdwYXRoJ1xuaW1wb3J0IGZzIGZyb20gJ2ZzJ1xuaW1wb3J0IEJyaWVmY2FzZSBmcm9tIFwiLi9icmllZmNhc2VcIlxuaW1wb3J0IEFzc2V0IGZyb20gJy4vYXNzZXQnXG5pbXBvcnQgRGF0YVNvdXJjZSBmcm9tICcuL2RhdGFfc291cmNlJ1xuaW1wb3J0IE1vZGVsIGZyb20gXCIuL21vZGVsXCJcbmltcG9ydCBEb2N1bWVudCBmcm9tIFwiLi9kb2N1bWVudFwiXG5pbXBvcnQgTW9kZWxEZWZpbml0aW9uIGZyb20gXCIuL21vZGVsX2RlZmluaXRpb25cIlxuaW1wb3J0IHttb2RlbCwgcmVnaXN0cnksIGdldE1vZGVsUHJvdG90eXBlfSBmcm9tICcuL21vZGVsX3JlZ2lzdHJ5J1xuaW1wb3J0IEdlbmVyYXRvciBmcm9tICcuL2dlbmVyYXRvcidcbmltcG9ydCB7bWFya2Rvd259IGZyb20gJy4vcGlwZWxpbmVzJ1xuaW1wb3J0IHttaXhpbn0gZnJvbSAnLi91dGlsJ1xuXG5jb25zdCBwbHVnaW5zID0gW11cbmNvbnN0IHBsdWdpbk5hbWVzID0ge31cblxuY29uc3QgcGtnID0gcGF0aC5qb2luKF9fZGlybmFtZSwgJy4uL3BhY2thZ2UuanNvbicpXG5jb25zdCBtYW5pZmVzdCA9IEpTT04ucGFyc2UoZnMucmVhZEZpbGVTeW5jKHBrZykpXG5cbmxldCBicmllZiA9IHtcbiAgVkVSU0lPTjogbWFuaWZlc3QudmVyc2lvbixcbiAgcGx1Z2luczogcGx1Z2lucyxcblxuICBCcmllZmNhc2U6IEJyaWVmY2FzZSxcblxuICBNb2RlbDogTW9kZWwsXG4gICBcbiAgTW9kZWxEZWZpbml0aW9uOiBNb2RlbERlZmluaXRpb24sXG5cbiAgLy8gVE9ET1xuICAvLyBUaGluayBvZiBhIGJldHRlciBBUEkgZm9yIHRoaXMuXG4gIHJlZ2lzdHJ5OiByZWdpc3RyeSxcbiAgbW9kZWw6IG1vZGVsLFxuICBcbiAgZ2V0TW9kZWxQcm90b3R5cGU6IGZ1bmN0aW9uKG5hbWVPclR5cGVBbGlhcywgZ3Vlc3MgPSB0cnVlKXtcbiAgICByZXR1cm4gZ2V0TW9kZWxQcm90b3R5cGUobmFtZU9yVHlwZUFsaWFzLCBndWVzcylcbiAgfSxcblxuICByZXNvbHZlTGluazogZnVuY3Rpb24ocGF0aEFsaWFzKXtcbiAgICBpZighYnJpZWYubGlua1Jlc29sdmVyKXtcbiAgICAgIHJldHVybiBwYXRoQWxpYXNcbiAgICB9XG4gICAgcmV0dXJuIGJyaWVmLmxpbmtSZXNvbHZlcihwYXRoQWxpYXMpXG4gIH0sXG4gIHJlc29sdmVMaW5rc1dpdGg6IGZ1bmN0aW9uKGZuKXtcbiAgICBicmllZi5saW5rUmVzb2x2ZXIgPSBmblxuICB9LFxuICBpbnN0YW5jZXM6IGZ1bmN0aW9uKCl7XG4gICAgcmV0dXJuIEJyaWVmY2FzZS5pbnN0YW5jZXMoKVxuICB9LFxuICBmaW5kQnJpZWZjYXNlQnlQYXRoOiBmdW5jdGlvbihwYXRoKXtcbiAgICByZXR1cm4gQnJpZWZjYXNlLmZpbmRGb3JQYXRoKHBhdGgpXG4gIH0sXG4gIGF0UGF0aDogZnVuY3Rpb24ocm9vdCwgb3B0aW9ucz17fSl7XG4gICAgcmV0dXJuIEJyaWVmY2FzZS5sb2FkKHJvb3QsIG9wdGlvbnMpXG4gIH0sXG4gIGxvYWQ6IGZ1bmN0aW9uIChyb290LCBvcHRpb25zPXt9KSB7XG4gICAgcmV0dXJuIEJyaWVmY2FzZS5sb2FkKHJvb3QsIG9wdGlvbnMpXG4gIH0sXG4gIGV4YW1wbGU6IGZ1bmN0aW9uKG9wdGlvbnM9e30pe1xuICAgIHJldHVybiByZXF1aXJlKFwiLi4vdGVzdC9leGFtcGxlXCIpKClcbiAgfSxcbiAgZ2VuZXJhdGU6IGZ1bmN0aW9uKHJvb3QsIG9wdGlvbnM9e30pe1xuICAgIHJldHVybiBuZXcgR2VuZXJhdG9yKHtcbiAgICAgIGJyaWVmLFxuICAgICAgcm9vdFxuICAgIH0pLnJ1bigpXG4gIH0sXG4gIGZyb21QYXRoOiBmdW5jdGlvbihwYXRobmFtZSwgb3B0aW9ucyl7XG4gICAgaWYoZnMuZXhpc3RzU3luYyhwYXRobmFtZSArICcvcGFja2FnZS5qc29uJykpe1xuICAgICAgcmV0dXJuIGJyaWVmLmZyb21NYW5pZmVzdChwYXRobmFtZSArICcvcGFja2FnZS5qc29uJywgb3B0aW9ucylcbiAgICB9XG4gICAgcmV0dXJuIGJyaWVmLmxvYWQocGF0aG5hbWUsIG9wdGlvbnMpXG4gIH0sXG4gIGZyb21NYW5pZmVzdDogZnVuY3Rpb24oYnJpZWZjYXNlTWFuaWZlc3RQYXRoLCBvcHRpb25zKXtcbiAgICBsZXQgdXNlc1BsdWdpbnMgPSBbXVxuICAgIGxldCBwYXJzZWQgPSB7fVxuICAgIFxuICAgIGlmKGZzLmV4aXN0c1N5bmMoYnJpZWZjYXNlTWFuaWZlc3RQYXRoKSl7XG4gICAgICBwYXJzZWQgPSBKU09OLnBhcnNlKGZzLnJlYWRGaWxlU3luYyhicmllZmNhc2VNYW5pZmVzdFBhdGgpLnRvU3RyaW5nKCkpXG4gICAgICBpZihwYXJzZWQuYnJpZWYgJiYgcGFyc2VkLmJyaWVmLnBsdWdpbnMpe1xuICAgICAgICB1c2VzUGx1Z2lucyA9IHVzZXNQbHVnaW5zLmNvbmNhdChwYXJzZWQuYnJpZWYucGx1Z2lucykgIFxuICAgICAgfVxuICAgIH1cblxuICAgIHVzZXNQbHVnaW5zLmZvckVhY2gocGx1Z2luTmFtZSA9PiB7XG4gICAgICBicmllZiA9IGJyaWVmLnVzZShyZXF1aXJlKCdicmllZi1wbHVnaW5zLScgKyBwbHVnaW5OYW1lKSlcbiAgICB9KVxuXG4gICAgcmV0dXJuIGJyaWVmLmxvYWQocGF0aC5kaXJuYW1lKGJyaWVmY2FzZU1hbmlmZXN0UGF0aCksIG9wdGlvbnMpXG4gIH0sXG4gIHBsdWdpbk5hbWVzOiBmdW5jdGlvbigpe1xuICAgIHJldHVybiBPYmplY3Qua2V5cyhwbHVnaW5OYW1lcylcbiAgfSxcbiAgbWFya2Rvd246IG1hcmtkb3duLFxuICB1dGlsOiByZXF1aXJlKCcuL3V0aWwnKSxcbiAgbWl4aW46IGZ1bmN0aW9uKGV4dGVuc2lvbiwgb3B0aW9ucz17fSl7XG4gICAgaWYodHlwZW9mKG9wdGlvbnMpPT09J3N0cmluZycpe1xuICAgICAgb3B0aW9ucyA9IHt0YXJnZXQ6IG9wdGlvbnN9XG4gICAgfVxuXG4gICAgbGV0IHt0YXJnZXR9ID0gb3B0aW9uc1xuICAgIFxuICAgIGlmKHRhcmdldCA9PT0gJ21vZGVsJyl7IG1peGluKE1vZGVsLCBleHRlbnNpb24pIH1cbiAgICBpZih0YXJnZXQgPT09ICdicmllZmNhc2UnKXsgbWl4aW4oQnJpZWZjYXNlLCBleHRlbnNpb24pIH1cbiAgICBpZih0YXJnZXQgPT09ICdkb2N1bWVudCcpeyBtaXhpbihEb2N1bWVudCwgZXh0ZW5zaW9uKSB9XG4gICAgaWYodGFyZ2V0ID09PSAnYXNzZXQnKXsgbWl4aW4oQXNzZXQsIGV4dGVuc2lvbikgfVxuICAgIGlmKHRhcmdldCA9PT0gJ2RhdGEnKXsgbWl4aW4oRGF0YVNvdXJjZSwgZXh0ZW5zaW9uKSB9XG4gIH0sXG4gIHVzZTogZnVuY3Rpb24ocGx1Z2luLCBvcHRpb25zKXtcbiAgICB2YXIgYnJpZWYgPSB0aGlzXG4gICAgdmFyIG1vZGlmaWVyID0gcGx1Z2luKGJyaWVmLCBvcHRpb25zKVxuICAgIG1vZGlmaWVyLnZlcnNpb24gPSBwbHVnaW4udmVyc2lvblxuICAgIG1vZGlmaWVyLnBsdWdpbl9uYW1lID0gcGx1Z2luLnBsdWdpbl9uYW1lXG4gICAgXG4gICAgaWYoIXBsdWdpbk5hbWVzW3BsdWdpbi5wbHVnaW5fbmFtZV0pe1xuICAgICAgcGx1Z2lucy5wdXNoKG1vZGlmaWVyKVxuICAgIH1cblxuICAgIHBsdWdpbk5hbWVzW3BsdWdpbi5wbHVnaW5fbmFtZV0gPSB0cnVlXG5cbiAgICByZXR1cm4gYnJpZWZcbiAgfVxufVxuXG5pZighT2JqZWN0LnZhbHVlcyl7XG4gIE9iamVjdC52YWx1ZXMgPSBmdW5jdGlvbihvYmope1xuICAgIHJldHVybiBPYmplY3Qua2V5cyhvYmopLm1hcChmdW5jdGlvbihrZXkpeyByZXR1cm4gb2JqW2tleV0gfSlcbiAgfVxufVxuXG5leHBvcnQgZGVmYXVsdCBicmllZlxuIl19