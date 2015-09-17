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
//# sourceMappingURL=data:application/json;base64,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QyxDQUFBO09BQy9COztBQUVELGFBQU8sTUFBTSxDQUFBO0tBQ2Y7OztTQXJFbUIsU0FBUzs7O3FCQUFULFNBQVMiLCJmaWxlIjoicHJlc2VudGVyLmpzIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHN0cmluZyBmcm9tICd1bmRlcnNjb3JlLnN0cmluZydcblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgUHJlc2VudGVyIHtcblx0c3RhdGljIHByZXNlbnQgKGRvY3VtZW50LCBvcHRpb25zPXt9KSB7XG5cdFx0cmV0dXJuIG5ldyBQcmVzZW50ZXIoZG9jdW1lbnQsIG9wdGlvbnMpXG5cdH1cblxuXHRzdGF0aWMgbG9hZEZyb21EaXNrIChyZXBvc2l0b3J5Rm9sZGVyLCBvcHRpb25zPXt9KSB7XG5cblx0fVxuXG5cdGNvbnN0cnVjdG9yIChkb2N1bWVudCwgb3B0aW9ucyA9IHt9KSB7XG5cdFx0dGhpcy5kb2N1bWVudCA9IGRvY3VtZW50XG5cdFx0dGhpcy5vcHRpb25zID0gb3B0aW9uc1xuICAgIHRoaXMub3V0cHV0ID0gb3B0aW9ucy5vdXRwdXQgfHwgXCJjb25zb2xlXCJcblx0fVxuXG5cdGNoaWxkcmVuICgpe1xuXHRcdHRoaXMuZG9jdW1lbnQuZ2V0Q2hpbGRyZW4oKVxuXHR9XG4gIFxuICAvKipcbiAgICogZmluZCB0aGUgaGVhZGluZyB5b3Ugd2FudCBieSBpdHMgcmVsYXRpdmVcbiAgICogcG9zaXRpb25hbCBpbmRleCB3aXRoaW4gdGhlIGRvY3VtZW50XG4gICovXG4gIGdldEhlYWRpbmdCeUluZGV4IChpbmRleCl7XG4gICAgcmV0dXJuIHRoaXMuZG9jdW1lbnQuZ2V0SGVhZGluZ05vZGVzKCkuZmluZChub2RlID0+IG5vZGUuaGVhZGluZ0luZGV4ID09IGluZGV4KVxuICB9XG5cbiAgZ2V0TmV4dEhlYWRpbmcgKGZyb20pIHtcbiAgICBsZXQgaW5kZXggPSBmcm9tLmhlYWRpbmdJbmRleFxuICAgIGxldCBuZXh0SGVhZGluZyA9IHRoaXMuZ2V0SGVhZGluZ0J5SW5kZXgoaW5kZXggKyAxKVxuXG4gICAgaWYobmV4dEhlYWRpbmcpXG4gICAgICByZXR1cm4gbmV4dEhlYWRpbmdcbiAgfVxuICBcbiAgcHJldHRpZmllZCAoKSB7XG4gICAgbGV0IHByZXR0eVxuICAgIFxuICAgIHRyeSB7XG4gICAgICBwcmV0dHkgPSByZXF1aXJlKCdodG1sJykucHJldHR5UHJpbnQodGhpcy5kb2N1bWVudC5yZW5kZXIoKSlcbiAgICB9IGNhdGNoKGUpIHtcbiAgICAgIHByZXR0eSA9IHRoaXMuZG9jdW1lbnQucmVuZGVyKClcbiAgICB9XG5cbiAgICBpZih0aGlzLm91dHB1dCA9PT0gXCJjb25zb2xlXCIpe1xuICAgICAgY29uc29sZS5sb2cocHJldHR5KVxuICAgIH0gZWxzZSB7XG4gICAgICByZXR1cm4ocHJldHR5KVxuICAgIH1cbiAgfVxuXG5cdHZpZXdIZWFkaW5ncyAoKSB7XG5cdFx0bGV0IGJhc2UgPSBcIlwiXG5cdFx0bGV0IGluZGVudGF0aW9uID0gXCJcIlxuXHRcdGxldCBoZWFkaW5ncyA9IHRoaXMuZG9jdW1lbnQuZ2V0SGVhZGluZ05vZGVzKClcblx0XHRsZXQgcmVwb3J0ID0gW11cblxuXHRcdGhlYWRpbmdzLmZvckVhY2goaGVhZGluZyA9PiB7XG5cdFx0XHRpbmRlbnRhdGlvbiA9IChoZWFkaW5nLmRlcHRoIC0gMSkgKiAyXG4gICAgICBsZXQgdmFsdWUgPSBoZWFkaW5nLmNoaWxkcmVuWzBdLnZhbHVlXG4gICAgICB2YWx1ZSA9IGhlYWRpbmcuaGVhZGluZ0luZGV4ICsgJyAnICsgdmFsdWVcblx0XHRcdHJlcG9ydC5wdXNoKHN0cmluZy5yZXBlYXQoJyAnLCBpbmRlbnRhdGlvbikgKyB2YWx1ZSlcblx0XHR9KVxuICAgIFxuICAgIGlmKHRoaXMub3V0cHV0ID09PSBcImNvbnNvbGVcIil7XG4gICAgICBjb25zb2xlLmxvZyhyZXBvcnQuam9pbihcIlxcblwiKSlcbiAgICB9XG5cbiAgICByZXR1cm4gcmVwb3J0XG5cdH1cbn1cbiJdfQ==