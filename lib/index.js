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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3NyYy9pbmRleC5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7OztvQkFBaUIsTUFBTTs7OztrQkFDUixJQUFJOzs7O3lCQUNHLGFBQWE7Ozs7cUJBQ2pCLFNBQVM7Ozs7d0JBQ04sWUFBWTs7OztnQ0FDTCxvQkFBb0I7Ozs7OEJBQ2xCLGtCQUFrQjs7QUFFaEQsSUFBTSxPQUFPLEdBQUcsRUFBRSxDQUFBO0FBQ2xCLElBQU0sWUFBVyxHQUFHLEVBQUUsQ0FBQTs7QUFFdEIsSUFBTSxHQUFHLEdBQUcsa0JBQUssSUFBSSxDQUFDLFNBQVMsRUFBRSxpQkFBaUIsQ0FBQyxDQUFBO0FBQ25ELElBQU0sUUFBUSxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsZ0JBQUcsWUFBWSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUE7O0FBRWpELElBQUksS0FBSyxHQUFHO0FBQ1YsU0FBTyxFQUFFLFFBQVEsQ0FBQyxPQUFPO0FBQ3pCLFNBQU8sRUFBRSxPQUFPO0FBQ2hCLGFBQVcsRUFBRSx1QkFBVTtBQUNyQixXQUFPLE1BQU0sQ0FBQyxJQUFJLENBQUMsWUFBVyxDQUFDLENBQUE7R0FDaEM7QUFDRCxXQUFTLHdCQUFXO0FBQ3BCLE9BQUssb0JBQU87QUFDWixpQkFBZSwrQkFBaUI7QUFDaEMsVUFBUSwwQkFBVTtBQUNsQixPQUFLLHVCQUFPO0FBQ1osV0FBUyxFQUFFLHFCQUFVO0FBQ25CLFdBQU8sdUJBQVUsU0FBUyxFQUFFLENBQUE7R0FDN0I7QUFDRCxxQkFBbUIsRUFBRSw2QkFBUyxJQUFJLEVBQUM7QUFDakMsV0FBTyx1QkFBVSxXQUFXLENBQUMsSUFBSSxDQUFDLENBQUE7R0FDbkM7QUFDRCxRQUFNLEVBQUUsZ0JBQVMsSUFBSSxFQUFhO1FBQVgsT0FBTyx5REFBQyxFQUFFOztBQUMvQixXQUFPLHVCQUFVLElBQUksQ0FBQyxJQUFJLEVBQUUsT0FBTyxDQUFDLENBQUE7R0FDckM7QUFDRCxNQUFJLEVBQUUsY0FBVSxJQUFJLEVBQWM7UUFBWixPQUFPLHlEQUFDLEVBQUU7O0FBQzlCLFdBQU8sdUJBQVUsSUFBSSxDQUFDLElBQUksRUFBRSxPQUFPLENBQUMsQ0FBQTtHQUNyQztBQUNELFNBQU8sRUFBRSxtQkFBb0I7UUFBWCxPQUFPLHlEQUFDLEVBQUU7O0FBQzFCLFdBQU8sT0FBTyxDQUFDLGlCQUFpQixDQUFDLEVBQUUsQ0FBQTtHQUNwQztBQUNELEtBQUcsRUFBRSxhQUFTLE1BQU0sRUFBRSxPQUFPLEVBQUM7QUFDNUIsUUFBSSxRQUFRLEdBQUcsTUFBTSxDQUFDLElBQUksRUFBRSxPQUFPLENBQUMsQ0FBQTtBQUNwQyxZQUFRLENBQUMsT0FBTyxHQUFHLE1BQU0sQ0FBQyxPQUFPLENBQUE7QUFDakMsWUFBUSxDQUFDLFdBQVcsR0FBRyxNQUFNLENBQUMsV0FBVyxDQUFBOztBQUV6QyxRQUFHLENBQUMsWUFBVyxDQUFDLE1BQU0sQ0FBQyxXQUFXLENBQUMsRUFBQztBQUNsQyxhQUFPLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxDQUFBO0tBQ3ZCOztBQUVELGdCQUFXLENBQUMsTUFBTSxDQUFDLFdBQVcsQ0FBQyxHQUFHLElBQUksQ0FBQTs7QUFFdEMsV0FBTyxJQUFJLENBQUE7R0FDWjtDQUNGLENBQUE7O0FBRUQsSUFBRyxDQUFDLE1BQU0sQ0FBQyxNQUFNLEVBQUM7QUFDaEIsUUFBTSxDQUFDLE1BQU0sR0FBRyxVQUFTLEdBQUcsRUFBQztBQUMzQixXQUFPLE1BQU0sQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUMsR0FBRyxDQUFDLFVBQVMsR0FBRyxFQUFDO0FBQUUsYUFBTyxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUE7S0FBRSxDQUFDLENBQUE7R0FDOUQsQ0FBQTtDQUNGOztxQkFFYyxLQUFLIiwiZmlsZSI6ImluZGV4LmpzIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHBhdGggZnJvbSAncGF0aCdcbmltcG9ydCBmcyBmcm9tICdmcydcbmltcG9ydCBCcmllZmNhc2UgZnJvbSBcIi4vYnJpZWZjYXNlXCJcbmltcG9ydCBNb2RlbCBmcm9tIFwiLi9tb2RlbFwiXG5pbXBvcnQgRG9jdW1lbnQgZnJvbSBcIi4vZG9jdW1lbnRcIlxuaW1wb3J0IE1vZGVsRGVmaW5pdGlvbiBmcm9tIFwiLi9tb2RlbF9kZWZpbml0aW9uXCJcbmltcG9ydCB7bW9kZWwsIHJlZ2lzdHJ5fSBmcm9tICcuL21vZGVsX3JlZ2lzdHJ5J1xuXG5jb25zdCBwbHVnaW5zID0gW11cbmNvbnN0IHBsdWdpbk5hbWVzID0ge31cblxuY29uc3QgcGtnID0gcGF0aC5qb2luKF9fZGlybmFtZSwgJy4uL3BhY2thZ2UuanNvbicpXG5jb25zdCBtYW5pZmVzdCA9IEpTT04ucGFyc2UoZnMucmVhZEZpbGVTeW5jKHBrZykpXG5cbmxldCBicmllZiA9IHtcbiAgVkVSU0lPTjogbWFuaWZlc3QudmVyc2lvbixcbiAgcGx1Z2luczogcGx1Z2lucyxcbiAgcGx1Z2luTmFtZXM6IGZ1bmN0aW9uKCl7XG4gICAgcmV0dXJuIE9iamVjdC5rZXlzKHBsdWdpbk5hbWVzKVxuICB9LFxuICBCcmllZmNhc2U6IEJyaWVmY2FzZSxcbiAgTW9kZWw6IE1vZGVsLFxuICBNb2RlbERlZmluaXRpb246IE1vZGVsRGVmaW5pdGlvbixcbiAgcmVnaXN0cnk6IHJlZ2lzdHJ5LFxuICBtb2RlbDogbW9kZWwsXG4gIGluc3RhbmNlczogZnVuY3Rpb24oKXtcbiAgICByZXR1cm4gQnJpZWZjYXNlLmluc3RhbmNlcygpXG4gIH0sXG4gIGZpbmRCcmllZmNhc2VCeVBhdGg6IGZ1bmN0aW9uKHBhdGgpe1xuICAgIHJldHVybiBCcmllZmNhc2UuZmluZEZvclBhdGgocGF0aClcbiAgfSxcbiAgYXRQYXRoOiBmdW5jdGlvbihyb290LCBvcHRpb25zPXt9KXtcbiAgICByZXR1cm4gQnJpZWZjYXNlLmxvYWQocm9vdCwgb3B0aW9ucylcbiAgfSxcbiAgbG9hZDogZnVuY3Rpb24gKHJvb3QsIG9wdGlvbnM9e30pIHtcbiAgICByZXR1cm4gQnJpZWZjYXNlLmxvYWQocm9vdCwgb3B0aW9ucylcbiAgfSxcbiAgZXhhbXBsZTogZnVuY3Rpb24ob3B0aW9ucz17fSl7XG4gICAgcmV0dXJuIHJlcXVpcmUoXCIuLi90ZXN0L2V4YW1wbGVcIikoKVxuICB9LFxuICB1c2U6IGZ1bmN0aW9uKHBsdWdpbiwgb3B0aW9ucyl7XG4gICAgdmFyIG1vZGlmaWVyID0gcGx1Z2luKHRoaXMsIG9wdGlvbnMpXG4gICAgbW9kaWZpZXIudmVyc2lvbiA9IHBsdWdpbi52ZXJzaW9uXG4gICAgbW9kaWZpZXIucGx1Z2luX25hbWUgPSBwbHVnaW4ucGx1Z2luX25hbWVcbiAgICBcbiAgICBpZighcGx1Z2luTmFtZXNbcGx1Z2luLnBsdWdpbl9uYW1lXSl7XG4gICAgICBwbHVnaW5zLnB1c2gobW9kaWZpZXIpXG4gICAgfVxuXG4gICAgcGx1Z2luTmFtZXNbcGx1Z2luLnBsdWdpbl9uYW1lXSA9IHRydWVcblxuICAgIHJldHVybiB0aGlzXG4gIH1cbn1cblxuaWYoIU9iamVjdC52YWx1ZXMpe1xuICBPYmplY3QudmFsdWVzID0gZnVuY3Rpb24ob2JqKXtcbiAgICByZXR1cm4gT2JqZWN0LmtleXMob2JqKS5tYXAoZnVuY3Rpb24oa2V5KXsgcmV0dXJuIG9ialtrZXldIH0pXG4gIH1cbn1cblxuZXhwb3J0IGRlZmF1bHQgYnJpZWZcbiJdfQ==