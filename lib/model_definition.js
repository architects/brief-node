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

var inflections = (0, _i2['default'])();

var definitions = {};
var type_aliases = {};

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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3NyYy9tb2RlbF9kZWZpbml0aW9uLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7OztpQkFBb0IsR0FBRzs7OztrQkFDUixJQUFJOzs7OzBCQUNMLFlBQVk7Ozs7Z0NBQ0Usb0JBQW9COzs7O3FCQUM5QixTQUFTOzs7OzBCQUNKLGNBQWM7Ozs7QUFFckMsSUFBTSxXQUFXLEdBQUcscUJBQVMsQ0FBQTs7QUFFN0IsSUFBTSxXQUFXLEdBQUcsRUFBRSxDQUFBO0FBQ3RCLElBQU0sWUFBWSxHQUFHLEVBQUUsQ0FBQTs7QUFFdkIsSUFBTSxHQUFHLEdBQUc7QUFDVixPQUFLLEVBQUUsaUJBQVU7QUFDZixRQUFJLE9BQU8sR0FBRyxlQUFlLENBQUMsSUFBSSxFQUFFLENBQUE7QUFDcEMsV0FBTyxPQUFPLENBQUMsV0FBVyxFQUFFLENBQUE7R0FDN0I7O0FBRUQsUUFBTSxFQUFFLGdCQUFVLFNBQVMsRUFBaUI7UUFBZixPQUFPLHlEQUFHLEVBQUU7O0FBQ3ZDLFFBQUksT0FBTyxHQUFHLFdBQVcsQ0FBQyxTQUFTLENBQUMsQ0FBQTtBQUNwQyxlQUFXLENBQUMsU0FBUyxDQUFDLEdBQUcsT0FBTyxJQUFJLElBQUksZUFBZSxDQUFDLFNBQVMsRUFBRSxPQUFPLENBQUMsQ0FBQTs7QUFFM0UsV0FBTyxPQUFPLENBQUE7R0FDZjs7QUFFRCxZQUFVLEVBQUUsc0JBQW1CO0FBQzdCLFFBQUksT0FBTyxHQUFHLGVBQWUsQ0FBQyxJQUFJLEVBQUUsQ0FBQTs7c0NBRGIsSUFBSTtBQUFKLFVBQUk7OztBQUUzQixXQUFPLE9BQU8sQ0FBQyxnQkFBZ0IsQ0FBQyxJQUFJLENBQUMsQ0FBQTtHQUN0Qzs7QUFFRCxXQUFTLEVBQUUsbUJBQVMsSUFBSSxFQUFDO0FBQ3ZCLFFBQUksT0FBTyxHQUFHLGVBQWUsQ0FBQyxJQUFJLEVBQUUsQ0FBQTtBQUNwQyxXQUFPLE9BQU8sQ0FBQyxVQUFVLENBQUMsSUFBSSxDQUFDLENBQUE7R0FDaEM7O0FBRUQsU0FBTyxF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ZUFBZSxDQUFDLElBQUksQ0FBQyxDQUFBO09BQ3ZELENBQUMsQ0FBQTs7QUFFRixhQUFPLElBQUksQ0FBQTtLQUNaOzs7Ozs7Ozs7V0FPYSx1QkFBQyxXQUFXLEVBQWdCO1VBQWQsT0FBTyx5REFBRyxFQUFFOztBQUN0QyxVQUFJLENBQUMsUUFBUSxDQUFDLFdBQVcsQ0FBQyxHQUFHLGtDQUFvQixXQUFXLEVBQUUsSUFBSSxFQUFFLE9BQU8sQ0FBQyxDQUFBO0FBQzVFLGFBQU8sSUFBSSxDQUFDLFFBQVEsQ0FBQyxXQUFXLENBQUMsQ0FBQTtLQUNsQzs7Ozs7Ozs7V0FNWSxzQkFBQyxVQUFVLEVBQUUsT0FBTyxFQUFFO0FBQ2pDLFVBQUksQ0FBQyxPQUFPLENBQUMsVUFBVSxDQUFDLEdBQUcsT0FBTyxDQUFBO0FBQ2xDLGFBQU8sSUFBSSxDQUFBO0tBQ1o7OztXQXRGb0IsMEJBQUU7QUFDckIsYUFBTyxNQUFNLENBQUMsSUFBSSxDQUFDLFlBQVksQ0FBQyxDQUFBO0tBQ2pDOzs7U0FqRWtCLGVBQWU7OztxQkFBZixlQUFlOztBQXdKcEMsU0FBUyxRQUFRLENBQUMsSUFBSSxFQUFFO0FBQ3RCLFNBQU8sZ0JBQUcsWUFBWSxDQUFDLElBQUksQ0FBQyxDQUFDLFFBQVEsRUFBRSxDQUFBO0NBQ3hDIiwiZmlsZSI6Im1vZGVsX2RlZmluaXRpb24uanMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgaW5mbGVjdCBmcm9tICdpJ1xuaW1wb3J0IGZzIGZyb20gJ2ZzJ1xuaW1wb3J0IF8gZnJvbSAndW5kZXJzY29yZSdcbmltcG9ydCBEb2N1bWVudFNlY3Rpb24gZnJvbSAnLi9kb2N1bWVudF9zZWN0aW9uJ1xuaW1wb3J0IE1vZGVsIGZyb20gJy4vbW9kZWwnXG5pbXBvcnQgQ29sbGVjdGlvbiBmcm9tICcuL2NvbGxlY3Rpb24nXG5cbmNvbnN0IGluZmxlY3Rpb25zID0gaW5mbGVjdCgpXG5cbmNvbnN0IGRlZmluaXRpb25zID0ge31cbmNvbnN0IHR5cGVfYWxpYXNlcyA9IHt9XG5cbmNvbnN0IGRzbCA9IHtcbiAgY2xvc2U6IGZ1bmN0aW9uKCl7XG4gICAgbGV0IGN1cnJlbnQgPSBNb2RlbERlZmluaXRpb24ubGFzdCgpXG4gICAgcmV0dXJuIGN1cnJlbnQudG9Qcm90b3R5cGUoKVxuICB9LFxuXG4gIGRlZmluZTogZnVuY3Rpb24oIG1vZGVsTmFtZSwgb3B0aW9ucyA9IHt9ICkge1xuICAgIGxldCBjdXJyZW50ID0gZGVmaW5pdGlvbnNbbW9kZWxOYW1lXVxuICAgIGRlZmluaXRpb25zW21vZGVsTmFtZV0gPSBjdXJyZW50IHx8IG5ldyBNb2RlbERlZmluaXRpb24obW9kZWxOYW1lLCBvcHRpb25zKVxuXG4gICAgcmV0dXJuIGN1cnJlbnRcbiAgfSxcblxuICBhdHRyaWJ1dGVzOiBmdW5jdGlvbiAoLi4ubGlzdCkge1xuICAgIGxldCBjdXJyZW50ID0gTW9kZWxEZWZpbml0aW9uLmxhc3QoKVxuICAgIHJldHVybiBjdXJyZW50LmRlZmluZUF0dHJpYnV0ZXMobGlzdClcbiAgfSxcblxuICBhdHRyaWJ1dGU6IGZ1bmN0aW9uKG5hbWUpe1xuICAgIGxldCBjdXJyZW50ID0gTW9kZWxEZWZpbml0aW9uLmxhc3QoKVxuICAgIHJldHVybiBjdXJyZW50LmF0dHJpYnV0ZXNbbmFtZV1cbiAgfSxcblxuICBzZWN0aW9uOiBmdW5jdGlvbiAobmFtZSwgb3B0aW9ucyA9IHt9KSB7XG4gICAgbGV0IGN1cnJlbnQgPSBNb2RlbERlZmluaXRpb24ubGFzdCgpXG4gICAgcmV0dXJuIGN1cnJlbnQuZGVmaW5lU2VjdGlvbihuYW1lLCBvcHRpb25zKVxuICB9LFxuXG4gIGFjdGlvbjogZnVuY3Rpb24gKG5hbWUsIGhhbmRsZXIpIHtcbiAgICBsZXQgY3VycmVudCA9IE1vZGVsRGVmaW5pdGlvbi5sYXN0KClcbiAgICByZXR1cm4gY3VycmVudC5kZWZpbmVBY3Rpb24obmFtZSwgaGFuZGxlcilcbiAgfVxufVxuXG5jb25zdCBkc2xfbWV0aG9kcyA9IFtcbiAgXCJkZWZpbmVcIixcbiAgXCJhdHRyaWJ1dGVzXCIsXG4gIFwiYXR0cmlidXRlXCIsXG4gIFwic2VjdGlvblwiLFxuICBcImFjdGlvblwiLFxuICBcImFjdGlvbnNcIixcbiAgXCJjbG9zZVwiXG5dXG5cblxuY2xhc3MgQXR0cmlidXRlQ29uZmlnIHtcbiAgY29uc3RydWN0b3IoY29uZmlnKXtcbiAgICBmb3IodmFyIGtleSBpbiBjb25maWcpe1xuICAgICAgdGhpc1trZXldID0gY29uZmlnW2tleV1cbiAgICB9XG4gIH1cblxuICBleHRyYWN0KHNlbGVjdG9yKXtcbiAgICB0aGlzLmV4dHJhY3Rpb24gPSB0aGlzLmV4dHJhY3Rpb24gfHwge31cbiAgICB0aGlzLmV4dHJhY3Rpb24uc2VsZWN0b3IgPSBzZWxlY3RvclxuICAgIHJldHVybiB0aGlzXG4gIH1cbn1cblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgTW9kZWxEZWZpbml0aW9uIHtcbiAgc3RhdGljIHNldHVwRFNMICgpIHtcbiAgICBkc2xfbWV0aG9kcy5mb3JFYWNoKG1ldGhvZCA9PiBnbG9iYWxbbWV0aG9kXSA9IGRzbFttZXRob2RdKSAgICBcbiAgfVxuXG4gIHN0YXRpYyBjbGVhbnVwRFNMICgpIHtcbiAgICBkc2xfbWV0aG9kcy5mb3JFYWNoKG1ldGhvZCA9PiBkZWxldGUoZ2xvYmFsW21ldGhvZF0pKVxuICB9XG5cbiAgc3RhdGljIGxvYWQgKHBhdGgpIHtcbiAgICBsZXQgY29udGVudCA9IHJlYWRQYXRoKHBhdGgpXG5cbiAgICBNb2RlbERlZmluaXRpb24uc2V0dXBEU0woKVxuXG4gICAgbGV0IGxvYWRlZCA9IHJlcXVpcmUocGF0aClcblxuICAgIE1vZGVsRGVmaW5pdGlvbi5jbGVhbnVwRFNMKClcblxuICAgIHJldHVybiBsb2FkZWRcbiAgfVxuXG4gIHN0YXRpYyBsYXN0ICgpIHtcbiAgICBsZXQgYWxsID0gdGhpcy5nZXRBbGwoKVxuICAgIHJldHVybiBhbGxbYWxsLmxlbmd0aCAtIDFdXG4gIH1cblxuICBzdGF0aWMgZ2V0QWxsICgpIHtcbiAgICByZXR1cm4gXyhkZWZpbml0aW9ucykudmFsdWVzKClcbiAgfVxuXG4gIHN0YXRpYyBnZXRNb2RlbFNjaGVtYSAoKSB7XG4gICAgcmV0dXJuIGRlZmluaXRpb25zXG4gIH1cblxuICBzdGF0aWMgbG9va3VwIChhbGlhc09yTmFtZSwgc2luZ3VsYXIgPSBmYWxzZSkge1xuICAgIGlmKGRlZmluaXRpb25zW2FsaWFzT3JOYW1lXSl7XG4gICAgICByZXR1cm4gZGVmaW5pdGlvbnNbYWxpYXNPck5hbWVdXG4gICAgfVxuICAgIFxuICAgIGxldCBuYW1lID0gdHlwZV9hbGlhc2VzW2FsaWFzT3JOYW1lXVxuICAgIFxuICAgIGlmKG5hbWUgJiYgZGVmaW5pdGlvbnNbbmFtZV0pe1xuICAgICAgcmV0dXJuIGRlZmluaXRpb25zW25hbWVdXG4gICAgfVxuXG4gICAgaWYoc2luZ3VsYXIgPT0gdHJ1ZSl7XG4gICAgICByZXR1cm4gbG9va3VwKGluZmxlY3Rpb25zLnNpbmd1bGFyaXplKGFsaWFzT3JOYW1lLCB0cnVlKSlcbiAgICB9XG4gIH1cblxuICBjb25zdHJ1Y3RvciAobmFtZSA9IFwiRG9jdW1lbnRcIikge1xuICAgIHRoaXMubmFtZSA9IGluZmxlY3Rpb25zLmNhbWVsaXplKG5hbWUpXG4gICAgdGhpcy50eXBlX2FsaWFzID0gaW5mbGVjdGlvbnMudW5kZXJzY29yZShuYW1lLnRvTG93ZXJDYXNlKCkpXG5cbiAgICB0aGlzLmF0dHJpYnV0ZXMgPSB7fVxuICAgIHRoaXMuc2VjdGlvbnMgPSB7fVxuICAgIHRoaXMuYWN0aW9ucyA9IHt9XG5cbiAgICAvL3N0b3JlIGEgcmVmZXJlbmNlIGluIHRoZSBidWNrZXRcbiAgICBkZWZpbml0aW9uc1t0aGlzLm5hbWVdID0gdGhpc1xuICAgIHR5cGVfYWxpYXNlc1t0aGlzLnR5cGVfYWxpYXNdID0gdGhpcy5uYW1lXG4gIH1cbiAgXG4gIHN0YXRpYyBnZXRUeXBlQWxpYXNlcygpe1xuICAgIHJldHVybiBPYmplY3Qua2V5cyh0eXBlX2FsaWFzZXMpXG4gIH1cbiAgXG4gIHRvQ29sbGVjdGlvblByb3RvdHlwZSgpIHtcbiAgICBsZXQgY29sbGVjdGlvbiA9IGZ1bmN0aW9uKCl7IH1cbiAgICBsZXQgZGVmaW5pdGlvbiA9IHRoaXNcbiAgICBsZXQgYXR0cmlidXRlTmFtZXMgPSBPYmplY3Qua2V5cyh0aGlzLmF0dHJpYnV0ZXMpXG5cbiAgICBjb2xsZWN0aW9uLnByb3RvdHlwZSA9IENvbGxlY3Rpb25cblxuICAgIFxuICAgIGZvcih2YXIgbmFtZSBpbiBhdHRyaWJ1dGVOYW1lcyl7XG4gICAgICBsZXQgZmluZGVyTmFtZSA9IGluZmxlY3Rpb25zLmNhbWVsaXplKCdmaW5kX2J5XycgKyBuYW1lLCBmYWxzZSlcbiAgICAgIGNvbGxlY3Rpb25bZmluZGVyTmFtZV0gPSBmdW5jdGlvbihuZWVkbGUpe1xuICAgICAgICB0aGlzLm1vZGVscy5maW5kKG1vZGVsID0+IG1vZGVsW25hbWVdID09IG5lZWRsZSlcbiAgICAgIH1cbiAgICB9XG5cbiAgICByZXR1cm4gY29sbGVjdGlvblxuICB9XG5cbiAgdG9Qcm90b3R5cGUgKCkge1xuICAgIGxldCBvYmogPSBmdW5jdGlvbigpeyB9XG4gICAgbGV0IGRlZmluaXRpb24gPSB0aGlzXG5cbiAgICBvYmoucHJvdG90eXBlID0gTW9kZWxcbiAgICBcbiAgICBvYmouZ2V0TW9kZWxEZWZpbml0aW9uID0gZnVuY3Rpb24oKXtcbiAgICAgIHJldHVybiBkZWZpbml0aW9uXG4gICAgfVxuXG4gICAgZm9yKHZhciBhY3Rpb24gaW4gdGhpcy5hY3Rpb25zKXtcbiAgICAgIG9ialthY3Rpb25dID0gZnVuY3Rpb24oKXtcbiAgICAgICAgYWN0aW9uc1thY3Rpb25dLmFwcGx5KG9iaiwgYXJndW1lbnRzKVxuICAgICAgfVxuICAgIH1cblxuICAgIHJldHVybiBvYmpcbiAgfVxuICBcbiAgLyoqXG4gICAqIHJldHVybnMgdGhlIGF0dHJpYnV0ZSBuYW1lcyBhcyBhbiBhcnJheVxuICAqL1xuICBhdHRyaWJ1dGVOYW1lcygpIHtcbiAgICByZXR1cm4gT2JqZWN0LnZhbHVlcyh0aGlzLmF0dHJpYnV0ZXMpLm1hcChhdHRyID0+IGF0dHIubmFtZSlcbiAgfVxuICBcbiAgLyoqXG4gICAqIHJldHVybnMgdGhlIGF0dHJpYnV0ZXMgd2hpY2ggYXJlIGNvbmZpZ3VyZWQgZm9yIGV4dHJhY3Rpb25cbiAgKi9cbiAgZXh0cmFjdGlvbnMoKSB7XG4gICAgcmV0dXJuIE9iamVjdC52YWx1ZXModGhpcy5hdHRyaWJ1dGVzKS5maWx0ZXIoYXR0ciA9PiBhdHRyLmV4dHJhY3Rpb24pXG4gIH1cblxuICAvKiogXG4gICAqIGRlZmluZXMgYXR0cmlidXRlcyBmb3IgdGhlIG1vZGVsJ3MgbWV0YWRhdGFcbiAgKi9cbiAgZGVmaW5lQXR0cmlidXRlcyAobGlzdCA9IFtdKSB7XG4gICAgbGlzdC5mb3JFYWNoKGF0dHIgPT4ge1xuICAgICAgaWYodHlwZW9mKGF0dHIpID09PSBcInN0cmluZ1wiKVxuICAgICAgICBhdHRyID0ge25hbWU6IGF0dHJ9XG4gICAgICBcbiAgICAgIHRoaXMuYXR0cmlidXRlc1thdHRyLm5hbWVdID0gbmV3IEF0dHJpYnV0ZUNvbmZpZyhhdHRyKVxuICAgIH0pXG5cbiAgICByZXR1cm4gdGhpc1xuICB9XG4gIFxuICAvKipcbiAgICogZGVmaW5lcyBhIHNlY3Rpb24gZm9yIHRoZSBtb2RlbC4gYSBzZWN0aW9uIHdpbGwgYmVcbiAgICogYnVpbHQgZnJvbSB0aGUgd3JpdHRlbiBjb250ZW50IG9mIHRoZSBkb2N1bWVudC4gc2VjdGlvbnNcbiAgICogY29uc2lzdCBvZiBoZWFkaW5ncyBuZXN0ZWQgd2l0aGluIGhlYWRpbmdzLlxuICAqL1xuICBkZWZpbmVTZWN0aW9uIChzZWN0aW9uTmFtZSwgb3B0aW9ucyA9IHt9KSB7XG4gICAgdGhpcy5zZWN0aW9uc1tzZWN0aW9uTmFtZV0gPSBuZXcgRG9jdW1lbnRTZWN0aW9uKHNlY3Rpb25OYW1lLCB0aGlzLCBvcHRpb25zKVxuICAgIHJldHVybiB0aGlzLnNlY3Rpb25zW3NlY3Rpb25OYW1lXVxuICB9XG5cbiAgLyoqXG4gICAqIGRlZmluZXMgYW4gYWN0aW9uIGZvciB0aGlzIG1vZGVsLiBhbiBhY3Rpb24gY2FuIGJlIGRpc3BhdGNoZWQgZnJvbVxuICAgKiB0aGUgY29tbWFuZCBsaW5lLCBhbmQgcnVuIG9uIGFyYml0cmFyeSBwYXRocy5cbiAgKi9cbiAgZGVmaW5lQWN0aW9uIChhY3Rpb25OYW1lLCBoYW5kbGVyKSB7XG4gICAgdGhpcy5hY3Rpb25zW2FjdGlvbk5hbWVdID0gaGFuZGxlclxuICAgIHJldHVybiB0aGlzXG4gIH1cbn1cblxuZnVuY3Rpb24gcmVhZFBhdGgocGF0aCkge1xuICByZXR1cm4gZnMucmVhZEZpbGVTeW5jKHBhdGgpLnRvU3RyaW5nKClcbn1cbiJdfQ==