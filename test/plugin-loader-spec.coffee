brief = require("..")
sample = require("./sample-plugin")

describe 'Loading a plugin', ->
  it "should load the sample plugin", ->
    bc = briefcase.use(sample)
    brief.samplePluginLoaded.should.eql(1)
    bc.samplePluginLoaded.should.eql(2)
