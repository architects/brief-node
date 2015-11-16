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

var _pipelines = require('./pipelines');

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
    this.id = options.id;

    if (this.options.type) {
      this.type = this.options.type;
    }

    this.renderLog = [];

    this.loadContent({ path: this.path });
    (0, _pipelines.process)(this, this.getBriefcase());
  }

  _createClass(Document, [{
    key: 'loadContent',
    value: function loadContent() {
      var options = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

      if (options.content) {
        return this.content = options.content;
      }
      if (options.path) {
        return this.content = (0, _pipelines.readPath)(options.path);
      }

      if (options.reload) {
        this.reload();
      }
    }
  }, {
    key: 'log',
    value: function log() {
      for (var _len = arguments.length, messages = Array(_len), _key = 0; _key < _len; _key++) {
        messages[_key] = arguments[_key];
      }

      this.renderLog.push(messages);
    }
  }, {
    key: 'viewLog',
    value: function viewLog() {
      this.renderLog.forEach(console.log.bind(console));
    }
  }, {
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

      this.loadContent({
        path: this.path,
        reload: true
      });
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
      delete this.codeBlocks;

      (0, _pipelines.process)(this, this.briefcase);
    }
  }, {
    key: 'getCodeBlocks',
    value: function getCodeBlocks() {
      var _this = this;

      if (this.codeBlocks) {
        return this.codeBlocks;
      }

      this.codeBlocks = [];
      this.visit('code', function (node) {
        return _this.codeBlocks.push(node);
      });
      return this.codeBlocks;
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
      var _this2 = this;

      if (this.sections) {
        return this.sections;
      }

      this.sections = [];
      this.visit('section', function (node) {
        return _this2.sections.push(node);
      });
      return this.sections = this.sections.reverse();
    }
  }, {
    key: 'getArticleNodes',
    value: function getArticleNodes() {
      var _this3 = this;

      if (this.articles) {
        return this.articles;
      }

      this.articles = [];
      this.visit('article', function (node) {
        return _this3.articles.push(node);
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
        for (var _len2 = arguments.length, args = Array(_len2 > 1 ? _len2 - 1 : 0), _key2 = 1; _key2 < _len2; _key2++) {
          args[_key2 - 1] = arguments[_key2];
        }

        hook.apply(this, args);
      }
    }
  }]);

  return Document;
})();

