import path from 'path'
import fs from 'fs'
import Briefcase from "./briefcase"
import Model from "./model"
import Document from "./document"
import ModelDefinition from "./model_definition"
import {model, registry} from './model_registry'

const plugins = []
const pluginNames = {}

const pkg = path.join(__dirname, '../package.json')
const manifest = JSON.parse(fs.readFileSync(pkg))

let brief = {
  VERSION: manifest.version,
  plugins: plugins,
  pluginNames: function(){
    return Object.keys(pluginNames)
  },
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

export default brief
