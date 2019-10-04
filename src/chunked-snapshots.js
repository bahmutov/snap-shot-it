function isChunkedSnapshotArguments (args) {
  return (
    args.length === 2 &&
    typeof args[0] === 'object' &&
    (args[0].title || args[0].chunk)
  )
}

// eslint-disable-next-line immutable/no-mutation
module.exports = { isChunkedSnapshotArguments }
