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

      if (name && definitions[name]) return definitions[name];

      if (singular == true) return lookup(inflections.singularize(aliasOrName, true));
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3NyYy9tb2RlbF9kZWZpbml0aW9uLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7OztpQkFBb0IsR0FBRzs7OztrQkFDUixJQUFJOzs7OzBCQUNMLFlBQVk7Ozs7Z0NBQ0Usb0JBQW9COzs7O3FCQUM5QixTQUFTOzs7O0FBRTNCLElBQU0sV0FBVyxHQUFHLHFCQUFTLENBQUE7O0FBRTdCLElBQU0sV0FBVyxHQUFHLEVBQUUsQ0FBQTtBQUN0QixJQUFNLFlBQVksR0FBRyxFQUFFLENBQUE7O0FBRXZCLElBQU0sR0FBRyxHQUFHO0FBQ1YsT0FBSyxFQUFFLGlCQUFVO0FBQ2YsUUFBSSxPQUFPLEdBQUcsZUFBZSxDQUFDLElBQUksRUFBRSxDQUFBO0FBQ3BDLFdBQU8sT0FBTyxDQUFDLFdBQVcsRUFBRSxDQUFBO0dBQzdCOztBQUVELFFBQU0sRUFBRSxnQkFBVSxTQUFTLEVBQWlCO1FBQWYsT0FBTyx5REFBRyxFQUFFOztBQUN2QyxRQUFJLE9BQU8sR0FBRyxXQUFXLENBQUMsU0FBUyxDQUFDLENBQUE7QUFDcEMsZUFBVyxDQUFDLFNBQVMsQ0FBQyxHQUFHLE9BQU8sSUFBSSxJQUFJLGVBQWUsQ0FBQyxTQUFTLEVBQUUsT0FBTyxDQUFDLENBQUE7O0FBRTNFLFdBQU8sT0FBTyxDQUFBO0dBQ2Y7O0FBRUQsWUFBVSxFQUFFLHNCQUFtQjtBQUM3QixRQUFJLE9BQU8sR0FBRyxlQUFlLENBQUMsSUFBSSxFQUFFLENBQUE7O3NDQURiLElBQUk7QUFBSixVQUFJOzs7QUFFM0IsV0FBTyxPQUFPLENBQUMsZ0JBQWdCLENBQUMsSUFBSSxDQUFDLENBQUE7R0FDdEM7O0FBRUQsV0FBUyxFQUFFLG1CQUFTLElBQUksRUFBQztBQUN2QixRQUFJLE9BQU8sR0FBRyxlQUFlLENBQUMsSUFBSSxFQUFFLENBQUE7QUFDcEMsV0FBTyxPQUFPLENBQUMsVUFBVSxDQUFDLElBQUksQ0FBQyxDQUFBO0dBQ2hDOztBQUVELFNBQU8sRUFBRSxpQkFBVSxJQUFJ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SUFBSSxDQUFDLENBQUMsUUFBUSxFQUFFLENBQUE7Q0FDeEMiLCJmaWxlIjoibW9kZWxfZGVmaW5pdGlvbi5qcyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCBpbmZsZWN0IGZyb20gJ2knXG5pbXBvcnQgZnMgZnJvbSAnZnMnXG5pbXBvcnQgXyBmcm9tICd1bmRlcnNjb3JlJ1xuaW1wb3J0IERvY3VtZW50U2VjdGlvbiBmcm9tICcuL2RvY3VtZW50X3NlY3Rpb24nXG5pbXBvcnQgTW9kZWwgZnJvbSAnLi9tb2RlbCdcblxuY29uc3QgaW5mbGVjdGlvbnMgPSBpbmZsZWN0KClcblxuY29uc3QgZGVmaW5pdGlvbnMgPSB7fVxuY29uc3QgdHlwZV9hbGlhc2VzID0ge31cblxuY29uc3QgZHNsID0ge1xuICBjbG9zZTogZnVuY3Rpb24oKXtcbiAgICBsZXQgY3VycmVudCA9IE1vZGVsRGVmaW5pdGlvbi5sYXN0KClcbiAgICByZXR1cm4gY3VycmVudC50b1Byb3RvdHlwZSgpXG4gIH0sXG5cbiAgZGVmaW5lOiBmdW5jdGlvbiggbW9kZWxOYW1lLCBvcHRpb25zID0ge30gKSB7XG4gICAgbGV0IGN1cnJlbnQgPSBkZWZpbml0aW9uc1ttb2RlbE5hbWVdXG4gICAgZGVmaW5pdGlvbnNbbW9kZWxOYW1lXSA9IGN1cnJlbnQgfHwgbmV3IE1vZGVsRGVmaW5pdGlvbihtb2RlbE5hbWUsIG9wdGlvbnMpXG5cbiAgICByZXR1cm4gY3VycmVudFxuICB9LFxuXG4gIGF0dHJpYnV0ZXM6IGZ1bmN0aW9uICguLi5saXN0KSB7XG4gICAgbGV0IGN1cnJlbnQgPSBNb2RlbERlZmluaXRpb24ubGFzdCgpXG4gICAgcmV0dXJuIGN1cnJlbnQuZGVmaW5lQXR0cmlidXRlcyhsaXN0KVxuICB9LFxuXG4gIGF0dHJpYnV0ZTogZnVuY3Rpb24obmFtZSl7XG4gICAgbGV0IGN1cnJlbnQgPSBNb2RlbERlZmluaXRpb24ubGFzdCgpXG4gICAgcmV0dXJuIGN1cnJlbnQuYXR0cmlidXRlc1tuYW1lXVxuICB9LFxuXG4gIHNlY3Rpb246IGZ1bmN0aW9uIChuYW1lLCBvcHRpb25zID0ge30pIHtcbiAgICBsZXQgY3VycmVudCA9IE1vZGVsRGVmaW5pdGlvbi5sYXN0KClcbiAgICByZXR1cm4gY3VycmVudC5kZWZpbmVTZWN0aW9uKG5hbWUsIG9wdGlvbnMpXG4gIH0sXG5cbiAgYWN0aW9uOiBmdW5jdGlvbiAobmFtZSwgaGFuZGxlcikge1xuICAgIGxldCBjdXJyZW50ID0gTW9kZWxEZWZpbml0aW9uLmxhc3QoKVxuICAgIHJldHVybiBjdXJyZW50LmRlZmluZUFjdGlvbihuYW1lLCBoYW5kbGVyKVxuICB9XG59XG5cbmNvbnN0IGRzbF9tZXRob2RzID0gW1xuICBcImRlZmluZVwiLFxuICBcImF0dHJpYnV0ZXNcIixcbiAgXCJhdHRyaWJ1dGVcIixcbiAgXCJzZWN0aW9uXCIsXG4gIFwiYWN0aW9uXCIsXG4gIFwiYWN0aW9uc1wiLFxuICBcImNsb3NlXCJcbl1cblxuXG5jbGFzcyBBdHRyaWJ1dGVDb25maWcge1xuICBjb25zdHJ1Y3Rvcihjb25maWcpe1xuICAgIGZvcih2YXIga2V5IGluIGNvbmZpZyl7XG4gICAgICB0aGlzW2tleV0gPSBjb25maWdba2V5XVxuICAgIH1cbiAgfVxuXG4gIGV4dHJhY3Qoc2VsZWN0b3Ipe1xuICAgIHRoaXMuZXh0cmFjdGlvbiA9IHRoaXMuZXh0cmFjdGlvbiB8fCB7fVxuICAgIHRoaXMuZXh0cmFjdGlvbi5zZWxlY3RvciA9IHNlbGVjdG9yXG4gICAgcmV0dXJuIHRoaXNcbiAgfVxufVxuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBNb2RlbERlZmluaXRpb24ge1xuICBzdGF0aWMgc2V0dXBEU0wgKCkge1xuICAgIGRzbF9tZXRob2RzLmZvckVhY2gobWV0aG9kID0+IGdsb2JhbFttZXRob2RdID0gZHNsW21ldGhvZF0pICAgIFxuICB9XG5cbiAgc3RhdGljIGNsZWFudXBEU0wgKCkge1xuICAgIGRzbF9tZXRob2RzLmZvckVhY2gobWV0aG9kID0+IGRlbGV0ZShnbG9iYWxbbWV0aG9kXSkpXG4gIH1cblxuICBzdGF0aWMgbG9hZCAocGF0aCkge1xuICAgIGxldCBjb250ZW50ID0gcmVhZFBhdGgocGF0aClcblxuICAgIE1vZGVsRGVmaW5pdGlvbi5zZXR1cERTTCgpXG5cbiAgICBsZXQgbG9hZGVkID0gcmVxdWlyZShwYXRoKVxuXG4gICAgTW9kZWxEZWZpbml0aW9uLmNsZWFudXBEU0woKVxuXG4gICAgcmV0dXJuIGxvYWRlZFxuICB9XG5cbiAgc3RhdGljIGxhc3QgKCkge1xuICAgIGxldCBhbGwgPSB0aGlzLmdldEFsbCgpXG4gICAgcmV0dXJuIGFsbFthbGwubGVuZ3RoIC0gMV1cbiAgfVxuXG4gIHN0YXRpYyBnZXRBbGwgKCkge1xuICAgIHJldHVybiBfKGRlZmluaXRpb25zKS52YWx1ZXMoKVxuICB9XG5cbiAgc3RhdGljIGdldE1vZGVsU2NoZW1hICgpIHtcbiAgICByZXR1cm4gZGVmaW5pdGlvbnNcbiAgfVxuXG4gIHN0YXRpYyBsb29rdXAgKGFsaWFzT3JOYW1lLCBzaW5ndWxhciA9IGZhbHNlKSB7XG4gICAgaWYoZGVmaW5pdGlvbnNbYWxpYXNPck5hbWVdKXtcbiAgICAgIHJldHVybiBkZWZpbml0aW9uc1thbGlhc09yTmFtZV1cbiAgICB9XG4gICAgXG4gICAgbGV0IG5hbWUgPSB0eXBlX2FsaWFzZXNbYWxpYXNPck5hbWVdXG4gICAgXG4gICAgaWYobmFtZSAmJiBkZWZpbml0aW9uc1tuYW1lXSlcbiAgICAgIHJldHVybiBkZWZpbml0aW9uc1tuYW1lXVxuXG4gICAgaWYoc2luZ3VsYXIgPT0gdHJ1ZSlcbiAgICAgIHJldHVybiBsb29rdXAoaW5mbGVjdGlvbnMuc2luZ3VsYXJpemUoYWxpYXNPck5hbWUsIHRydWUpKVxuICB9XG5cbiAgY29uc3RydWN0b3IgKG5hbWUgPSBcIkRvY3VtZW50XCIpIHtcbiAgICB0aGlzLm5hbWUgPSBpbmZsZWN0aW9ucy5jYW1lbGl6ZShuYW1lKVxuICAgIHRoaXMudHlwZV9hbGlhcyA9IGluZmxlY3Rpb25zLnVuZGVyc2NvcmUobmFtZS50b0xvd2VyQ2FzZSgpKVxuXG4gICAgdGhpcy5hdHRyaWJ1dGVzID0ge31cbiAgICB0aGlzLnNlY3Rpb25zID0ge31cbiAgICB0aGlzLmFjdGlvbnMgPSB7fVxuXG4gICAgLy9zdG9yZSBhIHJlZmVyZW5jZSBpbiB0aGUgYnVja2V0XG4gICAgZGVmaW5pdGlvbnNbdGhpcy5uYW1lXSA9IHRoaXNcbiAgICB0eXBlX2FsaWFzZXNbdGhpcy50eXBlX2FsaWFzXSA9IHRoaXMubmFtZVxuICB9XG4gIFxuICBzdGF0aWMgZ2V0VHlwZUFsaWFzZXMoKXtcbiAgICByZXR1cm4gT2JqZWN0LmtleXModHlwZV9hbGlhc2VzKVxuICB9XG5cbiAgdG9Qcm90b3R5cGUgKCkge1xuICAgIGxldCBvYmogPSBmdW5jdGlvbigpeyB9XG4gICAgbGV0IGRlZmluaXRpb24gPSB0aGlzXG5cbiAgICBvYmoucHJvdG90eXBlID0gTW9kZWxcbiAgICBcbiAgICBvYmouZ2V0TW9kZWxEZWZpbml0aW9uID0gZnVuY3Rpb24oKXtcbiAgICAgIHJldHVybiBkZWZpbml0aW9uXG4gICAgfVxuXG4gICAgZm9yKHZhciBhY3Rpb24gaW4gdGhpcy5hY3Rpb25zKXtcbiAgICAgIG9ialthY3Rpb25dID0gZnVuY3Rpb24oKXtcbiAgICAgICAgYWN0aW9uc1thY3Rpb25dLmFwcGx5KG9iaiwgYXJndW1lbnRzKVxuICAgICAgfVxuICAgIH1cblxuICAgIHJldHVybiBvYmpcbiAgfVxuICBcbiAgLyoqXG4gICAqIHJldHVybnMgdGhlIGF0dHJpYnV0ZSBuYW1lcyBhcyBhbiBhcnJheVxuICAqL1xuICBhdHRyaWJ1dGVOYW1lcygpIHtcbiAgICByZXR1cm4gT2JqZWN0LnZhbHVlcyh0aGlzLmF0dHJpYnV0ZXMpLm1hcChhdHRyID0+IGF0dHIubmFtZSlcbiAgfVxuICBcbiAgLyoqXG4gICAqIHJldHVybnMgdGhlIGF0dHJpYnV0ZXMgd2hpY2ggYXJlIGNvbmZpZ3VyZWQgZm9yIGV4dHJhY3Rpb25cbiAgKi9cbiAgZXh0cmFjdGlvbnMoKSB7XG4gICAgcmV0dXJuIE9iamVjdC52YWx1ZXModGhpcy5hdHRyaWJ1dGVzKS5maWx0ZXIoYXR0ciA9PiBhdHRyLmV4dHJhY3Rpb24pXG4gIH1cblxuICAvKiogXG4gICAqIGRlZmluZXMgYXR0cmlidXRlcyBmb3IgdGhlIG1vZGVsJ3MgbWV0YWRhdGFcbiAgKi9cbiAgZGVmaW5lQXR0cmlidXRlcyAobGlzdCA9IFtdKSB7XG4gICAgbGlzdC5mb3JFYWNoKGF0dHIgPT4ge1xuICAgICAgaWYodHlwZW9mKGF0dHIpID09PSBcInN0cmluZ1wiKVxuICAgICAgICBhdHRyID0ge25hbWU6IGF0dHJ9XG4gICAgICBcbiAgICAgIHRoaXMuYXR0cmlidXRlc1thdHRyLm5hbWVdID0gbmV3IEF0dHJpYnV0ZUNvbmZpZyhhdHRyKVxuICAgIH0pXG5cbiAgICByZXR1cm4gdGhpc1xuICB9XG4gIFxuICAvKipcbiAgICogZGVmaW5lcyBhIHNlY3Rpb24gZm9yIHRoZSBtb2RlbC4gYSBzZWN0aW9uIHdpbGwgYmVcbiAgICogYnVpbHQgZnJvbSB0aGUgd3JpdHRlbiBjb250ZW50IG9mIHRoZSBkb2N1bWVudC4gc2VjdGlvbnNcbiAgICogY29uc2lzdCBvZiBoZWFkaW5ncyBuZXN0ZWQgd2l0aGluIGhlYWRpbmdzLlxuICAqL1xuICBkZWZpbmVTZWN0aW9uIChzZWN0aW9uTmFtZSwgb3B0aW9ucyA9IHt9KSB7XG4gICAgdGhpcy5zZWN0aW9uc1tzZWN0aW9uTmFtZV0gPSBuZXcgRG9jdW1lbnRTZWN0aW9uKHNlY3Rpb25OYW1lLCB0aGlzLCBvcHRpb25zKVxuICAgIHJldHVybiB0aGlzLnNlY3Rpb25zW3NlY3Rpb25OYW1lXVxuICB9XG5cbiAgLyoqXG4gICAqIGRlZmluZXMgYW4gYWN0aW9uIGZvciB0aGlzIG1vZGVsLiBhbiBhY3Rpb24gY2FuIGJlIGRpc3BhdGNoZWQgZnJvbVxuICAgKiB0aGUgY29tbWFuZCBsaW5lLCBhbmQgcnVuIG9uIGFyYml0cmFyeSBwYXRocy5cbiAgKi9cbiAgZGVmaW5lQWN0aW9uIChhY3Rpb25OYW1lLCBoYW5kbGVyKSB7XG4gICAgdGhpcy5hY3Rpb25zW2FjdGlvbk5hbWVdID0gaGFuZGxlclxuICAgIHJldHVybiB0aGlzXG4gIH1cbn1cblxuZnVuY3Rpb24gcmVhZFBhdGgocGF0aCkge1xuICByZXR1cm4gZnMucmVhZEZpbGVTeW5jKHBhdGgpLnRvU3RyaW5nKClcbn1cbiJdfQ==