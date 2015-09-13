'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});
exports['default'] = collection;

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _i = require('i');

var _i2 = _interopRequireDefault(_i);

var _underscore = require('underscore');

var _underscore2 = _interopRequireDefault(_underscore);

var inflections = (0, _i2['default'])();

function collection(fetch, definition) {
  var models = fetch();

  var object = (0, _underscore2['default'])(models);

  definition.attributeNames().forEach(function (attribute) {
    var finder = inflections.camelize("find_by_" + attribute, false);

    object[finder] = function (needle) {
      return object.detect(function (item) {
        return item[attribute] === needle;
      });
    };
  });

  return object;
}

module.exports = exports['default'];
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3NyYy9jb2xsZWN0aW9uLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7O3FCQUt3QixVQUFVOzs7O2lCQUxkLEdBQUc7Ozs7MEJBQ1QsWUFBWTs7OztBQUUxQixJQUFNLFdBQVcsR0FBRyxxQkFBUyxDQUFBOztBQUVkLFNBQVMsVUFBVSxDQUFDLEtBQUssRUFBRSxVQUFVLEVBQUM7QUFDbkQsTUFBSSxNQUFNLEdBQUcsS0FBSyxFQUFFLENBQUE7O0FBRXBCLE1BQUksTUFBTSxHQUFHLDZCQUFFLE1BQU0sQ0FBQyxDQUFBOztBQUV0QixZQUFVLENBQUMsY0FBYyxFQUFFLENBQUMsT0FBTyxDQUFDLFVBQUEsU0FBUyxFQUFJO0FBQy9DLFFBQUksTUFBTSxHQUFHLFdBQVcsQ0FBQyxRQUFRLENBQUMsVUFBVSxHQUFHLFNBQVMsRUFBRSxLQUFLLENBQUMsQ0FBQTs7QUFFaEUsVUFBTSxDQUFDLE1BQU0sQ0FBQyxHQUFHLFVBQVMsTUFBTSxFQUFDO0FBQy9CLGFBQU8sTUFBTSxDQUFDLE1BQU0sQ0FBQyxVQUFBLElBQUksRUFBSTtBQUMzQixlQUFPLElBQUksQ0FBQyxTQUFTLENBQUMsS0FBSyxNQUFNLENBQUE7T0FDbEMsQ0FBQyxDQUFBO0tBQ0gsQ0FBQTtHQUNGLENBQUMsQ0FBQTs7QUFFRixTQUFPLE1BQU0sQ0FBQTtDQUNkIiwiZmlsZSI6ImNvbGxlY3Rpb24uanMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgaW5mbGVjdCBmcm9tICdpJ1xuaW1wb3J0IF8gZnJvbSAndW5kZXJzY29yZSdcblxuY29uc3QgaW5mbGVjdGlvbnMgPSBpbmZsZWN0KClcblxuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24gY29sbGVjdGlvbihmZXRjaCwgZGVmaW5pdGlvbil7XG4gIGxldCBtb2RlbHMgPSBmZXRjaCgpXG5cbiAgbGV0IG9iamVjdCA9IF8obW9kZWxzKVxuXG4gIGRlZmluaXRpb24uYXR0cmlidXRlTmFtZXMoKS5mb3JFYWNoKGF0dHJpYnV0ZSA9PiB7XG4gICAgbGV0IGZpbmRlciA9IGluZmxlY3Rpb25zLmNhbWVsaXplKFwiZmluZF9ieV9cIiArIGF0dHJpYnV0ZSwgZmFsc2UpICAgIFxuXG4gICAgb2JqZWN0W2ZpbmRlcl0gPSBmdW5jdGlvbihuZWVkbGUpe1xuICAgICAgcmV0dXJuIG9iamVjdC5kZXRlY3QoaXRlbSA9PiB7XG4gICAgICAgIHJldHVybiBpdGVtW2F0dHJpYnV0ZV0gPT09IG5lZWRsZVxuICAgICAgfSlcbiAgICB9XG4gIH0pXG5cbiAgcmV0dXJuIG9iamVjdFxufVxuIl19