exports['default'] = Document;
module.exports = exports['default'];
//# sourceMappingURL=data:application/json;base64,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QUN0QixVQUFJLElBQUksR0FBRyxJQUFJLENBQUMsT0FBTyxDQUFDLFVBQVUsQ0FBQyxJQUFJLElBQUksQ0FBQyxVQUFVLENBQUMsQ0FBQTs7QUFFdkQsVUFBRyxPQUFPLElBQUksQUFBQyxLQUFLLFVBQVUsRUFBQzsyQ0FISixJQUFJO0FBQUosY0FBSTs7O0FBSTdCLFlBQUksQ0FBQyxLQUFLLENBQUMsSUFBSSxFQUFFLElBQUksQ0FBQyxDQUFBO09BQ3ZCO0tBQ0Y7OztTQWpNa0IsUUFBUTs7O3FCQUFSLFFBQVEiLCJmaWxlIjoiZG9jdW1lbnQuanMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgZnMgZnJvbSAnZnMnXG5pbXBvcnQgY2hlZXJpbyBmcm9tICdjaGVlcmlvJ1xuaW1wb3J0IF8gZnJvbSAndW5kZXJzY29yZSdcbmltcG9ydCB2aXNpdCBmcm9tICd1bmlzdC11dGlsLXZpc2l0J1xuaW1wb3J0IHBhdGggZnJvbSAncGF0aCdcblxuaW1wb3J0IGJyaWVmIGZyb20gJy4vaW5kZXgnXG5pbXBvcnQgTW9kZWwgZnJvbSAnLi9tb2RlbCdcbmltcG9ydCBQcmVzZW50ZXIgZnJvbSBcIi4vcHJlc2VudGVyXCJcbmltcG9ydCB7cHJvY2VzcywgcGFyc2UsIHJlYWRQYXRofSBmcm9tICcuL3BpcGVsaW5lcydcbmltcG9ydCB7Y2xvbmUsIHNpbmd1bGFyaXplfSBmcm9tICcuL3V0aWwnXG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIERvY3VtZW50IHtcbiAgdG9TdHJpbmcoKSB7XG4gICAgcmV0dXJuIHRoaXMucGF0aFxuICB9XG4gIFxuICAvKipcbiAgICogY3JlYXRlcyBhIG5ldyBpbnN0YW5jZSBvZiB0aGUgZG9jdW1lbnQgYXQgcGF0aFxuICAgKiBAcGFyYW0ge3BhdGh9IHBhdGggLSB0aGUgYWJzb2x1dGUgcGF0aCB0byB0aGUgbWFya2Rvd24gZG9jdW1lbnQuXG4gICovXG4gIGNvbnN0cnVjdG9yKHBhdGhuYW1lLCBvcHRpb25zKSB7XG4gICAgdGhpcy5vcHRpb25zID0gb3B0aW9ucyB8fCB7fVxuICAgIHRoaXMucGF0aCA9IHBhdGhuYW1lXG4gICAgdGhpcy5kaXJuYW1lID0gcGF0aC5kaXJuYW1lKHRoaXMucGF0aClcbiAgICB0aGlzLmlkID0gb3B0aW9ucy5pZFxuXG4gICAgaWYodGhpcy5vcHRpb25zLnR5cGUpe1xuICAgICAgdGhpcy50eXBlID0gdGhpcy5vcHRpb25zLnR5cGVcbiAgICB9XG5cbiAgICB0aGlzLnJlbmRlckxvZyA9IFtdXG4gICAgXG4gICAgdGhpcy5sb2FkQ29udGVudCh7cGF0aDogdGhpcy5wYXRofSlcbiAgICBwcm9jZXNzKHRoaXMsIHRoaXMuZ2V0QnJpZWZjYXNlKCkpXG4gIH1cblxuICBsb2FkQ29udGVudChvcHRpb25zID0ge30pe1xuICAgIGlmKG9wdGlvbnMuY29udGVudCl7IHJldHVybiB0aGlzLmNvbnRlbnQgPSBvcHRpb25zLmNvbnRlbnQgfVxuICAgIGlmKG9wdGlvbnMucGF0aCl7IHJldHVybiB0aGlzLmNvbnRlbnQgPSByZWFkUGF0aChvcHRpb25zLnBhdGgpIH1cblxuICAgIGlmKG9wdGlvbnMucmVsb2FkKXsgdGhpcy5yZWxvYWQoKSB9XG4gIH1cbiAgXG4gIGxvZyguLi5tZXNzYWdlcyl7XG4gICAgdGhpcy5yZW5kZXJMb2cucHVzaChtZXNzYWdlcylcbiAgfVxuXG4gIHZpZXdMb2coKXtcbiAgICB0aGlzLnJlbmRlckxvZy5mb3JFYWNoKGNvbnNvbGUubG9nLmJpbmQoY29uc29sZSkpXG4gIH1cblxuICByZXNvbHZlTGluayhwYXRoQWxpYXMpe1xuICAgIHJldHVybiB0aGlzLmdldEJyaWVmY2FzZSgpLnJlc29sdmVMaW5rKHBhdGhBbGlhcylcbiAgfVxuXG4gIC8qKlxuICAqIHJldHVybiBhIHJlZmVyZW5jZSB0byB0aGUgYnJpZWZjYXNlIHRoaXMgZG9jdW1lbnQgYmVsb25ncyB0by5cbiAgKi9cbiAgZ2V0QnJpZWZjYXNlKCl7XG4gICAgaWYodGhpcy5icmllZmNhc2UpIHsgcmV0dXJuIHRoaXMuYnJpZWZjYXNlIH1cbiAgICByZXR1cm4gdGhpcy5icmllZmNhc2UgPSBicmllZi5maW5kQnJpZWZjYXNlQnlQYXRoKHRoaXMucGF0aClcbiAgfVxuICAvKipcbiAgICogZ2V0IGEgbW9kZWwgdG8gcmVwcmVzZW50IHRoaXMgZG9jdW1lbnQgYW5kIHRoZSBkYXRhIHdlIHBhcnNlIGZyb20gaXQuXG4gICAqXG4gICAqIEByZXR1cm4ge01vZGVsfSAtIGEgbW9kZWwgaW5zdGFuY2UgXG4gICovXG4gIHRvTW9kZWwgKG9wdGlvbnM9e30pIHtcbiAgICByZXR1cm4gTW9kZWwuZnJvbURvY3VtZW50KHRoaXMsIG9wdGlvbnMpXG4gIH1cbiAgXG4gIHdyaXRlU3luYyhuZXdDb250ZW50KXtcbiAgICBuZXdDb250ZW50ID0gbmV3Q29udGVudCB8fCB0aGlzLmNvbnRlbnRcbiAgICBmcy53cml0ZUZpbGVTeW5jKHRoaXMucGF0aCwgbmV3Q29udGVudClcblxuICAgIHRoaXMubG9hZENvbnRlbnQoe1xuICAgICAgcGF0aDogdGhpcy5wYXRoLFxuICAgICAgcmVsb2FkOiB0cnVlXG4gICAgfSlcbiAgfVxuXG4gIGxhc3RNb2RpZmllZEF0KCl7XG4gICAgcmV0dXJuIGZzLmxzdGF0U3luYyh0aGlzLnBhdGgpLm10aW1lLnZhbHVlT2YoKVxuICB9XG5cbiAgLyoqXG4gICAqIHJldHVybnMgYSByZW5kZXJlZCBkb2N1bWVudFxuICAgKiBAcmV0dXJuIHtEb2N1bWVudH0gLSB0aGlzIGRvY3VtZW50XG4gICovXG4gIHJlbmRlcmVkKCkge1xuICAgIHRoaXMucmVuZGVyKClcbiAgICByZXR1cm4gdGhpc1xuICB9XG4gIFxuICAvKipcbiAgICogcmVuZGVyIHRoZSBkb2N1bWVudC5cbiAgICogQHJldHVybiB7c3RyaW5nfSAtIFJlbmRlcmVkIEhUTUwgZnJvbSB0aGUgZG9jdW1lbnQgbWFya2Rvd25cbiAgKi9cbiAgcmVuZGVyKCkge1xuICAgIHJldHVybiB0aGlzLmh0bWwgPyB0aGlzLmh0bWwgOiByZW5kZXIodGhpcykgXG4gIH1cblxuICBnZXRUeXBlKCl7XG4gICAgaWYodGhpcy5kYXRhICYmIHRoaXMuZGF0YS50eXBlKXtcbiAgICAgIHJldHVybiB0aGlzLmRhdGEudHlwZVxuICAgIH1cblxuICAgIHJldHVybiBzaW5ndWxhcml6ZShwYXRoLmJhc2VuYW1lKHRoaXMuZGlybmFtZSkpXG4gIH1cbiAgXG4gIC8qKiBcbiAgKiBhcHBseSBhIHByZXNlbnRlciB0byB0aGUgZG9jdW1lbnQuIHVzZWZ1bCBmb3IgZGVidWdnaW5nXG4gICogcHVycG9zZXMuXG4gICovXG4gIHByZXNlbnQgKG1ldGhvZCwgb3B0aW9ucz17fSkge1xuICAgIGxldCBwcmVzZW50ZXIgPSBQcmVzZW50ZXIucHJlc2VudCh0aGlzLCBvcHRpb25zKVxuICAgIHJldHVybiBwcmVzZW50ZXJbbWV0aG9kXSgpXG4gIH1cbiAgXG4gIC8qKlxuICAqIHZpc2l0IGV2ZXJ5IG5vZGUgb2YgdGhlIHBhcnNlZCBhc3RcbiAgKi9cbiAgdmlzaXQodHlwZSwgaXRlcmF0b3IpIHtcbiAgICB2aXNpdCh0aGlzLmFzdCwgdHlwZSwgaXRlcmF0b3IpXG4gIH1cblxuICBnZXRBU1QgKCkge1xuICAgIHJldHVybiB0aGlzLmFzdFxuICB9XG5cbiAgcmVsb2FkKCl7XG4gICAgZGVsZXRlKHRoaXMuYXJ0aWNsZXMpXG4gICAgZGVsZXRlKHRoaXMuc2VjdGlvbnMpXG4gICAgZGVsZXRlKHRoaXMuZGF0YSlcbiAgICBkZWxldGUodGhpcy5jb2RlQmxvY2tzKVxuXG4gICAgcHJvY2Vzcyh0aGlzLCB0aGlzLmJyaWVmY2FzZSlcbiAgfVxuICBcbiAgZ2V0Q29kZUJsb2NrcygpIHtcbiAgICBpZih0aGlzLmNvZGVCbG9ja3MpeyByZXR1cm4gdGhpcy5jb2RlQmxvY2tzIH1cblxuICAgIHRoaXMuY29kZUJsb2NrcyA9IFtdXG4gICAgdGhpcy52aXNpdCgnY29kZScsIG5vZGUgPT4gdGhpcy5jb2RlQmxvY2tzLnB1c2gobm9kZSkpXG4gICAgcmV0dXJuIHRoaXMuY29kZUJsb2Nrc1xuICB9XG5cbiAgZ2V0U2VjdGlvbkhlYWRpbmdzKCl7XG4gICAgcmV0dXJuIHRoaXMuZ2V0U2VjdGlvbk5vZGVzKCkubWFwKHNlY3Rpb24gPT4gc2VjdGlvbi5oZWFkaW5nKVxuICB9XG5cbiAgZ2V0QXJ0aWNsZUhlYWRpbmdzKCl7XG4gICAgcmV0dXJuIHRoaXMuZ2V0QXJ0aWNsZU5vZGVzKCkubWFwKGFydGljbGUgPT4gYXJ0aWNsZS5oZWFkaW5nKVxuICB9XG5cbiAgZ2V0VG9wU2VjdGlvbigpIHtcbiAgICByZXR1cm4gdGhpcy5nZXRTZWN0aW9uTm9kZXMoKS5maW5kKG5vZGUgPT4gbm9kZS50b3ApXG4gIH1cblxuICBnZXRTZWN0aW9uTm9kZXMoKSB7XG4gICAgaWYodGhpcy5zZWN0aW9ucyl7IHJldHVybiB0aGlzLnNlY3Rpb25zIH1cblxuICAgIHRoaXMuc2VjdGlvbnMgPSBbXVxuICAgIHRoaXMudmlzaXQoJ3NlY3Rpb24nLCBub2RlID0+IHRoaXMuc2VjdGlvbnMucHVzaChub2RlKSlcbiAgICByZXR1cm4gdGhpcy5zZWN0aW9ucyA9IHRoaXMuc2VjdGlvbnMucmV2ZXJzZSgpXG4gIH1cblxuICBnZXRBcnRpY2xlTm9kZXMoKSB7XG4gICAgaWYodGhpcy5hcnRpY2xlcyl7IHJldHVybiB0aGlzLmFydGljbGVzIH1cblxuICAgIHRoaXMuYXJ0aWNsZXMgPSBbXVxuICAgIHRoaXMudmlzaXQoJ2FydGljbGUnLCBub2RlID0+IHRoaXMuYXJ0aWNsZXMucHVzaChub2RlKSlcbiAgICByZXR1cm4gdGhpcy5hcnRpY2xlcyA9IHRoaXMuYXJ0aWNsZXMucmV2ZXJzZSgpXG4gIH1cblxuICBnZXRDaGlsZHJlbiAoKSB7XG4gICAgcmV0dXJuIHRoaXMuYXN0LmNoaWxkcmVuWzBdLmNoaWxkcmVuICBcbiAgfVxuXG4gIGdldEhlYWRpbmdOb2RlcyAoKSB7XG4gICAgbGV0IHJlc3VsdHMgPSBbXVxuICAgIHRoaXMudmlzaXQoJ2hlYWRpbmcnLCBub2RlID0+IHJlc3VsdHMucHVzaChub2RlKSlcbiAgICByZXR1cm4gcmVzdWx0c1xuICB9XG4gIFxuICAvKipcbiAgKiBHaXZlbiBhIGNzcyBzZWxlY3RvciwgcmV0dXJuIGVhY2ggb2YgdGhlIGVsZW1lbnRzXG4gICogICB3cmFwcGVkIHdpdGggYSBjaGVlcmlvIG9iamVjdC4gXG4gICpcbiAgKiBAcGFyYW0ge3N0cmluZ30gc2VsZWN0b3IgLSBhIGNzcyBzZWxlY3RvciB0byBtYXRjaFxuICAqIEByZXR1cm4gLSBhbiB1bmRlcnNjb3JlIHdyYXBwZWQgYXJyYXkgb2YgZWxlbWVudHNcbiAgKi9cbiAgZWxlbWVudHMgKC4uLmFyZ3MpIHtcbiAgICByZXR1cm4gXyh0aGlzLiQoLi4uYXJncykubWFwKChpbmRleCxlbCk9PntcbiAgICAgIHJldHVybiBjaGVlcmlvKGVsKVxuICAgIH0pKVxuICB9XG5cbiAgcnVuSG9vayAoaWRlbnRpZmllciA9IFwiXCIsIC4uLmFyZ3MpIHtcbiAgICBsZXQgaG9vayA9IHRoaXMub3B0aW9uc1tpZGVudGlmaWVyXSB8fCB0aGlzW2lkZW50aWZpZXJdXG5cbiAgICBpZih0eXBlb2YoaG9vaykgPT09IFwiZnVuY3Rpb25cIil7XG4gICAgICBob29rLmFwcGx5KHRoaXMsIGFyZ3MpXG4gICAgfVxuICB9XG59XG4iXX0=