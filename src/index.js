'use strict'

const debug = require('debug')('snap-shot-it')
const core = require('snap-shot-core')
const compare = require('snap-shot-compare')

debug('loading snap-shot-it')

// eslint-disable-next-line immutable/no-let
let currentTest

function setTest (t) {
  if (!t) {
    throw new Error('Expected test object')
  }
  currentTest = t
}

function clearCurrentTest () {
  debug('clearing current test "%s"', currentTest.fullTitle())
  core.restore({
    file: currentTest.file,
    specName: currentTest.fullTitle()
  })
  currentTest = null
}

global.beforeEach(function () {
  // eslint-disable-next-line immutable/no-this
  setTest(this.currentTest)
})

global.afterEach(clearCurrentTest)

function snapshot (value) {
  if (!currentTest) {
    throw new Error('Missing current test, cannot make snapshot')
  }
  debug('snapshot in test "%s"', currentTest.fullTitle())
  debug('full title "%s"', currentTest.fullTitle())
  debug('from file "%s"', currentTest.file)
  debug('snapshot value %j', value)

  const opts = {
    show: Boolean(process.env.SNAPSHOT_SHOW),
    dryRun: Boolean(process.env.SNAPSHOT_DRY),
    update: Boolean(process.env.SNAPSHOT_UPDATE),
    ci: Boolean(process.env.CI)
  }
  const snap = {
    what: value,
    file: currentTest.file,
    specName: currentTest.fullTitle(),
    ext: '.js',
    compare,
    opts
  }
  return core(snap)
}

/* eslint-disable immutable/no-mutation */
module.exports = snapshot
/* eslint-enable immutable/no-mutation */

function deleteFromCache () {
  // to work with transpiled code, need to force
  // re-evaluating this module again on watch
  debug('deleting snap-shot-it from cache')
  delete require.cache[__filename]
}
global.after(deleteFromCache)
