'use strict';
const paths = require('./paths');
module.exports = require(paths.appPackageJson).stylint || {
  extends: '@dragongate/stylelint-config',
};
