/**
 * Index.ts
 */

const Runner = require('jscodeshift/dist/Runner.js');
const path = require('path');
const transform = path.resolve(__dirname, 'transform.js');

module.exports = (files) => {
    return Runner.run(transform, files, {
        verbose: 0,
        babel: true,
        extensions: 'js',
        runInBand: false,
        parser: 'babel'
    });
}