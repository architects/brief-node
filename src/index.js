import path from 'path'
import fs from 'fs'
import Briefcase from "./briefcase"
import Model from "./model"
import Document from "./document"
import ModelDefinition from "./model_definition"
import {model, registry} from './model_registry'
import Generator from './generator'
import {markdown} from './render'

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
  registry: registry,
  model: model,
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
      brief.use(require('brief-plugins-' + pluginName))
    })

    return brief.load(path.dirname(briefcaseManifestPath), options)
  },
  pluginNames: function(){
    return Object.keys(pluginNames)
  },
  markdown: markdown,
  use: function(plugin, options){
    var modifier = plugin(this, options)
    modifier.version = plugin.version
    modifier.plugin_name = plugin.plugin_name
    
    if(!pluginNames[plugin.plugin_name]){
      plugins.push(modifier)
    }

    pluginNames[plugin.plugin_name] = true

    return this
  }
}

if(!Object.values){
  Object.values = function(obj){
    return Object.keys(obj).map(function(key){ return obj[key] })
  }
}

export default brief
