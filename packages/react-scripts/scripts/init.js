// @remove-file-on-eject
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

const fs = require('fs-extra');
const path = require('path');
const chalk = require('@dragongate/react-dev-utils/chalk');
const execSync = require('child_process').execSync;
const spawn = require('@dragongate/react-dev-utils/crossSpawn');
const {
  defaultBrowsers,
} = require('@dragongate/react-dev-utils/browsersHelper');
const os = require('os');
const verifyTypeScriptSetup = require('./utils/verifyTypeScriptSetup');
const createGitHooks = require('./utils/createGitHooks');

function isInGitRepository() {
  try {
    execSync('git rev-parse --is-inside-work-tree', { stdio: 'ignore' });
    return true;
  } catch (e) {
    return false;
  }
}

function isInMercurialRepository() {
  try {
    execSync('hg --cwd . root', { stdio: 'ignore' });
    return true;
  } catch (e) {
    return false;
  }
}

function tryGitInit(appPath) {
  let didInit = false;
  try {
    execSync('git --version', { stdio: 'ignore' });
    if (isInGitRepository()) {
      createGitHooks();
      return false;
    } else if (isInMercurialRepository()) {
      return false;
    }

    execSync('git init', { stdio: 'ignore' });
    didInit = true;

    execSync('git add -A', { stdio: 'ignore' });
    execSync(
      'git commit -m "chore(init): Initial commit from Create DG-React"',
      {
        stdio: 'ignore',
      }
    );
    createGitHooks();
    return true;
  } catch (e) {
    if (didInit) {
      // If we successfully initialized but couldn't commit,
      // maybe the commit author config is not set.
      // In the future, we might supply our own committer
      // like Ember CLI does, but for now, let's just
      // remove the Git files to avoid a half-done state.
      try {
        // unlinkSync() doesn't work on directories.
        fs.removeSync(path.join(appPath, '.git'));
      } catch (removeErr) {
        // Ignore.
      }
    }
    return false;
  }
}

/**
 *
 * @param {string} appPath
 */
