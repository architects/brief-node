'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

var _mdast = require('mdast');

var _mdast2 = _interopRequireDefault(_mdast);

var _mdastYaml = require('mdast-yaml');

var _mdastYaml2 = _interopRequireDefault(_mdastYaml);

var _mdastHtml = require('mdast-html');

var _mdastHtml2 = _interopRequireDefault(_mdastHtml);

var _model = require('./model');

var _model2 = _interopRequireDefault(_model);

var _jsYaml = require('js-yaml');

var _jsYaml2 = _interopRequireDefault(_jsYaml);

var _mdastSqueezeParagraphs = require('mdast-squeeze-paragraphs');

var _mdastSqueezeParagraphs2 = _interopRequireDefault(_mdastSqueezeParagraphs);

var _mdastNormalizeHeadings = require('mdast-normalize-headings');

var _mdastNormalizeHeadings2 = _interopRequireDefault(_mdastNormalizeHeadings);

var yamlProcessor = _mdast2['default'].use(_mdastYaml2['default']);
var htmlProcessor = _mdast2['default'].use(_mdastHtml2['default'], _mdastSqueezeParagraphs2['default'], _mdastNormalizeHeadings2['default']);

var Document = (function () {
  function Document(path, options) {
    _classCallCheck(this, Document);

    this.path = path;
    this.options = options;

    this.readContent();
    this.buildMetaData();
  }

  _createClass(Document, [{
    key: 'render',
    value: function render() {
      return this.toRawHTML();
    }
  }, {
    key: 'toModel',
    value: function toModel() {
      return _model2['default'].create(this.path, this.options);
    }
  }, {
    key: 'buildMetaData',
    value: function buildMetaData() {
      this.data = this.parseFrontMatter() || {};
    }
  }, {
    key: 'structureRenderedContent',
    value: function structureRenderedContent() {}
  }, {
    key: 'parseFrontMatter',
    value: function parseFrontMatter() {
      var data = this.toParsed();
      var children = data.children || [];
      var el = children[0];

      if (el.type == "yaml" && el.value && el.value.length > 0) {
        return _jsYaml2['default'].load(el.value);
      }
    }
  }, {
    key: 'readContent',
    value: function readContent() {
      this.content = _fs2['default'].readFileSync(this.path).toString();
    }

    /* 
    * Renders the markdown to Raw HTML. 
    */
  }, {
    key: 'toRawHTML',
    value: function toRawHTML() {
      var options = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

      this.raw_html = htmlProcessor.process(this.content);
      return this.raw_html;
    }
  }, {
    key: 'toParsed',
    value: function toParsed() {
      return yamlProcessor.parse(this.content);
    }
  }]);

  return Document;
})();

exports['default'] = Document;
module.exports = exports['default'];