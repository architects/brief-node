'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});
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
//# sourceMappingURL=data:application/json;base64,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TyxDQUFDLFVBQUEsS0FBSyxFQUFJO0FBQ3hCLFFBQUksSUFBSSxHQUFHLEtBQUssQ0FBQyxJQUFJLElBQUksS0FBSyxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUE7QUFDNUMsUUFBRyxJQUFJLEtBQUssU0FBUyxFQUFDO0FBQ3BCLGNBQVEsR0FBRyxLQUFLLENBQUE7QUFDaEIsV0FBSyxDQUFDLEtBQUssR0FBRyxJQUFJLENBQUE7QUFDbEIsV0FBSyxDQUFDLE9BQU8sR0FBRyxJQUFJLENBQUE7S0FDckI7O0FBRUQsUUFBRyxRQUFRLElBQUksSUFBSSxLQUFLLFNBQVMsRUFBQztBQUNoQyxVQUFJLE1BQU0sR0FBRyxpQkFBTSxLQUFLLENBQUMsQ0FBQTtBQUN6QixZQUFNLENBQUMsTUFBTSxHQUFHLFFBQVEsQ0FBQyxJQUFJLENBQUE7QUFDN0IsY0FBUSxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUE7QUFDOUIsV0FBSyxDQUFDLGFBQWEsR0FBRyxJQUFJLENBQUE7S0FDM0I7R0FDRixDQUFDLENBQUE7O0FBRUYsVUFBUSxDQUFDLEdBQUcsQ0FBQyxRQUFRLEdBQUcsUUFBUSxDQUFDLE1BQU0sQ0FBQyxVQUFBLEtBQUs7V0FBSSxDQUFDLEtBQUssQ0FBQyxhQUFhO0dBQUEsQ0FBQyxDQUFBO0NBQ3ZFOztBQUVELFNBQVMsWUFBWSxDQUFFLFFBQVEsRUFBRTtBQUMvQixVQUFRLENBQUMsR0FBRyxDQUFDLFFBQVEsR0FBRyxDQUFDO0FBQ3ZCLFFBQUksRUFBRSxTQUFTO0FBQ2YsUUFBSSxFQUFDO0FBQ0gsY0FBUSxFQUFFLE1BQU07QUFDaEIsb0JBQWMsRUFBQztBQUNiLGVBQU8sRUFBRSxnQkFBZ0I7T0FDMUI7S0FDRjtBQUNELFlBQVEsRUFBRSxRQUFRLENBQUMsR0FBRyxDQUFDLFFBQVE7R0FDaEMsQ0FBQyxDQUFBO0NBQ0giLCJmaWxlIjoicmVuZGVyLmpzIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IG1kYXN0IGZyb20gJ21kYXN0J1xuaW1wb3J0IHlhbWwgZnJvbSAnbWRhc3QteWFtbCdcbmltcG9ydCBodG1sIGZyb20gJ21kYXN0LWh0bWwnXG5pbXBvcnQgZnMgZnJvbSAnZnMnXG5pbXBvcnQgc3F1ZWV6ZSBmcm9tICdtZGFzdC1zcXVlZXplLXBhcmFncmFwaHMnXG5pbXBvcnQgbm9ybWFsaXplIGZyb20gJ21kYXN0LW5vcm1hbGl6ZS1oZWFkaW5ncycgXG5pbXBvcnQgdmlzaXQgZnJvbSAndW5pc3QtdXRpbC12aXNpdCdcbmltcG9ydCBjaGVlcmlvIGZyb20gJ2NoZWVyaW8nXG5pbXBvcnQge2Nsb25lLHNsdWdpZnl9IGZyb20gJy4vdXRpbCdcblxuY29uc3QgcHJvY2Vzc29yID0gbWRhc3QudXNlKFt5YW1sLHNxdWVlemUsbm9ybWFsaXplLGh0bWxdKVxuXG5leHBvcnQgZnVuY3Rpb24gcGFyc2UoZG9jdW1lbnQpIHtcbiAgbGV0IHBhcnNlZCA9IHByb2Nlc3Nvci5wYXJzZShkb2N1bWVudC5jb250ZW50KSxcbiAgICAgIG5vZGVzICA9IHBhcnNlZC5jaGlsZHJlblxuICBcbiAgaWYobm9kZXNbMF0gJiYgbm9kZXNbMF0ueWFtbCl7XG4gICAgZG9jdW1lbnQuZGF0YSA9IG5vZGVzLnNoaWZ0KCkueWFtbFxuICB9XG4gIFxuICBsZXQgYXN0ID0gcHJvY2Vzc29yLnJ1bihwYXJzZWQpXG5cbiAgZG9jdW1lbnQucnVuSG9vayhcImRvY3VtZW50RGlkUGFyc2VcIiwgYXN0KVxuXG4gIHJldHVybiBhc3QgXG59XG5cbmV4cG9ydCBmdW5jdGlvbiBwcm9jZXNzKGRvY3VtZW50KSB7XG4gIGRvY3VtZW50LmNvbnRlbnQgPSByZWFkUGF0aChkb2N1bWVudC5wYXRoKVxuXG4gIGRvY3VtZW50LmFzdCA9IHBhcnNlKGRvY3VtZW50KVxuICBkb2N1bWVudC5ydW5Ib29rKFwiZG9jdW1lbnRXaWxsUmVuZGVyXCIsIGRvY3VtZW50LmFzdClcbiAgXG4gIG5lc3RFbGVtZW50cyhkb2N1bWVudClcbiAgY29sbGFwc2VTZWN0aW9ucyhkb2N1bWVudClcbiAgYXBwbHlXcmFwcGVyKGRvY3VtZW50KVxuXG4gIGRvY3VtZW50Lmh0bWwgPSBzdHJpbmdpZnkoZG9jdW1lbnQuYXN0KVxuICBkb2N1bWVudC4kID0gZnVuY3Rpb24oc2VsZWN0b3Ipe1xuICAgIHJldHVybiBjaGVlcmlvLmxvYWQoZG9jdW1lbnQuaHRtbCkoc2VsZWN0b3IpXG4gIH1cblxuICBkb2N1bWVudC5ydW5Ib29rKFwiZG9jdW1lbnREaWRSZW5kZXJcIiwgZG9jdW1lbnQuaHRtbClcblxuICByZXR1cm4gZG9jdW1lbnRcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGZyYWdtZW50KGFzdCwgb3B0aW9ucz17fSkge1xuICByZXR1cm4gc3RyaW5naWZ5KHtcbiAgICB0eXBlOiAncm9vdCcsXG4gICAgY2hpbGRyZW46IFthc3RdXG4gIH0pXG59XG5cbmV4cG9ydCBmdW5jdGlvbiBzdHJpbmdpZnkoYXN0LCBvcHRpb25zPXt9KSB7XG4gIHJldHVybiBwcm9jZXNzb3Iuc3RyaW5naWZ5KGFzdCwgb3B0aW9ucylcbn1cblxuZnVuY3Rpb24gcmVhZFBhdGgocGF0aCkge1xuICByZXR1cm4gZnMucmVhZEZpbGVTeW5jKHBhdGgpLnRvU3RyaW5nKClcbn1cblxuZnVuY3Rpb24gbmVzdEVsZW1lbnRzKGRvY3VtZW50KSB7XG4gIGxldCBjaGlsZHJlbiA9IGRvY3VtZW50LmFzdC5jaGlsZHJlblxuICBsZXQgaGVhZGluZ3MgPSBkb2N1bWVudC5hc3QuY2hpbGRyZW4uZmlsdGVyKGMgPT4gYy50eXBlID09PSBcImhlYWRpbmdcIilcblx0XG5cdGxldCBpbmRleCA9IDBcblx0bGV0IHByZXZpb3VzXG4gIGxldCB0b3BcblxuXHRjaGlsZHJlbi5mb3JFYWNoKGNoaWxkID0+IHtcblx0XHRsZXQgZGF0YSA9IGNoaWxkLmRhdGEgXG4gICAgXG5cdFx0aWYoY2hpbGQudHlwZSA9PT0gXCJoZWFkaW5nXCIpe1xuXHRcdFx0ZGVsZXRlKGNoaWxkLmRhdGEpXG4gICAgICB0b3AgPSBmYWxzZVxuICAgICAgZGF0YSA9IGRhdGEgfHwge31cbiAgICAgIGRhdGEuaHRtbE5hbWUgPSBcInNlY3Rpb25cIlxuICAgICAgZGF0YS5odG1sQXR0cmlidXRlcyA9IGRhdGEuaHRtbEF0dHJpYnV0ZXMgfHwge31cbiAgICAgIFxuICAgICAgaWYoY2hpbGQuZGVwdGggPT0gMSAmJiAhdG9wKXtcbiAgICAgICAgdG9wID0gdHJ1ZVxuICAgICAgICBkYXRhLmh0bWxBdHRyaWJ1dGVzWydkYXRhLXRvcCddID0gdHJ1ZVxuICAgICAgfVxuICAgICAgICBcbiAgICAgIGlmKGNoaWxkLmRlcHRoID49IDMpe1xuICAgICAgICBkYXRhLmh0bWxOYW1lID0gXCJhcnRpY2xlXCJcbiAgICAgIH1cbiAgICAgIFxuICAgICAgY2hpbGQuZGF0YSA9IHt9XG5cblx0XHRcdGxldCB3cmFwcGVkID0ge1xuXHRcdFx0XHR0eXBlOiBkYXRhLmh0bWxOYW1lLFxuICAgICAgICBkZXB0aDogY2hpbGQuZGVwdGgsXG5cdFx0XHRcdGNvbnRhaW5lcjogdHJ1ZSxcblx0XHRcdFx0ZGF0YTogZGF0YSxcblx0XHRcdFx0Y2hpbGRyZW46IFtjaGlsZF1cblx0XHRcdH1cbiAgICAgIFxuICAgICAgd3JhcHBlZFtkYXRhLmh0bWxOYW1lXSA9IHRydWUgXG5cbiAgICAgIGlmKHRvcCl7XG4gICAgICAgIHdyYXBwZWQudG9wID0gdG9wXG4gICAgICB9XG5cbiAgICAgIGlmKGNoaWxkLnR5cGUgPT0gXCJoZWFkaW5nXCIpe1xuICAgICAgICBsZXQgdGV4dCA9IGNoaWxkLmNoaWxkcmVuWzBdICYmIGNoaWxkLmNoaWxkcmVuWzBdLnZhbHVlXG4gICAgICAgIGxldCBzbHVnID0gc2x1Z2lmeSh0ZXh0KSBcbiAgICAgICAgZGF0YS5odG1sQXR0cmlidXRlc1snZGF0YS1oZWFkaW5nJ10gPSBzbHVnXG4gICAgICAgIHdyYXBwZWQuc2x1ZyA9IHNsdWdcbiAgICAgICAgd3JhcHBlZC5oZWFkaW5nID0gdGV4dFxuICAgICAgICBjaGlsZC5oZWFkaW5nID0gdGV4dFxuICAgICAgfVxuXG4gICAgICBwcmV2aW91cyA9IGNoaWxkcmVuW2luZGV4XSA9IHdyYXBwZWRcblxuXHRcdH0gZWxzZSBpZihwcmV2aW91cykge1xuXHRcdFx0cHJldmlvdXMuY2hpbGRyZW4ucHVzaChjbG9uZShjaGlsZCkpXG5cdFx0XHRjaGlsZC5tYXJrRm9yUmVtb3ZhbCA9IHRydWVcblx0XHR9XG5cblx0XHRpbmRleCA9IGluZGV4ICsgMVxuXHR9KVxuICBcbiAgZG9jdW1lbnQuYXN0LndyYXBwZWQgPSB0cnVlXG5cdGRvY3VtZW50LmFzdC5jaGlsZHJlbiA9IGNoaWxkcmVuLmZpbHRlcihjaGlsZCA9PiAhY2hpbGQubWFya0ZvclJlbW92YWwpXG59XG5cbmZ1bmN0aW9uIGNvbGxhcHNlU2VjdGlvbnMgKGRvY3VtZW50KXtcbiAgbGV0IGNoaWxkcmVuID0gZG9jdW1lbnQuYXN0LmNoaWxkcmVuXG4gIGxldCBwcmV2aW91c1xuICAgXG4gIGNoaWxkcmVuLmZvckVhY2goY2hpbGQgPT4ge1xuICAgIGxldCBuYW1lID0gY2hpbGQuZGF0YSAmJiBjaGlsZC5kYXRhLmh0bWxOYW1lXG4gICAgaWYobmFtZSA9PT0gXCJzZWN0aW9uXCIpe1xuICAgICAgcHJldmlvdXMgPSBjaGlsZFxuICAgICAgY2hpbGQuZGVidWcgPSB0cnVlXG4gICAgICBjaGlsZC5zZWN0aW9uID0gdHJ1ZVxuICAgIH1cblxuICAgIGlmKHByZXZpb3VzICYmIG5hbWUgPT09IFwiYXJ0aWNsZVwiKXtcbiAgICAgIGxldCBjbG9uZWQgPSBjbG9uZShjaGlsZClcbiAgICAgIGNsb25lZC5wYXJlbnQgPSBwcmV2aW91cy5zbHVnXG4gICAgICBwcmV2aW91cy5jaGlsZHJlbi5wdXNoKGNsb25lZClcbiAgICAgIGNoaWxkLm1hcmtGb3JEZWxldGUgPSB0cnVlXG4gICAgfVxuICB9KVxuXG4gIGRvY3VtZW50LmFzdC5jaGlsZHJlbiA9IGNoaWxkcmVuLmZpbHRlcihjaGlsZCA9PiAhY2hpbGQubWFya0ZvckRlbGV0ZSlcbn1cblxuZnVuY3Rpb24gYXBwbHlXcmFwcGVyIChkb2N1bWVudCkge1xuICBkb2N1bWVudC5hc3QuY2hpbGRyZW4gPSBbeyBcbiAgICB0eXBlOiBcInVua25vd25cIixcbiAgICBkYXRhOntcbiAgICAgIGh0bWxOYW1lOiBcIm1haW5cIixcbiAgICAgIGh0bWxBdHRyaWJ1dGVzOntcbiAgICAgICAgXCJjbGFzc1wiOiBcImJyaWVmLWRvY3VtZW50XCJcbiAgICAgIH1cbiAgICB9LFxuICAgIGNoaWxkcmVuOiBkb2N1bWVudC5hc3QuY2hpbGRyZW5cbiAgfV1cbn1cbiJdfQ==