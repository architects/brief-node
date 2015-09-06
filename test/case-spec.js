var brief  = require("../index"),
    briefcase = brief.example()

describe("The Briefcase", function(){
  var epic = briefcase.at("epics/model-definition-dsl")

  it("builds an index of the documents", function(){
    Object.keys(briefcase.index).length.should.be.above(0)
  })

  it("provides access to documents by their relative path", function(){
    briefcase.at('epics/model-definition-dsl').should.have.property('document')
  })

  it("creates collections for the diferent groups", function(){
    var titles = briefcase.epics.pluck('title')

    titles.length.should.be.above(0)
    titles.should.containEql('Model Definition DSL')
  })

  it("provides access to all of the group names", function(){
    var types = briefcase.getGroupNames()

    types.should.containEql('epics')
    types.should.containEql('projects')
  })

  it("provides access to all of the documents", function(){
    briefcase.getAllDocuments().length.should.be.above(0)
  })

  it("provides access to all of the models", function(){
    briefcase.getAllModels().length.should.be.above(0)
  })
})
