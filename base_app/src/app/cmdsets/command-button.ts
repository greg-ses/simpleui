/**
 * Created by jscarsdale on 6/2/16.
 */

// The common page layout with id tags for js
import {
    ChangeDetectionStrategy, ChangeDetectorRef, Component, ElementRef, forwardRef, Inject,
    Input, OnChanges, OnDestroy, SimpleChanges
} from '@angular/core';
import {AppComponent} from '../app.component';
import {CommandService} from '../services/command.service';
import {CommandButtonChangeService} from '../services/command-button-change.service';
import {Subscription} from 'rxjs';
import {HttpClientModule} from '@angular/common/http';
import {ClientLogger} from '../../tools/logger';
import {UTIL} from '../../tools/utility';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import {MaterialPopupComponent} from './material-popup-component';
import {TabUI} from '../interfaces/props-data';

@Component({
    animations: [],
    changeDetection: ChangeDetectionStrategy.OnPush,
    selector: 'app-command-button',
    styleUrls: ['../app-tab-normal/app-tab-normal.component.css'],
    templateUrl: './command-button.html',
    providers: [HttpClientModule, CommandService]
})

export class CommandButtonComponent implements OnChanges, OnDestroy {
    @Input() _uiTab: TabUI;
    @Input() _sha1sum: string;
    _element: any;
    _disabled = false;
    _dialogRef: any = null;
    commandButtonChangeSubscription: Subscription;

    @Input()
    set element(newCmdObject) {
        if (this._element instanceof Object) {
            const sExistingCommandElement = JSON.stringify(this._element);
            const sNewCommandElement = JSON.stringify(newCmdObject);
            if (sExistingCommandElement !== sNewCommandElement) {
                this._element = newCmdObject;
                this._changeDetectorRef.detectChanges();
            }
        } else {
            this._element = UTIL.deepCopy(newCmdObject);
        }
        if ((newCmdObject instanceof Object)
            && (newCmdObject.command instanceof Object)
            && (newCmdObject.command.disabled === 'true')) {
            this.domElementRef.nativeElement.setAttribute('disabled', true);
        } else {
            this.domElementRef.nativeElement.removeAttribute('disabled');
        }
    }

    get element() {
        return this._element;
    }

    @Input() _container: string;

    _action: any = this.simpleCommand;
    _response: any;

    ClickActionFunctionNames = [
        'simpleCommand',
        'disabled',
        'floatInputDialog',
        'intInputDialog',
        'boolInputDialog',
        'textInputDialog',
        'confirmDialog',
        'textInputDialog'
    ];

    static resumeUpdates(uiTab: TabUI) {
        uiTab._autoRefreshEnabled = true;
        uiTab._commands_enabled = true;
    }

    static fixNL(s: string) {
        return s.replace(/\(NL\)/g, '\n');
    }

    static underscoreToSpace(s: string) {
        return s.replace(/_/g, ' ');
    }

    getDomId(): string {
        return this._element.command.id;
    }

    getClassName(): string {
        let className = '';
        if (this._element instanceof Object
            && this._element instanceof Object
            && (typeof this._element.command.class === 'string')) {
            className += this._element.command.class;
        }

        if (this.domElementRef.nativeElement.className !== '') {
            const inheritedClass = this.domElementRef.nativeElement.className.replace(/[ ]*ng-star-inserted/, '');
            if (inheritedClass.length > 0) {
                if (className.length > 0) {
                    className += ' ';
                }
                className += inheritedClass;
            }
        }
        return className;
    }

    isDisabled(): any {
        if (this._uiTab?.disabled_buttons === 'true') {
            this._disabled = true;
            this._uiTab._commands_enabled = false;
            return true
        }
        if (this._element.command.disabled === 'true') {
            return true;
        } else {
            return null;
        }
    }

    restoreClass() {
        this.updateClass(this._element.command.class);
    }

    updateClass(newClassName: string) {
        // Replace the 'command', 'disabled', 'inProgress' substring of className with newClassName
        if (this._element.command.id === '') {
            return;
        }

        const e = document.getElementById(this._element.command.id);
        if (e) {
            e.className = e.className.replace(/command|disabled|inProgress/g, newClassName);
        }
    }

