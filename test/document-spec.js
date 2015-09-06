var brief  = require("../index"),
    briefcase = brief.example()

describe("The Document", function(){
  var epic = briefcase.at('epics/model-definition-dsl'),
      document = epic.document.rendered()

  it("Loads content from the path", function(){
    length = document.content.length
    length.should.be.above(10)
  })
  
  it("extracts data from the frontmatter",function(){
    document.data.title.should.equal('Model Definition DSL')
    document.data.should.have.property('type')
    document.data.should.have.property('title')
  })

  it("renders the document in HTML", function(){
    document.html.length.should.be.above(10)
  })

  it("wraps the document in a wrapper div", function(){
    document.html.should.match(/\<div/)
    document.html.should.match(/wrapper/)
  })

  it("stores a reference to the documents path alias", function(){
    document.html.should.match(/\<div/)
    document.html.should.match(/wrapper/)
  })
  
  it("stores a reference to the markdown ast", function(){
    document.should.have.property('ast')
    document.ast.should.have.property('type')
    document.ast.should.have.property('children')
  })

  it("attaches special attributes to the headings", function(){
    document.html.should.match(/data-start/)
  })

  it("has an css selecting interface", function(){
    document.$('h1').length.should.equal(1)
    document.$('h2').length.should.equal(1)
    document.$('h3').length.should.equal(3)
  })
})
