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

    if (this.data.type) {
      this.groupName = string.pluralize(this.data.type);
    }

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
//# sourceMappingURL=data:application/json;base64,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Q3pDOzs7U0E5RGtCLEtBQUs7OztxQkFBTCxLQUFLIiwiZmlsZSI6Im1vZGVsLmpzIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IF8gZnJvbSAndW5kZXJzY29yZSdcbmltcG9ydCBpbmZsZWN0IGZyb20gJ2knXG5cbmltcG9ydCBEb2N1bWVudCBmcm9tICcuL2RvY3VtZW50J1xuaW1wb3J0IE1vZGVsRGVmaW5pdGlvbiBmcm9tICcuL21vZGVsX2RlZmluaXRpb24nXG5pbXBvcnQgQnJpZWZjYXNlIGZyb20gJy4vYnJpZWZjYXNlJ1xuaW1wb3J0IHtmcmFnbWVudH0gZnJvbSAnLi9yZW5kZXInXG5cbmNvbnN0IGZsYXR0ZW4gPSBfLmZsYXR0ZW5cbmNvbnN0IHN0cmluZyA9IGluZmxlY3QoKVxuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBNb2RlbCB7XG4gIHN0YXRpYyBmcm9tRG9jdW1lbnQgKGRvY3VtZW50KXtcbiAgICByZXR1cm4gbmV3IE1vZGVsKGRvY3VtZW50KVxuICB9XG5cbiAgY29uc3RydWN0b3IoZG9jdW1lbnQsIG9wdGlvbnM9e30pIHtcbiAgICB0aGlzLmRvY3VtZW50ICAgICA9IGRvY3VtZW50XG4gICAgdGhpcy5kYXRhICAgICAgICAgPSBkb2N1bWVudC5kYXRhIHx8IHt9XG4gICAgdGhpcy5ncm91cE5hbWUgICAgPSBvcHRpb25zLmdyb3VwTmFtZSB8fCBcImRvY3VtZW50c1wiXG4gICAgdGhpcy5pZCAgICAgICAgICAgPSBvcHRpb25zLmlkXG4gICAgdGhpcy5kb2N1bWVudC5pZCAgPSB0aGlzLmlkXG5cbiAgICBpZih0aGlzLmRhdGEudHlwZSl7XG4gICAgICB0aGlzLmdyb3VwTmFtZSA9IHN0cmluZy5wbHVyYWxpemUodGhpcy5kYXRhLnR5cGUpXG4gICAgfVxuICAgIFxuICAgIE9iamVjdC5rZXlzKHRoaXMuZGF0YSkuZm9yRWFjaChrZXkgPT4gdGhpc1trZXldID0gdGhpcy5kYXRhW2tleV0pXG4gIH1cblxuICB0b1N0cmluZygpe1xuICAgIHJldHVybiAnRG9jdW1lbnQ6ICcgKyB0aGlzLmRvY3VtZW50LnBhdGhcbiAgfVxuXG4gIHRvSlNPTihvcHRpb25zPXt9KSB7XG4gICAgcmV0dXJuIHtcbiAgICAgIGRhdGE6IHRoaXMuZGF0YVxuICAgIH1cbiAgfVxuXG4gIGV4dHJhY3RDb250ZW50KCkge1xuXG4gIH1cblxuICBleHRyYWN0RGF0YSgpIHtcblxuICB9XG4gIFxuICBkZWZpbmVkU2VjdGlvbk5vZGVzKCl7XG4gICAgcmV0dXJuIHRoaXMuZG9jdW1lbnQuZ2V0U2VjdGlvbk5vZGVzKCkuZmlsdGVyKG5vZGUgPT4ge1xuICAgICAgcmV0dXJuIHRoaXMuZXhwZWN0ZWRTZWN0aW9uSGVhZGluZ3MoKS5pbmRleE9mKG5vZGUuaGVhZGluZykgPj0gMFxuICAgIH0pXG4gIH1cblxuICBnZXRBdHRyaWJ1dGVDb25maWcoa2V5KSB7XG4gICAgcmV0dXJuIGdldEF0dHJpYnV0ZXNDb25maWcoKVtrZXldXG4gIH1cblxuICBnZXRBdHRyaWJ1dGVzQ29uZmlnKCkge1xuICAgIHJldHVybiB0aGlzLmdldE1vZGVsRGVmaW5pdGlvbigpLmF0dHJpYnV0ZXNcbiAgfVxuXG4gIGdldFNlY3Rpb25zQ29uZmlnKCl7XG4gICAgcmV0dXJuIHRoaXMuZ2V0TW9kZWxEZWZpbml0aW9uKCkuc2VjdGlvbnNcbiAgfVxuXG4gIGV4cGVjdGVkU2VjdGlvbkhlYWRpbmdzKCl7XG4gICAgY29uc3QgY2ZnID0gdGhpcy5nZXRTZWN0aW9uc0NvbmZpZygpXG4gICAgcmV0dXJuIGZsYXR0ZW4oT2JqZWN0LnZhbHVlcyhjZmcpLm1hcChkZWYgPT4gW2RlZi5uYW1lLCBkZWYuYWxpYXNlc10pKVxuICB9XG5cbiAgZ2V0TW9kZWxEZWZpbml0aW9uKCl7XG4gICAgcmV0dXJuIE1vZGVsRGVmaW5pdGlvbi5sb29rdXAodGhpcy50eXBlKVxuICB9XG5cbn1cbiJdfQ==