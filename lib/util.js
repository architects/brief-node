'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});
exports.extend = extend;
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

function extend() {
  return _underscore2['default'].extend.apply(_underscore2['default'], arguments);
}

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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3NyYy91dGlsLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7aUJBQW9CLEdBQUc7Ozs7MEJBQ1QsWUFBWTs7OztnQ0FDTixtQkFBbUI7Ozs7QUFFdkMsSUFBTSxXQUFXLEdBQUcscUJBQVMsQ0FBQTs7QUFFdEIsU0FBUyxNQUFNLEdBQVM7QUFDN0IsU0FBTyx3QkFBRSxNQUFNLE1BQUEsb0NBQVMsQ0FBQTtDQUN6Qjs7Ozs7OztBQU1NLFNBQVMsS0FBSyxDQUFFLElBQUksRUFBRTtBQUMzQixTQUFPLElBQUksQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFBO0NBQ3hDOztBQUVNLFNBQVMsT0FBTyxDQUFFLE1BQU0sRUFBRTtBQUMvQixRQUFNLEdBQUcsTUFBTSxDQUFDLE9BQU8sQ0FBQyxJQUFJLEVBQUMsR0FBRyxDQUFDLENBQUE7QUFDakMsU0FBTyxXQUFXLENBQUMsU0FBUyxDQUFDLE1BQU0sQ0FBQyxXQUFXLEVBQUUsQ0FBQyxDQUFBO0NBQ25EOztBQUVNLFNBQVMsT0FBTyxDQUFFLEtBQUssRUFBRTtBQUM5QixTQUFPLHdCQUFFLE9BQU8sQ0FBQyxLQUFLLENBQUMsQ0FBQTtDQUN4Qjs7QUFFTSxTQUFTLFdBQVcsQ0FBRSxNQUFNLEVBQUU7QUFDbkMsU0FBTyxXQUFXLENBQUMsV0FBVyxDQUFDLE1BQU0sQ0FBQyxDQUFBO0NBQ3ZDOztBQUVNLFNBQVMsZ0JBQWdCLENBQUMsTUFBTSxFQUFFLE1BQU0sRUFBYTtNQUFYLE9BQU8seURBQUMsRUFBRTs7QUFDekQsTUFBSSxXQUFXLEdBQUcsT0FBTyxDQUFDLE9BQU8sSUFBSSxPQUFPLENBQUMsTUFBTSxJQUFJLEVBQUUsQ0FBQTtBQUN6RCxNQUFJLFVBQVUsR0FBRyxNQUFNLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDLE1BQU0sQ0FBQyxVQUFBLEdBQUc7V0FBSSxXQUFXLENBQUMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxLQUFLLENBQUMsQ0FBQztHQUFBLENBQUMsQ0FBQTs7QUFFbkYsWUFBVSxDQUFDLE9BQU8sQ0FBQyxVQUFBLEdBQUc7V0FBSSxNQUFNLENBQUMsY0FBYyxDQUFDLE1BQU0sRUFBRSxHQUFHLEVBQUU7QUFDM0QsU0FBRyxFQUFFLGVBQVU7QUFDYixlQUFPLE1BQU0sQ0FBQyxHQUFHLENBQUMsQ0FBQTtPQUNuQjtLQUNGLENBQUM7R0FBQSxDQUFDLENBQUE7Q0FDSjs7QUFFTSxTQUFTLEtBQUssQ0FBQyxNQUFNLEVBQUUsTUFBTSxFQUFFO0FBQ3BDLFFBQU0sR0FBRyxNQUFNLENBQUMsU0FBUyxDQUFDLEFBQUMsTUFBTSxHQUFHLE1BQU0sQ0FBQyxTQUFTLENBQUM7O0FBRXJELFFBQU0sQ0FBQyxtQkFBbUIsQ0FBQyxNQUFNLENBQUMsQ0FBQyxPQUFPLENBQUMsVUFBVSxJQUFJLEVBQUU7QUFDekQsUUFBSSxJQUFJLEtBQUssYUFBYSxFQUFFLE1BQU0sQ0FBQyxjQUFjLENBQUMsTUFBTSxFQUFFLElBQUksRUFDNUQsTUFBTSxDQUFDLHdCQUF3QixDQUFDLE1BQU0sRUFBRSxJQUFJLENBQUMsQ0FBQyxDQUFDO0dBQ2xELENBQUMsQ0FBQztDQUNKOztBQUVNLFNBQVMsS0FBSyxDQUFDLE1BQU0sRUFBQztBQUMzQixTQUFPLDhCQUFRLEtBQUssQ0FBQyxNQUFNLENBQUMsQ0FBQTtDQUM3QiIsImZpbGUiOiJ1dGlsLmpzIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IGluZmxlY3QgZnJvbSAnaSdcbmltcG9ydCBfIGZyb20gJ3VuZGVyc2NvcmUnXG5pbXBvcnQgc3RyaW5ncyBmcm9tICd1bmRlcnNjb3JlLnN0cmluZydcblxuY29uc3QgaW5mbGVjdGlvbnMgPSBpbmZsZWN0KClcblxuZXhwb3J0IGZ1bmN0aW9uIGV4dGVuZCguLi5hcmdzKXtcbiAgcmV0dXJuIF8uZXh0ZW5kKC4uLmFyZ3MpXG59XG5cbi8qKlxuKiBjbG9uZSBhbiBvYmplY3RcbipcbiovXG5leHBvcnQgZnVuY3Rpb24gY2xvbmUgKGJhc2UpIHtcbiAgcmV0dXJuIEpTT04ucGFyc2UoSlNPTi5zdHJpbmdpZnkoYmFzZSkpXG59XG5cbmV4cG9ydCBmdW5jdGlvbiBzbHVnaWZ5IChzdHJpbmcpIHtcbiAgc3RyaW5nID0gc3RyaW5nLnJlcGxhY2UoL1xccy8sJ18nKVxuICByZXR1cm4gaW5mbGVjdGlvbnMuZGFzaGVyaXplKHN0cmluZy50b0xvd2VyQ2FzZSgpKVxufVxuXG5leHBvcnQgZnVuY3Rpb24gZmxhdHRlbiAoYXJyYXkpIHtcbiAgcmV0dXJuIF8uZmxhdHRlbihhcnJheSlcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHNpbmd1bGFyaXplIChzdHJpbmcpIHtcbiAgcmV0dXJuIGluZmxlY3Rpb25zLnNpbmd1bGFyaXplKHN0cmluZylcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGNyZWF0ZURlbGVnYXRvcnModGFyZ2V0LCBzb3VyY2UsIG9wdGlvbnM9e30pe1xuICBsZXQgZXhjbHVkZUtleXMgPSBvcHRpb25zLmV4Y2x1ZGUgfHwgb3B0aW9ucy5leGNlcHQgfHwgW10gXG4gIGxldCBzb3VyY2VLZXlzID0gT2JqZWN0LmtleXMoc291cmNlKS5maWx0ZXIoa2V5ID0+IGV4Y2x1ZGVLZXlzLmluZGV4T2Yoa2V5KSA9PT0gLTEpXG4gIFxuICBzb3VyY2VLZXlzLmZvckVhY2goa2V5ID0+IE9iamVjdC5kZWZpbmVQcm9wZXJ0eSh0YXJnZXQsIGtleSwge1xuICAgIGdldDogZnVuY3Rpb24oKXtcbiAgICAgIHJldHVybiBzb3VyY2Vba2V5XVxuICAgIH1cbiAgfSkpXG59XG5cbmV4cG9ydCBmdW5jdGlvbiBtaXhpbih0YXJnZXQsIHNvdXJjZSkge1xuICB0YXJnZXQgPSB0YXJnZXQucHJvdG90eXBlOyBzb3VyY2UgPSBzb3VyY2UucHJvdG90eXBlO1xuXG4gIE9iamVjdC5nZXRPd25Qcm9wZXJ0eU5hbWVzKHNvdXJjZSkuZm9yRWFjaChmdW5jdGlvbiAobmFtZSkge1xuICAgIGlmIChuYW1lICE9PSBcImNvbnN0cnVjdG9yXCIpIE9iamVjdC5kZWZpbmVQcm9wZXJ0eSh0YXJnZXQsIG5hbWUsXG4gICAgICBPYmplY3QuZ2V0T3duUHJvcGVydHlEZXNjcmlwdG9yKHNvdXJjZSwgbmFtZSkpO1xuICB9KTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHN0cmlwKHN0cmluZyl7XG4gIHJldHVybiBzdHJpbmdzLnN0cmlwKHN0cmluZylcbn1cbiJdfQ==