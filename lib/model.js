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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3NyYy9tb2RlbC5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7d0JBQXFCLFlBQVk7Ozs7Z0NBQ0wsb0JBQW9COzs7O29CQUMvQixRQUFROzs7O2lCQUNMLEdBQUc7Ozs7SUFFRixLQUFLO2VBQUwsS0FBSzs7V0FDSixzQkFBQyxRQUFRLEVBQUM7QUFDNUIsYUFBTyxJQUFJLEtBQUssQ0FBQyxRQUFRLENBQUMsQ0FBQTtLQUMzQjs7O0FBRVUsV0FMUSxLQUFLLENBS1osUUFBUSxFQUFjOzs7UUFBWixPQUFPLHlEQUFDLEVBQUU7OzBCQUxiLEtBQUs7O0FBTXRCLFFBQUksQ0FBQyxRQUFRLEdBQU8sUUFBUSxDQUFBO0FBQzVCLFFBQUksQ0FBQyxJQUFJLEdBQVcsUUFBUSxDQUFDLElBQUksSUFBSSxFQUFFLENBQUE7QUFDdkMsUUFBSSxDQUFDLFNBQVMsR0FBTSxPQUFPLENBQUMsU0FBUyxJQUFJLFdBQVcsQ0FBQTtBQUNwRCxRQUFJLENBQUMsRUFBRSxHQUFhLE9BQU8sQ0FBQyxFQUFFLENBQUE7QUFDOUIsUUFBSSxDQUFDLFFBQVEsQ0FBQyxFQUFFLEdBQUksSUFBSSxDQUFDLEVBQUUsQ0FBQTs7QUFFM0IsUUFBRyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksRUFBQztBQUNoQixVQUFJLENBQUMsU0FBUyxHQUFHLHFCQUFTLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUE7S0FDckQ7O0FBRUQsVUFBTSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsT0FBTyxDQUFDLFVBQUEsR0FBRzthQUFJLE1BQUssR0FBRyxDQUFDLEdBQUcsTUFBSyxJQUFJLENBQUMsR0FBRyxDQUFDO0tBQUEsQ0FBQyxDQUFBO0dBQ2xFOztlQWpCa0IsS0FBSzs7V0FtQmhCLG9CQUFFO0FBQ1IsYUFBTyxJQUFJLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQTtLQUMxQjs7O1dBRWEsMEJBQUcsRUFFaEI7OztXQUVVLHVCQUFHLEVBQ2I7OztXQUVpQiw0QkFBQyxHQUFHLEVBQUU7QUFDdEIsYUFBTyxtQkFBbUIsRUFBRSxDQUFDLEdBQUcsQ0FBQyxDQUFBO0tBQ2xDOzs7V0FFa0IsK0JBQUc7QUFDcEIsYUFBTyxJQUFJLENBQUMsa0JBQWtCLEVBQUUsQ0FBQyxVQUFVLENBQUE7S0FDNUM7OztXQUVnQiw2QkFBRTtBQUNqQixhQUFPLElBQUksQ0FBQyxrQkFBa0IsRUFBRSxDQUFDLFFBQVEsQ0FBQTtLQUMxQzs7O1dBRWlCLDhCQUFFO0FBQ2xCLGFBQU8sOEJBQWdCLE1BQU0sQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUE7S0FDekM7OztTQTVDa0IsS0FBSzs7O3FCQUFMLEtBQUsiLCJmaWxlIjoibW9kZWwuanMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgRG9jdW1lbnQgZnJvbSAnLi9kb2N1bWVudCdcbmltcG9ydCBNb2RlbERlZmluaXRpb24gZnJvbSAnLi9tb2RlbF9kZWZpbml0aW9uJ1xuaW1wb3J0IENhc2UgZnJvbSAnLi9jYXNlJ1xuaW1wb3J0IGluZmxlY3QgZnJvbSAnaSdcblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgTW9kZWwge1xuICBzdGF0aWMgZnJvbURvY3VtZW50IChkb2N1bWVudCl7XG4gICAgcmV0dXJuIG5ldyBNb2RlbChkb2N1bWVudClcbiAgfVxuXG4gIGNvbnN0cnVjdG9yKGRvY3VtZW50LCBvcHRpb25zPXt9KSB7XG4gICAgdGhpcy5kb2N1bWVudCAgICAgPSBkb2N1bWVudFxuICAgIHRoaXMuZGF0YSAgICAgICAgID0gZG9jdW1lbnQuZGF0YSB8fCB7fVxuICAgIHRoaXMuZ3JvdXBOYW1lICAgID0gb3B0aW9ucy5ncm91cE5hbWUgfHwgXCJkb2N1bWVudHNcIlxuICAgIHRoaXMuaWQgICAgICAgICAgID0gb3B0aW9ucy5pZFxuICAgIHRoaXMuZG9jdW1lbnQuaWQgID0gdGhpcy5pZFxuXG4gICAgaWYodGhpcy5kYXRhLnR5cGUpe1xuICAgICAgdGhpcy5ncm91cE5hbWUgPSBpbmZsZWN0KCkucGx1cmFsaXplKHRoaXMuZGF0YS50eXBlKVxuICAgIH1cbiAgICBcbiAgICBPYmplY3Qua2V5cyh0aGlzLmRhdGEpLmZvckVhY2goa2V5ID0+IHRoaXNba2V5XSA9IHRoaXMuZGF0YVtrZXldKVxuICB9XG5cbiAgdG9TdHJpbmcoKXtcbiAgICByZXR1cm4gdGhpcy5kb2N1bWVudC5wYXRoXG4gIH1cbiAgXG4gIGV4dHJhY3RDb250ZW50KCkge1xuXG4gIH1cblxuICBleHRyYWN0RGF0YSgpIHtcbiAgfVxuXG4gIGdldEF0dHJpYnV0ZUNvbmZpZyhrZXkpIHtcbiAgICByZXR1cm4gZ2V0QXR0cmlidXRlc0NvbmZpZygpW2tleV1cbiAgfVxuXG4gIGdldEF0dHJpYnV0ZXNDb25maWcoKSB7XG4gICAgcmV0dXJuIHRoaXMuZ2V0TW9kZWxEZWZpbml0aW9uKCkuYXR0cmlidXRlc1xuICB9XG5cbiAgZ2V0U2VjdGlvbnNDb25maWcoKXtcbiAgICByZXR1cm4gdGhpcy5nZXRNb2RlbERlZmluaXRpb24oKS5zZWN0aW9uc1xuICB9XG5cbiAgZ2V0TW9kZWxEZWZpbml0aW9uKCl7XG4gICAgcmV0dXJuIE1vZGVsRGVmaW5pdGlvbi5sb29rdXAodGhpcy50eXBlKVxuICB9XG59XG4iXX0=