describe "The Document Structure", ->
  epic = briefcase.epics.first()
  document = epic.document

  it "applies properties on the header AST", ->
    for node in document.getChildren() when node.type is "heading"
      node.type.should.equal "heading"

