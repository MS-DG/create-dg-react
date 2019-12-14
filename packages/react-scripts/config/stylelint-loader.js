'use strict';
// const chalk = require('chalk');
const loaderUtils = require('loader-utils');
const stylelint = require('stylelint');

const chalk = require('chalk');
const stripAnsi = require('strip-ansi');
const table = require('text-table');

const defaultOptions = {
  displayOutput: true,
  ignoreCache: false,
};

/**
 * align with `react-dev-utils/eslintFormatter`
 * @param {stylelint.LintResult[]} results
 */
function formatter(results) {
  let output = '\n';
  let hasErrors = false;

  results.forEach(result => {
    let messages = result.warnings;
    if (messages.length === 0) {
      return;
    }

    messages = messages.map(message => {
      let messageType;
      if (message.severity === 'error') {
        messageType = 'error';
        hasErrors = true;
      } else {
        messageType = 'warn';
      }

      let line = message.line || 0;
      if (message.column) {
        line += ':' + message.column;
      }
      let position = chalk.bold('Line ' + line + ':');
      return [
        '',
        position,
        messageType,
        message.text.replace(/\s+\(.+\)$/, '').replace(/^\s*Expected\s+/, ''),
        chalk.underline(message.rule || ''),
      ];
    });

    // if there are error messages, we want to show only errors
    if (hasErrors) {
      messages = messages.filter(m => m[2] === 'error');
    }

    // add color to rule keywords
    messages.forEach(m => {
      m[4] = m[2] === 'error' ? chalk.red(m[4]) : chalk.yellow(m[4]);
      m.splice(2, 1);
    });

    let outputTable = table(messages, {
      align: ['l', 'l', 'l'],
      stringLength(str) {
        return stripAnsi(str).length;
      },
    });

    output += `${outputTable}\n\n`;
  });

  return output;
}

/**
 * Lint the provided file
 *
 * @param {string|Buffer} content the content to be linted (not used in general)
 * @param {object} options the loader options
 * @param {object} context the webpack context
 * @param {Function} callback the async callback
 * @returns {object} the result from the callback
 * @async
 */
function linter(content, options, context, callback) {
  const lintOptions = Object.assign({}, options, {
    files: context.resourcePath,
    // formatter: 'string',
    formatter,
    // require('react-dev-utils/eslintFormatter'),
  });
  stylelint
    .lint(lintOptions)

    .then(result => {
      if (result.errored && result.output) {
        const error = Error(result.output);
        // error.file = filePath;

        context.emitWarning(error);
      }
      return callback(null, content);
      // return result.results[0];
    })
    .catch(error => {
      return callback(error);
    });

  // If we get here, we are complete, but synchronous, so just return something
  return null;
}

/**
 * Webpack Loader Definition
 *
 * @param {string|buffer} content = the content to be linted
 * @returns {object} the result of the callback
 */
module.exports = function(content) {
  const callback = this.async();
  const loaderOptions = loaderUtils.getOptions(this);
  const options = Object.assign({}, defaultOptions, loaderOptions);
  if (this.cacheable) {
    this.cacheable();
  }
  try {
    return linter(content, options, this, callback);
  } catch (error) {
    console.error('[stylelint-loader] error = ', error.stack);
    return callback(error);
  }
};
