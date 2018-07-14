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

var webpack = require('webpack');
var webpackDevServer = require('webpack-dev-server');
var webpackConfig = require('./webpack.dev.config.js');

// Notify about the path where the server is running
console.log('[Webpack] Server running at location: ' + __dirname);

// First we fire up Webpack an pass in the configuration file
var bundleStart = null;
var compiler = webpack(webpackConfig);

// We give notice in the terminal when it starts bundling and
// set the time it started
compiler.plugin('compile', function () {
    bundleStart = Date.now();
});

// We also give notice when it is done compiling, including the
// time it took. Nice to have
compiler.plugin('done', function (stats) {
    const time = stats.endTime - stats.startTime;
    console.log('[Webpack] Bundled in ' + time + 'ms!');
});

var server = new webpackDevServer(compiler, {
    // We need to tell Webpack to serve our bundled application
    // from the build path.
    publicPath: '/bundles/',

    // Configure hot replacement
    filename: new RegExp('^.+bundle\.js$'),
    // lazy: true,
    // hot: false,
    compress: true,
    inline: true,
    // The rest is terminal configurations
    quiet: false,
    noInfo: true,
    stats: {
        colors: true
    }
});

// We fire up the development server and give notice in the terminal
// that we are starting the initial bundle
server.listen(8080, 'localhost', function () {
    console.log('[Webpack] Running in lazy mode, recompilation on request');
});

// node node_modules/webpack-dev-server/bin/webpack-dev-server.js --config webpack/webpack.dev.config.js --output-public-path="/bundles/" --no-info --devtl=false --hot=false --inline=true --compress=true