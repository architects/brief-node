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

var _mdastUtilVisit = require('mdast-util-visit');

var _mdastUtilVisit2 = _interopRequireDefault(_mdastUtilVisit);

var _i = require('i');

var _i2 = _interopRequireDefault(_i);

var processor = _mdast2['default'].use([_mdastYaml2['default'], _mdastSqueezeParagraphs2['default'], _mdastNormalizeHeadings2['default'], _structure2['default'], _mdastHtml2['default']]);
var inflections = (0, _i2['default'])();

var Document = (function () {
  _createClass(Document, [{
    key: 'toString',
    value: function toString() {
      return this.path;
    }

    /**
     * creates a new instance of the document at path
     * @param {path} path - the absolute path to the markdown document.
    */
  }]);

  function Document(path, options) {
    _classCallCheck(this, Document);

    this.path = path;
    this.options = options;
    process(this);
  }

  /**
   * get a model to represent this document and the data we parse from it.
   *
   * @return {Model} - a model instance 
  */

  _createClass(Document, [{
    key: 'toModel',
    value: function toModel() {
      var options = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

      return _model2['default'].fromDocument(this, options);
    }

    /**
     * returns a rendered document
     * @return {Document} - this document
    */
  }, {
    key: 'rendered',
    value: function rendered() {
      this.render();
      return this;
    }

    /**
     * render the document.
     * @return {string} - Rendered HTML from the document markdown
    */
  }, {
    key: 'render',
    value: function render() {
      return this.html ? this.html : process(this);
    }
  }, {
    key: 'visit',
    value: function visit(type, iterator) {
      (0, _mdastUtilVisit2['default'])(this.ast, type, iterator);
    }
  }, {
    key: 'getAst',
    value: function getAst() {
      return this.ast;
    }
  }, {
    key: 'getChildren',
    value: function getChildren() {
      return this.ast.children[0].children;
    }
  }, {
    key: 'runHook',
    value: function runHook() {
      var identifier = arguments.length <= 0 || arguments[0] === undefined ? "" : arguments[0];

      var hook = this.options[identifier] || this[identifier];

      if (typeof hook === "function") {
        for (var _len = arguments.length, args = Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
          args[_key - 1] = arguments[_key];
        }

        hook.apply(this, args);
      }
    }
  }]);

  return Document;
})();

exports['default'] = Document;

function parse(document) {
  var parsed = processor.parse(document.content),
      nodes = parsed.children;

  if (nodes[0] && nodes[0].yaml) {
    document.data = nodes.splice(0, 1)[0].yaml;
  }

  var ast = processor.run(parsed);

  document.runHook("documentDidParse", ast);

  return ast;
}

function process(document) {
  document.content = readPath(document.path);

  document.ast = parse(document);
  document.runHook("documentWillRender", document.ast);

  applyWrapper(document.ast, document.id, document.options.wrapperClass || "wrapper");

  document.html = stringify(document);
  document.$ = _cheerio2['default'].load(document.html);
  document.runHook("documentDidRender", document.html);

  return document;
}

function stringify(document) {
  var options = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

  return processor.stringify(document.ast, options);
}

function readPath(path) {
  return _fs2['default'].readFileSync(path).toString();
}

function applyWrapper(ast, id, wrapperClass) {
  var attributes = arguments.length <= 3 || arguments[3] === undefined ? {} : arguments[3];

  attributes.id = id;
  attributes['class'] = wrapperClass;

  ast.children = [{
    type: "div",
    attributes: attributes,
    children: ast.children
  }];

  return ast;
}
module.exports = exports['default'];