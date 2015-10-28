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

    /**
    * scores a given search term against this model.
    * this method can be overridden to provide custom logic
    * for a given model
    */
  }, {
    key: 'scoreSearchTerm',
    value: function scoreSearchTerm() {
      var term = arguments.length <= 0 || arguments[0] === undefined ? "" : arguments[0];
      var options = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

      var score = 0;

      if (this.title && this.title === term) {
        return 100;
      }

      if (this.title && this.title.match(term)) {
        return 90;
      }

      var sectionHeadings = this.document.getSectionHeadings();
      var articleHeadings = this.document.getArticleHeadings();

      score = score + sectionHeadings.reduce(function (memo, heading) {
        if (heading === term) {
          return memo + 50;
        }
        if (heading.match(term)) {
          return memo + 30;
        }
        return memo;
      }, 0);

      score = score + articleHeadings.reduce(function (memo, heading) {
        if (heading === term) {
          return memo + 40;
        }
        if (heading.match(term)) {
          return memo + 20;
        }
        return memo;
      }, 0);

      return score;
    }
  }, {
    key: 'forExport',
    value: function forExport() {
      var options = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

      var forExport = {
        id: this.id,
        data: this.data,
        lastModified: this.lastModifiedAt()
      };

      var briefcase = this.getBriefcase();

      if (briefcase) {
        forExport.briefcase = {
          root: briefcase.root,
          title: briefcase.title
        };
      }

      if (options.includeDocument) {
        forExport.document = {
          path: this.document.path.replace(briefcase.config.docs_path + '/', ''),
          content: this.document.content,
          data: this.document.data,
          type: this.document.getType()
        };

        if (options.renderDocument) {
          forExport.document.rendered = this.document.render();
        }
      }

      return forExport;
    }
  }, {
    key: 'toJSON',
    value: function toJSON() {
      var options = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

      return {
        id: this.id,
        data: this.data,
        lastModifiedAt: this.lastModifiedAt()
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
    key: 'relationIds',
    value: function relationIds() {
      var relationships = this.config.relationships;

      return relationships.reduce(function (memo, relationshipId) {
        memo[relationshipId] = [];
        var relatedIds = this.related(relationshipId).map(function (relation) {
          return relation.id;
        });

        memo[relationshipId].concat(relatedIds);
        return memo;
      }, {});
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

      var collection = this.getModelsCollection(relatedModel.groupName) || (0, _underscore2['default'])([]);

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
      return this.config.attributes[key];
    }
  }, {
    key: 'getRelationshipConfig',
    value: function getRelationshipConfig(relationshipId) {
      return this.config.relationships[relationshipId];
    }
  }, {
    key: 'expectedSectionHeadings',
    value: function expectedSectionHeadings() {
      return flatten(Object.values(this.config.sections).map(function (def) {
        return [def.name, def.aliases];
      }));
    }
  }, {
    key: 'getModelDefinition',
    value: function getModelDefinition() {
      console.log('Deprecated getModelDefinition');
      return this.modelDefinition;
    }
  }, {
    key: 'data',
    get: function get() {
      return this.document.data;
    }
  }, {
    key: 'config',
    get: function get() {
      return {
        attributes: this.modelDefinition.attributes,
        relationships: this.modelDefinition.relationships,
        sections: this.modelDefinition.sections
      };
    }
  }, {
    key: 'modelDefinition',
    get: function get() {
      return _model_definition2['default'].lookup(this.type);
    }
  }]);

  return Model;
})();

