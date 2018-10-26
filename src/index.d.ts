declare namespace snapshot {
  // This is necessary, or TS will consider this to be a "non-module entity"
}
/**
 * Saves any value (except for undefined or nulls) in a snapshot file.
 * If the value with matching name already exists, and the new value is
 * different, throws an error.
 *
 * @see https://github.com/bahmutov/snap-shot-it#use
 * @example
 *
  ```
  const snapshot = require('snap-shot-it')
  describe('example', () => {
    it('works', () => {
      snapshot(add(10, 20))
      snapshot('a text message')
      return Promise.resolve(42).then(snapshot)
    })
  })

  // expected snapshot file
  exports['example works 1'] = 30
  exports['example works 2'] = "a text message"
  exports['example works 3'] = 42
  ```
 */

declare function snapshot(value: {}): void;
/**
 * Saves value using given name, instead of computing the name from
 * the test title and snapshot index.
 *
 * @see https://github.com/bahmutov/snap-shot-it#named-snapshots
 * @example
 *
  ```
  const snapshot = require('snap-shot-it')
  const value = 42
  snapshot('my name', value)
  // expected snapshot file
  exports['my name'] = 42
  ```

 * **Note:** you should make sure that the name is unique per spec file.
 */
declare function snapshot(name: string, value: {}): void;

/**
 * Data-driven testing. Pass a single unary function and multiple arguments,
 * and function will be called with each argument separately, then results will
 * be stored as a snapshot.
 *
 * @see https://github.com/bahmutov/snap-shot-it#data-driven-testing
 * @example
 *
  ```
  // checks if n is prime
  const isPrime = n => ...
  it('tests prime', () => {
    snapshot(isPrime, 1, 2, 3, 4, 5, 6, 7, 8, 9)
  })
  // expected snapshot file
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
 */
declare function snapshot<T>(fn: (arg: T) => any, ...fnArgs: T[]): void;
/**
 * Data-driven testing for a function with multiple arguments.
 * @see https://github.com/bahmutov/snap-shot-it#data-driven-testing
 * @example
  ```
  const add = (a, b) => a + b
  it('checks behavior of binary function add', () => {
    snapshot(add, [1, 2], [2, 2], [-5, 5], [10, 11])
  })
  // expected snapshot
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
 */
declare function snapshot<T extends any[]>(
  fn: (...args: T) => any,
  ...fnArgs: T[]
): void;

export = snapshot;
