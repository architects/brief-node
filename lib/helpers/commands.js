'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});
exports['default'] = {
  decorate: function decorate(briefcase, registry) {
    var commandsInterface = Object.defineProperties({

      run: function run(commandName, params) {
        return registry[commandName].call(briefcase, params);
      },

      fromPath: function fromPath(file) {
        var options = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

        var loaded = require(file);
        var viewName = loaded.label || path.basename(file).replace(/.js/, '');
        registry[viewName] = loaded;
      }
    }, {
      available: {
        get: function get() {
          return Object.keys(registry);
        },
        configurable: true,
        enumerable: true
      }
    });

    Object.assign(briefcase, Object.defineProperties({}, {
      commands: {
        get: function get() {
          return commandsInterface;
        },
        configurable: true,
        enumerable: true
      }
    }));
  }
};
module.exports = exports['default'];
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9oZWxwZXJzL2NvbW1hbmRzLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7O3FCQUFlO0FBQ2IsVUFBUSxFQUFFLGtCQUFTLFNBQVMsRUFBRSxRQUFRLEVBQUM7QUFDckMsUUFBSSxpQkFBaUIsMkJBQUc7O0FBS3RCLFNBQUcsRUFBQSxhQUFDLFdBQVcsRUFBRSxNQUFNLEVBQUM7QUFDdEIsZUFBTyxRQUFRLENBQUMsV0FBVyxDQUFDLENBQUMsSUFBSSxDQUFDLFNBQVMsRUFBRSxNQUFNLENBQUMsQ0FBQTtPQUNyRDs7QUFFRCxjQUFRLEVBQUEsa0JBQUMsSUFBSSxFQUFhO1lBQVgsT0FBTyx5REFBQyxFQUFFOztBQUN2QixZQUFJLE1BQU0sR0FBRyxPQUFPLENBQUMsSUFBSSxDQUFDLENBQUE7QUFDMUIsWUFBSSxRQUFRLEdBQUcsTUFBTSxDQUFDLEtBQUssSUFBSSxJQUFJLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxDQUFDLE9BQU8sQ0FBQyxLQUFLLEVBQUMsRUFBRSxDQUFDLENBQUE7QUFDcEUsZ0JBQVEsQ0FBQyxRQUFRLENBQUMsR0FBRyxNQUFNLENBQUE7T0FDNUI7S0FDRjtBQWJLLGVBQVM7YUFBQSxlQUFFO0FBQ2IsaUJBQU8sTUFBTSxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsQ0FBQTtTQUM3Qjs7OztNQVdGLENBQUE7O0FBRUQsVUFBTSxDQUFDLE1BQU0sQ0FBQyxTQUFTLDBCQUFFLEVBSXhCO0FBSEssY0FBUTthQUFBLGVBQUU7QUFDWixpQkFBTyxpQkFBaUIsQ0FBQTtTQUN6Qjs7OztPQUNELENBQUE7R0FDSDtDQUNGIiwiZmlsZSI6ImNvbW1hbmRzLmpzIiwic291cmNlc0NvbnRlbnQiOlsiZXhwb3J0IGRlZmF1bHQge1xuICBkZWNvcmF0ZTogZnVuY3Rpb24oYnJpZWZjYXNlLCByZWdpc3RyeSl7XG4gICAgbGV0IGNvbW1hbmRzSW50ZXJmYWNlID0ge1xuICAgICAgZ2V0IGF2YWlsYWJsZSgpe1xuICAgICAgICByZXR1cm4gT2JqZWN0LmtleXMocmVnaXN0cnkpXG4gICAgICB9LFxuXG4gICAgICBydW4oY29tbWFuZE5hbWUsIHBhcmFtcyl7XG4gICAgICAgIHJldHVybiByZWdpc3RyeVtjb21tYW5kTmFtZV0uY2FsbChicmllZmNhc2UsIHBhcmFtcylcbiAgICAgIH0sXG5cbiAgICAgIGZyb21QYXRoKGZpbGUsIG9wdGlvbnM9e30pe1xuICAgICAgICBsZXQgbG9hZGVkID0gcmVxdWlyZShmaWxlKVxuICAgICAgICBsZXQgdmlld05hbWUgPSBsb2FkZWQubGFiZWwgfHwgcGF0aC5iYXNlbmFtZShmaWxlKS5yZXBsYWNlKC8uanMvLCcnKVxuICAgICAgICByZWdpc3RyeVt2aWV3TmFtZV0gPSBsb2FkZWRcbiAgICAgIH1cbiAgICB9XG5cbiAgICBPYmplY3QuYXNzaWduKGJyaWVmY2FzZSwge1xuICAgICAgZ2V0IGNvbW1hbmRzKCl7XG4gICAgICAgIHJldHVybiBjb21tYW5kc0ludGVyZmFjZVxuICAgICAgfVxuICAgIH0pXG4gIH1cbn1cbiJdfQ==