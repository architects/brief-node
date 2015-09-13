describe "Model Collections", ->
  it "creates dynamic find by methods", ->
    epic = briefcase.epics.findByTitle('Model Definition DSL')
    epic.id.should.eql('epics/model-definition-dsl')
