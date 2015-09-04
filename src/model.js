import Document from './document'
import Case from './case'

export default class Model {
  static create(path, options={}) {
    let document = new Document(path, options)
    return new Model(document, options)
  }

  constructor(document, options={}){
    this.document = document
    this.data = document.data
  }
}
