Generator = require('../src/generator')

describe 'Briefcase Generators', ->
  it "should delegate to the options", ->
    generator = new Generator(root: briefcase.root)
    generator.root.should.equal(briefcase.root)
