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

    this.config = {
      docs_path: _path2['default'].join(this.root, 'docs'),
      models_path: _path2['default'].join(this.root, 'models'),
      assets_path: _path2['default'].join(this.root, 'assets'),
      data_path: _path2['default'].join(this.root, 'data')
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3NyYy9icmllZmNhc2UuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7O2tCQUFlLElBQUk7Ozs7dUJBQ0YsVUFBVTs7OztvQkFDVixNQUFNOzs7O2lCQUNDLEdBQUc7Ozs7MEJBQ2IsWUFBWTs7OztpQkFFUixJQUFJOzs7O3FCQUNKLFNBQVM7Ozs7MkJBQ0osZUFBZTs7Ozt3QkFDakIsWUFBWTs7OztxQkFDZixTQUFTOzs7O2dDQUNDLG9CQUFvQjs7Ozt3QkFDM0IsWUFBWTs7Ozt3QkFDWixZQUFZOzs7OzBCQUVWLGNBQWM7Ozs7eUJBQ2YsYUFBYTs7OztBQUVuQyxJQUFNLE9BQU8sR0FBRyxvQkFBWSxJQUFJLENBQUMsQ0FBQTtBQUNqQyxJQUFNLFNBQVMsR0FBRyxPQUFPLENBQUMsU0FBUyxDQUFBOztBQUVuQyxJQUFNLE9BQU8sR0FBRyxFQUFFLENBQUE7QUFDbEIsSUFBTSxpQkFBaUIsR0FBRyxFQUFFLENBQUE7QUFDNUIsSUFBTSxXQUFXLEdBQUcsRUFBRSxDQUFBOztJQUVELFNBQVM7Ozs7Ozs7Ozs7Ozs7O0FBYWpCLFdBYlEsU0FBUyxDQWFoQixJQUFJLEVBQUUsT0FBTyxFQUFFOzBCQWJSLFNBQVM7O0FBYzFCLFdBQU8sQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLEdBQUcsSUFBSSxDQUFBOztBQUV6QixRQUFJLENBQUMsSUFBSSxHQUFXLGtCQUFLLE9BQU8sQ0FBQyxJQUFJLENBQUMsQ0FBQTtBQUN0QyxRQUFJLENBQUMsSUFBSSxHQUFXLE9BQU8sQ0FBQyxJQUFJLElBQUksa0JBQUssUUFBUSxDQUFDLElBQUksQ0FBQyxDQUFBO0FBQ3ZELFFBQUksQ0FBQyxZQUFZLEdBQUcsa0JBQUssT0FBTyxDQUFDLElBQUksQ0FBQyxDQUFBOztBQUV0QyxRQUFJLENBQUMsT0FBTyxHQUFHLE9BQU8sSUFBSSxFQUFFLENBQUE7O0FBRTVCLFFBQUksQ0FBQyxpQkFBaUIsR0FBRyxFQUFFLENBQUE7QUFDM0IsUUFBSSxDQUFDLFdBQVcsR0FBRyxFQUFFLENBQUE7O0FBRXJCLFFBQUksQ0FBQyxNQUFNLEdBQUc7QUFDWixlQUFTLEVBQUUsa0JBQUssSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLEVBQUUsTUFBTSxDQUFDO0FBQ3ZDLGlCQUFXLEVBQUUsa0JBQUssSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLEVBQUUsUUFBUSxDQUFDO0FBQzNDLGlCQUFXLEVBQUUsa0JBQUssSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLEVBQUUsUUFBUSxDQUFDO0FBQzNDLGVBQVMsRUFBRSxrQkFBSyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksRUFBRSxNQUFNLENBQUM7S0FDeEMsQ0FBQTs7QUFFRCxRQUFJLENBQUMsS0FBSyxFQUFFLENBQUE7R0FDYjs7Ozs7O2VBakNrQixTQUFTOztXQW1IakIscUJBQUMsU0FBUyxFQUFDO0FBQ3BCLGFBQU8sSUFBSSxDQUFDLFFBQVEsQ0FBQyxXQUFXLENBQUMsU0FBUyxDQUFDLENBQUE7S0FDNUM7OztXQUVlLDBCQUFDLFNBQVMsRUFBQztBQUN6QixhQUFPLElBQUksQ0FBQyxRQUFRLENBQUMsZ0JBQWdCLENBQUMsU0FBUyxDQUFDLENBQUE7S0FDakQ7Ozs7Ozs7O1dBY0ssa0JBQVk7VUFBWCxPQUFPLHlEQUFDLEVBQUU7O0FBQ2YsVUFBRyx3QkFBRSxRQUFRLENBQUMsT0FBTyxDQUFDLEVBQUM7QUFDckIsZUFBTyxHQUFHLEVBQUMsTUFBTSxFQUFFLE9BQU8sRUFBQyxDQUFBO09BQzVCOztBQUVELGFBQU8sSUFBSSxDQUFDLFVBQVUsQ0FBQyxPQUFPLENBQUMsTUFBTSxJQUFJLFVBQVUsRUFBRSxPQUFPLENBQUMsQ0FBQTtLQUM5RDs7O1dBRVMsc0JBQXlDO1VBQXhDLGNBQWMseURBQUMsVUFBVTtVQUFFLE9BQU8seURBQUcsRUFBRTs7QUFDaEQsYUFBTyx1QkFBVSxNQUFNLENBQUMsSUFBSSxFQUFFLGNBQWMsRUFBRSxPQUFPLENBQUMsQ0FBQTtLQUN2RDs7O1dBT2MsMkJBQUU7QUFDZixVQUFJLGFBQWEsR0FBRyxJQUFJLENBQUMsWUFBWSxFQUFFLENBQUMsR0FBRyxDQUFDLFVBQUEsS0FBSztlQUFJLEtBQUssQ0FBQyxjQUFjLEVBQUU7T0FBQSxDQUFDLENBQUMsSUFBSSxFQUFFLENBQUE7QUFDbkYsVUFBSSxNQUFNLEdBQUcsYUFBYSxDQUFDLGFBQWEsQ0FBQyxNQUFNLEdBQUcsQ0FBQyxDQUFDLENBQUE7QUFDcEQsYUFBTyxDQUFDLElBQUksQ0FBQyxJQUFJLEVBQUUsYUFBYSxDQUFDLE1BQU0sRUFBRSxNQUFNLENBQUMsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUE7S0FDM0Q7OztXQUVNLG1CQUFFO0FBQ1AsYUFBTyxJQUFJLENBQUMsUUFBUSxLQUFLLElBQUksQ0FBQyxlQUFlLEVBQUUsQ0FBQTtLQUNoRDs7Ozs7Ozs7V0FNSSxpQkFBRTs7O0FBQ0wsVUFBSSxDQUFDLFdBQVcsR0FBRyxFQUFFLENBQUE7O0FBRXJCLGFBQU8sQ0FBQyxTQUFTLENBQUMsQ0FBQyxPQUFPLENBQUMsT0FBTyxDQUFDLFVBQUEsUUFBUSxFQUFJO0FBQzdDLGNBQUssV0FBVyxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsV0FBVyxJQUFJLFFBQVEsQ0FBQyxVQUFVLENBQUMsQ0FBQTtBQUNsRSxnQkFBUSxPQUFNLENBQUE7T0FDZixDQUFDLENBQUE7O0FBRUYsMEJBQW9CLENBQUMsSUFBSSxDQUFDLENBQUE7QUFDMUIsMkJBQXFCLENBQUMsSUFBSSxDQUFDLENBQUE7QUFDM0IsMEJBQW9CLENBQUMsSUFBSSxDQUFDLENBQUE7S0FDM0I7Ozs7Ozs7V0FLRSxhQUFDLE1BQU0sRUFBYTtVQUFYLE9BQU8seURBQUMsRUFBRTs7QUFDcEIsb0JBQU0sR0FBRyxDQUFDLE1BQU0sQ0FBQyxDQUFBO0FBQ2pCLFVBQUksQ0FBQyxLQUFLLEVBQUUsQ0FBQTtBQUNaLGFBQU8sSUFBSSxDQUFBO0tBQ1o7Ozs7Ozs7Ozs7V0FRQyxZQUFDLFVBQVUsRUFBa0I7VUFBaEIsUUFBUSx5REFBQyxLQUFLOztBQUMzQixVQUFJLFNBQVMsR0FBRyxrQkFBSyxPQUFPLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxTQUFTLENBQUMsQ0FBQTs7QUFFbkQsVUFBRyxRQUFRLEVBQUM7QUFBRSxrQkFBVSxHQUFHLFVBQVUsQ0FBQyxPQUFPLENBQUMsU0FBUyxFQUFFLEVBQUUsQ0FBQyxDQUFBO09BQUU7O0FBRTlELFVBQUcsQ0FBQyxVQUFVLENBQUMsS0FBSyxDQUFDLFFBQVEsQ0FBQyxFQUFDO0FBQzdCLGtCQUFVLEdBQUcsVUFBVSxHQUFHLEtBQUssQ0FBQTtPQUNoQzs7QUFFRCxhQUFPLElBQUksQ0FBQyxLQUFLLENBQUMsVUFBVSxDQUFDLE9BQU8sQ0FBQyxLQUFLLEVBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQTtLQUNoRDs7O1dBRWlCLDRCQUFDLElBQUksRUFBQztBQUN0QixhQUFPLElBQUksQ0FBQyxNQUFNLENBQUMsVUFBVSxFQUFFLElBQUksQ0FBQyxDQUFBO0tBQ3JDOzs7Ozs7OztXQUtHLGdCQUFvQjs7O1VBQW5CLE9BQU8seURBQUMsU0FBUzs7QUFDcEIsVUFBSSxhQUFhLEdBQUcscUJBQUssSUFBSSxDQUFDLGtCQUFLLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxFQUFFLE9BQU8sQ0FBQyxDQUFDLENBQUE7QUFDNUQsYUFBTyxhQUFhLENBQUMsR0FBRyxDQUFDLFVBQUEsSUFBSTtlQUFJLE9BQUssRUFBRSxDQUFDLElBQUksRUFBQyxJQUFJLENBQUM7T0FBQSxDQUFDLENBQUE7S0FDckQ7Ozs7Ozs7Ozs7V0FRUyxtQkFBQyxRQUFRLEVBQUU7QUFDbkIsYUFBTyxJQUFJLENBQUMsWUFBWSxFQUFFLENBQUMsTUFBTSxDQUFDLFFBQVEsQ0FBQyxDQUFBO0tBQzVDOzs7V0FFcUIsZ0NBQUMsVUFBVSxFQUFDO0FBQ2hDLFVBQUksU0FBUyxHQUFHLFVBQVUsQ0FBQyxTQUFTLENBQUE7QUFDcEMsYUFBTyxJQUFJLENBQUMsU0FBUyxDQUFDLFVBQUEsS0FBSztlQUFJLEtBQUssQ0FBQyxTQUFTLEtBQUssU0FBUztPQUFBLENBQUMsQ0FBQTtLQUM5RDs7Ozs7Ozs7Ozs7O1dBVW1CLDZCQUFDLFFBQVEsRUFBRSxZQUFZLEVBQUU7QUFDM0MsYUFBTyxJQUFJLENBQUMsU0FBUyxDQUFDLFVBQUEsS0FBSztlQUFJLEtBQUssQ0FBQyxRQUFRLENBQUMsS0FBSyxZQUFZO09BQUEsQ0FBQyxDQUFBO0tBQ2pFOzs7Ozs7O1dBS2lCLDRCQUFDLElBQUksRUFBRTtBQUN2QixhQUFPLElBQUksQ0FBQyxtQkFBbUIsQ0FBQyxNQUFNLEVBQUUsSUFBSSxDQUFDLENBQUE7S0FDOUM7Ozs7Ozs7V0FLa0IsNkJBQUMsU0FBUyxFQUFFO0FBQzdCLGFBQU8sSUFBSSxDQUFDLG1CQUFtQixDQUFDLFdBQVcsRUFBRSxTQUFTLENBQUMsQ0FBQTtLQUN4RDs7Ozs7OztXQUtXLHdCQUFHOzs7QUFDYixhQUFPLE1BQU0sQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDLEdBQUcsQ0FBQyxVQUFBLEdBQUc7ZUFBSSxPQUFLLEtBQUssQ0FBQyxHQUFHLENBQUM7T0FBQSxDQUFDLENBQUE7S0FDM0Q7Ozs7Ozs7V0FLZSwyQkFBRztBQUNqQixhQUFPLElBQUksQ0FBQyxZQUFZLEVBQUUsQ0FBQyxHQUFHLENBQUMsVUFBQSxLQUFLO2VBQUksS0FBSyxDQUFDLFFBQVE7T0FBQSxDQUFDLENBQUE7S0FDeEQ7Ozs7Ozs7Ozs7OztXQVVNLGlCQUFDLFFBQVEsRUFBYTtVQUFYLE1BQU0seURBQUMsRUFBRTs7QUFDekIsY0FBUSxHQUFHLFFBQVEsSUFDbkIsTUFBTSxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsQ0FBQTs7QUFFckIsZ0NBQWEsSUFBSSxFQUFFLE1BQU0sQ0FBQyxDQUFDLE9BQU8sQ0FBQyxRQUFRLENBQUMsQ0FBQTtLQUM3Qzs7O1dBRWEseUJBQUc7QUFDZixhQUFPLE1BQU0sQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLGlCQUFpQixDQUFDLENBQUMsR0FBRyxDQUFDLFVBQUEsSUFBSTtlQUFJLE9BQU8sQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLFdBQVcsRUFBRSxDQUFDO09BQUEsQ0FBQyxDQUFBO0tBQzlGOzs7V0FFZ0IsNEJBQUc7QUFDbEIsYUFBTyxNQUFNLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxpQkFBaUIsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxVQUFBLElBQUk7ZUFBSSxPQUFPLENBQUMsVUFBVSxDQUFDLElBQUksQ0FBQyxXQUFXLEVBQUUsQ0FBQztPQUFBLENBQUMsQ0FBQTtLQUMvRjs7O1dBRWtCLDZCQUFDLElBQUksRUFBQztBQUN2QixhQUFPLElBQUksQ0FBQyxTQUFTLENBQUMsOEJBQWdCLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFBO0tBQ2xEOzs7V0FFUyxtQkFBQyxVQUFVLEVBQUU7QUFDckIsVUFBSSxDQUFDLGlCQUFpQixDQUFDLFVBQVUsQ0FBQyxJQUFJLENBQUMsR0FBRyxJQUFJLENBQUE7QUFDOUMsYUFBTyxVQUFVLENBQUE7S0FDbEI7OztXQUVzQixrQ0FBRztBQUN4QixhQUFPLE1BQU0sQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLGlCQUFpQixDQUFDLENBQUE7S0FDM0M7OztXQUVtQiwrQkFBRztBQUNyQixhQUFPLDhCQUFnQixNQUFNLEVBQUUsQ0FBQTtLQUNoQzs7O1dBRWtCLDRCQUFDLGdCQUFnQixFQUFFO0FBQ3BDLGFBQU8sOEJBQWdCLE1BQU0sQ0FBQyxnQkFBZ0IsQ0FBQyxDQUFBO0tBQ2hEOzs7V0FFYywwQkFBRTtBQUNmLGFBQU8sOEJBQWdCLGNBQWMsRUFBRSxDQUFBO0tBQ3hDOzs7V0FFYywwQkFBRztBQUNoQixhQUFPLDhCQUFnQixjQUFjLEVBQUUsQ0FBQTtLQUN4Qzs7O1dBRVUsdUJBQXdCOzs7VUFBdkIsZ0JBQWdCLHlEQUFDLEtBQUs7O0FBQ2hDLFVBQUksUUFBUSxHQUFHLHFCQUFLLElBQUksQ0FBQyxrQkFBSyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksRUFBRSxNQUFNLENBQUMsQ0FBQyxDQUFBO0FBQ3RELGFBQU8sZ0JBQWdCLEdBQUcsUUFBUSxHQUFHLFFBQVEsQ0FBQyxHQUFHLENBQUMsVUFBQSxDQUFDO2VBQUksQ0FBQyxDQUFDLE9BQU8sQ0FBQyxPQUFLLElBQUksR0FBRyxHQUFHLEVBQUUsRUFBRSxDQUFDO09BQUEsQ0FBQyxDQUFBO0tBQ3ZGOzs7V0FHZ0IsNkJBQUc7QUFDbEIsVUFBSSxTQUFTLEdBQUcsa0JBQUssT0FBTyxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsU0FBUyxDQUFDLENBQUE7QUFDbkQsYUFBTyxxQkFBSyxJQUFJLENBQUMsa0JBQUssSUFBSSxDQUFDLFNBQVMsRUFBQyxTQUFTLENBQUMsQ0FBQyxDQUFBO0tBQ2pEOzs7U0F4U1UsZUFBRTtBQUNYLGFBQU8sSUFBSSxDQUFDLEVBQUUsQ0FBQyxZQUFZLENBQUMsQ0FBQTtLQUM3Qjs7O1NBRVEsZUFBRTtBQUNULFVBQUcsaUJBQWlCLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxFQUFDO0FBQzlCLGVBQU8saUJBQWlCLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFBO09BQ3BDOztBQUVELGFBQU8saUJBQWlCLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxHQUFHLGtCQUFrQixDQUFDLElBQUksQ0FBQyxDQUFBO0tBQy9EOzs7Ozs7Ozs7Ozs7Ozs7OztTQXFDaUIsZUFBRTtBQUNsQixVQUFJLElBQUksR0FBRyxFQUFFLENBQUE7QUFDYixVQUFJLFFBQVEsR0FBRyxJQUFJLENBQUMsUUFBUSxDQUFBOztBQUU1QixVQUFJLHdCQUFFLE9BQU8sQ0FBQyxRQUFRLENBQUMsRUFBRTtBQUFFLGVBQU8sRUFBRSxDQUFBO09BQUU7O0FBRXRDLFVBQUcsUUFBUSxDQUFDLEtBQUssRUFBQztBQUFFLFlBQUksQ0FBQyxLQUFLLEdBQUcsUUFBUSxDQUFDLEtBQUssQ0FBQTtPQUFFOztBQUVqRCxhQUFPLElBQUksQ0FBQyxXQUFXLENBQUMsTUFBTSxDQUFDLFVBQUMsSUFBSSxFQUFDLE1BQU0sRUFBRztBQUM1QyxZQUFHLFFBQVEsQ0FBQyxNQUFNLENBQUMsRUFBQztBQUNsQixjQUFJLENBQUMsTUFBTSxDQUFDLEdBQUcsUUFBUSxDQUFDLE1BQU0sQ0FBQyxDQUFBO1NBQ2hDOztBQUVELGVBQU8sSUFBSSxDQUFBO09BQ1osRUFBRSxJQUFJLENBQUMsQ0FBQTtLQUNUOzs7Ozs7O1NBS1csZUFBRTtBQUNaLFVBQUcsZ0JBQUcsVUFBVSxDQUFDLGtCQUFLLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxFQUFFLGNBQWMsQ0FBQyxDQUFDLEVBQUM7QUFDckQsZUFBTyxJQUFJLENBQUMsS0FBSyxDQUFDLGdCQUFHLFlBQVksQ0FBQyxrQkFBSyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksRUFBRSxjQUFjLENBQUMsQ0FBQyxDQUFDLENBQUE7T0FDekU7S0FDRjs7O1NBRVcsZUFBRTtBQUNaLGFBQU8sc0JBQVMsTUFBTSxDQUFDLElBQUksQ0FBQyxDQUFBO0tBQzdCOzs7U0FVUyxlQUFFO0FBQ1YsYUFBTyxJQUFJLENBQUMsV0FBVyxDQUFDLE1BQU0sQ0FBQTtLQUMvQjs7O1NBRU8sZUFBRTtBQUNSLGFBQU8sSUFBSSxDQUFDLFdBQVcsQ0FBQyxJQUFJLENBQUE7S0FDN0I7OztTQWtCVyxlQUFFO0FBQ1osVUFBRyxXQUFXLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxFQUFDO0FBQUUsZUFBTyxXQUFXLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFBO09BQUU7QUFDM0QsYUFBTyxXQUFXLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxHQUFHLElBQUksQ0FBQyxlQUFlLEVBQUUsQ0FBQTtLQUN2RDs7O1dBN0ZVLGNBQUMsUUFBUSxFQUFjO1VBQVosT0FBTyx5REFBQyxFQUFFOztBQUM5QixhQUFPLElBQUksU0FBUyxDQUFDLFFBQVEsRUFBQyxPQUFPLENBQUMsQ0FBQTtLQUN2Qzs7Ozs7Ozs7Ozs7V0FTaUIsdUJBQWM7VUFBYixTQUFTLHlEQUFDLEVBQUU7O0FBQzdCLFVBQUksWUFBWSxHQUFHLE1BQU0sQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLENBQUMsSUFBSSxDQUFDLFVBQUEsQ0FBQztlQUFJLFNBQVMsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDO09BQUEsQ0FBQyxDQUFBO0FBQ3JFLGFBQU8sT0FBTyxDQUFDLFlBQVksQ0FBQyxDQUFBO0tBQzdCOzs7Ozs7O1dBS2UscUJBQUU7QUFDaEIsYUFBTyxNQUFNLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxDQUFDLEdBQUcsQ0FBQyxVQUFBLElBQUk7ZUFBSSxPQUFPLENBQUMsSUFBSSxDQUFDO09BQUEsQ0FBQyxDQUFBO0tBQ3ZEOzs7U0E5RWtCLFNBQVM7OztxQkFBVCxTQUFTOztBQWtWOUIsU0FBUyxrQkFBa0IsQ0FBQyxTQUFTLEVBQUU7QUFDckMsTUFBSSxLQUFLLEdBQUcsU0FBUyxDQUFDLGlCQUFpQixFQUFFLENBQUE7QUFDekMsTUFBSSxLQUFLLEdBQUcsRUFBRSxDQUFBOztBQUVkLE9BQUssQ0FBQyxPQUFPLENBQUMsVUFBQyxJQUFJLEVBQUc7QUFDcEIsUUFBSSxVQUFVLEdBQUcsSUFBSSxDQUFDLE9BQU8sQ0FBQyxTQUFTLENBQUMsTUFBTSxDQUFDLFNBQVMsR0FBRyxHQUFHLEVBQUUsRUFBRSxDQUFDLENBQUE7QUFDbkUsUUFBSSxFQUFFLEdBQUcsVUFBVSxDQUFDLE9BQU8sQ0FBQyxLQUFLLEVBQUMsRUFBRSxDQUFDLENBQUE7QUFDckMsUUFBSSxRQUFRLEdBQUcsMEJBQWEsSUFBSSxFQUFFLEVBQUMsRUFBRSxFQUFFLEVBQUUsRUFBQyxDQUFDLENBQUE7QUFDM0MsUUFBSSxLQUFLLEdBQUcsUUFBUSxDQUFDLE9BQU8sQ0FBQyxFQUFDLEVBQUUsRUFBRSxFQUFFLEVBQUMsQ0FBQyxDQUFBOztBQUV0QyxZQUFRLENBQUMsRUFBRSxHQUFHLFVBQVUsQ0FBQTtBQUN4QixZQUFRLENBQUMsYUFBYSxHQUFHLE9BQU8sR0FBRyxVQUFVLENBQUE7QUFDN0MsU0FBSyxDQUFDLEVBQUUsR0FBRyxFQUFFLENBQUE7QUFDYixTQUFLLENBQUMsU0FBUyxHQUFHLFlBQUk7QUFBRSxhQUFPLFNBQVMsQ0FBQTtLQUFFLENBQUE7QUFDMUMsU0FBSyxDQUFDLFVBQVUsQ0FBQyxHQUFHLEtBQUssQ0FBQTtHQUMxQixDQUFDLENBQUE7O0FBRUYsU0FBTyxLQUFLLENBQUE7Q0FDYjs7QUFFRCxTQUFTLG9CQUFvQixDQUFDLFNBQVMsRUFBQztBQUN0QyxnQ0FBZ0IsdUJBQXVCLENBQUMsU0FBUyxDQUFDLE1BQU0sQ0FBQyxXQUFXLENBQUMsQ0FBQTtBQUNyRSxnQ0FBZ0IsdUJBQXVCLENBQUMsU0FBUyxHQUFHLFNBQVMsQ0FBQyxDQUFBOztBQUU5RCxnQ0FBZ0IsTUFBTSxFQUFFLENBQUMsT0FBTyxDQUFDLFVBQVMsVUFBVSxFQUFDO0FBQ25ELGFBQVMsQ0FBQyxTQUFTLENBQUMsVUFBVSxDQUFDLENBQUE7QUFDL0Isb0JBQWdCLENBQUMsU0FBUyxFQUFFLFVBQVUsQ0FBQyxDQUFBO0dBQ3hDLENBQUMsQ0FBQTs7QUFFRixnQ0FBZ0IsUUFBUSxFQUFFLENBQUE7Q0FDM0I7O0FBRUQsU0FBUyxnQkFBZ0IsQ0FBQyxTQUFTLEVBQUUsZUFBZSxFQUFDO01BQzlDLFNBQVMsR0FBZ0IsZUFBZSxDQUF4QyxTQUFTO01BQUUsVUFBVSxHQUFJLGVBQWUsQ0FBN0IsVUFBVTs7QUFFMUIsTUFBSTtBQUNGLFVBQU0sQ0FBQyxjQUFjLENBQUMsU0FBUyxFQUFFLFNBQVMsRUFBRTtBQUMxQyxTQUFHLEVBQUUsZUFBVTtBQUNiLFlBQUcsU0FBUyxDQUFDLFdBQVcsQ0FBQyxTQUFTLENBQUMsRUFBQztBQUNsQyxpQkFBTyxTQUFTLENBQUMsV0FBVyxDQUFDLFNBQVMsQ0FBQyxDQUFBO1NBQ3hDOztBQUVELGVBQU8sU0FBUyxDQUFDLFdBQVcsQ0FBQyxTQUFTLENBQUMsR0FBRyw2QkFBVyxZQUFVO0FBQzdELGlCQUFPLFNBQVMsQ0FBQyxrQkFBa0IsQ0FBQyxVQUFVLENBQUMsQ0FBQTtTQUNoRCxFQUFFLGVBQWUsQ0FBQyxDQUFBO09BQ3BCO0tBQ0YsQ0FBQyxDQUFBO0dBRUgsQ0FBQyxPQUFNLENBQUMsRUFBQyxFQUVUO0NBQ0Y7O0FBRUQsU0FBUyxxQkFBcUIsQ0FBQyxTQUFTLEVBQUM7QUFDdkMsUUFBTSxDQUFDLGNBQWMsQ0FBQyxTQUFTLENBQUMsV0FBVyxFQUFFLFFBQVEsRUFBRTtBQUNyRCxnQkFBWSxFQUFFLElBQUk7QUFDbEIsT0FBRyxFQUFFLGVBQVU7QUFDYixhQUFPLFNBQVMsQ0FBQyxXQUFXLENBQUMsTUFBTSxBQUFDLENBQUE7QUFDcEMsYUFBTyxTQUFTLENBQUMsV0FBVyxDQUFDLE1BQU0sR0FBRyxtQkFBTSxJQUFJLENBQUMsU0FBUyxFQUFFLFNBQVMsQ0FBQyxNQUFNLENBQUMsTUFBTSxJQUFJLEVBQUUsQ0FBQyxDQUFBO0tBQzNGO0dBQ0YsQ0FBQyxDQUFBO0NBQ0g7O0FBRUQsU0FBUyxvQkFBb0IsQ0FBQyxTQUFTLEVBQUM7QUFDdEMsUUFBTSxDQUFDLGNBQWMsQ0FBQyxTQUFTLENBQUMsV0FBVyxFQUFFLE1BQU0sRUFBRTtBQUNuRCxnQkFBWSxFQUFFLElBQUk7QUFDbEIsT0FBRyxFQUFFLGVBQVU7QUFDYixhQUFPLFNBQVMsQ0FBQyxXQUFXLENBQUMsSUFBSSxBQUFDLENBQUE7QUFDbEMsYUFBTyxTQUFTLENBQUMsV0FBVyxDQUFDLElBQUksR0FBRyx5QkFBVyxJQUFJLENBQUMsU0FBUyxFQUFFLFNBQVMsQ0FBQyxNQUFNLENBQUMsSUFBSSxJQUFJLEVBQUUsQ0FBQyxDQUFBO0tBQzVGO0dBQ0YsQ0FBQyxDQUFBO0NBQ0giLCJmaWxlIjoiYnJpZWZjYXNlLmpzIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IGZzIGZyb20gJ2ZzJ1xuaW1wb3J0IGdsb2IgZnJvbSAnZ2xvYi1hbGwnXG5pbXBvcnQgcGF0aCBmcm9tICdwYXRoJ1xuaW1wb3J0IGluZmxlY3Rpb25zIGZyb20gJ2knXG5pbXBvcnQgXyBmcm9tICd1bmRlcnNjb3JlJ1xuXG5pbXBvcnQgYnJpZWYgZnJvbSAnLi4nXG5pbXBvcnQgQXNzZXQgZnJvbSAnLi9hc3NldCdcbmltcG9ydCBEYXRhU291cmNlIGZyb20gJy4vZGF0YV9zb3VyY2UnXG5pbXBvcnQgRG9jdW1lbnQgZnJvbSAnLi9kb2N1bWVudCdcbmltcG9ydCBNb2RlbCBmcm9tICcuL21vZGVsJ1xuaW1wb3J0IE1vZGVsRGVmaW5pdGlvbiBmcm9tICcuL21vZGVsX2RlZmluaXRpb24nXG5pbXBvcnQgUGFja2FnZXIgZnJvbSAnLi9wYWNrYWdlcidcbmltcG9ydCBSZXNvbHZlciBmcm9tICcuL1Jlc29sdmVyJ1xuXG5pbXBvcnQgY29sbGVjdGlvbiBmcm9tICcuL2NvbGxlY3Rpb24nXG5pbXBvcnQgZXhwb3J0ZXJzIGZyb20gJy4vZXhwb3J0ZXJzJ1xuXG5jb25zdCBpbmZsZWN0ID0gaW5mbGVjdGlvbnModHJ1ZSlcbmNvbnN0IHBsdXJhbGl6ZSA9IGluZmxlY3QucGx1cmFsaXplXG5cbmNvbnN0IF9fY2FjaGUgPSB7fVxuY29uc3QgX19kb2N1bWVudEluZGV4ZXMgPSB7fVxuY29uc3QgX19jYWNoZUtleXMgPSB7fVxuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBCcmllZmNhc2Uge1xuICAvKipcbiAgKiBDcmVhdGUgYSBuZXcgQnJpZWZjYXNlIG9iamVjdCBhdCB0aGUgc3BlY2lmaWVkIHJvb3QgcGF0aC5cbiAgKlxuICAqIEBwYXJhbSB7cGF0aH0gcm9vdCAtIHRoZSByb290IHBhdGggb2YgdGhlIGJyaWVmY2FzZS4gZXhwZWN0c1xuICAqICAgdG8gZmluZCBhIGNvbmZpZyBmaWxlIFwiYnJpZWYuY29uZmlnLmpzXCIsIGFuZCBhdCBsZWFzdCBhIFxuICAqICAgZG9jdW1lbnRzIGZvbGRlci5cbiAgKlxuICAqIEBwYXJhbSB7b3B0aW9uc30gb3B0aW9ucyAtIG9wdGlvbnMgdG8gb3ZlcnJpZGUgZGVmYXVsdCBiZWhhdmlvci5cbiAgKiBAcGFyYW0ge3BhdGh9IGRvY3NfcGF0aCAtIHdoaWNoIGZvbGRlciBjb250YWlucyB0aGUgZG9jdW1lbnRzLlxuICAqIEBwYXJhbSB7cGF0aH0gbW9kZWxzX3BhdGggLSB3aGljaCBmb2xkZXIgY29udGFpbnMgdGhlIG1vZGVscyB0byB1c2UuXG4gICogQHBhcmFtIHtwYXRofSBhc3NldHNfcGF0aCAtIHdoaWNoIGZvbGRlciBjb250YWlucyB0aGUgYXNzZXRzIHRvIHVzZSBpZiBhbnkuXG4gICovXG4gIGNvbnN0cnVjdG9yKHJvb3QsIG9wdGlvbnMpIHtcbiAgICBfX2NhY2hlW3RoaXMucm9vdF0gPSB0aGlzXG5cbiAgICB0aGlzLnJvb3QgICAgICAgICA9IHBhdGgucmVzb2x2ZShyb290KVxuICAgIHRoaXMubmFtZSAgICAgICAgID0gb3B0aW9ucy5uYW1lIHx8IHBhdGguYmFzZW5hbWUocm9vdClcbiAgICB0aGlzLnBhcmVudEZvbGRlciA9IHBhdGguZGlybmFtZShyb290KVxuXG4gICAgdGhpcy5vcHRpb25zID0gb3B0aW9ucyB8fCB7fVxuXG4gICAgdGhpcy5tb2RlbF9kZWZpbml0aW9ucyA9IHt9XG4gICAgdGhpcy5jb2xsZWN0aW9ucyA9IHt9XG4gICAgXG4gICAgdGhpcy5jb25maWcgPSB7XG4gICAgICBkb2NzX3BhdGg6IHBhdGguam9pbih0aGlzLnJvb3QsICdkb2NzJyksXG4gICAgICBtb2RlbHNfcGF0aDogcGF0aC5qb2luKHRoaXMucm9vdCwgJ21vZGVscycpLFxuICAgICAgYXNzZXRzX3BhdGg6IHBhdGguam9pbih0aGlzLnJvb3QsICdhc3NldHMnKSxcbiAgICAgIGRhdGFfcGF0aDogcGF0aC5qb2luKHRoaXMucm9vdCwgJ2RhdGEnKVxuICAgIH1cbiAgICBcbiAgICB0aGlzLnNldHVwKClcbiAgfVxuICBcbiAgLyoqIFxuICAqIFJldHVybiB0aGUgb3V0bGluZSBmb3IgdGhpcyBicmllZmNhc2UgaWYgaXQgZXhpc3RzLlxuICAqL1xuICBnZXQgb3V0bGluZSgpe1xuICAgIHJldHVybiB0aGlzLmF0KCdvdXRsaW5lLm1kJylcbiAgfVxuXG4gIGdldCBpbmRleCgpe1xuICAgIGlmKF9fZG9jdW1lbnRJbmRleGVzW3RoaXMucm9vdF0pe1xuICAgICAgcmV0dXJuIF9fZG9jdW1lbnRJbmRleGVzW3RoaXMucm9vdF1cbiAgICB9XG4gICAgXG4gICAgcmV0dXJuIF9fZG9jdW1lbnRJbmRleGVzW3RoaXMucm9vdF0gPSBidWlsZEluZGV4RnJvbURpc2sodGhpcylcbiAgfVxuXG4gIC8qKlxuICAqIExvYWQgYSBicmllZmNhc2UgYnkgcGFzc2luZyBhIHBhdGggdG8gYSByb290IGZvbGRlci5cbiAgKlxuICAqIEBwYXJhbSB7c3RyaW5nfSByb290UGF0aCAtIHRoZSByb290IHBhdGggb2YgdGhlIGJyaWVmY2FzZS5cbiAgKiBAcmV0dXJuIHtCcmllZmNhc2V9IC0gcmV0dXJucyBhIGJyaWVmY2FzZVxuICAqXG4gICovXG4gIHN0YXRpYyBsb2FkKHJvb3RQYXRoLCBvcHRpb25zPXt9KSB7XG4gICAgcmV0dXJuIG5ldyBCcmllZmNhc2Uocm9vdFBhdGgsb3B0aW9ucylcbiAgfVxuIFxuICAvKipcbiAgKiBGaW5kIHRoZSBCcmllZmNhc2UgaW5zdGFuY2UgcmVzcG9uc2libGUgZm9yIGEgcGFydGljdWxhciBwYXRoLlxuICAqIE1vZGVscyBhbmQgRG9jdW1lbnRzIHdpbGwgdXNlIHRoaXMgdG8gZmluZCB0aGUgQnJpZWZjYXNlIHRoZXlcbiAgKiBiZWxvbmcgdG8gXG4gICpcbiAgKiBAcGFyYW0ge3BhdGh9IHBhdGggLSB0aGUgcGF0aCBvZiB0aGUgZG9jdW1lbnQgd2hpY2ggd2FudHMgdG8ga25vd1xuICAqL1xuICBzdGF0aWMgZmluZEZvclBhdGgoY2hlY2tQYXRoPVwiXCIpe1xuICAgIGxldCBtYXRjaGluZ1BhdGggPSBPYmplY3Qua2V5cyhfX2NhY2hlKS5maW5kKHAgPT4gY2hlY2tQYXRoLm1hdGNoKHApKVxuICAgIHJldHVybiBfX2NhY2hlW21hdGNoaW5nUGF0aF1cbiAgfVxuICBcbiAgLyoqXG4gICogUmV0dXJuIGFsbCBpbnN0YW5jZXMgb2YgYSBCcmllZmNhc2UgdGhhdCB3ZSBhcmUgYXdhcmUgb2YgZnJvbSB0aGUgY2FjaGVcbiAgKi9cbiAgc3RhdGljIGluc3RhbmNlcygpe1xuICAgIHJldHVybiBPYmplY3Qua2V5cyhfX2NhY2hlKS5tYXAocGF0aCA9PiBfX2NhY2hlW3BhdGhdKVxuICB9XG4gIFxuICAvKipcbiAgKiBHZXRzIGFueSBjb25maWcgdmFsdWVzIHRoYXQgaGF2ZSBiZWVuIHN1cHBsaWVkIHZpYSB0aGUgYHBhY2thZ2UuanNvbmBcbiAgKiBpbiB0aGlzIEJyaWVmY2FzZSByb290LiAgTG9va3MgZm9yIGEga2V5IGNhbGxlZCBgYnJpZWZgLCBhcyB3ZWxsIGFzIGFueVxuICAqIG9mIHRoZSBwbHVnaW5zIHRoYXQgaGF2ZSBiZWVuIGxvYWRlZC5cbiAgKi9cbiAgZ2V0IG1hbmlmZXN0Q29uZmlnKCl7XG4gICAgbGV0IGJhc2UgPSB7fVxuICAgIGxldCBtYW5pZmVzdCA9IHRoaXMubWFuaWZlc3QgXG5cbiAgICBpZiAoXy5pc0VtcHR5KG1hbmlmZXN0KSkgeyByZXR1cm4ge30gfVxuXG4gICAgaWYobWFuaWZlc3QuYnJpZWYpeyBiYXNlLmJyaWVmID0gbWFuaWZlc3QuYnJpZWYgfVxuXG4gICAgcmV0dXJuIHRoaXMucGx1Z2luTmFtZXMucmVkdWNlKChtZW1vLHBsdWdpbik9PntcbiAgICAgIGlmKG1hbmlmZXN0W3BsdWdpbl0pe1xuICAgICAgICBtZW1vW3BsdWdpbl0gPSBtYW5pZmVzdFtwbHVnaW5dXG4gICAgICB9XG5cbiAgICAgIHJldHVybiBtZW1vXG4gICAgfSwgYmFzZSlcbiAgfVxuICBcbiAgLyoqXG4gICogR2V0cyBhIHNlcmlhbGl6ZWQgdmVyc2lvbiBvZiB0aGUgYHBhY2thZ2UuanNvbmAgdGhhdCBleGlzdHMgaW4gdGhpcyBCcmllZmNhc2Ugcm9vdCBmb2xkZXIuXG4gICovXG4gIGdldCBtYW5pZmVzdCgpe1xuICAgIGlmKGZzLmV4aXN0c1N5bmMocGF0aC5qb2luKHRoaXMucm9vdCwgJ3BhY2thZ2UuanNvbicpKSl7XG4gICAgICByZXR1cm4gSlNPTi5wYXJzZShmcy5yZWFkRmlsZVN5bmMocGF0aC5qb2luKHRoaXMucm9vdCwgJ3BhY2thZ2UuanNvbicpKSlcbiAgICB9XG4gIH1cbiAgXG4gIGdldCByZXNvbHZlcigpe1xuICAgIHJldHVybiBSZXNvbHZlci5jcmVhdGUodGhpcylcbiAgfVxuXG4gIHJlc29sdmVMaW5rKHBhdGhBbGlhcyl7XG4gICAgcmV0dXJuIHRoaXMucmVzb2x2ZXIucmVzb2x2ZUxpbmsocGF0aEFsaWFzKVxuICB9XG5cbiAgcmVzb2x2ZUFzc2V0UGF0aChwYXRoQWxpYXMpe1xuICAgIHJldHVybiB0aGlzLnJlc29sdmVyLnJlc29sdmVBc3NldFBhdGgocGF0aEFsaWFzKVxuICB9XG5cbiAgZ2V0IGFzc2V0cygpe1xuICAgIHJldHVybiB0aGlzLmNvbGxlY3Rpb25zLmFzc2V0c1xuICB9XG5cbiAgZ2V0IGRhdGEoKXtcbiAgICByZXR1cm4gdGhpcy5jb2xsZWN0aW9ucy5kYXRhXG4gIH1cblxuICAvKipcbiAgKiBUdXJuIGFsbCBvZiB0aGUgZG9jdW1lbnRzLCBtb2RlbHMsIGRhdGEsIGFzc2V0cywgYW5kIG90aGVyIG1ldGFkYXRhIGFib3V0IHRoaXMgYnJpZWZjYXNlXG4gICogaW50byBhIHNpbmdsZSBKU09OIHN0cnVjdHVyZS4gQWxpYXMgZm9yIHRoZSBgZXhwb3J0V2l0aGAgbWV0aG9kLlxuICAqL1xuICB0b0pTT04ob3B0aW9ucz17fSl7XG4gICAgaWYoXy5pc1N0cmluZyhvcHRpb25zKSl7XG4gICAgICBvcHRpb25zID0ge2Zvcm1hdDogb3B0aW9uc31cbiAgICB9XG5cbiAgICByZXR1cm4gdGhpcy5leHBvcnRXaXRoKG9wdGlvbnMuZm9ybWF0IHx8IFwic3RhbmRhcmRcIiwgb3B0aW9ucylcbiAgfVxuXG4gIGV4cG9ydFdpdGgoZXhwb3J0ZXJGb3JtYXQ9XCJzdGFuZGFyZFwiLCBvcHRpb25zID0ge30pe1xuICAgIHJldHVybiBleHBvcnRlcnMuY2FjaGVkKHRoaXMsIGV4cG9ydGVyRm9ybWF0LCBvcHRpb25zKVxuICB9XG4gIFxuICBnZXQgY2FjaGVLZXkoKXtcbiAgICBpZihfX2NhY2hlS2V5c1t0aGlzLnJvb3RdKXsgcmV0dXJuIF9fY2FjaGVLZXlzW3RoaXMucm9vdF0gfVxuICAgIHJldHVybiBfX2NhY2hlS2V5c1t0aGlzLnJvb3RdID0gdGhpcy5jb21wdXRlQ2FjaGVLZXkoKVxuICB9XG5cbiAgY29tcHV0ZUNhY2hlS2V5KCl7XG4gICAgbGV0IG1vZGlmaWVkVGltZXMgPSB0aGlzLmdldEFsbE1vZGVscygpLm1hcChtb2RlbCA9PiBtb2RlbC5sYXN0TW9kaWZpZWRBdCgpKS5zb3J0KClcbiAgICBsZXQgbGF0ZXN0ID0gbW9kaWZpZWRUaW1lc1ttb2RpZmllZFRpbWVzLmxlbmd0aCAtIDFdXG4gICAgcmV0dXJuIFt0aGlzLm5hbWUsIG1vZGlmaWVkVGltZXMubGVuZ3RoLCBsYXRlc3RdLmpvaW4oJzonKVxuICB9XG4gIFxuICBpc1N0YWxlKCl7XG4gICAgcmV0dXJuIHRoaXMuY2FjaGVLZXkgIT09IHRoaXMuY29tcHV0ZUNhY2hlS2V5KClcbiAgfVxuICBcbiAgLyoqXG4gICogc2V0dXAgdGhpcyBicmllZmNhc2UgaW52b2x2ZXMgbG9hZGluZyB0aGUgbW9kZWwgZGVmaW5pdGlvbnNcbiAgKiBhbmQgY3JlYXRpbmcgcmVwb3NpdG9yaWVzIGZvciBhbnkgYXNzZXRzIG9yIGRhdGEgc291cmNlc1xuICAqLyBcbiAgc2V0dXAoKXtcbiAgICB0aGlzLnBsdWdpbk5hbWVzID0gW11cblxuICAgIHJlcXVpcmUoJy4vaW5kZXgnKS5wbHVnaW5zLmZvckVhY2gobW9kaWZpZXIgPT4ge1xuICAgICAgdGhpcy5wbHVnaW5OYW1lcy5wdXNoKG1vZGlmaWVyLnBsdWdpbl9uYW1lIHx8IG1vZGlmaWVyLnBsdWdpbk5hbWUpXG4gICAgICBtb2RpZmllcih0aGlzKVxuICAgIH0pXG4gICAgXG4gICAgbG9hZE1vZGVsRGVmaW5pdGlvbnModGhpcylcbiAgICBjcmVhdGVBc3NldFJlcG9zaXRvcnkodGhpcykgXG4gICAgY3JlYXRlRGF0YVJlcG9zaXRvcnkodGhpcykgXG4gIH1cbiAgXG4gIC8qKlxuICAqIHVzZSBhIHBsdWdpbiB0byBsb2FkIG1vZHVsZXMsIGFjdGlvbnMsIENMSSBoZWxwZXJzLCBldGNcbiAgKi9cbiAgdXNlKHBsdWdpbiwgb3B0aW9ucz17fSl7XG4gICAgYnJpZWYudXNlKHBsdWdpbilcbiAgICB0aGlzLnNldHVwKClcbiAgICByZXR1cm4gdGhpc1xuICB9XG5cbiAgLyoqXG4gICAqIGdldCBtb2RlbCBhdCB0aGUgZ2l2ZW4gcmVsYXRpdmUgcGF0aCBcbiAgICogXG4gICAqIEBleGFtcGxlXG4gICAqICBicmllZmNhc2UuYXQoJ2VwaWNzL21vZGVsLWRlZmluaXRpb24tZHNsJylcbiAgKi9cbiAgYXQocGF0aF9hbGlhcywgYWJzb2x1dGU9ZmFsc2UpIHtcbiAgICBsZXQgZG9jc19wYXRoID0gcGF0aC5yZXNvbHZlKHRoaXMuY29uZmlnLmRvY3NfcGF0aClcblxuICAgIGlmKGFic29sdXRlKXsgcGF0aF9hbGlhcyA9IHBhdGhfYWxpYXMucmVwbGFjZShkb2NzX3BhdGgsICcnKSB9XG5cbiAgICBpZighcGF0aF9hbGlhcy5tYXRjaCgvXFwubWQkL2kpKXtcbiAgICAgIHBhdGhfYWxpYXMgPSBwYXRoX2FsaWFzICsgJy5tZCcgXG4gICAgfVxuXG4gICAgcmV0dXJuIHRoaXMuaW5kZXhbcGF0aF9hbGlhcy5yZXBsYWNlKC9eXFwvLywnJyldXG4gIH1cblxuICBmaW5kRG9jdW1lbnRCeVBhdGgocGF0aCl7XG4gICAgcmV0dXJuIHRoaXMuYXRQYXRoKHBhdGhfYWxpYXMsIHRydWUpXG4gIH1cbiAgLyoqXG4gICogZ2V0IG1vZGVscyBhdCBlYWNoIG9mIHRoZSBwYXRocyByZXByZXNlbnRlZFxuICAqIGJ5IHRoZSBnbG9iIHBhdHRlcm4gcGFzc2VkIGhlcmUuXG4gICovXG4gIGdsb2IocGF0dGVybj1cIioqLyoubWRcIikge1xuICAgIGxldCBtYXRjaGluZ0ZpbGVzID0gZ2xvYi5zeW5jKHBhdGguam9pbih0aGlzLnJvb3QsIHBhdHRlcm4pKVxuICAgIHJldHVybiBtYXRjaGluZ0ZpbGVzLm1hcChwYXRoID0+IHRoaXMuYXQocGF0aCx0cnVlKSkgXG4gIH1cblxuICAvKipcbiAgICogZmlsdGVycyBhbGwgYXZhaWxhYmxlIG1vZGVscyBieSB0aGUgZ2l2ZW4gaXRlcmF0b3JcbiAgICpcbiAgICogQGV4YW1wbGVcbiAgICogIGJyaWVmY2FzZS5maWx0ZXJBbGwobW9kZWwgPT4gbW9kZWwuc3RhdHVzID09PSAnYWN0aXZlJylcbiAgKi9cbiAgZmlsdGVyQWxsIChpdGVyYXRvcikge1xuICAgIHJldHVybiB0aGlzLmdldEFsbE1vZGVscygpLmZpbHRlcihpdGVyYXRvcilcbiAgfVxuICBcbiAgZmluZE1vZGVsc0J5RGVmaW5pdGlvbihkZWZpbml0aW9uKXtcbiAgICBsZXQgZ3JvdXBOYW1lID0gZGVmaW5pdGlvbi5ncm91cE5hbWVcbiAgICByZXR1cm4gdGhpcy5maWx0ZXJBbGwobW9kZWwgPT4gbW9kZWwuZ3JvdXBOYW1lID09PSBncm91cE5hbWUpXG4gIH1cbiAgIFxuICAvKipcbiAgICogZmlsdGVycyBtb2RlbHMgYnkgdGhlIHByb3BlcnR5IGFuZCBkZXNpcmVkIHZhbHVlXG4gICAqIFxuICAgKiBAcGFyYW0ge3N0cmluZ30gcHJvcGVydHkgLSBuYW1lIG9mIHRoZSBwcm9wZXJ0eSB0byBmaWx0ZXIgb24gXG4gICAqIEBwYXJhbSB7YW55fSBkZXNpcmVkVmFsdWUgLSB0aGUgdmFsdWUgdG8gbWF0Y2ggYWdhaW5zdFxuICAgKlxuICAgKiBAcmV0dXJuIHthcnJheX0gLSBtb2RlbHMgd2hvc2UgcHJvcGVydHkgbWF0Y2hlcyBkZXNpcmVkVmFsdWUgXG4gICovXG4gIGZpbHRlckFsbEJ5UHJvcGVydHkgKHByb3BlcnR5LCBkZXNpcmVkVmFsdWUpIHtcbiAgICByZXR1cm4gdGhpcy5maWx0ZXJBbGwobW9kZWwgPT4gbW9kZWxbcHJvcGVydHldID09PSBkZXNpcmVkVmFsdWUpXG4gIH1cbiAgXG4gIC8qKlxuICAgKiBzZWxlY3RzIGFsbCB0aGUgbW9kZWxzIHdob3NlIHR5cGUgbWF0Y2hlcyB0aGUgc3VwcGxpZWQgYXJnIFxuICAqL1xuICBzZWxlY3RNb2RlbHNCeVR5cGUodHlwZSkge1xuICAgIHJldHVybiB0aGlzLmZpbHRlckFsbEJ5UHJvcGVydHkoJ3R5cGUnLCB0eXBlKVxuICB9XG5cbiAgLyoqXG4gICAqIHNlbGVjdHMgYWxsIHRoZSBtb2RlbHMgd2hvc2UgZ3JvdXBOYW1lIG1hdGNoZXMgdGhlIHN1cHBsaWVkIGFyZyBcbiAgKi9cbiAgc2VsZWN0TW9kZWxzQnlHcm91cChncm91cE5hbWUpIHtcbiAgICByZXR1cm4gdGhpcy5maWx0ZXJBbGxCeVByb3BlcnR5KCdncm91cE5hbWUnLCBncm91cE5hbWUpXG4gIH1cbiAgXG4gIC8qKlxuICAgKiByZXR1cm5zIGFsbCB0aGUgbW9kZWxzIGluIHRoaXMgYnJpZWZjYXNlXG4gICovXG4gIGdldEFsbE1vZGVscygpIHtcbiAgICByZXR1cm4gT2JqZWN0LmtleXModGhpcy5pbmRleCkubWFwKGtleSA9PiB0aGlzLmluZGV4W2tleV0pXG4gIH1cbiAgXG4gIC8qKlxuICAgKiByZXR1cm5zIHRoZSByYXcgZG9jdW1lbnRzIGluIHRoaXMgYnJpZWZjYXNlXG4gICovXG4gIGdldEFsbERvY3VtZW50cyAoKSB7XG4gICAgcmV0dXJuIHRoaXMuZ2V0QWxsTW9kZWxzKCkubWFwKG1vZGVsID0+IG1vZGVsLmRvY3VtZW50KVxuICB9XG4gIFxuICAvKipcbiAgKiBBcmNoaXZlcyB0aGUgYnJpZWZjYXNlIGludG8gYSB6aXAgZmlsZS4gQnJpZWZjYXNlc1xuICAqIGNhbiBiZSBjcmVhdGVkIGRpcmVjdGx5IGZyb20gemlwIGZpbGVzIGluIHRoZSBmdXR1cmUuXG4gICpcbiAgKiBAcGFyYW0ge3N0cmluZ30gbG9jYXRpb24gLSB3aGVyZSB0byBzdG9yZSB0aGUgZmlsZT9cbiAgKiBAcGFyYW0ge2FycmF5fSBpZ25vcmUgLSBhIGxpc3Qgb2YgZmlsZXMgdG8gaWdub3JlIGFuZCBub3QgcHV0IGluIHRoZVxuICAqICAgYXJjaGl2ZVxuICAqL1xuICBhcmNoaXZlKGxvY2F0aW9uLCBpZ25vcmU9W10pIHtcbiAgICBsb2NhdGlvbiA9IGxvY2F0aW9uIHx8IFxuICAgIGlnbm9yZS5wdXNoKGxvY2F0aW9uKVxuXG4gICAgbmV3IFBhY2thZ2VyKHRoaXMsIGlnbm9yZSkucGVyc2lzdChsb2NhdGlvbilcbiAgfVxuICBcbiAgZ2V0R3JvdXBOYW1lcyAoKSB7XG4gICAgcmV0dXJuIE9iamVjdC5rZXlzKHRoaXMubW9kZWxfZGVmaW5pdGlvbnMpLm1hcChuYW1lID0+IGluZmxlY3QucGx1cmFsaXplKG5hbWUudG9Mb3dlckNhc2UoKSkpXG4gIH1cblxuICBnZXREb2N1bWVudFR5cGVzICgpIHtcbiAgICByZXR1cm4gT2JqZWN0LmtleXModGhpcy5tb2RlbF9kZWZpbml0aW9ucykubWFwKG5hbWUgPT4gaW5mbGVjdC51bmRlcnNjb3JlKG5hbWUudG9Mb3dlckNhc2UoKSkpXG4gIH1cbiAgXG4gIGxvYWRNb2RlbERlZmluaXRpb24ocGF0aCl7XG4gICAgcmV0dXJuIHRoaXMubG9hZE1vZGVsKE1vZGVsRGVmaW5pdGlvbi5sb2FkKHBhdGgpKVxuICB9XG5cbiAgbG9hZE1vZGVsIChkZWZpbml0aW9uKSB7XG4gICAgdGhpcy5tb2RlbF9kZWZpbml0aW9uc1tkZWZpbml0aW9uLm5hbWVdID0gdHJ1ZSBcbiAgICByZXR1cm4gZGVmaW5pdGlvblxuICB9XG5cbiAgbG9hZGVkTW9kZWxEZWZpbml0aW9ucyAoKSB7XG4gICAgcmV0dXJuIE9iamVjdC5rZXlzKHRoaXMubW9kZWxfZGVmaW5pdGlvbnMpXG4gIH1cblxuICBnZXRNb2RlbERlZmluaXRpb25zICgpIHsgXG4gICAgcmV0dXJuIE1vZGVsRGVmaW5pdGlvbi5nZXRBbGwoKVxuICB9XG5cbiAgZ2V0TW9kZWxEZWZpbml0aW9uIChtb2RlbE5hbWVPckFsaWFzKSB7XG4gICAgcmV0dXJuIE1vZGVsRGVmaW5pdGlvbi5sb29rdXAobW9kZWxOYW1lT3JBbGlhcylcbiAgfVxuXG4gIGdldFR5cGVBbGlhc2VzICgpe1xuICAgIHJldHVybiBNb2RlbERlZmluaXRpb24uZ2V0VHlwZUFsaWFzZXMoKVxuICB9XG5cbiAgZ2V0TW9kZWxTY2hlbWEgKCkge1xuICAgIHJldHVybiBNb2RlbERlZmluaXRpb24uZ2V0TW9kZWxTY2hlbWEoKVxuICB9XG5cbiAgZ2V0QWxsRmlsZXModXNlQWJzb2x1dGVQYXRocz1mYWxzZSl7XG4gICAgbGV0IGFsbEZpbGVzID0gZ2xvYi5zeW5jKHBhdGguam9pbih0aGlzLnJvb3QsICcqKi8qJykpXG4gICAgcmV0dXJuIHVzZUFic29sdXRlUGF0aHMgPyBhbGxGaWxlcyA6IGFsbEZpbGVzLm1hcChmID0+IGYucmVwbGFjZSh0aGlzLnJvb3QgKyAnLycsICcnKSlcbiAgfVxuIFxuIFxuICBfZ2V0RG9jdW1lbnRQYXRocygpIHtcbiAgICBsZXQgZG9jc19wYXRoID0gcGF0aC5yZXNvbHZlKHRoaXMuY29uZmlnLmRvY3NfcGF0aClcbiAgICByZXR1cm4gZ2xvYi5zeW5jKHBhdGguam9pbihkb2NzX3BhdGgsJyoqLyoubWQnKSlcbiAgfVxuXG59XG5cbmZ1bmN0aW9uIGJ1aWxkSW5kZXhGcm9tRGlzayhicmllZmNhc2UpIHtcbiAgbGV0IHBhdGhzID0gYnJpZWZjYXNlLl9nZXREb2N1bWVudFBhdGhzKClcbiAgbGV0IGluZGV4ID0ge31cblxuICBwYXRocy5mb3JFYWNoKChwYXRoKT0+e1xuICAgIGxldCBwYXRoX2FsaWFzID0gcGF0aC5yZXBsYWNlKGJyaWVmY2FzZS5jb25maWcuZG9jc19wYXRoICsgJy8nLCAnJylcbiAgICBsZXQgaWQgPSBwYXRoX2FsaWFzLnJlcGxhY2UoJy5tZCcsJycpXG4gICAgbGV0IGRvY3VtZW50ID0gbmV3IERvY3VtZW50KHBhdGgsIHtpZDogaWR9KVxuICAgIGxldCBtb2RlbCA9IGRvY3VtZW50LnRvTW9kZWwoe2lkOiBpZH0pIFxuICAgIFxuICAgIGRvY3VtZW50LmlkID0gcGF0aF9hbGlhc1xuICAgIGRvY3VtZW50LnJlbGF0aXZlX3BhdGggPSAnZG9jcy8nICsgcGF0aF9hbGlhc1xuICAgIG1vZGVsLmlkID0gaWRcbiAgICBtb2RlbC5nZXRQYXJlbnQgPSAoKT0+eyByZXR1cm4gYnJpZWZjYXNlIH1cbiAgICBpbmRleFtwYXRoX2FsaWFzXSA9IG1vZGVsXG4gIH0pXG5cbiAgcmV0dXJuIGluZGV4XG59XG5cbmZ1bmN0aW9uIGxvYWRNb2RlbERlZmluaXRpb25zKGJyaWVmY2FzZSl7XG4gIE1vZGVsRGVmaW5pdGlvbi5sb2FkRGVmaW5pdGlvbnNGcm9tUGF0aChicmllZmNhc2UuY29uZmlnLm1vZGVsc19wYXRoKVxuICBNb2RlbERlZmluaXRpb24ubG9hZERlZmluaXRpb25zRnJvbVBhdGgoX19kaXJuYW1lICsgJy9tb2RlbHMnKVxuXG4gIE1vZGVsRGVmaW5pdGlvbi5nZXRBbGwoKS5mb3JFYWNoKGZ1bmN0aW9uKGRlZmluaXRpb24pe1xuICAgIGJyaWVmY2FzZS5sb2FkTW9kZWwoZGVmaW5pdGlvbilcbiAgICBjcmVhdGVDb2xsZWN0aW9uKGJyaWVmY2FzZSwgZGVmaW5pdGlvbilcbiAgfSlcblxuICBNb2RlbERlZmluaXRpb24uZmluYWxpemUoKVxufVxuXG5mdW5jdGlvbiBjcmVhdGVDb2xsZWN0aW9uKGJyaWVmY2FzZSwgbW9kZWxEZWZpbml0aW9uKXtcbiAgbGV0IHtncm91cE5hbWUsIHR5cGVfYWxpYXN9ID0gbW9kZWxEZWZpbml0aW9uXG4gIFxuICB0cnkge1xuICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShicmllZmNhc2UsIGdyb3VwTmFtZSwge1xuICAgICAgZ2V0OiBmdW5jdGlvbigpe1xuICAgICAgICBpZihicmllZmNhc2UuY29sbGVjdGlvbnNbZ3JvdXBOYW1lXSl7XG4gICAgICAgICAgcmV0dXJuIGJyaWVmY2FzZS5jb2xsZWN0aW9uc1tncm91cE5hbWVdXG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gYnJpZWZjYXNlLmNvbGxlY3Rpb25zW2dyb3VwTmFtZV0gPSBjb2xsZWN0aW9uKGZ1bmN0aW9uKCl7XG4gICAgICAgICAgcmV0dXJuIGJyaWVmY2FzZS5zZWxlY3RNb2RlbHNCeVR5cGUodHlwZV9hbGlhcylcbiAgICAgICAgfSwgbW9kZWxEZWZpbml0aW9uKVxuICAgICAgfVxuICAgIH0pXG5cbiAgfSBjYXRjaChlKXtcblxuICB9XG59XG5cbmZ1bmN0aW9uIGNyZWF0ZUFzc2V0UmVwb3NpdG9yeShicmllZmNhc2Upe1xuICBPYmplY3QuZGVmaW5lUHJvcGVydHkoYnJpZWZjYXNlLmNvbGxlY3Rpb25zLCAnYXNzZXRzJywge1xuICAgIGNvbmZpZ3VyYWJsZTogdHJ1ZSxcbiAgICBnZXQ6IGZ1bmN0aW9uKCl7XG4gICAgICBkZWxldGUoYnJpZWZjYXNlLmNvbGxlY3Rpb25zLmFzc2V0cylcbiAgICAgIHJldHVybiBicmllZmNhc2UuY29sbGVjdGlvbnMuYXNzZXRzID0gQXNzZXQucmVwbyhicmllZmNhc2UsIGJyaWVmY2FzZS5jb25maWcuYXNzZXRzIHx8IHt9KVxuICAgIH1cbiAgfSkgXG59XG5cbmZ1bmN0aW9uIGNyZWF0ZURhdGFSZXBvc2l0b3J5KGJyaWVmY2FzZSl7XG4gIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShicmllZmNhc2UuY29sbGVjdGlvbnMsICdkYXRhJywge1xuICAgIGNvbmZpZ3VyYWJsZTogdHJ1ZSxcbiAgICBnZXQ6IGZ1bmN0aW9uKCl7XG4gICAgICBkZWxldGUoYnJpZWZjYXNlLmNvbGxlY3Rpb25zLmRhdGEpXG4gICAgICByZXR1cm4gYnJpZWZjYXNlLmNvbGxlY3Rpb25zLmRhdGEgPSBEYXRhU291cmNlLnJlcG8oYnJpZWZjYXNlLCBicmllZmNhc2UuY29uZmlnLmRhdGEgfHwge30pXG4gICAgfVxuICB9KSBcbn1cbiJdfQ==