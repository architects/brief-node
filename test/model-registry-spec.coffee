{
  registry,
  model
} = require('../src/model_registry')

describe "The Model Registry", ->
  it "registers models from a briefcase", ->
    epic = briefcase.getModelDefinition('Epic')
    model('epic').should.eql(epic)

  it "lets me lookup a model by its alias", ->
    model('epic').should.have.property('attributes')

  it "lets me lookup a model by its name", ->
    model('Epic').should.have.property('attributes')

  it "lets me lookup a model by its plural name", ->
    model('epics').should.have.property('attributes')

  it "lets me lookup a model by its plural name", ->
    model('Epics').should.have.property('attributes')
