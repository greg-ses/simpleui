/**
 * Created by jscarsdale on 2019-06-27.
 */

import {ChangeDetectionStrategy, Component, Input, Optional, OnInit, OnDestroy} from '@angular/core';
import { AppComponent } from '../app.component';
import { TabUI } from '../interfaces/props-data';
import { FilterOptions } from '../smart-table/smart-table.component';

@Component({
    selector: 'app-section',
    changeDetection: ChangeDetectionStrategy.OnPush,
    styleUrls: ['../app-tab-normal/app-tab-normal.component.css'],
    templateUrl: './section.component.html'
})

// The common page layout with id tags for js
export class SectionComponent implements OnInit, OnDestroy {
    @Input() _section: any;
    @Input() _sectionIndex: number;
    @Input() _uiTab: TabUI;
    @Input() _props: any;


    constructor(
        @Optional() public app: AppComponent
    ) {}

    ngOnInit(): void { }
    ngOnDestroy(): void { }

    getTableType(dsItem) {
        return dsItem['tableType'];
    }

    getSectId(i): string {
        return 'Section-' + i;
    }

    getThClassName(sectionIndex) {
        const theme = this.app?._props?.appTheme?.name || 'SimpleUiBlue';
        return `${this.isCollapsed(sectionIndex) ? 'sectionClosed' : 'sectionOpened'} ${sectionIndex % 2 ? 'even' : 'odd'}-${theme} L3`;
    }

    isCollapsed(i: number): boolean {
        const hidden = this.app._globalProps._hiddenTables.indexOf(this.getSectId(i)) > -1;
        return hidden;
    }

    toggle(section_indx) {
        if (this.app._globalProps && this.app._globalProps._hiddenTables) {
            const sectId = this.getSectId(section_indx);
            const pos = this.app._globalProps._hiddenTables.indexOf(sectId);
            if (pos === -1) {
                this.app._globalProps._hiddenTables.push(sectId);
            } else {
                this.app._globalProps._hiddenTables = this.app._globalProps._hiddenTables.filter(e => e !== sectId);
            }
        }
        event.preventDefault();
        event.stopPropagation();
    }

    fixNL(s): string {
        return s ? s.replace(/\(NL\)/g, '\n') : '';
    }

/**
 * *ngFor methods for preventing destruction and recreation of
 * components on each iteration. Basically stops components
 * from being reloaded unnecessarily
 */
    datatableTrackBy(index: number, dsItem: any) {
        return dsItem.u_id;
    }
    cmdsetTrackBy(index: number, cmdset: any) {
        return cmdset.u_id;
    }



    /**
     * Mostly for the FaultList
     * @param data
     */
    generateRowsForSmartTable(data: any): any[] {
        return data?.elements;
    }

    /**
     * Mostly for the FaultList
     * @param data
     */
    generateFilterOptions(): any {
        const options: FilterOptions = {
            title: "Filter by Fault Value",
            possible_options: ['none', 'disabled', 'warning', 'trip'],
            filter_column: 'value'
        }
        return options
    }

}
