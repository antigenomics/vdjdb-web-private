

/*
 *     Copyright 2017 Bagaev Dmitry
 *
 *     Licensed under the Apache License, Version 2.0 (the "License");
 *     you may not use this file except in compliance with the License.
 *     You may obtain a copy of the License at
 *
 *         http://www.apache.org/licenses/LICENSE-2.0
 *
 *     Unless required by applicable law or agreed to in writing, software
 *     distributed under the License is distributed on an "AS IS" BASIS,
 *     WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *     See the License for the specific language governing permissions and
 *     limitations under the License.
 *
 */

const fs = require("fs");
const path = require('path');
const glob = require('glob');
const pathToBundle = path.resolve(__dirname, '../../../public/bundles/');

const names = [ 'main.', 'runtime.', 'polyfills.' ];
const files = glob.sync(pathToBundle + '/*.@(js|css)').filter((file) => names.some((name) => file.includes(name))).map((path) => {
    return { basename: path.replace(/\\/g, '/').replace(/.*\//, ''), dirname: path.replace(/\\/g, '/').replace(/\/[^\/]*$/, ''), path: path }
})
files.forEach((file) => fs.renameSync(file.path, file.dirname + '/' + names.find((n) => file.basename.includes(n)) + 'js'))