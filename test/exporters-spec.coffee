describe "Exporting and Bundling", ->
  it "should export the briefcase as a single object", ->
    console.log briefcase.exportWith('standard')
