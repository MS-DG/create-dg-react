This project was bootstrapped with [Create DG React](https://github.com/MS-DG/create-dg-react).

## Available Scripts

In the project directory, you can run:

### `npm start`

Runs the app in the development mode.

Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

The page will reload if you make edits.

You will also see any lint errors in the console.

### `npm test`

Launches the test runner in the interactive watch mode.

See the section about [running tests](https://facebook.github.io/create-react-app/docs/running-tests) for more information.

- `npm test` run test auto detected environment;
- `npm test nowatch` run all test without watch;
- `npm test ci` run test in CI mode (the same behaviors as `npm test` with `env.CI` is true);
- other parameters:
  - `--testmatch` test matched files
  - `--changedSince` test the different from remote

### `npm run build`

Builds the app for production to the `build` folder.

It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.

Your app is ready to be deployed!

See the section about [deployment](#ci-cd) for more information.

### `npm run format`

format checking and auto-fixing

- `npm run format` default to format and fix all files;
- `npm run format staged` check git commit staged files format without fix;
- `npm run format -- --check` check all files without fix;

Warnings also need to be fixed befor git-push.

**The warning will break the build in CI environment**.

## Lint

> There two categories of rules:
>
> - **Formatting rules**: eg: `max-len`, `no-mixed-spaces-and-tabs`, `keyword-spacing`,`comma-style`...
>
> - **Code-quality rules**: eg `no-unused-vars`, `no-extra-bind`, `no-implicit-globals` ...

All config rules is in shared npm packages, and **should not** be modified in local.

It's all to update `"@dragongate/react-scripts"` and `@shennong/eslint-plugin`.

### prettier

All files (Typescript, SCSS, HTML, Markdown ...) using the same prettier config for formatting rules.
The [.eslintignore](.eslintignore) list exceptions for prettier.

The config files is using [`@dragongate/eslint-config/prettier`](https://github.com/MS-DG/create-dg-react/blob/master/packages/eslint-config-react-app/prettier.js).

### eslint

All Typescript (`.ts`,`.tsx`) using [eslint](https://eslint.org/) to lint code-quality rules.
Base on [`@dragongate/eslint-config`](https://github.com/MS-DG/create-dg-react/tree/master/packages/eslint-config-react-app) and `@shennong/eslint-plugin`(a private eslint plugin).

All files in `.gitignore`(can not be committed) are exceptions for eslint.

You **Should not** change the eslintConfig.

> If some rules should be added or modified, please change the two packages.
>
> If some rules should be disable in some specific cases, using the disable comment:
>
> - add `// eslint-disable-next-line rule-id1, rule-id2` to disable those rules in next line.
> - add `// eslint-disable-line rule-id1, rule-id2` to disable those rules in this line.

### stylelint

All SCSS and CSS files and other files with styles (`.html`,`.tsx`,and `.md`) are linted with [stylelint](https://stylelint.io/) for code-quality rules.
Base on [`@dragongate/stylelint-config`](https://github.com/MS-DG/create-dg-react/tree/master/packages/stylelint-config).

You **Should not** change the eslintConfig.

> If some rules should be added or modified, please change the two packages.
>
> If some rules should be disable in some specific cases, using disable comment:
>
> - add `// stylelint-disable-next-line rule-id1, rule-id2` to disable those rules in next line.
> - add `// stylelint-disable-line rule-id1` to disable those rules in this line.

## Environment Variables

### advanced configuration

<summary>

You can adjust various development and production settings by setting environment variables in your shell or with [.env](#.env).

<details>

> Note: You do not need to declare `REACT_APP_` before the below variables as you would with custom environment variables.

| Variable                | Development | Production | Usage                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    |
| :---------------------- | :---------: | :--------: | :----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| BROWSER                 |   ✅ Used   | 🚫 Ignored | By default, Create React App will open the default system browser, favoring Chrome on macOS. Specify a [browser](https://github.com/sindresorhus/open#app) to override this behavior, or set it to `none` to disable it completely. If you need to customize the way the browser is launched, you can specify a node script instead. Any arguments passed to `npm start` will also be passed to this script, and the url where your app is served will be the last argument. Your script's file name must have the `.js` extension.                                                                                                                                      |
| BROWSER_ARGS            |   ✅ Used   | 🚫 Ignored | When the `BROWSER` environment variable is specified, any arguments that you set to this environment variable will be passed to the browser instance. Multiple arguments are supported as a space separated list. By default, no arguments are passed through to browsers.                                                                                                                                                                                                                                                                                                                                                                                               |
| HOST                    |   ✅ Used   | 🚫 Ignored | By default, the development web server binds to all hostnames on the device (`localhost`, LAN network address, etc.). You may use this variable to specify a different host.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             |
| PORT                    |   ✅ Used   | 🚫 Ignored | By default, the development web server will attempt to listen on port 3000 or prompt you to attempt the next available port. You may use this variable to specify a different port.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      |
| HTTPS                   |   ✅ Used   | 🚫 Ignored | When set to `true`, Create React App will run the development server in `https` mode.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    |
| PUBLIC_URL              | 🚫 Ignored  |  ✅ Used   | Create React App assumes your application is hosted at the serving web server's root or a subpath as specified in [`package.json` (`homepage`)](deployment#building-for-relative-paths). Normally, Create React App ignores the hostname. You may use this variable to force assets to be referenced verbatim to the url you provide (hostname included). This may be particularly useful when using a CDN to host your application.                                                                                                                                                                                                                                     |
| CI                      |   ✅ Used   |  ✅ Used   | When set to `true`, Create React App treats warnings as failures in the build. It also makes the test runner non-watching. Most CIs set this flag by default.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            |
| REACT_EDITOR            |   ✅ Used   | 🚫 Ignored | When an app crashes in development, you will see an error overlay with clickable stack trace. When you click on it, Create React App will try to determine the editor you are using based on currently running processes, and open the relevant source file. You can [send a pull request to detect your editor of choice](https://github.com/facebook/create-react-app/issues/2636). Setting this environment variable overrides the automatic detection. If you do it, make sure your systems [PATH](<https://en.wikipedia.org/wiki/PATH_(variable)>) environment variable points to your editor’s bin folder. You can also set it to `none` to disable it completely. |
| CHOKIDAR_USEPOLLING     |   ✅ Used   | 🚫 Ignored | When set to `true`, the watcher runs in polling mode, as necessary inside a VM. Use this option if `npm start` isn't detecting changes.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  |
| GENERATE_SOURCEMAP      | 🚫 Ignored  |  ✅ Used   | When set to `false`, source maps are not generated for a production build. This solves out of memory (OOM) issues on some smaller machines.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              |
| NODE_PATH               |   ✅ Used   |  ✅ Used   | Same as [`NODE_PATH` in Node.js](https://nodejs.org/api/modules.html#modules_loading_from_the_global_folders), but only relative folders are allowed. Can be handy for emulating a monorepo setup by setting `NODE_PATH=src`.                                                                                                                                                                                                                                                                                                                                                                                                                                            |
| INLINE_RUNTIME_CHUNK    | 🚫 Ignored  |  ✅ Used   | By default, Create React App will embed the runtime script into `index.html` during the production build. When set to `false`, the script will not be embedded and will be imported as usual. This is normally required when dealing with CSP.                                                                                                                                                                                                                                                                                                                                                                                                                           |
| IMAGE_INLINE_SIZE_LIMIT | 🚫 Ignored  |  ✅ Used   | By default, images smaller than 10,000 bytes are encoded as a data URI in base64 and inlined in the CSS or JS build artifact. Set this to control the size limit in bytes. Setting it to 0 will disable the inlining of images.                                                                                                                                                                                                                                                                                                                                                                                                                                          |
| EXTEND_ESLINT           |   ✅ Used   |  ✅ Used   | When set to `true`, ESLint configs that extend `eslint-config-react-app` will be used by `eslint-loader`. Any rules that are set to `"error"` will stop the application from building.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   |
| TSC_COMPILE_ON_ERROR    |   ✅ Used   |  ✅ Used   | When set to `true`, you can run and properly build TypeScript projects even if there are TypeScript type check errors. These errors are printed as warnings in the terminal and/or browser console.                                                                                                                                                                                                                                                                                                                                                                                                                                                                      |

</details>
</summary>

### .env

> Note: You must create custom environment variables beginning with `REACT_APP_`. Any other variables except `NODE_ENV` will be ignored. Changing any environment variables will require you to restart the development server if it is running.

.env files should be checked into source control (with the exclusion of .env\*.local).

- `.env`: Default.
- `.env.local`: Local overrides. **This file is loaded for all environments except test.**
- `.env.development`, `.env.test`, `.env.production`: Environment-specific settings.
- `.env.development.local`, `.env.test.local`, `.env.production.local`: Local overrides of environment-specific settings.

> In azure pipelines the `.env.${Build_SourceBranchName}` will be copied to `.env.local` for CI build.

Files on the left have more priority than files on the right:

- `npm start`: `.env.development.local`, `.env.development`, `.env.local`, `.env`
- `npm run build`: `.env.production.local`, `.env.production`, `.env.local`, `.env`
- `npm test`: `.env.test.local`, `.env.test`, `.env` (**note `.env.local` is missing**)

These variables will act as the defaults if the machine does not explicitly set them.

## CI-CD

This Project using [Azure Pipelines](https://docs.microsoft.com/en-us/azure/devops/pipelines/ecosystems/javascript) for continuous integration and continuous delivery.
It's defined in [azure-pipelines.yml](azure-pipelines.yml)

### CI

- build
- test
- format

### CD

## Git Hook

You can use `--no-verify` to skip the git hook verification, but it was **NOT** recommended.

### pre-commit

> check before git commit.

will check the foramt of staged files added by this commit.

### pre-push

> check before git push.

will run all test an format checking.

### commit-msg

> check the commit msg.

do nothing.

## Learn More

You can learn more in the [React App documentation](https://facebook.github.io/create-react-app/docs/getting-started).

To learn React, check out the [React documentation](https://reactjs.org/).
