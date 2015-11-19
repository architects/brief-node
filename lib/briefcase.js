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

var inflect = (0, _i2['default'])(true);
var pluralize = inflect.pluralize;

var __cache = {};
var __documentIndexes = {};
var __cacheKeys = {};

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

    var logger = {
      name: "briefcase-" + this.name,
      streams: [{
        stream: process.stdout,
        level: 'debug'
      }]
    };

    if (options.log_path) {
      logger.streams.push({ path: options.log_path, level: trace });
    }

    this.logger = new _bunyan2['default'](logger);

    this.config = {
      docs_path: _path2['default'].join(this.root, 'docs'),
      models_path: _path2['default'].join(this.root, 'models'),
      assets_path: _path2['default'].join(this.root, 'assets'),
      data_path: _path2['default'].join(this.root, 'data'),
      views_path: _path2['default'].join(this.root, 'views')
    };

    this.setup();
  }

  /** 
  * Return the outline for this briefcase if it exists.
  */

  _createClass(Briefcase, [{
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
module.exports = exports['default'];
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3NyYy9icmllZmNhc2UuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7O2tCQUFlLElBQUk7Ozs7dUJBQ0YsVUFBVTs7OztvQkFDVixNQUFNOzs7O2lCQUNDLEdBQUc7Ozs7MEJBQ2IsWUFBWTs7OztzQkFDUCxRQUFROzs7O2lCQUVULElBQUk7Ozs7cUJBQ0osU0FBUzs7OzsyQkFDSixlQUFlOzs7O3dCQUNqQixZQUFZOzs7O3FCQUNmLFNBQVM7Ozs7Z0NBQ0Msb0JBQW9COzs7O3dCQUMzQixZQUFZOzs7O3dCQUNaLFlBQVk7Ozs7MEJBRVYsY0FBYzs7Ozt5QkFDZixhQUFhOzs7O0FBRW5DLElBQU0sT0FBTyxHQUFHLG9CQUFZLElBQUksQ0FBQyxDQUFBO0FBQ2pDLElBQU0sU0FBUyxHQUFHLE9BQU8sQ0FBQyxTQUFTLENBQUE7O0FBRW5DLElBQU0sT0FBTyxHQUFHLEVBQUUsQ0FBQTtBQUNsQixJQUFNLGlCQUFpQixHQUFHLEVBQUUsQ0FBQTtBQUM1QixJQUFNLFdBQVcsR0FBRyxFQUFFLENBQUE7O0lBRUQsU0FBUzs7Ozs7Ozs7Ozs7Ozs7QUFhakIsV0FiUSxTQUFTLENBYWhCLElBQUksRUFBRSxPQUFPLEVBQUU7MEJBYlIsU0FBUzs7QUFjMUIsV0FBTyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsR0FBRyxJQUFJLENBQUE7O0FBRXpCLFFBQUksQ0FBQyxJQUFJLEdBQVcsa0JBQUssT0FBTyxDQUFDLElBQUksQ0FBQyxDQUFBO0FBQ3RDLFFBQUksQ0FBQyxJQUFJLEdBQVcsT0FBTyxDQUFDLElBQUksSUFBSSxrQkFBSyxRQUFRLENBQUMsSUFBSSxDQUFDLENBQUE7QUFDdkQsUUFBSSxDQUFDLFlBQVksR0FBRyxrQkFBSyxPQUFPLENBQUMsSUFBSSxDQUFDLENBQUE7O0FBRXRDLFFBQUksQ0FBQyxPQUFPLEdBQUcsT0FBTyxJQUFJLEVBQUUsQ0FBQTs7QUFFNUIsUUFBSSxDQUFDLGlCQUFpQixHQUFHLEVBQUUsQ0FBQTtBQUMzQixRQUFJLENBQUMsV0FBVyxHQUFHLEVBQUUsQ0FBQTs7QUFHckIsUUFBSSxNQUFNLEdBQUc7QUFDWCxVQUFJLEVBQUUsWUFBWSxHQUFHLElBQUksQ0FBQyxJQUFJO0FBQzlCLGFBQU8sRUFBQyxDQUFDO0FBQ1AsY0FBTSxFQUFFLE9BQU8sQ0FBQyxNQUFNO0FBQ3RCLGFBQUssRUFBRSxPQUFPO09BQ2YsQ0FBQztLQUNILENBQUE7O0FBRUQsUUFBRyxPQUFPLENBQUMsUUFBUSxFQUFDO0FBQ2xCLFlBQU0sQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLEVBQUUsSUFBSSxFQUFFLE9BQU8sQ0FBQyxRQUFRLEVBQUUsS0FBSyxFQUFFLEtBQUssRUFBRSxDQUFDLENBQUE7S0FDOUQ7O0FBRUQsUUFBSSxDQUFDLE1BQU0sR0FBRyx3QkFBVyxNQUFNLENBQUMsQ0FBQTs7QUFFaEMsUUFBSSxDQUFDLE1BQU0sR0FBRztBQUNaLGVBQVMsRUFBRSxrQkFBSyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksRUFBRSxNQUFNLENBQUM7QUFDdkMsaUJBQVcsRUFBRSxrQkFBSyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksRUFBRSxRQUFRLENBQUM7QUFDM0MsaUJBQVcsRUFBRSxrQkFBSyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksRUFBRSxRQUFRLENBQUM7QUFDM0MsZUFBUyxFQUFFLGtCQUFLLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxFQUFFLE1BQU0sQ0FBQztBQUN2QyxnQkFBVSxFQUFFLGtCQUFLLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxFQUFFLE9BQU8sQ0FBQztLQUMxQyxDQUFBOztBQUVELFFBQUksQ0FBQyxLQUFLLEVBQUUsQ0FBQTtHQUNiOzs7Ozs7ZUFqRGtCLFNBQVM7O1dBbUlqQixxQkFBQyxTQUFTLEVBQUM7QUFDcEIsYUFBTyxJQUFJLENBQUMsUUFBUSxDQUFDLFdBQVcsQ0FBQyxTQUFTLENBQUMsQ0FBQTtLQUM1Qzs7O1dBRWUsMEJBQUMsU0FBUyxFQUFDO0FBQ3pCLGFBQU8sSUFBSSxDQUFDLFFBQVEsQ0FBQyxnQkFBZ0IsQ0FBQyxTQUFTLENBQUMsQ0FBQTtLQUNqRDs7Ozs7Ozs7V0FjSyxrQkFBWTtVQUFYLE9BQU8seURBQUMsRUFBRTs7QUFDZixVQUFHLHdCQUFFLFFBQVEsQ0FBQyxPQUFPLENBQUMsRUFBQztBQUNyQixlQUFPLEdBQUcsRUFBQyxNQUFNLEVBQUUsT0FBTyxFQUFDLENBQUE7T0FDNUI7O0FBRUQsYUFBTyxJQUFJLENBQUMsVUFBVSxDQUFDLE9BQU8sQ0FBQyxNQUFNLElBQUksVUFBVSxFQUFFLE9BQU8sQ0FBQyxDQUFBO0tBQzlEOzs7V0FFUyxzQkFBeUM7VUFBeEMsY0FBYyx5REFBQyxVQUFVO1VBQUUsT0FBTyx5REFBRyxFQUFFOztBQUNoRCxhQUFPLHVCQUFVLE1BQU0sQ0FBQyxJQUFJLEVBQUUsY0FBYyxFQUFFLE9BQU8sQ0FBQyxDQUFBO0tBQ3ZEOzs7V0FPYywyQkFBRTtBQUNmLFVBQUksYUFBYSxHQUFHLElBQUksQ0FBQyxZQUFZLEVBQUUsQ0FBQyxHQUFHLENBQUMsVUFBQSxLQUFLO2VBQUksS0FBSyxDQUFDLGNBQWMsRUFBRTtPQUFBLENBQUMsQ0FBQyxJQUFJLEVBQUUsQ0FBQTtBQUNuRixVQUFJLE1BQU0sR0FBRyxhQUFhLENBQUMsYUFBYSxDQUFDLE1BQU0sR0FBRyxDQUFDLENBQUMsQ0FBQTtBQUNwRCxhQUFPLENBQUMsSUFBSSxDQUFDLElBQUksRUFBRSxhQUFhLENBQUMsTUFBTSxFQUFFLE1BQU0sQ0FBQyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQTtLQUMzRDs7O1dBRU0sbUJBQUU7QUFDUCxhQUFPLElBQUksQ0FBQyxRQUFRLEtBQUssSUFBSSxDQUFDLGVBQWUsRUFBRSxDQUFBO0tBQ2hEOzs7Ozs7OztXQU1JLGlCQUFFOzs7QUFDTCxVQUFJLENBQUMsV0FBVyxHQUFHLEVBQUUsQ0FBQTs7QUFFckIsYUFBTyxDQUFDLFNBQVMsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxPQUFPLENBQUMsVUFBQSxRQUFRLEVBQUk7QUFDN0MsY0FBSyxXQUFXLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxXQUFXLElBQUksUUFBUSxDQUFDLFVBQVUsQ0FBQyxDQUFBO0FBQ2xFLGdCQUFRLE9BQU0sQ0FBQTtPQUNmLENBQUMsQ0FBQTs7QUFFRiwwQkFBb0IsQ0FBQyxJQUFJLENBQUMsQ0FBQTtBQUMxQiwyQkFBcUIsQ0FBQyxJQUFJLENBQUMsQ0FBQTtBQUMzQiwwQkFBb0IsQ0FBQyxJQUFJLENBQUMsQ0FBQTtLQUMzQjs7Ozs7OztXQUtFLGFBQUMsTUFBTSxFQUFhO1VBQVgsT0FBTyx5REFBQyxFQUFFOztBQUNwQixvQkFBTSxHQUFHLENBQUMsTUFBTSxDQUFDLENBQUE7QUFDakIsVUFBSSxDQUFDLEtBQUssRUFBRSxDQUFBO0FBQ1osYUFBTyxJQUFJLENBQUE7S0FDWjs7Ozs7Ozs7OztXQVFDLFlBQUMsVUFBVSxFQUFrQjtVQUFoQixRQUFRLHlEQUFDLEtBQUs7O0FBQzNCLFVBQUksU0FBUyxHQUFHLGtCQUFLLE9BQU8sQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLFNBQVMsQ0FBQyxDQUFBOztBQUVuRCxVQUFHLFFBQVEsRUFBQztBQUFFLGtCQUFVLEdBQUcsVUFBVSxDQUFDLE9BQU8sQ0FBQyxTQUFTLEVBQUUsRUFBRSxDQUFDLENBQUE7T0FBRTs7QUFFOUQsVUFBRyxDQUFDLFVBQVUsQ0FBQyxLQUFLLENBQUMsUUFBUSxDQUFDLEVBQUM7QUFDN0Isa0JBQVUsR0FBRyxVQUFVLEdBQUcsS0FBSyxDQUFBO09BQ2hDOztBQUVELGFBQU8sSUFBSSxDQUFDLEtBQUssQ0FBQyxVQUFVLENBQUMsT0FBTyxDQUFDLEtBQUssRUFBQyxFQUFFLENBQUMsQ0FBQyxDQUFBO0tBQ2hEOzs7V0FFaUIsNEJBQUMsSUFBSSxFQUFDO0FBQ3RCLGFBQU8sSUFBSSxDQUFDLE1BQU0sQ0FBQyxVQUFVLEVBQUUsSUFBSSxDQUFDLENBQUE7S0FDckM7Ozs7Ozs7O1dBS0csZ0JBQW9COzs7VUFBbkIsT0FBTyx5REFBQyxTQUFTOztBQUNwQixVQUFJLGFBQWEsR0FBRyxxQkFBSyxJQUFJLENBQUMsa0JBQUssSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLEVBQUUsT0FBTyxDQUFDLENBQUMsQ0FBQTtBQUM1RCxhQUFPLGFBQWEsQ0FBQyxHQUFHLENBQUMsVUFBQSxJQUFJO2VBQUksT0FBSyxFQUFFLENBQUMsSUFBSSxFQUFDLElBQUksQ0FBQztPQUFBLENBQUMsQ0FBQTtLQUNyRDs7Ozs7Ozs7OztXQVFTLG1CQUFDLFFBQVEsRUFBRTtBQUNuQixhQUFPLElBQUksQ0FBQyxZQUFZLEVBQUUsQ0FBQyxNQUFNLENBQUMsUUFBUSxDQUFDLENBQUE7S0FDNUM7OztXQUVxQixnQ0FBQyxVQUFVLEVBQUM7QUFDaEMsVUFBSSxTQUFTLEdBQUcsVUFBVSxDQUFDLFNBQVMsQ0FBQTtBQUNwQyxhQUFPLElBQUksQ0FBQyxTQUFTLENBQUMsVUFBQSxLQUFLO2VBQUksS0FBSyxDQUFDLFNBQVMsS0FBSyxTQUFTO09BQUEsQ0FBQyxDQUFBO0tBQzlEOzs7Ozs7Ozs7Ozs7V0FVbUIsNkJBQUMsUUFBUSxFQUFFLFlBQVksRUFBRTtBQUMzQyxhQUFPLElBQUksQ0FBQyxTQUFTLENBQUMsVUFBQSxLQUFLO2VBQUksS0FBSyxDQUFDLFFBQVEsQ0FBQyxLQUFLLFlBQVk7T0FBQSxDQUFDLENBQUE7S0FDakU7Ozs7Ozs7V0FLaUIsNEJBQUMsSUFBSSxFQUFFO0FBQ3ZCLGFBQU8sSUFBSSxDQUFDLG1CQUFtQixDQUFDLE1BQU0sRUFBRSxJQUFJLENBQUMsQ0FBQTtLQUM5Qzs7Ozs7OztXQUtrQiw2QkFBQyxTQUFTLEVBQUU7QUFDN0IsYUFBTyxJQUFJLENBQUMsbUJBQW1CLENBQUMsV0FBVyxFQUFFLFNBQVMsQ0FBQyxDQUFBO0tBQ3hEOzs7Ozs7O1dBS1csd0JBQUc7OztBQUNiLGFBQU8sTUFBTSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUMsR0FBRyxDQUFDLFVBQUEsR0FBRztlQUFJLE9BQUssS0FBSyxDQUFDLEdBQUcsQ0FBQztPQUFBLENBQUMsQ0FBQTtLQUMzRDs7Ozs7OztXQUtlLDJCQUFHO0FBQ2pCLGFBQU8sSUFBSSxDQUFDLFlBQVksRUFBRSxDQUFDLEdBQUcsQ0FBQyxVQUFBLEtBQUs7ZUFBSSxLQUFLLENBQUMsUUFBUTtPQUFBLENBQUMsQ0FBQTtLQUN4RDs7Ozs7Ozs7Ozs7O1dBVU0saUJBQUMsUUFBUSxFQUFhO1VBQVgsTUFBTSx5REFBQyxFQUFFOztBQUN6QixjQUFRLEdBQUcsUUFBUSxJQUNuQixNQUFNLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxDQUFBOztBQUVyQixnQ0FBYSxJQUFJLEVBQUUsTUFBTSxDQUFDLENBQUMsT0FBTyxDQUFDLFFBQVEsQ0FBQyxDQUFBO0tBQzdDOzs7V0FFYSx5QkFBRztBQUNmLGFBQU8sTUFBTSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsaUJBQWlCLENBQUMsQ0FBQyxHQUFHLENBQUMsVUFBQSxJQUFJO2VBQUksT0FBTyxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsV0FBVyxFQUFFLENBQUM7T0FBQSxDQUFDLENBQUE7S0FDOUY7OztXQUVnQiw0QkFBRztBQUNsQixhQUFPLE1BQU0sQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLGlCQUFpQixDQUFDLENBQUMsR0FBRyxDQUFDLFVBQUEsSUFBSTtlQUFJLE9BQU8sQ0FBQyxVQUFVLENBQUMsSUFBSSxDQUFDLFdBQVcsRUFBRSxDQUFDO09BQUEsQ0FBQyxDQUFBO0tBQy9GOzs7V0FFa0IsNkJBQUMsSUFBSSxFQUFDO0FBQ3ZCLGFBQU8sSUFBSSxDQUFDLFNBQVMsQ0FBQyw4QkFBZ0IsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUE7S0FDbEQ7OztXQUVTLG1CQUFDLFVBQVUsRUFBRTtBQUNyQixVQUFJLENBQUMsaUJBQWlCLENBQUMsVUFBVSxDQUFDLElBQUksQ0FBQyxHQUFHLElBQUksQ0FBQTtBQUM5QyxhQUFPLFVBQVUsQ0FBQTtLQUNsQjs7O1dBRXNCLGtDQUFHO0FBQ3hCLGFBQU8sTUFBTSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsaUJBQWlCLENBQUMsQ0FBQTtLQUMzQzs7O1dBRW1CLCtCQUFHO0FBQ3JCLGFBQU8sOEJBQWdCLE1BQU0sRUFBRSxDQUFBO0tBQ2hDOzs7V0FFa0IsNEJBQUMsZ0JBQWdCLEVBQUU7QUFDcEMsYUFBTyw4QkFBZ0IsTUFBTSxDQUFDLGdCQUFnQixDQUFDLENBQUE7S0FDaEQ7OztXQUVjLDBCQUFFO0FBQ2YsYUFBTyw4QkFBZ0IsY0FBYyxFQUFFLENBQUE7S0FDeEM7OztXQUVjLDBCQUFHO0FBQ2hCLGFBQU8sOEJBQWdCLGNBQWMsRUFBRSxDQUFBO0tBQ3hDOzs7V0FFVSx1QkFBd0I7OztVQUF2QixnQkFBZ0IseURBQUMsS0FBSzs7QUFDaEMsVUFBSSxRQUFRLEdBQUcscUJBQUssSUFBSSxDQUFDLGtCQUFLLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxFQUFFLE1BQU0sQ0FBQyxDQUFDLENBQUE7QUFDdEQsYUFBTyxnQkFBZ0IsR0FBRyxRQUFRLEdBQUcsUUFBUSxDQUFDLEdBQUcsQ0FBQyxVQUFBLENBQUM7ZUFBSSxDQUFDLENBQUMsT0FBTyxDQUFDLE9BQUssSUFBSSxHQUFHLEdBQUcsRUFBRSxFQUFFLENBQUM7T0FBQSxDQUFDLENBQUE7S0FDdkY7OztXQUdnQiw2QkFBRztBQUNsQixVQUFJLFNBQVMsR0FBRyxrQkFBSyxPQUFPLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxTQUFTLENBQUMsQ0FBQTtBQUNuRCxhQUFPLHFCQUFLLElBQUksQ0FBQyxrQkFBSyxJQUFJLENBQUMsU0FBUyxFQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUE7S0FDakQ7OztTQXhTVSxlQUFFO0FBQ1gsYUFBTyxJQUFJLENBQUMsRUFBRSxDQUFDLFlBQVksQ0FBQyxDQUFBO0tBQzdCOzs7U0FFUSxlQUFFO0FBQ1QsVUFBRyxpQkFBaUIsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLEVBQUM7QUFDOUIsZUFBTyxpQkFBaUIsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUE7T0FDcEM7O0FBRUQsYUFBTyxpQkFBaUIsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLEdBQUcsa0JBQWtCLENBQUMsSUFBSSxDQUFDLENBQUE7S0FDL0Q7Ozs7Ozs7Ozs7Ozs7Ozs7O1NBcUNpQixlQUFFO0FBQ2xCLFVBQUksSUFBSSxHQUFHLEVBQUUsQ0FBQTtBQUNiLFVBQUksUUFBUSxHQUFHLElBQUksQ0FBQyxRQUFRLENBQUE7O0FBRTVCLFVBQUksd0JBQUUsT0FBTyxDQUFDLFFBQVEsQ0FBQyxFQUFFO0FBQUUsZUFBTyxFQUFFLENBQUE7T0FBRTs7QUFFdEMsVUFBRyxRQUFRLENBQUMsS0FBSyxFQUFDO0FBQUUsWUFBSSxDQUFDLEtBQUssR0FBRyxRQUFRLENBQUMsS0FBSyxDQUFBO09BQUU7O0FBRWpELGFBQU8sSUFBSSxDQUFDLFdBQVcsQ0FBQyxNQUFNLENBQUMsVUFBQyxJQUFJLEVBQUMsTUFBTSxFQUFHO0FBQzVDLFlBQUcsUUFBUSxDQUFDLE1BQU0sQ0FBQyxFQUFDO0FBQ2xCLGNBQUksQ0FBQyxNQUFNLENBQUMsR0FBRyxRQUFRLENBQUMsTUFBTSxDQUFDLENBQUE7U0FDaEM7O0FBRUQsZUFBTyxJQUFJLENBQUE7T0FDWixFQUFFLElBQUksQ0FBQyxDQUFBO0tBQ1Q7Ozs7Ozs7U0FLVyxlQUFFO0FBQ1osVUFBRyxnQkFBRyxVQUFVLENBQUMsa0JBQUssSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLEVBQUUsY0FBYyxDQUFDLENBQUMsRUFBQztBQUNyRCxlQUFPLElBQUksQ0FBQyxLQUFLLENBQUMsZ0JBQUcsWUFBWSxDQUFDLGtCQUFLLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxFQUFFLGNBQWMsQ0FBQyxDQUFDLENBQUMsQ0FBQTtPQUN6RTtLQUNGOzs7U0FFVyxlQUFFO0FBQ1osYUFBTyxzQkFBUyxNQUFNLENBQUMsSUFBSSxDQUFDLENBQUE7S0FDN0I7OztTQVVTLGVBQUU7QUFDVixhQUFPLElBQUksQ0FBQyxXQUFXLENBQUMsTUFBTSxDQUFBO0tBQy9COzs7U0FFTyxlQUFFO0FBQ1IsYUFBTyxJQUFJLENBQUMsV0FBVyxDQUFDLElBQUksQ0FBQTtLQUM3Qjs7O1NBa0JXLGVBQUU7QUFDWixVQUFHLFdBQVcsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLEVBQUM7QUFBRSxlQUFPLFdBQVcsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUE7T0FBRTtBQUMzRCxhQUFPLFdBQVcsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLEdBQUcsSUFBSSxDQUFDLGVBQWUsRUFBRSxDQUFBO0tBQ3ZEOzs7V0E3RlUsY0FBQyxRQUFRLEVBQWM7VUFBWixPQUFPLHlEQUFDLEVBQUU7O0FBQzlCLGFBQU8sSUFBSSxTQUFTLENBQUMsUUFBUSxFQUFDLE9BQU8sQ0FBQyxDQUFBO0tBQ3ZDOzs7Ozs7Ozs7OztXQVNpQix1QkFBYztVQUFiLFNBQVMseURBQUMsRUFBRTs7QUFDN0IsVUFBSSxZQUFZLEdBQUcsTUFBTSxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsQ0FBQyxJQUFJLENBQUMsVUFBQSxDQUFDO2VBQUksU0FBUyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUM7T0FBQSxDQUFDLENBQUE7QUFDckUsYUFBTyxPQUFPLENBQUMsWUFBWSxDQUFDLENBQUE7S0FDN0I7Ozs7Ozs7V0FLZSxxQkFBRTtBQUNoQixhQUFPLE1BQU0sQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLENBQUMsR0FBRyxDQUFDLFVBQUEsSUFBSTtlQUFJLE9BQU8sQ0FBQyxJQUFJLENBQUM7T0FBQSxDQUFDLENBQUE7S0FDdkQ7OztTQTlGa0IsU0FBUzs7O3FCQUFULFNBQVM7O0FBa1c5QixTQUFTLGtCQUFrQixDQUFDLFNBQVMsRUFBRTtBQUNyQyxNQUFJLEtBQUssR0FBRyxTQUFTLENBQUMsaUJBQWlCLEVBQUUsQ0FBQTtBQUN6QyxNQUFJLEtBQUssR0FBRyxFQUFFLENBQUE7O0FBRWQsT0FBSyxDQUFDLE9BQU8sQ0FBQyxVQUFDLElBQUksRUFBRztBQUNwQixRQUFJLFVBQVUsR0FBRyxJQUFJLENBQUMsT0FBTyxDQUFDLFNBQVMsQ0FBQyxNQUFNLENBQUMsU0FBUyxHQUFHLEdBQUcsRUFBRSxFQUFFLENBQUMsQ0FBQTtBQUNuRSxRQUFJLEVBQUUsR0FBRyxVQUFVLENBQUMsT0FBTyxDQUFDLEtBQUssRUFBQyxFQUFFLENBQUMsQ0FBQTtBQUNyQyxRQUFJLFFBQVEsR0FBRywwQkFBYSxJQUFJLEVBQUUsRUFBQyxFQUFFLEVBQUUsRUFBRSxFQUFDLENBQUMsQ0FBQTtBQUMzQyxRQUFJLEtBQUssR0FBRyxRQUFRLENBQUMsT0FBTyxDQUFDLEVBQUMsRUFBRSxFQUFFLEVBQUUsRUFBQyxDQUFDLENBQUE7O0FBRXRDLFlBQVEsQ0FBQyxFQUFFLEdBQUcsVUFBVSxDQUFBO0FBQ3hCLFlBQVEsQ0FBQyxhQUFhLEdBQUcsT0FBTyxHQUFHLFVBQVUsQ0FBQTtBQUM3QyxTQUFLLENBQUMsRUFBRSxHQUFHLEVBQUUsQ0FBQTtBQUNiLFNBQUssQ0FBQyxTQUFTLEdBQUcsWUFBSTtBQUFFLGFBQU8sU0FBUyxDQUFBO0tBQUUsQ0FBQTtBQUMxQyxTQUFLLENBQUMsVUFBVSxDQUFDLEdBQUcsS0FBSyxDQUFBO0dBQzFCLENBQUMsQ0FBQTs7QUFFRixTQUFPLEtBQUssQ0FBQTtDQUNiOztBQUVELFNBQVMsb0JBQW9CLENBQUMsU0FBUyxFQUFDO0FBQ3RDLGdDQUFnQix1QkFBdUIsQ0FBQyxTQUFTLENBQUMsTUFBTSxDQUFDLFdBQVcsQ0FBQyxDQUFBO0FBQ3JFLGdDQUFnQix1QkFBdUIsQ0FBQyxTQUFTLEdBQUcsU0FBUyxDQUFDLENBQUE7O0FBRTlELGdDQUFnQixNQUFNLEVBQUUsQ0FBQyxPQUFPLENBQUMsVUFBUyxVQUFVLEVBQUM7QUFDbkQsYUFBUyxDQUFDLFNBQVMsQ0FBQyxVQUFVLENBQUMsQ0FBQTtBQUMvQixvQkFBZ0IsQ0FBQyxTQUFTLEVBQUUsVUFBVSxDQUFDLENBQUE7R0FDeEMsQ0FBQyxDQUFBOztBQUVGLGdDQUFnQixRQUFRLEVBQUUsQ0FBQTtDQUMzQjs7QUFFRCxTQUFTLGdCQUFnQixDQUFDLFNBQVMsRUFBRSxlQUFlLEVBQUM7TUFDOUMsU0FBUyxHQUFnQixlQUFlLENBQXhDLFNBQVM7TUFBRSxVQUFVLEdBQUksZUFBZSxDQUE3QixVQUFVOztBQUUxQixNQUFJO0FBQ0YsVUFBTSxDQUFDLGNBQWMsQ0FBQyxTQUFTLEVBQUUsU0FBUyxFQUFFO0FBQzFDLFNBQUcsRUFBRSxlQUFVO0FBQ2IsWUFBRyxTQUFTLENBQUMsV0FBVyxDQUFDLFNBQVMsQ0FBQyxFQUFDO0FBQ2xDLGlCQUFPLFNBQVMsQ0FBQyxXQUFXLENBQUMsU0FBUyxDQUFDLENBQUE7U0FDeEM7O0FBRUQsZUFBTyxTQUFTLENBQUMsV0FBVyxDQUFDLFNBQVMsQ0FBQyxHQUFHLDZCQUFXLFlBQVU7QUFDN0QsaUJBQU8sU0FBUyxDQUFDLGtCQUFrQixDQUFDLFVBQVUsQ0FBQyxDQUFBO1NBQ2hELEVBQUUsZUFBZSxDQUFDLENBQUE7T0FDcEI7S0FDRixDQUFDLENBQUE7R0FFSCxDQUFDLE9BQU0sQ0FBQyxFQUFDLEVBRVQ7Q0FDRjs7QUFFRCxTQUFTLHFCQUFxQixDQUFDLFNBQVMsRUFBQztBQUN2QyxRQUFNLENBQUMsY0FBYyxDQUFDLFNBQVMsQ0FBQyxXQUFXLEVBQUUsUUFBUSxFQUFFO0FBQ3JELGdCQUFZLEVBQUUsSUFBSTtBQUNsQixPQUFHLEVBQUUsZUFBVTtBQUNiLGFBQU8sU0FBUyxDQUFDLFdBQVcsQ0FBQyxNQUFNLEFBQUMsQ0FBQTtBQUNwQyxhQUFPLFNBQVMsQ0FBQyxXQUFXLENBQUMsTUFBTSxHQUFHLG1CQUFNLElBQUksQ0FBQyxTQUFTLEVBQUUsU0FBUyxDQUFDLE1BQU0sQ0FBQyxNQUFNLElBQUksRUFBRSxDQUFDLENBQUE7S0FDM0Y7R0FDRixDQUFDLENBQUE7Q0FDSDs7QUFFRCxTQUFTLG9CQUFvQixDQUFDLFNBQVMsRUFBQztBQUN0QyxRQUFNLENBQUMsY0FBYyxDQUFDLFNBQVMsQ0FBQyxXQUFXLEVBQUUsTUFBTSxFQUFFO0FBQ25ELGdCQUFZLEVBQUUsSUFBSTtBQUNsQixPQUFHLEVBQUUsZUFBVTtBQUNiLGFBQU8sU0FBUyxDQUFDLFdBQVcsQ0FBQyxJQUFJLEFBQUMsQ0FBQTtBQUNsQyxhQUFPLFNBQVMsQ0FBQyxXQUFXLENBQUMsSUFBSSxHQUFHLHlCQUFXLElBQUksQ0FBQyxTQUFTLEVBQUUsU0FBUyxDQUFDLE1BQU0sQ0FBQyxJQUFJLElBQUksRUFBRSxDQUFDLENBQUE7S0FDNUY7R0FDRixDQUFDLENBQUE7Q0FDSCIsImZpbGUiOiJicmllZmNhc2UuanMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgZnMgZnJvbSAnZnMnXG5pbXBvcnQgZ2xvYiBmcm9tICdnbG9iLWFsbCdcbmltcG9ydCBwYXRoIGZyb20gJ3BhdGgnXG5pbXBvcnQgaW5mbGVjdGlvbnMgZnJvbSAnaSdcbmltcG9ydCBfIGZyb20gJ3VuZGVyc2NvcmUnXG5pbXBvcnQgTG9nZ2VyIGZyb20gJ2J1bnlhbidcblxuaW1wb3J0IGJyaWVmIGZyb20gJy4uJ1xuaW1wb3J0IEFzc2V0IGZyb20gJy4vYXNzZXQnXG5pbXBvcnQgRGF0YVNvdXJjZSBmcm9tICcuL2RhdGFfc291cmNlJ1xuaW1wb3J0IERvY3VtZW50IGZyb20gJy4vZG9jdW1lbnQnXG5pbXBvcnQgTW9kZWwgZnJvbSAnLi9tb2RlbCdcbmltcG9ydCBNb2RlbERlZmluaXRpb24gZnJvbSAnLi9tb2RlbF9kZWZpbml0aW9uJ1xuaW1wb3J0IFBhY2thZ2VyIGZyb20gJy4vcGFja2FnZXInXG5pbXBvcnQgUmVzb2x2ZXIgZnJvbSAnLi9SZXNvbHZlcidcblxuaW1wb3J0IGNvbGxlY3Rpb24gZnJvbSAnLi9jb2xsZWN0aW9uJ1xuaW1wb3J0IGV4cG9ydGVycyBmcm9tICcuL2V4cG9ydGVycydcblxuY29uc3QgaW5mbGVjdCA9IGluZmxlY3Rpb25zKHRydWUpXG5jb25zdCBwbHVyYWxpemUgPSBpbmZsZWN0LnBsdXJhbGl6ZVxuXG5jb25zdCBfX2NhY2hlID0ge31cbmNvbnN0IF9fZG9jdW1lbnRJbmRleGVzID0ge31cbmNvbnN0IF9fY2FjaGVLZXlzID0ge31cblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgQnJpZWZjYXNlIHtcbiAgLyoqXG4gICogQ3JlYXRlIGEgbmV3IEJyaWVmY2FzZSBvYmplY3QgYXQgdGhlIHNwZWNpZmllZCByb290IHBhdGguXG4gICpcbiAgKiBAcGFyYW0ge3BhdGh9IHJvb3QgLSB0aGUgcm9vdCBwYXRoIG9mIHRoZSBicmllZmNhc2UuIGV4cGVjdHNcbiAgKiAgIHRvIGZpbmQgYSBjb25maWcgZmlsZSBcImJyaWVmLmNvbmZpZy5qc1wiLCBhbmQgYXQgbGVhc3QgYSBcbiAgKiAgIGRvY3VtZW50cyBmb2xkZXIuXG4gICpcbiAgKiBAcGFyYW0ge29wdGlvbnN9IG9wdGlvbnMgLSBvcHRpb25zIHRvIG92ZXJyaWRlIGRlZmF1bHQgYmVoYXZpb3IuXG4gICogQHBhcmFtIHtwYXRofSBkb2NzX3BhdGggLSB3aGljaCBmb2xkZXIgY29udGFpbnMgdGhlIGRvY3VtZW50cy5cbiAgKiBAcGFyYW0ge3BhdGh9IG1vZGVsc19wYXRoIC0gd2hpY2ggZm9sZGVyIGNvbnRhaW5zIHRoZSBtb2RlbHMgdG8gdXNlLlxuICAqIEBwYXJhbSB7cGF0aH0gYXNzZXRzX3BhdGggLSB3aGljaCBmb2xkZXIgY29udGFpbnMgdGhlIGFzc2V0cyB0byB1c2UgaWYgYW55LlxuICAqL1xuICBjb25zdHJ1Y3Rvcihyb290LCBvcHRpb25zKSB7XG4gICAgX19jYWNoZVt0aGlzLnJvb3RdID0gdGhpc1xuXG4gICAgdGhpcy5yb290ICAgICAgICAgPSBwYXRoLnJlc29sdmUocm9vdClcbiAgICB0aGlzLm5hbWUgICAgICAgICA9IG9wdGlvbnMubmFtZSB8fCBwYXRoLmJhc2VuYW1lKHJvb3QpXG4gICAgdGhpcy5wYXJlbnRGb2xkZXIgPSBwYXRoLmRpcm5hbWUocm9vdClcblxuICAgIHRoaXMub3B0aW9ucyA9IG9wdGlvbnMgfHwge31cblxuICAgIHRoaXMubW9kZWxfZGVmaW5pdGlvbnMgPSB7fVxuICAgIHRoaXMuY29sbGVjdGlvbnMgPSB7fVxuXG5cbiAgICBsZXQgbG9nZ2VyID0ge1xuICAgICAgbmFtZTogXCJicmllZmNhc2UtXCIgKyB0aGlzLm5hbWUsXG4gICAgICBzdHJlYW1zOlt7XG4gICAgICAgIHN0cmVhbTogcHJvY2Vzcy5zdGRvdXQsXG4gICAgICAgIGxldmVsOiAnZGVidWcnXG4gICAgICB9XVxuICAgIH1cbiAgXG4gICAgaWYob3B0aW9ucy5sb2dfcGF0aCl7XG4gICAgICBsb2dnZXIuc3RyZWFtcy5wdXNoKHsgcGF0aDogb3B0aW9ucy5sb2dfcGF0aCwgbGV2ZWw6IHRyYWNlIH0pXG4gICAgfVxuXG4gICAgdGhpcy5sb2dnZXIgPSBuZXcgTG9nZ2VyKGxvZ2dlcilcblxuICAgIHRoaXMuY29uZmlnID0ge1xuICAgICAgZG9jc19wYXRoOiBwYXRoLmpvaW4odGhpcy5yb290LCAnZG9jcycpLFxuICAgICAgbW9kZWxzX3BhdGg6IHBhdGguam9pbih0aGlzLnJvb3QsICdtb2RlbHMnKSxcbiAgICAgIGFzc2V0c19wYXRoOiBwYXRoLmpvaW4odGhpcy5yb290LCAnYXNzZXRzJyksXG4gICAgICBkYXRhX3BhdGg6IHBhdGguam9pbih0aGlzLnJvb3QsICdkYXRhJyksXG4gICAgICB2aWV3c19wYXRoOiBwYXRoLmpvaW4odGhpcy5yb290LCAndmlld3MnKVxuICAgIH1cbiAgICBcbiAgICB0aGlzLnNldHVwKClcbiAgfVxuICBcbiAgLyoqIFxuICAqIFJldHVybiB0aGUgb3V0bGluZSBmb3IgdGhpcyBicmllZmNhc2UgaWYgaXQgZXhpc3RzLlxuICAqL1xuICBnZXQgb3V0bGluZSgpe1xuICAgIHJldHVybiB0aGlzLmF0KCdvdXRsaW5lLm1kJylcbiAgfVxuXG4gIGdldCBpbmRleCgpe1xuICAgIGlmKF9fZG9jdW1lbnRJbmRleGVzW3RoaXMucm9vdF0pe1xuICAgICAgcmV0dXJuIF9fZG9jdW1lbnRJbmRleGVzW3RoaXMucm9vdF1cbiAgICB9XG4gICAgXG4gICAgcmV0dXJuIF9fZG9jdW1lbnRJbmRleGVzW3RoaXMucm9vdF0gPSBidWlsZEluZGV4RnJvbURpc2sodGhpcylcbiAgfVxuXG4gIC8qKlxuICAqIExvYWQgYSBicmllZmNhc2UgYnkgcGFzc2luZyBhIHBhdGggdG8gYSByb290IGZvbGRlci5cbiAgKlxuICAqIEBwYXJhbSB7c3RyaW5nfSByb290UGF0aCAtIHRoZSByb290IHBhdGggb2YgdGhlIGJyaWVmY2FzZS5cbiAgKiBAcmV0dXJuIHtCcmllZmNhc2V9IC0gcmV0dXJucyBhIGJyaWVmY2FzZVxuICAqXG4gICovXG4gIHN0YXRpYyBsb2FkKHJvb3RQYXRoLCBvcHRpb25zPXt9KSB7XG4gICAgcmV0dXJuIG5ldyBCcmllZmNhc2Uocm9vdFBhdGgsb3B0aW9ucylcbiAgfVxuIFxuICAvKipcbiAgKiBGaW5kIHRoZSBCcmllZmNhc2UgaW5zdGFuY2UgcmVzcG9uc2libGUgZm9yIGEgcGFydGljdWxhciBwYXRoLlxuICAqIE1vZGVscyBhbmQgRG9jdW1lbnRzIHdpbGwgdXNlIHRoaXMgdG8gZmluZCB0aGUgQnJpZWZjYXNlIHRoZXlcbiAgKiBiZWxvbmcgdG8gXG4gICpcbiAgKiBAcGFyYW0ge3BhdGh9IHBhdGggLSB0aGUgcGF0aCBvZiB0aGUgZG9jdW1lbnQgd2hpY2ggd2FudHMgdG8ga25vd1xuICAqL1xuICBzdGF0aWMgZmluZEZvclBhdGgoY2hlY2tQYXRoPVwiXCIpe1xuICAgIGxldCBtYXRjaGluZ1BhdGggPSBPYmplY3Qua2V5cyhfX2NhY2hlKS5maW5kKHAgPT4gY2hlY2tQYXRoLm1hdGNoKHApKVxuICAgIHJldHVybiBfX2NhY2hlW21hdGNoaW5nUGF0aF1cbiAgfVxuICBcbiAgLyoqXG4gICogUmV0dXJuIGFsbCBpbnN0YW5jZXMgb2YgYSBCcmllZmNhc2UgdGhhdCB3ZSBhcmUgYXdhcmUgb2YgZnJvbSB0aGUgY2FjaGVcbiAgKi9cbiAgc3RhdGljIGluc3RhbmNlcygpe1xuICAgIHJldHVybiBPYmplY3Qua2V5cyhfX2NhY2hlKS5tYXAocGF0aCA9PiBfX2NhY2hlW3BhdGhdKVxuICB9XG4gIFxuICAvKipcbiAgKiBHZXRzIGFueSBjb25maWcgdmFsdWVzIHRoYXQgaGF2ZSBiZWVuIHN1cHBsaWVkIHZpYSB0aGUgYHBhY2thZ2UuanNvbmBcbiAgKiBpbiB0aGlzIEJyaWVmY2FzZSByb290LiAgTG9va3MgZm9yIGEga2V5IGNhbGxlZCBgYnJpZWZgLCBhcyB3ZWxsIGFzIGFueVxuICAqIG9mIHRoZSBwbHVnaW5zIHRoYXQgaGF2ZSBiZWVuIGxvYWRlZC5cbiAgKi9cbiAgZ2V0IG1hbmlmZXN0Q29uZmlnKCl7XG4gICAgbGV0IGJhc2UgPSB7fVxuICAgIGxldCBtYW5pZmVzdCA9IHRoaXMubWFuaWZlc3QgXG5cbiAgICBpZiAoXy5pc0VtcHR5KG1hbmlmZXN0KSkgeyByZXR1cm4ge30gfVxuXG4gICAgaWYobWFuaWZlc3QuYnJpZWYpeyBiYXNlLmJyaWVmID0gbWFuaWZlc3QuYnJpZWYgfVxuXG4gICAgcmV0dXJuIHRoaXMucGx1Z2luTmFtZXMucmVkdWNlKChtZW1vLHBsdWdpbik9PntcbiAgICAgIGlmKG1hbmlmZXN0W3BsdWdpbl0pe1xuICAgICAgICBtZW1vW3BsdWdpbl0gPSBtYW5pZmVzdFtwbHVnaW5dXG4gICAgICB9XG5cbiAgICAgIHJldHVybiBtZW1vXG4gICAgfSwgYmFzZSlcbiAgfVxuICBcbiAgLyoqXG4gICogR2V0cyBhIHNlcmlhbGl6ZWQgdmVyc2lvbiBvZiB0aGUgYHBhY2thZ2UuanNvbmAgdGhhdCBleGlzdHMgaW4gdGhpcyBCcmllZmNhc2Ugcm9vdCBmb2xkZXIuXG4gICovXG4gIGdldCBtYW5pZmVzdCgpe1xuICAgIGlmKGZzLmV4aXN0c1N5bmMocGF0aC5qb2luKHRoaXMucm9vdCwgJ3BhY2thZ2UuanNvbicpKSl7XG4gICAgICByZXR1cm4gSlNPTi5wYXJzZShmcy5yZWFkRmlsZVN5bmMocGF0aC5qb2luKHRoaXMucm9vdCwgJ3BhY2thZ2UuanNvbicpKSlcbiAgICB9XG4gIH1cbiAgXG4gIGdldCByZXNvbHZlcigpe1xuICAgIHJldHVybiBSZXNvbHZlci5jcmVhdGUodGhpcylcbiAgfVxuXG4gIHJlc29sdmVMaW5rKHBhdGhBbGlhcyl7XG4gICAgcmV0dXJuIHRoaXMucmVzb2x2ZXIucmVzb2x2ZUxpbmsocGF0aEFsaWFzKVxuICB9XG5cbiAgcmVzb2x2ZUFzc2V0UGF0aChwYXRoQWxpYXMpe1xuICAgIHJldHVybiB0aGlzLnJlc29sdmVyLnJlc29sdmVBc3NldFBhdGgocGF0aEFsaWFzKVxuICB9XG5cbiAgZ2V0IGFzc2V0cygpe1xuICAgIHJldHVybiB0aGlzLmNvbGxlY3Rpb25zLmFzc2V0c1xuICB9XG5cbiAgZ2V0IGRhdGEoKXtcbiAgICByZXR1cm4gdGhpcy5jb2xsZWN0aW9ucy5kYXRhXG4gIH1cblxuICAvKipcbiAgKiBUdXJuIGFsbCBvZiB0aGUgZG9jdW1lbnRzLCBtb2RlbHMsIGRhdGEsIGFzc2V0cywgYW5kIG90aGVyIG1ldGFkYXRhIGFib3V0IHRoaXMgYnJpZWZjYXNlXG4gICogaW50byBhIHNpbmdsZSBKU09OIHN0cnVjdHVyZS4gQWxpYXMgZm9yIHRoZSBgZXhwb3J0V2l0aGAgbWV0aG9kLlxuICAqL1xuICB0b0pTT04ob3B0aW9ucz17fSl7XG4gICAgaWYoXy5pc1N0cmluZyhvcHRpb25zKSl7XG4gICAgICBvcHRpb25zID0ge2Zvcm1hdDogb3B0aW9uc31cbiAgICB9XG5cbiAgICByZXR1cm4gdGhpcy5leHBvcnRXaXRoKG9wdGlvbnMuZm9ybWF0IHx8IFwic3RhbmRhcmRcIiwgb3B0aW9ucylcbiAgfVxuXG4gIGV4cG9ydFdpdGgoZXhwb3J0ZXJGb3JtYXQ9XCJzdGFuZGFyZFwiLCBvcHRpb25zID0ge30pe1xuICAgIHJldHVybiBleHBvcnRlcnMuY2FjaGVkKHRoaXMsIGV4cG9ydGVyRm9ybWF0LCBvcHRpb25zKVxuICB9XG4gIFxuICBnZXQgY2FjaGVLZXkoKXtcbiAgICBpZihfX2NhY2hlS2V5c1t0aGlzLnJvb3RdKXsgcmV0dXJuIF9fY2FjaGVLZXlzW3RoaXMucm9vdF0gfVxuICAgIHJldHVybiBfX2NhY2hlS2V5c1t0aGlzLnJvb3RdID0gdGhpcy5jb21wdXRlQ2FjaGVLZXkoKVxuICB9XG5cbiAgY29tcHV0ZUNhY2hlS2V5KCl7XG4gICAgbGV0IG1vZGlmaWVkVGltZXMgPSB0aGlzLmdldEFsbE1vZGVscygpLm1hcChtb2RlbCA9PiBtb2RlbC5sYXN0TW9kaWZpZWRBdCgpKS5zb3J0KClcbiAgICBsZXQgbGF0ZXN0ID0gbW9kaWZpZWRUaW1lc1ttb2RpZmllZFRpbWVzLmxlbmd0aCAtIDFdXG4gICAgcmV0dXJuIFt0aGlzLm5hbWUsIG1vZGlmaWVkVGltZXMubGVuZ3RoLCBsYXRlc3RdLmpvaW4oJzonKVxuICB9XG4gIFxuICBpc1N0YWxlKCl7XG4gICAgcmV0dXJuIHRoaXMuY2FjaGVLZXkgIT09IHRoaXMuY29tcHV0ZUNhY2hlS2V5KClcbiAgfVxuICBcbiAgLyoqXG4gICogc2V0dXAgdGhpcyBicmllZmNhc2UgaW52b2x2ZXMgbG9hZGluZyB0aGUgbW9kZWwgZGVmaW5pdGlvbnNcbiAgKiBhbmQgY3JlYXRpbmcgcmVwb3NpdG9yaWVzIGZvciBhbnkgYXNzZXRzIG9yIGRhdGEgc291cmNlc1xuICAqLyBcbiAgc2V0dXAoKXtcbiAgICB0aGlzLnBsdWdpbk5hbWVzID0gW11cblxuICAgIHJlcXVpcmUoJy4vaW5kZXgnKS5wbHVnaW5zLmZvckVhY2gobW9kaWZpZXIgPT4ge1xuICAgICAgdGhpcy5wbHVnaW5OYW1lcy5wdXNoKG1vZGlmaWVyLnBsdWdpbl9uYW1lIHx8IG1vZGlmaWVyLnBsdWdpbk5hbWUpXG4gICAgICBtb2RpZmllcih0aGlzKVxuICAgIH0pXG4gICAgXG4gICAgbG9hZE1vZGVsRGVmaW5pdGlvbnModGhpcylcbiAgICBjcmVhdGVBc3NldFJlcG9zaXRvcnkodGhpcykgXG4gICAgY3JlYXRlRGF0YVJlcG9zaXRvcnkodGhpcykgXG4gIH1cbiAgXG4gIC8qKlxuICAqIHVzZSBhIHBsdWdpbiB0byBsb2FkIG1vZHVsZXMsIGFjdGlvbnMsIENMSSBoZWxwZXJzLCBldGNcbiAgKi9cbiAgdXNlKHBsdWdpbiwgb3B0aW9ucz17fSl7XG4gICAgYnJpZWYudXNlKHBsdWdpbilcbiAgICB0aGlzLnNldHVwKClcbiAgICByZXR1cm4gdGhpc1xuICB9XG5cbiAgLyoqXG4gICAqIGdldCBtb2RlbCBhdCB0aGUgZ2l2ZW4gcmVsYXRpdmUgcGF0aCBcbiAgICogXG4gICAqIEBleGFtcGxlXG4gICAqICBicmllZmNhc2UuYXQoJ2VwaWNzL21vZGVsLWRlZmluaXRpb24tZHNsJylcbiAgKi9cbiAgYXQocGF0aF9hbGlhcywgYWJzb2x1dGU9ZmFsc2UpIHtcbiAgICBsZXQgZG9jc19wYXRoID0gcGF0aC5yZXNvbHZlKHRoaXMuY29uZmlnLmRvY3NfcGF0aClcblxuICAgIGlmKGFic29sdXRlKXsgcGF0aF9hbGlhcyA9IHBhdGhfYWxpYXMucmVwbGFjZShkb2NzX3BhdGgsICcnKSB9XG5cbiAgICBpZighcGF0aF9hbGlhcy5tYXRjaCgvXFwubWQkL2kpKXtcbiAgICAgIHBhdGhfYWxpYXMgPSBwYXRoX2FsaWFzICsgJy5tZCcgXG4gICAgfVxuXG4gICAgcmV0dXJuIHRoaXMuaW5kZXhbcGF0aF9hbGlhcy5yZXBsYWNlKC9eXFwvLywnJyldXG4gIH1cblxuICBmaW5kRG9jdW1lbnRCeVBhdGgocGF0aCl7XG4gICAgcmV0dXJuIHRoaXMuYXRQYXRoKHBhdGhfYWxpYXMsIHRydWUpXG4gIH1cbiAgLyoqXG4gICogZ2V0IG1vZGVscyBhdCBlYWNoIG9mIHRoZSBwYXRocyByZXByZXNlbnRlZFxuICAqIGJ5IHRoZSBnbG9iIHBhdHRlcm4gcGFzc2VkIGhlcmUuXG4gICovXG4gIGdsb2IocGF0dGVybj1cIioqLyoubWRcIikge1xuICAgIGxldCBtYXRjaGluZ0ZpbGVzID0gZ2xvYi5zeW5jKHBhdGguam9pbih0aGlzLnJvb3QsIHBhdHRlcm4pKVxuICAgIHJldHVybiBtYXRjaGluZ0ZpbGVzLm1hcChwYXRoID0+IHRoaXMuYXQocGF0aCx0cnVlKSkgXG4gIH1cblxuICAvKipcbiAgICogZmlsdGVycyBhbGwgYXZhaWxhYmxlIG1vZGVscyBieSB0aGUgZ2l2ZW4gaXRlcmF0b3JcbiAgICpcbiAgICogQGV4YW1wbGVcbiAgICogIGJyaWVmY2FzZS5maWx0ZXJBbGwobW9kZWwgPT4gbW9kZWwuc3RhdHVzID09PSAnYWN0aXZlJylcbiAgKi9cbiAgZmlsdGVyQWxsIChpdGVyYXRvcikge1xuICAgIHJldHVybiB0aGlzLmdldEFsbE1vZGVscygpLmZpbHRlcihpdGVyYXRvcilcbiAgfVxuICBcbiAgZmluZE1vZGVsc0J5RGVmaW5pdGlvbihkZWZpbml0aW9uKXtcbiAgICBsZXQgZ3JvdXBOYW1lID0gZGVmaW5pdGlvbi5ncm91cE5hbWVcbiAgICByZXR1cm4gdGhpcy5maWx0ZXJBbGwobW9kZWwgPT4gbW9kZWwuZ3JvdXBOYW1lID09PSBncm91cE5hbWUpXG4gIH1cbiAgIFxuICAvKipcbiAgICogZmlsdGVycyBtb2RlbHMgYnkgdGhlIHByb3BlcnR5IGFuZCBkZXNpcmVkIHZhbHVlXG4gICAqIFxuICAgKiBAcGFyYW0ge3N0cmluZ30gcHJvcGVydHkgLSBuYW1lIG9mIHRoZSBwcm9wZXJ0eSB0byBmaWx0ZXIgb24gXG4gICAqIEBwYXJhbSB7YW55fSBkZXNpcmVkVmFsdWUgLSB0aGUgdmFsdWUgdG8gbWF0Y2ggYWdhaW5zdFxuICAgKlxuICAgKiBAcmV0dXJuIHthcnJheX0gLSBtb2RlbHMgd2hvc2UgcHJvcGVydHkgbWF0Y2hlcyBkZXNpcmVkVmFsdWUgXG4gICovXG4gIGZpbHRlckFsbEJ5UHJvcGVydHkgKHByb3BlcnR5LCBkZXNpcmVkVmFsdWUpIHtcbiAgICByZXR1cm4gdGhpcy5maWx0ZXJBbGwobW9kZWwgPT4gbW9kZWxbcHJvcGVydHldID09PSBkZXNpcmVkVmFsdWUpXG4gIH1cbiAgXG4gIC8qKlxuICAgKiBzZWxlY3RzIGFsbCB0aGUgbW9kZWxzIHdob3NlIHR5cGUgbWF0Y2hlcyB0aGUgc3VwcGxpZWQgYXJnIFxuICAqL1xuICBzZWxlY3RNb2RlbHNCeVR5cGUodHlwZSkge1xuICAgIHJldHVybiB0aGlzLmZpbHRlckFsbEJ5UHJvcGVydHkoJ3R5cGUnLCB0eXBlKVxuICB9XG5cbiAgLyoqXG4gICAqIHNlbGVjdHMgYWxsIHRoZSBtb2RlbHMgd2hvc2UgZ3JvdXBOYW1lIG1hdGNoZXMgdGhlIHN1cHBsaWVkIGFyZyBcbiAgKi9cbiAgc2VsZWN0TW9kZWxzQnlHcm91cChncm91cE5hbWUpIHtcbiAgICByZXR1cm4gdGhpcy5maWx0ZXJBbGxCeVByb3BlcnR5KCdncm91cE5hbWUnLCBncm91cE5hbWUpXG4gIH1cbiAgXG4gIC8qKlxuICAgKiByZXR1cm5zIGFsbCB0aGUgbW9kZWxzIGluIHRoaXMgYnJpZWZjYXNlXG4gICovXG4gIGdldEFsbE1vZGVscygpIHtcbiAgICByZXR1cm4gT2JqZWN0LmtleXModGhpcy5pbmRleCkubWFwKGtleSA9PiB0aGlzLmluZGV4W2tleV0pXG4gIH1cbiAgXG4gIC8qKlxuICAgKiByZXR1cm5zIHRoZSByYXcgZG9jdW1lbnRzIGluIHRoaXMgYnJpZWZjYXNlXG4gICovXG4gIGdldEFsbERvY3VtZW50cyAoKSB7XG4gICAgcmV0dXJuIHRoaXMuZ2V0QWxsTW9kZWxzKCkubWFwKG1vZGVsID0+IG1vZGVsLmRvY3VtZW50KVxuICB9XG4gIFxuICAvKipcbiAgKiBBcmNoaXZlcyB0aGUgYnJpZWZjYXNlIGludG8gYSB6aXAgZmlsZS4gQnJpZWZjYXNlc1xuICAqIGNhbiBiZSBjcmVhdGVkIGRpcmVjdGx5IGZyb20gemlwIGZpbGVzIGluIHRoZSBmdXR1cmUuXG4gICpcbiAgKiBAcGFyYW0ge3N0cmluZ30gbG9jYXRpb24gLSB3aGVyZSB0byBzdG9yZSB0aGUgZmlsZT9cbiAgKiBAcGFyYW0ge2FycmF5fSBpZ25vcmUgLSBhIGxpc3Qgb2YgZmlsZXMgdG8gaWdub3JlIGFuZCBub3QgcHV0IGluIHRoZVxuICAqICAgYXJjaGl2ZVxuICAqL1xuICBhcmNoaXZlKGxvY2F0aW9uLCBpZ25vcmU9W10pIHtcbiAgICBsb2NhdGlvbiA9IGxvY2F0aW9uIHx8IFxuICAgIGlnbm9yZS5wdXNoKGxvY2F0aW9uKVxuXG4gICAgbmV3IFBhY2thZ2VyKHRoaXMsIGlnbm9yZSkucGVyc2lzdChsb2NhdGlvbilcbiAgfVxuICBcbiAgZ2V0R3JvdXBOYW1lcyAoKSB7XG4gICAgcmV0dXJuIE9iamVjdC5rZXlzKHRoaXMubW9kZWxfZGVmaW5pdGlvbnMpLm1hcChuYW1lID0+IGluZmxlY3QucGx1cmFsaXplKG5hbWUudG9Mb3dlckNhc2UoKSkpXG4gIH1cblxuICBnZXREb2N1bWVudFR5cGVzICgpIHtcbiAgICByZXR1cm4gT2JqZWN0LmtleXModGhpcy5tb2RlbF9kZWZpbml0aW9ucykubWFwKG5hbWUgPT4gaW5mbGVjdC51bmRlcnNjb3JlKG5hbWUudG9Mb3dlckNhc2UoKSkpXG4gIH1cbiAgXG4gIGxvYWRNb2RlbERlZmluaXRpb24ocGF0aCl7XG4gICAgcmV0dXJuIHRoaXMubG9hZE1vZGVsKE1vZGVsRGVmaW5pdGlvbi5sb2FkKHBhdGgpKVxuICB9XG5cbiAgbG9hZE1vZGVsIChkZWZpbml0aW9uKSB7XG4gICAgdGhpcy5tb2RlbF9kZWZpbml0aW9uc1tkZWZpbml0aW9uLm5hbWVdID0gdHJ1ZSBcbiAgICByZXR1cm4gZGVmaW5pdGlvblxuICB9XG5cbiAgbG9hZGVkTW9kZWxEZWZpbml0aW9ucyAoKSB7XG4gICAgcmV0dXJuIE9iamVjdC5rZXlzKHRoaXMubW9kZWxfZGVmaW5pdGlvbnMpXG4gIH1cblxuICBnZXRNb2RlbERlZmluaXRpb25zICgpIHsgXG4gICAgcmV0dXJuIE1vZGVsRGVmaW5pdGlvbi5nZXRBbGwoKVxuICB9XG5cbiAgZ2V0TW9kZWxEZWZpbml0aW9uIChtb2RlbE5hbWVPckFsaWFzKSB7XG4gICAgcmV0dXJuIE1vZGVsRGVmaW5pdGlvbi5sb29rdXAobW9kZWxOYW1lT3JBbGlhcylcbiAgfVxuXG4gIGdldFR5cGVBbGlhc2VzICgpe1xuICAgIHJldHVybiBNb2RlbERlZmluaXRpb24uZ2V0VHlwZUFsaWFzZXMoKVxuICB9XG5cbiAgZ2V0TW9kZWxTY2hlbWEgKCkge1xuICAgIHJldHVybiBNb2RlbERlZmluaXRpb24uZ2V0TW9kZWxTY2hlbWEoKVxuICB9XG5cbiAgZ2V0QWxsRmlsZXModXNlQWJzb2x1dGVQYXRocz1mYWxzZSl7XG4gICAgbGV0IGFsbEZpbGVzID0gZ2xvYi5zeW5jKHBhdGguam9pbih0aGlzLnJvb3QsICcqKi8qJykpXG4gICAgcmV0dXJuIHVzZUFic29sdXRlUGF0aHMgPyBhbGxGaWxlcyA6IGFsbEZpbGVzLm1hcChmID0+IGYucmVwbGFjZSh0aGlzLnJvb3QgKyAnLycsICcnKSlcbiAgfVxuIFxuIFxuICBfZ2V0RG9jdW1lbnRQYXRocygpIHtcbiAgICBsZXQgZG9jc19wYXRoID0gcGF0aC5yZXNvbHZlKHRoaXMuY29uZmlnLmRvY3NfcGF0aClcbiAgICByZXR1cm4gZ2xvYi5zeW5jKHBhdGguam9pbihkb2NzX3BhdGgsJyoqLyoubWQnKSlcbiAgfVxuXG59XG5cbmZ1bmN0aW9uIGJ1aWxkSW5kZXhGcm9tRGlzayhicmllZmNhc2UpIHtcbiAgbGV0IHBhdGhzID0gYnJpZWZjYXNlLl9nZXREb2N1bWVudFBhdGhzKClcbiAgbGV0IGluZGV4ID0ge31cblxuICBwYXRocy5mb3JFYWNoKChwYXRoKT0+e1xuICAgIGxldCBwYXRoX2FsaWFzID0gcGF0aC5yZXBsYWNlKGJyaWVmY2FzZS5jb25maWcuZG9jc19wYXRoICsgJy8nLCAnJylcbiAgICBsZXQgaWQgPSBwYXRoX2FsaWFzLnJlcGxhY2UoJy5tZCcsJycpXG4gICAgbGV0IGRvY3VtZW50ID0gbmV3IERvY3VtZW50KHBhdGgsIHtpZDogaWR9KVxuICAgIGxldCBtb2RlbCA9IGRvY3VtZW50LnRvTW9kZWwoe2lkOiBpZH0pIFxuICAgIFxuICAgIGRvY3VtZW50LmlkID0gcGF0aF9hbGlhc1xuICAgIGRvY3VtZW50LnJlbGF0aXZlX3BhdGggPSAnZG9jcy8nICsgcGF0aF9hbGlhc1xuICAgIG1vZGVsLmlkID0gaWRcbiAgICBtb2RlbC5nZXRQYXJlbnQgPSAoKT0+eyByZXR1cm4gYnJpZWZjYXNlIH1cbiAgICBpbmRleFtwYXRoX2FsaWFzXSA9IG1vZGVsXG4gIH0pXG5cbiAgcmV0dXJuIGluZGV4XG59XG5cbmZ1bmN0aW9uIGxvYWRNb2RlbERlZmluaXRpb25zKGJyaWVmY2FzZSl7XG4gIE1vZGVsRGVmaW5pdGlvbi5sb2FkRGVmaW5pdGlvbnNGcm9tUGF0aChicmllZmNhc2UuY29uZmlnLm1vZGVsc19wYXRoKVxuICBNb2RlbERlZmluaXRpb24ubG9hZERlZmluaXRpb25zRnJvbVBhdGgoX19kaXJuYW1lICsgJy9tb2RlbHMnKVxuXG4gIE1vZGVsRGVmaW5pdGlvbi5nZXRBbGwoKS5mb3JFYWNoKGZ1bmN0aW9uKGRlZmluaXRpb24pe1xuICAgIGJyaWVmY2FzZS5sb2FkTW9kZWwoZGVmaW5pdGlvbilcbiAgICBjcmVhdGVDb2xsZWN0aW9uKGJyaWVmY2FzZSwgZGVmaW5pdGlvbilcbiAgfSlcblxuICBNb2RlbERlZmluaXRpb24uZmluYWxpemUoKVxufVxuXG5mdW5jdGlvbiBjcmVhdGVDb2xsZWN0aW9uKGJyaWVmY2FzZSwgbW9kZWxEZWZpbml0aW9uKXtcbiAgbGV0IHtncm91cE5hbWUsIHR5cGVfYWxpYXN9ID0gbW9kZWxEZWZpbml0aW9uXG4gIFxuICB0cnkge1xuICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShicmllZmNhc2UsIGdyb3VwTmFtZSwge1xuICAgICAgZ2V0OiBmdW5jdGlvbigpe1xuICAgICAgICBpZihicmllZmNhc2UuY29sbGVjdGlvbnNbZ3JvdXBOYW1lXSl7XG4gICAgICAgICAgcmV0dXJuIGJyaWVmY2FzZS5jb2xsZWN0aW9uc1tncm91cE5hbWVdXG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gYnJpZWZjYXNlLmNvbGxlY3Rpb25zW2dyb3VwTmFtZV0gPSBjb2xsZWN0aW9uKGZ1bmN0aW9uKCl7XG4gICAgICAgICAgcmV0dXJuIGJyaWVmY2FzZS5zZWxlY3RNb2RlbHNCeVR5cGUodHlwZV9hbGlhcylcbiAgICAgICAgfSwgbW9kZWxEZWZpbml0aW9uKVxuICAgICAgfVxuICAgIH0pXG5cbiAgfSBjYXRjaChlKXtcblxuICB9XG59XG5cbmZ1bmN0aW9uIGNyZWF0ZUFzc2V0UmVwb3NpdG9yeShicmllZmNhc2Upe1xuICBPYmplY3QuZGVmaW5lUHJvcGVydHkoYnJpZWZjYXNlLmNvbGxlY3Rpb25zLCAnYXNzZXRzJywge1xuICAgIGNvbmZpZ3VyYWJsZTogdHJ1ZSxcbiAgICBnZXQ6IGZ1bmN0aW9uKCl7XG4gICAgICBkZWxldGUoYnJpZWZjYXNlLmNvbGxlY3Rpb25zLmFzc2V0cylcbiAgICAgIHJldHVybiBicmllZmNhc2UuY29sbGVjdGlvbnMuYXNzZXRzID0gQXNzZXQucmVwbyhicmllZmNhc2UsIGJyaWVmY2FzZS5jb25maWcuYXNzZXRzIHx8IHt9KVxuICAgIH1cbiAgfSkgXG59XG5cbmZ1bmN0aW9uIGNyZWF0ZURhdGFSZXBvc2l0b3J5KGJyaWVmY2FzZSl7XG4gIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShicmllZmNhc2UuY29sbGVjdGlvbnMsICdkYXRhJywge1xuICAgIGNvbmZpZ3VyYWJsZTogdHJ1ZSxcbiAgICBnZXQ6IGZ1bmN0aW9uKCl7XG4gICAgICBkZWxldGUoYnJpZWZjYXNlLmNvbGxlY3Rpb25zLmRhdGEpXG4gICAgICByZXR1cm4gYnJpZWZjYXNlLmNvbGxlY3Rpb25zLmRhdGEgPSBEYXRhU291cmNlLnJlcG8oYnJpZWZjYXNlLCBicmllZmNhc2UuY29uZmlnLmRhdGEgfHwge30pXG4gICAgfVxuICB9KSBcbn1cbiJdfQ==