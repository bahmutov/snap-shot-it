snapshot = require('..')
la = require('lazy-ass')
{equals} = require('ramda')

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

  after ->
    snapshots = require('./__snapshots__/spec.coffee')
    # confirm each snapshot
    expected = {
      'CoffeeScript with snapshots simply works 1': 4,
      "CoffeeScript with snapshots works (has 4 snapshots) 1": 42,
      "CoffeeScript with snapshots works (has 4 snapshots) 2": "\nfoo\n",
      "CoffeeScript with snapshots works (has 4 snapshots) 3": {
        "foo": "foo",
        "bar": "bar"
      },
      "CoffeeScript with snapshots works (has 4 snapshots) 4": "\na promise\n",
      "CoffeeScript with snapshots with new test (2 snapshots) 1": 1,
      "CoffeeScript with snapshots with new test (2 snapshots) 2": 2
    }
    la(equals(snapshots, expected), 'found wrong snapshots, expected:',
      expected, 'but found:', snapshots)

