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
import { RouterModule } from '@angular/router';
import { LoggerService } from '../../utils/logger/logger.service';
import { HomePageComponent } from './home.component';
import { SummaryComponent } from './summary/summary.component';
import { SummaryService } from './summary/summary.service';

@NgModule({
    imports:      [ RouterModule.forChild([ { path: '', component: HomePageComponent } ]) ],
    declarations: [ HomePageComponent, SummaryComponent ],
    exports:      [ HomePageComponent, SummaryComponent ],
    providers:    [
        { provide: SummaryService, useClass: SummaryService, deps: [ LoggerService ] }
    ]
})
export class HomePageModule {}
