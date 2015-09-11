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

var _briefcase = require('./briefcase');

var _briefcase2 = _interopRequireDefault(_briefcase);

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
    key: 'extractContent',
    value: function extractContent() {}
  }, {
    key: 'extractData',
    value: function extractData() {}
  }, {
    key: 'getAttributeConfig',
    value: function getAttributeConfig(key) {
      return getAttributesConfig()[key];
    }
  }, {
    key: 'getAttributesConfig',
    value: function getAttributesConfig() {
      return this.getModelDefinition().attributes;
    }
  }, {
    key: 'getSectionsConfig',
    value: function getSectionsConfig() {
      return this.getModelDefinition().sections;
    }
  }, {
    key: 'getModelDefinition',
    value: function getModelDefinition() {
      return _model_definition2['default'].lookup(this.type);
    }
  }]);

  return Model;
})();

exports['default'] = Model;
module.exports = exports['default'];
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3NyYy9tb2RlbC5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7d0JBQXFCLFlBQVk7Ozs7Z0NBQ0wsb0JBQW9COzs7O3lCQUMxQixhQUFhOzs7O2lCQUNmLEdBQUc7Ozs7SUFFRixLQUFLO2VBQUwsS0FBSzs7V0FDSixzQkFBQyxRQUFRLEVBQUM7QUFDNUIsYUFBTyxJQUFJLEtBQUssQ0FBQyxRQUFRLENBQUMsQ0FBQTtLQUMzQjs7O0FBRVUsV0FMUSxLQUFLLENBS1osUUFBUSxFQUFjOzs7UUFBWixPQUFPLHlEQUFDLEVBQUU7OzBCQUxiLEtBQUs7O0FBTXRCLFFBQUksQ0FBQyxRQUFRLEdBQU8sUUFBUSxDQUFBO0FBQzVCLFFBQUksQ0FBQyxJQUFJLEdBQVcsUUFBUSxDQUFDLElBQUksSUFBSSxFQUFFLENBQUE7QUFDdkMsUUFBSSxDQUFDLFNBQVMsR0FBTSxPQUFPLENBQUMsU0FBUyxJQUFJLFdBQVcsQ0FBQTtBQUNwRCxRQUFJLENBQUMsRUFBRSxHQUFhLE9BQU8sQ0FBQyxFQUFFLENBQUE7QUFDOUIsUUFBSSxDQUFDLFFBQVEsQ0FBQyxFQUFFLEdBQUksSUFBSSxDQUFDLEVBQUUsQ0FBQTs7QUFFM0IsUUFBRyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksRUFBQztBQUNoQixVQUFJLENBQUMsU0FBUyxHQUFHLHFCQUFTLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUE7S0FDckQ7O0FBRUQsVUFBTSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsT0FBTyxDQUFDLFVBQUEsR0FBRzthQUFJLE1BQUssR0FBRyxDQUFDLEdBQUcsTUFBSyxJQUFJLENBQUMsR0FBRyxDQUFDO0tBQUEsQ0FBQyxDQUFBO0dBQ2xFOztlQWpCa0IsS0FBSzs7V0FtQmhCLG9CQUFFO0FBQ1IsYUFBTyxJQUFJLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQTtLQUMxQjs7O1dBRWEsMEJBQUcsRUFFaEI7OztXQUVVLHVCQUFHLEVBQ2I7OztXQUVpQiw0QkFBQyxHQUFHLEVBQUU7QUFDdEIsYUFBTyxtQkFBbUIsRUFBRSxDQUFDLEdBQUcsQ0FBQyxDQUFBO0tBQ2xDOzs7V0FFa0IsK0JBQUc7QUFDcEIsYUFBTyxJQUFJLENBQUMsa0JBQWtCLEVBQUUsQ0FBQyxVQUFVLENBQUE7S0FDNUM7OztXQUVnQiw2QkFBRTtBQUNqQixhQUFPLElBQUksQ0FBQyxrQkFBa0IsRUFBRSxDQUFDLFFBQVEsQ0FBQTtLQUMxQzs7O1dBRWlCLDhCQUFFO0FBQ2xCLGFBQU8sOEJBQWdCLE1BQU0sQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUE7S0FDekM7OztTQTVDa0IsS0FBSzs7O3FCQUFMLEtBQUsiLCJmaWxlIjoibW9kZWwuanMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgRG9jdW1lbnQgZnJvbSAnLi9kb2N1bWVudCdcbmltcG9ydCBNb2RlbERlZmluaXRpb24gZnJvbSAnLi9tb2RlbF9kZWZpbml0aW9uJ1xuaW1wb3J0IEJyaWVmY2FzZSBmcm9tICcuL2JyaWVmY2FzZSdcbmltcG9ydCBpbmZsZWN0IGZyb20gJ2knXG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIE1vZGVsIHtcbiAgc3RhdGljIGZyb21Eb2N1bWVudCAoZG9jdW1lbnQpe1xuICAgIHJldHVybiBuZXcgTW9kZWwoZG9jdW1lbnQpXG4gIH1cblxuICBjb25zdHJ1Y3Rvcihkb2N1bWVudCwgb3B0aW9ucz17fSkge1xuICAgIHRoaXMuZG9jdW1lbnQgICAgID0gZG9jdW1lbnRcbiAgICB0aGlzLmRhdGEgICAgICAgICA9IGRvY3VtZW50LmRhdGEgfHwge31cbiAgICB0aGlzLmdyb3VwTmFtZSAgICA9IG9wdGlvbnMuZ3JvdXBOYW1lIHx8IFwiZG9jdW1lbnRzXCJcbiAgICB0aGlzLmlkICAgICAgICAgICA9IG9wdGlvbnMuaWRcbiAgICB0aGlzLmRvY3VtZW50LmlkICA9IHRoaXMuaWRcblxuICAgIGlmKHRoaXMuZGF0YS50eXBlKXtcbiAgICAgIHRoaXMuZ3JvdXBOYW1lID0gaW5mbGVjdCgpLnBsdXJhbGl6ZSh0aGlzLmRhdGEudHlwZSlcbiAgICB9XG4gICAgXG4gICAgT2JqZWN0LmtleXModGhpcy5kYXRhKS5mb3JFYWNoKGtleSA9PiB0aGlzW2tleV0gPSB0aGlzLmRhdGFba2V5XSlcbiAgfVxuXG4gIHRvU3RyaW5nKCl7XG4gICAgcmV0dXJuIHRoaXMuZG9jdW1lbnQucGF0aFxuICB9XG4gIFxuICBleHRyYWN0Q29udGVudCgpIHtcblxuICB9XG5cbiAgZXh0cmFjdERhdGEoKSB7XG4gIH1cblxuICBnZXRBdHRyaWJ1dGVDb25maWcoa2V5KSB7XG4gICAgcmV0dXJuIGdldEF0dHJpYnV0ZXNDb25maWcoKVtrZXldXG4gIH1cblxuICBnZXRBdHRyaWJ1dGVzQ29uZmlnKCkge1xuICAgIHJldHVybiB0aGlzLmdldE1vZGVsRGVmaW5pdGlvbigpLmF0dHJpYnV0ZXNcbiAgfVxuXG4gIGdldFNlY3Rpb25zQ29uZmlnKCl7XG4gICAgcmV0dXJuIHRoaXMuZ2V0TW9kZWxEZWZpbml0aW9uKCkuc2VjdGlvbnNcbiAgfVxuXG4gIGdldE1vZGVsRGVmaW5pdGlvbigpe1xuICAgIHJldHVybiBNb2RlbERlZmluaXRpb24ubG9va3VwKHRoaXMudHlwZSlcbiAgfVxufVxuIl19