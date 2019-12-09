'use strict';

// format
// format .
// format --staged
// format --check

// const fs = require('fs');
const path = require('path');
const cp = require('child_process');
const prettier = require('prettier');
const eslint = require('eslint');

// const util = require('util');
const listStaged = require('./utils/listStaged');

let argv = process.argv.slice(2);
const isStaged =
  !argv.includes('--staged=false') &&
  (process.env.GIT_AUTHOR_DATE ||
    argv.find(a => a === 'staged' || a === '--staged'));

// use the same config for all files

// const prettierOptions = prettier.resolveConfig.sync(process.cwd());
// todo concurrent;
// warn as error;

const eslinter = new eslint.Linter();
function getStagedContent(f) {
  // return util.promisify(cp.exec)(`git show :"${f}"`).then(f => f.stdout);
  const buffer = cp.execSync(`git show :"${f}"`);
  return buffer.toString();
}

function prettierCheck(f, content) {
  const options = prettier.resolveConfig.sync(f);
  options.filepath = f;
  if (!prettier.check(content, options)) {
    console.error('prettier:[×] ', f);
    return false;
  }
  return true;
}

function lintCheck(file, content) {
  const ext = path.extname(file);
  if (['js', 'ts', 'jsx', 'tsx'].includes(ext)) {
    const errs = eslinter.verify(content, {
      filename: file,
    });
    if (errs && errs.length > 0) {
      console.error('eslint:[×] ', file);
      errs.forEach(msg =>
        console.error(`  ${msg.line},${msg.column}:`, msg.message, msg.ruleId)
      );
      return false;
    }
  }
  return true;
}

let isFail = false;
if (isStaged) {
  listStaged().forEach(f => {
    const content = getStagedContent(f);
    if (prettierCheck(f, content) && lintCheck(f, content)) {
      console.log('√', f);
    } else {
      isFail = true;
    }
  });
}

if (isFail) {
  console.error('lint staged fail, `npm run format` to autofix !');
  process.exit(1);
}
