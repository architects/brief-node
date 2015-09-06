import Document from './document'
import Case from './case'
import inflect from 'i'

export default class Model {
  static create(path, options={}) {
    let document = new Document(path, options)
    return new Model(document, options)
  }
  
  toString(){
    return this.document.path
  }

  constructor(document, options={}) {
    this.document = document
    this.data = document.data
    this.groupName = "documents"

    if(this.data.type){
      this.groupName = inflect().pluralize(this.data.type)
    }

    let keys = Object.keys(this.data)

    keys.forEach((key)=>{
      this[key] = this[key] || document.data[key]
    })
  }
}
