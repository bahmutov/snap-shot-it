const snapshot = require('../..')

/* eslint-env mocha */
describe('a-spec', () => {
  beforeEach(() => {
    // this hook fails on purpose
    // the failing hook should NOT trim the previously saved
    // snapshot from the test below
    // throw new Error('beforeEach error!')
  })
  it('works first', () => {
    snapshot('value a')
  })
  it('works second', () => {
    snapshot('value b')
  })
})
