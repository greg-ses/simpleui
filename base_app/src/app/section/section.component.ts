/**
 * Created by jscarsdale on 2019-06-27.
 */

import {AfterViewInit, ChangeDetectionStrategy, ChangeDetectorRef, Component, EventEmitter, Input, Optional, Output} from '@angular/core';
import { AppComponent } from '../app.component';
import { TabUI } from '../interfaces/props-data';
import { DataSetChangeList, SectionChangeList } from '../interfaces/dataset';

@Component({
    selector: 'app-section',
    changeDetection: ChangeDetectionStrategy.OnPush,
    styleUrls: ['../app-tab-normal/app-tab-normal.component.css'],
    templateUrl: './section.component.html'
})

// The common page layout with id tags for js
export class SectionComponent implements AfterViewInit{
    @Input() _section: any;
    @Input() _sectionIndex: number;
    @Input() _uiTab: TabUI;
    dataSetChangeList_arr: Array<DataSetChangeList> = [];

    private _detectChanges: SectionChangeList;

    @Input()
    set detectSectionChanges(sectionChangeList: SectionChangeList) {

        if (typeof sectionChangeList === 'undefined') {
            return;
        }

        if (typeof this._uiTab === 'object') {
            if (this._uiTab.name === sectionChangeList.tabName) {
                if (typeof this._detectChanges === 'undefined') {
                    this._detectChanges = sectionChangeList;
                }

                if (sectionChangeList.changed === true) {
                    this._section = sectionChangeList.section;
                    this._changeDetectorRef.detectChanges();
                    this._changeDetectorRef.detach();
                }
            }
        }

        this.dataSetChangeList_arr = sectionChangeList.dataSetChangeList_arr;
    }
    // get detectChanges(): {name: string, value: boolean, updatedSection: any} { return this._detectChanges; }

    constructor(
        private _changeDetectorRef: ChangeDetectorRef,
        @Optional() public app: AppComponent
    ) { }

    ngAfterViewInit() {
        // Disable change detection on the component - we deliberately re-enable it when required using reattach() and detectChanges()
        this._changeDetectorRef.detach();
    }

    getTableType(dsItem) {
        return dsItem['tableType'];
    }

    getDataSetChangeListArr() {
        return this.dataSetChangeList_arr;
    }

    getSectId(i): string {
        return 'Section-' + i;
    }

    getThClassName(sectionIndex) {
        let theme = '';
        try {
            theme = this.app._props['appTheme']['name'] || 'SimpleUiBlue';
        } catch(e) {
            theme = 'SimpleUiBlue';
        }

        return `${this.isCollapsed(sectionIndex) ? 'sectionClosed' : 'sectionOpened'} ${sectionIndex % 2 ? 'even' : 'odd'}-${theme} L3`;

    }

    isCollapsed(i: number): boolean {
        const hidden = this.app._globalProps._hiddenTables.indexOf(this.getSectId(i)) > -1;
        return hidden;
    }

    toggle(i) {
        if (this.app._globalProps && this.app._globalProps._hiddenTables) {
            const sectId = this.getSectId(i);
            const pos = this.app._globalProps._hiddenTables.indexOf(sectId);
            if (pos === -1) {
                this.app._globalProps._hiddenTables.push(sectId);
                //console.log('toggle(' + sectId + '): hidden');
            } else {
                this.app._globalProps._hiddenTables = this.app._globalProps._hiddenTables.filter(e => e !== sectId);
                //console.log('toggle(' + sectId + '): visible');
            }
            // this.changeDetectorRef.markForCheck();
            this._changeDetectorRef.detectChanges();
            this._changeDetectorRef.detach();
        }
        event.preventDefault();
        event.stopPropagation();
    }

    fixNL(s): string {
        return s ? s.replace(/\(NL\)/g, '\n') : '';
    }

}
