import _ from 'underscore'
import inflect from 'i'

import Document from './document'
import ModelDefinition from './model_definition'
import Briefcase from './briefcase'
import { CodeExtraction } from './extractions'
import {fragment} from './pipelines'

const flatten = _.flatten
const string = inflect()

export default class Model {
  static fromDocument (document){
    return new Model(document)
  }

  constructor(document, options={}) {
    this.document     = document
    this.groupName    = options.groupName || "documents"
    this.id           = options.id
    this.document.id  = this.id
    
    this.type = document.getType()

    this._createDataGetters()
    
    this.groupName = string.pluralize(this.type)
  }
  
  get data(){
    return this.document.data
  }

  read(property){
    let value = this[property]
    return typeof(value) === 'function' ? value.call(this) : value
  }

  lastModifiedAt(){
    return this.document.lastModifiedAt()
  }

  toString(){
    return 'Document: ' + this.document.path
  }
  
  /**
  * scores a given search term against this model.
  * this method can be overridden to provide custom logic
  * for a given model
  */
  scoreSearchTerm(term="", options={}){
    let score = 0

    if(this.title && this.title === term){
      return 100
    }

    if(this.title && this.title.match(term)){
      return 90
    }
    
    let sectionHeadings = this.document.getSectionHeadings()
    let articleHeadings = this.document.getArticleHeadings()
    
    score = score + sectionHeadings.reduce((memo,heading)=>{
      if(heading === term){
        return memo + 50
      }
      if(heading.match(term)){
        return memo + 30
      }
      return memo
    }, 0)

    score = score + articleHeadings.reduce((memo,heading)=>{
      if(heading === term){
        return memo + 40
      }
      if(heading.match(term)){
        return memo + 20
      }
      return memo
    }, 0)
    
    return score
  }
 
  forExport(options = {}){
    let forExport = {
      id: this.id,
      data: this.data,
      lastModified: this.lastModifiedAt()
    }

    let briefcase = this.getBriefcase()

    if(briefcase){
      forExport.briefcase = {
        root: briefcase.root,
        title: briefcase.title
      }
    }

    if(options.includeDocument){
      forExport.document = {
        path: this.document.path.replace(briefcase.config.docs_path + '/', ''),
        content: this.document.content,
        data: this.document.data,
        type: this.document.getType()
      }

      if(options.renderDocument){
        forExport.document.rendered = this.document.render()
      }
    }

    return forExport
  }

  toJSON(options={}) {
    return {
      id: this.id,
      data: this.data,
      lastModifiedAt: this.lastModifiedAt(),
      relationIds: this.relationIds,
      document:{
        path: this.document.path,
        id: this.document.id
      }
    }
  }
  
  _createDataGetters(){
    let model = this

    Object.keys(this.document.data || {}).forEach(key => {
      if(key === 'type') { return }

      Object.defineProperty(model, key, {
        get: function(){
          return model.data[key]
        }
      })
    })
  }

  extractContent() {

  }

  extractData() {

  }
  
  getBriefcase(){
    return this.document.getBriefcase()
  }

  getModelsCollection(groupName){
    let bc = this.getBriefcase()
    if(bc){
      return bc[groupName]
    }
  }

  relationIds(){
    let relationships = this.config.relationships

    return relationships.reduce(function(memo,relationshipId){
      memo[relationshipId] = []
      let relatedIds = this.related(relationshipId).map(relation => relation.id)

      memo[relationshipId].concat(relatedIds)
      return memo 
    }, {})
  }

  related(relationshipId){
    let config = this.getRelationshipConfig(relationshipId)
    let relatedModel = config.modelDefinition()

    if(!relatedModel){
      throw('Invalid relationship ' + relationshipId)
    }

    let collection = this.getModelsCollection(relatedModel.groupName) || _([])
    
    if(config.hasMany){
      let myKeyValue = this.read(config.key)
      let foreignKeyField = config.foreignKey
      
      return collection.filter(model => {
        return model.read(foreignKeyField) === myKeyValue        
      })
    }

    if(config.belongsTo){
      let myKeyValue = this.read(config.foreignKey)
      let foreignKeyField = config.references

      return collection.find(model => {
        return model.read(foreignKeyField) === myKeyValue        
      })
    }
  }

  get definedSectionNodes(){
    return this.document.getSectionNodes().filter(node => {
      return this.expectedSectionHeadings.indexOf(node.heading) >= 0
    })
  }

  getAttributeConfig(key) {
    return this.config.attributes[key]
  }
 
  getRelationshipConfig(relationshipId) {
    return this.config.relationships[relationshipId]
  }
 
  get config(){
    return {
      attributes: this.modelDefinition.attributes,
      relationships: this.modelDefinition.relationships,
      sections: this.modelDefinition.sections
    }
  }

  get expectedSectionHeadings(){
    return flatten(Object.values(this.config.sections).map(def => [def.name, def.aliases]))
  }
  
  getModelDefinition(){
    console.log('Deprecated getModelDefinition')
    return this.modelDefinition
  }
  
  get modelDefinition(){
    return ModelDefinition.lookup(this.type)
  }

  get codeBlocks(){
    return new CodeExtraction(this) 
  }
}
