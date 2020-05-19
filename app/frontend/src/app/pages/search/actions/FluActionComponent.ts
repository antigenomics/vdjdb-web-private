import { Component, OnInit } from "@angular/core";
import { Router } from "@angular/router";
import { AGFiltersService } from "shared/filters/filters_ag/ag-filters.service";
import { SearchTableService } from "pages/search/table/search/search-table.service";

@Component({
    selector:    'flu',
    template:    ''
})
export class FluActionComponent implements OnInit {

    constructor(private readonly router: Router, private readonly search: SearchTableService,
                private readonly ag: AGFiltersService) {}

    public ngOnInit(): void {
        this.router.navigateByUrl('/search')
        this.search.waitInitialization().then(() => {
            this.ag.selectInfection('commonflu')
        })
    }

}