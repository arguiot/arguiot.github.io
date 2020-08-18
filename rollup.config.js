import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import {
    terser
} from 'rollup-plugin-terser';
import builtins from 'rollup-plugin-node-builtins';

const production = !process.env.ROLLUP_WATCH;

export default [{
        input: 'js/entry.js',
        output: {
            file: 'js/main.js',
            format: 'iife',
            name: 'arguiot',
            sourcemap: true
        },
        intro: '/* Copyright © 2019 Arthur Guiot */',
        plugins: [
            builtins(),
            resolve(), // tells Rollup to build using Node Modules
            commonjs(), // converts to ES modules,
            production && terser() // minify, but only in production
        ]
    }
]