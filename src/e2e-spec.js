const shell = require('shelljs')
const { join } = require('path')
const la = require('lazy-ass')
const fs = require('fs')
const R = require('ramda')
const execa = require('execa')
const { stripIndent } = require('common-tags')

/* eslint-env mocha */
/**
 * Checks a given folder against expected snapshots.
 * Pass a root folder without `__snapshots__` part,
 * and an object containing as keys
 * just names of the expected snapshot files. For value,
 * use object of exports in that snapshot
 *
 * @example
```
checkSnapshots(tempFolder, {
  'spec.js.snapshot.js': {
    'a 1': 42
  },
  'spec2.js.snapshot.js': {
    'b 1': 42
  }
})
```
 */
const checkSnapshots = (rootFolder, snapshots) => {
  const snapshotsFolder = join(rootFolder, '__snapshots__')
  la(
    fs.existsSync(snapshotsFolder),
    'cannot find snapshots folder',
    snapshotsFolder
  )
  // TODO check if the snapshots folder does not have extra files id:15
  // - <https://github.com/bahmutov/snap-shot-core/issues/244>
  // Gleb Bahmutov
  // gleb.bahmutov@gmail.com
  Object.keys(snapshots).forEach(expectedFilename => {
    const filename = join(snapshotsFolder, expectedFilename)
    la(
      fs.existsSync(filename),
      'cannot find expected snapshot',
      expectedFilename,
      'as file',
      filename
    )
    // important: remove the loaded module from the cache to
    // avoid a test using old data
    const loaded = require(filename)
    delete require.cache[require.resolve(filename)]

    const expected = snapshots[expectedFilename]
    // compare the values
    la(
      R.equals(loaded, expected),
      'in snapshot file',
      filename,
      'a different value loaded',
      loaded,
      'from expected',
      expected
    )
    // compare the order of snapshots
    const savedOrder = Object.keys(loaded)
    const expectedOrder = Object.keys(expected)
    la(
      R.equals(savedOrder, expectedOrder),
      'in snapshot file',
      filename,
      'the order of snapshots is',
      savedOrder,
      'but expected order of snapshots to be',
      expectedOrder
    )
  })
}

/**
 * if we are running this test on CI, we cannot save new snapshots
 * so for this particular test we need to clear CI=1 value
 * we remove any of the env variables used by "ci-info" module to detect
 * that it is running on CI
 * @example
  ```js
  execa.shellSync('npm test', {
    stdio: 'inherit',
    env: limitedEnv,
    extendEnv: false
  })
  ```
 */
const limitedEnv = R.omit(
  ['CI', 'CONTINUOUS_INTEGRATION', 'BUILD_NUMBER', 'RUN_ID', 'TRAVIS'],
  process.env
)

/**
 * Copies "package.json" file and "specs" folder from source folder
 * to newly recreated temp folder.
 */
const copyFolder = (sourceFolder, tempFolder) => {
  shell.rm('-rf', tempFolder)
  shell.mkdir(tempFolder)
  shell.cp(join(sourceFolder, 'package.json'), tempFolder)
  shell.cp(join(sourceFolder, '*.js'), tempFolder)
  shell.cp('-R', join(sourceFolder, 'specs'), tempFolder)
}

describe('snapshots in subfolders', () => {
  // snapshots are saved in subfolders like the spec files

  // folder with specs to run
  const sourceFolder = join(__dirname, '..', 'test-subfolders-specs')
  // temp folder to copy to before running tests
  const tempFolder = join(__dirname, '..', 'temp-test-subfolders-specs')

  beforeEach(() => {
    copyFolder(sourceFolder, tempFolder)
  })

  it('saves snapshots in subfolders', function () {
    this.timeout(5000)

    execa.shellSync('npm test', {
      cwd: tempFolder,
      stdio: 'inherit',
      // only use the limited environment keys
      // without "CI=1" value
      env: limitedEnv,
      extendEnv: false
    })

    checkSnapshots(tempFolder, {
      'specs/spec.js': {
        'a 1': 42
      },
      'specs/subfolder/spec2.js': {
        'b 1': 50
      }
    })

    // run the tests again to check if values are not clashing
    // but with CI=1 to avoid writing new files accidentally
    execa.shellSync('npm test', {
      cwd: tempFolder,
      stdio: 'inherit',
      env: { CI: '1' }
    })
  })
})

