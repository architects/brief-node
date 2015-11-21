import path from 'path'
import fs from 'fs'

export default {
  decorate: function(briefcase, registry){
    let viewsInterface = {
      get available(){
        return Object.keys(registry)
      },

      define(viewName, fn){
        registry[viewName] = fn
      },

      fromPath(file, options={}){
        let loaded = require(file)
        let viewName = loaded.label || path.basename(file).replace(/.js/,'')
        registry[viewName] = loaded
      },

      render(viewName, params, document, briefcase){
        if(!registry[viewName]){
          return 'error: missing ' + viewName
        }

        return registry[viewName].call(briefcase, params, document, briefcase)
      }
    }

    Object.assign(briefcase, {
      get views(){
        return viewsInterface
      }
    })
  }
}
