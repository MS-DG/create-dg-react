'use strict';

// format # 自动判断
// format . --fix
// format staged --check
// format . --check

// const fs = require('fs');
const path = require('path');
const cp = require('child_process');
const prettier = require('prettier');
const eslint = require('eslint');
const chalk = require('chalk').default;
// const util = require('util');
const listStaged = require('./utils/listStaged');

const argv = process.argv.slice(2);

const isFix = argv.indexOf('--fix') !== -1;

// 是否查询staged
// format  # 环境变量 GIT_AUTHOR_DATE 存在
// format --check # 环境变量 GIT_AUTHOR_DATE 存在
// format staged
const isStaged =
  argv[0] === 'staged' ||
  (process.env.GIT_AUTHOR_DATE && (argv.length === 0 || argv[0] === '--check'));

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
    console.error(`prettier:${chalk.red('[×]')}`, chalk.bold(f));
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
      console.error(`eslint:${chalk.red('[×]')}`, file);
      errs.forEach(msg =>
        console.error(
          chalk.bold(`  ${msg.line},${msg.column}:`),
          chalk.red(msg.message),
          msg.ruleId || msg.fatal
        )
      );
      return false;
    }
  }
  return true;
}

function run() {
  let isFail = false;
  if (isFix) {
    //
  } else if (isStaged) {
    listStaged().forEach(f => {
      const content = getStagedContent(f);
      if (prettierCheck(f, content) && lintCheck(f, content)) {
        console.log(chalk.green('√'), chalk.gray.dim(f));
      } else {
        isFail = true;
      }
    });
  }
  return !isFail;
}

if (run()) {
  console.error(`
staged files format check fail!
Try ${chalk.bold.cyan('npm run format')} to autofix them
`);
  process.exit(1);
}
