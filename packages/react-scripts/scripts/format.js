'use strict';

// format # 自动判断
// format . --fix
// format staged --check
// format . --check

const fs = require('fs');
const path = require('path');
// const cp = require('child_process');
const prettier = require('prettier');
const eslint = require('eslint');

const stylelint = require('stylelint');

// const chalk = require('chalk').default;
const chalk = require('react-dev-utils/chalk');
const spawn = require('react-dev-utils/crossSpawn');

const listStaged = require('./utils/listStaged');
const stylelintConfig = require('../config/stylelint');
const eslintConfig = require('../config/eslint');
const paths = require('../config/paths');

const logger = require('./utils/logger');

const root = path.dirname(paths.appSrc);

const defaultGlob = {
  eslint: path.join(root, '**/*.{js,mjs,jsx,ts,tsx}'),
  stylelint: path.join(root, '/**/*.{css,scss,tsx,jsx,md,html}'),
  prettier: path.join(root, '/**/*'),
};
const argv = process.argv.slice(2);

const isCI =
  process.env.CI &&
  (typeof process.env.CI !== 'string' ||
    process.env.CI.toLowerCase() !== 'false');
const isFix = argv.indexOf('--fix') !== -1;
const isCheck = argv.indexOf('--check') !== -1;
// 严格模式，warning作为错误处理
const isStrict = argv.indexOf('--strict') !== -1 || isCI;

// 是否查询staged
// format # 环境变量 GIT_AUTHOR_DATE 存在
// format staged
const isStaged = argv.includes('staged') || argv.includes('--staged');
const ignoreFile = fs.existsSync(path.join(paths.appPath, '.gitignore'))
  ? path.join(paths.appPath, '.gitignore')
  : undefined;

let inputFiles = argv.filter(s => s && !s.startsWith('-'));
if (inputFiles.length === 0 && !isStaged && process.env.CHANGED_SINCE) {
  inputFiles = listStaged(process.env.CHANGED_SINCE);
  if (inputFiles.length > 0) {
    console.log(
      chalk.gray(
        `linting ${chalk.reset.bold(inputFiles.length)}`,
        chalk.gray(`committed file${inputFiles.length > 1 ? 's' : ''}`)
      )
    );
    console.log();
  }
}

const eslintOptions = {
  useEslintrc: false,
  baseConfig: eslintConfig,
  ignorePath: ignoreFile,
  cache: true,
  cwd: root,
};
const eslintCli = new eslint.ESLint(eslintOptions);
let rulesMeta;

/**
 * Outputs the results of the linting.
 * @param {eslint.ESLint} engine The CLIEngine to use.
 * @param {Promise<eslint.LintResult[]>} results The results to print.
 * @returns {Promise<eslint.LintResult>}
 */
function printResults(engine, results) {
  const formatter = engine.loadFormatter(
    isCI ? 'codeframe' : isStaged ? 'unix' : 'visualstudio'
  ); //visualstudio
  //relative path
  // results.forEach(
  //   (m) => (m.filePath = path.relative(process.cwd(), m.filePath))
  // );
  return Promise.all([formatter, results]).then(([f, res]) => {
    let errorCount = 0;
    let warningCount = 0;
    let fixableErrorCount = 0;
    let fixableWarningCount = 0;
    res.forEach(m => {
      m.filePath = path.relative(process.cwd(), m.filePath);
      errorCount += m.errorCount;
      warningCount += m.warningCount;
      fixableErrorCount += m.fixableErrorCount;
      fixableWarningCount += m.fixableWarningCount;
    });
    const output = f.format(res, {
      get rulesMeta() {
        if (!rulesMeta) {
          rulesMeta = {};
          for (const [ruleId, rule] of engine.getRules()) {
            rulesMeta[ruleId] = rule.meta;
          }
        }
        return rulesMeta;
      },
    });
    if (output) {
      process.stderr.write(output);
    }

    return {
      errorCount,
      warningCount,
      fixableErrorCount,
      fixableWarningCount,
    };
  });
  // return formatter.then((f) => {
  //   const output = f.format(results, {
  //     get rulesMeta() {
  //       if (!rulesMeta) {
  //         rulesMeta = {};
  //         for (const [ruleId, rule] of engine.getRules()) {
  //           rulesMeta[ruleId] = rule.meta;
  //         }
  //       }
  //       return rulesMeta;
  //     },
  //   });
  //   if (output) {
  //     process.stderr.write(output);
  //   }
  // })
}

function errorAndTry(message) {
  logger.error(`
 ${chalk.yellow(message)}
 Try ${chalk.bold.cyan('npm run format')} to auto-fix them.
`);
}

