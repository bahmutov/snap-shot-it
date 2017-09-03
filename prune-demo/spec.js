const snapshot = require('..')

it('a', () => {
  console.log('in a')
  snapshot(1)
})

it('b is sometimes skipped', () => {
  console.log('in b')
  snapshot(2)
})
