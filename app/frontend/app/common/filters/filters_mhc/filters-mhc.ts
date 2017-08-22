import { FilterInterface, Filter, FilterType } from "../filters";
import { DatabaseMetadata } from "../../../database/database-metadata";


/** ======================================================================== **/

export class MHCGeneralClassFilter implements FilterInterface {
    mhci: boolean = true;
    mhcii: boolean = true;

    setDefault(): void {
        this.mhci = true;
        this.mhcii = true;
    }

    setMetadataOptions(_: DatabaseMetadata) {

    }

    isValid(): boolean {
        return true;
    }

    getErrors(): string[] {
        return [];
    }

    getFilters(): Filter[] {
        let filters: Filter[] = [];
        if (this.mhci === false) {
            filters.push(new Filter('mhc.class', FilterType.Exact, true, 'MHCI'));
        }
        if (this.mhcii === false) {
            filters.push(new Filter('mhc.class', FilterType.Exact, true, 'MHCII'));
        }
        return filters;
    }

}

/** ======================================================================== **/

export class MHCHaplotypeFilter implements FilterInterface {
    firstChain: string = '';
    firstChainAutocomplete: string[] = [];
    secondChain: string = '';
    secondChainAutocomplete: string[] = [];

    setDefault(): void {
        this.firstChain = '';
        this.secondChain = '';
    }

    setMetadataOptions(metadata: DatabaseMetadata) {
        this.firstChainAutocomplete = metadata.getColumnInfo("mhc.a").autocomplete;
        this.secondChainAutocomplete = metadata.getColumnInfo("mhc.b").autocomplete;
    }

    isValid(): boolean {
        return true;
    }

    getErrors(): string[] {
        return [];
    }

    getFilters(): Filter[] {
        let filters: Filter[] = [];
        if (this.firstChain.length > 0) {
            filters.push(new Filter('mhc.a', FilterType.SubstringSet, false, this.firstChain));
        }
        if (this.secondChain.length > 0) {
            filters.push(new Filter('mhc.b', FilterType.SubstringSet, false, this.secondChain));
        }
        return filters;
    }

}