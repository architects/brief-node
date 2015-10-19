'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var _i = require('i');

var _i2 = _interopRequireDefault(_i);

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _globAll = require('glob-all');

var _globAll2 = _interopRequireDefault(_globAll);

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

var _underscore = require('underscore');

var _underscore2 = _interopRequireDefault(_underscore);

var _index = require('./index');

var _index2 = _interopRequireDefault(_index);

var _document_section = require('./document_section');

var _document_section2 = _interopRequireDefault(_document_section);

var _model = require('./model');

var _model2 = _interopRequireDefault(_model);

var _collection = require('./collection');

var _collection2 = _interopRequireDefault(_collection);

var _model_registry = require('./model_registry');

var _model_registry2 = _interopRequireDefault(_model_registry);

var inflections = (0, _i2['default'])();

var definitions = _model_registry2['default'].models;
var type_aliases = _model_registry2['default'].aliases;

var dsl = {
  close: function close() {
    var current = ModelDefinition.last();
    return current.toPrototype();
  },

  define: function define(modelName) {
    var options = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

    var current = definitions[modelName];
    definitions[modelName] = current || new ModelDefinition(modelName, options);

    return current;
  },

  attributes: function attributes() {
    var current = ModelDefinition.last();

    for (var _len = arguments.length, list = Array(_len), _key = 0; _key < _len; _key++) {
      list[_key] = arguments[_key];
    }

    return current.defineAttributes(list);
  },

  attribute: function attribute(name) {
    var current = ModelDefinition.last();
    return current.attributes[name];
  },

  hasMany: function hasMany(relationship) {
    var options = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

    var current = ModelDefinition.last();
    var config = current.relationships[relationship] = options;

    config.hasMany = true;
    config.belongsTo = false;
    config.type = "hasMany";
    config.relationship = relationship;
    config.foreignKey = current.type_alias;
  },

  belongsTo: function belongsTo(relationship) {
    var options = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

    var current = ModelDefinition.last();
    var config = current.relationships[relationship] = options;

    config.hasMany = false;
    config.belongsTo = true;
    config.type = "belongsTo";
    config.modelDefinition = ModelDefinition.lookup(relationship);
    config.relationship = relationship;
    config.foreignKey = config.foreignKey || relationship;
  },

  section: function section(name) {
    var options = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

    var current = ModelDefinition.last();
    return current.defineSection(name, options);
  },

  action: function action(name, handler) {
    var current = ModelDefinition.last();
    return current.defineAction(name, handler);
  }
};

var dsl_methods = ["define", "attributes", "attribute", "section", "action", "actions", "close", "hasMany", "belongsTo"];

var AttributeConfig = (function () {
  function AttributeConfig(config) {
    _classCallCheck(this, AttributeConfig);

    for (var key in config) {
      this[key] = config[key];
    }
  }

  _createClass(AttributeConfig, [{
    key: 'extract',
    value: function extract(selector) {
      this.extraction = this.extraction || {};
      this.extraction.selector = selector;
      return this;
    }
  }]);

  return AttributeConfig;
})();

