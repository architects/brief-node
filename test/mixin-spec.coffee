SampleMixin = require('./example/mixins/sample_mixin')

describe 'The Mixin System', ->
  it "should modify the model prototype", ->
    brief.mixin(SampleMixin,'model')
    briefcase.at('projects/brief').keywords.should.not.equal(undefined)
