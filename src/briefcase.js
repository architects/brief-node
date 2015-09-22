import glob from 'glob-all'
import path from 'path'
import Document from './document'
import collection from './collection'
import Model from './model'
import ModelDefinition from './model_definition'
import inflections from 'i'
import Packager from './packager'
import _ from 'underscore'


const inflect = inflections(true)
const pluralize = inflect.pluralize

export default class Briefcase {
  /**
  * Load a briefcase by passing a path to a root folder.
  *
  * @param {string} rootPath - the root path of the briefcase.
  * @return {Briefcase} - returns a briefcase
  *
  */
  static load(rootPath, options={}) {
    return new Briefcase(rootPath,options)
  }
 
  /**
  */

  /**
  * Create a new Briefcase object at the specified root path.
  *
  * @param {path} root - the root path of the briefcase. expects
  *   to find a config file "brief.config.js", and at least a 
  *   documents folder.
  *
  * @param {options} options - options to override default behavior.
  * @param {path} docs_path - which folder contains the documents.
  * @param {path} models_path - which folder contains the models to use.
  * @param {path} assets_path - which folder contains the assets to use if any.
  */
  constructor(root, options) {
    this.root         = path.resolve(root)
    this.name         = options.name || path.basename(root)
    this.parentFolder = path.dirname(root)

    this.options = options || {}
    
    this.index = {}
    this.model_definitions = {}
    
    this.config = {
      docs_path: path.join(this.root, 'docs'),
      models_path: path.join(this.root, 'models'),
      assets_path: path.join(this.root, 'assets')
    }
    
    this.setup()
  }
  
  setup(){
    require('./index').plugins.forEach(modifier => {
      modifier(this)
    })

    this._loadModelDefinitions()
    this._buildIndexFromDisk()
    this._createCollections()
  }
  
  /**
  * use a plugin to load modules, actions, CLI helpers, etc
  */
  use(plugin, options={}){
    brief.use(plugin)
    this.setup()
    return this
  }

  /**
   * get model at the given relative path 
   * 
   * @example
   *  briefcase.at('epics/model-definition-dsl')
  */
  at(path_alias, absolute=false) {
    let docs_path = path.resolve(this.config.docs_path)

    if(absolute){ path_alias = path_alias.replace(docs_path, '') }

    if(!path_alias.match(/\.md$/i)){
      path_alias = path_alias + '.md' 
    }

    return this.index[path_alias.replace(/^\//,'')]
  }

  findDocumentByPath(path){
    return this.atPath(path_alias, true)
  }
  /**
  * get models at each of the paths represented
  * by the glob pattern passed here.
  */
  glob(pattern="**/*.md") {
    let matchingFiles = glob.sync(path.join(this.root, pattern))
    return matchingFiles.map(path => this.at(path,true)) 
  }

  /**
   * filters all available models by the given iterator
   *
   * @example
   *  briefcase.filterAll(model => model.status === 'active')
  */
  filterAll (iterator) {
    return this.getAllModels(iterator)
  }
  
  /**
   * filters models by the property and desired value
   * 
   * @param {string} property - name of the property to filter on 
   * @param {any} desiredValue - the value to match against
   *
   * @return {array} - models whose property matches desiredValue 
  */
  filterAllByProperty (property, desiredValue) {
    return this.filterAll(model => model[property] === desiredValue)
  }
  
  /**
   * selects all the models whose type matches the supplied arg 
  */
  selectModelsByType (type) {
    return this.filterAllByProperty('type', type)
  }

  /**
   * selects all the models whose groupName matches the supplied arg 
  */
  selectModelsByGroup (groupName) {
    return this.filterAllByProperty('groupName', groupName)
  }
  
  /**
   * returns all the models in this briefcase
  */
  getAllModels() {
    return Object.values(this.index)
  }
  
  /**
   * returns the raw documents in this briefcase
  */
  getAllDocuments () {
    return this.getAllModels().map(model => model.document)
  }
  
  /**
  * Archives the briefcase into a zip file. Briefcases
  * can be created directly from zip files in the future.
  *
  * @param {string} location - where to store the file?
  * @param {array} ignore - a list of files to ignore and not put in the
  *   archive
  */
  archive(location, ignore=[]) {
    location = location || 
    ignore.push(location)

    new Packager(this, ignore).persist(location)
  }
  
  getGroupNames () {
    let types = this.getDocumentTypes()
    return types.map(type => pluralize(type || ""))
  }

  getDocumentTypes () {
    let types = []

    this.getAllDocuments().forEach((doc)=>{
      types.push(doc.getType())
    })

    return _(types).uniq()
  }
  
  loadModelDefinition(path){
    return this.loadModel(ModelDefinition.load(path))
  }

  loadModel (definition) {
    this.model_definitions[definition.name] = true
    return definition
  }

  loadedModelDefinitions () {
    return Object.keys(this.model_definitions)
  }

  getModelDefinitions () { 
    return ModelDefinition.getAll()
  }

  getModelDefinition (modelNameOrAlias) {
    return ModelDefinition.lookup(modelNameOrAlias)
  }

  getTypeAliases (){
    return ModelDefinition.getTypeAliases()
  }

  getModelSchema () {
    return ModelDefinition.getModelSchema()
  }

  getAllFiles(useAbsolutePaths=false){
    let allFiles = glob.sync(path.join(this.root, '**/*'))
    return useAbsolutePaths ? allFiles : allFiles.map(f => f.replace(this.root + '/', ''))
  }
 
  _createCollections() {
    const briefcase = this

    this.getDocumentTypes().forEach(type => {
      let group       = pluralize(type)
      let definition  = this.getModelDefinition(type)

      let fetch = ()=> {
        return this.selectModelsByGroup(group)
      }
      
      briefcase[group] = collection(fetch, definition) 
    })
  }
 
  _getDocumentPaths() {
    let docs_path = path.resolve(this.config.docs_path)
    return glob.sync(path.join(docs_path,'**/*.md'))
  }
  
  _getModelDefinitionFiles () {
    let models_path = path.resolve(this.config.models_path)
    return glob.sync(path.join(models_path,'**/*.js'))
  }
  
  _loadModelDefinitions(){
    this._getModelDefinitionFiles().forEach(file => ModelDefinition.load(file))
    ModelDefinition.getAll().forEach(definition => this.loadModel(definition))
  }

  _buildIndexFromDisk() {
    let paths = this._getDocumentPaths()
    let briefcase = this

    paths.forEach((path)=>{
      let path_alias = path.replace(this.config.docs_path + '/', '')
      let id = path_alias.replace('.md','')
      let document = new Document(path, {id: id})
      let model = document.toModel({id: id}) 
      
      
      document.id = path_alias
      document.relative_path = 'docs/' + path_alias
      model.id = id
      model.getParent = ()=>{ 
        return this
      }

      this.index[path_alias] = model
    })
  }

}
