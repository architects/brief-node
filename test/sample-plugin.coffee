plugin = (brief, options={})->
  brief.samplePluginLoaded = 1

  return (briefcase, options={})->
    briefcase.samplePluginLoaded = 2

plugin.plugin_name = "blueprint"
plugin.version = "1.0.0"

module.exports = plugin
