'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});
exports.clone = clone;
exports.slugify = slugify;
exports.flatten = flatten;
exports.singularize = singularize;
exports.createDelegators = createDelegators;
exports.mixin = mixin;
exports.strip = strip;

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _i = require('i');

var _i2 = _interopRequireDefault(_i);

var _underscore = require('underscore');

var _underscore2 = _interopRequireDefault(_underscore);

var _underscoreString = require('underscore.string');

var _underscoreString2 = _interopRequireDefault(_underscoreString);

var inflections = (0, _i2['default'])();

/**
* clone an object
*
*/

function clone(base) {
  return JSON.parse(JSON.stringify(base));
}

function slugify(string) {
  string = string.replace(/\s/, '_');
  return inflections.dasherize(string.toLowerCase());
}

function flatten(array) {
  return _underscore2['default'].flatten(array);
}

function singularize(string) {
  return inflections.singularize(string);
}

function createDelegators(target, source) {
  var options = arguments.length <= 2 || arguments[2] === undefined ? {} : arguments[2];

  var excludeKeys = options.exclude || options.except || [];
  var sourceKeys = Object.keys(source).filter(function (key) {
    return excludeKeys.indexOf(key) === -1;
  });

  sourceKeys.forEach(function (key) {
    return Object.defineProperty(target, key, {
      get: function get() {
        return source[key];
      }
    });
  });
}

function mixin(target, source) {
  target = target.prototype;source = source.prototype;

  Object.getOwnPropertyNames(source).forEach(function (name) {
    if (name !== "constructor") Object.defineProperty(target, name, Object.getOwnPropertyDescriptor(source, name));
  });
}

