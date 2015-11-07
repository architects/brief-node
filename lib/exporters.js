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

  var cachedPath = _path2['default'].join(_os2['default'].tmpdir(), briefcase.cacheKey + '.' + format + '.json');

  if (!options.fresh && _fs2['default'].existsSync(cachedPath)) {
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
      includeDocument: options.includeDocument !== false,
      renderDocument: options.renderDocument !== false
    });
  });

  return {
    name: briefcase.name,
    root: briefcase.root,
    options: briefcase.options,
    index: index,
    config: briefcase.config,
    manifest: briefcase.manifest || {},
    cacheKey: briefcase.cacheKey,
    groupNames: briefcase.getGroupNames(),
    documentTypes: briefcase.getDocumentTypes(),
    pluginNames: briefcase.pluginNames
  };
}

function expanded(briefcase, options) {
  var base = standard(briefcase, options);

  base.assets = {};
  base.data = {};

  briefcase.assets.each(function (asset) {
    return base.assets[asset.id] = asset.content;
  });
  briefcase.data.each(function (data_source) {
    return base.data[data_source.id] = data_source.data;
  });

  return base;
}

var formatters = {
  standard: standard,
  expanded: expanded
};

exports['default'] = {
  formatters: formatters,
  cached: cached
};
module.exports = exports['default'];
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3NyYy9leHBvcnRlcnMuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7a0JBQWUsSUFBSTs7OztvQkFDRixNQUFNOzs7O2tCQUNSLElBQUk7Ozs7QUFFbkIsU0FBUyxNQUFNLENBQUMsU0FBUyxFQUFFLE1BQU0sRUFBYTtNQUFYLE9BQU8seURBQUMsRUFBRTs7QUFDM0MsTUFBSSxVQUFVLEdBQUcsa0JBQUssSUFBSSxDQUFDLGdCQUFHLE1BQU0sRUFBRSxFQUFFLFNBQVMsQ0FBQyxRQUFRLEdBQUcsR0FBRyxHQUFHLE1BQU0sR0FBRyxPQUFPLENBQUMsQ0FBQTs7QUFFcEYsTUFBRyxDQUFDLE9BQU8sQ0FBQyxLQUFLLElBQUksZ0JBQUcsVUFBVSxDQUFDLFVBQVUsQ0FBQyxFQUFDO0FBQzdDLFdBQU8sSUFBSSxDQUFDLEtBQUssQ0FBQyxnQkFBRyxZQUFZLENBQUMsVUFBVSxDQUFDLENBQUMsQ0FBQTtHQUMvQzs7QUFFRCxNQUFJLEVBQUUsR0FBRyxVQUFVLENBQUMsTUFBTSxDQUFDLElBQUksVUFBVSxDQUFDLFFBQVEsQ0FBQTtBQUNsRCxNQUFJLElBQUksR0FBRyxFQUFFLENBQUMsU0FBUyxFQUFFLE9BQU8sQ0FBQyxDQUFBOztBQUVqQyxrQkFBRyxTQUFTLENBQUMsVUFBVSxFQUFFLElBQUksQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQTs7QUFFOUMsU0FBTyxJQUFJLENBQUE7Q0FDWjs7QUFFRCxTQUFTLFFBQVEsQ0FBQyxTQUFTLEVBQWE7TUFBWCxPQUFPLHlEQUFDLEVBQUU7O0FBQ3JDLE1BQUksS0FBSyxHQUFHLEVBQUUsQ0FBQTs7QUFFZCxRQUFNLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxLQUFLLENBQUMsQ0FBQyxPQUFPLENBQUMsVUFBQSxHQUFHLEVBQUk7QUFDMUMsUUFBSSxLQUFLLEdBQUcsU0FBUyxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsQ0FBQTs7QUFFaEMsU0FBSyxDQUFDLEdBQUcsQ0FBQyxHQUFHLEtBQUssQ0FBQyxTQUFTLENBQUM7QUFDM0IscUJBQWUsRUFBRSxPQUFPLENBQUMsZUFBZSxLQUFLLEtBQUs7QUFDbEQsb0JBQWMsRUFBRSxPQUFPLENBQUMsY0FBYyxLQUFLLEtBQUs7S0FDakQsQ0FBQyxDQUFBO0dBQ0gsQ0FBQyxDQUFBOztBQUVGLFNBQU87QUFDTCxRQUFJLEVBQUUsU0FBUyxDQUFDLElBQUk7QUFDcEIsUUFBSSxFQUFFLFNBQVMsQ0FBQyxJQUFJO0FBQ3BCLFdBQU8sRUFBRSxTQUFTLENBQUMsT0FBTztBQUMxQixTQUFLLEVBQUUsS0FBSztBQUNaLFVBQU0sRUFBRSxTQUFTLENBQUMsTUFBTTtBQUN4QixZQUFRLEVBQUUsU0FBUyxDQUFDLFFBQVEsSUFBSSxFQUFFO0FBQ2xDLFlBQVEsRUFBRSxTQUFTLENBQUMsUUFBUTtBQUM1QixjQUFVLEVBQUUsU0FBUyxDQUFDLGFBQWEsRUFBRTtBQUNyQyxpQkFBYSxFQUFFLFNBQVMsQ0FBQyxnQkFBZ0IsRUFBRTtBQUMzQyxlQUFXLEVBQUUsU0FBUyxDQUFDLFdBQVc7R0FDbkMsQ0FBQTtDQUNGOztBQUVELFNBQVMsUUFBUSxDQUFDLFNBQVMsRUFBRSxPQUFPLEVBQUM7QUFDbkMsTUFBSSxJQUFJLEdBQUcsUUFBUSxDQUFDLFNBQVMsRUFBRSxPQUFPLENBQUMsQ0FBQTs7QUFFdkMsTUFBSSxDQUFDLE1BQU0sR0FBRyxFQUFFLENBQUE7QUFDaEIsTUFBSSxDQUFDLElBQUksR0FBRyxFQUFFLENBQUE7O0FBRWQsV0FBUyxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsVUFBQSxLQUFLO1dBQUksSUFBSSxDQUFDLE1BQU0sQ0FBQyxLQUFLLENBQUMsRUFBRSxDQUFDLEdBQUcsS0FBSyxDQUFDLE9BQU87R0FBQSxDQUFDLENBQUE7QUFDckUsV0FBUyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsVUFBQSxXQUFXO1dBQUksSUFBSSxDQUFDLElBQUksQ0FBQyxXQUFXLENBQUMsRUFBRSxDQUFDLEdBQUcsV0FBVyxDQUFDLElBQUk7R0FBQSxDQUFDLENBQUE7O0FBRWhGLFNBQU8sSUFBSSxDQUFBO0NBQ1o7O0FBRUQsSUFBSSxVQUFVLEdBQUc7QUFDZixVQUFRLEVBQVIsUUFBUTtBQUNSLFVBQVEsRUFBUixRQUFRO0NBQ1QsQ0FBQTs7cUJBRWM7QUFDYixZQUFVLEVBQVYsVUFBVTtBQUNWLFFBQU0sRUFBTixNQUFNO0NBQ1AiLCJmaWxlIjoiZXhwb3J0ZXJzLmpzIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IGZzIGZyb20gJ2ZzJ1xuaW1wb3J0IHBhdGggZnJvbSAncGF0aCdcbmltcG9ydCBvcyBmcm9tICdvcydcblxuZnVuY3Rpb24gY2FjaGVkKGJyaWVmY2FzZSwgZm9ybWF0LCBvcHRpb25zPXt9KXtcbiAgbGV0IGNhY2hlZFBhdGggPSBwYXRoLmpvaW4ob3MudG1wZGlyKCksIGJyaWVmY2FzZS5jYWNoZUtleSArICcuJyArIGZvcm1hdCArICcuanNvbicpXG5cbiAgaWYoIW9wdGlvbnMuZnJlc2ggJiYgZnMuZXhpc3RzU3luYyhjYWNoZWRQYXRoKSl7XG4gICAgcmV0dXJuIEpTT04ucGFyc2UoZnMucmVhZEZpbGVTeW5jKGNhY2hlZFBhdGgpKVxuICB9XG5cbiAgbGV0IGZuID0gZm9ybWF0dGVyc1tmb3JtYXRdIHx8IGZvcm1hdHRlcnMuc3RhbmRhcmQgXG4gIGxldCBkYXRhID0gZm4oYnJpZWZjYXNlLCBvcHRpb25zKVxuICBcbiAgZnMud3JpdGVGaWxlKGNhY2hlZFBhdGgsIEpTT04uc3RyaW5naWZ5KGRhdGEpKVxuXG4gIHJldHVybiBkYXRhXG59XG5cbmZ1bmN0aW9uIHN0YW5kYXJkKGJyaWVmY2FzZSwgb3B0aW9ucz17fSl7XG4gIGxldCBpbmRleCA9IHt9XG5cbiAgT2JqZWN0LmtleXMoYnJpZWZjYXNlLmluZGV4KS5mb3JFYWNoKGtleSA9PiB7XG4gICAgbGV0IG1vZGVsID0gYnJpZWZjYXNlLmluZGV4W2tleV1cblxuICAgIGluZGV4W2tleV0gPSBtb2RlbC5mb3JFeHBvcnQoe1xuICAgICAgaW5jbHVkZURvY3VtZW50OiBvcHRpb25zLmluY2x1ZGVEb2N1bWVudCAhPT0gZmFsc2UsXG4gICAgICByZW5kZXJEb2N1bWVudDogb3B0aW9ucy5yZW5kZXJEb2N1bWVudCAhPT0gZmFsc2VcbiAgICB9KVxuICB9KVxuXG4gIHJldHVybiB7XG4gICAgbmFtZTogYnJpZWZjYXNlLm5hbWUsXG4gICAgcm9vdDogYnJpZWZjYXNlLnJvb3QsXG4gICAgb3B0aW9uczogYnJpZWZjYXNlLm9wdGlvbnMsXG4gICAgaW5kZXg6IGluZGV4LFxuICAgIGNvbmZpZzogYnJpZWZjYXNlLmNvbmZpZyxcbiAgICBtYW5pZmVzdDogYnJpZWZjYXNlLm1hbmlmZXN0IHx8IHt9LFxuICAgIGNhY2hlS2V5OiBicmllZmNhc2UuY2FjaGVLZXksXG4gICAgZ3JvdXBOYW1lczogYnJpZWZjYXNlLmdldEdyb3VwTmFtZXMoKSxcbiAgICBkb2N1bWVudFR5cGVzOiBicmllZmNhc2UuZ2V0RG9jdW1lbnRUeXBlcygpLFxuICAgIHBsdWdpbk5hbWVzOiBicmllZmNhc2UucGx1Z2luTmFtZXNcbiAgfVxufVxuXG5mdW5jdGlvbiBleHBhbmRlZChicmllZmNhc2UsIG9wdGlvbnMpe1xuICBsZXQgYmFzZSA9IHN0YW5kYXJkKGJyaWVmY2FzZSwgb3B0aW9ucylcbiAgXG4gIGJhc2UuYXNzZXRzID0ge31cbiAgYmFzZS5kYXRhID0ge31cbiAgXG4gIGJyaWVmY2FzZS5hc3NldHMuZWFjaChhc3NldCA9PiBiYXNlLmFzc2V0c1thc3NldC5pZF0gPSBhc3NldC5jb250ZW50KVxuICBicmllZmNhc2UuZGF0YS5lYWNoKGRhdGFfc291cmNlID0+IGJhc2UuZGF0YVtkYXRhX3NvdXJjZS5pZF0gPSBkYXRhX3NvdXJjZS5kYXRhKVxuXG4gIHJldHVybiBiYXNlXG59XG5cbmxldCBmb3JtYXR0ZXJzID0ge1xuICBzdGFuZGFyZCxcbiAgZXhwYW5kZWRcbn1cblxuZXhwb3J0IGRlZmF1bHQge1xuICBmb3JtYXR0ZXJzLFxuICBjYWNoZWRcbn1cbiJdfQ==