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
      assets_path: _path2['default'].join(this.root, 'assets')
    };

    this.setup();
  }

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

    /**
    * Turn all of the documents, models, data, assets, and other metadata about this briefcase
    * into a single JSON structure. Alias for the `exportWith` method.
    */
  }, {
    key: 'toJSON',
    value: function toJSON() {
      var options = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

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
module.exports = exports['default'];
//# sourceMappingURL=data:application/json;base64,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VUFBVTs7QUFFMUIsTUFBSTtBQUNGLFVBQU0sQ0FBQyxjQUFjLENBQUMsU0FBUyxFQUFFLFNBQVMsRUFBRTtBQUMxQyxTQUFHLEVBQUUsZUFBVTtBQUNiLFlBQUcsU0FBUyxDQUFDLFdBQVcsQ0FBQyxTQUFTLENBQUMsRUFBQztBQUNsQyxpQkFBTyxTQUFTLENBQUMsV0FBVyxDQUFDLFNBQVMsQ0FBQyxDQUFBO1NBQ3hDOztBQUVELGVBQU8sU0FBUyxDQUFDLFdBQVcsQ0FBQyxTQUFTLENBQUMsR0FBRyw2QkFBVyxZQUFVO0FBQzdELGlCQUFPLFNBQVMsQ0FBQyxrQkFBa0IsQ0FBQyxVQUFVLENBQUMsQ0FBQTtTQUNoRCxFQUFFLGVBQWUsQ0FBQyxDQUFBO09BQ3BCO0tBQ0YsQ0FBQyxDQUFBO0dBRUgsQ0FBQyxPQUFNLENBQUMsRUFBQyxFQUVUO0NBQ0YiLCJmaWxlIjoiYnJpZWZjYXNlLmpzIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IGZzIGZyb20gJ2ZzJ1xuaW1wb3J0IGdsb2IgZnJvbSAnZ2xvYi1hbGwnXG5pbXBvcnQgcGF0aCBmcm9tICdwYXRoJ1xuaW1wb3J0IGluZmxlY3Rpb25zIGZyb20gJ2knXG5pbXBvcnQgXyBmcm9tICd1bmRlcnNjb3JlJ1xuXG5pbXBvcnQgYnJpZWYgZnJvbSAnLi4nXG5pbXBvcnQgRG9jdW1lbnQgZnJvbSAnLi9kb2N1bWVudCdcbmltcG9ydCBNb2RlbCBmcm9tICcuL21vZGVsJ1xuaW1wb3J0IE1vZGVsRGVmaW5pdGlvbiBmcm9tICcuL21vZGVsX2RlZmluaXRpb24nXG5pbXBvcnQgUGFja2FnZXIgZnJvbSAnLi9wYWNrYWdlcidcbmltcG9ydCBSZXNvbHZlciBmcm9tICcuL1Jlc29sdmVyJ1xuXG5pbXBvcnQgY29sbGVjdGlvbiBmcm9tICcuL2NvbGxlY3Rpb24nXG5pbXBvcnQgZXhwb3J0ZXJzIGZyb20gJy4vZXhwb3J0ZXJzJ1xuXG5jb25zdCBpbmZsZWN0ID0gaW5mbGVjdGlvbnModHJ1ZSlcbmNvbnN0IHBsdXJhbGl6ZSA9IGluZmxlY3QucGx1cmFsaXplXG5cbmNvbnN0IF9fY2FjaGUgPSB7fVxuY29uc3QgX19kb2N1bWVudEluZGV4ZXMgPSB7fVxuY29uc3QgX19jYWNoZUtleXMgPSB7fVxuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBCcmllZmNhc2Uge1xuICAvKipcbiAgKiBDcmVhdGUgYSBuZXcgQnJpZWZjYXNlIG9iamVjdCBhdCB0aGUgc3BlY2lmaWVkIHJvb3QgcGF0aC5cbiAgKlxuICAqIEBwYXJhbSB7cGF0aH0gcm9vdCAtIHRoZSByb290IHBhdGggb2YgdGhlIGJyaWVmY2FzZS4gZXhwZWN0c1xuICAqICAgdG8gZmluZCBhIGNvbmZpZyBmaWxlIFwiYnJpZWYuY29uZmlnLmpzXCIsIGFuZCBhdCBsZWFzdCBhIFxuICAqICAgZG9jdW1lbnRzIGZvbGRlci5cbiAgKlxuICAqIEBwYXJhbSB7b3B0aW9uc30gb3B0aW9ucyAtIG9wdGlvbnMgdG8gb3ZlcnJpZGUgZGVmYXVsdCBiZWhhdmlvci5cbiAgKiBAcGFyYW0ge3BhdGh9IGRvY3NfcGF0aCAtIHdoaWNoIGZvbGRlciBjb250YWlucyB0aGUgZG9jdW1lbnRzLlxuICAqIEBwYXJhbSB7cGF0aH0gbW9kZWxzX3BhdGggLSB3aGljaCBmb2xkZXIgY29udGFpbnMgdGhlIG1vZGVscyB0byB1c2UuXG4gICogQHBhcmFtIHtwYXRofSBhc3NldHNfcGF0aCAtIHdoaWNoIGZvbGRlciBjb250YWlucyB0aGUgYXNzZXRzIHRvIHVzZSBpZiBhbnkuXG4gICovXG4gIGNvbnN0cnVjdG9yKHJvb3QsIG9wdGlvbnMpIHtcbiAgICBfX2NhY2hlW3RoaXMucm9vdF0gPSB0aGlzXG5cbiAgICB0aGlzLnJvb3QgICAgICAgICA9IHBhdGgucmVzb2x2ZShyb290KVxuICAgIHRoaXMubmFtZSAgICAgICAgID0gb3B0aW9ucy5uYW1lIHx8IHBhdGguYmFzZW5hbWUocm9vdClcbiAgICB0aGlzLnBhcmVudEZvbGRlciA9IHBhdGguZGlybmFtZShyb290KVxuXG4gICAgdGhpcy5vcHRpb25zID0gb3B0aW9ucyB8fCB7fVxuXG4gICAgdGhpcy5tb2RlbF9kZWZpbml0aW9ucyA9IHt9XG4gICAgdGhpcy5jb2xsZWN0aW9ucyA9IHt9XG4gICAgXG4gICAgdGhpcy5jb25maWcgPSB7XG4gICAgICBkb2NzX3BhdGg6IHBhdGguam9pbih0aGlzLnJvb3QsICdkb2NzJyksXG4gICAgICBtb2RlbHNfcGF0aDogcGF0aC5qb2luKHRoaXMucm9vdCwgJ21vZGVscycpLFxuICAgICAgYXNzZXRzX3BhdGg6IHBhdGguam9pbih0aGlzLnJvb3QsICdhc3NldHMnKVxuICAgIH1cbiAgICBcbiAgICB0aGlzLnNldHVwKClcbiAgfVxuICBcbiAgZ2V0IGluZGV4KCl7XG4gICAgaWYoX19kb2N1bWVudEluZGV4ZXNbdGhpcy5yb290XSl7XG4gICAgICByZXR1cm4gX19kb2N1bWVudEluZGV4ZXNbdGhpcy5yb290XVxuICAgIH1cbiAgICBcbiAgICByZXR1cm4gX19kb2N1bWVudEluZGV4ZXNbdGhpcy5yb290XSA9IGJ1aWxkSW5kZXhGcm9tRGlzayh0aGlzKVxuICB9XG5cbiAgLyoqXG4gICogTG9hZCBhIGJyaWVmY2FzZSBieSBwYXNzaW5nIGEgcGF0aCB0byBhIHJvb3QgZm9sZGVyLlxuICAqXG4gICogQHBhcmFtIHtzdHJpbmd9IHJvb3RQYXRoIC0gdGhlIHJvb3QgcGF0aCBvZiB0aGUgYnJpZWZjYXNlLlxuICAqIEByZXR1cm4ge0JyaWVmY2FzZX0gLSByZXR1cm5zIGEgYnJpZWZjYXNlXG4gICpcbiAgKi9cbiAgc3RhdGljIGxvYWQocm9vdFBhdGgsIG9wdGlvbnM9e30pIHtcbiAgICByZXR1cm4gbmV3IEJyaWVmY2FzZShyb290UGF0aCxvcHRpb25zKVxuICB9XG4gXG4gIC8qKlxuICAqIEZpbmQgdGhlIEJyaWVmY2FzZSBpbnN0YW5jZSByZXNwb25zaWJsZSBmb3IgYSBwYXJ0aWN1bGFyIHBhdGguXG4gICogTW9kZWxzIGFuZCBEb2N1bWVudHMgd2lsbCB1c2UgdGhpcyB0byBmaW5kIHRoZSBCcmllZmNhc2UgdGhleVxuICAqIGJlbG9uZyB0byBcbiAgKlxuICAqIEBwYXJhbSB7cGF0aH0gcGF0aCAtIHRoZSBwYXRoIG9mIHRoZSBkb2N1bWVudCB3aGljaCB3YW50cyB0byBrbm93XG4gICovXG4gIHN0YXRpYyBmaW5kRm9yUGF0aChjaGVja1BhdGg9XCJcIil7XG4gICAgbGV0IG1hdGNoaW5nUGF0aCA9IE9iamVjdC5rZXlzKF9fY2FjaGUpLmZpbmQocCA9PiBjaGVja1BhdGgubWF0Y2gocCkpXG4gICAgcmV0dXJuIF9fY2FjaGVbbWF0Y2hpbmdQYXRoXVxuICB9XG4gIFxuICAvKipcbiAgKiBSZXR1cm4gYWxsIGluc3RhbmNlcyBvZiBhIEJyaWVmY2FzZSB0aGF0IHdlIGFyZSBhd2FyZSBvZiBmcm9tIHRoZSBjYWNoZVxuICAqL1xuICBzdGF0aWMgaW5zdGFuY2VzKCl7XG4gICAgcmV0dXJuIE9iamVjdC5rZXlzKF9fY2FjaGUpLm1hcChwYXRoID0+IF9fY2FjaGVbcGF0aF0pXG4gIH1cbiAgXG4gIC8qKlxuICAqIEdldHMgYW55IGNvbmZpZyB2YWx1ZXMgdGhhdCBoYXZlIGJlZW4gc3VwcGxpZWQgdmlhIHRoZSBgcGFja2FnZS5qc29uYFxuICAqIGluIHRoaXMgQnJpZWZjYXNlIHJvb3QuICBMb29rcyBmb3IgYSBrZXkgY2FsbGVkIGBicmllZmAsIGFzIHdlbGwgYXMgYW55XG4gICogb2YgdGhlIHBsdWdpbnMgdGhhdCBoYXZlIGJlZW4gbG9hZGVkLlxuICAqL1xuICBnZXQgbWFuaWZlc3RDb25maWcoKXtcbiAgICBsZXQgYmFzZSA9IHt9XG4gICAgbGV0IG1hbmlmZXN0ID0gdGhpcy5tYW5pZmVzdCBcblxuICAgIGlmIChfLmlzRW1wdHkobWFuaWZlc3QpKSB7IHJldHVybiB7fSB9XG5cbiAgICBpZihtYW5pZmVzdC5icmllZil7IGJhc2UuYnJpZWYgPSBtYW5pZmVzdC5icmllZiB9XG5cbiAgICByZXR1cm4gdGhpcy5wbHVnaW5OYW1lcy5yZWR1Y2UoKG1lbW8scGx1Z2luKT0+e1xuICAgICAgaWYobWFuaWZlc3RbcGx1Z2luXSl7XG4gICAgICAgIG1lbW9bcGx1Z2luXSA9IG1hbmlmZXN0W3BsdWdpbl1cbiAgICAgIH1cblxuICAgICAgcmV0dXJuIG1lbW9cbiAgICB9LCBiYXNlKVxuICB9XG4gIFxuICAvKipcbiAgKiBHZXRzIGEgc2VyaWFsaXplZCB2ZXJzaW9uIG9mIHRoZSBgcGFja2FnZS5qc29uYCB0aGF0IGV4aXN0cyBpbiB0aGlzIEJyaWVmY2FzZSByb290IGZvbGRlci5cbiAgKi9cbiAgZ2V0IG1hbmlmZXN0KCl7XG4gICAgaWYoZnMuZXhpc3RzU3luYyhwYXRoLmpvaW4odGhpcy5yb290LCAncGFja2FnZS5qc29uJykpKXtcbiAgICAgIHJldHVybiBKU09OLnBhcnNlKGZzLnJlYWRGaWxlU3luYyhwYXRoLmpvaW4odGhpcy5yb290LCAncGFja2FnZS5qc29uJykpKVxuICAgIH1cbiAgfVxuICBcbiAgZ2V0IHJlc29sdmVyKCl7XG4gICAgcmV0dXJuIFJlc29sdmVyLmNyZWF0ZSh0aGlzKVxuICB9XG5cbiAgcmVzb2x2ZUxpbmsocGF0aEFsaWFzKXtcbiAgICByZXR1cm4gdGhpcy5yZXNvbHZlci5yZXNvbHZlTGluayhwYXRoQWxpYXMpXG4gIH1cblxuICByZXNvbHZlQXNzZXRQYXRoKHBhdGhBbGlhcyl7XG4gICAgcmV0dXJuIHRoaXMucmVzb2x2ZXIucmVzb2x2ZUFzc2V0UGF0aChwYXRoQWxpYXMpXG4gIH1cblxuICAvKipcbiAgKiBUdXJuIGFsbCBvZiB0aGUgZG9jdW1lbnRzLCBtb2RlbHMsIGRhdGEsIGFzc2V0cywgYW5kIG90aGVyIG1ldGFkYXRhIGFib3V0IHRoaXMgYnJpZWZjYXNlXG4gICogaW50byBhIHNpbmdsZSBKU09OIHN0cnVjdHVyZS4gQWxpYXMgZm9yIHRoZSBgZXhwb3J0V2l0aGAgbWV0aG9kLlxuICAqL1xuICB0b0pTT04ob3B0aW9ucz17fSl7XG4gICAgcmV0dXJuIHRoaXMuZXhwb3J0V2l0aChvcHRpb25zLmZvcm1hdCB8fCBcInN0YW5kYXJkXCIsIG9wdGlvbnMpXG4gIH1cblxuICBleHBvcnRXaXRoKGV4cG9ydGVyRm9ybWF0PVwic3RhbmRhcmRcIiwgb3B0aW9ucyA9IHt9KXtcbiAgICByZXR1cm4gZXhwb3J0ZXJzLmNhY2hlZCh0aGlzLCBleHBvcnRlckZvcm1hdCwgb3B0aW9ucylcbiAgfVxuICBcbiAgZ2V0IGNhY2hlS2V5KCl7XG4gICAgaWYoX19jYWNoZUtleXNbdGhpcy5yb290XSl7IHJldHVybiBfX2NhY2hlS2V5c1t0aGlzLnJvb3RdIH1cbiAgICByZXR1cm4gX19jYWNoZUtleXNbdGhpcy5yb290XSA9IHRoaXMuY29tcHV0ZUNhY2hlS2V5KClcbiAgfVxuXG4gIGNvbXB1dGVDYWNoZUtleSgpe1xuICAgIGxldCBtb2RpZmllZFRpbWVzID0gdGhpcy5nZXRBbGxNb2RlbHMoKS5tYXAobW9kZWwgPT4gbW9kZWwubGFzdE1vZGlmaWVkQXQoKSkuc29ydCgpXG4gICAgbGV0IGxhdGVzdCA9IG1vZGlmaWVkVGltZXNbbW9kaWZpZWRUaW1lcy5sZW5ndGggLSAxXVxuICAgIHJldHVybiBbdGhpcy5uYW1lLCBtb2RpZmllZFRpbWVzLmxlbmd0aCwgbGF0ZXN0XS5qb2luKCc6JylcbiAgfVxuICBcbiAgaXNTdGFsZSgpe1xuICAgIHJldHVybiB0aGlzLmNhY2hlS2V5ICE9PSB0aGlzLmNvbXB1dGVDYWNoZUtleSgpXG4gIH1cbiAgXG4gIHNldHVwKCl7XG4gICAgdGhpcy5wbHVnaW5OYW1lcyA9IFtdXG5cbiAgICByZXF1aXJlKCcuL2luZGV4JykucGx1Z2lucy5mb3JFYWNoKG1vZGlmaWVyID0+IHtcbiAgICAgIHRoaXMucGx1Z2luTmFtZXMucHVzaChtb2RpZmllci5wbHVnaW5fbmFtZSB8fCBtb2RpZmllci5wbHVnaW5OYW1lKVxuICAgICAgbW9kaWZpZXIodGhpcylcbiAgICB9KVxuICAgIFxuICAgIGxvYWRNb2RlbERlZmluaXRpb25zKHRoaXMpXG4gIH1cbiAgXG4gIC8qKlxuICAqIHVzZSBhIHBsdWdpbiB0byBsb2FkIG1vZHVsZXMsIGFjdGlvbnMsIENMSSBoZWxwZXJzLCBldGNcbiAgKi9cbiAgdXNlKHBsdWdpbiwgb3B0aW9ucz17fSl7XG4gICAgYnJpZWYudXNlKHBsdWdpbilcbiAgICB0aGlzLnNldHVwKClcbiAgICByZXR1cm4gdGhpc1xuICB9XG5cbiAgLyoqXG4gICAqIGdldCBtb2RlbCBhdCB0aGUgZ2l2ZW4gcmVsYXRpdmUgcGF0aCBcbiAgICogXG4gICAqIEBleGFtcGxlXG4gICAqICBicmllZmNhc2UuYXQoJ2VwaWNzL21vZGVsLWRlZmluaXRpb24tZHNsJylcbiAgKi9cbiAgYXQocGF0aF9hbGlhcywgYWJzb2x1dGU9ZmFsc2UpIHtcbiAgICBsZXQgZG9jc19wYXRoID0gcGF0aC5yZXNvbHZlKHRoaXMuY29uZmlnLmRvY3NfcGF0aClcblxuICAgIGlmKGFic29sdXRlKXsgcGF0aF9hbGlhcyA9IHBhdGhfYWxpYXMucmVwbGFjZShkb2NzX3BhdGgsICcnKSB9XG5cbiAgICBpZighcGF0aF9hbGlhcy5tYXRjaCgvXFwubWQkL2kpKXtcbiAgICAgIHBhdGhfYWxpYXMgPSBwYXRoX2FsaWFzICsgJy5tZCcgXG4gICAgfVxuXG4gICAgcmV0dXJuIHRoaXMuaW5kZXhbcGF0aF9hbGlhcy5yZXBsYWNlKC9eXFwvLywnJyldXG4gIH1cblxuICBmaW5kRG9jdW1lbnRCeVBhdGgocGF0aCl7XG4gICAgcmV0dXJuIHRoaXMuYXRQYXRoKHBhdGhfYWxpYXMsIHRydWUpXG4gIH1cbiAgLyoqXG4gICogZ2V0IG1vZGVscyBhdCBlYWNoIG9mIHRoZSBwYXRocyByZXByZXNlbnRlZFxuICAqIGJ5IHRoZSBnbG9iIHBhdHRlcm4gcGFzc2VkIGhlcmUuXG4gICovXG4gIGdsb2IocGF0dGVybj1cIioqLyoubWRcIikge1xuICAgIGxldCBtYXRjaGluZ0ZpbGVzID0gZ2xvYi5zeW5jKHBhdGguam9pbih0aGlzLnJvb3QsIHBhdHRlcm4pKVxuICAgIHJldHVybiBtYXRjaGluZ0ZpbGVzLm1hcChwYXRoID0+IHRoaXMuYXQocGF0aCx0cnVlKSkgXG4gIH1cblxuICAvKipcbiAgICogZmlsdGVycyBhbGwgYXZhaWxhYmxlIG1vZGVscyBieSB0aGUgZ2l2ZW4gaXRlcmF0b3JcbiAgICpcbiAgICogQGV4YW1wbGVcbiAgICogIGJyaWVmY2FzZS5maWx0ZXJBbGwobW9kZWwgPT4gbW9kZWwuc3RhdHVzID09PSAnYWN0aXZlJylcbiAgKi9cbiAgZmlsdGVyQWxsIChpdGVyYXRvcikge1xuICAgIHJldHVybiB0aGlzLmdldEFsbE1vZGVscygpLmZpbHRlcihpdGVyYXRvcilcbiAgfVxuICBcbiAgZmluZE1vZGVsc0J5RGVmaW5pdGlvbihkZWZpbml0aW9uKXtcbiAgICBsZXQgZ3JvdXBOYW1lID0gZGVmaW5pdGlvbi5ncm91cE5hbWVcbiAgICByZXR1cm4gdGhpcy5maWx0ZXJBbGwobW9kZWwgPT4gbW9kZWwuZ3JvdXBOYW1lID09PSBncm91cE5hbWUpXG4gIH1cbiAgIFxuICAvKipcbiAgICogZmlsdGVycyBtb2RlbHMgYnkgdGhlIHByb3BlcnR5IGFuZCBkZXNpcmVkIHZhbHVlXG4gICAqIFxuICAgKiBAcGFyYW0ge3N0cmluZ30gcHJvcGVydHkgLSBuYW1lIG9mIHRoZSBwcm9wZXJ0eSB0byBmaWx0ZXIgb24gXG4gICAqIEBwYXJhbSB7YW55fSBkZXNpcmVkVmFsdWUgLSB0aGUgdmFsdWUgdG8gbWF0Y2ggYWdhaW5zdFxuICAgKlxuICAgKiBAcmV0dXJuIHthcnJheX0gLSBtb2RlbHMgd2hvc2UgcHJvcGVydHkgbWF0Y2hlcyBkZXNpcmVkVmFsdWUgXG4gICovXG4gIGZpbHRlckFsbEJ5UHJvcGVydHkgKHByb3BlcnR5LCBkZXNpcmVkVmFsdWUpIHtcbiAgICByZXR1cm4gdGhpcy5maWx0ZXJBbGwobW9kZWwgPT4gbW9kZWxbcHJvcGVydHldID09PSBkZXNpcmVkVmFsdWUpXG4gIH1cbiAgXG4gIC8qKlxuICAgKiBzZWxlY3RzIGFsbCB0aGUgbW9kZWxzIHdob3NlIHR5cGUgbWF0Y2hlcyB0aGUgc3VwcGxpZWQgYXJnIFxuICAqL1xuICBzZWxlY3RNb2RlbHNCeVR5cGUodHlwZSkge1xuICAgIHJldHVybiB0aGlzLmZpbHRlckFsbEJ5UHJvcGVydHkoJ3R5cGUnLCB0eXBlKVxuICB9XG5cbiAgLyoqXG4gICAqIHNlbGVjdHMgYWxsIHRoZSBtb2RlbHMgd2hvc2UgZ3JvdXBOYW1lIG1hdGNoZXMgdGhlIHN1cHBsaWVkIGFyZyBcbiAgKi9cbiAgc2VsZWN0TW9kZWxzQnlHcm91cChncm91cE5hbWUpIHtcbiAgICByZXR1cm4gdGhpcy5maWx0ZXJBbGxCeVByb3BlcnR5KCdncm91cE5hbWUnLCBncm91cE5hbWUpXG4gIH1cbiAgXG4gIC8qKlxuICAgKiByZXR1cm5zIGFsbCB0aGUgbW9kZWxzIGluIHRoaXMgYnJpZWZjYXNlXG4gICovXG4gIGdldEFsbE1vZGVscygpIHtcbiAgICByZXR1cm4gT2JqZWN0LmtleXModGhpcy5pbmRleCkubWFwKGtleSA9PiB0aGlzLmluZGV4W2tleV0pXG4gIH1cbiAgXG4gIC8qKlxuICAgKiByZXR1cm5zIHRoZSByYXcgZG9jdW1lbnRzIGluIHRoaXMgYnJpZWZjYXNlXG4gICovXG4gIGdldEFsbERvY3VtZW50cyAoKSB7XG4gICAgcmV0dXJuIHRoaXMuZ2V0QWxsTW9kZWxzKCkubWFwKG1vZGVsID0+IG1vZGVsLmRvY3VtZW50KVxuICB9XG4gIFxuICAvKipcbiAgKiBBcmNoaXZlcyB0aGUgYnJpZWZjYXNlIGludG8gYSB6aXAgZmlsZS4gQnJpZWZjYXNlc1xuICAqIGNhbiBiZSBjcmVhdGVkIGRpcmVjdGx5IGZyb20gemlwIGZpbGVzIGluIHRoZSBmdXR1cmUuXG4gICpcbiAgKiBAcGFyYW0ge3N0cmluZ30gbG9jYXRpb24gLSB3aGVyZSB0byBzdG9yZSB0aGUgZmlsZT9cbiAgKiBAcGFyYW0ge2FycmF5fSBpZ25vcmUgLSBhIGxpc3Qgb2YgZmlsZXMgdG8gaWdub3JlIGFuZCBub3QgcHV0IGluIHRoZVxuICAqICAgYXJjaGl2ZVxuICAqL1xuICBhcmNoaXZlKGxvY2F0aW9uLCBpZ25vcmU9W10pIHtcbiAgICBsb2NhdGlvbiA9IGxvY2F0aW9uIHx8IFxuICAgIGlnbm9yZS5wdXNoKGxvY2F0aW9uKVxuXG4gICAgbmV3IFBhY2thZ2VyKHRoaXMsIGlnbm9yZSkucGVyc2lzdChsb2NhdGlvbilcbiAgfVxuICBcbiAgZ2V0R3JvdXBOYW1lcyAoKSB7XG4gICAgcmV0dXJuIE9iamVjdC5rZXlzKHRoaXMubW9kZWxfZGVmaW5pdGlvbnMpLm1hcChuYW1lID0+IGluZmxlY3QucGx1cmFsaXplKG5hbWUudG9Mb3dlckNhc2UoKSkpXG4gIH1cblxuICBnZXREb2N1bWVudFR5cGVzICgpIHtcbiAgICByZXR1cm4gT2JqZWN0LmtleXModGhpcy5tb2RlbF9kZWZpbml0aW9ucykubWFwKG5hbWUgPT4gaW5mbGVjdC51bmRlcnNjb3JlKG5hbWUudG9Mb3dlckNhc2UoKSkpXG4gIH1cbiAgXG4gIGxvYWRNb2RlbERlZmluaXRpb24ocGF0aCl7XG4gICAgcmV0dXJuIHRoaXMubG9hZE1vZGVsKE1vZGVsRGVmaW5pdGlvbi5sb2FkKHBhdGgpKVxuICB9XG5cbiAgbG9hZE1vZGVsIChkZWZpbml0aW9uKSB7XG4gICAgdGhpcy5tb2RlbF9kZWZpbml0aW9uc1tkZWZpbml0aW9uLm5hbWVdID0gdHJ1ZSBcbiAgICByZXR1cm4gZGVmaW5pdGlvblxuICB9XG5cbiAgbG9hZGVkTW9kZWxEZWZpbml0aW9ucyAoKSB7XG4gICAgcmV0dXJuIE9iamVjdC5rZXlzKHRoaXMubW9kZWxfZGVmaW5pdGlvbnMpXG4gIH1cblxuICBnZXRNb2RlbERlZmluaXRpb25zICgpIHsgXG4gICAgcmV0dXJuIE1vZGVsRGVmaW5pdGlvbi5nZXRBbGwoKVxuICB9XG5cbiAgZ2V0TW9kZWxEZWZpbml0aW9uIChtb2RlbE5hbWVPckFsaWFzKSB7XG4gICAgcmV0dXJuIE1vZGVsRGVmaW5pdGlvbi5sb29rdXAobW9kZWxOYW1lT3JBbGlhcylcbiAgfVxuXG4gIGdldFR5cGVBbGlhc2VzICgpe1xuICAgIHJldHVybiBNb2RlbERlZmluaXRpb24uZ2V0VHlwZUFsaWFzZXMoKVxuICB9XG5cbiAgZ2V0TW9kZWxTY2hlbWEgKCkge1xuICAgIHJldHVybiBNb2RlbERlZmluaXRpb24uZ2V0TW9kZWxTY2hlbWEoKVxuICB9XG5cbiAgZ2V0QWxsRmlsZXModXNlQWJzb2x1dGVQYXRocz1mYWxzZSl7XG4gICAgbGV0IGFsbEZpbGVzID0gZ2xvYi5zeW5jKHBhdGguam9pbih0aGlzLnJvb3QsICcqKi8qJykpXG4gICAgcmV0dXJuIHVzZUFic29sdXRlUGF0aHMgPyBhbGxGaWxlcyA6IGFsbEZpbGVzLm1hcChmID0+IGYucmVwbGFjZSh0aGlzLnJvb3QgKyAnLycsICcnKSlcbiAgfVxuIFxuIFxuICBfZ2V0RG9jdW1lbnRQYXRocygpIHtcbiAgICBsZXQgZG9jc19wYXRoID0gcGF0aC5yZXNvbHZlKHRoaXMuY29uZmlnLmRvY3NfcGF0aClcbiAgICByZXR1cm4gZ2xvYi5zeW5jKHBhdGguam9pbihkb2NzX3BhdGgsJyoqLyoubWQnKSlcbiAgfVxuXG59XG5cbmZ1bmN0aW9uIGJ1aWxkSW5kZXhGcm9tRGlzayhicmllZmNhc2UpIHtcbiAgbGV0IHBhdGhzID0gYnJpZWZjYXNlLl9nZXREb2N1bWVudFBhdGhzKClcbiAgbGV0IGluZGV4ID0ge31cblxuICBwYXRocy5mb3JFYWNoKChwYXRoKT0+e1xuICAgIGxldCBwYXRoX2FsaWFzID0gcGF0aC5yZXBsYWNlKGJyaWVmY2FzZS5jb25maWcuZG9jc19wYXRoICsgJy8nLCAnJylcbiAgICBsZXQgaWQgPSBwYXRoX2FsaWFzLnJlcGxhY2UoJy5tZCcsJycpXG4gICAgbGV0IGRvY3VtZW50ID0gbmV3IERvY3VtZW50KHBhdGgsIHtpZDogaWR9KVxuICAgIGxldCBtb2RlbCA9IGRvY3VtZW50LnRvTW9kZWwoe2lkOiBpZH0pIFxuICAgIFxuICAgIGRvY3VtZW50LmlkID0gcGF0aF9hbGlhc1xuICAgIGRvY3VtZW50LnJlbGF0aXZlX3BhdGggPSAnZG9jcy8nICsgcGF0aF9hbGlhc1xuICAgIG1vZGVsLmlkID0gaWRcbiAgICBtb2RlbC5nZXRQYXJlbnQgPSAoKT0+eyByZXR1cm4gYnJpZWZjYXNlIH1cbiAgICBpbmRleFtwYXRoX2FsaWFzXSA9IG1vZGVsXG4gIH0pXG5cbiAgcmV0dXJuIGluZGV4XG59XG5cbmZ1bmN0aW9uIGxvYWRNb2RlbERlZmluaXRpb25zKGJyaWVmY2FzZSl7XG4gIE1vZGVsRGVmaW5pdGlvbi5sb2FkRGVmaW5pdGlvbnNGcm9tUGF0aChicmllZmNhc2UuY29uZmlnLm1vZGVsc19wYXRoKVxuXG4gIE1vZGVsRGVmaW5pdGlvbi5nZXRBbGwoKS5mb3JFYWNoKGZ1bmN0aW9uKGRlZmluaXRpb24pe1xuICAgIGJyaWVmY2FzZS5sb2FkTW9kZWwoZGVmaW5pdGlvbilcbiAgICBjcmVhdGVDb2xsZWN0aW9uKGJyaWVmY2FzZSwgZGVmaW5pdGlvbilcbiAgfSlcblxuICBNb2RlbERlZmluaXRpb24uZmluYWxpemUoKVxufVxuXG5mdW5jdGlvbiBjcmVhdGVDb2xsZWN0aW9uKGJyaWVmY2FzZSwgbW9kZWxEZWZpbml0aW9uKXtcbiAgbGV0IHtncm91cE5hbWUsIHR5cGVfYWxpYXN9ID0gbW9kZWxEZWZpbml0aW9uXG4gIFxuICB0cnkge1xuICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShicmllZmNhc2UsIGdyb3VwTmFtZSwge1xuICAgICAgZ2V0OiBmdW5jdGlvbigpe1xuICAgICAgICBpZihicmllZmNhc2UuY29sbGVjdGlvbnNbZ3JvdXBOYW1lXSl7XG4gICAgICAgICAgcmV0dXJuIGJyaWVmY2FzZS5jb2xsZWN0aW9uc1tncm91cE5hbWVdXG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gYnJpZWZjYXNlLmNvbGxlY3Rpb25zW2dyb3VwTmFtZV0gPSBjb2xsZWN0aW9uKGZ1bmN0aW9uKCl7XG4gICAgICAgICAgcmV0dXJuIGJyaWVmY2FzZS5zZWxlY3RNb2RlbHNCeVR5cGUodHlwZV9hbGlhcylcbiAgICAgICAgfSwgbW9kZWxEZWZpbml0aW9uKVxuICAgICAgfVxuICAgIH0pXG5cbiAgfSBjYXRjaChlKXtcblxuICB9XG59XG5cbiJdfQ==