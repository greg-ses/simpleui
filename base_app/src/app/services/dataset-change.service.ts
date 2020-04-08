
import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { DataSet } from '../interfaces/dataset';

export class DataSetChange {
    tabId: string;
    updatedDataSet: DataSet;

    public constructor(tabId: string, newDataValue: DataSet) {
        this.tabId = tabId;
        this.updatedDataSet = newDataValue;
    }
}

@Injectable()
export class DataSetChangeService {

    // Observable sources
    private changeAnnounceSource = new Subject<DataSetChange>();

    // Observable string streams
    changeAnnounced$ = this.changeAnnounceSource.asObservable();

    // Service message commands
    announceChange(dataChange: DataSetChange) {
        this.changeAnnounceSource.next(dataChange);
    }
}