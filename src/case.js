import glob from 'glob-all'
import path from 'path'
import Model from './model'
import inflections from 'i'
import _ from 'underscore'

const inflect = inflections(true)

export default class Case {
  static load(root, options={}){
    return new Case(root,options)
  }

  constructor(root, options){
    this.root = path.resolve(root)
    this.options = options || {}
    this.index = {}
    
    this.config = {
      docs_path: options.docs_path || (this.root + '/docs'),
      models_path: options.models_path || path.join(this.root, 'models'),
      templates_path: options.templates_path || path.join(this.root, 'templates'),
      assets_path: options.assets_path || path.join(this.root, 'assets')
    }

    this.buildIndex()
    this.createCollections()
  }
  
  at(path_alias) {
    if(!path_alias.match(/\.md$/i)){
      path_alias = path_alias + '.md' 
    }

    return this.index[path_alias]
  }
  
  selectModelsByType(type){
    return _(this.getAllModels()).select((model)=>{
      return model.type == type
    })
  }

  selectModelsByGroup(groupName){
    return _(this.getAllModels()).select((model)=>{
      return model.groupName == groupName
    })
  }


  createCollections(){
    let groups = this.getGroupNames()

    groups.forEach((group)=>{
      this[group] = _(this.selectModelsByGroup(group))
    })
  }

  buildIndex(){
    let paths = this.getDocumentPaths()
    let briefcase = this

    paths.forEach((path)=>{
      let path_alias = path.replace(this.config.docs_path + '/', '')
      this.index[path_alias] = Model.create(path, {relative_path: path_alias, parent: this})
    })
  }
  
  getAllModels(){
    return _(this.index).values()
  }

  getAllDocuments(){
    return _(this.getAllModels()).pluck('document')
  }
  
  getGroupNames(){
    let pluralize = inflect.pluralize
    let groupNames = []
    let types = this.getDocumentTypes()
    
    types.forEach((docType)=>{
      groupNames.push(pluralize(docType))  
    })

    return groupNames
  }

  getDocumentTypes(){
    let types = []

    this.getAllDocuments().forEach((doc)=>{
      types.push(doc.data.type)
    })

    return _(types).uniq()
  }

  getDocumentPaths(){
    let docs_path = path.resolve(this.config.docs_path)
    return glob.sync(path.join(docs_path,'**/*.md'))
  }
}
