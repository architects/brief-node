"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var _underscoreString = require('underscore.string');

var _underscoreString2 = _interopRequireDefault(_underscoreString);

var Presenter = (function () {
  _createClass(Presenter, null, [{
    key: "present",
    value: function present(document) {
      var options = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

      return new Presenter(document, options);
    }
  }, {
    key: "loadFromDisk",
    value: function loadFromDisk(repositoryFolder) {
      var options = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];
    }
  }]);

  function Presenter(document) {
    var options = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

    _classCallCheck(this, Presenter);

    this.document = document;
    this.options = options;
    this.output = options.output || "console";
  }

  _createClass(Presenter, [{
    key: "children",
    value: function children() {
      this.document.getChildren();
    }

    /**
     * find the heading you want by its relative
     * positional index within the document
    */
  }, {
    key: "getHeadingByIndex",
    value: function getHeadingByIndex(index) {
      return this.document.getHeadingNodes().find(function (node) {
        return node.headingIndex == index;
      });
    }
  }, {
    key: "getNextHeading",
    value: function getNextHeading(from) {
      var index = from.headingIndex;
      var nextHeading = this.getHeadingByIndex(index + 1);

      if (nextHeading) return nextHeading;
    }
  }, {
    key: "viewHeadings",
    value: function viewHeadings() {
      var base = "";
      var indentation = "";
      var headings = this.document.getHeadingNodes();
      var report = [];

      headings.forEach(function (heading) {
        indentation = (heading.depth - 1) * 2;
        var value = heading.children[0].value;
        value = heading.headingIndex + ' ' + value;
        report.push(_underscoreString2["default"].repeat(' ', indentation) + value);
      });

      if (this.output === "console") {
        console.log(report.join("\n"));
      }

      return report;
    }
  }]);

  return Presenter;
})();

