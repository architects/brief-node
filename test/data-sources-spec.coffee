describe "Data Sources", ->
  it "should create a collection", ->
    briefcase.collections.should.have.property('data')

  it "should let me access the data source", ->
    briefcase.collections.data.at('collection').should.have.property('id')

  it "should support objects as well as collections", ->
    object = briefcase.collections.data.at('object')
    object.data.name.should.equal 'Jon Soeder'
    object.data.style.should.equal 'fresh'

  it "should de-serialize the data", ->
    collection = briefcase.collections.data.at('collection')
    collection.data.length.should.equal(2)
    collection.data[0].name.should.equal('Jon Soeder')

  it "supports yaml files", ->
    nice = briefcase.collections.data.at('nice')
    nice.data.synonyms.should.containEql('Kind','Good Natured')
