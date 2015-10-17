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

  if (!definition) {
    return object;
  }

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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3NyYy9jb2xsZWN0aW9uLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7O3FCQUt3QixVQUFVOzs7O2lCQUxkLEdBQUc7Ozs7MEJBQ1QsWUFBWTs7OztBQUUxQixJQUFNLFdBQVcsR0FBRyxxQkFBUyxDQUFBOztBQUVkLFNBQVMsVUFBVSxDQUFDLEtBQUssRUFBRSxVQUFVLEVBQUM7QUFDbkQsTUFBSSxNQUFNLEdBQUcsS0FBSyxFQUFFLENBQUE7O0FBRXBCLE1BQUksTUFBTSxHQUFHLDZCQUFFLE1BQU0sQ0FBQyxDQUFBOztBQUV0QixNQUFHLENBQUMsVUFBVSxFQUFFO0FBQUUsV0FBTyxNQUFNLENBQUE7R0FBRTs7QUFFakMsWUFBVSxDQUFDLGNBQWMsRUFBRSxDQUFDLE9BQU8sQ0FBQyxVQUFBLFNBQVMsRUFBSTtBQUMvQyxRQUFJLE1BQU0sR0FBRyxXQUFXLENBQUMsUUFBUSxDQUFDLFVBQVUsR0FBRyxTQUFTLEVBQUUsS0FBSyxDQUFDLENBQUE7O0FBRWhFLFVBQU0sQ0FBQyxNQUFNLENBQUMsR0FBRyxVQUFTLE1BQU0sRUFBQztBQUMvQixhQUFPLE1BQU0sQ0FBQyxNQUFNLENBQUMsVUFBQSxJQUFJLEVBQUk7QUFDM0IsZUFBTyxJQUFJLENBQUMsU0FBUyxDQUFDLEtBQUssTUFBTSxDQUFBO09BQ2xDLENBQUMsQ0FBQTtLQUNILENBQUE7R0FDRixDQUFDLENBQUE7O0FBRUYsU0FBTyxNQUFNLENBQUE7Q0FDZCIsImZpbGUiOiJjb2xsZWN0aW9uLmpzIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IGluZmxlY3QgZnJvbSAnaSdcbmltcG9ydCBfIGZyb20gJ3VuZGVyc2NvcmUnXG5cbmNvbnN0IGluZmxlY3Rpb25zID0gaW5mbGVjdCgpXG5cbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uIGNvbGxlY3Rpb24oZmV0Y2gsIGRlZmluaXRpb24pe1xuICBsZXQgbW9kZWxzID0gZmV0Y2goKVxuXG4gIGxldCBvYmplY3QgPSBfKG1vZGVscylcbiAgXG4gIGlmKCFkZWZpbml0aW9uKSB7IHJldHVybiBvYmplY3QgfVxuXG4gIGRlZmluaXRpb24uYXR0cmlidXRlTmFtZXMoKS5mb3JFYWNoKGF0dHJpYnV0ZSA9PiB7XG4gICAgbGV0IGZpbmRlciA9IGluZmxlY3Rpb25zLmNhbWVsaXplKFwiZmluZF9ieV9cIiArIGF0dHJpYnV0ZSwgZmFsc2UpICAgIFxuXG4gICAgb2JqZWN0W2ZpbmRlcl0gPSBmdW5jdGlvbihuZWVkbGUpe1xuICAgICAgcmV0dXJuIG9iamVjdC5kZXRlY3QoaXRlbSA9PiB7XG4gICAgICAgIHJldHVybiBpdGVtW2F0dHJpYnV0ZV0gPT09IG5lZWRsZVxuICAgICAgfSlcbiAgICB9XG4gIH0pXG5cbiAgcmV0dXJuIG9iamVjdFxufVxuIl19