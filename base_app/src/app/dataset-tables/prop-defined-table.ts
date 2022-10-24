import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Input, OnDestroy, Optional } from '@angular/core';
import { PropDefinedDataSet } from '../interfaces/dataset';
import { DataSetChangeService} from '../services/dataset-change.service';
import { AppComponent } from '../app.component';
import { TabUI } from '../interfaces/props-data';
import { Subscription } from 'rxjs';

@Component({
    animations: [],
    selector: 'prop-defined-table',
    changeDetection: ChangeDetectionStrategy.OnPush,
    styleUrls: ['../app-tab-normal/app-tab-normal.component.css'],
    templateUrl: './prop-defined-table.html'
})

// The common page layout with id tags for js
export class PropDefinedTableComponent implements OnDestroy {
    @Input() _dataset: PropDefinedDataSet;
    @Input() _hidden: boolean;
    @Input() _uiTab: TabUI;
    @Input() _id: string;
    _updateCount = 0;
    dataSetChangeSubscription: Subscription;

    constructor(
        private dataSetChangeService: DataSetChangeService,
        private _changeDetectorRef: ChangeDetectorRef,
        @Optional() public app: AppComponent
    ) {
        this.dataSetChangeSubscription = dataSetChangeService.changeAnnounced$.subscribe(
        dataChange => {
            if (   (dataChange.tabId === this._uiTab.id)
                && (this._dataset.u_id === dataChange.updatedDataSet.u_id) ) {

                this._updateCount++;
                this._dataset = <PropDefinedDataSet>dataChange.updatedDataSet;
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

    getColumns(dataset): any {
        if (   (dataset instanceof Object)
            && (dataset.props instanceof Object)
            && (dataset.props.columns instanceof Array)) {
            return dataset.props.columns;
        }
        return [];
    }

    isCollapsed(): boolean {
        this._hidden = this.app._globalProps._hiddenTables.indexOf(this._id) > -1;
        return this._hidden;

    }

    toggle() {
        const pos = this.app._globalProps._hiddenTables.indexOf(this._id);
        if (pos === -1) {
            this.app._globalProps._hiddenTables.push(this._id);
            this._hidden = true;
            console.log('toggle(' + this._id + '): hidden');
        } else {
            this.app._globalProps._hiddenTables = this.app._globalProps._hiddenTables.filter(e => e !== this._id);
            this._hidden = false;
            console.log('toggle(' + this._id + '): visible');
        }
        this._changeDetectorRef.detectChanges();
        this._changeDetectorRef.detach();
        
    }

}
