#!/usr/bin/env node
/**
 * Copyright (c) 2015-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

'use strict';

const cprocess = require('child_process');
const fse = require('fs-extra');
const os = require('os');
const path = require('path');

const temp = path.join(os.tmpdir(), `cra-compile-lockfile`);

try {
  // Ensures that we start from a clean state
  fse.removeSync(temp);
  fse.mkdirSync(temp);

  // Create an empty package.json that we'll populate
  fse.writeFileSync(path.join(temp, 'package.json'), '{}');

  // Extract the dependencies from react-scripts (which is a workspace)
  const dependencies = require('@dragongate/react-scripts/package.json')
    .dependencies;
  const descriptors = Object.keys(dependencies).map(
    dep => `${dep}@${dependencies[dep]}`
  );

  // Run "yarn add" with all the dependencies of react-scripts
  cprocess.execFileSync(
    /^win/.test(process.platform) ? 'yarn.cmd' : 'yarn',
    ['add', ...descriptors],
    { cwd: temp, stdio: 'inherit' }
  );

  // Store the generated lockfile in create-react-app
  // We can't store it inside react-scripts, because we need it even before react-scripts is installed
  const lockfile = path.join(
    __dirname,
    '..',
    'packages',
    'create-react-app',
    'yarn.lock.cached'
  );
  fse.copySync(path.join(temp, 'yarn.lock'), lockfile);
} catch (err) {
  console.error(err);
  process.exit(1);
} finally {
  fse.removeSync(temp);
}
