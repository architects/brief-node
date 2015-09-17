import fs from 'fs'
import cheerio from 'cheerio'
import _ from 'underscore'
import visit from 'unist-util-visit'
import path from 'path'

import Model from './model'
import Presenter from "./presenter"
import {process, parse} from './render'
import {clone, singularize} from './util'

export default class Document {
  toString() {
    return this.path
  }
  
  /**
   * creates a new instance of the document at path
   * @param {path} path - the absolute path to the markdown document.
  */
  constructor(pathname, options) {
    this.options = options || {}
    this.path = pathname
    this.dirname = path.dirname(this.path)

    if(this.options.type){
      this.type = this.options.type
    }

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
    return this.html ? this.html : render(this) 
  }

  getType(){
    if(this.data && this.data.type){
      return this.data.type
    }

    return singularize(path.basename(this.dirname))
  }
  
  /** 
  * apply a presenter to the document. useful for debugging
  * purposes.
  */
  present (method, options={}) {
    let presenter = Presenter.present(this, options)
    return presenter[method]()
  }
  
  /**
  * visit every node of the parsed ast
  */
  visit(type, iterator) {
    visit(this.ast, type, iterator)
  }

  getAST () {
    return this.ast
  }

  reload(){
    delete(this.articles)
    delete(this.sections)
    delete(this.data)
    delete(this.content)

    process(this)
  }
  
  getSectionHeadings(){
    return this.getSectionNodes().map(section => section.heading)
  }

  getArticleHeadings(){
    return this.getArticleNodes().map(article => article.heading)
  }

  getTopSection() {
    return this.getSectionNodes().find(node => node.top)
  }

  getSectionNodes() {
    if(this.sections){ return this.sections }

    this.sections = []
    this.visit('section', node => this.sections.push(node))
    return this.sections = this.sections.reverse()
  }

  getArticleNodes() {
    if(this.articles){ return this.articles }

    this.articles = []
    this.visit('article', node => this.articles.push(node))
    return this.articles = this.articles.reverse()
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
