describe "Visualizations", ->
  it "should replace yaml blocks with the result of custom javascript functions", ->
    page = briefcase.pages.findByTitle('View Example')
    html = page.document.render()

    html.should.not.match(/VISUALIZATION/)
    html.should.match(/look i rendered your node into arbitrary html/)
    html.should.not.match(/\&gt\;/)
