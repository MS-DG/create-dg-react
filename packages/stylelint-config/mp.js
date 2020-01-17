'use strict';

module.exports = {
    'extends': ['./index.js'],
    rules: {
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
    }
}