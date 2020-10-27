'use strict';
const hasJsxRuntime = (() => {
  if (process.env.DISABLE_NEW_JSX_TRANSFORM === 'true') {
    return false;
  }

  try {
    require.resolve('react/jsx-runtime');
    return true;
  } catch (e) {
    return false;
  }
})();
module.exports = {
  extends: [require.resolve('@dragongate/eslint-config')],
  rules: {
    ...(!hasJsxRuntime && {
      'react/react-in-jsx-scope': 'error',
    }),
  },
};