exports["default"] = Presenter;
module.exports = exports["default"];
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3NyYy9wcmVzZW50ZXIuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7O2dDQUFtQixtQkFBbUI7Ozs7SUFFakIsU0FBUztlQUFULFNBQVM7O1dBQ2QsaUJBQUMsUUFBUSxFQUFjO1VBQVosT0FBTyx5REFBQyxFQUFFOztBQUNuQyxhQUFPLElBQUksU0FBUyxDQUFDLFFBQVEsRUFBRSxPQUFPLENBQUMsQ0FBQTtLQUN2Qzs7O1dBRW1CLHNCQUFDLGdCQUFnQixFQUFjO1VBQVosT0FBTyx5REFBQyxFQUFFO0tBRWhEOzs7QUFFVyxXQVRRLFNBQVMsQ0FTaEIsUUFBUSxFQUFnQjtRQUFkLE9BQU8seURBQUcsRUFBRTs7MEJBVGYsU0FBUzs7QUFVNUIsUUFBSSxDQUFDLFFBQVEsR0FBRyxRQUFRLENBQUE7QUFDeEIsUUFBSSxDQUFDLE9BQU8sR0FBRyxPQUFPLENBQUE7QUFDcEIsUUFBSSxDQUFDLE1BQU0sR0FBRyxPQUFPLENBQUMsTUFBTSxJQUFJLFNBQVMsQ0FBQTtHQUMzQzs7ZUFibUIsU0FBUzs7V0FlcEIsb0JBQUU7QUFDVixVQUFJLENBQUMsUUFBUSxDQUFDLFdBQVcsRUFBRSxDQUFBO0tBQzNCOzs7Ozs7OztXQU1rQiwyQkFBQyxLQUFLLEVBQUM7QUFDdkIsYUFBTyxJQUFJLENBQUMsUUFBUSxDQUFDLGVBQWUsRUFBRSxDQUFDLElBQUksQ0FBQyxVQUFBLElBQUk7ZUFBSSxJQUFJLENBQUMsWUFBWSxJQUFJLEtBQUs7T0FBQSxDQUFDLENBQUE7S0FDaEY7OztXQUVjLHdCQUFDLElBQUksRUFBRTtBQUNwQixVQUFJLEtBQUssR0FBRyxJQUFJLENBQUMsWUFBWSxDQUFBO0FBQzdCLFVBQUksV0FBVyxHQUFHLElBQUksQ0FBQyxpQkFBaUIsQ0FBQyxLQUFLLEdBQUcsQ0FBQyxDQUFDLENBQUE7O0FBRW5ELFVBQUcsV0FBVyxFQUNaLE9BQU8sV0FBVyxDQUFBO0tBQ3JCOzs7V0FFVyx3QkFBRTtBQUNkLFVBQUksSUFBSSxHQUFHLEVBQUUsQ0FBQTtBQUNiLFVBQUksV0FBVyxHQUFHLEVBQUUsQ0FBQTtBQUNwQixVQUFJLFFBQVEsR0FBRyxJQUFJLENBQUMsUUFBUSxDQUFDLGVBQWUsRUFBRSxDQUFBO0FBQzlDLFVBQUksTUFBTSxHQUFHLEVBQUUsQ0FBQTs7QUFFZixjQUFRLENBQUMsT0FBTyxDQUFDLFVBQUEsT0FBTyxFQUFJO0FBQzNCLG1CQUFXLEdBQUcsQ0FBQyxPQUFPLENBQUMsS0FBSyxHQUFHLENBQUMsQ0FBQSxHQUFJLENBQUMsQ0FBQTtBQUNsQyxZQUFJLEtBQUssR0FBRyxPQUFPLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQTtBQUNyQyxhQUFLLEdBQUcsT0FBTyxDQUFDLFlBQVksR0FBRyxHQUFHLEdBQUcsS0FBSyxDQUFBO0FBQzdDLGNBQU0sQ0FBQyxJQUFJLENBQUMsOEJBQU8sTUFBTSxDQUFDLEdBQUcsRUFBRSxXQUFXLENBQUMsR0FBRyxLQUFLLENBQUMsQ0FBQTtPQUNwRCxDQUFDLENBQUE7O0FBRUEsVUFBRyxJQUFJLENBQUMsTUFBTSxLQUFLLFNBQVMsRUFBQztBQUMzQixlQUFPLENBQUMsR0FBRyxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQTtPQUMvQjs7QUFFRCxhQUFPLE1BQU0sQ0FBQTtLQUNmOzs7U0FyRG1CLFNBQVM7OztxQkFBVCxTQUFTIiwiZmlsZSI6InByZXNlbnRlci5qcyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCBzdHJpbmcgZnJvbSAndW5kZXJzY29yZS5zdHJpbmcnXG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIFByZXNlbnRlciB7XG5cdHN0YXRpYyBwcmVzZW50IChkb2N1bWVudCwgb3B0aW9ucz17fSkge1xuXHRcdHJldHVybiBuZXcgUHJlc2VudGVyKGRvY3VtZW50LCBvcHRpb25zKVxuXHR9XG5cblx0c3RhdGljIGxvYWRGcm9tRGlzayAocmVwb3NpdG9yeUZvbGRlciwgb3B0aW9ucz17fSkge1xuXG5cdH1cblxuXHRjb25zdHJ1Y3RvciAoZG9jdW1lbnQsIG9wdGlvbnMgPSB7fSkge1xuXHRcdHRoaXMuZG9jdW1lbnQgPSBkb2N1bWVudFxuXHRcdHRoaXMub3B0aW9ucyA9IG9wdGlvbnNcbiAgICB0aGlzLm91dHB1dCA9IG9wdGlvbnMub3V0cHV0IHx8IFwiY29uc29sZVwiXG5cdH1cblxuXHRjaGlsZHJlbiAoKXtcblx0XHR0aGlzLmRvY3VtZW50LmdldENoaWxkcmVuKClcblx0fVxuICBcbiAgLyoqXG4gICAqIGZpbmQgdGhlIGhlYWRpbmcgeW91IHdhbnQgYnkgaXRzIHJlbGF0aXZlXG4gICAqIHBvc2l0aW9uYWwgaW5kZXggd2l0aGluIHRoZSBkb2N1bWVudFxuICAqL1xuICBnZXRIZWFkaW5nQnlJbmRleCAoaW5kZXgpe1xuICAgIHJldHVybiB0aGlzLmRvY3VtZW50LmdldEhlYWRpbmdOb2RlcygpLmZpbmQobm9kZSA9PiBub2RlLmhlYWRpbmdJbmRleCA9PSBpbmRleClcbiAgfVxuXG4gIGdldE5leHRIZWFkaW5nIChmcm9tKSB7XG4gICAgbGV0IGluZGV4ID0gZnJvbS5oZWFkaW5nSW5kZXhcbiAgICBsZXQgbmV4dEhlYWRpbmcgPSB0aGlzLmdldEhlYWRpbmdCeUluZGV4KGluZGV4ICsgMSlcblxuICAgIGlmKG5leHRIZWFkaW5nKVxuICAgICAgcmV0dXJuIG5leHRIZWFkaW5nXG4gIH1cblxuXHR2aWV3SGVhZGluZ3MgKCl7XG5cdFx0bGV0IGJhc2UgPSBcIlwiXG5cdFx0bGV0IGluZGVudGF0aW9uID0gXCJcIlxuXHRcdGxldCBoZWFkaW5ncyA9IHRoaXMuZG9jdW1lbnQuZ2V0SGVhZGluZ05vZGVzKClcblx0XHRsZXQgcmVwb3J0ID0gW11cblxuXHRcdGhlYWRpbmdzLmZvckVhY2goaGVhZGluZyA9PiB7XG5cdFx0XHRpbmRlbnRhdGlvbiA9IChoZWFkaW5nLmRlcHRoIC0gMSkgKiAyXG4gICAgICBsZXQgdmFsdWUgPSBoZWFkaW5nLmNoaWxkcmVuWzBdLnZhbHVlXG4gICAgICB2YWx1ZSA9IGhlYWRpbmcuaGVhZGluZ0luZGV4ICsgJyAnICsgdmFsdWVcblx0XHRcdHJlcG9ydC5wdXNoKHN0cmluZy5yZXBlYXQoJyAnLCBpbmRlbnRhdGlvbikgKyB2YWx1ZSlcblx0XHR9KVxuICAgIFxuICAgIGlmKHRoaXMub3V0cHV0ID09PSBcImNvbnNvbGVcIil7XG4gICAgICBjb25zb2xlLmxvZyhyZXBvcnQuam9pbihcIlxcblwiKSlcbiAgICB9XG5cbiAgICByZXR1cm4gcmVwb3J0XG5cdH1cbn1cbiJdfQ==