describe "Nested YAML Blocks", ->
  it "should deserialize the yaml blocks", ->
    page = briefcase.pages.findByTitle('YAML Blocks')
    block = page.document.getCodeBlocks()[0]
    block.yaml.replaceWith.should.equal('visualization')
