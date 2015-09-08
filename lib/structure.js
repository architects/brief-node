'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});
exports['default'] = attacher;

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _mdastUtilVisit = require('mdast-util-visit');

var _mdastUtilVisit2 = _interopRequireDefault(_mdastUtilVisit);

var _node_modulesMdastHtmlLibH = require('../node_modules/mdast-html/lib/h');

var _node_modulesMdastHtmlLibH2 = _interopRequireDefault(_node_modulesMdastHtmlLibH);

var divRenderer = function divRenderer(node) {
  return (0, _node_modulesMdastHtmlLibH2['default'])(this, node, 'div', this.all(node).join('\n'), true);
};

var sectionRenderer = function sectionRenderer(node) {
  return (0, _node_modulesMdastHtmlLibH2['default'])(this, node, 'section', this.all(node).join('\n'), true);
};

var articleRenderer = function articleRenderer(node) {
  return (0, _node_modulesMdastHtmlLibH2['default'])(this, node, 'article', this.all(node).join('\n'), true);
};

var slice = Array.prototype.slice;
var splice = Array.prototype.splice;

function attacher(mdast, options) {
  var MarkdownCompiler = mdast.Compiler;

  MarkdownCompiler.prototype.div = divRenderer;
  MarkdownCompiler.prototype.section = sectionRenderer;
  MarkdownCompiler.prototype.article = articleRenderer;

  return function transformer(ast) {
    var headingIndex = 0;

    var headings = ast.children.filter(function (child) {
      return child.type === "heading";
    });

    var previousHeading = undefined,
        parentHeading = undefined;

    ast.children.forEach(function (child) {
      if (child.type === "heading") {
        child.headingIndex = ++headingIndex;
        child.attributes = child.attributes || {};
        child.attributes['data-line-number'] = child.position.start.line;
      }

      if (previousHeading) {
        child.p;
      }

      if (child.type === "heading") {
        previousHeading = child;
      }
    });
  };
}

module.exports = exports['default'];