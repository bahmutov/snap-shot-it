const snapshot = require('..')
const la = require('lazy-ass')

it('spec-a with named snapshot', () => {
  snapshot('named-snapshot-demo', 101)
})

after(() => {
  const snapshots = require('./__snapshots__/spec-a')
  la(snapshots['named-snapshot-demo'] === 101, 'wrong snapshot', snapshots)
})
