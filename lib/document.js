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
      delete this.codeBlocks;

      (0, _render2.process)(this, this.briefcase);
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
      return this.codeBlocks = this.codeBlocks.reverse();
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
//# sourceMappingURL=data:application/json;base64,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QUksQ0FBQyxJQUFJLENBQUM7T0FBQSxDQUFDLENBQUE7QUFDakQsYUFBTyxPQUFPLENBQUE7S0FDZjs7Ozs7Ozs7Ozs7V0FTUSxvQkFBVTtBQUNqQixhQUFPLDZCQUFFLElBQUksQ0FBQyxDQUFDLE1BQUEsQ0FBTixJQUFJLFlBQVcsQ0FBQyxHQUFHLENBQUMsVUFBQyxLQUFLLEVBQUMsRUFBRSxFQUFHO0FBQ3ZDLGVBQU8sMEJBQVEsRUFBRSxDQUFDLENBQUE7T0FDbkIsQ0FBQyxDQUFDLENBQUE7S0FDSjs7O1dBRU8sbUJBQTJCO1VBQTFCLFVBQVUseURBQUcsRUFBRTs7QUFDdEIsVUFBSSxJQUFJLEdBQUcsSUFBSSxDQUFDLE9BQU8sQ0FBQyxVQUFVLENBQUMsSUFBSSxJQUFJLENBQUMsVUFBVSxDQUFDLENBQUE7O0FBRXZELFVBQUcsT0FBTyxJQUFJLEFBQUMsS0FBSyxVQUFVLEVBQUM7MENBSEosSUFBSTtBQUFKLGNBQUk7OztBQUk3QixZQUFJLENBQUMsS0FBSyxDQUFDLElBQUksRUFBRSxJQUFJLENBQUMsQ0FBQTtPQUN2QjtLQUNGOzs7U0EzS2tCLFFBQVE7OztxQkFBUixRQUFRIiwiZmlsZSI6ImRvY3VtZW50LmpzIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IGZzIGZyb20gJ2ZzJ1xuaW1wb3J0IGNoZWVyaW8gZnJvbSAnY2hlZXJpbydcbmltcG9ydCBfIGZyb20gJ3VuZGVyc2NvcmUnXG5pbXBvcnQgdmlzaXQgZnJvbSAndW5pc3QtdXRpbC12aXNpdCdcbmltcG9ydCBwYXRoIGZyb20gJ3BhdGgnXG5cbmltcG9ydCBicmllZiBmcm9tICcuL2luZGV4J1xuaW1wb3J0IE1vZGVsIGZyb20gJy4vbW9kZWwnXG5pbXBvcnQgUHJlc2VudGVyIGZyb20gXCIuL3ByZXNlbnRlclwiXG5pbXBvcnQge3Byb2Nlc3MsIHBhcnNlfSBmcm9tICcuL3JlbmRlcidcbmltcG9ydCB7Y2xvbmUsIHNpbmd1bGFyaXplfSBmcm9tICcuL3V0aWwnXG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIERvY3VtZW50IHtcbiAgdG9TdHJpbmcoKSB7XG4gICAgcmV0dXJuIHRoaXMucGF0aFxuICB9XG4gIFxuICAvKipcbiAgICogY3JlYXRlcyBhIG5ldyBpbnN0YW5jZSBvZiB0aGUgZG9jdW1lbnQgYXQgcGF0aFxuICAgKiBAcGFyYW0ge3BhdGh9IHBhdGggLSB0aGUgYWJzb2x1dGUgcGF0aCB0byB0aGUgbWFya2Rvd24gZG9jdW1lbnQuXG4gICovXG4gIGNvbnN0cnVjdG9yKHBhdGhuYW1lLCBvcHRpb25zKSB7XG4gICAgdGhpcy5vcHRpb25zID0gb3B0aW9ucyB8fCB7fVxuICAgIHRoaXMucGF0aCA9IHBhdGhuYW1lXG4gICAgdGhpcy5kaXJuYW1lID0gcGF0aC5kaXJuYW1lKHRoaXMucGF0aClcblxuICAgIGlmKHRoaXMub3B0aW9ucy50eXBlKXtcbiAgICAgIHRoaXMudHlwZSA9IHRoaXMub3B0aW9ucy50eXBlXG4gICAgfVxuXG4gICAgcHJvY2Vzcyh0aGlzLCB0aGlzLmdldEJyaWVmY2FzZSgpKVxuICB9XG4gIFxuICByZXNvbHZlTGluayhwYXRoQWxpYXMpe1xuICAgIHJldHVybiB0aGlzLmdldEJyaWVmY2FzZSgpLnJlc29sdmVMaW5rKHBhdGhBbGlhcylcbiAgfVxuXG4gIC8qKlxuICAqIHJldHVybiBhIHJlZmVyZW5jZSB0byB0aGUgYnJpZWZjYXNlIHRoaXMgZG9jdW1lbnQgYmVsb25ncyB0by5cbiAgKi9cbiAgZ2V0QnJpZWZjYXNlKCl7XG4gICAgaWYodGhpcy5icmllZmNhc2UpIHsgcmV0dXJuIHRoaXMuYnJpZWZjYXNlIH1cbiAgICByZXR1cm4gdGhpcy5icmllZmNhc2UgPSBicmllZi5maW5kQnJpZWZjYXNlQnlQYXRoKHRoaXMucGF0aClcbiAgfVxuICAvKipcbiAgICogZ2V0IGEgbW9kZWwgdG8gcmVwcmVzZW50IHRoaXMgZG9jdW1lbnQgYW5kIHRoZSBkYXRhIHdlIHBhcnNlIGZyb20gaXQuXG4gICAqXG4gICAqIEByZXR1cm4ge01vZGVsfSAtIGEgbW9kZWwgaW5zdGFuY2UgXG4gICovXG4gIHRvTW9kZWwgKG9wdGlvbnM9e30pIHtcbiAgICByZXR1cm4gTW9kZWwuZnJvbURvY3VtZW50KHRoaXMsIG9wdGlvbnMpXG4gIH1cbiAgXG4gIHdyaXRlU3luYyhuZXdDb250ZW50KXtcbiAgICBuZXdDb250ZW50ID0gbmV3Q29udGVudCB8fCB0aGlzLmNvbnRlbnRcbiAgICBmcy53cml0ZUZpbGVTeW5jKHRoaXMucGF0aCwgbmV3Q29udGVudClcbiAgICB0aGlzLnJlbG9hZCgpXG4gIH1cblxuICBsYXN0TW9kaWZpZWRBdCgpe1xuICAgIHJldHVybiBmcy5sc3RhdFN5bmModGhpcy5wYXRoKS5tdGltZS52YWx1ZU9mKClcbiAgfVxuXG4gIC8qKlxuICAgKiByZXR1cm5zIGEgcmVuZGVyZWQgZG9jdW1lbnRcbiAgICogQHJldHVybiB7RG9jdW1lbnR9IC0gdGhpcyBkb2N1bWVudFxuICAqL1xuICByZW5kZXJlZCgpIHtcbiAgICB0aGlzLnJlbmRlcigpXG4gICAgcmV0dXJuIHRoaXNcbiAgfVxuICBcbiAgLyoqXG4gICAqIHJlbmRlciB0aGUgZG9jdW1lbnQuXG4gICAqIEByZXR1cm4ge3N0cmluZ30gLSBSZW5kZXJlZCBIVE1MIGZyb20gdGhlIGRvY3VtZW50IG1hcmtkb3duXG4gICovXG4gIHJlbmRlcigpIHtcbiAgICByZXR1cm4gdGhpcy5odG1sID8gdGhpcy5odG1sIDogcmVuZGVyKHRoaXMpIFxuICB9XG5cbiAgZ2V0VHlwZSgpe1xuICAgIGlmKHRoaXMuZGF0YSAmJiB0aGlzLmRhdGEudHlwZSl7XG4gICAgICByZXR1cm4gdGhpcy5kYXRhLnR5cGVcbiAgICB9XG5cbiAgICByZXR1cm4gc2luZ3VsYXJpemUocGF0aC5iYXNlbmFtZSh0aGlzLmRpcm5hbWUpKVxuICB9XG4gIFxuICAvKiogXG4gICogYXBwbHkgYSBwcmVzZW50ZXIgdG8gdGhlIGRvY3VtZW50LiB1c2VmdWwgZm9yIGRlYnVnZ2luZ1xuICAqIHB1cnBvc2VzLlxuICAqL1xuICBwcmVzZW50IChtZXRob2QsIG9wdGlvbnM9e30pIHtcbiAgICBsZXQgcHJlc2VudGVyID0gUHJlc2VudGVyLnByZXNlbnQodGhpcywgb3B0aW9ucylcbiAgICByZXR1cm4gcHJlc2VudGVyW21ldGhvZF0oKVxuICB9XG4gIFxuICAvKipcbiAgKiB2aXNpdCBldmVyeSBub2RlIG9mIHRoZSBwYXJzZWQgYXN0XG4gICovXG4gIHZpc2l0KHR5cGUsIGl0ZXJhdG9yKSB7XG4gICAgdmlzaXQodGhpcy5hc3QsIHR5cGUsIGl0ZXJhdG9yKVxuICB9XG5cbiAgZ2V0QVNUICgpIHtcbiAgICByZXR1cm4gdGhpcy5hc3RcbiAgfVxuXG4gIHJlbG9hZCgpe1xuICAgIGRlbGV0ZSh0aGlzLmFydGljbGVzKVxuICAgIGRlbGV0ZSh0aGlzLnNlY3Rpb25zKVxuICAgIGRlbGV0ZSh0aGlzLmRhdGEpXG4gICAgZGVsZXRlKHRoaXMuY29udGVudClcbiAgICBkZWxldGUodGhpcy5jb2RlQmxvY2tzKVxuXG4gICAgcHJvY2Vzcyh0aGlzLCB0aGlzLmJyaWVmY2FzZSlcbiAgfVxuICBcbiAgZ2V0Q29kZUJsb2NrcygpIHtcbiAgICBpZih0aGlzLmNvZGVCbG9ja3MpeyByZXR1cm4gdGhpcy5jb2RlQmxvY2tzIH1cblxuICAgIHRoaXMuY29kZUJsb2NrcyA9IFtdXG4gICAgdGhpcy52aXNpdCgnY29kZScsIG5vZGUgPT4gdGhpcy5jb2RlQmxvY2tzLnB1c2gobm9kZSkpXG4gICAgcmV0dXJuIHRoaXMuY29kZUJsb2NrcyA9IHRoaXMuY29kZUJsb2Nrcy5yZXZlcnNlKClcbiAgfVxuXG4gIGdldFNlY3Rpb25IZWFkaW5ncygpe1xuICAgIHJldHVybiB0aGlzLmdldFNlY3Rpb25Ob2RlcygpLm1hcChzZWN0aW9uID0+IHNlY3Rpb24uaGVhZGluZylcbiAgfVxuXG4gIGdldEFydGljbGVIZWFkaW5ncygpe1xuICAgIHJldHVybiB0aGlzLmdldEFydGljbGVOb2RlcygpLm1hcChhcnRpY2xlID0+IGFydGljbGUuaGVhZGluZylcbiAgfVxuXG4gIGdldFRvcFNlY3Rpb24oKSB7XG4gICAgcmV0dXJuIHRoaXMuZ2V0U2VjdGlvbk5vZGVzKCkuZmluZChub2RlID0+IG5vZGUudG9wKVxuICB9XG5cbiAgZ2V0U2VjdGlvbk5vZGVzKCkge1xuICAgIGlmKHRoaXMuc2VjdGlvbnMpeyByZXR1cm4gdGhpcy5zZWN0aW9ucyB9XG5cbiAgICB0aGlzLnNlY3Rpb25zID0gW11cbiAgICB0aGlzLnZpc2l0KCdzZWN0aW9uJywgbm9kZSA9PiB0aGlzLnNlY3Rpb25zLnB1c2gobm9kZSkpXG4gICAgcmV0dXJuIHRoaXMuc2VjdGlvbnMgPSB0aGlzLnNlY3Rpb25zLnJldmVyc2UoKVxuICB9XG5cbiAgZ2V0QXJ0aWNsZU5vZGVzKCkge1xuICAgIGlmKHRoaXMuYXJ0aWNsZXMpeyByZXR1cm4gdGhpcy5hcnRpY2xlcyB9XG5cbiAgICB0aGlzLmFydGljbGVzID0gW11cbiAgICB0aGlzLnZpc2l0KCdhcnRpY2xlJywgbm9kZSA9PiB0aGlzLmFydGljbGVzLnB1c2gobm9kZSkpXG4gICAgcmV0dXJuIHRoaXMuYXJ0aWNsZXMgPSB0aGlzLmFydGljbGVzLnJldmVyc2UoKVxuICB9XG5cbiAgZ2V0Q2hpbGRyZW4gKCkge1xuICAgIHJldHVybiB0aGlzLmFzdC5jaGlsZHJlblswXS5jaGlsZHJlbiAgXG4gIH1cblxuICBnZXRIZWFkaW5nTm9kZXMgKCkge1xuICAgIGxldCByZXN1bHRzID0gW11cbiAgICB0aGlzLnZpc2l0KCdoZWFkaW5nJywgbm9kZSA9PiByZXN1bHRzLnB1c2gobm9kZSkpXG4gICAgcmV0dXJuIHJlc3VsdHNcbiAgfVxuICBcbiAgLyoqXG4gICogR2l2ZW4gYSBjc3Mgc2VsZWN0b3IsIHJldHVybiBlYWNoIG9mIHRoZSBlbGVtZW50c1xuICAqICAgd3JhcHBlZCB3aXRoIGEgY2hlZXJpbyBvYmplY3QuIFxuICAqXG4gICogQHBhcmFtIHtzdHJpbmd9IHNlbGVjdG9yIC0gYSBjc3Mgc2VsZWN0b3IgdG8gbWF0Y2hcbiAgKiBAcmV0dXJuIC0gYW4gdW5kZXJzY29yZSB3cmFwcGVkIGFycmF5IG9mIGVsZW1lbnRzXG4gICovXG4gIGVsZW1lbnRzICguLi5hcmdzKSB7XG4gICAgcmV0dXJuIF8odGhpcy4kKC4uLmFyZ3MpLm1hcCgoaW5kZXgsZWwpPT57XG4gICAgICByZXR1cm4gY2hlZXJpbyhlbClcbiAgICB9KSlcbiAgfVxuXG4gIHJ1bkhvb2sgKGlkZW50aWZpZXIgPSBcIlwiLCAuLi5hcmdzKSB7XG4gICAgbGV0IGhvb2sgPSB0aGlzLm9wdGlvbnNbaWRlbnRpZmllcl0gfHwgdGhpc1tpZGVudGlmaWVyXVxuXG4gICAgaWYodHlwZW9mKGhvb2spID09PSBcImZ1bmN0aW9uXCIpe1xuICAgICAgaG9vay5hcHBseSh0aGlzLCBhcmdzKVxuICAgIH1cbiAgfVxufVxuIl19