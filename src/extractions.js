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
