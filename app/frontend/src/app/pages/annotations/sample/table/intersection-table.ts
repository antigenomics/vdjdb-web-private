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

import { SampleItem } from '../../../../shared/sample/sample-item';
import { Table } from '../../../../shared/table/table';
import { IntersectionTableRow } from './row/intersection-table-row';

export class IntersectionTable extends Table<IntersectionTableRow> {
    private _sample: SampleItem;

    constructor(sample: SampleItem) {
        super();
        this._sample = sample;
    }

    public getSample(): SampleItem {
        return this._sample;
    }

    public getCurrentPage(): IntersectionTableRow[] {
        if (this.page >= 0) {
            let fromIndex = this.pageSize * this.page;
            fromIndex = (fromIndex > this.getRowsCount()) ? this.getRowsCount() : fromIndex;
            let toIndex = this.pageSize * (this.page + 1);
            toIndex = (toIndex > this.getRowsCount()) ? this.getRowsCount() : toIndex;
            return (this.rows as IntersectionTableRow[]).slice(fromIndex, toIndex);
        } else {
            this.updatePage(0);
            return this.getCurrentPage();
        }
    }

    public getRowsCount(): number {
        return (this.rows as IntersectionTableRow[]).length;
    }
}
