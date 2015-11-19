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
        children: doc.getChildren(),
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
//# sourceMappingURL=data:application/json;base64,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LENBQUMsT0FBTyxDQUFDLEtBQUssR0FBRyxDQUFDLENBQUEsR0FBSSxDQUFDLENBQUE7QUFDbEMsWUFBSSxLQUFLLEdBQUcsT0FBTyxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUE7QUFDckMsYUFBSyxHQUFHLE9BQU8sQ0FBQyxZQUFZLEdBQUcsR0FBRyxHQUFHLEtBQUssQ0FBQTtBQUM3QyxjQUFNLENBQUMsSUFBSSxDQUFDLDhCQUFPLE1BQU0sQ0FBQyxHQUFHLEVBQUUsV0FBVyxDQUFDLEdBQUcsS0FBSyxDQUFDLENBQUE7T0FDcEQsQ0FBQyxDQUFBOztBQUVBLFVBQUcsSUFBSSxDQUFDLE1BQU0sS0FBSyxTQUFTLEVBQUM7QUFDM0IsZUFBTyxDQUFDLEdBQUcsQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUE7T0FDL0I7O0FBRUQsYUFBTyxNQUFNLENBQUE7S0FDZjs7O1NBckZtQixTQUFTOzs7cUJBQVQsU0FBUyIsImZpbGUiOiJwcmVzZW50ZXIuanMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgc3RyaW5nIGZyb20gJ3VuZGVyc2NvcmUuc3RyaW5nJ1xuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBQcmVzZW50ZXIge1xuXHRzdGF0aWMgcHJlc2VudCAoZG9jdW1lbnQsIG9wdGlvbnM9e30pIHtcblx0XHRyZXR1cm4gbmV3IFByZXNlbnRlcihkb2N1bWVudCwgb3B0aW9ucylcblx0fVxuXG5cdHN0YXRpYyBsb2FkRnJvbURpc2sgKHJlcG9zaXRvcnlGb2xkZXIsIG9wdGlvbnM9e30pIHtcblxuXHR9XG5cblx0Y29uc3RydWN0b3IgKGRvY3VtZW50LCBvcHRpb25zID0ge30pIHtcblx0XHR0aGlzLmRvY3VtZW50ID0gZG9jdW1lbnRcblx0XHR0aGlzLm9wdGlvbnMgPSBvcHRpb25zXG4gICAgdGhpcy5vdXRwdXQgPSBvcHRpb25zLm91dHB1dCB8fCBcImNvbnNvbGVcIlxuXHR9XG5cbiAgZHVtcCgpe1xuICAgIGxldCBkb2MgPSB0aGlzLmRvY3VtZW50XG5cbiAgICByZXR1cm4ge1xuICAgICAgaWQ6IGRvYy5pZCxcbiAgICAgIHBhdGg6IGRvYy5wYXRoLFxuICAgICAgZGF0YTogZG9jLmRhdGEsXG4gICAgICBjb250ZW50OiBkb2MuY29udGVudCxcbiAgICAgIG9wdGlvbnM6IGRvYy5vcHRpb25zLFxuICAgICAgY2hpbGRyZW46IGRvYy5nZXRDaGlsZHJlbigpLFxuICAgICAgYXN0OiBkb2MuYXN0LFxuICAgICAgdHlwZTogZG9jLmdldFR5cGUoKSxcbiAgICAgIGh0bWw6IGRvYy5yZW5kZXIoKVxuICAgIH1cbiAgfVxuXG5cdGNoaWxkcmVuICgpe1xuXHRcdHRoaXMuZG9jdW1lbnQuZ2V0Q2hpbGRyZW4oKVxuXHR9XG4gIFxuICAvKipcbiAgICogZmluZCB0aGUgaGVhZGluZyB5b3Ugd2FudCBieSBpdHMgcmVsYXRpdmVcbiAgICogcG9zaXRpb25hbCBpbmRleCB3aXRoaW4gdGhlIGRvY3VtZW50XG4gICovXG4gIGdldEhlYWRpbmdCeUluZGV4IChpbmRleCl7XG4gICAgcmV0dXJuIHRoaXMuZG9jdW1lbnQuZ2V0SGVhZGluZ05vZGVzKCkuZmluZChub2RlID0+IG5vZGUuaGVhZGluZ0luZGV4ID09IGluZGV4KVxuICB9XG5cbiAgZ2V0TmV4dEhlYWRpbmcgKGZyb20pIHtcbiAgICBsZXQgaW5kZXggPSBmcm9tLmhlYWRpbmdJbmRleFxuICAgIGxldCBuZXh0SGVhZGluZyA9IHRoaXMuZ2V0SGVhZGluZ0J5SW5kZXgoaW5kZXggKyAxKVxuXG4gICAgaWYobmV4dEhlYWRpbmcpXG4gICAgICByZXR1cm4gbmV4dEhlYWRpbmdcbiAgfVxuICBcbiAgcHJldHRpZmllZCAoKSB7XG4gICAgbGV0IHByZXR0eVxuICAgIFxuICAgIHRyeSB7XG4gICAgICBwcmV0dHkgPSByZXF1aXJlKCdodG1sJykucHJldHR5UHJpbnQodGhpcy5kb2N1bWVudC5yZW5kZXIoKSlcbiAgICB9IGNhdGNoKGUpIHtcbiAgICAgIHByZXR0eSA9IHRoaXMuZG9jdW1lbnQucmVuZGVyKClcbiAgICB9XG5cbiAgICBpZih0aGlzLm91dHB1dCA9PT0gXCJjb25zb2xlXCIpe1xuICAgICAgY29uc29sZS5sb2cocHJldHR5KVxuICAgIH0gZWxzZSB7XG4gICAgICByZXR1cm4ocHJldHR5KVxuICAgIH1cbiAgfVxuXG5cdHZpZXdIZWFkaW5ncyAoKSB7XG5cdFx0bGV0IGJhc2UgPSBcIlwiXG5cdFx0bGV0IGluZGVudGF0aW9uID0gXCJcIlxuXHRcdGxldCBoZWFkaW5ncyA9IHRoaXMuZG9jdW1lbnQuZ2V0SGVhZGluZ05vZGVzKClcblx0XHRsZXQgcmVwb3J0ID0gW11cblxuXHRcdGhlYWRpbmdzLmZvckVhY2goaGVhZGluZyA9PiB7XG5cdFx0XHRpbmRlbnRhdGlvbiA9IChoZWFkaW5nLmRlcHRoIC0gMSkgKiAyXG4gICAgICBsZXQgdmFsdWUgPSBoZWFkaW5nLmNoaWxkcmVuWzBdLnZhbHVlXG4gICAgICB2YWx1ZSA9IGhlYWRpbmcuaGVhZGluZ0luZGV4ICsgJyAnICsgdmFsdWVcblx0XHRcdHJlcG9ydC5wdXNoKHN0cmluZy5yZXBlYXQoJyAnLCBpbmRlbnRhdGlvbikgKyB2YWx1ZSlcblx0XHR9KVxuICAgIFxuICAgIGlmKHRoaXMub3V0cHV0ID09PSBcImNvbnNvbGVcIil7XG4gICAgICBjb25zb2xlLmxvZyhyZXBvcnQuam9pbihcIlxcblwiKSlcbiAgICB9XG5cbiAgICByZXR1cm4gcmVwb3J0XG5cdH1cbn1cbiJdfQ==