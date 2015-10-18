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

var plugins = [];
var pluginNames = {};

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
  load: function load(root) {
    var options = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

    return _briefcase2['default'].load(root, options);
  },
  example: function example() {
    var options = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

    return require("../test/example")();
  },
  use: function use(plugin, options) {
    var modifier = plugin(this, options);
    modifier.version = plugin.version;
    modifier.plugin_name = plugin.plugin_name;

    if (!pluginNames[plugin.plugin_name]) {
      plugins.push(modifier);
    }

    pluginNames[plugin.plugin_name] = true;

    return this;
  }
};

exports['default'] = brief;
module.exports = exports['default'];
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3NyYy9pbmRleC5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7OztvQkFBaUIsTUFBTTs7OztrQkFDUixJQUFJOzs7O3lCQUNHLGFBQWE7Ozs7cUJBQ2pCLFNBQVM7Ozs7d0JBQ04sWUFBWTs7OztnQ0FDTCxvQkFBb0I7Ozs7OEJBQ2xCLGtCQUFrQjs7QUFFaEQsSUFBTSxPQUFPLEdBQUcsRUFBRSxDQUFBO0FBQ2xCLElBQU0sV0FBVyxHQUFHLEVBQUUsQ0FBQTs7QUFFdEIsSUFBTSxHQUFHLEdBQUcsa0JBQUssSUFBSSxDQUFDLFNBQVMsRUFBRSxpQkFBaUIsQ0FBQyxDQUFBO0FBQ25ELElBQU0sUUFBUSxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsZ0JBQUcsWUFBWSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUE7O0FBRWpELElBQUksS0FBSyxHQUFHO0FBQ1YsU0FBTyxFQUFFLFFBQVEsQ0FBQyxPQUFPO0FBQ3pCLFNBQU8sRUFBRSxPQUFPO0FBQ2hCLFdBQVMsd0JBQVc7QUFDcEIsT0FBSyxvQkFBTztBQUNaLGlCQUFlLCtCQUFpQjtBQUNoQyxVQUFRLDBCQUFVO0FBQ2xCLE9BQUssdUJBQU87QUFDWixXQUFTLEVBQUUscUJBQVU7QUFDbkIsV0FBTyx1QkFBVSxTQUFTLEVBQUUsQ0FBQTtHQUM3QjtBQUNELHFCQUFtQixFQUFFLDZCQUFTLElBQUksRUFBQztBQUNqQyxXQUFPLHVCQUFVLFdBQVcsQ0FBQyxJQUFJLENBQUMsQ0FBQTtHQUNuQztBQUNELE1BQUksRUFBRSxjQUFVLElBQUksRUFBYztRQUFaLE9BQU8seURBQUMsRUFBRTs7QUFDOUIsV0FBTyx1QkFBVSxJQUFJLENBQUMsSUFBSSxFQUFFLE9BQU8sQ0FBQyxDQUFBO0dBQ3JDO0FBQ0QsU0FBTyxFQUFFLG1CQUFvQjtRQUFYLE9BQU8seURBQUMsRUFBRTs7QUFDMUIsV0FBTyxPQUFPLENBQUMsaUJBQWlCLENBQUMsRUFBRSxDQUFBO0dBQ3BDO0FBQ0QsS0FBRyxFQUFFLGFBQVMsTUFBTSxFQUFFLE9BQU8sRUFBQztBQUM1QixRQUFJLFFBQVEsR0FBRyxNQUFNLENBQUMsSUFBSSxFQUFFLE9BQU8sQ0FBQyxDQUFBO0FBQ3BDLFlBQVEsQ0FBQyxPQUFPLEdBQUcsTUFBTSxDQUFDLE9BQU8sQ0FBQTtBQUNqQyxZQUFRLENBQUMsV0FBVyxHQUFHLE1BQU0sQ0FBQyxXQUFXLENBQUE7O0FBRXpDLFFBQUcsQ0FBQyxXQUFXLENBQUMsTUFBTSxDQUFDLFdBQVcsQ0FBQyxFQUFDO0FBQ2xDLGFBQU8sQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLENBQUE7S0FDdkI7O0FBRUQsZUFBVyxDQUFDLE1BQU0sQ0FBQyxXQUFXLENBQUMsR0FBRyxJQUFJLENBQUE7O0FBRXRDLFdBQU8sSUFBSSxDQUFBO0dBQ1o7Q0FDRixDQUFBOztxQkFFYyxLQUFLIiwiZmlsZSI6ImluZGV4LmpzIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHBhdGggZnJvbSAncGF0aCdcbmltcG9ydCBmcyBmcm9tICdmcydcbmltcG9ydCBCcmllZmNhc2UgZnJvbSBcIi4vYnJpZWZjYXNlXCJcbmltcG9ydCBNb2RlbCBmcm9tIFwiLi9tb2RlbFwiXG5pbXBvcnQgRG9jdW1lbnQgZnJvbSBcIi4vZG9jdW1lbnRcIlxuaW1wb3J0IE1vZGVsRGVmaW5pdGlvbiBmcm9tIFwiLi9tb2RlbF9kZWZpbml0aW9uXCJcbmltcG9ydCB7bW9kZWwsIHJlZ2lzdHJ5fSBmcm9tICcuL21vZGVsX3JlZ2lzdHJ5J1xuXG5jb25zdCBwbHVnaW5zID0gW11cbmNvbnN0IHBsdWdpbk5hbWVzID0ge31cblxuY29uc3QgcGtnID0gcGF0aC5qb2luKF9fZGlybmFtZSwgJy4uL3BhY2thZ2UuanNvbicpXG5jb25zdCBtYW5pZmVzdCA9IEpTT04ucGFyc2UoZnMucmVhZEZpbGVTeW5jKHBrZykpXG5cbmxldCBicmllZiA9IHtcbiAgVkVSU0lPTjogbWFuaWZlc3QudmVyc2lvbixcbiAgcGx1Z2luczogcGx1Z2lucyxcbiAgQnJpZWZjYXNlOiBCcmllZmNhc2UsXG4gIE1vZGVsOiBNb2RlbCxcbiAgTW9kZWxEZWZpbml0aW9uOiBNb2RlbERlZmluaXRpb24sXG4gIHJlZ2lzdHJ5OiByZWdpc3RyeSxcbiAgbW9kZWw6IG1vZGVsLFxuICBpbnN0YW5jZXM6IGZ1bmN0aW9uKCl7XG4gICAgcmV0dXJuIEJyaWVmY2FzZS5pbnN0YW5jZXMoKVxuICB9LFxuICBmaW5kQnJpZWZjYXNlQnlQYXRoOiBmdW5jdGlvbihwYXRoKXtcbiAgICByZXR1cm4gQnJpZWZjYXNlLmZpbmRGb3JQYXRoKHBhdGgpXG4gIH0sXG4gIGxvYWQ6IGZ1bmN0aW9uIChyb290LCBvcHRpb25zPXt9KSB7XG4gICAgcmV0dXJuIEJyaWVmY2FzZS5sb2FkKHJvb3QsIG9wdGlvbnMpXG4gIH0sXG4gIGV4YW1wbGU6IGZ1bmN0aW9uKG9wdGlvbnM9e30pe1xuICAgIHJldHVybiByZXF1aXJlKFwiLi4vdGVzdC9leGFtcGxlXCIpKClcbiAgfSxcbiAgdXNlOiBmdW5jdGlvbihwbHVnaW4sIG9wdGlvbnMpe1xuICAgIHZhciBtb2RpZmllciA9IHBsdWdpbih0aGlzLCBvcHRpb25zKVxuICAgIG1vZGlmaWVyLnZlcnNpb24gPSBwbHVnaW4udmVyc2lvblxuICAgIG1vZGlmaWVyLnBsdWdpbl9uYW1lID0gcGx1Z2luLnBsdWdpbl9uYW1lXG4gICAgXG4gICAgaWYoIXBsdWdpbk5hbWVzW3BsdWdpbi5wbHVnaW5fbmFtZV0pe1xuICAgICAgcGx1Z2lucy5wdXNoKG1vZGlmaWVyKVxuICAgIH1cblxuICAgIHBsdWdpbk5hbWVzW3BsdWdpbi5wbHVnaW5fbmFtZV0gPSB0cnVlXG5cbiAgICByZXR1cm4gdGhpc1xuICB9XG59XG5cbmV4cG9ydCBkZWZhdWx0IGJyaWVmXG4iXX0=