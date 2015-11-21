'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

var _globAll = require('glob-all');

var _globAll2 = _interopRequireDefault(_globAll);

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _i = require('i');

var _i2 = _interopRequireDefault(_i);

var _underscore = require('underscore');

var _underscore2 = _interopRequireDefault(_underscore);

var _bunyan = require('bunyan');

var _bunyan2 = _interopRequireDefault(_bunyan);

var _2 = require('..');

var _3 = _interopRequireDefault(_2);

var _asset = require('./asset');

var _asset2 = _interopRequireDefault(_asset);

var _data_source = require('./data_source');

var _data_source2 = _interopRequireDefault(_data_source);

var _document = require('./document');

var _document2 = _interopRequireDefault(_document);

var _model = require('./model');

var _model2 = _interopRequireDefault(_model);

var _model_definition = require('./model_definition');

var _model_definition2 = _interopRequireDefault(_model_definition);

var _packager = require('./packager');

var _packager2 = _interopRequireDefault(_packager);

var _Resolver = require('./Resolver');

var _Resolver2 = _interopRequireDefault(_Resolver);

var _collection = require('./collection');

var _collection2 = _interopRequireDefault(_collection);

var _exporters = require('./exporters');

var _exporters2 = _interopRequireDefault(_exporters);

var _helpersCommands = require('./helpers/commands');

var _helpersCommands2 = _interopRequireDefault(_helpersCommands);

var _helpersQueries = require('./helpers/queries');

var _helpersQueries2 = _interopRequireDefault(_helpersQueries);

var _helpersViews = require('./helpers/views');

var _helpersViews2 = _interopRequireDefault(_helpersViews);

var inflect = (0, _i2['default'])(true);
var pluralize = inflect.pluralize;

var __cache = {};
var __documentIndexes = {};
var __cacheKeys = {};

var __helpers = {
  commands: {},
  queries: {},
  views: {}
};

