import glob from 'glob-all'
import path from 'path'
import Model from './model'

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
  }
  
  at(path_alias) {
    if(!path_alias.match(/\.md$/i)){
      path_alias = path_alias + '.md' 
    }

    return this.index[path_alias]
  }

  buildIndex(){
    let paths = this.getDocumentPaths()

    paths.forEach((path)=>{
      let path_alias = path.replace(this.config.docs_path + '/', '')
      this.index[path_alias] = Model.create(path, {relative_path: path_alias, parent: this})
    })
  }

  getDocumentPaths(){
    let docs_path = path.resolve(this.config.docs_path)
    return glob.sync(path.join(docs_path,'**/*.md'))
  }
}
