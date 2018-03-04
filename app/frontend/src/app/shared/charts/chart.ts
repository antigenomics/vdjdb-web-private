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

import { NgZone } from '@angular/core';
import * as d3 from 'external/d3';
import { Observable } from 'rxjs/Observable';
import { Subject } from 'rxjs/Subject';
import { Subscription } from 'rxjs/Subscription';
import { ChartEventType, IChartEvent } from 'shared/charts/chart-events';
import { ChartContainer } from 'shared/charts/container/chart-container';
import { IChartDataEntry } from 'shared/charts/data/chart-data-entry';
import { IChartGroupedDataEntry } from 'shared/charts/data/chart-grouped-data-entry';
import { ChartTooltip } from 'shared/charts/tooltip/chart-tooltip';
import { Utils } from 'utils/utils';

export type ChartStreamType = Subject<IChartEvent<IChartDataEntry>>;
export type ChartInputStreamType = Observable<IChartEvent<IChartDataEntry>>;

export type ChartGroupedStreamType = Subject<IChartEvent<IChartGroupedDataEntry>>;
export type ChartInputGroupedStreamType = Observable<IChartEvent<IChartGroupedDataEntry>>;

// tslint:disable-next-line:interface-name
export interface Chart<T, C> {
    configure(configuration: C): void;

    create(data: T[]): void;

    update(data: T[]): number;

    updateValues(data: T[]): number;

    resize(data: T[]): number;

    destroy(): void;
}

export class Chart<T, C> {
    private static readonly createChartDelay: number = 100; // We need this to handle container view size
    private created: boolean = false;
    private dataStreamSubscription: Subscription;
    private debounceResizeListener = Utils.Time.debounce((data) => {
        this.container.recalculateContainerViewSize();
        this.resize(data);
    });

    protected tooltip: ChartTooltip;

    constructor(protected configuration: C, protected container: ChartContainer,
                protected dataStream: Observable<IChartEvent<T>>, protected ngZone: NgZone) {
        this.configure(configuration);
        this.dataStreamSubscription = this.dataStream.subscribe((event) => {
            this.ngZone.runOutsideAngular(() => {
                if (!this.created) {
                    window.setTimeout(() => {
                        this.container.recalculateContainerViewSize();
                        this.create(event.data);
                        this.created = true;
                        if (this.container.isCanvasBasedContainer()) {
                            this.container.drawCanvas();
                        }
                    }, Chart.createChartDelay);
                } else {
                    let duration: number = 0;
                    switch (event.type) {
                        case ChartEventType.UPDATE_DATA:
                            duration = this.update(event.data);
                            break;
                        case ChartEventType.UPDATE_VALUES:
                            duration = this.updateValues(event.data);
                            break;
                        case ChartEventType.RESIZE:
                            duration = this.debounceResizeListener(event.data);
                            break;
                        default:
                            break;
                    }
                    if (this.container.isCanvasBasedContainer()) {
                        const t = d3.timer((elapsed: number) => {
                            this.container.drawCanvas();
                            if (elapsed > duration) { t.stop(); }
                        });

                    }
                }
            });

        });
        this.tooltip = new ChartTooltip();
    }

    public destroy(): void {
        this.container.destroy();
        this.tooltip.destroy();
        if (this.dataStreamSubscription) {
            this.dataStreamSubscription.unsubscribe();
        }
    }
}
