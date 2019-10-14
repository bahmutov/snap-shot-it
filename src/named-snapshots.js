const is = require('check-more-types')

/**
 * If we called snapshot like `snapshot('name', value)`
 * or like `snapshot('name', value, options)` then this is
 * a named snapshot.
 */
function isNamedSnapshotArguments (args) {
  return (args.length === 2 || args.length === 3) && is.string(args[0])
}

// eslint-disable-next-line immutable/no-mutation
module.exports = { isNamedSnapshotArguments }
