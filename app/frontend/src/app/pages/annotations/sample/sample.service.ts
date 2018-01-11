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
import { sum } from 'd3-array';
import { AnnotationsService } from 'pages/annotations/annotations.service';
import { IntersectionTableFilters } from 'pages/annotations/sample/table/intersection/filters/intersection-table-filters';
import { IntersectionTable } from 'pages/annotations/sample/table/intersection/intersection-table';
import { IntersectionTableRow } from 'pages/annotations/sample/table/intersection/row/intersection-table-row';
import { SummaryFieldCounter } from 'pages/annotations/sample/table/intersection/summary/summary-field-counter';
import { Observable } from 'rxjs/Observable';
import { Subject } from 'rxjs/Subject';
import { SampleItem } from 'shared/sample/sample-item';
import { WebSocketResponseData } from 'shared/websocket/websocket-response';
import { NotificationService } from 'utils/notifications/notification.service';

export namespace SampleServiceUpdateState {
    export const PARSE: string = 'parse';
    export const ANNOTATE: string = 'annotate';
    export const LOADING: string = 'loading';
    export const COMPLETED: string = 'completed';
}

export type SampleServiceEventType = number;

export namespace SampleServiceEventType {
    export const EVENT_LOADING: number = 0;
    export const EVENT_UPDATED: number = 1;
}

export class SampleServiceEvent {
    public readonly name: string;
    public readonly type: SampleServiceEventType;

    constructor(name: string, type: SampleServiceEventType) {
        this.name = name;
        this.type = type;
    }
}

@Injectable()
export class SampleService {
    private _tables: Map<string, IntersectionTable> = new Map();
    private _filters: Map<string, IntersectionTableFilters> = new Map();
    private _events: Subject<SampleServiceEvent> = new Subject();

    constructor(private annotationsService: AnnotationsService, private notifications: NotificationService) {
    }

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
        const filters = this.isFiltersExist(sample) ? this.getFilters(sample) : new IntersectionTableFilters();
        this._filters.set(sample.name, filters);
        return filters;
    }

    public async intersect(sample: SampleItem) {
        const table = this.getTable(sample);
        const filters = this.getFilters(sample);
        table.startLoading();
        filters.disable();
        table.setLoadingLabel('Loading');
        this._events.next(new SampleServiceEvent(sample.name, SampleServiceEventType.EVENT_LOADING));
        this.annotationsService.intersect(sample, filters, (messages: Observable<WebSocketResponseData>) => {
            const messagesSubscription = messages.subscribe((response: WebSocketResponseData) => {
                if (response.isSuccess()) {
                    const state = response.get('state');
                    switch (state) {
                        case SampleServiceUpdateState.PARSE:
                            table.setLoadingLabel('Reading sample file (Stage 1 of 3)');
                            break;
                        case SampleServiceUpdateState.ANNOTATE:
                            table.setLoadingLabel('Annotating (Stage 2 of 3)');
                            break;
                        case SampleServiceUpdateState.LOADING:
                            table.setLoadingLabel('Loading (Stage 3 of 3)');
                            break;
                        case SampleServiceUpdateState.COMPLETED:
                            const summary = response.get('summary').map((v: any) => new SummaryFieldCounter(v));
                            table.updateSummary(summary);

                            let index = 0;
                            const rows = response.get('rows').map((r: any) => new IntersectionTableRow(r, index++, sample));
                            table.updatePage(0);
                            table.updateRows(rows);
                            table.updateRecordsFound(rows.length);

                            filters.enable();
                            messagesSubscription.unsubscribe();
                            break;
                        default:
                    }
                } else if (response.isError()) {
                    this.notifications.error('Annotations', 'Unable to annotate sample');
                    table.setError();
                    messagesSubscription.unsubscribe();
                }
                this._events.next(new SampleServiceEvent(sample.name, SampleServiceEventType.EVENT_UPDATED));
            });
        });
    }

    public isTableExist(sample: SampleItem): boolean {
        return this._tables.has(sample.name);
    }

    public isFiltersExist(sample: SampleItem): boolean {
        return this._filters.has(sample.name);
    }

    public getEvents(): Subject<SampleServiceEvent> {
        return this._events;
    }
}