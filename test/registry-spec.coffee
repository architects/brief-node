describe "Registering Visualizations, Queries, Commands", ->
  it "should have some commands available", ->
    briefcase.commands.available.should.containEql('sample_command')

  it "should have some queries available", ->
    briefcase.queries.available.should.containEql('sample_query')

  it "should have some views available", ->
    briefcase.views.available.should.containEql('visualization')
