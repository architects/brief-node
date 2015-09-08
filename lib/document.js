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
    value: function present() {
      var options = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

      return _presenter2['default'].present(this, options);
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
      return getChildren().filter(function (node) {
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

  document.ast.children = [{
    type: "link",
    data: {
      htmlName: "div",
      htmlAttributes: {
        "class": "wrapper"
      }
    },
    children: document.ast.children
  }];

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
module.exports = exports['default'];
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3NyYy9kb2N1bWVudC5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7a0JBQWUsSUFBSTs7OztxQkFDRCxPQUFPOzs7O3lCQUNSLFlBQVk7Ozs7eUJBQ1osWUFBWTs7OztxQkFDWCxTQUFTOzs7O3lCQUNMLGFBQWE7Ozs7eUJBQ2IsYUFBYTs7OztzQ0FDZiwwQkFBMEI7Ozs7c0NBQ3hCLDBCQUEwQjs7Ozt1QkFDNUIsU0FBUzs7OzswQkFDZixZQUFZOzs7OzhCQUNSLGtCQUFrQjs7OztpQkFDaEIsR0FBRzs7OztBQUd2QixJQUFNLFNBQVMsR0FBRyxtQkFBTSxHQUFHLENBQUMsa0pBQXdDLENBQUMsQ0FBQTtBQUNyRSxJQUFNLFdBQVcsR0FBRyxxQkFBUyxDQUFBOztJQUVSLFFBQVE7ZUFBUixRQUFROztXQUNuQixvQkFBRztBQUNULGFBQU8sSUFBSSxDQUFDLElBQUksQ0FBQTtLQUNqQjs7Ozs7Ozs7QUFNVSxXQVRRLFFBQVEsQ0FTZixJQUFJLEVBQUUsT0FBTyxFQUFFOzBCQVRSLFFBQVE7O0FBVXpCLFFBQUksQ0FBQyxJQUFJLEdBQUcsSUFBSSxDQUFBO0FBQ2hCLFFBQUksQ0FBQyxPQUFPLEdBQUcsT0FBTyxJQUFJLEVBQUUsQ0FBQTtBQUM1QixXQUFPLENBQUMsSUFBSSxDQUFDLENBQUE7R0FDZDs7Ozs7Ozs7ZUFia0IsUUFBUTs7V0FvQm5CLG1CQUFhO1VBQVosT0FBTyx5REFBQyxFQUFFOztBQUNqQixhQUFPLG1CQUFNLFlBQVksQ0FBQyxJQUFJLEVBQUUsT0FBTyxDQUFDLENBQUE7S0FDekM7Ozs7Ozs7O1dBTU8sb0JBQUc7QUFDVCxVQUFJLENBQUMsTUFBTSxFQUFFLENBQUE7QUFDYixhQUFPLElBQUksQ0FBQTtLQUNaOzs7Ozs7OztXQU1LLGtCQUFHO0FBQ1AsYUFBTyxJQUFJLENBQUMsSUFBSSxHQUFHLElBQUksQ0FBQyxJQUFJLEdBQUcsT0FBTyxDQUFDLElBQUksQ0FBQyxDQUFBO0tBQzdDOzs7V0FFTyxtQkFB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RTs7QUFDdEMsU0FBTyxTQUFTLENBQUMsU0FBUyxDQUFDLFFBQVEsQ0FBQyxHQUFHLEVBQUUsT0FBTyxDQUFDLENBQUE7Q0FDbEQ7O0FBRUQsU0FBUyxRQUFRLENBQUMsSUFBSSxFQUFFO0FBQ3RCLFNBQU8sZ0JBQUcsWUFBWSxDQUFDLElBQUksQ0FBQyxDQUFDLFFBQVEsRUFBRSxDQUFBO0NBQ3hDIiwiZmlsZSI6ImRvY3VtZW50LmpzIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IGZzIGZyb20gJ2ZzJ1xuaW1wb3J0IG1kYXN0IGZyb20gJ21kYXN0J1xuaW1wb3J0IHlhbWwgZnJvbSAnbWRhc3QteWFtbCdcbmltcG9ydCBodG1sIGZyb20gJ21kYXN0LWh0bWwnXG5pbXBvcnQgTW9kZWwgZnJvbSAnLi9tb2RlbCdcbmltcG9ydCBQcmVzZW50ZXIgZnJvbSBcIi4vcHJlc2VudGVyXCJcbmltcG9ydCBzdHJ1Y3R1cmUgZnJvbSAnLi9zdHJ1Y3R1cmUnXG5pbXBvcnQgc3F1ZWV6ZSBmcm9tICdtZGFzdC1zcXVlZXplLXBhcmFncmFwaHMnXG5pbXBvcnQgbm9ybWFsaXplIGZyb20gJ21kYXN0LW5vcm1hbGl6ZS1oZWFkaW5ncycgXG5pbXBvcnQgY2hlZXJpbyBmcm9tICdjaGVlcmlvJ1xuaW1wb3J0IF8gZnJvbSAndW5kZXJzY29yZSdcbmltcG9ydCB2aXNpdCBmcm9tICdtZGFzdC11dGlsLXZpc2l0J1xuaW1wb3J0IGluZmxlY3QgZnJvbSAnaSdcblxuXG5jb25zdCBwcm9jZXNzb3IgPSBtZGFzdC51c2UoW3lhbWwsc3F1ZWV6ZSxub3JtYWxpemUsc3RydWN0dXJlLCBodG1sXSlcbmNvbnN0IGluZmxlY3Rpb25zID0gaW5mbGVjdCgpXG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIERvY3VtZW50IHtcbiAgdG9TdHJpbmcoKSB7XG4gICAgcmV0dXJuIHRoaXMucGF0aFxuICB9XG4gIFxuICAvKipcbiAgICogY3JlYXRlcyBhIG5ldyBpbnN0YW5jZSBvZiB0aGUgZG9jdW1lbnQgYXQgcGF0aFxuICAgKiBAcGFyYW0ge3BhdGh9IHBhdGggLSB0aGUgYWJzb2x1dGUgcGF0aCB0byB0aGUgbWFya2Rvd24gZG9jdW1lbnQuXG4gICovXG4gIGNvbnN0cnVjdG9yKHBhdGgsIG9wdGlvbnMpIHtcbiAgICB0aGlzLnBhdGggPSBwYXRoXG4gICAgdGhpcy5vcHRpb25zID0gb3B0aW9ucyB8fCB7fVxuICAgIHByb2Nlc3ModGhpcylcbiAgfVxuICBcbiAgLyoqXG4gICAqIGdldCBhIG1vZGVsIHRvIHJlcHJlc2VudCB0aGlzIGRvY3VtZW50IGFuZCB0aGUgZGF0YSB3ZSBwYXJzZSBmcm9tIGl0LlxuICAgKlxuICAgKiBAcmV0dXJuIHtNb2RlbH0gLSBhIG1vZGVsIGluc3RhbmNlIFxuICAqL1xuICB0b01vZGVsIChvcHRpb25zPXt9KSB7XG4gICAgcmV0dXJuIE1vZGVsLmZyb21Eb2N1bWVudCh0aGlzLCBvcHRpb25zKVxuICB9XG4gIFxuICAvKipcbiAgICogcmV0dXJucyBhIHJlbmRlcmVkIGRvY3VtZW50XG4gICAqIEByZXR1cm4ge0RvY3VtZW50fSAtIHRoaXMgZG9jdW1lbnRcbiAgKi9cbiAgcmVuZGVyZWQoKSB7XG4gICAgdGhpcy5yZW5kZXIoKVxuICAgIHJldHVybiB0aGlzXG4gIH1cbiAgXG4gIC8qKlxuICAgKiByZW5kZXIgdGhlIGRvY3VtZW50LlxuICAgKiBAcmV0dXJuIHtzdHJpbmd9IC0gUmVuZGVyZWQgSFRNTCBmcm9tIHRoZSBkb2N1bWVudCBtYXJrZG93blxuICAqL1xuICByZW5kZXIoKSB7XG4gICAgcmV0dXJuIHRoaXMuaHRtbCA/IHRoaXMuaHRtbCA6IHByb2Nlc3ModGhpcykgXG4gIH1cblxuICBwcmVzZW50IChvcHRpb25zPXt9KSB7XG4gICAgcmV0dXJuIFByZXNlbnRlci5wcmVzZW50KHRoaXMsIG9wdGlvbnMpXG4gIH1cblxuICB2aXNpdCh0eXBlLCBpdGVyYXRvcikge1xuICAgIHZpc2l0KHRoaXMuYXN0LCB0eXBlLCBpdGVyYXRvcilcbiAgfVxuXG4gIGdldEFzdCAoKSB7XG4gICAgcmV0dXJuIHRoaXMuYXN0XG4gIH1cblxuICBnZXRDaGlsZHJlbiAoKSB7XG4gICAgcmV0dXJuIHRoaXMuYXN0LmNoaWxkcmVuWzBdLmNoaWxkcmVuICBcbiAgfVxuXG4gIGdldEhlYWRpbmdOb2RlcyAoKSB7XG4gICAgcmV0dXJuIGdldENoaWxkcmVuKCkuZmlsdGVyKG5vZGUgPT4gbm9kZS50eXBlID09PSBcImhlYWRpbmdcIilcbiAgfVxuXG4gIHJ1bkhvb2sgKGlkZW50aWZpZXIgPSBcIlwiLCAuLi5hcmdzKSB7XG4gICAgbGV0IGhvb2sgPSB0aGlzLm9wdGlvbnNbaWRlbnRpZmllcl0gfHwgdGhpc1tpZGVudGlmaWVyXVxuXG4gICAgaWYodHlwZW9mKGhvb2spID09PSBcImZ1bmN0aW9uXCIpe1xuICAgICAgaG9vay5hcHBseSh0aGlzLCBhcmdzKVxuICAgIH1cbiAgfVxufVxuXG5mdW5jdGlvbiBwYXJzZSAoZG9jdW1lbnQpIHtcbiAgbGV0IHBhcnNlZCA9IHByb2Nlc3Nvci5wYXJzZShkb2N1bWVudC5jb250ZW50KSxcbiAgICAgIG5vZGVzICA9IHBhcnNlZC5jaGlsZHJlblxuICBcbiAgaWYobm9kZXNbMF0gJiYgbm9kZXNbMF0ueWFtbCl7XG4gICAgZG9jdW1lbnQuZGF0YSA9IG5vZGVzLnNwbGljZSgwLDEpWzBdLnlhbWxcbiAgfVxuICBcbiAgbGV0IGFzdCA9IHByb2Nlc3Nvci5ydW4ocGFyc2VkKVxuXG4gIGRvY3VtZW50LnJ1bkhvb2soXCJkb2N1bWVudERpZFBhcnNlXCIsIGFzdClcblxuICByZXR1cm4gYXN0IFxufVxuXG5mdW5jdGlvbiBwcm9jZXNzIChkb2N1bWVudCkge1xuICBkb2N1bWVudC5jb250ZW50ID0gcmVhZFBhdGgoZG9jdW1lbnQucGF0aClcblxuICBkb2N1bWVudC5hc3QgPSBwYXJzZShkb2N1bWVudClcbiAgZG9jdW1lbnQucnVuSG9vayhcImRvY3VtZW50V2lsbFJlbmRlclwiLCBkb2N1bWVudC5hc3QpXG4gIFxuICBkb2N1bWVudC5hc3QuY2hpbGRyZW4gPSBbeyBcbiAgICB0eXBlOiBcImxpbmtcIixcbiAgICBkYXRhOntcbiAgICAgIGh0bWxOYW1lOiBcImRpdlwiLFxuICAgICAgaHRtbEF0dHJpYnV0ZXM6e1xuICAgICAgICBcImNsYXNzXCI6IFwid3JhcHBlclwiXG4gICAgICB9XG4gICAgfSxcbiAgICBjaGlsZHJlbjogZG9jdW1lbnQuYXN0LmNoaWxkcmVuXG4gIH1dXG4gIFxuICBkb2N1bWVudC5odG1sID0gc3RyaW5naWZ5KGRvY3VtZW50KVxuICBkb2N1bWVudC4kID0gY2hlZXJpby5sb2FkKGRvY3VtZW50Lmh0bWwpXG4gIGRvY3VtZW50LnJ1bkhvb2soXCJkb2N1bWVudERpZFJlbmRlclwiLCBkb2N1bWVudC5odG1sKVxuXG4gIHJldHVybiBkb2N1bWVudFxufVxuXG5mdW5jdGlvbiBzdHJpbmdpZnkgKGRvY3VtZW50LCBvcHRpb25zPXt9KSB7XG4gIHJldHVybiBwcm9jZXNzb3Iuc3RyaW5naWZ5KGRvY3VtZW50LmFzdCwgb3B0aW9ucylcbn1cblxuZnVuY3Rpb24gcmVhZFBhdGgocGF0aCkge1xuICByZXR1cm4gZnMucmVhZEZpbGVTeW5jKHBhdGgpLnRvU3RyaW5nKClcbn1cbiJdfQ==