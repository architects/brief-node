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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3NyYy9icmllZmNhc2UuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7O3VCQUFpQixVQUFVOzs7O29CQUNWLE1BQU07Ozs7d0JBQ0YsWUFBWTs7OzswQkFDVixjQUFjOzs7O3FCQUNuQixTQUFTOzs7O2dDQUNDLG9CQUFvQjs7OztpQkFDeEIsR0FBRzs7Ozt3QkFDTixZQUFZOzs7OzBCQUNuQixZQUFZOzs7O0FBRTFCLElBQU0sT0FBTyxHQUFHLG9CQUFZLElBQUksQ0FBQyxDQUFBO0FBQ2pDLElBQU0sU0FBUyxHQUFHLE9BQU8sQ0FBQyxTQUFTLENBQUE7O0lBRWQsU0FBUztlQUFULFNBQVM7Ozs7Ozs7Ozs7V0FRakIsY0FBQyxRQUFRLEVBQWM7VUFBWixPQUFPLHlEQUFDLEVBQUU7O0FBQzlCLGFBQU8sSUFBSSxTQUFTLENBQUMsUUFBUSxFQUFDLE9BQU8sQ0FBQyxDQUFBO0tBQ3ZDOzs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBaUJVLFdBM0JRLFNBQVMsQ0EyQmhCLElBQUksRUFBRSxPQUFPLEVBQUU7MEJBM0JSLFNBQVM7O0FBNEIxQixRQUFJLENBQUMsSUFBSSxHQUFXLGtCQUFLLE9BQU8sQ0FBQyxJQUFJLENBQUMsQ0FBQTtBQUN0QyxRQUFJLENBQUMsSUFBSSxHQUFXLE9BQU8sQ0FBQyxJQUFJLElBQUksa0JBQUssUUFBUSxDQUFDLElBQUksQ0FBQyxDQUFBO0FBQ3ZELFFBQUksQ0FBQyxZQUFZLEdBQUcsa0JBQUssT0FBTyxDQUFDLElBQUksQ0FBQyxDQUFBOztBQUV0QyxRQUFJLENBQUMsT0FBTyxHQUFHLE9BQU8sSUFBSSxFQUFFLENBQUE7O0FBRTVCLFFBQUksQ0FBQyxLQUFLLEdBQUcsRUFBRSxDQUFBO0FBQ2YsUUFBSSxDQUFDLGlCQUFpQixHQUFHLEVBQUUsQ0FBQTs7QUFFM0IsUUFBSSxDQUFDLE1BQU0sR0FBRztBQUNaLGVBQVMsRUFBRSxrQkFBSyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksRUFBRSxNQUFNLENB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anMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgZ2xvYiBmcm9tICdnbG9iLWFsbCdcbmltcG9ydCBwYXRoIGZyb20gJ3BhdGgnXG5pbXBvcnQgRG9jdW1lbnQgZnJvbSAnLi9kb2N1bWVudCdcbmltcG9ydCBjb2xsZWN0aW9uIGZyb20gJy4vY29sbGVjdGlvbidcbmltcG9ydCBNb2RlbCBmcm9tICcuL21vZGVsJ1xuaW1wb3J0IE1vZGVsRGVmaW5pdGlvbiBmcm9tICcuL21vZGVsX2RlZmluaXRpb24nXG5pbXBvcnQgaW5mbGVjdGlvbnMgZnJvbSAnaSdcbmltcG9ydCBQYWNrYWdlciBmcm9tICcuL3BhY2thZ2VyJ1xuaW1wb3J0IF8gZnJvbSAndW5kZXJzY29yZSdcblxuY29uc3QgaW5mbGVjdCA9IGluZmxlY3Rpb25zKHRydWUpXG5jb25zdCBwbHVyYWxpemUgPSBpbmZsZWN0LnBsdXJhbGl6ZVxuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBCcmllZmNhc2Uge1xuICAvKipcbiAgKiBMb2FkIGEgYnJpZWZjYXNlIGJ5IHBhc3NpbmcgYSBwYXRoIHRvIGEgcm9vdCBmb2xkZXIuXG4gICpcbiAgKiBAcGFyYW0ge3N0cmluZ30gcm9vdFBhdGggLSB0aGUgcm9vdCBwYXRoIG9mIHRoZSBicmllZmNhc2UuXG4gICogQHJldHVybiB7QnJpZWZjYXNlfSAtIHJldHVybnMgYSBicmllZmNhc2VcbiAgKlxuICAqL1xuICBzdGF0aWMgbG9hZChyb290UGF0aCwgb3B0aW9ucz17fSkge1xuICAgIHJldHVybiBuZXcgQnJpZWZjYXNlKHJvb3RQYXRoLG9wdGlvbnMpXG4gIH1cbiBcbiAgLyoqXG4gICovXG5cbiAgLyoqXG4gICogQ3JlYXRlIGEgbmV3IEJyaWVmY2FzZSBvYmplY3QgYXQgdGhlIHNwZWNpZmllZCByb290IHBhdGguXG4gICpcbiAgKiBAcGFyYW0ge3BhdGh9IHJvb3QgLSB0aGUgcm9vdCBwYXRoIG9mIHRoZSBicmllZmNhc2UuIGV4cGVjdHNcbiAgKiAgIHRvIGZpbmQgYSBjb25maWcgZmlsZSBcImJyaWVmLmNvbmZpZy5qc1wiLCBhbmQgYXQgbGVhc3QgYSBcbiAgKiAgIGRvY3VtZW50cyBmb2xkZXIuXG4gICpcbiAgKiBAcGFyYW0ge29wdGlvbnN9IG9wdGlvbnMgLSBvcHRpb25zIHRvIG92ZXJyaWRlIGRlZmF1bHQgYmVoYXZpb3IuXG4gICogQHBhcmFtIHtwYXRofSBkb2NzX3BhdGggLSB3aGljaCBmb2xkZXIgY29udGFpbnMgdGhlIGRvY3VtZW50cy5cbiAgKiBAcGFyYW0ge3BhdGh9IG1vZGVsc19wYXRoIC0gd2hpY2ggZm9sZGVyIGNvbnRhaW5zIHRoZSBtb2RlbHMgdG8gdXNlLlxuICAqIEBwYXJhbSB7cGF0aH0gYXNzZXRzX3BhdGggLSB3aGljaCBmb2xkZXIgY29udGFpbnMgdGhlIGFzc2V0cyB0byB1c2UgaWYgYW55LlxuICAqL1xuICBjb25zdHJ1Y3Rvcihyb290LCBvcHRpb25zKSB7XG4gICAgdGhpcy5yb290ICAgICAgICAgPSBwYXRoLnJlc29sdmUocm9vdClcbiAgICB0aGlzLm5hbWUgICAgICAgICA9IG9wdGlvbnMubmFtZSB8fCBwYXRoLmJhc2VuYW1lKHJvb3QpXG4gICAgdGhpcy5wYXJlbnRGb2xkZXIgPSBwYXRoLmRpcm5hbWUocm9vdClcblxuICAgIHRoaXMub3B0aW9ucyA9IG9wdGlvbnMgfHwge31cblxuICAgIHRoaXMuaW5kZXggPSB7fVxuICAgIHRoaXMubW9kZWxfZGVmaW5pdGlvbnMgPSB7fVxuICAgIFxuICAgIHRoaXMuY29uZmlnID0ge1xuICAgICAgZG9jc19wYXRoOiBwYXRoLmpvaW4odGhpcy5yb290LCAnZG9jcycpLFxuICAgICAgbW9kZWxzX3BhdGg6IHBhdGguam9pbih0aGlzLnJvb3QsICdtb2RlbHMnKSxcbiAgICAgIGFzc2V0c19wYXRoOiBwYXRoLmpvaW4odGhpcy5yb290LCAnYXNzZXRzJylcbiAgICB9XG4gICAgXG4gICAgdGhpcy5fbG9hZE1vZGVsRGVmaW5pdGlvbnMoKVxuICAgIHRoaXMuX2J1aWxkSW5kZXhGcm9tRGlzaygpXG4gICAgdGhpcy5fY3JlYXRlQ29sbGVjdGlvbnMoKVxuICB9XG4gIFxuICAvKipcbiAgICogZ2V0IG1vZGVsIGF0IHRoZSBnaXZlbiByZWxhdGl2ZSBwYXRoIFxuICAgKiBcbiAgICogQGV4YW1wbGVcbiAgICogIGJyaWVmY2FzZS5hdCgnZXBpY3MvbW9kZWwtZGVmaW5pdGlvbi1kc2wnKVxuICAqL1xuICBhdChwYXRoX2FsaWFzLCBhYnNvbHV0ZT1mYWxzZSkge1xuICAgIGxldCBkb2NzX3BhdGggPSBwYXRoLnJlc29sdmUodGhpcy5jb25maWcuZG9jc19wYXRoKVxuXG4gICAgaWYoYWJzb2x1dGUpeyBwYXRoX2FsaWFzID0gcGF0aF9hbGlhcy5yZXBsYWNlKGRvY3NfcGF0aCwgJycpIH1cblxuICAgIGlmKCFwYXRoX2FsaWFzLm1hdGNoKC9cXC5tZCQvaSkpe1xuICAgICAgcGF0aF9hbGlhcyA9IHBhdGhfYWxpYXMgKyAnLm1kJyBcbiAgICB9XG5cbiAgICByZXR1cm4gdGhpcy5pbmRleFtwYXRoX2FsaWFzLnJlcGxhY2UoL15cXC8vLCcnKV1cbiAgfVxuXG4gIGZpbmREb2N1bWVudEJ5UGF0aChwYXRoKXtcbiAgICByZXR1cm4gdGhpcy5hdFBhdGgocGF0aF9hbGlhcywgdHJ1ZSlcbiAgfVxuICAvKipcbiAgKiBnZXQgbW9kZWxzIGF0IGVhY2ggb2YgdGhlIHBhdGhzIHJlcHJlc2VudGVkXG4gICogYnkgdGhlIGdsb2IgcGF0dGVybiBwYXNzZWQgaGVyZS5cbiAgKi9cbiAgZ2xvYihwYXR0ZXJuPVwiKiovKi5tZFwiKSB7XG4gICAgbGV0IG1hdGNoaW5nRmlsZXMgPSBnbG9iLnN5bmMocGF0aC5qb2luKHRoaXMucm9vdCwgcGF0dGVybikpXG4gICAgcmV0dXJuIG1hdGNoaW5nRmlsZXMubWFwKHBhdGggPT4gdGhpcy5hdChwYXRoLHRydWUpKSBcbiAgfVxuXG4gIC8qKlxuICAgKiBmaWx0ZXJzIGFsbCBhdmFpbGFibGUgbW9kZWxzIGJ5IHRoZSBnaXZlbiBpdGVyYXRvclxuICAgKlxuICAgKiBAZXhhbXBsZVxuICAgKiAgYnJpZWZjYXNlLmZpbHRlckFsbChtb2RlbCA9PiBtb2RlbC5zdGF0dXMgPT09ICdhY3RpdmUnKVxuICAqL1xuICBmaWx0ZXJBbGwgKGl0ZXJhdG9yKSB7XG4gICAgcmV0dXJuIHRoaXMuZ2V0QWxsTW9kZWxzKGl0ZXJhdG9yKVxuICB9XG4gIFxuICAvKipcbiAgICogZmlsdGVycyBtb2RlbHMgYnkgdGhlIHByb3BlcnR5IGFuZCBkZXNpcmVkIHZhbHVlXG4gICAqIFxuICAgKiBAcGFyYW0ge3N0cmluZ30gcHJvcGVydHkgLSBuYW1lIG9mIHRoZSBwcm9wZXJ0eSB0byBmaWx0ZXIgb24gXG4gICAqIEBwYXJhbSB7YW55fSBkZXNpcmVkVmFsdWUgLSB0aGUgdmFsdWUgdG8gbWF0Y2ggYWdhaW5zdFxuICAgKlxuICAgKiBAcmV0dXJuIHthcnJheX0gLSBtb2RlbHMgd2hvc2UgcHJvcGVydHkgbWF0Y2hlcyBkZXNpcmVkVmFsdWUgXG4gICovXG4gIGZpbHRlckFsbEJ5UHJvcGVydHkgKHByb3BlcnR5LCBkZXNpcmVkVmFsdWUpIHtcbiAgICByZXR1cm4gdGhpcy5maWx0ZXJBbGwobW9kZWwgPT4gbW9kZWxbcHJvcGVydHldID09PSBkZXNpcmVkVmFsdWUpXG4gIH1cbiAgXG4gIC8qKlxuICAgKiBzZWxlY3RzIGFsbCB0aGUgbW9kZWxzIHdob3NlIHR5cGUgbWF0Y2hlcyB0aGUgc3VwcGxpZWQgYXJnIFxuICAqL1xuICBzZWxlY3RNb2RlbHNCeVR5cGUgKHR5cGUpIHtcbiAgICByZXR1cm4gdGhpcy5maWx0ZXJBbGxCeVByb3BlcnR5KCd0eXBlJywgdHlwZSlcbiAgfVxuXG4gIC8qKlxuICAgKiBzZWxlY3RzIGFsbCB0aGUgbW9kZWxzIHdob3NlIGdyb3VwTmFtZSBtYXRjaGVzIHRoZSBzdXBwbGllZCBhcmcgXG4gICovXG4gIHNlbGVjdE1vZGVsc0J5R3JvdXAgKGdyb3VwTmFtZSkge1xuICAgIHJldHVybiB0aGlzLmZpbHRlckFsbEJ5UHJvcGVydHkoJ2dyb3VwTmFtZScsIGdyb3VwTmFtZSlcbiAgfVxuICBcbiAgLyoqXG4gICAqIHJldHVybnMgYWxsIHRoZSBtb2RlbHMgaW4gdGhpcyBicmllZmNhc2VcbiAgKi9cbiAgZ2V0QWxsTW9kZWxzKCkge1xuICAgIHJldHVybiBPYmplY3QudmFsdWVzKHRoaXMuaW5kZXgpXG4gIH1cbiAgXG4gIC8qKlxuICAgKiByZXR1cm5zIHRoZSByYXcgZG9jdW1lbnRzIGluIHRoaXMgYnJpZWZjYXNlXG4gICovXG4gIGdldEFsbERvY3VtZW50cyAoKSB7XG4gICAgcmV0dXJuIHRoaXMuZ2V0QWxsTW9kZWxzKCkubWFwKG1vZGVsID0+IG1vZGVsLmRvY3VtZW50KVxuICB9XG4gIFxuICAvKipcbiAgKiBBcmNoaXZlcyB0aGUgYnJpZWZjYXNlIGludG8gYSB6aXAgZmlsZS4gQnJpZWZjYXNlc1xuICAqIGNhbiBiZSBjcmVhdGVkIGRpcmVjdGx5IGZyb20gemlwIGZpbGVzIGluIHRoZSBmdXR1cmUuXG4gICpcbiAgKiBAcGFyYW0ge3N0cmluZ30gbG9jYXRpb24gLSB3aGVyZSB0byBzdG9yZSB0aGUgZmlsZT9cbiAgKiBAcGFyYW0ge2FycmF5fSBpZ25vcmUgLSBhIGxpc3Qgb2YgZmlsZXMgdG8gaWdub3JlIGFuZCBub3QgcHV0IGluIHRoZVxuICAqICAgYXJjaGl2ZVxuICAqL1xuICBhcmNoaXZlKGxvY2F0aW9uLCBpZ25vcmU9W10pIHtcbiAgICBsb2NhdGlvbiA9IGxvY2F0aW9uIHx8IFxuICAgIGlnbm9yZS5wdXNoKGxvY2F0aW9uKVxuXG4gICAgbmV3IFBhY2thZ2VyKHRoaXMsIGlnbm9yZSkucGVyc2lzdChsb2NhdGlvbilcbiAgfVxuICBcbiAgZ2V0R3JvdXBOYW1lcyAoKSB7XG4gICAgbGV0IHR5cGVzID0gdGhpcy5nZXREb2N1bWVudFR5cGVzKClcbiAgICByZXR1cm4gdHlwZXMubWFwKHR5cGUgPT4gcGx1cmFsaXplKHR5cGUgfHwgXCJcIikpXG4gIH1cblxuICBnZXREb2N1bWVudFR5cGVzICgpIHtcbiAgICBsZXQgdHlwZXMgPSBbXVxuXG4gICAgdGhpcy5nZXRBbGxEb2N1bWVudHMoKS5mb3JFYWNoKChkb2MpPT57XG4gICAgICB0eXBlcy5wdXNoKGRvYy5nZXRUeXBlKCkpXG4gICAgfSlcblxuICAgIHJldHVybiBfKHR5cGVzKS51bmlxKClcbiAgfVxuXG4gIGxvYWRNb2RlbCAoZGVmaW5pdGlvbikge1xuICAgIHRoaXMubW9kZWxfZGVmaW5pdGlvbnNbZGVmaW5pdGlvbi5uYW1lXSA9IGRlZmluaXRpb25cbiAgICByZXR1cm4gZGVmaW5pdGlvblxuICB9XG5cbiAgbG9hZGVkTW9kZWxEZWZpbml0aW9ucyAoKSB7XG4gICAgcmV0dXJuIE9iamVjdC5rZXlzKHRoaXMubW9kZWxfZGVmaW5pdGlvbnMpXG4gIH1cblxuICBnZXRNb2RlbERlZmluaXRpb25zICgpIHsgXG4gICAgcmV0dXJuIE1vZGVsRGVmaW5pdGlvbi5nZXRBbGwoKVxuICB9XG5cbiAgZ2V0TW9kZWxEZWZpbml0aW9uIChtb2RlbE5hbWVPckFsaWFzKSB7XG4gICAgcmV0dXJuIE1vZGVsRGVmaW5pdGlvbi5sb29rdXAobW9kZWxOYW1lT3JBbGlhcylcbiAgfVxuXG4gIGdldFR5cGVBbGlhc2VzICgpe1xuICAgIHJldHVybiBNb2RlbERlZmluaXRpb24uZ2V0VHlwZUFsaWFzZXMoKVxuICB9XG5cbiAgZ2V0TW9kZWxTY2hlbWEgKCkge1xuICAgIHJldHVybiBNb2RlbERlZmluaXRpb24uZ2V0TW9kZWxTY2hlbWEoKVxuICB9XG5cbiAgZ2V0QWxsRmlsZXModXNlQWJzb2x1dGVQYXRocz1mYWxzZSl7XG4gICAgbGV0IGFsbEZpbGVzID0gZ2xvYi5zeW5jKHBhdGguam9pbih0aGlzLnJvb3QsICcqKi8qJykpXG4gICAgcmV0dXJuIHVzZUFic29sdXRlUGF0aHMgPyBhbGxGaWxlcyA6IGFsbEZpbGVzLm1hcChmID0+IGYucmVwbGFjZSh0aGlzLnJvb3QgKyAnLycsICcnKSlcbiAgfVxuIFxuICBfY3JlYXRlQ29sbGVjdGlvbnMoKSB7XG4gICAgY29uc3QgYnJpZWZjYXNlID0gdGhpc1xuXG4gICAgdGhpcy5nZXREb2N1bWVudFR5cGVzKCkuZm9yRWFjaCh0eXBlID0+IHtcbiAgICAgIGxldCBncm91cCAgICAgICA9IHBsdXJhbGl6ZSh0eXBlKVxuICAgICAgbGV0IGRlZmluaXRpb24gID0gdGhpcy5nZXRNb2RlbERlZmluaXRpb24odHlwZSlcblxuICAgICAgbGV0IGZldGNoID0gKCk9PiB7XG4gICAgICAgIHJldHVybiB0aGlzLnNlbGVjdE1vZGVsc0J5R3JvdXAoZ3JvdXApXG4gICAgICB9XG4gICAgICBcbiAgICAgIGJyaWVmY2FzZVtncm91cF0gPSBjb2xsZWN0aW9uKGZldGNoLCBkZWZpbml0aW9uKSBcbiAgICB9KVxuICB9XG4gXG4gIF9nZXREb2N1bWVudFBhdGhzKCkge1xuICAgIGxldCBkb2NzX3BhdGggPSBwYXRoLnJlc29sdmUodGhpcy5jb25maWcuZG9jc19wYXRoKVxuICAgIHJldHVybiBnbG9iLnN5bmMocGF0aC5qb2luKGRvY3NfcGF0aCwnKiovKi5tZCcpKVxuICB9XG4gIFxuICBfZ2V0TW9kZWxEZWZpbml0aW9uRmlsZXMgKCkge1xuICAgIGxldCBtb2RlbHNfcGF0aCA9IHBhdGgucmVzb2x2ZSh0aGlzLmNvbmZpZy5tb2RlbHNfcGF0aClcbiAgICByZXR1cm4gZ2xvYi5zeW5jKHBhdGguam9pbihtb2RlbHNfcGF0aCwnKiovKi5qcycpKVxuICB9XG5cbiAgX2xvYWRNb2RlbERlZmluaXRpb25zKCl7XG4gICAgdGhpcy5fZ2V0TW9kZWxEZWZpbml0aW9uRmlsZXMoKS5mb3JFYWNoKGZpbGUgPT4gTW9kZWxEZWZpbml0aW9uLmxvYWQoZmlsZSkpXG4gICAgTW9kZWxEZWZpbml0aW9uLmdldEFsbCgpLmZvckVhY2goZGVmaW5pdGlvbiA9PiB0aGlzLmxvYWRNb2RlbChkZWZpbml0aW9uKSlcbiAgfVxuXG4gIF9idWlsZEluZGV4RnJvbURpc2soKSB7XG4gICAgbGV0IHBhdGhzID0gdGhpcy5fZ2V0RG9jdW1lbnRQYXRocygpXG4gICAgbGV0IGJyaWVmY2FzZSA9IHRoaXNcblxuICAgIHBhdGhzLmZvckVhY2goKHBhdGgpPT57XG4gICAgICBsZXQgcGF0aF9hbGlhcyA9IHBhdGgucmVwbGFjZSh0aGlzLmNvbmZpZy5kb2NzX3BhdGggKyAnLycsICcnKVxuICAgICAgbGV0IGlkID0gcGF0aF9hbGlhcy5yZXBsYWNlKCcubWQnLCcnKVxuICAgICAgbGV0IGRvY3VtZW50ID0gbmV3IERvY3VtZW50KHBhdGgsIHtpZDogaWR9KVxuICAgICAgbGV0IG1vZGVsID0gZG9jdW1lbnQudG9Nb2RlbCh7aWQ6IGlkfSkgXG4gICAgICBcbiAgICAgIFxuICAgICAgZG9jdW1lbnQuaWQgPSBwYXRoX2FsaWFzXG4gICAgICBkb2N1bWVudC5yZWxhdGl2ZV9wYXRoID0gJ2RvY3MvJyArIHBhdGhfYWxpYXNcbiAgICAgIG1vZGVsLmlkID0gaWRcbiAgICAgIG1vZGVsLmdldFBhcmVudCA9ICgpPT57IFxuICAgICAgICByZXR1cm4gdGhpc1xuICAgICAgfVxuXG4gICAgICB0aGlzLmluZGV4W3BhdGhfYWxpYXNdID0gbW9kZWxcbiAgICB9KVxuICB9XG5cbn1cbiJdfQ==