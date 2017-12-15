/*
 *    Copyright 2017 Bagaev Dmitry
 *
 *     Licensed under the Apache License, Version 2.0 (the "License");
 *     you may not use this file except in compliance with the License.
 *     You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 *     Unless required by applicable law or agreed to in writing, software
 *     distributed under the License is distributed on an "AS IS" BASIS,
 *     WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *     See the License for the specific language governing permissions and
 *     limitations under the License.
 *
 */

export class TableClassesSettings {
    public readonly columns: string = '';
    public readonly rows: string = '';

    constructor(columns: string, rows: string) {
        this.columns = columns;
        this.rows = rows;
    }
}

export class TableUtilsSettings {
    public disable: boolean = false;
    public pagination: boolean = true;
    public info: boolean = true;
    public export: boolean = true;
    public pageSize: boolean = true;
}

export class TableSettings {
    public readonly classes: TableClassesSettings;
    public readonly utils: TableUtilsSettings;

    constructor(classes: TableClassesSettings, utils: TableUtilsSettings) {
        this.classes = classes;
        this.utils = utils;
    }
}