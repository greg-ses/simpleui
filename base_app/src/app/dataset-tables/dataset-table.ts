import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Input, OnDestroy, Optional } from '@angular/core';
import { CommandButtonChange, CommandButtonChangeService } from '../services/command-button-change.service';
import { DataSet } from '../interfaces/dataset';
import { DataSetChangeService } from '../services/dataset-change.service';
import { AppComponent } from '../app.component';
import { TabUI } from '../interfaces/props-data';
import { Subscription } from 'rxjs';

@Component({
    animations: [],
    selector: 'dataset-table',
    changeDetection: ChangeDetectionStrategy.OnPush,
    styleUrls: ['../app-tab-normal/app-tab-normal.component.css'],
    templateUrl: './dataset-table.html',
    providers: [CommandButtonChangeService]
})

// The common page layout with id tags for js
export class DatasetTableComponent implements OnDestroy {
    @Input() _dataset: DataSet;
    @Input() _hidden: boolean;
    @Input() _props: any;
    @Input() _uiTab: TabUI;
    @Input() _tableName: string;
    _updateCount = 0;
    dataSetChangeSubscription: Subscription;

    constructor(
        private commandButtonChangeService: CommandButtonChangeService,
        private dataSetChangeService: DataSetChangeService,
        private _changeDetectorRef: ChangeDetectorRef,
        @Optional() public app: AppComponent
    ) {
        this.dataSetChangeSubscription = dataSetChangeService.changeAnnounced$.subscribe(
        dataChange => {
            if (   (dataChange.tabId === this._uiTab.id)
                && (this._dataset.u_id === dataChange.updatedDataSet.u_id) ) {

                    this._updateCount++;

                    if (this._dataset.elements instanceof Object) {
                        for (const element of this._dataset.elements) {
                            if (element['command'] instanceof Object) {
                                const commandButtonChange = new CommandButtonChange(this._uiTab.id, element);
                                this.commandButtonChangeService.announceChange(commandButtonChange);
                            }
                        }
                    }

                    this._dataset = dataChange.updatedDataSet;
                    this._changeDetectorRef.detectChanges();
                }
            });
    }

    ngOnDestroy() {
        this.dataSetChangeSubscription.unsubscribe();
    }

    getTitle(): string {
        let retVal = 'Overview';
        if (typeof this._dataset === 'object') {
            if (typeof this._dataset.label === 'string' && this._dataset.label !== '') {
                retVal = this._dataset.label;
            }
        }
        retVal = retVal.replace(/_/g, ' ');
        return retVal;
    }

    fixNL(s): string {
        return s ? s.replace(/\(NL\)/g, '\n') : '';
    }

    getTableId(): string {
        let retVal = this.getTitle();
        if (typeof this._dataset === 'object' &&
            typeof this._dataset['tableId'] === 'string') {
            retVal += '-' + this._dataset['tableId'];
        }
        return retVal;
    }


    isCollapsed(): boolean {
        this._hidden = this.app._globalProps._hiddenTables.indexOf(this.getTableId()) > -1;
        return this._hidden;
    }


    toggleTableDisplay() {
        if (this.app._globalProps && this.app._globalProps._hiddenTables) {
            const tableId = this.getTableId();
            const pos = this.app._globalProps._hiddenTables.indexOf(tableId);
            if (pos === -1) {
                this.app._globalProps._hiddenTables.push(tableId);
                this._hidden = true;
                //console.log('toggle(' + tableId + '): hidden');
            } else {
                this.app._globalProps._hiddenTables = this.app._globalProps._hiddenTables.filter(e => e !== tableId);
                this._hidden = false;
                //console.log('toggle(' + tableId + '): visible');
            }
            this._changeDetectorRef.detectChanges();
            this._changeDetectorRef.detach();
        }
    }
}
