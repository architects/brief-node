import fs from 'fs'
import path from 'path'

import {
  createDelegators,
  flatten
} from './util'

export default class Generator {
  constructor(options = {}){
    createDelegators(this, options) 
  }
  
  run(){
    this.documentFolderNames().forEach(baseName => {
      let modelFolderPath = path.join(this.root, 'docs', baseName)
      console.log("Creating " + baseName + " Folder", modelFolderPath)
      try {
        fs.mkdirpSync(modelFolderPath)
      } catch (e) {
        console.log("Error: " + e.message)
      }
    })

    return this;
  }

  documentFolderNames(){
    return flatten(this.brief.plugins.map(plugin => {
      let list = []
      if(plugin.groupNames){
        list = plugin.groupNames
      }
      return list
    }))
  }
}
