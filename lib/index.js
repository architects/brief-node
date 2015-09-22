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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3NyYy9pbmRleC5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7OztvQkFBaUIsTUFBTTs7Ozt5QkFDRCxhQUFhOzs7O3FCQUNqQixTQUFTOzs7O3dCQUNOLFlBQVk7Ozs7Z0NBQ0wsb0JBQW9COzs7OzhCQUNsQixrQkFBa0I7O0FBRWhELElBQU0sT0FBTyxHQUFHLEVBQUUsQ0FBQTs7QUFFbEIsSUFBSSxLQUFLLEdBQUc7QUFDVixTQUFPLEVBQUUsT0FBTztBQUNoQixXQUFTLHdCQUFXO0FBQ3BCLE9BQUssb0JBQU87QUFDWixpQkFBZSwrQkFBaUI7QUFDaEMsVUFBUSwwQkFBVTtBQUNsQixPQUFLLHVCQUFPO0FBQ1osTUFBSSxFQUFFLGNBQVUsSUFBSSxFQUFjO1FBQVosT0FBTyx5REFBQyxFQUFFOztBQUM5QixXQUFPLHVCQUFVLElBQUksQ0FBQyxJQUFJLEVBQUUsT0FBTyxDQUFDLENBQUE7R0FDckM7QUFDRCxTQUFPLEVBQUUsbUJBQW9CO1FBQVgsT0FBTyx5REFBQyxFQUFFOztBQUMxQixXQUFPLE9BQU8sQ0FBQyxpQkFBaUIsQ0FBQyxFQUFFLENBQUE7R0FDcEM7QUFDRCxLQUFHLEVBQUUsYUFBUyxNQUFNLEVBQUUsT0FBTyxFQUFDO0FBQzVCLFFBQUksUUFBUSxHQUFHLE1BQU0sQ0FBQyxJQUFJLEVBQUUsT0FBTyxDQUFDLENBQUE7QUFDcEMsWUFBUSxDQUFDLE9BQU8sR0FBRyxNQUFNLENBQUMsT0FBTyxDQUFBO0FBQ2pDLFlBQVEsQ0FBQyxXQUFXLEdBQUcsTUFBTSxDQUFDLFdBQVcsQ0FBQTs7QUFFekMsV0FBTyxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsQ0FBQTs7QUFFdEIsV0FBTyxJQUFJLENBQUE7R0FDWjtDQUNGLENBQUE7O3FCQUVjLEtBQUsiLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgcGF0aCBmcm9tICdwYXRoJ1xuaW1wb3J0IEJyaWVmY2FzZSBmcm9tIFwiLi9icmllZmNhc2VcIlxuaW1wb3J0IE1vZGVsIGZyb20gXCIuL21vZGVsXCJcbmltcG9ydCBEb2N1bWVudCBmcm9tIFwiLi9kb2N1bWVudFwiXG5pbXBvcnQgTW9kZWxEZWZpbml0aW9uIGZyb20gXCIuL21vZGVsX2RlZmluaXRpb25cIlxuaW1wb3J0IHttb2RlbCwgcmVnaXN0cnl9IGZyb20gJy4vbW9kZWxfcmVnaXN0cnknXG5cbmNvbnN0IHBsdWdpbnMgPSBbXVxuXG5sZXQgYnJpZWYgPSB7XG4gIHBsdWdpbnM6IHBsdWdpbnMsXG4gIEJyaWVmY2FzZTogQnJpZWZjYXNlLFxuICBNb2RlbDogTW9kZWwsXG4gIE1vZGVsRGVmaW5pdGlvbjogTW9kZWxEZWZpbml0aW9uLFxuICByZWdpc3RyeTogcmVnaXN0cnksXG4gIG1vZGVsOiBtb2RlbCxcbiAgbG9hZDogZnVuY3Rpb24gKHJvb3QsIG9wdGlvbnM9e30pIHtcbiAgICByZXR1cm4gQnJpZWZjYXNlLmxvYWQocm9vdCwgb3B0aW9ucylcbiAgfSxcbiAgZXhhbXBsZTogZnVuY3Rpb24ob3B0aW9ucz17fSl7XG4gICAgcmV0dXJuIHJlcXVpcmUoXCIuLi90ZXN0L2V4YW1wbGVcIikoKVxuICB9LFxuICB1c2U6IGZ1bmN0aW9uKHBsdWdpbiwgb3B0aW9ucyl7XG4gICAgdmFyIG1vZGlmaWVyID0gcGx1Z2luKHRoaXMsIG9wdGlvbnMpXG4gICAgbW9kaWZpZXIudmVyc2lvbiA9IHBsdWdpbi52ZXJzaW9uXG4gICAgbW9kaWZpZXIucGx1Z2luX25hbWUgPSBwbHVnaW4ucGx1Z2luX25hbWVcblxuICAgIHBsdWdpbnMucHVzaChtb2RpZmllcilcblxuICAgIHJldHVybiB0aGlzXG4gIH1cbn1cblxuZXhwb3J0IGRlZmF1bHQgYnJpZWZcbiJdfQ==