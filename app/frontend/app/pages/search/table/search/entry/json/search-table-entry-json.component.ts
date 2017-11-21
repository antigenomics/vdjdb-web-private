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

import { ChangeDetectionStrategy, Component, HostListener } from '@angular/core';
import { ClipboardService } from '../../../../../../utils/clipboard/clipboard.service';
import { NotificationService } from '../../../../../../utils/notification/notification.service';
import { DatabaseColumnInfo } from '../../../../database/database-metadata';

@Component({
    selector: 'td[search-table-entry-json]',
    template: `<i class="info circle icon cursor pointer" [style.color]="color" [popup]="value" 
                footer="Click 'i' to copy to clipboard" [header]="title" width="250" display="list"></i>`,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class SearchTableEntryJsonComponent {
    private _value: string[];
    private _title: string;
    private _color: string;

    constructor(private clipboard: ClipboardService, private notifications: NotificationService) {}

    @HostListener('click')
    public copyToClipboard(): void {
        if (this._value.length !== 0) {
            const copyContent = this._value.join('\n');
            const result = this.clipboard.copyFromContent(copyContent);
            if (result) {
                this.notifications.info('Copy to clipboard', 'Copied successfully');
            } else {
                this.notifications.error('Copy to clipboard', 'Your browser is not supported');
            }
        } else {
            this.notifications.warn('Copy to clipboard', 'Empty content');
        }
    }

    public generate(title: string, jsonString: string, column: DatabaseColumnInfo): void {
        this._title = title;
        try {
            const json = JSON.parse(jsonString);
            let color = 'black';
            const text: string[] = [];

            const properties = Object.keys(json).sort();
            properties.forEach((property: string) => {
                if (json[property] !== '') {
                    text.push(`${property} : ${json[property]}`);
                }
            });

            // #1a9641 - green
            // #a6d96a - light green
            // #dde927 - yellow
            // #fdae61 - orange
            // #d7191c - red

            /* Disable tslint to prevent ClosureCompiler mangling */
            /* tslint:disable:no-string-literal */
            if (column.name === 'cdr3fix') {
                if (json['good'] === false) {
                    color = '#d7191c';
                } else if (json['fixNeeded'] === true) {
                    if (json['cdr3'] === json['cdr3_old']) {
                        color = '#dde927';
                    } else {
                        color = '#fdae61';
                    }
                } else {
                    color = '#1a9641';
                }
            }
            /* tslint:enable:no-string-literal */

            this._value = text;
            this._color = color;
        } catch (e) {
            this._value = [];
            this._color = 'black';
        }
    }

    get value() {
        return this._value;
    }

    get title() {
        return this._title;
    }

    get color() {
        return this._color;
    }
}