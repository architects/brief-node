import path from 'path'
import Case from "./case"
import Model from "./model"
import Document from "./document"
import ModelDefinition from "./document"

let brief = {
  Case: Case,
  Model: Model,
  ModelDefinition: ModelDefinition,
  load: function (root, options={}) {
    return Case.load(root, options)
  },
  example: function(options={}){
    return require("../test/example")()
  }
}

export default brief