    getQuestionText(): string {
        let qText = 'Perform unknown action?';
        if (typeof this._element.command['desc'] === 'string') {
            qText = this._element.command['desc'].replace(/\(NL\)/g, '\n');
        } else {
            qText = 'Perform "' + this.getAttr('label', 'name').replace(/_/g, ' ') + '" action?';
        }
        return qText;
    }

    findAttr(paths: Array<string>, attr: string, defaultValue = '', transform: any = null): string {
        let value = '';

        try {
            for (const path of paths) {
                if (path && typeof path === 'object'
                    && path![attr] && typeof path![attr] === 'string'
                    && path != null) {
                    value = path![attr];
                    break;
                }
            }

            if (transform) {
                value = transform(value);
            }

            if (value.length === 0) {
                value = defaultValue;
            }

        } catch (e) {
            console.log('error in findAttr(' + attr + '): ' + e);
        }

        return value;
    }

    getAttr(attr: string, altAttr?: string): string {
        let s = this.findAttr([this._element.command, this._element], attr, '', CommandButtonComponent.underscoreToSpace);
        if (s === '') {
            s = this.findAttr([this._element.command, this._element], altAttr, '', CommandButtonComponent.underscoreToSpace);
        }
        if (s === '') {
            s = 'unknown_' + attr;
        }

        return s.trim();
    }

    setAction() {
        if (this.ClickActionFunctionNames.indexOf(this._element._action) > -1) {
            // Set _element._action to the identically-named function
            this._action = this[this._element._action];
        } else {
            this._action = this.simpleCommand;
        }

        if ((this._action !== this.simpleCommand) && (this._action !== this.disabled)) {
            if (typeof this._element.command.controls !== 'undefined') {
                for (const c of this._element.command.controls) {
                    switch (c.type) {
                        case 'float':
                            break;
                        case 'int':
                            break;
                        case 'bool':
                            break;
                        case 'text':
                            break;
                        default:
                            break;
                    }
                }
            }
            if (this._element.command.confirm === 'true') {
                this._action = this.confirmDialog;
            }
            if (this._element.command.type === 'text') {
                this._action = this.textInputDialog;
            }
        }
    }

    simpleCommand() {
        this.sendCommand();
    }

    constructor(
        private commandButtonChangeService: CommandButtonChangeService,
        private dialog: MatDialog,
        private domElementRef: ElementRef,
        private _moduleCommandService: CommandService,
        private _changeDetectorRef: ChangeDetectorRef,
        @Inject(forwardRef(() => AppComponent)) public app: AppComponent,
    ) {
        this.commandButtonChangeSubscription = commandButtonChangeService.changeAnnounced$.subscribe(
            dataChange => {
                if ((dataChange.tabId === this._uiTab.id)
                    && (this._element.u_id === dataChange.updatedElement.u_id)
                    && (JSON.stringify(this._element) !== JSON.stringify(dataChange.updatedElement))) {
                    this._element = dataChange.updatedElement;
                    this._changeDetectorRef.detectChanges();
                }
            });

    }

    inValuesList(formParams, extraAttribute): boolean {

        // formParams['cmd']['values'] is presumed to already be in formParams and be an array
        // 'extraAttributes' is assumed to be an object

        let found = false;

        if (typeof extraAttribute['u_id'] === 'string') {

            for (let i = 0; i < formParams['cmd']['values'].length; i++) {
                if ((typeof formParams['cmd']['values'][i]['u_id'] === 'string')
                    && (formParams['cmd']['values'][i]['u_id'] === extraAttribute['u_id'])) {

                    found = true;
                }
            }
        }

        return found;
    }

    ngOnDestroy() {
        this.commandButtonChangeSubscription.unsubscribe();
    }

