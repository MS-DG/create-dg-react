'use strict';

function error() {
  const args = Array.from(arguments);
  args.unshift('##vso[task.logissue type=error]');
  console.error.apply(null, args);
}

function warn() {
  const args = Array.from(arguments);
  args.unshift('##vso[task.logissue type=warn]');
  console.error.apply(null, args);
}

module.exports = {
  error: process.env.TF_BUILD ? error : console.error,
  warn: process.env.TF_BUILD ? warn : console.warn,
};