describe('snapshots in same folder', () => {
  // folder with specs to run
  const sourceFolder = join(__dirname, '..', 'test-flat-specs')
  // temp folder to copy to before running tests
  const tempFolder = join(__dirname, '..', 'temp-test-flat-specs')

  beforeEach(() => {
    copyFolder(sourceFolder, tempFolder)
  })

  it('saves all snapshots in same folder', function () {
    this.timeout(5000)

    execa.shellSync('npm test', {
      cwd: tempFolder,
      stdio: 'inherit',
      // only use the limited environment keys
      // without "CI=1" value
      env: limitedEnv,
      extendEnv: false
    })

    checkSnapshots(tempFolder, {
      'spec.js': {
        'a 1': 42
      },
      'spec2.js': {
        'b 1': 50
      }
    })

    // run the tests again to check if values are not clashing
    // but with CI=1 to avoid writing new files accidentally
    execa.shellSync('npm test', {
      cwd: tempFolder,
      stdio: 'inherit',
      env: { CI: '1' }
    })
  })
})

describe('custom compare function', () => {
  // folder with specs to run
  const sourceFolder = join(__dirname, '..', 'test-custom-compare-fn')
  // temp folder to copy to before running tests
  const tempFolder = join(__dirname, '..', 'temp-custom-compare-fn')

  beforeEach(() => {
    copyFolder(sourceFolder, tempFolder)
  })

  it('transforms value ', function () {
    this.timeout(5000)

    execa.shellSync('npm test', {
      cwd: tempFolder,
      stdio: 'inherit',
      // only use the limited environment keys
      // without "CI=1" value
      env: limitedEnv,
      extendEnv: false
    })

    checkSnapshots(tempFolder, {
      'spec.js': {
        'random string as 10 As 1': '\naaaaaaaaaa\n'
      }
    })

    // run the tests again to check if values are not clashing
    // but with CI=1 to avoid writing new files accidentally
    execa.shellSync('npm test', {
      cwd: tempFolder,
      stdio: 'inherit',
      env: { CI: '1' }
    })
  })
})

describe('custom pre-compare function', () => {
  // folder with specs to run
  const sourceFolder = join(__dirname, '..', 'test-custom-pre-fn')
  // temp folder to copy to before running tests
  const tempFolder = join(__dirname, '..', 'temp-custom-pre-fn')

  beforeEach(() => {
    copyFolder(sourceFolder, tempFolder)
  })

  it('transforms value before comparison', function () {
    this.timeout(5000)

    execa.shellSync('npm test', {
      cwd: tempFolder,
      stdio: 'inherit',
      // only use the limited environment keys
      // without "CI=1" value
      env: limitedEnv,
      extendEnv: false
    })

    checkSnapshots(tempFolder, {
      'spec.js': {
        'stores string as number 1': 5,
        'stores string as number 2': 3
      }
    })

    // run the tests again to check if values are not clashing
    // but with CI=1 to avoid writing new files accidentally
    execa.shellSync('npm test', {
      cwd: tempFolder,
      stdio: 'inherit',
      env: { CI: '1' }
    })
  })
})

describe('sorted snapshots', () => {
  // folder with specs to run
  const sourceFolder = join(__dirname, '..', 'test-sorting')
  // temp folder to copy to before running tests
  const tempFolder = join(__dirname, '..', 'temp-sorting')

  beforeEach(() => {
    copyFolder(sourceFolder, tempFolder)
  })

  it('does not sort by default', function () {
    this.timeout(5000)

    execa.shellSync('npm test', {
      cwd: tempFolder,
      stdio: 'inherit',
      // only use the limited environment keys
      // without "CI=1" value
      env: limitedEnv,
      extendEnv: false
    })

    checkSnapshots(tempFolder, {
      'spec.js': {
        zz: 3,
        bb: 2,
        aa: 1
      }
    })

    // run the tests again to check if values are not clashing
    // but with CI=1 to avoid writing new files accidentally
    execa.shellSync('npm test', {
      cwd: tempFolder,
      stdio: 'inherit',
      env: { CI: '1' }
    })
  })

  it('sorts with config parameter', function () {
    this.timeout(5000)

    const packageFilename = join(tempFolder, 'package.json')
    const pkg = JSON.parse(fs.readFileSync(packageFilename, 'utf8'))
    pkg.config['snap-shot-it'] = {
      sortSnapshots: true
    }
    fs.writeFileSync(packageFilename, JSON.stringify(pkg, null, 2), 'utf8')

    execa.shellSync('npm test', {
      cwd: tempFolder,
      stdio: 'inherit',
      // only use the limited environment keys
      // without "CI=1" value
      env: limitedEnv,
      extendEnv: false
    })

    // now the snapshots should be sorted
    checkSnapshots(tempFolder, {
      'spec.js': {
        aa: 1,
        bb: 2,
        zz: 3
      }
    })

    // run the tests again to check if values are not clashing
    // but with CI=1 to avoid writing new files accidentally
    execa.shellSync('npm test', {
      cwd: tempFolder,
      stdio: 'inherit',
      env: { CI: '1' }
    })
  })
})

