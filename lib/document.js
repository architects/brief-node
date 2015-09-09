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

var _presenter = require("./presenter");

var _presenter2 = _interopRequireDefault(_presenter);

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
    this.options = options || {};
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
    key: 'present',
    value: function present(method) {
      var options = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

      var presenter = _presenter2['default'].present(this, options);
      return presenter[method]();
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
    key: 'getHeadingNodes',
    value: function getHeadingNodes() {
      return this.getChildren().filter(function (node) {
        return node.type === "heading";
      });
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

  nestElements(document);
  applyWrapper(document);

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

function nestElements(document) {
  var children = document.ast.children;

  var parent = undefined,
      previous = undefined;

  children.forEach(function (child) {
    if (previous) child.parentHeading = previous.headingIndex;

    if (child.type === "heading") previous = child;
  });
}

function applyWrapper(document) {
  document.ast.children = [{
    type: "paragraph",
    data: {
      htmlName: "div",
      htmlAttributes: {
        "class": "wrapper"
      }
    },
    children: document.ast.children
  }];
}
module.exports = exports['default'];
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3NyYy9kb2N1bWVudC5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7a0JBQWUsSUFBSTs7OztxQkFDRCxPQUFPOzs7O3lCQUNSLFlBQVk7Ozs7eUJBQ1osWUFBWTs7OztxQkFDWCxTQUFTOzs7O3lCQUNMLGFBQWE7Ozs7eUJBQ2IsYUFBYTs7OztzQ0FDZiwwQkFBMEI7Ozs7c0NBQ3hCLDBCQUEwQjs7Ozt1QkFDNUIsU0FBUzs7OzswQkFDZixZQUFZOzs7OzhCQUNSLGtCQUFrQjs7OztpQkFDaEIsR0FBRzs7OztBQUd2QixJQUFNLFNBQVMsR0FBRyxtQkFBTSxHQUFHLENBQUMsa0pBQXdDLENBQUMsQ0FBQTtBQUNyRSxJQUFNLFdBQVcsR0FBRyxxQkFBUyxDQUFBOztJQUVSLFFBQVE7ZUFBUixRQUFROztXQUNuQixvQkFBRztBQUNULGFBQU8sSUFBSSxDQUFDLElBQUksQ0FBQTtLQUNqQjs7Ozs7Ozs7QUFNVSxXQVRRLFFBQVEsQ0FTZixJQUFJLEVBQUUsT0FBTyxFQUFFOzBCQVRSLFFBQVE7O0FBVXpCLFFBQUksQ0FBQyxJQUFJLEdBQUcsSUFBSSxDQUFBO0FBQ2hCLFFBQUksQ0FBQyxPQUFPLEdBQUcsT0FBTyxJQUFJLEVBQUUsQ0FBQTtBQUM1QixXQUFPLENBQUMsSUFBSSxDQUFDLENBQUE7R0FDZDs7Ozs7Ozs7ZUFia0IsUUFBUTs7V0FvQm5CLG1CQUFhO1VBQVosT0FBTyx5REFBQyxFQUFFOztBQUNqQixhQUFPLG1CQUFNLFlBQVksQ0FBQyxJQUFJLEVBQUUsT0FBTyxDQUFDLENBQUE7S0FDekM7Ozs7Ozs7O1dBTU8sb0JBQUc7QUFDVCxVQUFJLENBQUMsTUFBTSxFQUFFLENBQUE7QUFDYixhQUFPLElBQUksQ0FBQTtLQUNaOzs7Ozs7OztXQU1LLGtCQUFHO0FBQ1AsYUFBTyxJQUFJLENBQUMsSUFBSSxHQUFHLElBQUksQ0FBQyxJQUFJLEdBQUcsT0FBTyxDQUFDLElBQUksQ0FBQyxDQUFBO0tBQzdDOzs7V0FFTyxpQkFB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QUE7Q0FDbEQ7O0FBRUQsU0FBUyxRQUFRLENBQUMsSUFBSSxFQUFFO0FBQ3RCLFNBQU8sZ0JBQUcsWUFBWSxDQUFDLElBQUksQ0FBQyxDQUFDLFFBQVEsRUFBRSxDQUFBO0NBQ3hDOztBQUVELFNBQVMsWUFBWSxDQUFFLFFBQVEsRUFBRTtBQUMvQixNQUFJLFFBQVEsR0FBRyxRQUFRLENBQUMsR0FBRyxDQUFDLFFBQVEsQ0FBQTs7QUFFcEMsTUFBSSxNQUFNLFlBQUE7TUFBRSxRQUFRLFlBQUEsQ0FBQTs7QUFFcEIsVUFBUSxDQUFDLE9BQU8sQ0FBQyxVQUFBLEtBQUssRUFBSTtBQUN4QixRQUFHLFFBQVEsRUFDVCxLQUFLLENBQUMsYUFBYSxHQUFHLFFBQVEsQ0FBQyxZQUFZLENBQUE7O0FBRTdDLFFBQUcsS0FBSyxDQUFDLElBQUksS0FBSyxTQUFTLEVBQ3pCLFFBQVEsR0FBRyxLQUFLLENBQUE7R0FDbkIsQ0FBQyxDQUFBO0NBQ0g7O0FBRUQsU0FBUyxZQUFZLENBQUUsUUFBUSxFQUFFO0FBQy9CLFVBQVEsQ0FBQyxHQUFHLENBQUMsUUFBUSxHQUFHLENBQUM7QUFDdkIsUUFBSSxFQUFFLFdBQVc7QUFDakIsUUFBSSxFQUFDO0FBQ0gsY0FBUSxFQUFFLEtBQUs7QUFDZixvQkFBYyxFQUFDO0FBQ2IsZUFBTyxFQUFFLFNBQVM7T0FDbkI7S0FDRjtBQUNELFlBQVEsRUFBRSxRQUFRLENBQUMsR0FBRyxDQUFDLFFBQVE7R0FDaEMsQ0FBQyxDQUFBO0NBQ0giLCJmaWxlIjoiZG9jdW1lbnQuanMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgZnMgZnJvbSAnZnMnXG5pbXBvcnQgbWRhc3QgZnJvbSAnbWRhc3QnXG5pbXBvcnQgeWFtbCBmcm9tICdtZGFzdC15YW1sJ1xuaW1wb3J0IGh0bWwgZnJvbSAnbWRhc3QtaHRtbCdcbmltcG9ydCBNb2RlbCBmcm9tICcuL21vZGVsJ1xuaW1wb3J0IFByZXNlbnRlciBmcm9tIFwiLi9wcmVzZW50ZXJcIlxuaW1wb3J0IHN0cnVjdHVyZSBmcm9tICcuL3N0cnVjdHVyZSdcbmltcG9ydCBzcXVlZXplIGZyb20gJ21kYXN0LXNxdWVlemUtcGFyYWdyYXBocydcbmltcG9ydCBub3JtYWxpemUgZnJvbSAnbWRhc3Qtbm9ybWFsaXplLWhlYWRpbmdzJyBcbmltcG9ydCBjaGVlcmlvIGZyb20gJ2NoZWVyaW8nXG5pbXBvcnQgXyBmcm9tICd1bmRlcnNjb3JlJ1xuaW1wb3J0IHZpc2l0IGZyb20gJ21kYXN0LXV0aWwtdmlzaXQnXG5pbXBvcnQgaW5mbGVjdCBmcm9tICdpJ1xuXG5cbmNvbnN0IHByb2Nlc3NvciA9IG1kYXN0LnVzZShbeWFtbCxzcXVlZXplLG5vcm1hbGl6ZSxzdHJ1Y3R1cmUsIGh0bWxdKVxuY29uc3QgaW5mbGVjdGlvbnMgPSBpbmZsZWN0KClcblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgRG9jdW1lbnQge1xuICB0b1N0cmluZygpIHtcbiAgICByZXR1cm4gdGhpcy5wYXRoXG4gIH1cbiAgXG4gIC8qKlxuICAgKiBjcmVhdGVzIGEgbmV3IGluc3RhbmNlIG9mIHRoZSBkb2N1bWVudCBhdCBwYXRoXG4gICAqIEBwYXJhbSB7cGF0aH0gcGF0aCAtIHRoZSBhYnNvbHV0ZSBwYXRoIHRvIHRoZSBtYXJrZG93biBkb2N1bWVudC5cbiAgKi9cbiAgY29uc3RydWN0b3IocGF0aCwgb3B0aW9ucykge1xuICAgIHRoaXMucGF0aCA9IHBhdGhcbiAgICB0aGlzLm9wdGlvbnMgPSBvcHRpb25zIHx8IHt9XG4gICAgcHJvY2Vzcyh0aGlzKVxuICB9XG4gIFxuICAvKipcbiAgICogZ2V0IGEgbW9kZWwgdG8gcmVwcmVzZW50IHRoaXMgZG9jdW1lbnQgYW5kIHRoZSBkYXRhIHdlIHBhcnNlIGZyb20gaXQuXG4gICAqXG4gICAqIEByZXR1cm4ge01vZGVsfSAtIGEgbW9kZWwgaW5zdGFuY2UgXG4gICovXG4gIHRvTW9kZWwgKG9wdGlvbnM9e30pIHtcbiAgICByZXR1cm4gTW9kZWwuZnJvbURvY3VtZW50KHRoaXMsIG9wdGlvbnMpXG4gIH1cbiAgXG4gIC8qKlxuICAgKiByZXR1cm5zIGEgcmVuZGVyZWQgZG9jdW1lbnRcbiAgICogQHJldHVybiB7RG9jdW1lbnR9IC0gdGhpcyBkb2N1bWVudFxuICAqL1xuICByZW5kZXJlZCgpIHtcbiAgICB0aGlzLnJlbmRlcigpXG4gICAgcmV0dXJuIHRoaXNcbiAgfVxuICBcbiAgLyoqXG4gICAqIHJlbmRlciB0aGUgZG9jdW1lbnQuXG4gICAqIEByZXR1cm4ge3N0cmluZ30gLSBSZW5kZXJlZCBIVE1MIGZyb20gdGhlIGRvY3VtZW50IG1hcmtkb3duXG4gICovXG4gIHJlbmRlcigpIHtcbiAgICByZXR1cm4gdGhpcy5odG1sID8gdGhpcy5odG1sIDogcHJvY2Vzcyh0aGlzKSBcbiAgfVxuXG4gIHByZXNlbnQgKG1ldGhvZCwgb3B0aW9ucz17fSkge1xuICAgIGxldCBwcmVzZW50ZXIgPSBQcmVzZW50ZXIucHJlc2VudCh0aGlzLCBvcHRpb25zKVxuICAgIHJldHVybiBwcmVzZW50ZXJbbWV0aG9kXSgpXG4gIH1cblxuICB2aXNpdCh0eXBlLCBpdGVyYXRvcikge1xuICAgIHZpc2l0KHRoaXMuYXN0LCB0eXBlLCBpdGVyYXRvcilcbiAgfVxuXG4gIGdldEFzdCAoKSB7XG4gICAgcmV0dXJuIHRoaXMuYXN0XG4gIH1cblxuICBnZXRDaGlsZHJlbiAoKSB7XG4gICAgcmV0dXJuIHRoaXMuYXN0LmNoaWxkcmVuWzBdLmNoaWxkcmVuICBcbiAgfVxuXG4gIGdldEhlYWRpbmdOb2RlcyAoKSB7XG4gICAgcmV0dXJuIHRoaXMuZ2V0Q2hpbGRyZW4oKS5maWx0ZXIobm9kZSA9PiBub2RlLnR5cGUgPT09IFwiaGVhZGluZ1wiKVxuICB9XG5cbiAgcnVuSG9vayAoaWRlbnRpZmllciA9IFwiXCIsIC4uLmFyZ3MpIHtcbiAgICBsZXQgaG9vayA9IHRoaXMub3B0aW9uc1tpZGVudGlmaWVyXSB8fCB0aGlzW2lkZW50aWZpZXJdXG5cbiAgICBpZih0eXBlb2YoaG9vaykgPT09IFwiZnVuY3Rpb25cIil7XG4gICAgICBob29rLmFwcGx5KHRoaXMsIGFyZ3MpXG4gICAgfVxuICB9XG59XG5cbmZ1bmN0aW9uIHBhcnNlIChkb2N1bWVudCkge1xuICBsZXQgcGFyc2VkID0gcHJvY2Vzc29yLnBhcnNlKGRvY3VtZW50LmNvbnRlbnQpLFxuICAgICAgbm9kZXMgID0gcGFyc2VkLmNoaWxkcmVuXG4gIFxuICBpZihub2Rlc1swXSAmJiBub2Rlc1swXS55YW1sKXtcbiAgICBkb2N1bWVudC5kYXRhID0gbm9kZXMuc3BsaWNlKDAsMSlbMF0ueWFtbFxuICB9XG4gIFxuICBsZXQgYXN0ID0gcHJvY2Vzc29yLnJ1bihwYXJzZWQpXG5cbiAgZG9jdW1lbnQucnVuSG9vayhcImRvY3VtZW50RGlkUGFyc2VcIiwgYXN0KVxuXG4gIHJldHVybiBhc3QgXG59XG5cbmZ1bmN0aW9uIHByb2Nlc3MgKGRvY3VtZW50KSB7XG4gIGRvY3VtZW50LmNvbnRlbnQgPSByZWFkUGF0aChkb2N1bWVudC5wYXRoKVxuXG4gIGRvY3VtZW50LmFzdCA9IHBhcnNlKGRvY3VtZW50KVxuICBkb2N1bWVudC5ydW5Ib29rKFwiZG9jdW1lbnRXaWxsUmVuZGVyXCIsIGRvY3VtZW50LmFzdClcbiAgXG4gIG5lc3RFbGVtZW50cyhkb2N1bWVudClcbiAgYXBwbHlXcmFwcGVyKGRvY3VtZW50KVxuXG4gIGRvY3VtZW50Lmh0bWwgPSBzdHJpbmdpZnkoZG9jdW1lbnQpXG4gIGRvY3VtZW50LiQgPSBjaGVlcmlvLmxvYWQoZG9jdW1lbnQuaHRtbClcbiAgZG9jdW1lbnQucnVuSG9vayhcImRvY3VtZW50RGlkUmVuZGVyXCIsIGRvY3VtZW50Lmh0bWwpXG5cbiAgcmV0dXJuIGRvY3VtZW50XG59XG5cbmZ1bmN0aW9uIHN0cmluZ2lmeSAoZG9jdW1lbnQsIG9wdGlvbnM9e30pIHtcbiAgcmV0dXJuIHByb2Nlc3Nvci5zdHJpbmdpZnkoZG9jdW1lbnQuYXN0LCBvcHRpb25zKVxufVxuXG5mdW5jdGlvbiByZWFkUGF0aChwYXRoKSB7XG4gIHJldHVybiBmcy5yZWFkRmlsZVN5bmMocGF0aCkudG9TdHJpbmcoKVxufVxuXG5mdW5jdGlvbiBuZXN0RWxlbWVudHMgKGRvY3VtZW50KSB7XG4gIGxldCBjaGlsZHJlbiA9IGRvY3VtZW50LmFzdC5jaGlsZHJlblxuXG4gIGxldCBwYXJlbnQsIHByZXZpb3VzXG5cbiAgY2hpbGRyZW4uZm9yRWFjaChjaGlsZCA9PiB7XG4gICAgaWYocHJldmlvdXMpXG4gICAgICBjaGlsZC5wYXJlbnRIZWFkaW5nID0gcHJldmlvdXMuaGVhZGluZ0luZGV4XG4gICAgXG4gICAgaWYoY2hpbGQudHlwZSA9PT0gXCJoZWFkaW5nXCIpXG4gICAgICBwcmV2aW91cyA9IGNoaWxkXG4gIH0pXG59XG5cbmZ1bmN0aW9uIGFwcGx5V3JhcHBlciAoZG9jdW1lbnQpIHtcbiAgZG9jdW1lbnQuYXN0LmNoaWxkcmVuID0gW3sgXG4gICAgdHlwZTogXCJwYXJhZ3JhcGhcIixcbiAgICBkYXRhOntcbiAgICAgIGh0bWxOYW1lOiBcImRpdlwiLFxuICAgICAgaHRtbEF0dHJpYnV0ZXM6e1xuICAgICAgICBcImNsYXNzXCI6IFwid3JhcHBlclwiXG4gICAgICB9XG4gICAgfSxcbiAgICBjaGlsZHJlbjogZG9jdW1lbnQuYXN0LmNoaWxkcmVuXG4gIH1dXG59XG4iXX0=