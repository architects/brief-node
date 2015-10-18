"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

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

var brief = {
  plugins: plugins,
  Briefcase: _briefcase2["default"],
  Model: _model2["default"],
  ModelDefinition: _model_definition2["default"],
  registry: _model_registry.registry,
  model: _model_registry.model,
  instances: function instances() {
    return _briefcase2["default"].instances();
  },
  findBriefcaseByPath: function findBriefcaseByPath(path) {
    return _briefcase2["default"].findForPath(path);
  },
  load: function load(root) {
    var options = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

    return _briefcase2["default"].load(root, options);
  },
  example: function example() {
    var options = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

    return require("../test/example")();
  },
  use: function use(plugin, options) {
    var modifier = plugin(this, options);
    modifier.version = plugin.version;
    modifier.plugin_name = plugin.plugin_name;

    plugins.push(modifier);

    return this;
  }
};

exports["default"] = brief;
module.exports = exports["default"];
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3NyYy9pbmRleC5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7OztvQkFBaUIsTUFBTTs7Ozt5QkFDRCxhQUFhOzs7O3FCQUNqQixTQUFTOzs7O3dCQUNOLFlBQVk7Ozs7Z0NBQ0wsb0JBQW9COzs7OzhCQUNsQixrQkFBa0I7O0FBRWhELElBQU0sT0FBTyxHQUFHLEVBQUUsQ0FBQTs7QUFFbEIsSUFBSSxLQUFLLEdBQUc7QUFDVixTQUFPLEVBQUUsT0FBTztBQUNoQixXQUFTLHdCQUFXO0FBQ3BCLE9BQUssb0JBQU87QUFDWixpQkFBZSwrQkFBaUI7QUFDaEMsVUFBUSwwQkFBVTtBQUNsQixPQUFLLHVCQUFPO0FBQ1osV0FBUyxFQUFFLHFCQUFVO0FBQ25CLFdBQU8sdUJBQVUsU0FBUyxFQUFFLENBQUE7R0FDN0I7QUFDRCxxQkFBbUIsRUFBRSw2QkFBUyxJQUFJLEVBQUM7QUFDakMsV0FBTyx1QkFBVSxXQUFXLENBQUMsSUFBSSxDQUFDLENBQUE7R0FDbkM7QUFDRCxNQUFJLEVBQUUsY0FBVSxJQUFJLEVBQWM7UUFBWixPQUFPLHlEQUFDLEVBQUU7O0FBQzlCLFdBQU8sdUJBQVUsSUFBSSxDQUFDLElBQUksRUFBRSxPQUFPLENBQUMsQ0FBQTtHQUNyQztBQUNELFNBQU8sRUFBRSxtQkFBb0I7UUFBWCxPQUFPLHlEQUFDLEVBQUU7O0FBQzFCLFdBQU8sT0FBTyxDQUFDLGlCQUFpQixDQUFDLEVBQUUsQ0FBQTtHQUNwQztBQUNELEtBQUcsRUFBRSxhQUFTLE1BQU0sRUFBRSxPQUFPLEVBQUM7QUFDNUIsUUFBSSxRQUFRLEdBQUcsTUFBTSxDQUFDLElBQUksRUFBRSxPQUFPLENBQUMsQ0FBQTtBQUNwQyxZQUFRLENBQUMsT0FBTyxHQUFHLE1BQU0sQ0FBQyxPQUFPLENBQUE7QUFDakMsWUFBUSxDQUFDLFdBQVcsR0FBRyxNQUFNLENBQUMsV0FBVyxDQUFBOztBQUV6QyxXQUFPLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxDQUFBOztBQUV0QixXQUFPLElBQUksQ0FBQTtHQUNaO0NBQ0YsQ0FBQTs7cUJBRWMsS0FBSyIsImZpbGUiOiJpbmRleC5qcyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCBwYXRoIGZyb20gJ3BhdGgnXG5pbXBvcnQgQnJpZWZjYXNlIGZyb20gXCIuL2JyaWVmY2FzZVwiXG5pbXBvcnQgTW9kZWwgZnJvbSBcIi4vbW9kZWxcIlxuaW1wb3J0IERvY3VtZW50IGZyb20gXCIuL2RvY3VtZW50XCJcbmltcG9ydCBNb2RlbERlZmluaXRpb24gZnJvbSBcIi4vbW9kZWxfZGVmaW5pdGlvblwiXG5pbXBvcnQge21vZGVsLCByZWdpc3RyeX0gZnJvbSAnLi9tb2RlbF9yZWdpc3RyeSdcblxuY29uc3QgcGx1Z2lucyA9IFtdXG5cbmxldCBicmllZiA9IHtcbiAgcGx1Z2luczogcGx1Z2lucyxcbiAgQnJpZWZjYXNlOiBCcmllZmNhc2UsXG4gIE1vZGVsOiBNb2RlbCxcbiAgTW9kZWxEZWZpbml0aW9uOiBNb2RlbERlZmluaXRpb24sXG4gIHJlZ2lzdHJ5OiByZWdpc3RyeSxcbiAgbW9kZWw6IG1vZGVsLFxuICBpbnN0YW5jZXM6IGZ1bmN0aW9uKCl7XG4gICAgcmV0dXJuIEJyaWVmY2FzZS5pbnN0YW5jZXMoKVxuICB9LFxuICBmaW5kQnJpZWZjYXNlQnlQYXRoOiBmdW5jdGlvbihwYXRoKXtcbiAgICByZXR1cm4gQnJpZWZjYXNlLmZpbmRGb3JQYXRoKHBhdGgpXG4gIH0sXG4gIGxvYWQ6IGZ1bmN0aW9uIChyb290LCBvcHRpb25zPXt9KSB7XG4gICAgcmV0dXJuIEJyaWVmY2FzZS5sb2FkKHJvb3QsIG9wdGlvbnMpXG4gIH0sXG4gIGV4YW1wbGU6IGZ1bmN0aW9uKG9wdGlvbnM9e30pe1xuICAgIHJldHVybiByZXF1aXJlKFwiLi4vdGVzdC9leGFtcGxlXCIpKClcbiAgfSxcbiAgdXNlOiBmdW5jdGlvbihwbHVnaW4sIG9wdGlvbnMpe1xuICAgIHZhciBtb2RpZmllciA9IHBsdWdpbih0aGlzLCBvcHRpb25zKVxuICAgIG1vZGlmaWVyLnZlcnNpb24gPSBwbHVnaW4udmVyc2lvblxuICAgIG1vZGlmaWVyLnBsdWdpbl9uYW1lID0gcGx1Z2luLnBsdWdpbl9uYW1lXG5cbiAgICBwbHVnaW5zLnB1c2gobW9kaWZpZXIpXG5cbiAgICByZXR1cm4gdGhpc1xuICB9XG59XG5cbmV4cG9ydCBkZWZhdWx0IGJyaWVmXG4iXX0=