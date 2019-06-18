const snapshot = require('../..')

/* eslint-env mocha */
it('has names in reverse order', () => {
  // notice that snapshots are named NOT in sorted order
  snapshot('zz', 3)
  snapshot('bb', 2)
  snapshot('aa', 1)
})
