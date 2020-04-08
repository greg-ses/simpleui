
import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

export class CommandButtonChange {
    tabId: string;
    updatedElement: any;

    public constructor(tabId: string, newElementValue: any) {
        this.tabId = tabId;
        this.updatedElement = newElementValue;
    }
}

@Injectable({
    providedIn: 'root'
})
export class CommandButtonChangeService {

    // Observable sources
    private changeAnnounceSource = new Subject<CommandButtonChange>();

    // Observable string streams
    changeAnnounced$ = this.changeAnnounceSource.asObservable();

    // Service message commands
    announceChange(dataChange: CommandButtonChange) {
        this.changeAnnounceSource.next(dataChange);
    }
}