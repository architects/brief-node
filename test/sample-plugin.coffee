plugin = (brief, options={})->
  brief.samplePluginLoaded = 1

  return (briefcase, options={})->
    briefcase.samplePluginLoaded = 2

module.exports = plugin
