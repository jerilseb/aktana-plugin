// rollup.config.js
import { nodeResolve } from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import scss from 'rollup-plugin-scss';
import inlineSvg from 'rollup-plugin-inline-svg';

export default [
    {
      input: 'src/js/inject.js',
      output: {
        file: 'extension/content-scripts/inject.js',
        format: 'es'
      },
      plugins: [
          nodeResolve(),
          commonjs(),
          scss({
            output: true
          }),
          inlineSvg()
        ]
    }
]