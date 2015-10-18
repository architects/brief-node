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

exports['default'] = brief;
module.exports = exports['default'];
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3NyYy9pbmRleC5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7OztvQkFBaUIsTUFBTTs7OztrQkFDUixJQUFJOzs7O3lCQUNHLGFBQWE7Ozs7cUJBQ2pCLFNBQVM7Ozs7d0JBQ04sWUFBWTs7OztnQ0FDTCxvQkFBb0I7Ozs7OEJBQ2xCLGtCQUFrQjs7QUFFaEQsSUFBTSxPQUFPLEdBQUcsRUFBRSxDQUFBO0FBQ2xCLElBQU0sWUFBVyxHQUFHLEVBQUUsQ0FBQTs7QUFFdEIsSUFBTSxHQUFHLEdBQUcsa0JBQUssSUFBSSxDQUFDLFNBQVMsRUFBRSxpQkFBaUIsQ0FBQyxDQUFBO0FBQ25ELElBQU0sUUFBUSxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsZ0JBQUcsWUFBWSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUE7O0FBRWpELElBQUksS0FBSyxHQUFHO0FBQ1YsU0FBTyxFQUFFLFFBQVEsQ0FBQyxPQUFPO0FBQ3pCLFNBQU8sRUFBRSxPQUFPO0FBQ2hCLGFBQVcsRUFBRSx1QkFBVTtBQUNyQixXQUFPLE1BQU0sQ0FBQyxJQUFJLENBQUMsWUFBVyxDQUFDLENBQUE7R0FDaEM7QUFDRCxXQUFTLHdCQUFXO0FBQ3BCLE9BQUssb0JBQU87QUFDWixpQkFBZSwrQkFBaUI7QUFDaEMsVUFBUSwwQkFBVTtBQUNsQixPQUFLLHVCQUFPO0FBQ1osV0FBUyxFQUFFLHFCQUFVO0FBQ25CLFdBQU8sdUJBQVUsU0FBUyxFQUFFLENBQUE7R0FDN0I7QUFDRCxxQkFBbUIsRUFBRSw2QkFBUyxJQUFJLEVBQUM7QUFDakMsV0FBTyx1QkFBVSxXQUFXLENBQUMsSUFBSSxDQUFDLENBQUE7R0FDbkM7QUFDRCxRQUFNLEVBQUUsZ0JBQVMsSUFBSSxFQUFhO1FBQVgsT0FBTyx5REFBQyxFQUFFOztBQUMvQixXQUFPLHVCQUFVLElBQUksQ0FBQyxJQUFJLEVBQUUsT0FBTyxDQUFDLENBQUE7R0FDckM7QUFDRCxNQUFJLEVBQUUsY0FBVSxJQUFJLEVBQWM7UUFBWixPQUFPLHlEQUFDLEVBQUU7O0FBQzlCLFdBQU8sdUJBQVUsSUFBSSxDQUFDLElBQUksRUFBRSxPQUFPLENBQUMsQ0FBQTtHQUNyQztBQUNELFNBQU8sRUFBRSxtQkFBb0I7UUFBWCxPQUFPLHlEQUFDLEVBQUU7O0FBQzFCLFdBQU8sT0FBTyxDQUFDLGlCQUFpQixDQUFDLEVBQUUsQ0FBQTtHQUNwQztBQUNELEtBQUcsRUFBRSxhQUFTLE1BQU0sRUFBRSxPQUFPLEVBQUM7QUFDNUIsUUFBSSxRQUFRLEdBQUcsTUFBTSxDQUFDLElBQUksRUFBRSxPQUFPLENBQUMsQ0FBQTtBQUNwQyxZQUFRLENBQUMsT0FBTyxHQUFHLE1BQU0sQ0FBQyxPQUFPLENBQUE7QUFDakMsWUFBUSxDQUFDLFdBQVcsR0FBRyxNQUFNLENBQUMsV0FBVyxDQUFBOztBQUV6QyxRQUFHLENBQUMsWUFBVyxDQUFDLE1BQU0sQ0FBQyxXQUFXLENBQUMsRUFBQztBQUNsQyxhQUFPLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxDQUFBO0tBQ3ZCOztBQUVELGdCQUFXLENBQUMsTUFBTSxDQUFDLFdBQVcsQ0FBQyxHQUFHLElBQUksQ0FBQTs7QUFFdEMsV0FBTyxJQUFJLENBQUE7R0FDWjtDQUNGLENBQUE7O3FCQUVjLEtBQUsiLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgcGF0aCBmcm9tICdwYXRoJ1xuaW1wb3J0IGZzIGZyb20gJ2ZzJ1xuaW1wb3J0IEJyaWVmY2FzZSBmcm9tIFwiLi9icmllZmNhc2VcIlxuaW1wb3J0IE1vZGVsIGZyb20gXCIuL21vZGVsXCJcbmltcG9ydCBEb2N1bWVudCBmcm9tIFwiLi9kb2N1bWVudFwiXG5pbXBvcnQgTW9kZWxEZWZpbml0aW9uIGZyb20gXCIuL21vZGVsX2RlZmluaXRpb25cIlxuaW1wb3J0IHttb2RlbCwgcmVnaXN0cnl9IGZyb20gJy4vbW9kZWxfcmVnaXN0cnknXG5cbmNvbnN0IHBsdWdpbnMgPSBbXVxuY29uc3QgcGx1Z2luTmFtZXMgPSB7fVxuXG5jb25zdCBwa2cgPSBwYXRoLmpvaW4oX19kaXJuYW1lLCAnLi4vcGFja2FnZS5qc29uJylcbmNvbnN0IG1hbmlmZXN0ID0gSlNPTi5wYXJzZShmcy5yZWFkRmlsZVN5bmMocGtnKSlcblxubGV0IGJyaWVmID0ge1xuICBWRVJTSU9OOiBtYW5pZmVzdC52ZXJzaW9uLFxuICBwbHVnaW5zOiBwbHVnaW5zLFxuICBwbHVnaW5OYW1lczogZnVuY3Rpb24oKXtcbiAgICByZXR1cm4gT2JqZWN0LmtleXMocGx1Z2luTmFtZXMpXG4gIH0sXG4gIEJyaWVmY2FzZTogQnJpZWZjYXNlLFxuICBNb2RlbDogTW9kZWwsXG4gIE1vZGVsRGVmaW5pdGlvbjogTW9kZWxEZWZpbml0aW9uLFxuICByZWdpc3RyeTogcmVnaXN0cnksXG4gIG1vZGVsOiBtb2RlbCxcbiAgaW5zdGFuY2VzOiBmdW5jdGlvbigpe1xuICAgIHJldHVybiBCcmllZmNhc2UuaW5zdGFuY2VzKClcbiAgfSxcbiAgZmluZEJyaWVmY2FzZUJ5UGF0aDogZnVuY3Rpb24ocGF0aCl7XG4gICAgcmV0dXJuIEJyaWVmY2FzZS5maW5kRm9yUGF0aChwYXRoKVxuICB9LFxuICBhdFBhdGg6IGZ1bmN0aW9uKHJvb3QsIG9wdGlvbnM9e30pe1xuICAgIHJldHVybiBCcmllZmNhc2UubG9hZChyb290LCBvcHRpb25zKVxuICB9LFxuICBsb2FkOiBmdW5jdGlvbiAocm9vdCwgb3B0aW9ucz17fSkge1xuICAgIHJldHVybiBCcmllZmNhc2UubG9hZChyb290LCBvcHRpb25zKVxuICB9LFxuICBleGFtcGxlOiBmdW5jdGlvbihvcHRpb25zPXt9KXtcbiAgICByZXR1cm4gcmVxdWlyZShcIi4uL3Rlc3QvZXhhbXBsZVwiKSgpXG4gIH0sXG4gIHVzZTogZnVuY3Rpb24ocGx1Z2luLCBvcHRpb25zKXtcbiAgICB2YXIgbW9kaWZpZXIgPSBwbHVnaW4odGhpcywgb3B0aW9ucylcbiAgICBtb2RpZmllci52ZXJzaW9uID0gcGx1Z2luLnZlcnNpb25cbiAgICBtb2RpZmllci5wbHVnaW5fbmFtZSA9IHBsdWdpbi5wbHVnaW5fbmFtZVxuICAgIFxuICAgIGlmKCFwbHVnaW5OYW1lc1twbHVnaW4ucGx1Z2luX25hbWVdKXtcbiAgICAgIHBsdWdpbnMucHVzaChtb2RpZmllcilcbiAgICB9XG5cbiAgICBwbHVnaW5OYW1lc1twbHVnaW4ucGx1Z2luX25hbWVdID0gdHJ1ZVxuXG4gICAgcmV0dXJuIHRoaXNcbiAgfVxufVxuXG5leHBvcnQgZGVmYXVsdCBicmllZlxuIl19