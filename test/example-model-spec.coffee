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

  it "tells me if any sections are present", ->
    epic.actualSectionHeadings().should.containEql 'Features'
    epic.actualSectionHeadings().length.should.eql(1)

  it "tells me the expected section headings", ->
    headings = epic.expectedSectionHeadings()
    headings.should.containEql('Features','User Stories','Stories')

  it "returns the nodes which have been defined as sections", ->
    epic.definedSectionNodes().length.should.eql(1)

