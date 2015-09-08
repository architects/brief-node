describe "An Example Model Instance", ->
  epic = briefcase.at('epics/model-definition-dsl')
  document = briefcase.at('epics/model-definition-dsl').document

  it "parses the YAML frontmatter data", ->
    epic.data.title.should.equal('Model Definition DSL')

  it "has a group name", ->
    epic.groupName.should.equal('epics')

  it "has an id", ->
    epic.id.should.equal('epics/model-definition-dsl')
