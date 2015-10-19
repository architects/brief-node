import fs from 'fs'
import path from 'path'
import {createDelegators} from './util'

export default class Generator {
  constructor(options = {}){
    createDelegators(this, options) 
  }

  documentFolderNames(){

  }
}
