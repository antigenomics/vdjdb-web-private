import { Injectable } from '@angular/core';
import { TCRGeneralFilter, TCRSegmentFilter, TCRPatternCDR3Filter } from './filters-tcr';
import { Filter, FilterInterface } from "../filters";
import { DatabaseMetadata } from "../../../database/database-metadata";


@Injectable()
export class FiltersTCRService implements FilterInterface {
    general: TCRGeneralFilter = new TCRGeneralFilter();
    segment: TCRSegmentFilter = new TCRSegmentFilter();
    cdr3pattern: TCRPatternCDR3Filter = new TCRPatternCDR3Filter();

    setDefault(): void {
        this.general.setDefault();
        this.segment.setDefault();
        this.cdr3pattern.setDefault();
    }

    setMetadataOptions(metadata: DatabaseMetadata): void {
        this.general.setMetadataOptions(metadata);
        this.segment.setMetadataOptions(metadata);
        this.cdr3pattern.setMetadataOptions(metadata);
    }

    isValid(): boolean {
        return this.general.isValid() && this.segment.isValid() && this.cdr3pattern.isValid();
    }

    getErrors(): string[] {
        return this.general.getErrors()
                   .concat(this.segment.getErrors())
                   .concat(this.cdr3pattern.getErrors());
    }

    getFilters(): Filter[] {
        return this.general.getFilters()
                   .concat(this.segment.getFilters())
                   .concat(this.cdr3pattern.getFilters());
    }

}