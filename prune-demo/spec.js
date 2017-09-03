const snapshot = require('..')

it('a', () => {
  console.log('in a')
  snapshot(1)
})

it.skip('b skipped', () => {
  console.log('in b')
  snapshot(2)
})
