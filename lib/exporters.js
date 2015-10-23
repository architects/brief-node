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
    manifest: briefcase.manifest || {}
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3NyYy9leHBvcnRlcnMuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7a0JBQWUsSUFBSTs7OztvQkFDRixNQUFNOzs7O2tCQUNSLElBQUk7Ozs7QUFFbkIsU0FBUyxNQUFNLENBQUMsU0FBUyxFQUFFLE1BQU0sRUFBYTtNQUFYLE9BQU8seURBQUMsRUFBRTs7QUFDM0MsTUFBSSxVQUFVLEdBQUcsa0JBQUssSUFBSSxDQUFDLGdCQUFHLE1BQU0sRUFBRSxFQUFFLFNBQVMsQ0FBQyxRQUFRLENBQUMsQ0FBQTs7QUFFM0QsTUFBRyxnQkFBRyxVQUFVLENBQUMsVUFBVSxDQUFDLEVBQUM7QUFDM0IsV0FBTyxJQUFJLENBQUMsS0FBSyxDQUFDLGdCQUFHLFlBQVksQ0FBQyxVQUFVLENBQUMsQ0FBQyxDQUFBO0dBQy9DOztBQUVELE1BQUksRUFBRSxHQUFHLFVBQVUsQ0FBQyxNQUFNLENBQUMsSUFBSSxVQUFVLENBQUMsUUFBUSxDQUFBO0FBQ2xELE1BQUksSUFBSSxHQUFHLEVBQUUsQ0FBQyxTQUFTLEVBQUUsT0FBTyxDQUFDLENBQUE7O0FBRWpDLGtCQUFHLFNBQVMsQ0FBQyxVQUFVLEVBQUUsSUFBSSxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFBOztBQUU5QyxTQUFPLElBQUksQ0FBQTtDQUNaOztBQUVELFNBQVMsUUFBUSxDQUFDLFNBQVMsRUFBYTtNQUFYLE9BQU8seURBQUMsRUFBRTs7QUFDckMsTUFBSSxLQUFLLEdBQUcsRUFBRSxDQUFBOztBQUVkLFFBQU0sQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLEtBQUssQ0FBQyxDQUFDLE9BQU8sQ0FBQyxVQUFBLEdBQUcsRUFBSTtBQUMxQyxRQUFJLEtBQUssR0FBRyxTQUFTLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxDQUFBOztBQUVoQyxTQUFLLENBQUMsR0FBRyxDQUFDLEdBQUcsS0FBSyxDQUFDLFNBQVMsQ0FBQztBQUMzQixxQkFBZSxFQUFFLElBQUk7S0FDdEIsQ0FBQyxDQUFBO0dBQ0gsQ0FBQyxDQUFBOztBQUVGLFNBQU87QUFDTCxZQUFRLEVBQUUsU0FBUyxDQUFDLFFBQVE7QUFDNUIsY0FBVSxFQUFFLFNBQVMsQ0FBQyxhQUFhLEVBQUU7QUFDckMsaUJBQWEsRUFBRSxTQUFTLENBQUMsZ0JBQWdCLEVBQUU7QUFDM0MsZUFBVyxFQUFFLFNBQVMsQ0FBQyxXQUFXO0FBQ2xDLFNBQUssRUFBRSxLQUFLO0FBQ1osVUFBTSxFQUFFLFNBQVMsQ0FBQyxNQUFNO0FBQ3hCLFlBQVEsRUFBRSxTQUFTLENBQUMsUUFBUSxJQUFJLEVBQUU7R0FDbkMsQ0FBQTtDQUNGOztBQUVELElBQUksVUFBVSxHQUFHO0FBQ2YsVUFBUSxFQUFSLFFBQVE7Q0FDVCxDQUFBOztxQkFFYztBQUNiLFlBQVUsRUFBVixVQUFVO0FBQ1YsUUFBTSxFQUFOLE1BQU07Q0FDUCIsImZpbGUiOiJleHBvcnRlcnMuanMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgZnMgZnJvbSAnZnMnXG5pbXBvcnQgcGF0aCBmcm9tICdwYXRoJ1xuaW1wb3J0IG9zIGZyb20gJ29zJ1xuXG5mdW5jdGlvbiBjYWNoZWQoYnJpZWZjYXNlLCBmb3JtYXQsIG9wdGlvbnM9e30pe1xuICBsZXQgY2FjaGVkUGF0aCA9IHBhdGguam9pbihvcy50bXBkaXIoKSwgYnJpZWZjYXNlLmNhY2hlS2V5KVxuXG4gIGlmKGZzLmV4aXN0c1N5bmMoY2FjaGVkUGF0aCkpe1xuICAgIHJldHVybiBKU09OLnBhcnNlKGZzLnJlYWRGaWxlU3luYyhjYWNoZWRQYXRoKSlcbiAgfVxuXG4gIGxldCBmbiA9IGZvcm1hdHRlcnNbZm9ybWF0XSB8fCBmb3JtYXR0ZXJzLnN0YW5kYXJkIFxuICBsZXQgZGF0YSA9IGZuKGJyaWVmY2FzZSwgb3B0aW9ucylcbiAgXG4gIGZzLndyaXRlRmlsZShjYWNoZWRQYXRoLCBKU09OLnN0cmluZ2lmeShkYXRhKSlcblxuICByZXR1cm4gZGF0YVxufVxuXG5mdW5jdGlvbiBzdGFuZGFyZChicmllZmNhc2UsIG9wdGlvbnM9e30pe1xuICBsZXQgaW5kZXggPSB7fVxuXG4gIE9iamVjdC5rZXlzKGJyaWVmY2FzZS5pbmRleCkuZm9yRWFjaChrZXkgPT4ge1xuICAgIGxldCBtb2RlbCA9IGJyaWVmY2FzZS5pbmRleFtrZXldXG5cbiAgICBpbmRleFtrZXldID0gbW9kZWwuZm9yRXhwb3J0KHtcbiAgICAgIGluY2x1ZGVEb2N1bWVudDogdHJ1ZVxuICAgIH0pXG4gIH0pXG5cbiAgcmV0dXJuIHtcbiAgICBjYWNoZUtleTogYnJpZWZjYXNlLmNhY2hlS2V5LFxuICAgIGdyb3VwTmFtZXM6IGJyaWVmY2FzZS5nZXRHcm91cE5hbWVzKCksXG4gICAgZG9jdW1lbnRUeXBlczogYnJpZWZjYXNlLmdldERvY3VtZW50VHlwZXMoKSxcbiAgICBwbHVnaW5OYW1lczogYnJpZWZjYXNlLnBsdWdpbk5hbWVzLFxuICAgIGluZGV4OiBpbmRleCxcbiAgICBjb25maWc6IGJyaWVmY2FzZS5jb25maWcsXG4gICAgbWFuaWZlc3Q6IGJyaWVmY2FzZS5tYW5pZmVzdCB8fCB7fVxuICB9XG59XG5cbmxldCBmb3JtYXR0ZXJzID0ge1xuICBzdGFuZGFyZFxufVxuXG5leHBvcnQgZGVmYXVsdCB7XG4gIGZvcm1hdHRlcnMsXG4gIGNhY2hlZFxufVxuIl19