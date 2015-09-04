var briefcase = utils.briefcase(),
    epic = briefcase.at('epics/model-definition-dsl'),
    document = epic.document,
    string = require("underscore.string")

describe("The Document", function(){
  it("Loads content from the path", function(){
    assert(document.content.length > 0)
  })

  it("renders the document in HTML", function(){
    var html = document.toRawHTML()
        matches = string.include(html, "<h1>") 
    
    assert(matches)
  })

  it("has an css selecting interface", function(){
    document.render()
    assert.equal(document.$('h1').length,1)
    assert.equal(document.$('h2').length,4)
  })
})
