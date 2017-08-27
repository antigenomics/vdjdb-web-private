import { Component } from '@angular/core';
import { FiltersService } from '../../filters.service';
import { Filter, FilterInterface, FilterSavedState, FilterType } from '../../filters';
import { Subject } from 'rxjs/Subject';


@Component({
    selector:    'ag-origin-filter',
    templateUrl: './ag-origin-filter.component.html'
})
export class AGOriginFilterComponent extends FilterInterface {
    species: string;
    speciesAutocomplete: string[];

    genes: string;
    genesAutocomplete: string[];

    constructor(filters: FiltersService) {
        super(filters);
    }

    setDefault(): void {
        this.species = '';
        this.genes = '';
    }

    collectFilters(filtersPool: Subject<Filter[]>): void {
        let filters: Filter[] = [];
        if (this.species.length > 0) {
            filters.push(new Filter('antigen.species', FilterType.ExactSet, false, this.species));
        }
        if (this.genes.length > 0) {
            filters.push(new Filter('antigen.gene', FilterType.ExactSet, false, this.genes));
        }
        filtersPool.next(filters);
    }

    getFilterId(): string {
        return 'ag.origin';
    }

    getSavedState(): FilterSavedState {
        return {
            species: this.species,
            genes:   this.genes
        };
    }

    setSavedState(state: FilterSavedState): void {
        this.species = state.species;
        this.genes = state.genes;
    }
}