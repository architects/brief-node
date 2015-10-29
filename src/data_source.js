import fs from 'fs'
import _ from 'underscore'
import path from 'path'
import glob from 'glob-all'
import yaml from 'js-yaml'

import brief from './index'
import {clone, flatten, singularize, strip} from './util'


export default class DataSource {
  /**
   * creates a new instance of the data source at path
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
    if(this.type === 'json'){   
      return JSON.parse(this.content)
    }

    if(this.type === 'yaml' || this.type === 'yml'){
      return yaml.safeLoad(this.content, 'utf8')
    }

    if(this.type === 'csv'){
      throw('CSV Is not implemented yet')  
    }

    return JSON.parse(this.content)
  }

  static repo(briefcase, options={}){
    if(!options.extensions){
      options.extensions = briefcase.config.data_extensions
    }
    
    let {extensions} = options

    extensions = extensions || 'csv,json,yml,yaml'

    return attach(briefcase.config.data_path, {extensions})
  }
}

function normalize(path, root){
  return path.replace(root + '/', '').replace(/.\w+$/,'')
}

export function attach(root, options={}){
  let extensions = options.extensions.split(',').map(ext => strip(ext).toLowerCase())
  let files = flatten(extensions.map(ext => glob.sync(path.join(root,'**/*.' + ext))))
  let wrapper = _(files.map(file => new DataSource(file, normalize(file,root)))) 
   
  wrapper.at = function(pathAlias){
    return wrapper.find(data_source => pathAlias.toLowerCase() === data_source.id) 
  } 

  return wrapper
}
