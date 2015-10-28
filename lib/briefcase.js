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

  _createClass(Briefcase, [{
    key: 'toJSON',
    value: function toJSON() {
      var options = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

      return this.exportWith("standard", options);
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
    key: 'manifestConfig',
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

    // Returns the manifest data from the package.json manifest
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3NyYy9icmllZmNhc2UuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7O2tCQUFlLElBQUk7Ozs7dUJBQ0YsVUFBVTs7OztvQkFDVixNQUFNOzs7O3dCQUNGLFlBQVk7Ozs7MEJBQ1YsY0FBYzs7OztxQkFDbkIsU0FBUzs7OztnQ0FDQyxvQkFBb0I7Ozs7aUJBQ3hCLEdBQUc7Ozs7d0JBQ04sWUFBWTs7Ozt5QkFDWCxhQUFhOzs7OzBCQUNyQixZQUFZOzs7O0FBRzFCLElBQU0sT0FBTyxHQUFHLG9CQUFZLElBQUksQ0FBQyxDQUFBO0FBQ2pDLElBQU0sU0FBUyxHQUFHLE9BQU8sQ0FBQyxTQUFTLENBQUE7O0FBRW5DLElBQU0sT0FBTyxHQUFHLEVBQUUsQ0FBQTs7SUFFRyxTQUFTO2VBQVQsU0FBUzs7Ozs7Ozs7OztXQVFqQixjQUFDLFFBQVEsRUFBYztVQUFaLE9BQU8seURBQUMsRUFBRTs7QUFDOUIsYUFBTyxJQUFJLFNBQVMsQ0FBQyxRQUFRLEVBQUMsT0FBTyxDQUFDLENBQUE7S0FDdkM7Ozs7Ozs7Ozs7O1dBU2lCLHVCQUFjO1VBQWIsU0FBUyx5REFBQyxFQUFFOztBQUM3QixVQUFJLFlBQVksR0FBRyxNQUFNLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxDQUFDLElBQUksQ0FBQyxVQUFBLENBQUM7ZUFBSSxTQUFTLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQztPQUFBLENBQUMsQ0FBQTtBQUNyRSxhQUFPLE9BQU8sQ0FBQyxZQUFZLENBQUMsQ0FBQTtLQUM3Qjs7O1dBRWUscUJBQUU7QUFDaEIsYUFBTyxNQUFNLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxDQUFDLEdBQUcsQ0FBQyxVQUFBLElBQUk7ZUFBSSxPQUFPLENBQUMsSUFBSSxDQUFDO09BQUEsQ0FBQyxDQUFBO0tBQ3ZEOzs7Ozs7Ozs7Ozs7Ozs7O0FBYVUsV0F2Q1EsU0FBUyxDQXVDaEIsSUFBSSxFQUFFLE9BQU8sRUFBRTswQkF2Q1IsU0FBUzs7QUF3QzFCLFFBQUksQ0FBQyxJQUFJLEdBQVcsa0JBQUssT0FBTyxDQUFDLElBQUksQ0FBQyxDQUFBO0FBQ3RDLFFBQUksQ0FBQyxJQUFJLEdBQVcsT0FBTyxDQUFDLElBQUksSUFBSSxrQkFBSyxRQUFRLENBQUMsSUFBSSxDQUFDLENBQUE7QUFDdkQsUUFBSSxDQUFDLFlBQVksR0FBRyxrQkFBSyxPQUFPLENBQUMsSUFBSSxDQUFDLENBQUE7O0FBRXRDLFFBQUksQ0FBQyxPQUFPLEdBQUcsT0FBTyxJQUFJLEVBQUUsQ0FBQTs7QUFFNUIsUUFBSSxDQUFDLEtBQUssR0FBRyxFQUFFLENBQUE7QUFDZixRQUFJLENBQUMsaUJBQWlCLEdBQUcsRUFBRSxDQUFBOztBQUUzQixRQUFJLENBQUMsTUFBTSxHQUFHO0FBQ1osZUFBUyxFQUFFLGtCQUFLLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxFQUFFLE1BQU0sQ0FBQztBQUN2QyxpQkFBVyxFQUFFLGtCQUFLLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxFQUFFLFFBQVEsQ0FBQztBQUMzQyxpQkFBVyxFQUFFLGtCQUFLLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxFQUFFLFFBQVEsQ0FBQztLQUM1QyxDQUFBOztBQUVELFFBQUksQ0FBQyxLQUFLLEVBQUUsQ0FBQTtBQUNaLFdBQU8sQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLEdBQUcsSUFBSSxDQUFBO0dBQzFCOztlQXpEa0IsU0FBUzs7V0FtRnRCLGtCQUFZO1VBQVgsT0FBTyx5REFBQyxFQUFFOztBQUNmLGFBQU8sSUFBSSxDQUFDLFVBQVUsQ0FBQyxVQUFVLEVBQUUsT0FBTyxDQUFDLENBQUE7S0FDNUM7OztXQUVTLHNCQUF5QztVQUF4QyxjQUFjLHlEQUFDLFVBQVU7VUFBRSxPQUFPLHlEQUFHLEVBQUU7O0FBQ2hELGFBQU8sdUJBQVUsTUFBTSxDQUFDLElBQUksRUFBRSxjQUFjLEVBQUUsT0FBTyxDQUFDLENBQUE7S0FDdkQ7OztXQUVjLDJCQUFFO0FBQ2YsVUFBSSxhQUFhLEdBQUcsSUFBSSxDQUFDLFlBQVksRUFBRSxDQUFDLEdBQUcsQ0FBQyxVQUFBLEtBQUs7ZUFBSSxLQUFLLENBQUMsY0FBYyxFQUFFO09BQUEsQ0FBQyxDQUFDLElBQUksRUFBRSxDQUFBO0FBQ25GLFVBQUksTUFBTSxHQUFHLGFBQWEsQ0FBQyxhQUFhLENBQUMsTUFBTSxHQUFHLENBQUMsQ0FBQyxDQUFBO0FBQ3BELGFBQU8sQ0FBQyxJQUFJLENBQUMsSUFBSSxFQUFFLGFBQWEsQ0FBQyxNQUFNLEVBQUUsTUFBTSxDQUFDLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFBO0tBQzNEOzs7V0FFTSxtQkFBRTtBQUNQLGFBQVEsSUFBSSxDQUFDLFFBQVEsSUFBSSxJQUFJLENBQUMsZUFBZSxFQUFFLENBQUM7S0FDakQ7OztXQUVJLGlCQUFFOzs7QUFDTCxVQUFJLENBQUMsV0FBVyxHQUFHLEVBQUUsQ0FBQTtBQUNyQixhQUFPLENBQUMsU0FBUyxDQUFDLENBQUMsT0FBTyxDQUFDLE9BQU8sQ0FBQyxVQUFBLFFBQVEsRUFBSTtBQUM3QyxjQUFLLFdBQVcsQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLFdBQVcsSUFBSSxRQUFRLENBQUMsVUFBVSxDQUFDLENBQUE7QUFDbEUsZ0JBQVEsT0FBTSxDQUFBO09BQ2YsQ0FBQyxDQUFBOztBQUVGLFVBQUksQ0FBQyxxQkFBcUIsRUFBRSxDQUFBO0FBQzVCLFVBQUksQ0FBQyxtQkFBbUIsRUFBRSxDQUFBO0FBQzFCLFVBQUksQ0FBQyxrQkFBa0IsRUFBRSxDQUFBOztBQUV6QixVQUFJLENBQUMsUUFBUSxHQUFHLElBQUksQ0FBQyxlQUFlLEVBQUUsQ0FBQTtLQUN2Qzs7Ozs7OztXQUtFLGFBQUMsTUFBTSxFQUFhO1VBQVgsT0FBTyx5REFBQyxFQUFFOztBQUNwQixXQUFLLENBQUMsR0FBRyxDQUFDLE1BQU0sQ0FBQyxDQUFBO0FBQ2pCLFVBQUksQ0FBQyxLQUFLLEVBQUUsQ0FBQTtBQUNaLGFBQU8sSUFBSSxDQUFBO0tBQ1o7Ozs7Ozs7Ozs7V0FRQyxZQUFDLFVBQVUsRUFBa0I7VUFBaEIsUUFBUSx5REFBQyxLQUFLOztBQUMzQixVQUFJLFNBQVMsR0FBRyxrQkFBSyxPQUFPLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxTQUFTLENBQUMsQ0FBQTs7QUFFbkQsVUFBRyxRQUFRLEVBQUM7QUFBRSxrQkFBVSxHQUFHLFVBQVUsQ0FBQyxPQUFPLENBQUMsU0FBUyxFQUFFLEVBQUUsQ0FBQyxDQUFBO09BQUU7O0FBRTlELFVBQUcsQ0FBQyxVQUFVLENBQUMsS0FBSyxDQUFDLFFBQVEsQ0FBQyxFQUFDO0FBQzdCLGtCQUFVLEdBQUcsVUFBVSxHQUFHLEtBQUssQ0FBQTtPQUNoQzs7QUFFRCxhQUFPLElBQUksQ0FBQyxLQUFLLENBQUMsVUFBVSxDQUFDLE9BQU8sQ0FBQyxLQUFLLEVBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQTtLQUNoRDs7O1dBRWlCLDRCQUFDLElBQUksRUFBQztBQUN0QixhQUFPLElBQUksQ0FBQyxNQUFNLENBQUMsVUFBVSxFQUFFLElBQUksQ0FBQyxDQUFBO0tBQ3JDOzs7Ozs7OztXQUtHLGdCQUFvQjs7O1VBQW5CLE9BQU8seURBQUMsU0FBUzs7QUFDcEIsVUFBSSxhQUFhLEdBQUcscUJBQUssSUFBSSxDQUFDLGtCQUFLLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxFQUFFLE9BQU8sQ0FBQyxDQUFDLENBQUE7QUFDNUQsYUFBTyxhQUFhLENBQUMsR0FBRyxDQUFDLFVBQUEsSUFBSTtlQUFJLE9BQUssRUFBRSxDQUFDLElBQUksRUFBQyxJQUFJLENBQUM7T0FBQSxDQUFDLENBQUE7S0FDckQ7Ozs7Ozs7Ozs7V0FRUyxtQkFBQyxRQUFRLEVBQUU7QUFDbkIsYUFBTyxJQUFJLENBQUMsWUFBWSxFQUFFLENBQUMsTUFBTSxDQUFDLFFBQVEsQ0FBQyxDQUFBO0tBQzVDOzs7V0FFcUIsZ0NBQUMsVUFBVSxFQUFDO0FBQ2hDLFVBQUksU0FBUyxHQUFHLFVBQVUsQ0FBQyxTQUFTLENBQUE7QUFDcEMsYUFBTyxJQUFJLENBQUMsU0FBUyxDQUFDLFVBQUEsS0FBSztlQUFJLEtBQUssQ0FBQyxTQUFTLEtBQUssU0FBUztPQUFBLENBQUMsQ0FBQTtLQUM5RDs7Ozs7Ozs7Ozs7O1dBVW1CLDZCQUFDLFFBQVEsRUFBRSxZQUFZLEVBQUU7QUFDM0MsYUFBTyxJQUFJLENBQUMsU0FBUyxDQUFDLFVBQUEsS0FBSztlQUFJLEtBQUssQ0FBQyxRQUFRLENBQUMsS0FBSyxZQUFZO09BQUEsQ0FBQyxDQUFBO0tBQ2pFOzs7Ozs7O1dBS2tCLDRCQUFDLElBQUksRUFBRTtBQUN4QixhQUFPLElBQUksQ0FBQyxtQkFBbUIsQ0FBQyxNQUFNLEVBQUUsSUFBSSxDQUFDLENBQUE7S0FDOUM7Ozs7Ozs7V0FLbUIsNkJBQUMsU0FBUyxFQUFFO0FBQzlCLGFBQU8sSUFBSSxDQUFDLG1CQUFtQixDQUFDLFdBQVcsRUFBRSxTQUFTLENBQUMsQ0FBQTtLQUN4RDs7Ozs7OztXQUtXLHdCQUFHOzs7QUFDYixhQUFPLE1BQU0sQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDLEdBQUcsQ0FBQyxVQUFBLEdBQUc7ZUFBSSxPQUFLLEtBQUssQ0FBQyxHQUFHLENBQUM7T0FBQSxDQUFDLENBQUE7S0FDM0Q7Ozs7Ozs7V0FLZSwyQkFBRztBQUNqQixhQUFPLElBQUksQ0FBQyxZQUFZLEVBQUUsQ0FBQyxHQUFHLENBQUMsVUFBQSxLQUFLO2VBQUksS0FBSyxDQUFDLFFBQVE7T0FBQSxDQUFDLENBQUE7S0FDeEQ7Ozs7Ozs7Ozs7OztXQVVNLGlCQUFDLFFBQVEsRUFBYTtVQUFYLE1BQU0seURBQUMsRUFBRTs7QUFDekIsY0FBUSxHQUFHLFFBQVEsSUFDbkIsTUFBTSxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsQ0FBQTs7QUFFckIsZ0NBQWEsSUFBSSxFQUFFLE1BQU0sQ0FBQyxDQUFDLE9BQU8sQ0FBQyxRQUFRLENBQUMsQ0FBQTtLQUM3Qzs7O1dBRWEseUJBQUc7QUFDZixVQUFJLEtBQUssR0FBRyxJQUFJLENBQUMsZ0JBQWdCLEVBQUUsQ0FBQTtBQUNuQyxhQUFPLEtBQUssQ0FBQyxHQUFHLENBQUMsVUFBQSxJQUFJO2VBQUksU0FBUyxDQUFDLElBQUksSUFBSSxFQUFFLENBQUM7T0FBQSxDQUFDLENBQUE7S0FDaEQ7OztXQUVnQiw0QkFBRztBQUNsQixVQUFJLEtBQUssR0FBRyxFQUFFLENBQUE7O0FBRWQsVUFBSSxDQUFDLGVBQWUsRUFBRSxDQUFDLE9BQU8sQ0FBQyxVQUFDLEdBQUcsRUFBRztBQUNwQyxhQUFLLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxPQUFPLEVBQUUsQ0FBQyxDQUFBO09BQzFCLENBQUMsQ0FBQTs7QUFFRixhQUFPLDZCQUFFLEtBQUssQ0FBQyxDQUFDLElBQUksRUFBRSxDQUFBO0tBQ3ZCOzs7V0FFa0IsNkJBQUMsSUFBSSxFQUFDO0FBQ3ZCLGFBQU8sSUFBSSxDQUFDLFNBQVMsQ0FBQyw4QkFBZ0IsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUE7S0FDbEQ7OztXQUVTLG1CQUFDLFVBQVUsRUFBRTtBQUNyQixVQUFJLENBQUMsaUJBQWlCLENBQUMsVUFBVSxDQUFDLElBQUksQ0FBQyxHQUFHLElBQUksQ0FBQTtBQUM5QyxhQUFPLFVBQVUsQ0FBQTtLQUNsQjs7O1dBRXNCLGtDQUFHO0FBQ3hCLGFBQU8sTUFBTSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsaUJBQWlCLENBQUMsQ0FBQTtLQUMzQzs7O1dBRW1CLCtCQUFHO0FBQ3JCLGFBQU8sOEJBQWdCLE1BQU0sRUFBRSxDQUFBO0tBQ2hDOzs7V0FFa0IsNEJBQUMsZ0JBQWdCLEVBQUU7QUFDcEMsYUFBTyw4QkFBZ0IsTUFBTSxDQUFDLGdCQUFnQixDQUFDLENBQUE7S0FDaEQ7OztXQUVjLDBCQUFFO0FBQ2YsYUFBTyw4QkFBZ0IsY0FBYyxFQUFFLENBQUE7S0FDeEM7OztXQUVjLDBCQUFHO0FBQ2hCLGFBQU8sOEJBQWdCLGNBQWMsRUFBRSxDQUFBO0tBQ3hDOzs7V0FFVSx1QkFBd0I7OztVQUF2QixnQkFBZ0IseURBQUMsS0FBSzs7QUFDaEMsVUFBSSxRQUFRLEdBQUcscUJBQUssSUFBSSxDQUFDLGtCQUFLLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxFQUFFLE1BQU0sQ0FBQyxDQUFDLENBQUE7QUFDdEQsYUFBTyxnQkFBZ0IsR0FBRyxRQUFRLEdBQUcsUUFBUSxDQUFDLEdBQUcsQ0FBQyxVQUFBLENBQUM7ZUFBSSxDQUFDLENBQUMsT0FBTyxDQUFDLE9BQUssSUFBSSxHQUFHLEdBQUcsRUFBRSxFQUFFLENBQUM7T0FBQSxDQUFDLENBQUE7S0FDdkY7OztXQUVpQiw4QkFBRzs7O0FBQ25CLFVBQU0sU0FBUyxHQUFHLElBQUksQ0FBQTs7QUFFdEIsVUFBSSxDQUFDLGdCQUFnQixFQUFFLENBQUMsT0FBTyxDQUFDLFVBQUEsSUFBSSxFQUFJO0FBQ3RDLFlBQUksS0FBSyxHQUFTLFNBQVMsQ0FBQyxJQUFJLENBQUMsQ0FBQTtBQUNqQyxZQUFJLFVBQVUsR0FBSSxPQUFLLGtCQUFrQixDQUFDLElBQUksQ0FBQyxDQUFBOztBQUUvQyxZQUFJLEtBQUssR0FBRyxTQUFSLEtBQUssR0FBUTtBQUNmLGlCQUFPLE9BQUssa0JBQWtCLENBQUMsSUFBSSxDQUFDLENBQUE7U0FDckMsQ0FBQTs7QUFFRCxpQkFBUyxDQUFDLEtBQUssQ0FBQyxHQUFHLFNBQVMsQ0FBQyxLQUFLLENBQUMsSUFBSSw2QkFBVyxLQUFLLEVBQUUsVUFBVSxDQUFDLENBQUE7T0FDckUsQ0FBQyxDQUFBO0tBQ0g7OztXQUVnQiw2QkFBRztBQUNsQixVQUFJLFNBQVMsR0FBRyxrQkFBSyxPQUFPLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxTQUFTLENBQUMsQ0FBQTtBQUNuRCxhQUFPLHFCQUFLLElBQUksQ0FBQyxrQkFBSyxJQUFJLENBQUMsU0FBUyxFQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUE7S0FDakQ7OztXQUVvQixpQ0FBRTs7O0FBQ3JCLG9DQUFnQix1QkFBdUIsQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLFdBQVcsQ0FBQyxDQUFBO0FBQ2hFLG9DQUFnQixNQUFNLEVBQUUsQ0FBQyxPQUFPLENBQUMsVUFBQSxVQUFVO2VBQUksT0FBSyxTQUFTLENBQUMsVUFBVSxDQUFDO09BQUEsQ0FBQyxDQUFBO0FBQzFFLG9DQUFnQixRQUFRLEVBQUUsQ0FBQTtLQUMzQjs7O1dBRWtCLCtCQUFHOzs7QUFDcEIsVUFBSSxLQUFLLEdBQUcsSUFBSSxDQUFDLGlCQUFpQixFQUFFLENBQUE7QUFDcEMsVUFBSSxTQUFTLEdBQUcsSUFBSSxDQUFBOztBQUVwQixXQUFLLENBQUMsT0FBTyxDQUFDLFVBQUMsSUFBSSxFQUFHO0FBQ3BCLFlBQUksVUFBVSxHQUFHLElBQUksQ0FBQyxPQUFPLENBQUMsT0FBSyxNQUFNLENBQUMsU0FBUyxHQUFHLEdBQUcsRUFBRSxFQUFFLENBQUMsQ0FBQTtBQUM5RCxZQUFJLEVBQUUsR0FBRyxVQUFVLENBQUMsT0FBTyxDQUFDLEtBQUssRUFBQyxFQUFFLENBQUMsQ0FBQTtBQUNyQyxZQUFJLFFBQVEsR0FBRywwQkFBYSxJQUFJLEVBQUUsRUFBQyxFQUFFLEVBQUUsRUFBRSxFQUFDLENBQUMsQ0FBQTtBQUMzQyxZQUFJLEtBQUssR0FBRyxRQUFRLENBQUMsT0FBTyxDQUFDLEVBQUMsRUFBRSxFQUFFLEVBQUUsRUFBQyxDQUFDLENBQUE7O0FBRXRDLGdCQUFRLENBQUMsRUFBRSxHQUFHLFVBQVUsQ0FBQTtBQUN4QixnQkFBUSxDQUFDLGFBQWEsR0FBRyxPQUFPLEdBQUcsVUFBVSxDQUFBO0FBQzdDLGFBQUssQ0FBQyxFQUFFLEdBQUcsRUFBRSxDQUFBO0FBQ2IsYUFBSyxDQUFDLFNBQVMsR0FBRyxZQUFJO0FBQ3BCLHdCQUFXO1NBQ1osQ0FBQTs7QUFFRCxlQUFLLEtBQUssQ0FBQyxVQUFVLENBQUMsR0FBRyxLQUFLLENBQUE7T0FDL0IsQ0FBQyxDQUFBO0tBQ0g7OztTQW5RaUIsZUFBRTtBQUNsQixVQUFJLElBQUksR0FBRyxFQUFFLENBQUE7QUFDYixVQUFJLFFBQVEsR0FBRyxJQUFJLENBQUMsUUFBUSxDQUFBOztBQUU1QixVQUFJLHdCQUFFLE9BQU8sQ0FBQyxRQUFRLENBQUMsRUFBRTtBQUFFLGVBQU8sRUFBRSxDQUFBO09BQUU7O0FBRXRDLFVBQUcsUUFBUSxDQUFDLEtBQUssRUFBQztBQUFFLFlBQUksQ0FBQyxLQUFLLEdBQUcsUUFBUSxDQUFDLEtBQUssQ0FBQTtPQUFFOztBQUVqRCxhQUFPLElBQUksQ0FBQyxXQUFXLENBQUMsTUFBTSxDQUFDLFVBQUMsSUFBSSxFQUFDLE1BQU0sRUFBRztBQUM1QyxZQUFHLFFBQVEsQ0FBQyxNQUFNLENBQUMsRUFBQztBQUNsQixjQUFJLENBQUMsTUFBTSxDQUFDLEdBQUcsUUFBUSxDQUFDLE1BQU0sQ0FBQyxDQUFBO1NBQ2hDOztBQUVELGVBQU8sSUFBSSxDQUFBO09BQ1osRUFBRSxJQUFJLENBQUMsQ0FBQTtLQUNUOzs7OztTQUdXLGVBQUU7QUFDWixVQUFHLGdCQUFHLFVBQVUsQ0FBQyxrQkFBSyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksRUFBRSxjQUFjLENBQUMsQ0FBQyxFQUFDO0FBQ3JELGVBQU8sSUFBSSxDQUFDLEtBQUssQ0FBQyxnQkFBRyxZQUFZLENBQUMsa0JBQUssSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLEVBQUUsY0FBYyxDQUFDLENBQUMsQ0FBQyxDQUFBO09BQ3pFO0tBQ0Y7OztTQWpGa0IsU0FBUzs7O3FCQUFULFNBQVMiLCJmaWxlIjoiYnJpZWZjYXNlLmpzIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IGZzIGZyb20gJ2ZzJ1xuaW1wb3J0IGdsb2IgZnJvbSAnZ2xvYi1hbGwnXG5pbXBvcnQgcGF0aCBmcm9tICdwYXRoJ1xuaW1wb3J0IERvY3VtZW50IGZyb20gJy4vZG9jdW1lbnQnXG5pbXBvcnQgY29sbGVjdGlvbiBmcm9tICcuL2NvbGxlY3Rpb24nXG5pbXBvcnQgTW9kZWwgZnJvbSAnLi9tb2RlbCdcbmltcG9ydCBNb2RlbERlZmluaXRpb24gZnJvbSAnLi9tb2RlbF9kZWZpbml0aW9uJ1xuaW1wb3J0IGluZmxlY3Rpb25zIGZyb20gJ2knXG5pbXBvcnQgUGFja2FnZXIgZnJvbSAnLi9wYWNrYWdlcidcbmltcG9ydCBleHBvcnRlcnMgZnJvbSAnLi9leHBvcnRlcnMnXG5pbXBvcnQgXyBmcm9tICd1bmRlcnNjb3JlJ1xuXG5cbmNvbnN0IGluZmxlY3QgPSBpbmZsZWN0aW9ucyh0cnVlKVxuY29uc3QgcGx1cmFsaXplID0gaW5mbGVjdC5wbHVyYWxpemVcblxuY29uc3QgX19jYWNoZSA9IHt9XG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIEJyaWVmY2FzZSB7XG4gIC8qKlxuICAqIExvYWQgYSBicmllZmNhc2UgYnkgcGFzc2luZyBhIHBhdGggdG8gYSByb290IGZvbGRlci5cbiAgKlxuICAqIEBwYXJhbSB7c3RyaW5nfSByb290UGF0aCAtIHRoZSByb290IHBhdGggb2YgdGhlIGJyaWVmY2FzZS5cbiAgKiBAcmV0dXJuIHtCcmllZmNhc2V9IC0gcmV0dXJucyBhIGJyaWVmY2FzZVxuICAqXG4gICovXG4gIHN0YXRpYyBsb2FkKHJvb3RQYXRoLCBvcHRpb25zPXt9KSB7XG4gICAgcmV0dXJuIG5ldyBCcmllZmNhc2Uocm9vdFBhdGgsb3B0aW9ucylcbiAgfVxuIFxuICAvKipcbiAgKiBGaW5kIHRoZSBCcmllZmNhc2UgaW5zdGFuY2UgcmVzcG9uc2libGUgZm9yIGEgcGFydGljdWxhciBwYXRoLlxuICAqIE1vZGVscyBhbmQgRG9jdW1lbnRzIHdpbGwgdXNlIHRoaXMgdG8gZmluZCB0aGUgQnJpZWZjYXNlIHRoZXlcbiAgKiBiZWxvbmcgdG8gXG4gICpcbiAgKiBAcGFyYW0ge3BhdGh9IHBhdGggLSB0aGUgcGF0aCBvZiB0aGUgZG9jdW1lbnQgd2hpY2ggd2FudHMgdG8ga25vd1xuICAqL1xuICBzdGF0aWMgZmluZEZvclBhdGgoY2hlY2tQYXRoPVwiXCIpe1xuICAgIGxldCBtYXRjaGluZ1BhdGggPSBPYmplY3Qua2V5cyhfX2NhY2hlKS5maW5kKHAgPT4gY2hlY2tQYXRoLm1hdGNoKHApKVxuICAgIHJldHVybiBfX2NhY2hlW21hdGNoaW5nUGF0aF1cbiAgfVxuICBcbiAgc3RhdGljIGluc3RhbmNlcygpe1xuICAgIHJldHVybiBPYmplY3Qua2V5cyhfX2NhY2hlKS5tYXAocGF0aCA9PiBfX2NhY2hlW3BhdGhdKVxuICB9XG4gIC8qKlxuICAqIENyZWF0ZSBhIG5ldyBCcmllZmNhc2Ugb2JqZWN0IGF0IHRoZSBzcGVjaWZpZWQgcm9vdCBwYXRoLlxuICAqXG4gICogQHBhcmFtIHtwYXRofSByb290IC0gdGhlIHJvb3QgcGF0aCBvZiB0aGUgYnJpZWZjYXNlLiBleHBlY3RzXG4gICogICB0byBmaW5kIGEgY29uZmlnIGZpbGUgXCJicmllZi5jb25maWcuanNcIiwgYW5kIGF0IGxlYXN0IGEgXG4gICogICBkb2N1bWVudHMgZm9sZGVyLlxuICAqXG4gICogQHBhcmFtIHtvcHRpb25zfSBvcHRpb25zIC0gb3B0aW9ucyB0byBvdmVycmlkZSBkZWZhdWx0IGJlaGF2aW9yLlxuICAqIEBwYXJhbSB7cGF0aH0gZG9jc19wYXRoIC0gd2hpY2ggZm9sZGVyIGNvbnRhaW5zIHRoZSBkb2N1bWVudHMuXG4gICogQHBhcmFtIHtwYXRofSBtb2RlbHNfcGF0aCAtIHdoaWNoIGZvbGRlciBjb250YWlucyB0aGUgbW9kZWxzIHRvIHVzZS5cbiAgKiBAcGFyYW0ge3BhdGh9IGFzc2V0c19wYXRoIC0gd2hpY2ggZm9sZGVyIGNvbnRhaW5zIHRoZSBhc3NldHMgdG8gdXNlIGlmIGFueS5cbiAgKi9cbiAgY29uc3RydWN0b3Iocm9vdCwgb3B0aW9ucykge1xuICAgIHRoaXMucm9vdCAgICAgICAgID0gcGF0aC5yZXNvbHZlKHJvb3QpXG4gICAgdGhpcy5uYW1lICAgICAgICAgPSBvcHRpb25zLm5hbWUgfHwgcGF0aC5iYXNlbmFtZShyb290KVxuICAgIHRoaXMucGFyZW50Rm9sZGVyID0gcGF0aC5kaXJuYW1lKHJvb3QpXG5cbiAgICB0aGlzLm9wdGlvbnMgPSBvcHRpb25zIHx8IHt9XG4gICAgXG4gICAgdGhpcy5pbmRleCA9IHt9XG4gICAgdGhpcy5tb2RlbF9kZWZpbml0aW9ucyA9IHt9XG4gICAgXG4gICAgdGhpcy5jb25maWcgPSB7XG4gICAgICBkb2NzX3BhdGg6IHBhdGguam9pbih0aGlzLnJvb3QsICdkb2NzJyksXG4gICAgICBtb2RlbHNfcGF0aDogcGF0aC5qb2luKHRoaXMucm9vdCwgJ21vZGVscycpLFxuICAgICAgYXNzZXRzX3BhdGg6IHBhdGguam9pbih0aGlzLnJvb3QsICdhc3NldHMnKVxuICAgIH1cbiAgICBcbiAgICB0aGlzLnNldHVwKClcbiAgICBfX2NhY2hlW3RoaXMucm9vdF0gPSB0aGlzXG4gIH1cbiAgXG4gIGdldCBtYW5pZmVzdENvbmZpZygpe1xuICAgIGxldCBiYXNlID0ge31cbiAgICBsZXQgbWFuaWZlc3QgPSB0aGlzLm1hbmlmZXN0IFxuXG4gICAgaWYgKF8uaXNFbXB0eShtYW5pZmVzdCkpIHsgcmV0dXJuIHt9IH1cblxuICAgIGlmKG1hbmlmZXN0LmJyaWVmKXsgYmFzZS5icmllZiA9IG1hbmlmZXN0LmJyaWVmIH1cblxuICAgIHJldHVybiB0aGlzLnBsdWdpbk5hbWVzLnJlZHVjZSgobWVtbyxwbHVnaW4pPT57XG4gICAgICBpZihtYW5pZmVzdFtwbHVnaW5dKXtcbiAgICAgICAgbWVtb1twbHVnaW5dID0gbWFuaWZlc3RbcGx1Z2luXVxuICAgICAgfVxuXG4gICAgICByZXR1cm4gbWVtb1xuICAgIH0sIGJhc2UpXG4gIH1cblxuICAvLyBSZXR1cm5zIHRoZSBtYW5pZmVzdCBkYXRhIGZyb20gdGhlIHBhY2thZ2UuanNvbiBtYW5pZmVzdFxuICBnZXQgbWFuaWZlc3QoKXtcbiAgICBpZihmcy5leGlzdHNTeW5jKHBhdGguam9pbih0aGlzLnJvb3QsICdwYWNrYWdlLmpzb24nKSkpe1xuICAgICAgcmV0dXJuIEpTT04ucGFyc2UoZnMucmVhZEZpbGVTeW5jKHBhdGguam9pbih0aGlzLnJvb3QsICdwYWNrYWdlLmpzb24nKSkpXG4gICAgfVxuICB9XG4gIFxuICB0b0pTT04ob3B0aW9ucz17fSl7XG4gICAgcmV0dXJuIHRoaXMuZXhwb3J0V2l0aChcInN0YW5kYXJkXCIsIG9wdGlvbnMpXG4gIH1cblxuICBleHBvcnRXaXRoKGV4cG9ydGVyRm9ybWF0PVwic3RhbmRhcmRcIiwgb3B0aW9ucyA9IHt9KXtcbiAgICByZXR1cm4gZXhwb3J0ZXJzLmNhY2hlZCh0aGlzLCBleHBvcnRlckZvcm1hdCwgb3B0aW9ucylcbiAgfVxuXG4gIGNvbXB1dGVDYWNoZUtleSgpe1xuICAgIGxldCBtb2RpZmllZFRpbWVzID0gdGhpcy5nZXRBbGxNb2RlbHMoKS5tYXAobW9kZWwgPT4gbW9kZWwubGFzdE1vZGlmaWVkQXQoKSkuc29ydCgpXG4gICAgbGV0IGxhdGVzdCA9IG1vZGlmaWVkVGltZXNbbW9kaWZpZWRUaW1lcy5sZW5ndGggLSAxXVxuICAgIHJldHVybiBbdGhpcy5uYW1lLCBtb2RpZmllZFRpbWVzLmxlbmd0aCwgbGF0ZXN0XS5qb2luKCc6JylcbiAgfVxuICBcbiAgaXNTdGFsZSgpe1xuICAgIHJldHVybiAodGhpcy5jYWNoZUtleSAhPSB0aGlzLmNvbXB1dGVDYWNoZUtleSgpKVxuICB9XG4gIFxuICBzZXR1cCgpe1xuICAgIHRoaXMucGx1Z2luTmFtZXMgPSBbXVxuICAgIHJlcXVpcmUoJy4vaW5kZXgnKS5wbHVnaW5zLmZvckVhY2gobW9kaWZpZXIgPT4ge1xuICAgICAgdGhpcy5wbHVnaW5OYW1lcy5wdXNoKG1vZGlmaWVyLnBsdWdpbl9uYW1lIHx8IG1vZGlmaWVyLnBsdWdpbk5hbWUpXG4gICAgICBtb2RpZmllcih0aGlzKVxuICAgIH0pXG4gICAgXG4gICAgdGhpcy5fbG9hZE1vZGVsRGVmaW5pdGlvbnMoKVxuICAgIHRoaXMuX2J1aWxkSW5kZXhGcm9tRGlzaygpXG4gICAgdGhpcy5fY3JlYXRlQ29sbGVjdGlvbnMoKVxuXG4gICAgdGhpcy5jYWNoZUtleSA9IHRoaXMuY29tcHV0ZUNhY2hlS2V5KClcbiAgfVxuICBcbiAgLyoqXG4gICogdXNlIGEgcGx1Z2luIHRvIGxvYWQgbW9kdWxlcywgYWN0aW9ucywgQ0xJIGhlbHBlcnMsIGV0Y1xuICAqL1xuICB1c2UocGx1Z2luLCBvcHRpb25zPXt9KXtcbiAgICBicmllZi51c2UocGx1Z2luKVxuICAgIHRoaXMuc2V0dXAoKVxuICAgIHJldHVybiB0aGlzXG4gIH1cblxuICAvKipcbiAgICogZ2V0IG1vZGVsIGF0IHRoZSBnaXZlbiByZWxhdGl2ZSBwYXRoIFxuICAgKiBcbiAgICogQGV4YW1wbGVcbiAgICogIGJyaWVmY2FzZS5hdCgnZXBpY3MvbW9kZWwtZGVmaW5pdGlvbi1kc2wnKVxuICAqL1xuICBhdChwYXRoX2FsaWFzLCBhYnNvbHV0ZT1mYWxzZSkge1xuICAgIGxldCBkb2NzX3BhdGggPSBwYXRoLnJlc29sdmUodGhpcy5jb25maWcuZG9jc19wYXRoKVxuXG4gICAgaWYoYWJzb2x1dGUpeyBwYXRoX2FsaWFzID0gcGF0aF9hbGlhcy5yZXBsYWNlKGRvY3NfcGF0aCwgJycpIH1cblxuICAgIGlmKCFwYXRoX2FsaWFzLm1hdGNoKC9cXC5tZCQvaSkpe1xuICAgICAgcGF0aF9hbGlhcyA9IHBhdGhfYWxpYXMgKyAnLm1kJyBcbiAgICB9XG5cbiAgICByZXR1cm4gdGhpcy5pbmRleFtwYXRoX2FsaWFzLnJlcGxhY2UoL15cXC8vLCcnKV1cbiAgfVxuXG4gIGZpbmREb2N1bWVudEJ5UGF0aChwYXRoKXtcbiAgICByZXR1cm4gdGhpcy5hdFBhdGgocGF0aF9hbGlhcywgdHJ1ZSlcbiAgfVxuICAvKipcbiAgKiBnZXQgbW9kZWxzIGF0IGVhY2ggb2YgdGhlIHBhdGhzIHJlcHJlc2VudGVkXG4gICogYnkgdGhlIGdsb2IgcGF0dGVybiBwYXNzZWQgaGVyZS5cbiAgKi9cbiAgZ2xvYihwYXR0ZXJuPVwiKiovKi5tZFwiKSB7XG4gICAgbGV0IG1hdGNoaW5nRmlsZXMgPSBnbG9iLnN5bmMocGF0aC5qb2luKHRoaXMucm9vdCwgcGF0dGVybikpXG4gICAgcmV0dXJuIG1hdGNoaW5nRmlsZXMubWFwKHBhdGggPT4gdGhpcy5hdChwYXRoLHRydWUpKSBcbiAgfVxuXG4gIC8qKlxuICAgKiBmaWx0ZXJzIGFsbCBhdmFpbGFibGUgbW9kZWxzIGJ5IHRoZSBnaXZlbiBpdGVyYXRvclxuICAgKlxuICAgKiBAZXhhbXBsZVxuICAgKiAgYnJpZWZjYXNlLmZpbHRlckFsbChtb2RlbCA9PiBtb2RlbC5zdGF0dXMgPT09ICdhY3RpdmUnKVxuICAqL1xuICBmaWx0ZXJBbGwgKGl0ZXJhdG9yKSB7XG4gICAgcmV0dXJuIHRoaXMuZ2V0QWxsTW9kZWxzKCkuZmlsdGVyKGl0ZXJhdG9yKVxuICB9XG4gIFxuICBmaW5kTW9kZWxzQnlEZWZpbml0aW9uKGRlZmluaXRpb24pe1xuICAgIGxldCBncm91cE5hbWUgPSBkZWZpbml0aW9uLmdyb3VwTmFtZVxuICAgIHJldHVybiB0aGlzLmZpbHRlckFsbChtb2RlbCA9PiBtb2RlbC5ncm91cE5hbWUgPT09IGdyb3VwTmFtZSlcbiAgfVxuICAgXG4gIC8qKlxuICAgKiBmaWx0ZXJzIG1vZGVscyBieSB0aGUgcHJvcGVydHkgYW5kIGRlc2lyZWQgdmFsdWVcbiAgICogXG4gICAqIEBwYXJhbSB7c3RyaW5nfSBwcm9wZXJ0eSAtIG5hbWUgb2YgdGhlIHByb3BlcnR5IHRvIGZpbHRlciBvbiBcbiAgICogQHBhcmFtIHthbnl9IGRlc2lyZWRWYWx1ZSAtIHRoZSB2YWx1ZSB0byBtYXRjaCBhZ2FpbnN0XG4gICAqXG4gICAqIEByZXR1cm4ge2FycmF5fSAtIG1vZGVscyB3aG9zZSBwcm9wZXJ0eSBtYXRjaGVzIGRlc2lyZWRWYWx1ZSBcbiAgKi9cbiAgZmlsdGVyQWxsQnlQcm9wZXJ0eSAocHJvcGVydHksIGRlc2lyZWRWYWx1ZSkge1xuICAgIHJldHVybiB0aGlzLmZpbHRlckFsbChtb2RlbCA9PiBtb2RlbFtwcm9wZXJ0eV0gPT09IGRlc2lyZWRWYWx1ZSlcbiAgfVxuICBcbiAgLyoqXG4gICAqIHNlbGVjdHMgYWxsIHRoZSBtb2RlbHMgd2hvc2UgdHlwZSBtYXRjaGVzIHRoZSBzdXBwbGllZCBhcmcgXG4gICovXG4gIHNlbGVjdE1vZGVsc0J5VHlwZSAodHlwZSkge1xuICAgIHJldHVybiB0aGlzLmZpbHRlckFsbEJ5UHJvcGVydHkoJ3R5cGUnLCB0eXBlKVxuICB9XG5cbiAgLyoqXG4gICAqIHNlbGVjdHMgYWxsIHRoZSBtb2RlbHMgd2hvc2UgZ3JvdXBOYW1lIG1hdGNoZXMgdGhlIHN1cHBsaWVkIGFyZyBcbiAgKi9cbiAgc2VsZWN0TW9kZWxzQnlHcm91cCAoZ3JvdXBOYW1lKSB7XG4gICAgcmV0dXJuIHRoaXMuZmlsdGVyQWxsQnlQcm9wZXJ0eSgnZ3JvdXBOYW1lJywgZ3JvdXBOYW1lKVxuICB9XG4gIFxuICAvKipcbiAgICogcmV0dXJucyBhbGwgdGhlIG1vZGVscyBpbiB0aGlzIGJyaWVmY2FzZVxuICAqL1xuICBnZXRBbGxNb2RlbHMoKSB7XG4gICAgcmV0dXJuIE9iamVjdC5rZXlzKHRoaXMuaW5kZXgpLm1hcChrZXkgPT4gdGhpcy5pbmRleFtrZXldKVxuICB9XG4gIFxuICAvKipcbiAgICogcmV0dXJucyB0aGUgcmF3IGRvY3VtZW50cyBpbiB0aGlzIGJyaWVmY2FzZVxuICAqL1xuICBnZXRBbGxEb2N1bWVudHMgKCkge1xuICAgIHJldHVybiB0aGlzLmdldEFsbE1vZGVscygpLm1hcChtb2RlbCA9PiBtb2RlbC5kb2N1bWVudClcbiAgfVxuICBcbiAgLyoqXG4gICogQXJjaGl2ZXMgdGhlIGJyaWVmY2FzZSBpbnRvIGEgemlwIGZpbGUuIEJyaWVmY2FzZXNcbiAgKiBjYW4gYmUgY3JlYXRlZCBkaXJlY3RseSBmcm9tIHppcCBmaWxlcyBpbiB0aGUgZnV0dXJlLlxuICAqXG4gICogQHBhcmFtIHtzdHJpbmd9IGxvY2F0aW9uIC0gd2hlcmUgdG8gc3RvcmUgdGhlIGZpbGU/XG4gICogQHBhcmFtIHthcnJheX0gaWdub3JlIC0gYSBsaXN0IG9mIGZpbGVzIHRvIGlnbm9yZSBhbmQgbm90IHB1dCBpbiB0aGVcbiAgKiAgIGFyY2hpdmVcbiAgKi9cbiAgYXJjaGl2ZShsb2NhdGlvbiwgaWdub3JlPVtdKSB7XG4gICAgbG9jYXRpb24gPSBsb2NhdGlvbiB8fCBcbiAgICBpZ25vcmUucHVzaChsb2NhdGlvbilcblxuICAgIG5ldyBQYWNrYWdlcih0aGlzLCBpZ25vcmUpLnBlcnNpc3QobG9jYXRpb24pXG4gIH1cbiAgXG4gIGdldEdyb3VwTmFtZXMgKCkge1xuICAgIGxldCB0eXBlcyA9IHRoaXMuZ2V0RG9jdW1lbnRUeXBlcygpXG4gICAgcmV0dXJuIHR5cGVzLm1hcCh0eXBlID0+IHBsdXJhbGl6ZSh0eXBlIHx8IFwiXCIpKVxuICB9XG5cbiAgZ2V0RG9jdW1lbnRUeXBlcyAoKSB7XG4gICAgbGV0IHR5cGVzID0gW11cblxuICAgIHRoaXMuZ2V0QWxsRG9jdW1lbnRzKCkuZm9yRWFjaCgoZG9jKT0+e1xuICAgICAgdHlwZXMucHVzaChkb2MuZ2V0VHlwZSgpKVxuICAgIH0pXG5cbiAgICByZXR1cm4gXyh0eXBlcykudW5pcSgpXG4gIH1cbiAgXG4gIGxvYWRNb2RlbERlZmluaXRpb24ocGF0aCl7XG4gICAgcmV0dXJuIHRoaXMubG9hZE1vZGVsKE1vZGVsRGVmaW5pdGlvbi5sb2FkKHBhdGgpKVxuICB9XG5cbiAgbG9hZE1vZGVsIChkZWZpbml0aW9uKSB7XG4gICAgdGhpcy5tb2RlbF9kZWZpbml0aW9uc1tkZWZpbml0aW9uLm5hbWVdID0gdHJ1ZVxuICAgIHJldHVybiBkZWZpbml0aW9uXG4gIH1cblxuICBsb2FkZWRNb2RlbERlZmluaXRpb25zICgpIHtcbiAgICByZXR1cm4gT2JqZWN0LmtleXModGhpcy5tb2RlbF9kZWZpbml0aW9ucylcbiAgfVxuXG4gIGdldE1vZGVsRGVmaW5pdGlvbnMgKCkgeyBcbiAgICByZXR1cm4gTW9kZWxEZWZpbml0aW9uLmdldEFsbCgpXG4gIH1cblxuICBnZXRNb2RlbERlZmluaXRpb24gKG1vZGVsTmFtZU9yQWxpYXMpIHtcbiAgICByZXR1cm4gTW9kZWxEZWZpbml0aW9uLmxvb2t1cChtb2RlbE5hbWVPckFsaWFzKVxuICB9XG5cbiAgZ2V0VHlwZUFsaWFzZXMgKCl7XG4gICAgcmV0dXJuIE1vZGVsRGVmaW5pdGlvbi5nZXRUeXBlQWxpYXNlcygpXG4gIH1cblxuICBnZXRNb2RlbFNjaGVtYSAoKSB7XG4gICAgcmV0dXJuIE1vZGVsRGVmaW5pdGlvbi5nZXRNb2RlbFNjaGVtYSgpXG4gIH1cblxuICBnZXRBbGxGaWxlcyh1c2VBYnNvbHV0ZVBhdGhzPWZhbHNlKXtcbiAgICBsZXQgYWxsRmlsZXMgPSBnbG9iLnN5bmMocGF0aC5qb2luKHRoaXMucm9vdCwgJyoqLyonKSlcbiAgICByZXR1cm4gdXNlQWJzb2x1dGVQYXRocyA/IGFsbEZpbGVzIDogYWxsRmlsZXMubWFwKGYgPT4gZi5yZXBsYWNlKHRoaXMucm9vdCArICcvJywgJycpKVxuICB9XG4gXG4gIF9jcmVhdGVDb2xsZWN0aW9ucygpIHtcbiAgICBjb25zdCBicmllZmNhc2UgPSB0aGlzXG5cbiAgICB0aGlzLmdldERvY3VtZW50VHlwZXMoKS5mb3JFYWNoKHR5cGUgPT4ge1xuICAgICAgbGV0IGdyb3VwICAgICAgID0gcGx1cmFsaXplKHR5cGUpXG4gICAgICBsZXQgZGVmaW5pdGlvbiAgPSB0aGlzLmdldE1vZGVsRGVmaW5pdGlvbih0eXBlKVxuICAgICAgXG4gICAgICBsZXQgZmV0Y2ggPSAoKT0+IHtcbiAgICAgICAgcmV0dXJuIHRoaXMuc2VsZWN0TW9kZWxzQnlUeXBlKHR5cGUpXG4gICAgICB9XG5cbiAgICAgIGJyaWVmY2FzZVtncm91cF0gPSBicmllZmNhc2VbZ3JvdXBdIHx8IGNvbGxlY3Rpb24oZmV0Y2gsIGRlZmluaXRpb24pIFxuICAgIH0pXG4gIH1cbiBcbiAgX2dldERvY3VtZW50UGF0aHMoKSB7XG4gICAgbGV0IGRvY3NfcGF0aCA9IHBhdGgucmVzb2x2ZSh0aGlzLmNvbmZpZy5kb2NzX3BhdGgpXG4gICAgcmV0dXJuIGdsb2Iuc3luYyhwYXRoLmpvaW4oZG9jc19wYXRoLCcqKi8qLm1kJykpXG4gIH1cblxuICBfbG9hZE1vZGVsRGVmaW5pdGlvbnMoKXtcbiAgICBNb2RlbERlZmluaXRpb24ubG9hZERlZmluaXRpb25zRnJvbVBhdGgodGhpcy5jb25maWcubW9kZWxzX3BhdGgpXG4gICAgTW9kZWxEZWZpbml0aW9uLmdldEFsbCgpLmZvckVhY2goZGVmaW5pdGlvbiA9PiB0aGlzLmxvYWRNb2RlbChkZWZpbml0aW9uKSlcbiAgICBNb2RlbERlZmluaXRpb24uZmluYWxpemUoKVxuICB9XG5cbiAgX2J1aWxkSW5kZXhGcm9tRGlzaygpIHtcbiAgICBsZXQgcGF0aHMgPSB0aGlzLl9nZXREb2N1bWVudFBhdGhzKClcbiAgICBsZXQgYnJpZWZjYXNlID0gdGhpc1xuXG4gICAgcGF0aHMuZm9yRWFjaCgocGF0aCk9PntcbiAgICAgIGxldCBwYXRoX2FsaWFzID0gcGF0aC5yZXBsYWNlKHRoaXMuY29uZmlnLmRvY3NfcGF0aCArICcvJywgJycpXG4gICAgICBsZXQgaWQgPSBwYXRoX2FsaWFzLnJlcGxhY2UoJy5tZCcsJycpXG4gICAgICBsZXQgZG9jdW1lbnQgPSBuZXcgRG9jdW1lbnQocGF0aCwge2lkOiBpZH0pXG4gICAgICBsZXQgbW9kZWwgPSBkb2N1bWVudC50b01vZGVsKHtpZDogaWR9KSBcbiAgICAgIFxuICAgICAgZG9jdW1lbnQuaWQgPSBwYXRoX2FsaWFzXG4gICAgICBkb2N1bWVudC5yZWxhdGl2ZV9wYXRoID0gJ2RvY3MvJyArIHBhdGhfYWxpYXNcbiAgICAgIG1vZGVsLmlkID0gaWRcbiAgICAgIG1vZGVsLmdldFBhcmVudCA9ICgpPT57IFxuICAgICAgICByZXR1cm4gdGhpc1xuICAgICAgfVxuXG4gICAgICB0aGlzLmluZGV4W3BhdGhfYWxpYXNdID0gbW9kZWxcbiAgICB9KVxuICB9XG5cbn1cbiJdfQ==