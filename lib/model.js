'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var _underscore = require('underscore');

var _underscore2 = _interopRequireDefault(_underscore);

var _i = require('i');

var _i2 = _interopRequireDefault(_i);

var _document = require('./document');

var _document2 = _interopRequireDefault(_document);

var _model_definition = require('./model_definition');

var _model_definition2 = _interopRequireDefault(_model_definition);

var _briefcase = require('./briefcase');

var _briefcase2 = _interopRequireDefault(_briefcase);

var _render = require('./render');

var flatten = _underscore2['default'].flatten;
var string = (0, _i2['default'])();

var Model = (function () {
  _createClass(Model, null, [{
    key: 'fromDocument',
    value: function fromDocument(document) {
      return new Model(document);
    }
  }]);

  function Model(document) {
    var _this = this;

    var options = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

    _classCallCheck(this, Model);

    this.document = document;
    this.data = document.data || {};
    this.groupName = options.groupName || "documents";
    this.id = options.id;
    this.document.id = this.id;

    this.type = this.data.type || document.getType();
    this.groupName = string.pluralize(this.type);

    Object.keys(this.data).forEach(function (key) {
      return _this[key] = _this.data[key];
    });
  }

  _createClass(Model, [{
    key: 'read',
    value: function read(property) {
      var value = this[property];
      return typeof value === 'function' ? value.call(this) : value;
    }
  }, {
    key: 'toString',
    value: function toString() {
      return 'Document: ' + this.document.path;
    }
  }, {
    key: 'toJSON',
    value: function toJSON() {
      var options = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

      return {
        data: this.data
      };
    }
  }, {
    key: 'extractContent',
    value: function extractContent() {}
  }, {
    key: 'extractData',
    value: function extractData() {}
  }, {
    key: 'getBriefcase',
    value: function getBriefcase() {
      return this.document.getBriefcase();
    }
  }, {
    key: 'getModelsCollection',
    value: function getModelsCollection(groupName) {
      var bc = this.getBriefcase();
      if (bc) {
        return bc[groupName];
      }
    }
  }, {
    key: 'related',
    value: function related(relationshipId) {
      var _this2 = this;

      var config = this.getRelationshipConfig(relationshipId);
      var relatedModel = config.modelDefinition();

      if (!relatedModel) {
        throw 'Invalid relationship ' + relationshipId;
      }

      console.log(config);

      var collection = this.getModelsCollection(relatedModel.groupName);

      if (config.hasMany) {
        var _ret = (function () {
          var myKeyValue = _this2.read(config.key);
          var foreignKeyField = config.foreignKey;

          return {
            v: collection.filter(function (model) {
              return model.read(foreignKeyField) === myKeyValue;
            })
          };
        })();

        if (typeof _ret === 'object') return _ret.v;
      }

      if (config.belongsTo) {
        var _ret2 = (function () {
          var myKeyValue = _this2.read(config.foreignKey);
          var foreignKeyField = config.references;

          return {
            v: collection.find(function (model) {
              return model.read(foreignKeyField) === myKeyValue;
            })
          };
        })();

        if (typeof _ret2 === 'object') return _ret2.v;
      }
    }
  }, {
    key: 'definedSectionNodes',
    value: function definedSectionNodes() {
      var _this3 = this;

      return this.document.getSectionNodes().filter(function (node) {
        return _this3.expectedSectionHeadings().indexOf(node.heading) >= 0;
      });
    }
  }, {
    key: 'getAttributeConfig',
    value: function getAttributeConfig(key) {
      return getAttributesConfig()[key];
    }
  }, {
    key: 'getAttributesConfig',
    value: function getAttributesConfig() {
      return this.getModelDefinition().attributes;
    }
  }, {
    key: 'getSectionsConfig',
    value: function getSectionsConfig() {
      return this.getModelDefinition().sections;
    }
  }, {
    key: 'getRelationshipsConfig',
    value: function getRelationshipsConfig() {
      return this.getModelDefinition().relationships;
    }
  }, {
    key: 'getRelationshipConfig',
    value: function getRelationshipConfig(relationshipId) {
      return this.getRelationshipsConfig()[relationshipId];
    }
  }, {
    key: 'expectedSectionHeadings',
    value: function expectedSectionHeadings() {
      var cfg = this.getSectionsConfig();
      return flatten(Object.values(cfg).map(function (def) {
        return [def.name, def.aliases];
      }));
    }
  }, {
    key: 'getModelDefinition',
    value: function getModelDefinition() {
      return _model_definition2['default'].lookup(this.type);
    }
  }]);

  return Model;
})();

