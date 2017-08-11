'use strict'

const debug = require('debug')('snap-shot-it')
const core = require('snap-shot-core')
const oldIt = global.it

let currentTest // eslint-disable-line immutable/no-let

function checkArguments (title, fn) {
  if (arguments.length !== 2) {
    throw new Error('Expectex "it" to be called with name and callback')
  }
}

function spyIt (title, fn) {
  checkArguments.apply(null, arguments)

  debug('spyIt on "%s"', title)

  return oldIt(title, function () {
    currentTest = this.test // eslint-disable-line immutable/no-this
    debug('before test "%s"', currentTest.fullTitle())
    return fn()
    // could also do something after the test function executes
  })
}

// eslint-disable-next-line immutable/no-mutation
spyIt.only = oldIt.only

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

// eslint-disable-next-line immutable/no-mutation
global.it = spyIt
// eslint-disable-next-line immutable/no-mutation
module.exports = snapshot
