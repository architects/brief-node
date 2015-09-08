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
	}

	_createClass(Presenter, [{
		key: "children",
		value: function children() {
			this.document.getChildren();
		}
	}, {
		key: "viewHeadings",
		value: function viewHeadings() {
			var base = "";
			var indentation = "";
			var headings = this.document.getHeadings();
			var report = [];

			headings.forEach(function (heading) {
				indentation = (heading.depth - 1) * 2;
				report.push(_underscoreString2["default"].repeat(' ', indentation) + heading.children[0].value);
			});
		}
	}]);

	return Presenter;
})();

exports["default"] = Presenter;
module.exports = exports["default"];
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3NyYy9wcmVzZW50ZXIuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7O2dDQUFtQixtQkFBbUI7Ozs7SUFFakIsU0FBUztjQUFULFNBQVM7O1NBQ2QsaUJBQUMsUUFBUSxFQUFjO09BQVosT0FBTyx5REFBQyxFQUFFOztBQUNuQyxVQUFPLElBQUksU0FBUyxDQUFDLFFBQVEsRUFBRSxPQUFPLENBQUMsQ0FBQTtHQUN2Qzs7O1NBRW1CLHNCQUFDLGdCQUFnQixFQUFjO09BQVosT0FBTyx5REFBQyxFQUFFO0dBRWhEOzs7QUFFVyxVQVRRLFNBQVMsQ0FTaEIsUUFBUSxFQUFnQjtNQUFkLE9BQU8seURBQUcsRUFBRTs7d0JBVGYsU0FBUzs7QUFVNUIsTUFBSSxDQUFDLFFBQVEsR0FBRyxRQUFRLENBQUE7QUFDeEIsTUFBSSxDQUFDLE9BQU8sR0FBRyxPQUFPLENBQUE7RUFDdEI7O2NBWm1CLFNBQVM7O1NBY3BCLG9CQUFFO0FBQ1YsT0FBSSxDQUFDLFFBQVEsQ0FBQyxXQUFXLEVBQUUsQ0FBQTtHQUMzQjs7O1NBRVksd0JBQUU7QUFDZCxPQUFJLElBQUksR0FBRyxFQUFFLENBQUE7QUFDYixPQUFJLFdBQVcsR0FBRyxFQUFFLENBQUE7QUFDcEIsT0FBSSxRQUFRLEdBQUcsSUFBSSxDQUFDLFFBQVEsQ0FBQyxXQUFXLEVBQUUsQ0FBQTtBQUMxQyxPQUFJLE1BQU0sR0FBRyxFQUFFLENBQUE7O0FBRWYsV0FBUSxDQUFDLE9BQU8sQ0FBQyxVQUFBLE9BQU8sRUFBSTtBQUMzQixlQUFXLEdBQUcsQ0FBQyxPQUFPLENBQUMsS0FBSyxHQUFHLENBQUMsQ0FBQSxHQUFJLENBQUMsQ0FBQTtBQUNyQyxVQUFNLENBQUMsSUFBSSxDQUFDLDhCQUFPLE1BQU0sQ0FBQyxHQUFHLEVBQUUsV0FBVyxDQUFDLEdBQUcsT0FBTyxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsQ0FBQTtJQUN4RSxDQUFDLENBQUE7R0FDRjs7O1FBNUJtQixTQUFTOzs7cUJBQVQsU0FBUyIsImZpbGUiOiJwcmVzZW50ZXIuanMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgc3RyaW5nIGZyb20gJ3VuZGVyc2NvcmUuc3RyaW5nJ1xuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBQcmVzZW50ZXIge1xuXHRzdGF0aWMgcHJlc2VudCAoZG9jdW1lbnQsIG9wdGlvbnM9e30pIHtcblx0XHRyZXR1cm4gbmV3IFByZXNlbnRlcihkb2N1bWVudCwgb3B0aW9ucylcblx0fVxuXG5cdHN0YXRpYyBsb2FkRnJvbURpc2sgKHJlcG9zaXRvcnlGb2xkZXIsIG9wdGlvbnM9e30pIHtcblxuXHR9XG5cblx0Y29uc3RydWN0b3IgKGRvY3VtZW50LCBvcHRpb25zID0ge30pIHtcblx0XHR0aGlzLmRvY3VtZW50ID0gZG9jdW1lbnRcblx0XHR0aGlzLm9wdGlvbnMgPSBvcHRpb25zXG5cdH1cblxuXHRjaGlsZHJlbiAoKXtcblx0XHR0aGlzLmRvY3VtZW50LmdldENoaWxkcmVuKClcblx0fVxuXHRcblx0dmlld0hlYWRpbmdzICgpe1xuXHRcdGxldCBiYXNlID0gXCJcIlxuXHRcdGxldCBpbmRlbnRhdGlvbiA9IFwiXCJcblx0XHRsZXQgaGVhZGluZ3MgPSB0aGlzLmRvY3VtZW50LmdldEhlYWRpbmdzKClcblx0XHRsZXQgcmVwb3J0ID0gW11cblxuXHRcdGhlYWRpbmdzLmZvckVhY2goaGVhZGluZyA9PiB7XG5cdFx0XHRpbmRlbnRhdGlvbiA9IChoZWFkaW5nLmRlcHRoIC0gMSkgKiAyXG5cdFx0XHRyZXBvcnQucHVzaChzdHJpbmcucmVwZWF0KCcgJywgaW5kZW50YXRpb24pICsgaGVhZGluZy5jaGlsZHJlblswXS52YWx1ZSlcblx0XHR9KVxuXHR9XG59XG4iXX0=