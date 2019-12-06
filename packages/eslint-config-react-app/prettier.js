'use strict';
// https://prettier.io/docs/en/options.html

// import prettier from "prettier";

/**
 *
 * @type {prettier.Options}
 */
const options = {
  printWidth: 100, //default 80
  trailingComma: 'es5', //default none

  tabWidth: 2,
  semi: true,
  singleQuote: false,
  quoteProps: 'as-needed',
  jsxSingleQuote: false,
  bracketSpacing: true,
  jsxBracketSameLine: false,
  arrowParens: 'avoid',
};
module.exports = options;
