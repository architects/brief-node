describe "Embedding Assets", ->
  page = briefcase.pages.findByTitle('Embedded Content')
  html = page.document.render()

  it "should embed svg content inline", ->
    html.should.match(/svg/)

  it "should embed html content inline", ->
    html.should.match(/Woohoo/)
