#!/usr/bin/env node
/**
 * Copyright (c) 2015-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

'use strict';

// Makes the script crash on unhandled rejections instead of silently
// ignoring them. In the future, promise rejections that are not handled will
// terminate the Node.js process with a non-zero exit code.
process.on('unhandledRejection', err => {
  throw err;
});

const spawn = require('react-dev-utils/crossSpawn');
const args = process.argv.slice(2);
const scripts = ['build', 'eject', 'start', 'test', 'format'];
const scriptIndex = args.findIndex(x => scripts.includes(x));
const script = scriptIndex === -1 ? args[0] : args[scriptIndex];
const nodeArgs = scriptIndex > 0 ? args.slice(0, scriptIndex) : [];

const envCI =
  process.env.TF_BUILD ||
  process.env.AZURE_PIPELINES ||
  process.env.GITHUB_ACTIONS;
if (process.env.CI === undefined && envCI) {
  process.env.CI = envCI;
}

// windows git hook 颜色适配
if (
  process.platform === 'win32' &&
  !process.env.CI &&
  !process.stdout.isTTY && // hook 环境中未 null
  process.env.GIT_AUTHOR_DATE && // hook 判断
  !process.env.PIPE_LOGGING // vscode tasks 中 pipline 不显示颜色
) {
  // 颜色自动适配
  process.env.FORCE_COLOR = process.env.COLORTERM === 'truecolor' ? 3 : 1;
}

if (scripts.includes(script)) {
  const result = spawn.sync(
    process.execPath,
    nodeArgs
      .concat(require.resolve('../scripts/' + script))
      .concat(args.slice(scriptIndex + 1)),
    { stdio: 'inherit' }
  );
  if (result.signal) {
    if (result.signal === 'SIGKILL') {
      console.log(
        'The build failed because the process exited too early. ' +
          'This probably means the system ran out of memory or someone called ' +
          '`kill -9` on the process.'
      );
    } else if (result.signal === 'SIGTERM') {
      console.log(
        'The build failed because the process exited too early. ' +
          'Someone might have called `kill` or `killall`, or the system could ' +
          'be shutting down.'
      );
    }
    process.exit(1);
  }
  process.exit(result.status);
} else {
  console.log('Unknown script "' + script + '".');
  console.log('Perhaps you need to update @dragongate/react-scripts?');
}
