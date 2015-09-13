'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var _underscoreString = require('underscore.string');

var _underscoreString2 = _interopRequireDefault(_underscoreString);

var _html = require('html');

var _html2 = _interopRequireDefault(_html);

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
      var pretty = require('html').prettyPrint(this.document.render());

      if (this.output === "console") {
        console.log(highlight(pretty));
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
//# sourceMappingURL=data:application/json;base64,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ci5qcyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCBzdHJpbmcgZnJvbSAndW5kZXJzY29yZS5zdHJpbmcnXG5pbXBvcnQgaHRtbCBmcm9tICdodG1sJ1xuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBQcmVzZW50ZXIge1xuXHRzdGF0aWMgcHJlc2VudCAoZG9jdW1lbnQsIG9wdGlvbnM9e30pIHtcblx0XHRyZXR1cm4gbmV3IFByZXNlbnRlcihkb2N1bWVudCwgb3B0aW9ucylcblx0fVxuXG5cdHN0YXRpYyBsb2FkRnJvbURpc2sgKHJlcG9zaXRvcnlGb2xkZXIsIG9wdGlvbnM9e30pIHtcblxuXHR9XG5cblx0Y29uc3RydWN0b3IgKGRvY3VtZW50LCBvcHRpb25zID0ge30pIHtcblx0XHR0aGlzLmRvY3VtZW50ID0gZG9jdW1lbnRcblx0XHR0aGlzLm9wdGlvbnMgPSBvcHRpb25zXG4gICAgdGhpcy5vdXRwdXQgPSBvcHRpb25zLm91dHB1dCB8fCBcImNvbnNvbGVcIlxuXHR9XG5cblx0Y2hpbGRyZW4gKCl7XG5cdFx0dGhpcy5kb2N1bWVudC5nZXRDaGlsZHJlbigpXG5cdH1cbiAgXG4gIC8qKlxuICAgKiBmaW5kIHRoZSBoZWFkaW5nIHlvdSB3YW50IGJ5IGl0cyByZWxhdGl2ZVxuICAgKiBwb3NpdGlvbmFsIGluZGV4IHdpdGhpbiB0aGUgZG9jdW1lbnRcbiAgKi9cbiAgZ2V0SGVhZGluZ0J5SW5kZXggKGluZGV4KXtcbiAgICByZXR1cm4gdGhpcy5kb2N1bWVudC5nZXRIZWFkaW5nTm9kZXMoKS5maW5kKG5vZGUgPT4gbm9kZS5oZWFkaW5nSW5kZXggPT0gaW5kZXgpXG4gIH1cblxuICBnZXROZXh0SGVhZGluZyAoZnJvbSkge1xuICAgIGxldCBpbmRleCA9IGZyb20uaGVhZGluZ0luZGV4XG4gICAgbGV0IG5leHRIZWFkaW5nID0gdGhpcy5nZXRIZWFkaW5nQnlJbmRleChpbmRleCArIDEpXG5cbiAgICBpZihuZXh0SGVhZGluZylcbiAgICAgIHJldHVybiBuZXh0SGVhZGluZ1xuICB9XG4gIFxuICBwcmV0dGlmaWVkICgpIHtcbiAgICBsZXQgcHJldHR5ID0gcmVxdWlyZSgnaHRtbCcpLnByZXR0eVByaW50KHRoaXMuZG9jdW1lbnQucmVuZGVyKCkpXG5cbiAgICBpZih0aGlzLm91dHB1dCA9PT0gXCJjb25zb2xlXCIpe1xuICAgICAgY29uc29sZS5sb2coaGlnaGxpZ2h0KHByZXR0eSkpXG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybihwcmV0dHkpXG4gICAgfVxuICB9XG5cblx0dmlld0hlYWRpbmdzICgpIHtcblx0XHRsZXQgYmFzZSA9IFwiXCJcblx0XHRsZXQgaW5kZW50YXRpb24gPSBcIlwiXG5cdFx0bGV0IGhlYWRpbmdzID0gdGhpcy5kb2N1bWVudC5nZXRIZWFkaW5nTm9kZXMoKVxuXHRcdGxldCByZXBvcnQgPSBbXVxuXG5cdFx0aGVhZGluZ3MuZm9yRWFjaChoZWFkaW5nID0+IHtcblx0XHRcdGluZGVudGF0aW9uID0gKGhlYWRpbmcuZGVwdGggLSAxKSAqIDJcbiAgICAgIGxldCB2YWx1ZSA9IGhlYWRpbmcuY2hpbGRyZW5bMF0udmFsdWVcbiAgICAgIHZhbHVlID0gaGVhZGluZy5oZWFkaW5nSW5kZXggKyAnICcgKyB2YWx1ZVxuXHRcdFx0cmVwb3J0LnB1c2goc3RyaW5nLnJlcGVhdCgnICcsIGluZGVudGF0aW9uKSArIHZhbHVlKVxuXHRcdH0pXG4gICAgXG4gICAgaWYodGhpcy5vdXRwdXQgPT09IFwiY29uc29sZVwiKXtcbiAgICAgIGNvbnNvbGUubG9nKHJlcG9ydC5qb2luKFwiXFxuXCIpKVxuICAgIH1cblxuICAgIHJldHVybiByZXBvcnRcblx0fVxufVxuIl19