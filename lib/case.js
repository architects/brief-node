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

var _i = require('i');

var _i2 = _interopRequireDefault(_i);

var _underscore = require('underscore');

var _underscore2 = _interopRequireDefault(_underscore);

var inflect = (0, _i2['default'])(true);

var Case = (function () {
  _createClass(Case, null, [{
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

    this.config = {
      docs_path: options.docs_path || this.root + '/docs',
      models_path: options.models_path || _path2['default'].join(this.root, 'models'),
      templates_path: options.templates_path || _path2['default'].join(this.root, 'templates'),
      assets_path: options.assets_path || _path2['default'].join(this.root, 'assets')
    };

    this.buildIndex();
    this.createCollections();
  }

  _createClass(Case, [{
    key: 'at',
    value: function at(path_alias) {
      if (!path_alias.match(/\.md$/i)) {
        path_alias = path_alias + '.md';
      }

      return this.index[path_alias];
    }
  }, {
    key: 'selectModelsByType',
    value: function selectModelsByType(type) {
      return (0, _underscore2['default'])(this.getAllModels()).select(function (model) {
        return model.type == type;
      });
    }
  }, {
    key: 'selectModelsByGroup',
    value: function selectModelsByGroup(groupName) {
      return (0, _underscore2['default'])(this.getAllModels()).select(function (model) {
        return model.groupName == groupName;
      });
    }
  }, {
    key: 'createCollections',
    value: function createCollections() {
      var _this = this;

      var groups = this.getGroupNames();

      groups.forEach(function (group) {
        _this[group] = (0, _underscore2['default'])(_this.selectModelsByGroup(group));
      });
    }
  }, {
    key: 'buildIndex',
    value: function buildIndex() {
      var _this2 = this;

      var paths = this.getDocumentPaths();
      var briefcase = this;

      paths.forEach(function (path) {
        var path_alias = path.replace(_this2.config.docs_path + '/', '');
        _this2.index[path_alias] = _model2['default'].create(path, { relative_path: path_alias, parent: _this2 });
      });
    }
  }, {
    key: 'getAllModels',
    value: function getAllModels() {
      return (0, _underscore2['default'])(this.index).values();
    }
  }, {
    key: 'getAllDocuments',
    value: function getAllDocuments() {
      return (0, _underscore2['default'])(this.getAllModels()).pluck('document');
    }
  }, {
    key: 'getGroupNames',
    value: function getGroupNames() {
      var pluralize = inflect.pluralize;
      var groupNames = [];
      var types = this.getDocumentTypes();

      types.forEach(function (docType) {
        groupNames.push(pluralize(docType));
      });

      return groupNames;
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
    key: 'getDocumentPaths',
    value: function getDocumentPaths() {
      var docs_path = _path2['default'].resolve(this.config.docs_path);
      return _globAll2['default'].sync(_path2['default'].join(docs_path, '**/*.md'));
    }
  }]);

  return Case;
})();

exports['default'] = Case;
module.exports = exports['default'];