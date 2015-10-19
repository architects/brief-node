'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var _i = require('i');

var _i2 = _interopRequireDefault(_i);

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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3NyYy9tb2RlbF9kZWZpbml0aW9uLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7OztpQkFBb0IsR0FBRzs7OztrQkFDUixJQUFJOzs7OzBCQUNMLFlBQVk7Ozs7cUJBQ1IsU0FBUzs7OztnQ0FDQyxvQkFBb0I7Ozs7cUJBQzlCLFNBQVM7Ozs7MEJBQ0osY0FBYzs7Ozs4QkFDaEIsa0JBQWtCOzs7O0FBRXZDLElBQU0sV0FBVyxHQUFHLHFCQUFTLENBQUE7O0FBRTdCLElBQU0sV0FBVyxHQUFHLDRCQUFTLE1BQU0sQ0FBQTtBQUNuQyxJQUFNLFlBQVksR0FBRyw0QkFBUyxPQUFPLENBQUE7O0FBRXJDLElBQU0sR0FBRyxHQUFHO0FBQ1YsT0FBSyxFQUFFLGlCQUFVO0FBQ2YsUUFBSSxPQUFPLEdBQUcsZUFBZSxDQUFDLElBQUksRUFBRSxDQUFBO0FBQ3BDLFdBQU8sT0FBTyxDQUFDLFdBQVcsRUFBRSxDQUFBO0dBQzdCOztBQUVELFFBQU0sRUFBRSxnQkFBVSxTQUFTLEVBQWlCO1FBQWYsT0FBTyx5REFBRyxFQUFFOztBQUN2QyxRQUFJLE9BQU8sR0FBRyxXQUFXLENBQUMsU0FBUyxDQUFDLENBQUE7QUFDcEMsZUFBVyxDQUFDLFNBQVMsQ0FBQyxHQUFHLE9BQU8sSUFBSSxJQUFJLGVBQWUsQ0FBQyxTQUFTLEVBQUUsT0FBTyxDQUFDLENBQUE7O0FBRTNFLFdBQU8sT0FBTyxDQUFBO0dBQ2Y7O0FBRUQsWUFBVSxFQUFFLHNCQUFtQjtBQUM3QixRQUFJLE9BQU8sR0FBRyxlQUFlLENBQUMsSUFBSSxFQUFFLENBQUE7O3NDQURiLElBQUk7QUFBSixVQUFJOzs7QUFFM0IsV0FBTyxPQUFPLENBQUMsZ0JBQWdCLENBQUMsSUFBSSxDQUFDLENBQUE7R0FDdEM7O0FBRUQsV0FBUyxFQUFFLG1CQUFTLElBQUksRUFBQztBQUN2QixRQUFJLE9BQU8sR0FBRyxlQUFlLENBQUMsSUFBSSxFQUFFLENBQUE7QUFDcEMsV0FBTyxPQUFPLENBQUMs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LFVBQUksQ0FBQyxPQUFPLENBQUMsVUFBQSxJQUFJLEVBQUk7QUFDbkIsWUFBRyxPQUFPLElBQUksQUFBQyxLQUFLLFFBQVEsRUFDMUIsSUFBSSxHQUFHLEVBQUMsSUFBSSxFQUFFLElBQUksRUFBQyxDQUFBOztBQUVyQixjQUFLLFVBQVUsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLEdBQUcsSUFBSSxlQUFlLENBQUMsSUFBSSxDQUFDLENBQUE7T0FDdkQsQ0FBQyxDQUFBOztBQUVGLGFBQU8sSUFBSSxDQUFBO0tBQ1o7Ozs7Ozs7OztXQU9hLHVCQUFDLFdBQVcsRUFBZ0I7VUFBZCxPQUFPLHlEQUFHLEVBQUU7O0FBQ3RDLFVBQUksQ0FBQyxRQUFRLENBQUMsV0FBVyxDQUFDLEdBQUcsa0NBQW9CLFdBQVcsRUFBRSxJQUFJLEVBQUUsT0FBTyxDQUFDLENBQUE7QUFDNUUsYUFBTyxJQUFJLENBQUMsUUFBUSxDQUFDLFdBQVcsQ0FBQyxDQUFBO0tBQ2xDOzs7Ozs7OztXQU1ZLHNCQUFDLFVBQVUsRUFBRSxPQUFPLEVBQUU7QUFDakMsVUFBSSxDQUFDLE9BQU8sQ0FBQyxVQUFVLENBQUMsR0FBRyxPQUFPLENBQUE7QUFDbEMsYUFBTyxJQUFJLENBQUE7S0FDWjs7O1NBekxrQixlQUFlOzs7cUJBQWYsZUFBZTs7QUE0THBDLFNBQVMsUUFBUSxDQUFDLElBQUksRUFBRTtBQUN0QixTQUFPLGdCQUFHLFlBQVksQ0FBQyxJQUFJLENBQUMsQ0FBQyxRQUFRLEVBQUUsQ0FBQTtDQUN4QyIsImZpbGUiOiJtb2RlbF9kZWZpbml0aW9uLmpzIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IGluZmxlY3QgZnJvbSAnaSdcbmltcG9ydCBmcyBmcm9tICdmcydcbmltcG9ydCBfIGZyb20gJ3VuZGVyc2NvcmUnXG5pbXBvcnQgYnJpZWYgZnJvbSAnLi9pbmRleCdcbmltcG9ydCBEb2N1bWVudFNlY3Rpb24gZnJvbSAnLi9kb2N1bWVudF9zZWN0aW9uJ1xuaW1wb3J0IE1vZGVsIGZyb20gJy4vbW9kZWwnXG5pbXBvcnQgQ29sbGVjdGlvbiBmcm9tICcuL2NvbGxlY3Rpb24nXG5pbXBvcnQgcmVnaXN0cnkgZnJvbSAnLi9tb2RlbF9yZWdpc3RyeSdcblxuY29uc3QgaW5mbGVjdGlvbnMgPSBpbmZsZWN0KClcblxuY29uc3QgZGVmaW5pdGlvbnMgPSByZWdpc3RyeS5tb2RlbHMgXG5jb25zdCB0eXBlX2FsaWFzZXMgPSByZWdpc3RyeS5hbGlhc2VzIFxuXG5jb25zdCBkc2wgPSB7XG4gIGNsb3NlOiBmdW5jdGlvbigpe1xuICAgIGxldCBjdXJyZW50ID0gTW9kZWxEZWZpbml0aW9uLmxhc3QoKVxuICAgIHJldHVybiBjdXJyZW50LnRvUHJvdG90eXBlKClcbiAgfSxcblxuICBkZWZpbmU6IGZ1bmN0aW9uKCBtb2RlbE5hbWUsIG9wdGlvbnMgPSB7fSApIHtcbiAgICBsZXQgY3VycmVudCA9IGRlZmluaXRpb25zW21vZGVsTmFtZV1cbiAgICBkZWZpbml0aW9uc1ttb2RlbE5hbWVdID0gY3VycmVudCB8fCBuZXcgTW9kZWxEZWZpbml0aW9uKG1vZGVsTmFtZSwgb3B0aW9ucylcblxuICAgIHJldHVybiBjdXJyZW50XG4gIH0sXG5cbiAgYXR0cmlidXRlczogZnVuY3Rpb24gKC4uLmxpc3QpIHtcbiAgICBsZXQgY3VycmVudCA9IE1vZGVsRGVmaW5pdGlvbi5sYXN0KClcbiAgICByZXR1cm4gY3VycmVudC5kZWZpbmVBdHRyaWJ1dGVzKGxpc3QpXG4gIH0sXG5cbiAgYXR0cmlidXRlOiBmdW5jdGlvbihuYW1lKXtcbiAgICBsZXQgY3VycmVudCA9IE1vZGVsRGVmaW5pdGlvbi5sYXN0KClcbiAgICByZXR1cm4gY3VycmVudC5hdHRyaWJ1dGVzW25hbWVdXG4gIH0sXG4gIFxuICBoYXNNYW55OiBmdW5jdGlvbihyZWxhdGlvbnNoaXAsIG9wdGlvbnM9e30pe1xuICAgIGxldCBjdXJyZW50ID0gTW9kZWxEZWZpbml0aW9uLmxhc3QoKVxuICAgIGxldCBjb25maWcgPSBjdXJyZW50LnJlbGF0aW9uc2hpcHNbcmVsYXRpb25zaGlwXSA9IG9wdGlvbnNcblxuICAgIGNvbmZpZy5oYXNNYW55ID0gdHJ1ZVxuICAgIGNvbmZpZy5iZWxvbmdzVG8gPSBmYWxzZVxuICAgIGNvbmZpZy50eXBlID0gXCJoYXNNYW55XCJcbiAgICBjb25maWcucmVsYXRpb25zaGlwID0gcmVsYXRpb25zaGlwXG4gICAgY29uZmlnLmZvcmVpZ25LZXkgPSBjdXJyZW50LnR5cGVfYWxpYXNcbiAgfSxcbiAgXG4gIGJlbG9uZ3NUbzogZnVuY3Rpb24ocmVsYXRpb25zaGlwLCBvcHRpb25zPXt9KXtcbiAgICBsZXQgY3VycmVudCA9IE1vZGVsRGVmaW5pdGlvbi5sYXN0KClcbiAgICBsZXQgY29uZmlnID0gY3VycmVudC5yZWxhdGlvbnNoaXBzW3JlbGF0aW9uc2hpcF0gPSBvcHRpb25zXG5cbiAgICBjb25maWcuaGFzTWFueSA9IGZhbHNlXG4gICAgY29uZmlnLmJlbG9uZ3NUbyA9IHRydWVcbiAgICBjb25maWcudHlwZSA9IFwiYmVsb25nc1RvXCJcbiAgICBjb25maWcubW9kZWxEZWZpbml0aW9uID0gTW9kZWxEZWZpbml0aW9uLmxvb2t1cChyZWxhdGlvbnNoaXApXG4gICAgY29uZmlnLnJlbGF0aW9uc2hpcCA9IHJlbGF0aW9uc2hpcFxuICAgIGNvbmZpZy5mb3JlaWduS2V5ID0gY29uZmlnLmZvcmVpZ25LZXkgfHwgcmVsYXRpb25zaGlwXG4gIH0sXG5cbiAgc2VjdGlvbjogZnVuY3Rpb24gKG5hbWUsIG9wdGlvbnMgPSB7fSkge1xuICAgIGxldCBjdXJyZW50ID0gTW9kZWxEZWZpbml0aW9uLmxhc3QoKVxuICAgIHJldHVybiBjdXJyZW50LmRlZmluZVNlY3Rpb24obmFtZSwgb3B0aW9ucylcbiAgfSxcblxuICBhY3Rpb246IGZ1bmN0aW9uIChuYW1lLCBoYW5kbGVyKSB7XG4gICAgbGV0IGN1cnJlbnQgPSBNb2RlbERlZmluaXRpb24ubGFzdCgpXG4gICAgcmV0dXJuIGN1cnJlbnQuZGVmaW5lQWN0aW9uKG5hbWUsIGhhbmRsZXIpXG4gIH1cbn1cblxuY29uc3QgZHNsX21ldGhvZHMgPSBbXG4gIFwiZGVmaW5lXCIsXG4gIFwiYXR0cmlidXRlc1wiLFxuICBcImF0dHJpYnV0ZVwiLFxuICBcInNlY3Rpb25cIixcbiAgXCJhY3Rpb25cIixcbiAgXCJhY3Rpb25zXCIsXG4gIFwiY2xvc2VcIixcbiAgXCJoYXNNYW55XCIsXG4gIFwiYmVsb25nc1RvXCJcbl1cblxuXG5jbGFzcyBBdHRyaWJ1dGVDb25maWcge1xuICBjb25zdHJ1Y3Rvcihjb25maWcpe1xuICAgIGZvcih2YXIga2V5IGluIGNvbmZpZyl7XG4gICAgICB0aGlzW2tleV0gPSBjb25maWdba2V5XVxuICAgIH1cbiAgfVxuXG4gIGV4dHJhY3Qoc2VsZWN0b3Ipe1xuICAgIHRoaXMuZXh0cmFjdGlvbiA9IHRoaXMuZXh0cmFjdGlvbiB8fCB7fVxuICAgIHRoaXMuZXh0cmFjdGlvbi5zZWxlY3RvciA9IHNlbGVjdG9yXG4gICAgcmV0dXJuIHRoaXNcbiAgfVxufVxuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBNb2RlbERlZmluaXRpb24ge1xuICBzdGF0aWMgc2V0dXBEU0wgKCkge1xuICAgIGRzbF9tZXRob2RzLmZvckVhY2gobWV0aG9kID0+IGdsb2JhbFttZXRob2RdID0gZHNsW21ldGhvZF0pICAgIFxuICB9XG5cbiAgc3RhdGljIGNsZWFudXBEU0wgKCkge1xuICAgIGRzbF9tZXRob2RzLmZvckVhY2gobWV0aG9kID0+IGRlbGV0ZShnbG9iYWxbbWV0aG9kXSkpXG4gIH1cbiAgXG4gIHN0YXRpYyBmaW5hbGl6ZSgpe1xuICAgIE1vZGVsRGVmaW5pdGlvbi5nZXRBbGwoKS5mb3JFYWNoKGRlZmluaXRpb24gPT4gZGVmaW5pdGlvbi5maW5hbGl6ZVJlbGF0aW9uc2hpcHMoKSlcbiAgfVxuXG4gIHN0YXRpYyBsb2FkIChwYXRoKSB7XG4gICAgbGV0IGNvbnRlbnQgPSByZWFkUGF0aChwYXRoKVxuXG4gICAgTW9kZWxEZWZpbml0aW9uLnNldHVwRFNMKClcblxuICAgIGxldCBsb2FkZWQgPSByZXF1aXJlKHBhdGgpXG5cbiAgICBNb2RlbERlZmluaXRpb24uY2xlYW51cERTTCgpXG5cbiAgICByZXR1cm4gbG9hZGVkXG4gIH1cblxuICBzdGF0aWMgbGFzdCAoKSB7XG4gICAgbGV0IGFsbCA9IHRoaXMuZ2V0QWxsKClcbiAgICByZXR1cm4gYWxsW2FsbC5sZW5ndGggLSAxXVxuICB9XG5cbiAgc3RhdGljIGdldEFsbCAoKSB7XG4gICAgcmV0dXJuIF8oZGVmaW5pdGlvbnMpLnZhbHVlcygpXG4gIH1cblxuICBzdGF0aWMgZ2V0TW9kZWxTY2hlbWEgKCkge1xuICAgIHJldHVybiBkZWZpbml0aW9uc1xuICB9XG5cbiAgc3RhdGljIGxvb2t1cCAoYWxpYXNPck5hbWUsIHNpbmd1bGFyID0gdHJ1ZSkge1xuICAgIGlmKGRlZmluaXRpb25zW2FsaWFzT3JOYW1lXSl7XG4gICAgICByZXR1cm4gZGVmaW5pdGlvbnNbYWxpYXNPck5hbWVdXG4gICAgfVxuICAgIFxuICAgIGxldCBuYW1lID0gdHlwZV9hbGlhc2VzW2FsaWFzT3JOYW1lXVxuICAgIFxuICAgIGlmKG5hbWUgJiYgZGVmaW5pdGlvbnNbbmFtZV0pe1xuICAgICAgcmV0dXJuIGRlZmluaXRpb25zW25hbWVdXG4gICAgfVxuXG4gICAgaWYoc2luZ3VsYXIgPT0gdHJ1ZSl7XG4gICAgICByZXR1cm4gTW9kZWxEZWZpbml0aW9uLmxvb2t1cChpbmZsZWN0aW9ucy5zaW5ndWxhcml6ZShhbGlhc09yTmFtZSksIGZhbHNlKVxuICAgIH1cbiAgfVxuICBcbiAgc3RhdGljIGdldFR5cGVBbGlhc2VzKCl7XG4gICAgcmV0dXJuIE9iamVjdC5rZXlzKHR5cGVfYWxpYXNlcylcbiAgfVxuXG4gIGNvbnN0cnVjdG9yIChuYW1lID0gXCJEb2N1bWVudFwiKSB7XG4gICAgdGhpcy5uYW1lID0gaW5mbGVjdGlvbnMuY2FtZWxpemUobmFtZSlcbiAgICB0aGlzLnR5cGVfYWxpYXMgPSBpbmZsZWN0aW9ucy51bmRlcnNjb3JlKG5hbWUudG9Mb3dlckNhc2UoKSlcbiAgICB0aGlzLmdyb3VwTmFtZSA9IGluZmxlY3Rpb25zLnBsdXJhbGl6ZShuYW1lLnRvTG93ZXJDYXNlKCkpXG5cbiAgICB0aGlzLmF0dHJpYnV0ZXMgPSB7fVxuICAgIHRoaXMuc2VjdGlvbnMgPSB7fVxuICAgIHRoaXMuYWN0aW9ucyA9IHt9XG4gICAgdGhpcy5yZWxhdGlvbnNoaXBzID0ge31cblxuICAgIC8vc3RvcmUgYSByZWZlcmVuY2UgaW4gdGhlIGJ1Y2tldFxuICAgIGRlZmluaXRpb25zW3RoaXMubmFtZV0gPSB0aGlzXG4gICAgdHlwZV9hbGlhc2VzW3RoaXMudHlwZV9hbGlhc10gPSB0aGlzLm5hbWVcbiAgfVxuICBcbiAgZmluYWxpemVSZWxhdGlvbnNoaXBzKCl7XG4gICAgXyh0aGlzLnJlbGF0aW9uc2hpcHMpLnZhbHVlcygpLmZvckVhY2gocmVsYXRpb25zaGlwID0+IHtcbiAgICAgIHJlbGF0aW9uc2hpcC5tb2RlbERlZmluaXRpb24gPSBmdW5jdGlvbigpe1xuICAgICAgICByZXR1cm4gTW9kZWxEZWZpbml0aW9uLmxvb2t1cChyZWxhdGlvbnNoaXAucmVsYXRpb25zaGlwKVxuICAgICAgfVxuICAgIH0pXG4gIH1cblxuICBhY3Rpb25OYW1lcygpe1xuICAgIHJldHVybiBPYmplY3Qua2V5cyh0aGlzLmFjdGlvbnMpXG4gIH1cblxuICBnZXRBbGxNb2RlbEluc3RhbmNlcygpe1xuICAgIGxldCByZXN1bHRzID0gW11cbiAgICBsZXQgZ3JvdXBOYW1lID0gdGhpcy5ncm91cE5hbWVcblxuICAgIHJldHVybiBfLmZsYXR0ZW4oYnJpZWYuaW5zdGFuY2VzKCkubWFwKGJyaWVmY2FzZSA9PiB7XG4gICAgICByZXN1bHRzLnB1c2goYnJpZWZjYXNlLmZpbHRlckFsbChtb2RlbCA9PiBtb2RlbC5ncm91cE5hbWUgPT0gZ3JvdXBOYW1lKSlcbiAgICB9KSlcbiAgfVxuXG4gIHRvQ29sbGVjdGlvblByb3RvdHlwZSgpIHtcbiAgICBsZXQgY29sbGVjdGlvbiA9IGZ1bmN0aW9uKCl7IH1cbiAgICBsZXQgZGVmaW5pdGlvbiA9IHRoaXNcbiAgICBsZXQgYXR0cmlidXRlTmFtZXMgPSBPYmplY3Qua2V5cyh0aGlzLmF0dHJpYnV0ZXMpXG5cbiAgICBjb2xsZWN0aW9uLnByb3RvdHlwZSA9IENvbGxlY3Rpb25cblxuICAgIFxuICAgIGZvcih2YXIgbmFtZSBpbiBhdHRyaWJ1dGVOYW1lcyl7XG4gICAgICBsZXQgZmluZGVyTmFtZSA9IGluZmxlY3Rpb25zLmNhbWVsaXplKCdmaW5kX2J5XycgKyBuYW1lLCBmYWxzZSlcbiAgICAgIGNvbGxlY3Rpb25bZmluZGVyTmFtZV0gPSBmdW5jdGlvbihuZWVkbGUpe1xuICAgICAgICB0aGlzLm1vZGVscy5maW5kKG1vZGVsID0+IG1vZGVsW25hbWVdID09IG5lZWRsZSlcbiAgICAgIH1cbiAgICB9XG5cbiAgICByZXR1cm4gY29sbGVjdGlvblxuICB9XG5cbiAgdG9Qcm90b3R5cGUgKCkge1xuICAgIGxldCBvYmogPSBmdW5jdGlvbigpeyB9XG4gICAgbGV0IGRlZmluaXRpb24gPSB0aGlzXG4gICAgbGV0IGF0dHJpYnV0ZU5hbWVzID0gT2JqZWN0LmtleXModGhpcy5hdHRyaWJ1dGVzKVxuXG4gICAgb2JqLnByb3RvdHlwZSA9IE1vZGVsXG4gICAgXG4gICAgb2JqLmdldE1vZGVsRGVmaW5pdGlvbiA9IGZ1bmN0aW9uKCl7XG4gICAgICByZXR1cm4gZGVmaW5pdGlvblxuICAgIH1cblxuICAgIGZvcih2YXIgbmFtZSBpbiBhdHRyaWJ1dGVOYW1lcyl7XG4gICAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkob2JqLCBuYW1lLCB7XG4gICAgICAgIGdldDogZnVuY3Rpb24oKXtcbiAgICAgICAgICByZXR1cm4gdGhpcy5kYXRhW25hbWVdXG4gICAgICAgIH1cbiAgICAgIH0pXG4gICAgfVxuXG4gICAgZm9yKHZhciBhY3Rpb24gaW4gdGhpcy5hY3Rpb25zKXtcbiAgICAgIG9ialthY3Rpb25dID0gZnVuY3Rpb24oKXtcbiAgICAgICAgYWN0aW9uc1thY3Rpb25dLmFwcGx5KG9iaiwgYXJndW1lbnRzKVxuICAgICAgfVxuICAgIH1cblxuICAgIHJldHVybiBvYmpcbiAgfVxuICBcbiAgLyoqXG4gICAqIHJldHVybnMgdGhlIGF0dHJpYnV0ZSBuYW1lcyBhcyBhbiBhcnJheVxuICAqL1xuICBhdHRyaWJ1dGVOYW1lcygpIHtcbiAgICByZXR1cm4gT2JqZWN0LnZhbHVlcyh0aGlzLmF0dHJpYnV0ZXMpLm1hcChhdHRyID0+IGF0dHIubmFtZSlcbiAgfVxuICBcbiAgLyoqXG4gICAqIHJldHVybnMgdGhlIGF0dHJpYnV0ZXMgd2hpY2ggYXJlIGNvbmZpZ3VyZWQgZm9yIGV4dHJhY3Rpb25cbiAgKi9cbiAgZXh0cmFjdGlvbnMoKSB7XG4gICAgcmV0dXJuIE9iamVjdC52YWx1ZXModGhpcy5hdHRyaWJ1dGVzKS5maWx0ZXIoYXR0ciA9PiBhdHRyLmV4dHJhY3Rpb24pXG4gIH1cblxuICAvKiogXG4gICAqIGRlZmluZXMgYXR0cmlidXRlcyBmb3IgdGhlIG1vZGVsJ3MgbWV0YWRhdGFcbiAgKi9cbiAgZGVmaW5lQXR0cmlidXRlcyAobGlzdCA9IFtdKSB7XG4gICAgbGlzdC5mb3JFYWNoKGF0dHIgPT4ge1xuICAgICAgaWYodHlwZW9mKGF0dHIpID09PSBcInN0cmluZ1wiKVxuICAgICAgICBhdHRyID0ge25hbWU6IGF0dHJ9XG4gICAgICBcbiAgICAgIHRoaXMuYXR0cmlidXRlc1thdHRyLm5hbWVdID0gbmV3IEF0dHJpYnV0ZUNvbmZpZyhhdHRyKVxuICAgIH0pXG5cbiAgICByZXR1cm4gdGhpc1xuICB9XG4gIFxuICAvKipcbiAgICogZGVmaW5lcyBhIHNlY3Rpb24gZm9yIHRoZSBtb2RlbC4gYSBzZWN0aW9uIHdpbGwgYmVcbiAgICogYnVpbHQgZnJvbSB0aGUgd3JpdHRlbiBjb250ZW50IG9mIHRoZSBkb2N1bWVudC4gc2VjdGlvbnNcbiAgICogY29uc2lzdCBvZiBoZWFkaW5ncyBuZXN0ZWQgd2l0aGluIGhlYWRpbmdzLlxuICAqL1xuICBkZWZpbmVTZWN0aW9uIChzZWN0aW9uTmFtZSwgb3B0aW9ucyA9IHt9KSB7XG4gICAgdGhpcy5zZWN0aW9uc1tzZWN0aW9uTmFtZV0gPSBuZXcgRG9jdW1lbnRTZWN0aW9uKHNlY3Rpb25OYW1lLCB0aGlzLCBvcHRpb25zKVxuICAgIHJldHVybiB0aGlzLnNlY3Rpb25zW3NlY3Rpb25OYW1lXVxuICB9XG5cbiAgLyoqXG4gICAqIGRlZmluZXMgYW4gYWN0aW9uIGZvciB0aGlzIG1vZGVsLiBhbiBhY3Rpb24gY2FuIGJlIGRpc3BhdGNoZWQgZnJvbVxuICAgKiB0aGUgY29tbWFuZCBsaW5lLCBhbmQgcnVuIG9uIGFyYml0cmFyeSBwYXRocy5cbiAgKi9cbiAgZGVmaW5lQWN0aW9uIChhY3Rpb25OYW1lLCBoYW5kbGVyKSB7XG4gICAgdGhpcy5hY3Rpb25zW2FjdGlvbk5hbWVdID0gaGFuZGxlclxuICAgIHJldHVybiB0aGlzXG4gIH1cbn1cblxuZnVuY3Rpb24gcmVhZFBhdGgocGF0aCkge1xuICByZXR1cm4gZnMucmVhZEZpbGVTeW5jKHBhdGgpLnRvU3RyaW5nKClcbn1cbiJdfQ==