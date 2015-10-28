describe "An Example Model Instance", ->
  epic = briefcase.at('epics/model-definition-dsl')
  document = briefcase.at('epics/model-definition-dsl').document

  it "parses the YAML frontmatter data", ->
    epic.data.title.should.equal('Model Definition DSL')

  it "has a group name", ->
    epic.groupName.should.equal('epics')

  it "has an id", ->
    epic.id.should.equal('epics/model-definition-dsl')

  it "lets me export to JSON", ->
    json = epic.toJSON()
    json.data.title.should.equal('Model Definition DSL')

  it "tells me the expected section headings", ->
    epic.expectedSectionHeadings.should.containEql('Features','User Stories','Stories')

  it "returns the nodes which have been defined as sections", ->
    epic.definedSectionNodes.length.should.eql(1)

  it "lets me read a value even if it is a function", ->
    epic.read('title').should.equal('Model Definition DSL')
    epic.read('getBriefcase').should.not.equal(undefined)
