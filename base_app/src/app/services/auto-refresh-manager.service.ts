
import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

export class AutoRefreshManager {
    tabId: string;
    updatedElement: any;

    public constructor(tabId: string, newElementValue: any) {
        this.tabId = tabId;
        this.updatedElement = newElementValue;
    }
}

@Injectable()
export class AutoRefreshManagerService {

    // Observable sources
    private changeAnnounceSource = new Subject<AutoRefreshManager>();

    // Observable string streams
    changeAnnounced$ = this.changeAnnounceSource.asObservable();

    // Service message commands
    announceChange(dataChange: AutoRefreshManager) {
        this.changeAnnounceSource.next(dataChange);
    }
}