    getExtraAttributes(formParams: any) {
        const ignoredAttrs: any = ['name', 'confirm', 'u_id', 'controls'];
        const attrKeys = Object.keys(this._element.command);
        for (const a of attrKeys) {

            // Skip any extra attributes that are ignored
            if (ignoredAttrs.indexOf(a) > -1) {
                continue;
            }

            // Skip any extra attributes that were included previously
            if (typeof formParams[a] !== 'undefined') {
                continue;
            }

            // Not quite sure why we should have to do this, but skip
            // any '_input' attributes that are already in the 'values' array
            // to avoid having duplicate lists of 'values' and '_input'.
            if (((a === 'input') || (a === '_input'))
                && (typeof formParams['cmd']['values'] === 'object')) {

                const inputAttribute = this._element.command[a];
                if (typeof inputAttribute === 'object') {
                    if (Array.isArray(inputAttribute)) {

                        for (let i = 0; i < inputAttribute.length; i++) {
                            if (this.inValuesList(formParams, inputAttribute[i])) {

                                // Already have this in formParams['cmd']['values'] - skip it
                                continue;
                            }

                            // Don't have the extra attribute - add it
                            if (formParams[a] === 'undefined') {
                                formParams[a] = [];
                            }
                            formParams[a].push(inputAttribute);
                        }
                    } else {
                        if (this.inValuesList(formParams, inputAttribute)) {

                            // Already have this in formParams['cmd']['values'] - skip it
                            continue;
                        }

                        // Don't have the extra attribute - add it
                        formParams[a] = inputAttribute;
                    }
                    break;
                }
            }

            // If we made it here, we need to add the extra attribute
            formParams[a] = <string> this._element.command[a];
        }
    }

    buildJsonToPost(valueObjectsFromPopup: any): any {
        let cmd_name = this._element.command.name;
        if (typeof this._element.command.cmd === 'string'
            && this._element.command.cmd !== '') {
            cmd_name = this._element.command.cmd;
        }
        const json = {
            'cmd':
                {
                    'name': cmd_name,
                    'values': []
                }
        };

        for (const key of Object.keys(valueObjectsFromPopup)) {
            if (valueObjectsFromPopup.hasOwnProperty(key)) {
                switch (typeof valueObjectsFromPopup[key]) {
                    case 'string': {
                        json['cmd'][key] = valueObjectsFromPopup[key];
                        break;
                    }

                    case 'object': {
                        const valueInstance = {};
                        for (const innerKey in valueObjectsFromPopup[key]) {
                            if (valueObjectsFromPopup[key].hasOwnProperty(innerKey)) {
                                valueInstance[innerKey] = valueObjectsFromPopup[key][innerKey];
                            }
                        }
                        json['cmd']['values'][key] = valueInstance;
                        /* Not needed.
                        if (   (typeof json['cmd']['values'][key]['dest'] === 'undefined')
                            && (typeof this._element.command['dest'] !== 'undefined') ) {
                            json['cmd']['values'][key]['dest'] = this._element.command['dest'];
                        }
                        */
                        break;
                    }
                }
            }
        }

        this.getExtraAttributes(json);

        return json;
    }

    sendCommand(valueObjectsFromPopup: any = []) {

        if (this.element.id === 'ResumePausedUpdates') {
            this._uiTab._autoRefreshEnabled = true;
            this._uiTab._commands_enabled = true;
        } else {
            this.updateClass('inProgress');

            const jsonToPost = this.buildJsonToPost(valueObjectsFromPopup);

            if (this._uiTab['commandUrl'].includes('/mock/cmd')) {
                this._moduleCommandService.sendMockCommand(
                    this._uiTab,
                    jsonToPost,
                    this,
                    this.onJSONUpdate,
                    this.onJSONError, this.app._props);
            } else {
                this._moduleCommandService.sendCommand(
                    this._uiTab,
                    jsonToPost,
                    this,
                    this.onJSONUpdate,
                    this.onJSONError, this.app._props);
            }

        }
    }

    onJSONUpdate(self: CommandButtonComponent, response: string) {
        self.restoreClass();
        self._response = response;
    }


    onJSONError(self: CommandButtonComponent, response: any) {
        self.restoreClass();
        let msg = 'Error on ajaxPost()';
        if ((typeof response === 'object') && (typeof response.status === 'string')) {
            msg += `{response.status}`;
        }
        alert(msg);
        console.log(msg);
    }

    disabled() {
        this._disabled = true;
    }

    confirmDialog() {
    }

    textInputDialog() {
    }

    floatInputDialog() {
    }

    intInputDialog() {
    }

    boolInputDialog() {
    }

