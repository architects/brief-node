'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});
exports.process = process;
exports.markdown = markdown;
exports.parse = parse;
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

var pipelines = Object.defineProperties({}, {
  processing: {
    get: function get() {
      return [resolveLinks, nestElements, processCodeBlocks, collapseSections, applyWrapper];
    },
    configurable: true,
    enumerable: true
  },
  rendering: {
    get: function get() {
      return [processLinks];
    },
    configurable: true,
    enumerable: true
  }
});

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
  document.content = readPath(document.path);

  document.ast = parse(document);
  document.runHook("documentWillRender", document.ast);

  pipelines.processing.forEach(function (fn) {
    return fn(document, briefcase);
  });

  Object.defineProperty(document, 'html', {
    configurable: true,
    get: function get() {
      pipelines.rendering.forEach(function (fn) {
        return fn(document, briefcase);
      });
      return stringify(document.ast);
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
        } else {
          document.log("Can't process a data yaml block without a key property");
        }
      }

      node.lang = 'yaml';
    }

    index = index + 1;
  });
}
//# sourceMappingURL=data:application/json;base64,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QUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFBO1NBQ3hDLENBQUMsT0FBTSxDQUFDLEVBQUM7QUFDUixrQkFBUSxDQUFDLEdBQUcsQ0FBQyxvQkFBb0IsRUFBRSxDQUFDLENBQUMsT0FBTyxDQUFDLENBQUE7U0FDOUM7T0FDRjs7QUFFRCxVQUFHLElBQUksQ0FBQyxJQUFJLEtBQUssTUFBTSxJQUFJLElBQUksQ0FBQyxJQUFJLEVBQUM7QUFDbkMsWUFBSSxHQUFHLEdBQUcsSUFBSSxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUE7O0FBRXZCLFlBQUcsR0FBRyxFQUFDO0FBQ0wsaUJBQU8sSUFBSSxDQUFDLElBQUksQ0FBQyxHQUFHLEFBQUMsQ0FBQTs7QUFFckIsZ0JBQU0sQ0FBQyxjQUFjLENBQUMsUUFBUSxDQUFDLElBQUksRUFBRSxHQUFHLEVBQUU7QUFDeEMsaUJBQUssRUFBRSxJQUFJLENBQUMsSUFBSTtXQUNqQixDQUFDLENBQUE7O0FBRUYsY0FBSSxDQUFDLElBQUksQ0FBQyxHQUFHLEdBQUcsR0FBRyxDQUFBO1NBQ3BCLE1BQU07QUFDTCxrQkFBUSxDQUFDLEdBQUcsQ0FBQyx3REFBd0QsQ0FBQyxDQUFBO1NBQ3ZFO09BQ0Y7O0FBRUQsVUFBSSxDQUFDLElBQUksR0FBRyxNQUFNLENBQUE7S0FDbkI7O0FBRUQsU0FBSyxHQUFHLEtBQUssR0FBRyxDQUFDLENBQUE7R0FDbEIsQ0FBQyxDQUFBO0NBQ0giLCJmaWxlIjoicmVuZGVyLmpzIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IG1kYXN0IGZyb20gJ21kYXN0J1xuaW1wb3J0IHlhbWwgZnJvbSAnbWRhc3QteWFtbCdcbmltcG9ydCBodG1sIGZyb20gJ21kYXN0LWh0bWwnXG5pbXBvcnQgZnMgZnJvbSAnZnMnXG5pbXBvcnQgc3F1ZWV6ZSBmcm9tICdtZGFzdC1zcXVlZXplLXBhcmFncmFwaHMnXG5pbXBvcnQgbm9ybWFsaXplIGZyb20gJ21kYXN0LW5vcm1hbGl6ZS1oZWFkaW5ncycgXG5pbXBvcnQgdmlzaXQgZnJvbSAndW5pc3QtdXRpbC12aXNpdCdcbmltcG9ydCBjaGVlcmlvIGZyb20gJ2NoZWVyaW8nXG5pbXBvcnQge2Nsb25lLHNsdWdpZnksZXh0ZW5kfSBmcm9tICcuL3V0aWwnXG5pbXBvcnQgc3RyaW5ncyBmcm9tICd1bmRlcnNjb3JlLnN0cmluZydcblxuY29uc3QgcHJvY2Vzc29yID0gbWRhc3QudXNlKFt5YW1sLHNxdWVlemUsbm9ybWFsaXplLGh0bWxdKVxuXG5jb25zdCBwaXBlbGluZXMgPSB7XG4gIGdldCBwcm9jZXNzaW5nKCl7XG4gICAgcmV0dXJuIFtcbiAgICAgIHJlc29sdmVMaW5rcyxcbiAgICAgIG5lc3RFbGVtZW50cyxcbiAgICAgIHByb2Nlc3NDb2RlQmxvY2tzLFxuICAgICAgY29sbGFwc2VTZWN0aW9ucyxcbiAgICAgIGFwcGx5V3JhcHBlclxuICAgIF1cbiAgfSxcbiAgXG4gIGdldCByZW5kZXJpbmcoKXtcbiAgICByZXR1cm4gW1xuICAgICAgcHJvY2Vzc0xpbmtzXG4gICAgXVxuICB9XG59XG5cbi8qKlxuKiBwcm9jZXNzIGEgYnJpZWYgZG9jdW1lbnQuIHRoaXMgaW52b2x2ZXMgbWFuaXB1bGF0aW5nIFxuKiB0aGUgYXN0IGZyb20gbWRhc3Qgc28gdGhhdCBvdXIgcmVuZGVyZWQgb3V0cHV0IGlzIG5lc3RlZFxuKiBpbiBhIGhpZXJhcmNoeSBvZiBtYWluLCBzZWN0aW9uLCBhcnRpY2xlIGh0bWwgdGFncy5cbipcbiogb3RoZXIgZnVuY3Rpb25zIGFyZSBwZXJmb3JtZWQgZHVyaW5nIHRoaXMgb3BlcmF0aW9uIHRvXG4qIGFzc2lzdCBpbiBleHRyYWN0aW5nIGRhdGEgZnJvbSB0aGUgd3JpdGluZywgZ2VuZXJhdGluZ1xuKiBsaW5rcyB0byBvdGhlciBkb2N1bWVudHMgaW4gdGhlIGJyaWVmY2FzZSwgYW5kIG1vcmUuXG4qXG4qL1xuZXhwb3J0IGZ1bmN0aW9uIHByb2Nlc3MoZG9jdW1lbnQsIGJyaWVmY2FzZSkge1xuICBkb2N1bWVudC5jb250ZW50ID0gcmVhZFBhdGgoZG9jdW1lbnQucGF0aClcblxuICBkb2N1bWVudC5hc3QgPSBwYXJzZShkb2N1bWVudClcbiAgZG9jdW1lbnQucnVuSG9vayhcImRvY3VtZW50V2lsbFJlbmRlclwiLCBkb2N1bWVudC5hc3QpXG4gIFxuICBwaXBlbGluZXMucHJvY2Vzc2luZy5mb3JFYWNoKGZuID0+IGZuKGRvY3VtZW50LCBicmllZmNhc2UpKVxuXG4gIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShkb2N1bWVudCwgJ2h0bWwnLCB7XG4gICAgY29uZmlndXJhYmxlOiB0cnVlLFxuICAgIGdldDogZnVuY3Rpb24oKXtcbiAgICAgIHBpcGVsaW5lcy5yZW5kZXJpbmcuZm9yRWFjaChmbiA9PiBmbihkb2N1bWVudCwgYnJpZWZjYXNlKSlcbiAgICAgIHJldHVybiBzdHJpbmdpZnkoZG9jdW1lbnQuYXN0KVxuICAgIH1cbiAgfSlcblxuICBkb2N1bWVudC4kID0gZnVuY3Rpb24oc2VsZWN0b3Ipe1xuICAgIHJldHVybiBjaGVlcmlvLmxvYWQoZG9jdW1lbnQuaHRtbCkoc2VsZWN0b3IpXG4gIH1cblxuICBkb2N1bWVudC5ydW5Ib29rKFwiZG9jdW1lbnREaWRSZW5kZXJcIiwgZG9jdW1lbnQpXG5cbiAgcmV0dXJuIGRvY3VtZW50XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBtYXJrZG93bigpe1xuICByZXR1cm4gcHJvY2Vzc29yXG59XG5cbi8qKiBcbiogcGFyc2VzIGEgYnJpZWYgZG9jdW1lbnQgYW5kIGV4dHJhY3RzXG4qIHRoZSB5YW1sIGZyb250bWF0dGVyIGFzIGBkb2N1bWVudC5kYXRhYFxuKlxuKi9cbmV4cG9ydCBmdW5jdGlvbiBwYXJzZShkb2N1bWVudCkge1xuICBsZXQgcGFyc2VkID0gcHJvY2Vzc29yLnBhcnNlKGRvY3VtZW50LmNvbnRlbnQpLFxuICAgICAgbm9kZXMgID0gcGFyc2VkLmNoaWxkcmVuXG4gIFxuICBpZihub2Rlc1swXSAmJiBub2Rlc1swXS55YW1sKXtcbiAgICBkb2N1bWVudC5kYXRhID0gbm9kZXMuc2hpZnQoKS55YW1sXG4gIH1cbiAgXG4gIGxldCBhc3QgPSBwcm9jZXNzb3IucnVuKHBhcnNlZClcblxuICBkb2N1bWVudC5ydW5Ib29rKFwiZG9jdW1lbnREaWRQYXJzZVwiLCBhc3QpXG5cbiAgcmV0dXJuIGFzdCBcbn1cblxuXG5leHBvcnQgZnVuY3Rpb24gZnJhZ21lbnQoYXN0LCBvcHRpb25zPXt9KSB7XG4gIHJldHVybiBzdHJpbmdpZnkoe1xuICAgIHR5cGU6ICdyb290JyxcbiAgICBjaGlsZHJlbjogW2FzdF1cbiAgfSlcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHN0cmluZ2lmeShhc3QsIG9wdGlvbnM9e30pIHtcbiAgcmV0dXJuIHByb2Nlc3Nvci5zdHJpbmdpZnkoYXN0LCBvcHRpb25zKVxufVxuXG5mdW5jdGlvbiByZWFkUGF0aChwYXRoKSB7XG4gIHJldHVybiBmcy5yZWFkRmlsZVN5bmMocGF0aCkudG9TdHJpbmcoKVxufVxuXG5mdW5jdGlvbiBuZXN0RWxlbWVudHMoZG9jdW1lbnQpIHtcbiAgbGV0IGNoaWxkcmVuID0gZG9jdW1lbnQuYXN0LmNoaWxkcmVuXG4gIGxldCBoZWFkaW5ncyA9IGRvY3VtZW50LmFzdC5jaGlsZHJlbi5maWx0ZXIoYyA9PiBjLnR5cGUgPT09IFwiaGVhZGluZ1wiKVxuXHRcblx0bGV0IGluZGV4ID0gMFxuXHRsZXQgcHJldmlvdXNcbiAgbGV0IHRvcFxuXG5cdGNoaWxkcmVuLmZvckVhY2goY2hpbGQgPT4ge1xuXHRcdGxldCBkYXRhID0gY2hpbGQuZGF0YSBcbiAgICBcblx0XHRpZihjaGlsZC50eXBlID09PSBcImhlYWRpbmdcIil7XG5cdFx0XHRkZWxldGUoY2hpbGQuZGF0YSlcbiAgICAgIHRvcCA9IGZhbHNlXG4gICAgICBkYXRhID0gZGF0YSB8fCB7fVxuICAgICAgZGF0YS5odG1sTmFtZSA9IFwic2VjdGlvblwiXG4gICAgICBkYXRhLmh0bWxBdHRyaWJ1dGVzID0gZGF0YS5odG1sQXR0cmlidXRlcyB8fCB7fVxuICAgICAgXG4gICAgICBpZihjaGlsZC5kZXB0aCA9PSAxICYmICF0b3Ape1xuICAgICAgICB0b3AgPSB0cnVlXG4gICAgICAgIGRhdGEuaHRtbEF0dHJpYnV0ZXNbJ2RhdGEtdG9wJ10gPSB0cnVlXG4gICAgICB9XG4gICAgICAgIFxuICAgICAgaWYoY2hpbGQuZGVwdGggPj0gMyl7XG4gICAgICAgIGRhdGEuaHRtbE5hbWUgPSBcImFydGljbGVcIlxuICAgICAgfVxuICAgICAgXG4gICAgICBjaGlsZC5kYXRhID0ge31cblxuXHRcdFx0bGV0IHdyYXBwZWQgPSB7XG5cdFx0XHRcdHR5cGU6IGRhdGEuaHRtbE5hbWUsXG4gICAgICAgIGRlcHRoOiBjaGlsZC5kZXB0aCxcblx0XHRcdFx0Y29udGFpbmVyOiB0cnVlLFxuXHRcdFx0XHRkYXRhOiBkYXRhLFxuXHRcdFx0XHRjaGlsZHJlbjogW2NoaWxkXVxuXHRcdFx0fVxuICAgICAgXG4gICAgICB3cmFwcGVkW2RhdGEuaHRtbE5hbWVdID0gdHJ1ZSBcblxuICAgICAgaWYodG9wKXtcbiAgICAgICAgd3JhcHBlZC50b3AgPSB0b3BcbiAgICAgIH1cblxuICAgICAgaWYoY2hpbGQudHlwZSA9PSBcImhlYWRpbmdcIil7XG4gICAgICAgIGxldCB0ZXh0ID0gY2hpbGQuY2hpbGRyZW5bMF0gJiYgY2hpbGQuY2hpbGRyZW5bMF0udmFsdWVcbiAgICAgICAgbGV0IHNsdWcgPSBzbHVnaWZ5KHRleHQpIFxuICAgICAgICBkYXRhLmh0bWxBdHRyaWJ1dGVzWydkYXRhLWhlYWRpbmcnXSA9IHNsdWdcbiAgICAgICAgd3JhcHBlZC5zbHVnID0gc2x1Z1xuICAgICAgICB3cmFwcGVkLmhlYWRpbmcgPSB0ZXh0XG4gICAgICAgIGNoaWxkLmhlYWRpbmcgPSB0ZXh0XG4gICAgICB9XG5cbiAgICAgIHByZXZpb3VzID0gY2hpbGRyZW5baW5kZXhdID0gd3JhcHBlZFxuXG5cdFx0fSBlbHNlIGlmKHByZXZpb3VzKSB7XG5cdFx0XHRwcmV2aW91cy5jaGlsZHJlbi5wdXNoKGNsb25lKGNoaWxkKSlcblx0XHRcdGNoaWxkLm1hcmtGb3JSZW1vdmFsID0gdHJ1ZVxuXHRcdH1cblxuXHRcdGluZGV4ID0gaW5kZXggKyAxXG5cdH0pXG4gIFxuICBkb2N1bWVudC5hc3Qud3JhcHBlZCA9IHRydWVcblx0ZG9jdW1lbnQuYXN0LmNoaWxkcmVuID0gY2hpbGRyZW4uZmlsdGVyKGNoaWxkID0+ICFjaGlsZC5tYXJrRm9yUmVtb3ZhbClcbn1cblxuZnVuY3Rpb24gY29sbGFwc2VTZWN0aW9ucyAoZG9jdW1lbnQpe1xuICBsZXQgY2hpbGRyZW4gPSBkb2N1bWVudC5hc3QuY2hpbGRyZW5cbiAgbGV0IHByZXZpb3VzXG4gICBcbiAgY2hpbGRyZW4uZm9yRWFjaChjaGlsZCA9PiB7XG4gICAgbGV0IG5hbWUgPSBjaGlsZC5kYXRhICYmIGNoaWxkLmRhdGEuaHRtbE5hbWVcbiAgICBpZihuYW1lID09PSBcInNlY3Rpb25cIil7XG4gICAgICBwcmV2aW91cyA9IGNoaWxkXG4gICAgICBjaGlsZC5kZWJ1ZyA9IHRydWVcbiAgICAgIGNoaWxkLnNlY3Rpb24gPSB0cnVlXG4gICAgfVxuXG4gICAgaWYocHJldmlvdXMgJiYgbmFtZSA9PT0gXCJhcnRpY2xlXCIpe1xuICAgICAgbGV0IGNsb25lZCA9IGNsb25lKGNoaWxkKVxuICAgICAgY2xvbmVkLnBhcmVudCA9IHByZXZpb3VzLnNsdWdcbiAgICAgIHByZXZpb3VzLmNoaWxkcmVuLnB1c2goY2xvbmVkKVxuICAgICAgY2hpbGQubWFya0ZvckRlbGV0ZSA9IHRydWVcbiAgICB9XG4gIH0pXG5cbiAgZG9jdW1lbnQuYXN0LmNoaWxkcmVuID0gY2hpbGRyZW4uZmlsdGVyKGNoaWxkID0+ICFjaGlsZC5tYXJrRm9yRGVsZXRlKVxufVxuXG5mdW5jdGlvbiBhcHBseVdyYXBwZXIgKGRvY3VtZW50KSB7XG4gIGRvY3VtZW50LmFzdC5jaGlsZHJlbiA9IFt7IFxuICAgIHR5cGU6IFwidW5rbm93blwiLFxuICAgIGRhdGE6e1xuICAgICAgaHRtbE5hbWU6IFwibWFpblwiLFxuICAgICAgaHRtbEF0dHJpYnV0ZXM6e1xuICAgICAgICBcImNsYXNzXCI6IFwiYnJpZWYtZG9jdW1lbnRcIlxuICAgICAgfVxuICAgIH0sXG4gICAgY2hpbGRyZW46IGRvY3VtZW50LmFzdC5jaGlsZHJlblxuICB9XVxufVxuXG5mdW5jdGlvbiByZXNvbHZlTGlua3MoZG9jdW1lbnQsIGJyaWVmY2FzZSl7XG4gIGlmKCFicmllZmNhc2UpeyByZXR1cm4gfVxuXG4gIHZpc2l0KGRvY3VtZW50LmFzdCwgJ2xpbmsnLCBmdW5jdGlvbihub2RlKXtcbiAgICBsZXQgcGF0aEFsaWFzID0gbm9kZS5ocmVmXG5cbiAgICBsZXQgY2hpbGRyZW4gPSBub2RlLmNoaWxkcmVuIHx8IFtdXG4gICAgbGV0IHRleHROb2RlID0gbm9kZS5jaGlsZHJlbi5maW5kKG5vZGUgPT4gbm9kZS50eXBlID09PSAndGV4dCcpXG5cbiAgICBpZih0ZXh0Tm9kZSAmJiB0ZXh0Tm9kZS52YWx1ZS5tYXRjaCgvbGlua1xcOi8pKXtcbiAgICAgIG5vZGUuaHJlZiA9IGJyaWVmY2FzZS5yZXNvbHZlTGluayhwYXRoQWxpYXMpXG4gICAgICBub2RlLmh0bWxBdHRyaWJ1dGVzID0gbm9kZS5odG1sQXR0cmlidXRlcyB8fCB7fVxuICAgICAgbm9kZS5odG1sQXR0cmlidXRlc1snZGF0YS1saW5rLXRvJ10gPSBwYXRoQWxpYXNcbiAgICB9XG5cbiAgICBpZih0ZXh0Tm9kZSAmJiB0ZXh0Tm9kZS52YWx1ZS5tYXRjaCgvZW1iZWRcXDovKSl7XG4gICAgICBsZXQgYXNzZXQgPSBicmllZmNhc2UuYXNzZXRzLmF0KG5vZGUuaHJlZilcblxuICAgICAgaWYoYXNzZXQpe1xuICAgICAgICBub2RlLnR5cGUgPSBcInVua25vd25cIlxuICAgICAgICBub2RlLmRhdGEgPSB7XG4gICAgICAgICAgaHRtbEF0dHJpYnV0ZXM6e1xuICAgICAgICAgICAgbmFtZTogXCJkaXZcIlxuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBub2RlLmNoaWxkcmVuID0gW3tcbiAgICAgICAgICB0eXBlOiBcInRleHRcIixcbiAgICAgICAgICB2YWx1ZTogc3RyaW5ncy51bmVzY2FwZUhUTUwoYXNzZXQuY29udGVudClcbiAgICAgICAgfV1cbiAgICAgIH1cbiAgICB9XG4gIH0pXG59XG5cbmZ1bmN0aW9uIHByb2Nlc3NMaW5rcyhkb2N1bWVudCwgYnJpZWZjYXNlKXtcbiAgdmlzaXQoZG9jdW1lbnQuYXN0LCAnbGluaycsIGZ1bmN0aW9uKG5vZGUpe1xuICAgIGlmKG5vZGUuaHRtbEF0dHJpYnV0ZXMgJiYgbm9kZS5odG1sQXR0cmlidXRlc1snZGF0YS1saW5rLXRvJ10pe1xuICAgICAgbGV0IGxpbmtlZERvY3VtZW50ID0gYnJpZWZjYXNlLmF0KG5vZGUuaHRtbEF0dHJpYnV0ZXNbJ2RhdGEtbGluay10byddKVxuICAgICAgbGV0IHRleHROb2RlID0gbm9kZS5jaGlsZHJlbi5maW5kKG5vZGUgPT4gbm9kZS50eXBlID09PSAndGV4dCcpXG5cbiAgICAgIGlmKHRleHROb2RlICYmIHRleHROb2RlLnZhbHVlLm1hdGNoKC9saW5rXFw6Lykpe1xuICAgICAgICB0ZXh0Tm9kZS52YWx1ZSA9IHN0cmluZ3Muc3RyaXAodGV4dE5vZGUudmFsdWUucmVwbGFjZSgvbGlua1xcOi8sJycpKVxuXG4gICAgICAgIGlmKGxpbmtlZERvY3VtZW50ICYmIHRleHROb2RlLnZhbHVlID09PSAndGl0bGUnKXtcbiAgICAgICAgICB0ZXh0Tm9kZS52YWx1ZSA9IGxpbmtlZERvY3VtZW50LnRpdGxlXG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG4gIH0pXG59XG5cbmZ1bmN0aW9uIHByb2Nlc3NDb2RlQmxvY2tzKGRvY3VtZW50LCBicmllZmNhc2Upe1xuICBsZXQgaW5kZXggPSAwXG5cbiAgbGV0IHBhcnNlclxuXG4gIHZpc2l0KGRvY3VtZW50LmFzdCwgJ2NvZGUnLCBmdW5jdGlvbihub2RlKXtcbiAgICBsZXQgZGF0YSA9IG5vZGUuZGF0YSA9IG5vZGUuZGF0YSB8fCB7fVxuICAgIGxldCBhdHRycyA9IG5vZGUuZGF0YS5odG1sQXR0cmlidXRlcyA9IG5vZGUuZGF0YS5odG1sQXR0cmlidXRlcyB8fCB7fVxuICAgIFxuICAgIGF0dHJzLmlkID0gYXR0cnMuaWQgfHwgXCJibG9jay1cIiArIGluZGV4XG4gICAgXG4gICAgaWYobm9kZS5sYW5nID09PSAneWFtbCcgfHwgbm9kZS5sYW5nID09PSAneW1sJyB8fCBub2RlLmxhbmcgPT09ICdkYXRhJyl7XG4gICAgICBwYXJzZXIgPSBwYXJzZXIgfHwgcmVxdWlyZSgnanMteWFtbCcpXG4gICAgICBcbiAgICAgIGlmKG5vZGUudmFsdWUgJiYgIW5vZGUueWFtbCl7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgbm9kZS55YW1sID0gcGFyc2VyLnNhZmVMb2FkKG5vZGUudmFsdWUpXG4gICAgICAgIH0gY2F0Y2goZSl7XG4gICAgICAgICAgZG9jdW1lbnQubG9nKFwiRXJyb3IgcGFyc2luZyB5YW1sXCIsIGUubWVzc2FnZSlcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICBpZihub2RlLmxhbmcgPT09ICdkYXRhJyAmJiBub2RlLnlhbWwpe1xuICAgICAgICBsZXQga2V5ID0gbm9kZS55YW1sLmtleVxuICAgICAgICBcbiAgICAgICAgaWYoa2V5KXtcbiAgICAgICAgICBkZWxldGUobm9kZS55YW1sLmtleSlcblxuICAgICAgICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShkb2N1bWVudC5kYXRhLCBrZXksIHtcbiAgICAgICAgICAgIHZhbHVlOiBub2RlLnlhbWxcbiAgICAgICAgICB9KVxuXG4gICAgICAgICAgbm9kZS55YW1sLmtleSA9IGtleVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIGRvY3VtZW50LmxvZyhcIkNhbid0IHByb2Nlc3MgYSBkYXRhIHlhbWwgYmxvY2sgd2l0aG91dCBhIGtleSBwcm9wZXJ0eVwiKVxuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIG5vZGUubGFuZyA9ICd5YW1sJ1xuICAgIH1cblxuICAgIGluZGV4ID0gaW5kZXggKyAxXG4gIH0pXG59XG4iXX0=