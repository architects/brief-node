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

    if (this.options.type) {
      this.type = this.options.type;
    }

    this.renderLog = [];

    (0, _pipelines.process)(this, this.getBriefcase());
  }

  _createClass(Document, [{
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
//# sourceMappingURL=data:application/json;base64,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O0tBQy9DOzs7V0FFVyx1QkFBRztBQUNiLGFBQU8sSUFBSSxDQUFDLEdBQUcsQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDLENBQUMsUUFBUSxDQUFBO0tBQ3JDOzs7V0FFZSwyQkFBRztBQUNqQixVQUFJLE9BQU8sR0FBRyxFQUFFLENBQUE7QUFDaEIsVUFBSSxDQUFDLEtBQUssQ0FBQyxTQUFTLEVBQUUsVUFBQSxJQUFJO2VBQUksT0FBTyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUM7T0FBQSxDQUFDLENBQUE7QUFDakQsYUFBTyxPQUFPLENBQUE7S0FDZjs7Ozs7Ozs7Ozs7V0FTUSxvQkFBVTtBQUNqQixhQUFPLDZCQUFFLElBQUksQ0FBQyxDQUFDLE1BQUEsQ0FBTixJQUFJLFlBQVcsQ0FBQyxHQUFHLENBQUMsVUFBQyxLQUFLLEVBQUMsRUFBRSxFQUFHO0FBQ3ZDLGVBQU8sMEJBQVEsRUFBRSxDQUFDLENBQUE7T0FDbkIsQ0FBQyxDQUFDLENBQUE7S0FDSjs7O1dBRU8sbUJBQTJCO1VBQTFCLFVBQVUseURBQUcsRUFBRTs7QUFDdEIsVUFBSSxJQUFJLEdBQUcsSUFBSSxDQUFDLE9BQU8sQ0FBQyxVQUFVLENBQUMsSUFBSSxJQUFJLENBQUMsVUFBVSxDQUFDLENBQUE7O0FBRXZELFVBQUcsT0FBTyxJQUFJLEFBQUMsS0FBSyxVQUFVLEVBQUM7MkNBSEosSUFBSTtBQUFKLGNBQUk7OztBQUk3QixZQUFJLENBQUMsS0FBSyxDQUFDLElBQUksRUFBRSxJQUFJLENBQUMsQ0FBQTtPQUN2QjtLQUNGOzs7U0FyTGtCLFFBQVE7OztxQkFBUixRQUFRIiwiZmlsZSI6ImRvY3VtZW50LmpzIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IGZzIGZyb20gJ2ZzJ1xuaW1wb3J0IGNoZWVyaW8gZnJvbSAnY2hlZXJpbydcbmltcG9ydCBfIGZyb20gJ3VuZGVyc2NvcmUnXG5pbXBvcnQgdmlzaXQgZnJvbSAndW5pc3QtdXRpbC12aXNpdCdcbmltcG9ydCBwYXRoIGZyb20gJ3BhdGgnXG5cbmltcG9ydCBicmllZiBmcm9tICcuL2luZGV4J1xuaW1wb3J0IE1vZGVsIGZyb20gJy4vbW9kZWwnXG5pbXBvcnQgUHJlc2VudGVyIGZyb20gXCIuL3ByZXNlbnRlclwiXG5pbXBvcnQge3Byb2Nlc3MsIHBhcnNlfSBmcm9tICcuL3BpcGVsaW5lcydcbmltcG9ydCB7Y2xvbmUsIHNpbmd1bGFyaXplfSBmcm9tICcuL3V0aWwnXG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIERvY3VtZW50IHtcbiAgdG9TdHJpbmcoKSB7XG4gICAgcmV0dXJuIHRoaXMucGF0aFxuICB9XG4gIFxuICAvKipcbiAgICogY3JlYXRlcyBhIG5ldyBpbnN0YW5jZSBvZiB0aGUgZG9jdW1lbnQgYXQgcGF0aFxuICAgKiBAcGFyYW0ge3BhdGh9IHBhdGggLSB0aGUgYWJzb2x1dGUgcGF0aCB0byB0aGUgbWFya2Rvd24gZG9jdW1lbnQuXG4gICovXG4gIGNvbnN0cnVjdG9yKHBhdGhuYW1lLCBvcHRpb25zKSB7XG4gICAgdGhpcy5vcHRpb25zID0gb3B0aW9ucyB8fCB7fVxuICAgIHRoaXMucGF0aCA9IHBhdGhuYW1lXG4gICAgdGhpcy5kaXJuYW1lID0gcGF0aC5kaXJuYW1lKHRoaXMucGF0aClcblxuICAgIGlmKHRoaXMub3B0aW9ucy50eXBlKXtcbiAgICAgIHRoaXMudHlwZSA9IHRoaXMub3B0aW9ucy50eXBlXG4gICAgfVxuICAgIFxuICAgIHRoaXMucmVuZGVyTG9nID0gW11cblxuICAgIHByb2Nlc3ModGhpcywgdGhpcy5nZXRCcmllZmNhc2UoKSlcbiAgfVxuICBcbiAgbG9nKC4uLm1lc3NhZ2VzKXtcbiAgICB0aGlzLnJlbmRlckxvZy5wdXNoKG1lc3NhZ2VzKVxuICB9XG5cbiAgdmlld0xvZygpe1xuICAgIHRoaXMucmVuZGVyTG9nLmZvckVhY2goY29uc29sZS5sb2cuYmluZChjb25zb2xlKSlcbiAgfVxuXG4gIHJlc29sdmVMaW5rKHBhdGhBbGlhcyl7XG4gICAgcmV0dXJuIHRoaXMuZ2V0QnJpZWZjYXNlKCkucmVzb2x2ZUxpbmsocGF0aEFsaWFzKVxuICB9XG5cbiAgLyoqXG4gICogcmV0dXJuIGEgcmVmZXJlbmNlIHRvIHRoZSBicmllZmNhc2UgdGhpcyBkb2N1bWVudCBiZWxvbmdzIHRvLlxuICAqL1xuICBnZXRCcmllZmNhc2UoKXtcbiAgICBpZih0aGlzLmJyaWVmY2FzZSkgeyByZXR1cm4gdGhpcy5icmllZmNhc2UgfVxuICAgIHJldHVybiB0aGlzLmJyaWVmY2FzZSA9IGJyaWVmLmZpbmRCcmllZmNhc2VCeVBhdGgodGhpcy5wYXRoKVxuICB9XG4gIC8qKlxuICAgKiBnZXQgYSBtb2RlbCB0byByZXByZXNlbnQgdGhpcyBkb2N1bWVudCBhbmQgdGhlIGRhdGEgd2UgcGFyc2UgZnJvbSBpdC5cbiAgICpcbiAgICogQHJldHVybiB7TW9kZWx9IC0gYSBtb2RlbCBpbnN0YW5jZSBcbiAgKi9cbiAgdG9Nb2RlbCAob3B0aW9ucz17fSkge1xuICAgIHJldHVybiBNb2RlbC5mcm9tRG9jdW1lbnQodGhpcywgb3B0aW9ucylcbiAgfVxuICBcbiAgd3JpdGVTeW5jKG5ld0NvbnRlbnQpe1xuICAgIG5ld0NvbnRlbnQgPSBuZXdDb250ZW50IHx8IHRoaXMuY29udGVudFxuICAgIGZzLndyaXRlRmlsZVN5bmModGhpcy5wYXRoLCBuZXdDb250ZW50KVxuICAgIHRoaXMucmVsb2FkKClcbiAgfVxuXG4gIGxhc3RNb2RpZmllZEF0KCl7XG4gICAgcmV0dXJuIGZzLmxzdGF0U3luYyh0aGlzLnBhdGgpLm10aW1lLnZhbHVlT2YoKVxuICB9XG5cbiAgLyoqXG4gICAqIHJldHVybnMgYSByZW5kZXJlZCBkb2N1bWVudFxuICAgKiBAcmV0dXJuIHtEb2N1bWVudH0gLSB0aGlzIGRvY3VtZW50XG4gICovXG4gIHJlbmRlcmVkKCkge1xuICAgIHRoaXMucmVuZGVyKClcbiAgICByZXR1cm4gdGhpc1xuICB9XG4gIFxuICAvKipcbiAgICogcmVuZGVyIHRoZSBkb2N1bWVudC5cbiAgICogQHJldHVybiB7c3RyaW5nfSAtIFJlbmRlcmVkIEhUTUwgZnJvbSB0aGUgZG9jdW1lbnQgbWFya2Rvd25cbiAgKi9cbiAgcmVuZGVyKCkge1xuICAgIHJldHVybiB0aGlzLmh0bWwgPyB0aGlzLmh0bWwgOiByZW5kZXIodGhpcykgXG4gIH1cblxuICBnZXRUeXBlKCl7XG4gICAgaWYodGhpcy5kYXRhICYmIHRoaXMuZGF0YS50eXBlKXtcbiAgICAgIHJldHVybiB0aGlzLmRhdGEudHlwZVxuICAgIH1cblxuICAgIHJldHVybiBzaW5ndWxhcml6ZShwYXRoLmJhc2VuYW1lKHRoaXMuZGlybmFtZSkpXG4gIH1cbiAgXG4gIC8qKiBcbiAgKiBhcHBseSBhIHByZXNlbnRlciB0byB0aGUgZG9jdW1lbnQuIHVzZWZ1bCBmb3IgZGVidWdnaW5nXG4gICogcHVycG9zZXMuXG4gICovXG4gIHByZXNlbnQgKG1ldGhvZCwgb3B0aW9ucz17fSkge1xuICAgIGxldCBwcmVzZW50ZXIgPSBQcmVzZW50ZXIucHJlc2VudCh0aGlzLCBvcHRpb25zKVxuICAgIHJldHVybiBwcmVzZW50ZXJbbWV0aG9kXSgpXG4gIH1cbiAgXG4gIC8qKlxuICAqIHZpc2l0IGV2ZXJ5IG5vZGUgb2YgdGhlIHBhcnNlZCBhc3RcbiAgKi9cbiAgdmlzaXQodHlwZSwgaXRlcmF0b3IpIHtcbiAgICB2aXNpdCh0aGlzLmFzdCwgdHlwZSwgaXRlcmF0b3IpXG4gIH1cblxuICBnZXRBU1QgKCkge1xuICAgIHJldHVybiB0aGlzLmFzdFxuICB9XG5cbiAgcmVsb2FkKCl7XG4gICAgZGVsZXRlKHRoaXMuYXJ0aWNsZXMpXG4gICAgZGVsZXRlKHRoaXMuc2VjdGlvbnMpXG4gICAgZGVsZXRlKHRoaXMuZGF0YSlcbiAgICBkZWxldGUodGhpcy5jb250ZW50KVxuICAgIGRlbGV0ZSh0aGlzLmNvZGVCbG9ja3MpXG5cbiAgICBwcm9jZXNzKHRoaXMsIHRoaXMuYnJpZWZjYXNlKVxuICB9XG4gIFxuICBnZXRDb2RlQmxvY2tzKCkge1xuICAgIGlmKHRoaXMuY29kZUJsb2Nrcyl7IHJldHVybiB0aGlzLmNvZGVCbG9ja3MgfVxuXG4gICAgdGhpcy5jb2RlQmxvY2tzID0gW11cbiAgICB0aGlzLnZpc2l0KCdjb2RlJywgbm9kZSA9PiB0aGlzLmNvZGVCbG9ja3MucHVzaChub2RlKSlcbiAgICByZXR1cm4gdGhpcy5jb2RlQmxvY2tzXG4gIH1cblxuICBnZXRTZWN0aW9uSGVhZGluZ3MoKXtcbiAgICByZXR1cm4gdGhpcy5nZXRTZWN0aW9uTm9kZXMoKS5tYXAoc2VjdGlvbiA9PiBzZWN0aW9uLmhlYWRpbmcpXG4gIH1cblxuICBnZXRBcnRpY2xlSGVhZGluZ3MoKXtcbiAgICByZXR1cm4gdGhpcy5nZXRBcnRpY2xlTm9kZXMoKS5tYXAoYXJ0aWNsZSA9PiBhcnRpY2xlLmhlYWRpbmcpXG4gIH1cblxuICBnZXRUb3BTZWN0aW9uKCkge1xuICAgIHJldHVybiB0aGlzLmdldFNlY3Rpb25Ob2RlcygpLmZpbmQobm9kZSA9PiBub2RlLnRvcClcbiAgfVxuXG4gIGdldFNlY3Rpb25Ob2RlcygpIHtcbiAgICBpZih0aGlzLnNlY3Rpb25zKXsgcmV0dXJuIHRoaXMuc2VjdGlvbnMgfVxuXG4gICAgdGhpcy5zZWN0aW9ucyA9IFtdXG4gICAgdGhpcy52aXNpdCgnc2VjdGlvbicsIG5vZGUgPT4gdGhpcy5zZWN0aW9ucy5wdXNoKG5vZGUpKVxuICAgIHJldHVybiB0aGlzLnNlY3Rpb25zID0gdGhpcy5zZWN0aW9ucy5yZXZlcnNlKClcbiAgfVxuXG4gIGdldEFydGljbGVOb2RlcygpIHtcbiAgICBpZih0aGlzLmFydGljbGVzKXsgcmV0dXJuIHRoaXMuYXJ0aWNsZXMgfVxuXG4gICAgdGhpcy5hcnRpY2xlcyA9IFtdXG4gICAgdGhpcy52aXNpdCgnYXJ0aWNsZScsIG5vZGUgPT4gdGhpcy5hcnRpY2xlcy5wdXNoKG5vZGUpKVxuICAgIHJldHVybiB0aGlzLmFydGljbGVzID0gdGhpcy5hcnRpY2xlcy5yZXZlcnNlKClcbiAgfVxuXG4gIGdldENoaWxkcmVuICgpIHtcbiAgICByZXR1cm4gdGhpcy5hc3QuY2hpbGRyZW5bMF0uY2hpbGRyZW4gIFxuICB9XG5cbiAgZ2V0SGVhZGluZ05vZGVzICgpIHtcbiAgICBsZXQgcmVzdWx0cyA9IFtdXG4gICAgdGhpcy52aXNpdCgnaGVhZGluZycsIG5vZGUgPT4gcmVzdWx0cy5wdXNoKG5vZGUpKVxuICAgIHJldHVybiByZXN1bHRzXG4gIH1cbiAgXG4gIC8qKlxuICAqIEdpdmVuIGEgY3NzIHNlbGVjdG9yLCByZXR1cm4gZWFjaCBvZiB0aGUgZWxlbWVudHNcbiAgKiAgIHdyYXBwZWQgd2l0aCBhIGNoZWVyaW8gb2JqZWN0LiBcbiAgKlxuICAqIEBwYXJhbSB7c3RyaW5nfSBzZWxlY3RvciAtIGEgY3NzIHNlbGVjdG9yIHRvIG1hdGNoXG4gICogQHJldHVybiAtIGFuIHVuZGVyc2NvcmUgd3JhcHBlZCBhcnJheSBvZiBlbGVtZW50c1xuICAqL1xuICBlbGVtZW50cyAoLi4uYXJncykge1xuICAgIHJldHVybiBfKHRoaXMuJCguLi5hcmdzKS5tYXAoKGluZGV4LGVsKT0+e1xuICAgICAgcmV0dXJuIGNoZWVyaW8oZWwpXG4gICAgfSkpXG4gIH1cblxuICBydW5Ib29rIChpZGVudGlmaWVyID0gXCJcIiwgLi4uYXJncykge1xuICAgIGxldCBob29rID0gdGhpcy5vcHRpb25zW2lkZW50aWZpZXJdIHx8IHRoaXNbaWRlbnRpZmllcl1cblxuICAgIGlmKHR5cGVvZihob29rKSA9PT0gXCJmdW5jdGlvblwiKXtcbiAgICAgIGhvb2suYXBwbHkodGhpcywgYXJncylcbiAgICB9XG4gIH1cbn1cbiJdfQ==