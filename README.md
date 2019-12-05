# [Create DG-React](https://github.com/MS-DG/create-dg-react)

Create DG React apps with no build configuration.

> **You should login to the Microsoft Corp with your MSFT acount in your PC. When use the Default Template**

- [Creating an App](#creating-an-app) – How to create a new app.
- [User Guide](https://facebook.github.io/create-react-app/) – How to develop apps bootstrapped with Create React App.

Create DG React App works on macOS, Windows, and Linux.

## Quick Overview

```sh
npm create dg-react dg-app
cd dg-app
npm start
```

_([npx](https://medium.com/@maybekatz/introducing-npx-an-npm-package-runner-55f7d4bd282b) comes with npm 5.2+ and higher, see [instructions for older npm versions](https://gist.github.com/gaearon/4064d3c23a77c74a3614c498a8bb1c5f))_

Then open [http://localhost:3000/](http://localhost:3000/) to see your app.<br>
When you’re ready to deploy to production, create a minified bundle with `npm run build`.

### Get Started Immediately

You **don’t** need to install or configure tools like Webpack or Babel.<br>
They are preconfigured and hidden so that you can focus on the code.

Create a project, and you’re good to go.

## Creating an App

**You’ll need to have Node 8.16.0 or Node 10.16.0 or later version on your local development machine** (but it’s not required on the server). You can use [nvm](https://github.com/creationix/nvm#installation) (macOS/Linux) or [nvm-windows](https://github.com/coreybutler/nvm-windows#node-version-manager-nvm-for-windows) to switch Node versions between different projects.

To create a new app, you may choose one of the following methods:

### npx

```sh
npx create-dg-react dg-app
```

_([npx](https://medium.com/@maybekatz/introducing-npx-an-npm-package-runner-55f7d4bd282b) is a package runner tool that comes with npm 5.2+ and higher, see [instructions for older npm versions](https://gist.github.com/gaearon/4064d3c23a77c74a3614c498a8bb1c5f))_

### npm

```sh
npm create dg-react dg-app
```

_`npm create <initializer>` is available in npm 6+_

### Yarn

```sh
yarn create dg-react dg-app
```

_`yarn create` is available in Yarn 0.25+_

### Default template

It will create a directory called `dg-app` inside the current folder.<br>
Inside that directory, it will generate the initial project structure and install the transitive dependencies:

```
dg-app
├── README.md
├── node_modules
├── package.json
├── .gitignore
├── public
│   ├── favicon.ico
│   ├── index.html
│   └── manifest.json
└── src
    ├── App.scss
    ├── App.tsx
    ├── App.test.tsx
    ├── index.scss
    ├── index.tsx
    ├── logo.svg
    └── serviceWorker.ts
```

No configuration or complicated folder structures, only the files you need to build your app.<br>
Once the installation is done, you can open your project folder:

```sh
cd dg-app
```

Inside the newly created project, you can run some built-in commands:

#### `npm start` or `yarn start`

Runs the app in development mode.

Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

The page will automatically reload if you make changes to the code.

You will see the build errors and lint warnings in the console.

<p align='center'>
<img src='https://cdn.jsdelivr.net/gh/marionebl/create-react-app@9f6282671c54f0874afd37a72f6689727b562498/screencast-error.svg' width='600' alt='Build errors'>
</p>

#### `npm test` or `yarn test`

Runs the test watcher in an interactive mode.
By default, runs tests related to files changed since the last commit.

[Read more about testing.](https://facebook.github.io/create-react-app/docs/running-tests)

#### `npm run build` or `yarn build`

Builds the app for production to the `build` folder.<br>
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.<br>

Your app is ready to be deployed.

## User Guide

You can find detailed instructions on using Create DG App and many tips in [Create React App documentation (almost the same behaviors)](https://facebook.github.io/create-react-app/).

### How to Update to New Versions?

#### if you want to update current project (already exists)

just update the dependency `@dragongate/react-scripts`.

#### if you want to create a new project

just [create a app](#creating-an-app) without global install.

## Philosophy

- **One Dependency:** There is only one build dependency. It uses Webpack, Babel, ESLint, and other amazing projects, but provides a cohesive curated experience on top of them.

- **No Configuration:** You don't need to configure anything. A reasonably good configuration of both development and production builds is handled for you so you can focus on writing code.

## What’s Included?

Your environment will have everything you need to build a modern single-page React app:

- Integrated with Azure pipelines
- Shared vscode (IDE) config and plugins
- Force formatting
- React, JSX, ES6, TypeScript and Flow syntax support.
- Language extras beyond ES6 like the object spread operator.
- Autoprefixed CSS, so you don’t need `-webkit-` or other prefixes.
- A fast interactive unit test runner with built-in support for coverage reporting.
- A live development server that warns about common mistakes.
- A build script to bundle JS, CSS, and images for production, with hashes and sourcemaps.
- An offline-first [service worker](https://developers.google.com/web/fundamentals/getting-started/primers/service-workers) and a [web app manifest](https://developers.google.com/web/fundamentals/engage-and-retain/web-app-manifest/), meeting all the [Progressive Web App](https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app) criteria. (_Note: Using the service worker is opt-in as of `react-scripts@2.0.0` and higher_)
- Hassle-free updates for the above tools with a single dependency.

The tradeoff is that **these tools are preconfigured to work in a specific way**. If your project needs more customization, you can ["eject"](https://facebook.github.io/create-react-app/docs/available-scripts#npm-run-eject) and customize it, but then you will need to maintain this configuration.

## License

MIT