function getStagedContent(f) {
  // return util.promisify(cp.exec)(`git show :"${f}"`).then(f => f.stdout);
  // const buffer = cp.execSync(`git show :"${f}"`);
  // return buffer.toString();
  return fs.readFileSync(f).toString();
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

/**
 *
 * @param {string|string[]} p
 * @param {'prettier'|'eslint'|'stylelint'} type
 */
function getFilesGlob(p, type) {
  if (!p || p.length === 0 || (p[0] === '.' && p.length === 1)) {
    return defaultGlob[type] || '**/*';
  } else if (p instanceof Array) {
    switch (type) {
      case 'eslint':
        return p.filter(p =>
          ['.ts', '.tsx', '.js', '.jsx'].includes(path.extname(p))
        );
      case 'stylelint':
        return p.filter(p =>
          ['.scss', '.css', '.md', '.jsx', '.tsx', '.html'].includes(
            path.extname(p)
          )
        );
      default:
        return p;
    }
  }
  return p;
}

/**
 * prettier 命令行
 * @param {'check'|'write'} type
 * @param {string|string[]} f
 */
function prettierCli(type, f) {
  const result = spawn.sync(
    process.execPath,
    [
      require.resolve('prettier/bin-prettier'),
      `--${type || 'check'}`,
      // '--loglevel=log',
    ].concat(f),
    { stdio: 'inherit', cwd: root }
  );
  if (result.status == 0 && type === 'check') {
    clearLine(3);
  }
  //  (type === "write") {
  //   //  '\e[90m'
  // }
  return result.status == 0;
}

function prettierCheckSingleFile(file, content) {
  return prettier
    .getFileInfo(file, { ignorePath: path.join(root, '.prettierignore') })
    .then(info => {
      if (!info.ignored) {
        const options = prettier.resolveConfig.sync(file, { useCache: true });
        options.filepath = file;
        if (!prettier.check(content, options)) {
          logger.error(`${chalk.red('[×]prettier')}:`, chalk.yellow.bold(file));
          return Promise.reject(false);
        }
      }
    });
}

function lintCheckSingleFile(file, content) {
  // process.stdout.write(chalk.gray(`lint: ${chalk.gray(file)}`));
  const ext = path.extname(file);
  if (['.js', '.ts', '.jsx', '.tsx'].includes(ext)) {
    const res = eslintCli.lintText(content, { filePath: file });
    return printResults(eslintCli, res).then(r => {
      if (r.errorCount || r.warningCount) {
        return Promise.reject(r);
      }
    });
    // if (res.errorCount || res.warningCount) {
    //   printResults(eslintCli, res);
    //   return Promise.reject(false);
    // }
  }

  if (
    ['.css', '.scss', '.sass', '.md', '.html', '.jsx', '.tsx'].includes(ext)
  ) {
    return stylelint
      .lint({
        code: content,
        fix: false,
        formatter: isCI ? 'string' : 'unix',
        codeFilename: file,
        config: stylelintConfig,
        ignorePath: ignoreFile,
        cache: true,
      })
      .then(linted => {
        if (!linted.output) {
          return true;
        }
        // clearLine();
        logger.error(linted.output.trimRight());
        if (linted.errored) {
          return Promise.reject(false);
        } else if (isStrict) {
          return Promise.reject(false);
        }
        return true;
      });
  }
  return true;
}

function eslintFix(p) {
  if (!p || !p.length) {
    return true;
  }
  process.stdout.write(chalk.gray('fixing eslint ...'));
  const esCli = new eslint.ESLint(
    Object.assign({}, eslintOptions, { fix: true })
  );
  const res = esCli.lintFiles(p);
  clearLine();
  return res
    .then(r => eslint.ESLint.outputFixes(r))
    .then(() => printResults(esCli, res))
    .then(r => {
      if (
        r.errorCount !== r.fixableErrorCount ||
        r.warningCount !== r.fixableWarningCount
      ) {
        return Promise.reject(r);
      }
      return true;
    });
}

function eslintCheck(p) {
  if (!p || !p.length) {
    return true;
  }
  process.stdout.write(chalk.gray('checking eslint ...'));
  clearLine();
  return Promise.all(p.map(f => eslintCli.isPathIgnored(f)))
    .then(ignorefiles => p.filter((v, i) => !ignorefiles[i]))
    .then(files => eslintCli.lintFiles(files))
    .then(res => printResults(eslintCli, res))
    .then(r => {
      if (r.errorCount !== 0 || (isStrict && r.warningCount !== 0)) {
        return Promise.reject(r);
      }
    });
}

/**
 *
 * @param {*} params
 */
function runStylelint(p, fix) {
  if (!p || !p.length) {
    return Promise.resolve(true);
  }
  process.stdout.write(
    chalk.gray(`${fix ? 'fixing' : 'checking'} stylelint ...`)
  );
  return stylelint
    .lint({
      files: Array.isArray(p)
        ? p.map(s => s.replace(/\\/g, '/'))
        : p.replace(/\\/g, '/'),
      fix: !!fix,
      formatter: isCI ? 'string' : 'unix',
      config: stylelintConfig,
      ignorePath: ignoreFile,
      cache: true,
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
        `Checking format in ${chalk.reset.bold(staged.length)}`,
        chalk.gray(`staged file${staged.length > 1 ? 's' : ''}`)
      )
    );
    Promise.all(
      staged.map(f => {
        const content = getStagedContent(f);
        return Promise.resolve(lintCheckSingleFile(f, content))
          .then(() => prettierCheckSingleFile(f, content))
          .then(() => console.log(chalk.green('√'), chalk.dim.gray(f)));
      })
    ).catch(error => {
      if (error) {
        console.log(error);
      }
      errorAndTry('Staged files format check fail!');
      process.exit(1);
    });
  } else if (isFix || (!isCheck && !isCI)) {
    Promise.resolve(prettierCli('write', getFilesGlob(inputFiles, 'prettier')))
      .then(result => result && eslintFix(getFilesGlob(inputFiles, 'eslint')))
      .then(result =>
        runStylelint(getFilesGlob(inputFiles, 'stylelint'), true).then(() => {
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
        logger.error(chalk.yellow(`\nSome files can't be auto fixed!\n`));
        process.exit(1);
      });
  } else {
    if (!prettierCli('check', getFilesGlob(inputFiles, 'prettier'))) {
      isFail = true;
      errorAndTry('Some files have code format issues!');
    } else {
      eslintCheck(getFilesGlob(inputFiles, 'eslint'))
        .then(() => runStylelint(getFilesGlob(inputFiles, 'stylelint')))
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
