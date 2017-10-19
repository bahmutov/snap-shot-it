const is = require('check-more-types')

const isNamedSnapshotArguments = args => args.length === 2 && is.string(args[0])

// eslint-disable-next-line immutable/no-mutation
module.exports = { isNamedSnapshotArguments }
