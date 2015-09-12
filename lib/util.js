'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});
exports.clone = clone;
exports.slugify = slugify;
exports.flatten = flatten;

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _underscoreString = require('underscore.string');

var _underscoreString2 = _interopRequireDefault(_underscoreString);

var _underscore = require('underscore');

var _underscore2 = _interopRequireDefault(_underscore);

/**
* clone an object
*
*/

function clone(base) {
  return JSON.parse(JSON.stringify(base));
}

function slugify(string) {
  return _underscoreString2['default'].dasherize(string.toLowerCase());
}

function flatten(array) {
  return _underscore2['default'].flatten(array);
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3NyYy91dGlsLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7O2dDQUF3QixtQkFBbUI7Ozs7MEJBQzdCLFlBQVk7Ozs7Ozs7OztBQU1uQixTQUFTLEtBQUssQ0FBRSxJQUFJLEVBQUU7QUFDM0IsU0FBTyxJQUFJLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQTtDQUN4Qzs7QUFFTSxTQUFTLE9BQU8sQ0FBRSxNQUFNLEVBQUU7QUFDL0IsU0FBTyw4QkFBWSxTQUFTLENBQUMsTUFBTSxDQUFDLFdBQVcsRUFBRSxDQUFDLENBQUE7Q0FDbkQ7O0FBRU0sU0FBUyxPQUFPLENBQUUsS0FBSyxFQUFFO0FBQzlCLFNBQU8sd0JBQUUsT0FBTyxDQUFDLEtBQUssQ0FBQyxDQUFBO0NBQ3hCIiwiZmlsZSI6InV0aWwuanMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgaW5mbGVjdGlvbnMgZnJvbSAndW5kZXJzY29yZS5zdHJpbmcnXG5pbXBvcnQgXyBmcm9tICd1bmRlcnNjb3JlJ1xuXG4vKipcbiogY2xvbmUgYW4gb2JqZWN0XG4qXG4qL1xuZXhwb3J0IGZ1bmN0aW9uIGNsb25lIChiYXNlKSB7XG4gIHJldHVybiBKU09OLnBhcnNlKEpTT04uc3RyaW5naWZ5KGJhc2UpKVxufVxuXG5leHBvcnQgZnVuY3Rpb24gc2x1Z2lmeSAoc3RyaW5nKSB7XG4gIHJldHVybiBpbmZsZWN0aW9ucy5kYXNoZXJpemUoc3RyaW5nLnRvTG93ZXJDYXNlKCkpXG59XG5cbmV4cG9ydCBmdW5jdGlvbiBmbGF0dGVuIChhcnJheSkge1xuICByZXR1cm4gXy5mbGF0dGVuKGFycmF5KVxufVxuIl19