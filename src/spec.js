const snapshot = require('.')
const { stripIndent } = require('common-tags')
const la = require('lazy-ass')

const add = (a, b) => a + b

/* eslint-env mocha */
describe('spec file', () => {
  it('returns saved value and snapshot key', () => {
    const result = snapshot('my name', 42)
    la(result.value === 42, 'wrong value', result)
    la(result.key === 'my name', 'wrong key', result)
  })

  it('uses spec name', () => {
    let result = snapshot(42)
    la(result.value === 42, 'wrong value', result)
    // first snapshot in this test has index 1
    la(result.key === 'spec file uses spec name 1', 'wrong key', result)

    // second snapshot
    result = snapshot('foo')
    la(result.value === 'foo', 'wrong value', result)
    // second snapshot in this test has index 2
    la(result.key === 'spec file uses spec name 2', 'wrong key', result)
  })

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

describe('multi line text with backticks', () => {
  it('works and saves', () => {
    snapshot(`
      line 1
      line 2 with \`42\`
      line 3 with \`foo\`
    `)
  })
})
