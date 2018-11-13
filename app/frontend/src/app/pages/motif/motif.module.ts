/*
 *     Copyright 2017-2018 Bagaev Dmitry
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
 */


import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { MotifPageComponent } from 'pages/motif/motif.component';
import { MotifPageRouting } from 'pages/motif/motif.routing';
import { MotifService } from 'pages/motif/motif.service';

@NgModule({
  imports:      [ CommonModule, MotifPageRouting ],
  declarations: [ MotifPageComponent ],
  exports:      [ MotifPageComponent ],
  providers:    [ MotifService ]
})
export class MotifPageModule {}