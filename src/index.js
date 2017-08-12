'use strict'

const debug = require('debug')('snap-shot-it')
const core = require('snap-shot-core')
// eslint-disable-next-line immutable/no-let
let oldIt = global.it

debug('loading snap-shot-it')

if (typeof oldIt !== 'function') {
  throw new Error(
    'Cannot find global "it" function, is it BDD runner like Mocha?'
  )
}

function isFunction (x) {
  return typeof x === 'function'
}

function isPromise (x) {
  return typeof x === 'object' && isFunction(x.then) && isFunction(x.catch)
}

let currentTest // eslint-disable-line immutable/no-let

function clearCurrentTest () {
  debug('clearing current test "%s"', currentTest.fullTitle())
  currentTest = null
}

function clearCurrentTestAndRethrow (err) {
  debug('clearing current test "%s"', currentTest.fullTitle())
  debug('and rethrowing error "%s"', err.message)
  currentTest = null
  throw err
}

function spyIt (title, fn) {
  if (typeof title === 'string' && !fn) {
    debug('skipping test "%s"', title)
    return oldIt(title)
  }

  debug('spyIt on "%s"', title)

  return oldIt(title, function () {
    currentTest = this.test // eslint-disable-line immutable/no-this
    debug('before test "%s"', currentTest.fullTitle())
    debug('before file %s', currentTest.file)
    // we are starting a test, so count the snapshots from the beginning
    core.restore({
      file: currentTest.file,
      specName: currentTest.fullTitle()
    })
    const result = fn()
    if (isPromise(result)) {
      return result.then(clearCurrentTest, clearCurrentTestAndRethrow)
    } else {
      clearCurrentTest()
    }
  })
}

function snapshot (value) {
  if (!currentTest) {
    throw new Error('Missing current test, cannot make snapshot')
  }
  debug('snapshot in test "%s"', currentTest.fullTitle())
  debug('full title "%s"', currentTest.fullTitle())
  debug('from file "%s"', currentTest.file)
  debug('snapshot value %j', value)

  const opts = {
    show: Boolean(process.env.SHOW),
    dryRun: Boolean(process.env.DRY),
    update: Boolean(process.env.UPDATE),
    ci: Boolean(process.env.CI)
  }
  const snap = {
    what: value,
    file: currentTest.file,
    specName: currentTest.fullTitle(),
    ext: null,
    opts
  }
  return core(snap)
}

/* eslint-disable immutable/no-mutation */
spyIt.only = oldIt.only
spyIt.skip = oldIt.skip

// do not let Mocha set the original "it" back
// instead use that as new "it" (has correct context information
// like file and spec name)
Object.defineProperty(global, 'it', {
  enumerable: true,
  get: () => spyIt,
  set: function (value) {
    oldIt = value
    spyIt.only = oldIt.only
    spyIt.skip = oldIt.skip
  }
})
// global.it = spyIt
module.exports = snapshot
/* eslint-enable immutable/no-mutation */

function deleteFromCache () {
  // to work with transpiled code, need to force
  // re-evaluating this module again on watch
  debug('deleting snap-shot-it from cache')
  delete require.cache[__filename]
}
global.after(deleteFromCache)
