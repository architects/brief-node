import fs from 'fs'
import cheerio from 'cheerio'
import _ from 'underscore'
import visit from 'unist-util-visit'
import path from 'path'

import brief from './index'
import Model from './model'
import Presenter from "./presenter"
import {process, parse, readPath} from './pipelines'
import {clone, slugify, singularize} from './util'

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
    this.id = options.id

    if(this.options.type){
      this.type = this.options.type
    }

    this.renderLog = []
    
    this.loadContent({path: this.path})
    process(this, this.getBriefcase())
  }
  
  get slug(){
    return slugify(this.options.id || this.id)
  }

  loadContent(options = {}){
    if(options.path){ this.content = readPath(options.path) }
    if(options.content){ this.content = options.content }
    if(options.reload){ this.reload() }
  }
  
  log(...messages){
    this.renderLog.push(messages)
  }

  viewLog(){
    this.renderLog.forEach(console.log.bind(console))
  }

  resolveLink(pathAlias){
    return this.getBriefcase().resolveLink(pathAlias)
  }

  /**
  * return a reference to the briefcase this document belongs to.
  */
  getBriefcase(){
    if(this.briefcase) { return this.briefcase }
    return this.briefcase = brief.findBriefcaseByPath(this.path)
  }
  /**
   * get a model to represent this document and the data we parse from it.
   *
   * @return {Model} - a model instance 
  */
  toModel (options={}) {
    return Model.fromDocument(this, options)
  }
  
  writeSync(newContent){
    newContent = newContent || this.content
    fs.writeFileSync(this.path, newContent)

    this.loadContent({
      path: this.path,
      reload: true
    })
  }

  lastModifiedAt(){
    return fs.lstatSync(this.path).mtime.valueOf()
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
    delete(this.codeBlocks)

    process(this, this.briefcase)
  }
  
  getCodeBlocks() {
    if(this.codeBlocks){ return this.codeBlocks }

    this.codeBlocks = []
    this.visit('code', node => this.codeBlocks.push(node))
    return this.codeBlocks
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
