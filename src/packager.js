import Zip from 'adm-zip'
import fs from 'fs'
import glob from 'glob-all'
import path from 'path'

export default class Packager {
  constructor(briefcase, ignoreList=[]) {
    this.briefcase = briefcase
    this.ignoreList = ignoreList
  }
  
  archive() {
    let zip = new Zip()
    
    briefcase.getAllFiles().forEach(file => {
      let relative_path = file.replace(briefcase.root + '/')

      if(!this.ignoreList.indexOf(relative_path) >= 0){
        try {
          let buffer = fs.readFileSync(path.join(briefcase.root, relative_path))
          zip.addFile(relative_path, buffer)
        } catch(error) {

        }
      }
    })

    return zip
  }

  /**
  * package up the briefcase as a zipfile
  * 
  * @param {string} path - where to persist the package
  */
  persist (path){
    let zip = this.archive()

    zip.writeZip(path)
  }
}
