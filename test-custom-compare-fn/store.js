const debug = require('debug')('snap-shot-it')

const store = value => {
  // converts value before storing it on disk
  const transformed = value.replace(/./g, 'a')
  debug('original value: %s', value)
  debug('transformed: %s', transformed)
  return transformed
}

module.exports = store
