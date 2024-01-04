import { LogLevel, Logger } from './server-logger';
import * as sha1 from './sha1';

/**
 * Created by jscarsdale on 6/14/2019.
 */

export class CommandJsonNormalizer {
    // @Input() _element: any;

    // @Input() _props: any;
    // @Input() _uiTab: any;
    // @Input() _disabled: boolean;
    // @Input() _container: string;

    _element = null;
    _svcURL = '';

    _popupDialogProps = {
        callbackSource: {},
        hidden: false,
        title: 'default title',
        text: 'default text',
        controls: [],
        buttons: ['OK', 'Cancel']
    };

    _controls: any = [];
    _action: any = 'simpleCommand';

    static fixNL(s: string) {
        return s.replace(/\(NL\)/g, '\n');
    }

    static underscoreToSpace(s: string) {
        return s.replace(/_/g, ' ');
    }

    static create_and_append_sha1sum(objToSum, sumsAccumulatorObj) {
        if (objToSum instanceof Object) {
            const sha1sum = sha1(JSON.stringify(objToSum));
            objToSum['sha1sum'] = sha1sum;

            if (sumsAccumulatorObj instanceof Object) {
                if (typeof sumsAccumulatorObj['sha1sums'] === 'string') {
                    sumsAccumulatorObj['sha1sums'] += ' ' + sha1sum;
                } else {
                    sumsAccumulatorObj['sha1sums'] = ' ' + sha1sum;
                }
            }
        }
    }


    constructor(elementIn) {
        this._element = elementIn;
    }

    getNormalCommandJSON(): any {
        if (this._element.command instanceof Object) {

            if (typeof this._element.command.label === 'string') {
                this._element.command.label = this._element.command.label.replace(/_/g, ' ');
            }

            if (    (this._element.command.controls instanceof Object)
                && !(this._element.command.controls instanceof Array) ) {


                this._element.command.controls = [this._element.command.controls];

                if (typeof this._element.command.controls.label === 'string') {
                    this._element.command.controls.label = this._element.command.controls.label.replace(/_/g, ' ');
                }
            }

            if (this._element.command instanceof Object) {
                if (this._element.command._input instanceof Object) {
                    if (typeof this._element.command.controls === 'undefined') {
                        this._element.command.controls = [];
                    }

                    if (this._element.command._input instanceof Array) {
                        for (const control of this._element.command._input) {
                            if (typeof control.label === 'string') {
                                control.label = control.label.replace(/_/g, ' ');
                            }
                            this._element.command.controls.push(control);
                        }
                    } else {
                        if (typeof this._element.command._input.label === 'string') {
                            this._element.command._input.label = this._element.command._input.label.replace(/_/g, ' ');
                        }
                        this._element.command.controls.push(this._element.command._input);
                    }
                    delete this._element.command._input;
                 } else {
                     // Pure "command" object - no "_input" children
                    CommandJsonNormalizer.create_and_append_sha1sum(this._element.command, this._element);
                }
            }


            if (this._element.command.controls instanceof Array) {
                for (const control of this._element.command.controls) {
                    control.id = control.u_id;
                    CommandJsonNormalizer.create_and_append_sha1sum(control, this._element);
                }
            }

            this.setAction();
            this.setClassNameAndId();
        }

        this._element['sha1sum'] = sha1(JSON.stringify(this._element));
        return this._element;
    }

    setClassNameAndId() {
        if (   this._element instanceof Object
            && this._element.command instanceof Object) {

            // Set 'class'
            let currClass = this._element.command.class || 'command';
            if (   typeof this._element.command._disabled === 'string'
                && this._element.command._disabled === 'true') {
                currClass = 'disabled';
            } /* else {
                    // TODO: Can we tell this outside the UI?
                    if (    (typeof this._popupDialog_L3 === 'object')
                         && (this._popupDialog_L3.getCommandInProgress() !== '')) {
                           currClass = 'inProgress';
                } */

            this._element.command['class'] = currClass;

            // Set 'id'
            if (   typeof this._element.command.u_id === 'string'
                && typeof this._element.command.id === 'undefined') {

                this._element.command['id'] = this._element.command.u_id;
            }
        }
    }

    private initCustomDialogProps() {
        // this._popupDialogProps.callbackSource = this;
        this._popupDialogProps.hidden = false;
        this._popupDialogProps.title = this.getAttr('label', 'name');
        this._popupDialogProps.text = this.getQuestionText();
        this._popupDialogProps.controls = this.getControls();
    }

    getControlRange(control) {
        let range = '';
        if (control.label && control.label !== 'text') {
            if (control.min && control.max) {
                range += '(' + control.min + ' .. ' + control.max + ')';
            } else if (control.min) {
                range += '(' + control.min + ' .. )';
            } else if (control.max) {
                range += '( .. ' + control.max + ')';
            } else {
                range = '';
            }
        }

        if ( (typeof control.units !== 'undefined') && (control.units !== '') ) {
            range += ' ' + control.units.toString();
        }

        return range;
    }

    setControlLabel(control, n) {
        const range = this.getControlRange(control);

        if (   (typeof control.label === 'undefined')
            || (control.label === '') ) {

            control.label = control.name || control.desc || 'Value ' + (n + 1);
            control.label += ' ' + range;
        } else {
            if (control.label.indexOf(range) === -1) {
                control.label += range;
            }
        }
    }

