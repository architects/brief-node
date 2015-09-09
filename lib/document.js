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

var _underscoreString = require('underscore.string');

var _underscoreString2 = _interopRequireDefault(_underscoreString);

var processor = _mdast2['default'].use([_mdastYaml2['default'], _mdastSqueezeParagraphs2['default'], _mdastNormalizeHeadings2['default'], _mdastHtml2['default']]);

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
      var results = [];
      this.visit('heading', function (node) {
        return results.push(node);
      });
      return results;
    }

    /**
    * Given a css selector, return each of the elements
    *   wrapped with a cheerio object. 
    *
    * @param {string} selector - a css selector to match
    * @return - an underscore wrapped array of elements
    */
  }, {
    key: 'elements',
    value: function elements() {
      return (0, _underscore2['default'])(this.$.apply(this, arguments).map(function (index, el) {
        return (0, _cheerio2['default'])(el);
      }));
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
  collapseSections(document);
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
  var headings = document.ast.children.filter(function (c) {
    return c.type === "heading";
  });

  var index = 0;
  var previous = undefined;

  children.forEach(function (child) {
    var data = child.data;

    if (child.type === "heading") {
      delete child.data;

      var text = child.children[0] && child.children[0].value;

      data = data || {};
      data.htmlName = "section";
      data.htmlAttributes = data.htmlAttributes || {};

      if (child.depth >= 3) {
        data.htmlName = "article";
      }

      if (text) {
        data.htmlAttributes['data-heading'] = _underscoreString2['default'].dasherize(text.toLowerCase());
      }

      previous = children[index] = {
        type: "div",
        depth: child.depth,
        headingIndex: child.headingIndex,
        container: true,
        data: data,
        children: [child]
      };
    } else if (previous) {
      previous.children.push(_underscore2['default'].clone(child));
      child.markForRemoval = true;
    }

    index = index + 1;
  });

  document.ast.wrapped = true;
  document.ast.children = children.filter(function (child) {
    return !child.markForRemoval;
  });
}

function collapseSections(document) {
  var children = document.ast.children;
  var previous = undefined;

  children.forEach(function (child) {
    var name = child.data.htmlName;
    if (name === "section") {
      previous = child;
    }

    if (previous && name === "article") {
      previous.children.push(_underscore2['default'].clone(child));
      child.markForDelete = true;
    }
  });

  document.ast.children = children.filter(function (child) {
    return !child.markForDelete;
  });
}

function applyWrapper(document) {
  document.ast.children = [{
    type: "strong",
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
//# sourceMappingURL=data:application/json;base64,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QUFJLFFBQVEsWUFBQSxDQUFBOztBQUVaLFVBQVEsQ0FBQyxPQUFPLENBQUMsVUFBQSxLQUFLLEVBQUk7QUFDeEIsUUFBSSxJQUFJLEdBQUcsS0FBSyxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUE7QUFDOUIsUUFBRyxJQUFJLEtBQUssU0FBUyxFQUFDO0FBQ3BCLGNBQVEsR0FBRyxLQUFLLENBQUE7S0FDakI7O0FBRUQsUUFBRyxRQUFRLElBQUksSUFBSSxLQUFLLFNBQVMsRUFBQztBQUNoQyxjQUFRLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyx3QkFBRSxLQUFLLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQTtBQUN0QyxXQUFLLENBQUMsYUFBYSxHQUFHLElBQUksQ0FBQTtLQUMzQjtHQUNGLENBQUMsQ0FBQTs7QUFFRixVQUFRLENBQUMsR0FBRyxDQUFDLFFBQVEsR0FBRyxRQUFRLENBQUMsTUFBTSxDQUFDLFVBQUEsS0FBSztXQUFJLENBQUMsS0FBSyxDQUFDLGFBQWE7R0FBQSxDQUFDLENBQUE7Q0FDdkU7O0FBRUQsU0FBUyxZQUFZLENBQUUsUUFBUSxFQUFFO0FBQy9CLFVBQVEsQ0FBQyxHQUFHLENBQUMsUUFBUSxHQUFHLENBQUM7QUFDdkIsUUFBSSxFQUFFLFFBQVE7QUFDZCxRQUFJLEVBQUM7QUFDSCxjQUFRLEVBQUUsS0FBSztBQUNmLG9CQUFjLEVBQUM7QUFDYixlQUFPLEVBQUUsU0FBUztPQUNuQjtLQUNGO0FBQ0QsWUFBUSxFQUFFLFFBQVEsQ0FBQyxHQUFHLENBQUMsUUFBUTtHQUNoQyxDQUFDLENBQUE7Q0FDSCIsImZpbGUiOiJkb2N1bWVudC5qcyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCBmcyBmcm9tICdmcydcbmltcG9ydCBtZGFzdCBmcm9tICdtZGFzdCdcbmltcG9ydCB5YW1sIGZyb20gJ21kYXN0LXlhbWwnXG5pbXBvcnQgaHRtbCBmcm9tICdtZGFzdC1odG1sJ1xuaW1wb3J0IE1vZGVsIGZyb20gJy4vbW9kZWwnXG5pbXBvcnQgUHJlc2VudGVyIGZyb20gXCIuL3ByZXNlbnRlclwiXG5pbXBvcnQgc3F1ZWV6ZSBmcm9tICdtZGFzdC1zcXVlZXplLXBhcmFncmFwaHMnXG5pbXBvcnQgbm9ybWFsaXplIGZyb20gJ21kYXN0LW5vcm1hbGl6ZS1oZWFkaW5ncycgXG5pbXBvcnQgY2hlZXJpbyBmcm9tICdjaGVlcmlvJ1xuaW1wb3J0IF8gZnJvbSAndW5kZXJzY29yZSdcbmltcG9ydCB2aXNpdCBmcm9tICdtZGFzdC11dGlsLXZpc2l0J1xuaW1wb3J0IGluZmxlY3Rpb25zIGZyb20gJ3VuZGVyc2NvcmUuc3RyaW5nJ1xuXG5cbmNvbnN0IHByb2Nlc3NvciA9IG1kYXN0LnVzZShbeWFtbCxzcXVlZXplLG5vcm1hbGl6ZSxodG1sXSlcblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgRG9jdW1lbnQge1xuICB0b1N0cmluZygpIHtcbiAgICByZXR1cm4gdGhpcy5wYXRoXG4gIH1cbiAgXG4gIC8qKlxuICAgKiBjcmVhdGVzIGEgbmV3IGluc3RhbmNlIG9mIHRoZSBkb2N1bWVudCBhdCBwYXRoXG4gICAqIEBwYXJhbSB7cGF0aH0gcGF0aCAtIHRoZSBhYnNvbHV0ZSBwYXRoIHRvIHRoZSBtYXJrZG93biBkb2N1bWVudC5cbiAgKi9cbiAgY29uc3RydWN0b3IocGF0aCwgb3B0aW9ucykge1xuICAgIHRoaXMucGF0aCA9IHBhdGhcbiAgICB0aGlzLm9wdGlvbnMgPSBvcHRpb25zIHx8IHt9XG4gICAgcHJvY2Vzcyh0aGlzKVxuICB9XG4gIFxuICAvKipcbiAgICogZ2V0IGEgbW9kZWwgdG8gcmVwcmVzZW50IHRoaXMgZG9jdW1lbnQgYW5kIHRoZSBkYXRhIHdlIHBhcnNlIGZyb20gaXQuXG4gICAqXG4gICAqIEByZXR1cm4ge01vZGVsfSAtIGEgbW9kZWwgaW5zdGFuY2UgXG4gICovXG4gIHRvTW9kZWwgKG9wdGlvbnM9e30pIHtcbiAgICByZXR1cm4gTW9kZWwuZnJvbURvY3VtZW50KHRoaXMsIG9wdGlvbnMpXG4gIH1cbiAgXG4gIC8qKlxuICAgKiByZXR1cm5zIGEgcmVuZGVyZWQgZG9jdW1lbnRcbiAgICogQHJldHVybiB7RG9jdW1lbnR9IC0gdGhpcyBkb2N1bWVudFxuICAqL1xuICByZW5kZXJlZCgpIHtcbiAgICB0aGlzLnJlbmRlcigpXG4gICAgcmV0dXJuIHRoaXNcbiAgfVxuICBcbiAgLyoqXG4gICAqIHJlbmRlciB0aGUgZG9jdW1lbnQuXG4gICAqIEByZXR1cm4ge3N0cmluZ30gLSBSZW5kZXJlZCBIVE1MIGZyb20gdGhlIGRvY3VtZW50IG1hcmtkb3duXG4gICovXG4gIHJlbmRlcigpIHtcbiAgICByZXR1cm4gdGhpcy5odG1sID8gdGhpcy5odG1sIDogcHJvY2Vzcyh0aGlzKSBcbiAgfVxuXG4gIHByZXNlbnQgKG1ldGhvZCwgb3B0aW9ucz17fSkge1xuICAgIGxldCBwcmVzZW50ZXIgPSBQcmVzZW50ZXIucHJlc2VudCh0aGlzLCBvcHRpb25zKVxuICAgIHJldHVybiBwcmVzZW50ZXJbbWV0aG9kXSgpXG4gIH1cblxuICB2aXNpdCh0eXBlLCBpdGVyYXRvcikge1xuICAgIHZpc2l0KHRoaXMuYXN0LCB0eXBlLCBpdGVyYXRvcilcbiAgfVxuXG4gIGdldEFzdCAoKSB7XG4gICAgcmV0dXJuIHRoaXMuYXN0XG4gIH1cblxuICBnZXRDaGlsZHJlbiAoKSB7XG4gICAgcmV0dXJuIHRoaXMuYXN0LmNoaWxkcmVuWzBdLmNoaWxkcmVuICBcbiAgfVxuXG4gIGdldEhlYWRpbmdOb2RlcyAoKSB7XG4gICAgbGV0IHJlc3VsdHMgPSBbXVxuICAgIHRoaXMudmlzaXQoJ2hlYWRpbmcnLCBub2RlID0+IHJlc3VsdHMucHVzaChub2RlKSlcbiAgICByZXR1cm4gcmVzdWx0c1xuICB9XG4gIFxuICAvKipcbiAgKiBHaXZlbiBhIGNzcyBzZWxlY3RvciwgcmV0dXJuIGVhY2ggb2YgdGhlIGVsZW1lbnRzXG4gICogICB3cmFwcGVkIHdpdGggYSBjaGVlcmlvIG9iamVjdC4gXG4gICpcbiAgKiBAcGFyYW0ge3N0cmluZ30gc2VsZWN0b3IgLSBhIGNzcyBzZWxlY3RvciB0byBtYXRjaFxuICAqIEByZXR1cm4gLSBhbiB1bmRlcnNjb3JlIHdyYXBwZWQgYXJyYXkgb2YgZWxlbWVudHNcbiAgKi9cbiAgZWxlbWVudHMgKC4uLmFyZ3MpIHtcbiAgICByZXR1cm4gXyh0aGlzLiQoLi4uYXJncykubWFwKChpbmRleCxlbCk9PntcbiAgICAgIHJldHVybiBjaGVlcmlvKGVsKVxuICAgIH0pKVxuICB9XG5cbiAgcnVuSG9vayAoaWRlbnRpZmllciA9IFwiXCIsIC4uLmFyZ3MpIHtcbiAgICBsZXQgaG9vayA9IHRoaXMub3B0aW9uc1tpZGVudGlmaWVyXSB8fCB0aGlzW2lkZW50aWZpZXJdXG5cbiAgICBpZih0eXBlb2YoaG9vaykgPT09IFwiZnVuY3Rpb25cIil7XG4gICAgICBob29rLmFwcGx5KHRoaXMsIGFyZ3MpXG4gICAgfVxuICB9XG59XG5cbmZ1bmN0aW9uIHBhcnNlIChkb2N1bWVudCkge1xuICBsZXQgcGFyc2VkID0gcHJvY2Vzc29yLnBhcnNlKGRvY3VtZW50LmNvbnRlbnQpLFxuICAgICAgbm9kZXMgID0gcGFyc2VkLmNoaWxkcmVuXG4gIFxuICBpZihub2Rlc1swXSAmJiBub2Rlc1swXS55YW1sKXtcbiAgICBkb2N1bWVudC5kYXRhID0gbm9kZXMuc3BsaWNlKDAsMSlbMF0ueWFtbFxuICB9XG4gIFxuICBsZXQgYXN0ID0gcHJvY2Vzc29yLnJ1bihwYXJzZWQpXG5cbiAgZG9jdW1lbnQucnVuSG9vayhcImRvY3VtZW50RGlkUGFyc2VcIiwgYXN0KVxuXG4gIHJldHVybiBhc3QgXG59XG5cbmZ1bmN0aW9uIHByb2Nlc3MgKGRvY3VtZW50KSB7XG4gIGRvY3VtZW50LmNvbnRlbnQgPSByZWFkUGF0aChkb2N1bWVudC5wYXRoKVxuXG4gIGRvY3VtZW50LmFzdCA9IHBhcnNlKGRvY3VtZW50KVxuICBkb2N1bWVudC5ydW5Ib29rKFwiZG9jdW1lbnRXaWxsUmVuZGVyXCIsIGRvY3VtZW50LmFzdClcbiAgXG4gIG5lc3RFbGVtZW50cyhkb2N1bWVudClcbiAgY29sbGFwc2VTZWN0aW9ucyhkb2N1bWVudClcbiAgYXBwbHlXcmFwcGVyKGRvY3VtZW50KVxuXG4gIGRvY3VtZW50Lmh0bWwgPSBzdHJpbmdpZnkoZG9jdW1lbnQpXG4gIGRvY3VtZW50LiQgPSBjaGVlcmlvLmxvYWQoZG9jdW1lbnQuaHRtbClcblxuXG4gIGRvY3VtZW50LnJ1bkhvb2soXCJkb2N1bWVudERpZFJlbmRlclwiLCBkb2N1bWVudC5odG1sKVxuXG4gIHJldHVybiBkb2N1bWVudFxufVxuXG5mdW5jdGlvbiBzdHJpbmdpZnkgKGRvY3VtZW50LCBvcHRpb25zPXt9KSB7XG4gIHJldHVybiBwcm9jZXNzb3Iuc3RyaW5naWZ5KGRvY3VtZW50LmFzdCwgb3B0aW9ucylcbn1cblxuZnVuY3Rpb24gcmVhZFBhdGgocGF0aCkge1xuICByZXR1cm4gZnMucmVhZEZpbGVTeW5jKHBhdGgpLnRvU3RyaW5nKClcbn1cblxuZnVuY3Rpb24gbmVzdEVsZW1lbnRzIChkb2N1bWVudCkge1xuICBsZXQgY2hpbGRyZW4gPSBkb2N1bWVudC5hc3QuY2hpbGRyZW5cbiAgbGV0IGhlYWRpbmdzID0gZG9jdW1lbnQuYXN0LmNoaWxkcmVuLmZpbHRlcihjID0+IGMudHlwZSA9PT0gXCJoZWFkaW5nXCIpXG5cdFxuXHRsZXQgaW5kZXggPSAwXG5cdGxldCBwcmV2aW91c1xuXG5cdGNoaWxkcmVuLmZvckVhY2goY2hpbGQgPT4ge1xuXHRcdGxldCBkYXRhID0gY2hpbGQuZGF0YSBcblxuXHRcdGlmKGNoaWxkLnR5cGUgPT09IFwiaGVhZGluZ1wiKXtcblx0XHRcdGRlbGV0ZShjaGlsZC5kYXRhKVxuICAgICAgXG4gICAgICBsZXQgdGV4dCA9IGNoaWxkLmNoaWxkcmVuWzBdICYmIGNoaWxkLmNoaWxkcmVuWzBdLnZhbHVlXG5cbiAgICAgIGRhdGEgPSBkYXRhIHx8IHt9XG4gICAgICBkYXRhLmh0bWxOYW1lID0gXCJzZWN0aW9uXCJcbiAgICAgIGRhdGEuaHRtbEF0dHJpYnV0ZXMgPSBkYXRhLmh0bWxBdHRyaWJ1dGVzIHx8IHt9XG5cbiAgICAgIGlmKGNoaWxkLmRlcHRoID49IDMpe1xuICAgICAgICBkYXRhLmh0bWxOYW1lID0gXCJhcnRpY2xlXCJcbiAgICAgIH1cblxuICAgICAgaWYodGV4dCl7XG4gICAgICAgIGRhdGEuaHRtbEF0dHJpYnV0ZXNbJ2RhdGEtaGVhZGluZyddID0gaW5mbGVjdGlvbnMuZGFzaGVyaXplKHRleHQudG9Mb3dlckNhc2UoKSlcbiAgICAgIH1cblxuXHRcdFx0cHJldmlvdXMgPSBjaGlsZHJlbltpbmRleF0gPSB7XG5cdFx0XHRcdHR5cGU6IFwiZGl2XCIsXG4gICAgICAgIGRlcHRoOiBjaGlsZC5kZXB0aCxcblx0XHRcdFx0aGVhZGluZ0luZGV4OiBjaGlsZC5oZWFkaW5nSW5kZXgsXG5cdFx0XHRcdGNvbnRhaW5lcjogdHJ1ZSxcblx0XHRcdFx0ZGF0YTogZGF0YSxcblx0XHRcdFx0Y2hpbGRyZW46IFtjaGlsZF1cblx0XHRcdH1cblx0XHR9IGVsc2UgaWYocHJldmlvdXMpIHtcblx0XHRcdHByZXZpb3VzLmNoaWxkcmVuLnB1c2goXy5jbG9uZShjaGlsZCkpXG5cdFx0XHRjaGlsZC5tYXJrRm9yUmVtb3ZhbCA9IHRydWVcblx0XHR9XG5cblx0XHRpbmRleCA9IGluZGV4ICsgMVxuXHR9KVxuICBcbiAgZG9jdW1lbnQuYXN0LndyYXBwZWQgPSB0cnVlXG5cdGRvY3VtZW50LmFzdC5jaGlsZHJlbiA9IGNoaWxkcmVuLmZpbHRlcihjaGlsZCA9PiAhY2hpbGQubWFya0ZvclJlbW92YWwpXG59XG5cbmZ1bmN0aW9uIGNvbGxhcHNlU2VjdGlvbnMgKGRvY3VtZW50KXtcbiAgbGV0IGNoaWxkcmVuID0gZG9jdW1lbnQuYXN0LmNoaWxkcmVuXG4gIGxldCBwcmV2aW91c1xuXG4gIGNoaWxkcmVuLmZvckVhY2goY2hpbGQgPT4ge1xuICAgIGxldCBuYW1lID0gY2hpbGQuZGF0YS5odG1sTmFtZVxuICAgIGlmKG5hbWUgPT09IFwic2VjdGlvblwiKXtcbiAgICAgIHByZXZpb3VzID0gY2hpbGRcbiAgICB9XG5cbiAgICBpZihwcmV2aW91cyAmJiBuYW1lID09PSBcImFydGljbGVcIil7XG4gICAgICBwcmV2aW91cy5jaGlsZHJlbi5wdXNoKF8uY2xvbmUoY2hpbGQpKVxuICAgICAgY2hpbGQubWFya0ZvckRlbGV0ZSA9IHRydWVcbiAgICB9XG4gIH0pXG5cbiAgZG9jdW1lbnQuYXN0LmNoaWxkcmVuID0gY2hpbGRyZW4uZmlsdGVyKGNoaWxkID0+ICFjaGlsZC5tYXJrRm9yRGVsZXRlKVxufVxuXG5mdW5jdGlvbiBhcHBseVdyYXBwZXIgKGRvY3VtZW50KSB7XG4gIGRvY3VtZW50LmFzdC5jaGlsZHJlbiA9IFt7IFxuICAgIHR5cGU6IFwic3Ryb25nXCIsXG4gICAgZGF0YTp7XG4gICAgICBodG1sTmFtZTogXCJkaXZcIixcbiAgICAgIGh0bWxBdHRyaWJ1dGVzOntcbiAgICAgICAgXCJjbGFzc1wiOiBcIndyYXBwZXJcIlxuICAgICAgfVxuICAgIH0sXG4gICAgY2hpbGRyZW46IGRvY3VtZW50LmFzdC5jaGlsZHJlblxuICB9XVxufVxuIl19