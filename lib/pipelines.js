'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});
exports.process = process;
exports.markdown = markdown;
exports.parse = parse;
exports.fragment = fragment;
exports.stringify = stringify;
exports.readPath = readPath;

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

/** Note
*   This needs to be optimized as there are turning out to be
*   way to many passes over the ast.
*/

// Plugins should be able to tap into this
var pipelines = Object.defineProperties({}, {
  processing: {
    get: function get() {
      return [resolveLinks, nestElements, processCodeBlocks, removeNodes];
    },
    configurable: true,
    enumerable: true
  },
  structuring: {
    get: function get() {
      return [collapseSections, applyWrapper];
    },
    configurable: true,
    enumerable: true
  },
  rendering: {
    get: function get() {
      return [processLinks, renderVisualizations];
    },
    configurable: true,
    enumerable: true
  }
});

/* if any of the nodes have been marked for delete this will remove them and make sure they
* don't get rendered in the output */
function removeNodes(document, briefcase) {
  (0, _unistUtilVisit2['default'])(document.ast, function (node) {
    if (node.children) {
      node.children = node.children.filter(function (child) {
        return !child.markForDelete;
      });
    }
  });
}

/* if code block nodes have been tagged visualizations we need to generate html for their content */
function renderVisualizations(document, briefcase) {
  (0, _unistUtilVisit2['default'])(document.ast, 'unknown', function (node) {
    if (node.visualization) {
      var visualization = require(briefcase.config.views_path + '/' + node.visualization);
      var data = node.yaml || {};
      var _html = visualization(data, document, briefcase);
      var id = node.data.htmlAttributes.id;

      node.children[0].value = _underscoreString2['default'].unescapeHTML(_html);
    }
  });
}

/**
* process a brief document. this involves manipulating 
* the ast from mdast so that our rendered output is nested
* in a hierarchy of main, section, article html tags.
*
* other functions are performed during this operation to
* assist in extracting data from the writing, generating
* links to other documents in the briefcase, and more.
*
*/

function process(document, briefcase) {

  document.ast = parse(document);
  document.runHook("documentWillRender", document.ast);

  // these are broken up because it is easier to transform
  // certain nodes when they aren't deeply nested in the sections
  // we need
  pipelines.processing.forEach(function (fn) {
    return fn(document, briefcase);
  });

  // these are responsible for nesting the flat markdown elements
  // in a more hierarchal structure based on the heading levels and titles
  pipelines.structuring.forEach(function (fn) {
    return fn(document, briefcase);
  });

  Object.defineProperty(document, 'html', {
    configurable: true,
    get: function get() {
      pipelines.rendering.forEach(function (fn) {
        return fn(document, briefcase);
      });

      var html = stringify(document.ast);

      return html;
    }
  });

  document.$ = function (selector) {
    return _cheerio2['default'].load(document.html)(selector);
  };

  document.runHook("documentDidRender", document);

  return document;
}

function markdown() {
  return processor;
}

