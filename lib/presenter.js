'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var _underscoreString = require('underscore.string');

var _underscoreString2 = _interopRequireDefault(_underscoreString);

var Presenter = (function () {
  _createClass(Presenter, null, [{
    key: 'present',
    value: function present(document) {
      var options = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

      return new Presenter(document, options);
    }
  }, {
    key: 'loadFromDisk',
    value: function loadFromDisk(repositoryFolder) {
      var options = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];
    }
  }]);

  function Presenter(document) {
    var options = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

    _classCallCheck(this, Presenter);

    this.document = document;
    this.options = options;
    this.output = options.output || "console";
  }

  _createClass(Presenter, [{
    key: 'dump',
    value: function dump() {
      var doc = this.document;

      return {
        id: doc.id,
        path: doc.path,
        data: doc.data,
        content: doc.content,
        options: doc.options,
        ast: doc.ast,
        type: doc.getType(),
        html: doc.render()
      };
    }
  }, {
    key: 'children',
    value: function children() {
      this.document.getChildren();
    }

    /**
     * find the heading you want by its relative
     * positional index within the document
    */
  }, {
    key: 'getHeadingByIndex',
    value: function getHeadingByIndex(index) {
      return this.document.getHeadingNodes().find(function (node) {
        return node.headingIndex == index;
      });
    }
  }, {
    key: 'getNextHeading',
    value: function getNextHeading(from) {
      var index = from.headingIndex;
      var nextHeading = this.getHeadingByIndex(index + 1);

      if (nextHeading) return nextHeading;
    }
  }, {
    key: 'prettified',
    value: function prettified() {
      var pretty = undefined;

      try {
        pretty = require('html').prettyPrint(this.document.render());
      } catch (e) {
        pretty = this.document.render();
      }

      if (this.output === "console") {
        console.log(pretty);
      } else {
        return pretty;
      }
    }
  }, {
    key: 'viewHeadings',
    value: function viewHeadings() {
      var base = "";
      var indentation = "";
      var headings = this.document.getHeadingNodes();
      var report = [];

      headings.forEach(function (heading) {
        indentation = (heading.depth - 1) * 2;
        var value = heading.children[0].value;
        value = heading.headingIndex + ' ' + value;
        report.push(_underscoreString2['default'].repeat(' ', indentation) + value);
      });

      if (this.output === "console") {
        console.log(report.join("\n"));
      }

      return report;
    }
  }]);

  return Presenter;
})();

