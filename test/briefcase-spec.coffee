fs  = require('fs')
Zip = require('adm-zip')

describe "The Briefcase", ->
  epic = briefcase.at "epics/model-definition-dsl"

  it "provides access to documents by their relative path", ->
    briefcase.at('epics/model-definition-dsl').should.have.property('document')

  it "creates collections for the diferent groups", ->
    titles = briefcase.epics.pluck('title')
    titles.length.should.be.above(0)
    titles.should.containEql('Model Definition DSL')

  it "provides access to all of the group names", ->
    types = briefcase.getGroupNames()
    types.should.containEql('epics')
    types.should.containEql('projects')

  it "provides access to all of the documents", ->
    briefcase.getAllDocuments().length.should.be.above(0)

  it "provides access to all of the models", ->
    briefcase.getAllModels().length.should.be.above(0)

  it "provides a manifest of files inside of it", ->
    files = briefcase.getAllFiles()
    files.should.containEql 'docs/epics/model-definition-dsl.md', 'index.js'

  it "has a name", ->
    briefcase.name.should.equal 'example'

  it "has a parent folder", ->
    briefcase.parentFolder.should.match /test$/

  it "archives the contents of the briefcase in a zip", ->
    briefcase.archive("/tmp/example.briefcase")
    fs.existsSync("/tmp/example.briefcase").should.equal(true)
    zip = new Zip("/tmp/example.briefcase")
    zip.getEntries().map((e) => e.entryName).should.containEql 'index.js', 'models/epic.js', 'docs/projects/brief.md', 'docs/epics/model-defintion-dsl.md'
    fs.unlinkSync("/tmp/example.briefcase")
