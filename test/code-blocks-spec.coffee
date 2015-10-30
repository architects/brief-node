describe "Code Blocks", ->
  it "should provide access to code blocks by their language", ->
    page = briefcase.pages.findByTitle('Code Blocks')

    page.codeBlocks.ruby.length.should.equal(1)
    page.codeBlocks.coffeescript.length.should.equal(1)

  it "should tell you which languages are available", ->
    page = briefcase.pages.findByTitle('Code Blocks')
    page.codeBlocks.languages.should.containEql('ruby','coffeescript')