exports['default'] = Presenter;
module.exports = exports['default'];
//# sourceMappingURL=data:application/json;base64,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QUFJLENBQUMsQ0FBQTtBQUNsQyxZQUFJLEtBQUssR0FBRyxPQUFPLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQTtBQUNyQyxhQUFLLEdBQUcsT0FBTyxDQUFDLFlBQVksR0FBRyxHQUFHLEdBQUcsS0FBSyxDQUFBO0FBQzdDLGNBQU0sQ0FBQyxJQUFJLENBQUMsOEJBQU8sTUFBTSxDQUFDLEdBQUcsRUFBRSxXQUFXLENBQUMsR0FBRyxLQUFLLENBQUMsQ0FBQTtPQUNwRCxDQUFDLENBQUE7O0FBRUEsVUFBRyxJQUFJLENBQUMsTUFBTSxLQUFLLFNBQVMsRUFBQztBQUMzQixlQUFPLENBQUMsR0FBRyxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQTtPQUMvQjs7QUFFRCxhQUFPLE1BQU0sQ0FBQTtLQUNmOzs7U0FwRm1CLFNBQVM7OztxQkFBVCxTQUFTIiwiZmlsZSI6InByZXNlbnRlci5qcyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCBzdHJpbmcgZnJvbSAndW5kZXJzY29yZS5zdHJpbmcnXG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIFByZXNlbnRlciB7XG5cdHN0YXRpYyBwcmVzZW50IChkb2N1bWVudCwgb3B0aW9ucz17fSkge1xuXHRcdHJldHVybiBuZXcgUHJlc2VudGVyKGRvY3VtZW50LCBvcHRpb25zKVxuXHR9XG5cblx0c3RhdGljIGxvYWRGcm9tRGlzayAocmVwb3NpdG9yeUZvbGRlciwgb3B0aW9ucz17fSkge1xuXG5cdH1cblxuXHRjb25zdHJ1Y3RvciAoZG9jdW1lbnQsIG9wdGlvbnMgPSB7fSkge1xuXHRcdHRoaXMuZG9jdW1lbnQgPSBkb2N1bWVudFxuXHRcdHRoaXMub3B0aW9ucyA9IG9wdGlvbnNcbiAgICB0aGlzLm91dHB1dCA9IG9wdGlvbnMub3V0cHV0IHx8IFwiY29uc29sZVwiXG5cdH1cblxuICBkdW1wKCl7XG4gICAgbGV0IGRvYyA9IHRoaXMuZG9jdW1lbnRcblxuICAgIHJldHVybiB7XG4gICAgICBpZDogZG9jLmlkLFxuICAgICAgcGF0aDogZG9jLnBhdGgsXG4gICAgICBkYXRhOiBkb2MuZGF0YSxcbiAgICAgIGNvbnRlbnQ6IGRvYy5jb250ZW50LFxuICAgICAgb3B0aW9uczogZG9jLm9wdGlvbnMsXG4gICAgICBhc3Q6IGRvYy5hc3QsXG4gICAgICB0eXBlOiBkb2MuZ2V0VHlwZSgpLFxuICAgICAgaHRtbDogZG9jLnJlbmRlcigpXG4gICAgfVxuICB9XG5cblx0Y2hpbGRyZW4gKCl7XG5cdFx0dGhpcy5kb2N1bWVudC5nZXRDaGlsZHJlbigpXG5cdH1cbiAgXG4gIC8qKlxuICAgKiBmaW5kIHRoZSBoZWFkaW5nIHlvdSB3YW50IGJ5IGl0cyByZWxhdGl2ZVxuICAgKiBwb3NpdGlvbmFsIGluZGV4IHdpdGhpbiB0aGUgZG9jdW1lbnRcbiAgKi9cbiAgZ2V0SGVhZGluZ0J5SW5kZXggKGluZGV4KXtcbiAgICByZXR1cm4gdGhpcy5kb2N1bWVudC5nZXRIZWFkaW5nTm9kZXMoKS5maW5kKG5vZGUgPT4gbm9kZS5oZWFkaW5nSW5kZXggPT0gaW5kZXgpXG4gIH1cblxuICBnZXROZXh0SGVhZGluZyAoZnJvbSkge1xuICAgIGxldCBpbmRleCA9IGZyb20uaGVhZGluZ0luZGV4XG4gICAgbGV0IG5leHRIZWFkaW5nID0gdGhpcy5nZXRIZWFkaW5nQnlJbmRleChpbmRleCArIDEpXG5cbiAgICBpZihuZXh0SGVhZGluZylcbiAgICAgIHJldHVybiBuZXh0SGVhZGluZ1xuICB9XG4gIFxuICBwcmV0dGlmaWVkICgpIHtcbiAgICBsZXQgcHJldHR5XG4gICAgXG4gICAgdHJ5IHtcbiAgICAgIHByZXR0eSA9IHJlcXVpcmUoJ2h0bWwnKS5wcmV0dHlQcmludCh0aGlzLmRvY3VtZW50LnJlbmRlcigpKVxuICAgIH0gY2F0Y2goZSkge1xuICAgICAgcHJldHR5ID0gdGhpcy5kb2N1bWVudC5yZW5kZXIoKVxuICAgIH1cblxuICAgIGlmKHRoaXMub3V0cHV0ID09PSBcImNvbnNvbGVcIil7XG4gICAgICBjb25zb2xlLmxvZyhwcmV0dHkpXG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybihwcmV0dHkpXG4gICAgfVxuICB9XG5cblx0dmlld0hlYWRpbmdzICgpIHtcblx0XHRsZXQgYmFzZSA9IFwiXCJcblx0XHRsZXQgaW5kZW50YXRpb24gPSBcIlwiXG5cdFx0bGV0IGhlYWRpbmdzID0gdGhpcy5kb2N1bWVudC5nZXRIZWFkaW5nTm9kZXMoKVxuXHRcdGxldCByZXBvcnQgPSBbXVxuXG5cdFx0aGVhZGluZ3MuZm9yRWFjaChoZWFkaW5nID0+IHtcblx0XHRcdGluZGVudGF0aW9uID0gKGhlYWRpbmcuZGVwdGggLSAxKSAqIDJcbiAgICAgIGxldCB2YWx1ZSA9IGhlYWRpbmcuY2hpbGRyZW5bMF0udmFsdWVcbiAgICAgIHZhbHVlID0gaGVhZGluZy5oZWFkaW5nSW5kZXggKyAnICcgKyB2YWx1ZVxuXHRcdFx0cmVwb3J0LnB1c2goc3RyaW5nLnJlcGVhdCgnICcsIGluZGVudGF0aW9uKSArIHZhbHVlKVxuXHRcdH0pXG4gICAgXG4gICAgaWYodGhpcy5vdXRwdXQgPT09IFwiY29uc29sZVwiKXtcbiAgICAgIGNvbnNvbGUubG9nKHJlcG9ydC5qb2luKFwiXFxuXCIpKVxuICAgIH1cblxuICAgIHJldHVybiByZXBvcnRcblx0fVxufVxuIl19