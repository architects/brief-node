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
import visit from 'mdast-util-visit'
import inflect from 'i'

const processor = mdast.use([yaml,squeeze,normalize,structure,html])
const inflections = inflect()

export default class Document {
  toString() {
    return this.path
  }
  
  /**
   * creates a new instance of the document at path
   * @param {path} path - the absolute path to the markdown document.
  */
  constructor(path, options) {
    this.path = path
    this.options = options
    process(this)
  }
  
  /**
   * get a model to represent this document and the data we parse from it.
   *
   * @return {Model} - a model instance 
  */
   toModel (options={}) {
    return Model.fromDocument(this, options)
  }
  
  /**
   * returns a rendered document
   * @return {Document} - this document
  */
  rendered() {
    this.render()
    return this
  }
  
  /**
   * render the document.
   * @return {string} - Rendered HTML from the document markdown
  */
  render() {
    return this.html ? this.html : process(this) 
  }

  visit(type, iterator){
    visit(this.ast, type, iterator)
  }

  getAst () {
    return this.ast
  }

  getChildren () {
    return this.ast.children[0].children
  }

  runHook (identifier = "", ...args) {
    let hook = this.options[identifier] || this[identifier]

    if(typeof(hook) === "function"){
      hook.apply(this, args)
    }
  }
}

function parse (document) {
  let parsed = processor.parse(document.content),
      nodes  = parsed.children
  
  if(nodes[0] && nodes[0].yaml){
    document.data = nodes.splice(0,1)[0].yaml
  }
  
  let ast = processor.run(parsed)

  document.runHook("documentDidParse", ast)

  return ast 
}

function process (document) {
  document.content = readPath(document.path)

  document.ast = parse(document)
  document.runHook("documentWillRender", document.ast)

  applyWrapper(document.ast, document.id, (document.options.wrapperClass || "wrapper")) 

  document.html = stringify(document)
  document.$ = cheerio.load(document.html)
  document.runHook("documentDidRender", document.html)

  return document
}

function stringify (document, options={}) {
  return processor.stringify(document.ast, options)
}

function readPath(path) {
  return fs.readFileSync(path).toString()
}

function applyWrapper(ast, id, wrapperClass, attributes={}) {
  attributes.id = id
  attributes.class = wrapperClass

  ast.children = [{
    type: "div",
    attributes: attributes,
    children:   ast.children
  }]
  
  return ast
}
