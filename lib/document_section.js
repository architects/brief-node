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