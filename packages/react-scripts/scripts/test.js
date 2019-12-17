// @remove-on-eject-begin
/**
 * Copyright (c) 2015-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
// @remove-on-eject-end
'use strict';

// Do this as the first thing so that any code reading it knows the right env.
process.env.BABEL_ENV = 'test';
process.env.NODE_ENV = 'test';
process.env.PUBLIC_URL = '';

// Makes the script crash on unhandled rejections instead of silently
// ignoring them. In the future, promise rejections that are not handled will
// terminate the Node.js process with a non-zero exit code.
process.on('unhandledRejection', err => {
  throw err;
});

// Ensure environment variables are read.
require('../config/env');
// @remove-on-eject-begin
// Do the preflight check (only happens before eject).
const verifyPackageTree = require('./utils/verifyPackageTree');
if (process.env.SKIP_PREFLIGHT_CHECK !== 'true') {
  verifyPackageTree();
}
const verifyTypeScriptSetup = require('./utils/verifyTypeScriptSetup');
verifyTypeScriptSetup();
// @remove-on-eject-end

const jest = require('jest');
const execSync = require('child_process').execSync;
let argv = process.argv.slice(2);

// for git staged
// test staged
// test --staged
// test --staged=false
const staged =
  !argv.includes('--staged=false') &&
  (process.env.GIT_AUTHOR_DATE ||
    argv.find(a => a === 'staged' || a === '--staged'));
// Check test run stage: pre-commit/pre-push/post-build
const testStage = (args => {
  for (let arg of args) {
    if (arg.startsWith('--teststage=')) {
      return arg.substring(12);
    }
  }
})(argv);
const testStageArg = (testStage => {
  if (testStage == 'pre-commit') {
    console.log('run pre-commit test...');
    return [
      'nowatch',
      '--testmatch=test',
      '--changedSince=HEAD',
      '--passWithNoTests',
      '--verbose',
    ];
  } else if (testStage == 'pre-push') {
    console.log('run pre-push test...');
    let params = [
      'nowatch',
      '--testmatch=test',
      '--testmatch=integration',
      '--passWithNoTests',
      '--verbose',
    ];
    if (process.env.CHANGED_SINCE) {
      params.push(`--changedSince=${process.env.CHANGED_SINCE}`);
    }
    return params;
  } else if (testStage == 'post-build') {
    console.log('run post-build test...');
    return [
      'nowatch',
      '--testmatch=test',
      '--testmatch=integration',
      '--passWithNoTests',
      '--verbose',
      '--coverage',
    ];
  }

})(testStage);
if (testStageArg) {argv = argv.concat(testStageArg);}

// run without watch
const nowatch =
  argv.includes('--nowatch=false') ||
  argv.find(a => a === 'nowatch' || a === '--nowatch');
// specify test files: --testmatch=test, use multiple pairs to specify multiple matches.
const testMatchDefault = 'test,';
const testMatchArg = (args => {
  let result = [];
  args.forEach(arg => {
    if (arg.startsWith('--testmatch=')) {
      result.push(arg.substring(12));
    }
  });
  return result;
})(argv);
const testMatch =
  testMatchArg.length > 0
    ? testMatchArg.join(',').concat(',')
    : testMatchDefault;

function isInGitRepository() {
  try {
    execSync('git rev-parse --is-inside-work-tree', { stdio: 'ignore' });
    return true;
  } catch (e) {
    return false;
  }
}

function isInMercurialRepository() {
  try {
    execSync('hg --cwd . root', { stdio: 'ignore' });
    return true;
  } catch (e) {
    return false;
  }
}

// Watch unless on CI or explicitly running all tests
if (
  !nowatch &&
  !process.env.CI &&
  !staged &&
  argv.indexOf('--watchAll') === -1 &&
  argv.indexOf('--watchAll=false') === -1
) {
  // https://github.com/facebook/create-react-app/issues/5210
  const hasSourceControl = isInGitRepository() || isInMercurialRepository();
  argv.push(hasSourceControl ? '--watch' : '--watchAll');
}

// @remove-on-eject-begin
// This is not necessary after eject because we embed config into package.json.
const createJestConfig = require('./utils/createJestConfig');
const path = require('path');
const paths = require('../config/paths');
argv.push(
  '--config',
  JSON.stringify(
    createJestConfig(
      relativePath => path.resolve(__dirname, '..', relativePath),
      path.resolve(paths.appSrc, '..'),
      false,
      testMatch
    )
  )
);

// This is a very dirty workaround for https://github.com/facebook/jest/issues/5913.
// We're trying to resolve the environment ourselves because Jest does it incorrectly.
// TODO: remove this as soon as it's fixed in Jest.
const resolve = require('resolve');
function resolveJestDefaultEnvironment(name) {
  const jestDir = path.dirname(
    resolve.sync('jest', {
      basedir: __dirname,
    })
  );
  const jestCLIDir = path.dirname(
    resolve.sync('jest-cli', {
      basedir: jestDir,
    })
  );
  const jestConfigDir = path.dirname(
    resolve.sync('jest-config', {
      basedir: jestCLIDir,
    })
  );
  return resolve.sync(name, {
    basedir: jestConfigDir,
  });
}
let cleanArgv = [];
let env = 'jsdom';
let next;
do {
  next = argv.shift();
  if (
    next.startsWith('nowatch') ||
    next.startsWith('--testmatch=') ||
    next.startsWith('--teststage=')
  ) {
    // Skip our customized arguments
  } else if (next === '--env') {
    env = argv.shift();
  } else if (next.indexOf('--env=') === 0) {
    env = next.substring('--env='.length);
  } else {
    cleanArgv.push(next);
  }
} while (argv.length > 0);
argv = cleanArgv;
let resolvedEnv;
try {
  resolvedEnv = resolveJestDefaultEnvironment(`jest-environment-${env}`);
} catch (e) {
  // ignore
}
if (!resolvedEnv) {
  try {
    resolvedEnv = resolveJestDefaultEnvironment(env);
  } catch (e) {
    // ignore
  }
}
const testEnvironment = resolvedEnv || env;
argv.push('--env', testEnvironment);

// git stash before we run test.
let needPop = false;
const buffer = execSync('git stash save --keep-index --include-untracked');
if (buffer.toString().startsWith('Saved working directory')) {needPop = true;}

// Run test
// @remove-on-eject-end
jest.run(argv).then(() => {
  if (needPop) {execSync('git stash pop', { stdio: 'ignore' });}
});
