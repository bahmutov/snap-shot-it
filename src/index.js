'use strict'

const debug = require('debug')('snap-shot-it')
const core = require('snap-shot-core')
const compare = require('snap-shot-compare')
const { isDataDriven, dataDriven } = require('@bahmutov/data-driven')

debug('loading snap-shot-it')
const EXTENSION = '.js'

// all tests we have seen so we can prune later
const seenSpecs = []
function pruneSnapshots () {
  debug('pruning snapshots')
  debug(seenSpecs)
  core.prune({ tests: seenSpecs, ext: EXTENSION })
  // eslint-disable-next-line immutable/no-mutation
  seenSpecs.length = 0
}

// eslint-disable-next-line immutable/no-let
let currentTest

function setTest (t) {
  if (!t) {
    throw new Error('Expected test object')
  }
  currentTest = t
}

const getTestTitle = test => test.fullTitle().trim()

const getTestInfo = test => {
  return {
    file: test.file,
    specName: getTestTitle(test)
  }
}

function clearCurrentTest () {
  if (currentTest) {
    const fullTitle = getTestTitle(currentTest)
    debug('clearing current test "%s"', fullTitle)
    core.restore(getTestInfo(currentTest))
    currentTest = null
  }
}

global.beforeEach(function () {
  /* eslint-disable immutable/no-this */
  if (this.currentTest) {
    setTest(this.currentTest)
    seenSpecs.push(getTestInfo(this.currentTest))
  }
  /* eslint-enable immutable/no-this */
})

global.afterEach(clearCurrentTest)

function snapshot (value) {
  if (!currentTest) {
    throw new Error('Missing current test, cannot make snapshot')
  }

  const fullTitle = getTestTitle(currentTest)
  debug('snapshot in test "%s"', fullTitle)
  debug('full title "%s"', fullTitle)
  debug('from file "%s"', currentTest.file)

  // eslint-disable-next-line immutable/no-let
  let savedTestTitle = fullTitle

  if (isDataDriven(arguments)) {
    // value is a function
    debug('data-driven test for %s', value.name)
    value = dataDriven(value, Array.from(arguments).slice(1))
    savedTestTitle += ' ' + value.name
    debug('extended save name to include function name')
    debug('snapshot name "%s"', savedTestTitle)
  } else {
    debug('snapshot value %j', value)
  }

  const opts = {
    show: Boolean(process.env.SNAPSHOT_SHOW),
    dryRun: Boolean(process.env.SNAPSHOT_DRY),
    update: Boolean(process.env.SNAPSHOT_UPDATE),
    ci: Boolean(process.env.CI)
  }
  const snap = {
    what: value,
    file: currentTest.file,
    specName: savedTestTitle,
    ext: EXTENSION,
    compare,
    opts
  }
  return core(snap)
}

/* eslint-disable immutable/no-mutation */
module.exports = snapshot
/* eslint-enable immutable/no-mutation */

global.after(pruneSnapshots)

function deleteFromCache () {
  // to work with transpiled code, need to force
  // re-evaluating this module again on watch
  debug('deleting snap-shot-it from cache')
  delete require.cache[__filename]
}
global.after(deleteFromCache)
