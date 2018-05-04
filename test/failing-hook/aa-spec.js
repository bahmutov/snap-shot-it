const snapshot = require('../..')

/* eslint-env mocha */
describe('a-spec', () => {
  let counter = 0
  beforeEach(() => {
    // this hook fails on purpose before second test
    // the failing hook should NOT trim the previously saved
    // snapshot from the test below
    counter += 1
    if (counter === 2) {
      throw new Error('beforeEach second test error!')
    }
  })
  it('works first', () => {
    snapshot('value a')
  })
  it('works second', () => {
    snapshot('value b')
  })
})
