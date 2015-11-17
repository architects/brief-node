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
  }, {
    key: 'slug',
    get: function get() {
      return (0, _util.slugify)(this.options.id || this.id);
    }
  }]);

  return Document;
})();

exports['default'] = Document;
module.exports = exports['default'];
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3NyYy9kb2N1bWVudC5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7a0JBQWUsSUFBSTs7Ozt1QkFDQyxTQUFTOzs7OzBCQUNmLFlBQVk7Ozs7OEJBQ1Isa0JBQWtCOzs7O29CQUNuQixNQUFNOzs7O3FCQUVMLFNBQVM7Ozs7cUJBQ1QsU0FBUzs7Ozt5QkFDTCxhQUFhOzs7O3lCQUNJLGFBQWE7O29CQUNWLFFBQVE7O0lBRTdCLFFBQVE7ZUFBUixRQUFROztXQUNuQixvQkFBRztBQUNULGFBQU8sSUFBSSxDQUFDLElBQUksQ0FBQTtLQUNqQjs7Ozs7Ozs7QUFNVSxXQVRRLFFBQVEsQ0FTZixRQUFRLEVBQUUsT0FBTyxFQUFFOzBCQVRaLFFBQVE7O0FBVXpCLFFBQUksQ0FBQyxPQUFPLEdBQUcsT0FBTyxJQUFJLEVBQUUsQ0FBQTtBQUM1QixRQUFJLENBQUMsSUFBSSxHQUFHLFFBQVEsQ0FBQTtBQUNwQixRQUFJLENBQUMsT0FBTyxHQUFHLGtCQUFLLE9BQU8sQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUE7QUFDdEMsUUFBSSxDQUFDLEVBQUUsR0FBRyxPQUFPLENBQUMsRUFBRSxDQUFBOztBQUVwQixRQUFHLElBQUksQ0FBQyxPQUFPLENBQUMsSUFBSSxFQUFDO0FBQ25CLFVBQUksQ0FBQyxJQUFJLEdBQUcsSUFBSSxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUE7S0FDOUI7O0FBRUQsUUFBSSxDQUFDLFNBQVMsR0FBRyxFQUFFLENBQUE7O0FBRW5CLFFBQUksQ0FBQyxXQUFXLENBQUMsRUFBQyxJQUFJLEVBQUUsSUFBSSxDQUFDLElBQUksRUFBQyxDQUFDLENBQUE7QUFDbkMsNEJBQVEsSUFBSSxFQUFFLElBQUksQ0FBQyxZQUFZLEVBQUUsQ0FBQyxDQUFBO0dBQ25DOztlQXZCa0IsUUFBUTs7V0E2QmhCLHVCQUFjO1VBQWIsT0FBTyx5REFBRyxFQUFFOztBQUN0QixVQUFHLE9BQU8sQ0FBQyxPQUFPLEVBQUM7QUFBRSxlQUFPLElBQUksQ0FBQyxPQUFPLEdBQUcsT0FBTyxDQUFDLE9BQU8sQ0FBQTtPQUFFO0FBQzVELFVBQUcsT0FBTyxDQUFDLElBQUksRUFBQztBQUFFLGVBQU8sSUFBSSxDQUFDLE9BQU8sR0FBRyx5QkFBUyxPQUFPLENBQUMsSUFBSSxDQUFDLENBQUE7T0FBRTs7QUFFaEUsVUFBRyxPQUFPLENBQUMsTUFBTSxFQUFDO0FBQUUsWUFBSSxDQUFDLE1BQU0sRUFBRSxDQUFBO09BQUU7S0FDcEM7OztXQUVFLGVBQWE7d0NBQVQsUUFBUTtBQUFSLGdCQUFROzs7QUFDYixVQUFJLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsQ0FBQTtLQUM5Qjs7O1dBRU0sbUJBQUU7QUFDUCxVQUFJLENBQUMsU0FBUyxDQUFDLE9BQU8sQ0FBQyxPQUFPLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFBO0tBQ2xEOzs7V0FFVSxxQkFBQyxTQUFTLEVBQUM7QUFDcEIsYUFBTyxJQUFJLENBQUMsWUFBWSxFQUFFLENBQUMsV0FBVyxDQUFDLFNBQVMsQ0FBQyxDQUFBO0tBQ2xEOzs7Ozs7O1dBS1csd0JBQUU7QUFDWixVQUFHLElBQUksQ0FBQyxTQUFTLEVBQUU7QUFBRSxlQUFPLElBQUksQ0FBQyxTQUFTLENBQUE7T0FBRTtBQUM1QyxhQUFPLElBQUksQ0FBQyxTQUFTLEdBQUcsbUJBQU0sbUJBQW1CLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFBO0tBQzdEOzs7Ozs7Ozs7V0FNTyxtQkFBYTtVQUFaLE9BQU8seURBQUMsRUFBRTs7QUFDakIsYUFBTyxtQkFBTSxZQUFZLENBQUMsSUFBSSxFQUFFLE9BQU8sQ0FBQyxDQUFBO0tBQ3pDOzs7V0FFUSxtQkFBQyxVQUFVLEVBQUM7QUFDbkIsZ0JBQVUsR0FBRyxVQUFVLElBQUksSUFBSSxDQUFDLE9BQU8sQ0FBQTtBQUN2QyxzQkFBRyxhQUFhLENBQUMsSUFBSSxDQUFDLElBQUksRUFBRSxVQUFVLENBQUMsQ0FBQTs7QUFFdkMsVUFBSSxDQUFDLFdBQVcsQ0FBQztBQUNmLFlBQUksRUFBRSxJQUFJLENBQUMsSUFBSTtBQUNmLGNBQU0sRUFBRSxJQUFJO09BQ2IsQ0FBQyxDQUFBO0tBQ0g7OztXQUVhLDBCQUFFO0FBQ2QsYUFBTyxnQkFBRyxTQUFTLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLEtBQUssQ0FBQyxPQUFPLEVBQUUsQ0FBQTtLQUMvQzs7Ozs7Ozs7V0FNTyxvQkFBRztBQUNULFVBQUksQ0FBQyxNQUFNLEVBQUUsQ0FBQTtBQUNiLGFBQU8sSUFBSSxDQUFBO0tBQ1o7Ozs7Ozs7Ozs7Ozs7Ozs7OztPQU1LLFlBQUc7QUFDUCxhQUFPLElBQUksQ0FBQyxJQUFJLEdBQUcsSUFBSSxDQUFDLElBQUksR0FBRyxNQUFNLENBQUMsSUFBSSxDQUFDLENBQUE7S0FDNUM7OztXQUVNLG1CQUFFO0FBQ1AsVUFBRyxJQUFJLENBQUMsSUFBSSxJQUFJLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxFQUFDO0FBQzdCLGVBQU8sSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUE7T0FDdEI7O0FBRUQsYUFBTyx1QkFBWSxrQkFBSyxRQUFRLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUE7S0FDaEQ7Ozs7Ozs7O1dBTU8saUJBQUMsTUFBTSxFQUFjO1VBQVosT0FBTyx5REFBQyxFQUFFOztBQUN6QixVQUFJLFNBQVMsR0FBRyx1QkFBVSxPQUFPLENBQUMsSUFBSSxFQUFFLE9BQU8sQ0FBQyxDQUFBO0FBQ2hELGFBQU8sU0FBUyxDQUFDLE1BQU0sQ0FBQyxFQUFFLENBQUE7S0FDM0I7Ozs7Ozs7V0FLSSxlQUFDLElBQUksRUFBRSxRQUFRLEVBQUU7QUFDcEIsdUNBQU0sSUFBSSxDQUFDLEdBQUcsRUFBRSxJQUFJLEVBQUUsUUFBUSxDQUFDLENBQUE7S0FDaEM7OztXQUVNLGtCQUFHO0FBQ1IsYUFBTyxJQUFJLENBQUMsR0FBRyxDQUFBO0tBQ2hCOzs7V0FFSyxrQkFBRTtBQUNOLGFBQU8sSUFBSSxDQUFDLFFBQVEsQUFBQyxDQUFBO0FBQ3JCLGFBQU8sSUFBSSxDQUFDLFFBQVEsQUFBQyxDQUFBO0FBQ3JCLGFBQU8sSUFBSSxDQUFDLElBQUksQUFBQyxDQUFBO0FBQ2pCLGFBQU8sSUFBSSxDQUFDLFVBQVUsQUFBQyxDQUFBOztBQUV2Qiw4QkFBUSxJQUFJLEVBQUUsSUFBSSxDQUFDLFNBQVMsQ0FBQyxDQUFBO0tBQzlCOzs7V0FFWSx5QkFBRzs7O0FBQ2QsVUFBRyxJQUFJLENBQUMsVUFBVSxFQUFDO0FBQUUsZUFBTyxJQUFJLENBQUMsVUFBVSxDQUFBO09BQUU7O0FBRTdDLFVBQUksQ0FBQyxVQUFVLEdBQUcsRUFBRSxDQUFBO0FBQ3BCLFVBQUksQ0FBQyxLQUFLLENBQUMsTUFBTSxFQUFFLFVBQUEsSUFBSTtlQUFJLE1BQUssVUFBVSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUM7T0FBQSxDQUFDLENBQUE7QUFDdEQsYUFBTyxJQUFJLENBQUMsVUFBVSxDQUFBO0tBQ3ZCOzs7V0FFaUIsOEJBQUU7QUFDbEIsYUFBTyxJQUFJLENBQUMsZUFBZSxFQUFFLENBQUMsR0FBRyxDQUFDLFVBQUEsT0FBTztlQUFJLE9BQU8sQ0FBQyxPQUFPO09BQUEsQ0FBQyxDQUFBO0tBQzlEOzs7V0FFaUIsOEJBQUU7QUFDbEIsYUFBTyxJQUFJLENBQUMsZUFBZSxFQUFFLENBQUMsR0FBRyxDQUFDLFVBQUEsT0FBTztlQUFJLE9BQU8sQ0FBQyxPQUFPO09BQUEsQ0FBQyxDQUFBO0tBQzlEOzs7V0FFWSx5QkFBRztBQUNkLGFBQU8sSUFBSSxDQUFDLGVBQWUsRUFBRSxDQUFDLElBQUksQ0FBQyxVQUFBLElBQUk7ZUFBSSxJQUFJLENBQUMsR0FBRztPQUFBLENBQUMsQ0FBQTtLQUNyRDs7O1dBRWMsMkJBQUc7OztBQUNoQixVQUFHLElBQUksQ0FBQyxRQUFRLEVBQUM7QUFBRSxlQUFPLElBQUksQ0FBQyxRQUFRLENBQUE7T0FBRTs7QUFFekMsVUFBSSxDQUFDLFFBQVEsR0FBRyxFQUFFLENBQUE7QUFDbEIsVUFBSSxDQUFDLEtBQUssQ0FBQyxTQUFTLEVBQUUsVUFBQSxJQUFJO2VBQUksT0FBSyxRQUFRLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQztPQUFBLENBQUMsQ0FBQTtBQUN2RCxhQUFPLElBQUksQ0FBQyxRQUFRLEdBQUcsSUFBSSxDQUFDLFFBQVEsQ0FBQyxPQUFPLEVBQUUsQ0FBQTtLQUMvQzs7O1dBRWMsMkJBQUc7OztBQUNoQixVQUFHLElBQUksQ0FBQyxRQUFRLEVBQUM7QUFBRSxlQUFPLElBQUksQ0FBQyxRQUFRLENBQUE7T0FBRTs7QUFFekMsVUFBSSxDQUFDLFFBQVEsR0FBRyxFQUFFLENBQUE7QUFDbEIsVUFBSSxDQUFDLEtBQUssQ0FBQyxTQUFTLEVBQUUsVUFBQSxJQUFJO2VBQUksT0FBSyxRQUFRLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQztPQUFBLENBQUMsQ0FBQTtBQUN2RCxhQUFPLElBQUksQ0FBQyxRQUFRLEdBQUcsSUFBSSxDQUFDLFFBQVEsQ0FBQyxPQUFPLEVBQUUsQ0FBQTtLQUMvQzs7O1dBRVcsdUJBQUc7QUFDYixhQUFPLElBQUksQ0FBQyxHQUFHLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQyxDQUFDLFFBQVEsQ0FBQTtLQUNyQzs7O1dBRWUsMkJBQUc7QUFDakIsVUFBSSxPQUFPLEdBQUcsRUFBRSxDQUFBO0FBQ2hCLFVBQUksQ0FBQyxLQUFLLENBQUMsU0FBUyxFQUFFLFVBQUEsSUFBSTtlQUFJLE9BQU8sQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDO09BQUEsQ0FBQyxDQUFBO0FBQ2pELGFBQU8sT0FBTyxDQUFBO0tBQ2Y7Ozs7Ozs7Ozs7O1dBU1Esb0JBQVU7QUFDakIsYUFBTyw2QkFBRSxJQUFJLENBQUMsQ0FBQyxNQUFBLENBQU4sSUFBSSxZQUFXLENBQUMsR0FBRyxDQUFDLFVBQUMsS0FBSyxFQUFDLEVBQUUsRUFBRztBQUN2QyxlQUFPLDBCQUFRLEVBQUUsQ0FBQyxDQUFBO09BQ25CLENBQUMsQ0FBQyxDQUFBO0tBQ0o7OztXQUVPLG1CQUEyQjtVQUExQixVQUFVLHlEQUFHLEVBQUU7O0FBQ3RCLFVBQUksSUFBSSxHQUFHLElBQUksQ0FBQyxPQUFPLENBQUMsVUFBVSxDQUFDLElBQUksSUFBSSxDQUFDLFVBQVUsQ0FBQyxDQUFBOztBQUV2RCxVQUFHLE9BQU8sSUFBSSxBQUFDLEtBQUssVUFBVSxFQUFDOzJDQUhKLElBQUk7QUFBSixjQUFJOzs7QUFJN0IsWUFBSSxDQUFDLEtBQUssQ0FBQyxJQUFJLEVBQUUsSUFBSSxDQUFDLENBQUE7T0FDdkI7S0FDRjs7O1NBNUtPLGVBQUU7QUFDUixhQUFPLG1CQUFRLElBQUksQ0FBQyxPQUFPLENBQUMsRUFBRSxJQUFJLElBQUksQ0FBQyxFQUFFLENBQUMsQ0FBQTtLQUMzQzs7O1NBM0JrQixRQUFROzs7cUJBQVIsUUFBUSIsImZpbGUiOiJkb2N1bWVudC5qcyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCBmcyBmcm9tICdmcydcbmltcG9ydCBjaGVlcmlvIGZyb20gJ2NoZWVyaW8nXG5pbXBvcnQgXyBmcm9tICd1bmRlcnNjb3JlJ1xuaW1wb3J0IHZpc2l0IGZyb20gJ3VuaXN0LXV0aWwtdmlzaXQnXG5pbXBvcnQgcGF0aCBmcm9tICdwYXRoJ1xuXG5pbXBvcnQgYnJpZWYgZnJvbSAnLi9pbmRleCdcbmltcG9ydCBNb2RlbCBmcm9tICcuL21vZGVsJ1xuaW1wb3J0IFByZXNlbnRlciBmcm9tIFwiLi9wcmVzZW50ZXJcIlxuaW1wb3J0IHtwcm9jZXNzLCBwYXJzZSwgcmVhZFBhdGh9IGZyb20gJy4vcGlwZWxpbmVzJ1xuaW1wb3J0IHtjbG9uZSwgc2x1Z2lmeSwgc2luZ3VsYXJpemV9IGZyb20gJy4vdXRpbCdcblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgRG9jdW1lbnQge1xuICB0b1N0cmluZygpIHtcbiAgICByZXR1cm4gdGhpcy5wYXRoXG4gIH1cbiAgXG4gIC8qKlxuICAgKiBjcmVhdGVzIGEgbmV3IGluc3RhbmNlIG9mIHRoZSBkb2N1bWVudCBhdCBwYXRoXG4gICAqIEBwYXJhbSB7cGF0aH0gcGF0aCAtIHRoZSBhYnNvbHV0ZSBwYXRoIHRvIHRoZSBtYXJrZG93biBkb2N1bWVudC5cbiAgKi9cbiAgY29uc3RydWN0b3IocGF0aG5hbWUsIG9wdGlvbnMpIHtcbiAgICB0aGlzLm9wdGlvbnMgPSBvcHRpb25zIHx8IHt9XG4gICAgdGhpcy5wYXRoID0gcGF0aG5hbWVcbiAgICB0aGlzLmRpcm5hbWUgPSBwYXRoLmRpcm5hbWUodGhpcy5wYXRoKVxuICAgIHRoaXMuaWQgPSBvcHRpb25zLmlkXG5cbiAgICBpZih0aGlzLm9wdGlvbnMudHlwZSl7XG4gICAgICB0aGlzLnR5cGUgPSB0aGlzLm9wdGlvbnMudHlwZVxuICAgIH1cblxuICAgIHRoaXMucmVuZGVyTG9nID0gW11cbiAgICBcbiAgICB0aGlzLmxvYWRDb250ZW50KHtwYXRoOiB0aGlzLnBhdGh9KVxuICAgIHByb2Nlc3ModGhpcywgdGhpcy5nZXRCcmllZmNhc2UoKSlcbiAgfVxuICBcbiAgZ2V0IHNsdWcoKXtcbiAgICByZXR1cm4gc2x1Z2lmeSh0aGlzLm9wdGlvbnMuaWQgfHwgdGhpcy5pZClcbiAgfVxuXG4gIGxvYWRDb250ZW50KG9wdGlvbnMgPSB7fSl7XG4gICAgaWYob3B0aW9ucy5jb250ZW50KXsgcmV0dXJuIHRoaXMuY29udGVudCA9IG9wdGlvbnMuY29udGVudCB9XG4gICAgaWYob3B0aW9ucy5wYXRoKXsgcmV0dXJuIHRoaXMuY29udGVudCA9IHJlYWRQYXRoKG9wdGlvbnMucGF0aCkgfVxuXG4gICAgaWYob3B0aW9ucy5yZWxvYWQpeyB0aGlzLnJlbG9hZCgpIH1cbiAgfVxuICBcbiAgbG9nKC4uLm1lc3NhZ2VzKXtcbiAgICB0aGlzLnJlbmRlckxvZy5wdXNoKG1lc3NhZ2VzKVxuICB9XG5cbiAgdmlld0xvZygpe1xuICAgIHRoaXMucmVuZGVyTG9nLmZvckVhY2goY29uc29sZS5sb2cuYmluZChjb25zb2xlKSlcbiAgfVxuXG4gIHJlc29sdmVMaW5rKHBhdGhBbGlhcyl7XG4gICAgcmV0dXJuIHRoaXMuZ2V0QnJpZWZjYXNlKCkucmVzb2x2ZUxpbmsocGF0aEFsaWFzKVxuICB9XG5cbiAgLyoqXG4gICogcmV0dXJuIGEgcmVmZXJlbmNlIHRvIHRoZSBicmllZmNhc2UgdGhpcyBkb2N1bWVudCBiZWxvbmdzIHRvLlxuICAqL1xuICBnZXRCcmllZmNhc2UoKXtcbiAgICBpZih0aGlzLmJyaWVmY2FzZSkgeyByZXR1cm4gdGhpcy5icmllZmNhc2UgfVxuICAgIHJldHVybiB0aGlzLmJyaWVmY2FzZSA9IGJyaWVmLmZpbmRCcmllZmNhc2VCeVBhdGgodGhpcy5wYXRoKVxuICB9XG4gIC8qKlxuICAgKiBnZXQgYSBtb2RlbCB0byByZXByZXNlbnQgdGhpcyBkb2N1bWVudCBhbmQgdGhlIGRhdGEgd2UgcGFyc2UgZnJvbSBpdC5cbiAgICpcbiAgICogQHJldHVybiB7TW9kZWx9IC0gYSBtb2RlbCBpbnN0YW5jZSBcbiAgKi9cbiAgdG9Nb2RlbCAob3B0aW9ucz17fSkge1xuICAgIHJldHVybiBNb2RlbC5mcm9tRG9jdW1lbnQodGhpcywgb3B0aW9ucylcbiAgfVxuICBcbiAgd3JpdGVTeW5jKG5ld0NvbnRlbnQpe1xuICAgIG5ld0NvbnRlbnQgPSBuZXdDb250ZW50IHx8IHRoaXMuY29udGVudFxuICAgIGZzLndyaXRlRmlsZVN5bmModGhpcy5wYXRoLCBuZXdDb250ZW50KVxuXG4gICAgdGhpcy5sb2FkQ29udGVudCh7XG4gICAgICBwYXRoOiB0aGlzLnBhdGgsXG4gICAgICByZWxvYWQ6IHRydWVcbiAgICB9KVxuICB9XG5cbiAgbGFzdE1vZGlmaWVkQXQoKXtcbiAgICByZXR1cm4gZnMubHN0YXRTeW5jKHRoaXMucGF0aCkubXRpbWUudmFsdWVPZigpXG4gIH1cblxuICAvKipcbiAgICogcmV0dXJucyBhIHJlbmRlcmVkIGRvY3VtZW50XG4gICAqIEByZXR1cm4ge0RvY3VtZW50fSAtIHRoaXMgZG9jdW1lbnRcbiAgKi9cbiAgcmVuZGVyZWQoKSB7XG4gICAgdGhpcy5yZW5kZXIoKVxuICAgIHJldHVybiB0aGlzXG4gIH1cbiAgXG4gIC8qKlxuICAgKiByZW5kZXIgdGhlIGRvY3VtZW50LlxuICAgKiBAcmV0dXJuIHtzdHJpbmd9IC0gUmVuZGVyZWQgSFRNTCBmcm9tIHRoZSBkb2N1bWVudCBtYXJrZG93blxuICAqL1xuICByZW5kZXIoKSB7XG4gICAgcmV0dXJuIHRoaXMuaHRtbCA/IHRoaXMuaHRtbCA6IHJlbmRlcih0aGlzKSBcbiAgfVxuXG4gIGdldFR5cGUoKXtcbiAgICBpZih0aGlzLmRhdGEgJiYgdGhpcy5kYXRhLnR5cGUpe1xuICAgICAgcmV0dXJuIHRoaXMuZGF0YS50eXBlXG4gICAgfVxuXG4gICAgcmV0dXJuIHNpbmd1bGFyaXplKHBhdGguYmFzZW5hbWUodGhpcy5kaXJuYW1lKSlcbiAgfVxuICBcbiAgLyoqIFxuICAqIGFwcGx5IGEgcHJlc2VudGVyIHRvIHRoZSBkb2N1bWVudC4gdXNlZnVsIGZvciBkZWJ1Z2dpbmdcbiAgKiBwdXJwb3Nlcy5cbiAgKi9cbiAgcHJlc2VudCAobWV0aG9kLCBvcHRpb25zPXt9KSB7XG4gICAgbGV0IHByZXNlbnRlciA9IFByZXNlbnRlci5wcmVzZW50KHRoaXMsIG9wdGlvbnMpXG4gICAgcmV0dXJuIHByZXNlbnRlclttZXRob2RdKClcbiAgfVxuICBcbiAgLyoqXG4gICogdmlzaXQgZXZlcnkgbm9kZSBvZiB0aGUgcGFyc2VkIGFzdFxuICAqL1xuICB2aXNpdCh0eXBlLCBpdGVyYXRvcikge1xuICAgIHZpc2l0KHRoaXMuYXN0LCB0eXBlLCBpdGVyYXRvcilcbiAgfVxuXG4gIGdldEFTVCAoKSB7XG4gICAgcmV0dXJuIHRoaXMuYXN0XG4gIH1cblxuICByZWxvYWQoKXtcbiAgICBkZWxldGUodGhpcy5hcnRpY2xlcylcbiAgICBkZWxldGUodGhpcy5zZWN0aW9ucylcbiAgICBkZWxldGUodGhpcy5kYXRhKVxuICAgIGRlbGV0ZSh0aGlzLmNvZGVCbG9ja3MpXG5cbiAgICBwcm9jZXNzKHRoaXMsIHRoaXMuYnJpZWZjYXNlKVxuICB9XG4gIFxuICBnZXRDb2RlQmxvY2tzKCkge1xuICAgIGlmKHRoaXMuY29kZUJsb2Nrcyl7IHJldHVybiB0aGlzLmNvZGVCbG9ja3MgfVxuXG4gICAgdGhpcy5jb2RlQmxvY2tzID0gW11cbiAgICB0aGlzLnZpc2l0KCdjb2RlJywgbm9kZSA9PiB0aGlzLmNvZGVCbG9ja3MucHVzaChub2RlKSlcbiAgICByZXR1cm4gdGhpcy5jb2RlQmxvY2tzXG4gIH1cblxuICBnZXRTZWN0aW9uSGVhZGluZ3MoKXtcbiAgICByZXR1cm4gdGhpcy5nZXRTZWN0aW9uTm9kZXMoKS5tYXAoc2VjdGlvbiA9PiBzZWN0aW9uLmhlYWRpbmcpXG4gIH1cblxuICBnZXRBcnRpY2xlSGVhZGluZ3MoKXtcbiAgICByZXR1cm4gdGhpcy5nZXRBcnRpY2xlTm9kZXMoKS5tYXAoYXJ0aWNsZSA9PiBhcnRpY2xlLmhlYWRpbmcpXG4gIH1cblxuICBnZXRUb3BTZWN0aW9uKCkge1xuICAgIHJldHVybiB0aGlzLmdldFNlY3Rpb25Ob2RlcygpLmZpbmQobm9kZSA9PiBub2RlLnRvcClcbiAgfVxuXG4gIGdldFNlY3Rpb25Ob2RlcygpIHtcbiAgICBpZih0aGlzLnNlY3Rpb25zKXsgcmV0dXJuIHRoaXMuc2VjdGlvbnMgfVxuXG4gICAgdGhpcy5zZWN0aW9ucyA9IFtdXG4gICAgdGhpcy52aXNpdCgnc2VjdGlvbicsIG5vZGUgPT4gdGhpcy5zZWN0aW9ucy5wdXNoKG5vZGUpKVxuICAgIHJldHVybiB0aGlzLnNlY3Rpb25zID0gdGhpcy5zZWN0aW9ucy5yZXZlcnNlKClcbiAgfVxuXG4gIGdldEFydGljbGVOb2RlcygpIHtcbiAgICBpZih0aGlzLmFydGljbGVzKXsgcmV0dXJuIHRoaXMuYXJ0aWNsZXMgfVxuXG4gICAgdGhpcy5hcnRpY2xlcyA9IFtdXG4gICAgdGhpcy52aXNpdCgnYXJ0aWNsZScsIG5vZGUgPT4gdGhpcy5hcnRpY2xlcy5wdXNoKG5vZGUpKVxuICAgIHJldHVybiB0aGlzLmFydGljbGVzID0gdGhpcy5hcnRpY2xlcy5yZXZlcnNlKClcbiAgfVxuXG4gIGdldENoaWxkcmVuICgpIHtcbiAgICByZXR1cm4gdGhpcy5hc3QuY2hpbGRyZW5bMF0uY2hpbGRyZW4gIFxuICB9XG5cbiAgZ2V0SGVhZGluZ05vZGVzICgpIHtcbiAgICBsZXQgcmVzdWx0cyA9IFtdXG4gICAgdGhpcy52aXNpdCgnaGVhZGluZycsIG5vZGUgPT4gcmVzdWx0cy5wdXNoKG5vZGUpKVxuICAgIHJldHVybiByZXN1bHRzXG4gIH1cbiAgXG4gIC8qKlxuICAqIEdpdmVuIGEgY3NzIHNlbGVjdG9yLCByZXR1cm4gZWFjaCBvZiB0aGUgZWxlbWVudHNcbiAgKiAgIHdyYXBwZWQgd2l0aCBhIGNoZWVyaW8gb2JqZWN0LiBcbiAgKlxuICAqIEBwYXJhbSB7c3RyaW5nfSBzZWxlY3RvciAtIGEgY3NzIHNlbGVjdG9yIHRvIG1hdGNoXG4gICogQHJldHVybiAtIGFuIHVuZGVyc2NvcmUgd3JhcHBlZCBhcnJheSBvZiBlbGVtZW50c1xuICAqL1xuICBlbGVtZW50cyAoLi4uYXJncykge1xuICAgIHJldHVybiBfKHRoaXMuJCguLi5hcmdzKS5tYXAoKGluZGV4LGVsKT0+e1xuICAgICAgcmV0dXJuIGNoZWVyaW8oZWwpXG4gICAgfSkpXG4gIH1cblxuICBydW5Ib29rIChpZGVudGlmaWVyID0gXCJcIiwgLi4uYXJncykge1xuICAgIGxldCBob29rID0gdGhpcy5vcHRpb25zW2lkZW50aWZpZXJdIHx8IHRoaXNbaWRlbnRpZmllcl1cblxuICAgIGlmKHR5cGVvZihob29rKSA9PT0gXCJmdW5jdGlvblwiKXtcbiAgICAgIGhvb2suYXBwbHkodGhpcywgYXJncylcbiAgICB9XG4gIH1cbn1cbiJdfQ==