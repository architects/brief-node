var path = require('path'),
    glob = require('glob-all'),
    manifest = require('./package.json'),
    modelsDir = path.join(__dirname,'lib','models'),
    modelFiles = glob.sync(modelFiles + '/**/*.js'),
    humanName = manifest.name.replace(/brief-plugins-/,'')

function plugin(brief, pluginOptions){
  pluginOptions = pluginOptions || {}

  return function modifier(briefcase, options){
    modelFiles.forEach(function(file){
      try {
        briefcase.loadModelDefinition(file)
      } catch (e) {
        console.log("Error loading brief plugin: " + humanName, e.message)
      }
    })
  }
}

plugin.plugin_name = humanName
plugin.model_files = modelFiles
plugin.description = manifest.description

module.exports = plugin
