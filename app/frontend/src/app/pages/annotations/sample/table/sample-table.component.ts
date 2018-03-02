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

import { ChangeDetectionStrategy, ChangeDetectorRef, Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { SampleRouteResolverComponent } from 'pages/annotations/sample/common/sample-route-resolver.component';
import { SampleService } from 'pages/annotations/sample/sample.service';
import { TableColumn } from 'shared/table/column/table-column';
import { ITableConfigurationDescriptor } from 'shared/table/configuration/table-configuration';

@Component({
    selector:        'sample-table',
    templateUrl:     './sample-table.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class SampleTableComponent extends SampleRouteResolverComponent {
    public configuration: ITableConfigurationDescriptor = {
        classes: {
            columns: 'center aligned',
            rows:    'fade element'
        },
        utils:   {
            disable: false,
            info:    true,
            export:  { disable: true }
        },
        size:    {
            header: {
                dynamicSizeEnabled: true,
                dynamicSizeWeightB: 0.5
            }
        }
    };

    constructor(sampleService: SampleService, activatedRoute: ActivatedRoute, changeDetector: ChangeDetectorRef) {
        super(activatedRoute.parent.data, activatedRoute.parent.snapshot, changeDetector, sampleService);
    }

    public onPageChange(page: number): void {
        this.sample.table.updatePage(page);
    }

    public onPageSizeChange(pageSize: number): void {
        this.sample.table.updatePageSize(pageSize);
    }

    public onColumnClick(column: TableColumn): void {
        if (column.sortable) {
            this.sample.table.sort(column.name, this.getColumns().findIndex((c) => c.name === column.name));
        }
    }

    // noinspection JSMethodCanBeStatic
    public getColumns(): TableColumn[] {
        return [
            new TableColumn('details', 'Details', false, false, true),
            new TableColumn('found', '# matches', true),
            new TableColumn('id', 'Rank', true),
            new TableColumn('freq', 'Frequency', true),
            new TableColumn('count', 'Count', true),
            new TableColumn('cdr3aa', 'CDR3aa', true),
            new TableColumn('v', 'V', true),
            new TableColumn('j', 'J', true),
            new TableColumn('tags', 'Tags', false, false, true)
        ];
    }

}
