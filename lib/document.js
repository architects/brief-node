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

var _structure = require('./structure');

var _structure2 = _interopRequireDefault(_structure);

var _mdastSqueezeParagraphs = require('mdast-squeeze-paragraphs');

var _mdastSqueezeParagraphs2 = _interopRequireDefault(_mdastSqueezeParagraphs);

var _mdastNormalizeHeadings = require('mdast-normalize-headings');

var _mdastNormalizeHeadings2 = _interopRequireDefault(_mdastNormalizeHeadings);

var _cheerio = require('cheerio');

var _cheerio2 = _interopRequireDefault(_cheerio);

var _underscore = require('underscore');

var _underscore2 = _interopRequireDefault(_underscore);

var processor = _mdast2['default'].use([_mdastYaml2['default'], _mdastSqueezeParagraphs2['default'], _mdastNormalizeHeadings2['default'], _structure2['default'], _mdastHtml2['default']]);

var Document = (function () {
  _createClass(Document, [{
    key: 'toString',
    value: function toString() {
      return this.path;
    }
  }]);

  function Document(path, options) {
    _classCallCheck(this, Document);

    this.path = path;
    this.options = options;
    this.process();
  }

  _createClass(Document, [{
    key: 'rendered',
    value: function rendered() {
      this.render();
      return this;
    }
  }, {
    key: 'render',
    value: function render() {
      this.process();
    }
  }, {
    key: 'process',
    value: function process() {
      this.content = readPath(this.path);
      this.ast = processor.parse(this.content);

      if (this.options.contentWasParsed) {
        this.options.contentWasParsed.call(this, this.ast);
      }

      this.ast = processor.run(this.ast);

      if (this.getFirstNode() && this.getFirstNode().type === "yaml") {
        this.data = this.getFirstNode().yaml;
      }

      if (this.options.beforeRender) {
        this.options.beforeRender.call(this, this.ast);
      }

      this.html = processor.stringify(this.ast);
      this.$ = _cheerio2['default'].load(this.html);

      this.html;
    }
  }, {
    key: 'toModel',
    value: function toModel() {
      return _model2['default'].create(this.path, this.options);
    }
  }, {
    key: 'getFirstNode',
    value: function getFirstNode() {
      return this.ast && this.ast.children && this.ast.children[0];
    }
  }]);

  return Document;
})();

exports['default'] = Document;

function readPath(path) {
  return _fs2['default'].readFileSync(path).toString();
}
module.exports = exports['default'];