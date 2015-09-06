var brief  = require("../index"),
    briefcase = brief.example()

describe("The Document", function(){
  var epic = briefcase.at('epics/model-definition-dsl'),
      document = epic.document.rendered()

  it("Loads content from the path", function(){
    length = document.content.length
    length.should.be.above(10)
  })

  it("renders the document in HTML", function(){
    document.html.length.should.be.above(10)
  })

  it("has an css selecting interface", function(){
    document.$('h1').length.should.equal(1)
    document.$('h2').length.should.equal(4)
  })
})
