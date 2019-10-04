const snapshot = require('../src')
const la = require('lazy-ass')

it('spec-a with chunked snapshot', () => {
  snapshot({title: 'chunked-snapshot-demo', chunk: 'a'}, 101)
})

it('spec-b with chunked snapshot', () => {
  snapshot({title: 'chunked-snapshot-demo', chunk: 'b'}, 33)
})

after(() => {
  const snapshots_a = require('./__snapshots__/spec.a')
  la(snapshots_a['chunked-snapshot-demo [a] 1'] === 101, 'wrong snapshot', snapshots_a)
  const snapshots_b = require('./__snapshots__/spec.b')
  la(snapshots_b['chunked-snapshot-demo [b] 1'] === 33, 'wrong snapshot', snapshots_b)
})
