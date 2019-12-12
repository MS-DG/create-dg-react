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

const stylelint = require('stylelint');

// const chalk = require('chalk').default;
const { default: chalk } = require('react-dev-utils/chalk');
const spawn = require('react-dev-utils/crossSpawn');

const listStaged = require('./utils/listStaged');

const globEslint = '**/*.{js,mjs,jsx,ts,tsx}';
const globStylelint = '**/*.{css,scss,tsx,jsx,ts,js,md,html}';
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

const eslinter = new eslint.Linter();

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

function errorAndTry(message) {
  console.error(`
 ${chalk.red(message)}
 Try ${chalk.bold.cyan('npm run format')} to auto-fix them.
`);
}

function getStagedContent(f) {
  // return util.promisify(cp.exec)(`git show :"${f}"`).then(f => f.stdout);
  const buffer = cp.execSync(`git show :"${f}"`);
  return buffer.toString();
}

function clearLine(n) {
  if (!process.stdout.clearLine) {
    process.stdout.write('\n');
    return false;
  }
  n = n || 1;
  while (n--) {
    process.stdout.clearLine();
    if (n) {
      process.stdout.write('\u001b[1A');
    }
  }
  process.stdout.cursorTo(0);
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
  if (result.status == 0 && type === 'check') {
    clearLine(3);
  }
  //  (type === "write") {
  //   //  '\e[90m'
  // }
  return result.status == 0;
}

function prettierCheck(f, content) {
  // process.stdout.write(chalk.gray(`prettier: ${chalk.gray(f)}`));
  const options = prettier.resolveConfig.sync(f, { useCache: 'true' });
  options.filepath = f;
  if (!prettier.check(content, options)) {
    // clearLine()
    logError('prettier', f);
    return false;
  }
  // clearLine()
  return true;
}

function lintCheck(file, content) {
  // process.stdout.write(chalk.gray(`lint: ${chalk.gray(file)}`));
  const ext = path.extname(file);
  if (['.js', '.ts', '.jsx', '.tsx'].includes(ext)) {
    const errs = eslinter.verify(content, {
      filename: file,
    });
    if (errs && errs.length > 0) {
      // clearLine()
      logError('eslint', file);
      errs.forEach(msg =>
        console.error(
          chalk.bold(`  ${msg.line}, ${msg.column}: `),
          chalk.red(msg.message),
          msg.ruleId || msg.fatal
        )
      );
      return Promise.reject(false);
    }
  }

  if (
    ['.css', '.scss', '.sass', '.md', '.html', '.jsx', '.tsx'].includes(ext)
  ) {
    return stylelint
      .lint({
        code: content,
        fix: false,
        formatter: 'string',
        codeFilename: file,
        config: {
          extends: '@dragongate/stylelint-config',
        },
      })
      .then(linted => {
        if (!linted.output) {
          return true;
        }
        // clearLine();
        console.error(linted.output.trimRight());
        if (linted.errored) {
          return Promise.reject(linted);
        } else if (isStrict) {
          return Promise.reject(linted);
        }
        return true;
      });
  }

  return Promise.resolve(true);
}

function eslintFix(p) {
  process.stdout.write(chalk.gray('fixing eslint ...'));
  const eslintCli = new eslint.CLIEngine({ fix: true });
  const res = eslintCli.executeOnFiles(p);
  eslint.CLIEngine.outputFixes(res);
  clearLine();
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
  process.stdout.write(chalk.gray('checking eslint ...'));
  const eslintCli = new eslint.CLIEngine({ fix: false });
  const res = eslintCli.executeOnFiles(p);
  clearLine();
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

/**
 *
 * @param {*} params
 */
function runStylelint(p, fix) {
  process.stdout.write(chalk.gray('checking stylelint ...'));
  return stylelint
    .lint({
      files: p,
      fix: !!fix,
      formatter: 'string',
      config: {
        extends: '@dragongate/stylelint-config',
      },
    })
    .then(linted => {
      clearLine();
      if (!linted.output) {
        return;
      }
      console.log(linted.output);
      if (linted.errored) {
        return Promise.reject(false);
      } else if (linted.maxWarningsExceeded) {
        const foundWarnings = linted.maxWarningsExceeded.foundWarnings;
        console.log(
          chalk.red(`Max warnings exceeded: `),
          `${foundWarnings} found. `
        );
      }
      if (isStrict) {
        return Promise.reject(false);
      }
    });
}

function run() {
  let isFail = false;
  if (isStaged) {
    const staged = listStaged();
    console.log(
      chalk.gray(
        `Checking ${chalk.reset.bold(staged.length)}`,
        chalk.gray(`staged file${staged.length > 1 ? 's' : ''}`)
      )
    );
    Promise.all(
      staged.map(f => {
        const content = getStagedContent(f);
        if (prettierCheck(f, content)) {
          return lintCheck(f, content).then(() => {
            console.log(chalk.green('√'), chalk.dim.gray(f));
          });
        } else {
          return Promise.reject(false);
        }
      })
    ).catch(() => {
      errorAndTry('Staged files format check fail!');
      process.exit(1);
    });
  } else if (isFix || (!isCheck && process.env.CI !== 'false')) {
    Promise.resolve(() => prettierCli('write', getFilesGlob(inputFiles)))
      .then(result => eslintFix(getFilesGlob(inputFiles, globEslint)) && result)
      .then(result =>
        runStylelint(getFilesGlob(inputFiles, globStylelint), true).then(() => {
          if (!result) {
            return Promise.reject(result);
          }
        })
      )
      .then(() => console.log(chalk.green('√'), 'All files are formatted!'))
      .catch(err => {
        if (err) {
          console.debug(err);
        }
        console.error(chalk.red(`\nSome files can't be auto fixed!\n`));
        process.exit(1);
      });
  } else {
    if (
      !prettierCli('check', getFilesGlob(inputFiles)) ||
      !eslintCheck(getFilesGlob(inputFiles, globEslint))
    ) {
      isFail = true;
      errorAndTry('Some files have code format issues!');
    } else {
      runStylelint(getFilesGlob(inputFiles, globStylelint))
        .then(() =>
          console.log(chalk.green('√'), 'All files use good code style!')
        )
        .catch(() => {
          errorAndTry('Some files have code format issues!');
          process.exit(1);
        });
    }
  }
  if (isFail) {
    process.exit(1);
  }
}

run();
