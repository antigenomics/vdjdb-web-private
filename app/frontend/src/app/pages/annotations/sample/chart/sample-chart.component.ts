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

import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ReplaySubject } from 'rxjs/ReplaySubject';
import { Subject } from 'rxjs/Subject';
import { Subscription } from 'rxjs/Subscription';
import { IBarChartHorizontalDataEntry } from 'shared/charts/bar/horizontal/bar-chart-horizontal';
import { ChartEventType, IChartEvent } from 'shared/charts/chart-events';
import { IChartContainerConfiguration } from 'shared/charts/container/chart-container-configuration';
import { SampleItem } from 'shared/sample/sample-item';

@Component({
    selector:        'sample-chart',
    templateUrl:     './sample-chart.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class SampleChartComponent implements OnInit {
    private _routeSampleSubscription: Subscription;
    private _count: number = 0;

    public sample: SampleItem;
    public configuration: IChartContainerConfiguration;

    public stream: Subject<IChartEvent<IBarChartHorizontalDataEntry>> = new ReplaySubject(1);

    constructor(private activatedRoute: ActivatedRoute, private changeDetector: ChangeDetectorRef) {
        this.sample = this.activatedRoute.snapshot.data.sample;
        this.configuration = {
            margin: {
                left: 80, right: 25, top: 20, bottom: 20
            }
        };

        const data = this.generateRandomData(20, 10, 20);
        this.stream.next({ type: ChartEventType.INITIAL_DATA, data });
        this._count = data.length;
    }

    public update(): void {
        const data = this.generateRandomData(Math.floor(Math.random() * 20) + 1, 1, 100);
        this.stream.next({ type: ChartEventType.UPDATE_DATA, data });
        this._count = data.length;
    }

    public updateValues(): void {
        this.stream.next({ type: ChartEventType.UPDATE_VALUES, data: this.generateRandomData(this._count, 1, 100) });
    }

    public ngOnInit(): void {
        this._routeSampleSubscription = this.activatedRoute.data.subscribe((data: { sample: SampleItem }) => {
            this.sample = data.sample;
            this.changeDetector.detectChanges();
        });
    }

    private generateRandomData(count: number, min: number, max: number): IBarChartHorizontalDataEntry[] {
        const data: IBarChartHorizontalDataEntry[] = [];
        for (let i = 0; i < count; ++i) {
            data.push({ name: `some text ${i}`, value: Math.floor(Math.random() * (max - min)) + min });
        }
        return data;
    }
}
