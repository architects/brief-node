import Document from './document'
import ModelDefinition from './model_definition'
import Case from './case'
import inflect from 'i'

export default class Model {
  static fromDocument (document){
    return new Model(document)
  }

  constructor(document, options={}) {
    this.document   = document
    this.data       = document.data || {}
    this.groupName  = options.groupName || "documents"
    this.id         = options.id

    if(this.data.type){
      this.groupName = inflect().pluralize(this.data.type)
    }
    
    Object.keys(this.data).forEach(key => this[key] = this.data[key])
  }

  toString(){
    return this.document.path
  }
  
  getModelDefinition(){

  }
}
