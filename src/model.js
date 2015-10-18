import _ from 'underscore'
import inflect from 'i'

import Document from './document'
import ModelDefinition from './model_definition'
import Briefcase from './briefcase'
import {fragment} from './render'

const flatten = _.flatten
const string = inflect()

export default class Model {
  static fromDocument (document){
    return new Model(document)
  }

  constructor(document, options={}) {
    this.document     = document
    this.data         = document.data || {}
    this.groupName    = options.groupName || "documents"
    this.id           = options.id
    this.document.id  = this.id
    
    this.type = this.data.type || document.getType()
    this.groupName = string.pluralize(this.type)
    
    Object.keys(this.data).forEach(key => this[key] = this.data[key])
  }
  
  read(property){
    let value = this[property]
    return typeof(value) === 'function' ? value.call(this) : value
  }

  toString(){
    return 'Document: ' + this.document.path
  }

  toJSON(options={}) {
    return {
      data: this.data
    }
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

  related(relationshipId){
    let config = this.getRelationshipConfig(relationshipId)
    let relatedModel = config.modelDefinition()

    if(!relatedModel){
      throw('Invalid relationship ' + relationshipId)
    }
    
    console.log(config)

    let collection = this.getModelsCollection(relatedModel.groupName) 
    
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

  definedSectionNodes(){
    return this.document.getSectionNodes().filter(node => {
      return this.expectedSectionHeadings().indexOf(node.heading) >= 0
    })
  }

  getAttributeConfig(key) {
    return getAttributesConfig()[key]
  }

  getAttributesConfig() {
    return this.getModelDefinition().attributes
  }

  getSectionsConfig(){
    return this.getModelDefinition().sections
  }
  
  getRelationshipsConfig(){
    return this.getModelDefinition().relationships
  }

  getRelationshipConfig(relationshipId){
    return this.getRelationshipsConfig()[relationshipId]
  }

  expectedSectionHeadings(){
    const cfg = this.getSectionsConfig()
    return flatten(Object.values(cfg).map(def => [def.name, def.aliases]))
  }

  getModelDefinition(){
    return ModelDefinition.lookup(this.type)
  }

}
