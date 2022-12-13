import { ChangeDetectionStrategy, Component, Input, OnInit, Optional } from '@angular/core';
import { CommandButtonChangeService } from '../services/command-button-change.service';
import { DataSet } from '../interfaces/dataset';
import { AppComponent } from '../app.component';
import { TabUI } from '../interfaces/props-data';


@Component({
    animations: [],
    selector: 'dataset-table',
    changeDetection: ChangeDetectionStrategy.OnPush,
    styleUrls: ['../app-tab-normal/app-tab-normal.component.css'],
    templateUrl: './dataset-table.html',
    providers: [CommandButtonChangeService]
})

// The common page layout with id tags for js
export class DatasetTableComponent implements OnInit {
    @Input() _dataset: DataSet;
    @Input() _props: any;
    @Input() _uiTab: TabUI;
    @Input() _tableName: string;
    _hidden: boolean

    constructor(
        @Optional() public app: AppComponent
    ) {}

    ngOnInit() {
        let table_id = this.getTableId();
        if (this.app._globalProps._hiddenTables.includes(table_id)) {
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
            } else {
                this.app._globalProps._hiddenTables = this.app._globalProps._hiddenTables.filter(e => e !== tableId);
                this._hidden = false;
            }
        }
    }


    commandButtonTrackBy(index: number, commandButton: any) {
        return commandButton.u_id
    }
}
