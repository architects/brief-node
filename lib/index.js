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
//# sourceMappingURL=data:application/json;base64,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dGgnXG5pbXBvcnQgZnMgZnJvbSAnZnMnXG5pbXBvcnQgQnJpZWZjYXNlIGZyb20gXCIuL2JyaWVmY2FzZVwiXG5pbXBvcnQgTW9kZWwgZnJvbSBcIi4vbW9kZWxcIlxuaW1wb3J0IERvY3VtZW50IGZyb20gXCIuL2RvY3VtZW50XCJcbmltcG9ydCBNb2RlbERlZmluaXRpb24gZnJvbSBcIi4vbW9kZWxfZGVmaW5pdGlvblwiXG5pbXBvcnQge21vZGVsLCByZWdpc3RyeX0gZnJvbSAnLi9tb2RlbF9yZWdpc3RyeSdcbmltcG9ydCBHZW5lcmF0b3IgZnJvbSAnLi9nZW5lcmF0b3InXG5cbmNvbnN0IHBsdWdpbnMgPSBbXVxuY29uc3QgcGx1Z2luTmFtZXMgPSB7fVxuXG5jb25zdCBwa2cgPSBwYXRoLmpvaW4oX19kaXJuYW1lLCAnLi4vcGFja2FnZS5qc29uJylcbmNvbnN0IG1hbmlmZXN0ID0gSlNPTi5wYXJzZShmcy5yZWFkRmlsZVN5bmMocGtnKSlcblxubGV0IGJyaWVmID0ge1xuICBWRVJTSU9OOiBtYW5pZmVzdC52ZXJzaW9uLFxuICBwbHVnaW5zOiBwbHVnaW5zLFxuICBwbHVnaW5OYW1lczogZnVuY3Rpb24oKXtcbiAgICByZXR1cm4gT2JqZWN0LmtleXMocGx1Z2luTmFtZXMpXG4gIH0sXG4gIEJyaWVmY2FzZTogQnJpZWZjYXNlLFxuICBNb2RlbDogTW9kZWwsXG4gIE1vZGVsRGVmaW5pdGlvbjogTW9kZWxEZWZpbml0aW9uLFxuICByZWdpc3RyeTogcmVnaXN0cnksXG4gIG1vZGVsOiBtb2RlbCxcbiAgaW5zdGFuY2VzOiBmdW5jdGlvbigpe1xuICAgIHJldHVybiBCcmllZmNhc2UuaW5zdGFuY2VzKClcbiAgfSxcbiAgZmluZEJyaWVmY2FzZUJ5UGF0aDogZnVuY3Rpb24ocGF0aCl7XG4gICAgcmV0dXJuIEJyaWVmY2FzZS5maW5kRm9yUGF0aChwYXRoKVxuICB9LFxuICBhdFBhdGg6IGZ1bmN0aW9uKHJvb3QsIG9wdGlvbnM9e30pe1xuICAgIHJldHVybiBCcmllZmNhc2UubG9hZChyb290LCBvcHRpb25zKVxuICB9LFxuICBsb2FkOiBmdW5jdGlvbiAocm9vdCwgb3B0aW9ucz17fSkge1xuICAgIHJldHVybiBCcmllZmNhc2UubG9hZChyb290LCBvcHRpb25zKVxuICB9LFxuICBleGFtcGxlOiBmdW5jdGlvbihvcHRpb25zPXt9KXtcbiAgICByZXR1cm4gcmVxdWlyZShcIi4uL3Rlc3QvZXhhbXBsZVwiKSgpXG4gIH0sXG4gIGdlbmVyYXRlOiBmdW5jdGlvbihyb290LCBvcHRpb25zPXt9KXtcblxuICB9LFxuICB1c2U6IGZ1bmN0aW9uKHBsdWdpbiwgb3B0aW9ucyl7XG4gICAgdmFyIG1vZGlmaWVyID0gcGx1Z2luKHRoaXMsIG9wdGlvbnMpXG4gICAgbW9kaWZpZXIudmVyc2lvbiA9IHBsdWdpbi52ZXJzaW9uXG4gICAgbW9kaWZpZXIucGx1Z2luX25hbWUgPSBwbHVnaW4ucGx1Z2luX25hbWVcbiAgICBcbiAgICBpZighcGx1Z2luTmFtZXNbcGx1Z2luLnBsdWdpbl9uYW1lXSl7XG4gICAgICBwbHVnaW5zLnB1c2gobW9kaWZpZXIpXG4gICAgfVxuXG4gICAgcGx1Z2luTmFtZXNbcGx1Z2luLnBsdWdpbl9uYW1lXSA9IHRydWVcblxuICAgIHJldHVybiB0aGlzXG4gIH1cbn1cblxuaWYoIU9iamVjdC52YWx1ZXMpe1xuICBPYmplY3QudmFsdWVzID0gZnVuY3Rpb24ob2JqKXtcbiAgICByZXR1cm4gT2JqZWN0LmtleXMob2JqKS5tYXAoZnVuY3Rpb24oa2V5KXsgcmV0dXJuIG9ialtrZXldIH0pXG4gIH1cbn1cblxuZXhwb3J0IGRlZmF1bHQgYnJpZWZcbiJdfQ==