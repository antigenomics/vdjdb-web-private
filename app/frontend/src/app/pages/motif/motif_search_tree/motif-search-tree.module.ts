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
import { MotifSearchTreeComponent } from 'pages/motif/motif_search_tree/motif-search-tree.component';
import { MotifSearchGeneComponent } from 'pages/motif/motif_search_tree/motif_search_gene/motif-search-gene.component';
import { MotifSearchMhcclassComponent } from 'pages/motif/motif_search_tree/motif_search_mhcclass/motif-search-mhcclass.component';
import { MotifSearchMhcgroupComponent } from 'pages/motif/motif_search_tree/motif_search_mhcgroup/motif-search-mhcgroup.component';
import { MotifSearchSpeciesComponent } from 'pages/motif/motif_search_tree/motif_search_species/motif-search-species.component';

@NgModule({
  imports:      [ CommonModule ],
  declarations: [
    MotifSearchTreeComponent,
    MotifSearchSpeciesComponent,
    MotifSearchGeneComponent,
    MotifSearchMhcclassComponent,
    MotifSearchMhcgroupComponent
  ],
  exports:      [ MotifSearchTreeComponent ]
})
export class MotifSearchTreeModule {}