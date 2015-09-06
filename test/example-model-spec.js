var brief  = require("../index"),
    briefcase = brief.example()

describe("An Example Model Instance", function(){
  var epic = briefcase.at('epics/model-definition-dsl'),
      document = briefcase.at('epics/model-definition-dsl').document

  it("parses the YAML frontmatter data",function(){
    epic.data.title.should.equal('Model Definition DSL')
  })

  it("has a group name",function(){
    epic.groupName.should.equal('epics')
  })

  it("has an id", function(){
    epic.id.should.equal('epics/model-definition-dsl')
  })
})
