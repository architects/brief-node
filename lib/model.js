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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3NyYy9tb2RlbC5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7MEJBQWMsWUFBWTs7OztpQkFDTixHQUFHOzs7O3dCQUVGLFlBQVk7Ozs7Z0NBQ0wsb0JBQW9COzs7O3lCQUMxQixhQUFhOzs7O3NCQUNaLFVBQVU7O0FBRWpDLElBQU0sT0FBTyxHQUFHLHdCQUFFLE9BQU8sQ0FBQTtBQUN6QixJQUFNLE1BQU0sR0FBRyxxQkFBUyxDQUFBOztJQUVILEtBQUs7ZUFBTCxLQUFLOztXQUNKLHNCQUFDLFFBQVEsRUFBQztBQUM1QixhQUFPLElBQUksS0FBSyxDQUFDLFFBQVEsQ0FBQyxDQUFBO0tBQzNCOzs7QUFFVSxXQUxRLEtBQUssQ0FLWixRQUFRLEVBQWM7OztRQUFaLE9BQU8seURBQUMsRUFBRTs7MEJBTGIsS0FBSzs7QUFNdEIsUUFBSSxDQUFDLFFBQVEsR0FBTyxRQUFRLENBQUE7QUFDNUIsUUFBSSxDQUFDLElBQUksR0FBVyxRQUFRLENBQUMsSUFBSSxJQUFJLEVBQUUsQ0FBQTtBQUN2QyxRQUFJLENBQUMsU0FBUyxHQUFNLE9BQU8sQ0FBQyxTQUFTLElBQUksV0FBVyxDQUFBO0FBQ3BELFFBQUksQ0FBQyxFQUFFLEdBQWEsT0FBTyxDQUFDLEVBQUUsQ0FBQTtBQUM5QixRQUFJLENBQUMsUUFBUSxDQUFDLEVBQUUsR0FBSSxJQUFJLENBQUMsRUFBRSxDQUFBOztBQUUzQixRQUFJLENBQUMsSUFBSSxHQUFHLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxJQUFJLFFBQVEsQ0FBQyxPQUFPLEVBQUUsQ0FBQTtBQUNoRCxRQUFJLENBQUMsU0FBUyxHQUFHLE1BQU0sQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFBOztBQUU1QyxVQUFNLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxPQUFPLENBQUMsVUFBQSxHQUFHO2FBQUksTUFBSyxHQUFHLENBQUMsR0FBRyxNQUFLLElBQUksQ0FBQyxHQUFHLENBQUM7S0FBQSxDQUFDLENBQUE7R0FDbEU7O2VBaEJrQixLQUFLOztXQWtCcEIsY0FBQyxRQUFRLEVBQUM7QUFDWixVQUFJLEtBQUssR0FBRyxJQUFJLENBQUMsUUFBUSxDQUFDLENBQUE7QUFDMUIsYUFBTyxPQUFPLEtBQUssQUFBQyxLQUFLLFVBQVUsR0FBRyxLQUFLLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxHQUFHLEtBQUssQ0FBQTtLQUMvRDs7O1dBRWEsMEJBQUU7QUFDZCxhQUFPLElBQUksQ0FBQyxRQUFRLENBQUMsY0FBYyxFQUFFLENBQUE7S0FDdEM7OztXQUVPLG9CQUFFO0FBQ1IsYUFBTyxZQUFZLEdBQUcsSUFBSSxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUE7S0FDekM7OztXQUVLLGtCQUFhO1VBQVosT0FBTyx5REFBQyxFQUFFOztBQUNmLGFBQU87QUFDTCxZQUFJLEVBQUUsSUFBSSxDQUFDLElBQUk7T0FDaEIsQ0FBQTtLQUNGOzs7V0FFYSwwQkFBRyxFQUVoQjs7O1dBRVUsdUJBQUcsRUFFYjs7O1dBRVcsd0JBQUU7QUFDWixhQUFPLElBQUksQ0FBQyxRQUFRLENBQUMsWUFBWSxFQUFFLENBQUE7S0FDcEM7OztXQUVrQiw2QkFBQyxTQUFTLEVBQUM7QUFDNUIsVUFBSSxFQUFFLEdBQUcsSUFBSSxDQUFDLFlBQVksRUFBRSxDQUFBO0FBQzVCLFVBQUcsRUFBRSxFQUFDO0FBQ0osZUFBTyxFQUFFLENBQUMsU0FBUyxDQUFDLENBQUE7T0FDckI7S0FDRjs7O1dBRU0saUJBQUMsY0FBYyxFQUFDOzs7QUFDckIsVUFBSSxNQUFNLEdBQUcsSUFBSSxDQUFDLHFCQUFxQixDQUFDLGNBQWMsQ0FBQyxDQUFBO0FBQ3ZELFVBQUksWUFBWSxHQUFHLE1BQU0sQ0FBQyxlQUFlLEVBQUUsQ0FBQTs7QUFFM0MsVUFBRyxDQUFDLFlBQVksRUFBQztBQUNmLGNBQU0sdUJBQXVCLEdBQUcsY0FBYyxDQUFDO09BQ2hEOztBQUVELFVBQUksVUFBVSxHQUFHLElBQUksQ0FBQyxtQkFBbUIsQ0FBQyxZQUFZLENBQUMsU0FBUyxDQUFDLENBQUE7O0FBRWpFLFVBQUcsTUFBTSxDQUFDLE9BQU8sRUFBQzs7QUFDaEIsY0FBSSxVQUFVLEdBQUcsT0FBSyxJQUFJLENBQUMsTUFBTSxDQUFDLEdBQUcsQ0FBQyxDQUFBO0FBQ3RDLGNBQUksZUFBZSxHQUFHLE1BQU0sQ0FBQyxVQUFVLENBQUE7O0FBRXZDO2VBQU8sVUFBVSxDQUFDLE1BQU0sQ0FBQyxVQUFBLEtBQUssRUFBSTtBQUNoQyxxQkFBTyxLQUFLLENBQUMsSUFBSSxDQUFDLGVBQWUsQ0FBQyxLQUFLLFVBQVUsQ0FBQTthQUNsRCxDQUFDO1lBQUE7Ozs7T0FDSDs7QUFFRCxVQUFHLE1BQU0sQ0FBQyxTQUFTLEVBQUM7O0FBQ2xCLGNBQUksVUFBVSxHQUFHLE9BQUssSUFBSSxDQUFDLE1BQU0sQ0FBQyxVQUFVLENBQUMsQ0FBQTtBQUM3QyxjQUFJLGVBQWUsR0FBRyxNQUFNLENBQUMsVUFBVSxDQUFBOztBQUV2QztlQUFPLFVBQVUsQ0FBQyxJQUFJLENBQUMsVUFBQSxLQUFLLEVBQUk7QUFDOUIscUJBQU8sS0FBSyxDQUFDLElBQUksQ0FBQyxlQUFlLENBQUMsS0FBSyxVQUFVLENBQUE7YUFDbEQsQ0FBQztZQUFBOzs7O09BQ0g7S0FDRjs7O1dBRWtCLCtCQUFFOzs7QUFDbkIsYUFBTyxJQUFJLENBQUMsUUFBUSxDQUFDLGVBQWUsRUFBRSxDQUFDLE1BQU0sQ0FBQyxVQUFBLElBQUksRUFBSTtBQUNwRCxlQUFPLE9BQUssdUJBQXVCLEVBQUUsQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsQ0FBQTtPQUNqRSxDQUFDLENBQUE7S0FDSDs7O1dBRWlCLDRCQUFDLEdBQUcsRUFBRTtBQUN0QixhQUFPLG1CQUFtQixFQUFFLENBQUMsR0FBRyxDQUFDLENBQUE7S0FDbEM7OztXQUVrQiwrQkFBRztBQUNwQixhQUFPLElBQUksQ0FBQyxrQkFBa0IsRUFBRSxDQUFDLFVBQVUsQ0FBQTtLQUM1Qzs7O1dBRWdCLDZCQUFFO0FBQ2pCLGFBQU8sSUFBSSxDQUFDLGtCQUFrQixFQUFFLENBQUMsUUFBUSxDQUFBO0tBQzFDOzs7V0FFcUIsa0NBQUU7QUFDdEIsYUFBTyxJQUFJLENBQUMsa0JBQWtCLEVBQUUsQ0FBQyxhQUFhLENBQUE7S0FDL0M7OztXQUVvQiwrQkFBQyxjQUFjLEVBQUM7QUFDbkMsYUFBTyxJQUFJLENBQUMsc0JBQXNCLEVBQUUsQ0FBQyxjQUFjLENBQUMsQ0FBQTtLQUNyRDs7O1dBRXNCLG1DQUFFO0FBQ3ZCLFVBQU0sR0FBRyxHQUFHLElBQUksQ0FBQyxpQkFBaUIsRUFBRSxDQUFBO0FBQ3BDLGFBQU8sT0FBTyxDQUFDLE1BQU0sQ0FBQyxNQUFNLENBQUMsR0FBRyxDQUFDLENBQUMsR0FBRyxDQUFDLFVBQUEsR0FBRztlQUFJLENBQUMsR0FBRyxDQUFDLElBQUksRUFBRSxHQUFHLENBQUMsT0FBTyxDQUFDO09BQUEsQ0FBQyxDQUFDLENBQUE7S0FDdkU7OztXQUVpQiw4QkFBRTtBQUNsQixhQUFPLDhCQUFnQixNQUFNLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFBO0tBQ3pDOzs7U0F0SGtCLEtBQUs7OztxQkFBTCxLQUFLIiwiZmlsZSI6Im1vZGVsLmpzIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IF8gZnJvbSAndW5kZXJzY29yZSdcbmltcG9ydCBpbmZsZWN0IGZyb20gJ2knXG5cbmltcG9ydCBEb2N1bWVudCBmcm9tICcuL2RvY3VtZW50J1xuaW1wb3J0IE1vZGVsRGVmaW5pdGlvbiBmcm9tICcuL21vZGVsX2RlZmluaXRpb24nXG5pbXBvcnQgQnJpZWZjYXNlIGZyb20gJy4vYnJpZWZjYXNlJ1xuaW1wb3J0IHtmcmFnbWVudH0gZnJvbSAnLi9yZW5kZXInXG5cbmNvbnN0IGZsYXR0ZW4gPSBfLmZsYXR0ZW5cbmNvbnN0IHN0cmluZyA9IGluZmxlY3QoKVxuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBNb2RlbCB7XG4gIHN0YXRpYyBmcm9tRG9jdW1lbnQgKGRvY3VtZW50KXtcbiAgICByZXR1cm4gbmV3IE1vZGVsKGRvY3VtZW50KVxuICB9XG5cbiAgY29uc3RydWN0b3IoZG9jdW1lbnQsIG9wdGlvbnM9e30pIHtcbiAgICB0aGlzLmRvY3VtZW50ICAgICA9IGRvY3VtZW50XG4gICAgdGhpcy5kYXRhICAgICAgICAgPSBkb2N1bWVudC5kYXRhIHx8IHt9XG4gICAgdGhpcy5ncm91cE5hbWUgICAgPSBvcHRpb25zLmdyb3VwTmFtZSB8fCBcImRvY3VtZW50c1wiXG4gICAgdGhpcy5pZCAgICAgICAgICAgPSBvcHRpb25zLmlkXG4gICAgdGhpcy5kb2N1bWVudC5pZCAgPSB0aGlzLmlkXG4gICAgXG4gICAgdGhpcy50eXBlID0gdGhpcy5kYXRhLnR5cGUgfHwgZG9jdW1lbnQuZ2V0VHlwZSgpXG4gICAgdGhpcy5ncm91cE5hbWUgPSBzdHJpbmcucGx1cmFsaXplKHRoaXMudHlwZSlcbiAgICBcbiAgICBPYmplY3Qua2V5cyh0aGlzLmRhdGEpLmZvckVhY2goa2V5ID0+IHRoaXNba2V5XSA9IHRoaXMuZGF0YVtrZXldKVxuICB9XG4gIFxuICByZWFkKHByb3BlcnR5KXtcbiAgICBsZXQgdmFsdWUgPSB0aGlzW3Byb3BlcnR5XVxuICAgIHJldHVybiB0eXBlb2YodmFsdWUpID09PSAnZnVuY3Rpb24nID8gdmFsdWUuY2FsbCh0aGlzKSA6IHZhbHVlXG4gIH1cblxuICBsYXN0TW9kaWZpZWRBdCgpe1xuICAgIHJldHVybiB0aGlzLmRvY3VtZW50Lmxhc3RNb2RpZmllZEF0KClcbiAgfVxuXG4gIHRvU3RyaW5nKCl7XG4gICAgcmV0dXJuICdEb2N1bWVudDogJyArIHRoaXMuZG9jdW1lbnQucGF0aFxuICB9XG5cbiAgdG9KU09OKG9wdGlvbnM9e30pIHtcbiAgICByZXR1cm4ge1xuICAgICAgZGF0YTogdGhpcy5kYXRhXG4gICAgfVxuICB9XG5cbiAgZXh0cmFjdENvbnRlbnQoKSB7XG5cbiAgfVxuXG4gIGV4dHJhY3REYXRhKCkge1xuXG4gIH1cbiAgXG4gIGdldEJyaWVmY2FzZSgpe1xuICAgIHJldHVybiB0aGlzLmRvY3VtZW50LmdldEJyaWVmY2FzZSgpXG4gIH1cblxuICBnZXRNb2RlbHNDb2xsZWN0aW9uKGdyb3VwTmFtZSl7XG4gICAgbGV0IGJjID0gdGhpcy5nZXRCcmllZmNhc2UoKVxuICAgIGlmKGJjKXtcbiAgICAgIHJldHVybiBiY1tncm91cE5hbWVdXG4gICAgfVxuICB9XG5cbiAgcmVsYXRlZChyZWxhdGlvbnNoaXBJZCl7XG4gICAgbGV0IGNvbmZpZyA9IHRoaXMuZ2V0UmVsYXRpb25zaGlwQ29uZmlnKHJlbGF0aW9uc2hpcElkKVxuICAgIGxldCByZWxhdGVkTW9kZWwgPSBjb25maWcubW9kZWxEZWZpbml0aW9uKClcblxuICAgIGlmKCFyZWxhdGVkTW9kZWwpe1xuICAgICAgdGhyb3coJ0ludmFsaWQgcmVsYXRpb25zaGlwICcgKyByZWxhdGlvbnNoaXBJZClcbiAgICB9XG5cbiAgICBsZXQgY29sbGVjdGlvbiA9IHRoaXMuZ2V0TW9kZWxzQ29sbGVjdGlvbihyZWxhdGVkTW9kZWwuZ3JvdXBOYW1lKSBcbiAgICBcbiAgICBpZihjb25maWcuaGFzTWFueSl7XG4gICAgICBsZXQgbXlLZXlWYWx1ZSA9IHRoaXMucmVhZChjb25maWcua2V5KVxuICAgICAgbGV0IGZvcmVpZ25LZXlGaWVsZCA9IGNvbmZpZy5mb3JlaWduS2V5XG5cbiAgICAgIHJldHVybiBjb2xsZWN0aW9uLmZpbHRlcihtb2RlbCA9PiB7XG4gICAgICAgIHJldHVybiBtb2RlbC5yZWFkKGZvcmVpZ25LZXlGaWVsZCkgPT09IG15S2V5VmFsdWUgICAgICAgIFxuICAgICAgfSlcbiAgICB9XG5cbiAgICBpZihjb25maWcuYmVsb25nc1RvKXtcbiAgICAgIGxldCBteUtleVZhbHVlID0gdGhpcy5yZWFkKGNvbmZpZy5mb3JlaWduS2V5KVxuICAgICAgbGV0IGZvcmVpZ25LZXlGaWVsZCA9IGNvbmZpZy5yZWZlcmVuY2VzXG5cbiAgICAgIHJldHVybiBjb2xsZWN0aW9uLmZpbmQobW9kZWwgPT4ge1xuICAgICAgICByZXR1cm4gbW9kZWwucmVhZChmb3JlaWduS2V5RmllbGQpID09PSBteUtleVZhbHVlICAgICAgICBcbiAgICAgIH0pXG4gICAgfVxuICB9XG5cbiAgZGVmaW5lZFNlY3Rpb25Ob2Rlcygpe1xuICAgIHJldHVybiB0aGlzLmRvY3VtZW50LmdldFNlY3Rpb25Ob2RlcygpLmZpbHRlcihub2RlID0+IHtcbiAgICAgIHJldHVybiB0aGlzLmV4cGVjdGVkU2VjdGlvbkhlYWRpbmdzKCkuaW5kZXhPZihub2RlLmhlYWRpbmcpID49IDBcbiAgICB9KVxuICB9XG5cbiAgZ2V0QXR0cmlidXRlQ29uZmlnKGtleSkge1xuICAgIHJldHVybiBnZXRBdHRyaWJ1dGVzQ29uZmlnKClba2V5XVxuICB9XG5cbiAgZ2V0QXR0cmlidXRlc0NvbmZpZygpIHtcbiAgICByZXR1cm4gdGhpcy5nZXRNb2RlbERlZmluaXRpb24oKS5hdHRyaWJ1dGVzXG4gIH1cblxuICBnZXRTZWN0aW9uc0NvbmZpZygpe1xuICAgIHJldHVybiB0aGlzLmdldE1vZGVsRGVmaW5pdGlvbigpLnNlY3Rpb25zXG4gIH1cbiAgXG4gIGdldFJlbGF0aW9uc2hpcHNDb25maWcoKXtcbiAgICByZXR1cm4gdGhpcy5nZXRNb2RlbERlZmluaXRpb24oKS5yZWxhdGlvbnNoaXBzXG4gIH1cblxuICBnZXRSZWxhdGlvbnNoaXBDb25maWcocmVsYXRpb25zaGlwSWQpe1xuICAgIHJldHVybiB0aGlzLmdldFJlbGF0aW9uc2hpcHNDb25maWcoKVtyZWxhdGlvbnNoaXBJZF1cbiAgfVxuXG4gIGV4cGVjdGVkU2VjdGlvbkhlYWRpbmdzKCl7XG4gICAgY29uc3QgY2ZnID0gdGhpcy5nZXRTZWN0aW9uc0NvbmZpZygpXG4gICAgcmV0dXJuIGZsYXR0ZW4oT2JqZWN0LnZhbHVlcyhjZmcpLm1hcChkZWYgPT4gW2RlZi5uYW1lLCBkZWYuYWxpYXNlc10pKVxuICB9XG5cbiAgZ2V0TW9kZWxEZWZpbml0aW9uKCl7XG4gICAgcmV0dXJuIE1vZGVsRGVmaW5pdGlvbi5sb29rdXAodGhpcy50eXBlKVxuICB9XG5cbn1cbiJdfQ==