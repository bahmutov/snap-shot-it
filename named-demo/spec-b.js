const snapshot = require('..')
const la = require('lazy-ass')

it('spec-b with named snapshot', () => {
  snapshot('named-snapshot-demo', 33)
})

after(() => {
  const snapshots = require('./__snapshots__/spec-b')
  la(snapshots['named-snapshot-demo'] === 33, 'wrong snapshot', snapshots)
})
