import { AfterContentInit, Component, EventEmitter, Input, OnInit, Optional, Output } from '@angular/core';
import { TabUI } from '../interfaces/props-data';

import '../css/styles.css';
import { AppComponent } from '../app.component';
import { DataSetChange, DataSetChangeService} from '../services/dataset-change.service';
import { DataSetChangeList } from '../interfaces/dataset';
import { UTIL } from '../../tools/utility';
import { ClientLogger } from '../../tools/logger' ;
import { SectionChangeList } from '../interfaces/dataset';

@Component({
    animations: [],
    selector: 'app-tab-normal',
    templateUrl: './app-tab-normal.component.html',
    styleUrls: ['./app-tab-normal.component.css'],
    providers: [DataSetChangeService]
})

export class AppTabNormalComponent implements AfterContentInit, OnInit {
    @Input() _uiTab: TabUI;
    @Output() fullUpdateRequired = new EventEmitter<boolean>();
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
    }

    getSectionClassName(sectionIndex) {
        let theme: string;
        try {
            theme = this.app._props['appTheme']['name'] || 'SimpleUiBlue';
        } catch (e) {
            theme = 'SimpleUiBlue';
        }

        return `section-${sectionIndex % 2 ? 'even' : 'odd'}-${theme} L2`;
    }

    checkSectionUpdate(section, sectionIndex): SectionChangeList {
        const sectionChangeList = new SectionChangeList();
        sectionChangeList.tabName = this._uiTab.name;
        sectionChangeList.changed = false;
        sectionChangeList.section = section;
        sectionChangeList.dataSetChangeList_arr = [];

        // Trigger a full update on the FIRST changed CmdSet
        if (this._initialized) {

            const sectionRefKey = 'tab/' + this._uiTab.index + '/section/' + sectionIndex + '/sha1sum';
            const sectionChildObj = section.sha1sum || 'NO-SHA1SUM';
            const sectionComparedValues = {new: '', old: ''};
            if (UTIL.compareAndUpdateSavedJSONValue(section, sectionRefKey, sectionChildObj, sectionComparedValues)) {
                sectionChangeList.changed = true;
                ClientLogger.log('DeltaUpdate', 'Δ ' + section.u_id
                    + ':section[' + sectionIndex + '] sha1sum compareAndUpdateSavedJSONValue',
                    false,
                    'Δ old: ' + sectionComparedValues.old,
                    'Δ new: ' + sectionComparedValues.new );
            }

            for (let cmdSetIndex = 0; cmdSetIndex < section.CmdSet.length; cmdSetIndex++) {
                const cmdSetRefKey =
                    'tab/' + this._uiTab.index + '/section/' + sectionIndex + '/' + section.name + '/CmdSet/' + cmdSetIndex + '/sha1sums';
                const childObj = section.CmdSet[cmdSetIndex].sha1sums || 'NO-SHA1SUMS';
                const comparedValues = {new: '', old: ''};
                if (UTIL.compareAndUpdateSavedJSONValue(section, cmdSetRefKey, childObj, comparedValues)) {
                    sectionChangeList.changed = true;
                    ClientLogger.log('DeltaUpdate', 'Δ ' + section.CmdSet[cmdSetIndex].u_id
                                + ':cmdSet[' + cmdSetIndex + '] sha1sums compareAndUpdateSavedJSONValue',
                        false,
                        'Δ old: ' + comparedValues.old,
                        'Δ new: ' + comparedValues.new );
                }
            }

            // If full update not already triggered, trigger updates for any changed DataSets

            for (let dsi = 0; dsi < section.DataSets.length; dsi++) {
                const dataSetsRefKey =
                    'tab/' + this._uiTab.index
                    + '/section/' + sectionIndex + '/' + section.name
                    + '/DataSets/' + dsi
                    + '/sha1sums';
                const sha1SumsChildObj = section.DataSets[dsi].sha1sums || 'NO-SHA1SUMS';

                const comparedValues = {new: '', old: ''};
                if (UTIL.compareAndUpdateSavedJSONValue(section, dataSetsRefKey, sha1SumsChildObj, comparedValues)) {
                    ClientLogger.log('DeltaUpdate',
                       'Δ ' + section.DataSets[dsi].u_id + ':dataSets[' + dsi + '] sha1sums compareAndUpdateSavedJSONValue',
                      false,
                       'Δ old: ' + comparedValues.old,
                       'Δ new: ' + comparedValues.new );

                    const datasetChangeList = this.updateDataSet(section.DataSets[dsi]);
                    if (datasetChangeList.sectionUpdateNeeded) {
                        sectionChangeList.changed = true;
                    }
                    sectionChangeList.dataSetChangeList_arr.push(datasetChangeList);
                }
            }

            if (sectionChangeList.changed) {
                ClientLogger.log('DeltaUpdate', 'Send fullUpdateRequired msg');
                this.fullUpdateRequired.emit(true);
            }
        }
        return sectionChangeList;
    }

    updateDataSet(dataSetsInstance: any) {
        const dataSetChangeList: DataSetChangeList = {
            datasets_instance_u_id: dataSetsInstance.u_id,
            sectionUpdateNeeded : false,
            changed_dsItem_u_ids: []
        };

        let needFullUpdate = false;

        // If full update not already triggered, trigger updates for any changed command within any DataSet
            for (const dsItem of dataSetsInstance.dsItems) {
                if (! (window['dsItem_sha1sum'] instanceof Array)) {
                    // Initializing
                    needFullUpdate = true;
                    ClientLogger.log('DeltaUpdate', 'Δ ' + dsItem.u_id + ':init dsItem_sha1sum');
                    window['dsItem_sha1sum'] = [];
                    window['dsItem_sha1sum'][dsItem.u_id] = dsItem.sha1sum;
                    continue;
                }

                if (typeof window['dsItem_sha1sum'][dsItem.u_id] === 'string') {
                    // Existing Dataset
                    if (dsItem.sha1sum !== window['dsItem_sha1sum'][dsItem.u_id]) {
                        // changed
                        const dataSetChange = new DataSetChange(this._uiTab.id, dsItem);
                        this.dataSetChangeService.announceChange(dataSetChange);

                        dataSetChangeList.changed_dsItem_u_ids.push(dsItem.u_id);
                        ClientLogger.log('DeltaUpdate', 'Δ ' + dsItem.u_id + ':dsItem_sha1sum');
                        window['dsItem_sha1sum'][dsItem.u_id] = dsItem.sha1sum;
                    }
                } else {
                    // New DataSet
                    dataSetChangeList.sectionUpdateNeeded = true;
                    ClientLogger.log('DeltaUpdate', 'Δ ' + dsItem.u_id + ':dsItem_sha1sum');
                    window['dsItem_sha1sum'][dsItem.u_id] = dsItem.sha1sum;
                }
            }

        return dataSetChangeList;
    }
}

