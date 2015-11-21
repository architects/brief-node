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
      return [processLinks, renderViews];
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

/* if code block nodes have been tagged as having a view, we need to generate html for their content */
function renderViews(document, briefcase) {
  (0, _unistUtilVisit2['default'])(document.ast, 'unknown', function (node) {
    if (node.view) {
      var view = undefined;

      var data = node.yaml || {};

      briefcase.log("renderViews:yaml_block", { node: node, yaml: data, document: { path: document.path } });

      var _html = undefined;

      try {
        console.log("Briefcase View Rendering", node.view);
        _html = briefcase.views.render(node.view, data, document);
      } catch (e) {
        console.log("ERROR RENDERING", node);
      }

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

/* NOTE:
*
* We should be tracking the beginning line and ending line numbers for sections.
*
* We could also in theory render the line numbers in the html but i'm not sure that buys us anything
*/
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

      // tag this node as having a view associated with it.
      // we defer actual rendering until later in the pipeline
      if (node.yaml && (node.yaml.view || node.view)) {
        node.view = node.view || node.yaml.view;
        node.type = 'unknown';
        node.children = [{ type: 'text', value: '' }];
      }

      node.lang = 'yaml';
    }

    index = index + 1;
  });
}
//# sourceMappingURL=data:application/json;base64,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QUFNO0FBQ0wsa0JBQVEsQ0FBQyxHQUFHLENBQUMsd0RBQXdELENBQUMsQ0FBQTtTQUN2RTtPQUNGOzs7O0FBSUQsVUFBRyxJQUFJLENBQUMsSUFBSSxLQUFLLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxJQUFJLElBQUksQ0FBQyxJQUFJLENBQUEsQUFBQyxFQUFDO0FBQzVDLFlBQUksQ0FBQyxJQUFJLEdBQUcsSUFBSSxDQUFDLElBQUksSUFBSSxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQTtBQUN2QyxZQUFJLENBQUMsSUFBSSxHQUFHLFNBQVMsQ0FBQTtBQUNyQixZQUFJLENBQUMsUUFBUSxHQUFHLENBQUMsRUFBQyxJQUFJLEVBQUMsTUFBTSxFQUFDLEtBQUssRUFBQyxFQUFFLEVBQUMsQ0FBQyxDQUFBO09BQ3pDOztBQUVELFVBQUksQ0FBQyxJQUFJLEdBQUcsTUFBTSxDQUFBO0tBQ25COztBQUVELFNBQUssR0FBRyxLQUFLLEdBQUcsQ0FBQyxDQUFBO0dBQ2xCLENBQUMsQ0FBQTtDQUNIIiwiZmlsZSI6InBpcGVsaW5lcy5qcyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCBtZGFzdCBmcm9tICdtZGFzdCdcbmltcG9ydCB5YW1sIGZyb20gJ21kYXN0LXlhbWwnXG5pbXBvcnQgaHRtbCBmcm9tICdtZGFzdC1odG1sJ1xuaW1wb3J0IGZzIGZyb20gJ2ZzJ1xuaW1wb3J0IHNxdWVlemUgZnJvbSAnbWRhc3Qtc3F1ZWV6ZS1wYXJhZ3JhcGhzJ1xuaW1wb3J0IG5vcm1hbGl6ZSBmcm9tICdtZGFzdC1ub3JtYWxpemUtaGVhZGluZ3MnIFxuaW1wb3J0IHZpc2l0IGZyb20gJ3VuaXN0LXV0aWwtdmlzaXQnXG5pbXBvcnQgY2hlZXJpbyBmcm9tICdjaGVlcmlvJ1xuaW1wb3J0IHtjbG9uZSxzbHVnaWZ5LGV4dGVuZH0gZnJvbSAnLi91dGlsJ1xuaW1wb3J0IHN0cmluZ3MgZnJvbSAndW5kZXJzY29yZS5zdHJpbmcnXG5cbmNvbnN0IHByb2Nlc3NvciA9IG1kYXN0LnVzZShbeWFtbCxzcXVlZXplLG5vcm1hbGl6ZSxodG1sXSlcblxuLyoqIE5vdGVcbiogICBUaGlzIG5lZWRzIHRvIGJlIG9wdGltaXplZCBhcyB0aGVyZSBhcmUgdHVybmluZyBvdXQgdG8gYmVcbiogICB3YXkgdG8gbWFueSBwYXNzZXMgb3ZlciB0aGUgYXN0LlxuKi9cblxuLy8gUGx1Z2lucyBzaG91bGQgYmUgYWJsZSB0byB0YXAgaW50byB0aGlzXG5sZXQgcGlwZWxpbmVzID0ge1xuICBnZXQgcHJvY2Vzc2luZygpe1xuICAgIHJldHVybiBbXG4gICAgICByZXNvbHZlTGlua3MsXG4gICAgICBuZXN0RWxlbWVudHMsXG4gICAgICBwcm9jZXNzQ29kZUJsb2NrcyxcbiAgICAgIHJlbW92ZU5vZGVzXG4gICAgXSBcbiAgfSxcbiAgXG4gIGdldCBzdHJ1Y3R1cmluZygpe1xuICAgIHJldHVybiBbXG4gICAgICBjb2xsYXBzZVNlY3Rpb25zLFxuICAgICAgYXBwbHlXcmFwcGVyXG4gICAgXVxuICB9LFxuXG4gIGdldCByZW5kZXJpbmcoKXtcbiAgICByZXR1cm4gW1xuICAgICAgcHJvY2Vzc0xpbmtzLFxuICAgICAgcmVuZGVyVmlld3NcbiAgICBdXG4gIH1cbn1cblxuLyogaWYgYW55IG9mIHRoZSBub2RlcyBoYXZlIGJlZW4gbWFya2VkIGZvciBkZWxldGUgdGhpcyB3aWxsIHJlbW92ZSB0aGVtIGFuZCBtYWtlIHN1cmUgdGhleVxuKiBkb24ndCBnZXQgcmVuZGVyZWQgaW4gdGhlIG91dHB1dCAqL1xuZnVuY3Rpb24gcmVtb3ZlTm9kZXMoZG9jdW1lbnQsIGJyaWVmY2FzZSl7XG4gIHZpc2l0KGRvY3VtZW50LmFzdCwgbm9kZSA9PiB7XG4gICAgaWYobm9kZS5jaGlsZHJlbil7IG5vZGUuY2hpbGRyZW4gPSBub2RlLmNoaWxkcmVuLmZpbHRlcihjaGlsZCA9PiAhY2hpbGQubWFya0ZvckRlbGV0ZSkgfVxuICB9KVxufVxuXG4vKiBpZiBjb2RlIGJsb2NrIG5vZGVzIGhhdmUgYmVlbiB0YWdnZWQgYXMgaGF2aW5nIGEgdmlldywgd2UgbmVlZCB0byBnZW5lcmF0ZSBodG1sIGZvciB0aGVpciBjb250ZW50ICovXG5mdW5jdGlvbiByZW5kZXJWaWV3cyhkb2N1bWVudCwgYnJpZWZjYXNlKXtcbiAgdmlzaXQoZG9jdW1lbnQuYXN0LCAndW5rbm93bicsIG5vZGUgPT4ge1xuICAgIGlmKG5vZGUudmlldyl7XG4gICAgICBsZXQgdmlld1xuXG4gICAgICBsZXQgZGF0YSA9IG5vZGUueWFtbCB8fCB7fVxuXG4gICAgICBicmllZmNhc2UubG9nKFwicmVuZGVyVmlld3M6eWFtbF9ibG9ja1wiLCB7bm9kZTogbm9kZSwgeWFtbDogZGF0YSwgZG9jdW1lbnQ6e3BhdGg6IGRvY3VtZW50LnBhdGh9fSlcblxuICAgICAgbGV0IGh0bWxcblxuICAgICAgdHJ5IHtcbiAgICAgICAgY29uc29sZS5sb2coXCJCcmllZmNhc2UgVmlldyBSZW5kZXJpbmdcIiwgbm9kZS52aWV3KVxuICAgICAgICBodG1sID0gYnJpZWZjYXNlLnZpZXdzLnJlbmRlcihub2RlLnZpZXcsIGRhdGEsIGRvY3VtZW50KVxuICAgICAgfSBjYXRjaChlKXtcbiAgICAgICAgY29uc29sZS5sb2coXCJFUlJPUiBSRU5ERVJJTkdcIiwgbm9kZSlcbiAgICAgIH1cblxuICAgICAgbGV0IGlkID0gbm9kZS5kYXRhLmh0bWxBdHRyaWJ1dGVzLmlkXG5cbiAgICAgIG5vZGUuY2hpbGRyZW5bMF0udmFsdWUgPSBodG1sIFxuICAgIH1cbiAgfSlcbn1cblxuLyoqXG4qIHByb2Nlc3MgYSBicmllZiBkb2N1bWVudC4gdGhpcyBpbnZvbHZlcyBtYW5pcHVsYXRpbmcgXG4qIHRoZSBhc3QgZnJvbSBtZGFzdCBzbyB0aGF0IG91ciByZW5kZXJlZCBvdXRwdXQgaXMgbmVzdGVkXG4qIGluIGEgaGllcmFyY2h5IG9mIG1haW4sIHNlY3Rpb24sIGFydGljbGUgaHRtbCB0YWdzLlxuKlxuKiBvdGhlciBmdW5jdGlvbnMgYXJlIHBlcmZvcm1lZCBkdXJpbmcgdGhpcyBvcGVyYXRpb24gdG9cbiogYXNzaXN0IGluIGV4dHJhY3RpbmcgZGF0YSBmcm9tIHRoZSB3cml0aW5nLCBnZW5lcmF0aW5nXG4qIGxpbmtzIHRvIG90aGVyIGRvY3VtZW50cyBpbiB0aGUgYnJpZWZjYXNlLCBhbmQgbW9yZS5cbipcbiovXG5leHBvcnQgZnVuY3Rpb24gcHJvY2Vzcyhkb2N1bWVudCwgYnJpZWZjYXNlKSB7XG5cbiAgZG9jdW1lbnQuYXN0ID0gcGFyc2UoZG9jdW1lbnQpXG4gIGRvY3VtZW50LnJ1bkhvb2soXCJkb2N1bWVudFdpbGxSZW5kZXJcIiwgZG9jdW1lbnQuYXN0KVxuIFxuICAvLyB0aGVzZSBhcmUgYnJva2VuIHVwIGJlY2F1c2UgaXQgaXMgZWFzaWVyIHRvIHRyYW5zZm9ybVxuICAvLyBjZXJ0YWluIG5vZGVzIHdoZW4gdGhleSBhcmVuJ3QgZGVlcGx5IG5lc3RlZCBpbiB0aGUgc2VjdGlvbnNcbiAgLy8gd2UgbmVlZFxuICBwaXBlbGluZXMucHJvY2Vzc2luZy5mb3JFYWNoKGZuID0+IGZuKGRvY3VtZW50LCBicmllZmNhc2UpKVxuICBcbiAgLy8gdGhlc2UgYXJlIHJlc3BvbnNpYmxlIGZvciBuZXN0aW5nIHRoZSBmbGF0IG1hcmtkb3duIGVsZW1lbnRzXG4gIC8vIGluIGEgbW9yZSBoaWVyYXJjaGFsIHN0cnVjdHVyZSBiYXNlZCBvbiB0aGUgaGVhZGluZyBsZXZlbHMgYW5kIHRpdGxlc1xuICBwaXBlbGluZXMuc3RydWN0dXJpbmcuZm9yRWFjaChmbiA9PiBmbihkb2N1bWVudCwgYnJpZWZjYXNlKSlcblxuICBPYmplY3QuZGVmaW5lUHJvcGVydHkoZG9jdW1lbnQsICdodG1sJywge1xuICAgIGNvbmZpZ3VyYWJsZTogdHJ1ZSxcbiAgICBnZXQ6IGZ1bmN0aW9uKCl7XG4gICAgICBwaXBlbGluZXMucmVuZGVyaW5nLmZvckVhY2goZm4gPT4gZm4oZG9jdW1lbnQsIGJyaWVmY2FzZSkpXG5cbiAgICAgIGxldCBodG1sID0gc3RyaW5ncy51bmVzY2FwZUhUTUwoc3RyaW5naWZ5KGRvY3VtZW50LmFzdCkpXG5cbiAgICAgIHJldHVybiBodG1sXG4gICAgfVxuICB9KVxuXG4gIGRvY3VtZW50LiQgPSBmdW5jdGlvbihzZWxlY3Rvcil7XG4gICAgcmV0dXJuIGNoZWVyaW8ubG9hZChkb2N1bWVudC5odG1sKShzZWxlY3RvcilcbiAgfVxuXG4gIGRvY3VtZW50LnJ1bkhvb2soXCJkb2N1bWVudERpZFJlbmRlclwiLCBkb2N1bWVudClcblxuICByZXR1cm4gZG9jdW1lbnRcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIG1hcmtkb3duKCl7XG4gIHJldHVybiBwcm9jZXNzb3Jcbn1cblxuLyoqIFxuKiBwYXJzZXMgYSBicmllZiBkb2N1bWVudCBhbmQgZXh0cmFjdHNcbiogdGhlIHlhbWwgZnJvbnRtYXR0ZXIgYXMgYGRvY3VtZW50LmRhdGFgXG4qXG4qL1xuZXhwb3J0IGZ1bmN0aW9uIHBhcnNlKGRvY3VtZW50KSB7XG4gIGxldCBwYXJzZWQgPSBwcm9jZXNzb3IucGFyc2UoZG9jdW1lbnQuY29udGVudCksXG4gICAgICBub2RlcyAgPSBwYXJzZWQuY2hpbGRyZW5cbiAgXG4gIGlmKG5vZGVzWzBdICYmIG5vZGVzWzBdLnlhbWwpe1xuICAgIGRvY3VtZW50LmRhdGEgPSBub2Rlcy5zaGlmdCgpLnlhbWxcbiAgfVxuICBcbiAgbGV0IGFzdCA9IHByb2Nlc3Nvci5ydW4ocGFyc2VkKVxuXG4gIGRvY3VtZW50LnJ1bkhvb2soXCJkb2N1bWVudERpZFBhcnNlXCIsIGFzdClcblxuICByZXR1cm4gYXN0IFxufVxuXG5cbmV4cG9ydCBmdW5jdGlvbiBmcmFnbWVudChhc3QsIG9wdGlvbnM9e30pIHtcbiAgcmV0dXJuIHN0cmluZ2lmeSh7XG4gICAgdHlwZTogJ3Jvb3QnLFxuICAgIGNoaWxkcmVuOiBbYXN0XVxuICB9KVxufVxuXG5leHBvcnQgZnVuY3Rpb24gc3RyaW5naWZ5KGFzdCwgb3B0aW9ucz17fSkge1xuICByZXR1cm4gcHJvY2Vzc29yLnN0cmluZ2lmeShhc3QsIG9wdGlvbnMpXG59XG5cbmV4cG9ydCBmdW5jdGlvbiByZWFkUGF0aChwYXRoKSB7XG4gIHJldHVybiBmcy5yZWFkRmlsZVN5bmMocGF0aCkudG9TdHJpbmcoKVxufVxuXG4vKiBOT1RFOlxuKlxuKiBXZSBzaG91bGQgYmUgdHJhY2tpbmcgdGhlIGJlZ2lubmluZyBsaW5lIGFuZCBlbmRpbmcgbGluZSBudW1iZXJzIGZvciBzZWN0aW9ucy5cbipcbiogV2UgY291bGQgYWxzbyBpbiB0aGVvcnkgcmVuZGVyIHRoZSBsaW5lIG51bWJlcnMgaW4gdGhlIGh0bWwgYnV0IGknbSBub3Qgc3VyZSB0aGF0IGJ1eXMgdXMgYW55dGhpbmdcbiovXG5mdW5jdGlvbiBuZXN0RWxlbWVudHMoZG9jdW1lbnQpIHtcbiAgbGV0IGNoaWxkcmVuID0gZG9jdW1lbnQuYXN0LmNoaWxkcmVuXG4gIGxldCBoZWFkaW5ncyA9IGRvY3VtZW50LmFzdC5jaGlsZHJlbi5maWx0ZXIoYyA9PiBjLnR5cGUgPT09IFwiaGVhZGluZ1wiKVxuXHRcblx0bGV0IGluZGV4ID0gMFxuXHRsZXQgcHJldmlvdXNcbiAgbGV0IHRvcFxuXG5cdGNoaWxkcmVuLmZvckVhY2goY2hpbGQgPT4ge1xuXHRcdGxldCBkYXRhID0gY2hpbGQuZGF0YSBcbiAgICBcblx0XHRpZihjaGlsZC50eXBlID09PSBcImhlYWRpbmdcIil7XG5cdFx0XHRkZWxldGUoY2hpbGQuZGF0YSlcbiAgICAgIHRvcCA9IGZhbHNlXG4gICAgICBkYXRhID0gZGF0YSB8fCB7fVxuICAgICAgZGF0YS5odG1sTmFtZSA9IFwic2VjdGlvblwiXG4gICAgICBkYXRhLmh0bWxBdHRyaWJ1dGVzID0gZGF0YS5odG1sQXR0cmlidXRlcyB8fCB7fVxuICAgICAgXG4gICAgICBpZihjaGlsZC5kZXB0aCA9PSAxICYmICF0b3Ape1xuICAgICAgICB0b3AgPSB0cnVlXG4gICAgICAgIGRhdGEuaHRtbEF0dHJpYnV0ZXNbJ2RhdGEtdG9wJ10gPSB0cnVlXG4gICAgICB9XG4gICAgICAgIFxuICAgICAgaWYoY2hpbGQuZGVwdGggPj0gMyl7XG4gICAgICAgIGRhdGEuaHRtbE5hbWUgPSBcImFydGljbGVcIlxuICAgICAgfVxuICAgICAgXG4gICAgICBjaGlsZC5kYXRhID0ge31cblxuXHRcdFx0bGV0IHdyYXBwZWQgPSB7XG5cdFx0XHRcdHR5cGU6IGRhdGEuaHRtbE5hbWUsXG4gICAgICAgIGRlcHRoOiBjaGlsZC5kZXB0aCxcblx0XHRcdFx0Y29udGFpbmVyOiB0cnVlLFxuXHRcdFx0XHRkYXRhOiBkYXRhLFxuXHRcdFx0XHRjaGlsZHJlbjogW2NoaWxkXVxuXHRcdFx0fVxuICAgICAgXG4gICAgICB3cmFwcGVkW2RhdGEuaHRtbE5hbWVdID0gdHJ1ZSBcblxuICAgICAgaWYodG9wKXtcbiAgICAgICAgd3JhcHBlZC50b3AgPSB0b3BcbiAgICAgIH1cblxuICAgICAgaWYoY2hpbGQudHlwZSA9PSBcImhlYWRpbmdcIil7XG4gICAgICAgIGxldCB0ZXh0ID0gY2hpbGQuY2hpbGRyZW5bMF0gJiYgY2hpbGQuY2hpbGRyZW5bMF0udmFsdWVcbiAgICAgICAgbGV0IHNsdWcgPSBzbHVnaWZ5KHRleHQpIFxuICAgICAgICBkYXRhLmh0bWxBdHRyaWJ1dGVzWydkYXRhLWhlYWRpbmcnXSA9IHNsdWdcbiAgICAgICAgd3JhcHBlZC5zbHVnID0gc2x1Z1xuICAgICAgICB3cmFwcGVkLmhlYWRpbmcgPSB0ZXh0XG4gICAgICAgIGNoaWxkLmhlYWRpbmcgPSB0ZXh0XG4gICAgICB9XG5cbiAgICAgIHByZXZpb3VzID0gY2hpbGRyZW5baW5kZXhdID0gd3JhcHBlZFxuXG5cdFx0fSBlbHNlIGlmKHByZXZpb3VzKSB7XG5cdFx0XHRwcmV2aW91cy5jaGlsZHJlbi5wdXNoKGNsb25lKGNoaWxkKSlcblx0XHRcdGNoaWxkLm1hcmtGb3JSZW1vdmFsID0gdHJ1ZVxuXHRcdH1cblxuXHRcdGluZGV4ID0gaW5kZXggKyAxXG5cdH0pXG4gIFxuICBkb2N1bWVudC5hc3Qud3JhcHBlZCA9IHRydWVcblx0ZG9jdW1lbnQuYXN0LmNoaWxkcmVuID0gY2hpbGRyZW4uZmlsdGVyKGNoaWxkID0+ICFjaGlsZC5tYXJrRm9yUmVtb3ZhbClcbn1cblxuZnVuY3Rpb24gY29sbGFwc2VTZWN0aW9ucyAoZG9jdW1lbnQpe1xuICBsZXQgY2hpbGRyZW4gPSBkb2N1bWVudC5hc3QuY2hpbGRyZW5cbiAgbGV0IHByZXZpb3VzXG4gICBcbiAgY2hpbGRyZW4uZm9yRWFjaChjaGlsZCA9PiB7XG4gICAgbGV0IG5hbWUgPSBjaGlsZC5kYXRhICYmIGNoaWxkLmRhdGEuaHRtbE5hbWVcbiAgICBpZihuYW1lID09PSBcInNlY3Rpb25cIil7XG4gICAgICBwcmV2aW91cyA9IGNoaWxkXG4gICAgICBjaGlsZC5kZWJ1ZyA9IHRydWVcbiAgICAgIGNoaWxkLnNlY3Rpb24gPSB0cnVlXG4gICAgfVxuXG4gICAgaWYocHJldmlvdXMgJiYgbmFtZSA9PT0gXCJhcnRpY2xlXCIpe1xuICAgICAgbGV0IGNsb25lZCA9IGNsb25lKGNoaWxkKVxuICAgICAgY2xvbmVkLnBhcmVudCA9IHByZXZpb3VzLnNsdWdcbiAgICAgIHByZXZpb3VzLmNoaWxkcmVuLnB1c2goY2xvbmVkKVxuICAgICAgY2hpbGQubWFya0ZvckRlbGV0ZSA9IHRydWVcbiAgICB9XG4gIH0pXG5cbiAgZG9jdW1lbnQuYXN0LmNoaWxkcmVuID0gY2hpbGRyZW4uZmlsdGVyKGNoaWxkID0+ICFjaGlsZC5tYXJrRm9yRGVsZXRlKVxufVxuXG5mdW5jdGlvbiBhcHBseVdyYXBwZXIgKGRvY3VtZW50KSB7XG4gIGRvY3VtZW50LmFzdC5jaGlsZHJlbiA9IFt7IFxuICAgIHR5cGU6IFwidW5rbm93blwiLFxuICAgIGlkOiBkb2N1bWVudC5zbHVnLFxuICAgIGRhdGE6e1xuICAgICAgaHRtbE5hbWU6IFwibWFpblwiLFxuICAgICAgaWQ6IGRvY3VtZW50LnNsdWcsXG4gICAgICBodG1sQXR0cmlidXRlczp7XG4gICAgICAgIFwiY2xhc3NcIjogXCJicmllZi1kb2N1bWVudFwiLFxuICAgICAgICBcImlkXCI6IGRvY3VtZW50LnNsdWdcbiAgICAgIH1cbiAgICB9LFxuICAgIGNoaWxkcmVuOiBkb2N1bWVudC5hc3QuY2hpbGRyZW5cbiAgfV1cbn1cblxuZnVuY3Rpb24gcmVzb2x2ZUxpbmtzKGRvY3VtZW50LCBicmllZmNhc2Upe1xuICBpZighYnJpZWZjYXNlKXsgcmV0dXJuIH1cblxuICB2aXNpdChkb2N1bWVudC5hc3QsICdsaW5rJywgZnVuY3Rpb24obm9kZSl7XG4gICAgbGV0IHBhdGhBbGlhcyA9IG5vZGUuaHJlZlxuXG4gICAgbGV0IGNoaWxkcmVuID0gbm9kZS5jaGlsZHJlbiB8fCBbXVxuICAgIGxldCB0ZXh0Tm9kZSA9IG5vZGUuY2hpbGRyZW4uZmluZChub2RlID0+IG5vZGUudHlwZSA9PT0gJ3RleHQnKVxuXG4gICAgaWYodGV4dE5vZGUgJiYgdGV4dE5vZGUudmFsdWUubWF0Y2goL2xpbmtcXDovKSl7XG4gICAgICBub2RlLmhyZWYgPSBicmllZmNhc2UucmVzb2x2ZUxpbmsocGF0aEFsaWFzKVxuICAgICAgbm9kZS5odG1sQXR0cmlidXRlcyA9IG5vZGUuaHRtbEF0dHJpYnV0ZXMgfHwge31cbiAgICAgIG5vZGUuaHRtbEF0dHJpYnV0ZXNbJ2RhdGEtbGluay10byddID0gcGF0aEFsaWFzXG4gICAgfVxuXG4gICAgaWYodGV4dE5vZGUgJiYgdGV4dE5vZGUudmFsdWUubWF0Y2goL2VtYmVkXFw6Lykpe1xuICAgICAgbGV0IGFzc2V0ID0gYnJpZWZjYXNlLmFzc2V0cy5hdChub2RlLmhyZWYpXG5cbiAgICAgIGlmKGFzc2V0KXtcbiAgICAgICAgbm9kZS50eXBlID0gXCJ1bmtub3duXCJcbiAgICAgICAgbm9kZS5kYXRhID0ge1xuICAgICAgICAgIGh0bWxBdHRyaWJ1dGVzOntcbiAgICAgICAgICAgIG5hbWU6IFwiZGl2XCJcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgbm9kZS5jaGlsZHJlbiA9IFt7XG4gICAgICAgICAgdHlwZTogXCJ0ZXh0XCIsXG4gICAgICAgICAgdmFsdWU6IHN0cmluZ3MudW5lc2NhcGVIVE1MKGFzc2V0LmNvbnRlbnQpXG4gICAgICAgIH1dXG4gICAgICB9XG4gICAgfVxuICB9KVxufVxuXG5mdW5jdGlvbiBwcm9jZXNzTGlua3MoZG9jdW1lbnQsIGJyaWVmY2FzZSl7XG4gIHZpc2l0KGRvY3VtZW50LmFzdCwgJ2xpbmsnLCBmdW5jdGlvbihub2RlKXtcbiAgICBpZihub2RlLmh0bWxBdHRyaWJ1dGVzICYmIG5vZGUuaHRtbEF0dHJpYnV0ZXNbJ2RhdGEtbGluay10byddKXtcbiAgICAgIGxldCBsaW5rZWREb2N1bWVudCA9IGJyaWVmY2FzZS5hdChub2RlLmh0bWxBdHRyaWJ1dGVzWydkYXRhLWxpbmstdG8nXSlcbiAgICAgIGxldCB0ZXh0Tm9kZSA9IG5vZGUuY2hpbGRyZW4uZmluZChub2RlID0+IG5vZGUudHlwZSA9PT0gJ3RleHQnKVxuXG4gICAgICBpZih0ZXh0Tm9kZSAmJiB0ZXh0Tm9kZS52YWx1ZS5tYXRjaCgvbGlua1xcOi8pKXtcbiAgICAgICAgdGV4dE5vZGUudmFsdWUgPSBzdHJpbmdzLnN0cmlwKHRleHROb2RlLnZhbHVlLnJlcGxhY2UoL2xpbmtcXDovLCcnKSlcblxuICAgICAgICBpZihsaW5rZWREb2N1bWVudCAmJiB0ZXh0Tm9kZS52YWx1ZSA9PT0gJ3RpdGxlJyl7XG4gICAgICAgICAgdGV4dE5vZGUudmFsdWUgPSBsaW5rZWREb2N1bWVudC50aXRsZVxuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuICB9KVxufVxuXG5mdW5jdGlvbiBwcm9jZXNzQ29kZUJsb2Nrcyhkb2N1bWVudCwgYnJpZWZjYXNlKXtcbiAgbGV0IGluZGV4ID0gMFxuXG4gIGxldCBwYXJzZXJcblxuICB2aXNpdChkb2N1bWVudC5hc3QsICdjb2RlJywgZnVuY3Rpb24obm9kZSl7XG4gICAgbGV0IGRhdGEgPSBub2RlLmRhdGEgPSBub2RlLmRhdGEgfHwge31cbiAgICBsZXQgYXR0cnMgPSBub2RlLmRhdGEuaHRtbEF0dHJpYnV0ZXMgPSBub2RlLmRhdGEuaHRtbEF0dHJpYnV0ZXMgfHwge31cbiAgICBcbiAgICBhdHRycy5pZCA9IGF0dHJzLmlkIHx8IFwiYmxvY2stXCIgKyBpbmRleFxuXG4gICAgaWYobm9kZS5sYW5nID09PSAneWFtbCcgfHwgbm9kZS5sYW5nID09PSAneW1sJyB8fCBub2RlLmxhbmcgPT09ICdkYXRhJyl7XG4gICAgICBwYXJzZXIgPSBwYXJzZXIgfHwgcmVxdWlyZSgnanMteWFtbCcpXG4gICAgICAgICAgICBcbiAgICAgIGlmKG5vZGUudmFsdWUgJiYgIW5vZGUueWFtbCl7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgbm9kZS55YW1sID0gcGFyc2VyLnNhZmVMb2FkKG5vZGUudmFsdWUpXG4gICAgICAgIH0gY2F0Y2goZSl7XG4gICAgICAgICAgZG9jdW1lbnQubG9nKFwiRXJyb3IgcGFyc2luZyB5YW1sXCIsIGUubWVzc2FnZSlcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICBpZihub2RlLmxhbmcgPT09ICdkYXRhJyAmJiBub2RlLnlhbWwpe1xuICAgICAgICBsZXQga2V5ID0gbm9kZS55YW1sLmtleVxuICAgICAgICBcbiAgICAgICAgaWYoa2V5KXtcbiAgICAgICAgICBkZWxldGUobm9kZS55YW1sLmtleSlcblxuICAgICAgICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShkb2N1bWVudC5kYXRhLCBrZXksIHtcbiAgICAgICAgICAgIHZhbHVlOiBub2RlLnlhbWxcbiAgICAgICAgICB9KVxuXG4gICAgICAgICAgbm9kZS55YW1sLmtleSA9IGtleVxuICAgICAgICAgIG5vZGUubWFya0ZvckRlbGV0ZSA9IHRydWVcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBkb2N1bWVudC5sb2coXCJDYW4ndCBwcm9jZXNzIGEgZGF0YSB5YW1sIGJsb2NrIHdpdGhvdXQgYSBrZXkgcHJvcGVydHlcIilcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgXG4gICAgICAvLyB0YWcgdGhpcyBub2RlIGFzIGhhdmluZyBhIHZpZXcgYXNzb2NpYXRlZCB3aXRoIGl0LlxuICAgICAgLy8gd2UgZGVmZXIgYWN0dWFsIHJlbmRlcmluZyB1bnRpbCBsYXRlciBpbiB0aGUgcGlwZWxpbmVcbiAgICAgIGlmKG5vZGUueWFtbCAmJiAobm9kZS55YW1sLnZpZXcgfHwgbm9kZS52aWV3KSl7XG4gICAgICAgIG5vZGUudmlldyA9IG5vZGUudmlldyB8fCBub2RlLnlhbWwudmlldyBcbiAgICAgICAgbm9kZS50eXBlID0gJ3Vua25vd24nXG4gICAgICAgIG5vZGUuY2hpbGRyZW4gPSBbe3R5cGU6J3RleHQnLHZhbHVlOicnfV1cbiAgICAgIH1cblxuICAgICAgbm9kZS5sYW5nID0gJ3lhbWwnXG4gICAgfVxuXG4gICAgaW5kZXggPSBpbmRleCArIDFcbiAgfSlcbn1cbiJdfQ==