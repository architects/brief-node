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
//# sourceMappingURL=data:application/json;base64,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QzlELENBQUE7Q0FDRjs7cUJBRWMsS0FBSyIsImZpbGUiOiJpbmRleC5qcyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCBwYXRoIGZyb20gJ3BhdGgnXG5pbXBvcnQgZnMgZnJvbSAnZnMnXG5pbXBvcnQgQnJpZWZjYXNlIGZyb20gXCIuL2JyaWVmY2FzZVwiXG5pbXBvcnQgQXNzZXQgZnJvbSAnLi9hc3NldCdcbmltcG9ydCBEYXRhU291cmNlIGZyb20gJy4vZGF0YV9zb3VyY2UnXG5pbXBvcnQgTW9kZWwgZnJvbSBcIi4vbW9kZWxcIlxuaW1wb3J0IERvY3VtZW50IGZyb20gXCIuL2RvY3VtZW50XCJcbmltcG9ydCBNb2RlbERlZmluaXRpb24gZnJvbSBcIi4vbW9kZWxfZGVmaW5pdGlvblwiXG5pbXBvcnQge21vZGVsLCByZWdpc3RyeSwgZ2V0TW9kZWxQcm90b3R5cGV9IGZyb20gJy4vbW9kZWxfcmVnaXN0cnknXG5pbXBvcnQgR2VuZXJhdG9yIGZyb20gJy4vZ2VuZXJhdG9yJ1xuaW1wb3J0IHttYXJrZG93bn0gZnJvbSAnLi9waXBlbGluZXMnXG5pbXBvcnQge21peGlufSBmcm9tICcuL3V0aWwnXG5cbmNvbnN0IHBsdWdpbnMgPSBbXVxuY29uc3QgcGx1Z2luTmFtZXMgPSB7fVxuXG5jb25zdCBwa2cgPSBwYXRoLmpvaW4oX19kaXJuYW1lLCAnLi4vcGFja2FnZS5qc29uJylcbmNvbnN0IG1hbmlmZXN0ID0gSlNPTi5wYXJzZShmcy5yZWFkRmlsZVN5bmMocGtnKSlcblxubGV0IGJyaWVmID0ge1xuICBWRVJTSU9OOiBtYW5pZmVzdC52ZXJzaW9uLFxuICBwbHVnaW5zOiBwbHVnaW5zLFxuXG4gIEJyaWVmY2FzZTogQnJpZWZjYXNlLFxuXG4gIE1vZGVsOiBNb2RlbCxcbiAgIFxuICBNb2RlbERlZmluaXRpb246IE1vZGVsRGVmaW5pdGlvbixcblxuICAvLyBUT0RPXG4gIC8vIFRoaW5rIG9mIGEgYmV0dGVyIEFQSSBmb3IgdGhpcy5cbiAgcmVnaXN0cnk6IHJlZ2lzdHJ5LFxuICBtb2RlbDogbW9kZWwsXG4gIFxuICBnZXRNb2RlbFByb3RvdHlwZTogZnVuY3Rpb24obmFtZU9yVHlwZUFsaWFzLCBndWVzcyA9IHRydWUpe1xuICAgIHJldHVybiBnZXRNb2RlbFByb3RvdHlwZShuYW1lT3JUeXBlQWxpYXMsIGd1ZXNzKVxuICB9LFxuXG4gIHJlc29sdmVMaW5rOiBmdW5jdGlvbihwYXRoQWxpYXMpe1xuICAgIGlmKCFicmllZi5saW5rUmVzb2x2ZXIpe1xuICAgICAgcmV0dXJuIHBhdGhBbGlhc1xuICAgIH1cbiAgICByZXR1cm4gYnJpZWYubGlua1Jlc29sdmVyKHBhdGhBbGlhcylcbiAgfSxcblxuICByZXNvbHZlTGlua3NXaXRoOiBmdW5jdGlvbihmbil7XG4gICAgYnJpZWYubGlua1Jlc29sdmVyID0gZm5cbiAgfSxcblxuICBpbnN0YW5jZXM6IGZ1bmN0aW9uKCl7XG4gICAgcmV0dXJuIEJyaWVmY2FzZS5pbnN0YW5jZXMoKVxuICB9LFxuICBmaW5kQnJpZWZjYXNlQnlQYXRoOiBmdW5jdGlvbihwYXRoKXtcbiAgICByZXR1cm4gQnJpZWZjYXNlLmZpbmRGb3JQYXRoKHBhdGgpXG4gIH0sXG4gIGF0UGF0aDogZnVuY3Rpb24ocm9vdCwgb3B0aW9ucz17fSl7XG4gICAgcmV0dXJuIEJyaWVmY2FzZS5sb2FkKHJvb3QsIG9wdGlvbnMpXG4gIH0sXG4gIGxvYWQ6IGZ1bmN0aW9uIChyb290LCBvcHRpb25zPXt9KSB7XG4gICAgcmV0dXJuIEJyaWVmY2FzZS5sb2FkKHJvb3QsIG9wdGlvbnMpXG4gIH0sXG4gIGV4YW1wbGU6IGZ1bmN0aW9uKG9wdGlvbnM9e30pe1xuICAgIHJldHVybiByZXF1aXJlKFwiLi4vdGVzdC9leGFtcGxlXCIpKClcbiAgfSxcbiAgZ2VuZXJhdGU6IGZ1bmN0aW9uKHJvb3QsIG9wdGlvbnM9e30pe1xuICAgIHJldHVybiBuZXcgR2VuZXJhdG9yKHtcbiAgICAgIGJyaWVmLFxuICAgICAgcm9vdFxuICAgIH0pLnJ1bigpXG4gIH0sXG4gIGZyb21QYXRoOiBmdW5jdGlvbihwYXRobmFtZSwgb3B0aW9ucyl7XG4gICAgaWYoZnMuZXhpc3RzU3luYyhwYXRobmFtZSArICcvcGFja2FnZS5qc29uJykpe1xuICAgICAgcmV0dXJuIGJyaWVmLmZyb21NYW5pZmVzdChwYXRobmFtZSArICcvcGFja2FnZS5qc29uJywgb3B0aW9ucylcbiAgICB9XG4gICAgcmV0dXJuIGJyaWVmLmxvYWQocGF0aG5hbWUsIG9wdGlvbnMpXG4gIH0sXG4gIGZyb21NYW5pZmVzdDogZnVuY3Rpb24oYnJpZWZjYXNlTWFuaWZlc3RQYXRoLCBvcHRpb25zKXtcbiAgICBsZXQgdXNlc1BsdWdpbnMgPSBbXVxuICAgIGxldCBwYXJzZWQgPSB7fVxuICAgIFxuICAgIGlmKGZzLmV4aXN0c1N5bmMoYnJpZWZjYXNlTWFuaWZlc3RQYXRoKSl7XG4gICAgICBwYXJzZWQgPSBKU09OLnBhcnNlKGZzLnJlYWRGaWxlU3luYyhicmllZmNhc2VNYW5pZmVzdFBhdGgpLnRvU3RyaW5nKCkpXG4gICAgICBpZihwYXJzZWQuYnJpZWYgJiYgcGFyc2VkLmJyaWVmLnBsdWdpbnMpe1xuICAgICAgICB1c2VzUGx1Z2lucyA9IHVzZXNQbHVnaW5zLmNvbmNhdChwYXJzZWQuYnJpZWYucGx1Z2lucykgIFxuICAgICAgfVxuICAgIH1cblxuICAgIHVzZXNQbHVnaW5zLmZvckVhY2gocGx1Z2luTmFtZSA9PiB7XG4gICAgICBicmllZiA9IGJyaWVmLnVzZShyZXF1aXJlKCdicmllZi1wbHVnaW5zLScgKyBwbHVnaW5OYW1lKSlcbiAgICB9KVxuXG4gICAgcmV0dXJuIGJyaWVmLmxvYWQocGF0aC5kaXJuYW1lKGJyaWVmY2FzZU1hbmlmZXN0UGF0aCksIG9wdGlvbnMpXG4gIH0sXG4gIHBsdWdpbk5hbWVzOiBmdW5jdGlvbigpe1xuICAgIHJldHVybiBPYmplY3Qua2V5cyhwbHVnaW5OYW1lcylcbiAgfSxcbiAgbWFya2Rvd246IG1hcmtkb3duLFxuICB1dGlsOiByZXF1aXJlKCcuL3V0aWwnKSxcbiAgbWl4aW46IGZ1bmN0aW9uKGV4dGVuc2lvbiwgb3B0aW9ucz17fSl7XG4gICAgaWYodHlwZW9mKG9wdGlvbnMpPT09J3N0cmluZycpe1xuICAgICAgb3B0aW9ucyA9IHt0YXJnZXQ6IG9wdGlvbnN9XG4gICAgfVxuXG4gICAgbGV0IHt0YXJnZXR9ID0gb3B0aW9uc1xuICAgIFxuICAgIGlmKHRhcmdldCA9PT0gJ21vZGVsJyl7IG1peGluKE1vZGVsLCBleHRlbnNpb24pIH1cbiAgICBpZih0YXJnZXQgPT09ICdicmllZmNhc2UnKXsgbWl4aW4oQnJpZWZjYXNlLCBleHRlbnNpb24pIH1cbiAgICBpZih0YXJnZXQgPT09ICdkb2N1bWVudCcpeyBtaXhpbihEb2N1bWVudCwgZXh0ZW5zaW9uKSB9XG4gICAgaWYodGFyZ2V0ID09PSAnYXNzZXQnKXsgbWl4aW4oQXNzZXQsIGV4dGVuc2lvbikgfVxuICAgIGlmKHRhcmdldCA9PT0gJ2RhdGEnKXsgbWl4aW4oRGF0YVNvdXJjZSwgZXh0ZW5zaW9uKSB9XG4gIH0sXG4gIHVzZTogZnVuY3Rpb24ocGx1Z2luLCBvcHRpb25zKXtcbiAgICB2YXIgYnJpZWYgPSB0aGlzXG4gICAgdmFyIG1vZGlmaWVyID0gcGx1Z2luKGJyaWVmLCBvcHRpb25zKVxuICAgIG1vZGlmaWVyLnZlcnNpb24gPSBwbHVnaW4udmVyc2lvblxuICAgIG1vZGlmaWVyLnBsdWdpbl9uYW1lID0gcGx1Z2luLnBsdWdpbl9uYW1lXG4gICAgXG4gICAgaWYoIXBsdWdpbk5hbWVzW3BsdWdpbi5wbHVnaW5fbmFtZV0pe1xuICAgICAgcGx1Z2lucy5wdXNoKG1vZGlmaWVyKVxuICAgIH1cblxuICAgIHBsdWdpbk5hbWVzW3BsdWdpbi5wbHVnaW5fbmFtZV0gPSB0cnVlXG5cbiAgICByZXR1cm4gYnJpZWZcbiAgfVxufVxuXG5pZighT2JqZWN0LnZhbHVlcyl7XG4gIE9iamVjdC52YWx1ZXMgPSBmdW5jdGlvbihvYmope1xuICAgIHJldHVybiBPYmplY3Qua2V5cyhvYmopLm1hcChmdW5jdGlvbihrZXkpeyByZXR1cm4gb2JqW2tleV0gfSlcbiAgfVxufVxuXG5leHBvcnQgZGVmYXVsdCBicmllZlxuIl19