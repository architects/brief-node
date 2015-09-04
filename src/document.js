import fs from 'fs'
import mdast from 'mdast'
import yamlConfig from 'mdast-yaml'
import html from 'mdast-html'
import Model from './model'
import yaml from 'js-yaml'
import squeeze from 'mdast-squeeze-paragraphs'
import normalize from 'mdast-normalize-headings' 
import cheerio from 'cheerio'
import _ from 'underscore'

const yamlProcessor       = mdast.use(yamlConfig)
const htmlProcessor       = mdast.use([html,squeeze,normalize])

export default class Document {
  constructor(path, options){
    this.path = path
    this.options = options

    this.readContent()
    this.buildMetaData()
  }
  
  render(){
    return this.toRawHTML()
  }

  toModel(){
    return Model.create(this.path, this.options)
  }
 
  buildMetaData(){
    this.data = this.parseFrontMatter() || {}
  }

  structureRenderedContent(){

  }

  parseFrontMatter(){
    let data = this.toParsed()
    let children = data.children || []
    let el = children[0]

    if (el.type == "yaml" && el.value && el.value.length > 0){
      return yaml.load(el.value) 
    }
  }

  readContent(){
    this.content = fs.readFileSync(this.path).toString()
  }
  
  /* 
  * Renders the markdown to Raw HTML. 
  */
  toRawHTML(options={}){
    this.raw_html = htmlProcessor.process(this.content)
    this.$ = cheerio.load(this.raw_html)
    return this.raw_html
  }

  toParsed(){
    return yamlProcessor.parse(this.content)
  }
}
