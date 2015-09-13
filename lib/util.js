'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});
exports.clone = clone;
exports.slugify = slugify;
exports.flatten = flatten;
exports.singularize = singularize;

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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3NyYy91dGlsLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7OztpQkFBb0IsR0FBRzs7OzswQkFDVCxZQUFZOzs7O0FBRTFCLElBQU0sV0FBVyxHQUFHLHFCQUFTLENBQUE7Ozs7Ozs7QUFNdEIsU0FBUyxLQUFLLENBQUUsSUFBSSxFQUFFO0FBQzNCLFNBQU8sSUFBSSxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUE7Q0FDeEM7O0FBRU0sU0FBUyxPQUFPLENBQUUsTUFBTSxFQUFFO0FBQy9CLFFBQU0sR0FBRyxNQUFNLENBQUMsT0FBTyxDQUFDLElBQUksRUFBQyxHQUFHLENBQUMsQ0FBQTtBQUNqQyxTQUFPLFdBQVcsQ0FBQyxTQUFTLENBQUMsTUFBTSxDQUFDLFdBQVcsRUFBRSxDQUFDLENBQUE7Q0FDbkQ7O0FBRU0sU0FBUyxPQUFPLENBQUUsS0FBSyxFQUFFO0FBQzlCLFNBQU8sd0JBQUUsT0FBTyxDQUFDLEtBQUssQ0FBQyxDQUFBO0NBQ3hCOztBQUVNLFNBQVMsV0FBVyxDQUFFLE1BQU0sRUFBRTtBQUNuQyxTQUFPLFdBQVcsQ0FBQyxXQUFXLENBQUMsTUFBTSxDQUFDLENBQUE7Q0FDdkMiLCJmaWxlIjoidXRpbC5qcyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCBpbmZsZWN0IGZyb20gJ2knXG5pbXBvcnQgXyBmcm9tICd1bmRlcnNjb3JlJ1xuXG5jb25zdCBpbmZsZWN0aW9ucyA9IGluZmxlY3QoKVxuXG4vKipcbiogY2xvbmUgYW4gb2JqZWN0XG4qXG4qL1xuZXhwb3J0IGZ1bmN0aW9uIGNsb25lIChiYXNlKSB7XG4gIHJldHVybiBKU09OLnBhcnNlKEpTT04uc3RyaW5naWZ5KGJhc2UpKVxufVxuXG5leHBvcnQgZnVuY3Rpb24gc2x1Z2lmeSAoc3RyaW5nKSB7XG4gIHN0cmluZyA9IHN0cmluZy5yZXBsYWNlKC9cXHMvLCdfJylcbiAgcmV0dXJuIGluZmxlY3Rpb25zLmRhc2hlcml6ZShzdHJpbmcudG9Mb3dlckNhc2UoKSlcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGZsYXR0ZW4gKGFycmF5KSB7XG4gIHJldHVybiBfLmZsYXR0ZW4oYXJyYXkpXG59XG5cbmV4cG9ydCBmdW5jdGlvbiBzaW5ndWxhcml6ZSAoc3RyaW5nKSB7XG4gIHJldHVybiBpbmZsZWN0aW9ucy5zaW5ndWxhcml6ZShzdHJpbmcpXG59XG4iXX0=