'use strict'

const debug = require('debug')('snap-shot-it')
const { core, restore, prune } = require('snap-shot-core')
const { isDataDriven, dataDriven } = require('@bahmutov/data-driven')
const { isNamedSnapshotArguments } = require('./named-snapshots')
const { isChunkedSnapshotArguments } = require('./chunked-snapshots')
const utils = require('./utils')
const R = require('ramda')
const { hasOnly, hasFailed } = require('has-only')
const pluralize = require('pluralize')
const la = require('lazy-ass')
const is = require('check-more-types')
const { stripIndent } = require('common-tags')
const path = require('path')
const itsName = require('its-name')

// save current directory right away to avoid any surprises later
// when some random tests change it
const cwd = process.cwd()
const relativeToCwd = path.relative.bind(null, cwd)

debug('loading snap-shot-it')
const EXTENSION = '.js'

const noop = () => {}

/**
 * all tests we have seen so we can prune later
 * for each seen spec we keep just an object
 * { file, key }
 * where key is the full name of the saved snapshot
 * so in the list there might be multiple key
 */
const seenSpecs = []
function _pruneSnapshots () {
  debug('pruning snapshots')
  debug('seen %s', pluralize('spec', seenSpecs.length, true))
  debug(seenSpecs)
  prune({ tests: seenSpecs, ext: EXTENSION }, pruneSnapshotsOptions)

  // eslint-disable-next-line immutable/no-mutation
  seenSpecs.length = 0
}

// eslint-disable-next-line immutable/no-let
let pruneSnapshots = noop
let pruneSnapshotsOptions

/**
 * Returns true if the object has information enough
 * to prune snapshots later.
 */
const isPruneInfo = is.schema({
  specFile: is.unemptyString,
  key: is.unemptyString,
  testTitle: is.unemptyString,
  titleParts: is.strings,
  allowDuplicate: is.bool
})

function addToPrune (info) {
  la(isPruneInfo(info), 'wrong info for pruning snapshot', info)

  const prevInfo = findExistingSnapshotKey(info)
  if (prevInfo && !info.allowDuplicate) {
    debug('add to prune: found duplicate snapshot name: %s', prevInfo.key)
    debug('%o', info)

    throwDuplicateSnapshotKeyError(info, prevInfo)
  }

  seenSpecs.push(info)
}

const findExistingSnapshotKey = info => {
  la(isPruneInfo(info), 'wrong snapshot prune info', info)
  return R.find(R.propEq('key', info.key))(seenSpecs)
}

const throwDuplicateSnapshotKeyError = (current, previous) => {
  la(isPruneInfo(current), 'wrong current snapshot info', current)
  la(isPruneInfo(previous), 'wrong previous snapshot info', previous)

  throw new Error(stripIndent`
    Duplicate snapshot key "${current.key}"
    in spec file: ${relativeToCwd(current.specFile)}
    current test title: "${current.testTitle}"
    current test title in parts: ${current.titleParts.join(' - ')}
    previous test title in parts: ${previous.titleParts.join(' - ')}
    Please change the snapshot name to ensure uniqueness.
  `)
}

// eslint-disable-next-line immutable/no-let
let currentTest

function setTest (t) {
  if (!t) {
    throw new Error('Expected test object')
  }
  currentTest = t
}

/**
 * Returns full title of the test.
 * Usually it is just a single string, concatenated from the root
 * suite all the way to the test title.
 *
  ```
  describe('foo', () => {
    context('bar', () => {
      it('works', () => {
        // test title is "foo bar works"
      })
    })
  })
  ```
 */
const getTestTitle = test => test.fullTitle().trim()

/**
 * Returns individual parts of the test title, starting from the outer suite
 */
