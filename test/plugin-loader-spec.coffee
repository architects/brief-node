brief = require("..")
sample = require("./sample-plugin")

describe 'Loading a plugin', ->
  it "should load the plugin", ->
    brief.use(sample)
    brief.plugins.length.should.eql(1)
    brief.samplePluginLoaded.should.eql(1)

  it "should load the sample plugin directly on a briefcase", ->
    briefcase.use(sample)
    briefcase.samplePluginLoaded.should.eql(2)
