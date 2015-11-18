describe "Visualizations", ->
  it "should replace yaml blocks with the result of custom javascript functions", ->
    page = briefcase.pages.findByTitle('Visualization Example')
    html = page.document.render()

    html.should.not.match(/VISUALIZATION/)
    html.should.match(/Look I rendered your visualiation/)
    html.should.not.match(/\&gt\;/)
