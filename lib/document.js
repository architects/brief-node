'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

var _cheerio = require('cheerio');

var _cheerio2 = _interopRequireDefault(_cheerio);

var _underscore = require('underscore');

var _underscore2 = _interopRequireDefault(_underscore);

var _unistUtilVisit = require('unist-util-visit');

var _unistUtilVisit2 = _interopRequireDefault(_unistUtilVisit);

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _index = require('./index');

var _index2 = _interopRequireDefault(_index);

var _model = require('./model');

var _model2 = _interopRequireDefault(_model);

var _presenter = require("./presenter");

var _presenter2 = _interopRequireDefault(_presenter);

var _render2 = require('./render');

var _util = require('./util');

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

  function Document(pathname, options) {
    _classCallCheck(this, Document);

    this.options = options || {};
    this.path = pathname;
    this.dirname = _path2['default'].dirname(this.path);

    if (this.options.type) {
      this.type = this.options.type;
    }

    (0, _render2.process)(this, this.getBriefcase());
  }

  _createClass(Document, [{
    key: 'resolveLink',
    value: function resolveLink(pathAlias) {
      return this.getBriefcase().resolveLink(pathAlias);
    }

    /**
    * return a reference to the briefcase this document belongs to.
    */
  }, {
    key: 'getBriefcase',
    value: function getBriefcase() {
      if (this.briefcase) {
        return this.briefcase;
      }
      return this.briefcase = _index2['default'].findBriefcaseByPath(this.path);
    }

    /**
     * get a model to represent this document and the data we parse from it.
     *
     * @return {Model} - a model instance 
    */
  }, {
    key: 'toModel',
    value: function toModel() {
      var options = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

      return _model2['default'].fromDocument(this, options);
    }
  }, {
    key: 'writeSync',
    value: function writeSync(newContent) {
      newContent = newContent || this.content;
      _fs2['default'].writeFileSync(this.path, newContent);
      this.reload();
    }
  }, {
    key: 'lastModifiedAt',
    value: function lastModifiedAt() {
      return _fs2['default'].lstatSync(this.path).mtime.valueOf();
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
    value: (function (_render) {
      function render() {
        return _render.apply(this, arguments);
      }

      render.toString = function () {
        return _render.toString();
      };

      return render;
    })(function () {
      return this.html ? this.html : render(this);
    })
  }, {
    key: 'getType',
    value: function getType() {
      if (this.data && this.data.type) {
        return this.data.type;
      }

      return (0, _util.singularize)(_path2['default'].basename(this.dirname));
    }

    /** 
    * apply a presenter to the document. useful for debugging
    * purposes.
    */
  }, {
    key: 'present',
    value: function present(method) {
      var options = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

      var presenter = _presenter2['default'].present(this, options);
      return presenter[method]();
    }

    /**
    * visit every node of the parsed ast
    */
  }, {
    key: 'visit',
    value: function visit(type, iterator) {
      (0, _unistUtilVisit2['default'])(this.ast, type, iterator);
    }
  }, {
    key: 'getAST',
    value: function getAST() {
      return this.ast;
    }
  }, {
    key: 'reload',
    value: function reload() {
      delete this.articles;
      delete this.sections;
      delete this.data;
      delete this.content;

      (0, _render2.process)(this, this.briefcase);
    }
  }, {
    key: 'getSectionHeadings',
    value: function getSectionHeadings() {
      return this.getSectionNodes().map(function (section) {
        return section.heading;
      });
    }
  }, {
    key: 'getArticleHeadings',
    value: function getArticleHeadings() {
      return this.getArticleNodes().map(function (article) {
        return article.heading;
      });
    }
  }, {
    key: 'getTopSection',
    value: function getTopSection() {
      return this.getSectionNodes().find(function (node) {
        return node.top;
      });
    }
  }, {
    key: 'getSectionNodes',
    value: function getSectionNodes() {
      var _this = this;

      if (this.sections) {
        return this.sections;
      }

      this.sections = [];
      this.visit('section', function (node) {
        return _this.sections.push(node);
      });
      return this.sections = this.sections.reverse();
    }
  }, {
    key: 'getArticleNodes',
    value: function getArticleNodes() {
      var _this2 = this;

      if (this.articles) {
        return this.articles;
      }

      this.articles = [];
      this.visit('article', function (node) {
        return _this2.articles.push(node);
      });
      return this.articles = this.articles.reverse();
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
module.exports = exports['default'];
//# sourceMappingURL=data:application/json;base64,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SSxDQUFDLFVBQVUsQ0FBQyxDQUFBOztBQUV2RCxVQUFHLE9BQU8sSUFBSSxBQUFDLEtBQUssVUFBVSxFQUFDOzBDQUhKLElBQUk7QUFBSixjQUFJOzs7QUFJN0IsWUFBSSxDQUFDLEtBQUssQ0FBQyxJQUFJLEVBQUUsSUFBSSxDQUFDLENBQUE7T0FDdkI7S0FDRjs7O1NBbEtrQixRQUFROzs7cUJBQVIsUUFBUSIsImZpbGUiOiJkb2N1bWVudC5qcyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCBmcyBmcm9tICdmcydcbmltcG9ydCBjaGVlcmlvIGZyb20gJ2NoZWVyaW8nXG5pbXBvcnQgXyBmcm9tICd1bmRlcnNjb3JlJ1xuaW1wb3J0IHZpc2l0IGZyb20gJ3VuaXN0LXV0aWwtdmlzaXQnXG5pbXBvcnQgcGF0aCBmcm9tICdwYXRoJ1xuXG5pbXBvcnQgYnJpZWYgZnJvbSAnLi9pbmRleCdcbmltcG9ydCBNb2RlbCBmcm9tICcuL21vZGVsJ1xuaW1wb3J0IFByZXNlbnRlciBmcm9tIFwiLi9wcmVzZW50ZXJcIlxuaW1wb3J0IHtwcm9jZXNzLCBwYXJzZX0gZnJvbSAnLi9yZW5kZXInXG5pbXBvcnQge2Nsb25lLCBzaW5ndWxhcml6ZX0gZnJvbSAnLi91dGlsJ1xuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBEb2N1bWVudCB7XG4gIHRvU3RyaW5nKCkge1xuICAgIHJldHVybiB0aGlzLnBhdGhcbiAgfVxuICBcbiAgLyoqXG4gICAqIGNyZWF0ZXMgYSBuZXcgaW5zdGFuY2Ugb2YgdGhlIGRvY3VtZW50IGF0IHBhdGhcbiAgICogQHBhcmFtIHtwYXRofSBwYXRoIC0gdGhlIGFic29sdXRlIHBhdGggdG8gdGhlIG1hcmtkb3duIGRvY3VtZW50LlxuICAqL1xuICBjb25zdHJ1Y3RvcihwYXRobmFtZSwgb3B0aW9ucykge1xuICAgIHRoaXMub3B0aW9ucyA9IG9wdGlvbnMgfHwge31cbiAgICB0aGlzLnBhdGggPSBwYXRobmFtZVxuICAgIHRoaXMuZGlybmFtZSA9IHBhdGguZGlybmFtZSh0aGlzLnBhdGgpXG5cbiAgICBpZih0aGlzLm9wdGlvbnMudHlwZSl7XG4gICAgICB0aGlzLnR5cGUgPSB0aGlzLm9wdGlvbnMudHlwZVxuICAgIH1cblxuICAgIHByb2Nlc3ModGhpcywgdGhpcy5nZXRCcmllZmNhc2UoKSlcbiAgfVxuICBcbiAgcmVzb2x2ZUxpbmsocGF0aEFsaWFzKXtcbiAgICByZXR1cm4gdGhpcy5nZXRCcmllZmNhc2UoKS5yZXNvbHZlTGluayhwYXRoQWxpYXMpXG4gIH1cblxuICAvKipcbiAgKiByZXR1cm4gYSByZWZlcmVuY2UgdG8gdGhlIGJyaWVmY2FzZSB0aGlzIGRvY3VtZW50IGJlbG9uZ3MgdG8uXG4gICovXG4gIGdldEJyaWVmY2FzZSgpe1xuICAgIGlmKHRoaXMuYnJpZWZjYXNlKSB7IHJldHVybiB0aGlzLmJyaWVmY2FzZSB9XG4gICAgcmV0dXJuIHRoaXMuYnJpZWZjYXNlID0gYnJpZWYuZmluZEJyaWVmY2FzZUJ5UGF0aCh0aGlzLnBhdGgpXG4gIH1cbiAgLyoqXG4gICAqIGdldCBhIG1vZGVsIHRvIHJlcHJlc2VudCB0aGlzIGRvY3VtZW50IGFuZCB0aGUgZGF0YSB3ZSBwYXJzZSBmcm9tIGl0LlxuICAgKlxuICAgKiBAcmV0dXJuIHtNb2RlbH0gLSBhIG1vZGVsIGluc3RhbmNlIFxuICAqL1xuICB0b01vZGVsIChvcHRpb25zPXt9KSB7XG4gICAgcmV0dXJuIE1vZGVsLmZyb21Eb2N1bWVudCh0aGlzLCBvcHRpb25zKVxuICB9XG4gIFxuICB3cml0ZVN5bmMobmV3Q29udGVudCl7XG4gICAgbmV3Q29udGVudCA9IG5ld0NvbnRlbnQgfHwgdGhpcy5jb250ZW50XG4gICAgZnMud3JpdGVGaWxlU3luYyh0aGlzLnBhdGgsIG5ld0NvbnRlbnQpXG4gICAgdGhpcy5yZWxvYWQoKVxuICB9XG5cbiAgbGFzdE1vZGlmaWVkQXQoKXtcbiAgICByZXR1cm4gZnMubHN0YXRTeW5jKHRoaXMucGF0aCkubXRpbWUudmFsdWVPZigpXG4gIH1cblxuICAvKipcbiAgICogcmV0dXJucyBhIHJlbmRlcmVkIGRvY3VtZW50XG4gICAqIEByZXR1cm4ge0RvY3VtZW50fSAtIHRoaXMgZG9jdW1lbnRcbiAgKi9cbiAgcmVuZGVyZWQoKSB7XG4gICAgdGhpcy5yZW5kZXIoKVxuICAgIHJldHVybiB0aGlzXG4gIH1cbiAgXG4gIC8qKlxuICAgKiByZW5kZXIgdGhlIGRvY3VtZW50LlxuICAgKiBAcmV0dXJuIHtzdHJpbmd9IC0gUmVuZGVyZWQgSFRNTCBmcm9tIHRoZSBkb2N1bWVudCBtYXJrZG93blxuICAqL1xuICByZW5kZXIoKSB7XG4gICAgcmV0dXJuIHRoaXMuaHRtbCA/IHRoaXMuaHRtbCA6IHJlbmRlcih0aGlzKSBcbiAgfVxuXG4gIGdldFR5cGUoKXtcbiAgICBpZih0aGlzLmRhdGEgJiYgdGhpcy5kYXRhLnR5cGUpe1xuICAgICAgcmV0dXJuIHRoaXMuZGF0YS50eXBlXG4gICAgfVxuXG4gICAgcmV0dXJuIHNpbmd1bGFyaXplKHBhdGguYmFzZW5hbWUodGhpcy5kaXJuYW1lKSlcbiAgfVxuICBcbiAgLyoqIFxuICAqIGFwcGx5IGEgcHJlc2VudGVyIHRvIHRoZSBkb2N1bWVudC4gdXNlZnVsIGZvciBkZWJ1Z2dpbmdcbiAgKiBwdXJwb3Nlcy5cbiAgKi9cbiAgcHJlc2VudCAobWV0aG9kLCBvcHRpb25zPXt9KSB7XG4gICAgbGV0IHByZXNlbnRlciA9IFByZXNlbnRlci5wcmVzZW50KHRoaXMsIG9wdGlvbnMpXG4gICAgcmV0dXJuIHByZXNlbnRlclttZXRob2RdKClcbiAgfVxuICBcbiAgLyoqXG4gICogdmlzaXQgZXZlcnkgbm9kZSBvZiB0aGUgcGFyc2VkIGFzdFxuICAqL1xuICB2aXNpdCh0eXBlLCBpdGVyYXRvcikge1xuICAgIHZpc2l0KHRoaXMuYXN0LCB0eXBlLCBpdGVyYXRvcilcbiAgfVxuXG4gIGdldEFTVCAoKSB7XG4gICAgcmV0dXJuIHRoaXMuYXN0XG4gIH1cblxuICByZWxvYWQoKXtcbiAgICBkZWxldGUodGhpcy5hcnRpY2xlcylcbiAgICBkZWxldGUodGhpcy5zZWN0aW9ucylcbiAgICBkZWxldGUodGhpcy5kYXRhKVxuICAgIGRlbGV0ZSh0aGlzLmNvbnRlbnQpXG5cbiAgICBwcm9jZXNzKHRoaXMsIHRoaXMuYnJpZWZjYXNlKVxuICB9XG4gIFxuICBnZXRTZWN0aW9uSGVhZGluZ3MoKXtcbiAgICByZXR1cm4gdGhpcy5nZXRTZWN0aW9uTm9kZXMoKS5tYXAoc2VjdGlvbiA9PiBzZWN0aW9uLmhlYWRpbmcpXG4gIH1cblxuICBnZXRBcnRpY2xlSGVhZGluZ3MoKXtcbiAgICByZXR1cm4gdGhpcy5nZXRBcnRpY2xlTm9kZXMoKS5tYXAoYXJ0aWNsZSA9PiBhcnRpY2xlLmhlYWRpbmcpXG4gIH1cblxuICBnZXRUb3BTZWN0aW9uKCkge1xuICAgIHJldHVybiB0aGlzLmdldFNlY3Rpb25Ob2RlcygpLmZpbmQobm9kZSA9PiBub2RlLnRvcClcbiAgfVxuXG4gIGdldFNlY3Rpb25Ob2RlcygpIHtcbiAgICBpZih0aGlzLnNlY3Rpb25zKXsgcmV0dXJuIHRoaXMuc2VjdGlvbnMgfVxuXG4gICAgdGhpcy5zZWN0aW9ucyA9IFtdXG4gICAgdGhpcy52aXNpdCgnc2VjdGlvbicsIG5vZGUgPT4gdGhpcy5zZWN0aW9ucy5wdXNoKG5vZGUpKVxuICAgIHJldHVybiB0aGlzLnNlY3Rpb25zID0gdGhpcy5zZWN0aW9ucy5yZXZlcnNlKClcbiAgfVxuXG4gIGdldEFydGljbGVOb2RlcygpIHtcbiAgICBpZih0aGlzLmFydGljbGVzKXsgcmV0dXJuIHRoaXMuYXJ0aWNsZXMgfVxuXG4gICAgdGhpcy5hcnRpY2xlcyA9IFtdXG4gICAgdGhpcy52aXNpdCgnYXJ0aWNsZScsIG5vZGUgPT4gdGhpcy5hcnRpY2xlcy5wdXNoKG5vZGUpKVxuICAgIHJldHVybiB0aGlzLmFydGljbGVzID0gdGhpcy5hcnRpY2xlcy5yZXZlcnNlKClcbiAgfVxuXG4gIGdldENoaWxkcmVuICgpIHtcbiAgICByZXR1cm4gdGhpcy5hc3QuY2hpbGRyZW5bMF0uY2hpbGRyZW4gIFxuICB9XG5cbiAgZ2V0SGVhZGluZ05vZGVzICgpIHtcbiAgICBsZXQgcmVzdWx0cyA9IFtdXG4gICAgdGhpcy52aXNpdCgnaGVhZGluZycsIG5vZGUgPT4gcmVzdWx0cy5wdXNoKG5vZGUpKVxuICAgIHJldHVybiByZXN1bHRzXG4gIH1cbiAgXG4gIC8qKlxuICAqIEdpdmVuIGEgY3NzIHNlbGVjdG9yLCByZXR1cm4gZWFjaCBvZiB0aGUgZWxlbWVudHNcbiAgKiAgIHdyYXBwZWQgd2l0aCBhIGNoZWVyaW8gb2JqZWN0LiBcbiAgKlxuICAqIEBwYXJhbSB7c3RyaW5nfSBzZWxlY3RvciAtIGEgY3NzIHNlbGVjdG9yIHRvIG1hdGNoXG4gICogQHJldHVybiAtIGFuIHVuZGVyc2NvcmUgd3JhcHBlZCBhcnJheSBvZiBlbGVtZW50c1xuICAqL1xuICBlbGVtZW50cyAoLi4uYXJncykge1xuICAgIHJldHVybiBfKHRoaXMuJCguLi5hcmdzKS5tYXAoKGluZGV4LGVsKT0+e1xuICAgICAgcmV0dXJuIGNoZWVyaW8oZWwpXG4gICAgfSkpXG4gIH1cblxuICBydW5Ib29rIChpZGVudGlmaWVyID0gXCJcIiwgLi4uYXJncykge1xuICAgIGxldCBob29rID0gdGhpcy5vcHRpb25zW2lkZW50aWZpZXJdIHx8IHRoaXNbaWRlbnRpZmllcl1cblxuICAgIGlmKHR5cGVvZihob29rKSA9PT0gXCJmdW5jdGlvblwiKXtcbiAgICAgIGhvb2suYXBwbHkodGhpcywgYXJncylcbiAgICB9XG4gIH1cbn1cbiJdfQ==