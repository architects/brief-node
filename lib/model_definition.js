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

var _extractions = require('./extractions');

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

  extend: function extend(modelName) {
    var options = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

    var current = definitions[modelName];
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

  description: function description(_description) {
    var current = ModelDefinition.last();
    current.description = _description;
    return current;
  },

  action: function action(name, handler) {
    var current = ModelDefinition.last();
    return current.defineAction(name, handler);
  },

  extract: function extract(selector) {
    var options = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

    var current = ModelDefinition.last();
    return current.addExtractionRule(selector, options = {});
  }
};

var dsl_methods = ["define", "extend", "attributes", "attribute", "section", "action", "description", "actions", "close", "hasMany", "belongsTo", "extract"];

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
    this.extractionRules = [];
    this.description = "";

    //store a reference in the bucket
    definitions[this.name] = this;
    type_aliases[this.type_alias] = this.name;
  }

  _createClass(ModelDefinition, [{
    key: 'addExtractionRule',
    value: function addExtractionRule() {
      var options = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

      var rule = new _extractions.ExtractionRule(options);
      this.extractionRules.push(rule);
      return this;
    }
  }, {
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3NyYy9tb2RlbF9kZWZpbml0aW9uLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7OztpQkFBb0IsR0FBRzs7OztvQkFDTixNQUFNOzs7O3VCQUNOLFVBQVU7Ozs7a0JBQ1osSUFBSTs7OzswQkFDTCxZQUFZOzs7O3FCQUNSLFNBQVM7Ozs7Z0NBQ0Msb0JBQW9COzs7O3FCQUM5QixTQUFTOzs7OzBCQUNKLGNBQWM7Ozs7OEJBQ2hCLGtCQUFrQjs7OzsyQkFDVixlQUFlOztBQUU1QyxJQUFNLFdBQVcsR0FBRyxxQkFBUyxDQUFBOztBQUU3QixJQUFNLFdBQVcsR0FBRyw0QkFBUyxNQUFNLENBQUE7QUFDbkMsSUFBTSxZQUFZLEdBQUcsNEJBQVMsT0FBTyxDQUFBOztBQUVyQyxJQUFNLEdBQUcsR0FBRztBQUNWLE9BQUssRUFBRSxpQkFBVTtBQUNmLFFBQUksT0FBTyxHQUFHLGVBQWUsQ0FBQyxJQUFJLEVBQUUsQ0FBQTtBQUNwQyxXQUFPLE9BQU8sQ0FBQyxXQUFXLEVBQUUsQ0FBQTtHQUM3Qjs7QUFFRCxRQUFNLEVBQUUsZ0JBQVUsU0FBUyxFQUFpQjtRQUFmLE9BQU8seURBQUcsRUFBRTs7QUFDdkMsUUFBSSxPQUFPLEdBQUcsV0FBVyxDQUFDLFNBQVMsQ0FBQyxDQUFBO0FBQ3BDLGVBQVcsQ0FBQyxTQUFTLENBQUMsR0FBRyxPQUFPLElBQUksSUFBSSxlQUFlLENBQUMsU0FBUyxFQUFFLE9BQU8sQ0FBQyxDQUFBOztBQUUzRSxXQUFPLE9BQU8sQ0FBQTtHQUNmOztBQUVELFFBQU0sRUFBRSxnQkFBVSxTQUFTLEVBQWdCO1FBQWQsT0FBTyx5REFBRyxFQUFFOztBQUN2QyxRQUFJLE9BQU8sR0FBRyxXQUFXLENBQUMsU0FBUyxDQUFDLENBQUE7QUFDcEMsV0FBTyxPQUFPLENBQUE7R0FDZjs7QUFFRCxZQUFVLEVBQUUsc0JBQW1CO0FBQzdCLFFBQUksT0FBTyxHQUFHLGVBQWUsQ0FBQyxJQUFJLEVBQUUsQ0FBQTs7c0NBRGIsSUFB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QUFHO0FBQ1osYUFBTyxNQUFNLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxVQUFVLENBQUMsQ0FBQyxNQUFNLENBQUMsVUFBQSxJQUFJO2VBQUksSUFBSSxDQUFDLFVBQVU7T0FBQSxDQUFDLENBQUE7S0FDdEU7Ozs7Ozs7V0FLZ0IsNEJBQVk7OztVQUFYLElBQUkseURBQUcsRUFBRTs7QUFDekIsVUFBSSxDQUFDLE9BQU8sQ0FBQyxVQUFBLElBQUksRUFBSTtBQUNuQixZQUFHLE9BQU8sSUFBSSxBQUFDLEtBQUssUUFBUSxFQUMxQixJQUFJLEdBQUcsRUFBQyxJQUFJLEVBQUUsSUFBSSxFQUFDLENBQUE7O0FBRXJCLGNBQUssVUFBVSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsR0FBRyxJQUFJLGVBQWUsQ0FBQyxJQUFJLENBQUMsQ0FBQTtPQUN2RCxDQUFDLENBQUE7O0FBRUYsYUFBTyxJQUFJLENBQUE7S0FDWjs7Ozs7Ozs7O1dBT2EsdUJBQUMsV0FBVyxFQUFnQjtVQUFkLE9BQU8seURBQUcsRUFBRTs7QUFDdEMsVUFBSSxDQUFDLFFBQVEsQ0FBQyxXQUFXLENBQUMsR0FBRyxrQ0FBb0IsV0FBVyxFQUFFLElBQUksRUFBRSxPQUFPLENBQUMsQ0FBQTtBQUM1RSxhQUFPLElBQUksQ0FBQyxRQUFRLENBQUMsV0FBVyxDQUFDLENBQUE7S0FDbEM7Ozs7Ozs7O1dBTVksc0JBQUMsVUFBVSxFQUFFLE9BQU8sRUFBRTtBQUNqQyxVQUFJLENBQUMsT0FBTyxDQUFDLFVBQVUsQ0FBQyxHQUFHLE9BQU8sQ0FBQTtBQUNsQyxhQUFPLElBQUksQ0FBQTtLQUNaOzs7U0EzTWtCLGVBQWU7OztxQkFBZixlQUFlOztBQThNcEMsU0FBUyxRQUFRLENBQUMsSUFBSSxFQUFFO0FBQ3RCLFNBQU8sZ0JBQUcsWUFBWSxDQUFDLElBQUksQ0FBQyxDQUFDLFFBQVEsRUFBRSxDQUFBO0NBQ3hDIiwiZmlsZSI6Im1vZGVsX2RlZmluaXRpb24uanMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgaW5mbGVjdCBmcm9tICdpJ1xuaW1wb3J0IHBhdGggZnJvbSAncGF0aCdcbmltcG9ydCBnbG9iIGZyb20gJ2dsb2ItYWxsJ1xuaW1wb3J0IGZzIGZyb20gJ2ZzJ1xuaW1wb3J0IF8gZnJvbSAndW5kZXJzY29yZSdcbmltcG9ydCBicmllZiBmcm9tICcuL2luZGV4J1xuaW1wb3J0IERvY3VtZW50U2VjdGlvbiBmcm9tICcuL2RvY3VtZW50X3NlY3Rpb24nXG5pbXBvcnQgTW9kZWwgZnJvbSAnLi9tb2RlbCdcbmltcG9ydCBDb2xsZWN0aW9uIGZyb20gJy4vY29sbGVjdGlvbidcbmltcG9ydCByZWdpc3RyeSBmcm9tICcuL21vZGVsX3JlZ2lzdHJ5J1xuaW1wb3J0IHtFeHRyYWN0aW9uUnVsZX0gZnJvbSAnLi9leHRyYWN0aW9ucydcblxuY29uc3QgaW5mbGVjdGlvbnMgPSBpbmZsZWN0KClcblxuY29uc3QgZGVmaW5pdGlvbnMgPSByZWdpc3RyeS5tb2RlbHMgXG5jb25zdCB0eXBlX2FsaWFzZXMgPSByZWdpc3RyeS5hbGlhc2VzIFxuXG5jb25zdCBkc2wgPSB7XG4gIGNsb3NlOiBmdW5jdGlvbigpe1xuICAgIGxldCBjdXJyZW50ID0gTW9kZWxEZWZpbml0aW9uLmxhc3QoKVxuICAgIHJldHVybiBjdXJyZW50LnRvUHJvdG90eXBlKClcbiAgfSxcbiAgXG4gIGRlZmluZTogZnVuY3Rpb24oIG1vZGVsTmFtZSwgb3B0aW9ucyA9IHt9ICkge1xuICAgIGxldCBjdXJyZW50ID0gZGVmaW5pdGlvbnNbbW9kZWxOYW1lXVxuICAgIGRlZmluaXRpb25zW21vZGVsTmFtZV0gPSBjdXJyZW50IHx8IG5ldyBNb2RlbERlZmluaXRpb24obW9kZWxOYW1lLCBvcHRpb25zKVxuXG4gICAgcmV0dXJuIGN1cnJlbnRcbiAgfSxcblxuICBleHRlbmQ6IGZ1bmN0aW9uKCBtb2RlbE5hbWUsIG9wdGlvbnMgPSB7fSkge1xuICAgIGxldCBjdXJyZW50ID0gZGVmaW5pdGlvbnNbbW9kZWxOYW1lXVxuICAgIHJldHVybiBjdXJyZW50XG4gIH0sXG5cbiAgYXR0cmlidXRlczogZnVuY3Rpb24gKC4uLmxpc3QpIHtcbiAgICBsZXQgY3VycmVudCA9IE1vZGVsRGVmaW5pdGlvbi5sYXN0KClcbiAgICByZXR1cm4gY3VycmVudC5kZWZpbmVBdHRyaWJ1dGVzKGxpc3QpXG4gIH0sXG5cbiAgYXR0cmlidXRlOiBmdW5jdGlvbihuYW1lKXtcbiAgICBsZXQgY3VycmVudCA9IE1vZGVsRGVmaW5pdGlvbi5sYXN0KClcbiAgICByZXR1cm4gY3VycmVudC5hdHRyaWJ1dGVzW25hbWVdXG4gIH0sXG4gIFxuICBoYXNNYW55OiBmdW5jdGlvbihyZWxhdGlvbnNoaXAsIG9wdGlvbnM9e30pe1xuICAgIGxldCBjdXJyZW50ID0gTW9kZWxEZWZpbml0aW9uLmxhc3QoKVxuICAgIGxldCBjb25maWcgPSBjdXJyZW50LnJlbGF0aW9uc2hpcHNbcmVsYXRpb25zaGlwXSA9IG9wdGlvbnNcblxuICAgIGNvbmZpZy5oYXNNYW55ID0gdHJ1ZVxuICAgIGNvbmZpZy5iZWxvbmdzVG8gPSBmYWxzZVxuICAgIGNvbmZpZy50eXBlID0gXCJoYXNNYW55XCJcbiAgICBjb25maWcucmVsYXRpb25zaGlwID0gcmVsYXRpb25zaGlwXG4gICAgY29uZmlnLmZvcmVpZ25LZXkgPSBjdXJyZW50LnR5cGVfYWxpYXNcbiAgfSxcbiAgXG4gIGJlbG9uZ3NUbzogZnVuY3Rpb24ocmVsYXRpb25zaGlwLCBvcHRpb25zPXt9KXtcbiAgICBsZXQgY3VycmVudCA9IE1vZGVsRGVmaW5pdGlvbi5sYXN0KClcbiAgICBsZXQgY29uZmlnID0gY3VycmVudC5yZWxhdGlvbnNoaXBzW3JlbGF0aW9uc2hpcF0gPSBvcHRpb25zXG5cbiAgICBjb25maWcuaGFzTWFueSA9IGZhbHNlXG4gICAgY29uZmlnLmJlbG9uZ3NUbyA9IHRydWVcbiAgICBjb25maWcudHlwZSA9IFwiYmVsb25nc1RvXCJcbiAgICBjb25maWcubW9kZWxEZWZpbml0aW9uID0gTW9kZWxEZWZpbml0aW9uLmxvb2t1cChyZWxhdGlvbnNoaXApXG4gICAgY29uZmlnLnJlbGF0aW9uc2hpcCA9IHJlbGF0aW9uc2hpcFxuICAgIGNvbmZpZy5mb3JlaWduS2V5ID0gY29uZmlnLmZvcmVpZ25LZXkgfHwgcmVsYXRpb25zaGlwXG4gIH0sXG5cbiAgc2VjdGlvbjogZnVuY3Rpb24gKG5hbWUsIG9wdGlvbnMgPSB7fSkge1xuICAgIGxldCBjdXJyZW50ID0gTW9kZWxEZWZpbml0aW9uLmxhc3QoKVxuICAgIHJldHVybiBjdXJyZW50LmRlZmluZVNlY3Rpb24obmFtZSwgb3B0aW9ucylcbiAgfSxcbiAgXG4gIGRlc2NyaXB0aW9uOiBmdW5jdGlvbihkZXNjcmlwdGlvbil7XG4gICAgbGV0IGN1cnJlbnQgPSBNb2RlbERlZmluaXRpb24ubGFzdCgpXG4gICAgY3VycmVudC5kZXNjcmlwdGlvbiA9IGRlc2NyaXB0aW9uXG4gICAgcmV0dXJuIGN1cnJlbnRcbiAgfSxcblxuXG4gIGFjdGlvbjogZnVuY3Rpb24gKG5hbWUsIGhhbmRsZXIpIHtcbiAgICBsZXQgY3VycmVudCA9IE1vZGVsRGVmaW5pdGlvbi5sYXN0KClcbiAgICByZXR1cm4gY3VycmVudC5kZWZpbmVBY3Rpb24obmFtZSwgaGFuZGxlcilcbiAgfSxcbiAgXG4gIGV4dHJhY3Q6IGZ1bmN0aW9uKHNlbGVjdG9yLCBvcHRpb25zPXt9KXtcbiAgICBsZXQgY3VycmVudCA9IE1vZGVsRGVmaW5pdGlvbi5sYXN0KClcbiAgICByZXR1cm4gY3VycmVudC5hZGRFeHRyYWN0aW9uUnVsZShzZWxlY3Rvciwgb3B0aW9ucz17fSkgXG4gIH1cbn1cblxuY29uc3QgZHNsX21ldGhvZHMgPSBbXG4gIFwiZGVmaW5lXCIsXG4gIFwiZXh0ZW5kXCIsXG4gIFwiYXR0cmlidXRlc1wiLFxuICBcImF0dHJpYnV0ZVwiLFxuICBcInNlY3Rpb25cIixcbiAgXCJhY3Rpb25cIixcbiAgXCJkZXNjcmlwdGlvblwiLFxuICBcImFjdGlvbnNcIixcbiAgXCJjbG9zZVwiLFxuICBcImhhc01hbnlcIixcbiAgXCJiZWxvbmdzVG9cIixcbiAgXCJleHRyYWN0XCJcbl1cblxuXG5jbGFzcyBBdHRyaWJ1dGVDb25maWcge1xuICBjb25zdHJ1Y3Rvcihjb25maWcpe1xuICAgIGZvcih2YXIga2V5IGluIGNvbmZpZyl7XG4gICAgICB0aGlzW2tleV0gPSBjb25maWdba2V5XVxuICAgIH1cbiAgfVxuXG4gIGV4dHJhY3Qoc2VsZWN0b3Ipe1xuICAgIHRoaXMuZXh0cmFjdGlvbiA9IHRoaXMuZXh0cmFjdGlvbiB8fCB7fVxuICAgIHRoaXMuZXh0cmFjdGlvbi5zZWxlY3RvciA9IHNlbGVjdG9yXG4gICAgcmV0dXJuIHRoaXNcbiAgfVxufVxuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBNb2RlbERlZmluaXRpb24ge1xuICBzdGF0aWMgZmluZERlZmluaXRpb25GaWxlc0luUGF0aChwYXRobmFtZSl7XG4gICAgbGV0IG1vZGVsc19wYXRoID0gcGF0aC5yZXNvbHZlKHBhdGhuYW1lKVxuICAgIHJldHVybiBnbG9iLnN5bmMocGF0aC5qb2luKG1vZGVsc19wYXRoLCcqKi8qLmpzJykpXG4gIH1cblxuICBzdGF0aWMgbG9hZERlZmluaXRpb25zRnJvbVBhdGgocGF0aG5hbWUpe1xuICAgIGxldCBmaWxlcyA9IE1vZGVsRGVmaW5pdGlvbi5maW5kRGVmaW5pdGlvbkZpbGVzSW5QYXRoKHBhdGhuYW1lKVxuICAgIGZpbGVzLmZvckVhY2goZmlsZSA9PiBNb2RlbERlZmluaXRpb24ubG9hZChmaWxlKSlcbiAgfVxuXG4gIHN0YXRpYyBzZXR1cERTTCAoKSB7XG4gICAgZHNsX21ldGhvZHMuZm9yRWFjaChtZXRob2QgPT4gZ2xvYmFsW21ldGhvZF0gPSBkc2xbbWV0aG9kXSlcbiAgfVxuXG4gIHN0YXRpYyBjbGVhbnVwRFNMICgpIHtcbiAgICBkc2xfbWV0aG9kcy5mb3JFYWNoKG1ldGhvZCA9PiBkZWxldGUoZ2xvYmFsW21ldGhvZF0pKVxuICB9XG4gIFxuICBzdGF0aWMgZmluYWxpemUoKXtcbiAgICBNb2RlbERlZmluaXRpb24uZ2V0QWxsKCkuZm9yRWFjaChkZWZpbml0aW9uID0+IGRlZmluaXRpb24uZmluYWxpemVSZWxhdGlvbnNoaXBzKCkpXG4gIH1cblxuICBzdGF0aWMgbG9hZCAocGF0aCkge1xuICAgIGxldCBjb250ZW50ID0gcmVhZFBhdGgocGF0aClcblxuICAgIE1vZGVsRGVmaW5pdGlvbi5zZXR1cERTTCgpXG5cbiAgICBsZXQgbG9hZGVkID0gcmVxdWlyZShwYXRoKVxuXG4gICAgTW9kZWxEZWZpbml0aW9uLmNsZWFudXBEU0woKVxuXG4gICAgcmV0dXJuIGxvYWRlZFxuICB9XG5cbiAgc3RhdGljIGxhc3QgKCkge1xuICAgIGxldCBhbGwgPSB0aGlzLmdldEFsbCgpXG4gICAgcmV0dXJuIGFsbFthbGwubGVuZ3RoIC0gMV1cbiAgfVxuXG4gIHN0YXRpYyBnZXRBbGwgKCkge1xuICAgIHJldHVybiBfKGRlZmluaXRpb25zKS52YWx1ZXMoKVxuICB9XG5cbiAgc3RhdGljIGdldE1vZGVsU2NoZW1hICgpIHtcbiAgICByZXR1cm4gZGVmaW5pdGlvbnNcbiAgfVxuXG4gIHN0YXRpYyBsb29rdXAgKGFsaWFzT3JOYW1lLCBzaW5ndWxhciA9IHRydWUpIHtcbiAgICBpZihkZWZpbml0aW9uc1thbGlhc09yTmFtZV0pe1xuICAgICAgcmV0dXJuIGRlZmluaXRpb25zW2FsaWFzT3JOYW1lXVxuICAgIH1cbiAgICBcbiAgICBsZXQgbmFtZSA9IHR5cGVfYWxpYXNlc1thbGlhc09yTmFtZV1cbiAgICBcbiAgICBpZihuYW1lICYmIGRlZmluaXRpb25zW25hbWVdKXtcbiAgICAgIHJldHVybiBkZWZpbml0aW9uc1tuYW1lXVxuICAgIH1cblxuICAgIGlmKHNpbmd1bGFyID09IHRydWUpe1xuICAgICAgcmV0dXJuIE1vZGVsRGVmaW5pdGlvbi5sb29rdXAoaW5mbGVjdGlvbnMuc2luZ3VsYXJpemUoYWxpYXNPck5hbWUpLCBmYWxzZSlcbiAgICB9XG4gIH1cbiAgXG4gIHN0YXRpYyBnZXRUeXBlQWxpYXNlcygpe1xuICAgIHJldHVybiBPYmplY3Qua2V5cyh0eXBlX2FsaWFzZXMpXG4gIH1cblxuICBjb25zdHJ1Y3RvciAobmFtZSA9IFwiRG9jdW1lbnRcIikge1xuICAgIHRoaXMubmFtZSA9IGluZmxlY3Rpb25zLmNhbWVsaXplKG5hbWUpXG4gICAgdGhpcy50eXBlX2FsaWFzID0gaW5mbGVjdGlvbnMudW5kZXJzY29yZShuYW1lLnRvTG93ZXJDYXNlKCkpXG4gICAgdGhpcy5ncm91cE5hbWUgPSBpbmZsZWN0aW9ucy5wbHVyYWxpemUobmFtZS50b0xvd2VyQ2FzZSgpKVxuXG4gICAgdGhpcy5hdHRyaWJ1dGVzID0ge31cbiAgICB0aGlzLnNlY3Rpb25zID0ge31cbiAgICB0aGlzLmFjdGlvbnMgPSB7fVxuICAgIHRoaXMucmVsYXRpb25zaGlwcyA9IHt9XG4gICAgdGhpcy5leHRyYWN0aW9uUnVsZXMgPSBbXVxuICAgIHRoaXMuZGVzY3JpcHRpb24gPSBcIlwiXG5cbiAgICAvL3N0b3JlIGEgcmVmZXJlbmNlIGluIHRoZSBidWNrZXRcbiAgICBkZWZpbml0aW9uc1t0aGlzLm5hbWVdID0gdGhpc1xuICAgIHR5cGVfYWxpYXNlc1t0aGlzLnR5cGVfYWxpYXNdID0gdGhpcy5uYW1lXG4gIH1cblxuICBhZGRFeHRyYWN0aW9uUnVsZShvcHRpb25zPXt9KXtcbiAgICBsZXQgcnVsZSA9IG5ldyBFeHRyYWN0aW9uUnVsZShvcHRpb25zKVxuICAgIHRoaXMuZXh0cmFjdGlvblJ1bGVzLnB1c2gocnVsZSlcbiAgICByZXR1cm4gdGhpc1xuICB9XG4gIFxuICBmaW5hbGl6ZVJlbGF0aW9uc2hpcHMoKXtcbiAgICBfKHRoaXMucmVsYXRpb25zaGlwcykudmFsdWVzKCkuZm9yRWFjaChyZWxhdGlvbnNoaXAgPT4ge1xuICAgICAgcmVsYXRpb25zaGlwLm1vZGVsRGVmaW5pdGlvbiA9IGZ1bmN0aW9uKCl7XG4gICAgICAgIHJldHVybiBNb2RlbERlZmluaXRpb24ubG9va3VwKHJlbGF0aW9uc2hpcC5yZWxhdGlvbnNoaXApXG4gICAgICB9XG4gICAgfSlcbiAgfVxuXG4gIGFjdGlvbk5hbWVzKCl7XG4gICAgcmV0dXJuIE9iamVjdC5rZXlzKHRoaXMuYWN0aW9ucylcbiAgfVxuXG4gIGdldEFsbE1vZGVsSW5zdGFuY2VzKCl7XG4gICAgbGV0IHJlc3VsdHMgPSBbXVxuICAgIGxldCBncm91cE5hbWUgPSB0aGlzLmdyb3VwTmFtZVxuXG4gICAgcmV0dXJuIF8uZmxhdHRlbihicmllZi5pbnN0YW5jZXMoKS5tYXAoYnJpZWZjYXNlID0+IHtcbiAgICAgIHJlc3VsdHMucHVzaChicmllZmNhc2UuZmlsdGVyQWxsKG1vZGVsID0+IG1vZGVsLmdyb3VwTmFtZSA9PSBncm91cE5hbWUpKVxuICAgIH0pKVxuICB9XG5cbiAgdG9Db2xsZWN0aW9uUHJvdG90eXBlKCkge1xuICAgIGxldCBjb2xsZWN0aW9uID0gZnVuY3Rpb24oKXsgfVxuICAgIGxldCBkZWZpbml0aW9uID0gdGhpc1xuICAgIGxldCBhdHRyaWJ1dGVOYW1lcyA9IE9iamVjdC5rZXlzKHRoaXMuYXR0cmlidXRlcylcblxuICAgIGNvbGxlY3Rpb24ucHJvdG90eXBlID0gQ29sbGVjdGlvblxuXG4gICAgXG4gICAgZm9yKHZhciBuYW1lIGluIGF0dHJpYnV0ZU5hbWVzKXtcbiAgICAgIGxldCBmaW5kZXJOYW1lID0gaW5mbGVjdGlvbnMuY2FtZWxpemUoJ2ZpbmRfYnlfJyArIG5hbWUsIGZhbHNlKVxuICAgICAgY29sbGVjdGlvbltmaW5kZXJOYW1lXSA9IGZ1bmN0aW9uKG5lZWRsZSl7XG4gICAgICAgIHRoaXMubW9kZWxzLmZpbmQobW9kZWwgPT4gbW9kZWxbbmFtZV0gPT0gbmVlZGxlKVxuICAgICAgfVxuICAgIH1cblxuICAgIHJldHVybiBjb2xsZWN0aW9uXG4gIH1cblxuICB0b1Byb3RvdHlwZSAoKSB7XG4gICAgbGV0IG9iaiA9IGZ1bmN0aW9uKCl7IH1cbiAgICBsZXQgZGVmaW5pdGlvbiA9IHRoaXNcbiAgICBsZXQgYXR0cmlidXRlTmFtZXMgPSBPYmplY3Qua2V5cyh0aGlzLmF0dHJpYnV0ZXMpXG5cbiAgICBvYmoucHJvdG90eXBlID0gTW9kZWxcbiAgICBcbiAgICBvYmouZ2V0TW9kZWxEZWZpbml0aW9uID0gZnVuY3Rpb24oKXtcbiAgICAgIHJldHVybiBkZWZpbml0aW9uXG4gICAgfVxuXG4gICAgZm9yKHZhciBuYW1lIGluIGF0dHJpYnV0ZU5hbWVzKXtcbiAgICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShvYmosIG5hbWUsIHtcbiAgICAgICAgZ2V0OiBmdW5jdGlvbigpe1xuICAgICAgICAgIHJldHVybiB0aGlzLmRhdGFbbmFtZV1cbiAgICAgICAgfVxuICAgICAgfSlcbiAgICB9XG5cbiAgICBmb3IodmFyIGFjdGlvbiBpbiB0aGlzLmFjdGlvbnMpe1xuICAgICAgb2JqW2FjdGlvbl0gPSBmdW5jdGlvbigpe1xuICAgICAgICBhY3Rpb25zW2FjdGlvbl0uYXBwbHkob2JqLCBhcmd1bWVudHMpXG4gICAgICB9XG4gICAgfVxuXG4gICAgcmV0dXJuIG9ialxuICB9XG4gIFxuICAvKipcbiAgICogcmV0dXJucyB0aGUgYXR0cmlidXRlIG5hbWVzIGFzIGFuIGFycmF5XG4gICovXG4gIGF0dHJpYnV0ZU5hbWVzKCkge1xuICAgIHJldHVybiBPYmplY3QudmFsdWVzKHRoaXMuYXR0cmlidXRlcykubWFwKGF0dHIgPT4gYXR0ci5uYW1lKVxuICB9XG4gIFxuICAvKipcbiAgICogcmV0dXJucyB0aGUgYXR0cmlidXRlcyB3aGljaCBhcmUgY29uZmlndXJlZCBmb3IgZXh0cmFjdGlvblxuICAqL1xuICBleHRyYWN0aW9ucygpIHtcbiAgICByZXR1cm4gT2JqZWN0LnZhbHVlcyh0aGlzLmF0dHJpYnV0ZXMpLmZpbHRlcihhdHRyID0+IGF0dHIuZXh0cmFjdGlvbilcbiAgfVxuXG4gIC8qKiBcbiAgICogZGVmaW5lcyBhdHRyaWJ1dGVzIGZvciB0aGUgbW9kZWwncyBtZXRhZGF0YVxuICAqL1xuICBkZWZpbmVBdHRyaWJ1dGVzIChsaXN0ID0gW10pIHtcbiAgICBsaXN0LmZvckVhY2goYXR0ciA9PiB7XG4gICAgICBpZih0eXBlb2YoYXR0cikgPT09IFwic3RyaW5nXCIpXG4gICAgICAgIGF0dHIgPSB7bmFtZTogYXR0cn1cbiAgICAgIFxuICAgICAgdGhpcy5hdHRyaWJ1dGVzW2F0dHIubmFtZV0gPSBuZXcgQXR0cmlidXRlQ29uZmlnKGF0dHIpXG4gICAgfSlcblxuICAgIHJldHVybiB0aGlzXG4gIH1cbiAgXG4gIC8qKlxuICAgKiBkZWZpbmVzIGEgc2VjdGlvbiBmb3IgdGhlIG1vZGVsLiBhIHNlY3Rpb24gd2lsbCBiZVxuICAgKiBidWlsdCBmcm9tIHRoZSB3cml0dGVuIGNvbnRlbnQgb2YgdGhlIGRvY3VtZW50LiBzZWN0aW9uc1xuICAgKiBjb25zaXN0IG9mIGhlYWRpbmdzIG5lc3RlZCB3aXRoaW4gaGVhZGluZ3MuXG4gICovXG4gIGRlZmluZVNlY3Rpb24gKHNlY3Rpb25OYW1lLCBvcHRpb25zID0ge30pIHtcbiAgICB0aGlzLnNlY3Rpb25zW3NlY3Rpb25OYW1lXSA9IG5ldyBEb2N1bWVudFNlY3Rpb24oc2VjdGlvbk5hbWUsIHRoaXMsIG9wdGlvbnMpXG4gICAgcmV0dXJuIHRoaXMuc2VjdGlvbnNbc2VjdGlvbk5hbWVdXG4gIH1cblxuICAvKipcbiAgICogZGVmaW5lcyBhbiBhY3Rpb24gZm9yIHRoaXMgbW9kZWwuIGFuIGFjdGlvbiBjYW4gYmUgZGlzcGF0Y2hlZCBmcm9tXG4gICAqIHRoZSBjb21tYW5kIGxpbmUsIGFuZCBydW4gb24gYXJiaXRyYXJ5IHBhdGhzLlxuICAqL1xuICBkZWZpbmVBY3Rpb24gKGFjdGlvbk5hbWUsIGhhbmRsZXIpIHtcbiAgICB0aGlzLmFjdGlvbnNbYWN0aW9uTmFtZV0gPSBoYW5kbGVyXG4gICAgcmV0dXJuIHRoaXNcbiAgfVxufVxuXG5mdW5jdGlvbiByZWFkUGF0aChwYXRoKSB7XG4gIHJldHVybiBmcy5yZWFkRmlsZVN5bmMocGF0aCkudG9TdHJpbmcoKVxufVxuIl19