const Result = require('folktale/result')
const debug = require('debug')('snap-shot-it')

const compare = ({ expected, value }) => {
  debug('in compaaaaare.js')

  // convert "expected" to string of same length, but with "a" characters
  const aaas = value.replace(/./g, 'a')
  debug('original value: %s', value)
  debug('aaas: %s', aaas)
  debug('expected value: %s', expected)

  if (aaas === value) {
    return Result.Ok()
  } else {
    return Result.Error({
      message: 'Hmm, not the same "aaaa..."',
      expected,
      value: aaas
    })
  }
}

module.exports = compare
