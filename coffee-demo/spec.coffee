snapshot = require('..')

describe "CoffeeScript with snapshots", ->
  beforeEach ->

  it "simply works", ->
    # a single snapshot here working
    snapshot(4)

  it "works (has 4 snapshots)", ->
    snapshot(42)
    snapshot("foo")
    snapshot(
      foo: "foo"
      bar: "bar"
    )
    Promise.resolve('a promise').then(snapshot)

  it "with new test (2 snapshots)", ->
    snapshot(1)
    snapshot(2)
