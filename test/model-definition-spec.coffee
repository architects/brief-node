describe "A Model Definition", ->
  definition = briefcase.getModelDefinition('Epic')

  it "should load the model definitions", ->
    briefcase.loadedModelDefinitions().should.containEql("Epic")

  it "should load by aliases as well", ->
    briefcase.getModelDefinition('epic').should.have.property('actions')

  it "should know its group name", ->
    briefcase.getModelDefinition('epic').should.have.property('groupName')
    briefcase.getModelDefinition('epic').groupName.should.match('epics')

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

describe "Accesing models", ->
  it "should be able to find the model instances created against it", ->
    definition = briefcase.getModelDefinition('epic')
    results = briefcase.findModelsByDefinition(definition)
    results[0].document.should.not.equal(undefined)
    results.length.should.equal(1)

describe "Model Definition Lookups", ->
  ModelDefinition = brief.ModelDefinition

  it "should look it up regardless of inflection", ->
    ModelDefinition.lookup('projects').name.should.equal('Project')
    ModelDefinition.lookup('project').name.should.equal('Project')
    ModelDefinition.lookup('epics').name.should.equal('Epic')
    ModelDefinition.lookup('epic').name.should.equal('Epic')

