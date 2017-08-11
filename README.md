# snap-shot-it

> Smarter snapshot utility for Mocha and BDD test runners

[![NPM][npm-icon] ][npm-url]

[![Build status][ci-image] ][ci-url]
[![semantic-release][semantic-image] ][semantic-url]
[![js-standard-style][standard-image]][standard-url]

## Why

This tool makes [snapshot testing][snapshot testing] for Mocha (and other BDD)
frameworks quick and painless. This module spies on global `it` function,
which allows it to accurately get test information (beating static code parsing
done in [snap-shot][snap-shot]); it should work in transpiled code.

[snapshot testing]: https://glebbahmutov.com/blog/snapshot-testing/

## Install

Requires [Node](https://nodejs.org/en/) version 4 or above.

```sh
npm install --save-dev snap-shot-it
```

## Use

Example from [spec.js](src/spec.js)

```js
const snapshot = require('snap-shot-it')
describe('example', () => {
  it('works', () => {
    snapshot(add(10, 20))
    snapshot('a text message')
    return Promise.resolve(42).then(snapshot)
  })
})
```

Run Mocha tests, then open the created
[__snapshots__/spec.js](__snapshots__/spec.js) file

```js
exports['example works 1'] = 30

exports['example works 2'] = "a text message"

exports['example works 3'] = 42
```

Suppose you change the resolved value from `42` to `80`

```js
const snapshot = require('snap-shot-it')
describe('example', () => {
  it('works', () => {
    snapshot(add(10, 20))
    snapshot('a text message')
    return Promise.resolve(80).then(snapshot)
  })
})
```

The test will fail

```
1) example works:
   Error: 42 !== 80
```

The error message should intelligently handle numbers, objects, arrays,
multi-line text, etc.

## Advanced use

You can see the saves snapshot values by running with environment variable

```bash
SHOW=1 npm test
```

You can see snapshot values without writing them into the snapshot file

```bash
DRY=1 npm test
```

You can update snapshot values

```bash
UPDATE=1 npm test
```

## Debugging

Run with environment variable `DEBUG=snap-shot-it ...` to see log messages.
Because under the hood it uses [snap-shot-core][snap-shot-core] you might
want to show messages from both libraries with `DEBUG=snap-shot* ...`

## Inspiration

Came during WorkBar Cambridge Happy Hour on the terrace as I was thinking about
difficulty of adding CoffeeScript / TypeScript support to
[snap-shot][snap-shot] project. Got the idea of overriding `global.it` when
loading `snap-shot` because a day before I wrote [repeat-it][repeat-it]
which overrides it and it is very simple [repeat/src/index.js][repeat source].

[snap-shot]: https://github.com/bahmutov/snap-shot
[repeat-it]: https://github.com/bahmutov/repeat-it
[repeat source]: https://github.com/bahmutov/repeat-it/blob/master/src/index.js

### Small print

Author: Gleb Bahmutov &lt;gleb.bahmutov@gmail.com&gt; &copy; 2017

* [@bahmutov](https://twitter.com/bahmutov)
* [glebbahmutov.com](https://glebbahmutov.com)
* [blog](https://glebbahmutov.com/blog)

License: MIT - do anything with the code, but don't blame me if it does not work.

Support: if you find any problems with this module, email / tweet /
[open issue](https://github.com/bahmutov/snap-shot-it/issues) on Github

## MIT License

Copyright (c) 2017 Gleb Bahmutov &lt;gleb.bahmutov@gmail.com&gt;

Permission is hereby granted, free of charge, to any person
obtaining a copy of this software and associated documentation
files (the "Software"), to deal in the Software without
restriction, including without limitation the rights to use,
copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the
Software is furnished to do so, subject to the following
conditions:

The above copyright notice and this permission notice shall be
included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES
OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT
HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY,
WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR
OTHER DEALINGS IN THE SOFTWARE.

[npm-icon]: https://nodei.co/npm/snap-shot-it.svg?downloads=true
[npm-url]: https://npmjs.org/package/snap-shot-it
[ci-image]: https://travis-ci.org/bahmutov/snap-shot-it.svg?branch=master
[ci-url]: https://travis-ci.org/bahmutov/snap-shot-it
[semantic-image]: https://img.shields.io/badge/%20%20%F0%9F%93%A6%F0%9F%9A%80-semantic--release-e10079.svg
[semantic-url]: https://github.com/semantic-release/semantic-release
[standard-image]: https://img.shields.io/badge/code%20style-standard-brightgreen.svg
[standard-url]: http://standardjs.com/
