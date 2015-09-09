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
//# sourceMappingURL=data:application/json;base64,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aEMsY0FBUSxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsd0JBQUUsS0FBSyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUE7QUFDdEMsV0FBSyxDQUFDLGFBQWEsR0FBRyxJQUFJLENBQUE7S0FDM0I7R0FDRixDQUFDLENBQUE7O0FBRUYsVUFBUSxDQUFDLEdBQUcsQ0FBQyxRQUFRLEdBQUcsUUFBUSxDQUFDLE1BQU0sQ0FBQyxVQUFBLEtBQUs7V0FBSSxDQUFDLEtBQUssQ0FBQyxhQUFhO0dBQUEsQ0FBQyxDQUFBO0NBQ3ZFOztBQUVELFNBQVMsWUFBWSxDQUFFLFFBQVEsRUFBRTtBQUMvQixVQUFRLENBQUMsR0FBRyxDQUFDLFFBQVEsR0FBRyxDQUFDO0FBQ3ZCLFFBQUksRUFBRSxRQUFRO0FBQ2QsUUFBSSxFQUFDO0FBQ0gsY0FBUSxFQUFFLEtBQUs7QUFDZixvQkFBYyxFQUFDO0FBQ2IsZUFBTyxFQUFFLFNBQVM7T0FDbkI7S0FDRjtBQUNELFlBQVEsRUFBRSxRQUFRLENBQUMsR0FBRyxDQUFDLFFBQVE7R0FDaEMsQ0FBQyxDQUFBO0NBQ0giLCJmaWxlIjoiZG9jdW1lbnQuanMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgZnMgZnJvbSAnZnMnXG5pbXBvcnQgbWRhc3QgZnJvbSAnbWRhc3QnXG5pbXBvcnQgeWFtbCBmcm9tICdtZGFzdC15YW1sJ1xuaW1wb3J0IGh0bWwgZnJvbSAnbWRhc3QtaHRtbCdcbmltcG9ydCBNb2RlbCBmcm9tICcuL21vZGVsJ1xuaW1wb3J0IFByZXNlbnRlciBmcm9tIFwiLi9wcmVzZW50ZXJcIlxuaW1wb3J0IHNxdWVlemUgZnJvbSAnbWRhc3Qtc3F1ZWV6ZS1wYXJhZ3JhcGhzJ1xuaW1wb3J0IG5vcm1hbGl6ZSBmcm9tICdtZGFzdC1ub3JtYWxpemUtaGVhZGluZ3MnIFxuaW1wb3J0IGNoZWVyaW8gZnJvbSAnY2hlZXJpbydcbmltcG9ydCBfIGZyb20gJ3VuZGVyc2NvcmUnXG5pbXBvcnQgdmlzaXQgZnJvbSAnbWRhc3QtdXRpbC12aXNpdCdcbmltcG9ydCBpbmZsZWN0aW9ucyBmcm9tICd1bmRlcnNjb3JlLnN0cmluZydcblxuXG5jb25zdCBwcm9jZXNzb3IgPSBtZGFzdC51c2UoW3lhbWwsc3F1ZWV6ZSxub3JtYWxpemUsaHRtbF0pXG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIERvY3VtZW50IHtcbiAgdG9TdHJpbmcoKSB7XG4gICAgcmV0dXJuIHRoaXMucGF0aFxuICB9XG4gIFxuICAvKipcbiAgICogY3JlYXRlcyBhIG5ldyBpbnN0YW5jZSBvZiB0aGUgZG9jdW1lbnQgYXQgcGF0aFxuICAgKiBAcGFyYW0ge3BhdGh9IHBhdGggLSB0aGUgYWJzb2x1dGUgcGF0aCB0byB0aGUgbWFya2Rvd24gZG9jdW1lbnQuXG4gICovXG4gIGNvbnN0cnVjdG9yKHBhdGgsIG9wdGlvbnMpIHtcbiAgICB0aGlzLnBhdGggPSBwYXRoXG4gICAgdGhpcy5vcHRpb25zID0gb3B0aW9ucyB8fCB7fVxuICAgIHByb2Nlc3ModGhpcylcbiAgfVxuICBcbiAgLyoqXG4gICAqIGdldCBhIG1vZGVsIHRvIHJlcHJlc2VudCB0aGlzIGRvY3VtZW50IGFuZCB0aGUgZGF0YSB3ZSBwYXJzZSBmcm9tIGl0LlxuICAgKlxuICAgKiBAcmV0dXJuIHtNb2RlbH0gLSBhIG1vZGVsIGluc3RhbmNlIFxuICAqL1xuICB0b01vZGVsIChvcHRpb25zPXt9KSB7XG4gICAgcmV0dXJuIE1vZGVsLmZyb21Eb2N1bWVudCh0aGlzLCBvcHRpb25zKVxuICB9XG4gIFxuICAvKipcbiAgICogcmV0dXJucyBhIHJlbmRlcmVkIGRvY3VtZW50XG4gICAqIEByZXR1cm4ge0RvY3VtZW50fSAtIHRoaXMgZG9jdW1lbnRcbiAgKi9cbiAgcmVuZGVyZWQoKSB7XG4gICAgdGhpcy5yZW5kZXIoKVxuICAgIHJldHVybiB0aGlzXG4gIH1cbiAgXG4gIC8qKlxuICAgKiByZW5kZXIgdGhlIGRvY3VtZW50LlxuICAgKiBAcmV0dXJuIHtzdHJpbmd9IC0gUmVuZGVyZWQgSFRNTCBmcm9tIHRoZSBkb2N1bWVudCBtYXJrZG93blxuICAqL1xuICByZW5kZXIoKSB7XG4gICAgcmV0dXJuIHRoaXMuaHRtbCA/IHRoaXMuaHRtbCA6IHByb2Nlc3ModGhpcykgXG4gIH1cblxuICBwcmVzZW50IChtZXRob2QsIG9wdGlvbnM9e30pIHtcbiAgICBsZXQgcHJlc2VudGVyID0gUHJlc2VudGVyLnByZXNlbnQodGhpcywgb3B0aW9ucylcbiAgICByZXR1cm4gcHJlc2VudGVyW21ldGhvZF0oKVxuICB9XG5cbiAgdmlzaXQodHlwZSwgaXRlcmF0b3IpIHtcbiAgICB2aXNpdCh0aGlzLmFzdCwgdHlwZSwgaXRlcmF0b3IpXG4gIH1cblxuICBnZXRBc3QgKCkge1xuICAgIHJldHVybiB0aGlzLmFzdFxuICB9XG5cbiAgZ2V0Q2hpbGRyZW4gKCkge1xuICAgIHJldHVybiB0aGlzLmFzdC5jaGlsZHJlblswXS5jaGlsZHJlbiAgXG4gIH1cblxuICBnZXRIZWFkaW5nTm9kZXMgKCkge1xuICAgIHJldHVybiB0aGlzLmdldENoaWxkcmVuKCkuZmlsdGVyKG5vZGUgPT4gbm9kZS50eXBlID09PSBcImhlYWRpbmdcIilcbiAgfVxuXG4gIHJ1bkhvb2sgKGlkZW50aWZpZXIgPSBcIlwiLCAuLi5hcmdzKSB7XG4gICAgbGV0IGhvb2sgPSB0aGlzLm9wdGlvbnNbaWRlbnRpZmllcl0gfHwgdGhpc1tpZGVudGlmaWVyXVxuXG4gICAgaWYodHlwZW9mKGhvb2spID09PSBcImZ1bmN0aW9uXCIpe1xuICAgICAgaG9vay5hcHBseSh0aGlzLCBhcmdzKVxuICAgIH1cbiAgfVxufVxuXG5mdW5jdGlvbiBwYXJzZSAoZG9jdW1lbnQpIHtcbiAgbGV0IHBhcnNlZCA9IHByb2Nlc3Nvci5wYXJzZShkb2N1bWVudC5jb250ZW50KSxcbiAgICAgIG5vZGVzICA9IHBhcnNlZC5jaGlsZHJlblxuICBcbiAgaWYobm9kZXNbMF0gJiYgbm9kZXNbMF0ueWFtbCl7XG4gICAgZG9jdW1lbnQuZGF0YSA9IG5vZGVzLnNwbGljZSgwLDEpWzBdLnlhbWxcbiAgfVxuICBcbiAgbGV0IGFzdCA9IHByb2Nlc3Nvci5ydW4ocGFyc2VkKVxuXG4gIGRvY3VtZW50LnJ1bkhvb2soXCJkb2N1bWVudERpZFBhcnNlXCIsIGFzdClcblxuICByZXR1cm4gYXN0IFxufVxuXG5mdW5jdGlvbiBwcm9jZXNzIChkb2N1bWVudCkge1xuICBkb2N1bWVudC5jb250ZW50ID0gcmVhZFBhdGgoZG9jdW1lbnQucGF0aClcblxuICBkb2N1bWVudC5hc3QgPSBwYXJzZShkb2N1bWVudClcbiAgZG9jdW1lbnQucnVuSG9vayhcImRvY3VtZW50V2lsbFJlbmRlclwiLCBkb2N1bWVudC5hc3QpXG4gIFxuICBuZXN0RWxlbWVudHMoZG9jdW1lbnQpXG4gIGNvbGxhcHNlU2VjdGlvbnMoZG9jdW1lbnQpXG4gIGFwcGx5V3JhcHBlcihkb2N1bWVudClcblxuICBkb2N1bWVudC5odG1sID0gc3RyaW5naWZ5KGRvY3VtZW50KVxuICBkb2N1bWVudC4kID0gY2hlZXJpby5sb2FkKGRvY3VtZW50Lmh0bWwpXG4gIGRvY3VtZW50LnJ1bkhvb2soXCJkb2N1bWVudERpZFJlbmRlclwiLCBkb2N1bWVudC5odG1sKVxuXG4gIHJldHVybiBkb2N1bWVudFxufVxuXG5mdW5jdGlvbiBzdHJpbmdpZnkgKGRvY3VtZW50LCBvcHRpb25zPXt9KSB7XG4gIHJldHVybiBwcm9jZXNzb3Iuc3RyaW5naWZ5KGRvY3VtZW50LmFzdCwgb3B0aW9ucylcbn1cblxuZnVuY3Rpb24gcmVhZFBhdGgocGF0aCkge1xuICByZXR1cm4gZnMucmVhZEZpbGVTeW5jKHBhdGgpLnRvU3RyaW5nKClcbn1cblxuZnVuY3Rpb24gbmVzdEVsZW1lbnRzIChkb2N1bWVudCkge1xuICBsZXQgY2hpbGRyZW4gPSBkb2N1bWVudC5hc3QuY2hpbGRyZW5cbiAgbGV0IGhlYWRpbmdzID0gZG9jdW1lbnQuYXN0LmNoaWxkcmVuLmZpbHRlcihjID0+IGMudHlwZSA9PT0gXCJoZWFkaW5nXCIpXG5cdFxuXHRsZXQgaW5kZXggPSAwXG5cdGxldCBwcmV2aW91c1xuXG5cdGNoaWxkcmVuLmZvckVhY2goY2hpbGQgPT4ge1xuXHRcdGxldCBkYXRhID0gY2hpbGQuZGF0YSBcblxuXHRcdGlmKGNoaWxkLnR5cGUgPT09IFwiaGVhZGluZ1wiKXtcblx0XHRcdGRlbGV0ZShjaGlsZC5kYXRhKVxuICAgICAgXG4gICAgICBsZXQgdGV4dCA9IGNoaWxkLmNoaWxkcmVuWzBdICYmIGNoaWxkLmNoaWxkcmVuWzBdLnZhbHVlXG5cbiAgICAgIGRhdGEgPSBkYXRhIHx8IHt9XG4gICAgICBkYXRhLmh0bWxOYW1lID0gXCJzZWN0aW9uXCJcbiAgICAgIGRhdGEuaHRtbEF0dHJpYnV0ZXMgPSBkYXRhLmh0bWxBdHRyaWJ1dGVzIHx8IHt9XG4gICAgICBcbiAgICAgIGlmKGNoaWxkLmRlcHRoID49IDMpe1xuICAgICAgICBkYXRhLmh0bWxOYW1lID0gXCJhcnRpY2xlXCJcbiAgICAgIH1cblxuICAgICAgaWYodGV4dCl7XG4gICAgICAgIGRhdGEuaHRtbEF0dHJpYnV0ZXNbJ2RhdGEtaGVhZGluZyddID0gaW5mbGVjdGlvbnMuZGFzaGVyaXplKHRleHQudG9Mb3dlckNhc2UoKSlcbiAgICAgIH1cblxuXHRcdFx0cHJldmlvdXMgPSBjaGlsZHJlbltpbmRleF0gPSB7XG5cdFx0XHRcdHR5cGU6IFwiZGl2XCIsXG4gICAgICAgIGRlcHRoOiBjaGlsZC5kZXB0aCxcblx0XHRcdFx0aGVhZGluZ0luZGV4OiBjaGlsZC5oZWFkaW5nSW5kZXgsXG5cdFx0XHRcdGNvbnRhaW5lcjogdHJ1ZSxcblx0XHRcdFx0ZGF0YTogZGF0YSxcblx0XHRcdFx0Y2hpbGRyZW46IFtjaGlsZF1cblx0XHRcdH1cblx0XHR9IGVsc2UgaWYocHJldmlvdXMpIHtcblx0XHRcdHByZXZpb3VzLmNoaWxkcmVuLnB1c2goXy5jbG9uZShjaGlsZCkpXG5cdFx0XHRjaGlsZC5tYXJrRm9yUmVtb3ZhbCA9IHRydWVcblx0XHR9XG5cblx0XHRpbmRleCA9IGluZGV4ICsgMVxuXHR9KVxuICBcbiAgZG9jdW1lbnQuYXN0LndyYXBwZWQgPSB0cnVlXG5cdGRvY3VtZW50LmFzdC5jaGlsZHJlbiA9IGNoaWxkcmVuLmZpbHRlcihjaGlsZCA9PiAhY2hpbGQubWFya0ZvclJlbW92YWwpXG59XG5cbmZ1bmN0aW9uIGNvbGxhcHNlU2VjdGlvbnMgKGRvY3VtZW50KXtcbiAgbGV0IGNoaWxkcmVuID0gZG9jdW1lbnQuYXN0LmNoaWxkcmVuXG4gIGxldCBwcmV2aW91c1xuXG4gIGNoaWxkcmVuLmZvckVhY2goY2hpbGQgPT4ge1xuICAgIGxldCBuYW1lID0gY2hpbGQuZGF0YS5odG1sTmFtZVxuICAgIGlmKG5hbWUgPT09IFwic2VjdGlvblwiKXtcbiAgICAgIHByZXZpb3VzID0gY2hpbGRcbiAgICB9XG5cbiAgICBpZihwcmV2aW91cyAmJiBuYW1lID09PSBcImFydGljbGVcIil7XG4gICAgICBwcmV2aW91cy5jaGlsZHJlbi5wdXNoKF8uY2xvbmUoY2hpbGQpKVxuICAgICAgY2hpbGQubWFya0ZvckRlbGV0ZSA9IHRydWVcbiAgICB9XG4gIH0pXG5cbiAgZG9jdW1lbnQuYXN0LmNoaWxkcmVuID0gY2hpbGRyZW4uZmlsdGVyKGNoaWxkID0+ICFjaGlsZC5tYXJrRm9yRGVsZXRlKVxufVxuXG5mdW5jdGlvbiBhcHBseVdyYXBwZXIgKGRvY3VtZW50KSB7XG4gIGRvY3VtZW50LmFzdC5jaGlsZHJlbiA9IFt7IFxuICAgIHR5cGU6IFwic3Ryb25nXCIsXG4gICAgZGF0YTp7XG4gICAgICBodG1sTmFtZTogXCJkaXZcIixcbiAgICAgIGh0bWxBdHRyaWJ1dGVzOntcbiAgICAgICAgXCJjbGFzc1wiOiBcIndyYXBwZXJcIlxuICAgICAgfVxuICAgIH0sXG4gICAgY2hpbGRyZW46IGRvY3VtZW50LmFzdC5jaGlsZHJlblxuICB9XVxufVxuIl19