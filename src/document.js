import fs from 'fs'
import mdast from 'mdast'
import yaml from 'mdast-yaml'
import html from 'mdast-html'
import Model from './model'
import structure from './structure'
import squeeze from 'mdast-squeeze-paragraphs'
import normalize from 'mdast-normalize-headings' 
import cheerio from 'cheerio'
import _ from 'underscore'

const processor = mdast.use([yaml,squeeze,normalize,structure,html])

export default class Document {
  toString() {
    return this.path
  }

  constructor(path, options) {
    this.path = path
    this.options = options
    this.process()
  }
  
  rendered() {
    this.render()
    return this
  }

  render() {
    this.process()
  }

  process() {
    this.content = readPath(this.path)
    this.ast = processor.parse(this.content)
    
    if(this.options.contentWasParsed) {
      this.options.contentWasParsed.call(this, this.ast)
    }
    
    this.ast = processor.run(this.ast)
    
    if(this.getFirstNode() && this.getFirstNode().type === "yaml") {
      this.data = this.getFirstNode().yaml
    }

    if(this.options.beforeRender) {
      this.options.beforeRender.call(this, this.ast)
    }
    
    this.html = processor.stringify(this.ast)
    this.$ = cheerio.load(this.html)

    this.html
  }

  toModel() {
    return Model.create(this.path, this.options)
  }

  getFirstNode() {
    return this.ast && this.ast.children && this.ast.children[0] 
  }
}

function readPath(path) {
  return fs.readFileSync(path).toString()
}
