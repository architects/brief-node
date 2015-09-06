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
    this._process()
  }
  
  rendered() {
    this.render()
    return this
  }

  render() {
    return this.html ? this.html : this._process()
  }

  _process() {
    this.content = readPath(this.path)
    this.ast = processor.parse(this.content)
    this.data = {}
    
    if(this.options.contentWasParsed) {
      this.options.contentWasParsed.call(this, this.ast)
    }
    
    this.ast = processor.run(this.ast)
    
    let firstNode = this._getFirstNode()

    if(firstNode && firstNode.type === "yaml") {
      this.data = this._getFirstNode().yaml
    }

    this.data.type = this.data.type || "document"

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

  _getFirstNode() {
    return this.ast && this.ast.children && this.ast.children[0] 
  }
}

function readPath(path) {
  return fs.readFileSync(path).toString()
}
