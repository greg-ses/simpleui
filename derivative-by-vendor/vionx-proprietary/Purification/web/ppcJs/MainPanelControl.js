// main control widget (Control) for a panel
// dynamically creates views instead of setting visible for security reasons

dojo.provide('ppcJs.MainPanelControl');
dojo.provide('ppcJs.MpcDto');

dojo.require('ppcJs._Control');
dojo.require('ppcJs.utilities.AccessControl');
dojo.require('ppcJs.DataFormat');
dojo.require('ppcJs.utilities.Page');
dojo.require('dojox.collections.Dictionary');
dojo.require('dojox.layout.TableContainer');
dojo.require('ppcJs.widget.iPhoneButton');
dojo.require('dijit.form.Select');
dojo.require('dijit.form.NumberSpinner');
dojo.require("dijit.form.Button");

dojo.declare('ppcJs.MainPanelControl', [ppcJs._Control],
{
    // ajax request command constants
    _setEStopOnCmd: { SET: 'ESTOP_ON' },
    _setEStopOffCmd: { SET: 'ESTOP_OFF' },
    _setModeCmd: { SET: 'MODE' },
    _setAutoCmd: { SET: 'AUTO_CONTROL' },
    _setManualCmd: { SET: 'MANUAL_CONTROL' },
    _setLockCmd: { SET: 'LOCK' },
    _setUnlockCmd: { SET: 'UNLOCK' },

    // dijit variables
    name: 'MainPanelControl',
    widgetsInTemplate: true,
    templatePath: dojo.moduleUrl('ppcJs', 'templates/MainPanelControl.html'),

    // css class names/in-line code
    _cssViewTable: 'basePanelTable mpcViewDiv',
    _cssCell: 'mpcTableCell',
    _cssInfo: 'basePanelInfoBox',
    _cssControlTable: 'mpcControlTable',
    _cssModeSelect: 'width: 100px',     // selects require in-line style
    _cssRateSpinner: 'width: 100px',    // spinners require in-line style
    _cssEditedText: 'basePanelEditedText',
    _cssResetText: 'basePanelResetText',
    _cssEStopOn: 'eStopOnIcon',
    _cssEStopOff: 'eStopOffIcon',

    // class variables configured on construction
    modeMap: '',        // dojox.collections.Dictionary (value, description)
    isMaster: false,    // true = lock/unlock control over slaves

    // private class variables
    _isControl: false,
    _pauseUpdates: false,
    _modeLabels: '',
    _handlerList: '',   // event handlers

    // view
    _estopVal: '',
    _autoVal: '',
    _modeVal: '',
    _rateVal: '',

    // control
    _estopToggle: '',
    _autoSlider: '',
    _lockSlider: '',
    _modeSelect: '',
    _rateSpinner: '',
    _setButton: '',

    // for reverting state of the control on failed XHR request
    _lastDto: '',

    // public methods
    // usage: sut = new ppcJs.MainPanelControl({ authTasks: userAuths, modeMap: modeMap... });
    constructor: function () {
        this._handlerList = new Array();
    },

    postCreate: function () {
        // isMaster indicates this is system level panel control
        var controlAuthLevel = (this.isMaster) ? ppcJs.utilities.AccessControl.Task.SystemControl : ppcJs.utilities.AccessControl.Task.ComponentControl;
        this._isControl = ppcJs.utilities.AccessControl.isAuthorized(controlAuthLevel, this.authTasks);

        this._mapModeLabels();

        if (this._isControl) {
            this._populateForControlAuth();
            this._clearEditState();
        }
        else {
            this._populateForViewAuth();
        }
    },

    update: function (/*MpcDto.Update*/dto) {
        if (this._isControl) {
            if (!this._pauseUpdates) {
                this._updateControls(dto);
                this._lastDto = dto;
            }
        }
        else {
            this._estopVal.innerHTML = ppcJs.DataFormat.toBool(dto.estop.toString());
            this._autoVal.innerHTML = ppcJs.DataFormat.toBool(dto.auto.toString());
            this._modeVal.innerHTML = this.modeMap.item(dto.mode.toString());
            this._rateVal.innerHTML = dto.rate.toString();
        }

    },

    // private methods
    _mapModeLabels: function () {
        this._modeLabels = new Array();
        var iterator = this.modeMap.getIterator();

        while (!iterator.atEnd()) {
            var mapEntry = iterator.get();
            this._modeLabels.push({ value: mapEntry.key.toString(), label: mapEntry.value });
        }
    },

    _updateControls: function (/*MpcDto.Update*/dto) {
        this._updateEstop(dto.estop);
        this._autoSlider.setValue(dto.auto);
        this._modeSelect.set('value', dto.mode.toString(), false);
        this._rateSpinner.set('value', dto.rate);

        if (this.isMaster) {
            this._lockSlider.setValue(dto.lock);
        }
    },

    _updateEstop: function (/*bool*/estop) {
        var eStopVal = this._estopToggle.get('checked');
        if (estop != eStopVal) {
            this._estopToggle.set('checked', estop);
            this._setEstopIcon(estop);
        }
    },

    _setEstopIcon: function (/*bool*/estop) {
        if (estop) {
            this._estopToggle.set('iconClass', this._cssEStopOn);
        }
        else {
            this._estopToggle.set('iconClass', this._cssEStopOff);
        }
    },

    _populateForViewAuth: function () {
        // create table of spans for label and text for mode, ramp rate
        dojo.addClass(this.controlDiv, this._cssViewTable);

        var row1 = this.puB.createRow();
        this._createCell('EStop', row1, false);
        this._estopVal = this._createCell('-', row1, true);
        dojo.place(row1, this.controlDiv);

        var row2 = this.puB.createRow();
        this._createCell('Auto', row2, false);
        this._autoVal = this._createCell('-', row2, true);
        dojo.place(row2, this.controlDiv);

        var row3 = this.puB.createRow();
        this._createCell('Mode', row3, false);
        this._modeVal = this._createCell('-', row3, true);
        dojo.place(row3, this.controlDiv);

        var row4 = this.puB.createRow();
        this._createCell('Ramp Rate (kW)', row4, false);
        this._rateVal = this._createCell('0', row4, true);
        dojo.place(row4, this.controlDiv);
    },

    _createCell: function (/*string*/content, /*node*/parentNode, /*bool*/isValue) {
        var cell = this.puB.createCell(content);
        dojo.addClass(cell, this._cssCell);

        if (isValue) {
            dojo.addClass(cell, this._cssInfo);
        }

        dojo.place(cell, parentNode);
        return cell;
    },

    _populateForControlAuth: function () {
        // create dojo table, add controls
        var table = new dojox.layout.TableContainer({
            cols: 1,
            customClass: this._cssControlTable,
            labelWidth: '100'
        }, this.controlDiv);

        this._addEStopCtrl(table);
        this._addAutoCtrl(table);
        if (this.isMaster) {
            this._addLockCtrl(table);
        }
        this._addModeCtrl(table);
        this._addRateCtrl(table);

        table.startup();

        this._addSetButton();
    },

    _addEStopCtrl: function (/*table*/table) {
        this._estopToggle = new dijit.form.ToggleButton({
            iconClass: this._cssEStopOff,
            showLabel: false,
            checked: false,
            title: 'EStop'
        });
        table.addChild(this._estopToggle);
        this._handlerList.push(this.connect(this._estopToggle, 'onClick', 'onEStopClick'));
    },

    _addAutoCtrl: function (/*table*/table) {
        this._autoSlider = new ppcJs.widget.iPhoneButton({
            onText: 'AUTO',
            offText: 'MAN',
            width: 100,
            animateSpeed: 200,
            startOn: true,
            title: 'Control'
        });
        table.addChild(this._autoSlider);
        this._handlerList.push(this.connect(this._autoSlider, 'onChange', 'onAutoChange'));
    },

    _addLockCtrl: function (/*table*/table) {
        this._lockSlider = new ppcJs.widget.iPhoneButton({
            onText: 'LOCK',
            offText: 'UNLK',
            width: 100,
            animateSpeed: 200,
            startOn: true,
            title: 'Subsystem'
        });
        table.addChild(this._lockSlider);
        this._handlerList.push(this.connect(this._lockSlider, 'onChange', 'onLockChange'));
    },

    _addModeCtrl: function (/*table*/table) {
        this._modeSelect = new dijit.form.Select({
            options: dojo.clone(this._modeLabels),
            style: this._cssModeSelect,
            title: 'Mode'
        });
        table.addChild(this._modeSelect);
        this._handlerList.push(this.connect(this._modeSelect, 'onChange', 'onModeSelectChange'));
    },

    _addRateCtrl: function (/*table*/table) {
        this._rateSpinner = new dijit.form.NumberSpinner({
            constraints: { min: -100, max: 100, places: 0 },
            value: 0,
            smalldelta: 1,
            style: this._cssRateSpinner,
            title: 'Ramp Rate (kW)'
        });
        table.addChild(this._rateSpinner);
        this._handlerList.push(this.connect(this._rateSpinner, 'onChange', 'onRateChange'));
    },

    _addSetButton: function () {
        this._setButton = new dijit.form.Button({
            label: 'SET'
        });
        this._handlerList.push(this.connect(this._setButton, 'onClick', 'handleSetClick'));
        dojo.place(this._setButton.domNode, this.submitDiv);
    },

    // assemble arg object, wire callbacks for dojo.xhrGet call
    _assembleXhrArgs: function (queryObject) {
        dojo.mixin(queryObject, { CGI: this.urlInfo[1], ID: this.queryId });
        var xhrArgs = { url: this.urlInfo[0], handleAs: 'xml', content: queryObject };
        xhrArgs.load = dojo.hitch(this, this.handleXhrLoad);
        xhrArgs.error = dojo.hitch(this, this.handleXhrError);

        return xhrArgs;
    },

    _setEditState: function () {
        var modeSelected = this._modeSelect.get('value');
        var lastMode = this._lastDto.mode.toString();
        var rate = this._rateSpinner.get('value');
        var lastRate = this._lastDto.rate;

        if ((modeSelected !== lastMode) || (rate !== lastRate)) {
            this._pauseUpdates = true;
            dojo.replaceClass(this._modeSelect.domNode, this._cssEditedText, this._cssResetText);
            dojo.replaceClass(this._rateSpinner.domNode, this._cssEditedText, this._cssResetText);
            ppcJs.utilities.Page.showDijit(this._setButton);
        }
        else {
            this._clearEditState();
        }
    },

    _clearEditState: function () {
        this._pauseUpdates = false;
        dojo.replaceClass(this._modeSelect.domNode, this._cssResetText, this._cssEditedText);
        dojo.replaceClass(this._rateSpinner.domNode, this._cssResetText, this._cssEditedText);
        ppcJs.utilities.Page.hideDijit(this._setButton);
    },


    // callbacks

    handleSetClick: function (evt) {
        var modeSelected = this._modeSelect.get('value');
        var rate = this._rateSpinner.get('value');
        var queryObject = { MODE: modeSelected, RATE: rate };
        dojo.mixin(queryObject, this._setModeCmd);
        dojo.xhrGet(this._assembleXhrArgs(queryObject));

        this._clearEditState();
    },

    onEStopClick: function () {
        var eStopVal = this._estopToggle.get('checked');
        this._setEstopIcon(eStopVal);

        var queryObject = eStopVal ? this._setEStopOnCmd : this._setEStopOffCmd;
        dojo.xhrGet(this._assembleXhrArgs(queryObject));
    },

    onAutoChange: function () {
        var autoVal = this._autoSlider.get('value');
        var queryObject = autoVal ? this._setAutoCmd : this._setManualCmd;
        dojo.xhrGet(this._assembleXhrArgs(queryObject));
    },

    onLockChange: function () {
        var lockVal = this._lockSlider.get('value');
        var queryObject = lockVal ? this._setLockCmd : this._setUnlockCmd;
        dojo.xhrGet(this._assembleXhrArgs(queryObject));
    },

    onModeSelectChange: function () {
        this._setEditState();
    },

    onRateChange: function () {
        this._setEditState();
    },

    // 2xx ajax response handler
    handleXhrLoad: function (response, ioArgs) {
    },

    // 4xx ajax response handler
    handleXhrError: function (response, ioArgs) {
        if (this._isControl) {
            this._updateControls(this._lastDto);    // reset values
        }
        console.log(this.name + '[id=' + this.queryId + ']: Request to server failed: no action taken', response, ioArgs);
        // TODO: alert user
    }
});

// MainPanelControl data transfer objects
ppcJs.MpcDto = {
    // constructor DTO
    Ctor: function (urlInfo, authTasks, queryId, modeMap, isMaster) {
        // "derived" from _ControlDto.Ctor
        dojo.mixin(this, new ppcJs._ControlDto.Ctor(urlInfo, authTasks, queryId));

        this.modeMap = modeMap;
        this.isMaster = isMaster;
    },

    // update DTO
    Update: function (/*int*/mode, /*int*/rate, /*bool*/estop, /*bool*/auto, /*bool*/lock) {
        this.mode = mode;
        this.rate = rate;
        this.estop = estop;
        this.auto = auto;
        this.lock = lock;
    }
};
