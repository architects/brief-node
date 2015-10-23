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

var _document = require('./document');

var _document2 = _interopRequireDefault(_document);

var _collection = require('./collection');

var _collection2 = _interopRequireDefault(_collection);

var _model = require('./model');

var _model2 = _interopRequireDefault(_model);

var _model_definition = require('./model_definition');

var _model_definition2 = _interopRequireDefault(_model_definition);

var _i = require('i');

var _i2 = _interopRequireDefault(_i);

var _packager = require('./packager');

var _packager2 = _interopRequireDefault(_packager);

var _exporters = require('./exporters');

var _exporters2 = _interopRequireDefault(_exporters);

var _underscore = require('underscore');

var _underscore2 = _interopRequireDefault(_underscore);

var inflect = (0, _i2['default'])(true);
var pluralize = inflect.pluralize;

var __cache = {};

var Briefcase = (function () {
  _createClass(Briefcase, null, [{
    key: 'load',

    /**
    * Load a briefcase by passing a path to a root folder.
    *
    * @param {string} rootPath - the root path of the briefcase.
    * @return {Briefcase} - returns a briefcase
    *
    */
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
  }, {
    key: 'instances',
    value: function instances() {
      return Object.keys(__cache).map(function (path) {
        return __cache[path];
      });
    }

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
  }]);

  function Briefcase(root, options) {
    _classCallCheck(this, Briefcase);

    this.root = _path2['default'].resolve(root);
    this.name = options.name || _path2['default'].basename(root);
    this.parentFolder = _path2['default'].dirname(root);

    this.options = options || {};

    this.index = {};
    this.model_definitions = {};

    this.config = {
      docs_path: _path2['default'].join(this.root, 'docs'),
      models_path: _path2['default'].join(this.root, 'models'),
      assets_path: _path2['default'].join(this.root, 'assets')
    };

    this.setup();
    __cache[this.root] = this;
  }

  // Returns the manifest data from the package.json manifest

  _createClass(Briefcase, [{
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
      return this.cacheKey != this.computeCacheKey();
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

      this._loadModelDefinitions();
      this._buildIndexFromDisk();
      this._createCollections();

      this.cacheKey = this.computeCacheKey();
    }

    /**
    * use a plugin to load modules, actions, CLI helpers, etc
    */
  }, {
    key: 'use',
    value: function use(plugin) {
      var options = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

      brief.use(plugin);
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
      var types = this.getDocumentTypes();
      return types.map(function (type) {
        return pluralize(type || "");
      });
    }
  }, {
    key: 'getDocumentTypes',
    value: function getDocumentTypes() {
      var types = [];

      this.getAllDocuments().forEach(function (doc) {
        types.push(doc.getType());
      });

      return (0, _underscore2['default'])(types).uniq();
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
    key: '_createCollections',
    value: function _createCollections() {
      var _this5 = this;

      var briefcase = this;

      this.getDocumentTypes().forEach(function (type) {
        var group = pluralize(type);
        var definition = _this5.getModelDefinition(type);

        var fetch = function fetch() {
          return _this5.selectModelsByType(type);
        };

        briefcase[group] = briefcase[group] || (0, _collection2['default'])(fetch, definition);
      });
    }
  }, {
    key: '_getDocumentPaths',
    value: function _getDocumentPaths() {
      var docs_path = _path2['default'].resolve(this.config.docs_path);
      return _globAll2['default'].sync(_path2['default'].join(docs_path, '**/*.md'));
    }
  }, {
    key: '_loadModelDefinitions',
    value: function _loadModelDefinitions() {
      var _this6 = this;

      _model_definition2['default'].loadDefinitionsFromPath(this.config.models_path);
      _model_definition2['default'].getAll().forEach(function (definition) {
        return _this6.loadModel(definition);
      });
      _model_definition2['default'].finalize();
    }
  }, {
    key: '_buildIndexFromDisk',
    value: function _buildIndexFromDisk() {
      var _this7 = this;

      var paths = this._getDocumentPaths();
      var briefcase = this;

      paths.forEach(function (path) {
        var path_alias = path.replace(_this7.config.docs_path + '/', '');
        var id = path_alias.replace('.md', '');
        var document = new _document2['default'](path, { id: id });
        var model = document.toModel({ id: id });

        document.id = path_alias;
        document.relative_path = 'docs/' + path_alias;
        model.id = id;
        model.getParent = function () {
          return _this7;
        };

        _this7.index[path_alias] = model;
      });
    }
  }, {
    key: 'manifest',
    get: function get() {
      if (_fs2['default'].existsSync(_path2['default'].join(this.root, 'package.json'))) {
        return JSON.parse(_fs2['default'].readFileSync(_path2['default'].join(this.root, 'package.json')));
      }
    }
  }]);

  return Briefcase;
})();

