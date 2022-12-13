/**
 * Created by jscarsdale on 2019-06-27.
 */

import {AfterViewInit, ChangeDetectionStrategy, ChangeDetectorRef, Component, Input, Optional, OnInit, OnDestroy, OnChanges, SimpleChanges} from '@angular/core';
import { AppComponent } from '../app.component';
import { TabUI } from '../interfaces/props-data';
import { DataSetChangeList, SectionChangeList } from '../interfaces/dataset';
import { UTIL } from 'src/tools/utility';

@Component({
    selector: 'app-section',
    changeDetection: ChangeDetectionStrategy.OnPush,
    styleUrls: ['../app-tab-normal/app-tab-normal.component.css'],
    templateUrl: './section.component.html'
})

// The common page layout with id tags for js
export class SectionComponent implements OnInit, OnDestroy, OnChanges {
    @Input() _section: any;
    @Input() _sectionIndex: number;
    @Input() _uiTab: TabUI;

    //dataSetChangeList_arr: Array<DataSetChangeList> = [];
    //private _detectChanges: SectionChangeList;

    // @Input()
    // set detectSectionChanges(sectionChangeList: SectionChangeList) {
    //     if (typeof sectionChangeList === 'undefined') {
    //         return;
    //     }

    //     if (typeof this._uiTab === 'object') {
    //         if (this._uiTab.name === sectionChangeList.tabName) {
    //             if (typeof this._detectChanges === 'undefined') {
    //                 this._detectChanges = sectionChangeList;
    //             }

    //             if (sectionChangeList.changed === true) {
    //                 this._section = sectionChangeList.section;
    //                 //this._changeDetectorRef.detectChanges();
    //                 //this._changeDetectorRef.detach();
    //             }
    //         }
    //     }

    //     this.dataSetChangeList_arr = sectionChangeList.dataSetChangeList_arr;
    // }
    // get detectChanges(): {name: string, value: boolean, updatedSection: any} { return this._detectChanges; }

    // constructor(
    //     private _changeDetectorRef: ChangeDetectorRef,
    //     @Optional() public app: AppComponent
    // ) { }

    // ngAfterViewInit() {
    //     // Disable change detection on the component - we deliberately re-enable it when required using reattach() and detectChanges()
    //     this._changeDetectorRef.detach();
    // }

    // getDataSetChangeListArr() {
    //     return this.dataSetChangeList_arr;
    // }

    constructor(
        @Optional() public app: AppComponent
    ) {}

    ngOnInit(): void {
        console.info(`created ${this._section.name}`);
    }

    ngOnDestroy(): void {
        console.info(`destroyed ${this._section.name}`);
    }
    ngOnChanges(changes: SimpleChanges): void {
        //console.debug('changed', changes);
    }

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
            // this.changeDetectorRef.markForCheck();
            //this._changeDetectorRef.detectChanges();
            //this._changeDetectorRef.detach();
        }
        event.preventDefault();
        event.stopPropagation();
    }

    fixNL(s): string {
        return s ? s.replace(/\(NL\)/g, '\n') : '';
    }



/**
 * *ngFor methods for preventing destruction and recreation of
 * components on each iteration (keeps buttons on the page)
 */
    datatableTrackBy(index: number, dsItem: any) {
        return dsItem.u_id
    }
    cmdsetTrackBy(index: number, cmdset: any) {
        return cmdset.u_id
    }

}
