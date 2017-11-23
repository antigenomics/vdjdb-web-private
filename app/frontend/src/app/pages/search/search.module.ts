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

import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouterModule } from '@angular/router';
import { FiltersModule } from '../../shared/filters/filters.module';
import { NotificationModule } from '../../utils/notification/notification.module';
import { SearchInfoComponent } from './info/search-info.component';
import { SearchPageComponent } from './search.component';
import { SearchTableModule } from './table/search/search-table.module';

@NgModule({
    imports:      [ BrowserModule, FiltersModule, SearchTableModule, NotificationModule,
                    RouterModule.forChild([ { path: 'search', component: SearchPageComponent } ]) ],
    declarations: [ SearchPageComponent, SearchInfoComponent ],
    exports:      [ SearchPageComponent, SearchInfoComponent ]
})
export class SearchPageModule {}