const getTestTitleParts = itsName

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
    pruneSnapshots = noop
  } else if (utils.isPruningDisabled()) {
    debug('skip pruning snapshots by env variable')
    pruneSnapshots = noop
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
  la(
    is.unemptyString(fullTitle),
    'could not get full title from test',
    currentTest
  )
  debug('snapshot in test "%s"', fullTitle)
  debug('from file "%s"', currentTest.file)

  const fullTitleParts = getTestTitleParts(currentTest)
  la(
    is.strings(fullTitleParts),
    'could not get test title strings',
    currentTest
  )
  debug('full title in parts %o', fullTitleParts)

  // eslint-disable-next-line immutable/no-let
  let savedTestTitle = fullTitle
  let snapshotOptions = {}

  if (isDataDriven(arguments)) {
    // value is a function
    debug('data-driven test for %s', value.name)
    value = dataDriven(value, Array.from(arguments).slice(1))
    savedTestTitle += ' ' + value.name
    debug('extended save name to include function name')
    debug('snapshot name "%s"', savedTestTitle)
  } else if (isNamedSnapshotArguments(arguments)) {
    savedTestTitle = arguments[0]
    value = arguments[1]
    // and there could be additional arguments for named snapshots
    snapshotOptions = arguments[2] || {}
    debug('named snapshots "%s"', savedTestTitle)
  } else if (isChunkedSnapshotArguments(arguments)) {
    if (arguments[0].title) savedTestTitle = arguments[0].title
    const chunk = arguments[0].chunk
    if (chunk) {
      const parsedPath = path.parse(currentTest.file)
      currentTest.file = `${path.join(
        parsedPath.dir,
        parsedPath.name + '.' + chunk + parsedPath.ext
      )}`
      savedTestTitle += ` [${chunk}]`
    }
    value = arguments[1]
  } else {
    debug('snapshot value %j', value)
  }

  // grab options from environment variables
  const envOptions = {
    // TODO cast '0' as false id:6
    // - <https://github.com/bahmutov/snap-shot-it/issues/376>
    // Gleb Bahmutov
    // gleb.bahmutov@gmail.com
    show: Boolean(process.env.SNAPSHOT_SHOW),
    dryRun: Boolean(process.env.SNAPSHOT_DRY),
    update: utils.isUpdatingSnapshots(),
    ci: Boolean(process.env.CI)
  }
  if ('SNAPSHOT_SORT' in process.env) {
    if (process.env.SNAPSHOT_SORT === '0') {
      envOptions.sortSnapshots = false
    } else {
      envOptions.sortSnapshots = Boolean(process.env.SNAPSHOT_SORT)
    }
  }

  // note: we need to provide default values for ALL keys
  const defaultOptions = {
    show: false,
    dryRun: false,
    update: false,
    ci: false,
    sortSnapshots: false,
    useRelativePath: false,
    // callback functions that will be set later
    'pre-compare': R.noop,
    compare: R.noop,
    store: R.noop
  }
  const packageConfigOptions = utils.getPackageConfigOptions(cwd)
  const opts = utils.mergeConfigOptions(
    defaultOptions,
    packageConfigOptions,
    envOptions
  )
  debug('environment options %o', envOptions)
  debug('package config options %o', packageConfigOptions)
  debug('merged options %o', opts)

  // for pruning we only need a few options
  pruneSnapshotsOptions = R.pick(['sortSnapshots', 'useRelativePath'], opts)
  debug('prune options %o', pruneSnapshotsOptions)

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

  const snapshotInfo = {
    specFile: currentTest.file,
    testTitle: fullTitle, // a single string like "suite test"
    titleParts: fullTitleParts // list of titles like ["suite", "test"]
    // just missing "key" which is determined in the snap-shot-core
  }

  let coreResult
  try {
    debug('about to compare')
    coreResult = core(snap)
    debug('core result %o', coreResult)

    // there should be value and snapshot name (key)
    la('value' in coreResult, 'core result should have value', coreResult)
    la('key' in coreResult, 'core result should have key', coreResult)

    const pruneInfo = R.assoc('key', coreResult.key, snapshotInfo)
    pruneInfo.allowDuplicate = Boolean(snapshotOptions.allowSharedSnapshot)
    debug('prune info %o', pruneInfo)

    addToPrune(pruneInfo)
  } catch (e) {
    if (e.key) {
      debug('value comparison exception')
      // maybe it is due to a duplicate snapshot key?
      // maybe two different tests save snapshots with same name like
      //
      // it('a', () => {
      //   snapshot('foo', 1)
      // })
      // it('b', () => {
      //   snapshot('foo', 42)
      // })
      //
      // check if we have a collision
      // the code is duplicate from above to get just the key collision error
      const info = R.assoc('key', e.key, snapshotInfo)
      info.allowDuplicate = Boolean(snapshotOptions.allowSharedSnapshot)
      debug('current snapshot info %o', info)

      const prevInfo = findExistingSnapshotKey(info)
      if (prevInfo) {
        debug('found duplicate snapshot name: %s', prevInfo.key)
        console.error(
          'Snapshot error was caused by the duplicate snapshot name'
        )
        throwDuplicateSnapshotKeyError(info, prevInfo)
      }
    }

    debug('not a snapshot key collision')
    throw e
  }

  return coreResult
}

/* eslint-disable immutable/no-mutation */
module.exports = snapshot
/* eslint-enable immutable/no-mutation */

global.after(function () {
  /* eslint-disable immutable/no-this */
  if (!hasFailed(this)) {
    debug('the test run was a success')
    la(
      is.fn(pruneSnapshots),
      'expected pruneSnapshots to be a function',
      pruneSnapshots
    )
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
