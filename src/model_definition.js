import inflect from 'i'
import fs from 'fs'
import _ from 'underscore'
import brief from './index'
import DocumentSection from './document_section'
import Model from './model'
import Collection from './collection'
import registry from './model_registry'

const inflections = inflect()

const definitions = registry.models 
const type_aliases = registry.aliases 

const dsl = {
  close: function(){
    let current = ModelDefinition.last()
    return current.toPrototype()
  },

  define: function( modelName, options = {} ) {
    let current = definitions[modelName]
    definitions[modelName] = current || new ModelDefinition(modelName, options)

    return current
  },

  attributes: function (...list) {
    let current = ModelDefinition.last()
    return current.defineAttributes(list)
  },

  attribute: function(name){
    let current = ModelDefinition.last()
    return current.attributes[name]
  },
  
  hasMany: function(relationship, options={}){
    let current = ModelDefinition.last()
    let config = current.relationships[relationship] = options

    config.hasMany = true
    config.belongsTo = false
    config.type = "hasMany"
    config.relationship = relationship
    config.foreignKey = current.type_alias
  },
  
  belongsTo: function(relationship, options={}){
    let current = ModelDefinition.last()
    let config = current.relationships[relationship] = options

    config.hasMany = false
    config.belongsTo = true
    config.type = "belongsTo"
    config.modelDefinition = ModelDefinition.lookup(relationship)
    config.relationship = relationship
    config.foreignKey = config.foreignKey || relationship
  },

  section: function (name, options = {}) {
    let current = ModelDefinition.last()
    return current.defineSection(name, options)
  },

  action: function (name, handler) {
    let current = ModelDefinition.last()
    return current.defineAction(name, handler)
  }
}

const dsl_methods = [
  "define",
  "attributes",
  "attribute",
  "section",
  "action",
  "actions",
  "close",
  "hasMany",
  "belongsTo"
]


class AttributeConfig {
  constructor(config){
    for(var key in config){
      this[key] = config[key]
    }
  }

  extract(selector){
    this.extraction = this.extraction || {}
    this.extraction.selector = selector
    return this
  }
}

export default class ModelDefinition {
  static setupDSL () {
    dsl_methods.forEach(method => global[method] = dsl[method])    
  }

  static cleanupDSL () {
    dsl_methods.forEach(method => delete(global[method]))
  }
  
  static finalize(){
    ModelDefinition.getAll().forEach(definition => definition.finalizeRelationships())
  }

  static load (path) {
    let content = readPath(path)

    ModelDefinition.setupDSL()

    let loaded = require(path)

    ModelDefinition.cleanupDSL()

    return loaded
  }

  static last () {
    let all = this.getAll()
    return all[all.length - 1]
  }

  static getAll () {
    return _(definitions).values()
  }

  static getModelSchema () {
    return definitions
  }

  static lookup (aliasOrName, singular = true) {
    if(definitions[aliasOrName]){
      return definitions[aliasOrName]
    }
    
    let name = type_aliases[aliasOrName]
    
    if(name && definitions[name]){
      return definitions[name]
    }

    if(singular == true){
      return ModelDefinition.lookup(inflections.singularize(aliasOrName), false)
    }
  }
  
  static getTypeAliases(){
    return Object.keys(type_aliases)
  }

  constructor (name = "Document") {
    this.name = inflections.camelize(name)
    this.type_alias = inflections.underscore(name.toLowerCase())
    this.groupName = inflections.pluralize(name.toLowerCase())

    this.attributes = {}
    this.sections = {}
    this.actions = {}
    this.relationships = {}

    //store a reference in the bucket
    definitions[this.name] = this
    type_aliases[this.type_alias] = this.name
  }
  
  finalizeRelationships(){
    _(this.relationships).values().forEach(relationship => {
      relationship.modelDefinition = function(){
        return ModelDefinition.lookup(relationship.relationship)
      }
    })
  }

  actionNames(){
    return Object.keys(this.actions)
  }

  getAllModelInstances(){
    let results = []
    let groupName = this.groupName

    return _.flatten(brief.instances().map(briefcase => {
      results.push(briefcase.filterAll(model => model.groupName == groupName))
    }))
  }

  toCollectionPrototype() {
    let collection = function(){ }
    let definition = this
    let attributeNames = Object.keys(this.attributes)

    collection.prototype = Collection

    
    for(var name in attributeNames){
      let finderName = inflections.camelize('find_by_' + name, false)
      collection[finderName] = function(needle){
        this.models.find(model => model[name] == needle)
      }
    }

    return collection
  }

  toPrototype () {
    let obj = function(){ }
    let definition = this

    obj.prototype = Model
    
    obj.getModelDefinition = function(){
      return definition
    }

    for(var action in this.actions){
      obj[action] = function(){
        actions[action].apply(obj, arguments)
      }
    }

    return obj
  }
  
  /**
   * returns the attribute names as an array
  */
  attributeNames() {
    return Object.values(this.attributes).map(attr => attr.name)
  }
  
  /**
   * returns the attributes which are configured for extraction
  */
  extractions() {
    return Object.values(this.attributes).filter(attr => attr.extraction)
  }

  /** 
   * defines attributes for the model's metadata
  */
  defineAttributes (list = []) {
    list.forEach(attr => {
      if(typeof(attr) === "string")
        attr = {name: attr}
      
      this.attributes[attr.name] = new AttributeConfig(attr)
    })

    return this
  }
  
  /**
   * defines a section for the model. a section will be
   * built from the written content of the document. sections
   * consist of headings nested within headings.
  */
  defineSection (sectionName, options = {}) {
    this.sections[sectionName] = new DocumentSection(sectionName, this, options)
    return this.sections[sectionName]
  }

  /**
   * defines an action for this model. an action can be dispatched from
   * the command line, and run on arbitrary paths.
  */
  defineAction (actionName, handler) {
    this.actions[actionName] = handler
    return this
  }
}

function readPath(path) {
  return fs.readFileSync(path).toString()
}
