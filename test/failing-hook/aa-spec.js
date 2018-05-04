const snapshot = require('../..')

/* eslint-env mocha */
describe('a-spec', () => {
  beforeEach(() => {
    // this hook fails on purpose
    // the failing hook should NOT trim the previously saved
    // snapshot from the test below
  })
  it('works', () => {
    snapshot('value a')
  })
})
