import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Input, OnDestroy, OnInit, Optional } from '@angular/core';
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
export class PropDefinedTableComponent implements OnInit {
    @Input() _dataset: PropDefinedDataSet;
    @Input() _uiTab: TabUI;
    @Input() _id: string;
    _hidden: boolean



    // _updateCount = 0;
    // dataSetChangeSubscription: Subscription;

    // constructor(
    //     private dataSetChangeService: DataSetChangeService,
    //     private _changeDetectorRef: ChangeDetectorRef,
    //     @Optional() public app: AppComponent
    // ) {
    // }

    // ngOnDestroy() {
    //     this.dataSetChangeSubscription.unsubscribe();
    // }

    constructor(
        @Optional() public app: AppComponent
    ) {}

    ngOnInit() {
        let table_name = this._id;
        if (this.app._globalProps._hiddenTables.includes(table_name)) {
            this._hidden = true;
        }
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
        } else {
            this.app._globalProps._hiddenTables = this.app._globalProps._hiddenTables.filter(e => e !== this._id);
            this._hidden = false;
        }
    }

}
