describe "Asset Repositories", ->
  it "should create a collection", ->
    briefcase.collections.should.have.property('assets')

  it "should let me resolve an asset by its id", ->
    briefcase.collections.assets.at('folder/system-architecture').should.have.property('id')

  it "should give me the assets content", ->
    briefcase.collections.assets.at('folder/system-architecture').content.length.should.not.equal(0)

