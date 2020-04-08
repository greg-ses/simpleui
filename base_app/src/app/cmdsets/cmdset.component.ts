/**
 * Created by jscarsdale on 2019-06-12.
 */

import { CommandButtonChangeService } from '../services/command-button-change.service';
import { Component, Input, Optional} from '@angular/core';
import { AppComponent } from '../app.component';
import { CmdSet } from '../interfaces/cmdset';

@Component({
    // changeDetection: ChangeDetectionStrategy.OnPush,
    selector: 'cmdset',
    styleUrls: ['../app-tab-normal/app-tab-normal.component.css'],
    templateUrl: './cmdset.component.html',
    providers: [CommandButtonChangeService]
})

// The common page layout with id tags for js
export class CmdSetComponent {
    @Input() _cmdset: CmdSet;
    @Input() _uiTab: any;

    constructor(
        private commandButtonChangeService: CommandButtonChangeService,
        @Optional() public app: AppComponent
    ) {
        if (commandButtonChangeService) {}
    }

    getRange(): any {
        return Array.from(Array(this._cmdset.elements.length).keys());
    }

    /*
    getButtonNames(): string {
        const buttonLabelsArr = [];
        for (let i of this.getRange()) {
            buttonLabelsArr.push(this._cmdset.elements[i].command.label);
        }
        return buttonLabelsArr.join();
    }
    */
}
