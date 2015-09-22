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

var dsl_methods = ["define", "attributes", "attribute", "section", "action", "actions", "close"];

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
    value: (function (_lookup) {
      function lookup(_x) {
        return _lookup.apply(this, arguments);
      }

      lookup.toString = function () {
        return _lookup.toString();
      };

      return lookup;
    })(function (aliasOrName) {
      var singular = arguments.length <= 1 || arguments[1] === undefined ? false : arguments[1];

      if (definitions[aliasOrName]) {
        return definitions[aliasOrName];
      }

      var name = type_aliases[aliasOrName];

      if (name && definitions[name]) {
        return definitions[name];
      }

      if (singular == true) {
        return lookup(inflections.singularize(aliasOrName, true));
      }
    })
  }]);

  function ModelDefinition() {
    var name = arguments.length <= 0 || arguments[0] === undefined ? "Document" : arguments[0];

    _classCallCheck(this, ModelDefinition);

    this.name = inflections.camelize(name);
    this.type_alias = inflections.underscore(name.toLowerCase());

    this.attributes = {};
    this.sections = {};
    this.actions = {};

    //store a reference in the bucket
    definitions[this.name] = this;
    type_aliases[this.type_alias] = this.name;
  }

  _createClass(ModelDefinition, [{
    key: 'actionNames',
    value: function actionNames() {
      return Object.keys(this.actions);
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
  }], [{
    key: 'getTypeAliases',
    value: function getTypeAliases() {
      return Object.keys(type_aliases);
    }
  }]);

  return ModelDefinition;
})();

exports['default'] = ModelDefinition;

