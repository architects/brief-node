import path from 'path'
import fs from 'fs'
import Briefcase from "./briefcase"
import Asset from './asset'
import DataSource from './data_source'
import Model from "./model"
import Document from "./document"
import ModelDefinition from "./model_definition"
import {model, registry} from './model_registry'
import Generator from './generator'
import {markdown} from './render'
import {mixin} from './util'

const plugins = []
const pluginNames = {}

const pkg = path.join(__dirname, '../package.json')
const manifest = JSON.parse(fs.readFileSync(pkg))

let brief = {
  VERSION: manifest.version,
  plugins: plugins,
  Briefcase: Briefcase,
  Model: Model,
   
  ModelDefinition: ModelDefinition,

  // TODO
  // Think of a better API for this.
  registry: registry,
  model: model,

  resolveLink: function(pathAlias){
    if(!brief.linkResolver){
      return pathAlias
    }
    return brief.linkResolver(pathAlias)
  },
  resolveLinksWith: function(fn){
    brief.linkResolver = fn
  },
  instances: function(){
    return Briefcase.instances()
  },
  findBriefcaseByPath: function(path){
    return Briefcase.findForPath(path)
  },
  atPath: function(root, options={}){
    return Briefcase.load(root, options)
  },
  load: function (root, options={}) {
    return Briefcase.load(root, options)
  },
  example: function(options={}){
    return require("../test/example")()
  },
  generate: function(root, options={}){
    return new Generator({
      brief,
      root
    }).run()
  },
  fromPath: function(pathname, options){
    if(fs.existsSync(pathname + './package.json')){
      console.log("Loading briefcase from the package.json manifest at", pathname)

      return brief.fromManifest(pathname + './package.json', options)
    }
    return brief.load(pathname, options)
  },
  fromManifest: function(briefcaseManifestPath, options){
    let usesPlugins = []
    let parsed = {}
    
    if(fs.existsSync(briefcaseManifestPath)){
      parsed = JSON.parse(fs.readFileSync(briefcaseManifestPath).toString())
      if(parsed.brief && parsed.brief.plugins){
        usesPlugins = usesPlugins.concat(parsed.brief.plugins)  
      }
    }

    usesPlugins.forEach(pluginName => {
      brief = brief.use(require('brief-plugins-' + pluginName))
    })

    return brief.load(path.dirname(briefcaseManifestPath), options)
  },
  pluginNames: function(){
    return Object.keys(pluginNames)
  },
  markdown: markdown,
  util: require('./util'),
  mixin: function(extension, options={}){
    if(typeof(options)==='string'){
      options = {target: options}
    }

    let {target} = options
    
    if(target === 'model'){ mixin(Model, extension) }
    if(target === 'briefcase'){ mixin(Briefcase, extension) }
    if(target === 'document'){ mixin(Document, extension) }
    if(target === 'asset'){ mixin(Asset, extension) }
    if(target === 'data'){ mixin(DataSource, extension) }
  },
  use: function(plugin, options){
    var brief = this
    var modifier = plugin(brief, options)
    modifier.version = plugin.version
    modifier.plugin_name = plugin.plugin_name
    
    if(!pluginNames[plugin.plugin_name]){
      plugins.push(modifier)
    }

    pluginNames[plugin.plugin_name] = true

    return brief
  }
}

if(!Object.values){
  Object.values = function(obj){
    return Object.keys(obj).map(function(key){ return obj[key] })
  }
}

export default brief
