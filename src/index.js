'use strict'

const debug = require('debug')('snap-shot-it')
// const core = require('snap-shot-core')
const { initStore } = require('snap-shot-store')
const compare = require('snap-shot-compare')
const { isDataDriven, dataDriven } = require('@bahmutov/data-driven')
const { isNamedSnapshotArguments } = require('./named-snapshots')
const R = require('ramda')
const itsName = require('its-name')
const la = require('lazy-ass')
const is = require('check-more-types')
const fs = require('fs')
const path = require('path')
const makeDir = require('make-dir')

const version = require('../package.json').version

debug('loading snap-shot-it')
const EXTENSION = '.js'
const SNAPSHOT_FOLDER = path.join(process.cwd(), '__snapshots__')
const SNAPSHOT_FILENAME = path.join(SNAPSHOT_FOLDER, `snapshots${EXTENSION}`)

// for each full test name, keeps number of snapshots
// allows using multiple snapshots inside single test
// without confusing them
// eslint-disable-next-line immutable/no-let
let counters = {}

function getSnapshotIndex (key) {
  if (key in counters) {
    // eslint-disable-next-line immutable/no-mutation
    counters[key] += 1
  } else {
    // eslint-disable-next-line immutable/no-mutation
    counters[key] = 1
  }
  return counters[key]
}

// eslint-disable-next-line immutable/no-let
let storeSnapshot

global.before(function loadSnapshots () {
  debug('loading snapshot store')
  return new Promise((resolve, reject) => {
    if (fs.existsSync(SNAPSHOT_FILENAME)) {
      debug('loading snapshot store from file')
      const store = require(SNAPSHOT_FILENAME)
      delete store.__version
      storeSnapshot = initStore(store)
    } else {
      debug('starting new snapshot store')
      storeSnapshot = initStore()
    }
    resolve()
  })
})

// all tests we have seen so we can prune later
const seenSpecs = []

// disable pruning for now
// function pruneSnapshots () {
//   debug('pruning snapshots')
//   debug(seenSpecs)
//   // core.prune({ tests: seenSpecs, ext: EXTENSION })
//   // eslint-disable-next-line immutable/no-mutation
//   seenSpecs.length = 0
// }

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
    // core.restore(getTestInfo(currentTest))
    currentTest = null
  }
}

global.beforeEach(function setCurrentTest () {
  /* eslint-disable immutable/no-this */
  if (this.currentTest) {
    setTest(this.currentTest)
  }
  /* eslint-enable immutable/no-this */
})

global.afterEach(clearCurrentTest)

function getTestName (test) {
  const names = itsName(test)
  la(is.strings(names), 'could not get name from current test', test)

  const filename = path.relative(process.cwd(), test.file)

  const name = R.prepend(filename, names)
  return name
}

function getSnapshotName (test) {
  const names = getTestName(test)
  const key = names.join(' - ')
  const index = getSnapshotIndex(key)
  return R.append(String(index), names)
}

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
  const name = getSnapshotName(currentTest)
  la(is.strings(name), 'could not get name for test', currentTest)
  la(is.unempty(name), 'empty test name for', currentTest)

  const snap = {
    value,
    name,
    opts,
    compare
  }
  return storeSnapshot(snap)
}

/* eslint-disable immutable/no-mutation */
module.exports = snapshot
/* eslint-enable immutable/no-mutation */

// global.after(pruneSnapshots)

function deleteFromCache () {
  // to work with transpiled code, need to force
  // re-evaluating this module again on watch
  debug('deleting snap-shot-it from cache')
  delete require.cache[__filename]
  // reset all counters
  counters = {}
}
global.after(deleteFromCache)

function saveSnapshots () {
  return makeDir(SNAPSHOT_FOLDER).then(() => {
    debug('saving snapshots from version %s', version)
    const snapshots = storeSnapshot()
    const moreInfo = R.merge(snapshots, {
      __version: version
    })
    const s = JSON.stringify(moreInfo, null, 2)
    const str = 'module.exports = ' + s + '\n'
    fs.writeFileSync(SNAPSHOT_FILENAME, str)
  })
}
global.after(saveSnapshots)
