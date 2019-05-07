const snapshot = require('../..')

/* eslint-env mocha */
it('stores string as number', () => {
  // should be saved as the length of the string
  snapshot('aaaaa')
  snapshot('aaa')
})
