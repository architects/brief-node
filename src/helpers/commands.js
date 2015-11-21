export default {
  decorate: function(briefcase, registry){
    let commandsInterface = {
      get available(){
        return Object.keys(registry)
      },

      run(commandName, params){
        return registry[commandName].call(briefcase, params)
      },

      fromPath(file, options={}){
        let loaded = require(file)
        let viewName = loaded.label || path.basename(file).replace(/.js/,'')
        registry[viewName] = loaded
      }
    }

    Object.assign(briefcase, {
      get commands(){
        return commandsInterface
      }
    })
  }
}
