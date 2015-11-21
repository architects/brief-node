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

var _extractions = require('./extractions');

var _pipelines = require('./pipelines');

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
        lastModifiedAt: this.lastModifiedAt(),
        relationIds: this.relationIds,
        document: {
          path: this.document.path,
          id: this.document.id
        }
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
  }, {
    key: 'codeBlocks',
    get: function get() {
      return new _extractions.CodeExtraction(this);
    }
  }]);

  return Model;
})();

exports['default'] = Model;
module.exports = exports['default'];
//# sourceMappingURL=data:application/json;base64,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QUFPO0FBQ0wsa0JBQVUsRUFBRSxJQUFJLENBQUMsZUFBZSxDQUFDLFVBQVU7QUFDM0MscUJBQWEsRUFBRSxJQUFJLENBQUMsZUFBZSxDQUFDLGFBQWE7QUFDakQsZ0JBQVEsRUFBRSxJQUFJLENBQUMsZUFBZSxDQUFDLFFBQVE7T0FDeEMsQ0FBQTtLQUNGOzs7U0FFMEIsZUFBRTtBQUMzQixhQUFPLE9BQU8sQ0FBQyxNQUFNLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsUUFBUSxDQUFDLENBQUMsR0FBRyxDQUFDLFVBQUEsR0FBRztlQUFJLENBQUMsR0FBRyxDQUFDLElBQUksRUFBRSxHQUFHLENBQUMsT0FBTyxDQUFDO09BQUEsQ0FBQyxDQUFDLENBQUE7S0FDeEY7OztTQU9rQixlQUFFO0FBQ25CLGFBQU8sOEJBQWdCLE1BQU0sQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUE7S0FDekM7OztTQUVhLGVBQUU7QUFDZCxhQUFPLGdDQUFtQixJQUFJLENBQUMsQ0FBQTtLQUNoQzs7O1NBek9rQixLQUFLOzs7cUJBQUwsS0FBSyIsImZpbGUiOiJtb2RlbC5qcyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCBfIGZyb20gJ3VuZGVyc2NvcmUnXG5pbXBvcnQgaW5mbGVjdCBmcm9tICdpJ1xuXG5pbXBvcnQgRG9jdW1lbnQgZnJvbSAnLi9kb2N1bWVudCdcbmltcG9ydCBNb2RlbERlZmluaXRpb24gZnJvbSAnLi9tb2RlbF9kZWZpbml0aW9uJ1xuaW1wb3J0IEJyaWVmY2FzZSBmcm9tICcuL2JyaWVmY2FzZSdcbmltcG9ydCB7IENvZGVFeHRyYWN0aW9uIH0gZnJvbSAnLi9leHRyYWN0aW9ucydcbmltcG9ydCB7ZnJhZ21lbnR9IGZyb20gJy4vcGlwZWxpbmVzJ1xuXG5jb25zdCBmbGF0dGVuID0gXy5mbGF0dGVuXG5jb25zdCBzdHJpbmcgPSBpbmZsZWN0KClcblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgTW9kZWwge1xuICBzdGF0aWMgZnJvbURvY3VtZW50IChkb2N1bWVudCl7XG4gICAgcmV0dXJuIG5ldyBNb2RlbChkb2N1bWVudClcbiAgfVxuXG4gIGNvbnN0cnVjdG9yKGRvY3VtZW50LCBvcHRpb25zPXt9KSB7XG4gICAgdGhpcy5kb2N1bWVudCAgICAgPSBkb2N1bWVudFxuICAgIHRoaXMuZ3JvdXBOYW1lICAgID0gb3B0aW9ucy5ncm91cE5hbWUgfHwgXCJkb2N1bWVudHNcIlxuICAgIHRoaXMuaWQgICAgICAgICAgID0gb3B0aW9ucy5pZFxuICAgIHRoaXMuZG9jdW1lbnQuaWQgID0gdGhpcy5pZFxuICAgIFxuICAgIHRoaXMudHlwZSA9IGRvY3VtZW50LmdldFR5cGUoKVxuXG4gICAgdGhpcy5fY3JlYXRlRGF0YUdldHRlcnMoKVxuICAgIFxuICAgIHRoaXMuZ3JvdXBOYW1lID0gc3RyaW5nLnBsdXJhbGl6ZSh0aGlzLnR5cGUpXG4gIH1cbiAgXG4gIGdldCBkYXRhKCl7XG4gICAgcmV0dXJuIHRoaXMuZG9jdW1lbnQuZGF0YVxuICB9XG5cbiAgcmVhZChwcm9wZXJ0eSl7XG4gICAgbGV0IHZhbHVlID0gdGhpc1twcm9wZXJ0eV1cbiAgICByZXR1cm4gdHlwZW9mKHZhbHVlKSA9PT0gJ2Z1bmN0aW9uJyA/IHZhbHVlLmNhbGwodGhpcykgOiB2YWx1ZVxuICB9XG5cbiAgbGFzdE1vZGlmaWVkQXQoKXtcbiAgICByZXR1cm4gdGhpcy5kb2N1bWVudC5sYXN0TW9kaWZpZWRBdCgpXG4gIH1cblxuICB0b1N0cmluZygpe1xuICAgIHJldHVybiAnRG9jdW1lbnQ6ICcgKyB0aGlzLmRvY3VtZW50LnBhdGhcbiAgfVxuICBcbiAgLyoqXG4gICogc2NvcmVzIGEgZ2l2ZW4gc2VhcmNoIHRlcm0gYWdhaW5zdCB0aGlzIG1vZGVsLlxuICAqIHRoaXMgbWV0aG9kIGNhbiBiZSBvdmVycmlkZGVuIHRvIHByb3ZpZGUgY3VzdG9tIGxvZ2ljXG4gICogZm9yIGEgZ2l2ZW4gbW9kZWxcbiAgKi9cbiAgc2NvcmVTZWFyY2hUZXJtKHRlcm09XCJcIiwgb3B0aW9ucz17fSl7XG4gICAgbGV0IHNjb3JlID0gMFxuXG4gICAgaWYodGhpcy50aXRsZSAmJiB0aGlzLnRpdGxlID09PSB0ZXJtKXtcbiAgICAgIHJldHVybiAxMDBcbiAgICB9XG5cbiAgICBpZih0aGlzLnRpdGxlICYmIHRoaXMudGl0bGUubWF0Y2godGVybSkpe1xuICAgICAgcmV0dXJuIDkwXG4gICAgfVxuICAgIFxuICAgIGxldCBzZWN0aW9uSGVhZGluZ3MgPSB0aGlzLmRvY3VtZW50LmdldFNlY3Rpb25IZWFkaW5ncygpXG4gICAgbGV0IGFydGljbGVIZWFkaW5ncyA9IHRoaXMuZG9jdW1lbnQuZ2V0QXJ0aWNsZUhlYWRpbmdzKClcbiAgICBcbiAgICBzY29yZSA9IHNjb3JlICsgc2VjdGlvbkhlYWRpbmdzLnJlZHVjZSgobWVtbyxoZWFkaW5nKT0+e1xuICAgICAgaWYoaGVhZGluZyA9PT0gdGVybSl7XG4gICAgICAgIHJldHVybiBtZW1vICsgNTBcbiAgICAgIH1cbiAgICAgIGlmKGhlYWRpbmcubWF0Y2godGVybSkpe1xuICAgICAgICByZXR1cm4gbWVtbyArIDMwXG4gICAgICB9XG4gICAgICByZXR1cm4gbWVtb1xuICAgIH0sIDApXG5cbiAgICBzY29yZSA9IHNjb3JlICsgYXJ0aWNsZUhlYWRpbmdzLnJlZHVjZSgobWVtbyxoZWFkaW5nKT0+e1xuICAgICAgaWYoaGVhZGluZyA9PT0gdGVybSl7XG4gICAgICAgIHJldHVybiBtZW1vICsgNDBcbiAgICAgIH1cbiAgICAgIGlmKGhlYWRpbmcubWF0Y2godGVybSkpe1xuICAgICAgICByZXR1cm4gbWVtbyArIDIwXG4gICAgICB9XG4gICAgICByZXR1cm4gbWVtb1xuICAgIH0sIDApXG4gICAgXG4gICAgcmV0dXJuIHNjb3JlXG4gIH1cbiBcbiAgZm9yRXhwb3J0KG9wdGlvbnMgPSB7fSl7XG4gICAgbGV0IGZvckV4cG9ydCA9IHtcbiAgICAgIGlkOiB0aGlzLmlkLFxuICAgICAgZGF0YTogdGhpcy5kYXRhLFxuICAgICAgbGFzdE1vZGlmaWVkOiB0aGlzLmxhc3RNb2RpZmllZEF0KClcbiAgICB9XG5cbiAgICBsZXQgYnJpZWZjYXNlID0gdGhpcy5nZXRCcmllZmNhc2UoKVxuXG4gICAgaWYoYnJpZWZjYXNlKXtcbiAgICAgIGZvckV4cG9ydC5icmllZmNhc2UgPSB7XG4gICAgICAgIHJvb3Q6IGJyaWVmY2FzZS5yb290LFxuICAgICAgICB0aXRsZTogYnJpZWZjYXNlLnRpdGxlXG4gICAgICB9XG4gICAgfVxuXG4gICAgaWYob3B0aW9ucy5pbmNsdWRlRG9jdW1lbnQpe1xuICAgICAgZm9yRXhwb3J0LmRvY3VtZW50ID0ge1xuICAgICAgICBwYXRoOiB0aGlzLmRvY3VtZW50LnBhdGgucmVwbGFjZShicmllZmNhc2UuY29uZmlnLmRvY3NfcGF0aCArICcvJywgJycpLFxuICAgICAgICBjb250ZW50OiB0aGlzLmRvY3VtZW50LmNvbnRlbnQsXG4gICAgICAgIGRhdGE6IHRoaXMuZG9jdW1lbnQuZGF0YSxcbiAgICAgICAgdHlwZTogdGhpcy5kb2N1bWVudC5nZXRUeXBlKClcbiAgICAgIH1cblxuICAgICAgaWYob3B0aW9ucy5yZW5kZXJEb2N1bWVudCl7XG4gICAgICAgIGZvckV4cG9ydC5kb2N1bWVudC5yZW5kZXJlZCA9IHRoaXMuZG9jdW1lbnQucmVuZGVyKClcbiAgICAgIH1cbiAgICB9XG5cbiAgICByZXR1cm4gZm9yRXhwb3J0XG4gIH1cblxuICB0b0pTT04ob3B0aW9ucz17fSkge1xuICAgIHJldHVybiB7XG4gICAgICBpZDogdGhpcy5pZCxcbiAgICAgIGRhdGE6IHRoaXMuZGF0YSxcbiAgICAgIGxhc3RNb2RpZmllZEF0OiB0aGlzLmxhc3RNb2RpZmllZEF0KCksXG4gICAgICByZWxhdGlvbklkczogdGhpcy5yZWxhdGlvbklkcyxcbiAgICAgIGRvY3VtZW50OntcbiAgICAgICAgcGF0aDogdGhpcy5kb2N1bWVudC5wYXRoLFxuICAgICAgICBpZDogdGhpcy5kb2N1bWVudC5pZFxuICAgICAgfVxuICAgIH1cbiAgfVxuICBcbiAgX2NyZWF0ZURhdGFHZXR0ZXJzKCl7XG4gICAgbGV0IG1vZGVsID0gdGhpc1xuXG4gICAgT2JqZWN0LmtleXModGhpcy5kb2N1bWVudC5kYXRhIHx8IHt9KS5mb3JFYWNoKGtleSA9PiB7XG4gICAgICBpZihrZXkgPT09ICd0eXBlJykgeyByZXR1cm4gfVxuXG4gICAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkobW9kZWwsIGtleSwge1xuICAgICAgICBnZXQ6IGZ1bmN0aW9uKCl7XG4gICAgICAgICAgcmV0dXJuIG1vZGVsLmRhdGFba2V5XVxuICAgICAgICB9XG4gICAgICB9KVxuICAgIH0pXG4gIH1cblxuICBleHRyYWN0Q29udGVudCgpIHtcblxuICB9XG5cbiAgZXh0cmFjdERhdGEoKSB7XG5cbiAgfVxuICBcbiAgZ2V0QnJpZWZjYXNlKCl7XG4gICAgcmV0dXJuIHRoaXMuZG9jdW1lbnQuZ2V0QnJpZWZjYXNlKClcbiAgfVxuXG4gIGdldE1vZGVsc0NvbGxlY3Rpb24oZ3JvdXBOYW1lKXtcbiAgICBsZXQgYmMgPSB0aGlzLmdldEJyaWVmY2FzZSgpXG4gICAgaWYoYmMpe1xuICAgICAgcmV0dXJuIGJjW2dyb3VwTmFtZV1cbiAgICB9XG4gIH1cblxuICByZWxhdGlvbklkcygpe1xuICAgIGxldCByZWxhdGlvbnNoaXBzID0gdGhpcy5jb25maWcucmVsYXRpb25zaGlwc1xuXG4gICAgcmV0dXJuIHJlbGF0aW9uc2hpcHMucmVkdWNlKGZ1bmN0aW9uKG1lbW8scmVsYXRpb25zaGlwSWQpe1xuICAgICAgbWVtb1tyZWxhdGlvbnNoaXBJZF0gPSBbXVxuICAgICAgbGV0IHJlbGF0ZWRJZHMgPSB0aGlzLnJlbGF0ZWQocmVsYXRpb25zaGlwSWQpLm1hcChyZWxhdGlvbiA9PiByZWxhdGlvbi5pZClcblxuICAgICAgbWVtb1tyZWxhdGlvbnNoaXBJZF0uY29uY2F0KHJlbGF0ZWRJZHMpXG4gICAgICByZXR1cm4gbWVtbyBcbiAgICB9LCB7fSlcbiAgfVxuXG4gIHJlbGF0ZWQocmVsYXRpb25zaGlwSWQpe1xuICAgIGxldCBjb25maWcgPSB0aGlzLmdldFJlbGF0aW9uc2hpcENvbmZpZyhyZWxhdGlvbnNoaXBJZClcbiAgICBsZXQgcmVsYXRlZE1vZGVsID0gY29uZmlnLm1vZGVsRGVmaW5pdGlvbigpXG5cbiAgICBpZighcmVsYXRlZE1vZGVsKXtcbiAgICAgIHRocm93KCdJbnZhbGlkIHJlbGF0aW9uc2hpcCAnICsgcmVsYXRpb25zaGlwSWQpXG4gICAgfVxuXG4gICAgbGV0IGNvbGxlY3Rpb24gPSB0aGlzLmdldE1vZGVsc0NvbGxlY3Rpb24ocmVsYXRlZE1vZGVsLmdyb3VwTmFtZSkgfHwgXyhbXSlcbiAgICBcbiAgICBpZihjb25maWcuaGFzTWFueSl7XG4gICAgICBsZXQgbXlLZXlWYWx1ZSA9IHRoaXMucmVhZChjb25maWcua2V5KVxuICAgICAgbGV0IGZvcmVpZ25LZXlGaWVsZCA9IGNvbmZpZy5mb3JlaWduS2V5XG4gICAgICBcbiAgICAgIHJldHVybiBjb2xsZWN0aW9uLmZpbHRlcihtb2RlbCA9PiB7XG4gICAgICAgIHJldHVybiBtb2RlbC5yZWFkKGZvcmVpZ25LZXlGaWVsZCkgPT09IG15S2V5VmFsdWUgICAgICAgIFxuICAgICAgfSlcbiAgICB9XG5cbiAgICBpZihjb25maWcuYmVsb25nc1RvKXtcbiAgICAgIGxldCBteUtleVZhbHVlID0gdGhpcy5yZWFkKGNvbmZpZy5mb3JlaWduS2V5KVxuICAgICAgbGV0IGZvcmVpZ25LZXlGaWVsZCA9IGNvbmZpZy5yZWZlcmVuY2VzXG5cbiAgICAgIHJldHVybiBjb2xsZWN0aW9uLmZpbmQobW9kZWwgPT4ge1xuICAgICAgICByZXR1cm4gbW9kZWwucmVhZChmb3JlaWduS2V5RmllbGQpID09PSBteUtleVZhbHVlICAgICAgICBcbiAgICAgIH0pXG4gICAgfVxuICB9XG5cbiAgZ2V0IGRlZmluZWRTZWN0aW9uTm9kZXMoKXtcbiAgICByZXR1cm4gdGhpcy5kb2N1bWVudC5nZXRTZWN0aW9uTm9kZXMoKS5maWx0ZXIobm9kZSA9PiB7XG4gICAgICByZXR1cm4gdGhpcy5leHBlY3RlZFNlY3Rpb25IZWFkaW5ncy5pbmRleE9mKG5vZGUuaGVhZGluZykgPj0gMFxuICAgIH0pXG4gIH1cblxuICBnZXRBdHRyaWJ1dGVDb25maWcoa2V5KSB7XG4gICAgcmV0dXJuIHRoaXMuY29uZmlnLmF0dHJpYnV0ZXNba2V5XVxuICB9XG4gXG4gIGdldFJlbGF0aW9uc2hpcENvbmZpZyhyZWxhdGlvbnNoaXBJZCkge1xuICAgIHJldHVybiB0aGlzLmNvbmZpZy5yZWxhdGlvbnNoaXBzW3JlbGF0aW9uc2hpcElkXVxuICB9XG4gXG4gIGdldCBjb25maWcoKXtcbiAgICByZXR1cm4ge1xuICAgICAgYXR0cmlidXRlczogdGhpcy5tb2RlbERlZmluaXRpb24uYXR0cmlidXRlcyxcbiAgICAgIHJlbGF0aW9uc2hpcHM6IHRoaXMubW9kZWxEZWZpbml0aW9uLnJlbGF0aW9uc2hpcHMsXG4gICAgICBzZWN0aW9uczogdGhpcy5tb2RlbERlZmluaXRpb24uc2VjdGlvbnNcbiAgICB9XG4gIH1cblxuICBnZXQgZXhwZWN0ZWRTZWN0aW9uSGVhZGluZ3MoKXtcbiAgICByZXR1cm4gZmxhdHRlbihPYmplY3QudmFsdWVzKHRoaXMuY29uZmlnLnNlY3Rpb25zKS5tYXAoZGVmID0+IFtkZWYubmFtZSwgZGVmLmFsaWFzZXNdKSlcbiAgfVxuICBcbiAgZ2V0TW9kZWxEZWZpbml0aW9uKCl7XG4gICAgY29uc29sZS5sb2coJ0RlcHJlY2F0ZWQgZ2V0TW9kZWxEZWZpbml0aW9uJylcbiAgICByZXR1cm4gdGhpcy5tb2RlbERlZmluaXRpb25cbiAgfVxuICBcbiAgZ2V0IG1vZGVsRGVmaW5pdGlvbigpe1xuICAgIHJldHVybiBNb2RlbERlZmluaXRpb24ubG9va3VwKHRoaXMudHlwZSlcbiAgfVxuXG4gIGdldCBjb2RlQmxvY2tzKCl7XG4gICAgcmV0dXJuIG5ldyBDb2RlRXh0cmFjdGlvbih0aGlzKSBcbiAgfVxufVxuIl19