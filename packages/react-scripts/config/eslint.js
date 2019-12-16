'use strict';
const paths = require('./paths');
module.exports = require(paths.appPackageJson).eslintConfig || {
  extends: [require.resolve('@dragongate/eslint-config')],
};
