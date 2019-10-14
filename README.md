[![TODO board](https://imdone.io/api/1.0/projects/5b1adecc1883d42a1fbf805d/badge)](https://imdone.io/app#/board/bahmutov/snap-shot-it)

# snap-shot-it

> Smarter snapshot utility for Mocha and BDD test runners + data-driven testing!

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

This package uses [snap-shot-compare](https://github.com/bahmutov/snap-shot-compare)
to display object and text difference intelligently.

This function also includes [data-driven][data-driven] testing mode,
similar to [sazerac][sazerac], see [Data-driven testing](#data-driven-testing)
section below.

[data-driven]: https://hackernoon.com/sazerac-data-driven-testing-for-javascript-e3408ac29d8c#.9s4ikt67d
[sazerac]: https://github.com/mikec/sazerac

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

## Returned value

The returned value includes saved value (after any transformations) and saved snapshot name. Usually it is spec name + index, or could be exact name

```js
const out = snapshot('my name', 42)
// {value: 42, key: 'my name'}
```

## Advanced use

You can see the saves snapshot values by running with environment variable

```bash
SNAPSHOT_SHOW=1 npm test
```

You can see snapshot values without writing them into the snapshot file

```bash
SNAPSHOT_DRY=1 npm test
```

You can update snapshot values

```bash
SNAPSHOT_UPDATE=1 npm test
```

You can use the following aliases: `SNAPSHOT_UPDATE=1`, `SNAPSHOTS_UPDATE=1` or `SNAP_SHOT_UPDATE=1`.

## Sorted snapshots

If you want to sort saved snapshots alphabetically inside each snapshot file, run with

```bash
SNAPSHOT_SORT=1 npm test
```

You can also set the config option in the package.json file

```json
{
  "config": {
    "snap-shot-it": {
      "sortSnapshots": true
    }
  }
}
```

Hopefully sorting snapshots would help when updating them.

## Named snapshots

Renaming tests might lead to confusion and pruning snapshots. You can name the snapshots
yourself

```js
const value = 42
snapshot('my name', value)
```

The snapshots will be saved as

```js
exports['my name'] = 42
```

**Note** you should make sure that the name is unique per spec file.

### Shared snapshot name

If you **do want** to share a named snapshot value from several places or tests in the same spec file, you need to pass an option when calling `snapshot`. The the first snapshot is saved, and the next ones will just compare against the value.

```js
snapshot('my shared snapshot', value, { allowSharedSnapshot : true })
// some time later
snapshot('my shared snapshot', value, { allowSharedSnapshot : true })
```

## Pruning

If the test run is successful and executed _all_ tests (there was no `.only`) then snapshots without a test are pruned. You can skip pruning by running with environment variable

```bash
SNAPSHOT_SKIP_PRUNING=1 npm test
```

## Data-driven testing

Writing multiple input / output pairs for a function under test quickly
becomes tedious. Luckily, you can test a function by providing multiple
inputs and a single snapshot of function's *behavior* will be saved.

```js
// checks if n is prime
const isPrime = n => ...
it('tests prime', () => {
  snapshot(isPrime, 1, 2, 3, 4, 5, 6, 7, 8, 9)
})
```

The saved snapshot file will have clear mapping between given input and
produced result

```js
// snapshot file
exports['tests prime 1'] = {
  "name": "isPrime",
  "behavior": [
    {
      "given": 1,
      "expect": false
    },
    {
      "given": 2,
      "expect": true
    },
    {
      "given": 3,
      "expect": true
    },
    {
      "given": 4,
      "expect": false
    },
    {
      "given": 5,
      "expect": true
    },
    ...
  ]
}
```

You can also test functions that expect multiple arguments by providing
arrays of inputs.

```js
const add = (a, b) => a + b
it('checks behavior of binary function add', () => {
  snapshot(add, [1, 2], [2, 2], [-5, 5], [10, 11])
})
```

Again, the snapshot file gives clear picture of the `add` behavior

```js
// snapshot file
exports['checks behavior of binary function add 1'] = {
  "name": "add",
  "behavior": [
    {
      "given": [
        1,
        2
      ],
      "expect": 3
    },
    {
      "given": [
        2,
        2
      ],
      "expect": 4
    },
    {
      "given": [
        -5,
        5
      ],
      "expect": 0
    },
    {
      "given": [
        10,
        11
      ],
      "expect": 21
    }
  ]
}
```

See [src/data-driven-spec.js](src/data-driven-spec.js) for more examples.

## Debugging

Run with environment variable `DEBUG=snap-shot-it ...` to see log messages.
Because under the hood it uses [snap-shot-core][snap-shot-core] you might
want to show messages from both libraries with `DEBUG=snap-shot* ...`

## Data callbacks

You can pass your own NPM modules as `pre-compare`, `compare` and `store` functions using `package.json`. For example, to use both local and 3rd party NPM modules

```json
{
  "config": {
    "snap-shot-it": {
      "pre-compare": "./pre-compare",
      "compare": "snap-shot-compare",
      "store": "./store"
    }
  }
}
```

Each NPM module in this case should export a definition of a function that matches the expected core function

- `pre-compare` is simply an identity or transformation function
- `compare` should match [snap-shot-core#compare-function](https://github.com/bahmutov/snap-shot-core#compare-function), for example see [snap-shot-compare](https://github.com/bahmutov/snap-shot-compare)
- `store` is another identity or transformation function, see [snap-shot-core#store-function](https://github.com/bahmutov/snap-shot-core#store-function)

## Nested snapshots

By default, all snapshots are stored in the same folder `__snapshots__`, which can lead to name clashes. You can set an option in your package.json file to create a nested folder structure inside `__snapshots__` folder that mimics the spec structure. Use `config > snap-shot-it` object in the package.json file.

```json
{
  "config": {
    "snap-shot-it": {
      "useRelativePath": true
    }
  }
}
```

input spec files

```
specs/
  spec.js
  subfolder/
    spec2.js
```

result should be

```
__snapshots__/
  specs/
    spec.js
    subfolder/
      spec2.js
```

## Examples

### TypeScript

An example using [ts-mocha](https://github.com/piotrwitek/ts-mocha) is
shown in folder [ts-demo](ts-demo)

### CoffeeScript

CoffeeScript example is in [coffee-demo](coffee-demo) folder. Watch mode is
working properly.

## Inspiration

Came during WorkBar Cambridge Happy Hour on the terrace as I was thinking about
difficulty of adding CoffeeScript / TypeScript support to
[snap-shot][snap-shot] project. Got the idea of overriding `global.it` when
loading `snap-shot` because a day before I wrote [repeat-it][repeat-it]
which overrides it and it is very simple [repeat/src/index.js][repeat source].

[snap-shot]: https://github.com/bahmutov/snap-shot
[repeat-it]: https://github.com/bahmutov/repeat-it
[repeat source]: https://github.com/bahmutov/repeat-it/blob/master/src/index.js

## Related projects

This NPM module is part of my experiments with snapshot testing. There are
lots of other ones, blog posts and slides on this topic.

* [snap-shot-core][snap-shot-core] implements loading and saving snapshots
* [snap-shot](https://github.com/bahmutov/snap-shot) is an alternative to this
  package that tries to determine spec name using stack trace and static
  source code parsing. Hard to do for transpiled code!
* [schema-shot](https://github.com/bahmutov/schema-shot) is
  "schema by example" snapshot testing
* [subset-shot](https://github.com/bahmutov/subset-shot)
  where new value can be a superset of the saved snapshot
* Blog post [Picking snapshot library](https://glebbahmutov.com/blog/picking-snapshot-library/)
* Slides [Snapshot testing the hard way](https://slides.com/bahmutov/snapshot-testing-the-hard-way)

[snap-shot-core]: https://github.com/bahmutov/snap-shot-core

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
