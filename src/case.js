import glob from 'glob-all'
import path from 'path'
import Model from './model'
import ModelDefinition from './model_definition'
import inflections from 'i'
import _ from 'underscore'

const inflect = inflections(true)

export default class Case {
  static load(root, options={}) {
    return new Case(root,options)
  }
  
  toString(){
    return this.root
  }
  
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
    this.root = path.resolve(root)
    this.options = options || {}

    this.index = {}
    this.model_definitions = {}
    
    this.config = {
      docs_path: options.docs_path || (this.root + '/docs'),
      models_path: options.models_path || path.join(this.root, 'models'),
      assets_path: options.assets_path || path.join(this.root, 'assets')
    }
    
    this._loadModelDefinitions()
    this._buildIndex()
    this._createCollections()
  }
  
  /**
   * get model at the given relative path 
   * 
   * @example
   *  briefcase.at('epics/model-definition-dsl')
  */
  at (path_alias) {
    if(!path_alias.match(/\.md$/i)){
      path_alias = path_alias + '.md' 
    }

    return this.index[path_alias]
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
    return _(this.index).values()
  }
  
  /**
   * returns the raw documents in this briefcase
  */
  getAllDocuments () {
    return this.getAllModels(model => model.document)
  }
  
  getGroupNames () {
    let pluralize = inflect.pluralize
    let types = this.getDocumentTypes()
    
    return types.map(type => pluralize(type || ""))
  }

  getDocumentTypes () {
    let types = []

    this.getAllDocuments().forEach((doc)=>{
      types.push(doc.data.type)
    })

    return _(types).uniq()
  }

  loadModel (definition) {
    this.model_definitions[definition.name] = definition
    return definition
  }

  loadedModelDefinitions () {
    return Object.keys(this.model_definitions)
  }

  getModelDefinitions () { 
    return ModelDefinition.getAll()
  }

  getModelDefinition (modelName) {
    return this.model_definitions[modelName]
  }

  getModelSchema () {
    return ModelDefinition.getModelSchema()
  }
  
  getModelDefinition (modelIdentifier) {
    let schema = ModelDefinition.getModelSchema()
    return schema[modelIdentifier]
  }

  _createCollections() {
    let groups = this.getGroupNames()
    groups.forEach(group => this[group] = _(this.selectModelsByGroup(group)))
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

  _buildIndex() {
    let paths = this._getDocumentPaths()
    let briefcase = this

    paths.forEach((path)=>{
      let path_alias = path.replace(this.config.docs_path + '/', '')
      this.index[path_alias] = Model.create(path, {id: path_alias.replace(/\.md$/i,''), parent: this})
    })
  }

}
