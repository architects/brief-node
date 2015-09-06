'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _mdastUtilVisit = require('mdast-util-visit');

var _mdastUtilVisit2 = _interopRequireDefault(_mdastUtilVisit);

var _underscore = require('underscore');

var _underscore2 = _interopRequireDefault(_underscore);

exports['default'] = function () {
  return function (original) {
    var ast;

    ast = (0, _mdastUtilVisit2['default'])(original, 'heading', function (node) {
      var attributes = {};
      var startPosition = node.position && node.position.start || {};

      attributes['data-line-number'] = startPosition.begin;

      node.attributes = attributes;
    });

    return ast;
  };
};

module.exports = exports['default'];