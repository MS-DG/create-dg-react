'use strict';

const execSync = require('child_process').execSync;

function listStaged(remote) {
  return execSync(
    `git diff ${remote || '--cached'} --name-only --diff-filter=ACMRTUB`
  )
    .toString()
    .split('\n')
    .map(s => s.trim())
    .filter(Boolean);
}

// 'ls-files', '--others', '--exclude-standard'
// git ls-files -o --exclude-standard

module.exports = listStaged;
