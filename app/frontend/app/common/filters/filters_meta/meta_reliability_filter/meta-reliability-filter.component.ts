import { Component } from '@angular/core';
import { FiltersService } from '../../filters.service';
import { Filter, FilterInterface, FilterSavedState, FilterType } from '../../filters';
import { Subject } from 'rxjs/Subject';


@Component({
    selector:    'meta-reliability-filter',
    templateUrl: './meta-reliability-filter.component.html'
})
export class MetaReliabilityFilterComponent extends FilterInterface {
    minimalConfidenceScore: number;
    nonCanonical: boolean;
    unmapped: boolean;

    constructor(filters: FiltersService) {
        super(filters);
    }

    setDefault(): void {
        this.minimalConfidenceScore = 0;
        this.nonCanonical = false;
        this.unmapped = false;
    }

    collectFilters(filtersPool: Subject<Filter[]>): void {
        let filters: Filter[] = [];
        if (this.minimalConfidenceScore > 0) {
            filters.push(new Filter('vdjdb.score', FilterType.Level, false, this.minimalConfidenceScore.toString()));
        }
        if (this.nonCanonical === false) {
            filters.push(new Filter('web.cdr3fix.nc', FilterType.Exact, true, 'yes'));
        }
        if (this.unmapped === false) {
            filters.push(new Filter('web.cdr3fix.unmp', FilterType.Exact, true, 'yes'));
        }
        filtersPool.next(filters);
    }

    getFilterId(): string {
        return 'meta.reliability';
    }

    getSavedState(): FilterSavedState {
        return {
            minimalConfidenceScore: this.minimalConfidenceScore,
            nonCanonical:           this.nonCanonical,
            unmapped:               this.unmapped
        };
    }

    setSavedState(state: FilterSavedState): void {
        this.minimalConfidenceScore = state.minimalConfidenceScore;
        this.nonCanonical = state.nonCanonical;
        this.unmapped = state.unmapped;
    }
}