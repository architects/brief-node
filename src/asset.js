import fs from 'fs'
import _ from 'underscore'
import path from 'path'
import glob from 'glob-all'

import brief from './index'
import {clone, flatten, singularize, strip} from './util'


export default class Asset {
  /**
   * creates a new instance of the asset at path
   * @param {path} path - the absolute path to data source.
   * @param {type} type - what type of data source is this 
  */
  constructor(pathname, id, options) {
    this.path = pathname
    this.id = id
    this.options = options || {}
    this.dirname = path.dirname(this.path)
    this.type = path.extname(this.path).toLowerCase().replace('.','')

    if(this.options.type){
      this.type = this.options.type
    }
  }
  
  get content(){
    return fs.readFileSync(this.path).toString()
  }
  
  get data(){
    return this.content
  }

  static repo(briefcase, options={}){
    if(!options.extensions){
      options.extensions = briefcase.config.asset_extensions
    }
    
    let {extensions} = options

    extensions = extensions || 'svg,png,jpg,gif,js,css,html' 

    return attach(briefcase.config.assets_path, {extensions})
  }
}

function normalize(path, root){
  return path.replace(root + '/', '').replace(/.\w+$/,'')
}

export function attach(root, options={}){
  let extensions = options.extensions.split(',').map(ext => strip(ext).toLowerCase())
  let files = flatten(extensions.map(ext => glob.sync(path.join(root,'**/*.' + ext))))
  let wrapper = _(files.map(file => new Asset(file, normalize(file,root)))) 
   
  wrapper.at = function(pathAlias){
    return wrapper.find(asset => pathAlias.toLowerCase() === asset.id) 
  } 

  return wrapper
}
