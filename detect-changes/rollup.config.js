const commonjs = require('@rollup/plugin-commonjs');
const resolve = require('@rollup/plugin-node-resolve');
const json = require('@rollup/plugin-json');

module.exports = {
  input: 'index.js',
  output: {
    file: 'dist/index.js',
    format: 'cjs',
    banner: '#!/usr/bin/env node',
  },
  plugins: [
    resolve({
      preferBuiltins: true,
    }),
    commonjs(),
    json(),
  ],
  external: [
    // Node.js built-in modules
    'child_process',
    'fs',
    'path',
    'util',
    'events',
    'stream',
    'os',
  ],
};
