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

      ModelDefinition.last().sourcePath = path;

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

      obj.sourcePath = definition.sourcePath;

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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3NyYy9tb2RlbF9kZWZpbml0aW9uLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7OztpQkFBb0IsR0FBRzs7OztvQkFDTixNQUFNOzs7O3VCQUNOLFVBQVU7Ozs7a0JBQ1osSUFBSTs7OzswQkFDTCxZQUFZOzs7O3FCQUNSLFNBQVM7Ozs7Z0NBQ0Msb0JBQW9COzs7O3FCQUM5QixTQUFTOzs7OzBCQUNKLGNBQWM7Ozs7OEJBQ2hCLGtCQUFrQjs7OzsyQkFDVixlQUFlOztBQUU1QyxJQUFNLFdBQVcsR0FBRyxxQkFBUyxDQUFBOztBQUU3QixJQUFNLFdBQVcsR0FBRyw0QkFBUyxNQUFNLENBQUE7QUFDbkMsSUFBTSxZQUFZLEdBQUcsNEJBQVMsT0FBTyxDQUFBOztBQUVyQyxJQUFNLEdBQUcsR0FBRztBQUNWLE9BQUssRUFBRSxpQkFBVTtBQUNmLFFBQUksT0FBTyxHQUFHLGVBQWUsQ0FBQyxJQUFJLEVBQUUsQ0FBQTtBQUNwQyxXQUFPLE9BQU8sQ0FBQyxXQUFXLEVBQUUsQ0FBQTtHQUM3Qjs7QUFFRCxRQUFNLEVBQUUsZ0JBQVUsU0FBUyxFQUFpQjtRQUFmLE9BQU8seURBQUcsRUFBRTs7QUFDdkMsUUFBSSxPQUFPLEdBQUcsV0FBVyxDQUFDLFNBQVMsQ0FBQyxDQUFBO0FBQ3BDLGVBQVcsQ0FBQyxTQUFTLENBQUMsR0FBRyxPQUFPLElBQUksSUFBSSxlQUFlLENBQUMsU0FBUyxFQUFFLE9BQU8sQ0FBQyxDQUFBOztBQUUzRSxXQUFPLE9BQU8sQ0FBQTtHQUNmOztBQUVELFFBQU0sRUFBRSxnQkFBVSxTQUFTLEVBQWdCO1FBQWQsT0FBTyx5REFBRyxFQUFFOztBQUN2QyxRQUFJLE9BQU8sR0FBRyxXQUFXLENBQUMsU0FBUyxDQUFDLENBQUE7QUFDcEMsV0FBTyxPQUFPLENBQUE7R0FDZjs7QUFFRCxZQUFVLEVBQUUsc0JBQW1CO0FBQzdCLFFBQUksT0FBTyxHQUFHLGVBQWUsQ0FBQyxJQUFJLEVBQUUsQ0FBQTs7c0NBRGIsSUFB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QUMsQ0FBQyxRQUFRLEVBQUUsQ0FBQTtDQUN4QyIsImZpbGUiOiJtb2RlbF9kZWZpbml0aW9uLmpzIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IGluZmxlY3QgZnJvbSAnaSdcbmltcG9ydCBwYXRoIGZyb20gJ3BhdGgnXG5pbXBvcnQgZ2xvYiBmcm9tICdnbG9iLWFsbCdcbmltcG9ydCBmcyBmcm9tICdmcydcbmltcG9ydCBfIGZyb20gJ3VuZGVyc2NvcmUnXG5pbXBvcnQgYnJpZWYgZnJvbSAnLi9pbmRleCdcbmltcG9ydCBEb2N1bWVudFNlY3Rpb24gZnJvbSAnLi9kb2N1bWVudF9zZWN0aW9uJ1xuaW1wb3J0IE1vZGVsIGZyb20gJy4vbW9kZWwnXG5pbXBvcnQgQ29sbGVjdGlvbiBmcm9tICcuL2NvbGxlY3Rpb24nXG5pbXBvcnQgcmVnaXN0cnkgZnJvbSAnLi9tb2RlbF9yZWdpc3RyeSdcbmltcG9ydCB7RXh0cmFjdGlvblJ1bGV9IGZyb20gJy4vZXh0cmFjdGlvbnMnXG5cbmNvbnN0IGluZmxlY3Rpb25zID0gaW5mbGVjdCgpXG5cbmNvbnN0IGRlZmluaXRpb25zID0gcmVnaXN0cnkubW9kZWxzIFxuY29uc3QgdHlwZV9hbGlhc2VzID0gcmVnaXN0cnkuYWxpYXNlcyBcblxuY29uc3QgZHNsID0ge1xuICBjbG9zZTogZnVuY3Rpb24oKXtcbiAgICBsZXQgY3VycmVudCA9IE1vZGVsRGVmaW5pdGlvbi5sYXN0KClcbiAgICByZXR1cm4gY3VycmVudC50b1Byb3RvdHlwZSgpXG4gIH0sXG4gIFxuICBkZWZpbmU6IGZ1bmN0aW9uKCBtb2RlbE5hbWUsIG9wdGlvbnMgPSB7fSApIHtcbiAgICBsZXQgY3VycmVudCA9IGRlZmluaXRpb25zW21vZGVsTmFtZV1cbiAgICBkZWZpbml0aW9uc1ttb2RlbE5hbWVdID0gY3VycmVudCB8fCBuZXcgTW9kZWxEZWZpbml0aW9uKG1vZGVsTmFtZSwgb3B0aW9ucylcblxuICAgIHJldHVybiBjdXJyZW50XG4gIH0sXG5cbiAgZXh0ZW5kOiBmdW5jdGlvbiggbW9kZWxOYW1lLCBvcHRpb25zID0ge30pIHtcbiAgICBsZXQgY3VycmVudCA9IGRlZmluaXRpb25zW21vZGVsTmFtZV1cbiAgICByZXR1cm4gY3VycmVudFxuICB9LFxuXG4gIGF0dHJpYnV0ZXM6IGZ1bmN0aW9uICguLi5saXN0KSB7XG4gICAgbGV0IGN1cnJlbnQgPSBNb2RlbERlZmluaXRpb24ubGFzdCgpXG4gICAgcmV0dXJuIGN1cnJlbnQuZGVmaW5lQXR0cmlidXRlcyhsaXN0KVxuICB9LFxuXG4gIGF0dHJpYnV0ZTogZnVuY3Rpb24obmFtZSl7XG4gICAgbGV0IGN1cnJlbnQgPSBNb2RlbERlZmluaXRpb24ubGFzdCgpXG4gICAgcmV0dXJuIGN1cnJlbnQuYXR0cmlidXRlc1tuYW1lXVxuICB9LFxuICBcbiAgaGFzTWFueTogZnVuY3Rpb24ocmVsYXRpb25zaGlwLCBvcHRpb25zPXt9KXtcbiAgICBsZXQgY3VycmVudCA9IE1vZGVsRGVmaW5pdGlvbi5sYXN0KClcbiAgICBsZXQgY29uZmlnID0gY3VycmVudC5yZWxhdGlvbnNoaXBzW3JlbGF0aW9uc2hpcF0gPSBvcHRpb25zXG5cbiAgICBjb25maWcuaGFzTWFueSA9IHRydWVcbiAgICBjb25maWcuYmVsb25nc1RvID0gZmFsc2VcbiAgICBjb25maWcudHlwZSA9IFwiaGFzTWFueVwiXG4gICAgY29uZmlnLnJlbGF0aW9uc2hpcCA9IHJlbGF0aW9uc2hpcFxuICAgIGNvbmZpZy5mb3JlaWduS2V5ID0gY3VycmVudC50eXBlX2FsaWFzXG4gIH0sXG4gIFxuICBiZWxvbmdzVG86IGZ1bmN0aW9uKHJlbGF0aW9uc2hpcCwgb3B0aW9ucz17fSl7XG4gICAgbGV0IGN1cnJlbnQgPSBNb2RlbERlZmluaXRpb24ubGFzdCgpXG4gICAgbGV0IGNvbmZpZyA9IGN1cnJlbnQucmVsYXRpb25zaGlwc1tyZWxhdGlvbnNoaXBdID0gb3B0aW9uc1xuXG4gICAgY29uZmlnLmhhc01hbnkgPSBmYWxzZVxuICAgIGNvbmZpZy5iZWxvbmdzVG8gPSB0cnVlXG4gICAgY29uZmlnLnR5cGUgPSBcImJlbG9uZ3NUb1wiXG4gICAgY29uZmlnLm1vZGVsRGVmaW5pdGlvbiA9IE1vZGVsRGVmaW5pdGlvbi5sb29rdXAocmVsYXRpb25zaGlwKVxuICAgIGNvbmZpZy5yZWxhdGlvbnNoaXAgPSByZWxhdGlvbnNoaXBcbiAgICBjb25maWcuZm9yZWlnbktleSA9IGNvbmZpZy5mb3JlaWduS2V5IHx8IHJlbGF0aW9uc2hpcFxuICB9LFxuXG4gIHNlY3Rpb246IGZ1bmN0aW9uIChuYW1lLCBvcHRpb25zID0ge30pIHtcbiAgICBsZXQgY3VycmVudCA9IE1vZGVsRGVmaW5pdGlvbi5sYXN0KClcbiAgICByZXR1cm4gY3VycmVudC5kZWZpbmVTZWN0aW9uKG5hbWUsIG9wdGlvbnMpXG4gIH0sXG4gIFxuICBkZXNjcmlwdGlvbjogZnVuY3Rpb24oZGVzY3JpcHRpb24pe1xuICAgIGxldCBjdXJyZW50ID0gTW9kZWxEZWZpbml0aW9uLmxhc3QoKVxuICAgIGN1cnJlbnQuZGVzY3JpcHRpb24gPSBkZXNjcmlwdGlvblxuICAgIHJldHVybiBjdXJyZW50XG4gIH0sXG5cblxuICBhY3Rpb246IGZ1bmN0aW9uIChuYW1lLCBoYW5kbGVyKSB7XG4gICAgbGV0IGN1cnJlbnQgPSBNb2RlbERlZmluaXRpb24ubGFzdCgpXG4gICAgcmV0dXJuIGN1cnJlbnQuZGVmaW5lQWN0aW9uKG5hbWUsIGhhbmRsZXIpXG4gIH0sXG4gIFxuICBleHRyYWN0OiBmdW5jdGlvbihzZWxlY3Rvciwgb3B0aW9ucz17fSl7XG4gICAgbGV0IGN1cnJlbnQgPSBNb2RlbERlZmluaXRpb24ubGFzdCgpXG4gICAgcmV0dXJuIGN1cnJlbnQuYWRkRXh0cmFjdGlvblJ1bGUoc2VsZWN0b3IsIG9wdGlvbnM9e30pIFxuICB9XG59XG5cbmNvbnN0IGRzbF9tZXRob2RzID0gW1xuICBcImRlZmluZVwiLFxuICBcImV4dGVuZFwiLFxuICBcImF0dHJpYnV0ZXNcIixcbiAgXCJhdHRyaWJ1dGVcIixcbiAgXCJzZWN0aW9uXCIsXG4gIFwiYWN0aW9uXCIsXG4gIFwiZGVzY3JpcHRpb25cIixcbiAgXCJhY3Rpb25zXCIsXG4gIFwiY2xvc2VcIixcbiAgXCJoYXNNYW55XCIsXG4gIFwiYmVsb25nc1RvXCIsXG4gIFwiZXh0cmFjdFwiXG5dXG5cblxuY2xhc3MgQXR0cmlidXRlQ29uZmlnIHtcbiAgY29uc3RydWN0b3IoY29uZmlnKXtcbiAgICBmb3IodmFyIGtleSBpbiBjb25maWcpe1xuICAgICAgdGhpc1trZXldID0gY29uZmlnW2tleV1cbiAgICB9XG4gIH1cblxuICBleHRyYWN0KHNlbGVjdG9yKXtcbiAgICB0aGlzLmV4dHJhY3Rpb24gPSB0aGlzLmV4dHJhY3Rpb24gfHwge31cbiAgICB0aGlzLmV4dHJhY3Rpb24uc2VsZWN0b3IgPSBzZWxlY3RvclxuICAgIHJldHVybiB0aGlzXG4gIH1cbn1cblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgTW9kZWxEZWZpbml0aW9uIHtcbiAgc3RhdGljIGZpbmREZWZpbml0aW9uRmlsZXNJblBhdGgocGF0aG5hbWUpe1xuICAgIGxldCBtb2RlbHNfcGF0aCA9IHBhdGgucmVzb2x2ZShwYXRobmFtZSlcbiAgICByZXR1cm4gZ2xvYi5zeW5jKHBhdGguam9pbihtb2RlbHNfcGF0aCwnKiovKi5qcycpKVxuICB9XG5cbiAgc3RhdGljIGxvYWREZWZpbml0aW9uc0Zyb21QYXRoKHBhdGhuYW1lKXtcbiAgICBsZXQgZmlsZXMgPSBNb2RlbERlZmluaXRpb24uZmluZERlZmluaXRpb25GaWxlc0luUGF0aChwYXRobmFtZSlcbiAgICBmaWxlcy5mb3JFYWNoKGZpbGUgPT4gTW9kZWxEZWZpbml0aW9uLmxvYWQoZmlsZSkpXG4gIH1cblxuICBzdGF0aWMgc2V0dXBEU0wgKCkge1xuICAgIGRzbF9tZXRob2RzLmZvckVhY2gobWV0aG9kID0+IGdsb2JhbFttZXRob2RdID0gZHNsW21ldGhvZF0pXG4gIH1cblxuICBzdGF0aWMgY2xlYW51cERTTCAoKSB7XG4gICAgZHNsX21ldGhvZHMuZm9yRWFjaChtZXRob2QgPT4gZGVsZXRlKGdsb2JhbFttZXRob2RdKSlcbiAgfVxuICBcbiAgc3RhdGljIGZpbmFsaXplKCl7XG4gICAgTW9kZWxEZWZpbml0aW9uLmdldEFsbCgpLmZvckVhY2goZGVmaW5pdGlvbiA9PiBkZWZpbml0aW9uLmZpbmFsaXplUmVsYXRpb25zaGlwcygpKVxuICB9XG5cbiAgc3RhdGljIGxvYWQgKHBhdGgpIHtcbiAgICBsZXQgY29udGVudCA9IHJlYWRQYXRoKHBhdGgpXG5cbiAgICBNb2RlbERlZmluaXRpb24uc2V0dXBEU0woKVxuXG4gICAgbGV0IGxvYWRlZCA9IHJlcXVpcmUocGF0aClcblxuICAgIE1vZGVsRGVmaW5pdGlvbi5jbGVhbnVwRFNMKClcbiAgICBcbiAgICBNb2RlbERlZmluaXRpb24ubGFzdCgpLnNvdXJjZVBhdGggPSBwYXRoXG4gICAgXG4gICAgcmV0dXJuIGxvYWRlZFxuICB9XG5cbiAgc3RhdGljIGxhc3QgKCkge1xuICAgIGxldCBhbGwgPSB0aGlzLmdldEFsbCgpXG4gICAgcmV0dXJuIGFsbFthbGwubGVuZ3RoIC0gMV1cbiAgfVxuXG4gIHN0YXRpYyBnZXRBbGwgKCkge1xuICAgIHJldHVybiBfKGRlZmluaXRpb25zKS52YWx1ZXMoKVxuICB9XG5cbiAgc3RhdGljIGdldE1vZGVsU2NoZW1hICgpIHtcbiAgICByZXR1cm4gZGVmaW5pdGlvbnNcbiAgfVxuXG4gIHN0YXRpYyBsb29rdXAgKGFsaWFzT3JOYW1lLCBzaW5ndWxhciA9IHRydWUpIHtcbiAgICBpZihkZWZpbml0aW9uc1thbGlhc09yTmFtZV0pe1xuICAgICAgcmV0dXJuIGRlZmluaXRpb25zW2FsaWFzT3JOYW1lXVxuICAgIH1cbiAgICBcbiAgICBsZXQgbmFtZSA9IHR5cGVfYWxpYXNlc1thbGlhc09yTmFtZV1cbiAgICBcbiAgICBpZihuYW1lICYmIGRlZmluaXRpb25zW25hbWVdKXtcbiAgICAgIHJldHVybiBkZWZpbml0aW9uc1tuYW1lXVxuICAgIH1cblxuICAgIGlmKHNpbmd1bGFyID09IHRydWUpe1xuICAgICAgcmV0dXJuIE1vZGVsRGVmaW5pdGlvbi5sb29rdXAoaW5mbGVjdGlvbnMuc2luZ3VsYXJpemUoYWxpYXNPck5hbWUpLCBmYWxzZSlcbiAgICB9XG4gIH1cbiAgXG4gIHN0YXRpYyBnZXRUeXBlQWxpYXNlcygpe1xuICAgIHJldHVybiBPYmplY3Qua2V5cyh0eXBlX2FsaWFzZXMpXG4gIH1cblxuICBjb25zdHJ1Y3RvciAobmFtZSA9IFwiRG9jdW1lbnRcIikge1xuICAgIHRoaXMubmFtZSA9IGluZmxlY3Rpb25zLmNhbWVsaXplKG5hbWUpXG4gICAgdGhpcy50eXBlX2FsaWFzID0gaW5mbGVjdGlvbnMudW5kZXJzY29yZShuYW1lLnRvTG93ZXJDYXNlKCkpXG4gICAgdGhpcy5ncm91cE5hbWUgPSBpbmZsZWN0aW9ucy5wbHVyYWxpemUobmFtZS50b0xvd2VyQ2FzZSgpKVxuXG4gICAgdGhpcy5hdHRyaWJ1dGVzID0ge31cbiAgICB0aGlzLnNlY3Rpb25zID0ge31cbiAgICB0aGlzLmFjdGlvbnMgPSB7fVxuICAgIHRoaXMucmVsYXRpb25zaGlwcyA9IHt9XG4gICAgdGhpcy5leHRyYWN0aW9uUnVsZXMgPSBbXVxuICAgIHRoaXMuZGVzY3JpcHRpb24gPSBcIlwiXG5cbiAgICAvL3N0b3JlIGEgcmVmZXJlbmNlIGluIHRoZSBidWNrZXRcbiAgICBkZWZpbml0aW9uc1t0aGlzLm5hbWVdID0gdGhpc1xuICAgIHR5cGVfYWxpYXNlc1t0aGlzLnR5cGVfYWxpYXNdID0gdGhpcy5uYW1lXG4gIH1cblxuICBhZGRFeHRyYWN0aW9uUnVsZShvcHRpb25zPXt9KXtcbiAgICBsZXQgcnVsZSA9IG5ldyBFeHRyYWN0aW9uUnVsZShvcHRpb25zKVxuICAgIHRoaXMuZXh0cmFjdGlvblJ1bGVzLnB1c2gocnVsZSlcbiAgICByZXR1cm4gdGhpc1xuICB9XG4gIFxuICBmaW5hbGl6ZVJlbGF0aW9uc2hpcHMoKXtcbiAgICBfKHRoaXMucmVsYXRpb25zaGlwcykudmFsdWVzKCkuZm9yRWFjaChyZWxhdGlvbnNoaXAgPT4ge1xuICAgICAgcmVsYXRpb25zaGlwLm1vZGVsRGVmaW5pdGlvbiA9IGZ1bmN0aW9uKCl7XG4gICAgICAgIHJldHVybiBNb2RlbERlZmluaXRpb24ubG9va3VwKHJlbGF0aW9uc2hpcC5yZWxhdGlvbnNoaXApXG4gICAgICB9XG4gICAgfSlcbiAgfVxuXG4gIGFjdGlvbk5hbWVzKCl7XG4gICAgcmV0dXJuIE9iamVjdC5rZXlzKHRoaXMuYWN0aW9ucylcbiAgfVxuXG4gIGdldEFsbE1vZGVsSW5zdGFuY2VzKCl7XG4gICAgbGV0IHJlc3VsdHMgPSBbXVxuICAgIGxldCBncm91cE5hbWUgPSB0aGlzLmdyb3VwTmFtZVxuXG4gICAgcmV0dXJuIF8uZmxhdHRlbihicmllZi5pbnN0YW5jZXMoKS5tYXAoYnJpZWZjYXNlID0+IHtcbiAgICAgIHJlc3VsdHMucHVzaChicmllZmNhc2UuZmlsdGVyQWxsKG1vZGVsID0+IG1vZGVsLmdyb3VwTmFtZSA9PSBncm91cE5hbWUpKVxuICAgIH0pKVxuICB9XG5cbiAgdG9Db2xsZWN0aW9uUHJvdG90eXBlKCkge1xuICAgIGxldCBjb2xsZWN0aW9uID0gZnVuY3Rpb24oKXsgfVxuICAgIGxldCBkZWZpbml0aW9uID0gdGhpc1xuICAgIGxldCBhdHRyaWJ1dGVOYW1lcyA9IE9iamVjdC5rZXlzKHRoaXMuYXR0cmlidXRlcylcblxuICAgIGNvbGxlY3Rpb24ucHJvdG90eXBlID0gQ29sbGVjdGlvblxuXG4gICAgXG4gICAgZm9yKHZhciBuYW1lIGluIGF0dHJpYnV0ZU5hbWVzKXtcbiAgICAgIGxldCBmaW5kZXJOYW1lID0gaW5mbGVjdGlvbnMuY2FtZWxpemUoJ2ZpbmRfYnlfJyArIG5hbWUsIGZhbHNlKVxuICAgICAgY29sbGVjdGlvbltmaW5kZXJOYW1lXSA9IGZ1bmN0aW9uKG5lZWRsZSl7XG4gICAgICAgIHRoaXMubW9kZWxzLmZpbmQobW9kZWwgPT4gbW9kZWxbbmFtZV0gPT0gbmVlZGxlKVxuICAgICAgfVxuICAgIH1cblxuICAgIHJldHVybiBjb2xsZWN0aW9uXG4gIH1cblxuICB0b1Byb3RvdHlwZSAoKSB7XG4gICAgbGV0IG9iaiA9IGZ1bmN0aW9uKCl7IH1cbiAgICBsZXQgZGVmaW5pdGlvbiA9IHRoaXNcbiAgICBsZXQgYXR0cmlidXRlTmFtZXMgPSBPYmplY3Qua2V5cyh0aGlzLmF0dHJpYnV0ZXMpXG5cbiAgICBvYmoucHJvdG90eXBlID0gTW9kZWxcbiAgICBcbiAgICBvYmouc291cmNlUGF0aCA9IGRlZmluaXRpb24uc291cmNlUGF0aFxuXG4gICAgb2JqLmdldE1vZGVsRGVmaW5pdGlvbiA9IGZ1bmN0aW9uKCl7XG4gICAgICByZXR1cm4gZGVmaW5pdGlvblxuICAgIH1cblxuICAgIGZvcih2YXIgbmFtZSBpbiBhdHRyaWJ1dGVOYW1lcyl7XG4gICAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkob2JqLCBuYW1lLCB7XG4gICAgICAgIGdldDogZnVuY3Rpb24oKXtcbiAgICAgICAgICByZXR1cm4gdGhpcy5kYXRhW25hbWVdXG4gICAgICAgIH1cbiAgICAgIH0pXG4gICAgfVxuXG4gICAgZm9yKHZhciBhY3Rpb24gaW4gdGhpcy5hY3Rpb25zKXtcbiAgICAgIG9ialthY3Rpb25dID0gZnVuY3Rpb24oKXtcbiAgICAgICAgYWN0aW9uc1thY3Rpb25dLmFwcGx5KG9iaiwgYXJndW1lbnRzKVxuICAgICAgfVxuICAgIH1cblxuICAgIHJldHVybiBvYmpcbiAgfVxuICBcbiAgLyoqXG4gICAqIHJldHVybnMgdGhlIGF0dHJpYnV0ZSBuYW1lcyBhcyBhbiBhcnJheVxuICAqL1xuICBhdHRyaWJ1dGVOYW1lcygpIHtcbiAgICByZXR1cm4gT2JqZWN0LnZhbHVlcyh0aGlzLmF0dHJpYnV0ZXMpLm1hcChhdHRyID0+IGF0dHIubmFtZSlcbiAgfVxuICBcbiAgLyoqXG4gICAqIHJldHVybnMgdGhlIGF0dHJpYnV0ZXMgd2hpY2ggYXJlIGNvbmZpZ3VyZWQgZm9yIGV4dHJhY3Rpb25cbiAgKi9cbiAgZXh0cmFjdGlvbnMoKSB7XG4gICAgcmV0dXJuIE9iamVjdC52YWx1ZXModGhpcy5hdHRyaWJ1dGVzKS5maWx0ZXIoYXR0ciA9PiBhdHRyLmV4dHJhY3Rpb24pXG4gIH1cblxuICAvKiogXG4gICAqIGRlZmluZXMgYXR0cmlidXRlcyBmb3IgdGhlIG1vZGVsJ3MgbWV0YWRhdGFcbiAgKi9cbiAgZGVmaW5lQXR0cmlidXRlcyAobGlzdCA9IFtdKSB7XG4gICAgbGlzdC5mb3JFYWNoKGF0dHIgPT4ge1xuICAgICAgaWYodHlwZW9mKGF0dHIpID09PSBcInN0cmluZ1wiKVxuICAgICAgICBhdHRyID0ge25hbWU6IGF0dHJ9XG4gICAgICBcbiAgICAgIHRoaXMuYXR0cmlidXRlc1thdHRyLm5hbWVdID0gbmV3IEF0dHJpYnV0ZUNvbmZpZyhhdHRyKVxuICAgIH0pXG5cbiAgICByZXR1cm4gdGhpc1xuICB9XG4gIFxuICAvKipcbiAgICogZGVmaW5lcyBhIHNlY3Rpb24gZm9yIHRoZSBtb2RlbC4gYSBzZWN0aW9uIHdpbGwgYmVcbiAgICogYnVpbHQgZnJvbSB0aGUgd3JpdHRlbiBjb250ZW50IG9mIHRoZSBkb2N1bWVudC4gc2VjdGlvbnNcbiAgICogY29uc2lzdCBvZiBoZWFkaW5ncyBuZXN0ZWQgd2l0aGluIGhlYWRpbmdzLlxuICAqL1xuICBkZWZpbmVTZWN0aW9uIChzZWN0aW9uTmFtZSwgb3B0aW9ucyA9IHt9KSB7XG4gICAgdGhpcy5zZWN0aW9uc1tzZWN0aW9uTmFtZV0gPSBuZXcgRG9jdW1lbnRTZWN0aW9uKHNlY3Rpb25OYW1lLCB0aGlzLCBvcHRpb25zKVxuICAgIHJldHVybiB0aGlzLnNlY3Rpb25zW3NlY3Rpb25OYW1lXVxuICB9XG5cbiAgLyoqXG4gICAqIGRlZmluZXMgYW4gYWN0aW9uIGZvciB0aGlzIG1vZGVsLiBhbiBhY3Rpb24gY2FuIGJlIGRpc3BhdGNoZWQgZnJvbVxuICAgKiB0aGUgY29tbWFuZCBsaW5lLCBhbmQgcnVuIG9uIGFyYml0cmFyeSBwYXRocy5cbiAgKi9cbiAgZGVmaW5lQWN0aW9uIChhY3Rpb25OYW1lLCBoYW5kbGVyKSB7XG4gICAgdGhpcy5hY3Rpb25zW2FjdGlvbk5hbWVdID0gaGFuZGxlclxuICAgIHJldHVybiB0aGlzXG4gIH1cbn1cblxuZnVuY3Rpb24gcmVhZFBhdGgocGF0aCkge1xuICByZXR1cm4gZnMucmVhZEZpbGVTeW5jKHBhdGgpLnRvU3RyaW5nKClcbn1cbiJdfQ==