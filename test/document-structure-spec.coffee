describe "The Document Structure", ->
  epic = briefcase.epics.first()
  document = epic.document

  it "applies properties on the header AST", ->
    for node in document.ast.children[0].children when node.type is "heading"
      node.type.should.equal "heading"

