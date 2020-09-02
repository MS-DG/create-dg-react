// @remove-file-on-eject
/**
 * Copyright (c) 2015-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
'use strict';

// Makes the script crash on unhandled rejections instead of silently
// ignoring them. In the future, promise rejections that are not handled will
// terminate the Node.js process with a non-zero exit code.
process.on('unhandledRejection', err => {
    throw err;
});
const chalk = require('react-dev-utils/chalk');
const execSync = require('child_process').execSync;
const createGitHooks = require('./utils/createGitHooks');

function isInGitRepository() {
    try {
        execSync('git rev-parse --is-inside-work-tree', { stdio: 'ignore' });
        return true;
    } catch (e) {
        return false;
    }
}


module.exports = function () {
    if (isInGitRepository()) {
        createGitHooks();
        console.log(chalk.green('git hooks are installed'));
    }
};