'use strict'

const debug = require('debug')('snap-shot-it')
const core = require('snap-shot-core')
const oldIt = global.it

if (typeof oldIt !== 'function') {
  throw new Error(
    'Cannot find global "it" function, is it BDD runner like Mocha?'
  )
}

let currentTest // eslint-disable-line immutable/no-let

function spyIt (title, fn) {
  if (typeof title === 'string' && !fn) {
    debug('skipping test "%s"', title)
    return oldIt(title)
  }

  debug('spyIt on "%s"', title)
  return oldIt(title, function () {
    currentTest = this.test // eslint-disable-line immutable/no-this
    debug('before test "%s"', currentTest.fullTitle())
    return fn()
    // could also do something after the test function executes
  })
}

function snapshot (value) {
  if (!currentTest) {
    throw new Error('Missing current test, cannot make snapshot')
  }
  debug('snapshot in test "%s"', currentTest.title)
  debug('full title "%s"', currentTest.fullTitle())
  debug('from file "%s"', currentTest.file)
  debug('snapshot value %j', value)

  const options = {
    what: value,
    file: currentTest.file,
    specName: currentTest.fullTitle(),
    ext: null
  }
  return core(options)
}

/* eslint-disable immutable/no-mutation */
spyIt.only = oldIt.only
spyIt.skip = oldIt.skip
global.it = spyIt
module.exports = snapshot
/* eslint-enable immutable/no-mutation */
