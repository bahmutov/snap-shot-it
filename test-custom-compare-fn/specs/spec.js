const snapshot = require('../..')

/* eslint-env mocha */
it('random string as 10 As', () => {
  // our custom compare function replaces strings with
  // same length of "aaaa..." :)
  const s = Math.random()
    .toString()
    .substr(0, 10)
  snapshot(s)
})
