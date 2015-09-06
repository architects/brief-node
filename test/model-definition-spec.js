var brief  = require("../index"),
    briefcase = brief.example()

describe("Model Definitions", function(){
  var definition = briefcase.getModelDefinition('Epic')

  it("should load the model definitions", function(){
    briefcase.loadedModelDefinitions().should.containEql("Epic")
  })

  it("should load by aliases as well", function(){
    briefcase.getModelDefinition('epic').should.have.property('actions')
  })

  it("should return a definition for our model", function(){
    definition.name.should.equal('Epic')
  })
  
  it("should have certain configuration sections", function(){
    definition.should.have.property('attributes')
    definition.should.have.property('sections')
    definition.should.have.property('actions')
  })

  it("should define some actions", function(){
    definition.actions.should.have.property('publish')
  })

  it("should define some sections", function(){
    definition.sections.should.have.property('Features')
  })

  it("should define some attributes", function(){
    definition.attributeNames().should.containEql('title','status','project')
  })

  it("should be findable by an alias", function(){

  })

  it("should create a model prototype", function(){

  })

})
