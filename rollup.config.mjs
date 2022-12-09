import { terser } from 'rollup-plugin-terser';
import typescript from '@rollup/plugin-typescript';
import dts from 'rollup-plugin-dts';
import { nodeResolve } from '@rollup/plugin-node-resolve';

const input = './lib/index.ts';
const sourcemap = true;

export default [
  {
    input,
    output: {
      file: 'dist/micro-totp.es.mjs',
      format: 'es',
      sourcemap,
    },
    plugins: [typescript(), nodeResolve()],
  },
  {
    input,
    output: {
      file: 'dist/index.d.ts',
      format: 'es',
    },
    plugins: [dts()],
  },
  {
    input,
    output: {
      file: 'dist/micro-totp.cjs',
      format: 'cjs',
      sourcemap,
    },
    plugins: [typescript(), nodeResolve()],
  },
];
