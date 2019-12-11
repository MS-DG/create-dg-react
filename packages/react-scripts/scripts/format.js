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
// const chalk = require('chalk').default;
const chalk = require('react-dev-utils/chalk');
const spawn = require('react-dev-utils/crossSpawn');

// const util = require('util');
const listStaged = require('./utils/listStaged');

const globEslint = '**/*.{js,mjs,jsx,ts,tsx}';
// const globStylelint = '**/*.{css,scss,sass,jsx,tsx}';
const argv = process.argv.slice(2);

const inputFiles = argv.filter(s => s && !s.startsWith('-'));
const isFix = argv.indexOf('--fix') !== -1;
const isCheck = argv.indexOf('--check') !== -1;
// 严格模式，warning作为错误处理
const isStrict =
  argv.indexOf('--strict') !== -1 ||
  (process.env.CI &&
    (typeof process.env.CI !== 'string' ||
      process.env.CI.toLowerCase() !== 'false'));

// 是否查询staged
// format # 环境变量 GIT_AUTHOR_DATE 存在
// format staged
const isStaged =
  inputFiles[0] === 'staged' ||
  (process.env.GIT_AUTHOR_DATE && argv.length === 0);

/**
 *
 * @param {string} type
 * @param {string} file
 */
function logError(type, file) {
  console.error(
    `${chalk.yellow(type)}:${chalk.bold.red('[×]')}`,
    chalk.bold(file)
  );
}

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
    logError('prettier', f);
    return false;
  }
  return true;
}

function getFilesGlob(p, defaultGlob) {
  return !p || p.length === 0 || (p[0] === '.' && p.length === 1)
    ? defaultGlob || '**/*'
    : p;
}
/**
 * prettier 命令行
 * @param {'check'|'write'} type
 * @param {string} f
 */
function prettierCli(type, f) {
  const result = spawn.sync(
    'node',
    [
      require.resolve('prettier/bin-prettier'),
      f,
      `--${type || 'check'}`,
      '--loglevel=log',
    ],
    { stdio: 'inherit' }
  );
  return result.status == 0;
}

function lintCheck(file, content) {
  const ext = path.extname(file);
  if (['js', 'ts', 'jsx', 'tsx'].includes(ext)) {
    const errs = eslinter.verify(content, {
      filename: file,
    });
    if (errs && errs.length > 0) {
      logError('eslint', file);

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

function eslintFix(p) {
  const eslintCli = new eslint.CLIEngine({ fix: true });
  const res = eslintCli.executeOnFiles(p);
  eslint.CLIEngine.outputFixes(res);
  res.results.forEach(m => {
    const relateivePath = path.relative(process.cwd(), m.filePath);
    if (m.output) {
      // fs.writeFileSync(m.output,m.filePath)
      if (
        m.errorCount + m.warningCount >
        m.fixableWarningCount + m.fixableErrorCount
      ) {
        console.error('x', relateivePath);
      } else {
        console.warn('🖊', relateivePath);
      }
    } else if (m.errorCount) {
      logError('eslint', relateivePath);
    } else if (m.warningCount) {
      console.warn('⚠', relateivePath);
    }
  });
  return (
    res.errorCount === res.fixableErrorCount &&
    res.warningCount === res.fixableWarningCount
  );
}

function eslintCheck(p) {
  const eslintCli = new eslint.CLIEngine({ fix: false });
  const res = eslintCli.executeOnFiles(p);
  res.results.forEach(m => {
    const relateivePath = path.relative(process.cwd(), m.filePath);
    if (m.errorCount) {
      logError('eslint', relateivePath);
    } else if (m.warningCount) {
      console.warn('⚠', relateivePath);
    }
  });
  return (res.errorCount == 0 && !isStrict) || res.warningCount == 0;
}
function run() {
  let isFail = false;
  if (isStaged) {
    listStaged().forEach(f => {
      const content = getStagedContent(f);
      if (prettierCheck(f, content) && lintCheck(f, content)) {
        console.log(chalk.green('√'), chalk.dim.gray(f));
      } else {
        isFail = true;
      }
    });
    if (isFail) {
      console.error(`
 Staged files format check fail!
 Try ${chalk.bold.cyan('npm run format')} to autofix them.
        `);
    }
  } else if (isFix || (!isCheck && process.env.CI !== 'false')) {
    isFail = !prettierCli('write', getFilesGlob(inputFiles));
    isFail = !eslintFix(getFilesGlob(inputFiles, globEslint)) || isFail;
    if (isFail) {
      console.error(chalk.red(`Some files can't be auto fixed!`));
    } else {
      console.log(chalk.green('√'), 'All files are formatted!');
    }
  } else {
    if (
      !prettierCli('check', getFilesGlob(inputFiles)) ||
      !eslintCheck(getFilesGlob(inputFiles, globEslint))
    ) {
      isFail = true;
      console.error(`
 Some files have code style issues!
 Try ${chalk.bold.cyan('npm run format')} to auto-fix them.
        `);
    } else {
      console.log(chalk.green('√'), 'All files use good code style!');
    }
  }
  return !isFail;
}

if (!run()) {
  process.exit(1);
}
