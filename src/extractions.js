import _ from 'underscore'

export class CodeExtraction {
  constructor(model){
    this.model = model
    
    this.blocks = {}

    this.elements.map(el => {
      let bucket = this.blocks[el.lang] = this.blocks[el.lang] || []
      bucket.push(el.value)
    })
    
    let extraction = this

    this.languages.forEach(lang => {
      Object.defineProperty(this, lang, {
        configurable: true,
        get: function(){
          return extraction.blocks[lang]
        }
      })
    })
  }
  
  get languages(){
    return Object.keys(this.blocks)
  }

  get elements(){
    return this.model.document.getCodeBlocks()
  }
}

export class ExtractionRule {
  get the(){ return this }
  
  type: "single"

  first(selector){
    this.type = "single"
    this.selector = selector
    return this
  }
  
  all(selector){
    this.type = "multiple"
    this.selector = selector
    return this
  }

  as(attributeName){
    this.attributeName = attributeName
    return this
  }
}
