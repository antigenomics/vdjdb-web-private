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

import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { SampleService, SampleServiceEvent, SampleServiceEventType } from 'pages/annotations/sample/sample.service';
import { IntersectionTable } from 'pages/annotations/sample/table/intersection/intersection-table';
import { SummaryFieldCounter } from 'pages/annotations/sample/table/intersection/summary/summary-field-counter';
import { Subscription } from 'rxjs/Subscription';
import { SampleItem } from 'shared/sample/sample-item';
import { LoggerService } from 'utils/logger/logger.service';

@Component({
    selector:        'sample-chart',
    templateUrl:     './sample-chart.component.html'
})
export class SampleChartComponent implements OnInit, OnDestroy {
    private _routeSampleSubscription: Subscription;

    public sample: SampleItem;

    constructor(private activatedRoute: ActivatedRoute, private sampleService: SampleService,
                private changeDetector: ChangeDetectorRef, private logger: LoggerService) {
        this.sample = this.activatedRoute.parent.snapshot.data.sample;
    }

    public ngOnInit(): void {
        this._routeSampleSubscription = this.activatedRoute.parent.data.subscribe((data: { sample: SampleItem }) => {
            this.sample = data.sample;
            this.changeDetector.detectChanges();
        });
    }

    public getData(): SummaryFieldCounter[] {
        // if (this.sample.table.isSummaryExist()) {
        //     return this.sample.table.getSummary();
        // }
        return undefined;
    }

    public intersect(): void {
        this.sampleService.intersect(this.sample);
    }

    public ngOnDestroy(): void {
        if (this._routeSampleSubscription) {
            this._routeSampleSubscription.unsubscribe();
        }
    }
}
