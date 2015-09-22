'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});
exports.definitions = definitions;
exports.loadPath = loadPath;
exports.model = model;
exports.register = register;

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _i = require('i');

var _i2 = _interopRequireDefault(_i);

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

var inflections = (0, _i2['default'])();

var registry = {
  models: {},
  aliases: {}
};

exports['default'] = registry;

function definitions(finder) {
  return finder ? model(finder) : Object.keys(registry.models).map(function (key) {
    return registry.models[key];
  });
}

function loadPath(path) {
  var definition = ModelDefinition.load(path);

  if (definition && definition.type_alias) {
    register(definition);
  }
}

function model(nameOrTypeAlias) {
  var guess = arguments.length <= 1 || arguments[1] === undefined ? true : arguments[1];

  var models = registry.models;
  var alias = registry.aliases[nameOrTypeAlias];

  if (models[nameOrTypeAlias]) {
    return models[nameOrTypeAlias];
  }

  if (alias) {
    if (models[alias]) {
      return models[alias];
    }
  }

  if (!guess) {
    return;
  }

  var result = model(inflections.singularize(nameOrTypeAlias).toLowerCase(), false);

  if (result) {
    return result;
  }
}

function register(definition) {
  registry.models[definition.name] = definition;
  registry.aliases[definition.type_alias] = definition.name;
  return definition;
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3NyYy9tb2RlbF9yZWdpc3RyeS5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7aUJBQW9CLEdBQUc7Ozs7a0JBQ1IsSUFBSTs7OztBQUVuQixJQUFNLFdBQVcsR0FBRyxxQkFBUyxDQUFBOztBQUU3QixJQUFJLFFBQVEsR0FBRztBQUNiLFFBQU0sRUFBRSxFQUFFO0FBQ1YsU0FBTyxFQUFFLEVBQUU7Q0FDWixDQUFBOztxQkFFYyxRQUFROztBQUVoQixTQUFTLFdBQVcsQ0FBQyxNQUFNLEVBQUM7QUFDakMsU0FBTyxNQUFNLEdBQUcsS0FBSyxDQUFDLE1BQU0sQ0FBQyxHQUFHLE1BQU0sQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLE1BQU0sQ0FBQyxDQUFDLEdBQUcsQ0FBQyxVQUFBLEdBQUc7V0FBSSxRQUFRLENBQUMsTUFBTSxDQUFDLEdBQUcsQ0FBQztHQUFBLENBQUMsQ0FBQTtDQUM5Rjs7QUFFTSxTQUFTLFFBQVEsQ0FBQyxJQUFJLEVBQUM7QUFDNUIsTUFBSSxVQUFVLEdBQUcsZUFBZSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQTs7QUFFM0MsTUFBRyxVQUFVLElBQUksVUFBVSxDQUFDLFVBQVUsRUFBQztBQUNyQyxZQUFRLENBQUMsVUFBVSxDQUFDLENBQUE7R0FDckI7Q0FDRjs7QUFFTSxTQUFTLEtBQUssQ0FBQyxlQUFlLEVBQWE7TUFBWCxLQUFLLHlEQUFDLElBQUk7O0FBQy9DLE1BQUksTUFBTSxHQUFHLFFBQVEsQ0FBQyxNQUFNLENBQUE7QUFDNUIsTUFBSSxLQUFLLEdBQUcsUUFBUSxDQUFDLE9BQU8sQ0FBQyxlQUFlLENBQUMsQ0FBQTs7QUFFN0MsTUFBRyxNQUFNLENBQUMsZUFBZSxDQUFDLEVBQUM7QUFDekIsV0FBTyxNQUFNLENBQUMsZUFBZSxDQUFDLENBQUE7R0FDL0I7O0FBRUQsTUFBRyxLQUFLLEVBQUM7QUFDUCxRQUFHLE1BQU0sQ0FBQyxLQUFLLENBQUMsRUFBRTtBQUFFLGFBQU8sTUFBTSxDQUFDLEtBQUssQ0FBQyxDQUFBO0tBQUU7R0FDM0M7O0FBRUQsTUFBRyxDQUFDLEtBQUssRUFBRTtBQUFFLFdBQU07R0FBRTs7QUFFckIsTUFBSSxNQUFNLEdBQUcsS0FBSyxDQUFDLFdBQVcsQ0FBQyxXQUFXLENBQUMsZUFBZSxDQUFDLENBQUMsV0FBVyxFQUFFLEVBQUUsS0FBSyxDQUFDLENBQUE7O0FBRWpGLE1BQUcsTUFBTSxFQUFFO0FBQUUsV0FBTyxNQUFNLENBQUE7R0FBRTtDQUM3Qjs7QUFFTSxTQUFTLFFBQVEsQ0FBQyxVQUFVLEVBQUM7QUFDbEMsVUFBUSxDQUFDLE1BQU0sQ0FBQyxVQUFVLENBQUMsSUFBSSxDQUFDLEdBQUcsVUFBVSxDQUFBO0FBQzdDLFVBQVEsQ0FBQyxPQUFPLENBQUMsVUFBVSxDQUFDLFVBQVUsQ0FBQyxHQUFHLFVBQVUsQ0FBQyxJQUFJLENBQUE7QUFDekQsU0FBTyxVQUFVLENBQUE7Q0FDbEIiLCJmaWxlIjoibW9kZWxfcmVnaXN0cnkuanMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgaW5mbGVjdCBmcm9tICdpJ1xuaW1wb3J0IGZzIGZyb20gJ2ZzJ1xuXG5jb25zdCBpbmZsZWN0aW9ucyA9IGluZmxlY3QoKVxuXG5sZXQgcmVnaXN0cnkgPSB7XG4gIG1vZGVsczoge30sXG4gIGFsaWFzZXM6IHt9XG59XG5cbmV4cG9ydCBkZWZhdWx0IHJlZ2lzdHJ5XG5cbmV4cG9ydCBmdW5jdGlvbiBkZWZpbml0aW9ucyhmaW5kZXIpe1xuICByZXR1cm4gZmluZGVyID8gbW9kZWwoZmluZGVyKSA6IE9iamVjdC5rZXlzKHJlZ2lzdHJ5Lm1vZGVscykubWFwKGtleSA9PiByZWdpc3RyeS5tb2RlbHNba2V5XSlcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGxvYWRQYXRoKHBhdGgpe1xuICBsZXQgZGVmaW5pdGlvbiA9IE1vZGVsRGVmaW5pdGlvbi5sb2FkKHBhdGgpXG4gIFxuICBpZihkZWZpbml0aW9uICYmIGRlZmluaXRpb24udHlwZV9hbGlhcyl7XG4gICAgcmVnaXN0ZXIoZGVmaW5pdGlvbilcbiAgfVxufVxuXG5leHBvcnQgZnVuY3Rpb24gbW9kZWwobmFtZU9yVHlwZUFsaWFzLCBndWVzcz10cnVlKXtcbiAgbGV0IG1vZGVscyA9IHJlZ2lzdHJ5Lm1vZGVsc1xuICBsZXQgYWxpYXMgPSByZWdpc3RyeS5hbGlhc2VzW25hbWVPclR5cGVBbGlhc11cblxuICBpZihtb2RlbHNbbmFtZU9yVHlwZUFsaWFzXSl7XG4gICAgcmV0dXJuIG1vZGVsc1tuYW1lT3JUeXBlQWxpYXNdXG4gIH1cbiAgXG4gIGlmKGFsaWFzKXtcbiAgICBpZihtb2RlbHNbYWxpYXNdKSB7IHJldHVybiBtb2RlbHNbYWxpYXNdIH1cbiAgfVxuXG4gIGlmKCFndWVzcykgeyByZXR1cm4gfVxuXG4gIGxldCByZXN1bHQgPSBtb2RlbChpbmZsZWN0aW9ucy5zaW5ndWxhcml6ZShuYW1lT3JUeXBlQWxpYXMpLnRvTG93ZXJDYXNlKCksIGZhbHNlKVxuXG4gIGlmKHJlc3VsdCkgeyByZXR1cm4gcmVzdWx0IH1cbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHJlZ2lzdGVyKGRlZmluaXRpb24pe1xuICByZWdpc3RyeS5tb2RlbHNbZGVmaW5pdGlvbi5uYW1lXSA9IGRlZmluaXRpb25cbiAgcmVnaXN0cnkuYWxpYXNlc1tkZWZpbml0aW9uLnR5cGVfYWxpYXNdID0gZGVmaW5pdGlvbi5uYW1lXG4gIHJldHVybiBkZWZpbml0aW9uXG59XG4iXX0=