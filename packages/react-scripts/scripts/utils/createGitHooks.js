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
  if (hook == 'pre-push') {
    return prePushHookScript.trim();
  }

  return `
#!/bin/sh
#${pkg.name} ${pkg.version}
npm run ${hook} --if-present --silent
`.trim();
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

const prePushHookScript = `
#!/bin/sh
#@dragongate/react-scripts 3.5.8

# get the jest argument: --changedSince=<remote-name>/<branch-name>
# Write to environment variable for decouple.
remote="$1"
url="$2"
currentBranchName=\`git branch --show-current\`
z40=0000000000000000000000000000000000000000
while read local_ref local_sha remote_ref remote_sha
do
	if [ "$local_sha" = $z40 ]
	then
		# Handle delete
		:
	else
		if [ "$remote_sha" = $z40 ]
		then
			# New branch, examine all commits
			range="$local_sha"
		else
			# Update to existing branch, examine new commits
			range="$remote_sha..$local_sha"
      changedSince="--changedSince=$remote/$currentBranchName"
		fi
	fi
done

export CHANGED_SINCE=$changedSince

npm run pre-push --if-present --silent
`;

module.exports = createGitHooks;