var ModelDefinition = (function () {
  _createClass(ModelDefinition, null, [{
    key: 'findDefinitionFilesInPath',
    value: function findDefinitionFilesInPath(pathname) {
      var models_path = _path2['default'].resolve(pathname);
      return _globAll2['default'].sync(_path2['default'].join(models_path, '**/*.js'));
    }
  }, {
    key: 'loadDefinitionsFromPath',
    value: function loadDefinitionsFromPath(pathname) {
      var files = ModelDefinition.findDefinitionFilesInPath(pathname);
      files.forEach(function (file) {
        return ModelDefinition.load(file);
      });
    }
  }, {
    key: 'setupDSL',
    value: function setupDSL() {
      dsl_methods.forEach(function (method) {
        return global[method] = dsl[method];
      });
    }
  }, {
    key: 'cleanupDSL',
    value: function cleanupDSL() {
      dsl_methods.forEach(function (method) {
        return delete global[method];
      });
    }
  }, {
    key: 'finalize',
    value: function finalize() {
      ModelDefinition.getAll().forEach(function (definition) {
        return definition.finalizeRelationships();
      });
    }
  }, {
    key: 'load',
    value: function load(path) {
      var content = readPath(path);

      ModelDefinition.setupDSL();

      var loaded = require(path);

      ModelDefinition.cleanupDSL();

      return loaded;
    }
  }, {
    key: 'last',
    value: function last() {
      var all = this.getAll();
      return all[all.length - 1];
    }
  }, {
    key: 'getAll',
    value: function getAll() {
      return (0, _underscore2['default'])(definitions).values();
    }
  }, {
    key: 'getModelSchema',
    value: function getModelSchema() {
      return definitions;
    }
  }, {
    key: 'lookup',
    value: function lookup(aliasOrName) {
      var singular = arguments.length <= 1 || arguments[1] === undefined ? true : arguments[1];

      if (definitions[aliasOrName]) {
        return definitions[aliasOrName];
      }

      var name = type_aliases[aliasOrName];

      if (name && definitions[name]) {
        return definitions[name];
      }

      if (singular == true) {
        return ModelDefinition.lookup(inflections.singularize(aliasOrName), false);
      }
    }
  }, {
    key: 'getTypeAliases',
    value: function getTypeAliases() {
      return Object.keys(type_aliases);
    }
  }]);

  function ModelDefinition() {
    var name = arguments.length <= 0 || arguments[0] === undefined ? "Document" : arguments[0];

    _classCallCheck(this, ModelDefinition);

    this.name = inflections.camelize(name);
    this.type_alias = inflections.underscore(name.toLowerCase());
    this.groupName = inflections.pluralize(name.toLowerCase());

    this.attributes = {};
    this.sections = {};
    this.actions = {};
    this.relationships = {};

    //store a reference in the bucket
    definitions[this.name] = this;
    type_aliases[this.type_alias] = this.name;
  }

  _createClass(ModelDefinition, [{
    key: 'finalizeRelationships',
    value: function finalizeRelationships() {
      (0, _underscore2['default'])(this.relationships).values().forEach(function (relationship) {
        relationship.modelDefinition = function () {
          return ModelDefinition.lookup(relationship.relationship);
        };
      });
    }
  }, {
    key: 'actionNames',
    value: function actionNames() {
      return Object.keys(this.actions);
    }
  }, {
    key: 'getAllModelInstances',
    value: function getAllModelInstances() {
      var results = [];
      var groupName = this.groupName;

      return _underscore2['default'].flatten(_index2['default'].instances().map(function (briefcase) {
        results.push(briefcase.filterAll(function (model) {
          return model.groupName == groupName;
        }));
      }));
    }
  }, {
    key: 'toCollectionPrototype',
    value: function toCollectionPrototype() {
      var collection = function collection() {};
      var definition = this;
      var attributeNames = Object.keys(this.attributes);

      collection.prototype = _collection2['default'];

      for (var name in attributeNames) {
        var finderName = inflections.camelize('find_by_' + name, false);
        collection[finderName] = function (needle) {
          this.models.find(function (model) {
            return model[name] == needle;
          });
        };
      }

      return collection;
    }
  }, {
    key: 'toPrototype',
    value: function toPrototype() {
      var obj = function obj() {};
      var definition = this;
      var attributeNames = Object.keys(this.attributes);

      obj.prototype = _model2['default'];

      obj.getModelDefinition = function () {
        return definition;
      };

      for (var name in attributeNames) {
        Object.defineProperty(obj, name, {
          get: function get() {
            return this.data[name];
          }
        });
      }

      for (var action in this.actions) {
        obj[action] = function () {
          actions[action].apply(obj, arguments);
        };
      }

      return obj;
    }

    /**
     * returns the attribute names as an array
    */
  }, {
    key: 'attributeNames',
    value: function attributeNames() {
      return Object.values(this.attributes).map(function (attr) {
        return attr.name;
      });
    }

    /**
     * returns the attributes which are configured for extraction
    */
  }, {
    key: 'extractions',
    value: function extractions() {
      return Object.values(this.attributes).filter(function (attr) {
        return attr.extraction;
      });
    }

    /** 
     * defines attributes for the model's metadata
    */
  }, {
    key: 'defineAttributes',
    value: function defineAttributes() {
      var _this = this;

      var list = arguments.length <= 0 || arguments[0] === undefined ? [] : arguments[0];

      list.forEach(function (attr) {
        if (typeof attr === "string") attr = { name: attr };

        _this.attributes[attr.name] = new AttributeConfig(attr);
      });

      return this;
    }

    /**
     * defines a section for the model. a section will be
     * built from the written content of the document. sections
     * consist of headings nested within headings.
    */
  }, {
    key: 'defineSection',
    value: function defineSection(sectionName) {
      var options = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

      this.sections[sectionName] = new _document_section2['default'](sectionName, this, options);
      return this.sections[sectionName];
    }

    /**
     * defines an action for this model. an action can be dispatched from
     * the command line, and run on arbitrary paths.
    */
  }, {
    key: 'defineAction',
    value: function defineAction(actionName, handler) {
      this.actions[actionName] = handler;
      return this;
    }
  }]);

  return ModelDefinition;
})();

