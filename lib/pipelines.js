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

      node.children[0].value = _html;
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

      var html = _underscoreString2['default'].unescapeHTML(stringify(document.ast));

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
    id: document.slug,
    data: {
      htmlName: "main",
      id: document.slug,
      htmlAttributes: {
        "class": "brief-document",
        "id": document.slug
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
//# sourceMappingURL=data:application/json;base64,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UUFBUSxHQUFHLENBQUMsRUFBQyxJQUFJLEVBQUMsTUFBTSxFQUFDLEtBQUssRUFBQyxlQUFlLEVBQUMsQ0FBQyxDQUFBO09BQ3REOztBQUVELFVBQUksQ0FBQyxJQUFJLEdBQUcsTUFBTSxDQUFBO0tBQ25COztBQUVELFNBQUssR0FBRyxLQUFLLEdBQUcsQ0FBQyxDQUFBO0dBQ2xCLENBQUMsQ0FBQTtDQUNIIiwiZmlsZSI6InBpcGVsaW5lcy5qcyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCBtZGFzdCBmcm9tICdtZGFzdCdcbmltcG9ydCB5YW1sIGZyb20gJ21kYXN0LXlhbWwnXG5pbXBvcnQgaHRtbCBmcm9tICdtZGFzdC1odG1sJ1xuaW1wb3J0IGZzIGZyb20gJ2ZzJ1xuaW1wb3J0IHNxdWVlemUgZnJvbSAnbWRhc3Qtc3F1ZWV6ZS1wYXJhZ3JhcGhzJ1xuaW1wb3J0IG5vcm1hbGl6ZSBmcm9tICdtZGFzdC1ub3JtYWxpemUtaGVhZGluZ3MnIFxuaW1wb3J0IHZpc2l0IGZyb20gJ3VuaXN0LXV0aWwtdmlzaXQnXG5pbXBvcnQgY2hlZXJpbyBmcm9tICdjaGVlcmlvJ1xuaW1wb3J0IHtjbG9uZSxzbHVnaWZ5LGV4dGVuZH0gZnJvbSAnLi91dGlsJ1xuaW1wb3J0IHN0cmluZ3MgZnJvbSAndW5kZXJzY29yZS5zdHJpbmcnXG5cbmNvbnN0IHByb2Nlc3NvciA9IG1kYXN0LnVzZShbeWFtbCxzcXVlZXplLG5vcm1hbGl6ZSxodG1sXSlcblxuLyoqIE5vdGVcbiogICBUaGlzIG5lZWRzIHRvIGJlIG9wdGltaXplZCBhcyB0aGVyZSBhcmUgdHVybmluZyBvdXQgdG8gYmVcbiogICB3YXkgdG8gbWFueSBwYXNzZXMgb3ZlciB0aGUgYXN0LlxuKi9cblxuLy8gUGx1Z2lucyBzaG91bGQgYmUgYWJsZSB0byB0YXAgaW50byB0aGlzXG5sZXQgcGlwZWxpbmVzID0ge1xuICBnZXQgcHJvY2Vzc2luZygpe1xuICAgIHJldHVybiBbXG4gICAgICByZXNvbHZlTGlua3MsXG4gICAgICBuZXN0RWxlbWVudHMsXG4gICAgICBwcm9jZXNzQ29kZUJsb2NrcyxcbiAgICAgIHJlbW92ZU5vZGVzXG4gICAgXSBcbiAgfSxcbiAgXG4gIGdldCBzdHJ1Y3R1cmluZygpe1xuICAgIHJldHVybiBbXG4gICAgICBjb2xsYXBzZVNlY3Rpb25zLFxuICAgICAgYXBwbHlXcmFwcGVyXG4gICAgXVxuICB9LFxuXG4gIGdldCByZW5kZXJpbmcoKXtcbiAgICByZXR1cm4gW1xuICAgICAgcHJvY2Vzc0xpbmtzLFxuICAgICAgcmVuZGVyVmlzdWFsaXphdGlvbnNcbiAgICBdXG4gIH1cbn1cblxuLyogaWYgYW55IG9mIHRoZSBub2RlcyBoYXZlIGJlZW4gbWFya2VkIGZvciBkZWxldGUgdGhpcyB3aWxsIHJlbW92ZSB0aGVtIGFuZCBtYWtlIHN1cmUgdGhleVxuKiBkb24ndCBnZXQgcmVuZGVyZWQgaW4gdGhlIG91dHB1dCAqL1xuZnVuY3Rpb24gcmVtb3ZlTm9kZXMoZG9jdW1lbnQsIGJyaWVmY2FzZSl7XG4gIHZpc2l0KGRvY3VtZW50LmFzdCwgbm9kZSA9PiB7XG4gICAgaWYobm9kZS5jaGlsZHJlbil7IG5vZGUuY2hpbGRyZW4gPSBub2RlLmNoaWxkcmVuLmZpbHRlcihjaGlsZCA9PiAhY2hpbGQubWFya0ZvckRlbGV0ZSkgfVxuICB9KVxufVxuXG4vKiBpZiBjb2RlIGJsb2NrIG5vZGVzIGhhdmUgYmVlbiB0YWdnZWQgdmlzdWFsaXphdGlvbnMgd2UgbmVlZCB0byBnZW5lcmF0ZSBodG1sIGZvciB0aGVpciBjb250ZW50ICovXG5mdW5jdGlvbiByZW5kZXJWaXN1YWxpemF0aW9ucyhkb2N1bWVudCwgYnJpZWZjYXNlKXtcbiAgdmlzaXQoZG9jdW1lbnQuYXN0LCAndW5rbm93bicsIG5vZGUgPT4ge1xuICAgIGlmKG5vZGUudmlzdWFsaXphdGlvbil7XG4gICAgICBsZXQgdmlzdWFsaXphdGlvbiA9IHJlcXVpcmUoYnJpZWZjYXNlLmNvbmZpZy52aWV3c19wYXRoICsgJy8nICsgbm9kZS52aXN1YWxpemF0aW9uKVxuICAgICAgbGV0IGRhdGEgPSBub2RlLnlhbWwgfHwge31cbiAgICAgIGxldCBodG1sID0gdmlzdWFsaXphdGlvbihkYXRhLCBkb2N1bWVudCwgYnJpZWZjYXNlKVxuICAgICAgbGV0IGlkID0gbm9kZS5kYXRhLmh0bWxBdHRyaWJ1dGVzLmlkXG5cbiAgICAgIG5vZGUuY2hpbGRyZW5bMF0udmFsdWUgPSBodG1sIFxuICAgIH1cbiAgfSlcbn1cblxuLyoqXG4qIHByb2Nlc3MgYSBicmllZiBkb2N1bWVudC4gdGhpcyBpbnZvbHZlcyBtYW5pcHVsYXRpbmcgXG4qIHRoZSBhc3QgZnJvbSBtZGFzdCBzbyB0aGF0IG91ciByZW5kZXJlZCBvdXRwdXQgaXMgbmVzdGVkXG4qIGluIGEgaGllcmFyY2h5IG9mIG1haW4sIHNlY3Rpb24sIGFydGljbGUgaHRtbCB0YWdzLlxuKlxuKiBvdGhlciBmdW5jdGlvbnMgYXJlIHBlcmZvcm1lZCBkdXJpbmcgdGhpcyBvcGVyYXRpb24gdG9cbiogYXNzaXN0IGluIGV4dHJhY3RpbmcgZGF0YSBmcm9tIHRoZSB3cml0aW5nLCBnZW5lcmF0aW5nXG4qIGxpbmtzIHRvIG90aGVyIGRvY3VtZW50cyBpbiB0aGUgYnJpZWZjYXNlLCBhbmQgbW9yZS5cbipcbiovXG5leHBvcnQgZnVuY3Rpb24gcHJvY2Vzcyhkb2N1bWVudCwgYnJpZWZjYXNlKSB7XG5cbiAgZG9jdW1lbnQuYXN0ID0gcGFyc2UoZG9jdW1lbnQpXG4gIGRvY3VtZW50LnJ1bkhvb2soXCJkb2N1bWVudFdpbGxSZW5kZXJcIiwgZG9jdW1lbnQuYXN0KVxuIFxuICAvLyB0aGVzZSBhcmUgYnJva2VuIHVwIGJlY2F1c2UgaXQgaXMgZWFzaWVyIHRvIHRyYW5zZm9ybVxuICAvLyBjZXJ0YWluIG5vZGVzIHdoZW4gdGhleSBhcmVuJ3QgZGVlcGx5IG5lc3RlZCBpbiB0aGUgc2VjdGlvbnNcbiAgLy8gd2UgbmVlZFxuICBwaXBlbGluZXMucHJvY2Vzc2luZy5mb3JFYWNoKGZuID0+IGZuKGRvY3VtZW50LCBicmllZmNhc2UpKVxuICBcbiAgLy8gdGhlc2UgYXJlIHJlc3BvbnNpYmxlIGZvciBuZXN0aW5nIHRoZSBmbGF0IG1hcmtkb3duIGVsZW1lbnRzXG4gIC8vIGluIGEgbW9yZSBoaWVyYXJjaGFsIHN0cnVjdHVyZSBiYXNlZCBvbiB0aGUgaGVhZGluZyBsZXZlbHMgYW5kIHRpdGxlc1xuICBwaXBlbGluZXMuc3RydWN0dXJpbmcuZm9yRWFjaChmbiA9PiBmbihkb2N1bWVudCwgYnJpZWZjYXNlKSlcblxuICBPYmplY3QuZGVmaW5lUHJvcGVydHkoZG9jdW1lbnQsICdodG1sJywge1xuICAgIGNvbmZpZ3VyYWJsZTogdHJ1ZSxcbiAgICBnZXQ6IGZ1bmN0aW9uKCl7XG4gICAgICBwaXBlbGluZXMucmVuZGVyaW5nLmZvckVhY2goZm4gPT4gZm4oZG9jdW1lbnQsIGJyaWVmY2FzZSkpXG5cbiAgICAgIGxldCBodG1sID0gc3RyaW5ncy51bmVzY2FwZUhUTUwoc3RyaW5naWZ5KGRvY3VtZW50LmFzdCkpXG5cbiAgICAgIHJldHVybiBodG1sXG4gICAgfVxuICB9KVxuXG4gIGRvY3VtZW50LiQgPSBmdW5jdGlvbihzZWxlY3Rvcil7XG4gICAgcmV0dXJuIGNoZWVyaW8ubG9hZChkb2N1bWVudC5odG1sKShzZWxlY3RvcilcbiAgfVxuXG4gIGRvY3VtZW50LnJ1bkhvb2soXCJkb2N1bWVudERpZFJlbmRlclwiLCBkb2N1bWVudClcblxuICByZXR1cm4gZG9jdW1lbnRcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIG1hcmtkb3duKCl7XG4gIHJldHVybiBwcm9jZXNzb3Jcbn1cblxuLyoqIFxuKiBwYXJzZXMgYSBicmllZiBkb2N1bWVudCBhbmQgZXh0cmFjdHNcbiogdGhlIHlhbWwgZnJvbnRtYXR0ZXIgYXMgYGRvY3VtZW50LmRhdGFgXG4qXG4qL1xuZXhwb3J0IGZ1bmN0aW9uIHBhcnNlKGRvY3VtZW50KSB7XG4gIGxldCBwYXJzZWQgPSBwcm9jZXNzb3IucGFyc2UoZG9jdW1lbnQuY29udGVudCksXG4gICAgICBub2RlcyAgPSBwYXJzZWQuY2hpbGRyZW5cbiAgXG4gIGlmKG5vZGVzWzBdICYmIG5vZGVzWzBdLnlhbWwpe1xuICAgIGRvY3VtZW50LmRhdGEgPSBub2Rlcy5zaGlmdCgpLnlhbWxcbiAgfVxuICBcbiAgbGV0IGFzdCA9IHByb2Nlc3Nvci5ydW4ocGFyc2VkKVxuXG4gIGRvY3VtZW50LnJ1bkhvb2soXCJkb2N1bWVudERpZFBhcnNlXCIsIGFzdClcblxuICByZXR1cm4gYXN0IFxufVxuXG5cbmV4cG9ydCBmdW5jdGlvbiBmcmFnbWVudChhc3QsIG9wdGlvbnM9e30pIHtcbiAgcmV0dXJuIHN0cmluZ2lmeSh7XG4gICAgdHlwZTogJ3Jvb3QnLFxuICAgIGNoaWxkcmVuOiBbYXN0XVxuICB9KVxufVxuXG5leHBvcnQgZnVuY3Rpb24gc3RyaW5naWZ5KGFzdCwgb3B0aW9ucz17fSkge1xuICByZXR1cm4gcHJvY2Vzc29yLnN0cmluZ2lmeShhc3QsIG9wdGlvbnMpXG59XG5cbmV4cG9ydCBmdW5jdGlvbiByZWFkUGF0aChwYXRoKSB7XG4gIHJldHVybiBmcy5yZWFkRmlsZVN5bmMocGF0aCkudG9TdHJpbmcoKVxufVxuXG5mdW5jdGlvbiBuZXN0RWxlbWVudHMoZG9jdW1lbnQpIHtcbiAgbGV0IGNoaWxkcmVuID0gZG9jdW1lbnQuYXN0LmNoaWxkcmVuXG4gIGxldCBoZWFkaW5ncyA9IGRvY3VtZW50LmFzdC5jaGlsZHJlbi5maWx0ZXIoYyA9PiBjLnR5cGUgPT09IFwiaGVhZGluZ1wiKVxuXHRcblx0bGV0IGluZGV4ID0gMFxuXHRsZXQgcHJldmlvdXNcbiAgbGV0IHRvcFxuXG5cdGNoaWxkcmVuLmZvckVhY2goY2hpbGQgPT4ge1xuXHRcdGxldCBkYXRhID0gY2hpbGQuZGF0YSBcbiAgICBcblx0XHRpZihjaGlsZC50eXBlID09PSBcImhlYWRpbmdcIil7XG5cdFx0XHRkZWxldGUoY2hpbGQuZGF0YSlcbiAgICAgIHRvcCA9IGZhbHNlXG4gICAgICBkYXRhID0gZGF0YSB8fCB7fVxuICAgICAgZGF0YS5odG1sTmFtZSA9IFwic2VjdGlvblwiXG4gICAgICBkYXRhLmh0bWxBdHRyaWJ1dGVzID0gZGF0YS5odG1sQXR0cmlidXRlcyB8fCB7fVxuICAgICAgXG4gICAgICBpZihjaGlsZC5kZXB0aCA9PSAxICYmICF0b3Ape1xuICAgICAgICB0b3AgPSB0cnVlXG4gICAgICAgIGRhdGEuaHRtbEF0dHJpYnV0ZXNbJ2RhdGEtdG9wJ10gPSB0cnVlXG4gICAgICB9XG4gICAgICAgIFxuICAgICAgaWYoY2hpbGQuZGVwdGggPj0gMyl7XG4gICAgICAgIGRhdGEuaHRtbE5hbWUgPSBcImFydGljbGVcIlxuICAgICAgfVxuICAgICAgXG4gICAgICBjaGlsZC5kYXRhID0ge31cblxuXHRcdFx0bGV0IHdyYXBwZWQgPSB7XG5cdFx0XHRcdHR5cGU6IGRhdGEuaHRtbE5hbWUsXG4gICAgICAgIGRlcHRoOiBjaGlsZC5kZXB0aCxcblx0XHRcdFx0Y29udGFpbmVyOiB0cnVlLFxuXHRcdFx0XHRkYXRhOiBkYXRhLFxuXHRcdFx0XHRjaGlsZHJlbjogW2NoaWxkXVxuXHRcdFx0fVxuICAgICAgXG4gICAgICB3cmFwcGVkW2RhdGEuaHRtbE5hbWVdID0gdHJ1ZSBcblxuICAgICAgaWYodG9wKXtcbiAgICAgICAgd3JhcHBlZC50b3AgPSB0b3BcbiAgICAgIH1cblxuICAgICAgaWYoY2hpbGQudHlwZSA9PSBcImhlYWRpbmdcIil7XG4gICAgICAgIGxldCB0ZXh0ID0gY2hpbGQuY2hpbGRyZW5bMF0gJiYgY2hpbGQuY2hpbGRyZW5bMF0udmFsdWVcbiAgICAgICAgbGV0IHNsdWcgPSBzbHVnaWZ5KHRleHQpIFxuICAgICAgICBkYXRhLmh0bWxBdHRyaWJ1dGVzWydkYXRhLWhlYWRpbmcnXSA9IHNsdWdcbiAgICAgICAgd3JhcHBlZC5zbHVnID0gc2x1Z1xuICAgICAgICB3cmFwcGVkLmhlYWRpbmcgPSB0ZXh0XG4gICAgICAgIGNoaWxkLmhlYWRpbmcgPSB0ZXh0XG4gICAgICB9XG5cbiAgICAgIHByZXZpb3VzID0gY2hpbGRyZW5baW5kZXhdID0gd3JhcHBlZFxuXG5cdFx0fSBlbHNlIGlmKHByZXZpb3VzKSB7XG5cdFx0XHRwcmV2aW91cy5jaGlsZHJlbi5wdXNoKGNsb25lKGNoaWxkKSlcblx0XHRcdGNoaWxkLm1hcmtGb3JSZW1vdmFsID0gdHJ1ZVxuXHRcdH1cblxuXHRcdGluZGV4ID0gaW5kZXggKyAxXG5cdH0pXG4gIFxuICBkb2N1bWVudC5hc3Qud3JhcHBlZCA9IHRydWVcblx0ZG9jdW1lbnQuYXN0LmNoaWxkcmVuID0gY2hpbGRyZW4uZmlsdGVyKGNoaWxkID0+ICFjaGlsZC5tYXJrRm9yUmVtb3ZhbClcbn1cblxuZnVuY3Rpb24gY29sbGFwc2VTZWN0aW9ucyAoZG9jdW1lbnQpe1xuICBsZXQgY2hpbGRyZW4gPSBkb2N1bWVudC5hc3QuY2hpbGRyZW5cbiAgbGV0IHByZXZpb3VzXG4gICBcbiAgY2hpbGRyZW4uZm9yRWFjaChjaGlsZCA9PiB7XG4gICAgbGV0IG5hbWUgPSBjaGlsZC5kYXRhICYmIGNoaWxkLmRhdGEuaHRtbE5hbWVcbiAgICBpZihuYW1lID09PSBcInNlY3Rpb25cIil7XG4gICAgICBwcmV2aW91cyA9IGNoaWxkXG4gICAgICBjaGlsZC5kZWJ1ZyA9IHRydWVcbiAgICAgIGNoaWxkLnNlY3Rpb24gPSB0cnVlXG4gICAgfVxuXG4gICAgaWYocHJldmlvdXMgJiYgbmFtZSA9PT0gXCJhcnRpY2xlXCIpe1xuICAgICAgbGV0IGNsb25lZCA9IGNsb25lKGNoaWxkKVxuICAgICAgY2xvbmVkLnBhcmVudCA9IHByZXZpb3VzLnNsdWdcbiAgICAgIHByZXZpb3VzLmNoaWxkcmVuLnB1c2goY2xvbmVkKVxuICAgICAgY2hpbGQubWFya0ZvckRlbGV0ZSA9IHRydWVcbiAgICB9XG4gIH0pXG5cbiAgZG9jdW1lbnQuYXN0LmNoaWxkcmVuID0gY2hpbGRyZW4uZmlsdGVyKGNoaWxkID0+ICFjaGlsZC5tYXJrRm9yRGVsZXRlKVxufVxuXG5mdW5jdGlvbiBhcHBseVdyYXBwZXIgKGRvY3VtZW50KSB7XG4gIGRvY3VtZW50LmFzdC5jaGlsZHJlbiA9IFt7IFxuICAgIHR5cGU6IFwidW5rbm93blwiLFxuICAgIGlkOiBkb2N1bWVudC5zbHVnLFxuICAgIGRhdGE6e1xuICAgICAgaHRtbE5hbWU6IFwibWFpblwiLFxuICAgICAgaWQ6IGRvY3VtZW50LnNsdWcsXG4gICAgICBodG1sQXR0cmlidXRlczp7XG4gICAgICAgIFwiY2xhc3NcIjogXCJicmllZi1kb2N1bWVudFwiLFxuICAgICAgICBcImlkXCI6IGRvY3VtZW50LnNsdWdcbiAgICAgIH1cbiAgICB9LFxuICAgIGNoaWxkcmVuOiBkb2N1bWVudC5hc3QuY2hpbGRyZW5cbiAgfV1cbn1cblxuZnVuY3Rpb24gcmVzb2x2ZUxpbmtzKGRvY3VtZW50LCBicmllZmNhc2Upe1xuICBpZighYnJpZWZjYXNlKXsgcmV0dXJuIH1cblxuICB2aXNpdChkb2N1bWVudC5hc3QsICdsaW5rJywgZnVuY3Rpb24obm9kZSl7XG4gICAgbGV0IHBhdGhBbGlhcyA9IG5vZGUuaHJlZlxuXG4gICAgbGV0IGNoaWxkcmVuID0gbm9kZS5jaGlsZHJlbiB8fCBbXVxuICAgIGxldCB0ZXh0Tm9kZSA9IG5vZGUuY2hpbGRyZW4uZmluZChub2RlID0+IG5vZGUudHlwZSA9PT0gJ3RleHQnKVxuXG4gICAgaWYodGV4dE5vZGUgJiYgdGV4dE5vZGUudmFsdWUubWF0Y2goL2xpbmtcXDovKSl7XG4gICAgICBub2RlLmhyZWYgPSBicmllZmNhc2UucmVzb2x2ZUxpbmsocGF0aEFsaWFzKVxuICAgICAgbm9kZS5odG1sQXR0cmlidXRlcyA9IG5vZGUuaHRtbEF0dHJpYnV0ZXMgfHwge31cbiAgICAgIG5vZGUuaHRtbEF0dHJpYnV0ZXNbJ2RhdGEtbGluay10byddID0gcGF0aEFsaWFzXG4gICAgfVxuXG4gICAgaWYodGV4dE5vZGUgJiYgdGV4dE5vZGUudmFsdWUubWF0Y2goL2VtYmVkXFw6Lykpe1xuICAgICAgbGV0IGFzc2V0ID0gYnJpZWZjYXNlLmFzc2V0cy5hdChub2RlLmhyZWYpXG5cbiAgICAgIGlmKGFzc2V0KXtcbiAgICAgICAgbm9kZS50eXBlID0gXCJ1bmtub3duXCJcbiAgICAgICAgbm9kZS5kYXRhID0ge1xuICAgICAgICAgIGh0bWxBdHRyaWJ1dGVzOntcbiAgICAgICAgICAgIG5hbWU6IFwiZGl2XCJcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgbm9kZS5jaGlsZHJlbiA9IFt7XG4gICAgICAgICAgdHlwZTogXCJ0ZXh0XCIsXG4gICAgICAgICAgdmFsdWU6IHN0cmluZ3MudW5lc2NhcGVIVE1MKGFzc2V0LmNvbnRlbnQpXG4gICAgICAgIH1dXG4gICAgICB9XG4gICAgfVxuICB9KVxufVxuXG5mdW5jdGlvbiBwcm9jZXNzTGlua3MoZG9jdW1lbnQsIGJyaWVmY2FzZSl7XG4gIHZpc2l0KGRvY3VtZW50LmFzdCwgJ2xpbmsnLCBmdW5jdGlvbihub2RlKXtcbiAgICBpZihub2RlLmh0bWxBdHRyaWJ1dGVzICYmIG5vZGUuaHRtbEF0dHJpYnV0ZXNbJ2RhdGEtbGluay10byddKXtcbiAgICAgIGxldCBsaW5rZWREb2N1bWVudCA9IGJyaWVmY2FzZS5hdChub2RlLmh0bWxBdHRyaWJ1dGVzWydkYXRhLWxpbmstdG8nXSlcbiAgICAgIGxldCB0ZXh0Tm9kZSA9IG5vZGUuY2hpbGRyZW4uZmluZChub2RlID0+IG5vZGUudHlwZSA9PT0gJ3RleHQnKVxuXG4gICAgICBpZih0ZXh0Tm9kZSAmJiB0ZXh0Tm9kZS52YWx1ZS5tYXRjaCgvbGlua1xcOi8pKXtcbiAgICAgICAgdGV4dE5vZGUudmFsdWUgPSBzdHJpbmdzLnN0cmlwKHRleHROb2RlLnZhbHVlLnJlcGxhY2UoL2xpbmtcXDovLCcnKSlcblxuICAgICAgICBpZihsaW5rZWREb2N1bWVudCAmJiB0ZXh0Tm9kZS52YWx1ZSA9PT0gJ3RpdGxlJyl7XG4gICAgICAgICAgdGV4dE5vZGUudmFsdWUgPSBsaW5rZWREb2N1bWVudC50aXRsZVxuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuICB9KVxufVxuXG5mdW5jdGlvbiBwcm9jZXNzQ29kZUJsb2Nrcyhkb2N1bWVudCwgYnJpZWZjYXNlKXtcbiAgbGV0IGluZGV4ID0gMFxuXG4gIGxldCBwYXJzZXJcblxuICB2aXNpdChkb2N1bWVudC5hc3QsICdjb2RlJywgZnVuY3Rpb24obm9kZSl7XG4gICAgbGV0IGRhdGEgPSBub2RlLmRhdGEgPSBub2RlLmRhdGEgfHwge31cbiAgICBsZXQgYXR0cnMgPSBub2RlLmRhdGEuaHRtbEF0dHJpYnV0ZXMgPSBub2RlLmRhdGEuaHRtbEF0dHJpYnV0ZXMgfHwge31cbiAgICBcbiAgICBhdHRycy5pZCA9IGF0dHJzLmlkIHx8IFwiYmxvY2stXCIgKyBpbmRleFxuXG4gICAgaWYobm9kZS5sYW5nID09PSAneWFtbCcgfHwgbm9kZS5sYW5nID09PSAneW1sJyB8fCBub2RlLmxhbmcgPT09ICdkYXRhJyl7XG4gICAgICBwYXJzZXIgPSBwYXJzZXIgfHwgcmVxdWlyZSgnanMteWFtbCcpXG4gICAgICAgICAgICBcbiAgICAgIGlmKG5vZGUudmFsdWUgJiYgIW5vZGUueWFtbCl7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgbm9kZS55YW1sID0gcGFyc2VyLnNhZmVMb2FkKG5vZGUudmFsdWUpXG4gICAgICAgIH0gY2F0Y2goZSl7XG4gICAgICAgICAgZG9jdW1lbnQubG9nKFwiRXJyb3IgcGFyc2luZyB5YW1sXCIsIGUubWVzc2FnZSlcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICBpZihub2RlLmxhbmcgPT09ICdkYXRhJyAmJiBub2RlLnlhbWwpe1xuICAgICAgICBsZXQga2V5ID0gbm9kZS55YW1sLmtleVxuICAgICAgICBcbiAgICAgICAgaWYoa2V5KXtcbiAgICAgICAgICBkZWxldGUobm9kZS55YW1sLmtleSlcblxuICAgICAgICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShkb2N1bWVudC5kYXRhLCBrZXksIHtcbiAgICAgICAgICAgIHZhbHVlOiBub2RlLnlhbWxcbiAgICAgICAgICB9KVxuXG4gICAgICAgICAgbm9kZS55YW1sLmtleSA9IGtleVxuICAgICAgICAgIG5vZGUubWFya0ZvckRlbGV0ZSA9IHRydWVcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBkb2N1bWVudC5sb2coXCJDYW4ndCBwcm9jZXNzIGEgZGF0YSB5YW1sIGJsb2NrIHdpdGhvdXQgYSBrZXkgcHJvcGVydHlcIilcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgXG4gICAgICAvLyBUQkQgd2hldGhlciB3ZSByZXF1aXJlIHZpc3VhbGl6YXRpb24gb3IgdmlldyBhcyB0aGUga2V5XG4gICAgICBpZihub2RlLnlhbWwgJiYgKG5vZGUueWFtbC52aXN1YWxpemF0aW9uIHx8IG5vZGUudmlldykpe1xuICAgICAgICBub2RlLnZpc3VhbGl6YXRpb24gPSAobm9kZS55YW1sLnZpc3VhbGl6YXRpb24gfHwgbm9kZS52aWV3KVxuICAgICAgICBub2RlLnR5cGUgPSAndW5rbm93bidcbiAgICAgICAgbm9kZS5jaGlsZHJlbiA9IFt7dHlwZTondGV4dCcsdmFsdWU6J1ZJU1VBTElaQVRJT04nfV1cbiAgICAgIH1cblxuICAgICAgbm9kZS5sYW5nID0gJ3lhbWwnXG4gICAgfVxuXG4gICAgaW5kZXggPSBpbmRleCArIDFcbiAgfSlcbn1cbiJdfQ==