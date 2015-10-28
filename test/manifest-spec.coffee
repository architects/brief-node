describe "Briefcase Manifest Files", ->
  it "should have a manifest", ->
    briefcase.manifest.should.have.property('version')

  it "should provide easy access to any config in the manifest", ->
    briefcase.manifestConfig.should.have.property('brief')

