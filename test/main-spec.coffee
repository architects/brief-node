describe "Brief", ->
  it "should have a version", ->
    brief.VERSION.should.not.equal(undefined)

  it "should be able to tell me the plugin names", ->
    brief.pluginNames().should.have.property('length')
