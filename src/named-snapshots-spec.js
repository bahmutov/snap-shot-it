const snapshot = require('.')

/* eslint-env mocha */
describe('named snapshots', () => {
  it('saves these snapshots by custom name', () => {
    snapshot('first snapshot', 1)
    snapshot('second snapshot', 2)
    snapshot('third snapshot', 3)
  })
})
