// ~/control/DcServerData
//array of these controls to a panel afterwards.

define(['dojo/_base/declare', 'dojo/_base/lang', 'dojo/dom', 'dojo/dom-construct', 'dojo/dom-class', 'dojo/dom-style', 'dojo/aspect', 'dojo/query',
        '../utilities/DataFormat', '../utilities/DateString', '../utilities/Page', '../bizLogic/generic/Watchdog', '../bizLogic/generic/FlashTimer',
        './_Control', 'dojo/text!./dcServerData/template/dcServerDetail.html'],
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
        baseClass: 'dcDetailControl',

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
        _dto: '',

        // public methods
        postCreate: function () {
        	//this._dto = dto;
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

        update: function (/*dsdDto.Status*/status, /*device ID*/devID) {

            this.DCSFVer_Span.innerHTML = status.SF_Version.toString();

            this.DCFaultInfo_Span.innerHTML = status.FaultInfo.toString();
            
            this.DCStatusInfo_Span.innerHTML = status.StatusInfo.toString();

            this.OutSenseInfo_Span.innerHTML = status.ModeInfo.toString();
            
            this.DetailName_Span.innerHTML = "DCDC "+ devID + " Detail";

        },

        // private methods
        _setLabels: function () {
        	//console.log("_setLabels : starting for " + this.name);
            //this.controlName.innerHTML = this.name;

            if (!this.showLabels) {
            	//console.log("_setLabels : We are in the not show labels loop!!");
            	
                domStyle.set(this.OutSense_Label, { display: 'none' });

                domClass.replace(this.DCSFVer_Span, this._cssLeftAlign, this._cssRightAlign);

                domClass.replace(this.DCFaultInfo_Span, this._cssLeftAlign, this._cssRightAlign);

                domClass.replace(this.DCStatusInfo_Span, this._cssLeftAlign, this._cssRightAlign);

                domClass.replace(this.OutSenseInfo_Span, this._cssLeftAlign, this._cssRightAlign);

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


