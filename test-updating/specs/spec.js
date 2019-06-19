const snapshot = require('../..')

/* eslint-env mocha */
it('has single value', () => {
  snapshot('my value', 42)
})
