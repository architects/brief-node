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

function attacher(mdast, options) {
  var MarkdownCompiler = mdast.Compiler;

  MarkdownCompiler.prototype.div = divRenderer;

  return function transformer(ast) {
    (0, _mdastUtilVisit2['default'])(ast, 'heading', function (node) {
      node.attributes = { 'data-start': node.position.start.line };
    });

    var children = ast.children,
        length = children.length,
        first = children[0],
        wrapped = [];

    if (first && first.type === "yaml") {
      ast.children = children.slice(0, 1);
      ast.children.push({
        type: "div",
        children: children.slice(1, length),
        attributes: {
          'class': "wrapper"
        }
      });
    }
  };
}

module.exports = exports['default'];