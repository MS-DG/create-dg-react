#!/usr/bin/env node

'use strict';


if (process.env.TF_BUILD || process.env.CI) {
    console.log("skip: in CI enviroment");
} else if (!require('fs').existsSync(".npmrc")) {
    console.log("skip: .npmrc notfound");
} else if (process.platform === "win32") {
    // windows
    require("child_process").execSync("npx vsts-npm-auth -c", {
        stdio: "inherit"
    });
} else {
    // mac or linux
    require("./auth")();
}