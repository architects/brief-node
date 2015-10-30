'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

var _briefcase = require("./briefcase");

var _briefcase2 = _interopRequireDefault(_briefcase);

var _asset = require('./asset');

var _asset2 = _interopRequireDefault(_asset);

var _data_source = require('./data_source');

var _data_source2 = _interopRequireDefault(_data_source);

var _model = require("./model");

var _model2 = _interopRequireDefault(_model);

var _document = require("./document");

var _document2 = _interopRequireDefault(_document);

var _model_definition = require("./model_definition");

var _model_definition2 = _interopRequireDefault(_model_definition);

var _model_registry = require('./model_registry');

var _generator = require('./generator');

var _generator2 = _interopRequireDefault(_generator);

var _render = require('./render');

var _util = require('./util');

var plugins = [];
var _pluginNames = {};

var pkg = _path2['default'].join(__dirname, '../package.json');
var manifest = JSON.parse(_fs2['default'].readFileSync(pkg));

var brief = {
  VERSION: manifest.version,
  plugins: plugins,
  Briefcase: _briefcase2['default'],
  Model: _model2['default'],

  ModelDefinition: _model_definition2['default'],

  // TODO
  // Think of a better API for this.
  registry: _model_registry.registry,
  model: _model_registry.model,

  resolveLink: function resolveLink(pathAlias) {
    if (!brief.linkResolver) {
      return pathAlias;
    }
    return brief.linkResolver(pathAlias);
  },
  resolveLinksWith: function resolveLinksWith(fn) {
    brief.linkResolver = fn;
  },
  instances: function instances() {
    return _briefcase2['default'].instances();
  },
  findBriefcaseByPath: function findBriefcaseByPath(path) {
    return _briefcase2['default'].findForPath(path);
  },
  atPath: function atPath(root) {
    var options = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

    return _briefcase2['default'].load(root, options);
  },
  load: function load(root) {
    var options = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

    return _briefcase2['default'].load(root, options);
  },
  example: function example() {
    var options = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

    return require("../test/example")();
  },
  generate: function generate(root) {
    var options = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

    return new _generator2['default']({
      brief: brief,
      root: root
    }).run();
  },
  fromPath: function fromPath(pathname, options) {
    if (_fs2['default'].existsSync(pathname + './package.json')) {
      console.log("Loading briefcase from the package.json manifest at", pathname);

      return brief.fromManifest(pathname + './package.json', options);
    }
    return brief.load(pathname, options);
  },
  fromManifest: function fromManifest(briefcaseManifestPath, options) {
    var usesPlugins = [];
    var parsed = {};

    if (_fs2['default'].existsSync(briefcaseManifestPath)) {
      parsed = JSON.parse(_fs2['default'].readFileSync(briefcaseManifestPath).toString());
      if (parsed.brief && parsed.brief.plugins) {
        usesPlugins = usesPlugins.concat(parsed.brief.plugins);
      }
    }

    usesPlugins.forEach(function (pluginName) {
      brief = brief.use(require('brief-plugins-' + pluginName));
    });

    return brief.load(_path2['default'].dirname(briefcaseManifestPath), options);
  },
  pluginNames: function pluginNames() {
    return Object.keys(_pluginNames);
  },
  markdown: _render.markdown,
  util: require('./util'),
  mixin: function mixin(extension) {
    var options = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

    if (typeof options === 'string') {
      options = { target: options };
    }

    var _options = options;
    var target = _options.target;

    if (target === 'model') {
      (0, _util.mixin)(_model2['default'], extension);
    }
    if (target === 'briefcase') {
      (0, _util.mixin)(_briefcase2['default'], extension);
    }
    if (target === 'document') {
      (0, _util.mixin)(_document2['default'], extension);
    }
    if (target === 'asset') {
      (0, _util.mixin)(_asset2['default'], extension);
    }
    if (target === 'data') {
      (0, _util.mixin)(_data_source2['default'], extension);
    }
  },
  use: function use(plugin, options) {
    var brief = this;
    var modifier = plugin(brief, options);
    modifier.version = plugin.version;
    modifier.plugin_name = plugin.plugin_name;

    if (!_pluginNames[plugin.plugin_name]) {
      plugins.push(modifier);
    }

    _pluginNames[plugin.plugin_name] = true;

    return brief;
  }
};

