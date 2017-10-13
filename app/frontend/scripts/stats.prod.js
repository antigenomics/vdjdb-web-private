/*
 *    Copyright 2017 Bagaev Dmitry
 *
 *    Licensed under the Apache License, Version 2.0 (the "License");
 *    you may not use this file except in compliance with the License.
 *    You may obtain a copy of the License at
 *
 *        http://www.apache.org/licenses/LICENSE-2.0
 *
 *    Unless required by applicable law or agreed to in writing, software
 *    distributed under the License is distributed on an "AS IS" BASIS,
 *    WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *    See the License for the specific language governing permissions and
 *    limitations under the License.
 */

require('console.table');
require('console');

const fs = require("fs");
const path = require('path');
const pathToBundle = path.resolve(__dirname, '../../../public/bundles/');
const gzipSize = require('gzip-size');
const md5File = require('md5-file');

function getStats(fileName) {
    const stats = fs.statSync(pathToBundle + '/' + fileName);
    const size = (stats.size / 1024.0).toFixed(2);
    const gzip = (gzipSize.sync(fs.readFileSync(pathToBundle + '/' + fileName)) / 1024.0).toFixed(2);

    return {
        fileName: fileName,
        size: size,
        gzip: gzip
    }
}

function hashFile(fileName) {
    const hash = md5File.sync(pathToBundle + '/' + fileName);
    const hashedName = hash + '.' + fileName;
    fs.renameSync(pathToBundle + '/' + fileName, pathToBundle + '/' + hashedName);
    return hashedName;
}

if (fs.existsSync(pathToBundle + '/bundle.css')) {
    fs.unlinkSync(pathToBundle + '/bundle.css');
}

const bundleFiles = [
    'vendor.min.js',
    'bundle.min.js',
    'bundle.min.css'
];

var total = {
    size: 0,
    gzip: 0
};

const bundleStats = bundleFiles
    .map(function (fileName, index) {
        const stats = getStats(fileName);
        total.size += parseFloat(stats.size);
        total.gzip += parseFloat(stats.gzip);
        return {
            '#': index + 1,
            'File name': stats.fileName,
            'Size': stats.size += ' KB',
            'gzip': stats.gzip += ' KB'
        }
    })
    .concat([
        {
            '#': '',
            'File name': '================',
            'Size': '===========',
            'gzip': '==========='
        },
        {
            '#': '',
            'File name': '',
            'Size': total.size.toFixed(2) + ' KB',
            'gzip': total.gzip.toFixed(2) + ' KB'
        }
    ]);

console.table('Fronted bundle statistics', bundleStats);
//
// var mapNames = {};
// bundleFiles.forEach(function(fileName) {
//    mapNames[fileName] = hashFile(fileName);
// });
//
// fs.writeFile(pathToBundle + '/' + 'bundle-info.json', JSON.stringify(mapNames));
