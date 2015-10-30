import fs from 'fs'
import glob from 'glob-all'
import path from 'path'
import inflections from 'i'
import _ from 'underscore'

import brief from '..'
import Asset from './asset'
import DataSource from './data_source'
import Document from './document'
import Model from './model'
import ModelDefinition from './model_definition'
import Packager from './packager'
import Resolver from './Resolver'

import collection from './collection'
import exporters from './exporters'

const inflect = inflections(true)
const pluralize = inflect.pluralize

const __cache = {}
const __documentIndexes = {}
const __cacheKeys = {}

export default class Briefcase {
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
    __cache[this.root] = this

    this.root         = path.resolve(root)
    this.name         = options.name || path.basename(root)
    this.parentFolder = path.dirname(root)

    this.options = options || {}

    this.model_definitions = {}
    this.collections = {}
    
    this.config = {
      docs_path: path.join(this.root, 'docs'),
      models_path: path.join(this.root, 'models'),
      assets_path: path.join(this.root, 'assets'),
      data_path: path.join(this.root, 'data')
    }
    
    this.setup()
  }
  
  /** 
  * Return the outline for this briefcase if it exists.
  */
  get outline(){
    return this.at('outline.md')
  }

  get index(){
    if(__documentIndexes[this.root]){
      return __documentIndexes[this.root]
    }
    
    return __documentIndexes[this.root] = buildIndexFromDisk(this)
  }

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
  * Find the Briefcase instance responsible for a particular path.
  * Models and Documents will use this to find the Briefcase they
  * belong to 
  *
  * @param {path} path - the path of the document which wants to know
  */
  static findForPath(checkPath=""){
    let matchingPath = Object.keys(__cache).find(p => checkPath.match(p))
    return __cache[matchingPath]
  }
  
  /**
  * Return all instances of a Briefcase that we are aware of from the cache
  */
  static instances(){
    return Object.keys(__cache).map(path => __cache[path])
  }
  
  /**
  * Gets any config values that have been supplied via the `package.json`
  * in this Briefcase root.  Looks for a key called `brief`, as well as any
  * of the plugins that have been loaded.
  */
  get manifestConfig(){
    let base = {}
    let manifest = this.manifest 

    if (_.isEmpty(manifest)) { return {} }

    if(manifest.brief){ base.brief = manifest.brief }

    return this.pluginNames.reduce((memo,plugin)=>{
      if(manifest[plugin]){
        memo[plugin] = manifest[plugin]
      }

      return memo
    }, base)
  }
  
  /**
  * Gets a serialized version of the `package.json` that exists in this Briefcase root folder.
  */
  get manifest(){
    if(fs.existsSync(path.join(this.root, 'package.json'))){
      return JSON.parse(fs.readFileSync(path.join(this.root, 'package.json')))
    }
  }
  
  get resolver(){
    return Resolver.create(this)
  }

  resolveLink(pathAlias){
    return this.resolver.resolveLink(pathAlias)
  }

  resolveAssetPath(pathAlias){
    return this.resolver.resolveAssetPath(pathAlias)
  }

  get assets(){
    return this.collections.assets
  }

  get data(){
    return this.collections.data
  }

  /**
  * Turn all of the documents, models, data, assets, and other metadata about this briefcase
  * into a single JSON structure. Alias for the `exportWith` method.
  */
  toJSON(options={}){
    if(_.isString(options)){
      options = {format: options}
    }

    return this.exportWith(options.format || "standard", options)
  }

  exportWith(exporterFormat="standard", options = {}){
    return exporters.cached(this, exporterFormat, options)
  }
  
  get cacheKey(){
    if(__cacheKeys[this.root]){ return __cacheKeys[this.root] }
    return __cacheKeys[this.root] = this.computeCacheKey()
  }

  computeCacheKey(){
    let modifiedTimes = this.getAllModels().map(model => model.lastModifiedAt()).sort()
    let latest = modifiedTimes[modifiedTimes.length - 1]
    return [this.name, modifiedTimes.length, latest].join(':')
  }
  
  isStale(){
    return this.cacheKey !== this.computeCacheKey()
  }
  
  /**
  * setup this briefcase involves loading the model definitions
  * and creating repositories for any assets or data sources
  */ 
  setup(){
    this.pluginNames = []

    require('./index').plugins.forEach(modifier => {
      this.pluginNames.push(modifier.plugin_name || modifier.pluginName)
      modifier(this)
    })
    
    loadModelDefinitions(this)
    createAssetRepository(this) 
    createDataRepository(this) 
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
    return this.getAllModels().filter(iterator)
  }
  
  findModelsByDefinition(definition){
    let groupName = definition.groupName
    return this.filterAll(model => model.groupName === groupName)
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
  selectModelsByType(type) {
    return this.filterAllByProperty('type', type)
  }

  /**
   * selects all the models whose groupName matches the supplied arg 
  */
  selectModelsByGroup(groupName) {
    return this.filterAllByProperty('groupName', groupName)
  }
  
  /**
   * returns all the models in this briefcase
  */
  getAllModels() {
    return Object.keys(this.index).map(key => this.index[key])
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
    return Object.keys(this.model_definitions).map(name => inflect.pluralize(name.toLowerCase()))
  }

  getDocumentTypes () {
    return Object.keys(this.model_definitions).map(name => inflect.underscore(name.toLowerCase()))
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
 
 
  _getDocumentPaths() {
    let docs_path = path.resolve(this.config.docs_path)
    return glob.sync(path.join(docs_path,'**/*.md'))
  }

}

function buildIndexFromDisk(briefcase) {
  let paths = briefcase._getDocumentPaths()
  let index = {}

  paths.forEach((path)=>{
    let path_alias = path.replace(briefcase.config.docs_path + '/', '')
    let id = path_alias.replace('.md','')
    let document = new Document(path, {id: id})
    let model = document.toModel({id: id}) 
    
    document.id = path_alias
    document.relative_path = 'docs/' + path_alias
    model.id = id
    model.getParent = ()=>{ return briefcase }
    index[path_alias] = model
  })

  return index
}

function loadModelDefinitions(briefcase){
  ModelDefinition.loadDefinitionsFromPath(briefcase.config.models_path)
  ModelDefinition.loadDefinitionsFromPath(__dirname + '/models')

  ModelDefinition.getAll().forEach(function(definition){
    briefcase.loadModel(definition)
    createCollection(briefcase, definition)
  })

  ModelDefinition.finalize()
}

function createCollection(briefcase, modelDefinition){
  let {groupName, type_alias} = modelDefinition
  
  try {
    Object.defineProperty(briefcase, groupName, {
      get: function(){
        if(briefcase.collections[groupName]){
          return briefcase.collections[groupName]
        }

        return briefcase.collections[groupName] = collection(function(){
          return briefcase.selectModelsByType(type_alias)
        }, modelDefinition)
      }
    })

  } catch(e){

  }
}

function createAssetRepository(briefcase){
  Object.defineProperty(briefcase.collections, 'assets', {
    configurable: true,
    get: function(){
      delete(briefcase.collections.assets)
      return briefcase.collections.assets = Asset.repo(briefcase, briefcase.config.assets || {})
    }
  }) 
}

function createDataRepository(briefcase){
  Object.defineProperty(briefcase.collections, 'data', {
    configurable: true,
    get: function(){
      delete(briefcase.collections.data)
      return briefcase.collections.data = DataSource.repo(briefcase, briefcase.config.data || {})
    }
  }) 
}
