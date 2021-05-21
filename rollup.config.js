import { nodeResolve } from "@rollup/plugin-node-resolve";
import commonjs from "@rollup/plugin-commonjs";
import postcss from "rollup-plugin-postcss";
import inlineSvg from "postcss-inline-svg";
import { terser } from "rollup-plugin-terser";

const isDev = !!process.env.ROLLUP_WATCH;

export default [
    {
        input: "src/js/inject.js",
        output: {
            file: "extension/content-scripts/inject.js",
            format: "es",
        },
        plugins: [
            nodeResolve(),
            commonjs(),
            !isDev && terser(),
            postcss({
                extract: true,
                plugins: [inlineSvg()],
            }),
        ],
        watch: {
            clearScreen: false,
        },
    },
];