function readPath(path) {
  return _fs2['default'].readFileSync(path).toString();
}
module.exports = exports['default'];
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3NyYy9tb2RlbF9kZWZpbml0aW9uLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7OztpQkFBb0IsR0FBRzs7OztrQkFDUixJQUFJOzs7OzBCQUNMLFlBQVk7Ozs7Z0NBQ0Usb0JBQW9COzs7O3FCQUM5QixTQUFTOzs7OzBCQUNKLGNBQWM7Ozs7OEJBQ2hCLGtCQUFrQjs7OztBQUV2QyxJQUFNLFdBQVcsR0FBRyxxQkFBUyxDQUFBOztBQUU3QixJQUFNLFdBQVcsR0FBRyw0QkFBUyxNQUFNLENBQUE7QUFDbkMsSUFBTSxZQUFZLEdBQUcsNEJBQVMsT0FBTyxDQUFBOztBQUVyQyxJQUFNLEdBQUcsR0FBRztBQUNWLE9BQUssRUFBRSxpQkFBVTtBQUNmLFFBQUksT0FBTyxHQUFHLGVBQWUsQ0FBQyxJQUFJLEVBQUUsQ0FBQTtBQUNwQyxXQUFPLE9BQU8sQ0FBQyxXQUFXLEVBQUUsQ0FBQTtHQUM3Qjs7QUFFRCxRQUFNLEVBQUUsZ0JBQVUsU0FBUyxFQUFpQjtRQUFmLE9BQU8seURBQUcsRUFBRTs7QUFDdkMsUUFBSSxPQUFPLEdBQUcsV0FBVyxDQUFDLFNBQVMsQ0FBQyxDQUFBO0FBQ3BDLGVBQVcsQ0FBQyxTQUFTLENBQUMsR0FBRyxPQUFPLElBQUksSUFBSSxlQUFlLENBQUMsU0FBUyxFQUFFLE9BQU8sQ0FBQyxDQUFBOztBQUUzRSxXQUFPLE9BQU8sQ0FBQTtHQUNmOztBQUVELFlBQVUsRUFBRSxzQkFBbUI7QUFDN0IsUUFBSSxPQUFPLEdBQUcsZUFBZSxDQUFDLElBQUksRUFBRSxDQUFBOztzQ0FEYixJQUFJO0FBQUosVUFBSTs7O0FBRTNCLFdBQU8sT0FBTyxDQUFDLGdCQUFnQixDQUFDLElBQUksQ0FBQyxDQUFBO0dBQ3RDOztBQUVELFdBQVMsRUFBRSxtQkFBUyxJQUFJLEVBQUM7QUFDdkIsUUFBSSxPQUFPLEdBQUcsZUFBZSxDQUFDLElBQUksRUFBRSxDQUFBO0FBQ3BDLFdBQU8sT0FBTyxDQUFDLFVBQVUsQ0FBQyxJQUFJLENBQUMsQ0FBQTtHQUNoQzs7QUFFRCxTQUFPLEVBQUUsaUJBQVUsSUFBSSxFQUFnQjtRQUFkLE9BQU8seURBQUcsRUFBRTs7QUFDbkMsUUFBSSxPQUFPLEdBQUcsZUFBZSxDQUFDLElBQUksRUFBRSxDQUFBO0FBQ3BDLFdBQU8sT0FBTyxDQUFDLGFBQWEsQ0FBQyxJQUFJLEVBQUUsT0FBTyxDQUFDLENBQUE7R0FDNUM7O0FBRUQsUUFBTSxFQUFFLGdCQUFVLElBQUksRUFBRSxPQUFPLEVBQUU7QUFDL0IsUUFBSSxPQUFPLEdBQUcsZUFBZSxDQUFDLElBQUksRUFBRSxDQUFBO0FBQ3BDLFdBQU8sT0FBTyxDQUFDLFlBQVksQ0FBQyxJQUFJLEVBQUUsT0FBTyxDQUFDLENBQUE7R0FDM0M7Q0FDRixDQUFBOztBQUVELElBQU0sV0FBVyxHQUFHLENBQ2xCLFFBQVEsRUFDUixZQUFZLEVBQ1osV0FBVyxFQUNYLFNBQVMsRUFDVCxRQUFRLEVBQ1IsU0FBUyxFQUNULE9BQU8sQ0FDUixDQUFBOztJQUdLLGVBQWU7QUFDUixXQURQLGVBQWUsQ0FDUCxNQUFNLEVBQUM7MEJBRGYsZUFBZTs7QUFFakIsU0FBSSxJQUFJLEdBQUcsSUFBSSxNQUFNLEVBQUM7QUFDcEIsVUFBSSxDQUFDLEdBQUcsQ0FBQyxHQUFHLE1BQU0sQ0FBQyxHQUFHLENBQUMsQ0FBQTtLQUN4QjtHQUNGOztlQUxHLGVBQWU7O1dBT1osaUJBQUMsUUFBUSxFQUFDO0FBQ2YsVUFBSSxDQUFDLFVBQVUsR0FBRyxJQUFJLENBQUMsVUFBVSxJQUFJLEVBQUUsQ0FBQTtBQUN2QyxVQUFJLENBQUMsVUFBVSxDQUFDLFFBQVEsR0FBRyxRQUFRLENBQUE7QUFDbkMsYUFBTyxJQUFJLENBQUE7S0FDWjs7O1NBWEcsZUFBZTs7O0lBY0EsZUFBZTtlQUFmLGVBQWU7O1dBQ2xCLG9CQUFHO0FBQ2pCLGlCQUFXLENBQUMsT0FBTyxDQUFDLFVBQUEsTUFBTTtlQUFJLE1BQU0sQ0FBQyxNQUFNLENBQUMsR0FBRyxHQUFHLENBQUMsTUFBTSxDQUFDO09BQUEsQ0FBQyxDQUFBO0tBQzVEOzs7V0FFaUIsc0JBQUc7QUFDbkIsaUJBQVcsQ0FBQyxPQUFPLENBQUMsVUFBQSxNQUFNO2VBQUksT0FBTyxNQUFNLENBQUMsTUFBTSxDQUFDLEFBQUM7T0FBQSxDQUFDLENBQUE7S0FDdEQ7OztXQUVXLGNBQUMsSUFBSSxFQUFFO0FBQ2pCLFVBQUksT0FBTyxHQUFHLFFBQVEsQ0FBQyxJQUFJLENBQUMsQ0FBQTs7QUFFNUIscUJBQWUsQ0FBQyxRQUFRLEVBQUUsQ0FBQTs7QUFFMUIsVUFBSSxNQUFNLEdBQUcsT0FBTyxDQUFDLElBQUksQ0FBQyxDQUFBOztBQUUxQixxQkFBZSxDQUFDLFVBQVUsRUFBRSxDQUFBOztBQUU1QixhQUFPLE1BQU0sQ0FBQTtLQUNkOzs7V0FFVyxnQkFBRztBQUNiLFVBQUksR0FBRyxHQUFHLElBQUksQ0FBQyxNQUFNLEVBQUUsQ0FBQTtBQUN2QixhQUFPLEdBQUcsQ0FBQyxHQUFHLENBQUMsTUFBTSxHQUFHLENBQUMsQ0FBQyxDQUFBO0tBQzNCOzs7V0FFYSxrQkFBRztBQUNmLGFBQU8sNkJBQUUsV0FBVyxDQUFDLENBQUMsTUFBTSxFQUFFLENBQUE7S0FDL0I7OztXQUVxQiwwQkFBRztBQUN2QixhQUFPLFdBQVcsQ0FBQTtLQUNuQjs7Ozs7Ozs7Ozs7OztPQUVhLFVBQUMsV0FBVyxFQUFvQjtVQUFsQixRQUFRLHlEQUFHLEtBQUs7O0FBQzFDLFVBQUcsV0FBVyxDQUFDLFdBQVcsQ0FBQyxFQUFDO0FBQzFCLGVBQU8sV0FBVyxDQUFDLFdBQVcsQ0FBQyxDQUFBO09BQ2hDOztBQUVELFVBQUksSUFBSSxHQUFHLFlBQVksQ0FBQyxXQUFXLENBQUMsQ0FBQTs7QUFFcEMsVUFBRyxJQUFJLElBQUksV0FBVyxDQUFDLElBQUksQ0FBQyxFQUFDO0FBQzNCLGVBQU8sV0FBVyxDQUFDLElBQUksQ0FBQyxDQUFBO09BQ3pCOztBQUVELFVBQUcsUUFBUSxJQUFJLElBQUksRUFBQztBQUNsQixlQUFPLE1BQU0sQ0FBQyxXQUFXLENBQUMsV0FBVyxDQUFDLFdBQVcsRUFBRSxJQUFJLENBQUMsQ0FBQyxDQUFBO09BQzFEO0tBQ0Y7OztBQUVXLFdBbERPLGVBQWUsR0FrREY7UUFBbkIsSUFBSSx5REFBRyxVQUFVOzswQkFsRFgsZUFBZTs7QUFtRGhDLFFBQUksQ0FBQyxJQUFJLEdBQUcsV0FBVyxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsQ0FBQTtBQUN0QyxRQUFJLENBQUMsVUFBVSxHQUFHLFdBQVcsQ0FBQyxVQUFVLENBQUMsSUFBSSxDQUFDLFdBQVcsRUFBRSxDQUFDLENBQUE7O0FBRTVELFFBQUksQ0FBQyxVQUFVLEdBQUcsRUFBRSxDQUFBO0FBQ3BCLFFBQUksQ0FBQyxRQUFRLEdBQUcsRUFBRSxDQUFBO0FBQ2xCLFFBQUksQ0FBQyxPQUFPLEdBQUcsRUFBRSxDQUFBOzs7QUFHakIsZUFBVyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsR0FBRyxJQUFJLENBQUE7QUFDN0IsZ0JBQVksQ0FBQyxJQUFJLENBQUMsVUFBVSxDQUFDLEdBQUcsSUFBSSxDQUFDLElBQUksQ0FBQTtHQUMxQzs7ZUE3RGtCLGVBQWU7O1dBbUV2Qix1QkFBRTtBQUNYLGFBQU8sTUFBTSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLENBQUE7S0FDakM7OztXQUVvQixpQ0FBRztBQUN0QixVQUFJLFVBQVUsR0FBRyxTQUFiLFVBQVUsR0FBYSxFQUFHLENBQUE7QUFDOUIsVUFBSSxVQUFVLEdBQUcsSUFBSSxDQUFBO0FBQ3JCLFVBQUksY0FBYyxHQUFHLE1BQU0sQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLFVBQVUsQ0FBQyxDQUFBOztBQUVqRCxnQkFBVSxDQUFDLFNBQVMsMEJBQWEsQ0FBQTs7QUFHakMsV0FBSSxJQUFJLElBQUksSUFBSSxjQUFjLEVBQUM7QUFDN0IsWUFBSSxVQUFVLEdBQUcsV0FBVyxDQUFDLFFBQVEsQ0FBQyxVQUFVLEdBQUcsSUFBSSxFQUFFLEtBQUssQ0FBQyxDQUFBO0FBQy9ELGtCQUFVLENBQUMsVUFBVSxDQUFDLEdBQUcsVUFBUyxNQUFNLEVBQUM7QUFDdkMsY0FBSSxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsVUFBQSxLQUFLO21CQUFJLEtBQUssQ0FBQyxJQUFJLENBQUMsSUFBSSxNQUFNO1dBQUEsQ0FBQyxDQUFBO1NBQ2pELENBQUE7T0FDRjs7QUFFRCxhQUFPLFVBQVUsQ0FBQTtLQUNsQjs7O1dBRVcsdUJBQUc7QUFDYixVQUFJLEdBQUcsR0FBRyxTQUFOLEdBQUcsR0FBYSxFQUFHLENBQUE7QUFDdkIsVUFBSSxVQUFVLEdBQUcsSUFBSSxDQUFBOztBQUVyQixTQUFHLENBQUMsU0FBUyxxQkFBUSxDQUFBOztBQUVyQixTQUFHLENBQUMsa0JBQWtCLEdBQUcsWUFBVTtBQUNqQyxlQUFPLFVBQVUsQ0FBQTtPQUNsQixDQUFBOztBQUVELFdBQUksSUFBSSxNQUFNLElBQUksSUFBSSxDQUFDLE9BQU8sRUFBQztBQUM3QixXQUFHLENBQUMsTUFBTSxDQUFDLEdBQUcsWUFBVTtBQUN0QixpQkFBTyxDQUFDLE1BQU0sQ0FBQyxDQUFDLEtBQUssQ0FBQyxHQUFHLEVBQUUsU0FBUyxDQUFDLENBQUE7U0FDdEMsQ0FBQTtPQUNGOztBQUVELGFBQU8sR0FBRyxDQUFBO0tBQ1g7Ozs7Ozs7V0FLYSwwQkFBRztBQUNmLGFBQU8sTUFBTSxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsVUFBVSxDQUFDLENBQUMsR0FBRyxDQUFDLFVBQUEsSUFBSTtlQUFJLElBQUksQ0FBQyxJQUFJO09BQUEsQ0FBQyxDQUFBO0tBQzdEOzs7Ozs7O1dBS1UsdUJBQUc7QUFDWixhQUFPLE1BQU0sQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLFVBQVUsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxVQUFBLElBQUk7ZUFBSSxJQUFJLENBQUMsVUFBVTtPQUFBLENBQUMsQ0FBQTtLQUN0RTs7Ozs7OztXQUtnQiw0QkFBWTs7O1VBQVgsSUFBSSx5REFBRyxFQUFFOztBQUN6QixVQUFJLENBQUMsT0FBTyxDQUFDLFVBQUEsSUFBSSxFQUFJO0FBQ25CLFlBQUcsT0FBTyxJQUFJLEFBQUMsS0FBSyxRQUFRLEVBQzFCLElBQUksR0FBRyxFQUFDLElBQUksRUFBRSxJQUFJLEVBQUMsQ0FBQTs7QUFFckIsY0FBSyxVQUFVLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxHQUFHLElBQUksZUFBZSxDQUFDLElBQUksQ0FBQyxDQUFBO09BQ3ZELENBQUMsQ0FBQTs7QUFFRixhQUFPLElBQUksQ0FBQTtLQUNaOzs7Ozs7Ozs7V0FPYSx1QkFBQyxXQUFXLEVBQWdCO1VBQWQsT0FBTyx5REFBRyxFQUFFOztBQUN0QyxVQUFJLENBQUMsUUFBUSxDQUFDLFdBQVcsQ0FBQyxHQUFHLGtDQUFvQixXQUFXLEVBQUUsSUFBSSxFQUFFLE9BQU8sQ0FBQyxDQUFBO0FBQzVFLGFBQU8sSUFBSSxDQUFDLFFBQVEsQ0FBQyxXQUFXLENBQUMsQ0FBQTtLQUNsQzs7Ozs7Ozs7V0FNWSxzQkFBQyxVQUFVLEVBQUUsT0FBTyxFQUFFO0FBQ2pDLFVBQUksQ0FBQyxPQUFPLENBQUMsVUFBVSxDQUFDLEdBQUcsT0FBTyxDQUFBO0FBQ2xDLGFBQU8sSUFBSSxDQUFBO0tBQ1o7OztXQTFGb0IsMEJBQUU7QUFDckIsYUFBTyxNQUFNLENBQUMsSUFBSSxDQUFDLFlBQVksQ0FBQyxDQUFBO0tBQ2pDOzs7U0FqRWtCLGVBQWU7OztxQkFBZixlQUFlOztBQTRKcEMsU0FBUyxRQUFRLENBQUMsSUFBSSxFQUFFO0FBQ3RCLFNBQU8sZ0JBQUcsWUFBWSxDQUFDLElBQUksQ0FBQyxDQUFDLFFBQVEsRUFBRSxDQUFBO0NBQ3hDIiwiZmlsZSI6Im1vZGVsX2RlZmluaXRpb24uanMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgaW5mbGVjdCBmcm9tICdpJ1xuaW1wb3J0IGZzIGZyb20gJ2ZzJ1xuaW1wb3J0IF8gZnJvbSAndW5kZXJzY29yZSdcbmltcG9ydCBEb2N1bWVudFNlY3Rpb24gZnJvbSAnLi9kb2N1bWVudF9zZWN0aW9uJ1xuaW1wb3J0IE1vZGVsIGZyb20gJy4vbW9kZWwnXG5pbXBvcnQgQ29sbGVjdGlvbiBmcm9tICcuL2NvbGxlY3Rpb24nXG5pbXBvcnQgcmVnaXN0cnkgZnJvbSAnLi9tb2RlbF9yZWdpc3RyeSdcblxuY29uc3QgaW5mbGVjdGlvbnMgPSBpbmZsZWN0KClcblxuY29uc3QgZGVmaW5pdGlvbnMgPSByZWdpc3RyeS5tb2RlbHMgXG5jb25zdCB0eXBlX2FsaWFzZXMgPSByZWdpc3RyeS5hbGlhc2VzIFxuXG5jb25zdCBkc2wgPSB7XG4gIGNsb3NlOiBmdW5jdGlvbigpe1xuICAgIGxldCBjdXJyZW50ID0gTW9kZWxEZWZpbml0aW9uLmxhc3QoKVxuICAgIHJldHVybiBjdXJyZW50LnRvUHJvdG90eXBlKClcbiAgfSxcblxuICBkZWZpbmU6IGZ1bmN0aW9uKCBtb2RlbE5hbWUsIG9wdGlvbnMgPSB7fSApIHtcbiAgICBsZXQgY3VycmVudCA9IGRlZmluaXRpb25zW21vZGVsTmFtZV1cbiAgICBkZWZpbml0aW9uc1ttb2RlbE5hbWVdID0gY3VycmVudCB8fCBuZXcgTW9kZWxEZWZpbml0aW9uKG1vZGVsTmFtZSwgb3B0aW9ucylcblxuICAgIHJldHVybiBjdXJyZW50XG4gIH0sXG5cbiAgYXR0cmlidXRlczogZnVuY3Rpb24gKC4uLmxpc3QpIHtcbiAgICBsZXQgY3VycmVudCA9IE1vZGVsRGVmaW5pdGlvbi5sYXN0KClcbiAgICByZXR1cm4gY3VycmVudC5kZWZpbmVBdHRyaWJ1dGVzKGxpc3QpXG4gIH0sXG5cbiAgYXR0cmlidXRlOiBmdW5jdGlvbihuYW1lKXtcbiAgICBsZXQgY3VycmVudCA9IE1vZGVsRGVmaW5pdGlvbi5sYXN0KClcbiAgICByZXR1cm4gY3VycmVudC5hdHRyaWJ1dGVzW25hbWVdXG4gIH0sXG5cbiAgc2VjdGlvbjogZnVuY3Rpb24gKG5hbWUsIG9wdGlvbnMgPSB7fSkge1xuICAgIGxldCBjdXJyZW50ID0gTW9kZWxEZWZpbml0aW9uLmxhc3QoKVxuICAgIHJldHVybiBjdXJyZW50LmRlZmluZVNlY3Rpb24obmFtZSwgb3B0aW9ucylcbiAgfSxcblxuICBhY3Rpb246IGZ1bmN0aW9uIChuYW1lLCBoYW5kbGVyKSB7XG4gICAgbGV0IGN1cnJlbnQgPSBNb2RlbERlZmluaXRpb24ubGFzdCgpXG4gICAgcmV0dXJuIGN1cnJlbnQuZGVmaW5lQWN0aW9uKG5hbWUsIGhhbmRsZXIpXG4gIH1cbn1cblxuY29uc3QgZHNsX21ldGhvZHMgPSBbXG4gIFwiZGVmaW5lXCIsXG4gIFwiYXR0cmlidXRlc1wiLFxuICBcImF0dHJpYnV0ZVwiLFxuICBcInNlY3Rpb25cIixcbiAgXCJhY3Rpb25cIixcbiAgXCJhY3Rpb25zXCIsXG4gIFwiY2xvc2VcIlxuXVxuXG5cbmNsYXNzIEF0dHJpYnV0ZUNvbmZpZyB7XG4gIGNvbnN0cnVjdG9yKGNvbmZpZyl7XG4gICAgZm9yKHZhciBrZXkgaW4gY29uZmlnKXtcbiAgICAgIHRoaXNba2V5XSA9IGNvbmZpZ1trZXldXG4gICAgfVxuICB9XG5cbiAgZXh0cmFjdChzZWxlY3Rvcil7XG4gICAgdGhpcy5leHRyYWN0aW9uID0gdGhpcy5leHRyYWN0aW9uIHx8IHt9XG4gICAgdGhpcy5leHRyYWN0aW9uLnNlbGVjdG9yID0gc2VsZWN0b3JcbiAgICByZXR1cm4gdGhpc1xuICB9XG59XG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIE1vZGVsRGVmaW5pdGlvbiB7XG4gIHN0YXRpYyBzZXR1cERTTCAoKSB7XG4gICAgZHNsX21ldGhvZHMuZm9yRWFjaChtZXRob2QgPT4gZ2xvYmFsW21ldGhvZF0gPSBkc2xbbWV0aG9kXSkgICAgXG4gIH1cblxuICBzdGF0aWMgY2xlYW51cERTTCAoKSB7XG4gICAgZHNsX21ldGhvZHMuZm9yRWFjaChtZXRob2QgPT4gZGVsZXRlKGdsb2JhbFttZXRob2RdKSlcbiAgfVxuXG4gIHN0YXRpYyBsb2FkIChwYXRoKSB7XG4gICAgbGV0IGNvbnRlbnQgPSByZWFkUGF0aChwYXRoKVxuXG4gICAgTW9kZWxEZWZpbml0aW9uLnNldHVwRFNMKClcblxuICAgIGxldCBsb2FkZWQgPSByZXF1aXJlKHBhdGgpXG5cbiAgICBNb2RlbERlZmluaXRpb24uY2xlYW51cERTTCgpXG5cbiAgICByZXR1cm4gbG9hZGVkXG4gIH1cblxuICBzdGF0aWMgbGFzdCAoKSB7XG4gICAgbGV0IGFsbCA9IHRoaXMuZ2V0QWxsKClcbiAgICByZXR1cm4gYWxsW2FsbC5sZW5ndGggLSAxXVxuICB9XG5cbiAgc3RhdGljIGdldEFsbCAoKSB7XG4gICAgcmV0dXJuIF8oZGVmaW5pdGlvbnMpLnZhbHVlcygpXG4gIH1cblxuICBzdGF0aWMgZ2V0TW9kZWxTY2hlbWEgKCkge1xuICAgIHJldHVybiBkZWZpbml0aW9uc1xuICB9XG5cbiAgc3RhdGljIGxvb2t1cCAoYWxpYXNPck5hbWUsIHNpbmd1bGFyID0gZmFsc2UpIHtcbiAgICBpZihkZWZpbml0aW9uc1thbGlhc09yTmFtZV0pe1xuICAgICAgcmV0dXJuIGRlZmluaXRpb25zW2FsaWFzT3JOYW1lXVxuICAgIH1cbiAgICBcbiAgICBsZXQgbmFtZSA9IHR5cGVfYWxpYXNlc1thbGlhc09yTmFtZV1cbiAgICBcbiAgICBpZihuYW1lICYmIGRlZmluaXRpb25zW25hbWVdKXtcbiAgICAgIHJldHVybiBkZWZpbml0aW9uc1tuYW1lXVxuICAgIH1cblxuICAgIGlmKHNpbmd1bGFyID09IHRydWUpe1xuICAgICAgcmV0dXJuIGxvb2t1cChpbmZsZWN0aW9ucy5zaW5ndWxhcml6ZShhbGlhc09yTmFtZSwgdHJ1ZSkpXG4gICAgfVxuICB9XG5cbiAgY29uc3RydWN0b3IgKG5hbWUgPSBcIkRvY3VtZW50XCIpIHtcbiAgICB0aGlzLm5hbWUgPSBpbmZsZWN0aW9ucy5jYW1lbGl6ZShuYW1lKVxuICAgIHRoaXMudHlwZV9hbGlhcyA9IGluZmxlY3Rpb25zLnVuZGVyc2NvcmUobmFtZS50b0xvd2VyQ2FzZSgpKVxuXG4gICAgdGhpcy5hdHRyaWJ1dGVzID0ge31cbiAgICB0aGlzLnNlY3Rpb25zID0ge31cbiAgICB0aGlzLmFjdGlvbnMgPSB7fVxuXG4gICAgLy9zdG9yZSBhIHJlZmVyZW5jZSBpbiB0aGUgYnVja2V0XG4gICAgZGVmaW5pdGlvbnNbdGhpcy5uYW1lXSA9IHRoaXNcbiAgICB0eXBlX2FsaWFzZXNbdGhpcy50eXBlX2FsaWFzXSA9IHRoaXMubmFtZVxuICB9XG4gIFxuICBzdGF0aWMgZ2V0VHlwZUFsaWFzZXMoKXtcbiAgICByZXR1cm4gT2JqZWN0LmtleXModHlwZV9hbGlhc2VzKVxuICB9XG4gIFxuICBhY3Rpb25OYW1lcygpe1xuICAgIHJldHVybiBPYmplY3Qua2V5cyh0aGlzLmFjdGlvbnMpXG4gIH1cblxuICB0b0NvbGxlY3Rpb25Qcm90b3R5cGUoKSB7XG4gICAgbGV0IGNvbGxlY3Rpb24gPSBmdW5jdGlvbigpeyB9XG4gICAgbGV0IGRlZmluaXRpb24gPSB0aGlzXG4gICAgbGV0IGF0dHJpYnV0ZU5hbWVzID0gT2JqZWN0LmtleXModGhpcy5hdHRyaWJ1dGVzKVxuXG4gICAgY29sbGVjdGlvbi5wcm90b3R5cGUgPSBDb2xsZWN0aW9uXG5cbiAgICBcbiAgICBmb3IodmFyIG5hbWUgaW4gYXR0cmlidXRlTmFtZXMpe1xuICAgICAgbGV0IGZpbmRlck5hbWUgPSBpbmZsZWN0aW9ucy5jYW1lbGl6ZSgnZmluZF9ieV8nICsgbmFtZSwgZmFsc2UpXG4gICAgICBjb2xsZWN0aW9uW2ZpbmRlck5hbWVdID0gZnVuY3Rpb24obmVlZGxlKXtcbiAgICAgICAgdGhpcy5tb2RlbHMuZmluZChtb2RlbCA9PiBtb2RlbFtuYW1lXSA9PSBuZWVkbGUpXG4gICAgICB9XG4gICAgfVxuXG4gICAgcmV0dXJuIGNvbGxlY3Rpb25cbiAgfVxuXG4gIHRvUHJvdG90eXBlICgpIHtcbiAgICBsZXQgb2JqID0gZnVuY3Rpb24oKXsgfVxuICAgIGxldCBkZWZpbml0aW9uID0gdGhpc1xuXG4gICAgb2JqLnByb3RvdHlwZSA9IE1vZGVsXG4gICAgXG4gICAgb2JqLmdldE1vZGVsRGVmaW5pdGlvbiA9IGZ1bmN0aW9uKCl7XG4gICAgICByZXR1cm4gZGVmaW5pdGlvblxuICAgIH1cblxuICAgIGZvcih2YXIgYWN0aW9uIGluIHRoaXMuYWN0aW9ucyl7XG4gICAgICBvYmpbYWN0aW9uXSA9IGZ1bmN0aW9uKCl7XG4gICAgICAgIGFjdGlvbnNbYWN0aW9uXS5hcHBseShvYmosIGFyZ3VtZW50cylcbiAgICAgIH1cbiAgICB9XG5cbiAgICByZXR1cm4gb2JqXG4gIH1cbiAgXG4gIC8qKlxuICAgKiByZXR1cm5zIHRoZSBhdHRyaWJ1dGUgbmFtZXMgYXMgYW4gYXJyYXlcbiAgKi9cbiAgYXR0cmlidXRlTmFtZXMoKSB7XG4gICAgcmV0dXJuIE9iamVjdC52YWx1ZXModGhpcy5hdHRyaWJ1dGVzKS5tYXAoYXR0ciA9PiBhdHRyLm5hbWUpXG4gIH1cbiAgXG4gIC8qKlxuICAgKiByZXR1cm5zIHRoZSBhdHRyaWJ1dGVzIHdoaWNoIGFyZSBjb25maWd1cmVkIGZvciBleHRyYWN0aW9uXG4gICovXG4gIGV4dHJhY3Rpb25zKCkge1xuICAgIHJldHVybiBPYmplY3QudmFsdWVzKHRoaXMuYXR0cmlidXRlcykuZmlsdGVyKGF0dHIgPT4gYXR0ci5leHRyYWN0aW9uKVxuICB9XG5cbiAgLyoqIFxuICAgKiBkZWZpbmVzIGF0dHJpYnV0ZXMgZm9yIHRoZSBtb2RlbCdzIG1ldGFkYXRhXG4gICovXG4gIGRlZmluZUF0dHJpYnV0ZXMgKGxpc3QgPSBbXSkge1xuICAgIGxpc3QuZm9yRWFjaChhdHRyID0+IHtcbiAgICAgIGlmKHR5cGVvZihhdHRyKSA9PT0gXCJzdHJpbmdcIilcbiAgICAgICAgYXR0ciA9IHtuYW1lOiBhdHRyfVxuICAgICAgXG4gICAgICB0aGlzLmF0dHJpYnV0ZXNbYXR0ci5uYW1lXSA9IG5ldyBBdHRyaWJ1dGVDb25maWcoYXR0cilcbiAgICB9KVxuXG4gICAgcmV0dXJuIHRoaXNcbiAgfVxuICBcbiAgLyoqXG4gICAqIGRlZmluZXMgYSBzZWN0aW9uIGZvciB0aGUgbW9kZWwuIGEgc2VjdGlvbiB3aWxsIGJlXG4gICAqIGJ1aWx0IGZyb20gdGhlIHdyaXR0ZW4gY29udGVudCBvZiB0aGUgZG9jdW1lbnQuIHNlY3Rpb25zXG4gICAqIGNvbnNpc3Qgb2YgaGVhZGluZ3MgbmVzdGVkIHdpdGhpbiBoZWFkaW5ncy5cbiAgKi9cbiAgZGVmaW5lU2VjdGlvbiAoc2VjdGlvbk5hbWUsIG9wdGlvbnMgPSB7fSkge1xuICAgIHRoaXMuc2VjdGlvbnNbc2VjdGlvbk5hbWVdID0gbmV3IERvY3VtZW50U2VjdGlvbihzZWN0aW9uTmFtZSwgdGhpcywgb3B0aW9ucylcbiAgICByZXR1cm4gdGhpcy5zZWN0aW9uc1tzZWN0aW9uTmFtZV1cbiAgfVxuXG4gIC8qKlxuICAgKiBkZWZpbmVzIGFuIGFjdGlvbiBmb3IgdGhpcyBtb2RlbC4gYW4gYWN0aW9uIGNhbiBiZSBkaXNwYXRjaGVkIGZyb21cbiAgICogdGhlIGNvbW1hbmQgbGluZSwgYW5kIHJ1biBvbiBhcmJpdHJhcnkgcGF0aHMuXG4gICovXG4gIGRlZmluZUFjdGlvbiAoYWN0aW9uTmFtZSwgaGFuZGxlcikge1xuICAgIHRoaXMuYWN0aW9uc1thY3Rpb25OYW1lXSA9IGhhbmRsZXJcbiAgICByZXR1cm4gdGhpc1xuICB9XG59XG5cbmZ1bmN0aW9uIHJlYWRQYXRoKHBhdGgpIHtcbiAgcmV0dXJuIGZzLnJlYWRGaWxlU3luYyhwYXRoKS50b1N0cmluZygpXG59XG4iXX0=