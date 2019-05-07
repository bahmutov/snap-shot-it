const fs = require('fs')
const path = require('path')
const R = require('ramda')

const defaults = {
  useRelativePath: false
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

module.exports = { getPackageConfigOptions, defaults }
