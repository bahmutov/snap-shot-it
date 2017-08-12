snapshot = require('..')

describe "CoffeeScript with snapshots", ->
  it "works", ->
    snapshot(42)
    snapshot("foo")
    snapshot(
      foo: "foo"
      bar: "bar"
    )
    Promise.resolve('a promise').then(snapshot)
