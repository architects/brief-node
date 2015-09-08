describe "Model Definitions", ->
  definition = briefcase.getModelDefinition('Epic')

  it "should load the model definitions", ->
    briefcase.loadedModelDefinitions().should.containEql("Epic")

  it "should load by aliases as well", ->
    briefcase.getModelDefinition('epic').should.have.property('actions')

  it "should return a definition for our model", ->
    definition.name.should.equal('Epic')

  it "should have certain configuration sections", ->
    definition.should.have.property('attributes')
    definition.should.have.property('sections')
    definition.should.have.property('actions')

  it "should define some actions", ->
    definition.actions.should.have.property('publish')

  it "should define some sections", ->
    definition.sections.should.have.property('Features')

  it "should define some attributes", ->
    definition.attributeNames().should.containEql('title','status','project')

  it "should be findable by an alias", ->

  it "should create a model prototype", ->
