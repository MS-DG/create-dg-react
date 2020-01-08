'use strict';

module.exports = {
  plugins: [
    'stylelint-scss',
    'stylelint-order',
    'stylelint-prettier',
  ],
  extends: [
    'stylelint-config-recommended-scss',
    'stylelint-prettier/recommended',
  ],
  rules: {
    "order/order": ["dollar-variables", "custom-properties", "declarations", "rules", "at-rules"],
    'order/properties-order': ['all'],
    'prettier/prettier': true,
    'max-nesting-depth': 4,
    'selector-max-compound-selectors': 3,
    'at-rule-no-vendor-prefix': true,
    'media-feature-name-no-vendor-prefix': true,
    'color-named': null,
    'property-no-vendor-prefix': [
      true,
      {
        ignoreProperties: ['box-orient'],
      },
    ],
    'selector-no-vendor-prefix': true,
    'value-no-vendor-prefix': [
      true,
      {
        ignoreValues: ['box'],
      },
    ],
    'selector-class-pattern': [
      '^(?:is|has|[a-zA-Z][a-zA-Z0-9]*)-[a-z][a-zA-Z0-9]*$|^[A-Z][a-zA-Z0-9]*(?:-[a-z][a-zA-Z0-9]*)?(?:_[a-z][a-zA-Z0-9]*)?$',
      {
        message:
          'class name MUST be Lite BEM: `.ComponentName-descendentName_modifierName`,`utilityName-propertyName`,`.is-stateOfComponent` or `.has-propertyOfComponent`精简版BEM',
        resolveNestedSelectors: true,
      },
    ],
    'unit-no-unknown': [
      true,
      {
        ignoreUnits: ['rpx'],
      },
    ],
    'selector-type-no-unknown': [
      true,
      {
        ignoreTypes: [
          'view',
          '/^[a-zA-Z]*-view$/',
          'page',
          'text',
          'icon',
          'progress',
          'checkbox',
          'input',
          'radio',
          'slider',
          'switch',
          'audio',
          'image',
          'video',
          'camera',
          'live-player',
          'live-pusher',
          'map',
          'canvas',
          'open-data',
          'official-account',
          'navigator',
        ],
      },
    ],
  },
  ignoreFiles: [
    'dist/',
    'node_modules/',
    '**/*.ts',
    '**/*.js',
    '**/*.wxts',
    '**/*.wxs',
    '**/*.jsonc',
    '**/*.json5',
    '**/*.json',
    '**/*.dtpl',
    '**/*.jpg',
    '**/*.jpeg',
    '**/*.png',
    '**/*.svg',
    '**/*.gif',
  ],
};
