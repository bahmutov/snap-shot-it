const la = require('lazy-ass')
const is = require('check-more-types')
const R = require('ramda')
const utils = require('./utils')

/* eslint-env mocha */
describe('utils', () => {
  context('mergeConfigOptions', () => {
    it('merges options', () => {
      const defaultOptions = {
        foo: 1
      }
      const packageOptions = {
        foo: 2
      }
      const envOptions = {
        foo: 3
      }
      const merged = utils.mergeConfigOptions(
        defaultOptions,
        packageOptions,
        envOptions
      )
      // env options wins
      la(R.equals(merged, envOptions), merged)
    })

    it('merges new options', () => {
      const defaultOptions = {
        foo: 1,
        bar: null
      }
      const packageOptions = {
        foo: 2
      }
      const envOptions = {
        bar: 3
      }
      const merged = utils.mergeConfigOptions(
        defaultOptions,
        packageOptions,
        envOptions
      )
      const expected = {
        foo: 2,
        bar: 3
      }
      la(R.equals(merged, expected), merged)
    })

    it('skips undefined', () => {
      const defaultOptions = {
        foo: 1
      }
      const packageOptions = {
        foo: 2
      }
      const envOptions = {}
      const merged = utils.mergeConfigOptions(
        defaultOptions,
        packageOptions,
        envOptions
      )
      la(R.equals(merged, packageOptions), merged)
    })

    it('checks defaults to have ALL possible keys', () => {
      const defaultOptions = {}
      const packageOptions = {
        foo: 2
      }
      const envOptions = {
        bar: 10
      }
      la(
        is.raises(
          () => {
            utils.mergeConfigOptions(defaultOptions, packageOptions, envOptions)
          },
          e => {
            return e.message.includes('foo, bar')
          }
        )
      )
    })
  })
})
