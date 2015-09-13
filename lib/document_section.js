"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var DocumentSection = (function () {
  function DocumentSection(name, modelDefinition) {
    var options = arguments.length <= 2 || arguments[2] === undefined ? {} : arguments[2];

    _classCallCheck(this, DocumentSection);

    this.name = name;
    this.options = options;
    this.aliases = [];
    this.children = {};
  }

  /**
   * identifies the way the child items in the section
   * can be referenced. also specifies the attributes that
   * should be extracted from the subsection
  */

  _createClass(DocumentSection, [{
    key: "hasMany",
    value: function hasMany(relationshipName) {
      var options = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

      options.relationshipType = "hasMany";
      this.children[relationshipName] = options;
      return this;
    }

    /**
     * sets an alias for the section, which allows
     * for different values to be used as the main
     * anchor heading
    */
  }, {
    key: "aka",
    value: function aka() {
      for (var _len = arguments.length, aliases = Array(_len), _key = 0; _key < _len; _key++) {
        aliases[_key] = arguments[_key];
      }

      this.aliases = this.aliases.concat(aliases);
      return this;
    }
  }]);

  return DocumentSection;
})();

exports["default"] = DocumentSection;
module.exports = exports["default"];
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3NyYy9kb2N1bWVudF9zZWN0aW9uLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7SUFBcUIsZUFBZTtBQUN0QixXQURPLGVBQWUsQ0FDckIsSUFBSSxFQUFFLGVBQWUsRUFBZ0I7UUFBZCxPQUFPLHlEQUFHLEVBQUU7OzBCQUQ3QixlQUFlOztBQUVoQyxRQUFJLENBQUMsSUFBSSxHQUFHLElBQUksQ0FBQTtBQUNoQixRQUFJLENBQUMsT0FBTyxHQUFHLE9BQU8sQ0FBQTtBQUN0QixRQUFJLENBQUMsT0FBTyxHQUFHLEVBQUUsQ0FBQTtBQUNqQixRQUFJLENBQUMsUUFBUSxHQUFHLEVBQUUsQ0FBQTtHQUNuQjs7Ozs7Ozs7ZUFOa0IsZUFBZTs7V0FhMUIsaUJBQUMsZ0JBQWdCLEVBQWdCO1VBQWQsT0FBTyx5REFBRyxFQUFFOztBQUNyQyxhQUFPLENBQUMsZ0JBQWdCLEdBQUcsU0FBUyxDQUFBO0FBQ3BDLFVBQUksQ0FBQyxRQUFRLENBQUMsZ0JBQWdCLENBQUMsR0FBRyxPQUFPLENBQUE7QUFDekMsYUFBTyxJQUFJLENBQUE7S0FDWjs7Ozs7Ozs7O1dBT0csZUFBYTt3Q0FBVCxPQUFPO0FBQVAsZUFBTzs7O0FBQ2IsVUFBSSxDQUFDLE9BQU8sR0FBRyxJQUFJLENBQUMsT0FBTyxDQUFDLE1BQU0sQ0FBQyxPQUFPLENBQUMsQ0FBQTtBQUMzQyxhQUFPLElBQUksQ0FBQTtLQUNaOzs7U0EzQmtCLGVBQWU7OztxQkFBZixlQUFlIiwiZmlsZSI6ImRvY3VtZW50X3NlY3Rpb24uanMiLCJzb3VyY2VzQ29udGVudCI6WyJleHBvcnQgZGVmYXVsdCBjbGFzcyBEb2N1bWVudFNlY3Rpb24ge1xuICBjb25zdHJ1Y3RvciAobmFtZSwgbW9kZWxEZWZpbml0aW9uLCBvcHRpb25zID0ge30pIHtcbiAgICB0aGlzLm5hbWUgPSBuYW1lXG4gICAgdGhpcy5vcHRpb25zID0gb3B0aW9uc1xuICAgIHRoaXMuYWxpYXNlcyA9IFtdXG4gICAgdGhpcy5jaGlsZHJlbiA9IHt9XG4gIH1cbiAgXG4gIC8qKlxuICAgKiBpZGVudGlmaWVzIHRoZSB3YXkgdGhlIGNoaWxkIGl0ZW1zIGluIHRoZSBzZWN0aW9uXG4gICAqIGNhbiBiZSByZWZlcmVuY2VkLiBhbHNvIHNwZWNpZmllcyB0aGUgYXR0cmlidXRlcyB0aGF0XG4gICAqIHNob3VsZCBiZSBleHRyYWN0ZWQgZnJvbSB0aGUgc3Vic2VjdGlvblxuICAqL1xuICBoYXNNYW55IChyZWxhdGlvbnNoaXBOYW1lLCBvcHRpb25zID0ge30pIHtcbiAgICBvcHRpb25zLnJlbGF0aW9uc2hpcFR5cGUgPSBcImhhc01hbnlcIlxuICAgIHRoaXMuY2hpbGRyZW5bcmVsYXRpb25zaGlwTmFtZV0gPSBvcHRpb25zXG4gICAgcmV0dXJuIHRoaXNcbiAgfVxuICBcbiAgLyoqXG4gICAqIHNldHMgYW4gYWxpYXMgZm9yIHRoZSBzZWN0aW9uLCB3aGljaCBhbGxvd3NcbiAgICogZm9yIGRpZmZlcmVudCB2YWx1ZXMgdG8gYmUgdXNlZCBhcyB0aGUgbWFpblxuICAgKiBhbmNob3IgaGVhZGluZ1xuICAqL1xuICBha2EgKC4uLmFsaWFzZXMpIHtcbiAgICB0aGlzLmFsaWFzZXMgPSB0aGlzLmFsaWFzZXMuY29uY2F0KGFsaWFzZXMpXG4gICAgcmV0dXJuIHRoaXNcbiAgfVxufVxuIl19