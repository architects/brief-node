'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});
exports.markdown = markdown;
exports.parse = parse;
exports.process = process;
exports.fragment = fragment;
exports.stringify = stringify;

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _mdast = require('mdast');

var _mdast2 = _interopRequireDefault(_mdast);

var _mdastYaml = require('mdast-yaml');

var _mdastYaml2 = _interopRequireDefault(_mdastYaml);

var _mdastHtml = require('mdast-html');

var _mdastHtml2 = _interopRequireDefault(_mdastHtml);

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

var _mdastSqueezeParagraphs = require('mdast-squeeze-paragraphs');

var _mdastSqueezeParagraphs2 = _interopRequireDefault(_mdastSqueezeParagraphs);

var _mdastNormalizeHeadings = require('mdast-normalize-headings');

var _mdastNormalizeHeadings2 = _interopRequireDefault(_mdastNormalizeHeadings);

var _unistUtilVisit = require('unist-util-visit');

var _unistUtilVisit2 = _interopRequireDefault(_unistUtilVisit);

var _cheerio = require('cheerio');

var _cheerio2 = _interopRequireDefault(_cheerio);

var _util = require('./util');

var processor = _mdast2['default'].use([_mdastYaml2['default'], _mdastSqueezeParagraphs2['default'], _mdastNormalizeHeadings2['default'], _mdastHtml2['default']]);

function markdown() {
  return processor;
}

function parse(document) {
  var parsed = processor.parse(document.content),
      nodes = parsed.children;

  if (nodes[0] && nodes[0].yaml) {
    document.data = nodes.shift().yaml;
  }

  var ast = processor.run(parsed);

  document.runHook("documentDidParse", ast);

  return ast;
}

function process(document) {
  document.content = readPath(document.path);

  document.ast = parse(document);
  document.runHook("documentWillRender", document.ast);

  nestElements(document);
  collapseSections(document);
  applyWrapper(document);

  document.html = stringify(document.ast);
  document.$ = function (selector) {
    return _cheerio2['default'].load(document.html)(selector);
  };

  document.runHook("documentDidRender", document.html);

  return document;
}

function fragment(ast) {
  var options = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

  return stringify({
    type: 'root',
    children: [ast]
  });
}

function stringify(ast) {
  var options = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

  return processor.stringify(ast, options);
}

function readPath(path) {
  return _fs2['default'].readFileSync(path).toString();
}

function nestElements(document) {
  var children = document.ast.children;
  var headings = document.ast.children.filter(function (c) {
    return c.type === "heading";
  });

  var index = 0;
  var previous = undefined;
  var top = undefined;

  children.forEach(function (child) {
    var data = child.data;

    if (child.type === "heading") {
      delete child.data;
      top = false;
      data = data || {};
      data.htmlName = "section";
      data.htmlAttributes = data.htmlAttributes || {};

      if (child.depth == 1 && !top) {
        top = true;
        data.htmlAttributes['data-top'] = true;
      }

      if (child.depth >= 3) {
        data.htmlName = "article";
      }

      child.data = {};

      var wrapped = {
        type: data.htmlName,
        depth: child.depth,
        container: true,
        data: data,
        children: [child]
      };

      wrapped[data.htmlName] = true;

      if (top) {
        wrapped.top = top;
      }

      if (child.type == "heading") {
        var text = child.children[0] && child.children[0].value;
        var slug = (0, _util.slugify)(text);
        data.htmlAttributes['data-heading'] = slug;
        wrapped.slug = slug;
        wrapped.heading = text;
        child.heading = text;
      }

      previous = children[index] = wrapped;
    } else if (previous) {
      previous.children.push((0, _util.clone)(child));
      child.markForRemoval = true;
    }

    index = index + 1;
  });

  document.ast.wrapped = true;
  document.ast.children = children.filter(function (child) {
    return !child.markForRemoval;
  });
}

function collapseSections(document) {
  var children = document.ast.children;
  var previous = undefined;

  children.forEach(function (child) {
    var name = child.data && child.data.htmlName;
    if (name === "section") {
      previous = child;
      child.debug = true;
      child.section = true;
    }

    if (previous && name === "article") {
      var cloned = (0, _util.clone)(child);
      cloned.parent = previous.slug;
      previous.children.push(cloned);
      child.markForDelete = true;
    }
  });

  document.ast.children = children.filter(function (child) {
    return !child.markForDelete;
  });
}

