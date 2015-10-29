fs  = require('fs')
Zip = require('adm-zip')
_ = require 'underscore'

describe "Filtering", ->
  it "filters by an arbitrary iterator", ->
    briefcase.filterAll(()-> false).length.should.equal(0)

  it "filters all the models by a given type", ->
    models = briefcase.selectModelsByType('epic')
    types = _.uniq _(models).pluck('type')
    types.length.should.equal(1)
    types[0].should.equal('epic')

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

  it "can access documents via a glob interface", ->
    briefcase.glob("**/*.md").length.should.be.above(2)
    briefcase.glob("**/model-definition*").length.should.equal(1)
    model = briefcase.glob("**/model-definition*")[0].title.should.equal('Model Definition DSL')

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

describe "Multiple Briefcases", ->
  it "should provide access to the known instances", ->
    brief.instances().length.should.not.equal 0

  it "should lookup a briefcase by one of the paths it contains", ->
    brief.findBriefcaseByPath(briefcase.root).name.should.equal 'example'
