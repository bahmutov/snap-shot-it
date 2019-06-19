const fs = require('fs')
const path = require('path')
const R = require('ramda')
const la = require('lazy-ass')
const is = require('check-more-types')
const debug = require('debug')('snap-shot-it')
const { commaLists } = require('common-tags')

const defaults = {
  useRelativePath: false,
  'pre-compare': null,
  compare: null,
  store: null,
  sortSnapshots: false
}
/**
 * Pick only the keys we know about from whatever the user
 * specified in the object in the package.json file.
 */
const pickKnownKeys = R.pick(R.keys(defaults))

const getPackageConfigOptions = cwd => {
  const filename = path.join(cwd, 'package.json')
  if (!fs.existsSync(filename)) {
    return defaults
  }

  const pkg = require(filename)
  if (!pkg.config) {
    return defaults
  }

  const options = pkg.config['snap-shot-it']
  if (!options) {
    return defaults
  }

  return pickKnownKeys(options)
}

const load = (cwd, modulePath) => {
  debug('loading module %s from cwd %s', modulePath, cwd)
  if (!path.isAbsolute(modulePath)) {
    const resolved = path.resolve(cwd, modulePath)
    debug('resolved path: %s', resolved)
    return require(resolved)
  } else {
    debug('trying to load NPM module %s', modulePath)
    return require(modulePath)
  }
}

const isPruningDisabled = () => {
  return (
    Boolean(process.env.SNAPSHOT_SKIP_PRUNING) ||
    Boolean(process.env.SNAPSHOT_SKIP_PRUNE) ||
    Boolean(process.env.SNAPSHOT_NO_PRUNING) ||
    Boolean(process.env.SNAPSHOT_NO_PRUNE) ||
    Boolean(process.env.SNAPSHOT_STOP_PRUNING) ||
    Boolean(process.env.SNAPSHOT_STOP_PRUNE)
  )
}

/**
 * Merges all default configuration options with config specified in the package.json
 * and with config options extracted from the environment variables.
 *
 * Note: will throw an error if the package options or environment options
 * have keys NOT listed in the defaults.
 */
const mergeConfigOptions = (defaults, packageOptions, envOptions) => {
  la(is.object(defaults), 'expected defaults to be an object', defaults)
  la(
    is.object(packageOptions),
    'expected package config options to be an object',
    packageOptions
  )
  la(is.object(envOptions), 'expected env options to be an object', envOptions)

  const defaultKeys = R.keys(defaults)
  const newKeys = R.uniq(R.concat(R.keys(packageOptions), R.keys(envOptions)))
  const unknownKeys = R.difference(newKeys, defaultKeys)
  if (unknownKeys.length) {
    debug('default options specifies keys %o', defaultKeys)
    debug('package options keys %o', R.keys(packageOptions))
    debug('environment options keys %o', R.keys(envOptions))
    debug('options not listed in defaults: %o', unknownKeys)
    throw new Error(commaLists`
      Found unknown snap-shot-it configuration options: ${unknownKeys}
    `)
  }

  const merged = R.mergeAll([defaults, packageOptions, envOptions])
  return merged
}

module.exports = {
  getPackageConfigOptions,
  defaults,
  load,
  isPruningDisabled,
  mergeConfigOptions
}