function strip(string) {
  return _underscoreString2['default'].strip(string);
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3NyYy91dGlsLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7OztpQkFBb0IsR0FBRzs7OzswQkFDVCxZQUFZOzs7O2dDQUNOLG1CQUFtQjs7OztBQUV2QyxJQUFNLFdBQVcsR0FBRyxxQkFBUyxDQUFBOzs7Ozs7O0FBTXRCLFNBQVMsS0FBSyxDQUFFLElBQUksRUFBRTtBQUMzQixTQUFPLElBQUksQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFBO0NBQ3hDOztBQUVNLFNBQVMsT0FBTyxDQUFFLE1BQU0sRUFBRTtBQUMvQixRQUFNLEdBQUcsTUFBTSxDQUFDLE9BQU8sQ0FBQyxJQUFJLEVBQUMsR0FBRyxDQUFDLENBQUE7QUFDakMsU0FBTyxXQUFXLENBQUMsU0FBUyxDQUFDLE1BQU0sQ0FBQyxXQUFXLEVBQUUsQ0FBQyxDQUFBO0NBQ25EOztBQUVNLFNBQVMsT0FBTyxDQUFFLEtBQUssRUFBRTtBQUM5QixTQUFPLHdCQUFFLE9BQU8sQ0FBQyxLQUFLLENBQUMsQ0FBQTtDQUN4Qjs7QUFFTSxTQUFTLFdBQVcsQ0FBRSxNQUFNLEVBQUU7QUFDbkMsU0FBTyxXQUFXLENBQUMsV0FBVyxDQUFDLE1BQU0sQ0FBQyxDQUFBO0NBQ3ZDOztBQUVNLFNBQVMsZ0JBQWdCLENBQUMsTUFBTSxFQUFFLE1BQU0sRUFBYTtNQUFYLE9BQU8seURBQUMsRUFBRTs7QUFDekQsTUFBSSxXQUFXLEdBQUcsT0FBTyxDQUFDLE9BQU8sSUFBSSxPQUFPLENBQUMsTUFBTSxJQUFJLEVBQUUsQ0FBQTtBQUN6RCxNQUFJLFVBQVUsR0FBRyxNQUFNLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDLE1BQU0sQ0FBQyxVQUFBLEdBQUc7V0FBSSxXQUFXLENBQUMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxLQUFLLENBQUMsQ0FBQztHQUFBLENBQUMsQ0FBQTs7QUFFbkYsWUFBVSxDQUFDLE9BQU8sQ0FBQyxVQUFBLEdBQUc7V0FBSSxNQUFNLENBQUMsY0FBYyxDQUFDLE1BQU0sRUFBRSxHQUFHLEVBQUU7QUFDM0QsU0FBRyxFQUFFLGVBQVU7QUFDYixlQUFPLE1BQU0sQ0FBQyxHQUFHLENBQUMsQ0FBQTtPQUNuQjtLQUNGLENBQUM7R0FBQSxDQUFDLENBQUE7Q0FDSjs7QUFFTSxTQUFTLEtBQUssQ0FBQyxNQUFNLEVBQUUsTUFBTSxFQUFFO0FBQ3BDLFFBQU0sR0FBRyxNQUFNLENBQUMsU0FBUyxDQUFDLEFBQUMsTUFBTSxHQUFHLE1BQU0sQ0FBQyxTQUFTLENBQUM7O0FBRXJELFFBQU0sQ0FBQyxtQkFBbUIsQ0FBQyxNQUFNLENBQUMsQ0FBQyxPQUFPLENBQUMsVUFBVSxJQUFJLEVBQUU7QUFDekQsUUFBSSxJQUFJLEtBQUssYUFBYSxFQUFFLE1BQU0sQ0FBQyxjQUFjLENBQUMsTUFBTSxFQUFFLElBQUksRUFDNUQsTUFBTSxDQUFDLHdCQUF3QixDQUFDLE1BQU0sRUFBRSxJQUFJLENBQUMsQ0FBQyxDQUFDO0dBQ2xELENBQUMsQ0FBQztDQUNKOztBQUVNLFNBQVMsS0FBSyxDQUFDLE1BQU0sRUFBQztBQUMzQixTQUFPLDhCQUFRLEtBQUssQ0FBQyxNQUFNLENBQUMsQ0FBQTtDQUM3QiIsImZpbGUiOiJ1dGlsLmpzIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IGluZmxlY3QgZnJvbSAnaSdcbmltcG9ydCBfIGZyb20gJ3VuZGVyc2NvcmUnXG5pbXBvcnQgc3RyaW5ncyBmcm9tICd1bmRlcnNjb3JlLnN0cmluZydcblxuY29uc3QgaW5mbGVjdGlvbnMgPSBpbmZsZWN0KClcblxuLyoqXG4qIGNsb25lIGFuIG9iamVjdFxuKlxuKi9cbmV4cG9ydCBmdW5jdGlvbiBjbG9uZSAoYmFzZSkge1xuICByZXR1cm4gSlNPTi5wYXJzZShKU09OLnN0cmluZ2lmeShiYXNlKSlcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHNsdWdpZnkgKHN0cmluZykge1xuICBzdHJpbmcgPSBzdHJpbmcucmVwbGFjZSgvXFxzLywnXycpXG4gIHJldHVybiBpbmZsZWN0aW9ucy5kYXNoZXJpemUoc3RyaW5nLnRvTG93ZXJDYXNlKCkpXG59XG5cbmV4cG9ydCBmdW5jdGlvbiBmbGF0dGVuIChhcnJheSkge1xuICByZXR1cm4gXy5mbGF0dGVuKGFycmF5KVxufVxuXG5leHBvcnQgZnVuY3Rpb24gc2luZ3VsYXJpemUgKHN0cmluZykge1xuICByZXR1cm4gaW5mbGVjdGlvbnMuc2luZ3VsYXJpemUoc3RyaW5nKVxufVxuXG5leHBvcnQgZnVuY3Rpb24gY3JlYXRlRGVsZWdhdG9ycyh0YXJnZXQsIHNvdXJjZSwgb3B0aW9ucz17fSl7XG4gIGxldCBleGNsdWRlS2V5cyA9IG9wdGlvbnMuZXhjbHVkZSB8fCBvcHRpb25zLmV4Y2VwdCB8fCBbXSBcbiAgbGV0IHNvdXJjZUtleXMgPSBPYmplY3Qua2V5cyhzb3VyY2UpLmZpbHRlcihrZXkgPT4gZXhjbHVkZUtleXMuaW5kZXhPZihrZXkpID09PSAtMSlcbiAgXG4gIHNvdXJjZUtleXMuZm9yRWFjaChrZXkgPT4gT2JqZWN0LmRlZmluZVByb3BlcnR5KHRhcmdldCwga2V5LCB7XG4gICAgZ2V0OiBmdW5jdGlvbigpe1xuICAgICAgcmV0dXJuIHNvdXJjZVtrZXldXG4gICAgfVxuICB9KSlcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIG1peGluKHRhcmdldCwgc291cmNlKSB7XG4gIHRhcmdldCA9IHRhcmdldC5wcm90b3R5cGU7IHNvdXJjZSA9IHNvdXJjZS5wcm90b3R5cGU7XG5cbiAgT2JqZWN0LmdldE93blByb3BlcnR5TmFtZXMoc291cmNlKS5mb3JFYWNoKGZ1bmN0aW9uIChuYW1lKSB7XG4gICAgaWYgKG5hbWUgIT09IFwiY29uc3RydWN0b3JcIikgT2JqZWN0LmRlZmluZVByb3BlcnR5KHRhcmdldCwgbmFtZSxcbiAgICAgIE9iamVjdC5nZXRPd25Qcm9wZXJ0eURlc2NyaXB0b3Ioc291cmNlLCBuYW1lKSk7XG4gIH0pO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gc3RyaXAoc3RyaW5nKXtcbiAgcmV0dXJuIHN0cmluZ3Muc3RyaXAoc3RyaW5nKVxufVxuIl19