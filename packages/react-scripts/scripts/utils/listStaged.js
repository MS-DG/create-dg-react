'use strict';

const execSync = require('child_process').execSync;

function listStaged() {
  return execSync('git diff --name-only --cached --diff-filter=ACMRTUB')
    .toString()
    .split('\n')
    .map(s => s.trim())
    .filter(Boolean);
}

// 'ls-files', '--others', '--exclude-standard'
// git ls-files -o --exclude-standard

module.exports = listStaged;
