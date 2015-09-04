var briefcase = utils.briefcase(),
    empty = utils.empty

describe("The Briefcase", function(){
  it("builds an index of the documents", function(){
    assert(!empty(briefcase.index))
  })

  it("provides access to documents by their relative path", function(){
    var epic = briefcase.at("epics/model-definition-dsl")
    assert(epic)
  })
})

