import inflect from 'i'
import fs from 'fs'
import _ from 'underscore'
import DocumentSection from './document_section'

const inflections = inflect()

var definitions = {}

const dsl = {
  define: function( modelName, options = {} ) {
    let current = definitions[modelName]
    definitions[modelName] = current || new ModelDefinition(modelName, options)

    return current
  },

  attributes: function (...list) {
    let current = ModelDefinition.last()
    return current.defineAttributes(list)
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
  "section",
  "action"
]

export default class ModelDefinition {
  static setupDSL () {
    dsl_methods.forEach(method => global[method] = dsl[method])    
  }

  static cleanupDSL () {
    dsl_methods.forEach(method => delete(global[method]))
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

  constructor (name = "Document") {
    this.name = inflections.camelize(name)
    definitions[this.name] = this
  }
  
  /** 
   * defines attributes for the model's metadata
  */
  defineAttributes (list = []) {
    this.attributes = this.attributes || []
    this.attributes = this.attributes.concat(list)
    return this
  }
  
  /**
   * defines a section for the model. a section will be
   * built from the written content of the document. sections
   * consist of headings nested within headings.
  */
  defineSection (sectionName, options = {}) {
    this.sections = this.sections || {}
    this.sections[sectionName] = new DocumentSection(sectionName, this, options)
    return this.sections[sectionName]
  }

  /**
   * defines an action for this model. an action can be dispatched from
   * the command line, and run on arbitrary paths.
  */
  defineAction (actionName, handler) {
    this.actions = this.actions || {}
    this.actions[actionName] = handler
    return this
  }
}

function readPath(path) {
  return fs.readFileSync(path).toString()
}
