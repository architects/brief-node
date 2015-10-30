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

var dsl = Object.defineProperties({
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

}, {
  extract: {
    get: function get() {
      var current = ModelDefinition.last();
      return new _extractions.ExtractionRule();
    },
    configurable: true,
    enumerable: true
  }
});

var dsl_methods = ["define", "attributes", "attribute", "section", "action", "actions", "close", "hasMany", "belongsTo", "extract"];

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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3NyYy9tb2RlbF9kZWZpbml0aW9uLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7OztpQkFBb0IsR0FBRzs7OztvQkFDTixNQUFNOzs7O3VCQUNOLFVBQVU7Ozs7a0JBQ1osSUFBSTs7OzswQkFDTCxZQUFZOzs7O3FCQUNSLFNBQVM7Ozs7Z0NBQ0Msb0JBQW9COzs7O3FCQUM5QixTQUFTOzs7OzBCQUNKLGNBQWM7Ozs7OEJBQ2hCLGtCQUFrQjs7OzsyQkFDVixlQUFlOztBQUU1QyxJQUFNLFdBQVcsR0FBRyxxQkFBUyxDQUFBOztBQUU3QixJQUFNLFdBQVcsR0FBRyw0QkFBUyxNQUFNLENBQUE7QUFDbkMsSUFBTSxZQUFZLEdBQUcsNEJBQVMsT0FBTyxDQUFBOztBQUVyQyxJQUFNLEdBQUcsMkJBQUc7QUFDVixPQUFLLEVBQUUsaUJBQVU7QUFDZixRQUFJLE9BQU8sR0FBRyxlQUFlLENBQUMsSUFBSSxFQUFFLENBQUE7QUFDcEMsV0FBTyxPQUFPLENBQUMsV0FBVyxFQUFFLENBQUE7R0FDN0I7O0FBRUQsUUFBTSxFQUFFLGdCQUFVLFNBQVMsRUFBaUI7UUFBZixPQUFPLHlEQUFHLEVBQUU7O0FBQ3ZDLFFBQUksT0FBTyxHQUFHLFdBQVcsQ0FBQyxTQUFTLENBQUMsQ0FBQTtBQUNwQyxlQUFXLENBQUMsU0FBUyxDQUFDLEdBQUcsT0FBTyxJQUFJLElBQUksZUFBZSxDQUFDLFNBQVMsRUFBRSxPQUFPLENBQUMsQ0FBQTs7QUFFM0UsV0FBTyxPQUFPLENBQUE7R0FDZjs7QUFFRCxZQUFVLEVBQUUsc0JBQW1CO0FBQzdCLFFBQUksT0FBTyxHQUFHLGVBQWUsQ0FBQyxJQUFJLEVBQUUsQ0FBQTs7c0NBRGIsSUFBSTtBQUFKLFVBQUk7OztBQUUzQixXQUFPLE9BQU8sQ0FBQyxnQkFBZ0IsQ0FBQyxJQUFJLENBQUMsQ0FBQTtHQUN0Qzs7QUFFRCxXQUFTLEVBQUUsbUJBQVMsSUFBSSxFQUFDO0FBQ3ZCLFFBQUksT0FBTyxHQUFHLGVBQWUs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QUNsQzs7Ozs7Ozs7V0FNWSxzQkFBQyxVQUFVLEVBQUUsT0FBTyxFQUFFO0FBQ2pDLFVBQUksQ0FBQyxPQUFPLENBQUMsVUFBVSxDQUFDLEdBQUcsT0FBTyxDQUFBO0FBQ2xDLGFBQU8sSUFBSSxDQUFBO0tBQ1o7OztTQW5Na0IsZUFBZTs7O3FCQUFmLGVBQWU7O0FBc01wQyxTQUFTLFFBQVEsQ0FBQyxJQUFJLEVBQUU7QUFDdEIsU0FBTyxnQkFBRyxZQUFZLENBQUMsSUFBSSxDQUFDLENBQUMsUUFBUSxFQUFFLENBQUE7Q0FDeEMiLCJmaWxlIjoibW9kZWxfZGVmaW5pdGlvbi5qcyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCBpbmZsZWN0IGZyb20gJ2knXG5pbXBvcnQgcGF0aCBmcm9tICdwYXRoJ1xuaW1wb3J0IGdsb2IgZnJvbSAnZ2xvYi1hbGwnXG5pbXBvcnQgZnMgZnJvbSAnZnMnXG5pbXBvcnQgXyBmcm9tICd1bmRlcnNjb3JlJ1xuaW1wb3J0IGJyaWVmIGZyb20gJy4vaW5kZXgnXG5pbXBvcnQgRG9jdW1lbnRTZWN0aW9uIGZyb20gJy4vZG9jdW1lbnRfc2VjdGlvbidcbmltcG9ydCBNb2RlbCBmcm9tICcuL21vZGVsJ1xuaW1wb3J0IENvbGxlY3Rpb24gZnJvbSAnLi9jb2xsZWN0aW9uJ1xuaW1wb3J0IHJlZ2lzdHJ5IGZyb20gJy4vbW9kZWxfcmVnaXN0cnknXG5pbXBvcnQge0V4dHJhY3Rpb25SdWxlfSBmcm9tICcuL2V4dHJhY3Rpb25zJ1xuXG5jb25zdCBpbmZsZWN0aW9ucyA9IGluZmxlY3QoKVxuXG5jb25zdCBkZWZpbml0aW9ucyA9IHJlZ2lzdHJ5Lm1vZGVscyBcbmNvbnN0IHR5cGVfYWxpYXNlcyA9IHJlZ2lzdHJ5LmFsaWFzZXMgXG5cbmNvbnN0IGRzbCA9IHtcbiAgY2xvc2U6IGZ1bmN0aW9uKCl7XG4gICAgbGV0IGN1cnJlbnQgPSBNb2RlbERlZmluaXRpb24ubGFzdCgpXG4gICAgcmV0dXJuIGN1cnJlbnQudG9Qcm90b3R5cGUoKVxuICB9LFxuICBcbiAgZGVmaW5lOiBmdW5jdGlvbiggbW9kZWxOYW1lLCBvcHRpb25zID0ge30gKSB7XG4gICAgbGV0IGN1cnJlbnQgPSBkZWZpbml0aW9uc1ttb2RlbE5hbWVdXG4gICAgZGVmaW5pdGlvbnNbbW9kZWxOYW1lXSA9IGN1cnJlbnQgfHwgbmV3IE1vZGVsRGVmaW5pdGlvbihtb2RlbE5hbWUsIG9wdGlvbnMpXG5cbiAgICByZXR1cm4gY3VycmVudFxuICB9LFxuXG4gIGF0dHJpYnV0ZXM6IGZ1bmN0aW9uICguLi5saXN0KSB7XG4gICAgbGV0IGN1cnJlbnQgPSBNb2RlbERlZmluaXRpb24ubGFzdCgpXG4gICAgcmV0dXJuIGN1cnJlbnQuZGVmaW5lQXR0cmlidXRlcyhsaXN0KVxuICB9LFxuXG4gIGF0dHJpYnV0ZTogZnVuY3Rpb24obmFtZSl7XG4gICAgbGV0IGN1cnJlbnQgPSBNb2RlbERlZmluaXRpb24ubGFzdCgpXG4gICAgcmV0dXJuIGN1cnJlbnQuYXR0cmlidXRlc1tuYW1lXVxuICB9LFxuICBcbiAgaGFzTWFueTogZnVuY3Rpb24ocmVsYXRpb25zaGlwLCBvcHRpb25zPXt9KXtcbiAgICBsZXQgY3VycmVudCA9IE1vZGVsRGVmaW5pdGlvbi5sYXN0KClcbiAgICBsZXQgY29uZmlnID0gY3VycmVudC5yZWxhdGlvbnNoaXBzW3JlbGF0aW9uc2hpcF0gPSBvcHRpb25zXG5cbiAgICBjb25maWcuaGFzTWFueSA9IHRydWVcbiAgICBjb25maWcuYmVsb25nc1RvID0gZmFsc2VcbiAgICBjb25maWcudHlwZSA9IFwiaGFzTWFueVwiXG4gICAgY29uZmlnLnJlbGF0aW9uc2hpcCA9IHJlbGF0aW9uc2hpcFxuICAgIGNvbmZpZy5mb3JlaWduS2V5ID0gY3VycmVudC50eXBlX2FsaWFzXG4gIH0sXG4gIFxuICBiZWxvbmdzVG86IGZ1bmN0aW9uKHJlbGF0aW9uc2hpcCwgb3B0aW9ucz17fSl7XG4gICAgbGV0IGN1cnJlbnQgPSBNb2RlbERlZmluaXRpb24ubGFzdCgpXG4gICAgbGV0IGNvbmZpZyA9IGN1cnJlbnQucmVsYXRpb25zaGlwc1tyZWxhdGlvbnNoaXBdID0gb3B0aW9uc1xuXG4gICAgY29uZmlnLmhhc01hbnkgPSBmYWxzZVxuICAgIGNvbmZpZy5iZWxvbmdzVG8gPSB0cnVlXG4gICAgY29uZmlnLnR5cGUgPSBcImJlbG9uZ3NUb1wiXG4gICAgY29uZmlnLm1vZGVsRGVmaW5pdGlvbiA9IE1vZGVsRGVmaW5pdGlvbi5sb29rdXAocmVsYXRpb25zaGlwKVxuICAgIGNvbmZpZy5yZWxhdGlvbnNoaXAgPSByZWxhdGlvbnNoaXBcbiAgICBjb25maWcuZm9yZWlnbktleSA9IGNvbmZpZy5mb3JlaWduS2V5IHx8IHJlbGF0aW9uc2hpcFxuICB9LFxuXG4gIHNlY3Rpb246IGZ1bmN0aW9uIChuYW1lLCBvcHRpb25zID0ge30pIHtcbiAgICBsZXQgY3VycmVudCA9IE1vZGVsRGVmaW5pdGlvbi5sYXN0KClcbiAgICByZXR1cm4gY3VycmVudC5kZWZpbmVTZWN0aW9uKG5hbWUsIG9wdGlvbnMpXG4gIH0sXG5cbiAgYWN0aW9uOiBmdW5jdGlvbiAobmFtZSwgaGFuZGxlcikge1xuICAgIGxldCBjdXJyZW50ID0gTW9kZWxEZWZpbml0aW9uLmxhc3QoKVxuICAgIHJldHVybiBjdXJyZW50LmRlZmluZUFjdGlvbihuYW1lLCBoYW5kbGVyKVxuICB9LFxuXG4gIGdldCBleHRyYWN0KCl7XG4gICAgbGV0IGN1cnJlbnQgPSBNb2RlbERlZmluaXRpb24ubGFzdCgpXG4gICAgcmV0dXJuIG5ldyBFeHRyYWN0aW9uUnVsZSgpXG4gIH1cbn1cblxuY29uc3QgZHNsX21ldGhvZHMgPSBbXG4gIFwiZGVmaW5lXCIsXG4gIFwiYXR0cmlidXRlc1wiLFxuICBcImF0dHJpYnV0ZVwiLFxuICBcInNlY3Rpb25cIixcbiAgXCJhY3Rpb25cIixcbiAgXCJhY3Rpb25zXCIsXG4gIFwiY2xvc2VcIixcbiAgXCJoYXNNYW55XCIsXG4gIFwiYmVsb25nc1RvXCIsXG4gIFwiZXh0cmFjdFwiXG5dXG5cblxuY2xhc3MgQXR0cmlidXRlQ29uZmlnIHtcbiAgY29uc3RydWN0b3IoY29uZmlnKXtcbiAgICBmb3IodmFyIGtleSBpbiBjb25maWcpe1xuICAgICAgdGhpc1trZXldID0gY29uZmlnW2tleV1cbiAgICB9XG4gIH1cblxuICBleHRyYWN0KHNlbGVjdG9yKXtcbiAgICB0aGlzLmV4dHJhY3Rpb24gPSB0aGlzLmV4dHJhY3Rpb24gfHwge31cbiAgICB0aGlzLmV4dHJhY3Rpb24uc2VsZWN0b3IgPSBzZWxlY3RvclxuICAgIHJldHVybiB0aGlzXG4gIH1cbn1cblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgTW9kZWxEZWZpbml0aW9uIHtcbiAgc3RhdGljIGZpbmREZWZpbml0aW9uRmlsZXNJblBhdGgocGF0aG5hbWUpe1xuICAgIGxldCBtb2RlbHNfcGF0aCA9IHBhdGgucmVzb2x2ZShwYXRobmFtZSlcbiAgICByZXR1cm4gZ2xvYi5zeW5jKHBhdGguam9pbihtb2RlbHNfcGF0aCwnKiovKi5qcycpKVxuICB9XG5cbiAgc3RhdGljIGxvYWREZWZpbml0aW9uc0Zyb21QYXRoKHBhdGhuYW1lKXtcbiAgICBsZXQgZmlsZXMgPSBNb2RlbERlZmluaXRpb24uZmluZERlZmluaXRpb25GaWxlc0luUGF0aChwYXRobmFtZSlcbiAgICBmaWxlcy5mb3JFYWNoKGZpbGUgPT4gTW9kZWxEZWZpbml0aW9uLmxvYWQoZmlsZSkpXG4gIH1cblxuICBzdGF0aWMgc2V0dXBEU0wgKCkge1xuICAgIGRzbF9tZXRob2RzLmZvckVhY2gobWV0aG9kID0+IGdsb2JhbFttZXRob2RdID0gZHNsW21ldGhvZF0pXG4gIH1cblxuICBzdGF0aWMgY2xlYW51cERTTCAoKSB7XG4gICAgZHNsX21ldGhvZHMuZm9yRWFjaChtZXRob2QgPT4gZGVsZXRlKGdsb2JhbFttZXRob2RdKSlcbiAgfVxuICBcbiAgc3RhdGljIGZpbmFsaXplKCl7XG4gICAgTW9kZWxEZWZpbml0aW9uLmdldEFsbCgpLmZvckVhY2goZGVmaW5pdGlvbiA9PiBkZWZpbml0aW9uLmZpbmFsaXplUmVsYXRpb25zaGlwcygpKVxuICB9XG5cbiAgc3RhdGljIGxvYWQgKHBhdGgpIHtcbiAgICBsZXQgY29udGVudCA9IHJlYWRQYXRoKHBhdGgpXG5cbiAgICBNb2RlbERlZmluaXRpb24uc2V0dXBEU0woKVxuXG4gICAgbGV0IGxvYWRlZCA9IHJlcXVpcmUocGF0aClcblxuICAgIE1vZGVsRGVmaW5pdGlvbi5jbGVhbnVwRFNMKClcblxuICAgIHJldHVybiBsb2FkZWRcbiAgfVxuXG4gIHN0YXRpYyBsYXN0ICgpIHtcbiAgICBsZXQgYWxsID0gdGhpcy5nZXRBbGwoKVxuICAgIHJldHVybiBhbGxbYWxsLmxlbmd0aCAtIDFdXG4gIH1cblxuICBzdGF0aWMgZ2V0QWxsICgpIHtcbiAgICByZXR1cm4gXyhkZWZpbml0aW9ucykudmFsdWVzKClcbiAgfVxuXG4gIHN0YXRpYyBnZXRNb2RlbFNjaGVtYSAoKSB7XG4gICAgcmV0dXJuIGRlZmluaXRpb25zXG4gIH1cblxuICBzdGF0aWMgbG9va3VwIChhbGlhc09yTmFtZSwgc2luZ3VsYXIgPSB0cnVlKSB7XG4gICAgaWYoZGVmaW5pdGlvbnNbYWxpYXNPck5hbWVdKXtcbiAgICAgIHJldHVybiBkZWZpbml0aW9uc1thbGlhc09yTmFtZV1cbiAgICB9XG4gICAgXG4gICAgbGV0IG5hbWUgPSB0eXBlX2FsaWFzZXNbYWxpYXNPck5hbWVdXG4gICAgXG4gICAgaWYobmFtZSAmJiBkZWZpbml0aW9uc1tuYW1lXSl7XG4gICAgICByZXR1cm4gZGVmaW5pdGlvbnNbbmFtZV1cbiAgICB9XG5cbiAgICBpZihzaW5ndWxhciA9PSB0cnVlKXtcbiAgICAgIHJldHVybiBNb2RlbERlZmluaXRpb24ubG9va3VwKGluZmxlY3Rpb25zLnNpbmd1bGFyaXplKGFsaWFzT3JOYW1lKSwgZmFsc2UpXG4gICAgfVxuICB9XG4gIFxuICBzdGF0aWMgZ2V0VHlwZUFsaWFzZXMoKXtcbiAgICByZXR1cm4gT2JqZWN0LmtleXModHlwZV9hbGlhc2VzKVxuICB9XG5cbiAgY29uc3RydWN0b3IgKG5hbWUgPSBcIkRvY3VtZW50XCIpIHtcbiAgICB0aGlzLm5hbWUgPSBpbmZsZWN0aW9ucy5jYW1lbGl6ZShuYW1lKVxuICAgIHRoaXMudHlwZV9hbGlhcyA9IGluZmxlY3Rpb25zLnVuZGVyc2NvcmUobmFtZS50b0xvd2VyQ2FzZSgpKVxuICAgIHRoaXMuZ3JvdXBOYW1lID0gaW5mbGVjdGlvbnMucGx1cmFsaXplKG5hbWUudG9Mb3dlckNhc2UoKSlcblxuICAgIHRoaXMuYXR0cmlidXRlcyA9IHt9XG4gICAgdGhpcy5zZWN0aW9ucyA9IHt9XG4gICAgdGhpcy5hY3Rpb25zID0ge31cbiAgICB0aGlzLnJlbGF0aW9uc2hpcHMgPSB7fVxuXG4gICAgLy9zdG9yZSBhIHJlZmVyZW5jZSBpbiB0aGUgYnVja2V0XG4gICAgZGVmaW5pdGlvbnNbdGhpcy5uYW1lXSA9IHRoaXNcbiAgICB0eXBlX2FsaWFzZXNbdGhpcy50eXBlX2FsaWFzXSA9IHRoaXMubmFtZVxuICB9XG4gIFxuICBmaW5hbGl6ZVJlbGF0aW9uc2hpcHMoKXtcbiAgICBfKHRoaXMucmVsYXRpb25zaGlwcykudmFsdWVzKCkuZm9yRWFjaChyZWxhdGlvbnNoaXAgPT4ge1xuICAgICAgcmVsYXRpb25zaGlwLm1vZGVsRGVmaW5pdGlvbiA9IGZ1bmN0aW9uKCl7XG4gICAgICAgIHJldHVybiBNb2RlbERlZmluaXRpb24ubG9va3VwKHJlbGF0aW9uc2hpcC5yZWxhdGlvbnNoaXApXG4gICAgICB9XG4gICAgfSlcbiAgfVxuXG4gIGFjdGlvbk5hbWVzKCl7XG4gICAgcmV0dXJuIE9iamVjdC5rZXlzKHRoaXMuYWN0aW9ucylcbiAgfVxuXG4gIGdldEFsbE1vZGVsSW5zdGFuY2VzKCl7XG4gICAgbGV0IHJlc3VsdHMgPSBbXVxuICAgIGxldCBncm91cE5hbWUgPSB0aGlzLmdyb3VwTmFtZVxuXG4gICAgcmV0dXJuIF8uZmxhdHRlbihicmllZi5pbnN0YW5jZXMoKS5tYXAoYnJpZWZjYXNlID0+IHtcbiAgICAgIHJlc3VsdHMucHVzaChicmllZmNhc2UuZmlsdGVyQWxsKG1vZGVsID0+IG1vZGVsLmdyb3VwTmFtZSA9PSBncm91cE5hbWUpKVxuICAgIH0pKVxuICB9XG5cbiAgdG9Db2xsZWN0aW9uUHJvdG90eXBlKCkge1xuICAgIGxldCBjb2xsZWN0aW9uID0gZnVuY3Rpb24oKXsgfVxuICAgIGxldCBkZWZpbml0aW9uID0gdGhpc1xuICAgIGxldCBhdHRyaWJ1dGVOYW1lcyA9IE9iamVjdC5rZXlzKHRoaXMuYXR0cmlidXRlcylcblxuICAgIGNvbGxlY3Rpb24ucHJvdG90eXBlID0gQ29sbGVjdGlvblxuXG4gICAgXG4gICAgZm9yKHZhciBuYW1lIGluIGF0dHJpYnV0ZU5hbWVzKXtcbiAgICAgIGxldCBmaW5kZXJOYW1lID0gaW5mbGVjdGlvbnMuY2FtZWxpemUoJ2ZpbmRfYnlfJyArIG5hbWUsIGZhbHNlKVxuICAgICAgY29sbGVjdGlvbltmaW5kZXJOYW1lXSA9IGZ1bmN0aW9uKG5lZWRsZSl7XG4gICAgICAgIHRoaXMubW9kZWxzLmZpbmQobW9kZWwgPT4gbW9kZWxbbmFtZV0gPT0gbmVlZGxlKVxuICAgICAgfVxuICAgIH1cblxuICAgIHJldHVybiBjb2xsZWN0aW9uXG4gIH1cblxuICB0b1Byb3RvdHlwZSAoKSB7XG4gICAgbGV0IG9iaiA9IGZ1bmN0aW9uKCl7IH1cbiAgICBsZXQgZGVmaW5pdGlvbiA9IHRoaXNcbiAgICBsZXQgYXR0cmlidXRlTmFtZXMgPSBPYmplY3Qua2V5cyh0aGlzLmF0dHJpYnV0ZXMpXG5cbiAgICBvYmoucHJvdG90eXBlID0gTW9kZWxcbiAgICBcbiAgICBvYmouZ2V0TW9kZWxEZWZpbml0aW9uID0gZnVuY3Rpb24oKXtcbiAgICAgIHJldHVybiBkZWZpbml0aW9uXG4gICAgfVxuXG4gICAgZm9yKHZhciBuYW1lIGluIGF0dHJpYnV0ZU5hbWVzKXtcbiAgICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShvYmosIG5hbWUsIHtcbiAgICAgICAgZ2V0OiBmdW5jdGlvbigpe1xuICAgICAgICAgIHJldHVybiB0aGlzLmRhdGFbbmFtZV1cbiAgICAgICAgfVxuICAgICAgfSlcbiAgICB9XG5cbiAgICBmb3IodmFyIGFjdGlvbiBpbiB0aGlzLmFjdGlvbnMpe1xuICAgICAgb2JqW2FjdGlvbl0gPSBmdW5jdGlvbigpe1xuICAgICAgICBhY3Rpb25zW2FjdGlvbl0uYXBwbHkob2JqLCBhcmd1bWVudHMpXG4gICAgICB9XG4gICAgfVxuXG4gICAgcmV0dXJuIG9ialxuICB9XG4gIFxuICAvKipcbiAgICogcmV0dXJucyB0aGUgYXR0cmlidXRlIG5hbWVzIGFzIGFuIGFycmF5XG4gICovXG4gIGF0dHJpYnV0ZU5hbWVzKCkge1xuICAgIHJldHVybiBPYmplY3QudmFsdWVzKHRoaXMuYXR0cmlidXRlcykubWFwKGF0dHIgPT4gYXR0ci5uYW1lKVxuICB9XG4gIFxuICAvKipcbiAgICogcmV0dXJucyB0aGUgYXR0cmlidXRlcyB3aGljaCBhcmUgY29uZmlndXJlZCBmb3IgZXh0cmFjdGlvblxuICAqL1xuICBleHRyYWN0aW9ucygpIHtcbiAgICByZXR1cm4gT2JqZWN0LnZhbHVlcyh0aGlzLmF0dHJpYnV0ZXMpLmZpbHRlcihhdHRyID0+IGF0dHIuZXh0cmFjdGlvbilcbiAgfVxuXG4gIC8qKiBcbiAgICogZGVmaW5lcyBhdHRyaWJ1dGVzIGZvciB0aGUgbW9kZWwncyBtZXRhZGF0YVxuICAqL1xuICBkZWZpbmVBdHRyaWJ1dGVzIChsaXN0ID0gW10pIHtcbiAgICBsaXN0LmZvckVhY2goYXR0ciA9PiB7XG4gICAgICBpZih0eXBlb2YoYXR0cikgPT09IFwic3RyaW5nXCIpXG4gICAgICAgIGF0dHIgPSB7bmFtZTogYXR0cn1cbiAgICAgIFxuICAgICAgdGhpcy5hdHRyaWJ1dGVzW2F0dHIubmFtZV0gPSBuZXcgQXR0cmlidXRlQ29uZmlnKGF0dHIpXG4gICAgfSlcblxuICAgIHJldHVybiB0aGlzXG4gIH1cbiAgXG4gIC8qKlxuICAgKiBkZWZpbmVzIGEgc2VjdGlvbiBmb3IgdGhlIG1vZGVsLiBhIHNlY3Rpb24gd2lsbCBiZVxuICAgKiBidWlsdCBmcm9tIHRoZSB3cml0dGVuIGNvbnRlbnQgb2YgdGhlIGRvY3VtZW50LiBzZWN0aW9uc1xuICAgKiBjb25zaXN0IG9mIGhlYWRpbmdzIG5lc3RlZCB3aXRoaW4gaGVhZGluZ3MuXG4gICovXG4gIGRlZmluZVNlY3Rpb24gKHNlY3Rpb25OYW1lLCBvcHRpb25zID0ge30pIHtcbiAgICB0aGlzLnNlY3Rpb25zW3NlY3Rpb25OYW1lXSA9IG5ldyBEb2N1bWVudFNlY3Rpb24oc2VjdGlvbk5hbWUsIHRoaXMsIG9wdGlvbnMpXG4gICAgcmV0dXJuIHRoaXMuc2VjdGlvbnNbc2VjdGlvbk5hbWVdXG4gIH1cblxuICAvKipcbiAgICogZGVmaW5lcyBhbiBhY3Rpb24gZm9yIHRoaXMgbW9kZWwuIGFuIGFjdGlvbiBjYW4gYmUgZGlzcGF0Y2hlZCBmcm9tXG4gICAqIHRoZSBjb21tYW5kIGxpbmUsIGFuZCBydW4gb24gYXJiaXRyYXJ5IHBhdGhzLlxuICAqL1xuICBkZWZpbmVBY3Rpb24gKGFjdGlvbk5hbWUsIGhhbmRsZXIpIHtcbiAgICB0aGlzLmFjdGlvbnNbYWN0aW9uTmFtZV0gPSBoYW5kbGVyXG4gICAgcmV0dXJuIHRoaXNcbiAgfVxufVxuXG5mdW5jdGlvbiByZWFkUGF0aChwYXRoKSB7XG4gIHJldHVybiBmcy5yZWFkRmlsZVN5bmMocGF0aCkudG9TdHJpbmcoKVxufVxuIl19