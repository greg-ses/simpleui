import {Component, HostListener, Inject, OnInit} from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogActions } from '@angular/material/dialog';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';

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
        return value;
    }
}
