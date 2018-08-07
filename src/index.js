'use strict'

const debug = require('debug')('snap-shot-it')
const core = require('snap-shot-core')
const compare = require('snap-shot-compare')
const { isDataDriven, dataDriven } = require('@bahmutov/data-driven')
const { isNamedSnapshotArguments } = require('./named-snapshots')
const R = require('ramda')
const { hasOnly, hasFailed } = require('has-only')

debug('loading snap-shot-it')
const EXTENSION = '.js'

// all tests we have seen so we can prune later
const seenSpecs = []
function _pruneSnapshots () {
  debug('pruning snapshots')
  debug(seenSpecs)
  core.prune({ tests: seenSpecs, ext: EXTENSION })
  // eslint-disable-next-line immutable/no-mutation
  seenSpecs.length = 0
}

// eslint-disable-next-line immutable/no-let
let pruneSnapshots

function addToPrune (info) {
  // do not add if previous info is the same
  if (R.equals(R.last(seenSpecs), info)) {
    return
  }
  seenSpecs.push(info)
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
  if (hasOnly(this)) {
    debug('skip pruning snapshots because found .only')
    pruneSnapshots = function noop () {}
  } else {
    debug('will prune snapshots because no .only')
    pruneSnapshots = _pruneSnapshots
  }
  /* eslint-enable immutable/no-this */
})

global.beforeEach(function () {
  /* eslint-disable immutable/no-this */
  if (this.currentTest) {
    setTest(this.currentTest)
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
    addToPrune(getTestInfo(currentTest))
  } else if (isNamedSnapshotArguments(arguments)) {
    savedTestTitle = arguments[0]
    value = arguments[1]
    debug('named snapshots "%s"', savedTestTitle)
    addToPrune({
      file: currentTest.file,
      specName: savedTestTitle
    })
  } else {
    debug('snapshot value %j', value)
    addToPrune(getTestInfo(currentTest))
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
    ext: EXTENSION,
    compare,
    opts
  }

  if (isNamedSnapshotArguments(arguments)) {
    // eslint-disable-next-line immutable/no-mutation
    snap.exactSpecName = savedTestTitle
  } else {
    // eslint-disable-next-line immutable/no-mutation
    snap.specName = savedTestTitle
  }

  return core(snap)
}

/* eslint-disable immutable/no-mutation */
module.exports = snapshot
/* eslint-enable immutable/no-mutation */

global.after(function () {
  /* eslint-disable immutable/no-this */
  if (!hasFailed(this)) {
    debug('the test run was a success')
    pruneSnapshots.call(this)
  } else {
    debug('not attempting to prune snapshots because the test run has failed')
  }
  /* eslint-enable immutable/no-this */
})

function deleteFromCache () {
  // to work with transpiled code, need to force
  // re-evaluating this module again on watch
  debug('deleting snap-shot-it from cache')
  delete require.cache[__filename]
}
global.after(deleteFromCache)
