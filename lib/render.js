'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});
exports.parse = parse;
exports.process = process;

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

var _underscore = require('underscore');

var _underscore2 = _interopRequireDefault(_underscore);

var _mdastUtilVisit = require('mdast-util-visit');

var _mdastUtilVisit2 = _interopRequireDefault(_mdastUtilVisit);

var _underscoreString = require('underscore.string');

var _underscoreString2 = _interopRequireDefault(_underscoreString);

var _cheerio = require('cheerio');

var _cheerio2 = _interopRequireDefault(_cheerio);

var processor = _mdast2['default'].use([_mdastYaml2['default'], _mdastSqueezeParagraphs2['default'], _mdastNormalizeHeadings2['default'], _mdastHtml2['default']]);
var clone = _underscore2['default'].clone;

function parse(document) {
  var parsed = processor.parse(document.content),
      nodes = parsed.children;

  if (nodes[0] && nodes[0].yaml) {
    document.data = nodes.splice(0, 1)[0].yaml;
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

  document.html = stringify(document);
  document.$ = _cheerio2['default'].load(document.html);

  document.runHook("documentDidRender", document.html);

  return document;
}

function stringify(document) {
  var options = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

  return processor.stringify(document.ast, options);
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

      var text = child.children[0] && child.children[0].value;
      var slug = undefined;

      if (text) {
        slug = _underscoreString2['default'].dasherize(text.toLowerCase());
        data.htmlAttributes['data-heading'] = slug;
        wrapped.slug = slug;
      }

      previous = children[index] = wrapped;
    } else if (previous) {
      previous.children.push(_underscore2['default'].clone(child));
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
      child.section = true;
    }

    if (previous && name === "article") {
      previous.children.push(clone(child));
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
//# sourceMappingURL=data:application/json;base64,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QUFBO0FBQ2hCLFdBQUssQ0FBQyxPQUFPLEdBQUcsSUFBSSxDQUFBO0tBQ3JCOztBQUVELFFBQUcsUUFBUSxJQUFJLElBQUksS0FBSyxTQUFTLEVBQUM7QUFDaEMsY0FBUSxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUE7QUFDcEMsV0FBSyxDQUFDLGFBQWEsR0FBRyxJQUFJLENBQUE7S0FDM0I7R0FDRixDQUFDLENBQUE7O0FBRUYsVUFBUSxDQUFDLEdBQUcsQ0FBQyxRQUFRLEdBQUcsUUFBUSxDQUFDLE1BQU0sQ0FBQyxVQUFBLEtBQUs7V0FBSSxDQUFDLEtBQUssQ0FBQyxhQUFhO0dBQUEsQ0FBQyxDQUFBO0NBQ3ZFOztBQUVELFNBQVMsWUFBWSxDQUFFLFFBQVEsRUFBRTtBQUMvQixVQUFRLENBQUMsR0FBRyxDQUFDLFFBQVEsR0FBRyxDQUFDO0FBQ3ZCLFFBQUksRUFBRSxTQUFTO0FBQ2YsUUFBSSxFQUFDO0FBQ0gsY0FBUSxFQUFFLE1BQU07QUFDaEIsb0JBQWMsRUFBQztBQUNiLGVBQU8sRUFBRSxnQkFBZ0I7T0FDMUI7S0FDRjtBQUNELFlBQVEsRUFBRSxRQUFRLENBQUMsR0FBRyxDQUFDLFFBQVE7R0FDaEMsQ0FBQyxDQUFBO0NBQ0giLCJmaWxlIjoicmVuZGVyLmpzIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IG1kYXN0IGZyb20gJ21kYXN0J1xuaW1wb3J0IHlhbWwgZnJvbSAnbWRhc3QteWFtbCdcbmltcG9ydCBodG1sIGZyb20gJ21kYXN0LWh0bWwnXG5pbXBvcnQgZnMgZnJvbSAnZnMnXG5pbXBvcnQgc3F1ZWV6ZSBmcm9tICdtZGFzdC1zcXVlZXplLXBhcmFncmFwaHMnXG5pbXBvcnQgbm9ybWFsaXplIGZyb20gJ21kYXN0LW5vcm1hbGl6ZS1oZWFkaW5ncycgXG5pbXBvcnQgXyBmcm9tICd1bmRlcnNjb3JlJ1xuaW1wb3J0IHZpc2l0IGZyb20gJ21kYXN0LXV0aWwtdmlzaXQnXG5pbXBvcnQgaW5mbGVjdGlvbnMgZnJvbSAndW5kZXJzY29yZS5zdHJpbmcnXG5pbXBvcnQgY2hlZXJpbyBmcm9tICdjaGVlcmlvJ1xuXG5jb25zdCBwcm9jZXNzb3IgPSBtZGFzdC51c2UoW3lhbWwsc3F1ZWV6ZSxub3JtYWxpemUsaHRtbF0pXG5jb25zdCBjbG9uZSA9IF8uY2xvbmVcblxuZXhwb3J0IGZ1bmN0aW9uIHBhcnNlKGRvY3VtZW50KSB7XG4gIGxldCBwYXJzZWQgPSBwcm9jZXNzb3IucGFyc2UoZG9jdW1lbnQuY29udGVudCksXG4gICAgICBub2RlcyAgPSBwYXJzZWQuY2hpbGRyZW5cbiAgXG4gIGlmKG5vZGVzWzBdICYmIG5vZGVzWzBdLnlhbWwpe1xuICAgIGRvY3VtZW50LmRhdGEgPSBub2Rlcy5zcGxpY2UoMCwxKVswXS55YW1sXG4gIH1cbiAgXG4gIGxldCBhc3QgPSBwcm9jZXNzb3IucnVuKHBhcnNlZClcblxuICBkb2N1bWVudC5ydW5Ib29rKFwiZG9jdW1lbnREaWRQYXJzZVwiLCBhc3QpXG5cbiAgcmV0dXJuIGFzdCBcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHByb2Nlc3MoZG9jdW1lbnQpIHtcbiAgZG9jdW1lbnQuY29udGVudCA9IHJlYWRQYXRoKGRvY3VtZW50LnBhdGgpXG5cbiAgZG9jdW1lbnQuYXN0ID0gcGFyc2UoZG9jdW1lbnQpXG4gIGRvY3VtZW50LnJ1bkhvb2soXCJkb2N1bWVudFdpbGxSZW5kZXJcIiwgZG9jdW1lbnQuYXN0KVxuICBcbiAgbmVzdEVsZW1lbnRzKGRvY3VtZW50KVxuICBjb2xsYXBzZVNlY3Rpb25zKGRvY3VtZW50KVxuICBhcHBseVdyYXBwZXIoZG9jdW1lbnQpXG5cbiAgZG9jdW1lbnQuaHRtbCA9IHN0cmluZ2lmeShkb2N1bWVudClcbiAgZG9jdW1lbnQuJCA9IGNoZWVyaW8ubG9hZChkb2N1bWVudC5odG1sKVxuXG4gIGRvY3VtZW50LnJ1bkhvb2soXCJkb2N1bWVudERpZFJlbmRlclwiLCBkb2N1bWVudC5odG1sKVxuXG4gIHJldHVybiBkb2N1bWVudFxufVxuXG5mdW5jdGlvbiBzdHJpbmdpZnkoZG9jdW1lbnQsIG9wdGlvbnM9e30pIHtcbiAgcmV0dXJuIHByb2Nlc3Nvci5zdHJpbmdpZnkoZG9jdW1lbnQuYXN0LCBvcHRpb25zKVxufVxuXG5mdW5jdGlvbiByZWFkUGF0aChwYXRoKSB7XG4gIHJldHVybiBmcy5yZWFkRmlsZVN5bmMocGF0aCkudG9TdHJpbmcoKVxufVxuXG5mdW5jdGlvbiBuZXN0RWxlbWVudHMoZG9jdW1lbnQpIHtcbiAgbGV0IGNoaWxkcmVuID0gZG9jdW1lbnQuYXN0LmNoaWxkcmVuXG4gIGxldCBoZWFkaW5ncyA9IGRvY3VtZW50LmFzdC5jaGlsZHJlbi5maWx0ZXIoYyA9PiBjLnR5cGUgPT09IFwiaGVhZGluZ1wiKVxuXHRcblx0bGV0IGluZGV4ID0gMFxuXHRsZXQgcHJldmlvdXNcbiAgbGV0IHRvcFxuXG5cdGNoaWxkcmVuLmZvckVhY2goY2hpbGQgPT4ge1xuXHRcdGxldCBkYXRhID0gY2hpbGQuZGF0YSBcbiAgICBcblx0XHRpZihjaGlsZC50eXBlID09PSBcImhlYWRpbmdcIil7XG5cdFx0XHRkZWxldGUoY2hpbGQuZGF0YSlcbiAgICAgIHRvcCA9IGZhbHNlXG4gICAgICBkYXRhID0gZGF0YSB8fCB7fVxuICAgICAgZGF0YS5odG1sTmFtZSA9IFwic2VjdGlvblwiXG4gICAgICBkYXRhLmh0bWxBdHRyaWJ1dGVzID0gZGF0YS5odG1sQXR0cmlidXRlcyB8fCB7fVxuICAgICAgXG4gICAgICBpZihjaGlsZC5kZXB0aCA9PSAxICYmICF0b3Ape1xuICAgICAgICB0b3AgPSB0cnVlXG4gICAgICAgIGRhdGEuaHRtbEF0dHJpYnV0ZXNbJ2RhdGEtdG9wJ10gPSB0cnVlXG4gICAgICB9XG4gICAgICAgIFxuICAgICAgaWYoY2hpbGQuZGVwdGggPj0gMyl7XG4gICAgICAgIGRhdGEuaHRtbE5hbWUgPSBcImFydGljbGVcIlxuICAgICAgfVxuICAgICAgXG4gICAgICBjaGlsZC5kYXRhID0ge31cblxuXHRcdFx0bGV0IHdyYXBwZWQgPSB7XG5cdFx0XHRcdHR5cGU6IGRhdGEuaHRtbE5hbWUsXG4gICAgICAgIGRlcHRoOiBjaGlsZC5kZXB0aCxcblx0XHRcdFx0Y29udGFpbmVyOiB0cnVlLFxuXHRcdFx0XHRkYXRhOiBkYXRhLFxuXHRcdFx0XHRjaGlsZHJlbjogW2NoaWxkXVxuXHRcdFx0fVxuICAgICAgXG4gICAgICB3cmFwcGVkW2RhdGEuaHRtbE5hbWVdID0gdHJ1ZSBcblxuICAgICAgaWYodG9wKXtcbiAgICAgICAgd3JhcHBlZC50b3AgPSB0b3BcbiAgICAgIH1cblxuICAgICAgbGV0IHRleHQgPSBjaGlsZC5jaGlsZHJlblswXSAmJiBjaGlsZC5jaGlsZHJlblswXS52YWx1ZVxuICAgICAgbGV0IHNsdWdcblxuICAgICAgaWYodGV4dCl7XG4gICAgICAgIHNsdWcgPSBpbmZsZWN0aW9ucy5kYXNoZXJpemUodGV4dC50b0xvd2VyQ2FzZSgpKVxuICAgICAgICBkYXRhLmh0bWxBdHRyaWJ1dGVzWydkYXRhLWhlYWRpbmcnXSA9IHNsdWdcbiAgICAgICAgd3JhcHBlZC5zbHVnID0gc2x1Z1xuICAgICAgfVxuXG4gICAgICBwcmV2aW91cyA9IGNoaWxkcmVuW2luZGV4XSA9IHdyYXBwZWRcblxuXHRcdH0gZWxzZSBpZihwcmV2aW91cykge1xuXHRcdFx0cHJldmlvdXMuY2hpbGRyZW4ucHVzaChfLmNsb25lKGNoaWxkKSlcblx0XHRcdGNoaWxkLm1hcmtGb3JSZW1vdmFsID0gdHJ1ZVxuXHRcdH1cblxuXHRcdGluZGV4ID0gaW5kZXggKyAxXG5cdH0pXG4gIFxuICBkb2N1bWVudC5hc3Qud3JhcHBlZCA9IHRydWVcblx0ZG9jdW1lbnQuYXN0LmNoaWxkcmVuID0gY2hpbGRyZW4uZmlsdGVyKGNoaWxkID0+ICFjaGlsZC5tYXJrRm9yUmVtb3ZhbClcbn1cblxuZnVuY3Rpb24gY29sbGFwc2VTZWN0aW9ucyAoZG9jdW1lbnQpe1xuICBsZXQgY2hpbGRyZW4gPSBkb2N1bWVudC5hc3QuY2hpbGRyZW5cbiAgbGV0IHByZXZpb3VzXG5cbiAgY2hpbGRyZW4uZm9yRWFjaChjaGlsZCA9PiB7XG4gICAgbGV0IG5hbWUgPSBjaGlsZC5kYXRhICYmIGNoaWxkLmRhdGEuaHRtbE5hbWVcbiAgICBpZihuYW1lID09PSBcInNlY3Rpb25cIil7XG4gICAgICBwcmV2aW91cyA9IGNoaWxkXG4gICAgICBjaGlsZC5zZWN0aW9uID0gdHJ1ZVxuICAgIH1cblxuICAgIGlmKHByZXZpb3VzICYmIG5hbWUgPT09IFwiYXJ0aWNsZVwiKXtcbiAgICAgIHByZXZpb3VzLmNoaWxkcmVuLnB1c2goY2xvbmUoY2hpbGQpKVxuICAgICAgY2hpbGQubWFya0ZvckRlbGV0ZSA9IHRydWVcbiAgICB9XG4gIH0pXG5cbiAgZG9jdW1lbnQuYXN0LmNoaWxkcmVuID0gY2hpbGRyZW4uZmlsdGVyKGNoaWxkID0+ICFjaGlsZC5tYXJrRm9yRGVsZXRlKVxufVxuXG5mdW5jdGlvbiBhcHBseVdyYXBwZXIgKGRvY3VtZW50KSB7XG4gIGRvY3VtZW50LmFzdC5jaGlsZHJlbiA9IFt7IFxuICAgIHR5cGU6IFwidW5rbm93blwiLFxuICAgIGRhdGE6e1xuICAgICAgaHRtbE5hbWU6IFwibWFpblwiLFxuICAgICAgaHRtbEF0dHJpYnV0ZXM6e1xuICAgICAgICBcImNsYXNzXCI6IFwiYnJpZWYtZG9jdW1lbnRcIlxuICAgICAgfVxuICAgIH0sXG4gICAgY2hpbGRyZW46IGRvY3VtZW50LmFzdC5jaGlsZHJlblxuICB9XVxufVxuIl19