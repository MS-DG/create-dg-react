'use strict';

// format
// format .
// format --staged
// format --check

const fs = require('fs');
// const path = require('path');
const prettier = require('prettier');
const listStaged = require('./utils/listStaged');

let argv = process.argv.slice(2);
const isStaged =
  !argv.includes('--staged=false') &&
  (process.env.GIT_AUTHOR_DATE ||
    argv.find(a => a === 'staged' || a === '--staged'));

// use the same config for all files
const prettierOptions = prettier.resolveConfig.sync();
// todo concurrent;

let isFail = false;
if (isStaged) {
  listStaged().forEach(f => {
    const input = fs.readFileSync(f, 'utf8');
    if (!prettier.check(input, prettierOptions)) {
      console.error('prettier:[×] ', f);
      isFail = true;
    }
  });
}

if (isFail) {
  process.exit(1);
}
