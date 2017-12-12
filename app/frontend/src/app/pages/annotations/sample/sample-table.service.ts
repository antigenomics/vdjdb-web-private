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

import { Injectable } from '@angular/core';
import { Subject } from 'rxjs/Subject';
import { SampleItem } from '../../../shared/sample/sample-item';
import { NotificationService } from '../../../utils/notifications/notification.service';
import { AnnotationsService } from '../annotations.service';
import { IntersectionTableColumnInfo } from './table/column/intersection-table-column-info';
import { IntersectionTableFilters } from './table/filters/intersection-table-filters';
import { IntersectionTable } from './table/intersection-table';
import { IntersectionTableRow } from './table/row/intersection-table-row';

export type SampleTableServiceEventType = number;

export namespace SampleTableServiceEventType {
    export const TABLE_LOADING: number = 0;
    export const TABLE_UPDATED: number = 1;
}

export class SampleTableServiceEvent {
    public readonly name: string;
    public readonly type: SampleTableServiceEventType;

    constructor(name: string, type: SampleTableServiceEventType) {
        this.name = name;
        this.type = type;
    }
}

@Injectable()
export class SampleTableService {
    private _tables: Map<string, IntersectionTable> = new Map();
    private _filters: Map<string, IntersectionTableFilters> = new Map();
    private _events: Subject<SampleTableServiceEvent> = new Subject();

    constructor(private annotationsService: AnnotationsService, private notifications: NotificationService) {}

    public getTable(sample: SampleItem): IntersectionTable {
        return this._tables.get(sample.name);
    }

    public getFilters(sample: SampleItem): IntersectionTableFilters {
        return this._filters.get(sample.name);
    }

    public getOrCreateTable(sample: SampleItem): IntersectionTable {
        const table = this.isTableExist(sample) ? this.getTable(sample) : new IntersectionTable(sample);
        this._tables.set(sample.name, table);
        return table;
    }

    public getOrCreateFilters(sample: SampleItem): IntersectionTableFilters {
        const filters = this.isFiltersExist(sample) ? this.getFilters(sample): new IntersectionTableFilters();
        this._filters.set(sample.name, filters);
        return filters;
    }

    public async intersect(sample: SampleItem) {
        const table = this.getTable(sample);
        const filters = this.getFilters(sample);
        table.startLoading();
        filters.disable();
        this._events.next(new SampleTableServiceEvent(sample.name, SampleTableServiceEventType.TABLE_LOADING));
        const response = await this.annotationsService.intersect(sample, filters);
        if (response.isSuccess()) {
            const rows = response.get('rows').map((r: any) => new IntersectionTableRow(r));
            table.updatePage(0);
            table.updateRows(rows);
        } else if (response.isError()) {
            this.notifications.error('Annotations', 'Unable to annotate sample');
            table.setError();
        }
        this._tables.set(sample.name, table);
        filters.enable();
        this._events.next(new SampleTableServiceEvent(sample.name, SampleTableServiceEventType.TABLE_UPDATED));
    }

    public isTableExist(sample: SampleItem): boolean {
        return this._tables.has(sample.name);
    }

    public isFiltersExist(sample: SampleItem): boolean {
        return this._filters.has(sample.name);
    }

    public getEvents(): Subject<SampleTableServiceEvent> {
        return this._events;
    }

    public getColumns(): IntersectionTableColumnInfo[] {
        return [
            new IntersectionTableColumnInfo('details', 'Details', 'collapsing'),
            new IntersectionTableColumnInfo('id', 'Rank', 'collapsing'),
            new IntersectionTableColumnInfo('found', '# matches', 'collapsing'),
            new IntersectionTableColumnInfo('freq', 'Frequency', 'collapsing'),
            new IntersectionTableColumnInfo('count', 'Count', 'collapsing'),
            new IntersectionTableColumnInfo('cdr3aa', 'CDR3aa', 'collapsing'),
            new IntersectionTableColumnInfo('v', 'V', 'collapsing'),
            new IntersectionTableColumnInfo('j', 'J', 'collapsing'),
            new IntersectionTableColumnInfo('tags', 'Tags', 'collapsing')
        ];
    }

}
