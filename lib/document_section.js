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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3NyYy9kb2N1bWVudF9zZWN0aW9uLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7SUFBcUIsZUFBZTtBQUN0QixXQURPLGVBQWUsQ0FDckIsSUFBSSxFQUFFLGVBQWUsRUFBZ0I7UUFBZCxPQUFPLHlEQUFHLEVBQUU7OzBCQUQ3QixlQUFlOztBQUVoQyxRQUFJLENBQUMsSUFBSSxHQUFHLElBQUksQ0FBQTtBQUNoQixRQUFJLENBQUMsT0FBTyxHQUFHLE9BQU8sQ0FBQTtBQUN0QixRQUFJLENBQUMsT0FBTyxHQUFHLEVBQUUsQ0FBQTtBQUNqQixRQUFJLENBQUMsUUFBUSxHQUFHLEVBQUUsQ0FBQTtHQUNuQjs7Ozs7Ozs7ZUFOa0IsZUFBZTs7V0FhMUIsaUJBQUMsZ0JBQWdCLEVBQWdCO1VBQWQsT0FBTyx5REFBRyxFQUFFOztBQUNyQyxVQUFJLENBQUMsUUFBUSxDQUFDLGdCQUFnQixDQUFDLEdBQUcsT0FBTyxDQUFBO0FBQ3pDLGFBQU8sSUFBSSxDQUFBO0tBQ1o7Ozs7Ozs7OztXQU9HLGVBQWE7d0NBQVQsT0FBTztBQUFQLGVBQU87OztBQUNiLFVBQUksQ0FBQyxPQUFPLEdBQUcsSUFBSSxDQUFDLE9BQU8sQ0FBQyxNQUFNLENBQUMsT0FBTyxDQUFDLENBQUE7QUFDM0MsYUFBTyxJQUFJLENBQUE7S0FDWjs7O1NBMUJrQixlQUFlOzs7cUJBQWYsZUFBZSIsImZpbGUiOiJkb2N1bWVudF9zZWN0aW9uLmpzIiwic291cmNlc0NvbnRlbnQiOlsiZXhwb3J0IGRlZmF1bHQgY2xhc3MgRG9jdW1lbnRTZWN0aW9uIHtcbiAgY29uc3RydWN0b3IgKG5hbWUsIG1vZGVsRGVmaW5pdGlvbiwgb3B0aW9ucyA9IHt9KSB7XG4gICAgdGhpcy5uYW1lID0gbmFtZVxuICAgIHRoaXMub3B0aW9ucyA9IG9wdGlvbnNcbiAgICB0aGlzLmFsaWFzZXMgPSBbXVxuICAgIHRoaXMuY2hpbGRyZW4gPSB7fVxuICB9XG4gIFxuICAvKipcbiAgICogaWRlbnRpZmllcyB0aGUgd2F5IHRoZSBjaGlsZCBpdGVtcyBpbiB0aGUgc2VjdGlvblxuICAgKiBjYW4gYmUgcmVmZXJlbmNlZC4gYWxzbyBzcGVjaWZpZXMgdGhlIGF0dHJpYnV0ZXMgdGhhdFxuICAgKiBzaG91bGQgYmUgZXh0cmFjdGVkIGZyb20gdGhlIHN1YnNlY3Rpb25cbiAgKi9cbiAgaGFzTWFueSAocmVsYXRpb25zaGlwTmFtZSwgb3B0aW9ucyA9IHt9KSB7XG4gICAgdGhpcy5jaGlsZHJlbltyZWxhdGlvbnNoaXBOYW1lXSA9IG9wdGlvbnNcbiAgICByZXR1cm4gdGhpc1xuICB9XG4gIFxuICAvKipcbiAgICogc2V0cyBhbiBhbGlhcyBmb3IgdGhlIHNlY3Rpb24sIHdoaWNoIGFsbG93c1xuICAgKiBmb3IgZGlmZmVyZW50IHZhbHVlcyB0byBiZSB1c2VkIGFzIHRoZSBtYWluXG4gICAqIGFuY2hvciBoZWFkaW5nXG4gICovXG4gIGFrYSAoLi4uYWxpYXNlcykge1xuICAgIHRoaXMuYWxpYXNlcyA9IHRoaXMuYWxpYXNlcy5jb25jYXQoYWxpYXNlcylcbiAgICByZXR1cm4gdGhpc1xuICB9XG59XG4iXX0=