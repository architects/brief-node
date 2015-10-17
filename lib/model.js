'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var _underscore = require('underscore');

var _underscore2 = _interopRequireDefault(_underscore);

var _i = require('i');

var _i2 = _interopRequireDefault(_i);

var _document = require('./document');

var _document2 = _interopRequireDefault(_document);

var _model_definition = require('./model_definition');

var _model_definition2 = _interopRequireDefault(_model_definition);

var _briefcase = require('./briefcase');

var _briefcase2 = _interopRequireDefault(_briefcase);

var _render = require('./render');

var flatten = _underscore2['default'].flatten;
var string = (0, _i2['default'])();

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

    this.type = this.data.type || document.getType();
    this.groupName = string.pluralize(this.type);

    Object.keys(this.data).forEach(function (key) {
      return _this[key] = _this.data[key];
    });
  }

  _createClass(Model, [{
    key: 'toString',
    value: function toString() {
      return 'Document: ' + this.document.path;
    }
  }, {
    key: 'toJSON',
    value: function toJSON() {
      var options = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

      return {
        data: this.data
      };
    }
  }, {
    key: 'extractContent',
    value: function extractContent() {}
  }, {
    key: 'extractData',
    value: function extractData() {}
  }, {
    key: 'definedSectionNodes',
    value: function definedSectionNodes() {
      var _this2 = this;

      return this.document.getSectionNodes().filter(function (node) {
        return _this2.expectedSectionHeadings().indexOf(node.heading) >= 0;
      });
    }
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
    key: 'expectedSectionHeadings',
    value: function expectedSectionHeadings() {
      var cfg = this.getSectionsConfig();
      return flatten(Object.values(cfg).map(function (def) {
        return [def.name, def.aliases];
      }));
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
//# sourceMappingURL=data:application/json;base64,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QUksQ0FBQyxJQUFJLENBQUMsQ0FBQTtLQUN6Qzs7O1NBN0RrQixLQUFLOzs7cUJBQUwsS0FBSyIsImZpbGUiOiJtb2RlbC5qcyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCBfIGZyb20gJ3VuZGVyc2NvcmUnXG5pbXBvcnQgaW5mbGVjdCBmcm9tICdpJ1xuXG5pbXBvcnQgRG9jdW1lbnQgZnJvbSAnLi9kb2N1bWVudCdcbmltcG9ydCBNb2RlbERlZmluaXRpb24gZnJvbSAnLi9tb2RlbF9kZWZpbml0aW9uJ1xuaW1wb3J0IEJyaWVmY2FzZSBmcm9tICcuL2JyaWVmY2FzZSdcbmltcG9ydCB7ZnJhZ21lbnR9IGZyb20gJy4vcmVuZGVyJ1xuXG5jb25zdCBmbGF0dGVuID0gXy5mbGF0dGVuXG5jb25zdCBzdHJpbmcgPSBpbmZsZWN0KClcblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgTW9kZWwge1xuICBzdGF0aWMgZnJvbURvY3VtZW50IChkb2N1bWVudCl7XG4gICAgcmV0dXJuIG5ldyBNb2RlbChkb2N1bWVudClcbiAgfVxuXG4gIGNvbnN0cnVjdG9yKGRvY3VtZW50LCBvcHRpb25zPXt9KSB7XG4gICAgdGhpcy5kb2N1bWVudCAgICAgPSBkb2N1bWVudFxuICAgIHRoaXMuZGF0YSAgICAgICAgID0gZG9jdW1lbnQuZGF0YSB8fCB7fVxuICAgIHRoaXMuZ3JvdXBOYW1lICAgID0gb3B0aW9ucy5ncm91cE5hbWUgfHwgXCJkb2N1bWVudHNcIlxuICAgIHRoaXMuaWQgICAgICAgICAgID0gb3B0aW9ucy5pZFxuICAgIHRoaXMuZG9jdW1lbnQuaWQgID0gdGhpcy5pZFxuICAgIFxuICAgIHRoaXMudHlwZSA9IHRoaXMuZGF0YS50eXBlIHx8IGRvY3VtZW50LmdldFR5cGUoKVxuICAgIHRoaXMuZ3JvdXBOYW1lID0gc3RyaW5nLnBsdXJhbGl6ZSh0aGlzLnR5cGUpXG4gICAgXG4gICAgT2JqZWN0LmtleXModGhpcy5kYXRhKS5mb3JFYWNoKGtleSA9PiB0aGlzW2tleV0gPSB0aGlzLmRhdGFba2V5XSlcbiAgfVxuXG4gIHRvU3RyaW5nKCl7XG4gICAgcmV0dXJuICdEb2N1bWVudDogJyArIHRoaXMuZG9jdW1lbnQucGF0aFxuICB9XG5cbiAgdG9KU09OKG9wdGlvbnM9e30pIHtcbiAgICByZXR1cm4ge1xuICAgICAgZGF0YTogdGhpcy5kYXRhXG4gICAgfVxuICB9XG5cbiAgZXh0cmFjdENvbnRlbnQoKSB7XG5cbiAgfVxuXG4gIGV4dHJhY3REYXRhKCkge1xuXG4gIH1cbiAgXG4gIGRlZmluZWRTZWN0aW9uTm9kZXMoKXtcbiAgICByZXR1cm4gdGhpcy5kb2N1bWVudC5nZXRTZWN0aW9uTm9kZXMoKS5maWx0ZXIobm9kZSA9PiB7XG4gICAgICByZXR1cm4gdGhpcy5leHBlY3RlZFNlY3Rpb25IZWFkaW5ncygpLmluZGV4T2Yobm9kZS5oZWFkaW5nKSA+PSAwXG4gICAgfSlcbiAgfVxuXG4gIGdldEF0dHJpYnV0ZUNvbmZpZyhrZXkpIHtcbiAgICByZXR1cm4gZ2V0QXR0cmlidXRlc0NvbmZpZygpW2tleV1cbiAgfVxuXG4gIGdldEF0dHJpYnV0ZXNDb25maWcoKSB7XG4gICAgcmV0dXJuIHRoaXMuZ2V0TW9kZWxEZWZpbml0aW9uKCkuYXR0cmlidXRlc1xuICB9XG5cbiAgZ2V0U2VjdGlvbnNDb25maWcoKXtcbiAgICByZXR1cm4gdGhpcy5nZXRNb2RlbERlZmluaXRpb24oKS5zZWN0aW9uc1xuICB9XG5cbiAgZXhwZWN0ZWRTZWN0aW9uSGVhZGluZ3MoKXtcbiAgICBjb25zdCBjZmcgPSB0aGlzLmdldFNlY3Rpb25zQ29uZmlnKClcbiAgICByZXR1cm4gZmxhdHRlbihPYmplY3QudmFsdWVzKGNmZykubWFwKGRlZiA9PiBbZGVmLm5hbWUsIGRlZi5hbGlhc2VzXSkpXG4gIH1cblxuICBnZXRNb2RlbERlZmluaXRpb24oKXtcbiAgICByZXR1cm4gTW9kZWxEZWZpbml0aW9uLmxvb2t1cCh0aGlzLnR5cGUpXG4gIH1cblxufVxuIl19