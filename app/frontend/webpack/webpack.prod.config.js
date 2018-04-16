/*
 *        Copyright 2017 Bagaev Dmitry
 *
 *        Licensed under the Apache License, Version 2.0 (the "License");
 *        you may not use this file except in compliance with the License.
 *        You may obtain a copy of the License at
 *
 *            http://www.apache.org/licenses/LICENSE-2.0
 *
 *        Unless required by applicable law or agreed to in writing, software
 *        distributed under the License is distributed on an "AS IS" BASIS,
 *        WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *        See the License for the specific language governing permissions and
 *        limitations under the License.
 *
 */
console.log('Running webpack in production mode');

const base = require('./webpack.base.config');
const path = require('path');
const glob = require('glob-all');
const webpack = require('webpack');
const PurifyCSSPlugin = require('purifycss-webpack');

const configuration = base.getBaseConfiguration();

configuration.mode = 'production';
configuration.optimization = { minimize: true };
configuration.stats = 'errors-only';
configuration.entry = {
    'styles.js': [ './styles/main.less' ],
    'polyfills-ie.bundle.js': [ './src/polyfills-ie.js' ]
};

const plugins = [
    new webpack.NoEmitOnErrorsPlugin(),
    new PurifyCSSPlugin({
        paths: glob.sync([
            path.join(__dirname, '../views/**/*.html'),
            path.join(__dirname, '../src/app/**/*.html')
        ]),
        purifyOptions: {
            info: true,
            minify: true,
            output: path.join(base.getBuildPath(), 'bundle.min.css'),
            whitelist: [
                'success', 'warning', 'error', 'info', 'checkmark', 'box', 'sign', 'remove',
                'circle', 'icon', 'violet', 'circular', 'circle',
                'text', 'alignment', 'big', 'hover-inside-icon', 'overview', 'pre', 'code' ]
        }
    })
];

configuration.plugins.push(...plugins);

module.exports = configuration;
