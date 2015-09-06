var assert = require("assert"),
    brief  = require("../index"),
    briefcase = brief.example()

describe("An Example Model Instance", function(){
  var epic = briefcase.at('epics/model-definition-dsl'),
      document = briefcase.at('epics/model-definition-dsl').document

  it("parses the YAML frontmatter data",function(){
    assert.equal(epic.data.title,'Model Definition DSL')
  })

  it("has a group name",function(){
    assert.equal(epic.groupName, 'epics')
  })
})
