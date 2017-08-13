const snapshot = require('.')

/* eslint-env mocha */
describe('second-spec', () => {
  it('works too', () => {
    snapshot('some value')
  })
})