    showCommandsDisabledWhenUpdatesPausesMessage() {
        const dialogConfig = new MatDialogConfig();

        dialogConfig.disableClose = false;
        dialogConfig.autoFocus = true;

        dialogConfig.data = {
            'clientOnlyCallback': () => {
                CommandButtonComponent.resumeUpdates(this._uiTab);
            },
            'element':
                {
                    'name': 'Updates are Paused Warning',
                    'command': {
                        'cmd': 'Resume updates to enable commands',
                        'confirm': 'true',
                        'desc': 'desc',
                        'dest': 'client',
                        'deviceId': 'client',
                        'disabled': 'false',
                        'label': 'Commands not allowed with Paused Updates',
                        'name': 'ResumePausedUpdates',
                        'u_id': 'ResumePausedUpdates',
                        'class': 'command',
                        'id': 'ResumePausedUpdates'
                    },
                    '_action': 'SimpleCommand',
                },
            'callbackSource': this
        };

        this._dialogRef = this.dialog.open(MaterialPopupComponent,
            dialogConfig);

        this._dialogRef.componentInstance.data = dialogConfig.data;

        this._dialogRef.afterClosed().subscribe(
            val => {
                console.log('Dialog output:', val);
            }
        );
    }

    onClick(event) {
        // alert('You clicked me!');
        try {
            if (!this._uiTab._commands_enabled) {
                this.showCommandsDisabledWhenUpdatesPausesMessage();
                return;
            } else {
                this.updateClass('inProgress');
                this.setAction();
                if (this._action === this.simpleCommand) {
                    this.simpleCommand();
                } else {
                    const dialogConfig = new MatDialogConfig();

                    dialogConfig.disableClose = false;
                    dialogConfig.autoFocus = true;

                    dialogConfig.data = {
                        'id': 'MatDialog-' + this._element.command.id,
                        'element': this._element,
                        'callbackSource': this
                    };

                    this._dialogRef = this.dialog.open(MaterialPopupComponent,
                        dialogConfig);

                    this._dialogRef.componentInstance.data = dialogConfig.data;

                    this._dialogRef.afterClosed().subscribe(
                        val => {
                            console.log('Dialog output:', val);
                        }
                    );
                }
            }
        } catch (err) {
            console.log('error in CommandButtonComponent.onClick()', err.toString());
            alert('Error: ' + err.toString());
            this.updateClass('command');
        }
        event.preventDefault();
        event.stopPropagation();
    }

    isChanged(propName: string, newValue: any) {
        let propChanged = false;

        try {
            switch (propName) {
                case '_props':
                    propChanged = (!(this.app._props.instance.name === newValue.instance.name));
                    break;

                case '_element':
                case 'element':
                    const sOld = JSON.stringify(this._element.command);
                    const sNew = JSON.stringify(newValue.command);
                    propChanged = (sOld !== sNew);
                    break;

                case '_uiTab':
                    propChanged = (!((this._uiTab.commandUrl === newValue.commandUrl)
                        && (this._uiTab.dataUrl === newValue.dataUrl)
                        && (this._uiTab.name === newValue.name)
                        && (this._uiTab.id === newValue.id)));
                    break;

                case '_disabled':
                    propChanged = (!(this._disabled === newValue));
                    break;

                case '_container':
                    propChanged = (!(this._container === newValue));
                    break;

                case '_sha1sum':
                    propChanged = (!(this._sha1sum === newValue));
                    break;

                default:
                    console.log('*** Unhandled propKey "' + propName + '" in isChanged()');
                    propChanged = true;
            }
        } catch (e) {
            console.log('Error "' + e + '" in isChanged()');
            propChanged = true;
        }

        if (propChanged) {
            ClientLogger.log('CommandButtonChangeDetection',
                'isChanged(propName: ' + (typeof propName === 'string' ? propName : 'unknown'), true);
        }

        return propChanged;
    }

    ngOnChanges(changes: SimpleChanges) {
        let anyChange = false;
        for (const propName in changes) {
            if (this.isChanged(propName, changes[propName].currentValue)) {
                anyChange = true;
                break;
            }
        }
        if (anyChange) {
            ClientLogger.log('CommandButtonChangeDetection',
                'anyChange is true', true);
        }
    }
}
