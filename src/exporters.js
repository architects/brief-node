import fs from 'fs'
import path from 'path'
import os from 'os'

function cached(briefcase, format, options={}){
  let cachedPath = path.join(os.tmpdir(), briefcase.cacheKey + '.' + format + '.json')

  if(!options.fresh && fs.existsSync(cachedPath)){
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
      includeDocument: options.includeDocument !== false,
      renderDocument: options.renderDocument !== false
    })
  })

  return {
    name: briefcase.name,
    root: briefcase.root,
    options: briefcase.options,
    index: index,
    config: briefcase.config,
    manifest: briefcase.manifest || {},
    cacheKey: briefcase.cacheKey,
    groupNames: briefcase.getGroupNames(),
    documentTypes: briefcase.getDocumentTypes(),
    pluginNames: briefcase.pluginNames
  }
}

function expanded(briefcase, options){
  let base = standard(briefcase, options)
  
  base.assets = {}
  base.data = {}
  
  briefcase.assets.each(asset => base.assets[asset.id] = asset.content)
  briefcase.data.each(data_source => base.data[data_source.id] = data_source.data)

  return base
}

let formatters = {
  standard,
  expanded
}

export default {
  formatters,
  cached
}
