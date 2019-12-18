#!/usr/bin/env node

'use strict';

if (process.env.TF_BUILD || process.env.CI) {
    console.log('skip: in CI enviroment');
} else if (!require('fs').existsSync('.npmrc')) {
    console.log('skip: .npmrc was not found');
} else if (process.platform === 'win32') {
    // windows
    require('child_process').execSync('npx vsts-npm-auth -c .npmrc', {
        stdio: 'inherit',
    });
} else {
    // mac or linux
    require('./auth')().catch(e => {
        console.error(e);
        process.exit(1);
    });
}
