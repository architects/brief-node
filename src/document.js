import fs from 'fs'
import mdast from 'mdast'
import yaml from 'mdast-yaml'
import html from 'mdast-html'
import Model from './model'
import Presenter from "./presenter"
import squeeze from 'mdast-squeeze-paragraphs'
import normalize from 'mdast-normalize-headings' 
import cheerio from 'cheerio'
import _ from 'underscore'
import visit from 'mdast-util-visit'
import inflections from 'underscore.string'


const processor = mdast.use([yaml,squeeze,normalize,html])

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
    this.options = options || {}
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

  present (method, options={}) {
    let presenter = Presenter.present(this, options)
    return presenter[method]()
  }

  visit(type, iterator) {
    visit(this.ast, type, iterator)
  }

  getAst () {
    return this.ast
  }

  getChildren () {
    return this.ast.children[0].children  
  }

  getHeadingNodes () {
    let results = []
    this.visit('heading', node => results.push(node))
    return results
  }
  
  /**
  * Given a css selector, return each of the elements
  *   wrapped with a cheerio object. 
  *
  * @param {string} selector - a css selector to match
  * @return - an underscore wrapped array of elements
  */
  elements (...args) {
    return _(this.$(...args).map((index,el)=>{
      return cheerio(el)
    }))
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
  
  nestElements(document)
  collapseSections(document)
  applyWrapper(document)

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

function nestElements (document) {
  let children = document.ast.children
  let headings = document.ast.children.filter(c => c.type === "heading")
	
	let index = 0
	let previous

	children.forEach(child => {
		let data = child.data 

		if(child.type === "heading"){
			delete(child.data)
      
      let text = child.children[0] && child.children[0].value

      data = data || {}
      data.htmlName = "section"
      data.htmlAttributes = data.htmlAttributes || {}

      if(child.depth >= 3){
        data.htmlName = "article"
      }

      if(text){
        data.htmlAttributes['data-heading'] = inflections.dasherize(text.toLowerCase())
      }

			previous = children[index] = {
				type: "div",
        depth: child.depth,
				headingIndex: child.headingIndex,
				container: true,
				data: data,
				children: [child]
			}
		} else if(previous) {
			previous.children.push(_.clone(child))
			child.markForRemoval = true
		}

		index = index + 1
	})
  
  document.ast.wrapped = true
	document.ast.children = children.filter(child => !child.markForRemoval)
}

function collapseSections (document){
  let children = document.ast.children
  let previous

  children.forEach(child => {
    let name = child.data.htmlName
    if(name === "section"){
      previous = child
    }

    if(previous && name === "article"){
      previous.children.push(_.clone(child))
      child.markForDelete = true
    }
  })

  document.ast.children = children.filter(child => !child.markForDelete)
}

function applyWrapper (document) {
  document.ast.children = [{ 
    type: "unknown",
    data:{
      htmlName: "main",
      htmlAttributes:{
        "class": "brief-document"
      }
    },
    children: document.ast.children
  }]
}
