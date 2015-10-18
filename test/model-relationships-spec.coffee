describe "Has Many Relationships", ->
  epic = briefcase.at('epics/model-definition-dsl')
  project = briefcase.at('projects/brief')
  document = briefcase.at('epics/model-definition-dsl').document

  it "sets up foreign key data without needing to specify", ->
    Project = brief.ModelDefinition.lookup('project')
    Project.relationships.epics.should.have.property('foreignKey')

  it "knows what type of relationship it is", ->
    Epic = brief.ModelDefinition.lookup('epic')
    Epic.relationships.project.should.have.property('foreignKey')
    Epic.relationships.project.belongsTo.should.equal true
    Epic.relationships.project.hasMany.should.equal false

  it "allows for has many relationships", ->
    project.related('epics').length.should.equal(1)

  it "allows for belongs to relationships", ->
    epic.related('project').should.not.equal('undefined')
