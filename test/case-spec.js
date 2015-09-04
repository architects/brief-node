var briefcase = utils.briefcase(),
    empty = utils.empty,
    index = _.indexOf

describe("The Briefcase", function(){
  it("builds an index of the documents", function(){
    assert(!empty(briefcase.index))
  })

  it("provides access to documents by their relative path", function(){
    var epic = briefcase.at("epics/model-definition-dsl")
    assert(epic)
  })

  it("creates collections for the diferent groups", function(){
    var titles = briefcase.epics.pluck('title')
    assert(titles.length == 1)
    assert.notEqual(_(titles).indexOf('Model Definition DSL'), -1)
  })

  it("provides access to all of the group names", function(){
    var types = briefcase.getGroupNames()

    assert.notEqual(index(types,'epics'), -1)
    assert.notEqual(index(types,'projects'), -1)
    assert.equal(index(types,'randoms'), -1)
  })

  it("provides access to all of the documents", function(){
    assert(!empty(briefcase.getAllDocuments()))  
  })

  it("provides access to all of the models", function(){
    assert(!empty(briefcase.getAllModels()))  
  })
})
