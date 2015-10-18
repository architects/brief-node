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

      obj.prototype = _model2['default'];

      obj.getModelDefinition = function () {
        return definition;
      };

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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3NyYy9tb2RlbF9kZWZpbml0aW9uLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7OztpQkFBb0IsR0FBRzs7OztrQkFDUixJQUFJOzs7OzBCQUNMLFlBQVk7Ozs7cUJBQ1IsU0FBUzs7OztnQ0FDQyxvQkFBb0I7Ozs7cUJBQzlCLFNBQVM7Ozs7MEJBQ0osY0FBYzs7Ozs4QkFDaEIsa0JBQWtCOzs7O0FBRXZDLElBQU0sV0FBVyxHQUFHLHFCQUFTLENBQUE7O0FBRTdCLElBQU0sV0FBVyxHQUFHLDRCQUFTLE1BQU0sQ0FBQTtBQUNuQyxJQUFNLFlBQVksR0FBRyw0QkFBUyxPQUFPLENBQUE7O0FBRXJDLElBQU0sR0FBRyxHQUFHO0FBQ1YsT0FBSyxFQUFFLGlCQUFVO0FBQ2YsUUFBSSxPQUFPLEdBQUcsZUFBZSxDQUFDLElBQUksRUFBRSxDQUFBO0FBQ3BDLFdBQU8sT0FBTyxDQUFDLFdBQVcsRUFBRSxDQUFBO0dBQzdCOztBQUVELFFBQU0sRUFBRSxnQkFBVSxTQUFTLEVBQWlCO1FBQWYsT0FBTyx5REFBRyxFQUFFOztBQUN2QyxRQUFJLE9BQU8sR0FBRyxXQUFXLENBQUMsU0FBUyxDQUFDLENBQUE7QUFDcEMsZUFBVyxDQUFDLFNBQVMsQ0FBQyxHQUFHLE9BQU8sSUFBSSxJQUFJLGVBQWUsQ0FBQyxTQUFTLEVBQUUsT0FBTyxDQUFDLENBQUE7O0FBRTNFLFdBQU8sT0FBTyxDQUFBO0dBQ2Y7O0FBRUQsWUFBVSxFQUFFLHNCQUFtQjtBQUM3QixRQUFJLE9BQU8sR0FBRyxlQUFlLENBQUMsSUFBSSxFQUFFLENBQUE7O3NDQURiLElBQUk7QUFBSixVQUFJOzs7QUFFM0IsV0FBTyxPQUFPLENBQUMsZ0JBQWdCLENBQUMsSUFBSSxDQUFDLENBQUE7R0FDdEM7O0FBRUQsV0FBUyxFQUFFLG1CQUFTLElBQUksRUFBQztBQUN2QixRQUFJLE9BQU8sR0FBRyxlQUFlLENBQUMsSUFBSSxFQUFFLENBQUE7QUFDcEMsV0FBTyxPQUFPLENBQUMs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Ozs7O1dBT2EsdUJBQUMsV0FBVyxFQUFnQjtVQUFkLE9BQU8seURBQUcsRUFBRTs7QUFDdEMsVUFBSSxDQUFDLFFBQVEsQ0FBQyxXQUFXLENBQUMsR0FBRyxrQ0FBb0IsV0FBVyxFQUFFLElBQUksRUFBRSxPQUFPLENBQUMsQ0FBQTtBQUM1RSxhQUFPLElBQUksQ0FBQyxRQUFRLENBQUMsV0FBVyxDQUFDLENBQUE7S0FDbEM7Ozs7Ozs7O1dBTVksc0JBQUMsVUFBVSxFQUFFLE9BQU8sRUFBRTtBQUNqQyxVQUFJLENBQUMsT0FBTyxDQUFDLFVBQVUsQ0FBQyxHQUFHLE9BQU8sQ0FBQTtBQUNsQyxhQUFPLElBQUksQ0FBQTtLQUNaOzs7U0FoTGtCLGVBQWU7OztxQkFBZixlQUFlOztBQW1McEMsU0FBUyxRQUFRLENBQUMsSUFBSSxFQUFFO0FBQ3RCLFNBQU8sZ0JBQUcsWUFBWSxDQUFDLElBQUksQ0FBQyxDQUFDLFFBQVEsRUFBRSxDQUFBO0NBQ3hDIiwiZmlsZSI6Im1vZGVsX2RlZmluaXRpb24uanMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgaW5mbGVjdCBmcm9tICdpJ1xuaW1wb3J0IGZzIGZyb20gJ2ZzJ1xuaW1wb3J0IF8gZnJvbSAndW5kZXJzY29yZSdcbmltcG9ydCBicmllZiBmcm9tICcuL2luZGV4J1xuaW1wb3J0IERvY3VtZW50U2VjdGlvbiBmcm9tICcuL2RvY3VtZW50X3NlY3Rpb24nXG5pbXBvcnQgTW9kZWwgZnJvbSAnLi9tb2RlbCdcbmltcG9ydCBDb2xsZWN0aW9uIGZyb20gJy4vY29sbGVjdGlvbidcbmltcG9ydCByZWdpc3RyeSBmcm9tICcuL21vZGVsX3JlZ2lzdHJ5J1xuXG5jb25zdCBpbmZsZWN0aW9ucyA9IGluZmxlY3QoKVxuXG5jb25zdCBkZWZpbml0aW9ucyA9IHJlZ2lzdHJ5Lm1vZGVscyBcbmNvbnN0IHR5cGVfYWxpYXNlcyA9IHJlZ2lzdHJ5LmFsaWFzZXMgXG5cbmNvbnN0IGRzbCA9IHtcbiAgY2xvc2U6IGZ1bmN0aW9uKCl7XG4gICAgbGV0IGN1cnJlbnQgPSBNb2RlbERlZmluaXRpb24ubGFzdCgpXG4gICAgcmV0dXJuIGN1cnJlbnQudG9Qcm90b3R5cGUoKVxuICB9LFxuXG4gIGRlZmluZTogZnVuY3Rpb24oIG1vZGVsTmFtZSwgb3B0aW9ucyA9IHt9ICkge1xuICAgIGxldCBjdXJyZW50ID0gZGVmaW5pdGlvbnNbbW9kZWxOYW1lXVxuICAgIGRlZmluaXRpb25zW21vZGVsTmFtZV0gPSBjdXJyZW50IHx8IG5ldyBNb2RlbERlZmluaXRpb24obW9kZWxOYW1lLCBvcHRpb25zKVxuXG4gICAgcmV0dXJuIGN1cnJlbnRcbiAgfSxcblxuICBhdHRyaWJ1dGVzOiBmdW5jdGlvbiAoLi4ubGlzdCkge1xuICAgIGxldCBjdXJyZW50ID0gTW9kZWxEZWZpbml0aW9uLmxhc3QoKVxuICAgIHJldHVybiBjdXJyZW50LmRlZmluZUF0dHJpYnV0ZXMobGlzdClcbiAgfSxcblxuICBhdHRyaWJ1dGU6IGZ1bmN0aW9uKG5hbWUpe1xuICAgIGxldCBjdXJyZW50ID0gTW9kZWxEZWZpbml0aW9uLmxhc3QoKVxuICAgIHJldHVybiBjdXJyZW50LmF0dHJpYnV0ZXNbbmFtZV1cbiAgfSxcbiAgXG4gIGhhc01hbnk6IGZ1bmN0aW9uKHJlbGF0aW9uc2hpcCwgb3B0aW9ucz17fSl7XG4gICAgbGV0IGN1cnJlbnQgPSBNb2RlbERlZmluaXRpb24ubGFzdCgpXG4gICAgbGV0IGNvbmZpZyA9IGN1cnJlbnQucmVsYXRpb25zaGlwc1tyZWxhdGlvbnNoaXBdID0gb3B0aW9uc1xuXG4gICAgY29uZmlnLmhhc01hbnkgPSB0cnVlXG4gICAgY29uZmlnLmJlbG9uZ3NUbyA9IGZhbHNlXG4gICAgY29uZmlnLnR5cGUgPSBcImhhc01hbnlcIlxuICAgIGNvbmZpZy5yZWxhdGlvbnNoaXAgPSByZWxhdGlvbnNoaXBcbiAgICBjb25maWcuZm9yZWlnbktleSA9IGN1cnJlbnQudHlwZV9hbGlhc1xuICB9LFxuICBcbiAgYmVsb25nc1RvOiBmdW5jdGlvbihyZWxhdGlvbnNoaXAsIG9wdGlvbnM9e30pe1xuICAgIGxldCBjdXJyZW50ID0gTW9kZWxEZWZpbml0aW9uLmxhc3QoKVxuICAgIGxldCBjb25maWcgPSBjdXJyZW50LnJlbGF0aW9uc2hpcHNbcmVsYXRpb25zaGlwXSA9IG9wdGlvbnNcblxuICAgIGNvbmZpZy5oYXNNYW55ID0gZmFsc2VcbiAgICBjb25maWcuYmVsb25nc1RvID0gdHJ1ZVxuICAgIGNvbmZpZy50eXBlID0gXCJiZWxvbmdzVG9cIlxuICAgIGNvbmZpZy5tb2RlbERlZmluaXRpb24gPSBNb2RlbERlZmluaXRpb24ubG9va3VwKHJlbGF0aW9uc2hpcClcbiAgICBjb25maWcucmVsYXRpb25zaGlwID0gcmVsYXRpb25zaGlwXG4gICAgY29uZmlnLmZvcmVpZ25LZXkgPSBjb25maWcuZm9yZWlnbktleSB8fCByZWxhdGlvbnNoaXBcbiAgfSxcblxuICBzZWN0aW9uOiBmdW5jdGlvbiAobmFtZSwgb3B0aW9ucyA9IHt9KSB7XG4gICAgbGV0IGN1cnJlbnQgPSBNb2RlbERlZmluaXRpb24ubGFzdCgpXG4gICAgcmV0dXJuIGN1cnJlbnQuZGVmaW5lU2VjdGlvbihuYW1lLCBvcHRpb25zKVxuICB9LFxuXG4gIGFjdGlvbjogZnVuY3Rpb24gKG5hbWUsIGhhbmRsZXIpIHtcbiAgICBsZXQgY3VycmVudCA9IE1vZGVsRGVmaW5pdGlvbi5sYXN0KClcbiAgICByZXR1cm4gY3VycmVudC5kZWZpbmVBY3Rpb24obmFtZSwgaGFuZGxlcilcbiAgfVxufVxuXG5jb25zdCBkc2xfbWV0aG9kcyA9IFtcbiAgXCJkZWZpbmVcIixcbiAgXCJhdHRyaWJ1dGVzXCIsXG4gIFwiYXR0cmlidXRlXCIsXG4gIFwic2VjdGlvblwiLFxuICBcImFjdGlvblwiLFxuICBcImFjdGlvbnNcIixcbiAgXCJjbG9zZVwiLFxuICBcImhhc01hbnlcIixcbiAgXCJiZWxvbmdzVG9cIlxuXVxuXG5cbmNsYXNzIEF0dHJpYnV0ZUNvbmZpZyB7XG4gIGNvbnN0cnVjdG9yKGNvbmZpZyl7XG4gICAgZm9yKHZhciBrZXkgaW4gY29uZmlnKXtcbiAgICAgIHRoaXNba2V5XSA9IGNvbmZpZ1trZXldXG4gICAgfVxuICB9XG5cbiAgZXh0cmFjdChzZWxlY3Rvcil7XG4gICAgdGhpcy5leHRyYWN0aW9uID0gdGhpcy5leHRyYWN0aW9uIHx8IHt9XG4gICAgdGhpcy5leHRyYWN0aW9uLnNlbGVjdG9yID0gc2VsZWN0b3JcbiAgICByZXR1cm4gdGhpc1xuICB9XG59XG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIE1vZGVsRGVmaW5pdGlvbiB7XG4gIHN0YXRpYyBzZXR1cERTTCAoKSB7XG4gICAgZHNsX21ldGhvZHMuZm9yRWFjaChtZXRob2QgPT4gZ2xvYmFsW21ldGhvZF0gPSBkc2xbbWV0aG9kXSkgICAgXG4gIH1cblxuICBzdGF0aWMgY2xlYW51cERTTCAoKSB7XG4gICAgZHNsX21ldGhvZHMuZm9yRWFjaChtZXRob2QgPT4gZGVsZXRlKGdsb2JhbFttZXRob2RdKSlcbiAgfVxuICBcbiAgc3RhdGljIGZpbmFsaXplKCl7XG4gICAgTW9kZWxEZWZpbml0aW9uLmdldEFsbCgpLmZvckVhY2goZGVmaW5pdGlvbiA9PiBkZWZpbml0aW9uLmZpbmFsaXplUmVsYXRpb25zaGlwcygpKVxuICB9XG5cbiAgc3RhdGljIGxvYWQgKHBhdGgpIHtcbiAgICBsZXQgY29udGVudCA9IHJlYWRQYXRoKHBhdGgpXG5cbiAgICBNb2RlbERlZmluaXRpb24uc2V0dXBEU0woKVxuXG4gICAgbGV0IGxvYWRlZCA9IHJlcXVpcmUocGF0aClcblxuICAgIE1vZGVsRGVmaW5pdGlvbi5jbGVhbnVwRFNMKClcblxuICAgIHJldHVybiBsb2FkZWRcbiAgfVxuXG4gIHN0YXRpYyBsYXN0ICgpIHtcbiAgICBsZXQgYWxsID0gdGhpcy5nZXRBbGwoKVxuICAgIHJldHVybiBhbGxbYWxsLmxlbmd0aCAtIDFdXG4gIH1cblxuICBzdGF0aWMgZ2V0QWxsICgpIHtcbiAgICByZXR1cm4gXyhkZWZpbml0aW9ucykudmFsdWVzKClcbiAgfVxuXG4gIHN0YXRpYyBnZXRNb2RlbFNjaGVtYSAoKSB7XG4gICAgcmV0dXJuIGRlZmluaXRpb25zXG4gIH1cblxuICBzdGF0aWMgbG9va3VwIChhbGlhc09yTmFtZSwgc2luZ3VsYXIgPSB0cnVlKSB7XG4gICAgaWYoZGVmaW5pdGlvbnNbYWxpYXNPck5hbWVdKXtcbiAgICAgIHJldHVybiBkZWZpbml0aW9uc1thbGlhc09yTmFtZV1cbiAgICB9XG4gICAgXG4gICAgbGV0IG5hbWUgPSB0eXBlX2FsaWFzZXNbYWxpYXNPck5hbWVdXG4gICAgXG4gICAgaWYobmFtZSAmJiBkZWZpbml0aW9uc1tuYW1lXSl7XG4gICAgICByZXR1cm4gZGVmaW5pdGlvbnNbbmFtZV1cbiAgICB9XG5cbiAgICBpZihzaW5ndWxhciA9PSB0cnVlKXtcbiAgICAgIHJldHVybiBNb2RlbERlZmluaXRpb24ubG9va3VwKGluZmxlY3Rpb25zLnNpbmd1bGFyaXplKGFsaWFzT3JOYW1lKSwgZmFsc2UpXG4gICAgfVxuICB9XG4gIFxuICBzdGF0aWMgZ2V0VHlwZUFsaWFzZXMoKXtcbiAgICByZXR1cm4gT2JqZWN0LmtleXModHlwZV9hbGlhc2VzKVxuICB9XG5cbiAgY29uc3RydWN0b3IgKG5hbWUgPSBcIkRvY3VtZW50XCIpIHtcbiAgICB0aGlzLm5hbWUgPSBpbmZsZWN0aW9ucy5jYW1lbGl6ZShuYW1lKVxuICAgIHRoaXMudHlwZV9hbGlhcyA9IGluZmxlY3Rpb25zLnVuZGVyc2NvcmUobmFtZS50b0xvd2VyQ2FzZSgpKVxuICAgIHRoaXMuZ3JvdXBOYW1lID0gaW5mbGVjdGlvbnMucGx1cmFsaXplKG5hbWUudG9Mb3dlckNhc2UoKSlcblxuICAgIHRoaXMuYXR0cmlidXRlcyA9IHt9XG4gICAgdGhpcy5zZWN0aW9ucyA9IHt9XG4gICAgdGhpcy5hY3Rpb25zID0ge31cbiAgICB0aGlzLnJlbGF0aW9uc2hpcHMgPSB7fVxuXG4gICAgLy9zdG9yZSBhIHJlZmVyZW5jZSBpbiB0aGUgYnVja2V0XG4gICAgZGVmaW5pdGlvbnNbdGhpcy5uYW1lXSA9IHRoaXNcbiAgICB0eXBlX2FsaWFzZXNbdGhpcy50eXBlX2FsaWFzXSA9IHRoaXMubmFtZVxuICB9XG4gIFxuICBmaW5hbGl6ZVJlbGF0aW9uc2hpcHMoKXtcbiAgICBfKHRoaXMucmVsYXRpb25zaGlwcykudmFsdWVzKCkuZm9yRWFjaChyZWxhdGlvbnNoaXAgPT4ge1xuICAgICAgcmVsYXRpb25zaGlwLm1vZGVsRGVmaW5pdGlvbiA9IGZ1bmN0aW9uKCl7XG4gICAgICAgIHJldHVybiBNb2RlbERlZmluaXRpb24ubG9va3VwKHJlbGF0aW9uc2hpcC5yZWxhdGlvbnNoaXApXG4gICAgICB9XG4gICAgfSlcbiAgfVxuXG4gIGFjdGlvbk5hbWVzKCl7XG4gICAgcmV0dXJuIE9iamVjdC5rZXlzKHRoaXMuYWN0aW9ucylcbiAgfVxuXG4gIGdldEFsbE1vZGVsSW5zdGFuY2VzKCl7XG4gICAgbGV0IHJlc3VsdHMgPSBbXVxuICAgIGxldCBncm91cE5hbWUgPSB0aGlzLmdyb3VwTmFtZVxuXG4gICAgcmV0dXJuIF8uZmxhdHRlbihicmllZi5pbnN0YW5jZXMoKS5tYXAoYnJpZWZjYXNlID0+IHtcbiAgICAgIHJlc3VsdHMucHVzaChicmllZmNhc2UuZmlsdGVyQWxsKG1vZGVsID0+IG1vZGVsLmdyb3VwTmFtZSA9PSBncm91cE5hbWUpKVxuICAgIH0pKVxuICB9XG5cbiAgdG9Db2xsZWN0aW9uUHJvdG90eXBlKCkge1xuICAgIGxldCBjb2xsZWN0aW9uID0gZnVuY3Rpb24oKXsgfVxuICAgIGxldCBkZWZpbml0aW9uID0gdGhpc1xuICAgIGxldCBhdHRyaWJ1dGVOYW1lcyA9IE9iamVjdC5rZXlzKHRoaXMuYXR0cmlidXRlcylcblxuICAgIGNvbGxlY3Rpb24ucHJvdG90eXBlID0gQ29sbGVjdGlvblxuXG4gICAgXG4gICAgZm9yKHZhciBuYW1lIGluIGF0dHJpYnV0ZU5hbWVzKXtcbiAgICAgIGxldCBmaW5kZXJOYW1lID0gaW5mbGVjdGlvbnMuY2FtZWxpemUoJ2ZpbmRfYnlfJyArIG5hbWUsIGZhbHNlKVxuICAgICAgY29sbGVjdGlvbltmaW5kZXJOYW1lXSA9IGZ1bmN0aW9uKG5lZWRsZSl7XG4gICAgICAgIHRoaXMubW9kZWxzLmZpbmQobW9kZWwgPT4gbW9kZWxbbmFtZV0gPT0gbmVlZGxlKVxuICAgICAgfVxuICAgIH1cblxuICAgIHJldHVybiBjb2xsZWN0aW9uXG4gIH1cblxuICB0b1Byb3RvdHlwZSAoKSB7XG4gICAgbGV0IG9iaiA9IGZ1bmN0aW9uKCl7IH1cbiAgICBsZXQgZGVmaW5pdGlvbiA9IHRoaXNcblxuICAgIG9iai5wcm90b3R5cGUgPSBNb2RlbFxuICAgIFxuICAgIG9iai5nZXRNb2RlbERlZmluaXRpb24gPSBmdW5jdGlvbigpe1xuICAgICAgcmV0dXJuIGRlZmluaXRpb25cbiAgICB9XG5cbiAgICBmb3IodmFyIGFjdGlvbiBpbiB0aGlzLmFjdGlvbnMpe1xuICAgICAgb2JqW2FjdGlvbl0gPSBmdW5jdGlvbigpe1xuICAgICAgICBhY3Rpb25zW2FjdGlvbl0uYXBwbHkob2JqLCBhcmd1bWVudHMpXG4gICAgICB9XG4gICAgfVxuXG4gICAgcmV0dXJuIG9ialxuICB9XG4gIFxuICAvKipcbiAgICogcmV0dXJucyB0aGUgYXR0cmlidXRlIG5hbWVzIGFzIGFuIGFycmF5XG4gICovXG4gIGF0dHJpYnV0ZU5hbWVzKCkge1xuICAgIHJldHVybiBPYmplY3QudmFsdWVzKHRoaXMuYXR0cmlidXRlcykubWFwKGF0dHIgPT4gYXR0ci5uYW1lKVxuICB9XG4gIFxuICAvKipcbiAgICogcmV0dXJucyB0aGUgYXR0cmlidXRlcyB3aGljaCBhcmUgY29uZmlndXJlZCBmb3IgZXh0cmFjdGlvblxuICAqL1xuICBleHRyYWN0aW9ucygpIHtcbiAgICByZXR1cm4gT2JqZWN0LnZhbHVlcyh0aGlzLmF0dHJpYnV0ZXMpLmZpbHRlcihhdHRyID0+IGF0dHIuZXh0cmFjdGlvbilcbiAgfVxuXG4gIC8qKiBcbiAgICogZGVmaW5lcyBhdHRyaWJ1dGVzIGZvciB0aGUgbW9kZWwncyBtZXRhZGF0YVxuICAqL1xuICBkZWZpbmVBdHRyaWJ1dGVzIChsaXN0ID0gW10pIHtcbiAgICBsaXN0LmZvckVhY2goYXR0ciA9PiB7XG4gICAgICBpZih0eXBlb2YoYXR0cikgPT09IFwic3RyaW5nXCIpXG4gICAgICAgIGF0dHIgPSB7bmFtZTogYXR0cn1cbiAgICAgIFxuICAgICAgdGhpcy5hdHRyaWJ1dGVzW2F0dHIubmFtZV0gPSBuZXcgQXR0cmlidXRlQ29uZmlnKGF0dHIpXG4gICAgfSlcblxuICAgIHJldHVybiB0aGlzXG4gIH1cbiAgXG4gIC8qKlxuICAgKiBkZWZpbmVzIGEgc2VjdGlvbiBmb3IgdGhlIG1vZGVsLiBhIHNlY3Rpb24gd2lsbCBiZVxuICAgKiBidWlsdCBmcm9tIHRoZSB3cml0dGVuIGNvbnRlbnQgb2YgdGhlIGRvY3VtZW50LiBzZWN0aW9uc1xuICAgKiBjb25zaXN0IG9mIGhlYWRpbmdzIG5lc3RlZCB3aXRoaW4gaGVhZGluZ3MuXG4gICovXG4gIGRlZmluZVNlY3Rpb24gKHNlY3Rpb25OYW1lLCBvcHRpb25zID0ge30pIHtcbiAgICB0aGlzLnNlY3Rpb25zW3NlY3Rpb25OYW1lXSA9IG5ldyBEb2N1bWVudFNlY3Rpb24oc2VjdGlvbk5hbWUsIHRoaXMsIG9wdGlvbnMpXG4gICAgcmV0dXJuIHRoaXMuc2VjdGlvbnNbc2VjdGlvbk5hbWVdXG4gIH1cblxuICAvKipcbiAgICogZGVmaW5lcyBhbiBhY3Rpb24gZm9yIHRoaXMgbW9kZWwuIGFuIGFjdGlvbiBjYW4gYmUgZGlzcGF0Y2hlZCBmcm9tXG4gICAqIHRoZSBjb21tYW5kIGxpbmUsIGFuZCBydW4gb24gYXJiaXRyYXJ5IHBhdGhzLlxuICAqL1xuICBkZWZpbmVBY3Rpb24gKGFjdGlvbk5hbWUsIGhhbmRsZXIpIHtcbiAgICB0aGlzLmFjdGlvbnNbYWN0aW9uTmFtZV0gPSBoYW5kbGVyXG4gICAgcmV0dXJuIHRoaXNcbiAgfVxufVxuXG5mdW5jdGlvbiByZWFkUGF0aChwYXRoKSB7XG4gIHJldHVybiBmcy5yZWFkRmlsZVN5bmMocGF0aCkudG9TdHJpbmcoKVxufVxuIl19