exports['default'] = Briefcase;
module.exports = exports['default'];
//# sourceMappingURL=data:application/json;base64,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ZWZjYXNlLmpzIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IGZzIGZyb20gJ2ZzJ1xuaW1wb3J0IGdsb2IgZnJvbSAnZ2xvYi1hbGwnXG5pbXBvcnQgcGF0aCBmcm9tICdwYXRoJ1xuaW1wb3J0IERvY3VtZW50IGZyb20gJy4vZG9jdW1lbnQnXG5pbXBvcnQgY29sbGVjdGlvbiBmcm9tICcuL2NvbGxlY3Rpb24nXG5pbXBvcnQgTW9kZWwgZnJvbSAnLi9tb2RlbCdcbmltcG9ydCBNb2RlbERlZmluaXRpb24gZnJvbSAnLi9tb2RlbF9kZWZpbml0aW9uJ1xuaW1wb3J0IGluZmxlY3Rpb25zIGZyb20gJ2knXG5pbXBvcnQgUGFja2FnZXIgZnJvbSAnLi9wYWNrYWdlcidcbmltcG9ydCBleHBvcnRlcnMgZnJvbSAnLi9leHBvcnRlcnMnXG5pbXBvcnQgXyBmcm9tICd1bmRlcnNjb3JlJ1xuXG5cbmNvbnN0IGluZmxlY3QgPSBpbmZsZWN0aW9ucyh0cnVlKVxuY29uc3QgcGx1cmFsaXplID0gaW5mbGVjdC5wbHVyYWxpemVcblxuY29uc3QgX19jYWNoZSA9IHt9XG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIEJyaWVmY2FzZSB7XG4gIC8qKlxuICAqIExvYWQgYSBicmllZmNhc2UgYnkgcGFzc2luZyBhIHBhdGggdG8gYSByb290IGZvbGRlci5cbiAgKlxuICAqIEBwYXJhbSB7c3RyaW5nfSByb290UGF0aCAtIHRoZSByb290IHBhdGggb2YgdGhlIGJyaWVmY2FzZS5cbiAgKiBAcmV0dXJuIHtCcmllZmNhc2V9IC0gcmV0dXJucyBhIGJyaWVmY2FzZVxuICAqXG4gICovXG4gIHN0YXRpYyBsb2FkKHJvb3RQYXRoLCBvcHRpb25zPXt9KSB7XG4gICAgcmV0dXJuIG5ldyBCcmllZmNhc2Uocm9vdFBhdGgsb3B0aW9ucylcbiAgfVxuIFxuICAvKipcbiAgKiBGaW5kIHRoZSBCcmllZmNhc2UgaW5zdGFuY2UgcmVzcG9uc2libGUgZm9yIGEgcGFydGljdWxhciBwYXRoLlxuICAqIE1vZGVscyBhbmQgRG9jdW1lbnRzIHdpbGwgdXNlIHRoaXMgdG8gZmluZCB0aGUgQnJpZWZjYXNlIHRoZXlcbiAgKiBiZWxvbmcgdG8gXG4gICpcbiAgKiBAcGFyYW0ge3BhdGh9IHBhdGggLSB0aGUgcGF0aCBvZiB0aGUgZG9jdW1lbnQgd2hpY2ggd2FudHMgdG8ga25vd1xuICAqL1xuICBzdGF0aWMgZmluZEZvclBhdGgoY2hlY2tQYXRoPVwiXCIpe1xuICAgIGxldCBtYXRjaGluZ1BhdGggPSBPYmplY3Qua2V5cyhfX2NhY2hlKS5maW5kKHAgPT4gY2hlY2tQYXRoLm1hdGNoKHApKVxuICAgIHJldHVybiBfX2NhY2hlW21hdGNoaW5nUGF0aF1cbiAgfVxuICBcbiAgc3RhdGljIGluc3RhbmNlcygpe1xuICAgIHJldHVybiBPYmplY3Qua2V5cyhfX2NhY2hlKS5tYXAocGF0aCA9PiBfX2NhY2hlW3BhdGhdKVxuICB9XG4gIC8qKlxuICAqIENyZWF0ZSBhIG5ldyBCcmllZmNhc2Ugb2JqZWN0IGF0IHRoZSBzcGVjaWZpZWQgcm9vdCBwYXRoLlxuICAqXG4gICogQHBhcmFtIHtwYXRofSByb290IC0gdGhlIHJvb3QgcGF0aCBvZiB0aGUgYnJpZWZjYXNlLiBleHBlY3RzXG4gICogICB0byBmaW5kIGEgY29uZmlnIGZpbGUgXCJicmllZi5jb25maWcuanNcIiwgYW5kIGF0IGxlYXN0IGEgXG4gICogICBkb2N1bWVudHMgZm9sZGVyLlxuICAqXG4gICogQHBhcmFtIHtvcHRpb25zfSBvcHRpb25zIC0gb3B0aW9ucyB0byBvdmVycmlkZSBkZWZhdWx0IGJlaGF2aW9yLlxuICAqIEBwYXJhbSB7cGF0aH0gZG9jc19wYXRoIC0gd2hpY2ggZm9sZGVyIGNvbnRhaW5zIHRoZSBkb2N1bWVudHMuXG4gICogQHBhcmFtIHtwYXRofSBtb2RlbHNfcGF0aCAtIHdoaWNoIGZvbGRlciBjb250YWlucyB0aGUgbW9kZWxzIHRvIHVzZS5cbiAgKiBAcGFyYW0ge3BhdGh9IGFzc2V0c19wYXRoIC0gd2hpY2ggZm9sZGVyIGNvbnRhaW5zIHRoZSBhc3NldHMgdG8gdXNlIGlmIGFueS5cbiAgKi9cbiAgY29uc3RydWN0b3Iocm9vdCwgb3B0aW9ucykge1xuICAgIHRoaXMucm9vdCAgICAgICAgID0gcGF0aC5yZXNvbHZlKHJvb3QpXG4gICAgdGhpcy5uYW1lICAgICAgICAgPSBvcHRpb25zLm5hbWUgfHwgcGF0aC5iYXNlbmFtZShyb290KVxuICAgIHRoaXMucGFyZW50Rm9sZGVyID0gcGF0aC5kaXJuYW1lKHJvb3QpXG5cbiAgICB0aGlzLm9wdGlvbnMgPSBvcHRpb25zIHx8IHt9XG4gICAgXG4gICAgdGhpcy5pbmRleCA9IHt9XG4gICAgdGhpcy5tb2RlbF9kZWZpbml0aW9ucyA9IHt9XG4gICAgXG4gICAgdGhpcy5jb25maWcgPSB7XG4gICAgICBkb2NzX3BhdGg6IHBhdGguam9pbih0aGlzLnJvb3QsICdkb2NzJyksXG4gICAgICBtb2RlbHNfcGF0aDogcGF0aC5qb2luKHRoaXMucm9vdCwgJ21vZGVscycpLFxuICAgICAgYXNzZXRzX3BhdGg6IHBhdGguam9pbih0aGlzLnJvb3QsICdhc3NldHMnKVxuICAgIH1cbiAgICBcbiAgICB0aGlzLnNldHVwKClcbiAgICBfX2NhY2hlW3RoaXMucm9vdF0gPSB0aGlzXG4gIH1cbiAgXG4gIC8vIFJldHVybnMgdGhlIG1hbmlmZXN0IGRhdGEgZnJvbSB0aGUgcGFja2FnZS5qc29uIG1hbmlmZXN0XG4gIGdldCBtYW5pZmVzdCgpe1xuICAgIGlmKGZzLmV4aXN0c1N5bmMocGF0aC5qb2luKHRoaXMucm9vdCwgJ3BhY2thZ2UuanNvbicpKSl7XG4gICAgICByZXR1cm4gSlNPTi5wYXJzZShmcy5yZWFkRmlsZVN5bmMocGF0aC5qb2luKHRoaXMucm9vdCwgJ3BhY2thZ2UuanNvbicpKSlcbiAgICB9XG4gIH1cbiAgXG4gIGV4cG9ydFdpdGgoZXhwb3J0ZXJGb3JtYXQ9XCJzdGFuZGFyZFwiLCBvcHRpb25zID0ge30pe1xuICAgIHJldHVybiBleHBvcnRlcnMuY2FjaGVkKHRoaXMsIGV4cG9ydGVyRm9ybWF0LCBvcHRpb25zKVxuICB9XG5cbiAgY29tcHV0ZUNhY2hlS2V5KCl7XG4gICAgbGV0IG1vZGlmaWVkVGltZXMgPSB0aGlzLmdldEFsbE1vZGVscygpLm1hcChtb2RlbCA9PiBtb2RlbC5sYXN0TW9kaWZpZWRBdCgpKS5zb3J0KClcbiAgICBsZXQgbGF0ZXN0ID0gbW9kaWZpZWRUaW1lc1ttb2RpZmllZFRpbWVzLmxlbmd0aCAtIDFdXG4gICAgcmV0dXJuIFt0aGlzLm5hbWUsIG1vZGlmaWVkVGltZXMubGVuZ3RoLCBsYXRlc3RdLmpvaW4oJzonKVxuICB9XG4gIFxuICBpc1N0YWxlKCl7XG4gICAgcmV0dXJuICh0aGlzLmNhY2hlS2V5ICE9IHRoaXMuY29tcHV0ZUNhY2hlS2V5KCkpXG4gIH1cbiAgXG4gIHNldHVwKCl7XG4gICAgdGhpcy5wbHVnaW5OYW1lcyA9IFtdXG4gICAgcmVxdWlyZSgnLi9pbmRleCcpLnBsdWdpbnMuZm9yRWFjaChtb2RpZmllciA9PiB7XG4gICAgICB0aGlzLnBsdWdpbk5hbWVzLnB1c2gobW9kaWZpZXIucGx1Z2luX25hbWUgfHwgbW9kaWZpZXIucGx1Z2luTmFtZSlcbiAgICAgIG1vZGlmaWVyKHRoaXMpXG4gICAgfSlcbiAgICBcbiAgICB0aGlzLl9sb2FkTW9kZWxEZWZpbml0aW9ucygpXG4gICAgdGhpcy5fYnVpbGRJbmRleEZyb21EaXNrKClcbiAgICB0aGlzLl9jcmVhdGVDb2xsZWN0aW9ucygpXG5cbiAgICB0aGlzLmNhY2hlS2V5ID0gdGhpcy5jb21wdXRlQ2FjaGVLZXkoKVxuICB9XG4gIFxuICAvKipcbiAgKiB1c2UgYSBwbHVnaW4gdG8gbG9hZCBtb2R1bGVzLCBhY3Rpb25zLCBDTEkgaGVscGVycywgZXRjXG4gICovXG4gIHVzZShwbHVnaW4sIG9wdGlvbnM9e30pe1xuICAgIGJyaWVmLnVzZShwbHVnaW4pXG4gICAgdGhpcy5zZXR1cCgpXG4gICAgcmV0dXJuIHRoaXNcbiAgfVxuXG4gIC8qKlxuICAgKiBnZXQgbW9kZWwgYXQgdGhlIGdpdmVuIHJlbGF0aXZlIHBhdGggXG4gICAqIFxuICAgKiBAZXhhbXBsZVxuICAgKiAgYnJpZWZjYXNlLmF0KCdlcGljcy9tb2RlbC1kZWZpbml0aW9uLWRzbCcpXG4gICovXG4gIGF0KHBhdGhfYWxpYXMsIGFic29sdXRlPWZhbHNlKSB7XG4gICAgbGV0IGRvY3NfcGF0aCA9IHBhdGgucmVzb2x2ZSh0aGlzLmNvbmZpZy5kb2NzX3BhdGgpXG5cbiAgICBpZihhYnNvbHV0ZSl7IHBhdGhfYWxpYXMgPSBwYXRoX2FsaWFzLnJlcGxhY2UoZG9jc19wYXRoLCAnJykgfVxuXG4gICAgaWYoIXBhdGhfYWxpYXMubWF0Y2goL1xcLm1kJC9pKSl7XG4gICAgICBwYXRoX2FsaWFzID0gcGF0aF9hbGlhcyArICcubWQnIFxuICAgIH1cblxuICAgIHJldHVybiB0aGlzLmluZGV4W3BhdGhfYWxpYXMucmVwbGFjZSgvXlxcLy8sJycpXVxuICB9XG5cbiAgZmluZERvY3VtZW50QnlQYXRoKHBhdGgpe1xuICAgIHJldHVybiB0aGlzLmF0UGF0aChwYXRoX2FsaWFzLCB0cnVlKVxuICB9XG4gIC8qKlxuICAqIGdldCBtb2RlbHMgYXQgZWFjaCBvZiB0aGUgcGF0aHMgcmVwcmVzZW50ZWRcbiAgKiBieSB0aGUgZ2xvYiBwYXR0ZXJuIHBhc3NlZCBoZXJlLlxuICAqL1xuICBnbG9iKHBhdHRlcm49XCIqKi8qLm1kXCIpIHtcbiAgICBsZXQgbWF0Y2hpbmdGaWxlcyA9IGdsb2Iuc3luYyhwYXRoLmpvaW4odGhpcy5yb290LCBwYXR0ZXJuKSlcbiAgICByZXR1cm4gbWF0Y2hpbmdGaWxlcy5tYXAocGF0aCA9PiB0aGlzLmF0KHBhdGgsdHJ1ZSkpIFxuICB9XG5cbiAgLyoqXG4gICAqIGZpbHRlcnMgYWxsIGF2YWlsYWJsZSBtb2RlbHMgYnkgdGhlIGdpdmVuIGl0ZXJhdG9yXG4gICAqXG4gICAqIEBleGFtcGxlXG4gICAqICBicmllZmNhc2UuZmlsdGVyQWxsKG1vZGVsID0+IG1vZGVsLnN0YXR1cyA9PT0gJ2FjdGl2ZScpXG4gICovXG4gIGZpbHRlckFsbCAoaXRlcmF0b3IpIHtcbiAgICByZXR1cm4gdGhpcy5nZXRBbGxNb2RlbHMoKS5maWx0ZXIoaXRlcmF0b3IpXG4gIH1cbiAgXG4gIGZpbmRNb2RlbHNCeURlZmluaXRpb24oZGVmaW5pdGlvbil7XG4gICAgbGV0IGdyb3VwTmFtZSA9IGRlZmluaXRpb24uZ3JvdXBOYW1lXG4gICAgcmV0dXJuIHRoaXMuZmlsdGVyQWxsKG1vZGVsID0+IG1vZGVsLmdyb3VwTmFtZSA9PT0gZ3JvdXBOYW1lKVxuICB9XG4gICBcbiAgLyoqXG4gICAqIGZpbHRlcnMgbW9kZWxzIGJ5IHRoZSBwcm9wZXJ0eSBhbmQgZGVzaXJlZCB2YWx1ZVxuICAgKiBcbiAgICogQHBhcmFtIHtzdHJpbmd9IHByb3BlcnR5IC0gbmFtZSBvZiB0aGUgcHJvcGVydHkgdG8gZmlsdGVyIG9uIFxuICAgKiBAcGFyYW0ge2FueX0gZGVzaXJlZFZhbHVlIC0gdGhlIHZhbHVlIHRvIG1hdGNoIGFnYWluc3RcbiAgICpcbiAgICogQHJldHVybiB7YXJyYXl9IC0gbW9kZWxzIHdob3NlIHByb3BlcnR5IG1hdGNoZXMgZGVzaXJlZFZhbHVlIFxuICAqL1xuICBmaWx0ZXJBbGxCeVByb3BlcnR5IChwcm9wZXJ0eSwgZGVzaXJlZFZhbHVlKSB7XG4gICAgcmV0dXJuIHRoaXMuZmlsdGVyQWxsKG1vZGVsID0+IG1vZGVsW3Byb3BlcnR5XSA9PT0gZGVzaXJlZFZhbHVlKVxuICB9XG4gIFxuICAvKipcbiAgICogc2VsZWN0cyBhbGwgdGhlIG1vZGVscyB3aG9zZSB0eXBlIG1hdGNoZXMgdGhlIHN1cHBsaWVkIGFyZyBcbiAgKi9cbiAgc2VsZWN0TW9kZWxzQnlUeXBlICh0eXBlKSB7XG4gICAgcmV0dXJuIHRoaXMuZmlsdGVyQWxsQnlQcm9wZXJ0eSgndHlwZScsIHR5cGUpXG4gIH1cblxuICAvKipcbiAgICogc2VsZWN0cyBhbGwgdGhlIG1vZGVscyB3aG9zZSBncm91cE5hbWUgbWF0Y2hlcyB0aGUgc3VwcGxpZWQgYXJnIFxuICAqL1xuICBzZWxlY3RNb2RlbHNCeUdyb3VwIChncm91cE5hbWUpIHtcbiAgICByZXR1cm4gdGhpcy5maWx0ZXJBbGxCeVByb3BlcnR5KCdncm91cE5hbWUnLCBncm91cE5hbWUpXG4gIH1cbiAgXG4gIC8qKlxuICAgKiByZXR1cm5zIGFsbCB0aGUgbW9kZWxzIGluIHRoaXMgYnJpZWZjYXNlXG4gICovXG4gIGdldEFsbE1vZGVscygpIHtcbiAgICByZXR1cm4gT2JqZWN0LmtleXModGhpcy5pbmRleCkubWFwKGtleSA9PiB0aGlzLmluZGV4W2tleV0pXG4gIH1cbiAgXG4gIC8qKlxuICAgKiByZXR1cm5zIHRoZSByYXcgZG9jdW1lbnRzIGluIHRoaXMgYnJpZWZjYXNlXG4gICovXG4gIGdldEFsbERvY3VtZW50cyAoKSB7XG4gICAgcmV0dXJuIHRoaXMuZ2V0QWxsTW9kZWxzKCkubWFwKG1vZGVsID0+IG1vZGVsLmRvY3VtZW50KVxuICB9XG4gIFxuICAvKipcbiAgKiBBcmNoaXZlcyB0aGUgYnJpZWZjYXNlIGludG8gYSB6aXAgZmlsZS4gQnJpZWZjYXNlc1xuICAqIGNhbiBiZSBjcmVhdGVkIGRpcmVjdGx5IGZyb20gemlwIGZpbGVzIGluIHRoZSBmdXR1cmUuXG4gICpcbiAgKiBAcGFyYW0ge3N0cmluZ30gbG9jYXRpb24gLSB3aGVyZSB0byBzdG9yZSB0aGUgZmlsZT9cbiAgKiBAcGFyYW0ge2FycmF5fSBpZ25vcmUgLSBhIGxpc3Qgb2YgZmlsZXMgdG8gaWdub3JlIGFuZCBub3QgcHV0IGluIHRoZVxuICAqICAgYXJjaGl2ZVxuICAqL1xuICBhcmNoaXZlKGxvY2F0aW9uLCBpZ25vcmU9W10pIHtcbiAgICBsb2NhdGlvbiA9IGxvY2F0aW9uIHx8IFxuICAgIGlnbm9yZS5wdXNoKGxvY2F0aW9uKVxuXG4gICAgbmV3IFBhY2thZ2VyKHRoaXMsIGlnbm9yZSkucGVyc2lzdChsb2NhdGlvbilcbiAgfVxuICBcbiAgZ2V0R3JvdXBOYW1lcyAoKSB7XG4gICAgbGV0IHR5cGVzID0gdGhpcy5nZXREb2N1bWVudFR5cGVzKClcbiAgICByZXR1cm4gdHlwZXMubWFwKHR5cGUgPT4gcGx1cmFsaXplKHR5cGUgfHwgXCJcIikpXG4gIH1cblxuICBnZXREb2N1bWVudFR5cGVzICgpIHtcbiAgICBsZXQgdHlwZXMgPSBbXVxuXG4gICAgdGhpcy5nZXRBbGxEb2N1bWVudHMoKS5mb3JFYWNoKChkb2MpPT57XG4gICAgICB0eXBlcy5wdXNoKGRvYy5nZXRUeXBlKCkpXG4gICAgfSlcblxuICAgIHJldHVybiBfKHR5cGVzKS51bmlxKClcbiAgfVxuICBcbiAgbG9hZE1vZGVsRGVmaW5pdGlvbihwYXRoKXtcbiAgICByZXR1cm4gdGhpcy5sb2FkTW9kZWwoTW9kZWxEZWZpbml0aW9uLmxvYWQocGF0aCkpXG4gIH1cblxuICBsb2FkTW9kZWwgKGRlZmluaXRpb24pIHtcbiAgICB0aGlzLm1vZGVsX2RlZmluaXRpb25zW2RlZmluaXRpb24ubmFtZV0gPSB0cnVlXG4gICAgcmV0dXJuIGRlZmluaXRpb25cbiAgfVxuXG4gIGxvYWRlZE1vZGVsRGVmaW5pdGlvbnMgKCkge1xuICAgIHJldHVybiBPYmplY3Qua2V5cyh0aGlzLm1vZGVsX2RlZmluaXRpb25zKVxuICB9XG5cbiAgZ2V0TW9kZWxEZWZpbml0aW9ucyAoKSB7IFxuICAgIHJldHVybiBNb2RlbERlZmluaXRpb24uZ2V0QWxsKClcbiAgfVxuXG4gIGdldE1vZGVsRGVmaW5pdGlvbiAobW9kZWxOYW1lT3JBbGlhcykge1xuICAgIHJldHVybiBNb2RlbERlZmluaXRpb24ubG9va3VwKG1vZGVsTmFtZU9yQWxpYXMpXG4gIH1cblxuICBnZXRUeXBlQWxpYXNlcyAoKXtcbiAgICByZXR1cm4gTW9kZWxEZWZpbml0aW9uLmdldFR5cGVBbGlhc2VzKClcbiAgfVxuXG4gIGdldE1vZGVsU2NoZW1hICgpIHtcbiAgICByZXR1cm4gTW9kZWxEZWZpbml0aW9uLmdldE1vZGVsU2NoZW1hKClcbiAgfVxuXG4gIGdldEFsbEZpbGVzKHVzZUFic29sdXRlUGF0aHM9ZmFsc2Upe1xuICAgIGxldCBhbGxGaWxlcyA9IGdsb2Iuc3luYyhwYXRoLmpvaW4odGhpcy5yb290LCAnKiovKicpKVxuICAgIHJldHVybiB1c2VBYnNvbHV0ZVBhdGhzID8gYWxsRmlsZXMgOiBhbGxGaWxlcy5tYXAoZiA9PiBmLnJlcGxhY2UodGhpcy5yb290ICsgJy8nLCAnJykpXG4gIH1cbiBcbiAgX2NyZWF0ZUNvbGxlY3Rpb25zKCkge1xuICAgIGNvbnN0IGJyaWVmY2FzZSA9IHRoaXNcblxuICAgIHRoaXMuZ2V0RG9jdW1lbnRUeXBlcygpLmZvckVhY2godHlwZSA9PiB7XG4gICAgICBsZXQgZ3JvdXAgICAgICAgPSBwbHVyYWxpemUodHlwZSlcbiAgICAgIGxldCBkZWZpbml0aW9uICA9IHRoaXMuZ2V0TW9kZWxEZWZpbml0aW9uKHR5cGUpXG4gICAgICBcbiAgICAgIGxldCBmZXRjaCA9ICgpPT4ge1xuICAgICAgICByZXR1cm4gdGhpcy5zZWxlY3RNb2RlbHNCeVR5cGUodHlwZSlcbiAgICAgIH1cblxuICAgICAgYnJpZWZjYXNlW2dyb3VwXSA9IGJyaWVmY2FzZVtncm91cF0gfHwgY29sbGVjdGlvbihmZXRjaCwgZGVmaW5pdGlvbikgXG4gICAgfSlcbiAgfVxuIFxuICBfZ2V0RG9jdW1lbnRQYXRocygpIHtcbiAgICBsZXQgZG9jc19wYXRoID0gcGF0aC5yZXNvbHZlKHRoaXMuY29uZmlnLmRvY3NfcGF0aClcbiAgICByZXR1cm4gZ2xvYi5zeW5jKHBhdGguam9pbihkb2NzX3BhdGgsJyoqLyoubWQnKSlcbiAgfVxuXG4gIF9sb2FkTW9kZWxEZWZpbml0aW9ucygpe1xuICAgIE1vZGVsRGVmaW5pdGlvbi5sb2FkRGVmaW5pdGlvbnNGcm9tUGF0aCh0aGlzLmNvbmZpZy5tb2RlbHNfcGF0aClcbiAgICBNb2RlbERlZmluaXRpb24uZ2V0QWxsKCkuZm9yRWFjaChkZWZpbml0aW9uID0+IHRoaXMubG9hZE1vZGVsKGRlZmluaXRpb24pKVxuICAgIE1vZGVsRGVmaW5pdGlvbi5maW5hbGl6ZSgpXG4gIH1cblxuICBfYnVpbGRJbmRleEZyb21EaXNrKCkge1xuICAgIGxldCBwYXRocyA9IHRoaXMuX2dldERvY3VtZW50UGF0aHMoKVxuICAgIGxldCBicmllZmNhc2UgPSB0aGlzXG5cbiAgICBwYXRocy5mb3JFYWNoKChwYXRoKT0+e1xuICAgICAgbGV0IHBhdGhfYWxpYXMgPSBwYXRoLnJlcGxhY2UodGhpcy5jb25maWcuZG9jc19wYXRoICsgJy8nLCAnJylcbiAgICAgIGxldCBpZCA9IHBhdGhfYWxpYXMucmVwbGFjZSgnLm1kJywnJylcbiAgICAgIGxldCBkb2N1bWVudCA9IG5ldyBEb2N1bWVudChwYXRoLCB7aWQ6IGlkfSlcbiAgICAgIGxldCBtb2RlbCA9IGRvY3VtZW50LnRvTW9kZWwoe2lkOiBpZH0pIFxuICAgICAgXG4gICAgICBkb2N1bWVudC5pZCA9IHBhdGhfYWxpYXNcbiAgICAgIGRvY3VtZW50LnJlbGF0aXZlX3BhdGggPSAnZG9jcy8nICsgcGF0aF9hbGlhc1xuICAgICAgbW9kZWwuaWQgPSBpZFxuICAgICAgbW9kZWwuZ2V0UGFyZW50ID0gKCk9PnsgXG4gICAgICAgIHJldHVybiB0aGlzXG4gICAgICB9XG5cbiAgICAgIHRoaXMuaW5kZXhbcGF0aF9hbGlhc10gPSBtb2RlbFxuICAgIH0pXG4gIH1cblxufVxuIl19