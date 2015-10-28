_ = require('underscore')

exportData = undefined
exported = -> exportData ||= briefcase.toJSON()

describe "Exporting and Bundling", ->
  it "should export the briefcase as a single object", ->
    exported().should.have.property('index')
    exported().should.have.property('manifest')
    exported().should.have.property('groupNames')

  it "should include and render the document by default", ->
    exportedModel = exported().index['projects/brief.md']
    exportedModel.document.should.have.property('rendered')
    exportedModel.document.should.have.property('content')
