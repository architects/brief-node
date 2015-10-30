describe "Nested YAML Blocks", ->
  page = briefcase.pages.findByTitle('YAML Blocks')

  it "should deserialize the yaml blocks", ->
    block = page.document.getCodeBlocks()[0]
    block.yaml.deserialized.should.equal(true)
    block.yaml.cool.should.equal('yes')

  it "merge data language blocks into the document data", ->
    block = page.document.getCodeBlocks()[1]
    page.document.data.should.have.property('settings')
    page.document.data.settings.should.have.property('note')

