const snapshot = require('..')

it('a', () => {
  console.log('in a')
  snapshot(1)
})

// try skipping this test using it.only
// the pruning should NOT work
it('b is sometimes skipped', () => {
  console.log('in b')
  snapshot(2)
})
