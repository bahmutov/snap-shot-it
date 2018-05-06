const snapshot = require('.')
const la = require('lazy-ass')

/* eslint-env mocha */
describe('named snapshots', () => {
  it('saves these snapshots by custom name', () => {
    snapshot('first snapshot', 1)
    snapshot('second snapshot', 2)
    snapshot('third snapshot', 3)
  })

  it('prints custom name in the error', () => {
    const mySnapshotName = 'my snap name'
    try {
      // making it fail on purpose to get the error message
      snapshot(mySnapshotName, 41)
    } catch (e) {
      la(e.message.includes(mySnapshotName), e.message)
    }
  })
})
