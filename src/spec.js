const snapshot = require('.')
const { stripIndent } = require('common-tags')

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

describe('multi line text', () => {
  it('works', () => {
    snapshot(`
      line 1
      line 2
      line 3
    `)
  })

  it('works with longer text', () => {
    const text = stripIndent`
      first line
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
