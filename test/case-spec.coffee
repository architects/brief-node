describe "The Briefcase", ->
  epic = briefcase.at "epics/model-definition-dsl"

  it "provides access to documents by their relative path", ->
    briefcase.at('epics/model-definition-dsl').should.have.property('document')

  it "creates collections for the diferent groups", ->
    titles = briefcase.epics.pluck('title')
    titles.length.should.be.above(0)
    titles.should.containEql('Model Definition DSL')

  it "provides access to all of the group names", ->
    types = briefcase.getGroupNames()
    types.should.containEql('epics')
    types.should.containEql('projects')

  it "provides access to all of the documents", ->
    briefcase.getAllDocuments().length.should.be.above(0)

  it "provides access to all of the models", ->
    briefcase.getAllModels().length.should.be.above(0)
