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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3NyYy9icmllZmNhc2UuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7O2tCQUFlLElBQUk7Ozs7dUJBQ0YsVUFBVTs7OztvQkFDVixNQUFNOzs7O2lCQUNDLEdBQUc7Ozs7MEJBQ2IsWUFBWTs7OztpQkFFUixJQUFJOzs7O3FCQUNKLFNBQVM7Ozs7MkJBQ0osZUFBZTs7Ozt3QkFDakIsWUFBWTs7OztxQkFDZixTQUFTOzs7O2dDQUNDLG9CQUFvQjs7Ozt3QkFDM0IsWUFBWTs7Ozt3QkFDWixZQUFZOzs7OzBCQUVWLGNBQWM7Ozs7eUJBQ2YsYUFBYTs7OztBQUVuQyxJQUFNLE9BQU8sR0FBRyxvQkFBWSxJQUFJLENBQUMsQ0FBQTtBQUNqQyxJQUFNLFNBQVMsR0FBRyxPQUFPLENBQUMsU0FBUyxDQUFBOztBQUVuQyxJQUFNLE9BQU8sR0FBRyxFQUFFLENBQUE7QUFDbEIsSUFBTSxpQkFBaUIsR0FBRyxFQUFFLENBQUE7QUFDNUIsSUFBTSxXQUFXLEdBQUcsRUFBRSxDQUFBOztJQUVELFNBQVM7Ozs7Ozs7Ozs7Ozs7O0FBYWpCLFdBYlEsU0FBUyxDQWFoQixJQUFJLEVBQUUsT0FBTyxFQUFFOzBCQWJSLFNBQVM7O0FBYzFCLFdBQU8sQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLEdBQUcsSUFBSSxDQUFBOztBQUV6QixRQUFJLENBQUMsSUFBSSxHQUFXLGtCQUFLLE9BQU8sQ0FBQyxJQUFJLENBQUMsQ0FBQTtBQUN0QyxRQUFJLENBQUMsSUFBSSxHQUFXLE9BQU8sQ0FBQyxJQUFJLElBQUksa0JBQUssUUFBUSxDQUFDLElBQUksQ0FBQyxDQUFBO0FBQ3ZELFFBQUksQ0FBQyxZQUFZLEdBQUcsa0JBQUssT0FBTyxDQUFDLElBQUksQ0FBQyxDQUFBOztBQUV0QyxRQUFJLENBQUMsT0FBTyxHQUFHLE9BQU8sSUFBSSxFQUFFLENBQUE7O0FBRTVCLFFBQUksQ0FBQyxpQkFBaUIsR0FBRyxFQUFFLENBQUE7QUFDM0IsUUFBSSxDQUFDLFdB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LENBQUMsRUFBQyxFQUVUO0NBQ0Y7O0FBRUQsU0FBUyxxQkFBcUIsQ0FBQyxTQUFTLEVBQUM7QUFDdkMsUUFBTSxDQUFDLGNBQWMsQ0FBQyxTQUFTLENBQUMsV0FBVyxFQUFFLFFBQVEsRUFBRTtBQUNyRCxnQkFBWSxFQUFFLElBQUk7QUFDbEIsT0FBRyxFQUFFLGVBQVU7QUFDYixhQUFPLFNBQVMsQ0FBQyxXQUFXLENBQUMsTUFBTSxBQUFDLENBQUE7QUFDcEMsYUFBTyxTQUFTLENBQUMsV0FBVyxDQUFDLE1BQU0sR0FBRyxtQkFBTSxJQUFJLENBQUMsU0FBUyxFQUFFLFNBQVMsQ0FBQyxNQUFNLENBQUMsTUFBTSxJQUFJLEVBQUUsQ0FBQyxDQUFBO0tBQzNGO0dBQ0YsQ0FBQyxDQUFBO0NBQ0g7O0FBRUQsU0FBUyxvQkFBb0IsQ0FBQyxTQUFTLEVBQUM7QUFDdEMsUUFBTSxDQUFDLGNBQWMsQ0FBQyxTQUFTLENBQUMsV0FBVyxFQUFFLE1BQU0sRUFBRTtBQUNuRCxnQkFBWSxFQUFFLElBQUk7QUFDbEIsT0FBRyxFQUFFLGVBQVU7QUFDYixhQUFPLFNBQVMsQ0FBQyxXQUFXLENBQUMsSUFBSSxBQUFDLENBQUE7QUFDbEMsYUFBTyxTQUFTLENBQUMsV0FBVyxDQUFDLElBQUksR0FBRyx5QkFBVyxJQUFJLENBQUMsU0FBUyxFQUFFLFNBQVMsQ0FBQyxNQUFNLENBQUMsSUFBSSxJQUFJLEVBQUUsQ0FBQyxDQUFBO0tBQzVGO0dBQ0YsQ0FBQyxDQUFBO0NBQ0giLCJmaWxlIjoiYnJpZWZjYXNlLmpzIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IGZzIGZyb20gJ2ZzJ1xuaW1wb3J0IGdsb2IgZnJvbSAnZ2xvYi1hbGwnXG5pbXBvcnQgcGF0aCBmcm9tICdwYXRoJ1xuaW1wb3J0IGluZmxlY3Rpb25zIGZyb20gJ2knXG5pbXBvcnQgXyBmcm9tICd1bmRlcnNjb3JlJ1xuXG5pbXBvcnQgYnJpZWYgZnJvbSAnLi4nXG5pbXBvcnQgQXNzZXQgZnJvbSAnLi9hc3NldCdcbmltcG9ydCBEYXRhU291cmNlIGZyb20gJy4vZGF0YV9zb3VyY2UnXG5pbXBvcnQgRG9jdW1lbnQgZnJvbSAnLi9kb2N1bWVudCdcbmltcG9ydCBNb2RlbCBmcm9tICcuL21vZGVsJ1xuaW1wb3J0IE1vZGVsRGVmaW5pdGlvbiBmcm9tICcuL21vZGVsX2RlZmluaXRpb24nXG5pbXBvcnQgUGFja2FnZXIgZnJvbSAnLi9wYWNrYWdlcidcbmltcG9ydCBSZXNvbHZlciBmcm9tICcuL1Jlc29sdmVyJ1xuXG5pbXBvcnQgY29sbGVjdGlvbiBmcm9tICcuL2NvbGxlY3Rpb24nXG5pbXBvcnQgZXhwb3J0ZXJzIGZyb20gJy4vZXhwb3J0ZXJzJ1xuXG5jb25zdCBpbmZsZWN0ID0gaW5mbGVjdGlvbnModHJ1ZSlcbmNvbnN0IHBsdXJhbGl6ZSA9IGluZmxlY3QucGx1cmFsaXplXG5cbmNvbnN0IF9fY2FjaGUgPSB7fVxuY29uc3QgX19kb2N1bWVudEluZGV4ZXMgPSB7fVxuY29uc3QgX19jYWNoZUtleXMgPSB7fVxuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBCcmllZmNhc2Uge1xuICAvKipcbiAgKiBDcmVhdGUgYSBuZXcgQnJpZWZjYXNlIG9iamVjdCBhdCB0aGUgc3BlY2lmaWVkIHJvb3QgcGF0aC5cbiAgKlxuICAqIEBwYXJhbSB7cGF0aH0gcm9vdCAtIHRoZSByb290IHBhdGggb2YgdGhlIGJyaWVmY2FzZS4gZXhwZWN0c1xuICAqICAgdG8gZmluZCBhIGNvbmZpZyBmaWxlIFwiYnJpZWYuY29uZmlnLmpzXCIsIGFuZCBhdCBsZWFzdCBhIFxuICAqICAgZG9jdW1lbnRzIGZvbGRlci5cbiAgKlxuICAqIEBwYXJhbSB7b3B0aW9uc30gb3B0aW9ucyAtIG9wdGlvbnMgdG8gb3ZlcnJpZGUgZGVmYXVsdCBiZWhhdmlvci5cbiAgKiBAcGFyYW0ge3BhdGh9IGRvY3NfcGF0aCAtIHdoaWNoIGZvbGRlciBjb250YWlucyB0aGUgZG9jdW1lbnRzLlxuICAqIEBwYXJhbSB7cGF0aH0gbW9kZWxzX3BhdGggLSB3aGljaCBmb2xkZXIgY29udGFpbnMgdGhlIG1vZGVscyB0byB1c2UuXG4gICogQHBhcmFtIHtwYXRofSBhc3NldHNfcGF0aCAtIHdoaWNoIGZvbGRlciBjb250YWlucyB0aGUgYXNzZXRzIHRvIHVzZSBpZiBhbnkuXG4gICovXG4gIGNvbnN0cnVjdG9yKHJvb3QsIG9wdGlvbnMpIHtcbiAgICBfX2NhY2hlW3RoaXMucm9vdF0gPSB0aGlzXG5cbiAgICB0aGlzLnJvb3QgICAgICAgICA9IHBhdGgucmVzb2x2ZShyb290KVxuICAgIHRoaXMubmFtZSAgICAgICAgID0gb3B0aW9ucy5uYW1lIHx8IHBhdGguYmFzZW5hbWUocm9vdClcbiAgICB0aGlzLnBhcmVudEZvbGRlciA9IHBhdGguZGlybmFtZShyb290KVxuXG4gICAgdGhpcy5vcHRpb25zID0gb3B0aW9ucyB8fCB7fVxuXG4gICAgdGhpcy5tb2RlbF9kZWZpbml0aW9ucyA9IHt9XG4gICAgdGhpcy5jb2xsZWN0aW9ucyA9IHt9XG4gICAgXG4gICAgdGhpcy5jb25maWcgPSB7XG4gICAgICBkb2NzX3BhdGg6IHBhdGguam9pbih0aGlzLnJvb3QsICdkb2NzJyksXG4gICAgICBtb2RlbHNfcGF0aDogcGF0aC5qb2luKHRoaXMucm9vdCwgJ21vZGVscycpLFxuICAgICAgYXNzZXRzX3BhdGg6IHBhdGguam9pbih0aGlzLnJvb3QsICdhc3NldHMnKSxcbiAgICAgIGRhdGFfcGF0aDogcGF0aC5qb2luKHRoaXMucm9vdCwgJ2RhdGEnKSxcbiAgICAgIHZpZXdzX3BhdGg6IHBhdGguam9pbih0aGlzLnJvb3QsICd2aWV3cycpXG4gICAgfVxuICAgIFxuICAgIHRoaXMuc2V0dXAoKVxuICB9XG4gIFxuICAvKiogXG4gICogUmV0dXJuIHRoZSBvdXRsaW5lIGZvciB0aGlzIGJyaWVmY2FzZSBpZiBpdCBleGlzdHMuXG4gICovXG4gIGdldCBvdXRsaW5lKCl7XG4gICAgcmV0dXJuIHRoaXMuYXQoJ291dGxpbmUubWQnKVxuICB9XG5cbiAgZ2V0IGluZGV4KCl7XG4gICAgaWYoX19kb2N1bWVudEluZGV4ZXNbdGhpcy5yb290XSl7XG4gICAgICByZXR1cm4gX19kb2N1bWVudEluZGV4ZXNbdGhpcy5yb290XVxuICAgIH1cbiAgICBcbiAgICByZXR1cm4gX19kb2N1bWVudEluZGV4ZXNbdGhpcy5yb290XSA9IGJ1aWxkSW5kZXhGcm9tRGlzayh0aGlzKVxuICB9XG5cbiAgLyoqXG4gICogTG9hZCBhIGJyaWVmY2FzZSBieSBwYXNzaW5nIGEgcGF0aCB0byBhIHJvb3QgZm9sZGVyLlxuICAqXG4gICogQHBhcmFtIHtzdHJpbmd9IHJvb3RQYXRoIC0gdGhlIHJvb3QgcGF0aCBvZiB0aGUgYnJpZWZjYXNlLlxuICAqIEByZXR1cm4ge0JyaWVmY2FzZX0gLSByZXR1cm5zIGEgYnJpZWZjYXNlXG4gICpcbiAgKi9cbiAgc3RhdGljIGxvYWQocm9vdFBhdGgsIG9wdGlvbnM9e30pIHtcbiAgICByZXR1cm4gbmV3IEJyaWVmY2FzZShyb290UGF0aCxvcHRpb25zKVxuICB9XG4gXG4gIC8qKlxuICAqIEZpbmQgdGhlIEJyaWVmY2FzZSBpbnN0YW5jZSByZXNwb25zaWJsZSBmb3IgYSBwYXJ0aWN1bGFyIHBhdGguXG4gICogTW9kZWxzIGFuZCBEb2N1bWVudHMgd2lsbCB1c2UgdGhpcyB0byBmaW5kIHRoZSBCcmllZmNhc2UgdGhleVxuICAqIGJlbG9uZyB0byBcbiAgKlxuICAqIEBwYXJhbSB7cGF0aH0gcGF0aCAtIHRoZSBwYXRoIG9mIHRoZSBkb2N1bWVudCB3aGljaCB3YW50cyB0byBrbm93XG4gICovXG4gIHN0YXRpYyBmaW5kRm9yUGF0aChjaGVja1BhdGg9XCJcIil7XG4gICAgbGV0IG1hdGNoaW5nUGF0aCA9IE9iamVjdC5rZXlzKF9fY2FjaGUpLmZpbmQocCA9PiBjaGVja1BhdGgubWF0Y2gocCkpXG4gICAgcmV0dXJuIF9fY2FjaGVbbWF0Y2hpbmdQYXRoXVxuICB9XG4gIFxuICAvKipcbiAgKiBSZXR1cm4gYWxsIGluc3RhbmNlcyBvZiBhIEJyaWVmY2FzZSB0aGF0IHdlIGFyZSBhd2FyZSBvZiBmcm9tIHRoZSBjYWNoZVxuICAqL1xuICBzdGF0aWMgaW5zdGFuY2VzKCl7XG4gICAgcmV0dXJuIE9iamVjdC5rZXlzKF9fY2FjaGUpLm1hcChwYXRoID0+IF9fY2FjaGVbcGF0aF0pXG4gIH1cbiAgXG4gIC8qKlxuICAqIEdldHMgYW55IGNvbmZpZyB2YWx1ZXMgdGhhdCBoYXZlIGJlZW4gc3VwcGxpZWQgdmlhIHRoZSBgcGFja2FnZS5qc29uYFxuICAqIGluIHRoaXMgQnJpZWZjYXNlIHJvb3QuICBMb29rcyBmb3IgYSBrZXkgY2FsbGVkIGBicmllZmAsIGFzIHdlbGwgYXMgYW55XG4gICogb2YgdGhlIHBsdWdpbnMgdGhhdCBoYXZlIGJlZW4gbG9hZGVkLlxuICAqL1xuICBnZXQgbWFuaWZlc3RDb25maWcoKXtcbiAgICBsZXQgYmFzZSA9IHt9XG4gICAgbGV0IG1hbmlmZXN0ID0gdGhpcy5tYW5pZmVzdCBcblxuICAgIGlmIChfLmlzRW1wdHkobWFuaWZlc3QpKSB7IHJldHVybiB7fSB9XG5cbiAgICBpZihtYW5pZmVzdC5icmllZil7IGJhc2UuYnJpZWYgPSBtYW5pZmVzdC5icmllZiB9XG5cbiAgICByZXR1cm4gdGhpcy5wbHVnaW5OYW1lcy5yZWR1Y2UoKG1lbW8scGx1Z2luKT0+e1xuICAgICAgaWYobWFuaWZlc3RbcGx1Z2luXSl7XG4gICAgICAgIG1lbW9bcGx1Z2luXSA9IG1hbmlmZXN0W3BsdWdpbl1cbiAgICAgIH1cblxuICAgICAgcmV0dXJuIG1lbW9cbiAgICB9LCBiYXNlKVxuICB9XG4gIFxuICAvKipcbiAgKiBHZXRzIGEgc2VyaWFsaXplZCB2ZXJzaW9uIG9mIHRoZSBgcGFja2FnZS5qc29uYCB0aGF0IGV4aXN0cyBpbiB0aGlzIEJyaWVmY2FzZSByb290IGZvbGRlci5cbiAgKi9cbiAgZ2V0IG1hbmlmZXN0KCl7XG4gICAgaWYoZnMuZXhpc3RzU3luYyhwYXRoLmpvaW4odGhpcy5yb290LCAncGFja2FnZS5qc29uJykpKXtcbiAgICAgIHJldHVybiBKU09OLnBhcnNlKGZzLnJlYWRGaWxlU3luYyhwYXRoLmpvaW4odGhpcy5yb290LCAncGFja2FnZS5qc29uJykpKVxuICAgIH1cbiAgfVxuICBcbiAgZ2V0IHJlc29sdmVyKCl7XG4gICAgcmV0dXJuIFJlc29sdmVyLmNyZWF0ZSh0aGlzKVxuICB9XG5cbiAgcmVzb2x2ZUxpbmsocGF0aEFsaWFzKXtcbiAgICByZXR1cm4gdGhpcy5yZXNvbHZlci5yZXNvbHZlTGluayhwYXRoQWxpYXMpXG4gIH1cblxuICByZXNvbHZlQXNzZXRQYXRoKHBhdGhBbGlhcyl7XG4gICAgcmV0dXJuIHRoaXMucmVzb2x2ZXIucmVzb2x2ZUFzc2V0UGF0aChwYXRoQWxpYXMpXG4gIH1cblxuICBnZXQgYXNzZXRzKCl7XG4gICAgcmV0dXJuIHRoaXMuY29sbGVjdGlvbnMuYXNzZXRzXG4gIH1cblxuICBnZXQgZGF0YSgpe1xuICAgIHJldHVybiB0aGlzLmNvbGxlY3Rpb25zLmRhdGFcbiAgfVxuXG4gIC8qKlxuICAqIFR1cm4gYWxsIG9mIHRoZSBkb2N1bWVudHMsIG1vZGVscywgZGF0YSwgYXNzZXRzLCBhbmQgb3RoZXIgbWV0YWRhdGEgYWJvdXQgdGhpcyBicmllZmNhc2VcbiAgKiBpbnRvIGEgc2luZ2xlIEpTT04gc3RydWN0dXJlLiBBbGlhcyBmb3IgdGhlIGBleHBvcnRXaXRoYCBtZXRob2QuXG4gICovXG4gIHRvSlNPTihvcHRpb25zPXt9KXtcbiAgICBpZihfLmlzU3RyaW5nKG9wdGlvbnMpKXtcbiAgICAgIG9wdGlvbnMgPSB7Zm9ybWF0OiBvcHRpb25zfVxuICAgIH1cblxuICAgIHJldHVybiB0aGlzLmV4cG9ydFdpdGgob3B0aW9ucy5mb3JtYXQgfHwgXCJzdGFuZGFyZFwiLCBvcHRpb25zKVxuICB9XG5cbiAgZXhwb3J0V2l0aChleHBvcnRlckZvcm1hdD1cInN0YW5kYXJkXCIsIG9wdGlvbnMgPSB7fSl7XG4gICAgcmV0dXJuIGV4cG9ydGVycy5jYWNoZWQodGhpcywgZXhwb3J0ZXJGb3JtYXQsIG9wdGlvbnMpXG4gIH1cbiAgXG4gIGdldCBjYWNoZUtleSgpe1xuICAgIGlmKF9fY2FjaGVLZXlzW3RoaXMucm9vdF0peyByZXR1cm4gX19jYWNoZUtleXNbdGhpcy5yb290XSB9XG4gICAgcmV0dXJuIF9fY2FjaGVLZXlzW3RoaXMucm9vdF0gPSB0aGlzLmNvbXB1dGVDYWNoZUtleSgpXG4gIH1cblxuICBjb21wdXRlQ2FjaGVLZXkoKXtcbiAgICBsZXQgbW9kaWZpZWRUaW1lcyA9IHRoaXMuZ2V0QWxsTW9kZWxzKCkubWFwKG1vZGVsID0+IG1vZGVsLmxhc3RNb2RpZmllZEF0KCkpLnNvcnQoKVxuICAgIGxldCBsYXRlc3QgPSBtb2RpZmllZFRpbWVzW21vZGlmaWVkVGltZXMubGVuZ3RoIC0gMV1cbiAgICByZXR1cm4gW3RoaXMubmFtZSwgbW9kaWZpZWRUaW1lcy5sZW5ndGgsIGxhdGVzdF0uam9pbignOicpXG4gIH1cbiAgXG4gIGlzU3RhbGUoKXtcbiAgICByZXR1cm4gdGhpcy5jYWNoZUtleSAhPT0gdGhpcy5jb21wdXRlQ2FjaGVLZXkoKVxuICB9XG4gIFxuICAvKipcbiAgKiBzZXR1cCB0aGlzIGJyaWVmY2FzZSBpbnZvbHZlcyBsb2FkaW5nIHRoZSBtb2RlbCBkZWZpbml0aW9uc1xuICAqIGFuZCBjcmVhdGluZyByZXBvc2l0b3JpZXMgZm9yIGFueSBhc3NldHMgb3IgZGF0YSBzb3VyY2VzXG4gICovIFxuICBzZXR1cCgpe1xuICAgIHRoaXMucGx1Z2luTmFtZXMgPSBbXVxuXG4gICAgcmVxdWlyZSgnLi9pbmRleCcpLnBsdWdpbnMuZm9yRWFjaChtb2RpZmllciA9PiB7XG4gICAgICB0aGlzLnBsdWdpbk5hbWVzLnB1c2gobW9kaWZpZXIucGx1Z2luX25hbWUgfHwgbW9kaWZpZXIucGx1Z2luTmFtZSlcbiAgICAgIG1vZGlmaWVyKHRoaXMpXG4gICAgfSlcbiAgICBcbiAgICBsb2FkTW9kZWxEZWZpbml0aW9ucyh0aGlzKVxuICAgIGNyZWF0ZUFzc2V0UmVwb3NpdG9yeSh0aGlzKSBcbiAgICBjcmVhdGVEYXRhUmVwb3NpdG9yeSh0aGlzKSBcbiAgfVxuICBcbiAgLyoqXG4gICogdXNlIGEgcGx1Z2luIHRvIGxvYWQgbW9kdWxlcywgYWN0aW9ucywgQ0xJIGhlbHBlcnMsIGV0Y1xuICAqL1xuICB1c2UocGx1Z2luLCBvcHRpb25zPXt9KXtcbiAgICBicmllZi51c2UocGx1Z2luKVxuICAgIHRoaXMuc2V0dXAoKVxuICAgIHJldHVybiB0aGlzXG4gIH1cblxuICAvKipcbiAgICogZ2V0IG1vZGVsIGF0IHRoZSBnaXZlbiByZWxhdGl2ZSBwYXRoIFxuICAgKiBcbiAgICogQGV4YW1wbGVcbiAgICogIGJyaWVmY2FzZS5hdCgnZXBpY3MvbW9kZWwtZGVmaW5pdGlvbi1kc2wnKVxuICAqL1xuICBhdChwYXRoX2FsaWFzLCBhYnNvbHV0ZT1mYWxzZSkge1xuICAgIGxldCBkb2NzX3BhdGggPSBwYXRoLnJlc29sdmUodGhpcy5jb25maWcuZG9jc19wYXRoKVxuXG4gICAgaWYoYWJzb2x1dGUpeyBwYXRoX2FsaWFzID0gcGF0aF9hbGlhcy5yZXBsYWNlKGRvY3NfcGF0aCwgJycpIH1cblxuICAgIGlmKCFwYXRoX2FsaWFzLm1hdGNoKC9cXC5tZCQvaSkpe1xuICAgICAgcGF0aF9hbGlhcyA9IHBhdGhfYWxpYXMgKyAnLm1kJyBcbiAgICB9XG5cbiAgICByZXR1cm4gdGhpcy5pbmRleFtwYXRoX2FsaWFzLnJlcGxhY2UoL15cXC8vLCcnKV1cbiAgfVxuXG4gIGZpbmREb2N1bWVudEJ5UGF0aChwYXRoKXtcbiAgICByZXR1cm4gdGhpcy5hdFBhdGgocGF0aF9hbGlhcywgdHJ1ZSlcbiAgfVxuICAvKipcbiAgKiBnZXQgbW9kZWxzIGF0IGVhY2ggb2YgdGhlIHBhdGhzIHJlcHJlc2VudGVkXG4gICogYnkgdGhlIGdsb2IgcGF0dGVybiBwYXNzZWQgaGVyZS5cbiAgKi9cbiAgZ2xvYihwYXR0ZXJuPVwiKiovKi5tZFwiKSB7XG4gICAgbGV0IG1hdGNoaW5nRmlsZXMgPSBnbG9iLnN5bmMocGF0aC5qb2luKHRoaXMucm9vdCwgcGF0dGVybikpXG4gICAgcmV0dXJuIG1hdGNoaW5nRmlsZXMubWFwKHBhdGggPT4gdGhpcy5hdChwYXRoLHRydWUpKSBcbiAgfVxuXG4gIC8qKlxuICAgKiBmaWx0ZXJzIGFsbCBhdmFpbGFibGUgbW9kZWxzIGJ5IHRoZSBnaXZlbiBpdGVyYXRvclxuICAgKlxuICAgKiBAZXhhbXBsZVxuICAgKiAgYnJpZWZjYXNlLmZpbHRlckFsbChtb2RlbCA9PiBtb2RlbC5zdGF0dXMgPT09ICdhY3RpdmUnKVxuICAqL1xuICBmaWx0ZXJBbGwgKGl0ZXJhdG9yKSB7XG4gICAgcmV0dXJuIHRoaXMuZ2V0QWxsTW9kZWxzKCkuZmlsdGVyKGl0ZXJhdG9yKVxuICB9XG4gIFxuICBmaW5kTW9kZWxzQnlEZWZpbml0aW9uKGRlZmluaXRpb24pe1xuICAgIGxldCBncm91cE5hbWUgPSBkZWZpbml0aW9uLmdyb3VwTmFtZVxuICAgIHJldHVybiB0aGlzLmZpbHRlckFsbChtb2RlbCA9PiBtb2RlbC5ncm91cE5hbWUgPT09IGdyb3VwTmFtZSlcbiAgfVxuICAgXG4gIC8qKlxuICAgKiBmaWx0ZXJzIG1vZGVscyBieSB0aGUgcHJvcGVydHkgYW5kIGRlc2lyZWQgdmFsdWVcbiAgICogXG4gICAqIEBwYXJhbSB7c3RyaW5nfSBwcm9wZXJ0eSAtIG5hbWUgb2YgdGhlIHByb3BlcnR5IHRvIGZpbHRlciBvbiBcbiAgICogQHBhcmFtIHthbnl9IGRlc2lyZWRWYWx1ZSAtIHRoZSB2YWx1ZSB0byBtYXRjaCBhZ2FpbnN0XG4gICAqXG4gICAqIEByZXR1cm4ge2FycmF5fSAtIG1vZGVscyB3aG9zZSBwcm9wZXJ0eSBtYXRjaGVzIGRlc2lyZWRWYWx1ZSBcbiAgKi9cbiAgZmlsdGVyQWxsQnlQcm9wZXJ0eSAocHJvcGVydHksIGRlc2lyZWRWYWx1ZSkge1xuICAgIHJldHVybiB0aGlzLmZpbHRlckFsbChtb2RlbCA9PiBtb2RlbFtwcm9wZXJ0eV0gPT09IGRlc2lyZWRWYWx1ZSlcbiAgfVxuICBcbiAgLyoqXG4gICAqIHNlbGVjdHMgYWxsIHRoZSBtb2RlbHMgd2hvc2UgdHlwZSBtYXRjaGVzIHRoZSBzdXBwbGllZCBhcmcgXG4gICovXG4gIHNlbGVjdE1vZGVsc0J5VHlwZSh0eXBlKSB7XG4gICAgcmV0dXJuIHRoaXMuZmlsdGVyQWxsQnlQcm9wZXJ0eSgndHlwZScsIHR5cGUpXG4gIH1cblxuICAvKipcbiAgICogc2VsZWN0cyBhbGwgdGhlIG1vZGVscyB3aG9zZSBncm91cE5hbWUgbWF0Y2hlcyB0aGUgc3VwcGxpZWQgYXJnIFxuICAqL1xuICBzZWxlY3RNb2RlbHNCeUdyb3VwKGdyb3VwTmFtZSkge1xuICAgIHJldHVybiB0aGlzLmZpbHRlckFsbEJ5UHJvcGVydHkoJ2dyb3VwTmFtZScsIGdyb3VwTmFtZSlcbiAgfVxuICBcbiAgLyoqXG4gICAqIHJldHVybnMgYWxsIHRoZSBtb2RlbHMgaW4gdGhpcyBicmllZmNhc2VcbiAgKi9cbiAgZ2V0QWxsTW9kZWxzKCkge1xuICAgIHJldHVybiBPYmplY3Qua2V5cyh0aGlzLmluZGV4KS5tYXAoa2V5ID0+IHRoaXMuaW5kZXhba2V5XSlcbiAgfVxuICBcbiAgLyoqXG4gICAqIHJldHVybnMgdGhlIHJhdyBkb2N1bWVudHMgaW4gdGhpcyBicmllZmNhc2VcbiAgKi9cbiAgZ2V0QWxsRG9jdW1lbnRzICgpIHtcbiAgICByZXR1cm4gdGhpcy5nZXRBbGxNb2RlbHMoKS5tYXAobW9kZWwgPT4gbW9kZWwuZG9jdW1lbnQpXG4gIH1cbiAgXG4gIC8qKlxuICAqIEFyY2hpdmVzIHRoZSBicmllZmNhc2UgaW50byBhIHppcCBmaWxlLiBCcmllZmNhc2VzXG4gICogY2FuIGJlIGNyZWF0ZWQgZGlyZWN0bHkgZnJvbSB6aXAgZmlsZXMgaW4gdGhlIGZ1dHVyZS5cbiAgKlxuICAqIEBwYXJhbSB7c3RyaW5nfSBsb2NhdGlvbiAtIHdoZXJlIHRvIHN0b3JlIHRoZSBmaWxlP1xuICAqIEBwYXJhbSB7YXJyYXl9IGlnbm9yZSAtIGEgbGlzdCBvZiBmaWxlcyB0byBpZ25vcmUgYW5kIG5vdCBwdXQgaW4gdGhlXG4gICogICBhcmNoaXZlXG4gICovXG4gIGFyY2hpdmUobG9jYXRpb24sIGlnbm9yZT1bXSkge1xuICAgIGxvY2F0aW9uID0gbG9jYXRpb24gfHwgXG4gICAgaWdub3JlLnB1c2gobG9jYXRpb24pXG5cbiAgICBuZXcgUGFja2FnZXIodGhpcywgaWdub3JlKS5wZXJzaXN0KGxvY2F0aW9uKVxuICB9XG4gIFxuICBnZXRHcm91cE5hbWVzICgpIHtcbiAgICByZXR1cm4gT2JqZWN0LmtleXModGhpcy5tb2RlbF9kZWZpbml0aW9ucykubWFwKG5hbWUgPT4gaW5mbGVjdC5wbHVyYWxpemUobmFtZS50b0xvd2VyQ2FzZSgpKSlcbiAgfVxuXG4gIGdldERvY3VtZW50VHlwZXMgKCkge1xuICAgIHJldHVybiBPYmplY3Qua2V5cyh0aGlzLm1vZGVsX2RlZmluaXRpb25zKS5tYXAobmFtZSA9PiBpbmZsZWN0LnVuZGVyc2NvcmUobmFtZS50b0xvd2VyQ2FzZSgpKSlcbiAgfVxuICBcbiAgbG9hZE1vZGVsRGVmaW5pdGlvbihwYXRoKXtcbiAgICByZXR1cm4gdGhpcy5sb2FkTW9kZWwoTW9kZWxEZWZpbml0aW9uLmxvYWQocGF0aCkpXG4gIH1cblxuICBsb2FkTW9kZWwgKGRlZmluaXRpb24pIHtcbiAgICB0aGlzLm1vZGVsX2RlZmluaXRpb25zW2RlZmluaXRpb24ubmFtZV0gPSB0cnVlIFxuICAgIHJldHVybiBkZWZpbml0aW9uXG4gIH1cblxuICBsb2FkZWRNb2RlbERlZmluaXRpb25zICgpIHtcbiAgICByZXR1cm4gT2JqZWN0LmtleXModGhpcy5tb2RlbF9kZWZpbml0aW9ucylcbiAgfVxuXG4gIGdldE1vZGVsRGVmaW5pdGlvbnMgKCkgeyBcbiAgICByZXR1cm4gTW9kZWxEZWZpbml0aW9uLmdldEFsbCgpXG4gIH1cblxuICBnZXRNb2RlbERlZmluaXRpb24gKG1vZGVsTmFtZU9yQWxpYXMpIHtcbiAgICByZXR1cm4gTW9kZWxEZWZpbml0aW9uLmxvb2t1cChtb2RlbE5hbWVPckFsaWFzKVxuICB9XG5cbiAgZ2V0VHlwZUFsaWFzZXMgKCl7XG4gICAgcmV0dXJuIE1vZGVsRGVmaW5pdGlvbi5nZXRUeXBlQWxpYXNlcygpXG4gIH1cblxuICBnZXRNb2RlbFNjaGVtYSAoKSB7XG4gICAgcmV0dXJuIE1vZGVsRGVmaW5pdGlvbi5nZXRNb2RlbFNjaGVtYSgpXG4gIH1cblxuICBnZXRBbGxGaWxlcyh1c2VBYnNvbHV0ZVBhdGhzPWZhbHNlKXtcbiAgICBsZXQgYWxsRmlsZXMgPSBnbG9iLnN5bmMocGF0aC5qb2luKHRoaXMucm9vdCwgJyoqLyonKSlcbiAgICByZXR1cm4gdXNlQWJzb2x1dGVQYXRocyA/IGFsbEZpbGVzIDogYWxsRmlsZXMubWFwKGYgPT4gZi5yZXBsYWNlKHRoaXMucm9vdCArICcvJywgJycpKVxuICB9XG4gXG4gXG4gIF9nZXREb2N1bWVudFBhdGhzKCkge1xuICAgIGxldCBkb2NzX3BhdGggPSBwYXRoLnJlc29sdmUodGhpcy5jb25maWcuZG9jc19wYXRoKVxuICAgIHJldHVybiBnbG9iLnN5bmMocGF0aC5qb2luKGRvY3NfcGF0aCwnKiovKi5tZCcpKVxuICB9XG5cbn1cblxuZnVuY3Rpb24gYnVpbGRJbmRleEZyb21EaXNrKGJyaWVmY2FzZSkge1xuICBsZXQgcGF0aHMgPSBicmllZmNhc2UuX2dldERvY3VtZW50UGF0aHMoKVxuICBsZXQgaW5kZXggPSB7fVxuXG4gIHBhdGhzLmZvckVhY2goKHBhdGgpPT57XG4gICAgbGV0IHBhdGhfYWxpYXMgPSBwYXRoLnJlcGxhY2UoYnJpZWZjYXNlLmNvbmZpZy5kb2NzX3BhdGggKyAnLycsICcnKVxuICAgIGxldCBpZCA9IHBhdGhfYWxpYXMucmVwbGFjZSgnLm1kJywnJylcbiAgICBsZXQgZG9jdW1lbnQgPSBuZXcgRG9jdW1lbnQocGF0aCwge2lkOiBpZH0pXG4gICAgbGV0IG1vZGVsID0gZG9jdW1lbnQudG9Nb2RlbCh7aWQ6IGlkfSkgXG4gICAgXG4gICAgZG9jdW1lbnQuaWQgPSBwYXRoX2FsaWFzXG4gICAgZG9jdW1lbnQucmVsYXRpdmVfcGF0aCA9ICdkb2NzLycgKyBwYXRoX2FsaWFzXG4gICAgbW9kZWwuaWQgPSBpZFxuICAgIG1vZGVsLmdldFBhcmVudCA9ICgpPT57IHJldHVybiBicmllZmNhc2UgfVxuICAgIGluZGV4W3BhdGhfYWxpYXNdID0gbW9kZWxcbiAgfSlcblxuICByZXR1cm4gaW5kZXhcbn1cblxuZnVuY3Rpb24gbG9hZE1vZGVsRGVmaW5pdGlvbnMoYnJpZWZjYXNlKXtcbiAgTW9kZWxEZWZpbml0aW9uLmxvYWREZWZpbml0aW9uc0Zyb21QYXRoKGJyaWVmY2FzZS5jb25maWcubW9kZWxzX3BhdGgpXG4gIE1vZGVsRGVmaW5pdGlvbi5sb2FkRGVmaW5pdGlvbnNGcm9tUGF0aChfX2Rpcm5hbWUgKyAnL21vZGVscycpXG5cbiAgTW9kZWxEZWZpbml0aW9uLmdldEFsbCgpLmZvckVhY2goZnVuY3Rpb24oZGVmaW5pdGlvbil7XG4gICAgYnJpZWZjYXNlLmxvYWRNb2RlbChkZWZpbml0aW9uKVxuICAgIGNyZWF0ZUNvbGxlY3Rpb24oYnJpZWZjYXNlLCBkZWZpbml0aW9uKVxuICB9KVxuXG4gIE1vZGVsRGVmaW5pdGlvbi5maW5hbGl6ZSgpXG59XG5cbmZ1bmN0aW9uIGNyZWF0ZUNvbGxlY3Rpb24oYnJpZWZjYXNlLCBtb2RlbERlZmluaXRpb24pe1xuICBsZXQge2dyb3VwTmFtZSwgdHlwZV9hbGlhc30gPSBtb2RlbERlZmluaXRpb25cbiAgXG4gIHRyeSB7XG4gICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KGJyaWVmY2FzZSwgZ3JvdXBOYW1lLCB7XG4gICAgICBnZXQ6IGZ1bmN0aW9uKCl7XG4gICAgICAgIGlmKGJyaWVmY2FzZS5jb2xsZWN0aW9uc1tncm91cE5hbWVdKXtcbiAgICAgICAgICByZXR1cm4gYnJpZWZjYXNlLmNvbGxlY3Rpb25zW2dyb3VwTmFtZV1cbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiBicmllZmNhc2UuY29sbGVjdGlvbnNbZ3JvdXBOYW1lXSA9IGNvbGxlY3Rpb24oZnVuY3Rpb24oKXtcbiAgICAgICAgICByZXR1cm4gYnJpZWZjYXNlLnNlbGVjdE1vZGVsc0J5VHlwZSh0eXBlX2FsaWFzKVxuICAgICAgICB9LCBtb2RlbERlZmluaXRpb24pXG4gICAgICB9XG4gICAgfSlcblxuICB9IGNhdGNoKGUpe1xuXG4gIH1cbn1cblxuZnVuY3Rpb24gY3JlYXRlQXNzZXRSZXBvc2l0b3J5KGJyaWVmY2FzZSl7XG4gIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShicmllZmNhc2UuY29sbGVjdGlvbnMsICdhc3NldHMnLCB7XG4gICAgY29uZmlndXJhYmxlOiB0cnVlLFxuICAgIGdldDogZnVuY3Rpb24oKXtcbiAgICAgIGRlbGV0ZShicmllZmNhc2UuY29sbGVjdGlvbnMuYXNzZXRzKVxuICAgICAgcmV0dXJuIGJyaWVmY2FzZS5jb2xsZWN0aW9ucy5hc3NldHMgPSBBc3NldC5yZXBvKGJyaWVmY2FzZSwgYnJpZWZjYXNlLmNvbmZpZy5hc3NldHMgfHwge30pXG4gICAgfVxuICB9KSBcbn1cblxuZnVuY3Rpb24gY3JlYXRlRGF0YVJlcG9zaXRvcnkoYnJpZWZjYXNlKXtcbiAgT2JqZWN0LmRlZmluZVByb3BlcnR5KGJyaWVmY2FzZS5jb2xsZWN0aW9ucywgJ2RhdGEnLCB7XG4gICAgY29uZmlndXJhYmxlOiB0cnVlLFxuICAgIGdldDogZnVuY3Rpb24oKXtcbiAgICAgIGRlbGV0ZShicmllZmNhc2UuY29sbGVjdGlvbnMuZGF0YSlcbiAgICAgIHJldHVybiBicmllZmNhc2UuY29sbGVjdGlvbnMuZGF0YSA9IERhdGFTb3VyY2UucmVwbyhicmllZmNhc2UsIGJyaWVmY2FzZS5jb25maWcuZGF0YSB8fCB7fSlcbiAgICB9XG4gIH0pIFxufVxuIl19