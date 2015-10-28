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
    key: 'definedSectionNodes',
    get: function get() {
      var _this2 = this;

      return this.document.getSectionNodes().filter(function (node) {
        return _this2.expectedSectionHeadings.indexOf(node.heading) >= 0;
      });
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
    key: 'expectedSectionHeadings',
    get: function get() {
      return flatten(Object.values(this.config.sections).map(function (def) {
        return [def.name, def.aliases];
      }));
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
//# sourceMappingURL=data:application/json;base64,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QUUwQixlQUFFO0FBQzNCLGFBQU8sT0FBTyxDQUFDLE1BQU0sQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxRQUFRLENBQUMsQ0FBQyxHQUFHLENBQUMsVUFBQSxHQUFHO2VBQUksQ0FBQyxHQUFHLENBQUMsSUFBSSxFQUFFLEdBQUcsQ0FBQyxPQUFPLENBQUM7T0FBQSxDQUFDLENBQUMsQ0FBQTtLQUN4Rjs7O1NBT2tCLGVBQUU7QUFDbkIsYUFBTyw4QkFBZ0IsTUFBTSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQTtLQUN6Qzs7O1NBaE9rQixLQUFLOzs7cUJBQUwsS0FBSyIsImZpbGUiOiJtb2RlbC5qcyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCBfIGZyb20gJ3VuZGVyc2NvcmUnXG5pbXBvcnQgaW5mbGVjdCBmcm9tICdpJ1xuXG5pbXBvcnQgRG9jdW1lbnQgZnJvbSAnLi9kb2N1bWVudCdcbmltcG9ydCBNb2RlbERlZmluaXRpb24gZnJvbSAnLi9tb2RlbF9kZWZpbml0aW9uJ1xuaW1wb3J0IEJyaWVmY2FzZSBmcm9tICcuL2JyaWVmY2FzZSdcbmltcG9ydCB7ZnJhZ21lbnR9IGZyb20gJy4vcmVuZGVyJ1xuXG5jb25zdCBmbGF0dGVuID0gXy5mbGF0dGVuXG5jb25zdCBzdHJpbmcgPSBpbmZsZWN0KClcblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgTW9kZWwge1xuICBzdGF0aWMgZnJvbURvY3VtZW50IChkb2N1bWVudCl7XG4gICAgcmV0dXJuIG5ldyBNb2RlbChkb2N1bWVudClcbiAgfVxuXG4gIGNvbnN0cnVjdG9yKGRvY3VtZW50LCBvcHRpb25zPXt9KSB7XG4gICAgdGhpcy5kb2N1bWVudCAgICAgPSBkb2N1bWVudFxuICAgIHRoaXMuZ3JvdXBOYW1lICAgID0gb3B0aW9ucy5ncm91cE5hbWUgfHwgXCJkb2N1bWVudHNcIlxuICAgIHRoaXMuaWQgICAgICAgICAgID0gb3B0aW9ucy5pZFxuICAgIHRoaXMuZG9jdW1lbnQuaWQgID0gdGhpcy5pZFxuICAgIFxuICAgIHRoaXMudHlwZSA9IGRvY3VtZW50LmdldFR5cGUoKVxuXG4gICAgdGhpcy5fY3JlYXRlRGF0YUdldHRlcnMoKVxuICAgIFxuICAgIHRoaXMuZ3JvdXBOYW1lID0gc3RyaW5nLnBsdXJhbGl6ZSh0aGlzLnR5cGUpXG4gIH1cbiAgXG4gIGdldCBkYXRhKCl7XG4gICAgcmV0dXJuIHRoaXMuZG9jdW1lbnQuZGF0YVxuICB9XG5cbiAgcmVhZChwcm9wZXJ0eSl7XG4gICAgbGV0IHZhbHVlID0gdGhpc1twcm9wZXJ0eV1cbiAgICByZXR1cm4gdHlwZW9mKHZhbHVlKSA9PT0gJ2Z1bmN0aW9uJyA/IHZhbHVlLmNhbGwodGhpcykgOiB2YWx1ZVxuICB9XG5cbiAgbGFzdE1vZGlmaWVkQXQoKXtcbiAgICByZXR1cm4gdGhpcy5kb2N1bWVudC5sYXN0TW9kaWZpZWRBdCgpXG4gIH1cblxuICB0b1N0cmluZygpe1xuICAgIHJldHVybiAnRG9jdW1lbnQ6ICcgKyB0aGlzLmRvY3VtZW50LnBhdGhcbiAgfVxuICBcbiAgLyoqXG4gICogc2NvcmVzIGEgZ2l2ZW4gc2VhcmNoIHRlcm0gYWdhaW5zdCB0aGlzIG1vZGVsLlxuICAqIHRoaXMgbWV0aG9kIGNhbiBiZSBvdmVycmlkZGVuIHRvIHByb3ZpZGUgY3VzdG9tIGxvZ2ljXG4gICogZm9yIGEgZ2l2ZW4gbW9kZWxcbiAgKi9cbiAgc2NvcmVTZWFyY2hUZXJtKHRlcm09XCJcIiwgb3B0aW9ucz17fSl7XG4gICAgbGV0IHNjb3JlID0gMFxuXG4gICAgaWYodGhpcy50aXRsZSAmJiB0aGlzLnRpdGxlID09PSB0ZXJtKXtcbiAgICAgIHJldHVybiAxMDBcbiAgICB9XG5cbiAgICBpZih0aGlzLnRpdGxlICYmIHRoaXMudGl0bGUubWF0Y2godGVybSkpe1xuICAgICAgcmV0dXJuIDkwXG4gICAgfVxuICAgIFxuICAgIGxldCBzZWN0aW9uSGVhZGluZ3MgPSB0aGlzLmRvY3VtZW50LmdldFNlY3Rpb25IZWFkaW5ncygpXG4gICAgbGV0IGFydGljbGVIZWFkaW5ncyA9IHRoaXMuZG9jdW1lbnQuZ2V0QXJ0aWNsZUhlYWRpbmdzKClcbiAgICBcbiAgICBzY29yZSA9IHNjb3JlICsgc2VjdGlvbkhlYWRpbmdzLnJlZHVjZSgobWVtbyxoZWFkaW5nKT0+e1xuICAgICAgaWYoaGVhZGluZyA9PT0gdGVybSl7XG4gICAgICAgIHJldHVybiBtZW1vICsgNTBcbiAgICAgIH1cbiAgICAgIGlmKGhlYWRpbmcubWF0Y2godGVybSkpe1xuICAgICAgICByZXR1cm4gbWVtbyArIDMwXG4gICAgICB9XG4gICAgICByZXR1cm4gbWVtb1xuICAgIH0sIDApXG5cbiAgICBzY29yZSA9IHNjb3JlICsgYXJ0aWNsZUhlYWRpbmdzLnJlZHVjZSgobWVtbyxoZWFkaW5nKT0+e1xuICAgICAgaWYoaGVhZGluZyA9PT0gdGVybSl7XG4gICAgICAgIHJldHVybiBtZW1vICsgNDBcbiAgICAgIH1cbiAgICAgIGlmKGhlYWRpbmcubWF0Y2godGVybSkpe1xuICAgICAgICByZXR1cm4gbWVtbyArIDIwXG4gICAgICB9XG4gICAgICByZXR1cm4gbWVtb1xuICAgIH0sIDApXG4gICAgXG4gICAgcmV0dXJuIHNjb3JlXG4gIH1cbiBcbiAgZm9yRXhwb3J0KG9wdGlvbnMgPSB7fSl7XG4gICAgbGV0IGZvckV4cG9ydCA9IHtcbiAgICAgIGlkOiB0aGlzLmlkLFxuICAgICAgZGF0YTogdGhpcy5kYXRhLFxuICAgICAgbGFzdE1vZGlmaWVkOiB0aGlzLmxhc3RNb2RpZmllZEF0KClcbiAgICB9XG5cbiAgICBsZXQgYnJpZWZjYXNlID0gdGhpcy5nZXRCcmllZmNhc2UoKVxuXG4gICAgaWYoYnJpZWZjYXNlKXtcbiAgICAgIGZvckV4cG9ydC5icmllZmNhc2UgPSB7XG4gICAgICAgIHJvb3Q6IGJyaWVmY2FzZS5yb290LFxuICAgICAgICB0aXRsZTogYnJpZWZjYXNlLnRpdGxlXG4gICAgICB9XG4gICAgfVxuXG4gICAgaWYob3B0aW9ucy5pbmNsdWRlRG9jdW1lbnQpe1xuICAgICAgZm9yRXhwb3J0LmRvY3VtZW50ID0ge1xuICAgICAgICBwYXRoOiB0aGlzLmRvY3VtZW50LnBhdGgucmVwbGFjZShicmllZmNhc2UuY29uZmlnLmRvY3NfcGF0aCArICcvJywgJycpLFxuICAgICAgICBjb250ZW50OiB0aGlzLmRvY3VtZW50LmNvbnRlbnQsXG4gICAgICAgIGRhdGE6IHRoaXMuZG9jdW1lbnQuZGF0YSxcbiAgICAgICAgdHlwZTogdGhpcy5kb2N1bWVudC5nZXRUeXBlKClcbiAgICAgIH1cblxuICAgICAgaWYob3B0aW9ucy5yZW5kZXJEb2N1bWVudCl7XG4gICAgICAgIGZvckV4cG9ydC5kb2N1bWVudC5yZW5kZXJlZCA9IHRoaXMuZG9jdW1lbnQucmVuZGVyKClcbiAgICAgIH1cbiAgICB9XG5cbiAgICByZXR1cm4gZm9yRXhwb3J0XG4gIH1cblxuICB0b0pTT04ob3B0aW9ucz17fSkge1xuICAgIHJldHVybiB7XG4gICAgICBpZDogdGhpcy5pZCxcbiAgICAgIGRhdGE6IHRoaXMuZGF0YSxcbiAgICAgIGxhc3RNb2RpZmllZEF0OiB0aGlzLmxhc3RNb2RpZmllZEF0KCksXG4gICAgfVxuICB9XG4gIFxuICBfY3JlYXRlRGF0YUdldHRlcnMoKXtcbiAgICBsZXQgbW9kZWwgPSB0aGlzXG5cbiAgICBPYmplY3Qua2V5cyh0aGlzLmRvY3VtZW50LmRhdGEgfHwge30pLmZvckVhY2goa2V5ID0+IHtcbiAgICAgIGlmKGtleSA9PT0gJ3R5cGUnKSB7IHJldHVybiB9XG5cbiAgICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShtb2RlbCwga2V5LCB7XG4gICAgICAgIGdldDogZnVuY3Rpb24oKXtcbiAgICAgICAgICByZXR1cm4gbW9kZWwuZGF0YVtrZXldXG4gICAgICAgIH1cbiAgICAgIH0pXG4gICAgfSlcbiAgfVxuXG4gIGV4dHJhY3RDb250ZW50KCkge1xuXG4gIH1cblxuICBleHRyYWN0RGF0YSgpIHtcblxuICB9XG4gIFxuICBnZXRCcmllZmNhc2UoKXtcbiAgICByZXR1cm4gdGhpcy5kb2N1bWVudC5nZXRCcmllZmNhc2UoKVxuICB9XG5cbiAgZ2V0TW9kZWxzQ29sbGVjdGlvbihncm91cE5hbWUpe1xuICAgIGxldCBiYyA9IHRoaXMuZ2V0QnJpZWZjYXNlKClcbiAgICBpZihiYyl7XG4gICAgICByZXR1cm4gYmNbZ3JvdXBOYW1lXVxuICAgIH1cbiAgfVxuXG4gIHJlbGF0aW9uSWRzKCl7XG4gICAgbGV0IHJlbGF0aW9uc2hpcHMgPSB0aGlzLmNvbmZpZy5yZWxhdGlvbnNoaXBzXG5cbiAgICByZXR1cm4gcmVsYXRpb25zaGlwcy5yZWR1Y2UoZnVuY3Rpb24obWVtbyxyZWxhdGlvbnNoaXBJZCl7XG4gICAgICBtZW1vW3JlbGF0aW9uc2hpcElkXSA9IFtdXG4gICAgICBsZXQgcmVsYXRlZElkcyA9IHRoaXMucmVsYXRlZChyZWxhdGlvbnNoaXBJZCkubWFwKHJlbGF0aW9uID0+IHJlbGF0aW9uLmlkKVxuXG4gICAgICBtZW1vW3JlbGF0aW9uc2hpcElkXS5jb25jYXQocmVsYXRlZElkcylcbiAgICAgIHJldHVybiBtZW1vIFxuICAgIH0sIHt9KVxuICB9XG5cbiAgcmVsYXRlZChyZWxhdGlvbnNoaXBJZCl7XG4gICAgbGV0IGNvbmZpZyA9IHRoaXMuZ2V0UmVsYXRpb25zaGlwQ29uZmlnKHJlbGF0aW9uc2hpcElkKVxuICAgIGxldCByZWxhdGVkTW9kZWwgPSBjb25maWcubW9kZWxEZWZpbml0aW9uKClcblxuICAgIGlmKCFyZWxhdGVkTW9kZWwpe1xuICAgICAgdGhyb3coJ0ludmFsaWQgcmVsYXRpb25zaGlwICcgKyByZWxhdGlvbnNoaXBJZClcbiAgICB9XG5cbiAgICBsZXQgY29sbGVjdGlvbiA9IHRoaXMuZ2V0TW9kZWxzQ29sbGVjdGlvbihyZWxhdGVkTW9kZWwuZ3JvdXBOYW1lKSB8fCBfKFtdKVxuICAgIFxuICAgIGlmKGNvbmZpZy5oYXNNYW55KXtcbiAgICAgIGxldCBteUtleVZhbHVlID0gdGhpcy5yZWFkKGNvbmZpZy5rZXkpXG4gICAgICBsZXQgZm9yZWlnbktleUZpZWxkID0gY29uZmlnLmZvcmVpZ25LZXlcbiAgICAgIFxuICAgICAgcmV0dXJuIGNvbGxlY3Rpb24uZmlsdGVyKG1vZGVsID0+IHtcbiAgICAgICAgcmV0dXJuIG1vZGVsLnJlYWQoZm9yZWlnbktleUZpZWxkKSA9PT0gbXlLZXlWYWx1ZSAgICAgICAgXG4gICAgICB9KVxuICAgIH1cblxuICAgIGlmKGNvbmZpZy5iZWxvbmdzVG8pe1xuICAgICAgbGV0IG15S2V5VmFsdWUgPSB0aGlzLnJlYWQoY29uZmlnLmZvcmVpZ25LZXkpXG4gICAgICBsZXQgZm9yZWlnbktleUZpZWxkID0gY29uZmlnLnJlZmVyZW5jZXNcblxuICAgICAgcmV0dXJuIGNvbGxlY3Rpb24uZmluZChtb2RlbCA9PiB7XG4gICAgICAgIHJldHVybiBtb2RlbC5yZWFkKGZvcmVpZ25LZXlGaWVsZCkgPT09IG15S2V5VmFsdWUgICAgICAgIFxuICAgICAgfSlcbiAgICB9XG4gIH1cblxuICBnZXQgZGVmaW5lZFNlY3Rpb25Ob2Rlcygpe1xuICAgIHJldHVybiB0aGlzLmRvY3VtZW50LmdldFNlY3Rpb25Ob2RlcygpLmZpbHRlcihub2RlID0+IHtcbiAgICAgIHJldHVybiB0aGlzLmV4cGVjdGVkU2VjdGlvbkhlYWRpbmdzLmluZGV4T2Yobm9kZS5oZWFkaW5nKSA+PSAwXG4gICAgfSlcbiAgfVxuXG4gIGdldEF0dHJpYnV0ZUNvbmZpZyhrZXkpIHtcbiAgICByZXR1cm4gdGhpcy5jb25maWcuYXR0cmlidXRlc1trZXldXG4gIH1cbiBcbiAgZ2V0UmVsYXRpb25zaGlwQ29uZmlnKHJlbGF0aW9uc2hpcElkKSB7XG4gICAgcmV0dXJuIHRoaXMuY29uZmlnLnJlbGF0aW9uc2hpcHNbcmVsYXRpb25zaGlwSWRdXG4gIH1cbiBcbiAgZ2V0IGNvbmZpZygpe1xuICAgIHJldHVybiB7XG4gICAgICBhdHRyaWJ1dGVzOiB0aGlzLm1vZGVsRGVmaW5pdGlvbi5hdHRyaWJ1dGVzLFxuICAgICAgcmVsYXRpb25zaGlwczogdGhpcy5tb2RlbERlZmluaXRpb24ucmVsYXRpb25zaGlwcyxcbiAgICAgIHNlY3Rpb25zOiB0aGlzLm1vZGVsRGVmaW5pdGlvbi5zZWN0aW9uc1xuICAgIH1cbiAgfVxuXG4gIGdldCBleHBlY3RlZFNlY3Rpb25IZWFkaW5ncygpe1xuICAgIHJldHVybiBmbGF0dGVuKE9iamVjdC52YWx1ZXModGhpcy5jb25maWcuc2VjdGlvbnMpLm1hcChkZWYgPT4gW2RlZi5uYW1lLCBkZWYuYWxpYXNlc10pKVxuICB9XG4gIFxuICBnZXRNb2RlbERlZmluaXRpb24oKXtcbiAgICBjb25zb2xlLmxvZygnRGVwcmVjYXRlZCBnZXRNb2RlbERlZmluaXRpb24nKVxuICAgIHJldHVybiB0aGlzLm1vZGVsRGVmaW5pdGlvblxuICB9XG4gIFxuICBnZXQgbW9kZWxEZWZpbml0aW9uKCl7XG4gICAgcmV0dXJuIE1vZGVsRGVmaW5pdGlvbi5sb29rdXAodGhpcy50eXBlKVxuICB9XG59XG4iXX0=