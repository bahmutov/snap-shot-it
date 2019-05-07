'use strict'

const debug = require('debug')('snap-shot-it')
const { core, restore, prune } = require('snap-shot-core')
const { isDataDriven, dataDriven } = require('@bahmutov/data-driven')
const { isNamedSnapshotArguments } = require('./named-snapshots')
const utils = require('./utils')
const R = require('ramda')
const { hasOnly, hasFailed } = require('has-only')
const pluralize = require('pluralize')

// save current directory right away to avoid any surprises later
// when some random tests change it
const cwd = process.cwd()

debug('loading snap-shot-it')
const EXTENSION = '.js'

// all tests we have seen so we can prune later
const seenSpecs = []
function _pruneSnapshots () {
  debug('pruning snapshots')
  debug('seen %s', pluralize('spec', seenSpecs.length, true))
  debug(seenSpecs)
  prune({ tests: seenSpecs, ext: EXTENSION })

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
    restore(getTestInfo(currentTest))
    currentTest = null
  }
}

global.beforeEach(function () {
  /* eslint-disable immutable/no-this */
  if (hasOnly(this)) {
    debug('skip pruning snapshots because found .only')
    pruneSnapshots = function noop () {}
  } else if (utils.isPruningDisabled()) {
    debug('skip pruning snapshots by env variable')
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

  // grab options from environment variables
  const envOptions = {
    show: Boolean(process.env.SNAPSHOT_SHOW),
    dryRun: Boolean(process.env.SNAPSHOT_DRY),
    update: Boolean(process.env.SNAPSHOT_UPDATE),
    ci: Boolean(process.env.CI)
  }
  if ('SNAPSHOT_SORT' in process.env) {
    envOptions.sortSnapshots = Boolean(process.env.SNAPSHOT_SORT)
  }

  const packageConfigOptions = utils.getPackageConfigOptions(cwd)
  const opts = R.mergeRight(packageConfigOptions, envOptions)
  debug('environment options %o', envOptions)
  debug('package config options %o', packageConfigOptions)
  debug('merged options %o', opts)

  const compare = opts.compare
    ? utils.load(cwd, opts.compare)
    : require('snap-shot-compare')
  const store = opts.store ? utils.load(cwd, opts.store) : null

  const preCompare = opts['pre-compare']
    ? utils.load(cwd, opts['pre-compare'])
    : R.identity
  const what = preCompare(value)

  const snap = {
    what,
    file: currentTest.file,
    ext: EXTENSION,
    compare,
    store,
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
