describe "The Document Structure", ->
  epic = briefcase.epics.first()
  document = epic.document

  it "filters the section nodes", ->
    sections = document.getSectionNodes()
    sections.length.should.equal(2)

  it "filters the article nodes", ->
    articles = document.getArticleNodes()
    articles.length.should.equal(3)

  it "finds the top node", ->
    top = document.getTopSection()
    top.top.should.equal(true)

  it "applies properties on the header AST", ->
    for node in document.getChildren() when node.type is "heading"
      node.type.should.equal "heading"
