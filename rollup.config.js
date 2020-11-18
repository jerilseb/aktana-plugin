import { nodeResolve } from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import postcss from 'rollup-plugin-postcss';
import inlineSvg from "postcss-inline-svg";

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
          postcss({
            extract: true,
            plugins: [
              inlineSvg()
            ]
          })
        ]
    }
]