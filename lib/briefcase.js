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
    */

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

    this._loadModelDefinitions();
    this._buildIndexFromDisk();
    this._createCollections();
  }

  /**
   * get model at the given relative path 
   * 
   * @example
   *  briefcase.at('epics/model-definition-dsl')
  */

  _createClass(Briefcase, [{
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

    /**
    * get models at each of the paths represented
    * by the glob pattern passed here.
    */
  }, {
    key: 'glob',
    value: function glob() {
      var _this = this;

      var pattern = arguments.length <= 0 || arguments[0] === undefined ? "**/*.md" : arguments[0];

      var matchingFiles = _globAll2['default'].sync(_path2['default'].join(this.root, pattern));
      return matchingFiles.map(function (path) {
        return _this.at(path, true);
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
      return this.getAllModels(iterator);
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
      return Object.values(this.index);
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
    key: 'loadModel',
    value: function loadModel(definition) {
      this.model_definitions[definition.name] = definition;
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
      var _this2 = this;

      var useAbsolutePaths = arguments.length <= 0 || arguments[0] === undefined ? false : arguments[0];

      var allFiles = _globAll2['default'].sync(_path2['default'].join(this.root, '**/*'));
      return useAbsolutePaths ? allFiles : allFiles.map(function (f) {
        return f.replace(_this2.root + '/', '');
      });
    }
  }, {
    key: '_createCollections',
    value: function _createCollections() {
      var _this3 = this;

      var briefcase = this;

      this.getDocumentTypes().forEach(function (type) {
        var group = pluralize(type);
        var definition = _this3.getModelDefinition(type);

        var fetch = function fetch() {
          return _this3.selectModelsByGroup(group);
        };

        briefcase[group] = (0, _collection2['default'])(fetch, definition);
      });
    }
  }, {
    key: '_getDocumentPaths',
    value: function _getDocumentPaths() {
      var docs_path = _path2['default'].resolve(this.config.docs_path);
      return _globAll2['default'].sync(_path2['default'].join(docs_path, '**/*.md'));
    }
  }, {
    key: '_getModelDefinitionFiles',
    value: function _getModelDefinitionFiles() {
      var models_path = _path2['default'].resolve(this.config.models_path);
      return _globAll2['default'].sync(_path2['default'].join(models_path, '**/*.js'));
    }
  }, {
    key: '_loadModelDefinitions',
    value: function _loadModelDefinitions() {
      var _this4 = this;

      this._getModelDefinitionFiles().forEach(function (file) {
        return _model_definition2['default'].load(file);
      });
      _model_definition2['default'].getAll().forEach(function (definition) {
        return _this4.loadModel(definition);
      });
    }
  }, {
    key: '_buildIndexFromDisk',
    value: function _buildIndexFromDisk() {
      var _this5 = this;

      var paths = this._getDocumentPaths();
      var briefcase = this;

      paths.forEach(function (path) {
        var path_alias = path.replace(_this5.config.docs_path + '/', '');
        var id = path_alias.replace('.md', '');
        var document = new _document2['default'](path, { id: id });
        var model = document.toModel({ id: id });

        document.id = path_alias;
        document.relative_path = 'docs/' + path_alias;
        model.id = id;
        model.getParent = function () {
          return _this5;
        };

        _this5.index[path_alias] = model;
      });
    }
  }]);

  return Briefcase;
})();

exports['default'] = Briefcase;
module.exports = exports['default'];
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3NyYy9icmllZmNhc2UuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7O3VCQUFpQixVQUFVOzs7O29CQUNWLE1BQU07Ozs7d0JBQ0YsWUFBWTs7OzswQkFDVixjQUFjOzs7O3FCQUNuQixTQUFTOzs7O2dDQUNDLG9CQUFvQjs7OztpQkFDeEIsR0FBRzs7Ozt3QkFDTixZQUFZOzs7OzBCQUNuQixZQUFZOzs7O0FBRTFCLElBQU0sT0FBTyxHQUFHLG9CQUFZLElBQUksQ0FBQyxDQUFBO0FBQ2pDLElBQU0sU0FBUyxHQUFHLE9BQU8sQ0FBQyxTQUFTLENBQUE7O0lBRWQsU0FBUztlQUFULFNBQVM7Ozs7Ozs7Ozs7V0FRakIsY0FBQyxRQUFRLEVBQWM7VUFBWixPQUFPLHlEQUFDLEVBQUU7O0FBQzlCLGFBQU8sSUFBSSxTQUFTLENBQUMsUUFBUSxFQUFDLE9BQU8sQ0FBQyxDQUFBO0tBQ3ZDOzs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBaUJVLFdBM0JRLFNBQVMsQ0EyQmhCLElBQUksRUFBRSxPQUFPLEVBQUU7MEJBM0JSLFNBQVM7O0FBNEIxQixRQUFJLENBQUMsSUFBSSxHQUFXLGtCQUFLLE9BQU8sQ0FBQyxJQUFJLENBQUMsQ0FBQTtBQUN0QyxRQUFJLENBQUMsSUFBSSxHQUFXLE9BQU8sQ0FBQyxJQUFJLElBQUksa0JBQUssUUFBUSxDQUFDLElBQUksQ0FBQyxDQUFBO0FBQ3ZELFFBQUksQ0FBQyxZQUFZLEdBQUcsa0JBQUssT0FBTyxDQUFDLElBQUksQ0FBQyxDQUFBOztBQUV0QyxRQUFJLENBQUMsT0FBTyxHQUFHLE9BQU8sSUFBSSxFQUFFLENBQUE7O0FBRTVCLFFBQUksQ0FBQyxLQUFLLEdBQUcsRUFBRSxDQUFBO0FBQ2YsUUFBSSxDQUFDLGlCQUFpQixHQUFHLEVBQUUsQ0FBQTs7QUFFM0IsUUFBSSxDQUFDLE1BQU0sR0FBRztBQUNaLGVBQVMsRUFBRSxrQkFBSyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksRUFBRSxNQUFNLENB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TUFBTSxFQUFFLENBQUMsT0FBTyxDQUFDLFVBQUEsVUFBVTtlQUFJLE9BQUssU0FBUyxDQUFDLFVBQVUsQ0FBQztPQUFBLENBQUMsQ0FBQTtLQUMzRTs7O1dBRWtCLCtCQUFHOzs7QUFDcEIsVUFBSSxLQUFLLEdBQUcsSUFBSSxDQUFDLGlCQUFpQixFQUFFLENBQUE7QUFDcEMsVUFBSSxTQUFTLEdBQUcsSUFBSSxDQUFBOztBQUVwQixXQUFLLENBQUMsT0FBTyxDQUFDLFVBQUMsSUFBSSxFQUFHO0FBQ3BCLFlBQUksVUFBVSxHQUFHLElBQUksQ0FBQyxPQUFPLENBQUMsT0FBSyxNQUFNLENBQUMsU0FBUyxHQUFHLEdBQUcsRUFBRSxFQUFFLENBQUMsQ0FBQTtBQUM5RCxZQUFJLEVBQUUsR0FBRyxVQUFVLENBQUMsT0FBTyxDQUFDLEtBQUssRUFBQyxFQUFFLENBQUMsQ0FBQTtBQUNyQyxZQUFJLFFBQVEsR0FBRywwQkFBYSxJQUFJLEVBQUUsRUFBQyxFQUFFLEVBQUUsRUFBRSxFQUFDLENBQUMsQ0FBQTtBQUMzQyxZQUFJLEtBQUssR0FBRyxRQUFRLENBQUMsT0FBTyxDQUFDLEVBQUMsRUFBRSxFQUFFLEVBQUUsRUFBQyxDQUFDLENBQUE7O0FBR3RDLGdCQUFRLENBQUMsRUFBRSxHQUFHLFVBQVUsQ0FBQTtBQUN4QixnQkFBUSxDQUFDLGFBQWEsR0FBRyxPQUFPLEdBQUcsVUFBVSxDQUFBO0FBQzdDLGFBQUssQ0FBQyxFQUFFLEdBQUcsRUFBRSxDQUFBO0FBQ2IsYUFBSyxDQUFDLFNBQVMsR0FBRyxZQUFJO0FBQ3BCLHdCQUFXO1NBQ1osQ0FBQTs7QUFFRCxlQUFLLEtBQUssQ0FBQyxVQUFVLENBQUMsR0FBRyxLQUFLLENBQUE7T0FDL0IsQ0FBQyxDQUFBO0tBQ0g7OztTQTNPa0IsU0FBUzs7O3FCQUFULFNBQVMiLCJmaWxlIjoiYnJpZWZjYXNlLmpzIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IGdsb2IgZnJvbSAnZ2xvYi1hbGwnXG5pbXBvcnQgcGF0aCBmcm9tICdwYXRoJ1xuaW1wb3J0IERvY3VtZW50IGZyb20gJy4vZG9jdW1lbnQnXG5pbXBvcnQgY29sbGVjdGlvbiBmcm9tICcuL2NvbGxlY3Rpb24nXG5pbXBvcnQgTW9kZWwgZnJvbSAnLi9tb2RlbCdcbmltcG9ydCBNb2RlbERlZmluaXRpb24gZnJvbSAnLi9tb2RlbF9kZWZpbml0aW9uJ1xuaW1wb3J0IGluZmxlY3Rpb25zIGZyb20gJ2knXG5pbXBvcnQgUGFja2FnZXIgZnJvbSAnLi9wYWNrYWdlcidcbmltcG9ydCBfIGZyb20gJ3VuZGVyc2NvcmUnXG5cbmNvbnN0IGluZmxlY3QgPSBpbmZsZWN0aW9ucyh0cnVlKVxuY29uc3QgcGx1cmFsaXplID0gaW5mbGVjdC5wbHVyYWxpemVcblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgQnJpZWZjYXNlIHtcbiAgLyoqXG4gICogTG9hZCBhIGJyaWVmY2FzZSBieSBwYXNzaW5nIGEgcGF0aCB0byBhIHJvb3QgZm9sZGVyLlxuICAqXG4gICogQHBhcmFtIHtzdHJpbmd9IHJvb3RQYXRoIC0gdGhlIHJvb3QgcGF0aCBvZiB0aGUgYnJpZWZjYXNlLlxuICAqIEByZXR1cm4ge0JyaWVmY2FzZX0gLSByZXR1cm5zIGEgYnJpZWZjYXNlXG4gICpcbiAgKi9cbiAgc3RhdGljIGxvYWQocm9vdFBhdGgsIG9wdGlvbnM9e30pIHtcbiAgICByZXR1cm4gbmV3IEJyaWVmY2FzZShyb290UGF0aCxvcHRpb25zKVxuICB9XG4gXG4gIC8qKlxuICAqL1xuXG4gIC8qKlxuICAqIENyZWF0ZSBhIG5ldyBCcmllZmNhc2Ugb2JqZWN0IGF0IHRoZSBzcGVjaWZpZWQgcm9vdCBwYXRoLlxuICAqXG4gICogQHBhcmFtIHtwYXRofSByb290IC0gdGhlIHJvb3QgcGF0aCBvZiB0aGUgYnJpZWZjYXNlLiBleHBlY3RzXG4gICogICB0byBmaW5kIGEgY29uZmlnIGZpbGUgXCJicmllZi5jb25maWcuanNcIiwgYW5kIGF0IGxlYXN0IGEgXG4gICogICBkb2N1bWVudHMgZm9sZGVyLlxuICAqXG4gICogQHBhcmFtIHtvcHRpb25zfSBvcHRpb25zIC0gb3B0aW9ucyB0byBvdmVycmlkZSBkZWZhdWx0IGJlaGF2aW9yLlxuICAqIEBwYXJhbSB7cGF0aH0gZG9jc19wYXRoIC0gd2hpY2ggZm9sZGVyIGNvbnRhaW5zIHRoZSBkb2N1bWVudHMuXG4gICogQHBhcmFtIHtwYXRofSBtb2RlbHNfcGF0aCAtIHdoaWNoIGZvbGRlciBjb250YWlucyB0aGUgbW9kZWxzIHRvIHVzZS5cbiAgKiBAcGFyYW0ge3BhdGh9IGFzc2V0c19wYXRoIC0gd2hpY2ggZm9sZGVyIGNvbnRhaW5zIHRoZSBhc3NldHMgdG8gdXNlIGlmIGFueS5cbiAgKi9cbiAgY29uc3RydWN0b3Iocm9vdCwgb3B0aW9ucykge1xuICAgIHRoaXMucm9vdCAgICAgICAgID0gcGF0aC5yZXNvbHZlKHJvb3QpXG4gICAgdGhpcy5uYW1lICAgICAgICAgPSBvcHRpb25zLm5hbWUgfHwgcGF0aC5iYXNlbmFtZShyb290KVxuICAgIHRoaXMucGFyZW50Rm9sZGVyID0gcGF0aC5kaXJuYW1lKHJvb3QpXG5cbiAgICB0aGlzLm9wdGlvbnMgPSBvcHRpb25zIHx8IHt9XG5cbiAgICB0aGlzLmluZGV4ID0ge31cbiAgICB0aGlzLm1vZGVsX2RlZmluaXRpb25zID0ge31cbiAgICBcbiAgICB0aGlzLmNvbmZpZyA9IHtcbiAgICAgIGRvY3NfcGF0aDogcGF0aC5qb2luKHRoaXMucm9vdCwgJ2RvY3MnKSxcbiAgICAgIG1vZGVsc19wYXRoOiBwYXRoLmpvaW4odGhpcy5yb290LCAnbW9kZWxzJyksXG4gICAgICBhc3NldHNfcGF0aDogcGF0aC5qb2luKHRoaXMucm9vdCwgJ2Fzc2V0cycpXG4gICAgfVxuICAgIFxuICAgIHRoaXMuX2xvYWRNb2RlbERlZmluaXRpb25zKClcbiAgICB0aGlzLl9idWlsZEluZGV4RnJvbURpc2soKVxuICAgIHRoaXMuX2NyZWF0ZUNvbGxlY3Rpb25zKClcbiAgfVxuICBcbiAgLyoqXG4gICAqIGdldCBtb2RlbCBhdCB0aGUgZ2l2ZW4gcmVsYXRpdmUgcGF0aCBcbiAgICogXG4gICAqIEBleGFtcGxlXG4gICAqICBicmllZmNhc2UuYXQoJ2VwaWNzL21vZGVsLWRlZmluaXRpb24tZHNsJylcbiAgKi9cbiAgYXQocGF0aF9hbGlhcywgYWJzb2x1dGU9ZmFsc2UpIHtcbiAgICBsZXQgZG9jc19wYXRoID0gcGF0aC5yZXNvbHZlKHRoaXMuY29uZmlnLmRvY3NfcGF0aClcblxuICAgIGlmKGFic29sdXRlKXsgcGF0aF9hbGlhcyA9IHBhdGhfYWxpYXMucmVwbGFjZShkb2NzX3BhdGgsICcnKSB9XG5cbiAgICBpZighcGF0aF9hbGlhcy5tYXRjaCgvXFwubWQkL2kpKXtcbiAgICAgIHBhdGhfYWxpYXMgPSBwYXRoX2FsaWFzICsgJy5tZCcgXG4gICAgfVxuXG4gICAgcmV0dXJuIHRoaXMuaW5kZXhbcGF0aF9hbGlhcy5yZXBsYWNlKC9eXFwvLywnJyldXG4gIH1cbiAgICBcbiAgLyoqXG4gICogZ2V0IG1vZGVscyBhdCBlYWNoIG9mIHRoZSBwYXRocyByZXByZXNlbnRlZFxuICAqIGJ5IHRoZSBnbG9iIHBhdHRlcm4gcGFzc2VkIGhlcmUuXG4gICovXG4gIGdsb2IocGF0dGVybj1cIioqLyoubWRcIikge1xuICAgIGxldCBtYXRjaGluZ0ZpbGVzID0gZ2xvYi5zeW5jKHBhdGguam9pbih0aGlzLnJvb3QsIHBhdHRlcm4pKVxuICAgIHJldHVybiBtYXRjaGluZ0ZpbGVzLm1hcChwYXRoID0+IHRoaXMuYXQocGF0aCx0cnVlKSkgXG4gIH1cblxuICAvKipcbiAgICogZmlsdGVycyBhbGwgYXZhaWxhYmxlIG1vZGVscyBieSB0aGUgZ2l2ZW4gaXRlcmF0b3JcbiAgICpcbiAgICogQGV4YW1wbGVcbiAgICogIGJyaWVmY2FzZS5maWx0ZXJBbGwobW9kZWwgPT4gbW9kZWwuc3RhdHVzID09PSAnYWN0aXZlJylcbiAgKi9cbiAgZmlsdGVyQWxsIChpdGVyYXRvcikge1xuICAgIHJldHVybiB0aGlzLmdldEFsbE1vZGVscyhpdGVyYXRvcilcbiAgfVxuICBcbiAgLyoqXG4gICAqIGZpbHRlcnMgbW9kZWxzIGJ5IHRoZSBwcm9wZXJ0eSBhbmQgZGVzaXJlZCB2YWx1ZVxuICAgKiBcbiAgICogQHBhcmFtIHtzdHJpbmd9IHByb3BlcnR5IC0gbmFtZSBvZiB0aGUgcHJvcGVydHkgdG8gZmlsdGVyIG9uIFxuICAgKiBAcGFyYW0ge2FueX0gZGVzaXJlZFZhbHVlIC0gdGhlIHZhbHVlIHRvIG1hdGNoIGFnYWluc3RcbiAgICpcbiAgICogQHJldHVybiB7YXJyYXl9IC0gbW9kZWxzIHdob3NlIHByb3BlcnR5IG1hdGNoZXMgZGVzaXJlZFZhbHVlIFxuICAqL1xuICBmaWx0ZXJBbGxCeVByb3BlcnR5IChwcm9wZXJ0eSwgZGVzaXJlZFZhbHVlKSB7XG4gICAgcmV0dXJuIHRoaXMuZmlsdGVyQWxsKG1vZGVsID0+IG1vZGVsW3Byb3BlcnR5XSA9PT0gZGVzaXJlZFZhbHVlKVxuICB9XG4gIFxuICAvKipcbiAgICogc2VsZWN0cyBhbGwgdGhlIG1vZGVscyB3aG9zZSB0eXBlIG1hdGNoZXMgdGhlIHN1cHBsaWVkIGFyZyBcbiAgKi9cbiAgc2VsZWN0TW9kZWxzQnlUeXBlICh0eXBlKSB7XG4gICAgcmV0dXJuIHRoaXMuZmlsdGVyQWxsQnlQcm9wZXJ0eSgndHlwZScsIHR5cGUpXG4gIH1cblxuICAvKipcbiAgICogc2VsZWN0cyBhbGwgdGhlIG1vZGVscyB3aG9zZSBncm91cE5hbWUgbWF0Y2hlcyB0aGUgc3VwcGxpZWQgYXJnIFxuICAqL1xuICBzZWxlY3RNb2RlbHNCeUdyb3VwIChncm91cE5hbWUpIHtcbiAgICByZXR1cm4gdGhpcy5maWx0ZXJBbGxCeVByb3BlcnR5KCdncm91cE5hbWUnLCBncm91cE5hbWUpXG4gIH1cbiAgXG4gIC8qKlxuICAgKiByZXR1cm5zIGFsbCB0aGUgbW9kZWxzIGluIHRoaXMgYnJpZWZjYXNlXG4gICovXG4gIGdldEFsbE1vZGVscygpIHtcbiAgICByZXR1cm4gT2JqZWN0LnZhbHVlcyh0aGlzLmluZGV4KVxuICB9XG4gIFxuICAvKipcbiAgICogcmV0dXJucyB0aGUgcmF3IGRvY3VtZW50cyBpbiB0aGlzIGJyaWVmY2FzZVxuICAqL1xuICBnZXRBbGxEb2N1bWVudHMgKCkge1xuICAgIHJldHVybiB0aGlzLmdldEFsbE1vZGVscygpLm1hcChtb2RlbCA9PiBtb2RlbC5kb2N1bWVudClcbiAgfVxuICBcbiAgLyoqXG4gICogQXJjaGl2ZXMgdGhlIGJyaWVmY2FzZSBpbnRvIGEgemlwIGZpbGUuIEJyaWVmY2FzZXNcbiAgKiBjYW4gYmUgY3JlYXRlZCBkaXJlY3RseSBmcm9tIHppcCBmaWxlcyBpbiB0aGUgZnV0dXJlLlxuICAqXG4gICogQHBhcmFtIHtzdHJpbmd9IGxvY2F0aW9uIC0gd2hlcmUgdG8gc3RvcmUgdGhlIGZpbGU/XG4gICogQHBhcmFtIHthcnJheX0gaWdub3JlIC0gYSBsaXN0IG9mIGZpbGVzIHRvIGlnbm9yZSBhbmQgbm90IHB1dCBpbiB0aGVcbiAgKiAgIGFyY2hpdmVcbiAgKi9cbiAgYXJjaGl2ZShsb2NhdGlvbiwgaWdub3JlPVtdKSB7XG4gICAgbG9jYXRpb24gPSBsb2NhdGlvbiB8fCBcbiAgICBpZ25vcmUucHVzaChsb2NhdGlvbilcblxuICAgIG5ldyBQYWNrYWdlcih0aGlzLCBpZ25vcmUpLnBlcnNpc3QobG9jYXRpb24pXG4gIH1cbiAgXG4gIGdldEdyb3VwTmFtZXMgKCkge1xuICAgIGxldCB0eXBlcyA9IHRoaXMuZ2V0RG9jdW1lbnRUeXBlcygpXG4gICAgcmV0dXJuIHR5cGVzLm1hcCh0eXBlID0+IHBsdXJhbGl6ZSh0eXBlIHx8IFwiXCIpKVxuICB9XG5cbiAgZ2V0RG9jdW1lbnRUeXBlcyAoKSB7XG4gICAgbGV0IHR5cGVzID0gW11cblxuICAgIHRoaXMuZ2V0QWxsRG9jdW1lbnRzKCkuZm9yRWFjaCgoZG9jKT0+e1xuICAgICAgdHlwZXMucHVzaChkb2MuZ2V0VHlwZSgpKVxuICAgIH0pXG5cbiAgICByZXR1cm4gXyh0eXBlcykudW5pcSgpXG4gIH1cblxuICBsb2FkTW9kZWwgKGRlZmluaXRpb24pIHtcbiAgICB0aGlzLm1vZGVsX2RlZmluaXRpb25zW2RlZmluaXRpb24ubmFtZV0gPSBkZWZpbml0aW9uXG4gICAgcmV0dXJuIGRlZmluaXRpb25cbiAgfVxuXG4gIGxvYWRlZE1vZGVsRGVmaW5pdGlvbnMgKCkge1xuICAgIHJldHVybiBPYmplY3Qua2V5cyh0aGlzLm1vZGVsX2RlZmluaXRpb25zKVxuICB9XG5cbiAgZ2V0TW9kZWxEZWZpbml0aW9ucyAoKSB7IFxuICAgIHJldHVybiBNb2RlbERlZmluaXRpb24uZ2V0QWxsKClcbiAgfVxuXG4gIGdldE1vZGVsRGVmaW5pdGlvbiAobW9kZWxOYW1lT3JBbGlhcykge1xuICAgIHJldHVybiBNb2RlbERlZmluaXRpb24ubG9va3VwKG1vZGVsTmFtZU9yQWxpYXMpXG4gIH1cblxuICBnZXRUeXBlQWxpYXNlcyAoKXtcbiAgICByZXR1cm4gTW9kZWxEZWZpbml0aW9uLmdldFR5cGVBbGlhc2VzKClcbiAgfVxuXG4gIGdldE1vZGVsU2NoZW1hICgpIHtcbiAgICByZXR1cm4gTW9kZWxEZWZpbml0aW9uLmdldE1vZGVsU2NoZW1hKClcbiAgfVxuXG4gIGdldEFsbEZpbGVzKHVzZUFic29sdXRlUGF0aHM9ZmFsc2Upe1xuICAgIGxldCBhbGxGaWxlcyA9IGdsb2Iuc3luYyhwYXRoLmpvaW4odGhpcy5yb290LCAnKiovKicpKVxuICAgIHJldHVybiB1c2VBYnNvbHV0ZVBhdGhzID8gYWxsRmlsZXMgOiBhbGxGaWxlcy5tYXAoZiA9PiBmLnJlcGxhY2UodGhpcy5yb290ICsgJy8nLCAnJykpXG4gIH1cbiBcbiAgX2NyZWF0ZUNvbGxlY3Rpb25zKCkge1xuICAgIGNvbnN0IGJyaWVmY2FzZSA9IHRoaXNcblxuICAgIHRoaXMuZ2V0RG9jdW1lbnRUeXBlcygpLmZvckVhY2godHlwZSA9PiB7XG4gICAgICBsZXQgZ3JvdXAgICAgICAgPSBwbHVyYWxpemUodHlwZSlcbiAgICAgIGxldCBkZWZpbml0aW9uICA9IHRoaXMuZ2V0TW9kZWxEZWZpbml0aW9uKHR5cGUpXG5cbiAgICAgIGxldCBmZXRjaCA9ICgpPT4ge1xuICAgICAgICByZXR1cm4gdGhpcy5zZWxlY3RNb2RlbHNCeUdyb3VwKGdyb3VwKVxuICAgICAgfVxuICAgICAgXG4gICAgICBicmllZmNhc2VbZ3JvdXBdID0gY29sbGVjdGlvbihmZXRjaCwgZGVmaW5pdGlvbikgXG4gICAgfSlcbiAgfVxuIFxuICBfZ2V0RG9jdW1lbnRQYXRocygpIHtcbiAgICBsZXQgZG9jc19wYXRoID0gcGF0aC5yZXNvbHZlKHRoaXMuY29uZmlnLmRvY3NfcGF0aClcbiAgICByZXR1cm4gZ2xvYi5zeW5jKHBhdGguam9pbihkb2NzX3BhdGgsJyoqLyoubWQnKSlcbiAgfVxuICBcbiAgX2dldE1vZGVsRGVmaW5pdGlvbkZpbGVzICgpIHtcbiAgICBsZXQgbW9kZWxzX3BhdGggPSBwYXRoLnJlc29sdmUodGhpcy5jb25maWcubW9kZWxzX3BhdGgpXG4gICAgcmV0dXJuIGdsb2Iuc3luYyhwYXRoLmpvaW4obW9kZWxzX3BhdGgsJyoqLyouanMnKSlcbiAgfVxuXG4gIF9sb2FkTW9kZWxEZWZpbml0aW9ucygpe1xuICAgIHRoaXMuX2dldE1vZGVsRGVmaW5pdGlvbkZpbGVzKCkuZm9yRWFjaChmaWxlID0+IE1vZGVsRGVmaW5pdGlvbi5sb2FkKGZpbGUpKVxuICAgIE1vZGVsRGVmaW5pdGlvbi5nZXRBbGwoKS5mb3JFYWNoKGRlZmluaXRpb24gPT4gdGhpcy5sb2FkTW9kZWwoZGVmaW5pdGlvbikpXG4gIH1cblxuICBfYnVpbGRJbmRleEZyb21EaXNrKCkge1xuICAgIGxldCBwYXRocyA9IHRoaXMuX2dldERvY3VtZW50UGF0aHMoKVxuICAgIGxldCBicmllZmNhc2UgPSB0aGlzXG5cbiAgICBwYXRocy5mb3JFYWNoKChwYXRoKT0+e1xuICAgICAgbGV0IHBhdGhfYWxpYXMgPSBwYXRoLnJlcGxhY2UodGhpcy5jb25maWcuZG9jc19wYXRoICsgJy8nLCAnJylcbiAgICAgIGxldCBpZCA9IHBhdGhfYWxpYXMucmVwbGFjZSgnLm1kJywnJylcbiAgICAgIGxldCBkb2N1bWVudCA9IG5ldyBEb2N1bWVudChwYXRoLCB7aWQ6IGlkfSlcbiAgICAgIGxldCBtb2RlbCA9IGRvY3VtZW50LnRvTW9kZWwoe2lkOiBpZH0pIFxuICAgICAgXG4gICAgICBcbiAgICAgIGRvY3VtZW50LmlkID0gcGF0aF9hbGlhc1xuICAgICAgZG9jdW1lbnQucmVsYXRpdmVfcGF0aCA9ICdkb2NzLycgKyBwYXRoX2FsaWFzXG4gICAgICBtb2RlbC5pZCA9IGlkXG4gICAgICBtb2RlbC5nZXRQYXJlbnQgPSAoKT0+eyBcbiAgICAgICAgcmV0dXJuIHRoaXNcbiAgICAgIH1cblxuICAgICAgdGhpcy5pbmRleFtwYXRoX2FsaWFzXSA9IG1vZGVsXG4gICAgfSlcbiAgfVxuXG59XG4iXX0=