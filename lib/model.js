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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3NyYy9tb2RlbC5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7MEJBQWMsWUFBWTs7OztpQkFDTixHQUFHOzs7O3dCQUVGLFlBQVk7Ozs7Z0NBQ0wsb0JBQW9COzs7O3lCQUMxQixhQUFhOzs7OzJCQUNKLGVBQWU7O3lCQUN2QixhQUFhOztBQUVwQyxJQUFNLE9BQU8sR0FBRyx3QkFBRSxPQUFPLENBQUE7QUFDekIsSUFBTSxNQUFNLEdBQUcscUJBQVMsQ0FBQTs7SUFFSCxLQUFLO2VBQUwsS0FBSzs7V0FDSixzQkFBQyxRQUFRLEVBQUM7QUFDNUIsYUFBTyxJQUFJLEtBQUssQ0FBQyxRQUFRLENBQUMsQ0FBQTtLQUMzQjs7O0FBRVUsV0FMUSxLQUFLLENBS1osUUFBUSxFQUFjO1FBQVosT0FBTyx5REFBQyxFQUFFOzswQkFMYixLQUFLOztBQU10QixRQUFJLENBQUMsUUFBUSxHQUFPLFFBQVEsQ0FBQTtBQUM1QixRQUFJLENBQUMsU0FBUyxHQUFNLE9BQU8sQ0FBQyxTQUFTLElBQUksV0FBVyxDQUFBO0FBQ3BELFFBQUksQ0FBQyxFQUFFLEdBQWEsT0FBTyxDQUFDLEVBQUUsQ0FBQTtBQUM5QixRQUFJLENBQUMsUUFBUSxDQUFDLEVBQUUsR0FBSSxJQUFJLENBQUMsRUFBRSxDQUFBOztBQUUzQixRQUFJLENBQUMsSUFBSSxHQUFHLFFBQVEsQ0FBQyxPQUFPLEVBQUUsQ0FBQTs7QUFFOUIsUUFBSSxDQUFDLGtCQUFrQixFQUFFLENBQUE7O0FBRXpCLFFBQUksQ0FBQyxTQUFTLEdBQUcsTUFBTSxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUE7R0FDN0M7O2VBaEJrQixLQUFLOztXQXNCcEIsY0FBQyxRQUFRLEVBQUM7QUFDWixVQUFJLEtBQUssR0FBRyxJQUFJLENBQUMsUUFBUSxDQUFDLENBQUE7QUFDMUIsYUFBTyxPQUFPLEtBQUssQUFBQyxLQUFLLFVBQVUsR0FBRyxLQUFLLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxHQUFHLEtBQUssQ0FBQTtLQUMvRDs7O1dBRWEsMEJBQUU7QUFDZCxhQUFPLElBQUksQ0FBQyxRQUFRLENBQUMsY0FBYyxFQUFFLENBQUE7S0FDdEM7OztXQUVPLG9CQUFFO0FBQ1IsYUFBTyxZQUFZLEdBQUcsSUFBSSxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUE7S0FDekM7Ozs7Ozs7OztXQU9jLDJCQUFxQjtVQUFwQixJQUFJLHlEQUFDLEVBQUU7VUFBRSxPQUFPLHlEQUFDLEVBQUU7O0FBQ2pDLFVBQUksS0FBSyxHQUFHLENBQUMsQ0FBQTs7QUFFYixVQUFHLElBQUksQ0FBQyxLQUFLLElBQUksSUFBSSxDQUFDLEtBQUssS0FBSyxJQUFJLEVBQUM7QUFDbkMsZUFBTyxHQUFHLENBQUE7T0FDWDs7QUFFRCxVQUFHLElBQUksQ0FBQyxLQUFLLElBQUksSUFBSSxDQUFDLEtBQUssQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLEVBQUM7QUFDdEMsZUFBTyxFQUFFLENBQUE7T0FDVjs7QUFFRCxVQUFJLGVBQWUsR0FBRyxJQUFJLENBQUMsUUFBUSxDQUFDLGtCQUFrQixFQUFFLENBQUE7QUFDeEQsVUFBSSxlQUFlLEdBQUcsSUFBSSxDQUFDLFFBQVEsQ0FBQyxrQkFBa0IsRUFBRSxDQUFBOztBQUV4RCxXQUFLLEdBQUcsS0FBSyxHQUFHLGVBQWUsQ0FBQyxNQUFNLENBQUMsVUFBQyxJQUFJLEVBQUMsT0FBTyxFQUFHO0FBQ3JELFlBQUcsT0FBTyxLQUFLLElBQUksRUFBQztBQUNsQixpQkFBTyxJQUFJLEdBQUcsRUFBRSxDQUFBO1NBQ2pCO0FBQ0QsWUFBRyxPQUFPLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxFQUFDO0FBQ3JCLGlCQUFPLElBQUksR0FBRyxFQUFFLENBQUE7U0FDakI7QUFDRCxlQUFPLElBQUksQ0FBQTtPQUNaLEVBQUUsQ0FBQyxDQUFDLENBQUE7O0FBRUwsV0FBSyxHQUFHLEtBQUssR0FBRyxlQUFlLENBQUMsTUFBTSxDQUFDLFVBQUMsSUFBSSxFQUFDLE9BQU8sRUFBRztBQUNyRCxZQUFHLE9BQU8sS0FBSyxJQUFJLEVBQUM7QUFDbEIsaUJBQU8sSUFBSSxHQUFHLEVBQUUsQ0FBQTtTQUNqQjtBQUNELFlBQUcsT0FBTyxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsRUFBQztBQUNyQixpQkFBTyxJQUFJLEdBQUcsRUFBRSxDQUFBO1NBQ2pCO0FBQ0QsZUFBTyxJQUFJLENBQUE7T0FDWixFQUFFLENBQUMsQ0FBQyxDQUFBOztBQUVMLGFBQU8sS0FBSyxDQUFBO0tBQ2I7OztXQUVRLHFCQUFjO1VBQWIsT0FBTyx5REFBRyxFQUFFOztBQUNwQixVQUFJLFNBQVMsR0FBRztBQUNkLFVBQUUsRUFBRSxJQUFJLENBQUMsRUFBRTtBQUNYLFlBQUksRUFBRSxJQUFJLENBQUMsSUFBSTtBQUNmLG9CQUFZLEVBQUUsSUFBSSxDQUFDLGNBQWMsRUFBRTtPQUNwQyxDQUFBOztBQUVELFVBQUksU0FBUyxHQUFHLElBQUksQ0FBQyxZQUFZLEVBQUUsQ0FBQTs7QUFFbkMsVUFBRyxTQUFTLEVBQUM7QUFDWCxpQkFBUyxDQUFDLFNBQVMsR0FBRztBQUNwQixjQUFJLEVBQUUsU0FBUyxDQUFDLElBQUk7QUFDcEIsZUFBSyxFQUFFLFNBQVMsQ0FBQyxLQUFLO1NBQ3ZCLENBQUE7T0FDRjs7QUFFRCxVQUFHLE9BQU8sQ0FBQyxlQUFlLEVBQUM7QUFDekIsaUJBQVMsQ0FBQyxRQUFRLEdBQUc7QUFDbkIsY0FBSSxFQUFFLElBQUksQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxTQUFTLENBQUMsTUFBTSxDQUFDLFNBQVMsR0FBRyxHQUFHLEVBQUUsRUFBRSxDQUFDO0FBQ3RFLGlCQUFPLEVBQUUsSUFBSSxDQUFDLFFBQVEsQ0FBQyxPQUFPO0FBQzlCLGNBQUksRUFBRSxJQUFJLENBQUMsUUFBUSxDQUFDLElBQUk7QUFDeEIsY0FBSSxFQUFFLElBQUksQ0FBQyxRQUFRLENBQUMsT0FBTyxFQUFFO1NBQzlCLENBQUE7O0FBRUQsWUFBRyxPQUFPLENBQUMsY0FBYyxFQUFDO0FBQ3hCLG1CQUFTLENBQUMsUUFBUSxDQUFDLFFBQVEsR0FBRyxJQUFJLENBQUMsUUFBUSxDQUFDLE1BQU0sRUFBRSxDQUFBO1NBQ3JEO09BQ0Y7O0FBRUQsYUFBTyxTQUFTLENBQUE7S0FDakI7OztXQUVLLGtCQUFhO1VBQVosT0FBTyx5REFBQyxFQUFFOztBQUNmLGFBQU87QUFDTCxVQUFFLEVBQUUsSUFBSSxDQUFDLEVBQUU7QUFDWCxZQUFJLEVBQUUsSUFBSSxDQUFDLElBQUk7QUFDZixzQkFBYyxFQUFFLElBQUksQ0FBQyxjQUFjLEVBQUU7T0FDdEMsQ0FBQTtLQUNGOzs7V0FFaUIsOEJBQUU7QUFDbEIsVUFBSSxLQUFLLEdBQUcsSUFBSSxDQUFBOztBQUVoQixZQUFNLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsSUFBSSxJQUFJLEVBQUUsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxVQUFBLEdBQUcsRUFBSTtBQUNuRCxZQUFHLEdBQUcsS0FBSyxNQUFNLEVBQUU7QUFBRSxpQkFBTTtTQUFFOztBQUU3QixjQUFNLENBQUMsY0FBYyxDQUFDLEtBQUssRUFBRSxHQUFHLEVBQUU7QUFDaEMsYUFBRyxFQUFFLGVBQVU7QUFDYixtQkFBTyxLQUFLLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFBO1dBQ3ZCO1NBQ0YsQ0FBQyxDQUFBO09BQ0gsQ0FBQyxDQUFBO0tBQ0g7OztXQUVhLDBCQUFHLEVBRWhCOzs7V0FFVSx1QkFBRyxFQUViOzs7V0FFVyx3QkFBRTtBQUNaLGFBQU8sSUFBSSxDQUFDLFFBQVEsQ0FBQyxZQUFZLEVBQUUsQ0FBQTtLQUNwQzs7O1dBRWtCLDZCQUFDLFNBQVMsRUFBQztBQUM1QixVQUFJLEVBQUUsR0FBRyxJQUFJLENBQUMsWUFBWSxFQUFFLENBQUE7QUFDNUIsVUFBRyxFQUFFLEVBQUM7QUFDSixlQUFPLEVBQUUsQ0FBQyxTQUFTLENBQUMsQ0FBQTtPQUNyQjtLQUNGOzs7V0FFVSx1QkFBRTtBQUNYLFVBQUksYUFBYSxHQUFHLElBQUksQ0FBQyxNQUFNLENBQUMsYUFBYSxDQUFBOztBQUU3QyxhQUFPLGFBQWEsQ0FBQyxNQUFNLENBQUMsVUFBUyxJQUFJLEVBQUMsY0FBYyxFQUFDO0FBQ3ZELFlBQUksQ0FBQyxjQUFjLENBQUMsR0FBRyxFQUFFLENBQUE7QUFDekIsWUFBSSxVQUFVLEdBQUcsSUFBSSxDQUFDLE9BQU8sQ0FBQyxjQUFjLENBQUMsQ0FBQyxHQUFHLENBQUMsVUFBQSxRQUFRO2lCQUFJLFFBQVEsQ0FBQyxFQUFFO1NBQUEsQ0FBQyxDQUFBOztBQUUxRSxZQUFJLENBQUMsY0FBYyxDQUFDLENBQUMsTUFBTSxDQUFDLFVBQVUsQ0FBQyxDQUFBO0FBQ3ZDLGVBQU8sSUFBSSxDQUFBO09BQ1osRUFBRSxFQUFFLENBQUMsQ0FBQTtLQUNQOzs7V0FFTSxpQkFBQyxjQUFjLEVBQUM7OztBQUNyQixVQUFJLE1BQU0sR0FBRyxJQUFJLENBQUMscUJBQXFCLENBQUMsY0FBYyxDQUFDLENBQUE7QUFDdkQsVUFBSSxZQUFZLEdBQUcsTUFBTSxDQUFDLGVBQWUsRUFBRSxDQUFBOztBQUUzQyxVQUFHLENBQUMsWUFBWSxFQUFDO0FBQ2YsY0FBTSx1QkFBdUIsR0FBRyxjQUFjLENBQUM7T0FDaEQ7O0FBRUQsVUFBSSxVQUFVLEdBQUcsSUFBSSxDQUFDLG1CQUFtQixDQUFDLFlBQVksQ0FBQyxTQUFTLENBQUMsSUFBSSw2QkFBRSxFQUFFLENBQUMsQ0FBQTs7QUFFMUUsVUFBRyxNQUFNLENBQUMsT0FBTyxFQUFDOztBQUNoQixjQUFJLFVBQVUsR0FBRyxNQUFLLElBQUksQ0FBQyxNQUFNLENBQUMsR0FBRyxDQUFDLENBQUE7QUFDdEMsY0FBSSxlQUFlLEdBQUcsTUFBTSxDQUFDLFVBQVUsQ0FBQTs7QUFFdkM7ZUFBTyxVQUFVLENBQUMsTUFBTSxDQUFDLFVBQUEsS0FBSyxFQUFJO0FBQ2hDLHFCQUFPLEtBQUssQ0FBQyxJQUFJLENBQUMsZUFBZSxDQUFDLEtBQUssVUFBVSxDQUFBO2FBQ2xELENBQUM7WUFBQTs7OztPQUNIOztBQUVELFVBQUcsTUFBTSxDQUFDLFNBQVMsRUFBQzs7QUFDbEIsY0FBSSxVQUFVLEdBQUcsTUFBSyxJQUFJLENBQUMsTUFBTSxDQUFDLFVBQVUsQ0FBQyxDQUFBO0FBQzdDLGNBQUksZUFBZSxHQUFHLE1BQU0sQ0FBQyxVQUFVLENBQUE7O0FBRXZDO2VBQU8sVUFBVSxDQUFDLElBQUksQ0FBQyxVQUFBLEtBQUssRUFBSTtBQUM5QixxQkFBTyxLQUFLLENBQUMsSUFBSSxDQUFDLGVBQWUsQ0FBQyxLQUFLLFVBQVUsQ0FBQTthQUNsRCxDQUFDO1lBQUE7Ozs7T0FDSDtLQUNGOzs7V0FRaUIsNEJBQUMsR0FBRyxFQUFFO0FBQ3RCLGFBQU8sSUFBSSxDQUFDLE1BQU0sQ0FBQyxVQUFVLENBQUMsR0FBRyxDQUFDLENBQUE7S0FDbkM7OztXQUVvQiwrQkFBQyxjQUFjLEVBQUU7QUFDcEMsYUFBTyxJQUFJLENBQUMsTUFBTSxDQUFDLGFBQWEsQ0FBQyxjQUFjLENBQUMsQ0FBQTtLQUNqRDs7O1dBY2lCLDhCQUFFO0FBQ2xCLGFBQU8sQ0FBQyxHQUFHLENBQUMsK0JBQStCLENBQUMsQ0FBQTtBQUM1QyxhQUFPLElBQUksQ0FBQyxlQUFlLENBQUE7S0FDNUI7OztTQTFNTyxlQUFFO0FBQ1IsYUFBTyxJQUFJLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQTtLQUMxQjs7O1NBMktzQixlQUFFOzs7QUFDdkIsYUFBTyxJQUFJLENBQUMsUUFBUSxDQUFDLGVBQWUsRUFBRSxDQUFDLE1BQU0sQ0FBQyxVQUFBLElBQUksRUFBSTtBQUNwRCxlQUFPLE9BQUssdUJBQXVCLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLENBQUE7T0FDL0QsQ0FBQyxDQUFBO0tBQ0g7OztTQVVTLGVBQUU7QUFDVixhQUFPO0FBQ0wsa0JBQVUsRUFBRSxJQUFJLENBQUMsZUFBZSxDQUFDLFVBQVU7QUFDM0MscUJBQWEsRUFBRSxJQUFJLENBQUMsZUFBZSxDQUFDLGFBQWE7QUFDakQsZ0JBQVEsRUFBRSxJQUFJLENBQUMsZUFBZSxDQUFDLFFBQVE7T0FDeEMsQ0FBQTtLQUNGOzs7U0FFMEIsZUFBRTtBQUMzQixhQUFPLE9BQU8sQ0FBQyxNQUFNLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsUUFBUSxDQUFDLENBQUMsR0FBRyxDQUFDLFVBQUEsR0FBRztlQUFJLENBQUMsR0FBRyxDQUFDLElBQUksRUFBRSxHQUFHLENBQUMsT0FBTyxDQUFDO09BQUEsQ0FBQyxDQUFDLENBQUE7S0FDeEY7OztTQU9rQixlQUFFO0FBQ25CLGFBQU8sOEJBQWdCLE1BQU0sQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUE7S0FDekM7OztTQUVhLGVBQUU7QUFDZCxhQUFPLGdDQUFtQixJQUFJLENBQUMsQ0FBQTtLQUNoQzs7O1NBcE9rQixLQUFLOzs7cUJBQUwsS0FBSyIsImZpbGUiOiJtb2RlbC5qcyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCBfIGZyb20gJ3VuZGVyc2NvcmUnXG5pbXBvcnQgaW5mbGVjdCBmcm9tICdpJ1xuXG5pbXBvcnQgRG9jdW1lbnQgZnJvbSAnLi9kb2N1bWVudCdcbmltcG9ydCBNb2RlbERlZmluaXRpb24gZnJvbSAnLi9tb2RlbF9kZWZpbml0aW9uJ1xuaW1wb3J0IEJyaWVmY2FzZSBmcm9tICcuL2JyaWVmY2FzZSdcbmltcG9ydCB7IENvZGVFeHRyYWN0aW9uIH0gZnJvbSAnLi9leHRyYWN0aW9ucydcbmltcG9ydCB7ZnJhZ21lbnR9IGZyb20gJy4vcGlwZWxpbmVzJ1xuXG5jb25zdCBmbGF0dGVuID0gXy5mbGF0dGVuXG5jb25zdCBzdHJpbmcgPSBpbmZsZWN0KClcblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgTW9kZWwge1xuICBzdGF0aWMgZnJvbURvY3VtZW50IChkb2N1bWVudCl7XG4gICAgcmV0dXJuIG5ldyBNb2RlbChkb2N1bWVudClcbiAgfVxuXG4gIGNvbnN0cnVjdG9yKGRvY3VtZW50LCBvcHRpb25zPXt9KSB7XG4gICAgdGhpcy5kb2N1bWVudCAgICAgPSBkb2N1bWVudFxuICAgIHRoaXMuZ3JvdXBOYW1lICAgID0gb3B0aW9ucy5ncm91cE5hbWUgfHwgXCJkb2N1bWVudHNcIlxuICAgIHRoaXMuaWQgICAgICAgICAgID0gb3B0aW9ucy5pZFxuICAgIHRoaXMuZG9jdW1lbnQuaWQgID0gdGhpcy5pZFxuICAgIFxuICAgIHRoaXMudHlwZSA9IGRvY3VtZW50LmdldFR5cGUoKVxuXG4gICAgdGhpcy5fY3JlYXRlRGF0YUdldHRlcnMoKVxuICAgIFxuICAgIHRoaXMuZ3JvdXBOYW1lID0gc3RyaW5nLnBsdXJhbGl6ZSh0aGlzLnR5cGUpXG4gIH1cbiAgXG4gIGdldCBkYXRhKCl7XG4gICAgcmV0dXJuIHRoaXMuZG9jdW1lbnQuZGF0YVxuICB9XG5cbiAgcmVhZChwcm9wZXJ0eSl7XG4gICAgbGV0IHZhbHVlID0gdGhpc1twcm9wZXJ0eV1cbiAgICByZXR1cm4gdHlwZW9mKHZhbHVlKSA9PT0gJ2Z1bmN0aW9uJyA/IHZhbHVlLmNhbGwodGhpcykgOiB2YWx1ZVxuICB9XG5cbiAgbGFzdE1vZGlmaWVkQXQoKXtcbiAgICByZXR1cm4gdGhpcy5kb2N1bWVudC5sYXN0TW9kaWZpZWRBdCgpXG4gIH1cblxuICB0b1N0cmluZygpe1xuICAgIHJldHVybiAnRG9jdW1lbnQ6ICcgKyB0aGlzLmRvY3VtZW50LnBhdGhcbiAgfVxuICBcbiAgLyoqXG4gICogc2NvcmVzIGEgZ2l2ZW4gc2VhcmNoIHRlcm0gYWdhaW5zdCB0aGlzIG1vZGVsLlxuICAqIHRoaXMgbWV0aG9kIGNhbiBiZSBvdmVycmlkZGVuIHRvIHByb3ZpZGUgY3VzdG9tIGxvZ2ljXG4gICogZm9yIGEgZ2l2ZW4gbW9kZWxcbiAgKi9cbiAgc2NvcmVTZWFyY2hUZXJtKHRlcm09XCJcIiwgb3B0aW9ucz17fSl7XG4gICAgbGV0IHNjb3JlID0gMFxuXG4gICAgaWYodGhpcy50aXRsZSAmJiB0aGlzLnRpdGxlID09PSB0ZXJtKXtcbiAgICAgIHJldHVybiAxMDBcbiAgICB9XG5cbiAgICBpZih0aGlzLnRpdGxlICYmIHRoaXMudGl0bGUubWF0Y2godGVybSkpe1xuICAgICAgcmV0dXJuIDkwXG4gICAgfVxuICAgIFxuICAgIGxldCBzZWN0aW9uSGVhZGluZ3MgPSB0aGlzLmRvY3VtZW50LmdldFNlY3Rpb25IZWFkaW5ncygpXG4gICAgbGV0IGFydGljbGVIZWFkaW5ncyA9IHRoaXMuZG9jdW1lbnQuZ2V0QXJ0aWNsZUhlYWRpbmdzKClcbiAgICBcbiAgICBzY29yZSA9IHNjb3JlICsgc2VjdGlvbkhlYWRpbmdzLnJlZHVjZSgobWVtbyxoZWFkaW5nKT0+e1xuICAgICAgaWYoaGVhZGluZyA9PT0gdGVybSl7XG4gICAgICAgIHJldHVybiBtZW1vICsgNTBcbiAgICAgIH1cbiAgICAgIGlmKGhlYWRpbmcubWF0Y2godGVybSkpe1xuICAgICAgICByZXR1cm4gbWVtbyArIDMwXG4gICAgICB9XG4gICAgICByZXR1cm4gbWVtb1xuICAgIH0sIDApXG5cbiAgICBzY29yZSA9IHNjb3JlICsgYXJ0aWNsZUhlYWRpbmdzLnJlZHVjZSgobWVtbyxoZWFkaW5nKT0+e1xuICAgICAgaWYoaGVhZGluZyA9PT0gdGVybSl7XG4gICAgICAgIHJldHVybiBtZW1vICsgNDBcbiAgICAgIH1cbiAgICAgIGlmKGhlYWRpbmcubWF0Y2godGVybSkpe1xuICAgICAgICByZXR1cm4gbWVtbyArIDIwXG4gICAgICB9XG4gICAgICByZXR1cm4gbWVtb1xuICAgIH0sIDApXG4gICAgXG4gICAgcmV0dXJuIHNjb3JlXG4gIH1cbiBcbiAgZm9yRXhwb3J0KG9wdGlvbnMgPSB7fSl7XG4gICAgbGV0IGZvckV4cG9ydCA9IHtcbiAgICAgIGlkOiB0aGlzLmlkLFxuICAgICAgZGF0YTogdGhpcy5kYXRhLFxuICAgICAgbGFzdE1vZGlmaWVkOiB0aGlzLmxhc3RNb2RpZmllZEF0KClcbiAgICB9XG5cbiAgICBsZXQgYnJpZWZjYXNlID0gdGhpcy5nZXRCcmllZmNhc2UoKVxuXG4gICAgaWYoYnJpZWZjYXNlKXtcbiAgICAgIGZvckV4cG9ydC5icmllZmNhc2UgPSB7XG4gICAgICAgIHJvb3Q6IGJyaWVmY2FzZS5yb290LFxuICAgICAgICB0aXRsZTogYnJpZWZjYXNlLnRpdGxlXG4gICAgICB9XG4gICAgfVxuXG4gICAgaWYob3B0aW9ucy5pbmNsdWRlRG9jdW1lbnQpe1xuICAgICAgZm9yRXhwb3J0LmRvY3VtZW50ID0ge1xuICAgICAgICBwYXRoOiB0aGlzLmRvY3VtZW50LnBhdGgucmVwbGFjZShicmllZmNhc2UuY29uZmlnLmRvY3NfcGF0aCArICcvJywgJycpLFxuICAgICAgICBjb250ZW50OiB0aGlzLmRvY3VtZW50LmNvbnRlbnQsXG4gICAgICAgIGRhdGE6IHRoaXMuZG9jdW1lbnQuZGF0YSxcbiAgICAgICAgdHlwZTogdGhpcy5kb2N1bWVudC5nZXRUeXBlKClcbiAgICAgIH1cblxuICAgICAgaWYob3B0aW9ucy5yZW5kZXJEb2N1bWVudCl7XG4gICAgICAgIGZvckV4cG9ydC5kb2N1bWVudC5yZW5kZXJlZCA9IHRoaXMuZG9jdW1lbnQucmVuZGVyKClcbiAgICAgIH1cbiAgICB9XG5cbiAgICByZXR1cm4gZm9yRXhwb3J0XG4gIH1cblxuICB0b0pTT04ob3B0aW9ucz17fSkge1xuICAgIHJldHVybiB7XG4gICAgICBpZDogdGhpcy5pZCxcbiAgICAgIGRhdGE6IHRoaXMuZGF0YSxcbiAgICAgIGxhc3RNb2RpZmllZEF0OiB0aGlzLmxhc3RNb2RpZmllZEF0KCksXG4gICAgfVxuICB9XG4gIFxuICBfY3JlYXRlRGF0YUdldHRlcnMoKXtcbiAgICBsZXQgbW9kZWwgPSB0aGlzXG5cbiAgICBPYmplY3Qua2V5cyh0aGlzLmRvY3VtZW50LmRhdGEgfHwge30pLmZvckVhY2goa2V5ID0+IHtcbiAgICAgIGlmKGtleSA9PT0gJ3R5cGUnKSB7IHJldHVybiB9XG5cbiAgICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShtb2RlbCwga2V5LCB7XG4gICAgICAgIGdldDogZnVuY3Rpb24oKXtcbiAgICAgICAgICByZXR1cm4gbW9kZWwuZGF0YVtrZXldXG4gICAgICAgIH1cbiAgICAgIH0pXG4gICAgfSlcbiAgfVxuXG4gIGV4dHJhY3RDb250ZW50KCkge1xuXG4gIH1cblxuICBleHRyYWN0RGF0YSgpIHtcblxuICB9XG4gIFxuICBnZXRCcmllZmNhc2UoKXtcbiAgICByZXR1cm4gdGhpcy5kb2N1bWVudC5nZXRCcmllZmNhc2UoKVxuICB9XG5cbiAgZ2V0TW9kZWxzQ29sbGVjdGlvbihncm91cE5hbWUpe1xuICAgIGxldCBiYyA9IHRoaXMuZ2V0QnJpZWZjYXNlKClcbiAgICBpZihiYyl7XG4gICAgICByZXR1cm4gYmNbZ3JvdXBOYW1lXVxuICAgIH1cbiAgfVxuXG4gIHJlbGF0aW9uSWRzKCl7XG4gICAgbGV0IHJlbGF0aW9uc2hpcHMgPSB0aGlzLmNvbmZpZy5yZWxhdGlvbnNoaXBzXG5cbiAgICByZXR1cm4gcmVsYXRpb25zaGlwcy5yZWR1Y2UoZnVuY3Rpb24obWVtbyxyZWxhdGlvbnNoaXBJZCl7XG4gICAgICBtZW1vW3JlbGF0aW9uc2hpcElkXSA9IFtdXG4gICAgICBsZXQgcmVsYXRlZElkcyA9IHRoaXMucmVsYXRlZChyZWxhdGlvbnNoaXBJZCkubWFwKHJlbGF0aW9uID0+IHJlbGF0aW9uLmlkKVxuXG4gICAgICBtZW1vW3JlbGF0aW9uc2hpcElkXS5jb25jYXQocmVsYXRlZElkcylcbiAgICAgIHJldHVybiBtZW1vIFxuICAgIH0sIHt9KVxuICB9XG5cbiAgcmVsYXRlZChyZWxhdGlvbnNoaXBJZCl7XG4gICAgbGV0IGNvbmZpZyA9IHRoaXMuZ2V0UmVsYXRpb25zaGlwQ29uZmlnKHJlbGF0aW9uc2hpcElkKVxuICAgIGxldCByZWxhdGVkTW9kZWwgPSBjb25maWcubW9kZWxEZWZpbml0aW9uKClcblxuICAgIGlmKCFyZWxhdGVkTW9kZWwpe1xuICAgICAgdGhyb3coJ0ludmFsaWQgcmVsYXRpb25zaGlwICcgKyByZWxhdGlvbnNoaXBJZClcbiAgICB9XG5cbiAgICBsZXQgY29sbGVjdGlvbiA9IHRoaXMuZ2V0TW9kZWxzQ29sbGVjdGlvbihyZWxhdGVkTW9kZWwuZ3JvdXBOYW1lKSB8fCBfKFtdKVxuICAgIFxuICAgIGlmKGNvbmZpZy5oYXNNYW55KXtcbiAgICAgIGxldCBteUtleVZhbHVlID0gdGhpcy5yZWFkKGNvbmZpZy5rZXkpXG4gICAgICBsZXQgZm9yZWlnbktleUZpZWxkID0gY29uZmlnLmZvcmVpZ25LZXlcbiAgICAgIFxuICAgICAgcmV0dXJuIGNvbGxlY3Rpb24uZmlsdGVyKG1vZGVsID0+IHtcbiAgICAgICAgcmV0dXJuIG1vZGVsLnJlYWQoZm9yZWlnbktleUZpZWxkKSA9PT0gbXlLZXlWYWx1ZSAgICAgICAgXG4gICAgICB9KVxuICAgIH1cblxuICAgIGlmKGNvbmZpZy5iZWxvbmdzVG8pe1xuICAgICAgbGV0IG15S2V5VmFsdWUgPSB0aGlzLnJlYWQoY29uZmlnLmZvcmVpZ25LZXkpXG4gICAgICBsZXQgZm9yZWlnbktleUZpZWxkID0gY29uZmlnLnJlZmVyZW5jZXNcblxuICAgICAgcmV0dXJuIGNvbGxlY3Rpb24uZmluZChtb2RlbCA9PiB7XG4gICAgICAgIHJldHVybiBtb2RlbC5yZWFkKGZvcmVpZ25LZXlGaWVsZCkgPT09IG15S2V5VmFsdWUgICAgICAgIFxuICAgICAgfSlcbiAgICB9XG4gIH1cblxuICBnZXQgZGVmaW5lZFNlY3Rpb25Ob2Rlcygpe1xuICAgIHJldHVybiB0aGlzLmRvY3VtZW50LmdldFNlY3Rpb25Ob2RlcygpLmZpbHRlcihub2RlID0+IHtcbiAgICAgIHJldHVybiB0aGlzLmV4cGVjdGVkU2VjdGlvbkhlYWRpbmdzLmluZGV4T2Yobm9kZS5oZWFkaW5nKSA+PSAwXG4gICAgfSlcbiAgfVxuXG4gIGdldEF0dHJpYnV0ZUNvbmZpZyhrZXkpIHtcbiAgICByZXR1cm4gdGhpcy5jb25maWcuYXR0cmlidXRlc1trZXldXG4gIH1cbiBcbiAgZ2V0UmVsYXRpb25zaGlwQ29uZmlnKHJlbGF0aW9uc2hpcElkKSB7XG4gICAgcmV0dXJuIHRoaXMuY29uZmlnLnJlbGF0aW9uc2hpcHNbcmVsYXRpb25zaGlwSWRdXG4gIH1cbiBcbiAgZ2V0IGNvbmZpZygpe1xuICAgIHJldHVybiB7XG4gICAgICBhdHRyaWJ1dGVzOiB0aGlzLm1vZGVsRGVmaW5pdGlvbi5hdHRyaWJ1dGVzLFxuICAgICAgcmVsYXRpb25zaGlwczogdGhpcy5tb2RlbERlZmluaXRpb24ucmVsYXRpb25zaGlwcyxcbiAgICAgIHNlY3Rpb25zOiB0aGlzLm1vZGVsRGVmaW5pdGlvbi5zZWN0aW9uc1xuICAgIH1cbiAgfVxuXG4gIGdldCBleHBlY3RlZFNlY3Rpb25IZWFkaW5ncygpe1xuICAgIHJldHVybiBmbGF0dGVuKE9iamVjdC52YWx1ZXModGhpcy5jb25maWcuc2VjdGlvbnMpLm1hcChkZWYgPT4gW2RlZi5uYW1lLCBkZWYuYWxpYXNlc10pKVxuICB9XG4gIFxuICBnZXRNb2RlbERlZmluaXRpb24oKXtcbiAgICBjb25zb2xlLmxvZygnRGVwcmVjYXRlZCBnZXRNb2RlbERlZmluaXRpb24nKVxuICAgIHJldHVybiB0aGlzLm1vZGVsRGVmaW5pdGlvblxuICB9XG4gIFxuICBnZXQgbW9kZWxEZWZpbml0aW9uKCl7XG4gICAgcmV0dXJuIE1vZGVsRGVmaW5pdGlvbi5sb29rdXAodGhpcy50eXBlKVxuICB9XG5cbiAgZ2V0IGNvZGVCbG9ja3MoKXtcbiAgICByZXR1cm4gbmV3IENvZGVFeHRyYWN0aW9uKHRoaXMpIFxuICB9XG59XG4iXX0=