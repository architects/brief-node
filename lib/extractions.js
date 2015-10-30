'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var _underscore = require('underscore');

var _underscore2 = _interopRequireDefault(_underscore);

var CodeExtraction = (function () {
  function CodeExtraction(model) {
    var _this = this;

    _classCallCheck(this, CodeExtraction);

    this.model = model;

    this.blocks = {};

    this.elements.map(function (el) {
      var bucket = _this.blocks[el.lang] = _this.blocks[el.lang] || [];
      bucket.push(el.value);
    });

    var extraction = this;

    this.languages.forEach(function (lang) {
      Object.defineProperty(_this, lang, {
        configurable: true,
        get: function get() {
          return extraction.blocks[lang];
        }
      });
    });
  }

  _createClass(CodeExtraction, [{
    key: 'languages',
    get: function get() {
      return Object.keys(this.blocks);
    }
  }, {
    key: 'elements',
    get: function get() {
      return this.model.document.getCodeBlocks();
    }
  }]);

  return CodeExtraction;
})();

exports.CodeExtraction = CodeExtraction;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3NyYy9leHRyYWN0aW9ucy5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7MEJBQWMsWUFBWTs7OztJQUViLGNBQWM7QUFDZCxXQURBLGNBQWMsQ0FDYixLQUFLLEVBQUM7OzswQkFEUCxjQUFjOztBQUV2QixRQUFJLENBQUMsS0FBSyxHQUFHLEtBQUssQ0FBQTs7QUFFbEIsUUFBSSxDQUFDLE1BQU0sR0FBRyxFQUFFLENBQUE7O0FBRWhCLFFBQUksQ0FBQyxRQUFRLENBQUMsR0FBRyxDQUFDLFVBQUEsRUFBRSxFQUFJO0FBQ3RCLFVBQUksTUFBTSxHQUFHLE1BQUssTUFBTSxDQUFDLEVBQUUsQ0FBQyxJQUFJLENBQUMsR0FBRyxNQUFLLE1BQU0sQ0FBQyxFQUFFLENBQUMsSUFBSSxDQUFDLElBQUksRUFBRSxDQUFBO0FBQzlELFlBQU0sQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLEtBQUssQ0FBQyxDQUFBO0tBQ3RCLENBQUMsQ0FBQTs7QUFFRixRQUFJLFVBQVUsR0FBRyxJQUFJLENBQUE7O0FBRXJCLFFBQUksQ0FBQyxTQUFTLENBQUMsT0FBTyxDQUFDLFVBQUEsSUFBSSxFQUFJO0FBQzdCLFlBQU0sQ0FBQyxjQUFjLFFBQU8sSUFBSSxFQUFFO0FBQ2hDLG9CQUFZLEVBQUUsSUFBSTtBQUNsQixXQUFHLEVBQUUsZUFBVTtBQUNiLGlCQUFPLFVBQVUsQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLENBQUE7U0FDL0I7T0FDRixDQUFDLENBQUE7S0FDSCxDQUFDLENBQUE7R0FDSDs7ZUFyQlUsY0FBYzs7U0F1QlosZUFBRTtBQUNiLGFBQU8sTUFBTSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUE7S0FDaEM7OztTQUVXLGVBQUU7QUFDWixhQUFPLElBQUksQ0FBQyxLQUFLLENBQUMsUUFBUSxDQUFDLGFBQWEsRUFBRSxDQUFBO0tBQzNDOzs7U0E3QlUsY0FBYyIsImZpbGUiOiJleHRyYWN0aW9ucy5qcyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCBfIGZyb20gJ3VuZGVyc2NvcmUnXG5cbmV4cG9ydCBjbGFzcyBDb2RlRXh0cmFjdGlvbiB7XG4gIGNvbnN0cnVjdG9yKG1vZGVsKXtcbiAgICB0aGlzLm1vZGVsID0gbW9kZWxcbiAgICBcbiAgICB0aGlzLmJsb2NrcyA9IHt9XG5cbiAgICB0aGlzLmVsZW1lbnRzLm1hcChlbCA9PiB7XG4gICAgICBsZXQgYnVja2V0ID0gdGhpcy5ibG9ja3NbZWwubGFuZ10gPSB0aGlzLmJsb2Nrc1tlbC5sYW5nXSB8fCBbXVxuICAgICAgYnVja2V0LnB1c2goZWwudmFsdWUpXG4gICAgfSlcbiAgICBcbiAgICBsZXQgZXh0cmFjdGlvbiA9IHRoaXNcblxuICAgIHRoaXMubGFuZ3VhZ2VzLmZvckVhY2gobGFuZyA9PiB7XG4gICAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkodGhpcywgbGFuZywge1xuICAgICAgICBjb25maWd1cmFibGU6IHRydWUsXG4gICAgICAgIGdldDogZnVuY3Rpb24oKXtcbiAgICAgICAgICByZXR1cm4gZXh0cmFjdGlvbi5ibG9ja3NbbGFuZ11cbiAgICAgICAgfVxuICAgICAgfSlcbiAgICB9KVxuICB9XG4gIFxuICBnZXQgbGFuZ3VhZ2VzKCl7XG4gICAgcmV0dXJuIE9iamVjdC5rZXlzKHRoaXMuYmxvY2tzKVxuICB9XG5cbiAgZ2V0IGVsZW1lbnRzKCl7XG4gICAgcmV0dXJuIHRoaXMubW9kZWwuZG9jdW1lbnQuZ2V0Q29kZUJsb2NrcygpXG4gIH1cbn1cbiJdfQ==