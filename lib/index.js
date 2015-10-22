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
//# sourceMappingURL=data:application/json;base64,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InNvdXJjZXNDb250ZW50IjpbImltcG9ydCBwYXRoIGZyb20gJ3BhdGgnXG5pbXBvcnQgZnMgZnJvbSAnZnMnXG5pbXBvcnQgQnJpZWZjYXNlIGZyb20gXCIuL2JyaWVmY2FzZVwiXG5pbXBvcnQgTW9kZWwgZnJvbSBcIi4vbW9kZWxcIlxuaW1wb3J0IERvY3VtZW50IGZyb20gXCIuL2RvY3VtZW50XCJcbmltcG9ydCBNb2RlbERlZmluaXRpb24gZnJvbSBcIi4vbW9kZWxfZGVmaW5pdGlvblwiXG5pbXBvcnQge21vZGVsLCByZWdpc3RyeX0gZnJvbSAnLi9tb2RlbF9yZWdpc3RyeSdcbmltcG9ydCBHZW5lcmF0b3IgZnJvbSAnLi9nZW5lcmF0b3InXG5pbXBvcnQge21hcmtkb3dufSBmcm9tICcuL3JlbmRlcidcblxuY29uc3QgcGx1Z2lucyA9IFtdXG5jb25zdCBwbHVnaW5OYW1lcyA9IHt9XG5cbmNvbnN0IHBrZyA9IHBhdGguam9pbihfX2Rpcm5hbWUsICcuLi9wYWNrYWdlLmpzb24nKVxuY29uc3QgbWFuaWZlc3QgPSBKU09OLnBhcnNlKGZzLnJlYWRGaWxlU3luYyhwa2cpKVxuXG5sZXQgYnJpZWYgPSB7XG4gIFZFUlNJT046IG1hbmlmZXN0LnZlcnNpb24sXG4gIHBsdWdpbnM6IHBsdWdpbnMsXG4gIEJyaWVmY2FzZTogQnJpZWZjYXNlLFxuICBNb2RlbDogTW9kZWwsXG4gIE1vZGVsRGVmaW5pdGlvbjogTW9kZWxEZWZpbml0aW9uLFxuICByZWdpc3RyeTogcmVnaXN0cnksXG4gIG1vZGVsOiBtb2RlbCxcbiAgaW5zdGFuY2VzOiBmdW5jdGlvbigpe1xuICAgIHJldHVybiBCcmllZmNhc2UuaW5zdGFuY2VzKClcbiAgfSxcbiAgZmluZEJyaWVmY2FzZUJ5UGF0aDogZnVuY3Rpb24ocGF0aCl7XG4gICAgcmV0dXJuIEJyaWVmY2FzZS5maW5kRm9yUGF0aChwYXRoKVxuICB9LFxuICBhdFBhdGg6IGZ1bmN0aW9uKHJvb3QsIG9wdGlvbnM9e30pe1xuICAgIHJldHVybiBCcmllZmNhc2UubG9hZChyb290LCBvcHRpb25zKVxuICB9LFxuICBsb2FkOiBmdW5jdGlvbiAocm9vdCwgb3B0aW9ucz17fSkge1xuICAgIHJldHVybiBCcmllZmNhc2UubG9hZChyb290LCBvcHRpb25zKVxuICB9LFxuICBleGFtcGxlOiBmdW5jdGlvbihvcHRpb25zPXt9KXtcbiAgICByZXR1cm4gcmVxdWlyZShcIi4uL3Rlc3QvZXhhbXBsZVwiKSgpXG4gIH0sXG4gIGdlbmVyYXRlOiBmdW5jdGlvbihyb290LCBvcHRpb25zPXt9KXtcbiAgICByZXR1cm4gbmV3IEdlbmVyYXRvcih7XG4gICAgICBicmllZixcbiAgICAgIHJvb3RcbiAgICB9KS5ydW4oKVxuICB9LFxuICBmcm9tUGF0aDogZnVuY3Rpb24ocGF0aG5hbWUsIG9wdGlvbnMpe1xuICAgIGlmKGZzLmV4aXN0c1N5bmMocGF0aG5hbWUgKyAnLi9wYWNrYWdlLmpzb24nKSl7XG4gICAgICByZXR1cm4gYnJpZWYuZnJvbU1hbmlmZXN0KHBhdGhuYW1lICsgJy4vcGFja2FnZS5qc29uJywgb3B0aW9ucylcbiAgICB9XG4gICAgcmV0dXJuIGJyaWVmLmxvYWQocGF0aG5hbWUsIG9wdGlvbnMpXG4gIH0sXG4gIGZyb21NYW5pZmVzdDogZnVuY3Rpb24oYnJpZWZjYXNlTWFuaWZlc3RQYXRoLCBvcHRpb25zKXtcbiAgICBsZXQgdXNlc1BsdWdpbnMgPSBbXVxuICAgIGxldCBwYXJzZWQgPSB7fVxuICAgIFxuICAgIGlmKGZzLmV4aXN0c1N5bmMoYnJpZWZjYXNlTWFuaWZlc3RQYXRoKSl7XG4gICAgICBwYXJzZWQgPSBKU09OLnBhcnNlKGZzLnJlYWRGaWxlU3luYyhicmllZmNhc2VNYW5pZmVzdFBhdGgpLnRvU3RyaW5nKCkpXG4gICAgICBpZihwYXJzZWQuYnJpZWYgJiYgcGFyc2VkLmJyaWVmLnBsdWdpbnMpe1xuICAgICAgICB1c2VzUGx1Z2lucyA9IHVzZXNQbHVnaW5zLmNvbmNhdChwYXJzZWQuYnJpZWYucGx1Z2lucykgIFxuICAgICAgfVxuICAgIH1cblxuICAgIHVzZXNQbHVnaW5zLmZvckVhY2gocGx1Z2luTmFtZSA9PiB7XG4gICAgICBicmllZi51c2UocmVxdWlyZSgnYnJpZWYtcGx1Z2lucy0nICsgcGx1Z2luTmFtZSkpXG4gICAgfSlcblxuICAgIHJldHVybiBicmllZi5sb2FkKHBhdGguZGlybmFtZShicmllZmNhc2VNYW5pZmVzdFBhdGgpLCBvcHRpb25zKVxuICB9LFxuICBwbHVnaW5OYW1lczogZnVuY3Rpb24oKXtcbiAgICByZXR1cm4gT2JqZWN0LmtleXMocGx1Z2luTmFtZXMpXG4gIH0sXG4gIG1hcmtkb3duOiBtYXJrZG93bixcbiAgdXNlOiBmdW5jdGlvbihwbHVnaW4sIG9wdGlvbnMpe1xuICAgIHZhciBtb2RpZmllciA9IHBsdWdpbih0aGlzLCBvcHRpb25zKVxuICAgIG1vZGlmaWVyLnZlcnNpb24gPSBwbHVnaW4udmVyc2lvblxuICAgIG1vZGlmaWVyLnBsdWdpbl9uYW1lID0gcGx1Z2luLnBsdWdpbl9uYW1lXG4gICAgXG4gICAgaWYoIXBsdWdpbk5hbWVzW3BsdWdpbi5wbHVnaW5fbmFtZV0pe1xuICAgICAgcGx1Z2lucy5wdXNoKG1vZGlmaWVyKVxuICAgIH1cblxuICAgIHBsdWdpbk5hbWVzW3BsdWdpbi5wbHVnaW5fbmFtZV0gPSB0cnVlXG5cbiAgICByZXR1cm4gdGhpc1xuICB9XG59XG5cbmlmKCFPYmplY3QudmFsdWVzKXtcbiAgT2JqZWN0LnZhbHVlcyA9IGZ1bmN0aW9uKG9iail7XG4gICAgcmV0dXJuIE9iamVjdC5rZXlzKG9iaikubWFwKGZ1bmN0aW9uKGtleSl7IHJldHVybiBvYmpba2V5XSB9KVxuICB9XG59XG5cbmV4cG9ydCBkZWZhdWx0IGJyaWVmXG4iXX0=