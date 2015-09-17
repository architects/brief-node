import path from 'path'
import Briefcase from "./briefcase"
import Model from "./model"
import Document from "./document"
import ModelDefinition from "./document"

const plugins = []

let brief = {
  plugins: plugins,
  Briefcase: Briefcase,
  Model: Model,
  ModelDefinition: ModelDefinition,
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

    plugins.push(modifier)

    return this
  }
}

export default brief