function applyWrapper(document) {
  document.ast.children = [{
    type: "unknown",
    data: {
      htmlName: "main",
      htmlAttributes: {
        "class": "brief-document"
      }
    },
    children: document.ast.children
  }];
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3NyYy9yZW5kZXIuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7OztxQkFBa0IsT0FBTzs7Ozt5QkFDUixZQUFZOzs7O3lCQUNaLFlBQVk7Ozs7a0JBQ2QsSUFBSTs7OztzQ0FDQywwQkFBMEI7Ozs7c0NBQ3hCLDBCQUEwQjs7Ozs4QkFDOUIsa0JBQWtCOzs7O3VCQUNoQixTQUFTOzs7O29CQUNELFFBQVE7O0FBRXBDLElBQU0sU0FBUyxHQUFHLG1CQUFNLEdBQUcsQ0FBQywwSEFBNkIsQ0FBQyxDQUFBOztBQUVuRCxTQUFTLFFBQVEsR0FBRTtBQUN4QixTQUFPLFNBQVMsQ0FBQTtDQUNqQjs7QUFFTSxTQUFTLEtBQUssQ0FBQyxRQUFRLEVBQUU7QUFDOUIsTUFBSSxNQUFNLEdBQUcsU0FBUyxDQUFDLEtBQUssQ0FBQyxRQUFRLENBQUMsT0FBTyxDQUFDO01BQzFDLEtBQUssR0FBSSxNQUFNLENBQUMsUUFBUSxDQUFBOztBQUU1QixNQUFHLEtBQUssQ0FBQyxDQUFDLENBQUMsSUFBSSxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxFQUFDO0FBQzNCLFlBQVEsQ0FBQyxJQUFJLEdBQUcsS0FBSyxDQUFDLEtBQUssRUFBRSxDQUFDLElBQUksQ0FBQTtHQUNuQzs7QUFFRCxNQUFJLEdBQUcsR0FBRyxTQUFTLENBQUMsR0FBRyxDQUFDLE1BQU0sQ0FBQyxDQUFBOztBQUUvQixVQUFRLENBQUMsT0FBTyxDQUFDLGtCQUFrQixFQUFFLEdBQUcsQ0FBQyxDQUFBOztBQUV6QyxTQUFPLEdBQUcsQ0FBQTtDQUNYOztBQUVNLFNBQVMsT0FBTyxDQUFDLFFBQVEsRUFBRTtBQUNoQyxVQUFRLENBQUMsT0FBTyxHQUFHLFFBQVEsQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLENBQUE7O0FBRTFDLFVBQVEsQ0FBQyxHQUFHLEdBQUcsS0FBSyxDQUFDLFFBQVEsQ0FBQyxDQUFBO0FBQzlCLFVBQVEsQ0FBQyxPQUFPLENBQUMsb0JBQW9CLEVBQUUsUUFBUSxDQUFDLEdBQUcsQ0FBQyxDQUFBOztBQUVwRCxjQUFZLENBQUMsUUFBUSxDQUFDLENBQUE7QUFDdEIsa0JBQWdCLENBQUMsUUFBUSxDQUFDLENBQUE7QUFDMUIsY0FBWSxDQUFDLFFBQVEsQ0FBQyxDQUFBOztBQUV0QixVQUFRLENBQUMsSUFBSSxHQUFHLFNBQVMsQ0FBQyxRQUFRLENBQUMsR0FBRyxDQUFDLENBQUE7QUFDdkMsVUFBUSxDQUFDLENBQUMsR0FBRyxVQUFTLFFBQVEsRUFBQztBQUM3QixXQUFPLHFCQUFRLElBQUksQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLENBQUMsUUFBUSxDQUFDLENBQUE7R0FDN0MsQ0FBQTs7QUFFRCxVQUFRLENBQUMsT0FBTyxDQUFDLG1CQUFtQixFQUFFLFFBQVEsQ0FBQyxJQUFJLENBQUMsQ0FBQTs7QUFFcEQsU0FBTyxRQUFRLENBQUE7Q0FDaEI7O0FBRU0sU0FBUyxRQUFRLENBQUMsR0FBRyxFQUFjO01BQVosT0FBTyx5REFBQyxFQUFFOztBQUN0QyxTQUFPLFNBQVMsQ0FBQztBQUNmLFFBQUksRUFBRSxNQUFNO0FBQ1osWUFBUSxFQUFFLENBQUMsR0FBRyxDQUFDO0dBQ2hCLENBQUMsQ0FBQTtDQUNIOztBQUVNLFNBQVMsU0FBUyxDQUFDLEdBQUcsRUFBYztNQUFaLE9BQU8seURBQUMsRUFBRTs7QUFDdkMsU0FBTyxTQUFTLENBQUMsU0FBUyxDQUFDLEdBQUcsRUFBRSxPQUFPLENBQUMsQ0FBQTtDQUN6Qzs7QUFFRCxTQUFTLFFBQVEsQ0FBQyxJQUFJLEVBQUU7QUFDdEIsU0FBTyxnQkFBRyxZQUFZLENBQUMsSUFBSSxDQUFDLENBQUMsUUFBUSxFQUFFLENBQUE7Q0FDeEM7O0FBRUQsU0FBUyxZQUFZLENBQUMsUUFBUSxFQUFFO0FBQzlCLE1BQUksUUFBUSxHQUFHLFFBQVEsQ0FBQyxHQUFHLENBQUMsUUFBUSxDQUFBO0FBQ3BDLE1BQUksUUFBUSxHQUFHLFFBQVEsQ0FBQyxHQUFHLENBQUMsUUFBUSxDQUFDLE1BQU0sQ0FBQyxVQUFBLENBQUM7V0FBSSxDQUFDLENBQUMsSUFBSSxLQUFLLFNBQVM7R0FBQSxDQUFDLENBQUE7O0FBRXZFLE1BQUksS0FBSyxHQUFHLENBQUMsQ0FBQTtBQUNiLE1BQUksUUFBUSxZQUFBLENBQUE7QUFDWCxNQUFJLEdBQUcsWUFBQSxDQUFBOztBQUVSLFVBQVEsQ0FBQyxPQUFPLENBQUMsVUFBQSxLQUFLLEVBQUk7QUFDekIsUUFBSSxJQUFJLEdBQUcsS0FBSyxDQUFDLElBQUksQ0FBQTs7QUFFckIsUUFBRyxLQUFLLENBQUMsSUFBSSxLQUFLLFNBQVMsRUFBQztBQUMzQixhQUFPLEtBQUssQ0FBQyxJQUFJLEFBQUMsQ0FBQTtBQUNmLFNBQUcsR0FBRyxLQUFLLENBQUE7QUFDWCxVQUFJLEdBQUcsSUFBSSxJQUFJLEVBQUUsQ0FBQTtBQUNqQixVQUFJLENBQUMsUUFBUSxHQUFHLFNBQVMsQ0FBQTtBQUN6QixVQUFJLENBQUMsY0FBYyxHQUFHLElBQUksQ0FBQyxjQUFjLElBQUksRUFBRSxDQUFBOztBQUUvQyxVQUFHLEtBQUssQ0FBQyxLQUFLLElBQUksQ0FBQyxJQUFJLENBQUMsR0FBRyxFQUFDO0FBQzFCLFdBQUcsR0FBRyxJQUFJLENBQUE7QUFDVixZQUFJLENBQUMsY0FBYyxDQUFDLFVBQVUsQ0FBQyxHQUFHLElBQUksQ0FBQTtPQUN2Qzs7QUFFRCxVQUFHLEtBQUssQ0FBQyxLQUFLLElBQUksQ0FBQyxFQUFDO0FBQ2xCLFlBQUksQ0FBQyxRQUFRLEdBQUcsU0FBUyxDQUFBO09BQzFCOztBQUVELFdBQUssQ0FBQyxJQUFJLEdBQUcsRUFBRSxDQUFBOztBQUVsQixVQUFJLE9BQU8sR0FBRztBQUNiLFlBQUksRUFBRSxJQUFJLENBQUMsUUFBUTtBQUNmLGFBQUssRUFBRSxLQUFLLENBQUMsS0FBSztBQUN0QixpQkFBUyxFQUFFLElBQUk7QUFDZixZQUFJLEVBQUUsSUFBSTtBQUNWLGdCQUFRLEVBQUUsQ0FBQyxLQUFLLENBQUM7T0FDakIsQ0FBQTs7QUFFRSxhQUFPLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxHQUFHLElBQUksQ0FBQTs7QUFFN0IsVUFBRyxHQUFHLEVBQUM7QUFDTCxlQUFPLENBQUMsR0FBRyxHQUFHLEdBQUcsQ0FBQTtPQUNsQjs7QUFFRCxVQUFHLEtBQUssQ0FBQyxJQUFJLElBQUksU0FBUyxFQUFDO0FBQ3pCLFlBQUksSUFBSSxHQUFHLEtBQUssQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDLElBQUksS0FBSyxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUE7QUFDdkQsWUFBSSxJQUFJLEdBQUcsbUJBQVEsSUFBSSxDQUFDLENBQUE7QUFDeEIsWUFBSSxDQUFDLGNBQWMsQ0FBQyxjQUFjLENBQUMsR0FBRyxJQUFJLENBQUE7QUFDMUMsZUFBTyxDQUFDLElBQUksR0FBRyxJQUFJLENBQUE7QUFDbkIsZUFBTyxDQUFDLE9BQU8sR0FBRyxJQUFJLENBQUE7QUFDdEIsYUFBSyxDQUFDLE9BQU8sR0FBRyxJQUFJLENBQUE7T0FDckI7O0FBRUQsY0FBUSxHQUFHLFFBQVEsQ0FBQyxLQUFLLENBQUMsR0FBRyxPQUFPLENBQUE7S0FFdkMsTUFBTSxJQUFHLFFBQVEsRUFBRTtBQUNuQixjQUFRLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxpQkFBTSxLQUFLLENBQUMsQ0FBQyxDQUFBO0FBQ3BDLFdBQUssQ0FBQyxjQUFjLEdBQUcsSUFBSSxDQUFBO0tBQzNCOztBQUVELFNBQUssR0FBRyxLQUFLLEdBQUcsQ0FBQyxDQUFBO0dBQ2pCLENBQUMsQ0FBQTs7QUFFRCxVQUFRLENBQUMsR0FBRyxDQUFDLE9BQU8sR0FBRyxJQUFJLENBQUE7QUFDNUIsVUFBUSxDQUFDLEdBQUcsQ0FBQyxRQUFRLEdBQUcsUUFBUSxDQUFDLE1BQU0sQ0FBQyxVQUFBLEtBQUs7V0FBSSxDQUFDLEtBQUssQ0FBQyxjQUFjO0dBQUEsQ0FBQyxDQUFBO0NBQ3ZFOztBQUVELFNBQVMsZ0JBQWdCLENBQUUsUUFBUSxFQUFDO0FBQ2xDLE1BQUksUUFBUSxHQUFHLFFBQVEsQ0FBQyxHQUFHLENBQUMsUUFBUSxDQUFBO0FBQ3BDLE1BQUksUUFBUSxZQUFBLENBQUE7O0FBRVosVUFBUSxDQUFDLE9BQU8sQ0FBQyxVQUFBLEtBQUssRUFBSTtBQUN4QixRQUFJLElBQUksR0FBRyxLQUFLLENBQUMsSUFBSSxJQUFJLEtBQUssQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFBO0FBQzVDLFFBQUcsSUFBSSxLQUFLLFNBQVMsRUFBQztBQUNwQixjQUFRLEdBQUcsS0FBSyxDQUFBO0FBQ2hCLFdBQUssQ0FBQyxLQUFLLEdBQUcsSUFBSSxDQUFBO0FBQ2xCLFdBQUssQ0FBQyxPQUFPLEdBQUcsSUFBSSxDQUFBO0tBQ3JCOztBQUVELFFBQUcsUUFBUSxJQUFJLElBQUksS0FBSyxTQUFTLEVBQUM7QUFDaEMsVUFBSSxNQUFNLEdBQUcsaUJBQU0sS0FBSyxDQUFDLENBQUE7QUFDekIsWUFBTSxDQUFDLE1BQU0sR0FBRyxRQUFRLENBQUMsSUFBSSxDQUFBO0FBQzdCLGNBQVEsQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFBO0FBQzlCLFdBQUssQ0FBQyxhQUFhLEdBQUcsSUFBSSxDQUFBO0tBQzNCO0dBQ0YsQ0FBQyxDQUFBOztBQUVGLFVBQVEsQ0FBQyxHQUFHLENBQUMsUUFBUSxHQUFHLFFBQVEsQ0FBQyxNQUFNLENBQUMsVUFBQSxLQUFLO1dBQUksQ0FBQyxLQUFLLENBQUMsYUFBYTtHQUFBLENBQUMsQ0FBQTtDQUN2RTs7QUFFRCxTQUFTLFlBQVksQ0FBRSxRQUFRLEVBQUU7QUFDL0IsVUFBUSxDQUFDLEdBQUcsQ0FBQyxRQUFRLEdBQUcsQ0FBQztBQUN2QixRQUFJLEVBQUUsU0FBUztBQUNmLFFBQUksRUFBQztBQUNILGNBQVEsRUFBRSxNQUFNO0FBQ2hCLG9CQUFjLEVBQUM7QUFDYixlQUFPLEVBQUUsZ0JBQWdCO09BQzFCO0tBQ0Y7QUFDRCxZQUFRLEVBQUUsUUFBUSxDQUFDLEdBQUcsQ0FBQyxRQUFRO0dBQ2hDLENBQUMsQ0FBQTtDQUNIIiwiZmlsZSI6InJlbmRlci5qcyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCBtZGFzdCBmcm9tICdtZGFzdCdcbmltcG9ydCB5YW1sIGZyb20gJ21kYXN0LXlhbWwnXG5pbXBvcnQgaHRtbCBmcm9tICdtZGFzdC1odG1sJ1xuaW1wb3J0IGZzIGZyb20gJ2ZzJ1xuaW1wb3J0IHNxdWVlemUgZnJvbSAnbWRhc3Qtc3F1ZWV6ZS1wYXJhZ3JhcGhzJ1xuaW1wb3J0IG5vcm1hbGl6ZSBmcm9tICdtZGFzdC1ub3JtYWxpemUtaGVhZGluZ3MnIFxuaW1wb3J0IHZpc2l0IGZyb20gJ3VuaXN0LXV0aWwtdmlzaXQnXG5pbXBvcnQgY2hlZXJpbyBmcm9tICdjaGVlcmlvJ1xuaW1wb3J0IHtjbG9uZSxzbHVnaWZ5fSBmcm9tICcuL3V0aWwnXG5cbmNvbnN0IHByb2Nlc3NvciA9IG1kYXN0LnVzZShbeWFtbCxzcXVlZXplLG5vcm1hbGl6ZSxodG1sXSlcblxuZXhwb3J0IGZ1bmN0aW9uIG1hcmtkb3duKCl7XG4gIHJldHVybiBwcm9jZXNzb3Jcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHBhcnNlKGRvY3VtZW50KSB7XG4gIGxldCBwYXJzZWQgPSBwcm9jZXNzb3IucGFyc2UoZG9jdW1lbnQuY29udGVudCksXG4gICAgICBub2RlcyAgPSBwYXJzZWQuY2hpbGRyZW5cbiAgXG4gIGlmKG5vZGVzWzBdICYmIG5vZGVzWzBdLnlhbWwpe1xuICAgIGRvY3VtZW50LmRhdGEgPSBub2Rlcy5zaGlmdCgpLnlhbWxcbiAgfVxuICBcbiAgbGV0IGFzdCA9IHByb2Nlc3Nvci5ydW4ocGFyc2VkKVxuXG4gIGRvY3VtZW50LnJ1bkhvb2soXCJkb2N1bWVudERpZFBhcnNlXCIsIGFzdClcblxuICByZXR1cm4gYXN0IFxufVxuXG5leHBvcnQgZnVuY3Rpb24gcHJvY2Vzcyhkb2N1bWVudCkge1xuICBkb2N1bWVudC5jb250ZW50ID0gcmVhZFBhdGgoZG9jdW1lbnQucGF0aClcblxuICBkb2N1bWVudC5hc3QgPSBwYXJzZShkb2N1bWVudClcbiAgZG9jdW1lbnQucnVuSG9vayhcImRvY3VtZW50V2lsbFJlbmRlclwiLCBkb2N1bWVudC5hc3QpXG4gIFxuICBuZXN0RWxlbWVudHMoZG9jdW1lbnQpXG4gIGNvbGxhcHNlU2VjdGlvbnMoZG9jdW1lbnQpXG4gIGFwcGx5V3JhcHBlcihkb2N1bWVudClcblxuICBkb2N1bWVudC5odG1sID0gc3RyaW5naWZ5KGRvY3VtZW50LmFzdClcbiAgZG9jdW1lbnQuJCA9IGZ1bmN0aW9uKHNlbGVjdG9yKXtcbiAgICByZXR1cm4gY2hlZXJpby5sb2FkKGRvY3VtZW50Lmh0bWwpKHNlbGVjdG9yKVxuICB9XG5cbiAgZG9jdW1lbnQucnVuSG9vayhcImRvY3VtZW50RGlkUmVuZGVyXCIsIGRvY3VtZW50Lmh0bWwpXG5cbiAgcmV0dXJuIGRvY3VtZW50XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBmcmFnbWVudChhc3QsIG9wdGlvbnM9e30pIHtcbiAgcmV0dXJuIHN0cmluZ2lmeSh7XG4gICAgdHlwZTogJ3Jvb3QnLFxuICAgIGNoaWxkcmVuOiBbYXN0XVxuICB9KVxufVxuXG5leHBvcnQgZnVuY3Rpb24gc3RyaW5naWZ5KGFzdCwgb3B0aW9ucz17fSkge1xuICByZXR1cm4gcHJvY2Vzc29yLnN0cmluZ2lmeShhc3QsIG9wdGlvbnMpXG59XG5cbmZ1bmN0aW9uIHJlYWRQYXRoKHBhdGgpIHtcbiAgcmV0dXJuIGZzLnJlYWRGaWxlU3luYyhwYXRoKS50b1N0cmluZygpXG59XG5cbmZ1bmN0aW9uIG5lc3RFbGVtZW50cyhkb2N1bWVudCkge1xuICBsZXQgY2hpbGRyZW4gPSBkb2N1bWVudC5hc3QuY2hpbGRyZW5cbiAgbGV0IGhlYWRpbmdzID0gZG9jdW1lbnQuYXN0LmNoaWxkcmVuLmZpbHRlcihjID0+IGMudHlwZSA9PT0gXCJoZWFkaW5nXCIpXG5cdFxuXHRsZXQgaW5kZXggPSAwXG5cdGxldCBwcmV2aW91c1xuICBsZXQgdG9wXG5cblx0Y2hpbGRyZW4uZm9yRWFjaChjaGlsZCA9PiB7XG5cdFx0bGV0IGRhdGEgPSBjaGlsZC5kYXRhIFxuICAgIFxuXHRcdGlmKGNoaWxkLnR5cGUgPT09IFwiaGVhZGluZ1wiKXtcblx0XHRcdGRlbGV0ZShjaGlsZC5kYXRhKVxuICAgICAgdG9wID0gZmFsc2VcbiAgICAgIGRhdGEgPSBkYXRhIHx8IHt9XG4gICAgICBkYXRhLmh0bWxOYW1lID0gXCJzZWN0aW9uXCJcbiAgICAgIGRhdGEuaHRtbEF0dHJpYnV0ZXMgPSBkYXRhLmh0bWxBdHRyaWJ1dGVzIHx8IHt9XG4gICAgICBcbiAgICAgIGlmKGNoaWxkLmRlcHRoID09IDEgJiYgIXRvcCl7XG4gICAgICAgIHRvcCA9IHRydWVcbiAgICAgICAgZGF0YS5odG1sQXR0cmlidXRlc1snZGF0YS10b3AnXSA9IHRydWVcbiAgICAgIH1cbiAgICAgICAgXG4gICAgICBpZihjaGlsZC5kZXB0aCA+PSAzKXtcbiAgICAgICAgZGF0YS5odG1sTmFtZSA9IFwiYXJ0aWNsZVwiXG4gICAgICB9XG4gICAgICBcbiAgICAgIGNoaWxkLmRhdGEgPSB7fVxuXG5cdFx0XHRsZXQgd3JhcHBlZCA9IHtcblx0XHRcdFx0dHlwZTogZGF0YS5odG1sTmFtZSxcbiAgICAgICAgZGVwdGg6IGNoaWxkLmRlcHRoLFxuXHRcdFx0XHRjb250YWluZXI6IHRydWUsXG5cdFx0XHRcdGRhdGE6IGRhdGEsXG5cdFx0XHRcdGNoaWxkcmVuOiBbY2hpbGRdXG5cdFx0XHR9XG4gICAgICBcbiAgICAgIHdyYXBwZWRbZGF0YS5odG1sTmFtZV0gPSB0cnVlIFxuXG4gICAgICBpZih0b3Ape1xuICAgICAgICB3cmFwcGVkLnRvcCA9IHRvcFxuICAgICAgfVxuXG4gICAgICBpZihjaGlsZC50eXBlID09IFwiaGVhZGluZ1wiKXtcbiAgICAgICAgbGV0IHRleHQgPSBjaGlsZC5jaGlsZHJlblswXSAmJiBjaGlsZC5jaGlsZHJlblswXS52YWx1ZVxuICAgICAgICBsZXQgc2x1ZyA9IHNsdWdpZnkodGV4dCkgXG4gICAgICAgIGRhdGEuaHRtbEF0dHJpYnV0ZXNbJ2RhdGEtaGVhZGluZyddID0gc2x1Z1xuICAgICAgICB3cmFwcGVkLnNsdWcgPSBzbHVnXG4gICAgICAgIHdyYXBwZWQuaGVhZGluZyA9IHRleHRcbiAgICAgICAgY2hpbGQuaGVhZGluZyA9IHRleHRcbiAgICAgIH1cblxuICAgICAgcHJldmlvdXMgPSBjaGlsZHJlbltpbmRleF0gPSB3cmFwcGVkXG5cblx0XHR9IGVsc2UgaWYocHJldmlvdXMpIHtcblx0XHRcdHByZXZpb3VzLmNoaWxkcmVuLnB1c2goY2xvbmUoY2hpbGQpKVxuXHRcdFx0Y2hpbGQubWFya0ZvclJlbW92YWwgPSB0cnVlXG5cdFx0fVxuXG5cdFx0aW5kZXggPSBpbmRleCArIDFcblx0fSlcbiAgXG4gIGRvY3VtZW50LmFzdC53cmFwcGVkID0gdHJ1ZVxuXHRkb2N1bWVudC5hc3QuY2hpbGRyZW4gPSBjaGlsZHJlbi5maWx0ZXIoY2hpbGQgPT4gIWNoaWxkLm1hcmtGb3JSZW1vdmFsKVxufVxuXG5mdW5jdGlvbiBjb2xsYXBzZVNlY3Rpb25zIChkb2N1bWVudCl7XG4gIGxldCBjaGlsZHJlbiA9IGRvY3VtZW50LmFzdC5jaGlsZHJlblxuICBsZXQgcHJldmlvdXNcbiAgIFxuICBjaGlsZHJlbi5mb3JFYWNoKGNoaWxkID0+IHtcbiAgICBsZXQgbmFtZSA9IGNoaWxkLmRhdGEgJiYgY2hpbGQuZGF0YS5odG1sTmFtZVxuICAgIGlmKG5hbWUgPT09IFwic2VjdGlvblwiKXtcbiAgICAgIHByZXZpb3VzID0gY2hpbGRcbiAgICAgIGNoaWxkLmRlYnVnID0gdHJ1ZVxuICAgICAgY2hpbGQuc2VjdGlvbiA9IHRydWVcbiAgICB9XG5cbiAgICBpZihwcmV2aW91cyAmJiBuYW1lID09PSBcImFydGljbGVcIil7XG4gICAgICBsZXQgY2xvbmVkID0gY2xvbmUoY2hpbGQpXG4gICAgICBjbG9uZWQucGFyZW50ID0gcHJldmlvdXMuc2x1Z1xuICAgICAgcHJldmlvdXMuY2hpbGRyZW4ucHVzaChjbG9uZWQpXG4gICAgICBjaGlsZC5tYXJrRm9yRGVsZXRlID0gdHJ1ZVxuICAgIH1cbiAgfSlcblxuICBkb2N1bWVudC5hc3QuY2hpbGRyZW4gPSBjaGlsZHJlbi5maWx0ZXIoY2hpbGQgPT4gIWNoaWxkLm1hcmtGb3JEZWxldGUpXG59XG5cbmZ1bmN0aW9uIGFwcGx5V3JhcHBlciAoZG9jdW1lbnQpIHtcbiAgZG9jdW1lbnQuYXN0LmNoaWxkcmVuID0gW3sgXG4gICAgdHlwZTogXCJ1bmtub3duXCIsXG4gICAgZGF0YTp7XG4gICAgICBodG1sTmFtZTogXCJtYWluXCIsXG4gICAgICBodG1sQXR0cmlidXRlczp7XG4gICAgICAgIFwiY2xhc3NcIjogXCJicmllZi1kb2N1bWVudFwiXG4gICAgICB9XG4gICAgfSxcbiAgICBjaGlsZHJlbjogZG9jdW1lbnQuYXN0LmNoaWxkcmVuXG4gIH1dXG59XG4iXX0=