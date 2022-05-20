import {Component, HostListener, Inject, OnInit} from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogActions } from '@angular/material/dialog';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { ClientLogger } from '../../tools/logger' ;

@Component({
    selector: 'app-material-popup',
    styleUrls: ['./material-popup-component.css'],
    templateUrl: './material-popup-component.html'
})

export class MaterialPopupComponent implements OnInit {
    form: FormGroup;
    inputControl: FormControl;
    cmd: string;
    noControls: boolean;
    commandData: any;
    /*
    mockControls = [
        {name: 'Boolean Example 1',  id: '1001', desc: 'Sample Boolean Field 1', type: 'boolean'},
        {name: 'Boolean Example 2',  id: '1002', desc: 'Sample Boolean Field 2', type: 'boolean'},

        {name: 'Date Example 1',    id: '1003', desc: 'Sample Date Field 1', type: 'date'},
        {name: 'Date Example 2',    id: '1004', desc: 'Sample Date Field 2', type: 'date'},

        {name: 'Dropdown Example 1', id: '1005', desc: 'Sample Dropdown Field 1', type: 'dropdown',
            choices: ['Choice 1', 'Choice 2', 'Choice 3']},
        {name: 'Dropdown Example 2', id: '1006', desc: 'Sample Dropdown Field 2', type: 'dropdown',
            choices: ['Choice 1', 'Choice 2', 'Choice 3']},

        {name: 'Float Example 1',    id: '1007', desc: 'Sample Float Field 1', type: 'float'},
        {name: 'Float Example 2',    id: '1008', desc: 'Sample Float Field 2', type: 'float'},

        {name: 'Text Example 1',     id: '1009', desc: 'Sample Text Field 1', type: 'text'},
        {name: 'Text Example 2',     id: '1010', desc: 'Sample Text Field 2', type: 'text'}
    ];
    */


    @HostListener('keypress', ['$event'])
    onEnter(event: KeyboardEvent): void {
        if ( (event.key === 'Enter') && (!event.altKey && !event.ctrlKey && !event.shiftKey)) {
            event.stopPropagation();
            this.onOK();
        }
    }

    constructor(
        private fb: FormBuilder,
        private dialogRef: MatDialogRef<MaterialPopupComponent>,
        @Inject(MAT_DIALOG_DATA) commandData: any ) {

        this.commandData = commandData;

        this.cmd = this.getCommandField('cmd');
        this.noControls = (  (!(commandData.element.command.controls instanceof Array))
                           ||  (commandData.element.command.controls.length === 0) );

        this.inputControl = new FormControl('');
        this.form = this.fb.group({
            commandData: [this.commandData],
            inputControl: this.inputControl,
            _updateTreeValidity: () => {}
        });
    }

    ngOnInit() {
        this.inputControl = new FormControl('');
        this.form = this.fb.group({
            commandData: [this.commandData],
            inputControl: this.inputControl,
            _updateTreeValidity: () => {}
        });
    }

    getControls(commandData: any) {
        let controls = new Array();
        if ((typeof commandData === 'object')
            && (typeof commandData.element === 'object')
            && (typeof commandData.element.command === 'object')
            && (commandData.element.command.controls instanceof Array))
        {
            controls = commandData.element.command.controls;
        }
        ClientLogger.log('CommandButtonComponentDetails', `getControls(commandData): ${controls}`);
        return controls;
    }

    getChoices(control: any) {
        return ( (typeof control === 'object') && (typeof(control.choices instanceof Array))
                ? control.choices : [] );
    }

    onOK() {
        if (this.commandData.callbackSource && typeof this.commandData.callbackSource === 'object') {
            if (this.validateInputs(this.commandData.element.command.controls) === 0) {

                if (this.commandData.clientOnlyCallback) {
                    if (typeof this.commandData.clientOnlyCallback === 'function') {
                        this.commandData.clientOnlyCallback();
                    }
                } else {
                    this.commandData.callbackSource.sendCommand(this.commandData.element.command.controls);
                }
                this.dialogRef.close(this.form.value);
            } else {
                alert('Invalid Value(s)');
            }
        } else {
            alert('Invalid callbackSource');
        }
    }

    onCancel() {
        this.commandData.callbackSource.restoreClass();
        this.dialogRef.close(true);
    }

    validateInputs(controls: Array<any>): number {
        let errCount = 0;
        if (controls) {
            for (const e of controls) {
                const o = document.getElementById('popup-control-' + e.id);
                if (typeof o !== 'undefined' && o !== null) {
                    if (typeof e.type === 'string') {
                        // UG - Replicate 'type' attribute to '_type' for backend processing.
                        e['_type'] = e.type;
                    }
                    switch (e.type) {
                        case 'text':
                            e.value = o['value'];
                            if (e.value.length > e.size) {
                                errCount += 1;
                            } else {
                                o['value'] = e.value;
                            }
                            break;
                        case 'float':
                            e.value = Number.parseFloat(o['value']);
                            if (e.value < e.min || e.value > e.max || isNaN(e.value)) {
                                errCount += 1;
                            } else {
                                o['value'] = e.value;
                            }
                            break;
                        case 'int':
                            e.value = Number.parseInt(o['value'], 10);
                            if (e.value < e.min || e.value > e.max || isNaN(e.value)) {
                                errCount += 1;
                            } else {
                                o['value'] = e.value;
                            }
                            break;
                        case 'bool':
                            e.value = o['checked'];
                            break;
                    }
                }
            }
        }
        return errCount;
    }

    getDescription(): string {
        let description = '';
        if (this.commandData.element.command.desc !== '') {

            description = this.commandData.element.command.desc;
        }

        return description;
    }

    getCommandField(fieldName): string {
        let value = `MISSING FIELD ${fieldName}`;
        if (typeof this.commandData.element.command[fieldName] === 'string') {
            value = this.commandData.element.command[fieldName];
        }
        ClientLogger.log('CommandButtonComponentDetails', `getCommandField('${fieldName}'): ${value}`);
        return value;
    }
}
