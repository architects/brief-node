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

var _model = require('./model');

var _model2 = _interopRequireDefault(_model);

var _model_definition = require('./model_definition');

var _model_definition2 = _interopRequireDefault(_model_definition);

var _i = require('i');

var _i2 = _interopRequireDefault(_i);

var _underscore = require('underscore');

var _underscore2 = _interopRequireDefault(_underscore);

var inflect = (0, _i2['default'])(true);

var Case = (function () {
  _createClass(Case, [{
    key: 'toString',
    value: function toString() {
      return this.root;
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
  }], [{
    key: 'load',
    value: function load(root) {
      var options = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

      return new Case(root, options);
    }
  }]);

  function Case(root, options) {
    _classCallCheck(this, Case);

    this.root = _path2['default'].resolve(root);
    this.options = options || {};

    this.index = {};
    this.model_definitions = {};

    this.config = {
      docs_path: options.docs_path || this.root + '/docs',
      models_path: options.models_path || _path2['default'].join(this.root, 'models'),
      assets_path: options.assets_path || _path2['default'].join(this.root, 'assets')
    };

    this._loadModelDefinitions();
    this._buildIndex();
    this._createCollections();
  }

  /**
   * get model at the given relative path 
   * 
   * @example
   *  briefcase.at('epics/model-definition-dsl')
  */

  _createClass(Case, [{
    key: 'at',
    value: function at(path_alias) {
      if (!path_alias.match(/\.md$/i)) {
        path_alias = path_alias + '.md';
      }

      return this.index[path_alias];
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
      return (0, _underscore2['default'])(this.index).values();
    }

    /**
     * returns the raw documents in this briefcase
    */
  }, {
    key: 'getAllDocuments',
    value: function getAllDocuments() {
      return this.getAllModels(function (model) {
        return model.document;
      });
    }
  }, {
    key: 'getGroupNames',
    value: function getGroupNames() {
      var pluralize = inflect.pluralize;
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
        types.push(doc.data.type);
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
    value: function getModelDefinition(modelName) {
      return this.model_definitions[modelName];
    }
  }, {
    key: 'getModelSchema',
    value: function getModelSchema() {
      return _model_definition2['default'].getModelSchema();
    }
  }, {
    key: 'getModelDefinition',
    value: function getModelDefinition(modelIdentifier) {
      var schema = _model_definition2['default'].getModelSchema();
      return schema[modelIdentifier];
    }
  }, {
    key: '_createCollections',
    value: function _createCollections() {
      var _this = this;

      var groups = this.getGroupNames();
      groups.forEach(function (group) {
        return _this[group] = (0, _underscore2['default'])(_this.selectModelsByGroup(group));
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
      var _this2 = this;

      this._getModelDefinitionFiles().forEach(function (file) {
        return _model_definition2['default'].load(file);
      });
      _model_definition2['default'].getAll().forEach(function (definition) {
        return _this2.loadModel(definition);
      });
    }
  }, {
    key: '_buildIndex',
    value: function _buildIndex() {
      var _this3 = this;

      var paths = this._getDocumentPaths();
      var briefcase = this;

      paths.forEach(function (path) {
        var path_alias = path.replace(_this3.config.docs_path + '/', '');
        _this3.index[path_alias] = _model2['default'].create(path, { id: path_alias.replace(/\.md$/i, ''), parent: _this3 });
      });
    }
  }]);

  return Case;
})();

exports['default'] = Case;
module.exports = exports['default'];