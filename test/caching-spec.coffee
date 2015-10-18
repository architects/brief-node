fs = require 'fs'

describe "Caching", ->
  epic = briefcase.at('epics/model-definition-dsl')
  document = briefcase.at('epics/model-definition-dsl').document

  it "has a cache key", ->
    briefcase.cacheKey.should.not.equal(undefined)

  it "shouldn't be stale", ->
    briefcase.isStale().should.equal(false)

  it "should incorporate the latest update time in the cache", ->
    previous = briefcase.computeCacheKey()
    briefcase.at('projects/brief').document.writeSync()
    briefcase.computeCacheKey().should.not.equal(previous)

  it "should consider itself stale", ->
    briefcase.isStale().should.equal(true)