describe('no sorting when pruning', () => {
  // folder with specs to run
  const sourceFolder = join(__dirname, '..', 'test-pruning')
  // temp folder to copy to before running tests
  const tempFolder = join(__dirname, '..', 'temp-pruning')

  beforeEach(() => {
    copyFolder(sourceFolder, tempFolder)
  })

  it('does not sort snapshots when pruning', function () {
    this.timeout(10000)

    // first, creates the snapshot
    execa.shellSync('npm test', {
      cwd: tempFolder,
      stdio: 'inherit',
      // only use the limited environment keys
      // without "CI=1" value
      env: limitedEnv,
      extendEnv: false
    })

    // note that the saved snapshots are NOT sorted
    checkSnapshots(tempFolder, {
      'spec.js': {
        zz: 3,
        bb: 2,
        aa: 1
      }
    })

    // now run again, but disable middle snapshot
    const specFilename = join(tempFolder, 'specs', 'spec.js')
    console.log('updating spec file', specFilename)

    const withoutMiddleSnapshot = stripIndent`
      const snapshot = require('../..')

      /* eslint-env mocha */
      it('has names in reverse order', () => {
        // notice that snapshots are named NOT in sorted order
        snapshot('zz', 3)
        // disable middle snapshot
        // snapshot('bb', 2)
        snapshot('aa', 1)
      })
    `
    fs.writeFileSync(specFilename, withoutMiddleSnapshot + '\n')

    // run tests again and the snapshot should be pruned but keep same order of snapshots
    execa.shellSync('npm test', {
      cwd: tempFolder,
      stdio: 'inherit',
      // only use the limited environment keys
      // without "CI=1" value
      env: limitedEnv,
      extendEnv: false
    })

    checkSnapshots(tempFolder, {
      'spec.js': {
        zz: 3,
        aa: 1
      }
    })
  })
})

describe('updating snapshots', () => {
  // folder with specs to run
  const sourceFolder = join(__dirname, '..', 'test-updating')
  // temp folder to copy to before running tests
  const tempFolder = join(__dirname, '..', 'temp-updating')

  beforeEach(() => {
    copyFolder(sourceFolder, tempFolder)
  })

  it('updates snapshot with SNAPSHOT_UPDATE=1', function () {
    this.timeout(10000)

    // first, creates the snapshot
    execa.shellSync('npm test', {
      cwd: tempFolder,
      stdio: 'inherit',
      // only use the limited environment keys
      // without "CI=1" value
      env: limitedEnv,
      extendEnv: false
    })

    checkSnapshots(tempFolder, {
      'spec.js': {
        'my value': 42
      }
    })

    // now run again, but update the snapshot value
    const specFilename = join(tempFolder, 'specs', 'spec.js')
    console.log('updating spec file', specFilename)

    const newSpec = stripIndent`
      const snapshot = require('../..')

      /* eslint-env mocha */
      it('has single value', () => {
        snapshot('my value', 198)
      })
    `
    fs.writeFileSync(specFilename, newSpec + '\n')

    // run tests again and the snapshot should be updated
    execa.shellSync('npm test', {
      cwd: tempFolder,
      stdio: 'inherit',
      // only use the limited environment keys
      // without "CI=1" value
      env: R.mergeRight(limitedEnv, { SNAPSHOT_UPDATE: '1' }),
      extendEnv: false
    })

    checkSnapshots(tempFolder, {
      'spec.js': {
        'my value': 198
      }
    })
  })
})
