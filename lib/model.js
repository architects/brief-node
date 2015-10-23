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
//# sourceMappingURL=data:application/json;base64,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LDhCQUFnQixNQUFNLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFBO0tBQ3pDOzs7U0ExTU8sZUFBRTtBQUNSLGFBQU8sSUFBSSxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUE7S0FDMUI7OztTQXBCa0IsS0FBSzs7O3FCQUFMLEtBQUsiLCJmaWxlIjoibW9kZWwuanMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgXyBmcm9tICd1bmRlcnNjb3JlJ1xuaW1wb3J0IGluZmxlY3QgZnJvbSAnaSdcblxuaW1wb3J0IERvY3VtZW50IGZyb20gJy4vZG9jdW1lbnQnXG5pbXBvcnQgTW9kZWxEZWZpbml0aW9uIGZyb20gJy4vbW9kZWxfZGVmaW5pdGlvbidcbmltcG9ydCBCcmllZmNhc2UgZnJvbSAnLi9icmllZmNhc2UnXG5pbXBvcnQge2ZyYWdtZW50fSBmcm9tICcuL3JlbmRlcidcblxuY29uc3QgZmxhdHRlbiA9IF8uZmxhdHRlblxuY29uc3Qgc3RyaW5nID0gaW5mbGVjdCgpXG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIE1vZGVsIHtcbiAgc3RhdGljIGZyb21Eb2N1bWVudCAoZG9jdW1lbnQpe1xuICAgIHJldHVybiBuZXcgTW9kZWwoZG9jdW1lbnQpXG4gIH1cblxuICBjb25zdHJ1Y3Rvcihkb2N1bWVudCwgb3B0aW9ucz17fSkge1xuICAgIHRoaXMuZG9jdW1lbnQgICAgID0gZG9jdW1lbnRcbiAgICB0aGlzLmdyb3VwTmFtZSAgICA9IG9wdGlvbnMuZ3JvdXBOYW1lIHx8IFwiZG9jdW1lbnRzXCJcbiAgICB0aGlzLmlkICAgICAgICAgICA9IG9wdGlvbnMuaWRcbiAgICB0aGlzLmRvY3VtZW50LmlkICA9IHRoaXMuaWRcbiAgICBcbiAgICB0aGlzLnR5cGUgPSBkb2N1bWVudC5nZXRUeXBlKClcblxuICAgIHRoaXMuX2NyZWF0ZURhdGFHZXR0ZXJzKClcbiAgICBcbiAgICB0aGlzLmdyb3VwTmFtZSA9IHN0cmluZy5wbHVyYWxpemUodGhpcy50eXBlKVxuICB9XG4gIFxuICBnZXQgZGF0YSgpe1xuICAgIHJldHVybiB0aGlzLmRvY3VtZW50LmRhdGFcbiAgfVxuXG4gIHJlYWQocHJvcGVydHkpe1xuICAgIGxldCB2YWx1ZSA9IHRoaXNbcHJvcGVydHldXG4gICAgcmV0dXJuIHR5cGVvZih2YWx1ZSkgPT09ICdmdW5jdGlvbicgPyB2YWx1ZS5jYWxsKHRoaXMpIDogdmFsdWVcbiAgfVxuXG4gIGxhc3RNb2RpZmllZEF0KCl7XG4gICAgcmV0dXJuIHRoaXMuZG9jdW1lbnQubGFzdE1vZGlmaWVkQXQoKVxuICB9XG5cbiAgdG9TdHJpbmcoKXtcbiAgICByZXR1cm4gJ0RvY3VtZW50OiAnICsgdGhpcy5kb2N1bWVudC5wYXRoXG4gIH1cbiAgXG4gIC8qKlxuICAqIHNjb3JlcyBhIGdpdmVuIHNlYXJjaCB0ZXJtIGFnYWluc3QgdGhpcyBtb2RlbC5cbiAgKiB0aGlzIG1ldGhvZCBjYW4gYmUgb3ZlcnJpZGRlbiB0byBwcm92aWRlIGN1c3RvbSBsb2dpY1xuICAqIGZvciBhIGdpdmVuIG1vZGVsXG4gICovXG4gIHNjb3JlU2VhcmNoVGVybSh0ZXJtPVwiXCIsIG9wdGlvbnM9e30pe1xuICAgIGxldCBzY29yZSA9IDBcblxuICAgIGlmKHRoaXMudGl0bGUgJiYgdGhpcy50aXRsZSA9PT0gdGVybSl7XG4gICAgICByZXR1cm4gMTAwXG4gICAgfVxuXG4gICAgaWYodGhpcy50aXRsZSAmJiB0aGlzLnRpdGxlLm1hdGNoKHRlcm0pKXtcbiAgICAgIHJldHVybiA5MFxuICAgIH1cbiAgICBcbiAgICBsZXQgc2VjdGlvbkhlYWRpbmdzID0gdGhpcy5kb2N1bWVudC5nZXRTZWN0aW9uSGVhZGluZ3MoKVxuICAgIGxldCBhcnRpY2xlSGVhZGluZ3MgPSB0aGlzLmRvY3VtZW50LmdldEFydGljbGVIZWFkaW5ncygpXG4gICAgXG4gICAgc2NvcmUgPSBzY29yZSArIHNlY3Rpb25IZWFkaW5ncy5yZWR1Y2UoKG1lbW8saGVhZGluZyk9PntcbiAgICAgIGlmKGhlYWRpbmcgPT09IHRlcm0pe1xuICAgICAgICByZXR1cm4gbWVtbyArIDUwXG4gICAgICB9XG4gICAgICBpZihoZWFkaW5nLm1hdGNoKHRlcm0pKXtcbiAgICAgICAgcmV0dXJuIG1lbW8gKyAzMFxuICAgICAgfVxuICAgICAgcmV0dXJuIG1lbW9cbiAgICB9LCAwKVxuXG4gICAgc2NvcmUgPSBzY29yZSArIGFydGljbGVIZWFkaW5ncy5yZWR1Y2UoKG1lbW8saGVhZGluZyk9PntcbiAgICAgIGlmKGhlYWRpbmcgPT09IHRlcm0pe1xuICAgICAgICByZXR1cm4gbWVtbyArIDQwXG4gICAgICB9XG4gICAgICBpZihoZWFkaW5nLm1hdGNoKHRlcm0pKXtcbiAgICAgICAgcmV0dXJuIG1lbW8gKyAyMFxuICAgICAgfVxuICAgICAgcmV0dXJuIG1lbW9cbiAgICB9LCAwKVxuICAgIFxuICAgIHJldHVybiBzY29yZVxuICB9XG4gXG4gIGZvckV4cG9ydChvcHRpb25zID0ge30pe1xuICAgIGxldCBmb3JFeHBvcnQgPSB7XG4gICAgICBpZDogdGhpcy5pZCxcbiAgICAgIGRhdGE6IHRoaXMuZGF0YSxcbiAgICAgIGxhc3RNb2RpZmllZDogdGhpcy5sYXN0TW9kaWZpZWRBdCgpXG4gICAgfVxuXG4gICAgbGV0IGJyaWVmY2FzZSA9IHRoaXMuZ2V0QnJpZWZjYXNlKClcblxuICAgIGlmKGJyaWVmY2FzZSl7XG4gICAgICBmb3JFeHBvcnQuYnJpZWZjYXNlID0ge1xuICAgICAgICByb290OiBicmllZmNhc2Uucm9vdCxcbiAgICAgICAgdGl0bGU6IGJyaWVmY2FzZS50aXRsZVxuICAgICAgfVxuICAgIH1cblxuICAgIGlmKG9wdGlvbnMuaW5jbHVkZURvY3VtZW50KXtcbiAgICAgIGZvckV4cG9ydC5kb2N1bWVudCA9IHtcbiAgICAgICAgcGF0aDogdGhpcy5kb2N1bWVudC5wYXRoLnJlcGxhY2UoYnJpZWZjYXNlLmNvbmZpZy5kb2NzX3BhdGggKyAnLycsICcnKSxcbiAgICAgICAgY29udGVudDogdGhpcy5kb2N1bWVudC5jb250ZW50LFxuICAgICAgICBkYXRhOiB0aGlzLmRvY3VtZW50LmRhdGEsXG4gICAgICAgIHR5cGU6IHRoaXMuZG9jdW1lbnQuZ2V0VHlwZSgpXG4gICAgICB9XG4gICAgfVxuXG4gICAgcmV0dXJuIGZvckV4cG9ydFxuICB9XG5cbiAgdG9KU09OKG9wdGlvbnM9e30pIHtcbiAgICByZXR1cm4ge1xuICAgICAgaWQ6IHRoaXMuaWQsXG4gICAgICBkYXRhOiB0aGlzLmRhdGEsXG4gICAgICBsYXN0TW9kaWZpZWRBdDogdGhpcy5sYXN0TW9kaWZpZWRBdCgpLFxuICAgIH1cbiAgfVxuICBcbiAgX2NyZWF0ZURhdGFHZXR0ZXJzKCl7XG4gICAgbGV0IG1vZGVsID0gdGhpc1xuXG4gICAgT2JqZWN0LmtleXModGhpcy5kb2N1bWVudC5kYXRhIHx8IHt9KS5mb3JFYWNoKGtleSA9PiB7XG4gICAgICBpZihrZXkgPT09ICd0eXBlJykgeyByZXR1cm4gfVxuXG4gICAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkobW9kZWwsIGtleSwge1xuICAgICAgICBnZXQ6IGZ1bmN0aW9uKCl7XG4gICAgICAgICAgcmV0dXJuIG1vZGVsLmRhdGFba2V5XVxuICAgICAgICB9XG4gICAgICB9KVxuICAgIH0pXG4gIH1cblxuICBleHRyYWN0Q29udGVudCgpIHtcblxuICB9XG5cbiAgZXh0cmFjdERhdGEoKSB7XG5cbiAgfVxuICBcbiAgZ2V0QnJpZWZjYXNlKCl7XG4gICAgcmV0dXJuIHRoaXMuZG9jdW1lbnQuZ2V0QnJpZWZjYXNlKClcbiAgfVxuXG4gIGdldE1vZGVsc0NvbGxlY3Rpb24oZ3JvdXBOYW1lKXtcbiAgICBsZXQgYmMgPSB0aGlzLmdldEJyaWVmY2FzZSgpXG4gICAgaWYoYmMpe1xuICAgICAgcmV0dXJuIGJjW2dyb3VwTmFtZV1cbiAgICB9XG4gIH1cblxuICByZWxhdGlvbklkcygpe1xuICAgIGxldCByZWxhdGlvbnNoaXBzID0gdGhpcy5nZXRSZWxhdGlvbnNoaXBzQ29uZmlnKClcblxuICAgIHJldHVybiByZWxhdGlvbnNoaXBzLnJlZHVjZShmdW5jdGlvbihtZW1vLHJlbGF0aW9uc2hpcElkKXtcbiAgICAgIG1lbW9bcmVsYXRpb25zaGlwSWRdID0gW11cbiAgICAgIGxldCByZWxhdGVkSWRzID0gdGhpcy5yZWxhdGVkKHJlbGF0aW9uc2hpcElkKS5tYXAocmVsYXRpb24gPT4gcmVsYXRpb24uaWQpXG5cbiAgICAgIG1lbW9bcmVsYXRpb25zaGlwSWRdLmNvbmNhdChyZWxhdGVkSWRzKVxuICAgICAgcmV0dXJuIG1lbW8gXG4gICAgfSwge30pXG4gIH1cblxuICByZWxhdGVkKHJlbGF0aW9uc2hpcElkKXtcbiAgICBsZXQgY29uZmlnID0gdGhpcy5nZXRSZWxhdGlvbnNoaXBDb25maWcocmVsYXRpb25zaGlwSWQpXG4gICAgbGV0IHJlbGF0ZWRNb2RlbCA9IGNvbmZpZy5tb2RlbERlZmluaXRpb24oKVxuXG4gICAgaWYoIXJlbGF0ZWRNb2RlbCl7XG4gICAgICB0aHJvdygnSW52YWxpZCByZWxhdGlvbnNoaXAgJyArIHJlbGF0aW9uc2hpcElkKVxuICAgIH1cblxuICAgIGxldCBjb2xsZWN0aW9uID0gdGhpcy5nZXRNb2RlbHNDb2xsZWN0aW9uKHJlbGF0ZWRNb2RlbC5ncm91cE5hbWUpIHx8IF8oW10pXG4gICAgXG4gICAgaWYoY29uZmlnLmhhc01hbnkpe1xuICAgICAgbGV0IG15S2V5VmFsdWUgPSB0aGlzLnJlYWQoY29uZmlnLmtleSlcbiAgICAgIGxldCBmb3JlaWduS2V5RmllbGQgPSBjb25maWcuZm9yZWlnbktleVxuICAgICAgXG4gICAgICByZXR1cm4gY29sbGVjdGlvbi5maWx0ZXIobW9kZWwgPT4ge1xuICAgICAgICByZXR1cm4gbW9kZWwucmVhZChmb3JlaWduS2V5RmllbGQpID09PSBteUtleVZhbHVlICAgICAgICBcbiAgICAgIH0pXG4gICAgfVxuXG4gICAgaWYoY29uZmlnLmJlbG9uZ3NUbyl7XG4gICAgICBsZXQgbXlLZXlWYWx1ZSA9IHRoaXMucmVhZChjb25maWcuZm9yZWlnbktleSlcbiAgICAgIGxldCBmb3JlaWduS2V5RmllbGQgPSBjb25maWcucmVmZXJlbmNlc1xuXG4gICAgICByZXR1cm4gY29sbGVjdGlvbi5maW5kKG1vZGVsID0+IHtcbiAgICAgICAgcmV0dXJuIG1vZGVsLnJlYWQoZm9yZWlnbktleUZpZWxkKSA9PT0gbXlLZXlWYWx1ZSAgICAgICAgXG4gICAgICB9KVxuICAgIH1cbiAgfVxuXG4gIGRlZmluZWRTZWN0aW9uTm9kZXMoKXtcbiAgICByZXR1cm4gdGhpcy5kb2N1bWVudC5nZXRTZWN0aW9uTm9kZXMoKS5maWx0ZXIobm9kZSA9PiB7XG4gICAgICByZXR1cm4gdGhpcy5leHBlY3RlZFNlY3Rpb25IZWFkaW5ncygpLmluZGV4T2Yobm9kZS5oZWFkaW5nKSA+PSAwXG4gICAgfSlcbiAgfVxuXG4gIGdldEF0dHJpYnV0ZUNvbmZpZyhrZXkpIHtcbiAgICByZXR1cm4gZ2V0QXR0cmlidXRlc0NvbmZpZygpW2tleV1cbiAgfVxuXG4gIGdldEF0dHJpYnV0ZXNDb25maWcoKSB7XG4gICAgcmV0dXJuIHRoaXMuZ2V0TW9kZWxEZWZpbml0aW9uKCkuYXR0cmlidXRlc1xuICB9XG5cbiAgZ2V0U2VjdGlvbnNDb25maWcoKXtcbiAgICByZXR1cm4gdGhpcy5nZXRNb2RlbERlZmluaXRpb24oKS5zZWN0aW9uc1xuICB9XG4gIFxuICBnZXRSZWxhdGlvbnNoaXBzQ29uZmlnKCl7XG4gICAgcmV0dXJuIHRoaXMuZ2V0TW9kZWxEZWZpbml0aW9uKCkucmVsYXRpb25zaGlwc1xuICB9XG5cbiAgZ2V0UmVsYXRpb25zaGlwQ29uZmlnKHJlbGF0aW9uc2hpcElkKXtcbiAgICByZXR1cm4gdGhpcy5nZXRSZWxhdGlvbnNoaXBzQ29uZmlnKClbcmVsYXRpb25zaGlwSWRdXG4gIH1cblxuICBleHBlY3RlZFNlY3Rpb25IZWFkaW5ncygpe1xuICAgIGNvbnN0IGNmZyA9IHRoaXMuZ2V0U2VjdGlvbnNDb25maWcoKVxuICAgIHJldHVybiBmbGF0dGVuKE9iamVjdC52YWx1ZXMoY2ZnKS5tYXAoZGVmID0+IFtkZWYubmFtZSwgZGVmLmFsaWFzZXNdKSlcbiAgfVxuXG4gIGdldE1vZGVsRGVmaW5pdGlvbigpe1xuICAgIHJldHVybiBNb2RlbERlZmluaXRpb24ubG9va3VwKHRoaXMudHlwZSlcbiAgfVxuXG59XG4iXX0=