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
      return Object.keys(this.attributes);
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

        _this.attributes[attr.name] = attr;
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3NyYy9tb2RlbF9kZWZpbml0aW9uLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7OztpQkFBb0IsR0FBRzs7OztrQkFDUixJQUFJOzs7OzBCQUNMLFlBQVk7Ozs7Z0NBQ0Usb0JBQW9COzs7O3FCQUM5QixTQUFTOzs7O0FBRTNCLElBQU0sV0FBVyxHQUFHLHFCQUFTLENBQUE7O0FBRTdCLElBQU0sV0FBVyxHQUFHLEVBQUUsQ0FBQTtBQUN0QixJQUFNLFlBQVksR0FBRyxFQUFFLENBQUE7O0FBRXZCLElBQU0sR0FBRyxHQUFHO0FBQ1YsT0FBSyxFQUFFLGlCQUFVO0FBQ2YsUUFBSSxPQUFPLEdBQUcsZUFBZSxDQUFDLElBQUksRUFBRSxDQUFBO0FBQ3BDLFdBQU8sT0FBTyxDQUFDLFdBQVcsRUFBRSxDQUFBO0dBQzdCOztBQUVELFFBQU0sRUFBRSxnQkFBVSxTQUFTLEVBQWlCO1FBQWYsT0FBTyx5REFBRyxFQUFFOztBQUN2QyxRQUFJLE9BQU8sR0FBRyxXQUFXLENBQUMsU0FBUyxDQUFDLENBQUE7QUFDcEMsZUFBVyxDQUFDLFNBQVMsQ0FBQyxHQUFHLE9BQU8sSUFBSSxJQUFJLGVBQWUsQ0FBQyxTQUFTLEVBQUUsT0FBTyxDQUFDLENBQUE7O0FBRTNFLFdBQU8sT0FBTyxDQUFBO0dBQ2Y7O0FBRUQsWUFBVSxFQUFFLHNCQUFtQjtBQUM3QixRQUFJLE9BQU8sR0FBRyxlQUFlLENBQUMsSUFBSSxFQUFFLENBQUE7O3NDQURiLElBQUk7QUFBSixVQUFJOzs7QUFFM0IsV0FBTyxPQUFPLENBQUMsZ0JBQWdCLENBQUMsSUFBSSxDQUFDLENBQUE7R0FDdEM7O0FBRUQsU0FBTyxFQUFFLGlCQUFVLElBQUksRUFBZ0I7UUFBZCxPQUFPLHlEQUFHLEVBQUU7O0FBQ25DLFFBQUksT0FBTyxHQUFHLGVBQWUsQ0FBQyxJQUFJLEVBQUUsQ0FBQTtBQUNwQyxXQUFPLE9BQU8sQ0FBQyxhQUFhLENBQUMsSUFBSSxFQUFFLE9BQU8sQ0FBQyxDQUFB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QUFFO0FBQ2pDLFVBQUksQ0FBQyxPQUFPLENBQUMsVUFBVSxDQUFDLEdBQUcsT0FBTyxDQUFBO0FBQ2xDLGFBQU8sSUFBSSxDQUFBO0tBQ1o7OztXQTVEb0IsMEJBQUU7QUFDckIsYUFBTyxNQUFNLENBQUMsSUFBSSxDQUFDLFlBQVksQ0FBQyxDQUFBO0tBQ2pDOzs7U0EvRGtCLGVBQWU7OztxQkFBZixlQUFlOztBQTRIcEMsU0FBUyxRQUFRLENBQUMsSUFBSSxFQUFFO0FBQ3RCLFNBQU8sZ0JBQUcsWUFBWSxDQUFDLElBQUksQ0FBQyxDQUFDLFFBQVEsRUFBRSxDQUFBO0NBQ3hDIiwiZmlsZSI6Im1vZGVsX2RlZmluaXRpb24uanMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgaW5mbGVjdCBmcm9tICdpJ1xuaW1wb3J0IGZzIGZyb20gJ2ZzJ1xuaW1wb3J0IF8gZnJvbSAndW5kZXJzY29yZSdcbmltcG9ydCBEb2N1bWVudFNlY3Rpb24gZnJvbSAnLi9kb2N1bWVudF9zZWN0aW9uJ1xuaW1wb3J0IE1vZGVsIGZyb20gJy4vbW9kZWwnXG5cbmNvbnN0IGluZmxlY3Rpb25zID0gaW5mbGVjdCgpXG5cbmNvbnN0IGRlZmluaXRpb25zID0ge31cbmNvbnN0IHR5cGVfYWxpYXNlcyA9IHt9XG5cbmNvbnN0IGRzbCA9IHtcbiAgY2xvc2U6IGZ1bmN0aW9uKCl7XG4gICAgbGV0IGN1cnJlbnQgPSBNb2RlbERlZmluaXRpb24ubGFzdCgpXG4gICAgcmV0dXJuIGN1cnJlbnQudG9Qcm90b3R5cGUoKVxuICB9LFxuXG4gIGRlZmluZTogZnVuY3Rpb24oIG1vZGVsTmFtZSwgb3B0aW9ucyA9IHt9ICkge1xuICAgIGxldCBjdXJyZW50ID0gZGVmaW5pdGlvbnNbbW9kZWxOYW1lXVxuICAgIGRlZmluaXRpb25zW21vZGVsTmFtZV0gPSBjdXJyZW50IHx8IG5ldyBNb2RlbERlZmluaXRpb24obW9kZWxOYW1lLCBvcHRpb25zKVxuXG4gICAgcmV0dXJuIGN1cnJlbnRcbiAgfSxcblxuICBhdHRyaWJ1dGVzOiBmdW5jdGlvbiAoLi4ubGlzdCkge1xuICAgIGxldCBjdXJyZW50ID0gTW9kZWxEZWZpbml0aW9uLmxhc3QoKVxuICAgIHJldHVybiBjdXJyZW50LmRlZmluZUF0dHJpYnV0ZXMobGlzdClcbiAgfSxcblxuICBzZWN0aW9uOiBmdW5jdGlvbiAobmFtZSwgb3B0aW9ucyA9IHt9KSB7XG4gICAgbGV0IGN1cnJlbnQgPSBNb2RlbERlZmluaXRpb24ubGFzdCgpXG4gICAgcmV0dXJuIGN1cnJlbnQuZGVmaW5lU2VjdGlvbihuYW1lLCBvcHRpb25zKVxuICB9LFxuXG4gIGFjdGlvbjogZnVuY3Rpb24gKG5hbWUsIGhhbmRsZXIpIHtcbiAgICBsZXQgY3VycmVudCA9IE1vZGVsRGVmaW5pdGlvbi5sYXN0KClcbiAgICByZXR1cm4gY3VycmVudC5kZWZpbmVBY3Rpb24obmFtZSwgaGFuZGxlcilcbiAgfVxufVxuXG5jb25zdCBkc2xfbWV0aG9kcyA9IFtcbiAgXCJkZWZpbmVcIixcbiAgXCJhdHRyaWJ1dGVzXCIsXG4gIFwiYXR0cmlidXRlXCIsXG4gIFwic2VjdGlvblwiLFxuICBcImFjdGlvblwiLFxuICBcImFjdGlvbnNcIixcbiAgXCJjbG9zZVwiXG5dXG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIE1vZGVsRGVmaW5pdGlvbiB7XG4gIHN0YXRpYyBzZXR1cERTTCAoKSB7XG4gICAgZHNsX21ldGhvZHMuZm9yRWFjaChtZXRob2QgPT4gZ2xvYmFsW21ldGhvZF0gPSBkc2xbbWV0aG9kXSkgICAgXG4gIH1cblxuICBzdGF0aWMgY2xlYW51cERTTCAoKSB7XG4gICAgZHNsX21ldGhvZHMuZm9yRWFjaChtZXRob2QgPT4gZGVsZXRlKGdsb2JhbFttZXRob2RdKSlcbiAgfVxuXG4gIHN0YXRpYyBsb2FkIChwYXRoKSB7XG4gICAgbGV0IGNvbnRlbnQgPSByZWFkUGF0aChwYXRoKVxuXG4gICAgTW9kZWxEZWZpbml0aW9uLnNldHVwRFNMKClcblxuICAgIGxldCBsb2FkZWQgPSByZXF1aXJlKHBhdGgpXG5cbiAgICBNb2RlbERlZmluaXRpb24uY2xlYW51cERTTCgpXG5cbiAgICByZXR1cm4gbG9hZGVkXG4gIH1cblxuICBzdGF0aWMgbGFzdCAoKSB7XG4gICAgbGV0IGFsbCA9IHRoaXMuZ2V0QWxsKClcbiAgICByZXR1cm4gYWxsW2FsbC5sZW5ndGggLSAxXVxuICB9XG5cbiAgc3RhdGljIGdldEFsbCAoKSB7XG4gICAgcmV0dXJuIF8oZGVmaW5pdGlvbnMpLnZhbHVlcygpXG4gIH1cblxuICBzdGF0aWMgZ2V0TW9kZWxTY2hlbWEgKCkge1xuICAgIHJldHVybiBkZWZpbml0aW9uc1xuICB9XG5cbiAgc3RhdGljIGxvb2t1cCAoYWxpYXNPck5hbWUsIHNpbmd1bGFyID0gZmFsc2UpIHtcbiAgICBpZihkZWZpbml0aW9uc1thbGlhc09yTmFtZV0pe1xuICAgICAgcmV0dXJuIGRlZmluaXRpb25zW2FsaWFzT3JOYW1lXVxuICAgIH1cbiAgICBcbiAgICBsZXQgbmFtZSA9IHR5cGVfYWxpYXNlc1thbGlhc09yTmFtZV1cbiAgICBcbiAgICBpZihuYW1lICYmIGRlZmluaXRpb25zW25hbWVdKVxuICAgICAgcmV0dXJuIGRlZmluaXRpb25zW25hbWVdXG5cbiAgICBpZihzaW5ndWxhciA9PSB0cnVlKVxuICAgICAgcmV0dXJuIGxvb2t1cChpbmZsZWN0aW9ucy5zaW5ndWxhcml6ZShhbGlhc09yTmFtZSwgdHJ1ZSkpXG4gIH1cblxuICBjb25zdHJ1Y3RvciAobmFtZSA9IFwiRG9jdW1lbnRcIikge1xuICAgIHRoaXMubmFtZSA9IGluZmxlY3Rpb25zLmNhbWVsaXplKG5hbWUpXG4gICAgdGhpcy50eXBlX2FsaWFzID0gaW5mbGVjdGlvbnMudW5kZXJzY29yZShuYW1lLnRvTG93ZXJDYXNlKCkpXG5cbiAgICB0aGlzLmF0dHJpYnV0ZXMgPSB7fVxuICAgIHRoaXMuc2VjdGlvbnMgPSB7fVxuICAgIHRoaXMuYWN0aW9ucyA9IHt9XG5cbiAgICAvL3N0b3JlIGEgcmVmZXJlbmNlIGluIHRoZSBidWNrZXRcbiAgICBkZWZpbml0aW9uc1t0aGlzLm5hbWVdID0gdGhpc1xuICAgIHR5cGVfYWxpYXNlc1t0aGlzLnR5cGVfYWxpYXNdID0gdGhpcy5uYW1lXG4gIH1cbiAgXG4gIHN0YXRpYyBnZXRUeXBlQWxpYXNlcygpe1xuICAgIHJldHVybiBPYmplY3Qua2V5cyh0eXBlX2FsaWFzZXMpXG4gIH1cblxuICB0b1Byb3RvdHlwZSAoKSB7XG4gICAgbGV0IG9iaiA9IGZ1bmN0aW9uKCl7IH1cbiAgICBsZXQgZGVmaW5pdGlvbiA9IHRoaXNcblxuICAgIG9iai5wcm90b3R5cGUgPSBNb2RlbFxuICAgIFxuICAgIG9iai5nZXRNb2RlbERlZmluaXRpb24gPSBmdW5jdGlvbigpe1xuICAgICAgcmV0dXJuIGRlZmluaXRpb25cbiAgICB9XG5cbiAgICBmb3IodmFyIGFjdGlvbiBpbiB0aGlzLmFjdGlvbnMpe1xuICAgICAgb2JqW2FjdGlvbl0gPSBmdW5jdGlvbigpe1xuICAgICAgICBhY3Rpb25zW2FjdGlvbl0uYXBwbHkob2JqLCBhcmd1bWVudHMpXG4gICAgICB9XG4gICAgfVxuXG4gICAgcmV0dXJuIG9ialxuICB9XG4gIFxuICAvKipcbiAgICogcmV0dXJucyB0aGUgYXR0cmlidXRlIG5hbWVzIGFzIGFuIGFycmF5XG4gICovXG4gIGF0dHJpYnV0ZU5hbWVzICgpIHtcbiAgICByZXR1cm4gT2JqZWN0LmtleXModGhpcy5hdHRyaWJ1dGVzKVxuICB9XG4gIC8qKiBcbiAgICogZGVmaW5lcyBhdHRyaWJ1dGVzIGZvciB0aGUgbW9kZWwncyBtZXRhZGF0YVxuICAqL1xuICBkZWZpbmVBdHRyaWJ1dGVzIChsaXN0ID0gW10pIHtcbiAgICBsaXN0LmZvckVhY2goYXR0ciA9PiB7XG4gICAgICBpZih0eXBlb2YoYXR0cikgPT09IFwic3RyaW5nXCIpXG4gICAgICAgIGF0dHIgPSB7bmFtZTogYXR0cn1cbiAgICAgIFxuICAgICAgdGhpcy5hdHRyaWJ1dGVzW2F0dHIubmFtZV0gPSBhdHRyXG4gICAgfSlcblxuICAgIHJldHVybiB0aGlzXG4gIH1cbiAgXG4gIC8qKlxuICAgKiBkZWZpbmVzIGEgc2VjdGlvbiBmb3IgdGhlIG1vZGVsLiBhIHNlY3Rpb24gd2lsbCBiZVxuICAgKiBidWlsdCBmcm9tIHRoZSB3cml0dGVuIGNvbnRlbnQgb2YgdGhlIGRvY3VtZW50LiBzZWN0aW9uc1xuICAgKiBjb25zaXN0IG9mIGhlYWRpbmdzIG5lc3RlZCB3aXRoaW4gaGVhZGluZ3MuXG4gICovXG4gIGRlZmluZVNlY3Rpb24gKHNlY3Rpb25OYW1lLCBvcHRpb25zID0ge30pIHtcbiAgICB0aGlzLnNlY3Rpb25zW3NlY3Rpb25OYW1lXSA9IG5ldyBEb2N1bWVudFNlY3Rpb24oc2VjdGlvbk5hbWUsIHRoaXMsIG9wdGlvbnMpXG4gICAgcmV0dXJuIHRoaXMuc2VjdGlvbnNbc2VjdGlvbk5hbWVdXG4gIH1cblxuICAvKipcbiAgICogZGVmaW5lcyBhbiBhY3Rpb24gZm9yIHRoaXMgbW9kZWwuIGFuIGFjdGlvbiBjYW4gYmUgZGlzcGF0Y2hlZCBmcm9tXG4gICAqIHRoZSBjb21tYW5kIGxpbmUsIGFuZCBydW4gb24gYXJiaXRyYXJ5IHBhdGhzLlxuICAqL1xuICBkZWZpbmVBY3Rpb24gKGFjdGlvbk5hbWUsIGhhbmRsZXIpIHtcbiAgICB0aGlzLmFjdGlvbnNbYWN0aW9uTmFtZV0gPSBoYW5kbGVyXG4gICAgcmV0dXJuIHRoaXNcbiAgfVxufVxuXG5mdW5jdGlvbiByZWFkUGF0aChwYXRoKSB7XG4gIHJldHVybiBmcy5yZWFkRmlsZVN5bmMocGF0aCkudG9TdHJpbmcoKVxufVxuIl19