export default {
  decorate: function(briefcase, registry){
    let queriesInterface = {
      get available(){
        return Object.keys(registry)
      },

      define(queryName, fn){
        registry[queryName] = fn
      },

      fromPath(file, options={}){
        let loaded = require(file)
        let viewName = loaded.label || path.basename(file).replace(/.js/,'')
        registry[viewName] = loaded
      },

      run(queryName, params){
        return registry[queryName].call(briefcase, params)
      }
    }

    Object.assign(briefcase, {
      get queries(){
        return queriesInterface
      }
    })
  }
}
