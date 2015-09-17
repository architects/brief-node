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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3NyYy9kb2N1bWVudC5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7a0JBQWUsSUFBSTs7Ozt1QkFDQyxTQUFTOzs7OzBCQUNmLFlBQVk7Ozs7OEJBQ1Isa0JBQWtCOzs7O29CQUNuQixNQUFNOzs7O3FCQUVMLFNBQVM7Ozs7eUJBQ0wsYUFBYTs7Ozt1QkFDTixVQUFVOztvQkFDTixRQUFROztJQUVwQixRQUFRO2VBQVIsUUFBUTs7V0FDbkIsb0JBQUc7QUFDVCxhQUFPLElBQUksQ0FBQyxJQUFJLENBQUE7S0FDakI7Ozs7Ozs7O0FBTVUsV0FUUSxRQUFRLENBU2YsUUFBUSxFQUFFLE9BQU8sRUFBRTswQkFUWixRQUFROztBQVV6QixRQUFJLENBQUMsT0FBTyxHQUFHLE9BQU8sSUFBSSxFQUFFLENBQUE7QUFDNUIsUUFBSSxDQUFDLElBQUksR0FBRyxRQUFRLENBQUE7QUFDcEIsUUFBSSxDQUFDLE9BQU8sR0FBRyxrQkFBSyxPQUFPLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFBOztBQUV0QyxRQUFHLElBQUksQ0FBQyxPQUFPLENBQUMsSUFBSSxFQUFDO0FBQ25CLFVBQUksQ0FBQyxJQUFJLEdBQUcsSUFBSSxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUE7S0FDOUI7O0FBRUQsMEJBQVEsSUFBSSxDQUFDLENBQUE7R0FDZDs7Ozs7Ozs7ZUFuQmtCLFFBQVE7O1dBMEJuQixtQkFBYTtVQUFaLE9BQU8seURBQUMsRUFBRTs7QUFDakIsYUFBTyxtQkFBTSxZQUFZLENBQUMsSUFBSSxFQUFFLE9BQU8sQ0FBQyxDQUFBO0tBQ3pDOzs7Ozs7OztXQU1PLG9CQUFHO0FBQ1QsVUFBSSxDQUFDLE1BQU0sRUFBRSxDQUFBO0FBQ2IsYUFBTyxJQUFJLENBQUE7S0FDWjs7Ozs7Ozs7Ozs7Ozs7Ozs7O09BTUssWUFBRztBQUNQLGFBQU8sSUFBSSxDQUFDLElBQUksR0FBRyxJQUFJLENBQUMsSUFBSSxHQUFHLE1BQU0sQ0FBQyxJQUFJLENB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LElBQUksQ0FBQyxJQUFJLENBQUM7T0FBQSxDQUFDLENBQUE7QUFDakQsYUFBTyxPQUFPLENBQUE7S0FDZjs7Ozs7Ozs7Ozs7V0FTUSxvQkFBVTtBQUNqQixhQUFPLDZCQUFFLElBQUksQ0FBQyxDQUFDLE1BQUEsQ0FBTixJQUFJLFlBQVcsQ0FBQyxHQUFHLENBQUMsVUFBQyxLQUFLLEVBQUMsRUFBRSxFQUFHO0FBQ3ZDLGVBQU8sMEJBQVEsRUFBRSxDQUFDLENBQUE7T0FDbkIsQ0FBQyxDQUFDLENBQUE7S0FDSjs7O1dBRU8sbUJBQTJCO1VBQTFCLFVBQVUseURBQUcsRUFBRTs7QUFDdEIsVUFBSSxJQUFJLEdBQUcsSUFBSSxDQUFDLE9BQU8sQ0FBQyxVQUFVLENBQUMsSUFBSSxJQUFJLENBQUMsVUFBVSxDQUFDLENBQUE7O0FBRXZELFVBQUcsT0FBTyxJQUFJLEFBQUMsS0FBSyxVQUFVLEVBQUM7MENBSEosSUFBSTtBQUFKLGNBQUk7OztBQUk3QixZQUFJLENBQUMsS0FBSyxDQUFDLElBQUksRUFBRSxJQUFJLENBQUMsQ0FBQTtPQUN2QjtLQUNGOzs7U0E3SWtCLFFBQVE7OztxQkFBUixRQUFRIiwiZmlsZSI6ImRvY3VtZW50LmpzIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IGZzIGZyb20gJ2ZzJ1xuaW1wb3J0IGNoZWVyaW8gZnJvbSAnY2hlZXJpbydcbmltcG9ydCBfIGZyb20gJ3VuZGVyc2NvcmUnXG5pbXBvcnQgdmlzaXQgZnJvbSAndW5pc3QtdXRpbC12aXNpdCdcbmltcG9ydCBwYXRoIGZyb20gJ3BhdGgnXG5cbmltcG9ydCBNb2RlbCBmcm9tICcuL21vZGVsJ1xuaW1wb3J0IFByZXNlbnRlciBmcm9tIFwiLi9wcmVzZW50ZXJcIlxuaW1wb3J0IHtwcm9jZXNzLCBwYXJzZX0gZnJvbSAnLi9yZW5kZXInXG5pbXBvcnQge2Nsb25lLCBzaW5ndWxhcml6ZX0gZnJvbSAnLi91dGlsJ1xuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBEb2N1bWVudCB7XG4gIHRvU3RyaW5nKCkge1xuICAgIHJldHVybiB0aGlzLnBhdGhcbiAgfVxuICBcbiAgLyoqXG4gICAqIGNyZWF0ZXMgYSBuZXcgaW5zdGFuY2Ugb2YgdGhlIGRvY3VtZW50IGF0IHBhdGhcbiAgICogQHBhcmFtIHtwYXRofSBwYXRoIC0gdGhlIGFic29sdXRlIHBhdGggdG8gdGhlIG1hcmtkb3duIGRvY3VtZW50LlxuICAqL1xuICBjb25zdHJ1Y3RvcihwYXRobmFtZSwgb3B0aW9ucykge1xuICAgIHRoaXMub3B0aW9ucyA9IG9wdGlvbnMgfHwge31cbiAgICB0aGlzLnBhdGggPSBwYXRobmFtZVxuICAgIHRoaXMuZGlybmFtZSA9IHBhdGguZGlybmFtZSh0aGlzLnBhdGgpXG5cbiAgICBpZih0aGlzLm9wdGlvbnMudHlwZSl7XG4gICAgICB0aGlzLnR5cGUgPSB0aGlzLm9wdGlvbnMudHlwZVxuICAgIH1cblxuICAgIHByb2Nlc3ModGhpcylcbiAgfVxuICBcbiAgLyoqXG4gICAqIGdldCBhIG1vZGVsIHRvIHJlcHJlc2VudCB0aGlzIGRvY3VtZW50IGFuZCB0aGUgZGF0YSB3ZSBwYXJzZSBmcm9tIGl0LlxuICAgKlxuICAgKiBAcmV0dXJuIHtNb2RlbH0gLSBhIG1vZGVsIGluc3RhbmNlIFxuICAqL1xuICB0b01vZGVsIChvcHRpb25zPXt9KSB7XG4gICAgcmV0dXJuIE1vZGVsLmZyb21Eb2N1bWVudCh0aGlzLCBvcHRpb25zKVxuICB9XG4gIFxuICAvKipcbiAgICogcmV0dXJucyBhIHJlbmRlcmVkIGRvY3VtZW50XG4gICAqIEByZXR1cm4ge0RvY3VtZW50fSAtIHRoaXMgZG9jdW1lbnRcbiAgKi9cbiAgcmVuZGVyZWQoKSB7XG4gICAgdGhpcy5yZW5kZXIoKVxuICAgIHJldHVybiB0aGlzXG4gIH1cbiAgXG4gIC8qKlxuICAgKiByZW5kZXIgdGhlIGRvY3VtZW50LlxuICAgKiBAcmV0dXJuIHtzdHJpbmd9IC0gUmVuZGVyZWQgSFRNTCBmcm9tIHRoZSBkb2N1bWVudCBtYXJrZG93blxuICAqL1xuICByZW5kZXIoKSB7XG4gICAgcmV0dXJuIHRoaXMuaHRtbCA/IHRoaXMuaHRtbCA6IHJlbmRlcih0aGlzKSBcbiAgfVxuXG4gIGdldFR5cGUoKXtcbiAgICBpZih0aGlzLmRhdGEgJiYgdGhpcy5kYXRhLnR5cGUpe1xuICAgICAgcmV0dXJuIHRoaXMuZGF0YS50eXBlXG4gICAgfVxuXG4gICAgcmV0dXJuIHNpbmd1bGFyaXplKHBhdGguYmFzZW5hbWUodGhpcy5kaXJuYW1lKSlcbiAgfVxuICBcbiAgLyoqIFxuICAqIGFwcGx5IGEgcHJlc2VudGVyIHRvIHRoZSBkb2N1bWVudC4gdXNlZnVsIGZvciBkZWJ1Z2dpbmdcbiAgKiBwdXJwb3Nlcy5cbiAgKi9cbiAgcHJlc2VudCAobWV0aG9kLCBvcHRpb25zPXt9KSB7XG4gICAgbGV0IHByZXNlbnRlciA9IFByZXNlbnRlci5wcmVzZW50KHRoaXMsIG9wdGlvbnMpXG4gICAgcmV0dXJuIHByZXNlbnRlclttZXRob2RdKClcbiAgfVxuICBcbiAgLyoqXG4gICogdmlzaXQgZXZlcnkgbm9kZSBvZiB0aGUgcGFyc2VkIGFzdFxuICAqL1xuICB2aXNpdCh0eXBlLCBpdGVyYXRvcikge1xuICAgIHZpc2l0KHRoaXMuYXN0LCB0eXBlLCBpdGVyYXRvcilcbiAgfVxuXG4gIGdldEFTVCAoKSB7XG4gICAgcmV0dXJuIHRoaXMuYXN0XG4gIH1cblxuICByZWxvYWQoKXtcbiAgICBkZWxldGUodGhpcy5hcnRpY2xlcylcbiAgICBkZWxldGUodGhpcy5zZWN0aW9ucylcbiAgICBkZWxldGUodGhpcy5kYXRhKVxuICAgIGRlbGV0ZSh0aGlzLmNvbnRlbnQpXG5cbiAgICBwcm9jZXNzKHRoaXMpXG4gIH1cbiAgXG4gIGdldFNlY3Rpb25IZWFkaW5ncygpe1xuICAgIHJldHVybiB0aGlzLmdldFNlY3Rpb25Ob2RlcygpLm1hcChzZWN0aW9uID0+IHNlY3Rpb24uaGVhZGluZylcbiAgfVxuXG4gIGdldEFydGljbGVIZWFkaW5ncygpe1xuICAgIHJldHVybiB0aGlzLmdldEFydGljbGVOb2RlcygpLm1hcChhcnRpY2xlID0+IGFydGljbGUuaGVhZGluZylcbiAgfVxuXG4gIGdldFRvcFNlY3Rpb24oKSB7XG4gICAgcmV0dXJuIHRoaXMuZ2V0U2VjdGlvbk5vZGVzKCkuZmluZChub2RlID0+IG5vZGUudG9wKVxuICB9XG5cbiAgZ2V0U2VjdGlvbk5vZGVzKCkge1xuICAgIGlmKHRoaXMuc2VjdGlvbnMpeyByZXR1cm4gdGhpcy5zZWN0aW9ucyB9XG5cbiAgICB0aGlzLnNlY3Rpb25zID0gW11cbiAgICB0aGlzLnZpc2l0KCdzZWN0aW9uJywgbm9kZSA9PiB0aGlzLnNlY3Rpb25zLnB1c2gobm9kZSkpXG4gICAgcmV0dXJuIHRoaXMuc2VjdGlvbnMgPSB0aGlzLnNlY3Rpb25zLnJldmVyc2UoKVxuICB9XG5cbiAgZ2V0QXJ0aWNsZU5vZGVzKCkge1xuICAgIGlmKHRoaXMuYXJ0aWNsZXMpeyByZXR1cm4gdGhpcy5hcnRpY2xlcyB9XG5cbiAgICB0aGlzLmFydGljbGVzID0gW11cbiAgICB0aGlzLnZpc2l0KCdhcnRpY2xlJywgbm9kZSA9PiB0aGlzLmFydGljbGVzLnB1c2gobm9kZSkpXG4gICAgcmV0dXJuIHRoaXMuYXJ0aWNsZXMgPSB0aGlzLmFydGljbGVzLnJldmVyc2UoKVxuICB9XG5cbiAgZ2V0Q2hpbGRyZW4gKCkge1xuICAgIHJldHVybiB0aGlzLmFzdC5jaGlsZHJlblswXS5jaGlsZHJlbiAgXG4gIH1cblxuICBnZXRIZWFkaW5nTm9kZXMgKCkge1xuICAgIGxldCByZXN1bHRzID0gW11cbiAgICB0aGlzLnZpc2l0KCdoZWFkaW5nJywgbm9kZSA9PiByZXN1bHRzLnB1c2gobm9kZSkpXG4gICAgcmV0dXJuIHJlc3VsdHNcbiAgfVxuICBcbiAgLyoqXG4gICogR2l2ZW4gYSBjc3Mgc2VsZWN0b3IsIHJldHVybiBlYWNoIG9mIHRoZSBlbGVtZW50c1xuICAqICAgd3JhcHBlZCB3aXRoIGEgY2hlZXJpbyBvYmplY3QuIFxuICAqXG4gICogQHBhcmFtIHtzdHJpbmd9IHNlbGVjdG9yIC0gYSBjc3Mgc2VsZWN0b3IgdG8gbWF0Y2hcbiAgKiBAcmV0dXJuIC0gYW4gdW5kZXJzY29yZSB3cmFwcGVkIGFycmF5IG9mIGVsZW1lbnRzXG4gICovXG4gIGVsZW1lbnRzICguLi5hcmdzKSB7XG4gICAgcmV0dXJuIF8odGhpcy4kKC4uLmFyZ3MpLm1hcCgoaW5kZXgsZWwpPT57XG4gICAgICByZXR1cm4gY2hlZXJpbyhlbClcbiAgICB9KSlcbiAgfVxuXG4gIHJ1bkhvb2sgKGlkZW50aWZpZXIgPSBcIlwiLCAuLi5hcmdzKSB7XG4gICAgbGV0IGhvb2sgPSB0aGlzLm9wdGlvbnNbaWRlbnRpZmllcl0gfHwgdGhpc1tpZGVudGlmaWVyXVxuXG4gICAgaWYodHlwZW9mKGhvb2spID09PSBcImZ1bmN0aW9uXCIpe1xuICAgICAgaG9vay5hcHBseSh0aGlzLCBhcmdzKVxuICAgIH1cbiAgfVxufVxuIl19