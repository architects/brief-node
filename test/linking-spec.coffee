describe "Document Linking", ->
  epic = briefcase.at('epics/model-definition-dsl')
  document = epic.document

  it "should dynamically inject a title", ->
    document.render().should.not.match(/link:title/)

  it "should inject a link", ->
    document.render().should.match(/blueprint.io/)
