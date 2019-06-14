const snapshot = require('.')
const la = require('lazy-ass')
const is = require('check-more-types')
const debug = require('debug')('test')

/* eslint-env mocha */
describe('duplicate key', () => {
  context('same value', () => {
    it('is detected', () => {
      snapshot('exact name', 1)
      la(
        is.raises(
          () => {
            snapshot('exact name', 1)
          },
          e => {
            debug('caught e')
            debug(e)
            snapshot(e.message)
            return true
          }
        )
      )
    })
  })

  context('different value', () => {
    it('is detected', () => {
      snapshot('diff values', 1)
      la(
        is.raises(
          () => {
            snapshot('diff values', -100)
          },
          e => {
            debug('caught e')
            debug(e)
            snapshot(e.message)
            return true
          }
        )
      )
    })
  })
})
