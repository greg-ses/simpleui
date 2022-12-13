import { AfterContentInit, Component, EventEmitter, Input, OnChanges, OnInit, Optional, Output, SimpleChanges, ChangeDetectionStrategy, ChangeDetectorRef, OnDestroy } from '@angular/core';
import { TabUI } from '../interfaces/props-data';

//import '../css/styles.css';
import { AppComponent } from '../app.component';
import { DataSetChange, DataSetChangeService} from '../services/dataset-change.service';
import { DataSetChangeList } from '../interfaces/dataset';
import { UTIL } from '../../tools/utility';
import { SectionChangeList } from '../interfaces/dataset';

@Component({
    animations: [],
    selector: 'app-tab-normal',
    templateUrl: './app-tab-normal.component.html',
    styleUrls: ['./app-tab-normal.component.css'],
    providers: [DataSetChangeService]
})

export class AppTabNormalComponent implements AfterContentInit, OnInit, OnChanges {
    @Input() _uiTab: TabUI;
    @Output() updateModelOfChildDataSet = new EventEmitter<{uiTab: any, sectionIdx: number, dataSetsIdx: number, newChildData: any}>();
    _initialized = false;

    constructor(
        private dataSetChangeService: DataSetChangeService,
        @Optional() public app: AppComponent
    ) {
    }

    ngAfterContentInit() {
        this._initialized = true;
    }

    ngOnInit() {
        console.log('app-tab-normal init');
    }


    ngOnChanges(changes: SimpleChanges): void {
        console.log('changes', changes)
    }

    getSectionClassName(sectionIndex) {
        let theme = this.app._props?.appTheme?.name || 'SimpleUiBlue';
        return `section-${sectionIndex % 2 ? 'even' : 'odd'}-${theme} L2`;
    }


    sectionTrackBy(index: number, section: any) {
        return section.u_id
    }

    // checkSectionUpdate(section, sectionIndex): SectionChangeList {
    //     const sectionChangeList = new SectionChangeList();
    //     sectionChangeList.tabName = this._uiTab.name;
    //     sectionChangeList.changed = false;
    //     sectionChangeList.section = section;
    //     sectionChangeList.dataSetChangeList_arr = [];

    //     // Trigger a full update on the FIRST changed CmdSet
    //     if (this._initialized) {
    //         const sectionRefKey = 'tab/' + this._uiTab.index + '/section/' + sectionIndex + '/sha1sum';
    //         const sectionChildObj = section.sha1sum || 'NO-SHA1SUM';
    //         const sectionComparedValues = {new: '', old: ''};
    //         if (UTIL.compareAndUpdateSavedJSONValue(section, sectionRefKey, sectionChildObj, sectionComparedValues)) {
    //             sectionChangeList.changed = true;
    //         }

    //         for (let cmdSetIndex = 0; cmdSetIndex < section.CmdSet.length; cmdSetIndex++) {
    //             const cmdSetRefKey =
    //                 'tab/' + this._uiTab.index + '/section/' + sectionIndex + '/' + section.name + '/CmdSet/' + cmdSetIndex + '/sha1sums';
    //             const childObj = section.CmdSet[cmdSetIndex].sha1sums || 'NO-SHA1SUMS';
    //             const comparedValues = {new: '', old: ''};
    //             if (UTIL.compareAndUpdateSavedJSONValue(section, cmdSetRefKey, childObj, comparedValues)) {
    //                 sectionChangeList.changed = true;
    //             }
    //         }

    //         // If full update not already triggered, trigger updates for any changed DataSets

    //         for (let dsi = 0; dsi < section.DataSets.length; dsi++) {
    //             const dataSetsRefKey =
    //                 'tab/' + this._uiTab.index
    //                 + '/section/' + sectionIndex + '/' + section.name
    //                 + '/DataSets/' + dsi
    //                 + '/sha1sums';
    //             const sha1SumsChildObj = section.DataSets[dsi].sha1sums || 'NO-SHA1SUMS';

    //             const comparedValues = {new: '', old: ''};
    //             if (UTIL.compareAndUpdateSavedJSONValue(section, dataSetsRefKey, sha1SumsChildObj, comparedValues)) {
    //                 const datasetChangeList = this.updateDataSet(section.DataSets[dsi]);
    //                 if (datasetChangeList.sectionUpdateNeeded) {
    //                     sectionChangeList.changed = true;
    //                 }
    //                 sectionChangeList.dataSetChangeList_arr.push(datasetChangeList);
    //             }
    //         }

    //     }
    //     return sectionChangeList;
    // }

    // updateDataSet(dataSetsInstance: any) {
    //     const dataSetChangeList: DataSetChangeList = {
    //         datasets_instance_u_id: dataSetsInstance.u_id,
    //         sectionUpdateNeeded : false,
    //         changed_dsItem_u_ids: []
    //     };
    //     // If full update not already triggered, trigger updates for any changed command within any DataSet
    //         for (const dsItem of dataSetsInstance.dsItems) {
    //             if (! (window['dsItem_sha1sum'] instanceof Array)) {
    //                 // Initializing
    //                 window['dsItem_sha1sum'] = [];
    //                 window['dsItem_sha1sum'][dsItem.u_id] = dsItem.sha1sum;
    //                 continue;
    //             }

    //             if (typeof window['dsItem_sha1sum'][dsItem.u_id] === 'string') {
    //                 // Existing Dataset
    //                 if (dsItem.sha1sum !== window['dsItem_sha1sum'][dsItem.u_id]) {
    //                     // changed
    //                     const dataSetChange = new DataSetChange(this._uiTab.id, dsItem);
    //                     this.dataSetChangeService.announceChange(dataSetChange);

    //                     dataSetChangeList.changed_dsItem_u_ids.push(dsItem.u_id);
    //                     window['dsItem_sha1sum'][dsItem.u_id] = dsItem.sha1sum;
    //                 }
    //             } else {
    //                 // New DataSet
    //                 dataSetChangeList.sectionUpdateNeeded = true;
    //                 window['dsItem_sha1sum'][dsItem.u_id] = dsItem.sha1sum;
    //             }
    //         }

    //     return dataSetChangeList;
    // }


}

