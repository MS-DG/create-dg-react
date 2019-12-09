'use strict';

const fs = require('fs');
const path = require('path');
const execSync = require('child_process').execSync;
const pkg = require('../../package.json');

/**
 *
 * @param {string} hook
 */
function getHookScript(hook) {
  return `
#!/bin/sh
#@dragongate/react-scripts ${pkg.version}
npm run ${hook} --if-present
`.trimLeft();
}
/**
 *
 * @param {string} gitDir
 * @param {string[]|undefined} hooks
 */
function createGitHooks(hooks) {
  hooks = hooks || ['pre-commit', 'pre-push', 'commit-msg'];
  console.log(`create git hooks ${hooks.join(',')}`);
  const gitDir = execSync('git rev-parse --absolute-git-dir')
    .toString()
    .trim();
  hooks.forEach(hook => {
    const script = getHookScript(hook);
    const filename = path.join(gitDir, 'hooks', hook);
    fs.writeFileSync(filename, script, {
      encoding: 'utf8',
      mode: '0775',
      flag: 'w',
    });
  });
}

module.exports = createGitHooks;
