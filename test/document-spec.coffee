describe "The Document", ->
  epic = briefcase.at('epics/model-definition-dsl')
  document = epic.document.rendered()

  it "Loads content from the path", ->
    length = document.content.length
    length.should.be.above(10)

  it "extracts data from the frontmatter", ->
    document.data.title.should.equal('Model Definition DSL')
    document.data.should.have.property('type')
    document.data.should.have.property('title')

  it "renders the document in HTML", ->
    document.html.length.should.be.above(10)

  it "wraps the document in a wrapper div", ->
    document.html.should.match(/\<div/)
    document.html.should.match(/wrapper/)

  it "stores a reference to the markdown ast", ->
    document.should.have.property('ast')
    document.ast.should.have.property('type')
    document.ast.should.have.property('children')

  it "attaches special attributes to the headings", ->
    document.visit 'heading', (node)->
      node.attributes.should.have.property('data-line-number')

  it "has an css selecting interface", ->
    document.$('h1').length.should.equal(1)
    document.$('h2').length.should.equal(1)
    document.$('h3').length.should.equal(3)