/** 
* parses a brief document and extracts
* the yaml frontmatter as `document.data`
*
*/

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
        "class": "brief-document",
        "id": document.id
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

    if (textNode && textNode.value.match(/embed\:/)) {
      var asset = briefcase.assets.at(node.href);

      if (asset) {
        node.type = "unknown";
        node.data = {
          htmlAttributes: {
            name: "div"
          }
        };
        node.children = [{
          type: "text",
          value: _underscoreString2['default'].unescapeHTML(asset.content)
        }];
      }
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

function processCodeBlocks(document, briefcase) {
  var index = 0;

  var parser = undefined;

  (0, _unistUtilVisit2['default'])(document.ast, 'code', function (node) {
    var data = node.data = node.data || {};
    var attrs = node.data.htmlAttributes = node.data.htmlAttributes || {};

    attrs.id = attrs.id || "block-" + index;

    if (node.lang === 'yaml' || node.lang === 'yml' || node.lang === 'data') {
      parser = parser || require('js-yaml');

      if (node.value && !node.yaml) {
        try {
          node.yaml = parser.safeLoad(node.value);
        } catch (e) {
          document.log("Error parsing yaml", e.message);
        }
      }

      if (node.lang === 'data' && node.yaml) {
        var key = node.yaml.key;

        if (key) {
          delete node.yaml.key;

          Object.defineProperty(document.data, key, {
            value: node.yaml
          });

          node.yaml.key = key;
          node.markForDelete = true;
        } else {
          document.log("Can't process a data yaml block without a key property");
        }
      }

      // TBD whether we require visualization or view as the key
      if (node.yaml && (node.yaml.visualization || node.view)) {
        node.visualization = node.yaml.visualization || node.view;
        node.type = 'unknown';
        node.children = [{ type: 'text', value: 'VISUALIZATION' }];
      }

      node.lang = 'yaml';
    }

    index = index + 1;
  });
}
//# sourceMappingURL=data:application/json;base64,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QUMsQ0FBQTtPQUN0RDs7QUFFRCxVQUFJLENBQUMsSUFBSSxHQUFHLE1BQU0sQ0FBQTtLQUNuQjs7QUFFRCxTQUFLLEdBQUcsS0FBSyxHQUFHLENBQUMsQ0FBQTtHQUNsQixDQUFDLENBQUE7Q0FDSCIsImZpbGUiOiJwaXBlbGluZXMuanMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgbWRhc3QgZnJvbSAnbWRhc3QnXG5pbXBvcnQgeWFtbCBmcm9tICdtZGFzdC15YW1sJ1xuaW1wb3J0IGh0bWwgZnJvbSAnbWRhc3QtaHRtbCdcbmltcG9ydCBmcyBmcm9tICdmcydcbmltcG9ydCBzcXVlZXplIGZyb20gJ21kYXN0LXNxdWVlemUtcGFyYWdyYXBocydcbmltcG9ydCBub3JtYWxpemUgZnJvbSAnbWRhc3Qtbm9ybWFsaXplLWhlYWRpbmdzJyBcbmltcG9ydCB2aXNpdCBmcm9tICd1bmlzdC11dGlsLXZpc2l0J1xuaW1wb3J0IGNoZWVyaW8gZnJvbSAnY2hlZXJpbydcbmltcG9ydCB7Y2xvbmUsc2x1Z2lmeSxleHRlbmR9IGZyb20gJy4vdXRpbCdcbmltcG9ydCBzdHJpbmdzIGZyb20gJ3VuZGVyc2NvcmUuc3RyaW5nJ1xuXG5jb25zdCBwcm9jZXNzb3IgPSBtZGFzdC51c2UoW3lhbWwsc3F1ZWV6ZSxub3JtYWxpemUsaHRtbF0pXG5cbi8qKiBOb3RlXG4qICAgVGhpcyBuZWVkcyB0byBiZSBvcHRpbWl6ZWQgYXMgdGhlcmUgYXJlIHR1cm5pbmcgb3V0IHRvIGJlXG4qICAgd2F5IHRvIG1hbnkgcGFzc2VzIG92ZXIgdGhlIGFzdC5cbiovXG5cbi8vIFBsdWdpbnMgc2hvdWxkIGJlIGFibGUgdG8gdGFwIGludG8gdGhpc1xubGV0IHBpcGVsaW5lcyA9IHtcbiAgZ2V0IHByb2Nlc3NpbmcoKXtcbiAgICByZXR1cm4gW1xuICAgICAgcmVzb2x2ZUxpbmtzLFxuICAgICAgbmVzdEVsZW1lbnRzLFxuICAgICAgcHJvY2Vzc0NvZGVCbG9ja3MsXG4gICAgICByZW1vdmVOb2Rlc1xuICAgIF0gXG4gIH0sXG4gIFxuICBnZXQgc3RydWN0dXJpbmcoKXtcbiAgICByZXR1cm4gW1xuICAgICAgY29sbGFwc2VTZWN0aW9ucyxcbiAgICAgIGFwcGx5V3JhcHBlclxuICAgIF1cbiAgfSxcblxuICBnZXQgcmVuZGVyaW5nKCl7XG4gICAgcmV0dXJuIFtcbiAgICAgIHByb2Nlc3NMaW5rcyxcbiAgICAgIHJlbmRlclZpc3VhbGl6YXRpb25zXG4gICAgXVxuICB9XG59XG5cbi8qIGlmIGFueSBvZiB0aGUgbm9kZXMgaGF2ZSBiZWVuIG1hcmtlZCBmb3IgZGVsZXRlIHRoaXMgd2lsbCByZW1vdmUgdGhlbSBhbmQgbWFrZSBzdXJlIHRoZXlcbiogZG9uJ3QgZ2V0IHJlbmRlcmVkIGluIHRoZSBvdXRwdXQgKi9cbmZ1bmN0aW9uIHJlbW92ZU5vZGVzKGRvY3VtZW50LCBicmllZmNhc2Upe1xuICB2aXNpdChkb2N1bWVudC5hc3QsIG5vZGUgPT4ge1xuICAgIGlmKG5vZGUuY2hpbGRyZW4peyBub2RlLmNoaWxkcmVuID0gbm9kZS5jaGlsZHJlbi5maWx0ZXIoY2hpbGQgPT4gIWNoaWxkLm1hcmtGb3JEZWxldGUpIH1cbiAgfSlcbn1cblxuLyogaWYgY29kZSBibG9jayBub2RlcyBoYXZlIGJlZW4gdGFnZ2VkIHZpc3VhbGl6YXRpb25zIHdlIG5lZWQgdG8gZ2VuZXJhdGUgaHRtbCBmb3IgdGhlaXIgY29udGVudCAqL1xuZnVuY3Rpb24gcmVuZGVyVmlzdWFsaXphdGlvbnMoZG9jdW1lbnQsIGJyaWVmY2FzZSl7XG4gIHZpc2l0KGRvY3VtZW50LmFzdCwgJ3Vua25vd24nLCBub2RlID0+IHtcbiAgICBpZihub2RlLnZpc3VhbGl6YXRpb24pe1xuICAgICAgbGV0IHZpc3VhbGl6YXRpb24gPSByZXF1aXJlKGJyaWVmY2FzZS5jb25maWcudmlld3NfcGF0aCArICcvJyArIG5vZGUudmlzdWFsaXphdGlvbilcbiAgICAgIGxldCBkYXRhID0gbm9kZS55YW1sIHx8IHt9XG4gICAgICBsZXQgaHRtbCA9IHZpc3VhbGl6YXRpb24oZGF0YSwgZG9jdW1lbnQsIGJyaWVmY2FzZSlcbiAgICAgIGxldCBpZCA9IG5vZGUuZGF0YS5odG1sQXR0cmlidXRlcy5pZFxuXG4gICAgICBub2RlLmNoaWxkcmVuWzBdLnZhbHVlID0gc3RyaW5ncy51bmVzY2FwZUhUTUwoaHRtbClcbiAgICB9XG4gIH0pXG59XG5cbi8qKlxuKiBwcm9jZXNzIGEgYnJpZWYgZG9jdW1lbnQuIHRoaXMgaW52b2x2ZXMgbWFuaXB1bGF0aW5nIFxuKiB0aGUgYXN0IGZyb20gbWRhc3Qgc28gdGhhdCBvdXIgcmVuZGVyZWQgb3V0cHV0IGlzIG5lc3RlZFxuKiBpbiBhIGhpZXJhcmNoeSBvZiBtYWluLCBzZWN0aW9uLCBhcnRpY2xlIGh0bWwgdGFncy5cbipcbiogb3RoZXIgZnVuY3Rpb25zIGFyZSBwZXJmb3JtZWQgZHVyaW5nIHRoaXMgb3BlcmF0aW9uIHRvXG4qIGFzc2lzdCBpbiBleHRyYWN0aW5nIGRhdGEgZnJvbSB0aGUgd3JpdGluZywgZ2VuZXJhdGluZ1xuKiBsaW5rcyB0byBvdGhlciBkb2N1bWVudHMgaW4gdGhlIGJyaWVmY2FzZSwgYW5kIG1vcmUuXG4qXG4qL1xuZXhwb3J0IGZ1bmN0aW9uIHByb2Nlc3MoZG9jdW1lbnQsIGJyaWVmY2FzZSkge1xuXG4gIGRvY3VtZW50LmFzdCA9IHBhcnNlKGRvY3VtZW50KVxuICBkb2N1bWVudC5ydW5Ib29rKFwiZG9jdW1lbnRXaWxsUmVuZGVyXCIsIGRvY3VtZW50LmFzdClcbiBcbiAgLy8gdGhlc2UgYXJlIGJyb2tlbiB1cCBiZWNhdXNlIGl0IGlzIGVhc2llciB0byB0cmFuc2Zvcm1cbiAgLy8gY2VydGFpbiBub2RlcyB3aGVuIHRoZXkgYXJlbid0IGRlZXBseSBuZXN0ZWQgaW4gdGhlIHNlY3Rpb25zXG4gIC8vIHdlIG5lZWRcbiAgcGlwZWxpbmVzLnByb2Nlc3NpbmcuZm9yRWFjaChmbiA9PiBmbihkb2N1bWVudCwgYnJpZWZjYXNlKSlcbiAgXG4gIC8vIHRoZXNlIGFyZSByZXNwb25zaWJsZSBmb3IgbmVzdGluZyB0aGUgZmxhdCBtYXJrZG93biBlbGVtZW50c1xuICAvLyBpbiBhIG1vcmUgaGllcmFyY2hhbCBzdHJ1Y3R1cmUgYmFzZWQgb24gdGhlIGhlYWRpbmcgbGV2ZWxzIGFuZCB0aXRsZXNcbiAgcGlwZWxpbmVzLnN0cnVjdHVyaW5nLmZvckVhY2goZm4gPT4gZm4oZG9jdW1lbnQsIGJyaWVmY2FzZSkpXG5cbiAgT2JqZWN0LmRlZmluZVByb3BlcnR5KGRvY3VtZW50LCAnaHRtbCcsIHtcbiAgICBjb25maWd1cmFibGU6IHRydWUsXG4gICAgZ2V0OiBmdW5jdGlvbigpe1xuICAgICAgcGlwZWxpbmVzLnJlbmRlcmluZy5mb3JFYWNoKGZuID0+IGZuKGRvY3VtZW50LCBicmllZmNhc2UpKVxuXG4gICAgICBsZXQgaHRtbCA9IHN0cmluZ2lmeShkb2N1bWVudC5hc3QpXG5cbiAgICAgIHJldHVybiBodG1sXG4gICAgfVxuICB9KVxuXG4gIGRvY3VtZW50LiQgPSBmdW5jdGlvbihzZWxlY3Rvcil7XG4gICAgcmV0dXJuIGNoZWVyaW8ubG9hZChkb2N1bWVudC5odG1sKShzZWxlY3RvcilcbiAgfVxuXG4gIGRvY3VtZW50LnJ1bkhvb2soXCJkb2N1bWVudERpZFJlbmRlclwiLCBkb2N1bWVudClcblxuICByZXR1cm4gZG9jdW1lbnRcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIG1hcmtkb3duKCl7XG4gIHJldHVybiBwcm9jZXNzb3Jcbn1cblxuLyoqIFxuKiBwYXJzZXMgYSBicmllZiBkb2N1bWVudCBhbmQgZXh0cmFjdHNcbiogdGhlIHlhbWwgZnJvbnRtYXR0ZXIgYXMgYGRvY3VtZW50LmRhdGFgXG4qXG4qL1xuZXhwb3J0IGZ1bmN0aW9uIHBhcnNlKGRvY3VtZW50KSB7XG4gIGxldCBwYXJzZWQgPSBwcm9jZXNzb3IucGFyc2UoZG9jdW1lbnQuY29udGVudCksXG4gICAgICBub2RlcyAgPSBwYXJzZWQuY2hpbGRyZW5cbiAgXG4gIGlmKG5vZGVzWzBdICYmIG5vZGVzWzBdLnlhbWwpe1xuICAgIGRvY3VtZW50LmRhdGEgPSBub2Rlcy5zaGlmdCgpLnlhbWxcbiAgfVxuICBcbiAgbGV0IGFzdCA9IHByb2Nlc3Nvci5ydW4ocGFyc2VkKVxuXG4gIGRvY3VtZW50LnJ1bkhvb2soXCJkb2N1bWVudERpZFBhcnNlXCIsIGFzdClcblxuICByZXR1cm4gYXN0IFxufVxuXG5cbmV4cG9ydCBmdW5jdGlvbiBmcmFnbWVudChhc3QsIG9wdGlvbnM9e30pIHtcbiAgcmV0dXJuIHN0cmluZ2lmeSh7XG4gICAgdHlwZTogJ3Jvb3QnLFxuICAgIGNoaWxkcmVuOiBbYXN0XVxuICB9KVxufVxuXG5leHBvcnQgZnVuY3Rpb24gc3RyaW5naWZ5KGFzdCwgb3B0aW9ucz17fSkge1xuICByZXR1cm4gcHJvY2Vzc29yLnN0cmluZ2lmeShhc3QsIG9wdGlvbnMpXG59XG5cbmV4cG9ydCBmdW5jdGlvbiByZWFkUGF0aChwYXRoKSB7XG4gIHJldHVybiBmcy5yZWFkRmlsZVN5bmMocGF0aCkudG9TdHJpbmcoKVxufVxuXG5mdW5jdGlvbiBuZXN0RWxlbWVudHMoZG9jdW1lbnQpIHtcbiAgbGV0IGNoaWxkcmVuID0gZG9jdW1lbnQuYXN0LmNoaWxkcmVuXG4gIGxldCBoZWFkaW5ncyA9IGRvY3VtZW50LmFzdC5jaGlsZHJlbi5maWx0ZXIoYyA9PiBjLnR5cGUgPT09IFwiaGVhZGluZ1wiKVxuXHRcblx0bGV0IGluZGV4ID0gMFxuXHRsZXQgcHJldmlvdXNcbiAgbGV0IHRvcFxuXG5cdGNoaWxkcmVuLmZvckVhY2goY2hpbGQgPT4ge1xuXHRcdGxldCBkYXRhID0gY2hpbGQuZGF0YSBcbiAgICBcblx0XHRpZihjaGlsZC50eXBlID09PSBcImhlYWRpbmdcIil7XG5cdFx0XHRkZWxldGUoY2hpbGQuZGF0YSlcbiAgICAgIHRvcCA9IGZhbHNlXG4gICAgICBkYXRhID0gZGF0YSB8fCB7fVxuICAgICAgZGF0YS5odG1sTmFtZSA9IFwic2VjdGlvblwiXG4gICAgICBkYXRhLmh0bWxBdHRyaWJ1dGVzID0gZGF0YS5odG1sQXR0cmlidXRlcyB8fCB7fVxuICAgICAgXG4gICAgICBpZihjaGlsZC5kZXB0aCA9PSAxICYmICF0b3Ape1xuICAgICAgICB0b3AgPSB0cnVlXG4gICAgICAgIGRhdGEuaHRtbEF0dHJpYnV0ZXNbJ2RhdGEtdG9wJ10gPSB0cnVlXG4gICAgICB9XG4gICAgICAgIFxuICAgICAgaWYoY2hpbGQuZGVwdGggPj0gMyl7XG4gICAgICAgIGRhdGEuaHRtbE5hbWUgPSBcImFydGljbGVcIlxuICAgICAgfVxuICAgICAgXG4gICAgICBjaGlsZC5kYXRhID0ge31cblxuXHRcdFx0bGV0IHdyYXBwZWQgPSB7XG5cdFx0XHRcdHR5cGU6IGRhdGEuaHRtbE5hbWUsXG4gICAgICAgIGRlcHRoOiBjaGlsZC5kZXB0aCxcblx0XHRcdFx0Y29udGFpbmVyOiB0cnVlLFxuXHRcdFx0XHRkYXRhOiBkYXRhLFxuXHRcdFx0XHRjaGlsZHJlbjogW2NoaWxkXVxuXHRcdFx0fVxuICAgICAgXG4gICAgICB3cmFwcGVkW2RhdGEuaHRtbE5hbWVdID0gdHJ1ZSBcblxuICAgICAgaWYodG9wKXtcbiAgICAgICAgd3JhcHBlZC50b3AgPSB0b3BcbiAgICAgIH1cblxuICAgICAgaWYoY2hpbGQudHlwZSA9PSBcImhlYWRpbmdcIil7XG4gICAgICAgIGxldCB0ZXh0ID0gY2hpbGQuY2hpbGRyZW5bMF0gJiYgY2hpbGQuY2hpbGRyZW5bMF0udmFsdWVcbiAgICAgICAgbGV0IHNsdWcgPSBzbHVnaWZ5KHRleHQpIFxuICAgICAgICBkYXRhLmh0bWxBdHRyaWJ1dGVzWydkYXRhLWhlYWRpbmcnXSA9IHNsdWdcbiAgICAgICAgd3JhcHBlZC5zbHVnID0gc2x1Z1xuICAgICAgICB3cmFwcGVkLmhlYWRpbmcgPSB0ZXh0XG4gICAgICAgIGNoaWxkLmhlYWRpbmcgPSB0ZXh0XG4gICAgICB9XG5cbiAgICAgIHByZXZpb3VzID0gY2hpbGRyZW5baW5kZXhdID0gd3JhcHBlZFxuXG5cdFx0fSBlbHNlIGlmKHByZXZpb3VzKSB7XG5cdFx0XHRwcmV2aW91cy5jaGlsZHJlbi5wdXNoKGNsb25lKGNoaWxkKSlcblx0XHRcdGNoaWxkLm1hcmtGb3JSZW1vdmFsID0gdHJ1ZVxuXHRcdH1cblxuXHRcdGluZGV4ID0gaW5kZXggKyAxXG5cdH0pXG4gIFxuICBkb2N1bWVudC5hc3Qud3JhcHBlZCA9IHRydWVcblx0ZG9jdW1lbnQuYXN0LmNoaWxkcmVuID0gY2hpbGRyZW4uZmlsdGVyKGNoaWxkID0+ICFjaGlsZC5tYXJrRm9yUmVtb3ZhbClcbn1cblxuZnVuY3Rpb24gY29sbGFwc2VTZWN0aW9ucyAoZG9jdW1lbnQpe1xuICBsZXQgY2hpbGRyZW4gPSBkb2N1bWVudC5hc3QuY2hpbGRyZW5cbiAgbGV0IHByZXZpb3VzXG4gICBcbiAgY2hpbGRyZW4uZm9yRWFjaChjaGlsZCA9PiB7XG4gICAgbGV0IG5hbWUgPSBjaGlsZC5kYXRhICYmIGNoaWxkLmRhdGEuaHRtbE5hbWVcbiAgICBpZihuYW1lID09PSBcInNlY3Rpb25cIil7XG4gICAgICBwcmV2aW91cyA9IGNoaWxkXG4gICAgICBjaGlsZC5kZWJ1ZyA9IHRydWVcbiAgICAgIGNoaWxkLnNlY3Rpb24gPSB0cnVlXG4gICAgfVxuXG4gICAgaWYocHJldmlvdXMgJiYgbmFtZSA9PT0gXCJhcnRpY2xlXCIpe1xuICAgICAgbGV0IGNsb25lZCA9IGNsb25lKGNoaWxkKVxuICAgICAgY2xvbmVkLnBhcmVudCA9IHByZXZpb3VzLnNsdWdcbiAgICAgIHByZXZpb3VzLmNoaWxkcmVuLnB1c2goY2xvbmVkKVxuICAgICAgY2hpbGQubWFya0ZvckRlbGV0ZSA9IHRydWVcbiAgICB9XG4gIH0pXG5cbiAgZG9jdW1lbnQuYXN0LmNoaWxkcmVuID0gY2hpbGRyZW4uZmlsdGVyKGNoaWxkID0+ICFjaGlsZC5tYXJrRm9yRGVsZXRlKVxufVxuXG5mdW5jdGlvbiBhcHBseVdyYXBwZXIgKGRvY3VtZW50KSB7XG4gIGRvY3VtZW50LmFzdC5jaGlsZHJlbiA9IFt7IFxuICAgIHR5cGU6IFwidW5rbm93blwiLFxuICAgIGRhdGE6e1xuICAgICAgaHRtbE5hbWU6IFwibWFpblwiLFxuICAgICAgaHRtbEF0dHJpYnV0ZXM6e1xuICAgICAgICBcImNsYXNzXCI6IFwiYnJpZWYtZG9jdW1lbnRcIixcbiAgICAgICAgXCJpZFwiOiBkb2N1bWVudC5pZFxuICAgICAgfVxuICAgIH0sXG4gICAgY2hpbGRyZW46IGRvY3VtZW50LmFzdC5jaGlsZHJlblxuICB9XVxufVxuXG5mdW5jdGlvbiByZXNvbHZlTGlua3MoZG9jdW1lbnQsIGJyaWVmY2FzZSl7XG4gIGlmKCFicmllZmNhc2UpeyByZXR1cm4gfVxuXG4gIHZpc2l0KGRvY3VtZW50LmFzdCwgJ2xpbmsnLCBmdW5jdGlvbihub2RlKXtcbiAgICBsZXQgcGF0aEFsaWFzID0gbm9kZS5ocmVmXG5cbiAgICBsZXQgY2hpbGRyZW4gPSBub2RlLmNoaWxkcmVuIHx8IFtdXG4gICAgbGV0IHRleHROb2RlID0gbm9kZS5jaGlsZHJlbi5maW5kKG5vZGUgPT4gbm9kZS50eXBlID09PSAndGV4dCcpXG5cbiAgICBpZih0ZXh0Tm9kZSAmJiB0ZXh0Tm9kZS52YWx1ZS5tYXRjaCgvbGlua1xcOi8pKXtcbiAgICAgIG5vZGUuaHJlZiA9IGJyaWVmY2FzZS5yZXNvbHZlTGluayhwYXRoQWxpYXMpXG4gICAgICBub2RlLmh0bWxBdHRyaWJ1dGVzID0gbm9kZS5odG1sQXR0cmlidXRlcyB8fCB7fVxuICAgICAgbm9kZS5odG1sQXR0cmlidXRlc1snZGF0YS1saW5rLXRvJ10gPSBwYXRoQWxpYXNcbiAgICB9XG5cbiAgICBpZih0ZXh0Tm9kZSAmJiB0ZXh0Tm9kZS52YWx1ZS5tYXRjaCgvZW1iZWRcXDovKSl7XG4gICAgICBsZXQgYXNzZXQgPSBicmllZmNhc2UuYXNzZXRzLmF0KG5vZGUuaHJlZilcblxuICAgICAgaWYoYXNzZXQpe1xuICAgICAgICBub2RlLnR5cGUgPSBcInVua25vd25cIlxuICAgICAgICBub2RlLmRhdGEgPSB7XG4gICAgICAgICAgaHRtbEF0dHJpYnV0ZXM6e1xuICAgICAgICAgICAgbmFtZTogXCJkaXZcIlxuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBub2RlLmNoaWxkcmVuID0gW3tcbiAgICAgICAgICB0eXBlOiBcInRleHRcIixcbiAgICAgICAgICB2YWx1ZTogc3RyaW5ncy51bmVzY2FwZUhUTUwoYXNzZXQuY29udGVudClcbiAgICAgICAgfV1cbiAgICAgIH1cbiAgICB9XG4gIH0pXG59XG5cbmZ1bmN0aW9uIHByb2Nlc3NMaW5rcyhkb2N1bWVudCwgYnJpZWZjYXNlKXtcbiAgdmlzaXQoZG9jdW1lbnQuYXN0LCAnbGluaycsIGZ1bmN0aW9uKG5vZGUpe1xuICAgIGlmKG5vZGUuaHRtbEF0dHJpYnV0ZXMgJiYgbm9kZS5odG1sQXR0cmlidXRlc1snZGF0YS1saW5rLXRvJ10pe1xuICAgICAgbGV0IGxpbmtlZERvY3VtZW50ID0gYnJpZWZjYXNlLmF0KG5vZGUuaHRtbEF0dHJpYnV0ZXNbJ2RhdGEtbGluay10byddKVxuICAgICAgbGV0IHRleHROb2RlID0gbm9kZS5jaGlsZHJlbi5maW5kKG5vZGUgPT4gbm9kZS50eXBlID09PSAndGV4dCcpXG5cbiAgICAgIGlmKHRleHROb2RlICYmIHRleHROb2RlLnZhbHVlLm1hdGNoKC9saW5rXFw6Lykpe1xuICAgICAgICB0ZXh0Tm9kZS52YWx1ZSA9IHN0cmluZ3Muc3RyaXAodGV4dE5vZGUudmFsdWUucmVwbGFjZSgvbGlua1xcOi8sJycpKVxuXG4gICAgICAgIGlmKGxpbmtlZERvY3VtZW50ICYmIHRleHROb2RlLnZhbHVlID09PSAndGl0bGUnKXtcbiAgICAgICAgICB0ZXh0Tm9kZS52YWx1ZSA9IGxpbmtlZERvY3VtZW50LnRpdGxlXG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG4gIH0pXG59XG5cbmZ1bmN0aW9uIHByb2Nlc3NDb2RlQmxvY2tzKGRvY3VtZW50LCBicmllZmNhc2Upe1xuICBsZXQgaW5kZXggPSAwXG5cbiAgbGV0IHBhcnNlclxuXG4gIHZpc2l0KGRvY3VtZW50LmFzdCwgJ2NvZGUnLCBmdW5jdGlvbihub2RlKXtcbiAgICBsZXQgZGF0YSA9IG5vZGUuZGF0YSA9IG5vZGUuZGF0YSB8fCB7fVxuICAgIGxldCBhdHRycyA9IG5vZGUuZGF0YS5odG1sQXR0cmlidXRlcyA9IG5vZGUuZGF0YS5odG1sQXR0cmlidXRlcyB8fCB7fVxuICAgIFxuICAgIGF0dHJzLmlkID0gYXR0cnMuaWQgfHwgXCJibG9jay1cIiArIGluZGV4XG5cbiAgICBpZihub2RlLmxhbmcgPT09ICd5YW1sJyB8fCBub2RlLmxhbmcgPT09ICd5bWwnIHx8IG5vZGUubGFuZyA9PT0gJ2RhdGEnKXtcbiAgICAgIHBhcnNlciA9IHBhcnNlciB8fCByZXF1aXJlKCdqcy15YW1sJylcbiAgICAgICAgICAgIFxuICAgICAgaWYobm9kZS52YWx1ZSAmJiAhbm9kZS55YW1sKXtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICBub2RlLnlhbWwgPSBwYXJzZXIuc2FmZUxvYWQobm9kZS52YWx1ZSlcbiAgICAgICAgfSBjYXRjaChlKXtcbiAgICAgICAgICBkb2N1bWVudC5sb2coXCJFcnJvciBwYXJzaW5nIHlhbWxcIiwgZS5tZXNzYWdlKVxuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIGlmKG5vZGUubGFuZyA9PT0gJ2RhdGEnICYmIG5vZGUueWFtbCl7XG4gICAgICAgIGxldCBrZXkgPSBub2RlLnlhbWwua2V5XG4gICAgICAgIFxuICAgICAgICBpZihrZXkpe1xuICAgICAgICAgIGRlbGV0ZShub2RlLnlhbWwua2V5KVxuXG4gICAgICAgICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KGRvY3VtZW50LmRhdGEsIGtleSwge1xuICAgICAgICAgICAgdmFsdWU6IG5vZGUueWFtbFxuICAgICAgICAgIH0pXG5cbiAgICAgICAgICBub2RlLnlhbWwua2V5ID0ga2V5XG4gICAgICAgICAgbm9kZS5tYXJrRm9yRGVsZXRlID0gdHJ1ZVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIGRvY3VtZW50LmxvZyhcIkNhbid0IHByb2Nlc3MgYSBkYXRhIHlhbWwgYmxvY2sgd2l0aG91dCBhIGtleSBwcm9wZXJ0eVwiKVxuICAgICAgICB9XG4gICAgICB9XG4gICAgICBcbiAgICAgIC8vIFRCRCB3aGV0aGVyIHdlIHJlcXVpcmUgdmlzdWFsaXphdGlvbiBvciB2aWV3IGFzIHRoZSBrZXlcbiAgICAgIGlmKG5vZGUueWFtbCAmJiAobm9kZS55YW1sLnZpc3VhbGl6YXRpb24gfHwgbm9kZS52aWV3KSl7XG4gICAgICAgIG5vZGUudmlzdWFsaXphdGlvbiA9IChub2RlLnlhbWwudmlzdWFsaXphdGlvbiB8fCBub2RlLnZpZXcpXG4gICAgICAgIG5vZGUudHlwZSA9ICd1bmtub3duJ1xuICAgICAgICBub2RlLmNoaWxkcmVuID0gW3t0eXBlOid0ZXh0Jyx2YWx1ZTonVklTVUFMSVpBVElPTid9XVxuICAgICAgfVxuXG4gICAgICBub2RlLmxhbmcgPSAneWFtbCdcbiAgICB9XG5cbiAgICBpbmRleCA9IGluZGV4ICsgMVxuICB9KVxufVxuIl19