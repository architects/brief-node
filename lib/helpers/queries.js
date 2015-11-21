'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});
exports['default'] = {
  decorate: function decorate(briefcase, registry) {
    var queriesInterface = Object.defineProperties({

      define: function define(queryName, fn) {
        registry[queryName] = fn;
      },

      fromPath: function fromPath(file) {
        var options = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

        var loaded = require(file);
        var viewName = loaded.label || path.basename(file).replace(/.js/, '');
        registry[viewName] = loaded;
      },

      run: function run(queryName, params) {
        return registry[queryName].call(briefcase, params);
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
      queries: {
        get: function get() {
          return queriesInterface;
        },
        configurable: true,
        enumerable: true
      }
    }));
  }
};
module.exports = exports['default'];
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9oZWxwZXJzL3F1ZXJpZXMuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7cUJBQWU7QUFDYixVQUFRLEVBQUUsa0JBQVMsU0FBUyxFQUFFLFFBQVEsRUFBQztBQUNyQyxRQUFJLGdCQUFnQiwyQkFBRzs7QUFLckIsWUFBTSxFQUFBLGdCQUFDLFNBQVMsRUFBRSxFQUFFLEVBQUM7QUFDbkIsZ0JBQVEsQ0FBQyxTQUFTLENBQUMsR0FBRyxFQUFFLENBQUE7T0FDekI7O0FBRUQsY0FBUSxFQUFBLGtCQUFDLElBQUksRUFBYTtZQUFYLE9BQU8seURBQUMsRUFBRTs7QUFDdkIsWUFBSSxNQUFNLEdBQUcsT0FBTyxDQUFDLElBQUksQ0FBQyxDQUFBO0FBQzFCLFlBQUksUUFBUSxHQUFHLE1BQU0sQ0FBQyxLQUFLLElBQUksSUFBSSxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsQ0FBQyxPQUFPLENBQUMsS0FBSyxFQUFDLEVBQUUsQ0FBQyxDQUFBO0FBQ3BFLGdCQUFRLENBQUMsUUFBUSxDQUFDLEdBQUcsTUFBTSxDQUFBO09BQzVCOztBQUVELFNBQUcsRUFBQSxhQUFDLFNBQVMsRUFBRSxNQUFNLEVBQUM7QUFDcEIsZUFBTyxRQUFRLENBQUMsU0FBUyxDQUFDLENBQUMsSUFBSSxDQUFDLFNBQVMsRUFBRSxNQUFNLENBQUMsQ0FBQTtPQUNuRDtLQUNGO0FBakJLLGVBQVM7YUFBQSxlQUFFO0FBQ2IsaUJBQU8sTUFBTSxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsQ0FBQTtTQUM3Qjs7OztNQWVGLENBQUE7O0FBRUQsVUFBTSxDQUFDLE1BQU0sQ0FBQyxTQUFTLDBCQUFFLEVBSXhCO0FBSEssYUFBTzthQUFBLGVBQUU7QUFDWCxpQkFBTyxnQkFBZ0IsQ0FBQTtTQUN4Qjs7OztPQUNELENBQUE7R0FDSDtDQUNGIiwiZmlsZSI6InF1ZXJpZXMuanMiLCJzb3VyY2VzQ29udGVudCI6WyJleHBvcnQgZGVmYXVsdCB7XG4gIGRlY29yYXRlOiBmdW5jdGlvbihicmllZmNhc2UsIHJlZ2lzdHJ5KXtcbiAgICBsZXQgcXVlcmllc0ludGVyZmFjZSA9IHtcbiAgICAgIGdldCBhdmFpbGFibGUoKXtcbiAgICAgICAgcmV0dXJuIE9iamVjdC5rZXlzKHJlZ2lzdHJ5KVxuICAgICAgfSxcblxuICAgICAgZGVmaW5lKHF1ZXJ5TmFtZSwgZm4pe1xuICAgICAgICByZWdpc3RyeVtxdWVyeU5hbWVdID0gZm5cbiAgICAgIH0sXG5cbiAgICAgIGZyb21QYXRoKGZpbGUsIG9wdGlvbnM9e30pe1xuICAgICAgICBsZXQgbG9hZGVkID0gcmVxdWlyZShmaWxlKVxuICAgICAgICBsZXQgdmlld05hbWUgPSBsb2FkZWQubGFiZWwgfHwgcGF0aC5iYXNlbmFtZShmaWxlKS5yZXBsYWNlKC8uanMvLCcnKVxuICAgICAgICByZWdpc3RyeVt2aWV3TmFtZV0gPSBsb2FkZWRcbiAgICAgIH0sXG5cbiAgICAgIHJ1bihxdWVyeU5hbWUsIHBhcmFtcyl7XG4gICAgICAgIHJldHVybiByZWdpc3RyeVtxdWVyeU5hbWVdLmNhbGwoYnJpZWZjYXNlLCBwYXJhbXMpXG4gICAgICB9XG4gICAgfVxuXG4gICAgT2JqZWN0LmFzc2lnbihicmllZmNhc2UsIHtcbiAgICAgIGdldCBxdWVyaWVzKCl7XG4gICAgICAgIHJldHVybiBxdWVyaWVzSW50ZXJmYWNlXG4gICAgICB9XG4gICAgfSlcbiAgfVxufVxuIl19