function tryOpenCode() {
  try {
    execSync('code . README.md', { stdio: 'ignore' });
    return true;
  } catch (e) {
    return false;
  }
}
module.exports = function(
  appPath,
  appName,
  verbose,
  originalDirectory,
  templateName
) {
  const appPackage = require(path.join(appPath, 'package.json'));
  const useYarn = fs.existsSync(path.join(appPath, 'yarn.lock'));

  if (!templateName) {
    console.log('');
    console.error(
      `A template was not provided. This is likely because you're using an outdated version of ${chalk.cyan(
        'create-dg-react'
      )}.`
    );
    console.error(
      `Please note that global installs of ${chalk.cyan(
        'create-react-app'
      )} are no longer supported.`
    );
    return;
  }

  const templatePath = path.join(
    require.resolve(templateName, { paths: [appPath] }),
    '..'
  );

  let templateJsonPath;
  if (templateName) {
    templateJsonPath = path.join(templatePath, 'template.json');
  } else {
    // TODO: Remove support for this in v4.
    templateJsonPath = path.join(appPath, '.template.dependencies.json');
  }

  let templateJson = {};
  if (fs.existsSync(templateJsonPath)) {
    templateJson = require(templateJsonPath);
  }

  // Copy over some of the devDependencies
  appPackage.dependencies = appPackage.dependencies || {};

  // appPackage.devDependencies = templateJson.devDependencies;

  // Setup the script rules
  const templateScripts = templateJson.scripts || {};
  appPackage.scripts = Object.assign(
    {
      start: 'react-scripts start',
      build: 'react-scripts build',
      test: 'react-scripts test',
      // eject: 'react-scripts eject',
    },
    templateScripts
  );

  // Update scripts for Yarn users
  if (useYarn) {
    appPackage.scripts = Object.entries(appPackage.scripts).reduce(
      (acc, [key, value]) => ({
        ...acc,
        [key]: value.replace(/(npm run |npm )/, 'yarn '),
      }),
      {}
    );
  }

  // prettier
  appPackage.prettier =
    templateJson.prettier || '@dragongate/eslint-config/prettier';

  // Setup the eslint config
  appPackage.eslintConfig = Object.assign(
    {
      extends: '@dragongate/eslint-config',
    },
    templateJson.eslintConfig
  );

  // stylelint
  appPackage.stylelint = Object.assign(
    { extends: '@dragongate/stylelint-config' },
    templateJson.stylelint
  );
  // Setup the browsers list
  appPackage.browserslist = defaultBrowsers;

  fs.writeFileSync(
    path.join(appPath, 'package.json'),
    JSON.stringify(appPackage, null, 2) + os.EOL
  );

  const readmeExists = fs.existsSync(path.join(appPath, 'README.md'));
  if (readmeExists) {
    fs.renameSync(
      path.join(appPath, 'README.md'),
      path.join(appPath, 'README.old.md')
    );
  }

  // Copy the files for the user
  const templateDir = path.join(templatePath, 'template');
  if (fs.existsSync(templateDir)) {
    fs.copySync(templateDir, appPath);
  } else {
    console.error(
      `Could not locate supplied template: ${chalk.green(templateDir)}`
    );
    return;
  }

  // modifies README.md commands based on user used package manager.
  if (useYarn) {
    try {
      const readme = fs.readFileSync(path.join(appPath, 'README.md'), 'utf8');
      fs.writeFileSync(
        path.join(appPath, 'README.md'),
        readme.replace(/(npm run |npm )/g, 'yarn '),
        'utf8'
      );
    } catch (err) {
      // Silencing the error. As it fall backs to using default npm commands.
    }
  }

  // Rename gitignore after the fact to prevent npm from renaming it to .npmignore
  // See: https://github.com/npm/npm/issues/1862
  try {
    fs.moveSync(
      path.join(appPath, 'gitignore'),
      path.join(appPath, '.gitignore'),
      []
    );
  } catch (err) {
    // Append if there's already a `.gitignore` file there
    if (err.code === 'EEXIST') {
      const data = fs.readFileSync(path.join(appPath, 'gitignore'));
      fs.appendFileSync(path.join(appPath, '.gitignore'), data);
      fs.unlinkSync(path.join(appPath, 'gitignore'));
    } else {
      throw err;
    }
  }

  let command;
  let remove;
  let args;
  let devArgs = [];

  if (useYarn) {
    command = 'yarnpkg';
    remove = 'remove';
    args = ['add'];
    devArgs.push('add', '-D');
  } else {
    command = 'npm';
    remove = 'uninstall';
    args = ['install', '--save', verbose && '--verbose'].filter(e => e);
    devArgs.push('install', '-D');
    if (verbose) {
      devArgs.push('--verbose');
    }
  }

  // Install additional template dependencies, if present
  const templateDependencies = templateJson.dependencies || {};
  const dependencies = Object.keys(templateDependencies).map(
    key => `${key}@${templateDependencies[key]}`
  );
  const templateDevDependencies = templateJson.devDependencies || {};
  const devDependencies = Object.keys(templateDevDependencies).map(
    key => `${key}@${templateDevDependencies[key]}`
  );

  // Install react and react-dom for backward compatibility with old CRA cli
  // which doesn't install react and react-dom along with react-scripts
  if (!isReactInstalled(appPackage)) {
    dependencies.push('react', 'react-dom');
  }

  // Install template dependencies, and react and react-dom if missing.
  if (dependencies.length > 0) {
    console.log();
    console.log(
      `Installing template(${templateName}) dependencies using ${command}...`
    );
    args = args.concat(dependencies);
    const proc = spawn.sync(command, args, { stdio: 'inherit' });
    if (proc.status !== 0) {
      console.error(`\`${command} ${args.join(' ')}\` failed`);
      return;
    }
  }

  // Install template dependencies, and react and react-dom if missing.
  if (devDependencies.length > 0) {
    console.log();
    console.log(
      `Installing template(${templateName}) devDependencies using ${command}...`
    );
    devArgs = devArgs.concat(devDependencies);
    const proc = spawn.sync(command, devArgs.concat(devDependencies), {
      stdio: 'inherit',
    });
    if (proc.status !== 0) {
      console.error(`\`${command} ${devArgs.join(' ')}\` failed`);
      return;
    }
  }

  if (
    dependencies.find(arg => arg.includes('typescript')) ||
    devDependencies.find(arg => arg.includes('typescript'))
  ) {
    console.log();
    verifyTypeScriptSetup();
  }

  // Remove template
  console.log(`Removing template(${templateName}) package using ${command}...`);
  console.log();

  const proc = spawn.sync(command, [remove, templateName], {
    stdio: 'inherit',
  });
  if (proc.status !== 0) {
    console.error(`\`${command} ${args.join(' ')}\` failed`);
    return;
  }

  if (tryGitInit(appPath)) {
    console.log();
    console.log('Initialized a git repository.');
  }

  // Display the most elegant way to cd.
  // This needs to handle an undefined originalDirectory for
  // backward compatibility with old global-cli's.
  let cdpath;
  if (originalDirectory && path.join(originalDirectory, appName) === appPath) {
    cdpath = appName;
  } else {
    cdpath = appPath;
  }

  // Change displayed command to yarn instead of yarnpkg
  const displayedCommand = useYarn ? 'yarn' : 'npm';

  console.log();
  console.log(chalk.green('='.repeat(60)));
  console.log(`Success! Created ${appName} at ${appPath}`);
  console.log('Inside that directory, you can run several commands:');
  console.log();
  console.log(chalk.cyan(`  ${displayedCommand} start`));
  console.log('    Starts the development server.');
  console.log();
  console.log(
    chalk.cyan(`  ${displayedCommand} ${useYarn ? '' : 'run '}build`)
  );
  console.log('    Bundles the app into static files for production.');
  console.log();
  console.log(chalk.cyan(`  ${displayedCommand} test`));
  console.log('    Starts the test runner.');
  console.log();
  // console.log(
  //   chalk.cyan(`  ${displayedCommand} ${useYarn ? '' : 'run '}eject`)
  // );
  // console.log(
  //   '    Removes this tool and copies build dependencies, configuration files'
  // );
  // console.log(
  //   '    and scripts into the app directory. If you do this, you can’t go back!'
  // );
  console.log();
  if (tryOpenCode(cdpath)) {
    console.log(
      chalk.gray(
        `switch window to VSCode and run "${chalk.white.bold(
          displayedCommand + ' start'
        )}"`
      )
    );
  } else {
    console.log('We suggest that you begin by typing:');
    console.log();
    console.log(chalk.cyan('  cd'), cdpath);
    console.log(`  ${chalk.cyan(`${displayedCommand} start`)}  `);
  }
  console.log();
  if (readmeExists) {
    console.log();
    console.log(
      chalk.yellow(
        'You had a `README.md` file, we renamed it to `README.old.md`'
      )
    );
  }
  console.log();
  console.log('Happy hacking!');
  console.log(chalk.green('='.repeat(60)));
};

function isReactInstalled(appPackage) {
  const dependencies = appPackage.dependencies || {};

  return (
    typeof dependencies.react !== 'undefined' &&
    typeof dependencies['react-dom'] !== 'undefined'
  );
}