exports['default'] = Model;
module.exports = exports['default'];
//# sourceMappingURL=data:application/json;base64,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QUMsa0JBQWtCLEVBQUUsQ0FBQyxRQUFRLENBQUE7S0FDMUM7OztXQUVxQixrQ0FBRTtBQUN0QixhQUFPLElBQUksQ0FBQyxrQkFBa0IsRUFBRSxDQUFDLGFBQWEsQ0FBQTtLQUMvQzs7O1dBRW9CLCtCQUFDLGNBQWMsRUFBQztBQUNuQyxhQUFPLElBQUksQ0FBQyxzQkFBc0IsRUFBRSxDQUFDLGNBQWMsQ0FBQyxDQUFBO0tBQ3JEOzs7V0FFc0IsbUNBQUU7QUFDdkIsVUFBTSxHQUFHLEdBQUcsSUFBSSxDQUFDLGlCQUFpQixFQUFFLENBQUE7QUFDcEMsYUFBTyxPQUFPLENBQUMsTUFBTSxDQUFDLE1BQU0sQ0FBQyxHQUFHLENBQUMsQ0FBQyxHQUFHLENBQUMsVUFBQSxHQUFHO2VBQUksQ0FBQyxHQUFHLENBQUMsSUFBSSxFQUFFLEdBQUcsQ0FBQyxPQUFPLENBQUM7T0FBQSxDQUFDLENBQUMsQ0FBQTtLQUN2RTs7O1dBRWlCLDhCQUFFO0FBQ2xCLGFBQU8sOEJBQWdCLE1BQU0sQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUE7S0FDekM7OztTQXBIa0IsS0FBSzs7O3FCQUFMLEtBQUsiLCJmaWxlIjoibW9kZWwuanMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgXyBmcm9tICd1bmRlcnNjb3JlJ1xuaW1wb3J0IGluZmxlY3QgZnJvbSAnaSdcblxuaW1wb3J0IERvY3VtZW50IGZyb20gJy4vZG9jdW1lbnQnXG5pbXBvcnQgTW9kZWxEZWZpbml0aW9uIGZyb20gJy4vbW9kZWxfZGVmaW5pdGlvbidcbmltcG9ydCBCcmllZmNhc2UgZnJvbSAnLi9icmllZmNhc2UnXG5pbXBvcnQge2ZyYWdtZW50fSBmcm9tICcuL3JlbmRlcidcblxuY29uc3QgZmxhdHRlbiA9IF8uZmxhdHRlblxuY29uc3Qgc3RyaW5nID0gaW5mbGVjdCgpXG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIE1vZGVsIHtcbiAgc3RhdGljIGZyb21Eb2N1bWVudCAoZG9jdW1lbnQpe1xuICAgIHJldHVybiBuZXcgTW9kZWwoZG9jdW1lbnQpXG4gIH1cblxuICBjb25zdHJ1Y3Rvcihkb2N1bWVudCwgb3B0aW9ucz17fSkge1xuICAgIHRoaXMuZG9jdW1lbnQgICAgID0gZG9jdW1lbnRcbiAgICB0aGlzLmRhdGEgICAgICAgICA9IGRvY3VtZW50LmRhdGEgfHwge31cbiAgICB0aGlzLmdyb3VwTmFtZSAgICA9IG9wdGlvbnMuZ3JvdXBOYW1lIHx8IFwiZG9jdW1lbnRzXCJcbiAgICB0aGlzLmlkICAgICAgICAgICA9IG9wdGlvbnMuaWRcbiAgICB0aGlzLmRvY3VtZW50LmlkICA9IHRoaXMuaWRcbiAgICBcbiAgICB0aGlzLnR5cGUgPSB0aGlzLmRhdGEudHlwZSB8fCBkb2N1bWVudC5nZXRUeXBlKClcbiAgICB0aGlzLmdyb3VwTmFtZSA9IHN0cmluZy5wbHVyYWxpemUodGhpcy50eXBlKVxuICAgIFxuICAgIE9iamVjdC5rZXlzKHRoaXMuZGF0YSkuZm9yRWFjaChrZXkgPT4gdGhpc1trZXldID0gdGhpcy5kYXRhW2tleV0pXG4gIH1cbiAgXG4gIHJlYWQocHJvcGVydHkpe1xuICAgIGxldCB2YWx1ZSA9IHRoaXNbcHJvcGVydHldXG4gICAgcmV0dXJuIHR5cGVvZih2YWx1ZSkgPT09ICdmdW5jdGlvbicgPyB2YWx1ZS5jYWxsKHRoaXMpIDogdmFsdWVcbiAgfVxuXG4gIHRvU3RyaW5nKCl7XG4gICAgcmV0dXJuICdEb2N1bWVudDogJyArIHRoaXMuZG9jdW1lbnQucGF0aFxuICB9XG5cbiAgdG9KU09OKG9wdGlvbnM9e30pIHtcbiAgICByZXR1cm4ge1xuICAgICAgZGF0YTogdGhpcy5kYXRhXG4gICAgfVxuICB9XG5cbiAgZXh0cmFjdENvbnRlbnQoKSB7XG5cbiAgfVxuXG4gIGV4dHJhY3REYXRhKCkge1xuXG4gIH1cbiAgXG4gIGdldEJyaWVmY2FzZSgpe1xuICAgIHJldHVybiB0aGlzLmRvY3VtZW50LmdldEJyaWVmY2FzZSgpXG4gIH1cblxuICBnZXRNb2RlbHNDb2xsZWN0aW9uKGdyb3VwTmFtZSl7XG4gICAgbGV0IGJjID0gdGhpcy5nZXRCcmllZmNhc2UoKVxuICAgIGlmKGJjKXtcbiAgICAgIHJldHVybiBiY1tncm91cE5hbWVdXG4gICAgfVxuICB9XG5cbiAgcmVsYXRlZChyZWxhdGlvbnNoaXBJZCl7XG4gICAgbGV0IGNvbmZpZyA9IHRoaXMuZ2V0UmVsYXRpb25zaGlwQ29uZmlnKHJlbGF0aW9uc2hpcElkKVxuICAgIGxldCByZWxhdGVkTW9kZWwgPSBjb25maWcubW9kZWxEZWZpbml0aW9uKClcblxuICAgIGlmKCFyZWxhdGVkTW9kZWwpe1xuICAgICAgdGhyb3coJ0ludmFsaWQgcmVsYXRpb25zaGlwICcgKyByZWxhdGlvbnNoaXBJZClcbiAgICB9XG4gICAgXG4gICAgY29uc29sZS5sb2coY29uZmlnKVxuXG4gICAgbGV0IGNvbGxlY3Rpb24gPSB0aGlzLmdldE1vZGVsc0NvbGxlY3Rpb24ocmVsYXRlZE1vZGVsLmdyb3VwTmFtZSkgXG4gICAgXG4gICAgaWYoY29uZmlnLmhhc01hbnkpe1xuICAgICAgbGV0IG15S2V5VmFsdWUgPSB0aGlzLnJlYWQoY29uZmlnLmtleSlcbiAgICAgIGxldCBmb3JlaWduS2V5RmllbGQgPSBjb25maWcuZm9yZWlnbktleVxuXG4gICAgICByZXR1cm4gY29sbGVjdGlvbi5maWx0ZXIobW9kZWwgPT4ge1xuICAgICAgICByZXR1cm4gbW9kZWwucmVhZChmb3JlaWduS2V5RmllbGQpID09PSBteUtleVZhbHVlICAgICAgICBcbiAgICAgIH0pXG4gICAgfVxuXG4gICAgaWYoY29uZmlnLmJlbG9uZ3NUbyl7XG4gICAgICBsZXQgbXlLZXlWYWx1ZSA9IHRoaXMucmVhZChjb25maWcuZm9yZWlnbktleSlcbiAgICAgIGxldCBmb3JlaWduS2V5RmllbGQgPSBjb25maWcucmVmZXJlbmNlc1xuXG4gICAgICByZXR1cm4gY29sbGVjdGlvbi5maW5kKG1vZGVsID0+IHtcbiAgICAgICAgcmV0dXJuIG1vZGVsLnJlYWQoZm9yZWlnbktleUZpZWxkKSA9PT0gbXlLZXlWYWx1ZSAgICAgICAgXG4gICAgICB9KVxuICAgIH1cbiAgfVxuXG4gIGRlZmluZWRTZWN0aW9uTm9kZXMoKXtcbiAgICByZXR1cm4gdGhpcy5kb2N1bWVudC5nZXRTZWN0aW9uTm9kZXMoKS5maWx0ZXIobm9kZSA9PiB7XG4gICAgICByZXR1cm4gdGhpcy5leHBlY3RlZFNlY3Rpb25IZWFkaW5ncygpLmluZGV4T2Yobm9kZS5oZWFkaW5nKSA+PSAwXG4gICAgfSlcbiAgfVxuXG4gIGdldEF0dHJpYnV0ZUNvbmZpZyhrZXkpIHtcbiAgICByZXR1cm4gZ2V0QXR0cmlidXRlc0NvbmZpZygpW2tleV1cbiAgfVxuXG4gIGdldEF0dHJpYnV0ZXNDb25maWcoKSB7XG4gICAgcmV0dXJuIHRoaXMuZ2V0TW9kZWxEZWZpbml0aW9uKCkuYXR0cmlidXRlc1xuICB9XG5cbiAgZ2V0U2VjdGlvbnNDb25maWcoKXtcbiAgICByZXR1cm4gdGhpcy5nZXRNb2RlbERlZmluaXRpb24oKS5zZWN0aW9uc1xuICB9XG4gIFxuICBnZXRSZWxhdGlvbnNoaXBzQ29uZmlnKCl7XG4gICAgcmV0dXJuIHRoaXMuZ2V0TW9kZWxEZWZpbml0aW9uKCkucmVsYXRpb25zaGlwc1xuICB9XG5cbiAgZ2V0UmVsYXRpb25zaGlwQ29uZmlnKHJlbGF0aW9uc2hpcElkKXtcbiAgICByZXR1cm4gdGhpcy5nZXRSZWxhdGlvbnNoaXBzQ29uZmlnKClbcmVsYXRpb25zaGlwSWRdXG4gIH1cblxuICBleHBlY3RlZFNlY3Rpb25IZWFkaW5ncygpe1xuICAgIGNvbnN0IGNmZyA9IHRoaXMuZ2V0U2VjdGlvbnNDb25maWcoKVxuICAgIHJldHVybiBmbGF0dGVuKE9iamVjdC52YWx1ZXMoY2ZnKS5tYXAoZGVmID0+IFtkZWYubmFtZSwgZGVmLmFsaWFzZXNdKSlcbiAgfVxuXG4gIGdldE1vZGVsRGVmaW5pdGlvbigpe1xuICAgIHJldHVybiBNb2RlbERlZmluaXRpb24ubG9va3VwKHRoaXMudHlwZSlcbiAgfVxuXG59XG4iXX0=