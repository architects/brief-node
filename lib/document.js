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

      if (options.path) {
        this.content = (0, _pipelines.readPath)(options.path);
      }
      if (options.content) {
        this.content = options.content;
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

      this.briefcase.log("info", {
        document_path: this.path,
        messages: messages
      });
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3NyYy9kb2N1bWVudC5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7a0JBQWUsSUFBSTs7Ozt1QkFDQyxTQUFTOzs7OzBCQUNmLFlBQVk7Ozs7OEJBQ1Isa0JBQWtCOzs7O29CQUNuQixNQUFNOzs7O3FCQUVMLFNBQVM7Ozs7cUJBQ1QsU0FBUzs7Ozt5QkFDTCxhQUFhOzs7O3lCQUNJLGFBQWE7O29CQUNWLFFBQVE7O0lBRTdCLFFBQVE7ZUFBUixRQUFROztXQUNuQixvQkFBRztBQUNULGFBQU8sSUFBSSxDQUFDLElBQUksQ0FBQTtLQUNqQjs7Ozs7Ozs7QUFNVSxXQVRRLFFBQVEsQ0FTZixRQUFRLEVBQUUsT0FBTyxFQUFFOzBCQVRaLFFBQVE7O0FBVXpCLFFBQUksQ0FBQyxPQUFPLEdBQUcsT0FBTyxJQUFJLEVBQUUsQ0FBQTtBQUM1QixRQUFJLENBQUMsSUFBSSxHQUFHLFFBQVEsQ0FBQTtBQUNwQixRQUFJLENBQUMsT0FBTyxHQUFHLGtCQUFLLE9BQU8sQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUE7QUFDdEMsUUFBSSxDQUFDLEVBQUUsR0FBRyxPQUFPLENBQUMsRUFBRSxDQUFBOztBQUVwQixRQUFHLElBQUksQ0FBQyxPQUFPLENBQUMsSUFBSSxFQUFDO0FBQ25CLFVBQUksQ0FBQyxJQUFJLEdBQUcsSUFBSSxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUE7S0FDOUI7O0FBRUQsUUFBSSxDQUFDLFNBQVMsR0FBRyxFQUFFLENBQUE7O0FBRW5CLFFBQUksQ0FBQyxXQUFXLENBQUMsRUFBQyxJQUFJLEVBQUUsSUFBSSxDQUFDLElBQUksRUFBQyxDQUFDLENBQUE7QUFDbkMsNEJBQVEsSUFBSSxFQUFFLElBQUksQ0FBQyxZQUFZLEVBQUUsQ0FBQyxDQUFBO0dBQ25DOztlQXZCa0IsUUFBUTs7V0E2QmhCLHVCQUFjO1VBQWIsT0FBTyx5REFBRyxFQUFFOztBQUN0QixVQUFHLE9BQU8sQ0FBQyxJQUFJLEVBQUM7QUFBRSxZQUFJLENBQUMsT0FBTyxHQUFHLHlCQUFTLE9BQU8sQ0FBQyxJQUFJLENBQUMsQ0FBQTtPQUFFO0FBQ3pELFVBQUcsT0FBTyxDQUFDLE9BQU8sRUFBQztBQUFFLFlBQUksQ0FBQyxPQUFPLEdBQUcsT0FBTyxDQUFDLE9BQU8sQ0FBQTtPQUFFO0FBQ3JELFVBQUcsT0FBTyxDQUFDLE1BQU0sRUFBQztBQUFFLFlBQUksQ0FBQyxNQUFNLEVBQUUsQ0FBQTtPQUFFO0tBQ3BDOzs7V0FFRSxlQUFhO3dDQUFULFFBQVE7QUFBUixnQkFBUTs7O0FBQ2IsVUFBSSxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLENBQUE7O0FBRTdCLFVBQUksQ0FBQyxTQUFTLENBQUMsR0FBRyxDQUFDLE1BQU0sRUFBRTtBQUN6QixxQkFBYSxFQUFFLElBQUksQ0FBQyxJQUFJO0FBQ3hCLGdCQUFRLEVBQUUsUUFBUTtPQUNuQixDQUFDLENBQUE7S0FDSDs7O1dBRU0sbUJBQUU7QUFDUCxVQUFJLENBQUMsU0FBUyxDQUFDLE9BQU8sQ0FBQyxPQUFPLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFBO0tBQ2xEOzs7V0FFVSxxQkFBQyxTQUFTLEVBQUM7QUFDcEIsYUFBTyxJQUFJLENBQUMsWUFBWSxFQUFFLENBQUMsV0FBVyxDQUFDLFNBQVMsQ0FBQyxDQUFBO0tBQ2xEOzs7Ozs7O1dBS1csd0JBQUU7QUFDWixVQUFHLElBQUksQ0FBQyxTQUFTLEVBQUU7QUFBRSxlQUFPLElBQUksQ0FBQyxTQUFTLENBQUE7T0FBRTtBQUM1QyxhQUFPLElBQUksQ0FBQyxTQUFTLEdBQUcsbUJBQU0sbUJBQW1CLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFBO0tBQzdEOzs7Ozs7Ozs7V0FNTyxtQkFBYTtVQUFaLE9BQU8seURBQUMsRUFBRTs7QUFDakIsYUFBTyxtQkFBTSxZQUFZLENBQUMsSUFBSSxFQUFFLE9BQU8sQ0FBQyxDQUFBO0tBQ3pDOzs7V0FFUSxtQkFBQyxVQUFVLEVBQUM7QUFDbkIsZ0JBQVUsR0FBRyxVQUFVLElBQUksSUFBSSxDQUFDLE9BQU8sQ0FBQTtBQUN2QyxzQkFBRyxhQUFhLENBQUMsSUFBSSxDQUFDLElBQUksRUFBRSxVQUFVLENBQUMsQ0FBQTs7QUFFdkMsVUFBSSxDQUFDLFdBQVcsQ0FBQztBQUNmLFlBQUksRUFBRSxJQUFJLENBQUMsSUFBSTtBQUNmLGNBQU0sRUFBRSxJQUFJO09BQ2IsQ0FBQyxDQUFBO0tBQ0g7OztXQUVhLDBCQUFFO0FBQ2QsYUFBTyxnQkFBRyxTQUFTLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLEtBQUssQ0FBQyxPQUFPLEVBQUUsQ0FBQTtLQUMvQzs7Ozs7Ozs7V0FNTyxvQkFBRztBQUNULFVBQUksQ0FBQyxNQUFNLEVBQUUsQ0FBQTtBQUNiLGFBQU8sSUFBSSxDQUFBO0tBQ1o7Ozs7Ozs7Ozs7Ozs7Ozs7OztPQU1LLFlBQUc7QUFDUCxhQUFPLElBQUksQ0FBQyxJQUFJLEdBQUcsSUFBSSxDQUFDLElBQUksR0FBRyxNQUFNLENBQUMsSUFBSSxDQUFDLENBQUE7S0FDNUM7OztXQUVNLG1CQUFFO0FBQ1AsVUFBRyxJQUFJLENBQUMsSUFBSSxJQUFJLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxFQUFDO0FBQzdCLGVBQU8sSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUE7T0FDdEI7O0FBRUQsYUFBTyx1QkFBWSxrQkFBSyxRQUFRLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUE7S0FDaEQ7Ozs7Ozs7O1dBTU8saUJBQUMsTUFBTSxFQUFjO1VBQVosT0FBTyx5REFBQyxFQUFFOztBQUN6QixVQUFJLFNBQVMsR0FBRyx1QkFBVSxPQUFPLENBQUMsSUFBSSxFQUFFLE9BQU8sQ0FBQyxDQUFBO0FBQ2hELGFBQU8sU0FBUyxDQUFDLE1BQU0sQ0FBQyxFQUFFLENBQUE7S0FDM0I7Ozs7Ozs7V0FLSSxlQUFDLElBQUksRUFBRSxRQUFRLEVBQUU7QUFDcEIsdUNBQU0sSUFBSSxDQUFDLEdBQUcsRUFBRSxJQUFJLEVBQUUsUUFBUSxDQUFDLENBQUE7S0FDaEM7OztXQUVNLGtCQUFHO0FBQ1IsYUFBTyxJQUFJLENBQUMsR0FBRyxDQUFBO0tBQ2hCOzs7V0FFSyxrQkFBRTtBQUNOLGFBQU8sSUFBSSxDQUFDLFFBQVEsQUFBQyxDQUFBO0FBQ3JCLGFBQU8sSUFBSSxDQUFDLFFBQVEsQUFBQyxDQUFBO0FBQ3JCLGFBQU8sSUFBSSxDQUFDLElBQUksQUFBQyxDQUFBO0FBQ2pCLGFBQU8sSUFBSSxDQUFDLFVBQVUsQUFBQyxDQUFBOztBQUV2Qiw4QkFBUSxJQUFJLEVBQUUsSUFBSSxDQUFDLFNBQVMsQ0FBQyxDQUFBO0tBQzlCOzs7V0FFWSx5QkFBRzs7O0FBQ2QsVUFBRyxJQUFJLENBQUMsVUFBVSxFQUFDO0FBQUUsZUFBTyxJQUFJLENBQUMsVUFBVSxDQUFBO09BQUU7O0FBRTdDLFVBQUksQ0FBQyxVQUFVLEdBQUcsRUFBRSxDQUFBO0FBQ3BCLFVBQUksQ0FBQyxLQUFLLENBQUMsTUFBTSxFQUFFLFVBQUEsSUFBSTtlQUFJLE1BQUssVUFBVSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUM7T0FBQSxDQUFDLENBQUE7QUFDdEQsYUFBTyxJQUFJLENBQUMsVUFBVSxDQUFBO0tBQ3ZCOzs7V0FFaUIsOEJBQUU7QUFDbEIsYUFBTyxJQUFJLENBQUMsZUFBZSxFQUFFLENBQUMsR0FBRyxDQUFDLFVBQUEsT0FBTztlQUFJLE9BQU8sQ0FBQyxPQUFPO09BQUEsQ0FBQyxDQUFBO0tBQzlEOzs7V0FFaUIsOEJBQUU7QUFDbEIsYUFBTyxJQUFJLENBQUMsZUFBZSxFQUFFLENBQUMsR0FBRyxDQUFDLFVBQUEsT0FBTztlQUFJLE9BQU8sQ0FBQyxPQUFPO09BQUEsQ0FBQyxDQUFBO0tBQzlEOzs7V0FFWSx5QkFBRztBQUNkLGFBQU8sSUFBSSxDQUFDLGVBQWUsRUFBRSxDQUFDLElBQUksQ0FBQyxVQUFBLElBQUk7ZUFBSSxJQUFJLENBQUMsR0FBRztPQUFBLENBQUMsQ0FBQTtLQUNyRDs7O1dBRWMsMkJBQUc7OztBQUNoQixVQUFHLElBQUksQ0FBQyxRQUFRLEVBQUM7QUFBRSxlQUFPLElBQUksQ0FBQyxRQUFRLENBQUE7T0FBRTs7QUFFekMsVUFBSSxDQUFDLFFBQVEsR0FBRyxFQUFFLENBQUE7QUFDbEIsVUFBSSxDQUFDLEtBQUssQ0FBQyxTQUFTLEVBQUUsVUFBQSxJQUFJO2VBQUksT0FBSyxRQUFRLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQztPQUFBLENBQUMsQ0FBQTtBQUN2RCxhQUFPLElBQUksQ0FBQyxRQUFRLEdBQUcsSUFBSSxDQUFDLFFBQVEsQ0FBQyxPQUFPLEVBQUUsQ0FBQTtLQUMvQzs7O1dBRWMsMkJBQUc7OztBQUNoQixVQUFHLElBQUksQ0FBQyxRQUFRLEVBQUM7QUFBRSxlQUFPLElBQUksQ0FBQyxRQUFRLENBQUE7T0FBRTs7QUFFekMsVUFBSSxDQUFDLFFBQVEsR0FBRyxFQUFFLENBQUE7QUFDbEIsVUFBSSxDQUFDLEtBQUssQ0FBQyxTQUFTLEVBQUUsVUFBQSxJQUFJO2VBQUksT0FBSyxRQUFRLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQztPQUFBLENBQUMsQ0FBQTtBQUN2RCxhQUFPLElBQUksQ0FBQyxRQUFRLEdBQUcsSUFBSSxDQUFDLFFBQVEsQ0FBQyxPQUFPLEVBQUUsQ0FBQTtLQUMvQzs7O1dBRVcsdUJBQUc7QUFDYixhQUFPLElBQUksQ0FBQyxHQUFHLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQyxDQUFDLFFBQVEsQ0FBQTtLQUNyQzs7O1dBRWUsMkJBQUc7QUFDakIsVUFBSSxPQUFPLEdBQUcsRUFBRSxDQUFBO0FBQ2hCLFVBQUksQ0FBQyxLQUFLLENBQUMsU0FBUyxFQUFFLFVBQUEsSUFBSTtlQUFJLE9BQU8sQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDO09BQUEsQ0FBQyxDQUFBO0FBQ2pELGFBQU8sT0FBTyxDQUFBO0tBQ2Y7Ozs7Ozs7Ozs7O1dBU1Esb0JBQVU7QUFDakIsYUFBTyw2QkFBRSxJQUFJLENBQUMsQ0FBQyxNQUFBLENBQU4sSUFBSSxZQUFXLENBQUMsR0FBRyxDQUFDLFVBQUMsS0FBSyxFQUFDLEVBQUUsRUFBRztBQUN2QyxlQUFPLDBCQUFRLEVBQUUsQ0FBQyxDQUFBO09BQ25CLENBQUMsQ0FBQyxDQUFBO0tBQ0o7OztXQUVPLG1CQUEyQjtVQUExQixVQUFVLHlEQUFHLEVBQUU7O0FBQ3RCLFVBQUksSUFBSSxHQUFHLElBQUksQ0FBQyxPQUFPLENBQUMsVUFBVSxDQUFDLElBQUksSUFBSSxDQUFDLFVBQVUsQ0FBQyxDQUFBOztBQUV2RCxVQUFHLE9BQU8sSUFBSSxBQUFDLEtBQUssVUFBVSxFQUFDOzJDQUhKLElBQUk7QUFBSixjQUFJOzs7QUFJN0IsWUFBSSxDQUFDLEtBQUssQ0FBQyxJQUFJLEVBQUUsSUFBSSxDQUFDLENBQUE7T0FDdkI7S0FDRjs7O1NBaExPLGVBQUU7QUFDUixhQUFPLG1CQUFRLElBQUksQ0FBQyxPQUFPLENBQUMsRUFBRSxJQUFJLElBQUksQ0FBQyxFQUFFLENBQUMsQ0FBQTtLQUMzQzs7O1NBM0JrQixRQUFROzs7cUJBQVIsUUFBUSIsImZpbGUiOiJkb2N1bWVudC5qcyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCBmcyBmcm9tICdmcydcbmltcG9ydCBjaGVlcmlvIGZyb20gJ2NoZWVyaW8nXG5pbXBvcnQgXyBmcm9tICd1bmRlcnNjb3JlJ1xuaW1wb3J0IHZpc2l0IGZyb20gJ3VuaXN0LXV0aWwtdmlzaXQnXG5pbXBvcnQgcGF0aCBmcm9tICdwYXRoJ1xuXG5pbXBvcnQgYnJpZWYgZnJvbSAnLi9pbmRleCdcbmltcG9ydCBNb2RlbCBmcm9tICcuL21vZGVsJ1xuaW1wb3J0IFByZXNlbnRlciBmcm9tIFwiLi9wcmVzZW50ZXJcIlxuaW1wb3J0IHtwcm9jZXNzLCBwYXJzZSwgcmVhZFBhdGh9IGZyb20gJy4vcGlwZWxpbmVzJ1xuaW1wb3J0IHtjbG9uZSwgc2x1Z2lmeSwgc2luZ3VsYXJpemV9IGZyb20gJy4vdXRpbCdcblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgRG9jdW1lbnQge1xuICB0b1N0cmluZygpIHtcbiAgICByZXR1cm4gdGhpcy5wYXRoXG4gIH1cbiAgXG4gIC8qKlxuICAgKiBjcmVhdGVzIGEgbmV3IGluc3RhbmNlIG9mIHRoZSBkb2N1bWVudCBhdCBwYXRoXG4gICAqIEBwYXJhbSB7cGF0aH0gcGF0aCAtIHRoZSBhYnNvbHV0ZSBwYXRoIHRvIHRoZSBtYXJrZG93biBkb2N1bWVudC5cbiAgKi9cbiAgY29uc3RydWN0b3IocGF0aG5hbWUsIG9wdGlvbnMpIHtcbiAgICB0aGlzLm9wdGlvbnMgPSBvcHRpb25zIHx8IHt9XG4gICAgdGhpcy5wYXRoID0gcGF0aG5hbWVcbiAgICB0aGlzLmRpcm5hbWUgPSBwYXRoLmRpcm5hbWUodGhpcy5wYXRoKVxuICAgIHRoaXMuaWQgPSBvcHRpb25zLmlkXG5cbiAgICBpZih0aGlzLm9wdGlvbnMudHlwZSl7XG4gICAgICB0aGlzLnR5cGUgPSB0aGlzLm9wdGlvbnMudHlwZVxuICAgIH1cblxuICAgIHRoaXMucmVuZGVyTG9nID0gW11cbiAgICBcbiAgICB0aGlzLmxvYWRDb250ZW50KHtwYXRoOiB0aGlzLnBhdGh9KVxuICAgIHByb2Nlc3ModGhpcywgdGhpcy5nZXRCcmllZmNhc2UoKSlcbiAgfVxuICBcbiAgZ2V0IHNsdWcoKXtcbiAgICByZXR1cm4gc2x1Z2lmeSh0aGlzLm9wdGlvbnMuaWQgfHwgdGhpcy5pZClcbiAgfVxuXG4gIGxvYWRDb250ZW50KG9wdGlvbnMgPSB7fSl7XG4gICAgaWYob3B0aW9ucy5wYXRoKXsgdGhpcy5jb250ZW50ID0gcmVhZFBhdGgob3B0aW9ucy5wYXRoKSB9XG4gICAgaWYob3B0aW9ucy5jb250ZW50KXsgdGhpcy5jb250ZW50ID0gb3B0aW9ucy5jb250ZW50IH1cbiAgICBpZihvcHRpb25zLnJlbG9hZCl7IHRoaXMucmVsb2FkKCkgfVxuICB9XG4gIFxuICBsb2coLi4ubWVzc2FnZXMpe1xuICAgIHRoaXMucmVuZGVyTG9nLnB1c2gobWVzc2FnZXMpXG5cbiAgICB0aGlzLmJyaWVmY2FzZS5sb2coXCJpbmZvXCIsIHtcbiAgICAgIGRvY3VtZW50X3BhdGg6IHRoaXMucGF0aCxcbiAgICAgIG1lc3NhZ2VzOiBtZXNzYWdlc1xuICAgIH0pXG4gIH1cblxuICB2aWV3TG9nKCl7XG4gICAgdGhpcy5yZW5kZXJMb2cuZm9yRWFjaChjb25zb2xlLmxvZy5iaW5kKGNvbnNvbGUpKVxuICB9XG5cbiAgcmVzb2x2ZUxpbmsocGF0aEFsaWFzKXtcbiAgICByZXR1cm4gdGhpcy5nZXRCcmllZmNhc2UoKS5yZXNvbHZlTGluayhwYXRoQWxpYXMpXG4gIH1cblxuICAvKipcbiAgKiByZXR1cm4gYSByZWZlcmVuY2UgdG8gdGhlIGJyaWVmY2FzZSB0aGlzIGRvY3VtZW50IGJlbG9uZ3MgdG8uXG4gICovXG4gIGdldEJyaWVmY2FzZSgpe1xuICAgIGlmKHRoaXMuYnJpZWZjYXNlKSB7IHJldHVybiB0aGlzLmJyaWVmY2FzZSB9XG4gICAgcmV0dXJuIHRoaXMuYnJpZWZjYXNlID0gYnJpZWYuZmluZEJyaWVmY2FzZUJ5UGF0aCh0aGlzLnBhdGgpXG4gIH1cbiAgLyoqXG4gICAqIGdldCBhIG1vZGVsIHRvIHJlcHJlc2VudCB0aGlzIGRvY3VtZW50IGFuZCB0aGUgZGF0YSB3ZSBwYXJzZSBmcm9tIGl0LlxuICAgKlxuICAgKiBAcmV0dXJuIHtNb2RlbH0gLSBhIG1vZGVsIGluc3RhbmNlIFxuICAqL1xuICB0b01vZGVsIChvcHRpb25zPXt9KSB7XG4gICAgcmV0dXJuIE1vZGVsLmZyb21Eb2N1bWVudCh0aGlzLCBvcHRpb25zKVxuICB9XG4gIFxuICB3cml0ZVN5bmMobmV3Q29udGVudCl7XG4gICAgbmV3Q29udGVudCA9IG5ld0NvbnRlbnQgfHwgdGhpcy5jb250ZW50XG4gICAgZnMud3JpdGVGaWxlU3luYyh0aGlzLnBhdGgsIG5ld0NvbnRlbnQpXG5cbiAgICB0aGlzLmxvYWRDb250ZW50KHtcbiAgICAgIHBhdGg6IHRoaXMucGF0aCxcbiAgICAgIHJlbG9hZDogdHJ1ZVxuICAgIH0pXG4gIH1cblxuICBsYXN0TW9kaWZpZWRBdCgpe1xuICAgIHJldHVybiBmcy5sc3RhdFN5bmModGhpcy5wYXRoKS5tdGltZS52YWx1ZU9mKClcbiAgfVxuXG4gIC8qKlxuICAgKiByZXR1cm5zIGEgcmVuZGVyZWQgZG9jdW1lbnRcbiAgICogQHJldHVybiB7RG9jdW1lbnR9IC0gdGhpcyBkb2N1bWVudFxuICAqL1xuICByZW5kZXJlZCgpIHtcbiAgICB0aGlzLnJlbmRlcigpXG4gICAgcmV0dXJuIHRoaXNcbiAgfVxuICBcbiAgLyoqXG4gICAqIHJlbmRlciB0aGUgZG9jdW1lbnQuXG4gICAqIEByZXR1cm4ge3N0cmluZ30gLSBSZW5kZXJlZCBIVE1MIGZyb20gdGhlIGRvY3VtZW50IG1hcmtkb3duXG4gICovXG4gIHJlbmRlcigpIHtcbiAgICByZXR1cm4gdGhpcy5odG1sID8gdGhpcy5odG1sIDogcmVuZGVyKHRoaXMpIFxuICB9XG5cbiAgZ2V0VHlwZSgpe1xuICAgIGlmKHRoaXMuZGF0YSAmJiB0aGlzLmRhdGEudHlwZSl7XG4gICAgICByZXR1cm4gdGhpcy5kYXRhLnR5cGVcbiAgICB9XG5cbiAgICByZXR1cm4gc2luZ3VsYXJpemUocGF0aC5iYXNlbmFtZSh0aGlzLmRpcm5hbWUpKVxuICB9XG4gIFxuICAvKiogXG4gICogYXBwbHkgYSBwcmVzZW50ZXIgdG8gdGhlIGRvY3VtZW50LiB1c2VmdWwgZm9yIGRlYnVnZ2luZ1xuICAqIHB1cnBvc2VzLlxuICAqL1xuICBwcmVzZW50IChtZXRob2QsIG9wdGlvbnM9e30pIHtcbiAgICBsZXQgcHJlc2VudGVyID0gUHJlc2VudGVyLnByZXNlbnQodGhpcywgb3B0aW9ucylcbiAgICByZXR1cm4gcHJlc2VudGVyW21ldGhvZF0oKVxuICB9XG4gIFxuICAvKipcbiAgKiB2aXNpdCBldmVyeSBub2RlIG9mIHRoZSBwYXJzZWQgYXN0XG4gICovXG4gIHZpc2l0KHR5cGUsIGl0ZXJhdG9yKSB7XG4gICAgdmlzaXQodGhpcy5hc3QsIHR5cGUsIGl0ZXJhdG9yKVxuICB9XG5cbiAgZ2V0QVNUICgpIHtcbiAgICByZXR1cm4gdGhpcy5hc3RcbiAgfVxuXG4gIHJlbG9hZCgpe1xuICAgIGRlbGV0ZSh0aGlzLmFydGljbGVzKVxuICAgIGRlbGV0ZSh0aGlzLnNlY3Rpb25zKVxuICAgIGRlbGV0ZSh0aGlzLmRhdGEpXG4gICAgZGVsZXRlKHRoaXMuY29kZUJsb2NrcylcblxuICAgIHByb2Nlc3ModGhpcywgdGhpcy5icmllZmNhc2UpXG4gIH1cbiAgXG4gIGdldENvZGVCbG9ja3MoKSB7XG4gICAgaWYodGhpcy5jb2RlQmxvY2tzKXsgcmV0dXJuIHRoaXMuY29kZUJsb2NrcyB9XG5cbiAgICB0aGlzLmNvZGVCbG9ja3MgPSBbXVxuICAgIHRoaXMudmlzaXQoJ2NvZGUnLCBub2RlID0+IHRoaXMuY29kZUJsb2Nrcy5wdXNoKG5vZGUpKVxuICAgIHJldHVybiB0aGlzLmNvZGVCbG9ja3NcbiAgfVxuXG4gIGdldFNlY3Rpb25IZWFkaW5ncygpe1xuICAgIHJldHVybiB0aGlzLmdldFNlY3Rpb25Ob2RlcygpLm1hcChzZWN0aW9uID0+IHNlY3Rpb24uaGVhZGluZylcbiAgfVxuXG4gIGdldEFydGljbGVIZWFkaW5ncygpe1xuICAgIHJldHVybiB0aGlzLmdldEFydGljbGVOb2RlcygpLm1hcChhcnRpY2xlID0+IGFydGljbGUuaGVhZGluZylcbiAgfVxuXG4gIGdldFRvcFNlY3Rpb24oKSB7XG4gICAgcmV0dXJuIHRoaXMuZ2V0U2VjdGlvbk5vZGVzKCkuZmluZChub2RlID0+IG5vZGUudG9wKVxuICB9XG5cbiAgZ2V0U2VjdGlvbk5vZGVzKCkge1xuICAgIGlmKHRoaXMuc2VjdGlvbnMpeyByZXR1cm4gdGhpcy5zZWN0aW9ucyB9XG5cbiAgICB0aGlzLnNlY3Rpb25zID0gW11cbiAgICB0aGlzLnZpc2l0KCdzZWN0aW9uJywgbm9kZSA9PiB0aGlzLnNlY3Rpb25zLnB1c2gobm9kZSkpXG4gICAgcmV0dXJuIHRoaXMuc2VjdGlvbnMgPSB0aGlzLnNlY3Rpb25zLnJldmVyc2UoKVxuICB9XG5cbiAgZ2V0QXJ0aWNsZU5vZGVzKCkge1xuICAgIGlmKHRoaXMuYXJ0aWNsZXMpeyByZXR1cm4gdGhpcy5hcnRpY2xlcyB9XG5cbiAgICB0aGlzLmFydGljbGVzID0gW11cbiAgICB0aGlzLnZpc2l0KCdhcnRpY2xlJywgbm9kZSA9PiB0aGlzLmFydGljbGVzLnB1c2gobm9kZSkpXG4gICAgcmV0dXJuIHRoaXMuYXJ0aWNsZXMgPSB0aGlzLmFydGljbGVzLnJldmVyc2UoKVxuICB9XG5cbiAgZ2V0Q2hpbGRyZW4gKCkge1xuICAgIHJldHVybiB0aGlzLmFzdC5jaGlsZHJlblswXS5jaGlsZHJlbiAgXG4gIH1cblxuICBnZXRIZWFkaW5nTm9kZXMgKCkge1xuICAgIGxldCByZXN1bHRzID0gW11cbiAgICB0aGlzLnZpc2l0KCdoZWFkaW5nJywgbm9kZSA9PiByZXN1bHRzLnB1c2gobm9kZSkpXG4gICAgcmV0dXJuIHJlc3VsdHNcbiAgfVxuICBcbiAgLyoqXG4gICogR2l2ZW4gYSBjc3Mgc2VsZWN0b3IsIHJldHVybiBlYWNoIG9mIHRoZSBlbGVtZW50c1xuICAqICAgd3JhcHBlZCB3aXRoIGEgY2hlZXJpbyBvYmplY3QuIFxuICAqXG4gICogQHBhcmFtIHtzdHJpbmd9IHNlbGVjdG9yIC0gYSBjc3Mgc2VsZWN0b3IgdG8gbWF0Y2hcbiAgKiBAcmV0dXJuIC0gYW4gdW5kZXJzY29yZSB3cmFwcGVkIGFycmF5IG9mIGVsZW1lbnRzXG4gICovXG4gIGVsZW1lbnRzICguLi5hcmdzKSB7XG4gICAgcmV0dXJuIF8odGhpcy4kKC4uLmFyZ3MpLm1hcCgoaW5kZXgsZWwpPT57XG4gICAgICByZXR1cm4gY2hlZXJpbyhlbClcbiAgICB9KSlcbiAgfVxuXG4gIHJ1bkhvb2sgKGlkZW50aWZpZXIgPSBcIlwiLCAuLi5hcmdzKSB7XG4gICAgbGV0IGhvb2sgPSB0aGlzLm9wdGlvbnNbaWRlbnRpZmllcl0gfHwgdGhpc1tpZGVudGlmaWVyXVxuXG4gICAgaWYodHlwZW9mKGhvb2spID09PSBcImZ1bmN0aW9uXCIpe1xuICAgICAgaG9vay5hcHBseSh0aGlzLCBhcmdzKVxuICAgIH1cbiAgfVxufVxuIl19