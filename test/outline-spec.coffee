describe "The Outline", ->
  outline = briefcase.outline

  it "should define an outline model", ->
    briefcase.getModelDefinition('outline').should.not.equal(undefined)

  it "should have an outline document", ->
    typeof(outline).should.not.equal('undefined')

  it "should define some extraction rules", ->
    briefcase.getModelDefinition("outline").extractionRules.length.should.not.equal(0)

