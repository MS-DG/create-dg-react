'use strict';

const fs = require('fs');
const path = require('path');
const execSync = require('child_process').execSync;
const pkg = require('../../package.json');

const HOOKS = {
  'pre-commit': `
#!/bin/sh
#${pkg.name} ${pkg.version}

if [ ! "$(git diff --name-only --cached)" ];then
  echo "no staged files to commit"
  exit 1
fi

UNSTAGED_FILES=$(git ls-files -md)
if [ "$UNSTAGED_FILES" ];then
  # Stash unstaged changes, but keep the current index
  git stash push -q --keep-index --include-untracked -m "${pkg.name}@${pkg.version}:pre-commit"
fi

npm run pre-commit -s --if-present
RESULT=$?

# recover staged files
if [ "$UNSTAGED_FILES" ]; then
  # recover staged and unstaged files
  git stash push -q -m "original index"
  git stash apply -q --index stash@{1}
  git stash drop -q
  git stash drop -q
fi

exit $RESULT
`,
  'pre-push': `
#!/bin/sh
#${pkg.name} ${pkg.version}

CHNAGED_FILES=$(git status --porcelain)
if [ "$CHNAGED_FILES" ];then
  git stash save -q --include-untracked "${pkg.name}@${pkg.version}:pre-push"
fi

REMOTE="$1"
BRANCH=$(git rev-parse --abbrev-ref HEAD)
git show-branch remotes/$REMOTE/$BRANCH >/dev/null 2>/dev/null && export CHANGED_SINCE="$REMOTE/$BRANCH"

npm run pre-push --if-present --silent
RESULT=$?

if [ "$CHNAGED_FILES" ];then
  # recove without output
  $(git stash pop --index)
fi
exit $RESULT
`,
};

/**
 *
 * @param {string} hook
 */
function getHookScript(hook) {
  const script =
    HOOKS[hook] ||
    `
#!/bin/sh
#${pkg.name} ${pkg.version}
npm run ${hook} --if-present --silent
`;
  return script.trim();
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

// `
// #!/bin/sh
// #${pkg.name} ${pkg.version}

// # get the jest argument: --changedSince=<remote-name>/<branch-name>
// # Write to environment variable for decouple.
// remote="$1"
// url="$2"
// currentBranchName=\`git branch --show-current\`
// z40=0000000000000000000000000000000000000000
// while read local_ref local_sha remote_ref remote_sha
// do
// 	if [ "$local_sha" = $z40 ]
// 	then
// 		# Handle delete
// 		:
// 	else
// 		if [ "$remote_sha" = $z40 ]
// 		then
// 			# New branch, examine all commits
// 			range="$local_sha"
// 		else
// 			# Update to existing branch, examine new commits
// 			range="$remote_sha..$local_sha"
//       changedSince="$remote/$currentBranchName"
// 		fi
// 	fi
// done

// export CHANGED_SINCE=$changedSince

// npm run pre-push --if-present --silent

// `
module.exports = createGitHooks;
