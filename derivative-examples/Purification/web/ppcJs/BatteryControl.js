// Battery Control, derived from BaseControl

dojo.provide('ppcJs.BatteryControl');
dojo.provide('ppcJs.BatteryDTO');

dojo.require('ppcJs.BaseControl');
dojo.require('ppcJs.DataFormat');
dojo.require('ppcJs.Enum');

dojo.declare('ppcJs.BatteryControl', ppcJs.BaseControl,
{
    // constants
    //_maxStringLength: 10,

    // indicators, data displays
    _socIconCell: '',

    _totCurrentCell: '',
    _avgCurrentCell: '',
    _totAmpHrCell: '',
    _avgAmpHrCell: '',
    _powerCell: '',
    _avgVoltCell: '',

    // dijit variables
    name: 'Batteries',

    // css class names/in-line code
    _cssContainerNode: 'batteryControl',
    _cssBattOk: 'basePanelBattOk',
    _cssBattLow: 'basePanelBattLow',
    _cssBattDischarged: 'basePanelBattDischarged',


    // public methods
    constructor: function () {
    },

    postCreate: function () {
        this.inherited(arguments);
        this._socIconCell = this._addIndicatorRow('SOC', this._cssBattDischarged);

        this._totCurrentCell = this._addDataRow('Tot Current (A)', '0');
        this._avgCurrentCell = this._addDataRow('Avg Current (A)', '0');
        this._totAmpHrCell = this._addDataRow('Tot AHr', '0');
        this._avgAmpHrCell = this._addDataRow('Avg AHr', '0');
        this._powerCell = this._addDataRow('Tot Power (kW)', '0');
        this._avgVoltCell = this._addDataRow('Avg Volt', '0');

        dojo.addClass(this.containerNode, this._cssContainerNode);
    },


    // override methods
    update: function (/*BatteryDTO*/dto) {
        this._updateBattChargeIcon(this._socIconCell, dto.soc);
        this._setData(this._totCurrentCell, dto.totCurrent);
        this._setData(this._avgCurrentCell, dto.avgCurrent);
        this._setData(this._totAmpHrCell, dto.totAmpHr);
        this._setData(this._avgAmpHrCell, dto.avgAmpHr);
        this._setData(this._powerCell, dto.power);
        this._setData(this._avgVoltCell, dto.avgVolt);
    },


    // private methods
    _updateBattChargeIcon: function (/*ppcJs.Enum.Soc*/soc) {
        switch (soc) {
            case (ppcJs.Enum.Soc.Discharged):
                dojo.replaceClass(this._socIconCell, this._cssBattDischarged, [this._cssBattLow, this._cssBattOk]);
                break;

            case (ppcJs.Enum.Soc.Low):
                dojo.replaceClass(this._socIconCell, this._cssBattLow, [this._cssBattDischarged, this._cssBattOk]);
                break;

            case (ppcJs.Enum.Soc.Normal):
                dojo.replaceClass(this._socIconCell, this._cssBattOk, [this._cssBattDischarged, this._cssBattLow]);
                break;

            default:
                break;
        }
    }
});

// data transfer object to update BatteryControl
dojo.declare('ppcJs.BatteryDTO', null,
{
    soc: 0,             // ppcJs.Enum.Soc
    totCurrent: 0,
    avgCurrent: 0,
    totAmpHr: 0,
    avgAmpHr: 0,
    power: 0,
    avgVolt: 0,

    constructor: function (soc, totCurrent, avgCurrent, totAmpHr, avgAmpHr, power, avgVolt) {
        this.soc = soc;
        this.totCurrent = totCurrent;
        this.avgCurrent = avgCurrent;
        this.totAmpHr = totAmpHr;
        this.avgAmpHr = avgAmpHr;
        this.power = power;
        this.avgVolt = avgVolt;
    }
});