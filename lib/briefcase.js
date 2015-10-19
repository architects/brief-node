'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

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

  _createClass(Briefcase, [{
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

      require('./index').plugins.forEach(function (modifier) {
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
  }]);

  return Briefcase;
})();

exports['default'] = Briefcase;
module.exports = exports['default'];
//# sourceMappingURL=data:application/json;base64,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SSxRQUFRLEdBQUcsMEJBQWEsSUFBSSxFQUFFLEVBQUMsRUFBRSxFQUFFLEVBQUUsRUFBQyxDQUFDLENBQUE7QUFDM0MsWUFBSSxLQUFLLEdBQUcsUUFBUSxDQUFDLE9BQU8sQ0FBQyxFQUFDLEVBQUUsRUFBRSxFQUFFLEVBQUMsQ0FBQyxDQUFBOztBQUV0QyxnQkFBUSxDQUFDLEVBQUUsR0FBRyxVQUFVLENBQUE7QUFDeEIsZ0JBQVEsQ0FBQyxhQUFhLEdBQUcsT0FBTyxHQUFHLFVBQVUsQ0FBQTtBQUM3QyxhQUFLLENBQUMsRUFBRSxHQUFHLEVBQUUsQ0FBQTtBQUNiLGFBQUssQ0FBQyxTQUFTLEdBQUcsWUFBSTtBQUNwQix3QkFBVztTQUNaLENBQUE7O0FBRUQsZUFBSyxLQUFLLENBQUMsVUFBVSxDQUFDLEdBQUcsS0FBSyxDQUFBO09BQy9CLENBQUMsQ0FBQTtLQUNIOzs7U0E3UmtCLFNBQVM7OztxQkFBVCxTQUFTIiwiZmlsZSI6ImJyaWVmY2FzZS5qcyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCBnbG9iIGZyb20gJ2dsb2ItYWxsJ1xuaW1wb3J0IHBhdGggZnJvbSAncGF0aCdcbmltcG9ydCBEb2N1bWVudCBmcm9tICcuL2RvY3VtZW50J1xuaW1wb3J0IGNvbGxlY3Rpb24gZnJvbSAnLi9jb2xsZWN0aW9uJ1xuaW1wb3J0IE1vZGVsIGZyb20gJy4vbW9kZWwnXG5pbXBvcnQgTW9kZWxEZWZpbml0aW9uIGZyb20gJy4vbW9kZWxfZGVmaW5pdGlvbidcbmltcG9ydCBpbmZsZWN0aW9ucyBmcm9tICdpJ1xuaW1wb3J0IFBhY2thZ2VyIGZyb20gJy4vcGFja2FnZXInXG5pbXBvcnQgXyBmcm9tICd1bmRlcnNjb3JlJ1xuXG5cbmNvbnN0IGluZmxlY3QgPSBpbmZsZWN0aW9ucyh0cnVlKVxuY29uc3QgcGx1cmFsaXplID0gaW5mbGVjdC5wbHVyYWxpemVcblxuY29uc3QgX19jYWNoZSA9IHt9XG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIEJyaWVmY2FzZSB7XG4gIC8qKlxuICAqIExvYWQgYSBicmllZmNhc2UgYnkgcGFzc2luZyBhIHBhdGggdG8gYSByb290IGZvbGRlci5cbiAgKlxuICAqIEBwYXJhbSB7c3RyaW5nfSByb290UGF0aCAtIHRoZSByb290IHBhdGggb2YgdGhlIGJyaWVmY2FzZS5cbiAgKiBAcmV0dXJuIHtCcmllZmNhc2V9IC0gcmV0dXJucyBhIGJyaWVmY2FzZVxuICAqXG4gICovXG4gIHN0YXRpYyBsb2FkKHJvb3RQYXRoLCBvcHRpb25zPXt9KSB7XG4gICAgcmV0dXJuIG5ldyBCcmllZmNhc2Uocm9vdFBhdGgsb3B0aW9ucylcbiAgfVxuIFxuICAvKipcbiAgKiBGaW5kIHRoZSBCcmllZmNhc2UgaW5zdGFuY2UgcmVzcG9uc2libGUgZm9yIGEgcGFydGljdWxhciBwYXRoLlxuICAqIE1vZGVscyBhbmQgRG9jdW1lbnRzIHdpbGwgdXNlIHRoaXMgdG8gZmluZCB0aGUgQnJpZWZjYXNlIHRoZXlcbiAgKiBiZWxvbmcgdG8gXG4gICpcbiAgKiBAcGFyYW0ge3BhdGh9IHBhdGggLSB0aGUgcGF0aCBvZiB0aGUgZG9jdW1lbnQgd2hpY2ggd2FudHMgdG8ga25vd1xuICAqL1xuICBzdGF0aWMgZmluZEZvclBhdGgoY2hlY2tQYXRoPVwiXCIpe1xuICAgIGxldCBtYXRjaGluZ1BhdGggPSBPYmplY3Qua2V5cyhfX2NhY2hlKS5maW5kKHAgPT4gY2hlY2tQYXRoLm1hdGNoKHApKVxuICAgIHJldHVybiBfX2NhY2hlW21hdGNoaW5nUGF0aF1cbiAgfVxuICBcbiAgc3RhdGljIGluc3RhbmNlcygpe1xuICAgIHJldHVybiBPYmplY3Qua2V5cyhfX2NhY2hlKS5tYXAocGF0aCA9PiBfX2NhY2hlW3BhdGhdKVxuICB9XG4gIC8qKlxuICAqIENyZWF0ZSBhIG5ldyBCcmllZmNhc2Ugb2JqZWN0IGF0IHRoZSBzcGVjaWZpZWQgcm9vdCBwYXRoLlxuICAqXG4gICogQHBhcmFtIHtwYXRofSByb290IC0gdGhlIHJvb3QgcGF0aCBvZiB0aGUgYnJpZWZjYXNlLiBleHBlY3RzXG4gICogICB0byBmaW5kIGEgY29uZmlnIGZpbGUgXCJicmllZi5jb25maWcuanNcIiwgYW5kIGF0IGxlYXN0IGEgXG4gICogICBkb2N1bWVudHMgZm9sZGVyLlxuICAqXG4gICogQHBhcmFtIHtvcHRpb25zfSBvcHRpb25zIC0gb3B0aW9ucyB0byBvdmVycmlkZSBkZWZhdWx0IGJlaGF2aW9yLlxuICAqIEBwYXJhbSB7cGF0aH0gZG9jc19wYXRoIC0gd2hpY2ggZm9sZGVyIGNvbnRhaW5zIHRoZSBkb2N1bWVudHMuXG4gICogQHBhcmFtIHtwYXRofSBtb2RlbHNfcGF0aCAtIHdoaWNoIGZvbGRlciBjb250YWlucyB0aGUgbW9kZWxzIHRvIHVzZS5cbiAgKiBAcGFyYW0ge3BhdGh9IGFzc2V0c19wYXRoIC0gd2hpY2ggZm9sZGVyIGNvbnRhaW5zIHRoZSBhc3NldHMgdG8gdXNlIGlmIGFueS5cbiAgKi9cbiAgY29uc3RydWN0b3Iocm9vdCwgb3B0aW9ucykge1xuICAgIHRoaXMucm9vdCAgICAgICAgID0gcGF0aC5yZXNvbHZlKHJvb3QpXG4gICAgdGhpcy5uYW1lICAgICAgICAgPSBvcHRpb25zLm5hbWUgfHwgcGF0aC5iYXNlbmFtZShyb290KVxuICAgIHRoaXMucGFyZW50Rm9sZGVyID0gcGF0aC5kaXJuYW1lKHJvb3QpXG5cbiAgICB0aGlzLm9wdGlvbnMgPSBvcHRpb25zIHx8IHt9XG4gICAgXG4gICAgdGhpcy5pbmRleCA9IHt9XG4gICAgdGhpcy5tb2RlbF9kZWZpbml0aW9ucyA9IHt9XG4gICAgXG4gICAgdGhpcy5jb25maWcgPSB7XG4gICAgICBkb2NzX3BhdGg6IHBhdGguam9pbih0aGlzLnJvb3QsICdkb2NzJyksXG4gICAgICBtb2RlbHNfcGF0aDogcGF0aC5qb2luKHRoaXMucm9vdCwgJ21vZGVscycpLFxuICAgICAgYXNzZXRzX3BhdGg6IHBhdGguam9pbih0aGlzLnJvb3QsICdhc3NldHMnKVxuICAgIH1cbiAgICBcbiAgICB0aGlzLnNldHVwKClcbiAgICBfX2NhY2hlW3RoaXMucm9vdF0gPSB0aGlzXG4gIH1cbiAgXG5cbiAgY29tcHV0ZUNhY2hlS2V5KCl7XG4gICAgbGV0IG1vZGlmaWVkVGltZXMgPSB0aGlzLmdldEFsbE1vZGVscygpLm1hcChtb2RlbCA9PiBtb2RlbC5sYXN0TW9kaWZpZWRBdCgpKS5zb3J0KClcbiAgICBsZXQgbGF0ZXN0ID0gbW9kaWZpZWRUaW1lc1ttb2RpZmllZFRpbWVzLmxlbmd0aCAtIDFdXG4gICAgcmV0dXJuIFt0aGlzLm5hbWUsIG1vZGlmaWVkVGltZXMubGVuZ3RoLCBsYXRlc3RdLmpvaW4oJzonKVxuICB9XG4gIFxuICBpc1N0YWxlKCl7XG4gICAgcmV0dXJuICh0aGlzLmNhY2hlS2V5ICE9IHRoaXMuY29tcHV0ZUNhY2hlS2V5KCkpXG4gIH1cblxuICBzZXR1cCgpe1xuICAgIHJlcXVpcmUoJy4vaW5kZXgnKS5wbHVnaW5zLmZvckVhY2gobW9kaWZpZXIgPT4ge1xuICAgICAgbW9kaWZpZXIodGhpcylcbiAgICB9KVxuICAgIFxuICAgIHRoaXMuX2xvYWRNb2RlbERlZmluaXRpb25zKClcbiAgICB0aGlzLl9idWlsZEluZGV4RnJvbURpc2soKVxuICAgIHRoaXMuX2NyZWF0ZUNvbGxlY3Rpb25zKClcblxuICAgIHRoaXMuY2FjaGVLZXkgPSB0aGlzLmNvbXB1dGVDYWNoZUtleSgpXG4gIH1cbiAgXG4gIC8qKlxuICAqIHVzZSBhIHBsdWdpbiB0byBsb2FkIG1vZHVsZXMsIGFjdGlvbnMsIENMSSBoZWxwZXJzLCBldGNcbiAgKi9cbiAgdXNlKHBsdWdpbiwgb3B0aW9ucz17fSl7XG4gICAgYnJpZWYudXNlKHBsdWdpbilcbiAgICB0aGlzLnNldHVwKClcbiAgICByZXR1cm4gdGhpc1xuICB9XG5cbiAgLyoqXG4gICAqIGdldCBtb2RlbCBhdCB0aGUgZ2l2ZW4gcmVsYXRpdmUgcGF0aCBcbiAgICogXG4gICAqIEBleGFtcGxlXG4gICAqICBicmllZmNhc2UuYXQoJ2VwaWNzL21vZGVsLWRlZmluaXRpb24tZHNsJylcbiAgKi9cbiAgYXQocGF0aF9hbGlhcywgYWJzb2x1dGU9ZmFsc2UpIHtcbiAgICBsZXQgZG9jc19wYXRoID0gcGF0aC5yZXNvbHZlKHRoaXMuY29uZmlnLmRvY3NfcGF0aClcblxuICAgIGlmKGFic29sdXRlKXsgcGF0aF9hbGlhcyA9IHBhdGhfYWxpYXMucmVwbGFjZShkb2NzX3BhdGgsICcnKSB9XG5cbiAgICBpZighcGF0aF9hbGlhcy5tYXRjaCgvXFwubWQkL2kpKXtcbiAgICAgIHBhdGhfYWxpYXMgPSBwYXRoX2FsaWFzICsgJy5tZCcgXG4gICAgfVxuXG4gICAgcmV0dXJuIHRoaXMuaW5kZXhbcGF0aF9hbGlhcy5yZXBsYWNlKC9eXFwvLywnJyldXG4gIH1cblxuICBmaW5kRG9jdW1lbnRCeVBhdGgocGF0aCl7XG4gICAgcmV0dXJuIHRoaXMuYXRQYXRoKHBhdGhfYWxpYXMsIHRydWUpXG4gIH1cbiAgLyoqXG4gICogZ2V0IG1vZGVscyBhdCBlYWNoIG9mIHRoZSBwYXRocyByZXByZXNlbnRlZFxuICAqIGJ5IHRoZSBnbG9iIHBhdHRlcm4gcGFzc2VkIGhlcmUuXG4gICovXG4gIGdsb2IocGF0dGVybj1cIioqLyoubWRcIikge1xuICAgIGxldCBtYXRjaGluZ0ZpbGVzID0gZ2xvYi5zeW5jKHBhdGguam9pbih0aGlzLnJvb3QsIHBhdHRlcm4pKVxuICAgIHJldHVybiBtYXRjaGluZ0ZpbGVzLm1hcChwYXRoID0+IHRoaXMuYXQocGF0aCx0cnVlKSkgXG4gIH1cblxuICAvKipcbiAgICogZmlsdGVycyBhbGwgYXZhaWxhYmxlIG1vZGVscyBieSB0aGUgZ2l2ZW4gaXRlcmF0b3JcbiAgICpcbiAgICogQGV4YW1wbGVcbiAgICogIGJyaWVmY2FzZS5maWx0ZXJBbGwobW9kZWwgPT4gbW9kZWwuc3RhdHVzID09PSAnYWN0aXZlJylcbiAgKi9cbiAgZmlsdGVyQWxsIChpdGVyYXRvcikge1xuICAgIHJldHVybiB0aGlzLmdldEFsbE1vZGVscygpLmZpbHRlcihpdGVyYXRvcilcbiAgfVxuICBcbiAgZmluZE1vZGVsc0J5RGVmaW5pdGlvbihkZWZpbml0aW9uKXtcbiAgICBsZXQgZ3JvdXBOYW1lID0gZGVmaW5pdGlvbi5ncm91cE5hbWVcbiAgICByZXR1cm4gdGhpcy5maWx0ZXJBbGwobW9kZWwgPT4gbW9kZWwuZ3JvdXBOYW1lID09PSBncm91cE5hbWUpXG4gIH1cbiAgIFxuICAvKipcbiAgICogZmlsdGVycyBtb2RlbHMgYnkgdGhlIHByb3BlcnR5IGFuZCBkZXNpcmVkIHZhbHVlXG4gICAqIFxuICAgKiBAcGFyYW0ge3N0cmluZ30gcHJvcGVydHkgLSBuYW1lIG9mIHRoZSBwcm9wZXJ0eSB0byBmaWx0ZXIgb24gXG4gICAqIEBwYXJhbSB7YW55fSBkZXNpcmVkVmFsdWUgLSB0aGUgdmFsdWUgdG8gbWF0Y2ggYWdhaW5zdFxuICAgKlxuICAgKiBAcmV0dXJuIHthcnJheX0gLSBtb2RlbHMgd2hvc2UgcHJvcGVydHkgbWF0Y2hlcyBkZXNpcmVkVmFsdWUgXG4gICovXG4gIGZpbHRlckFsbEJ5UHJvcGVydHkgKHByb3BlcnR5LCBkZXNpcmVkVmFsdWUpIHtcbiAgICByZXR1cm4gdGhpcy5maWx0ZXJBbGwobW9kZWwgPT4gbW9kZWxbcHJvcGVydHldID09PSBkZXNpcmVkVmFsdWUpXG4gIH1cbiAgXG4gIC8qKlxuICAgKiBzZWxlY3RzIGFsbCB0aGUgbW9kZWxzIHdob3NlIHR5cGUgbWF0Y2hlcyB0aGUgc3VwcGxpZWQgYXJnIFxuICAqL1xuICBzZWxlY3RNb2RlbHNCeVR5cGUgKHR5cGUpIHtcbiAgICByZXR1cm4gdGhpcy5maWx0ZXJBbGxCeVByb3BlcnR5KCd0eXBlJywgdHlwZSlcbiAgfVxuXG4gIC8qKlxuICAgKiBzZWxlY3RzIGFsbCB0aGUgbW9kZWxzIHdob3NlIGdyb3VwTmFtZSBtYXRjaGVzIHRoZSBzdXBwbGllZCBhcmcgXG4gICovXG4gIHNlbGVjdE1vZGVsc0J5R3JvdXAgKGdyb3VwTmFtZSkge1xuICAgIHJldHVybiB0aGlzLmZpbHRlckFsbEJ5UHJvcGVydHkoJ2dyb3VwTmFtZScsIGdyb3VwTmFtZSlcbiAgfVxuICBcbiAgLyoqXG4gICAqIHJldHVybnMgYWxsIHRoZSBtb2RlbHMgaW4gdGhpcyBicmllZmNhc2VcbiAgKi9cbiAgZ2V0QWxsTW9kZWxzKCkge1xuICAgIHJldHVybiBPYmplY3Qua2V5cyh0aGlzLmluZGV4KS5tYXAoa2V5ID0+IHRoaXMuaW5kZXhba2V5XSlcbiAgfVxuICBcbiAgLyoqXG4gICAqIHJldHVybnMgdGhlIHJhdyBkb2N1bWVudHMgaW4gdGhpcyBicmllZmNhc2VcbiAgKi9cbiAgZ2V0QWxsRG9jdW1lbnRzICgpIHtcbiAgICByZXR1cm4gdGhpcy5nZXRBbGxNb2RlbHMoKS5tYXAobW9kZWwgPT4gbW9kZWwuZG9jdW1lbnQpXG4gIH1cbiAgXG4gIC8qKlxuICAqIEFyY2hpdmVzIHRoZSBicmllZmNhc2UgaW50byBhIHppcCBmaWxlLiBCcmllZmNhc2VzXG4gICogY2FuIGJlIGNyZWF0ZWQgZGlyZWN0bHkgZnJvbSB6aXAgZmlsZXMgaW4gdGhlIGZ1dHVyZS5cbiAgKlxuICAqIEBwYXJhbSB7c3RyaW5nfSBsb2NhdGlvbiAtIHdoZXJlIHRvIHN0b3JlIHRoZSBmaWxlP1xuICAqIEBwYXJhbSB7YXJyYXl9IGlnbm9yZSAtIGEgbGlzdCBvZiBmaWxlcyB0byBpZ25vcmUgYW5kIG5vdCBwdXQgaW4gdGhlXG4gICogICBhcmNoaXZlXG4gICovXG4gIGFyY2hpdmUobG9jYXRpb24sIGlnbm9yZT1bXSkge1xuICAgIGxvY2F0aW9uID0gbG9jYXRpb24gfHwgXG4gICAgaWdub3JlLnB1c2gobG9jYXRpb24pXG5cbiAgICBuZXcgUGFja2FnZXIodGhpcywgaWdub3JlKS5wZXJzaXN0KGxvY2F0aW9uKVxuICB9XG4gIFxuICBnZXRHcm91cE5hbWVzICgpIHtcbiAgICBsZXQgdHlwZXMgPSB0aGlzLmdldERvY3VtZW50VHlwZXMoKVxuICAgIHJldHVybiB0eXBlcy5tYXAodHlwZSA9PiBwbHVyYWxpemUodHlwZSB8fCBcIlwiKSlcbiAgfVxuXG4gIGdldERvY3VtZW50VHlwZXMgKCkge1xuICAgIGxldCB0eXBlcyA9IFtdXG5cbiAgICB0aGlzLmdldEFsbERvY3VtZW50cygpLmZvckVhY2goKGRvYyk9PntcbiAgICAgIHR5cGVzLnB1c2goZG9jLmdldFR5cGUoKSlcbiAgICB9KVxuXG4gICAgcmV0dXJuIF8odHlwZXMpLnVuaXEoKVxuICB9XG4gIFxuICBsb2FkTW9kZWxEZWZpbml0aW9uKHBhdGgpe1xuICAgIHJldHVybiB0aGlzLmxvYWRNb2RlbChNb2RlbERlZmluaXRpb24ubG9hZChwYXRoKSlcbiAgfVxuXG4gIGxvYWRNb2RlbCAoZGVmaW5pdGlvbikge1xuICAgIHRoaXMubW9kZWxfZGVmaW5pdGlvbnNbZGVmaW5pdGlvbi5uYW1lXSA9IHRydWVcbiAgICByZXR1cm4gZGVmaW5pdGlvblxuICB9XG5cbiAgbG9hZGVkTW9kZWxEZWZpbml0aW9ucyAoKSB7XG4gICAgcmV0dXJuIE9iamVjdC5rZXlzKHRoaXMubW9kZWxfZGVmaW5pdGlvbnMpXG4gIH1cblxuICBnZXRNb2RlbERlZmluaXRpb25zICgpIHsgXG4gICAgcmV0dXJuIE1vZGVsRGVmaW5pdGlvbi5nZXRBbGwoKVxuICB9XG5cbiAgZ2V0TW9kZWxEZWZpbml0aW9uIChtb2RlbE5hbWVPckFsaWFzKSB7XG4gICAgcmV0dXJuIE1vZGVsRGVmaW5pdGlvbi5sb29rdXAobW9kZWxOYW1lT3JBbGlhcylcbiAgfVxuXG4gIGdldFR5cGVBbGlhc2VzICgpe1xuICAgIHJldHVybiBNb2RlbERlZmluaXRpb24uZ2V0VHlwZUFsaWFzZXMoKVxuICB9XG5cbiAgZ2V0TW9kZWxTY2hlbWEgKCkge1xuICAgIHJldHVybiBNb2RlbERlZmluaXRpb24uZ2V0TW9kZWxTY2hlbWEoKVxuICB9XG5cbiAgZ2V0QWxsRmlsZXModXNlQWJzb2x1dGVQYXRocz1mYWxzZSl7XG4gICAgbGV0IGFsbEZpbGVzID0gZ2xvYi5zeW5jKHBhdGguam9pbih0aGlzLnJvb3QsICcqKi8qJykpXG4gICAgcmV0dXJuIHVzZUFic29sdXRlUGF0aHMgPyBhbGxGaWxlcyA6IGFsbEZpbGVzLm1hcChmID0+IGYucmVwbGFjZSh0aGlzLnJvb3QgKyAnLycsICcnKSlcbiAgfVxuIFxuICBfY3JlYXRlQ29sbGVjdGlvbnMoKSB7XG4gICAgY29uc3QgYnJpZWZjYXNlID0gdGhpc1xuXG4gICAgdGhpcy5nZXREb2N1bWVudFR5cGVzKCkuZm9yRWFjaCh0eXBlID0+IHtcbiAgICAgIGxldCBncm91cCAgICAgICA9IHBsdXJhbGl6ZSh0eXBlKVxuICAgICAgbGV0IGRlZmluaXRpb24gID0gdGhpcy5nZXRNb2RlbERlZmluaXRpb24odHlwZSlcbiAgICAgIFxuICAgICAgbGV0IGZldGNoID0gKCk9PiB7XG4gICAgICAgIHJldHVybiB0aGlzLnNlbGVjdE1vZGVsc0J5VHlwZSh0eXBlKVxuICAgICAgfVxuXG4gICAgICBicmllZmNhc2VbZ3JvdXBdID0gYnJpZWZjYXNlW2dyb3VwXSB8fCBjb2xsZWN0aW9uKGZldGNoLCBkZWZpbml0aW9uKSBcbiAgICB9KVxuICB9XG4gXG4gIF9nZXREb2N1bWVudFBhdGhzKCkge1xuICAgIGxldCBkb2NzX3BhdGggPSBwYXRoLnJlc29sdmUodGhpcy5jb25maWcuZG9jc19wYXRoKVxuICAgIHJldHVybiBnbG9iLnN5bmMocGF0aC5qb2luKGRvY3NfcGF0aCwnKiovKi5tZCcpKVxuICB9XG5cbiAgX2xvYWRNb2RlbERlZmluaXRpb25zKCl7XG4gICAgTW9kZWxEZWZpbml0aW9uLmxvYWREZWZpbml0aW9uc0Zyb21QYXRoKHRoaXMuY29uZmlnLm1vZGVsc19wYXRoKVxuICAgIE1vZGVsRGVmaW5pdGlvbi5nZXRBbGwoKS5mb3JFYWNoKGRlZmluaXRpb24gPT4gdGhpcy5sb2FkTW9kZWwoZGVmaW5pdGlvbikpXG4gICAgTW9kZWxEZWZpbml0aW9uLmZpbmFsaXplKClcbiAgfVxuXG4gIF9idWlsZEluZGV4RnJvbURpc2soKSB7XG4gICAgbGV0IHBhdGhzID0gdGhpcy5fZ2V0RG9jdW1lbnRQYXRocygpXG4gICAgbGV0IGJyaWVmY2FzZSA9IHRoaXNcblxuICAgIHBhdGhzLmZvckVhY2goKHBhdGgpPT57XG4gICAgICBsZXQgcGF0aF9hbGlhcyA9IHBhdGgucmVwbGFjZSh0aGlzLmNvbmZpZy5kb2NzX3BhdGggKyAnLycsICcnKVxuICAgICAgbGV0IGlkID0gcGF0aF9hbGlhcy5yZXBsYWNlKCcubWQnLCcnKVxuICAgICAgbGV0IGRvY3VtZW50ID0gbmV3IERvY3VtZW50KHBhdGgsIHtpZDogaWR9KVxuICAgICAgbGV0IG1vZGVsID0gZG9jdW1lbnQudG9Nb2RlbCh7aWQ6IGlkfSkgXG4gICAgICBcbiAgICAgIGRvY3VtZW50LmlkID0gcGF0aF9hbGlhc1xuICAgICAgZG9jdW1lbnQucmVsYXRpdmVfcGF0aCA9ICdkb2NzLycgKyBwYXRoX2FsaWFzXG4gICAgICBtb2RlbC5pZCA9IGlkXG4gICAgICBtb2RlbC5nZXRQYXJlbnQgPSAoKT0+eyBcbiAgICAgICAgcmV0dXJuIHRoaXNcbiAgICAgIH1cblxuICAgICAgdGhpcy5pbmRleFtwYXRoX2FsaWFzXSA9IG1vZGVsXG4gICAgfSlcbiAgfVxuXG59XG4iXX0=