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

var _mdastUtilVisit = require('mdast-util-visit');

var _mdastUtilVisit2 = _interopRequireDefault(_mdastUtilVisit);

var _model = require('./model');

var _model2 = _interopRequireDefault(_model);

var _presenter = require("./presenter");

var _presenter2 = _interopRequireDefault(_presenter);

var _render2 = require('./render');

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

    this.options = options || {};
    this.path = path;
    this.dirname = require('path').dirname(this.path);

    if (this.options.type) {
      this.type = this.options.type;
    }

    (0, _render2.process)(this);
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

      return this.dirname;
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
      (0, _mdastUtilVisit2['default'])(this.ast, type, iterator);
    }
  }, {
    key: 'getAst',
    value: function getAst() {
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
    key: 'getTopSection',
    value: function getTopSection() {
      return this.getSectionNodes()[0];
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
      return this.sections;
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
      return this.articles;
    }
  }, {
    key: 'getTopSectionNode',
    value: function getTopSectionNode() {}
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
//# sourceMappingURL=data:application/json;base64,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QUV2RCxVQUFHLE9BQU8sSUFBSSxBQUFDLEtBQUssVUFBVSxFQUFDOzBDQUhKLElBQUk7QUFBSixjQUFJOzs7QUFJN0IsWUFBSSxDQUFDLEtBQUssQ0FBQyxJQUFJLEVBQUUsSUFBSSxDQUFDLENBQUE7T0FDdkI7S0FDRjs7O1NBM0lrQixRQUFROzs7cUJBQVIsUUFBUSIsImZpbGUiOiJkb2N1bWVudC5qcyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCBmcyBmcm9tICdmcydcbmltcG9ydCBjaGVlcmlvIGZyb20gJ2NoZWVyaW8nXG5pbXBvcnQgXyBmcm9tICd1bmRlcnNjb3JlJ1xuaW1wb3J0IHZpc2l0IGZyb20gJ21kYXN0LXV0aWwtdmlzaXQnXG5cbmltcG9ydCBNb2RlbCBmcm9tICcuL21vZGVsJ1xuaW1wb3J0IFByZXNlbnRlciBmcm9tIFwiLi9wcmVzZW50ZXJcIlxuaW1wb3J0IHtwcm9jZXNzLCBwYXJzZX0gZnJvbSAnLi9yZW5kZXInXG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIERvY3VtZW50IHtcbiAgdG9TdHJpbmcoKSB7XG4gICAgcmV0dXJuIHRoaXMucGF0aFxuICB9XG4gIFxuICAvKipcbiAgICogY3JlYXRlcyBhIG5ldyBpbnN0YW5jZSBvZiB0aGUgZG9jdW1lbnQgYXQgcGF0aFxuICAgKiBAcGFyYW0ge3BhdGh9IHBhdGggLSB0aGUgYWJzb2x1dGUgcGF0aCB0byB0aGUgbWFya2Rvd24gZG9jdW1lbnQuXG4gICovXG4gIGNvbnN0cnVjdG9yKHBhdGgsIG9wdGlvbnMpIHtcbiAgICB0aGlzLm9wdGlvbnMgPSBvcHRpb25zIHx8IHt9XG4gICAgdGhpcy5wYXRoID0gcGF0aFxuICAgIHRoaXMuZGlybmFtZSA9IHJlcXVpcmUoJ3BhdGgnKS5kaXJuYW1lKHRoaXMucGF0aClcblxuICAgIGlmKHRoaXMub3B0aW9ucy50eXBlKXtcbiAgICAgIHRoaXMudHlwZSA9IHRoaXMub3B0aW9ucy50eXBlXG4gICAgfVxuXG4gICAgcHJvY2Vzcyh0aGlzKVxuICB9XG4gIFxuICAvKipcbiAgICogZ2V0IGEgbW9kZWwgdG8gcmVwcmVzZW50IHRoaXMgZG9jdW1lbnQgYW5kIHRoZSBkYXRhIHdlIHBhcnNlIGZyb20gaXQuXG4gICAqXG4gICAqIEByZXR1cm4ge01vZGVsfSAtIGEgbW9kZWwgaW5zdGFuY2UgXG4gICovXG4gIHRvTW9kZWwgKG9wdGlvbnM9e30pIHtcbiAgICByZXR1cm4gTW9kZWwuZnJvbURvY3VtZW50KHRoaXMsIG9wdGlvbnMpXG4gIH1cbiAgXG4gIC8qKlxuICAgKiByZXR1cm5zIGEgcmVuZGVyZWQgZG9jdW1lbnRcbiAgICogQHJldHVybiB7RG9jdW1lbnR9IC0gdGhpcyBkb2N1bWVudFxuICAqL1xuICByZW5kZXJlZCgpIHtcbiAgICB0aGlzLnJlbmRlcigpXG4gICAgcmV0dXJuIHRoaXNcbiAgfVxuICBcbiAgLyoqXG4gICAqIHJlbmRlciB0aGUgZG9jdW1lbnQuXG4gICAqIEByZXR1cm4ge3N0cmluZ30gLSBSZW5kZXJlZCBIVE1MIGZyb20gdGhlIGRvY3VtZW50IG1hcmtkb3duXG4gICovXG4gIHJlbmRlcigpIHtcbiAgICByZXR1cm4gdGhpcy5odG1sID8gdGhpcy5odG1sIDogcmVuZGVyKHRoaXMpIFxuICB9XG5cbiAgZ2V0VHlwZSgpe1xuICAgIGlmKHRoaXMuZGF0YSAmJiB0aGlzLmRhdGEudHlwZSl7XG4gICAgICByZXR1cm4gdGhpcy5kYXRhLnR5cGVcbiAgICB9XG5cbiAgICByZXR1cm4gdGhpcy5kaXJuYW1lXG4gIH1cbiAgXG4gIC8qKiBcbiAgKiBhcHBseSBhIHByZXNlbnRlciB0byB0aGUgZG9jdW1lbnQuIHVzZWZ1bCBmb3IgZGVidWdnaW5nXG4gICogcHVycG9zZXMuXG4gICovXG4gIHByZXNlbnQgKG1ldGhvZCwgb3B0aW9ucz17fSkge1xuICAgIGxldCBwcmVzZW50ZXIgPSBQcmVzZW50ZXIucHJlc2VudCh0aGlzLCBvcHRpb25zKVxuICAgIHJldHVybiBwcmVzZW50ZXJbbWV0aG9kXSgpXG4gIH1cbiAgXG4gIC8qKlxuICAqIHZpc2l0IGV2ZXJ5IG5vZGUgb2YgdGhlIHBhcnNlZCBhc3RcbiAgKi9cbiAgdmlzaXQodHlwZSwgaXRlcmF0b3IpIHtcbiAgICB2aXNpdCh0aGlzLmFzdCwgdHlwZSwgaXRlcmF0b3IpXG4gIH1cblxuICBnZXRBc3QgKCkge1xuICAgIHJldHVybiB0aGlzLmFzdFxuICB9XG5cbiAgcmVsb2FkKCl7XG4gICAgZGVsZXRlKHRoaXMuYXJ0aWNsZXMpXG4gICAgZGVsZXRlKHRoaXMuc2VjdGlvbnMpXG4gICAgZGVsZXRlKHRoaXMuZGF0YSlcbiAgICBkZWxldGUodGhpcy5jb250ZW50KVxuXG4gICAgcHJvY2Vzcyh0aGlzKVxuICB9XG4gIFxuICBnZXRUb3BTZWN0aW9uKCkge1xuICAgIHJldHVybiB0aGlzLmdldFNlY3Rpb25Ob2RlcygpWzBdXG4gIH1cblxuICBnZXRTZWN0aW9uTm9kZXMoKSB7XG4gICAgaWYodGhpcy5zZWN0aW9ucyl7XG4gICAgICByZXR1cm4gdGhpcy5zZWN0aW9uc1xuICAgIH1cbiAgICB0aGlzLnNlY3Rpb25zID0gW11cbiAgICB0aGlzLnZpc2l0KCdzZWN0aW9uJywgbm9kZSA9PiB0aGlzLnNlY3Rpb25zLnB1c2gobm9kZSkpXG4gICAgcmV0dXJuIHRoaXMuc2VjdGlvbnNcbiAgfVxuXG4gIGdldEFydGljbGVOb2RlcygpIHtcbiAgICBpZih0aGlzLmFydGljbGVzKXtcbiAgICAgIHJldHVybiB0aGlzLmFydGljbGVzXG4gICAgfVxuICAgIHRoaXMuYXJ0aWNsZXMgPSBbXVxuICAgIHRoaXMudmlzaXQoJ2FydGljbGUnLCBub2RlID0+IHRoaXMuYXJ0aWNsZXMucHVzaChub2RlKSlcbiAgICByZXR1cm4gdGhpcy5hcnRpY2xlc1xuICB9XG5cbiAgZ2V0VG9wU2VjdGlvbk5vZGUoKSB7XG4gICAgXG4gIH1cblxuICBnZXRDaGlsZHJlbiAoKSB7XG4gICAgcmV0dXJuIHRoaXMuYXN0LmNoaWxkcmVuWzBdLmNoaWxkcmVuICBcbiAgfVxuXG4gIGdldEhlYWRpbmdOb2RlcyAoKSB7XG4gICAgbGV0IHJlc3VsdHMgPSBbXVxuICAgIHRoaXMudmlzaXQoJ2hlYWRpbmcnLCBub2RlID0+IHJlc3VsdHMucHVzaChub2RlKSlcbiAgICByZXR1cm4gcmVzdWx0c1xuICB9XG4gIFxuICAvKipcbiAgKiBHaXZlbiBhIGNzcyBzZWxlY3RvciwgcmV0dXJuIGVhY2ggb2YgdGhlIGVsZW1lbnRzXG4gICogICB3cmFwcGVkIHdpdGggYSBjaGVlcmlvIG9iamVjdC4gXG4gICpcbiAgKiBAcGFyYW0ge3N0cmluZ30gc2VsZWN0b3IgLSBhIGNzcyBzZWxlY3RvciB0byBtYXRjaFxuICAqIEByZXR1cm4gLSBhbiB1bmRlcnNjb3JlIHdyYXBwZWQgYXJyYXkgb2YgZWxlbWVudHNcbiAgKi9cbiAgZWxlbWVudHMgKC4uLmFyZ3MpIHtcbiAgICByZXR1cm4gXyh0aGlzLiQoLi4uYXJncykubWFwKChpbmRleCxlbCk9PntcbiAgICAgIHJldHVybiBjaGVlcmlvKGVsKVxuICAgIH0pKVxuICB9XG5cbiAgcnVuSG9vayAoaWRlbnRpZmllciA9IFwiXCIsIC4uLmFyZ3MpIHtcbiAgICBsZXQgaG9vayA9IHRoaXMub3B0aW9uc1tpZGVudGlmaWVyXSB8fCB0aGlzW2lkZW50aWZpZXJdXG5cbiAgICBpZih0eXBlb2YoaG9vaykgPT09IFwiZnVuY3Rpb25cIil7XG4gICAgICBob29rLmFwcGx5KHRoaXMsIGFyZ3MpXG4gICAgfVxuICB9XG59XG4iXX0=