if (!Object.values) {
  Object.values = function (obj) {
    return Object.keys(obj).map(function (key) {
      return obj[key];
    });
  };
}

exports['default'] = brief;
module.exports = exports['default'];
//# sourceMappingURL=data:application/json;base64,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ZXNDb250ZW50IjpbImltcG9ydCBwYXRoIGZyb20gJ3BhdGgnXG5pbXBvcnQgZnMgZnJvbSAnZnMnXG5pbXBvcnQgQnJpZWZjYXNlIGZyb20gXCIuL2JyaWVmY2FzZVwiXG5pbXBvcnQgQXNzZXQgZnJvbSAnLi9hc3NldCdcbmltcG9ydCBEYXRhU291cmNlIGZyb20gJy4vZGF0YV9zb3VyY2UnXG5pbXBvcnQgTW9kZWwgZnJvbSBcIi4vbW9kZWxcIlxuaW1wb3J0IERvY3VtZW50IGZyb20gXCIuL2RvY3VtZW50XCJcbmltcG9ydCBNb2RlbERlZmluaXRpb24gZnJvbSBcIi4vbW9kZWxfZGVmaW5pdGlvblwiXG5pbXBvcnQge21vZGVsLCByZWdpc3RyeX0gZnJvbSAnLi9tb2RlbF9yZWdpc3RyeSdcbmltcG9ydCBHZW5lcmF0b3IgZnJvbSAnLi9nZW5lcmF0b3InXG5pbXBvcnQge21hcmtkb3dufSBmcm9tICcuL3JlbmRlcidcbmltcG9ydCB7bWl4aW59IGZyb20gJy4vdXRpbCdcblxuY29uc3QgcGx1Z2lucyA9IFtdXG5jb25zdCBwbHVnaW5OYW1lcyA9IHt9XG5cbmNvbnN0IHBrZyA9IHBhdGguam9pbihfX2Rpcm5hbWUsICcuLi9wYWNrYWdlLmpzb24nKVxuY29uc3QgbWFuaWZlc3QgPSBKU09OLnBhcnNlKGZzLnJlYWRGaWxlU3luYyhwa2cpKVxuXG5sZXQgYnJpZWYgPSB7XG4gIFZFUlNJT046IG1hbmlmZXN0LnZlcnNpb24sXG4gIHBsdWdpbnM6IHBsdWdpbnMsXG4gIEJyaWVmY2FzZTogQnJpZWZjYXNlLFxuICBNb2RlbDogTW9kZWwsXG4gICBcbiAgTW9kZWxEZWZpbml0aW9uOiBNb2RlbERlZmluaXRpb24sXG5cbiAgLy8gVE9ET1xuICAvLyBUaGluayBvZiBhIGJldHRlciBBUEkgZm9yIHRoaXMuXG4gIHJlZ2lzdHJ5OiByZWdpc3RyeSxcbiAgbW9kZWw6IG1vZGVsLFxuXG4gIHJlc29sdmVMaW5rOiBmdW5jdGlvbihwYXRoQWxpYXMpe1xuICAgIGlmKCFicmllZi5saW5rUmVzb2x2ZXIpe1xuICAgICAgcmV0dXJuIHBhdGhBbGlhc1xuICAgIH1cbiAgICByZXR1cm4gYnJpZWYubGlua1Jlc29sdmVyKHBhdGhBbGlhcylcbiAgfSxcbiAgcmVzb2x2ZUxpbmtzV2l0aDogZnVuY3Rpb24oZm4pe1xuICAgIGJyaWVmLmxpbmtSZXNvbHZlciA9IGZuXG4gIH0sXG4gIGluc3RhbmNlczogZnVuY3Rpb24oKXtcbiAgICByZXR1cm4gQnJpZWZjYXNlLmluc3RhbmNlcygpXG4gIH0sXG4gIGZpbmRCcmllZmNhc2VCeVBhdGg6IGZ1bmN0aW9uKHBhdGgpe1xuICAgIHJldHVybiBCcmllZmNhc2UuZmluZEZvclBhdGgocGF0aClcbiAgfSxcbiAgYXRQYXRoOiBmdW5jdGlvbihyb290LCBvcHRpb25zPXt9KXtcbiAgICByZXR1cm4gQnJpZWZjYXNlLmxvYWQocm9vdCwgb3B0aW9ucylcbiAgfSxcbiAgbG9hZDogZnVuY3Rpb24gKHJvb3QsIG9wdGlvbnM9e30pIHtcbiAgICByZXR1cm4gQnJpZWZjYXNlLmxvYWQocm9vdCwgb3B0aW9ucylcbiAgfSxcbiAgZXhhbXBsZTogZnVuY3Rpb24ob3B0aW9ucz17fSl7XG4gICAgcmV0dXJuIHJlcXVpcmUoXCIuLi90ZXN0L2V4YW1wbGVcIikoKVxuICB9LFxuICBnZW5lcmF0ZTogZnVuY3Rpb24ocm9vdCwgb3B0aW9ucz17fSl7XG4gICAgcmV0dXJuIG5ldyBHZW5lcmF0b3Ioe1xuICAgICAgYnJpZWYsXG4gICAgICByb290XG4gICAgfSkucnVuKClcbiAgfSxcbiAgZnJvbVBhdGg6IGZ1bmN0aW9uKHBhdGhuYW1lLCBvcHRpb25zKXtcbiAgICBpZihmcy5leGlzdHNTeW5jKHBhdGhuYW1lICsgJy4vcGFja2FnZS5qc29uJykpe1xuICAgICAgY29uc29sZS5sb2coXCJMb2FkaW5nIGJyaWVmY2FzZSBmcm9tIHRoZSBwYWNrYWdlLmpzb24gbWFuaWZlc3QgYXRcIiwgcGF0aG5hbWUpXG5cbiAgICAgIHJldHVybiBicmllZi5mcm9tTWFuaWZlc3QocGF0aG5hbWUgKyAnLi9wYWNrYWdlLmpzb24nLCBvcHRpb25zKVxuICAgIH1cbiAgICByZXR1cm4gYnJpZWYubG9hZChwYXRobmFtZSwgb3B0aW9ucylcbiAgfSxcbiAgZnJvbU1hbmlmZXN0OiBmdW5jdGlvbihicmllZmNhc2VNYW5pZmVzdFBhdGgsIG9wdGlvbnMpe1xuICAgIGxldCB1c2VzUGx1Z2lucyA9IFtdXG4gICAgbGV0IHBhcnNlZCA9IHt9XG4gICAgXG4gICAgaWYoZnMuZXhpc3RzU3luYyhicmllZmNhc2VNYW5pZmVzdFBhdGgpKXtcbiAgICAgIHBhcnNlZCA9IEpTT04ucGFyc2UoZnMucmVhZEZpbGVTeW5jKGJyaWVmY2FzZU1hbmlmZXN0UGF0aCkudG9TdHJpbmcoKSlcbiAgICAgIGlmKHBhcnNlZC5icmllZiAmJiBwYXJzZWQuYnJpZWYucGx1Z2lucyl7XG4gICAgICAgIHVzZXNQbHVnaW5zID0gdXNlc1BsdWdpbnMuY29uY2F0KHBhcnNlZC5icmllZi5wbHVnaW5zKSAgXG4gICAgICB9XG4gICAgfVxuXG4gICAgdXNlc1BsdWdpbnMuZm9yRWFjaChwbHVnaW5OYW1lID0+IHtcbiAgICAgIGJyaWVmID0gYnJpZWYudXNlKHJlcXVpcmUoJ2JyaWVmLXBsdWdpbnMtJyArIHBsdWdpbk5hbWUpKVxuICAgIH0pXG5cbiAgICByZXR1cm4gYnJpZWYubG9hZChwYXRoLmRpcm5hbWUoYnJpZWZjYXNlTWFuaWZlc3RQYXRoKSwgb3B0aW9ucylcbiAgfSxcbiAgcGx1Z2luTmFtZXM6IGZ1bmN0aW9uKCl7XG4gICAgcmV0dXJuIE9iamVjdC5rZXlzKHBsdWdpbk5hbWVzKVxuICB9LFxuICBtYXJrZG93bjogbWFya2Rvd24sXG4gIHV0aWw6IHJlcXVpcmUoJy4vdXRpbCcpLFxuICBtaXhpbjogZnVuY3Rpb24oZXh0ZW5zaW9uLCBvcHRpb25zPXt9KXtcbiAgICBpZih0eXBlb2Yob3B0aW9ucyk9PT0nc3RyaW5nJyl7XG4gICAgICBvcHRpb25zID0ge3RhcmdldDogb3B0aW9uc31cbiAgICB9XG5cbiAgICBsZXQge3RhcmdldH0gPSBvcHRpb25zXG4gICAgXG4gICAgaWYodGFyZ2V0ID09PSAnbW9kZWwnKXsgbWl4aW4oTW9kZWwsIGV4dGVuc2lvbikgfVxuICAgIGlmKHRhcmdldCA9PT0gJ2JyaWVmY2FzZScpeyBtaXhpbihCcmllZmNhc2UsIGV4dGVuc2lvbikgfVxuICAgIGlmKHRhcmdldCA9PT0gJ2RvY3VtZW50Jyl7IG1peGluKERvY3VtZW50LCBleHRlbnNpb24pIH1cbiAgICBpZih0YXJnZXQgPT09ICdhc3NldCcpeyBtaXhpbihBc3NldCwgZXh0ZW5zaW9uKSB9XG4gICAgaWYodGFyZ2V0ID09PSAnZGF0YScpeyBtaXhpbihEYXRhU291cmNlLCBleHRlbnNpb24pIH1cbiAgfSxcbiAgdXNlOiBmdW5jdGlvbihwbHVnaW4sIG9wdGlvbnMpe1xuICAgIHZhciBicmllZiA9IHRoaXNcbiAgICB2YXIgbW9kaWZpZXIgPSBwbHVnaW4oYnJpZWYsIG9wdGlvbnMpXG4gICAgbW9kaWZpZXIudmVyc2lvbiA9IHBsdWdpbi52ZXJzaW9uXG4gICAgbW9kaWZpZXIucGx1Z2luX25hbWUgPSBwbHVnaW4ucGx1Z2luX25hbWVcbiAgICBcbiAgICBpZighcGx1Z2luTmFtZXNbcGx1Z2luLnBsdWdpbl9uYW1lXSl7XG4gICAgICBwbHVnaW5zLnB1c2gobW9kaWZpZXIpXG4gICAgfVxuXG4gICAgcGx1Z2luTmFtZXNbcGx1Z2luLnBsdWdpbl9uYW1lXSA9IHRydWVcblxuICAgIHJldHVybiBicmllZlxuICB9XG59XG5cbmlmKCFPYmplY3QudmFsdWVzKXtcbiAgT2JqZWN0LnZhbHVlcyA9IGZ1bmN0aW9uKG9iail7XG4gICAgcmV0dXJuIE9iamVjdC5rZXlzKG9iaikubWFwKGZ1bmN0aW9uKGtleSl7IHJldHVybiBvYmpba2V5XSB9KVxuICB9XG59XG5cbmV4cG9ydCBkZWZhdWx0IGJyaWVmXG4iXX0=