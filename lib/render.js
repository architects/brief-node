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

var _underscoreString = require('underscore.string');

var _underscoreString2 = _interopRequireDefault(_underscoreString);

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

function process(document, briefcase) {
  document.content = readPath(document.path);

  document.ast = parse(document);
  document.runHook("documentWillRender", document.ast);

  resolveLinks(document, briefcase);
  nestElements(document);
  collapseSections(document);
  applyWrapper(document);

  Object.defineProperty(document, 'html', {
    configurable: true,
    get: function get() {
      processLinks(document, briefcase);
      return stringify(document.ast);
    }
  });

  document.$ = function (selector) {
    return _cheerio2['default'].load(document.html)(selector);
  };

  document.runHook("documentDidRender", document);

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

function resolveLinks(document, briefcase) {
  if (!briefcase) {
    return;
  }

  (0, _unistUtilVisit2['default'])(document.ast, 'link', function (node) {
    var pathAlias = node.href;

    var children = node.children || [];
    var textNode = node.children.find(function (node) {
      return node.type === 'text';
    });

    if (textNode && textNode.value.match(/link\:/)) {
      node.href = briefcase.resolveLink(pathAlias);
      node.htmlAttributes = node.htmlAttributes || {};
      node.htmlAttributes['data-link-to'] = pathAlias;
    }
  });
}

function processLinks(document, briefcase) {
  (0, _unistUtilVisit2['default'])(document.ast, 'link', function (node) {
    if (node.htmlAttributes && node.htmlAttributes['data-link-to']) {
      var linkedDocument = briefcase.at(node.htmlAttributes['data-link-to']);
      var textNode = node.children.find(function (node) {
        return node.type === 'text';
      });

      if (textNode && textNode.value.match(/link\:/)) {
        textNode.value = _underscoreString2['default'].strip(textNode.value.replace(/link\:/, ''));

        if (linkedDocument && textNode.value === 'title') {
          textNode.value = linkedDocument.title;
        }
      }
    }
  });
}
//# sourceMappingURL=data:application/json;base64,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QWMsQ0FBQyxjQUFjLENBQUMsRUFBQztBQUM1RCxVQUFJLGNBQWMsR0FBRyxTQUFTLENBQUMsRUFBRSxDQUFDLElBQUksQ0FBQyxjQUFjLENBQUMsY0FBYyxDQUFDLENBQUMsQ0FBQTtBQUN0RSxVQUFJLFFBQVEsR0FBRyxJQUFJLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxVQUFBLElBQUk7ZUFBSSxJQUFJLENBQUMsSUFBSSxLQUFLLE1BQU07T0FBQSxDQUFDLENBQUE7O0FBRS9ELFVBQUcsUUFBUSxJQUFJLFFBQVEsQ0FBQyxLQUFLLENBQUMsS0FBSyxDQUFDLFFBQVEsQ0FBQyxFQUFDO0FBQzVDLGdCQUFRLENBQUMsS0FBSyxHQUFHLDhCQUFRLEtBQUssQ0FBQyxRQUFRLENBQUMsS0FBSyxDQUFDLE9BQU8sQ0FBQyxRQUFRLEVBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQTs7QUFFbkUsWUFBRyxjQUFjLElBQUksUUFBUSxDQUFDLEtBQUssS0FBSyxPQUFPLEVBQUM7QUFDOUMsa0JBQVEsQ0FBQyxLQUFLLEdBQUcsY0FBYyxDQUFDLEtBQUssQ0FBQTtTQUN0QztPQUNGO0tBQ0Y7R0FDRixDQUFDLENBQUE7Q0FDSCIsImZpbGUiOiJyZW5kZXIuanMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgbWRhc3QgZnJvbSAnbWRhc3QnXG5pbXBvcnQgeWFtbCBmcm9tICdtZGFzdC15YW1sJ1xuaW1wb3J0IGh0bWwgZnJvbSAnbWRhc3QtaHRtbCdcbmltcG9ydCBmcyBmcm9tICdmcydcbmltcG9ydCBzcXVlZXplIGZyb20gJ21kYXN0LXNxdWVlemUtcGFyYWdyYXBocydcbmltcG9ydCBub3JtYWxpemUgZnJvbSAnbWRhc3Qtbm9ybWFsaXplLWhlYWRpbmdzJyBcbmltcG9ydCB2aXNpdCBmcm9tICd1bmlzdC11dGlsLXZpc2l0J1xuaW1wb3J0IGNoZWVyaW8gZnJvbSAnY2hlZXJpbydcbmltcG9ydCB7Y2xvbmUsc2x1Z2lmeX0gZnJvbSAnLi91dGlsJ1xuaW1wb3J0IHN0cmluZ3MgZnJvbSAndW5kZXJzY29yZS5zdHJpbmcnXG5cbmNvbnN0IHByb2Nlc3NvciA9IG1kYXN0LnVzZShbeWFtbCxzcXVlZXplLG5vcm1hbGl6ZSxodG1sXSlcblxuZXhwb3J0IGZ1bmN0aW9uIG1hcmtkb3duKCl7XG4gIHJldHVybiBwcm9jZXNzb3Jcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHBhcnNlKGRvY3VtZW50KSB7XG4gIGxldCBwYXJzZWQgPSBwcm9jZXNzb3IucGFyc2UoZG9jdW1lbnQuY29udGVudCksXG4gICAgICBub2RlcyAgPSBwYXJzZWQuY2hpbGRyZW5cbiAgXG4gIGlmKG5vZGVzWzBdICYmIG5vZGVzWzBdLnlhbWwpe1xuICAgIGRvY3VtZW50LmRhdGEgPSBub2Rlcy5zaGlmdCgpLnlhbWxcbiAgfVxuICBcbiAgbGV0IGFzdCA9IHByb2Nlc3Nvci5ydW4ocGFyc2VkKVxuXG4gIGRvY3VtZW50LnJ1bkhvb2soXCJkb2N1bWVudERpZFBhcnNlXCIsIGFzdClcblxuICByZXR1cm4gYXN0IFxufVxuXG5leHBvcnQgZnVuY3Rpb24gcHJvY2Vzcyhkb2N1bWVudCwgYnJpZWZjYXNlKSB7XG4gIGRvY3VtZW50LmNvbnRlbnQgPSByZWFkUGF0aChkb2N1bWVudC5wYXRoKVxuXG4gIGRvY3VtZW50LmFzdCA9IHBhcnNlKGRvY3VtZW50KVxuICBkb2N1bWVudC5ydW5Ib29rKFwiZG9jdW1lbnRXaWxsUmVuZGVyXCIsIGRvY3VtZW50LmFzdClcbiAgXG4gIHJlc29sdmVMaW5rcyhkb2N1bWVudCwgYnJpZWZjYXNlKVxuICBuZXN0RWxlbWVudHMoZG9jdW1lbnQpXG4gIGNvbGxhcHNlU2VjdGlvbnMoZG9jdW1lbnQpXG4gIGFwcGx5V3JhcHBlcihkb2N1bWVudClcblxuICBPYmplY3QuZGVmaW5lUHJvcGVydHkoZG9jdW1lbnQsICdodG1sJywge1xuICAgIGNvbmZpZ3VyYWJsZTogdHJ1ZSxcbiAgICBnZXQ6IGZ1bmN0aW9uKCl7XG4gICAgICBwcm9jZXNzTGlua3MoZG9jdW1lbnQsIGJyaWVmY2FzZSlcbiAgICAgIHJldHVybiBzdHJpbmdpZnkoZG9jdW1lbnQuYXN0KVxuICAgIH1cbiAgfSlcblxuICBkb2N1bWVudC4kID0gZnVuY3Rpb24oc2VsZWN0b3Ipe1xuICAgIHJldHVybiBjaGVlcmlvLmxvYWQoZG9jdW1lbnQuaHRtbCkoc2VsZWN0b3IpXG4gIH1cblxuICBkb2N1bWVudC5ydW5Ib29rKFwiZG9jdW1lbnREaWRSZW5kZXJcIiwgZG9jdW1lbnQpXG5cbiAgcmV0dXJuIGRvY3VtZW50XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBmcmFnbWVudChhc3QsIG9wdGlvbnM9e30pIHtcbiAgcmV0dXJuIHN0cmluZ2lmeSh7XG4gICAgdHlwZTogJ3Jvb3QnLFxuICAgIGNoaWxkcmVuOiBbYXN0XVxuICB9KVxufVxuXG5leHBvcnQgZnVuY3Rpb24gc3RyaW5naWZ5KGFzdCwgb3B0aW9ucz17fSkge1xuICByZXR1cm4gcHJvY2Vzc29yLnN0cmluZ2lmeShhc3QsIG9wdGlvbnMpXG59XG5cbmZ1bmN0aW9uIHJlYWRQYXRoKHBhdGgpIHtcbiAgcmV0dXJuIGZzLnJlYWRGaWxlU3luYyhwYXRoKS50b1N0cmluZygpXG59XG5cbmZ1bmN0aW9uIG5lc3RFbGVtZW50cyhkb2N1bWVudCkge1xuICBsZXQgY2hpbGRyZW4gPSBkb2N1bWVudC5hc3QuY2hpbGRyZW5cbiAgbGV0IGhlYWRpbmdzID0gZG9jdW1lbnQuYXN0LmNoaWxkcmVuLmZpbHRlcihjID0+IGMudHlwZSA9PT0gXCJoZWFkaW5nXCIpXG5cdFxuXHRsZXQgaW5kZXggPSAwXG5cdGxldCBwcmV2aW91c1xuICBsZXQgdG9wXG5cblx0Y2hpbGRyZW4uZm9yRWFjaChjaGlsZCA9PiB7XG5cdFx0bGV0IGRhdGEgPSBjaGlsZC5kYXRhIFxuICAgIFxuXHRcdGlmKGNoaWxkLnR5cGUgPT09IFwiaGVhZGluZ1wiKXtcblx0XHRcdGRlbGV0ZShjaGlsZC5kYXRhKVxuICAgICAgdG9wID0gZmFsc2VcbiAgICAgIGRhdGEgPSBkYXRhIHx8IHt9XG4gICAgICBkYXRhLmh0bWxOYW1lID0gXCJzZWN0aW9uXCJcbiAgICAgIGRhdGEuaHRtbEF0dHJpYnV0ZXMgPSBkYXRhLmh0bWxBdHRyaWJ1dGVzIHx8IHt9XG4gICAgICBcbiAgICAgIGlmKGNoaWxkLmRlcHRoID09IDEgJiYgIXRvcCl7XG4gICAgICAgIHRvcCA9IHRydWVcbiAgICAgICAgZGF0YS5odG1sQXR0cmlidXRlc1snZGF0YS10b3AnXSA9IHRydWVcbiAgICAgIH1cbiAgICAgICAgXG4gICAgICBpZihjaGlsZC5kZXB0aCA+PSAzKXtcbiAgICAgICAgZGF0YS5odG1sTmFtZSA9IFwiYXJ0aWNsZVwiXG4gICAgICB9XG4gICAgICBcbiAgICAgIGNoaWxkLmRhdGEgPSB7fVxuXG5cdFx0XHRsZXQgd3JhcHBlZCA9IHtcblx0XHRcdFx0dHlwZTogZGF0YS5odG1sTmFtZSxcbiAgICAgICAgZGVwdGg6IGNoaWxkLmRlcHRoLFxuXHRcdFx0XHRjb250YWluZXI6IHRydWUsXG5cdFx0XHRcdGRhdGE6IGRhdGEsXG5cdFx0XHRcdGNoaWxkcmVuOiBbY2hpbGRdXG5cdFx0XHR9XG4gICAgICBcbiAgICAgIHdyYXBwZWRbZGF0YS5odG1sTmFtZV0gPSB0cnVlIFxuXG4gICAgICBpZih0b3Ape1xuICAgICAgICB3cmFwcGVkLnRvcCA9IHRvcFxuICAgICAgfVxuXG4gICAgICBpZihjaGlsZC50eXBlID09IFwiaGVhZGluZ1wiKXtcbiAgICAgICAgbGV0IHRleHQgPSBjaGlsZC5jaGlsZHJlblswXSAmJiBjaGlsZC5jaGlsZHJlblswXS52YWx1ZVxuICAgICAgICBsZXQgc2x1ZyA9IHNsdWdpZnkodGV4dCkgXG4gICAgICAgIGRhdGEuaHRtbEF0dHJpYnV0ZXNbJ2RhdGEtaGVhZGluZyddID0gc2x1Z1xuICAgICAgICB3cmFwcGVkLnNsdWcgPSBzbHVnXG4gICAgICAgIHdyYXBwZWQuaGVhZGluZyA9IHRleHRcbiAgICAgICAgY2hpbGQuaGVhZGluZyA9IHRleHRcbiAgICAgIH1cblxuICAgICAgcHJldmlvdXMgPSBjaGlsZHJlbltpbmRleF0gPSB3cmFwcGVkXG5cblx0XHR9IGVsc2UgaWYocHJldmlvdXMpIHtcblx0XHRcdHByZXZpb3VzLmNoaWxkcmVuLnB1c2goY2xvbmUoY2hpbGQpKVxuXHRcdFx0Y2hpbGQubWFya0ZvclJlbW92YWwgPSB0cnVlXG5cdFx0fVxuXG5cdFx0aW5kZXggPSBpbmRleCArIDFcblx0fSlcbiAgXG4gIGRvY3VtZW50LmFzdC53cmFwcGVkID0gdHJ1ZVxuXHRkb2N1bWVudC5hc3QuY2hpbGRyZW4gPSBjaGlsZHJlbi5maWx0ZXIoY2hpbGQgPT4gIWNoaWxkLm1hcmtGb3JSZW1vdmFsKVxufVxuXG5mdW5jdGlvbiBjb2xsYXBzZVNlY3Rpb25zIChkb2N1bWVudCl7XG4gIGxldCBjaGlsZHJlbiA9IGRvY3VtZW50LmFzdC5jaGlsZHJlblxuICBsZXQgcHJldmlvdXNcbiAgIFxuICBjaGlsZHJlbi5mb3JFYWNoKGNoaWxkID0+IHtcbiAgICBsZXQgbmFtZSA9IGNoaWxkLmRhdGEgJiYgY2hpbGQuZGF0YS5odG1sTmFtZVxuICAgIGlmKG5hbWUgPT09IFwic2VjdGlvblwiKXtcbiAgICAgIHByZXZpb3VzID0gY2hpbGRcbiAgICAgIGNoaWxkLmRlYnVnID0gdHJ1ZVxuICAgICAgY2hpbGQuc2VjdGlvbiA9IHRydWVcbiAgICB9XG5cbiAgICBpZihwcmV2aW91cyAmJiBuYW1lID09PSBcImFydGljbGVcIil7XG4gICAgICBsZXQgY2xvbmVkID0gY2xvbmUoY2hpbGQpXG4gICAgICBjbG9uZWQucGFyZW50ID0gcHJldmlvdXMuc2x1Z1xuICAgICAgcHJldmlvdXMuY2hpbGRyZW4ucHVzaChjbG9uZWQpXG4gICAgICBjaGlsZC5tYXJrRm9yRGVsZXRlID0gdHJ1ZVxuICAgIH1cbiAgfSlcblxuICBkb2N1bWVudC5hc3QuY2hpbGRyZW4gPSBjaGlsZHJlbi5maWx0ZXIoY2hpbGQgPT4gIWNoaWxkLm1hcmtGb3JEZWxldGUpXG59XG5cbmZ1bmN0aW9uIGFwcGx5V3JhcHBlciAoZG9jdW1lbnQpIHtcbiAgZG9jdW1lbnQuYXN0LmNoaWxkcmVuID0gW3sgXG4gICAgdHlwZTogXCJ1bmtub3duXCIsXG4gICAgZGF0YTp7XG4gICAgICBodG1sTmFtZTogXCJtYWluXCIsXG4gICAgICBodG1sQXR0cmlidXRlczp7XG4gICAgICAgIFwiY2xhc3NcIjogXCJicmllZi1kb2N1bWVudFwiXG4gICAgICB9XG4gICAgfSxcbiAgICBjaGlsZHJlbjogZG9jdW1lbnQuYXN0LmNoaWxkcmVuXG4gIH1dXG59XG5cbmZ1bmN0aW9uIHJlc29sdmVMaW5rcyhkb2N1bWVudCwgYnJpZWZjYXNlKXtcbiAgaWYoIWJyaWVmY2FzZSl7IHJldHVybiB9XG5cbiAgdmlzaXQoZG9jdW1lbnQuYXN0LCAnbGluaycsIGZ1bmN0aW9uKG5vZGUpe1xuICAgIGxldCBwYXRoQWxpYXMgPSBub2RlLmhyZWZcblxuICAgIGxldCBjaGlsZHJlbiA9IG5vZGUuY2hpbGRyZW4gfHwgW11cbiAgICBsZXQgdGV4dE5vZGUgPSBub2RlLmNoaWxkcmVuLmZpbmQobm9kZSA9PiBub2RlLnR5cGUgPT09ICd0ZXh0JylcblxuICAgIGlmKHRleHROb2RlICYmIHRleHROb2RlLnZhbHVlLm1hdGNoKC9saW5rXFw6Lykpe1xuICAgICAgbm9kZS5ocmVmID0gYnJpZWZjYXNlLnJlc29sdmVMaW5rKHBhdGhBbGlhcylcbiAgICAgIG5vZGUuaHRtbEF0dHJpYnV0ZXMgPSBub2RlLmh0bWxBdHRyaWJ1dGVzIHx8IHt9XG4gICAgICBub2RlLmh0bWxBdHRyaWJ1dGVzWydkYXRhLWxpbmstdG8nXSA9IHBhdGhBbGlhc1xuICAgIH1cbiAgfSlcbn1cblxuZnVuY3Rpb24gcHJvY2Vzc0xpbmtzKGRvY3VtZW50LCBicmllZmNhc2Upe1xuICB2aXNpdChkb2N1bWVudC5hc3QsICdsaW5rJywgZnVuY3Rpb24obm9kZSl7XG4gICAgaWYobm9kZS5odG1sQXR0cmlidXRlcyAmJiBub2RlLmh0bWxBdHRyaWJ1dGVzWydkYXRhLWxpbmstdG8nXSl7XG4gICAgICBsZXQgbGlua2VkRG9jdW1lbnQgPSBicmllZmNhc2UuYXQobm9kZS5odG1sQXR0cmlidXRlc1snZGF0YS1saW5rLXRvJ10pXG4gICAgICBsZXQgdGV4dE5vZGUgPSBub2RlLmNoaWxkcmVuLmZpbmQobm9kZSA9PiBub2RlLnR5cGUgPT09ICd0ZXh0JylcblxuICAgICAgaWYodGV4dE5vZGUgJiYgdGV4dE5vZGUudmFsdWUubWF0Y2goL2xpbmtcXDovKSl7XG4gICAgICAgIHRleHROb2RlLnZhbHVlID0gc3RyaW5ncy5zdHJpcCh0ZXh0Tm9kZS52YWx1ZS5yZXBsYWNlKC9saW5rXFw6LywnJykpXG5cbiAgICAgICAgaWYobGlua2VkRG9jdW1lbnQgJiYgdGV4dE5vZGUudmFsdWUgPT09ICd0aXRsZScpe1xuICAgICAgICAgIHRleHROb2RlLnZhbHVlID0gbGlua2VkRG9jdW1lbnQudGl0bGVcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cbiAgfSlcbn1cbiJdfQ==