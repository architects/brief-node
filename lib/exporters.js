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

var _model_registry = require('./model_registry');

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
  base.models = briefcase.getModelDefinitions();

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
//# sourceMappingURL=data:application/json;base64,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QUFJLElBQUksQ0FBQyxJQUFJLENBQUMsV0FBVyxDQUFDLEVBQUUsQ0FBQyxHQUFHLFdBQVcsQ0FBQyxJQUFJO0dBQUEsQ0FBQyxDQUFBOztBQUVoRixTQUFPLElBQUksQ0FBQTtDQUNaOztBQUVELElBQUksVUFBVSxHQUFHO0FBQ2YsVUFBUSxFQUFSLFFBQVE7QUFDUixVQUFRLEVBQVIsUUFBUTtDQUNULENBQUE7O3FCQUVjO0FBQ2IsWUFBVSxFQUFWLFVBQVU7QUFDVixRQUFNLEVBQU4sTUFBTTtDQUNQIiwiZmlsZSI6ImV4cG9ydGVycy5qcyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCBmcyBmcm9tICdmcydcbmltcG9ydCBwYXRoIGZyb20gJ3BhdGgnXG5pbXBvcnQgb3MgZnJvbSAnb3MnXG5pbXBvcnQge21vZGVsc30gZnJvbSAnLi9tb2RlbF9yZWdpc3RyeSdcblxuZnVuY3Rpb24gY2FjaGVkKGJyaWVmY2FzZSwgZm9ybWF0LCBvcHRpb25zPXt9KXtcbiAgbGV0IGNhY2hlZFBhdGggPSBwYXRoLmpvaW4ob3MudG1wZGlyKCksIGJyaWVmY2FzZS5jYWNoZUtleSArICcuJyArIGZvcm1hdCArICcuanNvbicpXG5cbiAgaWYoIW9wdGlvbnMuZnJlc2ggJiYgZnMuZXhpc3RzU3luYyhjYWNoZWRQYXRoKSl7XG4gICAgcmV0dXJuIEpTT04ucGFyc2UoZnMucmVhZEZpbGVTeW5jKGNhY2hlZFBhdGgpKVxuICB9XG5cbiAgbGV0IGZuID0gZm9ybWF0dGVyc1tmb3JtYXRdIHx8IGZvcm1hdHRlcnMuc3RhbmRhcmQgXG4gIGxldCBkYXRhID0gZm4oYnJpZWZjYXNlLCBvcHRpb25zKVxuICBcbiAgZnMud3JpdGVGaWxlKGNhY2hlZFBhdGgsIEpTT04uc3RyaW5naWZ5KGRhdGEpKVxuXG4gIHJldHVybiBkYXRhXG59XG5cbmZ1bmN0aW9uIHN0YW5kYXJkKGJyaWVmY2FzZSwgb3B0aW9ucz17fSl7XG4gIGxldCBpbmRleCA9IHt9XG5cbiAgT2JqZWN0LmtleXMoYnJpZWZjYXNlLmluZGV4KS5mb3JFYWNoKGtleSA9PiB7XG4gICAgbGV0IG1vZGVsID0gYnJpZWZjYXNlLmluZGV4W2tleV1cblxuICAgIGluZGV4W2tleV0gPSBtb2RlbC5mb3JFeHBvcnQoe1xuICAgICAgaW5jbHVkZURvY3VtZW50OiBvcHRpb25zLmluY2x1ZGVEb2N1bWVudCAhPT0gZmFsc2UsXG4gICAgICByZW5kZXJEb2N1bWVudDogb3B0aW9ucy5yZW5kZXJEb2N1bWVudCAhPT0gZmFsc2VcbiAgICB9KVxuICB9KVxuXG4gIHJldHVybiB7XG4gICAgbmFtZTogYnJpZWZjYXNlLm5hbWUsXG4gICAgcm9vdDogYnJpZWZjYXNlLnJvb3QsXG4gICAgb3B0aW9uczogYnJpZWZjYXNlLm9wdGlvbnMsXG4gICAgaW5kZXg6IGluZGV4LFxuICAgIGNvbmZpZzogYnJpZWZjYXNlLmNvbmZpZyxcbiAgICBtYW5pZmVzdDogYnJpZWZjYXNlLm1hbmlmZXN0IHx8IHt9LFxuICAgIGNhY2hlS2V5OiBicmllZmNhc2UuY2FjaGVLZXksXG4gICAgZ3JvdXBOYW1lczogYnJpZWZjYXNlLmdldEdyb3VwTmFtZXMoKSxcbiAgICBkb2N1bWVudFR5cGVzOiBicmllZmNhc2UuZ2V0RG9jdW1lbnRUeXBlcygpLFxuICAgIHBsdWdpbk5hbWVzOiBicmllZmNhc2UucGx1Z2luTmFtZXNcbiAgfVxufVxuXG5mdW5jdGlvbiBleHBhbmRlZChicmllZmNhc2UsIG9wdGlvbnMpe1xuICBsZXQgYmFzZSA9IHN0YW5kYXJkKGJyaWVmY2FzZSwgb3B0aW9ucylcbiAgXG4gIGJhc2UuYXNzZXRzID0ge31cbiAgYmFzZS5kYXRhID0ge31cbiAgYmFzZS5tb2RlbHMgPSBicmllZmNhc2UuZ2V0TW9kZWxEZWZpbml0aW9ucygpIFxuICBcbiAgYnJpZWZjYXNlLmFzc2V0cy5lYWNoKGFzc2V0ID0+IGJhc2UuYXNzZXRzW2Fzc2V0LmlkXSA9IGFzc2V0LmNvbnRlbnQpXG4gIGJyaWVmY2FzZS5kYXRhLmVhY2goZGF0YV9zb3VyY2UgPT4gYmFzZS5kYXRhW2RhdGFfc291cmNlLmlkXSA9IGRhdGFfc291cmNlLmRhdGEpXG5cbiAgcmV0dXJuIGJhc2Vcbn1cblxubGV0IGZvcm1hdHRlcnMgPSB7XG4gIHN0YW5kYXJkLFxuICBleHBhbmRlZFxufVxuXG5leHBvcnQgZGVmYXVsdCB7XG4gIGZvcm1hdHRlcnMsXG4gIGNhY2hlZFxufVxuIl19