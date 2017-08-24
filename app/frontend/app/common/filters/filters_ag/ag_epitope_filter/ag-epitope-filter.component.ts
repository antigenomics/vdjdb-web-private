import { Component } from '@angular/core';
import { FiltersService } from "../../filters.service";
import { Filter, FilterInterface, FilterType, FilterSavedState } from "../../filters";
import { isSequencePatternValid } from "../../../../utils/pattern.util";


@Component({
    selector:    'ag-epitope-filter',
    templateUrl: './ag-epitope-filter.component.html'
})
export class AGEpitopeFilterComponent extends FilterInterface {
    epitopeSequence: string = '';
    epitopeAutocomplete: string[] = [];

    epitopePattern: string = '';
    epitopePatternSubstring: boolean = false;
    epitopePatternValid: boolean = true;

    constructor(public filters: FiltersService) {
        super(filters);
    }

    setDefault(): void {
        this.epitopeSequence = '';
        this.epitopePattern = '';
        this.epitopePatternSubstring = false;
        this.epitopePatternValid = true;
    }

    getFilters(): Filter[] {
        let filters: Filter[] = [];
        if (this.epitopeSequence.length > 0) {
            filters.push(new Filter('antigen.epitope', FilterType.ExactSet, false, this.epitopeSequence));
        }
        if (this.epitopePattern.length !== 0) {
            let value = this.epitopePattern;
            if (this.epitopePatternSubstring === false) {
                value = '^' + value + '$';
            }
            filters.push(new Filter('antigen.epitope', FilterType.Pattern, false, value.replace(/X/g, ".")));
        }
        return filters;
    }

    getFilterId(): string {
        return 'ag.epitope';
    }

    getSavedState(): FilterSavedState {
        return {
            epitopeSequence:         this.epitopeSequence,
            epitopePattern:          this.epitopePattern,
            epitopePatternSubstring: this.epitopePatternSubstring,
            epitopePatternValid:     this.epitopePatternValid
        };
    }

    setSavedState(state: FilterSavedState): void {
        this.epitopeSequence = state.epitopeSequence;
        this.epitopePattern = state.epitopePattern;
        this.epitopePatternSubstring = state.epitopePatternSubstring;
        this.epitopePatternValid = state.epitopePatternValid;
    }

    checkPattern(newValue: string): void {
        this.epitopePattern = newValue.toUpperCase();
        this.epitopePatternValid = isSequencePatternValid(this.epitopePattern);
    }

    isPatternValid(): boolean {
        return this.epitopePatternValid;
    }
}