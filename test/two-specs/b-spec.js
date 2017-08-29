const snapshot = require('../..')

/* eslint-env mocha */
describe('b-spec', () => {
  it('works', () => {
    snapshot('value b')
  })

  it('works with long text', () => {
    const text = `
      line 1
      line 2
      line 3
      line 4
      line 5
      line 6
      line 7
      line 8
      line 9
      line 10
    `
    snapshot(text)
  })
})
