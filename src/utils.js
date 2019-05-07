const fs = require('fs')
const path = require('path')
const R = require('ramda')
const debug = require('debug')('snap-shot-it')

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

module.exports = { getPackageConfigOptions, defaults, load, isPruningDisabled }
