import { Filter, FilterInterface, FilterType } from "../filters";
import { SetEntry } from "../common/set/set-entry";
import { Utils } from "../../../utils/utils";


export class MetaGeneralFilter implements FilterInterface {
    referencesSelected: SetEntry[] = [];
    referencesValues: string[];

    methodSort: boolean;
    methodCulture: boolean;
    methodOther: boolean;

    seqSanger: boolean;
    seqAmplicon: boolean;
    seqSingleCell: boolean;

    setDefault(): void {
        Utils.Array.clear(this.referencesSelected);
        this.methodSort = true;
        this.methodCulture = true;
        this.methodOther = true;
        this.seqSanger = true;
        this.seqAmplicon = true;
        this.seqSingleCell = true;
    }

    collectFilters(filters: Filter[], _: string[]): void {
        if (this.referencesSelected.length > 0) {
            filters.push(new Filter('reference.id', FilterType.SubstringSet, false, SetEntry.toString(this.referencesSelected)));
        }
        if (this.methodSort === false) {
            filters.push(new Filter('web.method', FilterType.Exact, true, 'sort'));
        }
        if (this.methodCulture === false) {
            filters.push(new Filter('web.method', FilterType.Exact, true, 'culture'));
        }
        if (this.methodOther === false) {
            filters.push(new Filter('web.method', FilterType.Exact, true, 'other'));
        }
        if (this.seqSanger === false) {
            filters.push(new Filter('web.method.seq', FilterType.Exact, true, 'sanger'));
        }
        if (this.seqAmplicon === false) {
            filters.push(new Filter('web.method.seq', FilterType.Exact, true, 'amplicon'));
        }
        if (this.seqSingleCell === false) {
            filters.push(new Filter('web.method.seq', FilterType.Exact, true, 'singlecell'));
        }
    }

    getFilterId(): string {
        return 'meta.general';
    }
}

export class MetaReliabilityFilter implements FilterInterface {
    minimalConfidenceScore: number;
    nonCanonical: boolean;
    unmapped: boolean;

    setDefault(): void {
        this.minimalConfidenceScore = 0;
        this.nonCanonical = false;
        this.unmapped = false;
    }

    collectFilters(filters: Filter[], _: string[]): void {
        if (this.minimalConfidenceScore > 0) {
            filters.push(new Filter('vdjdb.score', FilterType.Level, false, this.minimalConfidenceScore.toString()));
        }
        if (this.nonCanonical === false) {
            filters.push(new Filter('web.cdr3fix.nc', FilterType.Exact, true, 'yes'));
        }
        if (this.unmapped === false) {
            filters.push(new Filter('web.cdr3fix.unmp', FilterType.Exact, true, 'yes'));
        }
    }

    getFilterId(): string {
        return 'meta.reliability';
    }
}