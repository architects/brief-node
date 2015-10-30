"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

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
    key: "languages",
    get: function get() {
      return Object.keys(this.blocks);
    }
  }, {
    key: "elements",
    get: function get() {
      return this.model.document.getCodeBlocks();
    }
  }]);

  return CodeExtraction;
})();

exports.CodeExtraction = CodeExtraction;

var ExtractionRule = (function () {
  function ExtractionRule() {
    _classCallCheck(this, ExtractionRule);
  }

  _createClass(ExtractionRule, [{
    key: "first",
    value: function first(selector) {
      this.type = "single";
      this.selector = selector;
      return this;
    }
  }, {
    key: "all",
    value: function all(selector) {
      this.type = "multiple";
      this.selector = selector;
      return this;
    }
  }, {
    key: "as",
    value: function as(attributeName) {
      this.attributeName = attributeName;
      this.valid = true;
      return this;
    }
  }, {
    key: "the",
    get: function get() {
      return this;
    }
  }]);

  return ExtractionRule;
})();

exports.ExtractionRule = ExtractionRule;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3NyYy9leHRyYWN0aW9ucy5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7MEJBQWMsWUFBWTs7OztJQUViLGNBQWM7QUFDZCxXQURBLGNBQWMsQ0FDYixLQUFLLEVBQUM7OzswQkFEUCxjQUFjOztBQUV2QixRQUFJLENBQUMsS0FBSyxHQUFHLEtBQUssQ0FBQTs7QUFFbEIsUUFBSSxDQUFDLE1BQU0sR0FBRyxFQUFFLENBQUE7O0FBRWhCLFFBQUksQ0FBQyxRQUFRLENBQUMsR0FBRyxDQUFDLFVBQUEsRUFBRSxFQUFJO0FBQ3RCLFVBQUksTUFBTSxHQUFHLE1BQUssTUFBTSxDQUFDLEVBQUUsQ0FBQyxJQUFJLENBQUMsR0FBRyxNQUFLLE1BQU0sQ0FBQyxFQUFFLENBQUMsSUFBSSxDQUFDLElBQUksRUFBRSxDQUFBO0FBQzlELFlBQU0sQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLEtBQUssQ0FBQyxDQUFBO0tBQ3RCLENBQUMsQ0FBQTs7QUFFRixRQUFJLFVBQVUsR0FBRyxJQUFJLENBQUE7O0FBRXJCLFFBQUksQ0FBQyxTQUFTLENBQUMsT0FBTyxDQUFDLFVBQUEsSUFBSSxFQUFJO0FBQzdCLFlBQU0sQ0FBQyxjQUFjLFFBQU8sSUFBSSxFQUFFO0FBQ2hDLG9CQUFZLEVBQUUsSUFBSTtBQUNsQixXQUFHLEVBQUUsZUFBVTtBQUNiLGlCQUFPLFVBQVUsQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLENBQUE7U0FDL0I7T0FDRixDQUFDLENBQUE7S0FDSCxDQUFDLENBQUE7R0FDSDs7ZUFyQlUsY0FBYzs7U0F1QlosZUFBRTtBQUNiLGFBQU8sTUFBTSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUE7S0FDaEM7OztTQUVXLGVBQUU7QUFDWixhQUFPLElBQUksQ0FBQyxLQUFLLENBQUMsUUFBUSxDQUFDLGFBQWEsRUFBRSxDQUFBO0tBQzNDOzs7U0E3QlUsY0FBYzs7Ozs7SUFnQ2QsY0FBYztXQUFkLGNBQWM7MEJBQWQsY0FBYzs7O2VBQWQsY0FBYzs7V0FPcEIsZUFBQyxRQUFRLEVBQUM7QUFDYixVQUFJLENBQUMsSUFBSSxHQUFHLFFBQVEsQ0FBQTtBQUNwQixVQUFJLENBQUMsUUFBUSxHQUFHLFFBQVEsQ0FBQTtBQUN4QixhQUFPLElBQUksQ0FBQTtLQUNaOzs7V0FFRSxhQUFDLFFBQVEsRUFBQztBQUNYLFVBQUksQ0FBQyxJQUFJLEdBQUcsVUFBVSxDQUFBO0FBQ3RCLFVBQUksQ0FBQyxRQUFRLEdBQUcsUUFBUSxDQUFBO0FBQ3hCLGFBQU8sSUFBSSxDQUFBO0tBQ1o7OztXQUVDLFlBQUMsYUFBYSxFQUFDO0FBQ2YsVUFBSSxDQUFDLGFBQWEsR0FBRyxhQUFhLENBQUE7QUFDbEMsVUFBSSxDQUFDLEtBQUssR0FBRyxJQUFJLENBQUE7QUFDakIsYUFBTyxJQUFJLENBQUE7S0FDWjs7O1NBbEJNLGVBQUU7QUFBRSxhQUFPLElBQUksQ0FBQTtLQUFFOzs7U0FMYixjQUFjIiwiZmlsZSI6ImV4dHJhY3Rpb25zLmpzIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IF8gZnJvbSAndW5kZXJzY29yZSdcblxuZXhwb3J0IGNsYXNzIENvZGVFeHRyYWN0aW9uIHtcbiAgY29uc3RydWN0b3IobW9kZWwpe1xuICAgIHRoaXMubW9kZWwgPSBtb2RlbFxuICAgIFxuICAgIHRoaXMuYmxvY2tzID0ge31cblxuICAgIHRoaXMuZWxlbWVudHMubWFwKGVsID0+IHtcbiAgICAgIGxldCBidWNrZXQgPSB0aGlzLmJsb2Nrc1tlbC5sYW5nXSA9IHRoaXMuYmxvY2tzW2VsLmxhbmddIHx8IFtdXG4gICAgICBidWNrZXQucHVzaChlbC52YWx1ZSlcbiAgICB9KVxuICAgIFxuICAgIGxldCBleHRyYWN0aW9uID0gdGhpc1xuXG4gICAgdGhpcy5sYW5ndWFnZXMuZm9yRWFjaChsYW5nID0+IHtcbiAgICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eSh0aGlzLCBsYW5nLCB7XG4gICAgICAgIGNvbmZpZ3VyYWJsZTogdHJ1ZSxcbiAgICAgICAgZ2V0OiBmdW5jdGlvbigpe1xuICAgICAgICAgIHJldHVybiBleHRyYWN0aW9uLmJsb2Nrc1tsYW5nXVxuICAgICAgICB9XG4gICAgICB9KVxuICAgIH0pXG4gIH1cbiAgXG4gIGdldCBsYW5ndWFnZXMoKXtcbiAgICByZXR1cm4gT2JqZWN0LmtleXModGhpcy5ibG9ja3MpXG4gIH1cblxuICBnZXQgZWxlbWVudHMoKXtcbiAgICByZXR1cm4gdGhpcy5tb2RlbC5kb2N1bWVudC5nZXRDb2RlQmxvY2tzKClcbiAgfVxufVxuXG5leHBvcnQgY2xhc3MgRXh0cmFjdGlvblJ1bGUge1xuICB0eXBlOiBcInNpbmdsZVwiXG5cbiAgdmFsaWQ6IGZhbHNlXG5cbiAgZ2V0IHRoZSgpeyByZXR1cm4gdGhpcyB9XG5cbiAgZmlyc3Qoc2VsZWN0b3Ipe1xuICAgIHRoaXMudHlwZSA9IFwic2luZ2xlXCJcbiAgICB0aGlzLnNlbGVjdG9yID0gc2VsZWN0b3JcbiAgICByZXR1cm4gdGhpc1xuICB9XG4gIFxuICBhbGwoc2VsZWN0b3Ipe1xuICAgIHRoaXMudHlwZSA9IFwibXVsdGlwbGVcIlxuICAgIHRoaXMuc2VsZWN0b3IgPSBzZWxlY3RvclxuICAgIHJldHVybiB0aGlzXG4gIH1cblxuICBhcyhhdHRyaWJ1dGVOYW1lKXtcbiAgICB0aGlzLmF0dHJpYnV0ZU5hbWUgPSBhdHRyaWJ1dGVOYW1lXG4gICAgdGhpcy52YWxpZCA9IHRydWVcbiAgICByZXR1cm4gdGhpc1xuICB9XG59XG4iXX0=