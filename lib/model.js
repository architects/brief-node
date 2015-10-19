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
    var options = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

    _classCallCheck(this, Model);

    this.document = document;
    this.groupName = options.groupName || "documents";
    this.id = options.id;
    this.document.id = this.id;

    this.type = document.getType();

    this._createDataGetters();

    this.groupName = string.pluralize(this.type);
  }

  _createClass(Model, [{
    key: 'read',
    value: function read(property) {
      var value = this[property];
      return typeof value === 'function' ? value.call(this) : value;
    }
  }, {
    key: 'lastModifiedAt',
    value: function lastModifiedAt() {
      return this.document.lastModifiedAt();
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
    key: '_createDataGetters',
    value: function _createDataGetters() {
      var model = this;

      Object.keys(this.document.data || {}).forEach(function (key) {
        if (key === 'type') {
          return;
        }

        Object.defineProperty(model, key, {
          get: function get() {
            return model.data[key];
          }
        });
      });
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
      var _this = this;

      var config = this.getRelationshipConfig(relationshipId);
      var relatedModel = config.modelDefinition();

      if (!relatedModel) {
        throw 'Invalid relationship ' + relationshipId;
      }

      var collection = this.getModelsCollection(relatedModel.groupName);

      if (config.hasMany) {
        var _ret = (function () {
          var myKeyValue = _this.read(config.key);
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
          var myKeyValue = _this.read(config.foreignKey);
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
      var _this2 = this;

      return this.document.getSectionNodes().filter(function (node) {
        return _this2.expectedSectionHeadings().indexOf(node.heading) >= 0;
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
  }, {
    key: 'data',
    get: function get() {
      return this.document.data;
    }
  }]);

  return Model;
})();

exports['default'] = Model;
module.exports = exports['default'];
//# sourceMappingURL=data:application/json;base64,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Q0g7OztXQUVpQiw0QkFBQyxHQUFHLEVBQUU7QUFDdEIsYUFBTyxtQkFBbUIsRUFBRSxDQUFDLEdBQUcsQ0FBQyxDQUFBO0tBQ2xDOzs7V0FFa0IsK0JBQUc7QUFDcEIsYUFBTyxJQUFJLENBQUMsa0JBQWtCLEVBQUUsQ0FBQyxVQUFVLENBQUE7S0FDNUM7OztXQUVnQiw2QkFBRTtBQUNqQixhQUFPLElBQUksQ0FBQyxrQkFBa0IsRUFBRSxDQUFDLFFBQVEsQ0FBQTtLQUMxQzs7O1dBRXFCLGtDQUFFO0FBQ3RCLGFBQU8sSUFBSSxDQUFDLGtCQUFrQixFQUFFLENBQUMsYUFBYSxDQUFBO0tBQy9DOzs7V0FFb0IsK0JBQUMsY0FBYyxFQUFDO0FBQ25DLGFBQU8sSUFBSSxDQUFDLHNCQUFzQixFQUFFLENBQUMsY0FBYyxDQUFDLENBQUE7S0FDckQ7OztXQUVzQixtQ0FBRTtBQUN2QixVQUFNLEdBQUcsR0FBRyxJQUFJLENBQUMsaUJBQWlCLEVBQUUsQ0FBQTtBQUNwQyxhQUFPLE9BQU8sQ0FBQyxNQUFNLENBQUMsTUFBTSxDQUFDLEdBQUcsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxVQUFBLEdBQUc7ZUFBSSxDQUFDLEdBQUcsQ0FBQyxJQUFJLEVBQUUsR0FBRyxDQUFDLE9BQU8sQ0FBQztPQUFBLENBQUMsQ0FBQyxDQUFBO0tBQ3ZFOzs7V0FFaUIsOEJBQUU7QUFDbEIsYUFBTyw4QkFBZ0IsTUFBTSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQTtLQUN6Qzs7O1NBdEhPLGVBQUU7QUFDUixhQUFPLElBQUksQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFBO0tBQzFCOzs7U0FwQmtCLEtBQUs7OztxQkFBTCxLQUFLIiwiZmlsZSI6Im1vZGVsLmpzIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IF8gZnJvbSAndW5kZXJzY29yZSdcbmltcG9ydCBpbmZsZWN0IGZyb20gJ2knXG5cbmltcG9ydCBEb2N1bWVudCBmcm9tICcuL2RvY3VtZW50J1xuaW1wb3J0IE1vZGVsRGVmaW5pdGlvbiBmcm9tICcuL21vZGVsX2RlZmluaXRpb24nXG5pbXBvcnQgQnJpZWZjYXNlIGZyb20gJy4vYnJpZWZjYXNlJ1xuaW1wb3J0IHtmcmFnbWVudH0gZnJvbSAnLi9yZW5kZXInXG5cbmNvbnN0IGZsYXR0ZW4gPSBfLmZsYXR0ZW5cbmNvbnN0IHN0cmluZyA9IGluZmxlY3QoKVxuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBNb2RlbCB7XG4gIHN0YXRpYyBmcm9tRG9jdW1lbnQgKGRvY3VtZW50KXtcbiAgICByZXR1cm4gbmV3IE1vZGVsKGRvY3VtZW50KVxuICB9XG5cbiAgY29uc3RydWN0b3IoZG9jdW1lbnQsIG9wdGlvbnM9e30pIHtcbiAgICB0aGlzLmRvY3VtZW50ICAgICA9IGRvY3VtZW50XG4gICAgdGhpcy5ncm91cE5hbWUgICAgPSBvcHRpb25zLmdyb3VwTmFtZSB8fCBcImRvY3VtZW50c1wiXG4gICAgdGhpcy5pZCAgICAgICAgICAgPSBvcHRpb25zLmlkXG4gICAgdGhpcy5kb2N1bWVudC5pZCAgPSB0aGlzLmlkXG4gICAgXG4gICAgdGhpcy50eXBlID0gZG9jdW1lbnQuZ2V0VHlwZSgpXG5cbiAgICB0aGlzLl9jcmVhdGVEYXRhR2V0dGVycygpXG4gICAgXG4gICAgdGhpcy5ncm91cE5hbWUgPSBzdHJpbmcucGx1cmFsaXplKHRoaXMudHlwZSlcbiAgfVxuICBcbiAgZ2V0IGRhdGEoKXtcbiAgICByZXR1cm4gdGhpcy5kb2N1bWVudC5kYXRhXG4gIH1cblxuICByZWFkKHByb3BlcnR5KXtcbiAgICBsZXQgdmFsdWUgPSB0aGlzW3Byb3BlcnR5XVxuICAgIHJldHVybiB0eXBlb2YodmFsdWUpID09PSAnZnVuY3Rpb24nID8gdmFsdWUuY2FsbCh0aGlzKSA6IHZhbHVlXG4gIH1cblxuICBsYXN0TW9kaWZpZWRBdCgpe1xuICAgIHJldHVybiB0aGlzLmRvY3VtZW50Lmxhc3RNb2RpZmllZEF0KClcbiAgfVxuXG4gIHRvU3RyaW5nKCl7XG4gICAgcmV0dXJuICdEb2N1bWVudDogJyArIHRoaXMuZG9jdW1lbnQucGF0aFxuICB9XG5cbiAgdG9KU09OKG9wdGlvbnM9e30pIHtcbiAgICByZXR1cm4ge1xuICAgICAgZGF0YTogdGhpcy5kYXRhXG4gICAgfVxuICB9XG4gIFxuICBfY3JlYXRlRGF0YUdldHRlcnMoKXtcbiAgICBsZXQgbW9kZWwgPSB0aGlzXG5cbiAgICBPYmplY3Qua2V5cyh0aGlzLmRvY3VtZW50LmRhdGEgfHwge30pLmZvckVhY2goa2V5ID0+IHtcbiAgICAgIGlmKGtleSA9PT0gJ3R5cGUnKSB7IHJldHVybiB9XG5cbiAgICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShtb2RlbCwga2V5LCB7XG4gICAgICAgIGdldDogZnVuY3Rpb24oKXtcbiAgICAgICAgICByZXR1cm4gbW9kZWwuZGF0YVtrZXldXG4gICAgICAgIH1cbiAgICAgIH0pXG4gICAgfSlcbiAgfVxuXG4gIGV4dHJhY3RDb250ZW50KCkge1xuXG4gIH1cblxuICBleHRyYWN0RGF0YSgpIHtcblxuICB9XG4gIFxuICBnZXRCcmllZmNhc2UoKXtcbiAgICByZXR1cm4gdGhpcy5kb2N1bWVudC5nZXRCcmllZmNhc2UoKVxuICB9XG5cbiAgZ2V0TW9kZWxzQ29sbGVjdGlvbihncm91cE5hbWUpe1xuICAgIGxldCBiYyA9IHRoaXMuZ2V0QnJpZWZjYXNlKClcbiAgICBpZihiYyl7XG4gICAgICByZXR1cm4gYmNbZ3JvdXBOYW1lXVxuICAgIH1cbiAgfVxuXG4gIHJlbGF0ZWQocmVsYXRpb25zaGlwSWQpe1xuICAgIGxldCBjb25maWcgPSB0aGlzLmdldFJlbGF0aW9uc2hpcENvbmZpZyhyZWxhdGlvbnNoaXBJZClcbiAgICBsZXQgcmVsYXRlZE1vZGVsID0gY29uZmlnLm1vZGVsRGVmaW5pdGlvbigpXG5cbiAgICBpZighcmVsYXRlZE1vZGVsKXtcbiAgICAgIHRocm93KCdJbnZhbGlkIHJlbGF0aW9uc2hpcCAnICsgcmVsYXRpb25zaGlwSWQpXG4gICAgfVxuXG4gICAgbGV0IGNvbGxlY3Rpb24gPSB0aGlzLmdldE1vZGVsc0NvbGxlY3Rpb24ocmVsYXRlZE1vZGVsLmdyb3VwTmFtZSkgXG4gICAgXG4gICAgaWYoY29uZmlnLmhhc01hbnkpe1xuICAgICAgbGV0IG15S2V5VmFsdWUgPSB0aGlzLnJlYWQoY29uZmlnLmtleSlcbiAgICAgIGxldCBmb3JlaWduS2V5RmllbGQgPSBjb25maWcuZm9yZWlnbktleVxuXG4gICAgICByZXR1cm4gY29sbGVjdGlvbi5maWx0ZXIobW9kZWwgPT4ge1xuICAgICAgICByZXR1cm4gbW9kZWwucmVhZChmb3JlaWduS2V5RmllbGQpID09PSBteUtleVZhbHVlICAgICAgICBcbiAgICAgIH0pXG4gICAgfVxuXG4gICAgaWYoY29uZmlnLmJlbG9uZ3NUbyl7XG4gICAgICBsZXQgbXlLZXlWYWx1ZSA9IHRoaXMucmVhZChjb25maWcuZm9yZWlnbktleSlcbiAgICAgIGxldCBmb3JlaWduS2V5RmllbGQgPSBjb25maWcucmVmZXJlbmNlc1xuXG4gICAgICByZXR1cm4gY29sbGVjdGlvbi5maW5kKG1vZGVsID0+IHtcbiAgICAgICAgcmV0dXJuIG1vZGVsLnJlYWQoZm9yZWlnbktleUZpZWxkKSA9PT0gbXlLZXlWYWx1ZSAgICAgICAgXG4gICAgICB9KVxuICAgIH1cbiAgfVxuXG4gIGRlZmluZWRTZWN0aW9uTm9kZXMoKXtcbiAgICByZXR1cm4gdGhpcy5kb2N1bWVudC5nZXRTZWN0aW9uTm9kZXMoKS5maWx0ZXIobm9kZSA9PiB7XG4gICAgICByZXR1cm4gdGhpcy5leHBlY3RlZFNlY3Rpb25IZWFkaW5ncygpLmluZGV4T2Yobm9kZS5oZWFkaW5nKSA+PSAwXG4gICAgfSlcbiAgfVxuXG4gIGdldEF0dHJpYnV0ZUNvbmZpZyhrZXkpIHtcbiAgICByZXR1cm4gZ2V0QXR0cmlidXRlc0NvbmZpZygpW2tleV1cbiAgfVxuXG4gIGdldEF0dHJpYnV0ZXNDb25maWcoKSB7XG4gICAgcmV0dXJuIHRoaXMuZ2V0TW9kZWxEZWZpbml0aW9uKCkuYXR0cmlidXRlc1xuICB9XG5cbiAgZ2V0U2VjdGlvbnNDb25maWcoKXtcbiAgICByZXR1cm4gdGhpcy5nZXRNb2RlbERlZmluaXRpb24oKS5zZWN0aW9uc1xuICB9XG4gIFxuICBnZXRSZWxhdGlvbnNoaXBzQ29uZmlnKCl7XG4gICAgcmV0dXJuIHRoaXMuZ2V0TW9kZWxEZWZpbml0aW9uKCkucmVsYXRpb25zaGlwc1xuICB9XG5cbiAgZ2V0UmVsYXRpb25zaGlwQ29uZmlnKHJlbGF0aW9uc2hpcElkKXtcbiAgICByZXR1cm4gdGhpcy5nZXRSZWxhdGlvbnNoaXBzQ29uZmlnKClbcmVsYXRpb25zaGlwSWRdXG4gIH1cblxuICBleHBlY3RlZFNlY3Rpb25IZWFkaW5ncygpe1xuICAgIGNvbnN0IGNmZyA9IHRoaXMuZ2V0U2VjdGlvbnNDb25maWcoKVxuICAgIHJldHVybiBmbGF0dGVuKE9iamVjdC52YWx1ZXMoY2ZnKS5tYXAoZGVmID0+IFtkZWYubmFtZSwgZGVmLmFsaWFzZXNdKSlcbiAgfVxuXG4gIGdldE1vZGVsRGVmaW5pdGlvbigpe1xuICAgIHJldHVybiBNb2RlbERlZmluaXRpb24ubG9va3VwKHRoaXMudHlwZSlcbiAgfVxuXG59XG4iXX0=