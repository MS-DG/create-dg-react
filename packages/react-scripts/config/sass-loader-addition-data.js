'use strict';
const fs = require('fs');
const path = require('path');
const paths = require('./paths');

const GlobalScss = path.join(paths.appSrc, '_global.scss');
const hasGlobalScss = fs.existsSync(GlobalScss);

const scssValidateCache = {};
function encodeScssValue(value) {
    if (scssValidateCache[value]) {
        return scssValidateCache[value];
    }
    const sass = require('sass');

    try {
        sass.renderSync({ data: `$c : ${value} !default;` });
        return (scssValidateCache[value] = value);
        // eslint-disable-next-line no-empty
    } catch (e) { }

    try {
        sass.renderSync({ data: `$c : "${value}" !default;` });
        return (scssValidateCache[value] = `"${value}"`);
        // eslint-disable-next-line no-empty
    } catch (e) { }

    return false;
}
// sass loader
module.exports = function (content, loaderContext) {
    var values = '';
    for (const key in process.env) {
        if (
            /^REACT_APP/.test(key) ||
            key === 'PUBLIC_URL' ||
            key === 'NODE_ENV'
        ) {
            const value = process.env[key];
            const encodedValue = encodeScssValue(value);
            if (!encodedValue) {
                console.error('invalidate scss value', key, value);
            } else {
                values += `$${key} : ${encodedValue} !default;\n`;
            }
        }
    }
    if (hasGlobalScss) {
        const resourcePath = loaderContext.resourcePath;
        const relativeGlobal = path
            .relative(path.dirname(resourcePath), GlobalScss)
            .replace(/\\/g, '/');
        values += '@import "' + relativeGlobal + '";';
    }
    return values + content;
}