/**
 * Created by jscarsdale on 6/16/16.
 */

/**
 * Created by jscarsdale on 6/8/16.
 */
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Input, Optional } from '@angular/core';
import { CommandButtonChange, CommandButtonChangeService } from '../services/command-button-change.service';
import { TabUI } from '../interfaces/props-data';
import { AppComponent } from '../app.component';
import { DataSetChangeService } from '../services/dataset-change.service';
import { Subscription } from 'rxjs';

import { UiObjList } from '../interfaces/ui-obj-list';

@Component({
    selector: 'overlay-cmd-bar',
    changeDetection: ChangeDetectionStrategy.OnPush,
    styleUrls: ['./app-tab-overlay.component.css'],
    templateUrl: './overlay-cmd-bar.html',
    providers: [CommandButtonChangeService]
})

// The common page layout with id tags for js
export class OverlayCmdBarComponent {
    @Input() _emergency_commands: UiObjList;
    @Input() _commands: UiObjList;
    @Input() _service_commands: UiObjList;
    @Input() _cmdBarName: string;
    @Input() _uiTab: TabUI;
    @Input() _props: any;
    _updateCount = 0;
    buttonSetChangeSubscription: Subscription;

    constructor(
        private commandButtonChangeService: CommandButtonChangeService,
        private buttonSetChangeService: DataSetChangeService,
        private _changeDetectorRef: ChangeDetectorRef,
        @Optional() public app: AppComponent
    ) {
        this.buttonSetChangeSubscription = buttonSetChangeService.changeAnnounced$.subscribe(
            dataChange => {
                if (   (dataChange.tabId === this._uiTab.id)
                    && (   (this._emergency_commands.u_id === dataChange.updatedDataSet.u_id)
                        || (this._commands.u_id === dataChange.updatedDataSet.u_id)
                        || (this._service_commands.u_id === dataChange.updatedDataSet.u_id)
                       )
                    ) {

                    this._updateCount++;
                    for (const buttonSet of [this._emergency_commands, this._commands, this._service_commands]) {
                        if (buttonSet.hasElements()) {
                            for (const element of buttonSet.elements) {
                                if (element['command'] instanceof Object) {
                                    const commandButtonChange = new CommandButtonChange(buttonSet.u_id, element);
                                    this.commandButtonChangeService.announceChange(commandButtonChange);
                                }
                            }
                        }
                    }
                    this._changeDetectorRef.detectChanges();
                }
            });
    }


    /*
    getEmergencyCommands() {
        if (this.hasEmergencyCommands()) {
            return this._emergency_commands.elements;
        }
        return [];
    }

    getProcessCommands() {
        if (this.hasProcessCommands()) {
            return this._commands.elements;
        }
        return [];
    }

    getServiceCommands() {
        if (this.hasServiceCommands()) {
            return this._service_commands.elements;
        }
        return [];
    }
    */

    hasEmergencyCommands(): boolean {
        const ret: boolean = (typeof this._emergency_commands === 'object' &&
        typeof this._emergency_commands.elements === 'object' &&
        this._emergency_commands.elements.length > 0);
        return ret;
    }

    hasProcessCommands(): boolean {
        const ret: boolean = (typeof this._commands === 'object' &&
        typeof this._commands.elements === 'object' &&
        this._commands.elements.length > 0);
        return ret;
    }

    hasServiceCommands(): boolean {
        const ret: boolean = (typeof this._service_commands === 'object' &&
        typeof this._service_commands.elements === 'object' &&
        this._service_commands.elements.length > 0);
        return ret;
    }

    hasCommands(): boolean {
        const ret: boolean = this.hasProcessCommands();
        return ret;
    }
}
