import path from 'path'
import Briefcase from "./briefcase"
import Model from "./model"
import Document from "./document"
import ModelDefinition from "./document"

let brief = {
  Briefcase: Briefcase,
  Model: Model,
  ModelDefinition: ModelDefinition,
  load: function (root, options={}) {
    return Briefcase.load(root, options)
  },
  example: function(options={}){
    return require("../test/example")()
  }
}

export default brief
