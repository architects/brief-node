describe "Document Linking", ->
  epic = briefcase.at('epics/model-definition-dsl')
  document = epic.document

  it "should dynamically inject a title", ->
    html = document.html
    html.should.not.match(/link:title/)
    html.should.match(/blueprint\.io.*Brief/)

  it "should inject a link", ->
    document.render().should.match(/blueprint.io\/projects\/brief/)
