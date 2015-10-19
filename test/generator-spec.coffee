Generator = require('../src/generator')

describe 'Briefcase Generators', ->
  it "should delegate to the options", ->
    generator = new Generator(root: briefcase.root)
    generator.root.should.equal(briefcase.root)

  it "should know the document folder names to create based on the models", ->
    generator = new Generator(root: briefcase.root, brief: brief)
    console.log(generator.documentFolderNames())
