'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

exports['default'] = {
  decorate: function decorate(briefcase, registry) {
    var viewsInterface = Object.defineProperties({

      define: function define(viewName, fn) {
        registry[viewName] = fn;
      },

      fromPath: function fromPath(file) {
        var options = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

        var loaded = require(file);
        var viewName = loaded.label || _path2['default'].basename(file).replace(/.js/, '');
        registry[viewName] = loaded;
      },

      render: function render(viewName, params, document, briefcase) {
        if (!registry[viewName]) {
          return 'error: missing ' + viewName;
        }

        return registry[viewName].call(briefcase, params, document, briefcase);
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
      views: {
        get: function get() {
          return viewsInterface;
        },
        configurable: true,
        enumerable: true
      }
    }));
  }
};
module.exports = exports['default'];
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9oZWxwZXJzL3ZpZXdzLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7O29CQUFpQixNQUFNOzs7O2tCQUNSLElBQUk7Ozs7cUJBRUo7QUFDYixVQUFRLEVBQUUsa0JBQVMsU0FBUyxFQUFFLFFBQVEsRUFBQztBQUNyQyxRQUFJLGNBQWMsMkJBQUc7O0FBS25CLFlBQU0sRUFBQSxnQkFBQyxRQUFRLEVBQUUsRUFBRSxFQUFDO0FBQ2xCLGdCQUFRLENBQUMsUUFBUSxDQUFDLEdBQUcsRUFBRSxDQUFBO09BQ3hCOztBQUVELGNBQVEsRUFBQSxrQkFBQyxJQUFJLEVBQWE7WUFBWCxPQUFPLHlEQUFDLEVBQUU7O0FBQ3ZCLFlBQUksTUFBTSxHQUFHLE9BQU8sQ0FBQyxJQUFJLENBQUMsQ0FBQTtBQUMxQixZQUFJLFFBQVEsR0FBRyxNQUFNLENBQUMsS0FBSyxJQUFJLGtCQUFLLFFBQVEsQ0FBQyxJQUFJLENBQUMsQ0FBQyxPQUFPLENBQUMsS0FBSyxFQUFDLEVBQUUsQ0FBQyxDQUFBO0FBQ3BFLGdCQUFRLENBQUMsUUFBUSxDQUFDLEdBQUcsTUFBTSxDQUFBO09BQzVCOztBQUVELFlBQU0sRUFBQSxnQkFBQyxRQUFRLEVBQUUsTUFBTSxFQUFFLFFBQVEsRUFBRSxTQUFTLEVBQUM7QUFDM0MsWUFBRyxDQUFDLFFBQVEsQ0FBQyxRQUFRLENBQUMsRUFBQztBQUNyQixpQkFBTyxpQkFBaUIsR0FBRyxRQUFRLENBQUE7U0FDcEM7O0FBRUQsZUFBTyxRQUFRLENBQUMsUUFBUSxDQUFDLENBQUMsSUFBSSxDQUFDLFNBQVMsRUFBRSxNQUFNLEVBQUUsUUFBUSxFQUFFLFNBQVMsQ0FBQyxDQUFBO09BQ3ZFO0tBQ0Y7QUFyQkssZUFBUzthQUFBLGVBQUU7QUFDYixpQkFBTyxNQUFNLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxDQUFBO1NBQzdCOzs7O01BbUJGLENBQUE7O0FBRUQsVUFBTSxDQUFDLE1BQU0sQ0FBQyxTQUFTLDBCQUFFLEVBSXhCO0FBSEssV0FBSzthQUFBLGVBQUU7QUFDVCxpQkFBTyxjQUFjLENBQUE7U0FDdEI7Ozs7T0FDRCxDQUFBO0dBQ0g7Q0FDRiIsImZpbGUiOiJ2aWV3cy5qcyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCBwYXRoIGZyb20gJ3BhdGgnXG5pbXBvcnQgZnMgZnJvbSAnZnMnXG5cbmV4cG9ydCBkZWZhdWx0IHtcbiAgZGVjb3JhdGU6IGZ1bmN0aW9uKGJyaWVmY2FzZSwgcmVnaXN0cnkpe1xuICAgIGxldCB2aWV3c0ludGVyZmFjZSA9IHtcbiAgICAgIGdldCBhdmFpbGFibGUoKXtcbiAgICAgICAgcmV0dXJuIE9iamVjdC5rZXlzKHJlZ2lzdHJ5KVxuICAgICAgfSxcblxuICAgICAgZGVmaW5lKHZpZXdOYW1lLCBmbil7XG4gICAgICAgIHJlZ2lzdHJ5W3ZpZXdOYW1lXSA9IGZuXG4gICAgICB9LFxuXG4gICAgICBmcm9tUGF0aChmaWxlLCBvcHRpb25zPXt9KXtcbiAgICAgICAgbGV0IGxvYWRlZCA9IHJlcXVpcmUoZmlsZSlcbiAgICAgICAgbGV0IHZpZXdOYW1lID0gbG9hZGVkLmxhYmVsIHx8IHBhdGguYmFzZW5hbWUoZmlsZSkucmVwbGFjZSgvLmpzLywnJylcbiAgICAgICAgcmVnaXN0cnlbdmlld05hbWVdID0gbG9hZGVkXG4gICAgICB9LFxuXG4gICAgICByZW5kZXIodmlld05hbWUsIHBhcmFtcywgZG9jdW1lbnQsIGJyaWVmY2FzZSl7XG4gICAgICAgIGlmKCFyZWdpc3RyeVt2aWV3TmFtZV0pe1xuICAgICAgICAgIHJldHVybiAnZXJyb3I6IG1pc3NpbmcgJyArIHZpZXdOYW1lXG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gcmVnaXN0cnlbdmlld05hbWVdLmNhbGwoYnJpZWZjYXNlLCBwYXJhbXMsIGRvY3VtZW50LCBicmllZmNhc2UpXG4gICAgICB9XG4gICAgfVxuXG4gICAgT2JqZWN0LmFzc2lnbihicmllZmNhc2UsIHtcbiAgICAgIGdldCB2aWV3cygpe1xuICAgICAgICByZXR1cm4gdmlld3NJbnRlcmZhY2VcbiAgICAgIH1cbiAgICB9KVxuICB9XG59XG4iXX0=