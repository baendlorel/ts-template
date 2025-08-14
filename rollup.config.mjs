import pkg from './package.json' with { type: 'json' };
import path from 'path';
import dts from 'rollup-plugin-dts';
import typescript from '@rollup/plugin-typescript';
import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import alias from '@rollup/plugin-alias';
import terser from '@rollup/plugin-terser';
import babel from '@rollup/plugin-babel';
import replace from '@rollup/plugin-replace';

const tsconfig = './tsconfig.build.json';

/**
 * @type {import('@rollup/plugin-alias').RollupAliasOptions}
 */
const aliasOpts = {
  entries: [{ find: /^@/, replacement: path.resolve(import.meta.dirname, 'src') }],
};

/**
 * @type {import('@rollup/plugin-replace').RollupReplaceOptions}
 */
const replaceOpts = {
  preventAssignment: true,
  __VERSION__: pkg.version,
  __NAME__: pkg.name.replace(/(^|-)(\w)/g, (_, __, c) => c.toUpperCase()),
};

/**
 * @type {import('rollup').RollupOptions}
 */
export default [
  // * Main
  {
    input: 'src/index.ts',
    output: [
      {
        file: 'dist/index.mjs',
        format: 'esm',
        sourcemap: false,
      },
    ],

    plugins: [
      alias(aliasOpts),
      replace(replaceOpts),
      resolve(),
      commonjs(),
      babel({
        babelHelpers: 'bundled',
        extensions: ['.ts', '.tsx', '.js', '.jsx'],
        presets: [['@babel/preset-env', { targets: { node: '14' } }]],
        plugins: [
          [
            '@babel/plugin-proposal-decorators',
            {
              version: '2023-11',
            },
          ],
        ],
      }),
      typescript({ tsconfig }),
      terser({
        format: {
          comments: false, // remove comments
        },
        compress: {
          drop_console: true,
          dead_code: true, // ✅ Safe: remove dead code
          evaluate: true, // ✅ Safe: evaluate constant expressions
        },
        mangle: {
          properties: {
            regex: /^_/, // only mangle properties starting with '_'
          },
        },
      }),
    ],
    external: [],
  },
  // * Declarations
  {
    input: 'src/index.ts',
    output: [{ file: 'dist/index.d.ts', format: 'es' }],
    plugins: [alias(aliasOpts), replace(replaceOpts), dts({ tsconfig })],
  },
];
