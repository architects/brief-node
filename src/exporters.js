import fs from 'fs'
import path from 'path'
import os from 'os'

function cached(briefcase, format, options={}){
  let cachedPath = path.join(os.tmpdir(), briefcase.cacheKey)

  if(fs.existsSync(cachedPath)){
    return JSON.parse(fs.readFileSync(cachedPath))
  }

  let fn = formatters[format] || formatters.standard 
  let data = fn(briefcase, options)
  
  fs.writeFile(cachedPath, JSON.stringify(data))

  return data
}

function standard(briefcase, options={}){
  let index = {}

  Object.keys(briefcase.index).forEach(key => {
    let model = briefcase.index[key]

    index[key] = model.forExport({
      includeDocument: true
    })
  })

  return {
    cacheKey: briefcase.cacheKey,
    groupNames: briefcase.getGroupNames(),
    documentTypes: briefcase.getDocumentTypes(),
    pluginNames: briefcase.pluginNames,
    index: index,
    config: briefcase.config,
    manifest: briefcase.manifest || {}
  }
}

let formatters = {
  standard
}

export default {
  formatters,
  cached
}
