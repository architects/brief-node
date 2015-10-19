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

var plugins = [];
var _pluginNames = {};

var pkg = _path2['default'].join(__dirname, '../package.json');
var manifest = JSON.parse(_fs2['default'].readFileSync(pkg));

var brief = {
  VERSION: manifest.version,
  plugins: plugins,
  pluginNames: function pluginNames() {
    return Object.keys(_pluginNames);
  },
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
//# sourceMappingURL=data:application/json;base64,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QTtHQUM5RCxDQUFBO0NBQ0Y7O3FCQUVjLEtBQUsiLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgcGF0aCBmcm9tICdwYXRoJ1xuaW1wb3J0IGZzIGZyb20gJ2ZzJ1xuaW1wb3J0IEJyaWVmY2FzZSBmcm9tIFwiLi9icmllZmNhc2VcIlxuaW1wb3J0IE1vZGVsIGZyb20gXCIuL21vZGVsXCJcbmltcG9ydCBEb2N1bWVudCBmcm9tIFwiLi9kb2N1bWVudFwiXG5pbXBvcnQgTW9kZWxEZWZpbml0aW9uIGZyb20gXCIuL21vZGVsX2RlZmluaXRpb25cIlxuaW1wb3J0IHttb2RlbCwgcmVnaXN0cnl9IGZyb20gJy4vbW9kZWxfcmVnaXN0cnknXG5pbXBvcnQgR2VuZXJhdG9yIGZyb20gJy4vZ2VuZXJhdG9yJ1xuXG5jb25zdCBwbHVnaW5zID0gW11cbmNvbnN0IHBsdWdpbk5hbWVzID0ge31cblxuY29uc3QgcGtnID0gcGF0aC5qb2luKF9fZGlybmFtZSwgJy4uL3BhY2thZ2UuanNvbicpXG5jb25zdCBtYW5pZmVzdCA9IEpTT04ucGFyc2UoZnMucmVhZEZpbGVTeW5jKHBrZykpXG5cbmxldCBicmllZiA9IHtcbiAgVkVSU0lPTjogbWFuaWZlc3QudmVyc2lvbixcbiAgcGx1Z2luczogcGx1Z2lucyxcbiAgcGx1Z2luTmFtZXM6IGZ1bmN0aW9uKCl7XG4gICAgcmV0dXJuIE9iamVjdC5rZXlzKHBsdWdpbk5hbWVzKVxuICB9LFxuICBCcmllZmNhc2U6IEJyaWVmY2FzZSxcbiAgTW9kZWw6IE1vZGVsLFxuICBNb2RlbERlZmluaXRpb246IE1vZGVsRGVmaW5pdGlvbixcbiAgcmVnaXN0cnk6IHJlZ2lzdHJ5LFxuICBtb2RlbDogbW9kZWwsXG4gIGluc3RhbmNlczogZnVuY3Rpb24oKXtcbiAgICByZXR1cm4gQnJpZWZjYXNlLmluc3RhbmNlcygpXG4gIH0sXG4gIGZpbmRCcmllZmNhc2VCeVBhdGg6IGZ1bmN0aW9uKHBhdGgpe1xuICAgIHJldHVybiBCcmllZmNhc2UuZmluZEZvclBhdGgocGF0aClcbiAgfSxcbiAgYXRQYXRoOiBmdW5jdGlvbihyb290LCBvcHRpb25zPXt9KXtcbiAgICByZXR1cm4gQnJpZWZjYXNlLmxvYWQocm9vdCwgb3B0aW9ucylcbiAgfSxcbiAgbG9hZDogZnVuY3Rpb24gKHJvb3QsIG9wdGlvbnM9e30pIHtcbiAgICByZXR1cm4gQnJpZWZjYXNlLmxvYWQocm9vdCwgb3B0aW9ucylcbiAgfSxcbiAgZXhhbXBsZTogZnVuY3Rpb24ob3B0aW9ucz17fSl7XG4gICAgcmV0dXJuIHJlcXVpcmUoXCIuLi90ZXN0L2V4YW1wbGVcIikoKVxuICB9LFxuICBnZW5lcmF0ZTogZnVuY3Rpb24ocm9vdCwgb3B0aW9ucz17fSl7XG4gICAgcmV0dXJuIG5ldyBHZW5lcmF0b3Ioe1xuICAgICAgYnJpZWYsXG4gICAgICByb290XG4gICAgfSkucnVuKClcbiAgfSxcbiAgdXNlOiBmdW5jdGlvbihwbHVnaW4sIG9wdGlvbnMpe1xuICAgIHZhciBtb2RpZmllciA9IHBsdWdpbih0aGlzLCBvcHRpb25zKVxuICAgIG1vZGlmaWVyLnZlcnNpb24gPSBwbHVnaW4udmVyc2lvblxuICAgIG1vZGlmaWVyLnBsdWdpbl9uYW1lID0gcGx1Z2luLnBsdWdpbl9uYW1lXG4gICAgXG4gICAgaWYoIXBsdWdpbk5hbWVzW3BsdWdpbi5wbHVnaW5fbmFtZV0pe1xuICAgICAgcGx1Z2lucy5wdXNoKG1vZGlmaWVyKVxuICAgIH1cblxuICAgIHBsdWdpbk5hbWVzW3BsdWdpbi5wbHVnaW5fbmFtZV0gPSB0cnVlXG5cbiAgICByZXR1cm4gdGhpc1xuICB9XG59XG5cbmlmKCFPYmplY3QudmFsdWVzKXtcbiAgT2JqZWN0LnZhbHVlcyA9IGZ1bmN0aW9uKG9iail7XG4gICAgcmV0dXJuIE9iamVjdC5rZXlzKG9iaikubWFwKGZ1bmN0aW9uKGtleSl7IHJldHVybiBvYmpba2V5XSB9KVxuICB9XG59XG5cbmV4cG9ydCBkZWZhdWx0IGJyaWVmXG4iXX0=