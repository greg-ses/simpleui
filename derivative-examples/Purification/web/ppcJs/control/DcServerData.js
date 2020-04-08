// ~/control/DcServerData
//array of these controls to a panel afterwards.

define(['dojo/_base/declare', 'dojo/_base/lang', 'dojo/dom', 'dojo/dom-construct', 'dojo/dom-class', 'dojo/dom-style', 'dojo/aspect', 'dojo/query',
        '../utilities/DataFormat', '../utilities/DateString', '../utilities/Page', '../bizLogic/generic/Watchdog', '../bizLogic/generic/FlashTimer',
        './_Control', 'dojo/text!./dcServerData/template/dcServerData.html'],
function (declare, lang, dom, construct, domClass, domStyle, aspect, query,
        DataFormat, DateString, Page, Watchdog, FlashTimer,
        _Control, template) {
    return declare([_Control],
    {
        // consts
        _naNPlaceHolder: '-',
        _floatPrecision: 1,

        // public dijit/class variables (set by dcServerData/dsdDto.Ctor)
        widgetsInTemplate: true,
        templateString: template,
        baseClass: 'dcServerDataControl',

        intervalMs: 0,
        showLabels: true,
        showTime: false,

        // private variables
        _watchdog: '',
        _flashTimer: '',

        // css class names, selectors, in-line styles
        _cssUpdatedText: 'dbcUpdatedText',
        _cssFaultText: 'dbcFaultText',
        _cssLeftAlign: 'dcDataLeftAlign',
        _cssCenterAlign: 'dcDataCenterAlign',
        _cssRightAlign: 'dcDataRightAlign',
        _cssLabelSelect: '.dcDataLabel',
        _cssDataItemSelect: '.dcDataItem',


        // public methods
        postCreate: function () {
            this.inherited(arguments);
            this._setLabels();

            if (this.showTime) {
                var timeout = 2 * this.intervalMs;
                this._watchdog = new Watchdog(timeout);
                aspect.after(this._watchdog, 'timeoutEvent', lang.hitch(this, this._onTimeout));
                this._flashTimer = new FlashTimer(dom.byId(this.timestampDiv));
            }
            else {
                construct.destroy(this.timestampDiv);
            }
        },

        update: function (/*dsdDto.Status*/status) {
            var strBattCurr = DataFormat.getFloatAsString(status.Batt_Current, this._floatPrecision, this._naNPlaceHolder);
            this.Batt_Current_Span.innerHTML = strBattCurr;

            var strBattVolts = DataFormat.getFloatAsString(status.Batt_Voltage, this._floatPrecision, this._naNPlaceHolder);
            this.Batt_Voltage_Span.innerHTML = strBattVolts;

            var strDCBusVolts = DataFormat.getFloatAsString(status.DCBus_Voltage, this._floatPrecision, this._naNPlaceHolder);
            this.DCBus_Voltage_Span.innerHTML = strDCBusVolts;

            var strDCBusCurr = DataFormat.getFloatAsString(status.Bus_Current, this._floatPrecision, this._naNPlaceHolder);
            this.DCBus_Current_Span.innerHTML = strDCBusCurr;

            var strAmpHours = DataFormat.getFloatAsString(status.Amp_Hours, this._floatPrecision, this._naNPlaceHolder);
            this.Amp_Hours_Span.innerHTML = strAmpHours;

            var strOVPSetpoint = DataFormat.getFloatAsString(status.OVP_Setpoint, this._floatPrecision, this._naNPlaceHolder);
            this.OVP_Setpoint_Span.innerHTML = strOVPSetpoint;

            this.OutSense_Span.innerHTML = status.DC_Mode.toString();

            this.DCStatus_Span.innerHTML = status.DCStatus.toString();

            this.DCFault_Span.innerHTML = status.DCFault_Status;
        },

        // private methods
        _setLabels: function () {
        	//console.log("_setLabels : starting for " + this.name);
            this.controlName.innerHTML = this.name;

            if (!this.showLabels) {
            	//console.log("_setLabels : We are in the not show labels loop!!");
            	
                domStyle.set(this.Batt_Current_Label, { display: 'none' });
                domStyle.set(this.Batt_Voltage_Label, { display: 'none' });
                domStyle.set(this.DCBus_Voltage_Label, { display: 'none' });
                domStyle.set(this.DCBus_Current_Label, { display: 'none' });
                domStyle.set(this.Amp_Hours_Label, { display: 'none' });
                domStyle.set(this.OVP_Setpoint_Label, { display: 'none' });
                domStyle.set(this.OutSense_Label, { display: 'none' });
                domStyle.set(this.DCStatus_Label, { display: 'none' });
                domStyle.set(this.DCFault_Label, { display: 'none' });

                domClass.replace(this.Batt_Current_Span, this._cssLeftAlign, this._cssRightAlign);
                domClass.replace(this.Batt_Voltage_Span, this._cssLeftAlign, this._cssRightAlign);
                domClass.replace(this.DCBus_Voltage_Span, this._cssLeftAlign, this._cssRightAlign);
                domClass.replace(this.DCBus_Current_Span, this._cssLeftAlign, this._cssRightAlign);
                domClass.replace(this.Amp_Hours_Span, this._cssLeftAlign, this._cssRightAlign);
                domClass.replace(this.OVP_Setpoint_Span, this._cssLeftAlign, this._cssRightAlign);
                domClass.replace(this.OutSense_Span, this._cssLeftAlign, this._cssRightAlign);
                domClass.replace(this.DCStatus_Span, this._cssLeftAlign, this._cssRightAlign);
                domClass.replace(this.DCFault_Span, this._cssLeftAlign, this._cssRightAlign);
              }
        },

        _updateTime: function (/*int, ms since epoch*/timestamp) {
            // display date as 'mm/dd/yyyy'
            var d = new Date(timestamp);
            //this.dateSpan.innerHTML = DateString.toDate(d);
            //this.timeSpan.innerHTML = d.toLocaleTimeString();

            this._flashTimer.flash();
        },

        _onTimeout: function () {
            this._flashTimer.setFault();
        }
    });
});


