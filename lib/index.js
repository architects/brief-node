"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _case = require("./case");

var _case2 = _interopRequireDefault(_case);

var _model = require("./model");

var _model2 = _interopRequireDefault(_model);

var _document = require("./document");

var _document2 = _interopRequireDefault(_document);

var _document3 = _interopRequireDefault(_document);

var brief = {
  Case: _case2["default"],
  Model: _model2["default"],
  ModelDefinition: _document3["default"],
  load: function load(root) {
    var options = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

    return _case2["default"].load(root, options);
  },
  example: function example() {
    var options = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

    return require("../test/example")();
  }
};

exports["default"] = brief;
module.exports = exports["default"];
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3NyYy9pbmRleC5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7OztvQkFBaUIsTUFBTTs7OztvQkFDTixRQUFROzs7O3FCQUNQLFNBQVM7Ozs7d0JBQ04sWUFBWTs7Ozs7O0FBR2pDLElBQUksS0FBSyxHQUFHO0FBQ1YsTUFBSSxtQkFBTTtBQUNWLE9BQUssb0JBQU87QUFDWixpQkFBZSx1QkFBaUI7QUFDaEMsTUFBSSxFQUFFLGNBQVUsSUFBSSxFQUFjO1FBQVosT0FBTyx5REFBQyxFQUFFOztBQUM5QixXQUFPLGtCQUFLLElBQUksQ0FBQyxJQUFJLEVBQUUsT0FBTyxDQUFDLENBQUE7R0FDaEM7QUFDRCxTQUFPLEVBQUUsbUJBQW9CO1FBQVgsT0FBTyx5REFBQyxFQUFFOztBQUMxQixXQUFPLE9BQU8sQ0FBQyxpQkFBaUIsQ0FBQyxFQUFFLENBQUE7R0FDcEM7Q0FDRixDQUFBOztxQkFFYyxLQUFLIiwiZmlsZSI6ImluZGV4LmpzIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHBhdGggZnJvbSAncGF0aCdcbmltcG9ydCBDYXNlIGZyb20gXCIuL2Nhc2VcIlxuaW1wb3J0IE1vZGVsIGZyb20gXCIuL21vZGVsXCJcbmltcG9ydCBEb2N1bWVudCBmcm9tIFwiLi9kb2N1bWVudFwiXG5pbXBvcnQgTW9kZWxEZWZpbml0aW9uIGZyb20gXCIuL2RvY3VtZW50XCJcblxubGV0IGJyaWVmID0ge1xuICBDYXNlOiBDYXNlLFxuICBNb2RlbDogTW9kZWwsXG4gIE1vZGVsRGVmaW5pdGlvbjogTW9kZWxEZWZpbml0aW9uLFxuICBsb2FkOiBmdW5jdGlvbiAocm9vdCwgb3B0aW9ucz17fSkge1xuICAgIHJldHVybiBDYXNlLmxvYWQocm9vdCwgb3B0aW9ucylcbiAgfSxcbiAgZXhhbXBsZTogZnVuY3Rpb24ob3B0aW9ucz17fSl7XG4gICAgcmV0dXJuIHJlcXVpcmUoXCIuLi90ZXN0L2V4YW1wbGVcIikoKVxuICB9XG59XG5cbmV4cG9ydCBkZWZhdWx0IGJyaWVmXG4iXX0=