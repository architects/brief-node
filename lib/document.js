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

    (0, _render2.process)(this);
  }

  /**
  * return a reference to the briefcase this document belongs to.
  */

  _createClass(Document, [{
    key: 'getBriefcase',
    value: function getBriefcase() {
      return _index2['default'].findBriefcaseByPath(this.path);
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

      (0, _render2.process)(this);
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
//# sourceMappingURL=data:application/json;base64,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ZnMgZnJvbSAnZnMnXG5pbXBvcnQgY2hlZXJpbyBmcm9tICdjaGVlcmlvJ1xuaW1wb3J0IF8gZnJvbSAndW5kZXJzY29yZSdcbmltcG9ydCB2aXNpdCBmcm9tICd1bmlzdC11dGlsLXZpc2l0J1xuaW1wb3J0IHBhdGggZnJvbSAncGF0aCdcblxuaW1wb3J0IGJyaWVmIGZyb20gJy4vaW5kZXgnXG5pbXBvcnQgTW9kZWwgZnJvbSAnLi9tb2RlbCdcbmltcG9ydCBQcmVzZW50ZXIgZnJvbSBcIi4vcHJlc2VudGVyXCJcbmltcG9ydCB7cHJvY2VzcywgcGFyc2V9IGZyb20gJy4vcmVuZGVyJ1xuaW1wb3J0IHtjbG9uZSwgc2luZ3VsYXJpemV9IGZyb20gJy4vdXRpbCdcblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgRG9jdW1lbnQge1xuICB0b1N0cmluZygpIHtcbiAgICByZXR1cm4gdGhpcy5wYXRoXG4gIH1cbiAgXG4gIC8qKlxuICAgKiBjcmVhdGVzIGEgbmV3IGluc3RhbmNlIG9mIHRoZSBkb2N1bWVudCBhdCBwYXRoXG4gICAqIEBwYXJhbSB7cGF0aH0gcGF0aCAtIHRoZSBhYnNvbHV0ZSBwYXRoIHRvIHRoZSBtYXJrZG93biBkb2N1bWVudC5cbiAgKi9cbiAgY29uc3RydWN0b3IocGF0aG5hbWUsIG9wdGlvbnMpIHtcbiAgICB0aGlzLm9wdGlvbnMgPSBvcHRpb25zIHx8IHt9XG4gICAgdGhpcy5wYXRoID0gcGF0aG5hbWVcbiAgICB0aGlzLmRpcm5hbWUgPSBwYXRoLmRpcm5hbWUodGhpcy5wYXRoKVxuXG4gICAgaWYodGhpcy5vcHRpb25zLnR5cGUpe1xuICAgICAgdGhpcy50eXBlID0gdGhpcy5vcHRpb25zLnR5cGVcbiAgICB9XG5cbiAgICBwcm9jZXNzKHRoaXMpXG4gIH1cbiAgXG4gIC8qKlxuICAqIHJldHVybiBhIHJlZmVyZW5jZSB0byB0aGUgYnJpZWZjYXNlIHRoaXMgZG9jdW1lbnQgYmVsb25ncyB0by5cbiAgKi9cbiAgZ2V0QnJpZWZjYXNlKCl7XG4gICAgcmV0dXJuIGJyaWVmLmZpbmRCcmllZmNhc2VCeVBhdGgodGhpcy5wYXRoKVxuICB9XG4gIC8qKlxuICAgKiBnZXQgYSBtb2RlbCB0byByZXByZXNlbnQgdGhpcyBkb2N1bWVudCBhbmQgdGhlIGRhdGEgd2UgcGFyc2UgZnJvbSBpdC5cbiAgICpcbiAgICogQHJldHVybiB7TW9kZWx9IC0gYSBtb2RlbCBpbnN0YW5jZSBcbiAgKi9cbiAgdG9Nb2RlbCAob3B0aW9ucz17fSkge1xuICAgIHJldHVybiBNb2RlbC5mcm9tRG9jdW1lbnQodGhpcywgb3B0aW9ucylcbiAgfVxuICBcbiAgd3JpdGVTeW5jKG5ld0NvbnRlbnQpe1xuICAgIG5ld0NvbnRlbnQgPSBuZXdDb250ZW50IHx8IHRoaXMuY29udGVudFxuICAgIGZzLndyaXRlRmlsZVN5bmModGhpcy5wYXRoLCBuZXdDb250ZW50KVxuICAgIHRoaXMucmVsb2FkKClcbiAgfVxuXG4gIGxhc3RNb2RpZmllZEF0KCl7XG4gICAgcmV0dXJuIGZzLmxzdGF0U3luYyh0aGlzLnBhdGgpLm10aW1lLnZhbHVlT2YoKVxuICB9XG5cbiAgLyoqXG4gICAqIHJldHVybnMgYSByZW5kZXJlZCBkb2N1bWVudFxuICAgKiBAcmV0dXJuIHtEb2N1bWVudH0gLSB0aGlzIGRvY3VtZW50XG4gICovXG4gIHJlbmRlcmVkKCkge1xuICAgIHRoaXMucmVuZGVyKClcbiAgICByZXR1cm4gdGhpc1xuICB9XG4gIFxuICAvKipcbiAgICogcmVuZGVyIHRoZSBkb2N1bWVudC5cbiAgICogQHJldHVybiB7c3RyaW5nfSAtIFJlbmRlcmVkIEhUTUwgZnJvbSB0aGUgZG9jdW1lbnQgbWFya2Rvd25cbiAgKi9cbiAgcmVuZGVyKCkge1xuICAgIHJldHVybiB0aGlzLmh0bWwgPyB0aGlzLmh0bWwgOiByZW5kZXIodGhpcykgXG4gIH1cblxuICBnZXRUeXBlKCl7XG4gICAgaWYodGhpcy5kYXRhICYmIHRoaXMuZGF0YS50eXBlKXtcbiAgICAgIHJldHVybiB0aGlzLmRhdGEudHlwZVxuICAgIH1cblxuICAgIHJldHVybiBzaW5ndWxhcml6ZShwYXRoLmJhc2VuYW1lKHRoaXMuZGlybmFtZSkpXG4gIH1cbiAgXG4gIC8qKiBcbiAgKiBhcHBseSBhIHByZXNlbnRlciB0byB0aGUgZG9jdW1lbnQuIHVzZWZ1bCBmb3IgZGVidWdnaW5nXG4gICogcHVycG9zZXMuXG4gICovXG4gIHByZXNlbnQgKG1ldGhvZCwgb3B0aW9ucz17fSkge1xuICAgIGxldCBwcmVzZW50ZXIgPSBQcmVzZW50ZXIucHJlc2VudCh0aGlzLCBvcHRpb25zKVxuICAgIHJldHVybiBwcmVzZW50ZXJbbWV0aG9kXSgpXG4gIH1cbiAgXG4gIC8qKlxuICAqIHZpc2l0IGV2ZXJ5IG5vZGUgb2YgdGhlIHBhcnNlZCBhc3RcbiAgKi9cbiAgdmlzaXQodHlwZSwgaXRlcmF0b3IpIHtcbiAgICB2aXNpdCh0aGlzLmFzdCwgdHlwZSwgaXRlcmF0b3IpXG4gIH1cblxuICBnZXRBU1QgKCkge1xuICAgIHJldHVybiB0aGlzLmFzdFxuICB9XG5cbiAgcmVsb2FkKCl7XG4gICAgZGVsZXRlKHRoaXMuYXJ0aWNsZXMpXG4gICAgZGVsZXRlKHRoaXMuc2VjdGlvbnMpXG4gICAgZGVsZXRlKHRoaXMuZGF0YSlcbiAgICBkZWxldGUodGhpcy5jb250ZW50KVxuXG4gICAgcHJvY2Vzcyh0aGlzKVxuICB9XG4gIFxuICBnZXRTZWN0aW9uSGVhZGluZ3MoKXtcbiAgICByZXR1cm4gdGhpcy5nZXRTZWN0aW9uTm9kZXMoKS5tYXAoc2VjdGlvbiA9PiBzZWN0aW9uLmhlYWRpbmcpXG4gIH1cblxuICBnZXRBcnRpY2xlSGVhZGluZ3MoKXtcbiAgICByZXR1cm4gdGhpcy5nZXRBcnRpY2xlTm9kZXMoKS5tYXAoYXJ0aWNsZSA9PiBhcnRpY2xlLmhlYWRpbmcpXG4gIH1cblxuICBnZXRUb3BTZWN0aW9uKCkge1xuICAgIHJldHVybiB0aGlzLmdldFNlY3Rpb25Ob2RlcygpLmZpbmQobm9kZSA9PiBub2RlLnRvcClcbiAgfVxuXG4gIGdldFNlY3Rpb25Ob2RlcygpIHtcbiAgICBpZih0aGlzLnNlY3Rpb25zKXsgcmV0dXJuIHRoaXMuc2VjdGlvbnMgfVxuXG4gICAgdGhpcy5zZWN0aW9ucyA9IFtdXG4gICAgdGhpcy52aXNpdCgnc2VjdGlvbicsIG5vZGUgPT4gdGhpcy5zZWN0aW9ucy5wdXNoKG5vZGUpKVxuICAgIHJldHVybiB0aGlzLnNlY3Rpb25zID0gdGhpcy5zZWN0aW9ucy5yZXZlcnNlKClcbiAgfVxuXG4gIGdldEFydGljbGVOb2RlcygpIHtcbiAgICBpZih0aGlzLmFydGljbGVzKXsgcmV0dXJuIHRoaXMuYXJ0aWNsZXMgfVxuXG4gICAgdGhpcy5hcnRpY2xlcyA9IFtdXG4gICAgdGhpcy52aXNpdCgnYXJ0aWNsZScsIG5vZGUgPT4gdGhpcy5hcnRpY2xlcy5wdXNoKG5vZGUpKVxuICAgIHJldHVybiB0aGlzLmFydGljbGVzID0gdGhpcy5hcnRpY2xlcy5yZXZlcnNlKClcbiAgfVxuXG4gIGdldENoaWxkcmVuICgpIHtcbiAgICByZXR1cm4gdGhpcy5hc3QuY2hpbGRyZW5bMF0uY2hpbGRyZW4gIFxuICB9XG5cbiAgZ2V0SGVhZGluZ05vZGVzICgpIHtcbiAgICBsZXQgcmVzdWx0cyA9IFtdXG4gICAgdGhpcy52aXNpdCgnaGVhZGluZycsIG5vZGUgPT4gcmVzdWx0cy5wdXNoKG5vZGUpKVxuICAgIHJldHVybiByZXN1bHRzXG4gIH1cbiAgXG4gIC8qKlxuICAqIEdpdmVuIGEgY3NzIHNlbGVjdG9yLCByZXR1cm4gZWFjaCBvZiB0aGUgZWxlbWVudHNcbiAgKiAgIHdyYXBwZWQgd2l0aCBhIGNoZWVyaW8gb2JqZWN0LiBcbiAgKlxuICAqIEBwYXJhbSB7c3RyaW5nfSBzZWxlY3RvciAtIGEgY3NzIHNlbGVjdG9yIHRvIG1hdGNoXG4gICogQHJldHVybiAtIGFuIHVuZGVyc2NvcmUgd3JhcHBlZCBhcnJheSBvZiBlbGVtZW50c1xuICAqL1xuICBlbGVtZW50cyAoLi4uYXJncykge1xuICAgIHJldHVybiBfKHRoaXMuJCguLi5hcmdzKS5tYXAoKGluZGV4LGVsKT0+e1xuICAgICAgcmV0dXJuIGNoZWVyaW8oZWwpXG4gICAgfSkpXG4gIH1cblxuICBydW5Ib29rIChpZGVudGlmaWVyID0gXCJcIiwgLi4uYXJncykge1xuICAgIGxldCBob29rID0gdGhpcy5vcHRpb25zW2lkZW50aWZpZXJdIHx8IHRoaXNbaWRlbnRpZmllcl1cblxuICAgIGlmKHR5cGVvZihob29rKSA9PT0gXCJmdW5jdGlvblwiKXtcbiAgICAgIGhvb2suYXBwbHkodGhpcywgYXJncylcbiAgICB9XG4gIH1cbn1cbiJdfQ==