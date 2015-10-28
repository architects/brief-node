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
      var relationships = this.getRelationshipsConfig();

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
//# sourceMappingURL=data:application/json;base64,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QUFBLEdBQUc7ZUFBSSxDQUFDLEdBQUcsQ0FBQyxJQUFJLEVBQUUsR0FBRyxDQUFDLE9BQU8sQ0FBQztPQUFBLENBQUMsQ0FBQyxDQUFBO0tBQ3ZFOzs7V0FFaUIsOEJBQUU7QUFDbEIsYUFBTyw4QkFBZ0IsTUFBTSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQTtLQUN6Qzs7O1NBOU1PLGVBQUU7QUFDUixhQUFPLElBQUksQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFBO0tBQzFCOzs7U0FwQmtCLEtBQUs7OztxQkFBTCxLQUFLIiwiZmlsZSI6Im1vZGVsLmpzIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IF8gZnJvbSAndW5kZXJzY29yZSdcbmltcG9ydCBpbmZsZWN0IGZyb20gJ2knXG5cbmltcG9ydCBEb2N1bWVudCBmcm9tICcuL2RvY3VtZW50J1xuaW1wb3J0IE1vZGVsRGVmaW5pdGlvbiBmcm9tICcuL21vZGVsX2RlZmluaXRpb24nXG5pbXBvcnQgQnJpZWZjYXNlIGZyb20gJy4vYnJpZWZjYXNlJ1xuaW1wb3J0IHtmcmFnbWVudH0gZnJvbSAnLi9yZW5kZXInXG5cbmNvbnN0IGZsYXR0ZW4gPSBfLmZsYXR0ZW5cbmNvbnN0IHN0cmluZyA9IGluZmxlY3QoKVxuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBNb2RlbCB7XG4gIHN0YXRpYyBmcm9tRG9jdW1lbnQgKGRvY3VtZW50KXtcbiAgICByZXR1cm4gbmV3IE1vZGVsKGRvY3VtZW50KVxuICB9XG5cbiAgY29uc3RydWN0b3IoZG9jdW1lbnQsIG9wdGlvbnM9e30pIHtcbiAgICB0aGlzLmRvY3VtZW50ICAgICA9IGRvY3VtZW50XG4gICAgdGhpcy5ncm91cE5hbWUgICAgPSBvcHRpb25zLmdyb3VwTmFtZSB8fCBcImRvY3VtZW50c1wiXG4gICAgdGhpcy5pZCAgICAgICAgICAgPSBvcHRpb25zLmlkXG4gICAgdGhpcy5kb2N1bWVudC5pZCAgPSB0aGlzLmlkXG4gICAgXG4gICAgdGhpcy50eXBlID0gZG9jdW1lbnQuZ2V0VHlwZSgpXG5cbiAgICB0aGlzLl9jcmVhdGVEYXRhR2V0dGVycygpXG4gICAgXG4gICAgdGhpcy5ncm91cE5hbWUgPSBzdHJpbmcucGx1cmFsaXplKHRoaXMudHlwZSlcbiAgfVxuICBcbiAgZ2V0IGRhdGEoKXtcbiAgICByZXR1cm4gdGhpcy5kb2N1bWVudC5kYXRhXG4gIH1cblxuICByZWFkKHByb3BlcnR5KXtcbiAgICBsZXQgdmFsdWUgPSB0aGlzW3Byb3BlcnR5XVxuICAgIHJldHVybiB0eXBlb2YodmFsdWUpID09PSAnZnVuY3Rpb24nID8gdmFsdWUuY2FsbCh0aGlzKSA6IHZhbHVlXG4gIH1cblxuICBsYXN0TW9kaWZpZWRBdCgpe1xuICAgIHJldHVybiB0aGlzLmRvY3VtZW50Lmxhc3RNb2RpZmllZEF0KClcbiAgfVxuXG4gIHRvU3RyaW5nKCl7XG4gICAgcmV0dXJuICdEb2N1bWVudDogJyArIHRoaXMuZG9jdW1lbnQucGF0aFxuICB9XG4gIFxuICAvKipcbiAgKiBzY29yZXMgYSBnaXZlbiBzZWFyY2ggdGVybSBhZ2FpbnN0IHRoaXMgbW9kZWwuXG4gICogdGhpcyBtZXRob2QgY2FuIGJlIG92ZXJyaWRkZW4gdG8gcHJvdmlkZSBjdXN0b20gbG9naWNcbiAgKiBmb3IgYSBnaXZlbiBtb2RlbFxuICAqL1xuICBzY29yZVNlYXJjaFRlcm0odGVybT1cIlwiLCBvcHRpb25zPXt9KXtcbiAgICBsZXQgc2NvcmUgPSAwXG5cbiAgICBpZih0aGlzLnRpdGxlICYmIHRoaXMudGl0bGUgPT09IHRlcm0pe1xuICAgICAgcmV0dXJuIDEwMFxuICAgIH1cblxuICAgIGlmKHRoaXMudGl0bGUgJiYgdGhpcy50aXRsZS5tYXRjaCh0ZXJtKSl7XG4gICAgICByZXR1cm4gOTBcbiAgICB9XG4gICAgXG4gICAgbGV0IHNlY3Rpb25IZWFkaW5ncyA9IHRoaXMuZG9jdW1lbnQuZ2V0U2VjdGlvbkhlYWRpbmdzKClcbiAgICBsZXQgYXJ0aWNsZUhlYWRpbmdzID0gdGhpcy5kb2N1bWVudC5nZXRBcnRpY2xlSGVhZGluZ3MoKVxuICAgIFxuICAgIHNjb3JlID0gc2NvcmUgKyBzZWN0aW9uSGVhZGluZ3MucmVkdWNlKChtZW1vLGhlYWRpbmcpPT57XG4gICAgICBpZihoZWFkaW5nID09PSB0ZXJtKXtcbiAgICAgICAgcmV0dXJuIG1lbW8gKyA1MFxuICAgICAgfVxuICAgICAgaWYoaGVhZGluZy5tYXRjaCh0ZXJtKSl7XG4gICAgICAgIHJldHVybiBtZW1vICsgMzBcbiAgICAgIH1cbiAgICAgIHJldHVybiBtZW1vXG4gICAgfSwgMClcblxuICAgIHNjb3JlID0gc2NvcmUgKyBhcnRpY2xlSGVhZGluZ3MucmVkdWNlKChtZW1vLGhlYWRpbmcpPT57XG4gICAgICBpZihoZWFkaW5nID09PSB0ZXJtKXtcbiAgICAgICAgcmV0dXJuIG1lbW8gKyA0MFxuICAgICAgfVxuICAgICAgaWYoaGVhZGluZy5tYXRjaCh0ZXJtKSl7XG4gICAgICAgIHJldHVybiBtZW1vICsgMjBcbiAgICAgIH1cbiAgICAgIHJldHVybiBtZW1vXG4gICAgfSwgMClcbiAgICBcbiAgICByZXR1cm4gc2NvcmVcbiAgfVxuIFxuICBmb3JFeHBvcnQob3B0aW9ucyA9IHt9KXtcbiAgICBsZXQgZm9yRXhwb3J0ID0ge1xuICAgICAgaWQ6IHRoaXMuaWQsXG4gICAgICBkYXRhOiB0aGlzLmRhdGEsXG4gICAgICBsYXN0TW9kaWZpZWQ6IHRoaXMubGFzdE1vZGlmaWVkQXQoKVxuICAgIH1cblxuICAgIGxldCBicmllZmNhc2UgPSB0aGlzLmdldEJyaWVmY2FzZSgpXG5cbiAgICBpZihicmllZmNhc2Upe1xuICAgICAgZm9yRXhwb3J0LmJyaWVmY2FzZSA9IHtcbiAgICAgICAgcm9vdDogYnJpZWZjYXNlLnJvb3QsXG4gICAgICAgIHRpdGxlOiBicmllZmNhc2UudGl0bGVcbiAgICAgIH1cbiAgICB9XG5cbiAgICBpZihvcHRpb25zLmluY2x1ZGVEb2N1bWVudCl7XG4gICAgICBmb3JFeHBvcnQuZG9jdW1lbnQgPSB7XG4gICAgICAgIHBhdGg6IHRoaXMuZG9jdW1lbnQucGF0aC5yZXBsYWNlKGJyaWVmY2FzZS5jb25maWcuZG9jc19wYXRoICsgJy8nLCAnJyksXG4gICAgICAgIGNvbnRlbnQ6IHRoaXMuZG9jdW1lbnQuY29udGVudCxcbiAgICAgICAgZGF0YTogdGhpcy5kb2N1bWVudC5kYXRhLFxuICAgICAgICB0eXBlOiB0aGlzLmRvY3VtZW50LmdldFR5cGUoKVxuICAgICAgfVxuXG4gICAgICBpZihvcHRpb25zLnJlbmRlckRvY3VtZW50KXtcbiAgICAgICAgZm9yRXhwb3J0LmRvY3VtZW50LnJlbmRlcmVkID0gdGhpcy5kb2N1bWVudC5yZW5kZXIoKVxuICAgICAgfVxuICAgIH1cblxuICAgIHJldHVybiBmb3JFeHBvcnRcbiAgfVxuXG4gIHRvSlNPTihvcHRpb25zPXt9KSB7XG4gICAgcmV0dXJuIHtcbiAgICAgIGlkOiB0aGlzLmlkLFxuICAgICAgZGF0YTogdGhpcy5kYXRhLFxuICAgICAgbGFzdE1vZGlmaWVkQXQ6IHRoaXMubGFzdE1vZGlmaWVkQXQoKSxcbiAgICB9XG4gIH1cbiAgXG4gIF9jcmVhdGVEYXRhR2V0dGVycygpe1xuICAgIGxldCBtb2RlbCA9IHRoaXNcblxuICAgIE9iamVjdC5rZXlzKHRoaXMuZG9jdW1lbnQuZGF0YSB8fCB7fSkuZm9yRWFjaChrZXkgPT4ge1xuICAgICAgaWYoa2V5ID09PSAndHlwZScpIHsgcmV0dXJuIH1cblxuICAgICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KG1vZGVsLCBrZXksIHtcbiAgICAgICAgZ2V0OiBmdW5jdGlvbigpe1xuICAgICAgICAgIHJldHVybiBtb2RlbC5kYXRhW2tleV1cbiAgICAgICAgfVxuICAgICAgfSlcbiAgICB9KVxuICB9XG5cbiAgZXh0cmFjdENvbnRlbnQoKSB7XG5cbiAgfVxuXG4gIGV4dHJhY3REYXRhKCkge1xuXG4gIH1cbiAgXG4gIGdldEJyaWVmY2FzZSgpe1xuICAgIHJldHVybiB0aGlzLmRvY3VtZW50LmdldEJyaWVmY2FzZSgpXG4gIH1cblxuICBnZXRNb2RlbHNDb2xsZWN0aW9uKGdyb3VwTmFtZSl7XG4gICAgbGV0IGJjID0gdGhpcy5nZXRCcmllZmNhc2UoKVxuICAgIGlmKGJjKXtcbiAgICAgIHJldHVybiBiY1tncm91cE5hbWVdXG4gICAgfVxuICB9XG5cbiAgcmVsYXRpb25JZHMoKXtcbiAgICBsZXQgcmVsYXRpb25zaGlwcyA9IHRoaXMuZ2V0UmVsYXRpb25zaGlwc0NvbmZpZygpXG5cbiAgICByZXR1cm4gcmVsYXRpb25zaGlwcy5yZWR1Y2UoZnVuY3Rpb24obWVtbyxyZWxhdGlvbnNoaXBJZCl7XG4gICAgICBtZW1vW3JlbGF0aW9uc2hpcElkXSA9IFtdXG4gICAgICBsZXQgcmVsYXRlZElkcyA9IHRoaXMucmVsYXRlZChyZWxhdGlvbnNoaXBJZCkubWFwKHJlbGF0aW9uID0+IHJlbGF0aW9uLmlkKVxuXG4gICAgICBtZW1vW3JlbGF0aW9uc2hpcElkXS5jb25jYXQocmVsYXRlZElkcylcbiAgICAgIHJldHVybiBtZW1vIFxuICAgIH0sIHt9KVxuICB9XG5cbiAgcmVsYXRlZChyZWxhdGlvbnNoaXBJZCl7XG4gICAgbGV0IGNvbmZpZyA9IHRoaXMuZ2V0UmVsYXRpb25zaGlwQ29uZmlnKHJlbGF0aW9uc2hpcElkKVxuICAgIGxldCByZWxhdGVkTW9kZWwgPSBjb25maWcubW9kZWxEZWZpbml0aW9uKClcblxuICAgIGlmKCFyZWxhdGVkTW9kZWwpe1xuICAgICAgdGhyb3coJ0ludmFsaWQgcmVsYXRpb25zaGlwICcgKyByZWxhdGlvbnNoaXBJZClcbiAgICB9XG5cbiAgICBsZXQgY29sbGVjdGlvbiA9IHRoaXMuZ2V0TW9kZWxzQ29sbGVjdGlvbihyZWxhdGVkTW9kZWwuZ3JvdXBOYW1lKSB8fCBfKFtdKVxuICAgIFxuICAgIGlmKGNvbmZpZy5oYXNNYW55KXtcbiAgICAgIGxldCBteUtleVZhbHVlID0gdGhpcy5yZWFkKGNvbmZpZy5rZXkpXG4gICAgICBsZXQgZm9yZWlnbktleUZpZWxkID0gY29uZmlnLmZvcmVpZ25LZXlcbiAgICAgIFxuICAgICAgcmV0dXJuIGNvbGxlY3Rpb24uZmlsdGVyKG1vZGVsID0+IHtcbiAgICAgICAgcmV0dXJuIG1vZGVsLnJlYWQoZm9yZWlnbktleUZpZWxkKSA9PT0gbXlLZXlWYWx1ZSAgICAgICAgXG4gICAgICB9KVxuICAgIH1cblxuICAgIGlmKGNvbmZpZy5iZWxvbmdzVG8pe1xuICAgICAgbGV0IG15S2V5VmFsdWUgPSB0aGlzLnJlYWQoY29uZmlnLmZvcmVpZ25LZXkpXG4gICAgICBsZXQgZm9yZWlnbktleUZpZWxkID0gY29uZmlnLnJlZmVyZW5jZXNcblxuICAgICAgcmV0dXJuIGNvbGxlY3Rpb24uZmluZChtb2RlbCA9PiB7XG4gICAgICAgIHJldHVybiBtb2RlbC5yZWFkKGZvcmVpZ25LZXlGaWVsZCkgPT09IG15S2V5VmFsdWUgICAgICAgIFxuICAgICAgfSlcbiAgICB9XG4gIH1cblxuICBkZWZpbmVkU2VjdGlvbk5vZGVzKCl7XG4gICAgcmV0dXJuIHRoaXMuZG9jdW1lbnQuZ2V0U2VjdGlvbk5vZGVzKCkuZmlsdGVyKG5vZGUgPT4ge1xuICAgICAgcmV0dXJuIHRoaXMuZXhwZWN0ZWRTZWN0aW9uSGVhZGluZ3MoKS5pbmRleE9mKG5vZGUuaGVhZGluZykgPj0gMFxuICAgIH0pXG4gIH1cblxuICBnZXRBdHRyaWJ1dGVDb25maWcoa2V5KSB7XG4gICAgcmV0dXJuIGdldEF0dHJpYnV0ZXNDb25maWcoKVtrZXldXG4gIH1cblxuICBnZXRBdHRyaWJ1dGVzQ29uZmlnKCkge1xuICAgIHJldHVybiB0aGlzLmdldE1vZGVsRGVmaW5pdGlvbigpLmF0dHJpYnV0ZXNcbiAgfVxuXG4gIGdldFNlY3Rpb25zQ29uZmlnKCl7XG4gICAgcmV0dXJuIHRoaXMuZ2V0TW9kZWxEZWZpbml0aW9uKCkuc2VjdGlvbnNcbiAgfVxuICBcbiAgZ2V0UmVsYXRpb25zaGlwc0NvbmZpZygpe1xuICAgIHJldHVybiB0aGlzLmdldE1vZGVsRGVmaW5pdGlvbigpLnJlbGF0aW9uc2hpcHNcbiAgfVxuXG4gIGdldFJlbGF0aW9uc2hpcENvbmZpZyhyZWxhdGlvbnNoaXBJZCl7XG4gICAgcmV0dXJuIHRoaXMuZ2V0UmVsYXRpb25zaGlwc0NvbmZpZygpW3JlbGF0aW9uc2hpcElkXVxuICB9XG5cbiAgZXhwZWN0ZWRTZWN0aW9uSGVhZGluZ3MoKXtcbiAgICBjb25zdCBjZmcgPSB0aGlzLmdldFNlY3Rpb25zQ29uZmlnKClcbiAgICByZXR1cm4gZmxhdHRlbihPYmplY3QudmFsdWVzKGNmZykubWFwKGRlZiA9PiBbZGVmLm5hbWUsIGRlZi5hbGlhc2VzXSkpXG4gIH1cblxuICBnZXRNb2RlbERlZmluaXRpb24oKXtcbiAgICByZXR1cm4gTW9kZWxEZWZpbml0aW9uLmxvb2t1cCh0aGlzLnR5cGUpXG4gIH1cblxufVxuIl19