    normalizeControl(n) {
        const control = this._element.command.controls[n];

        // Normalize both '_type' and 'type' to 'type'
        if (   (typeof control.type === 'undefined')
            || (control.type === '') ) {

            if (typeof control._type === 'string') {
                control.type = control._type;
                delete control._type;
            } else {
                control.type = 'text';
            }
        }

        this.setControlLabel(control, n);

        const simpleDefaults = [
            {key: 'size', value: 20},
            {key: 'cols', value: 20},
            {key: 'rows', value: 1},
            {key: 'name', value: 'Value-' + (n + 1)}
        ];

        for (const pair of simpleDefaults) {
            if (   (typeof control[pair.key] === 'undefined')
                || (control[pair.key] === '') ) {

                control[pair.key] = pair.value;
            }
        }

        control['sha1sum'] = sha1(JSON.stringify(control));
    }


    getControls() {
        if (typeof this._element.command.controls === 'undefined') {
            // Convert any 'value' or '_input' sub-elements into controls, if we didn't already do so
            for (const childControlName of ['_input', 'value']) {
                if (typeof this._element.command[childControlName] === 'object') {
                    if (typeof this._element.command.controls === 'undefined') {
                        this._element.command.controls = [];
                    }
                    if (Array.isArray(this._element.command[childControlName])) {
                        for (let i = 0; i < this._element.command[childControlName].length; i++) {
                            this._element.command[childControlName][i]['sha1sum']
                                = sha1(JSON.stringify(this._element.command[childControlName][i]));
                            this._element.command.controls.push(this._element.command[childControlName][i]);
                        }
                    } else {
                        this._element.command[childControlName]['sha1sum']
                            = sha1(JSON.stringify(this._element.command[childControlName]));
                        this._element.command.controls.push(this._element.command[childControlName]);
                    }
                }
            }
        }

        if (typeof this._element.command.controls !== 'undefined') {
            this._controls = [];
            for (let n = 0; n < this._element.command.controls.length; n++) {
                this.normalizeControl(n);
                this._controls.push(this._element.command.controls[n]);
            }
        } else {
            if (typeof this._element.command.type !== 'undefined') {
                // Still no controls found -- create an 'implicit' text input
                this.insertImplicitControl();
            }
        }
        return this._controls;
    }

    insertImplicitControl() {
        // Handle single 'implicit' control for this type
        // E.g.: <command desc='Enter a log message' max='256' label='User Log Text' name='User_Log_Text' type='text' u_id='2021'/>

        const command = this._element.command;

        if (typeof command === 'undefined') {
            return;
        }

        const implicitCommand = {
            'type': command.type,
            'label': command.type,
            'size': 20,
            'cols': 20,
            'rows': 1,
            'value': '',
            'name': 'Value-1'
        };

        if (command.type === 'text') {
            // Determine the width of the input box
            if (typeof command.size === 'undefined') {
                command.size = command.max;
            }
            implicitCommand['size'] = command.size;
            implicitCommand['cols'] = Math.min(80, command.size);
            implicitCommand['rows'] = Math.max(1, Math.ceil(command.size / 80));

        } else {
            if (typeof command.min === 'string') {
                implicitCommand['min'] = command.min;
            }

            if (typeof command.max === 'string') {
                implicitCommand['max'] = command.max;
            }

            if (typeof command.units === 'string') {
                implicitCommand['units'] = command.units;
            }
        }
        implicitCommand['sha1sum'] = sha1(JSON.stringify(implicitCommand));
        this._controls.push(implicitCommand);
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
            for (let path of paths) {
                if (   path && typeof path === 'object'
                    && path[attr] && typeof path[attr] === 'string') {
                    value = path[attr];
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
            Logger.log(LogLevel.ERROR, `error in findAttr(${attr}): ${e}`);
        }

        return value;
    }

    getAttr(attr: string, altAttr?: string): string {
        let s = this.findAttr([this._element.command, this._element], attr, '', CommandJsonNormalizer.underscoreToSpace);
        if (s === '') {
            s = this.findAttr([this._element.command, this._element], altAttr, '', CommandJsonNormalizer.underscoreToSpace);
        }
        if (s === '') {
            s = 'unknown_' + attr;
        }

        return s.trim();
    }

    setAction() {
        this._element._action = 'simpleCommand'; // default button type
        if ((typeof this._element.command.disabled !== 'undefined') &&
            this._element.command.disabled === 'true') {
            this._element._action = 'disabled';
        } else {

            this.getControls();

            if (typeof this._element.command.controls !== 'undefined') {
                for (let c of this._element.command.controls) {
                    switch (c.type) {
                        case 'float':
                            this._element._action = 'floatInputDialog';
                            this.initCustomDialogProps();
                            break;
                        case 'int':
                            this._element._action = 'intInputDialog';
                            this.initCustomDialogProps();
                            break;
                        case 'bool':
                            this._element._action = 'boolInputDialog';
                            this.initCustomDialogProps();
                            break;
                        case 'text':
                            this._element._action = 'textInputDialog';
                            this.initCustomDialogProps();
                            break;
                        default:
                            break;
                    }
                }
            }
            if (this._element.command.confirm === 'true') {
                this._element._action = 'confirmDialog';
                this.initCustomDialogProps();
            }
            if (this._element.command.type === 'text') {
                this._element._action = 'textInputDialog';
                this.initCustomDialogProps();
            }
        }
    }
}
