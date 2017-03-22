/**
 * Index.ts
 */

const Runner = require('jscodeshift/dist/Runner.js');
const path = require('path');
const transform = path.resolve(__dirname, 'transform.js');

const files = process.argv.slice(2);

const exec = (files) => {
    return Runner.run(transform, files, {
        verbose: 0,
        babel: true,
        extensions: 'js',
        runInBand: false,
        parser: 'babel'
    });
}
exec(files);