const snapshot = require('.')

/* eslint-env mocha */
describe('named snapshots', () => {
  it('saves these snapshots by custom name', () => {
    snapshot('first snapshot', 1)
    snapshot('second snapshot', 2)
    snapshot('third snapshot', 3)
  })

  it.only('prints custom name in the error', () => {
    snapshot('my snap name', 42)
  })
})