var Briefcase = (function () {
  /**
  * Create a new Briefcase object at the specified root path.
  *
  * @param {path} root - the root path of the briefcase. expects
  *   to find a config file "brief.config.js", and at least a 
  *   documents folder.
  *
  * @param {options} options - options to override default behavior.
  * @param {path} docs_path - which folder contains the documents.
  * @param {path} models_path - which folder contains the models to use.
  * @param {path} assets_path - which folder contains the assets to use if any.
  * @param {path} commands_path - which folder contains the commands to use if any.
  * @param {path} queries_path - which folder contains the queries to use if any.
  * @param {path} views_path - which folder contains the views to use if any.
  */

  function Briefcase(root, options) {
    _classCallCheck(this, Briefcase);

    __cache[this.root] = this;

    this.root = _path2['default'].resolve(root);
    this.name = options.name || _path2['default'].basename(root);
    this.parentFolder = _path2['default'].dirname(root);

    this.options = options || {};

    this.model_definitions = {};
    this.collections = {};

    _helpersCommands2['default'].decorate(this, __helpers.commands);
    _helpersQueries2['default'].decorate(this, __helpers.queries);
    _helpersViews2['default'].decorate(this, __helpers.views);

    var logger = {
      name: "briefcase-" + this.name,
      streams: [{
        stream: process.stdout,
        level: 'info'
      }]
    };

    if (options.log_path) {
      logger.streams.push({ path: options.log_path, level: 'info' });
    }

    this.logger = new _bunyan2['default'](logger);

    this.config = {
      docs_path: _path2['default'].join(this.root, 'docs'),
      models_path: _path2['default'].join(this.root, 'models'),
      assets_path: _path2['default'].join(this.root, 'assets'),
      data_path: _path2['default'].join(this.root, 'data'),
      views_path: _path2['default'].join(this.root, 'views'),
      commands_path: _path2['default'].join(this.root, 'commands'),
      queries_path: _path2['default'].join(this.root, 'queries')
    };

    this.setup();
  }

  _createClass(Briefcase, [{
    key: 'log',
    value: function log() {
      var _logger;

      (_logger = this.logger).info.apply(_logger, arguments);
    }

    /** 
    * Return the outline for this briefcase if it exists.
    */
  }, {
    key: 'resolveLink',
    value: function resolveLink(pathAlias) {
      return this.resolver.resolveLink(pathAlias);
    }
  }, {
    key: 'resolveAssetPath',
    value: function resolveAssetPath(pathAlias) {
      return this.resolver.resolveAssetPath(pathAlias);
    }
  }, {
    key: 'toJSON',

    /**
    * Turn all of the documents, models, data, assets, and other metadata about this briefcase
    * into a single JSON structure. Alias for the `exportWith` method.
    */
    value: function toJSON() {
      var options = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

      if (_underscore2['default'].isString(options)) {
        options = { format: options };
      }

      return this.exportWith(options.format || "standard", options);
    }
  }, {
    key: 'exportWith',
    value: function exportWith() {
      var exporterFormat = arguments.length <= 0 || arguments[0] === undefined ? "standard" : arguments[0];
      var options = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

      return _exporters2['default'].cached(this, exporterFormat, options);
    }
  }, {
    key: 'computeCacheKey',
    value: function computeCacheKey() {
      var modifiedTimes = this.getAllModels().map(function (model) {
        return model.lastModifiedAt();
      }).sort();
      var latest = modifiedTimes[modifiedTimes.length - 1];
      return [this.name, modifiedTimes.length, latest].join(':');
    }
  }, {
    key: 'isStale',
    value: function isStale() {
      return this.cacheKey !== this.computeCacheKey();
    }

    /**
    * setup this briefcase involves loading the model definitions
    * and creating repositories for any assets or data sources
    */
  }, {
    key: 'setup',
    value: function setup() {
      var _this = this;

      this.pluginNames = [];

      require('./index').plugins.forEach(function (modifier) {
        _this.pluginNames.push(modifier.plugin_name || modifier.pluginName);
        modifier(_this);
      });

      loadModelDefinitions(this);

      createAssetRepository(this);

      createDataRepository(this);

      loadHelpers(this);
    }

    /**
    * use a plugin to load modules, actions, CLI helpers, etc
    */
  }, {
    key: 'use',
    value: function use(plugin) {
      var options = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

      _3['default'].use(plugin);
      this.setup();
      return this;
    }

    /**
     * get model at the given relative path 
     * 
     * @example
     *  briefcase.at('epics/model-definition-dsl')
    */
  }, {
    key: 'at',
    value: function at(path_alias) {
      var absolute = arguments.length <= 1 || arguments[1] === undefined ? false : arguments[1];

      var docs_path = _path2['default'].resolve(this.config.docs_path);

      if (absolute) {
        path_alias = path_alias.replace(docs_path, '');
      }

      if (!path_alias.match(/\.md$/i)) {
        path_alias = path_alias + '.md';
      }

      return this.index[path_alias.replace(/^\//, '')];
    }
  }, {
    key: 'findDocumentByPath',
    value: function findDocumentByPath(path) {
      return this.atPath(path_alias, true);
    }

    /**
    * get models at each of the paths represented
    * by the glob pattern passed here.
    */
  }, {
    key: 'glob',
    value: function glob() {
      var _this2 = this;

      var pattern = arguments.length <= 0 || arguments[0] === undefined ? "**/*.md" : arguments[0];

      var matchingFiles = _globAll2['default'].sync(_path2['default'].join(this.root, pattern));
      return matchingFiles.map(function (path) {
        return _this2.at(path, true);
      });
    }

    /**
     * filters all available models by the given iterator
     *
     * @example
     *  briefcase.filterAll(model => model.status === 'active')
    */
  }, {
    key: 'filterAll',
    value: function filterAll(iterator) {
      return this.getAllModels().filter(iterator);
    }
  }, {
    key: 'findModelsByDefinition',
    value: function findModelsByDefinition(definition) {
      var groupName = definition.groupName;
      return this.filterAll(function (model) {
        return model.groupName === groupName;
      });
    }

    /**
     * filters models by the property and desired value
     * 
     * @param {string} property - name of the property to filter on 
     * @param {any} desiredValue - the value to match against
     *
     * @return {array} - models whose property matches desiredValue 
    */
  }, {
    key: 'filterAllByProperty',
    value: function filterAllByProperty(property, desiredValue) {
      return this.filterAll(function (model) {
        return model[property] === desiredValue;
      });
    }

    /**
     * selects all the models whose type matches the supplied arg 
    */
  }, {
    key: 'selectModelsByType',
    value: function selectModelsByType(type) {
      return this.filterAllByProperty('type', type);
    }

    /**
     * selects all the models whose groupName matches the supplied arg 
    */
  }, {
    key: 'selectModelsByGroup',
    value: function selectModelsByGroup(groupName) {
      return this.filterAllByProperty('groupName', groupName);
    }

    /**
     * returns all the models in this briefcase
    */
  }, {
    key: 'getAllModels',
    value: function getAllModels() {
      var _this3 = this;

      return Object.keys(this.index).map(function (key) {
        return _this3.index[key];
      });
    }

    /**
     * returns the raw documents in this briefcase
    */
  }, {
    key: 'getAllDocuments',
    value: function getAllDocuments() {
      return this.getAllModels().map(function (model) {
        return model.document;
      });
    }

    /**
    * Archives the briefcase into a zip file. Briefcases
    * can be created directly from zip files in the future.
    *
    * @param {string} location - where to store the file?
    * @param {array} ignore - a list of files to ignore and not put in the
    *   archive
    */
  }, {
    key: 'archive',
    value: function archive(location) {
      var ignore = arguments.length <= 1 || arguments[1] === undefined ? [] : arguments[1];

      location = location || ignore.push(location);

      new _packager2['default'](this, ignore).persist(location);
    }
  }, {
    key: 'getGroupNames',
    value: function getGroupNames() {
      return Object.keys(this.model_definitions).map(function (name) {
        return inflect.pluralize(name.toLowerCase());
      });
    }
  }, {
    key: 'getDocumentTypes',
    value: function getDocumentTypes() {
      return Object.keys(this.model_definitions).map(function (name) {
        return inflect.underscore(name.toLowerCase());
      });
    }
  }, {
    key: 'loadModelDefinition',
    value: function loadModelDefinition(path) {
      return this.loadModel(_model_definition2['default'].load(path));
    }
  }, {
    key: 'loadModel',
    value: function loadModel(definition) {
      this.model_definitions[definition.name] = true;
      return definition;
    }
  }, {
    key: 'loadedModelDefinitions',
    value: function loadedModelDefinitions() {
      return Object.keys(this.model_definitions);
    }
  }, {
    key: 'getModelDefinitions',
    value: function getModelDefinitions() {
      return _model_definition2['default'].getAll();
    }
  }, {
    key: 'getModelDefinition',
    value: function getModelDefinition(modelNameOrAlias) {
      return _model_definition2['default'].lookup(modelNameOrAlias);
    }
  }, {
    key: 'getTypeAliases',
    value: function getTypeAliases() {
      return _model_definition2['default'].getTypeAliases();
    }
  }, {
    key: 'getModelSchema',
    value: function getModelSchema() {
      return _model_definition2['default'].getModelSchema();
    }
  }, {
    key: 'getAllFiles',
    value: function getAllFiles() {
      var _this4 = this;

      var useAbsolutePaths = arguments.length <= 0 || arguments[0] === undefined ? false : arguments[0];

      var allFiles = _globAll2['default'].sync(_path2['default'].join(this.root, '**/*'));
      return useAbsolutePaths ? allFiles : allFiles.map(function (f) {
        return f.replace(_this4.root + '/', '');
      });
    }
  }, {
    key: '_getDocumentPaths',
    value: function _getDocumentPaths() {
      var docs_path = _path2['default'].resolve(this.config.docs_path);
      return _globAll2['default'].sync(_path2['default'].join(docs_path, '**/*.md'));
    }
  }, {
    key: 'outline',
    get: function get() {
      return this.at('outline.md');
    }
  }, {
    key: 'index',
    get: function get() {
      if (__documentIndexes[this.root]) {
        return __documentIndexes[this.root];
      }

      return __documentIndexes[this.root] = buildIndexFromDisk(this);
    }

    /**
    * Load a briefcase by passing a path to a root folder.
    *
    * @param {string} rootPath - the root path of the briefcase.
    * @return {Briefcase} - returns a briefcase
    *
    */
  }, {
    key: 'manifestConfig',

    /**
    * Gets any config values that have been supplied via the `package.json`
    * in this Briefcase root.  Looks for a key called `brief`, as well as any
    * of the plugins that have been loaded.
    */
    get: function get() {
      var base = {};
      var manifest = this.manifest;

      if (_underscore2['default'].isEmpty(manifest)) {
        return {};
      }

      if (manifest.brief) {
        base.brief = manifest.brief;
      }

      return this.pluginNames.reduce(function (memo, plugin) {
        if (manifest[plugin]) {
          memo[plugin] = manifest[plugin];
        }

        return memo;
      }, base);
    }

    /**
    * Gets a serialized version of the `package.json` that exists in this Briefcase root folder.
    */
  }, {
    key: 'manifest',
    get: function get() {
      if (_fs2['default'].existsSync(_path2['default'].join(this.root, 'package.json'))) {
        return JSON.parse(_fs2['default'].readFileSync(_path2['default'].join(this.root, 'package.json')));
      }
    }
  }, {
    key: 'resolver',
    get: function get() {
      return _Resolver2['default'].create(this);
    }
  }, {
    key: 'assets',
    get: function get() {
      return this.collections.assets;
    }
  }, {
    key: 'data',
    get: function get() {
      return this.collections.data;
    }
  }, {
    key: 'cacheKey',
    get: function get() {
      if (__cacheKeys[this.root]) {
        return __cacheKeys[this.root];
      }
      return __cacheKeys[this.root] = this.computeCacheKey();
    }
  }], [{
    key: 'load',
    value: function load(rootPath) {
      var options = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

      return new Briefcase(rootPath, options);
    }

    /**
    * Find the Briefcase instance responsible for a particular path.
    * Models and Documents will use this to find the Briefcase they
    * belong to 
    *
    * @param {path} path - the path of the document which wants to know
    */
  }, {
    key: 'findForPath',
    value: function findForPath() {
      var checkPath = arguments.length <= 0 || arguments[0] === undefined ? "" : arguments[0];

      var matchingPath = Object.keys(__cache).find(function (p) {
        return checkPath.match(p);
      });
      return __cache[matchingPath];
    }

    /**
    * Return all instances of a Briefcase that we are aware of from the cache
    */
  }, {
    key: 'instances',
    value: function instances() {
      return Object.keys(__cache).map(function (path) {
        return __cache[path];
      });
    }
  }]);

  return Briefcase;
})();

exports['default'] = Briefcase;

function buildIndexFromDisk(briefcase) {
  var paths = briefcase._getDocumentPaths();
  var index = {};

  paths.forEach(function (path) {
    var path_alias = path.replace(briefcase.config.docs_path + '/', '');
    var id = path_alias.replace('.md', '');
    var document = new _document2['default'](path, { id: id });
    var model = document.toModel({ id: id });

    document.id = path_alias;
    document.relative_path = 'docs/' + path_alias;
    model.id = id;
    model.getParent = function () {
      return briefcase;
    };
    index[path_alias] = model;
  });

  return index;
}

function loadModelDefinitions(briefcase) {
  _model_definition2['default'].loadDefinitionsFromPath(briefcase.config.models_path);
  _model_definition2['default'].loadDefinitionsFromPath(__dirname + '/models');

  _model_definition2['default'].getAll().forEach(function (definition) {
    briefcase.loadModel(definition);
    createCollection(briefcase, definition);
  });

  _model_definition2['default'].finalize();
}

function createCollection(briefcase, modelDefinition) {
  var groupName = modelDefinition.groupName;
  var type_alias = modelDefinition.type_alias;

  try {
    Object.defineProperty(briefcase, groupName, {
      get: function get() {
        if (briefcase.collections[groupName]) {
          return briefcase.collections[groupName];
        }

        return briefcase.collections[groupName] = (0, _collection2['default'])(function () {
          return briefcase.selectModelsByType(type_alias);
        }, modelDefinition);
      }
    });
  } catch (e) {}
}

function createAssetRepository(briefcase) {
  Object.defineProperty(briefcase.collections, 'assets', {
    configurable: true,
    get: function get() {
      delete briefcase.collections.assets;
      return briefcase.collections.assets = _asset2['default'].repo(briefcase, briefcase.config.assets || {});
    }
  });
}

function createDataRepository(briefcase) {
  Object.defineProperty(briefcase.collections, 'data', {
    configurable: true,
    get: function get() {
      delete briefcase.collections.data;
      return briefcase.collections.data = _data_source2['default'].repo(briefcase, briefcase.config.data || {});
    }
  });
}

function loadHelpers(briefcase) {
  var commands = _globAll2['default'].sync(_path2['default'].join(briefcase.config.commands_path, '**/*.js'));
  var queries = _globAll2['default'].sync(_path2['default'].join(briefcase.config.queries_path, '**/*.js'));
  var views = _globAll2['default'].sync(_path2['default'].join(briefcase.config.views_path, '**/*.js'));

  commands.forEach(function (command) {
    return briefcase.commands.fromPath(command);
  });
  queries.forEach(function (query) {
    return briefcase.queries.fromPath(query);
  });
  views.forEach(function (view) {
    return briefcase.views.fromPath(view);
  });
}
module.exports = exports['default'];
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3NyYy9icmllZmNhc2UuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7O2tCQUFlLElBQUk7Ozs7dUJBQ0YsVUFBVTs7OztvQkFDVixNQUFNOzs7O2lCQUNDLEdBQUc7Ozs7MEJBQ2IsWUFBWTs7OztzQkFDUCxRQUFROzs7O2lCQUVULElBQUk7Ozs7cUJBQ0osU0FBUzs7OzsyQkFDSixlQUFlOzs7O3dCQUNqQixZQUFZOzs7O3FCQUNmLFNBQVM7Ozs7Z0NBRUMsb0JBQW9COzs7O3dCQUUzQixZQUFZOzs7O3dCQUNaLFlBQVk7Ozs7MEJBRVYsY0FBYzs7Ozt5QkFDZixhQUFhOzs7OytCQUdkLG9CQUFvQjs7Ozs4QkFDckIsbUJBQW1COzs7OzRCQUNyQixpQkFBaUI7Ozs7QUFFbkMsSUFBTSxPQUFPLEdBQUcsb0JBQVksSUFBSSxDQUFDLENBQUE7QUFDakMsSUFBTSxTQUFTLEdBQUcsT0FBTyxDQUFDLFNBQVMsQ0FBQTs7QUFFbkMsSUFBTSxPQUFPLEdBQUcsRUFBRSxDQUFBO0FBQ2xCLElBQU0saUJBQWlCLEdBQUcsRUFBRSxDQUFBO0FBQzVCLElBQU0sV0FBVyxHQUFHLEVBQUUsQ0FBQTs7QUFFdEIsSUFBTSxTQUFTLEdBQUc7QUFDaEIsVUFBUSxFQUFFLEVBQUU7QUFDWixTQUFPLEVBQUUsRUFBRTtBQUNYLE9BQUssRUFBRSxFQUFFO0NBQ1YsQ0FBQTs7SUFFb0IsU0FBUzs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFnQmpCLFdBaEJRLFNBQVMsQ0FnQmhCLElBQUksRUFBRSxPQUFPLEVBQUU7MEJBaEJSLFNBQVM7O0FBaUIxQixXQUFPLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxHQUFHLElBQUksQ0FBQTs7QUFFekIsUUFBSSxDQUFDLElBQUksR0FBVyxrQkFBSyxPQUFPLENBQUMsSUFBSSxDQUFDLENBQUE7QUFDdEMsUUFBSSxDQUFDLElBQUksR0FBVyxPQUFPLENBQUMsSUFBSSxJQUFJLGtCQUFLLFFBQVEsQ0FBQyxJQUFJLENBQUMs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QUMzRSxNQUFJLEtBQUssR0FBRyxxQkFBSyxJQUFJLENBQUMsa0JBQUssSUFBSSxDQUFDLFNBQVMsQ0FBQyxNQUFNLENBQUMsVUFBVSxFQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUE7O0FBRXZFLFVBQVEsQ0FBQyxPQUFPLENBQUMsVUFBQSxPQUFPO1dBQUksU0FBUyxDQUFDLFFBQVEsQ0FBQyxRQUFRLENBQUMsT0FBTyxDQUFDO0dBQUEsQ0FBQyxDQUFBO0FBQ2pFLFNBQU8sQ0FBQyxPQUFPLENBQUMsVUFBQSxLQUFLO1dBQUksU0FBUyxDQUFDLE9BQU8sQ0FBQyxRQUFRLENBQUMsS0FBSyxDQUFDO0dBQUEsQ0FBQyxDQUFBO0FBQzNELE9BQUssQ0FBQyxPQUFPLENBQUMsVUFBQSxJQUFJO1dBQUksU0FBUyxDQUFDLEtBQUssQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDO0dBQUEsQ0FBQyxDQUFBO0NBQ3REIiwiZmlsZSI6ImJyaWVmY2FzZS5qcyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCBmcyBmcm9tICdmcydcbmltcG9ydCBnbG9iIGZyb20gJ2dsb2ItYWxsJ1xuaW1wb3J0IHBhdGggZnJvbSAncGF0aCdcbmltcG9ydCBpbmZsZWN0aW9ucyBmcm9tICdpJ1xuaW1wb3J0IF8gZnJvbSAndW5kZXJzY29yZSdcbmltcG9ydCBMb2dnZXIgZnJvbSAnYnVueWFuJ1xuXG5pbXBvcnQgYnJpZWYgZnJvbSAnLi4nXG5pbXBvcnQgQXNzZXQgZnJvbSAnLi9hc3NldCdcbmltcG9ydCBEYXRhU291cmNlIGZyb20gJy4vZGF0YV9zb3VyY2UnXG5pbXBvcnQgRG9jdW1lbnQgZnJvbSAnLi9kb2N1bWVudCdcbmltcG9ydCBNb2RlbCBmcm9tICcuL21vZGVsJ1xuXG5pbXBvcnQgTW9kZWxEZWZpbml0aW9uIGZyb20gJy4vbW9kZWxfZGVmaW5pdGlvbidcblxuaW1wb3J0IFBhY2thZ2VyIGZyb20gJy4vcGFja2FnZXInXG5pbXBvcnQgUmVzb2x2ZXIgZnJvbSAnLi9SZXNvbHZlcidcblxuaW1wb3J0IGNvbGxlY3Rpb24gZnJvbSAnLi9jb2xsZWN0aW9uJ1xuaW1wb3J0IGV4cG9ydGVycyBmcm9tICcuL2V4cG9ydGVycydcblxuXG5pbXBvcnQgY29tbWFuZHMgZnJvbSAnLi9oZWxwZXJzL2NvbW1hbmRzJ1xuaW1wb3J0IHF1ZXJpZXMgZnJvbSAnLi9oZWxwZXJzL3F1ZXJpZXMnXG5pbXBvcnQgdmlld3MgZnJvbSAnLi9oZWxwZXJzL3ZpZXdzJ1xuXG5jb25zdCBpbmZsZWN0ID0gaW5mbGVjdGlvbnModHJ1ZSlcbmNvbnN0IHBsdXJhbGl6ZSA9IGluZmxlY3QucGx1cmFsaXplXG5cbmNvbnN0IF9fY2FjaGUgPSB7fVxuY29uc3QgX19kb2N1bWVudEluZGV4ZXMgPSB7fVxuY29uc3QgX19jYWNoZUtleXMgPSB7fVxuXG5jb25zdCBfX2hlbHBlcnMgPSB7XG4gIGNvbW1hbmRzOiB7fSxcbiAgcXVlcmllczoge30sXG4gIHZpZXdzOiB7fVxufVxuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBCcmllZmNhc2Uge1xuICAvKipcbiAgKiBDcmVhdGUgYSBuZXcgQnJpZWZjYXNlIG9iamVjdCBhdCB0aGUgc3BlY2lmaWVkIHJvb3QgcGF0aC5cbiAgKlxuICAqIEBwYXJhbSB7cGF0aH0gcm9vdCAtIHRoZSByb290IHBhdGggb2YgdGhlIGJyaWVmY2FzZS4gZXhwZWN0c1xuICAqICAgdG8gZmluZCBhIGNvbmZpZyBmaWxlIFwiYnJpZWYuY29uZmlnLmpzXCIsIGFuZCBhdCBsZWFzdCBhIFxuICAqICAgZG9jdW1lbnRzIGZvbGRlci5cbiAgKlxuICAqIEBwYXJhbSB7b3B0aW9uc30gb3B0aW9ucyAtIG9wdGlvbnMgdG8gb3ZlcnJpZGUgZGVmYXVsdCBiZWhhdmlvci5cbiAgKiBAcGFyYW0ge3BhdGh9IGRvY3NfcGF0aCAtIHdoaWNoIGZvbGRlciBjb250YWlucyB0aGUgZG9jdW1lbnRzLlxuICAqIEBwYXJhbSB7cGF0aH0gbW9kZWxzX3BhdGggLSB3aGljaCBmb2xkZXIgY29udGFpbnMgdGhlIG1vZGVscyB0byB1c2UuXG4gICogQHBhcmFtIHtwYXRofSBhc3NldHNfcGF0aCAtIHdoaWNoIGZvbGRlciBjb250YWlucyB0aGUgYXNzZXRzIHRvIHVzZSBpZiBhbnkuXG4gICogQHBhcmFtIHtwYXRofSBjb21tYW5kc19wYXRoIC0gd2hpY2ggZm9sZGVyIGNvbnRhaW5zIHRoZSBjb21tYW5kcyB0byB1c2UgaWYgYW55LlxuICAqIEBwYXJhbSB7cGF0aH0gcXVlcmllc19wYXRoIC0gd2hpY2ggZm9sZGVyIGNvbnRhaW5zIHRoZSBxdWVyaWVzIHRvIHVzZSBpZiBhbnkuXG4gICogQHBhcmFtIHtwYXRofSB2aWV3c19wYXRoIC0gd2hpY2ggZm9sZGVyIGNvbnRhaW5zIHRoZSB2aWV3cyB0byB1c2UgaWYgYW55LlxuICAqL1xuICBjb25zdHJ1Y3Rvcihyb290LCBvcHRpb25zKSB7XG4gICAgX19jYWNoZVt0aGlzLnJvb3RdID0gdGhpc1xuXG4gICAgdGhpcy5yb290ICAgICAgICAgPSBwYXRoLnJlc29sdmUocm9vdClcbiAgICB0aGlzLm5hbWUgICAgICAgICA9IG9wdGlvbnMubmFtZSB8fCBwYXRoLmJhc2VuYW1lKHJvb3QpXG4gICAgdGhpcy5wYXJlbnRGb2xkZXIgPSBwYXRoLmRpcm5hbWUocm9vdClcblxuICAgIHRoaXMub3B0aW9ucyA9IG9wdGlvbnMgfHwge31cblxuICAgIHRoaXMubW9kZWxfZGVmaW5pdGlvbnMgPSB7fVxuICAgIHRoaXMuY29sbGVjdGlvbnMgPSB7fVxuICAgICAgXG4gICAgY29tbWFuZHMuZGVjb3JhdGUodGhpcywgX19oZWxwZXJzLmNvbW1hbmRzKVxuICAgIHF1ZXJpZXMuZGVjb3JhdGUodGhpcywgX19oZWxwZXJzLnF1ZXJpZXMpXG4gICAgdmlld3MuZGVjb3JhdGUodGhpcywgX19oZWxwZXJzLnZpZXdzKVxuXG4gICAgbGV0IGxvZ2dlciA9IHtcbiAgICAgIG5hbWU6IFwiYnJpZWZjYXNlLVwiICsgdGhpcy5uYW1lLFxuICAgICAgc3RyZWFtczpbe1xuICAgICAgICBzdHJlYW06IHByb2Nlc3Muc3Rkb3V0LFxuICAgICAgICBsZXZlbDogJ2luZm8nXG4gICAgICB9XVxuICAgIH1cbiAgXG4gICAgaWYob3B0aW9ucy5sb2dfcGF0aCl7XG4gICAgICBsb2dnZXIuc3RyZWFtcy5wdXNoKHsgcGF0aDogb3B0aW9ucy5sb2dfcGF0aCwgbGV2ZWw6ICdpbmZvJyB9KVxuICAgIH1cblxuICAgIHRoaXMubG9nZ2VyID0gbmV3IExvZ2dlcihsb2dnZXIpXG5cbiAgICB0aGlzLmNvbmZpZyA9IHtcbiAgICAgIGRvY3NfcGF0aDogcGF0aC5qb2luKHRoaXMucm9vdCwgJ2RvY3MnKSxcbiAgICAgIG1vZGVsc19wYXRoOiBwYXRoLmpvaW4odGhpcy5yb290LCAnbW9kZWxzJyksXG4gICAgICBhc3NldHNfcGF0aDogcGF0aC5qb2luKHRoaXMucm9vdCwgJ2Fzc2V0cycpLFxuICAgICAgZGF0YV9wYXRoOiBwYXRoLmpvaW4odGhpcy5yb290LCAnZGF0YScpLFxuICAgICAgdmlld3NfcGF0aDogcGF0aC5qb2luKHRoaXMucm9vdCwgJ3ZpZXdzJyksXG4gICAgICBjb21tYW5kc19wYXRoOiBwYXRoLmpvaW4odGhpcy5yb290LCAnY29tbWFuZHMnKSxcbiAgICAgIHF1ZXJpZXNfcGF0aDogcGF0aC5qb2luKHRoaXMucm9vdCwgJ3F1ZXJpZXMnKSxcbiAgICB9XG5cbiAgICB0aGlzLnNldHVwKClcbiAgfVxuICBcbiAgbG9nKC4uLnJlc3QpeyB0aGlzLmxvZ2dlci5pbmZvKC4uLnJlc3QpIH1cblxuICAvKiogXG4gICogUmV0dXJuIHRoZSBvdXRsaW5lIGZvciB0aGlzIGJyaWVmY2FzZSBpZiBpdCBleGlzdHMuXG4gICovXG4gIGdldCBvdXRsaW5lKCl7XG4gICAgcmV0dXJuIHRoaXMuYXQoJ291dGxpbmUubWQnKVxuICB9XG5cbiAgZ2V0IGluZGV4KCl7XG4gICAgaWYoX19kb2N1bWVudEluZGV4ZXNbdGhpcy5yb290XSl7XG4gICAgICByZXR1cm4gX19kb2N1bWVudEluZGV4ZXNbdGhpcy5yb290XVxuICAgIH1cbiAgICBcbiAgICByZXR1cm4gX19kb2N1bWVudEluZGV4ZXNbdGhpcy5yb290XSA9IGJ1aWxkSW5kZXhGcm9tRGlzayh0aGlzKVxuICB9XG5cbiAgLyoqXG4gICogTG9hZCBhIGJyaWVmY2FzZSBieSBwYXNzaW5nIGEgcGF0aCB0byBhIHJvb3QgZm9sZGVyLlxuICAqXG4gICogQHBhcmFtIHtzdHJpbmd9IHJvb3RQYXRoIC0gdGhlIHJvb3QgcGF0aCBvZiB0aGUgYnJpZWZjYXNlLlxuICAqIEByZXR1cm4ge0JyaWVmY2FzZX0gLSByZXR1cm5zIGEgYnJpZWZjYXNlXG4gICpcbiAgKi9cbiAgc3RhdGljIGxvYWQocm9vdFBhdGgsIG9wdGlvbnM9e30pIHtcbiAgICByZXR1cm4gbmV3IEJyaWVmY2FzZShyb290UGF0aCxvcHRpb25zKVxuICB9XG4gXG4gIC8qKlxuICAqIEZpbmQgdGhlIEJyaWVmY2FzZSBpbnN0YW5jZSByZXNwb25zaWJsZSBmb3IgYSBwYXJ0aWN1bGFyIHBhdGguXG4gICogTW9kZWxzIGFuZCBEb2N1bWVudHMgd2lsbCB1c2UgdGhpcyB0byBmaW5kIHRoZSBCcmllZmNhc2UgdGhleVxuICAqIGJlbG9uZyB0byBcbiAgKlxuICAqIEBwYXJhbSB7cGF0aH0gcGF0aCAtIHRoZSBwYXRoIG9mIHRoZSBkb2N1bWVudCB3aGljaCB3YW50cyB0byBrbm93XG4gICovXG4gIHN0YXRpYyBmaW5kRm9yUGF0aChjaGVja1BhdGg9XCJcIil7XG4gICAgbGV0IG1hdGNoaW5nUGF0aCA9IE9iamVjdC5rZXlzKF9fY2FjaGUpLmZpbmQocCA9PiBjaGVja1BhdGgubWF0Y2gocCkpXG4gICAgcmV0dXJuIF9fY2FjaGVbbWF0Y2hpbmdQYXRoXVxuICB9XG4gIFxuICAvKipcbiAgKiBSZXR1cm4gYWxsIGluc3RhbmNlcyBvZiBhIEJyaWVmY2FzZSB0aGF0IHdlIGFyZSBhd2FyZSBvZiBmcm9tIHRoZSBjYWNoZVxuICAqL1xuICBzdGF0aWMgaW5zdGFuY2VzKCl7XG4gICAgcmV0dXJuIE9iamVjdC5rZXlzKF9fY2FjaGUpLm1hcChwYXRoID0+IF9fY2FjaGVbcGF0aF0pXG4gIH1cbiAgXG4gIC8qKlxuICAqIEdldHMgYW55IGNvbmZpZyB2YWx1ZXMgdGhhdCBoYXZlIGJlZW4gc3VwcGxpZWQgdmlhIHRoZSBgcGFja2FnZS5qc29uYFxuICAqIGluIHRoaXMgQnJpZWZjYXNlIHJvb3QuICBMb29rcyBmb3IgYSBrZXkgY2FsbGVkIGBicmllZmAsIGFzIHdlbGwgYXMgYW55XG4gICogb2YgdGhlIHBsdWdpbnMgdGhhdCBoYXZlIGJlZW4gbG9hZGVkLlxuICAqL1xuICBnZXQgbWFuaWZlc3RDb25maWcoKXtcbiAgICBsZXQgYmFzZSA9IHt9XG4gICAgbGV0IG1hbmlmZXN0ID0gdGhpcy5tYW5pZmVzdCBcblxuICAgIGlmIChfLmlzRW1wdHkobWFuaWZlc3QpKSB7IHJldHVybiB7fSB9XG5cbiAgICBpZihtYW5pZmVzdC5icmllZil7IGJhc2UuYnJpZWYgPSBtYW5pZmVzdC5icmllZiB9XG5cbiAgICByZXR1cm4gdGhpcy5wbHVnaW5OYW1lcy5yZWR1Y2UoKG1lbW8scGx1Z2luKT0+e1xuICAgICAgaWYobWFuaWZlc3RbcGx1Z2luXSl7XG4gICAgICAgIG1lbW9bcGx1Z2luXSA9IG1hbmlmZXN0W3BsdWdpbl1cbiAgICAgIH1cblxuICAgICAgcmV0dXJuIG1lbW9cbiAgICB9LCBiYXNlKVxuICB9XG4gIFxuICAvKipcbiAgKiBHZXRzIGEgc2VyaWFsaXplZCB2ZXJzaW9uIG9mIHRoZSBgcGFja2FnZS5qc29uYCB0aGF0IGV4aXN0cyBpbiB0aGlzIEJyaWVmY2FzZSByb290IGZvbGRlci5cbiAgKi9cbiAgZ2V0IG1hbmlmZXN0KCl7XG4gICAgaWYoZnMuZXhpc3RzU3luYyhwYXRoLmpvaW4odGhpcy5yb290LCAncGFja2FnZS5qc29uJykpKXtcbiAgICAgIHJldHVybiBKU09OLnBhcnNlKGZzLnJlYWRGaWxlU3luYyhwYXRoLmpvaW4odGhpcy5yb290LCAncGFja2FnZS5qc29uJykpKVxuICAgIH1cbiAgfVxuICBcbiAgZ2V0IHJlc29sdmVyKCl7XG4gICAgcmV0dXJuIFJlc29sdmVyLmNyZWF0ZSh0aGlzKVxuICB9XG5cbiAgcmVzb2x2ZUxpbmsocGF0aEFsaWFzKXtcbiAgICByZXR1cm4gdGhpcy5yZXNvbHZlci5yZXNvbHZlTGluayhwYXRoQWxpYXMpXG4gIH1cblxuICByZXNvbHZlQXNzZXRQYXRoKHBhdGhBbGlhcyl7XG4gICAgcmV0dXJuIHRoaXMucmVzb2x2ZXIucmVzb2x2ZUFzc2V0UGF0aChwYXRoQWxpYXMpXG4gIH1cblxuICBnZXQgYXNzZXRzKCl7XG4gICAgcmV0dXJuIHRoaXMuY29sbGVjdGlvbnMuYXNzZXRzXG4gIH1cblxuICBnZXQgZGF0YSgpe1xuICAgIHJldHVybiB0aGlzLmNvbGxlY3Rpb25zLmRhdGFcbiAgfVxuXG4gIC8qKlxuICAqIFR1cm4gYWxsIG9mIHRoZSBkb2N1bWVudHMsIG1vZGVscywgZGF0YSwgYXNzZXRzLCBhbmQgb3RoZXIgbWV0YWRhdGEgYWJvdXQgdGhpcyBicmllZmNhc2VcbiAgKiBpbnRvIGEgc2luZ2xlIEpTT04gc3RydWN0dXJlLiBBbGlhcyBmb3IgdGhlIGBleHBvcnRXaXRoYCBtZXRob2QuXG4gICovXG4gIHRvSlNPTihvcHRpb25zPXt9KXtcbiAgICBpZihfLmlzU3RyaW5nKG9wdGlvbnMpKXtcbiAgICAgIG9wdGlvbnMgPSB7Zm9ybWF0OiBvcHRpb25zfVxuICAgIH1cblxuICAgIHJldHVybiB0aGlzLmV4cG9ydFdpdGgob3B0aW9ucy5mb3JtYXQgfHwgXCJzdGFuZGFyZFwiLCBvcHRpb25zKVxuICB9XG5cbiAgZXhwb3J0V2l0aChleHBvcnRlckZvcm1hdD1cInN0YW5kYXJkXCIsIG9wdGlvbnMgPSB7fSl7XG4gICAgcmV0dXJuIGV4cG9ydGVycy5jYWNoZWQodGhpcywgZXhwb3J0ZXJGb3JtYXQsIG9wdGlvbnMpXG4gIH1cbiAgXG4gIGdldCBjYWNoZUtleSgpe1xuICAgIGlmKF9fY2FjaGVLZXlzW3RoaXMucm9vdF0peyByZXR1cm4gX19jYWNoZUtleXNbdGhpcy5yb290XSB9XG4gICAgcmV0dXJuIF9fY2FjaGVLZXlzW3RoaXMucm9vdF0gPSB0aGlzLmNvbXB1dGVDYWNoZUtleSgpXG4gIH1cblxuICBjb21wdXRlQ2FjaGVLZXkoKXtcbiAgICBsZXQgbW9kaWZpZWRUaW1lcyA9IHRoaXMuZ2V0QWxsTW9kZWxzKCkubWFwKG1vZGVsID0+IG1vZGVsLmxhc3RNb2RpZmllZEF0KCkpLnNvcnQoKVxuICAgIGxldCBsYXRlc3QgPSBtb2RpZmllZFRpbWVzW21vZGlmaWVkVGltZXMubGVuZ3RoIC0gMV1cbiAgICByZXR1cm4gW3RoaXMubmFtZSwgbW9kaWZpZWRUaW1lcy5sZW5ndGgsIGxhdGVzdF0uam9pbignOicpXG4gIH1cbiAgXG4gIGlzU3RhbGUoKXtcbiAgICByZXR1cm4gdGhpcy5jYWNoZUtleSAhPT0gdGhpcy5jb21wdXRlQ2FjaGVLZXkoKVxuICB9XG4gIFxuICAvKipcbiAgKiBzZXR1cCB0aGlzIGJyaWVmY2FzZSBpbnZvbHZlcyBsb2FkaW5nIHRoZSBtb2RlbCBkZWZpbml0aW9uc1xuICAqIGFuZCBjcmVhdGluZyByZXBvc2l0b3JpZXMgZm9yIGFueSBhc3NldHMgb3IgZGF0YSBzb3VyY2VzXG4gICovIFxuICBzZXR1cCgpe1xuICAgIHRoaXMucGx1Z2luTmFtZXMgPSBbXVxuXG4gICAgcmVxdWlyZSgnLi9pbmRleCcpLnBsdWdpbnMuZm9yRWFjaChtb2RpZmllciA9PiB7XG4gICAgICB0aGlzLnBsdWdpbk5hbWVzLnB1c2gobW9kaWZpZXIucGx1Z2luX25hbWUgfHwgbW9kaWZpZXIucGx1Z2luTmFtZSlcbiAgICAgIG1vZGlmaWVyKHRoaXMpXG4gICAgfSlcbiAgICBcbiAgICBsb2FkTW9kZWxEZWZpbml0aW9ucyh0aGlzKVxuXG4gICAgY3JlYXRlQXNzZXRSZXBvc2l0b3J5KHRoaXMpIFxuXG4gICAgY3JlYXRlRGF0YVJlcG9zaXRvcnkodGhpcykgXG5cbiAgICBsb2FkSGVscGVycyh0aGlzKVxuICB9XG5cbiAgLyoqXG4gICogdXNlIGEgcGx1Z2luIHRvIGxvYWQgbW9kdWxlcywgYWN0aW9ucywgQ0xJIGhlbHBlcnMsIGV0Y1xuICAqL1xuICB1c2UocGx1Z2luLCBvcHRpb25zPXt9KXtcbiAgICBicmllZi51c2UocGx1Z2luKVxuICAgIHRoaXMuc2V0dXAoKVxuICAgIHJldHVybiB0aGlzXG4gIH1cblxuICAvKipcbiAgICogZ2V0IG1vZGVsIGF0IHRoZSBnaXZlbiByZWxhdGl2ZSBwYXRoIFxuICAgKiBcbiAgICogQGV4YW1wbGVcbiAgICogIGJyaWVmY2FzZS5hdCgnZXBpY3MvbW9kZWwtZGVmaW5pdGlvbi1kc2wnKVxuICAqL1xuICBhdChwYXRoX2FsaWFzLCBhYnNvbHV0ZT1mYWxzZSkge1xuICAgIGxldCBkb2NzX3BhdGggPSBwYXRoLnJlc29sdmUodGhpcy5jb25maWcuZG9jc19wYXRoKVxuXG4gICAgaWYoYWJzb2x1dGUpeyBwYXRoX2FsaWFzID0gcGF0aF9hbGlhcy5yZXBsYWNlKGRvY3NfcGF0aCwgJycpIH1cblxuICAgIGlmKCFwYXRoX2FsaWFzLm1hdGNoKC9cXC5tZCQvaSkpe1xuICAgICAgcGF0aF9hbGlhcyA9IHBhdGhfYWxpYXMgKyAnLm1kJyBcbiAgICB9XG5cbiAgICByZXR1cm4gdGhpcy5pbmRleFtwYXRoX2FsaWFzLnJlcGxhY2UoL15cXC8vLCcnKV1cbiAgfVxuXG4gIGZpbmREb2N1bWVudEJ5UGF0aChwYXRoKXtcbiAgICByZXR1cm4gdGhpcy5hdFBhdGgocGF0aF9hbGlhcywgdHJ1ZSlcbiAgfVxuXG4gIC8qKlxuICAqIGdldCBtb2RlbHMgYXQgZWFjaCBvZiB0aGUgcGF0aHMgcmVwcmVzZW50ZWRcbiAgKiBieSB0aGUgZ2xvYiBwYXR0ZXJuIHBhc3NlZCBoZXJlLlxuICAqL1xuICBnbG9iKHBhdHRlcm49XCIqKi8qLm1kXCIpIHtcbiAgICBsZXQgbWF0Y2hpbmdGaWxlcyA9IGdsb2Iuc3luYyhwYXRoLmpvaW4odGhpcy5yb290LCBwYXR0ZXJuKSlcbiAgICByZXR1cm4gbWF0Y2hpbmdGaWxlcy5tYXAocGF0aCA9PiB0aGlzLmF0KHBhdGgsdHJ1ZSkpIFxuICB9XG5cbiAgLyoqXG4gICAqIGZpbHRlcnMgYWxsIGF2YWlsYWJsZSBtb2RlbHMgYnkgdGhlIGdpdmVuIGl0ZXJhdG9yXG4gICAqXG4gICAqIEBleGFtcGxlXG4gICAqICBicmllZmNhc2UuZmlsdGVyQWxsKG1vZGVsID0+IG1vZGVsLnN0YXR1cyA9PT0gJ2FjdGl2ZScpXG4gICovXG4gIGZpbHRlckFsbCAoaXRlcmF0b3IpIHtcbiAgICByZXR1cm4gdGhpcy5nZXRBbGxNb2RlbHMoKS5maWx0ZXIoaXRlcmF0b3IpXG4gIH1cbiAgXG4gIGZpbmRNb2RlbHNCeURlZmluaXRpb24oZGVmaW5pdGlvbil7XG4gICAgbGV0IGdyb3VwTmFtZSA9IGRlZmluaXRpb24uZ3JvdXBOYW1lXG4gICAgcmV0dXJuIHRoaXMuZmlsdGVyQWxsKG1vZGVsID0+IG1vZGVsLmdyb3VwTmFtZSA9PT0gZ3JvdXBOYW1lKVxuICB9XG4gICBcbiAgLyoqXG4gICAqIGZpbHRlcnMgbW9kZWxzIGJ5IHRoZSBwcm9wZXJ0eSBhbmQgZGVzaXJlZCB2YWx1ZVxuICAgKiBcbiAgICogQHBhcmFtIHtzdHJpbmd9IHByb3BlcnR5IC0gbmFtZSBvZiB0aGUgcHJvcGVydHkgdG8gZmlsdGVyIG9uIFxuICAgKiBAcGFyYW0ge2FueX0gZGVzaXJlZFZhbHVlIC0gdGhlIHZhbHVlIHRvIG1hdGNoIGFnYWluc3RcbiAgICpcbiAgICogQHJldHVybiB7YXJyYXl9IC0gbW9kZWxzIHdob3NlIHByb3BlcnR5IG1hdGNoZXMgZGVzaXJlZFZhbHVlIFxuICAqL1xuICBmaWx0ZXJBbGxCeVByb3BlcnR5IChwcm9wZXJ0eSwgZGVzaXJlZFZhbHVlKSB7XG4gICAgcmV0dXJuIHRoaXMuZmlsdGVyQWxsKG1vZGVsID0+IG1vZGVsW3Byb3BlcnR5XSA9PT0gZGVzaXJlZFZhbHVlKVxuICB9XG4gIFxuICAvKipcbiAgICogc2VsZWN0cyBhbGwgdGhlIG1vZGVscyB3aG9zZSB0eXBlIG1hdGNoZXMgdGhlIHN1cHBsaWVkIGFyZyBcbiAgKi9cbiAgc2VsZWN0TW9kZWxzQnlUeXBlKHR5cGUpIHtcbiAgICByZXR1cm4gdGhpcy5maWx0ZXJBbGxCeVByb3BlcnR5KCd0eXBlJywgdHlwZSlcbiAgfVxuXG4gIC8qKlxuICAgKiBzZWxlY3RzIGFsbCB0aGUgbW9kZWxzIHdob3NlIGdyb3VwTmFtZSBtYXRjaGVzIHRoZSBzdXBwbGllZCBhcmcgXG4gICovXG4gIHNlbGVjdE1vZGVsc0J5R3JvdXAoZ3JvdXBOYW1lKSB7XG4gICAgcmV0dXJuIHRoaXMuZmlsdGVyQWxsQnlQcm9wZXJ0eSgnZ3JvdXBOYW1lJywgZ3JvdXBOYW1lKVxuICB9XG4gIFxuICAvKipcbiAgICogcmV0dXJucyBhbGwgdGhlIG1vZGVscyBpbiB0aGlzIGJyaWVmY2FzZVxuICAqL1xuICBnZXRBbGxNb2RlbHMoKSB7XG4gICAgcmV0dXJuIE9iamVjdC5rZXlzKHRoaXMuaW5kZXgpLm1hcChrZXkgPT4gdGhpcy5pbmRleFtrZXldKVxuICB9XG4gIFxuICAvKipcbiAgICogcmV0dXJucyB0aGUgcmF3IGRvY3VtZW50cyBpbiB0aGlzIGJyaWVmY2FzZVxuICAqL1xuICBnZXRBbGxEb2N1bWVudHMgKCkge1xuICAgIHJldHVybiB0aGlzLmdldEFsbE1vZGVscygpLm1hcChtb2RlbCA9PiBtb2RlbC5kb2N1bWVudClcbiAgfVxuICBcbiAgLyoqXG4gICogQXJjaGl2ZXMgdGhlIGJyaWVmY2FzZSBpbnRvIGEgemlwIGZpbGUuIEJyaWVmY2FzZXNcbiAgKiBjYW4gYmUgY3JlYXRlZCBkaXJlY3RseSBmcm9tIHppcCBmaWxlcyBpbiB0aGUgZnV0dXJlLlxuICAqXG4gICogQHBhcmFtIHtzdHJpbmd9IGxvY2F0aW9uIC0gd2hlcmUgdG8gc3RvcmUgdGhlIGZpbGU/XG4gICogQHBhcmFtIHthcnJheX0gaWdub3JlIC0gYSBsaXN0IG9mIGZpbGVzIHRvIGlnbm9yZSBhbmQgbm90IHB1dCBpbiB0aGVcbiAgKiAgIGFyY2hpdmVcbiAgKi9cbiAgYXJjaGl2ZShsb2NhdGlvbiwgaWdub3JlPVtdKSB7XG4gICAgbG9jYXRpb24gPSBsb2NhdGlvbiB8fCBcbiAgICBpZ25vcmUucHVzaChsb2NhdGlvbilcblxuICAgIG5ldyBQYWNrYWdlcih0aGlzLCBpZ25vcmUpLnBlcnNpc3QobG9jYXRpb24pXG4gIH1cbiAgXG4gIGdldEdyb3VwTmFtZXMgKCkge1xuICAgIHJldHVybiBPYmplY3Qua2V5cyh0aGlzLm1vZGVsX2RlZmluaXRpb25zKS5tYXAobmFtZSA9PiBpbmZsZWN0LnBsdXJhbGl6ZShuYW1lLnRvTG93ZXJDYXNlKCkpKVxuICB9XG5cbiAgZ2V0RG9jdW1lbnRUeXBlcyAoKSB7XG4gICAgcmV0dXJuIE9iamVjdC5rZXlzKHRoaXMubW9kZWxfZGVmaW5pdGlvbnMpLm1hcChuYW1lID0+IGluZmxlY3QudW5kZXJzY29yZShuYW1lLnRvTG93ZXJDYXNlKCkpKVxuICB9XG4gICAgXG4gIGxvYWRNb2RlbERlZmluaXRpb24ocGF0aCl7XG4gICAgcmV0dXJuIHRoaXMubG9hZE1vZGVsKE1vZGVsRGVmaW5pdGlvbi5sb2FkKHBhdGgpKVxuICB9XG5cbiAgbG9hZE1vZGVsIChkZWZpbml0aW9uKSB7XG4gICAgdGhpcy5tb2RlbF9kZWZpbml0aW9uc1tkZWZpbml0aW9uLm5hbWVdID0gdHJ1ZSBcbiAgICByZXR1cm4gZGVmaW5pdGlvblxuICB9XG5cbiAgbG9hZGVkTW9kZWxEZWZpbml0aW9ucyAoKSB7XG4gICAgcmV0dXJuIE9iamVjdC5rZXlzKHRoaXMubW9kZWxfZGVmaW5pdGlvbnMpXG4gIH1cblxuICBnZXRNb2RlbERlZmluaXRpb25zICgpIHsgXG4gICAgcmV0dXJuIE1vZGVsRGVmaW5pdGlvbi5nZXRBbGwoKVxuICB9XG5cbiAgZ2V0TW9kZWxEZWZpbml0aW9uIChtb2RlbE5hbWVPckFsaWFzKSB7XG4gICAgcmV0dXJuIE1vZGVsRGVmaW5pdGlvbi5sb29rdXAobW9kZWxOYW1lT3JBbGlhcylcbiAgfVxuXG4gIGdldFR5cGVBbGlhc2VzICgpe1xuICAgIHJldHVybiBNb2RlbERlZmluaXRpb24uZ2V0VHlwZUFsaWFzZXMoKVxuICB9XG5cbiAgZ2V0TW9kZWxTY2hlbWEgKCkge1xuICAgIHJldHVybiBNb2RlbERlZmluaXRpb24uZ2V0TW9kZWxTY2hlbWEoKVxuICB9XG5cbiAgZ2V0QWxsRmlsZXModXNlQWJzb2x1dGVQYXRocz1mYWxzZSl7XG4gICAgbGV0IGFsbEZpbGVzID0gZ2xvYi5zeW5jKHBhdGguam9pbih0aGlzLnJvb3QsICcqKi8qJykpXG4gICAgcmV0dXJuIHVzZUFic29sdXRlUGF0aHMgPyBhbGxGaWxlcyA6IGFsbEZpbGVzLm1hcChmID0+IGYucmVwbGFjZSh0aGlzLnJvb3QgKyAnLycsICcnKSlcbiAgfVxuIFxuIFxuICBfZ2V0RG9jdW1lbnRQYXRocygpIHtcbiAgICBsZXQgZG9jc19wYXRoID0gcGF0aC5yZXNvbHZlKHRoaXMuY29uZmlnLmRvY3NfcGF0aClcbiAgICByZXR1cm4gZ2xvYi5zeW5jKHBhdGguam9pbihkb2NzX3BhdGgsJyoqLyoubWQnKSlcbiAgfVxuXG59XG5cbmZ1bmN0aW9uIGJ1aWxkSW5kZXhGcm9tRGlzayhicmllZmNhc2UpIHtcbiAgbGV0IHBhdGhzID0gYnJpZWZjYXNlLl9nZXREb2N1bWVudFBhdGhzKClcbiAgbGV0IGluZGV4ID0ge31cblxuICBwYXRocy5mb3JFYWNoKChwYXRoKT0+e1xuICAgIGxldCBwYXRoX2FsaWFzID0gcGF0aC5yZXBsYWNlKGJyaWVmY2FzZS5jb25maWcuZG9jc19wYXRoICsgJy8nLCAnJylcbiAgICBsZXQgaWQgPSBwYXRoX2FsaWFzLnJlcGxhY2UoJy5tZCcsJycpXG4gICAgbGV0IGRvY3VtZW50ID0gbmV3IERvY3VtZW50KHBhdGgsIHtpZDogaWR9KVxuICAgIGxldCBtb2RlbCA9IGRvY3VtZW50LnRvTW9kZWwoe2lkOiBpZH0pIFxuICAgIFxuICAgIGRvY3VtZW50LmlkID0gcGF0aF9hbGlhc1xuICAgIGRvY3VtZW50LnJlbGF0aXZlX3BhdGggPSAnZG9jcy8nICsgcGF0aF9hbGlhc1xuICAgIG1vZGVsLmlkID0gaWRcbiAgICBtb2RlbC5nZXRQYXJlbnQgPSAoKT0+eyByZXR1cm4gYnJpZWZjYXNlIH1cbiAgICBpbmRleFtwYXRoX2FsaWFzXSA9IG1vZGVsXG4gIH0pXG5cbiAgcmV0dXJuIGluZGV4XG59XG5cbmZ1bmN0aW9uIGxvYWRNb2RlbERlZmluaXRpb25zKGJyaWVmY2FzZSl7XG4gIE1vZGVsRGVmaW5pdGlvbi5sb2FkRGVmaW5pdGlvbnNGcm9tUGF0aChicmllZmNhc2UuY29uZmlnLm1vZGVsc19wYXRoKVxuICBNb2RlbERlZmluaXRpb24ubG9hZERlZmluaXRpb25zRnJvbVBhdGgoX19kaXJuYW1lICsgJy9tb2RlbHMnKVxuXG4gIE1vZGVsRGVmaW5pdGlvbi5nZXRBbGwoKS5mb3JFYWNoKGZ1bmN0aW9uKGRlZmluaXRpb24pe1xuICAgIGJyaWVmY2FzZS5sb2FkTW9kZWwoZGVmaW5pdGlvbilcbiAgICBjcmVhdGVDb2xsZWN0aW9uKGJyaWVmY2FzZSwgZGVmaW5pdGlvbilcbiAgfSlcblxuICBNb2RlbERlZmluaXRpb24uZmluYWxpemUoKVxufVxuXG5mdW5jdGlvbiBjcmVhdGVDb2xsZWN0aW9uKGJyaWVmY2FzZSwgbW9kZWxEZWZpbml0aW9uKXtcbiAgbGV0IHtncm91cE5hbWUsIHR5cGVfYWxpYXN9ID0gbW9kZWxEZWZpbml0aW9uXG4gIFxuICB0cnkge1xuICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShicmllZmNhc2UsIGdyb3VwTmFtZSwge1xuICAgICAgZ2V0OiBmdW5jdGlvbigpe1xuICAgICAgICBpZihicmllZmNhc2UuY29sbGVjdGlvbnNbZ3JvdXBOYW1lXSl7XG4gICAgICAgICAgcmV0dXJuIGJyaWVmY2FzZS5jb2xsZWN0aW9uc1tncm91cE5hbWVdXG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gYnJpZWZjYXNlLmNvbGxlY3Rpb25zW2dyb3VwTmFtZV0gPSBjb2xsZWN0aW9uKGZ1bmN0aW9uKCl7XG4gICAgICAgICAgcmV0dXJuIGJyaWVmY2FzZS5zZWxlY3RNb2RlbHNCeVR5cGUodHlwZV9hbGlhcylcbiAgICAgICAgfSwgbW9kZWxEZWZpbml0aW9uKVxuICAgICAgfVxuICAgIH0pXG5cbiAgfSBjYXRjaChlKXtcblxuICB9XG59XG5cbmZ1bmN0aW9uIGNyZWF0ZUFzc2V0UmVwb3NpdG9yeShicmllZmNhc2Upe1xuICBPYmplY3QuZGVmaW5lUHJvcGVydHkoYnJpZWZjYXNlLmNvbGxlY3Rpb25zLCAnYXNzZXRzJywge1xuICAgIGNvbmZpZ3VyYWJsZTogdHJ1ZSxcbiAgICBnZXQ6IGZ1bmN0aW9uKCl7XG4gICAgICBkZWxldGUoYnJpZWZjYXNlLmNvbGxlY3Rpb25zLmFzc2V0cylcbiAgICAgIHJldHVybiBicmllZmNhc2UuY29sbGVjdGlvbnMuYXNzZXRzID0gQXNzZXQucmVwbyhicmllZmNhc2UsIGJyaWVmY2FzZS5jb25maWcuYXNzZXRzIHx8IHt9KVxuICAgIH1cbiAgfSkgXG59XG5cbmZ1bmN0aW9uIGNyZWF0ZURhdGFSZXBvc2l0b3J5KGJyaWVmY2FzZSl7XG4gIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShicmllZmNhc2UuY29sbGVjdGlvbnMsICdkYXRhJywge1xuICAgIGNvbmZpZ3VyYWJsZTogdHJ1ZSxcbiAgICBnZXQ6IGZ1bmN0aW9uKCl7XG4gICAgICBkZWxldGUoYnJpZWZjYXNlLmNvbGxlY3Rpb25zLmRhdGEpXG4gICAgICByZXR1cm4gYnJpZWZjYXNlLmNvbGxlY3Rpb25zLmRhdGEgPSBEYXRhU291cmNlLnJlcG8oYnJpZWZjYXNlLCBicmllZmNhc2UuY29uZmlnLmRhdGEgfHwge30pXG4gICAgfVxuICB9KSBcbn1cblxuZnVuY3Rpb24gbG9hZEhlbHBlcnMoYnJpZWZjYXNlKXtcbiAgbGV0IGNvbW1hbmRzID0gZ2xvYi5zeW5jKHBhdGguam9pbihicmllZmNhc2UuY29uZmlnLmNvbW1hbmRzX3BhdGgsJyoqLyouanMnKSlcbiAgbGV0IHF1ZXJpZXMgPSBnbG9iLnN5bmMocGF0aC5qb2luKGJyaWVmY2FzZS5jb25maWcucXVlcmllc19wYXRoLCcqKi8qLmpzJykpXG4gIGxldCB2aWV3cyA9IGdsb2Iuc3luYyhwYXRoLmpvaW4oYnJpZWZjYXNlLmNvbmZpZy52aWV3c19wYXRoLCcqKi8qLmpzJykpXG5cbiAgY29tbWFuZHMuZm9yRWFjaChjb21tYW5kID0+IGJyaWVmY2FzZS5jb21tYW5kcy5mcm9tUGF0aChjb21tYW5kKSlcbiAgcXVlcmllcy5mb3JFYWNoKHF1ZXJ5ID0+IGJyaWVmY2FzZS5xdWVyaWVzLmZyb21QYXRoKHF1ZXJ5KSlcbiAgdmlld3MuZm9yRWFjaCh2aWV3ID0+IGJyaWVmY2FzZS52aWV3cy5mcm9tUGF0aCh2aWV3KSlcbn1cbiJdfQ==