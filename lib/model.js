'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var _document = require('./document');

var _document2 = _interopRequireDefault(_document);

var _model_definition = require('./model_definition');

var _model_definition2 = _interopRequireDefault(_model_definition);

var _case = require('./case');

var _case2 = _interopRequireDefault(_case);

var _i = require('i');

var _i2 = _interopRequireDefault(_i);

var Model = (function () {
  _createClass(Model, null, [{
    key: 'fromDocument',
    value: function fromDocument(document) {
      return new Model(document);
    }
  }]);

  function Model(document) {
    var _this = this;

    var options = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

    _classCallCheck(this, Model);

    this.document = document;
    this.data = document.data || {};
    this.groupName = options.groupName || "documents";
    this.id = options.id;
    this.document.id = this.id;

    if (this.data.type) {
      this.groupName = (0, _i2['default'])().pluralize(this.data.type);
    }

    Object.keys(this.data).forEach(function (key) {
      return _this[key] = _this.data[key];
    });
  }

  _createClass(Model, [{
    key: 'toString',
    value: function toString() {
      return this.document.path;
    }
  }, {
    key: 'getModelDefinition',
    value: function getModelDefinition() {}
  }]);

  return Model;
})();

exports['default'] = Model;
module.exports = exports['default'];
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3NyYy9tb2RlbC5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7d0JBQXFCLFlBQVk7Ozs7Z0NBQ0wsb0JBQW9COzs7O29CQUMvQixRQUFROzs7O2lCQUNMLEdBQUc7Ozs7SUFFRixLQUFLO2VBQUwsS0FBSzs7V0FDSixzQkFBQyxRQUFRLEVBQUM7QUFDNUIsYUFBTyxJQUFJLEtBQUssQ0FBQyxRQUFRLENBQUMsQ0FBQTtLQUMzQjs7O0FBRVUsV0FMUSxLQUFLLENBS1osUUFBUSxFQUFjOzs7UUFBWixPQUFPLHlEQUFDLEVBQUU7OzBCQUxiLEtBQUs7O0FBTXRCLFFBQUksQ0FBQyxRQUFRLEdBQU8sUUFBUSxDQUFBO0FBQzVCLFFBQUksQ0FBQyxJQUFJLEdBQVcsUUFBUSxDQUFDLElBQUksSUFBSSxFQUFFLENBQUE7QUFDdkMsUUFBSSxDQUFDLFNBQVMsR0FBTSxPQUFPLENBQUMsU0FBUyxJQUFJLFdBQVcsQ0FBQTtBQUNwRCxRQUFJLENBQUMsRUFBRSxHQUFhLE9BQU8sQ0FBQyxFQUFFLENBQUE7QUFDOUIsUUFBSSxDQUFDLFFBQVEsQ0FBQyxFQUFFLEdBQUksSUFBSSxDQUFDLEVBQUUsQ0FBQTs7QUFFM0IsUUFBRyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksRUFBQztBQUNoQixVQUFJLENBQUMsU0FBUyxHQUFHLHFCQUFTLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUE7S0FDckQ7O0FBRUQsVUFBTSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsT0FBTyxDQUFDLFVBQUEsR0FBRzthQUFJLE1BQUssR0FBRyxDQUFDLEdBQUcsTUFBSyxJQUFJLENBQUMsR0FBRyxDQUFDO0tBQUEsQ0FBQyxDQUFBO0dBQ2xFOztlQWpCa0IsS0FBSzs7V0FtQmhCLG9CQUFFO0FBQ1IsYUFBTyxJQUFJLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQTtLQUMxQjs7O1dBRWlCLDhCQUFFLEVBRW5COzs7U0F6QmtCLEtBQUs7OztxQkFBTCxLQUFLIiwiZmlsZSI6Im1vZGVsLmpzIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IERvY3VtZW50IGZyb20gJy4vZG9jdW1lbnQnXG5pbXBvcnQgTW9kZWxEZWZpbml0aW9uIGZyb20gJy4vbW9kZWxfZGVmaW5pdGlvbidcbmltcG9ydCBDYXNlIGZyb20gJy4vY2FzZSdcbmltcG9ydCBpbmZsZWN0IGZyb20gJ2knXG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIE1vZGVsIHtcbiAgc3RhdGljIGZyb21Eb2N1bWVudCAoZG9jdW1lbnQpe1xuICAgIHJldHVybiBuZXcgTW9kZWwoZG9jdW1lbnQpXG4gIH1cblxuICBjb25zdHJ1Y3Rvcihkb2N1bWVudCwgb3B0aW9ucz17fSkge1xuICAgIHRoaXMuZG9jdW1lbnQgICAgID0gZG9jdW1lbnRcbiAgICB0aGlzLmRhdGEgICAgICAgICA9IGRvY3VtZW50LmRhdGEgfHwge31cbiAgICB0aGlzLmdyb3VwTmFtZSAgICA9IG9wdGlvbnMuZ3JvdXBOYW1lIHx8IFwiZG9jdW1lbnRzXCJcbiAgICB0aGlzLmlkICAgICAgICAgICA9IG9wdGlvbnMuaWRcbiAgICB0aGlzLmRvY3VtZW50LmlkICA9IHRoaXMuaWRcblxuICAgIGlmKHRoaXMuZGF0YS50eXBlKXtcbiAgICAgIHRoaXMuZ3JvdXBOYW1lID0gaW5mbGVjdCgpLnBsdXJhbGl6ZSh0aGlzLmRhdGEudHlwZSlcbiAgICB9XG4gICAgXG4gICAgT2JqZWN0LmtleXModGhpcy5kYXRhKS5mb3JFYWNoKGtleSA9PiB0aGlzW2tleV0gPSB0aGlzLmRhdGFba2V5XSlcbiAgfVxuXG4gIHRvU3RyaW5nKCl7XG4gICAgcmV0dXJuIHRoaXMuZG9jdW1lbnQucGF0aFxuICB9XG4gIFxuICBnZXRNb2RlbERlZmluaXRpb24oKXtcblxuICB9XG59XG4iXX0=