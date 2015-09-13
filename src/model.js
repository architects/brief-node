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

    if(this.data.type){
      this.groupName = string.pluralize(this.data.type)
    }
    
    Object.keys(this.data).forEach(key => this[key] = this.data[key])
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

  expectedSectionHeadings(){
    const cfg = this.getSectionsConfig()
    return flatten(Object.values(cfg).map(def => [def.name, def.aliases]))
  }

  getModelDefinition(){
    return ModelDefinition.lookup(this.type)
  }

}
