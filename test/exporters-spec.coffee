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

  it "should include the data and assets in the expanded version", ->
    expanded = briefcase.toJSON(format: 'expanded', fresh: true)
    expanded.data.object.name.should.equal('Jon Soeder')
    expanded.assets['folder/system-architecture'].should.match(/svg/)

  it "should include the model definitions the expanded version", ->
    expanded = briefcase.toJSON(format: 'expanded', fresh: true)
    expanded.models[0].should.not.equal(undefined)
    expanded.models[0].should.have.property('sourcePath')