exports['default'] = Model;
module.exports = exports['default'];
//# sourceMappingURL=data:application/json;base64,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QUFRLENBQUMsSUFBSSxDQUFBO0tBQzFCOzs7U0FpTFMsZUFBRTtBQUNWLGFBQU87QUFDTCxrQkFBVSxFQUFFLElBQUksQ0FBQyxlQUFlLENBQUMsVUFBVTtBQUMzQyxxQkFBYSxFQUFFLElBQUksQ0FBQyxlQUFlLENBQUMsYUFBYTtBQUNqRCxnQkFBUSxFQUFFLElBQUksQ0FBQyxlQUFlLENBQUMsUUFBUTtPQUN4QyxDQUFBO0tBQ0Y7OztTQW1Ca0IsZUFBRTtBQUNuQixhQUFPLDhCQUFnQixNQUFNLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFBO0tBQ3pDOzs7U0FoT2tCLEtBQUs7OztxQkFBTCxLQUFLIiwiZmlsZSI6Im1vZGVsLmpzIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IF8gZnJvbSAndW5kZXJzY29yZSdcbmltcG9ydCBpbmZsZWN0IGZyb20gJ2knXG5cbmltcG9ydCBEb2N1bWVudCBmcm9tICcuL2RvY3VtZW50J1xuaW1wb3J0IE1vZGVsRGVmaW5pdGlvbiBmcm9tICcuL21vZGVsX2RlZmluaXRpb24nXG5pbXBvcnQgQnJpZWZjYXNlIGZyb20gJy4vYnJpZWZjYXNlJ1xuaW1wb3J0IHtmcmFnbWVudH0gZnJvbSAnLi9yZW5kZXInXG5cbmNvbnN0IGZsYXR0ZW4gPSBfLmZsYXR0ZW5cbmNvbnN0IHN0cmluZyA9IGluZmxlY3QoKVxuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBNb2RlbCB7XG4gIHN0YXRpYyBmcm9tRG9jdW1lbnQgKGRvY3VtZW50KXtcbiAgICByZXR1cm4gbmV3IE1vZGVsKGRvY3VtZW50KVxuICB9XG5cbiAgY29uc3RydWN0b3IoZG9jdW1lbnQsIG9wdGlvbnM9e30pIHtcbiAgICB0aGlzLmRvY3VtZW50ICAgICA9IGRvY3VtZW50XG4gICAgdGhpcy5ncm91cE5hbWUgICAgPSBvcHRpb25zLmdyb3VwTmFtZSB8fCBcImRvY3VtZW50c1wiXG4gICAgdGhpcy5pZCAgICAgICAgICAgPSBvcHRpb25zLmlkXG4gICAgdGhpcy5kb2N1bWVudC5pZCAgPSB0aGlzLmlkXG4gICAgXG4gICAgdGhpcy50eXBlID0gZG9jdW1lbnQuZ2V0VHlwZSgpXG5cbiAgICB0aGlzLl9jcmVhdGVEYXRhR2V0dGVycygpXG4gICAgXG4gICAgdGhpcy5ncm91cE5hbWUgPSBzdHJpbmcucGx1cmFsaXplKHRoaXMudHlwZSlcbiAgfVxuICBcbiAgZ2V0IGRhdGEoKXtcbiAgICByZXR1cm4gdGhpcy5kb2N1bWVudC5kYXRhXG4gIH1cblxuICByZWFkKHByb3BlcnR5KXtcbiAgICBsZXQgdmFsdWUgPSB0aGlzW3Byb3BlcnR5XVxuICAgIHJldHVybiB0eXBlb2YodmFsdWUpID09PSAnZnVuY3Rpb24nID8gdmFsdWUuY2FsbCh0aGlzKSA6IHZhbHVlXG4gIH1cblxuICBsYXN0TW9kaWZpZWRBdCgpe1xuICAgIHJldHVybiB0aGlzLmRvY3VtZW50Lmxhc3RNb2RpZmllZEF0KClcbiAgfVxuXG4gIHRvU3RyaW5nKCl7XG4gICAgcmV0dXJuICdEb2N1bWVudDogJyArIHRoaXMuZG9jdW1lbnQucGF0aFxuICB9XG4gIFxuICAvKipcbiAgKiBzY29yZXMgYSBnaXZlbiBzZWFyY2ggdGVybSBhZ2FpbnN0IHRoaXMgbW9kZWwuXG4gICogdGhpcyBtZXRob2QgY2FuIGJlIG92ZXJyaWRkZW4gdG8gcHJvdmlkZSBjdXN0b20gbG9naWNcbiAgKiBmb3IgYSBnaXZlbiBtb2RlbFxuICAqL1xuICBzY29yZVNlYXJjaFRlcm0odGVybT1cIlwiLCBvcHRpb25zPXt9KXtcbiAgICBsZXQgc2NvcmUgPSAwXG5cbiAgICBpZih0aGlzLnRpdGxlICYmIHRoaXMudGl0bGUgPT09IHRlcm0pe1xuICAgICAgcmV0dXJuIDEwMFxuICAgIH1cblxuICAgIGlmKHRoaXMudGl0bGUgJiYgdGhpcy50aXRsZS5tYXRjaCh0ZXJtKSl7XG4gICAgICByZXR1cm4gOTBcbiAgICB9XG4gICAgXG4gICAgbGV0IHNlY3Rpb25IZWFkaW5ncyA9IHRoaXMuZG9jdW1lbnQuZ2V0U2VjdGlvbkhlYWRpbmdzKClcbiAgICBsZXQgYXJ0aWNsZUhlYWRpbmdzID0gdGhpcy5kb2N1bWVudC5nZXRBcnRpY2xlSGVhZGluZ3MoKVxuICAgIFxuICAgIHNjb3JlID0gc2NvcmUgKyBzZWN0aW9uSGVhZGluZ3MucmVkdWNlKChtZW1vLGhlYWRpbmcpPT57XG4gICAgICBpZihoZWFkaW5nID09PSB0ZXJtKXtcbiAgICAgICAgcmV0dXJuIG1lbW8gKyA1MFxuICAgICAgfVxuICAgICAgaWYoaGVhZGluZy5tYXRjaCh0ZXJtKSl7XG4gICAgICAgIHJldHVybiBtZW1vICsgMzBcbiAgICAgIH1cbiAgICAgIHJldHVybiBtZW1vXG4gICAgfSwgMClcblxuICAgIHNjb3JlID0gc2NvcmUgKyBhcnRpY2xlSGVhZGluZ3MucmVkdWNlKChtZW1vLGhlYWRpbmcpPT57XG4gICAgICBpZihoZWFkaW5nID09PSB0ZXJtKXtcbiAgICAgICAgcmV0dXJuIG1lbW8gKyA0MFxuICAgICAgfVxuICAgICAgaWYoaGVhZGluZy5tYXRjaCh0ZXJtKSl7XG4gICAgICAgIHJldHVybiBtZW1vICsgMjBcbiAgICAgIH1cbiAgICAgIHJldHVybiBtZW1vXG4gICAgfSwgMClcbiAgICBcbiAgICByZXR1cm4gc2NvcmVcbiAgfVxuIFxuICBmb3JFeHBvcnQob3B0aW9ucyA9IHt9KXtcbiAgICBsZXQgZm9yRXhwb3J0ID0ge1xuICAgICAgaWQ6IHRoaXMuaWQsXG4gICAgICBkYXRhOiB0aGlzLmRhdGEsXG4gICAgICBsYXN0TW9kaWZpZWQ6IHRoaXMubGFzdE1vZGlmaWVkQXQoKVxuICAgIH1cblxuICAgIGxldCBicmllZmNhc2UgPSB0aGlzLmdldEJyaWVmY2FzZSgpXG5cbiAgICBpZihicmllZmNhc2Upe1xuICAgICAgZm9yRXhwb3J0LmJyaWVmY2FzZSA9IHtcbiAgICAgICAgcm9vdDogYnJpZWZjYXNlLnJvb3QsXG4gICAgICAgIHRpdGxlOiBicmllZmNhc2UudGl0bGVcbiAgICAgIH1cbiAgICB9XG5cbiAgICBpZihvcHRpb25zLmluY2x1ZGVEb2N1bWVudCl7XG4gICAgICBmb3JFeHBvcnQuZG9jdW1lbnQgPSB7XG4gICAgICAgIHBhdGg6IHRoaXMuZG9jdW1lbnQucGF0aC5yZXBsYWNlKGJyaWVmY2FzZS5jb25maWcuZG9jc19wYXRoICsgJy8nLCAnJyksXG4gICAgICAgIGNvbnRlbnQ6IHRoaXMuZG9jdW1lbnQuY29udGVudCxcbiAgICAgICAgZGF0YTogdGhpcy5kb2N1bWVudC5kYXRhLFxuICAgICAgICB0eXBlOiB0aGlzLmRvY3VtZW50LmdldFR5cGUoKVxuICAgICAgfVxuXG4gICAgICBpZihvcHRpb25zLnJlbmRlckRvY3VtZW50KXtcbiAgICAgICAgZm9yRXhwb3J0LmRvY3VtZW50LnJlbmRlcmVkID0gdGhpcy5kb2N1bWVudC5yZW5kZXIoKVxuICAgICAgfVxuICAgIH1cblxuICAgIHJldHVybiBmb3JFeHBvcnRcbiAgfVxuXG4gIHRvSlNPTihvcHRpb25zPXt9KSB7XG4gICAgcmV0dXJuIHtcbiAgICAgIGlkOiB0aGlzLmlkLFxuICAgICAgZGF0YTogdGhpcy5kYXRhLFxuICAgICAgbGFzdE1vZGlmaWVkQXQ6IHRoaXMubGFzdE1vZGlmaWVkQXQoKSxcbiAgICB9XG4gIH1cbiAgXG4gIF9jcmVhdGVEYXRhR2V0dGVycygpe1xuICAgIGxldCBtb2RlbCA9IHRoaXNcblxuICAgIE9iamVjdC5rZXlzKHRoaXMuZG9jdW1lbnQuZGF0YSB8fCB7fSkuZm9yRWFjaChrZXkgPT4ge1xuICAgICAgaWYoa2V5ID09PSAndHlwZScpIHsgcmV0dXJuIH1cblxuICAgICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KG1vZGVsLCBrZXksIHtcbiAgICAgICAgZ2V0OiBmdW5jdGlvbigpe1xuICAgICAgICAgIHJldHVybiBtb2RlbC5kYXRhW2tleV1cbiAgICAgICAgfVxuICAgICAgfSlcbiAgICB9KVxuICB9XG5cbiAgZXh0cmFjdENvbnRlbnQoKSB7XG5cbiAgfVxuXG4gIGV4dHJhY3REYXRhKCkge1xuXG4gIH1cbiAgXG4gIGdldEJyaWVmY2FzZSgpe1xuICAgIHJldHVybiB0aGlzLmRvY3VtZW50LmdldEJyaWVmY2FzZSgpXG4gIH1cblxuICBnZXRNb2RlbHNDb2xsZWN0aW9uKGdyb3VwTmFtZSl7XG4gICAgbGV0IGJjID0gdGhpcy5nZXRCcmllZmNhc2UoKVxuICAgIGlmKGJjKXtcbiAgICAgIHJldHVybiBiY1tncm91cE5hbWVdXG4gICAgfVxuICB9XG5cbiAgcmVsYXRpb25JZHMoKXtcbiAgICBsZXQgcmVsYXRpb25zaGlwcyA9IHRoaXMuY29uZmlnLnJlbGF0aW9uc2hpcHNcblxuICAgIHJldHVybiByZWxhdGlvbnNoaXBzLnJlZHVjZShmdW5jdGlvbihtZW1vLHJlbGF0aW9uc2hpcElkKXtcbiAgICAgIG1lbW9bcmVsYXRpb25zaGlwSWRdID0gW11cbiAgICAgIGxldCByZWxhdGVkSWRzID0gdGhpcy5yZWxhdGVkKHJlbGF0aW9uc2hpcElkKS5tYXAocmVsYXRpb24gPT4gcmVsYXRpb24uaWQpXG5cbiAgICAgIG1lbW9bcmVsYXRpb25zaGlwSWRdLmNvbmNhdChyZWxhdGVkSWRzKVxuICAgICAgcmV0dXJuIG1lbW8gXG4gICAgfSwge30pXG4gIH1cblxuICByZWxhdGVkKHJlbGF0aW9uc2hpcElkKXtcbiAgICBsZXQgY29uZmlnID0gdGhpcy5nZXRSZWxhdGlvbnNoaXBDb25maWcocmVsYXRpb25zaGlwSWQpXG4gICAgbGV0IHJlbGF0ZWRNb2RlbCA9IGNvbmZpZy5tb2RlbERlZmluaXRpb24oKVxuXG4gICAgaWYoIXJlbGF0ZWRNb2RlbCl7XG4gICAgICB0aHJvdygnSW52YWxpZCByZWxhdGlvbnNoaXAgJyArIHJlbGF0aW9uc2hpcElkKVxuICAgIH1cblxuICAgIGxldCBjb2xsZWN0aW9uID0gdGhpcy5nZXRNb2RlbHNDb2xsZWN0aW9uKHJlbGF0ZWRNb2RlbC5ncm91cE5hbWUpIHx8IF8oW10pXG4gICAgXG4gICAgaWYoY29uZmlnLmhhc01hbnkpe1xuICAgICAgbGV0IG15S2V5VmFsdWUgPSB0aGlzLnJlYWQoY29uZmlnLmtleSlcbiAgICAgIGxldCBmb3JlaWduS2V5RmllbGQgPSBjb25maWcuZm9yZWlnbktleVxuICAgICAgXG4gICAgICByZXR1cm4gY29sbGVjdGlvbi5maWx0ZXIobW9kZWwgPT4ge1xuICAgICAgICByZXR1cm4gbW9kZWwucmVhZChmb3JlaWduS2V5RmllbGQpID09PSBteUtleVZhbHVlICAgICAgICBcbiAgICAgIH0pXG4gICAgfVxuXG4gICAgaWYoY29uZmlnLmJlbG9uZ3NUbyl7XG4gICAgICBsZXQgbXlLZXlWYWx1ZSA9IHRoaXMucmVhZChjb25maWcuZm9yZWlnbktleSlcbiAgICAgIGxldCBmb3JlaWduS2V5RmllbGQgPSBjb25maWcucmVmZXJlbmNlc1xuXG4gICAgICByZXR1cm4gY29sbGVjdGlvbi5maW5kKG1vZGVsID0+IHtcbiAgICAgICAgcmV0dXJuIG1vZGVsLnJlYWQoZm9yZWlnbktleUZpZWxkKSA9PT0gbXlLZXlWYWx1ZSAgICAgICAgXG4gICAgICB9KVxuICAgIH1cbiAgfVxuXG4gIGRlZmluZWRTZWN0aW9uTm9kZXMoKXtcbiAgICByZXR1cm4gdGhpcy5kb2N1bWVudC5nZXRTZWN0aW9uTm9kZXMoKS5maWx0ZXIobm9kZSA9PiB7XG4gICAgICByZXR1cm4gdGhpcy5leHBlY3RlZFNlY3Rpb25IZWFkaW5ncygpLmluZGV4T2Yobm9kZS5oZWFkaW5nKSA+PSAwXG4gICAgfSlcbiAgfVxuICBcbiAgZ2V0IGNvbmZpZygpe1xuICAgIHJldHVybiB7XG4gICAgICBhdHRyaWJ1dGVzOiB0aGlzLm1vZGVsRGVmaW5pdGlvbi5hdHRyaWJ1dGVzLFxuICAgICAgcmVsYXRpb25zaGlwczogdGhpcy5tb2RlbERlZmluaXRpb24ucmVsYXRpb25zaGlwcyxcbiAgICAgIHNlY3Rpb25zOiB0aGlzLm1vZGVsRGVmaW5pdGlvbi5zZWN0aW9uc1xuICAgIH1cbiAgfVxuXG4gIGdldEF0dHJpYnV0ZUNvbmZpZyhrZXkpIHtcbiAgICByZXR1cm4gdGhpcy5jb25maWcuYXR0cmlidXRlc1trZXldXG4gIH1cbiBcbiAgZ2V0UmVsYXRpb25zaGlwQ29uZmlnKHJlbGF0aW9uc2hpcElkKXtcbiAgICByZXR1cm4gdGhpcy5jb25maWcucmVsYXRpb25zaGlwc1tyZWxhdGlvbnNoaXBJZF1cbiAgfVxuXG4gIGV4cGVjdGVkU2VjdGlvbkhlYWRpbmdzKCl7XG4gICAgcmV0dXJuIGZsYXR0ZW4oT2JqZWN0LnZhbHVlcyh0aGlzLmNvbmZpZy5zZWN0aW9ucykubWFwKGRlZiA9PiBbZGVmLm5hbWUsIGRlZi5hbGlhc2VzXSkpXG4gIH1cbiAgXG4gIGdldE1vZGVsRGVmaW5pdGlvbigpe1xuICAgIGNvbnNvbGUubG9nKCdEZXByZWNhdGVkIGdldE1vZGVsRGVmaW5pdGlvbicpXG4gICAgcmV0dXJuIHRoaXMubW9kZWxEZWZpbml0aW9uXG4gIH1cbiAgXG4gIGdldCBtb2RlbERlZmluaXRpb24oKXtcbiAgICByZXR1cm4gTW9kZWxEZWZpbml0aW9uLmxvb2t1cCh0aGlzLnR5cGUpXG4gIH1cbn1cbiJdfQ==