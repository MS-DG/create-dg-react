'use strict';

const vstsAuth = require('better-vsts-npm-auth');
const input = require('input');

function auth() {
  vstsAuth
    .run()
    .then(() => console.log('npm auth success'))
    .catch(e => {
      // we can catch AuthorizationError and prompt our users to
      // authorize the Stateless VSTS NPM OAuth application
      // (or your own application, if you specify an alternate
      // clientId in your config, which you're welcome to do)
      if (vstsAuth.isAuthorizationError(e)) {
        // wait for user input if we're running on a dev box
        // note - I like the input package, but feel free to get your user
        // input however you'd like
        return input.text('paste your refresh_token:').then(token => {
          vstsAuth.setRefreshToken(token);
          // not necessary, but nifty if you want to create a
          // seamless local dev startup experience by re-running
          return auth();
        });
      }
    });
}

module.exports = auth;
