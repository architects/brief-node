import inflect from 'i'
import fs from 'fs'

const inflections = inflect()

let registry = {
  models: {},
  aliases: {}
}

export default registry

export function definitions(finder){
  return finder ? model(finder) : Object.keys(registry.models).map(key => registry.models[key])
}

export function loadPath(path){
  let definition = ModelDefinition.load(path)
  
  if(definition && definition.type_alias){
    register(definition)
  }
}

export function model(nameOrTypeAlias, guess=true){
  let models = registry.models
  let alias = registry.aliases[nameOrTypeAlias]

  if(models[nameOrTypeAlias]){
    return models[nameOrTypeAlias]
  }
  
  if(alias){
    if(models[alias]) { return models[alias] }
  }

  if(!guess) { return }

  let result = model(inflections.singularize(nameOrTypeAlias).toLowerCase(), false)

  if(result) { return result }
}

export function register(definition){
  registry.models[definition.name] = definition
  registry.aliases[definition.type_alias] = definition.name
  return definition
}
