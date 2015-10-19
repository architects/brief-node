'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});
exports.clone = clone;
exports.slugify = slugify;
exports.flatten = flatten;
exports.singularize = singularize;
exports.createDelegators = createDelegators;

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _i = require('i');

var _i2 = _interopRequireDefault(_i);

var _underscore = require('underscore');

var _underscore2 = _interopRequireDefault(_underscore);

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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3NyYy91dGlsLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7aUJBQW9CLEdBQUc7Ozs7MEJBQ1QsWUFBWTs7OztBQUUxQixJQUFNLFdBQVcsR0FBRyxxQkFBUyxDQUFBOzs7Ozs7O0FBTXRCLFNBQVMsS0FBSyxDQUFFLElBQUksRUFBRTtBQUMzQixTQUFPLElBQUksQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFBO0NBQ3hDOztBQUVNLFNBQVMsT0FBTyxDQUFFLE1BQU0sRUFBRTtBQUMvQixRQUFNLEdBQUcsTUFBTSxDQUFDLE9BQU8sQ0FBQyxJQUFJLEVBQUMsR0FBRyxDQUFDLENBQUE7QUFDakMsU0FBTyxXQUFXLENBQUMsU0FBUyxDQUFDLE1BQU0sQ0FBQyxXQUFXLEVBQUUsQ0FBQyxDQUFBO0NBQ25EOztBQUVNLFNBQVMsT0FBTyxDQUFFLEtBQUssRUFBRTtBQUM5QixTQUFPLHdCQUFFLE9BQU8sQ0FBQyxLQUFLLENBQUMsQ0FBQTtDQUN4Qjs7QUFFTSxTQUFTLFdBQVcsQ0FBRSxNQUFNLEVBQUU7QUFDbkMsU0FBTyxXQUFXLENBQUMsV0FBVyxDQUFDLE1BQU0sQ0FBQyxDQUFBO0NBQ3ZDOztBQUVNLFNBQVMsZ0JBQWdCLENBQUMsTUFBTSxFQUFFLE1BQU0sRUFBYTtNQUFYLE9BQU8seURBQUMsRUFBRTs7QUFDekQsTUFBSSxXQUFXLEdBQUcsT0FBTyxDQUFDLE9BQU8sSUFBSSxPQUFPLENBQUMsTUFBTSxJQUFJLEVBQUUsQ0FBQTtBQUN6RCxNQUFJLFVBQVUsR0FBRyxNQUFNLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDLE1BQU0sQ0FBQyxVQUFBLEdBQUc7V0FBSSxXQUFXLENBQUMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxLQUFLLENBQUMsQ0FBQztHQUFBLENBQUMsQ0FBQTs7QUFFbkYsWUFBVSxDQUFDLE9BQU8sQ0FBQyxVQUFBLEdBQUc7V0FBSSxNQUFNLENBQUMsY0FBYyxDQUFDLE1BQU0sRUFBRSxHQUFHLEVBQUU7QUFDM0QsU0FBRyxFQUFFLGVBQVU7QUFDYixlQUFPLE1BQU0sQ0FBQyxHQUFHLENBQUMsQ0FBQTtPQUNuQjtLQUNGLENBQUM7R0FBQSxDQUFDLENBQUE7Q0FDSiIsImZpbGUiOiJ1dGlsLmpzIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IGluZmxlY3QgZnJvbSAnaSdcbmltcG9ydCBfIGZyb20gJ3VuZGVyc2NvcmUnXG5cbmNvbnN0IGluZmxlY3Rpb25zID0gaW5mbGVjdCgpXG5cbi8qKlxuKiBjbG9uZSBhbiBvYmplY3RcbipcbiovXG5leHBvcnQgZnVuY3Rpb24gY2xvbmUgKGJhc2UpIHtcbiAgcmV0dXJuIEpTT04ucGFyc2UoSlNPTi5zdHJpbmdpZnkoYmFzZSkpXG59XG5cbmV4cG9ydCBmdW5jdGlvbiBzbHVnaWZ5IChzdHJpbmcpIHtcbiAgc3RyaW5nID0gc3RyaW5nLnJlcGxhY2UoL1xccy8sJ18nKVxuICByZXR1cm4gaW5mbGVjdGlvbnMuZGFzaGVyaXplKHN0cmluZy50b0xvd2VyQ2FzZSgpKVxufVxuXG5leHBvcnQgZnVuY3Rpb24gZmxhdHRlbiAoYXJyYXkpIHtcbiAgcmV0dXJuIF8uZmxhdHRlbihhcnJheSlcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHNpbmd1bGFyaXplIChzdHJpbmcpIHtcbiAgcmV0dXJuIGluZmxlY3Rpb25zLnNpbmd1bGFyaXplKHN0cmluZylcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGNyZWF0ZURlbGVnYXRvcnModGFyZ2V0LCBzb3VyY2UsIG9wdGlvbnM9e30pe1xuICBsZXQgZXhjbHVkZUtleXMgPSBvcHRpb25zLmV4Y2x1ZGUgfHwgb3B0aW9ucy5leGNlcHQgfHwgW10gXG4gIGxldCBzb3VyY2VLZXlzID0gT2JqZWN0LmtleXMoc291cmNlKS5maWx0ZXIoa2V5ID0+IGV4Y2x1ZGVLZXlzLmluZGV4T2Yoa2V5KSA9PT0gLTEpXG4gIFxuICBzb3VyY2VLZXlzLmZvckVhY2goa2V5ID0+IE9iamVjdC5kZWZpbmVQcm9wZXJ0eSh0YXJnZXQsIGtleSwge1xuICAgIGdldDogZnVuY3Rpb24oKXtcbiAgICAgIHJldHVybiBzb3VyY2Vba2V5XVxuICAgIH1cbiAgfSkpXG59XG4iXX0=