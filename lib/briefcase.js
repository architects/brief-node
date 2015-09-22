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

    this.setup();
  }

  _createClass(Briefcase, [{
    key: 'setup',
    value: function setup() {
      var _this = this;

      require('./index').plugins.forEach(function (modifier) {
        modifier(_this);
      });

      this._loadModelDefinitions();
      this._buildIndexFromDisk();
      this._createCollections();
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
      var _this3 = this;

      var useAbsolutePaths = arguments.length <= 0 || arguments[0] === undefined ? false : arguments[0];

      var allFiles = _globAll2['default'].sync(_path2['default'].join(this.root, '**/*'));
      return useAbsolutePaths ? allFiles : allFiles.map(function (f) {
        return f.replace(_this3.root + '/', '');
      });
    }
  }, {
    key: '_createCollections',
    value: function _createCollections() {
      var _this4 = this;

      var briefcase = this;

      this.getDocumentTypes().forEach(function (type) {
        var group = pluralize(type);
        var definition = _this4.getModelDefinition(type);

        var fetch = function fetch() {
          return _this4.selectModelsByGroup(group);
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
      var _this5 = this;

      this._getModelDefinitionFiles().forEach(function (file) {
        return _model_definition2['default'].load(file);
      });
      _model_definition2['default'].getAll().forEach(function (definition) {
        return _this5.loadModel(definition);
      });
    }
  }, {
    key: '_buildIndexFromDisk',
    value: function _buildIndexFromDisk() {
      var _this6 = this;

      var paths = this._getDocumentPaths();
      var briefcase = this;

      paths.forEach(function (path) {
        var path_alias = path.replace(_this6.config.docs_path + '/', '');
        var id = path_alias.replace('.md', '');
        var document = new _document2['default'](path, { id: id });
        var model = document.toModel({ id: id });

        document.id = path_alias;
        document.relative_path = 'docs/' + path_alias;
        model.id = id;
        model.getParent = function () {
          return _this6;
        };

        _this6.index[path_alias] = model;
      });
    }
  }]);

  return Briefcase;
})();

exports['default'] = Briefcase;
module.exports = exports['default'];
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3NyYy9icmllZmNhc2UuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7O3VCQUFpQixVQUFVOzs7O29CQUNWLE1BQU07Ozs7d0JBQ0YsWUFBWTs7OzswQkFDVixjQUFjOzs7O3FCQUNuQixTQUFTOzs7O2dDQUNDLG9CQUFvQjs7OztpQkFDeEIsR0FBRzs7Ozt3QkFDTixZQUFZOzs7OzBCQUNuQixZQUFZOzs7O0FBRzFCLElBQU0sT0FBTyxHQUFHLG9CQUFZLElBQUksQ0FBQyxDQUFBO0FBQ2pDLElBQU0sU0FBUyxHQUFHLE9BQU8sQ0FBQyxTQUFTLENBQUE7O0lBRWQsU0FBUztlQUFULFNBQVM7Ozs7Ozs7Ozs7V0FRakIsY0FBQyxRQUFRLEVBQWM7VUFBWixPQUFPLHlEQUFDLEVBQUU7O0FBQzlCLGFBQU8sSUFBSSxTQUFTLENBQUMsUUFBUSxFQUFDLE9BQU8sQ0FBQyxDQUFBO0tBQ3ZDOzs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBaUJVLFdBM0JRLFNBQVMsQ0EyQmhCLElBQUksRUFBRSxPQUFPLEVBQUU7MEJBM0JSLFNBQVM7O0FBNEIxQixRQUFJLENBQUMsSUFBSSxHQUFXLGtCQUFLLE9BQU8sQ0FBQyxJQUFJLENBQUMsQ0FBQTtBQUN0QyxRQUFJLENBQUMsSUFBSSxHQUFXLE9BQU8sQ0FBQyxJQUFJLElBQUksa0JBQUssUUFBUSxDQUFDLElBQUksQ0FBQyxDQUFBO0FBQ3ZELFFBQUksQ0FBQyxZQUFZLEdBQUcsa0JBQUssT0FBTyxDQUFDLElBQUksQ0FBQyxDQUFBOztBQUV0QyxRQUFJLENBQUMsT0FBTyxHQUFHLE9BQU8sSUFBSSxFQUFFLENBQUE7O0FBRTVCLFFBQUksQ0FBQyxLQUFLLEdBQUcsRUFBRSxDQUFBO0FBQ2YsUUFBSSxDQUFDLGlCQUFpQixHQUFHLEVBQUUsQ0FBQTs7QUFFM0IsUUFBSSxDQUFDLE1BQU0sR0FBRztBQUNaLGVBQVMsRUFBRSxrQkFBSyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksRUFBRSxNQUFNLENB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QyxDQUFDLENBQUE7O0FBR3RDLGdCQUFRLENBQUMsRUFBRSxHQUFHLFVBQVUsQ0FBQTtBQUN4QixnQkFBUSxDQUFDLGFBQWEsR0FBRyxPQUFPLEdBQUcsVUFBVSxDQUFBO0FBQzdDLGFBQUssQ0FBQyxFQUFFLEdBQUcsRUFBRSxDQUFBO0FBQ2IsYUFBSyxDQUFDLFNBQVMsR0FBRyxZQUFJO0FBQ3BCLHdCQUFXO1NBQ1osQ0FBQTs7QUFFRCxlQUFLLEtBQUssQ0FBQyxVQUFVLENBQUMsR0FBRyxLQUFLLENBQUE7T0FDL0IsQ0FBQyxDQUFBO0tBQ0g7OztTQS9Qa0IsU0FBUzs7O3FCQUFULFNBQVMiLCJmaWxlIjoiYnJpZWZjYXNlLmpzIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IGdsb2IgZnJvbSAnZ2xvYi1hbGwnXG5pbXBvcnQgcGF0aCBmcm9tICdwYXRoJ1xuaW1wb3J0IERvY3VtZW50IGZyb20gJy4vZG9jdW1lbnQnXG5pbXBvcnQgY29sbGVjdGlvbiBmcm9tICcuL2NvbGxlY3Rpb24nXG5pbXBvcnQgTW9kZWwgZnJvbSAnLi9tb2RlbCdcbmltcG9ydCBNb2RlbERlZmluaXRpb24gZnJvbSAnLi9tb2RlbF9kZWZpbml0aW9uJ1xuaW1wb3J0IGluZmxlY3Rpb25zIGZyb20gJ2knXG5pbXBvcnQgUGFja2FnZXIgZnJvbSAnLi9wYWNrYWdlcidcbmltcG9ydCBfIGZyb20gJ3VuZGVyc2NvcmUnXG5cblxuY29uc3QgaW5mbGVjdCA9IGluZmxlY3Rpb25zKHRydWUpXG5jb25zdCBwbHVyYWxpemUgPSBpbmZsZWN0LnBsdXJhbGl6ZVxuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBCcmllZmNhc2Uge1xuICAvKipcbiAgKiBMb2FkIGEgYnJpZWZjYXNlIGJ5IHBhc3NpbmcgYSBwYXRoIHRvIGEgcm9vdCBmb2xkZXIuXG4gICpcbiAgKiBAcGFyYW0ge3N0cmluZ30gcm9vdFBhdGggLSB0aGUgcm9vdCBwYXRoIG9mIHRoZSBicmllZmNhc2UuXG4gICogQHJldHVybiB7QnJpZWZjYXNlfSAtIHJldHVybnMgYSBicmllZmNhc2VcbiAgKlxuICAqL1xuICBzdGF0aWMgbG9hZChyb290UGF0aCwgb3B0aW9ucz17fSkge1xuICAgIHJldHVybiBuZXcgQnJpZWZjYXNlKHJvb3RQYXRoLG9wdGlvbnMpXG4gIH1cbiBcbiAgLyoqXG4gICovXG5cbiAgLyoqXG4gICogQ3JlYXRlIGEgbmV3IEJyaWVmY2FzZSBvYmplY3QgYXQgdGhlIHNwZWNpZmllZCByb290IHBhdGguXG4gICpcbiAgKiBAcGFyYW0ge3BhdGh9IHJvb3QgLSB0aGUgcm9vdCBwYXRoIG9mIHRoZSBicmllZmNhc2UuIGV4cGVjdHNcbiAgKiAgIHRvIGZpbmQgYSBjb25maWcgZmlsZSBcImJyaWVmLmNvbmZpZy5qc1wiLCBhbmQgYXQgbGVhc3QgYSBcbiAgKiAgIGRvY3VtZW50cyBmb2xkZXIuXG4gICpcbiAgKiBAcGFyYW0ge29wdGlvbnN9IG9wdGlvbnMgLSBvcHRpb25zIHRvIG92ZXJyaWRlIGRlZmF1bHQgYmVoYXZpb3IuXG4gICogQHBhcmFtIHtwYXRofSBkb2NzX3BhdGggLSB3aGljaCBmb2xkZXIgY29udGFpbnMgdGhlIGRvY3VtZW50cy5cbiAgKiBAcGFyYW0ge3BhdGh9IG1vZGVsc19wYXRoIC0gd2hpY2ggZm9sZGVyIGNvbnRhaW5zIHRoZSBtb2RlbHMgdG8gdXNlLlxuICAqIEBwYXJhbSB7cGF0aH0gYXNzZXRzX3BhdGggLSB3aGljaCBmb2xkZXIgY29udGFpbnMgdGhlIGFzc2V0cyB0byB1c2UgaWYgYW55LlxuICAqL1xuICBjb25zdHJ1Y3Rvcihyb290LCBvcHRpb25zKSB7XG4gICAgdGhpcy5yb290ICAgICAgICAgPSBwYXRoLnJlc29sdmUocm9vdClcbiAgICB0aGlzLm5hbWUgICAgICAgICA9IG9wdGlvbnMubmFtZSB8fCBwYXRoLmJhc2VuYW1lKHJvb3QpXG4gICAgdGhpcy5wYXJlbnRGb2xkZXIgPSBwYXRoLmRpcm5hbWUocm9vdClcblxuICAgIHRoaXMub3B0aW9ucyA9IG9wdGlvbnMgfHwge31cbiAgICBcbiAgICB0aGlzLmluZGV4ID0ge31cbiAgICB0aGlzLm1vZGVsX2RlZmluaXRpb25zID0ge31cbiAgICBcbiAgICB0aGlzLmNvbmZpZyA9IHtcbiAgICAgIGRvY3NfcGF0aDogcGF0aC5qb2luKHRoaXMucm9vdCwgJ2RvY3MnKSxcbiAgICAgIG1vZGVsc19wYXRoOiBwYXRoLmpvaW4odGhpcy5yb290LCAnbW9kZWxzJyksXG4gICAgICBhc3NldHNfcGF0aDogcGF0aC5qb2luKHRoaXMucm9vdCwgJ2Fzc2V0cycpXG4gICAgfVxuICAgIFxuICAgIHRoaXMuc2V0dXAoKVxuICB9XG4gIFxuICBzZXR1cCgpe1xuICAgIHJlcXVpcmUoJy4vaW5kZXgnKS5wbHVnaW5zLmZvckVhY2gobW9kaWZpZXIgPT4ge1xuICAgICAgbW9kaWZpZXIodGhpcylcbiAgICB9KVxuXG4gICAgdGhpcy5fbG9hZE1vZGVsRGVmaW5pdGlvbnMoKVxuICAgIHRoaXMuX2J1aWxkSW5kZXhGcm9tRGlzaygpXG4gICAgdGhpcy5fY3JlYXRlQ29sbGVjdGlvbnMoKVxuICB9XG4gIFxuICAvKipcbiAgKiB1c2UgYSBwbHVnaW4gdG8gbG9hZCBtb2R1bGVzLCBhY3Rpb25zLCBDTEkgaGVscGVycywgZXRjXG4gICovXG4gIHVzZShwbHVnaW4sIG9wdGlvbnM9e30pe1xuICAgIGJyaWVmLnVzZShwbHVnaW4pXG4gICAgdGhpcy5zZXR1cCgpXG4gICAgcmV0dXJuIHRoaXNcbiAgfVxuXG4gIC8qKlxuICAgKiBnZXQgbW9kZWwgYXQgdGhlIGdpdmVuIHJlbGF0aXZlIHBhdGggXG4gICAqIFxuICAgKiBAZXhhbXBsZVxuICAgKiAgYnJpZWZjYXNlLmF0KCdlcGljcy9tb2RlbC1kZWZpbml0aW9uLWRzbCcpXG4gICovXG4gIGF0KHBhdGhfYWxpYXMsIGFic29sdXRlPWZhbHNlKSB7XG4gICAgbGV0IGRvY3NfcGF0aCA9IHBhdGgucmVzb2x2ZSh0aGlzLmNvbmZpZy5kb2NzX3BhdGgpXG5cbiAgICBpZihhYnNvbHV0ZSl7IHBhdGhfYWxpYXMgPSBwYXRoX2FsaWFzLnJlcGxhY2UoZG9jc19wYXRoLCAnJykgfVxuXG4gICAgaWYoIXBhdGhfYWxpYXMubWF0Y2goL1xcLm1kJC9pKSl7XG4gICAgICBwYXRoX2FsaWFzID0gcGF0aF9hbGlhcyArICcubWQnIFxuICAgIH1cblxuICAgIHJldHVybiB0aGlzLmluZGV4W3BhdGhfYWxpYXMucmVwbGFjZSgvXlxcLy8sJycpXVxuICB9XG5cbiAgZmluZERvY3VtZW50QnlQYXRoKHBhdGgpe1xuICAgIHJldHVybiB0aGlzLmF0UGF0aChwYXRoX2FsaWFzLCB0cnVlKVxuICB9XG4gIC8qKlxuICAqIGdldCBtb2RlbHMgYXQgZWFjaCBvZiB0aGUgcGF0aHMgcmVwcmVzZW50ZWRcbiAgKiBieSB0aGUgZ2xvYiBwYXR0ZXJuIHBhc3NlZCBoZXJlLlxuICAqL1xuICBnbG9iKHBhdHRlcm49XCIqKi8qLm1kXCIpIHtcbiAgICBsZXQgbWF0Y2hpbmdGaWxlcyA9IGdsb2Iuc3luYyhwYXRoLmpvaW4odGhpcy5yb290LCBwYXR0ZXJuKSlcbiAgICByZXR1cm4gbWF0Y2hpbmdGaWxlcy5tYXAocGF0aCA9PiB0aGlzLmF0KHBhdGgsdHJ1ZSkpIFxuICB9XG5cbiAgLyoqXG4gICAqIGZpbHRlcnMgYWxsIGF2YWlsYWJsZSBtb2RlbHMgYnkgdGhlIGdpdmVuIGl0ZXJhdG9yXG4gICAqXG4gICAqIEBleGFtcGxlXG4gICAqICBicmllZmNhc2UuZmlsdGVyQWxsKG1vZGVsID0+IG1vZGVsLnN0YXR1cyA9PT0gJ2FjdGl2ZScpXG4gICovXG4gIGZpbHRlckFsbCAoaXRlcmF0b3IpIHtcbiAgICByZXR1cm4gdGhpcy5nZXRBbGxNb2RlbHMoaXRlcmF0b3IpXG4gIH1cbiAgXG4gIC8qKlxuICAgKiBmaWx0ZXJzIG1vZGVscyBieSB0aGUgcHJvcGVydHkgYW5kIGRlc2lyZWQgdmFsdWVcbiAgICogXG4gICAqIEBwYXJhbSB7c3RyaW5nfSBwcm9wZXJ0eSAtIG5hbWUgb2YgdGhlIHByb3BlcnR5IHRvIGZpbHRlciBvbiBcbiAgICogQHBhcmFtIHthbnl9IGRlc2lyZWRWYWx1ZSAtIHRoZSB2YWx1ZSB0byBtYXRjaCBhZ2FpbnN0XG4gICAqXG4gICAqIEByZXR1cm4ge2FycmF5fSAtIG1vZGVscyB3aG9zZSBwcm9wZXJ0eSBtYXRjaGVzIGRlc2lyZWRWYWx1ZSBcbiAgKi9cbiAgZmlsdGVyQWxsQnlQcm9wZXJ0eSAocHJvcGVydHksIGRlc2lyZWRWYWx1ZSkge1xuICAgIHJldHVybiB0aGlzLmZpbHRlckFsbChtb2RlbCA9PiBtb2RlbFtwcm9wZXJ0eV0gPT09IGRlc2lyZWRWYWx1ZSlcbiAgfVxuICBcbiAgLyoqXG4gICAqIHNlbGVjdHMgYWxsIHRoZSBtb2RlbHMgd2hvc2UgdHlwZSBtYXRjaGVzIHRoZSBzdXBwbGllZCBhcmcgXG4gICovXG4gIHNlbGVjdE1vZGVsc0J5VHlwZSAodHlwZSkge1xuICAgIHJldHVybiB0aGlzLmZpbHRlckFsbEJ5UHJvcGVydHkoJ3R5cGUnLCB0eXBlKVxuICB9XG5cbiAgLyoqXG4gICAqIHNlbGVjdHMgYWxsIHRoZSBtb2RlbHMgd2hvc2UgZ3JvdXBOYW1lIG1hdGNoZXMgdGhlIHN1cHBsaWVkIGFyZyBcbiAgKi9cbiAgc2VsZWN0TW9kZWxzQnlHcm91cCAoZ3JvdXBOYW1lKSB7XG4gICAgcmV0dXJuIHRoaXMuZmlsdGVyQWxsQnlQcm9wZXJ0eSgnZ3JvdXBOYW1lJywgZ3JvdXBOYW1lKVxuICB9XG4gIFxuICAvKipcbiAgICogcmV0dXJucyBhbGwgdGhlIG1vZGVscyBpbiB0aGlzIGJyaWVmY2FzZVxuICAqL1xuICBnZXRBbGxNb2RlbHMoKSB7XG4gICAgcmV0dXJuIE9iamVjdC52YWx1ZXModGhpcy5pbmRleClcbiAgfVxuICBcbiAgLyoqXG4gICAqIHJldHVybnMgdGhlIHJhdyBkb2N1bWVudHMgaW4gdGhpcyBicmllZmNhc2VcbiAgKi9cbiAgZ2V0QWxsRG9jdW1lbnRzICgpIHtcbiAgICByZXR1cm4gdGhpcy5nZXRBbGxNb2RlbHMoKS5tYXAobW9kZWwgPT4gbW9kZWwuZG9jdW1lbnQpXG4gIH1cbiAgXG4gIC8qKlxuICAqIEFyY2hpdmVzIHRoZSBicmllZmNhc2UgaW50byBhIHppcCBmaWxlLiBCcmllZmNhc2VzXG4gICogY2FuIGJlIGNyZWF0ZWQgZGlyZWN0bHkgZnJvbSB6aXAgZmlsZXMgaW4gdGhlIGZ1dHVyZS5cbiAgKlxuICAqIEBwYXJhbSB7c3RyaW5nfSBsb2NhdGlvbiAtIHdoZXJlIHRvIHN0b3JlIHRoZSBmaWxlP1xuICAqIEBwYXJhbSB7YXJyYXl9IGlnbm9yZSAtIGEgbGlzdCBvZiBmaWxlcyB0byBpZ25vcmUgYW5kIG5vdCBwdXQgaW4gdGhlXG4gICogICBhcmNoaXZlXG4gICovXG4gIGFyY2hpdmUobG9jYXRpb24sIGlnbm9yZT1bXSkge1xuICAgIGxvY2F0aW9uID0gbG9jYXRpb24gfHwgXG4gICAgaWdub3JlLnB1c2gobG9jYXRpb24pXG5cbiAgICBuZXcgUGFja2FnZXIodGhpcywgaWdub3JlKS5wZXJzaXN0KGxvY2F0aW9uKVxuICB9XG4gIFxuICBnZXRHcm91cE5hbWVzICgpIHtcbiAgICBsZXQgdHlwZXMgPSB0aGlzLmdldERvY3VtZW50VHlwZXMoKVxuICAgIHJldHVybiB0eXBlcy5tYXAodHlwZSA9PiBwbHVyYWxpemUodHlwZSB8fCBcIlwiKSlcbiAgfVxuXG4gIGdldERvY3VtZW50VHlwZXMgKCkge1xuICAgIGxldCB0eXBlcyA9IFtdXG5cbiAgICB0aGlzLmdldEFsbERvY3VtZW50cygpLmZvckVhY2goKGRvYyk9PntcbiAgICAgIHR5cGVzLnB1c2goZG9jLmdldFR5cGUoKSlcbiAgICB9KVxuXG4gICAgcmV0dXJuIF8odHlwZXMpLnVuaXEoKVxuICB9XG4gIFxuICBsb2FkTW9kZWwgKGRlZmluaXRpb24pIHtcbiAgICB0aGlzLm1vZGVsX2RlZmluaXRpb25zW2RlZmluaXRpb24ubmFtZV0gPSB0cnVlXG4gICAgcmV0dXJuIGRlZmluaXRpb25cbiAgfVxuXG4gIGxvYWRlZE1vZGVsRGVmaW5pdGlvbnMgKCkge1xuICAgIHJldHVybiBPYmplY3Qua2V5cyh0aGlzLm1vZGVsX2RlZmluaXRpb25zKVxuICB9XG5cbiAgZ2V0TW9kZWxEZWZpbml0aW9ucyAoKSB7IFxuICAgIHJldHVybiBNb2RlbERlZmluaXRpb24uZ2V0QWxsKClcbiAgfVxuXG4gIGdldE1vZGVsRGVmaW5pdGlvbiAobW9kZWxOYW1lT3JBbGlhcykge1xuICAgIHJldHVybiBNb2RlbERlZmluaXRpb24ubG9va3VwKG1vZGVsTmFtZU9yQWxpYXMpXG4gIH1cblxuICBnZXRUeXBlQWxpYXNlcyAoKXtcbiAgICByZXR1cm4gTW9kZWxEZWZpbml0aW9uLmdldFR5cGVBbGlhc2VzKClcbiAgfVxuXG4gIGdldE1vZGVsU2NoZW1hICgpIHtcbiAgICByZXR1cm4gTW9kZWxEZWZpbml0aW9uLmdldE1vZGVsU2NoZW1hKClcbiAgfVxuXG4gIGdldEFsbEZpbGVzKHVzZUFic29sdXRlUGF0aHM9ZmFsc2Upe1xuICAgIGxldCBhbGxGaWxlcyA9IGdsb2Iuc3luYyhwYXRoLmpvaW4odGhpcy5yb290LCAnKiovKicpKVxuICAgIHJldHVybiB1c2VBYnNvbHV0ZVBhdGhzID8gYWxsRmlsZXMgOiBhbGxGaWxlcy5tYXAoZiA9PiBmLnJlcGxhY2UodGhpcy5yb290ICsgJy8nLCAnJykpXG4gIH1cbiBcbiAgX2NyZWF0ZUNvbGxlY3Rpb25zKCkge1xuICAgIGNvbnN0IGJyaWVmY2FzZSA9IHRoaXNcblxuICAgIHRoaXMuZ2V0RG9jdW1lbnRUeXBlcygpLmZvckVhY2godHlwZSA9PiB7XG4gICAgICBsZXQgZ3JvdXAgICAgICAgPSBwbHVyYWxpemUodHlwZSlcbiAgICAgIGxldCBkZWZpbml0aW9uICA9IHRoaXMuZ2V0TW9kZWxEZWZpbml0aW9uKHR5cGUpXG5cbiAgICAgIGxldCBmZXRjaCA9ICgpPT4ge1xuICAgICAgICByZXR1cm4gdGhpcy5zZWxlY3RNb2RlbHNCeUdyb3VwKGdyb3VwKVxuICAgICAgfVxuICAgICAgXG4gICAgICBicmllZmNhc2VbZ3JvdXBdID0gY29sbGVjdGlvbihmZXRjaCwgZGVmaW5pdGlvbikgXG4gICAgfSlcbiAgfVxuIFxuICBfZ2V0RG9jdW1lbnRQYXRocygpIHtcbiAgICBsZXQgZG9jc19wYXRoID0gcGF0aC5yZXNvbHZlKHRoaXMuY29uZmlnLmRvY3NfcGF0aClcbiAgICByZXR1cm4gZ2xvYi5zeW5jKHBhdGguam9pbihkb2NzX3BhdGgsJyoqLyoubWQnKSlcbiAgfVxuICBcbiAgX2dldE1vZGVsRGVmaW5pdGlvbkZpbGVzICgpIHtcbiAgICBsZXQgbW9kZWxzX3BhdGggPSBwYXRoLnJlc29sdmUodGhpcy5jb25maWcubW9kZWxzX3BhdGgpXG4gICAgcmV0dXJuIGdsb2Iuc3luYyhwYXRoLmpvaW4obW9kZWxzX3BhdGgsJyoqLyouanMnKSlcbiAgfVxuICBcbiAgX2xvYWRNb2RlbERlZmluaXRpb25zKCl7XG4gICAgdGhpcy5fZ2V0TW9kZWxEZWZpbml0aW9uRmlsZXMoKS5mb3JFYWNoKGZpbGUgPT4gTW9kZWxEZWZpbml0aW9uLmxvYWQoZmlsZSkpXG4gICAgTW9kZWxEZWZpbml0aW9uLmdldEFsbCgpLmZvckVhY2goZGVmaW5pdGlvbiA9PiB0aGlzLmxvYWRNb2RlbChkZWZpbml0aW9uKSlcbiAgfVxuXG4gIF9idWlsZEluZGV4RnJvbURpc2soKSB7XG4gICAgbGV0IHBhdGhzID0gdGhpcy5fZ2V0RG9jdW1lbnRQYXRocygpXG4gICAgbGV0IGJyaWVmY2FzZSA9IHRoaXNcblxuICAgIHBhdGhzLmZvckVhY2goKHBhdGgpPT57XG4gICAgICBsZXQgcGF0aF9hbGlhcyA9IHBhdGgucmVwbGFjZSh0aGlzLmNvbmZpZy5kb2NzX3BhdGggKyAnLycsICcnKVxuICAgICAgbGV0IGlkID0gcGF0aF9hbGlhcy5yZXBsYWNlKCcubWQnLCcnKVxuICAgICAgbGV0IGRvY3VtZW50ID0gbmV3IERvY3VtZW50KHBhdGgsIHtpZDogaWR9KVxuICAgICAgbGV0IG1vZGVsID0gZG9jdW1lbnQudG9Nb2RlbCh7aWQ6IGlkfSkgXG4gICAgICBcbiAgICAgIFxuICAgICAgZG9jdW1lbnQuaWQgPSBwYXRoX2FsaWFzXG4gICAgICBkb2N1bWVudC5yZWxhdGl2ZV9wYXRoID0gJ2RvY3MvJyArIHBhdGhfYWxpYXNcbiAgICAgIG1vZGVsLmlkID0gaWRcbiAgICAgIG1vZGVsLmdldFBhcmVudCA9ICgpPT57IFxuICAgICAgICByZXR1cm4gdGhpc1xuICAgICAgfVxuXG4gICAgICB0aGlzLmluZGV4W3BhdGhfYWxpYXNdID0gbW9kZWxcbiAgICB9KVxuICB9XG5cbn1cbiJdfQ==