exports['default'] = ModelDefinition;

function readPath(path) {
  return _fs2['default'].readFileSync(path).toString();
}
module.exports = exports['default'];
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3NyYy9tb2RlbF9kZWZpbml0aW9uLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7OztpQkFBb0IsR0FBRzs7OztvQkFDTixNQUFNOzs7O3VCQUNOLFVBQVU7Ozs7a0JBQ1osSUFBSTs7OzswQkFDTCxZQUFZOzs7O3FCQUNSLFNBQVM7Ozs7Z0NBQ0Msb0JBQW9COzs7O3FCQUM5QixTQUFTOzs7OzBCQUNKLGNBQWM7Ozs7OEJBQ2hCLGtCQUFrQjs7OztBQUV2QyxJQUFNLFdBQVcsR0FBRyxxQkFBUyxDQUFBOztBQUU3QixJQUFNLFdBQVcsR0FBRyw0QkFBUyxNQUFNLENBQUE7QUFDbkMsSUFBTSxZQUFZLEdBQUcsNEJBQVMsT0FBTyxDQUFBOztBQUVyQyxJQUFNLEdBQUcsR0FBRztBQUNWLE9BQUssRUFBRSxpQkFBVTtBQUNmLFFBQUksT0FBTyxHQUFHLGVBQWUsQ0FBQyxJQUFJLEVBQUUsQ0FBQTtBQUNwQyxXQUFPLE9BQU8sQ0FBQyxXQUFXLEVBQUUsQ0FBQTtHQUM3Qjs7QUFFRCxRQUFNLEVBQUUsZ0JBQVUsU0FBUyxFQUFpQjtRQUFmLE9BQU8seURBQUcsRUFBRTs7QUFDdkMsUUFBSSxPQUFPLEdBQUcsV0FBVyxDQUFDLFNBQVMsQ0FBQyxDQUFBO0FBQ3BDLGVBQVcsQ0FBQyxTQUFTLENBQUMsR0FBRyxPQUFPLElBQUksSUFBSSxlQUFlLENBQUMsU0FBUyxFQUFFLE9BQU8sQ0FBQyxDQUFBOztBQUUzRSxXQUFPLE9BQU8sQ0FBQTtHQUNmOztBQUVELFlBQVUsRUFBRSxzQkFBbUI7QUFDN0IsUUFBSSxPQUFPLEdBQUcsZUFBZSxDQUFDLElBQUksRUFBRSxDQUFBOztzQ0FEYixJQUFJO0FBQUosVUFBSTs7O0FBRTNCLFdBQU8sT0FBTyxDQUFDLGdCQUFnQixDQUFDLElBQUksQ0FBQyxDQUFBO0dBQ3RDOztBQUVELFdBQVMsRUFBRSxtQkFBUyxJQUFJLEVBQUM7QUFDdkIsUUFBSSxPQUFPLEdBQUcsZUFBZSxDQUFDLElBQUksRUFB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a0IsZUFBZTs7O3FCQUFmLGVBQWU7O0FBc01wQyxTQUFTLFFBQVEsQ0FBQyxJQUFJLEVBQUU7QUFDdEIsU0FBTyxnQkFBRyxZQUFZLENBQUMsSUFBSSxDQUFDLENBQUMsUUFBUSxFQUFFLENBQUE7Q0FDeEMiLCJmaWxlIjoibW9kZWxfZGVmaW5pdGlvbi5qcyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCBpbmZsZWN0IGZyb20gJ2knXG5pbXBvcnQgcGF0aCBmcm9tICdwYXRoJ1xuaW1wb3J0IGdsb2IgZnJvbSAnZ2xvYi1hbGwnXG5pbXBvcnQgZnMgZnJvbSAnZnMnXG5pbXBvcnQgXyBmcm9tICd1bmRlcnNjb3JlJ1xuaW1wb3J0IGJyaWVmIGZyb20gJy4vaW5kZXgnXG5pbXBvcnQgRG9jdW1lbnRTZWN0aW9uIGZyb20gJy4vZG9jdW1lbnRfc2VjdGlvbidcbmltcG9ydCBNb2RlbCBmcm9tICcuL21vZGVsJ1xuaW1wb3J0IENvbGxlY3Rpb24gZnJvbSAnLi9jb2xsZWN0aW9uJ1xuaW1wb3J0IHJlZ2lzdHJ5IGZyb20gJy4vbW9kZWxfcmVnaXN0cnknXG5cbmNvbnN0IGluZmxlY3Rpb25zID0gaW5mbGVjdCgpXG5cbmNvbnN0IGRlZmluaXRpb25zID0gcmVnaXN0cnkubW9kZWxzIFxuY29uc3QgdHlwZV9hbGlhc2VzID0gcmVnaXN0cnkuYWxpYXNlcyBcblxuY29uc3QgZHNsID0ge1xuICBjbG9zZTogZnVuY3Rpb24oKXtcbiAgICBsZXQgY3VycmVudCA9IE1vZGVsRGVmaW5pdGlvbi5sYXN0KClcbiAgICByZXR1cm4gY3VycmVudC50b1Byb3RvdHlwZSgpXG4gIH0sXG5cbiAgZGVmaW5lOiBmdW5jdGlvbiggbW9kZWxOYW1lLCBvcHRpb25zID0ge30gKSB7XG4gICAgbGV0IGN1cnJlbnQgPSBkZWZpbml0aW9uc1ttb2RlbE5hbWVdXG4gICAgZGVmaW5pdGlvbnNbbW9kZWxOYW1lXSA9IGN1cnJlbnQgfHwgbmV3IE1vZGVsRGVmaW5pdGlvbihtb2RlbE5hbWUsIG9wdGlvbnMpXG5cbiAgICByZXR1cm4gY3VycmVudFxuICB9LFxuXG4gIGF0dHJpYnV0ZXM6IGZ1bmN0aW9uICguLi5saXN0KSB7XG4gICAgbGV0IGN1cnJlbnQgPSBNb2RlbERlZmluaXRpb24ubGFzdCgpXG4gICAgcmV0dXJuIGN1cnJlbnQuZGVmaW5lQXR0cmlidXRlcyhsaXN0KVxuICB9LFxuXG4gIGF0dHJpYnV0ZTogZnVuY3Rpb24obmFtZSl7XG4gICAgbGV0IGN1cnJlbnQgPSBNb2RlbERlZmluaXRpb24ubGFzdCgpXG4gICAgcmV0dXJuIGN1cnJlbnQuYXR0cmlidXRlc1tuYW1lXVxuICB9LFxuICBcbiAgaGFzTWFueTogZnVuY3Rpb24ocmVsYXRpb25zaGlwLCBvcHRpb25zPXt9KXtcbiAgICBsZXQgY3VycmVudCA9IE1vZGVsRGVmaW5pdGlvbi5sYXN0KClcbiAgICBsZXQgY29uZmlnID0gY3VycmVudC5yZWxhdGlvbnNoaXBzW3JlbGF0aW9uc2hpcF0gPSBvcHRpb25zXG5cbiAgICBjb25maWcuaGFzTWFueSA9IHRydWVcbiAgICBjb25maWcuYmVsb25nc1RvID0gZmFsc2VcbiAgICBjb25maWcudHlwZSA9IFwiaGFzTWFueVwiXG4gICAgY29uZmlnLnJlbGF0aW9uc2hpcCA9IHJlbGF0aW9uc2hpcFxuICAgIGNvbmZpZy5mb3JlaWduS2V5ID0gY3VycmVudC50eXBlX2FsaWFzXG4gIH0sXG4gIFxuICBiZWxvbmdzVG86IGZ1bmN0aW9uKHJlbGF0aW9uc2hpcCwgb3B0aW9ucz17fSl7XG4gICAgbGV0IGN1cnJlbnQgPSBNb2RlbERlZmluaXRpb24ubGFzdCgpXG4gICAgbGV0IGNvbmZpZyA9IGN1cnJlbnQucmVsYXRpb25zaGlwc1tyZWxhdGlvbnNoaXBdID0gb3B0aW9uc1xuXG4gICAgY29uZmlnLmhhc01hbnkgPSBmYWxzZVxuICAgIGNvbmZpZy5iZWxvbmdzVG8gPSB0cnVlXG4gICAgY29uZmlnLnR5cGUgPSBcImJlbG9uZ3NUb1wiXG4gICAgY29uZmlnLm1vZGVsRGVmaW5pdGlvbiA9IE1vZGVsRGVmaW5pdGlvbi5sb29rdXAocmVsYXRpb25zaGlwKVxuICAgIGNvbmZpZy5yZWxhdGlvbnNoaXAgPSByZWxhdGlvbnNoaXBcbiAgICBjb25maWcuZm9yZWlnbktleSA9IGNvbmZpZy5mb3JlaWduS2V5IHx8IHJlbGF0aW9uc2hpcFxuICB9LFxuXG4gIHNlY3Rpb246IGZ1bmN0aW9uIChuYW1lLCBvcHRpb25zID0ge30pIHtcbiAgICBsZXQgY3VycmVudCA9IE1vZGVsRGVmaW5pdGlvbi5sYXN0KClcbiAgICByZXR1cm4gY3VycmVudC5kZWZpbmVTZWN0aW9uKG5hbWUsIG9wdGlvbnMpXG4gIH0sXG5cbiAgYWN0aW9uOiBmdW5jdGlvbiAobmFtZSwgaGFuZGxlcikge1xuICAgIGxldCBjdXJyZW50ID0gTW9kZWxEZWZpbml0aW9uLmxhc3QoKVxuICAgIHJldHVybiBjdXJyZW50LmRlZmluZUFjdGlvbihuYW1lLCBoYW5kbGVyKVxuICB9XG59XG5cbmNvbnN0IGRzbF9tZXRob2RzID0gW1xuICBcImRlZmluZVwiLFxuICBcImF0dHJpYnV0ZXNcIixcbiAgXCJhdHRyaWJ1dGVcIixcbiAgXCJzZWN0aW9uXCIsXG4gIFwiYWN0aW9uXCIsXG4gIFwiYWN0aW9uc1wiLFxuICBcImNsb3NlXCIsXG4gIFwiaGFzTWFueVwiLFxuICBcImJlbG9uZ3NUb1wiXG5dXG5cblxuY2xhc3MgQXR0cmlidXRlQ29uZmlnIHtcbiAgY29uc3RydWN0b3IoY29uZmlnKXtcbiAgICBmb3IodmFyIGtleSBpbiBjb25maWcpe1xuICAgICAgdGhpc1trZXldID0gY29uZmlnW2tleV1cbiAgICB9XG4gIH1cblxuICBleHRyYWN0KHNlbGVjdG9yKXtcbiAgICB0aGlzLmV4dHJhY3Rpb24gPSB0aGlzLmV4dHJhY3Rpb24gfHwge31cbiAgICB0aGlzLmV4dHJhY3Rpb24uc2VsZWN0b3IgPSBzZWxlY3RvclxuICAgIHJldHVybiB0aGlzXG4gIH1cbn1cblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgTW9kZWxEZWZpbml0aW9uIHtcbiAgc3RhdGljIGZpbmREZWZpbml0aW9uRmlsZXNJblBhdGgocGF0aG5hbWUpe1xuICAgIGxldCBtb2RlbHNfcGF0aCA9IHBhdGgucmVzb2x2ZShwYXRobmFtZSlcbiAgICByZXR1cm4gZ2xvYi5zeW5jKHBhdGguam9pbihtb2RlbHNfcGF0aCwnKiovKi5qcycpKVxuICB9XG5cbiAgc3RhdGljIGxvYWREZWZpbml0aW9uc0Zyb21QYXRoKHBhdGhuYW1lKXtcbiAgICBsZXQgZmlsZXMgPSBNb2RlbERlZmluaXRpb24uZmluZERlZmluaXRpb25GaWxlc0luUGF0aChwYXRobmFtZSlcbiAgICBmaWxlcy5mb3JFYWNoKGZpbGUgPT4gTW9kZWxEZWZpbml0aW9uLmxvYWQoZmlsZSkpXG4gIH1cblxuICBzdGF0aWMgc2V0dXBEU0wgKCkge1xuICAgIGRzbF9tZXRob2RzLmZvckVhY2gobWV0aG9kID0+IGdsb2JhbFttZXRob2RdID0gZHNsW21ldGhvZF0pICAgIFxuICB9XG5cbiAgc3RhdGljIGNsZWFudXBEU0wgKCkge1xuICAgIGRzbF9tZXRob2RzLmZvckVhY2gobWV0aG9kID0+IGRlbGV0ZShnbG9iYWxbbWV0aG9kXSkpXG4gIH1cbiAgXG4gIHN0YXRpYyBmaW5hbGl6ZSgpe1xuICAgIE1vZGVsRGVmaW5pdGlvbi5nZXRBbGwoKS5mb3JFYWNoKGRlZmluaXRpb24gPT4gZGVmaW5pdGlvbi5maW5hbGl6ZVJlbGF0aW9uc2hpcHMoKSlcbiAgfVxuXG4gIHN0YXRpYyBsb2FkIChwYXRoKSB7XG4gICAgbGV0IGNvbnRlbnQgPSByZWFkUGF0aChwYXRoKVxuXG4gICAgTW9kZWxEZWZpbml0aW9uLnNldHVwRFNMKClcblxuICAgIGxldCBsb2FkZWQgPSByZXF1aXJlKHBhdGgpXG5cbiAgICBNb2RlbERlZmluaXRpb24uY2xlYW51cERTTCgpXG5cbiAgICByZXR1cm4gbG9hZGVkXG4gIH1cblxuICBzdGF0aWMgbGFzdCAoKSB7XG4gICAgbGV0IGFsbCA9IHRoaXMuZ2V0QWxsKClcbiAgICByZXR1cm4gYWxsW2FsbC5sZW5ndGggLSAxXVxuICB9XG5cbiAgc3RhdGljIGdldEFsbCAoKSB7XG4gICAgcmV0dXJuIF8oZGVmaW5pdGlvbnMpLnZhbHVlcygpXG4gIH1cblxuICBzdGF0aWMgZ2V0TW9kZWxTY2hlbWEgKCkge1xuICAgIHJldHVybiBkZWZpbml0aW9uc1xuICB9XG5cbiAgc3RhdGljIGxvb2t1cCAoYWxpYXNPck5hbWUsIHNpbmd1bGFyID0gdHJ1ZSkge1xuICAgIGlmKGRlZmluaXRpb25zW2FsaWFzT3JOYW1lXSl7XG4gICAgICByZXR1cm4gZGVmaW5pdGlvbnNbYWxpYXNPck5hbWVdXG4gICAgfVxuICAgIFxuICAgIGxldCBuYW1lID0gdHlwZV9hbGlhc2VzW2FsaWFzT3JOYW1lXVxuICAgIFxuICAgIGlmKG5hbWUgJiYgZGVmaW5pdGlvbnNbbmFtZV0pe1xuICAgICAgcmV0dXJuIGRlZmluaXRpb25zW25hbWVdXG4gICAgfVxuXG4gICAgaWYoc2luZ3VsYXIgPT0gdHJ1ZSl7XG4gICAgICByZXR1cm4gTW9kZWxEZWZpbml0aW9uLmxvb2t1cChpbmZsZWN0aW9ucy5zaW5ndWxhcml6ZShhbGlhc09yTmFtZSksIGZhbHNlKVxuICAgIH1cbiAgfVxuICBcbiAgc3RhdGljIGdldFR5cGVBbGlhc2VzKCl7XG4gICAgcmV0dXJuIE9iamVjdC5rZXlzKHR5cGVfYWxpYXNlcylcbiAgfVxuXG4gIGNvbnN0cnVjdG9yIChuYW1lID0gXCJEb2N1bWVudFwiKSB7XG4gICAgdGhpcy5uYW1lID0gaW5mbGVjdGlvbnMuY2FtZWxpemUobmFtZSlcbiAgICB0aGlzLnR5cGVfYWxpYXMgPSBpbmZsZWN0aW9ucy51bmRlcnNjb3JlKG5hbWUudG9Mb3dlckNhc2UoKSlcbiAgICB0aGlzLmdyb3VwTmFtZSA9IGluZmxlY3Rpb25zLnBsdXJhbGl6ZShuYW1lLnRvTG93ZXJDYXNlKCkpXG5cbiAgICB0aGlzLmF0dHJpYnV0ZXMgPSB7fVxuICAgIHRoaXMuc2VjdGlvbnMgPSB7fVxuICAgIHRoaXMuYWN0aW9ucyA9IHt9XG4gICAgdGhpcy5yZWxhdGlvbnNoaXBzID0ge31cblxuICAgIC8vc3RvcmUgYSByZWZlcmVuY2UgaW4gdGhlIGJ1Y2tldFxuICAgIGRlZmluaXRpb25zW3RoaXMubmFtZV0gPSB0aGlzXG4gICAgdHlwZV9hbGlhc2VzW3RoaXMudHlwZV9hbGlhc10gPSB0aGlzLm5hbWVcbiAgfVxuICBcbiAgZmluYWxpemVSZWxhdGlvbnNoaXBzKCl7XG4gICAgXyh0aGlzLnJlbGF0aW9uc2hpcHMpLnZhbHVlcygpLmZvckVhY2gocmVsYXRpb25zaGlwID0+IHtcbiAgICAgIHJlbGF0aW9uc2hpcC5tb2RlbERlZmluaXRpb24gPSBmdW5jdGlvbigpe1xuICAgICAgICByZXR1cm4gTW9kZWxEZWZpbml0aW9uLmxvb2t1cChyZWxhdGlvbnNoaXAucmVsYXRpb25zaGlwKVxuICAgICAgfVxuICAgIH0pXG4gIH1cblxuICBhY3Rpb25OYW1lcygpe1xuICAgIHJldHVybiBPYmplY3Qua2V5cyh0aGlzLmFjdGlvbnMpXG4gIH1cblxuICBnZXRBbGxNb2RlbEluc3RhbmNlcygpe1xuICAgIGxldCByZXN1bHRzID0gW11cbiAgICBsZXQgZ3JvdXBOYW1lID0gdGhpcy5ncm91cE5hbWVcblxuICAgIHJldHVybiBfLmZsYXR0ZW4oYnJpZWYuaW5zdGFuY2VzKCkubWFwKGJyaWVmY2FzZSA9PiB7XG4gICAgICByZXN1bHRzLnB1c2goYnJpZWZjYXNlLmZpbHRlckFsbChtb2RlbCA9PiBtb2RlbC5ncm91cE5hbWUgPT0gZ3JvdXBOYW1lKSlcbiAgICB9KSlcbiAgfVxuXG4gIHRvQ29sbGVjdGlvblByb3RvdHlwZSgpIHtcbiAgICBsZXQgY29sbGVjdGlvbiA9IGZ1bmN0aW9uKCl7IH1cbiAgICBsZXQgZGVmaW5pdGlvbiA9IHRoaXNcbiAgICBsZXQgYXR0cmlidXRlTmFtZXMgPSBPYmplY3Qua2V5cyh0aGlzLmF0dHJpYnV0ZXMpXG5cbiAgICBjb2xsZWN0aW9uLnByb3RvdHlwZSA9IENvbGxlY3Rpb25cblxuICAgIFxuICAgIGZvcih2YXIgbmFtZSBpbiBhdHRyaWJ1dGVOYW1lcyl7XG4gICAgICBsZXQgZmluZGVyTmFtZSA9IGluZmxlY3Rpb25zLmNhbWVsaXplKCdmaW5kX2J5XycgKyBuYW1lLCBmYWxzZSlcbiAgICAgIGNvbGxlY3Rpb25bZmluZGVyTmFtZV0gPSBmdW5jdGlvbihuZWVkbGUpe1xuICAgICAgICB0aGlzLm1vZGVscy5maW5kKG1vZGVsID0+IG1vZGVsW25hbWVdID09IG5lZWRsZSlcbiAgICAgIH1cbiAgICB9XG5cbiAgICByZXR1cm4gY29sbGVjdGlvblxuICB9XG5cbiAgdG9Qcm90b3R5cGUgKCkge1xuICAgIGxldCBvYmogPSBmdW5jdGlvbigpeyB9XG4gICAgbGV0IGRlZmluaXRpb24gPSB0aGlzXG4gICAgbGV0IGF0dHJpYnV0ZU5hbWVzID0gT2JqZWN0LmtleXModGhpcy5hdHRyaWJ1dGVzKVxuXG4gICAgb2JqLnByb3RvdHlwZSA9IE1vZGVsXG4gICAgXG4gICAgb2JqLmdldE1vZGVsRGVmaW5pdGlvbiA9IGZ1bmN0aW9uKCl7XG4gICAgICByZXR1cm4gZGVmaW5pdGlvblxuICAgIH1cblxuICAgIGZvcih2YXIgbmFtZSBpbiBhdHRyaWJ1dGVOYW1lcyl7XG4gICAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkob2JqLCBuYW1lLCB7XG4gICAgICAgIGdldDogZnVuY3Rpb24oKXtcbiAgICAgICAgICByZXR1cm4gdGhpcy5kYXRhW25hbWVdXG4gICAgICAgIH1cbiAgICAgIH0pXG4gICAgfVxuXG4gICAgZm9yKHZhciBhY3Rpb24gaW4gdGhpcy5hY3Rpb25zKXtcbiAgICAgIG9ialthY3Rpb25dID0gZnVuY3Rpb24oKXtcbiAgICAgICAgYWN0aW9uc1thY3Rpb25dLmFwcGx5KG9iaiwgYXJndW1lbnRzKVxuICAgICAgfVxuICAgIH1cblxuICAgIHJldHVybiBvYmpcbiAgfVxuICBcbiAgLyoqXG4gICAqIHJldHVybnMgdGhlIGF0dHJpYnV0ZSBuYW1lcyBhcyBhbiBhcnJheVxuICAqL1xuICBhdHRyaWJ1dGVOYW1lcygpIHtcbiAgICByZXR1cm4gT2JqZWN0LnZhbHVlcyh0aGlzLmF0dHJpYnV0ZXMpLm1hcChhdHRyID0+IGF0dHIubmFtZSlcbiAgfVxuICBcbiAgLyoqXG4gICAqIHJldHVybnMgdGhlIGF0dHJpYnV0ZXMgd2hpY2ggYXJlIGNvbmZpZ3VyZWQgZm9yIGV4dHJhY3Rpb25cbiAgKi9cbiAgZXh0cmFjdGlvbnMoKSB7XG4gICAgcmV0dXJuIE9iamVjdC52YWx1ZXModGhpcy5hdHRyaWJ1dGVzKS5maWx0ZXIoYXR0ciA9PiBhdHRyLmV4dHJhY3Rpb24pXG4gIH1cblxuICAvKiogXG4gICAqIGRlZmluZXMgYXR0cmlidXRlcyBmb3IgdGhlIG1vZGVsJ3MgbWV0YWRhdGFcbiAgKi9cbiAgZGVmaW5lQXR0cmlidXRlcyAobGlzdCA9IFtdKSB7XG4gICAgbGlzdC5mb3JFYWNoKGF0dHIgPT4ge1xuICAgICAgaWYodHlwZW9mKGF0dHIpID09PSBcInN0cmluZ1wiKVxuICAgICAgICBhdHRyID0ge25hbWU6IGF0dHJ9XG4gICAgICBcbiAgICAgIHRoaXMuYXR0cmlidXRlc1thdHRyLm5hbWVdID0gbmV3IEF0dHJpYnV0ZUNvbmZpZyhhdHRyKVxuICAgIH0pXG5cbiAgICByZXR1cm4gdGhpc1xuICB9XG4gIFxuICAvKipcbiAgICogZGVmaW5lcyBhIHNlY3Rpb24gZm9yIHRoZSBtb2RlbC4gYSBzZWN0aW9uIHdpbGwgYmVcbiAgICogYnVpbHQgZnJvbSB0aGUgd3JpdHRlbiBjb250ZW50IG9mIHRoZSBkb2N1bWVudC4gc2VjdGlvbnNcbiAgICogY29uc2lzdCBvZiBoZWFkaW5ncyBuZXN0ZWQgd2l0aGluIGhlYWRpbmdzLlxuICAqL1xuICBkZWZpbmVTZWN0aW9uIChzZWN0aW9uTmFtZSwgb3B0aW9ucyA9IHt9KSB7XG4gICAgdGhpcy5zZWN0aW9uc1tzZWN0aW9uTmFtZV0gPSBuZXcgRG9jdW1lbnRTZWN0aW9uKHNlY3Rpb25OYW1lLCB0aGlzLCBvcHRpb25zKVxuICAgIHJldHVybiB0aGlzLnNlY3Rpb25zW3NlY3Rpb25OYW1lXVxuICB9XG5cbiAgLyoqXG4gICAqIGRlZmluZXMgYW4gYWN0aW9uIGZvciB0aGlzIG1vZGVsLiBhbiBhY3Rpb24gY2FuIGJlIGRpc3BhdGNoZWQgZnJvbVxuICAgKiB0aGUgY29tbWFuZCBsaW5lLCBhbmQgcnVuIG9uIGFyYml0cmFyeSBwYXRocy5cbiAgKi9cbiAgZGVmaW5lQWN0aW9uIChhY3Rpb25OYW1lLCBoYW5kbGVyKSB7XG4gICAgdGhpcy5hY3Rpb25zW2FjdGlvbk5hbWVdID0gaGFuZGxlclxuICAgIHJldHVybiB0aGlzXG4gIH1cbn1cblxuZnVuY3Rpb24gcmVhZFBhdGgocGF0aCkge1xuICByZXR1cm4gZnMucmVhZEZpbGVTeW5jKHBhdGgpLnRvU3RyaW5nKClcbn1cbiJdfQ==