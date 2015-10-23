'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _os = require('os');

var _os2 = _interopRequireDefault(_os);

function cached(briefcase, format) {
  var options = arguments.length <= 2 || arguments[2] === undefined ? {} : arguments[2];

  var cachedPath = _path2['default'].join(_os2['default'].tmpdir(), briefcase.cacheKey);

  if (_fs2['default'].existsSync(cachedPath)) {
    return JSON.parse(_fs2['default'].readFileSync(cachedPath));
  }

  var fn = formatters[format] || formatters.standard;
  var data = fn(briefcase, options);

  _fs2['default'].writeFile(cachedPath, JSON.stringify(data));

  return data;
}

function standard(briefcase) {
  var options = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

  var index = {};

  Object.keys(briefcase.index).forEach(function (key) {
    var model = briefcase.index[key];

    index[key] = model.forExport({
      includeDocument: true
    });
  });

  return {
    cacheKey: briefcase.cacheKey,
    groupNames: briefcase.getGroupNames(),
    documentTypes: briefcase.getDocumentTypes(),
    pluginNames: briefcase.pluginNames,
    index: index,
    config: briefcase.config,
    root: briefcase.root
  };
}

var formatters = {
  standard: standard
};

exports['default'] = {
  formatters: formatters,
  cached: cached
};
module.exports = exports['default'];
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3NyYy9leHBvcnRlcnMuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7a0JBQWUsSUFBSTs7OztvQkFDRixNQUFNOzs7O2tCQUNSLElBQUk7Ozs7QUFFbkIsU0FBUyxNQUFNLENBQUMsU0FBUyxFQUFFLE1BQU0sRUFBYTtNQUFYLE9BQU8seURBQUMsRUFBRTs7QUFDM0MsTUFBSSxVQUFVLEdBQUcsa0JBQUssSUFBSSxDQUFDLGdCQUFHLE1BQU0sRUFBRSxFQUFFLFNBQVMsQ0FBQyxRQUFRLENBQUMsQ0FBQTs7QUFFM0QsTUFBRyxnQkFBRyxVQUFVLENBQUMsVUFBVSxDQUFDLEVBQUM7QUFDM0IsV0FBTyxJQUFJLENBQUMsS0FBSyxDQUFDLGdCQUFHLFlBQVksQ0FBQyxVQUFVLENBQUMsQ0FBQyxDQUFBO0dBQy9DOztBQUVELE1BQUksRUFBRSxHQUFHLFVBQVUsQ0FBQyxNQUFNLENBQUMsSUFBSSxVQUFVLENBQUMsUUFBUSxDQUFBO0FBQ2xELE1BQUksSUFBSSxHQUFHLEVBQUUsQ0FBQyxTQUFTLEVBQUUsT0FBTyxDQUFDLENBQUE7O0FBRWpDLGtCQUFHLFNBQVMsQ0FBQyxVQUFVLEVBQUUsSUFBSSxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFBOztBQUU5QyxTQUFPLElBQUksQ0FBQTtDQUNaOztBQUVELFNBQVMsUUFBUSxDQUFDLFNBQVMsRUFBYTtNQUFYLE9BQU8seURBQUMsRUFBRTs7QUFDckMsTUFBSSxLQUFLLEdBQUcsRUFBRSxDQUFBOztBQUVkLFFBQU0sQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLEtBQUssQ0FBQyxDQUFDLE9BQU8sQ0FBQyxVQUFBLEdBQUcsRUFBSTtBQUMxQyxRQUFJLEtBQUssR0FBRyxTQUFTLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxDQUFBOztBQUVoQyxTQUFLLENBQUMsR0FBRyxDQUFDLEdBQUcsS0FBSyxDQUFDLFNBQVMsQ0FBQztBQUMzQixxQkFBZSxFQUFFLElBQUk7S0FDdEIsQ0FBQyxDQUFBO0dBQ0gsQ0FBQyxDQUFBOztBQUVGLFNBQU87QUFDTCxZQUFRLEVBQUUsU0FBUyxDQUFDLFFBQVE7QUFDNUIsY0FBVSxFQUFFLFNBQVMsQ0FBQyxhQUFhLEVBQUU7QUFDckMsaUJBQWEsRUFBRSxTQUFTLENBQUMsZ0JBQWdCLEVBQUU7QUFDM0MsZUFBVyxFQUFFLFNBQVMsQ0FBQyxXQUFXO0FBQ2xDLFNBQUssRUFBRSxLQUFLO0FBQ1osVUFBTSxFQUFFLFNBQVMsQ0FBQyxNQUFNO0FBQ3hCLFFBQUksRUFBRSxTQUFTLENBQUMsSUFBSTtHQUNyQixDQUFBO0NBQ0Y7O0FBRUQsSUFBSSxVQUFVLEdBQUc7QUFDZixVQUFRLEVBQVIsUUFBUTtDQUNULENBQUE7O3FCQUVjO0FBQ2IsWUFBVSxFQUFWLFVBQVU7QUFDVixRQUFNLEVBQU4sTUFBTTtDQUNQIiwiZmlsZSI6ImV4cG9ydGVycy5qcyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCBmcyBmcm9tICdmcydcbmltcG9ydCBwYXRoIGZyb20gJ3BhdGgnXG5pbXBvcnQgb3MgZnJvbSAnb3MnXG5cbmZ1bmN0aW9uIGNhY2hlZChicmllZmNhc2UsIGZvcm1hdCwgb3B0aW9ucz17fSl7XG4gIGxldCBjYWNoZWRQYXRoID0gcGF0aC5qb2luKG9zLnRtcGRpcigpLCBicmllZmNhc2UuY2FjaGVLZXkpXG5cbiAgaWYoZnMuZXhpc3RzU3luYyhjYWNoZWRQYXRoKSl7XG4gICAgcmV0dXJuIEpTT04ucGFyc2UoZnMucmVhZEZpbGVTeW5jKGNhY2hlZFBhdGgpKVxuICB9XG5cbiAgbGV0IGZuID0gZm9ybWF0dGVyc1tmb3JtYXRdIHx8IGZvcm1hdHRlcnMuc3RhbmRhcmQgXG4gIGxldCBkYXRhID0gZm4oYnJpZWZjYXNlLCBvcHRpb25zKVxuICBcbiAgZnMud3JpdGVGaWxlKGNhY2hlZFBhdGgsIEpTT04uc3RyaW5naWZ5KGRhdGEpKVxuXG4gIHJldHVybiBkYXRhXG59XG5cbmZ1bmN0aW9uIHN0YW5kYXJkKGJyaWVmY2FzZSwgb3B0aW9ucz17fSl7XG4gIGxldCBpbmRleCA9IHt9XG5cbiAgT2JqZWN0LmtleXMoYnJpZWZjYXNlLmluZGV4KS5mb3JFYWNoKGtleSA9PiB7XG4gICAgbGV0IG1vZGVsID0gYnJpZWZjYXNlLmluZGV4W2tleV1cblxuICAgIGluZGV4W2tleV0gPSBtb2RlbC5mb3JFeHBvcnQoe1xuICAgICAgaW5jbHVkZURvY3VtZW50OiB0cnVlXG4gICAgfSlcbiAgfSlcblxuICByZXR1cm4ge1xuICAgIGNhY2hlS2V5OiBicmllZmNhc2UuY2FjaGVLZXksXG4gICAgZ3JvdXBOYW1lczogYnJpZWZjYXNlLmdldEdyb3VwTmFtZXMoKSxcbiAgICBkb2N1bWVudFR5cGVzOiBicmllZmNhc2UuZ2V0RG9jdW1lbnRUeXBlcygpLFxuICAgIHBsdWdpbk5hbWVzOiBicmllZmNhc2UucGx1Z2luTmFtZXMsXG4gICAgaW5kZXg6IGluZGV4LFxuICAgIGNvbmZpZzogYnJpZWZjYXNlLmNvbmZpZyxcbiAgICByb290OiBicmllZmNhc2Uucm9vdFxuICB9XG59XG5cbmxldCBmb3JtYXR0ZXJzID0ge1xuICBzdGFuZGFyZFxufVxuXG5leHBvcnQgZGVmYXVsdCB7XG4gIGZvcm1hdHRlcnMsXG4gIGNhY2hlZFxufVxuIl19