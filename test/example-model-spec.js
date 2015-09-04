var briefcase = utils.briefcase()

describe("An Example Model Instance", function(){
  var epic = briefcase.at("epics/model-definition-dsl")

  it("parses the YAML frontmatter data",function(){
    assert.equal(epic.data.title,'Model Definition DSL')
  })

  it("has a group name",function(){
    assert.equal(epic.groupName, 'epics')
  })
})
