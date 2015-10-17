_ = require 'underscore'

describe "Model Classes", ->
  it "creates classes for the model definitions", ->
    epicModel = brief.model('Epic')

describe "Model Collections", ->
  it "creates dynamic find by methods", ->
    epic = briefcase.epics.findByTitle('Model Definition DSL')
    epic.id.should.eql('epics/model-definition-dsl')

  it "creates dynamic find by methods", ->
    project = briefcase.projects.findByTitle('Brief')
    project.id.should.eql('projects/brief')

  it "filters by the type", ->
    types = _.uniq(briefcase.epics.map (e)-> e.document.getType())
    types.length.should.equal(1)
    types[0].should.equal('epic')
