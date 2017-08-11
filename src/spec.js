const snapshot = require('.')

const add = (a, b) => a + b

/* eslint-env mocha */
describe('spec file', () => {
  it('adds 2 numbers', () => {
    snapshot(add(2, 3))
  })

  it('without snapshot', () => {
    console.assert(add(2, 10) === 12)
  })

  it('has several snapshot numbers', () => {
    snapshot(1)
    snapshot(2)
    snapshot(3)
    snapshot(4)
    snapshot(5)
  })

  it('supports promises', () => {
    return Promise.resolve(42).then(snapshot)
  })

  describe('inner tests', () => {
    it('works in nested describes', () => {
      snapshot('foo')
    })
  })
})

describe('example', () => {
  it('works', () => {
    snapshot(add(10, 20))
    snapshot('a text message')
    return Promise.resolve(42).then(snapshot)
  })
})
